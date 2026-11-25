// 人は、なぜ暇をつぶすのか: 文#12〜#23 (12文)
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
  // #12 交差点
  sky: "#BFD9EA", skyLow: "#E4EEF2", bldg: "#9DA9B6", bldgDark: "#7D8996", bldgWin: "#DCE6EE",
  asphalt: "#6F7378", asphaltDark: "#5C6065", walk: "#C7BFB2", walkLine: "#B0A797",
  sigBox: "#3E4148", sigRed: "#E5483A", sigOff: "#55585E", carBody: "#5C86B8",
  // #13 会社員
  shirt: "#EEF2F6", tie: "#B8423A", slacks: "#4A5266", cup: "#FDFBF7",
  // #15 夜の壁
  nightWall: "#3E3A55", nightStripe: "#48446A", poster: "#F3E9CF", posterBack: "#D9CBA6",
  cloud: "#FDFBF7", cloudShade: "#D6DCE6",
  // #16 トンネル
  tunDeep: "#2B2236", tunMid: "#5A4530", tunRing1: "#A9804A", tunRing2: "#7E5A36", tunGlow: "#FFE7A8",
  plank: "#E7CFA0", rail: "#9AA1A8", cartBody: "#8E6234", cartDark: "#6B4527",
  // #17 ロビー
  lobbyWall: "#7A2E2E", lobbyWallDark: "#5E2222", carpet: "#4A2A4E", carpetDot: "#6A4070",
  frame: "#C9A24A", edoSky: "#F3D99A", edoField: "#A97A4E", indigo: "#3E5A8A", noragi: "#8A6A48",
  meijiBlack: "#2E2E36", meijiWall: "#E8DFC8", kioskRoof: "#C94F3D",
  // #20 #23 古代
  duskTop: "#5E4A7A", duskMid: "#D9776A", duskLow: "#F4B979", hill: "#7A5E6E", hillNear: "#8E6E62",
  adobe: "#D6B48A", adobeDark: "#B8936A", adobeLine: "#C3A077", stone: "#B9AA94", stoneDark: "#9A8A74",
  olive: "#7E8F55", oliveDark: "#5E6E3E", robeIvory: "#E9DFC6", robeBrown: "#9A6E48", robeIndigo: "#4E5E8E",
  headCloth: "#D8CBB0", lampFire: "#FFB347", windowLit: "#FFD27A", rug: "#B4523E", rugPattern: "#E2B65A",
  bread: "#D9A25E", breadDark: "#A9773C", wine: "#7A2E4A",
  // #21 オフィス
  officeWall: "#E4E8EA", ceiling: "#F2F2EE", ceilingLine: "#D2D4D0", calPhotoSky: "#A9CBE6", calMount: "#7E9C8A",
  // #22 地層
  soil1: "#8C6A48", soil2: "#A47E56", soil3: "#7A5A3E", soil4: "#B8936A", soil5: "#6A4C34", soil6: "#94704C",
  grass: "#7FA35A", parch: "#D9B57E", parchDark: "#B48E58", glove: "#E8C766",
} as const;

// Person と同じ変換 (服の重ね描き用)
const bodyT = (x: number, y: number, s: number, f: number, phase = 0, lean = 0) =>
  `translate(${x} ${y + Math.sin((f + phase * 17) / 13) * 3}) scale(${s}) rotate(${lean})`;

