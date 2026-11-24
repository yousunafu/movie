// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#177〜#185 (9文)
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
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend, Ushiro, MeijiLock } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  star: "#D9A520", // 芸能人の舞台衣装 (金)
  starDark: "#A97E12",
  suit: "#2F3B5C", // 事務所の人のスーツ
  suitDark: "#212A44",
  narr: "#6F8FB0",
  narrDark: "#53708F",
  skin: "#F2D2B6",
  hair: "#3B332C",
  velvet: "#7A2E3A", // 展示のビロード
  velvetDark: "#55202A",
  glass: "#CFE6EE",
  glassEdge: "#8FB6C4",
  lacquer: "#2B2B33", // 芸名札の黒漆
  stone: "#D8D2C4", // 官庁の石壁
  stoneDark: "#B5AE9E",
  win: "#9FB9CF",
  winDark: "#6E8BA6",
  sky1: "#F6D9B0", // 朝の空 (下)
  sky2: "#BFD8EA", // 朝の空 (上)
  leaf: "#6FA35C",
  leafDark: "#4E7D40",
  trunk: "#7A5A3A",
  desk: "#B98A57",
  deskDark: "#8E6438",
  floorWood: "#D9B582",
  floorWoodDark: "#B88F5C",
  wall: "#EFE6D2",
  wallDark: "#D9CCAF",
  mirror: "#DCEAF0",
  lesson: "#E86A7A", // 新人のレッスン着
  lessonDark: "#B8505E",
  booklet: "#3F5E96",
  bookletDark: "#2C4474",
  page: "#FBF8EF",
  street: "#C9C2B4",
  dusk1: "#F2B48A",
  dusk2: "#8C7FA8",
  chain: "#8A8F96",
  chainDark: "#5E636A",
  dirt: "#D7B98A",
  dirtDark: "#B8975F",
  rope: "#E2C793",
  ropeDark: "#B0915A",
  flagRed: "#D3402E",
  flagWhite: "#FDFBF7",
  pouch: "#C78A4E",
  pouchDark: "#9A6534",
  plant: "#5E9A55",
  pot: "#C56E45",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
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

// 芸名の札 (この巻の前半だけの物。黒漆に金縁・金の字・星の飾り)。x,y 中心 / s=1 で幅360
const GEIMEI = "星野 ひかり";
const NH1cGeimei: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; f?: number }> = ({
  x, y, s = 1, rot = 0, glow = 0, f = 0,
}) => {
  const tw = Math.sin(f / 7) * 0.5 + 0.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      {glow > 0.01 && <ellipse cx={0} cy={0} rx={250} ry={130} fill={NP.glow} opacity={0.35 * glow} />}
      <rect x={-176} y={-66} width={360} height={150} rx={16} fill={KRP.ink} opacity={0.2} />
      <rect x={-180} y={-75} width={360} height={150} rx={16} fill={C.lacquer} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-166} y={-61} width={332} height={122} rx={10} fill="none" stroke={NP.brass} strokeWidth={6} />
      <path d="M -150 -50 L -100 -50" stroke="#FFFFFF" strokeWidth={5} opacity={0.25} strokeLinecap="round" />
      {/* 金の星 */}
      <g transform="translate(-128 0)">
        <polygon points="0,-26 7,-8 26,-8 11,4 17,23 0,12 -17,23 -11,4 -26,-8 -7,-8" fill={NP.brass} stroke={NP.brassDark} strokeWidth={3} />
        <circle cx={14} cy={-22} r={3 + tw * 3} fill={NP.glowCore} opacity={0.4 + tw * 0.5} />
      </g>
      <text x={22} y={17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={NP.glow}
        stroke={NP.brassDark} strokeWidth={1.5}>{GEIMEI}</text>
    </g>
  );
};

// Person の頭を後頭部 (髪の色) で隠す。x,y,s は Person と同じ値
const NH1cBackHead: React.FC<{ x: number; y: number; s?: number; f?: number; hair?: string; bun?: boolean }> = ({
  x, y, s = 1, f = 0, hair = C.hair, bun = false,
}) => {
  const bob = Math.sin(f / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={-64} cy={-224} rx={9} ry={15} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={64} cy={-224} rx={9} ry={15} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-228} r={65} fill={hair} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -36 -268 Q 0 -290 36 -268" stroke="#FFFFFF" strokeWidth={5} opacity={0.22} fill="none" strokeLinecap="round" />
      <path d="M -40 -176 Q 0 -164 40 -176" stroke={KRP.ink} strokeWidth={3} opacity={0.5} fill="none" />
      {bun && <circle cx={0} cy={-300} r={24} fill={hair} stroke={KRP.ink} strokeWidth={5} />}
    </g>
  );
};

// 観葉植物 (鉢つき)。x,y は鉢の底
const NH1cPlant: React.FC<{ x: number; y: number; s?: number; f?: number; ph?: number }> = ({ x, y, s = 1, f = 0, ph = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 9 }, (_, i) => {
      const a = -90 + (i - 4) * 19 + Math.sin((f + ph * 20 + i * 9) / 16) * 3;
      const L = 150 + (i % 3) * 30;
      const r = (a * Math.PI) / 180;
      const ex = Math.cos(r) * L, ey = -110 + Math.sin(r) * L;
      return (
        <path key={i} d={`M 0 -110 Q ${ex * 0.4 - 10} ${-110 + ey * 0.2 - 40} ${ex} ${ey} Q ${ex * 0.5 + 20} ${-110 + ey * 0.4} 0 -110 Z`}
          fill={i % 2 ? C.plant : C.leafDark} stroke={KRP.ink} strokeWidth={4} />
      );
    })}
    <path d="M -60 -116 L 60 -116 L 46 0 L -46 0 Z" fill={C.pot} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-68} y={-128} width={136} height={22} rx={6} fill={C.pot} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 硬貨 1枚
