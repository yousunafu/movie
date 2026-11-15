// 「人類は、昔から飛ばして観ていた」: 文#137〜#148 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1223〜1234。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  skyDay: "#BBD8EA",     // 昼の空
  brick: "#C9794F",      // 映画館のレンガ
  brickDark: "#A95F3C",
  awning: "#C65348",     // 日よけテント
  pave: "#D8CFBA",       // 歩道
  nightHall: "#2B2838",  // 暗い場内
  hallWall: "#514256",   // 場内の壁
  screenSky: "#CFE3EE",  // スクリーンの中の空
  sand: "#E3C98F",       // 西部劇の砂地
  mesa: "#C98A5E",       // 岩山
  seatRed: "#8E3A42",    // 客席の椅子
  carpet: "#7E3B45",     // 通路の絨毯
  twiSky: "#564A74",     // 夕暮れの空
  twiGlow: "#E8A75C",    // 夕暮れの残照
  house: "#6A5C72",      // 夕暮れの家並み
  desk: "#C89B62",       // 机の木
  deskDark: "#A87F4C",
  uniform: "#B04A52",    // 案内係の制服
  press: "#8E97A4",      // 輪転機の鉄
  pressDark: "#6C7480",
  cork: "#C8A878",       // コルク掲示板
  bp: "#2F5D8A",         // 青写真の紙
  bpLine: "#DCE9F4",     // 青写真の白線
  ticket: "#F0E3C2",     // 切符の紙
  lampWarm: "#F3DFA6",   // 場内のともしび
} as const;
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 決まった見た目の擬似乱数 (毎フレーム同じ値。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// 吹き出し (白地+しっぽ)。t: 0→1 で pop
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; t?: number;
  tail?: [number, number]; children?: React.ReactNode;
}> = ({ x, y, w, h, t = 1, tail, children }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      {tail && (
        <path d={`M ${tail[0] - 26} ${h / 2 - 8} L ${tail[0]} ${tail[1]} L ${tail[0] + 26} ${h / 2 - 8} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {tail && (
        <path d={`M ${tail[0] - 22} ${h / 2 - 10} L ${tail[0]} ${tail[1] - 6} L ${tail[0] + 22} ${h / 2 - 10} Z`}
          fill={KRP.white} />
      )}
      {children}
    </g>
  );
};

// スクリーンの中の「追跡の場面」(西部劇)。#138 と #139 で同じ場面を映す (複製禁止 → 共通部品)
// x,y = 左上。w,h でスクリーンの大きさ。still で止め絵寄りに
const ChaseScreen: React.FC<{
  f: number; x: number; y: number; w: number; h: number;
}> = ({ f, x, y, w, h }) => {
  const id = `chase_${Math.round(x)}_${Math.round(y)}`;
  const sx = w / 1200; // 中身は 1200x660 で描いて縮める
  const gallop = Math.sin(f / 3) * 10;       // 馬の脚
  const shake = Math.sin(f / 2.2) * 3;       // 駅馬車のガタゴト
  const run = (f * 7) % 46;                  // 地面の石が後ろへ流れる
  return (
    <g>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
      {/* 白っぽい銀幕の地 */}
      <rect x={x} y={y} width={w} height={h} fill={C.screenSky} />
      <g clipPath={`url(#${id})`}><g transform={`translate(${x} ${y}) scale(${sx})`}>
        {/* 空と砂地 */}
        <rect x={-40} y={-40} width={1280} height={420} fill={C.screenSky} />
        <rect x={-40} y={380} width={1280} height={320} fill={C.sand} />
        <line x1={-40} y1={380} x2={1240} y2={380} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
        {/* 岩山 (メサ) と太陽 */}
        <path d="M 60 380 L 100 220 L 150 200 L 160 150 L 260 150 L 272 205 L 330 230 L 360 380 Z"
          fill={C.mesa} stroke={KRP.ink} strokeWidth={6} opacity={0.85} />
        <circle cx={1020} cy={120} r={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        {/* サボテン2本 */}
        {[880, 1120].map((cx, i) => (
          <g key={i} transform={`translate(${cx} 380) scale(${i ? 0.7 : 1})`}
            fill="#7FA86A" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
            <rect x={-14} y={-120} width={28} height={120} rx={13} />
            <path d="M -14 -70 L -46 -70 L -46 -104 L -30 -104 L -30 -86 L -14 -86 Z" />
            <path d="M 14 -52 L 44 -52 L 44 -92 L 28 -92 L 28 -68 L 14 -68 Z" />
          </g>
        ))}
        {/* 地面を後ろへ流れる石 (スピード感) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={((i * 260 + 120 + run * 4) % 1300) - 40} cy={430 + (i % 3) * 70}
            rx={16} ry={5} fill={C.mesa} opacity={0.6} />
        ))}
        {/* 逃げる駅馬車 (左へ) */}
        <g transform={`translate(330 ${430 + shake * 0.4})`}>
          {/* 引き馬 */}
          <g transform="translate(-180 10)">
            <ellipse cx={0} cy={-40} rx={62} ry={30} fill="#8A5A3C" stroke={KRP.ink} strokeWidth={6} />
            <path d="M 46 -56 Q 78 -72 86 -100 L 102 -92 Q 96 -60 64 -44 Z"
              fill="#8A5A3C" stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
            <path d="M 86 -104 L 108 -96 L 100 -78" fill="#8A5A3C" stroke={KRP.ink} strokeWidth={5} />
            {[-1, 1].map((d) => (
              <g key={d}>
                <line x1={-34} y1={-18} x2={-34 - 16 * d + gallop * d * 0.8} y2={16}
                  stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
                <line x1={30} y1={-18} x2={30 + 16 * d - gallop * d * 0.8} y2={16}
                  stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
              </g>
            ))}
            <path d={`M -58 -46 Q -84 -40 -92 ${-18 + gallop * 0.4}`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          </g>
          {/* 車体 */}
          <g transform={`translate(0 ${shake})`}>
            <rect x={-70} y={-110} width={150} height={82} rx={10}
              fill={C.seatRed} stroke={KRP.ink} strokeWidth={6.5} />
            <rect x={-48} y={-94} width={44} height={36} rx={6} fill={C.screenSky} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-80} y={-124} width={170} height={18} rx={6} fill={C.mesa} stroke={KRP.ink} strokeWidth={5} />
            {/* 荷物と御者 */}
            <rect x={6} y={-150} width={52} height={28} rx={5} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-52} cy={-142} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -70 -128 Q -52 -138 -34 -128 L -34 -112 L -70 -112 Z" fill={C.ink} />
          </g>
          {/* 車輪2つ (回る) */}
          {[-44, 56].map((wx) => (
            <g key={wx} transform={`translate(${wx} 0) rotate(${-f * 16})`}>
              <circle r={34} fill={C.sand} stroke={KRP.ink} strokeWidth={6.5} />
              <g stroke={KRP.ink} strokeWidth={4.5}>
                <line x1={-30} y1={0} x2={30} y2={0} /><line x1={0} y1={-30} x2={0} y2={30} />
                <line x1={-21} y1={-21} x2={21} y2={21} /><line x1={21} y1={-21} x2={-21} y2={21} />
              </g>
              <circle r={7} fill={KRP.ink} />
            </g>
          ))}
        </g>
        {/* 追う騎手 (右から) */}
        <g transform={`translate(760 ${436 + Math.sin(f / 3 + 1.3) * 5})`}>
          <ellipse cx={0} cy={-44} rx={66} ry={31} fill="#5E4330" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -48 -60 Q -82 -76 -88 -106 L -104 -96 Q -98 -62 -66 -48 Z"
            fill="#5E4330" stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
          <path d="M -90 -110 L -112 -100 L -102 -82" fill="#5E4330" stroke={KRP.ink} strokeWidth={5} />
          {[-1, 1].map((d) => (
            <g key={d}>
              <line x1={-36} y1={-22} x2={-36 + 18 * d - gallop * d * 0.9} y2={14}
                stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
              <line x1={34} y1={-22} x2={34 - 18 * d + gallop * d * 0.9} y2={14}
                stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
          <path d={`M 56 -50 Q 86 -42 92 ${-20 + gallop * 0.4}`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          {/* 騎手: 前傾+投げ縄 */}
          <g transform="translate(-4 -70)">
            <path d="M -20 0 Q -14 -44 14 -40 L 22 -6 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5.5} />
            <circle cx={-14} cy={-52} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -34 -58 L 6 -58 L 2 -68 Q -14 -76 -30 -68 Z" fill={C.mesa} stroke={KRP.ink} strokeWidth={4.5} />
            <ellipse cx={-14} cy={-58} rx={24} ry={5} fill={C.mesa} stroke={KRP.ink} strokeWidth={4} />
            <g transform={`rotate(${f * 22} -34 -74)`}>
              <ellipse cx={-34} cy={-74} rx={30} ry={12} fill="none" stroke={C.desk} strokeWidth={5} />
            </g>
            <path d="M -8 -34 Q -22 -48 -34 -72" fill="none" stroke={C.desk} strokeWidth={4} />
          </g>
          {/* 砂ぼこり */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={86 + i * 44 + Math.sin(f / 5 + i) * 6} cy={6 - i * 8}
              r={20 + i * 8} fill={C.sand} stroke={KRP.ink} strokeWidth={4} opacity={0.5 - i * 0.12} />
          ))}
        </g>
      </g></g>
      {/* 銀幕のちらつき (映写のゆらぎ) */}
      <rect x={x} y={y} width={w} height={h} fill={KRP.white}
        opacity={0.06 + 0.05 * Math.sin(f / 2.7)} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={8} />
    </g>
  );
};

// 客席の椅子の背もたれ1列 (後ろから見た場内用)
const SeatBackRow: React.FC<{
  y: number; n: number; w: number; x0: number; color?: string; sc?: number;
}> = ({ y, n, w, x0, color = C.seatRed, sc = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(${x0 + i * w} ${y}) scale(${sc})`}>
        <rect x={-w / 2 / sc + 7} y={-74} width={w / sc - 14} height={78} rx={14}
          fill={color} stroke={KRP.ink} strokeWidth={5.5} />
        <path d={`M ${-w / 2 / sc + 16} -58 Q 0 -66 ${w / 2 / sc - 16} -58`}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
      </g>
    ))}
  </g>
);

// 案内係の制帽 (手に持たせたり頭に載せたり)
const PillboxCap: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-46} y={-40} width={92} height={40} rx={8}
        fill={C.uniform} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-40} rx={46} ry={12} fill="#8E3038" stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={-46} y1={-12} x2={46} y2={-12} stroke={KRP.yellow} strokeWidth={6} />
    </g>
  );

// 映画館の正面 (ひさし看板つき)。#137 で大きく、#141 で街の中に小さく使う
const FacadeFront: React.FC<{
  f: number; x: number; y: number; s?: number; night?: boolean;
}> = ({ f, x, y, s = 1, night = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 壁 (レンガ) */}
    <rect x={-430} y={-620} width={860} height={620} fill={C.brick} stroke={KRP.ink} strokeWidth={8} />
    {Array.from({ length: 5 }, (_, r) => (
      <g key={r} stroke={C.brickDark} strokeWidth={3.5} opacity={0.7}>
        <line x1={-430} y1={-560 + r * 56} x2={430} y2={-560 + r * 56} />
        {Array.from({ length: 6 }, (_, c) => (
          <line key={c} x1={-390 + c * 150 + (r % 2) * 75} y1={-560 + r * 56}
            x2={-390 + c * 150 + (r % 2) * 75} y2={-504 + r * 56} />
        ))}
      </g>
    ))}
    {/* 上部の縦看板 */}
    <rect x={-96} y={-610} width={192} height={250} rx={10}
      fill={night ? "#3A3148" : KRP.white} stroke={KRP.ink} strokeWidth={7} />
    <text x={0} y={-535} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={54} fill={night ? KRP.yellow : C.uniform}>映</text>
    <text x={0} y={-462} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={54} fill={night ? KRP.yellow : C.uniform}>画</text>
    {/* ひさし (マーキー) + 電球 */}
    <path d="M -380 -360 L 380 -360 L 340 -258 L -340 -258 Z"
      fill={C.awning} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-340} y={-258} width={680} height={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <text x={0} y={-216} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={40} letterSpacing={10} fill={KRP.ink}>CINEMA</text>
    {Array.from({ length: 11 }, (_, i) => (
      <circle key={i} cx={-330 + i * 66} cy={-342} r={9}
        fill={(i + Math.floor(f / 8)) % 2 === 0 || night ? KRP.yellow : KRP.white}
        stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {/* 入口の両開き扉 (中は温かい光) */}
    <rect x={-150} y={-190} width={300} height={190} fill={night ? KRP.yellow : C.lampWarm}
      stroke={KRP.ink} strokeWidth={7} opacity={0.95} />
    <path d="M -150 -190 L -62 -164 L -62 0 L -150 0 Z" fill={C.brickDark} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M 150 -190 L 62 -164 L 62 0 L 150 0 Z" fill={C.brickDark} stroke={KRP.ink} strokeWidth={5.5} />
    <circle cx={-76} cy={-82} r={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
    <circle cx={76} cy={-82} r={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
    {/* 切符売場の小窓 (左) とポスター (右) */}
    <g transform="translate(-300 0)">
      <rect x={-64} y={-200} width={128} height={200} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-46} y={-182} width={92} height={108} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -46 -128 L 46 -128 M -14 -182 L -14 -128" stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-34} y={-66} width={68} height={10} rx={4} fill={C.deskDark} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
    <g transform="translate(300 0)">
      <rect x={-58} y={-196} width={116} height={160} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -36 -120 L -10 -168 L 16 -108 L 36 -140" fill="none" stroke={C.uniform} strokeWidth={5} />
      <rect x={-40} y={-88} width={80} height={10} fill={KRP.gray} />
      <rect x={-40} y={-70} width={62} height={8} fill={KRP.gray} />
    </g>
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #137 お客は、好きな時間に、ふらっと入ります。
// 格: 並 / seed 1223
// 絵: 昼下がり。買い物袋を提げた婦人がふらっと入場。もぎりが「どうぞ」と帽子に手
// どこ: 1930年代アメリカの街角。映画館の正面入口を歩道から見る。昼下がりの陽ざし
// 演出: 正面は FacadeFront。もぎりが帽子を取って「どうぞ」。婦人が買い物袋を提げてふらっと
// 動き: 婦人が右から歩み寄る / もぎりの帽子の手が上がる / 電球明滅 / 鳩が跳ねる / 日差しの帯
const Sg137: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 2, 38));
  const lx = lerp(1560, 1230, walk);            // 婦人の立ち位置
  const hop = Math.abs(Math.sin(f / 4)) * (1 - walk) * 8; // 歩きの弾み
  const tip = easeOut(seg(f, 10, 26));          // もぎりの帽子
  return (
    <Frame f={f} seed={1223} bg={C.skyDay}>
      {/* 空と奥の街並み */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.skyDay} />
      <circle cx={1700 + Math.sin(f / 30) * 4} cy={150} r={70} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={1180 + i * 115} y={330 - rnd(1, i) * 120} width={100}
          height={500} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
      ))}
      {/* 歩道と車道 */}
      <rect x={-20} y={790} width={W + 40} height={310} fill={C.pave} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={-40 + i * 330} y1={1100} x2={120 + i * 330} y2={790}
          stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
      ))}
      {/* 映画館の正面 (左2/3を占める主役) */}
      <FacadeFront f={f} x={620} y={800} s={1.28} />
      {/* ひさしの影が歩道に落ちる */}
      <path d="M 70 800 L 1170 800 L 1300 960 L -40 960 Z" fill={KRP.ink} opacity={0.08} />
      {/* もぎり: 扉の前で帽子を取って会釈 */}
      <g transform="translate(795 1004)">
        <ellipse cx={0} cy={6} rx={84} ry={18} fill={KRP.ink} opacity={0.15} />
        <Person x={0} y={0} s={1.18} cloth={C.uniform} clothDark="#8E3038"
          face="smile" hair="none" pose="raise" gaze={[0.5, 0]} f={f} phase={2} />
        {/* 上げた手の先に制帽 (頭から取ったところ) */}
        <PillboxCap x={82} y={-282 - tip * 26} s={1.05} rot={18 + tip * 14} />
      </g>
      {/* 婦人: 買い物袋を提げてふらっと入場 */}
      <g transform={`translate(${lx} ${1010 - hop})`}>
        <ellipse cx={0} cy={4} rx={80} ry={17} fill={KRP.ink} opacity={0.15} />
        <Person x={0} y={0} s={1.3} cloth="#5B7FA6" clothDark="#46648A"
          face="joy" hair="cap" pose="hold" gaze={[-0.6, 0]} lean={-2} f={f} phase={5} />
        {/* 手提げの買い物袋 (パンと葱が顔を出す) */}
        <g transform={`translate(0 ${-118 * 1.3}) rotate(${Math.sin(f / 7) * 3})`}>
          <path d="M -52 10 L 52 10 L 42 150 L -42 150 Z" fill={C.desk} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -30 10 Q 0 -28 30 10" fill="none" stroke={KRP.ink} strokeWidth={6} />
          <line x1={-42} y1={46} x2={42} y2={46} stroke={C.deskDark} strokeWidth={4} />
          <path d="M -20 8 Q -16 -34 4 -40 Q 18 -30 12 8 Z" fill={C.ticket} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 22 8 L 30 -46 M 30 8 L 38 -40" stroke={KRP.green} strokeWidth={7} strokeLinecap="round" />
        </g>
      </g>
      {/* 立て看板「上映中」(もぎりの脇) */}
      <g transform={`translate(1060 990) rotate(${Math.sin(f / 11) * 1.2})`}>
        <path d="M -60 0 L -20 -170 L 20 -170 L 60 0 Z" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-66} y={-180} width={132} height={120} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-138} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.uniform}>上映</text>
        <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.uniform}>中</text>
      </g>
      {/* 歩道の鳩 (のどかさ) */}
      <g transform={`translate(${260 + seg(f, 0, 42) * 60} ${1035 - Math.abs(Math.sin(f / 5)) * 10})`}>
        <ellipse cx={0} cy={0} rx={26} ry={17} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={22} cy={-12} r={10} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 30 -12 L 42 -9 L 30 -5 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={25} cy={-14} r={1.8} fill={KRP.ink} />
        <path d="M -8 -4 Q -24 -14 -30 -2" fill="none" stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #138 本編が途中でも、おかまいなしです。
// 格: 並 / seed 1224
// 絵: スクリーンは物語のど真ん中 (追跡の場面)。入ってきた客は平然と席へ。隣も気にしない
// どこ: 暗い場内を最後列の後ろから。スクリーンは追跡の場面のど真ん中
// 演出: ChaseScreen が主役。映写の光の帯が頭上を貫く。入ってきた客が列を歩くが誰も気にしない
// 動き: 追跡が走る / 映写光がちらつく / 新来の客が席へ歩く / 座る客は前を向いたまま小さく揺れる
const Sg138: React.FC<{ f: number }> = ({ f }) => {
  const inWalk = easeOut(seg(f, 4, 40));
  const nx = lerp(1650, 1130, inWalk); // 新来の客 (右の戸口→席へ)
  return (
    <Frame f={f} seed={1224} bg={C.nightHall} dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightHall} />
      {/* 場内の壁と天井の飾り */}
      <rect x={-20} y={-20} width={W + 40} height={140} fill={C.hallWall} />
      <line x1={-20} y1={118} x2={W + 20} y2={118} stroke={KRP.ink} strokeWidth={6} />
      {[180, 1740].map((sx) => (
        <g key={sx} transform={`translate(${sx} 330)`}>
          <rect x={-16} y={-60} width={32} height={120} rx={10} fill={C.hallWall} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-78} r={22} fill={C.lampWarm} opacity={0.5 + Math.sin(f / 9 + sx) * 0.1} />
          <circle cx={0} cy={-78} r={11} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* スクリーン (追跡の場面 = 共通部品) と額縁 */}
      <rect x={312} y={142} width={1296} height={586} fill="#1C1927" />
      <ChaseScreen f={f} x={340} y={166} w={1240} h={540} />
      {/* 映写の光の帯 (後ろの上から) */}
      <polygon points="1920,40 1860,10 380,250 380,610" fill={C.lampWarm}
        opacity={0.1 + 0.03 * Math.sin(f / 3)} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={lerp(1800, 500, rnd(21, i))}
          cy={lerp(70, 420, rnd(21, i)) + Math.sin(f / 10 + i * 2) * 10}
          r={3 + rnd(22, i) * 3} fill={C.lampWarm} opacity={0.4} />
      ))}
      {/* 客席: 背もたれ3列 + 座る客のシルエット頭 */}
      <SeatBackRow y={880} n={10} w={200} x0={60} sc={1} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <circle cx={150 + i * 212 + rnd(23, i) * 30} cy={776 + rnd(24, i) * 10} r={34}
            fill="#4A4052" stroke={KRP.ink} strokeWidth={5}
            transform={`translate(0 ${Math.sin(f / 13 + i * 1.7) * 3})`} />
        </g>
      ))}
      <SeatBackRow y={1010} n={8} w={250} x0={30} sc={1.18} />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={170 + i * 300 + rnd(25, i) * 40} cy={886 + rnd(26, i) * 12} r={42}
          fill="#3E3647" stroke={KRP.ink} strokeWidth={5.5}
          transform={`translate(0 ${Math.sin(f / 12 + i * 2.1) * 3})`} />
      ))}
      {/* 新来の客: 2列目を平然と歩いて席へ。隣は振り向きもしない */}
      <g transform={`translate(${nx} ${872 - Math.abs(Math.sin(f / 4)) * (1 - inWalk) * 7})`}>
        <PersonMini x={0} y={0} s={1.15} color="#6E5A74" f={f} phase={9} face="none" arms="down" />
        {/* 外から持ち込んだ帽子のシルエット */}
        <ellipse cx={0} cy={-224} rx={46} ry={10} fill={KRP.ink} />
        <path d="M -26 -224 L -28 -252 Q 0 -266 28 -252 L 26 -224 Z" fill={KRP.ink} />
      </g>
      {/* 戸口 (右端): 外の明かりがひとすじ差し込む */}
      <rect x={1830} y={620} width={70} height={300} fill={C.lampWarm} opacity={0.8} />
      <rect x={1830} y={620} width={70} height={300} fill="none" stroke={KRP.ink} strokeWidth={6} />
      <polygon points="1830,920 1620,1010 1830,1010" fill={C.lampWarm} opacity={0.35} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #139 そのまま観続けて、自分が入ってきた場面がまた来たら、席を立ちます。
// 格: 並 / seed 1225
// 絵: 時計が一周。スクリーンにさっきと同じ場面。客が「あ」と指さして立ち上がる
// どこ: 場内の横から寄り。左にスクリーンの端 (さっきと同じ追跡の場面)、右の壁に大時計
// 演出: 時計の長針が一周する円矢印。客が「あ」と気づいてスクリーンを指さし立ち上がる
// 動き: 長針が360度回る / 円矢印が描かれる / 客が pop で立つ / 気づきの放射線 / 画面は同じ場面が走る
const Sg139: React.FC<{ f: number }> = ({ f }) => {
  const spin = easeOut(seg(f, 2, 34));      // 長針一周
  const up = pop(seg(f, 22, 36));           // 立ち上がり
  const aha = seg(f, 26, 36);               // 気づきの放射線
  return (
    <Frame f={f} seed={1225} bg="#3A3344">
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#3A3344" />
      {/* 壁 (横から見た場内。板壁と幅木) */}
      <rect x={560} y={-20} width={1380} height={880} fill={C.hallWall} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={620 + i * 230} y1={-20} x2={620 + i * 230} y2={860}
          stroke={KRP.ink} strokeWidth={3} opacity={0.2} />
      ))}
      <rect x={560} y={820} width={1380} height={40} fill="#3E3647" stroke={KRP.ink} strokeWidth={5} />
      {/* 左: スクリーンの端 (さっきと同じ場面 = 同じ部品) */}
      <ChaseScreen f={f} x={-500} y={120} w={1040} h={560} />
      <rect x={520} y={90} width={40} height={620} fill="#2A2433" stroke={KRP.ink} strokeWidth={6} />
      {/* 床 (絨毯) */}
      <rect x={-20} y={860} width={W + 40} height={240} fill={C.carpet} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 0 930 Q 480 914 960 930 T 1920 930" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
      {/* 壁の大時計: 文字盤は目盛りだけ (数字は描かない)。長針が一周 */}
      <g transform="translate(1530 330)">
        <circle r={210} fill={C.ticket} stroke={KRP.ink} strokeWidth={9} />
        <circle r={186} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-186} x2={0} y2={i % 3 === 0 ? -150 : -164}
            stroke={KRP.ink} strokeWidth={i % 3 === 0 ? 9 : 5}
            transform={`rotate(${i * 30})`} />
        ))}
        {/* 短針はわずか、長針が f で一周する */}
        <line x1={0} y1={26} x2={0} y2={-108} stroke={KRP.ink} strokeWidth={13}
          strokeLinecap="round" transform={`rotate(${210 + spin * 28})`} />
        <line x1={0} y1={30} x2={0} y2={-160} stroke={C.uniform} strokeWidth={9}
          strokeLinecap="round" transform={`rotate(${210 + spin * 360})`} />
        <circle r={13} fill={KRP.ink} />
        {/* 「一周」の円矢印 (時計のまわりに描かれていく) */}
        <g transform="rotate(-90)">
          <circle r={246} fill="none" stroke={KRP.orange} strokeWidth={10}
            strokeLinecap="round" strokeDasharray={`${spin * 1470} 2000`} opacity={0.9} />
        </g>
        <g transform={`rotate(${-90 + spin * 340})`} opacity={spin > 0.12 ? 1 : 0}>
          <polygon points="246,-26 282,6 222,16" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4}
            transform="rotate(90 246 0)" />
        </g>
      </g>
      {/* 壁のともしび */}
      <g transform="translate(830 560)">
        <rect x={-14} y={-48} width={28} height={96} rx={9} fill="#3E3647" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-64} r={20} fill={C.lampWarm} opacity={0.55 + Math.sin(f / 8) * 0.12} />
        <circle cx={0} cy={-64} r={10} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 椅子2脚 (横向き) と立ち上がる客 */}
      {[1020, 1340].map((cx, i) => (
        <g key={i} transform={`translate(${cx} 980)`}>
          <rect x={-30} y={-250} width={60} height={250} rx={14} fill={C.seatRed} stroke={KRP.ink} strokeWidth={6.5} />
          <rect x={-30} y={-130} width={190} height={46} rx={14} fill={C.seatRed} stroke={KRP.ink} strokeWidth={6.5} />
          <rect x={126} y={-130} width={34} height={130} rx={10} fill="#6E2E36" stroke={KRP.ink} strokeWidth={5.5} />
        </g>
      ))}
      {/* 客: 「あ」と指さして立つ (pop)。隣の客は座ったまま */}
      <g transform={`translate(1110 ${920 - up * 120})`}>
        <ellipse cx={0} cy={6} rx={84} ry={16} fill={KRP.ink} opacity={0.2} />
        <Person x={0} y={0} s={1.32} cloth={KRP.blueDeep} clothDark="#2F5590"
          face="surprised" pose="point" pointDir={-1} gaze={[-0.7, 0]} f={f} phase={3} />
        {/* 気づきの放射線 */}
        <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round"
          opacity={aha > 0 ? 0.95 : 0} transform={`scale(${0.6 + pop(aha) * 0.4})`}>
          <line x1={-66} y1={-400} x2={-84} y2={-432} />
          <line x1={0} y1={-416} x2={0} y2={-452} />
          <line x1={66} y1={-400} x2={84} y2={-432} />
        </g>
      </g>
      <g transform="translate(1430 900)">
        <PersonMini x={0} y={0} s={1.0} color="#56465C" f={f} phase={7} face="none" arms="down" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #140 「ここから観たんだ」。英語で、ジス・イズ・ホエア・ウィ・ケイム・イン。
// 格: 山 / seed 1226
// 絵: 名物の決め台詞。通路で帽子をかぶり直す夫婦の吹き出しに英語の原文。周囲の客が心得顔で会釈。事件 (この章の看板)
// どこ: 中央通路を正面から (山)。背後にスクリーンの光、左右に客席、絨毯の通路
// 演出: 帽子をかぶり直す夫婦。吹き出しに英語の原文 (指示書で指定)。周囲の客が心得顔で会釈
// 動き: 帽子が頭に下りる / 吹き出し pop / まわりの客がうなずく / スクリーン光が明滅 / 案内係の灯
const Sg140: React.FC<{ f: number }> = ({ f }) => {
  const hat = easeOut(seg(f, 6, 20));   // 夫の帽子が頭に下りる
  const bub = seg(f, 10, 24);           // 吹き出し
  const nod = Math.sin(f / 9);          // 会釈
  return (
    <Frame f={f} seed={1226} bg={C.nightHall} dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightHall} />
      {/* 奥 = スクリーンの光 (本編は続いている) */}
      <rect x={430} y={60} width={1060} height={300} fill={C.screenSky}
        opacity={0.85 + 0.08 * Math.sin(f / 3)} />
      <rect x={430} y={60} width={1060} height={300} fill={KRP.yellow} opacity={0.1} />
      <rect x={400} y={36} width={1120} height={348} fill="none" stroke={KRP.ink} strokeWidth={9} />
      {/* スクリーンの中は遠すぎてまぶしいだけ (光のにじみ) */}
      <circle cx={960} cy={210} r={230} fill={KRP.white} opacity={0.25} />
      {/* 左右の壁とともしび */}
      {[120, 1800].map((sx) => (
        <g key={sx} transform={`translate(${sx} 300)`}>
          <circle cx={0} cy={0} r={24} fill={C.lampWarm} opacity={0.5 + Math.sin(f / 8 + sx) * 0.12} />
          <circle cx={0} cy={0} r={12} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-13} y={14} width={26} height={70} rx={8} fill={C.hallWall} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 中央通路の絨毯 (奥から手前へ広がる) */}
      <polygon points="880,420 1040,420 1500,1100 420,1100" fill={C.carpet} stroke={KRP.ink} strokeWidth={6} />
      <polygon points="915,460 1005,460 1310,1100 610,1100" fill="none" stroke={KRP.yellow} strokeWidth={4} opacity={0.5} />
      {/* 左右の客席 (奥へ低く) + 心得顔の客 */}
      {[0, 1].map((side) => {
        const dir = side === 0 ? 1 : -1;
        return (
          <g key={side} transform={side === 1 ? "translate(1920 0) scale(-1 1)" : undefined}>
            <SeatBackRow y={700} n={3} w={150} x0={120} sc={0.78} />
            <SeatBackRow y={860} n={3} w={190} x0={90} sc={0.95} />
            <SeatBackRow y={1060} n={3} w={240} x0={40} sc={1.2} />
            {/* 振り向いて会釈する客2人 + 前を向いたままの客 */}
            <g transform={`translate(240 646) rotate(${nod * 2.5 * dir})`}>
              <circle cx={0} cy={-36} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={10} cy={-40} r={3.4} fill={KRP.ink} />
              <path d="M 2 -26 Q 10 -20 18 -26" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
            </g>
            <g transform={`translate(430 800) rotate(${-nod * 3 * dir})`}>
              <circle cx={0} cy={-40} r={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
              <circle cx={13} cy={-45} r={4} fill={KRP.ink} />
              <path d="M 2 -28 Q 12 -21 22 -28" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
              <ellipse cx={0} cy={-76} rx={40} ry={9} fill={KRP.ink} />
            </g>
            <circle cx={180} cy={980} r={48} fill="#4A4052" stroke={KRP.ink} strokeWidth={5.5}
              transform={`translate(0 ${Math.sin(f / 12 + side * 3) * 3})`} />
          </g>
        );
      })}
      {/* 夫婦: 通路で帽子をかぶり直して帰るところ (主役) */}
      <g transform="translate(830 1030)">
        <ellipse cx={0} cy={6} rx={90} ry={18} fill={KRP.ink} opacity={0.25} />
        <Person x={0} y={0} s={1.45} cloth="#4A5A44" clothDark="#39462F"
          face="joy" hair="none" pose="raise" gaze={[0.2, -0.3]} f={f} phase={1} />
        {/* 上げた手から頭へ下りてくる中折れ帽。
            かぶり終わりは頭 (中心 -330 / てっぺん -423) に重なる -380 まで下ろす。
            体ゆれ (Person と同じ式・phase 1) も足して帽子だけ取り残されないようにする */}
        <g transform={`translate(${lerp(104, 0, hat)} ${lerp(-420, -380, hat) + Math.sin((f + 17) / 13) * 3}) rotate(${lerp(24, 0, hat)})`}>
          <ellipse cx={0} cy={0} rx={84} ry={17} fill="#2F2A24" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -48 2 L -50 -52 q 50 -26 100 0 L 48 2 Z" fill="#2F2A24" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-49} y={-20} width={98} height={13} fill="#15120F" stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      <g transform="translate(1120 1046)">
        <ellipse cx={0} cy={6} rx={86} ry={17} fill={KRP.ink} opacity={0.25} />
        <Person x={0} y={0} s={1.38} cloth="#8A5A74" clothDark="#6E4260"
          face="smile" hair="cap" pose="hold" gaze={[-0.4, -0.2]} lean={1.5} f={f} phase={6} />
        {/* 胸の前でつば広帽を整える */}
        <g transform={`translate(0 -164) rotate(${Math.sin(f / 8) * 4})`}>
          <ellipse cx={0} cy={0} rx={74} ry={15} fill="#C08A9E" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -36 0 Q 0 -44 36 0 Z" fill="#C08A9E" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -36 -4 Q 0 -16 36 -4" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
      {/* 吹き出し: 英語の原文 (指示書の指定)。スクリーンと人物の間の空きに置く */}
      <Bubble x={930} y={540} w={1240} h={170} t={bub} tail={[-80, 150]}>
        <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={64} fill={KRP.ink} letterSpacing={1}>This is where we came in</text>
        <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={700}
          fontSize={32} fill={KRP.grayDark}>ここから観たんだ</text>
      </Bubble>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #141 帰り際の決まり文句として、すっかり定着していました。
// 格: 図 / seed 1227
// 絵: 街の暮らしの図。映画館の出口から出る人々の吹き出しが、みな同じ決まり文句。合言葉のように連なる
// どこ: 夕暮れの街の図。左に映画館 (FacadeFront 夜版)、右へ家路の人の流れ
// 演出: 出口から出る人々の吹き出しが、みな同じ決まり文句。合言葉のように連なる
// 動き: 吹き出しが左から順に pop / 歩く人が弾む / 街灯がともる / 一番星がまたたく
const Sg141: React.FC<{ f: number }> = ({ f }) => {
  const phrase = "This is where we came in";
  const walkers = [
    { x: 700, s: 1.0, c: "#5B7FA6", by: 70 },
    { x: 1010, s: 0.94, c: "#8A5A74", by: 140 },
    { x: 1320, s: 0.9, c: "#4A5A44", by: 75 },
    { x: 1630, s: 0.86, c: "#A8763C", by: 145 },
  ];
  return (
    <Frame f={f} seed={1227} bg={C.twiSky}>
      {/* 夕暮れの空のグラデーション (帯3段) と残照 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.twiSky} />
      <rect x={-20} y={300} width={W + 40} height={260} fill="#7A5A7E" opacity={0.8} />
      <rect x={-20} y={470} width={W + 40} height={220} fill={C.twiGlow} opacity={0.55} />
      {/* 一番星と細い月 */}
      <circle cx={1500} cy={130} r={7} fill={KRP.white}
        opacity={0.5 + 0.5 * Math.sin(f / 7)} />
      <path d="M 300 120 A 60 60 0 1 0 348 216 A 48 52 0 1 1 300 120 Z"
        fill={C.ticket} stroke={KRP.ink} strokeWidth={4.5} opacity={0.9} />
      {/* 奥の家並み (影絵ではなく窓にともる灯)。吹き出しの帯より低く抑える */}
      {Array.from({ length: 9 }, (_, i) => {
        const hx = -40 + i * 230;
        const hh = 110 + rnd(31, i) * 70;
        return (
          <g key={i}>
            <rect x={hx} y={640 - hh} width={190} height={hh} fill={C.house} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${hx - 10} ${640 - hh} L ${hx + 95} ${640 - hh - 54} L ${hx + 200} ${640 - hh} Z`}
              fill="#564458" stroke={KRP.ink} strokeWidth={5} />
            {[0, 1].map((wi) => (
              <rect key={wi} x={hx + 36 + wi * 84} y={640 - hh + 40} width={40} height={48}
                fill={rnd(32, i * 2 + wi) < 0.7 ? C.lampWarm : "#4A3E52"}
                stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
        );
      })}
      {/* 通り (家路の道) */}
      <rect x={-20} y={640} width={W + 40} height={460} fill="#6E6258" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={640} width={W + 40} height={34} fill={C.pave} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 40 900 L 220 900 M 420 940 L 600 940 M 900 900 L 1080 900 M 1400 940 L 1580 940"
        stroke={C.ticket} strokeWidth={8} opacity={0.4} strokeLinecap="round" />
      {/* 左: 映画館 (夜の顔)。ここから人が流れ出す */}
      <FacadeFront f={f} x={240} y={860} s={0.86} night />
      <polygon points="330,860 560,860 760,1040 300,1040" fill={KRP.yellow} opacity={0.2} />
      {/* 街灯2本 (ともっている) */}
      {[880, 1560].map((lx, i) => (
        <g key={i} transform={`translate(${lx} 880)`}>
          <rect x={-8} y={-360} width={16} height={360} fill={KRP.ink} />
          <path d="M 0 -360 Q 54 -384 72 -344" fill="none" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <circle cx={76} cy={-332} r={26} fill={C.lampWarm}
            opacity={0.75 + Math.sin(f / 6 + i * 2) * 0.12} />
          <circle cx={76} cy={-332} r={13} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      ))}
      {/* 家路の人々: みな同じ決まり文句の吹き出し (合言葉の連なり) */}
      {walkers.map((wk, i) => {
        const t = seg(f, 6 + i * 7, 16 + i * 7); // 左から順に pop
        return (
          <g key={i}>
            <g transform={`translate(${wk.x} ${900 - Math.abs(Math.sin(f / 5 + i * 1.4)) * 8})`}>
              <PersonMini x={0} y={0} s={wk.s * 1.05} color={wk.c} f={f} phase={i * 3} face="smile" arms="down" />
              <ellipse cx={0} cy={-224 * wk.s} rx={40 * wk.s} ry={9 * wk.s} fill={KRP.ink} />
            </g>
            <Bubble x={wk.x + 10} y={wk.by + 180} w={442} h={92} t={t} tail={[-20, 110]}>
              <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={27} fill={KRP.ink}>{phrase}</text>
            </Bubble>
          </g>
        );
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #142 ちなみに、この動画をここまで飛ばして来た方は、いま、まさにこれをやっています。
// 格: 並 / seed 1228
// 絵: `SaiseiBar` 再登場。つまみがこの章の位置にぽとんと落ち、波紋。「いまここ」の旗
// どこ: 作業机の上 (真上から)。木の天板に SaiseiBar が置いてある。まわりにフィルムと鋏
// 演出: 共有装置 SaiseiBar (指示書指定)。つまみが章の位置へぽとんと飛び、波紋と「いまここ」の旗
// 動き: progress が一気に飛ぶ / 着地で波紋が広がる / 旗が pop してはためく / フィルムの端が揺れる
const Sg142: React.FC<{ f: number }> = ({ f }) => {
  const jump = pop(seg(f, 8, 20));                    // つまみの飛び
  const prog = 0.06 + 0.54 * jump;                    // 0.06 → 0.60 (この章の位置)
  const land = seg(f, 20, 40);                        // 着地後の波紋
  const flag = seg(f, 22, 34);                        // 旗
  const bs = 1.12;                                    // SaiseiBar の倍率
  const px = 960 + (-560 + 1120 * prog) * bs;         // つまみの画面x (バー中心960)
  return (
    <Frame f={f} seed={1228} bg={C.desk}>
      {/* 机の天板 (板目) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.desk} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={-20} y1={90 + i * 230} x2={W + 20} y2={86 + i * 230}
            stroke={C.deskDark} strokeWidth={5} opacity={0.6} />
          <path d={`M ${300 + i * 340} ${170 + i * 225} q 26 10 52 0 q -26 14 -52 0 Z`}
            fill={C.deskDark} opacity={0.5} />
        </g>
      ))}
      {/* 散らばる小物: フィルムの切れ端・鋏・鉛筆・マグの輪じみ */}
      <g transform={`translate(260 220) rotate(-14)`}>
        <rect x={-230} y={-44} width={460} height={88} rx={8} fill="#3A362E" stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={-214 + i * 50} y={-36} width={14} height={10} rx={3} fill={C.desk} />
            <rect x={-214 + i * 50} y={26} width={14} height={10} rx={3} fill={C.desk} />
          </g>
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={-196 + i * 102} y={-20} width={88} height={40} rx={4}
            fill={C.screenSky} stroke={KRP.ink} strokeWidth={3.5} opacity={0.9} />
        ))}
        {/* 端が少し浮いて揺れる */}
        <path d={`M 230 -44 q ${24 + Math.sin(f / 7) * 6} 20 10 88`}
          fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      </g>
      <g transform="translate(1620 250) rotate(24)">
        <circle cx={-26} cy={44} r={20} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={26} cy={44} r={20} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <path d="M -20 28 L -2 -86 L 4 -86 L 12 28 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 20 28 L 2 -86 L -4 -86 L -12 28 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform="translate(1500 880) rotate(-8)">
        <rect x={-170} y={-13} width={340} height={26} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="170,-13 214,0 170,13" fill={C.ticket} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={214} cy={0} r={4} fill={KRP.ink} />
        <rect x={-196} y={-13} width={26} height={26} fill="#C96F6F" stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <circle cx={360} cy={850} r={78} fill="none" stroke={C.deskDark} strokeWidth={9} opacity={0.5} />
      {/* 主役: 再生バー (共有装置)。つまみが prog の位置へ飛ぶ */}
      <SaiseiBar f={f} x={960} y={600} s={bs} t={1} progress={prog} />
      {/* 飛んでいる間の軌跡 (点線の山なり) */}
      {jump > 0.05 && jump < 0.98 && (
        <path d={`M ${960 - 553 * bs} 560 Q ${lerp(500, px, 0.5)} ${400 - 120 * Math.sin(jump * Math.PI)} ${px} ${560 - 90 * Math.sin(jump * Math.PI)}`}
          fill="none" stroke={KRP.orange} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" opacity={0.85} />
      )}
      {/* 着地の波紋 (机に広がる輪) */}
      {land > 0 && [0, 1, 2].map((i) => {
        const rT = clamp01(land * 1.6 - i * 0.3);
        if (rT <= 0) return null;
        return (
          <ellipse key={i} cx={px} cy={604} rx={60 + rT * (190 + i * 60)} ry={(60 + rT * (190 + i * 60)) * 0.34}
            fill="none" stroke={KRP.orange} strokeWidth={7 - i * 2} opacity={(1 - rT) * 0.9} />
        );
      })}
      {/* 「いまここ」の旗 (つまみの真上に立つ) */}
      {flag > 0 && (
        <g transform={`translate(${px} 540) scale(${pop(flag)})`}>
          <line x1={0} y1={0} x2={0} y2={-210} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          <circle cx={0} cy={-216} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 0 -204 L ${218 + Math.sin(f / 5) * 8} ${-178 + Math.sin(f / 5) * 5} L 0 -140 Z`}
            fill={KRP.red} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <text x={96} y={-160} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={42} fill={KRP.white} transform={`rotate(${6 + Math.sin(f / 5) * 1.5} 96 -160)`}>いまここ</text>
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #143 ようこそ。当時の映画館と同じく、この動画も、途中からのお客さまを歓迎しています。
// 格: 山 / seed 1229
// 絵: **メタの瞬間**。劇場の案内係がこちら (画面の外=視聴者) に向かって帽子を取り、懐中電灯で空席へ案内する。真正面の構図
// どこ: 場内の入口に立った視点 (真正面・山)。緞帳の袖と真鍮の柵、奥に客席
// 演出: メタの瞬間。案内係がこちら=視聴者に帽子を取り、懐中電灯で空席を照らして招く
// 動き: 帽子の手が上がる / 光の筋が空席へ振られる / 光の中のほこりが舞う / 席の客が小さく揺れる
const Sg143: React.FC<{ f: number }> = ({ f }) => {
  const tip = easeOut(seg(f, 6, 22));            // 帽子を取る
  return (
    <Frame f={f} seed={1229} bg="#352C3E" dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#352C3E" />
      {/* 奥の壁とスクリーンの淡い照り返し */}
      <rect x={-20} y={-20} width={W + 40} height={560} fill="#473A52" />
      <circle cx={660} cy={240} r={340} fill={C.screenSky} opacity={0.1 + 0.03 * Math.sin(f / 4)} />
      {/* 奥の客席 (段々と客) */}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <SeatBackRow y={560 + r * 100} n={9} w={160 + r * 26} x0={420 - r * 60} sc={0.62 + r * 0.14} />
          {Array.from({ length: 6 }, (_, i) => {
            const empty = (r === 1 && (i === 2 || i === 3)) || (r === 0 && i === 4);
            if (empty) return null;
            return (
              <circle key={i} cx={500 + i * (150 + r * 30) + rnd(41, r * 7 + i) * 24}
                cy={498 + r * 98} r={20 + r * 6} fill="#5A4C64" stroke={KRP.ink} strokeWidth={4.5}
                transform={`translate(0 ${Math.sin(f / 12 + i + r) * 2.5})`} />
            );
          })}
        </g>
      ))}
      {/* 懐中電灯の光の筋 (手元から空席の列へ) */}
      {(() => {
        const swx = Math.sin(f / 9) * 28;
        return (
          <g>
            <polygon points={`966,916 ${496 + swx},588 ${896 + swx},548`} fill={C.lampWarm} opacity={0.3} />
            <polygon points={`966,916 ${556 + swx},592 ${842 + swx},560`} fill={C.lampWarm} opacity={0.32} />
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={620 + rnd(42, i) * 300 + swx * 0.7}
                cy={600 + rnd(43, i) * 240 + Math.sin(f / 8 + i * 2) * 8}
                r={3 + rnd(44, i) * 3.5} fill={KRP.white} opacity={0.6} />
            ))}
            {/* 照らされた空席がぽっと明るい */}
            <ellipse cx={690 + swx * 0.8} cy={606} rx={160} ry={52}
              fill={C.lampWarm} opacity={0.26 + 0.05 * Math.sin(f / 9)} />
          </g>
        );
      })()}
      {/* 手前の床 (赤絨毯が足元に広がる) */}
      <rect x={-20} y={760} width={W + 40} height={340} fill={C.carpet} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 0 860 Q 480 842 960 860 T 1920 860 M 0 980 Q 480 962 960 980 T 1920 980"
        fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
      {/* 左右: 緞帳の袖と真鍮の柵 (入口の額縁) */}
      <path d={`M -20 -20 L 300 -20 Q ${236 + Math.sin(f / 11) * 6} 400 290 820 L 150 870 Q 60 430 -20 -20 Z`}
        fill={SGP.curtain} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 90 60 Q 130 440 180 800 M 190 40 Q 220 420 252 790" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      <path d={`M 1940 -20 L 1620 -20 Q ${1684 - Math.sin(f / 11) * 6} 400 1630 820 L 1770 870 Q 1860 430 1940 -20 Z`}
        fill={SGP.curtain} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 1830 60 Q 1790 440 1740 800 M 1730 40 Q 1700 420 1668 790" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      {/* 真鍮のポールとロープ (開けて掛けてある = 歓迎) */}
      <g transform="translate(410 1010)">
        <circle cx={0} cy={-330} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-11} y={-330} width={22} height={330} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={56} ry={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 16 -310 Q 190 ${-210 + Math.sin(f / 10) * 8} 260 -420`}
          fill="none" stroke={C.uniform} strokeWidth={13} strokeLinecap="round" />
      </g>
      {/* 主役: 案内係 (真正面)。帽子を取り、懐中電灯でご案内 */}
      <g transform="translate(1080 1050)">
        <ellipse cx={0} cy={6} rx={120} ry={22} fill={KRP.ink} opacity={0.3} />
        <Person x={0} y={0} s={1.78} cloth={C.uniform} clothDark="#8E3038"
          face="joy" hair="none" pose="raise" gaze={[0, 0.2]} f={f} phase={4} />
        {/* 制服の金ボタンと肩章 */}
        <g transform="scale(1.78)">
          <circle cx={0} cy={-136} r={5} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={0} cy={-112} r={5} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={0} cy={-88} r={5} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
          <rect x={-66} y={-162} width={26} height={12} rx={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <rect x={40} y={-162} width={26} height={12} rx={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 上げた手の制帽 (視聴者への会釈) */}
        <PillboxCap x={128} y={-440 - tip * 30} s={1.5} rot={16 + tip * 16} />
        {/* 下ろした手の懐中電灯 (光の筋の根元) */}
        <g transform={`translate(-116 -118) rotate(${-44 + Math.sin(f / 9) * 4})`}>
          <rect x={-16} y={-66} width={32} height={92} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -24 -66 L 24 -66 L 16 -92 L -16 -92 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
          <rect x={-10} y={-10} width={20} height={14} rx={5} fill={KRP.ink} opacity={0.5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #144 1941年には、業界紙のバラエティが、この習慣を見出しに取り上げています。
// 格: 並 / seed 1230
// 絵: 輪転機から流れてくるVariety紙。一面見出しに例の慣用句。年号札1941
// どこ: 業界紙の印刷所。左の輪転機が轟音で回っている
// 演出: 刷りたての紙が弧を描いて飛び 1枚が手前でどんと広がって一面見出しを見せる
// 動き: ドラム回転・紙が5枚飛ぶ・一面が拡大しながら手前へ・札1941がぽん
const Sg144: React.FC<{ f: number }> = ({ f }) => {
  const roll = -f * 13;
  const pt = easeOut(seg(f, 8, 26)); // 一面が手前に来る
  const px = lerp(680, 1265, pt);
  const py = lerp(420, 495, pt);
  const ps = lerp(0.22, 1, pt);
  const prot = lerp(-32, -3, pt);
  return (
    <Frame f={f} seed={1230} bg={KRP.paperCool}>
      {/* 壁・高窓・床 */}
      <rect x={0} y={0} width={W} height={700} fill="#BCC6CF" />
      <rect x={0} y={700} width={W} height={H - 700} fill="#9AA3AC" />
      <line x1={0} y1={702} x2={W} y2={702} stroke={C.ink} strokeWidth={6} opacity={0.45} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${340 + i * 600} 140)`} opacity={0.8}>
          <rect x={-105} y={-85} width={210} height={170} rx={8} fill="#E2EBF3" stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={-85} x2={0} y2={85} stroke={C.ink} strokeWidth={4} />
          <line x1={-105} y1={0} x2={105} y2={0} stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
      <polygon points="250,60 470,60 640,700 330,700" fill={KRP.white} opacity={0.12} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={i * 430 - 140} y1={1080} x2={i * 430 + 170} y2={700}
          stroke={C.ink} strokeWidth={3} opacity={0.16} />
      ))}
      {/* 床の新聞の束 (紐掛け) */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${1690 + i * 50} ${965 - i * 92}) rotate(${i * 5 - 2})`}>
          <rect x={-130} y={-44} width={260} height={88} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          {[-24, 0, 24].map((yy) => (
            <line key={yy} x1={-130} y1={yy} x2={130} y2={yy} stroke={C.ink} strokeWidth={2.5} opacity={0.3} />
          ))}
          <line x1={-44} y1={-44} x2={-44} y2={44} stroke={C.brickDark} strokeWidth={6} />
          <line x1={44} y1={-44} x2={44} y2={44} stroke={C.brickDark} strokeWidth={6} />
        </g>
      ))}
      {/* 輪転機 */}
      <g transform="translate(320 560)">
        <rect x={-300} y={290} width={600} height={46} rx={10} fill={C.pressDark} stroke={C.ink} strokeWidth={7} />
        <rect x={-270} y={-240} width={520} height={540} rx={22} fill={C.press} stroke={C.ink} strokeWidth={8} />
        <rect x={-270} y={-240} width={520} height={70} rx={22} fill={C.pressDark} opacity={0.5} />
        {/* 紙のロール */}
        <g transform={`translate(-180 -340) rotate(${roll * 0.5})`}>
          <circle r={108} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
          <circle r={30} fill={C.pressDark} stroke={C.ink} strokeWidth={6} />
          <line x1={-108} y1={0} x2={108} y2={0} stroke={C.ink} strokeWidth={3} opacity={0.3} />
        </g>
        {/* 紙の帯: ロール→ドラムの間→右へ */}
        <path d="M -75 -350 C 30 -330 60 -210 60 -120 L 60 -40 C 60 30 140 60 235 55"
          fill="none" stroke={KRP.white} strokeWidth={22} />
        <path d="M -75 -350 C 30 -330 60 -210 60 -120 L 60 -40 C 60 30 140 60 235 55"
          fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
        {/* ドラム2つ (回る) */}
        {[[-60, -90, 1], [95, -40, -1]].map(([dx, dy, dir], i) => (
          <g key={i} transform={`translate(${dx} ${dy}) rotate(${roll * (dir as number)})`}>
            <circle r={86} fill={C.pressDark} stroke={C.ink} strokeWidth={7} />
            {[0, 60, 120].map((a) => (
              <line key={a} x1={-80} y1={0} x2={80} y2={0} stroke={KRP.silver} strokeWidth={5}
                transform={`rotate(${a})`} opacity={0.75} />
            ))}
            <circle r={18} fill={KRP.silver} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 計器とレバー・リベット */}
        <g transform="translate(170 -180)">
          <circle r={34} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={Math.cos(f / 5) * 20} y2={Math.sin(f / 5) * 20 - 8} stroke={KRP.red} strokeWidth={5} />
        </g>
        <g transform={`translate(-310 40) rotate(${-14 + Math.sin(f / 7) * 7})`}>
          <line x1={0} y1={0} x2={0} y2={-110} stroke={C.ink} strokeWidth={10} />
          <circle cx={0} cy={-110} r={17} fill={KRP.red} stroke={C.ink} strokeWidth={6} />
        </g>
        {[-230, -120, -10, 100, 200].map((xx) => (
          <circle key={xx} cx={xx} cy={266} r={7} fill={C.pressDark} stroke={C.ink} strokeWidth={3.5} />
        ))}
        {/* 歯車 */}
        <g transform={`translate(-215 230) rotate(${roll})`}>
          {[0, 45, 90, 135].map((a) => (
            <rect key={a} x={-9} y={-52} width={18} height={104} rx={5} fill={KRP.brass}
              stroke={C.ink} strokeWidth={4} transform={`rotate(${a})`} />
          ))}
          <circle r={30} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 職人が様子を見る */}
      <Person f={f} x={700} y={1030} s={1.06} pose="raise" cloth={C.pressDark} clothDark="#555C66" />
      {/* 飛んでいく紙 */}
      {[0, 1, 2, 3].map((i) => {
        const t = ((f * 1.4 + i * 14) % 42) / 42; // 次々と飛び続ける
        if (t <= 0.02 || t >= 0.98) return null;
        const fx = lerp(590, 1420, t);
        const fy = 420 - Math.sin(t * Math.PI) * (170 + i * 22) + i * 26;
        return (
          <g key={i} transform={`translate(${fx} ${fy}) rotate(${t * 140 + i * 50}) scale(${0.85 - t * 0.2})`} opacity={0.9}>
            <rect x={-62} y={-44} width={124} height={88} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
            <line x1={0} y1={-44} x2={0} y2={44} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          </g>
        );
      })}
      {/* 手前に広がる一面 */}
      <g transform={`translate(${px} ${py}) rotate(${prot}) scale(${ps})`}>
        <rect x={-376} y={-276} width={782} height={582} rx={6} fill={C.ink} opacity={0.18} />
        <rect x={-390} y={-290} width={780} height={580} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={8} />
        <text x={0} y={-186} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontStyle="italic"
          fontSize={100} fill={C.ink}>Variety</text>
        <line x1={-340} y1={-150} x2={340} y2={-150} stroke={C.ink} strokeWidth={7} />
        <line x1={-340} y1={-136} x2={340} y2={-136} stroke={C.ink} strokeWidth={3} />
        <text x={0} y={-58} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={51} fill={C.ink} letterSpacing={1}>THIS IS WHERE</text>
        <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={51} fill={C.ink} letterSpacing={1}>WE CAME IN</text>
        <line x1={-340} y1={42} x2={340} y2={42} stroke={C.ink} strokeWidth={4} />
        {/* 記事の段組 (飾りの線) */}
        {[0, 1, 2].map((col) => (
          <g key={col} transform={`translate(${-230 + col * 230} 0)`}>
            {[0, 1, 2, 3, 4, 5, 6].map((r) => (
              <line key={r} x1={-96} y1={78 + r * 30} x2={96 - rnd(col * 9 + 3, r) * 48} y2={78 + r * 30}
                stroke={C.ink} strokeWidth={5} opacity={0.3} />
            ))}
          </g>
        ))}
        <rect x={120} y={70} width={176} height={130} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2, 3].map((r) => (
          <line key={r} x1={128} y1={86 + r * 30} x2={288} y2={86 + r * 30} stroke={C.ink} strokeWidth={2.5} opacity={0.3} />
        ))}
      </g>
      <TagPlate x={1680} y={90} text="1941年" size={40} t={seg(f, 24, 34)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #145 1935年の時点で、アメリカの映画館の85パーセントは、二本立てでした。
// 格: 図 / seed 1231
// 絵: フィルムのリール2巻の上に85%の円グラフ。残り15%の欠けが小さい
// どこ: 映画館の事務室のコルク掲示板。ピンで留めた集計ポスター
// 演出: 円グラフの85%がぐいっと塗られていく。左下にリール2巻が回る
// 動き: 扇形スイープ・リール回転・ポスターの角がはためく・札2枚
const Sg145: React.FC<{ f: number }> = ({ f }) => {
  const cx = 1210, cy = 470, r = 290;
  const sweep = 306 * easeOut(seg(f, 6, 34)); // 85% = 306度
  const rad = (d: number) => (d * Math.PI) / 180;
  const a0 = -90, a1 = a0 + sweep;
  const sx = cx + r * Math.cos(rad(a0)), sy = cy + r * Math.sin(rad(a0));
  const ex = cx + r * Math.cos(rad(a1)), ey = cy + r * Math.sin(rad(a1));
  const flut = Math.sin(f / 8) * 7;
  return (
    <Frame f={f} seed={1231} bg="#8C7358">
      {/* コルク板と木枠 */}
      <rect x={40} y={34} width={1840} height={1012} rx={14} fill={C.cork} stroke={C.ink} strokeWidth={8} />
      <rect x={40} y={34} width={1840} height={1012} rx={14} fill="none" stroke={C.brickDark} strokeWidth={26} opacity={0.85} />
      {Array.from({ length: 46 }).map((_, i) => (
        <circle key={i} cx={90 + rnd(5, i) * 1740} cy={80 + rnd(6, i) * 920} r={4 + rnd(7, i) * 4}
          fill={C.brickDark} opacity={0.18} />
      ))}
      {/* 脇に留めた小さなメモたち */}
      <g transform="translate(1700 850) rotate(6)">
        <rect x={-110} y={-80} width={220} height={160} fill={KRP.cream} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-84} y1={-36 + i * 38} x2={84} y2={-36 + i * 38} stroke={C.ink} strokeWidth={4} opacity={0.3} />
        ))}
        <circle cx={0} cy={-62} r={11} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
      </g>
      <g transform="translate(150 920) rotate(-5)">
        <rect x={-85} y={-62} width={170} height={124} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} />
        <path d="M 0 -26 L 10 -4 L 34 -2 L 16 13 L 22 36 L 0 23 L -22 36 L -16 13 L -34 -2 L -10 -4 Z"
          fill={KRP.yellow} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={0} cy={-46} r={10} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 集計ポスター本体 */}
      <g transform="translate(960 520)">
        <rect x={-690} y={-416} width={1390} height={846} fill={C.ink} opacity={0.15} />
        <rect x={-700} y={-426} width={1390} height={846} fill={KRP.cream} stroke={C.ink} strokeWidth={8} />
        {/* めくれる右下角 */}
        <path d={`M 690 340 L 690 420 L 610 420 Q ${652 + flut} ${398 - flut} 690 340 Z`}
          fill="#E2D8BC" stroke={C.ink} strokeWidth={5} />
        {/* 画鋲 */}
        {[[-660, -392], [652, -392], [-660, 382]].map(([px2, py2], i) => (
          <g key={i} transform={`translate(${px2} ${py2})`}>
            <circle r={15} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
            <circle cx={-4} cy={-4} r={4} fill={KRP.white} opacity={0.7} />
          </g>
        ))}
        {/* 飾り罫 */}
        <rect x={-650} y={-378} width={1290} height={752} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
      </g>
      {/* 円グラフ */}
      <circle cx={cx} cy={cy} r={r} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={8} />
      {sweep > 0.5 && (
        <path d={`M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${ex} ${ey} Z`}
          fill={KRP.orange} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      )}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.ink} strokeWidth={8} />
      {seg(f, 28, 36) > 0 && (
        <text x={cx - 60} y={cy + 150} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={96} fill={KRP.white} stroke={C.ink} strokeWidth={7} paintOrder="stroke"
          opacity={seg(f, 28, 36)}>85%</text>
      )}
      {/* 15% は水色の欠けの内側に置く (修正3: 前はポスターの上端からはみ出していた)。
          欠けは -144°〜-90° の扇。その真ん中 (-117°) の、半径の6割の位置 */}
      <g opacity={seg(f, 32, 40)}>
        <text x={cx + r * 0.6 * Math.cos(rad(-117)) - 14} y={cy + r * 0.6 * Math.sin(rad(-117)) + 18}
          textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={C.ink} stroke={KRP.white} strokeWidth={6} paintOrder="stroke">15%</text>
      </g>
      {/* リール2巻 (回る) + フィルム */}
      <path d={`M 360 ${688} C 470 ${640 + Math.sin(f / 7) * 8} 520 ${760} 630 ${792}`}
        fill="none" stroke={C.ink} strokeWidth={26} opacity={0.85} />
      {[[360, 650, 1], [640, 820, -1]].map(([rx2, ry2, dir], i) => (
        <g key={i} transform={`translate(${rx2} ${ry2})`}>
          <circle r={118} fill={KRP.silver} stroke={C.ink} strokeWidth={8} />
          <g transform={`rotate(${f * 7 * (dir as number)})`}>
            {[0, 60, 120].map((a) => (
              <line key={a} x1={-100} y1={0} x2={100} y2={0} stroke={C.ink} strokeWidth={6}
                transform={`rotate(${a})`} opacity={0.6} />
            ))}
            {[0, 120, 240].map((a) => (
              <circle key={a} cx={62 * Math.cos(rad(a))} cy={62 * Math.sin(rad(a))} r={17}
                fill={KRP.cream} stroke={C.ink} strokeWidth={5} />
            ))}
          </g>
          <circle r={26} fill={C.ink} />
        </g>
      ))}
      <TagPlate x={430} y={160} text="1935年" size={40} t={seg(f, 10, 20)} />
      <TagPlate x={420} y={330} text="二本立て" size={38} t={seg(f, 18, 28)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #146 1枚の切符で、何時間いてもかまいません。
// 格: 並 / seed 1232
// 絵: 切符1枚の大写し。「時間無制限」のスタンプがぽん。角が少し折れた使い込み
// どこ: 切符売場のカウンターの上。ランプの暖色で寄りの1枚
// 演出: 使い込まれた切符の大写しに 木のスタンプが降りて「時間無制限」をぽん
// 動き: スタンプ下降→押印→持ち上げ・印がpop・衝撃線・切符ロールがわずかに揺れる
const Sg146: React.FC<{ f: number }> = ({ f }) => {
  const down = easeOut(seg(f, 8, 15));
  const up = easeOut(seg(f, 22, 32));
  const toolY = 128 + 384 * down - 424 * up;
  const inkT = seg(f, 15, 21); // 印の出現
  const hit = seg(f, 14, 22); // 衝撃線
  return (
    <Frame f={f} seed={1232} bg="#6E5134">
      {/* カウンターの板目とランプの明かり */}
      <rect x={0} y={0} width={W} height={H} fill="#7A5A3A" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1={0} y1={90 + i * 190} x2={W} y2={70 + i * 190} stroke={C.ink} strokeWidth={5} opacity={0.25} />
          <path d={`M ${300 + rnd(11, i) * 1300} ${150 + i * 190} q 40 ${8 + rnd(12, i) * 10} 90 0`}
            fill="none" stroke={C.ink} strokeWidth={3} opacity={0.18} />
        </g>
      ))}
      <ellipse cx={960} cy={480} rx={880} ry={520} fill={C.lampWarm} opacity={0.22} />
      {/* 奥: 窓口の真鍮格子の影 */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={1250 + i * 105} y1={0} x2={1180 + i * 105} y2={360} stroke={C.ink} strokeWidth={14} opacity={0.14} />
      ))}
      {/* 切符のロール (左奥) */}
      <g transform={`translate(260 215) rotate(${Math.sin(f / 9) * 2})`}>
        <circle r={120} fill={C.ticket} stroke={C.ink} strokeWidth={7} />
        <circle r={34} fill={C.deskDark} stroke={C.ink} strokeWidth={6} />
        <path d="M 112 40 Q 190 110 185 215 L 120 215 Q 128 130 70 92 Z" fill={C.ticket} stroke={C.ink} strokeWidth={6} />
        {[0, 1].map((i) => (
          <circle key={i} cx={148 + i * 22} cy={160 + i * 36} r={5} fill={C.ink} opacity={0.4} />
        ))}
      </g>
      {/* 小銭 (真鍮・数字なし) */}
      {[[1660, 905, 1], [1736, 942, 0.86], [1600, 965, 0.92]].map(([mx, my, ms], i) => (
        <g key={i} transform={`translate(${mx} ${my}) scale(${ms})`}>
          <ellipse rx={54} ry={38} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
          <ellipse rx={36} ry={23} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
      ))}
      {/* 切符の大写し */}
      <g transform="translate(940 560) rotate(-7)">
        <rect x={-566} y={-196} width={1140} height={400} rx={26} fill={C.ink} opacity={0.22} />
        <rect x={-575} y={-205} width={1150} height={400} rx={26} fill={C.ticket} stroke={C.ink} strokeWidth={9} />
        {/* ミシン目と切込み */}
        <circle cx={255} cy={-205} r={22} fill="#7A5A3A" stroke={C.ink} strokeWidth={6} />
        <circle cx={255} cy={195} r={22} fill="#7A5A3A" stroke={C.ink} strokeWidth={6} />
        <line x1={255} y1={-176} x2={255} y2={166} stroke={C.ink} strokeWidth={5} strokeDasharray="4 18" />
        {/* 飾り縁 */}
        <rect x={-536} y={-168} width={740} height={328} rx={14} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.55} />
        <rect x={-520} y={-152} width={708} height={296} rx={10} fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.4} />
        <text x={-166} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={86} fill={C.ink} letterSpacing={6}>ADMIT</text>
        <text x={-166} y={116} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={86} fill={C.ink} letterSpacing={6}>ONE</text>
        {/* 半券側の飾り */}
        <g transform="translate(420 0)">
          <rect x={-120} y={-150} width={240} height={296} rx={10} fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
          <path d="M 0 -96 L 12 -68 L 42 -65 L 20 -45 L 27 -16 L 0 -32 L -27 -16 L -20 -45 L -42 -65 L -12 -68 Z"
            fill={KRP.brass} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-84} y1={34 + i * 38} x2={84} y2={34 + i * 38} stroke={C.ink} strokeWidth={4} opacity={0.35} />
          ))}
        </g>
        {/* 折れた角と汚れ */}
        <path d="M -575 -96 L -575 -205 L -466 -205 Q -545 -170 -575 -96 Z" fill="#D9C8A2" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <line x1={-466} y1={-205} x2={-575} y2={-96} stroke={C.ink} strokeWidth={4} opacity={0.5} />
        <ellipse cx={-360} cy={150} rx={54} ry={20} fill={C.ink} opacity={0.08} />
        <ellipse cx={120} cy={-150} rx={40} ry={15} fill={C.ink} opacity={0.07} />
        <path d="M 575 60 L 557 76 L 575 92" fill="#7A5A3A" stroke={C.ink} strokeWidth={4} />
        {/* 押された印 */}
        {inkT > 0 && (
          <g transform={`translate(-166 20) rotate(-6) scale(${pop(inkT)})`} opacity={0.92}>
            <rect x={-218} y={-56} width={436} height={112} rx={16}
              fill="none" stroke={KRP.red} strokeWidth={9} />
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={62} fill={KRP.red} letterSpacing={4}>時間無制限</text>
          </g>
        )}
      </g>
      {/* 衝撃線 */}
      {hit > 0 && hit < 1 && (
        <g transform="translate(762 560)" opacity={1 - hit}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + 0.4;
            return (
              <line key={i} x1={Math.cos(a) * (170 + hit * 60)} y1={Math.sin(a) * (120 + hit * 44)}
                x2={Math.cos(a) * (240 + hit * 90)} y2={Math.sin(a) * (168 + hit * 64)}
                stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" />
            );
          })}
        </g>
      )}
      {/* 木のスタンプ (降りて持ち上がる) */}
      <g transform={`translate(762 ${toolY}) rotate(-4)`}>
        <circle cx={0} cy={-158} r={46} fill={C.deskDark} stroke={C.ink} strokeWidth={7} />
        <rect x={-20} y={-160} width={40} height={118} rx={10} fill={C.desk} stroke={C.ink} strokeWidth={7} />
        <path d="M -108 -42 L 108 -42 L 128 24 L -128 24 Z" fill={C.deskDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={-128} y={24} width={256} height={20} rx={6} fill={KRP.red} stroke={C.ink} strokeWidth={5} opacity={0.9} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #147 つまり映画館は「途中から観るお客」を前提に、商売を組み立てていたのです。
// 格: 図 / seed 1233
// 絵: 1930年代アメリカの映画館の断面 (商売の仕組み全体)。上にフィルムの輪 (本編A→本編B→ニュース→…) が
//     休まず回り、左の切符売り場からお客が途切れず入り、右の出口からいつでも出ていく。客席は埋まり、
//     ロビーのレジにはコインが落ち続け、蝶ネクタイの支配人が満足げ
// どこ: 夕暮れの街角の映画館を輪切りにした断面図 (左=歩道と切符売り場/中=ロビー/右=場内)
// 動き: フィルムの輪が回る / 入る客と出る客の流れ / コインが落ち続ける / 映写の光がちらつく / 時計の針が回る

// 断面の客席1席 (横から見た椅子。右=スクリーン向き)
const KanSeat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-38} y={-92} width={18} height={80} rx={8} fill={C.seatRed} stroke={C.ink} strokeWidth={4.5} />
    <rect x={-38} y={-34} width={66} height={18} rx={7} fill={C.seatRed} stroke={C.ink} strokeWidth={4.5} />
    <line x1={-6} y1={-16} x2={-6} y2={0} stroke={C.ink} strokeWidth={6} />
  </g>
);

