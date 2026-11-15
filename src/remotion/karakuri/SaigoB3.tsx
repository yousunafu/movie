// 「人類は、昔から飛ばして観ていた」: 文#65〜#76 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1100〜1111。
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
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, MaruBatsu,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#273043",      // 夜空
  nightDeep: "#1A2130",
  stone: "#C9BBA2",      // 石造りの外壁
  stoneDark: "#A5937B",
  glow: "#F6DFA0",       // ガス灯の光だまり
  flame: "#F2B64C",      // 炎
  hallWall: "#E7D4AC",   // 客席の金色がかった壁
  hallDeep: "#C9AF82",
  seat: "#9E3B3B",       // 客席の赤
  seatDark: "#7A2C2C",
  wood2: "#A9793F",      // 家具の木
  wood2Deep: "#7E5A2E",
  coat: "#3A3F52",       // 紳士の上着
  coatDark: "#2B2F3E",
  dress: "#7C5A8C",      // 婦人のドレス
  dressDark: "#5E4370",
  dress2: "#4E6E58",
  dress2Dark: "#3A5443",
  work: "#8A7350",       // 職人の上着
  workDark: "#6B5940",
  page: "#F6EFDC",       // 紙・ページ
  pageShade: "#E4D8BC",
  morris: "#45604F",     // 広告柱の緑
  bookBlue: "#30506B",   // 研究書の背
  bookLaw: "#5F4632",    // 法律書の革
  faketx: "#9A8C78",     // 活字のダミー行
  archive: "#564A3C",    // 古文書庫の壁
  archiveDark: "#453B2F",
  brassy: "#C9A24B",     // 鏡の金縁・カーテン
};
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけのローカル部品
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目の擬似乱数 (毎フレーム同じ値。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// 帽子を Person の頭に正しく乗せるための土台。
// Person は `translate(x, y+体ゆれ) scale(s) rotate(傾き)` の順で描かれ、回転の軸は足元。
// 帽子だけ別の座標で置くと、体が傾いたときに頭から外れる。
// そこで Person とまったく同じ変換をかけ、中身は「頭の丸 (中心 0,-228 / 半径 64)」を
// 基準にした人物ローカル座標で描く。f・phase・still も Person と同じ値を渡すこと。
const AtamaNo: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; children?: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>
  );
};

type BoshiProps = {
  x: number; y: number; s?: number; color?: string;
  lean?: number; f?: number; phase?: number; still?: boolean;
};

// シルクハット (Person の頭にかぶせる。y は Person の足元y・s は Person と同じ)
const TopHat: React.FC<BoshiProps> =
  ({ x, y, s = 1, color = "#2F2A24", lean = 0, f = 0, phase = 0, still = false }) => (
    <AtamaNo x={x} y={y} s={s} lean={lean} f={f} phase={phase} still={still}>
      <g transform="translate(0 -268)">
        <ellipse cx={0} cy={0} rx={80} ry={15} fill={color} stroke={C.ink} strokeWidth={5} />
        <rect x={-48} y={-80} width={96} height={82} rx={8} fill={color} stroke={C.ink} strokeWidth={5} />
        <rect x={-48} y={-24} width={96} height={14} fill="#4A443C" stroke={C.ink} strokeWidth={4} />
      </g>
    </AtamaNo>
  );

// ボンネット帽 (婦人用)。
// 頭の丸 (中心 0,-228 / 半径 64) にかぶさるように、
//   ① 顔を囲む庇 (ひろがった三日月)
//   ② 頭のてっぺんに乗る冠 (下端は額の丸みに沿って少し上がる)
//   ③ あご下で結ぶ紐と結び目
// の3枚で組む。下端が頭の線より内側に入るので、どの傾きでも頭から浮かない。
const Bonnet: React.FC<BoshiProps> =
  ({ x, y, s = 1, color = "#B06A5A", lean = 0, f = 0, phase = 0, still = false }) => {
    const hikari = "#D9A08C";   // 庇の明るい面
    const himo = "#8C4F42";     // 紐
    return (
      <AtamaNo x={x} y={y} s={s} lean={lean} f={f} phase={phase} still={still}>
        {/* ① 庇 (顔のまわりに張り出す) */}
        <path d="M -84 -196 Q -100 -304 0 -312 Q 100 -304 84 -196 L 58 -202 Q 0 -252 -58 -202 Z"
          fill={hikari} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 庇の内側の筋 (布の張り) */}
        <path d="M -70 -214 Q -82 -290 0 -296 Q 82 -290 70 -214"
          fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
        {/* ② 冠 (頭に乗る本体) */}
        <path d="M -63 -214 Q -82 -296 0 -300 Q 82 -296 63 -214 Q 32 -234 0 -234 Q -32 -234 -63 -214 Z"
          fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -52 -256 Q 0 -276 52 -256" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.45} />
        {/* ③ あご紐 */}
        <path d="M -60 -206 Q -52 -178 -16 -170" fill="none" stroke={himo}
          strokeWidth={9} strokeLinecap="round" />
        <path d="M 60 -206 Q 52 -178 16 -170" fill="none" stroke={himo}
          strokeWidth={9} strokeLinecap="round" />
        <path d="M -24 -176 Q 0 -162 24 -176 Q 0 -158 -24 -176 Z"
          fill={himo} stroke={C.ink} strokeWidth={3.5} />
        {/* 横の飾り花 */}
        <circle cx={-66} cy={-224} r={13} fill={color} stroke={C.ink} strokeWidth={4} />
        <circle cx={-66} cy={-224} r={5} fill={hikari} />
      </AtamaNo>
    );
  };

// おしゃべりの音符 (ふわふわ浮く)
const Onpu: React.FC<{ x: number; y: number; f: number; i: number; o?: number; s?: number }> =
  ({ x, y, f, i, o = 1, s = 1 }) => (
    <g transform={`translate(${x} ${y + Math.sin(f / 8 + i * 1.3) * 7}) scale(${s}) rotate(${Math.sin(f / 11 + i) * 6})`}
      opacity={o}>
      <ellipse cx={0} cy={0} rx={13} ry={10} fill={C.ink} transform="rotate(-18)" />
      <path d="M 11 -3 L 11 -44 Q 24 -41 30 -31" fill="none" stroke={C.ink}
        strokeWidth={6} strokeLinecap="round" />
    </g>
  );

// 壁掛けのガス灯 (炎がゆれる)
const GasuTou: React.FC<{ x: number; y: number; f: number; i?: number; s?: number }> =
  ({ x, y, f, i = 0, s = 1 }) => {
    const fl = Math.sin(f / 5 + i * 1.9) * 2.5;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle cx={0} cy={-26} r={66} fill={C.glow} opacity={0.22} />
        <circle cx={0} cy={-26} r={38} fill={C.glow} opacity={0.3} />
        <path d="M 0 36 L 0 12 M -28 36 L 28 36" stroke={C.ink} strokeWidth={6} fill="none"
          strokeLinecap="round" />
        <path d="M -20 12 L 20 12 L 14 -58 L -14 -58 Z" fill="#B9C4C9" opacity={0.6}
          stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-19} y={-70} width={38} height={12} fill={C.stoneDark} stroke={C.ink} strokeWidth={4} />
        <circle cx={0} cy={-76} r={5} fill={C.ink} />
        <path d={`M 0 ${-4 + fl} C -8 ${-13 + fl} -6 -26 0 -32 C 6 -26 8 ${-13 + fl} 0 ${-4 + fl} Z`}
          fill={C.flame} stroke={C.ink} strokeWidth={3} />
      </g>
    );
  };