const NH1cCoin: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 22, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.25, Math.abs(Math.cos(spin)))} 1)`}>
    <circle r={r} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
    <circle r={r * 0.62} fill="none" stroke={NP.brassDark} strokeWidth={3} />
  </g>
);

// がま口の財布 (口が開いて、お札と硬貨がのぞく)。x,y は底のまんなか / s=1 で幅180
const NH1cWallet: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={100} ry={12} fill={KRP.ink} opacity={0.2} />
    {/* のぞくお札 */}
    <rect x={-50} y={-150} width={70} height={90} rx={4} fill="#BFD9B0" stroke={KRP.ink} strokeWidth={4} transform={`rotate(${-10 + Math.sin(f / 8) * 2} -15 -100)`} />
    <rect x={-10} y={-160} width={70} height={90} rx={4} fill="#D9E8C8" stroke={KRP.ink} strokeWidth={4} transform={`rotate(${8 + Math.sin(f / 9) * 2} 25 -110)`} />
    <circle cx={30} cy={-128} r={12} fill="none" stroke="#7FA070" strokeWidth={3} />
    {/* 本体 */}
    <path d="M -90 -82 Q -100 0 -40 0 L 40 0 Q 100 0 90 -82 Z" fill={C.pouch} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -70 -50 Q 0 -30 70 -50" stroke={C.pouchDark} strokeWidth={4} fill="none" strokeDasharray="8 8" />
    {/* 口金 */}
    <path d="M -92 -82 Q 0 -100 92 -82" stroke={NP.brass} strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -92 -82 Q 0 -100 92 -82" stroke={KRP.ink} strokeWidth={3} fill="none" />
    <circle cx={-14} cy={-100} r={11} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={14} cy={-100} r={11} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 手 (肌色の丸)。腕は呼ぶ側で描く
const NH1cHand: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 16 }) => (
  <circle cx={x} cy={y} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
);

// 太い腕 (肩→手)。cloth の袖
const NH1cArm: React.FC<{ x1: number; y1: number; x2: number; y2: number; w?: number; cloth: string; hand?: boolean }> = ({
  x1, y1, x2, y2, w = 30, cloth, hand = true,
}) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={w + 9} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={w} strokeLinecap="round" />
    {hand && <NH1cHand x={x2} y={y2} r={w * 0.62} />}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #177 その力を、本人が独り占めできる権利です。
// 格: 図 / seed 4177
// 絵: #176 の磁石の光を、本人の人形が両手で抱えて守る図 (ガラスのケースに入れる)。札「パブリシティ権」
// どこ: 展示室の小さな舞台 (赤いビロードの幕・上からスポットライト・板の床)
// 演出: #176 で光った磁石を、本人 (金の衣装) がガラスのケースに入れて胸に抱える。左右の外から伸びてくる手は、ガラスに当たって止まる
// 動き: f4〜18 ガラスのふたが下りて閉まる → f18〜34 両側から手が伸びてくる → f34 ガラスにコツンと当たって止まる。磁石の光は脈打ち、カメラはゆっくり寄る
const Nm177: React.FC<{ f: number }> = ({ f }) => {
  const lid = easeOut(seg(f, 4, 18));
  const reach = easeOut(seg(f, 18, 34));
  const bump = seg(f, 33, 40);
  const pulse = 0.75 + Math.sin(f / 5) * 0.25;
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const PX = 960, PY = 815, PS = 1.5;
  const caseL = 806, caseR = 1114, caseT = 600, caseB = 800;
  const lidY = lerp(-160, 0, lid);
  const handL = lerp(-60, caseL - 22, reach) - Math.sin(bump * Math.PI) * 10;
  const handR = lerp(W + 60, caseR + 22, reach) + Math.sin(bump * Math.PI) * 10;
  return (
    <Frame f={f} seed={4177}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* ビロードの幕 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.velvet} />
        {Array.from({ length: 13 }, (_, i) => (
          <path key={i} d={`M ${-20 + i * 160} -40 Q ${40 + i * 160 + Math.sin((f + i * 11) / 20) * 6} 450 ${-10 + i * 160} 900`}
            stroke={C.velvetDark} strokeWidth={26} fill="none" opacity={0.55} />
        ))}
        {/* 幕の上の房飾り */}
        <rect x={-40} y={-40} width={W + 80} height={110} fill={C.velvetDark} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${i * 128 - 20} 70 Q ${i * 128 + 44} 130 ${i * 128 + 108} 70`} fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={-40} y={60} width={W + 80} height={16} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 板の床 */}
        <rect x={-40} y={830} width={W + 80} height={300} fill={C.floorWoodDark} />
        <line x1={-40} y1={830} x2={W + 40} y2={830} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 - 60} y1={830} x2={i * 230 - 300} y2={1100} stroke={C.deskDark} strokeWidth={4} opacity={0.6} />
        ))}
        {/* スポットライト */}
        <polygon points="900,-40 1020,-40 1330,900 590,900" fill={NP.glowCore} opacity={0.2} />
        <ellipse cx={960} cy={870} rx={360} ry={44} fill={NP.glowCore} opacity={0.35} />
        <ellipse cx={960} cy={866} rx={150} ry={20} fill={KRP.ink} opacity={0.3} />
        {/* 本人 (胸の前でケースを抱える) */}
        <Person x={PX} y={PY} s={PS} cloth={C.star} clothDark={C.starDark} face="smile" pose="hold" f={f} gaze={[0, -2]} />
        {/* 衣装のスパンコール */}
        {[[-50, -150], [30, -140], [-20, -110], [44, -96]].map(([dx, dy], i) => (
          <circle key={i} cx={PX + dx * PS} cy={PY + dy * PS} r={5} fill={NP.glowCore} opacity={0.5 + 0.5 * Math.sin(f / 4 + i)} />
        ))}
        {/* ガラスのケース (台座つき) */}
        <rect x={caseL - 16} y={caseB - 6} width={caseR - caseL + 32} height={40} rx={8} fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
        <rect x={caseL - 16} y={caseB + 4} width={caseR - caseL + 32} height={8} fill={NP.brass} />
        {/* ケースの奥の板 (ビロード張り) */}
        <rect x={caseL} y={caseT} width={caseR - caseL} height={caseB - caseT} fill={C.velvetDark} />
        <rect x={caseL + 14} y={caseT + 14} width={caseR - caseL - 28} height={caseB - caseT - 28} fill="none" stroke={NP.brassDark} strokeWidth={3} opacity={0.6} />
        {/* 中のビロードの台 */}
        <path d={`M ${caseL + 40} ${caseB - 6} Q 960 ${caseB - 50} ${caseR - 40} ${caseB - 6} Z`} fill={C.velvet} stroke={KRP.ink} strokeWidth={4} />
        {/* 磁石の光 */}
        <circle cx={960} cy={700} r={110 * pulse} fill={NP.glow} opacity={0.4} />
        <circle cx={960} cy={700} r={60 * pulse} fill={NP.glowCore} opacity={0.55} />
        {/* 馬てい形の磁石 */}
        <g transform={`translate(960 712) rotate(${Math.sin(f / 9) * 3})`}>
          <path d="M -62 -58 L -62 10 A 62 62 0 0 0 62 10 L 62 -58 L 28 -58 L 28 10 A 28 28 0 0 1 -28 10 L -28 -58 Z"
            fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-62} y={-80} width={34} height={26} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={28} y={-80} width={34} height={26} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -48 0 A 46 46 0 0 0 -10 44" stroke="#FFFFFF" strokeWidth={5} opacity={0.4} fill="none" />
        </g>
        {/* 中を回る光の粒 */}
        {Array.from({ length: 7 }, (_, i) => {
          const a = f / 10 + (i / 7) * Math.PI * 2;
          return <circle key={i} cx={960 + Math.cos(a) * 118} cy={690 + Math.sin(a) * 60} r={6} fill={NP.glowCore} stroke={NP.brassDark} strokeWidth={2} />;
        })}
        {/* ガラス (箱 + 下りてくるふた) */}
        <rect x={caseL} y={caseT} width={caseR - caseL} height={caseB - caseT} fill={C.glass} opacity={0.28} stroke={C.glassEdge} strokeWidth={6} />
        <line x1={caseL + 30} y1={caseT + 20} x2={caseL + 70} y2={caseT + 150} stroke="#FFFFFF" strokeWidth={9} opacity={0.6} strokeLinecap="round" />
        <line x1={caseR - 50} y1={caseT + 30} x2={caseR - 34} y2={caseT + 90} stroke="#FFFFFF" strokeWidth={6} opacity={0.5} strokeLinecap="round" />
        <g transform={`translate(0 ${lidY})`}>
          <rect x={caseL - 10} y={caseT - 22} width={caseR - caseL + 20} height={24} rx={6} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={940} y={caseT - 44} width={40} height={24} rx={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {lid >= 1 && f < 24 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 18, 24)}>
            <line x1={caseL - 30} y1={caseT - 30} x2={caseL - 60} y2={caseT - 56} />
            <line x1={caseR + 30} y1={caseT - 30} x2={caseR + 60} y2={caseT - 56} />
          </g>
        )}
        {/* 本人の手: ケースの両脇をしっかり抱える */}
        <NH1cArm x1={PX - 70 * PS} y1={PY - 140 * PS} x2={caseL - 6} y2={720} cloth={C.star} w={32} />
        <NH1cArm x1={PX + 70 * PS} y1={PY - 140 * PS} x2={caseR + 6} y2={720} cloth={C.star} w={32} />
        {/* 外から伸びてくる手 (灰色の袖・顔は画面の外) */}
        {reach > 0 && (
          <g>
            <NH1cArm x1={-80} y1={560} x2={handL - 40} y2={660} cloth={KRP.grayDark} w={34} hand={false} />
            <NH1cHand x={handL - 40} y={660} r={22} />
            <NH1cArm x1={W + 80} y1={540} x2={handR + 40} y2={650} cloth={KRP.gray} w={34} hand={false} />
            <NH1cHand x={handR + 40} y={650} r={22} />
          </g>
        )}
        {/* ガラスに当たった印 (コツン) */}
        {bump > 0 && (
          <g stroke={C.glassEdge} strokeWidth={6} strokeLinecap="round" opacity={0.4 + 0.6 * (1 - bump * 0.5)}>
            {[-1, 0, 1].map((k) => (
              <g key={k}>
                <line x1={caseL - 70} y1={660 + k * 34} x2={caseL - 100} y2={660 + k * 50} />
                <line x1={caseR + 70} y1={650 + k * 34} x2={caseR + 100} y2={650 + k * 50} />
              </g>
            ))}
          </g>
        )}
        <XMark x={caseL - 64} y={560} s={0.45} t={seg(f, 34, 40)} />
        <XMark x={caseR + 64} y={550} s={0.45} t={seg(f, 35, 41)} />
      </g>
      <TagPlate x={960} y={180} text="パブリシティ権" size={56} t={seg(f, 2, 12)} fill={NP.wood} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #178 では、事務所で名前が売れた人が、事務所をやめたらどうなるのでしょう。
