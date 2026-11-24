// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#10〜#18 (9文)
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
  // #10 教室の黒板
  wallClass: "#E9DFC4",
  board: "#2F4A3C",
  boardDark: "#243A2F",
  chalk: "#F4F1E6",
  chalkYellow: "#F3E08A",
  chalkPink: "#F2A79A",
  chalkBlue: "#A9D3E8",
  frameWood: "#9A6B3E",
  frameWoodDark: "#6E4A28",
  fangShadow: "#18261E",
  bandage: "#E8B98F",
  bandagePad: "#F6E2C8",
  // #11 夜明けの生垣
  dawnTop: "#9DB6CE",
  dawnLow: "#F1DCC6",
  roofFar: "#6E8F92",
  hedge: "#3E7448",
  hedgeDark: "#2A5534",
  hedgeLight: "#6FA463",
  stone: "#C9C1B1",
  stoneDark: "#A59C8B",
  rail: "#C9453A",
  railDark: "#8E2E26",
  // #12 丘と霧
  duskTop: "#8E98A8",
  duskLow: "#D9CFC0",
  hillGrass: "#7C9A5C",
  hillGrassDark: "#5C7A42",
  forest: "#2F5E3C",
  forestDark: "#1F4229",
  forestMid: "#47784A",
  dirt: "#B99A72",
  dirtDark: "#94774F",
  tunnelWall: "#B5604A",
  tunnelWallDark: "#7E3E30",
  mist: "#EEF1F0",
  mistShade: "#D6DCDC",
  statue: "#6F9A5E",
  statueDark: "#4E7642",
  // #13 夜の欄干
  night: "#1B2742",
  nightDeep: "#101830",
  sea: "#23385A",
  seaDeep: "#162540",
  lamp: "#F7C25A",
  lampCore: "#FFE9A8",
  roofNight: "#2F5E5C",
  slip: "#F6F3EA",
  // #14 大浴場
  floorWood: "#C99A62",
  floorWoodDark: "#A57A48",
  wallWood: "#8A5A34",
  wallWoodDark: "#6A4224",
  tub: "#9A6A3C",
  tubDark: "#6E4824",
  bathWater: "#9FD0C8",
  bathWaterDeep: "#6FB0A8",
  pillar: "#B9804A",
  pillarDark: "#8E5E32",
  rag: "#F4F1E6",
  // #15〜#17 映写室
  roomDark: "#3A3340",
  plaster: "#8F8577",
  plasterDark: "#6F665A",
  curtain: "#8E2E3A",
  curtainDark: "#64202A",
  beam: "#FFF3C4",
  screenLit: "#FBF1D6",
  // #15〜#17 映写室 (#195〜#197 の劇場とそろえた色)
  theater: "#24222B",
  theaterWall: "#34303C",
  velvet: "#7A3B3B",
  velvetDark: "#5C2A2C",
  screenOff: "#3A3A44",
  screenOn: "#F6EDD3",
  metal: "#5E6470",
  metalDark: "#434852",
  seat: "#2A2630",
  // #18 明るい作業部屋
  roomWall: "#EEF3EC",
  roomWallLine: "#D7E2D3",
  sky: "#BFE0F2",
  bench: "#C28A52",
  benchDark: "#94653A",
  plant: "#5FA05A",
  pot: "#C9704A",
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

// チョークの線 (pathLength=1 で t に合わせて描かれる)
const NAbChalk: React.FC<{ d: string; t: number; color?: string; w?: number; op?: number }> = ({ d, t, color = C.chalk, w = 10, op = 0.92 }) =>
  t <= 0.001 ? null : (
    <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(t)}
      stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );

// 葉っぱ1枚 (塗りあり)
const NAbLeaf: React.FC<{ x: number; y: number; s?: number; rot?: number; fill?: string }> = ({ x, y, s = 1, rot = 0, fill = C.hedgeLight }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -16 Q 12 -4 0 16 Q -12 -4 0 -16 Z" fill={fill} stroke={KRP.ink} strokeWidth={3} />
    <line x1={0} y1={-12} x2={0} y2={12} stroke={KRP.ink} strokeWidth={1.5} opacity={0.6} />
  </g>
);

