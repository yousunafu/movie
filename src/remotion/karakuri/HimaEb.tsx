// 人は、なぜ暇をつぶすのか: 文#95〜#103 (9文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
  // #95 工場の休憩室
  tileWall: "#DCE3D3", tileLine: "#C3CCBA", wainscot: "#A88456", wainscotDark: "#7E6240",
  cork: "#C49A64", corkDot: "#A57B48", block: "#8E959C", blockDark: "#646B72", blockLight: "#B3B9BE",
  // #96 新聞社の輪転機
  pressWall: "#5F6B63", pressWallDark: "#4A554E", machine: "#4E7A62", machineDark: "#365744",
  newsprint: "#F1ECDD", inkRoller: "#2F3136", pressFloor: "#6F6A62",
  // #97 夕方の町
  duskTop: "#7A5C8E", duskMid: "#E99367", duskLow: "#F7C98A", nightTop: "#1E2244", nightLow: "#3E3A66",
  brick: "#A9573E", brickDark: "#7E3E2C", roofGray: "#6E6A64", lamp: "#FFD36E", windowDark: "#4A4458",
  road: "#8F8478", roadDark: "#6E655C", awningA: "#D9503F", awningB: "#4FA38D", awningC: "#E0B84A",
  house: "#B9A58A", houseRoof: "#5A4E5E", workCloth: "#6E7F96", workClothDark: "#4E5E74",
  // #98 茶の間
  tatami: "#CFC58A", tatamiLine: "#B3A86C", tatamiEdge: "#5E6E4A", fusuma: "#E9DFC6", wood: "#6B4A30",
  tsuchikabe: "#C9A97E", chabudai: "#8A5A34", chabudaiTop: "#A86F42", shogi: "#E6C27A", radio: "#7A4E2E",
  tansu: "#8E6038", lampShade: "#F3E2B8", knitRed: "#C84B4B", warm: "#FFE2A0", momCloth: "#9A6A8A",
  momClothDark: "#74506A", kidCloth: "#E0B84A", kidClothDark: "#B8922E", cat: "#E8A85A", catDark: "#B87A34",
  // #100 #102 グラフ
  panel: "#9A7450", panelDark: "#7A5838", graphPaper: "#FBF8EE", graphLine: "#CFE0E8", lineRed: "#C8402E",
  sky102: "#A8D4EE", sky102Low: "#DDF0F8", sea: "#4FA3C8", seaDark: "#2F7FA6", seaLight: "#9AD0E6",
  rock: "#9C8A6A", rockDark: "#7A6A50", grass: "#8CC06E", grassDark: "#5E9446", sand: "#EED9A0",
  suit: "#4A5468", suitDark: "#333B4C", tube: "#E8504A",
  // #101 1961年の町角
  sky101: "#BFE2F2", sky101Low: "#EAF5F8", dept: "#E6D6B8", deptDark: "#C4AE88", bowlWall: "#9FCFC4",
  bowlWallDark: "#6FA79A", lane: "#E3C48E", tvBody: "#8A5A3A", shopWall: "#D7C9E0", walk: "#CFC6B6",
  // #103 昭和の駅
  trainOrange: "#E58A3A", trainGreen: "#3F7A4E", platform: "#B5AC9C", platformDark: "#958C7E",
  cloud: "#F4A85E", cloudLight: "#FAD2A0", cloudDark: "#D07F3A", seatGreen: "#5E8E5A", stationRoof: "#5A5560",
  hair: "#6E4526",
} as const;
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

