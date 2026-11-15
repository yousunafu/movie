// つながる世界史・冒頭3分 / 担当B = 文#11〜#20
//
// 約束 (ここを外すと全部やり直しになる):
//  1. 1つの関数が1文ぶんの絵。<svg viewBox="0 0 1920 1080"> の中身だけを返す (SekaiArt)。
//     div / AbsoluteFill は使わない。字幕帯と通知カードは外側の枠が足す。
//  2. 背景は必ず敷く。素のクリーム地＋方眼は0枚 (第16条)。
//     画面全体に色フィルタは掛けない。物ごとに、その物の本当の色を置く。
//  3. 主役は短辺の半分 (540px) 以上。小さい物を画面の真ん中にポツンと置くのが最悪の失敗。
//  4. ★2026-11-09 改定。無貌のシルエットは禁止 (作者が名指しで却下)。
//     庶民には目・眉・鼻・口・耳を描く。実在の人物は「所作と装い」で見せる ──
//     ホメイニ師＝黒いターバン＋白い顎髭＋茶のアバ。似顔絵にはせず、顔は構図の都合で見せない。
//     ただし黒く潰すのも禁止。布と肌にはちゃんと色を入れる。
//  5. 必ず f で動く。出しっぱなしの静止画は作らない。1枚に1つ「事件」を起こす。
//  6. 色は world.tsx の WP を正本にする。足すときは WP に物の名前で足す (このファイルに溜めない)。
//  7. uid は関数ごとに別の文字列にする。defs の id がぶつかると他の絵が壊れる。
//  8. 紙目・かすれは SekaiScenes.tsx の InkLayer が全部に掛けている。各絵に書き足さない。
//  9. このファイルは1988年イランと2026年イランをまたぐ。混ぜない。
//     1988年にスマホ・液晶・ペットボトル・LED・SUVを出さない。
//     boutou-a.tsx の Hito は import しない。構造だけ真似て、その枚の人を新しく描く。

import React from "react";
import {
  SEKAI_SERIF,
  YearTag,
  Cam,
  seg,
  easeOut,
  easeInOut,
  W,
  H,
} from "./parts";
import { WP, type SekaiArt } from "./world";
import { SekaiPhoto } from "./photo";

// ===================================================================
// 共通の小道具 (この担当ぶんだけ)
// ===================================================================

// 決まった値を返す疑似乱数。同じ seed なら毎フレーム同じ形になる
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

// ペルシア語の一行。フォントを増やさずに「右から左に流れる書体」を形で出す。
// 歯 (短い上向き) / 鉢 (下に膨らむ椀) / 立ち上がり (上に伸びる縦棒) / 点 を混ぜる。
const Nastaliq: React.FC<{
  x: number; // 右端 (右から左に書く)
  y: number; // ベースライン
  w: number;
  size: number;
  color: string;
  seed: number;
  op?: number;
}> = ({ x, y, w, size, color, seed, op = 1 }) => {
  const n = Math.max(4, Math.round(w / (size * 0.74)));
  const step = w / n;
  const sw = Math.max(1.4, size * 0.13);
  const glyphs: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const gx = x - i * step;
    const r = rnd(seed, i);
    const r2 = rnd(seed + 7, i);
    if (r < 0.3) {
      // 鉢 (ب/ن の椀)
      glyphs.push(
        <path
          key={`b${i}`}
          d={`M ${gx},${y - size * 0.1} C ${gx - step * 0.1},${y + size * 0.42} ${gx - step * 0.86},${y + size * 0.42} ${gx - step * 0.96},${y - size * 0.1}`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />,
      );
      if (r2 < 0.5)
        glyphs.push(
          <circle key={`bd${i}`} cx={gx - step * 0.5} cy={y + size * 0.62} r={sw * 0.72} fill={color} />,
        );
    } else if (r < 0.52) {
      // 立ち上がり (ا/ل/ک)
      glyphs.push(
        <path
          key={`a${i}`}
          d={`M ${gx - step * 0.4},${y} L ${gx - step * 0.4 - size * 0.08},${y - size * 0.92}`}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />,
      );
      glyphs.push(
        <path
          key={`al${i}`}
          d={`M ${gx},${y} L ${gx - step * 0.8},${y}`}
          stroke={color}
          strokeWidth={sw * 0.8}
          strokeLinecap="round"
        />,
      );
    } else if (r < 0.74) {
      // 歯の連なり (س)
      glyphs.push(
        <path
          key={`s${i}`}
          d={`M ${gx},${y} l ${-step * 0.2},${-size * 0.3} l ${-step * 0.12},${size * 0.3}
              l ${-step * 0.2},${-size * 0.3} l ${-step * 0.12},${size * 0.3} l ${-step * 0.3},0`}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinejoin="round"
        />,
      );
    } else {
      // 輪 (ه/و) ＋ 上の点
      glyphs.push(
        <ellipse
          key={`o${i}`}
          cx={gx - step * 0.46}
          cy={y - size * 0.18}
          rx={step * 0.34}
          ry={size * 0.26}
          stroke={color}
          strokeWidth={sw}
          fill="none"
        />,
      );
      if (r2 > 0.6)
        glyphs.push(
          <circle key={`od${i}`} cx={gx - step * 0.46} cy={y - size * 0.62} r={sw * 0.72} fill={color} />,
        );
    }
  }
  return <g opacity={op}>{glyphs}</g>;
};

// イラン国旗の中央の意匠 (4つの三日月＋縦の剣)。赤一色・幅 u で描く
const AllahMark: React.FC<{ x: number; y: number; u: number; color: string; op?: number }> = ({
  x,
  y,
  u,
  color,
  op = 1,
}) => (
  <g transform={`translate(${x} ${y})`} opacity={op}>
    {/* 縦の剣 */}
    <path d={`M ${-u * 0.09},${u * 0.5} L ${-u * 0.09},${-u * 0.32} L 0,${-u * 0.56} L ${u * 0.09},${-u * 0.32} L ${u * 0.09},${u * 0.5} Z`} fill={color} />
    {/* 内側の三日月 2つ */}
    <path d={`M ${-u * 0.3},${u * 0.46} C ${-u * 0.5},${u * 0.1} ${-u * 0.42},${-u * 0.2} ${-u * 0.26},${-u * 0.34} C ${-u * 0.3},${-u * 0.06} ${-u * 0.22},${u * 0.2} ${-u * 0.16},${u * 0.46} Z`} fill={color} />
    <path d={`M ${u * 0.3},${u * 0.46} C ${u * 0.5},${u * 0.1} ${u * 0.42},${-u * 0.2} ${u * 0.26},${-u * 0.34} C ${u * 0.3},${-u * 0.06} ${u * 0.22},${u * 0.2} ${u * 0.16},${u * 0.46} Z`} fill={color} />
    {/* 外側の三日月 2つ */}
    <path d={`M ${-u * 0.56},${u * 0.46} C ${-u * 0.82},${u * 0.04} ${-u * 0.72},${-u * 0.26} ${-u * 0.52},${-u * 0.4} C ${-u * 0.58},${-u * 0.06} ${-u * 0.5},${u * 0.18} ${-u * 0.42},${u * 0.46} Z`} fill={color} />
    <path d={`M ${u * 0.56},${u * 0.46} C ${u * 0.82},${u * 0.04} ${u * 0.72},${-u * 0.26} ${u * 0.52},${-u * 0.4} C ${u * 0.58},${-u * 0.06} ${u * 0.5},${u * 0.18} ${u * 0.42},${u * 0.46} Z`} fill={color} />
    {/* 剣の上の tashdid */}
    <path d={`M ${-u * 0.2},${-u * 0.64} l ${u * 0.4},0`} stroke={color} strokeWidth={u * 0.07} strokeLinecap="round" />
  </g>
);

// ===================================================================
// #11 山「最後まで『勝つまでやめない』と言い続けた最高指導者ホメイニが、停戦を受け入れたのです。」
// 1988年7月・テヘランの街頭。夕方。演台を斜め後ろ下から煽る。
// ホメイニ師は演台にいない (このとき公の場に出ていない)。声は拡声器から流れている。
// 事件 = 鉢巻の若者が小旗をゆっくり下ろす。歓声ではなく沈黙の絵。
// ===================================================================
const S11: SekaiArt = ({ f }) => {
  const u = "b11";
  const ring = (i: number) => seg(f, 10 + i * 14, 10 + i * 14 + 40);
  const flagDown = easeOut(seg(f, 44, 104)); // ★事件
  const gaze = easeOut(seg(f, 0, 26));

  // 街頭の人。1988年7月・老若男女を混ぜる。全員が同じスピーカーを見上げる
  type K = "chador" | "shirt" | "basij" | "father" | "boy" | "veteran" | "manto" | "oldman";
  const Hito: React.FC<{ x: number; y: number; h: number; kind: K; up: number; d?: number }> = ({
    x,
    y,
    h,
    kind,
    up,
    d = 0,
  }) => {
    const s = h / 420;
    const tilt = -16 * up; // 見上げる
    const body =
      kind === "chador" ? WP.chador
      : kind === "manto" ? WP.manto
      : kind === "basij" ? WP.fieldJacket
      : kind === "shirt" ? "#2C3448"
      : kind === "veteran" ? "#52586A"
      : kind === "boy" ? "#7A5E3E"
      : kind === "oldman" ? "#3E3A34"
      : "#394154";
    const lit =
      kind === "chador" ? WP.chadorLit : kind === "basij" ? "#8C8C62" : "#5A6478";
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - d}>
        <ellipse cx={0} cy={6} rx={46} ry={11} fill="#2A2026" opacity={0.5} />
        {/* 脚 */}
        {kind === "chador" || kind === "manto" ? null : (
          <>
            <path d={`M -20,-150 L -24,-6 l 22,0 l 4,-144 Z`} fill={WP.kokuminFukuDark} />
            <path d={`M 20,-150 L 24,-6 l -22,0 l -4,-144 Z`} fill={WP.kokuminFukuDark} />
            <path d={`M -28,-6 l 30,0 l 0,8 l -30,0 Z`} fill="#1E1A18" />
            <path d={`M 2,-6 l 30,0 l 0,8 l -30,0 Z`} fill="#1E1A18" />
          </>
        )}
        {/* 胴・外衣 */}
        {kind === "chador" ? (
          // 黒チャードル。半円の一枚布。縫い目もボタンも無い。顎の下を手で押さえる
          <>
            <path d={`M 0,-392 C -84,-360 -108,-190 -96,-2 L 96,-2 C 108,-190 84,-360 0,-392 Z`} fill={body} />
            <path d={`M -58,-300 C -70,-190 -72,-90 -66,-2`} stroke={lit} strokeWidth={6} fill="none" opacity={0.7} />
            <path d={`M 56,-310 C 70,-200 72,-96 64,-2`} stroke={lit} strokeWidth={5} fill="none" opacity={0.55} />
            <path d={`M 0,-392 C -40,-372 -52,-336 -48,-306 L 48,-306 C 52,-336 40,-372 0,-392 Z`} fill={WP.turbanOrime} opacity={0.5} />
          </>
        ) : kind === "manto" ? (
          <>
            <path d={`M -46,-330 L 46,-330 L 60,-10 L -60,-10 Z`} fill={body} />
            <path d={`M 0,-330 L 0,-10`} stroke={lit} strokeWidth={4} opacity={0.6} />
            <path d={`M -46,-334 C -20,-352 20,-352 46,-334 L 30,-300 L -30,-300 Z`} fill={WP.rusari} />
          </>
        ) : (
          <>
            <path d={`M -44,-336 L 44,-336 L 54,-146 L -54,-146 Z`} fill={body} />
            <path d={`M -44,-336 L -62,-240 L -48,-234 L -36,-320 Z`} fill={lit} />
            <path d={`M 44,-336 L 62,-240 L 48,-234 L 36,-320 Z`} fill={lit} />
            {kind === "shirt" || kind === "oldman" ? (
              // 襟を開けたシャツ (革命後の作法でネクタイは付けない)
              <>
                <path d={`M -14,-336 L 0,-292 L 14,-336 Z`} fill={WP.skinShade} />
                <path d={`M -16,-338 L -2,-336 L -12,-300 Z`} fill="#D8D2C2" />
                <path d={`M 16,-338 L 2,-336 L 12,-300 Z`} fill="#D8D2C2" />
              </>
            ) : null}
            {kind === "basij" ? (
              <>
                <rect x={-38} y={-290} width={28} height={22} rx={3} fill="#8C8C62" />
                <rect x={10} y={-290} width={28} height={22} rx={3} fill="#8C8C62" />
                <path d={`M -44,-300 L 44,-300`} stroke="#4E4E34" strokeWidth={4} />
              </>
            ) : null}
          </>
        )}
        {/* 頭 */}
        <g transform={`rotate(${tilt} 0 -340)`}>
          <ellipse cx={0} cy={-378} rx={34} ry={40} fill={WP.skin} />
          <path d={`M -34,-382 C -30,-416 30,-416 34,-382 L 34,-396 C 26,-424 -26,-424 -34,-396 Z`} fill={kind === "oldman" ? "#9A948A" : "#2A211B"} />
          {kind === "chador" || kind === "manto" ? (
            // 布が額と顎を囲む
            <path
              d={`M -36,-384 C -40,-424 40,-424 36,-384 C 36,-348 18,-336 0,-336 C -18,-336 -36,-348 -36,-384 Z
                  M -26,-382 C -26,-406 26,-406 26,-382 C 26,-356 14,-348 0,-348 C -14,-348 -26,-356 -26,-382 Z`}
              fill={kind === "chador" ? WP.chador : WP.rusari}
              fillRule="evenodd"
            />
          ) : kind === "basij" ? (
            // 緑の鉢巻
            <>
              <rect x={-36} y={-404} width={72} height={13} fill={WP.hachimakiMidori} />
              <path d={`M 34,-398 l 24,16 l -6,8 l -22,-16 Z`} fill={WP.hachimakiMidori} />
            </>
          ) : null}
          {/* 耳 */}
          <ellipse cx={-33} cy={-374} rx={6} ry={9} fill={WP.skinShade} opacity={0.9} />
          {/* 眉・目 (見上げる＝白目＋瞳) */}
          <path d={`M -22,-390 l 13,-3`} stroke="#241B14" strokeWidth={3.4} strokeLinecap="round" />
          <path d={`M 22,-390 l -13,-3`} stroke="#241B14" strokeWidth={3.4} strokeLinecap="round" />
          <ellipse cx={-14} cy={-379} rx={6.4} ry={4.6} fill="#F4EFE4" />
          <ellipse cx={14} cy={-379} rx={6.4} ry={4.6} fill="#F4EFE4" />
          <circle cx={-14} cy={-380.6} r={2.7} fill="#1A1410" />
          <circle cx={14} cy={-380.6} r={2.7} fill="#1A1410" />
          {/* 鼻・口 */}
          <path d={`M 0,-376 l -4,10 l 7,0`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d={`M -8,-357 C -2,-353 4,-353 9,-357`} stroke="#7A4A36" strokeWidth={2.8} fill="none" strokeLinecap="round" />
          {kind === "oldman" ? (
            <path d={`M -16,-352 C 0,-340 10,-342 17,-352 C 10,-332 -6,-332 -16,-352 Z`} fill={WP.agohige} opacity={0.9} />
          ) : null}
          {kind === "shirt" || kind === "basij" ? (
            <path d={`M -13,-350 C -4,-344 6,-344 14,-350 C 8,-340 -6,-340 -13,-350 Z`} fill="#2A211B" opacity={0.85} />
          ) : null}
        </g>
        {/* 腕 */}
        {kind === "chador" ? (
          // 顎の下を手で押さえる
          <path d={`M -56,-220 C -40,-290 -22,-330 -8,-344`} stroke={WP.chador} strokeWidth={17} fill="none" strokeLinecap="round" />
        ) : kind === "veteran" ? (
          <>
            <path d={`M -44,-300 C -62,-250 -66,-206 -62,-180`} stroke={body} strokeWidth={17} fill="none" strokeLinecap="round" />
            {/* 松葉杖 */}
            <path d={`M -70,-176 L -78,-4`} stroke={WP.matsubaZue} strokeWidth={9} strokeLinecap="round" />
            <path d={`M -88,-178 L -56,-186`} stroke={WP.matsubaZue} strokeWidth={8} strokeLinecap="round" />
            <path d={`M -86,-176 L -72,-120 M -58,-184 L -72,-120`} stroke={WP.matsubaZue} strokeWidth={6} />
            {/* 片脚は膝下から無い */}
            <rect x={14} y={-150} width={22} height={70} rx={8} fill="#E2DCCC" opacity={0.85} />
          </>
        ) : (
          <>
            <path d={`M -48,-310 C -62,-256 -64,-208 -58,-172`} stroke={body} strokeWidth={17} fill="none" strokeLinecap="round" />
            <path d={`M 48,-310 C 62,-256 64,-208 58,-172`} stroke={body} strokeWidth={17} fill="none" strokeLinecap="round" />
            <circle cx={-58} cy={-166} r={10} fill={WP.skin} />
            <circle cx={58} cy={-166} r={10} fill={WP.skin} />
          </>
        )}
      </g>
    );
  };

  return (
    <>
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WP.duskSky} />
          <stop offset="0.55" stopColor="#7A4A5E" />
          <stop offset="1" stopColor={WP.duskLow} />
        </linearGradient>
        <linearGradient id={`${u}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A4038" />
          <stop offset="1" stopColor="#2E2026" />
        </linearGradient>
        <linearGradient id={`${u}-banner`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#176A2C" />
          <stop offset="0.5" stopColor={WP.iranGreen} />
          <stop offset="1" stopColor="#145A26" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[0, 34, 1.05]} to={[-22, -8, 1.0]} start={0} end={150}>
        {/* 夕方の空 ＋ 標高1200mの大都市の背後にアルボルズ */}
        <rect x={-200} y={0} width={W + 400} height={700} fill={`url(#${u}-sky)`} />
        <ellipse cx={520} cy={620} rx={760} ry={190} fill="#E8903C" opacity={0.3} />
        <path
          d={`M -200,520 L 120,392 L 300,466 L 520,352 L 760,470 L 980,398 L 1230,486 L 1500,404 L 1780,480 L ${W + 200},440 L ${W + 200},700 L -200,700 Z`}
          fill="#4E4258"
        />
        <path d={`M 520,352 l 52,28 l -36,10 l -44,-14 Z M 1500,404 l 44,24 l -34,8 l -36,-12 Z`} fill={WP.snowShade} opacity={0.8} />

        {/* 街区。日干し煉瓦の壁と水色のタイル。窓にテープの×印 */}
        <rect x={-200} y={430} width={700} height={290} fill={WP.hiboshiRengaKage} />
        <rect x={-200} y={430} width={700} height={14} fill={WP.hiboshiRenga} opacity={0.6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`w${i}`}>
            <rect x={-150 + i * 128} y={476} width={76} height={92} fill="#2A2630" />
            <rect x={-150 + i * 128} y={476} width={76} height={92} fill="none" stroke={WP.shikkui} strokeWidth={5} />
            <path
              d={`M ${-150 + i * 128},476 l 76,92 M ${-74 + i * 128},476 l -76,92`}
              stroke="#E8E2D2"
              strokeWidth={5}
              opacity={0.85}
            />
          </g>
        ))}
        {/* 水色のタイルの腰壁 */}
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={`t${i}`} x={-190 + i * 62} y={600} width={56} height={56} fill={i % 3 === 0 ? WP.tileMizuiroLit : WP.tileMizuiro} opacity={0.85} />
        ))}

        {/* 殉教者ポスターの壁 (若い男の顔写真＋赤いチューリップ＋緑の枠＋名前と戦死日) */}
        {[0, 1, 2, 3].map((i) => {
          const px = 44 + i * 112;
          return (
            <g key={`m${i}`}>
              <rect x={px} y={300} width={96} height={146} fill={WP.paperAged} />
              <rect x={px} y={300} width={96} height={146} fill="none" stroke={WP.iranGreen} strokeWidth={6} />
              <ellipse cx={px + 48} cy={352} rx={25} ry={30} fill={WP.skin} />
              <path d={`M ${px + 23},348 C ${px + 26},322 ${px + 70},322 ${px + 73},348 L ${px + 73},336 C ${px + 66},316 ${px + 30},316 ${px + 23},336 Z`} fill="#241C16" />
              <path d={`M ${px + 38},366 C ${px + 44},362 ${px + 52},362 ${px + 58},366 C ${px + 52},374 ${px + 44},374 ${px + 38},366 Z`} fill="#241C16" />
              <circle cx={px + 39} cy={350} r={2.6} fill="#1A1410" />
              <circle cx={px + 57} cy={350} r={2.6} fill="#1A1410" />
              <path d={`M ${px + 25},384 C ${px + 30},374 ${px + 66},374 ${px + 71},384 L ${px + 71},398 L ${px + 25},398 Z`} fill="#30384C" />
              {/* 赤いチューリップ */}
              <path d={`M ${px + 20},430 C ${px + 14},412 ${px + 20},404 ${px + 26},412 C ${px + 30},402 ${px + 38},404 ${px + 38},418 C ${px + 36},430 ${px + 28},436 ${px + 20},430 Z`} fill={WP.iranRed} />
              <path d={`M ${px + 28},436 l 0,10`} stroke={WP.iranGreen} strokeWidth={3} />
              <Nastaliq x={px + 86} y={418} w={48} size={11} color={WP.ink} seed={i + 3} />
            </g>
          );
        })}

        {/* 右の建物に下がる巨大な肖像幕 (黒いターバン・白い顎髭・茶のアバ) */}
        <rect x={1372} y={220} width={436} height={520} fill={WP.hiboshiRengaKage} />
        <g>
          <rect x={1402} y={150} width={386} height={520} fill="#1E2A22" />
          <rect x={1402} y={150} width={386} height={520} fill="none" stroke={WP.iranGreen} strokeWidth={9} />
          {/* 布の皺 */}
          {[0, 1, 2, 3].map((i) => (
            <path key={`fd${i}`} d={`M ${1430 + i * 96},150 C ${1424 + i * 96},320 ${1438 + i * 96},500 ${1430 + i * 96},670`} stroke="#0E1612" strokeWidth={10} opacity={0.3} fill="none" />
          ))}
          {/* 黒いターバン */}
          <path d={`M 1512,330 C 1520,268 1672,268 1682,330 C 1690,296 1664,250 1596,250 C 1528,250 1504,296 1512,330 Z`} fill={WP.turbanKuro} />
          <path d={`M 1508,330 C 1560,312 1636,312 1686,330 C 1690,352 1684,364 1660,362 L 1534,362 C 1510,364 1504,352 1508,330 Z`} fill={WP.turbanOrime} />
          <path d={`M 1520,338 C 1570,324 1626,324 1676,338`} stroke={WP.turbanKuro} strokeWidth={6} fill="none" />
          {/* 顔 (伏せ目。黒く潰さない) */}
          <ellipse cx={1596} cy={400} rx={78} ry={86} fill={WP.skin} />
          <ellipse cx={1596} cy={400} rx={78} ry={86} fill={WP.skinShade} opacity={0.18} />
          <path d={`M 1548,384 C 1556,374 1576,374 1584,384`} stroke="#3A2A1E" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M 1644,384 C 1636,374 1616,374 1608,384`} stroke="#3A2A1E" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M 1552,400 C 1560,410 1574,410 1580,400`} stroke="#2E2018" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M 1640,400 C 1632,410 1618,410 1612,400`} stroke="#2E2018" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M 1596,404 l -7,30 l 14,0`} stroke={WP.skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* 白い顎髭 */}
          <path d={`M 1526,432 C 1540,540 1652,540 1666,432 C 1676,500 1650,566 1596,566 C 1542,566 1516,500 1526,432 Z`} fill={WP.agohige} />
          <path d={`M 1566,446 C 1580,452 1612,452 1626,446`} stroke="#B6B0A4" strokeWidth={5} fill="none" />
          {/* 茶のアバ */}
          <path d={`M 1596,540 C 1480,560 1442,620 1436,670 L 1756,670 C 1750,620 1712,560 1596,540 Z`} fill={WP.abaCha} />
          <path d={`M 1596,540 C 1570,588 1570,634 1580,670 M 1596,540 C 1622,588 1622,634 1612,670`} stroke={WP.kaftanCha} strokeWidth={9} fill="none" />
        </g>

        {/* 緑地に白文字のペルシア語の横断幕 */}
        <g transform={`translate(0 ${-6 + Math.sin(f / 22) * 4})`}>
          <path d={`M 480,210 C 760,236 1120,236 1392,206 L 1392,290 C 1120,320 760,320 480,294 Z`} fill={`url(#${u}-banner)`} />
          <Nastaliq x={1340} y={268} w={800} size={40} color="#F2EEE0" seed={11} />
        </g>

        {/* 街頭の拡声器つきの鉄柱 (声の出どころ。演台には誰もいない) */}
        <g>
          <path d={`M 876,700 L 892,250 L 916,250 L 932,700 Z`} fill={WP.steelDark} />
          <path d={`M 884,690 L 898,250 L 906,250 L 906,690 Z`} fill={WP.steel} opacity={0.55} />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={`lat${i}`} d={`M ${884 + i * 0.6},${300 + i * 44} L ${922 - i * 0.6},${322 + i * 44}`} stroke={WP.steelDark} strokeWidth={5} />
          ))}
          {/* 碍子 */}
          <ellipse cx={898} cy={244} rx={13} ry={9} fill={WP.tileMizuiro} />
          <ellipse cx={898} cy={232} rx={10} ry={8} fill={WP.tileMizuiroLit} />
          {/* ホーン型スピーカー 2基 */}
          {[0, 1].map((i) => {
            const dir = i === 0 ? -1 : 1;
            return (
              <g key={`sp${i}`} transform={`translate(${904 + dir * 18} ${268 + i * 54}) rotate(${dir * 16})`}>
                <path d={`M 0,0 L ${dir * 98},-44 L ${dir * 98},46 L 0,18 Z`} fill={WP.steel} />
                <path d={`M ${dir * 98},-44 L ${dir * 98},46`} stroke={WP.steelLit} strokeWidth={8} />
                <ellipse cx={dir * 96} cy={1} rx={8} ry={46} fill="#241E22" />
                <rect x={dir === -1 ? -14 : 0} y={-6} width={14} height={24} fill={WP.steelDark} />
              </g>
            );
          })}
          {/* 音の輪 */}
          {[0, 1, 2].map((i) => (
            <ellipse
              key={`r${i}`}
              cx={806}
              cy={272}
              rx={30 + ring(i) * 150}
              ry={44 + ring(i) * 210}
              fill="none"
              stroke="#F0C27A"
              strokeWidth={3}
              opacity={(1 - ring(i)) * 0.5}
            />
          ))}
          {/* 電線 */}
          <path d={`M 894,258 C 640,290 380,288 -200,318`} stroke="#241E22" strokeWidth={4} fill="none" />
          <path d={`M 918,262 C 1180,294 1400,292 ${W + 200},326`} stroke="#241E22" strokeWidth={4} fill="none" />
        </g>

        {/* 三色旗 (緑・白・赤＋中央に赤いアッラーの意匠) */}
        <g>
          <path d={`M 1206,700 L 1206,286`} stroke={WP.steel} strokeWidth={9} />
          <circle cx={1206} cy={282} r={9} fill={WP.brass} />
          <g transform={`translate(1206 300)`}>
            {[0, 1, 2].map((i) => (
              <path
                key={`fl${i}`}
                d={`M 0,${i * 34} C 56,${i * 34 - 8 + Math.sin(f / 14 + i) * 6} 112,${i * 34 + 10} 168,${i * 34 + 2 + Math.sin(f / 14 + i + 1) * 6} L 168,${i * 34 + 36} C 112,${i * 34 + 44} 56,${i * 34 + 26} 0,${i * 34 + 34} Z`}
                fill={i === 0 ? WP.iranGreen : i === 1 ? "#F2EEE2" : WP.iranRed}
              />
            ))}
            <AllahMark x={84} y={54} u={40} color={WP.iranRed} />
          </g>
        </g>

        {/* 誰もいない演台 (斜め後ろ下から煽る) */}
        <g>
          <path d={`M 430,1080 L 500,748 L 1060,742 L 1150,1080 Z`} fill="#3E2C22" />
          <path d={`M 500,748 L 1060,742 L 1072,792 L 492,798 Z`} fill="#6A4A30" />
          <path d={`M 492,798 L 1072,792 L 1150,1080 L 430,1080 Z`} fill="#2E2018" opacity={0.55} />
          {[0, 1, 2, 3].map((i) => (
            <path key={`pl${i}`} d={`M ${520 + i * 150},800 L ${500 + i * 170},1080`} stroke="#1E1510" strokeWidth={5} opacity={0.5} />
          ))}
          {/* マイクが2本、誰も立っていない */}
          {[0, 1].map((i) => (
            <g key={`mic${i}`}>
              <path d={`M ${700 + i * 140},744 C ${706 + i * 140},700 ${690 + i * 140},672 ${678 + i * 140},660`} stroke={WP.steelDark} strokeWidth={6} fill="none" />
              <ellipse cx={676 + i * 140} cy={652} rx={16} ry={20} fill={WP.steel} />
              <ellipse cx={676 + i * 140} cy={652} rx={10} ry={14} fill="#1E1A1C" opacity={0.6} />
            </g>
          ))}
          <path d={`M 560,742 L 1000,738`} stroke={WP.clothRed} strokeWidth={10} opacity={0.6} />
        </g>

        {/* 街頭の人。全員が同じスピーカーを見上げる (視線をそろえる＝かしこまり) */}
        <Hito x={192} y={744} h={236} kind="chador" up={gaze} />
        <Hito x={296} y={752} h={244} kind="chador" up={gaze * 0.94} />
        <Hito x={392} y={740} h={226} kind="oldman" up={gaze} />
        <Hito x={1252} y={762} h={254} kind="shirt" up={gaze} />
        <Hito x={1356} y={752} h={238} kind="manto" up={gaze * 0.9} />
        <Hito x={1142} y={744} h={228} kind="veteran" up={gaze * 0.8} />

        {/* 父の肩に乗った男の子 */}
        <g>
          <Hito x={1012} y={1046} h={420} kind="father" up={gaze * 0.6} />
          <g transform={`translate(1012 744)`}>
            <path d={`M -40,0 L 40,0 L 32,-28 L -32,-28 Z`} fill="#394154" />
            <g transform="translate(0 -36)">
              <path d={`M -30,-82 L 30,-82 L 38,0 L -38,0 Z`} fill="#7A5E3E" />
              <path d={`M -30,-82 C -46,-60 -52,-30 -48,-6 M 30,-82 C 46,-60 52,-30 48,-6`} stroke="#7A5E3E" strokeWidth={14} fill="none" strokeLinecap="round" />
              <ellipse cx={0} cy={-118} rx={32} ry={37} fill={WP.skin} />
              <path d={`M -32,-124 C -28,-156 28,-156 32,-124 L 32,-138 C 24,-162 -24,-162 -32,-138 Z`} fill="#2A211B" />
              <ellipse cx={-12} cy={-124} rx={6} ry={5} fill="#F4EFE4" />
              <ellipse cx={12} cy={-124} rx={6} ry={5} fill="#F4EFE4" />
              <circle cx={-12} cy={-125} r={2.8} fill="#1A1410" />
              <circle cx={12} cy={-125} r={2.8} fill="#1A1410" />
              <path d={`M -19,-136 l 12,-2 M 19,-136 l -12,-2`} stroke="#241B14" strokeWidth={3} strokeLinecap="round" />
              <path d={`M -7,-102 C -1,-98 4,-98 8,-102`} stroke="#7A4A36" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* 鉢巻の若者。★事件 = 手にした小旗をゆっくり下ろす */}
        <g>
          <Hito x={760} y={1052} h={436} kind="basij" up={gaze * (1 - flagDown * 0.55)} />
          <g transform={`translate(818 786) rotate(${-52 + flagDown * 128})`}>
            <path d={`M 0,0 L 0,-186`} stroke="#8A6A3E" strokeWidth={7} strokeLinecap="round" />
            <path
              d={`M 0,-186 C 36,${-182 + Math.sin(f / 12) * 4} 72,-176 104,-184 L 104,-124 C 72,-116 36,-122 0,-128 Z`}
              fill={WP.iranGreen}
            />
            <path d={`M 0,-150 C 36,-144 72,-138 104,-146 L 104,-124 C 72,-116 36,-122 0,-128 Z`} fill={WP.iranRed} opacity={0.9} />
          </g>
        </g>

        {/* 号外 (停戦決議598)。手に持たせる */}
        <g transform={`translate(560 836) rotate(-9)`}>
          <rect x={0} y={0} width={210} height={150} fill={WP.paperWhite} />
          <rect x={0} y={0} width={210} height={150} fill="none" stroke="#B8B0A0" strokeWidth={2} />
          <text x={105} y={74} textAnchor="middle" fontFamily={SEKAI_SERIF} fontSize={62} fontWeight={700} fill={WP.ink}>
            598
          </text>
          <Nastaliq x={196} y={34} w={176} size={14} color={WP.ink} seed={21} />
          <Nastaliq x={196} y={110} w={176} size={13} color={WP.ink} seed={22} />
          <Nastaliq x={196} y={132} w={120} size={13} color={WP.ink} seed={23} />
          <path d={`M 14,118 C 70,140 150,140 200,120`} stroke={WP.skin} strokeWidth={22} fill="none" strokeLinecap="round" />
        </g>

        {/* 夕方の地面 ＋ 街路の水路 (ジュー) */}
        <rect x={-200} y={700} width={W + 400} height={60} fill={`url(#${u}-ground)`} />
        <rect x={-200} y={716} width={W + 400} height={16} fill={WP.juiMizu} opacity={0.75} />
        <rect x={-200} y={756} width={W + 400} height={330} fill="#241A1E" />
        <rect x={-200} y={756} width={W + 400} height={330} fill={WP.asphalt} opacity={0.6} />
      </Cam>

      {/* 夕日は右手から。物の右側だけ橙を足す (画面全体には掛けない) */}
      <rect x={1540} y={0} width={380} height={760} fill="#F0A463" opacity={0.08} />

      <YearTag year="一九八八" place="イラン" f={f} />
    </>
  );
};

