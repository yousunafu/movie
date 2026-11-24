// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#70〜#77 (8文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // 城の一室
  gold: "#E2B84A", goldDark: "#B8902E", goldLight: "#F4DC8E",
  tatami: "#CFC487", tatamiDark: "#A99E5E", tatamiEdge: "#3F5A3A",
  plaster: "#EFE4C8", beam: "#6B4A2E", beamLight: "#8F6A44", ranma: "#9C7046",
  paperScroll: "#F8F3E6", scrollRod: "#5A3A22", mounting: "#6E8F7A",
  // 人
  hide: "#C9952E", hideDark: "#9A7020", hakama: "#4A4038", hairBlack: "#2A2522",
  skin: "#F2D2B6", vassal: "#4E5D7A", vassalDark: "#36425A", vassal2: "#6E5A3E", vassal2Dark: "#4E3F2A",
  babyWrap: "#F6F0E2", babyBand: "#E8A3A0", babyCheek: "#F2A8A0",
  // 障子・門
  shoji: "#F7F2E6", shojiFrame: "#8A6A44", sky: "#CFE3EE", skyLow: "#E8F0E8",
  stone: "#B9B2A2", stoneDark: "#8E877A", wallWhite: "#F4F0E6", roof: "#4A5058", roofDark: "#33383E",
  earth: "#D3BC8E", earthDark: "#B39C6C", grass: "#8DB06A", grassDark: "#6B8F4E", pine: "#4F7A4A", pineDark: "#3A5C38", bark: "#7A5A3E",
  basket: "#C49A5A", basketDark: "#946C38",
  // 作業場
  plank: "#C9A57A", plankDark: "#A9845A", bench: "#B7834F", benchDark: "#8A5E34", benchTop: "#CC9A62",
  net: "#6E7E5C", pole: "#9A7A4E", sleeve: "#6F8FB0",
  cloth: "#5F7FA8", clothDark: "#41608A", shield: "#8E969E", shieldDark: "#5E666E",
  spoolWood: "#D8BC88", window: "#DDEBF2", lamp: "#FFE7A3", shadow: "#1E1A22",
  me: "#6F8FB0", meDark: "#4F6C8C",
} as const;
void W; void H; void FONT;
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

// 生まれたばかりの赤ちゃん (おくるみ)。x,y は体の中心
const NC1cBaby: React.FC<{ x: number; y: number; s?: number; f: number; laugh?: number }> = ({ x, y, s = 1, f, laugh = 1 }) => {
  const kick = Math.sin(f / 3.2) * 10 * laugh;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* おくるみ */}
      <ellipse cx={0} cy={22} rx={58} ry={70} fill={C.babyWrap} stroke={C.ink} strokeWidth={6} />
      <path d="M -54 10 Q 0 40 54 10" fill="none" stroke={C.babyBand} strokeWidth={14} />
      <path d="M -50 54 Q 0 76 50 54" fill="none" stroke={C.babyBand} strokeWidth={8} opacity={0.8} />
      {/* 手 (ばたばた) */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`rotate(${sd * (30 + kick)} ${sd * 40} -12)`}>
          <rect x={sd * 40 - 11} y={-46} width={22} height={40} rx={11} fill={C.babyWrap} stroke={C.ink} strokeWidth={5} />
          <circle cx={sd * 40} cy={-50} r={12} fill={C.skin} stroke={C.ink} strokeWidth={4.5} />
        </g>
      ))}
      {/* 顔 */}
      <circle cx={0} cy={-36} r={44} fill={C.skin} stroke={C.ink} strokeWidth={6} />
      <path d="M -6 -80 q 8 -14 16 -2" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={-24} cy={-26} rx={9} ry={6} fill={C.babyCheek} opacity={0.8} />
      <ellipse cx={24} cy={-26} rx={9} ry={6} fill={C.babyCheek} opacity={0.8} />
      <g fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round">
        <path d="M -22 -42 q 7 -9 14 0" />
        <path d="M 8 -42 q 7 -9 14 0" />
      </g>
      <path d={`M -12 -22 Q 0 ${-6 + laugh * 6} 12 -22 Z`} fill={C.ink} />
    </g>
  );
};

// 平伏する家臣 (横から見た姿。頭は床に向けているので顔は見えない)。x,y は膝の床の位置。dir=1 で右を向く
const NC1cBow: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; cloth: string; clothDark: string; f: number; phase?: number }> = ({
  x, y, s = 1, dir = 1, cloth, clothDark, f, phase = 0,
}) => {
  const b = Math.sin((f + phase * 13) / 12) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={130} ry={14} fill={C.ink} opacity={0.14} />
      {/* 袴 (正座の脚) */}
      <path d="M -120 0 Q -130 -60 -70 -70 L 30 -60 Q 40 -20 30 0 Z" fill={clothDark} stroke={C.ink} strokeWidth={5} />
      {/* 背中 (肩衣) */}
      <path d={`M -96 -60 Q -60 ${-150 + b} 40 ${-112 + b} Q 90 ${-92 + b} 100 ${-46 + b} L 40 -40 Z`} fill={cloth} stroke={C.ink} strokeWidth={5} />
      <path d={`M -70 -84 Q -20 ${-128 + b} 40 ${-104 + b}`} fill="none" stroke={clothDark} strokeWidth={5} opacity={0.7} />
      {/* 腕と手 (床に手をつく) */}
      <path d={`M 40 ${-96 + b} Q 110 -60 128 -6`} fill="none" stroke={cloth} strokeWidth={24} strokeLinecap="round" />
      <ellipse cx={136} cy={-6} rx={22} ry={9} fill={C.skin} stroke={C.ink} strokeWidth={4} />
      {/* 頭 (下を向いた後頭部+髷) */}
      <circle cx={112} cy={-44 + b} r={34} fill={C.hairBlack} stroke={C.ink} strokeWidth={5} />
      <path d={`M 88 ${-66 + b} q -20 -14 -36 -6`} fill="none" stroke={C.hairBlack} strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={130} cy={-30 + b} rx={9} ry={12} fill={C.skin} stroke={C.ink} strokeWidth={3.5} />
    </g>
  );
};

// 後頭部 (Person の頭に重ねて顔を隠す)。x,y は Person と同じ足元の値
const NC1cBackHead: React.FC<{ x: number; y: number; s?: number; topknot?: boolean }> = ({ x, y, s = 1, topknot = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-228} r={66} fill={C.hairBlack} stroke={C.ink} strokeWidth={5.5} />
    <path d="M -36 -262 Q 0 -284 36 -262" fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.22} />
    {topknot && <path d="M -6 -292 q 4 -30 30 -36" fill="none" stroke={C.hairBlack} strokeWidth={16} strokeLinecap="round" />}
    {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 64} cy={-222} rx={10} ry={15} fill={C.skin} stroke={C.ink} strokeWidth={4} />)}
  </g>
);

// 髷 (Person の頭のてっぺんに寝かせて乗せる)
const NC1cMage: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-306} width={46} height={18} rx={9} fill={KRP.ink} />
    <rect x={-4} y={-302} width={6} height={10} fill={KRP.white} opacity={0.6} />
  </g>
);

