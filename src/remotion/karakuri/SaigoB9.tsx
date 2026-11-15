// 「人類は、昔から飛ばして観ていた」: 文#172〜#183 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1300〜1311。
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
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  sky: "#BBD9EA",        // 昼の空
  skyHigh: "#A3C8E2",    // 空の上のほう
  asphalt: "#CBC3B0",    // 駐車場の地面
  scWall: "#EFE4CE",     // シネコンの外壁
  scBand: "#D96A4A",     // シネコンの帯色
  hallDark: "#43372E",   // 昭和の場内の闇 (暖色寄り)
  hallWall: "#5A4A3C",   // 場内の壁
  screenGlow: "#EDF3DC", // 銀幕の光
  seatShowa: "#7A5A42",  // 昭和の木の座席
  lobbyWall: "#EADFC6",  // ロビーの壁
  tileA: "#D8CFBA",      // ロビー床タイル
  tileB: "#CCC2AA",
  washi: "#F6EEDC",      // すごろくの紙
  tatami: "#B9B178",     // 畳
  tatamiDark: "#9D9660",
  sunsetHi: "#F6C97E",   // 夕焼けの空 (上)
  sunsetLo: "#E88E52",   // 夕焼けの空 (下)
  sunsetSun: "#F4DE9A",  // 夕日
  nightBlue: "#2C3450",  // 夜の路地の空
  nightWall: "#4A4660",  // 夜の壁
  nightWall2: "#3C3A52", // 夜の壁 (奥)
  lampWarm: "#F6E7A8",   // 街灯の光
  posterOld: "#D9C9A0",  // 日に焼けたポスター
  posterOld2: "#C9B890", // もっと焼けたポスター
  meigaWall: "#E2D6BC",  // 名画座の外壁
  corkBoard: "#C9A25E",  // コルク板
  seaPale: "#CFE3EC",    // 地図の海
  landPale: "#EFE9D2",   // 地図の陸
  kusudamaA: "#E08A8A",  // くす玉
  kusudamaB: "#8FBF9F",
  mallFloor: "#E7DEC8",  // SCの床
  mallWall: "#F2EBD8",   // SCの壁
  escSteel: "#B9C2C9",   // エスカレーターの鋼板
  seatNew: "#C65A50",    // 新式のふかふか座席
  seatNewDark: "#A34238",
  newHallWall: "#E6EBEA",// 新式の場内の壁 (冷たい白)
  carpetNew: "#8FA6B8",  // 新式の床カーペット
} as const;
void W; void H; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate; void QuizQ;

// ===== 小さな道具 =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 決まった見た目の擬似乱数 (レンダのたびに変わらない)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// ちぎれ雲 (昼・夕どちらでも)
const CloudB9: React.FC<{ x: number; y: number; s?: number; op?: number; fill?: string }> =
  ({ x, y, s = 1, op = 0.92, fill = KRP.white }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d="M -120 20 q 10 -42 56 -36 q 14 -40 68 -32 q 36 -24 62 10 q 46 -8 48 30 q 26 6 20 28 l -254 0 z"
        fill={fill} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );

