// 人は、なぜ暇をつぶすのか: 文#162〜#172 (11文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
  deskWood: "#B9874F",
  deskWoodDark: "#9E6F3E",
  labWall2: "#E4E7E0",
  labWallLine: "#CDD2C8",
  boardFrame: "#A9AFB5",
  boardWhite: "#FBFBF8",
  shelf: "#7A5A40",
  shelfDark: "#5A3F2C",
  coat: "#F4F4F0",
  coatDark: "#C9CDD0",
  student: "#3E4B7A",
  studentDark: "#2C365C",
  hairBack: "#2E2620",
  cloud: "#C9C4D6",
  cloudDark: "#A7A0BA",
  night: "#1E1C2C",
  film: "#2E2A28",
  filmFrame: "#E9DDBE",
  beam: "#FFF4C8",
  blush: "#F2A7A0",
  marker: "#3A5FA8",
  paperSheet: "#FFFDF6",
  brown: "#6E4526",
  shirt: "#CFE0F0",
  slacks: "#4A4F5E",
  tieNavy: "#2C3E78",
  tieGreen: "#3F7A5A",
  grayHair: "#C9C6C0",
  sc1: "#7FBF7A", sc2: "#9CC774", sc3: "#BACF6E", sc4: "#D8D468", sc5: "#F2CE4C",
  sc6: "#EFAE48", sc7: "#E98E44", sc8: "#DE673A", sc9: "#D3402E",
} as const;
const SCALE_COLS = [C.sc1, C.sc2, C.sc3, C.sc4, C.sc5, C.sc6, C.sc7, C.sc8, C.sc9];

// カメラ: (cx,cy) を中心に k 倍し、(dx,dy) ずらす
const cam = (cx: number, cy: number, k: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${k}) translate(${-cx} ${-cy})`;
// 0→1→0 の山
const bump = (f: number, a: number, b: number) => Math.sin(Math.PI * clamp01((f - a) / (b - a)));

// 研究室のホワイトボード (#168 と #171 は同じ研究室の同じボード)
//   内側 x 180〜1740, y 90〜770
const HmGcLabBoard: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={2000} height={1160} fill={C.labWall2} />
    <g stroke={C.labWallLine} strokeWidth={4}>
      {[90, 1830].map((px) => <line key={px} x1={px} y1={-40} x2={px} y2={840} />)}
    </g>
    {/* 床 */}
    <rect x={-40} y={840} width={2000} height={300} fill={HP.labFloor} />
    <g stroke={HP.labFloorLine} strokeWidth={4}>
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40 + i * 250} y1={840} x2={-300 + i * 320} y2={1120} />)}
    </g>
    <rect x={-40} y={830} width={2000} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    {/* ボード */}
    <rect x={150} y={60} width={1620} height={740} rx={14} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={8} />
    <rect x={180} y={90} width={1560} height={680} fill={C.boardWhite} stroke={KRP.ink} strokeWidth={4} />
    {/* 消し残しの跡 */}
    <g stroke={KRP.gray} strokeWidth={5} opacity={0.22} fill="none">
      <path d="M 260 140 q 120 -20 240 6" />
      <path d="M 1500 720 q 80 -14 190 4" />
    </g>
    {/* マーカー受けとマーカー */}
    <rect x={520} y={790} width={880} height={22} rx={6} fill="#9EA3A8" stroke={KRP.ink} strokeWidth={5} />
    {[[580, KRP.red], [660, C.marker], [740, KRP.ink]].map(([mx, c], i) => (
      <rect key={i} x={mx as number} y={776} width={62} height={18} rx={8} fill={c as string} stroke={KRP.ink} strokeWidth={3} />
    ))}
    {/* マグネットとクリップの紙 */}
    <rect x={1612} y={110} width={110} height={140} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
      transform={`rotate(${4 + Math.sin(f / 18) * 1.2} 1667 112)`} />
    {[0, 1, 2].map((i) => <line key={i} x1={1628} y1={150 + i * 26} x2={1700} y2={154 + i * 26} stroke={KRP.gray} strokeWidth={4} />)}
    <circle cx={1667} cy={114} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 豆電球 (好奇心の電球)。on 0〜1
const HmGcBulb: React.FC<{ x: number; y: number; s?: number; on: number; f: number }> = ({ x, y, s = 1, on, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {on > 0 && <circle r={90 + 10 * Math.sin(f / 3)} fill={HP.spark} opacity={0.35 * on} />}
    {on > 0 && Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      return <line key={i} x1={Math.cos(a) * 62} y1={Math.sin(a) * 62 - 6} x2={Math.cos(a) * (62 + 34 * on)} y2={Math.sin(a) * (62 + 34 * on) - 6}
        stroke={HP.spark} strokeWidth={9} strokeLinecap="round" opacity={on} />;
    })}
    <path d="M -36 -10 A 44 44 0 1 1 36 -10 Q 22 14 20 34 L -20 34 Q -22 14 -36 -10 Z"
      fill={on > 0.3 ? HP.spark : KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -10 30 L -10 8 Q 0 -8 10 8 L 10 30" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -20 -26 q 6 -16 20 -18" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
    <rect x={-22} y={34} width={44} height={26} rx={5} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-22} y1={46} x2={22} y2={46} stroke={HP.brassDark} strokeWidth={3} />
    <rect x={-12} y={60} width={24} height={10} rx={4} fill={KRP.ink} />
  </g>
);

// 後頭部 (後ろ姿の人の顔を隠す)。Person と同じ x,y,s,f,phase を渡す
const HmGcBackHead: React.FC<{ x: number; y: number; s: number; f: number; phase?: number }> = ({ x, y, s, f, phase = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={-62} cy={-224} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={62} cy={-224} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-228} r={66} fill={C.hairBack} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -30 -270 q 30 -16 60 0" stroke="#4A3E34" strokeWidth={5} fill="none" />
      <path d="M -40 -180 q 40 14 80 0" stroke="#4A3E34" strokeWidth={4} fill="none" />
    </g>
  );
};
void HmGcLabBoard; void HmGcBulb; void HmGcBackHead; void bump; void cam; void SCALE_COLS;
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
// #162 暇のものさしに、4つ目の目盛り、「秒」が刻まれました。
// 格: 山 / seed 5162
// 絵: どこ: 前半と同じ作業机。演出: Monosashi の lit が f で 3→4。のみが「秒」の細かい40本の目盛りを**ものすごい速さで**刻んでいき (火花がたくさん)、刻み終わると札が藍に。区画の上に小さなスマホがぽんと乗る。捜索係が目を回す。動き: f0-34 刻む (速く) / 札が塗られる / 目が回る
// どこ: 前半と同じ作業机 (Sagyozukue)。ものさしは (960,560,s=1)
// 演出: のみが「秒」の区画の40本を猛スピードで刻む (火花の嵐・木くずが飛ぶ)。刻み終わると札が藍に塗られて光り、
//       区画の上に小さなスマホがぽんと乗る。右手前の捜索係は速さについていけず目がぐるぐる・頭の上を星が回る
// 動き: f0-34 刻む (カメラは「秒」の区画に寄っている) / f34 札が藍に + 光の輪 / f34-42 スマホが乗る・カメラが引く / 目が回る
const Hm162: React.FC<{ f: number }> = ({ f }) => {
  const cut = easeInOut(seg(f, 0, 34));
  const lit = 3 + cut;
  const done = f >= 34;
  // 刃先の位置 (画面の座標)
  const chx = 960 + 370 + 310 * cut, chy = 529;
  // カメラ: 最初は「秒」に寄っていて、刻み終わると引く
  const pull = easeOut(seg(f, 32, 42));
  const k = lerp(1.32, 1.0, pull);
  const camT = cam(1420, 560, k, lerp(-300, 0, pull), 0);
  const flash = done ? bump(f, 34, 44) : 0;
  const phonePop = pop(seg(f, 35, 42));
  const [sx, sy] = monoSlot(3, 960, 560, 1);
  // 捜索係
  const sX = 1690, sY = 962, sS = 0.74;
  const sBob = Math.sin((f + 3 * 17) / 13) * 3;
  const dizzy = seg(f, 10, 22);
  const shake = !done ? Math.sin(f * 2.3) * 4 : 0;
  return (
    <Frame f={f} seed={5162}>
      <g transform={camT}>
        <Sagyozukue f={f} />
        <Monosashi x={960} y={560} s={1} lit={lit} f={f} />
        {/* 刻んでいる最中: 火花の嵐・木くず・速さの線 */}
        {!done && (
          <g transform={`translate(${shake * 0.3} 0)`}>
            {Array.from({ length: 14 }, (_, j) => {
              const life = ((f * 1.7 + j * 5.3) % 9) / 9;
              const a = (-170 + rnd(5162, j) * 160) * Math.PI / 180;
              const d = 20 + life * (60 + rnd(51, j) * 70);
              return (
                <circle key={j} cx={chx + Math.cos(a) * d} cy={chy - 40 + Math.sin(a) * d + life * life * 40}
                  r={(1 - life) * 7 + 2} fill={HP.spark} stroke={KRP.ink} strokeWidth={1.5} opacity={1 - life * 0.6} />
              );
            })}
            {Array.from({ length: 6 }, (_, j) => {
              const life = ((f * 1.3 + j * 7) % 12) / 12;
              return (
                <path key={`c${j}`} d="M -8 -3 Q 0 -9 8 -3 Q 0 2 -8 -3 Z" fill={HP.woodMid} stroke={KRP.ink} strokeWidth={2}
                  transform={`translate(${chx - 30 - life * 120} ${chy - 30 - life * 90 + life * life * 160}) rotate(${life * 400 + j * 60})`} />
              );
            })}
            {/* 速さの線 (のみのうしろ) */}
            {[0, 1, 2].map((j) => (
              <line key={`s${j}`} x1={chx - 40 - j * 10} y1={chy - 110 + j * 26} x2={chx - 150 - j * 30} y2={chy - 110 + j * 26}
                stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
            ))}
            {/* のみを打つ金づち (小さく速く) */}
            <g transform={`translate(${chx + 4} ${chy - 140}) rotate(${-20 + 18 * Math.abs(Math.sin(f * 1.4))})`}>
              <rect x={-6} y={-90} width={14} height={90} rx={5} fill="#A06A3C" stroke={KRP.ink} strokeWidth={4} />
              <rect x={-30} y={-110} width={60} height={30} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        )}
        {/* 刻み終わり: 「秒」の札のまわりに光の輪 */}
        {flash > 0 && (
          <g opacity={flash}>
            <circle cx={1485} cy={685} r={90 + 60 * (1 - flash)} fill="none" stroke={HP.byo} strokeWidth={10} />
            {Array.from({ length: 10 }, (_, j) => {
              const a = (j * 36 * Math.PI) / 180;
              return <line key={j} x1={1485 + Math.cos(a) * 100} y1={685 + Math.sin(a) * 60} x2={1485 + Math.cos(a) * 150} y2={685 + Math.sin(a) * 92}
                stroke={HP.spark} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 区画の上にスマホがぽんと乗る */}
        {phonePop > 0 && (
          <g transform={`translate(${sx} ${sy}) scale(${phonePop}) translate(${-sx} ${-sy})`}>
            <ellipse cx={sx} cy={sy + 2} rx={42} ry={8} fill={KRP.ink} opacity={0.25} />
            <Sumaho x={sx} y={sy - 46} s={0.31} f={f} screen="on" glow={0.8} />
          </g>
        )}
        {/* 捜索係: 目が回る */}
        <Sousa x={sX} y={sY} s={sS} f={f} face="surprised" lean={-4} lensAt={[1560, 700]} />
        <g transform={`translate(${sX} ${sY + sBob}) scale(${sS}) rotate(-4)`} opacity={dizzy}>
          {[-24, 24].map((ex) => (
            <g key={ex} transform={`translate(${ex} -222) rotate(${f * 24 * (ex < 0 ? 1 : -1)})`}>
              <circle r={17} fill={KRP.white} />
              <path d="M 0 0 m -2 0 a 2 2 0 1 1 4 0 a 5 5 0 1 1 -9 0 a 9 9 0 1 1 17 0 a 13 13 0 1 1 -24 1"
                fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
            </g>
          ))}
          {/* 頭の上を回る星 */}
          {[0, 1, 2].map((j) => {
            const a = f / 5 + (j * 2 * Math.PI) / 3;
            return (
              <path key={j} d="M 0 -16 L 5 -5 L 16 -4 L 8 4 L 10 16 L 0 10 L -10 16 L -8 4 L -16 -4 L -5 -5 Z"
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3}
                transform={`translate(${Math.cos(a) * 90} ${-350 + Math.sin(a) * 22}) scale(${1.2 + 0.3 * Math.sin(a)})`} />
            );
          })}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #163 でも、ここで素朴な疑問がわきます。
// 格: 並 / seed 5163
// 絵: どこ: 作業机の前 (#162 の続き)。演出: 捜索係が、刻み終わったものさしの前で腕組みして考えこむ。頭の上に「?」の雲が**もくもく**と大きくなる。机の上のランプがぱちっと点滅。動き: 「?」の雲がふくらむ / ランプ / 腕組み
// どこ: #162 と同じ作業机。カメラは少し上に振って、机の手前に立つ捜索係を大きく入れる
// 演出: 4つ刻み終わったものさしの前で、捜索係が腕組みして首をかしげる。頭の上から「?」の雲がもくもく湧いて、
//       ものさしの半分を隠すほど大きくなる。机のランプが「ぱちっ」と2回点滅 (ひらめきそうで、ひらめかない)
// 動き: 腕組み + 首かしげ (lean) / 雲のもくもくが f4→f40 で1つずつ増えてふくらむ / ランプ f18・f27 / カメラがゆっくり寄る
const Hm163: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const tiltHead = -5 + Math.sin(f / 14) * 2;
  const grow = easeOut(seg(f, 4, 40));
  // 雲のもくもく (中心 1240,300)
  const puffs: [number, number, number][] = [
    [1090, 470, 40], [1160, 420, 52], [1150, 330, 74], [1260, 260, 92], [1390, 300, 84],
    [1440, 390, 70], [1330, 400, 80], [1220, 360, 90], [1030, 250, 58], [1500, 230, 60],
  ];
  const blink = (f >= 18 && f < 21) || (f >= 27 && f < 30);
  return (
    <Frame f={f} seed={5163}>
      <g transform={cam(960, 700, k, 0, 0)}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.deskWood} />
        <g transform="translate(0 -120)">
          <Sagyozukue f={f} />
          <Monosashi x={960} y={560} s={1} lit={4} f={f} />
          {/* ランプが「ぱちっ」 */}
          {blink && (
            <g>
              <circle cx={104} cy={338} r={60} fill={HP.spark} opacity={0.6} />
              {[0, 1, 2, 3, 4].map((j) => {
                const a = ((-150 + j * 40) * Math.PI) / 180;
                return <line key={j} x1={104 + Math.cos(a) * 46} y1={338 + Math.sin(a) * 46} x2={104 + Math.cos(a) * 90} y2={338 + Math.sin(a) * 90}
                  stroke={HP.spark} strokeWidth={8} strokeLinecap="round" />;
              })}
            </g>
          )}
          {!blink && f > 18 && <circle cx={104} cy={338} r={18} fill={KRP.ink} opacity={0.25} />}
        </g>
        {/* 机に置いた虫めがね (腕組みしているので手放している) */}
        <g transform="rotate(-18 600 760)">
          <rect x={430} y={750} width={130} height={22} rx={10} fill={C.brown} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={610} cy={761} r={50} fill={HP.screenCore} opacity={0.5} />
          <circle cx={610} cy={761} r={50} fill="none" stroke={HP.brass} strokeWidth={12} />
          <circle cx={610} cy={761} r={50} fill="none" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 捜索係 (腕組み・首かしげ・目は雲のほうを見上げる) */}
        <Sousa x={960} y={985} s={0.86} f={f} face="worried" pose="armsFolded" lean={tiltHead} gaze={[8, -8]} lens={false} />
        {/* 汗のしずく */}
        <path d={`M 1036 ${742 + (f % 30) * 0.6} q 10 16 0 24 q -10 -8 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        {/* 「?」の雲: もくもく */}
        <g>
          {[[1010, 690, 12], [1050, 620, 20]].map(([bx, by, br], i) => (
            <circle key={i} cx={bx} cy={by} r={br * pop(seg(f, 2 + i * 2, 8 + i * 2))} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          ))}
          {puffs.map(([px, py, pr], i) => {
            const t = pop(seg(f, 6 + i * 3, 14 + i * 3));
            const wob = 1 + 0.04 * Math.sin(f / 6 + i);
            return t > 0 ? <circle key={i} cx={lerp(1240, px, 0.4 + 0.6 * grow)} cy={lerp(360, py, 0.4 + 0.6 * grow)} r={pr * t * wob}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} /> : null;
          })}
          {/* 線の内側を白で消して、ひとかたまりの雲に */}
          {puffs.map(([px, py, pr], i) => {
            const t = pop(seg(f, 6 + i * 3, 14 + i * 3));
            return t > 0 ? <circle key={`w${i}`} cx={lerp(1240, px, 0.4 + 0.6 * grow)} cy={lerp(360, py, 0.4 + 0.6 * grow)} r={Math.max(pr * t - 6, 0)}
              fill={KRP.white} /> : null;
          })}
          <QMark x={1250} y={380} s={0.8 + 0.9 * grow} f={f} t={seg(f, 10, 22)} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #164 人は、なぜそこまでして、暇をつぶすのでしょうか。