// 作業場 (#75〜#77 は同じ場所・同じ時間の続き)。dim で暗くなる
const NC1C_NAFUDA = { x: 1200, y: 420, s: 1.05 } as const;
const NC1C_ME = { x: 450, y: 905, s: 1.38 } as const;
const NC1C_EAR: [number, number] = [NC1C_ME.x + 70 * NC1C_ME.s, NC1C_ME.y - 222 * NC1C_ME.s];
const NC1cWorkshop: React.FC<{ f: number; dim?: number }> = ({ f, dim = 0 }) => (
  <g>
    {/* 板張りの壁 */}
    <rect x={-60} y={-60} width={W + 120} height={720} fill={C.plank} />
    {Array.from({ length: 14 }, (_, i) => (
      <g key={i}>
        <line x1={-60 + i * 150} y1={-60} x2={-60 + i * 150} y2={660} stroke={C.plankDark} strokeWidth={5} />
        <circle cx={-10 + i * 150} cy={120 + rnd(4075, i) * 380} r={7} fill={C.plankDark} opacity={0.6} />
      </g>
    ))}
    {/* 窓 (左上・朝の光) */}
    <rect x={120} y={80} width={330} height={250} rx={8} fill={C.window} stroke={C.ink} strokeWidth={7} />
    <line x1={285} y1={80} x2={285} y2={330} stroke={C.ink} strokeWidth={6} />
    <line x1={120} y1={205} x2={450} y2={205} stroke={C.ink} strokeWidth={6} />
    <path d="M 130 330 L 60 660 L 640 660 L 440 330 Z" fill={C.lamp} opacity={0.22 * (1 - dim)} />
    {/* 糸巻きの棚 (3色の糸巻き: これから結ばれる糸の予告) */}
    <rect x={560} y={150} width={420} height={22} fill={C.benchDark} stroke={C.ink} strokeWidth={5} />
    {[NP.mimi, NP.chobo, NP.shinyo, NP.mimi, KRP.grayDark].map((c, i) => (
      <g key={i} transform={`translate(${610 + i * 80} 150)`}>
        <rect x={-26} y={-70} width={52} height={12} rx={3} fill={C.spoolWood} stroke={C.ink} strokeWidth={4} />
        <rect x={-20} y={-60} width={40} height={50} fill={c} stroke={C.ink} strokeWidth={4} />
        <rect x={-26} y={-12} width={52} height={12} rx={3} fill={C.spoolWood} stroke={C.ink} strokeWidth={4} />
      </g>
    ))}
    {/* 壁の道具掛け (小刀・定規・木槌) */}
    <g transform="translate(1600 110)">
      <rect x={-150} y={-20} width={300} height={16} fill={C.benchDark} stroke={C.ink} strokeWidth={4} />
      <rect x={-120} y={-4} width={18} height={120} rx={6} fill={C.benchTop} stroke={C.ink} strokeWidth={4} />
      <rect x={-30} y={-4} width={26} height={150} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={-30} y1={14 + k * 22} x2={-18} y2={14 + k * 22} stroke={C.ink} strokeWidth={3} />)}
      <rect x={70} y={-4} width={12} height={90} fill={C.pole} stroke={C.ink} strokeWidth={4} />
      <rect x={46} y={80} width={60} height={40} rx={8} fill={C.bench} stroke={C.ink} strokeWidth={4} />
    </g>
    {/* 床 */}
    <rect x={-60} y={660} width={W + 120} height={480} fill={KRP.floor} />
    {Array.from({ length: 6 }, (_, i) => (
      <line key={i} x1={-60} y1={720 + i * 70} x2={W + 60} y2={720 + i * 70} stroke={C.plankDark} strokeWidth={3} opacity={0.35} />
    ))}
    {/* 床の木箱 (糸巻きがのぞく) と木くず */}
    <g transform="translate(150 900)">
      <ellipse cx={0} cy={6} rx={130} ry={14} fill={C.ink} opacity={0.15} />
      {[NP.chobo, NP.shinyo, NP.mimi].map((c, k) => <rect key={k} x={-80 + k * 50} y={-150 - (k % 2) * 14} width={40} height={50} fill={c} stroke={C.ink} strokeWidth={4} />)}
      <rect x={-120} y={-110} width={240} height={110} rx={6} fill={C.bench} stroke={C.ink} strokeWidth={6} />
      <line x1={-120} y1={-56} x2={120} y2={-56} stroke={C.benchDark} strokeWidth={5} />
    </g>
    {[[700, 990], [820, 1010], [640, 1040]].map(([sx, sy], k) => (
      <path key={k} d={`M ${sx} ${sy} q 20 -24 36 0 q 10 18 -8 22`} fill="none" stroke={C.plankDark} strokeWidth={5} strokeLinecap="round" />
    ))}
    {/* 作業台 */}
    <rect x={760} y={600} width={1220} height={60} fill={C.benchTop} stroke={C.ink} strokeWidth={7} />
    <rect x={790} y={660} width={1160} height={260} fill={C.bench} stroke={C.ink} strokeWidth={7} />
    <line x1={790} y1={760} x2={1950} y2={760} stroke={C.benchDark} strokeWidth={5} />
    {[1000, 1360, 1720].map((dx) => <rect key={dx} x={dx - 40} y={694} width={80} height={14} rx={7} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />)}
    {/* 名札の吊り台 */}
    <g>
      {[-1, 1].map((sd) => (
        <rect key={sd} x={NC1C_NAFUDA.x + sd * 300 - 14} y={220} width={28} height={384} fill={C.bench} stroke={C.ink} strokeWidth={6} />
      ))}
      <rect x={NC1C_NAFUDA.x - 340} y={204} width={680} height={30} rx={6} fill={C.benchTop} stroke={C.ink} strokeWidth={6} />
      <circle cx={NC1C_NAFUDA.x} cy={244} r={8} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
      {[-1, 1].map((sd) => (
        <rect key={sd} x={NC1C_NAFUDA.x + sd * 300 - 50} y={590} width={100} height={16} rx={4} fill={C.benchDark} stroke={C.ink} strokeWidth={4} />
      ))}
    </g>
    {/* 台の上の小物: 墨壺・紙束・はさみ箱 */}
    <g transform="translate(1720 600)">
      <ellipse cx={0} cy={-4} rx={70} ry={12} fill={C.ink} opacity={0.15} />
      <rect x={-56} y={-50} width={112} height={46} rx={10} fill={C.beam} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-50} rx={56} ry={12} fill={C.ink} />
    </g>
    <g transform={`translate(880 600) rotate(${Math.sin(f / 30) * 0.5})`}>
      {[0, 1, 2].map((k) => <rect key={k} x={-60 + k * 4} y={-14 - k * 12} width={140} height={12} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />)}
    </g>
    {dim > 0 && <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.shadow} opacity={0.32 * dim} />}
  </g>
);

// 呼ぶ人 (ナレーター役)。左右反転して、左手を口にあてて右の名札に向かって呼ぶ。右耳 (画面の右側) を描き足す
const NC1cCaller: React.FC<{ f: number; face?: "joy" | "smile" | "worried" | "surprised"; call?: boolean }> = ({ f, face = "joy", call = true }) => {
  const { x, y, s } = NC1C_ME;
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={90} ry={14} fill={C.ink} opacity={0.16} />
      <g transform={`translate(${x} 0) scale(-1 1) translate(${-x} 0)`}>
        <Person x={x} y={y} s={s} f={f} face={face} pose={call ? "raise" : "stand"} cloth={C.me} clothDark={C.meDark} phase={2} still />
        {call && <circle cx={x + 58 * s} cy={y - 196 * s} r={13 * s} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />}
      </g>
      {/* 右耳 */}
      <ellipse cx={NC1C_EAR[0]} cy={NC1C_EAR[1]} rx={14} ry={21} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <path d={`M ${NC1C_EAR[0] - 2} ${NC1C_EAR[1] - 8} q 6 6 0 14`} fill="none" stroke={C.ink} strokeWidth={3} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #70 豊臣秀吉は、待ちに待った男の子に、「棄」と名前をつけます。
// 格: 山 / seed 4070
// 絵: 戦国の城の一室 (金の襖・畳・欄間)。陣羽織の男 (秀吉) の**後ろ姿**が、生まれたばかりの赤ちゃんを高く抱き上げる (喜びの線)。床の間に大きな紙が掛けられ、そこに大きく「棄」の一字 (筆の字)。家臣たちが平伏
// どこ: 1589年・戦国の城の奥の一室。金の襖・欄間・畳・床の間
// 演出: 陣羽織の男の後ろ姿が、赤ちゃんを高々と抱き上げる。床の間の掛け軸がするすると下り、「棄」の一字が筆で現れる。左右で家臣が平伏
// 動き: カメラがゆっくり寄る / f4〜20 赤ちゃんが持ち上がる / f8〜24 掛け軸が下りる / f20〜34 字が現れる / 喜びの線が脈打つ / 家臣の背がわずかに上下
const NC1cHideBack: React.FC<{ x: number; y: number; s?: number; lift: number; f: number }> = ({ x, y, s = 1, lift, f }) => {
  const hy = -400 - lift * 70; // 手の高さ
  const sway = Math.sin(f / 10) * 4 * lift;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={130} ry={16} fill={C.ink} opacity={0.18} />
      {/* 袴 */}
      <path d="M -78 -150 L 78 -150 L 108 0 L -108 0 Z" fill={C.hakama} stroke={C.ink} strokeWidth={6} />
      {[-50, -16, 18, 52].map((px) => <line key={px} x1={px * 0.8} y1={-146} x2={px * 1.15} y2={-4} stroke={C.ink} strokeWidth={3.5} opacity={0.55} />)}
      {/* 腕 (袖口から上へ) */}
      {[-1, 1].map((sd) => {
        const hx = sd * 46 + sway;
        return (
          <g key={sd}>
            <path d={`M ${sd * 86} -250 Q ${sd * 120} ${(-250 + hy) / 2} ${hx} ${hy + 20}`} fill="none" stroke={C.ink} strokeWidth={42} strokeLinecap="round" />
            <path d={`M ${sd * 86} -250 Q ${sd * 120} ${(-250 + hy) / 2} ${hx} ${hy + 20}`} fill="none" stroke={C.hakama} strokeWidth={32} strokeLinecap="round" />
            <circle cx={hx} cy={hy + 14} r={18} fill={C.skin} stroke={C.ink} strokeWidth={4.5} />
          </g>
        );
      })}
      {/* 陣羽織 */}
      <path d="M -96 -268 Q 0 -286 96 -268 L 118 -112 L 8 -112 L 0 -150 L -8 -112 L -118 -112 Z" fill={C.hide} stroke={C.ink} strokeWidth={6} />
      <path d="M -96 -268 Q 0 -286 96 -268 L 92 -246 Q 0 -262 -92 -246 Z" fill={C.hideDark} stroke={C.ink} strokeWidth={4} />
      <path d="M -104 -126 L -8 -126 M 8 -126 L 104 -126" stroke={C.hideDark} strokeWidth={8} />
      {/* 背の飾り紋 (丸に3つ星。家紋そのものではない) */}
      <circle cx={0} cy={-200} r={30} fill={C.goldLight} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2].map((k) => {
        const an = (k / 3) * Math.PI * 2 - Math.PI / 2;
        return <circle key={k} cx={Math.cos(an) * 12} cy={-200 + Math.sin(an) * 12} r={7} fill={C.hideDark} />;
      })}
      {/* 首と後頭部・髷 */}
      <rect x={-16} y={-300} width={32} height={34} fill={C.skin} stroke={C.ink} strokeWidth={4} />
      <circle cx={0} cy={-330} r={52} fill={C.hairBlack} stroke={C.ink} strokeWidth={5.5} />
      <path d="M -30 -360 Q 0 -378 30 -360" fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.22} />
      <rect x={-8} y={-392} width={16} height={34} rx={6} fill={C.hairBlack} stroke={C.ink} strokeWidth={4} />
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 52} cy={-324} rx={9} ry={14} fill={C.skin} stroke={C.ink} strokeWidth={4} />)}
    </g>
  );
};