// 格: 並 / seed 4178
// 絵: 事務所のビルの出口 (自動ドア・観葉植物)。芸能人の人形が名札を持って出ていこうとして、ドアのところで振り返る。事務所の人も困った顔 (悪役にしない)。`QMark`
// どこ: 芸能事務所のビルの1階ロビー (受付カウンター・観葉植物・ガラスの自動ドア。ドアの外は明るい通り)
// 演出: 芸名の札を胸に抱えた本人が、開いた自動ドアの手前で立ち止まって振り返る。受付の事務所の人も困った顔で手をのばしかける (どちらも悪者ではない)。二人のあいだに？
// 動き: f0〜24 本人がドアへ歩く / f6〜22 自動ドアが左右に開く / f24〜32 立ち止まって振り返る / f26〜34 ？が出る。カメラはゆっくり右へ
const Nm178: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 24));
  const open = easeOut(seg(f, 6, 22));
  const turn = seg(f, 24, 32);
  const reachO = easeOut(seg(f, 22, 36));
  const pan = -40 * easeOut(seg(f, 0, 42));
  const px = lerp(980, 1290, walk);
  const step = walk < 1 ? Math.sin(f / 2.5) * 4 : 0;
  const DL = 1080, DR = 1600, DT = 230, DB = 800;
  const half = (DR - DL) / 2;
  return (
    <Frame f={f} seed={4178}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁と腰板 */}
        <rect x={-60} y={-40} width={W + 140} height={860} fill={C.wall} />
        <rect x={-60} y={600} width={W + 140} height={200} fill={C.wallDark} />
        <line x1={-60} y1={600} x2={W + 80} y2={600} stroke={KRP.ink} strokeWidth={5} />
        {/* 天井の照明 */}
        {[300, 760, 1340, 1820].map((lx, i) => (
          <g key={i}>
            <rect x={lx - 80} y={40} width={160} height={18} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <polygon points={`${lx - 70},58 ${lx + 70},58 ${lx + 150},260 ${lx - 150},260`} fill={NP.glowCore} opacity={0.16} />
          </g>
        ))}
        {/* 床 (タイル) */}
        <rect x={-60} y={DB} width={W + 140} height={320} fill={KRP.floor} />
        <line x1={-60} y1={DB} x2={W + 80} y2={DB} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 160 - 80} y1={DB} x2={i * 200 - 300} y2={1100} stroke={KRP.grayDark} strokeWidth={3} opacity={0.45} />
        ))}
        <line x1={-60} y1={900} x2={W + 80} y2={900} stroke={KRP.grayDark} strokeWidth={3} opacity={0.45} />
        {/* 自動ドアの外 (明るい通り) */}
        <rect x={DL} y={DT} width={DR - DL} height={DB - DT} fill={KRP.blueSoft} />
        <rect x={DL} y={560} width={DR - DL} height={DB - 560} fill={C.street} />
        {[1150, 1300, 1470].map((tx, i) => (
          <g key={i}>
            <rect x={tx - 10} y={430} width={20} height={140} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={tx} cy={400 + Math.sin((f + i * 20) / 18) * 3} r={70} fill={C.leaf} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        <rect x={DL} y={DT} width={DR - DL} height={DB - DT} fill={NP.glowCore} opacity={0.25 + 0.3 * open} />
        {/* ドアの光が床にこぼれる */}
        <polygon points={`${DL + 40},${DB} ${DR - 40},${DB} ${DR + 80},1080 ${DL - 80},1080`} fill={NP.glowCore} opacity={0.35 * open} />
        {/* ガラス戸 2枚 (左右の戸袋へ開く) */}
        {[-1, 1].map((side) => {
          const x0 = side === -1 ? DL - half * 0.9 * open : DL + half + half * 0.9 * open;
          return (
            <g key={side}>
              <rect x={x0} y={DT + 10} width={half} height={DB - DT - 10} fill={C.glass} opacity={0.5} stroke={KRP.grayDark} strokeWidth={8} />
              <line x1={x0 + 40} y1={DT + 60} x2={x0 + 100} y2={DT + 240} stroke="#FFFFFF" strokeWidth={10} opacity={0.6} strokeLinecap="round" />
              <rect x={side === -1 ? x0 + half - 30 : x0 + 14} y={480} width={16} height={90} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 戸袋の壁 (ドアの左右) */}
        <rect x={DL - 290} y={DT - 40} width={290} height={DB - DT + 40} fill={C.wall} stroke={KRP.ink} strokeWidth={5} />
        <rect x={DR} y={DT - 40} width={290} height={DB - DT + 40} fill={C.wall} stroke={KRP.ink} strokeWidth={5} />
        <rect x={DL - 290} y={600} width={290} height={200} fill={C.wallDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={DR} y={600} width={290} height={200} fill={C.wallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* ドアの枠とセンサー */}
        <rect x={DL - 10} y={DT - 50} width={DR - DL + 20} height={50} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={(DL + DR) / 2 - 50} y={DT - 40} width={100} height={30} rx={6} fill={KRP.ink} />
        <circle cx={(DL + DR) / 2 + 30} cy={DT - 25} r={7} fill={f % 16 < 8 ? KRP.red : "#7A2A20"} />
        <rect x={DL - 10} y={DT} width={14} height={DB - DT} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={DR - 4} y={DT} width={14} height={DB - DT} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 床の足ふきマット */}
        <rect x={DL + 40} y={812} width={DR - DL - 80} height={30} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 観葉植物 */}
        <NH1cPlant x={DL - 150} y={812} s={1.15} f={f} />
        <NH1cPlant x={DR + 160} y={812} s={1.15} f={f} ph={1} />
        {/* 受付カウンターと事務所の人 */}
        <rect x={140} y={150} width={420} height={140} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={350} cy={220} r={46} fill="none" stroke={NP.brass} strokeWidth={8} />
        <polygon points="350,186 360,212 388,212 366,228 374,254 350,238 326,254 334,228 312,212 340,212" fill={NP.brass} />
        <Person x={360} y={770} s={1.3} cloth={C.suit} clothDark={C.suitDark} face="normal" f={f} phase={2}
          gaze={[lerp(2, 7, turn), 0]} lean={lerp(0, 4, reachO)} />
        <path d="M 432 432 q -8 14 0 20 q 8 -6 0 -20 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={seg(f, 24, 30)} />
        <rect x={100} y={600} width={540} height={230} rx={8} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={100} y={600} width={540} height={26} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={140} y={660} width={460} height={130} rx={6} fill="none" stroke={C.deskDark} strokeWidth={5} />
        {/* 卓上の呼び鈴とペン立て */}
        <ellipse cx={200} cy={598} rx={30} ry={10} fill={KRP.ink} />
        <path d="M 176 596 Q 200 556 224 596 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={540} y={556} width={40} height={44} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
        <line x1={550} y1={556} x2={544} y2={526} stroke={KRP.ink} strokeWidth={5} />
        <line x1={566} y1={556} x2={574} y2={530} stroke={KRP.red} strokeWidth={5} />
        <NH1cArm x1={360 + 70 * 1.3} y1={770 - 144 * 1.3} x2={lerp(500, 660, reachO)} y2={lerp(600, 540, reachO)} cloth={C.suit} w={28} />
        {/* 本人 (芸名の札を抱えて、振り返る) */}
        <ellipse cx={px} cy={834} rx={80} ry={14} fill={KRP.ink} opacity={0.22} />
        <Person x={px} y={830 + step} s={1.3} cloth={C.star} clothDark={C.starDark} face="normal"
          pose="hold" f={f} gaze={[lerp(5, -7, turn), 0]} lean={lerp(3, -5, turn)} />
        {/* 肩かけのかばん */}
        <path d={`M ${px - 60} ${640 + step} L ${px + 50} ${740 + step}`} stroke={KRP.ink} strokeWidth={8} />
        <rect x={px + 36} y={720 + step} width={70} height={60} rx={10} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <NH1cGeimei x={px} y={686 + step} s={0.52} rot={-4} f={f} />
        <path d={`M ${px - 76} ${452 + step} q -8 14 0 20 q 8 -6 0 -20 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={seg(f, 28, 34)} />
        {/* 歩いてきた足あと */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={px - 90 - i * 80} cy={850 + (i % 2) * 10} rx={16} ry={6} fill={KRP.grayDark} opacity={0.3 * walk} />
        ))}
        <QMark x={840} y={420} s={1.1} f={f} t={seg(f, 26, 34)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #179 2025年、国は、芸能事務所との取引について、指針を出しました。
// 格: 山 / seed 4179
// 絵: 霞が関の官庁街の朝 (役所の建物・並木)。冊子 (表紙の字は「指針」だけ) が f で机の上に置かれ、ページが開く。札「2025年」
// どこ: 霞が関の役所の一室。大きな窓の外に朝の官庁街 (石造りの庁舎・並木・「霞が関」の地名標識)。手前は木の机 (卓上の国旗・書類・湯のみ)
// 演出: 役所の人が、表紙に「指針」とだけある冊子を机に置く。ぱたんと置かれて、表紙が開き、中のページが朝日に光る
// 動き: f6〜18 冊子が下りてきて着地 (ほこり) → f20〜34 表紙がめくれて開く → ページがぱらぱら。鳥が窓の外を横切り、カメラは冊子に寄る
const Nm179: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 6, 18));
  const land = seg(f, 17, 26);
  const openT = easeInOut(seg(f, 20, 34));
  const back = easeOut(seg(f, 20, 32));
  const cam = 1 + 0.07 * easeOut(seg(f, 4, 42));
  const BX = 890, BY = lerp(520, 770, drop); // 背 (とじ目) の位置
  const BW = 330, BH = 170;
  const coverSx = Math.cos(openT * Math.PI); // 1 → -1
  const handX = lerp(lerp(1000, 1060, drop), 600, back);
  const handY = lerp(BY - 60, 790, back);
  return (
    <Frame f={f} seed={4179}>
      <g transform={`translate(890 760) scale(${cam}) translate(-890 -760)`}>
        {/* 部屋の壁 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wall} />
        {/* 窓の外: 朝の空 */}
        <defs>
          <linearGradient id="nh1c-sky179" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.sky2} />
            <stop offset="1" stopColor={C.sky1} />
          </linearGradient>
        </defs>
        <rect x={140} y={70} width={1640} height={560} fill="url(#nh1c-sky179)" />
        <circle cx={330} cy={250} r={70} fill={NP.glowCore} stroke={NP.glow} strokeWidth={8} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + f / 60;
          return <line key={i} x1={330 + Math.cos(a) * 90} y1={250 + Math.sin(a) * 90} x2={330 + Math.cos(a) * 125} y2={250 + Math.sin(a) * 125}
            stroke={NP.glow} strokeWidth={7} strokeLinecap="round" />;
        })}
        {/* 庁舎 (石造り・窓の格子) */}
        {([[420, 300, 420, 330], [880, 200, 430, 430], [1350, 280, 420, 350]] as const).map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} fill={i === 1 ? C.stone : C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={bx - 8} y={by - 16} width={bw + 16} height={20} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: Math.floor(bh / 46) - 1 }, (_, r) =>
              Array.from({ length: Math.floor(bw / 48) - 1 }, (_, c) => (
                <rect key={`${r}-${c}`} x={bx + 24 + c * 48} y={by + 24 + r * 46} width={26} height={26}
                  fill={(r + c + i) % 5 === 0 ? NP.glowCore : C.win} stroke={C.winDark} strokeWidth={2} />
              )),
            )}
          </g>
        ))}
        {/* 中央の庁舎の旗 */}
        <line x1={1095} y1={184} x2={1095} y2={110} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1097} y={112} width={58} height={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
          transform={`skewY(${Math.sin(f / 6) * 4})`} />
        <circle cx={1126} cy={131 + Math.sin(f / 6) * 2} r={11} fill={KRP.red} />
        {/* 大通りと並木 */}
        <rect x={140} y={560} width={1640} height={70} fill={C.street} />
        {[220, 420, 620, 820, 1020, 1220, 1420, 1620].map((tx, i) => (
          <g key={i} transform={`rotate(${Math.sin((f + i * 13) / 18) * 1.5} ${tx} 600)`}>
            <rect x={tx - 9} y={510} width={18} height={90} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${tx - 66} 520 Q ${tx} 400 ${tx + 66} 520 Z`} fill={i % 2 ? C.leaf : C.leafDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 地名の標識 */}
        <line x1={1660} y1={600} x2={1660} y2={430} stroke={KRP.grayDark} strokeWidth={8} />
        <rect x={1560} y={400} width={200} height={58} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
        <text x={1660} y={441} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>霞が関</text>
        {/* 朝の鳥 */}
        {[0, 1, 2].map((i) => {
          const bx = 200 + ((f * 9 + i * 160) % 1500);
          const by = 140 + i * 40 + Math.sin(f / 4 + i) * 8;
          return <path key={i} d={`M ${bx - 16} ${by} Q ${bx - 8} ${by - 10} ${bx} ${by} Q ${bx + 8} ${by - 10} ${bx + 16} ${by}`} stroke={KRP.ink} strokeWidth={4} fill="none" />;
        })}
        {/* 窓枠 */}
        <rect x={140} y={70} width={1640} height={560} fill="none" stroke={KRP.ink} strokeWidth={14} />
        <line x1={687} y1={70} x2={687} y2={630} stroke={KRP.ink} strokeWidth={12} />
        <line x1={1233} y1={70} x2={1233} y2={630} stroke={KRP.ink} strokeWidth={12} />
        <rect x={120} y={626} width={1680} height={22} fill={C.wallDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 差しこむ朝日 */}
        <polygon points="300,70 640,70 1500,1080 700,1080" fill={NP.glowCore} opacity={0.18} />
        {/* 役所の人 (机の向こう) */}
        <Person x={330} y={850} s={1.4} cloth={KRP.grayDark} clothDark={KRP.ink} face="smile" glasses f={f}
          gaze={[5, 3]} lean={lerp(6, 0, back)} />
        <NH1cArm x1={330 + 70 * 1.4} y1={850 - 145 * 1.4} x2={handX} y2={handY} cloth={KRP.grayDark} w={30} />
        {/* 机 */}
        <rect x={-40} y={700} width={W + 80} height={420} fill={C.desk} />
        <line x1={-40} y1={700} x2={W + 40} y2={700} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -40 ${740 + i * 60} q 500 ${i % 2 ? 14 : -14} 1000 0 q 500 ${i % 2 ? -14 : 14} 1000 0`} stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.5} />
        ))}
        {/* 卓上の小さな国旗 */}
        <line x1={1620} y1={760} x2={1620} y2={600} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1580} y={750} width={80} height={16} rx={4} fill={KRP.ink} />
        <rect x={1622} y={602} width={92} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1668} cy={632} r={17} fill={KRP.red} />
        {/* 書類の山と湯のみ */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1340 + i * 3} y={760 - i * 14} width={200} height={14} fill={i % 2 ? KRP.white : C.page} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <path d="M 1250 742 L 1300 742 L 1294 800 L 1256 800 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${1266 + i * 18} 732 q ${Math.sin(f / 6 + i) * 8} -20 0 -40`} stroke={KRP.grayDark} strokeWidth={4} fill="none" opacity={0.6} />
        ))}
        {/* 冊子の影 */}
        <ellipse cx={BX + (openT > 0.5 ? 0 : BW / 2)} cy={BY + BH / 2 + 10} rx={lerp(120, 300, drop) * (1 + openT * 0.6)} ry={22}
          fill={KRP.ink} opacity={0.12 + 0.18 * drop} />
        {/* 冊子: 右側 (中のページ) */}
        <g transform={`translate(0 ${BY - BH / 2})`}>
          <rect x={BX} y={0} width={BW} height={BH} rx={6} fill={C.page} stroke={KRP.ink} strokeWidth={6} />
          <g opacity={openT}>
            <rect x={BX + 95} y={14} width={140} height={58} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <text x={BX + 165} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>指針</text>
          </g>
          {Array.from({ length: 3 }, (_, i) => (
            <line key={i} x1={BX + 30} y1={96 + i * 22} x2={BX + BW - 30 - (i % 3) * 30} y2={96 + i * 22} stroke={KRP.grayDark} strokeWidth={5} opacity={openT} strokeLinecap="round" />
          ))}
          {/* ぱらぱらめくれる1枚 */}
          {openT > 0.6 && (
            <path d={`M ${BX + BW - 4} ${BH - 70 - Math.sin(f / 4) * 14} Q ${BX + BW - 30} ${BH - 30} ${BX + BW - 70 - Math.sin(f / 4) * 14} ${BH - 4} L ${BX + BW - 4} ${BH - 4} Z`}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          )}
          {/* 表紙 (とじ目を軸に裏返る) */}
          <g transform={`translate(${BX} 0) scale(${coverSx} 1)`}>
            <rect x={0} y={0} width={BW} height={BH} rx={6} fill={coverSx > 0 ? C.booklet : C.page} stroke={KRP.ink} strokeWidth={6} />
            {coverSx > 0 && (
              <g>
                <rect x={0} y={0} width={26} height={BH} fill={C.bookletDark} />
                <rect x={110} y={44} width={150} height={80} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <text x={185} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={KRP.ink}>指針</text>
              </g>
            )}
            {coverSx <= 0 && Array.from({ length: 5 }, (_, i) => (
              <line key={i} x1={30} y1={34 + i * 24} x2={BW - 40} y2={34 + i * 24} stroke={KRP.grayDark} strokeWidth={5} opacity={0.6} strokeLinecap="round" />
            ))}
          </g>
        </g>
        {/* 開いたページの光 */}
        {openT > 0.3 && <ellipse cx={BX} cy={BY} rx={360} ry={120} fill={NP.glowCore} opacity={0.25 * openT} />}
        {/* 着地のほこり */}
        {land > 0 && land < 1 && (
          <g opacity={(1 - land) * 0.8}>
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={BX + BW / 2 + (i - 2.5) * 80 * land} cy={BY + BH / 2 + 10 - land * 20} r={8 + land * 16} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
            ))}
          </g>
        )}
      </g>
      <TagPlate x={1560} y={200} text="2025年" size={60} t={seg(f, 2, 12)} fill={NP.wood} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #180 売れるかどうか分からない新人に、事務所はお金をかけて育てます。