// 古代の長い衣 + 頭の布 (Person の上に重ねる)
const HmAbRobe: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number;
  color: string; trim?: string; cloth?: string; sit?: boolean; child?: boolean;
}> = ({ x, y, s, f, phase = 0, lean = 0, color, trim = KRP.ink, cloth = C.headCloth, sit = false, child = false }) => (
  <g transform={bodyT(x, y, s, f, phase, lean)}>
    {sit ? (
      <path d="M -60 -162 L 60 -162 L 68 -64 Q 74 -30 44 -22 L -44 -22 Q -74 -30 -68 -64 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
    ) : (
      <path d="M -60 -162 L 60 -162 L 76 -20 Q 0 -10 -76 -20 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
    )}
    <rect x={-62} y={-104} width={124} height={14} rx={6} fill={trim} opacity={0.75} />
    <path d="M -20 -162 L 0 -136 L 20 -162" fill="none" stroke={KRP.ink} strokeWidth={4} />
    {!child && (
      <path d="M -72 -228 Q -74 -304 0 -306 Q 74 -304 72 -228 L 78 -160 L 54 -160 L 52 -236 Q 0 -266 -52 -236 L -54 -160 L -78 -160 Z"
        fill={cloth} stroke={KRP.ink} strokeWidth={5} />
    )}
    {!child && <path d="M -52 -270 Q 0 -286 52 -270" fill="none" stroke={trim} strokeWidth={6} opacity={0.6} />}
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
// #12 信号待ちの数十秒でも、ポケットからスマホが出てきます。
// 格: 山 / seed 5012
// 絵: どこ: 交差点の歩道に立つ「あなた」の腰から上の大写し。背景に歩行者信号 (赤い人の形) と残り時間のメモリ (目盛りが減っていく)。演出: 「あなた」の手がパーカーのポケットに入り、Sumaho が**ぽんと飛び出す**ように出てくる (pop)。画面が点いた瞬間に顔がぱっと明るくなる (face="smile")。信号の残りメモリが1つ減る。動き: f6-20 スマホが出る / 画面点灯の光 / 信号のメモリが減る
// どこ: 夕方前の交差点の歩道。「あなた」の腰から上を大写し。左に歩行者信号 (赤の人形+待ち時間のメモリ)、奥に横断歩道と車道、右に同じくスマホを見る人たち
// 演出: パーカーのポケットがもぞもぞ → スマホが勝手にくるっと飛び出し、両手に収まる。画面が点いて顔がぱっと笑顔に (光が顔を照らす)
// 動き: f0-6 ポケットがもぞもぞ / f6-16 スマホが回転して飛び出す / f18 画面点灯 / f24 信号のメモリが1つ消える / 車が右から左へ通過 / カメラがわずかに寄る
const Hm012: React.FC<{ f: number }> = ({ f }) => {
  const PX = 960, PY = 1110, PS = 3.2;
  const jump = seg(f, 6, 16);
  const held = f >= 16;
  const wig = f < 6 ? Math.sin(f * 2.2) * 6 : 0;
  const phX = PX + Math.sin(jump * Math.PI) * 40;
  const phY = lerp(860, 700, easeOut(jump)) - Math.sin(jump * Math.PI) * 120;
  const phRot = held ? -6 : lerp(-360, -6, easeOut(jump));
  const on = f >= 18;
  const glow = seg(f, 18, 24);
  const segs = f < 24 ? 6 : 5;
  const blinkOff = f >= 24 && f < 30 && Math.floor(f / 2) % 2 === 0;
  const carX = 2300 - 44 * f;
  const cam = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5012} bg={C.sky}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        {/* 空と街 */}
        <rect x={-60} y={-60} width={2040} height={640} fill={C.sky} />
        <rect x={-60} y={360} width={2040} height={220} fill={C.skyLow} opacity={0.7} />
        {[[-40, 140, 300], [240, 60, 240], [460, 180, 260], [1180, 90, 280], [1440, 30, 220], [1640, 150, 320]].map(([bx, by, bw], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={600 - by} fill={i % 2 ? C.bldg : C.bldgDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor((560 - by) / 70) }, (_, r) => Array.from({ length: Math.floor(bw / 60) }, (_, c) => (
              <rect key={`${r}-${c}`} x={bx + 18 + c * 60} y={by + 24 + r * 70} width={34} height={40} rx={3}
                fill={C.bldgWin} opacity={rnd(5012, i * 50 + r * 7 + c) > 0.3 ? 0.85 : 0.45} />
            )))}
          </g>
        ))}
        {/* 車道と横断歩道 */}
        <rect x={-60} y={560} width={2040} height={220} fill={C.asphalt} />
        <rect x={-60} y={560} width={2040} height={14} fill={C.asphaltDark} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${-40 + i * 150} 590 l 90 0 l 30 170 l -110 0 Z`} fill={KRP.white} opacity={0.85} />
        ))}
        {/* 通過する車 (右から左へ) */}
        <g transform={`translate(${carX} 0)`}>
          <rect x={0} y={600} width={520} height={110} rx={36} fill={C.carBody} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 90 600 L 150 540 L 380 540 L 440 600 Z" fill={C.carBody} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 170 552 L 260 552 L 260 598 L 128 598 Z M 280 552 L 370 552 L 412 598 L 280 598 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          {[110, 410].map((wx) => <circle key={wx} cx={wx} cy={712} r={40} fill={KRP.ink} />)}
          {[110, 410].map((wx) => <circle key={`h${wx}`} cx={wx} cy={712} r={16} fill={KRP.silver} />)}
          <circle cx={18} cy={650} r={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2].map((k) => <line key={k} x1={560} y1={620 + k * 30} x2={700 + k * 30} y2={620 + k * 30} stroke={KRP.white} strokeWidth={5} opacity={0.6} strokeLinecap="round" />)}
        </g>
        {/* 歩道 (縁石・タイル) */}
        <rect x={-60} y={770} width={2040} height={30} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={800} width={2040} height={340} fill={C.walk} />
        <g stroke={C.walkLine} strokeWidth={4}>
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-60 + i * 170} y1={800} x2={-260 + i * 210} y2={1140} />)}
          <line x1={-60} y1={900} x2={1980} y2={900} />
        </g>
        {/* 点字ブロック */}
        <rect x={180} y={820} width={300} height={60} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={198 + i * 29} cy={850} r={7} fill={KRP.ink} opacity={0.25} />)}
        {/* 歩行者信号 (左) */}
        <rect x={318} y={140} width={26} height={1000} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(250 120)">
          <rect x={0} y={0} width={150} height={290} rx={14} fill={C.sigBox} stroke={KRP.ink} strokeWidth={7} />
          <rect x={14} y={14} width={122} height={122} rx={10} fill={C.sigRed} opacity={0.95} />
          <rect x={14} y={14} width={122} height={122} rx={10} fill={KRP.white} opacity={0.12 + 0.06 * Math.sin(f / 4)} />
          {/* 赤の人形 (止まれ) */}
          <g fill={KRP.white} opacity={0.92}>
            <circle cx={75} cy={36} r={12} />
            <rect x={60} y={50} width={30} height={46} rx={8} />
            <rect x={52} y={52} width={10} height={40} rx={5} />
            <rect x={88} y={52} width={10} height={40} rx={5} />
            <rect x={62} y={92} width={11} height={36} rx={5} />
            <rect x={77} y={92} width={11} height={36} rx={5} />
          </g>
          <rect x={14} y={154} width={122} height={122} rx={10} fill={C.sigOff} />
          <g fill="#6E7378" opacity={0.9}>
            <circle cx={70} cy={176} r={11} />
            <rect x={60} y={190} width={24} height={42} rx={8} />
            <path d="M 64 230 l -16 34 l 12 4 l 16 -32 Z M 78 230 l 14 34 l 12 -4 l -14 -32 Z" />
          </g>
          {/* 待ち時間のメモリ (8つ。光っている分が残り) */}
          <rect x={160} y={10} width={52} height={270} rx={10} fill={C.sigBox} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => {
            const j = 7 - i;
            const fading = j === 5 && f >= 24 && f < 30;
            const lit = j < segs || (fading && !blinkOff);
            return (
              <rect key={i} x={170} y={22 + i * 32} width={32} height={22} rx={4}
                fill={lit ? C.sigRed : C.sigOff} opacity={lit ? 1 : 0.6} />
            );
          })}
        </g>
        {/* 右の人たちも、みんなスマホ */}
        {([[1560, 800, 0.78, 2], [1790, 820, 0.84, 5], [110, 815, 0.8, 7]] as const).map(([qx, qy, qs, ph], i) => (
          <g key={i}>
            <Person x={qx} y={qy} s={qs} f={f} phase={ph} pose="hold" face={i === 1 ? "smile" : "normal"} gaze={[0, 6]}
              cloth={[KRP.blueDeep, KRP.green, KRP.grayDark][i]} clothDark={KRP.ink} />
            <ellipse cx={qx} cy={qy - 190 * qs} rx={70 * qs} ry={60 * qs} fill={HP.screen} opacity={0.22} />
            <Sumaho x={qx} y={qy - 118 * qs - 26} s={0.22 * qs / 0.8} f={f + i * 9} screen="feed" rot={-8} glow={0.6} />
          </g>
        ))}
        {/* あなた: フードの後ろ */}
        <g transform={bodyT(PX, PY, PS, f, 1)}>
          <path d="M -86 -150 Q -96 -196 -50 -206 L 50 -206 Q 96 -196 86 -150 Q 0 -130 -86 -150 Z" fill={HP.youDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <Person x={PX} y={PY} s={PS} f={f} phase={1} pose={held ? "hold" : "stand"} cloth={HP.you} clothDark={HP.youDark}
          hair="cap" face={f >= 20 ? "smile" : "normal"} gaze={held ? [0, 7] : [6, 2]} />
        {/* 画面の光が顔を照らす */}
        {on && <ellipse cx={PX} cy={PY - 200 * PS} rx={120} ry={90} fill={HP.screenCore} opacity={0.32 * glow} />}
        {on && glow < 1 && [0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k * 60 - 90) * Math.PI / 180;
          return <line key={k} x1={PX + Math.cos(a) * 140} y1={phY + Math.sin(a) * 160} x2={PX + Math.cos(a) * (190 + 60 * glow)}
            y2={phY + Math.sin(a) * (210 + 60 * glow)} stroke={HP.spark} strokeWidth={8} strokeLinecap="round" opacity={1 - glow} />;
        })}
        {/* パーカーのひもとポケット */}
        <g transform={bodyT(PX, PY, PS, f, 1)}>
          <line x1={-18} y1={-156} x2={-22} y2={-114} stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
          <line x1={18} y1={-156} x2={22} y2={-112} stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
          {/* スマホが飛び出す前は、ポケットの中 (ふくらみ) */}
          {!held && jump === 0 && <rect x={-14 + wig / PS} y={-100} width={28} height={26} rx={6} fill={HP.youDark} opacity={0.7} />}
        </g>
        {/* 飛び出したスマホ (ポケットの布の後ろから出てくる) */}
        {(jump > 0 || held) && (
          <Sumaho x={phX} y={phY} s={0.85} rot={phRot} f={f} screen={on ? "notify" : "off"} glow={glow} />
        )}
        <g transform={bodyT(PX, PY, PS, f, 1)}>
          <path d={`M -40 -92 Q 0 ${-100 + (f < 6 ? wig / PS : 0)} 40 -92 L 46 -60 L -46 -60 Z`} fill={HP.you} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M -32 -88 L -38 -63 M 32 -88 L 38 -63" stroke={HP.youDark} strokeWidth={2.5} />
        </g>
        {/* 飛び出しの軌跡 */}
        {jump > 0 && jump < 1 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${PX - 60 + k * 60} 800 q ${(k - 1) * 20} -40 ${(k - 1) * 30} -80`} stroke={KRP.ink} strokeWidth={5}
            fill="none" strokeLinecap="round" opacity={(1 - jump) * 0.7} />
        ))}
        {/* もぞもぞの線 */}
        {f < 7 && [0, 1].map((k) => (
          <path key={k} d={`M ${PX + (k ? 170 : -170)} 790 q ${k ? 16 : -16} 10 0 24 q ${k ? -16 : 16} 10 0 24`} stroke={KRP.ink}
            strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #13 しかも、日本の会社で働く人の休みは、ここ40年で、いまがいちばん多い。
// 格: 図 / seed 5013
// 絵: どこ: 会社の休憩室のホワイトボード (マグネット・付箋つき)。演出: 年間休日の棒グラフを手描きで2本だけ。左「1985年」の棒 (92.9日) と右「2025年」の棒 (116.6日)。右の棒が f で下から伸びて左を追い越す。右の棒の上に王冠のマグネット。数値札「約93日」「約117日」。横に会社員の Person がコーヒーを手に「おお」と見上げる (face="surprised")。動き: 棒が伸びる / 王冠がぽん / コーヒーの湯気
// どこ: 会社の休憩室のホワイトボード (KyukeiBoard)。手描きの棒グラフ2本
// 演出: 左「1985年」の棒 (約93日) はもう描いてある。右「2025年」の棒が下から伸び、左の高さの点線を突き抜けて追い越す。てっぺんに王冠のマグネットがぽん。右手前の会社員がコーヒーを持ったまま「おお」と見上げる
// 動き: f6-30 右の棒が伸びる (左の高さで一瞬ためる) / f30-38 王冠がぽん / コーヒーの湯気 / 驚きの線 / カメラが少し右へ
const Hm013: React.FC<{ f: number }> = ({ f }) => {
  const BASE = 690, UNIT = 400 / 116.6;
  const hL = 92.9 * UNIT, hRmax = 116.6 * UNIT;
  const g1 = easeOut(seg(f, 6, 20)), g2 = easeOut(seg(f, 22, 30));
  const hR = hL * 0.98 * g1 + (hRmax - hL * 0.98) * g2;
  const crown = pop(seg(f, 30, 38));
  const passed = hR > hL + 4;
  const wow = seg(f, 28, 36);
  const panX = -14 * easeInOut(seg(f, 0, 42));
  const MX = 1440, MY = 930, MS = 1.15;
  const hatch = (x0: number, w: number, h: number, col: string, key: string) => (
    <g key={key}>
      <defs>
        <clipPath id={`hmab13-${key}`}><rect x={x0} y={BASE - h} width={w} height={h} /></clipPath>
      </defs>
      <rect x={x0} y={BASE - h} width={w} height={h} fill={col} opacity={0.35} />
      <g clipPath={`url(#hmab13-${key})`} stroke={col} strokeWidth={7} opacity={0.9}>
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={x0 - 300 + i * 34} y1={BASE + 10} x2={x0 + i * 34} y2={BASE - 450} />)}
      </g>
      <path d={`M ${x0} ${BASE} L ${x0 + 2} ${BASE - h} L ${x0 + w - 1} ${BASE - h + 2} L ${x0 + w} ${BASE}`} fill="none" stroke={col} strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
  return (
    <Frame f={f} seed={5013}>
      <g transform={`translate(${panX} 0)`}>
        <KyukeiBoard f={f} />
        {/* 軸 (マーカーの手描き) */}
        <path d="M 470 200 L 472 692 L 1420 690" fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={458} y1={BASE - i * 100} x2={486} y2={BASE - i * 100} stroke={KRP.ink} strokeWidth={5} />)}
        <text x={508} y={214} fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink} textAnchor="middle">日</text>
        {/* 左の棒 (1985年) */}
        {hatch(600, 200, hL, KRP.blueDeep, "L")}
        {/* 左の高さの点線 */}
        <line x1={600} y1={BASE - hL} x2={1260} y2={BASE - hL} stroke={KRP.blueDeep} strokeWidth={4} strokeDasharray="12 10" opacity={0.7} />
        {/* 右の棒 (2025年) */}
        {hR > 2 && hatch(1000, 200, hR, KRP.red, "R")}
        {/* マーカー (右の棒を描いている途中) */}
        {f < 31 && (
          <g transform={`translate(${1180} ${BASE - hR}) rotate(30)`}>
            <rect x={-12} y={-150} width={24} height={130} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -12 -20 L 12 -20 L 4 0 L -4 0 Z" fill={KRP.ink} />
          </g>
        )}
        {/* 突き抜けた瞬間の火花 */}
        {passed && f < 34 && [0, 1, 2, 3].map((k) => (
          <line key={k} x1={1100 + (k - 1.5) * 50} y1={BASE - hL - 10} x2={1100 + (k - 1.5) * 80} y2={BASE - hL - 40}
            stroke={HP.spark} strokeWidth={7} strokeLinecap="round" />
        ))}
        {/* 王冠のマグネット */}
        {crown > 0 && (
          <g transform={`translate(1100 ${BASE - hRmax - 8}) scale(${crown}) rotate(${Math.sin(f / 7) * 3})`}>
            <ellipse cx={0} cy={0} rx={62} ry={10} fill={KRP.ink} opacity={0.2} />
            <path d="M -56 -6 L -64 -70 L -30 -40 L 0 -84 L 30 -40 L 64 -70 L 56 -6 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            {[-64, 0, 64].map((cx) => <circle key={cx} cx={cx} cy={cx === 0 ? -86 : -72} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />)}
            <rect x={-56} y={-26} width={112} height={18} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 数値と年の札 (同じ高さの定数でそろえる) */}
        <TagPlate x={700} y={BASE - hL - 46} text="約93日" size={36} t={seg(f, 0, 6)} color={KRP.blueDeep} />
        <TagPlate x={1100} y={BASE - hRmax - 138} text="約117日" size={36} t={seg(f, 32, 40)} color={KRP.red} />
        <TagPlate x={700} y={784} text="1985年" size={34} t={1} />
        <TagPlate x={1100} y={784} text="2025年" size={34} t={1} />
        {/* 会社員 (コーヒーを持って見上げる) */}
        <Person x={MX} y={MY} s={MS} f={f} phase={4} pose="hold" face={f >= 26 ? "surprised" : "normal"} gaze={[-6, -6]}
          cloth={C.shirt} clothDark={C.slacks} lean={-4 * wow} />
        <g transform={bodyT(MX, MY, MS, f, 4, -4 * wow)}>
          <path d="M -8 -160 L 8 -160 L 12 -100 L 0 -86 L -12 -100 Z" fill={C.tie} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -30 -160 L -8 -146 L 0 -160 L 8 -146 L 30 -160" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 首から下げた社員証 (字はなし) */}
          <path d="M -34 -160 L -24 -118 M 34 -160 L 24 -118" stroke={KRP.blueDeep} strokeWidth={4} />
          <rect x={-30} y={-118} width={30} height={34} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} transform="translate(12 0)" />
          {/* コーヒーカップ */}
          <path d="M -26 -150 L 26 -150 L 20 -108 L -20 -108 Z" fill={C.cup} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-24} y={-140} width={48} height={12} fill={KRP.bronze} opacity={0.7} />
          <ellipse cx={0} cy={-150} rx={26} ry={6} fill="#6B4527" stroke={KRP.ink} strokeWidth={3} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-8 + i * 16} -164 q 8 -14 0 -28 q -8 -14 0 -28`} stroke={KRP.grayDark} strokeWidth={4} fill="none"
              opacity={0.5} transform={`translate(0 ${-((f * 1.1 + i * 13) % 20)})`} />
          ))}
        </g>
        {/* 「おお」の驚き線 */}
        {wow > 0 && [0, 1, 2].map((k) => {
          const a = (-150 + k * 30) * Math.PI / 180;
          const hx = MX, hy = MY - 228 * MS;
          return <line key={k} x1={hx + Math.cos(a) * 92} y1={hy + Math.sin(a) * 92} x2={hx + Math.cos(a) * (92 + 40 * wow)}
            y2={hy + Math.sin(a) * (92 + 40 * wow)} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #14 暇は増えた。なのに、退屈が見当たらない。
// 格: 山 / seed 5014
// 絵: どこ: 「あなた」の部屋 (夜)。ソファ・テレビ・観葉植物・壁の時計。演出: ソファの「あなた」が Sumaho を見ている。部屋のあちこちを、虫めがねを持った小さな捜索係 (ずんぐりした丸頭の Person) がのぞき回って「退屈」を探している (クッションの下・本棚の裏・時計の裏)。どこにも何もない (からっぽの「?」の吹き出し)。動き: 捜索係が3か所を順にのぞく / 「?」がぽんぽん / スマホの光
// どこ: 「あなた」の夜の部屋 (YoruNoHeya)。ソファでスマホを見ている「あなた」
// 演出: 小さな捜索係が部屋じゅうを跳ね回って「退屈」を探す。①壁の時計の裏 (小さな棚の上から) → ②ソファのクッションをめくった下 → ③本棚の本を1冊抜いたすき間。どこにも何もなく、のぞいた所に空っぽの「?」の吹き出しが残っていく。「あなた」は気づかず、スマホの光で笑顔
// 動き: f0-12 時計の裏 / f12-18 ジャンプ / f18-28 クッションの下 / f28-34 ジャンプ / f34- 本棚 / 「?」が f8・f24・f40 にぽん / スマホの光 / カメラがゆっくり右へ
const Hm014: React.FC<{ f: number }> = ({ f }) => {
  const SS = 0.5;
  const P1: [number, number] = [610, 268], P2: [number, number] = [1080, 702], P3: [number, number] = [1790, 584];
  const hop = (a: [number, number], b: [number, number], t: number, hgt: number): [number, number] =>
    [lerp(a[0], b[0], easeInOut(t)), lerp(a[1], b[1], easeInOut(t)) - Math.sin(t * Math.PI) * hgt];
  const t1 = seg(f, 12, 18), t2 = seg(f, 28, 34);
  const pos = f < 12 ? P1 : f < 18 ? hop(P1, P2, t1, 220) : f < 28 ? P2 : f < 34 ? hop(P2, P3, t2, 260) : P3;
  const flying = (f >= 12 && f < 18) || (f >= 28 && f < 34);
  const at = f < 12 ? 0 : f < 28 ? 1 : 2;
  const lens: [number, number] = at === 0 ? [500 + Math.sin(f / 4) * 8, 196] : at === 1 ? [1090 + Math.sin(f / 4) * 10, 668] : [1858, 520];
  const cushionLift = seg(f, 18, 22) * (1 - seg(f, 27, 30));
  const bookOut = seg(f, 34, 38);
  const q = [pop(seg(f, 8, 14)), pop(seg(f, 24, 30)), pop(seg(f, 40, 42))];
  const pan = -30 * easeInOut(seg(f, 0, 42));
  const bubble = (bx: number, by: number, t: number, key: string) => t > 0 && (
    <g key={key} transform={`translate(${bx} ${by + Math.sin((f + bx) / 9) * 4}) scale(${t})`}>
      <path d="M -62 -50 Q -62 -86 -26 -86 L 26 -86 Q 62 -86 62 -50 L 62 -20 Q 62 14 26 14 L 4 14 L -10 40 L -14 14 L -26 14 Q -62 14 -62 -20 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.grayDark}>?</text>
    </g>
  );
  return (
    <Frame f={f} seed={5014} dark bg={C.nightWall}>
      <g transform={`translate(${pan} 0)`}>
        <YoruNoHeya f={f} tv />
        {/* 時計の下の小さな棚 */}
        <rect x={500} y={268} width={180} height={16} rx={4} fill="#8A6A4E" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 520 284 l 20 30 M 660 284 l -20 30" stroke={KRP.ink} strokeWidth={5} />
        <rect x={640} y={238} width={26} height={30} rx={4} fill="#4E8A55" stroke={KRP.ink} strokeWidth={3} />
        {/* 本棚: 抜いた本 (床に) */}
        {bookOut > 0 && (
          <g transform={`translate(${lerp(1840, 1610, easeOut(bookOut))} ${lerp(510, 640, easeOut(bookOut))}) rotate(${lerp(0, -80, bookOut)})`}>
            <rect x={-12} y={-40} width={24} height={80} fill="#4F7DB8" stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {bookOut > 0 && <rect x={1840} y={502} width={26} height={78} fill="#2A1E16" opacity={0.85} />}
        {/* あなた (ソファでスマホ) */}
        <Person x={860} y={758} s={1.05} f={f} phase={2} pose="sit" face="smile" gaze={[5, 7]} cloth={HP.you} clothDark={HP.youDark} />
        <ellipse cx={870} cy={540} rx={80} ry={60} fill={HP.screenCore} opacity={0.22 + 0.04 * Math.sin(f / 5)} />
        <Sumaho x={922} y={604} s={0.35} rot={-10} f={f} screen="feed" glow={0.7} />
        {/* クッション (めくれる) */}
        <g transform={`rotate(${-38 * cushionLift} 1010 700)`}>
          <rect x={1010} y={600} width={170} height={100} rx={30} fill="#E0B84A" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1040 650 L 1150 650" stroke="#B8922E" strokeWidth={4} strokeDasharray="10 8" />
        </g>
        {cushionLift > 0 && <ellipse cx={1095} cy={698} rx={70} ry={10} fill={KRP.ink} opacity={0.3 * cushionLift} />}
        <YoruNoHeyaFront />
        {/* 捜索係 */}
        <Sousa x={pos[0]} y={pos[1]} s={SS} f={f} phase={5}
          face={flying ? "surprised" : at === 2 ? "worried" : "normal"} pose={flying ? "banzai" : "stand"}
          lean={at === 0 && !flying ? -10 : at === 2 && !flying ? 8 : 0} lens={!flying} lensAt={lens} />
        {flying && [0, 1, 2].map((k) => (
          <line key={k} x1={pos[0] - (f < 18 ? 40 : 40) - k * 22} y1={pos[1] - 40 - k * 24} x2={pos[0] - 90 - k * 22} y2={pos[1] - 20 - k * 24}
            stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        ))}
        {/* 空っぽの「?」の吹き出し (のぞいた所に残る) */}
        {bubble(470, 110, q[0], "q1")}
        {bubble(1150, 560, q[1], "q2")}
        {bubble(1800, 420, q[2], "q3")}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #15 暇は、どこへ消えたのでしょうか。
// 格: 並 / seed 5015
// 絵: どこ: 夜の部屋の壁に貼られた「尋ね人」風の貼り紙。演出: 貼り紙の中に、**ぼんやりした雲のような形の「暇」**のイラスト (顔はない・ふわふわした白い雲に小さな手足) と、大きな「?」。貼り紙の端がめくれて風でぱたぱた揺れる。下に虫めがね。題字は書かず、「行方不明」の判子マークだけ (字は「?」)。動き: 貼り紙がぱたぱた / 雲の暇がふっと薄くなる
// どこ: 夜の部屋の壁 (#14 と同じ壁紙)。画びょうとテープで貼られた大きな「尋ね人」風の貼り紙。下に小さな飾り棚と虫めがね
// 演出: 貼り紙の中に雲のような「暇」(顔なし・ふわふわの白い雲に小さな手足)。横に大きな「?」、角に赤い丸の判子「?」。下の切り取り札。懐中電灯の丸い光が壁を探って貼り紙に止まる。窓からの風で右下の角がぱたぱためくれ、暇はふっと薄くなって点線だけ残りかける
// 動き: 貼り紙の角がぱたぱた / f4-24 光の輪が左から貼り紙へ / f20-36 暇が薄くなり、ふわふわが1つ飛んでいく / 切り取り札がゆれる
const Hm015: React.FC<{ f: number }> = ({ f }) => {
  const L = 560, T = 80, R = 1360, B = 790;
  const flap = 0.45 + 0.35 * Math.sin(f / 3.2);
  const cc = 120;
  const fx = R - cc * flap, fy = B - cc * flap;
  const fade = 1 - 0.42 * easeInOut(seg(f, 20, 36));
  const spot = easeOut(seg(f, 4, 24));
  const sx = lerp(260, 900, spot) + Math.sin(f / 8) * 14, sy = lerp(620, 430, spot) + Math.cos(f / 9) * 10;
  const puff = seg(f, 24, 42);
  const tilt = -1.5 + Math.sin(f / 7) * 0.4;
  return (
    <Frame f={f} seed={5015} dark bg={C.nightWall}>
      <defs>
        <mask id="hmab15spot">
          <rect x={-60} y={-60} width={2040} height={1200} fill="white" />
          <circle cx={sx} cy={sy} r={500} fill="black" />
        </mask>
        <radialGradient id="hmab15light">
          <stop offset="0" stopColor={KRP.white} stopOpacity={0.22} /><stop offset="1" stopColor={KRP.white} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 壁紙と幅木 */}
      <rect x={-60} y={-60} width={2040} height={1200} fill={C.nightWall} />
      <g stroke={C.nightStripe} strokeWidth={3}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={i * 92 - 40} y1={-60} x2={i * 92 - 40} y2={900} />)}</g>
      <rect x={-60} y={900} width={2040} height={240} fill="#6E5A48" />
      <rect x={-60} y={888} width={2040} height={22} fill="#5A4636" stroke={KRP.ink} strokeWidth={5} />
      {/* 左: 窓のカーテンのはし (風) */}
      <path d={`M -60 -60 L 150 -60 Q ${120 + Math.sin(f / 4) * 22} 400 ${170 + Math.sin(f / 3.2) * 30} 900 L -60 900 Z`} fill="#6A4E7A" stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${200 + k * 40} ${300 + k * 140} q 60 ${-10 + Math.sin(f / 3 + k) * 10} 120 0`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.3} strokeLinecap="round" />)}
      {/* 右: コンセントと小さな額 */}
      <rect x={1600} y={640} width={60} height={86} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {[668, 698].map((oy) => <g key={oy}><rect x={1618} y={oy - 8} width={6} height={14} fill={KRP.ink} /><rect x={1636} y={oy - 8} width={6} height={14} fill={KRP.ink} /></g>)}
      <rect x={1540} y={160} width={220} height={170} fill="#E0B84A" stroke={KRP.ink} strokeWidth={6} />
      <rect x={1560} y={180} width={180} height={130} fill="#9FC8C0" />
      <path d="M 1560 310 L 1620 240 L 1670 290 L 1700 260 L 1740 310 Z" fill="#4E8A55" />
      {/* 貼り紙 */}
      <g transform={`rotate(${tilt} 960 80)`}>
        <polygon points={`${L + 14},${T + 18} ${R + 14},${T + 18} ${R + 14},${B + 18} ${L + 14},${B + 18}`} fill={KRP.ink} opacity={0.3} />
        <polygon points={`${L},${T} ${R},${T} ${R},${B - cc} ${fx},${fy} ${R - cc},${B} ${L},${B}`} fill={C.poster} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        {/* 紙の繊維とシミ */}
        <circle cx={L + 120} cy={T + 600} r={40} fill={C.posterBack} opacity={0.4} />
        <circle cx={R - 160} cy={T + 120} r={26} fill={C.posterBack} opacity={0.4} />
        {/* 上の帯 (字の代わりに太い線) */}
        <rect x={L + 60} y={T + 40} width={R - L - 120} height={20} rx={10} fill={KRP.ink} opacity={0.75} />
        {/* 似顔絵の枠 */}
        <rect x={L + 70} y={T + 100} width={470} height={420} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 雲の「暇」 */}
        <g opacity={fade} transform={`translate(${L + 305} ${T + 330 + Math.sin(f / 10) * 6})`}>
          {[-96, 0, 96].map((lx) => <rect key={lx} x={lx === 0 ? -6 : lx < 0 ? -60 : 48} y={90} width={14} height={60} rx={7} fill={KRP.ink} opacity={lx === 0 ? 0 : 1} />)}
          <ellipse cx={-54} cy={152} rx={20} ry={9} fill={KRP.ink} />
          <ellipse cx={58} cy={152} rx={20} ry={9} fill={KRP.ink} />
          <path d={`M -150 10 q -40 -30 -26 ${-10 + Math.sin(f / 5) * 8}`} stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d={`M 150 10 q 40 -40 30 ${-30 - Math.sin(f / 5) * 8}`} stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
          {[[-90, 20, 72], [-20, -40, 92], [70, -10, 80], [110, 50, 62], [0, 50, 90], [-110, 70, 50]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={C.cloudShade} stroke={KRP.ink} strokeWidth={6} />
          ))}
          {[[-90, 20, 66], [-20, -40, 86], [70, -10, 74], [110, 50, 56], [0, 50, 84], [-110, 70, 44]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy - 4} r={r} fill={C.cloud} />
          ))}
        </g>
        {/* 薄くなった分の点線のりんかく */}
        <ellipse cx={L + 305} cy={T + 330} rx={190} ry={130} fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="10 12" opacity={1 - fade} />
        {/* 飛んでいくふわふわ */}
        {puff > 0 && <circle cx={L + 420 + puff * 200} cy={T + 230 - puff * 120} r={30 * (1 - puff * 0.5)} fill={C.cloud} stroke={KRP.ink} strokeWidth={4} opacity={(1 - puff) * fade + 0.1} />}
        {/* 大きな「?」 */}
        <QMark x={L + 660} y={T + 420} s={2.6} f={f} color={KRP.red} />
        {/* 特徴の欄 (字の代わりの線) */}
        {[0, 1, 2].map((k) => <rect key={k} x={L + 80} y={T + 550 + k * 34} width={440 - k * 90} height={12} rx={6} fill={KRP.gray} />)}
        {/* 赤い丸の判子「?」 */}
        <g transform={`translate(${R - 150} ${T + 580}) rotate(-12)`} opacity={0.88}>
          <circle r={74} fill="none" stroke={KRP.red} strokeWidth={9} />
          <circle r={58} fill="none" stroke={KRP.red} strokeWidth={4} />
          <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={KRP.red}>?</text>
        </g>
        {/* めくれた角の裏 */}
        <polygon points={`${R},${B - cc} ${fx},${fy} ${R - cc},${B}`} fill={C.posterBack} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 下の切り取り札 (ゆれる) */}
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k} transform={`rotate(${Math.sin(f / 4 + k) * 4} ${L + 40 + k * 70} ${B})`}>
            <rect x={L + 16 + k * 70} y={B} width={48} height={70} fill={C.poster} stroke={KRP.ink} strokeWidth={4} />
            <line x1={L + 40 + k * 70} y1={B + 12} x2={L + 40 + k * 70} y2={B + 58} stroke={KRP.gray} strokeWidth={5} />
          </g>
        ))}
        {/* 画びょうとテープ */}
        {[[L + 24, T + 24], [R - 24, T + 24], [L + 24, B - 24]].map(([px, py], i) => (
          <g key={i}><circle cx={px} cy={py} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} /><circle cx={px - 5} cy={py - 5} r={5} fill={KRP.white} opacity={0.6} /></g>
        ))}
        <rect x={900} y={T - 26} width={130} height={46} rx={4} fill="#9FC8C0" opacity={0.85} stroke={KRP.ink} strokeWidth={3} transform={`rotate(4 965 ${T})`} />
      </g>
      {/* 下の飾り棚と虫めがね */}
      <rect x={1060} y={876} width={400} height={20} rx={5} fill="#8A6A4E" stroke={KRP.ink} strokeWidth={5} />
      <g transform="translate(300 0) rotate(-14 960 850)">
        <rect x={980} y={842} width={130} height={20} rx={10} fill="#6E4526" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={930} cy={852} r={50} fill={HP.screenCore} opacity={0.5} />
        <circle cx={930} cy={852} r={50} fill="none" stroke={HP.brass} strokeWidth={12} />
        <circle cx={930} cy={852} r={50} fill="none" stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 懐中電灯の光 (まわりは暗く) */}
      <rect x={-60} y={-60} width={2040} height={1200} fill="#1A1828" opacity={0.42} mask="url(#hmab15spot)" />
      <circle cx={sx} cy={sy} r={500} fill="url(#hmab15light)" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #16 この謎を追って2500年さかのぼったら、ちょっとおかしな事件が、いくつも出てきました。
