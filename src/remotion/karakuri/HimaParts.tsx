// 「人は、なぜ暇をつぶすのか」: 全巻で共有する「説明の装置」と、何度も出てくる舞台。
// 構成案: docs/hima-kousei.md「装置: 暇のものさし」が正本。
//
// ★ここにある物は、別々の絵師が別々の章で描く「同じ物」。毎回この部品を使い、描き直さない (絵のブレ禁止)。
// ★props の形 (シグネチャ) を勝手に変えない。並走中の全員がこの形で呼ぶ。
// ★部屋の外 (廊下・窓の外)・人の配置・カメラはシーン側で作る。
//
// 暇のものさしの目盛りは4つ。色で見分ける (全編で固定):
//   日   (hi)    = 夕焼けの橙  … 7日に1度の休み (第1章末で刻まれる)
//   時間 (jikan) = 山吹色      … 仕事のあとの夜 (第4章末)
//   分   (fun)   = 青緑        … 乗り物と待ち時間 (第5章末)
//   秒   (byo)   = 藍          … ポケットの道具 (第6章末)

import React from "react";
import { KRP, KARAKURI_FONT, seg, easeOut, clamp01, pop } from "./KarakuriScenes";

const FONT = KARAKURI_FONT;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 装置専用の色 (シーン側でも使ってよい)
export const HP = {
  // ものさし (古い木の定規 + 真鍮の金具)
  wood: "#EBD3A0",
  woodMid: "#D9B77A",
  woodDark: "#A9804A",
  grain: "#CDA867",
  brass: "#D9B23C",
  brassDark: "#A8862A",
  // 4つの目盛りの色
  hi: "#E2804F",
  hiDark: "#B45E33",
  jikan: "#E6B83E",
  jikanDark: "#B78E22",
  fun: "#4FA38D",
  funDark: "#347A68",
  byo: "#4E74BE",
  byoDark: "#34548F",
  // 「あなた」(序・第6章・結びに出る現代の人) の服。全編でこの色にそろえる
  you: "#E58A4C",
  youDark: "#B8652F",
  // 実験室
  labWall: "#EEF0EC",
  labWallShade: "#D9DDD6",
  labFloor: "#C9CCC2",
  labFloorLine: "#B3B7AC",
  spark: "#FFE14D",
  // スマホの画面の光
  screen: "#BFE3FF",
  screenCore: "#EAF6FF",
  // カレンダーの休みの色
  rest: "#E86A5A",
  restSoft: "#F6C6BD",
} as const;

export type MeKey = "hi" | "jikan" | "fun" | "byo";
export const ME_KEYS: MeKey[] = ["hi", "jikan", "fun", "byo"];
export const ME_NAMES: Record<MeKey, string> = { hi: "日", jikan: "時間", fun: "分", byo: "秒" };
export const ME_COLOR: Record<MeKey, [string, string]> = {
  hi: [HP.hi, HP.hiDark],
  jikan: [HP.jikan, HP.jikanDark],
  fun: [HP.fun, HP.funDark],
  byo: [HP.byo, HP.byoDark],
};

/* ===================================================================
 * monoSlot — ものさしの i 番目の区画 (0=日 1=時間 2=分 3=秒) の「上の辺の真ん中」の座標。
 *   その目盛りの上に道具や出来事の小さな絵を乗せるときに使う。x,y,s は Monosashi に渡したのと同じ値
 * =================================================================== */
export const monoSlot = (i: number, x: number, y: number, s = 1): [number, number] =>
  [x + (-525 + i * 350) * s, y - 75 * s];

/* ===================================================================
 * Monosashi — 暇のものさし (この動画の装置)
 *   x,y: ものさしの中心。s=1 で幅1400px・高さ150px
 *   lit: 刻まれた目盛りの数 0〜4。小数で「いま刻んでいる途中」(例 1.6 = 日は刻み済み・時間を6割まで刻んだ)
 *   f:   まばたき程度の小さな動き (刻んでいる所の火花・金具の光) に使う
 *   focus: 強調したい区画 (0〜3)。その区画だけ明るく光らせる。省略で光らせない
 *   labels: 区画の下に「日・時間・分・秒」の木札を出すか (既定 true)。まだ刻まれていない区画は「?」の札
 *   tilt:  ものさし全体の傾き (度)
 * =================================================================== */