// 格: 山 / seed 4180
// 絵: ★**育てた側の理屈**。レッスン室 (鏡・バー・譜面台)。新人 (Person) が練習し、事務所の人 (スーツ・笑顔) が拍手。手前で事務所の財布から硬貨がレッスン代・衣装代・宣伝のポスター (字なし) へ流れていく (f)
// どこ: 事務所のレッスン室 (壁一面の鏡・バー・木の床・譜面台・衣装のラック・壁の宣伝ポスター)
// 演出: 新人が鏡の前で懸命に踊り、事務所の人が笑顔で拍手。手前の椅子の上の事務所の財布から、硬貨が3つの行き先 (譜面台=レッスン代 / 衣装ラック=衣装代 / ポスター=宣伝) へ次々に飛んでいく
// 動き: 新人の体が左右にゆれ汗が飛ぶ / 拍手は10コマに1回 / f4〜 硬貨が弧を描いて飛び続け、行き先に小さな山が育つ。カメラは左から右へゆっくりパン
const Nm180: React.FC<{ f: number }> = ({ f }) => {
  const pan = 30 - 60 * easeOut(seg(f, 0, 42));
  const sway = Math.sin(f / 7) * 7;
  const clap = (f % 10) < 3;
  const WAL: [number, number] = [250, 600];
  const dests: [number, number][] = [[640, 470], [1310, 420], [1660, 330]];
  const peaks = [250, 170, 120];
  const coins = Array.from({ length: 9 }, (_, i) => {
    const t0 = 4 + i * 3;
    if (f < t0) return null;
    const d = i % 3;
    const u = ((f - t0) % 18) / 18;
    const [x2, y2] = dests[d];
    const mx = (WAL[0] + x2) / 2, my = peaks[d];
    const x = (1 - u) * (1 - u) * WAL[0] + 2 * (1 - u) * u * mx + u * u * x2;
    const y = (1 - u) * (1 - u) * WAL[1] + 2 * (1 - u) * u * my + u * u * y2;
    return <NH1cCoin key={i} x={x} y={y} r={20} spin={f / 3 + i} />;
  });
  const pile = (d: number) => Math.min(4, Math.floor(Math.max(0, f - 4 - d * 3) / 9));
  const PX = 960, PY = 830, PS = 1.3;
  return (
    <Frame f={f} seed={4180}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁と床 */}
        <rect x={-80} y={-40} width={W + 160} height={820} fill={C.wall} />
        <rect x={-80} y={760} width={W + 160} height={360} fill={C.floorWood} />
        <line x1={-80} y1={760} x2={W + 80} y2={760} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={i * 140 - 100} y1={760} x2={i * 180 - 400} y2={1100} stroke={C.floorWoodDark} strokeWidth={4} />
        ))}
        {/* 鏡 (壁一面) */}
        <rect x={400} y={110} width={1080} height={550} fill={C.mirror} stroke={KRP.ink} strokeWidth={10} />
        {[760, 1120].map((mx) => <line key={mx} x1={mx} y1={110} x2={mx} y2={660} stroke={C.glassEdge} strokeWidth={5} />)}
        {[[470, 150, 560, 330], [820, 160, 880, 260], [1200, 140, 1300, 300]].map(([a, b, c, d], i) => (
          <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#FFFFFF" strokeWidth={10} opacity={0.55} strokeLinecap="round" />
        ))}
        {/* 鏡に映る新人 (うすく) */}
        <g opacity={0.3}>
          <Person x={PX} y={640} s={0.95} cloth={C.lesson} clothDark={C.lessonDark} face="smile" pose="banzai" f={f} lean={sway * 0.8} still />
        </g>
        {/* バー */}
        <rect x={380} y={548} width={1120} height={18} rx={9} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
        {[460, 960, 1420].map((bx) => <rect key={bx} x={bx - 8} y={556} width={16} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 宣伝のポスター (字なし: 星とスポットライトの絵) */}
        <g transform={`rotate(2 1660 250)`}>
          <rect x={1560} y={110} width={200} height={270} fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
          <polygon points="1660,130 1600,360 1720,360" fill={NP.glowCore} opacity={0.35} />
          <polygon points="1660,200 1676,240 1718,240 1684,264 1698,306 1660,280 1622,306 1636,264 1602,240 1644,240" fill={NP.brass} stroke={NP.brassDark} strokeWidth={3} />
          <circle cx={1660} cy={330} r={18} fill={C.lesson} stroke={KRP.ink} strokeWidth={3} />
          {[[1560, 110], [1760, 110]].map(([tx, ty], i) => (
            <rect key={i} x={tx - 24} y={ty - 10} width={48} height={20} fill="#9FC8C0" opacity={0.9} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i ? 30 : -30} ${tx} ${ty})`} />
          ))}
        </g>
        {/* 衣装のラック */}
        <line x1={1210} y1={420} x2={1210} y2={770} stroke={KRP.grayDark} strokeWidth={10} />
        <line x1={1420} y1={420} x2={1420} y2={770} stroke={KRP.grayDark} strokeWidth={10} />
        <line x1={1196} y1={430} x2={1434} y2={430} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        {[1260, 1350].map((hx, i) => (
          <g key={hx} transform={`rotate(${Math.sin((f + i * 9) / 12) * 2} ${hx} 430)`}>
            <path d={`M ${hx} 430 l 0 14 l -40 20 l 80 0 l -40 -20`} stroke={KRP.ink} strokeWidth={4} fill="none" />
            <path d={`M ${hx - 40} 464 L ${hx + 40} 464 L ${hx + 62} 650 L ${hx - 62} 650 Z`} fill={i ? C.lesson : C.star} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => <circle key={k} cx={hx - 24 + k * 16} cy={540 + (k % 2) * 30} r={4} fill={NP.glowCore} opacity={0.5 + 0.5 * Math.sin(f / 4 + k)} />)}
          </g>
        ))}
        {/* 譜面台 (五線だけの楽譜) */}
        <line x1={640} y1={500} x2={640} y2={790} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 640 790 L 590 830 M 640 790 L 690 830 M 640 790 L 640 836" stroke={KRP.ink} strokeWidth={7} />
        <rect x={560} y={440} width={160} height={110} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-6 640 495)" />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={575} y1={462 + k * 14} x2={705} y2={448 + k * 14} stroke={KRP.grayDark} strokeWidth={3} />)}
        <circle cx={610} cy={490} r={7} fill={KRP.ink} /><circle cx={660} cy={470} r={7} fill={KRP.ink} />
        {/* 新人 (踊る) */}
        <ellipse cx={PX} cy={834} rx={90} ry={14} fill={KRP.ink} opacity={0.2} />
        <Person x={PX} y={PY} s={PS} cloth={C.lesson} clothDark={C.lessonDark} face="smile" pose="banzai" f={f} lean={sway} gaze={[0, -3]} />
        {[0, 1].map((i) => {
          const k = ((f + i * 9) % 18) / 18;
          return <path key={i} d={`M ${PX + (i ? 90 : -90) + (i ? 30 : -30) * k} ${PY - 330 + k * 40} q -7 12 0 18 q 7 -6 0 -18 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - k} />;
        })}
        {/* 事務所の人 (笑顔で拍手) */}
        <Person x={1640} y={830} s={1.25} cloth={C.suit} clothDark={C.suitDark} face="joy" pose="hold" f={f} phase={3} />
        {clap && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            <line x1={1600} y1={660} x2={1580} y2={640} /><line x1={1640} y1={650} x2={1640} y2={624} /><line x1={1680} y1={660} x2={1700} y2={640} />
          </g>
        )}
        {/* 手前の椅子と、事務所の財布 */}
        <rect x={150} y={650} width={200} height={26} rx={6} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={170} y1={676} x2={160} y2={840} stroke={KRP.ink} strokeWidth={9} />
        <line x1={330} y1={676} x2={340} y2={840} stroke={KRP.ink} strokeWidth={9} />
        <NH1cWallet x={250} y={650} s={0.95} f={f} />
        {[0, 1, 2].map((k) => <NH1cCoin key={k} x={215 + k * 35} y={560 - (k % 2) * 10} r={15} spin={f / 5 + k} />)}
        {/* 行き先の硬貨の山 */}
        {dests.map(([dx, dy], d) => Array.from({ length: pile(d) }, (_, k) => (
          <ellipse key={`${d}-${k}`} cx={dx + (k % 2) * 14 - 7} cy={dy + 30 - k * 8} rx={20} ry={7} fill={KRP.gold} stroke={KRP.ink} strokeWidth={3} />
        )))}
        {/* 飛んでいく硬貨 */}
        {coins}
        <TagPlate x={640} y={392} text="レッスン代" size={30} t={seg(f, 8, 16)} fill={NP.wood} />
        <TagPlate x={1310} y={392} text="衣装代" size={30} t={seg(f, 11, 19)} fill={NP.wood} />
        <TagPlate x={1660} y={428} text="宣伝" size={30} t={seg(f, 14, 22)} fill={NP.wood} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #181 だから在籍中に、事務所が芸名を管理するのには、理由があるとしました。
