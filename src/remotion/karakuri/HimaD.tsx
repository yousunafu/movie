// 人は、なぜ暇をつぶすのか: 文#59〜#70 (12文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./HimaShared";
import {
  HP, Monosashi, monoSlot, Sousa, Sagyozukue, YoruNoHeya, YoruNoHeyaFront, EkiHome, EkiBenchFront,
  KyukeiBoard, ShockRoom, Sumaho, YasumiCalendar,
} from "./HimaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/HP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  tsume: "#2B2A2E", tsumeDark: "#1C1B1F",
  stone: "#D6CDBB", stoneDark: "#AFA591", stoneLine: "#BDB39F",
  tatami: "#CFC487", tatamiLine: "#A99E5E", tatamiEdge: "#4A5A3A",
  shoji: "#F6F0DE", wood: "#9A6A3E", woodDark: "#6E4A2A", woodLight: "#C49A64",
  plaster: "#E9DFC8", plasterShade: "#D6C9AC",
  board: "#2F4A3C", boardDark: "#243A2F", boardFrame: "#8A5E36",
  chalk: "#F3F0E6", chalkYellow: "#F5E27A", chalkPink: "#F2A6A0",
  sky: "#BFD9E8", skyLight: "#E3EFF5",
  hibachi: "#6E5A4A", ash: "#C9C0B4", ember: "#E8603A",
  kimonoA: "#C96A4A", kimonoB: "#5D86BC", kimonoC: "#D9A94A", kimonoD: "#7DA36A",
  hakama: "#4A3A5E", hakamaB: "#5A4632",
  pigeon: "#9AA0A8", pigeonDark: "#6E747C", gas: "#FFE9A8",
  brick: "#B8644A", brickDark: "#8E4A36", roof: "#5A5560",
  steam: "#FFFFFF", tea: "#7A9A4A",
} as const;

// ---- 明治の役人 (黒の詰襟の洋服・金ボタン・口ひげ) ----
const HmDYakunin: React.FC<{
  x: number; y: number; s?: number; f: number;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  lean?: number; phase?: number; glasses?: boolean; hat?: boolean; gaze?: [number, number]; pointDir?: 1 | -1;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", lean = 0, phase = 0, glasses, hat, gaze, pointDir }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase} glasses={glasses}
        gaze={gaze} pointDir={pointDir} cloth={C.tsume} clothDark={C.tsumeDark} hair="cap" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <rect x={-30} y={-170} width={60} height={18} rx={6} fill={C.tsume} stroke={KRP.ink} strokeWidth={4} />
        <line x1={-24} y1={-161} x2={24} y2={-161} stroke={KRP.brass} strokeWidth={2.5} opacity={0.8} />
        {pose !== "armsFolded" && pose !== "hold" && [-142, -118, -94, -70].map((by) => (
          <circle key={by} cx={0} cy={by} r={5.5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
        ))}
        <path d="M -30 -197 Q -16 -210 0 -200 Q 16 -210 30 -197 Q 16 -194 0 -196 Q -16 -194 -30 -197 Z" fill={KRP.ink} />
        {hat && (
          <g>
            <path d="M -58 -272 Q -56 -322 0 -326 Q 56 -322 58 -272 Z" fill={C.tsume} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -60 -272 L 62 -272 Q 86 -266 92 -256 L -50 -260 Z" fill={C.tsumeDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-56} y={-288} width={112} height={10} fill={KRP.brass} opacity={0.85} />
          </g>
        )}
      </g>
    </g>
  );
};

// ---- 明治の学校の子ども (着物にはかま) ----
const HmDKodomo: React.FC<{
  x: number; y: number; s?: number; f: number;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  lean?: number; phase?: number; kimono?: string; hakama?: string; girl?: boolean;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", lean = 0, phase = 0, kimono = C.kimonoA, hakama = C.hakama, girl }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase}
        cloth={kimono} clothDark={hakama} hair="cap" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* はかま */}
        {pose !== "sit" && (
          <g>
            <path d="M -52 -96 L 52 -96 L 60 -14 L -60 -14 Z" fill={hakama} stroke={KRP.ink} strokeWidth={4.5} />
            {[-30, -10, 10, 30].map((px) => <line key={px} x1={px} y1={-90} x2={px * 1.15} y2={-18} stroke={KRP.ink} strokeWidth={2.5} opacity={0.45} />)}
            <rect x={-54} y={-102} width={108} height={12} rx={4} fill={hakama} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        )}
        {/* 着物のえり */}
        <path d="M -24 -160 L 0 -118 L 24 -160" fill="none" stroke={KRP.white} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -24 -160 L 0 -118 L 24 -160" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
        {/* 女の子は後ろで結んだ髪とリボン */}
        {girl && (
          <g>
            <path d="M 46 -270 Q 82 -246 70 -196 Q 60 -214 50 -236 Z" fill={KRP.ink} />
            <path d="M 40 -288 l 26 -16 l 4 26 Z M 40 -288 l 30 8 l -18 20 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
      </g>
    </g>
  );
};

// ---- 休みの赤い積み木 (#62・#68・#69 で同じ見た目) ----
const HmDBlock: React.FC<{ x: number; y: number; z?: number; half?: boolean; o?: number }> = ({ x, y, z = 46, half, o = 1 }) => {
  const h = half ? z / 2 : z;
  const d = z * 0.32;
  return (
    <g opacity={o}>
      <path d={`M ${x} ${y - h} l ${d} ${-d} l ${z} 0 l ${-d} ${d} Z`} fill={HP.restSoft} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={`M ${x + z} ${y - h} l ${d} ${-d} l 0 ${h} l ${-d} ${d} Z`} fill="#B8473A" stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <rect x={x} y={y - h} width={z} height={h} fill={HP.rest} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={x + 5} y={y - h + 5} width={z * 0.3} height={4} rx={2} fill={KRP.white} opacity={0.55} />
    </g>
  );
};
// ピラミッド型に積んだ山。rows = 下の段からの個数。n 個目まで出す (p で最後の1個が落ちてくる)
const pileCells = (rows: number[], z: number): [number, number][] => {
  const out: [number, number][] = [];
  rows.forEach((cnt, r) => {
    for (let i = 0; i < cnt; i++) out.push([(-cnt / 2 + i) * z + r * 0, -r * z]);
  });
  return out;
};

// ---- 真鍮の天秤 (#66・#68・#69 で同じ物) ----
const HmDTenbin: React.FC<{
  x: number; y: number; s?: number; tilt: number;
  left?: React.ReactNode; right?: React.ReactNode;
}> = ({ x, y, s = 1, tilt, left, right }) => {
  const L = 300, post = 300, str = 150;
  const a = (tilt * Math.PI) / 180;
  const ends: [number, number][] = [[-L * Math.cos(a), -post - L * Math.sin(a)], [L * Math.cos(a), -post + L * Math.sin(a)]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={120} ry={26} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-90} y={-30} width={180} height={30} rx={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-14} y={-post} width={28} height={post - 26} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-4} y1={-post + 20} x2={-4} y2={-40} stroke={KRP.white} strokeWidth={4} opacity={0.4} />
      {/* 針 */}
      <path d={`M -8 ${-post} L 0 ${-post - 96} L 8 ${-post} Z`} transform={`rotate(${tilt} 0 ${-post})`}
        fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      <path d={`M -60 ${-post - 70} A 92 92 0 0 1 60 ${-post - 70}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
      <line x1={0} y1={-post - 100} x2={0} y2={-post - 84} stroke={KRP.ink} strokeWidth={4} />
      {/* 竿 */}
      <g transform={`translate(0 ${-post}) rotate(${tilt})`}>
        <rect x={-L - 10} y={-10} width={2 * L + 20} height={20} rx={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={18} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {ends.map(([ex, ey], i) => (
        <g key={i}>
          <line x1={ex} y1={ey} x2={ex - 110} y2={ey + str} stroke={KRP.ink} strokeWidth={4} />
          <line x1={ex} y1={ey} x2={ex + 110} y2={ey + str} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={ex} cy={ey} r={9} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${ex - 140} ${ey + str} L ${ex + 140} ${ey + str} Q ${ex + 120} ${ey + str + 40} ${ex} ${ey + str + 42} Q ${ex - 120} ${ey + str + 40} ${ex - 140} ${ey + str} Z`}
            fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`translate(${ex} ${ey + str})`}>{i === 0 ? left : right}</g>
        </g>
      ))}
    </g>
  );
};

// 舞い落ちる紙の落ち方
const easeInOutFall = (p: number) => p * (0.6 + 0.4 * p);

