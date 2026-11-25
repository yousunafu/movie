// 人は、なぜ暇をつぶすのか: 文#1〜#11 (11文)
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
  desk: "#B9874F",
  deskDark: "#9E6F3E",
  dusk: "#E9967A",
  duskHigh: "#9C7FA8",
  tile: "#E9EEF0",
  tileLine: "#C9D2D6",
  blanket: "#C9B8D8",
  blanketLine: "#B4A2C6",
  hallWall: "#D6D1C2",
  hallFloor: "#A9A496",
  corridor: "#8E8A7E",
  box: "#C99A5E",
  boxDark: "#A27840",
  coat: "#F4F6F4",
  hairBrown: "#7A5236",
  hairGray: "#6B6258",
  classWall: "#EADFC8",
  board: "#7FA36A",
  paperLine: "#C9D2D6",
  asphalt: "#6B6F78",
  asphaltDark: "#5B5F68",
  sidewalk: "#C9C2B4",
  sidewalkLine: "#B4AC9C",
  tree: "#5E9A5A",
  poster: "#FBF8EE",
  trainFace: "#D9DDE3",
  trainFaceDark: "#B9C3CF",
  menBlue: "#4F7DB8",
  menBlueDark: "#3A5F8E",
  menNavy: "#3E4B66",
  menNavyDark: "#2E3850",
  pink: "#F2A2B8",
  pinkDark: "#D97A96",
  skirt: "#E0708F",
  skirtDark: "#B9566F",
  ribbon: "#E0413A",
  hairBrownDark: "#5E3D26",
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

// カメラ: (cx,cy) を画面の中心に持ってきて sc 倍
const cam = (sc: number, cx: number, cy: number) => `translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`;

// ビリッの画面の揺れ: 押した瞬間 P から dur コマ、amp px から 0 へ減りながら小刻みに揺れる
const shakeAt = (f: number, P: number, amp0: number, dur = 8): [number, number] => {
  const hit = (f - P) / dur;
  const amp = hit >= 0 && hit < 1 ? amp0 * (1 - hit) : 0;
  return [amp * Math.sin(f * 2.7), amp * Math.cos(f * 3.3)];
};

