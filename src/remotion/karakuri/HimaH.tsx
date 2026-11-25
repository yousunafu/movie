// 人は、なぜ暇をつぶすのか: 文#173〜#183 (11文)
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
  cork: "#C9A06A",
  corkDark: "#A57E4E",
  sea: "#A9CCDD",
  seaLine: "#8DB4C8",
  land: "#E9DBA9",
  landDark: "#BFA56E",
  dark: "#2C2A38",
  dark2: "#3B3850",
  seat: "#A8423A",
  seatDark: "#7C2E28",
  beam: "#F5F0D8",
  court: "#6FA86A",
  courtDark: "#4E8450",
  smog: "#A3A3A8",
  smogDark: "#7E7E86",
  water: "#BFE0F2",
  waterDeep: "#7FB6D9",
  rock: "#8A8178",
  rockDark: "#6E665E",
  moss: "#7FA65A",
  mossDark: "#5A8440",
  sky: "#CFE8F5",
  skin: "#F6E3CF",
  skinDark: "#D9B999",
  mindWall: "#F3D6D2",
  mindFloor: "#C79A72",
  glass: "#DDF1FA",
  coat: "#F4F4EE",
  coatDark: "#C9CCC4",
  labTile: "#E1E6E0",
  labTileLine: "#C8CFC6",
  jarGlass: "#E4F2F4",
  corkStop: "#C08A55",
  corkStopDark: "#8E6234",
  deskWood: "#B9874F",
  deskWoodDark: "#9E6F3E",
  meetWall: "#DCD6C8",
  meetTable: "#9C6E44",
  meetTableDark: "#744E2E",
  paperDoc: "#FBFAF4",
  stampRed: "#C8382A",
  choco: ["#D3402E", "#F2CE4C", "#4A78B8", "#7FBF7A", "#E8923A", "#9A6AB0"] as readonly string[],
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

// 目をつぶった顔を Person の上に重ねる (x,y は Person の足元、s は Person の s。lean は無しのときだけ使う)
const HmHClosedEyes: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; tight?: boolean; lean?: number }> = ({ x, y, s, f, phase = 0, tight, lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {[-24, 24].map((ex) => <ellipse key={ex} cx={ex} cy={-222} rx={17} ry={22} fill={KRP.white} />)}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" fill="none">
        {tight ? (
          <>
            <path d="M -36 -228 L -16 -220 L -36 -212" />
            <path d="M 36 -228 L 16 -220 L 36 -212" />
          </>
        ) : (
          <>
            <path d="M -36 -220 Q -24 -212 -12 -220" />
            <path d="M 12 -220 Q 24 -212 36 -220" />
          </>
        )}
      </g>
    </g>
  );
};

// 灰色のもやもや (退屈)。x,y 中心、r 大きさ、spin 回転
const HmHMoya: React.FC<{ x: number; y: number; r: number; f: number; op?: number; seed?: number }> = ({ x, y, r, f, op = 1, seed = 1 }) => (
  <g opacity={op}>
    {Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + f / 18 + seed;
      const rr = r * (0.42 + 0.12 * rnd(seed, i));
      return (
        <circle key={i} cx={x + Math.cos(a) * r * 0.5} cy={y + Math.sin(a) * r * 0.32} r={rr}
          fill={i % 2 ? C.smog : C.smogDark} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
      );
    })}
    <path d={`M ${x - r * 0.4} ${y} q ${r * 0.2} ${-r * 0.25} ${r * 0.4} 0 t ${r * 0.4} 0`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.6}
      transform={`rotate(${f * 3} ${x} ${y})`} />
  </g>
);

// 小さな稲妻
const HmHBolt: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={op}
    d="M 6 -30 L -12 4 L 0 4 L -8 30 L 14 -6 L 2 -6 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
);

// テニスを打ち合うだけの映像 (スクリーンの中身)。x,y,w,h 画面の矩形
const HmHTennis: React.FC<{ x: number; y: number; w: number; h: number; f: number; dim?: number }> = ({ x, y, w, h, f, dim = 0 }) => {
  const cyc = (f % 24) / 24; // 1往復 24コマ
  const tt = cyc < 0.5 ? cyc * 2 : 2 - cyc * 2;
  const bx = x + w * (0.22 + 0.56 * tt);
  const by = y + h * 0.55 - Math.sin(tt * Math.PI) * h * 0.28;
  const swingL = cyc < 0.1 ? -30 : 0, swingR = cyc > 0.4 && cyc < 0.6 ? 30 : 0;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.court} />
      <rect x={x} y={y} width={w} height={h * 0.42} fill={KRP.blueSoft} />
      <rect x={x + w * 0.08} y={y + h * 0.62} width={w * 0.84} height={h * 0.28} fill={C.courtDark} stroke={KRP.white} strokeWidth={4} />
      <line x1={x + w / 2} y1={y + h * 0.5} x2={x + w / 2} y2={y + h * 0.9} stroke={KRP.white} strokeWidth={5} />
      <rect x={x + w / 2 - 4} y={y + h * 0.5} width={8} height={h * 0.4} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
      {[[0.14, swingL, KRP.red], [0.86, swingR, KRP.blueDeep]].map(([px, sw, col], i) => (
        <g key={i}>
          <PersonMini x={x + w * (px as number)} y={y + h * 0.82} s={h / 420} color={col as string} f={f} phase={i} />
          <g transform={`rotate(${(sw as number) * (i ? -1 : 1)} ${x + w * (px as number) + (i ? -1 : 1) * h * 0.11} ${y + h * 0.62})`}>
            <line x1={x + w * (px as number) + (i ? -1 : 1) * h * 0.11} y1={y + h * 0.62} x2={x + w * (px as number) + (i ? -1 : 1) * h * 0.2} y2={y + h * 0.5}
              stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={x + w * (px as number) + (i ? -1 : 1) * h * 0.22} cy={y + h * 0.46} rx={h * 0.035} ry={h * 0.05} fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      ))}
      <circle cx={bx} cy={by} r={h * 0.025} fill="#D8E64A" stroke={KRP.ink} strokeWidth={3} />
      {dim > 0 && <rect x={x} y={y} width={w} height={h} fill={C.dark} opacity={dim} />}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #173 それでも、何もない15分より、ボタンを選んだ人がいたのは、確かです。