// パリの演奏会の客席 (#66 → #67 → #70 の連番。絵は複製せず phase で切り替える)
//   phase 0 = おしゃべり全盛 (音符たくさん) / 1 = 音符が順に消えていく / 2 = 完全な静寂
const ParisKyakuseki: React.FC<{ f: number; phase: 0 | 1 | 2 }> = ({ f, phase }) => {
  const minisMid = [215, 400, 585, 775, 960, 1145, 1335, 1520, 1705];
  const minisBack = Array.from({ length: 11 }, (_, k) => 170 + k * 158);
  const miniCols = [C.dress2, C.work, C.coat, "#6E4A56", C.dress, "#595E70"];
  // 音符8個。phase1 では i<6 が順にふっと消える (2個は最後まで残る)
  const notes = [
    { x: 390, y: 520 }, { x: 640, y: 462 }, { x: 900, y: 535 }, { x: 1165, y: 470 },
    { x: 1430, y: 540 }, { x: 1645, y: 620 }, { x: 760, y: 672 }, { x: 1210, y: 682 },
  ];
  const noteO = (i: number) =>
    phase === 0 ? 1 :
      phase === 2 ? 0 :
        i < 6 ? 1 - seg(f, 4 + i * 5, 11 + i * 5) : 1;
  const noteRise = (i: number) => (phase === 1 && i < 6 ? seg(f, 4 + i * 5, 11 + i * 5) * 34 : 0);
  // 前列5人の傾き (おしゃべりは向き合って傾く)
  const leanOf = (i: number, base: number) =>
    phase === 0 ? base :
      phase === 2 ? 0 :
        i < 2 ? base * (1 - seg(f, 12, 32)) : base * 0.15;
  const still = phase === 2;
  const fanSwing = phase === 0 ? Math.sin(f / 7) * 16 : phase === 1 ? Math.sin(f / 9) * 5 : 0;
  return (
    <g>
      {/* 壁 (金色がかった漆喰 + 付け柱) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.hallWall} />
      {[160, 560, 960, 1360, 1760].map((px) => (
        <g key={px}>
          <rect x={px - 20} y={330} width={40} height={300} fill={C.hallDeep}
            stroke={C.ink} strokeWidth={4} opacity={0.75} />
          <rect x={px - 30} y={318} width={60} height={16} fill={C.hallDeep}
            stroke={C.ink} strokeWidth={4} opacity={0.75} />
        </g>
      ))}
      <rect x={-20} y={556} width={W + 40} height={34} fill={C.hallDeep} opacity={0.55} />
      {/* バルコニー席 (奥) */}
      <rect x={-20} y={-20} width={W + 40} height={260} fill={C.nightDeep} opacity={0.28} />
      {[260, 560, 860, 1160, 1460, 1700].map((bx, k) => (
        <PersonMini key={bx} x={bx} y={236} s={0.46} color="#6E5F4C" face="none"
          f={still ? 0 : f} phase={k} />
      ))}
      <rect x={-20} y={236} width={W + 40} height={58} fill={C.hallDeep} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 24 }, (_, k) => (
        <g key={k}>
          <path d={`M ${50 + k * 80} 294 q -10 18 0 36 q 10 -18 0 -36`} fill={C.hallWall}
            stroke={C.ink} strokeWidth={3.5} />
        </g>
      ))}
      <rect x={-20} y={294} width={W + 40} height={40} fill={C.hallDeep} stroke={C.ink} strokeWidth={6} />
      {/* シャンデリア (ろうそくの炎がゆれる) */}
      <g>
        <line x1={960} y1={-20} x2={960} y2={74} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={150} rx={150} ry={30} fill={C.brassy} stroke={C.ink} strokeWidth={6} />
        {[-120, -60, 0, 60, 120].map((dx, k) => (
          <g key={dx} transform={`translate(${960 + dx} ${132 - Math.abs(dx) * 0.06})`}>
            <rect x={-6} y={-24} width={12} height={26} fill={C.page} stroke={C.ink} strokeWidth={3} />
            <path d={`M 0 ${-32 + Math.sin(f / 5 + k) * 2.5} C -6 ${-39 + Math.sin(f / 5 + k) * 2} -5 -48 0 -52 C 5 -48 6 ${-39 + Math.sin(f / 5 + k) * 2} 0 ${-32 + Math.sin(f / 5 + k) * 2.5} Z`}
              fill={C.flame} stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
        {[-130, -75, -15, 45, 105].map((dx) => (
          <path key={dx} d={`M ${960 + dx} 176 q 6 22 14 30`} fill="none"
            stroke={C.brassy} strokeWidth={3.5} opacity={0.8} />
        ))}
        <circle cx={960} cy={150} r={44} fill={C.glow} opacity={0.3} />
      </g>
      {/* 壁のガス灯 */}
      <GasuTou x={60} y={470} f={still ? 0 : f} i={1} s={0.85} />
      <GasuTou x={1860} y={470} f={still ? 0 : f} i={2} s={0.85} />
      {/* 最奥列 (小さい群衆) + ベンチ */}
      {minisBack.map((mx, k) => (
        <PersonMini key={mx} x={mx + (rnd(31, k) - 0.5) * 24} y={640} s={0.6}
          color={miniCols[k % 6]} f={still ? 0 : f} phase={k} face="dot" />
      ))}
      <rect x={30} y={588} width={1860} height={76} rx={12} fill={C.seat} stroke={C.ink} strokeWidth={6} />
      <line x1={50} y1={602} x2={1870} y2={602} stroke={C.brassy} strokeWidth={4} opacity={0.7} />
      {/* 中列 + ベンチ */}
      {minisMid.map((mx, k) => (
        <PersonMini key={mx} x={mx + (rnd(32, k) - 0.5) * 30} y={800} s={0.8}
          color={miniCols[(k + 3) % 6]} f={still ? 0 : f} phase={k + 4}
          face={phase === 0 && k % 3 === 0 ? "smile" : "dot"} />
      ))}
      <rect x={20} y={736} width={1880} height={88} rx={12} fill={C.seat} stroke={C.ink} strokeWidth={6.5} />
      <line x1={40} y1={752} x2={1880} y2={752} stroke={C.brassy} strokeWidth={4} opacity={0.7} />
      {[320, 620, 920, 1220, 1520].map((dx) => (
        <line key={dx} x1={dx} y1={744} x2={dx} y2={816} stroke={C.seatDark} strokeWidth={4} />
      ))}
      {/* 前列5人 (大きい人物。ハットや扇) */}
      <Person x={260} y={990} s={0.95} cloth={C.coat} clothDark={C.coatDark} f={f} phase={1}
        still={still} lean={leanOf(0, 8)} face={phase === 2 ? "normal" : "smile"}
        gaze={phase === 2 ? [0, 0.35] : [0.6, 0]} />
      <TopHat x={260} y={990} s={0.95} lean={leanOf(0, 8)} f={f} phase={1} still={still} />
      <Person x={610} y={990} s={0.95} cloth={C.dress} clothDark={C.dressDark} f={f} phase={2}
        still={still} lean={leanOf(1, -8)} face={phase === 0 ? "joy" : "normal"}
        gaze={phase === 2 ? [0, 0.35] : [-0.6, 0]} />
      <Bonnet x={610} y={990} s={0.95} lean={leanOf(1, -8)} f={f} phase={2} still={still} />
      <Person x={960} y={990} s={0.95} cloth={C.dress2} clothDark={C.dress2Dark} f={f} phase={3}
        still={still} lean={leanOf(2, 4)} face={phase === 2 ? "normal" : "smile"}
        gaze={phase === 2 ? [0, 0.35] : [0.5, 0]} pose={phase === 2 ? "stand" : "raise"} />
      <Bonnet x={960} y={990} s={0.95} color="#8C6A4E"
        lean={leanOf(2, 4)} f={f} phase={3} still={still} />
      {phase !== 2 && (
        <g transform={`translate(1023 762) rotate(${fanSwing})`}>
          {[-34, -17, 0, 17, 34].map((ang) => (
            <line key={ang} x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * 84}
              y2={-Math.cos((ang * Math.PI) / 180) * 84} stroke={C.ink} strokeWidth={4} />
          ))}
          <path d="M -52 -66 Q 0 -96 52 -66 L 34 -43 Q 0 -62 -34 -43 Z"
            fill={KRP.yellow} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
        </g>
      )}
      {phase === 2 && (
        <g transform="translate(1000 900) rotate(24)">
          <path d="M -8 -52 L 8 -52 L 5 46 L -5 46 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
      <Person x={1310} y={990} s={0.95} cloth="#5C4A6E" clothDark="#463854" f={f} phase={4}
        still={still} lean={leanOf(3, -6)} face={phase === 2 ? "normal" : "smile"}
        gaze={phase === 2 ? [0, 0.35] : [-0.5, 0]} />
      <TopHat x={1310} y={990} s={0.95} color="#42352A"
        lean={leanOf(3, -6)} f={f} phase={4} still={still} />
      <Person x={1660} y={990} s={0.95} cloth={C.work} clothDark={C.workDark} f={f} phase={5}
        still={still} lean={leanOf(4, 7)} face={phase === 0 ? "joy" : "normal"}
        gaze={phase === 2 ? [0, 0.35] : [0.6, 0]} />
      {/* 最前のベンチ (赤いビロード + 金の縁) */}
      <rect x={-20} y={880} width={1960} height={220} fill={C.seat} stroke={C.ink} strokeWidth={8} />
      <line x1={0} y1={904} x2={1920} y2={904} stroke={C.brassy} strokeWidth={6} opacity={0.8} />
      <line x1={0} y1={1056} x2={1920} y2={1056} stroke={C.seatDark} strokeWidth={6} />
      {[180, 480, 780, 1080, 1380, 1680].map((dx) => (
        <line key={dx} x1={dx} y1={892} x2={dx} y2={1070} stroke={C.seatDark} strokeWidth={5} />
      ))}
      {/* おしゃべりの音符 */}
      {notes.map((n, i) => {
        const o = noteO(i);
        if (o <= 0.01) return null;
        return <Onpu key={i} x={n.x} y={n.y - noteRise(i)} f={f} i={i} o={o}
          s={1.05 + rnd(33, i) * 0.3} />;
      })}
    </g>
  );
};

// 本のダミー活字行 (紙の上の「読めない文章」。本物の文は書かない)
const FakeLines: React.FC<{
  x: number; y: number; w: number; n: number; gap?: number; seed?: number;
  f?: number; stagger?: number; color?: string; h?: number;
}> = ({ x, y, w, n, gap = 34, seed = 1, f = 99, stagger = 0, color = C.faketx, h = 10 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const o = stagger > 0 ? seg(f, stagger + i * 2.5, stagger + 6 + i * 2.5) : 1;
      const lw = w * (i === n - 1 ? 0.45 + rnd(seed, i) * 0.3 : 0.82 + rnd(seed, i) * 0.18);
      return (
        <rect key={i} x={x} y={y + i * gap} width={lw} height={h} rx={h / 2}
          fill={color} opacity={0.8 * o} />
      );
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #65 第3章、静けさの、発明。
// 格: 山 / seed 1100
// 絵: 章扉。19世紀パリの演奏会場の入口。シルクハットの紳士が振り向き、唇に人差し指。ガス灯の夜
// どこ: 夜のパリ 演奏会場の正面入口 (石造り・ガス灯・広告柱)
// 演出: 振り向いたシルクハットの紳士が人差し指を立てる。扉から暖色の光がこぼれる
// 動き: 星の瞬き・ガス灯の炎・光だまりが広がる・章扉がふわっと出る・客が入っていく
const Sg065: React.FC<{ f: number }> = ({ f }) => {
  const doorT = seg(f, 10, 26);
  const spill = easeOut(seg(f, 0, 16));
  return (
    <Frame f={f} seed={1100} dark bg={C.night}
      over={<ChapterDoor num={3} title="静けさの発明" t={doorT} left={980} top={596} width={700} />}>
      {/* 星空 */}
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={rnd(11, i) * 1920} cy={rnd(12, i) * 240}
          r={1.6 + rnd(13, i) * 2.2} fill={C.glow}
          opacity={0.3 + 0.5 * Math.abs(Math.sin(f / 9 + i * 1.7))} />
      ))}
      {/* 演奏会場のファサード (石造り) */}
      <rect x={-20} y={252} width={1540} height={680} fill={C.stone} stroke={C.ink} strokeWidth={7} />
      <rect x={-20} y={238} width={1556} height={34} fill={C.stoneDark} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-20} y1={322 + i * 68} x2={1520} y2={322 + i * 68}
          stroke={C.ink} strokeWidth={2.5} opacity={0.18} />
      ))}
      {/* 上階のアーチ窓 (中の明かり) */}
      {[250, 530, 1210, 1440].map((wx, k) => (
        <g key={wx}>
          <path d={`M ${wx - 58} 540 L ${wx - 58} 395 Q ${wx} 330 ${wx + 58} 395 L ${wx + 58} 540 Z`}
            fill={C.glow} opacity={0.85} stroke={C.ink} strokeWidth={5.5} />
          <line x1={wx} y1={352} x2={wx} y2={540} stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
          <line x1={wx - 58} y1={452} x2={wx + 58} y2={452} stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
          <circle cx={wx} cy={448} r={46 + Math.sin(f / 6 + k) * 3} fill={C.glow} opacity={0.16} />
        </g>
      ))}
      {/* 正面玄関 (大アーチ + 開いた扉 + こぼれる光) */}
      <path d="M 700 932 L 700 520 Q 880 388 1060 520 L 1060 932 Z"
        fill={C.stoneDark} stroke={C.ink} strokeWidth={7} />
      <path d="M 728 932 L 728 538 Q 880 428 1032 538 L 1032 932 Z"
        fill={C.glow} stroke={C.ink} strokeWidth={5.5} />
      {/* 中のシャンデリアの影 */}
      <g opacity={0.5}>
        <line x1={880} y1={470} x2={880} y2={540} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={880} cy={560} rx={52} ry={13} fill="none" stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 開いた両開きの扉 */}
      <path d="M 728 932 L 668 898 L 668 560 L 728 538 Z" fill={C.wood2Deep} stroke={C.ink} strokeWidth={5.5} />
      <path d="M 1032 932 L 1092 898 L 1092 560 L 1032 538 Z" fill={C.wood2Deep} stroke={C.ink} strokeWidth={5.5} />
      {/* 入っていく客 (シルエット) */}
      <PersonMini x={830} y={918} s={0.72} color="#3B3630" f={f} phase={2} face="none" />
      <PersonMini x={928} y={912} s={0.66} color="#4A4034" f={f} phase={5} face="none" />
      {/* 石畳 */}
      <rect x={-20} y={910} width={1960} height={190} fill={C.nightDeep} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 30 }, (_, i) => (
        <ellipse key={i} cx={(i % 10) * 206 + (Math.floor(i / 10) % 2) * 100 - 40}
          cy={952 + Math.floor(i / 10) * 52} rx={66} ry={15}
          fill="none" stroke={C.stoneDark} strokeWidth={3} opacity={0.3} />
      ))}
      {/* 扉からこぼれる光だまり */}
      <polygon points="728,930 1032,930 1210,1080 560,1080" fill={C.glow} opacity={0.2 * spill} />
      {/* 街灯2本 */}
      {[170, 1600].map((lx, k) => (
        <g key={lx}>
          <rect x={lx - 9} y={560} width={18} height={352} fill={C.ink} />
          <ellipse cx={lx} cy={916} rx={42} ry={10} fill={C.ink} opacity={0.8} />
          <GasuTou x={lx} y={556} f={f} i={k + 3} s={1.05} />
        </g>
      ))}
      {/* 広告柱 (モリス柱) */}
      <g>
        <ellipse cx={1790} cy={912} rx={104} ry={22} fill={C.ink} opacity={0.5} />
        <rect x={1700} y={430} width={180} height={482} fill={C.morris} stroke={C.ink} strokeWidth={6.5} />
        <path d="M 1690 430 Q 1790 350 1890 430 Z" fill={C.morris} stroke={C.ink} strokeWidth={6.5} />
        <circle cx={1790} cy={372} r={12} fill={C.brassy} stroke={C.ink} strokeWidth={4} />
        <rect x={1716} y={470} width={148} height={190} fill={C.page} stroke={C.ink} strokeWidth={4} transform="rotate(-2 1790 565)" />
        <FakeLines x={1730} y={500} w={120} n={5} gap={26} seed={7} h={8} />
        <rect x={1722} y={690} width={136} height={160} fill={C.pageShade} stroke={C.ink} strokeWidth={4} transform="rotate(2 1790 770)" />
        <FakeLines x={1736} y={716} w={108} n={4} gap={26} seed={8} h={8} />
      </g>
      {/* 主役: 振り向いてシーッの紳士 */}
      <ellipse cx={400} cy={1056} rx={150} ry={26} fill={C.ink} opacity={0.35} />
      <Person x={400} y={1052} s={1.5} cloth={C.coat} clothDark={C.coatDark}
        f={f} phase={1} pose="raise" lean={3} face="normal" gaze={[0.7, 0.1]} />
      <TopHat x={400} y={1052} s={1.5} lean={3} f={f} phase={1} />
      {/* 立てた人差し指 (raise の手の先) */}
      <g transform="translate(501 707)">
        <circle cx={0} cy={0} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={-6} y={-52} width={12} height={46} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #66 ところが19世紀、パリで異変が起きます。
