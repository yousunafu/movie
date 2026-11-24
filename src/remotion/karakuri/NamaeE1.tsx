// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#101〜#107 (7文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで7枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  sky: "#CFE3EE", skyLow: "#F3E6CC", fuji: "#8DA3C0", fujiSnow: "#F7F7F2",
  river: "#6E9DB8", riverDark: "#4F7E9A", riverLight: "#A9CBDD",
  bridge: "#B58A5A", bridgeDark: "#8A6440",
  roof: "#5E6670", roofDark: "#454B54", wall: "#F4EEE0", namako: "#3E4650",
  boat: "#A47A4E", boatDark: "#7A5634",
  board: "#2F5A48", boardDark: "#21443A", boardFrame: "#8A6440", chalk: "#F4F1E6", chalkY: "#F2E08A",
  classWall: "#E9E1CC", classFloor: "#C9A97A", deskTop: "#D9B98A", deskLeg: "#7E868E",
  uniform: "#2E3A5C", uniformDark: "#222B45", teacher: "#7A8C6E", teacherDark: "#5C6B52",
  paddy: "#9CC46A", paddyDark: "#6F9A48", soil: "#B89A6A", thatch: "#C9A55E", thatchDark: "#9C7C3E",
  mura: "#3F5E7A", muraDark: "#2E465C", chonin: "#8C6A3F", choninDark: "#6B4F2E", maekake: "#33507A",
  shoji: "#FAF6EA", tatami: "#D7CB8E", tatamiDark: "#B5A86A", lacquer: "#4A2A22",
  yakunin: "#4E5E3B", yakuninDark: "#3A4630",
  bushi: "#3B3F52", bushiDark: "#2A2D3B", gold: "#E8C24A", goldDark: "#B8901E",
  skin: "#F6E3CF", noren: "#33507A", dusk: "#F0D7A8",
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