// 霧のかたまり (重ねた楕円)
const NAbMist: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) =>
  op <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <ellipse cx={0} cy={10} rx={150} ry={46} fill={C.mistShade} />
      <ellipse cx={-60} cy={-6} rx={90} ry={52} fill={C.mist} />
      <ellipse cx={50} cy={-12} rx={100} ry={60} fill={C.mist} />
      <ellipse cx={0} cy={6} rx={130} ry={44} fill={C.mist} />
    </g>
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #10 怪物に襲われるわけでも、ケガをするわけでもありません。
// 格: 図 / seed 4010
// どこ: 教室の壁にかかった木枠の大きな黒板「こわい場面チェック表」(チョーク受けにチョークと黒板消し)
// 演出: 3段の表。1段目「怪物に襲われる」(牙の影)・2段目「ケガをする」(ばんそうこう) に×が入る。
//       3段目「名前が減る」だけ空欄で、チョークの「？」が入る
// 動き: 宙に浮いたチョークが f6〜27 で×を順に描き、粉が落ちる。f28〜40 で3段目へ移って「？」。
//       カメラは f26〜42 で3段目へ少し寄る
const Nm010: React.FC<{ f: number }> = ({ f }) => {
  const rows = [335, 505, 675];
  const BX = 1500;
  // ×の4画
  const strokes: [number, number, number, number, number, number][] = [
    // [a, b, x1, y1, x2, y2]
    [6, 11, BX - 44, rows[0] - 44, BX + 44, rows[0] + 44],
    [11, 16, BX + 44, rows[0] - 44, BX - 44, rows[0] + 44],
    [17, 22, BX - 44, rows[1] - 44, BX + 44, rows[1] + 44],
    [22, 27, BX + 44, rows[1] - 44, BX - 44, rows[1] + 44],
  ];
  const q = seg(f, 31, 40);
  // チョークの先の位置
  let cx = BX - 120, cy = rows[0] - 90;
  for (const [a, b, x1, y1, x2, y2] of strokes) {
    if (f >= a && f <= b) { const t = seg(f, a, b); cx = lerp(x1, x2, t); cy = lerp(y1, y2, t); }
  }
  if (f > 27 && f < 31) { const t = easeInOut(seg(f, 27, 31)); cx = lerp(BX - 44, BX - 20, t); cy = lerp(rows[1] + 44, rows[2] - 50, t); }
  if (f >= 31) {
    const t = q;
    // 「？」の筆順をなぞる
    const pts: [number, number][] = [[-22, -38], [0, -58], [26, -40], [14, -12], [0, 0], [0, 20], [0, 44]];
    const k = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
    const u = t * (pts.length - 1) - k;
    cx = BX + lerp(pts[k][0], pts[k + 1][0], u);
    cy = rows[2] + lerp(pts[k][1], pts[k + 1][1], u);
    if (f > 40) { cx += (f - 40) * 10; cy -= (f - 40) * 8; }
  }
  const cam = easeInOut(seg(f, 26, 42));
  const hl = seg(f, 36, 42);
  return (
    <Frame f={f} seed={4010}>
      {/* 教室の壁と腰板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallClass} />
      <rect x={-20} y={850} width={W + 40} height={260} fill={C.frameWood} />
      <g stroke={C.frameWoodDark} strokeWidth={4} opacity={0.6}>
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 160} y1={850} x2={i * 160} y2={1100} />)}
      </g>
      <rect x={-20} y={842} width={W + 40} height={16} fill={C.frameWoodDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 壁の時間割の貼り紙・画鋲 (端の飾り) */}
      <g transform="rotate(-3 70 300)">
        <rect x={20} y={200} width={110} height={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={34} y1={236 + i * 28} x2={116} y2={236 + i * 28} stroke={KRP.gray} strokeWidth={5} />)}
        <circle cx={75} cy={210} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <g transform={`translate(${BX} ${rows[2]}) scale(${1 + 0.07 * cam}) translate(${-BX} ${-rows[2]}) translate(${-60 * cam} 0)`}>
        {/* 黒板の木枠 */}
        <rect x={150} y={88} width={1620} height={726} rx={16} fill={C.frameWood} stroke={KRP.ink} strokeWidth={8} />
        <rect x={180} y={118} width={1560} height={666} rx={6} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {/* 消し跡のむら */}
        <g fill={C.chalk} opacity={0.06}>
          <ellipse cx={500} cy={260} rx={260} ry={60} />
          <ellipse cx={1200} cy={700} rx={320} ry={50} />
          <ellipse cx={1500} cy={220} rx={180} ry={40} />
        </g>
        <rect x={180} y={740} width={1560} height={44} fill={C.boardDark} opacity={0.5} />
        {/* 題字 */}
        <text x={960} y={212} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={58} fill={C.chalk} opacity={0.92}>こわい場面チェック表</text>
        <path d="M 680 236 Q 960 248 1240 232" stroke={C.chalkYellow} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* 表の罫線 */}
        <g stroke={C.chalk} strokeWidth={5} strokeLinecap="round" opacity={0.75} fill="none">
          {[250, 420, 590, 760].map((y, i) => <path key={i} d={`M 236 ${y} Q 960 ${y + (i % 2 ? 4 : -3)} 1684 ${y}`} />)}
          <path d="M 524 250 L 522 760" />
          <path d="M 1322 250 L 1324 760" />
        </g>
        {/* 1段目の絵: 牙の影 */}
        <g transform={`translate(380 ${rows[0] + 6})`}>
          <path d="M -120 -20 Q -110 -78 0 -80 Q 110 -78 120 -20 Q 100 10 0 8 Q -100 10 -120 -20 Z" fill={C.fangShadow} stroke={C.chalk} strokeWidth={4} />
          <path d="M -110 20 Q 0 70 110 20 Q 90 50 0 62 Q -90 50 -110 20 Z" fill={C.fangShadow} stroke={C.chalk} strokeWidth={4} />
          {[-80, -44, 44, 80].map((x, i) => (
            <path key={i} d={`M ${x - 14} ${-6} L ${x} ${Math.abs(x) > 60 ? 30 : 40} L ${x + 14} ${-6} Z`} fill={C.chalk} stroke={KRP.ink} strokeWidth={2} />
          ))}
          {[-56, 56].map((x, i) => <path key={i} d={`M ${x - 10} 30 L ${x} 4 L ${x + 10} 30 Z`} fill={C.chalk} stroke={KRP.ink} strokeWidth={2} />)}
          {[-46, 46].map((x, i) => <ellipse key={i} cx={x} cy={-48} rx={14} ry={8} fill={C.chalkYellow} />)}
        </g>
        {/* 2段目の絵: ばんそうこう */}
        <g transform={`translate(380 ${rows[1]}) rotate(-18)`}>
          <rect x={-120} y={-38} width={240} height={76} rx={38} fill={C.bandage} stroke={C.chalk} strokeWidth={5} />
          <rect x={-40} y={-32} width={80} height={64} rx={8} fill={C.bandagePad} stroke={KRP.ink} strokeWidth={3} />
          {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
            <circle key={`${sd}${k}`} cx={sd * (66 + (k % 2) * 18)} cy={-16 + k * 16} r={4} fill={C.frameWoodDark} opacity={0.7} />
          )))}
        </g>
        {/* 3段目の絵: 名前の字が減った紙 (字の代わりに丸) */}
        <g transform={`translate(380 ${rows[2]})`}>
          <rect x={-115} y={-58} width={230} height={116} rx={10} fill="none" stroke={C.chalk} strokeWidth={5} />
          <circle cx={-60} cy={0} r={28} fill={C.chalk} opacity={0.9} />
          <circle cx={0} cy={0} r={28} fill="none" stroke={C.chalk} strokeWidth={4} strokeDasharray="8 9" opacity={0.6} />
          <circle cx={60} cy={0} r={28} fill="none" stroke={C.chalk} strokeWidth={4} strokeDasharray="8 9" opacity={0.4} />
        </g>
        {/* 項目名 */}
        {["怪物に襲われる", "ケガをする", "名前が減る"].map((s, i) => (
          <text key={i} x={580} y={rows[i] + 22} fontFamily={FONT} fontWeight={700} fontSize={62}
            fill={i === 2 ? C.chalkYellow : C.chalk} opacity={0.92}>{s}</text>
        ))}
        {/* 3段目の強調 (黄色いチョークの囲み) */}
        <NAbChalk d={`M 548 ${rows[2] - 62} Q 940 ${rows[2] - 76} 1290 ${rows[2] - 58} Q 1306 ${rows[2]} 1288 ${rows[2] + 60} Q 920 ${rows[2] + 72} 552 ${rows[2] + 58} Q 536 ${rows[2]} 548 ${rows[2] - 62}`}
          t={hl} color={C.chalkYellow} w={6} op={0.8} />
        {/* チェック欄の四角 */}
        {rows.map((y, i) => (
          <rect key={i} x={BX - 64} y={y - 64} width={128} height={128} rx={6} fill="none" stroke={C.chalk} strokeWidth={6} opacity={0.85} />
        ))}
        {/* ×を描く */}
        {strokes.map(([a, b, x1, y1, x2, y2], i) => (
          <NAbChalk key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} t={seg(f, a, b)} color={C.chalkPink} w={16} />
        ))}
        {/* ×のあとに落ちるチョークの粉 */}
        {[16, 27].map((a, j) => {
          const t = seg(f, a, a + 14);
          return t > 0 && t < 1 ? (
            <g key={j} opacity={1 - t}>
              {[0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={BX - 30 + k * 16 + Math.sin(k + f / 3) * 6} cy={rows[j] + 50 + t * (80 + k * 14)} r={3 + (k % 2)} fill={C.chalk} />
              ))}
            </g>
          ) : null;
        })}
        {/* 3段目の「？」 */}
        <g transform={`translate(${BX} ${rows[2]})`}>
          <NAbChalk d="M -22 -38 Q -20 -60 0 -60 Q 26 -60 26 -38 Q 26 -18 10 -10 Q 0 -4 0 8 L 0 20" t={seg(f, 31, 39)} color={C.chalkYellow} w={14} />
          {f >= 39 && <circle cx={0} cy={44} r={9} fill={C.chalkYellow} opacity={0.92 * pop(seg(f, 39, 41))} />}
        </g>
        {/* 宙を走るチョーク (書き手は見せない) */}
        {f >= 3 && (
          <g transform={`translate(${cx} ${cy}) rotate(-38)`} opacity={seg(f, 3, 6)}>
            <rect x={-6} y={-10} width={74} height={20} rx={6} fill={f < 30 ? C.chalkPink : C.chalkYellow} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-6} y={-10} width={14} height={20} rx={5} fill={KRP.white} opacity={0.6} />
          </g>
        )}
        {/* チョーク受け */}
        <rect x={168} y={796} width={1584} height={30} rx={4} fill={C.frameWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={300} y={778} width={110} height={22} rx={4} fill={C.chalk} stroke={KRP.ink} strokeWidth={4} />
        <rect x={430} y={782} width={70} height={18} rx={6} fill={C.chalkBlue} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={1460} y={766} width={150} height={34} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1460} y={766} width={150} height={14} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #11 それなのに、少年ハクは、千尋に教えます。