// 格: 山 / seed 5016
// 絵: どこ: 時間をさかのぼるトンネル (渦巻く年表の通路)。壁に年代札が流れていく: 「2025年」→「1960年」→「1876年」→「江戸」→「321年」→「約2500年前」。演出: 捜索係がトロッコに乗って奥へ進む。通路の両脇の扉の小窓から、これから出てくる事件の小物がちらっと見える (罰金の巾着・カレンダー・本・時計)。動き: 年代札が奥から手前へ流れる (速く) / トロッコが揺れる / 小窓が光る
// どこ: 時間をさかのぼるトンネル (木の輪が渦を巻いて奥へ続く年表の通路)。一点透視で、奥に古い時代の光
// 演出: 捜索係がトロッコに乗って奥へ突き進む (こちらを振り返って虫めがねを前に掲げる)。壁の年代札が奥から手前へ飛んでいく: 2025年→1960年→1876年→江戸→321年→約2500年前。両脇の扉の小窓が光って、これから出てくる事件の小物 (罰金の巾着・カレンダー・本・時計) がちらり
// 動き: 輪とまくら木と札が手前へ流れる (速く) / トロッコががたがた揺れる / 小窓が明滅 / 風の線
const Hm016: React.FC<{ f: number }> = ({ f }) => {
  const VX = 960, VY = 430, SP = 0.09;
  const P = (X: number, Y: number, z: number): [number, number] => [VX + X / z, VY + Y / z];
  const mod = (a: number, n: number) => ((a % n) + n) % n;
  const rings = Array.from({ length: 10 }, (_, k) => 0.9 + mod(k * 0.8 - f * SP, 8)).sort((a, b) => b - a);
  const sleepers = Array.from({ length: 12 }, (_, k) => 0.8 + mod(k * 0.55 - f * SP, 6.6));
  const YEARS = ["2025年", "1960年", "1876年", "江戸", "321年", "約2500年前"];
  const plates = YEARS.map((txt, i) => ({ txt, i, z: 1 + i * 1.4 + 0.45 - f * SP })).filter((p) => p.z > 1.05 && p.z < 8).sort((a, b) => b.z - a.z);
  const doors = Array.from({ length: 6 }, (_, d) => ({ d, z: 1 + mod(d * 1.4 + 0.7 - f * SP, 8.4) })).sort((a, b) => b.z - a.z);
  const shake = Math.sin(f * 1.9) * 1.4;
  const bob = Math.abs(Math.sin(f * 0.95)) * -6;
  const icon = (k: number) => {
    if (k === 0) return (
      <g><path d="M -20 -6 Q -26 26 0 28 Q 26 26 20 -6 Z" fill="#8A4E7A" stroke={KRP.ink} strokeWidth={3} />
        <path d="M -16 -8 L 16 -8 L 10 -18 L -10 -18 Z" fill="#6A3A5E" stroke={KRP.ink} strokeWidth={3} />
        <line x1={-12} y1={-8} x2={12} y2={-8} stroke={KRP.yellow} strokeWidth={4} /></g>
    );
    if (k === 1) return (
      <g><rect x={-24} y={-22} width={48} height={46} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-24} y={-22} width={48} height={12} fill={HP.rest} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((r) => <rect key={r} x={-20} y={-6 + r * 10} width={8} height={7} fill={HP.restSoft} />)}</g>
    );
    if (k === 2) return (
      <g><rect x={-22} y={-20} width={44} height={40} rx={3} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-14} y={-20} width={36} height={40} fill="#5E88C8" stroke={KRP.ink} strokeWidth={2} />
        <line x1={-8} y1={-8} x2={14} y2={-8} stroke={KRP.white} strokeWidth={3} /></g>
    );
    return (
      <g><circle r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={-16} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${f * 20})`} />
        <line x1={0} y1={0} x2={10} y2={0} stroke={KRP.ink} strokeWidth={4} /></g>
    );
  };
  return (
    <Frame f={f} seed={5016} dark bg={C.tunDeep}>
      <defs>
        <radialGradient id="hmab16glow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={C.tunGlow} /><stop offset="0.25" stopColor="#C98A4A" /><stop offset="1" stopColor={C.tunDeep} />
        </radialGradient>
      </defs>
      <rect x={-60} y={-60} width={2040} height={1200} fill="url(#hmab16glow)" />
      {/* 奥の光 */}
      <ellipse cx={VX} cy={VY} rx={90} ry={60} fill={KRP.white} opacity={0.75 + 0.15 * Math.sin(f / 3)} />
      {/* 渦を巻く木の輪 */}
      {rings.map((z, k) => {
        const hw = 1150 / z, hh = 720 / z;
        return (
          <g key={k} transform={`rotate(${z * 7 - f * 0.6} ${VX} ${VY})`} opacity={clamp01((z - 0.9) * 2) * clamp01((8.6 - z) / 2)}>
            <rect x={VX - hw} y={VY - hh} width={hw * 2} height={hh * 2} rx={260 / z} fill="none"
              stroke={k % 2 ? C.tunRing1 : C.tunRing2} strokeWidth={70 / z} />
            <rect x={VX - hw} y={VY - hh} width={hw * 2} height={hh * 2} rx={260 / z} fill="none" stroke={KRP.ink} strokeWidth={Math.max(2, 7 / z)} />
            {/* 輪の目盛り (年表の刻み) */}
            {Array.from({ length: 8 }, (_, j) => (
              <line key={j} x1={VX - hw + (j + 0.5) * hw / 4} y1={VY - hh - 30 / z} x2={VX - hw + (j + 0.5) * hw / 4} y2={VY - hh + 30 / z}
                stroke={KRP.ink} strokeWidth={Math.max(2, 6 / z)} opacity={0.6} />
            ))}
          </g>
        );
      })}
      {/* 線路 */}
      {sleepers.map((z, k) => {
        const [x1, y1] = P(-300, 650, z), [x2] = P(300, 650, z);
        return <rect key={k} x={x1} y={y1 - 14 / z} width={x2 - x1} height={28 / z} fill={C.cartDark} stroke={KRP.ink} strokeWidth={Math.max(2, 5 / z)} opacity={clamp01((z - 0.8) * 3)} />;
      })}
      {[-200, 200].map((X) => {
        const [xa, ya] = P(X, 650, 0.6), [xb, yb] = P(X, 650, 9);
        return <line key={X} x1={xa} y1={ya} x2={xb} y2={yb} stroke={C.rail} strokeWidth={14} strokeLinecap="round" />;
      })}
      {/* 扉と小窓 */}
      {doors.map(({ d, z }) => {
        const side = d % 2 ? 1 : -1;
        const [dx, dy] = P(side * 880, 60, z);
        const sc = 1 / z;
        const lit = 0.55 + 0.45 * Math.sin(f / 2.5 + d * 2);
        return (
          <g key={d} transform={`translate(${dx} ${dy}) scale(${sc})`} opacity={clamp01((z - 1.05) * 2.5) * clamp01((9 - z) / 2)}>
            <rect x={-130} y={-210} width={260} height={420} rx={10} fill="#5E4026" stroke={KRP.ink} strokeWidth={10} />
            <rect x={-80} y={-170} width={160} height={120} rx={8} fill={C.windowLit} opacity={lit} stroke={KRP.ink} strokeWidth={8} />
            <g transform="translate(0 -110) scale(1.8)">{icon(d % 4)}</g>
            <circle cx={side * -90} cy={30} r={14} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1].map((h) => <rect key={h} x={side * 110 - 14} y={-150 + h * 230} width={28} height={50} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
          </g>
        );
      })}
      {/* 年代札 (奥から手前へ飛んでくる) */}
      {plates.map(({ txt, i, z }) => {
        const side = i % 2 ? 1 : -1;
        const [px, py] = P(side * 700, -340, z);
        const sc = 1.6 / z;
        const w = txt.length * 56 + 60;
        return (
          <g key={txt} transform={`translate(${px} ${py}) scale(${sc})`} opacity={clamp01((z - 1.1) * 2.2) * clamp01((7.6 - z) / 1.5)}>
            <line x1={-w / 2 + 30} y1={-90} x2={-w / 2 + 30} y2={-44} stroke={KRP.ink} strokeWidth={6} />
            <line x1={w / 2 - 30} y1={-90} x2={w / 2 - 30} y2={-44} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-w / 2} y={-46} width={w} height={92} rx={12} fill={C.plank} stroke={KRP.ink} strokeWidth={7} />
            <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.ink}>{txt}</text>
          </g>
        );
      })}
      {/* 風の線 */}
      {Array.from({ length: 14 }, (_, k) => {
        const a = (k / 14) * Math.PI * 2 + 0.3;
        const r0 = 200 + mod(k * 97 + f * 40, 700);
        return <line key={k} x1={VX + Math.cos(a) * r0} y1={VY + Math.sin(a) * r0 * 0.62} x2={VX + Math.cos(a) * (r0 + 120)} y2={VY + Math.sin(a) * (r0 + 120) * 0.62}
          stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.35} />;
      })}
      {/* トロッコと捜索係 */}
      <g transform={`translate(0 ${bob}) rotate(${shake} 960 820)`}>
        <Sousa x={960} y={720} s={0.7} f={f} phase={2} face="joy" pose="raise" lensAt={[960, 290]} lean={-4} />
        {/* 帽子が飛ばされそうな線 */}
        <path d="M 1020 470 q 30 -10 60 0" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6} />
        <path d="M 690 640 L 1230 640 L 1200 830 L 720 830 Z" fill={C.cartBody} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
        <rect x={680} y={624} width={560} height={28} rx={8} fill={C.cartDark} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => <line key={k} x1={710 + k * 4} y1={690 + k * 48} x2={1210 - k * 4} y2={690 + k * 48} stroke={C.cartDark} strokeWidth={5} />)}
        {[730, 1190].map((rx) => [670, 800].map((ry) => <circle key={`${rx}${ry}`} cx={rx} cy={ry} r={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />))}
        {[780, 1140].map((wx) => (
          <g key={wx}>
            <circle cx={wx} cy={852} r={44} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
            <line x1={wx - 30} y1={852} x2={wx + 30} y2={852} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${f * 40} ${wx} 852)`} />
            <circle cx={wx} cy={852} r={10} fill={KRP.silver} />
          </g>
        ))}
        {/* 火花 */}
        {[0, 1, 2].map((k) => <circle key={k} cx={1190 + ((f * 13 + k * 20) % 60)} cy={880 - ((f * 7 + k * 11) % 30)} r={5} fill={HP.spark} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #17 休まないと罰金を取られる村。日曜を休みにしたら、休みが減った役所。そして、駅で売られはじめた、暇。
// 格: 山 / seed 5017
// 絵: どこ: 3つの事件の「予告ポスター」が並んだ映画館のロビー風の掲示板。演出: ①江戸の村 (働いている村人の背中に、若者が罰金の巾着を突き出す) ②明治の役所 (日曜のカレンダーの前でしょんぼりする役人) ③駅の本屋 (棚に本・新聞) の3枚のポスターが、f で順番にライトアップ。ポスターの下に小札「江戸」「明治」「駅」。動き: スポットライトが左→中→右と移る / 各ポスターの中の小物が少し動く
// どこ: 映画館のロビー風の掲示板 (赤い壁・金の額・豆電球の縁取り・じゅうたん・ロープの柵)
// 演出: 3枚の「近日公開」ポスター。①江戸の村: 畑で働く村人の背中に、鉢巻の若者が罰金の巾着をずいっと突き出す ②明治の役所: 日曜が赤いカレンダーの前で、口ひげの役人がしょんぼり ③駅の本屋: ひさしの下の棚に本と新聞、上に駅の時計。スポットライトが左→中→右と点いていき、点いたポスターは明るいまま
// 動き: f4/f16/f28 にライトが点く (光の筋が移る) / 巾着がゆれる・役人の涙・新聞がぱたぱた / 豆電球が流れるように点滅
const Hm017: React.FC<{ f: number }> = ({ f }) => {
  const XS = [400, 960, 1520], PT = 110, PW = 470, PH = 620;
  const lit = [0, 1, 2].map((i) => easeOut(seg(f, 4 + i * 12, 10 + i * 12)));
  const cur = f < 16 ? 0 : f < 28 ? 1 : 2;
  const poster = (i: number) => {
    if (i === 0) return (
      <g>
        <rect x={0} y={0} width={PW} height={PH} fill={C.edoSky} />
        <circle cx={380} cy={110} r={46} fill={KRP.orange} opacity={0.8} />
        <path d="M 0 300 Q 120 230 240 290 T 470 270 L 470 340 L 0 340 Z" fill={C.oliveDark} opacity={0.6} />
        <rect x={0} y={330} width={PW} height={290} fill={C.edoField} />
        {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M 0 ${360 + k * 44} Q 235 ${350 + k * 44} 470 ${364 + k * 44}`} stroke="#8A5E38" strokeWidth={6} fill="none" />)}
        {/* 働く村人 (背中) */}
        <Person x={150} y={560} s={0.85} f={f} phase={1} lean={14} cloth={C.noragi} clothDark="#5E4A36" />
        <g transform={bodyT(150, 560, 0.85, f, 1, 14)}>
          <circle cx={0} cy={-228} r={67} fill={KRP.ink} />
          <rect x={-66} y={-250} width={132} height={18} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 60 -246 l 30 -10 l -6 22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* くわ */}
        <g transform={`rotate(${-20 + Math.sin(f / 6) * 4} 110 470)`}>
          <line x1={110} y1={470} x2={30} y2={300} stroke="#7A5A3A" strokeWidth={12} strokeLinecap="round" />
          <path d="M 18 290 L 60 300 L 40 340 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 若者 (罰金の巾着を突き出す) */}
        <Person x={370} y={570} s={0.9} f={f} phase={3} pose="point" pointDir={-1} face="angry" gaze={[-6, 0]} cloth={C.indigo} clothDark={C.noragi} />
        <g transform={bodyT(370, 570, 0.9, f, 3)}>
          <rect x={-66} y={-262} width={132} height={18} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform={`translate(${370 - 153 * 0.9} ${570 - 148 * 0.9 + 8}) rotate(${Math.sin(f / 4) * 10})`}>
          <path d="M -26 0 Q -34 46 0 50 Q 34 46 26 0 Z" fill="#8A4E7A" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -20 0 L 20 0 L 12 -14 L -12 -14 Z" fill="#6A3A5E" stroke={KRP.ink} strokeWidth={4} />
          <line x1={-16} y1={0} x2={16} y2={0} stroke={KRP.yellow} strokeWidth={5} />
        </g>
        {f > 10 && [0, 1].map((k) => <path key={k} d={`M ${220 - k * 18} ${300 + k * 20} l -22 -12`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />)}
      </g>
    );
    if (i === 1) return (
      <g>
        <rect x={0} y={0} width={PW} height={PH} fill={C.meijiWall} />
        <rect x={0} y={470} width={PW} height={150} fill="#B39A76" />
        {/* 壁のカレンダー (日曜の列が赤) */}
        <g transform="translate(60 60)">
          <rect x={0} y={0} width={240} height={200} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={0} y={0} width={240} height={34} fill={HP.rest} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
            <rect key={`${r}${c}`} x={8 + c * 32} y={44 + r * 30} width={26} height={24} rx={3}
              fill={c === 0 ? HP.restSoft : KRP.cream} stroke={c === 0 ? HP.rest : KRP.gray} strokeWidth={2} />
          )))}
        </g>
        {/* 落ちてくる暦の紙 */}
        <rect x={0} y={0} width={34} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
          transform={`translate(${330 + Math.sin(f / 6) * 20} ${200 + (f * 4) % 220}) rotate(${f * 6})`} />
        {/* 机 */}
        <rect x={290} y={430} width={180} height={20} fill="#8E6234" stroke={KRP.ink} strokeWidth={4} />
        <rect x={310} y={400} width={70} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={400} y={406} width={26} height={24} rx={4} fill={KRP.ink} />
        {/* しょんぼりの役人 */}
        <Person x={200} y={590} s={0.95} f={f} phase={2} face="sad" gaze={[0, 5]} cloth={C.meijiBlack} clothDark={KRP.ink} lean={-5} />
        <g transform={bodyT(200, 590, 0.95, f, 2, -5)}>
          <path d="M -30 -196 Q -16 -206 0 -198 Q 16 -206 30 -196 Q 16 -190 0 -194 Q -16 -190 -30 -196 Z" fill={KRP.ink} />
          {[-120, -96, -72].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={HP.brass} />)}
          <rect x={-58} y={-160} width={116} height={14} fill={KRP.ink} opacity={0.6} />
        </g>
        <path d={`M 120 ${330 + Math.sin(f / 5) * 4} q -20 -20 -40 -10`} stroke={KRP.grayDark} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    );
    return (
      <g>
        <rect x={0} y={0} width={PW} height={PH} fill="#E9C9A0" />
        <rect x={0} y={500} width={PW} height={120} fill="#B8AFA2" />
        <rect x={0} y={492} width={PW} height={16} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {/* 駅の時計 */}
        <line x1={380} y1={0} x2={380} y2={60} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={380} cy={100} r={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={380} y1={100} x2={380} y2={70} stroke={KRP.ink} strokeWidth={5} />
        <line x1={380} y1={100} x2={402} y2={108} stroke={KRP.ink} strokeWidth={5} />
        {/* 本屋の台 */}
        <path d="M 30 170 L 330 170 L 350 220 L 10 220 Z" fill={C.kioskRoof} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M ${30 + k * 50} 170 L ${10 + k * 57} 220`} stroke={KRP.white} strokeWidth={10} opacity={0.6} />)}
        <rect x={30} y={220} width={300} height={280} fill="#8E6234" stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x={40} y={300 + r * 66} width={280} height={8} fill="#5E4026" />
            {Array.from({ length: 9 }, (_, k) => (
              <rect key={k} x={46 + k * 30} y={244 + r * 66 + (k % 3) * 4} width={24} height={56 - (k % 3) * 4}
                fill={["#C96A4A", "#4F7DB8", "#E0B84A", "#6EA36A", "#9A6AB0"][(k + r) % 5]} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        {/* 新聞の束 (ぱたぱた) */}
        <rect x={350} y={420} width={100} height={70} fill="#EDE8DC" stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 350 420 L 450 420 L ${440 + Math.sin(f / 3) * 6} ${384 + Math.sin(f / 3) * 10} L 360 392 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => <line key={k} x1={362} y1={436 + k * 14} x2={438} y2={436 + k * 14} stroke={KRP.gray} strokeWidth={4} />)}
        {/* ぶら下がる雑誌 */}
        <path d="M 30 520 Q 235 540 470 520" stroke="#9A8A74" strokeWidth={4} fill="none" />
      </g>
    );
  };
  return (
    <Frame f={f} seed={5017} dark bg={C.lobbyWall}>
      {/* 壁 */}
      <rect x={-60} y={-60} width={2040} height={900} fill={C.lobbyWall} />
      <g stroke={C.lobbyWallDark} strokeWidth={10}>{Array.from({ length: 13 }, (_, k) => <line key={k} x1={k * 160} y1={-60} x2={k * 160} y2={840} />)}</g>
      {/* じゅうたん */}
      <rect x={-60} y={840} width={2040} height={300} fill={C.carpet} />
      <rect x={-60} y={830} width={2040} height={18} fill={C.frame} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 20 }, (_, k) => <circle key={k} cx={k * 100 + 40} cy={930 + (k % 2) * 60} r={12} fill={C.carpetDot} />)}
      {/* ポスター */}
      {XS.map((cx, i) => {
        const L = cx - PW / 2;
        return (
          <g key={i}>
            <rect x={L - 34} y={PT - 34} width={PW + 68} height={PH + 68} rx={10} fill={C.frame} stroke={KRP.ink} strokeWidth={7} />
            {/* 豆電球 */}
            {Array.from({ length: 22 }, (_, k) => {
              const per = 2 * (PW + PH + 50);
              const d = (k / 22) * per;
              const w = PW + 50, h = PH + 50;
              const [bx, by] = d < w ? [L - 25 + d, PT - 25] : d < w + h ? [L + PW + 25, PT - 25 + d - w] : d < 2 * w + h ? [L + PW + 25 - (d - w - h), PT + PH + 25] : [L - 25, PT + PH + 25 - (d - 2 * w - h)];
              const on = lit[i] > 0.5 && (k + Math.floor(f / 3)) % 3 !== 0;
              return <circle key={k} cx={bx} cy={by} r={9} fill={on ? HP.spark : "#8A6A3A"} stroke={KRP.ink} strokeWidth={2.5} />;
            })}
            <svg x={L} y={PT} width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>{poster(i)}</svg>
            <rect x={L} y={PT} width={PW} height={PH} fill="none" stroke={KRP.ink} strokeWidth={6} />
            {/* 消灯中は暗く */}
            <rect x={L} y={PT} width={PW} height={PH} fill="#1A1218" opacity={0.62 * (1 - lit[i])} />
            <TagPlate x={cx} y={790} text={["江戸", "明治", "駅"][i]} size={40} t={lit[i]} />
          </g>
        );
      })}
      {/* スポットライトの光の筋 (いま点いた所がいちばん強い) */}
      {XS.map((cx, i) => lit[i] > 0 && (
        <polygon key={i} points={`${cx - 60},-60 ${cx + 60},-60 ${cx + 300},760 ${cx - 300},760`} fill={KRP.white}
          opacity={(i === cur ? 0.16 : 0.07) * lit[i]} />
      ))}
      {XS.map((cx) => <rect key={cx} x={cx - 50} y={-60} width={100} height={46} rx={10} fill={KRP.ink} />)}
      {/* ロープの柵 (手前) */}
      {[200, 960, 1720].map((px) => (
        <g key={px}>
          <rect x={px - 10} y={880} width={20} height={180} fill={C.frame} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={px} cy={876} r={18} fill={C.frame} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={px} cy={1060} rx={50} ry={14} fill={C.frame} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {[[200, 960], [960, 1720]].map(([a, b]) => (
        <path key={a} d={`M ${a} 890 Q ${(a + b) / 2} ${960 + Math.sin(f / 8) * 6} ${b} 890`} stroke="#B83A3A" strokeWidth={16} fill="none" />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #18 道具は、このものさしです。日、時間、分、秒。名づけて、暇のものさし。
// 格: 山 / seed 5018
// 絵: どこ: 古い作業机の上 (木の天板・工具・メモ・虫めがね)。演出: Monosashi (lit=0, labels) が机の引き出しから**すーっと引き出されて**真ん中に置かれる。4つの「?」札が順番に光り、それぞれ「日」「時間」「分」「秒」の文字に一瞬だけ変わって (ちらっと見せる) また「?」に戻る演出は不要 — **札は ? のまま**、かわりにものさしの上に、区画ごとにその単位の小物を薄い点線で浮かべる (日=カレンダーの1枚 / 時間=懐中時計 / 分=駅の時計 / 秒=ストップウォッチ)。カメラはゆっくり寄る。動き: f0-14 引き出しから出てくる / f14-38 小物の点線が順番に出る / 金具が光る
// どこ: 古い作業机 (Sagyozukue)。手前に机の引き出しが開いている
// 演出: 暇のものさし (lit=0・札は「?」のまま) が引き出しの中からすーっと持ち上がって天板の真ん中に置かれる。置かれると、区画ごとにその単位の小物が薄い点線で浮かぶ (日=カレンダーの1枚 / 時間=懐中時計 / 分=駅の時計 / 秒=ストップウォッチ)。机には虫めがねと鉛筆
// 動き: f0-14 引き出しから出てくる / f14-38 小物の点線が左から順に出る / 金具がきらり / カメラがゆっくり寄る
const Hm018: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 0, 14));
  const my = lerp(930, 560, up);
  const ms = lerp(0.9, 1, up);
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const ghosts = [0, 1, 2, 3].map((i) => easeOut(seg(f, 14 + i * 6, 20 + i * 6)));
  const glint = seg(f, 16, 24) * (1 - seg(f, 24, 30));
  const ghost = (i: number) => {
    const st = { fill: KRP.white, fillOpacity: 0.35, stroke: KRP.ink, strokeWidth: 5, strokeDasharray: "12 9" } as const;
    if (i === 0) return (
      <g>
        <rect x={-70} y={-80} width={140} height={160} rx={6} {...st} />
        <rect x={-70} y={-80} width={140} height={38} {...st} fill={HP.hi} fillOpacity={0.35} />
        {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={-56 + c * 30} y={-28 + r * 32} width={22} height={22} rx={3} {...st} strokeWidth={3} />))}
      </g>
    );
    if (i === 1) return (
      <g>
        <circle cx={0} cy={-90} r={16} {...st} />
        <circle r={74} {...st} />
        {Array.from({ length: 12 }, (_, k) => {
          const a = k * Math.PI / 6;
          return <line key={k} x1={Math.sin(a) * 58} y1={-Math.cos(a) * 58} x2={Math.sin(a) * 66} y2={-Math.cos(a) * 66} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />;
        })}
        <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        <line x1={0} y1={0} x2={30} y2={10} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      </g>
    );
    if (i === 2) return (
      <g>
        <line x1={-40} y1={-96} x2={40} y2={-96} stroke={KRP.ink} strokeWidth={6} strokeDasharray="12 9" opacity={0.7} />
        <line x1={0} y1={-96} x2={0} y2={-74} stroke={KRP.ink} strokeWidth={6} strokeDasharray="6 6" opacity={0.7} />
        <circle r={74} {...st} />
        <circle r={60} {...st} strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={-50} stroke={KRP.ink} strokeWidth={5} opacity={0.6} transform={`rotate(${Math.floor(f / 6) * 6})`} />
        <line x1={0} y1={0} x2={-26} y2={-14} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
      </g>
    );
    return (
      <g>
        <rect x={-14} y={-100} width={28} height={22} rx={4} {...st} />
        <rect x={40} y={-82} width={20} height={16} rx={4} {...st} transform="rotate(40 50 -74)" />
        <circle r={70} {...st} />
        <path d="M 0 0 L 0 -56 A 56 56 0 0 1 48 -28 Z" fill={HP.byo} opacity={0.25} />
        <line x1={0} y1={0} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={4} opacity={0.6} transform={`rotate(${f * 12})`} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={5018}>
      <g transform={`translate(960 520) scale(${cam}) translate(-960 -520)`}>
        <Sagyozukue f={f} />
        {/* 天板の小物: 虫めがね・鉛筆・削りかす */}
        <g transform="rotate(-18 330 800)">
          <rect x={360} y={790} width={150} height={24} rx={12} fill="#6E4526" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={300} cy={802} r={62} fill={HP.screenCore} opacity={0.5} />
          <circle cx={300} cy={802} r={62} fill="none" stroke={HP.brass} strokeWidth={14} />
          <circle cx={300} cy={802} r={62} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="rotate(12 1450 780)">
          <rect x={1340} y={770} width={220} height={22} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1560 770 L 1600 781 L 1560 792 Z" fill={KRP.floor} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1320} y={770} width={22} height={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {[[1250, 840], [1280, 860], [1230, 870]].map(([cx, cy], i) => <path key={i} d={`M ${cx} ${cy} q 10 -10 20 0 q -10 8 -20 0`} fill={KRP.floor} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 引き出し (手前に開いている) */}
        <rect x={420} y={830} width={1080} height={300} fill="#5E4026" stroke={KRP.ink} strokeWidth={8} />
        <rect x={450} y={850} width={1020} height={260} fill="#3E2A1A" />
        {/* 引き出しの中身: 糸巻き・釘の小箱・古い鍵・紙きれ */}
        <circle cx={560} cy={960} r={44} fill="#C96A4A" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={560} cy={960} r={16} fill="#E9DFC6" stroke={KRP.ink} strokeWidth={4} />
        <rect x={1240} y={900} width={150} height={100} rx={8} fill="#A9804A" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, k) => <line key={k} x1={1260 + k * 22} y1={920} x2={1268 + k * 22} y2={980} stroke={KRP.silver} strokeWidth={5} />)}
        <g transform="rotate(-20 760 990)"><circle cx={720} cy={990} r={20} fill="none" stroke={HP.brass} strokeWidth={8} /><rect x={738} y={984} width={80} height={12} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} /></g>
        <rect x={960} y={940} width={160} height={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(8 1040 995)" opacity={0.9} />
        <rect x={400} y={1040} width={1120} height={60} fill="#8E6234" stroke={KRP.ink} strokeWidth={8} />
        <rect x={900} y={1056} width={120} height={22} rx={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* ものさし */}
        <Monosashi x={960} y={my} s={ms} lit={0} f={f} tilt={lerp(-3, 0, up)} />
        {/* 持ち上がる勢いの線 */}
        {up > 0.05 && up < 1 && [0, 1, 2, 3].map((k) => (
          <line key={k} x1={500 + k * 300} y1={my + 110} x2={500 + k * 300} y2={my + 190} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={(1 - up) * 0.7} />
        ))}
        {/* 金具のきらり */}
        {glint > 0 && [[262, 488], [1658, 488]].map(([gx, gy], k) => (
          <g key={k} transform={`translate(${gx} ${gy}) scale(${glint})`}>
            <path d="M 0 -34 L 7 -7 L 34 0 L 7 7 L 0 34 L -7 7 L -34 0 L -7 -7 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 区画ごとの単位の小物 (点線) */}
        {[0, 1, 2, 3].map((i) => {
          const [sx, sy] = monoSlot(i, 960, 560, 1);
          const t = ghosts[i];
          if (t <= 0) return null;
          return (
            <g key={i} opacity={t}>
              <line x1={sx} y1={sy - 8} x2={sx} y2={sy - 48} stroke={KRP.ink} strokeWidth={4} strokeDasharray="6 8" opacity={0.6} />
              <g transform={`translate(${sx} ${sy - 140 - (1 - t) * 30 + Math.sin(f / 8 + i) * 5}) scale(${0.8 + 0.2 * t})`}>{ghost(i)}</g>
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #19 まずは、いちばん大きな暇から、測ってみます。
// 格: 並 / seed 5019
// 絵: どこ: #18 と同じ作業机 (続き)。演出: Monosashi (lit=0, focus=0) の「日」の区画が光る。捜索係 (#14 の丸頭) が大きな虫めがねを担いで、ものさしの左端によいしょと登る。カメラは「日」の区画に寄っていく。動き: 捜索係がよじ登る / 「日」の光 / 寄り
// どこ: #18 と同じ作業机 (Sagyozukue) とものさし (続き)
// 演出: ものさしの「日」の区画だけが光りはじめる。捜索係が大きな虫めがねを掲げて、ものさしの左端によいしょとよじ登り、てっぺんで「日」の区画に虫めがねを向けてにっこり。踏み台にマッチ箱
// 動き: f0-8 机の上で見上げる / f8-24 よじ登る (汗) / f24- てっぺんで虫めがねを向ける / 「日」の光がふくらむ / カメラが「日」へ寄っていく
const Hm019: React.FC<{ f: number }> = ({ f }) => {
  const zt = easeInOut(seg(f, 4, 40));
  const z = lerp(1, 1.45, zt), cx = lerp(960, 470, zt), cy = lerp(540, 520, zt);
  const climb = easeInOut(seg(f, 8, 24));
  const top = f >= 24;
  const sx = lerp(230, 330, climb), sy = lerp(700, 488, climb) + (f >= 8 && f < 24 ? Math.sin(f * 1.2) * 4 : 0);
  const glow = seg(f, 2, 14);
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <Frame f={f} seed={5019} bg="#D9CDB4">
      <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
        {/* 寄ったときに左端が切れないよう、壁と天板を左へのばす */}
        <rect x={-500} y={-60} width={480} height={440} fill="#D9CDB4" />
        <rect x={-500} y={380} width={480} height={800} fill="#B9874F" />
        <rect x={-500} y={372} width={480} height={24} fill="#8E6234" stroke={KRP.ink} strokeWidth={6} />
        <Sagyozukue f={f} />
        <Monosashi x={960} y={560} s={1} lit={0} f={f} focus={0} />
        {/* 「日」の区画の光 (まだ刻まれていないので自前で光らせる) */}
        <rect x={266} y={489} width={344} height={142} rx={16} fill={HP.spark} opacity={glow * (0.25 + 0.12 * pulse)} />
        <rect x={266} y={489} width={344} height={142} rx={16} fill="none" stroke={HP.hi} strokeWidth={6} opacity={glow} strokeDasharray="16 10" />
        {glow > 0 && [0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={300 + k * 70} y1={478} x2={290 + k * 75} y2={448 - 10 * pulse} stroke={HP.spark} strokeWidth={6} strokeLinecap="round" opacity={glow * 0.9} />
        ))}
        <circle cx={435} cy={685} r={52} fill="none" stroke={HP.hi} strokeWidth={5} opacity={glow * (0.5 + 0.4 * pulse)} />
        {/* 踏み台のマッチ箱 */}
        <rect x={150} y={650} width={120} height={56} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <rect x={160} y={660} width={100} height={36} fill={KRP.white} opacity={0.5} />
        <rect x={150} y={650} width={10} height={56} fill="#6E4526" />
        {/* 捜索係 */}
        <Sousa x={sx} y={sy} s={0.6} f={f} phase={6}
          face={top ? "joy" : f >= 8 ? "worried" : "normal"} pose={top ? "point" : f >= 8 ? "raise" : "stand"}
          lean={top ? 4 : f >= 8 ? 12 : -4} gaze={top ? [4, 6] : [3, -5]}
          lensAt={top ? [470 + Math.sin(f / 6) * 10, 560] : f >= 8 ? [sx + 20, sy - 250] : [sx + 60, sy - 170]} />
        {/* 汗としがみつき線 */}
        {f >= 8 && f < 24 && (
          <g>
            <path d={`M ${sx - 52} ${sy - 150} q -8 12 0 18 q 8 -6 0 -18 Z`} fill="#7FA8C9" />
            {[0, 1].map((k) => <path key={k} d={`M ${sx + 50 + k * 16} ${sy - 30} l 14 -8`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
          </g>
        )}
        {top && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${sx - 70 + k * 20} ${sy - 210 - k * 6} l -14 -14`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - seg(f, 30, 42)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #20 第1章、7日に1度の、休み。
// 格: 山 / seed 5020
// 絵: 章扉。どこ: 古代の村の夕暮れ。土の家々・石畳・遠くの丘・オリーブの木。7日目の太陽が沈み、家々に灯がともる。演出: 道具や農具が家の前に立てかけられ、人々が家に入っていく (働く手を止める)。章扉の題字 ChapterDoor num=1 title="7日に1度の、休み。" を画面右に。主役の村は左寄り。動き: 太陽が沈む / 灯がともっていく / 煙突の煙
// どこ: 古代の村の夕暮れ。平屋根の土の家々・石畳・遠くの丘・オリーブの木。右の空に夕日
// 演出: 夕日が丘に沈み、窓にひとつずつ灯がともる。村人たちが手を止める: 父さんはくわを壁に立てかけ、母さんは水がめを頭にのせて戸口へ、子どもは駆けて家へ。屋根のかまどから煙。右に章扉の題字
// 動き: 太陽が沈む / 窓の灯が順に点く / 煙がのぼる / 人が家へ歩く / f4-20 題字
const Hm020: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const sun = easeInOut(seg(f, 0, 40));
  const sunY = lerp(300, 470, sun);
  const HOUSES = [[40, 440, 230, 330], [300, 480, 210, 290], [540, 420, 260, 350], [830, 500, 180, 270]] as const;
  const winLit = (k: number) => seg(f, 10 + k * 6, 16 + k * 6);
  const walk = easeOut(seg(f, 0, 38));
  const runC = easeOut(seg(f, 6, 34));
  return (
    <Frame f={f} seed={5020} bg={C.duskTop}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={1} title="7日に1度の、休み。" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <linearGradient id="hmab20sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} /><stop offset="0.55" stopColor={C.duskMid} /><stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
      </defs>
      <rect x={-60} y={-60} width={2040} height={700} fill="url(#hmab20sky)" />
      {[[200, 80], [520, 140], [880, 60], [1700, 110]].map(([sx2, sy2], i) => <circle key={i} cx={sx2} cy={sy2} r={4} fill={KRP.white} opacity={seg(f, 14 + i * 5, 24 + i * 5) * (0.6 + 0.4 * Math.sin(f / 5 + i))} />)}
      {/* 夕日 */}
      <circle cx={1440} cy={sunY} r={120} fill={KRP.orange} opacity={0.35} />
      <circle cx={1440} cy={sunY} r={80} fill="#F6A85A" stroke={KRP.ink} strokeWidth={5} />
      {/* 遠くの丘 */}
      <path d="M -60 520 Q 300 400 640 480 T 1300 450 T 1980 470 L 1980 700 L -60 700 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -60 600 Q 500 520 1000 590 T 1980 560 L 1980 720 L -60 720 Z" fill={C.hillNear} stroke={KRP.ink} strokeWidth={5} />
      {/* 丘の上のオリーブ (遠景) */}
      {[1120, 1220, 1650, 1790].map((ox, i) => (
        <g key={ox}><rect x={ox - 5} y={445 + (i % 2) * 20} width={10} height={40} fill="#6A4E3A" />
          <ellipse cx={ox} cy={440 + (i % 2) * 20} rx={34} ry={24} fill={C.oliveDark} stroke={KRP.ink} strokeWidth={4} /></g>
      ))}
      {/* 石畳 */}
      <rect x={-60} y={700} width={2040} height={440} fill={C.stone} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 16 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-40 + c * 130 + (r % 2) * 60} y={712 + r * 76} width={116} height={64} rx={20}
          fill={rnd(5020, r * 16 + c) > 0.5 ? C.stone : "#C6B8A2"} stroke={C.stoneDark} strokeWidth={4} />
      )))}
      {/* 家々 */}
      {HOUSES.map(([hx, hy, hw, hh], k) => (
        <g key={k}>
          <rect x={hx} y={hy} width={hw} height={hh} fill={C.adobe} stroke={KRP.ink} strokeWidth={7} />
          <rect x={hx - 10} y={hy - 18} width={hw + 20} height={22} fill={C.adobeDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 4 }, (_, j) => <line key={j} x1={hx + 10} y1={hy + 40 + j * 60} x2={hx + hw - 10} y2={hy + 46 + j * 60} stroke={C.adobeLine} strokeWidth={4} />)}
          {/* 戸口 */}
          <path d={`M ${hx + hw / 2 - 40} ${hy + hh} L ${hx + hw / 2 - 40} ${hy + hh - 150} Q ${hx + hw / 2} ${hy + hh - 190} ${hx + hw / 2 + 40} ${hy + hh - 150} L ${hx + hw / 2 + 40} ${hy + hh} Z`}
            fill={winLit(k) > 0.5 ? "#8A5A2A" : "#4A3424"} stroke={KRP.ink} strokeWidth={5} />
          {/* 窓 (灯がともる) */}
          <rect x={hx + 24} y={hy + 50} width={50} height={46} rx={6} fill={winLit(k) > 0 ? C.windowLit : "#4A3424"} stroke={KRP.ink} strokeWidth={5} />
          {winLit(k) > 0 && <circle cx={hx + 49} cy={hy + 73} r={60} fill={C.windowLit} opacity={0.25 * winLit(k) * (0.8 + 0.2 * Math.sin(f / 3 + k))} />}
          {/* 屋根のかまどと煙 */}
          {k % 2 === 0 && (
            <g>
              <path d={`M ${hx + hw - 70} ${hy - 18} L ${hx + hw - 64} ${hy - 60} L ${hx + hw - 26} ${hy - 60} L ${hx + hw - 20} ${hy - 18} Z`} fill={C.adobeDark} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2].map((j) => {
                const t = ((f * 0.8 + j * 14) % 42) / 42;
                return <circle key={j} cx={hx + hw - 45 + Math.sin(t * 6 + j) * 14} cy={hy - 70 - t * 160} r={14 + t * 22} fill="#D9D2C6" opacity={(1 - t) * 0.7} />;
              })}
            </g>
          )}
        </g>
      ))}
      {/* 手前のオリーブの木 */}
      <g>
        <path d="M 1010 760 Q 1000 660 1030 600 Q 1040 560 1010 520" stroke="#6A4E3A" strokeWidth={22} fill="none" strokeLinecap="round" />
        {[[960, 470, 70], [1060, 450, 80], [1010, 400, 70], [1110, 510, 50]].map(([ox, oy, r], i) => (
          <ellipse key={i} cx={ox + Math.sin(f / 14 + i) * 3} cy={oy} rx={r} ry={r * 0.7} fill={i % 2 ? C.olive : C.oliveDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* 立てかけた道具 */}
      <line x1={250} y1={770} x2={210} y2={560} stroke="#7A5A3A" strokeWidth={12} strokeLinecap="round" />
      <path d="M 196 550 L 236 560 L 214 600 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 470 770 L 460 700 Q 490 680 520 700 L 510 770 Z" fill={C.adobeDark} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={780} cy={760} rx={44} ry={14} fill="#9A6E48" stroke={KRP.ink} strokeWidth={4} />
      <path d="M 740 760 L 750 700 L 810 700 L 820 760" fill="#C89A5E" stroke={KRP.ink} strokeWidth={4} />
      {/* 手前: 長い影・井戸・眠るやぎ・低い石垣 */}
      <ellipse cx={420} cy={812} rx={260} ry={14} fill={KRP.ink} opacity={0.12} />
      <g>
        <ellipse cx={180} cy={960} rx={120} ry={34} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 60 960 L 60 880 Q 180 850 300 880 L 300 960 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={180} cy={880} rx={120} ry={28} fill="#5E4A3A" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => <line key={k} x1={70} y1={900 + k * 22} x2={290} y2={900 + k * 22} stroke={C.stoneDark} strokeWidth={4} />)}
        <line x1={90} y1={880} x2={90} y2={780} stroke="#7A5A3A" strokeWidth={10} />
        <line x1={270} y1={880} x2={270} y2={780} stroke="#7A5A3A" strokeWidth={10} />
        <line x1={80} y1={784} x2={280} y2={784} stroke="#7A5A3A" strokeWidth={12} strokeLinecap="round" />
        <path d={`M 180 784 L 180 ${830 + Math.sin(f / 9) * 4}`} stroke={KRP.ink} strokeWidth={3} />
        <rect x={164} y={828 + Math.sin(f / 9) * 4} width={32} height={28} rx={4} fill="#9A6E48" stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g transform={`translate(560 950) scale(${1 + 0.02 * Math.sin(f / 8)} 1)`}>
        <ellipse cx={0} cy={0} rx={90} ry={44} fill={C.robeIvory} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-80} cy={-18} r={30} fill={C.robeIvory} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -96 -40 q -14 -16 -4 -24 M -66 -42 q 8 -18 18 -14" stroke={KRP.ink} strokeWidth={5} fill="none" />
        <path d="M -92 -20 q 6 4 12 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {[0, 1].map((k) => <text key={k} x={-40 + k * 26} y={-60 - k * 22 - ((f * 0.6) % 14)} fontFamily={FONT} fontWeight={900} fontSize={26 + k * 6} fill={KRP.ink} opacity={0.5}>z</text>)}
      </g>
      {/* 村人: 父 (くわを立てかけて手を止める) */}
      <Person x={310} y={800} s={0.84} f={f} phase={1} face="smile" gaze={[-4, 0]} lean={-6} />
      <HmAbRobe x={310} y={800} s={0.84} f={f} phase={1} lean={-6} color={C.robeBrown} trim={C.robeIndigo} />
      {/* 母 (水がめを頭に、戸口へ) */}
      {(() => {
        const mx = lerp(900, 680, walk);
        return (
          <g>
            <Person x={mx} y={800} s={0.8} f={f} phase={3} face="normal" gaze={[-5, 0]} />
            <HmAbRobe x={mx} y={800} s={0.8} f={f} phase={3} color={C.robeIndigo} trim={C.robeIvory} cloth={C.robeIvory} />
            <g transform={bodyT(mx, 800, 0.8, f, 3)}>
              <path d="M -40 -306 Q -50 -380 0 -384 Q 50 -380 40 -306 Z" fill="#C3783E" stroke={KRP.ink} strokeWidth={5} />
              <rect x={-20} y={-396} width={40} height={14} rx={4} fill="#A9602E" stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        );
      })()}
      {/* 子ども (駆けて家へ) */}
      {(() => {
        const kx = lerp(960, 560, runC);
        return (
          <g>
            <Person x={kx} y={810} s={0.56} f={f} phase={5} pose="run" face="joy" />
            <HmAbRobe x={kx} y={810} s={0.56} f={f} phase={5} color={C.robeIvory} trim={C.robeBrown} child />
          </g>
        );
      })()}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #21 7日に1度、休みが来る。これ、誰が決めたのでしょうか。
// 格: 並 / seed 5021
// 絵: どこ: 現代の会社のオフィスの壁カレンダー (YasumiCalendar ではなく、ふつうの壁の月めくり。曜日の見出しあり)。演出: 日曜日の列だけが赤く塗られて、そこへ「?」の札がぶら下がる。会社員が首をかしげる (face="worried")。カレンダーの日曜の列から、上へ向かって「?」の点線が伸びていき、天井の向こう (歴史の奥) へ消える。動き: 日曜の列が上から順に赤く光る / 「?」が揺れる / 首をかしげる
// どこ: 現代のオフィスの壁。天井のパネル・ブラインドの窓・パソコンの机。壁にふつうの月めくりカレンダー (上半分は山の写真、下に曜日つきの日付)
// 演出: 日曜の列だけが上から順に赤く光り、左の画びょうから「?」の札がぶら下がってゆれる。日曜の列のてっぺんから「?」まじりの点線が上へ伸びていき、天井のパネルのすき間 (歴史の奥) へ吸いこまれる。右の会社員が首をかしげる
// 動き: f4-22 日曜のマスが順に赤く / 「?」の札がゆれる / f18-40 点線が上へ伸びて天井へ消える / f10-30 首をかしげる
const Hm021: React.FC<{ f: number }> = ({ f }) => {
  const CL = 400, CT = 110, CW = 880;
  const GX = CL + 20, GY = 430, cw = 120, ch = 70;
  const red = (r: number) => easeOut(seg(f, 4 + r * 4, 8 + r * 4));
  const line = easeOut(seg(f, 18, 40));
  const colX = GX + cw / 2;
  const lineTop = lerp(GY - 40, 20, line);
  const tilt = 12 * easeInOut(seg(f, 10, 30));
  const swing = Math.sin(f / 6) * 12;
  const MX = 1560, MY = 1010, MS = 1.45;
  return (
    <Frame f={f} seed={5021} bg={C.officeWall}>
      {/* 壁と天井 */}
      <rect x={-60} y={-60} width={2040} height={1200} fill={C.officeWall} />
      <rect x={-60} y={-60} width={2040} height={130} fill={C.ceiling} />
      <g stroke={C.ceilingLine} strokeWidth={5}>{Array.from({ length: 11 }, (_, k) => <line key={k} x1={k * 200 - 60} y1={-60} x2={k * 200 - 60} y2={70} />)}</g>
      <rect x={-60} y={66} width={2040} height={10} fill={C.ceilingLine} />
      <rect x={1380} y={-10} width={300} height={40} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* 天井のパネルのすき間 (点線が吸いこまれる先) */}
      <rect x={colX - 90} y={8} width={180} height={50} fill="#3B332C" opacity={0.25 + 0.5 * line} />
      <rect x={colX - 96} y={-40} width={192} height={18} fill={C.ceiling} stroke={KRP.ink} strokeWidth={4} opacity={line} transform={`rotate(${-14 * line} ${colX - 96} -22)`} />
      {/* 左: ブラインドの窓 */}
      <rect x={40} y={150} width={280} height={520} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 14 }, (_, k) => <rect key={k} x={46} y={156 + k * 37} width={268} height={20} fill={KRP.white} opacity={0.85} stroke={KRP.gray} strokeWidth={2} />)}
      <line x1={300} y1={150} x2={300 + Math.sin(f / 10) * 6} y2={600} stroke={KRP.grayDark} strokeWidth={3} />
      {/* カレンダー */}
      <line x1={CL + CW / 2} y1={CT - 30} x2={CL + 120} y2={CT} stroke={KRP.ink} strokeWidth={4} />
      <line x1={CL + CW / 2} y1={CT - 30} x2={CL + CW - 120} y2={CT} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={CL + CW / 2} cy={CT - 30} r={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      <rect x={CL + 14} y={CT + 14} width={CW} height={700} fill={KRP.ink} opacity={0.15} />
      <rect x={CL} y={CT} width={CW} height={700} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      {/* 山の写真 */}
      <rect x={CL + 20} y={CT + 20} width={CW - 40} height={240} fill={C.calPhotoSky} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${CL + 20} ${CT + 260} L ${CL + 200} ${CT + 110} L ${CL + 320} ${CT + 190} L ${CL + 480} ${CT + 70} L ${CL + 700} ${CT + 220} L ${CL + 860} ${CT + 150} L ${CL + 860} ${CT + 260} Z`} fill={C.calMount} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${CL + 440} ${CT + 100} L ${CL + 480} ${CT + 70} L ${CL + 520} ${CT + 98} L ${CL + 495} ${CT + 92} L ${CL + 480} ${CT + 104} Z`} fill={KRP.white} />
      <circle cx={CL + 760} cy={CT + 70} r={26} fill={KRP.yellow} opacity={0.9} />
      {/* 曜日の見出し */}
      {["日", "月", "火", "水", "木", "金", "土"].map((w, i) => (
        <text key={w} x={GX + i * cw + cw / 2} y={GY - 16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
          fill={i === 0 ? HP.rest : i === 6 ? KRP.blueDeep : KRP.ink}>{w}</text>
      ))}
      {/* 日付のマス */}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
        const d = r * 7 + c - 2;
        const isSun = c === 0;
        const t = isSun ? red(r) : 0;
        return (
          <g key={`${r}-${c}`}>
            <rect x={GX + c * cw + 3} y={GY + r * ch + 3} width={cw - 6} height={ch - 6} rx={6} fill={KRP.cream} stroke={KRP.gray} strokeWidth={2} />
            {t > 0 && <rect x={GX + c * cw + 3} y={GY + r * ch + 3} width={cw - 6} height={ch - 6} rx={6} fill={HP.restSoft} stroke={HP.rest} strokeWidth={5} opacity={t} />}
            {t > 0 && t < 1 && <rect x={GX + c * cw - 6} y={GY + r * ch - 6} width={cw + 12} height={ch + 12} rx={10} fill={HP.spark} opacity={0.4 * (1 - t)} />}
            {d >= 1 && d <= 30 && (
              <text x={GX + c * cw + cw / 2} y={GY + r * ch + 46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30}
                fill={isSun ? HP.rest : c === 6 ? KRP.blueDeep : KRP.ink}>{d}</text>
            )}
          </g>
        );
      }))}
      {/* 日曜の列から上へ伸びる点線と小さな「?」 */}
      {line > 0 && (
        <g>
          <line x1={colX} y1={GY - 40} x2={colX} y2={lineTop} stroke={HP.rest} strokeWidth={7} strokeDasharray="4 16" strokeLinecap="round" />
          {[0, 1, 2].map((k) => {
            const yy = lerp(GY - 80, 40, clamp01(line * 1.3 - k * 0.25));
            const op = clamp01(line * 1.3 - k * 0.25) > 0 ? clamp01((yy - 40) / 60) : 0;
            return <text key={k} x={colX + (k % 2 ? 40 : -40)} y={yy} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
              fill={HP.rest} opacity={op}>?</text>;
          })}
        </g>
      )}
      {/* 画びょうからぶら下がる「?」の札 */}
      <circle cx={CL - 40} cy={GY - 30} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`rotate(${swing} ${CL - 40} ${GY - 30})`}>
        <line x1={CL - 40} y1={GY - 30} x2={CL - 40} y2={GY + 40} stroke={KRP.ink} strokeWidth={4} />
        <rect x={CL - 90} y={GY + 40} width={100} height={110} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <text x={CL - 40} y={GY + 122} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={HP.rest}>?</text>
      </g>
      {/* 手前の机とパソコン (下の帯にかかる所は机だけ) */}
      <rect x={-60} y={850} width={1200} height={40} fill="#C9B48E" stroke={KRP.ink} strokeWidth={6} />
      <rect x={120} y={690} width={300} height={170} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={136} y={704} width={268} height={140} fill={KRP.blueSoft} />
      <rect x={240} y={850} width={70} height={10} fill={KRP.ink} />
      <rect x={600} y={780} width={70} height={74} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 670 795 q 24 0 24 18 q 0 18 -24 18" stroke={KRP.ink} strokeWidth={5} fill="none" />
      {/* 会社員 (首をかしげる) */}
      <Person x={MX} y={MY} s={MS} f={f} phase={2} face="worried" gaze={[-6, -4]} pose="armsFolded" lean={-tilt * 0.6}
        cloth={C.shirt} clothDark={C.slacks} />
      <g transform={bodyT(MX, MY, MS, f, 2, -tilt * 0.6)}>
        <path d="M -9 -160 L 9 -160 L 6 -140 L -6 -140 Z" fill={C.tie} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 頭の上の小さな「?」 */}
      <QMark x={MX + 40} y={MY - 380 * MS + 40} s={0.7} f={f} t={seg(f, 20, 28)} color={KRP.grayDark} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #22 記録でたどれる、いちばん古い決まりは、約2500年前です。
// 格: 図 / seed 5022
// 絵: どこ: 発掘現場の土壁の断面 (地層) と、はしご・スコップ・刷毛。演出: 地層の深いところから、古い文書の断片 (茶色い羊皮紙・パピルスの切れはし。文字は読めない模様) が刷毛で掘り出される。地層の横に年代の物差し札「約2500年前」。土ぼこりが舞う。動き: 刷毛が往復 (ゆっくり) / 断片が少しずつ現れる / ほこり
// どこ: 発掘現場の土壁の断面 (6色の地層・石・土器のかけら・根っこ)。上に草と空、調査の糸と杭。右にはしご、上にスコップ。左に年代の物差し
// 演出: 深い地層の中から、古い文書の断片 (茶色い羊皮紙・読めない模様) が、手袋の手の刷毛で少しずつ掘り出される。物差しの深い所から「約2500年前」の札が矢印で断片を指す
// 動き: 刷毛がゆっくり往復 (12コマに1回) / 断片が左から右へ現れる / 土ぼこりと土くれがこぼれる / カメラが少し下へ
const Hm022: React.FC<{ f: number }> = ({ f }) => {
  const rev = easeInOut(seg(f, 2, 40));
  const FX = 640, FY = 470, FW = 600, FH = 300;
  const brushX = FX + 80 + rev * (FW - 120) + Math.sin(f / 12 * Math.PI) * 50;
  const brushY = FY + 150 + Math.cos(f / 12 * Math.PI) * 16;
  const camY = -20 * easeInOut(seg(f, 0, 42));
  const LAY = [C.soil4, C.soil2, C.soil6, C.soil1, C.soil3, C.soil5];
  return (
    <Frame f={f} seed={5022} bg={C.soil1}>
      <defs>
        <clipPath id="hmab22rev"><rect x={FX - 20} y={FY - 40} width={(FW + 40) * rev} height={FH + 80} /></clipPath>
      </defs>
      <g transform={`translate(0 ${camY})`}>
        {/* 空と草 */}
        <rect x={-60} y={-60} width={2040} height={160} fill={C.sky} />
        <rect x={-60} y={70} width={2040} height={40} fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, k) => <path key={k} d={`M ${k * 50} 74 l 8 -22 l 6 22`} fill={C.grass} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 地層 */}
        {LAY.map((col, i) => {
          const y0 = 110 + i * 170;
          return <path key={i} d={`M -60 ${y0} Q 400 ${y0 + (i % 2 ? 24 : -20)} 960 ${y0 + 6} T 1980 ${y0 - 10} L 1980 1200 L -60 1200 Z`} fill={col} stroke={KRP.ink} strokeWidth={5} />;
        })}
        {/* 石・土器のかけら・根っこ */}
        {Array.from({ length: 34 }, (_, k) => {
          const x = rnd(5022, k) * 1900, y = 140 + rnd(5023, k) * 900;
          if (x > FX - 60 && x < FX + FW + 60 && y > FY - 60 && y < FY + FH + 60) return null;
          return <ellipse key={k} cx={x} cy={y} rx={10 + rnd(5024, k) * 20} ry={7 + rnd(5025, k) * 12} fill={k % 3 ? C.stone : C.stoneDark} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <path d="M 1400 310 L 1470 300 L 1460 350 L 1390 345 Z" fill="#C3783E" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1500 640 L 1560 630 L 1570 670 Z" fill="#A9602E" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 420 110 q 10 60 -20 110 q -20 40 0 90 M 400 220 q 30 20 50 60" stroke="#5E4026" strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* 調査の糸と杭 */}
        {[260, 960, 1660].map((px) => <rect key={px} x={px - 7} y={60} width={14} height={60} fill="#C9A97A" stroke={KRP.ink} strokeWidth={3} />)}
        <path d="M 260 80 Q 610 92 960 80 Q 1310 92 1660 80" stroke={KRP.white} strokeWidth={3} fill="none" />
        {[300, 560].map((gy) => <line key={gy} x1={-60} y1={gy} x2={1980} y2={gy + 6} stroke={KRP.white} strokeWidth={2.5} strokeDasharray="14 10" opacity={0.6} />)}
        {/* 年代の物差し (左) */}
        <rect x={110} y={120} width={60} height={760} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, k) => <rect key={k} x={110} y={120 + k * 47.5} width={60} height={47.5} fill={k % 2 ? HP.rest : KRP.white} stroke={KRP.ink} strokeWidth={2} opacity={0.9} />)}
        {/* 掘り出し中の穴のふち */}
        <rect x={FX - 40} y={FY - 40} width={FW + 80} height={FH + 80} rx={30} fill={C.soil5} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        {/* 文書の断片 */}
        <g clipPath="url(#hmab22rev)">
          <path d={`M ${FX} ${FY + 20} L ${FX + 120} ${FY} L ${FX + 260} ${FY + 18} L ${FX + 420} ${FY - 6} L ${FX + FW} ${FY + 30} L ${FX + FW - 20} ${FY + 160} L ${FX + FW + 10} ${FY + FH - 20} L ${FX + 380} ${FY + FH} L ${FX + 200} ${FY + FH - 16} L ${FX + 20} ${FY + FH + 4} L ${FX + 30} ${FY + 150} Z`}
            fill={C.parch} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${FX + 30} ${FY + 150} L ${FX + 120} ${FY + 140} L ${FX + 60} ${FY + 200}`} stroke={C.parchDark} strokeWidth={5} fill="none" />
          {/* 読めない文字の模様 */}
          {Array.from({ length: 6 }, (_, r) => Array.from({ length: 14 }, (_, c) => (
            rnd(5026, r * 14 + c) > 0.2 && <path key={`${r}-${c}`} d={`M ${FX + 60 + c * 36} ${FY + 54 + r * 38} l 8 -10 l 6 14 l 10 -12`}
              stroke="#5E4026" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
          )))}
          <circle cx={FX + 480} cy={FY + 220} r={30} fill={C.parchDark} opacity={0.5} />
        </g>
        {/* まだ土をかぶっている部分 */}
        <rect x={FX - 20 + (FW + 40) * rev} y={FY - 40} width={(FW + 40) * (1 - rev) + 4} height={FH + 80} fill={C.soil3} opacity={0.9} />
        {/* 土ぼこりと土くれ */}
        {Array.from({ length: 9 }, (_, k) => {
          const t = ((f * 1.3 + k * 9) % 30) / 30;
          return <circle key={k} cx={brushX - 30 + k * 12 + t * 60 * (k % 2 ? 1 : -1)} cy={brushY - 20 - t * 120} r={8 + t * 14} fill="#D9C6A6" opacity={(1 - t) * 0.6} />;
        })}
        {[0, 1, 2].map((k) => {
          const t = ((f + k * 11) % 24) / 24;
          return <circle key={k} cx={brushX + 20 + k * 10} cy={brushY + 40 + t * 260} r={7} fill={C.soil5} stroke={KRP.ink} strokeWidth={2} />;
        })}
        {/* 手袋の手と刷毛 */}
        <g transform={`translate(${brushX} ${brushY}) rotate(${28 + Math.sin(f / 12 * Math.PI) * 8})`}>
          {/* 袖 (画面の右上の外から伸びてくる腕) */}
          <rect x={-34} y={-640} width={68} height={470} rx={20} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-40} y={-200} width={80} height={30} rx={10} fill="#3A5F96" stroke={KRP.ink} strokeWidth={5} />
          {/* 刷毛の柄と毛 */}
          <rect x={-10} y={-150} width={20} height={130} rx={8} fill="#A06A3C" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-34} y={-24} width={68} height={30} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -34 6 L 34 6 L 38 40 L -38 40 Z" fill="#E9DFC6" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, k) => <line key={k} x1={-30 + k * 10} y1={12} x2={-33 + k * 11} y2={38} stroke="#C9A97A" strokeWidth={3} />)}
          {/* 軍手の手 (柄をにぎる) */}
          <rect x={-36} y={-176} width={72} height={64} rx={24} fill={C.glove} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={-44} y={-168 + k * 14} width={30} height={16} rx={8} fill={C.glove} stroke={KRP.ink} strokeWidth={4} />)}
          <path d="M 30 -160 Q 48 -150 40 -126" fill={C.glove} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* はしごとスコップ */}
        <g>
          {[1640, 1760].map((lx) => <line key={lx} x1={lx} y1={20} x2={lx + 60} y2={900} stroke="#9A6E48" strokeWidth={18} strokeLinecap="round" />)}
          {Array.from({ length: 9 }, (_, k) => <line key={k} x1={1644 + k * 6.5} y1={100 + k * 90} x2={1764 + k * 6.5} y2={100 + k * 90} stroke="#7A5A3A" strokeWidth={12} />)}
        </g>
        <g transform={`rotate(${12 + Math.sin(f / 15) * 1} 1300 80)`}>
          <rect x={1292} y={-80} width={16} height={150} fill="#A06A3C" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1270 70 L 1330 70 L 1322 150 Q 1300 170 1278 150 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 年代の札と矢印 (深い所) */}
        <TagPlate x={380} y={620} text="約2500年前" size={40} t={seg(f, 6, 14)} />
        <Arrow x={630} y={620} s={0.8} t={seg(f, 10, 18)} color={HP.rest} />
        <line x1={170} y1={620} x2={240} y2={620} stroke={KRP.ink} strokeWidth={6} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #23 古代のユダヤの人々は、7日目を「安息日」として、働かずに休んでいました。
// 格: 山 / seed 5023
// 絵: どこ: 古代の村の家の中 (土の壁・ランプ・敷物・机にパンとぶどう酒)。外は夕暮れ。演出: 7つのコマを並べた暦の板 (6つは仕事の道具の絵: 鋤・桶・かご・のこぎり…、7つ目だけ灯のついたランプ) の7つ目が光る。家族 (3〜4人) が仕事道具を壁に立てかけて、敷物に座って穏やかに過ごす。札「安息日」。動き: 7つ目のコマが光る / ランプの炎のゆらぎ / 子どもがパンを分ける
// どこ: 古代の村の家の中。土れんがの壁・左に夕暮れの窓・右に開いた戸口 (外は夕焼け)。壁の上に7つのコマの暦の板、床に赤い敷物、低い机にパンとぶどう酒の壺
// 演出: 暦の板の6コマは仕事の道具 (鋤・桶・かご・のこぎり・金づち・鎌)、7つ目だけ灯のついたランプ。その7つ目がぱっと光り「安息日」の札。戸口のわきには仕事道具が立てかけられ、家族4人が敷物の上の座布団に座ってくつろぐ。上の子がパンを半分に割って、下の子に手渡す
// 動き: f6-18 7つ目のコマが光る / ランプの炎のゆらぎ / f16-36 パンが上の子から下の子へ渡る / 窓の外の夕日が沈む / カメラが少し寄る
const Hm023: React.FC<{ f: number }> = ({ f }) => {
  const light = easeOut(seg(f, 6, 18));
  const pass = easeInOut(seg(f, 16, 36));
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const flick = 1 + 0.08 * Math.sin(f / 2.3) + 0.05 * Math.sin(f * 1.3);
  const PX0 = 470, PW = 130, PG = 10, PT = 70, PH = 170;
  const pcx = (i: number) => PX0 + PG + i * (PW + PG) + PW / 2;
  const flame = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s * flick} ${s * (2 - flick)})`}>
      <circle r={40} fill={C.lampFire} opacity={0.25} />
      <path d="M 0 -30 Q 14 -8 8 6 Q 0 14 -8 6 Q -14 -8 0 -30 Z" fill={C.lampFire} stroke={KRP.ink} strokeWidth={3} />
      <path d="M 0 -14 Q 5 -2 2 4 Q 0 6 -2 4 Q -5 -2 0 -14 Z" fill={KRP.yellow} />
    </g>
  );
  const clayLamp = (x: number, y: number, s: number) => (
    <g>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M -40 0 Q -40 -22 0 -24 Q 30 -24 52 -12 L 60 -14 L 54 0 Q 30 14 0 14 Q -40 14 -40 0 Z" fill="#C3783E" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-6} cy={-12} r={6} fill="#6E4526" />
      </g>
      {flame(x + 56 * s, y - 24 * s, s)}
    </g>
  );
  const icon = (i: number) => {
    const st = { stroke: KRP.ink, strokeWidth: 4 } as const;
    switch (i) {
      case 0: return <g><line x1={-34} y1={-40} x2={20} y2={30} stroke="#7A5A3A" strokeWidth={9} strokeLinecap="round" /><path d="M 10 20 L 40 30 L 30 52 L 6 40 Z" fill={KRP.silver} {...st} /></g>;
      case 1: return <g><path d="M -30 -20 L 30 -20 L 24 40 L -24 40 Z" fill="#A9773C" {...st} /><path d="M -30 -20 Q 0 -60 30 -20" fill="none" {...st} />{[0, 1].map((k) => <line key={k} x1={-28} y1={k * 30} x2={28} y2={k * 30} stroke={KRP.ink} strokeWidth={3} />)}</g>;
      case 2: return <g><path d="M -38 -10 L 38 -10 L 28 40 L -28 40 Z" fill="#D9B77A" {...st} />{[0, 1, 2].map((k) => <line key={k} x1={-34} y1={4 + k * 12} x2={34} y2={4 + k * 12} stroke={KRP.ink} strokeWidth={2.5} />)}<path d="M -26 -10 Q 0 -46 26 -10" fill="none" stroke={KRP.ink} strokeWidth={5} /></g>;
      case 3: return <g><path d="M -44 -6 L 30 -6 L 30 16 L -44 26 Z" fill={KRP.silver} {...st} /><rect x={30} y={-14} width={20} height={36} rx={6} fill="#A06A3C" {...st} /></g>;
      case 4: return <g><rect x={-6} y={-30} width={12} height={70} rx={4} fill="#A06A3C" {...st} /><rect x={-30} y={-44} width={60} height={24} rx={5} fill={KRP.grayDark} {...st} /></g>;
      case 5: return <g><path d="M -20 -40 Q 40 -40 30 10 Q 20 -20 -14 -24 Z" fill={KRP.silver} {...st} /><rect x={-28} y={-28} width={12} height={66} rx={5} fill="#A06A3C" {...st} transform="rotate(-20 -22 0)" /></g>;
      default: return <g>{clayLamp(-14, 26, 1)}</g>;
    }
  };
  // 家族の位置 (足元・座布団の上)
  const FAM = [
    { x: 600, s: 0.92, robe: C.robeBrown, trim: C.robeIndigo, cl: C.headCloth, face: "smile" as const, gz: [5, 2] as [number, number] },
    { x: 770, s: 0.86, robe: C.robeIndigo, trim: C.robeIvory, cl: C.robeIvory, face: "smile" as const, gz: [8, 2] as [number, number] },
  ];
  const K1 = { x: 1150, s: 0.62 }, K2 = { x: 1310, s: 0.56 };
  const FY = 832;
  const h1: [number, number] = [K1.x + 14 * K1.s, FY - 118 * K1.s];
  const h2: [number, number] = [K2.x - 14 * K2.s, FY - 118 * K2.s];
  const bx = lerp(h1[0], h2[0], pass), by = lerp(h1[1], h2[1], pass) - Math.sin(pass * Math.PI) * 50;
  const cushion = (x: number, s: number, col: string, k: number) => (
    <rect key={k} x={x - 80 * s} y={FY - 64 * s} width={160 * s} height={64 * s + 6} rx={22 * s} fill={col} stroke={KRP.ink} strokeWidth={5} />
  );
  const sunY = lerp(330, 430, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={5023} bg={C.adobe}>
      <defs>
        <linearGradient id="hmab23sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} /><stop offset="0.6" stopColor={C.duskMid} /><stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <radialGradient id="hmab23warm"><stop offset="0" stopColor={C.lampFire} stopOpacity={0.3} /><stop offset="1" stopColor={C.lampFire} stopOpacity={0} /></radialGradient>
      </defs>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        {/* 土れんがの壁 */}
        <rect x={-60} y={-60} width={2040} height={880} fill={C.adobe} />
        {Array.from({ length: 12 }, (_, r) => Array.from({ length: 14 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-40 + c * 150 + (r % 2) * 75} y={-40 + r * 70} width={140} height={60} rx={8}
            fill="none" stroke={C.adobeLine} strokeWidth={4} opacity={0.7} />
        )))}
        {/* 天井の梁 */}
        <rect x={-60} y={-60} width={2040} height={70} fill="#7A5A3A" stroke={KRP.ink} strokeWidth={6} />
        {[200, 700, 1200, 1700].map((bx2) => <rect key={bx2} x={bx2} y={-60} width={50} height={90} fill="#6A4E3A" stroke={KRP.ink} strokeWidth={5} />)}
        {/* 左: 窓 (夕暮れ) */}
        <rect x={80} y={260} width={260} height={260} rx={10} fill="url(#hmab23sky)" stroke={KRP.ink} strokeWidth={8} />
        <circle cx={250} cy={sunY} r={46} fill="#F6A85A" />
        <path d="M 80 470 Q 160 420 240 460 T 340 450 L 340 520 L 80 520 Z" fill={C.hill} />
        <rect x={80} y={260} width={260} height={260} rx={10} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <line x1={210} y1={260} x2={210} y2={520} stroke="#6A4E3A" strokeWidth={10} />
        <rect x={60} y={512} width={300} height={24} rx={4} fill={C.adobeDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 右: 開いた戸口 */}
        <path d="M 1610 790 L 1610 400 Q 1720 320 1830 400 L 1830 790 Z" fill="url(#hmab23sky)" stroke={KRP.ink} strokeWidth={8} />
        <path d="M 1610 680 Q 1700 640 1830 670 L 1830 790 L 1610 790 Z" fill={C.stone} />
        <path d="M 1830 400 L 1900 380 L 1900 800 L 1830 790 Z" fill="#7A5A3A" stroke={KRP.ink} strokeWidth={6} />
        {/* 立てかけた仕事道具 (くわ・のこぎり・かご・桶) */}
        <line x1={1440} y1={790} x2={1400} y2={520} stroke="#7A5A3A" strokeWidth={14} strokeLinecap="round" />
        <path d="M 1384 508 L 1424 520 L 1404 566 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <g transform="rotate(-8 1500 700)">
          <path d="M 1470 790 L 1480 600 L 1520 600 L 1534 790 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1474} y={560} width={50} height={46} rx={8} fill="#A06A3C" stroke={KRP.ink} strokeWidth={5} />
        </g>
        <path d="M 1530 790 L 1540 720 L 1610 720 L 1600 790 Z" fill="#D9B77A" stroke={KRP.ink} strokeWidth={5} />
        {[0, 1].map((k) => <line key={k} x1={1538} y1={740 + k * 22} x2={1604} y2={740 + k * 22} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 7つのコマの暦の板 */}
        <rect x={PX0 - 16} y={PT - 16} width={7 * (PW + PG) + PG + 32} height={PH + 32} rx={12} fill="#8E6234" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => {
          const L = PX0 + PG + i * (PW + PG);
          const is7 = i === 6;
          return (
            <g key={i}>
              <rect x={L} y={PT} width={PW} height={PH} rx={8} fill={is7 ? (light > 0 ? C.windowLit : C.robeIvory) : C.robeIvory} stroke={KRP.ink} strokeWidth={5}
                opacity={is7 ? 1 : 1 - 0.25 * light} />
              {[0, 1, 2, 3, 4, 5, 6].slice(0, i + 1).map((d) => <circle key={d} cx={L + 14 + d * 17} cy={PT + 18} r={5} fill={KRP.ink} opacity={0.6} />)}
              <g transform={`translate(${L + PW / 2} ${PT + PH / 2 + 14})`} opacity={is7 ? 1 : 1 - 0.3 * light}>{icon(i)}</g>
            </g>
          );
        })}
        {light > 0 && (
          <g>
            <rect x={pcx(6) - PW / 2 - 10} y={PT - 10} width={PW + 20} height={PH + 20} rx={14} fill="none" stroke={HP.spark} strokeWidth={10} opacity={light} />
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k * 60 + 30) * Math.PI / 180;
              return <line key={k} x1={pcx(6) + Math.cos(a) * 100} y1={PT + PH / 2 + Math.sin(a) * 110} x2={pcx(6) + Math.cos(a) * (130 + 20 * light)} y2={PT + PH / 2 + Math.sin(a) * (140 + 20 * light)}
                stroke={HP.spark} strokeWidth={7} strokeLinecap="round" opacity={light} />;
            })}
          </g>
        )}
        <TagPlate x={pcx(6)} y={318} text="安息日" size={38} t={seg(f, 14, 22)} color={HP.hiDark} />
        {/* 壁のくぼみのランプ */}
        <path d="M 900 470 L 900 400 Q 960 350 1020 400 L 1020 470 Z" fill={C.adobeDark} stroke={KRP.ink} strokeWidth={5} />
        {clayLamp(944, 462, 0.8)}
        <circle cx={960} cy={420} r={220} fill="url(#hmab23warm)" />
        {/* 床と敷物 */}
        <rect x={-60} y={790} width={2040} height={400} fill={C.adobeDark} />
        <rect x={-60} y={782} width={2040} height={16} fill="#9A7A56" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 440 820 L 1480 820 L 1560 1080 L 360 1080 Z" fill={C.rug} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 470 840 L 1450 840 L 1520 1060 L 400 1060 Z" fill="none" stroke={C.rugPattern} strokeWidth={8} strokeDasharray="30 14" />
        {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M ${560 + k * 160} 900 l 30 30 l -30 30 l -30 -30 Z`} fill={C.rugPattern} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 低い机 (パン・ぶどう酒の壺・杯) */}
        <rect x={870} y={720} width={200} height={20} rx={4} fill="#8E6234" stroke={KRP.ink} strokeWidth={5} />
        {[884, 1040].map((lx) => <rect key={lx} x={lx} y={740} width={16} height={78} fill="#6E4526" stroke={KRP.ink} strokeWidth={4} />)}
        <ellipse cx={920} cy={708} rx={42} ry={18} fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 892 704 q 10 -8 20 0 M 916 702 q 10 -8 20 0" stroke={C.breadDark} strokeWidth={3} fill="none" />
        <path d="M 990 720 Q 972 690 990 660 L 986 646 L 1014 646 L 1010 660 Q 1028 690 1010 720 Z" fill={C.wine} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1034 720 L 1040 700 L 1062 700 L 1066 720 Z" fill="#C3783E" stroke={KRP.ink} strokeWidth={4} />
        {/* 家族 */}
        {cushion(FAM[0].x, FAM[0].s, "#6E9A5E", 0)}
        {cushion(FAM[1].x, FAM[1].s, "#E0B84A", 1)}
        {cushion(K1.x, K1.s, "#6E9A5E", 2)}
        {cushion(K2.x, K2.s, "#E0B84A", 3)}
        {FAM.map((m, i) => (
          <g key={i}>
            <Person x={m.x} y={FY} s={m.s} f={f} phase={i + 1} pose="sit" face={m.face} gaze={m.gz} />
            <HmAbRobe x={m.x} y={FY} s={m.s} f={f} phase={i + 1} color={m.robe} trim={m.trim} cloth={m.cl} sit />
          </g>
        ))}
        <Person x={K1.x} y={FY} s={K1.s} f={f} phase={4} pose="hold" face="smile" gaze={[6, 2]} />
        <HmAbRobe x={K1.x} y={FY} s={K1.s} f={f} phase={4} color={C.robeIvory} trim={C.robeBrown} sit child />
        <Person x={K2.x} y={FY} s={K2.s} f={f} phase={6} pose="hold" face={pass > 0.8 ? "joy" : "surprised"} gaze={[-6, 2]} />
        <HmAbRobe x={K2.x} y={FY} s={K2.s} f={f} phase={6} color="#C96A4A" trim={C.robeIvory} sit child />
        {/* 割ったパン: 半分は上の子の手に、半分が下の子へ */}
        <ellipse cx={h1[0] - 10} cy={h1[1] - 8} rx={22} ry={13} fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`translate(${bx} ${by - 8}) rotate(${pass * 30})`}>
          <ellipse cx={0} cy={0} rx={22} ry={13} fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-14} cy={0} rx={6} ry={10} fill="#F2D9A8" />
        </g>
        {pass > 0 && pass < 1 && [0, 1, 2].map((k) => <circle key={k} cx={bx - 30 - k * 14} cy={by + 4 + k * 6} r={3} fill={C.breadDark} />)}
        {/* 部屋全体の灯のあたたかさ */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.lampFire} opacity={0.05 + 0.02 * Math.sin(f / 3)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_012: (f) => <Hm012 f={f} />,
  hm_013: (f) => <Hm013 f={f} />,
  hm_014: (f) => <Hm014 f={f} />,
  hm_015: (f) => <Hm015 f={f} />,
  hm_016: (f) => <Hm016 f={f} />,
  hm_017: (f) => <Hm017 f={f} />,
  hm_018: (f) => <Hm018 f={f} />,
  hm_019: (f) => <Hm019 f={f} />,
  hm_020: (f) => <Hm020 f={f} />,
  hm_021: (f) => <Hm021 f={f} />,
  hm_022: (f) => <Hm022 f={f} />,
  hm_023: (f) => <Hm023 f={f} />,
};

export const HM_AB_MOTIFS: string[] = [
  "hm_012", // #12
  "hm_013", // #13
  "hm_014", // #14
  "hm_015", // #15
  "hm_016", // #16
  "hm_017", // #17
  "hm_018", // #18
  "hm_019", // #19
  "hm_020", // #20
  "hm_021", // #21
  "hm_022", // #22
  "hm_023", // #23
];

export const himaAbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