// Person に重ねる江戸の服装 (Person と同じ座標系: 足元が原点, s を合わせて呼ぶ)
// 町人の縞 (胴体の上に縦縞) + 藍の前掛け
const NE1Chonin: React.FC<{ x: number; y: number; s: number; bob?: number }> = ({ x, y, s, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    <g stroke={C.choninDark} strokeWidth={5} opacity={0.85}>
      {[-40, -24, -8, 8, 24, 40].map((sx) => <line key={sx} x1={sx} y1={-156} x2={sx} y2={-56} />)}
    </g>
    <path d="M -46 -116 L 46 -116 L 50 -52 L -50 -52 Z" fill={C.maekake} stroke={KRP.ink} strokeWidth={4} />
    <line x1={-58} y1={-118} x2={58} y2={-118} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
// 村人のほっかむり (手ぬぐい) + 野良着の帯
const NE1Hokkamuri: React.FC<{ x: number; y: number; s: number; bob?: number }> = ({ x, y, s, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    <path d="M -70 -226 Q -72 -300 0 -302 Q 72 -300 70 -226 Q 50 -262 0 -264 Q -50 -262 -70 -226 Z" fill="#E8E2CF" stroke={KRP.ink} strokeWidth={4.5} />
    <g stroke="#6F8FB0" strokeWidth={4} opacity={0.8}>
      <line x1={-40} y1={-286} x2={-30} y2={-262} /><line x1={0} y1={-298} x2={0} y2={-266} /><line x1={40} y1={-286} x2={30} y2={-262} />
    </g>
    <path d="M -10 -186 Q 0 -176 10 -186 L 18 -166 L -18 -166 Z" fill="#E8E2CF" stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={-58} y={-100} width={116} height={14} fill={C.muraDark} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);
// 武士: 肩の張った裃・ちょんまげ・刀2本 (大小)
const NE1Bushi: React.FC<{ x: number; y: number; s: number; bob?: number; dir?: 1 | -1 }> = ({ x, y, s, bob = 0, dir = 1 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s * dir} ${s})`}>
    {/* 刀2本 (左腰から後ろへ) */}
    <g transform="rotate(-14 -30 -96)">
      <rect x={-150} y={-104} width={190} height={13} rx={5} fill={KRP.ink} />
      <rect x={-34} y={-108} width={10} height={21} fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} />
      <rect x={-24} y={-102} width={70} height={9} rx={4} fill="#5A4636" stroke={KRP.ink} strokeWidth={2.5} />
    </g>
    <g transform="rotate(-6 -30 -82)">
      <rect x={-112} y={-88} width={140} height={11} rx={5} fill={KRP.ink} />
      <rect x={-20} y={-91} width={9} height={18} fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} />
      <rect x={-11} y={-86} width={50} height={8} rx={4} fill="#5A4636" stroke={KRP.ink} strokeWidth={2.5} />
    </g>
    {/* 裃の肩衣 (肩が張った台形) */}
    <path d="M -96 -168 L 96 -168 L 58 -120 L 20 -120 L 0 -96 L -20 -120 L -58 -120 Z" fill={C.bushi} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-56} cy={-148} r={8} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.8} />
    <circle cx={56} cy={-148} r={8} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.8} />
    {/* 袴の折り目 */}
    <g stroke={C.bushiDark} strokeWidth={4}><line x1={-16} y1={-52} x2={-20} y2={-8} /><line x1={16} y1={-52} x2={20} y2={-8} /></g>
    {/* ちょんまげ: 月代 (剃った頭頂) と髷 */}
    <path d="M -62 -240 Q -60 -268 -40 -276 L -40 -246 Z" fill={KRP.ink} />
    <path d="M 62 -240 Q 60 -268 40 -276 L 40 -246 Z" fill={KRP.ink} />
    <rect x={-16} y={-306} width={32} height={22} rx={6} fill={KRP.ink} />
    <path d="M -6 -306 Q 0 -340 34 -332" stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
  </g>
);
// 名字の木札 (しまってある家の札。小さな白木)
const NE1Kifuda: React.FC<{ x: number; y: number; s?: number; glow?: number; text: string; rot?: number }> = ({ x, y, s = 1, glow = 0, text, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    {glow > 0.01 && <ellipse cx={0} cy={0} rx={70} ry={110} fill={NP.glow} opacity={0.5 * glow} />}
    {glow > 0.01 && <g stroke={NP.glow} strokeWidth={6} strokeLinecap="round" opacity={glow}>
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.3; return <line key={i} x1={Math.cos(a) * 62} y1={Math.sin(a) * 92} x2={Math.cos(a) * 84} y2={Math.sin(a) * 118} />; })}
    </g>}
    <path d="M -34 -70 L 0 -86 L 34 -70 L 34 74 L -34 74 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -24 -40 q 10 40 0 100" stroke={NP.grain} strokeWidth={3} fill="none" />
    <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={NP.sumi}>{text[0]}</text>
    <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={NP.sumi}>{text[1]}</text>
  </g>
);
// 教室 (#102〜#104 は同じ教室・同じ時間の続き)。黒板の中身を描く
const NE1Blackboard: React.FC<{ f: number; draw: number }> = ({ f, draw }) => {
  // 黒板の座標: x 300..1620, y 150..640
  const d = clamp01(draw);
  return (
    <g>
      <rect x={272} y={124} width={1376} height={544} rx={10} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={8} />
      <rect x={300} y={150} width={1320} height={490} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
      {/* 消し跡のもや */}
      <g fill={KRP.white} opacity={0.06}>
        <ellipse cx={520} cy={300} rx={200} ry={70} /><ellipse cx={1380} cy={520} rx={220} ry={60} /><ellipse cx={980} cy={210} rx={160} ry={40} />
      </g>
      {/* チョーク受け */}
      <rect x={290} y={640} width={1340} height={22} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={420} y={630} width={46} height={11} rx={5} fill={C.chalk} stroke={KRP.ink} strokeWidth={2} />
      <rect x={480} y={631} width={30} height={10} rx={5} fill={C.chalkY} stroke={KRP.ink} strokeWidth={2} />
      <rect x={1460} y={624} width={110} height={18} rx={4} fill="#5A6A7A" stroke={KRP.ink} strokeWidth={3} />
      {/* 右端の日直欄 (字は描かず枠だけ) */}
      <g stroke={C.chalk} strokeWidth={3} opacity={0.5}><line x1={1540} y1={170} x2={1540} y2={420} /><line x1={1590} y1={170} x2={1590} y2={420} /></g>
      {/* チョーク絵: 江戸の町人 (ちょんまげ・着物) */}
      <g stroke={C.chalk} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.92}>
        <circle cx={560} cy={300} r={62} />
        <path d="M 520 246 Q 560 226 600 246" /><path d="M 548 232 Q 560 204 594 210" strokeWidth={9} />
        <circle cx={540} cy={296} r={5} fill={C.chalk} /><circle cx={580} cy={296} r={5} fill={C.chalk} />
        <path d="M 546 326 Q 560 336 574 326" />
        <path d="M 480 560 L 500 380 L 620 380 L 640 560 Z" />
        <path d="M 520 380 L 560 440 L 600 380" />
        <g opacity={0.7}>{[505, 530, 555, 580, 605].map((sx) => <line key={sx} x1={sx} y1={400} x2={sx + 4} y2={550} strokeWidth={3} />)}</g>
        <line x1={492} y1={470} x2={628} y2={470} strokeWidth={8} />
      </g>
      {/* チョークの矢印 → 名札の欄 */}
      <path d="M 680 420 Q 760 380 830 410" stroke={C.chalkY} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 812 392 L 834 412 L 806 420" stroke={C.chalkY} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* 名札の欄: 名字 (空白) / 名前 */}
      <g stroke={C.chalk} strokeWidth={6} fill="none">
        <rect x={870} y={250} width={560} height={300} rx={10} />
        <line x1={1150} y1={250} x2={1150} y2={550} />
        <line x1={870} y1={330} x2={1430} y2={330} />
      </g>
      <text x={1010} y={308} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.chalk}>名字</text>
      <text x={1290} y={308} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.chalk}>名前</text>
      <text x={1290} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={C.chalk} opacity={d}>八兵衛</text>
      {/* 名字の欄は空白: 黄色の点線で「なにもない」を強調 */}
      <rect x={900} y={360} width={220} height={160} rx={8} fill="none" stroke={C.chalkY} strokeWidth={5}
        strokeDasharray={`${16} ${12}`} strokeDashoffset={-f * 0.8} opacity={0.4 + 0.6 * d} />
    </g>
  );
};
// 教室の壁・床・時計・掲示物 (#102〜#104)
const NE1Classroom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.classWall} />
    <rect x={-20} y={-20} width={W + 40} height={70} fill="#D9CFB4" />
    {/* 腰板 */}
    <rect x={-20} y={700} width={W + 40} height={110} fill={C.deskTop} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.bridgeDark} strokeWidth={3} opacity={0.5}>{Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130} y1={702} x2={i * 130} y2={808} />)}</g>
    <rect x={-20} y={808} width={W + 40} height={300} fill={C.classFloor} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.bridgeDark} strokeWidth={3} opacity={0.45}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={-20} y1={850 + i * 45} x2={W + 20} y2={850 + i * 45} />)}</g>
    {/* 時計 (秒針が動く) */}
    <g transform="translate(1790 110)">
      <circle r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 44} y1={Math.sin(a) * 44} x2={Math.cos(a) * 52} y2={Math.sin(a) * 52} stroke={KRP.ink} strokeWidth={4} />; })}
      <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(300)" />
      <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform="rotate(60)" />
      <line x1={0} y1={6} x2={0} y2={-46} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
      <circle r={5} fill={KRP.ink} />
    </g>
    {/* 左の掲示: 時間割表 (枠と色だけ) */}
    <g transform="translate(70 200) rotate(-2)">
      <rect width={160} height={220} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={10} y1={40 + i * 36} x2={150} y2={40 + i * 36} stroke={KRP.gray} strokeWidth={3} />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={16 + (i % 2) * 70} y={50 + i * 36} width={56} height={20} fill={[KRP.blueSoft, "#F4C6B8", "#CFE6C4", KRP.yellow][i]} />)}
      <circle cx={80} cy={8} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    </g>
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #101 第4章、江戸の人は、名字を持っていた。
// 格: 山 / seed 4101
// 絵: 章扉。江戸の町並み (日本橋の太鼓橋・川・荷舟・白壁の蔵・瓦屋根・遠くに富士山)。橋の上を行き交う町人・武士・行商人 (小さく)。`ChapterDoor` (num=4)。題字の後ろにクリームの帯
// どこ: 江戸・日本橋のあたり。川ぞいに白壁の蔵、瓦屋根、遠くに富士山。川に太鼓橋
// 演出: 太鼓橋の上を町人・武士・行商人・村人が行き交う。川を荷舟がすべる。題字は右下の帯
// 動き: カメラがゆっくり引きながら右へパン / 人が橋を歩く / 舟が進む / 川面のきらめき / 題字が出る
const NE1Kura: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={C.wall} stroke={KRP.ink} strokeWidth={5} />
    {/* なまこ壁 (下の格子) */}
    <rect x={x} y={y + h * 0.62} width={w} height={h * 0.38} fill={C.namako} stroke={KRP.ink} strokeWidth={4} />
    <g stroke={KRP.white} strokeWidth={3} opacity={0.75}>
      {Array.from({ length: Math.floor(w / 26) }, (_, i) => (
        <path key={i} d={`M ${x + 6 + i * 26} ${y + h * 0.62 + 6} l 16 16 m -16 0 l 16 -16`} />
      ))}
    </g>
    {/* 屋根 */}
    <path d={`M ${x - 24} ${y + 4} L ${x + w / 2} ${y - h * 0.32} L ${x + w + 24} ${y + 4} Z`} fill={C.roof} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M ${x - 24} ${y + 4} L ${x + w + 24} ${y + 4}`} stroke={C.roofDark} strokeWidth={9} />
    {/* 窓 (観音開き) */}
    <rect x={x + w / 2 - 22} y={y + 18} width={44} height={38} fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
    <rect x={x + w / 2 - 34} y={y + 18} width={12} height={38} fill={C.wall} stroke={KRP.ink} strokeWidth={3} />
    <rect x={x + w / 2 + 22} y={y + 18} width={12} height={38} fill={C.wall} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const Nm101: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 6, 22);
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.1, 1.0, cam);
  const px = lerp(-60, 0, cam);
  // 橋のアーチ: x 180..1180, 頂上 y 470
  const bridgeY = (x: number) => 600 - 130 * Math.sin(clamp01((x - 180) / 1000) * Math.PI);
  const walkers: { x0: number; v: number; kind: "chonin" | "bushi" | "gyosho" | "mura" }[] = [
    { x0: 330, v: 2.2, kind: "chonin" },
    { x0: 560, v: -1.6, kind: "bushi" },
    { x0: 760, v: 1.8, kind: "gyosho" },
    { x0: 980, v: -2.0, kind: "mura" },
    { x0: 450, v: -1.2, kind: "chonin" },
  ];
  const boatX = lerp(900, 640, seg(f, 0, 42)) + Math.sin(f / 10) * 4;
  return (
    <Frame f={f} seed={4101}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={4} title="江戸の人は、名字を持っていた" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(${960 + px} 540) scale(${sc}) translate(-960 -540)`}>
        {/* 空 */}
        <rect x={-120} y={-120} width={W + 240} height={760} fill={C.sky} />
        <rect x={-120} y={300} width={W + 240} height={300} fill={C.skyLow} opacity={0.7} />
        {/* 雲 (ゆっくり流れる) */}
        <g fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.95}>
          <path d={`M ${300 + f * 0.6} 150 q 30 -40 70 -10 q 40 -30 70 10 q 30 0 20 26 l -170 0 q -20 -20 10 -26 Z`} />
          <path d={`M ${1040 + f * 0.4} 110 q 26 -30 60 -6 q 34 -24 60 8 l -130 0 q -10 -10 10 -2 Z`} />
        </g>
        {/* 富士山 */}
        <path d="M 1260 420 L 1520 170 Q 1545 150 1570 170 L 1840 420 Z" fill={C.fuji} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 1455 232 L 1520 170 Q 1545 150 1570 170 L 1636 232 L 1604 222 L 1584 244 L 1560 222 L 1534 246 L 1510 224 L 1484 242 Z" fill={C.fujiSnow} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        {/* 遠くの町の瓦屋根の列 */}
        <g fill={C.roof} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
          {Array.from({ length: 16 }, (_, i) => {
            const x = -60 + i * 132; const y = 400 + (i % 3) * 10;
            return <g key={i}><rect x={x + 10} y={y} width={110} height={50} fill={C.wall} /><path d={`M ${x} ${y + 4} L ${x + 65} ${y - 34} L ${x + 130} ${y + 4} Z`} /></g>;
          })}
        </g>
        {/* 向こう岸の白壁の蔵 */}
        <NE1Kura x={60} y={380} w={180} h={170} />
        <NE1Kura x={1280} y={390} w={170} h={160} />
        <NE1Kura x={1480} y={370} w={200} h={180} />
        {/* 石垣の岸 */}
        <rect x={-120} y={548} width={W + 240} height={40} fill="#B7AE9C" stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={-100 + i * 90} y1={550} x2={-100 + i * 90} y2={586} />)}</g>
        {/* 川 */}
        <rect x={-120} y={586} width={W + 240} height={620} fill={C.river} />
        <g stroke={C.riverLight} strokeWidth={6} strokeLinecap="round">
          {Array.from({ length: 14 }, (_, i) => {
            const x = ((i * 157 + f * (1.5 + (i % 3) * 0.5)) % 2100) - 100; const y = 640 + (i % 5) * 70;
            return <line key={i} x1={x} y1={y} x2={x + 60} y2={y} opacity={0.5 + 0.4 * Math.sin(f / 5 + i)} />;
          })}
        </g>
        {/* 荷舟 (俵を積んで、船頭が竿で押す) */}
        <g transform={`translate(${boatX} 800)`}>
          <path d="M -200 0 L 190 0 Q 230 -6 250 -40 L -230 -40 Q -220 -10 -200 0 Z" fill={C.boat} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <line x1={-220} y1={-28} x2={238} y2={-28} stroke={C.boatDark} strokeWidth={5} />
          {[-120, -50, 20].map((bx, i) => (
            <g key={i}><ellipse cx={bx} cy={-70} rx={38} ry={30} fill="#E3CB8A" stroke={KRP.ink} strokeWidth={4.5} />
              <line x1={bx - 20} y1={-90} x2={bx - 20} y2={-50} stroke={C.thatchDark} strokeWidth={3} /><line x1={bx + 18} y1={-90} x2={bx + 18} y2={-50} stroke={C.thatchDark} strokeWidth={3} /></g>
          ))}
          <ellipse cx={-85} cy={-118} rx={38} ry={30} fill="#E3CB8A" stroke={KRP.ink} strokeWidth={4.5} />
          <Person x={140} y={-40} s={0.42} f={f} phase={3} cloth={C.mura} clothDark={C.muraDark} face="normal" pose="hold" />
          <NE1Hokkamuri x={140} y={-40} s={0.42} />
          <line x1={110} y1={-200} x2={70} y2={40} stroke={C.bridgeDark} strokeWidth={7} strokeLinecap="round" transform={`rotate(${Math.sin(f / 8) * 4} 120 -90)`} />
          <path d="M -230 4 q 30 10 60 0 q 30 10 60 0" stroke={C.riverLight} strokeWidth={5} fill="none" />
        </g>
        {/* 太鼓橋 */}
        <path d={`M 120 640 ${Array.from({ length: 21 }, (_, i) => { const x = 180 + i * 50; return `L ${x} ${bridgeY(x)}`; }).join(" ")} L 1240 640 L 1240 668 L 120 668 Z`}
          fill="none" stroke="none" />
        <path d={`M 150 ${bridgeY(180) + 6} ${Array.from({ length: 21 }, (_, i) => { const x = 180 + i * 50; return `L ${x} ${bridgeY(x)}`; }).join(" ")} L 1210 ${bridgeY(1180) + 6} ${Array.from({ length: 21 }, (_, i) => { const x = 1180 - i * 50; return `L ${x} ${bridgeY(x) + 46}`; }).join(" ")} Z`}
          fill={C.bridge} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M 180 ${bridgeY(180) + 24} ${Array.from({ length: 21 }, (_, i) => { const x = 180 + i * 50; return `L ${x} ${bridgeY(x) + 24}`; }).join(" ")}`} stroke={C.bridgeDark} strokeWidth={4} fill="none" />
        {/* 橋げた */}
        {[300, 480, 680, 880, 1060].map((bx) => <rect key={bx} x={bx - 12} y={bridgeY(bx) + 46} width={24} height={900} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 欄干と擬宝珠 */}
        <path d={`M 180 ${bridgeY(180) - 60} ${Array.from({ length: 21 }, (_, i) => { const x = 180 + i * 50; return `L ${x} ${bridgeY(x) - 60}`; }).join(" ")}`} stroke={KRP.ink} strokeWidth={14} fill="none" />
        <path d={`M 180 ${bridgeY(180) - 60} ${Array.from({ length: 21 }, (_, i) => { const x = 180 + i * 50; return `L ${x} ${bridgeY(x) - 60}`; }).join(" ")}`} stroke={C.bridge} strokeWidth={7} fill="none" />
        {[180, 430, 680, 930, 1180].map((gx) => (
          <g key={gx}>
            <rect x={gx - 9} y={bridgeY(gx) - 64} width={18} height={60} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${gx - 14} ${bridgeY(gx) - 64} Q ${gx} ${bridgeY(gx) - 104} ${gx + 14} ${bridgeY(gx) - 64} Z`} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 橋の上を行き交う人々 (欄干の後ろを歩く=足元が欄干に隠れる) */}
        {walkers.map((w, i) => {
          const wx = 220 + ((w.x0 - 220 + f * w.v + 2000) % 920);
          const wy = bridgeY(wx) + 4;
          const s = 0.5;
          const cloth = w.kind === "chonin" ? C.chonin : w.kind === "bushi" ? C.bushi : w.kind === "mura" ? C.mura : "#8A7A5E";
          const dark = w.kind === "chonin" ? C.choninDark : w.kind === "bushi" ? C.bushiDark : w.kind === "mura" ? C.muraDark : "#6A5C44";
          const step = Math.abs(Math.sin(f / 4 + i)) * -4;
          return (
            <g key={i}>
              <Person x={wx} y={wy + step} s={s} f={f} phase={i} cloth={cloth} clothDark={dark} face={i === 2 ? "smile" : "normal"} gaze={[w.v > 0 ? 5 : -5, 0]} still />
              {w.kind === "chonin" && <NE1Chonin x={wx} y={wy + step} s={s} />}
              {w.kind === "bushi" && <NE1Bushi x={wx} y={wy + step} s={s} dir={w.v > 0 ? 1 : -1} />}
              {w.kind === "mura" && <NE1Hokkamuri x={wx} y={wy + step} s={s} />}
              {w.kind === "gyosho" && (
                <g transform={`translate(${wx} ${wy + step - 150 * s})`}>
                  {/* 天秤棒と2つの桶 */}
                  <line x1={-80} y1={-20} x2={80} y2={-20} stroke={C.bridgeDark} strokeWidth={6} strokeLinecap="round" />
                  {[-74, 74].map((ox) => <g key={ox}><line x1={ox} y1={-20} x2={ox} y2={20} stroke={KRP.ink} strokeWidth={2.5} /><rect x={ox - 16} y={20} width={32} height={26} rx={4} fill={C.thatch} stroke={KRP.ink} strokeWidth={3.5} /></g>)}
                </g>
              )}
            </g>
          );
        })}
        {/* 手前の柳 (画面左の端) */}
        <g>
          <path d="M 30 -40 Q 60 200 20 620" stroke={C.boatDark} strokeWidth={22} fill="none" strokeLinecap="round" />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M ${30 + i * 18} ${-20 + i * 10} q ${30 + Math.sin(f / 12 + i) * 10} 160 ${10 + Math.sin(f / 12 + i) * 16} ${300 + (i % 3) * 60}`} stroke={KRP.green} strokeWidth={6} fill="none" opacity={0.9} />
          ))}
        </g>
        {/* 地名札 */}
        <TagPlate x={560} y={250} text="江戸・日本橋" size={44} t={seg(f, 2, 14)} fill={KRP.white} rot={-2} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #102 江戸時代の庶民は、名字を持っていなかった。