// 格: 並 / seed 4181
// 絵: 事務所の棚に、芸名の札が大事にガラスケースに入れて飾られている。事務所の人がそっと磨く。札「在籍中」
// どこ: 事務所の応接室の飾り棚 (木の棚・トロフィー・背表紙だけのファイル・壁の時計・観葉植物)
// 演出: 棚のまんなかのガラスケースに、芸名の札がビロードの台にのせて大事に飾られている。事務所の人が布でそっとガラスを磨くと、きらりと光る
// 動き: 磨く手が小さな円をゆっくり描く (12コマで1周) / f20〜 磨いたところにきらめき / 時計の針が進む / カメラはケースへ少しずつ寄る
const Nm181: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const a = (f / 12) * Math.PI * 2;
  const hx = 820 + Math.cos(a) * 26;
  const hy = 470 + Math.sin(a) * 18;
  const shine = seg(f, 20, 32);
  const PX = 560, PY = 860, PS = 1.4;
  const CL = 720, CR = 1240, CT = 320, CB = 590;
  return (
    <Frame f={f} seed={4181}>
      <g transform={`translate(980 470) scale(${cam}) translate(-980 -470)`}>
        {/* 壁 (木の腰板と壁紙のしま) */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wall} />
        {Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 100} y={-40} width={44} height={700} fill={C.wallDark} opacity={0.35} />)}
        <rect x={-40} y={660} width={W + 80} height={180} fill={C.deskDark} />
        <line x1={-40} y1={660} x2={W + 40} y2={660} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={820} width={W + 80} height={300} fill={C.floorWoodDark} />
        <line x1={-40} y1={820} x2={W + 40} y2={820} stroke={KRP.ink} strokeWidth={6} />
        {/* 壁の時計 */}
        <circle cx={1720} cy={210} r={80} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => {
          const r = (i / 12) * Math.PI * 2;
          return <line key={i} x1={1720 + Math.cos(r) * 62} y1={210 + Math.sin(r) * 62} x2={1720 + Math.cos(r) * 72} y2={210 + Math.sin(r) * 72} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <line x1={1720} y1={210} x2={1720 + Math.cos(f / 8 - 1.6) * 58} y2={210 + Math.sin(f / 8 - 1.6) * 58} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
        <line x1={1720} y1={210} x2={1760} y2={180} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={1720} y1={210} x2={1700} y2={160} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <NH1cPlant x={1730} y={830} s={1.2} f={f} />
        {/* 飾り棚 */}
        <rect x={640} y={110} width={1000} height={720} rx={10} fill={C.deskDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={670} y={140} width={940} height={660} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
        {[290, 620].map((sy) => <rect key={sy} x={670} y={sy} width={940} height={22} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 上の段: トロフィーと写真立て */}
        {[760, 900, 1440, 1540].map((tx, i) => (
          <g key={i}>
            <rect x={tx - 26} y={270} width={52} height={20} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
            <rect x={tx - 6} y={226} width={12} height={44} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${tx - 34} ${170 + (i % 2) * 14} L ${tx + 34} ${170 + (i % 2) * 14} Q ${tx + 30} 230 ${tx} 230 Q ${tx - 30} 230 ${tx - 34} ${170 + (i % 2) * 14} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        <rect x={1060} y={170} width={160} height={120} rx={4} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1078} y={186} width={124} height={88} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={1140} cy={226} r={18} fill={C.star} /><rect x={1116} y={244} width={48} height={30} rx={10} fill={C.star} />
        {/* 下の段: 背表紙だけのファイル */}
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={700 + i * 62} y={662 - (i % 3) * 8} width={54} height={136 + (i % 3) * 8} fill={[KRP.blueDeep, C.velvet, KRP.green, KRP.grayDark][i % 4]} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 中の段: ガラスケースの芸名の札 */}
        <polygon points={`${CL + 60},312 ${CR - 60},312 ${CR},${CB} ${CL},${CB}`} fill={NP.glowCore} opacity={0.25} />
        <rect x={CL} y={CB - 30} width={CR - CL} height={30} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${CL + 60} ${CB - 30} Q 980 ${CB - 90} ${CR - 60} ${CB - 30} Z`} fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
        <NH1cGeimei x={980} y={460} s={1.05} glow={0.6 + 0.2 * Math.sin(f / 6)} f={f} />
        <rect x={CL} y={CT} width={CR - CL} height={CB - CT - 30} fill={C.glass} opacity={0.22} stroke={C.glassEdge} strokeWidth={7} />
        <rect x={CL - 8} y={CT - 18} width={CR - CL + 16} height={20} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        <line x1={CL + 400} y1={CT + 20} x2={CL + 450} y2={CT + 140} stroke="#FFFFFF" strokeWidth={9} opacity={0.5} strokeLinecap="round" />
        {/* 中の段の右: 花びんと盾 */}
        <path d="M 1330 600 Q 1290 540 1320 500 L 1360 500 Q 1390 540 1350 600 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        {[-1, 0, 1].map((k) => (
          <g key={k} transform={`rotate(${k * 18 + Math.sin(f / 14 + k) * 2} 1340 500)`}>
            <line x1={1340} y1={500} x2={1340} y2={400} stroke={C.leafDark} strokeWidth={5} />
            <circle cx={1340} cy={392} r={18} fill={[C.lesson, KRP.yellow, KRP.red][k + 1]} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 1450 380 L 1570 380 L 1570 500 Q 1510 560 1450 500 Z" fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1510} cy={450} r={30} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1460} y={580} width={100} height={20} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1510} y1={530} x2={1510} y2={580} stroke={KRP.ink} strokeWidth={6} />
        {/* 磨いたところのくもり取り + きらめき */}
        <ellipse cx={820} cy={470} rx={60} ry={44} fill="#FFFFFF" opacity={0.25 + 0.15 * shine} />
        {shine > 0 && [[760, 400], [880, 420], [800, 540]].map(([sx, sy], i) => {
          const k = 0.6 + 0.4 * Math.sin(f / 3 + i * 2);
          return (
            <g key={i} transform={`translate(${sx} ${sy}) scale(${shine * k})`}>
              <path d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z" fill={NP.glowCore} stroke={NP.brassDark} strokeWidth={3} />
            </g>
          );
        })}
        {/* 事務所の人 (ガラスをそっと磨く) */}
        <Person x={PX} y={PY} s={PS} cloth={C.suit} clothDark={C.suitDark} face="smile" f={f} gaze={[6, -2]} lean={4} />
        <NH1cArm x1={PX + 70 * PS} y1={PY - 145 * PS} x2={hx} y2={hy} cloth={C.suit} w={30} hand={false} />
        <path d={`M ${hx - 26} ${hy - 20} Q ${hx} ${hy - 34} ${hx + 26} ${hy - 18} L ${hx + 22} ${hy + 26} Q ${hx} ${hy + 36} ${hx - 24} ${hy + 22} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <NH1cHand x={hx} y={hy} r={18} />
        <TagPlate x={980} y={648} text="在籍中" size={44} t={seg(f, 4, 14)} fill={NP.wood} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #182 一方で、やめたあとに、理由もなく名前を使わせないのは、問題になりうる。
// 格: 山 / seed 4182
// 絵: ★**名前で生きる側の理屈**。事務所の外で、元の所属の人が自分の名札を使おうとすると、名札に鎖がかかって手が届かない。マイクの前で立ちつくす後ろ姿。札「理由のない禁止 → 問題になりうる」
// どこ: 夕方、事務所のビルの外の通り。小さな路上の舞台とマイクスタンド、遠くで待つお客
// 演出: やめたあとの本人 (後ろ姿) が、自分の芸名の札へ手をのばす。札はビルの壁から鎖でつながれ、錠前がかかっていて、ぐいと引き戻されて手が届かない。マイクの前で立ちつくす
// 動き: f6〜20 手がのびる → f18〜26 鎖がぴんと張って札が引き戻される (カチャン) → 札は小さくゆれ続け、手は宙で止まる。カメラはゆっくり寄る
const NH1cChain: React.FC<{ x1: number; y1: number; x2: number; y2: number; sag?: number }> = ({ x1, y1, x2, y2, sag = 0 }) => {
  const n = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 26));
  return (
    <g>
      {Array.from({ length: n }, (_, k) => {
        const u = (k + 0.5) / n;
        const cx = lerp(x1, x2, u);
        const cy = lerp(y1, y2, u) + Math.sin(u * Math.PI) * sag;
        const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        return k % 2 ? (
          <rect key={k} x={cx - 12} y={cy - 4} width={24} height={8} rx={4} fill={C.chainDark} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${ang} ${cx} ${cy})`} />
        ) : (
          <ellipse key={k} cx={cx} cy={cy} rx={17} ry={11} fill="none" stroke={C.chain} strokeWidth={7} transform={`rotate(${ang} ${cx} ${cy})`} />
        );
      })}
    </g>
  );
};
const Nm182: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeOut(seg(f, 6, 20));
  const jerk = seg(f, 18, 26);
  const pull = easeOut(jerk);
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const swing = Math.sin(f / 5) * 3 * (jerk > 0 ? 1 : 0.3);
  const plX = lerp(810, 730, pull), plY = 440;
  const PX = 1240, PY = 860, PS = 1.5;
  const handX = lerp(PX - 120, 1000, reach) + (jerk > 0 && jerk < 1 ? Math.sin(jerk * Math.PI) * 14 : 0);
  const handY = lerp(PY - 230, 460, reach);
  const sag = lerp(40, 0, pull) + Math.sin(f / 9) * 2;
  return (
    <Frame f={f} seed={4182}>
      <defs>
        <linearGradient id="nh1c-dusk182" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.dusk2} />
          <stop offset="1" stopColor={C.dusk1} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 520) scale(${cam}) translate(-960 -520)`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#nh1c-dusk182)" />
        {/* 遠くの街並み */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={600 + i * 140} y={480 - (i % 3) * 70} width={120} height={320} fill={C.dusk2} opacity={0.55} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={i} x={620 + (i % 9) * 140 + (i > 8 ? 60 : 0)} y={430 + (i > 8 ? 120 : 20) - ((i % 9) % 3) * 50} width={18} height={18} fill={NP.glow} opacity={0.5 + 0.3 * Math.sin(f / 9 + i)} />
        ))}
        {/* 通り */}
        <rect x={-40} y={800} width={W + 80} height={300} fill={C.street} />
        <line x1={-40} y1={800} x2={W + 40} y2={800} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 280 - 40} y={950} width={150} height={14} fill={KRP.white} opacity={0.5} />)}
        {/* 事務所のビル (左) */}
        <rect x={-40} y={60} width={560} height={760} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
          <rect key={`${r}-${c}`} x={10 + c * 124} y={100 + r * 82} width={84} height={54} fill={(r + c) % 3 ? C.win : NP.glow} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        )))}
        <rect x={150} y={540} width={260} height={262} fill={C.glass} opacity={0.6} stroke={KRP.ink} strokeWidth={6} />
        <line x1={280} y1={540} x2={280} y2={802} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="280,494 290,518 316,518 296,532 304,556 280,542 256,556 264,532 244,518 270,518" fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        {/* 壁の鎖の金具 */}
        {[360, 520].map((wy) => <circle key={wy} cx={520} cy={wy} r={16} fill={C.chainDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 鎖 (壁 → 札) */}
        <NH1cChain x1={520} y1={360} x2={plX - 150} y2={plY - 40} sag={sag} />
        <NH1cChain x1={520} y1={520} x2={plX - 150} y2={plY + 40} sag={sag} />
        {/* 札にも鎖が巻きつく */}
        <g transform={`rotate(${swing} ${plX} ${plY})`}>
          <NH1cGeimei x={plX} y={plY} s={0.95} f={f} />
          <NH1cChain x1={plX - 170} y1={plY - 50} x2={plX + 170} y2={plY + 40} />
          <g transform={`translate(${plX + 10} ${plY + 30})`}>
            <path d="M -22 -6 L -22 -32 Q -22 -56 0 -56 Q 22 -56 22 -32 L 22 -6" fill="none" stroke={NP.brassDark} strokeWidth={9} />
            <rect x={-34} y={-10} width={68} height={56} rx={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={12} r={7} fill={KRP.ink} /><rect x={-3} y={14} width={6} height={16} fill={KRP.ink} />
          </g>
        </g>
        {/* カチャン (鎖が張った瞬間) */}
        {jerk > 0 && jerk < 1 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - jerk}>
            {[0, 1, 2, 3].map((i) => <line key={i} x1={560 + i * 30} y1={330 - i * 6} x2={570 + i * 34} y2={296 - i * 10} />)}
          </g>
        )}
        {/* 路上の小さな舞台とマイク */}
        <rect x={1000} y={830} width={720} height={40} rx={6} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1470} y1={832} x2={1470} y2={540} stroke={KRP.ink} strokeWidth={9} />
        <path d="M 1430 834 L 1510 834" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={1470} y1={550} x2={1420} y2={500} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1388} y={456} width={46} height={66} rx={21} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} transform="rotate(-40 1411 489)" />
        <path d="M 1394 476 l 30 -6 M 1398 492 l 30 -6" stroke={KRP.ink} strokeWidth={2} />
        {/* 遠くで待つお客 */}
        {[1520, 1610, 1700, 1790].map((ax, i) => (
          <PersonMini key={ax} x={ax} y={720} s={0.55} color={[KRP.blue, KRP.green, C.lesson, KRP.yellow][i]} f={f} phase={i} face="dot" />
        ))}
        {/* 本人の後ろ姿 (立ちつくす) */}
        <ellipse cx={PX} cy={866} rx={100} ry={14} fill={KRP.ink} opacity={0.25} />
        <Person x={PX} y={PY} s={PS} cloth={C.star} clothDark={C.starDark} f={f} still />
        <NH1cBackHead x={PX} y={PY} s={PS} f={0} />
        <NH1cArm x1={PX - 68 * PS} y1={PY - 146 * PS} x2={handX} y2={handY} cloth={C.star} w={32} />
        {/* 指先と札のあいだのすきま */}
        {reach >= 1 && (
          <g stroke={KRP.red} strokeWidth={5} strokeDasharray="10 8" opacity={0.6 + 0.4 * Math.sin(f / 4)}>
            <line x1={plX + 175} y1={plY + 10} x2={handX - 24} y2={handY} />
          </g>
        )}
      </g>
      <TagPlate x={960} y={150} text="理由のない禁止 → 問題になりうる" size={42} t={seg(f, 24, 34)} fill={NP.wood} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #183 使用料を払うなど、別の道も話し合うように、と求めています。
