// 人は、なぜ暇をつぶすのか: 文#205〜#215 (11文)
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
  hima: "#F2A65A", // 暇の雲 (橙)
  himaLight: "#F8C78E",
  himaDark: "#C9772E",
  shirt: "#E4EAF2",
  pants: "#4A5568",
  wall208: "#E9D9B8",
  wall208Dark: "#D9C49C",
  counter: "#A8743F",
  counterDark: "#7E5228",
  labelPaper: "#F3E3C0",
  desk: "#B9874F",
  deskDark: "#9E6F3E",
  mat: "#4E8C6E",
  matLine: "#6FA88A",
  cushion: "#D98AA0",
  cushionDark: "#B56A80",
  noWall: "#F2CFC8",
  noWallDark: "#E2ACA6",
  noCeil: "#E3A39D",
  noFloor: "#B98D6E",
  noFloorLine: "#9C7356",
  kibun: "#E8923A", // #180・#184 の気分 (橙) とそろえる (親が修正)
  kibunDark: "#B8652F",
  lampRed: "#FF5A4A",
  night1: "#1C2145",
  night2: "#3A3F73",
  night3: "#5B5A86",
  grass: "#2F4A3A",
  grassLight: "#3D5C48",
  tree: "#22382C",
  path: "#5A5560",
  lampLight: "#FFE9A8",
  benchWood: "#A0683C",
  benchWoodDark: "#7A4A26",
  iron: "#3A3A44",
  hato: "#9AA0A8",
  hatoDark: "#757C86",
  hatoNeck: "#6E9A86",
  boombox: "#5E636B",
  crown: "#E8C440",
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

// カメラ: 画面の中心に (cx,cy) を持ってきて k 倍
const cam = (cx: number, cy: number, k: number) => `translate(960 540) scale(${k}) translate(${-cx} ${-cy})`;

// 腕 (肩→手)。服の色の太い線 + 手の丸
const HmJbArm: React.FC<{ x1: number; y1: number; x2: number; y2: number; w?: number; cloth: string; hand?: boolean }> = ({
  x1, y1, x2, y2, w = 23, cloth, hand = true,
}) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={w + 9} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={w} strokeLinecap="round" />
    {hand && <circle cx={x2} cy={y2} r={w * 0.45} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
  </g>
);

// 暇の雲 (橙のもくもく)。face で小さな顔
const HmJbCloud: React.FC<{
  x: number; y: number; s?: number; fill?: string; face?: "none" | "smile" | "worried" | "surprised"; rot?: number; sq?: number;
}> = ({ x, y, s = 1, fill = C.hima, face = "smile", rot = 0, sq = 1 }) => {
  const P: [number, number, number][] = [[-62, 12, 40], [-24, -20, 50], [30, -14, 46], [66, 12, 36], [0, 22, 44]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (2 - sq)} ${s * sq})`}>
      {P.map(([px, py, r], i) => <circle key={`o${i}`} cx={px} cy={py} r={r + 5} fill={KRP.ink} />)}
      {P.map(([px, py, r], i) => <circle key={`i${i}`} cx={px} cy={py} r={r} fill={fill} />)}
      <circle cx={-26} cy={-30} r={18} fill={C.himaLight} opacity={0.8} />
      {face !== "none" && (
        <g>
          <circle cx={-16} cy={4} r={face === "surprised" ? 6 : 5} fill={KRP.ink} />
          <circle cx={16} cy={4} r={face === "surprised" ? 6 : 5} fill={KRP.ink} />
          {face === "smile" && <path d="M -10 18 Q 0 27 10 18" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />}
          {face === "worried" && <path d="M -10 24 Q 0 17 10 24" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />}
          {face === "surprised" && <ellipse cx={0} cy={22} rx={6} ry={8} fill={KRP.ink} />}
          <ellipse cx={-30} cy={16} rx={8} ry={5} fill={KRP.red} opacity={0.3} />
          <ellipse cx={30} cy={16} rx={8} ry={5} fill={KRP.red} opacity={0.3} />
        </g>
      )}
    </g>
  );
};

// 4つ光の星 (きらり)
const HmJbTwinkle: React.FC<{ x: number; y: number; r: number; color?: string; op?: number }> = ({ x, y, r, color = HP.screenCore, op = 1 }) => (
  <path d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`}
    fill={color} opacity={op} />
);

// 暇の貯金箱 (大きな透明な瓶)。#208・#209 で同じ瓶。x=中心, y=底
const HmJbJar: React.FC<{ x: number; y: number; s?: number; level: number; f: number; bulge?: number; lidOff?: boolean; id: string }> = ({
  x, y, s = 1, level, f, bulge = 0, lidOff = false, id,
}) => {
  const body = "M -230 0 Q -264 0 -264 -40 L -264 -470 Q -264 -560 -180 -590 L -180 -640 L 180 -640 L 180 -590 Q 264 -560 264 -470 L 264 -40 Q 264 0 230 0 Z";
  const surf = -24 - 596 * clamp01(level);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.06 * bulge)} ${s})`}>
      <defs><clipPath id={id}><path d={body} /></clipPath></defs>
      <ellipse cx={0} cy={6} rx={300} ry={26} fill={KRP.ink} opacity={0.22} />
      <path d={body} fill={KRP.blueSoft} opacity={0.35} />
      <g clipPath={`url(#${id})`}>
        {level > 0 && (
          <g>
            <rect x={-280} y={surf} width={560} height={-surf + 10} fill={C.hima} />
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={i} cx={-270 + i * 60} cy={surf + 8 + Math.sin(f / 6 + i * 1.3) * 5} r={40} fill={C.hima} stroke={C.himaDark} strokeWidth={4} />
            ))}
            <rect x={-280} y={surf + 20} width={560} height={-surf} fill={C.hima} />
            {[[-150, -80, 46], [60, -150, 54], [170, -60, 40], [-60, -260, 50], [150, -330, 44], [-170, -400, 48], [20, -470, 46], [-110, -540, 40], [140, -560, 38]].map(([cx, cy, r], i) =>
              cy > surf + 50 ? <circle key={i} cx={cx} cy={cy} r={r} fill={C.himaLight} opacity={0.65} /> : null)}
          </g>
        )}
        {/* 目盛り (ガラスに印刷) */}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i % 2 ? 214 : 196} y1={-60 - i * 54} x2={240} y2={-60 - i * 54} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
        ))}
        <line x1={190} y1={-600} x2={240} y2={-600} stroke={KRP.red} strokeWidth={7} />
      </g>
      {/* ガラスの照り */}
      <path d="M -220 -60 L -220 -460 Q -220 -520 -170 -548" stroke={KRP.white} strokeWidth={16} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M -180 -80 L -180 -200" stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.45} strokeLinecap="round" />
      <path d={body} fill="none" stroke={KRP.ink} strokeWidth={8} />
      {/* ラベル */}
      <g transform="rotate(-3 0 -300)">
        <rect x={-112} y={-400} width={224} height={190} rx={10} fill={C.labelPaper} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-96} y={-386} width={192} height={162} rx={6} fill="none" stroke={HP.hiDark} strokeWidth={3} />
        <text x={0} y={-262} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={HP.hiDark}>暇</text>
      </g>
      {/* ふた (真鍮・お金を入れる口) */}
      <g transform={lidOff ? "translate(-150 -760) rotate(-20)" : undefined}>
        <rect x={-200} y={-692} width={400} height={56} rx={14} fill={HP.brass} stroke={KRP.ink} strokeWidth={7} />
        {[-150, -90, -30, 30, 90, 150].map((lx) => <line key={lx} x1={lx} y1={-686} x2={lx} y2={-642} stroke={HP.brassDark} strokeWidth={4} />)}
        <ellipse cx={0} cy={-692} rx={200} ry={20} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-74} y={-699} width={148} height={14} rx={7} fill={KRP.ink} />
      </g>
    </g>
  );
};