// 格: 並 / seed 4102
// 絵: 教室の黒板 (昭和〜平成の学校)。黒板に江戸の町人の絵と、名札の欄が「空白」。先生 (Person・白いチョーク) が黒板を指す。札「習ったこと」
// どこ: 昭和〜平成の小学校の教室。正面の黒板 (#102〜#104 は同じ教室・同じ時間の続き)
// 演出: 黒板にチョークで江戸の町人。名札の欄は「名前」だけ書かれて「名字」は空白。先生が指し棒で空白を指す
// 動き: カメラが空白の欄へゆっくり寄る / 「八兵衛」がチョークで書かれていく / 空白の点線が流れる / 指し棒がトントン
const NE1Teacher: React.FC<{ x: number; y: number; s: number; f: number; face: "normal" | "surprised" | "smile"; tap: number; turned?: boolean }> = ({ x, y, s, f, face, tap, turned }) => (
  <g>
    {/* 指し棒 (左手から黒板へ) */}
    {!turned && <line x1={x - 150 * s} y1={y - 150 * s} x2={x - 150 * s - 480} y2={y - 150 * s - 290 + tap * 14} stroke={C.boatDark} strokeWidth={9} strokeLinecap="round" />}
    {!turned && <circle cx={x - 150 * s - 480} cy={y - 150 * s - 290 + tap * 14} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />}
    <Person x={x} y={y} s={s} f={f} face={face} pose={turned ? "banzai" : "point"} pointDir={-1} cloth={C.teacher} clothDark={C.teacherDark} glasses gaze={turned ? [0, 2] : [-6, -2]} />
    {/* ネクタイ */}
    <path d={`M ${x} ${y - 158 * s} l ${-9 * s} ${12 * s} l ${9 * s} ${56 * s} l ${9 * s} ${-56 * s} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    {/* 右手の白いチョーク */}
    {!turned && <rect x={x + 58 * s} y={y - 84 * s} width={10} height={28} rx={4} fill={C.chalk} stroke={KRP.ink} strokeWidth={2.5} />}
  </g>
);
const NE1Kyotaku: React.FC = () => (
  <g>
    <rect x={640} y={730} width={420} height={40} rx={6} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
    <rect x={660} y={770} width={380} height={200} fill={C.bridge} stroke={KRP.ink} strokeWidth={6} />
    <rect x={690} y={800} width={320} height={60} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    {/* 出席簿と花瓶 */}
    <rect x={680} y={706} width={150} height={26} rx={3} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 960 730 q -24 -40 0 -76 q 24 36 0 76 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={946} cy={640} r={16} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={978} cy={630} r={14} fill="#F4C6B8" stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M 958 654 l -10 -14 M 962 654 l 14 -22" stroke={KRP.green} strokeWidth={4} />
  </g>
);
const Nm102: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.04, cam);
  const tap = Math.max(0, Math.sin(f / 5)) * (f > 20 ? 1 : 0);
  const write = seg(f, 6, 22);
  return (
    <Frame f={f} seed={4102}>
      <g transform={`translate(1000 420) scale(${sc}) translate(-1000 -420)`}>
        <NE1Classroom f={f} />
        <NE1Blackboard f={f} draw={write} />
        {/* 書いている途中のチョークの粉 */}
        {write > 0 && write < 1 && <g fill={C.chalk}>{[0, 1, 2, 3].map((i) => <circle key={i} cx={1240 + write * 110 + i * 6} cy={460 + i * 10 + (f % 4) * 3} r={3} opacity={0.7} />)}</g>}
        <NE1Kyotaku />
        <NE1Teacher x={1760} y={900} s={1.1} f={f} face="normal" tap={tap} />
        <TagPlate x={960} y={104} text="習ったこと" size={46} t={seg(f, 2, 14)} rot={-1.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #103 そう習った人も、多いかもしれません。
// 格: 並 / seed 4103
// 絵: #102 の教室を後ろから見た構図。生徒たち (Person の小さい子・制服) がうなずく。ノートに「名字なし」とメモ (字は小さく波線でもよい)
// どこ: #102 と同じ教室・同じ時間。教室のいちばん後ろの席から黒板を見る
// 演出: 生徒たちの後ろ姿が並び、みんなでうなずく。手前の席のノートに「名字なし」とメモが書かれていく
// 動き: カメラが手前のノートへゆっくり寄る / 頭がこくこく (位相をずらして) / 鉛筆が動いて字と波線が出る
// 生徒の後ろ姿 (Person の頭に髪の色の後頭部を重ねる)。腰から下は机のかげ
const NE1StudentBack: React.FC<{ x: number; y: number; s: number; f: number; phase: number; sailor?: boolean }> = ({ x, y, s, f, phase, sailor }) => {
  const nod = Math.max(0, Math.sin((f + phase * 7) / 6)) * 10 * s;
  return (
    <g>
      {/* いすの背もたれ */}
      <rect x={x - 70 * s} y={y - 120 * s} width={140 * s} height={70 * s} rx={8 * s} fill={C.deskTop} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - 70 * s} y={y - 50 * s} width={10 * s} height={90 * s} fill={C.deskLeg} stroke={KRP.ink} strokeWidth={3} />
      <rect x={x + 60 * s} y={y - 50 * s} width={10 * s} height={90 * s} fill={C.deskLeg} stroke={KRP.ink} strokeWidth={3} />
      <g transform={`translate(0 ${0})`}>
        <Person x={x} y={y} s={s} f={f} phase={phase} cloth={C.uniform} clothDark={C.uniformDark} still />
        {/* 後頭部 (うなずくと少し下がる) */}
        <g transform={`translate(${x} ${y + nod}) scale(${s})`}>
          <circle cx={0} cy={-228} r={67} fill={KRP.ink} />
          <path d="M -40 -270 Q 0 -292 40 -270" stroke={KRP.white} strokeWidth={5} opacity={0.22} fill="none" />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 64} cy={-222} rx={10} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          {sailor && <path d="M -56 -160 L 56 -160 L 46 -116 L -46 -116 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
          {sailor && <path d="M -48 -150 L 48 -150" stroke={KRP.blueDeep} strokeWidth={4} />}
          {!sailor && <rect x={-58} y={-164} width={116} height={14} fill={C.uniformDark} stroke={KRP.ink} strokeWidth={3} />}
        </g>
      </g>
      {/* うなずきの「こくっ」線 */}
      {nod > 6 * s && <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round"><line x1={x + 80 * s} y1={y - 300 * s} x2={x + 96 * s} y2={y - 316 * s} /><line x1={x + 88 * s} y1={y - 280 * s} x2={x + 110 * s} y2={y - 286 * s} /></g>}
    </g>
  );
};
const Nm103: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.06, cam);
  const w = seg(f, 10, 30);
  const pen = seg(f, 10, 34);
  return (
    <Frame f={f} seed={4103}>
      <g transform={`translate(${lerp(960, 1010, cam)} ${lerp(540, 560, cam)}) scale(${sc}) translate(-960 -540)`}>
        <NE1Classroom f={f} />
        {/* 奥の黒板と先生 (遠く・小さく) */}
        <g transform="translate(480 110) scale(0.5)">
          <NE1Blackboard f={f} draw={1} />
          <NE1Kyotaku />
          <NE1Teacher x={1760} y={900} s={1.1} f={f} face="normal" tap={Math.max(0, Math.sin(f / 5))} />
        </g>
        {/* 奥の列 */}
        {[380, 640, 900, 1160, 1420].map((x, i) => (
          <g key={x}>
            <rect x={x - 80} y={560} width={160} height={30} fill={C.deskTop} stroke={KRP.ink} strokeWidth={4} />
            <NE1StudentBack x={x + 20} y={640} s={0.42} f={f} phase={i} sailor={i % 2 === 1} />
          </g>
        ))}
        {/* 中の列 */}
        {[240, 620, 1000, 1380].map((x, i) => (
          <g key={x}>
            <rect x={x - 110} y={640} width={220} height={36} fill={C.deskTop} stroke={KRP.ink} strokeWidth={5} />
            <NE1StudentBack x={x} y={760} s={0.62} f={f} phase={i + 3} sailor={i % 2 === 0} />
          </g>
        ))}
        {/* 手前: いちばん後ろの席の机 (ノートを書いている子の肩ごし) */}
        <path d="M 1060 640 L 1880 640 L 1960 900 L 980 900 Z" fill={C.deskTop} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 1060 640 L 1880 640" stroke={KRP.white} strokeWidth={5} opacity={0.4} />
        {/* ノート (見開き) */}
        <g transform="rotate(-3 1450 730)">
          <path d="M 1180 640 L 1450 652 L 1450 820 L 1170 810 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1450 652 L 1720 640 L 1740 810 L 1450 820 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.blueSoft} strokeWidth={3}>{[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={1190} y1={680 + i * 28} x2={1440} y2={688 + i * 28} /><line x1={1460} y1={688 + i * 28} x2={1720} y2={680 + i * 28} /></g>)}</g>
          {/* 左ページ: 前に書いたメモ (波線) */}
          <g stroke={KRP.grayDark} strokeWidth={4} fill="none">{[0, 1, 2].map((i) => <path key={i} d={`M 1200 ${686 + i * 28} q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} />)}</g>
          {/* 右ページ: いま書いている「名字なし」 */}
          <text x={1490} y={712} fontFamily={FONT} fontWeight={800} fontSize={40} fill={KRP.ink} opacity={w}>{"江戸の町人".slice(0, Math.ceil(w * 5))}</text>
          <text x={1490} y={770} fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.red} opacity={seg(f, 22, 32)}>名字なし</text>
          <path d="M 1484 784 q 50 10 200 -2" stroke={KRP.red} strokeWidth={5} fill="none" strokeDasharray={260} strokeDashoffset={260 * (1 - seg(f, 28, 38))} />
        </g>
        {/* 消しゴムと筆箱 */}
        <rect x={1780} y={700} width={60} height={34} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1780} y={700} width={22} height={34} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1080} y={690} width={70} height={150} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} transform="rotate(8 1115 765)" />
        {/* 鉛筆を持つ手 (袖つき) */}
        <g transform={`translate(${lerp(1500, 1690, pen) + Math.sin(f * 1.3) * 4} ${770 + Math.sin(f * 0.9) * 5})`}>
          <rect x={10} y={30} width={240} height={70} rx={30} fill={C.uniform} stroke={KRP.ink} strokeWidth={5} transform="rotate(22 10 30)" />
          <ellipse cx={20} cy={40} rx={40} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <g transform="rotate(-30 0 0)">
            <rect x={-8} y={-110} width={16} height={130} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -8 20 L 0 44 L 8 20 Z" fill={C.deskTop} stroke={KRP.ink} strokeWidth={3} transform="rotate(180 0 20) translate(0 -150)" />
          </g>
        </g>
        {/* 手前の子の肩と後頭部 (左下に大きく。顔は見えない) */}
        <NE1StudentBack x={560} y={1080} s={1.2} f={f} phase={9} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #104 実はこれは、半分まちがいです。