// ---- 木の脚立 (x=中心, y=床, h=踏み台の高さ。踏み台の上面 = y - h + 20) ----
const HmDKyatatsu: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <line x1={x + sd * 100} y1={y} x2={x + sd * 30} y2={y - h + 20} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
        <line x1={x + sd * 100} y1={y} x2={x + sd * 30} y2={y - h + 20} stroke={C.woodLight} strokeWidth={12} strokeLinecap="round" />
      </g>
    ))}
    {[0.25, 0.5, 0.75].map((q) => {
      const yy = y - (h - 20) * q;
      const w = 100 - 70 * q;
      return <rect key={q} x={x - w} y={yy - 7} width={w * 2} height={14} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />;
    })}
    <rect x={x - 52} y={y - h + 14} width={104} height={20} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ---- 明治の教室 (#66〜#69 は同じ教室の続き)。黒板の内側 x 300〜1620, y 140〜600 ----
const HmDKyoshitsu: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    <rect x={-60} y={-60} width={2040} height={1200} fill={C.plaster} />
    {/* 柱と長押 */}
    {[-20, 1880].map((px) => <rect key={px} x={px} y={-60} width={60} height={1200} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />)}
    <rect x={-60} y={40} width={2040} height={24} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
    {/* 腰板 */}
    <rect x={-60} y={660} width={2040} height={180} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 92} y1={664} x2={i * 92} y2={836} stroke={C.wood} strokeWidth={4} />)}
    {/* 床 (板張り) */}
    <rect x={-60} y={840} width={2040} height={300} fill={C.wood} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={870 + i * 44} x2={1980} y2={870 + i * 44} stroke={C.woodDark} strokeWidth={4} opacity={0.6} />)}
    {/* 黒板 */}
    <rect x={270} y={110} width={1380} height={520} rx={8} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={8} />
    <rect x={300} y={140} width={1320} height={460} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
    {/* 消し跡のむら */}
    {[[520, 260, 180], [1200, 480, 220], [880, 200, 140]].map(([ex, ey, r], i) => (
      <ellipse key={i} cx={ex} cy={ey} rx={r} ry={r * 0.35} fill={C.chalk} opacity={0.05} />
    ))}
    {/* チョーク受けとチョーク・黒板消し */}
    <rect x={290} y={622} width={1340} height={22} rx={4} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={1380} y={604} width={110} height={26} rx={6} fill="#4A4A6A" stroke={KRP.ink} strokeWidth={4} />
    <rect x={1380} y={618} width={110} height={12} fill={KRP.white} opacity={0.6} />
    {[[400, C.chalk], [440, C.chalkYellow], [470, C.chalkPink]].map(([cx, c], i) => (
      <rect key={i} x={cx as number} y={612} width={30} height={10} rx={4} fill={c as string} stroke={KRP.ink} strokeWidth={2} />
    ))}
    {/* 左上の掛け時計 (明治の教室の記号) */}
    <g transform="translate(130 230)">
      <rect x={-50} y={-70} width={100} height={200} rx={14} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={-20} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <line x1={0} y1={-20} x2={0} y2={-48} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      <line x1={0} y1={-20} x2={18} y2={-14} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      <g transform={`rotate(${Math.sin(f / 8) * 14} 0 30)`}>
        <line x1={0} y1={30} x2={0} y2={100} stroke={HP.brassDark} strokeWidth={3} />
        <circle cx={0} cy={104} r={12} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </g>
    {children}
  </g>
);
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void HP; void Monosashi; void monoSlot; void Sousa; void Sagyozukue; void YoruNoHeya; void YoruNoHeyaFront;
void EkiHome; void EkiBenchFront; void KyukeiBoard; void ShockRoom; void Sumaho; void YasumiCalendar;
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

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #59 第3章、日曜休みで、休みが減った。
// 格: 山 / seed 5059
// 絵: 章扉。どこ: 明治の役所の玄関 (洋風の石造り・ガス灯・掲示板)。演出: 掲示板に貼られた暦の日曜の列が赤く光る。玄関の階段で、詰襟の役人が指を折って数えながら首をかしげる (face="worried")。ChapterDoor num=3 title="日曜休みで、休みが減った。" を右に。動き: ガス灯のゆらぎ / 指折り / 鳩
// どこ: 明治の役所の玄関。石造りの洋館の正面 (柱・アーチの扉・石段)・左に掲示板・ガス灯・屋根の鳩
// 演出: 掲示板の暦の日曜の列が赤く光る。石段の役人が指を折って数え、首をかしげる。右に章の題字
// 動き: カメラがゆっくり左へ寄る / ガス灯のゆらぎ / 指折り / 鳩が首を振って歩く
const Hm059: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const glow = seg(f, 12, 26);
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.05 * cam;
  const flick = 0.8 + 0.2 * Math.sin(f / 3) + 0.06 * Math.sin(f * 2.3);
  const fold = Math.min(5, Math.floor(seg(f, 6, 40) * 6)); // 折った指の数
  const peck = Math.sin(f / 5) > 0.6 ? 8 : 0;
  return (
    <Frame f={f} seed={5059} over={<>
      <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
        background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
      <ChapterDoor num={3} title="日曜休みで、休みが減った。" t={door} left={1000} top={560} />
    </>}>
      <g transform={`translate(${480 * (1 - sc)} ${420 * (1 - sc)}) scale(${sc})`}>
        {/* 空 */}
        <rect x={-60} y={-60} width={2040} height={300} fill={C.sky} />
        <ellipse cx={1500} cy={90} rx={160} ry={40} fill={C.skyLight} />
        {/* 石造りの正面 */}
        <rect x={-60} y={120} width={2040} height={720} fill={C.stone} />
        {Array.from({ length: 12 }, (_, r) => (
          <g key={r}>
            <line x1={-60} y1={180 + r * 56} x2={1980} y2={180 + r * 56} stroke={C.stoneLine} strokeWidth={4} />
            {Array.from({ length: 14 }, (_, c) => (
              <line key={c} x1={c * 160 + (r % 2) * 80} y1={180 + r * 56} x2={c * 160 + (r % 2) * 80} y2={236 + r * 56} stroke={C.stoneLine} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 軒の蛇腹と破風 */}
        <rect x={-60} y={104} width={2040} height={40} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 380 104 L 700 -10 L 1020 104 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={700} cy={56} r={26} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 鳩 (屋根の上) */}
        {[[560, 54, 1], [840, 52, -1]].map(([px, py, dir], i) => (
          <g key={i} transform={`translate(${px + (i ? -1 : 1) * (f * 0.6 % 30)} ${py}) scale(${dir} 1)`}>
            <ellipse cx={0} cy={-18} rx={30} ry={18} fill={C.pigeon} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -26 -22 L -50 -30 L -44 -12 Z" fill={C.pigeonDark} stroke={KRP.ink} strokeWidth={3} />
            <g transform={`translate(0 ${i ? 0 : peck})`}>
              <circle cx={26} cy={-38} r={13} fill={C.pigeon} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={30} cy={-40} r={2.5} fill={KRP.ink} />
              <path d="M 38 -38 l 9 3 l -9 3 Z" fill={KRP.orange} />
            </g>
            <line x1={-4} y1={0} x2={-4} y2={8} stroke={KRP.orange} strokeWidth={3} />
            <line x1={6} y1={0} x2={6} y2={8} stroke={KRP.orange} strokeWidth={3} />
          </g>
        ))}
        {/* 柱 (4本) */}
        {[430, 560, 840, 970].map((px) => (
          <g key={px}>
            <rect x={px - 34} y={150} width={68} height={560} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {[-14, 0, 14].map((k) => <line key={k} x1={px + k} y1={170} x2={px + k} y2={690} stroke={C.stoneLine} strokeWidth={3} />)}
            <rect x={px - 46} y={140} width={92} height={24} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={px - 46} y={700} width={92} height={22} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* アーチの扉 (開いている) */}
        <path d="M 610 710 L 610 330 Q 700 240 790 330 L 790 710 Z" fill="#E6D3A6" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 610 710 L 610 330 L 650 318 L 650 700 Z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 790 710 L 790 330 L 750 318 L 750 700 Z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 640 330 Q 700 270 760 330" fill="none" stroke={C.gas} strokeWidth={5} opacity={0.6} />
        {/* 玄関の札 (役所) */}
        <rect x={866} y={300} width={60} height={200} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <text x={896} y={350} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>役</text>
        <text x={896} y={410} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>所</text>
        {/* 掲示板 (左) */}
        <g>
          <rect x={60} y={240} width={300} height={360} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 40 244 L 210 196 L 380 244 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
          {[96, 324].map((px) => <rect key={px} x={px - 10} y={600} width={20} height={180} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 暦 (日曜の列が光る) */}
          <rect x={82} y={262} width={256} height={316} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={82} y={262} width={256} height={40} fill={HP.rest} stroke={KRP.ink} strokeWidth={4} />
          <text x={210} y={293} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>暦</text>
          {glow > 0 && <rect x={86} y={306} width={36} height={268} rx={6} fill={HP.spark} opacity={glow * (0.35 + 0.15 * Math.sin(f / 4))} />}
          {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
            <rect key={`${r}${c}`} x={90 + c * 35} y={316 + r * 50} width={28} height={40} rx={4}
              fill={c === 0 && glow > 0 ? HP.rest : KRP.cream} opacity={c === 0 ? 0.3 + 0.7 * glow : 1}
              stroke={c === 0 ? HP.rest : KRP.gray} strokeWidth={2.5} />
          )))}
          {/* 掲示の紙 (端に重ねて貼った別の紙) */}
          <rect x={300} y={480} width={50} height={80} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} transform="rotate(8 325 520)" />
        </g>
        {/* ガス灯 */}
        <g>
          <rect x={1110} y={260} width={18} height={540} fill={C.tsume} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1080 260 L 1158 260 L 1146 180 L 1092 180 Z" fill={C.gas} opacity={flick} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1080 180 L 1119 140 L 1158 180 Z" fill={C.tsume} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1119} cy={222} r={60 * flick} fill={C.gas} opacity={0.25} />
          <rect x={1100} y={790} width={38} height={20} fill={C.tsume} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 石段 */}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={360 - k * 60} y={710 + k * 44} width={680 + k * 120} height={46} fill={k % 2 ? C.stoneDark : C.stone} stroke={KRP.ink} strokeWidth={6} />
        ))}
        <rect x={-60} y={842} width={2040} height={300} fill="#BDB09A" />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
          <rect key={`p${r}${c}`} x={-60 + c * 180 + (r % 2) * 90} y={856 + r * 60} width={170} height={52} rx={10}
            fill="none" stroke={C.stoneDark} strokeWidth={4} opacity={0.7} />
        )))}
        {/* 石段の鳩 */}
        <g transform={`translate(${280 + Math.sin(f / 9) * 10} 842)`}>
          <ellipse cx={0} cy={-18} rx={30} ry={18} fill={C.pigeon} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -26 -22 L -50 -30 L -44 -12 Z" fill={C.pigeonDark} stroke={KRP.ink} strokeWidth={3} />
          <g transform={`translate(0 ${peck})`}>
            <circle cx={26} cy={-38} r={13} fill={C.pigeon} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={30} cy={-40} r={2.5} fill={KRP.ink} />
            <path d="M 38 -38 l 9 3 l -9 3 Z" fill={KRP.orange} />
          </g>
        </g>
        {/* 役人 (石段で指折り・首をかしげる) */}
        <HmDYakunin x={700} y={800} s={1.0} f={f} face="worried" pose="hold" lean={-7} phase={2} gaze={[-5, -3]} />
        {/* 指折りの手 (大きめ) */}
        <g transform={`translate(${700 - 2} ${686}) rotate(-7)`}>
          <circle cx={0} cy={0} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {[0, 1, 2, 3, 4].map((k) => {
            const folded = k < fold;
            const ang = -70 + k * 30;
            const len = folded ? 10 : 26;
            const rad = (ang * Math.PI) / 180;
            return <line key={k} x1={Math.sin(rad) * 16} y1={-Math.cos(rad) * 16} x2={Math.sin(rad) * (16 + len)} y2={-Math.cos(rad) * (16 + len)}
              stroke={KRP.ink} strokeWidth={folded ? 9 : 10} strokeLinecap="round" />;
          })}
          {[0, 1, 2, 3, 4].map((k) => {
            const folded = k < fold;
            const ang = -70 + k * 30;
            const len = folded ? 10 : 26;
            const rad = (ang * Math.PI) / 180;
            return <line key={`w${k}`} x1={Math.sin(rad) * 16} y1={-Math.cos(rad) * 16} x2={Math.sin(rad) * (16 + len)} y2={-Math.cos(rad) * (16 + len)}
              stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />;
          })}
        </g>
        <QMark x={790} y={500} s={0.9} f={f} t={seg(f, 18, 30)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #60 明治のはじめ、役所の休みは「一六日」でした。
// 格: 山 / seed 5060
// 絵: どこ: 明治のはじめの役所の部屋 (和洋折衷: 畳に机と椅子・障子と洋燈)。演出: 壁の YasumiCalendar (title="明治のはじめ", weekHead=false, rest=[1,6,11,16,21,26], t を f で 0→1)。札「一六日」。役人たちが帳面を閉じて帰り支度。動き: 休みの日が順に赤く塗られる / 帳面が閉じられる / 洋燈のゆらぎ
// どこ: 明治のはじめの役所の部屋。畳の上に洋机と椅子・障子・天井から下がる洋燈・壁の暦
// 演出: 壁の暦の 1・6 のつく日が順に赤くなる。机の役人が帳面をぱたんと閉じ、もう1人は帽子をかぶって風呂敷包みを抱え帰り支度
// 動き: 休みの日が順に塗られる / 帳面が閉じる / 洋燈のゆらぎ / カメラがゆっくり右へパン
const Hm060: React.FC<{ f: number }> = ({ f }) => {
  const tCal = seg(f, 4, 32);
  const close = easeInOut(seg(f, 24, 34));
  const tag = seg(f, 30, 40);
  const pan = easeInOut(seg(f, 0, 42));
  const sway = Math.sin(f / 14) * 4;
  const flick = 0.85 + 0.15 * Math.sin(f / 3.2);
  return (
    <Frame f={f} seed={5060}>
      <g transform={`translate(${-30 * pan} 0) scale(1.03)`}>
        {/* 壁 (しっくい) と長押 */}
        <rect x={-60} y={-60} width={2100} height={760} fill={C.plaster} />
        <rect x={-60} y={60} width={2100} height={26} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {[-10, 1240, 1960].map((px) => <rect key={px} x={px} y={-60} width={50} height={760} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />)}
        {/* 障子 (左) */}
        <g>
          <rect x={60} y={110} width={380} height={590} fill={C.shoji} stroke={KRP.ink} strokeWidth={7} />
          {[1, 2, 3].map((k) => <line key={k} x1={60 + k * 95} y1={110} x2={60 + k * 95} y2={700} stroke={C.woodDark} strokeWidth={4} />)}
          {Array.from({ length: 7 }, (_, k) => <line key={k} x1={60} y1={110 + (k + 1) * 74} x2={440} y2={110 + (k + 1) * 74} stroke={C.woodDark} strokeWidth={4} />)}
          <rect x={60} y={110} width={380} height={590} fill="#FFE6A0" opacity={0.18} />
          {/* 障子に映る庭木の影 */}
          <path d="M 300 700 Q 290 520 340 420 Q 360 380 400 360" stroke={KRP.ink} strokeWidth={8} fill="none" opacity={0.12} />
          {[[360, 380], [400, 440], [320, 470]].map(([lx, ly], i) => <ellipse key={i} cx={lx} cy={ly} rx={40} ry={22} fill={KRP.ink} opacity={0.1} />)}
        </g>
        {/* 壁の暦 */}
        <YasumiCalendar x={790} y={360} s={0.9} title="明治のはじめ" startDow={3} weekHead={false}
          rest={[1, 6, 11, 16, 21, 26]} t={tCal} f={f} />
        <rect x={782} y={88} width={16} height={40} fill={C.woodDark} />
        {/* 右の壁: 書類棚 */}
        <g>
          <rect x={1330} y={150} width={520} height={550} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={1350} y={180 + r * 170} width={480} height={140} fill="#5A3C22" />
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={i} x={1360 + i * 52} y={200 + r * 170 + (i % 3) * 4} width={40} height={116 - (i % 3) * 4}
                  fill={[KRP.cream, "#E4D4A8", "#CDBB8E"][(i + r) % 3]} stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
          ))}
        </g>
        {/* 畳 */}
        <rect x={-60} y={700} width={2100} height={440} fill={C.tatami} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-60 + i * 70} y1={704} x2={-60 + i * 70} y2={1140} stroke={C.tatamiLine} strokeWidth={2} opacity={0.6} />)}
        {[700, 920].map((ty) => <rect key={ty} x={-60} y={ty} width={2100} height={14} fill={C.tatamiEdge} />)}
        <line x1={980} y1={714} x2={980} y2={920} stroke={C.tatamiEdge} strokeWidth={14} />
        {/* 洋燈 (天井から) */}
        <g transform={`rotate(${sway * 0.4} 1100 -60)`}>
          <line x1={1100} y1={-60} x2={1100} y2={120} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1100} cy={200} r={110 * flick} fill={C.gas} opacity={0.2} />
          <path d="M 1050 120 L 1150 120 L 1130 150 L 1070 150 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1076 150 Q 1060 200 1084 240 L 1116 240 Q 1140 200 1124 150 Z" fill={C.gas} opacity={flick} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1100 226 q -8 -14 0 -30 q 8 16 0 30" fill={KRP.orange} />
          <ellipse cx={1100} cy={252} rx={34} ry={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 洋机と椅子 */}
        <g>
          <rect x={1200} y={760} width={120} height={20} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1300} y={620} width={20} height={150} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {[1210, 1300].map((lx) => <rect key={lx} x={lx} y={776} width={14} height={110} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        <HmDYakunin x={1150} y={822} s={1.0} f={f} face={close > 0.9 ? "smile" : "normal"} pose="hold" phase={1} gaze={[4, 6]} />
        <g>
          <rect x={940} y={700} width={560} height={34} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
          <rect x={960} y={734} width={520} height={60} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1180} y={748} width={80} height={14} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          {[970, 1450].map((lx) => <rect key={lx} x={lx} y={794} width={22} height={120} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 硯と筆 */}
          <rect x={1340} y={680} width={90} height={24} rx={6} fill="#3A3A3E" stroke={KRP.ink} strokeWidth={4} />
          <line x1={1300} y1={690} x2={1380} y2={660} stroke={C.woodLight} strokeWidth={8} strokeLinecap="round" />
          {/* 帳面 (閉じていく)。背は x=1150 */}
          <rect x={1150} y={684} width={130} height={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1150} y={672} width={130} height={14} fill={C.kimonoB} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(1150 0) scale(${lerp(-1, 1, close)} 1) translate(-1150 0)`}>
            <rect x={1150} y={666 - close * 4} width={130} height={14} fill={close > 0.5 ? C.kimonoB : KRP.cream} stroke={KRP.ink} strokeWidth={4} />
            {close < 0.5 && [0, 1, 2].map((k) => <line key={k} x1={1162} y1={671} x2={1268} y2={671} stroke={KRP.gray} strokeWidth={2} />)}
          </g>
          {seg(f, 34, 40) > 0 && [0, 1, 2].map((k) => (
            <line key={k} x1={1215 + (k - 1) * 70} y1={652} x2={1215 + (k - 1) * 96} y2={626 - (k === 1 ? 8 : 0)}
              stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - 0.6 * seg(f, 38, 42)} />
          ))}
        </g>
        {/* 帰り支度の役人 (帽子をかぶり、風呂敷包みを抱える) */}
        <HmDYakunin x={560} y={900} s={1.02} f={f} face="joy" pose="hold" hat phase={4} lean={4} />
        <g transform={`translate(560 ${900 - 96}) rotate(4)`}>
          <path d="M -60 -6 Q -66 -56 0 -62 Q 66 -56 60 -6 Q 0 10 -60 -6 Z" fill="#7A5AA0" stroke={KRP.ink} strokeWidth={5} />
          {[-30, 0, 30].map((k) => <circle key={k} cx={k} cy={-34} r={5} fill={KRP.white} opacity={0.55} />)}
          <path d="M -14 -60 q 14 -24 28 0" fill="none" stroke="#5E4280" strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* 札 */}
        <TagPlate x={790} y={668} text="一六日" size={46} t={tag} color={HP.rest} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #61 1日、6日、11日、16日、21日、26日。1と6のつく日が、お休みです。
// 格: 図 / seed 5061
// 絵: どこ: #60 の暦の大写し (カメラ寄り)。演出: 赤い休みの日の上を、指さし棒が「1」「6」「11」「16」「21」「26」と順にとんとん叩いていく。各数字の「1」と「6」の部分だけが黄色く光る (1と6のつく日だと一目で分かる)。動き: 指さし棒が6回 (f4〜f40) / 数字の光
// どこ: #60 の壁の暦の大写し (しっくいの壁・柱・暦を吊る釘)。右から役人の黒い袖と竹の指さし棒
// 演出: 指さし棒が 1→6→11→16→21→26 と順にとんとん叩く。叩かれた日の数字の「1」と「6」だけが黄色く光る
// 動き: 指さし棒が6回 (f4〜f40) / 叩いた所の波紋 / 数字の光 / カメラがわずかに寄る
const Hm061: React.FC<{ f: number }> = ({ f }) => {
  const CX = 780, CY = 470, CS = 1.45;
  const T61: [number, number, number][] = [[1, 3, 0], [6, 1, 1], [11, 6, 1], [16, 4, 2], [21, 2, 3], [26, 0, 4]];
  const loc = (col: number, row: number): [number, number] => [-216 + 72 * col, -111 + 62 * row];
  const scr = (col: number, row: number): [number, number] => {
    const [lx, ly] = loc(col, row);
    return [CX + CS * lx, CY + CS * ly];
  };
  const tk = (k: number) => 6 + k * 6.4; // 叩く瞬間
  let tip = scr(T61[0][1], T61[0][2]);
  let hover = f < tk(0) ? 40 * (1 - seg(f, 0, tk(0))) : 0;
  T61.forEach(([, c, r], k) => {
    if (k === 0) return;
    const raw = seg(f, tk(k) - 4.4, tk(k));
    const p = easeInOut(raw);
    if (raw > 0) {
      const a = scr(T61[k - 1][1], T61[k - 1][2]), b = scr(c, r);
      tip = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
    }
    if (raw > 0 && raw < 1) hover = Math.sin(raw * Math.PI) * 40;
  });
  const back = seg(f, 39, 42) * 0.07;
  tip = [lerp(tip[0], 1330, back), lerp(tip[1], 1060, back)];
  const tipY = tip[1] - hover;
  const hand: [number, number] = [1330 + Math.sin(f / 7) * 4, 1060];
  const zoom = 1 + 0.04 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5061}>
      <g transform={`translate(${CX * (1 - zoom)} ${CY * (1 - zoom)}) scale(${zoom})`}>
        {/* しっくいの壁と柱 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.plaster} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(61, i) * 1920} cy={rnd(62, i) * 1080} r={3 + rnd(63, i) * 5} fill={C.plasterShade} opacity={0.5} />
        ))}
        <rect x={1500} y={-60} width={90} height={1200} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1530} y1={-60} x2={1530} y2={1140} stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
        <rect x={-60} y={-10} width={2040} height={34} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 吊りひも */}
        <path d={`M ${CX - 200} ${CY - 380} L ${CX} 40 L ${CX + 200} ${CY - 380}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={CX} cy={40} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <YasumiCalendar x={CX} y={CY} s={CS} title="明治のはじめ" startDow={3} weekHead={false}
          rest={[1, 6, 11, 16, 21, 26]} t={1} f={f} />
        {/* 叩いた日の「1」「6」が光る */}
        <g transform={`translate(${CX} ${CY}) scale(${CS})`}>
          {T61.map(([d, c, r], k) => {
            const on = seg(f, tk(k), tk(k) + 3);
            if (on <= 0) return null;
            const [lx, ly] = loc(c, r);
            const digits = String(d).split("");
            return (
              <g key={d}>
                <ellipse cx={lx} cy={ly + 2} rx={30} ry={24} fill={HP.spark} opacity={0.35 * on + 0.1 * Math.sin(f / 4 + k)} />
                <text x={lx} y={ly + 11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
                  stroke={KRP.ink} strokeWidth={3} paintOrder="stroke" opacity={on}>
                  {digits.map((ch, j) => (
                    <tspan key={j} fill={ch === "1" || ch === "6" ? HP.spark : HP.rest}
                      stroke={ch === "1" || ch === "6" ? KRP.ink : "none"}>{ch}</tspan>
                  ))}
                </text>
                {/* 叩いた瞬間の波紋 */}
                {f >= tk(k) && f < tk(k) + 8 && (
                  <circle cx={lx} cy={ly} r={20 + (f - tk(k)) * 5} fill="none" stroke={HP.spark}
                    strokeWidth={5} opacity={1 - (f - tk(k)) / 8} />
                )}
              </g>
            );
          })}
        </g>
        {/* 竹の指さし棒と、役人の黒い袖 */}
        <g>
          <line x1={hand[0]} y1={hand[1]} x2={tip[0]} y2={tipY} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
          <line x1={hand[0]} y1={hand[1]} x2={tip[0]} y2={tipY} stroke={C.woodLight} strokeWidth={10} strokeLinecap="round" />
          {[0.25, 0.5, 0.75].map((q) => (
            <circle key={q} cx={lerp(hand[0], tip[0], q)} cy={lerp(hand[1], tipY, q)} r={7} fill={C.wood} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
          <circle cx={tip[0]} cy={tipY} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${hand[0] + 260} 1140 L ${hand[0] + 10} ${hand[1] - 40} L ${hand[0] + 80} ${hand[1] - 70} L ${hand[0] + 420} 1140 Z`}
            fill={C.tsume} stroke={KRP.ink} strokeWidth={6} />
                    <circle cx={hand[0]} cy={hand[1]} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <TagPlate x={1330} y={250} text="一六日" size={50} t={seg(f, 36, 42)} color={HP.rest} rot={-3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #62 月に6回。1年で、約70日。
// 格: 図 / seed 5062
// 絵: どこ: 役所の机の上の算盤と帳面。演出: 暦が12枚 (12か月) 重なってぱらぱらめくれ、横の算盤の玉が弾かれて、数字札「月に6回」→「1年で約70日」。12枚の暦の赤い日が集まって、大きな赤い山 (積み木の山) になる。動き: 暦がめくれる / 算盤 / 積み木が積もる
// どこ: 役所の机の上 (奥にしっくいの壁と障子の端、手前に木の天板)。暦の束・算盤・帳面・筆
// 演出: 12か月の暦がぱらぱらめくれるたびに、赤い積み木が1つずつ飛んで山に積もる。算盤の玉がぱちぱち弾かれ、札「月に6回」→「1年で約70日」
// 動き: 暦がめくれる (12回) / 積み木が積もる / 算盤の玉 / カメラが少し引く
const Hm062: React.FC<{ f: number }> = ({ f }) => {
  const flipP = seg(f, 4, 34) * 12;
  const month = Math.min(12, 1 + Math.floor(flipP));
  const flipPh = flipP >= 12 ? 1 : flipP - Math.floor(flipP);
  const Z = 64;
  const cells = pileCells([5, 4, 3, 2], Z);
  const nBlocks = Math.min(cells.length, Math.floor(seg(f, 6, 38) * cells.length + 0.001) + 1);
  const PX = 1010, PY = 760;
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1.06 - 0.06 * cam;
  const bead = (k: number) => Math.floor(seg(f, 8, 40) * 9) > k;
  return (
    <Frame f={f} seed={5062}>
      <g transform={`translate(${960 * (1 - sc)} ${540 * (1 - sc)}) scale(${sc})`}>
        {/* 奥の壁と障子の端 */}
        <rect x={-60} y={-60} width={2040} height={480} fill={C.plaster} />
        <rect x={1560} y={-60} width={420} height={480} fill={C.shoji} stroke={KRP.ink} strokeWidth={7} />
        {[1660, 1760, 1860].map((px) => <line key={px} x1={px} y1={-60} x2={px} y2={420} stroke={C.woodDark} strokeWidth={4} />)}
        {[60, 160, 260, 360].map((py) => <line key={py} x1={1560} y1={py} x2={1980} y2={py} stroke={C.woodDark} strokeWidth={4} />)}
        <rect x={-60} y={40} width={1620} height={22} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 机の天板 */}
        <rect x={-60} y={400} width={2040} height={740} fill={C.wood} />
        <rect x={-60} y={392} width={2040} height={22} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.woodDark} strokeWidth={4} fill="none" opacity={0.45}>
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -60 ${460 + i * 95} q 500 ${rnd(64, i) * 30 - 15} 1000 0 q 500 ${rnd(65, i) * 30 - 15} 1040 0`} />)}
        </g>
        {/* 暦の束 (12か月) */}
        <g>
          {[5, 4, 3, 2, 1].map((k) => (
            <rect key={k} x={250 + k * 6} y={380 + k * 6} width={308} height={275} rx={6} fill={k % 2 ? KRP.white : KRP.cream} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <YasumiCalendar x={404} y={518} s={0.55} title={`${month}月`} startDow={(month * 3) % 7} weekHead={false}
            rest={[1, 6, 11, 16, 21, 26]} t={1} f={f} />
          {/* めくれていく1枚 */}
          {flipP < 12 && (
            <g transform={`translate(0 380) scale(1 ${Math.cos(flipPh * Math.PI)}) translate(0 -380)`}>
              <rect x={250} y={380} width={308} height={275} rx={6} fill={flipPh > 0.5 ? C.shoji : KRP.white} stroke={KRP.ink} strokeWidth={4} />
              {flipPh < 0.5 && <rect x={250} y={380} width={308} height={36} rx={6} fill={HP.rest} stroke={KRP.ink} strokeWidth={4} />}
            </g>
          )}
          {/* めくれた紙の風 */}
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${230 - k * 20} ${360 + k * 30} q -30 -10 -50 -30`} stroke={KRP.ink} strokeWidth={4} fill="none"
              opacity={flipP < 12 ? 0.5 : 0} strokeLinecap="round" />
          ))}
        </g>
        {/* 積み木の山 */}
        <ellipse cx={PX} cy={PY + 6} rx={220} ry={22} fill={KRP.ink} opacity={0.18} />
        {cells.slice(0, nBlocks).map(([cx, cy], i) => {
          const isLast = i === nBlocks - 1 && nBlocks < cells.length;
          const born = 6 + (i / cells.length) * 32;
          const fall = isLast ? easeOut(seg(f, born - 1, born + 2.4)) : 1;
          const sx = lerp(420, PX + cx, fall), sy = lerp(470, PY + cy, fall) - Math.sin(fall * Math.PI) * 160;
          return <HmDBlock key={i} x={sx} y={sy} z={Z} />;
        })}
        {/* 算盤 */}
        <g transform="translate(1380 600) rotate(-4)">
          <rect x={-10} y={-10} width={500} height={190} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={10} y={10} width={460} height={150} fill="#E8DCC0" stroke={KRP.ink} strokeWidth={4} />
          <rect x={10} y={56} width={460} height={12} fill={C.woodDark} />
          {Array.from({ length: 9 }, (_, k) => {
            const bx = 36 + k * 50;
            const up = bead(k);
            return (
              <g key={k}>
                <line x1={bx} y1={12} x2={bx} y2={158} stroke={KRP.ink} strokeWidth={3} />
                <ellipse cx={bx} cy={up ? 48 : 30} rx={20} ry={11} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
                {[0, 1, 2, 3].map((j) => (
                  <ellipse key={j} cx={bx} cy={(up && j === 0 ? 78 : 94) + j * 20} rx={20} ry={11} fill={up && j === 0 ? HP.rest : C.wood} stroke={KRP.ink} strokeWidth={3} />
                ))}
              </g>
            );
          })}
        </g>
        {/* 帳面と筆 */}
        <g transform="rotate(5 760 920)">
          <rect x={620} y={860} width={280} height={190} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          <line x1={760} y1={860} x2={760} y2={1050} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={870 - k * 26} y1={880} x2={870 - k * 26} y2={1030} stroke={KRP.gray} strokeWidth={3} />)}
        </g>
        <line x1={940} y1={1000} x2={1120} y2={920} stroke={C.woodLight} strokeWidth={12} strokeLinecap="round" />
        <path d="M 1120 920 l 30 -12 l -8 22 Z" fill={KRP.ink} />
        {/* 札 (左端をそろえる) */}
        <TagPlate x={1380 + 112} y={250} text="月に6回" size={46} t={seg(f, 6, 14)} />
        <TagPlate x={1380 + 181} y={360} text="1年で約70日" size={46} t={seg(f, 32, 40)} color={HP.rest} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #63 明治9年、1876年。政府は、これを日曜休みに切りかえます。
// 格: 山 / seed 5063
// 絵: どこ: 明治の太政官 (政府) の大広間。年代札「明治9年」「1876年」。演出: 大きな暦の板の「一六日」の赤い印がはがされ、かわりに日曜日の列に新しい赤い札が**一斉に**貼られる。役人たちが脚立に登って貼り替える。動き: 古い印がはらはら落ちる / 新しい札が貼られる / 脚立がぐらっと
// どこ: 明治の太政官 (政府) の大広間。腰板の壁・高窓とカーテン・赤じゅうたん・寄木の床。正面に大きな暦の板
// 演出: 「一六日」の赤い丸印がはがれてはらはら落ち、かわりに日曜の列に赤い札が一斉に貼られる。脚立の役人2人が貼り替え、左の脚立がぐらっ
// 動き: 古い印が舞い落ちる / 日曜の列が一斉に赤く / 脚立がゆれる / 下の役人が見上げる / カメラが少し引く
const Hm063: React.FC<{ f: number }> = ({ f }) => {
  const CX = 960, CY = 400, CS = 1.32;
  const DOW = 6;
  const cellXY = (d: number): [number, number] => {
    const cell = DOW + d - 1;
    return [CX + CS * (-216 + 72 * (cell % 7)), CY + CS * (-111 + 62 * Math.floor(cell / 7))];
  };
  const newT = seg(f, 22, 27);
  const flash = seg(f, 22, 26) * (1 - seg(f, 28, 38));
  const wob = seg(f, 28, 42);
  const wobble = Math.sin(f / 2.2) * 6 * Math.sin(wob * Math.PI) + wob * 2;
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1.05 - 0.05 * cam;
  const shake = Math.sin(f * 1.9) * 2 * Math.sin(wob * Math.PI);
  return (
    <Frame f={f} seed={5063}>
      <g transform={`translate(${960 * (1 - sc) + shake} ${420 * (1 - sc)}) scale(${sc})`}>
        {/* 壁 (上は漆喰、下は腰板)、高窓とカーテン */}
        <rect x={-60} y={-60} width={2040} height={900} fill="#E8DCC2" />
        <rect x={-60} y={600} width={2040} height={240} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-20 + i * 170} y={630} width={130} height={180} rx={6} fill="none" stroke={C.woodDark} strokeWidth={4} />)}
        {[110, 1810].map((wx) => (
          <g key={wx}>
            <rect x={wx - 80} y={90} width={160} height={380} rx={80} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />
            <line x1={wx} y1={90} x2={wx} y2={470} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${wx - 100} 70 Q ${wx - 70} 300 ${wx - 104} 520 L ${wx - 60} 520 Q ${wx - 40} 300 ${wx - 60} 70 Z`} fill="#9E3A34" stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${wx + 100} 70 Q ${wx + 70} 300 ${wx + 104} 520 L ${wx + 60} 520 Q ${wx + 40} 300 ${wx + 60} 70 Z`} fill="#9E3A34" stroke={KRP.ink} strokeWidth={4} />
            <rect x={wx - 120} y={56} width={240} height={22} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 寄木の床と赤じゅうたん */}
        <rect x={-60} y={840} width={2040} height={300} fill={C.woodLight} />
        {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M ${i * 90 - 60} 840 l 40 300`} stroke={C.wood} strokeWidth={4} />)}
        <path d="M 640 840 L 1280 840 L 1420 1140 L 500 1140 Z" fill="#B23A30" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 670 860 L 1250 860 L 1380 1140 L 540 1140 Z" fill="none" stroke={KRP.brass} strokeWidth={4} />
        {/* 暦の板 (木枠) */}
        <rect x={CX - 400} y={CY - 380} width={800} height={720} rx={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <YasumiCalendar x={CX} y={CY} s={CS} title="明治9年〜" startDow={DOW}
          rest={[2, 9, 16, 23, 30]} half={[1, 8, 15, 22, 29]} t={newT} f={f} />
        {/* 日曜の列の光 */}
        {flash > 0 && <rect x={CX + CS * -252} y={CY + CS * -142} width={CS * 72} height={CS * 62 * 5} rx={10} fill={HP.spark} opacity={0.45 * flash} />}
        {/* はがれて落ちる「一六日」の丸印 */}
        {[1, 6, 11, 16, 21, 26].map((d, k) => {
          const [mx, my] = cellXY(d);
          const st = 3 + k * 2.4;
          const p = seg(f, st, st + 20);
          const peel = seg(f, st - 2, st);
          const yy = my + easeInOutFall(p) * (900 - my);
          const xx = mx + Math.sin(p * 9 + k) * 50 * p;
          const r = p * 280 * (k % 2 ? 1 : -1);
          return (
            <g key={d} transform={`translate(${xx} ${yy}) rotate(${r}) scale(${1 - peel * 0.08} ${Math.cos(p * 7 + k) * 0.5 + 0.5 * (1 - p) + 0.3})`}>
              <circle r={30} fill={HP.rest} stroke={KRP.ink} strokeWidth={4} />
              <circle r={21} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.7} />
              <text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.white}>休</text>
            </g>
          );
        })}
        {/* 左の脚立と役人 (日曜の列に札を貼る。ぐらっ) */}
        <g transform={`rotate(${wobble} 470 880)`}>
          <HmDKyatatsu x={470} y={880} h={340} />
          <HmDYakunin x={470} y={560} s={0.86} f={f} face={wob > 0.1 ? "surprised" : "joy"} pose="point" pointDir={1} phase={1} lean={wob > 0.1 ? -6 : 0} />
          <rect x={470 + 153 * 0.86 - 8} y={560 - 148 * 0.86 - 30} width={44} height={60} rx={4} fill={HP.rest} stroke={KRP.ink} strokeWidth={4} />
          {wob > 0.1 && [0, 1].map((k) => <path key={k} d={`M ${410 - k * 30} ${330 - k * 10} q -20 10 -26 34`} stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />)}
        </g>
        {/* 右の脚立と役人 (土曜の半分の札) */}
        <HmDKyatatsu x={1460} y={880} h={300} />
        <HmDYakunin x={1460} y={600} s={0.86} f={f} face="smile" pose="point" pointDir={-1} phase={3} />
        <path d={`M ${1460 - 153 * 0.86 - 30} ${600 - 148 * 0.86 + 26} l 56 -56 l 0 56 Z`} fill={HP.restSoft} stroke={HP.rest} strokeWidth={4} />
        {/* 下で札の束を抱えて見上げる役人 */}
        <HmDYakunin x={1720} y={900} s={0.95} f={f} face={wob > 0.1 ? "surprised" : "normal"} pose="hold" phase={5} gaze={[-6, -8]} />
        <g transform="translate(1720 778)">
          {[0, 1, 2, 3].map((k) => <rect key={k} x={-40 + k * 4} y={-26 - k * 10} width={80} height={30} rx={4} fill={HP.rest} stroke={KRP.ink} strokeWidth={3.5} />)}
        </g>
        {/* 年代札 (左端をそろえる) */}
        <TagPlate x={1400 + 108} y={110} text="明治9年" size={44} t={seg(f, 2, 10)} />
        <TagPlate x={1400 + 130} y={210} text="1876年" size={44} t={seg(f, 6, 14)} color={KRP.blueDeep} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #64 土曜日は、お昼の12時から休み。
// 格: 並 / seed 5064
// 絵: どこ: 明治の役所の部屋 (土曜の昼)。演出: 壁の洋風の掛け時計が12時を打つ (振り子・針が12で重なる)。と同時に、役人たちがいっせいに筆を置いて立ち上がる。札「土曜」。外で正午の空砲の煙 (遠くにぽん)。暦 (YasumiCalendar) の土曜の欄が斜め半分だけ塗られる。動き: 振り子 / 針が12時に / 立ち上がる / 煙
// どこ: 明治の役所の部屋 (土曜の昼)。正面の壁に洋風の振り子の掛け時計、左に窓 (遠くの城の石垣と空)、右の壁に暦。手前に机が2つ
// 演出: 時計の針が12で重なって「ボーン」。同時に役人2人が筆を置いて跳ねるように立ち上がる (1人はばんざい)。窓の外で正午の空砲の煙がぽん。暦の土曜が斜め半分だけ塗られる
// 動き: 振り子 / 針が12時に / 立ち上がる / 煙がふくらむ / 鐘の音の線
const Hm064: React.FC<{ f: number }> = ({ f }) => {
  const toNoon = easeInOut(seg(f, 0, 20));
  const minA = lerp(-36, 0, toNoon);
  const hourA = lerp(-3, 0, toNoon);
  const chime = seg(f, 20, 36);
  const up = easeOut(seg(f, 21, 28));
  const jump = Math.sin(seg(f, 21, 30) * Math.PI) * 24;
  const smoke = seg(f, 22, 40);
  const zoom = 1 + 0.03 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5064}>
      <g transform={`translate(${960 * (1 - zoom)} ${400 * (1 - zoom)}) scale(${zoom})`}>
        {/* 壁と腰板 */}
        <rect x={-60} y={-60} width={2040} height={760} fill={C.plaster} />
        <rect x={-60} y={540} width={2040} height={160} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={40} width={2040} height={22} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓 (遠くの石垣・松・空砲の煙) */}
        <g>
          <rect x={110} y={140} width={380} height={340} fill={C.sky} stroke={KRP.ink} strokeWidth={8} />
          <path d="M 114 400 L 200 330 L 330 330 L 420 380 L 486 380 L 486 476 L 114 476 Z" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={130 + i * 70} y1={360} x2={170 + i * 70} y2={476} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />)}
          <path d="M 250 330 q 30 -40 60 -10 q 30 -40 60 0 Z" fill={C.kimonoD} stroke={KRP.ink} strokeWidth={3} />
          {smoke > 0 && (
            <g opacity={1 - smoke * 0.5}>
              {[0, 1, 2, 3].map((k) => (
                <circle key={k} cx={380 + k * 18 - smoke * 10} cy={300 - k * 14 - smoke * 50} r={(14 + k * 6) * (0.4 + smoke)}
                  fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} />
              ))}
            </g>
          )}
          <line x1={300} y1={140} x2={300} y2={480} stroke={KRP.ink} strokeWidth={6} />
          <line x1={110} y1={310} x2={490} y2={310} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 振り子の掛け時計 */}
        <g transform="translate(960 0)">
          <path d="M -130 100 Q 0 30 130 100 L 130 560 L -130 560 Z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={8} />
          <circle cx={0} cy={220} r={108} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * 84} y1={220 - Math.cos(a) * 84} x2={Math.sin(a) * 98} y2={220 - Math.cos(a) * 98}
              stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 8} strokeLinecap="round" />;
          })}
          <text x={0} y={162} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>XII</text>
          <line x1={0} y1={220} x2={0} y2={160} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" transform={`rotate(${hourA} 0 220)`} />
          <line x1={0} y1={220} x2={0} y2={136} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${minA} 0 220)`} />
          <circle cx={0} cy={220} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          {/* 振り子の窓 */}
          <rect x={-80} y={350} width={160} height={180} rx={10} fill="#E9DDBE" stroke={KRP.ink} strokeWidth={6} />
          <g transform={`rotate(${Math.sin(f / 6) * 16} 0 350)`}>
            <line x1={0} y1={350} x2={0} y2={480} stroke={HP.brassDark} strokeWidth={5} />
            <circle cx={0} cy={490} r={26} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-8} cy={482} r={7} fill={KRP.white} opacity={0.6} />
          </g>
          {/* 鐘の音 */}
          {chime > 0 && chime < 1 && [0, 1, 2].map((k) => (
            <g key={k} opacity={1 - chime}>
              <path d={`M ${-150 - k * 34 - chime * 30} ${150 + k * 30} q -20 40 0 80`} stroke={KRP.orange} strokeWidth={7} fill="none" strokeLinecap="round" />
              <path d={`M ${150 + k * 34 + chime * 30} ${150 + k * 30} q 20 40 0 80`} stroke={KRP.orange} strokeWidth={7} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {/* 暦 (土曜は斜め半分) */}
        <YasumiCalendar x={1520} y={330} s={0.6} title="明治9年〜" startDow={6}
          rest={[2, 9, 16, 23, 30]} half={[1, 8, 15, 22, 29]} t={seg(f, 18, 34)} f={f} />
        <TagPlate x={1520} y={560} text="土曜" size={50} t={seg(f, 24, 32)} color={KRP.blueDeep} />
        {/* 床 */}
        <rect x={-60} y={700} width={2040} height={440} fill={C.tatami} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-60 + i * 70} y1={704} x2={-60 + i * 70} y2={1140} stroke={C.tatamiLine} strokeWidth={2} opacity={0.6} />)}
        {/* 役人2人 (座って書く → 立ち上がる) と机 */}
        {([[620, 1, "banzai"], [1300, 3, "stand"]] as const).map(([px, ph, ps], i) => {
          const py = lerp(880, 800, up) - jump;
          return (
            <g key={i}>
              <HmDYakunin x={px} y={py} s={1.0} f={f} phase={ph} face={up > 0.5 ? "joy" : "normal"} pose={up > 0.5 ? ps : "hold"} gaze={up > 0.5 ? [0, 0] : [0, 8]} />
              <rect x={px - 230} y={700} width={460} height={30} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
              <rect x={px - 210} y={730} width={420} height={80} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
              {/* 硯と紙 */}
              <rect x={px - 180} y={680} width={140} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <rect x={px + 90} y={680} width={80} height={22} rx={6} fill="#3A3A3E" stroke={KRP.ink} strokeWidth={3} />
              {/* 置かれた筆 (立ち上がった後) / 持っている筆 (前) */}
              {up > 0.3 ? (
                <line x1={px - 20} y1={690} x2={px + 70} y2={684} stroke={C.woodLight} strokeWidth={9} strokeLinecap="round" />
              ) : (
                <line x1={px + 14} y1={py - 118} x2={px + 30} y2={py - 190} stroke={C.woodLight} strokeWidth={9} strokeLinecap="round" />
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #65 こうして、役所と学校の休みが、日曜日になりました。
// 格: 山 / seed 5065
// 絵: どこ: 明治の町並み (洋風の役所と、木造の小学校が並ぶ通り)。演出: 日曜の朝、役所の扉と学校の門が閉まる。学校の子どもたち (着物にはかま) が門の前で大喜びで駆け出す。役人は帽子を取って伸び。札「役所」「学校」。動き: 門が閉まる / 子どもが走る / 伸び
// どこ: 明治の町の通り (日曜の朝)。左に石造りの役所、右に瓦屋根の木造の小学校。奥へのびる道・電信柱・朝日
// 演出: 役所の扉と学校の門が閉まる。門の前で、はかまの子どもたちが大喜びで駆け出す。真ん中の役人は帽子を取って大きく伸び
// 動き: 扉と門が閉まる / 子どもが走る / 伸び / 朝日の光 / カメラがゆっくり右へ
const Hm065: React.FC<{ f: number }> = ({ f }) => {
  const shut = easeInOut(seg(f, 4, 20));
  const gate = easeInOut(seg(f, 10, 26));
  const run = seg(f, 0, 42);
  const stretch = seg(f, 14, 22);
  const pan = easeInOut(seg(f, 0, 42));
  const TAGY = 116;
  return (
    <Frame f={f} seed={5065}>
      <g transform={`translate(${-24 * pan} 0) scale(1.02)`}>
        {/* 空と朝日 */}
        <rect x={-60} y={-60} width={2100} height={700} fill={C.skyLight} />
        <circle cx={980} cy={210} r={80} fill={KRP.yellow} opacity={0.9} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 + f * 0.8) * Math.PI / 180;
          return <line key={i} x1={980 + Math.cos(a) * 100} y1={210 + Math.sin(a) * 100} x2={980 + Math.cos(a) * 140} y2={210 + Math.sin(a) * 140}
            stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={0.7} />;
        })}
        {/* 奥の町並み */}
        <g fill={C.plasterShade} stroke={KRP.ink} strokeWidth={4}>
          {[820, 900, 1000, 1080].map((hx, i) => <path key={i} d={`M ${hx} 520 l 0 -${60 + i * 12} l 40 -30 l 40 30 l 0 ${60 + i * 12} Z`} />)}
        </g>
        {/* 道 */}
        <rect x={-60} y={520} width={2100} height={620} fill="#D8C9A2" />
        <path d="M 860 520 L 1100 520 L 1500 1140 L 460 1140 Z" fill="#E6D9B6" />
        {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={rnd(66, i) * 1900} cy={800 + rnd(67, i) * 300} rx={14} ry={6} fill={C.stoneDark} opacity={0.6} />)}
        {/* 電信柱 */}
        <rect x={1110} y={150} width={16} height={400} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1070} y={180} width={96} height={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
        <path d="M -60 200 Q 540 240 1118 186 Q 1500 230 2040 196" stroke={KRP.ink} strokeWidth={3} fill="none" />
        {/* 左: 役所 (石造り) */}
        <g>
          <rect x={40} y={180} width={720} height={540} fill={C.stone} stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 9 }, (_, r) => <line key={r} x1={40} y1={230 + r * 54} x2={760} y2={230 + r * 54} stroke={C.stoneLine} strokeWidth={3} />)}
          <path d="M 20 182 L 400 60 L 780 182 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={8} />
          {[120, 680].map((wx) => <rect key={wx} x={wx - 50} y={260} width={100} height={170} rx={50} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />)}
          {[260, 540].map((px) => <rect key={px} x={px - 26} y={200} width={52} height={520} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 扉 (閉まっていく) */}
          <rect x={310} y={400} width={180} height={320} fill="#E6D3A6" stroke={KRP.ink} strokeWidth={6} />
          <rect x={310} y={400} width={90 * shut} height={320} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={490 - 90 * shut} y={400} width={90 * shut} height={320} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {shut > 0.95 && <circle cx={400} cy={560} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />}
          {shut > 0.95 && <line x1={316} y1={560} x2={484} y2={560} stroke={KRP.ink} strokeWidth={6} />}
          {/* 閉まった音 */}
          {seg(f, 20, 30) > 0 && seg(f, 20, 30) < 1 && [0, 1, 2].map((k) => (
            <line key={k} x1={400 + (k - 1) * 70} y1={386} x2={400 + (k - 1) * 100} y2={350} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 20, 30)} />
          ))}
          <rect x={300} y={720} width={200} height={26} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 右: 小学校 (木造・瓦屋根・鐘) と門 */}
        <g>
          <rect x={1220} y={260} width={680} height={400} fill="#E9D7B0" stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={1220 + i * 50} y1={262} x2={1220 + i * 50} y2={658} stroke={C.woodLight} strokeWidth={4} />)}
          <path d="M 1180 264 L 1300 170 L 1820 170 L 1940 264 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={1240 + i * 58} y1={180} x2={1220 + i * 60} y2={260} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
          {[1300, 1460, 1720].map((wx) => (
            <g key={wx}>
              <rect x={wx - 60} y={330} width={120} height={140} fill={C.shoji} stroke={KRP.ink} strokeWidth={5} />
              <line x1={wx} y1={330} x2={wx} y2={470} stroke={C.woodDark} strokeWidth={4} />
              <line x1={wx - 60} y1={400} x2={wx + 60} y2={400} stroke={C.woodDark} strokeWidth={4} />
            </g>
          ))}
          {/* 鐘 */}
          <path d="M 1560 120 l 0 50" stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${Math.sin(f / 4) * 10} 1560 120)`}>
            <path d="M 1534 170 Q 1536 130 1560 128 Q 1584 130 1586 170 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 門柱と門の扉 (閉まっていく) */}
          {[1250, 1590].map((gx) => <rect key={gx} x={gx - 24} y={500} width={48} height={260} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />)}
          <rect x={1274} y={560} width={150 * gate} height={180} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1566 - 150 * gate} y={560} width={150 * gate} height={180} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          {gate > 0.2 && [0, 1, 2].map((k) => (
            <g key={k}>
              <line x1={1274 + 40 * k * gate + 30 * gate} y1={570} x2={1274 + 40 * k * gate + 30 * gate} y2={730} stroke={C.wood} strokeWidth={4} />
              <line x1={1566 - 40 * k * gate - 30 * gate} y1={570} x2={1566 - 40 * k * gate - 30 * gate} y2={730} stroke={C.wood} strokeWidth={4} />
            </g>
          ))}
        </g>
        {/* 札 (同じ高さ) */}
        <TagPlate x={400} y={TAGY} text="役所" size={46} t={seg(f, 2, 10)} />
        <TagPlate x={1760} y={TAGY} text="学校" size={46} t={seg(f, 4, 12)} />
        {/* 子どもたち (門から飛び出して手前へ駆けてくる) */}
        {([[1380, 1, C.kimonoA, C.hakama, false, -1], [1460, 2, C.kimonoC, C.hakamaB, true, 1], [1300, 3, C.kimonoB, C.hakama, false, -1], [1540, 4, C.kimonoD, C.hakama, true, 1]] as const).map(
          ([sx, ph, ki, ha, girl, dir], i) => {
            const p = clamp01(run * 1.2 - i * 0.08);
            const x = sx + dir * p * (180 + i * 40);
            const y = 760 + p * (150 + (i % 2) * 40);
            const s = 0.62 + p * 0.14;
            const hop = Math.abs(Math.sin((f + i * 5) / 3.2)) * 16;
            return <HmDKodomo key={i} x={x} y={y - hop} s={s} f={f} phase={ph} kimono={ki} hakama={ha} girl={girl}
              face="joy" pose={i % 2 ? "banzai" : "run"} lean={dir * 6} />;
          })}
        {/* 役人 (帽子を取って伸び) */}
        <HmDYakunin x={840} y={880} s={0.98} f={f} face={stretch > 0.5 ? "joy" : "smile"} pose={stretch > 0.5 ? "banzai" : "hold"} hat={stretch <= 0.5} phase={2} />
        {stretch > 0.5 && (
          <g transform={`translate(${840 - 125 * 0.98} ${880 - 196 * 0.98}) rotate(-30)`}>
            <path d="M -50 0 Q -48 -44 0 -48 Q 48 -44 50 0 Z" fill={C.tsume} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -52 0 L 54 0 Q 74 6 78 16 L -44 12 Z" fill={C.tsumeDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-48} y={-14} width={96} height={8} fill={KRP.brass} opacity={0.85} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #66 さて、計算してみましょう。
// 格: 並 / seed 5066
// 絵: どこ: 明治の教室の黒板 (チョーク・黒板消し・教卓)。演出: 黒板に2つの暦の絵 (一六日と日曜) をチョークで描き、真ん中に「?」と天秤。眼鏡の先生 (詰襟) がチョークを持って腕まくり。動き: チョークで描かれていく / 腕まくり / 粉が舞う
// どこ: 明治の教室の黒板の前 (しっくいの壁・腰板・掛け時計・チョーク受け・教壇)。教卓の上に真鍮の天秤
// 演出: 眼鏡の先生 (詰襟) が腕まくりして、黒板に2つの暦 (一六日 / 日曜) をチョークで描いていく。真ん中に大きな「?」
// 動き: チョークの線が描かれていく / 腕まくりのそで / チョークの粉が舞う / カメラがゆっくり寄る
const Hm066: React.FC<{ f: number }> = ({ f }) => {
  const pL = seg(f, 2, 16), pR = seg(f, 14, 30), pQ = seg(f, 28, 38);
  const zoom = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const TX = 1240, TY = 770, TS = 0.95;
  const hx = TX + 67 * TS, hy = TY - 232 * TS + Math.sin(f / 1.6) * 6 * (pR > 0 && pR < 1 ? 1 : 0.3);
  const dash = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p });
  const chalkCal = (x0: number, y0: number, p: number, sunday: boolean, label: string) => (
    <g stroke={C.chalk} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.92}>
      <rect x={x0} y={y0} width={300} height={250} rx={6} {...dash(clamp01(p * 2))} />
      {[1, 2, 3, 4].map((k) => <line key={`h${k}`} x1={x0} y1={y0 + 50 * k} x2={x0 + 300} y2={y0 + 50 * k} {...dash(clamp01(p * 3 - 0.6 - k * 0.1))} strokeWidth={3} />)}
      {[1, 2, 3, 4, 5, 6].map((k) => <line key={`v${k}`} x1={x0 + 43 * k} y1={y0 + 50} x2={x0 + 43 * k} y2={y0 + 250} {...dash(clamp01(p * 3 - 1 - k * 0.08))} strokeWidth={3} />)}
      <text x={x0 + 150} y={y0 + 38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.chalk} stroke="none" opacity={seg(p, 0.3, 0.5)}>{label}</text>
      {/* 休みの日の印 (ピンクのチョーク) */}
      {(sunday ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5]).map((k) => {
        const [cx, cy] = sunday ? [x0 + 22, y0 + 75 + 50 * k] : [[3, 0], [1, 1], [6, 1], [4, 2], [2, 3], [0, 3]].map(([c, r]) => [x0 + 22 + 43 * c, y0 + 75 + 50 * r])[k];
        return <circle key={k} cx={cx} cy={cy} r={16} stroke={C.chalkPink} strokeWidth={5} {...dash(seg(p, 0.7 + k * 0.04, 0.85 + k * 0.04))} />;
      })}
    </g>
  );
  return (
    <Frame f={f} seed={5066}>
      <g transform={`translate(${900 * (1 - zoom)} ${420 * (1 - zoom)}) scale(${zoom})`}>
        <HmDKyoshitsu f={f}>
          {chalkCal(330, 200, pL, false, "一六日")}
          {chalkCal(1290, 250, pR, true, "日曜")}
          {/* 真ん中の「?」 */}
          <text x={960} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill="none"
            stroke={C.chalkYellow} strokeWidth={7} pathLength={1} opacity={pQ > 0 ? 1 : 0}
            transform={`translate(960 270) scale(${pop(pQ)}) translate(-960 -270)`}>?</text>
          {/* 教壇 */}
          <rect x={200} y={770} width={1520} height={60} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <rect x={200} y={830} width={1520} height={30} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 教卓と天秤 */}
          <rect x={560} y={640} width={400} height={26} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={580} y={666} width={360} height={110} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={720} y={690} width={80} height={14} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <HmDTenbin x={760} y={646} s={0.62} tilt={Math.sin(f / 10) * 1.5} />
          {/* 出席簿 */}
          <rect x={890} y={620} width={60} height={22} fill={C.kimonoB} stroke={KRP.ink} strokeWidth={3} />
          {/* 先生 (眼鏡・詰襟・腕まくり) */}
          <HmDYakunin x={TX} y={TY} s={TS} f={f} face="smile" pose="raise" glasses phase={3} gaze={[6, -6]} />
          <g transform={`translate(${TX} ${TY + Math.sin((f + 51) / 13) * 3}) scale(${TS})`}>
            {/* 右腕 (上げた腕) のまくった袖 */}
            <rect x={56} y={-232} width={22} height={36} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={52} y={-202} width={30} height={14} rx={6} fill={C.tsume} stroke={KRP.ink} strokeWidth={3} />
            {/* 左腕 */}
            <rect x={-78} y={-100} width={22} height={34} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-82} y={-106} width={30} height={14} rx={6} fill={C.tsume} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 手のチョークと粉 */}
          <rect x={hx - 6} y={hy - 30} width={12} height={30} rx={4} fill={C.chalk} stroke={KRP.ink} strokeWidth={2.5} />
          {Array.from({ length: 10 }, (_, i) => {
            const t = ((f * 0.9 + i * 4.3) % 22) / 22;
            return <circle key={i} cx={hx + (rnd(68, i) - 0.5) * 70 * t} cy={hy - 30 + t * 120} r={3 + rnd(69, i) * 3}
              fill={C.chalk} opacity={(1 - t) * 0.8} />;
          })}
        </HmDKyoshitsu>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #67 日曜日は、1年でだいたい52回。