// ===================================================================
// #12 山「そのとき読み上げられた言葉が、『私は、毒の杯を飲み干した』。」
// 受諾の声明は本人ではなく**ラジオで代読**された。だから本人の顔は出さない。
// 室内・明かりは天井の一灯だけ。主役は壁に掛かった本人の写真 (額の内寸 544x636)。
// 人は出さない。ラジオの前の座布団は空いたまま。
// 事件 = グラスの茶が最後の一口まで減る。杯は手に持たせない。
// ===================================================================
const S12: SekaiArt = ({ f }) => {
  const u = "b12";
  const tea = 1 - easeInOut(seg(f, 30, 130)); // ★事件。茶が減る
  const blink = Math.sin(f / 17) > 0.93 ? 1 : 0;
  const breathe = Math.sin(f / 30) * 3;

  return (
    <>
      <defs>
        <radialGradient id={`${u}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE6B2" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#D9A764" stopOpacity="0.3" />
          <stop offset="1" stopColor="#D9A764" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3630" />
          <stop offset="1" stopColor="#20242B" />
        </linearGradient>
        {/* 市民の濃紺の上着 */}
        <linearGradient id={`${u}-aba`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#1A2029" />
          <stop offset="0.55" stopColor="#2C3442" />
          <stop offset="1" stopColor="#171C24" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[-16, -10, 1.03]} to={[14, 6, 1.0]} start={0} end={160}>
        {/* 壁 ── 漆喰。明かりは天井の一灯だけ */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-wall)`} />
        <ellipse cx={1180} cy={120} rx={620} ry={480} fill={`url(#${u}-lamp)`} />
        {/* 天井の一灯 */}
        <path d={`M 1180,0 L 1180,78`} stroke="#1A1814" strokeWidth={6} />
        <path d={`M 1104,120 L 1256,120 L 1222,76 L 1138,76 Z`} fill="#241F18" />
        <ellipse cx={1180} cy={122} rx={34} ry={13} fill={WP.denkyuu} />
        <ellipse cx={1180} cy={128} rx={16} ry={18} fill={WP.denkyuu} opacity={0.9} />

        {/* 漆喰の剥がれ。下地が見える */}
        {[
          [250, 210, 150, 110],
          [430, 420, 108, 84],
          [1480, 330, 128, 96],
          [180, 560, 92, 70],
        ].map((b, i) => (
          <g key={`hg${i}`}>
            <path
              d={`M ${b[0]},${b[1]} l ${b[2] * 0.4},${-b[3] * 0.22} l ${b[2] * 0.26},${b[3] * 0.12} l ${b[2] * 0.34},${b[3] * 0.18}
                  l ${-b[2] * 0.12},${b[3] * 0.44} l ${-b[2] * 0.1},${b[3] * 0.36} l ${-b[2] * 0.4},${-b[3] * 0.06} l ${-b[2] * 0.3},${b[3] * 0.16} Z`}
              fill={WP.shikkuiHagare}
              opacity={0.3}
            />
            <path
              d={`M ${b[0] + b[2] * 0.4},${b[1] - b[3] * 0.22} l ${b[2] * 0.26},${b[3] * 0.12} l ${b[2] * 0.34},${b[3] * 0.18}`}
              fill="none"
              stroke="#4A423A"
              strokeWidth={2.5}
              opacity={0.5}
            />
          </g>
        ))}
        {/* 壁の上部に漆喰の残り */}
        <rect x={-200} y={0} width={W + 400} height={120} fill={WP.shikkui} opacity={0.1} />

        {/* 開いた書物と書見台 (奥・左) */}
        <g transform="translate(286 604)">
          <path d={`M -120,96 L 0,66 L 120,96 L 120,112 L 0,86 L -120,112 Z`} fill={WP.radioKigumi} />
          <path d={`M -14,66 L -14,170 M 14,66 L 14,170`} stroke="#4A3018" strokeWidth={10} />
          <path d={`M -124,60 L -4,30 L -4,74 L -124,100 Z`} fill={WP.paperAged} />
          <path d={`M 124,60 L 4,30 L 4,74 L 124,100 Z`} fill="#E8DABA" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={`pg${i}`}>
              <Nastaliq x={-16} y={46 + i * 10} w={96} size={8} color="#4A3A28" seed={30 + i} op={0.85} />
              <Nastaliq x={116} y={46 + i * 10} w={96} size={8} color="#4A3A28" seed={40 + i} op={0.85} />
            </g>
          ))}
          <path d={`M -4,30 L 4,30 L 4,74 L -4,74 Z`} fill="#C8B894" />
        </g>

        {/* 木枠のラジオ (声の出どころ) */}
        <g transform="translate(440 824)">
          <rect x={-150} y={-168} width={300} height={168} rx={10} fill={WP.radioKigumi} />
          <rect x={-150} y={-168} width={300} height={168} rx={10} fill="none" stroke="#3E2814" strokeWidth={5} />
          <rect x={-134} y={-154} width={176} height={116} rx={6} fill={WP.nunoSpeaker} />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={`gr${i}`} d={`M ${-130 + i * 13},-150 L ${-130 + i * 13},-42`} stroke="#4A3A24" strokeWidth={3} opacity={0.6} />
          ))}
          {/* 周波数の窓 */}
          <rect x={58} y={-152} width={78} height={42} rx={4} fill={WP.shinkuukan} opacity={0.5} />
          <rect x={58} y={-152} width={78} height={42} rx={4} fill="none" stroke={WP.brass} strokeWidth={3} />
          <path d={`M ${72 + ((f / 3) % 50)},-150 L ${72 + ((f / 3) % 50)},-114`} stroke={WP.inkRed} strokeWidth={3} />
          {/* つまみ */}
          <circle cx={78} cy={-62} r={21} fill="#2A2420" />
          <circle cx={78} cy={-62} r={21} fill="none" stroke={WP.brass} strokeWidth={3} />
          <path d={`M 78,-62 l 0,-15`} stroke={WP.brass} strokeWidth={4} transform={`rotate(${28 + Math.sin(f / 40) * 6} 78 -62)`} />
          <circle cx={122} cy={-62} r={14} fill="#2A2420" />
          <circle cx={122} cy={-62} r={14} fill="none" stroke={WP.brass} strokeWidth={2.5} />
          {/* 音の揺れ (読み上げが続いている) */}
          {[0, 1, 2].map((i) => (
            <ellipse
              key={`sr${i}`}
              cx={-46}
              cy={-96}
              rx={60 + ((f * 1.4 + i * 36) % 110)}
              ry={46 + ((f * 1.1 + i * 36) % 86)}
              fill="none"
              stroke={WP.denkyuu}
              strokeWidth={2.4}
              opacity={0.3 - ((f * 1.4 + i * 36) % 110) / 400}
            />
          ))}
        </g>

        {/* ペルシア絨毯 (幾何学の赤と紺) */}
        <g>
          <path d={`M -200,860 L ${W + 200},860 L ${W + 200},1080 L -200,1080 Z`} fill={WP.karpetAka} />
          <path d={`M -200,860 L ${W + 200},860 L ${W + 200},896 L -200,896 Z`} fill={WP.karpetKon} />
          <path d={`M -200,1040 L ${W + 200},1040 L ${W + 200},1080 L -200,1080 Z`} fill={WP.karpetKon} />
          {Array.from({ length: 16 }).map((_, i) => (
            <g key={`kp${i}`} transform={`translate(${-160 + i * 132} 960)`}>
              <path d={`M 0,-44 L 40,0 L 0,44 L -40,0 Z`} fill={WP.karpetKon} />
              <path d={`M 0,-24 L 22,0 L 0,24 L -22,0 Z`} fill={WP.karpetKinari} />
              <path d={`M 0,-10 L 10,0 L 0,10 L -10,0 Z`} fill={WP.karpetAka} />
              <path d={`M -62,-40 l 0,80 M 62,-40 l 0,80`} stroke={WP.karpetKinari} strokeWidth={3} opacity={0.6} />
            </g>
          ))}
          {/* 房 */}
          {Array.from({ length: 40 }).map((_, i) => (
            <path key={`fz${i}`} d={`M ${-180 + i * 52},1080 l 0,-14`} stroke={WP.karpetKinari} strokeWidth={3} opacity={0.5} />
          ))}
        </g>

        {/* 床に置いた真鍮の盆 ＋ エステカン (チャイグラス)。★事件 = 茶が減る */}
        <g transform="translate(1640 872)">
          <ellipse cx={0} cy={44} rx={168} ry={44} fill="#1A1410" opacity={0.45} />
          <ellipse cx={0} cy={26} rx={160} ry={42} fill={WP.shinchuuKage} />
          <ellipse cx={0} cy={18} rx={160} ry={42} fill={WP.brass} />
          <ellipse cx={0} cy={16} rx={134} ry={34} fill="#E8D28A" opacity={0.55} />
          {/* 盆の彫り */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <ellipse key={`en${i}`} cx={Math.cos(a) * 104} cy={16 + Math.sin(a) * 26} rx={13} ry={5} fill={WP.shinchuuKage} opacity={0.65} />
            );
          })}
          {/* チューリップ形のエステカン */}
          <g transform="translate(-16 -58)">
            <path d={`M -30,0 C -36,-30 -26,-66 -20,-82 L 20,-82 C 26,-66 36,-30 30,0 Z`} fill="#C8DCE2" opacity={0.3} />
            <path
              d={`M ${-29 + 9 * (1 - tea)},${-4 - 78 * (1 - tea) + 78} C ${-34 + 9 * (1 - tea)},-30 ${-26 + 6 * (1 - tea)},-66 ${-20 + 5 * (1 - tea)},-78
                  L ${20 - 5 * (1 - tea)},-78 C ${26 - 6 * (1 - tea)},-66 ${34 - 9 * (1 - tea)},-30 ${29 - 9 * (1 - tea)},-4 Z`}
              fill={WP.chai}
              opacity={0.92}
              transform={`translate(0 ${-74 * (1 - tea) * 0})`}
            />
            {/* 残りの量を面で出す */}
            <path d={`M -30,0 L 30,0 L 30,${-76 * tea} L -30,${-76 * tea} Z`} fill={WP.chai} opacity={tea > 0.02 ? 0.95 : 0} />
            <path d={`M -30,${-76 * tea} C -10,${-80 * tea} 10,${-72 * tea} 30,${-76 * tea}`} stroke="#D98A3E" strokeWidth={3} fill="none" opacity={tea > 0.02 ? 1 : 0} />
            <path d={`M -30,0 C -36,-30 -26,-66 -20,-82 L 20,-82 C 26,-66 36,-30 30,0 Z`} fill="none" stroke="#DCEAEE" strokeWidth={3.4} opacity={0.75} />
            <path d={`M -16,-16 C -20,-44 -14,-66 -10,-78`} stroke="#F2FAFC" strokeWidth={4} fill="none" opacity={0.6} />
            <ellipse cx={0} cy={2} rx={30} ry={8} fill={WP.brass} />
          </g>
          {/* 角砂糖と小さじ */}
          <rect x={56} y={-24} width={22} height={16} fill="#F0ECE0" />
          <rect x={80} y={-18} width={20} height={14} fill="#E2DED2" />
          <path d={`M 44,2 L 112,-14`} stroke={WP.steelLit} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={120} cy={-16} rx={14} ry={9} fill={WP.steelLit} transform="rotate(-14 120 -16)" />
        </g>

        {/* 壁の額に入ったホメイニ師の写真。1988年のテヘランの家にはこれが掛かっていた。
            受諾の声明は本人ではなくラジオで代読された。だから「声」はラジオから来て、
            本人はこの額の中で黙っている。
            ★実在の人物だけは写真を使う (似顔絵にはしない) */}
        <g transform={`translate(1128 ${524 + breathe * 0.4})`}>
          {/* 壁に落ちる額の影 (一灯が左上にあるので右下へ) */}
          <path d={`M -300,-346 L 352,-346 L 376,376 L -276,376 Z`} fill="#15120E" opacity={0.5} />
          {/* 真鍮の額縁 */}
          <rect x={-324} y={-370} width={648} height={740} rx={5} fill={WP.shinchuuKage} />
          <rect x={-314} y={-360} width={628} height={720} rx={4} fill={WP.brass} />
          {/* 額縁の彫り */}
          <rect x={-304} y={-350} width={608} height={700} rx={3} fill="none" stroke="#E8D28A" strokeWidth={4} opacity={0.6} />
          <rect x={-290} y={-336} width={580} height={672} rx={3} fill="none" stroke="#5E4620" strokeWidth={5} />
          {/* 台紙 */}
          <rect x={-282} y={-328} width={564} height={656} fill="#1C1814" />
          <defs>
            <clipPath id={`${u}-pc`}>
              <rect x={-272} y={-318} width={544} height={636} />
            </clipPath>
          </defs>
          <SekaiPhoto name="homeini" x={-272} y={-318} w={544} h={636} clipId={`${u}-pc`} />
          {/* 写真の下の縁に落ちる額の内影 */}
          <rect x={-272} y={-318} width={544} height={636} fill="none" stroke="#0E0C0A" strokeWidth={14} opacity={0.4} clipPath={`url(#${u}-pc)`} />
          {/* ガラスの反射。一灯の光が斜めに走る (写真を貼っただけに見せない) */}
          <path d={`M -272,160 L 76,-318 L 272,-318 L -272,318 Z`} fill="#FFE6B2" opacity={0.08} clipPath={`url(#${u}-pc)`} />
          <path d={`M -272,-318 L -148,-318 L -272,-146 Z`} fill="#FFF4D8" opacity={0.06} clipPath={`url(#${u}-pc)`} />
          {/* 額を吊る紐と釘 */}
          <path d={`M -2,-370 L -108,-460 M -2,-370 L 104,-460`} stroke="#4A3C28" strokeWidth={5} fill="none" />
          <circle cx={-2} cy={-466} r={8} fill={WP.shinchuuKage} />
        </g>

        {/* 誰も座っていない座布団 (ポシュティ)。ラジオの正面に空けてある */}
        <g transform="translate(636 894) scale(0.74)">
          <ellipse cx={0} cy={66} rx={210} ry={52} fill="#1A1410" opacity={0.4} />
          <path d={`M -196,34 C -204,-18 -150,-48 -88,-52 L 92,-52 C 158,-48 206,-16 198,34
                    C 190,72 108,90 0,90 C -108,90 -188,72 -196,34 Z`} fill={WP.karpetKon} />
          <path d={`M -186,22 C -176,-12 -124,-34 -60,-36 L 76,-36 C 142,-34 186,-10 184,22
                    C 182,48 104,62 0,62 C -104,62 -184,48 -186,22 Z`} fill="#2E3C58" />
          {/* 布の房と縫い目 */}
          <path d={`M -150,-8 C -70,10 70,10 150,-8`} stroke={WP.karpetKinari} strokeWidth={4} fill="none" opacity={0.5} />
          {[-150, -90, -30, 30, 90, 150].map((x, i) => (
            <path key={`fs${i}`} d={`M ${x},58 l 0,22`} stroke={WP.karpetKinari} strokeWidth={4} opacity={0.45} />
          ))}
          {/* 座った跡のくぼみ。誰もいないのに へこんだまま */}
          <ellipse cx={-10} cy={12} rx={92} ry={26} fill="#222C40" opacity={0.75} />
        </g>


        {/* 一灯の光は額の上半分にだけ落ちる (画面全体には掛けない) */}
        <ellipse cx={1090} cy={300} rx={450} ry={330} fill="#FFE6B2" opacity={0.07} />
      </Cam>

      <YearTag year="一九八八" place="テヘラン" f={f} />
    </>
  );
};