// 格: 山 / seed 4104
// 絵: #102 の黒板に、f で大きな**赤い丸と赤い×が半分ずつ**重なったスタンプ (半分○・半分×) がドンと押される。先生が驚いて振り向く (surprised)。チョークの粉が舞う
// どこ: #102 と同じ教室・同じ黒板 (続き)
// 演出: 黒板の真ん中に、左半分が赤い○・右半分が赤い×の大きなスタンプがドンと押される。先生は驚いて両手を上げ、チョークを落とす
// 動き: スタンプが上から大きく落ちて着地 (f14〜20) / 画面がドンとゆれる / チョークの粉が舞い上がる / チョークが床へ落ちる
const NE1HalfStamp: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 丸い判子の外枠 (白いふちで黒板から浮かせる) */}
    <circle r={250} fill={KRP.white} opacity={0.18} />
    <circle r={236} fill="none" stroke={KRP.white} strokeWidth={34} opacity={0.35} />
    <circle r={236} fill="none" stroke={KRP.red} strokeWidth={18} />
    <line x1={0} y1={-236} x2={0} y2={236} stroke={KRP.red} strokeWidth={14} />
    {/* 左半分: ○ */}
    <circle cx={-112} cy={0} r={78} fill="none" stroke={KRP.white} strokeWidth={50} opacity={0.3} />
    <circle cx={-112} cy={0} r={78} fill="none" stroke={KRP.red} strokeWidth={32} />
    {/* 右半分: × */}
    <g strokeLinecap="round">
      <g stroke={KRP.white} strokeWidth={50} opacity={0.3}><line x1={52} y1={-80} x2={172} y2={80} /><line x1={172} y1={-80} x2={52} y2={80} /></g>
      <g stroke={KRP.red} strokeWidth={32}><line x1={52} y1={-80} x2={172} y2={80} /><line x1={172} y1={-80} x2={52} y2={80} /></g>
    </g>
    {/* かすれ */}
    <circle r={236} fill="none" stroke={C.board} strokeWidth={4} strokeDasharray="5 31" opacity={0.6} />
    {/* インクのはね */}
    <g fill={KRP.red}>{[[-230, -60, 12], [220, -120, 9], [-150, 210, 10], [240, 150, 13], [30, -240, 8]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} />)}</g>
  </g>
);
const Nm104: React.FC<{ f: number }> = ({ f }) => {
  const drop = seg(f, 12, 18);
  const land = f >= 18;
  const shake = land ? Math.sin(f * 3.1) * 10 * Math.max(0, 1 - (f - 18) / 10) : 0;
  const st = land ? 1 : lerp(2.6, 1.05, easeInOut(drop));
  const dust = seg(f, 18, 42);
  const turned = f >= 19;
  const chalkFall = seg(f, 19, 30);
  return (
    <Frame f={f} seed={4104}>
      <g transform={`translate(${shake} ${shake * 0.6})`}>
        <NE1Classroom f={f} />
        <NE1Blackboard f={f} draw={1} />
        {/* スタンプ (落ちてくる途中は半透明の影) */}
        {f >= 12 && (land
          ? <NE1HalfStamp x={1000} y={400} s={1} />
          : <g opacity={0.35 + 0.6 * drop}><NE1HalfStamp x={1000} y={400 - (1 - drop) * 80} s={st} /></g>)}
        {/* 着地の衝撃線 */}
        {land && f < 30 && (
          <g stroke={C.chalkY} strokeWidth={8} strokeLinecap="round" opacity={1 - (f - 18) / 12}>
            {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <line key={i} x1={1000 + Math.cos(a) * 270} y1={400 + Math.sin(a) * 250} x2={1000 + Math.cos(a) * 330} y2={400 + Math.sin(a) * 300} />; })}
          </g>
        )}
        {/* チョークの粉が舞う (黒板の前に) */}
        {dust > 0 && (
          <g fill={C.chalk}>
            {Array.from({ length: 26 }, (_, i) => {
              const a = rnd(4104, i) * Math.PI * 2; const r = 160 + rnd(7, i) * 220;
              const d = easeOut(dust);
              return <circle key={i} cx={1000 + Math.cos(a) * r * (0.6 + d * 0.7)} cy={400 + Math.sin(a) * r * (0.5 + d * 0.6) - d * 40 + d * d * 60}
                r={5 + rnd(9, i) * 9} opacity={0.85 * (1 - d * 0.6)} />;
            })}
            <ellipse cx={1000} cy={640} rx={300 * easeOut(dust)} ry={40 * easeOut(dust)} opacity={0.35 * (1 - dust * 0.5)} />
          </g>
        )}
        <NE1Kyotaku />
        {/* 先生: 驚いて振り向き、両手を上げる */}
        <NE1Teacher x={1760} y={900} s={1.1} f={f} face={turned ? "surprised" : "normal"} tap={0} turned={turned} />
        {/* 落ちるチョークと指し棒 */}
        {turned && (
          <g>
            <rect x={1830} y={lerp(700, 860, chalkFall * chalkFall)} width={12} height={30} rx={4} fill={C.chalk} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${chalkFall * 200} 1836 ${lerp(715, 875, chalkFall * chalkFall)})`} />
            <line x1={1560} y1={lerp(740, 860, chalkFall)} x2={1180} y2={lerp(560, 900, chalkFall)} stroke={C.boatDark} strokeWidth={9} strokeLinecap="round" />
          </g>
        )}
        {/* 驚きの汗 */}
        {turned && <g fill={KRP.blue} stroke={KRP.ink} strokeWidth={3}>
          <path d={`M 1860 ${560 + Math.sin(f / 3) * 4} q 10 18 0 26 q -10 -8 0 -26 Z`} />
          <path d={`M 1660 ${580 + Math.cos(f / 3) * 4} q 10 18 0 26 q -10 -8 0 -26 Z`} />
        </g>}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #105 村人や町人にも、名字はありました。
// 格: 山 / seed 4105
// 絵: ★江戸の村 (田んぼ・茅葺きの家・畦道) と町 (商家の並ぶ通り) を左右に。村人 (藍の野良着) と町人 (縞の着物) の背中や家の中に、**しまってある名字の札**が見える (家の神棚・仏壇の過去帳・箪笥の引き出しから、名字の木札がちらりと光る)。f で札が順に光る
// どこ: 左=江戸の村 (田んぼ・畦道・茅葺きの家の中)、右=江戸の町 (瓦屋根の商家の店の中)。真ん中に村と町を分ける道しるべの杭
// 演出: 家の中を断面で見せる。村の家の神棚・仏壇、町の商家の箪笥・手文庫から、しまってある名字の木札が順に光る。村人と町人がそれを見て笑う
// 動き: カメラが左 (村) から右 (町) へパンしながら引く / 札が f6→14→22→30 の順に光る / 箪笥の引き出しが開く / 稲がゆれる
const Nm105: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const sc = lerp(1.08, 1.0, cam);
  const px = lerp(80, 0, cam);
  const g1 = seg(f, 6, 12), g2 = seg(f, 14, 20), g3 = seg(f, 22, 28), g4 = seg(f, 30, 36);
  const drawer = easeOut(seg(f, 18, 26));
  const lit = (g: number) => g * (0.85 + 0.15 * Math.sin(f / 4));
  return (
    <Frame f={f} seed={4105}>
      <g transform={`translate(${960 + px} 540) scale(${sc}) translate(-960 -540)`}>
        {/* 空と遠くの山 */}
        <rect x={-120} y={-120} width={W + 240} height={600} fill={C.sky} />
        <path d="M -120 330 Q 120 180 360 300 Q 560 200 820 320 L 820 480 L -120 480 Z" fill="#9CB59A" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={420} width={W + 240} height={800} fill={C.soil} />
        {/* ===== 左: 村 ===== */}
        {/* 田んぼ (畦道で区切る) */}
        {[[ -120, 440, 420, 170 ], [ -120, 630, 420, 220 ]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={C.paddy} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, j) => Array.from({ length: 3 }, (_, k) => {
              const sx = x + 50 + j * 64, sy = y + 40 + k * (h / 3.2);
              const sw = Math.sin(f / 9 + j + k) * 4;
              return <path key={`${j}-${k}`} d={`M ${sx} ${sy + 30} l ${-8 + sw} -30 M ${sx} ${sy + 30} l ${sw} -36 M ${sx} ${sy + 30} l ${8 + sw} -30`} stroke={C.paddyDark} strokeWidth={4} strokeLinecap="round" />;
            }))}
          </g>
        ))}
        <rect x={-120} y={610} width={440} height={20} fill="#C8AE7E" stroke={KRP.ink} strokeWidth={4} />
        {/* 茅葺きの家 (断面) */}
        <path d="M 300 420 L 600 150 L 920 420 Z" fill={C.thatch} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g stroke={C.thatchDark} strokeWidth={4} opacity={0.8}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={360 + i * 46} y1={410} x2={600 + (i - 5.5) * 12} y2={190} />)}</g>
        <rect x={560} y={140} width={80} height={24} fill={C.thatchDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={330} y={420} width={560} height={410} fill={C.wall} stroke={KRP.ink} strokeWidth={7} />
        <rect x={330} y={420} width={560} height={26} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={4} />
        {[330, 610, 890].map((x) => <rect key={x} x={x - 10} y={420} width={20} height={410} fill={C.bridge} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={330} y={760} width={560} height={70} fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        <line x1={330} y1={792} x2={890} y2={792} stroke={C.tatamiDark} strokeWidth={4} />
        {/* 神棚 (棚・しめ縄・榊) */}
        <rect x={360} y={510} width={220} height={18} fill={C.bridge} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 380 510 L 380 470 L 470 440 L 560 470 L 560 510 Z" fill={NP.woodMid} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 360 456 Q 470 488 580 456" stroke="#E8DCA8" strokeWidth={8} fill="none" />
        {[400, 470, 540].map((x) => <path key={x} d={`M ${x} 466 l -6 18 l 12 0 l -6 18`} stroke={KRP.white} strokeWidth={4} fill="none" />)}
        <path d="M 372 510 q -6 -30 10 -40 M 568 510 q 6 -30 -10 -40" stroke={KRP.green} strokeWidth={6} fill="none" />
        <NE1Kifuda x={470} y={600} s={0.62} text="田中" glow={lit(g1)} rot={Math.sin(f / 10) * 2} />
        {/* 仏壇 (扉が開いて、過去帳と位牌の札) */}
        <rect x={690} y={470} width={170} height={290} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <rect x={668} y={470} width={22} height={290} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <rect x={860} y={470} width={22} height={290} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 700 490 L 850 490" stroke={C.gold} strokeWidth={6} />
        {/* 過去帳 (閉じた帳面) */}
        <rect x={710} y={690} width={70} height={56} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
        <line x1={720} y1={700} x2={720} y2={736} stroke={KRP.ink} strokeWidth={3} />
        <NE1Kifuda x={800} y={600} s={0.62} text="田中" glow={lit(g2)} />
        <TagPlate x={745} y={790} text="過去帳" size={24} t={seg(f, 14, 22)} />
        {/* 村人 (藍の野良着・ほっかむり) が札を見上げる */}
        <Person x={610} y={820} s={0.82} f={f} phase={1} cloth={C.mura} clothDark={C.muraDark} face={g2 > 0.5 ? "smile" : "normal"} gaze={[g2 > 0.5 ? 6 : -6, -6]} pose="hold" />
        <NE1Hokkamuri x={610} y={820} s={0.82} />
        {/* 鍬 */}
        <line x1={300} y1={600} x2={340} y2={830} stroke={C.bridgeDark} strokeWidth={8} />
        <path d="M 290 600 l 40 -10 l 6 30 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />

        {/* ===== 真ん中: 道しるべの杭 ===== */}
        <rect x={944} y={360} width={32} height={480} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 944 360 L 960 336 L 976 360 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
        <TagPlate x={600} y={96} text="江戸の村" size={40} t={seg(f, 1, 10)} rot={-2} />
        <TagPlate x={1640} y={100} text="江戸の町" size={40} t={seg(f, 16, 26)} rot={2} />

        {/* ===== 右: 町 (商家) ===== */}
        <rect x={1000} y={420} width={940} height={420} fill="#CDB792" />
        {/* 瓦屋根 */}
        <path d="M 990 300 L 1080 170 L 1890 170 L 1960 300 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g stroke={C.roofDark} strokeWidth={5}>{Array.from({ length: 18 }, (_, i) => <line key={i} x1={1040 + i * 50} y1={180} x2={1020 + i * 52} y2={296} />)}</g>
        <rect x={1030} y={300} width={880} height={530} fill={C.wall} stroke={KRP.ink} strokeWidth={7} />
        {/* のれん (ゆれる。字なし・紋の丸だけ) */}
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M ${1080 + i * 160} 306 L ${1230 + i * 160} 306 L ${1232 + i * 160 + Math.sin(f / 8 + i) * 6} 400 L ${1082 + i * 160 + Math.sin(f / 8 + i) * 6} 400 Z`} fill={C.noren} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <circle cx={1475} cy={352} r={22} fill="none" stroke={KRP.white} strokeWidth={5} />
        <rect x={1030} y={760} width={880} height={70} fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        {/* 箪笥 (引き出しが開く) */}
        <rect x={1070} y={470} width={230} height={290} fill={C.bridge} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={i === 1 ? `translate(${drawer * 30} ${drawer * 18})` : undefined}>
            <rect x={1084} y={484 + i * 68} width={202} height={58} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M 1170 ${508 + i * 68} q 15 12 30 0`} stroke={KRP.brass} strokeWidth={6} fill="none" />
          </g>
        ))}
        <NE1Kifuda x={1200} y={lerp(560, 450, drawer)} s={0.62} text="鈴木" glow={lit(g3)} rot={-6} />
        {/* 帳場 (格子・そろばん・手文庫) */}
        <rect x={1600} y={620} width={260} height={140} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.bridge} strokeWidth={4}>{Array.from({ length: 7 }, (_, i) => <line key={i} x1={1620 + i * 36} y1={620} x2={1620 + i * 36} y2={760} />)}</g>
        <rect x={1610} y={596} width={130} height={26} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={1624 + i * 20} cy={609} r={7} fill={KRP.ink} />)}
        <rect x={1760} y={560} width={90} height={60} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1760} y={560} width={90} height={14} fill={C.gold} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${-30 * seg(f, 28, 34)} 1760 560)`} />
        <NE1Kifuda x={1805} y={lerp(560, 480, seg(f, 28, 36))} s={0.5} text="鈴木" glow={lit(g4)} />
        {/* 町人 (茶の縞・藍の前掛け) が振り向いて札を見る */}
        <Person x={1450} y={820} s={0.82} f={f} phase={4} cloth={C.chonin} clothDark={C.choninDark} face={g3 > 0.5 ? "smile" : "normal"} gaze={[g4 > 0.5 ? 7 : -7, -4]} />
        <NE1Chonin x={1450} y={820} s={0.82} />
        <path d={`M 1450 ${820 - 292 * 0.82 - 8} q 0 -24 18 -30`} stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #106 ただ、おおやけの書類に書いて名乗ることが、許されていなかったのです。