export const Monosashi: React.FC<{
  x: number; y: number; s?: number; lit: number; f: number;
  focus?: number; labels?: boolean; tilt?: number;
}> = ({ x, y, s = 1, lit, f, focus, labels = true, tilt = 0 }) => {
  const L = -700, T = -75, Wd = 1400, Hd = 150;
  // 区画ごとの目盛りの本数 (細かくなっていく)
  const TICKS = [2, 6, 15, 40];
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      {/* 影 */}
      <rect x={L + 14} y={T + 18} width={Wd} height={Hd} rx={22} fill={KRP.ink} opacity={0.22} />
      {/* 本体 (木) */}
      <rect x={L} y={T} width={Wd} height={Hd} rx={22} fill={HP.wood} stroke={KRP.ink} strokeWidth={8} />
      {/* 木目 */}
      <g stroke={HP.grain} strokeWidth={3} fill="none" opacity={0.7}>
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M ${L + 30} ${T + 34 + k * 28} q 340 ${k % 2 ? 8 : -8} 680 0 q 340 ${k % 2 ? -8 : 8} 660 0`} />
        ))}
      </g>
      {/* 4つの区画 */}
      {ME_KEYS.map((key, i) => {
        const sx = L + i * 350;
        const p = clamp01(lit - i); // 0=まだ / 0〜1=刻んでいる途中 / 1=刻み済み
        const [col, colDark] = ME_COLOR[key];
        const isFocus = focus === i;
        const n = TICKS[i];
        return (
          <g key={key}>
            {/* 区画の色の帯 (上の縁)。刻んだ分だけ左から塗られる */}
            <rect x={sx + 10} y={T + 10} width={330} height={26} rx={8} fill={HP.woodMid} opacity={0.5} />
            {p > 0 && <rect x={sx + 10} y={T + 10} width={330 * p} height={26} rx={8} fill={col} stroke={colDark} strokeWidth={3} />}
            {/* 強調の光 */}
            {isFocus && p > 0 && (
              <rect x={sx + 4} y={T + 4} width={342} height={Hd - 8} rx={16} fill={HP.spark}
                opacity={0.22 + 0.1 * Math.sin(f / 5)} />
            )}
            {/* 目盛り。まだの区画は薄い点線、刻んだ分だけ墨の線 */}
            {Array.from({ length: n + 1 }, (_, k) => {
              const tx = sx + 20 + (310 * k) / n;
              const big = k === 0 || k === n || (n >= 6 && k % (n === 6 ? 3 : n === 15 ? 5 : 10) === 0);
              const len = big ? 70 : n >= 40 ? 30 : 44;
              const done = p >= (k + 0.5) / (n + 1);
              return (
                <line key={k} x1={tx} y1={T + 40} x2={tx} y2={T + 40 + len}
                  stroke={done ? KRP.ink : HP.woodDark} strokeWidth={done ? (big ? 6 : n >= 40 ? 2.5 : 4) : 2}
                  strokeDasharray={done ? undefined : "4 6"} opacity={done ? 1 : 0.5} strokeLinecap="round" />
              );
            })}
            {/* 刻んでいる所: のみの刃先と火花 */}
            {p > 0 && p < 1 && (
              <g transform={`translate(${sx + 20 + 310 * p} ${T + 44})`}>
                <path d="M -6 -70 L 6 -70 L 4 -8 L 0 0 L -4 -8 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
                <rect x={-12} y={-122} width={24} height={56} rx={6} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
                {[0, 1, 2, 3].map((j) => {
                  const a = (j * 80 + f * 37) % 360;
                  const r = 14 + ((f * 3 + j * 7) % 12);
                  return <circle key={j} cx={Math.cos((a * Math.PI) / 180) * r} cy={-Math.abs(Math.sin((a * Math.PI) / 180)) * r}
                    r={3.5} fill={HP.spark} stroke={KRP.ink} strokeWidth={1.5} />;
                })}
              </g>
            )}
            {/* 区画の仕切り (真鍮の鋲) */}
            {i > 0 && (
              <g>
                <line x1={sx} y1={T + 8} x2={sx} y2={T + Hd - 8} stroke={HP.woodDark} strokeWidth={4} />
                <circle cx={sx} cy={T + Hd - 22} r={9} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
              </g>
            )}
            {/* 下の木札 */}
            {labels && (
              <g transform={`translate(${sx + 175} ${T + Hd + 50})`}>
                <rect x={-78} y={-34} width={156} height={68} rx={12}
                  fill={p >= 1 ? col : KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={p > 0 ? 1 : 0.6} />
                <text y={15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={key === "jikan" ? 38 : 44}
                  fill={p >= 1 ? KRP.white : KRP.ink} opacity={p > 0 ? 1 : 0.55}>
                  {p > 0 ? ME_NAMES[key] : "?"}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {/* 両端の真鍮の金具 */}
      {[L, L + Wd].map((ex, k) => (
        <g key={k}>
          <rect x={ex - (k ? 26 : 0)} y={T - 4} width={26} height={Hd + 8} rx={6} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={ex + (k ? -13 : 13)} cy={T + 30} r={5} fill={HP.brassDark} />
          <circle cx={ex + (k ? -13 : 13)} cy={T + Hd - 30} r={5} fill={HP.brassDark} />
          <line x1={ex + (k ? -20 : 6)} y1={T + 8} x2={ex + (k ? -20 : 6)} y2={T + Hd - 8} stroke={KRP.white}
            strokeWidth={3} opacity={0.35 + 0.25 * Math.sin(f / 9 + k)} />
        </g>
      ))}
    </g>
  );
};

/* ===================================================================
 * ShockRoom — 2014年の「何もない部屋」の実験室 (序 #3〜#10 と 第7章 #166〜#174 で同じ部屋を使う)
 *   部屋そのもの (壁・床・幅木・ドア・壁時計・机・椅子・電気の箱) を画面いっぱいに描く。人はシーン側で Person を置く
 *   f:      壁時計の秒針と、箱のランプの点滅
 *   minutes: 壁時計の「15分」の赤い扇形がどこまで進んだか (0〜15)
 *   press:  ボタンが押された瞬間の光 (0→1→0 になるようにシーン側で渡す)。0 なら光らない
 *   lamp:   箱の上のランプ (true で緑に点灯)
 *   empty:  true で机と箱を出さない (「スマホも本もない」の空っぽの部屋を見せるとき)
 *
 *   部屋の中の決まった位置 (シーン側で人や物を置くときに使う):
 *     椅子の座面の中心 = (720, 640)。Person を座らせるなら pose="sit"・s=1.15 で足元 (720, 707) (座面の高さ = y − 58×s)。ボタンに手を伸ばすときは、机の左手前 (x≈900) に立たせて腕だけ足す
 *     机の天板 = x 860〜1260, y 600。電気の箱のボタンの中心 = (1060, 560)
 *     壁時計の中心 = (1500, 260)。ドア = x 140〜400
 * =================================================================== */
export const ShockRoom: React.FC<{
  f: number; minutes?: number; press?: number; lamp?: boolean; empty?: boolean;
}> = ({ f, minutes = 0, press = 0, lamp = true, empty = false }) => {
  // 秒針は本物の速さ (1秒=30コマで1目盛り6度、カチッと進む)。2026-11-26 作者「秒針をちゃんとしたスピードに」
  const sec = (Math.floor(f / 30) * 6 + 90) % 360;
  const m = clamp01(minutes / 15);
  const ex = 1500 + Math.sin((m * 2 - 0.5) * Math.PI) * 0 ; void ex;
  // 扇形 (12時から時計回りに 15分 = 90度ぶん、の割合で塗る)
  const ang = (m * 90 * Math.PI) / 180;
  const R = 92;
  const arc = `M 0 0 L 0 ${-R} A ${R} ${R} 0 0 1 ${Math.sin(ang) * R} ${-Math.cos(ang) * R} Z`;
  return (
    <g>
      {/* 壁 */}
      <rect x={-40} y={-40} width={2000} height={760} fill={HP.labWall} />
      <rect x={-40} y={600} width={2000} height={120} fill={HP.labWallShade} opacity={0.6} />
      {/* 壁のパネルの継ぎ目 */}
      <g stroke={HP.labWallShade} strokeWidth={4}>
        {[480, 960, 1440].map((px) => <line key={px} x1={px} y1={-40} x2={px} y2={700} />)}
      </g>
      {/* 天井の蛍光灯の光 */}
      <rect x={720} y={-40} width={480} height={30} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <polygon points="720,-10 1200,-10 1420,520 500,520" fill={KRP.white} opacity={0.18} />
      {/* 床 */}
      <rect x={-40} y={700} width={2000} height={420} fill={HP.labFloor} />
      <g stroke={HP.labFloorLine} strokeWidth={4}>
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40 + i * 250} y1={700} x2={-300 + i * 320} y2={1120} />)}
        <line x1={-40} y1={860} x2={1960} y2={860} />
      </g>
      {/* 幅木 */}
      <rect x={-40} y={688} width={2000} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* ドア (左。閉まっている) */}
      <g>
        <rect x={140} y={150} width={260} height={540} fill="#D8D2C2" stroke={KRP.ink} strokeWidth={7} />
        <rect x={176} y={190} width={188} height={200} rx={6} fill="none" stroke={HP.labFloorLine} strokeWidth={5} />
        <rect x={176} y={420} width={188} height={230} rx={6} fill="none" stroke={HP.labFloorLine} strokeWidth={5} />
        <circle cx={366} cy={430} r={13} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 壁時計 (15分の扇形つき) */}
      <g transform="translate(1500 260)">
        <circle r={118} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
        {m > 0 && <path d={arc} fill={KRP.red} opacity={0.32} />}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={Math.sin(a) * 96} y1={-Math.cos(a) * 96} x2={Math.sin(a) * (i % 3 ? 104 : 86)}
            y2={-Math.cos(a) * (i % 3 ? 104 : 86)} stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 7} strokeLinecap="round" />;
        })}
        {/* 長針 (分) と短針 */}
        <line x1={0} y1={0} x2={Math.sin(ang) * 82} y2={-Math.cos(ang) * 82} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" transform="rotate(-60)" />
        {/* 秒針 */}
        <line x1={0} y1={14} x2={0} y2={-96} stroke={KRP.red} strokeWidth={3.5} transform={`rotate(${sec})`} />
        <circle r={9} fill={KRP.ink} />
      </g>
      {/* 椅子 (座面の中心 720,640) */}
      <g>
        <rect x={610} y={420} width={36} height={240} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={580} y={420} width={110} height={160} rx={18} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={600} y={620} width={250} height={42} rx={14} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
        {[620, 830].map((lx) => <line key={lx} x1={lx} y1={662} x2={lx + (lx < 700 ? -14 : 14)} y2={800}
          stroke={KRP.grayDark} strokeWidth={12} strokeLinecap="round" />)}
        {[620, 830].map((lx) => <line key={`k${lx}`} x1={lx} y1={662} x2={lx + (lx < 700 ? -14 : 14)} y2={800}
          stroke={KRP.ink} strokeWidth={3} opacity={0.4} />)}
      </g>
      {!empty && (
        <g>
          {/* 机 */}
          <rect x={860} y={600} width={400} height={30} rx={6} fill="#D9C9A6" stroke={KRP.ink} strokeWidth={7} />
          {[890, 1230].map((lx) => <rect key={lx} x={lx - 10} y={630} width={20} height={170} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 電気の箱 (灰色の金属の箱に赤いボタン1つ・ランプ・つまみ) */}
          <g>
            <rect x={960} y={520} width={210} height={80} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
            <rect x={970} y={528} width={190} height={10} rx={4} fill={KRP.white} opacity={0.5} />
            {/* ボタン (中心 1060,560) */}
            <ellipse cx={1060} cy={566} rx={44} ry={14} fill="#8E2A1E" />
            <ellipse cx={1060} cy={556 + press * 6} rx={40} ry={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={1048} cy={550 + press * 6} rx={14} ry={5} fill={KRP.white} opacity={0.5} />
            {/* ランプとつまみ */}
            <circle cx={1140} cy={548} r={9} fill={lamp ? (Math.floor(f / 12) % 2 ? KRP.green : "#B8E6B4") : KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={985} cy={570} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            {/* コード (箱から床へ、椅子のほうへ) */}
            <path d="M 1170 580 C 1260 600 1240 760 1100 780 S 860 770 800 760" stroke={KRP.ink} strokeWidth={7} fill="none" />
            <path d="M 1170 580 C 1260 600 1240 760 1100 780 S 860 770 800 760" stroke={KRP.grayDark} strokeWidth={3} fill="none" />
            {/* 押した瞬間の電気 */}
            {press > 0.05 && (
              <g opacity={press}>
                <circle cx={1060} cy={552} r={70 + press * 30} fill={HP.spark} opacity={0.35} />
                {[0, 1, 2, 3, 4, 5].map((j) => {
                  const a = (j * 60 + 20) * Math.PI / 180;
                  return <path key={j} d={`M ${1060 + Math.cos(a) * 54} ${552 + Math.sin(a) * 30}
                    l ${Math.cos(a) * 24} ${Math.sin(a) * 24 - 10} l ${-8} 10 l ${Math.cos(a) * 26} ${Math.sin(a) * 20}`}
                    stroke={HP.spark} strokeWidth={7} fill="none" strokeLinejoin="round" />;
                })}
              </g>
            )}
          </g>
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * Sumaho — スマホ (序・第6章・第7章・結びで同じ物を使う)
 *   x,y: 本体の中心。s=1 で 縦300px・横150px
 *   rot: 傾き (度)
 *   screen: "off" 真っ暗 / "on" 光るだけ / "feed" 縦に流れる投稿 / "notify" 通知のふきだし
 *   glow: 画面のまわりの光 (0〜1)
 *   f: 画面の中身の動き (feed の流れ・notify の揺れ)
 * =================================================================== */
export const Sumaho: React.FC<{
  x: number; y: number; s?: number; rot?: number; f: number;
  screen?: "off" | "on" | "feed" | "notify"; glow?: number;
}> = ({ x, y, s = 1, rot = 0, f, screen = "on", glow = 0 }) => {
  const on = screen !== "off";
  const scroll = (f * 4) % 80;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {glow > 0 && on && <ellipse cx={0} cy={0} rx={150 + 20 * glow} ry={190 + 20 * glow} fill={HP.screen} opacity={0.28 * glow} />}
      <rect x={-75} y={-150} width={150} height={300} rx={24} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-64} y={-136} width={128} height={272} rx={14} fill={on ? HP.screen : "#2A2E35"} />
      <defs>
        <clipPath id={`sumaho-clip-${Math.round(x)}-${Math.round(y)}`}>
          <rect x={-64} y={-136} width={128} height={272} rx={14} />
        </clipPath>
      </defs>
      {on && (
        <g clipPath={`url(#sumaho-clip-${Math.round(x)}-${Math.round(y)})`}>
          <rect x={-64} y={-136} width={128} height={272} fill={HP.screenCore} opacity={0.5} />
          {screen === "feed" && Array.from({ length: 5 }, (_, i) => {
            const cy = -150 + i * 80 - scroll + 80;
            return (
              <g key={i}>
                <rect x={-54} y={cy} width={108} height={64} rx={8} fill={KRP.white} stroke={KRP.blue} strokeWidth={2} />
                <rect x={-46} y={cy + 8} width={30} height={30} rx={6} fill={[KRP.orange, KRP.green, KRP.blueDeep, KRP.yellow, KRP.red][i]} opacity={0.7} />
                <rect x={-10} y={cy + 12} width={56} height={7} rx={3} fill={KRP.gray} />
                <rect x={-10} y={cy + 26} width={40} height={7} rx={3} fill={KRP.gray} />
              </g>
            );
          })}
          {screen === "notify" && (
            <g transform={`translate(0 ${-70 + Math.sin(f / 4) * 3})`}>
              <rect x={-56} y={-26} width={112} height={52} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={-34} cy={0} r={12} fill={KRP.green} />
              <rect x={-16} y={-10} width={58} height={7} rx={3} fill={KRP.gray} />
              <rect x={-16} y={4} width={42} height={7} rx={3} fill={KRP.gray} />
            </g>
          )}
          {/* 画面の反射 */}
          <path d="M -64 -60 L 20 -136 L 50 -136 L -64 -30 Z" fill={KRP.white} opacity={0.18} />
        </g>
      )}
      {/* カメラの穴 */}
      <rect x={-16} y={-130} width={32} height={8} rx={4} fill={KRP.ink} />
    </g>
  );
};