const Nm070: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1, 1.06, cam);
  const lift = easeOut(seg(f, 4, 20));
  const unroll = easeOut(seg(f, 8, 24));
  const ink = seg(f, 20, 34);
  const joy = seg(f, 18, 26);
  const SX = 560, SW = 230, ST = 214, SL = 400; // 掛け軸
  const babyX = 1210 + Math.sin(f / 10) * 4 * lift;
  const babyY = 880 - (400 + lift * 70) * 1.25 - 44;
  return (
    <Frame f={f} seed={4070}>
      <g transform={`translate(1000 460) scale(${sc}) translate(-1000 -460)`}>
        {/* 天井と欄間 */}
        <rect x={-60} y={-60} width={W + 120} height={110} fill={C.beam} />
        <rect x={-60} y={50} width={W + 120} height={120} fill={C.ranma} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(${60 + i * 250} 110)`}>
            <path d="M -90 10 q 20 -40 60 -20 q 30 -30 60 0 q 40 -10 50 26 q -40 20 -80 6 q -50 22 -90 -12 Z" fill={C.beam} stroke={C.ink} strokeWidth={4} />
            <circle cx={40} cy={-22} r={12} fill={C.goldLight} opacity={0.8} />
          </g>
        ))}
        <rect x={-60} y={170} width={W + 120} height={28} fill={C.beamLight} stroke={C.ink} strokeWidth={6} />
        {/* 左の金襖 */}
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={-40 + i * 230} y={198} width={230} height={450} fill={C.gold} stroke={C.ink} strokeWidth={6} />
            <path d={`M ${-30 + i * 230} 300 q 60 -30 120 0 q 60 30 100 -6`} fill="none" stroke={C.goldLight} strokeWidth={22} strokeLinecap="round" opacity={0.85} />
            <circle cx={150 + i * 230 - 40} cy={430} r={12} fill={C.goldDark} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 20 640 Q 60 470 130 420 Q 90 520 160 560 Q 210 470 300 440" fill="none" stroke={C.bark} strokeWidth={16} strokeLinecap="round" />
        {[[130, 410], [300, 430], [210, 500]].map(([px, py], i) => (
          <ellipse key={i} cx={px} cy={py} rx={70} ry={26} fill={C.pine} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 床の間 */}
        <rect x={420} y={198} width={480} height={450} fill={C.plaster} stroke={C.ink} strokeWidth={6} />
        <rect x={420} y={198} width={480} height={40} fill={C.beam} opacity={0.35} />
        <rect x={420} y={604} width={480} height={44} fill={C.beamLight} stroke={C.ink} strokeWidth={6} />
        <rect x={888} y={198} width={30} height={470} fill={C.bark} stroke={C.ink} strokeWidth={6} />
        {/* 掛け軸 (下へ広がる) */}
        <g>
          <line x1={SX + SW / 2} y1={238} x2={SX + SW / 2 - 30} y2={ST} stroke={C.ink} strokeWidth={3} />
          <line x1={SX + SW / 2} y1={238} x2={SX + SW / 2 + 30} y2={ST} stroke={C.ink} strokeWidth={3} />
          <rect x={SX - 12} y={ST} width={SW + 24} height={16} rx={6} fill={C.scrollRod} stroke={C.ink} strokeWidth={4} />
          <rect x={SX} y={ST + 14} width={SW} height={SL * unroll} fill={C.mounting} stroke={C.ink} strokeWidth={5} />
          <rect x={SX + 22} y={ST + 44} width={SW - 44} height={Math.max(0, SL * unroll - 76)} fill={C.paperScroll} stroke={C.ink} strokeWidth={3} />
          <defs>
            <clipPath id="nc1c070ink">
              <rect x={SX} y={ST + 60} width={SW} height={300 * ink} />
            </clipPath>
          </defs>
          <text x={SX + SW / 2} y={ST + 270} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190}
            fill={NP.sumi} clipPath="url(#nc1c070ink)">棄</text>
          <rect x={SX - 16} y={ST + 10 + SL * unroll} width={SW + 32} height={20} rx={8} fill={C.scrollRod} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 床の間の花入れ */}
        <g transform="translate(830 604)">
          <path d="M -24 0 Q -34 -50 -12 -70 L 12 -70 Q 34 -50 24 0 Z" fill={C.goldDark} stroke={C.ink} strokeWidth={5} />
          <path d="M 0 -70 q -10 -60 -40 -80 M 0 -70 q 16 -50 40 -60" fill="none" stroke={C.grassDark} strokeWidth={5} />
          <circle cx={-40} cy={-152} r={10} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
          <circle cx={40} cy={-132} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 右の金襖 (雲と松) */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={918 + i * 260} y={198} width={260} height={450} fill={i % 2 ? C.gold : C.goldLight} stroke={C.ink} strokeWidth={6} />
            <path d={`M ${940 + i * 260} ${280 + (i % 2) * 60} q 50 -34 100 -4 q 50 -28 100 6`} fill="none" stroke={i % 2 ? C.goldLight : C.gold} strokeWidth={24} strokeLinecap="round" />
            <circle cx={918 + i * 260 + (i % 2 ? 24 : 236)} cy={440} r={11} fill={C.goldDark} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 畳 */}
        <rect x={-60} y={648} width={W + 120} height={500} fill={C.tatami} />
        {[648, 760, 900].map((ly, i) => <rect key={ly} x={-60} y={ly} width={W + 120} height={12 + i * 3} fill={C.tatamiEdge} />)}
        {[-300, 200, 700, 1200, 1700, 2200].map((lx, i) => (
          <line key={lx} x1={960 + (lx - 960) * 0.62} y1={660} x2={lx} y2={1100} stroke={C.tatamiDark} strokeWidth={5} opacity={0.6 + (i % 2) * 0.2} />
        ))}
        {/* 光の差し込み */}
        <path d="M 1100 198 L 1380 198 L 1600 1100 L 1000 1100 Z" fill={C.goldLight} opacity={0.12} />
        {/* 平伏する家臣 */}
        <NC1cBow x={220} y={880} s={1.05} dir={1} cloth={C.vassal} clothDark={C.vassalDark} f={f} phase={0} />
        <NC1cBow x={560} y={960} s={1.1} dir={1} cloth={C.vassal2} clothDark={C.vassal2Dark} f={f} phase={2} />
        <NC1cBow x={1720} y={900} s={1.05} dir={-1} cloth={C.vassal2} clothDark={C.vassal2Dark} f={f} phase={4} />
        {/* 主役: 陣羽織の後ろ姿と赤ちゃん */}
        <NC1cHideBack x={1210} y={880} s={1.25} lift={lift} f={f} />
        {/* 喜びの線 */}
        <g stroke={KRP.orange} strokeWidth={9} strokeLinecap="round" opacity={joy}>
          {Array.from({ length: 10 }, (_, i) => {
            const an = (i / 10) * Math.PI * 2;
            const r1 = 120 + Math.sin(f / 3 + i) * 8;
            return <line key={i} x1={babyX + Math.cos(an) * r1} y1={babyY + Math.sin(an) * r1} x2={babyX + Math.cos(an) * (r1 + 36)} y2={babyY + Math.sin(an) * (r1 + 36)} />;
          })}
        </g>
        {joy > 0 && [0, 1, 2].map((k) => (
          <path key={k} transform={`translate(${babyX + [-170, 160, 120][k]} ${babyY + [-60, -90, 70][k] - Math.sin(f / 6 + k) * 8}) scale(${pop(joy)})`}
            d="M 0 -6 C -14 -24 -36 -4 0 18 C 36 -4 14 -24 0 -6 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        ))}
        <NC1cBaby x={babyX} y={babyY} s={1.1} f={f} laugh={0.4 + 0.6 * joy} />
        <TagPlate x={200} y={250} text="1589年" size={40} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #71 捨てる、の棄です。
// 格: 図 / seed 4071
// 絵: 「棄」の字の大きな札と、その下に「捨てる」の札 (イコールの線)。家臣の一人が二度見して目を丸くする (surprised)。障子の前=世界。小さな笑い
// どこ: 同じ城の、障子の間。文机に硯と筆。障子に昼の光
// 演出: 大きな白木の板に墨の「棄」、その下にイコールの線と「捨てる」の札。家臣が読み流しかけて二度見、目を丸くして書状を取り落とす
// 動き: f6〜14 イコールが引かれる / f10〜20 「捨てる」札 / f14〜20 家臣が一度目をそらす → f20〜24 ぐいっと振り返る (カメラがきゅっと寄る) / 書状が落ちる / 障子の影がゆれる
const Nm071: React.FC<{ f: number }> = ({ f }) => {
  const eq = easeOut(seg(f, 6, 14));
  const away = seg(f, 14, 19) * (1 - seg(f, 20, 24));
  const back = seg(f, 20, 24);
  const lean = lerp(0, 7, away) - 5 * back;
  const punch = easeOut(seg(f, 22, 28));
  const sc = 1 + 0.035 * punch;
  const drop = seg(f, 23, 36);
  const PX = 1470, PY = 960, PS = 1.4;
  return (
    <Frame f={f} seed={4071}>
      <g transform={`translate(1000 480) scale(${sc}) translate(-1000 -480)`}>
        {/* 障子の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={920} fill={C.shoji} />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={-40 + i * 340} y={-40} width={340} height={900} fill="none" stroke={C.shojiFrame} strokeWidth={12} />
            {[1, 2, 3].map((k) => <line key={k} x1={-40 + i * 340 + k * 85} y1={-40} x2={-40 + i * 340 + k * 85} y2={860} stroke={C.shojiFrame} strokeWidth={5} />)}
            {Array.from({ length: 8 }, (_, k) => <line key={k} x1={-40 + i * 340} y1={70 + k * 110} x2={300 + i * 340} y2={70 + k * 110} stroke={C.shojiFrame} strokeWidth={5} />)}
          </g>
        ))}
        {/* 障子に映る松の枝の影 (ゆれる) */}
        <g opacity={0.08} transform={`rotate(${Math.sin(f / 16) * 1.5} 1900 60)`}>
          <path d="M 1950 60 Q 1700 120 1520 90" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
          {[[1560, 80], [1700, 120], [1820, 70]].map(([px, py], i) => <ellipse key={i} cx={px} cy={py} rx={90} ry={34} fill={C.ink} />)}
        </g>
        {/* 畳 */}
        <rect x={-60} y={860} width={W + 120} height={300} fill={C.tatami} />
        <rect x={-60} y={860} width={W + 120} height={14} fill={C.tatamiEdge} />
        {/* 文机・硯・筆 */}
        <g transform="translate(270 870)">
          <rect x={-180} y={-150} width={360} height={26} rx={6} fill={C.beamLight} stroke={C.ink} strokeWidth={6} />
          <rect x={-160} y={-124} width={22} height={124} fill={C.beam} stroke={C.ink} strokeWidth={5} />
          <rect x={138} y={-124} width={22} height={124} fill={C.beam} stroke={C.ink} strokeWidth={5} />
          <rect x={-130} y={-186} width={110} height={36} rx={8} fill={C.ink} />
          <ellipse cx={-96} cy={-176} rx={26} ry={8} fill="#4A4440" />
          <g transform={`rotate(${-12 + Math.sin(f / 18) * 2} 60 -164)`}>
            <rect x={0} y={-170} width={150} height={12} rx={5} fill={C.bark} stroke={C.ink} strokeWidth={4} />
            <path d="M 150 -170 l 34 6 l -34 6 Z" fill={C.ink} />
          </g>
        </g>
        {/* 主役: 「棄」の大きな白木の板 */}
        <g transform="translate(840 300)">
          <line x1={-120} y1={-190} x2={0} y2={-250} stroke={C.ink} strokeWidth={5} />
          <line x1={120} y1={-190} x2={0} y2={-250} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={-252} r={12} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
          <rect x={-196} y={-182} width={400} height={380} rx={18} fill={C.ink} opacity={0.15} />
          <rect x={-200} y={-190} width={400} height={380} rx={18} fill={NP.wood} stroke={C.ink} strokeWidth={9} />
          <g stroke={NP.grain} strokeWidth={4} fill="none" opacity={0.7}>
            <path d="M -180 -120 q 90 -16 180 0 q 90 16 170 -4" />
            <path d="M -182 130 q 100 14 190 0 q 80 -12 170 6" />
          </g>
          <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={290} fill={NP.sumi}>棄</text>
        </g>
        {/* イコール */}
        <g stroke={KRP.red} strokeWidth={16} strokeLinecap="round">
          <line x1={760} y1={538} x2={760 + 160 * eq} y2={538} />
          <line x1={760} y1={574} x2={760 + 160 * eq} y2={574} />
        </g>
        <TagPlate x={840} y={680} text="捨てる" size={76} t={seg(f, 10, 20)} />
        {/* 家臣 (二度見) */}
        <ellipse cx={PX} cy={PY + 2} rx={90} ry={14} fill={C.ink} opacity={0.18} />
        <g transform={`rotate(${lean} ${PX} ${PY})`}>
          <Person x={PX} y={PY} s={PS} f={f} face={back > 0.5 ? "surprised" : "normal"} pose="hold"
            gaze={back > 0.5 ? [-7, -3] : away > 0.5 ? [7, 0] : [-5, -2]} cloth={C.vassal} clothDark={C.vassalDark} still />
          <NC1cMage x={PX} y={PY} s={PS} />
          {/* 書状 (驚いて手から落ちる) */}
          {drop <= 0 && <rect x={PX - 60} y={PY - 150 * PS} width={120} height={30} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={4} />}
        </g>
        {drop > 0 && (
          <g transform={`translate(${PX + 40 * drop} ${PY - 140 + 130 * easeOut(drop)}) rotate(${-80 * drop})`}>
            <rect x={-60} y={-15} width={120} height={30} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <line x1={-30} y1={-15} x2={-30} y2={15} stroke={KRP.red} strokeWidth={4} />
          </g>
        )}
        {/* 二度見の線と「！」 */}
        {back > 0 && (
          <g opacity={back}>
            <g stroke={C.ink} strokeWidth={6} strokeLinecap="round">
              {[0, 1, 2].map((k) => <line key={k} x1={PX - 110 - k * 6} y1={PY - 330 + k * 34} x2={PX - 150 - k * 10} y2={PY - 344 + k * 40} />)}
            </g>
            <text x={PX + 100} y={PY - 300 - Math.sin(f / 4) * 4} fontFamily={FONT} fontWeight={900} fontSize={110} fill={KRP.red}
              stroke={C.ink} strokeWidth={5} paintOrder="stroke">！</text>
            <path d={`M ${PX + 76} ${PY - 300} q -10 18 0 26 q 10 -8 0 -26 Z`} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #72 捨て子は丈夫に育つ、という言い伝えにあやかったとされます。
// 格: 山 / seed 4072
// 絵: 城の門の外の道ばた。赤ちゃんを入れたかごがそっと置かれ (儀式)、物陰から家臣がすぐに拾い上げに来る (f でかごが持ち上がる)。赤ちゃんは元気に笑う。札「言い伝え」。※「本当に捨てた」に見えないよう、家臣がすぐそばに待機している構図にする
// どこ: 城の門 (石垣・白壁・櫓門) を出てすぐの道ばた。松の木。昼
// 演出: 家臣Aが赤ちゃんのかごをそっと道に置き、一歩下がって頭を下げる (儀式)。松の陰に控えていた家臣Bがすぐ駆け寄って拾い上げる。赤ちゃんはきゃっきゃと笑う。札「言い伝え」
// 動き: カメラが左 (門) から右へゆっくりパン / f0〜8 家臣Aが下がる / f8〜14 家臣Bが松の陰から顔を出す / f14〜28 駆け寄る / f28〜38 かごが持ち上がる / 雲が流れる / 赤ちゃんの手足がばたばた
const NC1cBasket: React.FC<{ x: number; y: number; f: number; laugh: number }> = ({ x, y, f, laugh }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* y はかごの底 */}
    <ellipse cx={0} cy={4} rx={130} ry={16} fill={C.ink} opacity={0.18} />
    {/* 持ち手 (赤ちゃんの後ろ) */}
    <path d="M -110 -86 Q 0 -190 110 -86" fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
    <path d="M -110 -86 Q 0 -190 110 -86" fill="none" stroke={C.basket} strokeWidth={9} strokeLinecap="round" />
    <NC1cBaby x={0} y={-140} s={0.86} f={f} laugh={laugh} />
    {/* かご本体 (編み目) */}
    <path d="M -124 -88 L 124 -88 L 100 0 L -100 0 Z" fill={C.basket} stroke={C.ink} strokeWidth={6} />
    {[-66, -22, 22, 66].map((k) => <line key={k} x1={k * 1.1} y1={-86} x2={k * 0.88} y2={-2} stroke={C.basketDark} strokeWidth={5} />)}
    {[-62, -38, -14].map((k) => <path key={k} d={`M ${-120 + (k + 88) * 0.26} ${k} L ${120 - (k + 88) * 0.26} ${k}`} stroke={C.basketDark} strokeWidth={5} />)}
    <rect x={-132} y={-100} width={264} height={20} rx={10} fill={C.basketDark} stroke={C.ink} strokeWidth={5} />
  </g>
);

const Nm072: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const tx = lerp(60, -40, pan);
  const backA = easeOut(seg(f, 0, 8));
  const peek = easeOut(seg(f, 8, 14));
  const run = easeInOut(seg(f, 14, 28));
  const lift = easeOut(seg(f, 28, 38));
  const BX = 980, BY = 812;
  const bx = 1700 - peek * 70 - run * (1700 - 70 - BX);
  const running = f >= 14 && f < 28;
  const laugh = 0.4 + 0.6 * seg(f, 30, 40);
  return (
    <Frame f={f} seed={4072}>
      <g transform={`translate(${tx} 0) translate(1000 640) scale(1.3) translate(-1000 -640)`}>
        {/* 空と雲 */}
        <rect x={-120} y={-60} width={W + 240} height={600} fill={C.sky} />
        <rect x={-120} y={400} width={W + 240} height={200} fill={C.skyLow} />
        {[[260, 110], [980, 80], [1560, 140]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + f * 0.6} ${cy})`}>
            <ellipse cx={0} cy={0} rx={110} ry={34} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <ellipse cx={-50} cy={-20} rx={54} ry={30} fill={KRP.white} />
            <ellipse cx={40} cy={-24} rx={60} ry={34} fill={KRP.white} />
          </g>
        ))}
        {/* 遠くの天守 */}
        <g transform="translate(160 330)" opacity={0.85}>
          <rect x={-60} y={-60} width={120} height={80} fill={C.wallWhite} stroke={C.ink} strokeWidth={4} />
          <path d="M -90 -60 L 0 -110 L 90 -60 Z" fill={C.roof} stroke={C.ink} strokeWidth={4} />
          <rect x={-40} y={-150} width={80} height={50} fill={C.wallWhite} stroke={C.ink} strokeWidth={4} />
          <path d="M -66 -150 L 0 -190 L 66 -150 Z" fill={C.roof} stroke={C.ink} strokeWidth={4} />
          <path d="M -70 20 L 0 -20 L 70 20 Z" fill={C.roof} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 石垣 */}
        <path d="M -120 420 L 720 420 L 760 800 L -120 800 Z" fill={C.stone} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, k) => (
          <rect key={`${r}-${k}`} x={-110 + k * 110 + (r % 2) * 50 + r * 6} y={436 + r * 72} width={100} height={62} rx={14}
            fill={rnd(4072, r * 9 + k) > 0.5 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={4} opacity={0.9} />
        )))}
        {/* 白壁と櫓門 */}
        <rect x={-120} y={330} width={840} height={90} fill={C.wallWhite} stroke={C.ink} strokeWidth={6} />
        <path d="M -140 330 L 740 330 L 700 290 L -120 290 Z" fill={C.roof} stroke={C.ink} strokeWidth={6} />
        <rect x={300} y={480} width={300} height={320} fill={C.ink} opacity={0.85} />
        <rect x={300} y={480} width={60} height={320} fill={C.beam} stroke={C.ink} strokeWidth={5} />
        <rect x={540} y={480} width={60} height={320} fill={C.beam} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((k) => <circle key={k} cx={330} cy={540 + k * 90} r={7} fill={NP.brass} />)}
        <rect x={270} y={440} width={360} height={44} fill={C.beamLight} stroke={C.ink} strokeWidth={5} />
        {/* 道 (土の道・わだち・小石) と草の土手 */}
        <rect x={740} y={740} width={W} height={70} fill={C.grass} />
        <rect x={-120} y={800} width={W + 240} height={400} fill={C.earth} />
        <path d="M -120 800 Q 600 790 1200 806 T 2100 800" fill="none" stroke={C.earthDark} strokeWidth={5} />
        {[880, 960].map((ry) => <path key={ry} d={`M -120 ${ry} Q 700 ${ry - 14} 1400 ${ry + 6} T 2100 ${ry}`} fill="none" stroke={C.earthDark} strokeWidth={4} opacity={0.5} />)}
        {Array.from({ length: 9 }, (_, k) => <ellipse key={k} cx={400 + k * 170 + rnd(7, k) * 60} cy={830 + rnd(8, k) * 120} rx={10} ry={6} fill={C.stoneDark} stroke={C.ink} strokeWidth={2.5} />)}
        {Array.from({ length: 12 }, (_, k) => (
          <path key={k} d={`M ${720 + k * 110} ${800 - rnd(72, k) * 30} l -8 -22 m 8 22 l 8 -26 m -8 26 l 18 -16`} stroke={C.grassDark} strokeWidth={4} fill="none" />
        ))}
        {/* 家臣A (かごを置いて一歩さがり、頭を下げる) */}
        <ellipse cx={700 - backA * 50} cy={822} rx={80} ry={12} fill={C.ink} opacity={0.18} />
        <g transform={`rotate(${backA * 12} ${700 - backA * 50} 820)`}>
          <Person x={700 - backA * 50} y={820} s={1.0} f={f} face="smile" cloth={C.vassal2} clothDark={C.vassal2Dark} phase={1} still gaze={[6, 4]} />
          <NC1cMage x={700 - backA * 50} y={820} s={1.0} />
        </g>
        {/* 松の木 (家臣Bは最初この陰に控えている) */}
        {!(f >= 14) && (
          <g>
            <Person x={bx} y={830} s={1.05} f={f} face="normal" gaze={[-7, 0]} cloth={C.vassal} clothDark={C.vassalDark} phase={3} still />
            <NC1cMage x={bx} y={830} s={1.05} />
          </g>
        )}
        <path d="M 1640 840 Q 1610 640 1680 470 Q 1720 380 1660 260" fill="none" stroke={C.ink} strokeWidth={70} strokeLinecap="round" />
        <path d="M 1640 840 Q 1610 640 1680 470 Q 1720 380 1660 260" fill="none" stroke={C.bark} strokeWidth={58} strokeLinecap="round" />
        {[[1540, 300, 150], [1800, 230, 130], [1660, 170, 120], [1830, 420, 110]].map(([px, py, r], i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 20 + i) * 1.2} ${px} ${py})`}>
            <ellipse cx={px} cy={py} rx={r} ry={r * 0.36} fill={C.pine} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={px - 10} cy={py - 8} rx={r * 0.7} ry={r * 0.18} fill={C.pineDark} opacity={0.6} />
          </g>
        ))}
        {/* 家臣B (駆け寄って、かごを抱き上げる) */}
        {f >= 14 && (
          <g>
            <ellipse cx={bx} cy={BY - 20} rx={86} ry={12} fill={C.ink} opacity={0.18} />
            <Person x={bx} y={BY - 22} s={1.2} f={f} face={lift > 0.3 ? "joy" : "smile"} pose={running ? "run" : "hold"}
              gaze={[-6, 3]} lean={running ? -8 : 0} cloth={C.vassal} clothDark={C.vassalDark} phase={3} still />
            <NC1cMage x={bx} y={BY - 22} s={1.2} />
          </g>
        )}
        {/* 主役: 赤ちゃんのかご */}
        <NC1cBasket x={BX} y={BY - 30 * lift} f={f} laugh={laugh} />
        {/* きゃっきゃの印 */}
        {lift > 0 && [0, 1, 2].map((k) => (
          <path key={k} transform={`translate(${BX + [-190, 200, -150][k]} ${BY - 260 - [0, 40, 110][k] - Math.sin(f / 5 + k) * 8}) scale(${pop(lift)})`}
            d="M 0 -6 C -14 -24 -36 -4 0 18 C 36 -4 14 -24 0 -6 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>
      <TagPlate x={1260} y={150} text="言い伝え" size={50} t={seg(f, 4, 14)} rot={-2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #73 名前を知られると、つかまる。
// 格: 並 / seed 4073
// 絵: **装置に戻る**。作業台の上の `Nafuda`。網を持った手が近づく (#50 と同じ)。名札が少し揺れておびえる (くすりと)
// どこ: 名札の作業場 (装置に戻る)。夜、作業台を卓上の灯りが照らす。低い位置から名札に寄った構図
// 演出: 吊り台の名札に、右上から虫取り網を持った手がそろりと迫る。名札はぷるぷる震え、汗をかいて身をすくめる
// 動き: f0〜42 カメラがじわっと寄る / f4〜34 網が近づく (少しふらつく) / f18〜 名札が小刻みに震える・汗が飛ぶ / 灯りがかすかにまたたく
const NC1cNet: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {/* 柄と手 (網の輪の中心が原点) */}
    <rect x={150} y={-14} width={420} height={28} rx={12} fill={C.pole} stroke={C.ink} strokeWidth={6} />
    <rect x={470} y={-44} width={360} height={88} rx={34} fill={C.sleeve} stroke={C.ink} strokeWidth={6} />
    <rect x={470} y={-44} width={40} height={88} rx={12} fill={C.clothDark} stroke={C.ink} strokeWidth={5} />
    <circle cx={450} cy={0} r={38} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
    <path d="M 432 -30 q -22 12 -10 34 M 428 4 q -16 10 -4 26" fill="none" stroke={C.ink} strokeWidth={4} />
    {/* 網の袋 */}
    <path d="M -150 -10 Q -60 260 60 170 Q 150 100 150 0" fill={KRP.white} opacity={0.35} stroke={C.ink} strokeWidth={5} />
    {[-110, -60, -10, 40, 90].map((k) => <path key={k} d={`M ${k} ${-Math.sqrt(Math.max(0, 150 * 150 - k * k)) * 0.35} Q ${k - 20} 140 ${k * 0.3} 190`} fill="none" stroke={C.net} strokeWidth={3} />)}
    {[40, 90, 140].map((k) => <path key={k} d={`M ${-140 + k * 0.4} ${k - 20} Q 0 ${k + 30} ${140 - k * 0.4} ${k - 30}`} fill="none" stroke={C.net} strokeWidth={3} />)}
    {/* 網の輪 */}
    <ellipse cx={0} cy={0} rx={150} ry={52} fill="none" stroke={C.ink} strokeWidth={14} />
    <ellipse cx={0} cy={0} rx={150} ry={52} fill="none" stroke={KRP.grayDark} strokeWidth={7} />
  </g>
);

const Nm073: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1, 1.07, easeInOut(seg(f, 0, 42)));
  const come = easeInOut(seg(f, 4, 34));
  const nx = lerp(1720, 1230, come) + Math.sin(f / 7) * 8;
  const ny = lerp(120, 250, come) + Math.cos(f / 9) * 6;
  const fear = seg(f, 18, 26);
  const shake = Math.sin(f * 2.1) * 3.2 * fear;
  const NX = 880, NY = 470, NS = 1.35;
  const flick = 0.9 + Math.sin(f / 3) * 0.04;
  return (
    <Frame f={f} seed={4073} dark>
      <g transform={`translate(900 480) scale(${sc}) translate(-900 -480)`}>
        {/* 夜の作業場の壁 (板と道具掛け) */}
        <rect x={-60} y={-60} width={W + 120} height={720} fill={C.plankDark} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={-60} x2={i * 170} y2={660} stroke={C.benchDark} strokeWidth={6} />)}
        <g transform="translate(240 150)" opacity={0.9}>
          <rect x={-120} y={-10} width={240} height={14} fill={C.benchDark} stroke={C.ink} strokeWidth={4} />
          {[-80, -20, 40, 90].map((k, i) => (
            <rect key={k} x={k - 8} y={4} width={16} height={[110, 80, 130, 70][i]} rx={6} fill={[C.pole, KRP.grayDark, C.bench, C.pole][i]} stroke={C.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 卓上の灯り (左上) と光の円錐 */}
        <path d={`M 380 150 L 70 660 L 1400 660 L 520 150 Z`} fill={C.lamp} opacity={0.3 * flick} />
        <ellipse cx={760} cy={650} rx={620} ry={60} fill={C.lamp} opacity={0.35 * flick} />
        <g>
          <line x1={300} y1={-60} x2={300} y2={60} stroke={C.ink} strokeWidth={8} />
          <path d="M 300 60 L 520 150 L 360 190 Z" fill={KRP.grayDark} stroke={C.ink} strokeWidth={6} />
          <circle cx={440} cy={168} r={22} fill={C.lamp} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 作業台 */}
        <rect x={-60} y={640} width={W + 120} height={70} fill={C.benchTop} stroke={C.ink} strokeWidth={7} />
        <rect x={-60} y={710} width={W + 120} height={420} fill={C.bench} stroke={C.ink} strokeWidth={7} />
        {[200, 700, 1200, 1700].map((dx) => (
          <g key={dx}>
            <rect x={dx - 200} y={750} width={400} height={150} rx={8} fill={C.benchTop} stroke={C.ink} strokeWidth={6} />
            <rect x={dx - 50} y={808} width={100} height={22} rx={11} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {Array.from({ length: 2 }, (_, i) => <path key={i} d={`M -60 ${940 + i * 80} q 500 ${rnd(73, i) * 30 - 15} 1000 0 t 1040 0`} fill="none" stroke={C.benchDark} strokeWidth={4} opacity={0.6} />)}
        {/* 台の上の小物: 糸巻き・のみ・虫めがね */}
        <g transform="translate(260 640)">
          <ellipse cx={0} cy={0} rx={70} ry={10} fill={C.ink} opacity={0.2} />
          <rect x={-46} y={-18} width={92} height={18} rx={4} fill={C.spoolWood} stroke={C.ink} strokeWidth={4} />
          <rect x={-36} y={-92} width={72} height={74} fill={NP.mimi} stroke={C.ink} strokeWidth={4} />
          <rect x={-46} y={-110} width={92} height={18} rx={4} fill={C.spoolWood} stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform="translate(1520 650) rotate(-8)">
          <circle cx={0} cy={-40} r={46} fill={C.window} opacity={0.6} stroke={C.ink} strokeWidth={8} />
          <rect x={40} y={-30} width={120} height={22} rx={10} fill={C.beam} stroke={C.ink} strokeWidth={5} transform="rotate(30 40 -30)" />
        </g>
        {/* 吊り台 */}
        {[-1, 1].map((sd) => <rect key={sd} x={NX + sd * 330 - 16} y={240} width={32} height={410} fill={C.bench} stroke={C.ink} strokeWidth={6} />)}
        <rect x={NX - 370} y={222} width={740} height={34} rx={6} fill={C.benchTop} stroke={C.ink} strokeWidth={6} />
        {/* 主役: 名札 (震える) */}
        <Nafuda x={NX + shake} y={NY} s={NS} text="山田 花子" f={f} rot={shake * 0.8 - fear * 3} />
        {/* 震えの線と汗 */}
        {fear > 0 && (
          <g opacity={fear}>
            <g stroke={C.ink} strokeWidth={6} strokeLinecap="round">
              {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
                <line key={`${sd}${k}`} x1={NX + sd * (300 + k * 4)} y1={NY - 60 + k * 50} x2={NX + sd * (330 + k * 6)} y2={NY - 70 + k * 50} />
              )))}
            </g>
            {[0, 1, 2].map((k) => {
              const ph = ((f * 1.3 + k * 9) % 22) / 22;
              const dx = NX - 300 - k * 34 - ph * 40;
              const dy = NY - 170 + k * 34 + ph * 50;
              return <path key={k} d={`M ${dx} ${dy} q -18 30 0 44 q 18 -14 0 -44 Z`} fill={KRP.blue} stroke={C.ink} strokeWidth={3.5} opacity={1 - ph * 0.6} />;
            })}
          </g>
        )}
        {/* 迫る網 */}
        <NC1cNet x={nx} y={ny} rot={-22 + Math.sin(f / 11) * 3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #74 だから隠す。呼ばない。わざと悪い名前をつける。
// 格: 図 / seed 4074
// 絵: 名札の前に3つのからくりが順に動く: ①布がかかる (隠す) ②口に指を当てる人形 (呼ばない) ③「悪い名前」の盾が立つ。f で①②③が順にがちゃん、と作動。作業台の上=世界
// どこ: 同じ作業場の作業台を正面から。昼。台の前板に歯車
// 演出: 名札を守る3つのからくりが順に作動: ①上の巻き棒から布がばさっと下りて名札を隠す ②中央の箱からばねで人形が飛び出し、口に指を当てる ③右の蝶番から「悪い名前」の盾が起き上がる
// 動き: (直し) 左から①隠す→②呼ばない→③わざと悪い名前。f2〜12 ① / f30〜40 ② / f60〜70 ③ / 作動のたびに衝撃線 / 歯車が回る / カメラが①→②→③と左から右へ振れる
const NC1cGear: React.FC<{ x: number; y: number; r: number; rot: number; fill: string }> = ({ x, y, r, rot, fill }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: 10 }, (_, k) => (
      <rect key={k} x={-r * 0.14} y={-r - r * 0.2} width={r * 0.28} height={r * 0.4} fill={fill} stroke={C.ink} strokeWidth={4} transform={`rotate(${k * 36})`} />
    ))}
    <circle r={r} fill={fill} stroke={C.ink} strokeWidth={5} />
    <circle r={r * 0.3} fill={C.ink} opacity={0.6} />
  </g>
);
const NC1cBang: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t > 0 && t < 1 ? (
    <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - t}>
      {Array.from({ length: 7 }, (_, k) => {
        const an = (k / 7) * Math.PI * 2;
        const r = 60 + t * 50;
        return <line key={k} x1={x + Math.cos(an) * r} y1={y + Math.sin(an) * r} x2={x + Math.cos(an) * (r + 30)} y2={y + Math.sin(an) * (r + 30)} />;
      })}
    </g>
  ) : null;

const Nm074: React.FC<{ f: number }> = ({ f }) => {
  // 台本の順に左から ①隠す (布) → ②呼ばない (口に指の人形) → ③わざと悪い名前 (盾)。ナレーションに合わせて f0〜15 / 30〜45 / 60〜75 で1つずつ作動
  const m1 = easeOut(seg(f, 2, 12));
  const m2 = pop(seg(f, 30, 40));
  const m3 = pop(seg(f, 60, 70));
  const camX = f < 26 ? 40 : f < 56 ? lerp(40, 0, seg(f, 26, 34)) : lerp(0, -40, seg(f, 56, 64));
  const NX = 520, NY = 390; // ① 名札と布 (左)
  const DX = 960; // ② 人形の箱 (中央)
  const BENCH = 650;
  const springLen = 70 * m2;
  return (
    <Frame f={f} seed={4074}>
      <g transform={`translate(${camX} 0)`}>
        {/* 漆喰の壁と棚 */}
        <rect x={-120} y={-60} width={W + 240} height={BENCH + 60} fill={C.plaster} />
        <rect x={-120} y={-60} width={W + 240} height={70} fill={C.beam} />
        {[1190, 1720].map((sx) => (
          <g key={sx}>
            <rect x={sx - 150} y={260} width={300} height={18} fill={C.benchDark} stroke={C.ink} strokeWidth={5} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={sx - 120 + k * 90} y={190 - (k % 2) * 20} width={64} height={70 + (k % 2) * 20} rx={8}
                fill={[C.basket, KRP.blueSoft, C.spoolWood][k]} stroke={C.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* 作業台 */}
        <rect x={-120} y={BENCH} width={W + 240} height={60} fill={C.benchTop} stroke={C.ink} strokeWidth={7} />
        <rect x={-120} y={BENCH + 60} width={W + 240} height={420} fill={C.bench} stroke={C.ink} strokeWidth={7} />
        <NC1cGear x={620} y={900} r={70} rot={f * 3} fill={NP.brass} />
        <NC1cGear x={750} y={880} r={46} rot={-f * 4.5 + 10} fill={NP.brassDark} />
        <NC1cGear x={1180} y={910} r={60} rot={f * 3.5} fill={NP.brass} />
        {/* 吊り台と巻き棒 */}
        {[-1, 1].map((sd) => <rect key={sd} x={NX + sd * 250 - 14} y={170} width={28} height={BENCH - 170} fill={C.bench} stroke={C.ink} strokeWidth={6} />)}
        <rect x={NX - 290} y={160} width={580} height={28} rx={6} fill={C.benchTop} stroke={C.ink} strokeWidth={6} />
        <Nafuda x={NX} y={NY} s={1.0} text="山田 花子" f={f} />
        {/* ① 布 (隠す) */}
        <g>
          <rect x={NX - 175} y={196} width={350} height={250 * m1} fill={C.cloth} stroke={C.ink} strokeWidth={6} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={NX - 130 + k * 86} y1={200} x2={NX - 130 + k * 86 + Math.sin(f / 6 + k) * 4} y2={196 + 250 * m1} stroke={C.clothDark} strokeWidth={6} />)}
          {m1 > 0.05 && [0, 1, 2, 3, 4].map((k) => <circle key={k} cx={NX - 140 + k * 70} cy={196 + 250 * m1} r={11} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />)}
          <rect x={NX - 220} y={180} width={440} height={30} rx={15} fill={C.beam} stroke={C.ink} strokeWidth={6} />
          <circle cx={NX - 220} cy={195} r={18} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        </g>
        <NC1cBang x={NX} y={500} t={seg(f, 12, 20)} />
        {/* ② 口に指を当てる人形 (ばね仕掛けの箱) */}
        <g>
          <rect x={DX - 100} y={BENCH - 100} width={200} height={100} rx={8} fill={C.beamLight} stroke={C.ink} strokeWidth={6} />
          <path d={`M ${DX - 100} ${BENCH - 100} L ${DX + 100} ${BENCH - 100} L ${DX + 100 - 20} ${BENCH - 100 - 40 * m2} Z`} fill={C.beam} stroke={C.ink} strokeWidth={4} opacity={m2 > 0.02 ? 1 : 0} />
          <path d={Array.from({ length: 7 }, (_, k) => `${k ? "L" : "M"} ${DX + (k % 2 ? 18 : -18)} ${BENCH - 100 - (springLen * k) / 6}`).join(" ")} fill="none" stroke={KRP.grayDark} strokeWidth={6} />
          {m2 > 0.02 && (
            <g>
              <Person x={DX} y={BENCH - 100 - springLen} s={0.7} f={f} face="normal" cloth={KRP.red} clothDark="#9A2E22" hair="cap" still />
              {/* 口に当てた指 */}
              <path d={`M ${DX + 47} ${BENCH - 100 - springLen - 140 * 0.7} Q ${DX + 50} ${BENCH - 100 - springLen - 95 * 0.7} ${DX + 12} ${BENCH - 100 - springLen - 150 * 0.7}`}
                fill="none" stroke={C.ink} strokeWidth={19} strokeLinecap="round" />
              <path d={`M ${DX + 47} ${BENCH - 100 - springLen - 140 * 0.7} Q ${DX + 50} ${BENCH - 100 - springLen - 95 * 0.7} ${DX + 12} ${BENCH - 100 - springLen - 150 * 0.7}`}
                fill="none" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
              <circle cx={DX + 8} cy={BENCH - 100 - springLen - 150 * 0.7} r={8} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              <rect x={DX - 3} y={BENCH - 100 - springLen - 200 * 0.7} width={7} height={34} rx={3} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
</g>
          )}
        </g>
        <NC1cBang x={DX} y={BENCH - 260} t={seg(f, 38, 46)} />
        {/* ③ 「悪い名前」の盾 (蝶番で起き上がる) */}
        <g transform={`rotate(${(1 - m3) * 86} 1500 ${BENCH})`} opacity={seg(f, 58, 61)}>
          <path d={`M 1380 ${BENCH - 330} L 1620 ${BENCH - 330} L 1620 ${BENCH - 140} Q 1620 ${BENCH - 40} 1500 ${BENCH - 10} Q 1380 ${BENCH - 40} 1380 ${BENCH - 140} Z`}
            fill={C.shield} stroke={C.ink} strokeWidth={7} />
          <path d={`M 1400 ${BENCH - 310} L 1600 ${BENCH - 310} L 1600 ${BENCH - 146} Q 1600 ${BENCH - 60} 1500 ${BENCH - 34} Q 1400 ${BENCH - 60} 1400 ${BENCH - 146} Z`}
            fill="none" stroke={C.shieldDark} strokeWidth={5} />
          {[[1400, -312], [1600, -312], [1400, -150], [1600, -150]].map(([rx, ry], i) => <circle key={i} cx={rx} cy={BENCH + ry} r={8} fill={C.shieldDark} stroke={C.ink} strokeWidth={3} />)}
          <rect x={1410} y={BENCH - 250} width={180} height={64} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <text x={1500} y={BENCH - 205} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.red}>悪い名前</text>
        </g>
        <rect x={1460} y={BENCH - 14} width={80} height={20} rx={6} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
        <NC1cBang x={1500} y={BENCH - 200} t={seg(f, 68, 76)} />
        {/* 番号札 */}
        <TagPlate x={NX} y={770} text="①隠す" size={40} t={seg(f, 4, 12)} />
        <TagPlate x={DX} y={770} text="②呼ばない" size={40} t={seg(f, 32, 40)} />
        <TagPlate x={1500} y={770} text="③わざと悪い名前" size={40} t={seg(f, 62, 70)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #75 名前は、呼ぶ人と呼ばれる人を結ぶ、糸でした。
// 格: 山 / seed 4075
// 絵: ★**1本目の糸が結ばれる (リキャップ①)**。作業台の左に、ナレーター役の Person が立って口に手を当てて呼ぶ。名札の左の結び目 (mimi) から**朱の糸** (`Ito kind="mimi"`) が f6〜30 で伸び、Person の**耳**に結ばれる。名札の字は「山田 花子」
// どこ: 名札の作業場 (朝の窓の光・糸巻きの棚・作業台と吊り台)。#75〜#77 は同じ場所・同じ時間の続き
// 演出: 台の左に立った人が、口に手を当てて名札に「おーい」と呼ぶ。名札の左の結び目から朱の糸がするすると伸びて、その人の耳にきゅっと結ばれる。結ばれた瞬間に名札がその人の方へ傾く
// 動き: カメラが右 (名札) から左 (人) へ糸を追ってパン / f0〜24 呼び声の波 / f6〜30 糸が伸びる / f30〜36 耳もとで蝶結び+きらめき / 名札がかすかに揺れる
const NC1cBow2: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M 0 0 Q ${sd * 34} -26 ${sd * 30} 6 Q ${sd * 16} 14 0 0 Z`} fill={NP.mimi} stroke={C.ink} strokeWidth={4} />
      ))}
      <path d="M -2 2 L -14 34 M 2 2 L 16 32" stroke={NP.mimi} strokeWidth={7} strokeLinecap="round" />
      <circle cx={0} cy={0} r={8} fill={NP.mimiDark} stroke={C.ink} strokeWidth={3} />
    </g>
  );
};
const nc1cKnot = () => nafudaKnot("mimi", NC1C_NAFUDA.x, NC1C_NAFUDA.y, NC1C_NAFUDA.s);
// Ito と同じ曲線の上の点 (音符を糸に乗せるため)
const nc1cOnIto = (u: number, f: number, sag: number, tension = 0): [number, number] => {
  const [x1, y1] = nc1cKnot();
  const [x2, y2] = NC1C_EAR;
  const tn = clamp01(tension);
  const quiver = tn > 0 ? Math.sin(f * 1.7) * 3 * tn : 0;
  const sg = sag * (1 - tn) + Math.sin(f / 14) * 6 * (1 - tn) + quiver;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sg;
  return [
    (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2,
    (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2,
  ];
};
const NC1C_SAG = 70;

const Nm075: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const tx = lerp(-40, 30, pan);
  const grow = easeOut(seg(f, 6, 30));
  const tied = seg(f, 30, 36);
  const tilt = -4 * easeOut(seg(f, 30, 40));
  return (
    <Frame f={f} seed={4075}>
      <g transform={`translate(${tx} 0) translate(900 500) scale(1.04) translate(-900 -500)`}>
        <NC1cWorkshop f={f} />
        <NC1cCaller f={f} face="joy" />
        {/* 呼び声の波 */}
        <g fill="none" stroke={NP.mimi} strokeWidth={7} strokeLinecap="round">
          {[0, 1, 2].map((k) => {
            const ph = ((f + k * 8) % 24) / 24;
            const op = f < 30 ? 1 - ph : (1 - ph) * 0.4;
            const r = 30 + ph * 90;
            const ox = NC1C_ME.x + 100 * NC1C_ME.s, oy = NC1C_ME.y - 150 * NC1C_ME.s;
            return <path key={k} d={`M ${ox + r * 0.5} ${oy - r * 0.6} Q ${ox + r} ${oy} ${ox + r * 0.5} ${oy + r * 0.6}`} opacity={op} />;
          })}
        </g>
        {/* 主役: 名札と、耳へ伸びる朱の糸 */}
        <Ito from={nc1cKnot()} to={NC1C_EAR} kind="mimi" t={grow} sag={NC1C_SAG} f={f} />
        <Nafuda x={NC1C_NAFUDA.x} y={NC1C_NAFUDA.y} s={NC1C_NAFUDA.s} text="山田 花子" f={f} rot={tilt} knots={{ mimi: tied * 0.6 }} />
        <NC1cBow2 x={NC1C_EAR[0] + 12} y={NC1C_EAR[1] - 30} t={tied} />
        {/* 結ばれた瞬間のきらめき */}
        {tied > 0 && (
          <g opacity={1 - seg(f, 36, 42) * 0.5}>
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const an = (k / 6) * Math.PI * 2 + 0.3;
              const r = 40 + tied * 34;
              return <line key={k} x1={NC1C_EAR[0] + Math.cos(an) * r} y1={NC1C_EAR[1] + Math.sin(an) * r} x2={NC1C_EAR[0] + Math.cos(an) * (r + 26)} y2={NC1C_EAR[1] + Math.sin(an) * (r + 26)}
                stroke={NP.glow} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
      </g>
    </Frame>
  );
};

// どこ: #75 と同じ作業場・同じ時間の続き。カメラは糸に寄る
// 演出: 結ばれた耳の糸と結び目が金色に光って脈打つ。糸の上を小さな音符が行き来する (呼ぶ→呼ばれる)。右上に3本の糸の凡例が出て、耳の糸だけが塗られ、帳簿・信用は点線の空き札
// 動き: カメラが糸の真ん中へゆっくり寄る / 光が脈打つ / 音符が往復 / f8〜18 凡例が出る / 人がにこにこ揺れる
const Nm076: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1.04, 1.12, easeInOut(seg(f, 0, 42)));
  const pulse = 0.75 + 0.25 * Math.sin(f / 5);
  const leg = pop(seg(f, 8, 18));
  const glowD = Array.from({ length: 25 }, (_, i) => {
    const [px, py] = nc1cOnIto(i / 24, f, NC1C_SAG);
    return `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");
  return (
    <Frame f={f} seed={4076}>
      <g transform={`translate(860 520) scale(${sc}) translate(-860 -520)`}>
        <NC1cWorkshop f={f} />
        <NC1cCaller f={f} face="smile" call={false} />
        {/* 糸の光 */}
        <path d={glowD} stroke={NP.glow} strokeWidth={40} opacity={0.35 * pulse} fill="none" strokeLinecap="round" />
        <path d={glowD} stroke={NP.glowCore} strokeWidth={20} opacity={0.5 * pulse} fill="none" strokeLinecap="round" />
        <Ito from={nc1cKnot()} to={NC1C_EAR} kind="mimi" t={1} sag={NC1C_SAG} f={f} />
        <Nafuda x={NC1C_NAFUDA.x} y={NC1C_NAFUDA.y} s={NC1C_NAFUDA.s} text="山田 花子" f={f} rot={-4} knots={{ mimi: pulse }} />
        <NC1cBow2 x={NC1C_EAR[0] + 12} y={NC1C_EAR[1] - 30} t={1} />
        <circle cx={NC1C_EAR[0]} cy={NC1C_EAR[1]} r={36} fill={NP.glow} opacity={0.3 * pulse} />
        {/* 糸の上を行き来する音符 */}
        {[0, 1].map((k) => {
          const u0 = ((f / 46 + k * 0.5) % 1);
          const u = k === 0 ? u0 : 1 - u0;
          const [px, py] = nc1cOnIto(0.08 + u * 0.84, f, NC1C_SAG);
          return (
            <g key={k} transform={`translate(${px} ${py - 46}) rotate(${Math.sin(f / 4 + k) * 10})`}>
              <circle cx={0} cy={0} r={34} fill={KRP.white} stroke={C.ink} strokeWidth={4} opacity={0.9} />
              <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={k === 0 ? NP.mimi : NP.mimiDark}>{k === 0 ? "♪" : "♫"}</text>
            </g>
          );
        })}
      </g>
      {/* 凡例 (カメラの外・右上に固定) */}
      <g transform={`translate(1600 150) scale(${leg}) translate(-1600 -150)`}>
        <rect x={1478} y={90} width={262} height={220} rx={18} fill={KRP.white} opacity={0.85} stroke={C.ink} strokeWidth={4} />
        <ItoLegend x={1494} y={140} s={0.98} lit={{ mimi: 1 }} />
      </g>
    </Frame>
  );
};

// どこ: #76 と同じ作業場・同じ画面。部屋が陰る
// 演出: 上から大きなハサミの影が、結ばれた耳の糸の真上へ下りてくる (まだ切らない)。名札は不安げに震え、糸がぴんと張る。呼んだ人も不安顔。「？」が浮かぶ
// 動き: f0〜14 部屋が暗くなる / f4〜34 ハサミの影が下りる (刃がゆっくり開閉) / f16〜30 糸がぴんと張る / 名札が小刻みに揺れる / f30〜40 「？」
const NC1cScissorShadow: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => (
  <g transform={`translate(${x} ${y})`} fill={C.shadow}>
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`rotate(${-sd * (10 + open * 8)})`}>
        {/* 刃 (下向き) */}
        <path d={`M ${-sd * 14} -20 Q ${sd * 40} 0 ${sd * 30} 40 L ${sd * 4} 190 Q ${-sd * 6} 60 ${-sd * 14} -20 Z`} />
        {/* 持ち手 (上) */}
        <path d={`M 0 -10 L ${-sd * 26} -90`} stroke={C.shadow} strokeWidth={30} strokeLinecap="round" />
        <ellipse cx={-sd * 40} cy={-150} rx={48} ry={64} fill="none" stroke={C.shadow} strokeWidth={28} />
      </g>
    ))}
    <circle cx={0} cy={0} r={18} />
  </g>
);

const Nm077: React.FC<{ f: number }> = ({ f }) => {
  const dim = seg(f, 0, 14);
  const down = easeInOut(seg(f, 4, 34));
  const tens = seg(f, 16, 30);
  const worry = seg(f, 10, 20);
  const shake = Math.sin(f * 1.6) * 2.6 * worry;
  const [mx] = nc1cOnIto(0.5, f, NC1C_SAG, tens);
  const sy = lerp(-260, 290, down);
  return (
    <Frame f={f} seed={4077} dark>
      <g transform="translate(860 520) scale(1.12) translate(-860 -520)">
        <NC1cWorkshop f={f} dim={dim} />
        <NC1cCaller f={f} face="worried" call={false} />
        {/* 影が落ちる床の暗がり */}
        <Ito from={nc1cKnot()} to={NC1C_EAR} kind="mimi" t={1} sag={NC1C_SAG} tension={tens} f={f} />
        <Nafuda x={NC1C_NAFUDA.x + shake} y={NC1C_NAFUDA.y} s={NC1C_NAFUDA.s} text="山田 花子" f={f} rot={-4 + shake} knots={{ mimi: 0.6 }} />
        <NC1cBow2 x={NC1C_EAR[0] + 12} y={NC1C_EAR[1] - 30} t={1} />
        {/* 人の汗と、名札の震え線 */}
        {worry > 0 && (
          <g opacity={worry}>
            <path d={`M ${NC1C_ME.x - 90} ${NC1C_ME.y - 300} q -12 20 0 30 q 12 -10 0 -30 Z`} fill={KRP.blue} stroke={C.ink} strokeWidth={3.5} />
            <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round">
              {[0, 1, 2].map((k) => <line key={k} x1={NC1C_NAFUDA.x + 250 + k * 4} y1={NC1C_NAFUDA.y - 60 + k * 50} x2={NC1C_NAFUDA.x + 280 + k * 6} y2={NC1C_NAFUDA.y - 70 + k * 50} />)}
            </g>
          </g>
        )}
        {/* ハサミの影 (切りはしない) */}
        <g opacity={0.6}>
          <NC1cScissorShadow x={mx} y={sy} open={0.5 + 0.5 * Math.sin(f / 10)} />
        </g>
        <QMark x={NC1C_NAFUDA.x + 380} y={560} s={1.1} f={f} t={seg(f, 30, 40)} color={KRP.yellow} />
      </g>
      <g opacity={1 - dim * 0.35}>
        <rect x={1478} y={90} width={262} height={220} rx={18} fill={KRP.white} opacity={0.85} stroke={C.ink} strokeWidth={4} />
        <ItoLegend x={1494} y={140} s={0.98} lit={{ mimi: 1 }} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_070: (f) => <Nm070 f={f} />,
  nm_071: (f) => <Nm071 f={f} />,
  nm_072: (f) => <Nm072 f={f} />,
  nm_073: (f) => <Nm073 f={f} />,
  nm_074: (f) => <Nm074 f={f} />,
  nm_075: (f) => <Nm075 f={f} />,
  nm_076: (f) => <Nm076 f={f} />,
  nm_077: (f) => <Nm077 f={f} />,
};

export const NM_C1C_MOTIFS: string[] = [
  "nm_070", // #70
  "nm_071", // #71
  "nm_072", // #72
  "nm_073", // #73
  "nm_074", // #74
  "nm_075", // #75
  "nm_076", // #76
  "nm_077", // #77
];

export const namaeC1cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