// ===================================================================
// #13 図「一番強気だった人が、最後に負けを引き受けてる……」(反応・通知カードが出る)
// 通知カードが本文を見せるので、絵は静かで具体にする。記者の机の手元に寄る。
// 事件 = ペン先が2つの名前を1本の線で結ぶ。
// ===================================================================
const S13: SekaiArt = ({ f }) => {
  const u = "b13";
  const draw = easeInOut(seg(f, 34, 112)); // ★事件。1本の線が伸びる
  const penIn = easeOut(seg(f, 6, 34));
  // 結ぶ線は「ホメイニ」(左上) → 「玉音放送」(右下)
  const ax = 486;
  const ay = 452;
  const bx = 1216;
  const by = 714;
  const px = ax + (bx - ax) * draw;
  const py = ay + (by - ay) * draw + Math.sin(draw * Math.PI) * -46;

  return (
    <>
      <defs>
        <linearGradient id={`${u}-desk`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#6E4A28" />
          <stop offset="1" stopColor="#3A2614" />
        </linearGradient>
        <radialGradient id={`${u}-lamp`} cx="0.3" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#FFF0CE" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFF0CE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-pen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2A2E36" />
          <stop offset="0.5" stopColor="#5E6672" />
          <stop offset="1" stopColor="#23262C" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[18, 12, 1.06]} to={[-10, -6, 1.0]} start={0} end={150}>
        {/* 机 ── 木目。寄っているので板目の筋まで見える */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-desk)`} />
        {Array.from({ length: 22 }).map((_, i) => {
          const y0 = -30 + i * 54;
          return (
            <path
              key={`mk${i}`}
              d={`M -200,${y0} C 420,${y0 + 18 + rnd(5, i) * 26} 1200,${y0 - 14 - rnd(9, i) * 22} ${W + 200},${y0 + 10}`}
              stroke={WP.mokumeSuji}
              strokeWidth={2 + rnd(2, i) * 3}
              fill="none"
              opacity={0.45}
            />
          );
        })}
        {/* 節 */}
        <ellipse cx={1660} cy={238} rx={46} ry={22} fill={WP.mokumeSuji} opacity={0.5} />
        <ellipse cx={1660} cy={238} rx={22} ry={10} fill="#2E1C0E" opacity={0.5} />

        {/* 積んだ資料のコピー (左奥・斜めに崩れている) */}
        <g transform="translate(176 190) rotate(-7)">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={`cp${i}`} transform={`translate(${i * 7} ${-i * 9}) rotate(${(rnd(3, i) - 0.5) * 5})`}>
              <rect x={0} y={0} width={440} height={300} fill={i % 2 ? "#E6E0D0" : WP.paperWhite} />
              <rect x={0} y={0} width={440} height={300} fill="none" stroke="#B2AA98" strokeWidth={2} />
            </g>
          ))}
          {/* 一番上のコピーに本文の行と、蛍光ペンの線 */}
          <g transform="translate(42 -45)">
            {Array.from({ length: 11 }).map((_, i) => (
              <path key={`ln${i}`} d={`M 20,${56 + i * 22} L ${360 - rnd(7, i) * 90},${56 + i * 22}`} stroke="#6E6658" strokeWidth={4} opacity={0.75} />
            ))}
            <rect x={18} y={122} width={250} height={20} fill={WP.keikouPen} opacity={0.55} />
            <rect x={18} y={210} width={178} height={20} fill={WP.keikouPen} opacity={0.55} />
            <Nastaliq x={356} y={30} w={200} size={13} color="#5A5248" seed={51} op={0.7} />
          </g>
        </g>

        {/* ノートPCの端 (右上に見切れる) */}
        <g transform="translate(1448 -120)">
          <rect x={0} y={0} width={620} height={380} rx={16} fill={WP.stainlessDark} />
          <rect x={14} y={14} width={592} height={352} rx={10} fill="#1A1E24" />
          <rect x={28} y={28} width={564} height={324} rx={6} fill={WP.screenBlue} opacity={0.65} />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={`sl${i}`} x={52} y={56 + i * 32} width={330 - rnd(11, i) * 180} height={12} fill={WP.screenLit} opacity={0.4} />
          ))}
          <rect x={0} y={376} width={620} height={26} rx={8} fill={WP.stainless} />
          <rect x={250} y={382} width={120} height={8} rx={4} fill={WP.stainlessDark} />
        </g>

        {/* 開いたノート (日本語の走り書き・矢印・「ホメイニ」「玉音放送」) */}
        <g transform="translate(300 300) rotate(2)">
          {/* 下敷きの影 */}
          <rect x={16} y={24} width={1240} height={620} rx={6} fill="#20140A" opacity={0.5} />
          {/* 左ページ */}
          <rect x={0} y={0} width={620} height={620} fill="#F4EFE0" />
          {/* 右ページ */}
          <rect x={620} y={0} width={620} height={620} fill="#EFEADB" />
          {/* 綴じ */}
          <rect x={606} y={0} width={28} height={620} fill="#DED6C4" />
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={`ri${i}`}>
              <circle cx={620} cy={44 + i * 68} r={11} fill="#C4BCA8" />
              <circle cx={620} cy={44 + i * 68} r={11} fill="none" stroke={WP.steelDark} strokeWidth={3} />
            </g>
          ))}
          {/* 青い罫線 */}
          {Array.from({ length: 17 }).map((_, i) => (
            <path key={`kl${i}`} d={`M 36,${52 + i * 34} L 586,${52 + i * 34} M 656,${52 + i * 34} L 1204,${52 + i * 34}`} stroke={WP.noteKeisen} strokeWidth={2} opacity={0.45} />
          ))}
          {/* 走り書き (文字の形はしないが、筆の勢いは出す) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const yy = 52 + i * 34 - 8;
            if (i === 4 || i === 11) return null;
            return (
              <path
                key={`sc${i}`}
                d={`M 44,${yy} c ${18 + rnd(13, i) * 12},-10 ${30},14 ${48},2 c 18,-12 30,10 48,0 c 16,-10 28,12 44,2 c ${20},-12 ${40 + rnd(17, i) * 60},10 ${60 + rnd(19, i) * 90},0`}
                stroke="#2E3240"
                strokeWidth={3.2}
                fill="none"
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={`sr${i}`}
              d={`M 664,${120 + i * 34} c 20,-10 32,12 50,2 c 18,-10 30,10 48,0 c ${18},-10 ${40 + rnd(23, i) * 70},12 ${70 + rnd(29, i) * 110},2`}
              stroke="#2E3240"
              strokeWidth={3.2}
              fill="none"
              strokeLinecap="round"
              opacity={0.8}
            />
          ))}
          {/* 矢印 2本 */}
          <path d={`M 120,470 C 220,430 300,440 376,420`} stroke="#2E3240" strokeWidth={4} fill="none" />
          <path d={`M 376,420 l -22,-4 l 10,16 Z`} fill="#2E3240" />
          <path d={`M 880,250 C 940,290 960,330 950,380`} stroke="#2E3240" strokeWidth={4} fill="none" />
          <path d={`M 950,380 l -12,-18 l 20,2 Z`} fill="#2E3240" />
          {/* 2つの名前。ここを1本の線で結ぶ */}
          <text x={186} y={162} fontFamily={SEKAI_SERIF} fontSize={54} fontWeight={700} fill={WP.ink}>
            ホメイニ
          </text>
          <rect x={178} y={176} width={226} height={6} fill={WP.inkRed} opacity={0.8} />
          <text x={740} y={430} fontFamily={SEKAI_SERIF} fontSize={54} fontWeight={700} fill={WP.ink}>
            玉音放送
          </text>
          <rect x={732} y={444} width={226} height={6} fill={WP.inkRed} opacity={0.8} />
          <text x={186} y={562} fontFamily={SEKAI_SERIF} fontSize={30} fill="#4A4438">
            1988.7 / 1945.8
          </text>
        </g>

        {/* ★事件 = ペン先が2つの名前を1本の線で結ぶ */}
        <path
          d={`M ${ax},${ay} Q ${(ax + bx) / 2},${(ay + by) / 2 - 92} ${px},${py}`}
          stroke={WP.inkRed}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          opacity={draw > 0.01 ? 0.95 : 0}
        />
        {draw > 0.98 ? (
          <path d={`M ${bx},${by} l -20,-14 l 4,20 Z`} fill={WP.inkRed} />
        ) : null}

        {/* ボールペン (手元。指は入れないが、ペンは人が持っている角度で置く) */}
        <g transform={`translate(${px} ${py}) rotate(${34 - draw * 10}) translate(0 ${18 - penIn * 18})`}>
          <path d={`M 0,0 l 7,-26 l 13,0 l 6,26 Z`} fill={WP.steelDark} />
          <path d={`M 7,-26 L 20,-26 L 30,-250 L 2,-250 Z`} fill={`url(#${u}-pen)`} />
          <path d={`M 2,-250 L 30,-250 L 32,-300 L 0,-300 Z`} fill="#15181C" />
          <rect x={26} y={-232} width={9} height={78} rx={4} fill={WP.steelLit} />
          <path d={`M 10,-120 L 22,-120`} stroke={WP.brass} strokeWidth={5} />
          <path d={`M 11,-1 l 5,-9 l 4,9 Z`} fill={WP.inkRed} />
        </g>

        {/* 冷めたコーヒー (湯気が立っていない＝冷めている) */}
        <g transform="translate(1636 790)">
          <ellipse cx={0} cy={118} rx={160} ry={40} fill="#1E1208" opacity={0.5} />
          <ellipse cx={0} cy={92} rx={140} ry={38} fill="#E8E2D4" />
          <path d={`M -140,92 C -138,-6 -130,-66 -120,-96 L 120,-96 C 130,-66 138,-6 140,92 Z`} fill="#F2EEE2" />
          <path d={`M -120,-96 L 120,-96 C 128,-70 132,-40 134,-10 L -134,-10 C -132,-40 -128,-70 -120,-96 Z`} fill="#E4DECE" />
          <ellipse cx={0} cy={-96} rx={120} ry={34} fill="#CFC8B8" />
          <ellipse cx={0} cy={-92} rx={104} ry={28} fill={WP.coffeeSame} />
          <ellipse cx={-30} cy={-96} rx={36} ry={10} fill="#5A3A22" opacity={0.6} />
          {/* 表面に浮いた膜 (冷めた証拠) */}
          <path d={`M -70,-98 C -30,-106 30,-106 68,-96`} stroke="#6E4A2E" strokeWidth={4} fill="none" opacity={0.7} />
          {/* 取っ手 */}
          <path d={`M 136,-50 C 196,-56 200,24 134,34`} stroke="#F2EEE2" strokeWidth={24} fill="none" />
          {/* 輪染み */}
          <ellipse cx={-20} cy={126} rx={150} ry={34} fill="none" stroke="#2E1C0E" strokeWidth={5} opacity={0.35} />
        </g>

        {/* 蛍光ペン本体 (転がっている) */}
        <g transform="translate(980 920) rotate(-80)">
          <rect x={0} y={0} width={44} height={214} rx={16} fill={WP.keikouPen} />
          <rect x={0} y={0} width={44} height={56} rx={16} fill="#C8C230" />
          <path d={`M 10,214 l 24,0 l -4,36 l -16,0 Z`} fill="#E8E24A" />
          <rect x={6} y={74} width={32} height={96} rx={6} fill="#F4F09A" opacity={0.7} />
        </g>

        {/* 机の上の明かりは左上から。全体には掛けない */}
        <ellipse cx={420} cy={120} rx={760} ry={520} fill={`url(#${u}-lamp)`} />
      </Cam>
    </>
  );
};

// ===================================================================
// #14 並「そうです。戦争は、負ける側の誰かが『ここでやめる』と言わなければ、終わりません。」
// 真横。綱の中央の結び目に寄る。片側は国民服の袖、もう片側はカーキの袖。
// 事件 = 片側が手を離す。綱がたわみ、離した側の指が開く。
// ===================================================================
const S14: SekaiArt = ({ f }) => {
  const u = "b14";
  const pull = easeInOut(seg(f, 0, 40)); // 最初は張っている
  const letgo = easeOut(seg(f, 64, 128)); // ★事件。右が離す
  const open = easeOut(seg(f, 72, 118)); // 指が開く
  const sag = letgo * 118; // 綱のたわみ
  const knotY = 560 + sag;

  // 3本撚りの麻縄。撚りの筋を1本ずつ描く
  const Nawa: React.FC<{ x0: number; x1: number; y0: number; y1: number; r: number; seed: number }> = ({
    x0,
    x1,
    y0,
    y1,
    r,
    seed,
  }) => {
    const n = Math.max(6, Math.round(Math.abs(x1 - x0) / 34));
    const strands: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const t0 = i / n;
      const t1 = (i + 1) / n;
      const gx0 = x0 + (x1 - x0) * t0;
      const gx1 = x0 + (x1 - x0) * t1;
      const gy0 = y0 + (y1 - y0) * t0 * t0;
      const gy1 = y0 + (y1 - y0) * t1 * t1;
      strands.push(
        <path
          key={`s${i}`}
          d={`M ${gx0},${gy0 - r} C ${gx0 + (gx1 - gx0) * 0.5},${gy0 - r * 0.2} ${gx0 + (gx1 - gx0) * 0.5},${gy1 + r * 0.2} ${gx1},${gy1 + r}`}
          stroke="#8A7450"
          strokeWidth={r * 0.52}
          fill="none"
          strokeLinecap="round"
        />,
      );
      strands.push(
        <path
          key={`l${i}`}
          d={`M ${gx0},${gy0 - r * 0.5} C ${gx0 + (gx1 - gx0) * 0.45},${gy0 - r * 0.1} ${gx0 + (gx1 - gx0) * 0.55},${gy1 + r * 0.1} ${gx1},${gy1 + r * 0.5}`}
          stroke="#E2CFA2"
          strokeWidth={r * 0.3}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />,
      );
      // ほつれた繊維
      if (rnd(seed, i) > 0.72) {
        strands.push(
          <path
            key={`h${i}`}
            d={`M ${gx0 + 8},${gy0 - r * 0.6} c 10,${-r * 0.5} 22,${-r * 0.7} 30,${-r * 0.3}`}
            stroke="#CBB68C"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            opacity={0.8}
          />,
        );
      }
    }
    return (
      <g>
        <path
          d={`M ${x0},${y0} Q ${(x0 + x1) / 2},${y0 + (y1 - y0) * 1.3} ${x1},${y1}`}
          stroke="#6B5E49"
          strokeWidth={r * 2.1}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${x0},${y0} Q ${(x0 + x1) / 2},${y0 + (y1 - y0) * 1.3} ${x1},${y1}`}
          stroke="#CBB68C"
          strokeWidth={r * 1.7}
          fill="none"
          strokeLinecap="round"
        />
        {strands}
      </g>
    );
  };

  return (
    <>
      <defs>
        <linearGradient id={`${u}-air`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E6A72" />
          <stop offset="0.68" stopColor="#8E8470" />
          <stop offset="1" stopColor="#6E5E44" />
        </linearGradient>
        <linearGradient id={`${u}-tsuchi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9A7E58" />
          <stop offset="1" stopColor="#4E3C26" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[0, 0, 1.0]} to={[0, -16, 1.12]} start={0} end={150}>
        {/* 真横。奥は霞む空気、下は土と砂利 */}
        <rect x={-200} y={0} width={W + 400} height={760} fill={`url(#${u}-air)`} />
        <rect x={-200} y={760} width={W + 400} height={320} fill={`url(#${u}-tsuchi)`} />
        {/* 土の起伏 */}
        <path d={`M -200,764 C 300,748 700,776 1100,760 C 1400,748 1700,772 ${W + 200},758 L ${W + 200},800 L -200,800 Z`} fill="#7E6442" />
        {/* 砂利 */}
        {Array.from({ length: 150 }).map((_, i) => {
          const gx = -180 + rnd(31, i) * (W + 360);
          const gy = 782 + rnd(37, i) * 290;
          const gr = 3 + rnd(41, i) * 11;
          return (
            <g key={`g${i}`}>
              <ellipse cx={gx} cy={gy} rx={gr} ry={gr * 0.66} fill={rnd(43, i) > 0.5 ? "#B2A082" : "#8A7658"} />
              <ellipse cx={gx - gr * 0.3} cy={gy - gr * 0.25} rx={gr * 0.5} ry={gr * 0.3} fill="#D2C4A6" opacity={0.6} />
            </g>
          );
        })}
        {/* 踏み荒らされた土の筋 */}
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={`sj${i}`}
            d={`M ${-120 + i * 230},${840 + rnd(47, i) * 120} c 60,${10 + rnd(53, i) * 20} 130,${-14 - rnd(59, i) * 20} 190,4`}
            stroke="#3E2E1C"
            strokeWidth={6}
            fill="none"
            opacity={0.35}
          />
        ))}

        {/* 綱 ── 左から入り、中央の結び目で合わさり、右へ抜ける */}
        <Nawa x0={-200} x1={880} y0={498 - pull * 8} y1={knotY} r={42} seed={61} />
        <Nawa x0={1980} x1={1040} y0={498 - pull * 8 + letgo * 150} y1={knotY} r={42} seed={67} />

        {/* 中央の結び目。3本撚りが交差して団子になる */}
        <g transform={`translate(960 ${knotY})`}>
          <ellipse cx={0} cy={0} rx={128} ry={92} fill="#6B5E49" />
          <ellipse cx={0} cy={-6} rx={122} ry={86} fill="#CBB68C" />
          {/* 交差する撚りの束 */}
          {[-1, 1].map((d) => (
            <g key={`kn${d}`}>
              <path
                d={`M ${d * 120},${-40} C ${d * 40},${-70} ${-d * 40},${40} ${-d * 118},${18}`}
                stroke="#8A7450"
                strokeWidth={44}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M ${d * 120},${-40} C ${d * 40},${-70} ${-d * 40},${40} ${-d * 118},${18}`}
                stroke="#E2CFA2"
                strokeWidth={30}
                fill="none"
                strokeLinecap="round"
                opacity={0.9}
              />
            </g>
          ))}
          {/* 結び目から飛び出したほつれ */}
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return (
              <path
                key={`fz${i}`}
                d={`M ${Math.cos(a) * 112},${Math.sin(a) * 76} l ${Math.cos(a) * (18 + rnd(71, i) * 26)},${Math.sin(a) * (14 + rnd(73, i) * 20)}`}
                stroke="#CBB68C"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
          {/* 結び目の締まり */}
          <path d={`M -56,-56 C -20,-26 20,-26 56,-56`} stroke="#6B5E49" strokeWidth={9} fill="none" opacity={0.7} />
          <path d={`M -56,46 C -20,16 20,16 56,46`} stroke="#6B5E49" strokeWidth={9} fill="none" opacity={0.7} />
        </g>

        {/* 左 = 国民服の袖。まだ握っている。手の豆とマメの皮 */}
        <g transform={`translate(560 ${496 - pull * 8 + sag * 0.35})`}>
          {/* 袖 */}
          <path d={`M -480,-128 L 60,-96 L 70,96 L -480,128 Z`} fill={WP.kokuminFuku} />
          <path d={`M -480,-128 L 60,-96 L 56,-54 L -480,-80 Z`} fill={WP.kokuminFukuLit} />
          <path d={`M -480,100 L 66,66 L 70,96 L -480,128 Z`} fill={WP.kokuminFukuDark} />
          {/* 袖口の折り返し */}
          <path d={`M 30,-98 L 62,-96 L 72,96 L 40,96 Z`} fill={WP.kokuminFukuDark} />
          <path d={`M 34,-96 C 46,-30 48,30 42,92`} stroke={WP.kokuminFukuLit} strokeWidth={6} fill="none" opacity={0.6} />
          {/* 手 */}
          <path d={`M 56,-92 C 150,-104 236,-70 258,-10 C 274,52 232,98 150,100 L 58,96 Z`} fill={WP.skin} />
          {/* 指が綱を握る (4本＋親指) */}
          {[0, 1, 2, 3].map((i) => (
            <g key={`fg${i}`}>
              <path
                d={`M ${196 + i * 6},${-66 + i * 42} C ${264 + i * 4},${-74 + i * 42} ${298},${-46 + i * 42} ${282},${-12 + i * 42}
                    C ${268},${16 + i * 42} ${216},${10 + i * 42} ${194},${-18 + i * 42} Z`}
                fill={WP.skin}
              />
              <path
                d={`M ${226 + i * 6},${-58 + i * 42} C ${272 + i * 4},${-58 + i * 42} ${288},${-38 + i * 42} ${278},${-18 + i * 42}`}
                stroke={WP.skinShade}
                strokeWidth={4}
                fill="none"
                opacity={0.8}
              />
            </g>
          ))}
          <path d={`M 120,86 C 190,118 248,106 262,70 C 270,48 250,34 226,42 L 140,66 Z`} fill={WP.skin} />
          {/* 手の豆とマメの皮 */}
          <ellipse cx={176} cy={-30} rx={17} ry={11} fill="#E8C49A" />
          <ellipse cx={176} cy={-30} rx={17} ry={11} fill="none" stroke="#A8724A" strokeWidth={2.6} />
          <ellipse cx={204} cy={16} rx={14} ry={9} fill="#E8C49A" />
          <ellipse cx={204} cy={16} rx={14} ry={9} fill="none" stroke="#A8724A" strokeWidth={2.4} />
          <path d={`M 150,-56 c 14,-10 30,-8 40,2 c -16,10 -30,8 -40,-2 Z`} fill="#F0DCC2" />
          <path d={`M 126,10 C 150,22 172,24 190,18`} stroke={WP.skinShade} strokeWidth={4} fill="none" opacity={0.7} />
          <path d={`M 120,-40 C 140,-28 152,-10 152,10`} stroke={WP.skinShade} strokeWidth={4} fill="none" opacity={0.5} />
        </g>

        {/* 右 = カーキの袖。★事件 = 手を離す。指が開く */}
        <g transform={`translate(1372 ${496 - pull * 8 + letgo * 150 + sag * 0.35}) translate(${letgo * 86} ${-letgo * 44})`}>
          <path d={`M 480,-128 L -60,-96 L -70,96 L 480,128 Z`} fill={WP.fieldJacket} />
          <path d={`M 480,-128 L -60,-96 L -56,-54 L 480,-80 Z`} fill="#8C8C62" />
          <path d={`M 480,100 L -66,66 L -70,96 L 480,128 Z`} fill="#4E4E34" />
          <path d={`M -30,-98 L -62,-96 L -72,96 L -40,96 Z`} fill="#4E4E34" />
          {/* ボタンどめの袖口 */}
          <circle cx={-16} cy={-52} r={9} fill={WP.brass} />
          <circle cx={-16} cy={-52} r={9} fill="none" stroke="#6E4E14" strokeWidth={2} />
          {/* 手の甲 */}
          <path d={`M -56,-92 C -150,-104 -244,-66 -262,-4 C -276,56 -232,98 -150,100 L -58,96 Z`} fill={WP.skin} />
          {/* 開いた指 (離した証拠) */}
          {[0, 1, 2, 3].map((i) => {
            const base = -200 - i * 6;
            const ang = -(18 + i * 9) * open;
            return (
              <g key={`of${i}`} transform={`rotate(${ang} ${base} ${-56 + i * 42})`}>
                <path
                  d={`M ${base},${-66 + i * 42} C ${base - 72},${-78 + i * 42} ${base - 112},${-52 + i * 42} ${base - 98},${-16 + i * 42}
                      C ${base - 84},${16 + i * 42} ${base - 24},${10 + i * 42} ${base - 2},${-18 + i * 42} Z`}
                  fill={WP.skin}
                />
                <path
                  d={`M ${base - 34},${-58 + i * 42} C ${base - 80},${-58 + i * 42} ${base - 96},${-36 + i * 42} ${base - 88},${-16 + i * 42}`}
                  stroke={WP.skinShade}
                  strokeWidth={4}
                  fill="none"
                  opacity={0.8}
                />
                {/* 爪 */}
                <ellipse cx={base - 94} cy={-40 + i * 42} rx={11} ry={8} fill="#F0D6B8" opacity={0.9} />
              </g>
            );
          })}
          {/* 親指も開く */}
          <g transform={`rotate(${26 * open} -120 86)`}>
            <path d={`M -120,86 C -190,122 -252,108 -266,70 C -274,46 -252,32 -228,42 L -140,66 Z`} fill={WP.skin} />
          </g>
          <ellipse cx={-180} cy={-24} rx={16} ry={10} fill="#E8C49A" />
          <ellipse cx={-180} cy={-24} rx={16} ry={10} fill="none" stroke="#A8724A" strokeWidth={2.4} />
          <path d={`M -126,8 C -150,22 -174,24 -192,16`} stroke={WP.skinShade} strokeWidth={4} fill="none" opacity={0.7} />
        </g>

        {/* 綱が離れて落ちた側の、地面に当たる影 */}
        <ellipse cx={1500} cy={892} rx={340} ry={28} fill="#2E2214" opacity={0.3 * letgo} />
      </Cam>
    </>
  );
};

// ===================================================================
// #15 図「そして2026年。」
// 真上。#9 の暦と同じ型にして、時代が進んだことを形でそろえる。人は出さない。
// 事件 = 朱の糸が #9 から続いて 2026年2月のマスに止まる。
// ===================================================================
const S15: SekaiArt = ({ f }) => {
  const u = "b15";
  const ito = easeInOut(seg(f, 8, 96)); // 朱の糸が伸びる
  const mark = easeOut(seg(f, 100, 134)); // 日付に丸が付く
  // 2026年2月は1日が日曜。28日ちょうど4週
  const cal0x = 548;
  const cal0y = 352;
  const cw = 118;
  const ch = 104;

  // ペルシア暦の数字 ۱۴۰۴
  const PNum: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round">
      {/* ۱ */}
      <path d="M 0,0 L 0,-46" />
      {/* ۴ */}
      <path d="M 44,-46 C 28,-40 24,-18 40,-14 C 56,-10 62,-26 52,-34 L 52,0" />
      {/* ۰ (点) */}
      <path d="M 86,-10 l 9,0" strokeWidth={12} />
      {/* ۴ */}
      <path d="M 134,-46 C 118,-40 114,-18 130,-14 C 146,-10 152,-26 142,-34 L 142,0" />
    </g>
  );

  return (
    <>
      <defs>
        <linearGradient id={`${u}-desk`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={WP.mokumeTsukue} />
          <stop offset="0.55" stopColor="#7E5632" />
          <stop offset="1" stopColor="#4A2E18" />
        </linearGradient>
        <radialGradient id={`${u}-top`} cx="0.5" cy="0.34" r="0.66">
          <stop offset="0" stopColor="#FFF4DA" stopOpacity="0.4" />
          <stop offset="1" stopColor="#FFF4DA" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Cam f={f} from={[0, -14, 1.07]} to={[6, 10, 1.0]} start={0} end={160}>
        {/* 真上から見た机。木目は縦に走る */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-desk)`} />
        {Array.from({ length: 26 }).map((_, i) => {
          const x0 = -180 + i * 84;
          return (
            <path
              key={`mg${i}`}
              d={`M ${x0},0 C ${x0 + 22 + rnd(81, i) * 26},300 ${x0 - 18 - rnd(83, i) * 22},760 ${x0 + 12},1080`}
              stroke={WP.mokumeSuji}
              strokeWidth={2 + rnd(87, i) * 4}
              fill="none"
              opacity={0.4}
            />
          );
        })}
        <ellipse cx={300} cy={880} rx={54} ry={96} fill={WP.mokumeSuji} opacity={0.4} />
        <ellipse cx={300} cy={880} rx={24} ry={44} fill="#38200E" opacity={0.45} />
        {/* 板の継ぎ目 */}
        <path d={`M 1352,0 L 1352,1080`} stroke="#2E1A0A" strokeWidth={7} opacity={0.5} />
        <path d={`M 1360,0 L 1360,1080`} stroke="#B2865A" strokeWidth={3} opacity={0.3} />

        {/* 2026年2月のカレンダー (真上から) */}
        <g>
          <rect x={cal0x - 30} y={cal0y - 182} width={cw * 7 + 60} height={ch * 5 + 236} rx={6} fill="#20120A" opacity={0.45} transform="translate(14 18)" />
          <rect x={cal0x - 30} y={cal0y - 182} width={cw * 7 + 60} height={ch * 5 + 236} rx={6} fill="#F6F2E6" />
          {/* 綴じの金具 */}
          <rect x={cal0x - 30} y={cal0y - 182} width={cw * 7 + 60} height={34} fill="#CFC8B6" />
          {[0, 1].map((i) => (
            <circle key={`hl${i}`} cx={cal0x + 160 + i * 540} cy={cal0y - 165} r={13} fill="#6E6A60" />
          ))}
          {/* 月の見出し */}
          <text x={cal0x + 18} y={cal0y - 68} fontFamily={SEKAI_SERIF} fontSize={92} fontWeight={700} fill={WP.ink}>
            2026
          </text>
          <text x={cal0x + 300} y={cal0y - 68} fontFamily={SEKAI_SERIF} fontSize={66} fill="#4A443A">
            2 / February
          </text>
          {/* ペルシア暦 1404 (右上に小さく) */}
          <PNum x={cal0x + 672} y={cal0y - 78} s={1.5} color="#5A5248" />
          <Nastaliq x={cal0x + 806} y={cal0y - 118} w={120} size={22} color="#5A5248" seed={91} op={0.85} />
          <path d={`M ${cal0x + 640},${cal0y - 130} l 0,76`} stroke="#B8B0A0" strokeWidth={3} />
          {/* 曜日 */}
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <text
              key={`wd${i}`}
              x={cal0x + i * cw + cw / 2}
              y={cal0y - 14}
              textAnchor="middle"
              fontFamily={SEKAI_SERIF}
              fontSize={34}
              fill={i === 0 ? WP.inkRed : i === 6 ? "#3A5A8E" : "#5A5248"}
            >
              {d}
            </text>
          ))}
          {/* 罫 */}
          {Array.from({ length: 5 }).map((_, r) => (
            <path key={`hr${r}`} d={`M ${cal0x},${cal0y + r * ch} L ${cal0x + cw * 7},${cal0y + r * ch}`} stroke="#C4BCA8" strokeWidth={2.4} />
          ))}
          {Array.from({ length: 8 }).map((_, c) => (
            <path key={`vr${c}`} d={`M ${cal0x + c * cw},${cal0y} L ${cal0x + c * cw},${cal0y + ch * 4}`} stroke="#C4BCA8" strokeWidth={2.4} />
          ))}
          {/* 日付 1〜28 */}
          {Array.from({ length: 28 }).map((_, i) => {
            const r = Math.floor(i / 7);
            const c = i % 7;
            return (
              <text
                key={`dn${i}`}
                x={cal0x + c * cw + 14}
                y={cal0y + r * ch + 44}
                fontFamily={SEKAI_SERIF}
                fontSize={40}
                fill={c === 0 ? WP.inkRed : c === 6 ? "#3A5A8E" : WP.ink}
              >
                {i + 1}
              </text>
            );
          })}
          {/* 日ごとにペルシア暦の小さい数字 */}
          {Array.from({ length: 28 }).map((_, i) => {
            const r = Math.floor(i / 7);
            const c = i % 7;
            return (
              <g key={`pn${i}`} transform={`translate(${cal0x + c * cw + cw - 42} ${cal0y + r * ch + ch - 16}) scale(0.44)`}>
                <path d={`M 0,0 L 0,-40`} stroke="#9A9284" strokeWidth={7} />
                <path d={`M 26,-14 l 7,0`} stroke="#9A9284" strokeWidth={13} />
              </g>
            );
          })}
          {/* 書き込み */}
          <rect x={cal0x + 2 * cw + 8} y={cal0y + 1 * ch + 56} width={cw - 20} height={12} fill={WP.keikouPen} opacity={0.6} />
          <path d={`M ${cal0x + 4 * cw + 14},${cal0y + 2 * ch + 70} l 80,0`} stroke="#2E3240" strokeWidth={4} />
        </g>

        {/* 朱の糸 ── #9 から続いて左から入り、2026年2月のマスに止まる */}
        <path
          d={`M -200,206 C 140,236 360,170 ${-200 + (1080 + 200) * ito},${206 + Math.sin(ito * 5.2) * 56}`}
          stroke={WP.shuIto}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        {ito > 0.6 ? (
          <path
            d={`M 880,220 C 1010,250 1040,300 ${880 + 300 * easeOut(seg(f, 70, 110))},${220 + 180 * easeOut(seg(f, 70, 110))}`}
            stroke={WP.shuIto}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
        ) : null}
        {/* 糸の撚りの光 */}
        <path
          d={`M -200,206 C 140,236 360,170 ${-200 + (1080 + 200) * ito},${206 + Math.sin(ito * 5.2) * 56}`}
          stroke="#F0786A"
          strokeWidth={3}
          fill="none"
          opacity={0.7}
        />
        {/* 糸の端を留める待ち針 */}
        <g opacity={mark} transform={`translate(${cal0x + 3 * cw + 54} ${cal0y + 1 * ch + 46})`}>
          <ellipse cx={6} cy={10} rx={26} ry={9} fill="#20120A" opacity={0.4} />
          <path d={`M 0,0 l 0,-88`} stroke={WP.steelLit} strokeWidth={5} />
          <circle cx={0} cy={-94} r={14} fill={WP.inkRed} />
          <circle cx={-5} cy={-99} r={5} fill="#F0A89E" opacity={0.8} />
          <circle cx={0} cy={0} r={7} fill={WP.shuIto} />
        </g>
        {/* 日付に朱の丸 */}
        <ellipse
          cx={cal0x + 3 * cw + 42}
          cy={cal0y + 1 * ch + 34}
          rx={46 * mark}
          ry={40 * mark}
          fill="none"
          stroke={WP.inkRed}
          strokeWidth={7}
          opacity={mark}
        />

        {/* スマートフォンのロック画面の日付 (2026年なので出してよい) */}
        <g transform="translate(220 614) rotate(-8)">
          <rect x={16} y={20} width={330} height={660} rx={46} fill="#1A0E06" opacity={0.5} />
          <rect x={0} y={0} width={330} height={660} rx={46} fill={WP.phoneBlack} />
          <rect x={10} y={10} width={310} height={640} rx={38} fill="#0A0C10" />
          <rect x={18} y={18} width={294} height={624} rx={32} fill="#13233A" />
          {/* ロック画面 */}
          <rect x={18} y={18} width={294} height={624} rx={32} fill="#1C3A5E" opacity={0.6} />
          <path d={`M 18,420 C 90,370 150,400 200,372 C 250,344 290,362 312,352 L 312,642 L 18,642 Z`} fill="#0E1E33" opacity={0.8} />
          <circle cx={240} cy={104} r={34} fill="#D8E4F0" opacity={0.3} />
          <text x={165} y={238} textAnchor="middle" fontFamily={SEKAI_SERIF} fontSize={78} fill="#EAF1F7">
            2:26
          </text>
          <text x={165} y={288} textAnchor="middle" fontFamily={SEKAI_SERIF} fontSize={30} fill="#C2D4E4">
            2026年2月4日
          </text>
          <Nastaliq x={250} y={330} w={170} size={20} color="#AEC6DC" seed={95} op={0.8} />
          <rect x={112} y={600} width={106} height={7} rx={3} fill="#EAF1F7" opacity={0.6} />
          {/* 鍵のしるし */}
          <rect x={150} y={60} width={30} height={22} rx={4} fill="#C2D4E4" opacity={0.7} />
          <path d={`M 156,60 C 156,44 174,44 174,60`} stroke="#C2D4E4" strokeWidth={5} fill="none" opacity={0.7} />
        </g>

        {/* 真上の明かり。机の中央だけ */}
        <ellipse cx={960} cy={420} rx={880} ry={640} fill={`url(#${u}-top)`} />

        {/* 机に置いた物の影を1本の向きでそろえる (真上の光) */}
        <ellipse cx={1080} cy={1010} rx={380} ry={34} fill="#20120A" opacity={0.2} />
      </Cam>

      <YearTag year="二〇二六" place="" f={f} />
    </>
  );
};

