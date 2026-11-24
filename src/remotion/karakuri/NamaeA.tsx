// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#1〜#9 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 実在の人物と映画の人物は顔を見せない (後ろ姿・シルエット)

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./NamaeShared";
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend, Ushiro } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // #1 夕暮れの映画館
  duskTop: "#3E3A6E", duskMid: "#C9708A", duskLow: "#F2B279",
  brick: "#B5654A", brickDark: "#8E4A36", awning: "#C8372D", awningDark: "#93261F",
  bulbOff: "#8C7B62", bulbOn: "#FFE27A", posterGlow: "#FFF8DE", street: "#6E6670", streetLine: "#8C8490",
  // #2 客席
  hall: "#2A2230", hallMid: "#3A3042", seat: "#8E2F35", seatDark: "#5E1E24", screen: "#FFFDF2", curtain: "#A3242C",
  hairBlack: "#2B2624", hairBrown: "#5B4030", hairGray: "#8D8880",
  // #3 机
  desk: "#B98A5A", deskDark: "#8E6540", film: "#3A3438", filmEdge: "#56505A",
  // #4 森
  forestDeep: "#244A33", forest: "#356B45", forestLight: "#5E9A5C", moss: "#6F9A4E", mossDark: "#4D7436",
  stone: "#8F9A7A", road: "#A8946E", roadDark: "#86724F", carSilver: "#C5CBD0", carDark: "#8A9298",
  tunnelWall: "#B4623F", tunnelWallDark: "#874529", tunnelMouth: "#1C1714", sunFleck: "#F6EFA6",
  // #5 食堂街
  night: "#231E33", lantern: "#D9452E", lanternDark: "#9E2A1C", glassA: "#5FA7A0", glassB: "#D9A93C", glassC: "#B9567A",
  stool: "#3F9E92", stoolDark: "#2B7066", counter: "#7E4A2E", counterTop: "#A0643C", meat: "#9C4A26", meatShine: "#E2874A",
  pig: "#F0A6A8", pigDark: "#C77A80", shadow: "#120E1A",
  // #5 豚 (くすんだ肉色) とはち切れた服の布
  pigFlesh: "#C4917F", pigFleshDark: "#93635A", pigFleshLight: "#DBB09C", pigHoof: "#4A3632",
  poloBlue: "#8EC3DE", poloBlueDark: "#5B8FAD", momPink: "#E7A3B4", momPinkDark: "#B66F82",
  // #9 湯婆婆の手 (少し黄みのある肌) とドレスの袖
  hagSkin: "#E3C08C", hagSkinDark: "#B8915C", hagSkinLight: "#F1D9AE", hagNail: "#F4E8CC",
  dressBlue: "#1F3566", dressBlueDark: "#132244",
  // #6 湯屋
  sky: "#1C2550", skyLow: "#33407A", roofTeal: "#2F6E6A", roofTealDark: "#1F4C4A", pillar: "#C23A2C", windowLit: "#FFC861",
  windowCore: "#FFE9A8", goldTrim: "#E0B13A", bridge: "#B8352A", bridgeDark: "#86231B", water: "#152044", steam: "#E8EEF2",
  // #7〜#9 最上階の部屋
  roomRed: "#7A1F22", roomRedDark: "#55141A", roomGreen: "#244D3C", roomGold: "#C9A23E", deskTop: "#6B3E22", deskFront: "#4E2A16",
  paperOld: "#EADBB0", paperOldDark: "#CBB77F", windowLight: "#FFF1C8", silhouette: "#1E1A22", ring: "#59D3E0", ringRed: "#E23B4E",
  senTop: "#D9735F",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;

// 一般の人の後ろ姿 (Person の頭を髪の色で塗りつぶして顔を隠す)
const NABack: React.FC<{
  x: number; y: number; s?: number; f: number; cloth: string; clothDark: string; hairC: string; phase?: number;
  pose?: "stand" | "hold"; long?: boolean; bag?: string;
}> = ({ x, y, s = 1, f, cloth, clothDark, hairC, phase = 0, pose = "stand", long = false, bag }) => {
  const sway = Math.sin((f + phase * 23) / 15) * 1.2;
  return (
    <g transform={`rotate(${sway} ${x} ${y})`}>
      <Person x={x} y={y} s={s} f={f} cloth={cloth} clothDark={clothDark} hair="none" still phase={phase} pose={pose} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {bag && <rect x={34} y={-150} width={50} height={64} rx={10} fill={bag} stroke={C.ink} strokeWidth={4.5} />}
        {[-1, 1].map((sd) => (
          <ellipse key={sd} cx={sd * 63} cy={-222} rx={10} ry={15} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        ))}
        <circle cx={0} cy={-228} r={66} fill={hairC} stroke={C.ink} strokeWidth={5.5} />
        {long && <path d="M -64 -228 Q -70 -150 -40 -130 L 40 -130 Q 70 -150 64 -228 Z" fill={hairC} stroke={C.ink} strokeWidth={5} />}
        <path d="M -36 -262 Q 0 -284 36 -262" stroke={KRP.white} strokeWidth={5} opacity={0.22} fill="none" />
        <path d="M -20 -176 Q 0 -168 20 -176" stroke={C.ink} strokeWidth={3} opacity={0.4} fill="none" />
      </g>
    </g>
  );
};

// 客席の後頭部 (肩から上)
const NAHeadBack: React.FC<{ x: number; y: number; r: number; hairC: string; shirt: string; lit: number; f: number; i: number }> = ({ x, y, r, hairC, shirt, lit, f, i }) => {
  const nod = Math.sin((f + i * 13) / 17) * 1.5;
  return (
    <g transform={`translate(${x} ${y + nod})`}>
      <path d={`M ${-r * 1.55} ${r * 2.2} Q ${-r * 1.5} ${r * 0.9} 0 ${r * 0.8} Q ${r * 1.5} ${r * 0.9} ${r * 1.55} ${r * 2.2} Z`} fill={shirt} stroke={C.ink} strokeWidth={4} />
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * r * 0.95} cy={r * 0.05} rx={r * 0.16} ry={r * 0.24} fill="#E9C9AE" stroke={C.ink} strokeWidth={3} />)}
      <circle cx={0} cy={0} r={r} fill={hairC} stroke={C.ink} strokeWidth={4.5} />
      <path d={`M ${-r * 0.7} ${-r * 0.55} Q 0 ${-r * 1.05} ${r * 0.7} ${-r * 0.55}`} stroke={C.screen} strokeWidth={Math.max(3, r * 0.12)} opacity={0.2 + 0.55 * lit} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #1 2001年に公開された、スタジオジブリの『千と千尋の神隠し』。