// Person と同じ座標系 (足元原点・scale・lean・上下ゆれ) で小物を持たせるための包み
const HmEbBody: React.FC<{
  x: number; y: number; s: number; f: number; lean?: number; phase?: number; children?: React.ReactNode;
}> = ({ x, y, s, f, lean = 0, phase = 0, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// 後ろで結んだ髪の房 (女性用)。HmEbBody の中で使う
const HmEbBun: React.FC<{ side?: 1 | -1 }> = ({ side = -1 }) => (
  <g>
    <path d="M -66 -240 Q -60 -300 0 -298 Q 60 -300 66 -240 Q 40 -278 0 -276 Q -40 -278 -66 -240 Z" fill={C.hair} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={side * 58} cy={-262} r={24} fill={C.hair} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// 小さな時計の顔 (雲の中・懐中時計などに)
const HmEbClockFace: React.FC<{ x: number; y: number; r: number; f: number; fill?: string; rot?: number }> = ({ x, y, r, f, fill = KRP.white, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill={fill} stroke={KRP.ink} strokeWidth={Math.max(3, r * 0.12)} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return <line key={i} x1={Math.sin(a) * r * 0.72} y1={-Math.cos(a) * r * 0.72} x2={Math.sin(a) * r * 0.86} y2={-Math.cos(a) * r * 0.86}
        stroke={KRP.ink} strokeWidth={Math.max(1.5, r * 0.05)} />;
    })}
    <line x1={0} y1={0} x2={0} y2={-r * 0.6} stroke={KRP.ink} strokeWidth={Math.max(2.5, r * 0.09)} strokeLinecap="round" transform={`rotate(${f * 6})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.4} stroke={KRP.ink} strokeWidth={Math.max(3, r * 0.11)} strokeLinecap="round" transform={`rotate(${f * 0.5 + 120})`} />
    <circle r={Math.max(2.5, r * 0.08)} fill={KRP.ink} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #95 休みは日曜だけ。週48時間です。
// 格: 図 / seed 5095
// どこ: 戦後の工場の休憩室。タイル壁にコルクの掲示板、その上に週の表 (7マス)。左にタイムカード差し、右に棚とやかん・作業帽
// 演出: 月〜土に「8時間」の灰色の積み木が1つずつ、どすんと落ちてくる (6回)。日曜だけ赤い休み (座布団と湯のみ)。最後に合計の札「週48時間」
// 動き: 積み木が落ちて着地でつぶれ・砂ぼこり・画面がゆれる (6回) / 日曜が赤く光る / 札がぽんと出る / カメラがじわっと寄る
const Hm095: React.FC<{ f: number }> = ({ f }) => {
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  const x0 = 330, cw = 180, base = 744, bh = 360, bw = 150;
  const land = (i: number) => 6 + i * 5; // 着地のコマ 6,11,16,21,26,31
  let shake = 0;
  for (let i = 0; i < 6; i++) {
    const d = f - land(i);
    if (d >= 0 && d < 7) shake += (1 - d / 7) * 8 * Math.sin(d * 2.4);
  }
  const sun = seg(f, 32, 40);
  const zoom = 1 + 0.035 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5095}>
      <g transform={`translate(960 540) scale(${zoom}) translate(-960 ${-540 + shake})`}>
        {/* タイル壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.tileWall} />
        <g stroke={C.tileLine} strokeWidth={3}>
          {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={-60} y1={i * 64} x2={1980} y2={i * 64} />)}
          {Array.from({ length: 32 }, (_, i) => <line key={`v${i}`} x1={i * 64} y1={-60} x2={i * 64} y2={830} />)}
        </g>
        {/* 腰板 */}
        <rect x={-60} y={830} width={2040} height={320} fill={C.wainscot} />
        <rect x={-60} y={820} width={2040} height={20} fill={C.wainscotDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={840} x2={i * 150} y2={1100} stroke={C.wainscotDark} strokeWidth={4} />)}
        {/* 左: タイムカード差し */}
        <g>
          <rect x={30} y={250} width={190} height={470} rx={8} fill="#8E6A44" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, r) => Array.from({ length: 2 }, (_, c) => (
            <g key={`${r}-${c}`}>
              <rect x={46 + c * 86} y={270 + r * 54} width={74} height={44} rx={3} fill="#6E5034" />
              <rect x={52 + c * 86} y={250 + r * 54 + (rnd(95, r * 2 + c) > 0.5 ? 0 : 6)} width={62} height={52} rx={2}
                fill={KRP.cream} stroke={KRP.ink} strokeWidth={2.5} />
              <line x1={58 + c * 86} y1={262 + r * 54} x2={106 + c * 86} y2={262 + r * 54} stroke={KRP.red} strokeWidth={2} />
            </g>
          )))}
        </g>
        {/* 右: 壁時計・棚のやかんと湯のみ・作業帽 */}
        <g>
          <circle cx={1800} cy={170} r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <line x1={1800} y1={170} x2={1800} y2={120} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={1800} y1={170} x2={1834} y2={186} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={1800} y1={176} x2={1800} y2={110} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6} 1800 170)`} />
          <rect x={1700} y={560} width={240} height={18} fill={C.wainscotDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1730 560 Q 1724 500 1770 494 Q 1816 500 1810 560 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1748 500 Q 1770 466 1792 500" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1806 530 L 1840 508" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          <path d={`M 1842 500 q 8 -14 0 -26 q -8 -14 0 -28`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.7}
            transform={`translate(0 ${-((f * 0.9) % 16)})`} />
          <rect x={1864} y={524} width={44} height={36} rx={5} fill="#7FA6A0" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1760} cy={320} r={7} fill={KRP.grayDark} />
          <path d="M 1700 400 Q 1700 330 1760 326 Q 1820 330 1820 400 Z" fill={C.workCloth} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1700 400 L 1846 400 Q 1846 414 1830 414 L 1700 412 Z" fill={C.workClothDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* コルクの掲示板 */}
        <rect x={250} y={86} width={1420} height={760} rx={12} fill={C.wainscotDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={270} y={106} width={1380} height={720} fill={C.cork} />
        {Array.from({ length: 140 }, (_, i) => (
          <circle key={i} cx={280 + rnd(1, i) * 1360} cy={116 + rnd(2, i) * 700} r={2 + rnd(3, i) * 3} fill={C.corkDot} opacity={0.6} />
        ))}
        {/* 週の表 (紙) */}
        <g transform="rotate(-0.5 960 520)">
          <rect x={306} y={246} width={1328} height={580} fill={KRP.ink} opacity={0.18} />
          <rect x={296} y={236} width={1328} height={580} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[[310, 250], [1610, 250], [310, 802], [1610, 802]].map(([px, py], i) => (
            <g key={i}><circle cx={px} cy={py} r={11} fill={[KRP.red, KRP.blueDeep, KRP.green, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={3} /></g>
          ))}
          {/* 日曜のマス (赤い休み) */}
          <rect x={x0 + 6 * cw + 6} y={262} width={cw - 12} height={base - 262} rx={10} fill={HP.restSoft} stroke={HP.rest} strokeWidth={5} />
          {sun > 0 && (
            <rect x={x0 + 6 * cw - 4} y={252} width={cw + 8} height={base - 242} rx={16} fill={HP.rest}
              opacity={sun * (0.25 + 0.12 * Math.sin(f / 2.5))} />
          )}
          {/* 日曜: 座布団と湯のみ */}
          <g transform={`translate(${x0 + 6.5 * cw} ${base - 40}) scale(${1 + 0.06 * sun * Math.sin(f / 3)})`}>
            <path d="M -70 0 Q -74 -40 -60 -44 L 60 -44 Q 74 -40 70 0 Q 0 10 -70 0 Z" fill={HP.rest} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-22} r={6} fill={KRP.ink} />
            <path d="M -22 -54 L -18 -96 L 18 -96 L 22 -54 Z" fill="#7FA6A0" stroke={KRP.ink} strokeWidth={4.5} />
            {[0, 1].map((k) => <path key={k} d={`M ${-6 + k * 12} -104 q 6 -12 0 -24`} stroke={KRP.grayDark} strokeWidth={3} fill="none" opacity={0.6}
              transform={`translate(0 ${-((f + k * 8) % 14)})`} />)}
          </g>
          <text x={x0 + 6.5 * cw} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={HP.rest}>休み</text>
          {/* マスの仕切りと曜日 */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={x0 + i * cw} y1={256} x2={x0 + i * cw} y2={base} stroke={KRP.gray} strokeWidth={3} />
          ))}
          <line x1={x0} y1={base} x2={x0 + 7 * cw} y2={base} stroke={KRP.ink} strokeWidth={6} />
          {days.map((d, i) => (
            <text key={d} x={x0 + i * cw + cw / 2} y={796} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
              fill={i === 6 ? HP.rest : KRP.ink}>{d}</text>
          ))}
          {/* 8時間の積み木 (上から落ちてくる) */}
          {Array.from({ length: 6 }, (_, i) => {
            const b = land(i);
            const t = seg(f, b - 7, b);
            if (t <= 0) return null;
            const dy = -(1 - t * t) * 980;
            const d = f - b;
            const squash = d >= 0 && d < 6 ? 1 - 0.14 * Math.sin((d / 6) * Math.PI) : 1;
            const cx = x0 + i * cw + cw / 2;
            return (
              <g key={i}>
                <g transform={`translate(${cx} ${base + dy}) scale(${1 + (1 - squash) * 0.7} ${squash})`}>
                  <rect x={-bw / 2 + 8} y={-bh + 8} width={bw} height={bh} rx={10} fill={KRP.ink} opacity={0.2} />
                  <rect x={-bw / 2} y={-bh} width={bw} height={bh} rx={10} fill={C.block} stroke={KRP.ink} strokeWidth={6} />
                  <rect x={-bw / 2 + 10} y={-bh + 10} width={22} height={bh - 20} rx={6} fill={C.blockLight} opacity={0.7} />
                  {Array.from({ length: 7 }, (_, k) => (
                    <line key={k} x1={-bw / 2 + 4} y1={-bh + (k + 1) * (bh / 8)} x2={bw / 2 - 4} y2={-bh + (k + 1) * (bh / 8)}
                      stroke={C.blockDark} strokeWidth={3} opacity={0.7} />
                  ))}
                  <rect x={-60} y={-bh / 2 - 34} width={120} height={64} rx={10} fill={C.blockDark} stroke={KRP.ink} strokeWidth={4} />
                  <text x={0} y={-bh / 2 + 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.white}>8時間</text>
                </g>
                {/* 着地の砂ぼこり */}
                {d >= 0 && d < 10 && (
                  <g opacity={1 - d / 10}>
                    {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
                      <circle key={`${sd}${k}`} cx={cx + sd * (bw / 2 + 10 + d * (5 + k * 3))} cy={base - 10 - k * 14 - d * 1.5}
                        r={9 + d * 1.6 - k * 2} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
                    )))}
                    <path d={`M ${cx - 40} ${base - bh - 20} l -16 -22 M ${cx} ${base - bh - 26} l 0 -26 M ${cx + 40} ${base - bh - 20} l 16 -22`}
                      stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
        </g>
        {/* 合計の札 */}
        <TagPlate x={960} y={168} text="週48時間" size={60} t={seg(f, 34, 41)} fill={KRP.white} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #96 それでも、これは大事件でした。
// 格: 並 / seed 5096
// どこ: 戦後の新聞社の印刷場。奥に巨大な輪転機 (緑の鉄の枠・回る胴・インクのローラー)、左に紙の大きな巻き取り、天井の裸電球
// 演出: 輪転機の上から、1面 (大きな時計の「8」のマークと号外の鈴の印) が刷り出されて、ぶわっと舞い上がる。まわりにも刷り上がった新聞が舞う。右から号外配りの少年が、鈴を鳴らして駆けてくる
// 動き: 胴が回る / 1面が舞い上がって手前に寄る / ほかの新聞がひらひら舞う / 少年が跳ねて走る / 鈴がゆれて音の線
const HmEbPaper: React.FC<{ x: number; y: number; s: number; rot: number; flip?: number }> = ({ x, y, s, rot, flip = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * flip} ${s})`}>
    <rect x={-60} y={-42} width={120} height={84} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-50} y={-34} width={100} height={12} fill={KRP.grayDark} />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={-50} y1={-10 + k * 12} x2={50} y2={-10 + k * 12} stroke={KRP.gray} strokeWidth={4} />)}
    <circle cx={-30} cy={2} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const Hm096: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 4, 30));
  const px = lerp(980, 900, rise), py = lerp(640, 380, rise) + Math.sin(f / 6) * 6 * rise;
  const ps = lerp(0.3, 1, rise);
  const prot = lerp(-24, -5, rise) + Math.sin(f / 7) * 2;
  const run = easeOut(seg(f, 0, 40));
  const bx = lerp(1880, 1540, run);
  const hop = Math.abs(Math.sin(f / 3.2)) * 22;
  const bell = Math.sin(f / 2.2) * 28;
  const cam = 1.04 - 0.04 * easeOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={5096}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        {/* 壁と天井 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.pressWall} />
        <g stroke={C.pressWallDark} strokeWidth={5}>
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={-60} x2={i * 220} y2={860} />)}
        </g>
        {/* 天井の梁と裸電球 */}
        <rect x={-60} y={-60} width={2040} height={90} fill={C.pressWallDark} stroke={KRP.ink} strokeWidth={6} />
        {[420, 1020, 1620].map((lx, i) => (
          <g key={lx}>
            <line x1={lx} y1={30} x2={lx} y2={110} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 40} 140 Q ${lx} 96 ${lx + 40} 140 Z`} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={146} r={13} fill={HP.spark} stroke={KRP.ink} strokeWidth={3} />
            <polygon points={`${lx - 40},146 ${lx + 40},146 ${lx + 200},700 ${lx - 200},700`} fill={HP.spark}
              opacity={0.07 + 0.02 * Math.sin(f / 5 + i)} />
          </g>
        ))}
        {/* 床 */}
        <rect x={-60} y={850} width={2040} height={300} fill={C.pressFloor} />
        <rect x={-60} y={844} width={2040} height={14} fill={KRP.ink} opacity={0.5} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={858} x2={i * 240 - 120} y2={1100} stroke={KRP.ink} strokeWidth={3} opacity={0.25} />)}
        {/* 左: 紙の巻き取り */}
        <g>
          <rect x={40} y={560} width={60} height={290} fill={C.machineDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={220} cy={660} r={170} fill={C.newsprint} stroke={KRP.ink} strokeWidth={8} />
          {[140, 110, 80, 50].map((r) => <circle key={r} cx={220} cy={660} r={r} fill="none" stroke={KRP.gray} strokeWidth={3} />)}
          <circle cx={220} cy={660} r={26} fill={C.machineDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={220} y1={660} x2={220} y2={636} stroke={KRP.white} strokeWidth={5} transform={`rotate(${f * 9} 220 660)`} />
          {/* 紙の帯が機械へ */}
          <path d="M 220 490 C 360 430 420 470 480 520" stroke={KRP.ink} strokeWidth={34} fill="none" />
          <path d="M 220 490 C 360 430 420 470 480 520" stroke={C.newsprint} strokeWidth={26} fill="none" />
          {Array.from({ length: 4 }, (_, k) => (
            <line key={k} x1={0} y1={-12} x2={0} y2={12} stroke={KRP.gray} strokeWidth={3}
              transform={`translate(${lerp(240, 470, ((f * 0.06 + k * 0.25) % 1))} ${lerp(484, 514, ((f * 0.06 + k * 0.25) % 1)) - 30 * Math.sin(((f * 0.06 + k * 0.25) % 1) * Math.PI)})`} />
          ))}
        </g>
        {/* 輪転機の本体 */}
        <g>
          <rect x={440} y={430} width={1120} height={420} rx={14} fill={C.machine} stroke={KRP.ink} strokeWidth={9} />
          <rect x={440} y={430} width={1120} height={50} rx={14} fill={C.machineDark} stroke={KRP.ink} strokeWidth={7} />
          {[480, 1500].map((lx) => <rect key={lx} x={lx} y={480} width={40} height={370} fill={C.machineDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 回る胴 (版胴・圧胴) */}
          {[[640, 600, 92], [860, 600, 92], [1080, 600, 92], [1300, 600, 92], [750, 760, 60], [970, 760, 60], [1190, 760, 60]].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={i < 4 ? KRP.silver : C.inkRoller} stroke={KRP.ink} strokeWidth={7} />
              <g transform={`rotate(${(i % 2 ? -1 : 1) * f * 12} ${cx} ${cy})`}>
                {[0, 60, 120].map((a) => (
                  <line key={a} x1={cx - r * 0.8} y1={cy} x2={cx + r * 0.8} y2={cy} stroke={i < 4 ? KRP.grayDark : KRP.grayDark}
                    strokeWidth={5} transform={`rotate(${a} ${cx} ${cy})`} />
                ))}
              </g>
              <circle cx={cx} cy={cy} r={r * 0.22} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          {/* 紙の帯が胴のあいだを通る */}
          <path d="M 480 520 L 1520 520" stroke={C.newsprint} strokeWidth={14} />
          <path d="M 480 520 L 1520 520" stroke={KRP.ink} strokeWidth={2} strokeDasharray="30 14" strokeDashoffset={-f * 8} />
          {/* 計器とレバー */}
          <circle cx={1440} cy={760} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={1440} y1={760} x2={1440 + Math.cos(-0.6 + Math.sin(f / 3) * 0.3) * 26} y2={760 + Math.sin(-0.6 + Math.sin(f / 3) * 0.3) * 26}
            stroke={KRP.red} strokeWidth={4} />
          {/* 刷り出し口 */}
          <rect x={860} y={404} width={240} height={36} rx={8} fill={C.inkRoller} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 舞う新聞 */}
        {Array.from({ length: 9 }, (_, i) => {
          const p = ((f + i * 9) % 46) / 46;
          const sx = 980 + (rnd(96, i) - 0.5) * 300 + (rnd(97, i) - 0.5) * 1300 * p;
          const sy = 420 - p * 520 + Math.sin(p * 9 + i) * 30;
          return <HmEbPaper key={i} x={sx} y={sy} s={0.7 + rnd(98, i) * 0.5} rot={(f + i * 40) * (i % 2 ? 4 : -5)} flip={Math.cos(f / 4 + i) > 0 ? 1 : -1} />;
        })}
        {/* 主役: 刷り出された1面 */}
        <g transform={`translate(${px} ${py}) rotate(${prot}) scale(${ps})`}>
          <rect x={-306} y={-206} width={620} height={430} fill={KRP.ink} opacity={0.25} />
          <rect x={-320} y={-220} width={620} height={430} fill={C.newsprint} stroke={KRP.ink} strokeWidth={8} />
          {/* 題字の帯 (字は入れない) */}
          <rect x={-296} y={-198} width={572} height={48} fill={KRP.grayDark} />
          <rect x={-290} y={-192} width={150} height={36} fill={C.inkRoller} />
          {/* 号外の赤い帯と鈴の印 */}
          <rect x={186} y={-140} width={90} height={330} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <g transform="translate(231 -60)">
            <path d="M -26 16 Q -28 -26 0 -30 Q 28 -26 26 16 Z" fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-30} y={14} width={60} height={10} rx={4} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={0} cy={30} r={7} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={0} cy={-34} r={6} fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 大きな時計の「8」 */}
          <g transform="translate(-110 20)">
            <circle r={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={Math.sin(a) * 122} y1={-Math.cos(a) * 122} x2={Math.sin(a) * 138} y2={-Math.cos(a) * 138}
                stroke={KRP.ink} strokeWidth={i % 3 ? 5 : 9} strokeLinecap="round" />;
            })}
            <text x={0} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190} fill={KRP.red}>8</text>
          </g>
          {/* 本文の行 (字は入れない) */}
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={70} y1={-120 + k * 34} x2={166} y2={-120 + k * 34} stroke={KRP.gray} strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
        {/* 号外配りの少年 */}
        <g transform={`translate(0 ${-hop})`}>
          {/* 速さの線 */}
          {[0, 1, 2].map((k) => (
            <line key={k} x1={bx - 120 - k * 30} y1={700 + k * 50} x2={bx - 260 - k * 40} y2={700 + k * 50} stroke={KRP.white}
              strokeWidth={6} strokeLinecap="round" opacity={0.6 * run} transform={`scale(-1 1) translate(${-2 * bx} 0)`} />
          ))}
          <Person x={bx} y={846} s={0.86} f={f} face="joy" pose="point" pointDir={-1} lean={-8} cloth="#5E6E8E" clothDark="#3E4A66" phase={2} />
          <HmEbBody x={bx} y={846} s={0.86} f={f} lean={-8} phase={2}>
            {/* 学生帽 */}
            <path d="M -64 -262 Q -60 -318 0 -320 Q 60 -318 64 -262 Z" fill="#2E3446" stroke={KRP.ink} strokeWidth={5} />
            <path d="M -64 -262 Q -110 -258 -104 -246 Q -60 -244 0 -252 Z" fill="#1E2230" stroke={KRP.ink} strokeWidth={4} />
            {/* わきに抱えた新聞の束 */}
            <g transform="translate(78 -92) rotate(10)">
              <rect x={-40} y={-30} width={80} height={60} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} />
              <line x1={-40} y1={-10} x2={40} y2={-10} stroke={KRP.gray} strokeWidth={4} />
              <line x1={-40} y1={8} x2={40} y2={8} stroke={KRP.gray} strokeWidth={4} />
              <rect x={-40} y={-30} width={14} height={60} fill={KRP.red} />
            </g>
            {/* 掲げた手の鈴 */}
            <g transform={`translate(-153 -150) rotate(${bell})`}>
              <line x1={0} y1={-16} x2={0} y2={26} stroke={C.wood} strokeWidth={12} strokeLinecap="round" />
              <path d="M -34 82 Q -36 30 0 24 Q 36 30 34 82 Z" fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-40} y={78} width={80} height={12} rx={5} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={Math.sin(f / 2.2 + 1) * 10} cy={96} r={9} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
              <path d="M -18 40 Q -22 60 -20 74" stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.7} />
            </g>
            {/* 鈴の音 */}
            {[0, 1, 2].map((k) => {
              const q = ((f / 6 + k / 3) % 1);
              return <path key={k} d={`M ${-210 - q * 50} ${-150 - q * 20} q -20 30 0 60`} stroke={HP.spark} strokeWidth={7}
                fill="none" strokeLinecap="round" opacity={1 - q} />;
            })}
          </HmEbBody>
          {/* 足もとのけむり */}
          {[0, 1].map((k) => (
            <circle key={k} cx={bx + 60 + k * 36 + (f % 8) * 3} cy={840 - k * 10} r={14 + (f % 8) * 1.5} fill="none" stroke={KRP.white}
              strokeWidth={4} opacity={0.5 * (1 - (f % 8) / 8)} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #97 8時間で仕事が終われば、そのあとの夜が、毎日やってくるからです。
// 格: 山 / seed 5097
// どこ: 戦後の町の夕方。左に工場 (れんがの壁・のこぎり屋根・煙突・鉄の門・サイレンの柱)、まん中に商店街 (日よけ・店先の品)、右に銭湯 (高い煙突・のれん)、その先に家並み
// 演出: 終業のサイレンが鳴り、門につまっていた人たちがわっと出て、商店街・銭湯・家へ散っていく。手前では1人が大きくのびをし、もう1人は洗面器を抱えて銭湯へ。空は夕焼けから夜へ。家々の窓に灯がともる。空に浮かぶ日めくりが、ぱらぱらめくれて「毎日」を表す
// 動き: サイレンの音の輪 / 人が散る / 空が暗くなり星と月 / 窓に灯が順にともる / 日めくりがめくれて飛ぶ / カメラがゆっくり引く
const Hm097: React.FC<{ f: number }> = ({ f }) => {
  const night = easeInOut(seg(f, 6, 38));
  const cam = lerp(1.07, 1.0, easeInOut(seg(f, 0, 42)));
  // 日めくり (1 → 7 と6回めくれる)
  const cp = seg(f, 6, 40) * 6;
  const page = Math.min(6, Math.floor(cp));
  const flipT = cp >= 6 ? 1 : cp - page;
  // 散っていく人たち: [行き先x, 行き先y, 色]
  const dests: [number, number, string][] = [
    [930, 742, C.workCloth], [1010, 748, "#8E7A6A"], [1100, 740, C.workCloth], [1200, 746, "#7A8E7A"],
    [1290, 742, C.workClothDark], [1480, 736, C.workCloth], [1560, 744, "#8E7A6A"], [1760, 740, C.workClothDark],
    [1860, 748, C.workCloth], [120, 760, "#7A8E7A"], [240, 770, C.workCloth], [1400, 760, "#8E6A6A"],
  ];
  // 窓 [x, y, w, h, 灯るコマ]
  const wins: [number, number, number, number, number][] = [
    [860, 560, 70, 50, 14], [990, 560, 70, 50, 22], [1130, 560, 70, 50, 18], [1250, 560, 70, 50, 27],
    [1720, 600, 60, 50, 20], [1830, 600, 60, 50, 30], [1760, 480, 50, 40, 34], [1440, 540, 60, 44, 24],
    [140, 520, 50, 40, 36], [60, 420, 40, 34, 31],
  ];
  return (
    <Frame f={f} seed={5097} dark={night > 0.6}>
      <defs>
        <linearGradient id="hmeb97dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} /><stop offset="0.6" stopColor={C.duskMid} /><stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <linearGradient id="hmeb97night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.nightTop} /><stop offset="1" stopColor={C.nightLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* 空 */}
        <rect x={-80} y={-80} width={2080} height={860} fill="url(#hmeb97dusk)" />
        <rect x={-80} y={-80} width={2080} height={860} fill="url(#hmeb97night)" opacity={night} />
        <circle cx={1500} cy={lerp(520, 640, night)} r={80} fill="#FBC46A" opacity={1 - night} />
        {/* 月と星 */}
        <g opacity={night}>
          <circle cx={1640} cy={150} r={46} fill="#FFF3C4" />
          <circle cx={1660} cy={138} r={40} fill={C.nightTop} opacity={0.0} />
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={rnd(971, i) * 1920} cy={30 + rnd(972, i) * 330} r={2 + rnd(973, i) * 2.5} fill={KRP.white}
              opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} />
          ))}
        </g>
        {/* 空の日めくり */}
        <g transform={`translate(1180 210) rotate(${Math.sin(f / 14) * 2})`}>
          <circle cx={0} cy={0} r={150} fill={KRP.white} opacity={0.1 + 0.08 * night} />
          <rect x={-90} y={-110} width={180} height={34} rx={6} fill={HP.rest} stroke={KRP.ink} strokeWidth={5} />
          {[-40, 40].map((rx) => <circle key={rx} cx={rx} cy={-93} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={-90} y={-78} width={180} height={190} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {/* 下に重なった紙 */}
          <rect x={-86} y={108} width={172} height={6} fill={KRP.gray} />
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128}
            fill={page === 6 ? HP.rest : KRP.ink}>{page + 1}</text>
          {/* めくれて飛ぶ紙 */}
          {flipT < 1 && (
            <g transform={`translate(${flipT * 260} ${-78 - flipT * 90 + flipT * flipT * 120}) rotate(${flipT * 140})`} opacity={1 - flipT}>
              <rect x={-90} y={0} width={180} height={190} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <text x={0} y={148} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill={KRP.ink}>{page}</text>
            </g>
          )}
          {/* 前に飛んだ紙 (ひらひら) */}
          {Array.from({ length: page }, (_, k) => {
            const age = cp - k - 1;
            if (age > 2.5 || age < 0) return null;
            return <rect key={k} x={180 + age * 140} y={-120 + age * 60 + Math.sin(age * 6) * 20} width={60} height={64} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={3} opacity={Math.max(0, 1 - age / 2.5)} transform={`rotate(${age * 160 + k * 30} ${210 + age * 140} ${-88 + age * 60})`} />;
          })}
        </g>
        {/* 遠くの家並み */}
        <g fill={C.houseRoof} opacity={0.75}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${i * 130 - 40} 640 l 0 -${50 + rnd(974, i) * 50} l 65 -36 l 65 36 l 0 ${50 + rnd(974, i) * 50} Z`} />
          ))}
        </g>
        {/* 工場 */}
        <g>
          <rect x={60} y={40} width={80} height={460} fill={C.brickDark} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((k) => <rect key={k} x={56} y={60 + k * 60} width={88} height={12} fill={KRP.white} opacity={0.8} />)}
          {[0, 1, 2].map((k) => {
            const q = ((f / 30 + k / 3) % 1);
            return <circle key={k} cx={100 + q * 120} cy={20 - q * 110} r={30 + q * 40} fill={KRP.gray} opacity={0.55 * (1 - q)} />;
          })}
          <rect x={-40} y={380} width={500} height={330} fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
          <path d="M -40 380 L 40 300 L 40 380 L 140 300 L 140 380 L 240 300 L 240 380 L 340 300 L 340 380 L 440 300 L 440 380 Z"
            fill={C.roofGray} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 6 }, (_, r) => <line key={r} x1={-40} y1={410 + r * 50} x2={460} y2={410 + r * 50} stroke={C.brickDark} strokeWidth={3} />)}
          {[40, 180, 320].map((wx) => <rect key={wx} x={wx} y={430} width={90} height={70} fill={C.windowDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 門柱と開いた鉄の門 */}
          {[450, 700].map((gx) => (
            <g key={gx}>
              <rect x={gx - 24} y={480} width={48} height={250} fill="#B9AE9C" stroke={KRP.ink} strokeWidth={6} />
              <rect x={gx - 32} y={466} width={64} height={22} fill="#9C917F" stroke={KRP.ink} strokeWidth={5} />
              <circle cx={gx} cy={456} r={14} fill={C.lamp} stroke={KRP.ink} strokeWidth={4} opacity={0.4 + 0.6 * night} />
            </g>
          ))}
          <g stroke={KRP.ink} strokeWidth={5}>
            <path d="M 474 520 L 400 560 L 400 720 L 474 720 Z" fill="none" />
            {[0, 1, 2, 3].map((k) => <line key={k} x1={474 - k * 22} y1={520 + k * 12} x2={474 - k * 22} y2={720} />)}
            <path d="M 676 520 L 760 560 L 760 720 L 676 720 Z" fill="none" />
            {[0, 1, 2, 3].map((k) => <line key={k} x1={676 + k * 24} y1={520 + k * 12} x2={676 + k * 24} y2={720} />)}
          </g>
          {/* サイレンの柱 */}
          <rect x={780} y={250} width={18} height={480} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <g transform="translate(789 250)">
            <path d="M -10 -20 L -70 -50 L -70 30 L -10 0 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 10 -20 L 70 -50 L 70 30 L 10 0 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-12} y={-28} width={24} height={36} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((k) => {
              const q = ((f / 9 + k / 3) % 1);
              const op = (1 - q) * (1 - seg(f, 30, 40));
              return (
                <g key={k} opacity={op}>
                  <path d={`M ${-80 - q * 90} ${-60 - q * 30} q ${-30 - q * 20} ${50 + q * 30} 0 ${100 + q * 60}`} stroke={HP.spark} strokeWidth={8} fill="none" strokeLinecap="round" />
                  <path d={`M ${80 + q * 90} ${-60 - q * 30} q ${30 + q * 20} ${50 + q * 30} 0 ${100 + q * 60}`} stroke={HP.spark} strokeWidth={8} fill="none" strokeLinecap="round" />
                </g>
              );
            })}
          </g>
        </g>
        {/* 商店街 */}
        <g>
          {[[820, KRP.cream, C.awningA], [960, "#E9D8C0", C.awningB], [1100, KRP.cream, C.awningC], [1240, "#E0CDB4", C.awningA]].map(([sx, wall, aw], i) => (
            <g key={i}>
              <rect x={sx as number} y={470 - (i % 2) * 40} width={140} height={260 + (i % 2) * 40} fill={wall as string} stroke={KRP.ink} strokeWidth={6} />
              <rect x={(sx as number) + 10} y={480 - (i % 2) * 40} width={120} height={40} fill={C.roofGray} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${(sx as number) - 6} 630 L ${(sx as number) + 146} 630 L ${(sx as number) + 160} 672 L ${(sx as number) - 20} 672 Z`}
                fill={aw as string} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2, 3].map((k) => <line key={k} x1={(sx as number) + 10 + k * 40} y1={630} x2={(sx as number) + 4 + k * 44} y2={672} stroke={KRP.white} strokeWidth={8} opacity={0.6} />)}
              {/* 店先の品 */}
              {[0, 1, 2].map((k) => (
                <g key={k}>
                  <rect x={(sx as number) + 8 + k * 44} y={704} width={38} height={24} fill="#B9874F" stroke={KRP.ink} strokeWidth={3} />
                  {[0, 1, 2].map((j) => <circle key={j} cx={(sx as number) + 16 + k * 44 + j * 11} cy={700} r={7}
                    fill={[KRP.red, KRP.green, KRP.orange, KRP.yellow][(i + k + j) % 4]} stroke={KRP.ink} strokeWidth={2} />)}
                </g>
              ))}
              {/* 提灯 */}
              <g transform={`translate(${(sx as number) + 70} ${690}) rotate(${Math.sin(f / 9 + i) * 5})`}>
                <line x1={0} y1={-18} x2={0} y2={0} stroke={KRP.ink} strokeWidth={3} />
              </g>
            </g>
          ))}
          {/* 通りの上の提灯の列 */}
          <path d="M 820 440 Q 1100 480 1380 430" stroke={KRP.ink} strokeWidth={3} fill="none" />
          {Array.from({ length: 7 }, (_, i) => {
            const lx = 860 + i * 76, ly = 452 + Math.sin((i / 6) * Math.PI) * 30;
            return (
              <g key={i} transform={`rotate(${Math.sin(f / 8 + i) * 6} ${lx} ${ly - 10})`}>
                <ellipse cx={lx} cy={ly + 10} rx={14} ry={20} fill={i % 2 ? KRP.red : KRP.white} stroke={KRP.ink} strokeWidth={3} />
                <ellipse cx={lx} cy={ly + 10} rx={20} ry={24} fill={C.lamp} opacity={0.35 * night} />
              </g>
            );
          })}
        </g>
        {/* 銭湯 */}
        <g>
          <rect x={1590} y={80} width={50} height={420} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => {
            const q = ((f / 26 + k / 3) % 1);
            return <circle key={k} cx={1615 - q * 80} cy={60 - q * 100} r={22 + q * 34} fill={KRP.white} opacity={0.5 * (1 - q)} />;
          })}
          <rect x={1400} y={500} width={260} height={230} fill="#D9C6A4" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1370 510 L 1530 400 L 1690 510 Z" fill={C.houseRoof} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 1490 470 Q 1530 440 1570 470" stroke={KRP.ink} strokeWidth={5} fill="none" />
          {/* のれん (湯の印) */}
          <rect x={1460} y={600} width={140} height={70} fill={C.awningB} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => <line key={k} x1={1495 + k * 35} y1={600} x2={1495 + k * 35} y2={670} stroke={KRP.ink} strokeWidth={3} />)}
          <ellipse cx={1530} cy={652} rx={30} ry={8} fill="none" stroke={KRP.white} strokeWidth={4} />
          {[-14, 0, 14].map((dx) => <path key={dx} d={`M ${1530 + dx} 640 q -6 -10 0 -18 q 6 -8 0 -16`} stroke={KRP.white} strokeWidth={4} fill="none" />)}
        </g>
        {/* 家 */}
        {[[1700, 560], [1820, 540]].map(([hx, hy], i) => (
          <g key={i}>
            <rect x={hx} y={hy} width={120} height={730 - hy} fill={C.house} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${hx - 16} ${hy + 4} L ${hx + 60} ${hy - 70} L ${hx + 136} ${hy + 4} Z`} fill={C.houseRoof} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* 窓 (灯がともる) */}
        {wins.map(([wx, wy, ww, wh, on], i) => {
          const lit = seg(f, on, on + 4);
          return (
            <g key={i}>
              <rect x={wx} y={wy} width={ww} height={wh} fill={C.windowDark} stroke={KRP.ink} strokeWidth={4} />
              {lit > 0 && <rect x={wx - 14} y={wy - 14} width={ww + 28} height={wh + 28} rx={14} fill={C.lamp} opacity={0.3 * lit} />}
              {lit > 0 && <rect x={wx + 3} y={wy + 3} width={ww - 6} height={wh - 6} fill={C.lamp} opacity={lit} />}
              <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 道 */}
        <rect x={-80} y={720} width={2080} height={420} fill={C.road} />
        <rect x={-80} y={718} width={2080} height={10} fill={C.roadDark} />
        <path d="M 570 730 L 300 1140 M 570 730 L 1000 1140 M 570 730 L 1900 900" stroke={C.roadDark} strokeWidth={5} opacity={0.5} fill="none" />
        <rect x={-80} y={720} width={2080} height={420} fill={C.nightTop} opacity={0.35 * night} />
        {/* 散っていく人たち (門から) */}
        {dests.map(([dx, dy, col], i) => {
          const t = easeInOut(seg(f, 2 + i * 1.6, 26 + i * 1.3));
          const sx = 575 + (i % 4 - 1.5) * 18, sy = 724 + (i % 3) * 6;
          const x = lerp(sx, dx, t), y = lerp(sy, dy, t) - Math.abs(Math.sin(f / 3 + i)) * 6 * (t > 0 && t < 1 ? 1 : 0);
          return <PersonMini key={i} x={x} y={y} s={0.4} color={col} f={f} phase={i} face="smile" arms={i % 5 === 0 ? "up" : "down"} />;
        })}
        {/* 手前: のびをする工員 */}
        <Person x={760} y={930} s={0.8} f={f} face="joy" pose="banzai" cloth={C.workCloth} clothDark={C.workClothDark} phase={1} />
        <HmEbBody x={760} y={930} s={0.8} f={f} phase={1}>
          <path d="M -66 -262 Q -60 -316 0 -318 Q 60 -316 66 -262 Z" fill={C.workClothDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -66 -262 L 100 -262 Q 100 -248 84 -248 L -66 -250 Z" fill={C.workClothDark} stroke={KRP.ink} strokeWidth={4} />
        </HmEbBody>
        {/* のびの線 */}
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${760 + (k - 1) * 110} ${640 - (k === 1 ? 40 : 0)} l ${(k - 1) * 20} -30`} stroke={HP.spark} strokeWidth={7}
            strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 4)} />
        ))}
        {/* 弁当箱 (足もと) */}
        <g transform="translate(860 920)">
          <rect x={-40} y={-30} width={80} height={30} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 -22 Q 0 -44 40 -22" stroke={KRP.red} strokeWidth={6} fill="none" />
        </g>
        {/* 手前: 洗面器を抱えて銭湯へ */}
        <Person x={lerp(1180, 1300, easeOut(seg(f, 0, 42)))} y={940} s={0.76} f={f} face="smile" pose="hold" cloth="#8E7A6A" clothDark="#6A5A4E" phase={3} />
        <HmEbBody x={lerp(1180, 1300, easeOut(seg(f, 0, 42)))} y={940} s={0.76} f={f} phase={3}>
          {/* 頭の手ぬぐい */}
          <path d="M -60 -270 Q 0 -316 60 -270 L 56 -252 Q 0 -290 -56 -252 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 50 -262 l 30 14 l -6 14 l -30 -12 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {/* 洗面器 */}
          <path d="M -70 -140 L 70 -140 L 52 -96 L -52 -96 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-140} rx={70} ry={12} fill="#F7DE7C" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-24} y={-164} width={30} height={22} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </HmEbBody>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #98 仕事のあとの、数時間。これが、「時間の暇」です。