// 格: 並 / seed 1101
// 絵: パリの客席。おしゃべりの音符がまだ宙にたくさん漂っている
// どこ: パリの演奏会場の客席 (正面の引き)
// 演出: おしゃべり全盛。音符が宙にたくさん。扇があおがれ 客は向き合って笑う
// 動き: ゆっくり寄るカメラ・音符のふわふわ・扇の揺れ・シャンデリアとガス灯の炎
const Sg066: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 40)) * 0.05;
  return (
    <Frame f={f} seed={1101}>
      <g transform={zoomAt(z, 960, 600)}>
        <ParisKyakuseki f={f} phase={0} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #67 あれほど騒がしかった聴衆が、だんだん、静かになっていくのです。
// 格: 並 / seed 1102
// 絵: 同じ客席 (連番)。音符が一つ、また一つ、ふっと消えていく。残った客が居住まいを正す
// どこ: #66と同じ客席 (連番)。カメラは斜めに寄って前列へ
// 演出: 音符が一つまた一つ ふっと消える。前列の2人が居住まいを正していく
// 動き: 音符の消失 (順番に浮いて消える)・客の傾きが戻る・カメラの横パン
const Sg067: React.FC<{ f: number }> = ({ f }) => {
  const cx = lerp(700, 1050, easeOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={1102}>
      <g transform={zoomAt(1.18, cx, 760)}>
        <ParisKyakuseki f={f} phase={1} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #68 音楽史の研究者ジョンソンは、その時期を、1830年ごろから1850年までと見ています。
// 格: 図 / seed 1103
// 絵: 五線譜の上に敷いた年表。1830→1850で音符の数が減っていくグラフ。研究書の背表紙を隅に
// どこ: 研究者の机の上。五線譜の紙に描いたグラフ。隅に研究書とインク壺
// 演出: 1830→1850 で音符の柱が減っていく。下り坂の点線が「静まっていく」を示す
// 動き: 音符が順にポンと出る・点線が左から右へ伸びる・羽ペンが揺れる・札がポンと出る
const Sg068: React.FC<{ f: number }> = ({ f }) => {
  const cols = [
    { x: 420, n: 5, label: "1830" },
    { x: 640, n: 4 },
    { x: 860, n: 3, label: "1840" },
    { x: 1080, n: 2 },
    { x: 1300, n: 1, label: "1850" },
  ];
  const lineT = easeOut(seg(f, 18, 38));
  let idx = 0;
  return (
    <Frame f={f} seed={1103}>
      {/* 机の板目 */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={C.wood2} />
      {[150, 330, 510, 690, 870, 1050].map((wy) => (
        <path key={wy} d={`M -20 ${wy} Q 640 ${wy + 14} 1300 ${wy} T 1940 ${wy + 8}`}
          fill="none" stroke={C.wood2Deep} strokeWidth={4} opacity={0.5} />
      ))}
      {[380, 1480].map((kx, k) => (
        <ellipse key={kx} cx={kx} cy={k === 0 ? 90 : 1010} rx={26} ry={13}
          fill="none" stroke={C.wood2Deep} strokeWidth={4} opacity={0.6} />
      ))}
      {/* 五線譜の大きな紙 */}
      <g transform="rotate(-1.4 860 520)">
        <rect x={168} y={176} width={1400} height={716} rx={8} fill={C.page}
          stroke={C.ink} strokeWidth={7} />
        <rect x={180} y={188} width={1376} height={692} rx={6} fill="none"
          stroke={C.pageShade} strokeWidth={3} />
        {/* 五線 (3段) */}
        {[320, 500, 680].map((gy) => (
          <g key={gy}>
            {[0, 18, 36, 54, 72].map((dy) => (
              <line key={dy} x1={220} y1={gy + dy} x2={1520} y2={gy + dy}
                stroke={C.ink} strokeWidth={2} opacity={0.22} />
            ))}
          </g>
        ))}
        {/* 軸 */}
        <line x1={320} y1={790} x2={1420} y2={790} stroke={C.ink} strokeWidth={6} />
        {cols.map((c) => (
          <g key={c.x}>
            <line x1={c.x} y1={790} x2={c.x} y2={806} stroke={C.ink} strokeWidth={5} />
            {c.label && (
              <text x={c.x} y={852} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={42} fill={C.ink}>{c.label}</text>
            )}
          </g>
        ))}
        {/* 音符の柱 (年を追うごとに減る) */}
        {cols.map((c) =>
          Array.from({ length: c.n }, (_, k) => {
            const t = seg(f, 4 + idx * 2, 10 + idx * 2);
            idx += 1;
            if (t <= 0.01) return null;
            return (
              <g key={`${c.x}-${k}`} opacity={t}>
                <Onpu x={c.x} y={756 - k * 74} f={f} i={idx} s={1.5 * (0.7 + 0.3 * t)} />
              </g>
            );
          }))}
        {/* 下り坂の点線 */}
        <line x1={420} y1={366} x2={lerp(420, 1340, lineT)} y2={lerp(366, 684, lineT)}
          stroke={KRP.red} strokeWidth={7} strokeDasharray="22 16" strokeLinecap="round"
          opacity={0.85} />
        <g transform={`translate(${lerp(420, 1340, lineT)} ${lerp(366, 684, lineT)}) rotate(20)`}
          opacity={lineT}>
          <polygon points="26,0 -14,-20 -14,20" fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
        </g>
      </g>
      <TagPlate x={960} y={118} text="おしゃべりの音符" size={36} t={seg(f, 8, 20)} />
      {/* 研究書 (背表紙) */}
      <g transform="rotate(6 1730 940)">
        <rect x={1600} y={830} width={262} height={210} rx={10} fill={C.bookBlue}
          stroke={C.ink} strokeWidth={6.5} />
        <rect x={1600} y={830} width={46} height={210} rx={8} fill="#24405A"
          stroke={C.ink} strokeWidth={5} />
        <line x1={1668} y1={856} x2={1668} y2={1016} stroke={C.brassy} strokeWidth={4} opacity={0.8} />
        {["音", "楽", "史"].map((ch, k) => (
          <text key={ch} x={1756} y={898 + k * 52} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={44} fill={KRP.white}>{ch}</text>
        ))}
      </g>
      {/* インク壺と羽ペン */}
      <g transform="translate(160 950)">
        <ellipse cx={0} cy={56} rx={58} ry={14} fill={C.ink} opacity={0.3} />
        <path d="M -40 50 L -48 -6 L 48 -6 L 40 50 Z" fill="#3B4252" stroke={C.ink} strokeWidth={5.5} />
        <rect x={-26} y={-24} width={52} height={20} rx={6} fill="#2A2F3C" stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${-34 + Math.sin(f / 9) * 4} 10 -20)`}>
          <path d="M 10 -20 Q 40 -120 110 -186 Q 70 -110 34 -24 Z"
            fill={C.page} stroke={C.ink} strokeWidth={4.5} />
          <line x1={10} y1={-20} x2={104} y2={-178} stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #69 命令されたわけでも、法律ができたわけでもありません。
// 格: 図 / seed 1104
// 絵: `MaruBatsu`。王の布告の巻物に×、法律の本に×。どちらも埃をかぶったまま
// どこ: 古文書庫。棚に巻物と本。高窓から光の帯。埃が舞う
// 演出: MaruBatsu。王の布告の巻物に×・法律の本に×。どちらも埃をかぶったまま = 出番なし
// 動き: ○×台がポンと出る・埃がただよう・蜘蛛が糸でゆれる・光の帯がまたたく
const Sg069: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 6, 20);
  return (
    <Frame f={f} seed={1104} dark bg={C.archive}>
      {/* 壁の石積みと棚 */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={-20} y1={120 + i * 180} x2={1940} y2={120 + i * 180}
          stroke={C.archiveDark} strokeWidth={5} opacity={0.6} />
      ))}
      {[0, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(1920 0) scale(-1 1)" : undefined}>
          <rect x={-20} y={60} width={330} height={880} fill={C.archiveDark}
            stroke={C.ink} strokeWidth={7} />
          {[160, 360, 560, 760].map((sy) => (
            <g key={sy}>
              <rect x={-20} y={sy + 94} width={330} height={18} fill={C.wood2Deep}
                stroke={C.ink} strokeWidth={4.5} />
              {/* 棚の中身 (巻物の筒口と本の背) */}
              {sy % 400 === 160 ? (
                [40, 110, 180, 250].map((cx2) => (
                  <g key={cx2}>
                    <circle cx={cx2} cy={sy + 56} r={30} fill={C.page} stroke={C.ink} strokeWidth={4.5} />
                    <circle cx={cx2} cy={sy + 56} r={11} fill={C.pageShade} stroke={C.ink} strokeWidth={3} />
                  </g>
                ))
              ) : (
                [24, 76, 128, 180, 232].map((bx, k) => (
                  <rect key={bx} x={bx} y={sy + 10} width={44} height={84} rx={4}
                    fill={[C.bookLaw, C.bookBlue, C.morris, "#6E4A56", C.workDark][k]}
                    stroke={C.ink} strokeWidth={4} />
                ))
              )}
            </g>
          ))}
        </g>
      ))}
      {/* 高窓と光の帯 */}
      <rect x={1380} y={40} width={150} height={120} rx={10} fill={C.glow} opacity={0.8}
        stroke={C.ink} strokeWidth={6} />
      <line x1={1455} y1={40} x2={1455} y2={160} stroke={C.ink} strokeWidth={4} />
      <polygon points="1380,60 1530,160 1120,980 760,980"
        fill={C.glow} opacity={0.1 + 0.03 * Math.sin(f / 7)} />
      {/* ただよう埃 */}
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i}
          cx={820 + rnd(21, i) * 560 + Math.sin(f / 13 + i * 2.1) * 16}
          cy={240 + rnd(22, i) * 640 + Math.sin(f / 17 + i) * 10}
          r={2.5 + rnd(23, i) * 3} fill={C.page}
          opacity={0.25 + 0.3 * Math.abs(Math.sin(f / 8 + i))} />
      ))}
      {/* 床 */}
      <rect x={-20} y={940} width={1960} height={160} fill={C.archiveDark} stroke={C.ink} strokeWidth={6} />
      {/* ○×台: 王の布告 × / 法律 × */}
      <MaruBatsu x={960} y={700} t={t} leftMark="batsu" rightMark="batsu"
        leftText="王の布告" rightText="法律"
        leftNode={
          <g>
            {/* 巻物 (埃をかぶったまま) */}
            <rect x={-140} y={-82} width={280} height={82} rx={38} fill={C.page}
              stroke={C.ink} strokeWidth={6} />
            <circle cx={-140} cy={-41} r={41} fill={C.pageShade} stroke={C.ink} strokeWidth={5.5} />
            <circle cx={-140} cy={-41} r={15} fill={C.page} stroke={C.ink} strokeWidth={4} />
            <path d="M 60 -82 L 60 0" stroke={C.ink} strokeWidth={3.5} opacity={0.4} />
            <circle cx={96} cy={-40} r={20} fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
            <path d="M 96 -22 q 8 14 2 24" fill="none" stroke={KRP.red} strokeWidth={6} />
            <ellipse cx={-6} cy={-86} rx={150} ry={9} fill={C.stoneDark} opacity={0.55} />
          </g>
        }
        rightNode={
          <g>
            {/* 法律の本の山 (埃と蜘蛛) */}
            <rect x={-150} y={-62} width={300} height={62} rx={8} fill={C.bookLaw}
              stroke={C.ink} strokeWidth={6} transform="rotate(-1.5 0 -30)" />
            <rect x={-134} y={-120} width={268} height={60} rx={8} fill="#6E543E"
              stroke={C.ink} strokeWidth={6} transform="rotate(2 0 -90)" />
            <rect x={-118} y={-172} width={236} height={56} rx={8} fill={C.bookLaw}
              stroke={C.ink} strokeWidth={6} />
            {[-40, -98, -150].map((ly) => (
              <line key={ly} x1={-100} y1={ly} x2={96} y2={ly} stroke={C.brassy}
                strokeWidth={3.5} opacity={0.6} />
            ))}
            <ellipse cx={0} cy={-176} rx={126} ry={9} fill={C.stoneDark} opacity={0.55} />
            {/* 蜘蛛 */}
            <g transform={`translate(118 ${-300 + Math.sin(f / 10) * 14})`}>
              <line x1={0} y1={-120} x2={0} y2={0} stroke={C.page} strokeWidth={2.5} opacity={0.7} />
              <circle cx={0} cy={10} r={12} fill={C.ink} />
              <circle cx={0} cy={-6} r={7} fill={C.ink} />
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <path d={`M 0 6 q ${sd * 18} -6 ${sd * 26} -16`} fill="none" stroke={C.ink} strokeWidth={2.5} />
                  <path d={`M 0 12 q ${sd * 20} 2 ${sd * 28} -6`} fill="none" stroke={C.ink} strokeWidth={2.5} />
                  <path d={`M 0 16 q ${sd * 18} 10 ${sd * 24} 4`} fill="none" stroke={C.ink} strokeWidth={2.5} />
                </g>
              ))}
            </g>
          </g>
        }
      />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #70 では、何が人々を黙らせたのでしょうか。
// 格: 図 / seed 1105
// 絵: 静まり返った客席の上に大きな「?」が浮かぶ (#67の図の続き)。犯人不在の現場
// どこ: #66/#67と同じ客席 (連番の3枚目)。完全な静寂
// 演出: 誰も命じていないのに静まり返った「犯人不在の現場」。大きな？が浮かぶ
// 動き: ？がポンと出て浮遊・小さな？が遅れて出る・ろうそくの炎だけが揺れる
const Sg070: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1105}>
    <ParisKyakuseki f={f} phase={2} />
    {/* 静寂の青い空気 */}
    <rect x={-20} y={-20} width={1960} height={1120} fill={C.night} opacity={0.14} />
    <rect x={-20} y={-20} width={1960} height={300} fill={C.night} opacity={0.12} />
    {/* 犯人不在の「？」 */}
    <QMark x={960} y={500} s={2.4} f={f} t={seg(f, 8, 20)} />
    <QMark x={300} y={440} s={1.0} f={f + 9} t={seg(f, 16, 27)} color={KRP.grayDark} />
    <QMark x={1640} y={470} s={0.85} f={f + 17} t={seg(f, 22, 33)} color={KRP.grayDark} />
  </Frame>
);

// -------------------------------------------------------------------
// #71 答えのひとつは、見栄です。
// 格: 山 / seed 1106
// 絵: 答えの発表。姿見の前で正装を直す紳士。鏡の中の自分に「上品」の金の札。背後で家族も身支度
// どこ: 出かける前の居間。金縁の姿見・コート掛け・鏡台。背後で家族も身支度
// 演出: 鏡の中の自分に「上品」の金の札。見栄が答えだと発表する1枚
// 動き: 札がポンと出る・鏡の光のすじが流れる・紳士が襟元を直して揺れる・キラキラ
const Sg071: React.FC<{ f: number }> = ({ f }) => {
  const glintX = lerp(500, 760, (Math.sin(f / 16) + 1) / 2);
  return (
    <Frame f={f} seed={1106}>
      {/* 壁紙 (縞) と腰板 */}
      <rect x={-20} y={-20} width={1960} height={900} fill="#EADFC6" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 100 + 20} y={-20} width={34} height={900}
          fill={C.dress} opacity={0.12} />
      ))}
      <rect x={-20} y={852} width={1960} height={66} fill={C.wood2}
        stroke={C.ink} strokeWidth={6} />
      {/* 床板 */}
      <rect x={-20} y={918} width={1960} height={182} fill={C.wood2Deep} />
      {[260, 700, 1140, 1580].map((fx) => (
        <line key={fx} x1={fx} y1={918} x2={fx - 60} y2={1100} stroke={C.ink}
          strokeWidth={3} opacity={0.3} />
      ))}
      {/* 敷物 */}
      <ellipse cx={840} cy={1030} rx={560} ry={62} fill={C.seat} stroke={C.ink} strokeWidth={6} />
      <ellipse cx={840} cy={1030} rx={470} ry={46} fill="none" stroke={C.brassy}
        strokeWidth={4} opacity={0.8} />
      {/* コート掛け (左) */}
      <g transform="translate(150 0)">
        <rect x={-10} y={330} width={20} height={690} fill={C.wood2} stroke={C.ink} strokeWidth={5} />
        <path d="M -70 1020 L 70 1020 L 40 988 L -40 988 Z" fill={C.wood2} stroke={C.ink} strokeWidth={5} />
        <path d="M 0 360 q -56 10 -70 44 M 0 360 q 56 10 70 44" fill="none"
          stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M -64 410 L -110 760 Q -60 800 -12 760 L -24 410 Z"
          fill={C.coatDark} stroke={C.ink} strokeWidth={5.5} />
        <ellipse cx={34} cy={330} rx={44} ry={9} fill="#2F2A24" stroke={C.ink} strokeWidth={4} />
        <rect x={8} y={286} width={52} height={46} rx={6} fill="#2F2A24" stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 姿見 (金縁) */}
      <g>
        <path d="M 540 1012 L 456 884 M 700 1012 L 784 884" stroke={C.ink} strokeWidth={10}
          strokeLinecap="round" />
        <path d="M 446 900 L 794 900 L 770 212 Q 620 120 470 212 Z"
          fill={C.brassy} stroke={C.ink} strokeWidth={8} />
        <clipPath id="sgb3_kagami">
          <path d="M 482 866 L 758 866 L 740 240 Q 620 164 500 240 Z" />
        </clipPath>
        <path d="M 482 866 L 758 866 L 740 240 Q 620 164 500 240 Z"
          fill="#CFE0E4" stroke={C.ink} strokeWidth={5} />
        <g clipPath="url(#sgb3_kagami)">
          {/* 鏡の中の自分 */}
          <rect x={482} y={164} width={276} height={706} fill="#DCE9EC" />
          <Person x={622} y={862} s={1.12} cloth={C.coat} clothDark={C.coatDark}
            f={f} phase={3} pose="hold" face="smile" gaze={[0.25, 0]} lean={Math.sin(f / 9) * 1.5} />
          <TopHat x={622} y={862} s={1.12} lean={Math.sin(f / 9) * 1.5} f={f} phase={3} />
          <polygon points="622,712 606,736 638,736" fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          {/* 光のすじ */}
          <line x1={glintX - 60} y1={880} x2={glintX + 120} y2={180} stroke={KRP.white}
            strokeWidth={26} opacity={0.4} />
          <line x1={glintX + 10} y1={880} x2={glintX + 190} y2={180} stroke={KRP.white}
            strokeWidth={10} opacity={0.5} />
        </g>
        <TagPlate x={620} y={300} text="上品" size={44} rot={-6} t={seg(f, 14, 26)}
          fill={C.glow} />
        {/* キラキラ */}
        {[{ x: 520, y: 420, d: 18 }, { x: 724, y: 560, d: 24 }, { x: 560, y: 700, d: 30 }].map((sp, k) => {
          const st = seg(f, sp.d, sp.d + 9) * (0.55 + 0.45 * Math.sin(f / 6 + k * 2.1));
          return (
            <g key={k} transform={`translate(${sp.x} ${sp.y}) scale(${0.5 + st})`} opacity={st}>
              <path d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z"
                fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
            </g>
          );
        })}
      </g>
      {/* 主役: 姿見の前で正装を直す紳士 */}
      <ellipse cx={1030} cy={1042} rx={150} ry={24} fill={C.ink} opacity={0.3} />
      <Person x={1030} y={1038} s={1.34} cloth={C.coat} clothDark={C.coatDark}
        f={f} phase={1} pose="hold" face="smile" gaze={[-0.7, 0.05]}
        lean={Math.sin(f / 9) * 1.5} />
      <TopHat x={1030} y={1038} s={1.34} lean={Math.sin(f / 9) * 1.5} f={f} phase={1} />
      <polygon points="1030,862 1011,890 1049,890" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      {/* 背後の家族 (妻はボンネットのリボンを直し 子はまねをする) */}
      <Person x={1452} y={1022} s={1.06} cloth={C.dress} clothDark={C.dressDark}
        f={f} phase={6} pose="hold" face="normal" gaze={[-0.5, 0]} lean={Math.sin(f / 11) * 2} />
      <Bonnet x={1452} y={1022} s={1.06} lean={Math.sin(f / 11) * 2} f={f} phase={6} />
      <Person x={1668} y={1012} s={0.74} cloth={C.dress2} clothDark={C.dress2Dark}
        f={f} phase={9} pose="banzai" face="joy" gaze={[-0.4, 0]} />
      {/* 鏡台 (右端) */}
      <g transform="translate(1850 0)">
        <rect x={-96} y={790} width={192} height={36} rx={8} fill={C.wood2} stroke={C.ink} strokeWidth={5.5} />
        <rect x={-80} y={826} width={160} height={196} fill={C.wood2} stroke={C.ink} strokeWidth={5.5} />
        <rect x={-58} y={856} width={116} height={54} rx={8} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        <circle cx={0} cy={883} r={7} fill={C.ink} />
        <rect x={-16} y={700} width={32} height={90} fill="#D9D2C4" stroke={C.ink} strokeWidth={4.5} />
        <path d={`M 0 ${672 + Math.sin(f / 5) * 3} C -9 ${660 + Math.sin(f / 5) * 2} -7 644 0 638 C 7 644 9 ${660 + Math.sin(f / 5) * 2} 0 ${672 + Math.sin(f / 5) * 3} Z`}
          fill={C.flame} stroke={C.ink} strokeWidth={3.5} />
        <circle cx={0} cy={660} r={44} fill={C.glow} opacity={0.3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #72 当時のパリでは、いろいろな階級の市民が、演奏会に通い始めていました。
// 格: 並 / seed 1107
// 絵: 会場入口の列。身なりの違う市民がずらり。切符を握る手、手袋の手、軍手の手
// どこ: 夕方の会場脇の入口。石壁ぞいに並ぶ列。奥はパリの街並み
// 演出: 身なりの違う市民がずらり (職人の軍手・婦人の手袋・紳士)。みんな切符を握る
// 動き: 列がじり…と前へ進む・切符が小さく揺れる・札と矢印がポンと出る・煙突の煙
const Sg072: React.FC<{ f: number }> = ({ f }) => {
  const inch = easeOut(seg(f, 10, 42)) * 30;
  const queue: {
    x: number; y: number; s: number; cloth: string; dark: string;
    hat: "top" | "bonnet" | "none"; gloves?: string;
  }[] = [
    { x: 270, y: 1040, s: 1.22, cloth: C.work, dark: C.workDark, hat: "none", gloves: "#8E9AA0" },
    { x: 570, y: 1002, s: 1.1, cloth: C.dress, dark: C.dressDark, hat: "bonnet" },
    { x: 840, y: 968, s: 0.98, cloth: C.coat, dark: C.coatDark, hat: "top" },
    { x: 1072, y: 940, s: 0.86, cloth: C.dress2, dark: C.dress2Dark, hat: "bonnet" },
    { x: 1272, y: 918, s: 0.76, cloth: "#5C4A6E", dark: "#463854", hat: "top" },
  ];
  return (
    <Frame f={f} seed={1107} bg="#EFD9B4">
      {/* 夕空と遠景のパリの屋根 */}
      <circle cx={360} cy={240} r={86} fill={C.glow} opacity={0.8} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} opacity={0.5}>
          <rect x={i * 260 - 40} y={330 + rnd(41, i) * 90} width={230}
            height={400} fill={C.stoneDark} stroke={C.ink} strokeWidth={4} />
          <polygon points={`${i * 260 - 40},${330 + rnd(41, i) * 90} ${i * 260 + 75},${250 + rnd(41, i) * 90} ${i * 260 + 190},${330 + rnd(41, i) * 90}`}
            fill="#6E5F4C" stroke={C.ink} strokeWidth={4} />
          <rect x={i * 260 + 40} y={240 + rnd(41, i) * 90} width={26} height={70}
            fill={C.archiveDark} stroke={C.ink} strokeWidth={3.5} />
          {[0, 1].map((c) =>
            [0, 1, 2].map((r) => (
              <rect key={`${c}-${r}`} x={i * 260 + 10 + c * 112} width={56} height={66}
                y={370 + rnd(41, i) * 90 + r * 108} rx={4}
                fill={C.archiveDark} opacity={0.75} stroke={C.ink} strokeWidth={3} />
            )))}
          <circle cx={i * 260 + 53} cy={210 + rnd(41, i) * 90 - (f % 40) * 1.2}
            r={10 + (f % 40) * 0.25} fill={KRP.white} opacity={0.5 - (f % 40) * 0.01} />
        </g>
      ))}
      {/* 会場の石壁と入口 (右) */}
      <rect x={1330} y={120} width={610} height={840} fill={C.stone} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={1330} y1={190 + i * 96} x2={1940} y2={190 + i * 96}
          stroke={C.ink} strokeWidth={2.5} opacity={0.2} />
      ))}
      <path d="M 1480 960 L 1480 560 Q 1610 462 1740 560 L 1740 960 Z"
        fill={C.stoneDark} stroke={C.ink} strokeWidth={6.5} />
      <path d="M 1502 960 L 1502 572 Q 1610 490 1718 572 L 1718 960 Z"
        fill={C.glow} stroke={C.ink} strokeWidth={5} />
      <PersonMini x={1610} y={944} s={0.66} color="#3B3630" f={f} phase={3} face="none" />
      {/* 入口脇の貼り紙 */}
      <rect x={1790} y={520} width={118} height={168} fill={C.page} stroke={C.ink}
        strokeWidth={4.5} transform="rotate(2 1849 604)" />
      <FakeLines x={1802} y={548} w={94} n={4} gap={26} seed={9} h={8} />
      {/* 石畳 */}
      <rect x={-20} y={940} width={1960} height={160} fill="#C8B795" stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={i * 170 - 30} y1={940} x2={i * 170 - 90} y2={1100}
          stroke={C.stoneDark} strokeWidth={3.5} opacity={0.5} />
      ))}
      {/* 切符を握る列 (身なりいろいろ) */}
      <g transform={`translate(${inch} 0)`}>
        {queue.map((q, k) => {
          const handY = q.y - 118 * q.s;
          return (
            <g key={k}>
              <ellipse cx={q.x} cy={q.y + 4} rx={120 * q.s} ry={20 * q.s} fill={C.ink} opacity={0.25} />
              <Person x={q.x} y={q.y} s={q.s} cloth={q.cloth} clothDark={q.dark}
                f={f} phase={k * 2 + 1} pose="hold" face={k % 2 === 0 ? "smile" : "normal"}
                gaze={[0.5, 0]} />
              {q.hat === "top" && <TopHat x={q.x} y={q.y} s={q.s} f={f} phase={k * 2 + 1} />}
              {q.hat === "bonnet" && <Bonnet x={q.x} y={q.y} s={q.s} color={k === 3 ? "#8C6A4E" : undefined}
                f={f} phase={k * 2 + 1} />}
              {/* 軍手 (職人だけ手の色を替える) */}
              {q.gloves && (
                <g>
                  <circle cx={q.x - 14 * q.s} cy={handY} r={10 * q.s} fill={q.gloves}
                    stroke={C.ink} strokeWidth={4} />
                  <circle cx={q.x + 14 * q.s} cy={handY} r={10 * q.s} fill={q.gloves}
                    stroke={C.ink} strokeWidth={4} />
                </g>
              )}
              {/* 握った切符 */}
              <g transform={`translate(${q.x} ${handY - 8 * q.s}) rotate(${-10 + Math.sin(f / 8 + k) * 5}) scale(${q.s})`}>
                <rect x={-34} y={-44} width={68} height={40} rx={5} fill={KRP.yellow}
                  stroke={C.ink} strokeWidth={4} />
                <line x1={-18} y1={-44} x2={-18} y2={-4} stroke={C.ink} strokeWidth={2.5}
                  strokeDasharray="5 5" />
              </g>
            </g>
          );
        })}
      </g>
      {/* ロープ柵 (手前) */}
      {(() => {
        const posts = [
          { x: 120, y: 1082 }, { x: 700, y: 1060 }, { x: 1280, y: 1042 }, { x: 1800, y: 1028 },
        ];
        return (
          <g>
            {posts.slice(0, -1).map((p, i) => {
              const q = posts[i + 1];
              return (
                <path key={i}
                  d={`M ${p.x} ${p.y - 148} Q ${(p.x + q.x) / 2} ${Math.max(p.y, q.y) - 86 + Math.sin(f / 10 + i) * 5} ${q.x} ${q.y - 148}`}
                  fill="none" stroke={KRP.red} strokeWidth={9} opacity={0.9} />
              );
            })}
            {posts.map((p) => (
              <g key={p.x} transform={`translate(${p.x} ${p.y})`}>
                <ellipse cx={0} cy={0} rx={36} ry={10} fill={C.ink} opacity={0.35} />
                <rect x={-9} y={-142} width={18} height={142} fill={C.brassy}
                  stroke={C.ink} strokeWidth={4.5} />
                <circle cx={0} cy={-152} r={15} fill={C.brassy} stroke={C.ink} strokeWidth={4.5} />
              </g>
            ))}
          </g>
        );
      })()}
      <TagPlate x={150} y={620} text="切符" size={38} t={seg(f, 16, 28)} rot={-4} />
      <Arrow x={196} y={742} s={1.0} rot={52} t={seg(f, 22, 32)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #73 そのなかで「静かに聴けること」が、教養ある上品な市民の証になったのです。
// 格: 並 / seed 1108
// 絵: 客席で微動だにしない一家。周囲からの感心の視線の線。胸に見えない勲章
// どこ: 客席の1列に寄る。微動だにしない一家と 左右から見とれる隣客
// 演出: 感心の視線の点線が一家に集まる。父の胸に「見えない勲章」(金の点線)
// 動き: 視線の点線が流れる・勲章がポンと出て明滅・隣客がじわっと身を乗り出す・光の帯
const Sg073: React.FC<{ f: number }> = ({ f }) => {
  const leanT = easeOut(seg(f, 4, 30));
  const medalT = seg(f, 12, 26);
  const pulse = 0.65 + 0.35 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={1108}>
      {/* 会場の壁 (ぼんやり) と燭台 */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={C.hallWall} />
      <path d="M -20 230 Q 960 110 1940 230" fill="none" stroke={C.hallDeep} strokeWidth={26} opacity={0.6} />
      <path d="M -20 300 Q 960 180 1940 300" fill="none" stroke={C.hallDeep} strokeWidth={10} opacity={0.4} />
      {[300, 960, 1620].map((px) => (
        <rect key={px} x={px - 16} y={330} width={32} height={260} fill={C.hallDeep}
          opacity={0.35} />
      ))}
      {/* 壁の羽目板パネル */}
      {[396, 666, 1056, 1326].map((px) => (
        <g key={px} opacity={0.45}>
          <rect x={px} y={368} width={230} height={224} rx={14} fill="none"
            stroke={C.hallDeep} strokeWidth={6} />
          <rect x={px + 22} y={390} width={186} height={180} rx={10} fill="none"
            stroke={C.hallDeep} strokeWidth={3.5} />
        </g>
      ))}
      <rect x={-20} y={636} width={1960} height={20} fill={C.hallDeep} opacity={0.35} />
      <GasuTou x={80} y={400} f={f} i={6} s={0.9} />
      <GasuTou x={1840} y={400} f={f} i={7} s={0.9} />
      {/* 舞台からの淡い光 */}
      <polygon points="660,-20 1260,-20 1560,1100 360,1100" fill={C.glow} opacity={0.1} />
      {/* 後列の客 (背もたれの向こうから一家を見る) */}
      <PersonMini x={420} y={742} s={0.52} color="#6E5F4C" f={f} phase={2} face="dot" />
      <PersonMini x={1420} y={736} s={0.5} color="#595E70" f={f} phase={6} face="dot" />
      <rect x={-20} y={700} width={1960} height={96} fill={C.seat} stroke={C.ink} strokeWidth={7} />
      <line x1={0} y1={718} x2={1920} y2={718} stroke={C.brassy} strokeWidth={4.5} opacity={0.75} />
      {/* 一家 (微動だにしない) */}
      <Person x={640} y={1000} s={1.08} cloth={C.dress} clothDark={C.dressDark}
        f={f} phase={2} still face="normal" gaze={[0, 0.3]} />
      <Bonnet x={640} y={1000} s={1.08} f={f} phase={2} still />
      <Person x={900} y={1000} s={1.18} cloth={C.coat} clothDark={C.coatDark}
        f={f} phase={1} still face="normal" gaze={[0, 0.3]} />
      <TopHat x={900} y={1000} s={1.18} f={f} phase={1} still />
      <Person x={1130} y={1005} s={0.78} cloth={C.dress2} clothDark={C.dress2Dark}
        f={f} phase={4} still face="normal" gaze={[0, 0.3]} />
      {/* 隣客 (身を乗り出して感心) */}
      <Person x={200} y={1010} s={1.0} cloth={C.work} clothDark={C.workDark}
        f={f} phase={6} lean={11 * leanT} face="smile" gaze={[0.8, 0]} />
      <Person x={1710} y={1010} s={1.0} cloth="#6E4A56" clothDark="#553942"
        f={f} phase={8} lean={-11 * leanT} face="smile" gaze={[-0.8, 0]} />
      <Bonnet x={1710} y={1010} s={1.0} color="#B06A5A" lean={-11 * leanT} f={f} phase={8} />
      {/* 感心の視線 (点線が一家へ流れる) */}
      <g opacity={0.65 * leanT} stroke={C.ink} strokeWidth={6.5} fill="none"
        strokeDasharray="6 15" strokeLinecap="round">
        <path d={`M 268 756 Q 520 690 806 846`} strokeDashoffset={-f * 2.2} />
        <path d={`M 1648 752 Q 1400 680 996 846`} strokeDashoffset={-f * 2.2} />
        <path d={`M 452 716 Q 560 700 788 870`} strokeDashoffset={-f * 1.8} opacity={0.7} />
        <path d={`M 1400 712 Q 1280 690 1016 876`} strokeDashoffset={-f * 1.8} opacity={0.7} />
      </g>
      {/* 見えない勲章 (金の点線) */}
      {medalT > 0.01 && (
        <g transform={`translate(900 826) scale(${(0.7 + 0.3 * medalT) * 0.82})`} opacity={medalT * pulse}>
          <path d="M -24 -50 L 0 -22 L 24 -50" fill="none" stroke={C.brassy}
            strokeWidth={6} strokeDasharray="10 8" strokeLinecap="round" />
          <circle cx={0} cy={16} r={40} fill="none" stroke={C.brassy} strokeWidth={6}
            strokeDasharray="12 9" />
          <path d="M 0 -6 L 7 8 L 22 10 L 11 21 L 14 36 L 0 28 L -14 36 L -11 21 L -22 10 L -7 8 Z"
            fill="none" stroke={C.brassy} strokeWidth={4} strokeDasharray="7 6" />
        </g>
      )}
      {/* 最前の座席パネル (ここに座っている、の足隠し) */}
      <rect x={-20} y={880} width={1960} height={220} fill={C.seat} stroke={C.ink} strokeWidth={8} />
      <line x1={0} y1={906} x2={1920} y2={906} stroke={C.brassy} strokeWidth={6} opacity={0.8} />
      {[460, 1060, 1560].map((dx) => (
        <line key={dx} x1={dx} y1={892} x2={dx} y2={1080} stroke={C.seatDark} strokeWidth={5} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #74 社会学者セネットは、こうまとめています。
// 格: 並 / seed 1109
// 絵: 書斎。書棚を背にした著者と机上の原稿。表紙に『公共性の喪失』の背
// どこ: 社会学者の書斎。壁一面の書棚・机の上の原稿・油ランプ
// 演出: 書棚を背にした著者。机に『公共性の喪失』の背表紙を立てる
// 動き: 原稿の行が書き進むように増える・羽ペンが動く・ランプの炎・著者のうなずき
const Sg074: React.FC<{ f: number }> = ({ f }) => {
  const bookCols = [C.bookLaw, C.bookBlue, C.morris, "#6E4A56", C.workDark, "#595E70", C.seatDark];
  return (
    <Frame f={f} seed={1109}>
      {/* 壁一面の書棚 */}
      <rect x={-20} y={-20} width={1960} height={800} fill={C.wood2Deep} />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          {Array.from({ length: 24 }, (_, i) => {
            const bh = 110 + rnd(51 + row, i) * 46;
            return (
              <rect key={i} x={30 + i * 78} y={180 + row * 190 - bh}
                width={62} height={bh} rx={5}
                fill={bookCols[Math.floor(rnd(55 + row, i) * 7) % 7]}
                stroke={C.ink} strokeWidth={4}
                transform={rnd(58 + row, i) > 0.88 ? `rotate(7 ${61 + i * 78} ${180 + row * 190})` : undefined} />
            );
          })}
          <rect x={-20} y={180 + row * 190} width={1960} height={22} fill={C.wood2}
            stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* はしご (左) */}
      <g transform="rotate(-8 180 780)">
        <line x1={150} y1={40} x2={150} y2={780} stroke={C.wood2} strokeWidth={14} />
        <line x1={230} y1={40} x2={230} y2={780} stroke={C.wood2} strokeWidth={14} />
        {[120, 230, 340, 450, 560, 670].map((ly) => (
          <line key={ly} x1={150} y1={ly} x2={230} y2={ly} stroke={C.wood2} strokeWidth={10} />
        ))}
      </g>
      {/* 著者 (書棚を背に。腕を組んでまとめる) */}
      <Person x={1250} y={820} s={1.22} cloth={C.morris} clothDark="#324A3B"
        f={f} phase={1} glasses pose="armsFolded" face="normal"
        gaze={[-0.3, 0.5]} lean={Math.sin(f / 12) * 1.8} />
      {/* 机 (手前。天板は奥行きを見せる) */}
      <polygon points="-20,640 1940,640 1940,822 -20,822" fill={C.wood2}
        stroke={C.ink} strokeWidth={7} />
      <line x1={-20} y1={662} x2={1940} y2={662} stroke={C.wood2Deep} strokeWidth={4} opacity={0.6} />
      <rect x={-20} y={822} width={1960} height={278} fill={C.wood2Deep} stroke={C.ink} strokeWidth={7} />
      {[420, 1500].map((dx) => (
        <g key={dx}>
          <rect x={dx - 150} y={860} width={300} height={172} rx={10} fill="none"
            stroke={C.ink} strokeWidth={5} opacity={0.6} />
          <circle cx={dx} cy={946} r={12} fill={C.brassy} stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 原稿 (行が増えていく) */}
      <g transform="rotate(-3 920 730)">
        <rect x={650} y={672} width={560} height={150} rx={6} fill={C.pageShade}
          stroke={C.ink} strokeWidth={4.5} />
        <rect x={668} y={656} width={560} height={150} rx={6} fill={C.page}
          stroke={C.ink} strokeWidth={5.5} />
        <FakeLines x={700} y={684} w={496} n={4} gap={30} seed={13} f={f} stagger={4} h={9} />
      </g>
      {/* 『公共性の喪失』の背表紙 (机の上に立てる) */}
      <g transform="rotate(2 1680 560)">
        <rect x={1596} y={368} width={170} height={372} rx={10} fill={C.bookLaw}
          stroke={C.ink} strokeWidth={7} />
        <rect x={1610} y={382} width={142} height={344} rx={7} fill="none"
          stroke={C.brassy} strokeWidth={3.5} opacity={0.8} />
        {["公", "共", "性", "の", "喪", "失"].map((ch, k) => (
          <text key={k} x={1681} y={436 + k * 50} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={40} fill={KRP.white}>{ch}</text>
        ))}
      </g>
      {/* 油ランプ (左) */}
      <g transform="translate(360 726)">
        <ellipse cx={0} cy={0} rx={64} ry={12} fill={C.ink} opacity={0.3} />
        <path d="M -34 -4 L 34 -4 L 20 -46 L -20 -46 Z" fill={C.brassy} stroke={C.ink} strokeWidth={5} />
        <path d="M -26 -46 Q 0 -150 26 -46 Z" fill={C.glow} opacity={0.9}
          stroke={C.ink} strokeWidth={5} />
        <path d={`M 0 ${-66 + Math.sin(f / 5) * 3} C -7 ${-76 + Math.sin(f / 5) * 2} -6 -88 0 -94 C 6 -88 7 ${-76 + Math.sin(f / 5) * 2} 0 ${-66 + Math.sin(f / 5) * 3} Z`}
          fill={C.flame} stroke={C.ink} strokeWidth={3} />
        <circle cx={0} cy={-80} r={78} fill={C.glow} opacity={0.22 + 0.04 * Math.sin(f / 5)} />
      </g>
      {/* 机上の小物 (本の山とインク壺) */}
      <g>
        <rect x={120} y={676} width={190} height={34} rx={6} fill={C.bookBlue} stroke={C.ink} strokeWidth={5} transform="rotate(-2 215 693)" />
        <rect x={132} y={644} width={168} height={32} rx={6} fill="#6E4A56" stroke={C.ink} strokeWidth={5} transform="rotate(1.5 216 660)" />
        <circle cx={1452} cy={700} r={26} fill="#3B4252" stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${18 + Math.sin(f / 8) * 3} 1452 690)`}>
          <path d="M 1452 690 Q 1478 616 1538 566 Q 1498 628 1468 692 Z" fill={C.page}
            stroke={C.ink} strokeWidth={4} />
        </g>
        <rect x={1438} y={684} width={28} height={12} rx={4} fill="#2A2F3C" stroke={C.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #75 感情を抑えて、黙って聴ける者こそが、立派な観客である、と。
// 格: 図 / seed 1110
// 絵: 本の見開き。要旨が活字で浮かぶ。「沈黙=立派」の行にしおり紐
// どこ: 緑のフェルト張りの机。セネットの本の見開きに寄る。ろうそくと眼鏡
// 演出: 要旨の活字がダミー行で浮かぶ。「沈黙 = 立派」の行に金の帯としおり紐
// 動き: 行が順に浮かぶ・金の帯が左から伸びる・札がポンと出る・しおり紐の先が揺れる・炎
const Sg075: React.FC<{ f: number }> = ({ f }) => {
  const bandT = easeOut(seg(f, 14, 28));
  const ribTip = Math.sin(f / 9) * 18;
  return (
    <Frame f={f} seed={1110}>
      {/* フェルト張りの机 */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={C.morris} />
      <rect x={40} y={40} width={1840} height={1000} rx={24} fill="none"
        stroke={C.brassy} strokeWidth={5} opacity={0.5} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={rnd(61, i) * 1920} cy={rnd(62, i) * 1080} r={2.2}
          fill={KRP.white} opacity={0.12} />
      ))}
      {/* 本 (見開き) */}
      <g transform="rotate(-1.2 960 540)">
        {/* 表紙と小口 */}
        <rect x={236} y={176} width={1448} height={716} rx={14} fill={C.bookLaw}
          stroke={C.ink} strokeWidth={8} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${276 + i * 8} ${856 - i * 8} Q 960 ${900 - i * 8} ${1644 - i * 8} ${856 - i * 8}`}
            fill="none" stroke={C.pageShade} strokeWidth={5} />
        ))}
        {/* 左ページ */}
        <path d="M 952 236 Q 620 196 292 244 L 292 812 Q 620 772 952 836 Z"
          fill={C.page} stroke={C.ink} strokeWidth={6} />
        {/* 右ページ */}
        <path d="M 968 236 Q 1300 196 1628 244 L 1628 812 Q 1300 772 968 836 Z"
          fill={C.page} stroke={C.ink} strokeWidth={6} />
        <path d="M 952 236 Q 960 530 952 836 M 968 236 Q 960 530 968 836"
          fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
        {/* 左ページの活字 */}
        <FakeLines x={360} y={300} w={520} n={7} gap={44} seed={17} f={f} stagger={2} h={11} />
        <FakeLines x={360} y={636} w={520} n={3} gap={44} seed={18} f={f} stagger={18} h={11} />
        {/* 右ページの活字 (真ん中の1行が主役) */}
        <FakeLines x={1050} y={300} w={520} n={3} gap={44} seed={19} f={f} stagger={6} h={11} />
        {/* 金の帯 (左から伸びる) */}
        <rect x={1040} y={472} width={544 * bandT} height={66} rx={10}
          fill={C.glow} opacity={0.95} stroke={C.brassy} strokeWidth={4} />
        <FakeLines x={1050} y={596} w={520} n={4} gap={44} seed={20} f={f} stagger={12} h={11} />
      </g>
      {/* しおり紐 (スピンが主役の行を指して垂れる) */}
      <path d={`M 948 182 Q 1010 320 1072 470 Q 1120 600 ${1082 + ribTip} 790 Q ${1072 + ribTip} 836 ${1092 + ribTip} 856`}
        fill="none" stroke={KRP.red} strokeWidth={14} strokeLinecap="round" opacity={0.95} />
      <path d={`M ${1092 + ribTip} 856 L ${1076 + ribTip} 896 L ${1108 + ribTip} 896 Z`}
        fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
      {/* 主役の行の札 */}
      <TagPlate x={1312} y={504} text="沈黙 = 立派" size={40} rot={-2} t={seg(f, 18, 30)} />
      {/* 眼鏡 (読みかけの気配) */}
      <g transform="rotate(14 470 900)">
        <circle cx={420} cy={930} r={44} fill="none" stroke={C.ink} strokeWidth={6} />
        <circle cx={530} cy={930} r={44} fill="none" stroke={C.ink} strokeWidth={6} />
        <path d="M 462 926 Q 475 914 488 926" fill="none" stroke={C.ink} strokeWidth={5} />
        <line x1={574} y1={924} x2={660} y2={900} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* ろうそく (右上) */}
      <g transform="translate(1800 220)">
        <ellipse cx={0} cy={54} rx={64} ry={14} fill={C.brassy} stroke={C.ink} strokeWidth={5} />
        <rect x={-20} y={-66} width={40} height={120} rx={6} fill="#EDE4CC" stroke={C.ink} strokeWidth={5} />
        <path d="M -20 -60 q 10 16 4 30" fill="none" stroke={C.pageShade} strokeWidth={5} />
        <path d={`M 0 ${-92 + Math.sin(f / 5) * 3} C -8 ${-104 + Math.sin(f / 5) * 2} -7 -118 0 -124 C 7 -118 8 ${-104 + Math.sin(f / 5) * 2} 0 ${-92 + Math.sin(f / 5) * 3} Z`}
          fill={C.flame} stroke={C.ink} strokeWidth={3.5} />
        <circle cx={0} cy={-104} r={64} fill={C.glow} opacity={0.26 + 0.05 * Math.sin(f / 5)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #76 おしゃべりは、下品。弁当は、論外。
// 格: 図 / seed 1111
// 絵: マナー帳。「おしゃべり」に「下品」の判、「弁当」のページは朱で大きく「論外」。ページをめくる手
// どこ: 客間のテーブル。レース敷きの上のマナー帳。紅茶と手袋の手
// 演出: 「おしゃべり」に「下品」の判。「弁当」のページに朱で大きく「論外」
// 動き: 判が2つ順にバンと押される・ページの角を手袋の手がめくりかける・湯気
const Sg076: React.FC<{ f: number }> = ({ f }) => {
  const st1 = seg(f, 10, 17);
  const st2 = seg(f, 26, 33);
  const curl = 26 + Math.sin(f / 8) * 12;
  return (
    <Frame f={f} seed={1111}>
      {/* 磨かれたテーブルとレース敷き */}
      <rect x={-20} y={-20} width={1960} height={1120} fill="#4A3A30" />
      {[200, 560, 920, 1280, 1640].map((ty) => (
        <path key={ty} d={`M -20 ${ty * 0.6} Q 960 ${ty * 0.6 + 18} 1940 ${ty * 0.6}`}
          fill="none" stroke="#3A2D25" strokeWidth={5} opacity={0.7} />
      ))}
      <ellipse cx={960} cy={560} rx={840} ry={470} fill={KRP.white} opacity={0.92} />
      {Array.from({ length: 26 }, (_, i) => {
        const ang = (i / 26) * Math.PI * 2;
        return (
          <circle key={i} cx={960 + Math.cos(ang) * 840} cy={560 + Math.sin(ang) * 470}
            r={34} fill={KRP.white} opacity={0.92} />
        );
      })}
      <ellipse cx={960} cy={560} rx={760} ry={408} fill="none" stroke={C.pageShade}
        strokeWidth={4} opacity={0.8} />
      {/* マナー帳 (見開き) */}
      <g transform="rotate(1.6 960 560)">
        <rect x={296} y={226} width={1328} height={676} rx={14} fill="#6E4A56"
          stroke={C.ink} strokeWidth={8} />
        <path d="M 972 258 Q 1280 222 1584 268 L 1584 816 Q 1280 780 972 836 Z"
          fill={C.page} stroke={C.ink} strokeWidth={6} />
        <path d="M 948 258 Q 640 222 336 268 L 336 816 Q 640 780 948 836 Z"
          fill={C.page} stroke={C.ink} strokeWidth={6} />
        <path d="M 948 258 Q 958 540 948 836 M 972 258 Q 962 540 972 836"
          fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
        {/* 左ページ: おしゃべりの項 */}
        <text x={560} y={356} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={C.ink}>おしゃべり</text>
        <line x1={400} y1={384} x2={880} y2={384} stroke={C.ink} strokeWidth={4} opacity={0.6} />
        {/* 向き合う横顔と音符 */}
        <g>
          <circle cx={480} cy={500} r={56} fill="none" stroke={C.ink} strokeWidth={5.5} />
          <path d="M 528 486 q 16 14 0 28" fill="none" stroke={C.ink} strokeWidth={5} />
          <circle cx={700} cy={500} r={56} fill="none" stroke={C.ink} strokeWidth={5.5} />
          <path d="M 652 486 q -16 14 0 28" fill="none" stroke={C.ink} strokeWidth={5} />
          <Onpu x={590} y={452} f={f} i={2} s={0.9} />
        </g>
        <FakeLines x={400} y={610} w={460} n={4} gap={40} seed={23} h={10} />
        {/* 下品の判 */}
        {st1 > 0.01 && (
          <g transform={`translate(600 688) rotate(-11) scale(${pop(st1)})`} opacity={0.96}>
            <rect x={-118} y={-66} width={236} height={132} rx={14} fill="none"
              stroke={KRP.red} strokeWidth={9} />
            <rect x={-104} y={-52} width={208} height={104} rx={10} fill="none"
              stroke={KRP.red} strokeWidth={4} opacity={0.7} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={76} fill={KRP.red}>下品</text>
          </g>
        )}
        {/* 右ページ: 弁当の項 */}
        <text x={1270} y={356} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={C.ink}>弁当</text>
        <line x1={1080} y1={384} x2={1500} y2={384} stroke={C.ink} strokeWidth={4} opacity={0.6} />
        {/* 弁当箱の図 */}
        <g transform="translate(1270 500)">
          <rect x={-120} y={-58} width={240} height={116} rx={12} fill={C.pageShade}
            stroke={C.ink} strokeWidth={5.5} />
          <line x1={-20} y1={-58} x2={-20} y2={58} stroke={C.ink} strokeWidth={4} />
          <line x1={-20} y1={0} x2={120} y2={0} stroke={C.ink} strokeWidth={4} />
          {[-85, -52].map((rx2) => (
            <circle key={rx2} cx={rx2} cy={0} r={13} fill="none" stroke={C.ink} strokeWidth={3.5} />
          ))}
          <circle cx={50} cy={-28} r={11} fill="none" stroke={C.ink} strokeWidth={3.5} />
          <path d="M 30 28 L 70 28 L 60 44 L 40 44 Z" fill="none" stroke={C.ink} strokeWidth={3.5} />
        </g>
        <FakeLines x={1080} y={600} w={420} n={3} gap={40} seed={24} h={10} />
        {/* 論外の大判 */}
        {st2 > 0.01 && (
          <g transform={`translate(1276 600) rotate(-14) scale(${pop(st2)})`} opacity={0.94}>
            <rect x={-210} y={-104} width={420} height={208} rx={18} fill="none"
              stroke={KRP.red} strokeWidth={13} />
            <rect x={-190} y={-84} width={380} height={168} rx={12} fill="none"
              stroke={KRP.red} strokeWidth={5} opacity={0.7} />
            <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={128} fill={KRP.red}>論外</text>
            {[[-228, -120], [226, 112], [196, -124]].map(([dx, dy], k) => (
              <circle key={k} cx={dx} cy={dy} r={7 - k} fill={KRP.red} opacity={0.8} />
            ))}
          </g>
        )}
        {/* めくりかけのページ角 + 手袋の手 */}
        <path d={`M 1584 816 L ${1584 - curl * 3.2} 816 Q ${1584 - curl * 1.4} ${816 - curl * 1.9} 1584 ${816 - curl * 2.6} Z`}
          fill={C.pageShade} stroke={C.ink} strokeWidth={4.5} />
        <g transform={`translate(${1596 - curl * 0.5} ${828 - curl * 1.2}) rotate(-24)`}>
          <ellipse cx={0} cy={0} rx={34} ry={26} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M -26 -14 Q -44 -26 -52 -12 Q -40 0 -24 2" fill={KRP.white}
            stroke={C.ink} strokeWidth={4.5} />
          <rect x={14} y={-18} width={56} height={44} rx={10} fill={KRP.white}
            stroke={C.ink} strokeWidth={5} />
          <line x1={58} y1={-16} x2={58} y2={26} stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
        </g>
      </g>
      <TagPlate x={1700} y={150} text="マナー帳" size={42} rot={3} t={seg(f, 4, 14)}
        fill={C.glow} />
      {/* 紅茶 (左下) */}
      <g transform="translate(180 920)">
        <ellipse cx={0} cy={44} rx={98} ry={22} fill={C.page} stroke={C.ink} strokeWidth={5.5} />
        <path d="M -56 -20 L 56 -20 L 44 36 L -44 36 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
        <path d="M 56 -10 q 36 10 0 34" fill="none" stroke={C.ink} strokeWidth={5.5} />
        <ellipse cx={0} cy={-20} rx={56} ry={12} fill="#B06A5A" stroke={C.ink} strokeWidth={4.5} />
        {[0, 1].map((k) => (
          <path key={k}
            d={`M ${-14 + k * 26} -44 q ${8 * Math.sin(f / 9 + k * 2)} -22 0 -44 q ${-8 * Math.sin(f / 9 + k * 2)} -20 0 -40`}
            fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round"
            opacity={0.4 + 0.15 * Math.sin(f / 7 + k)} />
        ))}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_065: (f) => <Sg065 f={f} />,
  sg_066: (f) => <Sg066 f={f} />,
  sg_067: (f) => <Sg067 f={f} />,
  sg_068: (f) => <Sg068 f={f} />,
  sg_069: (f) => <Sg069 f={f} />,
  sg_070: (f) => <Sg070 f={f} />,
  sg_071: (f) => <Sg071 f={f} />,
  sg_072: (f) => <Sg072 f={f} />,
  sg_073: (f) => <Sg073 f={f} />,
  sg_074: (f) => <Sg074 f={f} />,
  sg_075: (f) => <Sg075 f={f} />,
  sg_076: (f) => <Sg076 f={f} />,
};

export const S_B3_MOTIFS: string[] = [
  "sg_065", // #65
  "sg_066", // #66
  "sg_067", // #67
  "sg_068", // #68
  "sg_069", // #69
  "sg_070", // #70
  "sg_071", // #71
  "sg_072", // #72
  "sg_073", // #73
  "sg_074", // #74
  "sg_075", // #75
  "sg_076", // #76
];

export const saigoB3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