// 腕1本 (肩→ひじ→手)。Person の腕と同じ太さ・同じ服の色で、自分で好きな向きに曲げる
const HmAArm: React.FC<{
  pts: [number, number][]; s: number; cloth: string; hand?: boolean; opacity?: number;
}> = ({ pts, s, cloth, hand = true, opacity = 1 }) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const [hx, hy] = pts[pts.length - 1];
  return (
    <g opacity={opacity}>
      <path d={d} stroke={KRP.ink} strokeWidth={31 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={cloth} strokeWidth={22 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {hand && <circle cx={hx} cy={hy} r={10 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
    </g>
  );
};

// 右腕 (画面の右側の腕) だけを隠した Person。腕は HmAArm で自分で描く。lean は使えない (still で描く)
const HmANoRArm: React.FC<{ id: string; x: number; y: number; s: number; children: React.ReactNode }> = ({ id, x, y, s, children }) => (
  <g>
    <defs>
      <clipPath id={id}>
        <rect x={x - 400 * s} y={y - 400 * s} width={(400 + 57) * s} height={600 * s} />
        <rect x={x + 57 * s} y={y - 400 * s} width={400 * s} height={(400 - 160) * s} />
        <rect x={x + 57 * s} y={y - 60 * s} width={400 * s} height={200 * s} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>{children}</g>
  </g>
);

// 後頭部 (顔を隠す)。頭の中心と半径を渡す
const HmABackHead: React.FC<{ x: number; y: number; r: number; hair: string }> = ({ x, y, r, hair }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={hair} stroke={KRP.ink} strokeWidth={5.5} />
    <path d={`M ${x - r * 0.55} ${y - r * 0.5} q ${r * 0.5} ${-r * 0.25} ${r * 1.1} ${r * 0.1}`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.25} />
    <ellipse cx={x - r * 0.98} cy={y + r * 0.1} rx={r * 0.14} ry={r * 0.22} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    <ellipse cx={x + r * 0.98} cy={y + r * 0.1} rx={r * 0.14} ry={r * 0.22} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 白衣 (Person の服の上に重ねる裾)。足元 x,y・s
const HmACoatTail: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -62 -60 L -70 -20 L 70 -20 L 62 -60 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <line x1={0} y1={-160} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
  </g>
);

// 鳩 (塗った灰色の鳩。歩くと首が前後する)
const HmAHato: React.FC<{ x: number; y: number; s?: number; f: number; dir?: 1 | -1 }> = ({ x, y, s = 1, f, dir = -1 }) => {
  const nod = Math.sin(f / 2.2) * 8;
  const step = Math.sin(f / 2.2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * -dir} ${s})`}>
      <ellipse cx={0} cy={-8} rx={36} ry={8} fill={KRP.ink} opacity={0.15} />
      <line x1={-6} y1={-30} x2={-10 + step * 6} y2={-6} stroke="#C96A4A" strokeWidth={5} strokeLinecap="round" />
      <line x1={8} y1={-30} x2={10 - step * 6} y2={-6} stroke="#C96A4A" strokeWidth={5} strokeLinecap="round" />
      <path d="M -44 -52 Q -30 -78 10 -74 Q 40 -70 38 -46 Q 30 -26 -6 -28 Q -36 -30 -44 -52 Z" fill="#9AA0AE" stroke={KRP.ink} strokeWidth={4} />
      <path d="M -40 -50 L -66 -44 L -42 -40 Z" fill="#6E7482" stroke={KRP.ink} strokeWidth={3} />
      <path d="M -20 -60 Q 0 -66 20 -56" stroke="#6E7482" strokeWidth={5} fill="none" />
      <g transform={`translate(${nod} 0)`}>
        <path d="M 26 -66 Q 30 -84 44 -96" stroke="#7FA89A" strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={46} cy={-100} r={13} fill="#8A90A0" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={50} cy={-103} r={3} fill={KRP.ink} />
        <path d="M 58 -100 l 10 3 l -10 3 Z" fill="#E0B84A" stroke={KRP.ink} strokeWidth={2} />
      </g>
    </g>
  );
};

// 稲妻マーク (塗った黄色)
const HmABolt: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 1, rot = 0 }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <path d="M 8 -44 L -22 4 L -2 4 L -12 44 L 24 -10 L 4 -10 L 16 -44 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// スマホを両手で持つ手 (スマホの左右の縁に親指)。スマホの中心 x,y・スマホの s
const HmAThumbs: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const tap = Math.max(0, Math.sin(f / 5)) * 6 * s;
  return (
    <g>
      <ellipse cx={x - 72 * s} cy={y + 60 * s} rx={26 * s} ry={40 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={x + 72 * s} cy={y + 60 * s} rx={26 * s} ry={40 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={x + 40 * s} cy={y + 50 * s - tap} rx={14 * s} ry={22 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform={`rotate(-30 ${x + 40 * s} ${y + 50 * s})`} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #1 いまこの動画を観ているあなた。たぶん、何かを待っていますね。
// 格: 山 / seed 5001
// 絵: どこ: 夕方の駅のホーム。ベンチ・時刻表の電光掲示 (数字だけ)・自販機・柱・線路の向こうの家並み。演出: 橙のパーカーの「あなた」がベンチで Sumaho (screen="feed") を見ている。画面の光が顔を照らす。電光掲示の「5分後」の分の数字がぱたっと変わる。カメラはホーム全景から「あなた」の手元のスマホへ寄る。動き: f0-30 寄る / f20 で掲示の数字が変わる / 鳩が1羽ホームを歩く / まばたき
// どこ: EkiHome (夕方のホーム)。ベンチに「あなた」。横にリュック・紙コップ。柱に番線札。ホームを鳩が歩く
// 演出: スマホ (feed) の青い光が顔を照らす。電光掲示の「6」がぱたっとめくれて「5」に。カメラが全景から手元へ寄る
// 動き: f0-30 寄る / f18-26 掲示の板がめくれる / 鳩が首を振って歩く / まばたき・指のスクロール
const Hm001: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 30));
  const sc = lerp(1, 1.25, k), cx = lerp(960, 860, k), cy = lerp(540, 470, k);
  const flip = seg(f, 18, 26);
  const mins = flip < 0.5 ? 6 : 5;
  const px = 860, py = 748, ps = 1.05;
  const headY = py - 228 * ps;
  // 通過電車 (背中側の奥の線路を右→左)。f=45 でちょうど画面を横切っている途中
  const pass = seg(f, 28, 60);
  const wind = pass > 0 && pass < 1 ? Math.sin(pass * Math.PI) : 0;
  const flut = Math.sin(f * 1.9) * wind;
  return (
    <Frame f={f} seed={5001}>
      <defs>
        <radialGradient id="hma1glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={HP.screenCore} stopOpacity={0.75} />
          <stop offset="1" stopColor={HP.screen} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(sc, cx, cy)}>
        <EkiHome f={f} minutes={mins} pass={pass} next="つぎ 普通 さくら台行" />
        {/* 通過の風 (ホームの上を流れる白い線) */}
        {wind > 0.05 && (
          <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.75 * wind}>
            {Array.from({ length: 7 }, (_, i) => {
              const yy = 470 + i * 44;
              const x0 = 1700 - ((f * 70 + i * 260) % 1900);
              return <line key={i} x1={x0} y1={yy} x2={x0 + 140 + (i % 3) * 60} y2={yy} />;
            })}
          </g>
        )}
        {/* 掲示の数字の板がめくれる */}
        {flip > 0 && flip < 1 && (
          <g transform={`translate(244 170) scale(1 ${Math.abs(Math.cos(flip * Math.PI))}) translate(-244 -170)`}>
            <rect x={220} y={136} width={50} height={68} rx={4} fill="#3A3A42" stroke={KRP.ink} strokeWidth={3} />
            <text x={245} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#FFB347">{flip < 0.5 ? 6 : 5}</text>
          </g>
        )}
        {flip > 0 && flip < 1 && <line x1={214} y1={170} x2={276} y2={170} stroke="#FFB347" strokeWidth={3} opacity={0.7} />}
        {/* 柱の番線札 */}
        <TagPlate x={635} y={300} text="1番線" size={30} />
        {/* ベンチの上のリュックと紙コップ */}
        <g>
          <rect x={640} y={590} width={110} height={104} rx={26} fill="#5E7F6A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={656} y={630} width={78} height={44} rx={12} fill="#4E6B58" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 670 592 Q 695 560 720 592" stroke={KRP.ink} strokeWidth={6} fill="none" />
          <path d="M 1010 690 L 1004 640 L 1046 640 L 1040 690 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1002} y={632} width={46} height={10} rx={4} fill="#8E6234" stroke={KRP.ink} strokeWidth={3} />
          {[0, 1].map((i) => <path key={i} d={`M ${1018 + i * 14} 626 q ${6 - wind * 26} -12 ${-wind * 30} -22`} stroke={KRP.white} strokeWidth={3} fill="none"
            opacity={0.6} transform={`translate(0 ${-((f * 0.8 + i * 9) % 16)})`} />)}
        </g>
        {/* パーカーのフード (首の後ろ)。通過の風で左へあおられる */}
        <path d={`M ${px - 70 - wind * 18} ${py - 160 * ps - wind * 8} Q ${px - wind * 14} ${py - 205 * ps - wind * 10} ${px + 70} ${py - 160 * ps} L ${px + 60} ${py - 140 * ps} L ${px - 60} ${py - 140 * ps} Z`}
          fill={HP.youDark} stroke={KRP.ink} strokeWidth={5} />
        <Person x={px} y={py} s={ps} f={f} pose="hold" face="normal" gaze={wind > 0.3 ? [-7, -1] : [2, 7]} cloth={HP.you} clothDark={HP.youDark} hair="cap" still />
        {/* パーカーのひも (風でぱたぱた) */}
        {[-16, 16].map((dx) => <line key={dx} x1={px + dx} y1={py - 158 * ps} x2={px + dx * 1.2 - wind * 22 + flut * 8} y2={py - 118 * ps - wind * 10} stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />)}
        {/* 前髪が風であおられる (塗りのかたまりで) */}
        {wind > 0.05 && (
          <path d={`M ${px - 50} ${headY - 44} Q ${px - 74 - wind * 16} ${headY - 52 + flut * 4} ${px - 80 - wind * 22} ${headY - 30 + flut * 5} Q ${px - 70} ${headY - 18} ${px - 62} ${headY - 16} Z`}
            fill={KRP.ink} />
        )}
        <EkiBenchFront />
        {/* 画面の光が顔を照らす */}
        <ellipse cx={px} cy={headY + 20} rx={120} ry={110} fill="url(#hma1glow)" opacity={0.28 + 0.06 * Math.sin(f / 6)} />
        <Sumaho x={px + 4} y={py - 140 * ps} s={0.36} rot={-6} f={f} screen="feed" glow={0.7} />
        <HmAThumbs x={px + 4} y={py - 140 * ps} s={0.36} f={f} />
        {/* 鳩 (通過の風でよろける・羽が1枚飛ぶ) */}
        <g transform={`rotate(${-14 * wind + flut * 4} ${1240 - f * 2.2} 700) translate(${-wind * 24} 0)`}>
          <HmAHato x={1240 - f * 2.2} y={700} s={0.9} f={f} />
        </g>
        {wind > 0.05 && (
          <g transform={`translate(${1180 - f * 2.2 - (f - 28) * 9} ${640 - Math.sin((f - 28) / 3) * 16}) rotate(${f * 14})`}>
            <path d="M -16 0 Q 0 -10 16 0 Q 0 8 -16 0 Z" fill="#9AA0AE" stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {wind > 0.2 && [0, 1].map((k) => (
          <path key={k} d={`M ${1140 - f * 2.2 + k * 30} ${600 - k * 26} q 8 -10 0 -20`} stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6 * wind} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #2 電車か、お湯がわくのか、既読がつくのか。
// 格: 山 / seed 5002
// 絵: どこ: 画面を3つの窓に割った「待ち」の3連コマ (漫画のコマ割り風・太い枠)。①駅のホーム (電車がまだ来ないレール) ②台所のやかん (湯気が出かかっている) ③スマホの画面 (Sumaho screen="notify" の吹き出しに既読マークが付く前の「…」)。演出: 各コマが f で順番にぽんと出る。3コマとも「あと少し」の状態。③で「…」が点滅。動き: f0-10/10-20/20-30 でコマが順に出る / やかんの湯気がちろちろ / 電車のライトが遠くに小さく光る
// どこ: 机に置いた漫画の原稿用紙。太い枠の3コマ: ①夕方のレール ②台所のやかん ③スマホのトーク画面
// 演出: 3コマとも「あと少し」。①遠くに電車のライトが2つ ②湯気が出かかり、ふたがカタカタ ③送った吹き出しに既読がまだ、相手の「…」が点滅
// 動き: f0-10/10-20/20-30 でコマが順にぽん / ①ライト点滅・つま先トントン ②炎と湯気のちろちろ ③点が順番に光る
const HmAPanel: React.FC<{ i: number; f: number; rot: number; children: React.ReactNode }> = ({ i, f, rot, children }) => {
  const x0 = 70 + i * 600, y0 = 130, w = 570, h = 660;
  const t = pop(seg(f, i * 10, i * 10 + 10));
  if (t <= 0) return null;
  const mx = x0 + w / 2, my = y0 + h / 2;
  return (
    <g transform={`translate(${mx} ${my}) rotate(${rot}) scale(${t}) translate(${-mx} ${-my})`}>
      <defs><clipPath id={`hma2p${i}`}><rect x={x0} y={y0} width={w} height={h} /></clipPath></defs>
      <rect x={x0 + 12} y={y0 + 14} width={w} height={h} fill={KRP.ink} opacity={0.25} />
      <g clipPath={`url(#hma2p${i})`}>{children}</g>
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={12} />
    </g>
  );
};
const Hm002: React.FC<{ f: number }> = ({ f }) => {
  const blinkL = 0.5 + 0.5 * Math.sin(f / 3);
  const tap = Math.max(0, Math.sin(f / 3.5)) * 10;
  const lid = Math.sin(f * 1.6) * 2.5;
  const steamT = seg(f, 12, 40);
  const camS = lerp(1.04, 1, easeOut(seg(f, 0, 40)));
  // 3コマ目の中心
  const p3x = 70 + 1200 + 285, p3y = 470;
  return (
    <Frame f={f} seed={5002}>
      <g transform={cam(camS, 960, 500)}>
        {/* 机 (木目) と原稿用紙 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.45} fill="none">
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M -40 ${40 + i * 150} q 480 ${rnd(2, i) * 30 - 15} 1000 0 q 500 ${rnd(3, i) * 30 - 15} 1000 0`} />)}
        </g>
        <rect x={34} y={78} width={1852} height={770} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-0.6 960 460)" />
        {/* ペンとインク瓶 (机の上) */}
        <g transform="rotate(-24 1700 930)">
          <rect x={1500} y={915} width={330} height={26} rx={12} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1500 915 L 1450 928 L 1500 941 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <rect x={150} y={880} width={110} height={90} rx={16} fill="#2A2A30" stroke={KRP.ink} strokeWidth={5} />
        <rect x={175} y={858} width={60} height={26} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />

        {/* ① 夕方のレール */}
        <HmAPanel i={0} f={f} rot={-1.2}>
          <rect x={70} y={130} width={570} height={660} fill={C.dusk} />
          <rect x={70} y={130} width={570} height={200} fill={C.duskHigh} />
          <circle cx={520} cy={330} r={46} fill="#FBD57A" />
          <g fill="#6A5A7A" stroke={KRP.ink} strokeWidth={3}>
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={70 + i * 100} y={300 - (i * 37) % 60} width={80} height={90 + (i * 37) % 60} />)}
          </g>
          {/* 地面とレール (奥の一点に集まる) */}
          <polygon points="70,390 640,390 640,790 70,790" fill="#8B8077" />
          {Array.from({ length: 9 }, (_, i) => {
            const yy = 400 + i * i * 6.5;
            const half = 20 + (yy - 390) * 0.9;
            return <rect key={i} x={355 - half} y={yy} width={half * 2} height={6 + i * 1.6} fill="#6E6058" />;
          })}
          <line x1={345} y1={390} x2={130} y2={790} stroke={KRP.silver} strokeWidth={9} />
          <line x1={365} y1={390} x2={580} y2={790} stroke={KRP.silver} strokeWidth={9} />
          {/* 奥 (消失点) からこちらへ近づいてくる電車の正面 */}
          {(() => {
            const a = seg(f, 4, 42);
            const by = 392 + (590 - 392) * a * a;              // 車輪の高さ (近づくほど下へ)
            const gauge = 20 + (by - 390) * 1.075;              // その高さでのレールの幅
            const k = Math.max(0.03, (gauge * 1.5) / 400);      // 正面の幅 400 を基準にした大きさ
            const cxT = 355;
            const beam = 0.35 + 0.15 * blinkL;
            return (
              <g>
                <g transform={`translate(${cxT} ${by}) scale(${k})`}>
                  <ellipse cx={0} cy={6} rx={230} ry={22} fill={KRP.ink} opacity={0.25} />
                  {/* 車体の正面 (上が丸い) */}
                  <path d="M -200 0 L -200 -340 Q -200 -440 -100 -440 L 100 -440 Q 200 -440 200 -340 L 200 0 Z" fill={C.trainFace} stroke={KRP.ink} strokeWidth={10} />
                  {/* 行き先の窓 (字なし) */}
                  <rect x={-90} y={-420} width={180} height={44} rx={8} fill="#2A2A30" stroke={KRP.ink} strokeWidth={6} />
                  <rect x={-70} y={-406} width={140} height={16} rx={6} fill="#7FD1FF" opacity={0.8} />
                  {/* 前面の大きな窓 2枚と運転士の影 */}
                  <rect x={-176} y={-360} width={164} height={150} rx={14} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={8} />
                  <rect x={12} y={-360} width={164} height={150} rx={14} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={8} />
                  <circle cx={-90} cy={-262} r={30} fill="#6E7482" />
                  <rect x={-122} y={-236} width={64} height={26} rx={10} fill="#6E7482" />
                  <path d="M -160 -340 L -120 -340 L -170 -250 Z" fill={KRP.white} opacity={0.5} />
                  <path d="M 30 -340 L 70 -340 L 20 -250 Z" fill={KRP.white} opacity={0.5} />
                  {/* 帯 (青緑) */}
                  <rect x={-200} y={-190} width={400} height={40} fill={HP.fun} stroke={KRP.ink} strokeWidth={6} />
                  {/* ライト 2つ */}
                  {[-130, 130].map((lx) => (
                    <g key={lx}>
                      <circle cx={lx} cy={-100} r={58} fill={HP.spark} opacity={0.35 * beam + 0.2} />
                      <circle cx={lx} cy={-100} r={30} fill="#FFF6C8" stroke={KRP.ink} strokeWidth={7} />
                      <circle cx={lx} cy={-100} r={14} fill={KRP.white} />
                    </g>
                  ))}
                  {/* 連結器とスカート */}
                  <rect x={-40} y={-120} width={80} height={60} rx={8} fill={C.trainFaceDark} stroke={KRP.ink} strokeWidth={6} />
                  <path d="M -200 -40 L 200 -40 L 170 0 L -170 0 Z" fill="#5E5A66" stroke={KRP.ink} strokeWidth={7} />
                  <rect x={-24} y={-60} width={48} height={40} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
                </g>
                {/* 近づいてくる勢いの線 */}
                {a > 0.55 && [-1, 1].map((d) => [0, 1, 2].map((j) => (
                  <line key={`${d}${j}`} x1={cxT + d * (230 * k + 20 + j * 10)} y1={by - (120 + j * 110) * k}
                    x2={cxT + d * (230 * k + 70 + j * 18)} y2={by - (120 + j * 110) * k - 10}
                    stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6 * (a - 0.55) / 0.45} />
                )))}
              </g>
            );
          })()}
          {/* 信号 (赤) */}
          <rect x={150} y={230} width={14} height={170} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={132} y={200} width={50} height={70} rx={10} fill="#2A2A30" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={157} cy={222} r={11} fill={KRP.red} />
          {/* 手前: ホームの端の黄色い線と、待つ人のつま先 */}
          <polygon points="70,640 640,700 640,790 70,790" fill="#B8AFA2" stroke={KRP.ink} strokeWidth={5} />
          <polygon points="70,640 640,700 640,716 70,656" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <rect x={440} y={600} width={70} height={120} fill="#3E4B66" stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${-tap} 500 744)`}>
            <path d="M 430 720 L 520 720 Q 580 724 580 748 L 430 752 Z" fill={KRP.ink} />
          </g>
          {[0, 1].map((k) => <path key={k} d={`M ${590 + k * 16} ${700 - k * 10} q 10 -6 4 -18`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={tap > 5 ? 0.8 : 0.2} />)}
        </HmAPanel>

        {/* ② 台所のやかん */}
        <HmAPanel i={1} f={f} rot={0.8}>
          <rect x={670} y={130} width={570} height={660} fill={C.tile} />
          <g stroke={C.tileLine} strokeWidth={3}>
            {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={670 + i * 52} y1={130} x2={670 + i * 52} y2={560} />)}
            {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={670} y1={130 + i * 52} x2={1240} y2={130 + i * 52} />)}
          </g>
          {/* 窓と換気扇 */}
          <rect x={700} y={160} width={150} height={120} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={5} />
          <line x1={775} y1={160} x2={775} y2={280} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1150} cy={220} r={56} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => <path key={k} d="M 0 0 Q 20 -40 0 -48" fill="none" stroke={KRP.grayDark} strokeWidth={6}
            transform={`translate(1150 220) rotate(${k * 120 + f * 4})`} />)}
          {/* コンロ */}
          <rect x={670} y={560} width={570} height={230} fill="#5E5A66" stroke={KRP.ink} strokeWidth={6} />
          <rect x={670} y={560} width={570} height={30} fill="#7A7680" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => <circle key={k} cx={760 + k * 80} cy={720} r={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />)}
          {/* 炎 */}
          {Array.from({ length: 7 }, (_, k) => {
            const hh = 26 + 8 * Math.sin(f / 2 + k * 1.7);
            return <path key={k} d={`M ${870 + k * 26} 566 q -8 ${-hh * 0.5} 0 ${-hh} q 8 ${hh * 0.5} 0 ${hh} Z`} fill="#5FA8E8" stroke={KRP.blueDeep} strokeWidth={2} />;
          })}
          {/* 五徳 (やかんを乗せる台) */}
          {[820, 900, 1000, 1080].map((gx) => <rect key={gx} x={gx - 8} y={518} width={16} height={48} rx={4} fill="#2A2A30" stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={800} y={514} width={300} height={12} rx={6} fill="#2A2A30" stroke={KRP.ink} strokeWidth={3} />
          {/* やかん */}
          <g transform={`translate(950 430)`}>
            <path d="M 110 -40 Q 200 -90 220 -150 L 236 -146 Q 220 -60 120 0 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -170 80 Q -190 -130 0 -150 Q 190 -130 170 80 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
            <path d="M -120 -40 Q -100 -110 -20 -126" stroke={KRP.white} strokeWidth={12} fill="none" opacity={0.6} />
            <g transform={`rotate(${lid} 0 -150)`}>
              <ellipse cx={0} cy={-150} rx={80} ry={18} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={0} cy={-170} r={14} fill={KRP.ink} />
            </g>
            <path d="M -110 -120 Q 0 -300 110 -120" stroke={KRP.ink} strokeWidth={14} fill="none" />
            <path d="M -110 -120 Q 0 -300 110 -120" stroke={KRP.red} strokeWidth={7} fill="none" />
            <rect x={-170} y={70} width={340} height={20} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 出かかった湯気 */}
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${1184 + k * 6} 276 q -10 -20 0 -38 q 10 -18 0 -36`} stroke={KRP.grayDark} strokeWidth={8} fill="none" strokeLinecap="round"
              opacity={steamT * (0.35 + 0.3 * Math.sin(f / 3 + k * 2))} transform={`translate(${k * 14} ${-((f * 1.2 + k * 12) % 22)})`} />
          ))}
          {[0, 1].map((k) => <line key={k} x1={1240 - 60} y1={260 + k * 30} x2={1240 - 30} y2={250 + k * 30} stroke={KRP.ink} strokeWidth={4} opacity={0.3 + 0.3 * Math.sin(f + k)} />)}
        </HmAPanel>

        {/* ③ スマホのトーク画面 */}
        <HmAPanel i={2} f={f} rot={-0.6}>
          <rect x={1270} y={130} width={570} height={660} fill={C.blanket} />
          <g stroke={C.blanketLine} strokeWidth={10} opacity={0.7}>
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1270} y1={150 + i * 80} x2={1840} y2={110 + i * 80} />)}
          </g>
          <g transform={`rotate(-4 ${p3x} ${p3y})`}>
            <Sumaho x={p3x} y={p3y} s={1.75} f={f} screen="notify" glow={0.6} />
            {/* 自分が送った吹き出し (右・既読はまだ付かない) */}
            <rect x={p3x - 20} y={p3y - 10} width={120} height={52} rx={16} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
            <rect x={p3x - 4} y={p3y + 6} width={84} height={8} rx={4} fill={KRP.white} opacity={0.8} />
            <rect x={p3x - 4} y={p3y + 22} width={54} height={8} rx={4} fill={KRP.white} opacity={0.8} />
            <rect x={p3x - 66} y={p3y + 20} width={38} height={18} rx={4} fill="none" stroke={KRP.gray} strokeWidth={2} strokeDasharray="4 4" />
            {/* 相手の「…」(左) */}
            <circle cx={p3x - 86} cy={p3y + 104} r={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
            <rect x={p3x - 64} y={p3y + 80} width={110} height={50} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={p3x - 36 + k * 27} cy={p3y + 105} r={8}
                fill={Math.floor(f / 4) % 3 === k ? KRP.ink : KRP.gray} />
            ))}
          </g>
          {/* 親指が画面の上で止まっている */}
          <ellipse cx={p3x + 150} cy={p3y + 250} rx={44} ry={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={5}
            transform={`rotate(-34 ${p3x + 150} ${p3y + 250}) translate(0 ${Math.sin(f / 6) * 4})`} />
        </HmAPanel>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #3 2014年、アメリカの大学で、人を何もない部屋に、15分だけ置いておく実験がありました。
// 格: 山 / seed 5003
// 絵: どこ: ShockRoom (minutes=0, empty)。手前左に年代札「2014年」と地名札「アメリカ」。演出: ドアが開いて、紺の服の学生がおずおず入ってくる。白衣の研究者がドアの外から「どうぞ」と手で示す (研究者は半分だけ見える)。壁時計に赤い扇形が出はじめる (minutes を f で 0→0.5)。カメラは引きの部屋全景。動き: f0-15 学生が入る / 壁時計の秒針 / 研究者の手の動き / 蛍光灯の光がちらっと
// どこ: ShockRoom (empty)。上に年代札「2014年」と地名札「アメリカ」+星条旗。ドアの向こうは廊下
// 演出: ドアが開き、紺の服の学生がおずおずと入ってくる (肩をすくめてきょろきょろ)。白衣の研究者が廊下から半身で「どうぞ」と手で示す。壁時計に赤い扇形が出はじめる
// 動き: f0-12 ドアが開く / f4-22 学生が入る / 研究者の手が小さく揺れる / 蛍光灯がちらっ / 秒針 / カメラが少し引く
// ドア (開き具合 o) と、その向こうの廊下。children は廊下の中 (ドアの枠で切り抜く)
const HmADoor: React.FC<{ o: number; children?: React.ReactNode }> = ({ o, children }) => {
  const right = 140 + 260 * (1 - 0.8 * o);
  return (
    <g>
      <defs><clipPath id="hmaDoorway"><rect x={146} y={156} width={248} height={528} /></clipPath></defs>
      <g clipPath="url(#hmaDoorway)">
        <rect x={140} y={150} width={260} height={540} fill={C.corridor} />
        <rect x={140} y={540} width={260} height={150} fill={C.hallFloor} />
        <rect x={250} y={250} width={90} height={120} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={140} y1={540} x2={400} y2={540} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {children}
      </g>
      <rect x={140} y={150} width={260} height={540} fill="none" stroke={KRP.ink} strokeWidth={8} />
      {/* ドアの板 (部屋の内側へ開く) */}
      <polygon points={`140,150 ${right},${150 - 30 * o} ${right},${690 + 30 * o} 140,690`} fill="#D8D2C2" stroke={KRP.ink} strokeWidth={7} />
      <circle cx={right - 26 * (1 - o * 0.6)} cy={430} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};
// 星条旗 (簡略)
const HmAFlagUS: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} y1={-50} x2={0} y2={60} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
    <g transform={`skewY(${Math.sin(f / 8) * 3})`}>
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={0} y={-50 + i * 10} width={110} height={10} fill={i % 2 ? KRP.white : KRP.red} />)}
      <rect x={0} y={-50} width={46} height={40} fill={KRP.blueDeep} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={9 + (i % 3) * 14} cy={-40 + Math.floor(i / 3) * 18} r={3} fill={KRP.white} />)}
      <rect x={0} y={-50} width={110} height={70} fill="none" stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);