// 格: 山 / seed 5164
// 絵: どこ: #14 と同じ「あなた」の夜の部屋 (ソファ・テレビ・観葉植物)。演出: ソファの「あなた」の頭上に、これまで出てきた暇つぶし (本・すごろく・カセット・スマホ) が**ぐるぐる回る**輪。その真ん中に「?」。「あなた」はきょとん。動き: 輪が回る / 「?」がゆれる
// どこ: #14 と同じ「あなた」の夜の部屋 (YoruNoHeya)。ソファに「あなた」(橙のパーカー)
// 演出: 「あなた」の頭の上で、これまでの暇つぶし (本・すごろく・カセット・スマホ) が土星の輪のようにぐるぐる回る。
//       輪の真ん中に大きな「?」。「あなた」は上を見上げてきょとん (口を小さく)。手元のスマホは置いたまま
// 動き: 輪が回る (奥の物は小さく・手前は大きく) / 「?」がゆれる / カメラがゆっくり下から上へ / 時計の秒針
const HmGcBook: React.FC = () => (
  <g>
    <path d="M -70 -46 Q -36 -58 0 -44 Q 36 -58 70 -46 L 70 40 Q 36 28 0 42 Q -36 28 -70 40 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <line x1={0} y1={-44} x2={0} y2={42} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2].map((i) => <line key={i} x1={-58} y1={-24 + i * 20} x2={-12} y2={-28 + i * 20} stroke={KRP.gray} strokeWidth={4} />)}
    {[0, 1, 2].map((i) => <line key={`r${i}`} x1={12} y1={-28 + i * 20} x2={58} y2={-24 + i * 20} stroke={KRP.gray} strokeWidth={4} />)}
    <path d="M -74 40 Q -36 30 0 46 Q 36 30 74 40 L 74 50 Q 36 40 0 56 Q -36 40 -74 50 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const HmGcSugoroku: React.FC = () => (
  <g>
    <rect x={-72} y={-52} width={144} height={104} rx={8} fill="#E9D3A2" stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-60 + i * 20} y={-40} width={18} height={18} fill={i % 2 ? KRP.white : HP.restSoft} stroke={KRP.ink} strokeWidth={2} />
    ))}
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={`b${i}`} x={-60 + i * 20} y={22} width={18} height={18} fill={i % 2 ? HP.restSoft : KRP.white} stroke={KRP.ink} strokeWidth={2} />
    ))}
    <rect x={-60} y={-22} width={18} height={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
    <rect x={-8} y={-14} width={30} height={30} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 7 1)" />
    <circle cx={7} cy={1} r={5} fill={KRP.red} />
    <circle cx={44} cy={0} r={9} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const HmGcCassette: React.FC = () => (
  <g>
    <rect x={-70} y={-44} width={140} height={88} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-56} y={-34} width={112} height={40} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-56} y={-34} width={112} height={12} fill={KRP.orange} />
    <rect x={-34} y={-14} width={68} height={18} rx={9} fill={KRP.ink} />
    <circle cx={-20} cy={-5} r={7} fill={KRP.white} />
    <circle cx={20} cy={-5} r={7} fill={KRP.white} />
    <path d="M -40 44 L -30 22 L 30 22 L 40 44" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Hm164: React.FC<{ f: number }> = ({ f }) => {
  const ringT = easeOut(seg(f, 2, 18));
  const rot = f * 0.075 + 0.6;
  const items = [0, 1, 2, 3].map((i) => {
    const a = rot + (i * Math.PI) / 2;
    return { i, a, x: 860 + Math.cos(a) * 360 * ringT, y: 250 + Math.sin(a) * 100 * ringT, d: Math.sin(a) };
  }).sort((p, q) => p.d - q.d);
  const drawItem = (i: number) =>
    i === 0 ? <HmGcBook /> : i === 1 ? <HmGcSugoroku /> : i === 2 ? <HmGcCassette /> : (
      <Sumaho x={0} y={0} s={0.36} f={f} screen="feed" glow={0.5} />
    );
  const camY = lerp(40, 0, easeInOut(seg(f, 0, 42)));
  const k = lerp(1.04, 1.0, easeInOut(seg(f, 0, 42)));
  const qT = seg(f, 10, 24);
  return (
    <Frame f={f} seed={5164} dark>
      <g transform={cam(960, 540, k, 0, camY)}>
        <YoruNoHeya f={f} tv />
        {/* テレビの光がソファを照らす */}
        <polygon points="1316,346 1316,574 760,780 700,520" fill={HP.screen} opacity={0.08 + 0.03 * Math.sin(f * 1.3)} />
        {/* 輪の軌道 (奥半分) */}
        <ellipse cx={860} cy={250} rx={360 * ringT} ry={100 * ringT} fill="none" stroke={HP.spark} strokeWidth={5}
          strokeDasharray="14 16" strokeDashoffset={-f * 3} opacity={0.55 * ringT} />
        {/* 奥にある物 */}
        {items.filter((p) => p.d < 0).map((p) => (
          <g key={p.i} transform={`translate(${p.x} ${p.y}) scale(${(0.78 + 0.22 * p.d) * ringT * 1.3}) rotate(${Math.sin(f / 9 + p.i) * 8})`} opacity={0.85}>
            {drawItem(p.i)}
          </g>
        ))}
        {/* 真ん中の「?」 */}
        <g transform={`rotate(${Math.sin(f / 7) * 10} 860 230)`}>
          <circle cx={860} cy={200} r={70 * pop(qT)} fill={HP.spark} opacity={0.25} />
          <QMark x={860} y={245} s={1.25} f={f} t={qT} color={KRP.yellow} />
        </g>
        {/* 「あなた」 */}
        <Person x={860} y={758} s={1.05} f={f} pose="sit" face="surprised" gaze={[0, -10]} cloth={HP.you} clothDark={HP.youDark} hair="cap" />
        {/* きょとんの「・・・」 */}
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={940 + j * 22} cy={446 - j * 10} r={6} fill={KRP.white}
            opacity={seg(f, 14 + j * 4, 18 + j * 4)} />
        ))}
        {/* ソファに置いたスマホ (画面を下に) */}
        <rect x={1030} y={672} width={110} height={30} rx={8} fill={KRP.ink} transform="rotate(-6 1085 687)" />
        <YoruNoHeyaFront />
        {/* 手前にある物 (人より手前を通る) */}
        {items.filter((p) => p.d >= 0).map((p) => (
          <g key={p.i} transform={`translate(${p.x} ${p.y}) scale(${(0.78 + 0.22 * p.d) * ringT * 1.3}) rotate(${Math.sin(f / 9 + p.i) * 8})`}>
            {drawItem(p.i)}
          </g>
        ))}
        {/* 回る勢いの線 */}
        {ringT > 0.5 && [0, 1].map((j) => {
          const a = rot + j * Math.PI + 0.5;
          return <path key={j} d={`M ${860 + Math.cos(a) * 300} ${250 + Math.sin(a) * 84} A 330 92 0 0 1 ${860 + Math.cos(a + 0.5) * 330} ${250 + Math.sin(a + 0.5) * 92}`}
            stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round" />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #165 第7章、退屈の、正体。
// 格: 山 / seed 5165
// 絵: 章扉。どこ: ShockRoom (minutes=15・誰もいない・夜の照明で少し暗い)。演出: 部屋の真ん中に、**暇の雲 (#15 の雲) に虫めがねを当てる**と、雲の中に小さな警報ベルの影が透けて見える (正体の予告)。ChapterDoor num=7 title="退屈の、正体。" を右に。動き: 虫めがねが動く / ベルの影 / 秒針
// どこ: ShockRoom (minutes=15)。誰もいない夜の実験室。蛍光灯は消えて、窓のない部屋に非常灯の薄明かりだけ
// 演出: 部屋の左寄りに「暇の雲」がぽっかり浮かぶ。大きな虫めがねが雲の上をすべってきて、レンズの中だけ雲が透け、
//       中に警報ベルの影が見える (正体の予告)。ベルはレンズの中で小さく「リリ」と震える。右に章扉
// 動き: 虫めがねが左から雲の真ん中へ / ベルの影が震える / 壁時計の秒針 / 雲がふわふわ / 章扉 f4-20
const HmGcCloud: React.FC<{ f: number; fill?: string }> = ({ f, fill = C.cloud }) => {
  const puffs: [number, number, number][] = [
    [-230, 30, 110], [-110, -50, 150], [60, -80, 165], [220, -20, 130], [270, 70, 100], [-20, 60, 150], [-260, 100, 80], [140, 90, 120],
  ];
  return (
    <g transform={`translate(0 ${Math.sin(f / 16) * 8})`}>
      {puffs.map(([px, py, r], i) => <circle key={i} cx={px} cy={py} r={r + Math.sin(f / 10 + i) * 3} fill={fill} stroke={KRP.ink} strokeWidth={7} />)}
      {puffs.map(([px, py, r], i) => <circle key={`w${i}`} cx={px} cy={py} r={r - 7 + Math.sin(f / 10 + i) * 3} fill={fill} />)}
      <path d="M -300 150 Q 0 200 330 150" stroke={C.cloudDark} strokeWidth={14} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M -150 -150 q 60 -40 140 -20" stroke={KRP.white} strokeWidth={12} fill="none" opacity={0.5} strokeLinecap="round" />
    </g>
  );
};
const HmGcBell: React.FC<{ f: number; fill: string; stroke: string }> = ({ f, fill, stroke }) => {
  const rr = Math.sin(f * 1.6) * 6;
  return (
    <g transform={`rotate(${rr} 0 -60)`}>
      <rect x={-12} y={-150} width={24} height={40} rx={6} fill={fill} stroke={stroke} strokeWidth={5} />
      <path d="M -90 50 Q -90 -110 0 -112 Q 90 -110 90 50 L 110 70 L -110 70 Z" fill={fill} stroke={stroke} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={0} cy={92} r={22} fill={fill} stroke={stroke} strokeWidth={6} />
      {[-1, 1].map((sd) => (
        <g key={sd} stroke={stroke} strokeWidth={7} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(f * 0.8))}>
          <line x1={sd * 130} y1={-60} x2={sd * 165} y2={-80} />
          <line x1={sd * 140} y1={0} x2={sd * 180} y2={0} />
        </g>
      ))}
    </g>
  );
};
const Hm165: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const mv = easeInOut(seg(f, 0, 30));
  const lx = lerp(180, 610, mv) + Math.sin(f / 9) * 6;
  const ly = lerp(560, 430, mv) + Math.cos(f / 11) * 5;
  const LR = 170;
  const reveal = seg(f, 14, 30);
  const k = lerp(1.06, 1.0, easeOut(seg(f, 0, 40)));
  return (
    <Frame f={f} seed={5165} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={7} title="退屈の、正体。" t={door} left={1000} top={560} />
      </>}>
      <g transform={cam(600, 450, k)}>
        <ShockRoom f={f} minutes={15} lamp={false} />
        {/* 夜: 部屋全体を暗く */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.night} opacity={0.5} />
        {/* 非常灯 (ドアの上の緑のランプ) とその光 */}
        <rect x={220} y={110} width={100} height={30} rx={6} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="220,140 320,140 470,700 70,700" fill={KRP.green} opacity={0.07 + 0.02 * Math.sin(f / 5)} />
        {/* 壁時計だけは見えるように、うっすら照らす */}
        <circle cx={1500} cy={260} r={150} fill={KRP.white} opacity={0.12} />
        {/* 暇の雲 */}
        <g transform="translate(600 430)">
          <HmGcCloud f={f} />
          {/* 雲の中のベルの影 (外からはほんのり) */}
          <g opacity={0.12 * reveal} transform="scale(0.9)">
            <HmGcBell f={f} fill={C.cloudDark} stroke={C.cloudDark} />
          </g>
        </g>
        {/* 虫めがね: レンズの中だけ雲が透けてベルが見える */}
        <defs>
          <clipPath id="hmgc165lens"><circle cx={lx} cy={ly} r={LR} /></clipPath>
        </defs>
        <g clipPath="url(#hmgc165lens)">
          <circle cx={lx} cy={ly} r={LR} fill={HP.screenCore} opacity={0.35} />
          <g transform="translate(600 430)">
            <g opacity={0.35}><HmGcCloud f={f} fill={KRP.white} /></g>
            <g opacity={reveal} transform="scale(0.9)">
              <HmGcBell f={f} fill={KRP.yellow} stroke={KRP.ink} />
            </g>
          </g>
        </g>
        <g>
          <circle cx={lx} cy={ly} r={LR} fill="none" stroke={HP.brass} strokeWidth={22} />
          <circle cx={lx} cy={ly} r={LR + 11} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={lx} cy={ly} r={LR - 11} fill="none" stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${lx - 110} ${ly - 70} q 40 -60 110 -70`} stroke={KRP.white} strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />
          <line x1={lx + LR * 0.7} y1={ly + LR * 0.7} x2={lx + LR * 0.7 + 150} y2={ly + LR * 0.7 + 150}
            stroke={C.brown} strokeWidth={40} strokeLinecap="round" />
          <line x1={lx + LR * 0.7 + 10} y1={ly + LR * 0.7 + 4} x2={lx + LR * 0.7 + 140} y2={ly + LR * 0.7 + 134}
            stroke="#8A5A34" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #166 最初の、電気ショックの実験。じつは、続きがあります。
// 格: 山 / seed 5166
// 絵: どこ: ShockRoom (minutes=15)。演出: 序の場面がフィルムのコマ (映写機の光) で巻き戻される比喩: 部屋の上に古いフィルムのコマが帯で流れ、最後のコマの先に「続き」の白い空きコマ (矢印つき)。学生が部屋から出ていく背中。動き: フィルムが流れる / 学生が出ていく / 空きコマが光る
// どこ: ShockRoom (minutes=15)。実験が終わった直後の部屋。ドアが開いている
// 演出: 部屋の上に、古い映写機から伸びたフィルムの帯がカタカタ流れてくる。コマには序の場面 (椅子に座る学生・赤いボタン・
//       15分の時計・稲妻) が並び、最後のコマの先に、まだ何も写っていない白い空きコマ。空きコマがぴかっと光り、矢印が指す。
//       下では学生が、実験を終えて開いたドアから出ていく (背中)
// 動き: フィルムが左から流れてきて f30 で止まる / 映写機のリールが回る / 学生がドアへ歩く / 空きコマが光る f30-42
const HmGcFilmCell: React.FC<{ kind: number; f: number }> = ({ kind, f }) => (
  <g>
    <rect x={-80} y={-60} width={160} height={120} rx={6} fill={kind < 0 ? KRP.white : C.filmFrame} stroke={KRP.ink} strokeWidth={4} />
    {kind === 0 && (
      <g>
        <rect x={-36} y={0} width={60} height={12} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-36} y={-36} width={14} height={40} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={0} cy={-26} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-12} y={-12} width={24} height={20} rx={5} fill={C.student} stroke={KRP.ink} strokeWidth={3} />
      </g>
    )}
    {kind === 1 && (
      <g>
        <circle r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 0 0 L 0 -36 A 36 36 0 0 1 36 0 Z" fill={KRP.red} opacity={0.4} />
        <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${Math.floor(f / 30) * 6})`} />
      </g>
    )}
    {kind === 2 && (
      <g>
        <rect x={-46} y={-6} width={92} height={34} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={0} cy={-6} rx={22} ry={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 30 -46 l -12 20 l 12 0 l -12 20" stroke={HP.spark} strokeWidth={6} fill="none" strokeLinejoin="round" />
        <path d="M 30 -46 l -12 20 l 12 0 l -12 20" stroke={KRP.ink} strokeWidth={2} fill="none" strokeLinejoin="round" />
      </g>
    )}
    {kind === 3 && (
      <g>
        <rect x={-70} y={-50} width={140} height={100} fill="#D8D2C2" opacity={0.6} />
        <rect x={-50} y={-44} width={34} height={88} fill="#D8D2C2" stroke={KRP.ink} strokeWidth={3} />
        <circle cx={20} cy={-20} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={8} y={-6} width={24} height={30} rx={5} fill={C.student} stroke={KRP.ink} strokeWidth={3} />
      </g>
    )}
  </g>
);
const Hm166: React.FC<{ f: number }> = ({ f }) => {
  const run = easeOut(seg(f, 0, 30));
  const stripX = lerp(-900, 0, run); // 0 で止まる
  const stopped = f >= 30;
  const glow = seg(f, 30, 40);
  const cellW = 180;
  const kinds = [0, 1, 2, 0, 1, 2, 3, -1]; // 最後が空きコマ
  const startX = 1260 - cellW * (kinds.length - 1); // 空きコマの中心が x=1260
  const walk = easeInOut(seg(f, 0, 42));
  const stX = lerp(560, 300, walk);
  const stY = 712;
  const step = Math.sin(f / 3.2) * 4;
  return (
    <Frame f={f} seed={5166}>
      <ShockRoom f={f} minutes={15} />
      {/* 開いたドア: 廊下の明かりと、手前に開いた扉 */}
      <rect x={140} y={150} width={260} height={540} fill="#F6EBC8" stroke={KRP.ink} strokeWidth={7} />
      <polygon points="140,690 400,690 520,1000 20,1000" fill="#F6EBC8" opacity={0.35} />
      <rect x={150} y={600} width={240} height={90} fill="#E4D6AE" />
      <polygon points="400,150 520,110 520,740 400,690" fill="#D8D2C2" stroke={KRP.ink} strokeWidth={7} />
      <circle cx={498} cy={430} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {/* 出ていく学生 (背中) */}
      <g transform={`translate(0 ${-Math.abs(step) * 0.6})`}>
        <Person x={stX} y={stY} s={0.95} f={f} face="normal" cloth={C.student} clothDark={C.studentDark} hair="cap" phase={2} />
        <HmGcBackHead x={stX} y={stY} s={0.95} f={f} phase={2} />
      </g>
      {/* 映写機 (左上) と光 */}
      <polygon points="190,120 1400,40 1400,230" fill={C.beam} opacity={0.22} />
      <g transform="translate(130 120)">
        <rect x={-70} y={-30} width={150} height={80} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={80} y={-10} width={40} height={40} rx={6} fill={KRP.ink} />
        {[-30, 40].map((rx, i) => (
          <g key={i} transform={`translate(${rx} -70) rotate(${(stopped ? 30 : f) * 14})`}>
            <circle r={48} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2].map((j) => <circle key={j} cx={Math.cos(j * 2.09) * 26} cy={Math.sin(j * 2.09) * 26} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
            <circle r={8} fill={KRP.ink} />
          </g>
        ))}
      </g>
      {/* フィルムの帯 */}
      <g transform={`translate(${stripX} 0)`}>
        <rect x={startX - 100} y={52} width={cellW * kinds.length + 20} height={176} fill={C.film} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: kinds.length * 4 }, (_, j) => (
          <g key={j}>
            <rect x={startX - 92 + j * 45} y={60} width={22} height={14} rx={3} fill={KRP.cream} />
            <rect x={startX - 92 + j * 45} y={206} width={22} height={14} rx={3} fill={KRP.cream} />
          </g>
        ))}
        {kinds.map((kd, i) => (
          <g key={i} transform={`translate(${startX + i * cellW} 140)`}>
            <HmGcFilmCell kind={kd} f={f} />
          </g>
        ))}
        {/* 空きコマが光る */}
        <g opacity={glow}>
          <rect x={1260 - 92} y={68} width={184} height={144} rx={10} fill="none" stroke={HP.spark} strokeWidth={10} />
          <circle cx={1260} cy={140} r={70 + 10 * Math.sin(f / 3)} fill={HP.spark} opacity={0.3} />
          <QMark x={1260} y={176} s={0.8} f={f} t={glow} color={KRP.red} />
        </g>
      </g>
      {/* 動いているときのカタカタ線 */}
      {!stopped && [0, 1].map((j) => (
        <line key={j} x1={300 + j * 300} y1={240 + j * 6} x2={420 + j * 300} y2={240 + j * 6} stroke={KRP.ink} strokeWidth={5} opacity={0.4} strokeLinecap="round" />
      ))}
      {/* 空きコマを指す矢印 (下から) */}
      <Arrow x={1260} y={250} s={0.8} rot={-90} t={seg(f, 32, 40)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #167 別の研究者たちが、結果を見直しました。
// 格: 山 / seed 5167
// 絵: どこ: 大学の研究室 (ShockRoom ではなく、部屋の外の研究室。本棚・資料の山・パソコン・ホワイトボード)。演出: 3人の研究者 (一般人・白衣) が、机の上の実験の記録の束を虫めがね・赤ペンで見直す。1人が資料の束を持ち上げて光にかざす。動き: 資料をめくる / 赤ペン / 光にかざす
// どこ: 大学の研究室 (実験室の外)。左に本棚、奥に窓 (昼の光)、右奥にホワイトボード、手前に大きな机。机の上は記録の束の山とパソコン
// 演出: 白衣の研究者3人が記録を見直す。左は虫めがねで紙をのぞき、真ん中は紙の束を窓の光にかざして透かし、
//       右は赤ペンで印をつけていく。左の山の紙がぱらぱらめくれる。机のパソコンには記録の表
// 動き: 紙がめくれる (左の山) / 赤ペンの丸が増える / かざした紙が光る f16- / カメラがゆっくり右へパン
// 第1回修正: 3人を研究者らしい格好に (膝までの白衣・シャツとネクタイ・襟・胸ポケットのペン2本・めがね (左は丸)・名札・右はクリップボード)。腰の下まで見える構図
const HmGcPaperStack: React.FC<{ x: number; y: number; n: number; rot?: number }> = ({ x, y, n, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-90 + (i % 2) * 4} y={-i * 9} width={180} height={12} rx={2}
        fill={i % 3 === 0 ? KRP.white : C.paperSheet} stroke={KRP.ink} strokeWidth={3} />
    ))}
    <rect x={-60} y={-n * 9 - 2} width={22} height={n * 9} fill={KRP.yellow} opacity={0.6} />
  </g>
);
// 白衣 (膝まで・前を開けて中にシャツとネクタイ)。Person の上に重ねる。x,y,s,f,phase は Person と同じ値を渡す
//   arms: "hold" = Person の hold の前腕を白衣の上に描き直す / "clip" = クリップボード+赤ペン / "hang" = 左腕を垂らす (raise の人)
const HmGcLabCoat: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; tie: string;
  arms: "hold" | "clip" | "hang"; marks?: number; tag?: boolean;
}> = ({ x, y, s, f, phase = 0, tie, arms, marks = 0, tag = true }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const sleeve = (a: [number, number], b: [number, number], hand = true) => {
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return (
      <g>
        <rect x={a[0]} y={a[1] - 11} width={len} height={22} rx={11} fill={C.coat} stroke={KRP.ink} strokeWidth={4.5}
          transform={`rotate(${ang} ${a[0]} ${a[1]})`} />
        {hand && <circle cx={b[0]} cy={b[1]} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
      </g>
    );
  };
  // 赤ペンの先: 4行の行頭に丸を描いていく。いま描いている行の上でくるくる回る
  const row = Math.min(marks, 3);
  const tip: [number, number] = [-24 + Math.cos(f * 0.9) * 8, -80 + row * 20 + Math.sin(f * 0.9) * 5];
  const penHand: [number, number] = [tip[0] + 20, tip[1] - 34];
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 白衣の身ごろ (膝まで) */}
      <path d="M -40 -163 L 40 -163 Q 62 -162 63 -140 L 74 -32 Q 75 -22 64 -22 L -64 -22 Q -75 -22 -74 -32 L -63 -140 Q -62 -162 -40 -163 Z"
        fill={C.coat} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 脇のしわ */}
      <g stroke={C.coatDark} strokeWidth={4} fill="none" strokeLinecap="round">
        <path d="M -52 -110 Q -56 -80 -60 -40" />
        <path d="M 52 -110 Q 56 -80 60 -40" />
      </g>
      {/* 前の開き: シャツ → ベルト → ズボン */}
      <polygon points="-3,-98 3,-98 8,-64 -8,-64" fill={C.shirt} />
      <rect x={-9} y={-64} width={18} height={6} fill={KRP.ink} />
      <polygon points="-9,-58 9,-58 14,-22 -14,-22" fill={C.slacks} />
      <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
        <line x1={-3} y1={-98} x2={-14} y2={-23} />
        <line x1={3} y1={-98} x2={14} y2={-23} />
      </g>
      {/* 胸元の V: シャツとネクタイ */}
      <polygon points="-24,-163 24,-163 0,-98" fill={C.shirt} stroke={KRP.ink} strokeWidth={3} />
      <polygon points="-17,-165 -2,-153 -11,-146" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      <polygon points="17,-165 2,-153 11,-146" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      <polygon points="-6,-156 6,-156 4,-146 -4,-146" fill={tie} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      <polygon points="-4,-146 4,-146 8,-114 0,-104 -8,-114" fill={tie} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      {/* 襟 (折り返し) */}
      <polygon points="-24,-163 -44,-158 -31,-136 -39,-129 -3,-98" fill={C.coat} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <polygon points="24,-163 44,-158 31,-136 39,-129 3,-98" fill={C.coat} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -34 -150 L -26 -134 M 34 -150 L 26 -134" stroke={C.coatDark} strokeWidth={3} strokeLinecap="round" />
      {/* 胸ポケットとペン2本 */}
      <rect x={28} y={-150} width={7} height={26} rx={3} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} />
      <rect x={38} y={-146} width={7} height={22} rx={3} fill={KRP.ink} stroke={KRP.ink} strokeWidth={2.5} />
      <line x1={31.5} y1={-148} x2={31.5} y2={-134} stroke={KRP.silver} strokeWidth={2} />
      <rect x={24} y={-132} width={28} height={22} rx={3} fill={C.coat} stroke={KRP.ink} strokeWidth={3} />
      {/* 腰のポケット */}
      <g fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.7}>
        <rect x={-60} y={-62} width={28} height={18} rx={3} />
        <rect x={32} y={-62} width={28} height={18} rx={3} />
      </g>
      {/* 首からさげる名札 (名前は書かない) */}
      {tag && (
        <g transform={`rotate(${Math.sin((f + phase * 9) / 9) * 4} -27 -130)`}>
          <path d="M -20 -163 L -33 -130 M -8 -160 L -22 -130" stroke={KRP.blue} strokeWidth={3} fill="none" />
          <rect x={-42} y={-131} width={30} height={36} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-42} y={-131} width={30} height={9} rx={2} fill={KRP.blue} />
          <rect x={-38} y={-118} width={10} height={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2} />
          <line x1={-25} y1={-115} x2={-16} y2={-115} stroke={KRP.gray} strokeWidth={2.5} />
          <line x1={-25} y1={-108} x2={-17} y2={-108} stroke={KRP.gray} strokeWidth={2.5} />
        </g>
      )}
      {/* 腕 */}
      {arms === "hold" && (
        <g>
          {sleeve([-67, -148], [-14, -118])}
          {sleeve([67, -148], [14, -118])}
        </g>
      )}
      {arms === "hang" && sleeve([-71, -146], [-74, -68], false)}
      {arms === "clip" && (
        <g transform="rotate(-6 0 -60)">
          {/* クリップボード */}
          <rect x={-52} y={-112} width={104} height={118} rx={8} fill={C.deskWood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-42} y={-98} width={84} height={96} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={-10} y1={-80 + i * 20} x2={34} y2={-80 + i * 20} stroke={KRP.gray} strokeWidth={3} />)}
          {Array.from({ length: marks }, (_, i) => (
            <ellipse key={i} cx={-24} cy={-80 + i * 20} rx={9} ry={7} fill="none" stroke={KRP.red} strokeWidth={4} />
          ))}
          <rect x={-22} y={-120} width={44} height={18} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {sleeve([-67, -148], [-50, -66])}
          {/* 赤ペン */}
          <g transform={`translate(${tip[0]} ${tip[1]}) rotate(30)`}>
            <rect x={-6} y={-66} width={12} height={58} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -6 -8 L 0 4 L 6 -8 Z" fill={KRP.ink} />
          </g>
          {sleeve([67, -148], penHand)}
        </g>
      )}
    </g>
  );
};
// 四角いめがね (Person の glasses は丸。こちらは角)。x,y,s,f,phase は Person と同じ
const HmGcSquareGlasses: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; half?: boolean }> = ({ x, y, s, f, phase = 0, half }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`} fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round">
      {half ? (
        <g>
          <path d="M -46 -218 L -46 -210 Q -46 -202 -38 -202 L -10 -202 Q -2 -202 -2 -210 L -2 -218" />
          <path d="M 46 -218 L 46 -210 Q 46 -202 38 -202 L 10 -202 Q 2 -202 2 -210 L 2 -218" />
          <line x1={-48} y1={-219} x2={48} y2={-219} strokeWidth={6} />
        </g>
      ) : (
        <g>
          <rect x={-46} y={-240} width={42} height={34} rx={6} />
          <rect x={4} y={-240} width={42} height={34} rx={6} />
          <line x1={-4} y1={-228} x2={4} y2={-228} />
        </g>
      )}
      <line x1={-46} y1={-230} x2={-62} y2={-236} />
      <line x1={46} y1={-230} x2={62} y2={-236} />
    </g>
  );
};
const Hm167: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const holdUp = easeOut(seg(f, 6, 18));
  const shine = seg(f, 16, 26);
  const flip = (f % 14) / 14;
  const marks = Math.floor(seg(f, 8, 40) * 4.999);
  const PS = 1.35, PY = 800;
  const LX = 440, CX = 960, RX = 1460;
  const lensX = 610 + Math.sin(f / 8) * 30, lensY = 770 + Math.cos(f / 11) * 6;
  const bobL = Math.sin((f + 1 * 17) / 13) * 3;
  // 真ん中の人の挙げた手 (raise の右手の先)
  const bobC = Math.sin((f + 2 * 17) / 13) * 3;
  const handC: [number, number] = [CX + 67 * PS, PY + bobC - 230 * PS];
  return (
    <Frame f={f} seed={5167}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁 */}
        <rect x={-80} y={-60} width={2080} height={900} fill={C.labWall2} />
        <g stroke={C.labWallLine} strokeWidth={3}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 180} y1={-60} x2={-60 + i * 180} y2={800} />)}</g>
        {/* 窓 (真ん中の奥) と光 */}
        <rect x={780} y={60} width={420} height={300} fill="#CFE6F5" stroke={KRP.ink} strokeWidth={8} />
        <line x1={990} y1={60} x2={990} y2={360} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 800 300 q 60 -50 120 -10 q 50 -40 110 0 q 60 -30 150 10 L 1180 340 L 800 340 Z" fill="#9CC59A" stroke={KRP.ink} strokeWidth={3} />
        <polygon points="780,360 1200,360 1320,800 700,800" fill={KRP.white} opacity={0.25} />
        {/* 本棚 (左) */}
        <rect x={-40} y={60} width={380} height={740} fill={C.shelf} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={-30} y={200 + r * 150} width={360} height={12} fill={C.shelfDark} />
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={-20 + i * 38} y={80 + r * 150 + (i % 3) * 8} width={30} height={118 - (i % 3) * 8}
                fill={["#C96A4A", "#4F7DB8", "#E0B84A", "#6EA36A", "#9A6AB0", KRP.white][(i + r * 2) % 6]} stroke={KRP.ink} strokeWidth={3}
                transform={i === 7 && r === 1 ? `rotate(12 ${-20 + i * 38} ${198 + r * 150})` : undefined} />
            ))}
          </g>
        ))}
        {/* ホワイトボード (右奥) */}
        <rect x={1430} y={70} width={480} height={300} rx={10} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1450} y={90} width={440} height={260} fill={C.boardWhite} />
        <g stroke={C.marker} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d="M 1490 330 L 1490 130 M 1490 330 L 1860 330" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={1520 + i * 80} y={330 - (50 + ((i * 53) % 110))} width={44} height={50 + ((i * 53) % 110)} />)}
        </g>
        <path d="M 1700 130 q 40 -30 80 0 q 40 30 80 0" stroke={KRP.red} strokeWidth={5} fill="none" />
        {/* 研究者3人 (机の奥に立つ。白衣が腰の下まで見える) */}
        {/* 左: 丸めがね・虫めがね */}
        <Person x={LX} y={PY} s={PS} f={f} face="worried" pose="hold" gaze={[6, 12]} cloth={C.coat} clothDark={C.slacks} hair="cap" glasses phase={1} />
        <HmGcLabCoat x={LX} y={PY} s={PS} f={f} phase={1} tie={C.tieNavy} arms="hold" />
        {/* 真ん中: 角めがね・紙を光にかざす */}
        <Person x={CX} y={PY} s={PS} f={f} face="surprised" pose="raise" gaze={[10, -12]} cloth={C.coat} clothDark={C.slacks} hair="cap" phase={2} />
        <HmGcLabCoat x={CX} y={PY} s={PS} f={f} phase={2} tie={KRP.red} arms="hang" />
        <HmGcSquareGlasses x={CX} y={PY} s={PS} f={f} phase={2} />
        {/* 右: 白髪まじり・半月めがね・クリップボードに赤ペン */}
        <Person x={RX} y={PY} s={PS} f={f} face="normal" pose="hold" gaze={[-6, 14]} cloth={C.coat} clothDark={C.slacks} hair="none" phase={4} />
        <g transform={`translate(${RX} ${PY + Math.sin((f + 4 * 17) / 13) * 3}) scale(${PS})`}>
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 52} -270 q ${sd * 22} 20 ${sd * 12} 52 q ${sd * -8} -18 ${sd * -14} -26 Z`} fill={C.grayHair} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        <HmGcLabCoat x={RX} y={PY} s={PS} f={f} phase={4} tie={C.tieGreen} arms="clip" marks={marks} />
        <HmGcSquareGlasses x={RX} y={PY} s={PS} f={f} phase={4} half />
        {/* 真ん中: かざした紙の束 (下から光の前へ持ち上がり、窓の光で透ける) */}
        <g transform={`translate(${handC[0]} ${handC[1]}) rotate(${lerp(70, -6, holdUp) + Math.sin(f / 10) * 2})`}>
          <rect x={-2} y={-190} width={150} height={196} rx={4} fill={C.paperSheet} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-10} y={-182} width={150} height={196} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={6} y1={-156 + i * 26} x2={118} y2={-156 + i * 26} stroke={KRP.gray} strokeWidth={4} />)}
          {[0, 1, 2, 3].map((i) => <rect key={`b${i}`} x={8 + i * 28} y={-30 - i * 12} width={18} height={24 + i * 12} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />)}
          <rect x={-10} y={-182} width={150} height={196} rx={4} fill={HP.spark} opacity={0.35 * shine} />
          <circle cx={98} cy={-120} r={40} fill={KRP.white} opacity={0.5 * shine} />
          <circle cx={0} cy={0} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {shine > 0 && [0, 1, 2].map((j) => (
          <line key={j} x1={1230 + j * 30} y1={330 - j * 14} x2={1270 + j * 46} y2={280 - j * 26} stroke={HP.spark} strokeWidth={7} strokeLinecap="round" opacity={shine} />
        ))}
        {/* 机 (天板を少し上から見る) */}
        <polygon points="-80,790 2000,790 2000,880 -80,880" fill="#C9A97A" stroke={KRP.ink} strokeWidth={7} />
        <g stroke="#B8966A" strokeWidth={4} opacity={0.7}>{[815, 845].map((ly) => <line key={ly} x1={-80} y1={ly} x2={2000} y2={ly} />)}</g>
        <rect x={-80} y={880} width={2080} height={240} fill="#A9875A" stroke={KRP.ink} strokeWidth={6} />
        {[300, 960, 1620].map((dx) => (
          <g key={dx}>
            <rect x={dx - 200} y={910} width={400} height={120} rx={8} fill="#B8966A" stroke={KRP.ink} strokeWidth={5} />
            <rect x={dx - 50} y={950} width={100} height={18} rx={9} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 左: 紙の山 + めくれる1枚 + 虫めがね (両手で持つ) */}
        <HmGcPaperStack x={620} y={850} n={10} rot={-2} />
        <g transform={`translate(530 ${758}) scale(${Math.cos(flip * Math.PI)} 1)`}>
          <rect x={0} y={-6} width={180} height={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${-flip * 50})`} />
        </g>
        <g>
          <line x1={LX} y1={PY + bobL - 116 * PS} x2={lensX - 34} y2={lensY - 34} stroke={C.brown} strokeWidth={16} strokeLinecap="round" />
          <circle cx={lensX} cy={lensY} r={48} fill={HP.screenCore} opacity={0.5} />
          <circle cx={lensX} cy={lensY} r={48} fill="none" stroke={HP.brass} strokeWidth={11} />
          <circle cx={lensX} cy={lensY} r={48} fill="none" stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${lensX - 26} ${lensY - 14} q 8 -16 24 -18`} stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
          {/* 握った両手 */}
          <circle cx={LX - 14 * PS} cy={PY + bobL - 118 * PS} r={9 * PS} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={LX + 14 * PS} cy={PY + bobL - 118 * PS} r={9 * PS} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 真ん中と右のあいだ: パソコン */}
        <rect x={1100} y={630} width={230} height={160} rx={10} fill={KRP.ink} />
        <rect x={1112} y={642} width={206} height={128} fill={HP.screen} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={1124} y={654 + i * 28} width={182} height={20} fill={i % 2 ? KRP.white : KRP.blueSoft} />)}
        <rect x={1185} y={790} width={60} height={22} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1120} y={812} width={190} height={14} rx={4} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        <HmGcPaperStack x={1680} y={860} n={6} rot={3} />
        <HmGcPaperStack x={860} y={858} n={4} rot={-4} />
        {/* マグカップ */}
        <rect x={1800} y={790} width={70} height={70} rx={10} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1870 806 q 26 0 26 20 q 0 20 -26 20" stroke={KRP.ink} strokeWidth={5} fill="none" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #168 すると、参加者の半分以上は、一度もボタンを押していませんでした。