// 格: 図 / seed 5067
// 絵: どこ: #66 の黒板 (続き)。演出: 黒板に日曜の印 (赤い丸) が**52個** 4行に並んで書かれていく (チョークの点々が高速で増える)。数字札「約52回」。先生の手が忙しく動く。動き: 丸が増える / 数字がぽん
// どこ: #66 の黒板に寄った絵 (同じ教室の続き。黒板の木枠・チョーク受け・左上の掛け時計の端)
// 演出: 先生の手が猛スピードで動き、日曜の印 (ピンクの丸) が4行×13個 = 52個、点々と増えていく。最後に札「約52回」がぽん
// 動き: 丸が1つずつ増える / チョークの手が行ったり来たり / 粉が舞う / 数字の札がぽん
const Hm067: React.FC<{ f: number }> = ({ f }) => {
  const Z = 1.35, OX = 960, OY = 370;
  const toS = (x: number, y: number): [number, number] => [OX + (x - OX) * Z, OY + (y - OY) * Z];
  const N = 52;
  const prog = seg(f, 3, 36) * N;
  const n = Math.min(N, Math.floor(prog) + (prog > 0 ? 1 : 0));
  const pos = (k: number): [number, number] => [380 + 92 * (k % 13), 232 + 86 * Math.floor(k / 13)];
  const cur = pos(Math.max(0, Math.min(N - 1, n - 1)));
  const [hx, hy] = toS(cur[0] + 26, cur[1] + 20);
  const done = n >= N;
  const rest: [number, number] = toS(1560, 520);
  const handX = done ? lerp(hx, rest[0], seg(f, 36, 42)) : hx;
  const handY = done ? lerp(hy, rest[1], seg(f, 36, 42)) : hy + Math.sin(f * 2.1) * 6;
  return (
    <Frame f={f} seed={5067}>
      <g transform={`translate(${OX * (1 - Z)} ${OY * (1 - Z)}) scale(${Z})`}>
        <HmDKyoshitsu f={f}>
          <text x={1560} y={196} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.chalk} opacity={0.9}>日曜</text>
          {Array.from({ length: n }, (_, k) => {
            const [cx, cy] = pos(k);
            const born = 3 + (k / N) * 33;
            const p = clamp01((f - born) / 1.6);
            return (
              <g key={k}>
                <circle cx={cx} cy={cy} r={30} fill="none" stroke={C.chalkPink} strokeWidth={6} pathLength={1}
                  strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={22} fill={C.chalkPink} opacity={0.18 * p} />
              </g>
            );
          })}
          {/* 行の終わりの「13」の小さな目印 */}
          {[0, 1, 2, 3].map((r) => (
            <text key={r} x={1530} y={244 + 86 * r} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.chalk}
              opacity={n >= (r + 1) * 13 ? 0.75 : 0}>13</text>
          ))}
        </HmDKyoshitsu>
      </g>
      {/* 先生の手 (黒い袖・まくった腕・チョーク) */}
      <g transform={`translate(${handX} ${handY}) rotate(-30)`}>
        <path d="M 20 30 L 420 120 L 420 260 L 0 90 Z" fill={C.tsume} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-10} y={10} width={110} height={56} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={90} y={4} width={28} height={72} rx={8} fill={C.tsume} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-6} cy={36} r={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-46} y={22} width={44} height={14} rx={5} fill={C.chalkPink} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 速さの線と粉 */}
      {!done && [0, 1, 2].map((k) => (
        <line key={k} x1={handX + 60 + k * 30} y1={handY - 50 + k * 26} x2={handX + 140 + k * 30} y2={handY - 50 + k * 26}
          stroke={C.chalk} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const t = ((f * 1.1 + i * 3.7) % 20) / 20;
        return <circle key={i} cx={handX - 40 + (rnd(70, i) - 0.5) * 90 * t} cy={handY + 20 + t * 120} r={3 + rnd(71, i) * 4} fill={C.chalk} opacity={(1 - t) * 0.7} />;
      })}
      <TagPlate x={960} y={770} text="約52回" size={56} t={seg(f, 36, 42)} color={HP.rest} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #68 土曜の半日を足しても、70日には届きません。