// 鳩
const HmJbHato: React.FC<{ x: number; y: number; s?: number; f: number; flip?: boolean }> = ({ x, y, s = 1, f, flip = false }) => {
  const peck = (f % 16) < 5 ? 1 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <line x1={-6} y1={-6} x2={-10} y2={0} stroke="#D98A8A" strokeWidth={5} strokeLinecap="round" />
      <line x1={10} y1={-6} x2={12} y2={0} stroke="#D98A8A" strokeWidth={5} strokeLinecap="round" />
      <path d="M 40 -30 L 78 -20 L 44 -14 Z" fill={C.hatoDark} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={4} cy={-30} rx={44} ry={26} fill={C.hato} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -6 -44 Q 30 -48 46 -26 Q 20 -20 -6 -30 Z" fill={C.hatoDark} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`translate(${-34 - peck * 10} ${-48 + peck * 26})`}>
        <path d="M 12 10 Q 4 -6 -2 -10" stroke={C.hatoNeck} strokeWidth={14} fill="none" />
        <circle cx={0} cy={-14} r={15} fill={C.hato} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-4} cy={-17} r={3.5} fill={KRP.orange} stroke={KRP.ink} strokeWidth={1.5} />
        <path d="M -14 -14 L -24 -10 L -14 -8 Z" fill="#E7C9A8" stroke={KRP.ink} strokeWidth={2.5} />
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #205 そしてポケットの道具が、「秒」の暇にまで、入りこみました。
// 格: 並 / seed 5205
// 絵: どこ: #201 の作業机 (「秒」の区画)。演出: Monosashi (lit=4, focus=3)。「秒」の細かい目盛りの溝に、スマホがすっぽり入りこんで光る。捜索係が虫めがねでのぞく。動き: スマホが入りこむ / 光 / 区画が光る
// どこ: #201 からの作業机。ものさし (lit=4, focus=3) の「秒」の区画へカメラが寄る
// 演出: 上から落ちてきたスマホが、秒の区画の上の縁の「差しこみ口」へ貯金箱の硬貨のようにすぽっと入りこむ。
//       秒の40本の細い目盛りが、中からスマホの光で青白く光る。机の上の小さな捜索係が虫めがねでのぞいて、びっくり
// 動き: カメラが秒へ寄る / スマホが落ちて入りこむ (すぽっの煙) / 目盛りが光る / 光の筋
const Hm205: React.FC<{ f: number }> = ({ f }) => {
  const cz = easeInOut(seg(f, 0, 28));
  const k = lerp(1, 1.32, cz);
  const cx = lerp(960, 1310, cz), cy = lerp(540, 520, cz);
  const drop = easeOut(seg(f, 6, 22));
  const sink = easeInOut(seg(f, 22, 32));
  const SX = 1485, SLOT = 487;
  const py = lerp(60, 410, drop) + 110 * sink;
  const prot = (1 - sink) * (8 * Math.sin(f / 3)) * (1 - drop * 0.6);
  const glow = seg(f, 28, 40);
  const puff = seg(f, 30, 40);
  const pulse = 0.75 + 0.25 * Math.sin(f / 3);
  return (
    <Frame f={f} seed={5205}>
      <g transform={cam(cx, cy, k)}>
        <rect x={1900} y={-40} width={400} height={420} fill="#D9CDB4" />
        <rect x={1900} y={380} width={400} height={760} fill="#B9874F" />
        <Sagyozukue f={f} />
        {/* 机の上 (ものさしの奥) に立つ小さな捜索係 */}
        <Sousa x={1190} y={472} s={0.5} f={f} face={glow > 0.2 ? "surprised" : "normal"} pose="stand" lean={6}
          gaze={[5, 3]} lensAt={[1420, 448]} />
        <Monosashi x={960} y={560} s={1} lit={4} f={f} focus={3} />
        {/* 差しこみ口 */}
        <ellipse cx={SX} cy={SLOT} rx={66} ry={10} fill={KRP.ink} />
        <ellipse cx={SX} cy={SLOT - 2} rx={58} ry={6} fill={glow > 0 ? HP.screenCore : "#2A2420"} opacity={glow > 0 ? 0.6 + 0.4 * glow : 1} />
        {/* 秒の目盛りが内側から光る */}
        {glow > 0 && (
          <g opacity={glow}>
            <rect x={1314} y={492} width={342} height={136} rx={14} fill={HP.screen} opacity={0.35 * pulse} />
            {Array.from({ length: 41 }, (_, i) => {
              const tx = 1330 + 7.75 * i;
              const big = i % 10 === 0;
              return <line key={i} x1={tx} y1={525} x2={tx} y2={525 + (big ? 70 : 30)} stroke={HP.screenCore} strokeWidth={big ? 4 : 2}
                opacity={0.6 + 0.4 * Math.sin(f / 2 + i * 0.7)} />;
            })}
            {Array.from({ length: 7 }, (_, i) => {
              const a = (-150 + i * 20) * Math.PI / 180;
              const L = (70 + 40 * Math.sin(f / 4 + i)) * glow;
              return <line key={`r${i}`} x1={SX + Math.cos(a) * 60} y1={SLOT + Math.sin(a) * 14} x2={SX + Math.cos(a) * (60 + L)} y2={SLOT + Math.sin(a) * (14 + L)}
                stroke={HP.screen} strokeWidth={7} strokeLinecap="round" opacity={0.85} />;
            })}
            <HmJbTwinkle x={1360} y={470} r={16 * glow} op={pulse} />
            <HmJbTwinkle x={1620} y={460} r={12 * glow} op={1 - pulse * 0.5} />
          </g>
        )}
        {/* スマホ (差しこみ口より上だけ見える) */}
        <defs><clipPath id="hmjb205clip"><rect x={1250} y={-200} width={500} height={SLOT + 200} /></clipPath></defs>
        {drop > 0 && sink < 1 && drop < 1 && (
          <g stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
            {[-30, 0, 30].map((dx) => <line key={dx} x1={SX + dx} y1={py - 150} x2={SX + dx} y2={py - 210} />)}
          </g>
        )}
        <g clipPath="url(#hmjb205clip)">
          <Sumaho x={SX} y={py} s={0.5} rot={prot} f={f} screen="on" glow={0.6 + 0.4 * glow} />
        </g>
        {/* すぽっ の煙 */}
        {puff > 0 && puff < 1 && (
          <g opacity={(1 - puff) * 0.9}>
            {[-1, 1].map((d) => [0, 1, 2].map((j) => (
              <circle key={`${d}${j}`} cx={SX + d * (70 + puff * 50 + j * 22)} cy={SLOT - 10 - j * 14 - puff * 20} r={10 + puff * 10}
                fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} />
            )))}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #206 日本の会社で働く人の休みは、1985年に、年に約93日。
// 格: 図 / seed 5206
// 絵: どこ: 序の #13 と同じ会社の休憩室のホワイトボード (同じマグネット・付箋)。演出: 「1985年」の棒 (約93日) が下から伸びる。棒の横に、1985年らしい小物 (ラジカセのマグネット)。札「1985年」「約93日」。動き: 棒が伸びる / マグネット
// どこ: 序 #13 と同じ休憩室のホワイトボード (KyukeiBoard)
// 演出: 赤いマーカーが自分で「1985年」の棒を下から塗り上げていく (約93日)。塗り終わると、横にラジカセのマグネットが
//       ぱちんと貼りつき、音符がぴょこぴょこ出る。右には2025年の空き枠 (点線と「?」)
// 動き: 棒が伸びる (マーカーが登る) / ラジカセが貼りつく / 音符
const B_BASE = 650, B_PX = 3.4, B_X85 = 760, B_X25 = 1160, B_W = 200;
const HmJbBar: React.FC<{ cx: number; days: number; p: number; id: string; color: string; dark: string }> = ({ cx, days, p, id, color, dark }) => {
  const h = days * B_PX * p;
  if (h <= 0) return null;
  const x0 = cx - B_W / 2, y0 = B_BASE - h;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x0} y={y0} width={B_W} height={h} /></clipPath></defs>
      <rect x={x0} y={y0} width={B_W} height={h} fill={color} opacity={0.85} />
      <g clipPath={`url(#${id})`} stroke={dark} strokeWidth={6} opacity={0.5}>
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={x0 - 200} y1={B_BASE - i * 26} x2={x0 + 260} y2={B_BASE - i * 26 - 200} />)}
      </g>
      <rect x={x0} y={y0} width={B_W} height={h} fill="none" stroke={dark} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};