// 格: (指示書) / seed 4001
// 絵: (指示書を見る)
// どこ: 夕暮れの街角に建つ昭和〜平成初めの単館の映画館。赤いひさし・電飾・切符売り場の小窓・光るポスター枠
// 演出: 2001年の夏の夕方、電飾がひとつずつ点っていき、2001年ごろの服の人たちが入口へ行列する
// 動き: 電飾が左から順に点る (f2〜38) / 行列が少しずつ前へ詰める / カメラがゆっくり寄る / 縦看板のネオンが点く
const Nm001: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const neon = seg(f, 20, 30);
  const step = easeOut(seg(f, 4, 40)) * 26;
  const nBulb = 34;
  const bulbOn = (i: number) => clamp01((f - 2 - i * 1.05) / 3);
  const people = [
    { x: 1010, cloth: "#5E7FA8", dark: "#3E5A80", hair: C.hairBlack, bag: undefined as string | undefined, long: false },
    { x: 1150, cloth: "#E2A3B4", dark: "#B97888", hair: C.hairBrown, bag: KRP.yellow, long: true },
    { x: 1290, cloth: "#7F9A5E", dark: "#5C7442", hair: C.hairBlack, bag: undefined, long: false },
    { x: 1430, cloth: "#EDE6D6", dark: "#B8AE98", hair: C.hairBrown, bag: "#6E8FB8", long: true },
    { x: 1570, cloth: "#3E4B66", dark: "#2E3850", hair: C.hairGray, bag: undefined, long: false },
    { x: 1710, cloth: "#D98A4A", dark: "#A8662E", hair: C.hairBlack, bag: undefined, long: false },
  ];
  return (
    <Frame f={f} seed={4001} bg={C.duskTop}>
      <defs>
        <linearGradient id="na1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} /><stop offset="0.55" stopColor={C.duskMid} /><stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <radialGradient id="na1glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.bulbOn} stopOpacity={0.9} /><stop offset="1" stopColor={C.bulbOn} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(960 600) scale(${zoom}) translate(-960 -600)`}>
        {/* 夕空と雲 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#na1sky)" />
        {[[260, 120, 1], [1500, 90, 1.3], [880, 60, 0.8]].map(([cx, cy, k], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy}) scale(${k})`} opacity={0.55}>
            <ellipse cx={0} cy={0} rx={120} ry={22} fill={C.duskLow} /><ellipse cx={60} cy={-14} rx={70} ry={18} fill={C.duskLow} />
          </g>
        ))}
        {/* 両隣の古いビル (電線・窓) */}
        <rect x={-20} y={200} width={360} height={700} fill="#5A4A5E" stroke={C.ink} strokeWidth={6} />
        <rect x={1580} y={240} width={360} height={660} fill="#4E4458" stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => {
          const bx = i < 4 ? 30 + (i % 2) * 150 : 1630 + (i % 2) * 150;
          const by = 260 + Math.floor((i % 4) / 2) * 160;
          const lit = (i * 7 + 3) % 3 !== 0 && f > 6 + i * 4;
          return <rect key={i} x={bx} y={by} width={110} height={90} fill={lit ? C.bulbOn : "#3A3244"} stroke={C.ink} strokeWidth={4} opacity={lit ? 0.85 : 1} />;
        })}
        <path d="M -20 180 Q 480 240 960 150 Q 1440 230 1940 170" stroke={C.ink} strokeWidth={4} fill="none" />
        <path d="M -20 210 Q 480 270 960 180" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.7} />
        {/* 映画館の正面 (れんが) */}
        <rect x={340} y={150} width={1240} height={760} fill={C.brick} stroke={C.ink} strokeWidth={8} />
        <g stroke={C.brickDark} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 14 }, (_, r) => (
            <g key={r}>
              <line x1={340} y1={170 + r * 26} x2={1580} y2={170 + r * 26} />
              {Array.from({ length: 16 }, (_, c) => (
                <line key={c} x1={360 + c * 78 + (r % 2) * 39} y1={170 + r * 26} x2={360 + c * 78 + (r % 2) * 39} y2={196 + r * 26} />
              ))}
            </g>
          ))}
        </g>
        {/* 屋上の飾り縁 */}
        <path d="M 320 150 L 1600 150 L 1580 120 L 340 120 Z" fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
        <path d="M 820 120 Q 960 40 1100 120 Z" fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
        <circle cx={960} cy={98} r={20} fill={neon > 0 ? C.bulbOn : C.bulbOff} stroke={C.ink} strokeWidth={4} />
        {/* 縦の看板 (ネオン) */}
        <g transform="translate(1440 156)">
          <rect x={-60} y={0} width={120} height={196} rx={10} fill="#2C2638" stroke={C.ink} strokeWidth={6} />
          <rect x={-46} y={12} width={92} height={172} rx={6} fill="none" stroke={neon > 0 ? "#FF8FA3" : "#6A5A6E"} strokeWidth={6} opacity={0.4 + 0.6 * neon} />
          {["映", "画"].map((ch, i) => (
            <text key={ch} x={0} y={86 + i * 80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70}
              fill={neon > 0 ? "#FFE6EC" : "#7A6A7E"} opacity={0.5 + 0.5 * neon}>{ch}</text>
          ))}
          {neon > 0 && <rect x={-90} y={-20} width={180} height={236} fill="url(#na1glow)" opacity={0.35 * neon} />}
        </g>
        {/* 2階の窓 (映写室) */}
        {[540, 760, 1160].map((wx, i) => (
          <g key={i}>
            <rect x={wx} y={200} width={150} height={110} rx={6} fill="#3A3048" stroke={C.ink} strokeWidth={5} />
            <line x1={wx + 75} y1={200} x2={wx + 75} y2={310} stroke={C.ink} strokeWidth={4} />
            {i === 1 && <rect x={wx + 8} y={208} width={60} height={94} fill={C.bulbOn} opacity={0.35 + 0.15 * Math.sin(f / 5)} />}
          </g>
        ))}
        {/* 赤いひさし + 電飾 */}
        <path d="M 300 360 L 1620 360 L 1660 470 L 260 470 Z" fill={C.awning} stroke={C.ink} strokeWidth={8} />
        <path d="M 300 360 L 1620 360 L 1630 388 L 290 388 Z" fill={C.awningDark} opacity={0.6} />
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M ${260 + i * 127} 470 q 63 44 127 0`} fill={C.awningDark} stroke={C.ink} strokeWidth={5} />
        ))}
        {Array.from({ length: nBulb }, (_, i) => {
          const t = bulbOn(i);
          const bx = 290 + i * (1340 / (nBulb - 1));
          const tw = t >= 1 ? 0.85 + 0.15 * Math.sin(f / 3 + i) : t;
          return (
            <g key={i}>
              {t > 0 && <circle cx={bx} cy={440} r={26} fill="url(#na1glow)" opacity={tw} />}
              <circle cx={bx} cy={440} r={10} fill={t > 0.5 ? C.bulbOn : C.bulbOff} stroke={C.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 左右のポスター枠 (中身は描かず、光る白い四角) */}
        {[420, 1330].map((px, i) => (
          <g key={i}>
            <rect x={px - 14} y={510} width={198} height={290} rx={8} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
            <rect x={px} y={524} width={170} height={262} fill={C.posterGlow} stroke={C.ink} strokeWidth={4} />
            <rect x={px - 40} y={490} width={250} height={330} fill="url(#na1glow)" opacity={0.25 + 0.1 * Math.sin(f / 7 + i)} />
          </g>
        ))}
        {/* 入口 (ガラス戸・中の明かり) */}
        <rect x={690} y={500} width={420} height={400} fill="#FFD98A" stroke={C.ink} strokeWidth={7} />
        <rect x={690} y={500} width={420} height={400} fill="url(#na1glow)" opacity={0.6} />
        {[795, 900, 1005].map((dx) => <line key={dx} x1={dx} y1={500} x2={dx} y2={900} stroke={C.ink} strokeWidth={5} />)}
        <rect x={690} y={500} width={420} height={34} fill={C.brickDark} stroke={C.ink} strokeWidth={5} />
        {/* 切符売り場 (小窓・半円の穴・中に係員の影) */}
        <g transform="translate(1180 520)">
          <rect x={0} y={0} width={120} height={300} fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
          <rect x={14} y={40} width={92} height={110} rx={8} fill="#FFE9B0" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={60} cy={100} rx={26} ry={30} fill={C.silhouette} opacity={0.75} />
          <path d="M 34 150 Q 60 124 86 150 Z" fill={C.ink} />
          <rect x={-6} y={150} width={132} height={18} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 歩道 */}
        <rect x={-40} y={900} width={W + 80} height={240} fill={C.street} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={900} x2={i * 180 - 60} y2={1100} stroke={C.streetLine} strokeWidth={4} />)}
        {/* 入口からの光が歩道に落ちる */}
        <path d="M 690 900 L 1110 900 L 1240 1100 L 560 1100 Z" fill={C.bulbOn} opacity={0.22} />
        {/* 行列 (2001年ごろの服・後ろ姿) — 入口へ少しずつ詰める */}
        {people.map((p, i) => (
          <NABack key={i} x={p.x - step + (i === 0 ? -step * 0.6 : 0)} y={958 + (i % 2) * 6} s={0.82} f={f} phase={i}
            cloth={p.cloth} clothDark={p.dark} hairC={p.hair} bag={p.bag} long={p.long} />
        ))}
        {/* 手前の街灯 */}
        <g>
          <rect x={186} y={300} width={22} height={760} fill="#4A4250" stroke={C.ink} strokeWidth={5} />
          <path d="M 197 300 Q 197 250 260 250" stroke={C.ink} strokeWidth={10} fill="none" />
          <ellipse cx={270} cy={262} rx={36} ry={20} fill={f > 12 ? C.bulbOn : C.bulbOff} stroke={C.ink} strokeWidth={5} />
          {f > 12 && <circle cx={270} cy={270} r={80} fill="url(#na1glow)" opacity={0.5} />}
        </g>
      </g>
      {/* 年代札 (カメラの外に置いて端で切れないように) */}
      <TagPlate x={1700} y={110} text="2001年" size={50} t={seg(f, 6, 16)} fill={KRP.yellow} rot={-4} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #2 長いあいだ、日本でいちばん観られた映画でした。
// 格: (指示書) / seed 4002
// 絵: (指示書を見る)
// どこ: 映画館の中。客席を最後列のさらに後ろから見る。正面に白く光るスクリーンと赤い幕
// 演出: 満席の後頭部がずらり。通路の補助席にまで人。最後の1人が補助席に腰を下ろして、本当に満席になる
// 動き: スクリーンの光がだんだん強まり客席の頭の縁を照らす (f0〜30) / 通路の人がしゃがんで座る (f8〜26) / 札「満席」がぽんと出る / カメラがゆっくり下がる
const Nm002: React.FC<{ f: number }> = ({ f }) => {
  const lit = easeOut(seg(f, 0, 30));
  const cam = easeInOut(seg(f, 0, 42));
  const sit = easeInOut(seg(f, 8, 26));
  const flick = 0.92 + 0.08 * Math.sin(f / 2.3) * Math.sin(f / 5.1);
  const hairs = [C.hairBlack, C.hairBrown, C.hairBlack, C.hairGray, C.hairBlack, C.hairBrown];
  const shirts = ["#5E7FA8", "#E2A3B4", "#7F9A5E", "#EDE6D6", "#3E4B66", "#D98A4A", "#9B7BB0", "#C9DCEC"];
  // 列: y, 頭の半径, 人数
  const rows = [
    { y: 470, r: 20, n: 26 }, { y: 520, r: 25, n: 22 }, { y: 580, r: 31, n: 18 },
    { y: 650, r: 38, n: 15 }, { y: 732, r: 47, n: 12 },
  ];
  return (
    <Frame f={f} seed={4002} bg={C.hall} dark>
      <defs>
        <radialGradient id="na2beam" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor={C.screen} stopOpacity={0.55} /><stop offset="1" stopColor={C.screen} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(0 ${-cam * 18}) scale(${1 + cam * 0.03})`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 120} fill={C.hall} />
        {/* 天井と壁 (縦の吸音板) */}
        <path d="M -40 -40 L 1960 -40 L 1700 60 L 220 60 Z" fill={C.hallMid} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={-20 + (i < 5 ? i * 46 : 1700 + (i - 5) * 46)} y={60} width={40} height={520} fill={C.hallMid} stroke={C.ink} strokeWidth={3} opacity={0.8} />
          </g>
        ))}
        {/* 壁の小さな灯り */}
        {[120, 1800].map((lx, i) => (
          <g key={i}><path d={`M ${lx - 26} 300 L ${lx + 26} 300 L ${lx + 16} 330 L ${lx - 16} 330 Z`} fill={C.bulbOn} opacity={0.5 * (1 - lit) + 0.2} stroke={C.ink} strokeWidth={3} /></g>
        ))}
        {/* 幕とスクリーン */}
        <rect x={220} y={60} width={1480} height={400} fill={C.curtain} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={234 + i * 14} y1={60} x2={234 + i * 14} y2={460} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />)}
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={1616 + i * 14} y1={60} x2={1616 + i * 14} y2={460} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />)}
        <path d="M 220 60 L 1700 60 L 1700 110 Q 960 140 220 110 Z" fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <rect x={330} y={110} width={1260} height={330} fill={C.screen} stroke={C.ink} strokeWidth={6} opacity={0.35 + 0.65 * lit * flick} />
        {/* スクリーンの光が客席を照らす */}
        <path d="M 330 440 L 1590 440 L 1960 1100 L -40 1100 Z" fill="url(#na2beam)" opacity={lit * flick} />
        {/* 後ろの映写窓からの光の筋 */}
        <path d="M 900 -40 L 1020 -40 L 1590 110 L 330 110 Z" fill={C.screen} opacity={0.07 * lit} />
        {/* 段々の客席: 奥から手前へ */}
        {rows.map((row, ri) => {
          const span = 1600 - ri * 40 + ri * 120;
          const x0 = 960 - span / 2;
          const gap = span / row.n;
          return (
            <g key={ri}>
              <rect x={x0 - 60} y={row.y + row.r * 0.9} width={span + 120} height={row.r * 1.6} fill={C.seat} stroke={C.ink} strokeWidth={4} />
              {Array.from({ length: row.n }, (_, k) => {
                const hx = x0 + gap * (k + 0.5);
                if (Math.abs(hx - 960) < 40 + ri * 14) return null; // 通路
                return (
                  <NAHeadBack key={k} x={hx + (rnd(4002, ri * 40 + k) - 0.5) * gap * 0.2} y={row.y - rnd(4012, ri * 40 + k) * row.r * 0.25}
                    r={row.r * (0.9 + rnd(4022, ri * 40 + k) * 0.2)} hairC={hairs[(k + ri) % hairs.length]} shirt={shirts[(k * 3 + ri) % shirts.length]} lit={lit} f={f} i={ri * 40 + k} />
                );
              })}
              {/* 座席の背もたれ */}
              {Array.from({ length: row.n + 1 }, (_, k) => (
                <rect key={k} x={x0 + gap * k - row.r * 0.9} y={row.y + row.r * 1.3} width={row.r * 1.8} height={row.r * 1.3} rx={row.r * 0.3} fill={C.seatDark} stroke={C.ink} strokeWidth={3} />
              ))}
            </g>
          );
        })}
        {/* 手前の列 (いちばん後ろの席の背もたれ) */}
        <rect x={-40} y={890} width={W + 80} height={220} fill={C.seatDark} />
        {Array.from({ length: 8 }, (_, k) => (
          <g key={k}>
            <rect x={-60 + k * 280} y={880} width={250} height={240} rx={40} fill={C.seat} stroke={C.ink} strokeWidth={6} />
            <rect x={-40 + k * 280} y={900} width={210} height={30} rx={14} fill={C.seatDark} opacity={0.6} />
            <path d={`M ${-30 + k * 280} 890 Q ${65 + k * 280} 870 ${160 + k * 280} 890`} stroke={C.screen} strokeWidth={5} opacity={0.3 * lit} fill="none" />
          </g>
        ))}
        {/* 通路の補助席 (折りたたみ椅子) に座る人たち */}
        {[{ y: 580, r: 30 }, { y: 650, r: 37 }].map((a, i) => (
          <NAHeadBack key={i} x={960} y={a.y + 4} r={a.r} hairC={hairs[i + 2]} shirt={shirts[i + 5]} lit={lit} f={f} i={90 + i} />
        ))}
        {/* 最後の1人: 立っていて、補助席にすとんと座る */}
        <g>
          <rect x={920} y={790} width={80} height={60} rx={6} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
          <NAHeadBack x={960} y={lerp(600, 724, sit)} r={48} hairC={C.hairBrown} shirt="#E2A3B4" lit={lit} f={f} i={99} />
          {f > 26 && f < 36 && [-1, 1].map((sd) => (
            <path key={sd} d={`M ${960 + sd * 70} 760 l ${sd * 30} -10`} stroke={C.screen} strokeWidth={5} strokeLinecap="round" opacity={(36 - f) / 10} />
          ))}
        </g>
      </g>
      {/* 満席の札 (出口灯の横のプレート) */}
      <TagPlate x={1790} y={210} text="満席" size={56} t={seg(f, 26, 36)} fill={KRP.red} color={KRP.white} rot={3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #3 まずは、ざっくりあらすじを。
// 格: (指示書) / seed 4003
// 絵: (指示書を見る)
// どこ: 映写技師の木の作業机 (真上から)。左に大きなフィルムのリール、右奥に小さな映写機、湯のみ・はさみ・フィルムの切れ端
// 演出: リールがくるくる回ってフィルムがほどけ、6つのコマが横一列に並ぶ。コマが1つずつ灯る = あらすじの目次
// 動き: リールの回転 / フィルムが右へ伸びる (f0〜16) / コマが順に灯る (f14〜40) / 映写機のランプが点滅 / カメラが右へパン
const Nm003: React.FC<{ f: number }> = ({ f }) => {
  const unroll = easeOut(seg(f, 0, 16));
  const pan = easeInOut(seg(f, 0, 42));
  const rot = f * 6 * (1 - seg(f, 14, 22) * 0.9);
  const frameCols = [C.forest, C.lantern, C.roofTeal, C.roomRed, C.paperOldDark, NP.glow];
  const frameX = (i: number) => 630 + i * 190;
  const stripEnd = lerp(440, 1820, unroll);
  return (
    <Frame f={f} seed={4003} bg={C.desk}>
      <g transform={`translate(${-pan * 30} 0)`}>
        {/* 机の木目 */}
        <rect x={-40} y={-40} width={W + 120} height={H + 80} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.45} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -40 ${50 + i * 140} q 500 ${rnd(4003, i) * 40 - 20} 1000 0 q 500 ${rnd(4013, i) * 40 - 20} 1040 0`} />
          ))}
          <ellipse cx={1500} cy={900} rx={60} ry={22} />
          <ellipse cx={1500} cy={900} rx={30} ry={10} />
        </g>
        {/* 机の上の作業マット */}
        <rect x={120} y={260} width={1760} height={540} rx={14} fill="#5F6F5A" stroke={C.ink} strokeWidth={6} opacity={0.9} />
        <g stroke="#7E8E78" strokeWidth={2} opacity={0.7}>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={140 + i * 80} y1={270} x2={140 + i * 80} y2={790} />)}
        </g>
        {/* フィルムの帯 (ほどけて右へ) */}
        <g>
          <rect x={440} y={430} width={stripEnd - 440} height={200} fill={C.film} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 40 }, (_, i) => {
            const hx = 452 + i * 36;
            if (hx > stripEnd - 20) return null;
            return (
              <g key={i}>
                <rect x={hx} y={442} width={20} height={16} rx={3} fill={C.desk} />
                <rect x={hx} y={602} width={20} height={16} rx={3} fill={C.desk} />
              </g>
            );
          })}
          {/* 6つのコマ (中身は無地の色) */}
          {frameCols.map((col, i) => {
            const fx = frameX(i);
            if (fx + 170 > stripEnd) return null;
            const on = easeOut(seg(f, 14 + i * 4.4, 20 + i * 4.4));
            return (
              <g key={i}>
                {on > 0 && <rect x={fx - 18} y={452} width={206} height={156} rx={12} fill={NP.glow} opacity={0.45 * on} />}
                <rect x={fx} y={470} width={170} height={120} rx={6} fill={col} stroke={C.ink} strokeWidth={4}
                  opacity={0.28 + 0.72 * on} />
                <rect x={fx + 10} y={478} width={60} height={14} rx={5} fill={KRP.white} opacity={0.35 * on} />
                <text x={fx + 152} y={582} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white} opacity={0.4 + 0.6 * on}>{i + 1}</text>
              </g>
            );
          })}
          {/* 帯の先っぽ (くるっと巻き癖) */}
          <path d={`M ${stripEnd} 430 q 40 0 40 40 q 0 40 -40 40`} fill="none" stroke={C.ink} strokeWidth={5} opacity={unroll < 1 ? 1 : 0.6} />
        </g>
        {/* リール (左・大きく) */}
        <g transform={`translate(330 530) rotate(${rot})`}>
          <circle r={250} fill={KRP.silver} stroke={C.ink} strokeWidth={8} />
          <circle r={226} fill={C.film} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <circle key={i} r={226 - i * 22} fill="none" stroke={C.filmEdge} strokeWidth={3} />)}
          <circle r={96} fill={KRP.silver} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 3 }, (_, i) => {
            const a = (i / 3) * Math.PI * 2;
            return <ellipse key={i} cx={Math.cos(a) * 160} cy={Math.sin(a) * 160} rx={54} ry={36} fill={C.desk} stroke={C.ink} strokeWidth={5}
              transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 160} ${Math.sin(a) * 160})`} />;
          })}
          <circle r={30} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          <rect x={-8} y={-30} width={16} height={18} fill={C.ink} />
        </g>
        <TagPlate x={330} y={830 - 34 * 0.85 - 8} text="REEL 1" size={34} rot={-3} />
        {/* 映写機 (右奥・小さく) */}
        <g transform="translate(1620 160)">
          <circle cx={-60} cy={-20} r={50} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          <circle cx={60} cy={-20} r={50} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          {[-60, 60].map((cx) => <line key={cx} x1={cx} y1={-20} x2={cx + Math.cos(f / 3) * 40} y2={-20 + Math.sin(f / 3) * 40} stroke={C.ink} strokeWidth={4} />)}
          <rect x={-110} y={20} width={220} height={90} rx={12} fill="#4F5A66" stroke={C.ink} strokeWidth={6} />
          <rect x={110} y={44} width={50} height={40} rx={6} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          <circle cx={168} cy={64} r={14} fill={Math.sin(f / 2) > 0 ? NP.glow : "#9A8E6A"} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 小物: 湯のみ・はさみ・切れ端・虫めがね */}
        <g transform="translate(1180 160)">
          <circle r={58} fill="#6B8E86" stroke={C.ink} strokeWidth={6} />
          <circle r={42} fill="#7A5236" stroke={C.ink} strokeWidth={3} />
          <path d={`M -10 -50 q ${Math.sin(f / 6) * 10} -30 0 -60`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6} />
        </g>
        <g transform="translate(860 900) rotate(-18)">
          <line x1={0} y1={0} x2={170} y2={-6} stroke={KRP.silver} strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={0} x2={170} y2={14} stroke={KRP.silver} strokeWidth={14} strokeLinecap="round" />
          <circle cx={-26} cy={-14} r={22} fill="none" stroke={KRP.red} strokeWidth={10} />
          <circle cx={-26} cy={22} r={22} fill="none" stroke={KRP.red} strokeWidth={10} />
        </g>
        <g transform="translate(1340 930) rotate(12)">
          <rect x={0} y={0} width={150} height={60} fill={C.film} stroke={C.ink} strokeWidth={4} />
          <rect x={20} y={12} width={50} height={36} fill={C.forestLight} opacity={0.6} />
          <rect x={84} y={12} width={50} height={36} fill={C.forestLight} opacity={0.6} />
        </g>
        <g transform="translate(260 960) rotate(-30)">
          <circle r={46} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={7} opacity={0.85} />
          <rect x={44} y={-10} width={120} height={20} rx={8} fill={C.deskDark} stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #4 10歳の女の子、千尋は、引っ越しの途中で、両親と一緒に不思議な町に迷いこみます。