// ===================================================================
// #16 山「イランは、その最高指導者を、戦争で殺されました。」(全景可)
// 夜のテヘラン。黒い影として抜くのをやめる。火の側から照らして建物に色を入れる。
// 砂色の壁・水色のタイル・白い窓枠が火あかりで橙に寄る。全員の顔が見える明るさ。
// 事件 = 消えかけた街灯が一本だけ点いている。
// ===================================================================
const S16: SekaiArt = ({ f }) => {
  const u = "b16";
  const flick = 0.72 + Math.sin(f / 3.1) * 0.12 + Math.sin(f / 7.7) * 0.1;
  const hose = seg(f, 20, 150);
  const lamp = 0.3 + Math.abs(Math.sin(f / 9)) * 0.7; // ★事件。消えかけの街灯
  const siren = Math.sin(f / 6) > 0 ? 1 : 0.25;

  // 夜の住民・消防士。火あかりで顔が見える
  type K = "moufu" | "moufuF" | "shoubou" | "wakamono" | "roujin";
  const Hito: React.FC<{ x: number; y: number; h: number; kind: K; turn?: number }> = ({
    x,
    y,
    h,
    kind,
    turn = 0,
  }) => {
    const s = h / 420;
    const warm = "#F0A463";
    const body =
      kind === "shoubou" ? "#2E3A48" : kind === "wakamono" ? "#3A3E4E" : kind === "roujin" ? "#4A4452" : WP.moufu;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={6} rx={50} ry={12} fill="#0A0C14" opacity={0.6} />
        {/* 脚 */}
        <path d={`M -20,-150 L -26,-4 l 24,0 l 4,-146 Z`} fill={kind === "shoubou" ? "#1E2630" : "#2A2E3A"} />
        <path d={`M 20,-150 L 26,-4 l -24,0 l -4,-146 Z`} fill={kind === "shoubou" ? "#1E2630" : "#2A2E3A"} />
        <path d={`M -34,-4 l 34,0 l 0,10 l -34,0 Z M 0,-4 l 34,0 l 0,10 l -34,0 Z`} fill="#15181E" />
        {kind === "shoubou" ? (
          <>
            <path d={`M -26,-60 l 28,0 l 0,16 l -28,0 Z M 2,-60 l 28,0 l 0,16 l -28,0 Z`} fill={WP.helmetKi} opacity={0.6} />
          </>
        ) : null}
        {/* 胴 */}
        <path d={`M -46,-336 L 46,-336 L 56,-146 L -56,-146 Z`} fill={body} />
        <path d={`M -46,-336 L -20,-336 L -30,-146 L -56,-146 Z`} fill={warm} opacity={0.26} />
        {kind === "moufu" || kind === "moufuF" ? (
          // かけられた毛布。肩から下を覆う
          <>
            <path d={`M 0,-352 C -92,-330 -112,-180 -102,-2 L 102,-2 C 112,-180 92,-330 0,-352 Z`} fill={WP.moufu} />
            <path d={`M 0,-352 C -92,-330 -112,-180 -102,-2 L -40,-2 C -46,-180 -40,-320 0,-352 Z`} fill="#B8704E" opacity={0.5} />
            {[0, 1, 2, 3].map((i) => (
              <path key={`st${i}`} d={`M -98,${-250 + i * 70} C -30,${-258 + i * 70} 30,${-258 + i * 70} 98,${-250 + i * 70}`} stroke="#7A3E2A" strokeWidth={8} fill="none" opacity={0.6} />
            ))}
            <path d={`M 0,-352 C -34,-342 -46,-320 -44,-300 L 44,-300 C 46,-320 34,-342 0,-352 Z`} fill="#7A3E2A" opacity={0.5} />
          </>
        ) : kind === "shoubou" ? (
          <>
            <path d={`M -46,-290 L 46,-290 L 46,-262 L -46,-262 Z`} fill="#D8E24A" opacity={0.85} />
            <path d={`M -46,-204 L 46,-204 L 46,-178 L -46,-178 Z`} fill="#D8E24A" opacity={0.85} />
            <path d={`M -14,-336 L -14,-146`} stroke="#1E2630" strokeWidth={5} />
          </>
        ) : null}
        {/* 腕 */}
        {kind === "wakamono" ? (
          // 携帯で撮る。画面の光が顔を下から照らす
          <>
            <path d={`M -44,-300 C -74,-268 -78,-230 -56,-214`} stroke={body} strokeWidth={18} fill="none" strokeLinecap="round" />
            <path d={`M 44,-300 C 74,-268 78,-230 56,-214`} stroke={body} strokeWidth={18} fill="none" strokeLinecap="round" />
            <rect x={-32} y={-282} width={64} height={110} rx={8} fill={WP.phoneBlack} />
            <rect x={-25} y={-275} width={50} height={96} rx={5} fill="#7ED8F0" opacity={0.85} />
            <path d={`M -25,-210 C -8,-230 10,-222 25,-240 L 25,-179 L -25,-179 Z`} fill="#E8903C" opacity={0.7} />
            <circle cx={-56} cy={-210} r={11} fill={WP.skin} />
            <circle cx={56} cy={-210} r={11} fill={WP.skin} />
          </>
        ) : kind === "shoubou" ? (
          <>
            <path d={`M -46,-300 C -92,-284 -124,-260 -140,-240`} stroke={body} strokeWidth={19} fill="none" strokeLinecap="round" />
            <path d={`M 46,-300 C 90,-286 118,-266 132,-248`} stroke={body} strokeWidth={19} fill="none" strokeLinecap="round" />
          </>
        ) : kind === "moufu" || kind === "moufuF" ? (
          <path d={`M -62,-200 C -46,-262 -26,-308 -8,-328`} stroke={WP.moufu} strokeWidth={19} fill="none" strokeLinecap="round" />
        ) : (
          <>
            <path d={`M -46,-304 C -68,-256 -70,-212 -62,-176`} stroke={body} strokeWidth={18} fill="none" strokeLinecap="round" />
            <path d={`M 46,-304 C 68,-256 70,-212 62,-176`} stroke={body} strokeWidth={18} fill="none" strokeLinecap="round" />
            <circle cx={-62} cy={-170} r={11} fill={WP.skin} />
            <circle cx={62} cy={-170} r={11} fill={WP.skin} />
          </>
        )}
        {/* 頭。火の側 (左) が明るい。全員の顔が見える */}
        <g transform={`rotate(${turn} 0 -340)`}>
          <ellipse cx={0} cy={-378} rx={35} ry={41} fill={WP.skin} />
          <path d={`M -35,-378 C -36,-404 -20,-419 0,-419 L 0,-337 C -22,-337 -34,-354 -35,-378 Z`} fill={warm} opacity={0.4} />
          {kind === "shoubou" ? (
            <>
              {/* 黄色いヘルメットと面体の上げたシールド */}
              <path d={`M -44,-392 C -44,-436 44,-436 44,-392 L 50,-384 L -50,-384 Z`} fill={WP.helmetKi} />
              <path d={`M -44,-400 C -40,-430 40,-430 44,-400`} stroke="#A8831E" strokeWidth={6} fill="none" />
              <path d={`M -46,-420 C -20,-438 20,-438 46,-420 L 46,-440 C 20,-452 -20,-452 -46,-440 Z`} fill="#C89A24" opacity={0.8} />
            </>
          ) : kind === "moufuF" ? (
            // ルーサリーを肩に落として髪が見えている (2026年の類型②)
            <>
              <path d={`M -36,-382 C -38,-418 38,-418 36,-382 L 36,-404 C 26,-426 -26,-426 -36,-404 Z`} fill="#2E241C" />
              <path d={`M -40,-370 C -56,-336 -50,-312 -36,-304 L 36,-304 C 50,-312 56,-336 40,-370 C 40,-344 20,-330 0,-330 C -20,-330 -40,-344 -40,-370 Z`} fill={WP.rusari} opacity={0.9} />
            </>
          ) : kind === "roujin" ? (
            <path d={`M -34,-384 C -30,-416 30,-416 34,-384 L 34,-400 C 24,-424 -24,-424 -34,-400 Z`} fill="#A8A298" />
          ) : (
            <path d={`M -34,-384 C -30,-416 30,-416 34,-384 L 34,-400 C 24,-424 -24,-424 -34,-400 Z`} fill="#241C16" />
          )}
          <ellipse cx={-34} cy={-374} rx={6} ry={9} fill={WP.skinShade} />
          <path d={`M -23,-391 l 14,-2 M 23,-391 l -14,-2`} stroke="#241B14" strokeWidth={3.4} strokeLinecap="round" />
          <ellipse cx={-14} cy={-379} rx={6.6} ry={5} fill="#F4EFE4" />
          <ellipse cx={14} cy={-379} rx={6.6} ry={5} fill="#F4EFE4" />
          <circle cx={-13} cy={-380} r={2.8} fill="#14100C" />
          <circle cx={15} cy={-380} r={2.8} fill="#14100C" />
          <path d={`M 0,-376 l -4,10 l 7,0`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          {kind === "moufu" || kind === "moufuF" ? (
            // 口を結んでいる
            <path d={`M -9,-356 L 9,-356`} stroke="#7A4A36" strokeWidth={3} strokeLinecap="round" />
          ) : (
            <path d={`M -9,-358 C -2,-350 4,-350 10,-358 C 4,-348 -3,-348 -9,-358 Z`} fill="#5E2E22" />
          )}
          {kind === "roujin" ? (
            <path d={`M -15,-352 C 0,-340 10,-342 16,-352 C 10,-332 -6,-332 -15,-352 Z`} fill={WP.agohige} />
          ) : null}
        </g>
      </g>
    );
  };

  return (
    <>
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060C1E" />
          <stop offset="0.6" stopColor={WP.nightSky} />
          <stop offset="1" stopColor="#3E2A28" />
        </linearGradient>
        <radialGradient id={`${u}-fire`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={WP.fireCore} stopOpacity="0.9" />
          <stop offset="0.4" stopColor={WP.fire} stopOpacity="0.5" />
          <stop offset="1" stopColor={WP.fire} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-water`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor={WP.housuiMizu} stopOpacity="0.9" />
          <stop offset="1" stopColor={WP.housuiMizu} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[14, -8, 1.04]} to={[-14, 6, 1.0]} start={0} end={160}>
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-sky)`} />
        {/* テヘランは標高1200m。背後に雪のアルボルズ (砂漠とラクダではない) */}
        <path d={`M -200,330 L 180,170 L 420,250 L 700,130 L 1000,246 L 1320,150 L 1620,254 L ${W + 200},186 L ${W + 200},430 L -200,430 Z`} fill="#1A2440" />
        <path d={`M 700,130 l 62,30 l -44,12 l -52,-16 Z M 1320,150 l 56,28 l -40,10 l -46,-14 Z M 180,170 l 54,26 l -40,10 l -44,-12 Z`} fill={WP.snowShade} opacity={0.85} />
        {/* 星 */}
        {Array.from({ length: 36 }).map((_, i) => (
          <circle key={`st${i}`} cx={-100 + rnd(101, i) * (W + 200)} cy={20 + rnd(103, i) * 180} r={1.4 + rnd(107, i) * 1.6} fill={WP.star} opacity={0.5 + rnd(109, i) * 0.4} />
        ))}

        {/* 停電した街区 (左) と通電している街区 (右)。境目をはっきり描く */}
        <g>
          {/* 停電側。窓は暗いが壁には色がある (抜かない) */}
          {[0, 1, 2].map((i) => (
            <g key={`dk${i}`}>
              <rect x={-170 + i * 250} y={300 + i * 26} width={224} height={420} fill="#3E3A38" />
              <rect x={-170 + i * 250} y={300 + i * 26} width={224} height={16} fill="#4E4844" />
              {Array.from({ length: 12 }).map((_, j) => (
                <rect
                  key={`dw${j}`}
                  x={-156 + i * 250 + (j % 3) * 70}
                  y={332 + i * 26 + Math.floor(j / 3) * 86}
                  width={52}
                  height={58}
                  fill="#24222A"
                  stroke="#5E5852"
                  strokeWidth={3}
                />
              ))}
            </g>
          ))}
        </g>
        {/* 境目の縦線 */}
        <path d={`M 596,290 L 596,760`} stroke="#0A0C14" strokeWidth={10} opacity={0.6} />
        <g>
          {/* 通電側。窓に灯。衛星アンテナ */}
          {[0, 1, 2, 3].map((i) => (
            <g key={`lt${i}`}>
              <rect x={1180 + i * 200} y={260 + (i % 2) * 34} width={180} height={470} fill={WP.sand} />
              <rect x={1180 + i * 200} y={260 + (i % 2) * 34} width={180} height={14} fill="#D8BE8E" />
              {Array.from({ length: 12 }).map((_, j) => (
                <rect
                  key={`lw${j}`}
                  x={1194 + i * 200 + (j % 3) * 56}
                  y={290 + (i % 2) * 34 + Math.floor(j / 3) * 96}
                  width={42}
                  height={66}
                  fill={rnd(113, i * 12 + j) > 0.35 ? WP.neonYellow : "#2A2A30"}
                  stroke="#F2EEE2"
                  strokeWidth={3}
                  opacity={0.95}
                />
              ))}
              {/* 水色のタイルの帯 */}
              <rect x={1180 + i * 200} y={660 + (i % 2) * 34} width={180} height={34} fill={WP.tileMizuiro} />
              {/* 衛星アンテナ */}
              <g transform={`translate(${1250 + i * 200} ${248 + (i % 2) * 34})`}>
                <path d={`M 0,0 l 0,-26`} stroke={WP.steelDark} strokeWidth={5} />
                <path d={`M -28,-26 C -28,-62 28,-62 28,-26 Z`} fill={WP.concrete} />
                <path d={`M -28,-26 C -28,-62 28,-62 28,-26 Z`} fill="none" stroke={WP.concreteDark} strokeWidth={3} />
                <circle cx={0} cy={-34} r={5} fill={WP.steelDark} />
              </g>
            </g>
          ))}
        </g>

        {/* ★事件 = 消えかけた街灯が一本だけ点いている */}
        <g>
          <path d={`M 840,790 L 846,330`} stroke={WP.steelDark} strokeWidth={11} />
          <path d={`M 846,330 C 848,304 880,296 902,306`} stroke={WP.steelDark} strokeWidth={9} fill="none" />
          <path d={`M 886,306 L 926,306 L 918,330 L 894,330 Z`} fill={WP.steelDark} />
          <ellipse cx={906} cy={332} rx={16} ry={7} fill={WP.gaitouDentou} opacity={lamp} />
          <ellipse cx={906} cy={350} rx={70} ry={54} fill={WP.gaitouDentou} opacity={0.22 * lamp} />
          <path d={`M 876,356 L 936,356 L 976,560 L 836,560 Z`} fill={WP.gaitouDentou} opacity={0.1 * lamp} />
          {/* 隣の街灯は消えている */}
          <path d={`M 452,790 L 458,360`} stroke="#2E3238" strokeWidth={10} />
          <path d={`M 458,360 C 460,336 490,330 510,340`} stroke="#2E3238" strokeWidth={8} fill="none" />
          <path d={`M 494,340 L 532,340 L 524,362 L 502,362 Z`} fill="#2E3238" />
        </g>

        {/* 崩れた公邸の壁。曲がった鉄筋・割れた水色のタイル */}
        <g>
          <path d={`M 540,760 L 560,430 L 1180,420 L 1190,760 Z`} fill={WP.sand} />
          <path d={`M 540,760 L 560,430 L 760,426 L 756,760 Z`} fill="#E8A868" opacity={0.4} />
          {/* 崩落の口 */}
          <path d={`M 700,760 L 714,560 L 790,470 L 900,520 L 962,452 L 1050,480 L 1072,760 Z`} fill="#140E10" />
          <path d={`M 700,760 L 714,560 L 790,470 L 900,520 L 962,452 L 1050,480 L 1072,760 Z`} fill={WP.ember} opacity={0.35} />
          {/* 割れた水色のタイルの腰壁 */}
          {Array.from({ length: 11 }).map((_, i) => {
            const tx = 548 + i * 60;
            const broken = i >= 3 && i <= 8;
            return (
              <g key={`tl${i}`}>
                <rect x={tx} y={672} width={54} height={54} fill={i % 2 ? WP.tileMizuiro : WP.tileMizuiroLit} opacity={broken ? 0.5 : 1} />
                {broken ? (
                  <path
                    d={`M ${tx},${672} l 30,26 l -16,28 M ${tx + 54},${680} l -28,20`}
                    stroke="#1E2A30"
                    strokeWidth={3.4}
                    fill="none"
                  />
                ) : null}
              </g>
            );
          })}
          {/* 落ちたタイルの破片 */}
          {Array.from({ length: 16 }).map((_, i) => (
            <path
              key={`fr${i}`}
              d={`M ${700 + rnd(127, i) * 420},${766 + rnd(131, i) * 90} l ${12 + rnd(137, i) * 20},${-6} l ${4},${14 + rnd(139, i) * 10} Z`}
              fill={rnd(149, i) > 0.5 ? WP.tileMizuiro : WP.tileMizuiroLit}
            />
          ))}
          {/* 曲がった鉄筋 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={`rb${i}`}
              d={`M ${742 + i * 66},760 C ${740 + i * 66},640 ${770 + i * 66},560 ${816 + i * 70},${500 - i * 22}
                  C ${840 + i * 70},${474 - i * 22} ${824 + i * 70},${452 - i * 22} ${794 + i * 70},${456 - i * 22}`}
              stroke={WP.rust}
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {/* コンクリートの折れ口 */}
          <path d={`M 962,452 L 1050,480 L 1046,512 L 958,486 Z`} fill={WP.concrete} />
          <path d={`M 714,560 L 790,470 L 806,494 L 736,578 Z`} fill={WP.concreteDark} />
        </g>

        {/* 火。崩落の口の中から */}
        <ellipse cx={890} cy={640} rx={300 * flick} ry={210 * flick} fill={`url(#${u}-fire)`} />
        {[0, 1, 2, 3, 4].map((i) => {
          const ph = (f / 7 + i * 1.7) % 4;
          return (
            <path
              key={`fl${i}`}
              d={`M ${810 + i * 42},${736 - ph * 24} c ${-14},${-40 - ph * 14} ${10},${-66} ${20},${-92}
                  c ${14},${30} ${30},${46} ${16},${86} c ${-6},${18} ${-26},${24} ${-36},${6} Z`}
              fill={i % 2 ? WP.fire : WP.fireCore}
              opacity={0.85 - ph * 0.17}
            />
          );
        })}
        {/* 煙 */}
        {Array.from({ length: 7 }).map((_, i) => {
          const t = ((f + i * 30) % 180) / 180;
          return (
            <ellipse
              key={`sm${i}`}
              cx={890 + Math.sin(t * 4 + i) * 110}
              cy={580 - t * 560}
              rx={70 + t * 140}
              ry={54 + t * 110}
              fill={WP.smoke}
              opacity={(1 - t) * 0.26}
            />
          );
        })}

        {/* 消防の放水 */}
        <g>
          <path
            d={`M 1448,700 C 1270,${640 - hose * 30} 1080,${600 - hose * 40} 940,${604 - hose * 20}`}
            stroke={`url(#${u}-water)`}
            strokeWidth={34}
            fill="none"
            strokeLinecap="round"
            opacity={0.8}
          />
          <path
            d={`M 1448,706 C 1280,${660 - hose * 26} 1100,${626 - hose * 34} 960,${630 - hose * 18}`}
            stroke={WP.foam}
            strokeWidth={13}
            fill="none"
            opacity={0.6}
          />
          {/* 飛沫 */}
          {Array.from({ length: 14 }).map((_, i) => {
            const t = ((f * 2 + i * 23) % 100) / 100;
            return (
              <circle
                key={`sp${i}`}
                cx={1448 - t * 520 + rnd(151, i) * 60}
                cy={700 - t * 110 + rnd(157, i) * 90}
                r={3 + rnd(163, i) * 7}
                fill={WP.foam}
                opacity={(1 - t) * 0.6}
              />
            );
          })}
          {/* 水が当たって立つ蒸気 */}
          <ellipse cx={950} cy={620} rx={120} ry={80} fill={WP.foam} opacity={0.18} />
          {/* ホース */}
          <path d={`M 1448,706 C 1560,760 1700,790 ${W + 200},800`} stroke="#C8302A" strokeWidth={22} fill="none" />
          <path d={`M 1448,706 C 1560,760 1700,790 ${W + 200},800`} stroke="#E8544A" strokeWidth={8} fill="none" opacity={0.6} />
          {/* 筒先 */}
          <path d={`M 1408,694 L 1452,712 L 1444,726 L 1400,708 Z`} fill={WP.brass} />
        </g>

        {/* 救急車の青い灯 */}
        <g transform="translate(1596 838)">
          <rect x={-170} y={-170} width={340} height={170} rx={14} fill="#E8E4DA" />
          <rect x={-170} y={-170} width={340} height={40} rx={10} fill="#D8D2C4" />
          <rect x={-160} y={-120} width={110} height={70} rx={6} fill="#2A3A4E" />
          <rect x={-40} y={-120} width={200} height={70} rx={6} fill="#F2EEE2" />
          <path d={`M 20,-112 l 0,54 M -8,-85 l 56,0`} stroke="#C8302A" strokeWidth={14} />
          <circle cx={-110} cy={10} r={44} fill="#1A1C22" />
          <circle cx={-110} cy={10} r={20} fill={WP.steelDark} />
          <circle cx={112} cy={10} r={44} fill="#1A1C22" />
          <circle cx={112} cy={10} r={20} fill={WP.steelDark} />
          <rect x={-60} y={-200} width={120} height={32} rx={8} fill={WP.kyuukyuuAo} opacity={siren} />
          <ellipse cx={0} cy={-184} rx={190} ry={100} fill={WP.kyuukyuuAo} opacity={0.2 * siren} />
          <Nastaliq x={150} y={-70} w={170} size={20} color="#2A3A4E" seed={171} />
        </g>

        {/* 人。全員の顔が見える明るさ */}
        <Hito x={352} y={880} h={330} kind="moufu" turn={10} />
        <Hito x={476} y={896} h={322} kind="moufuF" turn={6} />
        <Hito x={1256} y={904} h={344} kind="shoubou" turn={-14} />
        <Hito x={1372} y={886} h={330} kind="shoubou" turn={-10} />
        <Hito x={702} y={940} h={356} kind="wakamono" turn={8} />

        {/* 抱えられた老人 (2人で支える) */}
        <g>
          <Hito x={1004} y={960} h={352} kind="moufu" turn={-8} />
          <g transform="translate(1086 960) rotate(-16)">
            <path d={`M -120,-180 C -40,-212 70,-206 130,-176 L 126,-120 C 60,-150 -40,-154 -116,-124 Z`} fill={WP.manto} />
            <ellipse cx={150} cy={-188} rx={34} ry={39} fill={WP.skin} />
            <path d={`M 150,-188 a 34 39 0 0 1 0,-39 l 0,78 a 34 39 0 0 1 0,-39 Z`} fill="#F0A463" opacity={0.3} />
            <path d={`M 118,-196 C 122,-226 180,-226 184,-196 L 184,-212 C 174,-234 128,-234 118,-212 Z`} fill="#A8A298" />
            <ellipse cx={138} cy={-190} rx={6} ry={4.6} fill="#F4EFE4" />
            <ellipse cx={162} cy={-190} rx={6} ry={4.6} fill="#F4EFE4" />
            <circle cx={138} cy={-191} r={2.6} fill="#14100C" />
            <circle cx={162} cy={-191} r={2.6} fill="#14100C" />
            <path d={`M 129,-201 l 13,-2 M 171,-201 l -13,-2`} stroke="#5E564C" strokeWidth={3} strokeLinecap="round" />
            <path d={`M 150,-186 l -4,10 l 7,0`} stroke={WP.skinShade} strokeWidth={2.4} fill="none" />
            <path d={`M 136,-162 C 150,-152 160,-154 166,-162 C 158,-144 142,-144 136,-162 Z`} fill={WP.agohige} />
            <path d={`M -116,-124 C -60,-100 40,-96 124,-122 L 120,-88 C 36,-62 -56,-66 -112,-90 Z`} fill={WP.moufu} />
          </g>
        </g>

        {/* 道路 */}
        <rect x={-200} y={760} width={W + 400} height={320} fill="#20222A" />
        <rect x={-200} y={760} width={W + 400} height={320} fill={WP.asphalt} opacity={0.7} />
        {/* 火あかりが路面に伸びる (画面全体ではなく、火の前の路面だけ) */}
        <path d={`M 760,768 L 1030,768 L 1230,1080 L 560,1080 Z`} fill={WP.fire} opacity={0.14 * flick} />
        {/* 水たまりに火が映る */}
        <ellipse cx={1150} cy={960} rx={190} ry={30} fill="#1E3040" />
        <ellipse cx={1150} cy={956} rx={120} ry={16} fill={WP.fire} opacity={0.35 * flick} />
        {/* 散った瓦礫 */}
        {Array.from({ length: 24 }).map((_, i) => (
          <path
            key={`db${i}`}
            d={`M ${-120 + rnd(167, i) * 2100},${790 + rnd(173, i) * 270} l ${14 + rnd(179, i) * 26},${-8} l ${6},${16 + rnd(181, i) * 12} Z`}
            fill={rnd(191, i) > 0.6 ? WP.concrete : "#5E5852"}
            opacity={0.9}
          />
        ))}
      </Cam>

      <YearTag year="二〇二六" place="テヘラン" f={f} />
    </>
  );
};