// 格: 山 / seed 4011
// どこ: 夜明け前、湯屋の裏の生垣の道。左右の植え込みが奥へ続き、突き当たりに朱の欄干、遠くに湯屋の屋根と煙突
// 演出: おかっぱの少年 (白い上衣・藍の袴) の後ろ姿が、小さな千 (サーモンピンク) に身をかがめて耳打ちする。
//       少年の吹き出しの「・・・」が1つずつ灯り、千は顔を上げて聞き入る (集中線)
// 動き: カメラがゆっくり2人へ寄る / 生垣の葉がそよぐ / 葉が舞い落ちる / 朝の光の帯がゆっくり強まる
const Nm011: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const VX = 980, VY = 470;
  const bub = pop(seg(f, 10, 18));
  const listen = seg(f, 30, 38);
  // 生垣の上の縁のこんもり
  const hedgeTop = (side: -1 | 1) =>
    Array.from({ length: 9 }, (_, i) => {
      const u = i / 8; // 0=手前 1=奥
      const x = side === -1 ? lerp(-40, 860, u) : lerp(1960, 1100, u);
      const y = lerp(side === -1 ? 230 : 210, 430, u);
      const r = lerp(120, 26, u);
      return { x, y, r };
    });
  return (
    <Frame f={f} seed={4011} bg={C.dawnLow}>
      <defs>
        <linearGradient id="nab11sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.dawnTop} />
          <stop offset="1" stopColor={C.dawnLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 640) scale(${1 + 0.07 * k}) translate(-960 -640) translate(${-20 * k} ${-10 * k})`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#nab11sky)" />
        {/* 明けの星ひとつ */}
        <circle cx={1500} cy={110} r={6} fill={KRP.white} opacity={0.8 - 0.3 * k} />
        {/* 遠くの湯屋 (かすんだ青緑の屋根が重なる・煙突と煙) */}
        <g opacity={0.6}>
          {[0, 1, 2, 3].map((i) => {
            const y = 120 + i * 70, w = 360 - i * 50 + i * 90;
            return (
              <g key={i}>
                <path d={`M ${420 - w / 2} ${y + 40} Q ${420} ${y - 10} ${420 + w / 2} ${y + 40} Z`} fill={C.roofFar} stroke={KRP.ink} strokeWidth={3} />
                <rect x={420 - w / 2 + 30} y={y + 40} width={w - 60} height={30} fill="#B7A99A" />
                {Array.from({ length: Math.floor((w - 60) / 46) }, (_, j) => (
                  <rect key={j} x={420 - w / 2 + 42 + j * 46} y={y + 46} width={24} height={18} fill={C.lamp} opacity={0.55} />
                ))}
              </g>
            );
          })}
          <rect x={720} y={150} width={30} height={170} fill="#8C8079" stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={737 + i * 30 + Math.sin(f / 12 + i) * 8} cy={130 - i * 30 - (f % 40) * 0.4} r={24 + i * 8} fill={KRP.white} opacity={0.5 - i * 0.12} />
          ))}
        </g>
        {/* 朝の光の帯 */}
        <g opacity={0.1 + 0.08 * k}>
          {[0, 1, 2].map((i) => (
            <polygon key={i} points={`${1700 - i * 160},-40 ${1800 - i * 160},-40 ${1100 - i * 240},1100 ${960 - i * 240},1100`} fill={KRP.white} />
          ))}
        </g>
        {/* 突き当たりの朱の欄干 (橋のたもと) */}
        <g>
          <rect x={860} y={440} width={240} height={14} fill={C.rail} stroke={KRP.ink} strokeWidth={3} />
          <rect x={860} y={470} width={240} height={10} fill={C.rail} stroke={KRP.ink} strokeWidth={3} />
          {[870, 930, 990, 1050, 1090].map((x) => (
            <rect key={x} x={x - 5} y={430} width={10} height={64} fill={C.railDark} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
          {[870, 1090].map((x) => <circle key={x} cx={x} cy={426} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={2.5} />)}
        </g>
        {/* 石畳の道 (奥へすぼまる) */}
        <polygon points={`${VX - 110},500 ${VX + 110},500 1640,1120 280,1120`} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.stoneDark} strokeWidth={4} fill="none">
          {Array.from({ length: 8 }, (_, i) => {
            const u = (i + 1) / 9, y = lerp(500, 1120, u * u);
            const hw = lerp(110, 680, u * u);
            return <line key={i} x1={VX - hw - 10 * (1 - u)} y1={y} x2={VX + hw + 10} y2={y} />;
          })}
          {[-0.5, 0, 0.5].map((d, i) => <line key={i} x1={VX + d * 220} y1={500} x2={960 + d * 1360} y2={1120} />)}
        </g>
        {/* 左右の生垣 */}
        {([-1, 1] as const).map((side) => {
          const tops = hedgeTop(side);
          const near = side === -1 ? -40 : 1960;
          return (
            <g key={side}>
              <polygon points={`${near},${side === -1 ? 260 : 240} ${side === -1 ? 870 : 1090},440 ${side === -1 ? 870 : 1090},510 ${near},${side === -1 ? 1000 : 1020}`}
                fill={C.hedge} stroke={KRP.ink} strokeWidth={5} />
              {tops.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 2 ? C.hedge : C.hedgeLight} stroke={KRP.ink} strokeWidth={4} />
              ))}
              {/* 下の暗いところ */}
              <polygon points={`${near},${side === -1 ? 860 : 880} ${side === -1 ? 870 : 1090},500 ${side === -1 ? 870 : 1090},510 ${near},${side === -1 ? 1000 : 1020}`}
                fill={C.hedgeDark} opacity={0.7} />
              {/* そよぐ葉 */}
              {Array.from({ length: 14 }, (_, i) => {
                const u = rnd(11 + side, i);
                const x = side === -1 ? lerp(20, 820, u) : lerp(1900, 1130, u);
                const y = lerp(320, 470, u) + rnd(13, i) * lerp(500, 60, u);
                return <NAbLeaf key={i} x={x} y={y} s={lerp(1.6, 0.6, u)} rot={rnd(5, i) * 360 + Math.sin(f / 8 + i) * 14} fill={i % 3 ? C.hedgeLight : C.hedge} />;
              })}
            </g>
          );
        })}
        {/* 2人の長い朝の影 */}
        <ellipse cx={870} cy={940} rx={120} ry={20} fill={KRP.ink} opacity={0.18} />
        <ellipse cx={1110} cy={942} rx={160} ry={24} fill={KRP.ink} opacity={0.18} />
        {/* 千 (小さい・顔を上げる) */}
        <g transform={`rotate(${3 + 2 * listen} 850 935)`}>
          <Ushiro kind="sen" x={850} y={935} s={1.18} f={f} turn={0.25} />
        </g>
        {/* 聞き入る集中線 */}
        {listen > 0 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={listen}>
            <line x1={760} y1={560} x2={730} y2={530} />
            <line x1={748} y1={612} x2={708} y2={604} />
            <line x1={790} y1={520} x2={776} y2={482} />
          </g>
        )}
        {/* ハク (大きい・千のほうへ身をかがめる) */}
        <g transform={`rotate(${-9 - 2 * Math.sin(f / 16)} 1110 935)`}>
          <Ushiro kind="haku" x={1110} y={935} s={1.6} f={f} turn={-0.35} />
        </g>
        {/* 耳打ちの吹き出し (字は書かない・点だけ) */}
        {bub > 0 && (
          <g transform={`translate(930 400) scale(${bub})`}>
            <path d="M -90 -46 Q -90 -80 -50 -80 L 70 -80 Q 110 -80 110 -46 L 110 2 Q 110 34 70 34 L 0 34 L -40 70 L -30 34 L -50 34 Q -90 34 -90 2 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-40 + i * 50} cy={-22} r={13} fill={KRP.ink} opacity={seg(f, 16 + i * 5, 20 + i * 5)} />
            ))}
          </g>
        )}
        {/* 舞い落ちる葉 */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = (rnd(21, i) * 1800 + f * (3 + i % 3)) % 1900;
          const y = (rnd(22, i) * 700 + f * 2.4) % 900;
          return <NAbLeaf key={i} x={x} y={y} s={1.1} rot={f * 6 + i * 50} fill={i % 2 ? C.hedgeLight : KRP.green} />;
        })}
        {/* 道の小石 */}
        {[[620, 1000], [1320, 1010], [760, 860], [1240, 860]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={14} ry={8} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #12 名前を奪われると、帰り道がわからなくなる、と。
// 格: 山 / seed 4012
// どこ: 夕暮れの曇り空の丘の上。眼下の深い森を、来た道がくねって下り、遠くに朱の壁と時計塔のトンネルの建物
// 演出: ★帰り道が消える。霧が道の先 (トンネル) から手前へ流れて、道を1区間ずつ呑みこむ。
//       千尋の後ろ姿は足元まで霧が来て、一歩引く (驚きの線)
// 動き: f4〜14 トンネルが霧に呑まれる → f8〜40 道が奥から手前へ消える → f30〜38 千尋が一歩下がる。
//       カメラはゆっくり引いて、千尋がひとり取り残される
const NAB12_PATH: [number, number, number][] = [
  // [x, y, 道幅]  0=千尋の足元 … 11=トンネルの口
  [790, 1090, 330], [800, 900, 250], [860, 800, 190], [970, 745, 150], [1100, 705, 118], [1185, 655, 92],
  [1150, 605, 72], [1112, 568, 58], [1175, 532, 46], [1252, 503, 36], [1305, 478, 28], [1338, 458, 22],
];
const Nm012: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const P = NAB12_PATH;
  const cover = (j: number) => (j <= 2 ? 0 : easeOut(seg(f, 8 + (11 - j) * 3.3, 15 + (11 - j) * 3.3)));
  const tunnelFog = easeOut(seg(f, 4, 14));
  const step = easeOut(seg(f, 30, 38));
  const shock = seg(f, 32, 38);
  // 道の1区間 (台形)
  const piece = (j: number) => {
    const [x1, y1, w1] = P[j], [x2, y2, w2] = P[j + 1];
    return `M ${x1 - w1 / 2} ${y1} L ${x2 - w2 / 2} ${y2} L ${x2 + w2 / 2} ${y2} L ${x1 + w1 / 2} ${y1} Z`;
  };
  const tree = (x: number, y: number, s: number, i: number) => (
    <g key={`t${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-34} cy={6} r={44} fill={C.forestDark} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={34} cy={8} r={42} fill={C.forest} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-26} r={50} fill={i % 2 ? C.forestMid : C.forest} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  const trees: [number, number, number][] = [
    [180, 610, 1.3], [380, 640, 1.2], [560, 600, 1.0], [700, 660, 1.1], [300, 520, 0.8], [480, 520, 0.75], [660, 540, 0.8],
    [820, 600, 0.8], [900, 540, 0.65], [1000, 610, 0.7], [1020, 520, 0.55], [1240, 600, 0.6], [1380, 560, 0.6],
    [1500, 520, 0.65], [1620, 580, 0.9], [1780, 540, 1.0], [1860, 640, 1.3], [1420, 650, 0.9], [1100, 480, 0.45], [1200, 450, 0.4],
    [1460, 440, 0.45], [1580, 450, 0.5], [960, 470, 0.45], [820, 470, 0.5],
  ];
  return (
    <Frame f={f} seed={4012} bg={C.duskLow}>
      <defs>
        <linearGradient id="nab12sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 600) scale(${1.1 - 0.1 * k}) translate(-960 -600)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#nab12sky)" />
        {/* 流れる雲 */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${((i * 520 + f * (1.2 + i * 0.3)) % 2300) - 200} ${80 + i * 50})`} opacity={0.55}>
            <ellipse cx={0} cy={0} rx={160} ry={34} fill={KRP.white} />
            <ellipse cx={-60} cy={-18} rx={80} ry={30} fill={KRP.white} />
          </g>
        ))}
        {/* 遠い山並み */}
        <path d="M -60 430 Q 200 330 420 400 Q 640 300 900 380 Q 1160 290 1420 370 Q 1700 300 1980 390 L 1980 520 L -60 520 Z" fill="#8FA08E" stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        {/* 森の谷 */}
        <path d="M -60 470 Q 960 420 1980 470 L 1980 900 L -60 900 Z" fill={C.forestMid} />
        {trees.filter(([, y]) => y < 500).map(([x, y, s], i) => tree(x, y, s, i))}
        {/* トンネルの建物 (朱〜赤茶のしっくい・時計塔・黒いアーチ。飾り文字は描かない) */}
        <g>
          <rect x={1270} y={330} width={52} height={70} fill={C.tunnelWall} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1262 332 L 1296 296 L 1330 332 Z" fill={C.tunnelWallDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1296} cy={356} r={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 1296 356 L 1296 346 M 1296 356 L 1304 360" stroke={KRP.ink} strokeWidth={2.5} />
          <rect x={1210} y={392} width={250} height={74} fill={C.tunnelWall} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1210} y={392} width={250} height={12} fill={C.tunnelWallDark} />
          <path d="M 1306 466 L 1306 432 Q 1338 404 1370 432 L 1370 466 Z" fill={KRP.ink} />
        </g>
        {/* トンネルを呑む霧 */}
        <NAbMist x={1340} y={420} s={1.1 + 0.3 * tunnelFog} op={tunnelFog} />
        {/* 手前の木々 */}
        {trees.filter(([, y]) => y >= 500).map(([x, y, s], i) => tree(x, y, s, i + 40))}
        {/* 来た道 (奥の区間から順に霧に消える) */}
        {P.slice(0, -1).map((_, j) => (
          <g key={j} opacity={1 - 0.92 * cover(j + 1)}>
            <path d={piece(j)} fill={C.dirt} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${P[j][0]} ${P[j][1]} L ${P[j + 1][0]} ${P[j + 1][1]}`} stroke={C.dirtDark} strokeWidth={Math.max(2, P[j][2] * 0.04)} strokeDasharray="14 18" />
          </g>
        ))}
        {/* 道ばたの苔むした石像 (小さく) */}
        <g transform="translate(1238 560) scale(0.55)" opacity={1 - 0.9 * cover(8)}>
          <ellipse cx={0} cy={0} rx={40} ry={52} fill={C.statue} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -18 6 Q 0 20 18 6" stroke={C.statueDark} strokeWidth={5} fill="none" />
          <ellipse cx={0} cy={52} rx={46} ry={10} fill={C.statueDark} />
        </g>
        {/* 道を呑む霧 (奥から手前へ) */}
        {P.slice(1).map(([x, y, w], i) => {
          const j = i + 1;
          const c = cover(j);
          return <NAbMist key={j} x={x + Math.sin(f / 10 + j) * 10} y={y - 6} s={(0.25 + w / 160) * (0.6 + 0.5 * c)} op={c * 0.95} />;
        })}
        {/* 谷にたちこめる霧の帯 */}
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={i * 320 - 60 + Math.sin(f / 16 + i) * 20} cy={470 + (i % 2) * 30} rx={240} ry={44}
            fill={C.mist} opacity={(0.25 + 0.35 * seg(f, 10, 40)) * (i % 2 ? 0.8 : 1)} />
        ))}
        {/* 丘の頂 (手前の草地) */}
        <path d="M -60 820 Q 400 770 760 800 Q 1200 830 1980 790 L 1980 1140 L -60 1140 Z" fill={C.hillGrass} stroke={KRP.ink} strokeWidth={5} />
        <path d={piece(0)} fill={C.dirt} stroke={KRP.ink} strokeWidth={4} />
        <path d={piece(1)} fill={C.dirt} stroke={KRP.ink} strokeWidth={4} />
        <path d={piece(2)} fill={C.dirt} stroke={KRP.ink} strokeWidth={4} />
        {/* 道しるべの杭 (矢印の板・字なし) */}
        <g transform={`rotate(${-4 + Math.sin(f / 18)} 520 900)`}>
          <rect x={508} y={700} width={24} height={200} fill={C.frameWood} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 470 720 L 640 720 L 680 748 L 640 776 L 470 776 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 490 748 L 630 748" stroke={NP.grain} strokeWidth={4} />
        </g>
        {/* 草のそよぎ */}
        {Array.from({ length: 16 }, (_, i) => {
          const x = 40 + i * 120 + rnd(3, i) * 40;
          if (x > 620 && x < 980) return null;
          const y = 820 + rnd(4, i) * 60;
          const sw = Math.sin(f / 7 + i) * 10;
          return (
            <path key={i} d={`M ${x - 14} ${y + 30} Q ${x - 10} ${y} ${x - 6 + sw} ${y - 34} M ${x} ${y + 30} Q ${x + 2} ${y - 6} ${x + 6 + sw} ${y - 46} M ${x + 14} ${y + 30} Q ${x + 14} ${y + 4} ${x + 20 + sw} ${y - 26}`}
              stroke={C.hillGrassDark} strokeWidth={5} fill="none" strokeLinecap="round" />
          );
        })}
        {/* 足元まで来た霧 */}
        <NAbMist x={1040} y={735} s={0.75} op={cover(3) * 0.85} />
        {/* 千尋 (後ろ姿・一歩引く) */}
        <ellipse cx={780} cy={912 + 18 * step} rx={90} ry={16} fill={KRP.ink} opacity={0.2} />
        <g transform={`rotate(${-3 * step} 780 ${910 + 18 * step})`}>
          <Ushiro kind="chihiro" x={780} y={910 + 18 * step} s={1.22 + 0.06 * step} f={f} turn={0.15} />
        </g>
        {shock > 0 && (
          <g stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={shock}>
            <line x1={680} y1={540} x2={650} y2={506} />
            <line x1={780} y1={500} x2={780} y2={456} />
            <line x1={880} y1={540} x2={910} y2={506} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #13 しかもハク自身が、自分の本当の名前を思い出せずにいます。
// 格: 山 / seed 4013
// どこ: 夜の湯屋の朱の欄干。向こうは夜の海のような水面、水平線に遠い灯り。右の端に湯屋の朱の柱と光る窓
// 演出: 欄干に手をかけたハクの後ろ姿。頭の上に白い札が浮かぶが、字の場所は霧のように空白。
//       墨の筆あとが浮かびかけては霧に溶ける (思い出せない)。小さな「？」
// 動き: カメラがゆっくりハクから札へ上がる / 札の筆あとが f で浮かんでは消える / 霧が札の前を流れる /
//       星のまたたき・水面の灯りのゆらぎ / ハクがわずかに顔を上げる
const Nm013: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const plateIn = pop(seg(f, 4, 14));
  const HX = 860;
  // 筆あと (字にならない)
  const marks = [
    { d: "M -110 -24 Q -80 -40 -50 -22 M -90 -10 L -84 34", ph: 0 },
    { d: "M -20 -40 Q 0 -10 -10 30 M -36 4 Q 6 -2 26 8", ph: 9 },
    { d: "M 50 -30 Q 90 -36 110 -20 M 70 -30 Q 60 10 90 34", ph: 18 },
  ];
  return (
    <Frame f={f} seed={4013} bg={C.nightDeep} dark>
      <defs>
        <linearGradient id="nab13sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.nightDeep} />
          <stop offset="1" stopColor={C.night} />
        </linearGradient>
        <radialGradient id="nab13glow">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.55} />
          <stop offset="1" stopColor={NP.glowCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(0 ${-30 + 60 * k}) translate(960 540) scale(1.06) translate(-960 -540)`}>
        <rect x={-60} y={-120} width={W + 120} height={H + 200} fill="url(#nab13sky)" />
        {/* 星 */}
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={rnd(31, i) * 1900} cy={rnd(32, i) * 420 - 60} r={2 + rnd(33, i) * 3}
            fill={KRP.white} opacity={0.35 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
        ))}
        {/* 三日月 (雲にかかる) */}
        <path d="M 1380 40 A 52 52 0 1 0 1430 130 A 40 40 0 1 1 1380 40 Z" fill={C.lampCore} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={1440} cy={110} rx={120} ry={18} fill={C.night} opacity={0.8} />
        {/* 水平線の遠い灯り */}
        <rect x={-60} y={520} width={W + 120} height={360} fill={C.sea} />
        <rect x={-60} y={640} width={W + 120} height={240} fill={C.seaDeep} opacity={0.6} />
        <line x1={-60} y1={520} x2={W + 60} y2={520} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 14 }, (_, i) => {
          const x = 80 + i * 92 + rnd(34, i) * 30;
          if (x > 1400) return null;
          const fl = 0.6 + 0.4 * Math.sin(f / 5 + i * 2);
          return (
            <g key={i}>
              <circle cx={x} cy={512} r={5} fill={C.lamp} opacity={fl} />
              {[0, 1, 2].map((j) => (
                <line key={j} x1={x - 10 + j * 3 + Math.sin(f / 6 + j + i) * 5} y1={532 + j * 26} x2={x + 10 - j * 3 + Math.sin(f / 6 + j + i) * 5} y2={532 + j * 26}
                  stroke={C.lamp} strokeWidth={3} opacity={0.5 - j * 0.12} />
              ))}
            </g>
          );
        })}
        {/* 右の端: 湯屋の朱の柱と光る窓 */}
        <g>
          <rect x={1560} y={-120} width={420} height={900} fill={C.roofNight} />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <path d={`M 1520 ${60 + r * 190} L 1980 ${30 + r * 190} L 1980 ${70 + r * 190} L 1530 ${92 + r * 190} Z`} fill={C.roofNight} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2].map((c) => (
                <rect key={c} x={1610 + c * 120} y={110 + r * 190} width={80} height={100} fill={C.lamp} stroke={KRP.ink} strokeWidth={3}
                  opacity={0.75 + 0.25 * Math.sin(f / 7 + r + c)} />
              ))}
              <rect x={1580} y={92 + r * 190} width={16} height={150} fill={C.rail} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          <circle cx={1700} cy={400} r={260} fill="url(#nab13glow)" />
        </g>
        {/* 朱の欄干 (擬宝珠つき) */}
        <g>
          <rect x={-60} y={748} width={W + 120} height={30} fill={C.rail} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-60} y={748} width={W + 120} height={8} fill={KRP.white} opacity={0.18} />
          <rect x={-60} y={850} width={W + 120} height={22} fill={C.railDark} stroke={KRP.ink} strokeWidth={4} />
          {[150, 500, 1220, 1570].map((x) => (
            <g key={x}>
              <rect x={x - 20} y={720} width={40} height={260} fill={C.rail} stroke={KRP.ink} strokeWidth={5} />
              <rect x={x - 26} y={712} width={52} height={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${x - 18} 712 Q ${x - 22} 680 ${x} 664 Q ${x + 22} 680 ${x + 18} 712 Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={x} cy={660} r={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          ))}
        </g>
        {/* ハク (欄干に手をかけて、海を見る) */}
        <g transform={`rotate(${3 - 2 * k} ${HX} 890)`}>
          <Ushiro kind="haku" x={HX} y={890} s={1.8} f={f} />
          {/* 欄干にかけた手 */}
          {[-1, 1].map((sd) => (
            <ellipse key={sd} cx={HX + sd * 112} cy={756} rx={18} ry={13} fill="#F2D2B6" stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 頭から札へのぼる思いの粒 */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={HX + 30 + i * 18} cy={350 - i * 40} r={10 + i * 4} fill={C.slip} stroke={KRP.ink} strokeWidth={3}
            opacity={seg(f, 6 + i * 3, 10 + i * 3) * 0.9} />
        ))}
        {/* 浮かぶ白い札 (字の場所が空白) */}
        {plateIn > 0 && (
          <g transform={`translate(${HX + 60} ${180 + Math.sin(f / 12) * 6}) scale(${plateIn}) rotate(${-3 + Math.sin(f / 15) * 2})`}>
            <circle r={230} fill="url(#nab13glow)" />
            <rect x={-176} y={-80} width={352} height={160} rx={14} fill={KRP.ink} opacity={0.25} transform="translate(6 8)" />
            <rect x={-176} y={-80} width={352} height={160} rx={14} fill={C.slip} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-150} y={-56} width={300} height={112} rx={8} fill="none" stroke={KRP.gray} strokeWidth={3} strokeDasharray="10 9" />
            {/* 浮かんでは消える筆あと */}
            {marks.map((m, i) => {
              const op = Math.max(0, Math.sin((f - m.ph) / 7)) * 0.55;
              return <path key={i} d={m.d} stroke={NP.sumi} strokeWidth={13} fill="none" strokeLinecap="round" opacity={op}
                style={{ filter: `blur(${3 + (1 - op) * 4}px)` }} />;
            })}
            {/* 字を呑む霧 */}
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={((f * 4 + i * 140) % 420) - 210} cy={-10 + i * 24} rx={90} ry={26} fill={C.mist} opacity={0.75} />
            ))}
          </g>
        )}
        <QMark x={HX + 300} y={150} s={0.55} f={f} t={seg(f, 22, 30)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #14 名前をなくしたまま、別の名前で働くうちに、元の自分を忘れていく。
// 格: 山 / seed 4014
// どこ: 湯屋の大浴場。木の床が奥へ続き、右奥に大きな木の湯船と湯気、奥の板壁に丸い灯り
// 演出: 手前中央の太い柱に、名札「山田 花子」が釘で掛けてある (名札の初登場)。
//       その向こうを、作業着の従業員たちの後ろ姿が雑巾がけで一列に奥へ走っていく (濡れた跡が光る)
// 動き: f6〜40 で名札の字が少しずつかすれる (blur 0→0.8) / 湯気が札の前を横切る /
//       雑巾がけの列が奥へ進む / カメラが名札へゆっくり寄る
const Nm014: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const blur = 0.8 * easeInOut(seg(f, 6, 40));
  const VX = 960, VY = 330;
  const workers = [0, 1, 2, 3].map((i) => {
    const u = (0.08 + i * 0.21 + f * 0.0035) % 1;
    return { u, x: lerp(430, 830, u), y: lerp(800, 440, u), s: lerp(0.78, 0.3, u), i };
  }).sort((a, b) => b.u - a.u);
  return (
    <Frame f={f} seed={4014} bg={C.wallWood}>
      <g transform={`translate(960 470) scale(${1 + 0.1 * k}) translate(-960 -470)`}>
        {/* 奥の板壁と格子・丸い灯り */}
        <rect x={-60} y={-60} width={W + 120} height={VY + 70} fill={C.wallWood} />
        <g stroke={C.wallWoodDark} strokeWidth={5}>
          {Array.from({ length: 20 }, (_, i) => <line key={i} x1={i * 104} y1={-60} x2={i * 104} y2={VY + 10} />)}
          <line x1={-60} y1={120} x2={W + 60} y2={120} />
        </g>
        {[260, 640, 1280, 1660].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={200} r={70} fill={C.lamp} opacity={0.25} />
            <ellipse cx={x} cy={200} rx={36} ry={44} fill={C.lampCore} stroke={KRP.ink} strokeWidth={4} opacity={0.85 + 0.15 * Math.sin(f / 6 + i)} />
            <rect x={x - 20} y={150} width={40} height={10} fill={KRP.ink} />
          </g>
        ))}
        {/* 木の床 (奥へすぼまる板目) */}
        <polygon points={`-60,${VY + 10} ${W + 60},${VY + 10} ${W + 60},${H + 60} -60,${H + 60}`} fill={C.floorWood} />
        <g stroke={C.floorWoodDark} strokeWidth={4}>
          {Array.from({ length: 17 }, (_, i) => {
            const bx = -600 + i * 195;
            return <line key={i} x1={VX + (bx - VX) * 0.08} y1={VY + 10} x2={bx} y2={H + 60} />;
          })}
          {[0.12, 0.3, 0.55, 0.85].map((u, i) => <line key={i} x1={-60} y1={lerp(VY + 10, H + 60, u)} x2={W + 60} y2={lerp(VY + 10, H + 60, u)} opacity={0.5} />)}
        </g>
        <line x1={-60} y1={VY + 10} x2={W + 60} y2={VY + 10} stroke={KRP.ink} strokeWidth={5} />
        {/* 右奥の大きな木の湯船 */}
        <g>
          <path d="M 1200 470 L 1200 590 Q 1520 660 1840 590 L 1840 470 Z" fill={C.tub} stroke={KRP.ink} strokeWidth={6} />
          {[1290, 1400, 1520, 1640, 1750].map((x) => <line key={x} x1={x} y1={500} x2={x} y2={620} stroke={C.tubDark} strokeWidth={4} />)}
          <rect x={1196} y={540} width={648} height={14} fill={C.tubDark} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={1520} cy={470} rx={320} ry={80} fill={C.tubDark} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={1520} cy={474} rx={290} ry={64} fill={C.bathWater} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={1500} cy={480} rx={180} ry={30} fill={C.bathWaterDeep} opacity={0.5} />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={1440 + i * 90} cy={470 + i * 8} rx={30 + ((f + i * 10) % 30)} ry={8 + ((f + i * 10) % 30) * 0.25}
              fill="none" stroke={KRP.white} strokeWidth={3} opacity={1 - ((f + i * 10) % 30) / 30} />
          ))}
        </g>
        {/* 湯気 */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = ((f * 1.2 + i * 40) % 240) / 240;
          return <ellipse key={i} cx={1380 + i * 60 + Math.sin(f / 14 + i) * 30} cy={430 - t * 420} rx={70 + t * 60} ry={40 + t * 30}
            fill={KRP.white} opacity={0.35 * (1 - t)} />;
        })}
        {/* 雑巾がけの列 (奥へ走る後ろ姿) */}
        {workers.map((w) => (
          <g key={w.i}>
            {/* 濡れて光る跡 */}
            <path d={`M ${w.x - 40 * w.s} ${w.y} L ${w.x + 40 * w.s} ${w.y} L ${w.x + 70 * w.s + 30} ${w.y + 140 * w.s + 30} L ${w.x - 70 * w.s - 30} ${w.y + 140 * w.s + 30} Z`}
              fill={KRP.blueSoft} opacity={0.35} />
            <ellipse cx={w.x} cy={w.y} rx={70 * w.s} ry={14 * w.s} fill={KRP.ink} opacity={0.2} />
            <g transform={`translate(${w.x} ${w.y}) scale(1 0.62) translate(${-w.x} ${-w.y})`}>
              <Ushiro kind="sen" x={w.x} y={w.y} s={w.s} f={f + w.i * 7} walk />
            </g>
            {/* 両脇からのぞく雑巾 */}
            <rect x={w.x - 70 * w.s} y={w.y - 36 * w.s} width={140 * w.s} height={22 * w.s} rx={4} fill={C.rag} stroke={KRP.ink} strokeWidth={3} />
            {/* 水しぶき */}
            {[0, 1, 2].map((j) => (
              <circle key={j} cx={w.x + (j - 1) * 50 * w.s} cy={w.y - 10 - ((f + j * 4 + w.i * 3) % 12) * 3 * w.s} r={5 * w.s + 2}
                fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2} />
            ))}
          </g>
        ))}
        {/* 手前中央の太い柱 */}
        <rect x={880} y={-60} width={160} height={960} fill={C.pillar} stroke={KRP.ink} strokeWidth={7} />
        <rect x={880} y={-60} width={40} height={960} fill={C.pillarDark} opacity={0.5} />
        <g stroke={C.pillarDark} strokeWidth={4} fill="none" opacity={0.7}>
          <path d="M 960 40 q 18 120 0 240 q -16 120 4 260" />
          <path d="M 1006 120 q 12 160 -4 300" />
        </g>
        <rect x={866} y={880} width={188} height={34} rx={4} fill={C.pillarDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 名札を掛ける釘 */}
        <circle cx={960} cy={294} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <Nafuda x={960} y={470} s={1.15} text="山田 花子" blur={blur} f={f} />
        {/* 札の前を横切る湯気 */}
        {[0, 1].map((i) => {
          const t = ((f * 3 + i * 260) % 520) / 520;
          return <ellipse key={i} cx={lerp(560, 1400, t)} cy={440 + i * 70} rx={160} ry={42} fill={KRP.white} opacity={0.32 * Math.sin(t * Math.PI)} />;
        })}
        {/* 柱の根元の桶とたわし */}
        <g>
          <path d="M 1090 830 L 1100 900 L 1210 900 L 1220 830 Z" fill={C.tub} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1155} cy={830} rx={65} ry={16} fill={C.bathWater} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1096} y={852} width={118} height={10} fill={C.tubDark} />
          <ellipse cx={760} cy={890} rx={50} ry={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          {[-30, -10, 10, 30].map((d) => <line key={d} x1={760 + d} y1={878} x2={760 + d} y2={868} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #15 この映画には、2つの怖さが描かれています。
// 格: 図 / seed 4015
// どこ: 暗い劇場の映写室 (#195〜#197 と同じ部屋)。夜の藍色〜こげ茶の壁・左右に赤いビロードの幕・
//       手前に赤い客席の背もたれが一列・額縁つきの長方形スクリーンが2枚・間の下に灰色の映写機 (三脚・2つのリール)
// 演出: 映写機がカタカタ回り始め、光の筋が左→右のスクリーンへ伸びて白く灯る。中身はまだ空。札「1」「2」「2つの怖さ」
// 動き: f0〜8 リールが回りだす (本体が小さく震える) → f4〜16 左が灯る → f16〜28 右が灯る → f30〜38 題の札。
//       光の中のホコリ / カメラがわずかに寄る
// ※#15〜#17 は同じ映写室の続き。#17 の最後の配置が #195 とほぼ同じになるようにそろえてある

// スクリーンの内側 (額縁の内側の白い面)。中身はスクリーン中心を原点に描く (幅584・高さ384)
const NAB_SCR = {
  L: { x: 258, y: 128, cx: 550, cy: 320 },
  R: { x: 1078, y: 128, cx: 1370, cy: 320 },
  w: 584, h: 384,
};
const NAB_LENS: [number, number] = [1062, 664];

// 映写機 (#195 の灰色の映写機と同じ形・寸法)。x,y は本体の中心
const NAbProjector: React.FC<{ x: number; y: number; s?: number; rot: number; lensRot?: number; on?: number }> = ({ x, y, s = 1, rot, lensRot = -28, on = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 三脚 */}
    <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
      <line x1={0} y1={60} x2={-90} y2={190} />
      <line x1={0} y1={60} x2={90} y2={190} />
      <line x1={0} y1={60} x2={0} y2={200} />
    </g>
    <g stroke={C.metal} strokeWidth={3} strokeLinecap="round">
      <line x1={0} y1={62} x2={-88} y2={186} />
      <line x1={0} y1={62} x2={88} y2={186} />
    </g>
    {/* フィルムの輪 */}
    <path d="M -70 -90 Q -110 -10 -80 40 M 70 -100 Q 110 -20 90 30" stroke={KRP.ink} strokeWidth={5} fill="none" />
    {/* リール 2つ (回る) */}
    {[[-70, -110, 1], [70, -120, -1]].map(([rx, ry, d], i) => (
      <g key={i} transform={`translate(${rx} ${ry}) rotate(${rot * d})`}>
        <circle r={62} fill={C.metalDark} stroke={KRP.ink} strokeWidth={6} />
        <circle r={50} fill={C.metal} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={Math.cos((k * 2 * Math.PI) / 3) * 28} cy={Math.sin((k * 2 * Math.PI) / 3) * 28} r={13} fill={C.theater} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <circle r={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
    {/* 本体 */}
    <rect x={-120} y={-60} width={240} height={120} rx={18} fill={C.metal} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-104} y={-44} width={120} height={40} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={3} />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={-96 + k * 28} y1={14} x2={-96 + k * 28} y2={46} stroke={C.metalDark} strokeWidth={6} strokeLinecap="round" />)}
    <circle cx={50} cy={20} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
    {/* レンズ */}
    <g transform={`translate(110 -10) rotate(${lensRot})`}>
      <rect x={0} y={-30} width={70} height={60} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={72} cy={0} rx={12} ry={30} fill={on > 0.01 ? NP.glowCore : C.screenOff} stroke={KRP.ink} strokeWidth={5} />
    </g>
  </g>
);

// 映写室 (#15〜#17 で共通の舞台。#195 と同じ部屋)
// Lb/Rb = 光の筋の伸び (0→1)、L/R = スクリーンが灯る度合い (0→1)
const NAbProjRoom: React.FC<{
  f: number; id: string; L: number; R: number; Lb?: number; Rb?: number; spin?: number; shake?: number;
  leftC?: React.ReactNode; rightC?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, id, L, R, Lb = L, Rb = R, spin = 1, shake = 0, leftC, rightC, children }) => {
  const { w, h } = NAB_SCR;
  const screen = (side: "L" | "R", lit: number, content?: React.ReactNode) => {
    const s = NAB_SCR[side];
    const flick = lit > 0 && lit < 1 ? 0.7 + 0.3 * Math.abs(Math.sin(f * 2.3 + (side === "L" ? 0 : 1.7))) : 1;
    return (
      <g key={side}>
        {/* 灯ったスクリーンのまわりのにじみ */}
        <rect x={s.x - 32} y={s.y - 28} width={w + 64} height={h + 56} fill={NP.glow} opacity={0.22 * lit} />
        {/* 額縁 */}
        <rect x={s.x - 20} y={s.y - 20} width={w + 40} height={h + 40} rx={10} fill={C.theater} stroke={KRP.ink} strokeWidth={8} />
        <rect x={s.x} y={s.y} width={w} height={h} fill={C.screenOff} />
        <rect x={s.x} y={s.y} width={w} height={h} fill={C.screenOn} opacity={lit * flick} />
        {content && lit > 0.01 && (
          <g clipPath={`url(#${id}${side})`} opacity={lit * flick}>
            <g transform={`translate(${s.cx} ${s.cy})`}>{content}</g>
            {/* 映写の光のあたたかい色かぶり */}
            <rect x={s.x} y={s.y} width={w} height={h} fill={NP.glowCore} opacity={0.14} />
          </g>
        )}
        {/* 額縁の内側の影 */}
        <rect x={s.x} y={s.y} width={w} height={h} fill="none" stroke={C.theater} strokeWidth={10} opacity={0.35} />
        {/* スクリーン上端の留め穴 */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={s.x + 14 + i * 58} y={s.y + 8} width={22} height={12} rx={3} fill={C.theater} opacity={lit > 0.5 ? 0.5 : 0.7} />
        ))}
      </g>
    );
  };
  const beam = (side: "L" | "R", b: number) => {
    if (b <= 0.001) return null;
    const s = NAB_SCR[side];
    const [lx, ly] = NAB_LENS;
    const x0 = lerp(lx, s.x, b), x1 = lerp(lx, s.x + w, b);
    const y0 = lerp(ly, s.y, b), y1 = lerp(ly, s.y + h, b);
    return (
      <g key={side} opacity={b}>
        <polygon points={`${lx},${ly} ${x0},${y1} ${x0},${y0} ${x1},${y0} ${x1},${y1}`} fill={`url(#${id}beam${side})`} opacity={0.42} />
        {Array.from({ length: 12 }, (_, i) => {
          const u = (rnd(4015 + (side === "L" ? 0 : 9), i) + f * 0.004 * (1 + rnd(4016, i))) % 1;
          const v = rnd(4017 + (side === "L" ? 0 : 9), i);
          const px = lerp(lx, s.x + 20 + v * (w - 40), u * b);
          const py = lerp(ly, s.y + 20 + v * (h - 40), u * b) + Math.sin(f / 7 + i) * 6;
          return <circle key={i} cx={px} cy={py} r={2.5 + rnd(4018, i) * 3} fill={NP.glowCore} opacity={0.7 * Math.sin(u * Math.PI)} />;
        })}
      </g>
    );
  };
  return (
    <g>
      <defs>
        <clipPath id={`${id}L`}><rect x={NAB_SCR.L.x} y={NAB_SCR.L.y} width={w} height={h} /></clipPath>
        <clipPath id={`${id}R`}><rect x={NAB_SCR.R.x} y={NAB_SCR.R.y} width={w} height={h} /></clipPath>
        <linearGradient id={`${id}beamR`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.9} />
          <stop offset="1" stopColor={NP.glow} stopOpacity={0.25} />
        </linearGradient>
        <linearGradient id={`${id}beamL`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.9} />
          <stop offset="1" stopColor={NP.glow} stopOpacity={0.25} />
        </linearGradient>
      </defs>
      {/* 壁と天井 */}
      <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.theaterWall} />
      <rect x={-80} y={-40} width={W + 160} height={80} fill={C.theater} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i * 180 - 60} y={40} width={8} height={760} fill={C.theater} opacity={0.35} />
      ))}
      {/* 両脇のビロードの幕 */}
      {[[-80, 1], [W + 80, -1]].map(([ex, d], i) => (
        <g key={i}>
          <path d={`M ${ex} -40 L ${ex + d * 230} -40 Q ${ex + d * 170} 400 ${ex + d * 210} 860 L ${ex} 860 Z`} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
          {[60, 120, 170].map((k) => (
            <path key={k} d={`M ${ex + d * k} -30 Q ${ex + d * (k - 20 + Math.sin(f / 20 + k) * 4)} 400 ${ex + d * (k + 10)} 850`} stroke={C.velvetDark} strokeWidth={8} fill="none" />
          ))}
        </g>
      ))}
      {screen("L", L, leftC)}
      {screen("R", R, rightC)}
      {beam("L", Lb)}
      {beam("R", Rb)}
      {children}
      {/* 映写機 (回り始めはカタカタ震える) */}
      <g transform={`translate(${Math.sin(f * 3.1) * 2 * shake} ${Math.sin(f * 4.7) * 2.5 * shake})`}>
        <NAbProjector x={960} y={700} rot={f * 5 * spin} on={Math.max(Lb, Rb)} />
      </g>
      {/* 客席の背もたれ */}
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <path d={`M ${i * 190 - 40} 1090 L ${i * 190 - 40} 900 Q ${i * 190 + 50} 860 ${i * 190 + 140} 900 L ${i * 190 + 140} 1090 Z`} fill={C.seat} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${i * 190 - 20} 920 Q ${i * 190 + 50} 890 ${i * 190 + 120} 920`} stroke={C.velvetDark} strokeWidth={6} fill="none" />
        </g>
      ))}
    </g>
  );
};

const Nm015: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const spin = seg(f, 0, 8);
  const Lb = easeOut(seg(f, 4, 12));
  const L = seg(f, 8, 16);
  const Rb = easeOut(seg(f, 16, 24));
  const R = seg(f, 20, 28);
  const shake = spin * (1 - 0.6 * seg(f, 20, 42));
  return (
    <Frame f={f} seed={4015} bg={C.theater} dark>
      <g transform={`translate(960 420) scale(${1 + 0.03 * k}) translate(-960 -420)`}>
        <NAbProjRoom f={f} id="nab15" L={L} R={R} Lb={Lb} Rb={Rb} spin={spin} shake={shake}>
          {/* スクリーンの番号札 */}
          <TagPlate x={NAB_SCR.L.cx} y={600} text="1" size={42} fill={NP.wood} t={seg(f, 12, 18)} />
          <TagPlate x={NAB_SCR.R.cx} y={600} text="2" size={42} fill={NP.wood} t={seg(f, 24, 30)} />
          <TagPlate x={960} y={66} text="2つの怖さ" size={40} fill={NP.wood} t={seg(f, 30, 38)} color={KRP.red} />
        </NAbProjRoom>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #16 ひとつは、帰り道がわからなくなる怖さ。
// 格: 並 / seed 4016
// どこ: #15 と同じ映写室 (続き)。カメラは左のスクリーンに寄る
// 演出: 左のスクリーンに #12 の「霧に消える道」が映る (丘・千尋の後ろ姿・下る道・遠いトンネル)。
//       スクリーンの下に木の札「帰り道がわからなくなる」。右のスクリーンはまだ暗い
// 動き: 霧が奥から手前へ道を呑んでいく / リールが回る / カメラが左へ寄る / 札は f22〜30

// スクリーンの中の絵1: 霧に消える道 (#12 の縮図)。fog 0→1 で道が奥から消える
const NAbMiniRoad: React.FC<{ f: number; fog: number }> = ({ f, fog }) => {
  const pts: [number, number, number][] = [[-40, 260, 170], [-30, 150, 120], [20, 80, 84], [90, 40, 60], [130, 0, 44], [100, -40, 32], [140, -70, 22], [170, -90, 16]];
  return (
    <g>
      <rect x={-320} y={-260} width={640} height={200} fill={C.duskTop} />
      <rect x={-320} y={-120} width={640} height={80} fill={C.duskLow} opacity={0.8} />
      <path d="M -320 -70 Q -200 -120 -120 -110 Q 0 -90 0 -90 Q 120 -140 320 -80 L 320 40 L -320 40 Z" fill="#8FA08E" stroke={KRP.ink} strokeWidth={3} />
      <rect x={-320} y={-90} width={640} height={260} fill={C.forestMid} />
      {[[-280, -20], [-200, -40], [-120, 0], [-190, 60], [-270, 70], [220, -30], [230, 50], [290, 10], [40, -60], [-60, -70]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={34 + (i % 3) * 8} fill={i % 2 ? C.forest : C.forestDark} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 遠いトンネル */}
      <g transform="translate(170 -96)">
        <rect x={-40} y={-18} width={80} height={36} fill={C.tunnelWall} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-12} y={-40} width={22} height={24} fill={C.tunnelWall} stroke={KRP.ink} strokeWidth={3} />
        <path d="M -12 18 L -12 4 Q 0 -8 12 4 L 12 18 Z" fill={KRP.ink} />
      </g>
      {pts.slice(0, -1).map((p, j) => {
        const q = pts[j + 1];
        const c = clamp01((fog - (1 - (j + 1) / 7)) * 4);
        return (
          <g key={j}>
            <path d={`M ${p[0] - p[2] / 2} ${p[1]} L ${q[0] - q[2] / 2} ${q[1]} L ${q[0] + q[2] / 2} ${q[1]} L ${p[0] + p[2] / 2} ${p[1]} Z`}
              fill={C.dirt} stroke={KRP.ink} strokeWidth={3} opacity={1 - 0.9 * c} />
            <NAbMist x={q[0] + Math.sin(f / 9 + j) * 5} y={q[1]} s={0.12 + q[2] / 260} op={c} />
          </g>
        );
      })}
      <NAbMist x={170} y={-96} s={0.45} op={clamp01(fog * 3)} />
      {/* 手前の丘と千尋 */}
      <path d="M -320 150 Q 0 120 320 150 L 320 260 L -320 260 Z" fill={C.hillGrass} stroke={KRP.ink} strokeWidth={3} />
      <path d="M -125 260 L -90 150 L 30 150 L 45 260 Z" fill={C.dirt} stroke={KRP.ink} strokeWidth={3} />
      <Ushiro kind="chihiro" x={-60} y={200} s={0.5} f={f} />
    </g>
  );
};

const Nm016: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 30));
  const fog = 0.2 + 0.8 * easeInOut(seg(f, 4, 40));
  const L = 0.6 + 0.4 * seg(f, 0, 6);
  return (
    <Frame f={f} seed={4016} bg={C.theater} dark>
      <g transform={`translate(560 420) scale(${1.02 + 0.08 * k}) translate(-560 -420)`}>
        <NAbProjRoom f={f} id="nab16" L={L} R={0} Lb={1} Rb={0}
          leftC={<g transform="translate(0 -40)"><NAbMiniRoad f={f} fog={fog} /></g>}>
          <TagPlate x={NAB_SCR.L.cx} y={600} text="帰り道がわからなくなる" size={38} fill={NP.wood} t={seg(f, 22, 30)} />
        </NAbProjRoom>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #17 もうひとつは、元の自分を忘れてしまう怖さ。
// 格: 並 / seed 4017
// どこ: #15〜#16 と同じ映写室 (続き)。カメラは右のスクリーン寄りから引いて、2枚を並べて見せる
// 演出: 右のスクリーンに #14 の「かすれる名札」が映る (湯屋の柱に掛かった名札・湯気)。
//       下に札「元の自分を忘れる」。左のスクリーン (霧の道) と札も灯ったまま。2枚が並ぶ
//       (最後の配置は #195 とほぼ同じ: スクリーン位置・札の文言・映写機の位置)
// 動き: f0〜8 光の筋が右へ → f4〜12 右がちらついて灯る → 名札の字がさらにかすれる → f14〜22 札 →
//       カメラが f0〜34 で引いて2枚を並べる / 湯気が流れる

// スクリーンの中の絵2: 柱に掛かったかすれる名札 (#14 の縮図)
const NAbMiniNafuda: React.FC<{ f: number; blur: number }> = ({ f, blur }) => (
  <g>
    <rect x={-320} y={-260} width={640} height={520} fill={C.wallWood} />
    <g stroke={C.wallWoodDark} strokeWidth={4}>
      {[-280, -200, -120, -40, 40, 120, 200, 280].map((x) => <line key={x} x1={x} y1={-260} x2={x} y2={90} />)}
    </g>
    <rect x={-320} y={90} width={640} height={170} fill={C.floorWood} />
    <line x1={-320} y1={90} x2={320} y2={90} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={-170} cy={-120} r={26} fill={C.lampCore} stroke={KRP.ink} strokeWidth={3} />
    <circle cx={170} cy={-120} r={26} fill={C.lampCore} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-60} y={-260} width={120} height={380} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-60} y={-260} width={28} height={380} fill={C.pillarDark} opacity={0.5} />
    <circle cx={0} cy={-110} r={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
    <Nafuda x={0} y={-10} s={0.62} text="山田 花子" blur={blur} f={f} />
    {[0, 1].map((i) => {
      const t = ((f * 2.5 + i * 200) % 400) / 400;
      return <ellipse key={i} cx={lerp(-340, 340, t)} cy={-20 + i * 50} rx={110} ry={28} fill={KRP.white} opacity={0.35 * Math.sin(t * Math.PI)} />;
    })}
  </g>
);

const Nm017: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 34));
  const Rb = easeOut(seg(f, 0, 8));
  const R = seg(f, 4, 12);
  const blur = 0.45 + 0.4 * easeInOut(seg(f, 10, 40));
  return (
    <Frame f={f} seed={4017} bg={C.theater} dark>
      <g transform={`translate(1370 420) scale(${1.1 - 0.1 * k}) translate(-1370 -420)`}>
        <NAbProjRoom f={f} id="nab17" L={1} R={R} Lb={1} Rb={Rb}
          leftC={<g transform="translate(0 -40)"><NAbMiniRoad f={f} fog={0.95} /></g>}
          rightC={<NAbMiniNafuda f={f} blur={blur} />}>
          <TagPlate x={NAB_SCR.L.cx} y={600} text="帰り道がわからなくなる" size={38} fill={NP.wood} t={1} />
          <TagPlate x={NAB_SCR.R.cx} y={600} text="元の自分を忘れる" size={42} fill={NP.wood} t={seg(f, 14, 22)} />
        </NAbProjRoom>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #18 でも、名前は、ただの呼び名のはずです。
// 格: 並 / seed 4018
// どこ: 明るい現代の作業部屋。窓から昼の光、からくりの作業台 (歯車・ねじ回し・卓上ランプ)、棚
// 演出: ナレーター役の人が、手のひらに載せた小さな秤に名札「山田 花子」(字ははっきり) を載せて首をかしげる。
//       秤の針はほとんど動かない (軽い)
// 動き: f8〜16 名札が秤にそっと載る (小さく弾む) → 針がほんの少しだけ振れて0近くで揺れる →
//       f20〜34 首をかしげる → f28〜36「？」/ カーテンと観葉植物がそよぐ / カメラが少し寄る
const Nm018: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const drop = easeOut(seg(f, 8, 16));
  const bounce = f > 16 ? Math.sin((f - 16) / 1.6) * 6 * Math.exp(-(f - 16) / 6) : 0;
  const tilt = easeInOut(seg(f, 20, 34));
  const lean = -2 - 6 * tilt;
  const PX = 760, PY = 880, PS = 1.5;
  // 右手 (pose=point の手) の位置を lean の回転込みで求める
  const a = (lean * Math.PI) / 180;
  const hx0 = 153 * PS, hy0 = -148 * PS;
  const hx = PX + hx0 * Math.cos(a) - hy0 * Math.sin(a);
  const hy = PY + hx0 * Math.sin(a) + hy0 * Math.cos(a) - 8;
  const needle = -120 + 9 * seg(f, 14, 20) + Math.sin(f / 2) * 4 * Math.exp(-Math.max(0, f - 16) / 10) * (f > 14 ? 1 : 0);
  return (
    <Frame f={f} seed={4018} bg={C.roomWall}>
      <g transform={`translate(900 560) scale(${1 + 0.06 * k}) translate(-900 -560)`}>
        {/* 壁 (縦じまの壁紙) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.roomWall} />
        <g stroke={C.roomWallLine} strokeWidth={6}>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 92} y1={-60} x2={i * 92} y2={820} />)}
        </g>
        {/* 窓と昼の光 */}
        <polygon points="120,140 470,140 900,820 380,820" fill={KRP.yellow} opacity={0.12} />
        <rect x={100} y={120} width={380} height={440} rx={8} fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${((i * 220 + f * 0.8) % 440) + 60} ${210 + i * 110})`}>
            <ellipse cx={0} cy={0} rx={60} ry={18} fill={KRP.white} />
            <ellipse cx={-20} cy={-12} rx={30} ry={16} fill={KRP.white} />
          </g>
        ))}
        <rect x={100} y={120} width={380} height={440} rx={8} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <line x1={290} y1={120} x2={290} y2={560} stroke={KRP.white} strokeWidth={14} />
        <line x1={100} y1={340} x2={480} y2={340} stroke={KRP.white} strokeWidth={14} />
        <rect x={80} y={556} width={420} height={22} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* カーテン (そよぐ) */}
        <path d={`M 40 100 L 140 100 Q ${120 + Math.sin(f / 10) * 10} 340 ${150 + Math.sin(f / 10) * 14} 590 L 40 590 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <rect x={20} y={88} width={520} height={16} rx={8} fill={C.frameWood} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓辺の観葉植物 */}
        <g transform="translate(410 556)">
          <path d="M -36 -60 L -28 0 L 28 0 L 36 -60 Z" fill={C.pot} stroke={KRP.ink} strokeWidth={4} />
          {[-50, -20, 10, 40].map((r, i) => (
            <g key={i} transform={`rotate(${r + Math.sin(f / 9 + i) * 4}) translate(0 -60)`}>
              <path d="M 0 0 Q 22 -40 0 -90 Q -22 -40 0 0 Z" fill={C.plant} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
        </g>
        {/* 右の壁の棚 (瓶・歯車・本) */}
        <g>
          <rect x={1300} y={260} width={520} height={18} fill={C.bench} stroke={KRP.ink} strokeWidth={4} />
          {[[1330, 160, KRP.red], [1380, 180, KRP.blueDeep], [1424, 150, KRP.green], [1468, 170, KRP.orange]].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width={40} height={260 - (y as number)} fill={c as string} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <path d="M 1560 260 L 1560 190 Q 1560 176 1576 176 L 1624 176 Q 1640 176 1640 190 L 1640 260 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          <g transform={`translate(1730 214) rotate(${f * 2})`}>
            <circle r={40} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-8} y={-52} width={16} height={16} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i * 45})`} />)}
            <circle r={12} fill={C.roomWall} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 壁の時計 */}
          <circle cx={1560} cy={520} r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={1560} y1={520} x2={1560} y2={470} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={1560} y1={520} x2={1560 + Math.cos(f / 12) * 44} y2={520 + Math.sin(f / 12) * 44} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
        </g>
        {/* ナレーター役 (首をかしげる・手のひらの秤を見る) */}
        <Person x={PX} y={PY} s={PS} f={f} pose="point" pointDir={1} lean={lean} face="normal" gaze={[9, -3]}
          cloth={KRP.blueDeep} clothDark="#34558A" />
        {/* 手のひらの小さな秤と名札 */}
        <g transform={`translate(${hx} ${hy})`}>
          <rect x={-56} y={-20} width={112} height={22} rx={6} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-62} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 9 }, (_, i) => {
            const an = ((-120 + i * 30) * Math.PI) / 180;
            return <line key={i} x1={Math.cos(an) * 34} y1={-62 + Math.sin(an) * 34} x2={Math.cos(an) * 42} y2={-62 + Math.sin(an) * 42} stroke={KRP.ink} strokeWidth={i === 0 ? 5 : 3} />;
          })}
          <text x={-28} y={-74} fontFamily={FONT} fontWeight={900} fontSize={18} fill={KRP.red}>0</text>
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill={KRP.ink}>g</text>
          <line x1={0} y1={-62} x2={Math.cos((needle * Math.PI) / 180) * 36} y2={-62 + Math.sin((needle * Math.PI) / 180) * 36} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={-62} r={6} fill={KRP.ink} />
          <rect x={-6} y={-122} width={12} height={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={0} cy={-124} rx={86} ry={13} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {/* 名札 (上からそっと載る) */}
          <g opacity={seg(f, 6, 9)}>
            <Nafuda x={0} y={-174 - (1 - drop) * 90 - bounce} s={0.42} text="山田 花子" hang={false} rot={4} f={0} />
          </g>
          {/* 「軽い」を示すふわっとした線 */}
          {f > 18 && [0, 1].map((i) => (
            <path key={i} d={`M ${110 + i * 16} ${-200 + i * 30} q 14 -10 0 -22`} stroke={KRP.grayDark} strokeWidth={4} fill="none" strokeLinecap="round" opacity={seg(f, 18 + i * 3, 24 + i * 3) * (0.6 + 0.4 * Math.sin(f / 4 + i))} />
          ))}
        </g>
        <QMark x={PX - 150} y={PY - 470} s={0.7} f={f} t={seg(f, 28, 36)} />
        {/* からくりの作業台 */}
        <rect x={-60} y={796} width={W + 120} height={40} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={836} width={W + 120} height={300} fill={C.benchDark} stroke={KRP.ink} strokeWidth={5} />
        {[240, 760, 1280, 1700].map((x) => (
          <g key={x}>
            <rect x={x - 150} y={866} width={300} height={140} rx={8} fill={C.bench} stroke={KRP.ink} strokeWidth={4} />
            <rect x={x - 30} y={900} width={60} height={14} rx={7} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 台の上の小物 */}
        <g transform={`translate(260 760) rotate(${f * 3})`}>
          <circle r={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-7} y={-44} width={14} height={14} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i * 60})`} />)}
          <circle r={10} fill={C.bench} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="rotate(-8 1240 786)">
          <rect x={1160} y={778} width={110} height={16} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1270} y={782} width={70} height={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g>
          <ellipse cx={1600} cy={792} rx={70} ry={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1600 790 L 1560 660 L 1660 590" stroke={KRP.grayDark} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M 1630 560 L 1720 600 L 1690 660 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1705} cy={640} rx={40} ry={60} fill={KRP.yellow} opacity={0.15} />
        </g>
        <rect x={1380} y={746} width={120} height={50} rx={6} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1380} y={746} width={120} height={14} rx={5} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_010: (f) => <Nm010 f={f} />,
  nm_011: (f) => <Nm011 f={f} />,
  nm_012: (f) => <Nm012 f={f} />,
  nm_013: (f) => <Nm013 f={f} />,
  nm_014: (f) => <Nm014 f={f} />,
  nm_015: (f) => <Nm015 f={f} />,
  nm_016: (f) => <Nm016 f={f} />,
  nm_017: (f) => <Nm017 f={f} />,
  nm_018: (f) => <Nm018 f={f} />,
};

export const NM_AB_MOTIFS: string[] = [
  "nm_010", // #10
  "nm_011", // #11
  "nm_012", // #12
  "nm_013", // #13
  "nm_014", // #14
  "nm_015", // #15
  "nm_016", // #16
  "nm_017", // #17
  "nm_018", // #18
];

export const namaeAbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