// 格: 山 / seed 4183
// 絵: 事務所の人と本人が**同じテーブル**で向かい合って話し合う (どちらも穏やかな顔)。テーブルの上に、名札と、使用料の小さな袋と、握手しかけの手。窓から光
// どこ: 明るい会議室。奥に大きな窓 (ブラインド・朝の街)、まんなかに木の長テーブル、両側に椅子
// 演出: 事務所の人と本人が同じテーブルで向かい合って座る。どちらも穏やかな顔。テーブルの上に芸名の札と、使用料の小さな袋。二人の手がテーブルの上で握手しかける
// 動き: f6〜16 袋がそっと置かれる / f18〜40 両側から手がのびて、もう少しで握手 (指先が触れる直前) / 窓の光がゆっくりゆれ、湯気が立つ。カメラはテーブルへ寄る
const Nm183: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const put = easeOut(seg(f, 6, 16));
  const shake = easeInOut(seg(f, 18, 40));
  const LX = 500, RX = 1420, PY = 820, PS = 1.4;
  const lHand = lerp(700, 928, shake), rHand = lerp(1220, 992, shake);
  const hy = 640 + Math.sin(f / 8) * 3;
  return (
    <Frame f={f} seed={4183}>
      <g transform={`translate(960 640) scale(${cam}) translate(-960 -640)`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wall} />
        {/* 窓 (街とブラインド) */}
        <rect x={560} y={80} width={800} height={460} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={10} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={590 + i * 110} y={300 - (i % 3) * 60} width={90} height={240} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} opacity={0.7} />
        ))}
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={566} y={86 + i * 18} width={788} height={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />)}
        <line x1={960} y1={80} x2={960} y2={540} stroke={KRP.ink} strokeWidth={8} />
        <rect x={540} y={536} width={840} height={20} fill={C.wallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓から差す光 */}
        <polygon points={`620,190 1300,190 ${1560 + Math.sin(f / 20) * 10},900 ${360 + Math.sin(f / 20) * 10},900`} fill={NP.glowCore} opacity={0.22} />
        {/* 壁の絵と時計がわりの棚 */}
        <rect x={120} y={150} width={260} height={190} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 140 320 L 210 230 L 270 290 L 310 250 L 360 320 Z" fill={C.leaf} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={320} cy={200} r={22} fill={NP.glow} stroke={KRP.ink} strokeWidth={3} />
        <NH1cPlant x={1700} y={640} s={1.1} f={f} />
        {/* 椅子の背 */}
        {[LX, RX].map((cx) => <rect key={cx} x={cx - 110} y={430} width={220} height={240} rx={30} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />)}
        {/* 二人 (穏やかな顔) */}
        <Person x={LX} y={PY} s={PS} cloth={C.suit} clothDark={C.suitDark} face="smile" f={f} gaze={[6, 2]} lean={4} />
        <Person x={RX} y={PY} s={PS} cloth={C.star} clothDark={C.starDark} face="smile" f={f} phase={2} gaze={[-6, 2]} lean={-4} />
        {/* テーブル */}
        <path d="M 160 640 L 1760 640 L 1840 760 L 80 760 Z" fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 300 670 q 660 -12 1320 0 M 240 720 q 720 14 1440 0" stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.5} />
        <rect x={80} y={760} width={1760} height={60} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={160} y={820} width={40} height={260} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1720} y={820} width={40} height={260} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 光の当たるテーブル */}
        <ellipse cx={960} cy={700} rx={420} ry={44} fill={NP.glowCore} opacity={0.3} />
        {/* 湯のみ (両側) */}
        {[330, 1590].map((cx, i) => (
          <g key={cx}>
            <path d={`M ${cx - 30} 664 L ${cx + 30} 664 L ${cx + 24} 720 L ${cx - 24} 720 Z`} fill={i ? KRP.blueSoft : KRP.green} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${cx - 6} 654 q ${Math.sin(f / 6 + i) * 9} -22 0 -44`} stroke={KRP.grayDark} strokeWidth={4} fill="none" opacity={0.6} />
          </g>
        ))}
        {/* 書類 */}
        <rect x={390} y={680} width={170} height={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(-4 475 708)" />
        <rect x={1360} y={680} width={170} height={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(5 1445 708)" />
        {/* テーブルの上の芸名の札 */}
        <NH1cGeimei x={800} y={706} s={0.55} rot={-3} f={f} />
        {/* 使用料の袋 (そっと置かれる) */}
        <g transform={`translate(1130 ${lerp(600, 708, put)})`}>
          <ellipse cx={0} cy={34} rx={70} ry={12} fill={KRP.ink} opacity={0.2 * put} />
          <path d="M -50 30 Q -64 -20 -26 -38 L 26 -38 Q 64 -20 50 30 Z" fill={C.pouch} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -30 -38 Q 0 -56 30 -38" stroke={C.pouchDark} strokeWidth={8} fill="none" />
          <line x1={-28} y1={-38} x2={28} y2={-38} stroke={KRP.ink} strokeWidth={4} />
          <NH1cCoin x={-6} y={-48} r={13} />
        </g>
        <TagPlate x={1130} y={584} text="使用料" size={30} t={seg(f, 12, 20)} fill={NP.wood} />
        {/* 握手しかけの手 */}
        <NH1cArm x1={LX + 68 * PS} y1={PY - 146 * PS} x2={lHand} y2={hy} cloth={C.suit} w={32} hand={false} />
        <NH1cArm x1={RX - 68 * PS} y1={PY - 146 * PS} x2={rHand} y2={hy} cloth={C.star} w={32} hand={false} />
        <ellipse cx={lHand + 8} cy={hy} rx={26} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={rHand - 8} cy={hy} rx={26} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M ${lHand + 20} ${hy - 16} l 16 -8`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${rHand - 20} ${hy - 16} l -16 -8`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        {shake > 0.8 && (
          <g opacity={(shake - 0.8) * 5}>
            <circle cx={960} cy={hy} r={50 + Math.sin(f / 4) * 6} fill={NP.glow} opacity={0.3} />
            {[0, 1, 2, 3].map((i) => {
              const a = -Math.PI / 2 + (i - 1.5) * 0.5;
              return <line key={i} x1={960 + Math.cos(a) * 60} y1={hy + Math.sin(a) * 60} x2={960 + Math.cos(a) * 84} y2={hy + Math.sin(a) * 84} stroke={NP.brassDark} strokeWidth={5} strokeLinecap="round" />;
            })}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #184 育てた側の理屈と、名前で生きる側の理屈。
// 格: 図 / seed 4184
// 絵: ★天秤のからくり。左の皿に「育てた側」(レッスン室の小さな模型・財布)、右の皿に「名前で生きる側」(マイク・名札)。**天秤は水平にぴたりとつり合う**。札「育てた側の理屈」「名前で生きる側の理屈」
// どこ: からくり職人の作業場 (穴あきボードの壁に道具・木の作業台)。作業台の上の大きな真鍮の天秤
// 演出: 左の皿に「育てた側」(レッスン室の小さな模型と財布)、右の皿に「名前で生きる側」(マイクと芸名の札)。最初は左に傾くが、右が乗るとゆれて、水平にぴたりと止まる
// 動き: f4〜12 左の荷が落ちて左に傾く → f14〜24 右の荷が落ちる → ゆれが小さくなり f38 ごろ水平で止まる (針がまんなか・きらり)。カメラは少し引く
const Nm184: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.06 - 0.06 * easeOut(seg(f, 0, 42));
  const dl = easeOut(seg(f, 4, 12));
  const dr = easeOut(seg(f, 14, 24));
  const ang = f < 12 ? 0 : f < 24 ? -10 * easeOut(seg(f, 12, 20)) : -10 * Math.exp(-(f - 24) / 5) * Math.cos((f - 24) * 0.7);
  const level = seg(f, 36, 42);
  const PVX = 960, PVY = 290, R = 520;
  const rad = (ang * Math.PI) / 180;
  const endL: [number, number] = [PVX - R * Math.cos(rad), PVY - R * Math.sin(rad)];
  const endR: [number, number] = [PVX + R * Math.cos(rad), PVY + R * Math.sin(rad)];
  const pan = (e: [number, number], key: string, items: React.ReactNode) => {
    const [ex, ey] = e;
    const py = ey + 250;
    return (
      <g key={key}>
        <path d={`M ${ex} ${ey} L ${ex - 150} ${py} M ${ex} ${ey} L ${ex + 150} ${py} M ${ex} ${ey} L ${ex} ${py}`} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`translate(${ex} ${py})`}>{items}</g>
        <path d={`M ${ex - 170} ${py} Q ${ex} ${py + 70} ${ex + 170} ${py} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${ex - 120} ${py + 14} Q ${ex} ${py + 44} ${ex + 80} ${py + 22}`} stroke="#FFFFFF" strokeWidth={5} opacity={0.35} fill="none" />
        <circle cx={ex} cy={ey} r={12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={4184}>
      <g transform={`translate(960 500) scale(${cam}) translate(-960 -500)`}>
        {/* 穴あきボードの壁 */}
        <rect x={-40} y={-40} width={W + 80} height={900} fill={NP.woodMid} />
        {Array.from({ length: 18 }, (_, r) => Array.from({ length: 32 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={20 + c * 62} cy={20 + r * 50} r={5} fill={NP.woodDark} opacity={0.6} />
        )))}
        {/* 壁の道具 (かなづち・のこぎり・定規・ペンチ) */}
        <g transform="rotate(-20 160 260)">
          <rect x={150} y={180} width={22} height={200} rx={8} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
          <rect x={110} y={160} width={100} height={44} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <path d="M 1700 140 L 1880 140 L 1880 190 L 1720 250 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1660} y={130} width={50} height={80} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <rect x={80} y={520} width={240} height={34} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} transform="rotate(6 200 537)" />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={100 + i * 22} y1={522} x2={100 + i * 22} y2={536} stroke={KRP.ink} strokeWidth={3} transform="rotate(6 200 537)" />)}
        {/* 作業台 */}
        <rect x={-40} y={820} width={W + 80} height={300} fill={C.desk} />
        <line x1={-40} y1={820} x2={W + 40} y2={820} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M -40 ${860 + i * 60} q 500 12 1000 0 q 500 -12 1000 0`} stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.5} />)}
        {/* 天秤の台と柱 */}
        <ellipse cx={PVX} cy={826} rx={240} ry={26} fill={KRP.ink} opacity={0.2} />
        <path d="M 760 820 L 1160 820 L 1100 770 L 820 770 Z" fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={938} y={300} width={44} height={472} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        {/* 目盛りの扇と針 */}
        <path d="M 852 290 A 108 108 0 0 1 1068 290" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {[-30, -15, 0, 15, 30].map((d) => {
          const r = ((d - 90) * Math.PI) / 180;
          return <line key={d} x1={PVX + Math.cos(r) * 80} y1={290 + Math.sin(r) * 80} x2={PVX + Math.cos(r) * 98} y2={290 + Math.sin(r) * 98} stroke={d === 0 ? KRP.red : KRP.ink} strokeWidth={d === 0 ? 7 : 4} />;
        })}
        <line x1={PVX} y1={PVY} x2={PVX + Math.sin(rad) * 90} y2={PVY - Math.cos(rad) * 90} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        {/* さお */}
        <g transform={`rotate(${ang} ${PVX} ${PVY})`}>
          <rect x={PVX - R - 10} y={PVY - 14} width={2 * R + 20} height={28} rx={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={PVX - R + 40 + i * 120} cy={PVY} r={5} fill={NP.brassDark} />)}
        </g>
        <circle cx={PVX} cy={PVY} r={26} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 左の皿: レッスン室の模型 + 財布 */}
        {pan(endL, "L", (
          <g transform={`translate(0 ${-(1 - dl) * 320})`} opacity={dl > 0 ? 1 : 0}>
            <rect x={-130} y={-150} width={160} height={140} fill={C.wall} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-130} y={-40} width={160} height={30} fill={C.floorWood} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-116} y={-136} width={132} height={80} fill={C.mirror} stroke={KRP.ink} strokeWidth={3} />
            <line x1={-120} y1={-66} x2={20} y2={-66} stroke={NP.woodDark} strokeWidth={6} />
            <circle cx={-50} cy={-86} r={11} fill={C.lesson} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-60} y={-76} width={20} height={34} rx={6} fill={C.lesson} stroke={KRP.ink} strokeWidth={3} />
            <NH1cWallet x={92} y={-10} s={0.6} f={f} />
          </g>
        ))}
        {/* 右の皿: マイク + 芸名の札 */}
        {pan(endR, "R", (
          <g transform={`translate(0 ${-(1 - dr) * 320})`} opacity={dr > 0 ? 1 : 0}>
            <rect x={-110} y={-30} width={60} height={20} rx={6} fill={KRP.ink} />
            <line x1={-80} y1={-30} x2={-80} y2={-110} stroke={KRP.ink} strokeWidth={9} />
            <rect x={-102} y={-170} width={44} height={66} rx={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((k) => <line key={k} x1={-98} y1={-156 + k * 14} x2={-62} y2={-156 + k * 14} stroke={KRP.ink} strokeWidth={2} />)}
            <NH1cGeimei x={50} y={-50} s={0.42} rot={-6} f={f} />
          </g>
        ))}
        {/* ぴたり (水平で止まった) */}
        {level > 0 && (
          <g opacity={level}>
            <circle cx={PVX} cy={PVY} r={60 + Math.sin(f / 3) * 6} fill={NP.glow} opacity={0.35} />
            <line x1={PVX - R - 40} y1={PVY - 60} x2={PVX + R + 40} y2={PVY - 60} stroke={KRP.red} strokeWidth={4} strokeDasharray="14 10" />
          </g>
        )}
      </g>
      <TagPlate x={440} y={700} text="育てた側の理屈" size={40} t={seg(f, 8, 16)} fill={NP.wood} />
      <TagPlate x={1480} y={700} text="名前で生きる側の理屈" size={40} t={seg(f, 18, 26)} fill={NP.wood} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #185 その両方が、ひとつの名前を引っぱり合っているのです。