// 格: 山 / seed 5173
// 絵: どこ: ShockRoom (minutes=15)。演出: 壁時計の15分の扇形 (大きな空白) と、机の上のボタンを天秤の左右に乗せた比喩。天秤は、何人かの人形 (⚡つき) の分だけボタン側に傾く。部屋の学生は静かにボタンを見つめる。動き: 天秤が傾く / 秒針 / 学生のまばたき
// どこ: 序と同じ実験室 (ShockRoom, minutes=15)。学生は椅子に座ってボタンを見つめる
// 演出: 部屋の上に大きな天秤 (比喩)。左の皿=「15分の空白の時計」、右の皿=赤いボタン。⚡つきの人形が右の皿に1人ずつ飛び乗り、天秤がボタン側へ傾く
// 動き: 人形が4人降ってくる / 天秤が傾いてゆれる / 壁時計の秒針 / 学生のまばたき / カメラがゆっくり寄る
const Hm173: React.FC<{ f: number }> = ({ f }) => {
  const drops = [8, 14, 20, 26];
  const landed = drops.filter((d) => f >= d + 6).length;
  const tiltTarget = landed * 2.6;
  const wob = Math.sin(f / 3) * Math.max(0, 1.4 - (f - 32) * 0.1) * (f > 8 ? 1 : 0);
  const ang = tiltTarget * easeOut(clamp01((f - 8) / 30)) + wob * 0.6;
  const a = (ang * Math.PI) / 180;
  const cx = 930, cy = 150, L = 330;
  const lx = cx - L * Math.cos(a), ly = cy - L * Math.sin(a);
  const rx = cx + L * Math.cos(a), ry = cy + L * Math.sin(a);
  const hang = 120;
  const cam = 1 + 0.035 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5173}>
      <g transform={`translate(960 420) scale(${cam}) translate(-960 -420)`}>
        <ShockRoom f={f} minutes={15} />
        {/* 学生 (紺の服) が座って、机のボタンを見つめる */}
        <Person x={720} y={707} s={1.15} f={f} pose="sit" face="normal" gaze={[7, 3]} cloth="#33416A" clothDark="#252F4F" phase={2} />
        {/* 見つめる視線の点線 */}
        <path d="M 790 450 Q 950 430 1050 535" stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="6 12" fill="none" opacity={0.5 + 0.2 * Math.sin(f / 6)} />

        {/* 天秤 (比喩) */}
        <g>
          {/* 支柱と台座 (宙に浮く比喩なので、真鍮の飾り台に乗せる) */}
          <rect x={cx - 14} y={cy} width={28} height={200} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${cx - 90} ${cy + 230} Q ${cx} ${cy + 180} ${cx + 90} ${cy + 230} Z`} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={cx} cy={cy} r={22} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
          {/* 針 */}
          <g transform={`rotate(${ang} ${cx} ${cy})`}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - 80} stroke={KRP.ink} strokeWidth={6} />
            <rect x={cx - L - 10} y={cy - 9} width={2 * L + 20} height={18} rx={9} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={cx - L} cy={cy} r={10} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={cx + L} cy={cy} r={10} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 目盛り板 */}
          <path d={`M ${cx - 46} ${cy - 66} A 80 80 0 0 1 ${cx + 46} ${cy - 66}`} stroke={KRP.ink} strokeWidth={4} fill="none" />
          {/* 左の皿: 何もない15分 */}
          {[lx, rx].map((px, k) => {
            const py = k ? ry : ly;
            return (
              <g key={k}>
                <line x1={px} y1={py} x2={px - 95} y2={py + hang} stroke={KRP.ink} strokeWidth={4} />
                <line x1={px} y1={py} x2={px + 95} y2={py + hang} stroke={KRP.ink} strokeWidth={4} />
                <path d={`M ${px - 110} ${py + hang} Q ${px} ${py + hang + 50} ${px + 110} ${py + hang} Z`} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
              </g>
            );
          })}
          {/* 左の皿の上: 15分の扇形の時計 (中は空っぽ) */}
          <g transform={`translate(${lx} ${ly + hang - 56})`}>
            <circle r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <path d="M 0 0 L 0 -44 A 44 44 0 0 1 44 0 Z" fill={KRP.red} opacity={0.3} />
            <line x1={0} y1={0} x2={0} y2={-38} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${Math.floor(f / 30) * 6})`} />
            <circle r={5} fill={KRP.ink} />
          </g>
          <TagPlate x={lx} y={ly + hang + 70} text="15分" size={36} t={seg(f, 2, 10)} />
          {/* 右の皿の上: 赤いボタン */}
          <g transform={`translate(${rx} ${ry + hang - 8})`}>
            <rect x={-60} y={-34} width={120} height={34} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={-38} rx={34} ry={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={-10} cy={-42} rx={11} ry={4} fill={KRP.white} opacity={0.6} />
          </g>
          {/* ⚡つきの人形が降ってくる */}
          {drops.map((d, i) => {
            const t = seg(f, d, d + 6);
            if (t <= 0) return null;
            const sx = rx - 75 + i * 50;
            const sy = ry + hang - 50 - (i % 2) * 6;
            const yy = lerp(sy - 260, sy, easeInOut(t));
            const squash = t >= 1 ? 1 - 0.12 * Math.max(0, 1 - (f - d - 6) / 5) : 1;
            return (
              <g key={i} transform={`translate(${sx} ${yy}) scale(1 ${squash}) translate(${-sx} ${-yy})`}>
                <PersonMini x={sx} y={yy} s={0.42} color={["#33416A", "#6E8A5E", "#9A6AB0", "#C96A4A"][i]} f={f} phase={i} face="smile" />
                <HmHBolt x={sx + 18} y={yy - 100} s={0.7} op={0.6 + 0.4 * Math.abs(Math.sin((f + i * 5) / 4))} />
              </g>
            );
          })}
          <TagPlate x={rx} y={ry + hang + 70} text="ボタン" size={36} t={seg(f, 4, 12)} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #174 その後、11か国、2,557人で、似た実験が行われました。
// 格: 山 / seed 5174
// 絵: どこ: 世界地図の掲示板 (大きな地図・ピン・糸)。演出: 地図の上に11か所のピンが**順に**刺さり、それぞれから小さな研究室のアイコンが出る。カウンター札「11か国」「2,557人」。ピンの糸が真ん中の結果の紙へ集まる。動き: ピンが刺さる (11回) / 糸が集まる
// どこ: 研究室のコルク掲示板に貼った大きな世界地図 (実際の形に近い大陸・海の格子・テープ留め)
// 演出: 11本の赤いピンが順に刺さり、刺さるたびに小さな研究室 (フラスコの小屋) がぽん。糸が南大西洋の「結果の紙」へ集まる。カウンター札「11か国」「2,557人」
// 動き: ピンが上から刺さる (11回) / 糸が伸びて集まる / 数字が増える / カメラが少し引く
const HMH_MAP: number[][][] = [
  // 北アメリカ
  [[-168, 66], [-150, 71], [-120, 72], [-90, 74], [-75, 68], [-62, 58], [-55, 48], [-67, 44], [-75, 38], [-80, 31], [-81, 25], [-83, 29], [-90, 29], [-97, 26], [-97, 20], [-90, 16], [-83, 10], [-78, 8], [-85, 14], [-95, 16], [-105, 20], [-110, 24], [-112, 31], [-118, 34], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-165, 60]],
  // グリーンランド
  [[-55, 82], [-30, 83], [-20, 75], [-40, 65], [-52, 62], [-58, 75]],
  // 南アメリカ
  [[-78, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -42], [-68, -52], [-72, -54], [-75, -48], [-72, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-77, 4]],
  // ユーラシア
  [[-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [25, 71], [40, 68], [60, 70], [80, 73], [105, 78], [140, 72], [170, 70], [180, 66], [170, 60], [160, 58], [155, 52], [142, 47], [135, 43], [128, 35], [122, 31], [120, 23], [110, 20], [108, 12], [104, 9], [100, 13], [98, 8], [100, 3], [104, 1], [98, 15], [94, 17], [90, 22], [80, 15], [77, 8], [72, 20], [67, 25], [57, 26], [50, 30], [48, 29], [52, 24], [56, 24], [59, 22], [52, 16], [45, 13], [43, 15], [38, 22], [34, 28], [32, 31], [35, 34], [36, 36], [30, 36], [27, 37], [26, 40], [23, 37], [21, 40], [19, 42], [13, 46], [12, 44], [16, 40], [18, 40], [15, 38], [12, 42], [8, 44], [3, 43], [-1, 37], [-6, 36], [-9, 38]],
  // アフリカ
  [[-17, 21], [-16, 12], [-12, 7], [-5, 5], [5, 5], [9, 4], [10, -2], [13, -12], [12, -18], [15, -27], [18, -34], [25, -34], [32, -28], [35, -24], [40, -15], [40, -5], [44, 2], [51, 11], [43, 12], [38, 18], [33, 28], [30, 31], [20, 32], [10, 34], [10, 37], [0, 36], [-6, 36], [-10, 30]],
  // イギリス
  [[-5, 50], [1, 51], [0, 53], [-3, 56], [-5, 58], [-6, 55], [-4, 53]],
  // 日本
  [[130, 32], [132, 34], [136, 35], [140, 36], [141, 40], [140, 42], [142, 45], [145, 44], [141, 41], [140, 38], [137, 36], [133, 33]],
  // オーストラリア
  [[114, -22], [122, -18], [130, -12], [137, -12], [141, -11], [145, -15], [153, -25], [150, -37], [141, -38], [135, -34], [130, -32], [115, -34]],
  // マダガスカル
  [[44, -16], [50, -14], [48, -25], [44, -24]],
  // ニュージーランド
  [[172, -35], [178, -38], [174, -42], [168, -46], [171, -41]],
  // インドネシアの島々
  [[95, 5], [106, -6], [102, -4]], [[108, -6], [115, -8], [110, -8]], [[110, 1], [118, 5], [117, -3], [110, -2]],
];
const hmhP = (lon: number, lat: number): [number, number] => [160 + (lon + 180) * 4.444, 90 + (80 - lat) * 5.07];
const HMH_PINS: [number, number][] = [
  [-79, 43], [-122, 47], [-74, 41], [-1, 52], [13, 52], [5, 52], [24, 60], [2, 47], [139, 36], [151, -33], [-47, -23],
];

const Hm174: React.FC<{ f: number }> = ({ f }) => {
  const res: [number, number] = [800, 690];
  const n = HMH_PINS.filter((_, i) => f >= 4 + i * 2.6 + 3).length;
  const cam = 1.06 - 0.06 * easeOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={5174}>
      <g transform={`translate(960 460) scale(${cam}) translate(-960 -460)`}>
        {/* コルク板 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.cork} />
        {Array.from({ length: 160 }, (_, i) => (
          <circle key={i} cx={rnd(41, i) * 1920} cy={rnd(42, i) * 1080} r={2 + rnd(43, i) * 3} fill={C.corkDark} opacity={0.6} />
        ))}
        <rect x={-40} y={-40} width={2000} height={40} fill="#8E6234" stroke={KRP.ink} strokeWidth={6} />
        {/* 地図の紙 */}
        <rect x={150} y={80} width={1620} height={730} fill={KRP.ink} opacity={0.2} transform="translate(12 14)" />
        <rect x={150} y={80} width={1620} height={730} fill={C.sea} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={C.seaLine} strokeWidth={3} opacity={0.8}>
          {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={160 + i * 160} y1={84} x2={160 + i * 160} y2={806} />)}
          {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1={154} y1={90 + i * 152} x2={1766} y2={90 + i * 152} />)}
        </g>
        <line x1={154} y1={hmhP(0, 0)[1]} x2={1766} y2={hmhP(0, 0)[1]} stroke={C.seaLine} strokeWidth={5} strokeDasharray="14 10" />
        {HMH_MAP.map((poly, i) => (
          <polygon key={i} points={poly.map(([lo, la]) => hmhP(lo, la).join(",")).join(" ")}
            fill={C.land} stroke={C.landDark} strokeWidth={5} strokeLinejoin="round" />
        ))}
        {HMH_MAP.map((poly, i) => (
          <polygon key={`o${i}`} points={poly.map(([lo, la]) => hmhP(lo, la).join(",")).join(" ")}
            fill="none" stroke={KRP.ink} strokeWidth={2.5} strokeLinejoin="round" opacity={0.7} />
        ))}
        {/* テープ */}
        {([[170, 96, 35], [1750, 96, -35], [172, 794, -35], [1748, 794, 35]] as const).map(([tx, ty, r], i) => (
          <rect key={i} x={tx - 50} y={ty - 18} width={100} height={36} rx={4} fill={i % 2 ? "#E8A3A0" : "#9FC8C0"} opacity={0.9}
            stroke={KRP.ink} strokeWidth={3} transform={`rotate(${r} ${tx} ${ty})`} />
        ))}
        {/* 糸 (ピンから結果の紙へ) */}
        {HMH_PINS.map(([lo, la], i) => {
          const [px, py] = hmhP(lo, la);
          const t = seg(f, 10 + i * 2.6, 22 + i * 2);
          if (t <= 0) return null;
          return <line key={i} x1={px} y1={py} x2={lerp(px, res[0], t)} y2={lerp(py, res[1] - 40, t)} stroke={KRP.red} strokeWidth={4} opacity={0.85} />;
        })}
        {/* 結果の紙 */}
        <g transform={`translate(${res[0]} ${res[1]}) rotate(-3) scale(${pop(seg(f, 6, 16))})`}>
          <rect x={-130} y={-70} width={260} height={150} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => <line key={k} x1={-100} y1={-20 + k * 28} x2={60 - k * 30} y2={-20 + k * 28} stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" />)}
          <rect x={60} y={-10} width={50} height={70} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
          <rect x={20} y={20} width={30} height={40} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-46} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ピンと小さな研究室 */}
        {HMH_PINS.map(([lo, la], i) => {
          const [px, py] = hmhP(lo, la);
          const t = seg(f, 4 + i * 2.6, 7 + i * 2.6);
          if (t <= 0) return null;
          const dy = (1 - easeInOut(t)) * -90;
          const lab = pop(seg(f, 7 + i * 2.6, 12 + i * 2.6));
          const side = i % 2 ? 1 : -1;
          return (
            <g key={i}>
              {t >= 1 && f - (7 + i * 2.6) < 4 && <circle cx={px} cy={py} r={14 + (f - 7 - i * 2.6) * 6} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.8} />}
              {lab > 0 && (
                <g transform={`translate(${px + side * 46} ${py - 30}) scale(${lab * 0.9})`}>
                  <path d="M -30 0 L -30 -30 L 0 -50 L 30 -30 L 30 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <path d="M -8 -4 L -8 -22 L -14 -32 L 14 -32 L 8 -22 L 8 -4 Z" fill={HP.fun} stroke={KRP.ink} strokeWidth={3} transform="translate(0 2) scale(0.9)" />
                </g>
              )}
              <g transform={`translate(0 ${dy})`}>
                <line x1={px} y1={py} x2={px + 6} y2={py - 26} stroke={KRP.grayDark} strokeWidth={4} />
                <circle cx={px + 8} cy={py - 32} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={px + 4} cy={py - 36} r={4} fill={KRP.white} opacity={0.7} />
              </g>
            </g>
          );
        })}
        {/* カウンター札 */}
        <TagPlate x={360} y={740} text={`${Math.max(1, n)}か国`} size={50} t={seg(f, 4, 10)} />
        <TagPlate x={1540} y={740} text="2,557人" size={50} t={seg(f, 32, 40)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #175 結果は、どこでも同じ。ただ考えているより、何かしているほうが、楽しい。
// 格: 山 / seed 5175
// 絵: どこ: 世界の11の研究室を並べたモザイク (3×4のコマ)。演出: どのコマでも、「じっと考えている人」(つまらなそう) と「何かしている人」(編み物・パズル・料理…楽しそう) が並んでいる。全部のコマで右の人が笑っている。真ん中に大きな「=」ではなく、すべてのコマに同じ○。動き: コマが順に光る / ○がぽん
// どこ: #174 と同じコルク掲示板に、世界の11の研究室の写真を3×4で貼ったモザイク (12枚目は集計カード)
// 演出: どのコマも、左=じっと考えるだけの人 (つまらない顔・「…」の吹き出し)、右=何かしている人 (編み物・パズル・料理・お絵かき) が笑っている。全部のコマの右の人に同じ赤い○
// 動き: コマが左上から順に光る / ○がぽん / 右の人の手元の小物が動く / 最後に集計カード「11/11」
const HmHActivity: React.FC<{ kind: number; x: number; y: number; s: number; f: number }> = ({ kind, x, y, s, f }) => {
  const k = kind % 4;
  const hx = x, hy = y - 118 * s; // hold の手元
  if (k === 0) {
    // 編み物: 毛糸玉と2本の棒
    const w = Math.sin(f / 3) * 10;
    return (
      <g>
        <circle cx={x + 70 * s} cy={y - 20 * s} r={26 * s} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M ${x + 50 * s} ${y - 30 * s} q ${-10 * s} ${-40 * s} ${-40 * s} ${-80 * s}`} stroke={KRP.red} strokeWidth={3} fill="none" />
        <rect x={hx - 26 * s} y={hy - 4 * s} width={52 * s} height={30 * s} rx={6 * s} fill="#E07A6A" stroke={KRP.ink} strokeWidth={3} />
        <line x1={hx - 20 * s} y1={hy} x2={hx - 40 * s} y2={hy - 50 * s + w * s} stroke={HP.brassDark} strokeWidth={5} strokeLinecap="round" />
        <line x1={hx + 20 * s} y1={hy} x2={hx + 40 * s} y2={hy - 50 * s - w * s} stroke={HP.brassDark} strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  }
  if (k === 1) {
    // パズル: 机の上のピース
    const lift = Math.abs(Math.sin(f / 5)) * 20 * s;
    return (
      <g>
        <rect x={x - 70 * s} y={y - 52 * s} width={140 * s} height={14 * s} fill={C.deskWood} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((i) => <rect key={i} x={x - 60 * s + i * 40 * s} y={y - 70 * s} width={34 * s} height={18 * s} fill={[KRP.blue, KRP.yellow, KRP.green][i]} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={hx - 14 * s} y={hy - 30 * s - lift} width={30 * s} height={26 * s} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  }
  if (k === 2) {
    // 料理: フライパンと湯気
    const flip = Math.sin(f / 4) * 14 * s;
    return (
      <g>
        <ellipse cx={hx} cy={hy - 4 * s} rx={46 * s} ry={12 * s} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <line x1={hx - 40 * s} y1={hy} x2={hx - 90 * s} y2={hy + 8 * s} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={hx + 4 * s} cy={hy - 22 * s - flip} rx={22 * s} ry={9 * s} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M ${hx + 20 * s} ${hy - 50 * s} q ${8 * s} ${-14 * s} 0 ${-28 * s}`} stroke={KRP.white} strokeWidth={4} fill="none" />
      </g>
    );
  }
  // お絵かき: スケッチブックと筆
  const dr = Math.sin(f / 3) * 12 * s;
  return (
    <g>
      <rect x={hx - 40 * s} y={hy - 60 * s} width={80 * s} height={62 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={hx - 10 * s} cy={hy - 34 * s} r={12 * s} fill={KRP.orange} />
      <path d={`M ${hx - 30 * s} ${hy - 10 * s} q ${20 * s} ${-20 * s} ${50 * s} 0`} stroke={HP.fun} strokeWidth={4} fill="none" />
      <line x1={hx + 30 * s + dr} y1={hy - 20 * s} x2={hx + 60 * s + dr} y2={hy - 70 * s} stroke={KRP.bronze} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

const Hm175: React.FC<{ f: number }> = ({ f }) => {
  const cw = 420, ch = 236, gx = 96, gy = 80, gapX = 16, gapY = 14;
  const walls = ["#E9E2D0", "#D8E4EC", "#EADBD6", "#DDE7D6", "#EEE6C9", "#E2DAE9"];
  const cam = 1.04 - 0.04 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5175}>
      <g transform={`translate(960 450) scale(${cam}) translate(-960 -450)`}>
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.cork} />
        {Array.from({ length: 160 }, (_, i) => (
          <circle key={i} cx={rnd(51, i) * 1920} cy={rnd(52, i) * 1080} r={2 + rnd(53, i) * 3} fill={C.corkDark} opacity={0.6} />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const x0 = gx + col * (cw + gapX), y0 = gy + row * (ch + gapY);
          const rot = (rnd(55, i) - 0.5) * 3;
          const lit = seg(f, 3 + i * 2.6, 7 + i * 2.6);
          const maru = pop(seg(f, 6 + i * 2.6, 11 + i * 2.6));
          const ccx = x0 + cw / 2;
          if (i === 11) {
            return (
              <g key={i} transform={`rotate(${rot} ${ccx} ${y0 + ch / 2})`}>
                <rect x={x0 + 4} y={y0 + 6} width={cw} height={ch} fill={KRP.ink} opacity={0.2} />
                <rect x={x0} y={y0} width={cw} height={ch} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} opacity={lit > 0 ? 1 : 0.6} />
                <g transform={`translate(${ccx - 120} ${y0 + ch / 2}) scale(${pop(seg(f, 34, 42))})`}>
                  <circle r={56} fill="none" stroke={KRP.red} strokeWidth={12} />
                </g>
                <text x={ccx + 85} y={y0 + ch / 2 + 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70}
                  fill={KRP.ink} opacity={seg(f, 34, 40)}>11/11</text>
              </g>
            );
          }
          return (
            <g key={i} transform={`rotate(${rot} ${ccx} ${y0 + ch / 2})`}>
              <rect x={x0 + 4} y={y0 + 6} width={cw} height={ch} fill={KRP.ink} opacity={0.2} />
              <rect x={x0 - 10} y={y0 - 10} width={cw + 20} height={ch + 20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <defs><clipPath id={`hmh175c${i}`}><rect x={x0} y={y0} width={cw} height={ch} /></clipPath></defs>
              <g clipPath={`url(#hmh175c${i})`}>
                <rect x={x0} y={y0} width={cw} height={ch} fill={walls[i % 6]} />
                <rect x={x0} y={y0 + ch * 0.74} width={cw} height={ch * 0.26} fill={C.labTileLine} />
                {/* 研究室の小物: 棚・窓 */}
                <rect x={x0 + 16} y={y0 + 18} width={70} height={50} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
                <line x1={x0 + 51} y1={y0 + 18} x2={x0 + 51} y2={y0 + 68} stroke={KRP.ink} strokeWidth={3} />
                <rect x={x0 + cw - 110} y={y0 + 40} width={90} height={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={2} />
                {[0, 1, 2].map((k) => <rect key={k} x={x0 + cw - 104 + k * 28} y={y0 + 18} width={18} height={22} rx={4}
                  fill={[HP.fun, KRP.orange, KRP.blue][(k + i) % 3]} stroke={KRP.ink} strokeWidth={2} />)}
                {/* 左: 考えているだけの人 */}
                <Person x={x0 + 110} y={y0 + ch - 8} s={0.6} f={f} face="sad" pose="armsFolded" cloth={["#7E868E", "#6A6F8A", "#8A7A6A"][i % 3]} clothDark="#555A66" phase={i} />
                <g opacity={0.9}>
                  <ellipse cx={x0 + 190} cy={y0 + 36} rx={40} ry={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                  <circle cx={x0 + 160} cy={y0 + 66} r={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
                  {[0, 1, 2].map((k) => <circle key={k} cx={x0 + 176 + k * 14} cy={y0 + 36} r={4} fill={KRP.ink}
                    opacity={Math.floor(f / 6 + k) % 3 === 0 ? 1 : 0.4} />)}
                </g>
                {/* 右: 何かしている人 (笑顔) */}
                <Person x={x0 + 300} y={y0 + ch - 8} s={0.6} f={f} face={lit > 0.5 ? "joy" : "smile"} pose="hold"
                  cloth={["#E58A4C", "#4F7DB8", "#7FBF7A", "#D3402E", "#9A6AB0", "#E6B83E"][i % 6]} clothDark="#444" phase={i + 3} />
                <HmHActivity kind={i} x={x0 + 300} y={y0 + ch - 8} s={0.6} f={f + i * 3} />
                {/* 光る */}
                <rect x={x0} y={y0} width={cw} height={ch} fill={HP.spark} opacity={lit * (1 - lit) * 1.4} />
              </g>
              {/* 赤い○ (右の人) */}
              {maru > 0 && (
                <g transform={`translate(${x0 + 300} ${y0 + 112}) scale(${maru})`}>
                  <circle r={74} fill="none" stroke={KRP.red} strokeWidth={10} opacity={0.9} />
                </g>
              )}
              {/* 押しピン */}
              <circle cx={ccx} cy={y0 - 4} r={11} fill={[KRP.red, KRP.blueDeep, KRP.green, KRP.yellow][i % 4]} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #176 別の実験では、同じ場面を1時間くり返すだけの、退屈な映像を見せました。
// 格: 山 / seed 5176
// 絵: どこ: 暗い視聴室 (スクリーン・椅子・映写機)。演出: スクリーンに、同じ場面 (2人がテニスボールを1回打ち合うだけ) が**くり返しループ**で流れる。画面の隅のカウンターが「1回目」「2回目」…とぱらぱら増える。札「1時間」。観客の頭が少しずつ下がる。動き: 同じ場面がループ / カウンター / 観客がうなだれる
// どこ: 暗い視聴室。右の壁に大きなスクリーン、左奥の棚に映写機 (光の帯がスクリーンへ)、赤い客席に3人
// 演出: スクリーンは「2人がテニスボールを1回打ち合うだけ」のループ。隅のカウンターが「1回目」「2回目」…とぱらぱら増える。札「1時間」。3人の頭がだんだん下がる
// 動き: ボールが往復 (24コマで1回) / カウンター / 映写機のリール / 観客がうなだれていく / カメラがゆっくりパン
const HmHViewRoom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={2000} height={1160} fill={C.dark} />
    {/* 壁の吸音パネル */}
    <g stroke={C.dark2} strokeWidth={6}>
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={-40} x2={i * 170} y2={700} />)}
    </g>
    <rect x={-40} y={700} width={2000} height={440} fill="#24222E" />
    <rect x={-40} y={692} width={2000} height={14} fill={C.dark2} stroke={KRP.ink} strokeWidth={4} />
    {/* 映写機 (左上の棚) */}
    <g>
      <rect x={30} y={170} width={220} height={20} fill="#5A4636" stroke={KRP.ink} strokeWidth={5} />
      <rect x={70} y={100} width={150} height={70} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {[100, 190].map((cx, k) => (
        <g key={cx} transform={`translate(${cx} 74) rotate(${f * (k ? 9 : 7)})`}>
          <circle r={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((j) => <circle key={j} cx={Math.cos(j * 2.1) * 18} cy={Math.sin(j * 2.1) * 18} r={7} fill={C.dark} />)}
        </g>
      ))}
      <rect x={220} y={118} width={30} height={34} fill={KRP.ink} />
    </g>
    {/* 光の帯 */}
    <polygon points="250,122 250,148 1100,560 1100,110" fill={C.beam} opacity={0.12 + 0.02 * Math.sin(f / 2)} />
    {/* 非常口の緑のランプ */}
    <rect x={560} y={60} width={90} height={40} rx={6} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
    <PersonMini x={590} y={96} s={0.16} color={KRP.white} face="none" />
  </g>
);
const HmHSeatBack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-95} y={-230} width={190} height={200} rx={34} fill={C.seat} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-75} y={-210} width={150} height={150} rx={24} fill={C.seatDark} opacity={0.5} />
  </g>
);
const HmHSeatFront: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-105} y={-62} width={210} height={44} rx={16} fill={C.seat} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-125} y={-130} width={30} height={150} rx={12} fill={C.seatDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={95} y={-130} width={30} height={150} rx={12} fill={C.seatDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-20} y={-18} width={40} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const HmHScreen: React.FC<{ f: number; x?: number; y?: number; w?: number; h?: number; counter?: boolean }> = ({ f, x = 1100, y = 110, w = 740, h = 450, counter = true }) => {
  const count = 1 + Math.floor(f / 24);
  return (
    <g>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill={KRP.ink} />
      <HmHTennis x={x} y={y} w={w} h={h} f={f} />
      <rect x={x} y={y} width={w} height={h} fill={C.beam} opacity={0.12} />
      {counter && (
        <g transform={`translate(${x + w - 130} ${y + 20})`}>
          <rect width={114} height={50} rx={8} fill={KRP.ink} opacity={0.75} />
          <text x={57} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white}>{`${count}回目`}</text>
        </g>
      )}
    </g>
  );
};

const Hm176: React.FC<{ f: number }> = ({ f }) => {
  const pan = -30 * easeInOut(seg(f, 0, 42));
  const seats = [
    { x: 300, droop: 22, c: "#33416A", ph: 1 },
    { x: 560, droop: 16, c: "#6E8A5E", ph: 3 },
    { x: 820, droop: 26, c: "#9A6AB0", ph: 5 },
  ];
  return (
    <Frame f={f} seed={5176} dark>
      <g transform={`translate(${pan} 0)`}>
        <HmHViewRoom f={f} />
        <HmHScreen f={f} />
        <TagPlate x={1470} y={650} text="1時間" size={46} t={seg(f, 6, 14)} color={KRP.ink} />
        {seats.map((p, i) => {
          const d = p.droop * easeInOut(seg(f, 4 + i * 3, 40));
          return (
            <g key={i}>
              <HmHSeatBack x={p.x} y={780} />
              <g transform={`translate(0 ${d * 0.8})`}>
                <Person x={p.x} y={780} s={0.95} f={f} pose="sit" face={d > p.droop * 0.5 ? "sad" : "normal"} gaze={[8, d > 8 ? 6 : 0]}
                  lean={d * 0.7} cloth={p.c} clothDark="#2A2F45" phase={p.ph} />
              </g>
              <HmHSeatFront x={p.x} y={800} />
              {i === 2 && f > 30 && (
                <text x={p.x + 90} y={480 - (f - 30) * 2} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}
                  opacity={seg(f, 30, 36)}>z</text>
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #177 見る側にとっては、なかなかの修行です。
// 格: 山 / seed 5177
// 絵: どこ: #176 の視聴室 (続き)。演出: 観客が、だんだん座禅の姿勢になり、頭の上に滝 (修行の滝行) が流れ落ちてくる (比喩)。観客は目をつぶって耐える。スクリーンの映像はまだ同じループ。動き: 滝が落ちる / 観客が目をつぶる / ループの映像
// どこ: #176 と同じ視聴室 (続き。同じ客席・同じスクリーン)
// 演出 (第1回修正): 映画館の壁だけが上から下へ降りてきて、大きな滝の岩場 (岩肌・白い水の筋・しぶき・苔) に入れ替わる。境目は水しぶきの線。
//       スクリーン (同じループ)・赤い客席・観客は残る。観客は座禅で目をぎゅっとつぶって耐える
// 動き: 背景が降りる f6-38 (f=45 で滝に変わりきり) / 水の筋が流れる / しぶき / 目をつぶる / ループの映像 / カメラがゆっくり寄る
// 映画館の壁の代わりに降りてくる「滝の岩場」。壁と同じ範囲 (y -40〜700) に描く
const HmHFallsBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 空と、崖の上の木 */}
    <rect x={-40} y={-40} width={2040} height={200} fill={C.sky} />
    {[[60, 40, 70], [170, 20, 90], [1010, 30, 80], [1180, 10, 100], [1420, 26, 84], [1700, 14, 96], [1900, 34, 74]].map(([tx, ty, r], i) => (
      <circle key={i} cx={tx} cy={ty} r={r} fill={i % 2 ? C.moss : C.mossDark} stroke={KRP.ink} strokeWidth={5} />
    ))}
    {/* 岩肌 (左右の崖) */}
    <path d="M -40 80 Q 60 60 150 90 L 230 70 L 210 700 L -40 700 Z" fill={C.rock} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 900 70 L 990 90 Q 1200 60 1500 100 Q 1760 70 2000 96 L 2000 700 L 960 700 Z" fill={C.rock} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 滝の奥の岩 (水の裏の暗い岩) */}
    <path d="M 230 70 L 900 70 L 960 700 L 210 700 Z" fill={C.rockDark} />
    {/* 岩の割れ目と地層 */}
    <g stroke={C.rockDark} strokeWidth={6} fill="none" strokeLinecap="round">
      <path d="M -20 220 q 60 -16 120 6 q 40 10 90 -6" />
      <path d="M -30 420 q 80 20 150 -4 l 60 14" />
      <path d="M 40 300 l 30 60 l -20 50" />
      <path d="M 1000 240 q 40 20 70 -10" />
      <path d="M 980 480 q 50 -20 90 10 l 20 60" />
      <path d="M 1860 620 q 40 -30 120 -10" />
    </g>
    {/* 苔 (岩のふち・滝の両わき) */}
    {[[200, 110, 44], [120, 250, 36], [190, 380, 30], [60, 560, 40], [930, 120, 40], [1000, 300, 34], [1050, 600, 42], [1880, 640, 46], [1020, 80, 30]].map(([mx, my, r], i) => (
      <g key={i}>
        <ellipse cx={mx} cy={my} rx={r} ry={r * 0.55} fill={i % 2 ? C.moss : C.mossDark} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${mx - r * 0.5} ${my + r * 0.4} q 4 ${20 + Math.sin(f / 9 + i) * 4} -2 ${34}`} stroke={C.mossDark} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    ))}
    {/* 大きな滝 (上の岩棚から落ちる) */}
    <path d="M 250 76 L 880 76 L 940 690 L 220 690 Z" fill={C.water} />
    <path d="M 330 76 L 520 76 L 500 690 L 300 690 Z" fill={KRP.white} opacity={0.55} />
    <path d="M 640 76 L 790 76 L 840 690 L 660 690 Z" fill={KRP.white} opacity={0.45} />
    <g strokeLinecap="round">
      {Array.from({ length: 22 }, (_, k) => {
        const t = k / 21;
        const x0 = 262 + t * 606, x1 = 232 + t * 696;
        return (
          <line key={k} x1={x0} y1={84} x2={x1} y2={680}
            stroke={k % 3 === 0 ? C.waterDeep : KRP.white} strokeWidth={k % 3 === 0 ? 7 : 9}
            strokeDasharray={k % 2 ? "70 40" : "110 50"} strokeDashoffset={-f * 26 - k * 37} opacity={0.9} />
        );
      })}
    </g>
    <path d="M 250 76 L 220 690 M 880 76 L 940 690" stroke={KRP.ink} strokeWidth={5} fill="none" />
    {/* 落ち口: 岩棚と、ふちで巻く白い水 */}
    <path d="M 200 52 Q 560 30 920 52 L 920 78 Q 560 64 200 78 Z" fill={C.rockDark} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 240 74 Q 560 58 890 74 Q 560 100 240 74 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    {/* 滝つぼ: 水面としぶき */}
    <rect x={-40} y={650} width={2040} height={50} fill={C.waterDeep} />
    <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
      {Array.from({ length: 9 }, (_, k) => (
        <line key={k} x1={-20 + k * 230 + ((f * 3) % 60)} y1={672 + (k % 2) * 12} x2={60 + k * 230 + ((f * 3) % 60)} y2={672 + (k % 2) * 12} />
      ))}
    </g>
    {Array.from({ length: 14 }, (_, k) => {
      const ph = ((f * 2 + k * 11) % 30) / 30;
      return (
        <circle key={k} cx={220 + k * 52 + Math.sin(k * 2.3) * 10} cy={670 - ph * 50} r={26 + 14 * ph + (k % 3) * 6}
          fill={KRP.white} opacity={0.85 * (1 - ph * 0.6)} />
      );
    })}
  </g>
);
// 降りてくる境目の水しぶきの線
const HmHSplashEdge: React.FC<{ y: number; f: number }> = ({ y, f }) => (
  <g>
    <path d={`M -40 ${y} ${Array.from({ length: 22 }, (_, k) => `Q ${-40 + k * 95 + 47} ${y + (k % 2 ? 22 : -22) + Math.sin(f / 2 + k) * 6} ${-40 + (k + 1) * 95} ${y}`).join(" ")} L 2000 ${y - 26} L -40 ${y - 26} Z`}
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({ length: 26 }, (_, k) => {
      const ph = ((f * 3 + k * 7) % 12) / 12;
      return (
        <circle key={k} cx={-20 + k * 80 + (k % 3) * 14} cy={y + 18 + ph * 40 * (1 + (k % 2))} r={7 + (k % 3) * 3}
          fill={C.water} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - ph} />
      );
    })}
  </g>
);
// 映写機 (視聴室と同じ物。滝の岩場に変わったあとも映写を続ける)
const HmHProjector: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={30} y={170} width={220} height={20} fill="#5A4636" stroke={KRP.ink} strokeWidth={5} />
    <rect x={70} y={100} width={150} height={70} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    {[100, 190].map((cx, k) => (
      <g key={cx} transform={`translate(${cx} 74) rotate(${f * (k ? 9 : 7)})`}>
        <circle r={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((j) => <circle key={j} cx={Math.cos(j * 2.1) * 18} cy={Math.sin(j * 2.1) * 18} r={7} fill={C.dark} />)}
      </g>
    ))}
    <rect x={220} y={118} width={30} height={34} fill={KRP.ink} />
  </g>
);
const Hm177: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const seats = [
    { x: 300, c: "#33416A", ph: 1 },
    { x: 560, c: "#6E8A5E", ph: 3 },
    { x: 820, c: "#9A6AB0", ph: 5 },
  ];
  const s = 0.95;
  // 背景が上から降りてくる: 境目 dropY が -40 → 700
  const drop = easeInOut(seg(f, 6, 38));
  const dropY = lerp(-40, 700, drop);
  return (
    <Frame f={f} seed={5177} dark>
      <g transform={`translate(560 420) scale(${cam}) translate(-560 -420)`}>
        <HmHViewRoom f={f} />
        {/* 壁だけが、滝の岩場に入れ替わりながら降りてくる */}
        {drop > 0 && (
          <g transform={`translate(0 ${dropY - 700})`}>
            <HmHFallsBg f={f} />
            <HmHProjector f={f} />
          </g>
        )}
        {drop > 0 && drop < 1 && <HmHSplashEdge y={dropY} f={f} />}
        {/* 映写機の光 (滝に変わっても映写は続く) */}
        {drop >= 1 && <polygon points="250,122 250,148 1100,560 1100,110" fill={C.beam} opacity={0.14 + 0.02 * Math.sin(f / 2)} />}
        <HmHScreen f={f + 96} />
        <TagPlate x={1470} y={650} text="1時間" size={46} />
        {seats.map((p, i) => {
          const fy = 780; // 足元 (座面に組んだ足)
          const headTop = fy - 40 - 292 * s;
          const closed = f > 8 + i * 4;
          const wet = seg(f, 30 + i * 2, 38 + i * 2);
          return (
            <g key={i}>
              <HmHSeatBack x={p.x} y={780} />
              <HmHSeatFront x={p.x} y={800} />
              {/* 座禅の人 (足を組む)。滝の音に耐えて肩がふるえる */}
              <g transform={`translate(${closed ? Math.sin(f * 1.7 + i) * 1.5 : 0} 0)`}>
                <Person x={p.x} y={fy - 40} s={s} f={f} pose="hold" face="worried" cloth={p.c} clothDark="#2A2F45" phase={p.ph} still />
                <ellipse cx={p.x} cy={fy - 50} rx={110 * s} ry={30} fill="#2A2F45" stroke={KRP.ink} strokeWidth={5} />
                <ellipse cx={p.x - 50} cy={fy - 50} rx={22} ry={12} fill={KRP.ink} />
                <ellipse cx={p.x + 50} cy={fy - 50} rx={22} ry={12} fill={KRP.ink} />
                {closed && <HmHClosedEyes x={p.x} y={fy - 40} s={s} f={0} tight />}
              </g>
              {/* 滝のしぶきが頭にぱらぱら */}
              {wet > 0 && Array.from({ length: 5 }, (_, k) => {
                const ph = ((f * 2 + k * 9 + i * 5) % 16) / 16;
                return <circle key={k} cx={p.x - 50 + k * 25} cy={headTop - 30 + ph * 40} r={6} fill={C.water} stroke={KRP.ink} strokeWidth={2}
                  opacity={wet * (1 - ph)} />;
              })}
              {/* がまんの汗 */}
              {closed && <path d={`M ${p.x + 70} ${fy - 270} q -8 14 0 20 q 8 -6 0 -20 Z`} fill={C.water} stroke={KRP.ink} strokeWidth={2.5}
                transform={`translate(0 ${(f % 16) * 1.5})`} />}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #178 すると人は、お菓子をたくさん食べ、自分への電気ショックも、多く流しました。
// 格: 山 / seed 5178
// 絵: どこ: #176 の視聴室 (観客のアップ)。演出: 観客の手が、横のお菓子の皿 (色とりどりの粒のチョコ) にどんどん伸びて、皿が空になっていく。もう片方の手は、手元の電気の箱のボタンをちょんちょん押している (小さな稲妻)。スクリーンは同じループ。動き: お菓子が減る / ボタン / 稲妻
// どこ: #176 の視聴室 (観客のアップ)。後ろに同じテニスのループが映るスクリーン
// 演出: 左手が横の台のお菓子の皿 (色とりどりの粒のチョコ) にのびて、粒がひとつずつ口へ飛ぶ。皿はどんどん空に。右手は手元の電気の箱のボタンをちょんちょん。手首のバンドに小さな稲妻、肩が「びくっ」
// 動き: お菓子が減る / 粒が口へ / ボタンを押す (10コマに1回) / 稲妻 / もぐもぐ / カメラが少し寄る
const Hm178: React.FC<{ f: number }> = ({ f }) => {
  const s = 1.5, px = 960, py = 900;
  const cam = 1 + 0.04 * easeOut(seg(f, 0, 42));
  const total = 26;
  const eaten = Math.floor(seg(f, 2, 40) * 22);
  const left = total - eaten;
  const press = (f % 10) >= 4 && (f % 10) < 7 ? 1 : 0;
  const jolt = press ? 4 : 0;
  // 手の位置
  const lhx = 640, lhy = 640 + Math.sin(f / 3) * 6;
  const rhx = 1290, rhy = 624 + press * 12;
  const shL: [number, number] = [px - 98 * s, py - 72 * s];
  const shR: [number, number] = [px + 98 * s, py - 72 * s];
  const mouth: [number, number] = [px, py - 186 * s];
  const band: [number, number] = [lerp(shR[0], rhx, 0.45), lerp(shR[1], rhy, 0.45)];
  const fly = (f % 8) / 8;
  const fx = lerp(lhx, mouth[0], fly), fy = lerp(lhy - 20, mouth[1], fly) - Math.sin(fly * Math.PI) * 120;
  const chew = Math.abs(Math.sin(f / 2)) * 6;
  const arm = (a: [number, number], b: [number, number]) => {
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return <rect x={a[0]} y={a[1] - 16} width={len} height={32} rx={16} fill="#33416A" stroke={KRP.ink} strokeWidth={6}
      transform={`rotate(${ang} ${a[0]} ${a[1]})`} />;
  };
  // ボタンを押すたび (f=4,14,24,34…) に8コマ、画面が小刻みに揺れて止まる
  const lastP = f >= 4 ? f - ((f - 4) % 10) : -100;
  const hit = seg(f, lastP, lastP + 8);
  // 揺れと音は最初の7回 (f=4〜64) だけ。そのあとは静かに押し続ける (親が調整・効果音 himaSe.ts とそろえる)
  const amp = hit > 0 && hit < 1 && lastP <= 64 ? 8 * (1 - hit) : 0;
  const shakeX = amp * Math.sin(f * 2.7), shakeY = amp * Math.cos(f * 3.3);
  return (
    <Frame f={f} seed={5178} dark>
      <g transform={`translate(${shakeX} ${shakeY})`}>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.dark} />
        <HmHScreen f={f + 200} x={260} y={50} w={1400} h={360} />
        <polygon points="260,410 1660,410 1900,1080 20,1080" fill={C.beam} opacity={0.06} />
        {/* 客席の背 */}
        <rect x={px - 200} y={py - 470} width={400} height={420} rx={60} fill={C.seat} stroke={KRP.ink} strokeWidth={7} />
        {/* 左の小さな台とお菓子の皿 */}
        <rect x={420} y={690} width={320} height={26} rx={8} fill="#5A4636" stroke={KRP.ink} strokeWidth={6} />
        <rect x={560} y={716} width={40} height={200} fill="#4A3A2E" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 450 640 Q 580 720 710 640 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={580} cy={640} rx={130} ry={22} fill="#EDEAE0" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: left }, (_, i) => {
          const row = Math.floor(i / 7);
          return <ellipse key={i} cx={480 + (i % 7) * 30 + (row % 2) * 14} cy={646 - row * 14} rx={14} ry={9}
            fill={C.choco[i % C.choco.length]} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* こぼれた粒 */}
        {Array.from({ length: Math.min(6, Math.floor(eaten / 4)) }, (_, i) => (
          <ellipse key={i} cx={460 + i * 50} cy={930 + (i % 2) * 14} rx={12} ry={8} fill={C.choco[(i + 2) % C.choco.length]} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 右: 電気の箱 (実験室と同じ灰色の箱) */}
        <rect x={1180} y={690} width={300} height={26} rx={8} fill="#5A4636" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1310} y={716} width={40} height={200} fill="#4A3A2E" stroke={KRP.ink} strokeWidth={5} />
        <g>
          <rect x={1210} y={610} width={220} height={80} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={1290} cy={656} rx={44} ry={14} fill="#8E2A1E" />
          <ellipse cx={1290} cy={646 + press * 6} rx={40} ry={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1395} cy={636} r={9} fill={press ? HP.spark : KRP.green} stroke={KRP.ink} strokeWidth={3} />
          {press > 0 && <circle cx={1290} cy={640} r={70} fill={HP.spark} opacity={0.3} />}
        </g>
        {/* 観客 */}
        <g transform={`translate(${jolt} ${-jolt})`}>
          <Person x={px} y={py} s={s} f={f} pose="sit" face={press ? "surprised" : "normal"} gaze={[-4, 0]} cloth="#33416A" clothDark="#252F4F" phase={2} />
          {/* もぐもぐのほっぺ */}
          <ellipse cx={px + 50} cy={py - 180 * s} rx={16 + chew * 0.6} ry={13 + chew * 0.4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={px + 54} cy={py - 178 * s} rx={8} ry={5} fill="#F0A0A0" opacity={0.7} />
          {/* 伸びる腕 */}
          {arm(shL, [lhx, lhy])}
          {arm(shR, [rhx, rhy])}
          <circle cx={lhx} cy={lhy} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={rhx} cy={rhy} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {/* 腕のバンド (電極) とコード */}
          <circle cx={band[0]} cy={band[1]} r={24} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={band[0]} cy={band[1]} r={8} fill={press ? HP.spark : KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          {press > 0 && (
            <g>
              <HmHBolt x={band[0] - 10} y={band[1] - 56} s={1.1} />
              <HmHBolt x={band[0] + 40} y={band[1] - 30} s={0.8} />
              <path d={`M ${px - 120} ${py - 400} l -30 -14 M ${px + 120} ${py - 400} l 30 -14 M ${px - 130} ${py - 360} l -36 0`}
                stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
            </g>
          )}
        </g>
        <path d={`M 1430 660 C 1520 700 1500 820 1300 840 S ${band[0] + 20} 860 ${band[0]} ${band[1] + 22}`} stroke={KRP.ink} strokeWidth={6} fill="none" />
        {/* 飛んでいく粒 */}
        {f > 2 && <ellipse cx={fx} cy={fy} rx={14} ry={9} fill={C.choco[Math.floor(f / 8) % C.choco.length]} stroke={KRP.ink} strokeWidth={3} />}
      </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #179 そもそも、退屈とは、何なのでしょうか。
// 格: 並 / seed 5179
// 絵: どこ: 研究室の机の上の、退屈を入れた**標本の瓶** (コルク栓・ラベルは「?」)。演出: 瓶の中で、灰色のもやもや (退屈) がぐるぐる回る。研究者が虫めがねでのぞきこむ。机のランプ。動き: もやもやが回る / 虫めがね
// どこ: 研究室の机。奥にタイルの壁と標本の瓶の並ぶ棚。左に卓上ランプ。机の真ん中に大きな標本の瓶 (コルク栓・ラベル「?」)
// 演出: 瓶の中で灰色のもやもや (退屈) がぐるぐる回る。白衣の研究者が右から身を乗り出し、虫めがねでのぞきこむ (レンズの中でもやもやが大きく見える)
// 動き: もやもやが回る / 虫めがねがゆっくり動く / ランプのゆらぎ / カメラが瓶に寄る
const HmHLab: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.85 + 0.15 * Math.sin(f / 4);
  return (
    <g>
      <rect x={-40} y={-40} width={2000} height={800} fill={C.labTile} />
      <g stroke={C.labTileLine} strokeWidth={3}>
        {Array.from({ length: 26 }, (_, i) => <line key={`v${i}`} x1={i * 80} y1={-40} x2={i * 80} y2={760} />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={-40} y1={i * 80} x2={1960} y2={i * 80} />)}
      </g>
      {/* 棚と標本の瓶 */}
      {[200, 420].map((sy, r) => (
        <g key={sy}>
          <rect x={60} y={sy} width={1800} height={16} fill={C.deskWoodDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => {
            if (i >= 4 && i <= 7) return null;
            const jx = 110 + i * 150, h = 90 + ((i + r) % 3) * 20;
            return (
              <g key={i}>
                <rect x={jx} y={sy - h} width={70} height={h} rx={12} fill={C.jarGlass} stroke={KRP.ink} strokeWidth={4} />
                <rect x={jx + 6} y={sy - h * 0.6} width={58} height={h * 0.6 - 4} rx={8} fill={[HP.fun, KRP.yellow, KRP.orange, KRP.blue][(i + r) % 4]} opacity={0.55} />
                <rect x={jx + 10} y={sy - h - 16} width={50} height={18} rx={4} fill={C.corkStop} stroke={KRP.ink} strokeWidth={3} />
                <rect x={jx + 14} y={sy - h * 0.5} width={42} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
              </g>
            );
          })}
        </g>
      ))}
      {/* 机 */}
      <rect x={-40} y={740} width={2000} height={400} fill={C.deskWood} />
      <rect x={-40} y={730} width={2000} height={22} fill={C.deskWoodDark} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.deskWoodDark} strokeWidth={4} fill="none" opacity={0.6}>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M -40 ${800 + i * 70} q 500 ${i % 2 ? 12 : -12} 1000 0 q 500 ${i % 2 ? -12 : 12} 1000 0`} />)}
      </g>
      {/* 卓上ランプ */}
      <g>
        <ellipse cx={260} cy={760} rx={90} ry={20} fill="#5E5A55" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 260 750 L 300 560 L 380 470" stroke="#5E5A55" strokeWidth={16} fill="none" strokeLinejoin="round" />
        <path d="M 380 470 L 480 420 L 470 530 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="460,500 480,520 1000,780 560,800" fill={HP.spark} opacity={0.16 * flick} />
        <circle cx={466} cy={505} r={14} fill={HP.spark} opacity={flick} />
      </g>
      {/* 机の小物: ノートと鉛筆 */}
      <rect x={360} y={790} width={240} height={150} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-6 480 865)" />
      {[0, 1, 2].map((i) => <line key={i} x1={385} y1={830 + i * 30} x2={570} y2={812 + i * 30} stroke={KRP.gray} strokeWidth={4} />)}
      <rect x={620} y={880} width={180} height={14} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} transform="rotate(12 710 887)" />
    </g>
  );
};
// 標本の瓶。cork: 0=閉 / 1=抜けた。fog: もやもやの濃さ。bell: 警報ベルの出現 0〜1
const HmHJar: React.FC<{ f: number; corkOff?: number; fog?: number; bell?: number }> = ({ f, corkOff = 0, fog = 1, bell = 0 }) => {
  const cx = 960;
  const cy = corkOff > 0 ? lerp(200, -120, easeOut(corkOff)) : 200;
  const crot = corkOff * 260;
  return (
    <g>
      <ellipse cx={cx} cy={760} rx={230} ry={24} fill={KRP.ink} opacity={0.2} />
      {/* 瓶の後ろの壁面 */}
      <path d="M 790 250 L 1130 250 Q 1180 260 1180 320 L 1180 700 Q 1180 760 1120 760 L 800 760 Q 740 760 740 700 L 740 320 Q 740 260 790 250 Z"
        fill={C.jarGlass} stroke={KRP.ink} strokeWidth={8} />
      {/* もやもや */}
      <defs><clipPath id="hmhjar"><path d="M 790 254 L 1130 254 Q 1176 262 1176 320 L 1176 700 Q 1176 756 1120 756 L 800 756 Q 744 756 744 700 L 744 320 Q 744 262 790 254 Z" /></clipPath></defs>
      <g clipPath="url(#hmhjar)">
        {fog > 0 && (
          <g>
            <HmHMoya x={960} y={520} r={240} f={f * 1.6} op={fog} seed={3} />
            <HmHMoya x={930} y={600} r={160} f={-f * 2} op={fog * 0.9} seed={7} />
            <HmHMoya x={1000} y={430} r={130} f={f * 2.4} op={fog * 0.9} seed={11} />
          </g>
        )}
      </g>
      {/* 首と口 */}
      <rect x={830} y={210} width={260} height={50} rx={10} fill={C.jarGlass} stroke={KRP.ink} strokeWidth={7} />
      {/* ガラスの光 */}
      <path d="M 780 330 L 780 640" stroke={KRP.white} strokeWidth={16} strokeLinecap="round" opacity={0.7} />
      <path d="M 810 300 L 810 360" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      {/* ラベル */}
      <g transform="rotate(-3 960 640)">
        <rect x={860} y={600} width={200} height={90} rx={6} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5} />
        <rect x={870} y={610} width={180} height={70} rx={4} fill="none" stroke={KRP.red} strokeWidth={3} />
        <text x={960} y={664} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.ink}>?</text>
      </g>
      {/* 警報ベル */}
      {bell > 0 && <HmHBell x={960} y={lerp(420, 150, easeOut(bell))} s={pop(bell)} f={f} />}
      {/* コルク栓 */}
      <g transform={`translate(${cx + corkOff * 260} ${cy}) rotate(${crot})`}>
        <path d="M -110 -40 L 110 -40 L 96 30 L -96 30 Z" fill={C.corkStop} stroke={KRP.ink} strokeWidth={7} />
        {[[-60, -15], [10, 0], [55, -20], [-20, 14]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={6} fill={C.corkStopDark} />)}
      </g>
    </g>
  );
};
// 警報ベル (赤い丸ベルと打ち子)
const HmHBell: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const shake = Math.sin(f * 2.2) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${shake})`}>
      <rect x={-12} y={60} width={24} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -90 50 Q -90 -70 0 -70 Q 90 -70 90 50 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-100} y={44} width={200} height={22} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -50 -40 Q -30 -56 -8 -58" stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.7} strokeLinecap="round" />
      <circle cx={0} cy={-76} r={12} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`rotate(${Math.sin(f * 2.2) * 25} 0 80)`}>
        <line x1={0} y1={80} x2={60} y2={30} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={62} cy={28} r={14} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 鳴っている線 */}
      {[0, 1, 2].map((k) => (
        <g key={k} opacity={0.5 + 0.5 * Math.sin(f + k)}>
          <path d={`M ${-120 - k * 26} ${-20 - k * 10} q -16 30 0 60`} stroke={HP.spark} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M ${120 + k * 26} ${-20 - k * 10} q 16 30 0 60`} stroke={HP.spark} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};