// 昭和の映画館の係員 (もぎり) の制帽と制服。Person に重ねて着せる。
// ★ Person とまったく同じ変換をかけた入れ物の中で、頭の丸 (cx0 cy-228 r64) 基準の
//   人物ローカル座標で描く。f / phase / still / lean / s は人物と同じ値を渡すこと。
//   座標を少しずつ足して合わせるごまかしは、傾きが変わった瞬間に必ず破綻する。
const KakariFuku: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; dark: string;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, dark }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 制帽 (つば・帯・小さな徽章) */}
      <path d="M -58 -266 Q -60 -312 0 -314 Q 60 -312 58 -266 Z"
        fill={dark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -56 -288 Q 0 -300 56 -288" fill="none"
        stroke={KRP.white} strokeWidth={4} opacity={0.3} />
      <rect x={-62} y={-274} width={124} height={19} rx={6}
        fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -72 -252 Q 0 -238 72 -252 L 70 -262 Q 0 -272 -70 -262 Z"
        fill={dark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M 0 -292 l 10 12 l -10 12 l -10 -12 Z"
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      {/* 立て襟・二列のボタン・肩章 */}
      <path d="M -44 -161 L -44 -139 L 44 -139 L 44 -161 Z"
        fill={dark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <line x1={0} y1={-139} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      {[-21, 21].map((bx) => (
        <g key={bx}>
          {[-124, -100, -76].map((by) => (
            <circle key={by} cx={bx} cy={by} r={6} fill={KRP.brass}
              stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      ))}
      <rect x={-58} y={-163} width={30} height={13} rx={5}
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={28} y={-163} width={30} height={13} rx={5}
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// 木の掲示板に下がる木札 1枚 (Fuda3 とは別物。この巻のロビー用)
const BoardFuda: React.FC<{
  x: number; y: number; w: number; text: string; t: number; f: number; i: number;
}> = ({ x, y, w, text, t, f, i }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const drop = pop(tt);
  const yoff = (1 - drop) * -170;
  const swing = tt >= 1 ? Math.sin(f / 9 + i * 2.2) * 1.4 : (1 - tt) * 5;
  const hw = w / 2;
  return (
    <g transform={`translate(${x} ${y + yoff}) rotate(${swing} 0 -120)`} opacity={Math.min(tt * 2, 1)}>
      {[-hw * 0.6, hw * 0.6].map((rx) => (
        <line key={rx} x1={rx * 0.9} y1={-54} x2={rx} y2={-120}
          stroke={SGP.woodDark} strokeWidth={5} />
      ))}
      <path d={`M ${hw} -58 L ${hw + 9} -50 L ${hw + 9} 62 L ${-hw + 9} 62 L ${-hw} 54 Z`}
        fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <rect x={-hw} y={-58} width={w} height={112} rx={7}
        fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
      <path d={`M ${-hw + 14} -30 Q 0 -36 ${hw - 18} -28 M ${-hw + 18} 36 Q ${hw * 0.1} 30 ${hw - 14} 38`}
        fill="none" stroke={SGP.woodDark} strokeWidth={2.5} opacity={0.8} />
      {[-hw * 0.6, hw * 0.6].map((rx) => (
        <circle key={rx} cx={rx * 0.9} cy={-46} r={6.5}
          fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
        paintOrder="stroke" letterSpacing={2}>{text}</text>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #172 第9章、最後の犯人は、シネコン。
// 格: 山 / seed 1300
// 絵: 章扉。郊外のショッピングセンターとシネコンの外観。広い駐車場、買い物カート、家族連れ
// どこ: 郊外の幹線道路沿い。昼下がりのショッピングセンター前
// 演出: 左にシネコン入りの大きなSC。手前の駐車場にクルマとカート、家族連れが歩く。右に章扉
// 動き: 雲が流れる・屋上の旗がはためく・家族がてくてく歩く・カートの車輪が回る
const Sg172: React.FC<{ f: number }> = ({ f }) => {
  const walk = f * 1.1; // 家族の歩み
  const t0 = easeOut(seg(f, 0, 14));
  return (
    <Frame f={f} seed={1300}
      over={<ChapterDoor num={9} title="最後の犯人は シネコン" t={seg(f, 8, 24)} left={1060} top={590} width={800} />}>
      {/* 空 */}
      <rect x={-20} y={-20} width={W + 40} height={660} fill={C.sky} />
      <rect x={-20} y={-20} width={W + 40} height={250} fill={C.skyHigh} />
      <CloudB9 x={320 + (f * 0.5) % 300} y={150} s={0.9} />
      <CloudB9 x={1480 - (f * 0.35) % 260} y={95} s={0.7} op={0.8} />
      {/* 遠景: 郊外の低い屋根なみと鉄塔 */}
      <g opacity={0.55}>
        {Array.from({ length: 16 }, (_, i) => {
          const x = i * 128 - 60;
          const h = 36 + rnd(21, i) * 44;
          return <rect key={i} x={x} y={610 - h} width={90 + rnd(22, i) * 50} height={h}
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <path d="M 1680 610 L 1710 440 L 1740 610 M 1690 540 L 1730 540 M 1696 500 L 1724 500"
          fill="none" stroke={KRP.grayDark} strokeWidth={5} />
      </g>
      <rect x={-20} y={606} width={W + 40} height={10} fill={KRP.grayDark} opacity={0.6} />
      {/* ===== SC本体 (左2/3) ===== */}
      <g opacity={t0} transform={`translate(0 ${(1 - t0) * 30})`}>
        {/* 箱の本体 */}
        <rect x={110} y={270} width={960} height={420} fill={C.scWall} stroke={KRP.ink} strokeWidth={8} />
        <rect x={110} y={270} width={960} height={36} fill={C.scBand} stroke={KRP.ink} strokeWidth={6} />
        {/* 屋上の看板 CINEMA */}
        <rect x={430} y={150} width={400} height={92} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <line x1={470} y1={242} x2={470} y2={270} stroke={KRP.ink} strokeWidth={7} />
        <line x1={790} y1={242} x2={790} y2={270} stroke={KRP.ink} strokeWidth={7} />
        <text x={630} y={216} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={56} fill={C.scBand} letterSpacing={8}>CINEMA</text>
        {/* 屋上の旗 (はためく) */}
        <g transform="translate(170 270)">
          <line x1={0} y1={0} x2={0} y2={-110} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 0 -110 q 34 ${6 + Math.sin(f / 5) * 8} 68 0 q -4 16 0 30 q -34 ${-6 - Math.sin(f / 5) * 8} -68 0 Z`}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 壁の窓帯と映画のポスター枠 */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={150 + i * 120} y={330} width={88} height={64} rx={6}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${660 + i * 150} 330)`}>
            <rect x={0} y={0} width={110} height={150} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={12} y={12} width={86} height={86} fill={i === 0 ? KRP.blue : KRP.orange}
              stroke={KRP.ink} strokeWidth={3.5} />
            <line x1={16} y1={116} x2={94} y2={116} stroke={KRP.ink} strokeWidth={4} />
            <line x1={16} y1={132} x2={70} y2={132} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          </g>
        ))}
        {/* 入口 (ガラスの自動ドア + ひさし) */}
        <rect x={290} y={470} width={300} height={220} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
        <line x1={440} y1={470} x2={440} y2={690} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 330 530 L 380 480 M 486 560 L 548 498" stroke={KRP.white} strokeWidth={8} opacity={0.7} />
        <rect x={262} y={442} width={356} height={34} rx={8} fill={C.scBand} stroke={KRP.ink} strokeWidth={6} />
        {/* 買い物カート置き場 */}
        <g transform="translate(940 600)">
          <rect x={-36} y={-78} width={130} height={86} rx={8} fill="none" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${-8 + i * 34} 0)`} stroke={KRP.ink} strokeWidth={4} fill="none">
              <path d="M -14 -52 L 14 -52 L 10 -16 L -10 -16 Z" fill={KRP.gray} />
              <circle cx={-8} cy={-6} r={6} fill={KRP.white} />
              <circle cx={8} cy={-6} r={6} fill={KRP.white} />
            </g>
          ))}
        </g>
      </g>
      {/* ===== 駐車場 ===== */}
      <rect x={-20} y={690} width={W + 40} height={H - 670} fill={C.asphalt} />
      <line x1={-20} y1={690} x2={W + 20} y2={690} stroke={KRP.ink} strokeWidth={6} />
      {/* 区画線 (奥へすぼむ) */}
      <g stroke={KRP.white} strokeWidth={7} opacity={0.8}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={120 + i * 330} y1={1080} x2={360 + i * 280} y2={700} />
        ))}
      </g>
      {/* 停まっているクルマ 3台 */}
      {[{ x: 330, c: KRP.blueDeep }, { x: 960, c: KRP.green }, { x: 1560, c: KRP.red }].map((cr, i) => (
        <g key={i} transform={`translate(${cr.x} ${850 + Math.sin(f / 16 + i * 2) * 1.5}) scale(${1 + i * 0.04})`}>
          <ellipse cx={0} cy={44} rx={130} ry={16} fill={KRP.ink} opacity={0.14} />
          <path d="M -118 24 Q -124 -16 -86 -22 L -58 -52 Q -50 -62 -36 -62 L 42 -62 Q 56 -62 64 -50 L 86 -22 Q 122 -14 118 24 Q 60 34 0 34 Q -60 34 -118 24 Z"
            fill={cr.c} stroke={KRP.ink} strokeWidth={6.5} />
          <path d="M -48 -52 L -62 -24 L -6 -24 L -6 -52 Z M 8 -52 L 8 -24 L 58 -24 L 40 -52 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-66} cy={28} r={21} fill={KRP.ink} />
          <circle cx={-66} cy={28} r={9} fill={KRP.gray} />
          <circle cx={66} cy={28} r={21} fill={KRP.ink} />
          <circle cx={66} cy={28} r={9} fill={KRP.gray} />
        </g>
      ))}
      {/* 家族連れ (入口へ歩く) + カート */}
      <g transform={`translate(${640 + walk * 0.4} 0)`}>
        <ellipse cx={704} cy={1006} rx={190} ry={22} fill={KRP.ink} opacity={0.13} />
        <Person x={610} y={1000} s={0.92} cloth={KRP.blueDeep} clothDark="#2F5590"
          face="smile" gaze={[-0.5, 0]} f={f} phase={1} />
        <Person x={760} y={1000} s={0.86} cloth={KRP.orange} clothDark="#B86F28"
          face="joy" hair="none" f={f} phase={4} />
        <Person x={690} y={988} s={0.52} cloth={KRP.green} clothDark="#5E9159"
          face="joy" f={f} phase={7} pose="banzai" />
        {/* 買い物カート (押している) */}
        <g transform="translate(486 1000)">
          <path d="M -58 -118 L 46 -118 L 36 -40 L -44 -40 Z"
            fill="none" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -58 -118 L -80 -150 L -102 -150" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={-40} y1={-96} x2={32} y2={-96} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
          <line x1={-46} y1={-66} x2={38} y2={-66} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
          <g transform={`rotate(${f * 9} -34 -14)`}>
            <circle cx={-34} cy={-14} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <line x1={-42} y1={-14} x2={-26} y2={-14} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <g transform={`rotate(${f * 9} 26 -14)`}>
            <circle cx={26} cy={-14} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <line x1={18} y1={-14} x2={34} y2={-14} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #173 とはいえ、日本のお客は、まだまだ自由でした。
// 格: 並 / seed 1301
// 絵: 昭和の映画館の場内。上映中なのに、客はそれぞれ好き勝手 (ゆるさ・自由さ)
// どこ: 昭和の映画館の場内を後ろの通路から見る。左に銀幕 (時代劇の白黒)、右に場内の壁
// 演出: 自由な行動6種 — ①壁にもたれて立ち見 ②途中で入ってきて暗がりで席を探す
//       ③弁当を食べる ④子どもを膝に乗せた親 ⑤うとうと居眠り ⑥振り返って売り子を呼ぶ
//       手前の主要人物 (売り子・呼ぶ客・立ち見・遅れて来た客) は Person。客は暗がりでも服の色が分かる
//       日の丸は売り子の箱に挿した小旗 (主役より目立たせない)
// 動き: 銀幕のちらつき・キズ / 光の帯のほこり / 扇風機の首振り / 売り子が歩く / 箸が上下 /
//       Zzz が浮く / 子どもが手をふる / 呼ぶ手がゆれる / 非常口灯
// ★修正3: 作者「もっと良く・国旗・メインキャラの顔に変な線」→ 売り子の吊り紐は
//   Person と同じ変換の入れ物 (UriKo) の中で、あごより下 (y≧-160) から箱へ。顔の前を通さない
const SHOWA = {
  hair: "#2E2622",
  hairGray: "#7C746C",
  skinDim: "#C9A98A",
  rim: "#E9EFD8",
  velvet: "#7E2B30",
  velvetDark: "#5A1E22",
  carpet: "#5E2E2A",
  wood: "#6E5038",
  woodLite: "#8A6A4A",
  iron: "#2C2622",
  exitGreen: "#4FA36A",
  posterA: "#B98A4A",
  posterB: "#6A86A0",
  lightDoor: "#F3DFA6",
  cloth: ["#6B5B7A", "#5E7058", "#7E5C4A", "#4F607E", "#857048", "#7A4E5E", "#5A6A6E", "#8A6A5A"],
};

// 後ろ姿で座る客 (背もたれの上に肩と頭)。x,yb は背もたれの上辺の中心
const UsiroKyaku: React.FC<{
  x: number; yb: number; s: number; f: number; i: number; cloth: string;
  kind?: "plain" | "hat" | "bento" | "sleep" | "lap" | "senbei" | "gray";
  tiltTo?: -1 | 1;
}> = ({ x, yb, s, f, i, cloth, kind = "plain", tiltTo = 1 }) => {
  const sway = Math.sin(f / 14 + i * 1.3) * 1.2;
  const tilt = kind === "sleep" ? tiltTo * (24 + Math.sin(f / 16) * 4) : sway;
  const hair = kind === "gray" ? SHOWA.hairGray : SHOWA.hair;
  const chop = Math.max(0, Math.sin(f / 5 + i)) * 26;
  return (
    <g transform={`translate(${x} ${yb}) scale(${s})`}>
      {/* 肩と背中 */}
      <path d="M -58 10 L -58 -46 Q -58 -72 -34 -74 L 34 -74 Q 58 -72 58 -46 L 58 10 Z"
        fill={cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {kind === "bento" && (
        <g>
          {/* 張り出したひじ+肩ごしに上下する箸 */}
          <path d="M 50 -48 Q 86 -40 84 -10 L 64 -6 Q 62 -30 46 -30 Z" fill={cloth} stroke={C.ink} strokeWidth={4.5} />
          <path d={`M -44 -40 Q -80 -36 -80 -8 L -60 -4 Q -60 -26 -42 -26 Z`} fill={cloth} stroke={C.ink} strokeWidth={4.5} />
          <line x1={30} y1={-70 - chop} x2={56} y2={-132 - chop} stroke={KRP.cream} strokeWidth={6} strokeLinecap="round" />
          <line x1={40} y1={-68 - chop} x2={68} y2={-128 - chop} stroke={KRP.cream} strokeWidth={6} strokeLinecap="round" />
          {/* つまんだご飯 */}
          <circle cx={62} cy={-134 - chop} r={7} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
          {/* 弁当のふた (左手で持つ) */}
          <rect x={-104} y={-64} width={44} height={30} rx={5} fill="#B0473A" stroke={C.ink} strokeWidth={4} transform="rotate(-18 -82 -50)" />
        </g>
      )}
      {/* 首と頭 (後ろ頭=髪) */}
      <g transform={`rotate(${tilt} 0 -72)`}>
        <rect x={-13} y={-86} width={26} height={16} fill={SHOWA.skinDim} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={-37} cy={-108} rx={8} ry={12} fill={SHOWA.skinDim} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={37} cy={-108} rx={8} ry={12} fill={SHOWA.skinDim} stroke={C.ink} strokeWidth={4} />
        <circle cx={0} cy={-114} r={38} fill={hair} stroke={C.ink} strokeWidth={5} />
        {/* 銀幕の光のふち (左上から) */}
        <path d="M -30 -136 Q -14 -152 8 -151" fill="none" stroke={SHOWA.rim} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
        {kind === "hat" && (
          <g>
            <path d="M -58 -122 Q 0 -134 58 -122 Q 60 -114 50 -114 Q 0 -124 -50 -114 Q -60 -114 -58 -122 Z"
              fill="#4A4038" stroke={C.ink} strokeWidth={4.5} />
            <path d="M -34 -124 L -30 -160 Q 0 -172 30 -160 L 34 -124 Z" fill="#4A4038" stroke={C.ink} strokeWidth={4.5} />
            <path d="M -33 -134 L 33 -134" stroke={C.ink} strokeWidth={6} opacity={0.7} />
          </g>
        )}
      </g>
      {kind === "sleep" && (
        <g fill={SHOWA.rim} fontFamily={FONT} fontWeight={900}>
          {[0, 1, 2].map((k) => {
            const t = (k + ((f * 0.02) % 1)) / 3; // 3つが順に上へ流れる
            return (
              <text key={k} x={tiltTo * (10 + t * 46)} y={-168 - t * 100} fontSize={30 + t * 30}
                opacity={0.9 - t * 0.5} textAnchor="middle">Z</text>
            );
          })}
        </g>
      )}
      {kind === "senbei" && (
        <g transform={`translate(${-54} ${-120 + Math.sin(f / 6) * 5})`}>
          {/* せんべい (かじった跡) とこぼれるかけら */}
          <path d="M 22 -4 A 24 24 0 1 1 18 -16 Q 10 -14 12 -6 Q 16 0 22 -4 Z" fill="#C98E4E" stroke={C.ink} strokeWidth={4} />
          <circle cx={-6} cy={-6} r={2.5} fill={C.ink} opacity={0.5} />
          <circle cx={6} cy={6} r={2.5} fill={C.ink} opacity={0.5} />
          {[0, 1].map((k) => {
            const t = ((f + k * 9) % 18) / 18;
            return <circle key={k} cx={8 + k * 8} cy={20 + t * 40} r={3} fill="#C98E4E" opacity={1 - t} />;
          })}
        </g>
      )}
      {kind === "lap" && (
        <g transform={`translate(44 ${-150 + Math.abs(Math.sin(f / 7)) * -6})`}>
          {/* 親のひざの上に立って、こっちを向いてはしゃぐ子ども */}
          <rect x={-26} y={10} width={52} height={50} rx={14} fill="#D9A23A" stroke={C.ink} strokeWidth={4.5} />
          <rect x={-40} y={2} width={14} height={36} rx={7} fill="#D9A23A" stroke={C.ink} strokeWidth={4}
            transform={`rotate(${30 + Math.sin(f / 4) * 25} -33 10)`} />
          <rect x={26} y={2} width={14} height={36} rx={7} fill="#D9A23A" stroke={C.ink} strokeWidth={4}
            transform={`rotate(${-150 - Math.sin(f / 4 + 1) * 25} 33 10)`} />
          <circle cx={0} cy={-18} r={28} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M -26 -26 Q -24 -48 0 -48 Q 24 -48 26 -26 Q 10 -36 0 -34 Q -10 -36 -26 -26 Z" fill={SHOWA.hair} />
          <circle cx={-9} cy={-16} r={4} fill={C.ink} />
          <circle cx={9} cy={-16} r={4} fill={C.ink} />
          <path d="M -8 -4 Q 0 4 8 -4" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// 木の座席の背もたれ1列 (後ろから見る)。yb は背もたれの上辺
const SeatRowShowa: React.FC<{ yb: number; s: number; x0: number; x1: number; sp: number }> =
  ({ yb, s, x0, x1, sp }) => {
    const n = Math.floor((x1 - x0) / sp) + 1;
    return (
      <g>
        {/* 段の床と、背もたれの下の暗がり */}
        <rect x={-20} y={yb + 50 * s} width={x1 + sp * 0.5 + 20} height={70 * s} fill={SGP.nightInk} opacity={0.9} />
        {Array.from({ length: n }, (_, i) => {
          const cx = x0 + i * sp;
          const w = sp * 0.86;
          return (
            <g key={i}>
              {/* 鉄の脚と肘かけ */}
              <rect x={cx - sp / 2 - 5 * s} y={yb + 14 * s} width={10 * s} height={70 * s} fill={SHOWA.iron} />
              <rect x={cx - sp / 2 - 9 * s} y={yb + 10 * s} width={18 * s} height={10 * s} rx={4} fill={SHOWA.woodLite} stroke={C.ink} strokeWidth={3} />
              {/* 木の背もたれ (板2枚) */}
              <rect x={cx - w / 2} y={yb} width={w} height={62 * s} rx={10 * s}
                fill={C.seatShowa} stroke={C.ink} strokeWidth={5} />
              <line x1={cx - w / 2 + 6} y1={yb + 30 * s} x2={cx + w / 2 - 6} y2={yb + 30 * s}
                stroke={C.ink} strokeWidth={3} opacity={0.45} />
              <path d={`M ${cx - w / 2 + 10 * s} ${yb + 8 * s} Q ${cx} ${yb + 2 * s} ${cx + w / 2 - 10 * s} ${yb + 8 * s}`}
                fill="none" stroke={SHOWA.woodLite} strokeWidth={3} opacity={0.8} />
              {/* 座席番号の真鍮札 (文字なし) */}
              <rect x={cx - 9 * s} y={yb + 38 * s} width={18 * s} height={11 * s} rx={2} fill={KRP.brass} opacity={0.8} />
            </g>
          );
        })}
      </g>
    );
  };

// 売り子: Person と同じ変換の入れ物の中に、箱・吊り紐・小旗を描く (共通の掟の Kasane 方式)
// 人物ローカル座標: 頭 cx0 cy-228 r64 (あご -164)・肩 (±67,-148)・足元 0
const UriKo: React.FC<{ x: number; y: number; s: number; f: number; phase: number }> =
  ({ x, y, s, f, phase }) => {
    const bob = Math.sin((f + phase * 17) / 13) * 3;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <ellipse cx={0} cy={6} rx={96} ry={16} fill={C.ink} opacity={0.35} />
        <Person x={0} y={0} f={f} phase={phase} still cloth="#B8463A" clothDark="#8A3026"
          face="smile" pose="hold" gaze={[-5, 0]} />
        {/* 白い前かけ (胴の前) */}
        <path d="M -44 -132 L 44 -132 L 50 -56 L -50 -56 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4.5} opacity={0.95} />
        {/* 吊り紐: えりもと (y=-160、あごより下) から箱の角へ。顔の前は通さない */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 34} -160 L ${sd * 76} -118`} stroke={C.ink} strokeWidth={13} strokeLinecap="round" />
            <path d={`M ${sd * 34} -160 L ${sd * 76} -118`} stroke={KRP.cream} strokeWidth={7} strokeLinecap="round" />
          </g>
        ))}
        {/* 箱に挿した日の丸の小旗 (頭より右・あごより下) */}
        <line x1={70} y1={-120} x2={70} y2={-200} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <g transform={`translate(70 -200) skewY(${Math.sin(f / 6) * 4})`}>
          <rect x={0} y={0} width={50} height={34} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={25} cy={17} r={9.5} fill={KRP.red} />
        </g>
        {/* 売り箱 (首から下げて腰の前) */}
        <path d="M -84 -120 L 84 -120 L 76 -70 L -76 -70 Z" fill={SGP.wood} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
        <line x1={-80} y1={-102} x2={80} y2={-102} stroke={SGP.woodDark} strokeWidth={3} />
        {/* 中身: ラムネ瓶・キャラメル箱・せんべい */}
        {[-62, -40].map((bx, i) => (
          <g key={i}>
            <path d={`M ${bx - 8} -120 L ${bx - 8} -146 Q ${bx - 8} -154 ${bx - 3} -158 L ${bx - 3} -166 L ${bx + 3} -166 L ${bx + 3} -158 Q ${bx + 8} -154 ${bx + 8} -146 L ${bx + 8} -120 Z`}
              fill="#9FD3C7" stroke={C.ink} strokeWidth={3.5} opacity={0.95} />
            <circle cx={bx} cy={-150} r={3.5} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} />
          </g>
        ))}
        {[-18, 4].map((bx, i) => (
          <rect key={i} x={bx} y={-136} width={20} height={16} rx={2} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
        ))}
        <circle cx={40} cy={-128} r={13} fill="#C98E4E" stroke={C.ink} strokeWidth={3.5} />
        <circle cx={54} cy={-124} r={11} fill="#C98E4E" stroke={C.ink} strokeWidth={3.5} />
      </g>
    );
  };

const Sg173: React.FC<{ f: number }> = ({ f }) => {
  const flicker = 0.9 + Math.sin(f / 3) * 0.05 + Math.sin(f / 7 + 2) * 0.04;
  const swing = Math.sin(f / 22) * 34; // 扇風機の首振り
  // 通路の線: 座席の右端と壁の足元 (奥=上へ行くほど左へ寄る)
  const seatsEnd = (y: number) => 1140 + (y - 600) * 0.93;
  const wallFoot = (y: number) => 1262 + (y - 600) * 1.6;
  const rows = [
    { yb: 576, s: 0.5 },
    { yb: 686, s: 0.7 },
    { yb: 822, s: 0.95 },
  ];
  // 各列の客 (null = 空席。自由席なのでところどころ空いている)
  type K = "plain" | "hat" | "bento" | "sleep" | "lap" | "senbei" | "gray" | null;
  const seat: K[][] = [
    ["plain", "gray", null, "hat", "plain", "plain", null, "plain", "hat", "plain", null, "gray", "plain", null],
    ["hat", null, "plain", "plain", "gray", null, "plain", null, "hat", "plain", null],
    ["plain", "lap", null, "senbei", "bento", null, "hat", "sleep", null],
  ];
  return (
    <Frame f={f} seed={1301} dark bg={C.hallDark}>
      {/* 場内の闇と天井 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.hallDark} />
      <rect x={-20} y={-20} width={W + 40} height={100} fill={C.hallWall} opacity={0.5} />
      <line x1={-20} y1={80} x2={W + 20} y2={80} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      {/* ===== 右の壁 (奥へすぼまる。柱・腰板・ポスター・扇風機・扉・非常口灯) ===== */}
      <polygon points={`1262,90 1960,-120 1960,1100 1262,600`} fill={C.hallWall} />
      <polygon points={`1262,470 1960,560 1960,1100 1262,600`} fill={SHOWA.wood} opacity={0.75} />
      <line x1={1262} y1={470} x2={1960} y2={560} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1262} y1={90} x2={1262} y2={600} stroke={KRP.ink} strokeWidth={5} />
      {[1420, 1600, 1830].map((px, i) => {
        const t = (px - 1262) / 698;
        const top = lerp(90, -120, t), bot = lerp(600, 1100, t);
        const w = lerp(18, 46, t);
        return (
          <g key={i}>
            <rect x={px} y={top} width={w} height={bot - top} fill={SHOWA.woodLite} stroke={KRP.ink} strokeWidth={4} />
            <line x1={px + w * 0.35} y1={top} x2={px + w * 0.35} y2={bot} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
          </g>
        );
      })}
      {/* ポスターの額 (絵だけ・文字なし) */}
      {[{ x: 1480, c: SHOWA.posterA }, { x: 1680, c: SHOWA.posterB }].map((p, i) => {
        const t = (p.x - 1262) / 698;
        const y0 = lerp(220, 170, t), h = lerp(150, 230, t), w = lerp(80, 120, t);
        return (
          <g key={i}>
            <polygon points={`${p.x},${y0} ${p.x + w},${y0 - w * 0.13} ${p.x + w},${y0 + h + w * 0.1} ${p.x},${y0 + h}`}
              fill={p.c} stroke={KRP.ink} strokeWidth={4.5} opacity={0.9} />
            <circle cx={p.x + w * 0.5} cy={y0 + h * 0.4} r={w * 0.22} fill={KRP.white} opacity={0.55} />
            <path d={`M ${p.x + w * 0.15} ${y0 + h * 0.85} L ${p.x + w * 0.5} ${y0 + h * 0.6} L ${p.x + w * 0.85} ${y0 + h * 0.82}`}
              fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          </g>
        );
      })}
      {/* 壁の扇風機 (首を振る) */}
      <g transform="translate(1790 250)">
        <rect x={-14} y={-6} width={28} height={50} rx={6} fill={SHOWA.iron} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${swing * 0.4}) scale(${Math.cos((swing * Math.PI) / 180) * 0.35 + 0.65} 1)`}>
          <circle cx={0} cy={60} r={52} fill="#5E6E6A" opacity={0.35} stroke={KRP.ink} strokeWidth={4.5} />
          {[0, 1, 2].map((b) => (
            <ellipse key={b} cx={0} cy={60} rx={14} ry={44} fill="#8FA6A0" opacity={0.75}
              transform={`rotate(${f * 23 + b * 120} 0 60)`} />
          ))}
          <circle cx={0} cy={60} r={10} fill={SHOWA.iron} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2, 3, 4, 5].map((g) => (
            <line key={g} x1={0} y1={60} x2={Math.cos((g * Math.PI) / 3) * 52} y2={60 + Math.sin((g * Math.PI) / 3) * 52}
              stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
          ))}
        </g>
      </g>
      {/* 横の扉: 暗幕が開いて廊下の光がもれる */}
      <polygon points="1296,402 1372,392 1372,650 1296,624" fill={SHOWA.lightDoor} opacity={0.9} />
      <polygon points="1296,624 1372,650 1238,720 1150,662" fill={SHOWA.lightDoor} opacity={0.22} />
      <path d="M 1296 402 Q 1318 520 1300 626 L 1296 624 Z" fill={SHOWA.velvet} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M 1372 392 Q ${1356 + Math.sin(f / 10) * 4} 520 1372 650 L 1392 656 Q ${1380 + Math.sin(f / 10) * 4} 520 1392 388 Z`}
        fill={SHOWA.velvet} stroke={KRP.ink} strokeWidth={4} />
      <polygon points="1290,398 1380,386 1380,394 1290,406" fill={SHOWA.woodLite} stroke={KRP.ink} strokeWidth={3} />
      {/* 非常口灯 (緑) */}
      <g>
        <ellipse cx={1338} cy={346} rx={86} ry={34} fill={SHOWA.exitGreen} opacity={0.18 + Math.sin(f / 9) * 0.05} />
        <polygon points="1288,328 1390,316 1390,360 1288,370" fill={SHOWA.exitGreen} stroke={KRP.ink} strokeWidth={4} />
        <text x={1339} y={352} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24}
          fill={KRP.white} transform="skewY(-6.5) translate(0 152)">非常口</text>
      </g>

      {/* ===== 銀幕 (左)。時代劇の白黒の一場面 ===== */}
      <g opacity={flicker}>
        <rect x={80} y={120} width={680} height={370} fill={C.screenGlow} stroke={KRP.ink} strokeWidth={8} />
        <rect x={80} y={120} width={680} height={370} fill={KRP.white} opacity={0.22 + Math.sin(f / 4) * 0.08} />
        <g fill={KRP.grayDark} opacity={0.75}>
          <circle cx={600} cy={210} r={44} fill="none" stroke={KRP.grayDark} strokeWidth={6} />
          <path d="M 80 420 Q 300 400 420 418 Q 560 430 760 412 L 760 490 L 80 490 Z" />
          {/* にらみ合う二人の侍 (影絵) */}
          <g transform={`translate(${300 + Math.sin(f / 9) * 3} 420)`}>
            <circle cx={0} cy={-118} r={18} />
            <path d="M -8 -132 L 0 -150 L 8 -132 Z" />
            <path d="M -26 -100 L 26 -100 L 34 -40 L 18 0 L 6 0 L 0 -30 L -6 0 L -18 0 L -34 -40 Z" />
            <line x1={20} y1={-92} x2={90} y2={-140} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
          </g>
          <g transform={`translate(${520 - Math.sin(f / 9) * 3} 420)`}>
            <circle cx={0} cy={-114} r={18} />
            <path d="M -28 -96 L 28 -96 L 40 0 L -40 0 Z" />
            <line x1={-20} y1={-80} x2={-96} y2={-118} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
          </g>
        </g>
        {/* 走る縦キズ */}
        <line x1={150 + (f * 37) % 560} y1={126} x2={152 + (f * 37) % 560} y2={484}
          stroke={KRP.grayDark} strokeWidth={2.5} opacity={0.5} />
      </g>
      {/* 緞帳の袖と上の飾り幕・舞台のへり */}
      <path d="M 30 90 L 112 90 Q 98 300 120 520 L 30 520 Z" fill={SHOWA.velvet} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 810 90 L 728 90 Q 742 300 720 520 L 810 520 Z" fill={SHOWA.velvet} stroke={KRP.ink} strokeWidth={5} />
      {[60, 84].map((lx) => <line key={lx} x1={lx} y1={96} x2={lx + 4} y2={514} stroke={SHOWA.velvetDark} strokeWidth={3} />)}
      {[760, 784].map((lx) => <line key={lx} x1={lx} y1={96} x2={lx - 4} y2={514} stroke={SHOWA.velvetDark} strokeWidth={3} />)}
      <path d={`M 20 84 L 820 84 L 820 118 ${Array.from({ length: 10 }, (_, i) => `Q ${800 - i * 80} 150 ${780 - i * 80} 118`).join(" ")} L 20 118 Z`}
        fill={SHOWA.velvet} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={10} y={520} width={840} height={30} fill={SHOWA.wood} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 10 550 L 850 550 L 900 566 L -10 566 Z" fill={SGP.nightInk} />
      {/* 幕の光が客席にこぼれる */}
      <path d="M 80 540 L 760 540 L 1100 760 L -40 760 Z" fill={C.screenGlow} opacity={0.06} />

      {/* ===== 通路 (赤い絨毯) ===== */}
      <polygon points={`${seatsEnd(560)},560 ${wallFoot(560)},560 ${wallFoot(1100)},1100 ${seatsEnd(1100)},1100`}
        fill={SHOWA.carpet} />
      <line x1={seatsEnd(560)} y1={560} x2={seatsEnd(1100)} y2={1100} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      {/* 足元灯 */}
      {[620, 720, 840].map((yy, i) => (
        <circle key={i} cx={seatsEnd(yy) + 14} cy={yy} r={5} fill={C.lampWarm} opacity={0.6 + Math.sin(f / 6 + i * 2) * 0.25} />
      ))}

      {/* ===== 映写機の光の帯 (右上の映写窓 → 銀幕) ===== */}
      <path d="M 1920 20 L 1920 170 L 760 470 L 760 140 Z" fill={C.lampWarm} opacity={0.12} />
      <path d="M 1920 60 L 1920 120 L 760 400 L 760 230 Z" fill={C.lampWarm} opacity={0.1} />

      {/* ===== 客席 (奥の列から) ===== */}
      {rows.map((r, ri) => {
        const sp = 148 * r.s;
        const x0 = 70 + ri * 18;
        const x1 = seatsEnd(r.yb) - sp * 0.55;
        const list = seat[ri];
        const nSeat = Math.floor((x1 - x0) / sp) + 1;
        const lastX = x0 + (nSeat - 1) * sp; // 通路側の端の席
        return (
          <g key={ri}>
            {list.map((k, i) => {
              const x = x0 + i * sp;
              if (k === null || x > x1 || (ri === 2 && i === nSeat - 1)) return null;
              return (
                <UsiroKyaku key={i} x={x} yb={r.yb} s={r.s} f={f} i={ri * 10 + i}
                  cloth={SHOWA.cloth[(i * 3 + ri) % SHOWA.cloth.length]} kind={k}
                  tiltTo={k === "sleep" ? -1 : 1} />
              );
            })}
            {/* ⑥ 振り返って売り子を呼ぶ客 (2列目の通路側。背もたれが胸から下を隠す) */}
            {ri === 2 && (
              <g>
                <Person x={lastX} y={r.yb + 92 * 0.74} s={0.74} f={f} phase={2}
                  cloth="#5E7A9A" clothDark="#46607E" face="smile" pose="point" pointDir={1} gaze={[6, -1]} />
                {/* 呼ぶ声のしるし (顔の外・右上) */}
                <g stroke={SHOWA.rim} strokeWidth={5} strokeLinecap="round" opacity={0.6 + Math.sin(f / 4) * 0.3}>
                  <line x1={lastX + 130} y1={r.yb - 118} x2={lastX + 152} y2={r.yb - 126} />
                  <line x1={lastX + 134} y1={r.yb - 100} x2={lastX + 160} y2={r.yb - 116} />
                  <line x1={lastX + 130} y1={r.yb - 82} x2={lastX + 152} y2={r.yb - 74} />
                </g>
              </g>
            )}
            <SeatRowShowa yb={r.yb} s={r.s} x0={x0} x1={x1} sp={sp} />
            {/* ② 途中で入ってきて席を探す客 (扉の光の中・前かがみ) */}
            {ri === 0 && (
              <Person x={1318 - f * 0.25} y={648} s={0.4} f={f} phase={6} lean={-7}
                cloth="#7A6A5A" clothDark="#5A4A3E" face="worried" pose="hold" gaze={[-5, 3]} />
            )}
          </g>
        );
      })}

      {/* 光の帯のほこり */}
      {Array.from({ length: 16 }, (_, i) => {
        const tdrift = ((f * 1.3 + rnd(31, i) * 100) % 100) / 100;
        const x = lerp(1880, 790, tdrift);
        const y = lerp(60 + rnd(32, i) * 90, 200 + rnd(33, i) * 220, tdrift);
        return <circle key={i} cx={x} cy={y} r={2.2 + rnd(34, i) * 2}
          fill={C.lampWarm} opacity={0.45 + rnd(35, i) * 0.4} />;
      })}

      {/* ① 壁にもたれて立ち見する客 (腕組み) */}
      <g>
        <ellipse cx={1716} cy={872} rx={70} ry={12} fill={KRP.ink} opacity={0.35} />
        <Person x={1712} y={868} s={0.7} f={f} phase={4} lean={5}
          cloth="#6E7E62" clothDark="#55644A" face="smile" pose="armsFolded" gaze={[-6, 0]} />
      </g>
      {/* 売り子 (通路を歩く。首から下げた売り箱+日の丸の小旗) */}
      <UriKo x={1500 - f * 0.45} y={890} s={0.7} f={f} phase={1} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #174 昭和の映画館は、二本立て、自由席、入れ替えなし。
// 格: 図 / seed 1302
// 絵: 昭和セットの三枚札「二本立て」「自由席」「入替なし」。ロビーの掲示板の世界に並ぶ
// どこ: 昭和の映画館のロビー。正面の大きな木の掲示板の前
// 演出: 掲示板にポスター2枚。その上の桟から三枚の木札「二本立て」「自由席」「入替なし」が順に下りる
// 動き: 札がトン・トン・トンと落ちて微かに揺れる・もぎりが指し示す・観葉植物の葉がゆれる
const Sg174: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1302}>
    {/* ロビーの壁 (腰板つき) */}
    <rect x={-20} y={-20} width={W + 40} height={740} fill={C.lobbyWall} />
    <rect x={-20} y={560} width={W + 40} height={160} fill={C.seatShowa} opacity={0.35} />
    <line x1={-20} y1={560} x2={W + 20} y2={560} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    {/* 天井の照明 (丸い笠) */}
    {[480, 1440].map((x, i) => (
      <g key={x} transform={`translate(${x} 0)`}>
        <line x1={0} y1={-10} x2={0} y2={64} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -44 100 A 44 44 0 0 1 44 100 Z" fill={C.lampWarm} stroke={KRP.ink} strokeWidth={5.5}
          transform="rotate(180 0 82)" />
        <circle cx={0} cy={104} r={10 + Math.sin(f / 10 + i * 2) * 1.5} fill={C.lampWarm} opacity={0.8} />
        <circle cx={0} cy={104} r={30} fill={C.lampWarm} opacity={0.22} />
      </g>
    ))}
    {/* 床 (タイル市松) */}
    <rect x={-20} y={720} width={W + 40} height={H - 700} fill={C.tileA} />
    <line x1={-20} y1={720} x2={W + 20} y2={720} stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 24 }, (_, i) => {
      const rowN = Math.floor(i / 8);
      const colN = i % 8;
      const yTop = 720 + rowN * 120;
      const wCell = 240 + rowN * 30;
      const x0 = -40 + colN * wCell - rowN * 60;
      if ((rowN + colN) % 2 === 0) return null;
      return <path key={i} d={`M ${x0} ${yTop} L ${x0 + wCell} ${yTop} L ${x0 + wCell + 24} ${yTop + 120} L ${x0 - 24} ${yTop + 120} Z`}
        fill={C.tileB} opacity={0.9} />;
    })}
    <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.3}>
      <line x1={-20} y1={840} x2={W + 20} y2={840} />
      <line x1={-20} y1={960} x2={W + 20} y2={960} />
    </g>
    {/* ===== 大きな木の掲示板 ===== */}
    <g transform="translate(900 0)">
      {/* 脚 */}
      <rect x={-520} y={620} width={34} height={240} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={486} y={620} width={34} height={240} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 板 */}
      <rect x={-580} y={120} width={1160} height={520} rx={10} fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-548} y={152} width={1096} height={456} fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -520 140 Q -200 134 300 140 M -420 622 Q 100 628 480 622" fill="none" stroke={SGP.woodDark} strokeWidth={3} />
      {[[-566, 136], [566, 136], [-566, 624], [566, 624]].map(([nx, ny], i) => (
        <circle key={i} cx={nx} cy={ny} r={4} fill={KRP.ink} />
      ))}
      {/* 上の桟 (札の吊り元) */}
      <rect x={-580} y={96} width={1160} height={26} rx={10} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* ポスター2枚 (左右の端。真ん中は札の場所) */}
      <g transform="translate(-424 380) rotate(-2)">
        <rect x={-96} y={-180} width={192} height={360} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-76} y={-156} width={152} height={190} fill={C.posterOld} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 役者の顔 (大映し) */}
        <circle cx={0} cy={-70} r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -52 -86 Q -40 -128 0 -126 Q 40 -128 52 -86 Q 20 -104 -20 -104 Q -40 -98 -52 -86 Z" fill={KRP.ink} />
        <circle cx={-18} cy={-66} r={4} fill={KRP.ink} />
        <circle cx={18} cy={-66} r={4} fill={KRP.ink} />
        <path d="M -12 -42 L 12 -42" stroke={KRP.ink} strokeWidth={4} />
        <line x1={-60} y1={70} x2={60} y2={70} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-66} y1={104} x2={66} y2={104} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={-50} y1={134} x2={50} y2={134} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <circle cx={-80} cy={-164} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={80} cy={-164} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <g transform="translate(424 380) rotate(2)">
        <rect x={-96} y={-180} width={192} height={360} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-76} y={-156} width={152} height={190} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 富士と船の活劇 */}
        <path d="M -70 20 L -18 -70 L 8 -36 L 40 -96 L 74 20 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -48 6 q 24 -14 48 0 l -8 14 l -32 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={-60} y1={70} x2={60} y2={70} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-66} y1={104} x2={66} y2={104} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={-50} y1={134} x2={50} y2={134} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <circle cx={-80} cy={-164} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={80} cy={-164} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* ===== 三枚札 (この絵の主役。順に下りる) ===== */}
      <BoardFuda x={0} y={300} w={300} text="二本立て" t={seg(f, 2, 14)} f={f} i={0} />
      <BoardFuda x={0} y={452} w={280} text="自由席" t={seg(f, 12, 24)} f={f} i={1} />
      <BoardFuda x={0} y={590} w={300} text="入替なし" t={seg(f, 22, 34)} f={f} i={2} />
    </g>
    {/* もぎり (左手前から札を指す。昭和の映画館の係員らしく制帽と制服で) */}
    <ellipse cx={210} cy={1016} rx={120} ry={18} fill={KRP.ink} opacity={0.15} />
    <Person x={210} y={1010} s={1.3} cloth={KRP.blueDeep} clothDark="#2F5590"
      face="smile" pose="point" pointDir={1} gaze={[0.7, -0.3]} f={f} />
    <KakariFuku x={210} y={1010} s={1.3} f={f} dark="#2F5590" />
    {/* 観葉植物 (右端) */}
    <g transform="translate(1800 1010)">
      <path d="M -60 0 l 14 -110 l 92 0 l 14 110 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i}
          d={`M 0 -108 q ${-90 + i * 44 + Math.sin(f / 11 + i) * 6} ${-60 - i * 10} ${-58 + i * 30} ${-170 - i * 8}`}
          fill="none" stroke={KRP.green} strokeWidth={15} strokeLinecap="round" />
      ))}
    </g>
  </Frame>
);