// 白衣の研究者 (顔あり・名札に名前なし)。足元 x,y
const HmAKenkyu: React.FC<{ x: number; y: number; s: number; f: number; face?: "normal" | "smile" | "surprised" | "worried"; pose?: "stand" | "point" | "hold"; pointDir?: 1 | -1 }> = ({ x, y, s, f, face = "smile", pose = "stand", pointDir = 1 }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} pointDir={pointDir} cloth={C.coat} clothDark={KRP.grayDark} hair="cap" glasses phase={2} />
    <HmACoatTail x={x} y={y} s={s} />
    <rect x={x - 46 * s} y={y - 138 * s} width={30 * s} height={18 * s} rx={3} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const Hm003: React.FC<{ f: number }> = ({ f }) => {
  const o = easeOut(seg(f, 0, 12));
  const walk = easeOut(seg(f, 4, 22));
  const sx = lerp(300, 1000, walk);
  const sy = 800 - Math.abs(Math.sin(walk * Math.PI * 3)) * 10 * (walk < 1 ? 1 : 0);
  const flick = (f >= 5 && f <= 7) || f === 21 ? 0.35 : 0;
  const camS = lerp(1.07, 1, easeOut(seg(f, 0, 40)));
  const look = Math.sin(f / 7) * 5;
  return (
    <Frame f={f} seed={5003}>
      <g transform={cam(camS, 900, 520)}>
        <ShockRoom f={f} minutes={0.5 * seg(f, 10, 42)} empty />
        <HmADoor o={o}>
          <HmAKenkyu x={190} y={700} s={1.0} f={f} pose="point" />
          {[0, 1].map((k) => <path key={k} d={`M ${355 + k * 14} ${536 - k * 16} q 10 6 14 18`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.35 + 0.4 * Math.sin(f / 3 + k)} />)}
        </HmADoor>
        {/* 学生の影 */}
        <ellipse cx={sx} cy={806} rx={80} ry={14} fill={KRP.ink} opacity={0.15} />
        <Person x={sx} y={sy} s={1.1} f={f} face="normal" gaze={[look, -2]} hair="cap" phase={1} lean={walk < 1 ? 4 : 0} />
        {/* 肩をすくめる汗 */}
        {walk >= 1 && <path d={`M ${sx + 80} ${sy - 300} q 10 16 0 24 q -10 -8 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />}
        {/* 何もない部屋の「しーん」 */}
        <g opacity={seg(f, 24, 34)}>
          {[0, 1, 2].map((k) => <line key={k} x1={1260 + k * 40} y1={420} x2={1260 + k * 40} y2={470 + (k % 2) * 16} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />)}
        </g>
        {/* 年代札・地名札・旗 */}
        <TagPlate x={560} y={100} text="2014年" size={46} t={seg(f, 2, 12)} />
        <TagPlate x={900} y={100} text="アメリカ" size={46} t={seg(f, 6, 16)} />
        {seg(f, 6, 16) > 0 && <HmAFlagUS x={1060} y={110} s={0.9} f={f} />}
        {/* 蛍光灯のちらつき */}
        {flick > 0 && <rect x={-40} y={-40} width={2000} height={760} fill={KRP.white} opacity={flick} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #4 スマホなし。本なし。おしゃべり相手もなし。
// 格: 並 / seed 5004
// 絵: どこ: ShockRoom (minutes=1, empty) の入口の手前、机の上に置いた「預かり箱」(段ボール)。演出: 学生が自分のスマホ・文庫本を箱に入れていく。箱の横に「スマホ」「本」の小札。最後に箱のふたが閉まり、研究者がドアを閉めて部屋に学生ひとり。「おしゃべり相手」は、廊下に去っていく研究者の背中。動き: f0-12 スマホを入れる / 12-24 本を入れる / 24-36 ドアが閉まる / 学生が手持ちぶさたに指をいじる
// どこ: ShockRoom (empty) のドアのそば。小さな台の上に段ボールの「預かり箱」
// 演出: 学生がスマホ→文庫本を箱へ放りこむ (小札「スマホ」「本」)。ふたが閉まってテープ。廊下を研究者の背中が遠ざかり、ドアが閉まっていく。学生の「…」の吹き出しは誰にも届かない
// 動き: f2-12 スマホが弧を描いて入る / f13-23 本 / f26-36 ふたが閉まる / f24-40 ドアが閉まる / 学生が指をもじもじ
const Hm004: React.FC<{ f: number }> = ({ f }) => {
  const camS = lerp(1.08, 1.16, easeInOut(seg(f, 0, 42)));
  const t1 = seg(f, 2, 12), t2 = seg(f, 13, 23);
  const lid = 1 - easeOut(seg(f, 26, 36));
  const tape = seg(f, 36, 40);
  const door = 1 - 0.72 * easeInOut(seg(f, 24, 40));
  const leave = seg(f, 0, 42);
  const stx = 700, sty = 800, ss = 1.1;
  const hand: [number, number] = [stx + 153 * ss, sty - 148 * ss];
  const fly = (t: number, tx: number, ty: number): [number, number] =>
    [lerp(hand[0], tx, t), lerp(hand[1], ty, t) - Math.sin(t * Math.PI) * 140];
  const [p1x, p1y] = fly(easeInOut(t1), 1110, 520);
  const [p2x, p2y] = fly(easeInOut(t2), 1190, 520);
  const tossing = f < 24;
  const fid = Math.sin(f / 2.5) * 5;
  return (
    <Frame f={f} seed={5004}>
      <g transform={cam(camS, 820, 520)}>
        <ShockRoom f={f} minutes={1} empty />
        <HmADoor o={door}>
          {/* 廊下を去っていく研究者の背中 */}
          <g>
            <Person x={lerp(300, 330, leave)} y={lerp(690, 640, leave)} s={lerp(0.8, 0.62, leave)} f={f} cloth={C.coat} clothDark={KRP.grayDark} hair="cap" phase={2} />
            <HmABackHead x={lerp(300, 330, leave)} y={lerp(690, 640, leave) - 228 * lerp(0.8, 0.62, leave)} r={64 * lerp(0.8, 0.62, leave)} hair={KRP.ink} />
          </g>
        </HmADoor>
        {/* 台と段ボールの預かり箱 */}
        <rect x={960} y={640} width={380} height={24} rx={6} fill="#D9C9A6" stroke={KRP.ink} strokeWidth={6} />
        {[990, 1310].map((lx) => <rect key={lx} x={lx - 9} y={664} width={18} height={136} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={1010} y={462} width={280} height={30} fill={C.boxDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 飛んでいく物 (箱の前面より奥に描く) */}
        {t1 < 1 && <Sumaho x={p1x} y={p1y} s={0.26} rot={t1 * 320} f={f} screen="off" />}
        {t2 < 1 && (
          <g transform={`translate(${p2x} ${p2y}) rotate(${t2 * -280})`}>
            <rect x={-34} y={-46} width={68} height={92} rx={4} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-34} y={-46} width={12} height={92} fill="#C96A2A" stroke={KRP.ink} strokeWidth={3} />
            <rect x={-12} y={-30} width={36} height={8} rx={3} fill={KRP.white} opacity={0.8} />
          </g>
        )}
        {/* 箱の前面 */}
        <rect x={1010} y={480} width={280} height={162} fill={C.box} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1150} y1={480} x2={1150} y2={530} stroke={C.boxDark} strokeWidth={4} />
        <path d="M 1030 620 l 30 -14 M 1240 500 l 30 10" stroke={C.boxDark} strokeWidth={4} />
        {/* ふた (2枚) */}
        {lid > 0.02 ? (
          <g>
            <polygon points={`1010,480 1150,480 ${1150 - 30 * lid},${480 - 120 * lid} ${1010 - 50 * lid},${480 - 100 * lid}`} fill={C.box} stroke={KRP.ink} strokeWidth={5} />
            <polygon points={`1150,480 1290,480 ${1290 + 50 * lid},${480 - 100 * lid} ${1150 + 30 * lid},${480 - 120 * lid}`} fill={C.boxDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ) : (
          <g>
            <rect x={1004} y={466} width={292} height={20} fill={C.box} stroke={KRP.ink} strokeWidth={5} />
            <rect x={1130} y={460} width={40 * tape + 0.01} height={60} fill="#E9DFA8" opacity={0.9} stroke={KRP.ink} strokeWidth={2} />
          </g>
        )}
        <TagPlate x={1085} y={586} text="スマホ" size={30} t={seg(f, 10, 16)} />
        <TagPlate x={1232} y={586} text="本" size={30} t={seg(f, 21, 27)} />
        {/* 学生 */}
        <ellipse cx={stx} cy={806} rx={80} ry={14} fill={KRP.ink} opacity={0.15} />
        <Person x={stx} y={sty} s={ss} f={f} face="normal" pose={tossing ? "point" : "hold"} gaze={tossing ? [5, -2] : [-6, 3]} hair="cap" phase={1} />
        {tossing && t1 < 0.05 && <Sumaho x={hand[0]} y={hand[1] - 20} s={0.26} f={f} screen="off" />}
        {!tossing && (
          <g>
            <circle cx={stx - 14 * ss + fid} cy={sty - 124 * ss} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={stx + 14 * ss - fid} cy={sty - 116 * ss} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        )}
        {/* だれにも届かない「…」の吹き出し */}
        <g opacity={seg(f, 28, 36)} transform={`translate(${stx - 150} ${sty - 390})`}>
          <path d="M -70 -40 Q -70 -70 -40 -70 L 60 -70 Q 90 -70 90 -40 L 90 0 Q 90 30 60 30 L 20 30 L 40 60 L -6 30 L -40 30 Q -70 30 -70 0 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => <circle key={k} cx={-24 + k * 34} cy={-20} r={7} fill={KRP.gray} />)}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #5 あるのは、ボタンがひとつだけ。押すと、自分の体に、ビリッと電気が流れます。
// 格: 山 / seed 5005
// 絵: どこ: ShockRoom (minutes=3) の机の上の電気の箱に寄った大写し (カメラ scale 1.8 で箱のボタンへ)。演出: 箱のコードが学生の足首のバンド (灰色のマジックテープのバンド) へつながっている図を、点線の矢印で示す。ボタンに「ポチ」の小札。f30 前後で試しに押された瞬間の光 (press=0→1→0) と、足首のバンドから小さな稲妻。学生の顔がびくっと (face="surprised") 枠の端に入る。動き: 寄り→ボタンの光 / 稲妻のぱちぱち / 学生がのけぞる
// どこ: ShockRoom (minutes=3) の机の上の電気の箱に寄った大写し
// 演出: 学生が机の横に立ち、こわごわ指を伸ばして赤いボタンを試しに押す (札「ポチ」)。箱→足首の灰色のバンドへ点線の矢印。押した瞬間、ボタンが光り、足首のバンドから小さな稲妻、学生がびくっ (surprised)
// 動き: f0-20 カメラが 1.25→1.8 に寄る / f14-34 指がじりじり近づく / f34-38 押す (光) / 稲妻ぱちぱち・びくっと跳ねる
const Hm005: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 20));
  const camS = lerp(1.25, 1.8, k), cx = lerp(960, 1000, k), cy = lerp(600, 660, k);
  const approach = easeInOut(seg(f, 14, 34));
  const press = seg(f, 34, 37) * (1 - 0.3 * seg(f, 38, 42));
  const hit = f >= 36;
  const jump = hit ? Math.sin(seg(f, 36, 42) * Math.PI) * 14 : 0;
  const sx = 913, sy = 810, ss = 1.15;
  const sh: [number, number] = [sx + 67 * ss, sy - 148 * ss];
  const handY = lerp(470, 540, approach) + press * 6;
  const handX = lerp(1100, 1058, approach);
  const band: [number, number] = [sx - 18 * ss, 782];
  // ビリッ: 押した瞬間 (電気が流れる) f=36 から 8コマ、画面全体が揺れる
  const [shX, shY] = shakeAt(f, 36, 14);
  return (
    <Frame f={f} seed={5005}>
      <g transform={`translate(${shX} ${shY})`}>
      <g transform={cam(camS, cx, cy)}>
        <ShockRoom f={f} minutes={3} press={press} />
        {/* 箱から足首へのコード (延長) と、点線の矢印 */}
        <path d={`M 800 760 Q 840 790 ${band[0] - 10} ${band[1] + 6}`} stroke={KRP.ink} strokeWidth={7} fill="none" />
        <path d={`M 800 760 Q 840 790 ${band[0] - 10} ${band[1] + 6}`} stroke={KRP.grayDark} strokeWidth={3} fill="none" />
        {/* 学生 (右腕は自分で描いて、ボタンへ伸ばす) */}
        <ellipse cx={sx} cy={816} rx={84} ry={14} fill={KRP.ink} opacity={0.15} />
        <g transform={`translate(0 ${-jump})`}>
          <HmANoRArm id="hma5arm" x={sx} y={sy} s={ss}>
            <Person x={sx} y={sy} s={ss} f={f} face={hit ? "surprised" : "worried"} gaze={hit ? [0, 0] : [6, -3]} hair="cap" phase={1} still />
          </HmANoRArm>
          <HmAArm s={ss} cloth="#3E4B66" pts={[sh, [sh[0] + 52, sh[1] - 6], [handX, handY]]} />
          {/* 立てた人さし指 */}
          <rect x={handX - 5} y={handY - 26} width={10} height={22} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {/* 足首のバンド (灰色のマジックテープ) */}
          <rect x={band[0] - 22} y={band[1] - 14} width={44} height={22} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={band[0] - 14} y1={band[1] - 3} x2={band[0] + 14} y2={band[1] - 3} stroke={KRP.gray} strokeWidth={3} strokeDasharray="3 3" />
          {/* びくっ */}
          {hit && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              {[-1, 1].map((d) => [0, 1, 2].map((j) => (
                <line key={`${d}${j}`} x1={sx + d * (95 + j * 4)} y1={sy - 300 + j * 34} x2={sx + d * (125 + j * 6)} y2={sy - 316 + j * 34} />
              )))}
            </g>
          )}
        </g>
        <g opacity={seg(f, 6, 14)}>
          <path d={`M 1150 610 C 1150 700 1060 790 ${band[0] + 40} ${band[1] - 4}`} stroke={KRP.red} strokeWidth={6} fill="none" strokeDasharray="14 12"
            strokeDashoffset={-f * 2} strokeLinecap="round" />
          <path d={`M ${band[0] + 40} ${band[1] - 4} l 22 -16 M ${band[0] + 40} ${band[1] - 4} l 26 8`} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* 足首から小さな稲妻 */}
        {hit && [0, 1, 2].map((j) => (
          <HmABolt key={j} x={band[0] + [-40, 36, 0][j]} y={band[1] - [10, 18, 46][j]} s={0.55}
            t={seg(f, 36 + j, 39 + j)} rot={[-30, 25, 0][j] + Math.sin(f * 2 + j) * 8} />
        ))}
        <TagPlate x={1215} y={472} text="ポチ" size={30} t={seg(f, 8, 16)} rot={-4} />
      </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #6 参加者は、事前に「お金を払ってでも、この電気はいやだ」と答えた人たちです。
// 格: 並 / seed 5006
// 絵: どこ: 実験の前日の、大学の小部屋。机・アンケート用紙・鉛筆。演出: 学生が用紙のチェック欄に大きく✓を入れる。用紙の上に「お金を払ってでも避けたい」ではなく、**財布から硬貨を差し出しているイラスト+電気の稲妻に×** の図記号だけ (字幕と同じ文は書かない)。学生は首をぶんぶん横に振る (face="worried")。動き: f0-20 チェックを入れる / 硬貨がちゃりんと出る / 首を振る (小さく・ゆっくり)
// どこ: 実験の前日の大学の小部屋 (窓と木・掲示板・本棚)。机の上にアンケート用紙・鉛筆立て・消しゴム。年代札の代わりに「実験の前日」の札
// 演出: 用紙には図記号だけ: 財布から硬貨が出る絵 → 稲妻に×。学生が鉛筆でチェック欄に大きく✓。硬貨がちゃりんと飛び出す。学生は首をぶんぶん横に振る (worried)
// 動き: f4-20 ✓を書く / f12-26 硬貨が2枚跳ねる / f22〜 首を左右に (ゆっくり小さく) / 窓の木がゆれる
const Hm006: React.FC<{ f: number }> = ({ f }) => {
  const camS = lerp(1, 1.06, easeInOut(seg(f, 0, 42)));
  const ck = seg(f, 4, 20);
  // ✓の3点
  const P0: [number, number] = [1068, 520], P1: [number, number] = [1094, 552], P2: [number, number] = [1140, 488];
  const tip: [number, number] = ck < 0.4
    ? [lerp(P0[0], P1[0], ck / 0.4), lerp(P0[1], P1[1], ck / 0.4)]
    : [lerp(P1[0], P2[0], (ck - 0.4) / 0.6), lerp(P1[1], P2[1], (ck - 0.4) / 0.6)];
  const len1 = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), len2 = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
  const drawn = ck * (len1 + len2);
  const shake = f > 22 ? Math.sin((f - 22) / 2.6) * 3.2 : 0;
  const sx = 960, sy = 540, ss = 1.5;
  const sh: [number, number] = [sx + 67 * ss, sy - 148 * ss];
  const hand: [number, number] = [tip[0] + 18, tip[1] - 34];
  return (
    <Frame f={f} seed={5006}>
      <g transform={cam(camS, 960, 500)}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={2000} height={520} fill={C.classWall} />
        <rect x={-40} y={420} width={2000} height={20} fill="#D9CDB4" />
        {/* 窓と木 */}
        <rect x={1400} y={90} width={360} height={300} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={8} />
        <g transform={`rotate(${Math.sin(f / 14) * 1.5} 1580 400)`}>
          <rect x={1560} y={250} width={30} height={150} fill="#8E6234" />
          <circle cx={1530} cy={210} r={70} fill={C.tree} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1640} cy={190} r={80} fill={C.tree} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <line x1={1580} y1={90} x2={1580} y2={390} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1380} y={380} width={400} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 掲示板 (コルク) と貼り紙 */}
        <rect x={130} y={140} width={420} height={250} rx={6} fill="#C9A97A" stroke={KRP.ink} strokeWidth={7} />
        {[[200, 230, KRP.white, -4], [330, 210, KRP.yellow, 3], [450, 250, KRP.blueSoft, -2], [260, 320, "#F6C6BD", 5]].map(([nx, ny, c, r], i) => (
          <g key={i} transform={`rotate(${r} ${nx} ${ny})`}>
            <rect x={(nx as number) - 50} y={(ny as number) - 50} width={100} height={100} fill={c as string} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={nx as number} cy={(ny as number) - 40} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
            {[0, 1, 2].map((j) => <line key={j} x1={(nx as number) - 34} y1={(ny as number) - 12 + j * 18} x2={(nx as number) + 30 - j * 10} y2={(ny as number) - 12 + j * 18} stroke={KRP.gray} strokeWidth={4} />)}
          </g>
        ))}
        <TagPlate x={1580} y={460} text="実験の前日" size={36} t={seg(f, 0, 8)} />
        {/* 学生 (机の向こう)。首振り = 体ごと小さく回す */}
        <g transform={`rotate(${shake} ${sx} ${sy - 40})`}>
          <HmANoRArm id="hma6arm" x={sx} y={sy} s={ss}>
            <Person x={sx} y={sy} s={ss} f={f} face="worried" gaze={f > 22 ? [0, 0] : [4, 8]} hair="cap" phase={1} still />
          </HmANoRArm>
        </g>
        {/* 首振りの線 */}
        {f > 22 && [-1, 1].map((d) => (
          <path key={d} d={`M ${sx + d * 120} ${sy - 380} q ${d * 26} 40 0 80`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round"
            opacity={0.3 + 0.5 * Math.abs(Math.sin((f - 22) / 2.6))} />
        ))}
        {/* 机の天板 */}
        <polygon points="200,430 1720,430 1880,910 40,910" fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
        <rect x={20} y={900} width={1880} height={200} fill={C.deskDark} stroke={KRP.ink} strokeWidth={7} />
        {/* 用紙 */}
        <polygon points="600,450 1320,450 1380,820 540,820" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={760} y={516} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>アンケート</text>
        <line x1={640} y1={540} x2={1000} y2={540} stroke={C.paperLine} strokeWidth={4} />
        {/* チェック欄 */}
        <rect x={1060} y={478} width={90} height={84} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${P0[0]} ${P0[1]} L ${P1[0]} ${P1[1]} L ${P2[0]} ${P2[1]}`} stroke={KRP.red} strokeWidth={13} fill="none"
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${drawn} 999`} />
        {/* 図記号: 財布→硬貨 / 稲妻に× */}
        <g transform="translate(720 690)">
          <rect x={-90} y={-60} width={180} height={120} rx={20} fill="#8A5A34" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -90 -20 L 90 -20" stroke={KRP.ink} strokeWidth={4} />
          <rect x={40} y={-10} width={50} height={40} rx={10} fill="#6E4526" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={64} cy={10} r={8} fill={KRP.brass} />
          {[0, 1].map((j) => {
            const t = seg(f, 12 + j * 6, 22 + j * 6);
            if (t <= 0) return null;
            const cxx = lerp(10, 120 + j * 40, t), cyy = -70 - Math.sin(t * Math.PI) * 70 + t * 40;
            return (
              <g key={j}>
                <circle cx={cxx} cy={cyy} r={26} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={cxx} cy={cyy} r={14} fill="none" stroke={HP.brassDark} strokeWidth={3} />
                {t > 0.85 && [0, 1, 2].map((q) => <line key={q} x1={cxx + 30 + q * 4} y1={cyy - 26 + q * 18} x2={cxx + 48 + q * 4} y2={cyy - 34 + q * 22} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
              </g>
            );
          })}
        </g>
        <Arrow x={960} y={690} s={0.8} rot={0} />
        <g transform="translate(1180 690)">
          <circle r={86} fill="#FFF6C8" stroke={KRP.ink} strokeWidth={6} />
          <HmABolt x={0} y={0} s={1.5} />
          <line x1={-70} y1={-70} x2={70} y2={70} stroke={KRP.red} strokeWidth={14} strokeLinecap="round" />
          <line x1={70} y1={-70} x2={-70} y2={70} stroke={KRP.red} strokeWidth={14} strokeLinecap="round" />
        </g>
        {/* 机の上の小物: 鉛筆立て・消しゴム */}
        <rect x={300} y={500} width={100} height={120} rx={12} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
        {[[316, KRP.yellow], [344, KRP.red], [370, KRP.green]].map(([px, c], i) => (
          <rect key={i} x={px as number} y={440 - i * 10} width={16} height={80} rx={4} fill={c as string} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <rect x={1460} y={560} width={110} height={56} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-12 1515 588)" />
        <rect x={1460} y={560} width={44} height={56} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} transform="rotate(-12 1515 588)" />
        {/* 右腕と鉛筆 */}
        <g transform={`rotate(${shake * 0.5} ${sx} ${sy - 40})`}>
          <HmAArm s={ss} cloth="#3E4B66" pts={[sh, [sh[0] + 30, sh[1] + 90], hand]} />
        </g>
        <g transform={`translate(${tip[0]} ${tip[1]}) rotate(-35)`}>
          <rect x={-8} y={-120} width={16} height={104} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -8 -16 L 8 -16 L 0 0 Z" fill="#E8C9A0" stroke={KRP.ink} strokeWidth={3} />
          <rect x={-8} y={-132} width={16} height={14} fill="#F6C6BD" stroke={KRP.ink} strokeWidth={3} />
        </g>
        <circle cx={hand[0]} cy={hand[1]} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #7 結果。男性は、18人のうち12人が、押しました。
// 格: 図 / seed 5007
// 絵: どこ: ShockRoom の壁に貼った大きな結果の模造紙 (minutes=6 の部屋が背景に薄く)。演出: 男性の人形 18体 (PersonMini か小さな丸頭) を6×3に並べ、そのうち12体の頭上に稲妻マーク⚡がぽんぽんと付いていく。右に大きな数字札「12/18」。押した人形は少し跳ねる。動き: f6-36 で1体ずつ⚡が付く (12回) / 最後に「12/18」がぽんと出る
// どこ: ShockRoom (minutes=6) の壁に貼った大きな模造紙 (部屋は薄く)。テープ留め・見出し札「男性」
// 演出: 紺の人形18体 (6×3)。押した12体の頭上に稲妻がぽんぽん付き、その人形は小さく跳ねる。右に大きな数字札「12/18」。模造紙の右端には次の「女性」の列がまだ薄く見えている
// 動き: f6-34 で稲妻が1つずつ (12回) / f34-40 で「12/18」がぽん / カメラがわずかに寄る
const MEN_ON = [0, 1, 3, 4, 5, 6, 8, 9, 11, 13, 14, 16];
const WOMEN_ON = [2, 7, 9, 13, 18, 22];
// 結果の人 (メインキャラの Person を小さく並べる)。男性 = 短い黒髪+青/紺の服+ズボン。女性 = 肩までの茶色の長い髪+赤いリボン+ピンクの服+スカート
const MAN_S = 0.58, WOMAN_S = 0.56;
const menPos = (i: number): [number, number] => [190 + (i % 6) * 175, 340 + Math.floor(i / 6) * 205];
const womenPos = (i: number): [number, number] => [1800 + (i % 8) * 145, 340 + Math.floor(i / 8) * 205];
const HmAKekka: React.FC<{ x: number; y: number; s: number; f: number; phase: number; woman?: boolean; tilt?: number; hop?: number; shocked?: boolean }> = ({ x, y, s, f, phase, woman, tilt = 0, hop = 0, shocked }) => {
  const cloth = woman ? C.pink : phase % 2 ? C.menBlue : C.menNavy;
  const clothDark = woman ? C.pinkDark : phase % 2 ? C.menBlueDark : C.menNavyDark;
  const face = shocked ? "surprised" : "normal";
  const gaze: [number, number] = shocked ? [0, 0] : tilt !== 0 ? [tilt > 0 ? 5 : -5, -4] : [0, 2];
  return (
    <g transform={`translate(0 ${-hop}) rotate(${tilt} ${x} ${y - 160 * s})`}>
      <ellipse cx={x} cy={y} rx={56 * s} ry={10 * s} fill={KRP.ink} opacity={0.14} />
      {/* 女性: 頭の後ろの長い髪 (肩まで) */}
      {woman && (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M -74 -232 Q -78 -300 0 -302 Q 78 -300 74 -232 L 80 -150 Q 60 -136 40 -150 L 40 -190 L -40 -190 L -40 -150 Q -60 -136 -80 -150 Z"
            fill={C.hairBrown} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      <Person x={x} y={y} s={s} f={f} phase={phase} still face={face} gaze={gaze}
        cloth={cloth} clothDark={clothDark} hair={woman ? "none" : "cap"} />
      {woman && (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          {/* スカート (腰からひざまで広がる台形) */}
          <path d="M -56 -78 L 56 -78 L 80 -24 L -80 -24 Z" fill={C.skirt} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -30 -74 L -40 -28 M 0 -74 L 0 -28 M 30 -74 L 40 -28" stroke={C.skirtDark} strokeWidth={4} />
          {/* 前髪 (茶色) */}
          <path d="M -64 -236 Q -66 -294 0 -296 Q 66 -294 64 -236 Q 50 -258 20 -262 Q 6 -246 -10 -262 Q -40 -258 -64 -236 Z" fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* 顔の横から肩へ垂れる髪 (左右) */}
          <path d="M -64 -240 Q -76 -196 -70 -150 L -48 -150 Q -52 -196 -50 -232 Z" fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 64 -240 Q 76 -196 70 -150 L 48 -150 Q 52 -196 50 -232 Z" fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* 赤いリボン (頭の右上) */}
          <g transform="translate(40 -284) rotate(18)">
            <path d="M 0 0 L -34 -20 L -34 20 Z" fill={C.ribbon} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d="M 0 0 L 34 -20 L 34 20 Z" fill={C.ribbon} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <circle r={10} fill={C.ribbon} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      )}
    </g>
  );
};
// 模造紙 (世界座標 x 60〜3420)。menT/womenT: 稲妻の出る進み (0〜1 を人数分に割る) / mPlate, wPlate: 数字札の t
const HmAPoster: React.FC<{ f: number; menT: number; womenT: number; mPlate: number; wPlate: number; womenFade: number; tiltWomen?: boolean }> = ({ f, menT, womenT, mPlate, wPlate, womenFade, tiltWomen }) => (
  <g>
    <rect x={74} y={124} width={3360} height={690} fill={KRP.ink} opacity={0.2} />
    <rect x={60} y={110} width={3360} height={690} fill={C.poster} stroke={KRP.ink} strokeWidth={7} />
    {[[90, 120, -30], [3390, 120, 30], [90, 790, 30], [3390, 790, -30], [1700, 116, 0]].map(([tx, ty, r], i) => (
      <rect key={i} x={tx - 46} y={ty - 16} width={92} height={32} fill="#E9DFA8" opacity={0.9} stroke={KRP.ink} strokeWidth={2} transform={`rotate(${r} ${tx} ${ty})`} />
    ))}
    {/* 段の線 */}
    {[340, 545, 750].map((ry) => <line key={ry} x1={120} y1={ry + 6} x2={3360} y2={ry + 6} stroke={C.paperLine} strokeWidth={4} />)}
    <line x1={1690} y1={150} x2={1690} y2={770} stroke={KRP.grayDark} strokeWidth={6} strokeDasharray="20 14" />
    {/* 男性 18人 */}
    {Array.from({ length: 18 }, (_, i) => {
      const [x, y] = menPos(i);
      const k = MEN_ON.indexOf(i);
      const t = k < 0 ? 0 : clamp01(menT * 12 - k);
      return (
        <g key={i}>
          <HmAKekka x={x} y={y} s={MAN_S} f={f} phase={i} shocked={t > 0} hop={t > 0 && t < 1 ? Math.sin(t * Math.PI) * 22 : 0} />
          {k >= 0 && <HmABolt x={x + 36} y={y - 192} s={0.5} t={t} rot={14 + Math.sin(f / 5 + i) * 6} />}
        </g>
      );
    })}
    <TagPlate x={1380} y={250} text="男性" size={52} />
    <TagPlate x={1380} y={470} text="12/18" size={96} t={mPlate} fill={HP.spark} />
    {/* 女性 24人 */}
    <g opacity={womenFade}>
      {Array.from({ length: 24 }, (_, i) => {
        const [x, y] = womenPos(i);
        const k = WOMEN_ON.indexOf(i);
        const t = k < 0 ? 0 : clamp01(womenT * 6 - k);
        const tl = tiltWomen && k < 0 ? (i % 2 ? 1 : -1) * (6 + 3 * Math.sin(f / 9 + i * 1.3)) : 0;
        return (
          <g key={i}>
            <HmAKekka x={x} y={y} s={WOMAN_S} f={f} phase={i + 3} woman tilt={tl} shocked={t > 0} hop={t > 0 && t < 1 ? Math.sin(t * Math.PI) * 22 : 0} />
            {k >= 0 && <HmABolt x={x + 40} y={y - 196} s={0.5} t={t} rot={14 + Math.sin(f / 5 + i) * 6} />}
          </g>
        );
      })}
      <TagPlate x={3080} y={250} text="女性" size={52} />
      <TagPlate x={3080} y={470} text="6/24" size={96} t={wPlate} fill={HP.spark} />
    </g>
  </g>
);
const Hm007: React.FC<{ f: number }> = ({ f }) => {
  const camS = lerp(1, 1.04, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={5007}>
      <ShockRoom f={f} minutes={6} />
      <rect x={-40} y={-40} width={2000} height={1160} fill={KRP.cream} opacity={0.55} />
      <g transform={cam(camS, 960, 470)}>
        <HmAPoster f={f} menT={seg(f, 6, 34)} womenT={0} mPlate={seg(f, 34, 40)} wPlate={0} womenFade={0.35} />
        {/* 赤いマーカーで書きこむ手 (稲妻の進みについていく) */}
        {(() => {
          const n = Math.min(11, Math.floor(seg(f, 6, 34) * 12));
          const i = MEN_ON[n];
          const hx = menPos(i)[0] + 60, hy = menPos(i)[1] - 170;
          return f < 36 ? (
            <g transform={`translate(${hx} ${hy}) rotate(30)`}>
              <rect x={-9} y={-10} width={18} height={70} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={0} cy={80} rx={30} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-22} y={98} width={44} height={60} fill={C.coat} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ) : null;
        })()}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #8 女性も、24人のうち6人が押しています。
// 格: 図 / seed 5008
// 絵: どこ: #7 と同じ模造紙の右半分 (カメラが右へパン)。演出: 女性の人形 24体を8×3に並べ、6体に⚡。数字札「6/24」。左端に #7 の「12/18」が少し見えている。動き: f0-12 カメラが右へパン / f12-34 ⚡が6回 / 押していない人形が小さく首をかしげる
// どこ: #7 と同じ模造紙の右半分。左端に「12/18」の札が切れて見える
// 演出: 茶色の髪を結んだ人形24体 (8×3)。押した6体だけに稲妻。押していない人形は首をかしげる。右に数字札「6/24」
// 動き: f0-12 カメラが右へパン / f14-34 稲妻が6回 / f34-40 「6/24」がぽん / 首かしげ
const Hm008: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 12));
  const tx = lerp(-700, -1400, pan);
  return (
    <Frame f={f} seed={5008}>
      <g transform={`translate(${tx * 0.08} 0)`}>
        <ShockRoom f={f} minutes={6} />
      </g>
      <rect x={-40} y={-40} width={2000} height={1160} fill={KRP.cream} opacity={0.55} />
      <g transform={`translate(${tx} 0)`}>
        <HmAPoster f={f} menT={1} womenT={seg(f, 14, 34)} mPlate={1} wPlate={seg(f, 34, 40)} womenFade={1} tiltWomen />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #9 ひとり、15分で190回押した男性がいて、さすがに集計から外されました。
// 格: 山 / seed 5009
// 絵: どこ: ShockRoom (minutes=12)。演出: 学生がボタンを連打している (腕だけ高速で上下・残像)。机の上にカウンターの札が「190」に向かってぱらぱら増える (f で 0→190)。ドアの外から研究者がのぞいて、名簿 (クリップボード) のこの人の行に大きく赤い線を引く。学生のまわりに稲妻が絶え間なく出る。動き: 連打の残像 / 数字のカウントアップ (f42 で190) / 研究者が線を引く
// どこ: ShockRoom (minutes=12) の全景。ドアが開いて廊下に研究者
// 演出: 学生が机の横でボタンを連打 (腕の残像・まわりに小さな稲妻がぱちぱち・顔は妙にうれしそう+汗)。壁に回数の札が 0→190 とぱらぱら増える。研究者がドアからのぞき、名簿 (拡大の吹き出し) のこの人の行に赤い線を引く
// 動き: 腕が速く上下 / 回数が f42 で190 / f24-38 赤線が引かれる / 研究者の汗
const Hm009: React.FC<{ f: number }> = ({ f }) => {
  const sx = 913, sy = 810, ss = 1.15;
  const sh: [number, number] = [sx + 67 * ss, sy - 148 * ss];
  const tap = Math.abs(Math.sin(f * 1.3));
  const handY = lerp(548, 470, tap);
  // 音を鳴らすコマ (下の HITS) ではボタンを光りきらせる
  const press = [5, 12, 17, 29, 41].some((P) => f >= P && f < P + 2) ? 1 : clamp01(1 - tap * 3);
  const n = Math.min(190, Math.round(190 * seg(f, 0, 42)));
  const strike = easeOut(seg(f, 24, 38));
  const camS = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const rows = [0, 1, 2, 3, 4];
  // 連打のビリッ: 押しこんだ瞬間 (press がほぼ1) のうち 5回だけ、小さく (8px) 画面が揺れる
  const HITS = [5, 12, 17, 29, 41];
  const [shX, shY] = HITS.reduce<[number, number]>((acc, P) => {
    const [dx, dy] = shakeAt(f, P, 8, 6);
    return [acc[0] + dx, acc[1] + dy];
  }, [0, 0]);
  return (
    <Frame f={f} seed={5009}>
      <g transform={`translate(${shX} ${shY})`}>
      <g transform={cam(camS, 900, 520)}>
        <ShockRoom f={f} minutes={12} press={press} />
        <HmADoor o={0.85}>
          <HmAKenkyu x={300} y={700} s={0.95} f={f} face="surprised" pose="hold" />
          <rect x={300 - 50} y={700 - 0.95 * 150} width={100} height={70} rx={6} fill="#A06A3C" stroke={KRP.ink} strokeWidth={4} />
          <rect x={300 - 40} y={700 - 0.95 * 140} width={80} height={50} fill={KRP.white} />
        </HmADoor>
        {/* 研究者の汗 */}
        <path d="M 380 445 q 10 16 0 24 q -10 -8 0 -24 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        {/* 名簿の拡大 (吹き出し) */}
        <g>
          <path d="M 470 300 L 320 520 L 540 330 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={440} y={110} width={430} height={300} rx={14} fill="#A06A3C" stroke={KRP.ink} strokeWidth={6} />
          <rect x={462} y={140} width={386} height={256} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={610} y={100} width={90} height={34} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {rows.map((r) => {
            const ry = 172 + r * 46;
            const hot = r === 2;
            return (
              <g key={r}>
                <circle cx={490} cy={ry} r={11} fill={KRP.gray} />
                <rect x={512} y={ry - 7} width={150} height={14} rx={7} fill={KRP.gray} />
                <text x={820} y={ry + 12} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={hot ? 36 : 28}
                  fill={hot ? KRP.red : KRP.grayDark}>{hot ? "190" : ["0", "3", "", "1", "0"][r]}</text>
                <line x1={474} y1={ry + 23} x2={836} y2={ry + 23} stroke={C.paperLine} strokeWidth={2} />
              </g>
            );
          })}
          {strike > 0 && <line x1={470} y1={262} x2={470 + 370 * strike} y2={256} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />}
        </g>
        {/* 回数の札 */}
        <TagPlate x={1150} y={360} text={`${n}回`} size={58} fill={HP.spark} rot={Math.sin(f) * 1.5} />
        {/* 学生 */}
        <ellipse cx={sx} cy={816} rx={84} ry={14} fill={KRP.ink} opacity={0.15} />
        <HmANoRArm id="hma9arm" x={sx} y={sy} s={ss}>
          <Person x={sx} y={sy} s={ss} f={f} face="joy" hair="cap" phase={1} still />
        </HmANoRArm>
        <path d={`M ${sx - 90} ${sy - 330} q 12 18 0 28 q -12 -10 0 -28 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        {/* 腕の残像 */}
        {[0.6, 0.3].map((op, j) => (
          <HmAArm key={j} s={ss} cloth="#3E4B66" opacity={op * 0.5} pts={[sh, [sh[0] + 52, sh[1] - 6], [1058, lerp(548, 470, 1 - j * 0.5) ]]} />
        ))}
        <HmAArm s={ss} cloth="#3E4B66" pts={[sh, [sh[0] + 52, sh[1] - 6], [1058, handY]]} />
        {[0, 1, 2].map((j) => <line key={j} x1={1100} y1={480 + j * 24} x2={1140} y2={476 + j * 24} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6} />)}
        {/* 絶え間ない小さな稲妻 */}
        {Array.from({ length: 6 }, (_, j) => {
          const a = ((j * 60 + f * 23) * Math.PI) / 180;
          const life = ((f * 0.35 + j * 0.37) % 1);
          return <HmABolt key={j} x={sx + Math.cos(a) * 150} y={620 + Math.sin(a) * 120} s={0.42 * Math.sin(life * Math.PI)} rot={j * 40} />;
        })}
      </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #10 人間、そこまでして、暇がいやなのです。
// 格: 並 / seed 5010
// 絵: どこ: ShockRoom (minutes=15) の全景を、外の廊下から窓ごしにのぞく構図 (窓枠が手前にある)。演出: 部屋の中で、学生が椅子の上で天井を見上げてぐったり (face="sad")、ボタンにそっと指を伸ばしかけている。壁時計の扇形が15分ぶん満ちる。窓の外側に「暇」と書いた札ではなく、**あくびの吹き出し**だけ。動き: 時計の針が15分に届く / 指がじりじり伸びる / ため息の湯気
// どこ: 実験室の外の廊下。大きなガラス窓ごしに ShockRoom (minutes 13→15) の全景。廊下の壁・腰板・消火器・ウォーターサーバー
// 演出: 部屋の中で学生が椅子にぐったり座って天井を見上げ (sad)、右手の指をボタンのほうへじりじり伸ばしかけている (まだ届かない)。ため息の湯気。窓の外 (廊下側) にあくびの吹き出し (絵だけ)
// 動き: 壁時計が15分に届く / 指がじりじり伸びる / ため息がふわっと上がる / 窓のガラスの反射が流れる / カメラがゆっくり寄る
const Hm010: React.FC<{ f: number }> = ({ f }) => {
  const camS = lerp(1, 1.06, easeInOut(seg(f, 0, 42)));
  const reach = easeInOut(seg(f, 4, 40));
  const rs = 0.66, rtx = 314, rty = 100;
  const sx = 720, sy = 707, ss = 1.15;
  const sh: [number, number] = [sx + 67 * ss, sy - 148 * ss];
  const tipX = lerp(840, 905, reach);
  const sigh = (f % 30) / 30;
  return (
    <Frame f={f} seed={5010}>
      <g transform={cam(camS, 960, 470)}>
        {/* 廊下の壁と床 */}
        <rect x={-40} y={-40} width={2000} height={900} fill={C.hallWall} />
        <rect x={-40} y={800} width={2000} height={340} fill={C.hallFloor} />
        <rect x={-40} y={790} width={2000} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓の向こうの実験室 */}
        <defs><clipPath id="hma10win"><rect x={320} y={140} width={1280} height={630} /></clipPath></defs>
        <g clipPath="url(#hma10win)">
          <g transform={`translate(${rtx} ${rty}) scale(${rs})`}>
            <ShockRoom f={f} minutes={lerp(13, 15, seg(f, 0, 36))} />
            <HmANoRArm id="hma10arm" x={sx} y={sy} s={ss}>
              <Person x={sx} y={sy} s={ss} f={f} pose="sit" face="sad" gaze={[0, -11]} hair="cap" phase={1} still />
            </HmANoRArm>
            <HmAArm s={ss} cloth="#3E4B66" pts={[sh, [sh[0] + 50, sh[1] + 10], [tipX - 20, 560]]} />
            <rect x={tipX - 22} y={554} width={34} height={11} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            {/* ため息 */}
            {[0, 1].map((j) => {
              const t = (sigh + j * 0.5) % 1;
              return <circle key={j} cx={sx + 70 + t * 40} cy={sy - 330 - t * 120} r={18 + t * 26} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} opacity={(1 - t) * 0.8} />;
            })}
          </g>
          {/* ガラスの反射 */}
          {[0, 1].map((j) => {
            const x0 = ((f * 6 + j * 640) % 1800) - 200;
            return <polygon key={j} points={`${x0},140 ${x0 + 90},140 ${x0 - 160},770 ${x0 - 250},770`} fill={KRP.white} opacity={0.16} />;
          })}
        </g>
        {/* 窓枠 */}
        <rect x={320} y={140} width={1280} height={630} fill="none" stroke="#7A7680" strokeWidth={26} />
        <rect x={300} y={120} width={1320} height={670} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={333} y={153} width={1254} height={604} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={290} y={770} width={1340} height={26} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 廊下の小物: 消火器・ウォーターサーバー */}
        <g>
          <rect x={120} y={560} width={70} height={190} rx={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <rect x={136} y={530} width={38} height={36} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 174 548 q 40 10 30 70" stroke={KRP.ink} strokeWidth={8} fill="none" />
          <rect x={1700} y={420} width={140} height={380} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1720 420 Q 1720 300 1770 300 Q 1820 300 1820 420 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={1770} cy={360 + Math.sin(f / 6) * 4} rx={14} ry={8} fill={KRP.white} opacity={0.7} />
          <rect x={1740} y={500} width={60} height={30} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* あくびの吹き出し (廊下側) */}
        <g transform={`translate(1600 190) scale(${pop(seg(f, 10, 20))})`}>
          <path d="M -150 -80 Q -150 -110 -120 -110 L 120 -110 Q 150 -110 150 -80 L 150 50 Q 150 80 120 80 L -40 80 L -100 140 L -80 80 L -120 80 Q -150 80 -150 50 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-14} r={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -36 -36 q 12 -8 24 0 M 12 -36 q 12 -8 24 0" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={8 + Math.sin(f / 5) * 2} rx={22} ry={22 + Math.sin(f / 5) * 6} fill={KRP.ink} />
          <ellipse cx={0} cy={20} rx={11} ry={6} fill="#E06A5A" />
          <path d="M -48 -26 q -8 12 0 16 q 8 -4 0 -16 Z" fill="#7FA8C9" />
          <path d="M 80 -60 q 20 -10 30 6 M 90 -30 q 24 -4 28 14" stroke={KRP.grayDark} strokeWidth={4} fill="none" />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #11 ところが、いまの私たちは、ほとんど退屈しません。
// 格: 山 / seed 5011
// 絵: どこ: 現代の街の交差点を上から見下ろす俯瞰。横断歩道・信号・歩道の人たち。演出: 信号待ちの人が10人ほど、**全員が同じ角度でうつむいてスマホを見ている** (小さな Person。スマホの光が点々と光る)。そこへ「あなた」(橙のパーカー) が来て、同じ角度でうつむく。動き: 信号の赤が点灯 / スマホの光が呼吸するように明滅 / 鳩がよける / カメラがゆっくり寄る
// どこ: 現代の街の交差点を高い所から見下ろす。向こう側の店の並び (看板の字なし)・横断歩道・車道を横切る車・手前の歩道・歩行者用の赤信号
// 演出: 信号待ちの10人が全員そろって同じ角度でうつむき、手元のスマホが点々と光る。そこへ右から橙のパーカーの「あなた」が来て、立ち止まり、同じ角度でうつむく。鳩が足元からよける
// 動き: 赤信号が点灯して脈打つ / スマホの光が呼吸するように明滅 / f6-30「あなた」が歩いて来る / f30-38 うつむく / 車が横切る / 鳩がよける / カメラがゆっくり寄る
const HmAWalker: React.FC<{ x: number; y: number; s: number; f: number; cloth: string; clothDark: string; hair: "cap" | "none"; lean: number; phase: number; you?: boolean }> = ({ x, y, s, f, cloth, clothDark, hair, lean, phase, you }) => {
  const glow = 0.55 + 0.45 * Math.sin(f / 7 + phase * 1.7);
  const hx = x + Math.sin((lean * Math.PI) / 180) * 120 * s, hy = y - 120 * s;
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={60 * s} ry={12 * s} fill={KRP.ink} opacity={0.18} />
      {you && <path d={`M ${x - 70 * s} ${y - 160 * s} Q ${x} ${y - 205 * s} ${x + 70 * s} ${y - 160 * s} Z`} fill={HP.youDark} stroke={KRP.ink} strokeWidth={4}
        transform={`rotate(${lean} ${x} ${y})`} />}
      <Person x={x} y={y} s={s} f={f} pose="hold" face="normal" gaze={[0, 8]} cloth={cloth} clothDark={clothDark} hair={hair} lean={lean} phase={phase} still />
      {hair === "none" && <path d={`M ${x - 62 * s} ${y - 240 * s} Q ${x} ${y - 310 * s} ${x + 62 * s} ${y - 240 * s} Q ${x} ${y - 266 * s} ${x - 62 * s} ${y - 240 * s} Z`}
        fill={C.hairGray} transform={`rotate(${lean} ${x} ${y})`} />}
      <circle cx={hx} cy={hy} r={44 * s} fill={HP.screen} opacity={0.35 * glow} />
      <rect x={hx - 14 * s} y={hy - 24 * s} width={28 * s} height={44 * s} rx={5 * s} fill={KRP.ink} transform={`rotate(${lean} ${hx} ${hy})`} />
      <rect x={hx - 10 * s} y={hy - 20 * s} width={20 * s} height={36 * s} rx={3 * s} fill={HP.screenCore} opacity={0.6 + 0.4 * glow} transform={`rotate(${lean} ${hx} ${hy})`} />
    </g>
  );
};
const Hm011: React.FC<{ f: number }> = ({ f }) => {
  const camS = lerp(1, 1.1, easeInOut(seg(f, 0, 42)));
  const walk = easeOut(seg(f, 6, 30));
  const youX = lerp(2050, 1470, walk);
  const youY = 770 - (walk < 1 ? Math.abs(Math.sin(walk * Math.PI * 4)) * 10 : 0);
  const youLean = lerp(0, 9, easeInOut(seg(f, 30, 38)));
  const carX = ((f * 38) % 3200) - 700;
  const hatoX = 1600 + easeOut(seg(f, 22, 34)) * 220;
  const redP = 0.75 + 0.25 * Math.sin(f / 4);
  const crowd: [number, number, number, string, string, "cap" | "none"][] = [
    [520, 640, 0.48, "#6A8FB8", "#4E6E92", "cap"],
    [680, 650, 0.48, "#8E6E9E", "#6A4E7A", "none"],
    [840, 636, 0.48, "#5E8A64", "#466A4C", "cap"],
    [1000, 648, 0.48, "#C96A4A", "#9E4E34", "cap"],
    [1160, 640, 0.48, "#7E868E", "#5E666E", "none"],
    [1320, 650, 0.48, "#D9B23C", "#A8862A", "cap"],
    [600, 770, 0.55, "#3E4B66", "#2E3850", "cap"],
    [800, 760, 0.55, "#B0633F", "#86482C", "none"],
    [1060, 772, 0.55, "#4FA38D", "#347A68", "cap"],
    [1260, 764, 0.55, "#9A6AB0", "#764E8A", "cap"],
  ];
  return (
    <Frame f={f} seed={5011}>
      <g transform={cam(camS, 1000, 560)}>
        {/* 向こうの歩道と店の並び */}
        <rect x={-40} y={-40} width={2000} height={300} fill="#D9CDB4" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={-20 + i * 290} y={-40} width={270} height={190} fill={["#E6E2D6", "#C9D2D6", "#EADFC8", "#D6C2B4"][i % 4]} stroke={KRP.ink} strokeWidth={5} />
            <rect x={0 + i * 290} y={60} width={230} height={80} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 6 }, (_, j) => <rect key={j} x={-20 + i * 290 + j * 45} y={150} width={45} height={34} fill={j % 2 ? KRP.white : [KRP.red, KRP.green, KRP.blueDeep, KRP.orange][i % 4]} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
        ))}
        <rect x={-40} y={184} width={2000} height={110} fill={C.sidewalk} />
        <g stroke={C.sidewalkLine} strokeWidth={3}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={i * 90} y1={184} x2={i * 90 - 20} y2={294} />)}</g>
        {[200, 900, 1600].map((tx) => (
          <g key={tx}>
            <rect x={tx - 40} y={230} width={80} height={50} fill="#8E6234" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={tx} cy={206 + Math.sin(f / 15 + tx) * 2} r={52} fill={C.tree} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 車道と横断歩道 */}
        <rect x={-40} y={294} width={2000} height={270} fill={C.asphalt} />
        <rect x={-40} y={294} width={2000} height={10} fill={KRP.white} opacity={0.6} />
        <rect x={-40} y={554} width={2000} height={10} fill={KRP.white} opacity={0.6} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={400 + i * 100} y={320} width={56} height={220} fill={KRP.white} opacity={0.92} />)}
        <rect x={-40} y={424} width={380} height={6} fill={KRP.yellow} />
        <rect x={1640} y={424} width={400} height={6} fill={KRP.yellow} />
        {/* 横切る車 (真上寄りから) */}
        <g transform={`translate(${carX} 380)`}>
          <rect x={0} y={0} width={300} height={130} rx={34} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
          <rect x={70} y={16} width={150} height={98} rx={18} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={5} />
          <rect x={110} y={16} width={70} height={98} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={296} cy={30} r={9} fill={HP.spark} /><circle cx={296} cy={100} r={9} fill={HP.spark} />
          {[0, 1, 2].map((j) => <line key={j} x1={-30 - j * 30} y1={30 + j * 34} x2={-90 - j * 30} y2={30 + j * 34} stroke={KRP.white} strokeWidth={5} opacity={0.6} strokeLinecap="round" />)}
        </g>
        {/* 手前の歩道 */}
        <rect x={-40} y={564} width={2000} height={600} fill={C.sidewalk} />
        <rect x={-40} y={564} width={2000} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={C.sidewalkLine} strokeWidth={3}>
          {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1={-40} y1={620 + i * 70} x2={1960} y2={620 + i * 70} />)}
          {Array.from({ length: 24 }, (_, i) => <line key={`v${i}`} x1={i * 100} y1={584} x2={i * 110 - 120} y2={1120} />)}
        </g>
        {/* 点字ブロック */}
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={420 + i * 110} y={596} width={96} height={30} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2} />)}
        {/* 歩行者信号 (赤) */}
        <g>
          <rect x={290} y={300} width={22} height={480} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={230} y={260} width={140} height={200} rx={14} fill="#3E3E48" stroke={KRP.ink} strokeWidth={6} />
          <rect x={250} y={276} width={100} height={80} rx={8} fill="#2A2A30" />
          <circle cx={300} cy={316} r={52} fill={KRP.red} opacity={0.25 * redP} />
          <g fill={KRP.red} opacity={redP}>
            <circle cx={300} cy={292} r={9} />
            <rect x={288} y={302} width={24} height={30} rx={5} />
            <rect x={289} y={330} width={9} height={20} rx={3} /><rect x={302} y={330} width={9} height={20} rx={3} />
          </g>
          <rect x={250} y={364} width={100} height={80} rx={8} fill="#2A2A30" />
          <g fill={KRP.green} opacity={0.18}>
            <circle cx={300} cy={380} r={9} />
            <rect x={288} y={390} width={24} height={30} rx={5} />
          </g>
        </g>
        {/* 信号待ちの人たち */}
        {crowd.map(([x, y, s, c, cd, h], i) => (
          <HmAWalker key={i} x={x} y={y} s={s} f={f} cloth={c} clothDark={cd} hair={h} lean={9} phase={i} />
        ))}
        {/* 鳩 (あなたの足元からよける) */}
        <HmAHato x={hatoX} y={800} s={0.6} f={f} dir={1} />
        {/* あなた */}
        <HmAWalker x={youX} y={youY} s={0.58} f={f} cloth={HP.you} clothDark={HP.youDark} hair="cap" lean={youLean} phase={11} you />
        <TagPlate x={youX} y={youY - 220} text="あなた" size={30} t={seg(f, 30, 36)} fill={HP.you} color={KRP.white} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_001: (f) => <Hm001 f={f} />,
  hm_002: (f) => <Hm002 f={f} />,
  hm_003: (f) => <Hm003 f={f} />,
  hm_004: (f) => <Hm004 f={f} />,
  hm_005: (f) => <Hm005 f={f} />,
  hm_006: (f) => <Hm006 f={f} />,
  hm_007: (f) => <Hm007 f={f} />,
  hm_008: (f) => <Hm008 f={f} />,
  hm_009: (f) => <Hm009 f={f} />,
  hm_010: (f) => <Hm010 f={f} />,
  hm_011: (f) => <Hm011 f={f} />,
};

export const HM_A_MOTIFS: string[] = [
  "hm_001", // #1
  "hm_002", // #2
  "hm_003", // #3
  "hm_004", // #4
  "hm_005", // #5
  "hm_006", // #6
  "hm_007", // #7
  "hm_008", // #8
  "hm_009", // #9
  "hm_010", // #10
  "hm_011", // #11
];

export const himaAScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