const HmJbChartBase: React.FC<{ ghost25?: boolean; f: number }> = ({ ghost25 = false, f }) => (
  <g>
    {/* 方眼のうす線 (数字は書かない) */}
    <g stroke={KRP.blue} strokeWidth={3} opacity={0.45} strokeDasharray="10 10">
      {[1, 2, 3, 4].map((i) => <line key={i} x1={450} y1={B_BASE - i * 100} x2={1470} y2={B_BASE - i * 100} />)}
    </g>
    <line x1={440} y1={B_BASE} x2={1480} y2={B_BASE} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={450} y1={B_BASE} x2={450} y2={190} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
    {ghost25 && (
      <g opacity={0.55 + 0.1 * Math.sin(f / 8)}>
        <rect x={B_X25 - B_W / 2} y={300} width={B_W} height={B_BASE - 300} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="16 12" />
      </g>
    )}
  </g>
);
const HmJbRajikase: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={4} cy={58} rx={96} ry={10} fill={KRP.ink} opacity={0.15} />
    <path d="M -50 -50 L -50 -74 L 50 -74 L 50 -50" stroke={KRP.ink} strokeWidth={9} fill="none" strokeLinejoin="round" />
    <rect x={-96} y={-52} width={192} height={106} rx={14} fill={C.boombox} stroke={KRP.ink} strokeWidth={6} />
    {[-58, 58].map((sx) => (
      <g key={sx}>
        <circle cx={sx} cy={6} r={32 + (Math.floor(f / 4) % 2) * 2} fill="#3A3E45" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={sx} cy={6} r={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
    <rect x={-22} y={-10} width={44} height={34} rx={4} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
    <circle cx={-10} cy={7} r={6} fill="none" stroke={KRP.ink} strokeWidth={2.5} />
    <circle cx={10} cy={7} r={6} fill="none" stroke={KRP.ink} strokeWidth={2.5} />
    {[-70, -46, -22, 2, 26].map((bx) => <rect key={bx} x={bx} y={-46} width={18} height={10} rx={2} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />)}
    <circle cx={70} cy={-40} r={6} fill={KRP.red} opacity={0.5 + 0.5 * (Math.floor(f / 6) % 2)} />
  </g>
);
const HmJbNote: React.FC<{ x: number; y: number; s?: number; color: string }> = ({ x, y, s = 1, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={13} ry={10} fill={color} stroke={KRP.ink} strokeWidth={3} transform="rotate(-20)" />
    <line x1={11} y1={-3} x2={11} y2={-44} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 11 -44 q 14 6 16 20" stroke={KRP.ink} strokeWidth={4} fill="none" />
  </g>
);
const HmJbMarker: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 30 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -9 0 L 9 0 L 6 -16 L -6 -16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-16} y={-120} width={32} height={104} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-16} y={-60} width={32} height={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-18} y={-150} width={36} height={34} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Hm206: React.FC<{ f: number }> = ({ f }) => {
  const g = easeOut(seg(f, 4, 26));
  const topY = B_BASE - 93 * B_PX * g;
  const mkOut = seg(f, 26, 34);
  const mag = seg(f, 24, 32);
  const z = easeInOut(seg(f, 0, 36));
  return (
    <Frame f={f} seed={5206}>
      <g transform={cam(lerp(960, 900, z), lerp(540, 480, z), lerp(1, 1.06, z))}>
        <KyukeiBoard f={f} />
        <HmJbChartBase ghost25 f={f} />
        <QMark x={B_X25} y={470} s={0.7} f={f} t={seg(f, 10, 20)} color={KRP.grayDark} />
        <HmJbBar cx={B_X85} days={93} p={g} id="hmjb206a" color={HP.restSoft} dark={HP.rest} />
        {/* マーカーが棒を塗り上げる */}
        {mkOut < 1 && g > 0 && (
          <g opacity={1 - mkOut} transform={`translate(${mkOut * 120} ${-mkOut * 80})`}>
            <HmJbMarker x={B_X85 + 70 + Math.sin(f * 1.4) * 20} y={topY + 4} rot={28} />
          </g>
        )}
        {/* ラジカセのマグネット */}
        {mag > 0 && (
          <g transform={`translate(560 ${lerp(380, 470, easeOut(mag))}) scale(${pop(mag)}) rotate(${(1 - mag) * -25 + Math.sin(f / 5) * 1.5})`}>
            <HmJbRajikase x={0} y={0} s={0.95} f={f} />
          </g>
        )}
        {mag >= 1 && [0, 1, 2].map((i) => {
          const t = ((f + i * 7) % 21) / 21;
          return <g key={i} opacity={1 - t}><HmJbNote x={560 + (i - 1) * 40 + Math.sin(t * 6 + i) * 12} y={400 - t * 120} s={0.9}
            color={[KRP.yellow, KRP.green, KRP.orange][i]} /></g>;
        })}
        <TagPlate x={B_X85} y={690} text="1985年" size={34} t={seg(f, 2, 10)} />
        <TagPlate x={B_X85} y={560} text="約93日" size={32} t={seg(f, 26, 34)} color={HP.rest} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #207 2025年の調査では、約117日。この40年で、いちばん多くなりました。
// 格: 図 / seed 5207
// 絵: どこ: #206 のホワイトボード (続き)。演出: 「2025年」の棒が伸びて、1985年の棒を追い越し、てっぺんに王冠のマグネット (#13 と同じ)。札「2025年」「約117日」。会社員が拍手。動き: 棒が伸びる / 王冠 / 拍手
// どこ: #206 と同じホワイトボード (続き)。1985年の棒とラジカセはそのまま
// 演出: 1985年の棒の高さに点線が引かれ、2025年の棒がぐんぐん伸びてその線を突き破る (きらっ)。
//       てっぺんに王冠のマグネットがぽんと落ちてはまる。ボードの両側で会社員2人が大よろこびで拍手
// 動き: 棒が伸びる / 点線を追い越す火花 / 王冠が落ちてはずむ / 拍手と紙ふぶき
const HmJbCrown: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={8} r={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -70 30 L -80 -40 L -40 -6 L 0 -56 L 40 -6 L 80 -40 L 70 30 Z" fill={C.crown} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-72} y={18} width={144} height={22} rx={6} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={5} />
    {[-80, 0, 80].map((cx, i) => <circle key={cx} cx={cx} cy={i === 1 ? -60 : -44} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />)}
    <circle cx={-36} cy={28} r={6} fill={KRP.blueDeep} /><circle cx={36} cy={28} r={6} fill={KRP.green} />
    <path d="M -50 0 L -56 -20" stroke={KRP.white} strokeWidth={5} opacity={0.6} strokeLinecap="round" />
  </g>
);
const HmJbClapper: React.FC<{ x: number; y: number; s: number; f: number; on: boolean; phase: number; glasses?: boolean }> = ({ x, y, s, f, on, phase, glasses }) => {
  const hop = on ? -Math.abs(Math.sin((f + phase * 3) / 3)) * 10 : 0;
  const clap = on && Math.floor((f + phase * 2) / 4) % 2 === 0;
  const hy = y + hop - 118 * s;
  return (
    <g>
      <Person x={x} y={y + hop} s={s} f={f} face={on ? "joy" : "surprised"} pose="hold" cloth={C.shirt} clothDark={C.pants}
        glasses={glasses} phase={phase} gaze={[x < 960 ? 5 : -5, -4]} />
      {/* ネクタイ */}
      <path d={`M ${x} ${y + hop - 160 * s} l ${-9 * s} ${14 * s} l ${9 * s} ${60 * s} l ${9 * s} ${-60 * s} Z`} fill={phase % 2 ? KRP.red : KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
      {clap && (
        <g stroke={KRP.orange} strokeWidth={6} strokeLinecap="round">
          {[-60, -20, 20, 60].map((a) => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={x + Math.sin(r) * 34} y1={hy - Math.cos(r) * 34} x2={x + Math.sin(r) * 58} y2={hy - Math.cos(r) * 58} />;
          })}
        </g>
      )}
    </g>
  );
};
const Hm207: React.FC<{ f: number }> = ({ f }) => {
  const g = easeOut(seg(f, 4, 26));
  const h = 117 * B_PX * g;
  const passed = h > 93 * B_PX;
  const burst = passed ? 1 - seg(f, 20, 32) : 0;
  const cr = seg(f, 26, 34);
  const crY = lerp(60, B_BASE - 117 * B_PX - 38, easeOut(cr));
  const happy = f >= 30;
  const z = easeInOut(seg(f, 0, 30));
  const line93 = B_BASE - 93 * B_PX;
  return (
    <Frame f={f} seed={5207}>
      <g transform={cam(lerp(900, 1010, z), lerp(480, 500, z), 1.04)}>
        <KyukeiBoard f={f} />
        <HmJbChartBase f={f} />
        <HmJbBar cx={B_X85} days={93} p={1} id="hmjb207a" color={HP.restSoft} dark={HP.rest} />
        <g transform={`translate(560 470) rotate(${Math.sin(f / 5) * 1.5})`}><HmJbRajikase x={0} y={0} s={0.95} f={f} /></g>
        {/* 1985年の高さの点線 */}
        <line x1={B_X85 + B_W / 2} y1={line93} x2={lerp(B_X85 + B_W / 2, B_X25 + B_W / 2 + 30, seg(f, 0, 8))} y2={line93}
          stroke={HP.rest} strokeWidth={5} strokeDasharray="14 10" />
        <HmJbBar cx={B_X25} days={117} p={g} id="hmjb207b" color={HP.restSoft} dark={HP.rest} />
        {burst > 0 && (
          <g opacity={burst}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const r = 40 + (1 - burst) * 50;
              return <line key={i} x1={B_X25 + Math.cos(a) * r * 0.5} y1={line93 + Math.sin(a) * r * 0.5} x2={B_X25 + Math.cos(a) * r} y2={line93 + Math.sin(a) * r}
                stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" />;
            })}
            <HmJbTwinkle x={B_X25 + 110} y={line93 - 10} r={22} color={KRP.yellow} />
          </g>
        )}
        {cr > 0 && <g transform={`translate(${B_X25} ${crY}) scale(${0.8 + 0.2 * pop(cr)}) rotate(${(1 - cr) * 30})`}><HmJbCrown x={0} y={0} s={0.9} /></g>}
        {happy && Array.from({ length: 16 }, (_, i) => {
          const t = ((f - 30) * 6 + rnd(5207, i) * 300) % 520;
          return <rect key={i} x={B_X25 - 300 + rnd(207, i) * 600 + Math.sin(f / 4 + i) * 14} y={130 + t} width={14} height={20}
            fill={[KRP.red, KRP.yellow, KRP.green, KRP.blueDeep][i % 4]} transform={`rotate(${f * 8 + i * 40} ${B_X25 - 300 + rnd(207, i) * 600} ${130 + t})`} opacity={0.85} />;
        })}
        <TagPlate x={B_X85} y={690} text="1985年" size={34} />
        <TagPlate x={B_X25} y={690} text="2025年" size={34} t={seg(f, 2, 10)} />
        <TagPlate x={B_X85} y={560} text="約93日" size={32} color={HP.rest} />
        <TagPlate x={B_X25} y={560} text="約117日" size={32} t={seg(f, 24, 32)} color={HP.rest} />
        <HmJbClapper x={215} y={945} s={0.95} f={f} on={happy} phase={1} />
        <HmJbClapper x={1730} y={945} s={0.95} f={f} on={happy} phase={2} glasses />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #208 暇は、ちゃんと増えています。
// 格: 山 / seed 5208
// 絵: どこ: 大きな透明な瓶 (暇の貯金箱)。演出: 瓶の中に、橙の「暇」の雲がどんどん入っていき、瓶がいっぱいにふくらむ。瓶の横の目盛りが上がっていく。捜索係が満足げにうなずく。動き: 雲が入っていく / 目盛りが上がる / うなずく
// どこ: 古い納戸の木のカウンター。上から下がるランプ、左の壁に棚と空の小瓶。真ん中に大きな透明な瓶「暇の貯金箱」
// 演出: 橙の「暇」の雲が、画面の左右から次々とすべりこんできて、ふたの差しこみ口へにゅるんと吸いこまれる。
//       瓶の中の雲がもくもく増え、横の目盛りの赤い矢印が上がり、瓶がぎゅうっとふくらむ。
//       カウンターの上の捜索係が虫めがねで目盛りを見ながら、うんうんと満足げにうなずく
// 動き: 雲が飛びこむ / 中身と矢印が上がる / 瓶がふくらむ / うなずく
const Hm208: React.FC<{ f: number }> = ({ f }) => {
  const lv = lerp(0.12, 0.9, easeInOut(seg(f, 2, 40)));
  const bulge = seg(f, 28, 42);
  const JX = 900, JB = 800, JS = 0.98;
  const surfY = JB + (-24 - 596 * lv) * JS;
  const slotX = JX, slotY = JB - 692 * JS;
  const nod = f > 16 ? Math.sin(f / 4) * 4 : 0;
  const z = easeInOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={5208}>
      <g transform={cam(960, lerp(540, 520, z), lerp(1.0, 1.05, z))}>
        {/* 壁 (縦じまの壁紙) */}
        <rect x={-40} y={-40} width={2000} height={900} fill={C.wall208} />
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-40 + i * 86} y={-40} width={28} height={900} fill={C.wall208Dark} opacity={0.5} />)}
        {/* 左の棚と空の小瓶 */}
        <rect x={60} y={360} width={420} height={26} fill={C.counter} stroke={KRP.ink} strokeWidth={6} />
        {[[80, 386], [440, 386]].map(([bx, by], i) => <path key={i} d={`M ${bx} ${by} l 0 40 l 30 0 Z`} fill={C.counterDark} stroke={KRP.ink} strokeWidth={4} />)}
        {[[140, 70], [250, 90], [370, 60]].map(([bx, bh], i) => (
          <g key={i}>
            <rect x={bx - 34} y={360 - bh} width={68} height={bh} rx={12} fill={KRP.blueSoft} opacity={0.5} stroke={KRP.ink} strokeWidth={5} />
            <rect x={bx - 26} y={360 - bh - 16} width={52} height={18} rx={5} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${bx - 20} ${360 - bh + 12} l 0 ${bh - 26}`} stroke={KRP.white} strokeWidth={5} opacity={0.6} />
          </g>
        ))}
        {/* 右の壁の古い時計 (ふりこ) */}
        <g transform="translate(1660 250)">
          <rect x={-70} y={-110} width={140} height={300} rx={20} fill={C.counter} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-40} r={50} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-40} x2={0} y2={-74} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={0} y1={-40} x2={24} y2={-30} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <g transform={`rotate(${Math.sin(f / 6) * 14} 0 20)`}>
            <line x1={0} y1={20} x2={0} y2={140} stroke={HP.brassDark} strokeWidth={5} />
            <circle cx={0} cy={146} r={18} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 吊りランプ */}
        <line x1={JX} y1={-40} x2={JX} y2={10} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${JX - 70} 50 Q ${JX} -10 ${JX + 70} 50 Z`} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`${JX - 60},50 ${JX + 60},50 ${JX + 420},800 ${JX - 420},800`} fill={HP.spark} opacity={0.08 + 0.02 * Math.sin(f / 5)} />
        {/* カウンター */}
        <rect x={-40} y={JB} width={2000} height={340} fill={C.counter} />
        <rect x={-40} y={JB - 12} width={2000} height={26} fill={C.counterDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.counterDark} strokeWidth={4} opacity={0.6} fill="none">
          {[0, 1, 2].map((i) => <path key={i} d={`M -40 ${JB + 60 + i * 70} q 500 12 1000 0 q 500 -12 1000 0`} />)}
        </g>
        {/* 瓶 */}
        <HmJbJar x={JX} y={JB} s={JS} level={lv} f={f} bulge={bulge} id="hmjb208jar" />
        {/* ふくらむ「ぎゅう」の線 */}
        {bulge > 0.3 && [-1, 1].map((d) => (
          <g key={d} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={bulge}>
            {[0, 1, 2].map((j) => <path key={j} d={`M ${JX + d * (300 + j * 4)} ${380 + j * 60} q ${d * 18} 20 0 40`} fill="none" />)}
          </g>
        ))}
        {/* 目盛りの赤い矢印 */}
        <g transform={`translate(${JX + 278} ${surfY})`}>
          <path d="M 0 0 L 34 -18 L 34 18 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <rect x={34} y={-7} width={40} height={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 飛びこんでくる暇の雲 */}
        {Array.from({ length: 7 }, (_, i) => {
          const t = seg(f, 1 + i * 6, 11 + i * 6);
          if (t <= 0 || t >= 1) return null;
          const left = i % 2 === 0;
          const x0 = left ? -160 : 2080, y0 = 180 + (i % 3) * 60;
          const qx = left ? 420 : 1400, qy = -40;
          const tt = easeInOut(t);
          const bx = (1 - tt) * (1 - tt) * x0 + 2 * (1 - tt) * tt * qx + tt * tt * slotX;
          const by = (1 - tt) * (1 - tt) * y0 + 2 * (1 - tt) * tt * qy + tt * tt * (slotY - 10);
          const sq = t > 0.8 ? lerp(1, 0.55, (t - 0.8) / 0.2) : 1;
          const sc = t > 0.85 ? lerp(0.75, 0.3, (t - 0.85) / 0.15) : 0.75;
          return (
            <g key={i}>
              <path d={`M ${bx + (left ? -60 : 60)} ${by} l ${left ? -70 : 70} ${-8}`} stroke={C.himaDark} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
              <HmJbCloud x={bx} y={by} s={sc} sq={sq} face="smile" />
            </g>
          );
        })}
        {/* 捜索係 (カウンターの上) */}
        <Sousa x={1360} y={JB} s={0.82} f={f} face="smile" lean={nod} gaze={[-5, -3]} />
        {f > 18 && Math.floor(f / 8) % 2 === 0 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d="M 1440 520 q 14 -10 28 0" /><path d="M 1452 490 q 14 -10 28 0" />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #209 ただ、増えたそばから細かく切られて、すみずみまで、埋まっていきました。
// 格: 山 / seed 5209
// 絵: どこ: #208 の瓶 (続き)。演出: 瓶から出てきた大きな雲が、ものさしの目盛り (日→時間→分→秒) に**ハサミで次々と細かく切られ**、小さなかけらになったそばから、スマホの光の粒がひとつずつ飛びついて埋めていく (パズルのピースがはまる)。動き: ハサミで切る / かけら / 光の粒が埋める
// どこ: 作業台の上の緑のカッティングマット。左に #208 の瓶 (ふたが外れている)
// 演出: 瓶からにゅるっと出た長い暇の雲が、マットの上の4色の切り取り線 (日→時間→分→秒、だんだん細かく) の上に横たわる。
//       大きなハサミが左から右へじょきじょき進み、雲を 2→6→15→40 のかけらに切っていく。
//       切れたかけらには、上から光の粒がひとつずつ飛びついて、パズルのピースのようにはまって青白く光る。
//       瓶の口の雲は「えっ」という顔
// 動き: ハサミが進む・開閉 / かけらが離れる / 光の粒が飛びついて埋まる / カメラが右へパン
const Z_X = [470, 800, 1130, 1460, 1790];
const Z_N = [2, 6, 15, 40];
const Z_KEY = ["hi", "jikan", "fun", "byo"] as const;
const Z_NAME = ["日", "時間", "分", "秒"];
const HmJbScissors: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => (
  <g transform={`translate(${x} ${y})`}>
    {[1, -1].map((d) => (
      <g key={d} transform={`rotate(${d * open})`}>
        <path d={`M ${-14 * d} -6 Q ${-20 * d} 100 0 214 Q ${10 * d} 100 ${16 * d} -6 Z`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${-4 * d} 10 L 0 190`} stroke={KRP.white} strokeWidth={4} opacity={0.7} />
        <path d={`M 0 0 L ${-30 * d} -96`} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
        <path d={`M 0 0 L ${-30 * d} -96`} stroke={KRP.red} strokeWidth={13} strokeLinecap="round" />
        <ellipse cx={-48 * d} cy={-142} rx={34} ry={46} fill="none" stroke={KRP.ink} strokeWidth={22} />
        <ellipse cx={-48 * d} cy={-142} rx={34} ry={46} fill="none" stroke={KRP.red} strokeWidth={13} />
      </g>
    ))}
    <circle r={13} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Hm209: React.FC<{ f: number }> = ({ f }) => {
  const RY = 460, RH = 170;
  const sp = seg(f, 2, 36);
  const sx = lerp(470, 1800, sp);
  const cutF = (bx: number) => 2 + 34 * ((bx - 470) / 1330);
  const open = 6 + 10 * Math.abs(Math.sin(f * 0.8));
  const z = easeInOut(seg(f, 0, 40));
  // かけら一覧
  const pieces: { x: number; w: number; z: number; j: number; fc: number }[] = [];
  Z_N.forEach((n, zi) => {
    const w = (Z_X[zi + 1] - Z_X[zi]) / n;
    for (let j = 0; j < n; j++) {
      const px = Z_X[zi] + j * w;
      pieces.push({ x: px, w, z: zi, j, fc: cutF(px + w) });
    }
  });
  return (
    <Frame f={f} seed={5209}>
      <g transform={cam(lerp(880, 1060, z), 520, 1.03)}>
        {/* 作業台 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -40 ${40 + i * 160} q 480 ${rnd(9, i) * 30 - 15} 1000 0 q 480 ${rnd(8, i) * 30 - 15} 1000 0`} />)}
        </g>
        {/* マット */}
        <rect x={410} y={250} width={1480} height={500} rx={14} fill={C.mat} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.matLine} strokeWidth={2.5} opacity={0.8}>
          {Array.from({ length: 37 }, (_, i) => <line key={`v${i}`} x1={430 + i * 40} y1={262} x2={430 + i * 40} y2={738} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1={422} y1={270 + i * 40} x2={1878} y2={270 + i * 40} />)}
        </g>
        {/* 4色の切り取り線 */}
        {pieces.map((p, i) => p.j > 0 && (
          <line key={`c${i}`} x1={p.x} y1={340} x2={p.x} y2={580} stroke={HP[Z_KEY[p.z]]} strokeWidth={p.z === 3 ? 2.5 : 5}
            strokeDasharray={p.z === 3 ? "5 5" : "12 8"} />
        ))}
        {Z_X.map((bx, i) => <line key={`b${i}`} x1={bx} y1={320} x2={bx} y2={600} stroke={KRP.white} strokeWidth={6} />)}
        {/* 小物: 鉛筆・テープ */}
        <g transform="rotate(-8 230 180)">
          <rect x={60} y={160} width={300} height={30} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 360 160 L 410 175 L 360 190 Z" fill="#E7C9A8" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={1760} cy={150} r={64} fill="#9FC8C0" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1760} cy={150} r={30} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
        {/* 瓶と、口から出てくる雲 */}
        <HmJbJar x={230} y={800} s={0.42} level={0.8} f={f} lidOff id="hmjb209jar" />
        {[[230, 500, 66], [300, 470, 74], [380, 462, 82], [450, 460, 84]].map(([cx, cy, r], i) => <circle key={`no${i}`} cx={cx} cy={cy} r={r + 6} fill={KRP.ink} />)}
        {[[230, 500, 66], [300, 470, 74], [380, 462, 82], [450, 460, 84]].map(([cx, cy, r], i) => <circle key={`ni${i}`} cx={cx} cy={cy} r={r} fill={C.hima} />)}
        {/* まだ切られていない部分 */}
        {sx < 1790 && (
          <g>
            <defs><clipPath id="hmjb209rest"><rect x={sx} y={200} width={1800} height={500} /></clipPath></defs>
            <g clipPath="url(#hmjb209rest)">
              <rect x={460} y={RY - RH / 2 - 6} width={1336} height={RH + 12} rx={20} fill={KRP.ink} />
              {Array.from({ length: 31 }, (_, i) => <circle key={`ot${i}`} cx={470 + i * 44} cy={RY - RH / 2 + 4} r={30} fill={KRP.ink} />)}
              {Array.from({ length: 31 }, (_, i) => <circle key={`ob${i}`} cx={470 + i * 44} cy={RY + RH / 2 - 4} r={30} fill={KRP.ink} />)}
              <circle cx={1790} cy={RY} r={92} fill={KRP.ink} />
              <rect x={460} y={RY - RH / 2} width={1336} height={RH} fill={C.hima} />
              {Array.from({ length: 31 }, (_, i) => <circle key={`it${i}`} cx={470 + i * 44} cy={RY - RH / 2 + 4} r={25} fill={C.hima} />)}
              {Array.from({ length: 31 }, (_, i) => <circle key={`ib${i}`} cx={470 + i * 44} cy={RY + RH / 2 - 4} r={25} fill={C.hima} />)}
              <circle cx={1790} cy={RY} r={86} fill={C.hima} />
              {Array.from({ length: 10 }, (_, i) => <circle key={`l${i}`} cx={520 + i * 135} cy={RY - 30 + (i % 2) * 40} r={30} fill={C.himaLight} opacity={0.6} />)}
            </g>
          </g>
        )}
        {/* 切られたかけら */}
        {pieces.map((p, i) => {
          if (sx < p.x + p.w) return null;
          const gap = p.z === 3 ? 1.6 : p.z === 2 ? 4 : 7;
          const dy = (rnd(5209, i) - 0.5) * 16 + 8;
          const ft = seg(f, p.fc + 2, p.fc + 6);
          const x0 = p.x + gap, w = p.w - gap * 2;
          return (
            <g key={`p${i}`} transform={`translate(0 ${dy * (1 - ft * 0.7)}) rotate(${(rnd(29, i) - 0.5) * 6 * (1 - ft)} ${p.x + p.w / 2} ${RY})`}>
              {ft > 0 && <rect x={x0 - 6} y={RY - RH / 2 - 6} width={w + 12} height={RH + 12} rx={10} fill={HP.screen} opacity={0.35 * ft} />}
              <rect x={x0} y={RY - RH / 2} width={w} height={RH} rx={Math.min(10, w / 2)}
                fill={ft >= 1 ? HP.screen : C.hima} stroke={KRP.ink} strokeWidth={p.z === 3 ? 2.5 : 5} />
              {ft > 0 && ft < 1 && <rect x={x0} y={RY - RH / 2} width={w} height={RH} rx={Math.min(10, w / 2)} fill={HP.screen} opacity={ft} />}
              {ft >= 1 && w > 14 && <rect x={x0 + w * 0.2} y={RY - RH / 2 + 14} width={w * 0.6} height={RH - 28} rx={6} fill={HP.screenCore} opacity={0.7} />}
              {p.w > 30 && <circle cx={x0 + w / 2} cy={RY - RH / 2 - 2} r={Math.min(18, w / 5)} fill={ft >= 1 ? HP.screen : C.hima} stroke={KRP.ink} strokeWidth={4} />}
            </g>
          );
        })}
        {/* 飛びついてくる光の粒 */}
        {pieces.map((p, i) => {
          const t = seg(f, p.fc, p.fc + 4);
          if (t <= 0 || t >= 1) return null;
          const x0 = p.x + (rnd(77, i) - 0.5) * 360, y0 = 40 + rnd(78, i) * 80;
          const tx = p.x + p.w / 2;
          const px = lerp(x0, tx, easeOut(t)), py = lerp(y0, RY, easeOut(t));
          return (
            <g key={`g${i}`}>
              <line x1={lerp(x0, tx, Math.max(0, easeOut(t) - 0.25))} y1={lerp(y0, RY, Math.max(0, easeOut(t) - 0.25))} x2={px} y2={py}
                stroke={HP.screen} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
              <circle cx={px} cy={py} r={14} fill={HP.screen} opacity={0.6} />
              <circle cx={px} cy={py} r={7} fill={HP.screenCore} />
            </g>
          );
        })}
        {/* 瓶の口の雲の顔 */}
        <g transform="translate(330 452)">
          <circle cx={-16} cy={0} r={7} fill={KRP.ink} /><circle cx={16} cy={0} r={7} fill={KRP.ink} />
          <ellipse cx={0} cy={26} rx={8} ry={11} fill={KRP.ink} />
          <path d={`M 40 -30 q 6 ${10 + Math.sin(f / 3) * 3} 0 18`} fill="#7FB8E0" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {sp < 1 && <HmJbScissors x={sx} y={RY - 120} open={open} />}
        {sp >= 1 && <g transform={`translate(${(f - 36) * 6} ${-(f - 36) * 5})`}><HmJbScissors x={1820} y={RY - 120} open={4} /></g>}
        {Z_NAME.map((nm, i) => (
          <TagPlate key={nm} x={(Z_X[i] + Z_X[i + 1]) / 2} y={660} text={nm} size={34} color={KRP.white} fill={HP[Z_KEY[i]]} t={seg(f, 1 + i * 3, 7 + i * 3)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #210 暇は増えたのに、退屈する時間は、消えたのです。
// 格: 山 / seed 5210
// 絵: どこ: #14 の「あなた」の夜の部屋 (同じ部屋・同じ配置)。演出: 序で捜索係が探していた場所 (クッションの下・本棚の裏・時計の裏) が、全部スマホの光で埋まっている。「退屈」の灰色のもやもやは、どこにもいない。ソファの「あなた」がスマホから顔を上げて、部屋を見回す (face="surprised")。動き: 見回す / スマホの光 / 時計の秒針
// どこ: #14 と同じ「あなた」の夜の部屋 (YoruNoHeya。同じ配置)
// 演出: 序で捜索係が退屈を探した場所 — クッションの下・本棚の裏・時計の裏・テレビ台の下 — のすき間から、
//       どこもスマホと同じ青白い光があふれている。灰色のもやもやは影も形もない。
//       ソファの「あなた」が膝のスマホから顔を上げ、目をきょろきょろさせて部屋を見回す。頭の上に小さな「?」
// 動き: カメラが引いて部屋全体へ / 目が左右に動く / すき間の光がゆらめく / 時計の秒針
const HmJbLeak: React.FC<{ x: number; y: number; rx: number; ry: number; f: number; ph: number }> = ({ x, y, rx, ry, f, ph }) => {
  const p = 0.75 + 0.25 * Math.sin(f / 4 + ph);
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx * 1.5} ry={ry * 2.2} fill={HP.screen} opacity={0.22 * p} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={HP.screenCore} opacity={0.75 * p} />
      <HmJbTwinkle x={x + rx * 0.6} y={y - ry * 1.6} r={10 + 4 * Math.sin(f / 3 + ph)} op={p} />
    </g>
  );
};
const Hm210: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 30));
  const look = Math.sin(f / 7) * 7;
  const p = 0.75 + 0.25 * Math.sin(f / 4);
  return (
    <Frame f={f} seed={5210} dark>
      <g transform={cam(lerp(860, 960, z), lerp(500, 540, z), lerp(1.2, 1.0, z))}>
        <YoruNoHeya f={f} />
        {/* 時計の裏から光の輪 */}
        <circle cx={560} cy={190} r={72} fill="none" stroke={HP.screen} strokeWidth={24} opacity={0.45 * p} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 + 20) * Math.PI / 180;
          return <line key={i} x1={560 + Math.cos(a) * 70} y1={190 + Math.sin(a) * 70} x2={560 + Math.cos(a) * (100 + 10 * Math.sin(f / 3 + i))} y2={190 + Math.sin(a) * (100 + 10 * Math.sin(f / 3 + i))}
            stroke={HP.screen} strokeWidth={6} strokeLinecap="round" opacity={0.7} />;
        })}
        {/* 本棚の裏から */}
        <rect x={1672} y={130} width={26} height={520} fill={HP.screenCore} opacity={0.6 * p} />
        <rect x={1640} y={130} width={60} height={520} fill={HP.screen} opacity={0.25 * p} />
        {[180, 300, 420, 540].map((ly, i) => <line key={ly} x1={1670} y1={ly} x2={1610 - 10 * Math.sin(f / 3 + i)} y2={ly - 14} stroke={HP.screen} strokeWidth={6} strokeLinecap="round" opacity={0.7} />)}
        <rect x={1700} y={104} width={220} height={18} fill={HP.screenCore} opacity={0.5 * p} />
        {/* テレビ台の下から */}
        <HmJbLeak x={1460} y={662} rx={190} ry={10} f={f} ph={2} />
        {/* クッション (左の座面)。下から光 */}
        <HmJbLeak x={690} y={668} rx={110} ry={14} f={f} ph={0} />
        <g transform="rotate(-8 690 610)">
          <rect x={610} y={550} width={160} height={110} rx={34} fill={C.cushion} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 640 580 q 50 20 100 0" stroke={C.cushionDark} strokeWidth={5} fill="none" />
          <circle cx={690} cy={605} r={7} fill={C.cushionDark} />
        </g>
        {/* 観葉植物の鉢のかげからも */}
        <HmJbLeak x={1180} y={664} rx={60} ry={8} f={f} ph={4} />
        {/* あなた */}
        <Person x={860} y={758} s={1.05} f={f} pose="sit" face="surprised" gaze={[look, -2]} lean={Math.sin(f / 7) * 2}
          cloth={HP.you} clothDark={HP.youDark} hair="cap" />
        {/* フード */}
        <path d="M 800 590 Q 860 620 920 590" stroke={HP.youDark} strokeWidth={8} fill="none" strokeLinecap="round" />
        <Sumaho x={950} y={648} s={0.26} rot={-28} f={f} screen="feed" glow={0.8} />
        <ellipse cx={880} cy={560} rx={90} ry={50} fill={HP.screen} opacity={0.12} />
        <YoruNoHeyaFront />
        <QMark x={1000} y={330} s={0.55} f={f} t={seg(f, 24, 32)} color={HP.screen} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #211 退屈が、「別のことをしよう」の警報ベルだとしたら。
// 格: 山 / seed 5211
// 絵: どこ: #184 と同じ頭の中の部屋 (警報ベルのある部屋)。演出: 壁の警報ベルが、**鳴ろうとして**ハンマーを振りかぶる (まだ鳴っていない)。小さな人 (気分) がベルを見上げる。動き: ハンマーが振りかぶる / 赤いランプがかすかに
// どこ: 頭の中の部屋 (桃色のしわしわの壁・天井。外が見える丸い窓2つ=目)。正面の壁に大きな赤い警報ベル
// 演出: ベルの右のハンマーが、ぎぎぎ…とゆっくり後ろへ振りかぶっていく (まだ鳴らない)。ベルの上の赤いランプがかすかに灯りはじめる。
//       床の小さな人 (気分) が、体を反らしてベルを見上げ、ひやあせ
// 動き: ハンマーが振りかぶる (ぷるぷる) / ランプがじわっと / カメラがベルへ寄る
const BELL_X = 960, BELL_Y = 330, HAM_PX = 1180, HAM_PY = 560;
const HmJbAtamaRoom: React.FC<{ f: number; lamp: number }> = ({ f, lamp }) => (
  <g>
    <rect x={-40} y={-40} width={2000} height={820} fill={C.noWall} />
    <g stroke={C.noWallDark} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round">
      {Array.from({ length: 7 }, (_, r) => (
        <path key={r} d={`M ${-40 + (r % 2) * 60} ${150 + r * 92} ${Array.from({ length: 17 }, (_, i) => `q 30 ${i % 2 ? 26 : -26} 60 0 t 60 0`).join(" ")}`} />
      ))}
    </g>
    {/* 天井のしわ */}
    <rect x={-40} y={-40} width={2000} height={120} fill={C.noCeil} />
    {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-20 + i * 92} cy={80} r={50} fill={C.noCeil} stroke={KRP.ink} strokeWidth={5} />)}
    <rect x={-40} y={-40} width={2000} height={110} fill={C.noCeil} />
    {/* 目の窓 */}
    {[420, 1500].map((wx, i) => (
      <g key={wx}>
        <circle cx={wx} cy={330} r={118} fill={KRP.blue} />
        <ellipse cx={wx - 30 + Math.sin(f / 20 + i) * 8} cy={300} rx={50} ry={20} fill={KRP.white} opacity={0.85} />
        <ellipse cx={wx + 50} cy={380} rx={110} ry={36} fill={KRP.green} opacity={0.7} />
        <circle cx={wx} cy={330} r={118} fill="none" stroke={HP.brass} strokeWidth={20} />
        <circle cx={wx} cy={330} r={118} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={wx} cy={330} r={130} fill="none" stroke={KRP.ink} strokeWidth={4} />
        <line x1={wx - 112} y1={330} x2={wx + 112} y2={330} stroke={HP.brassDark} strokeWidth={8} />
        <line x1={wx} y1={218} x2={wx} y2={442} stroke={HP.brassDark} strokeWidth={8} />
        {[-50, -20, 20, 50].map((a) => {
          const r = (a * Math.PI) / 180;
          return <line key={a} x1={wx + Math.sin(r) * 134} y1={330 - Math.cos(r) * 134} x2={wx + Math.sin(r) * 168} y2={330 - Math.cos(r) * 168}
            stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />;
        })}
      </g>
    ))}
    {/* ベルの配線と歯車箱 */}
    <path d={`M ${BELL_X + 60} ${BELL_Y + 120} Q ${BELL_X + 120} ${HAM_PY + 40} ${HAM_PX - 60} ${HAM_PY + 10}`} stroke={KRP.ink} strokeWidth={6} fill="none" />
    <rect x={HAM_PX - 70} y={HAM_PY - 50} width={140} height={110} rx={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
    <g transform={`rotate(${f * 4} ${HAM_PX + 30} ${HAM_PY + 20})`}>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={HAM_PX + 26} y={HAM_PY - 12} width={8} height={64} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2}
        transform={`rotate(${i * 22.5} ${HAM_PX + 30} ${HAM_PY + 20})`} />)}
      <circle cx={HAM_PX + 30} cy={HAM_PY + 20} r={22} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* ベル */}
    <rect x={BELL_X - 20} y={BELL_Y - 10} width={40} height={180} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={BELL_X} cy={BELL_Y} r={135} fill={KRP.red} stroke={KRP.ink} strokeWidth={8} />
    <circle cx={BELL_X} cy={BELL_Y} r={96} fill="none" stroke="#A8301F" strokeWidth={7} />
    <path d={`M ${BELL_X - 92} ${BELL_Y - 50} Q ${BELL_X - 60} ${BELL_Y - 106} ${BELL_X} ${BELL_Y - 112}`} stroke={KRP.white} strokeWidth={12} fill="none" opacity={0.55} strokeLinecap="round" />
    <circle cx={BELL_X} cy={BELL_Y} r={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
    {/* ランプ */}
    {lamp > 0 && <circle cx={BELL_X} cy={170} r={60 + 30 * lamp} fill={C.lampRed} opacity={0.25 * lamp} />}
    <rect x={BELL_X - 44} y={178} width={88} height={22} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <path d={`M ${BELL_X - 34} 180 A 34 34 0 0 1 ${BELL_X + 34} 180 Z`} fill={lamp > 0 ? C.lampRed : "#B88A86"} opacity={0.5 + 0.5 * lamp} stroke={KRP.ink} strokeWidth={5} />
    <path d={`M ${BELL_X - 16} 166 q 6 -12 18 -14`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.7} />
    {/* 名札 */}
    <rect x={BELL_X - 92} y={492} width={184} height={58} rx={8} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={BELL_X - 78} cy={521} r={5} fill={HP.brassDark} /><circle cx={BELL_X + 78} cy={521} r={5} fill={HP.brassDark} />
    <text x={BELL_X} y={535} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>退屈</text>
    {/* 床 */}
    <rect x={-40} y={770} width={2000} height={370} fill={C.noFloor} />
    <rect x={-40} y={762} width={2000} height={18} fill={C.noCeil} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.noFloorLine} strokeWidth={4}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 250 - 40} y1={780} x2={i * 300 - 260} y2={1120} />)}</g>
    <ellipse cx={700} cy={850} rx={330} ry={60} fill={C.kibun} opacity={0.45} />
    {/* 小さな椅子 */}
    <rect x={240} y={700} width={110} height={22} rx={8} fill={C.counter} stroke={KRP.ink} strokeWidth={5} />
    {[252, 326].map((lx) => <rect key={lx} x={lx} y={720} width={14} height={90} fill={C.counterDark} stroke={KRP.ink} strokeWidth={4} />)}
    <rect x={240} y={610} width={22} height={100} rx={6} fill={C.counter} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const HmJbHammer: React.FC<{ angle: number }> = ({ angle }) => (
  <g transform={`rotate(${angle} ${HAM_PX} ${HAM_PY})`}>
    <line x1={HAM_PX} y1={HAM_PY} x2={1115} y2={382} stroke={KRP.ink} strokeWidth={24} strokeLinecap="round" />
    <line x1={HAM_PX} y1={HAM_PY} x2={1115} y2={382} stroke="#8A5A34" strokeWidth={14} strokeLinecap="round" />
    <circle cx={1115} cy={382} r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
    <path d="M 1100 368 q 8 -8 18 -6" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.8} />
    <circle cx={HAM_PX} cy={HAM_PY} r={14} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const Hm211: React.FC<{ f: number }> = ({ f }) => {
  const wind = easeInOut(seg(f, 4, 34));
  const shake = f > 30 ? Math.sin(f * 1.6) * 1.5 : 0;
  const ang = 50 * wind + shake;
  const lamp = seg(f, 18, 40) * (0.6 + 0.4 * Math.sin(f / 3));
  const z = easeInOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={5211}>
      <g transform={cam(lerp(960, 930, z), lerp(540, 470, z), lerp(1.0, 1.1, z))}>
        <HmJbAtamaRoom f={f} lamp={lamp} />
        <HmJbHammer angle={ang} />
        {/* ぎぎぎ の弧 */}
        {wind > 0.1 && wind < 1 && (
          <path d={`M 1150 330 A 230 230 0 0 1 1290 380`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeDasharray="10 10" opacity={0.6} />
        )}
        {f > 30 && [0, 1].map((j) => <path key={j} d={`M ${1320 + j * 16} ${360 + j * 22} l 16 -6`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />)}
        {/* 気分 (小さな人) */}
        <Person x={640} y={830} s={0.75} f={f} face="worried" pose="stand" lean={-6} gaze={[4, -6]} cloth={C.kibun} clothDark={C.kibunDark} hair="cap" phase={2} />
        <path d={`M 700 ${600 + Math.sin(f / 4) * 3} q -8 14 0 20 q 8 -6 0 -20 Z`} fill="#7FB8E0" stroke={KRP.ink} strokeWidth={3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #212 いまは、ベルが鳴るより先に、画面が次のことを出してくれます。
// 格: 山 / seed 5212
// 絵: どこ: #211 の頭の中の部屋 (続き)。演出: ベルのハンマーが振り下ろされる直前に、部屋の窓からスマホの画面 (Sumaho, screen="feed") がにゅっと差しこまれて、小さな人の目の前に次の投稿が流れる。小さな人はそちらを見て、ベルは**鳴らないまま**ハンマーが止まる。動き: スマホが差しこまれる / 投稿が流れる / ハンマーが止まる
// どこ: #211 と同じ頭の中の部屋 (続き)
// 演出: 振りかぶったハンマーが振り下ろされはじめた瞬間、右の目の窓から、のびるマジックハンドに持たれたスマホがにゅうっと差しこまれ、
//       気分の目の前で投稿が流れる。気分はそっちに夢中 (にっこり)。ハンマーはベルの手前でぴたっと止まって「…」、ランプもしゅんと消える
// 動き: ハンマーが下りて止まる / マジックハンドがのびる / 投稿が流れる / ランプが消える
const Hm212: React.FC<{ f: number }> = ({ f }) => {
  const down = easeOut(seg(f, 3, 14));
  const freeze = f >= 14 && f < 22 ? Math.sin(f * 3) * 1.2 : 0;
  const ang = 50 - 28 * down + freeze;
  const lamp = (1 - seg(f, 16, 26)) * (0.6 + 0.4 * Math.sin(f / 3));
  const e = easeOut(seg(f, 6, 20));
  const ex = pop(seg(f, 6, 20));
  const BX = 1520, BY = 340, TX = 940, TY = 560;
  const tx = lerp(BX, TX, ex), ty = lerp(BY, TY, ex);
  const N = 6;
  const amp = 46 * (1 - e) + 18;
  const L = Math.hypot(tx - BX, ty - BY) || 1;
  const nx = -(ty - BY) / L, ny = (tx - BX) / L;
  const zig = Array.from({ length: N * 2 + 1 }, (_, i) => {
    const u = i / (N * 2);
    const side = i === 0 || i === N * 2 ? 0 : (i % 2 ? 1 : -1);
    return [lerp(BX, tx, u) + nx * amp * side, lerp(BY, ty, u) + ny * amp * side];
  });
  const zz = zig.map(([x, y]) => `${x},${y}`).join(" ");
  const zz2 = zig.map(([x, y], i) => {
    const side = i === 0 || i === N * 2 ? 0 : (i % 2 ? 1 : -1);
    return `${x - 2 * nx * amp * side},${y - 2 * ny * amp * side}`;
  }).join(" ");
  const hooked = f >= 18;
  const z = easeInOut(seg(f, 0, 36));
  return (
    <Frame f={f} seed={5212}>
      <g transform={cam(lerp(930, 880, z), lerp(470, 500, z), lerp(1.1, 1.08, z))}>
        <HmJbAtamaRoom f={f} lamp={lamp} />
        <HmJbHammer angle={ang} />
        {f >= 24 && [0, 1, 2].map((i) => <circle key={i} cx={1230 + i * 26} cy={300 - i * 8} r={7} fill={KRP.ink} opacity={seg(f, 24 + i * 4, 28 + i * 4)} />)}
        {/* 気分 */}
        <Person x={640} y={830} s={0.75} f={f} face={hooked ? "joy" : "worried"} pose="stand" lean={hooked ? 5 : -6}
          gaze={hooked ? [6, -1] : [4, -6]} cloth={C.kibun} clothDark={C.kibunDark} hair="cap" phase={2} />
        {hooked && <ellipse cx={740} cy={620} rx={120} ry={90} fill={HP.screen} opacity={0.18} />}
        {/* マジックハンドとスマホ */}
        {e > 0 && (
          <g>
            <polyline points={zz} stroke={KRP.ink} strokeWidth={16} fill="none" strokeLinejoin="round" />
            <polyline points={zz} stroke={KRP.silver} strokeWidth={8} fill="none" strokeLinejoin="round" />
            <polyline points={zz2} stroke={KRP.ink} strokeWidth={16} fill="none" strokeLinejoin="round" />
            <polyline points={zz2} stroke={KRP.silver} strokeWidth={8} fill="none" strokeLinejoin="round" />
            {zig.map(([x, y], i) => (i % 2 ? <circle key={i} cx={x} cy={y} r={7} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} /> : null))}
            <rect x={BX - 30} y={BY - 30} width={60} height={60} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            <Sumaho x={tx - 84} y={ty + 40} s={0.85} rot={-8} f={f} screen="feed" glow={0.9} />
            <path d={`M ${tx - 20} ${ty - 10} l 26 10 l -26 10`} stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        )}
        {e > 0 && e < 0.9 && [0, 1, 2].map((i) => <line key={i} x1={tx + 70 + i * 10} y1={ty - 60 + i * 50} x2={tx + 140 + i * 10} y2={ty - 90 + i * 50}
          stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #213 それを便利と思うか、ちょっともったいないと思うか。決めるのは、あなたです。
// 格: 山 / seed 5213
// 絵: どこ: 夜の公園のベンチ (街灯・星)。演出: 「あなた」がベンチに座り、片手にスマホ (Sumaho)、もう片方の手は空いている。頭の上に天秤 (左「便利」のスマホのマーク・右「もったいない」の星のマーク)。天秤がゆらゆら、**どちらにも決めつけず**ゆれている。「あなた」は空を見上げる。動き: 天秤のゆれ / 星がまたたく / スマホの光
// どこ: 夜の公園。星空・遠くの木々・左に街灯・小道・木のベンチ
// 演出: ベンチの「あなた」が、右手にスマホ (光っている)、左手はひらいて空っぽ。空を見上げる。
//       頭の上に、考えごとの泡でつながった天秤。左の皿にスマホのマーク、右の皿に星のマーク。
//       天秤はゆらゆら、どちらにも傾ききらない (f=45 でちょうど水平を通る)。夜空を流れ星がすっと横切る
// 動き: 天秤のゆれ / 星のまたたき / 流れ星 / スマホの光 / カメラが空へ引く
const Hm213: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 32));
  const tilt = 8 * Math.sin((f - 45) / 7);
  const PX = 960, PY = 170, HL = 300;
  const shoot = seg(f, 18, 32);
  const pans: [number, "phone" | "star"][] = [[-1, "phone"], [1, "star"]];
  return (
    <Frame f={f} seed={5213} dark>
      <defs>
        <linearGradient id="hmjb213sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.night1} /><stop offset="0.7" stopColor={C.night2} /><stop offset="1" stopColor={C.night3} />
        </linearGradient>
      </defs>
      <g transform={cam(960, lerp(620, 540, z), lerp(1.15, 1.0, z))}>
        <rect x={-40} y={-40} width={2000} height={820} fill="url(#hmjb213sky)" />
        {Array.from({ length: 40 }, (_, i) => {
          const sx = rnd(213, i) * 1920, sy = rnd(313, i) * 560;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i * 1.7));
          return i % 5 === 0 ? <HmJbTwinkle key={i} x={sx} y={sy} r={9} color={KRP.white} op={tw} />
            : <circle key={i} cx={sx} cy={sy} r={2.5 + (i % 3)} fill={KRP.white} opacity={tw} />;
        })}
        {/* 月 */}
        <circle cx={1660} cy={150} r={56} fill="#FFF3C4" />
        <circle cx={1686} cy={136} r={50} fill={C.night1} />
        {/* 流れ星 */}
        {shoot > 0 && shoot < 1 && (
          <g opacity={Math.sin(shoot * Math.PI)}>
            <line x1={lerp(260, 760, shoot) - 140} y1={lerp(80, 220, shoot) - 40} x2={lerp(260, 760, shoot)} y2={lerp(80, 220, shoot)}
              stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
            <HmJbTwinkle x={lerp(260, 760, shoot)} y={lerp(80, 220, shoot)} r={14} color={KRP.white} />
          </g>
        )}
        {/* 遠くの木々 */}
        <g fill={C.tree} stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={i * 170 + (i % 2) * 40} cy={700 - (i % 3) * 30} r={90 + (i % 3) * 20} />)}
        </g>
        {/* 地面と小道 */}
        <rect x={-40} y={740} width={2000} height={400} fill={C.grass} />
        <path d="M -40 860 Q 960 780 1960 860 L 1960 1120 L -40 1120 Z" fill={C.path} />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${i * 66 + 10} 790 l 6 -16 l 6 16`} stroke={C.grassLight} strokeWidth={4} fill="none" />)}
        {/* 街灯 */}
        <polygon points="330,230 390,230 600,860 120,860" fill={C.lampLight} opacity={0.14 + 0.02 * Math.sin(f / 5)} />
        <ellipse cx={360} cy={862} rx={250} ry={36} fill={C.lampLight} opacity={0.2} />
        <rect x={350} y={230} width={20} height={630} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 320 232 L 400 232 L 380 190 L 340 190 Z" fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={360} cy={238} r={20} fill={C.lampLight} />
        <circle cx={360} cy={238} r={40} fill={C.lampLight} opacity={0.3} />
        {[0, 1].map((i) => <circle key={i} cx={360 + Math.sin(f / 4 + i * 3) * 40} cy={270 + Math.cos(f / 5 + i) * 24} r={4} fill={KRP.white} opacity={0.8} />)}
        {/* ベンチ (背もたれ・座面の奥) */}
        {[560, 610].map((by) => <rect key={by} x={680} y={by} width={560} height={30} rx={8} fill={C.benchWood} stroke={KRP.ink} strokeWidth={6} />)}
        {[720, 1200].map((lx) => <rect key={lx} x={lx - 10} y={560} width={20} height={140} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />)}
        {/* あなた */}
        <Person x={960} y={758} s={1.05} f={f} pose="sit" face="smile" gaze={[1, -7]} cloth={HP.you} clothDark={HP.youDark} hair="cap" />
        <path d="M 900 590 Q 960 620 1020 590" stroke={HP.youDark} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* 右手のスマホ */}
        <Sumaho x={1078} y={648} s={0.28} rot={16} f={f} screen="on" glow={0.7 + 0.3 * Math.sin(f / 5)} />
        {/* 左手 (ひらいて空っぽ) */}
        <g transform="translate(856 684)">
          <circle r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[-40, -10, 20].map((a) => <line key={a} x1={0} y1={0} x2={Math.sin((a - 90) * Math.PI / 180) * 20} y2={-Math.cos((a - 90) * Math.PI / 180) * 20 - 4}
            stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
        </g>
        {/* ベンチ (座面の手前と脚) */}
        <rect x={660} y={686} width={600} height={34} rx={10} fill={C.benchWood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={680} y1={703} x2={1240} y2={703} stroke={C.benchWoodDark} strokeWidth={4} />
        {[700, 1210].map((lx) => <path key={lx} d={`M ${lx} 718 l -10 90 M ${lx} 718 l 14 90`} stroke={C.iron} strokeWidth={14} strokeLinecap="round" />)}
        {/* 考えごとの泡 */}
        {[[1040, 448, 10], [1062, 418, 14]].map(([bx, by, r], i) => <circle key={i} cx={bx} cy={by} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 4 + i * 4, 10 + i * 4)} />)}
        {/* 天秤 */}
        <g opacity={seg(f, 8, 18)}>
          <rect x={PX - 9} y={PY} width={18} height={220} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${PX - 60} ${PY + 236} Q ${PX} ${PY + 200} ${PX + 60} ${PY + 236} Z`} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${tilt} ${PX} ${PY})`}>
            <rect x={PX - HL} y={PY - 9} width={HL * 2} height={18} rx={9} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {pans.map(([d, kind]) => {
            const a = (tilt * Math.PI) / 180;
            const ex = PX + d * HL * Math.cos(a), ey = PY + d * HL * Math.sin(a);
            return (
              <g key={kind}>
                <line x1={ex} y1={ey} x2={ex - 70} y2={ey + 120} stroke={KRP.ink} strokeWidth={3} />
                <line x1={ex} y1={ey} x2={ex + 70} y2={ey + 120} stroke={KRP.ink} strokeWidth={3} />
                <circle cx={ex} cy={ey} r={10} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
                <path d={`M ${ex - 90} ${ey + 120} Q ${ex} ${ey + 170} ${ex + 90} ${ey + 120} Z`} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
                {kind === "phone" ? (
                  <g transform={`translate(${ex} ${ey + 70}) rotate(-6)`}>
                    <ellipse cx={0} cy={0} rx={56} ry={66} fill={HP.screen} opacity={0.3 + 0.15 * Math.sin(f / 4)} />
                    <rect x={-26} y={-50} width={52} height={100} rx={10} fill={KRP.ink} />
                    <rect x={-20} y={-42} width={40} height={82} rx={5} fill={HP.screen} />
                    <rect x={-12} y={-30} width={24} height={8} rx={3} fill={KRP.white} />
                  </g>
                ) : (
                  <g transform={`translate(${ex} ${ey + 76}) rotate(${Math.sin(f / 6) * 6})`}>
                    <circle r={52} fill={KRP.yellow} opacity={0.2 + 0.15 * Math.sin(f / 4 + 1)} />
                    <path d="M 0 -46 L 13 -14 L 46 -12 L 20 9 L 29 42 L 0 23 L -29 42 L -20 9 L -46 -12 L -13 -14 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
                  </g>
                )}
              </g>
            );
          })}
          <circle cx={PX} cy={PY} r={14} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #214 なお、何かを待ちながら、この動画を最後まで観てくれたあなた。
// 格: 山 / seed 5214
// 絵: どこ: 序の #1 と同じ夕方の駅のホーム (同じベンチ・同じ電光掲示・同じ自販機)。演出: 「あなた」がベンチでスマホ (Sumaho) の画面を見ている。画面には、この動画の最後の場面が小さく映っている (ものさしの絵)。電光掲示の「まもなく」の数字が点滅し、遠くに電車のライト。動き: 電車のライトが近づく / 掲示の点滅 / 鳩
// どこ: 序 #1 と同じ夕方の駅のホーム (EkiHome。同じベンチ・電光掲示・自販機)
// 演出: ベンチの「あなた」がスマホを見ている。画面には、この動画の最後の場面 (暇のものさしと小さなベンチ) と、
//       再生バーがもう残りわずか。電光掲示は「まもなく」が点滅。線路の向こうから電車のライトが近づいてくる。
//       ベンチの右はしで鳩がこつこつ
// 動き: 電車のライトが大きくなる / 掲示の点滅 / 鳩がつつく / 画面の再生バーが進む / カメラが少し引く
const Hm214: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 34));
  const L = seg(f, 0, 42);
  const prog = lerp(0.9, 0.97, seg(f, 0, 42));
  const PHX = 1000, PHY = 596, PHS = 0.62;
  return (
    <Frame f={f} seed={5214}>
      <g transform={cam(lerp(900, 960, z), lerp(560, 540, z), lerp(1.12, 1.03, z))}>
        <EkiHome f={f} minutes={0} train={0} />
        {/* 遠くの電車のライト */}
        <g>
          <circle cx={1800} cy={528} r={30 + 70 * L} fill={HP.spark} opacity={0.18 + 0.1 * L} />
          <circle cx={1800} cy={528} r={8 + 16 * L} fill={KRP.white} />
          <circle cx={1770} cy={530} r={5 + 10 * L} fill={KRP.white} opacity={0.9} />
          {[-12, 0, 12].map((a) => <line key={a} x1={1790} y1={528} x2={1790 - (160 + 120 * L) * Math.cos(a * Math.PI / 180)} y2={528 + (160 + 120 * L) * Math.sin(a * Math.PI / 180)}
            stroke={HP.spark} strokeWidth={6} opacity={0.3 + 0.2 * L} strokeLinecap="round" />)}
        </g>
        {/* 掲示の点滅に光 */}
        <rect x={150} y={100} width={460} height={140} rx={12} fill="#FFB347" opacity={Math.floor(f / 8) % 2 ? 0.12 : 0.02} />
        <Person x={860} y={748} s={1.05} f={f} pose="sit" face="smile" gaze={[5, 5]} cloth={HP.you} clothDark={HP.youDark} hair="cap" />
        <path d="M 800 580 Q 860 610 920 580" stroke={HP.youDark} strokeWidth={8} fill="none" strokeLinecap="round" />
        <Sumaho x={PHX} y={PHY} s={PHS} f={f} screen="on" glow={0.7} />
        {/* 画面の中: この動画の最後の場面 */}
        <g transform={`translate(${PHX} ${PHY}) scale(${PHS})`}>
          <rect x={-64} y={-136} width={128} height={272} rx={14} fill="#F6C98A" />
          <rect x={-64} y={-136} width={128} height={120} rx={14} fill="#E9967A" />
          <rect x={-64} y={-20} width={128} height={156} fill="#B8AFA2" />
          {/* ものさし */}
          <rect x={-56} y={-70} width={112} height={34} rx={6} fill={HP.wood} stroke={KRP.ink} strokeWidth={3} />
          {[HP.hi, HP.jikan, HP.fun, HP.byo].map((c, i) => <rect key={i} x={-54 + i * 27} y={-68} width={26} height={8} fill={c} />)}
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-52 + i * 7} y1={-58} x2={-52 + i * 7} y2={-58 + (i % 4 ? 8 : 16)} stroke={KRP.ink} strokeWidth={1.5} />)}
          {/* 小さなベンチと人 */}
          <rect x={-34} y={10} width={68} height={10} rx={3} fill="#4F7DB8" stroke={KRP.ink} strokeWidth={2} />
          <circle cx={0} cy={-6} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
          <rect x={-9} y={2} width={18} height={14} rx={3} fill={HP.you} />
          {/* 再生バー */}
          <rect x={-56} y={104} width={112} height={8} rx={4} fill={KRP.grayDark} />
          <rect x={-56} y={104} width={112 * prog} height={8} rx={4} fill={KRP.red} />
          <circle cx={-56 + 112 * prog} cy={108} r={8} fill={KRP.red} stroke={KRP.white} strokeWidth={2} />
        </g>
        <ellipse cx={890} cy={540} rx={100} ry={60} fill={HP.screen} opacity={0.1} />
        <EkiBenchFront />
        <HmJbHato x={lerp(1150, 1115, seg(f, 0, 42))} y={680} s={0.85} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #215 それはたぶん、2500年かけて細かくなった、暇の、ひと目盛りです。
// 格: 山 / seed 5215
// 絵: どこ: #214 の駅のホーム (続き)。演出: 電車が入ってきて、「あなた」が立ち上がる。その瞬間、ホームの床の上に Monosashi (lit=4) の幻のような大きな影が浮かび、「あなた」が座っていたベンチの位置が、ものさしの「秒」の区画の**ひと目盛り**にぴたりと重なって光る。捜索係が電車の窓から手を振る。動き: 電車が入る / 立ち上がる / ひと目盛りが光る / 手を振る
// どこ: #214 と同じ駅のホーム (続き)。カメラが左へ動いてホームの左側まで見せる
// 演出: 電車が入ってきて止まり、「あなた」が立ち上がって一歩よける。その瞬間、ホームの上空に暇のものさし (lit=4) の
//       幻がすうっと浮かび、床に影が落ちる。「秒」の区画のひと目盛りが光り、その光の柱がちょうど
//       「あなた」が座っていたベンチの場所に落ちて、座面がぽうっと光る。電車の窓から捜索係が手を振る
// 動き: 電車が入る / 立ち上がる / ものさしの幻 / ひと目盛りが光る / 光の柱 / 手を振る
const Hm215: React.FC<{ f: number }> = ({ f }) => {
  const tr = seg(f, 0, 22);
  const tx = lerp(2400, 140, easeOut(tr));
  const pan = 440 * easeInOut(seg(f, 4, 30));
  const up = f >= 14;
  const step = easeInOut(seg(f, 18, 30));
  const px = lerp(860, 700, step);
  const ghost = seg(f, 12, 28);
  const tick = seg(f, 26, 36);
  const pulse = 0.8 + 0.2 * Math.sin(f / 3);
  const RX = 335, RY = 300; // ものさしの中心 (秒の 20本目 = x860)
  const sxw = tx + 1060; // 捜索係の窓 (6番目の窓) の左端
  return (
    <Frame f={f} seed={5215}>
      <g transform={`translate(${pan} 0)`}>
        {/* ホームの左の続き (カメラが左へ動くぶん) */}
        <rect x={-520} y={-40} width={500} height={560} fill="url(#ekiSky)" />
        <g fill="#6A5A7A" stroke={KRP.ink} strokeWidth={3} opacity={0.85}>
          {[0, 1, 2].map((i) => <path key={i} d={`M ${-500 + i * 150} 520 l 0 -${70 + i * 25} l 60 -40 l 60 40 l 0 ${70 + i * 25} Z`} />)}
        </g>
        <rect x={-520} y={510} width={500} height={120} fill="#8B8077" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-510 + i * 70} y={540} width={40} height={70} fill="#6E6058" />)}
        <rect x={-520} y={548} width={500} height={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
        <rect x={-520} y={598} width={500} height={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
        <rect x={-520} y={630} width={500} height={520} fill="#B8AFA2" />
        <rect x={-520} y={630} width={500} height={26} fill="#F2CE4C" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-520} y={-40} width={500} height={60} fill="#5E5A66" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-120} y={20} width={30} height={640} fill="#7A7680" stroke={KRP.ink} strokeWidth={6} />
        <EkiHome f={f} minutes={0} train={easeOut(tr) > 0 ? tr : 0} />
        {/* 捜索係 (6番目の窓) */}
        {tr > 0 && (
          <g>
            <defs><clipPath id="hmjb215win"><rect x={sxw} y={370} width={140} height={110} rx={10} /></clipPath></defs>
            <g clipPath="url(#hmjb215win)">
              <Sousa x={sxw + 62} y={520} s={0.45} f={f} face="joy" pose="raise" lens={false} lean={tr >= 1 ? Math.sin(f / 2.5) * 8 : 0} />
              <path d={`M ${sxw + 10} 470 L ${sxw + 60} 374 L ${sxw + 80} 374 L ${sxw + 26} 470 Z`} fill={KRP.white} opacity={0.25} />
            </g>
            {tr >= 1 && [0, 1].map((i) => <path key={i} d={`M ${sxw + 130 + i * 14} ${380 + i * 20} q 14 -6 18 -20`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round"
              opacity={Math.floor(f / 5) % 2 ? 1 : 0.3} />)}
            {/* 柱 (窓の前) */}
            <rect x={1300} y={20} width={30} height={640} fill="#7A7680" stroke={KRP.ink} strokeWidth={6} />
          </g>
        )}
        {/* ものさしの床の影 */}
        {ghost > 0 && <path d={`M ${RX - 620} 900 L ${RX + 760} 900 L ${RX + 700} 960 L ${RX - 700} 960 Z`} fill={KRP.ink} opacity={0.12 * ghost} />}
        {/* ものさしの幻 */}
        {ghost > 0 && (
          <g opacity={0.82 * ghost} transform={`translate(0 ${(1 - ghost) * 30})`}>
            <rect x={RX - 730} y={RY - 105} width={1460} height={300} rx={40} fill={KRP.white} opacity={0.25 * pulse} />
            <Monosashi x={RX} y={RY} s={1} lit={4} f={f} focus={3} />
          </g>
        )}
        {/* ひと目盛りが光る → 光の柱がベンチへ */}
        {tick > 0 && (
          <g>
            <line x1={860} y1={RY - 40} x2={860} y2={RY + 36} stroke={HP.spark} strokeWidth={14 * tick} strokeLinecap="round" />
            <circle cx={860} cy={RY} r={46 * tick * pulse} fill={HP.spark} opacity={0.35} />
            <polygon points={`840,${RY + 160} 880,${RY + 160} ${930},690 ${790},690`} fill={HP.spark} opacity={0.32 * tick * pulse} />
            <line x1={860} y1={RY + 160} x2={860} y2={lerp(RY + 160, 690, tick)} stroke={HP.screenCore} strokeWidth={6} opacity={0.8} />
          </g>
        )}
        {/* あなた: 座る → 立つ → 一歩よける */}
        {!up && <Person x={860} y={748} s={1.05} f={f} pose="sit" face="normal" gaze={[5, 4]} cloth={HP.you} clothDark={HP.youDark} hair="cap" />}
        {!up && <Sumaho x={985} y={640} s={0.4} f={f} screen="on" glow={0.5} />}
        <EkiBenchFront />
        {tick > 0 && (
          <g>
            <ellipse cx={860} cy={694} rx={150 * tick} ry={26 * tick} fill={HP.spark} opacity={0.55 * pulse} />
            <HmJbTwinkle x={800} y={660} r={16 * tick} color={KRP.white} op={pulse} />
            <HmJbTwinkle x={930} y={650} r={12 * tick} color={KRP.white} op={1.6 - pulse} />
          </g>
        )}
        {up && (
          <g>
            <Person x={px} y={815} s={1.05} f={f} pose="stand" face={tick > 0.5 ? "smile" : "surprised"} gaze={[4, -6]}
              cloth={HP.you} clothDark={HP.youDark} hair="cap" />
            <path d={`M ${px - 60} 647 Q ${px} 677 ${px + 60} 647`} stroke={HP.youDark} strokeWidth={8} fill="none" strokeLinecap="round" />
            <Sumaho x={px + 74} y={738} s={0.2} rot={10} f={f} screen="off" />
          </g>
        )}
        {up && f < 20 && [0, 1, 2].map((i) => <line key={i} x1={820 + i * 40} y1={540} x2={820 + i * 40} y2={500} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />)}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_205: (f) => <Hm205 f={f} />,
  hm_206: (f) => <Hm206 f={f} />,
  hm_207: (f) => <Hm207 f={f} />,
  hm_208: (f) => <Hm208 f={f} />,
  hm_209: (f) => <Hm209 f={f} />,
  hm_210: (f) => <Hm210 f={f} />,
  hm_211: (f) => <Hm211 f={f} />,
  hm_212: (f) => <Hm212 f={f} />,
  hm_213: (f) => <Hm213 f={f} />,
  hm_214: (f) => <Hm214 f={f} />,
  hm_215: (f) => <Hm215 f={f} />,
};

export const HM_JB_MOTIFS: string[] = [
  "hm_205", // #205
  "hm_206", // #206
  "hm_207", // #207
  "hm_208", // #208
  "hm_209", // #209
  "hm_210", // #210
  "hm_211", // #211
  "hm_212", // #212
  "hm_213", // #213
  "hm_214", // #214
  "hm_215", // #215
];

export const himaJbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

void HmJbArm;