// -------------------------------------------------------------------
// #175 朝に入って、2本観て、気に入ったほうをもう1回観て、夕方に帰る。
// 格: 山 / seed 1303
// 絵: 一日満喫すごろく。「朝・入場」→「1本目」→「2本目」→「おかわり」→「夕方・退場」のマスを客のコマが進む。ユーモア
// どこ: 畳の上に広げた手製のすごろく (真上からのぞく)
// 演出: 「朝 入場」→「1本目」→「2本目」→「おかわり」→「夕方 退場」の5マス。おかわりから2本目へ赤い点線の戻り矢印
// 動き: 客のコマがマスからマスへぴょんぴょん進む・サイコロがことこと・湯のみの湯気
const Sg175: React.FC<{ f: number }> = ({ f }) => {
  // マスの中心 (紙の上のS字)
  const masu = [
    { x: 330, y: 330, tx: "朝 入場", c: KRP.yellow },
    { x: 760, y: 300, tx: "1本目", c: KRP.white },
    { x: 1190, y: 350, tx: "2本目", c: KRP.white },
    { x: 1030, y: 620, tx: "おかわり", c: KRP.orange },
    { x: 1500, y: 640, tx: "夕方 退場", c: KRP.blueSoft },
  ];
  // コマの現在地: 0→1→2→3→2→4 と進む (おかわりで2本目へ戻るのがオチ)
  const route = [0, 1, 2, 3, 2, 4];
  const stepT = seg(f, 2, 40) * (route.length - 1);
  const si = Math.min(Math.floor(stepT), route.length - 2);
  const st = easeOut(clamp01(stepT - si));
  const a = masu[route[si]];
  const b = masu[route[si + 1]];
  const komaX = lerp(a.x, b.x, st);
  const komaY = lerp(a.y, b.y, st) - Math.sin(st * Math.PI) * 90 - 132;
  return (
    <Frame f={f} seed={1303} bg={C.tatami}>
      {/* 畳 (目と縁) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.tatami} />
      <g stroke={C.tatamiDark} strokeWidth={3} opacity={0.5}>
        {Array.from({ length: 26 }, (_, i) => (
          <line key={i} x1={-20} y1={i * 44 - 10} x2={W + 20} y2={i * 44 - 10} />
        ))}
      </g>
      <rect x={-20} y={496} width={W + 40} height={26} fill={KRP.ink} opacity={0.5} />
      <rect x={-20} y={496} width={W + 40} height={26} fill="none" stroke={KRP.ink} strokeWidth={3} />
      {/* すごろくの紙 (大きな washi。少し傾く) */}
      <g transform="rotate(-1.2 960 520)">
        <rect x={130} y={120} width={1660} height={700} rx={8}
          fill={C.washi} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 150 140 L 196 120 M 1790 790 L 1742 822" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} fill="none" />
        <path d="M 1660 128 Q 1668 180 1652 230" stroke={KRP.ink} strokeWidth={3} opacity={0.3} fill="none" />
        {/* 朝の太陽 (左上) と夕日 (右下) */}
        <g transform="translate(240 200)">
          <circle cx={0} cy={0} r={38} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => {
            const ag = (i / 8) * Math.PI * 2 + f / 40;
            return <line key={i} x1={Math.cos(ag) * 48} y1={Math.sin(ag) * 48}
              x2={Math.cos(ag) * 64} y2={Math.sin(ag) * 64} stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
        <g transform="translate(1690 760)">
          <path d="M -46 10 A 46 46 0 0 1 46 10 Z" fill={C.sunsetLo} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-62} y1={12} x2={62} y2={12} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -30 -28 q 30 -16 60 0" fill="none" stroke={C.sunsetLo} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        </g>
        {/* マスをつなぐ道 */}
        <g fill="none" stroke={SGP.woodDark} strokeWidth={10} strokeLinecap="round" opacity={0.75}>
          <path d="M 440 322 Q 560 290 646 302" />
          <path d="M 874 306 Q 990 310 1076 336" />
          <path d="M 1216 440 Q 1200 520 1136 572" />
          <path d="M 1160 648 Q 1300 680 1374 660" />
        </g>
        {/* 道の矢じり */}
        <g fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3}>
          <path d="M 650 302 l -26 -16 l 4 30 Z" />
          <path d="M 1080 338 l -28 -12 l 8 30 Z" />
          <path d="M 1134 574 l -2 -32 l -26 20 Z" />
          <path d="M 1378 660 l -30 -12 l 6 30 Z" />
        </g>
        {/* おかわり→2本目の赤い戻り矢印 (点線でぐるり) */}
        <path d="M 980 540 Q 900 430 1056 388"
          fill="none" stroke={KRP.red} strokeWidth={8} strokeLinecap="round"
          strokeDasharray="18 14" strokeDashoffset={-f * 1.6} />
        <path d="M 1062 386 l -34 -8 l 14 30 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        {/* 5つのマス */}
        {masu.map((m, i) => (
          <g key={i} transform={`translate(${m.x} ${m.y})`}>
            <rect x={-104} y={-66} width={208} height={128} rx={16}
              fill={m.c} stroke={KRP.ink} strokeWidth={7} />
            <rect x={-104} y={-66} width={208} height={128} rx={16}
              fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} transform="translate(5 6)" />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={m.tx.length >= 5 ? 36 : 42} fill={KRP.ink}>{m.tx}</text>
            {/* マスの絵ごころ (切符・フィルム・茶) */}
            {i === 0 && <path d="M -78 -44 l 34 0 l 0 22 l -34 0 Z M -70 -44 l 0 22" fill="none" stroke={KRP.ink} strokeWidth={3.5} />}
            {(i === 1 || i === 2) && (
              <g stroke={KRP.ink} strokeWidth={3.5} fill="none">
                <rect x={46} y={-52} width={40} height={26} rx={4} />
                <line x1={56} y1={-52} x2={56} y2={-26} />
                <line x1={76} y1={-52} x2={76} y2={-26} />
              </g>
            )}
            {i === 3 && <path d="M 56 -50 q 16 10 0 22 M 66 -52 q 18 12 0 26" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />}
            {i === 4 && <path d="M -82 -50 q 10 12 24 0 q 10 12 24 0" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />}
          </g>
        ))}
        {/* コマ (客の紙人形。ぴょんぴょん跳ぶ) */}
        <g transform={`translate(${komaX} ${komaY}) rotate(${Math.sin(st * Math.PI) * (b.x > a.x ? 10 : -10)})`}>
          <ellipse cx={0} cy={66} rx={44} ry={10} fill={KRP.ink} opacity={0.18 * (1 - Math.sin(st * Math.PI) * 0.7)} />
          <path d="M -34 64 L -24 -12 Q -24 -26 -10 -28 L 10 -28 Q 24 -26 24 -12 L 34 64 Z"
            fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={-52} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-8} cy={-56} r={3.4} fill={KRP.ink} />
          <circle cx={8} cy={-56} r={3.4} fill={KRP.ink} />
          <path d="M -8 -44 Q 0 -37 8 -44" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      </g>
      {/* 畳の上の小物: サイコロと湯のみとせんべい */}
      <g transform={`translate(420 940) rotate(${Math.sin(f / 8) * 4})`}>
        <rect x={-44} y={-44} width={88} height={88} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
        <circle cx={0} cy={0} r={9} fill={KRP.red} />
        <circle cx={-22} cy={-22} r={7} fill={KRP.ink} />
        <circle cx={22} cy={22} r={7} fill={KRP.ink} />
      </g>
      <g transform="translate(1600 150)">
        <ellipse cx={0} cy={40} rx={58} ry={14} fill={KRP.ink} opacity={0.12} />
        <path d="M -40 36 L -34 -24 L 34 -24 L 40 36 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={-36} y1={-10} x2={36} y2={-10} stroke={KRP.green} strokeWidth={5} opacity={0.7} />
        <path d={`M -10 -32 q ${Math.sin(f / 7) * 7} -16 -3 -34 M 10 -32 q ${Math.sin(f / 7 + 1.4) * 7} -14 3 -30`}
          fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={0.8} />
      </g>
      <g transform="translate(200 700)">
        <ellipse cx={0} cy={18} rx={70} ry={16} fill={KRP.ink} opacity={0.1} />
        <circle cx={0} cy={0} r={52} fill={SGP.paper} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={52} fill="none" stroke={KRP.ink} strokeWidth={2.5} strokeDasharray="4 7" opacity={0.6} />
        <circle cx={-14} cy={-8} r={3} fill={KRP.ink} opacity={0.5} />
        <circle cx={12} cy={10} r={3} fill={KRP.ink} opacity={0.5} />
        <circle cx={8} cy={-16} r={3} fill={KRP.ink} opacity={0.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #176 そういう観方が、ごくふつうにできました。
// 格: 並 / seed 1304
// 絵: 夕焼けの出口。満足顔でのびをする客。もぎりが「またどうぞ」
// どこ: 夕焼けの映画館の出口前。右に館の壁と出口、左に沈む夕日
// 演出: 満足顔の客が大きくのびをする。戸口でもぎりがおじぎ。影が長く伸びる
// 動き: 夕日の光条がゆっくり回る・鳥が渡る・のびの腕がゆれる・戸口の光がまたたく
const Sg176: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1304} bg={C.sunsetHi}>
    {/* 夕焼けの空 (横の帯) */}
    <rect x={-20} y={-20} width={W + 40} height={800} fill={C.sunsetHi} />
    <rect x={-20} y={330} width={W + 40} height={230} fill={C.sunsetLo} opacity={0.55} />
    <rect x={-20} y={540} width={W + 40} height={240} fill={C.sunsetLo} opacity={0.8} />
    {/* 夕日と光条 */}
    <g transform="translate(350 560)">
      <g transform={`rotate(${f * 0.25})`} opacity={0.4}>
        {Array.from({ length: 10 }, (_, i) => {
          const ag = (i / 10) * Math.PI * 2;
          return <path key={i} d={`M ${Math.cos(ag) * 120} ${Math.sin(ag) * 120} L ${Math.cos(ag + 0.1) * 420} ${Math.sin(ag + 0.1) * 420} L ${Math.cos(ag - 0.1) * 420} ${Math.sin(ag - 0.1) * 420} Z`}
            fill={C.sunsetSun} />;
        })}
      </g>
      <circle cx={0} cy={0} r={104} fill={C.sunsetSun} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={0} r={104} fill={KRP.white} opacity={0.25 + Math.sin(f / 9) * 0.08} />
    </g>
    {/* 渡り鳥 */}
    <g stroke={KRP.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.8}>
      {[0, 1, 2].map((i) => (
        <path key={i}
          d={`M ${820 - f * 1.4 + i * 110} ${170 + i * 44 + Math.sin(f / 10 + i) * 6} q 14 ${-12 - Math.sin(f / 4 + i) * 5} 28 0 q 14 ${-12 - Math.sin(f / 4 + i) * 5} 28 0`} />
      ))}
    </g>
    {/* 遠景: 町の屋根 (夕闇の色) */}
    <g opacity={0.8}>
      {Array.from({ length: 10 }, (_, i) => {
        const x = i * 150 - 80;
        const h = 60 + rnd(61, i) * 80;
        return (
          <g key={i}>
            <rect x={x} y={760 - h} width={120} height={h} fill="#8A5E50" stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${x - 10} ${760 - h} L ${x + 60} ${760 - h - 34} L ${x + 130} ${760 - h} Z`}
              fill="#6E4A40" stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
    </g>
    {/* ===== 映画館の壁と出口 (右1/3) ===== */}
    <g>
      <rect x={1270} y={60} width={670} height={720} fill={C.meigaWall} stroke={KRP.ink} strokeWidth={8} />
      <rect x={1270} y={60} width={670} height={46} fill={C.scBand} stroke={KRP.ink} strokeWidth={6} />
      {/* 板壁の目地 */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
        {[200, 320, 440, 560, 680].map((y) => <line key={y} x1={1280} y1={y} x2={1930} y2={y} />)}
      </g>
      {/* 出口の戸口 (中の電球色がこぼれる) */}
      <rect x={1430} y={300} width={300} height={480} fill="#3A2E26" stroke={KRP.ink} strokeWidth={8} />
      <rect x={1452} y={322} width={256} height={458} fill={C.lampWarm} opacity={0.5 + Math.sin(f / 7) * 0.06} />
      <path d="M 1452 780 L 1708 780 L 1560 1010 L 1200 1010 Z" fill={C.lampWarm} opacity={0.22} />
      {/* 「出口」の札 */}
      <rect x={1494} y={234} width={172} height={60} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <text x={1580} y={280} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={42} fill={KRP.ink} letterSpacing={6}>出口</text>
      {/* もぎり (戸口で深くおじぎ。#174 と同じ制帽・制服で揃える) */}
      <Person x={1640} y={790} s={0.96} cloth={KRP.red} clothDark="#A33224"
        face="smile" lean={24} still f={0} gaze={[-0.6, 0.4]} />
      <KakariFuku x={1640} y={790} s={0.96} lean={24} still f={0} dark="#A33224" />
    </g>
    {/* 地面 (砂利道) と長い影 */}
    <rect x={-20} y={780} width={W + 40} height={H - 760} fill="#C7A478" />
    <line x1={-20} y1={780} x2={W + 20} y2={780} stroke={KRP.ink} strokeWidth={6} />
    <g fill={KRP.ink} opacity={0.25}>
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={rnd(71, i) * 1900} cy={820 + rnd(72, i) * 230} r={3 + rnd(73, i) * 4} />
      ))}
    </g>
    {/* のびをする客 (主役。影が夕日と反対へ長く) */}
    <g transform="translate(880 0)">
      <path d="M -60 1004 L 60 1004 L 520 960 L 400 952 Z" fill={KRP.ink} opacity={0.22} />
      <g transform={`rotate(${Math.sin(f / 11) * 2} 0 1004)`}>
        <Person x={0} y={1004} s={1.7} cloth={KRP.green} clothDark="#5E9159"
          face="joy" pose="banzai" f={f} />
      </g>
      {/* 満足の湯気のような吐息 */}
      <path d={`M 70 560 q ${14 + Math.sin(f / 6) * 6} -26 2 -52`}
        fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
    </g>
    {/* 道ばたの立て看板 (今週の二本) */}
    <g transform="translate(180 1000) rotate(-3)">
      <path d="M -10 0 L 32 -210 M 10 0 L -14 -210" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-104} y={-246} width={208} height={150} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
      <rect x={-84} y={-226} width={82} height={72} fill={C.posterOld} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={6} y={-226} width={82} height={72} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      <line x1={-80} y1={-128} x2={80} y2={-128} stroke={KRP.ink} strokeWidth={4} opacity={0.65} />
      <line x1={-62} y1={-112} x2={62} y2={-112} stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
    </g>
  </Frame>
);

// -------------------------------------------------------------------
// #177 変化は、静かにやってきます。
// 格: 並 / seed 1305
// 絵: 静かな路地。映画館の掲示板の隅で、古いポスターの上に新しい貼り紙が一枚だけ重なる
// どこ: 夜ふけの静かな路地。映画館の裏手の壁ぎわ (掲示板に寄る)
// 演出: 古いポスターが重なる掲示板の隅に、新しい白い貼り紙が一枚だけ重なって現れる
// 動き: 貼り紙がすっと貼られて角がはためく・街灯の光がまたたく・猫のしっぽがゆれる・星がまたたく
const Sg177: React.FC<{ f: number }> = ({ f }) => {
  const paste = easeOut(seg(f, 10, 26)); // 新しい貼り紙が置かれる
  return (
    <Frame f={f} seed={1305} dark bg={C.nightBlue}>
      {/* 夜空と月と星 */}
      <rect x={-20} y={-20} width={W + 40} height={520} fill={C.nightBlue} />
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={rnd(81, i) * 1880} cy={rnd(82, i) * 300}
          r={1.6 + rnd(83, i) * 2}
          fill={KRP.white} opacity={0.3 + 0.55 * Math.abs(Math.sin(f / 11 + i * 1.3))} />
      ))}
      <g transform="translate(1660 170)">
        <circle cx={0} cy={0} r={62} fill={C.sunsetSun} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-18} cy={-12} r={11} fill="#DCCFA3" />
        <circle cx={16} cy={20} r={7} fill="#DCCFA3" />
      </g>
      {/* 奥の壁 (路地の突き当たり) と手前の壁 */}
      <rect x={1180} y={120} width={760} height={680} fill={C.nightWall2} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[260, 400, 540, 680].map((y) => <line key={y} x1={1190} y1={y} x2={1930} y2={y} />)}
      </g>
      {/* 奥の壁の小窓 (ひとつだけ灯り) */}
      <rect x={1620} y={300} width={90} height={110} fill={C.lampWarm} opacity={0.75} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1665} y1={300} x2={1665} y2={410} stroke={KRP.ink} strokeWidth={4} />
      <rect x={1420} y={320} width={84} height={100} fill="#232A40" stroke={KRP.ink} strokeWidth={5} />
      {/* 主役の壁 (左。板壁) */}
      <rect x={-20} y={60} width={1200} height={740} fill={C.nightWall} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
        {[150, 260, 370, 480, 590, 700].map((y) => <line key={y} x1={-20} y1={y} x2={1180} y2={y} />)}
        <line x1={240} y1={64} x2={240} y2={796} />
        <line x1={880} y1={64} x2={880} y2={796} />
      </g>
      {/* 雨どい */}
      <rect x={1130} y={60} width={30} height={740} fill={C.nightWall2} stroke={KRP.ink} strokeWidth={5} />
      {/* ===== 掲示板 (古いポスターの重なり) ===== */}
      <g transform="translate(560 430)">
        <rect x={-430} y={-280} width={860} height={560} rx={8}
          fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-404} y={-254} width={808} height={508} fill="#6E6046" stroke={KRP.ink} strokeWidth={5} />
        {/* 古いポスター3枚 (日に焼けて破れている) */}
        <g transform="translate(-230 -40) rotate(-3)">
          <path d="M -130 -180 L 130 -180 L 130 150 L 40 180 L -130 164 Z"
            fill={C.posterOld2} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-70} r={48} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
          <line x1={-90} y1={40} x2={90} y2={40} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          <line x1={-96} y1={80} x2={72} y2={80} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
          <path d="M 40 180 L 56 136 L 92 168 Z" fill={C.nightWall} opacity={0.8} />
        </g>
        <g transform="translate(90 10) rotate(2)">
          <rect x={-140} y={-200} width={280} height={400} fill={C.posterOld} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -80 60 L 0 -90 L 80 60 Z" fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
          <line x1={-100} y1={110} x2={100} y2={110} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          <line x1={-80} y1={148} x2={80} y2={148} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
          {/* めくれた角 (風ではたはた) */}
          <path d={`M -140 -200 L ${-96 - Math.sin(f / 5) * 8} ${-196 + Math.sin(f / 5) * 4} L -140 -148 Z`}
            fill="#B7A478" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="translate(300 -140) rotate(-2)">
          <rect x={-100} y={-120} width={200} height={240} fill={C.posterOld2} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-60} y1={-40} x2={60} y2={-40} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          <line x1={-70} y1={10} x2={70} y2={10} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
          <line x1={-54} y1={56} x2={54} y2={56} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        </g>
        {/* ===== 新しい貼り紙 1枚 (この絵の事件。隅に重なる) ===== */}
        <g transform={`translate(258 118) rotate(3)`} opacity={paste}>
          <g transform={`translate(0 ${(1 - paste) * -40})`}>
            <rect x={-104} y={-130} width={208} height={260}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            {/* 貼りたての角のそり */}
            <path d={`M 104 130 L ${74 - Math.sin(f / 6) * 5} ${124 - Math.sin(f / 6) * 4} L 104 96 Z`}
              fill="#E3DED2" stroke={KRP.ink} strokeWidth={4} />
            {/* 文面 (読めない墨線。文字は書かない) */}
            <line x1={-66} y1={-86} x2={66} y2={-86} stroke={KRP.ink} strokeWidth={7} />
            <line x1={-74} y1={-40} x2={74} y2={-40} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <line x1={-74} y1={-6} x2={74} y2={-6} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <line x1={-74} y1={28} x2={40} y2={28} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <circle cx={62} cy={78} r={20} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.8} />
            {/* 画びょう */}
            <circle cx={-84} cy={-112} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={84} cy={-112} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        </g>
      </g>
      {/* 街灯 (右手前。光の円すい) */}
      <g transform="translate(1310 0)">
        <path d={`M -14 160 L 14 160 L 190 1020 L -218 1020 Z`} fill={C.lampWarm}
          opacity={0.13 + Math.sin(f / 13) * 0.02} />
        <rect x={-13} y={150} width={26} height={870} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -52 150 L 52 150 L 30 104 L -30 104 Z" fill={C.nightWall2} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={140} r={17 + Math.sin(f / 9) * 2} fill={C.lampWarm} opacity={0.95} />
        <circle cx={0} cy={140} r={44} fill={C.lampWarm} opacity={0.3} />
      </g>
      {/* 地面 (石畳) */}
      <rect x={-20} y={800} width={W + 40} height={H - 780} fill="#3E3B50" />
      <line x1={-20} y1={800} x2={W + 20} y2={800} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.4} fill="none">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${i * 180 - 60} ${840 + rnd(91, i) * 26} q 50 ${14 - rnd(92, i) * 24} 120 0`} />
        ))}
        <line x1={-20} y1={930} x2={W + 20} y2={930} opacity={0.5} />
      </g>
      {/* 木箱の上の猫 (しっぽだけゆれる) */}
      <g transform="translate(210 866)">
        <rect x={-80} y={0} width={160} height={110} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={-80} y1={36} x2={80} y2={36} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        <line x1={-52} y1={0} x2={-52} y2={110} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        <g fill="#6E6052" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
          <path d="M -40 0 Q -46 -44 -12 -50 L 26 -50 Q 52 -44 48 0 Z" />
          <circle cx={42} cy={-62} r={22} fill="#6E6052" />
          <path d="M 30 -78 L 26 -96 L 42 -84 Z M 54 -78 L 58 -96 L 44 -84 Z" fill="#6E6052" />
          <path d={`M -40 -10 Q ${-78 - Math.sin(f / 8) * 10} ${-30 + Math.sin(f / 6) * 8} -62 -78`}
            fill="none" strokeWidth={9} strokeLinecap="round" />
        </g>
        <circle cx={36} cy={-64} r={2.4} fill={C.lampWarm} />
        <circle cx={50} cy={-64} r={2.4} fill={C.lampWarm} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #178 1984年、東京の名画座が、入れ替え制をいち早く取り入れます。