// 研究者 (白衣・めがね) が右から虫めがねを向ける
const HmHResearcher: React.FC<{ f: number; face: "normal" | "surprised" | "worried"; lean: number; lens: [number, number]; showLens?: boolean }> = ({ f, face, lean, lens, showLens = true }) => {
  const x = 1500, y = 930, s = 1.35;
  const la = (lean * Math.PI) / 180;
  const ax = -153 * s, ay = -148 * s;
  const hx = x + ax * Math.cos(la) - ay * Math.sin(la), hy = y + ax * Math.sin(la) + ay * Math.cos(la);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} pose="point" pointDir={-1} face={face} glasses lean={lean} cloth={C.coat} clothDark={C.coatDark} hair="cap" phase={4} />
      {/* 白衣の襟 */}
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
        <path d="M -30 -160 L 0 -110 L 30 -160" stroke={KRP.ink} strokeWidth={5} fill="#BFD7E8" />
        <rect x={-40} y={-120} width={30} height={20} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {showLens && (
        <g>
          <line x1={hx} y1={hy} x2={lens[0] + (hx - lens[0]) * 80 / Math.hypot(hx - lens[0], hy - lens[1])} y2={lens[1] + (hy - lens[1]) * 80 / Math.hypot(hx - lens[0], hy - lens[1])} stroke="#6E4526" strokeWidth={18} strokeLinecap="round" />
          <circle cx={hx} cy={hy} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={lens[0]} cy={lens[1]} r={80} fill={HP.screenCore} opacity={0.35} />
          <circle cx={lens[0]} cy={lens[1]} r={80} fill="none" stroke={HP.brass} strokeWidth={16} />
          <circle cx={lens[0]} cy={lens[1]} r={80} fill="none" stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${lens[0] - 44} ${lens[1] - 30} q 16 -28 46 -30`} stroke={KRP.white} strokeWidth={7} fill="none" opacity={0.8} />
        </g>
      )}
    </g>
  );
};

const Hm179: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const lens: [number, number] = [1040 + Math.sin(f / 14) * 40, 470 + Math.cos(f / 11) * 30];
  return (
    <Frame f={f} seed={5179}>
      <g transform={`translate(960 500) scale(${cam}) translate(-960 -500)`}>
        <HmHLab f={f} />
        <HmHJar f={f} />
        {/* レンズの中だけ、もやもやが大きく見える */}
        <defs><clipPath id="hmh179lens"><circle cx={lens[0]} cy={lens[1]} r={74} /></clipPath></defs>
        <g clipPath="url(#hmh179lens)">
          <rect x={lens[0] - 80} y={lens[1] - 80} width={160} height={160} fill={C.jarGlass} />
          <HmHMoya x={lens[0]} y={lens[1]} r={150} f={f * 1.6} seed={5} />
        </g>
        <HmHResearcher f={f} face="worried" lean={-10} lens={lens} />
        <QMark x={1420} y={330} s={0.8} f={f} t={seg(f, 14, 24)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #180 心理学では、「何かに夢中になりたいのに、なれない」ときの、いやな気分だと説明します。
// 格: 山 / seed 5180
// 絵: どこ: 人の頭の中の断面 (比喩の部屋・脳の部屋)。演出: 頭の中で、小さな人 (気分) が両手を伸ばして、向こう岸の楽しいもの (光る玉) をつかもうとするが、**手がとどかない** (透明な壁がある)。小さな人のまわりに灰色のもやもや。札「夢中になりたい」「なれない」。動き: 手を伸ばす / 壁に当たる / もやもや
// どこ: 人の頭の横顔の断面 (比喩)。頭の中は小さな「心の部屋」(ピンクの壁紙・木の床)。外は心理学の本の挿絵のような方眼の紙
// 演出: 部屋の左の小さな人 (気分) が両手を伸ばして、向こう岸の台の上の光る玉 (夢中になれるもの) をつかもうとするが、透明なガラスの壁にぺたっと当たる。まわりに灰色のもやもや。札「夢中になりたい」「なれない」
// 動き: 身を乗り出す → 壁に当たる (f20) / ガラスの波紋 / 光る玉の光 / もやもやが増える / カメラがゆっくり寄る
const HMH_HEAD = "M 430 1000 C 400 840 250 720 270 480 C 290 220 520 70 850 64 C 1190 58 1450 200 1500 420 L 1520 470 L 1610 570 Q 1622 596 1586 606 L 1536 614 L 1546 664 Q 1560 684 1534 694 L 1540 734 Q 1546 794 1484 804 L 1380 816 L 1370 1000 Z";
const Hm180: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.04 * easeOut(seg(f, 0, 42));
  const reach = easeInOut(seg(f, 4, 20));
  const bump = f >= 20 ? Math.max(0, 1 - (f - 20) / 8) : 0;
  const lean = 14 * reach - 5 * bump + (f > 28 ? Math.sin(f / 2) * 1.2 : 0);
  const wallX = 1010;
  const moya = seg(f, 10, 42);
  return (
    <Frame f={f} seed={5180}>
      <g transform={`translate(900 500) scale(${cam}) translate(-900 -500)`}>
        {/* 外: 方眼の紙 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={KRP.paperCool} />
        <g stroke={KRP.blueSoft} strokeWidth={3}>
          {Array.from({ length: 33 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={-40} x2={i * 60} y2={1120} />)}
          {Array.from({ length: 19 }, (_, i) => <line key={`h${i}`} x1={-40} y1={i * 60} x2={1960} y2={i * 60} />)}
        </g>
        {/* 頭の横顔 */}
        <path d={HMH_HEAD} fill={KRP.ink} opacity={0.18} transform="translate(16 16)" />
        <path d={HMH_HEAD} fill={C.skin} stroke={KRP.ink} strokeWidth={9} strokeLinejoin="round" />
        <path d="M 1290 560 q 30 -20 56 4" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        <ellipse cx={600} cy={520} rx={40} ry={60} fill={C.skinDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 心の部屋 (頭の内側を少し小さくした形で切り抜く) */}
        <defs><clipPath id="hmh180room"><path d={HMH_HEAD} transform="translate(900 470) scale(0.84) translate(-900 -470)" /></clipPath></defs>
        <g clipPath="url(#hmh180room)">
          <rect x={200} y={0} width={1500} height={1100} fill={C.mindWall} />
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={260 + (i % 10) * 130 + (Math.floor(i / 10) % 2) * 65} cy={150 + Math.floor(i / 10) * 120} r={8} fill={KRP.white} opacity={0.6} />
          ))}
          <rect x={200} y={720} width={1500} height={400} fill={C.mindFloor} />
          <g stroke={C.deskWoodDark} strokeWidth={4}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={200 + i * 130} y1={720} x2={200 + i * 130} y2={1100} />)}</g>
          <rect x={200} y={712} width={1500} height={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 向こう岸: 台と光る玉 */}
          <g>
            <circle cx={1240} cy={520} r={150 + 10 * Math.sin(f / 4)} fill={HP.spark} opacity={0.25} />
            <rect x={1180} y={600} width={120} height={120} rx={8} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={1240} cy={530} r={70} fill={HP.spark} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={1218} cy={506} r={20} fill={KRP.white} opacity={0.8} />
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k / 8) * Math.PI * 2 + f / 20;
              return <line key={k} x1={1240 + Math.cos(a) * 88} y1={530 + Math.sin(a) * 88} x2={1240 + Math.cos(a) * 118} y2={530 + Math.sin(a) * 118}
                stroke={KRP.orange} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
          {/* もやもや */}
          <HmHMoya x={760} y={330} r={170 * (0.6 + 0.4 * moya)} f={f} op={0.55 + 0.35 * moya} seed={2} />
          <HmHMoya x={560} y={560} r={140 * (0.6 + 0.4 * moya)} f={-f} op={0.5 + 0.35 * moya} seed={6} />
          {/* 小さな人 (気分) */}
          <g>
            <Person x={820} y={724} s={0.9} f={f} pose="point" pointDir={1} face={f >= 20 ? "worried" : "smile"} lean={lean}
              cloth={KRP.orange} clothDark="#B8652F" phase={1} />
            {/* もう1本の腕 (少し上へ伸ばす) */}
            <g transform={`translate(820 724) scale(0.9) rotate(${lean})`}>
              <rect x={56} y={-160} width={22} height={88} rx={11} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} transform="rotate(-105 67 -160)" />
              <circle cx={67 + 88 * Math.cos((-15 * Math.PI) / 180)} cy={-160 + 88 * Math.sin((-15 * Math.PI) / 180)} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
            {f >= 20 && (
              <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
                <line x1={wallX - 30} y1={430} x2={wallX - 50} y2={400} />
                <line x1={wallX - 30} y1={540} x2={wallX - 54} y2={566} />
              </g>
            )}
          </g>
          {/* 透明なガラスの壁 */}
          <rect x={wallX} y={200} width={26} height={524} fill={C.glass} opacity={0.75} stroke={KRP.ink} strokeWidth={5} />
          <line x1={wallX + 8} y1={230} x2={wallX + 8} y2={420} stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
          <rect x={wallX - 30} y={712} width={86} height={22} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          {bump > 0 && [0, 1, 2].map((k) => (
            <ellipse key={k} cx={wallX + 13} cy={480} rx={20 + (1 - bump) * 40 + k * 18} ry={50 + (1 - bump) * 80 + k * 30}
              fill="none" stroke={KRP.white} strokeWidth={5} opacity={bump * (1 - k * 0.25)} />
          ))}
        </g>
        <TagPlate x={1240} y={300} text="夢中になりたい" size={38} t={seg(f, 6, 14)} />
        <TagPlate x={wallX + 13} y={170} text="なれない" size={38} t={seg(f, 22, 30)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #181 やることがないから、退屈なのではありません。
// 格: 並 / seed 5181
// 絵: どこ: 空っぽの机 (何も置いていない)。演出: 「やることがない=退屈」の矢印の式が書かれた札が、上から大きな×のハンコでばしっと押される。札が少しずれる。動き: ハンコ / 札のゆれ
// どこ: 空っぽの事務机 (真上から。木目の天板に、物の跡の輪じみとホコリだけ。何も置いていない)
// 演出: 机の真ん中に「やることがない → 退屈」の式の札。上から大きなゴム印 (×) がばしっと降りて、札に赤い×。衝撃で札がずれ、ホコリが舞う
// 動き: ハンコが降りる (f10→18) / 衝撃の線とホコリ / 札がずれてゆれる / ハンコが持ち上がって脇へ
const Hm181: React.FC<{ f: number }> = ({ f }) => {
  const down = easeInOut(seg(f, 8, 17));
  const up = easeOut(seg(f, 24, 36));
  const hit = f >= 17;
  const after = Math.max(0, f - 17);
  const jolt = hit ? Math.sin(after / 1.6) * 3 * Math.exp(-after / 8) : 0;
  const plateRot = hit ? -3.5 + jolt : 0;
  const plateDx = hit ? 26 * easeOut(clamp01(after / 4)) : 0;
  const sx = 960 + up * 520, sy = lerp(-420, 520, down) - up * 380;
  return (
    <Frame f={f} seed={5181}>
      {/* 天板 */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={C.deskWood} />
      <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.55} fill="none">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -20 ${40 + i * 140} q 480 ${rnd(61, i) * 36 - 18} 980 0 q 480 ${rnd(62, i) * 36 - 18} 980 0`} />
        ))}
      </g>
      <rect x={-40} y={-40} width={2000} height={60} fill={C.deskWoodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 何もない机の証拠: コーヒーの輪じみ・消しゴムのかす・ホコリ */}
      <circle cx={1580} cy={260} r={58} fill="none" stroke={C.deskWoodDark} strokeWidth={8} opacity={0.6} />
      <circle cx={330} cy={840} r={6} fill={KRP.white} opacity={0.5} />
      <circle cx={350} cy={852} r={4} fill={KRP.white} opacity={0.5} />
      {/* 式の札 */}
      <g transform={`translate(${960 + plateDx} 520) rotate(${plateRot})`}>
        <rect x={-640} y={-150} width={1300} height={316} rx={18} fill={KRP.ink} opacity={0.22} transform="translate(14 18)" />
        <rect x={-650} y={-160} width={1300} height={316} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
        <rect x={-620} y={-130} width={1240} height={256} rx={10} fill="none" stroke={KRP.gray} strokeWidth={4} />
        <text x={-280} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={KRP.ink}>やることがない</text>
        <g transform="translate(150 0)">
          <rect x={-50} y={-14} width={70} height={28} fill={KRP.ink} />
          <path d="M 20 -44 L 74 0 L 20 44 Z" fill={KRP.ink} />
        </g>
        <text x={420} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={KRP.ink}>退屈</text>
        {/* 押された× */}
        {hit && (
          <g opacity={0.9} transform={`scale(${1 + 0.15 * Math.exp(-after / 2)})`}>
            <path d="M -330 -230 L 330 230 M 330 -230 L -330 230" stroke={C.stampRed} strokeWidth={70} strokeLinecap="round" />
            {Array.from({ length: 14 }, (_, k) => (
              <circle key={k} cx={(rnd(63, k) - 0.5) * 600} cy={(rnd(64, k) - 0.5) * 420} r={6 + rnd(65, k) * 8} fill={KRP.white} opacity={0.5} />
            ))}
          </g>
        )}
      </g>
      {/* 衝撃とホコリ */}
      {hit && after < 14 && (
        <g opacity={1 - after / 14}>
          {Array.from({ length: 10 }, (_, k) => {
            const a = (k / 10) * Math.PI * 2;
            const r1 = 420 + after * 20;
            return <line key={k} x1={960 + Math.cos(a) * r1} y1={520 + Math.sin(a) * r1 * 0.6} x2={960 + Math.cos(a) * (r1 + 70)} y2={520 + Math.sin(a) * (r1 + 70) * 0.6}
              stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />;
          })}
        </g>
      )}
      {hit && Array.from({ length: 9 }, (_, k) => {
        const t = clamp01(after / 26);
        return <circle key={k} cx={300 + k * 170 + Math.sin(k + f / 5) * 20} cy={760 - t * 120 - (k % 3) * 30} r={10 + t * 12}
          fill={KRP.white} opacity={0.5 * (1 - t)} />;
      })}
      {/* ゴム印 (×の印面・木の持ち手) */}
      <g transform={`translate(${sx} ${sy}) rotate(${up * 18})`}>
        <ellipse cx={0} cy={-20} rx={360} ry={60} fill={KRP.ink} opacity={0.18 * (1 - down) + 0.05} transform={`translate(0 ${hit ? 0 : 40})`} />
        <rect x={-340} y={-90} width={680} height={70} rx={12} fill={C.stampRed} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-320} y={-200} width={640} height={110} rx={14} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={8} />
        <path d="M -80 -200 Q -80 -330 0 -360 Q 80 -330 80 -200 Z" fill={HP.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={0} cy={-370} r={60} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <path d="M -30 -390 q 20 -20 40 -14" stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.5} strokeLinecap="round" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #182 長い会議のように、やることがあっても、夢中になれなければ、人は退屈します。