// 格: 山 / seed 5098
// どこ: 夜の昭和の茶の間。ふすま・土壁・夜の窓 (月)・柱時計・裸電球の傘・畳・ちゃぶ台・たんすの上のラジオ
// 演出: 仕事から帰ったお父さんがちゃぶ台で将棋の駒をぱちん。相手はなぜか猫 (首をかしげる)。子どもはラジオに耳を寄せ、お母さんは編み物。毛糸玉が転がってちゃぶ台の下へ。柱時計の「仕事のあと」の数時間だけが山吹色に塗られ、札「時間の暇」
// 動き: 時計の扇形が塗られる / 駒をぱちん (衝撃の線) / ラジオから音符 / 毛糸玉が転がり糸がのびる / 電球の光がゆらぐ / 振り子 / カメラがじわっと寄る
const Hm098: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const fill = easeInOut(seg(f, 8, 32));
  // 時計の扇形: 5時 (150°) から 10時 (300°) まで
  const a0 = 150, a1 = 150 + 150 * fill;
  const R = 74;
  const pt = (deg: number, r: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r];
  const [sx0, sy0] = pt(a0, R), [sx1, sy1] = pt(a1, R);
  const sector = `M 0 0 L ${sx0} ${sy0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${sx1} ${sy1} Z`;
  const slap = seg(f, 28, 30);
  const burst = f >= 30 ? clamp01(1 - (f - 30) / 20) : 0;
  const pieceY = f < 28 ? -30 + Math.sin(f / 5) * 4 : lerp(-30, 0, slap);
  const ball = easeOut(seg(f, 4, 40));
  const bx = lerp(500, 990, ball), by = 900;
  const flick = 0.9 + 0.1 * Math.sin(f / 3.3);
  const swing = Math.sin(f / 7) * 14;
  return (
    <Frame f={f} seed={5098} dark>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* 壁: 左はふすま、右は土壁 */}
        <rect x={-60} y={-60} width={2040} height={720} fill={C.tsuchikabe} />
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={rnd(981, i) * 1920} cy={rnd(982, i) * 640} r={2 + rnd(983, i) * 2} fill={C.wood} opacity={0.18} />
        ))}
        <rect x={-60} y={-60} width={2040} height={70} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1].map((k) => (
          <g key={k}>
            <rect x={460 + k * 250} y={10} width={250} height={640} fill={C.fusuma} stroke={C.wood} strokeWidth={10} />
            <path d={`M ${480 + k * 250} 420 q 60 -60 120 -20 q 50 30 100 -10`} stroke="#9AAE8A" strokeWidth={6} fill="none" opacity={0.7} />
            <ellipse cx={680 + k * 250 - (k ? 230 : 0)} cy={330} rx={10} ry={16} fill="none" stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={1230} y={10} width={26} height={650} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 夜の窓 (障子を開けて月) */}
        <g>
          <rect x={80} y={110} width={320} height={300} fill={C.nightTop} stroke={C.wood} strokeWidth={14} />
          <circle cx={300} cy={190} r={36} fill="#FFF3C4" />
          {[[150, 160], [210, 300], [350, 340]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} />)}
          <line x1={240} y1={110} x2={240} y2={410} stroke={C.wood} strokeWidth={8} />
          <rect x={60} y={404} width={360} height={20} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 畳 */}
        <rect x={-60} y={650} width={2040} height={500} fill={C.tatami} />
        <rect x={-60} y={644} width={2040} height={14} fill={C.wood} />
        <g stroke={C.tatamiLine} strokeWidth={2} opacity={0.7}>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-60} y1={670 + i * 20} x2={1980} y2={670 + i * 20} />)}
        </g>
        <path d="M 320 658 L 120 1140 M 1100 658 L 1160 1140 M 1580 658 L 1880 1140" stroke={C.tatamiEdge} strokeWidth={14} />
        {/* 柱時計 */}
        <g transform="translate(1420 0)">
          <rect x={-100} y={90} width={200} height={420} rx={14} fill={C.tansu} stroke={KRP.ink} strokeWidth={7} />
          <path d="M -110 100 Q 0 40 110 100 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <g transform="translate(0 200)">
            <circle r={88} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            {fill > 0 && <path d={sector} fill={HP.jikan} stroke={HP.jikanDark} strokeWidth={3} />}
            {Array.from({ length: 12 }, (_, i) => {
              const [x1, y1] = pt(i * 30, 68), [x2, y2] = pt(i * 30, 82);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 7} strokeLinecap="round" />;
            })}
            {/* 針は夜の8時ごろ */}
            <line x1={0} y1={0} x2={pt(240, 44)[0]} y2={pt(240, 44)[1]} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
            <line x1={0} y1={0} x2={pt((f * 2) % 360, 66)[0]} y2={pt((f * 2) % 360, 66)[1]} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <circle r={8} fill={KRP.ink} />
          </g>
          {/* 振り子の窓 */}
          <rect x={-60} y={310} width={120} height={180} rx={8} fill="#3E3026" stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${swing} 0 316)`}>
            <line x1={0} y1={316} x2={0} y2={440} stroke={HP.brass} strokeWidth={5} />
            <circle cx={0} cy={452} r={20} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 札「時間の暇」と、時計の扇形を指す線 */}
        <path d="M 1560 250 Q 1540 226 1506 222" stroke={KRP.ink} strokeWidth={5} fill="none" strokeDasharray="10 8" opacity={seg(f, 30, 36)} />
        <TagPlate x={1690} y={250} text="時間の暇" size={52} t={seg(f, 30, 38)} fill={HP.jikan} color={KRP.ink} />
        {/* たんすとラジオ (子どもの耳の高さ) */}
        <g transform="translate(0 110)">
          <rect x={1600} y={520} width={300} height={200} fill={C.tansu} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1].map((r) => <g key={r}>
            <line x1={1600} y1={586 + r * 66} x2={1900} y2={586 + r * 66} stroke={KRP.ink} strokeWidth={4} />
            <rect x={1730} y={556 + r * 66} width={40} height={10} rx={4} fill={HP.brass} stroke={KRP.ink} strokeWidth={2} />
          </g>)}
          <g transform="translate(1750 520)">
            <rect x={-110} y={-150} width={220} height={150} rx={30} fill={C.radio} stroke={KRP.ink} strokeWidth={7} />
            <path d="M -110 -110 Q -110 -150 -70 -150 L 70 -150 Q 110 -150 110 -110" fill="#94613A" stroke={KRP.ink} strokeWidth={5} />
            <rect x={-86} y={-120} width={110} height={90} rx={10} fill="#D9C29A" stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 5 }, (_, k) => <line key={k} x1={-80} y1={-108 + k * 16} x2={18} y2={-108 + k * 16} stroke={C.wood} strokeWidth={3} />)}
            <circle cx={64} cy={-96} r={18} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={64} cy={-46} r={14} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-90} cy={-20} r={6} fill={C.lamp} opacity={0.6 + 0.4 * Math.sin(f / 3)} />
          </g>
          {/* 音符 */}
          {[0, 1, 2, 3].map((k) => {
            const q = ((f / 22 + k / 4) % 1);
            const nx = 1660 - q * 160 + Math.sin(q * 8 + k) * 20, ny = 400 - q * 170;
            return (
              <g key={k} opacity={Math.sin(q * Math.PI)} transform={`translate(${nx} ${ny}) rotate(${Math.sin(f / 5 + k) * 12})`}>
                <ellipse cx={0} cy={0} rx={13} ry={10} fill={k % 2 ? HP.jikan : KRP.white} stroke={KRP.ink} strokeWidth={3} transform="rotate(-20)" />
                <line x1={11} y1={-4} x2={11} y2={-44} stroke={KRP.ink} strokeWidth={4} />
                {k % 2 === 0 && <path d="M 11 -44 q 16 6 14 22" stroke={KRP.ink} strokeWidth={4} fill="none" />}
              </g>
            );
          })}
        </g>
        {/* 電球の傘と光 */}
        <line x1={960} y1={10} x2={960} y2={150} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="890,220 1030,220 1360,860 560,860" fill={C.warm} opacity={0.16 * flick} />
        <path d="M 870 222 Q 960 130 1050 222 Z" fill={C.lampShade} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={960} cy={228} r={16} fill={C.lamp} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={960} cy={228} r={44} fill={C.lamp} opacity={0.3 * flick} />
        {/* お母さん (編み物) */}
        <Person x={380} y={850} s={0.9} f={f} face="smile" pose="hold" cloth={C.momCloth} clothDark={C.momClothDark} phase={2} />
        <HmEbBody x={380} y={850} s={0.9} f={f} phase={2}>
          <HmEbBun side={-1} />
          {/* 割烹着の白い前 */}
          <rect x={-40} y={-150} width={80} height={96} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
          {/* 編み棒と編みかけ */}
          <line x1={-40} y1={-104} x2={20} y2={-150} stroke={C.wood} strokeWidth={5} strokeLinecap="round"
            transform={`rotate(${Math.sin(f / 3) * 6} -14 -118)`} />
          <line x1={40} y1={-104} x2={-20} y2={-150} stroke={C.wood} strokeWidth={5} strokeLinecap="round"
            transform={`rotate(${-Math.sin(f / 3) * 6} 14 -118)`} />
          <path d="M -24 -112 L 24 -112 L 30 -40 Q 0 -30 -30 -40 Z" fill={C.knitRed} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((k) => <path key={k} d={`M -22 ${-96 + k * 18} q 11 8 22 0 q 11 -8 22 0`} stroke="#A83838" strokeWidth={3} fill="none" />)}
        </HmEbBody>
        {/* 毛糸の糸と転がる毛糸玉 */}
        <path d={`M 400 760 Q 440 880 ${(400 + bx) / 2} ${by + 10} T ${bx} ${by}`} stroke={C.knitRed} strokeWidth={4} fill="none" />
        <g transform={`translate(${bx} ${by - 22}) rotate(${ball * 720})`}>
          <circle r={24 - ball * 4} fill={C.knitRed} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -16 -10 Q 0 6 16 -12 M -18 6 Q 0 20 16 6" stroke="#A83838" strokeWidth={3} fill="none" />
        </g>
        {/* ちゃぶ台 */}
        <g>
          {[[800, 0], [1180, 0], [870, 1], [1110, 1]].map(([lx, back], i) => (
            <rect key={i} x={lx - 12} y={790 - (back ? 20 : 0)} width={24} height={70 - (back ? 20 : 0)} fill={C.chabudai} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <ellipse cx={990} cy={790} rx={300} ry={64} fill={C.chabudai} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={990} cy={772} rx={300} ry={62} fill={C.chabudaiTop} stroke={KRP.ink} strokeWidth={7} />
          {/* 湯のみと急須 */}
          <path d="M 760 770 L 764 736 L 796 736 L 800 770 Z" fill="#7FA6A0" stroke={KRP.ink} strokeWidth={4} />
          {[0, 1].map((k) => <path key={k} d={`M ${774 + k * 12} 728 q 6 -12 0 -24`} stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.5}
            transform={`translate(0 ${-((f + k * 7) % 14)})`} />)}
          {/* 将棋盤 */}
          <polygon points="900,730 1110,730 1140,782 870,782" fill={C.shogi} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="870,782 1140,782 1140,800 870,800" fill="#C49A52" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, k) => (
            <line key={`v${k}`} x1={900 + (k + 1) * 23.3} y1={730} x2={870 + (k + 1) * 30} y2={782} stroke={KRP.ink} strokeWidth={1.5} opacity={0.6} />
          ))}
          {Array.from({ length: 4 }, (_, k) => (
            <line key={`h${k}`} x1={900 - (k + 1) * 6} y1={730 + (k + 1) * 10.4} x2={1110 + (k + 1) * 6} y2={730 + (k + 1) * 10.4} stroke={KRP.ink} strokeWidth={1.5} opacity={0.6} />
          ))}
          {[[930, 744], [980, 740], [1040, 760], [1080, 744], [1010, 770], [960, 766]].map(([kx, ky], i) => (
            <path key={i} d={`M ${kx} ${ky - 10} l 8 4 l 2 10 l -20 0 l 2 -10 Z`} fill="#F3DCA0" stroke={KRP.ink} strokeWidth={2.5} />
          ))}
        </g>
        {/* お父さん: 駒をぱちん */}
        <Person x={720} y={846} s={0.95} f={f} face={f < 30 ? "normal" : "smile"} pose="point" pointDir={1} lean={12}
          cloth={KRP.white} clothDark={C.workClothDark} phase={0} />
        <HmEbBody x={720} y={846} s={0.95} f={f} lean={12}>
          {/* 首の手ぬぐい */}
          <path d="M -40 -164 Q 0 -140 40 -164 L 44 -120 L 30 -120 L 30 -150 Q 0 -136 -30 -150 L -30 -110 L -44 -110 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
        </HmEbBody>
        {/* 打った駒と衝撃の線 */}
        <g transform={`translate(896 ${748 + pieceY})`}>
          <path d="M 0 -16 l 12 6 l 3 16 l -30 0 l 3 -16 Z" fill="#F3DCA0" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {burst > 0 && (
          <g opacity={burst}>
            {Array.from({ length: 7 }, (_, k) => {
              const a = (-160 + k * 23) * Math.PI / 180;
              const r0 = 30, r1 = 30 + 40 * (1 - burst * 0.4);
              return <line key={k} x1={896 + Math.cos(a) * r0} y1={748 + Math.sin(a) * r0} x2={896 + Math.cos(a) * r1} y2={748 + Math.sin(a) * r1}
                stroke={HP.spark} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 相手は猫 */}
        <g transform="translate(1270 790)">
          <ellipse cx={0} cy={0} rx={56} ry={46} fill={C.cat} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 40 20 Q ${90 + Math.sin(f / 5) * 16} 10 ${80 + Math.sin(f / 5) * 20} -40`} stroke={KRP.ink} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={`M 40 20 Q ${90 + Math.sin(f / 5) * 16} 10 ${80 + Math.sin(f / 5) * 20} -40`} stroke={C.cat} strokeWidth={11} fill="none" strokeLinecap="round" />
          <g transform={`translate(-10 -62) rotate(${-14 + Math.sin(f / 9) * 4})`}>
            <path d="M -36 -20 L -30 -58 L -8 -34 Z M 36 -20 L 30 -58 L 8 -34 Z" fill={C.cat} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <circle r={40} fill={C.cat} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -24 -30 l 8 10 M 0 -36 l 0 12 M 24 -30 l -8 10" stroke={C.catDark} strokeWidth={4} />
            {/* 目は将棋盤から毛糸玉へ */}
            {[-15, 15].map((ex) => <g key={ex}><circle cx={ex} cy={-4} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={ex + lerp(-4, -5, ball)} cy={-4 + lerp(1, 5, ball)} r={4.5} fill={KRP.ink} /></g>)}
            <path d="M -6 10 L 6 10 L 0 16 Z" fill="#D9707A" />
            <path d="M -30 14 l -26 -4 M -30 20 l -24 6 M 30 14 l 26 -4 M 30 20 l 24 6" stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        </g>
        <QMark x={1330} y={640} s={0.45} f={f} t={seg(f, 32, 38)} color={KRP.blueDeep} />
        {/* 子ども: ラジオに耳を寄せる */}
        <Person x={1540} y={866} s={0.72} f={f} face="joy" pose="hold" lean={16} cloth={C.kidCloth} clothDark={C.kidClothDark} phase={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #99 暇のものさしに、2つ目の目盛り、「時間」が刻まれました。
// 格: 山 / seed 5099
// どこ: #18 と同じ作業机 (Sagyozukue)。ものさしは天板のまん中
// 演出: 「日」はすでに橙。のみが「時間」の区画を左から刻んでいき、木くずがくるくる飛ぶ。刻み終わると札が山吹色に塗られ、区画の上に懐中時計がぽんと乗る。捜索係は虫めがねで見守り、刻み終わった瞬間にガッツポーズ
// 動き: f0-34 刻む (木くず・コツコツの輪) / カメラは「時間」の区画に寄った所から全体へ引く / 札が塗られて光る / 懐中時計がぽん / ガッツポーズ
const Hm099: React.FC<{ f: number }> = ({ f }) => {
  const p = seg(f, 0, 34);
  const lit = 1 + p;
  const back = easeInOut(seg(f, 26, 42));
  const z = lerp(1.32, 1.0, back);
  const cx = lerp(800, 960, back), cy = lerp(540, 540, back);
  const [wx, wy] = monoSlot(1, 960, 560, 1);
  const watch = pop(seg(f, 34, 40));
  const done = f >= 35;
  const tipX = 630 + 310 * p, tipY = 529;
  const glow = seg(f, 34, 40);
  return (
    <Frame f={f} seed={5099}>
      <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
        <Sagyozukue f={f} />
        <Monosashi x={960} y={560} s={1} lit={lit} f={f} focus={done ? 1 : undefined} />
        {/* コツコツの輪 (10コマに1回) */}
        {!done && (() => {
          const q = (f % 10) / 10;
          return <circle cx={tipX} cy={tipY - 120} r={20 + q * 40} fill="none" stroke={KRP.white} strokeWidth={5} opacity={(1 - q) * 0.8} />;
        })()}
        {/* 木くず (飛ぶ) */}
        {Array.from({ length: 9 }, (_, k) => {
          const born = k * 4;
          const age = f - born;
          if (age < 0 || age > 14 || born > 34) return null;
          const bx0 = 630 + 310 * seg(born, 0, 34);
          const x = bx0 - age * (6 + rnd(991, k) * 6);
          const y = tipY - 10 - age * 9 + age * age * 0.7;
          return <path key={k} d="M 0 0 q 10 -12 18 0 q 6 10 -4 14 q -8 2 -8 -6" fill={HP.woodMid} stroke={KRP.ink} strokeWidth={2.5}
            transform={`translate(${x} ${y}) rotate(${age * 40 + k * 50})`} opacity={1 - age / 16} />;
        })}
        {/* 机に積もった木くず */}
        {Array.from({ length: Math.floor(p * 8) }, (_, k) => (
          <path key={k} d="M 0 0 q 10 -12 18 0 q 6 10 -4 14 q -8 2 -8 -6" fill={HP.woodMid} stroke={KRP.ink} strokeWidth={2.5}
            transform={`translate(${600 + rnd(992, k) * 300} ${740 + rnd(993, k) * 40}) rotate(${rnd(994, k) * 360})`} />
        ))}
        {/* 札が塗られた瞬間の光 */}
        {glow > 0 && (
          <g opacity={1 - glow * 0.5}>
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k * 45) * Math.PI / 180;
              const r0 = 96, r1 = 96 + 50 * glow;
              return <line key={k} x1={785 + Math.cos(a) * r0} y1={685 + Math.sin(a) * r0 * 0.6} x2={785 + Math.cos(a) * r1} y2={685 + Math.sin(a) * r1 * 0.6}
                stroke={HP.jikan} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 懐中時計が区画の上にぽん */}
        {watch > 0 && (
          <g transform={`translate(${wx} ${wy}) scale(${watch})`}>
            <ellipse cx={0} cy={2} rx={70} ry={10} fill={KRP.ink} opacity={0.2} />
            <path d="M -50 -4 Q -110 10 -140 -6 Q -170 -20 -150 -34" stroke={HP.brassDark} strokeWidth={6} fill="none" strokeDasharray="8 5" />
            <circle cx={0} cy={-112} r={14} fill="none" stroke={HP.brass} strokeWidth={8} />
            <rect x={-12} y={-104} width={24} height={20} rx={4} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-46} r={50} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
            <HmEbClockFace x={0} y={-46} r={40} f={f * 3} />
            <path d="M -30 -70 q 10 -10 22 -12" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.7} />
          </g>
        )}
        {/* 捜索係 */}
        {done ? (
          <g>
            <Sousa x={1560} y={930} s={0.62} f={f} face="joy" pose="raise" lean={-4} phase={3} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${1540 + (k - 1) * 70} ${700 - (k === 1 ? 30 : 0)} l ${(k - 1) * 16} -26`} stroke={HP.jikan} strokeWidth={7}
                strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 3)} />
            ))}
          </g>
        ) : (
          <Sousa x={1560} y={930} s={0.62} f={f} face="surprised" pose="stand" lean={-8} lensAt={[1400, 760]} gaze={[-1, 0]} phase={3} />
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #100 日本で、1年間に働く時間がいちばん長かったのは、1960年。
// 格: 図 / seed 5100
// どこ: 昭和の会社の会議室。木の腰板の壁・ブラインドの窓・帽子かけ。ホワイトボードに、大きな方眼紙の折れ線グラフがクリップで留めてある。手前の机に灰皿と湯のみ
// 演出: 1947年から、年間の働く時間の赤い折れ線が右上がりにぐいぐい伸び、1960年でてっぺん。そこに旗が立つ。てっぺんのあとは点線で少し下がる。指さし棒が線の先を追いかけ、最後はてっぺんをトントン
// 動き: 線が伸びる / 指さし棒が追う → てっぺんをたたく / 旗が立ってはためく / 札が出る / カメラが少し寄る
const HmEbGraphPts: [number, number][] = [
  [500, 640], [560, 600], [620, 610], [680, 560], [740, 520], [800, 500], [860, 470], [920, 430],
  [980, 400], [1040, 360], [1100, 330], [1150, 290],
];
const HmEbGraphAfter: [number, number][] = [[1150, 290], [1210, 312], [1270, 330], [1330, 352], [1390, 370], [1450, 392]];
const HmEbPartial = (pts: [number, number][], t: number): [number, number][] => {
  if (t <= 0) return [pts[0]];
  const n = pts.length - 1;
  const u = t * n;
  const k = Math.min(n - 1, Math.floor(u));
  const r = u - k;
  const out = pts.slice(0, k + 1);
  out.push([lerp(pts[k][0], pts[k + 1][0], r), lerp(pts[k][1], pts[k + 1][1], r)]);
  return out;
};
const Hm100: React.FC<{ f: number }> = ({ f }) => {
  const t = easeInOut(seg(f, 4, 30));
  const part = HmEbPartial(HmEbGraphPts, t);
  const tip = part[part.length - 1];
  const after = seg(f, 32, 40);
  const flag = pop(seg(f, 30, 37));
  const tap = f > 32 ? Math.abs(Math.sin((f - 32) / 2.2)) * 16 : 0;
  const pointer: [number, number] = f > 30 ? [1150 + 14, 290 - 40 - tap] : [tip[0] + 14, tip[1] - 14];
  const z = 1 + 0.04 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5100}>
      <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill="#E7DCC4" />
        <rect x={-60} y={600} width={2040} height={540} fill={C.panel} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130} y1={600} x2={i * 130} y2={1140} stroke={C.panelDark} strokeWidth={4} />)}
        <rect x={-60} y={592} width={2040} height={16} fill={C.panelDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 左: ブラインドの窓 */}
        <rect x={30} y={120} width={220} height={400} fill="#BFDDEE" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={34} y={126 + i * 28} width={212} height={14} fill={KRP.white}
          stroke={KRP.gray} strokeWidth={2} transform={`rotate(${Math.sin(f / 15 + i) * 0.8} 140 ${133 + i * 28})`} />)}
        {/* 右: 帽子かけ */}
        <g>
          <rect x={1786} y={140} width={14} height={600} fill={C.panelDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1740 200 Q 1793 120 1846 200 Z" fill="#6E5A44" stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1793} cy={200} rx={74} ry={14} fill="#5A4836" stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 1800 260 Q ${1840 + Math.sin(f / 12) * 4} 360 1830 480 L 1770 480 Q 1760 360 1800 260 Z`} fill="#8E8070" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ホワイトボード */}
        <rect x={300} y={70} width={1340} height={760} rx={12} fill="#B9BDC2" stroke={KRP.ink} strokeWidth={8} />
        <rect x={322} y={92} width={1296} height={716} fill="#FBFBF8" stroke={KRP.ink} strokeWidth={4} />
        {/* 方眼紙 */}
        <g transform="rotate(-0.6 960 450)">
          <rect x={372} y={136} width={1210} height={668} fill={KRP.ink} opacity={0.15} />
          <rect x={360} y={124} width={1210} height={668} fill={C.graphPaper} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.graphLine} strokeWidth={2}>
            {Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={380 + i * 40} y1={130} x2={380 + i * 40} y2={786} />)}
            {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={364} y1={150 + i * 40} x2={1566} y2={150 + i * 40} />)}
          </g>
          {/* クリップ */}
          {[520, 1410].map((cx2) => (
            <g key={cx2}>
              <rect x={cx2 - 40} y={100} width={80} height={44} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${cx2 - 24} 100 Q ${cx2} 70 ${cx2 + 24} 100`} stroke={KRP.ink} strokeWidth={5} fill="none" />
            </g>
          ))}
          {/* 軸 */}
          <line x1={460} y1={690} x2={1520} y2={690} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={460} y1={690} x2={460} y2={190} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <path d="M 1520 690 l -20 -12 l 0 24 Z M 460 190 l -12 20 l 24 0 Z" fill={KRP.ink} />
          <text x={480} y={204} fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}>働く時間</text>
          {Array.from({ length: 21 }, (_, i) => <line key={i} x1={500 + i * 50} y1={690} x2={500 + i * 50} y2={702} stroke={KRP.ink} strokeWidth={3} />)}
          <text x={500} y={742} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={KRP.ink}>1947年</text>
          {/* てっぺんから下ろす点線 */}
          <line x1={1150} y1={300} x2={1150} y2={690} stroke={C.lineRed} strokeWidth={4} strokeDasharray="10 10" opacity={after} />
          {/* 折れ線の下の塗り */}
          <polygon points={`${part.map(([x, y]) => `${x},${y}`).join(" ")} ${tip[0]},690 500,690`} fill={C.lineRed} opacity={0.12} />
          {/* てっぺんのあと (点線で少し下がる) */}
          <polyline points={HmEbPartial(HmEbGraphAfter, after).map(([x, y]) => `${x},${y}`).join(" ")} fill="none"
            stroke={KRP.grayDark} strokeWidth={8} strokeDasharray="14 12" strokeLinecap="round" opacity={0.8} />
          {/* 折れ線 */}
          <polyline points={part.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={KRP.ink} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={part.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={C.lineRed} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
          {part.slice(0, -1).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          {/* 線の先のマーカーの光 */}
          {f < 31 && <circle cx={tip[0]} cy={tip[1]} r={16 + Math.sin(f / 2) * 3} fill={HP.spark} stroke={KRP.ink} strokeWidth={4} />}
          {/* てっぺんの旗 */}
          {flag > 0 && (
            <g transform={`translate(1150 290) scale(${flag})`}>
              <line x1={0} y1={0} x2={0} y2={-150} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
              <path d={`M 4 -148 Q 50 ${-160 + Math.sin(f / 3) * 8} 96 -136 Q 50 ${-112 + Math.sin(f / 3 + 1) * 8} 4 -96 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={0} cy={-154} r={8} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={0} cy={0} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            </g>
          )}
          <TagPlate x={1150} y={752} text="1960年" size={42} t={seg(f, 30, 36)} fill={KRP.yellow} />
          <TagPlate x={1410} y={226} text="いちばん長い" size={44} t={seg(f, 34, 40)} />
        </g>
        {/* 指さし棒 (右下から) */}
        <line x1={1900} y1={980} x2={pointer[0]} y2={pointer[1]} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        <line x1={1900} y1={980} x2={pointer[0]} y2={pointer[1]} stroke="#C49A52" strokeWidth={8} strokeLinecap="round" />
        <circle cx={pointer[0]} cy={pointer[1]} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        {/* 手前の机: 灰皿と湯のみ */}
        <rect x={-60} y={880} width={2040} height={260} fill="#7A5A3A" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-60} y={880} width={2040} height={20} fill="#946E48" />
        <g transform="translate(420 930)">
          <ellipse cx={0} cy={0} rx={80} ry={22} fill="#9AB4B8" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-4} y={-30} width={60} height={10} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} transform="rotate(-14)" />
          <path d={`M 56 -40 q 10 -16 0 -30 q -10 -14 0 -30`} stroke={KRP.gray} strokeWidth={4} fill="none" opacity={0.6}
            transform={`translate(0 ${-((f * 0.8) % 16)})`} />
        </g>
        {[760, 1480].map((tx) => (
          <path key={tx} d={`M ${tx - 30} 940 L ${tx - 26} 890 L ${tx + 26} 890 L ${tx + 30} 940 Z`} fill="#7FA6A0" stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #101 その翌年、1961年には、「レジャー」という言葉が流行語になったとされています。
// 格: 山 / seed 5101
// どこ: 1961年の町角。左にボウリング場 (屋根に大きなピン・ガラス窓の中にレーン)、まん中にデパート (絵だけの垂れ幕3本: ピン / 釣り竿と魚 / 旅行かばん)、右に電器店 (店頭に足つきのテレビ3台)。通りの上に三角の小旗
// 演出: 窓の中でボールがレーンを転がり、ピンがはじけ飛ぶ。テレビの画面がちらつく。釣り竿の男・旅行かばんの女・風船を持つ親子が浮かれ顔で歩き、電器店の前ではテレビにくぎづけの人。風船が空へ。年代札「1961年」と流行語の札「レジャー」
// 動き: ボールが転がりピンが倒れる / テレビがちらつく / 風船が昇る / 垂れ幕・小旗がゆれる / 人が歩く / 屋根のピンがぐらぐら
const HmEbPin: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -100 C 18 -100 20 -76 12 -62 C 30 -40 34 -10 20 0 L -20 0 C -34 -10 -30 -40 -12 -62 C -20 -76 -18 -100 0 -100 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -13 -66 L 13 -66 M -15 -58 L 15 -58" stroke={KRP.red} strokeWidth={5} />
  </g>
);
const Hm101: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeInOut(seg(f, 4, 22));
  const hit = seg(f, 22, 36);
  const walk = f * 0.9;
  const cam = 1.05 - 0.05 * easeOut(seg(f, 0, 42));
  const pins: [number, number][] = [[290, 452], [278, 458], [302, 458], [266, 464], [290, 464], [314, 464]];
  return (
    <Frame f={f} seed={5101}>
      <defs>
        <linearGradient id="hmeb101sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky101} /><stop offset="1" stopColor={C.sky101Low} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        <rect x={-60} y={-60} width={2040} height={800} fill="url(#hmeb101sky)" />
        {/* 雲 */}
        {[[320, 120], [1460, 150]].map(([cx2, cy2], i) => (
          <g key={i} transform={`translate(${cx2 + Math.sin(f / 30 + i) * 10} ${cy2})`} fill={KRP.white} opacity={0.9}>
            <circle cx={0} cy={0} r={40} /><circle cx={44} cy={-12} r={50} /><circle cx={94} cy={4} r={36} />
          </g>
        ))}
        {/* ボウリング場 */}
        <g>
          <rect x={-40} y={220} width={590} height={500} fill={C.bowlWall} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-40} y={220} width={590} height={60} fill={C.bowlWallDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={20 + i * 70} cy={250} r={10} fill={C.lamp}
            stroke={KRP.ink} strokeWidth={3} opacity={(Math.floor(f / 4) + i) % 2 ? 1 : 0.4} />)}
          {/* 屋根の大きなピンとボール */}
          <g transform={`rotate(${Math.sin(f / 5) * 4} 400 220)`}>
            <HmEbPin x={400} y={220} s={1.9} />
          </g>
          <circle cx={250} cy={176} r={44} fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={240} cy={162} r={7} fill={KRP.white} opacity={0.5} /><circle cx={258} cy={160} r={6} fill={KRP.grayDark} /><circle cx={252} cy={178} r={6} fill={KRP.grayDark} />
          {/* 窓の中のレーン */}
          <rect x={60} y={340} width={460} height={340} fill="#3E4656" stroke={KRP.ink} strokeWidth={7} />
          <polygon points="150,680 430,680 320,430 260,430" fill={C.lane} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={200 + k * 60} y1={680} x2={272 + k * 12} y2={430} stroke="#C9A870" strokeWidth={2} />)}
          {/* 転がるボール */}
          <circle cx={lerp(300, 290, roll)} cy={lerp(660, 462, roll)} r={lerp(26, 10, roll)} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          {/* ピン */}
          {pins.map(([px, py], i) => {
            const dir = (i % 2 ? 1 : -1) * (0.6 + rnd(1011, i));
            const fly = hit;
            return <HmEbPin key={i} x={px + dir * 70 * fly} y={py - Math.sin(fly * Math.PI) * 40 * (0.5 + rnd(1012, i)) + fly * 12}
              s={0.26} rot={dir * 110 * fly} />;
          })}
          {hit > 0 && hit < 1 && (
            <g opacity={1 - hit}>
              {Array.from({ length: 6 }, (_, k) => {
                const a = (k * 60) * Math.PI / 180;
                return <line key={k} x1={290 + Math.cos(a) * 20} y1={446 + Math.sin(a) * 14} x2={290 + Math.cos(a) * (40 + hit * 40)} y2={446 + Math.sin(a) * (30 + hit * 30)}
                  stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />;
              })}
            </g>
          )}
          <line x1={290} y1={340} x2={290} y2={680} stroke={KRP.ink} strokeWidth={6} opacity={0} />
          <rect x={60} y={340} width={460} height={340} fill={KRP.white} opacity={0.08} />
        </g>
        {/* デパート */}
        <g>
          <rect x={570} y={150} width={780} height={570} fill={C.dept} stroke={KRP.ink} strokeWidth={7} />
          <rect x={556} y={140} width={808} height={34} fill={C.deptDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
            <rect key={`${r}${c}`} x={600 + c * 106} y={200 + r * 90} width={70} height={56} fill="#A9CFE0" stroke={KRP.ink} strokeWidth={3} />
          )))}
          {/* 垂れ幕 (絵だけ) */}
          {[[640, KRP.red], [885, C.awningB], [1130, KRP.blueDeep]].map(([bx, col], i) => (
            <g key={i} transform={`rotate(${Math.sin(f / 10 + i) * 1.5} ${(bx as number) + 75} 176)`}>
              <rect x={bx as number} y={176} width={150} height={360} fill={col as string} stroke={KRP.ink} strokeWidth={6} />
              <rect x={(bx as number) + 12} y={190} width={126} height={330} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.7} />
              {i === 0 && <g><HmEbPin x={(bx as number) + 60} y={430} s={1.2} /><circle cx={(bx as number) + 108} cy={410} r={22} fill={KRP.ink} /></g>}
              {i === 1 && (
                <g>
                  <line x1={(bx as number) + 20} y1={480} x2={(bx as number) + 130} y2={220} stroke={C.wood} strokeWidth={7} strokeLinecap="round" />
                  <path d={`M ${(bx as number) + 130} 220 Q ${(bx as number) + 140} 320 ${(bx as number) + 110} 380`} stroke={KRP.white} strokeWidth={3} fill="none" />
                  <g transform={`translate(${(bx as number) + 106} ${400}) rotate(${Math.sin(f / 4) * 14})`}>
                    <path d="M -30 0 Q 0 -20 26 0 Q 0 20 -30 0 Z M 26 0 l 16 -14 l 0 28 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
                    <circle cx={-16} cy={-3} r={3} fill={KRP.ink} />
                  </g>
                </g>
              )}
              {i === 2 && (
                <g transform={`translate(${(bx as number) + 75} 380)`}>
                  <rect x={-52} y={-40} width={104} height={80} rx={10} fill="#B9874F" stroke={KRP.ink} strokeWidth={5} />
                  <path d="M -20 -40 L -20 -56 L 20 -56 L 20 -40" stroke={KRP.ink} strokeWidth={6} fill="none" />
                  <line x1={-52} y1={-6} x2={52} y2={-6} stroke={C.wood} strokeWidth={4} />
                  <circle cx={-26} cy={18} r={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={8} y={8} width={30} height={20} rx={3} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} transform="rotate(10 23 18)" />
                </g>
              )}
            </g>
          ))}
          {/* 入口 */}
          <rect x={860} y={580} width={200} height={140} fill="#BFDDEE" stroke={KRP.ink} strokeWidth={6} />
          <line x1={960} y1={580} x2={960} y2={720} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 840 580 L 1080 580 L 1060 556 L 860 556 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 電器店 */}
        <g>
          <rect x={1370} y={300} width={600} height={420} fill={C.shopWall} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1400} y={320} width={520} height={60} rx={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1660 330 l -20 22 l 16 0 l -14 22 l 32 -28 l -16 0 l 14 -16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 1370 390 L 1970 390 L 1990 436 L 1350 436 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M ${1380 + k * 80} 390 l 40 0 l 6 46 l -40 0 Z`} fill={C.awningA} />)}
          <rect x={1400} y={450} width={540} height={260} fill="#EDE6D6" stroke={KRP.ink} strokeWidth={6} />
          {[1490, 1670, 1850].map((tx, i) => {
            const fl = 0.75 + 0.25 * Math.sin(f * 1.7 + i * 2);
            return (
              <g key={tx}>
                <rect x={tx - 70} y={500} width={140} height={110} rx={12} fill={C.tvBody} stroke={KRP.ink} strokeWidth={5} />
                <rect x={tx - 58} y={512} width={92} height={86} rx={10} fill="#B9D6E2" opacity={fl} stroke={KRP.ink} strokeWidth={3} />
                {i === 0 && <path d={`M ${tx - 54} 590 l 26 -40 l 20 24 l 14 -14 l 26 30 Z`} fill={C.grassDark} opacity={0.8} />}
                {i === 1 && <circle cx={tx - 12} cy={556} r={16 + Math.sin(f / 2) * 3} fill={KRP.orange} opacity={0.8} />}
                {i === 2 && Array.from({ length: 5 }, (_, k) => <line key={k} x1={tx - 56} y1={518 + ((k * 18 + f * 5) % 80)} x2={tx + 32} y2={518 + ((k * 18 + f * 5) % 80)} stroke={KRP.white} strokeWidth={4} opacity={0.7} />)}
                <circle cx={tx + 50} cy={530} r={7} fill={HP.brass} stroke={KRP.ink} strokeWidth={2} />
                <circle cx={tx + 50} cy={560} r={7} fill={HP.brass} stroke={KRP.ink} strokeWidth={2} />
                <line x1={tx - 40} y1={610} x2={tx - 50} y2={680} stroke={KRP.ink} strokeWidth={6} />
                <line x1={tx + 40} y1={610} x2={tx + 50} y2={680} stroke={KRP.ink} strokeWidth={6} />
                <path d={`M ${tx - 10} 500 L ${tx - 34} 466 M ${tx + 10} 500 L ${tx + 34} 466`} stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          })}
        </g>
        {/* 通りの上の三角の小旗 */}
        {[[0, 300, 960, 330], [960, 330, 1960, 290]].map(([x1, y1, x2, y2], j) => (
          <g key={j}>
            <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 60} ${x2} ${y2}`} stroke={KRP.ink} strokeWidth={3} fill="none" />
            {Array.from({ length: 10 }, (_, k) => {
              const q = (k + 0.5) / 10;
              const fx = lerp(x1, x2, q), fy = lerp(y1, y2, q) + Math.sin(q * Math.PI) * 30;
              return <path key={k} d={`M ${fx - 18} ${fy} L ${fx + 18} ${fy} L ${fx} ${fy + 40} Z`}
                fill={[KRP.red, KRP.yellow, C.awningB, KRP.blueDeep, KRP.orange][(k + j) % 5]} stroke={KRP.ink} strokeWidth={3}
                transform={`rotate(${Math.sin(f / 5 + k) * 8} ${fx} ${fy})`} />;
            })}
          </g>
        ))}
        {/* 歩道 */}
        <rect x={-60} y={720} width={2040} height={420} fill={C.walk} />
        <rect x={-60} y={714} width={2040} height={14} fill={KRP.grayDark} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={728} x2={i * 150 - 60} y2={1140} stroke={KRP.gray} strokeWidth={3} />)}
        {/* 昇っていく風船 */}
        {Array.from({ length: 6 }, (_, i) => {
          const q = ((f + i * 16) % 90) / 90;
          const x = 200 + i * 300 + Math.sin(f / 9 + i) * 24;
          const y = 760 - q * 760;
          return (
            <g key={i}>
              <path d={`M ${x} ${y + 40} q -10 30 4 60`} stroke={KRP.ink} strokeWidth={2.5} fill="none" />
              <ellipse cx={x} cy={y} rx={28} ry={36} fill={[KRP.red, KRP.yellow, C.awningB, KRP.orange, KRP.blueDeep, "#D97AA8"][i]} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={x - 9} cy={y - 12} rx={7} ry={10} fill={KRP.white} opacity={0.5} />
            </g>
          );
        })}
        {/* 人々 */}
        {/* 釣り竿の男 */}
        <Person x={430 + walk} y={930} s={0.74} f={f} face="joy" pose="stand" cloth="#7A9A6A" clothDark="#556E4A" phase={1} />
        <HmEbBody x={430 + walk} y={930} s={0.74} f={f} phase={1}>
          <path d="M -66 -262 Q -60 -316 0 -318 Q 60 -316 66 -262 Z" fill="#E9DCA0" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -90 -258 L 90 -258 Q 92 -246 76 -244 L -76 -244 Q -92 -246 -90 -258 Z" fill="#D9C884" stroke={KRP.ink} strokeWidth={4} />
          <line x1={67} y1={-66} x2={-170} y2={-520} stroke={C.wood} strokeWidth={8} strokeLinecap="round" />
          <path d={`M -170 -520 Q -210 -420 ${-200 + Math.sin(f / 5) * 10} -330`} stroke={KRP.ink} strokeWidth={2} fill="none" />
          <rect x={-120} y={-110} width={66} height={56} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-124} y={-118} width={74} height={14} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </HmEbBody>
        {/* 旅行かばんの女 */}
        <Person x={820 + walk * 0.7} y={930} s={0.72} f={f} face="smile" pose="stand" cloth="#D97A7A" clothDark="#A85A5A" phase={2} />
        <HmEbBody x={820 + walk * 0.7} y={930} s={0.72} f={f} phase={2}>
          <HmEbBun side={1} />
          <g transform={`rotate(${Math.sin(f / 6) * 4} -67 -66)`}>
            <rect x={-130} y={-60} width={110} height={80} rx={10} fill="#B9874F" stroke={KRP.ink} strokeWidth={5} />
            <path d="M -96 -60 L -96 -76 L -54 -76 L -54 -60" stroke={KRP.ink} strokeWidth={5} fill="none" />
            <circle cx={-100} cy={-20} r={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </HmEbBody>
        {/* 父と子 (子が風船) */}
        <Person x={1170 + walk * 0.5} y={930} s={0.76} f={f} face="joy" pose="stand" cloth="#5E6E8E" clothDark="#3E4A66" phase={3} />
        <Person x={1290 + walk * 0.5} y={930} s={0.5} f={f} face="joy" pose="raise" cloth={KRP.yellow} clothDark="#B8922E" phase={4} />
        <path d={`M ${1290 + walk * 0.5 + 34} ${930 - 155} Q ${1340 + walk * 0.5} 700 ${1330 + walk * 0.5 + Math.sin(f / 7) * 10} 560`} stroke={KRP.ink} strokeWidth={3} fill="none" />
        <ellipse cx={1330 + walk * 0.5 + Math.sin(f / 7) * 10} cy={520} rx={34} ry={42} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1320 + walk * 0.5 + Math.sin(f / 7) * 10} cy={506} rx={8} ry={12} fill={KRP.white} opacity={0.5} />
        {/* テレビにくぎづけの人 */}
        <Person x={1680} y={936} s={0.74} f={f} face="surprised" pose="hold" gaze={[0, -1]} cloth="#8E7A6A" clothDark="#6A5A4E" phase={5} />
        {/* 札 */}
        <TagPlate x={960} y={92} text="レジャー" size={70} t={seg(f, 8, 16)} fill={KRP.yellow} />
        <TagPlate x={1720} y={92} text="1961年" size={44} t={seg(f, 2, 8)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #102 働く時間の山を越えたら、さっそく遊びの話。気持ちは、よくわかります。
// 格: 山 / seed 5102
// どこ: #100 の折れ線グラフがそのまま山になった世界。空は方眼紙 (グラフの軸つき)。左の斜面は岩だらけの登り道、てっぺんに「1960年」の旗、右の斜面は水の流れるすべり台、ふもとは海 (浮き、ヨット、パラソル)
// 演出: てっぺんに着いた会社員が、カバンと帽子を放り出し、浮き輪をつけて右の斜面をすべり台のように滑り降り、海へどぼん。ネクタイがなびく。大きな水しぶき
// 動き: f0-8 てっぺんで浮き輪をかまえる / f8-36 滑り降りる (水の流れ) / f36〜 しぶき / カモメ / カメラが少し右へ
const HmEbSlide: [number, number][] = [[880, 320], [960, 350], [1060, 410], [1160, 490], [1260, 580], [1360, 670], [1450, 760], [1520, 830]];
const HmEbAlong = (pts: [number, number][], t: number): [number, number, number] => {
  const n = pts.length - 1;
  const u = clamp01(t) * n;
  const k = Math.min(n - 1, Math.floor(u));
  const r = u - k;
  const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
  return [lerp(x0, x1, r), lerp(y0, y1, r), (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI];
};
const Hm102: React.FC<{ f: number }> = ({ f }) => {
  const st = seg(f, 8, 36);
  const slideT = st * st;
  const [sx, sy, ang] = HmEbAlong(HmEbSlide, slideT);
  const sliding = f >= 8 && f < 36;
  const inSea = f >= 36;
  const sp = seg(f, 36, 42);
  const after = f - 36;
  const pan = -50 * easeInOut(seg(f, 6, 40));
  const tossT = seg(f, 6, 18);
  const s = 0.6;
  const mountain = "M -60 900 L 60 830 L 160 790 L 260 720 L 340 700 L 420 620 L 520 560 L 600 520 L 680 470 L 760 400 L 820 370 L 880 320 L 960 350 L 1060 410 L 1160 490 L 1260 580 L 1360 670 L 1450 760 L 1520 830 L 1560 900 Z";
  return (
    <Frame f={f} seed={5102}>
      <defs>
        <linearGradient id="hmeb102sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky102} /><stop offset="1" stopColor={C.sky102Low} />
        </linearGradient>
      </defs>
      <g transform={`translate(${pan} 0)`}>
        {/* 空 = 方眼紙 */}
        <rect x={-80} y={-60} width={2160} height={1200} fill="url(#hmeb102sky)" />
        <g stroke={KRP.white} strokeWidth={2} opacity={0.6}>
          {Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={i * 72} y1={-60} x2={i * 72} y2={900} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={-80} y1={i * 72} x2={2080} y2={i * 72} />)}
        </g>
        {/* グラフの縦の軸 */}
        <line x1={40} y1={900} x2={40} y2={60} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <path d="M 40 60 l -14 24 l 28 0 Z" fill={KRP.ink} />
        {/* 太陽 */}
        <g transform="translate(1760 150)">
          {Array.from({ length: 10 }, (_, k) => (
            <line key={k} x1={0} y1={-80} x2={0} y2={-110} stroke={KRP.orange} strokeWidth={8} strokeLinecap="round" transform={`rotate(${k * 36 + f})`} />
          ))}
          <circle r={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* カモメ */}
        {[0, 1, 2].map((k) => {
          const gx = 1300 + k * 160 + ((f * 2 + k * 40) % 200), gy = 230 + k * 50 + Math.sin(f / 6 + k) * 12;
          const w = Math.sin(f / 3 + k) * 10;
          return <path key={k} d={`M ${gx - 30} ${gy + w} Q ${gx - 14} ${gy - 14} ${gx} ${gy} Q ${gx + 14} ${gy - 14} ${gx + 30} ${gy + w}`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* 海 (山のふもとの下まで) と、グラフの横の軸になる地面 */}
        <rect x={1200} y={800} width={940} height={340} fill={C.sea} />
        <rect x={-80} y={896} width={1340} height={260} fill={C.grassDark} />
        <line x1={-80} y1={898} x2={1300} y2={898} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={80 + i * 100} y1={898} x2={80 + i * 100} y2={916} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 山 (グラフの線の形) */}
        <path d={mountain} fill={C.rock} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
        {/* 左の斜面: 岩とジグザグの登り道 */}
        {Array.from({ length: 12 }, (_, i) => {
          const rx = 120 + i * 60 + rnd(1021, i) * 40, ry = 840 - i * 40 + rnd(1022, i) * 60;
          return <path key={i} d={`M ${rx} ${ry} l 22 -26 l 26 8 l 10 22 Z`} fill={C.rockDark} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <path d="M 120 860 L 300 790 L 220 750 L 420 690 L 360 650 L 560 590 L 500 560 L 700 480 L 660 450 L 860 340" stroke={KRP.white}
          strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" fill="none" opacity={0.8} />
        {/* 右の斜面: 草とすべり台 */}
        <path d="M 880 320 L 960 350 L 1060 410 L 1160 490 L 1260 580 L 1360 670 L 1450 760 L 1520 830 L 1560 900 L 1300 900 L 1200 760 L 1100 640 L 1000 500 L 920 400 Z"
          fill={C.grass} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <polyline points={HmEbSlide.map(([x, y]) => `${x},${y - 6}`).join(" ")} fill="none" stroke={KRP.ink} strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={HmEbSlide.map(([x, y]) => `${x},${y - 6}`).join(" ")} fill="none" stroke={C.seaLight} strokeWidth={24} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={HmEbSlide.map(([x, y]) => `${x},${y - 6}`).join(" ")} fill="none" stroke={KRP.white} strokeWidth={5}
          strokeDasharray="20 26" strokeDashoffset={-f * 12} strokeLinecap="round" />
        {/* てっぺんの旗と札 */}
        <line x1={860} y1={322} x2={860} y2={170} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <path d={`M 864 172 Q 910 ${160 + Math.sin(f / 3) * 8} 956 184 Q 910 ${208 + Math.sin(f / 3 + 1) * 8} 864 224 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <TagPlate x={700} y={200} text="1960年" size={40} t={1} />
        {/* 放り出したカバンと帽子 */}
        <g transform={`translate(${lerp(900, 760, tossT)} ${lerp(260, 330, tossT) - Math.sin(tossT * Math.PI) * 80}) rotate(${tossT * -200})`}>
          <rect x={-34} y={-24} width={68} height={48} rx={6} fill="#5A3E2A" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -12 -24 L -12 -36 L 12 -36 L 12 -24" stroke={KRP.ink} strokeWidth={5} fill="none" />
        </g>
        <g transform={`translate(${lerp(910, 990, tossT)} ${lerp(240, 350, tossT) - Math.sin(tossT * Math.PI) * 110}) rotate(${tossT * 260})`}>
          <path d="M -26 0 Q -24 -30 0 -32 Q 24 -30 26 0 Z" fill="#4A4038" stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={40} ry={9} fill="#3A322C" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 海 (斜面のすそは水の中へ) */}
        <path d="M 1300 1140 L 1440 806 L 2140 806 L 2140 1140 Z" fill={C.sea} />
        <path d={`M 1440 800 ${Array.from({ length: 12 }, (_, k) => `q 30 ${k % 2 ? 14 : -14} 64 0`).join(" ")}`} stroke={KRP.ink} strokeWidth={5}
          fill="none" transform={`translate(${Math.sin(f / 8) * 10} 0)`} />
        {Array.from({ length: 6 }, (_, k) => (
          <path key={k} d={`M ${1600 + k * 90 + Math.sin(f / 7 + k) * 14} ${860 + (k % 3) * 50} q 16 -10 32 0`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.8} />
        ))}
        {/* 砂浜とパラソル */}
        <path d="M 1820 800 Q 1900 770 2080 780 L 2080 1140 L 1880 1140 Z" fill={C.sand} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1960} y1={790} x2={1940} y2={600} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1830 620 Q 1940 520 2050 600 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1890 590 Q 1940 540 1990 590 Z" fill={KRP.white} opacity={0.9} />
        {/* ヨット */}
        <g transform={`translate(1700 ${760 + Math.sin(f / 6) * 5}) rotate(${Math.sin(f / 9) * 4})`}>
          <path d="M -50 0 L 50 0 L 36 20 L -36 20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -4 L 0 -110 L 46 -10 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 札「レジャー」の浮き看板 */}
        <g transform={`translate(0 ${Math.sin(f / 6) * 6})`}>
          <line x1={1840} y1={700} x2={1840} y2={820} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={1840} cy={826} rx={40} ry={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <TagPlate x={1770} y={660} text="レジャー" size={44} t={seg(f, 20, 28)} fill={KRP.yellow} />
        {/* 会社員 */}
        {!sliding && !inSea && (
          <g>
            <Person x={900} y={330} s={s} f={f} face="joy" pose="banzai" cloth={C.suit} clothDark={C.suitDark} phase={1} />
            <HmEbBody x={900} y={330} s={s} f={f} phase={1}>
              <ellipse cx={0} cy={-92} rx={92} ry={30} fill="none" stroke={KRP.ink} strokeWidth={36} />
              <ellipse cx={0} cy={-92} rx={92} ry={30} fill="none" stroke={C.tube} strokeWidth={26} strokeDasharray="40 30" />
              <ellipse cx={0} cy={-92} rx={92} ry={30} fill="none" stroke={KRP.white} strokeWidth={26} strokeDasharray="30 40" strokeDashoffset={40} />
            </HmEbBody>
          </g>
        )}
        {sliding && (
          <g transform={`translate(${sx} ${sy - 10}) rotate(${ang * 0.85})`}>
            {/* 水しぶきの尾 */}
            {[0, 1, 2].map((k) => <circle key={k} cx={-80 - k * 34} cy={-8 - k * 10} r={12 - k * 3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />)}
            <Person x={0} y={58 * s} s={s} f={f} face="joy" pose="sit" cloth={C.suit} clothDark={C.suitDark} phase={1} lean={-18} />
            <g transform={`scale(${s}) translate(0 ${58})`}>
              {/* なびくネクタイ */}
              <path d={`M 10 -150 Q ${-60} ${-150 + Math.sin(f / 1.5) * 16} -110 ${-140 + Math.sin(f / 1.5 + 1) * 24}`} stroke={KRP.red} strokeWidth={16} fill="none" strokeLinecap="round" transform="rotate(-18)" />
              <ellipse cx={0} cy={-80} rx={96} ry={30} fill="none" stroke={KRP.ink} strokeWidth={36} />
              <ellipse cx={0} cy={-80} rx={96} ry={30} fill="none" stroke={C.tube} strokeWidth={26} strokeDasharray="40 30" />
              <ellipse cx={0} cy={-80} rx={96} ry={30} fill="none" stroke={KRP.white} strokeWidth={26} strokeDasharray="30 40" strokeDashoffset={40} />
            </g>
            {/* 速さの線 */}
            {[0, 1, 2].map((k) => <line key={k} x1={-150 - k * 20} y1={-90 + k * 30} x2={-260 - k * 30} y2={-90 + k * 30} stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />)}
          </g>
        )}
        {inSea && (
          <g>
            {/* 水しぶき (人の左右へ。顔にはかけない) */}
            {Array.from({ length: 12 }, (_, k) => {
              const side = k % 2 ? 1 : -1;
              const a = (side > 0 ? -60 + (k >> 1) * 7 : -120 - (k >> 1) * 7) * Math.PI / 180;
              const v = 150 + rnd(1023, k) * 130;
              const tt = Math.min(after, 14) / 14;
              const x = 1560 + side * 40 + Math.cos(a) * v * tt;
              const y = 820 + Math.sin(a) * v * tt + 200 * tt * tt;
              return <ellipse key={k} cx={x} cy={Math.min(y, 830)} rx={9 + rnd(1024, k) * 7} ry={13 + rnd(1025, k) * 7}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={1 - tt * 0.3} />;
            })}
            <path d={`M ${1400 - sp * 40} 832 Q ${1420 - sp * 30} ${760 - sp * 60} 1450 ${790 - sp * 20} Q 1470 ${720 - sp * 70} 1490 810 M 1630 810 Q 1650 ${720 - sp * 70} 1670 ${790 - sp * 20} Q 1700 ${760 - sp * 60} ${1720 + sp * 40} 832`}
              fill={C.seaLight} stroke={KRP.ink} strokeWidth={5} opacity={1 - Math.max(0, after - 8) / 12} />
            {/* 海に浮かぶ会社員 */}
            <g transform={`translate(0 ${Math.sin(f / 4) * 4})`}>
              <Person x={1560} y={900} s={s} f={f} face="joy" pose="banzai" cloth={C.suit} clothDark={C.suitDark} phase={1} />
              <rect x={1470} y={828} width={180} height={140} fill={C.sea} />
              <ellipse cx={1560} cy={836} rx={96 * s * 1.1} ry={22} fill="none" stroke={KRP.ink} strokeWidth={26} />
              <ellipse cx={1560} cy={836} rx={96 * s * 1.1} ry={22} fill="none" stroke={C.tube} strokeWidth={18} strokeDasharray="28 22" />
              <ellipse cx={1560} cy={836} rx={96 * s * 1.1} ry={22} fill="none" stroke={KRP.white} strokeWidth={18} strokeDasharray="22 28" strokeDashoffset={28} />
              <path d="M 1470 828 q 22 -12 45 0 q 22 12 45 0 q 22 -12 45 0 q 22 12 45 0" stroke={KRP.ink} strokeWidth={5} fill="none" />
              {/* ぬれたネクタイ */}
              <path d="M 1560 812 l -8 14 l 8 10 l 8 -10 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #103 そして暇は、もうひとつの場所でも、生まれていました。乗り物の中です。
// 格: 山 / seed 5103
// どこ: 昭和の駅のホーム。橙と緑の2色の電車 (屋根にパンタグラフ・上に架線)、木の屋根と柱、柱の時刻表、つり下げ時計、ベンチ
// 演出: 電車のドアが開くと、中から「乗っている時間」の橙の雲 (中に小さな時計がぷかぷか) がもくもくあふれ出す。車内では乗客が座ってぼんやり。ホームの会社員・女性・学生が雲を見上げて驚く。カメラはドアの中へ寄っていく
// 動き: ドアが左右に開く / 雲がふくらむ / 雲の中の時計が回る / 人が見上げる・指さす / カメラが寄る
const Hm103: React.FC<{ f: number }> = ({ f }) => {
  const open = easeInOut(seg(f, 3, 14));
  const z = lerp(1, 1.3, easeInOut(seg(f, 16, 42)));
  const dl = 860, dr = 1060, dt = 300, db = 640;
  const puffs: [number, number, number, number][] = [
    // [x, y, r, 出るコマ]
    [960, 520, 70, 10], [930, 440, 64, 13], [1000, 400, 70, 16], [900, 360, 60, 19], [1050, 330, 66, 21],
    [960, 300, 74, 23], [860, 280, 56, 25], [1100, 260, 60, 27], [1000, 220, 70, 29], [900, 200, 58, 31],
    [1140, 190, 52, 33], [820, 220, 48, 35],
  ];
  return (
    <Frame f={f} seed={5103}>
      <g transform={`translate(960 480) scale(${z}) translate(-960 -480)`}>
        {/* 背景の空 (屋根のすきま) と向こうの町 */}
        <rect x={-60} y={-60} width={2040} height={700} fill="#CFE3EC" />
        {/* 架線 */}
        <line x1={-60} y1={150} x2={1980} y2={150} stroke={KRP.ink} strokeWidth={3} />
        <line x1={-60} y1={136} x2={1980} y2={140} stroke={KRP.ink} strokeWidth={2} />
        {/* 電車 */}
        <g>
          <rect x={-100} y={250} width={2120} height={400} rx={30} fill={C.trainOrange} stroke={KRP.ink} strokeWidth={8} />
          <rect x={-100} y={250} width={2120} height={60} rx={30} fill="#9A9690" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-100} y={480} width={2120} height={60} fill={C.trainGreen} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-100} y={580} width={2120} height={70} fill={C.trainGreen} stroke={KRP.ink} strokeWidth={5} />
          {/* パンタグラフ */}
          <g stroke={KRP.ink} strokeWidth={5} fill="none">
            <path d="M 560 250 L 620 190 L 680 250 M 590 220 L 650 220" />
            <line x1={590} y1={154} x2={650} y2={154} strokeWidth={8} />
            <path d="M 620 190 L 620 156" />
          </g>
          {/* 窓 (乗客の頭) */}
          {[40, 230, 420, 600, 1170, 1360, 1550, 1740].map((wx, i) => (
            <g key={wx}>
              <rect x={wx} y={340} width={150} height={110} rx={10} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={5} />
              <line x1={wx} y1={390} x2={wx + 150} y2={390} stroke={KRP.ink} strokeWidth={3} />
              {i % 3 !== 1 && (
                <g>
                  <circle cx={wx + 75} cy={420} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <path d={`M ${wx + 49} 416 Q ${wx + 75} 384 ${wx + 101} 416 Z`} fill={KRP.ink} />
                  <path d={`M ${wx + 64} 426 l 8 0 M ${wx + 80} 426 l 8 0`} stroke={KRP.ink} strokeWidth={3} />
                </g>
              )}
              {i === 4 && [0, 1, 2].map((k) => (
                <text key={k} x={wx + 110 + k * 12} y={380 - k * 14 - ((f / 2) % 8)} fontFamily={FONT} fontWeight={900} fontSize={18 + k * 4} fill={KRP.blueDeep}>z</text>
              ))}
            </g>
          ))}
          {/* ドアの開いた中 = 車内 */}
          <g>
            <rect x={dl} y={dt} width={dr - dl} height={db - dt} fill="#EFE6CF" />
            {/* 向こう側の窓 */}
            <rect x={dl + 20} y={dt + 40} width={160} height={90} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={3} />
            {/* つり革 */}
            {[900, 960, 1020].map((hx, k) => (
              <g key={hx} transform={`rotate(${Math.sin(f / 7 + k) * 6} ${hx} ${dt})`}>
                <line x1={hx} y1={dt} x2={hx} y2={dt + 50} stroke={KRP.grayDark} strokeWidth={4} />
                <circle cx={hx} cy={dt + 62} r={12} fill="none" stroke={KRP.white} strokeWidth={6} />
                <circle cx={hx} cy={dt + 62} r={12} fill="none" stroke={KRP.ink} strokeWidth={2} />
              </g>
            ))}
            {/* 座席と座ってぼんやりする乗客 */}
            <rect x={dl} y={dt + 190} width={dr - dl} height={60} fill={C.seatGreen} stroke={KRP.ink} strokeWidth={4} />
            <rect x={dl} y={dt + 150} width={dr - dl} height={44} fill="#6E9E6A" stroke={KRP.ink} strokeWidth={4} />
            <PersonMini x={960} y={dt + 250} s={0.6} color="#6E7F96" f={f} phase={2} face="smile" />
            <rect x={dl} y={dt + 250} width={dr - dl} height={db - dt - 250} fill="#BDB09A" />
          </g>
          {/* ドア (左右に開く) */}
          <rect x={dl - (dr - dl) / 2 * open} y={dt} width={(dr - dl) / 2} height={db - dt} fill={C.trainOrange} stroke={KRP.ink} strokeWidth={6} />
          <rect x={dl + 20 - (dr - dl) / 2 * open} y={dt + 30} width={(dr - dl) / 2 - 40} height={130} rx={6} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={4} />
          <rect x={(dl + dr) / 2 + (dr - dl) / 2 * open} y={dt} width={(dr - dl) / 2} height={db - dt} fill={C.trainOrange} stroke={KRP.ink} strokeWidth={6} />
          <rect x={(dl + dr) / 2 + 20 + (dr - dl) / 2 * open} y={dt + 30} width={(dr - dl) / 2 - 40} height={130} rx={6} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={4} />
          {/* ドアの戸袋 (車体の上に重ねて、開いたドアを隠す) */}
          <rect x={dl - (dr - dl) / 2 - 6} y={dt - 4} width={(dr - dl) / 2} height={db - dt + 8} fill={C.trainOrange} />
          <rect x={dr + 6} y={dt - 4} width={(dr - dl) / 2} height={db - dt + 8} fill={C.trainOrange} />
          <rect x={dl - (dr - dl) / 2 - 6} y={480} width={(dr - dl) / 2} height={60} fill={C.trainGreen} />
          <rect x={dr + 6} y={480} width={(dr - dl) / 2} height={60} fill={C.trainGreen} />
          <rect x={dl - (dr - dl) / 2 - 6} y={580} width={(dr - dl) / 2} height={64} fill={C.trainGreen} />
          <rect x={dr + 6} y={580} width={(dr - dl) / 2} height={64} fill={C.trainGreen} />
          <rect x={dl - 6} y={dt - 6} width={dr - dl + 12} height={db - dt + 12} fill="none" stroke={KRP.ink} strokeWidth={8} />
        </g>
        {/* 木の屋根と柱 */}
        <rect x={-60} y={-60} width={2040} height={130} fill={C.stationRoof} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={-60} x2={i * 180 + 60} y2={70} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />)}
        {[240, 1680].map((px) => (
          <g key={px}>
            <rect x={px - 20} y={60} width={40} height={620} fill="#8E6A44" stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${px - 20} 110 L ${px - 110} 70 M ${px + 20} 110 L ${px + 110} 70`} stroke="#8E6A44" strokeWidth={14} />
          </g>
        ))}
        {/* 柱の時刻表 */}
        <g transform="translate(240 360)">
          <rect x={-90} y={-100} width={180} height={220} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-90} y={-100} width={180} height={36} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 7 }, (_, k) => (
            <g key={k}>
              <line x1={-80} y1={-44 + k * 24} x2={80} y2={-44 + k * 24} stroke={KRP.gray} strokeWidth={2} />
              {[0, 1, 2, 3].map((j) => <rect key={j} x={-70 + j * 38} y={-60 + k * 24} width={24} height={10} rx={3} fill={KRP.grayDark} opacity={0.7} />)}
            </g>
          ))}
        </g>
        {/* つり下げ時計 */}
        <line x1={1480} y1={70} x2={1480} y2={130} stroke={KRP.ink} strokeWidth={5} />
        <HmEbClockFace x={1480} y={186} r={56} f={f} />
        {/* ホーム */}
        <rect x={-60} y={650} width={2040} height={500} fill={C.platform} />
        <rect x={-60} y={650} width={2040} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={672} x2={i * 260 - 200} y2={1140} stroke={C.platformDark} strokeWidth={4} />)}
        {/* ベンチ */}
        <g>
          <rect x={1560} y={720} width={300} height={22} rx={6} fill="#8E6A44" stroke={KRP.ink} strokeWidth={5} />
          <rect x={1560} y={760} width={300} height={24} rx={6} fill="#A07A4E" stroke={KRP.ink} strokeWidth={5} />
          {[1580, 1820].map((lx) => <rect key={lx} x={lx} y={784} width={18} height={70} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {/* 雲 (乗っている時間) */}
        {puffs.map(([px, py, r, born], i) => {
          const g = pop(seg(f, born, born + 7));
          if (g <= 0) return null;
          const wob = Math.sin(f / 6 + i) * 4;
          return (
            <g key={i} transform={`translate(${px + wob} ${py}) scale(${g})`}>
              <circle r={r} fill={C.cloudDark} transform="translate(6 8)" />
              <circle r={r} fill={C.cloud} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.4} fill={C.cloudLight} opacity={0.8} />
            </g>
          );
        })}
        {/* 雲の中にぷかぷかする時計 */}
        {[[960, 420, 26, 18], [1040, 300, 22, 24], [900, 250, 20, 30], [1010, 200, 18, 34]].map(([cx2, cy2, r, born], i) => {
          const g = pop(seg(f, born, born + 6));
          if (g <= 0) return null;
          return <g key={i} transform={`translate(0 ${Math.sin(f / 5 + i) * 6}) `}>
            <g transform={`translate(${cx2} ${cy2}) scale(${g}) translate(${-cx2} ${-cy2})`}>
              <HmEbClockFace x={cx2} y={cy2} r={r} f={f * 2 + i * 20} rot={Math.sin(f / 7 + i) * 14} />
            </g>
          </g>;
        })}
        {/* ホームの人たち (見上げる) */}
        <Person x={600} y={880} s={0.84} f={f} face={f > 14 ? "surprised" : "normal"} pose="hold" gaze={[1, -1]} lean={-6}
          cloth="#5A5E6A" clothDark="#3E424C" phase={1} />
        <HmEbBody x={600} y={880} s={0.84} f={f} lean={-6} phase={1}>
          {/* 帽子 (中折れ) */}
          <path d="M -54 -270 Q -50 -330 0 -332 Q 50 -330 54 -270 Z" fill="#4A4038" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-56} y={-288} width={112} height={16} fill="#2E2824" />
          <ellipse cx={0} cy={-270} rx={92} ry={14} fill="#3A322C" stroke={KRP.ink} strokeWidth={4} />
          {/* 抱えた新聞 */}
          <rect x={-40} y={-140} width={80} height={56} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8)" />
        </HmEbBody>
        <Person x={1330} y={880} s={0.8} f={f} face={f > 14 ? "surprised" : "smile"} pose="stand" gaze={[-1, -1]} lean={6}
          cloth="#C9707A" clothDark="#9A505A" phase={2} />
        <HmEbBody x={1330} y={880} s={0.8} f={f} lean={6} phase={2}>
          <HmEbBun side={1} />
          <rect x={60} y={-90} width={50} height={40} rx={8} fill="#8E5A3A" stroke={KRP.ink} strokeWidth={4} />
        </HmEbBody>
        <Person x={1610} y={890} s={0.7} f={f} face="joy" pose={f > 18 ? "point" : "stand"} pointDir={-1} lean={4}
          cloth="#2E3446" clothDark="#1E2230" phase={3} />
        <HmEbBody x={1610} y={890} s={0.7} f={f} lean={4} phase={3}>
          <path d="M -64 -262 Q -60 -318 0 -320 Q 60 -318 64 -262 Z" fill="#2E3446" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 64 -262 Q 110 -258 104 -246 Q 60 -244 0 -252 Z" fill="#1E2230" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-294} r={8} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
        </HmEbBody>
        {/* 驚きの線 */}
        {f > 14 && [600, 1330].map((px, k) => (
          <g key={px} opacity={0.6 + 0.4 * Math.sin(f / 3 + k)}>
            {[-1, 0, 1].map((d) => <line key={d} x1={px + d * 40} y1={590 - (d === 0 ? 14 : 0)} x2={px + d * 54} y2={560 - (d === 0 ? 20 : 0)}
              stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />)}
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_095: (f) => <Hm095 f={f} />,
  hm_096: (f) => <Hm096 f={f} />,
  hm_097: (f) => <Hm097 f={f} />,
  hm_098: (f) => <Hm098 f={f} />,
  hm_099: (f) => <Hm099 f={f} />,
  hm_100: (f) => <Hm100 f={f} />,
  hm_101: (f) => <Hm101 f={f} />,
  hm_102: (f) => <Hm102 f={f} />,
  hm_103: (f) => <Hm103 f={f} />,
};

export const HM_EB_MOTIFS: string[] = [
  "hm_095", // #95
  "hm_096", // #96
  "hm_097", // #97
  "hm_098", // #98
  "hm_099", // #99
  "hm_100", // #100
  "hm_101", // #101
  "hm_102", // #102
  "hm_103", // #103
];

export const himaEbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