// フィルムのコマ (輪の上を回る札)
const FilmKoma: React.FC<{ x: number; y: number; text: string; color: string }> = ({ x, y, text, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-82} y={-34} width={164} height={68} rx={8} fill="#2F2A33" stroke={C.ink} strokeWidth={4} />
    {[-66, -42, -18, 6, 30, 54].map((hx) => (
      <g key={hx}>
        <rect x={hx} y={-30} width={12} height={7} rx={2} fill={C.lampWarm} opacity={0.8} />
        <rect x={hx} y={23} width={12} height={7} rx={2} fill={C.lampWarm} opacity={0.8} />
      </g>
    ))}
    <rect x={-72} y={-20} width={144} height={40} rx={4} fill={color} stroke={C.ink} strokeWidth={3} />
    <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>{text}</text>
  </g>
);

const Sg147: React.FC<{ f: number }> = ({ f }) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const ringCx = 1210, ringCy = 160, ringRx = 340, ringRy = 76;
  const floorY = (x: number) => 812 + (x - 700) * 0.018;
  const komas = [
    { text: "本編A", color: KRP.yellow },
    { text: "本編B", color: KRP.blueSoft },
    { text: "ニュース", color: "#F2C9A0" },
  ];
  // 歩く人の流れ (span の中を左→右へ。両端でふわっと消える)
  const stream = (n: number, x0: number, x1: number, v: number, seed: number) =>
    Array.from({ length: n }, (_, k) => {
      const span = x1 - x0;
      const p = (k * (span / n) + f * v) % span;
      const o = Math.min(clamp01(p / 50), clamp01((span - p) / 50));
      return { x: x0 + p, o, k, seed };
    });
  const comers = stream(3, -60, 372, 1.7, 1); // 歩道を入口の戸まで (ロビーの支配人の後ろは通さない)
  const goers = stream(2, 1570, 1880, 2.0, 2);
  const cloths = ["#55606E", "#7B4A5E", "#4C6A58", "#8E5A3C", "#3A3F4C", "#6A5C72"];
  const beamO = 0.16 + Math.sin(f / 2.3) * 0.04;
  return (
    <Frame f={f} seed={1233} bg={C.twiSky} dark>
      {/* 夕暮れの空 */}
      <rect x={0} y={0} width={W} height={H} fill={C.twiSky} />
      <rect x={0} y={520} width={W} height={320} fill={C.twiGlow} opacity={0.35} />
      {[...Array(8)].map((_, i) => (
        <circle key={i} cx={60 + rnd(33, i) * 1800} cy={30 + rnd(34, i) * 120} r={2.6}
          fill={KRP.white} opacity={0.35 + Math.sin(f / 5 + i * 2) * 0.25} />
      ))}
      {/* 歩道 */}
      <rect x={0} y={830} width={W} height={250} fill={C.pave} />
      <line x1={0} y1={830} x2={W} y2={830} stroke={C.ink} strokeWidth={5} opacity={0.5} />

      {/* ===== 建物の断面 ===== */}
      {/* ロビー (暖かい壁) */}
      <rect x={330} y={262} width={358} height={568} fill="#E9D5AE" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={360 + i * 50} y1={270} x2={360 + i * 50} y2={640} stroke={C.deskDark} strokeWidth={3} opacity={0.18} />
      ))}
      <rect x={330} y={640} width={358} height={190} fill="#C9A878" opacity={0.5} />
      {/* 場内 (暗い壁と壁灯) */}
      <rect x={688} y={262} width={1160} height={568} fill={C.hallWall} />
      <rect x={688} y={262} width={1160} height={568} fill={C.nightHall} opacity={0.35} />
      {[880, 1180, 1480].map((lx, i) => (
        <g key={lx}>
          <circle cx={lx} cy={430} r={46} fill={C.lampWarm} opacity={0.12 + Math.sin(f / 9 + i) * 0.03} />
          <path d={`M ${lx - 16} 440 L ${lx + 16} 440 L ${lx + 10} 420 L ${lx - 10} 420 Z`} fill={KRP.brass} stroke={C.ink} strokeWidth={3.5} />
        </g>
      ))}
      {/* スクリーン (右の壁) と映写の光 */}
      <polygon points={`784,330 1712,312 1712,604 784,350`} fill={C.lampWarm} opacity={beamO} />
      <g>
        {/* 舞台の縁と幕 (スクリーンだと分かるように) */}
        <path d="M 1690 640 L 1844 618 L 1844 660 L 1690 676 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1700 300 L 1812 278 L 1812 632 L 1700 618 Z" fill="#1E1A22" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 1712 312 L 1800 294 L 1800 612 L 1712 604 Z" fill={C.screenSky} />
        {/* 映っている場面 (砂地と岩山と騎手の影) */}
        <path d="M 1712 520 L 1800 516 L 1800 612 L 1712 604 Z" fill={C.sand} />
        <path d="M 1722 522 L 1730 476 L 1750 470 L 1756 522 Z" fill={C.mesa} stroke={C.ink} strokeWidth={3} />
        <g transform={`translate(${1772 + Math.sin(f / 6) * 4} 548)`} fill={C.ink}>
          <ellipse cx={0} cy={0} rx={16} ry={8} />
          <path d="M 10 -4 L 20 -16 L 24 -12 L 16 0 Z" />
          <circle cx={-2} cy={-14} r={5} />
          <line x1={-10} y1={4} x2={-14 + Math.sin(f / 2) * 3} y2={16} stroke={C.ink} strokeWidth={3} />
          <line x1={10} y1={4} x2={14 - Math.sin(f / 2) * 3} y2={16} stroke={C.ink} strokeWidth={3} />
        </g>
        <path d="M 1712 312 L 1800 294 L 1800 612 L 1712 604 Z" fill={KRP.white} opacity={0.08 + Math.sin(f / 2.7) * 0.06} />
        {/* 両脇の幕 */}
        <path d={`M 1690 288 L 1716 284 Q ${1722 + Math.sin(f / 14) * 2} 450 1716 622 L 1690 626 Z`} fill={SGP.curtain} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d={`M 1844 262 L 1802 270 Q ${1796 - Math.sin(f / 14) * 2} 440 1802 614 L 1844 610 Z`} fill={SGP.curtain} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M 1686 278 L 1846 248 L 1846 276 L 1686 304 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
      </g>
      {/* 映写室と映写機 (場内の左上) */}
      <g transform="translate(700 268)">
        <rect x={0} y={0} width={110} height={110} fill="#3A3442" stroke={C.ink} strokeWidth={5} />
        <rect x={74} y={44} width={36} height={30} fill={C.lampWarm} opacity={0.8} stroke={C.ink} strokeWidth={3.5} />
        <rect x={18} y={56} width={58} height={34} rx={6} fill={C.press} stroke={C.ink} strokeWidth={4} />
        {[[30, 40], [64, 40]].map(([rx2, ry2], i) => (
          <g key={i} transform={`translate(${rx2} ${ry2}) rotate(${f * 8})`}>
            <circle r={16} fill={KRP.silver} stroke={C.ink} strokeWidth={3.5} />
            <line x1={-13} y1={0} x2={13} y2={0} stroke={C.ink} strokeWidth={3} />
            <line x1={0} y1={-13} x2={0} y2={13} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 客席 (段々の床) と座ったお客 */}
      <path d={`M 688 ${floorY(688)} L 1848 ${floorY(1848)} L 1848 830 L 688 830 Z`} fill={C.carpet} />
      {[790, 925, 1060, 1195, 1330, 1465].map((sx, i) => {
        const fy = floorY(sx);
        return (
          <g key={sx}>
            <KanSeat x={sx} y={fy} />
            <PersonMini x={sx - 6} y={fy - 20} s={0.56} color={cloths[(i + 2) % cloths.length]} f={f} phase={i * 2}
              face={i === 2 || i === 4 ? "smile" : "dot"} />
          </g>
        );
      })}
      {/* 出ていくお客 (右の出口へ) */}
      {goers.map((g) => (
        <g key={`g${g.k}`} opacity={g.o}>
          <Person x={g.x} y={floorY(g.x) + 2} s={0.4} cloth={cloths[(g.k * 3 + 1) % cloths.length]} f={f} phase={g.k * 3}
            gaze={[5, 0]} face="smile" />
        </g>
      ))}
      {/* 壁の切り口 (断面) */}
      <g fill="#3E3428" stroke={C.ink} strokeWidth={5}>
        <rect x={316} y={250} width={1546} height={22} />
        <rect x={316} y={250} width={18} height={390} />
        <rect x={680} y={262} width={16} height={418} />
        <rect x={1844} y={250} width={18} height={436} />
      </g>
      {/* 出口 (右の壁の戸口。外の夕焼けがのぞく) */}
      <rect x={1844} y={686} width={18} height={144} fill={C.twiGlow} opacity={0.8} />
      <path d="M 1862 686 L 1900 674 L 1900 842 L 1862 830 Z" fill={C.brickDark} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 出口の灯 */}
      <rect x={1800} y={682} width={30} height={22} rx={4} fill={KRP.green} stroke={C.ink} strokeWidth={3} opacity={0.6 + Math.sin(f / 6) * 0.3} />
      {/* 入口のひさし (マーキー) */}
      <g>
        <path d="M 120 330 L 334 330 L 334 400 L 150 400 Z" fill={C.awning} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={160 + i * 32} cy={346} r={7}
            fill={(i + Math.floor(f / 6)) % 2 === 0 ? KRP.yellow : KRP.white} stroke={C.ink} strokeWidth={3} />
        ))}
        <rect x={150} y={360} width={180} height={30} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {/* 看板の中は絵だけ (フィルム2巻) */}
        {[214, 266].map((rx2) => (
          <circle key={rx2} cx={rx2} cy={375} r={10} fill={KRP.silver} stroke={C.ink} strokeWidth={3} />
        ))}
        <line x1={224} y1={375} x2={256} y2={375} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 切符売り場 (歩道) */}
      <g transform="translate(240 830)">
        <rect x={-70} y={-250} width={140} height={250} rx={8} fill={C.brick} stroke={C.ink} strokeWidth={6} />
        <path d="M -54 -230 Q 0 -262 54 -230 L 54 -120 L -54 -120 Z" fill={C.lampWarm} stroke={C.ink} strokeWidth={5} />
        <Person x={0} y={-104} s={0.4} cloth={C.uniform} f={f} phase={4} gaze={[-4, 0]} face="smile" />
        <path d="M -54 -230 Q 0 -262 54 -230 L 54 -120 L -54 -120 Z" fill={KRP.white} opacity={0.12} stroke={C.ink} strokeWidth={5} />
        <rect x={-62} y={-122} width={124} height={16} rx={4} fill={C.deskDark} stroke={C.ink} strokeWidth={4} />
        <rect x={-50} y={-90} width={100} height={70} rx={6} fill={C.brickDark} stroke={C.ink} strokeWidth={4} opacity={0.8} />
      </g>
      {/* 入ってくるお客 (歩道→切符売り場→入口へ。途切れない) */}
      {comers.map((c) => (
        <g key={`c${c.k}`} opacity={c.o}>
          <Person x={c.x} y={829} s={0.5} cloth={cloths[(c.k * 2) % cloths.length]} f={f} phase={c.k * 4}
            gaze={[5, 0]} face={c.k % 2 ? "smile" : "normal"} lean={Math.sin(f / 5 + c.k) * 2} />
        </g>
      ))}
      {/* ロビー: 時計 (針が回る)・レジ (コインが落ち続ける)・支配人 */}
      <g transform="translate(410 400)">
        <circle r={44} fill={KRP.cream} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, k) => (
          <line key={k} x1={0} y1={-36} x2={0} y2={-30} stroke={C.ink} strokeWidth={3} transform={`rotate(${k * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-30} stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" transform={`rotate(${f * 12})`} />
        <line x1={0} y1={0} x2={0} y2={-20} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 1})`} />
        <circle r={4} fill={C.ink} />
      </g>
      <g transform="translate(430 830)">
        <rect x={-60} y={-140} width={120} height={140} fill={C.desk} stroke={C.ink} strokeWidth={6} />
        <line x1={-60} y1={-100} x2={60} y2={-100} stroke={C.ink} strokeWidth={3} opacity={0.35} />
        {/* レジ */}
        <path d="M -48 -140 L 48 -140 L 40 -214 L -40 -214 Z" fill={KRP.brass} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-30} y={-238} width={60} height={26} rx={4} fill={KRP.cream} stroke={C.ink} strokeWidth={4} />
        {[-30, -10, 10].map((kx) => (
          <g key={kx}>
            <circle cx={kx + 6} cy={-196} r={6} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
            <circle cx={kx + 6} cy={-176} r={6} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={-52} y={-152} width={104} height={14} rx={3} fill={C.deskDark} stroke={C.ink} strokeWidth={4} />
        {/* 落ち続けるコイン */}
        {[0, 1, 2].map((k) => {
          const t = ((f + k * 9) % 27) / 27;
          return (
            <g key={k} transform={`translate(${-18 + k * 18} ${-330 + t * 180})`} opacity={t < 0.92 ? 1 : 0}>
              <ellipse rx={13} ry={9} fill={KRP.gold} stroke={C.ink} strokeWidth={3.5} />
              <ellipse rx={6} ry={4} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.5} />
            </g>
          );
        })}
        {[0, 1].map((k) => (
          <line key={k} x1={-56 + k * 112} y1={-160} x2={-74 + k * 148} y2={-174} stroke={KRP.yellow} strokeWidth={5}
            strokeLinecap="round" opacity={0.5 + Math.sin(f / 3 + k) * 0.5} />
        ))}
      </g>
      {/* 支配人 (蝶ネクタイ。満足げ) */}
      <g transform={`translate(590 836)`}>
        <ellipse cx={0} cy={0} rx={70} ry={12} fill={C.ink} opacity={0.2} />
      </g>
      <g transform={`translate(590 ${832 + Math.sin(f / 13) * 3}) scale(0.78)`}>
        <Person x={0} y={0} f={f} still cloth="#2E3A4A" clothDark="#24303E" pose="armsFolded" face="joy" />
        <path d="M 0 -152 L -20 -164 L -20 -140 Z M 0 -152 L 20 -164 L 20 -140 Z" fill={KRP.red} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={0} cy={-152} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
      </g>

      {/* ===== 屋根の上: 休まず回るフィルムの輪 ===== */}
      <path d={`M 770 268 C 760 220 800 180 ${ringCx - ringRx} ${ringCy}`} fill="none" stroke="#2F2A33" strokeWidth={12} />
      <ellipse cx={ringCx} cy={ringCy} rx={ringRx} ry={ringRy} fill="none" stroke="#2F2A33" strokeWidth={14} />
      <ellipse cx={ringCx} cy={ringCy} rx={ringRx} ry={ringRy} fill="none" stroke={C.lampWarm} strokeWidth={4}
        strokeDasharray="10 16" strokeDashoffset={-f * 4} opacity={0.8} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const a = rad(k * 60 + f * 1.6);
        const x = ringCx + ringRx * Math.cos(a);
        const y = ringCy + ringRy * Math.sin(a);
        const km = komas[k % 3];
        return <FilmKoma key={k} x={x} y={y} text={km.text} color={km.color} />;
      })}
      {/* 札 */}
      <TagPlate x={ringCx} y={ringCy} text="上映は休まない" size={38} t={seg(f, 6, 16)} fill={KRP.yellow} />
      <TagPlate x={196} y={226} text="いつでも入場" size={38} t={seg(f, 12, 22)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #148 理由は単純で、そのほうが、席がいつでも埋まるからです。
// 格: 図 / seed 1234
// 絵: 座席の埋まり比較 (連番)。出入り自由=常にまだら満席、入替制=回と回の間に空白の帯
// どこ: 暗い検品室のライトテーブル。フィルム2本を透かして見比べる
// 演出: 上=出入り自由はどのコマもまだら満席 下=入替制は回の間に赤い空白の帯
// 動き: コマが左から順にぽんと点灯・ルーペがゆれる・空白コマの斜線が流れる
const Sg148: React.FC<{ f: number }> = ({ f }) => {
  const FW = 300, FH = 170, GAP = 26; // コマの大きさ
  const x0 = 620, yTop = 300, yBot = 690;
  // 1コマぶんの客席 (まだら or 満席 or 空白)
  const Koma: React.FC<{ cx2: number; cy2: number; mode: "dappled" | "full" | "blank"; si: number; t: number }> =
    ({ cx2, cy2, mode, si, t }) => {
      const sc = pop(clamp01(t));
      if (sc <= 0) return null;
      return (
        <g transform={`translate(${cx2} ${cy2}) scale(${sc})`}>
          <rect x={-FW / 2} y={-FH / 2} width={FW} height={FH} rx={8}
            fill={mode === "blank" ? "#4A4048" : C.lampWarm} stroke={C.ink} strokeWidth={5} />
          {mode !== "blank" && (
            <>
              <rect x={-FW / 2 + 14} y={-FH / 2 + 12} width={FW - 28} height={30} rx={5}
                fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />
              {Array.from({ length: 24 }).map((_, k) => {
                const col = k % 8, row = Math.floor(k / 8);
                const filled = mode === "full" ? true : rnd(si * 13 + 7, k) > 0.22;
                return (
                  <circle key={k} cx={-FW / 2 + 36 + col * 33} cy={-10 + row * 40} r={12}
                    fill={filled ? C.seatRed : "none"} stroke={C.ink} strokeWidth={3.5}
                    opacity={filled ? 1 : 0.45} />
                );
              })}
            </>
          )}
          {mode === "blank" && (
            <g clipPath="url(#sg148blank)">
              <g transform={`translate(${-FW / 2} ${-FH / 2})`}>
                {Array.from({ length: 12 }).map((_, k) => (
                  <line key={k} x1={-60 + k * 44 + (f * 1.6) % 44} y1={FH + 16} x2={30 + k * 44 + (f * 1.6) % 44} y2={-16}
                    stroke={KRP.red} strokeWidth={7} opacity={0.6} />
                ))}
              </g>
            </g>
          )}
        </g>
      );
    };
  return (
    <Frame f={f} seed={1234} bg="#38323E">
      <defs>
        <clipPath id="sg148blank">
          <rect x={-FW / 2} y={-FH / 2} width={FW} height={FH} rx={8} />
        </clipPath>
      </defs>
      {/* ライトテーブル */}
      <rect x={120} y={100} width={1680} height={880} rx={26} fill="#56505E" stroke={C.ink} strokeWidth={8} />
      <rect x={170} y={150} width={1580} height={780} rx={18} fill="#F5EEDC" stroke={C.ink} strokeWidth={7} />
      <ellipse cx={960} cy={540} rx={760} ry={380} fill={KRP.white} opacity={0.5} />
      {/* フィルム2本 */}
      {[yTop, yBot].map((yy, strip) => (
        <g key={strip}>
          <rect x={430} y={yy - FH / 2 - 44} width={1360} height={FH + 88} rx={10}
            fill={C.ink} opacity={0.92} />
          {Array.from({ length: 20 }).map((_, k) => (
            <g key={k}>
              <rect x={452 + k * 65} y={yy - FH / 2 - 32} width={26} height={18} rx={4} fill={C.lampWarm} opacity={0.85} />
              <rect x={452 + k * 65} y={yy + FH / 2 + 14} width={26} height={18} rx={4} fill={C.lampWarm} opacity={0.85} />
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Koma key={i} cx2={x0 + i * (FW + GAP)} cy2={yy}
              mode={strip === 0 ? "dappled" : i % 2 === 0 ? "full" : "blank"}
              si={strip * 4 + i} t={seg(f, 4 + i * 6 + strip * 3, 11 + i * 6 + strip * 3)} />
          ))}
          {/* フィルムの端が台からはみ出す */}
          <rect x={352} y={yy - FH / 2 - 44} width={78} height={FH + 88} fill={C.ink} opacity={0.92} />
          <rect x={1790} y={yy - FH / 2 - 44} width={46} height={FH + 88} fill={C.ink} opacity={0.92} />
        </g>
      ))}
      {/* ルーペと手袋 (右下の小道具) */}
      <g transform={`translate(1600 905) rotate(${18 + Math.sin(f / 9) * 3})`}>
        <circle r={74} fill={KRP.white} opacity={0.5} />
        <circle r={74} fill="none" stroke={KRP.brass} strokeWidth={13} />
        <circle r={74} fill="none" stroke={C.ink} strokeWidth={4} />
        <line x1={52} y1={52} x2={128} y2={128} stroke={C.deskDark} strokeWidth={22} strokeLinecap="round" />
        <line x1={-30} y1={-36} x2={10} y2={-10} stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={0.8} />
      </g>
      <g transform="translate(280 930) rotate(-14)">
        <path d="M -70 30 Q -80 -30 -30 -44 L 40 -44 Q 86 -36 80 10 Q 60 44 0 46 Q -40 46 -70 30 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
        {[-18, 6, 30].map((xx) => (
          <line key={xx} x1={xx} y1={-42} x2={xx + 6} y2={10} stroke={C.ink} strokeWidth={3.5} opacity={0.4} />
        ))}
      </g>
      <TagPlate x={240} y={300} text="出入り自由" size={34} t={seg(f, 8, 18)} fill={KRP.yellow} />
      <TagPlate x={225} y={690} text="入替制" size={34} t={seg(f, 14, 24)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_137: (f) => <Sg137 f={f} />,
  sg_138: (f) => <Sg138 f={f} />,
  sg_139: (f) => <Sg139 f={f} />,
  sg_140: (f) => <Sg140 f={f} />,
  sg_141: (f) => <Sg141 f={f} />,
  sg_142: (f) => <Sg142 f={f} />,
  sg_143: (f) => <Sg143 f={f} />,
  sg_144: (f) => <Sg144 f={f} />,
  sg_145: (f) => <Sg145 f={f} />,
  sg_146: (f) => <Sg146 f={f} />,
  sg_147: (f) => <Sg147 f={f} />,
  sg_148: (f) => <Sg148 f={f} />,
};

export const S_B7_MOTIFS: string[] = [
  "sg_137", // #137
  "sg_138", // #138
  "sg_139", // #139
  "sg_140", // #140
  "sg_141", // #141
  "sg_142", // #142
  "sg_143", // #143
  "sg_144", // #144
  "sg_145", // #145
  "sg_146", // #146
  "sg_147", // #147
  "sg_148", // #148
];

export const saigoB7Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