// 格: 図 / seed 5168
// 絵: どこ: 研究室のホワイトボード (#167 の続き)。演出: 序の #7〜#8 と同じ人形の並び (42体)。⚡が付いた18体以外の**24体**に、大きな緑の「○ (押さなかった)」が付いていく。円グラフ「半分以上」(57%)。動き: ○が付いていく / 円グラフ
// どこ: #167 と同じ研究室の、大きなホワイトボード (HmGcLabBoard)
// 演出: 左半分に参加者42人の人形 (7×6)。ボタンを押した18人の頭には稲妻が付いている。残りの24人に、
//       大きな緑の○がポン、ポン、と順番に付いていく。右半分には円グラフが緑で塗られていき、57%で止まる
// 動き: ○が1人ずつ付く f4-34 / 円グラフが塗られる f14-38 / 札 f30- / カメラがゆっくり寄る
const Hm168: React.FC<{ f: number }> = ({ f }) => {
  const order = Array.from({ length: 42 }, (_, i) => i).sort((a, b) => rnd(5168, a) - rnd(5168, b));
  const pushed = new Set(order.slice(0, 18));
  const notList = Array.from({ length: 42 }, (_, i) => i).filter((i) => !pushed.has(i));
  const pie = easeInOut(seg(f, 14, 38));
  const frac = 0.57 * pie;
  const PX = 1410, PY = 330, PR = 200;
  const ang = frac * 2 * Math.PI;
  const arc = `M ${PX} ${PY} L ${PX} ${PY - PR} A ${PR} ${PR} 0 ${ang > Math.PI ? 1 : 0} 1 ${PX + Math.sin(ang) * PR} ${PY - Math.cos(ang) * PR} Z`;
  const k = lerp(1.0, 1.04, easeInOut(seg(f, 0, 42)));
  const LEG_Y = 712;
  return (
    <Frame f={f} seed={5168}>
      <g transform={cam(960, 430, k)}>
        <HmGcLabBoard f={f} />
        {/* 仕切りの線 (マーカー) */}
        <path d="M 1100 120 q 6 320 -4 620" stroke={KRP.gray} strokeWidth={5} fill="none" strokeDasharray="16 14" />
        {/* 42人 */}
        {Array.from({ length: 42 }, (_, i) => {
          const c = i % 7, r = Math.floor(i / 7);
          const px = 290 + c * 120, py = 218 + r * 104;
          const isP = pushed.has(i);
          const k2 = notList.indexOf(i);
          const mt = k2 >= 0 ? seg(f, 4 + k2 * 1.25, 9 + k2 * 1.25) : 0;
          return (
            <g key={i}>
              <PersonMini x={px} y={py} s={0.42} f={f} phase={i} color={isP ? KRP.gray : C.student} face={mt >= 1 ? "smile" : "dot"} />
              {isP && (
                <path d={`M ${px + 24} ${py - 96} l -12 20 l 12 0 l -12 22`} stroke={KRP.yellow} strokeWidth={8} fill="none" strokeLinejoin="round" />
              )}
              {isP && (
                <path d={`M ${px + 24} ${py - 96} l -12 20 l 12 0 l -12 22`} stroke={KRP.ink} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
              )}
              {mt > 0 && (
                <g transform={`translate(${px} ${py - 44}) scale(${pop(mt)})`}>
                  <circle r={46} fill="none" stroke={KRP.ink} strokeWidth={14} opacity={0.25} />
                  <circle r={46} fill="none" stroke={KRP.green} strokeWidth={9} />
                </g>
              )}
            </g>
          );
        })}
        {/* 円グラフ */}
        <circle cx={PX + 8} cy={PY + 10} r={PR} fill={KRP.ink} opacity={0.15} />
        <circle cx={PX} cy={PY} r={PR} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={7} />
        {frac > 0.001 && <path d={arc} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />}
        <circle cx={PX} cy={PY} r={PR} fill="none" stroke={KRP.ink} strokeWidth={7} />
        {/* 半分の線 (目安) */}
        <line x1={PX} y1={PY - PR - 24} x2={PX} y2={PY + PR + 24} stroke={KRP.red} strokeWidth={5} strokeDasharray="12 10" opacity={0.8} />
        {/* 塗りの先を進めるマーカーの先 */}
        {pie > 0 && pie < 1 && (
          <circle cx={PX + Math.sin(ang) * PR} cy={PY - Math.cos(ang) * PR} r={14} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        )}
        <text x={PX + 88} y={PY + 40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={78}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} paintOrder="stroke" opacity={seg(f, 30, 36)}>
          {`${Math.round(frac * 100)}%`}
        </text>
        <TagPlate x={PX} y={606} text="半分以上" size={46} t={seg(f, 32, 40)} fill={KRP.green} color={KRP.white} />
        {/* 凡例 (同じ高さ) */}
        <g opacity={seg(f, 20, 28)}>
          <circle cx={1220} cy={LEG_Y} r={26} fill="none" stroke={KRP.green} strokeWidth={8} />
          <TagPlate x={1330} y={LEG_Y} text="24人" size={34} />
          <path d={`M 1530 ${LEG_Y - 26} l -14 24 l 14 0 l -14 26`} stroke={KRP.yellow} strokeWidth={9} fill="none" strokeLinejoin="round" />
          <path d={`M 1530 ${LEG_Y - 26} l -14 24 l 14 0 l -14 26`} stroke={KRP.ink} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          <TagPlate x={1630} y={LEG_Y} text="18人" size={34} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #169 押した人に理由を聞くと、多かった答えは、「どんな感じか、気になったから」。
// 格: 山 / seed 5169
// 絵: どこ: 研究室の面談の机 (向かい合わせ・アンケート)。演出: 研究者が聞き取りをすると、学生が頭をかいて照れ笑い (face="smile")。学生の頭上の吹き出しに、ボタンを**ちょんと指でつつく**好奇心のイラスト (字なし・目がきらきら)。動き: 頭をかく / 吹き出しの指がつつく / メモを取る
// どこ: 研究室の面談コーナー。立ち話用の高い机をはさんで、左に研究者 (白衣・バインダー)、右に学生 (紺)。奥は窓と観葉植物と時計
// 演出: 「なんで押したの?」と聞かれた学生が、頭をかいて照れ笑い (ほっぺが赤い)。頭の上の大きな吹き出しには、
//       目をきらきらさせた小さな自分が、赤いボタンを人さし指で「ちょん」とつつく絵 (字なし)。研究者はメモを取る
// 動き: 頭をかく (かき線がゆれる) / 吹き出しの指がちょん・ちょん (12コマに1回) / 研究者のペンが動く / 吹き出しがぽんと出る
const Hm169: React.FC<{ f: number }> = ({ f }) => {
  const bub = pop(seg(f, 6, 18));
  const pokeCyc = (f % 12) / 12;
  const poke = pokeCyc < 0.3 ? Math.sin((pokeCyc / 0.3) * Math.PI) : 0;
  const BX = 1250, BY = 230;
  const pen = Math.sin(f / 2.2) * 8;
  const k = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  // 人の位置
  const rX = 560, sX = 1360, pY = 790, pS = 1.0;
  const sBob = Math.sin((f + 3 * 17) / 13) * 3;
  return (
    <Frame f={f} seed={5169}>
      <g transform={cam(1100, 500, k)}>
        {/* 壁と床 */}
        <rect x={-60} y={-60} width={2040} height={800} fill={C.labWall2} />
        <g stroke={C.labWallLine} strokeWidth={3}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 180} y1={-60} x2={-60 + i * 180} y2={740} />)}</g>
        <rect x={-60} y={740} width={2040} height={400} fill={HP.labFloor} />
        <rect x={-60} y={730} width={2040} height={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓 (左奥) */}
        <rect x={90} y={90} width={330} height={300} fill="#CFE6F5" stroke={KRP.ink} strokeWidth={8} />
        <line x1={255} y1={90} x2={255} y2={390} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={340} cy={160} r={26} fill={KRP.white} opacity={0.7} />
        {/* 時計 */}
        <g transform="translate(760 150)">
          <circle r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(100)" />
          <line x1={0} y1={6} x2={0} y2={-46} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${Math.floor(f / 30) * 6})`} />
          <circle r={6} fill={KRP.ink} />
        </g>
        {/* 観葉植物 (右端) */}
        <g transform="translate(1820 740)">
          <path d="M -50 0 L -40 -90 L 40 -90 L 50 0 Z" fill="#B0633F" stroke={KRP.ink} strokeWidth={5} />
          {[-2, -1, 0, 1, 2].map((kk) => <ellipse key={kk} cx={kk * 26} cy={-180 + Math.abs(kk) * 20} rx={20} ry={62} fill="#4E8A55" stroke={KRP.ink} strokeWidth={4}
            transform={`rotate(${kk * 22 + Math.sin(f / 30 + kk) * 2} ${kk * 26} -90)`} />)}
        </g>
        {/* 研究者 (白衣・バインダーを持つ) */}
        <Person x={rX} y={pY} s={pS} f={f} pose="hold" face="normal" gaze={[8, 4]} cloth={C.coat} clothDark={C.coatDark} hair="cap" glasses phase={1} />
        <g transform={`translate(${rX} ${pY - 118}) rotate(-12)`}>
          <rect x={-60} y={-80} width={120} height={150} rx={8} fill="#A9804A" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-50} y={-66} width={100} height={128} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-22} y={-90} width={44} height={20} rx={5} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-40} y={-50 + i * 28} width={16} height={16} fill="none" stroke={KRP.ink} strokeWidth={3} />)}
          {[0, 1].map((i) => <path key={i} d={`M -38 ${-42 + i * 28} l 5 6 l 10 -12`} stroke={KRP.red} strokeWidth={4} fill="none" />)}
          {[0, 1, 2, 3].map((i) => <line key={`l${i}`} x1={-16} y1={-42 + i * 28} x2={36} y2={-42 + i * 28} stroke={KRP.gray} strokeWidth={4} />)}
          <g transform={`translate(${20 + pen} ${14})`}>
            <rect x={-5} y={-70} width={10} height={64} rx={4} fill={C.marker} stroke={KRP.ink} strokeWidth={3} transform="rotate(25)" />
          </g>
        </g>
        {/* 学生 (頭をかく・照れ笑い) */}
        <Person x={sX} y={pY} s={pS} f={f} pose="raise" face="smile" gaze={[-8, 0]} cloth={C.student} clothDark={C.studentDark} hair="cap" phase={3} />
        <g transform={`translate(${sX} ${pY + sBob})`}>
          <ellipse cx={-40} cy={-200} rx={16} ry={9} fill={C.blush} opacity={0.85} />
          <ellipse cx={40} cy={-200} rx={16} ry={9} fill={C.blush} opacity={0.85} />
          {/* かき線 */}
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M ${80 + j * 10} ${-262 - j * 18} q 14 ${-6 + Math.sin(f / 1.5 + j) * 6} 26 0`} stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {/* 机 (二人の間) とアンケート */}
        <rect x={740} y={640} width={440} height={24} rx={6} fill="#C9A97A" stroke={KRP.ink} strokeWidth={6} />
        {[770, 1150].map((lx) => <rect key={lx} x={lx - 9} y={664} width={18} height={180} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={860} y={608} width={150} height={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(-4 935 625)" />
        <rect x={1040} y={590} width={60} height={50} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1100 600 q 18 0 18 14 q 0 14 -18 14" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {/* 吹き出し */}
        <g transform={`translate(${BX} ${BY}) scale(${bub})`}>
          <path d="M 60 170 L 120 250 L 10 176 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={0} cy={20} rx={300} ry={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 40 170 L 100 236" stroke={KRP.white} strokeWidth={10} />
          {/* 小さな電気の箱と赤いボタン */}
          <rect x={10} y={40} width={200} height={70} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={110} cy={50} rx={42} ry={14} fill="#8E2A1E" />
          <ellipse cx={110} cy={42 + poke * 5} rx={38} ry={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {poke > 0.5 && [0, 1, 2].map((j) => (
            <line key={j} x1={110 + (j - 1) * 40} y1={16} x2={110 + (j - 1) * 58} y2={-6} stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />
          ))}
          {/* 小さな自分 (目がきらきら) */}
          <circle cx={-150} cy={0} r={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -210 -24 Q -150 -90 -90 -24 Q -150 -50 -210 -24 Z" fill={C.hairBack} stroke={KRP.ink} strokeWidth={4} />
          {[-174, -128].map((ex, i) => (
            <g key={ex} transform={`translate(${ex} 2) rotate(${f * 4 + i * 30}) scale(${1 + 0.15 * Math.sin(f / 3 + i)})`}>
              <path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          ))}
          <path d="M -166 30 Q -150 44 -134 30" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* つつく腕と人さし指 */}
          <g transform={`translate(${poke * 22} ${poke * 10})`}>
            <path d="M -96 30 Q -10 30 50 30" stroke={C.student} strokeWidth={26} fill="none" strokeLinecap="round" />
            <path d="M -96 30 Q -10 30 50 30" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.4} />
            <circle cx={62} cy={30} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={66} y={20} width={30} height={12} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(20 66 26)" />
          </g>
          {/* きらきら */}
          {[[-230, -110], [180, -90], [240, 30]].map(([kx, ky], i) => (
            <path key={i} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={2}
              transform={`translate(${kx} ${ky}) scale(${0.7 + 0.4 * Math.abs(Math.sin(f / 5 + i))})`} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #170 電気の強さも、平均で、「ちょっと不快」くらいでした。
// 格: 図 / seed 5170
// 絵: どこ: 研究室の机の上の評価スケール (1〜9の目盛りの板)。演出: 「不快さ」の9段階のものさし (左=平気・右=ひどい。顔のアイコンだけ)。針が真ん中より少し手前の「ちょっと不快」の顔 (しかめっつら小) で止まる。札「平均」。動き: 針がゆれて止まる / アイコンが光る
// どこ: 研究室の机の上 (真上から)。木目の机に、9段階の「不快さ」の評価板。まわりに記録用紙・鉛筆・クリップ・コーヒーの輪じみ
// 演出: 評価板には左の「平気」の笑顔から右の「ひどい」しかめっつらまで9つの顔。上の赤い針がびよんびよんゆれて、
//       真ん中より少し手前の「ちょっと不快」(4) の顔で止まる。止まった顔がぴかっと光り、「平均」の札がぶら下がる
// 動き: 針が減衰しながらゆれて f34 で止まる / 4の顔が光る f34- / 札 f34-42 / カメラが4の顔へ少し寄る
const HmGcScaleFace: React.FC<{ lv: number; lit: number; f: number }> = ({ lv, lit, f }) => {
  const m = lv <= 2 ? (lv - 2) / 2 : (lv - 2) / 6; // -1 (平気) 〜 0 (ふつう) 〜 +1 (ひどい)
  const mouthC = -m * 16;
  const brow = Math.max(0, m) * 10;
  return (
    <g>
      {lit > 0 && <circle r={84 + 6 * Math.sin(f / 3)} fill={HP.spark} opacity={0.5 * lit} />}
      <circle r={62} fill={SCALE_COLS[lv]} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -30 -38 q 14 -10 26 -4" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
      {lv >= 7 ? (
        [-20, 20].map((ex) => <path key={ex} d={`M ${ex - 9} -14 l 18 8 M ${ex - 9} -2 l 18 -8`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />)
      ) : (
        [-20, 20].map((ex) => <circle key={ex} cx={ex} cy={-8} r={6} fill={KRP.ink} />)
      )}
      {brow > 0 && [-1, 1].map((sd) => (
        <line key={sd} x1={sd * 10} y1={-26 + brow * 0.2} x2={sd * 32} y2={-26 - brow} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      ))}
      <path d={`M -22 ${22 - mouthC / 2} Q 0 ${22 + mouthC} 22 ${22 - mouthC / 2}`} stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};
const Hm170: React.FC<{ f: number }> = ({ f }) => {
  const CW = 168, X0 = 960 - 4 * CW; // 9つの中心の x
  const BOARD_Y = 470;
  const target = X0 + 3 * CW; // 4の顔 (左から4つ目)
  const t = seg(f, 0, 34);
  const swingAmp = (1 - t) * 520;
  const nx = f >= 34 ? target : target + Math.sin(t * Math.PI * 5) * swingAmp * (t < 0.08 ? t / 0.08 : 1);
  const settled = f >= 34;
  const lit = seg(f, 34, 38);
  const k = lerp(1.0, 1.06, easeInOut(seg(f, 10, 42)));
  return (
    <Frame f={f} seed={5170}>
      <g transform={cam(target, BOARD_Y, k)}>
        {/* 机 (真上から) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -60 ${40 + i * 150} q 480 ${rnd(5170, i) * 40 - 20} 1000 0 q 500 ${rnd(71, i) * 40 - 20} 1060 0`} />
          ))}
        </g>
        {/* 記録用紙 (左上) と鉛筆 */}
        <g transform="rotate(-8 300 150)">
          <rect x={150} y={40} width={300} height={220} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={175} y1={80 + i * 34} x2={420} y2={80 + i * 34} stroke={KRP.gray} strokeWidth={4} />)}
          {[0, 1, 2, 3, 4].map((i) => <circle key={`c${i}`} cx={190 + ((i * 3) % 9) * 26} cy={80 + i * 34} r={9} fill="none" stroke={KRP.red} strokeWidth={4} />)}
        </g>
        <g transform="rotate(24 1600 180)">
          <rect x={1420} y={166} width={340} height={28} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1760 166 L 1810 180 L 1760 194 Z" fill="#E9C9A0" stroke={KRP.ink} strokeWidth={4} />
          <rect x={1400} y={166} width={24} height={28} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* コーヒーの輪じみとクリップ */}
        <circle cx={1700} cy={880} r={70} fill="none" stroke="#7A5232" strokeWidth={8} opacity={0.35} />
        <path d="M 240 860 l 0 -50 q 0 -16 16 -16 q 16 0 16 16 l 0 60 q 0 10 -10 10 q -10 0 -10 -10 l 0 -50" stroke={KRP.silver} strokeWidth={6} fill="none" transform="rotate(30 256 840)" />
        {/* 評価板 */}
        <rect x={X0 - 120 + 12} y={BOARD_Y - 130 + 14} width={CW * 8 + 240} height={300} rx={24} fill={KRP.ink} opacity={0.25} />
        <rect x={X0 - 120} y={BOARD_Y - 130} width={CW * 8 + 240} height={300} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        {/* 色の帯 (左=緑 → 右=赤) */}
        {SCALE_COLS.map((c, i) => (
          <rect key={i} x={X0 + i * CW - CW / 2 + 6} y={BOARD_Y + 96} width={CW - 12} height={22} rx={6} fill={c} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {SCALE_COLS.map((_, i) => (
          <g key={`f${i}`} transform={`translate(${X0 + i * CW} ${BOARD_Y}) scale(${i === 3 && settled ? 1 + 0.12 * pop(lit) : 1})`}>
            <HmGcScaleFace lv={i} lit={i === 3 ? lit : 0} f={f} />
          </g>
        ))}
        {SCALE_COLS.map((_, i) => (
          <text key={`n${i}`} x={X0 + i * CW} y={BOARD_Y + 156} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
            fill={i === 3 && settled ? KRP.red : KRP.ink}>{i + 1}</text>
        ))}
        {/* 真ん中の印 */}
        <line x1={960} y1={BOARD_Y - 120} x2={960} y2={BOARD_Y - 80} stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="6 6" />
        {/* レール と 針 */}
        <rect x={X0 - 60} y={BOARD_Y - 196} width={CW * 8 + 120} height={20} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(${nx} ${BOARD_Y - 186}) rotate(${settled ? 0 : Math.sin(f * 0.9) * 6 * (1 - t)})`}>
          <rect x={-34} y={-30} width={68} height={44} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -22 14 L 22 14 L 0 66 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={0} cy={-8} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {!settled && [0, 1].map((j) => (
          <line key={j} x1={nx - 60 - j * 20} y1={BOARD_Y - 230 + j * 12} x2={nx + 60 + j * 20} y2={BOARD_Y - 230 + j * 12}
            stroke={KRP.ink} strokeWidth={4} opacity={0.3} strokeLinecap="round" />
        ))}
        {/* 止まった衝撃の線 */}
        {settled && bump(f, 34, 42) > 0 && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${target + sd * 50} ${BOARD_Y - 220} l ${sd * 26} -20 M ${target + sd * 56} ${BOARD_Y - 196} l ${sd * 32} 0`}
            stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={bump(f, 34, 42)} />
        ))}
        {/* 「平均」の札 (針の上) */}
        <TagPlate x={target} y={BOARD_Y - 280} text="平均" size={44} t={seg(f, 34, 42)} fill={KRP.yellow} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #171 人は退屈より痛みを選ぶ、というほど、話は単純ではなさそうです。
// 格: 並 / seed 5171
// 絵: どこ: 研究室のホワイトボード。演出: 「退屈 < 痛み」と天秤で書かれた図が、研究者の消しゴムで半分消され、上に「?」が書き足される。天秤がゆらゆら決まらない。動き: 消しゴム / 「?」 / 天秤のゆれ
// どこ: #168 と同じ研究室のホワイトボード (HmGcLabBoard)
// 演出: ボードに青いマーカーで描かれた「退屈 < 痛み」の天秤 (痛みの皿が下がっている)。白衣の研究者が右から
//       ボード消しでごしごし消していき、天秤の右半分が消える。真ん中の上に赤い「?」が書き足される。
//       天秤はどっちにも決まらず、ゆらゆらゆれ続ける
// 動き: 消しゴムが右から左へ (小さく上下にこする) / 消しカスが落ちる / 「?」 f26-38 / 天秤のゆれ
const Hm171: React.FC<{ f: number }> = ({ f }) => {
  const er = easeInOut(seg(f, 2, 28));
  const maskL = lerp(1330, 905, er);
  const rub = Math.sin(f * 1.1) * 14;
  const rX = maskL + 153, rY = 820;
  const tilt = 4 + Math.sin(f / 6) * 9;
  const PVX = 840, PVY = 380, ARM = 320;
  const endL = [PVX - Math.cos((tilt * Math.PI) / 180) * ARM, PVY - Math.sin((tilt * Math.PI) / 180) * ARM];
  const endR = [PVX + Math.cos((tilt * Math.PI) / 180) * ARM, PVY + Math.sin((tilt * Math.PI) / 180) * ARM];
  const pan = (ex: number, ey: number, label: string) => (
    <g>
      <line x1={ex} y1={ey} x2={ex - 80} y2={ey + 130} />
      <line x1={ex} y1={ey} x2={ex + 80} y2={ey + 130} />
      <path d={`M ${ex - 110} ${ey + 130} Q ${ex} ${ey + 190} ${ex + 110} ${ey + 130} Z`} />
      <text x={ex} y={ey + 120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.marker} stroke="none">{label}</text>
    </g>
  );
  const qT = seg(f, 26, 38);
  return (
    <Frame f={f} seed={5171}>
      <HmGcLabBoard f={f} />
      {/* 天秤 (マーカーの線画) */}
      <g stroke={C.marker} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={PVX} y1={PVY} x2={PVX} y2={720} />
        <path d={`M ${PVX - 130} 730 L ${PVX + 130} 730`} />
        <path d={`M ${PVX - 40} ${PVY - 10} L ${PVX} ${PVY - 50} L ${PVX + 40} ${PVY - 10}`} />
        <line x1={endL[0]} y1={endL[1]} x2={endR[0]} y2={endR[1]} strokeWidth={12} />
        <circle cx={PVX} cy={PVY} r={14} fill={C.marker} />
        {pan(endL[0], endL[1], "退屈")}
        {pan(endR[0], endR[1], "痛み")}
      </g>
      {/* 上の式 */}
      <text x={PVX} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={C.marker}>退屈 ＜ 痛み</text>
      {/* 消された所 (ボードの白で塗りつぶし、ふちに消し残し) */}
      <path d={`M ${maskL} 100 ${Array.from({ length: 17 }, (_, i) => `L ${maskL + (i % 2 ? -16 : 6)} ${120 + i * 40}`).join(' ')} L ${maskL} 770 L 1580 770 L 1580 100 Z`} fill={C.boardWhite} />
      <g opacity={0.35} stroke={C.marker} strokeWidth={4}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${maskL + 10 + rnd(5171, i) * 40} ${150 + i * 74} q 30 ${rnd(9, i) * 20 - 10} 80 0`} fill="none" />
        ))}
      </g>
      {/* 消しカス */}
      {Array.from({ length: 7 }, (_, j) => {
        const life = ((f + j * 6) % 20) / 20;
        return er < 1 ? <circle key={j} cx={maskL + 20 + j * 8} cy={660 + life * 140} r={5 - life * 2} fill={KRP.gray} opacity={1 - life} /> : null;
      })}
      {/* 赤い「?」(真ん中の上に書き足す) */}
      <QMark x={1170} y={520} s={2.4} f={f} t={qT} color={KRP.red} />
      {qT > 0 && qT < 1 && (
        <g transform={`translate(${1270} ${480 - qT * 120}) rotate(30)`}>
          <rect x={-10} y={-90} width={20} height={90} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 研究者 (左を指す腕でボード消しを持つ) */}
      <Person x={rX} y={rY} s={1.0} f={f} face="worried" pose="point" pointDir={-1} gaze={[-10, -4]} cloth={C.coat} clothDark={C.coatDark} hair="cap" glasses phase={2} />
      <g transform={`translate(${rX - 153} ${rY - 148 + rub})`}>
        <rect x={-40} y={-70} width={80} height={140} rx={10} fill={C.marker} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={-70} width={30} height={140} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={0} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* ごしごし線 */}
      {er < 1 && [0, 1].map((j) => (
        <path key={j} d={`M ${rX - 230} ${rY - 220 + j * 150} q -14 10 0 20`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #172 押した人の多くは、ただの好奇心。人間らしいです。
// 格: 山 / seed 5172
// 絵: どこ: ShockRoom (minutes=8)。演出: 学生がボタンを、こわごわ指先で**ちょん**と押して (press の光が小さく)、「おっ」という顔 (face="surprised") のあと、ちょっとうれしそうに笑う。学生の頭の上で、好奇心の豆電球がぴかっ。動き: ちょんと押す / 小さな光 / 豆電球
// どこ: ShockRoom (minutes=8)。序と同じ部屋。学生は椅子から立って、机の左手前でボタンに手を伸ばしている
// 演出: こわごわ (手がぷるぷる・汗) → 人さし指で「ちょん」(光は小さく、ぴりっ) → 「おっ」と目を丸くする →
//       ちょっとうれしそうに笑う。その瞬間、頭の上で好奇心の豆電球がぴかっと点く
// 動き: 手がふるえながら近づく f0-18 / ちょん f20 (press 小) / 驚く f20-30 / 笑う f30- / 豆電球 f30-36 / カメラが少し寄る
const Hm172: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeInOut(seg(f, 0, 20));
  const tremble = f < 20 ? Math.sin(f * 2.1) * 3 : 0;
  const pressV = 0.4 * bump(f, 20, 30);
  const PS = 1.25, PY = 745;
  const px = lerp(800, 850, reach) + tremble;
  const face = f < 20 ? "worried" : f < 30 ? "surprised" : "smile";
  const lean = f >= 20 && f < 27 ? -4 : 0;
  const bulb = seg(f, 30, 36);
  const k = lerp(1.0, 1.08, easeInOut(seg(f, 0, 42)));
  const jolt = bump(f, 20, 27);
  // ちょんと押した瞬間 (P=20) から8コマ、画面が小さく揺れて止まる
  const hit = seg(f, 20, 28);
  const amp = hit > 0 && hit < 1 ? 8 * (1 - hit) : 0;
  const shakeX = amp * Math.sin(f * 2.7), shakeY = amp * Math.cos(f * 3.3);
  return (
    <Frame f={f} seed={5172}>
      <g transform={`translate(${shakeX} ${shakeY})`}>
      <g transform={cam(950, 480, k)}>
        <ShockRoom f={f} minutes={8} press={pressV} />
        <Person x={px} y={PY} s={PS} f={f} face={face} pose="point" pointDir={1} lean={lean} gaze={[10, 6]}
          cloth={C.student} clothDark={C.studentDark} hair="cap" phase={1} />
        {/* こわごわの汗 */}
        {f < 22 && (
          <path d={`M ${px - 70} ${PY - 330 + (f % 16)} q 12 18 0 28 q -12 -10 0 -28 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        )}
        {/* 「ぴりっ」: 指先の小さな火花と、体のまわりのびくっ線 */}
        {jolt > 0 && (
          <g opacity={jolt}>
            {[0, 1, 2].map((j) => (
              <path key={j} d={`M ${1048 + (j - 1) * 26} 530 l -6 -16 l 10 0 l -6 -16`} stroke={HP.spark} strokeWidth={6} fill="none" strokeLinejoin="round" />
            ))}
            {[-1, 1].map((sd) => (
              <g key={sd} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
                <line x1={px + sd * 100} y1={PY - 360} x2={px + sd * 128} y2={PY - 384} />
                <line x1={px + sd * 110} y1={PY - 300} x2={px + sd * 142} y2={PY - 300} />
              </g>
            ))}
          </g>
        )}
        {/* うれしい笑いのほっぺ */}
        {f >= 30 && [-1, 1].map((sd) => (
          <ellipse key={sd} cx={px + sd * 50} cy={PY - 250 * PS / 1.25 - 4} rx={18} ry={10} fill={C.blush} opacity={0.8 * seg(f, 30, 34)} />
        ))}
        {/* 好奇心の豆電球 */}
        <g transform={`translate(${px} ${PY - 470 - 8 * pop(bulb)}) rotate(${Math.sin(f / 8) * 5})`}>
          <g opacity={0.35 + 0.65 * seg(f, 26, 30)}>
            <HmGcBulb x={0} y={0} s={0.9} on={bulb} f={f} />
          </g>
        </g>
      </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_162: (f) => <Hm162 f={f} />,
  hm_163: (f) => <Hm163 f={f} />,
  hm_164: (f) => <Hm164 f={f} />,
  hm_165: (f) => <Hm165 f={f} />,
  hm_166: (f) => <Hm166 f={f} />,
  hm_167: (f) => <Hm167 f={f} />,
  hm_168: (f) => <Hm168 f={f} />,
  hm_169: (f) => <Hm169 f={f} />,
  hm_170: (f) => <Hm170 f={f} />,
  hm_171: (f) => <Hm171 f={f} />,
  hm_172: (f) => <Hm172 f={f} />,
};

export const HM_GC_MOTIFS: string[] = [
  "hm_162", // #162
  "hm_163", // #163
  "hm_164", // #164
  "hm_165", // #165
  "hm_166", // #166
  "hm_167", // #167
  "hm_168", // #168
  "hm_169", // #169
  "hm_170", // #170
  "hm_171", // #171
  "hm_172", // #172
];

export const himaGcScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