// ===================================================================
// #17 山「後を継いだ息子は、8か月たった今も、公の場に姿を見せていません。」
// 「顔が無いことの寄り」。歴代の肖像が2枚。3枚目の額だけ布が掛かったまま。
// 冷たい青白の光、窓の一灯だけ。人は布を掛け直す係の男性の手と袖だけ。
// 事件 = 布の端がめくれ、何も描かれていない下地が見える。
// ===================================================================
const S17: SekaiArt = ({ f }) => {
  const u = "b17";
  const lift = easeInOut(seg(f, 54, 128)); // ★事件。布の端がめくれる
  const hand = easeOut(seg(f, 16, 58));
  const sway = Math.sin(f / 26) * 2.4;

  // 壁の肖像。黒いターバン＋白い顎髭 (先代) / 黒いターバン＋眼鏡 (当代)
  const Portrait: React.FC<{ x: number; y: number; w: number; h: number; glasses: boolean }> = ({
    x,
    y,
    w,
    h,
    glasses,
  }) => {
    const cx = x + w / 2;
    const fy = y + h * 0.42;
    const r = w * 0.27;
    return (
      <g>
        {/* 影 */}
        <rect x={x + 10} y={y + 14} width={w} height={h} fill="#2A2E34" opacity={0.5} />
        {/* 金の額縁 */}
        <rect x={x} y={y} width={w} height={h} fill={WP.gakubuchiKin} />
        <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} fill="#8E6E32" />
        <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} fill="#E2C078" />
        <rect x={x + 26} y={y + 26} width={w - 52} height={h - 52} fill="#1E2A26" />
        {/* 額縁の彫り */}
        {Array.from({ length: 18 }).map((_, i) => (
          <path key={`cv${i}`} d={`M ${x + 4},${y + 12 + i * ((h - 24) / 18)} l ${w - 8},0`} stroke="#A8822E" strokeWidth={1.6} opacity={0.5} />
        ))}
        {/* 肖像の中身 */}
        <g>
          {/* 茶のアバの肩 */}
          <path d={`M ${cx},${fy + r * 1.5} C ${cx - w * 0.44},${fy + r * 1.9} ${x + 28},${y + h - 60} ${x + 28},${y + h - 26} L ${x + w - 28},${y + h - 26} C ${x + w - 28},${y + h - 60} ${cx + w * 0.44},${fy + r * 1.9} ${cx},${fy + r * 1.5} Z`} fill={WP.abaCha} />
          <path d={`M ${cx - r * 0.5},${fy + r * 1.6} C ${cx - r * 0.6},${y + h - 70} ${cx - r * 0.5},${y + h - 40} ${cx - r * 0.4},${y + h - 26}
                    M ${cx + r * 0.5},${fy + r * 1.6} C ${cx + r * 0.6},${y + h - 70} ${cx + r * 0.5},${y + h - 40} ${cx + r * 0.4},${y + h - 26}`} stroke={WP.kaftanCha} strokeWidth={8} fill="none" />
          {/* 顔 */}
          <ellipse cx={cx} cy={fy} rx={r} ry={r * 1.14} fill={WP.skin} />
          <ellipse cx={cx} cy={fy} rx={r} ry={r * 1.14} fill={WP.skinShade} opacity={0.14} />
          {/* 黒いターバン */}
          <path d={`M ${cx - r * 1.1},${fy - r * 0.6} C ${cx - r * 1.08},${fy - r * 1.6} ${cx + r * 1.08},${fy - r * 1.6} ${cx + r * 1.1},${fy - r * 0.6}
                    C ${cx + r * 1.2},${fy - r * 1.3} ${cx + r * 0.7},${fy - r * 1.9} ${cx},${fy - r * 1.9}
                    C ${cx - r * 0.7},${fy - r * 1.9} ${cx - r * 1.2},${fy - r * 1.3} ${cx - r * 1.1},${fy - r * 0.6} Z`} fill={WP.turbanKuro} />
          <path d={`M ${cx - r * 1.12},${fy - r * 0.62} C ${cx - r * 0.5},${fy - r * 0.9} ${cx + r * 0.5},${fy - r * 0.9} ${cx + r * 1.12},${fy - r * 0.62}
                    C ${cx + r * 1.1},${fy - r * 0.3} ${cx - r * 1.1},${fy - r * 0.3} ${cx - r * 1.12},${fy - r * 0.62} Z`} fill={WP.turbanOrime} />
          {/* 眉 */}
          <path d={`M ${cx - r * 0.62},${fy - r * 0.26} C ${cx - r * 0.42},${fy - r * 0.38} ${cx - r * 0.16},${fy - r * 0.36} ${cx - r * 0.1},${fy - r * 0.24}`} stroke="#7A7268" strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
          <path d={`M ${cx + r * 0.62},${fy - r * 0.26} C ${cx + r * 0.42},${fy - r * 0.38} ${cx + r * 0.16},${fy - r * 0.36} ${cx + r * 0.1},${fy - r * 0.24}`} stroke="#7A7268" strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
          {/* 目 (伏せ目＝上に凸のC) */}
          <path d={`M ${cx - r * 0.56},${fy - r * 0.04} C ${cx - r * 0.44},${fy - r * 0.2} ${cx - r * 0.2},${fy - r * 0.2} ${cx - r * 0.1},${fy - r * 0.04}`} stroke="#3A2E22" strokeWidth={r * 0.075} fill="none" strokeLinecap="round" />
          <path d={`M ${cx + r * 0.56},${fy - r * 0.04} C ${cx + r * 0.44},${fy - r * 0.2} ${cx + r * 0.2},${fy - r * 0.2} ${cx + r * 0.1},${fy - r * 0.04}`} stroke="#3A2E22" strokeWidth={r * 0.075} fill="none" strokeLinecap="round" />
          {/* 鼻 */}
          <path d={`M ${cx},${fy - r * 0.02} l ${-r * 0.1},${r * 0.34} l ${r * 0.2},0`} stroke={WP.skinShade} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
          {/* 白い顎髭 (面で作る) */}
          <path d={`M ${cx - r * 0.78},${fy + r * 0.34} C ${cx - r * 0.86},${fy + r * 1.3} ${cx + r * 0.86},${fy + r * 1.3} ${cx + r * 0.78},${fy + r * 0.34}
                    C ${cx + r * 0.6},${fy + r * 0.66} ${cx - r * 0.6},${fy + r * 0.66} ${cx - r * 0.78},${fy + r * 0.34} Z`} fill={glasses ? "#C8C2B6" : WP.agohige} />
          <path d={`M ${cx - r * 0.44},${fy + r * 0.74} C ${cx - r * 0.14},${fy + r * 0.86} ${cx + r * 0.14},${fy + r * 0.86} ${cx + r * 0.44},${fy + r * 0.74}`} stroke="#AAA49A" strokeWidth={r * 0.07} fill="none" />
          {/* 口髭 */}
          <path d={`M ${cx - r * 0.34},${fy + r * 0.4} C ${cx - r * 0.1},${fy + r * 0.48} ${cx + r * 0.1},${fy + r * 0.48} ${cx + r * 0.34},${fy + r * 0.4}
                    C ${cx + r * 0.2},${fy + r * 0.62} ${cx - r * 0.2},${fy + r * 0.62} ${cx - r * 0.34},${fy + r * 0.4} Z`} fill={glasses ? "#C8C2B6" : WP.agohige} />
          {/* 当代は眼鏡 */}
          {glasses ? (
            <g stroke="#2E3238" strokeWidth={r * 0.055} fill="none">
              <rect x={cx - r * 0.68} y={fy - r * 0.2} width={r * 0.6} height={r * 0.36} rx={r * 0.08} />
              <rect x={cx + r * 0.08} y={fy - r * 0.2} width={r * 0.6} height={r * 0.36} rx={r * 0.08} />
              <path d={`M ${cx - r * 0.08},${fy - r * 0.04} l ${r * 0.16},0`} />
              <path d={`M ${cx - r * 0.68},${fy - r * 0.08} l ${-r * 0.32},${-r * 0.1}`} />
              <path d={`M ${cx + r * 0.68},${fy - r * 0.08} l ${r * 0.32},${-r * 0.1}`} />
            </g>
          ) : null}
        </g>
        {/* ガラスの映り (窓の一灯) */}
        <path d={`M ${x + 26},${y + 26} l ${w * 0.34},0 l ${-w * 0.2},${h - 52} l ${-w * 0.14},0 Z`} fill="#CFE2FF" opacity={0.1} />
      </g>
    );
  };

  return (
    <>
      <defs>
        <linearGradient id={`${u}-wall`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8A98A6" />
          <stop offset="0.5" stopColor={WP.kabeAojiro} />
          <stop offset="1" stopColor="#4A525C" />
        </linearGradient>
        <linearGradient id={`${u}-nuno`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#F2EEE4" />
          <stop offset="0.55" stopColor={WP.shirokinu} />
          <stop offset="1" stopColor={WP.shirokinuKage} />
        </linearGradient>
        <linearGradient id={`${u}-win`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8E8F4" stopOpacity="0.4" />
          <stop offset="1" stopColor="#D8E8F4" stopOpacity="0" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[-10, 8, 1.0]} to={[18, -6, 1.09]} start={0} end={160}>
        {/* 壁。冷たい青白。窓の一灯だけ */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-wall)`} />
        {/* 窓からの光の板 (左上から) */}
        <path d={`M -200,0 L 420,0 L 700,560 L -200,420 Z`} fill={`url(#${u}-win)`} />
        {/* 漆喰のひび */}
        <path d={`M 120,0 C 150,140 108,260 160,392`} stroke="#3E464E" strokeWidth={3} fill="none" opacity={0.4} />
        <path d={`M 1760,180 C 1726,290 1770,380 1740,480`} stroke="#3E464E" strokeWidth={3} fill="none" opacity={0.35} />

        {/* 壁の日焼けの跡 (前の額の四角い跡) */}
        <rect x={1300} y={176} width={340} height={430} fill={WP.hiyakeAto} opacity={0.5} />
        <rect x={1300} y={176} width={340} height={430} fill="none" stroke="#9A9284" strokeWidth={3} opacity={0.6} />
        <rect x={1312} y={188} width={316} height={406} fill="none" stroke="#B2AA9A" strokeWidth={2} opacity={0.5} />

        {/* 歴代の肖像 2枚 (顔は画面の高さの1/4以上) */}
        <Portrait x={116} y={158} w={420} h={520} glasses={false} />
        <Portrait x={672} y={178} w={420} h={520} glasses={true} />

        {/* 3枚目の額。布が掛かったまま */}
        <g transform={`translate(1226 ${196 + sway})`}>
          {/* 釘と針金 */}
          <path d={`M 170,-54 l 0,-26`} stroke={WP.steelDark} strokeWidth={6} />
          <path d={`M 150,-78 l 40,0`} stroke={WP.steelDark} strokeWidth={8} strokeLinecap="round" />
          <path d={`M 170,-54 L 42,10 M 170,-54 L 298,10`} stroke={WP.steelLit} strokeWidth={3.4} />
          <ellipse cx={170} cy={-82} rx={11} ry={6} fill={WP.steelLit} />
          {/* 額の金の縁 (布の下からのぞく) */}
          <rect x={20} y={0} width={300} height={470} fill="#2A2E34" opacity={0.5} transform="translate(10 12)" />
          <rect x={20} y={0} width={300} height={470} fill={WP.gakubuchiKin} />
          <rect x={32} y={12} width={276} height={446} fill="#8E6E32" />
          <rect x={44} y={24} width={252} height={422} fill="#E2C078" />
          {/* ★事件 = 布の端がめくれ、何も描かれていない下地が見える */}
          <g>
            <rect x={56} y={36} width={228} height={398} fill="#C4BCA8" />
            {/* 下地 = 何も描かれていないカンバスの織り */}
            {Array.from({ length: 22 }).map((_, i) => (
              <path key={`cvh${i}`} d={`M 56,${40 + i * 18} l 228,0`} stroke="#B2AA96" strokeWidth={2} opacity={0.6} />
            ))}
            {Array.from({ length: 13 }).map((_, i) => (
              <path key={`cvv${i}`} d={`M ${58 + i * 18},36 l 0,398`} stroke="#B8B09C" strokeWidth={2} opacity={0.5} />
            ))}
            {/* 下地の張り跡 */}
            <rect x={56} y={36} width={228} height={398} fill="none" stroke="#A8A08C" strokeWidth={4} />
          </g>
          {/* 掛かった白布。皺を面で作る */}
          <g transform={`translate(0 ${-lift * 10})`}>
            <path
              d={`M -4,${-30 + lift * 4} L 344,${-36 + lift * 4}
                  C 352,${120} 348,${300} 340,${470 - lift * 186}
                  C 250,${500 - lift * 196} 110,${496 - lift * 176} -2,${468 - lift * 160}
                  C -10,300 -12,120 -4,${-30 + lift * 4} Z`}
              fill={`url(#${u}-nuno)`}
            />
            {/* 皺 */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={`wr${i}`}
                d={`M ${16 + i * 56},${-30} C ${8 + i * 56},${120 + rnd(201, i) * 40} ${30 + i * 56},${280 - rnd(203, i) * 40} ${18 + i * 56},${456 - lift * 170}`}
                stroke={WP.shirokinuKage}
                strokeWidth={6 + rnd(207, i) * 6}
                fill="none"
                opacity={0.55}
              />
            ))}
            <path d={`M -2,96 C 100,118 240,118 342,94`} stroke={WP.shirokinuKage} strokeWidth={9} fill="none" opacity={0.4} />
            <path d={`M -2,262 C 100,286 240,284 342,258`} stroke={WP.shirokinuKage} strokeWidth={8} fill="none" opacity={0.35} />
            {/* 布の上端の折り返し */}
            <path d={`M -4,${-30 + lift * 4} L 344,${-36 + lift * 4} L 346,${6 + lift * 4} L -2,${12 + lift * 4} Z`} fill="#F6F2E8" />
            {/* めくれた下端。裏側が見える */}
            <path
              d={`M -2,${468 - lift * 160} C 110,${496 - lift * 176} 250,${500 - lift * 196} 340,${470 - lift * 186}
                  C ${320},${470 - lift * 120} ${240},${500 - lift * 130} ${140},${502 - lift * 120}
                  C ${60},${504 - lift * 112} ${10},${492 - lift * 100} -2,${468 - lift * 160} Z`}
              fill={WP.shirokinuKage}
              opacity={0.85}
            />
          </g>
          {/* 下地が見えている隙間の影 */}
          <path d={`M 56,${310 + (1 - lift) * 120} l 228,0 l 0,8 l -228,0 Z`} fill="#2A2E34" opacity={0.3 * lift} />
        </g>

        {/* 空の椅子 (右下) */}
        <g transform="translate(1596 790)">
          <ellipse cx={0} cy={272} rx={160} ry={34} fill="#2A2E34" opacity={0.4} />
          <path d={`M -120,-240 L 120,-240 L 112,10 L -112,10 Z`} fill="#5E4428" />
          <path d={`M -104,-224 L 104,-224 L 98,-6 L -98,-6 Z`} fill={WP.clothRed} opacity={0.75} />
          {[0, 1, 2].map((i) => (
            <path key={`cb${i}`} d={`M -98,${-180 + i * 64} l 196,0`} stroke="#7A2420" strokeWidth={5} opacity={0.5} />
          ))}
          <path d={`M -140,10 L 140,10 L 148,56 L -148,56 Z`} fill="#6E4E30" />
          <path d={`M -130,16 L 130,16 L 134,46 L -134,46 Z`} fill={WP.clothRed} opacity={0.6} />
          <path d={`M -138,56 L -120,266 L -92,266 L -112,56 Z`} fill="#4E3820" />
          <path d={`M 138,56 L 120,266 L 92,266 L 112,56 Z`} fill="#4E3820" />
          <path d={`M -112,170 L 112,170 L 110,186 L -110,186 Z`} fill="#4E3820" />
        </g>

        {/* 床のペルシア絨毯 */}
        <g>
          <path d={`M -200,900 L ${W + 200},880 L ${W + 200},1080 L -200,1080 Z`} fill={WP.karpetKon} />
          <path d={`M -200,928 L ${W + 200},908 L ${W + 200},1052 L -200,1064 Z`} fill={WP.karpetAka} />
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`km${i}`} transform={`translate(${-140 + i * 178} ${990 - i * 1.6})`}>
              <path d={`M 0,-40 L 36,0 L 0,40 L -36,0 Z`} fill={WP.karpetKon} />
              <path d={`M 0,-22 L 20,0 L 0,22 L -20,0 Z`} fill={WP.karpetKinari} />
              <path d={`M 0,-9 L 8,0 L 0,9 L -8,0 Z`} fill={WP.karpetAka} />
            </g>
          ))}
          {Array.from({ length: 36 }).map((_, i) => (
            <path key={`kf${i}`} d={`M ${-180 + i * 56},1080 l 0,-15`} stroke={WP.karpetKinari} strokeWidth={3} opacity={0.5} />
          ))}
        </g>

        {/* 布を掛け直している係の男性の手と袖だけ。人がいることは示す */}
        <g transform={`translate(${1046 + hand * 128} ${694 - hand * 40}) rotate(${-18 + hand * 8})`}>
          {/* 袖 (無地の長袖シャツ) */}
          <path d={`M -520,-130 L 60,-96 L 70,110 L -520,150 Z`} fill="#8E95A0" />
          <path d={`M -520,-130 L 60,-96 L 56,-48 L -520,-76 Z`} fill="#AEB6C0" />
          <path d={`M -520,118 L 66,74 L 70,110 L -520,150 Z`} fill="#5E656E" />
          {/* 袖口のボタン */}
          <path d={`M 26,-98 L 62,-96 L 72,108 L 34,106 Z`} fill="#AEB6C0" />
          <circle cx={48} cy={-26} r={9} fill="#E2E6EC" />
          <circle cx={48} cy={-26} r={9} fill="none" stroke="#7A828C" strokeWidth={2} />
          {/* 手 */}
          <path d={`M 58,-92 C 160,-106 258,-70 282,-6 C 300,58 254,110 162,112 L 60,106 Z`} fill={WP.skin} />
          {/* 布の端をつまむ指 */}
          {[0, 1, 2, 3].map((i) => (
            <g key={`hf${i}`}>
              <path
                d={`M ${214 + i * 8},${-68 + i * 44} C ${292 + i * 6},${-82 + i * 44} ${336},${-50 + i * 44} ${318},${-12 + i * 44}
                    C ${300},${22 + i * 44} ${238},${16 + i * 44} ${212},${-16 + i * 44} Z`}
                fill={WP.skin}
              />
              <path
                d={`M ${248 + i * 8},${-58 + i * 44} C ${298 + i * 6},${-58 + i * 44} ${320},${-36 + i * 44} ${310},${-14 + i * 44}`}
                stroke={WP.skinShade}
                strokeWidth={4}
                fill="none"
                opacity={0.75}
              />
              <ellipse cx={318 + i * 6} cy={-32 + i * 44} rx={12} ry={9} fill="#F0D6B8" opacity={0.85} />
            </g>
          ))}
          <path d={`M 130,96 C 206,130 268,116 282,78 C 290,54 266,40 242,50 L 150,76 Z`} fill={WP.skin} />
          <path d={`M 136,16 C 162,30 188,34 208,28`} stroke={WP.skinShade} strokeWidth={4} fill="none" opacity={0.6} />
          {/* つまんだ布の端 */}
          <path d={`M 300,-40 C 360,-56 420,-40 452,-10 C 400,-6 346,-12 300,-28 Z`} fill={WP.shirokinu} />
        </g>

        {/* 窓の一灯。左上だけ (画面全体には掛けない) */}
        <ellipse cx={180} cy={120} rx={520} ry={400} fill="#D8E8F4" opacity={0.1} />
      </Cam>

      <YearTag year="二〇二六" place="テヘラン" f={f} />
    </>
  );
};