// 格: 並 / seed 1306
// 絵: 名画座の入口。「入替制」の貼り紙。常連客が「ん?」と二度見して眼鏡を上げる
// どこ: 朝の名画座の入口。もぎり口と上映案内の枠が並ぶ正面
// 演出: ガラス戸に真新しい「入替制」の貼り紙。常連客が「ん?」と二度見して眼鏡に手をやる。年号札1984
// 動き: 貼り紙がポンと出る・客の視線が行ったり来たり・？がぴょこんと出る・のれんがゆれる
const Sg178: React.FC<{ f: number }> = ({ f }) => {
  const notice = pop(seg(f, 6, 16));
  // 二度見: 視線が 貼り紙→前→貼り紙 と往復する
  const look = f < 18 ? 0.7 : f < 26 ? -0.4 : 0.7;
  return (
    <Frame f={f} seed={1306}>
      {/* 朝の空気 (淡い空と電線) */}
      <rect x={-20} y={-20} width={W + 40} height={300} fill={C.sky} opacity={0.75} />
      <path d={`M -20 110 Q 480 ${150 + Math.sin(f / 15) * 4} 960 120 Q 1440 ${96 + Math.sin(f / 15 + 2) * 4} 1940 130`}
        fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      <path d="M -20 150 Q 480 184 960 156" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      {/* 名画座の正面の壁 */}
      <rect x={60} y={190} width={1800} height={630} fill={C.meigaWall} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[330, 450, 570, 690].map((y) => <line key={y} x1={70} y1={y} x2={1850} y2={y} />)}
      </g>
      {/* 「名画座」の看板 */}
      <rect x={700} y={120} width={520} height={120} rx={12} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
      <rect x={714} y={134} width={492} height={92} rx={8} fill="none" stroke={C.lampWarm} strokeWidth={3} opacity={0.8} />
      <text x={960} y={208} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={64} fill={C.lampWarm} letterSpacing={14}>名画座</text>
      {/* 看板の電球 (順にまたたく) */}
      {[740, 820, 1100, 1180].map((x, i) => (
        <circle key={x} cx={x} cy={120} r={8}
          fill={C.lampWarm} stroke={KRP.ink} strokeWidth={3}
          opacity={0.45 + 0.5 * Math.abs(Math.sin(f / 7 + i * 1.6))} />
      ))}
      {/* 上映案内の枠 (左) */}
      <g transform="translate(330 500)">
        <rect x={-180} y={-200} width={360} height={400} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-150} y={-170} width={140} height={180} fill={C.posterOld} stroke={KRP.ink} strokeWidth={4} />
        <rect x={10} y={-170} width={140} height={180} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-80} cy={-100} r={34} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <path d="M 40 -40 L 80 -120 L 120 -40 Z" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={-140} y1={60} x2={140} y2={60} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        <line x1={-120} y1={110} x2={120} y2={110} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        <line x1={-140} y1={158} x2={100} y2={158} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      </g>
      {/* もぎり口 (右。小窓と庇) */}
      <g transform="translate(1600 520)">
        <path d={`M -150 -236 L 150 -236 L 170 -190 L -170 -190 Z`} fill={C.scBand} stroke={KRP.ink} strokeWidth={6}
          transform={`rotate(${Math.sin(f / 10) * 0.8} 0 -236)`} />
        <rect x={-130} y={-190} width={260} height={330} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-88} y={-150} width={176} height={150} fill="#4A4036" stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={4}>
          <line x1={-88} y1={-100} x2={88} y2={-100} />
          <line x1={-88} y1={-50} x2={88} y2={-50} />
          <line x1={-30} y1={-150} x2={-30} y2={0} />
          <line x1={30} y1={-150} x2={30} y2={0} />
        </g>
        <path d="M -60 0 A 60 24 0 0 0 60 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* ガラス戸 (中央) と貼り紙 */}
      <g transform="translate(960 560)">
        <rect x={-180} y={-260} width={360} height={520} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
        <line x1={0} y1={-260} x2={0} y2={260} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -140 -80 L -60 -180 M 60 20 L 150 -80" stroke={KRP.white} strokeWidth={9} opacity={0.65} />
        <rect x={-30} y={-20} width={18} height={70} rx={8} fill={KRP.ink} />
        <rect x={12} y={-20} width={18} height={70} rx={8} fill={KRP.ink} />
        {/* ===== 真新しい貼り紙「入替制」 ===== */}
        <g transform={`translate(96 -96) rotate(-2) scale(${notice})`}>
          <rect x={-74} y={-96} width={148} height={192} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>入替制</text>
          <line x1={-48} y1={8} x2={48} y2={8} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
          <line x1={-48} y1={38} x2={48} y2={38} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
          <line x1={-48} y1={68} x2={20} y2={68} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
          <rect x={-18} y={-104} width={36} height={16} fill={C.posterOld} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        </g>
      </g>
      {/* 歩道 */}
      <rect x={-20} y={820} width={W + 40} height={H - 800} fill={C.tileA} />
      <line x1={-20} y1={820} x2={W + 20} y2={820} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 400 - 100} y1={1080} x2={i * 360 + 20} y2={820} />)}
      </g>
      {/* 常連客 (眼鏡。二度見) */}
      <g transform="translate(700 0)">
        <ellipse cx={0} cy={1014} rx={130} ry={18} fill={KRP.ink} opacity={0.15} />
        <g transform={`rotate(${look > 0 ? 3 : -2} 0 1010)`}>
          <Person x={0} y={1010} s={1.42} cloth="#6E5A48" clothDark="#54433A"
            glasses face="surprised" gaze={[look * 6, -1]} f={f} pose="hold" />
        </g>
        {/* ？ (二度見のたびにぴょこん) */}
        <QMark x={150} y={560} s={0.8} f={f} t={seg(f, 18, 26)} />
      </g>
      {/* 年号札 1984 */}
      <TagPlate x={260} y={150} text="1984" size={44} t={seg(f, 2, 12)} rot={-3} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #179 さて、ここで問題です。