/* ===================================================================
 * YasumiCalendar — ひと月のカレンダー (休みの日を塗る)。第2章・第3章・結びで同じ物を使う
 *   x,y: 中心。s=1 で 幅560px・高さ500px
 *   title: 上の見出し (例「明治のはじめ」「明治9年〜」)。年や時代のラベルだけ
 *   days: その月の日数 (既定 31) / startDow: 1日の曜日 (0=日曜〜6=土曜)
 *   rest: 休みの日 (日付の配列)。赤く塗る
 *   half: 半日休みの日 (斜め半分を塗る)
 *   t: 休みの塗りが 1日ずつ順番に入っていく進み (0〜1)。1 で全部塗れた状態
 *   strike: ×をつける日 (休みが消えた日を見せるとき)
 *   weekHead: 曜日の見出し (日月火…) を出すか (既定 true。明治以前の「行事の休み」では false にしてよい)
 * =================================================================== */
export const YasumiCalendar: React.FC<{
  x: number; y: number; s?: number; title?: string; days?: number; startDow?: number;
  rest?: number[]; half?: number[]; t?: number; strike?: number[]; weekHead?: boolean; f?: number;
}> = ({ x, y, s = 1, title, days = 31, startDow = 0, rest = [], half = [], t = 1, strike = [], weekHead = true, f = 0 }) => {
  const cw = 72, ch = 62, gx = -252, gy = -150;
  const order = [...rest, ...half].sort((a, b) => a - b);
  const shown = (d: number) => {
    const k = order.indexOf(d);
    return k < 0 ? 0 : clamp01(t * order.length - k);
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 壁にかけた紙 (影・リング) */}
      <rect x={-268} y={-238} width={560} height={500} rx={10} fill={KRP.ink} opacity={0.18} />
      <rect x={-280} y={-250} width={560} height={500} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-280} y={-250} width={560} height={66} rx={10} fill={HP.rest} stroke={KRP.ink} strokeWidth={7} />
      {[-180, -60, 60, 180].map((rx) => (
        <g key={rx}>
          <circle cx={rx} cy={-250} r={12} fill={KRP.paper} stroke={KRP.ink} strokeWidth={4} />
          <rect x={rx - 4} y={-276} width={8} height={30} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />
        </g>
      ))}
      {title && (
        <text x={0} y={-203} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>{title}</text>
      )}
      {weekHead && ["日", "月", "火", "水", "木", "金", "土"].map((w, i) => (
        <text key={w} x={gx + i * cw + cw / 2 - 2} y={gy - 4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24}
          fill={i === 0 ? HP.rest : i === 6 ? KRP.blueDeep : KRP.ink}>{w}</text>
      ))}
      {Array.from({ length: days }, (_, k) => {
        const d = k + 1;
        const cell = startDow + k;
        const cx = gx + (cell % 7) * cw, cy = gy + 8 + Math.floor(cell / 7) * ch;
        const r = rest.includes(d), h = half.includes(d);
        const p = shown(d);
        const st = strike.includes(d);
        return (
          <g key={d}>
            <rect x={cx + 3} y={cy + 3} width={cw - 6} height={ch - 6} rx={8} fill={KRP.cream} stroke={KRP.gray} strokeWidth={2} />
            {r && p > 0 && <rect x={cx + 3} y={cy + 3} width={cw - 6} height={ch - 6} rx={8} fill={HP.restSoft}
              stroke={HP.rest} strokeWidth={4} opacity={p} transform={`translate(${cx + cw / 2} ${cy + ch / 2}) scale(${pop(p)}) translate(${-cx - cw / 2} ${-cy - ch / 2})`} />}
            {h && p > 0 && <path d={`M ${cx + 5} ${cy + ch - 5} L ${cx + cw - 5} ${cy + 5} L ${cx + cw - 5} ${cy + ch - 5} Z`}
              fill={HP.restSoft} stroke={HP.rest} strokeWidth={3} opacity={p} />}
            <text x={cx + cw / 2} y={cy + ch / 2 + 10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={27}
              fill={r ? HP.rest : KRP.ink}>{d}</text>
            {st && (
              <g opacity={0.9}>
                <line x1={cx + 10} y1={cy + 10} x2={cx + cw - 10} y2={cy + ch - 10} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
                <line x1={cx + cw - 10} y1={cy + 10} x2={cx + 10} y2={cy + ch - 10} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}
      {/* 紙のゆれに合わせた小さな影 */}
      <rect x={-280} y={242} width={560} height={8} fill={KRP.ink} opacity={0.08 + 0.02 * Math.sin(f / 10)} />
    </g>
  );
};

/* ===================================================================
 * Sousa — 捜索係 (暇を探す案内役)。全編でこの姿にそろえる
 *   x,y: 足元 (Person と同じ)。s≈0.55〜0.7
 *   face / pose / lean / gaze / phase: Person にそのまま渡す
 *   lens: 虫めがねを持つか (既定 true)。lensAt で虫めがねのレンズの中心を [x,y] (画面の座標) で指定すると、手から柄を伸ばしてそこへ向ける
 * =================================================================== */
export const Sousa: React.FC<{
  x: number; y: number; s?: number; f: number;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  lean?: number; gaze?: [number, number]; phase?: number;
  lens?: boolean; lensAt?: [number, number];
}> = ({ x, y, s = 0.62, f, face = "normal", pose = "stand", lean = 0, gaze = [0, 0], phase = 3, lens = true, lensAt }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  // 右手の位置 (Person の座標系)
  const hand: [number, number] = pose === "raise" ? [67, -310] : pose === "banzai" ? [120, -300] : [67, -66];
  const hx = x + hand[0] * s, hy = y + bob + hand[1] * s;
  const [lx, ly] = lensAt ?? [hx + 70 * s, hy - 90 * s];
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} gaze={gaze} phase={phase}
        cloth="#6E9A5E" clothDark="#4E7442" hair="cap" />
      {/* ハンチング帽 */}
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <path d="M -66 -262 Q -60 -318 0 -322 Q 62 -318 68 -262 Z" fill="#8A5A34" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -70 -262 Q 0 -250 96 -258 Q 104 -246 92 -240 Q 0 -236 -70 -250 Z" fill="#6E4526" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-320} r={7} fill="#6E4526" stroke={KRP.ink} strokeWidth={3} />
        <path d="M -40 -300 Q 0 -310 40 -300" stroke="#A97A4E" strokeWidth={4} fill="none" />
      </g>
      {/* 虫めがね */}
      {lens && (
        <g>
          <line x1={hx} y1={hy} x2={lx - (lx - hx) * (36 / Math.max(Math.hypot(lx - hx, ly - hy), 1)) * (s / 0.62)}
            y2={ly - (ly - hy) * (36 / Math.max(Math.hypot(lx - hx, ly - hy), 1)) * (s / 0.62)}
            stroke="#6E4526" strokeWidth={14 * s / 0.62} strokeLinecap="round" />
          <circle cx={lx} cy={ly} r={36 * s / 0.62} fill={HP.screenCore} opacity={0.45} />
          <circle cx={lx} cy={ly} r={36 * s / 0.62} fill="none" stroke={HP.brass} strokeWidth={9 * s / 0.62} />
          <circle cx={lx} cy={ly} r={36 * s / 0.62} fill="none" stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${lx - 18 * s / 0.62} ${ly - 12 * s / 0.62} q 8 -14 22 -14`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.8} />
          <circle cx={hx} cy={hy} r={11 * s / 0.62} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * Sagyozukue — 暇のものさしを置く「作業机」(#18・#19・#39・#99・#137・#144・#154・#162・#201〜#205 で同じ机)
 *   画面いっぱいの舞台。奥の壁 (有孔ボードに工具)・机の天板・左の卓上ランプ・右の小物 (メモ・鉛筆立て・コーヒー)。
 *   ものさしは天板の真ん中 (x=960, y=560, s=1) に置くと、ちょうど収まる
 *   f: ランプの光のゆらぎ・コーヒーの湯気
 *   night: true で夜の机 (ランプの光が強く、壁が暗い)
 * =================================================================== */
export const Sagyozukue: React.FC<{ f: number; night?: boolean }> = ({ f, night = false }) => {
  const wall = night ? "#5B5146" : "#D9CDB4";
  const board = night ? "#7A6A55" : "#C9A97A";
  const flick = 0.85 + 0.15 * Math.sin(f / 4) + 0.05 * Math.sin(f * 1.7);
  return (
    <g>
      {/* 奥の壁と有孔ボード */}
      <rect x={-40} y={-40} width={2000} height={420} fill={wall} />
      <rect x={300} y={40} width={1320} height={300} rx={8} fill={board} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 8 }, (_, r) => Array.from({ length: 30 }, (_, c) => (
        <circle key={`${r}-${c}`} cx={330 + c * 44} cy={66 + r * 36} r={4} fill={KRP.ink} opacity={0.35} />
      )))}
      {/* 工具 (のこぎり・金づち・定規・ペンチ・のみ) */}
      <g>
        <path d="M 420 90 L 640 90 L 640 150 L 430 170 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${436 + i * 17} 168 l 8 12 l 8 -12`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={640} y={96} width={70} height={46} rx={10} fill="#A06A3C" stroke={KRP.ink} strokeWidth={5} />
        <rect x={780} y={80} width={20} height={190} rx={6} fill="#A06A3C" stroke={KRP.ink} strokeWidth={5} />
        <rect x={750} y={70} width={80} height={40} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={900} y={90} width={36} height={230} fill="#F2D36B" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={900} y1={110 + i * 20} x2={914} y2={110 + i * 20} stroke={KRP.ink} strokeWidth={3} />)}
        <path d="M 1020 90 L 1050 90 L 1060 220 L 1035 250 L 1010 220 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1090 90 L 1120 90 L 1150 220 L 1105 250 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1240} y={100} width={18} height={150} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1230} y={240} width={38} height={70} rx={8} fill="#A06A3C" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1440} cy={170} r={70} fill="none" stroke="#7A5A3A" strokeWidth={12} />
        <circle cx={1440} cy={170} r={70} fill="none" stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 机の天板 */}
      <rect x={-40} y={380} width={2000} height={760} fill="#B9874F" />
      <rect x={-40} y={372} width={2000} height={24} fill="#8E6234" stroke={KRP.ink} strokeWidth={6} />
      <g stroke="#9E6F3E" strokeWidth={4} fill="none" opacity={0.6}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -40 ${440 + i * 90} q 500 ${i % 2 ? 14 : -14} 1000 0 q 500 ${i % 2 ? -14 : 14} 1000 0`} />
        ))}
      </g>
      {/* 左: 卓上ランプ */}
      <g>
        <ellipse cx={170} cy={560} rx={90} ry={22} fill="#5E5A55" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 170 550 L 210 380 L 150 250" stroke="#5E5A55" strokeWidth={16} fill="none" strokeLinejoin="round" />
        <path d="M 150 250 L 60 290 L 120 360 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="80,330 130,370 520,700 140,760" fill={HP.spark} opacity={(night ? 0.22 : 0.1) * flick} />
        <circle cx={104} cy={338} r={14} fill={HP.spark} opacity={flick} />
      </g>
      {/* 右: メモ・鉛筆立て・コーヒー */}
      <g>
        <rect x={1640} y={430} width={200} height={150} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(6 1740 505)" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={1660} y1={460 + i * 30} x2={1810} y2={476 + i * 30} stroke={KRP.gray} strokeWidth={4} />)}
        <rect x={1700} y={600} width={90} height={110} rx={10} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
        {[[1716, KRP.yellow], [1738, KRP.red], [1760, KRP.green]].map(([px, c], i) => (
          <rect key={i} x={px as number} y={540 - i * 8} width={14} height={80} rx={4} fill={c as string} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <rect x={1560} y={640} width={90} height={90} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1650 660 q 34 0 34 26 q 0 26 -34 26" stroke={KRP.ink} strokeWidth={6} fill="none" />
        <ellipse cx={1605} cy={648} rx={38} ry={8} fill="#6B4527" />
        {[0, 1].map((i) => <path key={i} d={`M ${1592 + i * 24} 620 q 10 -18 0 -34 q -10 -18 0 -36`} stroke={KRP.white} strokeWidth={4} fill="none"
          opacity={0.5} transform={`translate(0 ${-((f * 1.1 + i * 13) % 24)})`} />)}
      </g>
    </g>
  );
};

/* ===================================================================
 * YoruNoHeya — 「あなた」の夜の部屋 (#14・#160・#164・#200・#210 で同じ部屋)
 *   奥の壁・窓 (月)・本棚・テレビ台とテレビ・観葉植物・壁の時計・床・ラグ・ソファの背と座面の奥。
 *   人をソファに座らせるときは: <YoruNoHeya /> → <Person … pose="sit" x={860} y={758} s={1.05} /> → <YoruNoHeyaFront /> の順に重ねる
 *   (Front がソファの座面の手前と肘かけを描いて、足元を隠す)
 *   座面の高さ y=700。ソファの真ん中 x=860。テレビの画面の中心 (1520, 470)。壁の時計 (560, 190)
 *   tv: テレビの画面を光らせるか / f: 時計の秒針・カーテンのゆれ
 * =================================================================== */
export const YoruNoHeya: React.FC<{ f: number; tv?: boolean }> = ({ f, tv = false }) => (
  <g>
    <rect x={-40} y={-40} width={2000} height={700} fill="#3E3A55" />
    <g stroke="#48446A" strokeWidth={3}>{Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 92} y1={-40} x2={i * 92} y2={660} />)}</g>
    {/* 窓と月 */}
    <rect x={120} y={110} width={300} height={330} fill="#1F2240" stroke={KRP.ink} strokeWidth={8} />
    <line x1={270} y1={110} x2={270} y2={440} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={340} cy={190} r={36} fill="#FFF3C4" />
    {[[170, 160], [210, 300], [380, 360], [160, 390]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 7 + i)} />)}
    <path d={`M 100 100 L 100 460 Q ${150 + Math.sin(f / 20) * 6} 440 160 100 Z`} fill="#6A4E7A" stroke={KRP.ink} strokeWidth={5} />
    {/* 壁の時計 */}
    <g transform="translate(560 190)">
      <circle r={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <line x1={0} y1={0} x2={0} y2={-32} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(-50)" />
      <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform="rotate(120)" />
      <line x1={0} y1={6} x2={0} y2={-46} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${(f * 6) % 360})`} />
    </g>
    {/* 本棚 (右奥) */}
    <g>
      <rect x={1700} y={120} width={220} height={540} fill="#6B4A36" stroke={KRP.ink} strokeWidth={7} />
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x={1710} y={220 + r * 120} width={200} height={10} fill="#4E3424" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={1716 + i * 31} y={140 + r * 120 + (i % 3) * 6} width={24} height={80 - (i % 3) * 6}
              fill={["#C96A4A", "#4F7DB8", "#E0B84A", "#6EA36A", "#9A6AB0", "#D98A5A"][(i + r) % 6]} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      ))}
    </g>
    {/* テレビ台とテレビ */}
    <rect x={1250} y={560} width={420} height={100} fill="#5A4636" stroke={KRP.ink} strokeWidth={6} />
    <rect x={1300} y={330} width={440} height={260} rx={10} fill={KRP.ink} />
    <rect x={1316} y={346} width={408} height={228} fill={tv ? "#A9CFEA" : "#2A2E38"} />
    {tv && <rect x={1316} y={346} width={408} height={228} fill={KRP.white} opacity={0.12 + 0.06 * Math.sin(f * 1.3)} />}
    {/* 観葉植物 */}
    <g transform="translate(1180 660)">
      <path d="M -40 0 L -30 -80 L 30 -80 L 40 0 Z" fill="#B0633F" stroke={KRP.ink} strokeWidth={5} />
      {[-2, -1, 0, 1, 2].map((k) => <ellipse key={k} cx={k * 24} cy={-150 + Math.abs(k) * 18} rx={18} ry={58} fill="#4E8A55" stroke={KRP.ink} strokeWidth={4}
        transform={`rotate(${k * 22 + Math.sin(f / 30 + k) * 2} ${k * 24} -80)`} />)}
    </g>
    {/* 床とラグ */}
    <rect x={-40} y={660} width={2000} height={480} fill="#6E5A48" />
    <ellipse cx={900} cy={930} rx={720} ry={120} fill="#8C6E8E" opacity={0.7} />
    {/* ソファの背もたれと座面の奥 */}
    <rect x={520} y={470} width={700} height={240} rx={40} fill="#5E6FA8" stroke={KRP.ink} strokeWidth={8} />
    <rect x={560} y={500} width={300} height={170} rx={30} fill="#6F80B9" stroke={KRP.ink} strokeWidth={5} />
    <rect x={880} y={500} width={300} height={170} rx={30} fill="#6F80B9" stroke={KRP.ink} strokeWidth={5} />
  </g>
);
export const YoruNoHeyaFront: React.FC = () => (
  <g>
    <rect x={500} y={690} width={740} height={120} rx={30} fill="#5E6FA8" stroke={KRP.ink} strokeWidth={8} />
    <rect x={470} y={560} width={110} height={260} rx={44} fill="#4E5E96" stroke={KRP.ink} strokeWidth={8} />
    <rect x={1160} y={560} width={110} height={260} rx={44} fill="#4E5E96" stroke={KRP.ink} strokeWidth={8} />
    {[560, 1180].map((lx) => <rect key={lx} x={lx} y={808} width={24} height={40} fill="#3E2E22" stroke={KRP.ink} strokeWidth={4} />)}
  </g>
);