// 格: 山 / seed 4185
// 絵: 1枚の大きな名札に、両側から綱がかかって綱引き。左は事務所の人たち、右は本人とファンたち。**どちらも動かない (引き分け)**。土ぼこり・審判の旗
// どこ: 運動会のような土のグラウンド (奥に観客席と万国旗、地面にまんなかの白線)
// 演出: 1枚の大きな芸名の札の両側に綱。左は事務所の人たち、右は本人とファンたちが、体を後ろに倒して力いっぱい引く。札は白線の真上でぶるぶる震えるだけで、どちらにも動かない (引き分け)。札のうしろで審判が赤白の旗を両方上げる
// 動き: f0〜14 綱がぴんと張る → 両チームが踏んばり、足もとから土ぼこりが上がり続ける / 札は小刻みに震える / f20〜30 審判が両方の旗を上げる。カメラはゆっくり引く
const Nm185: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.08 - 0.08 * easeOut(seg(f, 0, 42));
  const taut = easeOut(seg(f, 0, 14));
  const flags = easeOut(seg(f, 20, 30));
  const tremble = Math.sin(f * 1.3) * 4 * taut;
  const PLX = 960 + tremble, PLY = 600, PLS = 1.5;
  const GY = 800, S = 1.05;
  const leanL = -20 * taut + Math.sin(f / 5) * 1.5;
  const leanR = 20 * taut + Math.sin(f / 5 + 1) * 1.5;
  const handOf = (x: number, lean: number): [number, number] => {
    const r = (lean * Math.PI) / 180;
    return [x + 118 * S * Math.sin(r), GY - 118 * S * Math.cos(r)];
  };
  const left = [600, 430, 260];
  const right = [1320, 1490, 1660];
  const rightCloth: [string, string][] = [[C.star, C.starDark], [KRP.blue, KRP.blueDeep], [KRP.green, C.leafDark]];
  const ropeL = [[PLX - 280, PLY], ...left.map((x) => handOf(x, leanL)), [60, handOf(260, leanL)[1] + 20]];
  const ropeR = [[PLX + 280, PLY], ...right.map((x) => handOf(x, leanR)), [W - 60, handOf(1660, leanR)[1] + 20]];
  const rope = (pts: number[][], key: string) => {
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y + (1 - taut) * 30 * Math.sin((i / pts.length) * Math.PI)}`).join(" ");
    return (
      <g key={key}>
        <path d={d} stroke={KRP.ink} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={C.rope} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={C.ropeDark} strokeWidth={4} fill="none" strokeDasharray="8 10" />
      </g>
    );
  };
  const dust = (x: number, i: number) => {
    const k = ((f + i * 7) % 16) / 16;
    return (
      <g key={`d${i}`} opacity={(1 - k) * 0.7 * taut}>
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={x + (j - 1) * 30 + (x < 960 ? 30 : -30) * k} cy={GY - 10 - k * 40 - j * 8} r={14 + k * 22} fill={C.dirt} stroke={C.dirtDark} strokeWidth={4} />
        ))}
      </g>
    );
  };
  return (
    <Frame f={f} seed={4185}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* 空と観客席 */}
        <rect x={-40} y={-40} width={W + 80} height={560} fill={KRP.blueSoft} />
        {[[300, 120], [1500, 90]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${Math.sin(f / 40 + i) * 10} 0)`}>
            <ellipse cx={cx} cy={cy} rx={110} ry={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={cx + 60} cy={cy - 20} rx={60} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <rect x={-40} y={300} width={W + 80} height={200} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        {[340, 400, 460].map((sy) => <line key={sy} x1={-40} y1={sy} x2={W + 40} y2={sy} stroke={KRP.ink} strokeWidth={3} />)}
        {Array.from({ length: 30 }, (_, i) => (
          <PersonMini key={i} x={30 + i * 64} y={340 + (i % 3) * 60} s={0.3} color={[KRP.red, KRP.blue, KRP.yellow, KRP.green, C.lesson][i % 5]} f={f} phase={i} arms={i % 4 === 0 ? "up" : "down"} />
        ))}
        {/* 万国旗のひも */}
        <path d="M -40 240 Q 480 300 960 240 Q 1440 300 1960 240" stroke={KRP.ink} strokeWidth={3} fill="none" />
        {Array.from({ length: 24 }, (_, i) => {
          const x = i * 84;
          const y = 240 + Math.sin(((i % 12) / 12) * Math.PI) * 50 * 0.6;
          return <polygon key={i} points={`${x},${y} ${x + 40},${y} ${x + 20},${y + 40 + Math.sin(f / 6 + i) * 3}`} fill={[KRP.red, KRP.yellow, KRP.blue, KRP.green][i % 4]} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 土のグラウンド */}
        <rect x={-40} y={500} width={W + 80} height={620} fill={C.dirt} />
        <line x1={-40} y1={500} x2={W + 40} y2={500} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(4185, i) * W} cy={540 + rnd(4186, i) * 500} r={4} fill={C.dirtDark} opacity={0.6} />)}
        {/* まんなかの白線 */}
        <polygon points="948,500 972,500 990,1080 930,1080" fill={KRP.white} opacity={0.9} />
        {/* 審判 (札のうしろで両方の旗を上げる) */}
        <Person x={960} y={560} s={0.85} cloth={KRP.white} clothDark={KRP.gray} face="surprised" f={f} />
        {[-1, 1].map((side) => {
          const sx = 960 + side * 57, sy = 560 - 126;
          const hx = 960 + side * lerp(70, 120, flags), hy = lerp(500, 300, flags);
          return (
            <g key={side}>
              <NH1cArm x1={sx} y1={sy} x2={hx} y2={hy} cloth={KRP.white} w={20} />
              <line x1={hx} y1={hy} x2={hx} y2={hy - 110} stroke={KRP.ink} strokeWidth={6} />
              <rect x={side < 0 ? hx - 80 : hx} y={hy - 110} width={80} height={56} fill={side < 0 ? C.flagRed : C.flagWhite} stroke={KRP.ink} strokeWidth={4}
                transform={`skewY(${Math.sin(f / 4 + side) * 5 * side})`} />
            </g>
          );
        })}
        {/* 左: 事務所の人たち */}
        {left.map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={GY + 4} rx={70} ry={12} fill={KRP.ink} opacity={0.2} />
            <path d={`M ${x - 10} ${GY + 6} l 70 4`} stroke={C.dirtDark} strokeWidth={8} strokeLinecap="round" />
            <Person x={x} y={GY} s={S} cloth={C.suit} clothDark={C.suitDark} face="worried" pose="hold" f={f} phase={i} lean={leanL} gaze={[6, 0]} />
          </g>
        ))}
        {/* 右: 本人とファンたち */}
        {right.map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={GY + 4} rx={70} ry={12} fill={KRP.ink} opacity={0.2} />
            <path d={`M ${x + 10} ${GY + 6} l -70 4`} stroke={C.dirtDark} strokeWidth={8} strokeLinecap="round" />
            <Person x={x} y={GY} s={S} cloth={rightCloth[i][0]} clothDark={rightCloth[i][1]} face="worried" pose="hold" f={f} phase={i + 3} lean={leanR} gaze={[-6, 0]} />
          </g>
        ))}
        {/* 綱 */}
        {rope(ropeL, "L")}
        {rope(ropeR, "R")}
        {[...left.map((x) => handOf(x, leanL)), ...right.map((x) => handOf(x, leanR))].map(([hx, hy], i) => (
          <g key={i}>
            <NH1cHand x={hx - 12} y={hy} r={11} />
            <NH1cHand x={hx + 12} y={hy} r={11} />
          </g>
        ))}
        {/* 土ぼこり */}
        {[...left, ...right].map((x, i) => dust(x, i))}
        {/* 大きな芸名の札 (白線の真上でふるえる) */}
        <g>
          {[-1, 1].map((side) => <circle key={side} cx={PLX + side * 280} cy={PLY} r={20} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />)}
          <NH1cGeimei x={PLX} y={PLY} s={PLS} f={f} rot={Math.sin(f * 0.9) * 0.8 * taut} />
          {taut > 0.9 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              {[-1, 1].map((side) => (
                <g key={side}>
                  <line x1={PLX + side * 330} y1={PLY - 120} x2={PLX + side * 350} y2={PLY - 150} />
                  <line x1={PLX + side * 350} y1={PLY - 90} x2={PLX + side * 380} y2={PLY - 104} />
                </g>
              ))}
            </g>
          )}
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_177: (f) => <Nm177 f={f} />,
  nm_178: (f) => <Nm178 f={f} />,
  nm_179: (f) => <Nm179 f={f} />,
  nm_180: (f) => <Nm180 f={f} />,
  nm_181: (f) => <Nm181 f={f} />,
  nm_182: (f) => <Nm182 f={f} />,
  nm_183: (f) => <Nm183 f={f} />,
  nm_184: (f) => <Nm184 f={f} />,
  nm_185: (f) => <Nm185 f={f} />,
};

export const NM_H1C_MOTIFS: string[] = [
  "nm_177", // #177
  "nm_178", // #178
  "nm_179", // #179
  "nm_180", // #180
  "nm_181", // #181
  "nm_182", // #182
  "nm_183", // #183
  "nm_184", // #184
  "nm_185", // #185
];

export const namaeH1cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