// 格: 山 / seed 4106
// 絵: 代官所 (役所) の帳場。役人が帳面 (人別帳) に名前を書きこむ。町人が名字の札を差し出すが、役人が手で**押し戻す** (f)。帳面には名前だけが並び、名字の欄に赤い横線。障子・机・帳面の山
// どこ: 江戸の代官所の帳場。障子の壁・帳面の山・文机。正面に役人、右から町人
// 演出: 役人が人別帳に名前を書きこむ。帳面は名前の欄だけ埋まり、名字の欄には赤い横線。町人が名字の札を差し出すが、役人が手のひらで押し戻す
// 動き: カメラが帳面へ寄る / 筆が動く / 札が差し出され (f6〜16)、押し戻される (f20〜30) / 名字の欄の赤線が順に引かれる / 町人の顔がしょんぼり
const NE1Arm: React.FC<{ x1: number; y1: number; x2: number; y2: number; cloth: string; w?: number }> = ({ x1, y1, x2, y2, cloth, w = 22 }) => (
  <g strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={w + 9} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={w} />
  </g>
);
const Nm106: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.06, cam);
  const offer = easeOut(seg(f, 6, 16));
  const push = easeOut(seg(f, 20, 30));
  const tagX = lerp(1560, 1330, offer) + lerp(0, 200, push);
  const tagY = 560 - Math.sin(push * Math.PI) * 20;
  const names = ["八兵衛", "与吉", "太助", "おつる"];
  const brushX = 820 + Math.sin(f / 4) * 10;
  return (
    <Frame f={f} seed={4106}>
      <g transform={`translate(${lerp(960, 1000, cam)} ${lerp(540, 600, cam)}) scale(${sc}) translate(-960 -540)`}>
        {/* 障子の壁 */}
        <rect x={-120} y={-120} width={W + 240} height={740} fill={C.shoji} />
        <g stroke={C.bridge} strokeWidth={6}>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-100 + i * 100} y1={-120} x2={-100 + i * 100} y2={620} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-120} y1={20 + i * 110} x2={W + 120} y2={20 + i * 110} />)}
        </g>
        <rect x={-120} y={-120} width={W + 240} height={60} fill={C.bridgeDark} />
        {/* 障子ごしの外の木の影 */}
        <g fill={KRP.ink} opacity={0.08}><ellipse cx={300 + Math.sin(f / 14) * 8} cy={200} rx={160} ry={110} /><ellipse cx={1660 + Math.sin(f / 12) * 8} cy={160} rx={140} ry={90} /></g>
        <rect x={-120} y={600} width={W + 240} height={30} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={630} width={W + 240} height={500} fill={C.tatami} />
        <g stroke={C.tatamiDark} strokeWidth={5}><line x1={-120} y1={760} x2={W + 120} y2={760} /><line x1={400} y1={630} x2={400} y2={1100} /><line x1={1500} y1={630} x2={1500} y2={1100} /></g>
        {/* 帳面の山 (左右) */}
        {[[120, 600, 9], [260, 600, 6], [1720, 600, 8]].map(([x, y, n], k) => (
          <g key={k}>{Array.from({ length: n }, (_, i) => (
            <g key={i}><rect x={x - 70 + (i % 2) * 6} y={y - 26 - i * 26} width={140} height={26} fill={i % 3 === 0 ? "#E6D9B4" : NP.wood} stroke={KRP.ink} strokeWidth={4} />
              <line x1={x - 56 + (i % 2) * 6} y1={y - 26 - i * 26} x2={x - 56 + (i % 2) * 6} y2={y - i * 26} stroke={NP.chobo} strokeWidth={3} /></g>
          ))}</g>
        ))}
        <TagPlate x={260} y={150} text="代官所" size={40} t={seg(f, 1, 10)} rot={-2} />
        {/* 役人 (鶯色の羽織)。文机のうしろに座る */}
        <Person x={960} y={690} s={1.15} f={f} phase={2} cloth={C.yakunin} clothDark={C.yakuninDark} face={push > 0.2 ? "angry" : "normal"} gaze={[push > 0 || offer > 0.5 ? 8 : -4, 6]} pose="hold" />
        <path d="M 952 360 Q 944 326 982 322" stroke={KRP.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M 900 512 L 960 590 L 1020 512" stroke={C.yakuninDark} strokeWidth={6} fill="none" />
        {/* 文机 */}
        <rect x={540} y={720} width={840} height={30} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
        <rect x={570} y={750} width={30} height={80} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1320} y={750} width={30} height={80} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        {/* 人別帳 (見開き。名字の欄に赤線、名前の欄に名前) */}
        <g transform="translate(0 84)">
          <path d="M 600 470 L 960 486 L 960 650 L 590 640 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 960 486 L 1320 470 L 1330 640 L 960 650 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={690} y={512} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.grayDark}>名字</text>
          <text x={860} y={516} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.grayDark}>名前</text>
          <line x1={770} y1={490} x2={766} y2={644} stroke={KRP.gray} strokeWidth={3} />
          {names.map((n, i) => {
            const y = 552 + i * 28;
            const L = seg(f, 8 + i * 6, 14 + i * 6);
            return (
              <g key={i}>
                <line x1={604} y1={y + 6} x2={956} y2={y + 12} stroke={KRP.gray} strokeWidth={2} />
                <line x1={630} y1={y - 6} x2={630 + 110 * L} y2={y - 5} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
                <text x={860} y={y + 2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={NP.sumi}>{n}</text>
              </g>
            );
          })}
          {/* 右ページは書きかけの波線 */}
          <g stroke={KRP.grayDark} strokeWidth={4} fill="none">{[0, 1, 2].map((i) => <path key={i} d={`M ${1000 + i * 90} 500 q 8 25 0 50 t 0 50`} />)}</g>
          <TagPlate x={1150} y={452} text="人別帳" size={28} t={seg(f, 2, 10)} rot={3} />
        </g>
        {/* 押し戻す腕 (右) */}
        <NE1Arm x1={1037} y1={520} x2={tagX - 70} y2={tagY + 10} cloth={C.yakunin} />
        <g transform={`translate(${tagX - 66} ${tagY + 8})`}>
          <ellipse rx={26} ry={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {[-16, -5, 6, 17].map((dy) => <line key={dy} x1={8} y1={dy} x2={26} y2={dy - 2} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
        </g>
        {/* 押し戻しの勢い線 */}
        {push > 0.05 && push < 1 && <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - push}>
          {[-40, 0, 40].map((dy) => <line key={dy} x1={tagX - 140} y1={tagY + dy} x2={tagX - 200} y2={tagY + dy} />)}
        </g>}
        {/* 筆を持つ左手 */}
        <g transform={`translate(${brushX} 640) rotate(${Math.sin(f / 4) * 6})`}>
          <rect x={-5} y={-110} width={10} height={110} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -6 0 L 0 22 L 6 0 Z" fill={KRP.ink} />
          <circle cx={0} cy={-56} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <NE1Arm x1={883} y1={520} x2={brushX - 6} y2={590} cloth={C.yakunin} />
        {/* 硯 */}
        <rect x={1250} y={690} width={90} height={36} rx={6} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
        {/* 町人: 名字の札を差し出す */}
        <Person x={1640} y={850} s={0.95} f={f} phase={5} cloth={C.chonin} clothDark={C.choninDark} face={push > 0.4 ? "sad" : "smile"} gaze={[-8, 0]} lean={lerp(-4, 4, push)} />
        <NE1Chonin x={1640} y={850} s={0.95} />
        <path d={`M 1640 ${850 - 292 * 0.95 - 8} q 0 -24 -18 -30`} stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        <NE1Arm x1={1590} y1={712} x2={tagX + 30} y2={tagY + 50} cloth={C.chonin} />
        <NE1Kifuda x={tagX} y={tagY} s={0.7} text="井上" glow={offer * (1 - push) * 0.6} rot={lerp(0, 12, push)} />
        <circle cx={tagX + 30} cy={tagY + 50} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {push > 0.6 && <XMark x={tagX} y={tagY - 110} s={0.55} t={seg(f, 26, 32)} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #107 名字を名乗るのは、原則として、武士などの特権でした。
// 格: 山 / seed 4107
// 絵: 城下町の通り。裃の武士が胸を張って歩く。その武士の**名札だけが大きく、名字つき**で金色に光る。横を歩く町人の名札は名前だけ (小さい)。武士の腰の刀2本。札「特権」
// どこ: 江戸の城下町の通り。奥の丘に天守、両側に武家屋敷の白壁と商家の瓦屋根。夕方の光
// 演出: 裃の武士が胸を張って通りを歩く。頭上に名字つきの大きな金の名札がかかって光る。横の町人は道をゆずって小さくおじぎ。町人の名札は名前だけで小さい
// 動き: カメラが武士の名札へ少し寄りながら上へ / 武士が歩く (足どりの上下) / 金の札がぽんと出て光が回る (f8〜18) / 町人の小さい札が遅れて出る (f20〜28) / のれん・旗がゆれる
const NE1Plate: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; gold?: boolean; t: number; f: number }> = ({ x, y, w, h, text, size, gold, t, f }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 12) * 4}) scale(${sc}) rotate(${Math.sin(f / 18) * 1.5})`}>
      {gold && <g opacity={0.9}>
        <ellipse rx={w * 0.72} ry={h * 1.05} fill={NP.glow} opacity={0.35} />
        <g stroke={NP.glow} strokeWidth={10} strokeLinecap="round">
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI * (0.92 + (i / 8) * 1.16); const L = 1 + 0.12 * Math.sin(f / 3 + i);
            return <line key={i} x1={Math.cos(a) * w * 0.58} y1={Math.sin(a) * h * 0.85} x2={Math.cos(a) * w * 0.7 * L} y2={Math.sin(a) * h * 1.05 * L} />;
          })}
        </g>
      </g>}
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={18} fill={KRP.ink} opacity={0.18} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={gold ? C.gold : NP.wood} stroke={KRP.ink} strokeWidth={gold ? 8 : 6} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={10} fill="none" stroke={gold ? C.goldDark : NP.grain} strokeWidth={5} />
      {gold && <path d={`M ${-w / 2 + 30} ${-h / 2 + 24} L ${-w / 2 + 120} ${-h / 2 + 24}`} stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={0.7} />}
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={NP.sumi}>{text}</text>
    </g>
  );
};
const Nm107: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.06, cam);
  const walkX = lerp(560, 660, seg(f, 0, 42));
  const bob = Math.abs(Math.sin(f / 5)) * -6;
  const big = seg(f, 8, 18);
  const small = seg(f, 20, 28);
  return (
    <Frame f={f} seed={4107}>
      <g transform={`translate(${lerp(960, 900, cam)} ${lerp(540, 500, cam)}) scale(${sc}) translate(-960 -540)`}>
        {/* 夕方の空 */}
        <rect x={-120} y={-120} width={W + 240} height={700} fill={C.dusk} />
        <rect x={-120} y={-120} width={W + 240} height={260} fill={C.sky} opacity={0.6} />
        {/* 丘と天守 */}
        <path d="M 1180 420 Q 1500 250 1900 330 L 2040 420 Z" fill="#9CB59A" stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(1560 300)">
          <rect x={-130} y={-40} width={260} height={80} fill="#A9A08E" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => {
            const w = 220 - i * 56, y = -40 - i * 70;
            return <g key={i}><rect x={-w / 2} y={y - 50} width={w} height={50} fill={C.wall} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${-w / 2 - 30} ${y - 46} L 0 ${y - 82} L ${w / 2 + 30} ${y - 46} Z`} fill={C.roof} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
              {[-1, 0, 1].map((k) => <rect key={k} x={k * w * 0.28 - 8} y={y - 36} width={16} height={20} fill={KRP.ink} />)}</g>;
          })}
          <path d="M -12 -262 q -8 -20 0 -26 M 12 -262 q 8 -20 0 -26" stroke={C.gold} strokeWidth={6} fill="none" />
        </g>
        {/* 左: 武家屋敷の白壁と門 */}
        <rect x={-120} y={360} width={620} height={240} fill={C.wall} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -140 368 L 520 368 L 500 330 L -120 330 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={530} width={620} height={70} fill={C.namako} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.white} strokeWidth={3} opacity={0.7}>{Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${-110 + i * 28} 540 l 18 18 m -18 0 l 18 -18`} />)}</g>
        <rect x={150} y={300} width={180} height={300} fill={C.bridgeDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 120 310 L 240 250 L 360 310 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 右: 商家ののれん */}
        <rect x={1080} y={420} width={900} height={180} fill={C.wall} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1060 430 L 2000 430 L 1980 390 L 1080 390 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${1100 + i * 140} 432 L ${1230 + i * 140} 432 L ${1232 + i * 140 + Math.sin(f / 8 + i) * 6} 520 L ${1102 + i * 140 + Math.sin(f / 8 + i) * 6} 520 Z`} fill={C.noren} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 通り (土の道・わだち) */}
        <rect x={-120} y={600} width={W + 240} height={600} fill={C.soil} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.thatchDark} strokeWidth={5} opacity={0.5} fill="none">
          <path d="M -120 760 Q 900 700 2040 760" /><path d="M -120 900 Q 900 840 2040 900" />
        </g>
        {/* 遠くの人 (小さく) */}
        <PersonMini x={980} y={640} s={0.42} color={C.mura} f={f} phase={2} />
        <PersonMini x={1060} y={636} s={0.38} color={C.chonin} f={f} phase={5} />
        {/* 武士の影 */}
        <ellipse cx={walkX} cy={862} rx={150} ry={22} fill={KRP.ink} opacity={0.18} />
        {/* 武士 (胸を張って歩く・裃・刀2本) */}
        <Person x={walkX} y={860 + bob} s={1.25} f={f} phase={1} cloth={C.bushi} clothDark={C.bushiDark} face="smile" lean={-4} gaze={[6, -2]} still />
        <NE1Bushi x={walkX} y={860 + bob} s={1.25} dir={1} />
        {/* 金の大きな名札 (名字つき) */}
        <NE1Plate x={walkX + 20} y={310} w={620} h={190} text="佐々木 源之進" size={78} gold t={big} f={f} />
        {/* 町人: 道をゆずっておじぎ */}
        <ellipse cx={1440} cy={862} rx={110} ry={18} fill={KRP.ink} opacity={0.16} />
        <Person x={1440} y={860} s={0.92} f={f} phase={6} cloth={C.chonin} clothDark={C.choninDark} face="worried" lean={lerp(0, -7, seg(f, 14, 24))} gaze={[-8, 4]} />
        <g transform={`rotate(${lerp(0, -7, seg(f, 14, 24))} 1440 860)`}>
          <NE1Chonin x={1440} y={860} s={0.92} />
          <path d={`M 1440 ${860 - 292 * 0.92 - 8} q 0 -24 -18 -30`} stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
        <NE1Plate x={1440} y={520} w={190} h={84} text="八兵衛" size={44} t={small} f={f + 20} />
        <TagPlate x={1120} y={170} text="特権" size={60} t={seg(f, 24, 32)} fill={KRP.white} color={KRP.red} rot={4} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_101: (f) => <Nm101 f={f} />,
  nm_102: (f) => <Nm102 f={f} />,
  nm_103: (f) => <Nm103 f={f} />,
  nm_104: (f) => <Nm104 f={f} />,
  nm_105: (f) => <Nm105 f={f} />,
  nm_106: (f) => <Nm106 f={f} />,
  nm_107: (f) => <Nm107 f={f} />,
};

export const NM_E1_MOTIFS: string[] = [
  "nm_101", // #101
  "nm_102", // #102
  "nm_103", // #103
  "nm_104", // #104
  "nm_105", // #105
  "nm_106", // #106
  "nm_107", // #107
];

export const namaeE1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