// 格: 山 / seed 5182
// 絵: どこ: 会社の会議室 (長い机・スクリーンのグラフ・壁の時計)。演出: 長い会議。机の上に資料が山積み (やることはある)。参加者たちは頬杖・あくび・ペン回し (face="sad")。壁の時計の針がのろのろ。灰色のもやもやが会議室の天井にたまっていく。動き: ペン回し / あくび / もやもやがたまる
// どこ: 会社の会議室。奥の壁にスクリーン (折れ線グラフ)・右に壁の時計・左に窓のブラインド。手前に長い机と資料の山
// 演出: 5人の長い会議。資料は山積み (やることはある) なのに、頬杖・あくび・ペン回し・うつらうつら・ため息。灰色のもやもやが天井にたまって、だんだん下りてくる
// 動き: ペン回し / あくび / 頭がこっくり / 時計の長針がのろのろ / もやもやが厚くなる / カメラがゆっくり右へパン
const Hm182: React.FC<{ f: number }> = ({ f }) => {
  const pan = -24 + 48 * easeInOut(seg(f, 0, 42));
  const smog = seg(f, 0, 42);
  const tableY = 760;
  const ppl = [
    { x: 330, c: "#4A5A7A", act: "chin" },
    { x: 650, c: "#7A5A4A", act: "yawn" },
    { x: 960, c: "#3E4B66", act: "pen" },
    { x: 1270, c: "#5E7A5A", act: "nod" },
    { x: 1590, c: "#6A5A7A", act: "sigh" },
  ];
  const yawn = seg(f, 10, 20);
  const nod = Math.max(0, Math.sin(f / 7)) * 10;
  return (
    <Frame f={f} seed={5182}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁 */}
        <rect x={-80} y={-40} width={2080} height={1160} fill={C.meetWall} />
        <rect x={-80} y={560} width={2080} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓のブラインド */}
        <rect x={20} y={90} width={200} height={300} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={20} y={96 + i * 24} width={200} height={12} fill={KRP.white} stroke={KRP.gray} strokeWidth={2} />)}
        {/* スクリーンのグラフ */}
        <rect x={600} y={70} width={720} height={340} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <line x1={960} y1={40} x2={960} y2={70} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.gray} strokeWidth={3}>
          {[0, 1, 2, 3].map((i) => <line key={i} x1={650} y1={130 + i * 64} x2={1280} y2={130 + i * 64} />)}
        </g>
        <polyline points="650,300 730,296 810,302 890,298 970,303 1050,297 1130,301 1210,299 1280,300" fill="none" stroke={KRP.blueDeep} strokeWidth={8} strokeLinejoin="round" />
        <rect x={650} y={90} width={200} height={20} rx={6} fill={KRP.gray} />
        {/* 壁の時計 */}
        <g transform="translate(1680 330)">
          <circle r={90} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * 70} y1={-Math.cos(a) * 70} x2={Math.sin(a) * 80} y2={-Math.cos(a) * 80} stroke={KRP.ink} strokeWidth={i % 3 ? 3 : 6} />;
          })}
          <line x1={0} y1={0} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" transform="rotate(100)" />
          <line x1={0} y1={0} x2={0} y2={-64} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${170 + f * 0.25})`} />
          <line x1={0} y1={8} x2={0} y2={-72} stroke={KRP.red} strokeWidth={3} transform={`rotate(${f * 1.2})`} />
          <circle r={7} fill={KRP.ink} />
        </g>
        {/* 天井にたまるもやもや */}
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <HmHMoya key={i} x={-40 + i * 180} y={-30 + smog * 90 + (i % 2) * 20} r={150 + smog * 60} f={f + i * 9} op={0.45 + 0.4 * smog} seed={i + 20} />
          ))}
        </g>
        {/* 参加者 */}
        {ppl.map((p, i) => {
          const py = 830;
          const s = 1.0;
          const lean = p.act === "nod" ? nod : p.act === "chin" ? -6 : 0;
          return (
            <g key={i}>
              <Person x={p.x} y={py} s={s} f={f} face={p.act === "yawn" && yawn > 0.3 ? "surprised" : "sad"} lean={lean}
                pose={p.act === "pen" ? "hold" : p.act === "sigh" ? "armsFolded" : "stand"} cloth={p.c} clothDark="#2E3850" phase={i * 2} />
              {p.act === "yawn" && yawn > 0.3 && (
                <g>
                  <HmHClosedEyes x={p.x} y={py} s={s} f={f} phase={i * 2} />
                  <ellipse cx={p.x} cy={py - 186 * s + Math.sin(((f + i * 34) / 13)) * 3} rx={16} ry={22 * yawn} fill={KRP.ink} />
                </g>
              )}
              {p.act === "nod" && nod > 6 && <HmHClosedEyes x={p.x} y={py} s={s} f={f} phase={i * 2} lean={lean} />}
              {p.act === "sigh" && (
                <path d={`M ${p.x + 30} ${py - 170} q 40 ${-10 - (f % 20)} 80 0`} stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round"
                  opacity={1 - (f % 20) / 20} />
              )}
            </g>
          );
        })}
        {/* 長い机 */}
        <rect x={-80} y={tableY} width={2080} height={40} fill={C.meetTable} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-80} y={tableY + 40} width={2080} height={300} fill={C.meetTableDark} stroke={KRP.ink} strokeWidth={7} />
        {/* 頬杖の腕 */}
        <g strokeLinecap="round">
          <line x1={450} y1={tableY + 4} x2={346} y2={672} stroke={KRP.ink} strokeWidth={36} />
          <line x1={450} y1={tableY + 4} x2={346} y2={672} stroke={ppl[0].c} strokeWidth={26} />
          <circle cx={340} cy={668} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 資料の山 */}
        {ppl.map((p, i) => {
          const n = [6, 9, 4, 11, 7][i];
          return (
            <g key={i}>
              {Array.from({ length: n }, (_, k) => (
                <rect key={k} x={p.x + (i % 2 ? 90 : -230) + ((k * 7) % 11) - 5} y={tableY - 8 - k * 12} width={140} height={14} fill={k % 4 === 0 ? KRP.blueSoft : C.paperDoc}
                  stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
          );
        })}
        {/* ペン回し */}
        <circle cx={1060} cy={tableY - 6} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <g transform={`translate(1060 ${tableY - 40}) rotate(${f * 24})`}>
          <rect x={-46} y={-6} width={92} height={12} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
          <rect x={30} y={-6} width={16} height={12} fill={KRP.silver} />
        </g>
        {/* 紙コップ */}
        {[500, 1110, 1440].map((cx) => (
          <g key={cx}>
            <path d={`M ${cx - 24} ${tableY - 60} L ${cx + 24} ${tableY - 60} L ${cx + 18} ${tableY} L ${cx - 18} ${tableY} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={cx - 22} y={tableY - 44} width={44} height={14} fill={KRP.bronze} opacity={0.6} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #183 そして、退屈には役目がある、という説があります。