// 格: 図 / seed 5068
// 絵: どこ: #66 の黒板の天秤。演出: 左の皿に「一六日 約70日」の赤い積み木の山 (#62 と同じ見た目)、右の皿に「日曜 約52回」の山+「土曜の半分」の半分の積み木が足される。右が足りなくて、天秤が左に傾いたまま。足りない分に点線の「すき間」が見える。動き: 半分の積み木が乗る / 天秤がぐらっとして左に傾いたまま
// どこ: #66 の教室。教卓の上の真鍮の天秤に寄った絵 (後ろは黒板。チョークの「一六日」「日曜」がうっすら残る)
// 演出: 左の皿に「一六日」の赤い積み木の山 (#62 と同じ)、右の皿に「日曜」の山。右に「土曜の半分」の薄い積み木がぽとんと足される。天秤はぐらっとするが、左に傾いたまま。右の山の上に、足りない分の点線のすき間
// 動き: 半分の積み木が落ちて乗る / 天秤がぐらっ→左に傾いたまま / 点線のすき間が点滅
const Hm068: React.FC<{ f: number }> = ({ f }) => {
  const Z = 34;
  const lCells = pileCells([5, 4, 3, 2], Z);
  const drop = seg(f, 8, 18);
  const landed = drop >= 1;
  const wob = seg(f, 18, 38);
  const tilt = -9 + (landed ? Math.sin(wob * Math.PI * 3) * 5 * (1 - wob) + 2.5 * Math.sin(wob * Math.PI) : Math.sin(f / 6) * 0.6);
  const gapOn = seg(f, 30, 38);
  const zoom = 1.04 - 0.04 * easeInOut(seg(f, 0, 42));
  // 天秤は s=1.25 で (960, 880) に置く。皿の中は 皿の座標 (上面 y=0) で描く
  const leftPile = (
    <g>
      {lCells.map(([cx, cy], i) => <HmDBlock key={i} x={cx} y={cy} z={Z} />)}
    </g>
  );
  const rightPile = (
    <g>
      {lCells.slice(0, 10).map(([cx, cy], i) => <HmDBlock key={i} x={cx} y={cy} z={Z} />)}
      {/* 土曜の半分 (落ちてくる) */}
      <HmDBlock x={lCells[10][0]} y={lerp(-520, lCells[10][1], easeInOutFall(drop))} z={Z} half />
      {/* 足りない分の点線のすき間 */}
      {gapOn > 0 && (
        <g opacity={gapOn * (0.65 + 0.35 * Math.sin(f / 3))}>
          <rect x={lCells[10][0]} y={lCells[10][1] - Z} width={Z} height={Z / 2} fill="none" stroke={HP.spark} strokeWidth={3.5} strokeDasharray="7 6" />
          {lCells.slice(11).map(([gx, gy], i) => (
            <rect key={i} x={gx} y={gy - Z} width={Z} height={Z} fill="none" stroke={HP.spark} strokeWidth={3.5} strokeDasharray="7 6" />
          ))}
        </g>
      )}
    </g>
  );
  return (
    <Frame f={f} seed={5068}>
      <g transform={`translate(${960 * (1 - zoom)} ${520 * (1 - zoom)}) scale(${zoom})`}>
        {/* 黒板 (画面いっぱい) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.plaster} />
        <rect x={20} y={20} width={1880} height={760} rx={10} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={8} />
        <rect x={50} y={50} width={1820} height={700} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
        {[[300, 300, 260], [1500, 500, 300]].map(([ex, ey, r], i) => <ellipse key={i} cx={ex} cy={ey} rx={r} ry={r * 0.3} fill={C.chalk} opacity={0.05} />)}
        <g opacity={0.35} stroke={C.chalk} strokeWidth={5} fill="none">
          <rect x={90} y={120} width={260} height={220} rx={6} />
          <rect x={1570} y={120} width={260} height={220} rx={6} />
        </g>
        <text x={220} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.chalk} opacity={0.5}>一六日</text>
        <text x={1700} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.chalk} opacity={0.5}>日曜</text>
        <rect x={40} y={772} width={1840} height={24} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 教卓 */}
        <rect x={-60} y={880} width={2040} height={40} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-60} y={920} width={2040} height={220} fill={C.woodDark} />
        <HmDTenbin x={960} y={884} s={1.25} tilt={tilt} left={leftPile} right={rightPile} />
        {/* ぐらっの線 */}
        {landed && wob < 0.8 && [0, 1].map((k) => (
          <path key={k} d={`M ${1420 + k * 40} ${380 - k * 30} q 20 20 0 44`} stroke={C.chalk} strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - wob} />
        ))}
        {/* 札 (左右で同じ高さ) */}
        <TagPlate x={560} y={250} text="約70日" size={48} t={seg(f, 2, 10)} color={HP.rest} />
        <TagPlate x={1360} y={250} text="約52回" size={48} t={seg(f, 4, 12)} color={HP.rest} />
        <TagPlate x={1640} y={420} text="土曜の半分" size={36} t={seg(f, 10, 18)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #69 休みは、減りました。
// 格: 山 / seed 5069
// 絵: どこ: #66 の教室 (引き)。演出: 黒板の天秤の右の皿から、最後の積み木がころんと落ちる。先生がチョークを落とす (face="surprised")。教室の生徒 (はかまの子どもたち) が一斉に「えーっ」の顔。札「減った」。動き: 積み木が落ちる / チョークが落ちる / 生徒がのけぞる
// どこ: #66 の教室を引きで (黒板・教壇・教卓の天秤・先生・手前に生徒の机)
// 演出: 天秤の右の皿から最後の積み木がころんと落ち、天秤はさらに左へがくん。先生はチョークをぽろり (おどろき顔)。手前のはかまの子どもたちが一斉にのけぞって「えーっ」。黒板に札「減った」
// 動き: 積み木が落ちて床で跳ねる / 天秤ががくん / チョークが落ちて割れる / 生徒がのけぞる / カメラが少し引く
const Hm069: React.FC<{ f: number }> = ({ f }) => {
  const Z = 34;
  const cells = pileCells([5, 4, 3, 2], Z);
  const fall = seg(f, 4, 18);
  const tiltT = easeOut(seg(f, 8, 18));
  const tilt = lerp(-9, -15, tiltT) + Math.sin(seg(f, 12, 30) * Math.PI * 3) * 3 * (1 - seg(f, 12, 30));
  const BS = 0.75, BX = 960, BY = 646;
  const a0 = (-9 * Math.PI) / 180;
  const panX = BX + 300 * BS * Math.cos(a0), panY = BY - 300 * BS + 300 * BS * Math.sin(a0) + 150 * BS;
  const sX = panX + (cells[9][0] + Z / 2) * BS, sY = panY + (cells[9][1] - Z / 2) * BS;
  const floorY = 640 - 2;
  const fx = lerp(sX, 1120, fall);
  const fy = fall < 0.75 ? lerp(sY, floorY, Math.pow(fall / 0.75, 2)) - Math.sin((fall / 0.75) * Math.PI) * 60 : floorY - Math.sin(((fall - 0.75) / 0.25) * Math.PI) * 30;
  const shock = seg(f, 14, 22);
  const chalkFall = seg(f, 14, 26);
  const TX = 1570, TY = 790, TS = 0.95;
  const chalkFloor = 776;
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1.06 - 0.06 * cam;
  const rightPile = (
    <g>
      {cells.slice(0, 9).map(([cx, cy], i) => <HmDBlock key={i} x={cx} y={cy} z={Z} />)}
      <HmDBlock x={cells[10][0]} y={cells[10][1]} z={Z} half />
    </g>
  );
  const leftPile = <g>{cells.map(([cx, cy], i) => <HmDBlock key={i} x={cx} y={cy} z={Z} />)}</g>;
  return (
    <Frame f={f} seed={5069}>
      <g transform={`translate(${960 * (1 - zoom)} ${480 * (1 - zoom)}) scale(${zoom})`}>
        <HmDKyoshitsu f={f}>
          {/* 黒板に残るチョーク */}
          <g opacity={0.6} stroke={C.chalk} strokeWidth={5} fill="none">
            <rect x={330} y={200} width={300} height={250} rx={6} />
            <rect x={1290} y={250} width={300} height={250} rx={6} />
          </g>
          <text x={480} y={238} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.chalk} opacity={0.6}>一六日</text>
          <text x={1440} y={288} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.chalk} opacity={0.6}>日曜</text>
          {/* 教壇 */}
          <rect x={200} y={770} width={1520} height={60} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <rect x={200} y={830} width={1520} height={30} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 教卓と天秤 */}
          <rect x={760} y={640} width={400} height={26} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={780} y={666} width={360} height={110} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <HmDTenbin x={BX} y={BY} s={BS} tilt={tilt} left={leftPile} right={rightPile} />
          {/* 落ちる最後の積み木 */}
          <g transform={`translate(${fx} ${fy}) rotate(${fall * 300})`}>
            <HmDBlock x={-Z * BS / 2} y={Z * BS / 2} z={Z * BS} />
          </g>
          {fall >= 1 && <ellipse cx={1120} cy={floorY + 2} rx={22} ry={5} fill={KRP.ink} opacity={0.25} />}
          {/* 先生 (チョークをぽろり) */}
          <HmDYakunin x={TX} y={TY} s={TS} f={f} face={shock > 0.2 ? "surprised" : "normal"} pose="stand" glasses phase={3} lean={shock > 0.2 ? -5 : 0} gaze={[-8, 4]} />
          {chalkFall < 1 ? (
            <rect x={TX + 64 - 6} y={lerp(TY - 66, chalkFloor - 10, Math.pow(chalkFall, 2))} width={12} height={30} rx={4} fill={C.chalk}
              stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${chalkFall * 200} ${TX + 64} ${lerp(TY - 50, chalkFloor, Math.pow(chalkFall, 2))})`} />
          ) : (
            <g>
              <rect x={TX + 40} y={chalkFloor - 12} width={16} height={11} rx={3} fill={C.chalk} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(-20 ${TX + 48} ${chalkFloor})`} />
              <rect x={TX + 80} y={chalkFloor - 12} width={14} height={11} rx={3} fill={C.chalk} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(30 ${TX + 86} ${chalkFloor})`} />
              {[0, 1, 2, 3].map((k) => <circle key={k} cx={TX + 66 + (k - 1.5) * 16} cy={chalkFloor - 8 - k % 2 * 6} r={4} fill={C.chalk} opacity={0.7} />)}
            </g>
          )}
          {/* 驚きの線 */}
          {shock > 0 && [0, 1, 2].map((k) => (
            <line key={k} x1={TX - 40 + k * 40} y1={TY - 300 * TS - 10} x2={TX - 60 + k * 60} y2={TY - 300 * TS - 50}
              stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={shock} />
          ))}
          <TagPlate x={960} y={190} text="減った" size={66} t={seg(f, 22, 30)} color={HP.rest} rot={-3} />
          {/* 手前: 生徒と机 (のけぞる) */}
          {([[230, 1, C.kimonoA, C.hakama, false, -1], [560, 2, C.kimonoC, C.hakamaB, true, -1], [1370, 3, C.kimonoB, C.hakama, false, 1], [1760, 4, C.kimonoD, C.hakama, true, 1]] as const).map(
            ([sx, ph, ki, ha, girl, dir], i) => {
              const back = easeOut(seg(f, 16 + i * 1.2, 24 + i * 1.2));
              return (
                <g key={i}>
                  <HmDKodomo x={sx} y={930} s={0.72} f={f} phase={ph} kimono={ki} hakama={ha} girl={girl}
                    face={back > 0.3 ? "surprised" : "normal"} pose={back > 0.3 ? (i % 2 ? "banzai" : "raise") : "stand"} lean={dir * 14 * back} />
                  <rect x={sx - 150} y={876} width={300} height={22} rx={4} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
                  <rect x={sx - 136} y={898} width={272} height={200} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
                  <rect x={sx - 100} y={860} width={90} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={sx + 20} y={862} width={50} height={14} rx={4} fill="#3A3A3E" stroke={KRP.ink} strokeWidth={3} />
                  {back > 0.3 && [0, 1].map((k) => (
                    <path key={k} d={`M ${sx + (k ? 60 : -60)} ${930 - 0.72 * 300} l ${k ? 20 : -20} -26`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={back} />
                  ))}
                </g>
              );
            })}
        </HmDKyoshitsu>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #70 役所のみなさん、たぶん、がっかりです。
// 格: 山 / seed 5070
// 絵: どこ: 明治の役所の休憩室 (火鉢・湯のみ・新聞)。演出: 詰襟の役人3人が、壁の新しい暦 (日曜だけ赤い) を見て肩を落とす (face="sad")。1人は湯のみをすすってため息、1人は指を折って数え直し、1人は火鉢に突っ伏す。ため息の湯気が3本上がる。動き: ため息の湯気 / 湯のみ / 指折り
// どこ: 明治の役所の休憩室 (畳・障子・長火鉢と鉄瓶・湯のみ・たたんだ新聞・壁の新しい暦)
// 演出: 詰襟の役人3人が、日曜だけ赤い新しい暦を見て肩を落とす。左は湯のみをすすってため息、真ん中は指を折って数え直し、右は長火鉢に突っ伏す。ため息の湯気が3本
// 動き: ため息の湯気が上る / 湯のみが口元へ / 指折り / 鉄瓶の湯気 / 炭の火 / カメラがゆっくり寄る
const Hm070: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const sip = easeInOut(seg(f, 6, 16));
  const slump = easeOut(seg(f, 4, 14));
  const fold = Math.min(5, Math.floor(seg(f, 8, 40) * 6));
  const ember = 0.7 + 0.3 * Math.sin(f / 3.3);
  const sigh = (x: number, y: number, ph: number) => (
    <g>
      {[0, 1].map((k) => {
        const t = ((f + ph * 9 + k * 14) % 28) / 28;
        return (
          <path key={k} d={`M ${x} ${y - t * 160} q 18 -20 0 -40 q -18 -20 0 -40`} stroke={KRP.white} strokeWidth={8}
            fill="none" strokeLinecap="round" opacity={(1 - t) * 0.9} />
        );
      })}
      {[0, 1].map((k) => {
        const t = ((f + ph * 9 + k * 14) % 28) / 28;
        return (
          <path key={`o${k}`} d={`M ${x} ${y - t * 160} q 18 -20 0 -40 q -18 -20 0 -40`} stroke={KRP.grayDark} strokeWidth={2}
            fill="none" opacity={(1 - t) * 0.5} />
        );
      })}
    </g>
  );
  const AX = 520, BX = 1000, CX2 = 1360, PY = 800, PS = 0.95;
  return (
    <Frame f={f} seed={5070}>
      <g transform={`translate(${960 * (1 - zoom)} ${420 * (1 - zoom)}) scale(${zoom})`}>
        {/* 壁と長押・障子 */}
        <rect x={-60} y={-60} width={2040} height={760} fill={C.plaster} />
        <rect x={-60} y={40} width={2040} height={22} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {[-10, 1880].map((px) => <rect key={px} x={px} y={-60} width={50} height={760} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />)}
        <g>
          <rect x={1500} y={100} width={340} height={600} fill={C.shoji} stroke={KRP.ink} strokeWidth={7} />
          {[1585, 1670, 1755].map((px) => <line key={px} x1={px} y1={100} x2={px} y2={700} stroke={C.woodDark} strokeWidth={4} />)}
          {Array.from({ length: 7 }, (_, k) => <line key={k} x1={1500} y1={100 + (k + 1) * 75} x2={1840} y2={100 + (k + 1) * 75} stroke={C.woodDark} strokeWidth={4} />)}
          <rect x={1500} y={100} width={340} height={600} fill="#FFE6A0" opacity={0.15} />
        </g>
        {/* 掛け物の帽子かけと帽子3つ */}
        <rect x={140} y={150} width={300} height={16} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {[190, 290, 390].map((hx, i) => (
          <g key={hx} transform={`rotate(${Math.sin(f / 18 + i) * 2} ${hx} 166)`}>
            <line x1={hx} y1={166} x2={hx} y2={190} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${hx - 40} 236 Q ${hx - 38} 194 ${hx} 190 Q ${hx + 38} 194 ${hx + 40} 236 Z`} fill={C.tsume} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${hx - 42} 236 L ${hx + 44} 236 L ${hx + 58} 246 L ${hx - 36} 244 Z`} fill={C.tsumeDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 壁の新しい暦 (日曜の列だけ赤い) */}
        <g>
          <rect x={738} y={98} width={420} height={380} fill={KRP.ink} opacity={0.15} />
          <rect x={730} y={90} width={420} height={380} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={730} y={90} width={420} height={56} fill={HP.rest} stroke={KRP.ink} strokeWidth={6} />
          <text x={940} y={132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>明治9年〜</text>
          {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
            <rect key={`${r}${c}`} x={746 + c * 57} y={160 + r * 60} width={48} height={50} rx={5}
              fill={c === 0 ? HP.restSoft : KRP.cream} stroke={c === 0 ? HP.rest : KRP.gray} strokeWidth={c === 0 ? 4 : 2} />
          )))}
          <rect x={742} y={156} width={56} height={304} rx={8} fill="none" stroke={HP.rest} strokeWidth={5} opacity={0.5 + 0.3 * Math.sin(f / 5)} />
        </g>
        {/* 畳 */}
        <rect x={-60} y={700} width={2040} height={440} fill={C.tatami} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-60 + i * 70} y1={704} x2={-60 + i * 70} y2={1140} stroke={C.tatamiLine} strokeWidth={2} opacity={0.6} />)}
        <rect x={-60} y={700} width={2040} height={14} fill={C.tatamiEdge} />
        {/* 役人A: 湯のみをすすってため息 */}
        <HmDYakunin x={AX} y={PY} s={PS} f={f} face="sad" pose="hold" phase={1} gaze={[6, -8]} />
        <g transform={`translate(${AX} ${lerp(PY - 116 * PS, PY - 150 * PS, sip)})`}>
          <path d="M -26 -40 L 26 -40 L 20 8 L -20 8 Z" fill={C.kimonoB} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -26 -40 L 26 -40" stroke={KRP.white} strokeWidth={3} />
          <rect x={-22} y={-24} width={44} height={8} fill={KRP.white} opacity={0.5} />
        </g>
        {sigh(AX - 70, PY - 210 * PS, 0)}
        {/* 役人B: 指を折って数え直す */}
        <HmDYakunin x={BX} y={PY} s={PS} f={f} face="sad" pose="hold" phase={3} gaze={[-4, -8]} lean={4} />
        <g transform={`translate(${BX + 4} ${PY - 124 * PS}) rotate(4)`}>
          <circle cx={0} cy={0} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {[0, 1, 2, 3, 4].map((k) => {
            const folded = k < fold;
            const rad = ((-70 + k * 30) * Math.PI) / 180;
            const len = folded ? 10 : 26;
            return (
              <g key={k}>
                <line x1={Math.sin(rad) * 16} y1={-Math.cos(rad) * 16} x2={Math.sin(rad) * (16 + len)} y2={-Math.cos(rad) * (16 + len)} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
                <line x1={Math.sin(rad) * 16} y1={-Math.cos(rad) * 16} x2={Math.sin(rad) * (16 + len)} y2={-Math.cos(rad) * (16 + len)} stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
        {sigh(BX + 80, PY - 220 * PS, 1)}
        {/* 役人C: 長火鉢に突っ伏す */}
        <HmDYakunin x={CX2} y={lerp(PY, PY + 60, slump)} s={PS} f={f} face="sad" pose="hold" phase={5} lean={lerp(0, -40, slump)} />
        {sigh(CX2 - 160, PY - 200 * PS, 2)}
        {/* 長火鉢 (手前) */}
        <g>
          <rect x={380} y={700} width={1180} height={40} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={7} />
          <rect x={400} y={740} width={1140} height={200} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1].map((k) => (
            <g key={k}>
              <rect x={1150 + k * 0} y={760 + k * 80} width={360} height={64} rx={4} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={1330} cy={792 + k * 80} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 灰と炭 */}
          <rect x={560} y={704} width={540} height={22} rx={4} fill={C.ash} stroke={KRP.ink} strokeWidth={4} />
          {[640, 720, 800].map((cx, i) => (
            <g key={cx}>
              <ellipse cx={cx} cy={712} rx={30} ry={12} fill="#3A3230" stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={cx} cy={710} rx={18} ry={6} fill={C.ember} opacity={ember * (0.7 + 0.3 * Math.sin(f / 2 + i))} />
            </g>
          ))}
          {/* 五徳と鉄瓶 */}
          <path d="M 680 706 L 690 660 M 780 706 L 770 660" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 640 660 Q 640 590 730 588 Q 820 590 820 660 Q 730 676 640 660 Z" fill="#3E3A38" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 670 600 Q 730 520 790 600" stroke={KRP.ink} strokeWidth={7} fill="none" />
          <path d="M 820 630 l 40 -24" stroke="#3E3A38" strokeWidth={14} strokeLinecap="round" />
          {[0, 1].map((k) => {
            const t = ((f + k * 11) % 22) / 22;
            return <path key={k} d={`M ${866 + t * 10} ${600 - t * 70} q 14 -12 0 -26`} stroke={KRP.white} strokeWidth={6} fill="none" opacity={(1 - t) * 0.8} strokeLinecap="round" />;
          })}
          {/* 火箸 */}
          <line x1={880} y1={712} x2={920} y2={630} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
          <line x1={892} y1={712} x2={936} y2={634} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* 役人C の腕 (長火鉢の上に突っ伏す) */}
        <g opacity={slump}>
          <rect x={1120} y={672} width={220} height={36} rx={18} fill={C.tsume} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1170} y={690} width={240} height={36} rx={18} fill={C.tsume} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1120} cy={690} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1166} cy={712} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={1190 + k * 34} y1={560 + (k % 2) * 14} x2={1190 + k * 34} y2={610 + (k % 2) * 14}
              stroke={C.kimonoB} strokeWidth={5} strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(f / 4 + k)} />
          ))}
        </g>
        {/* たたんだ新聞と湯のみ (手前の畳) */}
        <g transform="rotate(-8 230 900)">
          <rect x={120} y={850} width={230} height={120} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={140} y1={872 + k * 24} x2={330} y2={872 + k * 24} stroke={KRP.gray} strokeWidth={5} />)}
          <rect x={140} y={862} width={70} height={40} fill={KRP.grayDark} opacity={0.5} />
        </g>
        <path d="M 1640 890 L 1700 890 L 1694 940 L 1646 940 Z" fill={C.kimonoB} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_059: (f) => <Hm059 f={f} />,
  hm_060: (f) => <Hm060 f={f} />,
  hm_061: (f) => <Hm061 f={f} />,
  hm_062: (f) => <Hm062 f={f} />,
  hm_063: (f) => <Hm063 f={f} />,
  hm_064: (f) => <Hm064 f={f} />,
  hm_065: (f) => <Hm065 f={f} />,
  hm_066: (f) => <Hm066 f={f} />,
  hm_067: (f) => <Hm067 f={f} />,
  hm_068: (f) => <Hm068 f={f} />,
  hm_069: (f) => <Hm069 f={f} />,
  hm_070: (f) => <Hm070 f={f} />,
};

export const HM_D_MOTIFS: string[] = [
  "hm_059", // #59
  "hm_060", // #60
  "hm_061", // #61
  "hm_062", // #62
  "hm_063", // #63
  "hm_064", // #64
  "hm_065", // #65
  "hm_066", // #66
  "hm_067", // #67
  "hm_068", // #68
  "hm_069", // #69
  "hm_070", // #70
];

export const himaDScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