/* ===================================================================
 * EkiHome — 夕方の駅のホーム (#1 と #214・#215 で同じホーム)
 *   空 (夕焼け)・遠くの家並み・線路・ホームの端の黄色い線・屋根の柱・電光掲示 (左上)・自販機 (右)・ベンチ。
 *   人をベンチに座らせるときは: <EkiHome /> → <Person … pose="sit" x={860} y={748} s={1.05} /> → <EkiBenchFront /> の順
 *   ベンチの座面の高さ y=690、真ん中 x=860。電光掲示の中心 (380, 170)
 *   minutes: 掲示の「あと何分」の数字 (0〜9)。0 で「まもなく」の点滅
 *   next: 掲示の上の段に出す「次の列車」の文字 (例「つぎ 普通 さくら台行」)。省略で出さない
 *   pass: 0〜1 で通過電車が奥の線路を右から左へ駆け抜ける
 *   train: 電車がホームに入ってくる進み (0=いない 〜 1=止まった)
 * =================================================================== */
export const EkiHome: React.FC<{ f: number; minutes?: number; train?: number; pass?: number; next?: string }> = ({ f, minutes = 5, train = 0, pass = 0, next }) => {
  const tx = lerp(2400, 140, easeOut(clamp01(train)));
  // pass: 0〜1 で通過電車が右から左へ駆け抜ける (止まらない)。0 で出さない
  const px = lerp(2100, -2000, clamp01(pass));
  return (
    <g>
      <defs>
        <linearGradient id="ekiSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C6FA8" /><stop offset="0.55" stopColor="#E9967A" /><stop offset="1" stopColor="#F6C98A" />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={2000} height={560} fill="url(#ekiSky)" />
      <circle cx={1500} cy={420} r={70} fill="#FBD57A" opacity={0.9} />
      {/* 遠くの家並み */}
      <g fill="#6A5A7A" stroke={KRP.ink} strokeWidth={3} opacity={0.85}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${i * 150 - 20} 520 l 0 -${60 + (i * 37) % 70} l 60 -40 l 60 40 l 0 ${60 + (i * 37) % 70} Z`} />
        ))}
      </g>
      {/* 線路 */}
      <rect x={-40} y={510} width={2000} height={120} fill="#8B8077" />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 70 - 20} y={540} width={40} height={70} fill="#6E6058" />)}
      <rect x={-40} y={548} width={2000} height={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
      <rect x={-40} y={598} width={2000} height={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
      {/* 電車 */}
      {train > 0 && (
        <g transform={`translate(${tx} 0)`}>
          <rect x={0} y={330} width={1700} height={260} rx={30} fill="#E8E4DA" stroke={KRP.ink} strokeWidth={8} />
          <rect x={0} y={520} width={1700} height={30} fill="#4FA38D" stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={60 + i * 200} y={370} width={140} height={110} rx={10} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={5} />)}
          <circle cx={30} cy={500} r={16} fill={HP.spark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 通過電車 (pass) */}
      {pass > 0 && pass < 1 && (
        <g transform={`translate(${px} 0)`}>
          <rect x={0} y={340} width={1900} height={250} rx={34} fill="#D9DDE3" stroke={KRP.ink} strokeWidth={8} />
          <path d="M 0 374 Q 0 340 40 340 L 160 340 L 160 590 L 34 590 Q 0 590 0 556 Z" fill="#B9C3CF" stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={516} width={1900} height={28} fill={HP.byo} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={200 + i * 190} y={376} width={130} height={104} rx={10} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={5} />)}
          <circle cx={36} cy={500} r={14} fill={HP.spark} stroke={KRP.ink} strokeWidth={4} />
          {/* 速さの線 */}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={1920 + (i % 3) * 60} y1={380 + i * 34} x2={2260 + (i % 2) * 120} y2={380 + i * 34}
              stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      )}
      {/* ホーム */}
      <rect x={-40} y={630} width={2000} height={520} fill="#B8AFA2" />
      <rect x={-40} y={630} width={2000} height={26} fill="#F2CE4C" stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={i * 52} cy={643} r={4} fill={KRP.ink} opacity={0.4} />)}
      <g stroke="#A39A8C" strokeWidth={4}>{Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 280} y1={660} x2={i * 340 - 200} y2={1120} />)}</g>
      {/* 屋根と柱 */}
      <rect x={-40} y={-40} width={2000} height={60} fill="#5E5A66" stroke={KRP.ink} strokeWidth={6} />
      {[620, 1300].map((px) => <rect key={px} x={px} y={20} width={30} height={640} fill="#7A7680" stroke={KRP.ink} strokeWidth={6} />)}
      {/* 電光掲示 */}
      <g transform="translate(380 170)">
        {next && (
          <g>
            {/* 上の段だとバッジ「暇のからくり」に重なるので、掲示の下にぶら下げる (2026-11-26) */}
            <rect x={-220} y={64} width={440} height={66} rx={8} fill="#2A2A30" stroke={KRP.ink} strokeWidth={6} />
            <text x={-196} y={110} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#7FD1FF">{next}</text>
          </g>
        )}
        <rect x={-220} y={-60} width={440} height={120} rx={8} fill="#2A2A30" stroke={KRP.ink} strokeWidth={6} />
        <line x1={-160} y1={-60} x2={-160} y2={-140} stroke={KRP.ink} strokeWidth={6} />
        <line x1={160} y1={-60} x2={160} y2={-140} stroke={KRP.ink} strokeWidth={6} />
        <text x={-150} y={20} fontFamily={FONT} fontWeight={900} fontSize={54} fill="#FFB347">{minutes > 0 ? `${minutes}` : "●"}</text>
        <text x={-90} y={20} fontFamily={FONT} fontWeight={900} fontSize={44} fill="#FFB347"
          opacity={minutes > 0 ? 1 : 0.4 + 0.6 * (Math.floor(f / 8) % 2)}>{minutes > 0 ? "分" : "まもなく"}</text>
        <rect x={110} y={-30} width={80} height={60} rx={6} fill="#3E3E48" />
        <path d="M 120 0 l 20 -16 l 0 32 Z M 150 0 l 20 -16 l 0 32 Z" fill="#7FD1FF" />
      </g>
      {/* 自販機 */}
      <g>
        <rect x={1460} y={380} width={220} height={400} rx={10} fill="#D9503F" stroke={KRP.ink} strokeWidth={7} />
        <rect x={1480} y={400} width={180} height={190} fill="#F3EEE4" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
          <rect key={`${r}${c}`} x={1492 + c * 42} y={414 + r * 58} width={28} height={44} rx={6}
            fill={[KRP.blueDeep, KRP.green, KRP.orange, KRP.yellow][(r + c) % 4]} stroke={KRP.ink} strokeWidth={3} />
        )))}
        <rect x={1500} y={680} width={140} height={60} rx={6} fill="#2A2A30" />
        <rect x={1460} y={380} width={220} height={400} rx={10} fill={KRP.white} opacity={0.06 + 0.04 * Math.sin(f / 9)} />
      </g>
      {/* ベンチの背と座面の奥 */}
      <rect x={600} y={560} width={520} height={30} rx={8} fill="#4F7DB8" stroke={KRP.ink} strokeWidth={6} />
      <rect x={600} y={600} width={520} height={30} rx={8} fill="#4F7DB8" stroke={KRP.ink} strokeWidth={6} />
    </g>
  );
};
export const EkiBenchFront: React.FC = () => (
  <g>
    <rect x={580} y={680} width={560} height={34} rx={10} fill="#5A8BC6" stroke={KRP.ink} strokeWidth={6} />
    {[620, 1080].map((lx) => <rect key={lx} x={lx} y={712} width={22} height={90} fill="#5E5A66" stroke={KRP.ink} strokeWidth={5} />)}
  </g>
);

/* ===================================================================
 * KyukeiBoard — 会社の休憩室のホワイトボード (#13 と #206・#207 で同じボード)
 *   壁・ホワイトボード (枠の内側 x 360〜1560, y 150〜720)・マーカー受け・マグネット・付箋・観葉植物・コーヒーメーカー。
 *   ボードの中に、シーン側で棒グラフなどを描く (内側の下端 y=720 が棒の根元にちょうどよい。札は 830 以下に)
 * =================================================================== */
export const KyukeiBoard: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={2000} height={1160} fill="#E6E2D6" />
    <rect x={-40} y={820} width={2000} height={320} fill="#C9C0AC" />
    <rect x={-40} y={812} width={2000} height={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <rect x={330} y={120} width={1260} height={630} rx={14} fill="#B9BDC2" stroke={KRP.ink} strokeWidth={8} />
    <rect x={360} y={150} width={1200} height={570} fill="#FBFBF8" stroke={KRP.ink} strokeWidth={4} />
    <path d="M 380 170 L 520 170" stroke={KRP.gray} strokeWidth={3} opacity={0.3} />
    <rect x={500} y={750} width={920} height={24} rx={6} fill="#9EA3A8" stroke={KRP.ink} strokeWidth={5} />
    {[[560, KRP.red], [640, KRP.blueDeep], [720, KRP.ink]].map(([mx, c], i) => (
      <rect key={i} x={mx as number} y={736} width={60} height={18} rx={8} fill={c as string} stroke={KRP.ink} strokeWidth={3} />
    ))}
    {[[400, 190, KRP.yellow], [1500, 200, KRP.green], [1490, 640, KRP.orange]].map(([nx, ny, c], i) => (
      <g key={i} transform={`rotate(${(i - 1) * 6} ${nx} ${ny})`}>
        <rect x={(nx as number) - 40} y={(ny as number) - 34} width={80} height={68} fill={c as string} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        <line x1={(nx as number) - 26} y1={(ny as number) - 8} x2={(nx as number) + 26} y2={(ny as number) - 8} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        <line x1={(nx as number) - 26} y1={(ny as number) + 10} x2={(nx as number) + 16} y2={(ny as number) + 10} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      </g>
    ))}
    {/* 観葉植物 */}
    <g transform="translate(160 820)">
      <path d="M -60 0 L -46 -110 L 46 -110 L 60 0 Z" fill="#B0633F" stroke={KRP.ink} strokeWidth={6} />
      {[-2, -1, 0, 1, 2].map((k) => <ellipse key={k} cx={k * 30} cy={-210 + Math.abs(k) * 24} rx={22} ry={70} fill="#4E8A55" stroke={KRP.ink} strokeWidth={4}
        transform={`rotate(${k * 22 + Math.sin(f / 30 + k) * 2} ${k * 30} -110)`} />)}
    </g>
    {/* コーヒーメーカー */}
    <g>
      <rect x={1660} y={560} width={200} height={260} rx={14} fill="#4A4A52" stroke={KRP.ink} strokeWidth={7} />
      <rect x={1690} y={600} width={140} height={60} rx={6} fill="#2A2A30" />
      <circle cx={1760} cy={630} r={8} fill={KRP.green} opacity={0.5 + 0.5 * Math.sin(f / 6)} />
      <rect x={1720} y={720} width={80} height={80} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1].map((i) => <path key={i} d={`M ${1748 + i * 24} 700 q 10 -18 0 -34`} stroke={KRP.white} strokeWidth={4} fill="none"
        opacity={0.5} transform={`translate(0 ${-((f * 1.1 + i * 13) % 24)})`} />)}
    </g>
  </g>
);

/* ===================================================================
 * プレビュー (検品用)
 * =================================================================== */
import { useCurrentFrame } from "remotion";
import { Frame } from "./HimaShared";
import { Person } from "./KarakuriScenes";

export const HIMA_PARTS_PREVIEW_FRAMES = 10;
export const HimaPartsPreview: React.FC = () => {
  const fr = useCurrentFrame();
  const f = 30 + fr * 7;
  if (fr === 0) return (
    <Frame f={f} seed={77}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <Monosashi x={960} y={340} s={1} lit={0.4} f={f} />
      <Monosashi x={960} y={720} s={1} lit={3.55} f={f} focus={2} />
    </Frame>
  );
  if (fr === 1) return (
    <Frame f={f} seed={78}>
      <ShockRoom f={f} minutes={6} press={0.8} />
      <Person x={720} y={800} s={1.15} f={f} face="worried" pose="stand" />
    </Frame>
  );
  if (fr === 2) return (
    <Frame f={f} seed={79}>
      <ShockRoom f={f} minutes={15} empty />
    </Frame>
  );
  if (fr === 3) return (
    <Frame f={f} seed={80}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paperCool} />
      <Sumaho x={500} y={480} s={1.4} f={f} screen="feed" glow={1} />
      <Sumaho x={960} y={480} s={1.4} f={f} screen="notify" rot={-8} />
      <Sumaho x={1420} y={480} s={1.4} f={f} screen="off" rot={6} />
    </Frame>
  );
  if (fr === 4) return (
    <Frame f={f} seed={81}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <YasumiCalendar x={560} y={480} title="明治のはじめ" startDow={3} rest={[1, 6, 11, 16, 21, 26]} weekHead={false} f={f} />
      <YasumiCalendar x={1360} y={480} title="明治9年〜" startDow={6} rest={[2, 9, 16, 23, 30]} half={[1, 8, 15, 22, 29]} t={0.7} f={f} />
    </Frame>
  );
  if (fr === 6) return (
    <Frame f={f} seed={83}>
      <Sagyozukue f={f} />
      <Monosashi x={960} y={560} s={1} lit={2.5} f={f} />
      <Sousa x={1560} y={900} s={0.62} f={f} face="smile" lensAt={[1350, 560]} />
    </Frame>
  );
  if (fr === 7) return (
    <Frame f={f} seed={84} dark>
      <YoruNoHeya f={f} tv />
      <Person x={860} y={758} s={1.05} f={f} pose="sit" face="normal" cloth={HP.you} clothDark={HP.youDark} />
      <Sumaho x={920} y={600} s={0.35} f={f} screen="feed" glow={0.6} />
      <YoruNoHeyaFront />
    </Frame>
  );
  if (fr === 8) return (
    <Frame f={f} seed={85}>
      <EkiHome f={f} minutes={0} train={0.6} />
      <Person x={860} y={748} s={1.05} f={f} pose="sit" face="normal" cloth={HP.you} clothDark={HP.youDark} />
      <EkiBenchFront />
    </Frame>
  );
  if (fr === 9) return (
    <Frame f={f} seed={86}>
      <KyukeiBoard f={f} />
    </Frame>
  );
  return (
    <Frame f={f} seed={82}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <Monosashi x={960} y={520} s={1.2} lit={4} f={f} />
      <Person x={960} y={980} s={0.9} f={f} face="smile" cloth={HP.you} clothDark={HP.youDark} />
    </Frame>
  );
};
void lerp; void seg; void easeOut;