// 格: 図 / seed 1307
// 絵: `QuizCard` Q3
// どこ: 寄席ふうの出題の舞台。緞帳とスポットライトの中央にクイズの看板
// 演出: 木のイーゼルに大きな紙。SaigoShared の QuizQ (#6/#56 と同じ絵柄) がドン
// 動き: スポットライトが左右からゆっくり交差・QuizQ が脈打つ・？が順に飛び出す
const Sg179: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1307}>
    {/* 舞台の奥の壁 */}
    <rect x={-20} y={-20} width={W + 40} height={840} fill="#55484A" />
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
      {[180, 330, 480, 630].map((y) => <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} />)}
    </g>
    {/* スポットライト 2本 (ゆっくり交差) */}
    <path d={`M -40 -20 L 140 -20 L ${880 + Math.sin(f / 14) * 60} 860 L ${480 + Math.sin(f / 14) * 60} 860 Z`}
      fill={C.lampWarm} opacity={0.2} />
    <path d={`M 1780 -20 L 1960 -20 L ${1440 - Math.sin(f / 16) * 60} 860 L ${1040 - Math.sin(f / 16) * 60} 860 Z`}
      fill={C.lampWarm} opacity={0.2} />
    {/* 上の緞帳 (ひだ) */}
    <g>
      <rect x={-20} y={-20} width={W + 40} height={120} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M ${i * 250 - 20} 100 Q ${i * 250 + 105} ${158 + Math.sin(f / 12 + i) * 4} ${i * 250 + 230} 100`}
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
      ))}
    </g>
    {/* 左右の緞帳 */}
    <path d="M -20 60 L 300 90 Q 250 400 300 770 L -20 800 Z" fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6} />
    <path d="M 160 100 Q 130 420 170 740 M 60 90 Q 30 420 60 760" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    <path d="M 1940 60 L 1620 90 Q 1670 400 1620 770 L 1940 800 Z" fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6} />
    <path d="M 1760 100 Q 1790 420 1750 740 M 1860 90 Q 1890 420 1860 760" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    {/* 緞帳の房 */}
    {[300, 1620].map((x, i) => (
      <g key={x} transform={`translate(${x} ${430 + Math.sin(f / 10 + i * 2) * 5})`}>
        <path d="M 0 -60 Q 0 0 0 20" stroke={KRP.yellow} strokeWidth={8} fill="none" />
        <path d="M -16 20 L 16 20 L 10 72 L -10 72 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    ))}
    {/* 舞台の床 */}
    <rect x={-20} y={800} width={W + 40} height={H - 780} fill={SGP.stage} />
    <line x1={-20} y1={800} x2={W + 20} y2={800} stroke={KRP.ink} strokeWidth={7} />
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={i * 340 - 160} y1={1080} x2={i * 300 + 60} y2={800} />)}
    </g>
    {/* 床に落ちる光だまり */}
    <ellipse cx={960} cy={870} rx={520} ry={70} fill={C.lampWarm} opacity={0.2} />
    {/* ===== イーゼルと出題の紙 ===== */}
    <g transform="translate(960 0)">
      {/* イーゼルの脚 */}
      <g stroke={KRP.ink} strokeWidth={9} strokeLinecap="round">
        <line x1={-250} y1={860} x2={-110} y2={240} />
        <line x1={250} y1={860} x2={110} y2={240} />
        <line x1={0} y1={840} x2={0} y2={560} />
      </g>
      <line x1={-196} y1={620} x2={196} y2={620} stroke={KRP.ink} strokeWidth={8} />
      {/* 大きな紙 */}
      <g transform={`rotate(${Math.sin(f / 13) * 0.6} 0 300)`}>
        <rect x={-330} y={220} width={660} height={430} rx={10}
          fill={SGP.paper} stroke={KRP.ink} strokeWidth={8} />
        <path d="M -330 260 L -290 220 M 330 610 L 288 650" stroke={KRP.ink} strokeWidth={4} opacity={0.4} fill="none" />
        {/* 紙の上の帯 (出題の赤帯。文字は書かない) */}
        <rect x={-250} y={258} width={500} height={34} fill={KRP.red} opacity={0.25} />
        {/* QuizQ (クイズ3回とも同じ絵柄) */}
        <QuizQ f={f} x={0} y={452} s={1.05} t={seg(f, 4, 14)} />
      </g>
      {/* ？が順に飛び出す */}
      <QMark x={-430} y={330} s={0.9} f={f} t={seg(f, 14, 22)} color={KRP.yellow} />
      <QMark x={430} y={300} s={1.05} f={f + 7} t={seg(f, 20, 28)} />
      <QMark x={360} y={620} s={0.7} f={f + 13} t={seg(f, 26, 34)} color={KRP.orange} />
    </g>
  </Frame>
);

// -------------------------------------------------------------------
// #180 #181 は修正3で監督が SaigoChizuScenes.tsx に描き直した (日本地図・神奈川県の地図)。
// SaigoIndex の saigoScene がそちらを先に引くので、ここには絵を置かない。
// (motif の並び S_B9_MOTIFS の "sg_180" "sg_181" はそのまま残す)

// -------------------------------------------------------------------
// #182 郊外のショッピングセンターの中に、複数のスクリーン。
// 格: 並 / seed 1310
// 絵: SC館内。エスカレーター、ポップコーンの売店、「SCREEN 1〜」の案内板が並ぶ
// どこ: SC館内の吹き抜け。左にエスカレーター 右にポップコーン売店 上にSCREEN案内板
// 演出: 買い物客がエスカレーターで2階のシネコンへ運ばれていく明るい午後
// 動き: エスカレーター段の流れ/客ミニが乗って上がる/案内板の揺れ/ポップコーンが跳ねる
const Sg182: React.FC<{ f: number }> = ({ f }) => {
  const stepFlow = (f * 3) % 56;
  return (
    <Frame f={f} seed={1310} bg={C.mallWall}>
      {/* 2階の回廊と手すり */}
      <rect x={-20} y={150} width={1960} height={28} fill="#D9CFB4" stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={178} width={1960} height={60} fill="#E2D8BE" stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <line key={`rl${i}`} x1={60 + i * 200} y1={96} x2={60 + i * 200} y2={150} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      ))}
      <line x1={-20} y1={94} x2={1940} y2={94} stroke={KRP.ink} strokeWidth={7} />
      {/* 2階の奥 シネコン入口の光 */}
      <rect x={1030} y={-20} width={420} height={112} fill={C.screenGlow} opacity={0.8 + Math.sin(f / 10) * 0.08} />
      <rect x={1030} y={-20} width={420} height={112} fill="none" stroke={KRP.ink} strokeWidth={5} />
      {/* 床タイル */}
      <rect x={-20} y={780} width={1960} height={320} fill={C.mallFloor} />
      <line x1={-20} y1={780} x2={1940} y2={780} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`ft${i}`} x1={i * 260 - 60} y1={1100} x2={i * 260 + 120} y2={780} stroke={KRP.ink} strokeWidth={3} opacity={0.15} />
      ))}
      {/* 観葉植物 */}
      {[[980, 870], [1880, 900]].map(([gx, gy], i) => (
        <g key={`pl${i}`} transform={`translate(${gx} ${gy})`}>
          <path d="M -40 0 L 40 0 L 30 70 L -30 70 Z" fill="#C06A4E" stroke={KRP.ink} strokeWidth={5} />
          {[-24, 0, 24].map((lx, j) => (
            <path
              key={j}
              d={`M 0 0 Q ${lx * 2 + Math.sin(f / 11 + j) * 5} -70 ${lx * 3} -120`}
              fill="none" stroke={KRP.green} strokeWidth={13} strokeLinecap="round"
            />
          ))}
        </g>
      ))}
      {/* エスカレーター (左 1階→2階) */}
      <g>
        <path d="M 120 840 L 700 300 L 700 238 L 820 238 L 820 330 L 240 870 L 120 870 Z" fill={C.escSteel} stroke={KRP.ink} strokeWidth={7} />
        {/* 段 (流れる) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const d = i * 56 + stepFlow;
          const t = d / 500;
          if (t > 1) return null;
          const sx = 760 - t * 570;
          const sy = 300 + t * 528;
          return <line key={`st${i}`} x1={sx - 44} y1={sy} x2={sx + 44} y2={sy} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />;
        })}
        {/* 手すりベルト */}
        <path d="M 110 806 L 692 264 L 836 264" fill="none" stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
        <path d="M 110 806 L 692 264" fill="none" stroke="#8B9AA4" strokeWidth={6} strokeDasharray="20 22" strokeDashoffset={f * 2} />
        {/* 乗っている客 (上へ運ばれる) */}
        {[0.22, 0.52, 0.8].map((p0, i) => {
          const t = 0.92 - ((p0 + f * 0.004) % 0.92); // 上り (2階のシネコンへ)
          const mx = 740 - t * 570;
          const my = 318 + t * 500;
          return (
            <PersonMini
              key={`em${i}`} x={mx} y={my} s={0.92}
              color={[KRP.red, "#7FA8C9", KRP.green][i]}
              f={f} phase={i + 2} face="smile" arms={i === 1 ? "up" : "down"}
            />
          );
        })}
      </g>
      {/* 吊り案内板 SCREEN 1〜3 (ゆれる) */}
      {[[970, "SCREEN 1"], [1300, "SCREEN 2"], [1630, "SCREEN 3"]].map(([bx, label], i) => {
        const sway = Math.sin(f / 9 + (i as number)) * 2.2;
        return (
          <g key={`sb${i}`} transform={`translate(${bx} 0) rotate(${sway} 0 240)`}>
            <line x1={-70} y1={238} x2={-70} y2={320} stroke={KRP.ink} strokeWidth={5} />
            <line x1={70} y1={238} x2={70} y2={320} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-128} y={320} width={256} height={74} rx={10} fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={370} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill="#FFF8E0">{label}</text>
            <path d="M 96 356 L 118 346 L 118 366 Z" fill={KRP.yellow} />
          </g>
        );
      })}
      {/* ポップコーン売店 (右) */}
      <g transform="translate(1480 470)">
        {/* 屋台 */}
        <rect x={-230} y={120} width={460} height={240} fill="#E8D7B2" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-230} y={120} width={460} height={54} fill={C.scBand} stroke={KRP.ink} strokeWidth={6} />
        {/* しましまのひさし */}
        <g>
          <path d="M -258 40 L 258 40 L 230 118 L -230 118 Z" fill="#FFFFFF" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={`aw${i}`} d={`M ${-258 + 103.2 * i + 51.6} 40 L ${-230 + 92 * i + 92} 118 L ${-230 + 92 * i + 46} 118 Z`} fill={C.scBand} opacity={0.85} />
          ))}
          <path d="M -258 40 L 258 40" stroke={KRP.ink} strokeWidth={6} />
        </g>
        <text x={0} y={162} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill="#FFF8E0">POPCORN</text>
        {/* ポップコーンマシン (中で跳ねる) */}
        <g transform="translate(-110 180)">
          <rect x={-60} y={0} width={120} height={120} fill="#FDF6E0" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-60} y={0} width={120} height={34} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => {
            const ph = ((f * (6 + rnd(1310, i) * 5) + rnd(1310, i + 9) * 80) % 80);
            return <circle key={`pc${i}`} cx={-40 + i * 20} cy={110 - ph} r={7} fill="#F7E9B8" stroke={KRP.ink} strokeWidth={3} opacity={ph > 72 ? 0 : 1} />;
          })}
        </g>
        {/* カップのポップコーン山 */}
        <g transform="translate(96 232)">
          <path d="M -44 10 L 44 10 L 32 96 L -32 96 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-22} y1={10} x2={-16} y2={96} stroke="#FFFFFF" strokeWidth={10} opacity={0.8} />
          {[[-28, -6], [0, -18], [28, -6], [-13, -14], [15, -12]].map(([cx2, cy2], i) => (
            <circle key={`cp${i}`} cx={cx2} cy={cy2 + Math.sin(f / 8 + i) * 2} r={13} fill="#F7E9B8" stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 売り子 */}
        <Person f={f} x={-320} y={590} s={0.86} pose="raise" face="smile" cloth={C.scBand} clothDark="#B0523A" />
      </g>
      {/* 歩く買い物客の親子 (床) */}
      <g transform={`translate(${340 + Math.sin(f / 16) * 6} 0)`}>
        <Person f={f} x={560} y={1020} s={0.98} pose="point" pointDir={1} face="smile" cloth="#7FA8C9" clothDark="#5F88A9" />
        <PersonMini x={680} y={1016} s={1.0} color={KRP.yellow} f={f} phase={5} face="smile" arms="up" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #183 きれいな座席、見やすい傾斜、そして、入れ替え制。
// 格: 並 / seed 1311
// 絵: 新式 (シネコン) の場内の断面図。ふかふか座席・急な傾斜・視線の点線。三拍子の札
// どこ: シネコンの客席を横から切った断面。左に大きなスクリーン、右上がりのスタジアム形式
// 演出: 構図と3つの札は前のまま (作者「今のニュアンスはとてもいい」)。精巧さを上げる:
//       断面のコンクリートのハッチ・段鼻の誘導灯・背もたれ/肘掛け/ドリンクホルダーのある座席・
//       Person の観客 (下半身は座席で隠す)・目からスクリーンへの視線の点線 (前の頭の上を通る)・
//       天井のスピーカー・壁の吸音パネル・映写室の光・非常口のピクトグラム。
//       左下の小窓に「上映後」: 客が出口へ向かい、清掃スタッフが入ってくる (入替制を札だけに頼らない)
// 動き: スクリーンの明滅 / 映写光のほこり / 視線点線が流れる / スピーカーの音の輪 /
//       客の首ふり / 小窓の中で客が出口へ歩き、清掃スタッフがほうきで掃く / 札の pop
// ★修正3: 作者「もっと精巧に、今のニュアンスはとてもいい」
const CINE = {
  wall: "#3E4757",
  wallDeep: "#323A48",
  panel: "#4B5A6C",
  panelHi: "#5D6E82",
  concrete: "#59606C",
  hatch: "#454B56",
  carpetTop: "#7F96AA",
  nose: "#F3D98A",
  speaker: "#2A2F38",
  cup: "#E8E4DA",
  exitGreen: "#3FA06A",
  insetBg: "#E9E4D6",
  staff: "#5A8F8A",
};

// ふかふか座席 (横から。左=スクリーン向き)。x は座面の中心、y は段の床
const PlushSeat: React.FC<{ x: number; y: number; part: "back" | "front"; f: number; i: number }> =
  ({ x, y, part, f, i }) => {
    if (part === "back") {
      return (
        <g transform={`translate(${x} ${y})`}>
          {/* 支柱 */}
          <rect x={-12} y={-40} width={26} height={40} fill={CINE.speaker} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-30} y={-6} width={62} height={8} rx={3} fill={CINE.speaker} />
          {/* 背もたれ (高い・ふっくら。人の後ろ=右側) */}
          <path d="M 34 -44 L 38 -178 Q 40 -204 62 -204 Q 84 -202 82 -176 L 76 -44 Z"
            fill={C.seatNew} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 48 -60 L 50 -172 Q 52 -188 64 -188" fill="none" stroke={C.seatNewDark} strokeWidth={5} strokeLinecap="round" />
          <path d="M 38 -118 Q 58 -112 80 -118" fill="none" stroke={C.seatNewDark} strokeWidth={3} strokeDasharray="6 6" />
        </g>
      );
    }
    const sip = Math.sin(f / 11 + i * 2) * 3;
    return (
      <g transform={`translate(${x} ${y})`}>
        {/* 座面 (ふっくら。脚を隠す)+肘かけ+ドリンクホルダー */}
        <path d="M -64 -40 Q -70 -68 -46 -72 L 62 -72 Q 80 -68 80 -48 L 80 -38 L -64 -38 Z"
          fill={C.seatNew} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -54 -62 Q 0 -68 66 -62" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.35} />
        <path d="M -58 -38 L 74 -38 L 66 -14 L -50 -14 Z" fill={C.seatNewDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-74} y={-96} width={150} height={16} rx={8} fill={C.seatNewDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-46} y={-82} width={14} height={12} fill={C.seatNewDark} stroke={KRP.ink} strokeWidth={3.5} />
        {/* ドリンクホルダーとカップ (顔より左・下。ストローも顔にかからない) */}
        <rect x={-100} y={-100} width={30} height={14} rx={4} fill={CINE.speaker} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M -98 -100 L -95 -134 L -75 -134 L -72 -100 Z" fill={CINE.cup} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M -98 -120 L -73 -120" stroke={KRP.red} strokeWidth={4} opacity={0.8} />
        <line x1={-84} y1={-134} x2={-90 + sip} y2={-152} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  };

// #183 の3枚の札は同じ高さにそろえる (からくり検査: 見くらべる札は同じ高さ)
const FUDA_Y_183 = 196;
const Sg183: React.FC<{ f: number }> = ({ f }) => {
  // 傾斜の段 (左が前列・低い / 右が後列・高い)。前の版と同じ位置
  const rows = [0, 1, 2, 3, 4].map((i) => ({
    x: 760 + i * 230,
    top: 760 - i * 86,
  }));
  const ps = 0.62; // 観客の大きさ
  const cloths: [string, string][] = [
    ["#7FA8C9", "#5F88A9"], ["#E0A050", "#B57E36"], ["#8FBF9F", "#6E9E7E"], ["#C98AA8", "#A26A86"], ["#B9A36E", "#94804E"],
  ];
  const faces = ["smile", "normal", "smile", "normal", "smile"] as const;
  const scrY = 380; // 視線が向かうスクリーンの高さ
  const glow = 0.9 + Math.sin(f / 7) * 0.06;
  // 小窓 (上映後) の中の時間
  const walk = (f * 1.1) % 140;
  return (
    <Frame f={f} seed={1311} dark bg="#39414E">
      {/* ===== 奥の壁 (吸音パネル) と天井 ===== */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={CINE.wall} />
      {Array.from({ length: 7 }, (_, c) => Array.from({ length: 4 }, (_, r) => {
        const px = 300 + c * 232, py = 120 + r * 150;
        return (
          <g key={`p${c}-${r}`}>
            <rect x={px} y={py} width={214} height={134} rx={14} fill={CINE.panel} stroke={KRP.ink} strokeWidth={3.5} opacity={0.9} />
            <rect x={px + 10} y={py + 10} width={194} height={114} rx={9} fill="none" stroke={CINE.panelHi} strokeWidth={2.5} strokeDasharray="7 7" opacity={0.7} />
          </g>
        );
      }))}
      {/* 天井と梁 */}
      <rect x={-20} y={-20} width={1960} height={82} fill={CINE.wallDeep} />
      <line x1={-20} y1={62} x2={1940} y2={62} stroke={KRP.ink} strokeWidth={6} />
      {[420, 1060, 1700].map((bx) => (
        <rect key={bx} x={bx - 16} y={-20} width={32} height={90} fill={CINE.speaker} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* ダウンライト (上映中なので落としてある) */}
      {[300, 740, 1380, 1560].map((lx, i) => (
        <g key={`dl${i}`}>
          <rect x={lx - 22} y={58} width={44} height={10} rx={4} fill={CINE.speaker} />
          <circle cx={lx} cy={70} r={7} fill={C.lampWarm} opacity={0.35 + Math.sin(f / 9 + i) * 0.08} />
        </g>
      ))}
      {/* ===== 映写室 (右上) と映写の光 ===== */}
      <rect x={1800} y={70} width={140} height={150} fill={CINE.wallDeep} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1806} y={124} width={30} height={30} rx={4} fill={C.lampWarm} opacity={0.9} stroke={KRP.ink} strokeWidth={3} />
      <path d="M 1806 132 L 1806 146 L 230 660 L 230 220 Z" fill={C.lampWarm} opacity={0.1 + Math.sin(f / 12) * 0.02} />
      <path d="M 1806 136 L 1806 142 L 230 520 L 230 340 Z" fill={C.lampWarm} opacity={0.08} />
      {Array.from({ length: 12 }, (_, i) => {
        const t = ((f * 1.1 + rnd(71, i) * 100) % 100) / 100;
        const x = lerp(1800, 260, t);
        const y = lerp(139, 140 + rnd(72, i) * 440, t);
        return <circle key={`dm${i}`} cx={x} cy={y} r={2 + rnd(73, i) * 1.6} fill={C.lampWarm} opacity={0.35 + rnd(74, i) * 0.3} />;
      })}
      {/* ===== スクリーン (左。少し斜めから見た大画面) ===== */}
      <polygon points="36,84 232,128 232,744 36,808" fill={C.ink} />
      <polygon points="52,104 222,140 222,730 52,786" fill={C.screenGlow} opacity={glow} />
      {/* 画面の絵 (空と海と山の稜線。斜めに縮む) */}
      <polygon points="52,520 222,500 222,730 52,786" fill="#9FC3D6" opacity={0.7} />
      <path d="M 52 520 L 100 470 L 140 500 L 190 446 L 222 470 L 222 500 L 52 520 Z" fill="#7E9A84" opacity={0.8} />
      <circle cx={170} cy={300} r={26} fill={KRP.yellow} opacity={0.75} />
      {/* シネスコの黒帯 (映画の画面だと分かる) */}
      <polygon points="52,104 222,140 222,236 52,214" fill={C.ink} opacity={0.92} />
      <polygon points="52,690 222,650 222,730 52,786" fill={C.ink} opacity={0.92} />
      {/* 画面のちらつく光 */}
      <polygon points="52,214 222,236 222,650 52,690" fill={KRP.white} opacity={0.12 + Math.sin(f / 5) * 0.06} />
      <polygon points="52,104 222,140 222,730 52,786" fill="none" stroke={KRP.ink} strokeWidth={6} />
      {/* スクリーン前の床にこぼれる光 */}
      <polygon points="222,650 222,836 520,836" fill={C.screenGlow} opacity={0.06} />
      {/* 画面のふちのマスキングとスピーカー (画面の裏) */}
      <rect x={20} y={70} width={226} height={20} fill={CINE.speaker} transform="rotate(12 20 70)" opacity={0.9} />
      {/* ===== 天井のスピーカーと音の輪 ===== */}
      {[700, 1280].map((sx, k) => (
        <g key={`sp${k}`} transform={`translate(${sx} 62)`}>
          <line x1={-30} y1={0} x2={-30} y2={22} stroke={KRP.ink} strokeWidth={4} />
          <line x1={30} y1={0} x2={30} y2={22} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-54} y={22} width={108} height={70} rx={8} fill={CINE.speaker} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-22} cy={57} r={20} fill="#3C424C" stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={-22} cy={57} r={7} fill={KRP.grayDark} />
          <circle cx={24} cy={50} r={11} fill="#3C424C" stroke={KRP.ink} strokeWidth={3} />
          {[0, 1].map((w) => {
            const t = ((f * 0.9 + w * 20 + k * 9) % 40) / 40;
            return (
              <path key={w} d={`M ${-60 - t * 40} ${70 + t * 30} Q ${-22} ${110 + t * 70} ${16 + t * 40} ${110 + t * 50}`}
                fill="none" stroke={C.lampWarm} strokeWidth={4} opacity={(1 - t) * 0.45} strokeLinecap="round" />
            );
          })}
        </g>
      ))}
      {/* ===== 非常口 (右上のドアとピクトグラム) ===== */}
      <g transform="translate(1800 300)">
        <rect x={-6} y={0} width={110} height={118} fill={CINE.wallDeep} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-10} y={-62} width={92} height={46} rx={5} fill={CINE.exitGreen} stroke={KRP.ink} strokeWidth={4} opacity={0.85 + Math.sin(f / 8) * 0.12} />
        {/* 走る人のピクトグラム (白) とドア */}
        <rect x={52} y={-56} width={22} height={34} fill={KRP.white} />
        <g fill={KRP.white} stroke={KRP.white} strokeLinecap="round">
          <circle cx={26} cy={-50} r={5} stroke="none" />
          <line x1={24} y1={-44} x2={20} y2={-30} strokeWidth={5} />
          <line x1={20} y1={-30} x2={12} y2={-22} strokeWidth={4} />
          <line x1={20} y1={-30} x2={30} y2={-22} strokeWidth={4} />
          <line x1={23} y1={-40} x2={12} y2={-38} strokeWidth={4} />
          <line x1={23} y1={-40} x2={34} y2={-44} strokeWidth={4} />
        </g>
      </g>

      {/* ===== 床 (スタジアム形式の傾斜。断面) ===== */}
      <path
        d="M 140 836 L 740 836 L 760 760 L 990 760 L 1010 674 L 1220 674 L 1240 588 L 1450 588 L 1470 502 L 1680 502 L 1700 416 L 1940 416 L 1940 1100 L 140 1100 Z"
        fill={CINE.concrete} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round"
      />
      {/* 断面のハッチ (コンクリートを切った印) */}
      <defs>
        <clipPath id="c183floor">
          <path d="M 140 852 L 740 852 L 760 776 L 990 776 L 1010 690 L 1220 690 L 1240 604 L 1450 604 L 1470 518 L 1680 518 L 1700 432 L 1940 432 L 1940 1100 L 140 1100 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#c183floor)" stroke={CINE.hatch} strokeWidth={4}>
        {Array.from({ length: 70 }, (_, i) => (
          <line key={i} x1={140 + i * 34} y1={1100} x2={140 + i * 34 + 700} y2={400} />
        ))}
      </g>
      {/* 段の上のカーペット (床の表面) */}
      <path d="M 140 836 L 740 836 L 760 760 L 990 760 L 1010 674 L 1220 674 L 1240 588 L 1450 588 L 1470 502 L 1680 502 L 1700 416 L 1940 416"
        fill="none" stroke={CINE.carpetTop} strokeWidth={14} strokeLinejoin="round" />
      <path d="M 140 836 L 740 836 L 760 760 L 990 760 L 1010 674 L 1220 674 L 1240 588 L 1450 588 L 1470 502 L 1680 502 L 1700 416 L 1940 416"
        fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" opacity={0.7} />
      {/* 段鼻の誘導灯 (足元を照らす) */}
      {rows.map((r, i) => (
        <g key={`nl${i}`}>
          <ellipse cx={r.x - 4} cy={r.top + 10} rx={20} ry={8} fill={CINE.nose} opacity={0.25 + Math.sin(f / 6 + i * 2) * 0.08} />
          <rect x={r.x - 12} y={r.top + 4} width={14} height={8} rx={3} fill={CINE.nose} opacity={0.85} />
        </g>
      ))}

      {/* ===== 座席と観客 (後ろの列から描く) ===== */}
      {rows.slice().reverse().map((r) => {
        const i = rows.indexOf(r);
        const px = r.x + 40;
        const look = Math.sin(f / 15 + i * 1.7) * 1.5;
        const [cl, cd] = cloths[i];
        return (
          <g key={`row${i}`}>
            <PlushSeat x={px} y={r.top} part="back" f={f} i={i} />
            {i !== 1 ? (
              <Person x={px} y={r.top - 10} s={ps} f={f} phase={i * 3 + 1} still
                cloth={cl} clothDark={cd} face={faces[i]} gaze={[-6 + look, -1]} />
            ) : null}
            <PlushSeat x={px} y={r.top} part="front" f={f} i={i} />
          </g>
        );
      })}

      {/* ===== 視線の点線 (目 → スクリーン。前の人の頭の上を通る) ===== */}
      {rows.map((r, i) => {
        if (i === 1) return null;
        const ex = r.x + 40 - ps * 72; // 顔の左の外から出す (顔の上に線を引かない)
        const ey = r.top - 10 - ps * 222;
        return (
          <line key={`sl${i}`} x1={ex} y1={ey} x2={232} y2={scrY + 70 - i * 30}
            stroke={KRP.yellow} strokeWidth={5} strokeDasharray="4 16"
            strokeDashoffset={-f * 1.8} opacity={0.8} strokeLinecap="round" />
        );
      })}

      {/* ===== 左下の小窓「上映後」: 客は出口へ・清掃スタッフが入る ===== */}
      <g>
        <rect x={262} y={622} width={350} height={198} rx={16} fill={CINE.insetBg} stroke={KRP.ink} strokeWidth={6} />
        <rect x={262} y={622} width={350} height={38} rx={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <text x={437} y={651} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>上映後</text>
        <defs>
          <clipPath id="c183inset"><rect x={266} y={660} width={342} height={156} rx={12} /></clipPath>
        </defs>
        <g clipPath="url(#c183inset)">
        {/* 明るくなった場内の床と出口の扉 */}
        <rect x={262} y={782} width={350} height={40} fill="#C9C1AE" />
        <rect x={276} y={690} width={58} height={94} fill="#8A9AA6" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={280} y={694} width={26} height={86} fill={KRP.white} opacity={0.6} />
        <rect x={278} y={670} width={54} height={15} rx={3} fill={CINE.exitGreen} stroke={KRP.ink} strokeWidth={3} />
        {/* 出口へ向かう客 (左へ。扉に吸いこまれる) */}
        {[0, 1, 2].map((k) => {
          const xx = 500 - ((walk + k * 46) % 138) * 1.25;
          return (
            <g key={k} opacity={Math.min(clamp01((xx - 300) / 36), clamp01((506 - xx) / 24))}>
              <PersonMini x={xx} y={800} s={0.4} f={f} phase={k * 2}
                color={["#7FA8C9", "#E0A050", "#C98AA8"][k]} face="dot" />
            </g>
          );
        })}
        <path d="M 420 700 L 360 700" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
        <path d="M 374 688 L 358 700 L 374 712" fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {/* 清掃スタッフ (右から入ってきて掃く) */}
        <g transform={`translate(${590 - easeOut(seg(f, 0, 40)) * 22} 4)`}>
          <PersonMini x={0} y={792} s={0.46} f={f} phase={9} color={CINE.staff} face="smile" />
          <g transform={`rotate(${Math.sin(f / 5) * 14} -18 724)`}>
            <line x1={-18} y1={724} x2={-48} y2={788} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
            <path d="M -62 786 L -36 786 L -40 800 L -60 800 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 三角巾 */}
          <path d="M -16 -76 L 16 -76 L 0 -88 Z" transform="translate(0 800) scale(1)" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* ゴミ (ポップコーン) */}
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={516 + k * 14} cy={806 - (k % 2) * 5} r={5} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2} />
        ))}
        </g>
      </g>

      {/* 三拍子の札 (上に順ぐりに)。位置は前の版のまま (入替制だけ視線の点線を避けて 16px 上げた) */}
      <TagPlate x={500} y={FUDA_Y_183} text="きれいな座席" size={44} t={seg(f, 4, 14)} rot={-2} />
      <TagPlate x={1000} y={FUDA_Y_183} text="見やすい傾斜" size={44} t={seg(f, 12, 22)} rot={1.5} />
      <TagPlate x={1500} y={FUDA_Y_183} text="入替制" size={44} t={seg(f, 20, 30)} rot={-1.5} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_172: (f) => <Sg172 f={f} />,
  sg_173: (f) => <Sg173 f={f} />,
  sg_174: (f) => <Sg174 f={f} />,
  sg_175: (f) => <Sg175 f={f} />,
  sg_176: (f) => <Sg176 f={f} />,
  sg_177: (f) => <Sg177 f={f} />,
  sg_178: (f) => <Sg178 f={f} />,
  sg_179: (f) => <Sg179 f={f} />,
  sg_182: (f) => <Sg182 f={f} />,
  sg_183: (f) => <Sg183 f={f} />,
};

export const S_B9_MOTIFS: string[] = [
  "sg_172", // #172
  "sg_173", // #173
  "sg_174", // #174
  "sg_175", // #175
  "sg_176", // #176
  "sg_177", // #177
  "sg_178", // #178
  "sg_179", // #179
  "sg_180", // #180
  "sg_181", // #181
  "sg_182", // #182
  "sg_183", // #183
];

export const saigoB9Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