// 格: 並 / seed 5183
// 絵: どこ: #179 の標本の瓶 (続き)。演出: 灰色のもやもやの瓶のコルクがぽんと抜けて、中から小さな**警報ベル**が出てくる (正体)。研究者が目を丸くする (face="surprised")。札「〜という説」(小さく)。動き: コルクが抜ける / ベルが出てくる
// どこ: #179 と同じ研究室の机・同じ標本の瓶 (続き)
// 演出: コルクがぽんと抜けて右上へ飛び、もやもやが口から抜けていくと、中から小さな赤い警報ベルがせり上がって鳴る (退屈の正体)。研究者は目を丸くしてのけぞる。札「という説」(小さく)
// 動き: 瓶がぷるぷる → コルクが抜ける (f12) / もやもやが抜けて薄くなる / ベルが出てきて鳴る / 研究者がのけぞる
const Hm183: React.FC<{ f: number }> = ({ f }) => {
  const shake = f < 12 ? Math.sin(f * 2.5) * seg(f, 2, 11) * 5 : 0;
  const corkOff = seg(f, 12, 24);
  const fog = 1 - 0.85 * seg(f, 14, 34);
  const bell = seg(f, 20, 34);
  const surprised = f >= 13;
  return (
    <Frame f={f} seed={5183}>
      <g transform="translate(960 500) scale(1.06) translate(-960 -500)">
        <HmHLab f={f} />
        <g transform={`rotate(${shake} 960 760)`}>
          <HmHJar f={f} corkOff={corkOff} fog={fog} bell={bell} />
        </g>
        {/* 口から抜けていくもやもや */}
        {corkOff > 0 && <HmHMoya x={960 - 60 * corkOff} y={200 - 200 * seg(f, 14, 40)} r={140} f={f * 2} op={0.8 * (1 - seg(f, 26, 42))} seed={9} />}
        {/* ぽん! の衝撃 */}
        {f >= 12 && f < 22 && (
          <g opacity={1 - seg(f, 12, 22)}>
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k / 8) * Math.PI * 2;
              const r1 = 60 + (f - 12) * 12, r2 = r1 + 40;
              return <line key={k} x1={960 + Math.cos(a) * r1 * 1.4} y1={210 + Math.sin(a) * r1 * 0.6} x2={960 + Math.cos(a) * r2 * 1.4} y2={210 + Math.sin(a) * r2 * 0.6}
                stroke={HP.spark} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        <HmHResearcher f={f} face={surprised ? "surprised" : "worried"} lean={surprised ? 8 * easeOut(seg(f, 13, 20)) : -10}
          lens={surprised ? [1330, 400] : [1040, 470]} />
        {surprised && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
            <line x1={1420} y1={330} x2={1400} y2={290} />
            <line x1={1480} y1={318} x2={1484} y2={276} />
            <line x1={1540} y1={330} x2={1566} y2={296} />
          </g>
        )}
        <TagPlate x={560} y={300} text="という説" size={34} t={seg(f, 30, 38)} rot={-3} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_173: (f) => <Hm173 f={f} />,
  hm_174: (f) => <Hm174 f={f} />,
  hm_175: (f) => <Hm175 f={f} />,
  hm_176: (f) => <Hm176 f={f} />,
  hm_177: (f) => <Hm177 f={f} />,
  hm_178: (f) => <Hm178 f={f} />,
  hm_179: (f) => <Hm179 f={f} />,
  hm_180: (f) => <Hm180 f={f} />,
  hm_181: (f) => <Hm181 f={f} />,
  hm_182: (f) => <Hm182 f={f} />,
  hm_183: (f) => <Hm183 f={f} />,
};

export const HM_H_MOTIFS: string[] = [
  "hm_173", // #173
  "hm_174", // #174
  "hm_175", // #175
  "hm_176", // #176
  "hm_177", // #177
  "hm_178", // #178
  "hm_179", // #179
  "hm_180", // #180
  "hm_181", // #181
  "hm_182", // #182
  "hm_183", // #183
];

export const himaHScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