// ===================================================================
// #18 図「声の録音も、公開されていないと報じられています。」
// 画面の中の波形。だが素の方眼にしない (第16条)。放送局の編集卓を物として描く。
// 事件 = 再生ボタンが押されるが、波形が動かない。
// ===================================================================
const S18: SekaiArt = ({ f }) => {
  const u = "b18";
  const press = easeOut(seg(f, 46, 62)) - easeOut(seg(f, 70, 90)); // ★再生を押す
  const playhead = easeInOut(seg(f, 62, 150)); // 再生位置だけ進む
  const rec = Math.sin(f / 8) > 0 ? 1 : 0.3;

  return (
    <>
      <defs>
        <linearGradient id={`${u}-taku`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#4A505A" />
          <stop offset="0.6" stopColor="#32373F" />
          <stop offset="1" stopColor="#1E2228" />
        </linearGradient>
        <linearGradient id={`${u}-scr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E2238" />
          <stop offset="1" stopColor="#061420" />
        </linearGradient>
        <radialGradient id={`${u}-lamp`} cx="0.5" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#CFE2FF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#CFE2FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Cam f={f} from={[0, 18, 1.05]} to={[-12, -8, 1.0]} start={0} end={160}>
        {/* 調整室。奥は吸音材の壁 */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill="#20242C" />
        {Array.from({ length: 11 }).map((_, i) =>
          Array.from({ length: 4 }).map((__, j) => (
            <path
              key={`ab${i}-${j}`}
              d={`M ${-180 + i * 190},${20 + j * 96} l 170,0 l -22,86 l -170,0 Z`}
              fill={j % 2 ? "#2A3038" : "#323A44"}
            />
          )),
        )}
        {/* 吸音材の上側だけ明かりが回る */}
        <ellipse cx={960} cy={60} rx={900} ry={300} fill={`url(#${u}-lamp)`} />

        {/* 編集卓の天板 */}
        <path d={`M -200,520 L ${W + 200},520 L ${W + 200},1080 L -200,1080 Z`} fill={`url(#${u}-taku)`} />
        <path d={`M -200,520 L ${W + 200},520 L ${W + 200},552 L -200,552 Z`} fill="#6E757E" />
        <path d={`M -200,548 L ${W + 200},548 L ${W + 200},558 L -200,558 Z`} fill="#8E959E" opacity={0.6} />

        {/* 波形の画面。真っ平ら */}
        <g>
          <rect x={300} y={112} width={1320} height={372} rx={10} fill="#0A0E14" />
          <rect x={314} y={126} width={1292} height={344} rx={6} fill={`url(#${u}-scr)`} />
          {/* 目盛り (方眼ではなく、時間軸の目盛りとして下に並べる) */}
          {Array.from({ length: 27 }).map((_, i) => (
            <path
              key={`tk${i}`}
              d={`M ${330 + i * 48},452 l 0,${i % 5 === 0 ? -26 : -13}`}
              stroke="#3E6E92"
              strokeWidth={2.4}
              opacity={0.8}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <text key={`tm${i}`} x={330 + i * 240} y={444} fontFamily={SEKAI_SERIF} fontSize={20} fill="#5E94B8">
              {`0:${i * 10 < 10 ? "0" : ""}${i * 10}`}
            </text>
          ))}
          {/* 中心線 ＋ 真っ平らな波形 */}
          <path d={`M 330,300 L 1592,300`} stroke="#2E5C7E" strokeWidth={2} />
          <path d={`M 330,298 L 1592,298`} stroke={WP.screenLit} strokeWidth={5} opacity={0.9} />
          {/* 無音でも微細なノイズ床はある (完全な直線は嘘になるので±1px) */}
          {Array.from({ length: 160 }).map((_, i) => (
            <path
              key={`nz${i}`}
              d={`M ${330 + i * 8},${298 - (rnd(211, i) * 2 - 1)} l 8,${rnd(223, i) * 2 - 1}`}
              stroke={WP.screenLit}
              strokeWidth={2}
              opacity={0.5}
            />
          ))}
          {/* 左右のレベルメーター。振れていない */}
          {[0, 1].map((i) => (
            <g key={`lv${i}`}>
              <rect x={1618} y={140 + i * 170} width={0} height={0} />
              <rect x={330} y={160 + i * 24} width={0} height={0} />
            </g>
          ))}
          {/* 再生位置の縦線だけが進む (波形は動かない) */}
          <path d={`M ${330 + playhead * 1262},128 L ${330 + playhead * 1262},468`} stroke={WP.alert} strokeWidth={3.4} opacity={playhead > 0.01 ? 0.9 : 0} />
          <path d={`M ${330 + playhead * 1262},128 l -9,0 l 9,16 l 9,-16 Z`} fill={WP.alert} opacity={playhead > 0.01 ? 1 : 0} />
          {/* ペルシア語の表示 (NO AUDIO ではない) */}
          <Nastaliq x={1540} y={196} w={320} size={30} color="#7EB8D8" seed={231} op={0.95} />
          <Nastaliq x={1540} y={240} w={210} size={22} color="#5E94B8" seed={233} op={0.8} />
          <path d={`M 1300,212 l 250,0`} stroke="#3E6E92" strokeWidth={2} opacity={0.6} />
          {/* 画面の枠の照り */}
          <rect x={300} y={112} width={1320} height={372} rx={10} fill="none" stroke="#5E6872" strokeWidth={6} />
          <path d={`M 316,128 l 240,0 l -120,340 l -120,0 Z`} fill="#CFE2FF" opacity={0.045} />
        </g>

        {/* 赤い録音ランプ (卓の上。灯っている) */}
        <g transform="translate(220 232)">
          <rect x={-70} y={-54} width={140} height={108} rx={10} fill="#1A1E24" />
          <rect x={-70} y={-54} width={140} height={108} rx={10} fill="none" stroke="#4A525C" strokeWidth={4} />
          <circle cx={0} cy={-10} r={30} fill={WP.alert} opacity={rec} />
          <circle cx={0} cy={-10} r={30} fill="none" stroke="#6E2A1E" strokeWidth={4} />
          <circle cx={-9} cy={-19} r={9} fill="#FFB8A0" opacity={0.7 * rec} />
          <ellipse cx={0} cy={-10} rx={86} ry={70} fill={WP.alert} opacity={0.14 * rec} />
          <Nastaliq x={46} y={38} w={88} size={17} color="#C8C2B6" seed={241} />
        </g>

        {/* フェーダーの並び ＋ 目盛り */}
        <g transform="translate(0 600)">
          {Array.from({ length: 10 }).map((_, i) => {
            const fx = 232 + i * 148;
            const lev = 0.3 + rnd(251, i) * 0.5;
            return (
              <g key={`fd${i}`}>
                {/* つまみの溝 */}
                <rect x={fx - 15} y={0} width={30} height={318} rx={14} fill="#15181E" />
                <rect x={fx - 5} y={10} width={10} height={298} rx={5} fill="#0A0C10" />
                {/* 目盛り */}
                {Array.from({ length: 9 }).map((_, j) => (
                  <g key={`fs${j}`}>
                    <path d={`M ${fx + 24},${22 + j * 34} l ${j % 2 ? 12 : 22},0`} stroke="#8E959E" strokeWidth={2.4} />
                    {j % 2 === 0 ? (
                      <text x={fx + 52} y={28 + j * 34} fontFamily={SEKAI_SERIF} fontSize={16} fill="#8E959E">
                        {j === 0 ? "+10" : `-${j * 5}`}
                      </text>
                    ) : null}
                  </g>
                ))}
                {/* つまみ */}
                <g transform={`translate(${fx} ${36 + (1 - lev) * 250})`}>
                  <rect x={-40} y={-24} width={80} height={48} rx={8} fill="#5E656E" />
                  <rect x={-40} y={-24} width={80} height={48} rx={8} fill="none" stroke="#2A2E34" strokeWidth={3} />
                  <path d={`M -34,0 l 68,0`} stroke="#E2E6EC" strokeWidth={4} />
                  <path d={`M -34,-12 l 68,0 M -34,12 l 68,0`} stroke="#3E454C" strokeWidth={3} />
                </g>
                {/* チャンネル番号 */}
                <text x={fx} y={352} textAnchor="middle" fontFamily={SEKAI_SERIF} fontSize={22} fill="#AEB6C0">
                  {i + 1}
                </text>
                {/* 小さな丸つまみ */}
                <circle cx={fx} cy={-40} r={20} fill="#2A2E34" />
                <circle cx={fx} cy={-40} r={20} fill="none" stroke="#6E757E" strokeWidth={3} />
                <path d={`M ${fx},${-40} l 0,-14`} stroke="#E2E6EC" strokeWidth={3.4} transform={`rotate(${-50 + rnd(257, i) * 100} ${fx} -40)`} />
              </g>
            );
          })}
        </g>

        {/* ★事件 = 再生ボタンが押される。でも波形は動かない */}
        <g transform="translate(1760 760)">
          <rect x={-120} y={-80} width={240} height={300} rx={14} fill="#1A1E24" />
          <rect x={-120} y={-80} width={240} height={300} rx={14} fill="none" stroke="#4A525C" strokeWidth={4} />
          {/* 再生 */}
          <g transform={`translate(0 ${press * 7})`}>
            <circle cx={-52} cy={0} r={42} fill={press > 0.2 ? "#3E7A52" : "#2A3038"} />
            <circle cx={-52} cy={0} r={42} fill="none" stroke="#6E757E" strokeWidth={4} />
            <path d={`M -64,-19 L -32,0 L -64,19 Z`} fill={press > 0.2 ? "#CFF0DC" : "#8E959E"} />
          </g>
          {/* 停止 */}
          <circle cx={52} cy={0} r={42} fill="#2A3038" />
          <circle cx={52} cy={0} r={42} fill="none" stroke="#6E757E" strokeWidth={4} />
          <rect x={36} y={-16} width={32} height={32} fill="#8E959E" />
          {/* 送り / 戻し */}
          <circle cx={-52} cy={110} r={36} fill="#2A3038" />
          <circle cx={-52} cy={110} r={36} fill="none" stroke="#6E757E" strokeWidth={3.4} />
          <path d={`M -66,96 l 16,14 l -16,14 Z M -48,96 l 16,14 l -16,14 Z`} fill="#8E959E" />
          <circle cx={52} cy={110} r={36} fill="#2A3038" />
          <circle cx={52} cy={110} r={36} fill="none" stroke="#6E757E" strokeWidth={3.4} />
          <path d={`M 66,96 l -16,14 l 16,14 Z M 48,96 l -16,14 l 16,14 Z`} fill="#8E959E" />
          <Nastaliq x={96} y={188} w={180} size={18} color="#AEB6C0" seed={261} />
        </g>

        {/* ヘッドホン (卓に置いてある。誰もかけていない) */}
        <g transform="translate(600 820) rotate(-8)">
          <ellipse cx={0} cy={110} rx={210} ry={44} fill="#0E1116" opacity={0.6} />
          {/* ヘッドバンド */}
          <path d={`M -160,40 C -186,-100 186,-100 160,40`} stroke={WP.headphoneKuro} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d={`M -150,24 C -172,-84 172,-84 150,24`} stroke="#4A4E56" strokeWidth={11} fill="none" />
          {/* 耳あて */}
          {[-1, 1].map((d) => (
            <g key={`ec${d}`} transform={`translate(${d * 166} 56)`}>
              <ellipse cx={0} cy={0} rx={74} ry={86} fill={WP.headphoneKuro} />
              <ellipse cx={0} cy={0} rx={74} ry={86} fill="none" stroke="#4A4E56" strokeWidth={4} />
              <ellipse cx={0} cy={0} rx={52} ry={62} fill="#15181E" />
              <ellipse cx={0} cy={0} rx={52} ry={62} fill="none" stroke="#3E454C" strokeWidth={6} />
              <ellipse cx={-16} cy={-22} rx={20} ry={24} fill="#5E656E" opacity={0.3} />
            </g>
          ))}
          {/* 螺旋のケーブル */}
          <path
            d={`M -166,142 C -120,210 -40,186 10,230 C 60,274 -30,300 -110,286`}
            stroke={WP.headphoneKuro}
            strokeWidth={13}
            fill="none"
            strokeLinecap="round"
          />
          {Array.from({ length: 16 }).map((_, i) => (
            <ellipse
              key={`cl${i}`}
              cx={-120 + i * 18}
              cy={246 + Math.sin(i / 1.4) * 22}
              rx={13}
              ry={9}
              fill="none"
              stroke={WP.headphoneKuro}
              strokeWidth={6}
            />
          ))}
          <rect x={-128} y={272} width={28} height={22} rx={5} fill={WP.brass} />
        </g>

        {/* 卓の上の冷めたチャイ (エステカン＋真鍮の受け皿) */}
        <g transform="translate(1270 858)">
          <ellipse cx={0} cy={76} rx={112} ry={30} fill="#0E1116" opacity={0.55} />
          <ellipse cx={0} cy={60} rx={104} ry={28} fill={WP.shinchuuKage} />
          <ellipse cx={0} cy={54} rx={104} ry={28} fill={WP.brass} />
          <ellipse cx={0} cy={52} rx={84} ry={21} fill="#E8D28A" opacity={0.5} />
          <path d={`M -34,40 C -40,6 -30,-42 -24,-60 L 24,-60 C 30,-42 40,6 34,40 Z`} fill="#C8DCE2" opacity={0.28} />
          <path d={`M -31,38 C -36,16 -28,-26 -23,-44 L 23,-44 C 28,-26 36,16 31,38 Z`} fill={WP.chai} opacity={0.9} />
          <path d={`M -31,-18 C -10,-24 10,-24 31,-18`} stroke="#6E3010" strokeWidth={4} fill="none" opacity={0.7} />
          <path d={`M -34,40 C -40,6 -30,-42 -24,-60 L 24,-60 C 30,-42 40,6 34,40 Z`} fill="none" stroke="#DCEAEE" strokeWidth={3.4} opacity={0.7} />
          <path d={`M -18,18 C -22,-10 -16,-40 -12,-54`} stroke="#F2FAFC" strokeWidth={4} fill="none" opacity={0.5} />
          {/* 冷めている = 湯気が無い。表面に膜 */}
          <ellipse cx={0} cy={-44} rx={23} ry={6} fill="#7A3A12" opacity={0.75} />
          {/* 小さじ */}
          <path d={`M 52,34 L 118,10`} stroke={WP.steelLit} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={126} cy={8} rx={14} ry={9} fill={WP.steelLit} transform="rotate(-20 126 8)" />
        </g>
      </Cam>
    </>
  );
};

// ===================================================================
// #19 並「メッセージは、ほぼ文書だけです。」
// 白い紙への寄り。ペルシア語の文書・円形の緑の公印・透かし・署名・クリップ・ファクスの出口。
// 事件 = 紙が一枚ずつ積まれていく。声の無さを紙の厚みで言う。
// ===================================================================
const S19: SekaiArt = ({ f }) => {
  const u = "b19";
  // ★事件 = 紙が一枚ずつ積まれていく (6枚)
  const sheets = Array.from({ length: 6 }).map((_, i) => easeOut(seg(f, 12 + i * 20, 12 + i * 20 + 22)));

  const Sheet: React.FC<{ i: number; t: number }> = ({ i, t }) => {
    const x = 470 + i * 11 + (1 - t) * 540;
    const y = 470 - i * 17 + (1 - t) * -300;
    const rot = -3 + i * 1.1 + (1 - t) * 11;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={t > 0.02 ? 1 : 0}>
        <rect x={14} y={18} width={760} height={520} fill="#6E6658" opacity={0.3} />
        <rect x={0} y={0} width={760} height={520} fill={i % 2 ? "#F6F2E8" : WP.paperWhite} />
        <rect x={0} y={0} width={760} height={520} fill="none" stroke="#CFC8BA" strokeWidth={2} />
        {/* 便箋の透かし (薄く浮く) */}
        <g opacity={0.14}>
          <circle cx={380} cy={262} r={132} fill="none" stroke="#8E8678" strokeWidth={7} />
          <AllahMark x={380} y={262} u={150} color="#8E8678" />
        </g>
        {/* 上の罫と差出の欄 */}
        <path d={`M 44,74 l 672,0`} stroke={WP.koinMidori} strokeWidth={4} opacity={0.7} />
        <Nastaliq x={700} y={56} w={300} size={22} color={WP.koinMidori} seed={271 + i} op={0.9} />
        {/* 本文 (右から左。ナスタアリーク寄りの流れる書体) */}
        {Array.from({ length: 10 }).map((_, j) => (
          <Nastaliq
            key={`ln${j}`}
            x={706}
            y={122 + j * 34}
            w={520 + rnd(281 + i, j) * 150}
            size={21}
            color={WP.ink}
            seed={291 + i * 11 + j}
            op={0.92}
          />
        ))}
        {/* 署名 (流れる一筆) */}
        <path
          d={`M 580,466 c -28,-30 -56,10 -80,-14 c -22,-22 -46,16 -70,-6 c -22,-20 -42,14 -62,0 c -18,-12 -30,8 -44,-6`}
          stroke="#1E2A4E"
          strokeWidth={4.4}
          fill="none"
          strokeLinecap="round"
        />
        <path d={`M 596,452 c 16,24 -6,42 -26,34`} stroke="#1E2A4E" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* 円形の公印 (緑のインク。かすれる) */}
        <g transform="translate(638 428) rotate(-11)">
          <circle cx={0} cy={0} r={70} fill="none" stroke={WP.koinMidori} strokeWidth={7} opacity={0.85} />
          <circle cx={0} cy={0} r={56} fill="none" stroke={WP.koinMidori} strokeWidth={3.4} opacity={0.75} />
          <AllahMark x={0} y={2} u={58} color={WP.koinMidori} op={0.8} />
          {Array.from({ length: 14 }).map((_, j) => {
            const a = (j / 14) * Math.PI * 2;
            return (
              <path
                key={`sl${j}`}
                d={`M ${Math.cos(a) * 60},${Math.sin(a) * 60} l ${Math.cos(a) * 8},${Math.sin(a) * 8}`}
                stroke={WP.koinMidori}
                strokeWidth={3}
                opacity={0.7}
              />
            );
          })}
          {/* かすれ */}
          <path d={`M -44,-52 l 26,18`} stroke={WP.paperWhite} strokeWidth={5} opacity={0.8} />
          <path d={`M 34,44 l 20,10`} stroke={WP.paperWhite} strokeWidth={4} opacity={0.7} />
        </g>
        {/* 紙の端の折れ */}
        <path d={`M 760,520 l -52,0 l 52,-44 Z`} fill="#DED6C4" />
        <path d={`M 760,476 l -52,44`} stroke="#B8B0A0" strokeWidth={2} />
      </g>
    );
  };

  return (
    <>
      <defs>
        <linearGradient id={`${u}-tsukue`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#7E5632" />
          <stop offset="1" stopColor="#3A2614" />
        </linearGradient>
        <linearGradient id={`${u}-fax`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E2DED2" />
          <stop offset="1" stopColor="#B8B4A8" />
        </linearGradient>
        <radialGradient id={`${u}-hi`} cx="0.35" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#FFF6E2" stopOpacity="0.4" />
          <stop offset="1" stopColor="#FFF6E2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Cam f={f} from={[22, -14, 1.04]} to={[-12, 10, 1.0]} start={0} end={160}>
        {/* 机 */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-tsukue)`} />
        {Array.from({ length: 18 }).map((_, i) => (
          <path
            key={`mk${i}`}
            d={`M -200,${-20 + i * 64} C 500,${-6 + i * 64 + rnd(301, i) * 24} 1300,${-32 + i * 64 - rnd(307, i) * 20} ${W + 200},${-14 + i * 64}`}
            stroke={WP.mokumeSuji}
            strokeWidth={2 + rnd(311, i) * 3}
            fill="none"
            opacity={0.4}
          />
        ))}

        {/* ファクスの出口 (左上から紙が出てくる) */}
        <g transform="translate(-60 -40)">
          <rect x={0} y={0} width={620} height={330} rx={18} fill={`url(#${u}-fax)`} />
          <rect x={0} y={0} width={620} height={330} rx={18} fill="none" stroke="#8E8A7E" strokeWidth={5} />
          {/* 操作パネル */}
          <rect x={360} y={44} width={210} height={90} rx={8} fill="#CFC8B8" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={`kb${i}`}
              x={374 + (i % 4) * 50}
              y={56 + Math.floor(i / 4) * 26}
              width={40}
              height={20}
              rx={4}
              fill="#9A958D"
            />
          ))}
          <rect x={60} y={44} width={250} height={56} rx={6} fill="#3E4A3E" />
          <path d={`M 76,72 l 48,0 M 136,72 l 70,0 M 216,72 l 34,0`} stroke={WP.signGreen} strokeWidth={6} opacity={0.9} />
          <circle cx={540} cy={168} r={16} fill={WP.signGreen} opacity={0.8 + Math.sin(f / 7) * 0.2} />
          {/* 紙の出口のスリット */}
          <rect x={40} y={230} width={520} height={30} rx={8} fill="#5E5A54" />
          <rect x={40} y={230} width={520} height={10} rx={5} fill="#3A3832" />
          <Nastaliq x={320} y={300} w={240} size={20} color="#5E5A54" seed={321} />
          {/* 出かけの1枚 */}
          <g transform={`translate(${60 + Math.sin(f / 18) * 4} 248)`}>
            <rect x={0} y={0} width={480} height={160} fill={WP.paperWhite} />
            <rect x={0} y={0} width={480} height={160} fill="none" stroke="#C4BCA8" strokeWidth={2} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Nastaliq key={`fl${j}`} x={450} y={40 + j * 32} w={360} size={19} color={WP.ink} seed={331 + j} op={0.85} />
            ))}
          </g>
        </g>

        {/* 積まれていく紙 (下から順に) */}
        {sheets.map((t, i) => (
          <Sheet key={`sh${i}`} i={i} t={t} />
        ))}

        {/* 紙を留めたクリップ (一番上の紙の左上に) */}
        <g transform={`translate(${524 + 5 * 11} ${452 - 5 * 17}) rotate(${2.5}) `} opacity={sheets[5]}>
          <path
            d={`M 0,0 C -26,-10 -34,-52 -8,-66 C 20,-80 40,-54 32,-26 C 26,-6 6,-2 -2,-14 C -10,-28 2,-40 14,-34`}
            stroke={WP.steelLit}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M 0,0 C -26,-10 -34,-52 -8,-66 C 20,-80 40,-54 32,-26 C 26,-6 6,-2 -2,-14 C -10,-28 2,-40 14,-34`}
            stroke="#F2F6FA"
            strokeWidth={3.4}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
          <ellipse cx={4} cy={6} rx={34} ry={10} fill="#6E6658" opacity={0.3} />
        </g>

        {/* 紙の厚みを横から見せる (声の無さを厚みで言う) */}
        <g transform="translate(460 988)">
          {sheets.map((t, i) => (
            <g key={`ed${i}`} opacity={t}>
              <path d={`M 0,${-i * 17} l 760,0 l 0,8 l -760,0 Z`} fill="#E6E0D0" />
              <path d={`M 0,${-i * 17 + 8} l 760,0`} stroke="#B2AA98" strokeWidth={2} />
            </g>
          ))}
        </g>

        {/* 左上からの明かり */}
        <ellipse cx={620} cy={140} rx={900} ry={600} fill={`url(#${u}-hi)`} />
      </Cam>
    </>
  );
};