// 格: (指示書) / seed 4004
// 絵: (指示書を見る)
// どこ: 深い緑の森の一本道。道の真ん中に苔むした丸い石像、右に止めた銀色の車、奥に赤茶の壁の建物と黒いトンネルの口
// 演出: 父と母はトンネルへ歩き出し、小さな千尋だけが少し遅れて立ち止まる (体を引く)。落ち葉が風でトンネルへ吸いこまれていく
// 動き: 木漏れ日の斑点が流れる / 落ち葉がトンネルへ吸いこまれる / 両親が歩く・千尋は f20 で止まる / カメラがトンネルへ寄る
const Nm004: React.FC<{ f: number }> = ({ f }) => {
  const push = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.09 * push;
  const walk = easeOut(seg(f, 0, 40));
  const chiWalk = f < 20;
  const mx = 960, my = 400; // トンネルの口
  return (
    <Frame f={f} seed={4004} bg={C.forestDeep}>
      <defs>
        <linearGradient id="na4road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.roadDark} /><stop offset="1" stopColor={C.road} />
        </linearGradient>
        <radialGradient id="na4fleck" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.sunFleck} stopOpacity={0.75} /><stop offset="1" stopColor={C.sunFleck} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${mx} ${my}) scale(${zoom}) translate(${-mx} ${-my})`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.forestDeep} />
        {/* 奥の空の切れ間 */}
        <path d="M 700 -40 Q 960 140 1240 -40 Z" fill="#CFE3C8" opacity={0.6} />
        {/* 奥の木々 (遠い・青み) */}
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={560 + i * 72} cy={150 + rnd(4004, i) * 60} rx={70} ry={110} fill={C.forest} stroke={C.ink} strokeWidth={4} opacity={0.9} />
        ))}
        {/* トンネルの建物 (赤茶のしっくい・時計台風の塔・黒いアーチ) */}
        <g>
          <rect x={920} y={70} width={80} height={110} fill={C.tunnelWall} stroke={C.ink} strokeWidth={5} />
          <path d="M 905 70 L 960 30 L 1015 70 Z" fill={C.roofTealDark} stroke={C.ink} strokeWidth={5} />
          <circle cx={960} cy={118} r={24} fill={C.paperOld} stroke={C.ink} strokeWidth={4} />
          <line x1={960} y1={118} x2={960} y2={102} stroke={C.ink} strokeWidth={3} />
          <line x1={960} y1={118} x2={972} y2={122} stroke={C.ink} strokeWidth={3} />
          <path d="M 760 470 L 760 200 Q 960 150 1160 200 L 1160 470 Z" fill={C.tunnelWall} stroke={C.ink} strokeWidth={6} />
          <path d="M 740 205 Q 960 150 1180 205 L 1180 180 Q 960 128 740 180 Z" fill={C.tunnelWallDark} stroke={C.ink} strokeWidth={5} />
          {/* しっくいのしみ・はがれ */}
          {[[800, 260, 30], [1110, 300, 24], [820, 400, 20], [1100, 420, 34]].map(([sx, sy, r], i) => (
            <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.6} fill={C.tunnelWallDark} opacity={0.5} />
          ))}
          <path d="M 860 470 L 860 330 Q 960 250 1060 330 L 1060 470 Z" fill={C.tunnelMouth} stroke={C.ink} strokeWidth={6} />
          <path d="M 850 330 Q 960 236 1070 330" fill="none" stroke={C.paperOldDark} strokeWidth={10} />
          {/* 口の奥にかすかな明かり */}
          <ellipse cx={960} cy={440} rx={30} ry={18} fill={C.sunFleck} opacity={0.25 + 0.1 * Math.sin(f / 6)} />
        </g>
        {/* 道 */}
        <path d="M 860 470 L 1060 470 L 1700 1140 L 220 1140 Z" fill="url(#na4road)" stroke={C.ink} strokeWidth={6} />
        <path d="M 900 470 L 640 1140 M 1020 470 L 1280 1140" stroke={C.roadDark} strokeWidth={4} opacity={0.5} />
        {/* 道の小石 */}
        {Array.from({ length: 18 }, (_, i) => {
          const u = rnd(4104, i), v = rnd(4114, i);
          const py = 520 + v * 560;
          const half = 100 + (py - 470) * 1.1;
          return <ellipse key={i} cx={960 + (u - 0.5) * 2 * half * 0.9} cy={py} rx={6 + v * 10} ry={4 + v * 6} fill={C.roadDark} stroke={C.ink} strokeWidth={2} />;
        })}
        {/* 両側の大きな木 (幹・根・葉のかたまり) */}
        {[
          [120, 980, 1.3], [420, 760, 1.0], [620, 560, 0.7], [1800, 980, 1.3], [1500, 760, 1.0], [1300, 560, 0.7],
        ].map(([tx, ty, k], i) => (
          <g key={i} transform={`translate(${tx} ${ty}) scale(${k})`}>
            <path d="M -40 0 Q -30 -300 -36 -620 L 36 -620 Q 30 -300 40 0 Q 70 10 90 20 L -90 20 Q -70 10 -40 0 Z" fill="#5A4430" stroke={C.ink} strokeWidth={6} />
            <path d="M -10 -80 Q -6 -300 -14 -560" stroke="#3E2E20" strokeWidth={5} fill="none" />
            <path d="M -36 -200 q -20 -10 -30 -30" stroke={C.mossDark} strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* 頭上の葉の天井 */}
        {Array.from({ length: 16 }, (_, i) => {
          const lx = i < 8 ? -40 + i * 100 : 1260 + (i - 8) * 100;
          const ly = -20 + rnd(4204, i) * 260;
          const sw = Math.sin(f / 18 + i) * 5;
          return <ellipse key={i} cx={lx + sw} cy={ly} rx={150} ry={120} fill={i % 3 ? C.forest : C.forestLight} stroke={C.ink} strokeWidth={5} />;
        })}
        {/* 下草 */}
        {Array.from({ length: 20 }, (_, i) => {
          const gx = i < 10 ? i * 30 + 150 + (i % 2) * 20 : 1500 + (i - 10) * 30;
          return <path key={i} d={`M ${gx} 1080 q ${-10 + Math.sin(f / 10 + i) * 6} -60 ${-4} -110`} stroke={C.moss} strokeWidth={8} fill="none" strokeLinecap="round" />;
        })}
        {/* 苔むした丸い石像 (道の真ん中寄り・左) */}
        <g transform="translate(660 800)">
          <ellipse cx={0} cy={6} rx={120} ry={22} fill={C.ink} opacity={0.25} />
          <rect x={-90} y={-40} width={180} height={46} rx={8} fill={C.stone} stroke={C.ink} strokeWidth={5} />
          <path d="M -86 -40 Q -110 -250 0 -260 Q 110 -250 86 -40 Z" fill={C.moss} stroke={C.ink} strokeWidth={6} />
          {/* 苔のまだら */}
          {[[-40, -200, 26], [30, -140, 34], [-50, -90, 22], [50, -220, 18], [0, -60, 28]].map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.7} fill={C.mossDark} opacity={0.7} />
          ))}
          {/* にやりと笑う顔の彫り (石の彫り込み) */}
          <path d="M -44 -170 q 14 -12 28 0 M 16 -170 q 14 -12 28 0" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -52 -122 Q 0 -80 52 -122" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M -60 -26 L 60 -26" stroke={C.ink} strokeWidth={3} opacity={0.4} />
        </g>
        {/* 銀色の車 (後ろから・ロゴなし) */}
        <g transform="translate(1340 820)">
          <ellipse cx={0} cy={8} rx={210} ry={24} fill={C.ink} opacity={0.3} />
          <path d="M -170 -230 Q -150 -300 -60 -306 L 60 -306 Q 150 -300 170 -230 Z" fill={C.carSilver} stroke={C.ink} strokeWidth={6} />
          <path d="M -140 -236 Q -124 -286 -54 -290 L 54 -290 Q 124 -286 140 -236 Z" fill="#53606E" stroke={C.ink} strokeWidth={4} />
          <path d="M -90 -280 L -60 -240" stroke={KRP.white} strokeWidth={6} opacity={0.4} />
          <rect x={-200} y={-232} width={400} height={170} rx={30} fill={C.carSilver} stroke={C.ink} strokeWidth={6} />
          <rect x={-200} y={-150} width={400} height={20} fill={C.carDark} opacity={0.6} />
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <rect x={sd > 0 ? 130 : -186} y={-206} width={56} height={34} rx={8} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
              <rect x={sd * 150 - 32} y={-66} width={64} height={70} rx={14} fill={C.ink} />
            </g>
          ))}
          <rect x={-60} y={-130} width={120} height={36} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <rect x={-190} y={-96} width={380} height={30} rx={10} fill={C.carDark} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 木漏れ日の斑点が流れる */}
        {Array.from({ length: 12 }, (_, i) => {
          const px = 400 + rnd(4304, i) * 1100 + Math.sin(f / 20 + i) * 30;
          const py = 560 + rnd(4314, i) * 480;
          return <ellipse key={i} cx={px} cy={py} rx={50 + rnd(4324, i) * 40} ry={18 + rnd(4334, i) * 10} fill="url(#na4fleck)" opacity={0.6 + 0.4 * Math.sin(f / 9 + i * 2)} />;
        })}
        {/* 3人の後ろ姿: 両親はトンネルへ歩く・千尋は遅れて立ち止まる */}
        <Ushiro kind="father" x={880 - walk * 40} y={830 - walk * 120} s={1.12 - walk * 0.16} walk f={f} />
        <Ushiro kind="mother" x={1080 - walk * 30} y={834 - walk * 120} s={1.02 - walk * 0.14} walk f={f + 7} />
        <Ushiro kind="chihiro" x={990 - easeOut(seg(f, 0, 20)) * 14} y={900} s={0.78} walk={chiWalk} f={f} turn={chiWalk ? 0 : -0.6} />
        {/* 千尋の頭の左の空いた所: 年齢札 (誰の体にも重ねない) + 千尋を指す細い引き出し線 */}
        {(() => {
          const tt = seg(f, 22, 30); // 両親が先へ歩いてから出す (父の足に重ねない)
          // 札は y=760 (ズーム1.09後の下端 ≈ 811 < 830)
          return (
            <g>
              <path d="M 878 770 Q 905 772 928 752" stroke={KRP.white} strokeWidth={4} fill="none" strokeLinecap="round" opacity={tt} />
              <circle cx={930} cy={750} r={5} fill={KRP.white} opacity={tt} />
              <TagPlate x={818} y={760} text="10歳" size={30} t={tt} fill={KRP.yellow} />
            </g>
          );
        })()}
        {/* 立ち止まった「!」の線 (千尋の頭の上) */}
        {f > 22 && [-1, 0, 1].map((k) => (
          <line key={k} x1={984 + k * 34} y1={690} x2={984 + k * 46} y2={668} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={clamp01((f - 22) / 6)} />
        ))}
        {/* 落ち葉がトンネルへ吸いこまれる */}
        {Array.from({ length: 16 }, (_, i) => {
          const p = (f / 60 + rnd(4404, i)) % 1;
          const sx = rnd(4414, i) < 0.5 ? 100 + rnd(4424, i) * 300 : 1500 + rnd(4434, i) * 300;
          const sy = 600 + rnd(4444, i) * 400;
          const q = easeInOut(p);
          const lx = lerp(sx, mx, q) + Math.sin(p * 9 + i) * 40 * (1 - q);
          const ly = lerp(sy, my + 40, q) - Math.sin(p * Math.PI) * 120;
          const k = 1 - q * 0.8;
          return (
            <g key={i} transform={`translate(${lx} ${ly}) rotate(${f * 9 + i * 40}) scale(${k})`} opacity={1 - q * 0.6}>
              <path d="M 0 -16 Q 14 0 0 16 Q -14 0 0 -16 Z" fill={i % 3 === 0 ? KRP.orange : i % 3 === 1 ? KRP.yellow : C.forestLight} stroke={C.ink} strokeWidth={3} />
              <line x1={0} y1={-12} x2={0} y2={14} stroke={C.ink} strokeWidth={2} />
            </g>
          );
        })}
        {/* 風の線 */}
        {[0, 1, 2].map((k) => {
          const p = (f / 30 + k / 3) % 1;
          return <path key={k} d={`M ${lerp(300, 840, p)} ${lerp(700 + k * 60, 430, p)} q 60 -20 120 -6`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.5 * Math.sin(p * Math.PI)} strokeLinecap="round" />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #5 両親は、そこにあった食べ物を勝手に食べて、豚になってしまいます。
// 格: (指示書) / seed 4005
// 絵: (指示書を見る)
// どこ: 夜の食堂街の店先。軒の上にずらりと赤い提灯、色ガラスの窓、カウンターに山盛りの料理、青緑の丸椅子、奥は湯気
// 演出: カウンターにかぶりつく父 (水色) と母 (ピンク) の背中が、ぶくっとふくらんで煙とともに豚の背中に変わる。服は破れた布切れだけ残る。壁の影が何倍にも伸び、手前で千尋が立ちすくむ
// 動き: 食べる背中が小刻みにゆれる (f0〜18) / ふくらむ (f12〜22) / 煙で変身 (f20〜34) / 壁の影が伸びる / カメラが引いて小さく揺れる
const Nm005: React.FC<{ f: number }> = ({ f }) => {
  const swell = easeInOut(seg(f, 10, 22));
  const human = 1 - seg(f, 23, 26);
  const pigT = seg(f, 22, 32);
  const smoke = seg(f, 20, 38);
  const shadowK = 1 + 1.6 * easeOut(seg(f, 22, 38));
  const shake = f > 21 && f < 30 ? Math.sin(f * 3.1) * 6 : 0;
  const zoom = lerp(1.06, 1, easeOut(seg(f, 20, 34)));
  const munch = Math.sin(f / 2.2) * 4 * human;
  const parents = [
    { kind: "father" as const, x: 750, s: 1.3, rx: 236, ry: 222, cloth: C.poloBlue, clothDark: C.poloBlueDark },
    { kind: "mother" as const, x: 1250, s: 1.15, rx: 204, ry: 196, cloth: C.momPink, clothDark: C.momPinkDark },
  ];
  return (
    <Frame f={f} seed={4005} bg={C.night} dark>
      <defs>
        <radialGradient id="na5lan" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFB060" stopOpacity={0.8} /><stop offset="1" stopColor="#FFB060" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${960 + shake} 540) scale(${zoom}) translate(-960 -540)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.night} />
        {/* 店の奥の壁 (しっくい・柱) */}
        <rect x={-40} y={140} width={W + 80} height={440} fill="#5C3A34" stroke={C.ink} strokeWidth={6} />
        {[100, 520, 1400, 1820].map((px) => <rect key={px} x={px - 20} y={140} width={40} height={440} fill={C.counter} stroke={C.ink} strokeWidth={5} />)}
        {/* 色ガラスの窓 (ステンドグラス風) */}
        {[310, 1610].map((wx, wi) => (
          <g key={wi} transform={`translate(${wx} 190)`}>
            <rect x={-150} y={0} width={300} height={250} rx={8} fill={C.ink} stroke={C.ink} strokeWidth={6} />
            {Array.from({ length: 12 }, (_, i) => {
              const cx = -150 + (i % 4) * 75, cy = Math.floor(i / 4) * 83;
              const col = [C.glassA, C.glassB, C.glassC][(i + wi) % 3];
              return <rect key={i} x={cx + 5} y={cy + 5} width={65} height={73} fill={col} opacity={0.75 + 0.2 * Math.sin(f / 8 + i)} />;
            })}
            <circle cx={0} cy={125} r={50} fill="none" stroke={C.ink} strokeWidth={8} />
          </g>
        ))}
        {/* 壁に映る影 (ふくらんで何倍にも伸びる) */}
        {parents.map((p, i) => (
          <ellipse key={i} cx={p.x + (p.x - 960) * 0.3 * (shadowK - 1)} cy={480 - 60 * (shadowK - 1)}
            rx={p.rx * 0.7 * shadowK} ry={p.ry * 0.8 * shadowK} fill={C.shadow} opacity={0.5} />
        ))}
        {/* 奥の湯気 */}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${700 + i * 100} 520 q ${20 + Math.sin(f / 7 + i) * 14} -60 0 -120 q -20 -60 0 -120`} stroke={KRP.white} strokeWidth={14} fill="none" opacity={0.25} strokeLinecap="round" />
        ))}
        {/* 軒と一列の赤い提灯 */}
        <rect x={-40} y={60} width={W + 80} height={80} fill="#3A2A30" stroke={C.ink} strokeWidth={6} />
        <path d="M -40 40 Q 960 100 1960 40" stroke={C.ink} strokeWidth={5} fill="none" />
        {Array.from({ length: 13 }, (_, i) => {
          const lx = 40 + i * 152;
          const ly = 70 + Math.sin(i * 0.9) * 6;
          const sw = Math.sin(f / 16 + i) * 3;
          return (
            <g key={i} transform={`rotate(${sw} ${lx} ${ly - 30})`}>
              <circle cx={lx} cy={ly + 30} r={80} fill="url(#na5lan)" />
              <rect x={lx - 22} y={ly - 22} width={44} height={14} fill={C.ink} />
              <ellipse cx={lx} cy={ly + 30} rx={46} ry={56} fill={C.lantern} stroke={C.ink} strokeWidth={5} />
              {[-1, 0, 1].map((k) => <path key={k} d={`M ${lx - 44} ${ly + 30 + k * 20} Q ${lx} ${ly + 36 + k * 20} ${lx + 44} ${ly + 30 + k * 20}`} stroke={C.lanternDark} strokeWidth={3} fill="none" />)}
              <rect x={lx - 22} y={ly + 82} width={44} height={12} fill={C.ink} />
              <line x1={lx} y1={ly + 94} x2={lx} y2={ly + 120} stroke={KRP.yellow} strokeWidth={4} />
            </g>
          );
        })}
        {/* カウンター */}
        <rect x={-40} y={560} width={W + 80} height={40} fill={C.counterTop} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={600} width={W + 80} height={240} fill={C.counter} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={600} x2={i * 170} y2={840} stroke={C.ink} strokeWidth={3} opacity={0.4} />)}
        {/* 山盛りの料理 (照りのある肉・点心・どんぶり) */}
        {[[420, 1.0], [600, 0.8], [1460, 0.9], [1010, 0.85]].map(([dx, k], i) => (
          <g key={i} transform={`translate(${dx} 560) scale(${k})`}>
            <ellipse cx={0} cy={0} rx={110} ry={22} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
            {i % 2 === 0 ? (
              <g>
                <path d="M -80 -6 Q -70 -90 0 -96 Q 70 -90 80 -6 Z" fill={C.meat} stroke={C.ink} strokeWidth={5} />
                <path d="M -40 -60 Q -10 -80 30 -64" stroke={C.meatShine} strokeWidth={9} fill="none" strokeLinecap="round" />
                <rect x={60} y={-80} width={14} height={60} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={4} transform="rotate(30 67 -50)" />
              </g>
            ) : (
              <g>
                {[-50, 0, 50, -25, 25].map((bx, j) => (
                  <ellipse key={j} cx={bx} cy={j < 3 ? -24 : -56} rx={28} ry={22} fill="#F5EBD8" stroke={C.ink} strokeWidth={4} />
                ))}
              </g>
            )}
            <path d={`M -20 -100 q ${8 + Math.sin(f / 5 + i) * 6} -24 0 -48`} stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.5} />
          </g>
        ))}
        {/* 人の背中 (前半) — 食べながら小刻みにゆれ、ふくらむ */}
        {human > 0 && parents.map((p, i) => (
          <g key={p.kind} opacity={human}
            transform={`translate(${p.x} 790) scale(${1 + swell * 0.35} ${1 + swell * 0.12}) translate(${-p.x} -790) translate(0 ${munch * (i ? -1 : 1)})`}>
            <Ushiro kind={p.kind} x={p.x} y={800} s={p.s} f={f} />
          </g>
        ))}
        {/* 豚の背中 (後半) — 顔は描かず、背中と耳の先だけ */}
        {pigT > 0 && parents.map((p, i) => {
          // 重たく現れる (弾ませない): 少し小さい所から沈みこむように大きくなる
          const appear = easeOut(pigT);
          const k = lerp(0.88, 1, appear);
          const breathe = Math.sin(f / 7 + i) * 0.012;
          // むさぼる: 前 (カウンター側=上) へ頭を突っこむたびに背中が沈む
          const gobble = Math.max(0, Math.sin(f / 3.2 + i * 1.7)) * 8 * appear;
          const cy = 640;
          const { rx, ry } = p;
          const body = `M ${-rx * 1.06} ${ry * 0.72}
            C ${-rx * 1.24} ${ry * 0.05} ${-rx * 1.02} ${-ry * 0.7} ${-rx * 0.5} ${-ry * 0.9}
            Q 0 ${-ry * 1.04} ${rx * 0.5} ${-ry * 0.9}
            C ${rx * 1.02} ${-ry * 0.7} ${rx * 1.24} ${ry * 0.05} ${rx * 1.06} ${ry * 0.72}
            Q 0 ${ry * 1.02} ${-rx * 1.06} ${ry * 0.72} Z`;
          // はち切れた服の名残 (布として。裂けたぎざぎざの縁・しわ・肩にかかる)
          const ragL = `M ${-rx * 0.62} ${-ry * 0.86}
            Q ${-rx * 0.98} ${-ry * 0.66} ${-rx * 1.1} ${-ry * 0.12}
            L ${-rx * 0.98} ${-ry * 0.02} L ${-rx * 0.9} ${-ry * 0.2} L ${-rx * 0.8} ${-ry * 0.04} L ${-rx * 0.72} ${-ry * 0.26}
            L ${-rx * 0.6} ${-ry * 0.16} L ${-rx * 0.52} ${-ry * 0.4} L ${-rx * 0.4} ${-ry * 0.34} L ${-rx * 0.36} ${-ry * 0.6}
            Q ${-rx * 0.46} ${-ry * 0.8} ${-rx * 0.62} ${-ry * 0.86} Z`;
          const ragR = `M ${rx * 0.44} ${-ry * 0.92}
            Q ${rx * 0.86} ${-ry * 0.8} ${rx * 1.0} ${-ry * 0.46}
            L ${rx * 0.9} ${-ry * 0.36} L ${rx * 0.84} ${-ry * 0.5} L ${rx * 0.74} ${-ry * 0.38} L ${rx * 0.68} ${-ry * 0.58}
            L ${rx * 0.56} ${-ry * 0.5} L ${rx * 0.5} ${-ry * 0.7}
            Q ${rx * 0.42} ${-ry * 0.82} ${rx * 0.44} ${-ry * 0.92} Z`;
          return (
            <g key={p.kind} opacity={clamp01(pigT * 2.5)}
              transform={`translate(${p.x} ${cy - gobble}) scale(${k * (1 + breathe)} ${k * (1 - breathe) * (1 - gobble * 0.004)})`}>
              {/* 耳の先 (小さく・前へ垂れる。肩の山の向こうにのぞくだけ) */}
              {[-1, 1].map((sd) => (
                <path key={sd} d={`M ${sd * rx * 0.16} ${-ry * 0.94} Q ${sd * rx * 0.24} ${-ry * 1.16} ${sd * rx * 0.36} ${-ry * 1.1} Q ${sd * rx * 0.4} ${-ry * 1.0} ${sd * rx * 0.34} ${-ry * 0.9} Z`}
                  fill={C.pigFleshDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              ))}
              {/* 椅子からはみ出す後ろ足 (太い・黒ずんだひづめ) */}
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <path d={`M ${sd * rx * 0.86 - 44} ${ry * 0.62} Q ${sd * rx * 0.88} ${ry * 0.5} ${sd * rx * 0.86 + 44} ${ry * 0.62} L ${sd * rx * 0.86 + 34} ${ry * 0.98} L ${sd * rx * 0.86 - 34} ${ry * 0.98} Z`}
                    fill={C.pigFleshDark} stroke={C.ink} strokeWidth={5} />
                  <path d={`M ${sd * rx * 0.86 - 36} ${ry * 0.96} L ${sd * rx * 0.86 + 36} ${ry * 0.96} L ${sd * rx * 0.86 + 30} ${ry * 0.96 + 30} L ${sd * rx * 0.86 - 30} ${ry * 0.96 + 30} Z`} fill={C.pigHoof} stroke={C.ink} strokeWidth={4} />
                  <line x1={sd * rx * 0.86} y1={ry * 0.96 + 4} x2={sd * rx * 0.86} y2={ry * 0.96 + 30} stroke={C.ink} strokeWidth={4} />
                </g>
              ))}
              {/* ずっしりした背中 (下へ広がって椅子にのしかかる) */}
              <path d={body} fill={C.pigFlesh} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
              {/* 陰 (下半分と脇を暗く=重さ) */}
              <path d={`M ${-rx * 1.1} ${ry * 0.3} Q ${-rx * 0.5} ${ry * 0.5} 0 ${ry * 0.52} Q ${rx * 0.5} ${ry * 0.5} ${rx * 1.1} ${ry * 0.3} L ${rx * 1.06} ${ry * 0.72} Q 0 ${ry * 1.02} ${-rx * 1.06} ${ry * 0.72} Z`}
                fill={C.pigFleshDark} opacity={0.45} />
              {/* 肩の山のにぶい照り (提灯の明かり) */}
              <path d={`M ${-rx * 0.42} ${-ry * 0.74} Q 0 ${-ry * 0.9} ${rx * 0.36} ${-ry * 0.76}`} stroke={C.pigFleshLight} strokeWidth={14} opacity={0.7} fill="none" strokeLinecap="round" />
              {/* 首の後ろの肉のたるみ (頭は料理に突っこんで見えない) */}
              <path d={`M ${-rx * 0.34} ${-ry * 0.8} Q 0 ${-ry * 0.66} ${rx * 0.34} ${-ry * 0.8}`} stroke={C.pigFleshDark} strokeWidth={6} fill="none" strokeLinecap="round" />
              <path d={`M ${-rx * 0.26} ${-ry * 0.66} Q 0 ${-ry * 0.54} ${rx * 0.26} ${-ry * 0.66}`} stroke={C.pigFleshDark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
              {/* 脇腹の段 (肉の重なり) */}
              {[-1, 1].map((sd) => (
                <g key={sd} stroke={C.pigFleshDark} strokeWidth={6} fill="none" strokeLinecap="round">
                  <path d={`M ${sd * rx * 1.08} ${ry * 0.02} Q ${sd * rx * 0.86} ${ry * 0.14} ${sd * rx * 0.7} ${ry * 0.06}`} />
                  <path d={`M ${sd * rx * 1.1} ${ry * 0.36} Q ${sd * rx * 0.88} ${ry * 0.5} ${sd * rx * 0.66} ${ry * 0.42}`} />
                </g>
              ))}
              {/* 背骨のくぼみ */}
              <path d={`M 0 ${-ry * 0.5} Q 6 0 0 ${ry * 0.5}`} stroke={C.pigFleshDark} strokeWidth={5} opacity={0.55} fill="none" />
              {/* はち切れた服の名残: 左肩から脇へずり落ちた大きな布 + 右肩に引っかかった布 */}
              <path d={ragL} fill={p.cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <g stroke={p.clothDark} strokeWidth={5} fill="none" strokeLinecap="round">
                <path d={`M ${-rx * 0.6} ${-ry * 0.74} Q ${-rx * 0.82} ${-ry * 0.5} ${-rx * 0.92} ${-ry * 0.24}`} />
                <path d={`M ${-rx * 0.5} ${-ry * 0.66} Q ${-rx * 0.62} ${-ry * 0.5} ${-rx * 0.66} ${-ry * 0.3}`} />
              </g>
              {/* 裂け目からのぞくほつれ糸 */}
              <path d={`M ${-rx * 0.52} ${-ry * 0.4} q 6 18 -4 30 M ${-rx * 0.8} ${-ry * 0.04} q 4 16 -6 24`} stroke={p.clothDark} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d={ragR} fill={p.cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <path d={`M ${rx * 0.52} ${-ry * 0.84} Q ${rx * 0.74} ${-ry * 0.72} ${rx * 0.86} ${-ry * 0.5}`} stroke={p.clothDark} strokeWidth={5} fill="none" strokeLinecap="round" />
              {/* 襟の名残 (首まわりに残ったちぎれた帯) */}
              <path d={`M ${-rx * 0.36} ${-ry * 0.86} Q 0 ${-ry * 0.74} ${rx * 0.3} ${-ry * 0.88}`} stroke={C.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
              <path d={`M ${-rx * 0.36} ${-ry * 0.86} Q 0 ${-ry * 0.74} ${rx * 0.3} ${-ry * 0.88}`} stroke={p.cloth} strokeWidth={13} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        {/* 床に落ちた布切れ */}
        {pigT > 0 && [[700, 0], [960, 1], [1320, 0]].map(([bx, ci], i) => (
          <path key={i} d={`M ${bx} ${lerp(640, 820, easeOut(seg(f, 24 + i * 2, 38)))} l 36 -12 l 10 26 l -40 12 Z`}
            fill={ci ? "#E7A3B4" : "#8EC3DE"} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 青緑の丸い椅子 (手前) */}
        {[330, 750, 1230, 1660].map((sx, i) => (
          <g key={i}>
            <rect x={sx - 10} y={790} width={20} height={150} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
            <ellipse cx={sx} cy={940} rx={60} ry={14} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
            <ellipse cx={sx} cy={790} rx={i === 1 ? 140 : i === 2 ? 120 : 90} ry={30} fill={C.stool} stroke={C.ink} strokeWidth={6} />
            <ellipse cx={sx} cy={782} rx={i === 1 ? 110 : i === 2 ? 94 : 70} ry={16} fill={C.stoolDark} opacity={0.5} />
          </g>
        ))}
        {/* 変身の煙 */}
        {smoke > 0 && smoke < 1 && parents.map((p, i) => (
          <g key={i} opacity={Math.sin(smoke * Math.PI) * 0.9}>
            {Array.from({ length: 8 }, (_, j) => {
              const a = (j / 8) * Math.PI * 2;
              const d = 120 + smoke * 140;
              return <circle key={j} cx={p.x + Math.cos(a) * d} cy={620 + Math.sin(a) * d * 0.7 - smoke * 60} r={40 + smoke * 40} fill="#E6E0EE" stroke={C.ink} strokeWidth={4} />;
            })}
          </g>
        ))}
        {/* 手前で立ちすくむ千尋 */}
        <g transform={`translate(${Math.sin(f * 2.4) * (f > 24 ? 2 : 0)} 0)`}>
          <Ushiro kind="chihiro" x={260} y={1000} s={0.95} f={f} turn={0.4} />
        </g>
        {f > 26 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${200 + k * 60} ${520 - k * 10} l ${(k - 1) * 14} -40`} stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={clamp01((f - 26) / 6)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #6 ひとり残された千尋は、神さまたちが通うお風呂屋さんで、働くことになります。
// 格: (指示書) / seed 4006
// 絵: (指示書を見る)
// どこ: 夜の湯屋の全景。群青の空、何層も重なる楼閣 (青緑の瓦・朱の柱・黄色く光る窓・金の飾り)、裏の高い煙突、手前の朱の欄干の長い橋
// 演出: 巨大な湯屋と、橋の上にぽつんと立つ小さな千尋の後ろ姿。ひとりきりで見上げている
// 動き: 橋の灯りが手前から奥へ順に点る (f4〜36) / 窓の明かりがゆらぐ / 湯気と煙突の煙が昇る / カメラがゆっくり上へティルト
const Nm006: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeInOut(seg(f, 0, 42));
  const ty = lerp(50, -10, tilt);
  const zoom = lerp(1.06, 1.0, tilt);
  // 楼閣の層: 下から上へ
  const tiers = [
    { y: 560, w: 1080, h: 120 }, { y: 440, w: 940, h: 110 }, { y: 330, w: 800, h: 100 },
    { y: 230, w: 640, h: 90 }, { y: 140, w: 460, h: 80 },
  ];
  const lamp = (i: number) => seg(f, 4 + i * 4, 8 + i * 4);
  return (
    <Frame f={f} seed={4006} bg={C.sky} dark>
      <defs>
        <linearGradient id="na6sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10173A" /><stop offset="1" stopColor={C.skyLow} />
        </linearGradient>
        <radialGradient id="na6win" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.windowLit} stopOpacity={0.7} /><stop offset="1" stopColor={C.windowLit} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(960 540) scale(${zoom}) translate(-960 ${-540 + ty})`}>
        <rect x={-60} y={-200} width={W + 120} height={H + 400} fill="url(#na6sky)" />
        {/* 星 */}
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={rnd(4006, i) * W} cy={-160 + rnd(4016, i) * 360} r={2 + rnd(4026, i) * 3} fill={KRP.white} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
        ))}
        {/* 裏の高い煙突と煙 */}
        <rect x={1380} y={60} width={70} height={440} fill="#4A3A3A" stroke={C.ink} strokeWidth={6} />
        <rect x={1370} y={50} width={90} height={24} fill="#3A2C2C" stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => {
          const p = (f / 50 + i / 5) % 1;
          return <circle key={i} cx={1415 + p * 160 + Math.sin(p * 6) * 20} cy={40 - p * 200} r={30 + p * 50} fill={C.steam} opacity={0.5 * (1 - p)} stroke={C.ink} strokeWidth={3} />;
        })}
        {/* 楼閣の本体 */}
        <g>
          {/* 土台 (石垣) */}
          <rect x={360} y={680} width={1200} height={160} fill="#6A6070" stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={360 + i * 120 + (i % 2) * 40} y1={680} x2={360 + i * 120 + (i % 2) * 40} y2={840} stroke={C.ink} strokeWidth={3} opacity={0.5} />)}
          <line x1={360} y1={760} x2={1560} y2={760} stroke={C.ink} strokeWidth={3} opacity={0.5} />
          {tiers.map((t, i) => {
            const x0 = 960 - t.w / 2;
            const nWin = Math.round(t.w / 110);
            return (
              <g key={i}>
                {/* 壁 */}
                <rect x={x0 + 30} y={t.y} width={t.w - 60} height={t.h} fill="#5C2E2A" stroke={C.ink} strokeWidth={5} />
                <rect x={x0 + 10} y={t.y + t.h * 0.2} width={t.w - 20} height={t.h * 0.1} fill={C.pillar} stroke={C.ink} strokeWidth={4} />
                {/* 光る窓 */}
                {Array.from({ length: nWin }, (_, k) => {
                  const wx = x0 + 50 + k * ((t.w - 100) / nWin);
                  const ww = (t.w - 100) / nWin - 20;
                  const fl = 0.8 + 0.2 * Math.sin(f / 4 + k * 1.7 + i);
                  return (
                    <g key={k}>
                      <rect x={wx - 10} y={t.y + t.h * 0.3} width={ww + 20} height={t.h * 0.72} fill="url(#na6win)" opacity={fl} />
                      <rect x={wx} y={t.y + t.h * 0.38} width={ww} height={t.h * 0.56} fill={C.windowLit} stroke={C.ink} strokeWidth={3} opacity={fl} />
                      <rect x={wx + ww * 0.2} y={t.y + t.h * 0.46} width={ww * 0.6} height={t.h * 0.4} fill={C.windowCore} opacity={0.6 * fl} />
                      <line x1={wx + ww / 2} y1={t.y + t.h * 0.38} x2={wx + ww / 2} y2={t.y + t.h * 0.94} stroke={C.ink} strokeWidth={2} />
                    </g>
                  );
                })}
                {/* 朱の柱 */}
                {Array.from({ length: nWin + 1 }, (_, k) => (
                  <rect key={k} x={x0 + 36 + k * ((t.w - 100) / nWin)} y={t.y} width={12} height={t.h} fill={C.pillar} stroke={C.ink} strokeWidth={2.5} />
                ))}
                {/* 青緑の瓦屋根 (反り) */}
                <path d={`M ${x0 - 50} ${t.y + 6} Q ${x0 + 40} ${t.y - 10} ${960 - t.w * 0.38} ${t.y - 46} L ${960 + t.w * 0.38} ${t.y - 46} Q ${x0 + t.w - 40} ${t.y - 10} ${x0 + t.w + 50} ${t.y + 6} L ${x0 + t.w + 50} ${t.y + 14} L ${x0 - 50} ${t.y + 14} Z`}
                  fill={C.roofTeal} stroke={C.ink} strokeWidth={5} />
                <path d={`M ${x0 - 50} ${t.y + 6} L ${x0 + t.w + 50} ${t.y + 6}`} stroke={C.goldTrim} strokeWidth={5} />
                {Array.from({ length: Math.round(t.w / 40) }, (_, k) => (
                  <line key={k} x1={x0 - 20 + k * 40} y1={t.y - 4} x2={x0 - 10 + k * 40 + (k - t.w / 80) * 1.2} y2={t.y - 36} stroke={C.roofTealDark} strokeWidth={3} />
                ))}
                {/* 軒先の金の飾り */}
                {[-1, 1].map((sd) => (
                  <circle key={sd} cx={960 + sd * (t.w / 2 + 44)} cy={t.y + 2} r={10} fill={C.goldTrim} stroke={C.ink} strokeWidth={3} />
                ))}
                {/* 屋根のあいだから立ちのぼる湯気 */}
                {[0, 1].map((k) => {
                  const p = (f / 40 + i * 0.23 + k * 0.5) % 1;
                  const sx = 960 + (k ? 1 : -1) * t.w * 0.3;
                  return <ellipse key={k} cx={sx + Math.sin(p * 5) * 16} cy={t.y - 30 - p * 70} rx={40 + p * 30} ry={18 + p * 10} fill={C.steam} opacity={0.45 * (1 - p)} />;
                })}
              </g>
            );
          })}
          {/* 最上部の飾り屋根と宝珠 */}
          <path d="M 860 100 Q 960 20 1060 100 Z" fill={C.roofTeal} stroke={C.ink} strokeWidth={5} />
          <circle cx={960} cy={30} r={16} fill={C.goldTrim} stroke={C.ink} strokeWidth={4} />
          <rect x={956} y={-20} width={8} height={40} fill={C.goldTrim} stroke={C.ink} strokeWidth={2} />
          {/* 入口 (のれんは無地) */}
          <rect x={860} y={700} width={200} height={140} fill="#FFDA8A" stroke={C.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => <rect key={k} x={868 + k * 64} y={704} width={56} height={60} fill={C.roomRed} stroke={C.ink} strokeWidth={3} transform={`rotate(${Math.sin(f / 10 + k) * 2} ${896 + k * 64} 704)`} />)}
        </g>
        {/* 堀の水と映りこみ */}
        <rect x={-60} y={840} width={W + 120} height={400} fill={C.water} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={460 + i * 130 + Math.sin(f / 6 + i) * 10} y={870 + (i % 3) * 30} width={70} height={8} rx={4} fill={C.windowLit} opacity={0.35} />
        ))}
        {/* 朱の欄干の長い橋 (手前から奥の入口へ) */}
        <path d="M 120 1240 L 860 850 L 1060 850 L 1800 1240 Z" fill={C.bridge} stroke={C.ink} strokeWidth={6} />
        <path d="M 300 1240 L 900 850 L 1020 850 L 1620 1240 Z" fill="#8A6A54" stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 10 }, (_, i) => {
          const u = i / 10;
          return <line key={i} x1={lerp(900, 300, u)} y1={lerp(850, 1240, u)} x2={lerp(1020, 1620, u)} y2={lerp(850, 1240, u)} stroke={C.ink} strokeWidth={3} opacity={0.4} />;
        })}
        {/* 欄干 (左右) と灯り */}
        {[-1, 1].map((sd) => {
          const xNear = sd < 0 ? 120 : 1800, xFar = sd < 0 ? 860 : 1060;
          return (
            <g key={sd}>
              <line x1={xNear} y1={1240 - 150} x2={xFar} y2={850 - 50} stroke={C.bridge} strokeWidth={18} />
              <line x1={xNear} y1={1240 - 150} x2={xFar} y2={850 - 50} stroke={C.ink} strokeWidth={4} />
              {Array.from({ length: 6 }, (_, i) => {
                const u = i / 5;
                const px = lerp(xNear, xFar, u), py = lerp(1240, 850, u);
                const hgt = lerp(150, 50, u);
                const L = lamp(i);
                const lr = lerp(22, 8, u);
                return (
                  <g key={i}>
                    <rect x={px - lr * 0.4} y={py - hgt} width={lr * 0.8} height={hgt} fill={C.bridgeDark} stroke={C.ink} strokeWidth={3} />
                    {L > 0 && <circle cx={px} cy={py - hgt - lr} r={lr * 3.5} fill="url(#na6win)" opacity={L} />}
                    <rect x={px - lr * 0.7} y={py - hgt - lr * 2} width={lr * 1.4} height={lr * 1.8} rx={lr * 0.3} fill={L > 0.5 ? C.windowLit : "#6A5A4A"} stroke={C.ink} strokeWidth={3} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* 橋の上にぽつんと立つ千尋 (私服) */}
        <Ushiro kind="chihiro" x={960} y={915} s={0.52} f={f} />
        <ellipse cx={960} cy={917} rx={40} ry={8} fill={C.ink} opacity={0.35} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #7 お風呂屋さんの主人は、魔女の湯婆婆。
// 格: (指示書) / seed 4007
// 絵: (指示書を見る)
// どこ: 湯屋の最上階の洋風の部屋。濃い赤の唐草の壁紙・深緑の腰壁・金の縁、左に暖炉、右に壺と置物の棚、ランプ、シャンデリア
// 演出: 大きな机の向こう、窓の光を背負った湯婆婆の逆光のシルエット (大きな頭・大きな団子髪)。顔は暗くて見えない。机の上の手の指輪だけがぎらりと光る
// 動き: 暖炉の火のゆらぎ / シャンデリアのゆれ / 窓の光が強まる (f0〜20) / 指輪がぎらりと光る (f26〜36、その後も明滅) / カメラがじわっと寄る
const Nm007: React.FC<{ f: number }> = ({ f }) => {
  const push = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.07 * push;
  const light = easeOut(seg(f, 0, 20));
  const glint = seg(f, 26, 34);
  const gl = glint >= 1 ? 0.8 + 0.2 * Math.sin(f / 2) : glint;
  return (
    <Frame f={f} seed={4007} bg={C.roomRedDark} dark>
      <defs>
        <radialGradient id="na7win" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor={C.windowLight} stopOpacity={1} /><stop offset="0.6" stopColor={C.windowLit} stopOpacity={0.6} /><stop offset="1" stopColor={C.windowLit} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="na7fire" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0" stopColor="#FFB04A" stopOpacity={0.7} /><stop offset="1" stopColor="#FFB04A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(960 480) scale(${zoom}) translate(-960 -480)`}>
        {/* 赤い唐草の壁紙 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.roomRed} />
        <g stroke={C.roomGold} strokeWidth={3} fill="none" opacity={0.35}>
          {Array.from({ length: 40 }, (_, i) => {
            const px = (i % 10) * 200 + (Math.floor(i / 10) % 2) * 100;
            const py = 40 + Math.floor(i / 10) * 140;
            return <path key={i} d={`M ${px} ${py} q 30 -40 60 0 q 30 40 60 0 M ${px + 60} ${py} q -10 -30 10 -40 q 20 10 6 26`} />;
          })}
        </g>
        {/* 深緑の腰壁と金の縁 */}
        <rect x={-60} y={600} width={W + 120} height={540} fill={C.roomGreen} stroke={C.ink} strokeWidth={6} />
        <rect x={-60} y={596} width={W + 120} height={16} fill={C.roomGold} stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={20 + i * 220} y={650} width={180} height={180} rx={8} fill="none" stroke={C.roomGold} strokeWidth={4} opacity={0.5} />)}
        {/* 大きな窓 (光) */}
        <path d="M 640 640 L 640 260 Q 960 40 1280 260 L 1280 640 Z" fill="url(#na7win)" opacity={0.6 + 0.4 * light} />
        <path d="M 640 640 L 640 260 Q 960 40 1280 260 L 1280 640 Z" fill="none" stroke={C.roomGold} strokeWidth={14} />
        <path d="M 640 640 L 640 260 Q 960 40 1280 260 L 1280 640 Z" fill="none" stroke={C.ink} strokeWidth={4} />
        <line x1={960} y1={110} x2={960} y2={640} stroke={C.ink} strokeWidth={6} opacity={0.6} />
        <line x1={640} y1={400} x2={1280} y2={400} stroke={C.ink} strokeWidth={6} opacity={0.6} />
        {/* 窓からさす光の筋 */}
        <path d="M 700 640 L 1220 640 L 1500 1100 L 420 1100 Z" fill={C.windowLight} opacity={0.12 * light} />
        {/* 重いカーテン (深緑・金の房) */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${960 + sd * 330} 40 Q ${960 + sd * 300} 360 ${960 + sd * 350} 680 L ${960 + sd * 470} 680 Q ${960 + sd * 440} 360 ${960 + sd * 470} 40 Z`} fill={C.roomGreen} stroke={C.ink} strokeWidth={6} />
            <circle cx={960 + sd * 360} cy={420} r={18} fill={C.roomGold} stroke={C.ink} strokeWidth={4} />
            <line x1={960 + sd * 360} y1={438} x2={960 + sd * 360} y2={480} stroke={C.roomGold} strokeWidth={6} />
          </g>
        ))}
        {/* シャンデリア */}
        <g transform={`rotate(${Math.sin(f / 20) * 2} 960 -40)`}>
          <line x1={960} y1={-40} x2={960} y2={40} stroke={C.roomGold} strokeWidth={6} />
          <path d="M 860 40 Q 960 90 1060 40" fill="none" stroke={C.roomGold} strokeWidth={8} />
          {[860, 910, 960, 1010, 1060].map((cx, i) => (
            <g key={i}><circle cx={cx} cy={i % 2 ? 62 : 44} r={10} fill={NP.glow} opacity={0.6 + 0.3 * Math.sin(f / 3 + i)} /></g>
          ))}
        </g>
        {/* 左: 暖炉と火 */}
        <g>
          <rect x={60} y={430} width={360} height={420} fill="#6A4A3A" stroke={C.ink} strokeWidth={6} />
          <rect x={40} y={410} width={400} height={34} fill={C.roomGold} stroke={C.ink} strokeWidth={5} />
          <path d="M 120 850 L 120 560 Q 240 480 360 560 L 360 850 Z" fill={C.ink} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={240} cy={760} rx={150} ry={120} fill="url(#na7fire)" />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${180 + k * 60} 800 Q ${170 + k * 60 + Math.sin(f / 3 + k) * 12} ${720 - k * 10} ${200 + k * 60} ${660 + Math.sin(f / 4 + k) * 16} Q ${220 + k * 60} 730 ${210 + k * 60} 800 Z`}
              fill={k === 1 ? KRP.yellow : KRP.orange} stroke={C.ink} strokeWidth={3} />
          ))}
          {/* 暖炉の上の置物 (壺と金の時計) */}
          <path d="M 90 410 Q 70 340 110 300 L 150 300 Q 190 340 170 410 Z" fill="#2F5E8C" stroke={C.ink} strokeWidth={5} />
          <rect x={250} y={330} width={90} height={80} rx={10} fill={C.roomGold} stroke={C.ink} strokeWidth={5} />
          <circle cx={295} cy={366} r={26} fill={C.paperOld} stroke={C.ink} strokeWidth={4} />
          <line x1={295} y1={366} x2={295 + Math.cos(f / 8) * 18} y2={366 + Math.sin(f / 8) * 18} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 右: 壺と置物の棚・ランプ */}
        <g>
          <rect x={1500} y={260} width={380} height={570} fill="#4E2A16" stroke={C.ink} strokeWidth={6} />
          {[380, 540, 700].map((sy) => <rect key={sy} x={1500} y={sy} width={380} height={16} fill={C.roomGold} stroke={C.ink} strokeWidth={3} />)}
          {[
            [1560, 380, "#2F5E8C", 60], [1660, 380, C.roomGold, 44], [1780, 380, "#8E2F35", 70],
            [1580, 540, C.roomGreen, 54], [1700, 540, "#2F5E8C", 80], [1820, 540, C.roomGold, 40],
            [1600, 700, "#8E2F35", 50], [1740, 700, C.roomGreen, 66],
          ].map(([vx, vy, col, h], i) => (
            <path key={i} d={`M ${(vx as number) - 24} ${vy} Q ${(vx as number) - 40} ${(vy as number) - (h as number) * 0.6} ${(vx as number) - 12} ${(vy as number) - (h as number)} L ${(vx as number) + 12} ${(vy as number) - (h as number)} Q ${(vx as number) + 40} ${(vy as number) - (h as number) * 0.6} ${(vx as number) + 24} ${vy} Z`}
              fill={col as string} stroke={C.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 湯婆婆の逆光のシルエット (大きな頭・大きな団子髪) */}
        {/* 肩 (ふくらんだ袖のドレス・逆光) — 机の上に肩から上がのぞく */}
        <path d="M 700 660 Q 700 560 800 540 Q 860 528 900 560 L 1020 560 Q 1060 528 1120 540 Q 1220 560 1220 660 Z" fill={C.silhouette} stroke={C.windowLight} strokeWidth={4} />
        <Ushiro kind="yubaba" x={960} y={870} s={1.45} silhouette f={f} />
        {/* 団子髪と頭の縁に光 (逆光のリムライト) */}
        <ellipse cx={960} cy={302} rx={113} ry={81} fill="none" stroke={C.windowLight} strokeWidth={5} opacity={0.85} />
        <path d="M 870 270 Q 960 230 1050 270" stroke={C.windowLight} strokeWidth={4} fill="none" opacity={0.5} />
        <path d="M 880 300 Q 960 280 1040 300" stroke={C.windowLight} strokeWidth={3} fill="none" opacity={0.4} />
        {/* 大きな机 */}
        <path d="M 380 640 L 1540 640 L 1580 700 L 340 700 Z" fill={C.deskTop} stroke={C.ink} strokeWidth={6} />
        <rect x={340} y={700} width={1240} height={260} fill={C.deskFront} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={380 + k * 400} y={730} width={360} height={90} rx={6} fill="none" stroke={C.roomGold} strokeWidth={4} />
            <circle cx={560 + k * 400} cy={775} r={10} fill={C.roomGold} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 机の上の書類の山・羽ペン・ランプ */}
        {[[480, 0], [580, 1], [1340, 2]].map(([px, i]) => (
          <g key={i}>
            {Array.from({ length: 6 - i }, (_, k) => (
              <rect key={k} x={px - 80 + Math.sin(k * 2 + i) * 8} y={630 - k * 16} width={160} height={18} fill={k % 2 ? C.paperOld : C.paperOldDark} stroke={C.ink} strokeWidth={3}
                transform={`rotate(${Math.sin(k + i) * 4} ${px} ${630 - k * 16})`} />
            ))}
          </g>
        ))}
        <g transform="translate(1460 640)">
          <rect x={-14} y={-90} width={28} height={90} fill={C.roomGold} stroke={C.ink} strokeWidth={4} />
          <path d="M -60 -90 L 60 -90 L 36 -160 L -36 -160 Z" fill={C.roomGreen} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-90} rx={70} ry={20} fill={NP.glow} opacity={0.35 + 0.1 * Math.sin(f / 5)} />
        </g>
        {/* 机の上に置いた手 (逆光で暗い) と指輪の光 */}
        <g transform="translate(1110 640)">
          <path d="M -60 0 Q -64 -40 -30 -46 L 40 -40 Q 64 -30 60 0 Z" fill={C.silhouette} stroke={C.ink} strokeWidth={4} />
          {[-40, -16, 8, 32].map((fx, i) => <ellipse key={i} cx={fx} cy={-2} rx={11} ry={16} fill={C.silhouette} stroke={C.ink} strokeWidth={3} />)}
          <rect x={-100} y={-70} width={60} height={40} rx={16} fill={C.silhouette} transform="rotate(-20 -70 -50)" />
          <circle cx={-16} cy={-14} r={11} fill={C.ring} stroke={C.ink} strokeWidth={3} />
          {gl > 0 && (
            <g transform={`translate(-16 -14) scale(${0.4 + gl}) rotate(${f * 2})`} opacity={gl}>
              <circle r={36} fill={C.ring} opacity={0.35} />
              <path d="M 0 -70 L 9 -9 L 70 0 L 9 9 L 0 70 L -9 9 L -70 0 L -9 -9 Z" fill={KRP.white} />
            </g>
          )}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #8 働く契約を結ぶとき、湯婆婆は、千尋の名前を取り上げます。
// 格: (指示書) / seed 4008
// 絵: (指示書を見る)
// どこ: #7 と同じ最上階の部屋の、大きな机の上 (千の肩越しに机を見下ろす)。奥に逆光の湯婆婆
// 演出: 黄ばんだ契約書と羽ペンが空中をすうっと飛んで千の前へ下りる。千 (作業着) がペンを取って名前の欄に書くと、字の代わりに光の塊が1つずつ灯る
// 動き: 契約書が舞い降りる (f2〜22) / ペンが飛んで来る (f8〜24) / 腕が伸びて書く (f22〜40) / 光の塊が3つ順に灯る (f27・f32・f37) / カメラが名前の欄へ寄る
const Nm008: React.FC<{ f: number }> = ({ f }) => {
  const fly = easeInOut(seg(f, 2, 22));
  const pen = easeInOut(seg(f, 8, 24));
  const reach = easeOut(seg(f, 20, 28));
  const zoom = 1 + 0.06 * easeInOut(seg(f, 18, 42));
  // 契約書は千の手の届く所 (手前・左寄り) へ下りる
  const px = lerp(980, 930, fly), py = lerp(160, 590, fly) - Math.sin(fly * Math.PI) * 40;
  const prot = lerp(24, -3, fly) + Math.sin(fly * Math.PI * 2) * 8 * (1 - fly);
  const psc = lerp(0.35, 1, fly);
  const blobX = [1062, 1142, 1222];
  const blobT = blobX.map((_, i) => seg(f, 26 + i * 5, 30 + i * 5));
  const wi = Math.min(2, Math.floor(clamp01((f - 26) / 15) * 3));
  const writeX = f < 26 ? 1050 : blobX[wi] + Math.sin(f * 1.3) * 10;
  const writeY = 718 + Math.cos(f * 1.7) * 6;
  // 肩 (千の右肩)。腕の長さは肩幅の1.3倍以内
  const shX = 990, shY = 890;
  const handX = lerp(shX + 30, writeX, reach), handY = lerp(shY + 50, writeY, reach);
  // 肘: 肩と手の中点から外側 (右下) へ少し張り出して曲げる
  const dx = handX - shX, dy = handY - shY, dl = Math.max(1, Math.hypot(dx, dy));
  const elbX = (shX + handX) / 2 + (-dy / dl) * 44, elbY = (shY + handY) / 2 + (dx / dl) * 44;
  const penX = f < 24 ? lerp(1500, handX, pen) : handX;
  const penY = f < 24 ? lerp(120, handY, pen) - Math.sin(pen * Math.PI) * 60 : handY;
  return (
    <Frame f={f} seed={4008} bg={C.roomRedDark} dark>
      <defs>
        <radialGradient id="na8win" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.windowLight} stopOpacity={0.9} /><stop offset="1" stopColor={C.windowLit} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="na8blob" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={1} /><stop offset="0.5" stopColor={NP.glow} stopOpacity={0.8} /><stop offset="1" stopColor={NP.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(1100 700) scale(${zoom}) translate(-1100 -700)`}>
        {/* 奥の壁と窓の光 */}
        <rect x={-60} y={-60} width={W + 120} height={500} fill={C.roomRed} />
        <g stroke={C.roomGold} strokeWidth={3} fill="none" opacity={0.3}>
          {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M ${(i % 10) * 200 + (i > 9 ? 100 : 0)} ${60 + (i > 9 ? 150 : 0)} q 30 -40 60 0 q 30 40 60 0`} />)}
        </g>
        <ellipse cx={960} cy={160} rx={420} ry={300} fill="url(#na8win)" />
        {/* 奥の湯婆婆 (逆光) */}
        <Ushiro kind="yubaba" x={960} y={430} s={0.8} silhouette f={f} />
        {/* 湯婆婆の手元から契約書を飛ばす光 */}
        {fly < 1 && <circle cx={980} cy={300} r={60 * (1 - fly)} fill={NP.glow} opacity={0.5 * (1 - fly)} />}
        {/* 机 (手前いっぱい) */}
        <path d="M -60 340 L 1980 340 L 1980 1140 L -60 1140 Z" fill={C.deskTop} stroke={C.ink} strokeWidth={6} />
        <g stroke={C.deskFront} strokeWidth={4} opacity={0.6} fill="none">
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M -60 ${380 + i * 100} q 500 ${rnd(4008, i) * 30 - 15} 1000 0 q 500 ${rnd(4018, i) * 30 - 15} 1040 0`} />)}
        </g>
        <rect x={-60} y={336} width={W + 120} height={14} fill={C.roomGold} stroke={C.ink} strokeWidth={3} />
        {/* 机の小物: インク壺・印・書類の束 */}
        <g transform="translate(400 470)">
          <ellipse cx={0} cy={30} rx={60} ry={18} fill={C.ink} opacity={0.3} />
          <path d="M -46 30 L -50 -30 Q 0 -50 50 -30 L 46 30 Z" fill="#2B2D4A" stroke={C.ink} strokeWidth={5} />
          <rect x={-20} y={-56} width={40} height={24} fill={C.roomGold} stroke={C.ink} strokeWidth={4} />
        </g>
        {[[1640, 450], [1700, 420]].map(([sx, sy], i) => (
          <rect key={i} x={sx - 110} y={sy} width={220} height={150} fill={i ? C.paperOld : C.paperOldDark} stroke={C.ink} strokeWidth={4} transform={`rotate(${i ? 6 : -4} ${sx} ${sy})`} />
        ))}
        {/* 契約書 (舞い降りる) */}
        <g transform={`translate(${px} ${py}) rotate(${prot}) scale(${psc})`}>
          <rect x={-356} y={-196} width={720} height={400} fill={C.ink} opacity={0.25} transform="translate(10 14)" />
          <path d="M -360 -200 L 360 -200 L 360 200 L -360 200 Z" fill={C.paperOld} stroke={C.ink} strokeWidth={6} />
          <path d="M -360 -200 L 360 -200 L 360 -170 L -360 -170 Z" fill={C.paperOldDark} opacity={0.6} />
          {/* 細かい縦書きの文字 = 波線 */}
          {Array.from({ length: 13 }, (_, i) => (
            <path key={i} d={`M ${60 - i * 32} -150 q 6 20 0 40 q -6 20 0 40 q 6 20 0 40 q -6 20 0 40 q 6 20 0 40 q -6 20 0 40`} stroke={NP.sumi} strokeWidth={4} fill="none" opacity={0.55} />
          ))}
          {/* 名前の欄 */}
          <rect x={90} y={60} width={260} height={110} rx={6} fill={KRP.white} stroke={KRP.red} strokeWidth={5} opacity={0.85} />
          <text x={102} y={88} fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.red}>氏名</text>
          {/* 判を押す丸 */}
          <circle cx={220} cy={-80} r={40} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.6} />
        </g>
        {/* 名前の欄に灯る光の塊 (字は描かない) */}
        {blobX.map((bx, i) => {
          const t = blobT[i];
          if (t <= 0) return null;
          const k = pop(t) * (1 + Math.sin(f / 4 + i) * 0.05);
          return (
            <g key={i} transform={`translate(${bx} 710) scale(${k * 1.45})`}>
              <circle r={52} fill="url(#na8blob)" />
              <path d="M -18 -20 Q 0 -30 18 -20 Q 26 0 14 22 Q 0 30 -14 22 Q -26 0 -18 -20 Z" fill={NP.glowCore} stroke={NP.glow} strokeWidth={4} />
            </g>
          );
        })}
        {/* 千の後ろ姿 (作業着) と、伸ばした腕 */}
        <Ushiro kind="sen" x={910} y={1130} s={1.6} f={f} />
        {reach > 0 && (
          <g>
            {/* 上腕 → 肘で曲げる → 前腕 (袖のサーモンピンク) */}
            <path d={`M ${shX} ${shY} L ${elbX} ${elbY} L ${handX - 12} ${handY + 14}`} stroke={C.ink} strokeWidth={44} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M ${shX} ${shY} L ${elbX} ${elbY} L ${handX - 12} ${handY + 14}`} stroke={C.senTop} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* 肘の袖のしわ */}
            <path d={`M ${elbX - 12} ${elbY - 10} q 10 6 22 2`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
            <ellipse cx={handX - 4} cy={handY + 12} rx={24} ry={18} fill="#F2D2B6" stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        {/* 羽ペン (飛んで来て、手に収まる) */}
        <g transform={`translate(${penX} ${penY}) rotate(${f < 24 ? lerp(-60, 30, pen) + Math.sin(f / 2) * 10 : 30})`}>
          <path d="M 0 0 L -4 -40" stroke={C.ink} strokeWidth={5} />
          <path d="M -4 -40 Q -40 -120 -10 -190 Q 24 -120 -4 -40 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <path d="M -4 -50 L -10 -180" stroke={C.ink} strokeWidth={2} />
        </g>
        {/* 飛ぶ軌跡のきらめき */}
        {fly > 0 && fly < 1 && Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={lerp(980, px, 1 - i * 0.15) + Math.sin(i) * 20} cy={lerp(160, py, 1 - i * 0.15)} r={8 - i} fill={NP.glow} opacity={0.8 - i * 0.14} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #9 「千尋」から文字が減って、ただの「千」。
// 格: (指示書) / seed 4009
// 絵: (指示書を見る)
// どこ: #8 の続き。机の上の契約書の「氏名」の欄に、真上からぐっと寄る (紙が画面いっぱい・端に机の木目)
// 演出: 湯婆婆の大きな手 (逆光で暗い・宝石の指輪だけ光る) が紙の上にかざされ、光の塊3つのうち2つがふわりと浮いて手のひらに吸いこまれ、握りこまれる。残った1つが墨の字「千」になる
// 動き: 手が上から下りてくる (f0〜12) / 2つの光が浮いて吸いこまれる (f10〜26) / 手が握る (f24〜32) / 残りの光が「千」の字に変わる (f28〜38) / カメラが「千」へパン
const Nm009: React.FC<{ f: number }> = ({ f }) => {
  const down = easeOut(seg(f, 0, 12));
  const close = easeInOut(seg(f, 24, 32));
  const lift = easeInOut(seg(f, 32, 42));
  const ink = seg(f, 28, 38);
  const pan = easeInOut(seg(f, 26, 42));
  const hx = 1150, hy = lerp(-200, 250, down) - lift * 24;
  const blobs = [700, 960, 1220];
  const fingerLen = lerp(1, 0.3, close);
  return (
    <Frame f={f} seed={4009} bg={C.deskTop} dark>
      <defs>
        <radialGradient id="na9blob" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={1} /><stop offset="0.5" stopColor={NP.glow} stopOpacity={0.8} /><stop offset="1" stopColor={NP.glow} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="na9shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.silhouette} stopOpacity={0.45} /><stop offset="1" stopColor={C.silhouette} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${pan * 150} ${pan * 10})`}>
        {/* 机の木目 (紙の外側) */}
        <rect x={-260} y={-60} width={W + 520} height={H + 120} fill={C.deskTop} />
        <g stroke={C.deskFront} strokeWidth={5} opacity={0.6} fill="none">
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -260 ${20 + i * 130} q 600 ${rnd(4009, i) * 40 - 20} 1200 0 q 600 ${rnd(4019, i) * 40 - 20} 1240 0`} />)}
        </g>
        {/* 契約書 (画面いっぱい) */}
        <g transform="rotate(-2 960 540)">
          <rect x={120} y={60} width={1680} height={980} fill={C.ink} opacity={0.3} transform="translate(14 16)" />
          <rect x={120} y={60} width={1680} height={980} fill={C.paperOld} stroke={C.ink} strokeWidth={8} />
          {/* 紙のしみ・折り目 */}
          <ellipse cx={1600} cy={200} rx={90} ry={50} fill={C.paperOldDark} opacity={0.45} />
          <ellipse cx={300} cy={880} rx={70} ry={40} fill={C.paperOldDark} opacity={0.4} />
          <line x1={960} y1={60} x2={960} y2={1040} stroke={C.paperOldDark} strokeWidth={4} opacity={0.6} />
          {/* 上の段の縦書き (波線) */}
          {Array.from({ length: 20 }, (_, i) => (
            <path key={i} d={`M ${1720 - i * 78} 110 q 10 24 0 48 q -10 24 0 48 q 10 24 0 48`} stroke={NP.sumi} strokeWidth={6} fill="none" opacity={0.5} />
          ))}
          {/* 「氏名」の欄 */}
          <rect x={460} y={390} width={1000} height={320} rx={10} fill={KRP.white} stroke={KRP.red} strokeWidth={8} opacity={0.9} />
          <rect x={460} y={390} width={110} height={56} fill={KRP.red} />
          <text x={515} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>氏名</text>
          {/* 下の段の波線と朱の判 */}
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${1680 - i * 90} 760 q 10 24 0 48 q -10 24 0 48`} stroke={NP.sumi} strokeWidth={6} fill="none" opacity={0.5} />
          ))}
          <circle cx={1620} cy={560} r={70} fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.5} />
        </g>
        {/* 手の影 (紙の上に落ちる) */}
        <ellipse cx={hx - 60} cy={hy + 190} rx={240 * (0.6 + down * 0.4)} ry={90} fill="url(#na9shade)" opacity={down * 0.5} />
        {/* 残る1つ目: 光 → 墨の字「千」 */}
        <g transform={`translate(${blobs[0]} 560)`}>
          <circle r={140} fill="url(#na9blob)" opacity={1 - ink} />
          <path d="M -50 -60 Q 0 -86 50 -60 Q 72 0 40 64 Q 0 86 -40 64 Q -72 0 -50 -60 Z" fill={NP.glowCore} stroke={NP.glow} strokeWidth={6} opacity={1 - ink} />
          {ink > 0 && (
            <g opacity={ink}>
              {[0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={Math.cos(k * 1.3) * 120} cy={Math.sin(k * 1.3) * 100} r={6 + (k % 2) * 5} fill={NP.sumi} opacity={0.6} />
              ))}
              <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={230} fill={NP.sumi}>千</text>
            </g>
          )}
        </g>
        {/* 2つ目・3つ目: ふわりと浮いて手のひらへ */}
        {blobs.slice(1).map((bx, i) => {
          const u = easeInOut(seg(f, 10 + i * 4, 24 + i * 2));
          const gone = close > 0.6;
          if (gone) return null;
          const x = lerp(bx, hx - 50 + i * 30, u) + Math.sin(u * Math.PI) * (i ? 60 : -60);
          const y = lerp(560, hy + 90, u);
          const k = lerp(1, 0.45, u);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
              <circle r={140} fill="url(#na9blob)" />
              <path d="M -50 -60 Q 0 -86 50 -60 Q 72 0 40 64 Q 0 86 -40 64 Q -72 0 -50 -60 Z" fill={NP.glowCore} stroke={NP.glow} strokeWidth={6} />
            </g>
          );
        })}
        {/* 元あった場所に残る薄い跡 */}
        {blobs.slice(1).map((bx, i) => (
          <ellipse key={i} cx={bx} cy={560} rx={60} ry={70} fill="none" stroke={NP.glow} strokeWidth={4} strokeDasharray="10 10" opacity={0.6 * seg(f, 14, 24)} />
        ))}
        {/* 湯婆婆の大きな手 (しわのある黄みの肌・太い指・大きな宝石の指輪・濃い青の袖に金の縁)。
            手の座標: 手首が上 (y=-150)、指先が下。全体を30度回して袖を右上へ逃がす */}
        <g transform={`translate(${hx} ${hy}) rotate(30) scale(1.25)`}>
          {/* 袖 (濃い青のドレス) */}
          <path d="M -98 -190 L -150 -700 L 190 -700 L 98 -190 Z" fill={C.dressBlue} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -40 -240 Q -60 -420 -70 -620 M 40 -260 Q 50 -440 70 -640" stroke={C.dressBlueDark} strokeWidth={6} fill="none" opacity={0.8} />
          {/* 手の甲 (手首から指の付け根へ広がる) */}
          <path d="M -72 -160 Q -96 -60 -112 30 Q -112 58 -84 62 L 92 62 Q 118 56 114 26 Q 102 -60 74 -160 Z"
            fill={C.hagSkin} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 親指 (右側。開く→握ると内へ) */}
          {(() => {
            const tl = lerp(1, 0.7, close);
            return (
              <g transform={`rotate(${lerp(-34, 14, close)} 92 -40)`}>
                <rect x={76} y={-52} width={50} height={130 * tl} rx={25} fill={C.hagSkin} stroke={C.ink} strokeWidth={5} />
                <path d={`M 84 ${-52 + 64 * tl} q 17 6 34 0`} stroke={C.hagSkinDark} strokeWidth={4} fill="none" strokeLinecap="round" />
                {close < 0.6 && (
                  <path d={`M 87 ${-52 + 130 * tl - 30} Q 84 ${-52 + 130 * tl - 4} 101 ${-52 + 130 * tl + 12} Q 118 ${-52 + 130 * tl - 4} 115 ${-52 + 130 * tl - 30} Q 101 ${-52 + 130 * tl - 36} 87 ${-52 + 130 * tl - 30} Z`}
                    fill={C.hagNail} stroke={C.ink} strokeWidth={3} />
                )}
              </g>
            );
          })()}
          {/* 4本の太い指 (人差し指=右から)。紙から字をかき取るように少し曲げ、握ると縮む */}
          {([[-78, 128, -1], [-26, 165, -1], [26, 178, 0], [78, 160, 1]] as const).map(([fx, len, ri], i) => {
            const L = len * lerp(1, 0.4, close) * (1 + Math.sin(f / 5 + i) * 0.02 * (1 - close));
            const rot = (i - 1.5) * 6 * (1 - close);
            const tip = 50 + L;
            return (
              <g key={i} transform={`rotate(${rot} ${fx} 50)`}>
                <rect x={fx - 25} y={40} width={50} height={L + 10} rx={25} fill={C.hagSkin} stroke={C.ink} strokeWidth={5} />
                {/* 関節のしわ */}
                {close < 0.6 && [0.38, 0.7].map((q) => (
                  <path key={q} d={`M ${fx - 16} ${50 + L * q} q 16 7 32 0 M ${fx - 12} ${56 + L * q} q 12 5 24 0`} stroke={C.hagSkinDark} strokeWidth={3} fill="none" strokeLinecap="round" />
                ))}
                {/* とがった爪 */}
                {close < 0.6 && (
                  <path d={`M ${fx - 16} ${tip - 32} Q ${fx - 18} ${tip - 4} ${fx} ${tip + 14} Q ${fx + 18} ${tip - 4} ${fx + 16} ${tip - 32} Q ${fx} ${tip - 40} ${fx - 16} ${tip - 32} Z`}
                    fill={C.hagNail} stroke={C.ink} strokeWidth={3} />
                )}
                {/* 握ると指先を内へ折りこむ: 折り目のしわと、下にのぞく指先の丸み */}
                {close > 0.5 && (
                  <g opacity={(close - 0.5) * 2}>
                    <path d={`M ${fx - 18} ${tip - 22} q 18 10 36 0`} stroke={C.hagSkinDark} strokeWidth={4} fill="none" strokeLinecap="round" />
                    <path d={`M ${fx - 20} ${tip - 4} Q ${fx} ${tip + 16} ${fx + 20} ${tip - 4}`} fill={C.hagSkinDark} stroke={C.ink} strokeWidth={4} />
                  </g>
                )}
                {/* 指輪 (金の台に大きな宝石) */}
                {ri >= 0 && (
                  <g transform={`translate(${fx} ${50 + L * 0.3})`}>
                    <rect x={-29} y={-9} width={58} height={18} rx={7} fill={C.roomGold} stroke={C.ink} strokeWidth={3} />
                    <circle r={44} fill={ri === 0 ? C.ring : C.ringRed} opacity={0.22 + 0.15 * Math.sin(f / 3 + i)} />
                    <path d="M 0 -26 L 22 -6 L 14 20 L -14 20 L -22 -6 Z" fill={ri === 0 ? C.ring : C.ringRed} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
                    <path d="M 0 -26 L 0 20 M -22 -6 L 22 -6" stroke={C.ink} strokeWidth={2} opacity={0.35} />
                    <circle cx={-7} cy={-9} r={5} fill={KRP.white} opacity={0.85} />
                  </g>
                )}
              </g>
            );
          })}
          {/* 握りこぶしの関節の山 (指の付け根が盛り上がる) */}
          {close > 0.5 && (
            <path d="M -104 56 Q -78 34 -52 52 Q -26 32 0 50 Q 26 30 52 50 Q 78 34 104 54" stroke={C.hagSkinLight} strokeWidth={8} fill="none" strokeLinecap="round" opacity={(close - 0.5) * 2} />
          )}
          {/* 手の甲のしわ・骨の筋・しみ・照り */}
          <g stroke={C.hagSkinDark} strokeWidth={4} fill="none" strokeLinecap="round">
            <path d="M -50 -120 Q -60 -40 -70 30" opacity={0.6} />
            <path d="M 0 -130 Q -4 -50 -20 34" opacity={0.6} />
            <path d="M 44 -124 Q 50 -50 40 34" opacity={0.6} />
            <path d="M -84 44 q 14 -8 28 0 M -32 46 q 14 -8 28 0 M 18 46 q 14 -8 28 0 M 66 44 q 14 -8 28 0" />
            <path d="M -40 -20 q 22 -8 44 0 M -30 -4 q 18 -6 36 0" opacity={0.7} />
          </g>
          {[[-60, -80, 9], [30, -100, 7], [62, -20, 6]].map(([sx, sy, r], i) => (
            <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.8} fill={C.hagSkinDark} opacity={0.45} />
          ))}
          <path d="M -60 -130 Q -78 -50 -86 10" stroke={C.hagSkinLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
          {/* 袖口 (金の縁) */}
          <path d="M -104 -200 Q 0 -176 104 -200 L 100 -150 Q 0 -128 -100 -150 Z" fill={C.dressBlueDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -102 -158 Q 0 -134 102 -158" stroke={C.roomGold} strokeWidth={10} fill="none" />
          <path d="M -104 -196 Q 0 -172 104 -196" stroke={C.roomGold} strokeWidth={6} fill="none" />
          {/* 握りこんだ光が指のすきまから漏れる */}
          {close > 0.3 && [-52, 0, 52].map((lx, i) => (
            <line key={i} x1={lx} y1={100} x2={lx + (i - 1) * 20} y2={160} stroke={NP.glow} strokeWidth={8} strokeLinecap="round" opacity={(1 - lift * 0.7) * close} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_001: (f) => <Nm001 f={f} />,
  nm_002: (f) => <Nm002 f={f} />,
  nm_003: (f) => <Nm003 f={f} />,
  nm_004: (f) => <Nm004 f={f} />,
  nm_005: (f) => <Nm005 f={f} />,
  nm_006: (f) => <Nm006 f={f} />,
  nm_007: (f) => <Nm007 f={f} />,
  nm_008: (f) => <Nm008 f={f} />,
  nm_009: (f) => <Nm009 f={f} />,
};

export const NM_A_MOTIFS: string[] = [
  "nm_001", // #1
  "nm_002", // #2
  "nm_003", // #3
  "nm_004", // #4
  "nm_005", // #5
  "nm_006", // #6
  "nm_007", // #7
  "nm_008", // #8
  "nm_009", // #9
];

export const namaeAScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