// ===================================================================
// #20 図「玉音放送の『玉音』とは、声のことです。」
// 文字の分解。だが紙と墨で作る。辞書の紙面・虫眼鏡・玉音盤の溝と針。
// 事件 = 虫眼鏡の下で「音」の字だけが大きくなり、レコードの溝に重なる。
// ===================================================================
const S20: SekaiArt = ({ f }) => {
  const u = "b20";
  const split = easeInOut(seg(f, 20, 74)); // 「玉」が部首に分かれる
  const lens = easeInOut(seg(f, 72, 126)); // 虫眼鏡が「音」の上へ
  const zoom = 1 + lens * 1.5; // ★事件。「音」だけが大きくなる
  const needle = easeOut(seg(f, 120, 160));
  const lx = 1086 - lens * 0;
  const ly = 560;

  return (
    <>
      <defs>
        <linearGradient id={`${u}-tsuku`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#5E4428" />
          <stop offset="1" stopColor="#2E1E10" />
        </linearGradient>
        <radialGradient id={`${u}-glass`} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#D8E8F4" stopOpacity="0.08" />
          <stop offset="1" stopColor="#D8E8F4" stopOpacity="0.02" />
        </radialGradient>
        <radialGradient id={`${u}-hi`} cx="0.4" cy="0.08" r="0.8">
          <stop offset="0" stopColor="#FFF6DC" stopOpacity="0.38" />
          <stop offset="1" stopColor="#FFF6DC" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${u}-lens-clip`}>
          <circle cx={lx} cy={ly} r={176} />
        </clipPath>
      </defs>

      <Cam f={f} from={[-14, 10, 1.03]} to={[12, -8, 1.0]} start={0} end={160}>
        {/* 机 */}
        <rect x={-200} y={0} width={W + 400} height={1080} fill={`url(#${u}-tsuku)`} />
        {Array.from({ length: 16 }).map((_, i) => (
          <path
            key={`mk${i}`}
            d={`M -200,${-10 + i * 72} C 520,${4 + i * 72 + rnd(341, i) * 26} 1340,${-26 + i * 72 - rnd(347, i) * 22} ${W + 200},${-6 + i * 72}`}
            stroke={WP.mokumeSuji}
            strokeWidth={2 + rnd(349, i) * 3}
            fill="none"
            opacity={0.35}
          />
        ))}

        {/* 辞書の紙面 (薄い紙・下の頁が透ける) */}
        <g transform="translate(60 120) rotate(-2)">
          <rect x={18} y={22} width={1120} height={800} fill="#2E1E10" opacity={0.4} />
          <rect x={0} y={0} width={1120} height={800} fill={WP.jishoKami} />
          {/* 下の頁が透ける */}
          {Array.from({ length: 24 }).map((_, i) => (
            <path key={`tr${i}`} d={`M 620,${60 + i * 30} l ${330 - rnd(353, i) * 140},0`} stroke="#C8C0A8" strokeWidth={5} opacity={0.3} />
          ))}
          {/* 二段組の罫と見出し */}
          <path d={`M 560,40 l 0,720`} stroke="#C4BCA4" strokeWidth={2.4} />
          {Array.from({ length: 23 }).map((_, i) => (
            <path key={`ls${i}`} d={`M 40,${64 + i * 30} l ${460 - rnd(359, i) * 120},0`} stroke="#5E5648" strokeWidth={4.6} opacity={0.8} />
          ))}
          {/* 見出し語の黒丸 */}
          {[2, 9, 16].map((i) => (
            <circle key={`bl${i}`} cx={30} cy={60 + i * 30} r={7} fill={WP.ink} />
          ))}
          {/* 頁の端の指のあと */}
          <ellipse cx={1086} cy={420} rx={30} ry={92} fill="#D8CEB2" opacity={0.5} />
          {/* 頁番号 */}
          <text x={60} y={780} fontFamily={SEKAI_SERIF} fontSize={26} fill="#6E6656">
            1042
          </text>
          {/* 栞の紐 */}
          <path d={`M 1110,0 C 1118,220 1104,420 1116,620 L 1086,700 L 1136,700 Z`} fill={WP.inkRed} opacity={0.85} />
        </g>

        {/* 「玉音」の二文字。毛筆・墨の濃淡。「玉」が部首に分かれる */}
        <g transform="translate(400 420)">
          {/* 「玉」 */}
          <g transform={`translate(${-split * 96} 0)`}>
            {/* 横棒 (上) */}
            <path d={`M -112,-120 C -40,-130 48,-128 116,-120 C 48,-104 -40,-104 -112,-116 Z`} fill={WP.ink} />
            {/* 横棒 (中) */}
            <path d={`M -96,-30 C -30,-40 40,-38 100,-30 C 40,-14 -30,-14 -96,-26 Z`} fill="#241F18" />
            {/* 縦棒 */}
            <path d={`M -14,-132 C -6,-60 -6,30 -16,104 C 4,104 18,98 16,66 C 14,0 8,-70 14,-130 Z`} fill={WP.ink} />
            {/* 横棒 (下) */}
            <path d={`M -126,96 C -40,84 60,86 130,98 C 60,118 -40,116 -126,102 Z`} fill="#1E1A14" />
            {/* 点 */}
            <path d={`M 76,10 C 106,2 126,22 116,44 C 104,66 76,58 70,38 Z`} fill={WP.ink} transform={`translate(${split * 150} ${-split * 46})`} />
            {/* 墨のかすれ */}
            <path d={`M -60,-118 l 24,0 M 30,-28 l 26,0`} stroke={WP.jishoKami} strokeWidth={4} opacity={0.6} />
          </g>
          {/* 分かれた部首の行き先に、朱の囲みと注 */}
          <g opacity={split}>
            <rect x={-260} y={-190} width={300} height={130} rx={8} fill="none" stroke={WP.inkRed} strokeWidth={4} />
            <text x={-250} y={-200} fontFamily={SEKAI_SERIF} fontSize={30} fill={WP.inkRed}>
              王 (おう)
            </text>
            <rect x={60} y={-78} width={160} height={150} rx={8} fill="none" stroke={WP.inkRed} strokeWidth={4} />
            <text x={62} y={-88} fontFamily={SEKAI_SERIF} fontSize={30} fill={WP.inkRed}>
              丶
            </text>
            <path d={`M 40,-120 L 150,-82`} stroke={WP.inkRed} strokeWidth={3} />
          </g>
          {/* 振り仮名「ぎょくおん」 */}
          <text x={-130} y={214} fontFamily={SEKAI_SERIF} fontSize={46} fill="#4A443A">
            ぎょくおん
          </text>
          <path d={`M -136,232 l 320,0`} stroke="#8E8678" strokeWidth={3} />
        </g>

        {/* 「音」 ── 虫眼鏡の下で大きくなる */}
        <g transform={`translate(${lx} ${ly})`}>
          <g transform={`scale(${zoom})`}>
            {/* 「立」 */}
            <path d={`M -6,-128 C 2,-128 8,-120 6,-108 C 4,-98 -8,-98 -10,-108 Z`} fill={WP.ink} />
            <path d={`M -62,-92 C -20,-98 26,-98 62,-92 C 26,-80 -20,-80 -62,-88 Z`} fill={WP.ink} />
            <path d={`M -40,-86 C -48,-72 -56,-62 -66,-54 C -56,-50 -46,-56 -40,-70 Z`} fill="#241F18" />
            <path d={`M 40,-86 C 48,-72 56,-62 66,-54 C 56,-50 46,-56 40,-70 Z`} fill="#241F18" />
            <path d={`M -74,-38 C -24,-46 28,-46 74,-38 C 28,-26 -24,-26 -74,-34 Z`} fill={WP.ink} />
            {/* 「日」 */}
            <path d={`M -46,-22 L 46,-22 L 46,78 L -46,78 Z`} fill="none" stroke={WP.ink} strokeWidth={13} />
            <path d={`M -42,28 L 42,28`} stroke={WP.ink} strokeWidth={11} />
            {/* 墨のかすれ */}
            <path d={`M -20,-90 l 18,0 M 10,-36 l 16,0`} stroke={WP.jishoKami} strokeWidth={3} opacity={0.5} />
          </g>
        </g>

        {/* レコード盤 (玉音盤) と針。右下 */}
        <g transform="translate(1476 760)">
          <ellipse cx={0} cy={26} rx={400} ry={360} fill="#2E1E10" opacity={0.45} />
          <circle cx={0} cy={0} r={392} fill={WP.recordKuro} />
          <circle cx={0} cy={0} r={392} fill="none" stroke="#2E2E36" strokeWidth={6} />
          {/* 溝 */}
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={`gv${i}`}
              cx={0}
              cy={0}
              r={132 + i * 8.6}
              fill="none"
              stroke={i % 3 === 0 ? WP.recordMizo : "#2A2A32"}
              strokeWidth={i % 3 === 0 ? 2.6 : 1.6}
              opacity={0.9}
            />
          ))}
          {/* 盤面の照り */}
          <path d={`M -300,-240 C -150,-330 150,-330 300,-240 C 150,-180 -150,-180 -300,-240 Z`} fill="#8E8E9A" opacity={0.12} />
          {/* 中央のレーベル */}
          <circle cx={0} cy={0} r={126} fill="#D8C79A" />
          <circle cx={0} cy={0} r={126} fill="none" stroke="#A89270" strokeWidth={4} />
          <circle cx={0} cy={0} r={11} fill={WP.recordKuro} />
          <text x={0} y={-62} textAnchor="middle" fontFamily={SEKAI_SERIF} fontSize={30} fontWeight={700} fill={WP.ink}>
            玉音盤
          </text>
          <path d={`M -86,-42 l 172,0`} stroke={WP.ink} strokeWidth={2.4} opacity={0.6} />
          <text x={0} y={76} textAnchor="middle" fontFamily={SEKAI_SERIF} fontSize={22} fill="#4A443A">
            昭和二十年八月
          </text>
          <path d={`M -70,42 l 140,0 M -56,56 l 112,0`} stroke="#6E6656" strokeWidth={2} opacity={0.5} />
          {/* 針とアーム */}
          <g transform={`rotate(${-24 + needle * 10} 420 -300)`}>
            <path d={`M 420,-300 L 120,-110`} stroke={WP.steelDark} strokeWidth={17} strokeLinecap="round" />
            <path d={`M 420,-300 L 120,-110`} stroke={WP.steelLit} strokeWidth={6} opacity={0.6} />
            <circle cx={426} cy={-306} r={34} fill={WP.steelDark} />
            <circle cx={426} cy={-306} r={16} fill={WP.steelLit} />
            {/* ヘッドシェル */}
            <path d={`M 128,-120 L 92,-92 L 66,-112 L 104,-142 Z`} fill="#3E454C" />
            <path d={`M 76,-100 L 62,-82`} stroke={WP.steelLit} strokeWidth={5} />
            <path d={`M 62,-82 l -6,10 l 8,2 Z`} fill="#E2E6EC" />
          </g>
        </g>

        {/* 虫眼鏡 ── 「音」の上。溝に重なる */}
        <g>
          {/* レンズの中だけ溝が見える (重なり) */}
          <g clipPath={`url(#${u}-lens-clip)`} opacity={lens}>
            {Array.from({ length: 14 }).map((_, i) => (
              <path
                key={`lg${i}`}
                d={`M ${lx - 190},${ly - 160 + i * 25} C ${lx - 60},${ly - 176 + i * 25} ${lx + 60},${ly - 144 + i * 25} ${lx + 190},${ly - 160 + i * 25}`}
                stroke={WP.recordMizo}
                strokeWidth={3}
                fill="none"
                opacity={0.7}
              />
            ))}
          </g>
          {/* ガラス */}
          <circle cx={lx} cy={ly} r={176} fill={`url(#${u}-glass)`} />
          <circle cx={lx} cy={ly} r={176} fill="none" stroke="#F2F6FA" strokeWidth={4} opacity={0.5} />
          {/* 真鍮の枠 */}
          <circle cx={lx} cy={ly} r={188} fill="none" stroke={WP.brass} strokeWidth={24} />
          <circle cx={lx} cy={ly} r={188} fill="none" stroke="#E8D28A" strokeWidth={8} opacity={0.7} />
          <circle cx={lx} cy={ly} r={200} fill="none" stroke={WP.shinchuuKage} strokeWidth={5} />
          {/* 柄 */}
          <g transform={`rotate(38 ${lx} ${ly})`}>
            <path d={`M ${lx},${ly + 196} l 0,160`} stroke={WP.brass} strokeWidth={28} strokeLinecap="round" />
            <path d={`M ${lx},${ly + 220} l 0,120`} stroke="#E8D28A" strokeWidth={9} opacity={0.6} />
            <rect x={lx - 32} y={ly + 348} width={64} height={190} rx={26} fill={WP.mushimeganeWaku} />
            <rect x={lx - 20} y={ly + 364} width={16} height={160} rx={8} fill="#B08E56" opacity={0.6} />
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={`rg${i}`} d={`M ${lx - 32},${ly + 386 + i * 26} l 64,0`} stroke="#5E4428" strokeWidth={4} opacity={0.5} />
            ))}
          </g>
          {/* レンズのハイライト */}
          <path d={`M ${lx - 120},${ly - 70} C ${lx - 80},${ly - 150} ${lx + 10},${ly - 160} ${lx + 60},${ly - 130}`} stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={0.3} strokeLinecap="round" />
        </g>

        {/* 机の明かり */}
        <ellipse cx={700} cy={120} rx={900} ry={620} fill={`url(#${u}-hi)`} />
      </Cam>
    </>
  );
};

// ===================================================================
export const GROUP_B: Record<string, SekaiArt> = {
  sekai_11: S11,
  sekai_12: S12,
  sekai_13: S13,
  sekai_14: S14,
  sekai_15: S15,
  sekai_16: S16,
  sekai_17: S17,
  sekai_18: S18,
  sekai_19: S19,
  sekai_20: S20,
};
