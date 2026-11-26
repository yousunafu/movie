// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#12〜#23 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, MACHI_WIN, MACHI_GROUND, mixColor, Flame,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // はちみつの音符 (#12)
  honey: "#E7A93B",
  honeyLight: "#F6CF73",
  honeyDark: "#B97A1E",
  // 修道院
  rope: "#C9A877",
  oak: "#5A3B24",
  oakLight: "#7A5236",
  beard: "#F2F1EC",
  // 捜査手帳 (#14)
  leather: "#7A4A2E",
  leatherDark: "#5A3420",
  page: "#F7F0DE",
  pageBack: "#EDE4CC",
  pageLine: "#DDD2B8",
  pencil: "#6B6B6B",
  inkBlue: "#1E2748",
  inkBleed: "#46578C",
  nightWall: "#3B3550",
  nightWallLine: "#463F5C",
  penBody: "#22324F",
  // 体の中 (ピンクの壁)
  pink: "#F4C1BD",
  pinkDark: "#E3A09C",
  pinkDeep: "#C9706E",
  pinkLight: "#FBDCD6",
  pinkFloor: "#D98C88",
  tube: "#E8A6A8",
  tubeLight: "#F8D3D2",
  bubble: "#FFF3F2",
  lampYellow: "#FFF1A8",
  skin: "#FBE3D3",
  // 屋根裏 (#15)
  plaster: "#CDBFA8",
  plasterDark: "#A99A82",
  beam: "#6B4A30",
  beamDark: "#4A3220",
  straw: "#D9BF7E",
  strawDark: "#A88B4A",
  tick: "#E6DCC4",
  tickStripe: "#8FA3B8",
  quilt1: "#9C5A5A",
  quilt2: "#5E7A9C",
  quilt3: "#B59A5A",
  // 朝の光 (#23)
  sunbeam: "#FFF4C8",
  gold: "#FFD34D",
  iris: "#7A9CC6",
  irisDark: "#4E6E9A",
  // 寝間着の男 (#13)
  nightShirt: "#9AA0A8",
  nightShirtDark: "#737982",
  capRed: "#C8463A",
  green: "#9BB85A",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void XMark; void Arrow; void Maru; void MaruBatsu;
void SumahoAlarm; void TokiNoKane; void BanninTou; void KoujouMon; void BellClock; void Clocky;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const useMzAbId = (p: string) => p + React.useId().replace(/[^a-zA-Z0-9]/g, "");
type Pt = [number, number];
const mixHex = (a: string, b: string, t: number) => {
  const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const k = clamp01(t);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
};

// 腕を自分で描くための「腕なしの体」。Person / Kobito を (0,0,s=1) で children に入れると、
// 元の腕だけが切り取られる (頭・胴・脚は残る)。腕は front に MzAbLimb で足す → 腕は必ず2本
const MzAbBare: React.FC<{
  x: number; y: number; s: number; lean?: number;
  back?: React.ReactNode; front?: React.ReactNode; children: React.ReactNode;
}> = ({ x, y, s, lean = 0, back, front, children }) => {
  const id = useMzAbId("mzabBare");
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      <defs>
        <clipPath id={id}>
          <rect x={-86} y={-350} width={172} height={192} />
          <rect x={-61} y={-170} width={122} height={200} />
        </clipPath>
      </defs>
      {back}
      <g clipPath={`url(#${id})`}>{children}</g>
      {front}
    </g>
  );
};

// 腕 (肩 → ひじ → 手)。Person の座標系 (s=1) で点を渡す。肩は (±62, -140)
const MzAbLimb: React.FC<{ pts: Pt[]; cloth: string; w?: number; hand?: boolean; handFill?: string }> = ({
  pts, cloth, w = 22, hand = true, handFill = KRP.white,
}) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const e = pts[pts.length - 1];
  return (
    <g>
      <path d={d} stroke={KRP.ink} strokeWidth={w + 9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={cloth} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {hand && <circle cx={e[0]} cy={e[1]} r={11} fill={handFill} stroke={KRP.ink} strokeWidth={4.5} />}
    </g>
  );
};

// 腕なしの小人 (Kobito を MzAbBare で包む)
const MzAbKobitoBare: React.FC<{
  x: number; y: number; s: number; f: number; face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  lean?: number; phase?: number; gaze?: Pt; lamp?: boolean; arms: [Pt[], Pt[]]; front?: React.ReactNode; back?: React.ReactNode;
}> = ({ x, y, s, f, face = "normal", lean = 0, phase = 0, gaze = [0, 0], lamp = false, arms, front, back }) => (
  <MzAbBare x={x} y={y} s={s} lean={lean} back={back}
    front={<g>
      <MzAbLimb pts={arms[0]} cloth={MP.kobitoCloth} />
      <MzAbLimb pts={arms[1]} cloth={MP.kobitoCloth} />
      {front}
    </g>}>
    <Kobito x={0} y={0} s={1} f={f} face={face} phase={phase} gaze={gaze} lamp={lamp} />
  </MzAbBare>
);

// 後ろ姿の小人 (奥へ歩いていく。顔を描かずに後頭部とヘルメットの後ろ)
const MzAbKobitoBack: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lantern?: boolean }> = ({ x, y, s, f, phase = 0, lantern = false }) => {
  const step = Math.sin((f + phase * 7) / 4.5);
  const lift = Math.abs(step) * 5;
  return (
    <g transform={`translate(${x} ${y - lift * s}) scale(${s}) rotate(${step * 3})`}>
      <Kobito x={0} y={0} s={1} f={f} pose={lantern ? "raise" : "stand"} phase={phase} lamp />
      {/* 後頭部 (顔を消す) */}
      <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -30 -180 Q 0 -168 30 -180" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.35} />
      {/* ヘルメットの後ろ */}
      <path d="M -68 -246 Q -68 -312 0 -314 Q 68 -312 68 -246 Z" fill={MP.kobitoHelmet} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -8 -312 L -8 -248 M 8 -312 L 8 -248" stroke="#C99A1E" strokeWidth={5} />
      <rect x={-80} y={-256} width={160} height={16} rx={8} fill={MP.kobitoHelmet} stroke={KRP.ink} strokeWidth={5} />
      {/* ライトのゴムバンド */}
      <path d="M -66 -262 Q 0 -250 66 -262" stroke="#3A3A3A" strokeWidth={6} fill="none" />
      {/* 背中の道具袋 */}
      <rect x={-34} y={-146} width={68} height={58} rx={10} fill="#8A6A44" stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -34 -126 L 34 -126" stroke={KRP.ink} strokeWidth={3} />
      {lantern && (
        <g transform="translate(67 -236)">
          <path d="M 0 0 L 0 20" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={64} r={70} fill={MP.glow} opacity={0.35 + 0.08 * Math.sin(f / 3)} />
          <rect x={-22} y={20} width={44} height={12} rx={3} fill={MP.iron} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={-18} y={32} width={36} height={52} rx={6} fill="#FFE7A0" stroke={KRP.ink} strokeWidth={4} />
          <Flame x={0} y={74} s={0.55} f={f} phase={phase} glow={0} />
          <rect x={-22} y={84} width={44} height={10} rx={3} fill={MP.iron} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
    </g>
  );
};

// やわらかい壁のしわ (脳の部屋・体の中の壁の質感)
const MzAbGyri: React.FC<{ x: number; y: number; w: number; h: number; seed: number; color?: string; op?: number; step?: number }> = ({
  x, y, w, h, seed, color = C.pinkDark, op = 0.5, step = 120,
}) => {
  const cols = Math.ceil(w / step), rows = Math.ceil(h / (step * 0.8));
  return (
    <g stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" opacity={op}>
      {Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => {
        const cx = x + i * step + (j % 2) * step * 0.5 + rnd(seed, i * 7 + j) * 30;
        const cy = y + j * step * 0.8 + rnd(seed + 3, i + j * 5) * 24;
        const k = rnd(seed + 9, i * 3 + j * 11);
        return <path key={`${i}-${j}`} d={k < 0.5
          ? `M ${cx - 40} ${cy} q 20 -34 40 0 t 40 0`
          : `M ${cx - 30} ${cy + 10} q 0 -40 30 -36 q 30 6 22 34`} />;
      }))}
    </g>
  );
};

// 寝ている「あなた」の顔 (虫めがねの中の拡大用)。顔は正面 (目が横並び)、頭は枕の上。
// 原点 = レンズの中心、半径 64 の丸に収まる大きさ。水色のパジャマ・短い黒髪
const MzAbSleepFace: React.FC<{ f: number }> = ({ f }) => {
  const br = Math.sin(f / 21);
  return (
    <g>
      {/* 枕 */}
      <rect x={-90} y={-90} width={180} height={180} fill="#D6DCE6" />
      <ellipse cx={0} cy={18} rx={78} ry={44} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
      <path d="M -60 30 Q -40 40 -20 34 M 30 40 Q 48 44 62 34" stroke="#C6CCD8" strokeWidth={3} fill="none" />
      {/* 水色のパジャマの肩とえり */}
      <path d={`M -80 90 L -74 ${62 - br} Q -44 ${46 - br} -14 48 L 14 48 Q 44 ${46 - br} 74 ${62 - br} L 80 90 Z`} fill={MP.you} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M -16 48 L 0 68 L 16 48" fill={MP.youDark} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={0} cy={78} r={3} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} />
      {/* 頭 (枕に乗る) */}
      <circle cx={0} cy={4} r={40} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      {/* 短い黒髪 */}
      <path d="M -39 -2 Q -42 -38 0 -38 Q 42 -38 39 -2 Q 30 -18 12 -18 L 8 -12 L 2 -19 Q -24 -20 -39 -2 Z" fill={C.ink} />
      {/* 閉じた目 (横並び) と眉 */}
      <g fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round">
        <path d="M -24 8 Q -16 15 -8 8" />
        <path d="M 8 8 Q 16 15 24 8" />
        <line x1={-24} y1={-5} x2={-10} y2={-6} />
        <line x1={10} y1={-6} x2={24} y2={-5} />
      </g>
      <ellipse cx={-25} cy={22} rx={7} ry={4} fill="#F2A7A0" opacity={0.6} />
      <ellipse cx={25} cy={22} rx={7} ry={4} fill="#F2A7A0" opacity={0.6} />
      {/* 寝息の口 */}
      <ellipse cx={0} cy={28} rx={4 + br} ry={4.5 + br * 1.4} fill={C.ink} />
    </g>
  );
};

// 音符 (玉と棒と旗)。x,y = 玉の中心
const MzAbNote: React.FC<{ x: number; y: number; s?: number; rot?: number; fill?: string }> = ({ x, y, s = 1, rot = 0, fill = C.honey }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <line x1={13} y1={-2} x2={13} y2={-52} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    <path d="M 13 -52 Q 34 -40 30 -18 Q 26 -32 13 -36 Z" fill={fill} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <ellipse cx={0} cy={0} rx={16} ry={11} transform="rotate(-22)" fill={fill} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={-5} cy={-3} rx={5} ry={3} transform="rotate(-22)" fill={KRP.white} opacity={0.6} />
  </g>
);

// カメラ (中心 cx,cy を画面の真ん中に、倍率 sc)
const cam = (cx: number, cy: number, sc: number) => `translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`;
// キーフレーム補間 [f, cx, cy, sc]
const camKeys = (f: number, keys: [number, number, number, number][]): [number, number, number] => {
  if (f <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3]];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b[0]) {
      const t = easeInOut((f - a[0]) / (b[0] - a[0]));
      return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
    }
  }
  const z = keys[keys.length - 1];
  return [z[1], z[2], z[3]];
};
void pop; void QMark;

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #12 この犯人を追いかけると、1500年前の修道院にたどり着きます。寝坊した人のために、お祈りの歌を、わざとゆっくり唱えていた修道院です。
// 格: 山 / seed 6012
// 絵: どこ: #11 の通路の突き当たりの古い木の扉が開いた先、6世紀ヨーロッパの修道院の礼拝堂 (Shudouin の石のアーチ天井・細長い窓・ろうそくを先取りでちら見せ。dark=1, candle=3, bell=0)。札は「約1500年前」。演出: 黒い頭巾つきの修道服・腰に縄の帯の修道士たちが並んで歌っている。歌の音符が、はちみつのようにゆっくり、長く長く伸びて空中に垂れ下がっていく (ゆっくりさを絵で見せる)。修道院長 (首から十字架) が、指揮をするように片手をものすごくゆっくり動かす。入口の扉のすき間から、遅れてきた誰かのサンダルの足先だけがそっとのぞく (#63 の笑いは取らない。足先だけ)。全員男性 (若い修道士は髪が黒くつるっと小さめの顔、年上は白いひげと白髪で少し太め)。腕は2本 (院長 pose="conduct")。動き: f0-30 扉が開く / f30-150 カメラがゆっくり右へパン / 音符がゆっくり伸びる / ろうそくの炎がゆらぐ
// どこ: #11 の通路の突き当たりの古い樫の扉 (鉄の帯つき) が左右に開くと、6世紀の修道院の礼拝堂。Shudouin の石のアーチ・細長い窓・ろうそく3本 (dark=1)。ベッドの列は手前の彫りのある聖歌隊席の板で隠し、真ん中に大きな聖歌の本を載せた書見台を置く。右の柱の陰に小さな通用口。左上に「約1500年前」の札
// 演出: 修道士4人 (若い2人=黒髪・小さめ・本を持つ・目を閉じて歌う / 年上2人=白髪と白いひげ・太め) が一列に並んで歌う。歌の音符は口とつながず、1つずつ離れて頭の上にふわっと現れ、のんびり上へ浮かんで消える (v2: 帯が口から吐いているように見えるため変更)。右端の修道院長 (首から十字架・左手に小さな鈴=鳴らさない) が右手をものすごくゆっくり上下させて指揮。右の通用口のすき間から、遅れてきた誰かのサンダルの足先だけがもぞもぞのぞく
// 動き: f2-28 樫の扉が左右に開く (すき間から光) / f30-260 カメラがゆっくり右へパン / 音符が頭の上で1つずつ生まれ、約150コマかけてゆっくり浮かんで消える / ろうそくの炎がゆらぐ / 院長の手が40コマ周期でゆっくり / 足先がもぞもぞ
const MzAbMonk: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; old?: boolean; abbot?: boolean }> = ({
  x, y, s, f, phase = 0, old = false, abbot = false,
}) => {
  const sway = Math.sin((f + phase * 30) / 42) * 2.2;
  const mo = 7 + Math.sin((f + phase * 9) / 20) * 3;
  // 頭巾は頭にかぶせず、首の後ろに下ろした布のたまり (肩の後ろのふくらみ + 首まわりの U 字のえり)
  const hood = (
    <path d="M -92 -132 Q -104 -178 -70 -196 Q -40 -176 0 -174 Q 40 -176 70 -196 Q 104 -178 92 -132 Z" fill={MP.habitMid} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  );
  const collar = (
    <g>
      <path d="M -70 -150 Q -78 -178 -50 -176 Q 0 -146 50 -176 Q 78 -178 70 -150 Q 0 -100 -70 -150 Z" fill={MP.habitMid} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -46 -150 Q 0 -122 46 -150" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.55} />
    </g>
  );
  // 若い修道士: 短い黒髪の上にトンスラ (頭のてっぺんの剃った丸) + 太めの眉
  const youngHead = !old ? (
    <g>
      <ellipse cx={0} cy={-282} rx={26} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
      <path d="M -40 -243 Q -26 -251 -12 -244 M 12 -244 Q 26 -251 40 -243" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  ) : null;
  const belly = old ? <ellipse cx={0} cy={-104} rx={84} ry={64} fill={MP.habit} stroke={C.ink} strokeWidth={5} /> : null;
  const skirt = (
    <g>
      <path d="M -60 -66 L -74 -4 Q 0 8 74 -4 L 60 -66 Z" fill={MP.habit} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -30 -60 L -38 -4 M 4 -60 L 6 0 M 34 -60 L 42 -4" stroke={MP.habitMid} strokeWidth={4} opacity={0.8} />
      {/* サンダルの足先 */}
      {[-24, 24].map((tx) => (
        <g key={tx}>
          <ellipse cx={tx} cy={0} rx={16} ry={7} fill="#E9D7C2" stroke={C.ink} strokeWidth={3} />
          <line x1={tx - 12} y1={-2} x2={tx + 12} y2={-2} stroke={MP.woodDark} strokeWidth={4} />
        </g>
      ))}
      {/* 縄の帯 */}
      <path d="M -60 -76 Q 0 -66 60 -76" stroke={C.rope} strokeWidth={8} fill="none" />
      <path d="M -60 -76 Q 0 -66 60 -76" stroke={C.ink} strokeWidth={1.5} fill="none" strokeDasharray="5 6" opacity={0.6} />
      <circle cx={20} cy={-70} r={7} fill={C.rope} stroke={C.ink} strokeWidth={2.5} />
      <path d={`M 20 -66 q ${5 + sway} 24 ${-2 + sway} 46`} stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
  const oldFace = old ? (
    <g>
      {/* 白髪 (横) */}
      {/* はげ頭: 白髪は耳の上に少しだけ (てっぺんは肌のまま) + 頭のてかり */}
      <path d="M -63 -246 Q -76 -230 -64 -208 Q -58 -226 -57 -242 Z" fill={C.beard} stroke={C.ink} strokeWidth={3.5} />
      <path d="M 63 -246 Q 76 -230 64 -208 Q 58 -226 57 -242 Z" fill={C.beard} stroke={C.ink} strokeWidth={3.5} />
      <path d="M -26 -280 Q -12 -288 4 -286" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
      <path d="M -30 -268 Q -24 -272 -18 -270" stroke={C.ink} strokeWidth={2.5} fill="none" opacity={0.35} />
      {/* 白いひげ (あごから胸へ) */}
      <path d="M -48 -206 Q -52 -150 0 -128 Q 52 -150 48 -206 Q 24 -186 0 -190 Q -24 -186 -48 -206 Z" fill={C.beard} stroke={C.ink} strokeWidth={3.5} />
      <path d="M -20 -170 q 4 14 0 24 M 0 -164 q 4 14 0 24 M 20 -170 q 4 14 0 24" stroke="#C9C7BE" strokeWidth={3} fill="none" />
      {/* 歌う口 */}
      <ellipse cx={0} cy={-180} rx={9} ry={mo} fill={C.ink} />
      {/* 口ひげ */}
      <path d="M -32 -196 Q -16 -212 0 -201 Q 16 -212 32 -196 Q 18 -188 0 -195 Q -18 -188 -32 -196 Z" fill={C.beard} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M -44 -212 l -8 -4 M 44 -212 l 8 -4" stroke={C.ink} strokeWidth={2.5} opacity={0.6} />
    </g>
  ) : null;
  // 院長の腕: 右手で指揮 (ゆっくり) / 左手に小さな鈴
  const cA = Math.sin(f / 40 + 0.6);
  const abbotFront = abbot ? (
    <g>
      {/* 首の十字架 */}
      <path d="M -30 -162 L 0 -124 L 30 -162" stroke={MP.brass} strokeWidth={3.5} fill="none" />
      <rect x={-5} y={-128} width={10} height={40} rx={2} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
      <rect x={-16} y={-118} width={32} height={10} rx={2} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
      <MzAbLimb pts={[[-60, -142], [-84, -96], [-62, -60]]} cloth={MP.habit} w={30} />
      {/* 鈴 (鳴らさない) */}
      <g transform="translate(-62 -50)">
        <line x1={0} y1={-6} x2={0} y2={6} stroke={C.ink} strokeWidth={4} />
        <path d="M -16 34 Q -18 6 0 4 Q 18 6 16 34 L 22 40 L -22 40 Z" fill={MP.brass} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M -8 30 Q -9 14 -2 10" stroke={MP.brassLight} strokeWidth={3} fill="none" />
      </g>
      <MzAbLimb pts={[[60, -142], [118 + cA * 6, -184 - cA * 18], [146 + cA * 14, -252 - cA * 34]]} cloth={MP.habit} w={30} />
      {/* 指揮の軌跡 (ゆっくりの弧) */}
      <path d={`M 120 -330 Q 190 -300 176 -220`} stroke={C.honeyLight} strokeWidth={5} fill="none" strokeDasharray="4 14" strokeLinecap="round" opacity={0.75} />
    </g>
  ) : null;
  const body = (
    <Person x={0} y={0} s={1} f={f} phase={phase} still cloth={MP.habit} clothDark={MP.habit}
      hair={old ? "none" : "cap"} face={old ? "normal" : "joy"} pose={old ? "stand" : "hold"} gaze={abbot ? [-6, 0] : [0, -4]} />
  );
  if (abbot) {
    return (
      <MzAbBare x={x} y={y} s={s} lean={sway * 0.4} back={<g>{hood}{belly}</g>} front={<g>{collar}{skirt}{oldFace}{abbotFront}</g>}>
        {body}
      </MzAbBare>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
      {hood}
      {belly}
      {body}
      {collar}
      {youngHead}
      {skirt}
      {oldFace}
      {!old && (
        <g>
          {/* 聖歌の小さな本 (両手で持つ) */}
          <rect x={-36} y={-118} width={72} height={36} rx={4} fill="#7A2E2E" stroke={C.ink} strokeWidth={4} />
          <rect x={-30} y={-114} width={60} height={8} fill={C.page} />
          <line x1={0} y1={-118} x2={0} y2={-82} stroke={C.ink} strokeWidth={3} />
          {/* 歌う口 (joy の口の上に、ゆっくり開け閉め) */}
          <ellipse cx={0} cy={-184} rx={12} ry={mo + 2} fill={C.ink} />
          <ellipse cx={0} cy={-180 + mo * 0.4} rx={6} ry={3} fill="#E06A5A" />
        </g>
      )}
    </g>
  );
};

const Mz012: React.FC<{ f: number }> = ({ f }) => {
  const open = easeInOut(seg(f, 2, 28));
  const pan = lerp(70, -95, easeInOut(seg(f, 30, 300)));
  const monks: { x: number; s: number; old: boolean; phase: number }[] = [
    { x: 300, s: 0.82, old: false, phase: 0 },
    { x: 490, s: 0.98, old: true, phase: 1 },
    { x: 670, s: 0.82, old: false, phase: 2 },
    { x: 850, s: 0.94, old: true, phase: 3 }, // 壁の十字架 (x 922〜998) が頭に重ならない位置
  ];
  const FEET = 905;
    const toe = Math.sin(f / 7) * 3;
  // 扉の板1枚 (x 0〜960 に描く)
  const leaf = (
    <g>
      <rect x={0} y={-40} width={962} height={1160} fill={C.oak} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <line x1={i * 160} y1={-40} x2={i * 160} y2={1120} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${i * 160 + 40} 60 q 20 300 -6 620 M ${i * 160 + 110} 200 q -14 300 8 700`} stroke={C.oakLight} strokeWidth={6} fill="none" opacity={0.6} />
        </g>
      ))}
      {[200, 840].map((by) => (
        <g key={by}>
          <rect x={0} y={by} width={962} height={42} fill={MP.iron} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={50 + i * 110} cy={by + 21} r={8} fill={MP.ironLight} stroke={C.ink} strokeWidth={3} />)}
        </g>
      ))}
      <circle cx={880} cy={560} r={44} fill="none" stroke={MP.iron} strokeWidth={14} />
      <circle cx={880} cy={516} r={16} fill={MP.ironLight} stroke={C.ink} strokeWidth={4} />
    </g>
  );
  return (
    <Frame f={f} seed={6012} dark>
      <g transform={`translate(${pan} 0) translate(960 540) scale(1.1) translate(-960 -540)`}>
        <Shudouin f={f} dark={1} candle={3} bell={0} />
        {/* 聖歌隊席の板 (ベッドの列を隠す) */}
        <rect x={-120} y={684} width={2160} height={160} fill={MP.woodDark} stroke={C.ink} strokeWidth={6} />
        <rect x={-120} y={672} width={2160} height={22} rx={6} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 19 }, (_, i) => (
          <path key={i} d={`M ${-90 + i * 116} 840 L ${-90 + i * 116} 750 A 40 40 0 0 1 ${-10 + i * 116} 750 L ${-10 + i * 116} 840`}
            fill="#5E3E24" stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 書見台と大きな聖歌の本 (ネウマ譜) */}
        <g>
          <rect x={1142} y={690} width={22} height={215} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
          <path d="M 1100 905 L 1206 905 L 1186 884 L 1120 884 Z" fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
          <path d="M 1060 700 L 1246 700 L 1226 650 L 1080 650 Z" fill={MP.wood} stroke={C.ink} strokeWidth={5} />
          <path d="M 1070 652 Q 1110 618 1153 640 Q 1196 618 1236 652 L 1226 690 Q 1190 670 1153 686 Q 1116 670 1080 690 Z" fill={C.page} stroke={C.ink} strokeWidth={4.5} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <line x1={1088} y1={652 + r * 11} x2={1146} y2={656 + r * 11} stroke="#B8403A" strokeWidth={2} />
              <line x1={1160} y1={656 + r * 11} x2={1218} y2={652 + r * 11} stroke="#B8403A" strokeWidth={2} />
              {[0, 1, 2, 3].map((k) => <rect key={k} x={1094 + k * 30 + (r % 2) * 8} y={648 + r * 11 + (k % 2) * 3} width={6} height={6} fill={C.ink} />)}
            </g>
          ))}
        </g>
        {/* 右の通用口 (すき間から遅刻者のサンダルの足先) */}
        <g>
          <path d="M 1552 832 L 1552 640 A 74 74 0 0 1 1700 640 L 1700 832 Z" fill={MP.stoneDark} stroke={C.ink} strokeWidth={6} />
          <path d="M 1590 830 L 1590 646 A 52 52 0 0 1 1690 640 L 1690 830 Z" fill={C.oakLight} stroke={C.ink} strokeWidth={5} />
          <path d="M 1566 830 L 1566 640 A 26 40 0 0 1 1590 612 L 1590 830 Z" fill="#141828" />
          <path d="M 1610 700 L 1680 700 M 1610 780 L 1680 780" stroke={MP.iron} strokeWidth={7} />
          <circle cx={1606} cy={740} r={7} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
          <g transform={`translate(${1578 + toe} 826)`}>
            <path d="M -14 0 Q -16 -14 0 -16 Q 18 -16 22 -6 L 22 2 Z" fill="#8A6038" stroke={C.ink} strokeWidth={3} />
            {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={8 + k * 5.5} cy={-12 + Math.abs(k - 1.5) * 1.5 + (k === 3 ? Math.sin(f / 3) * 1.5 : 0)} rx={3.4} ry={4} fill="#EBCDB0" stroke={C.ink} strokeWidth={2} />)}
            <line x1={-4} y1={-8} x2={20} y2={-8} stroke={MP.woodDark} strokeWidth={4} />
          </g>
        </g>
        {/* 修道士たち */}
        {monks.map((m) => <MzAbMonk key={m.x} x={m.x} y={FEET} s={m.s} f={f} old={m.old} phase={m.phase} />)}
        <MzAbMonk x={1350} y={FEET + 6} s={1.0} f={f} old abbot phase={4} />
        {/* 手前の暗さ (ろうそくの明かりは上に残す) */}
        <rect x={-200} y={600} width={2400} height={600} fill={MP.nightDeep} opacity={0.26} />
        {/* 歌の音符: 1つずつ離れて、頭の上にふわっと現れ、のんびり浮かんで消える (口とはつながない) */}
        {monks.map((m, i) => {
          const PERIOD = 64, LIFE = 150;
          const headTop = FEET - 318 * m.s;
          return (
            <g key={i}>
              {[-2, -1, 0, 1, 2, 3, 4, 5].map((k) => {
                const born = k * PERIOD + i * 17 - 40;
                const age = f - born;
                if (age < 0 || age > LIFE) return null;
                const t = age / LIFE;
                const op = Math.min(1, age / 26) * Math.min(1, (LIFE - age) / 34);
                const side = ((k + i) % 2 === 0 ? 1 : -1) * (26 + ((k * 7 + i * 5) % 3) * 12);
                const nx = m.x + side + Math.sin((age + k * 40 + i * 23) / 30) * 12;
                const ny = headTop - 8 - age * 1.05;
                const sc = (0.78 + ((k + i * 2) % 3) * 0.1) * (0.7 + 0.3 * Math.min(1, age / 26));
                return (
                  <g key={k} opacity={op}>
                    <MzAbNote x={nx} y={ny} s={sc} rot={-10 + Math.sin((age + k * 15) / 45) * 10} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
      {/* 扉 (左右に開く) */}
      {open < 0.995 && (
        <g>
          <rect x={960 - open * 980 - 10} y={0} width={open * 1960 + 20} height={1080} fill={MP.glow} opacity={0.18 * (1 - open)} />
          <g transform={`scale(${1 - open} 1)`}>{leaf}</g>
          <g transform={`translate(1920 0) scale(${-(1 - open)} 1)`}>{leaf}</g>
        </g>
      )}
      <TagPlate x={1730} y={96} text="約1500年前" size={40} t={seg(f, 20, 32)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #13 豆鉄砲で、人の家の窓を撃つのが仕事の人にも、会います。
// 格: 山 / seed 6013
// 絵: どこ: イギリスの工業の町の夜明け前 (MachiNami を先取りでちら見せ。windows=全部暗い, sky=0)。2階建てのれんがの長屋・2階の寝室の窓・石畳・ガス灯・遠くに工場の煙突。札は「イギリス」。演出: KnockerUp (pose="shoot", female=false, face="smile") が石畳に立ち、細い管 (豆鉄砲) を口に当てて2階の窓をねらう。ぷっ。豆が弧を描いて飛び、窓ガラスにコツン (小さな星の光)。1拍おいて窓に明かりが点き、ナイトキャップの寝ぼけ顔の男性 (短い黒髪・灰の寝間着) がカーテンを開けて顔を出す。KnockerUp は帽子のつばをちょっと上げてあいさつ。腕は2本 (pose="shoot" は両手で管を持つ)。豆鉄砲は「こういう人もいた」の予告であり、町じゅうの人が豆鉄砲を使っている絵にはしない (この1人だけ)。動き: f0-30 カメラが煙突から通りへ下りる / f40 ぷっ / f40-70 豆が飛ぶ / f70 コツン / f90 窓に明かり / f100-150 寝ぼけ顔とあいさつ
// どこ: イギリスの工業の町の夜明け前 (MachiNami sky=0。窓は全部暗い)。れんがの長屋・2階の寝室の窓・ガス灯・石畳・遠くの工場の煙突。左上に英国旗つきの「イギリス」の札
// 演出: KnockerUp (pose="shoot"、男性の後ろ姿) が石畳に立ち、豆鉄砲を口に当てて4軒目の2階の窓をねらう。ぷっ (管の先に白い煙)。緑の豆が弧を描いて飛び、窓ガラスにコツン (星の光)。一拍おいて窓に明かりが点き、窓が上がって、紅白しまのナイトキャップの寝ぼけ顔の男性 (短い黒髪・灰の寝間着・まぶた半分) がカーテンをつかんで顔を出す。KnockerUp はぺこりと会釈
// 動き: f0-18 カメラが煙突の上から通りへ下りる / f18 ぷっ / f18-30 豆が飛ぶ / f30 コツン / f32-38 窓に明かり / f40-50 窓が開いて顔が上がってくる / f55-75 会釈 / 最後までカメラがゆっくり寄る
const Mz013: React.FC<{ f: number }> = ({ f }) => {
  const [cx, cy, sc] = camKeys(f, [[0, 1125, 250, 1.45], [18, 1010, 560, 1.06], [147, 1060, 520, 1.14]]);
  const W3 = MACHI_WIN[3];
  const KX = 711, KY = MACHI_GROUND + 40;
  const tube: Pt = [KX + 203 * 0.9, KY - 399 * 0.9];
  const target: Pt = [W3[0] - 22, W3[1] + 18];
  const ft = seg(f, 18, 30);
  const pea: Pt = [lerp(tube[0], target[0], ft), lerp(tube[1], target[1], ft) - Math.sin(ft * Math.PI) * 70];
  const hit = f >= 30 ? clamp01(1 - (f - 30) / 14) : 0;
  const lit = seg(f, 32, 38);
  const opened = f >= 40;
  const rise = easeOut(seg(f, 40, 50));
  const bow = Math.sin(Math.PI * seg(f, 55, 75)) * 6;
  const puff = seg(f, 18, 28);
  const wins: (number | "open")[] = [0, 0, 0, opened ? "open" : lit, 0, 0];
  const clipId = useMzAbId("mz13win");
  const mY = W3[1] + 228 * 0.55 - 6 + (1 - rise) * 130;
  return (
    <Frame f={f} seed={6013} dark>
      <g transform={cam(cx, cy, sc)}>
        <MachiNami f={f} windows={wins} sky={0} />
        {/* 寝ぼけ顔の男 (窓の中だけに見える) */}
        <defs><clipPath id={clipId}><rect x={W3[0] - 60} y={W3[1] - 80} width={120} height={160} /></clipPath></defs>
        {opened && (
          <g clipPath={`url(#${clipId})`}>
            <g transform={`translate(${W3[0]} ${mY}) scale(0.55)`}>
              <Person x={0} y={0} s={1} f={f} face="normal" pose="raise" cloth={C.nightShirt} clothDark={C.nightShirtDark} hair="cap" phase={3} gaze={[-6, 6]} />
              {/* 半分閉じたまぶた */}
              {[-24, 24].map((ex) => (
                <g key={ex}>
                  <rect x={ex - 15} y={-244} width={30} height={22} fill={KRP.white} />
                  <line x1={ex - 14} y1={-222} x2={ex + 14} y2={-222} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
                </g>
              ))}
              {/* あくびの口 */}
              <ellipse cx={0} cy={-186} rx={12} ry={7 + Math.sin(f / 9) * 3} fill={C.ink} />
              {/* 紅白しまのナイトキャップ */}
              <path d={`M -66 -262 Q -60 -316 0 -320 Q 46 -322 ${-86 + Math.sin(f / 8) * 4} -300 L ${-98 + Math.sin(f / 8) * 4} -288 Q 30 -306 66 -262 Z`} fill={C.capRed} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
              <path d="M -40 -302 Q 0 -294 30 -314 M -58 -282 Q 0 -274 54 -298" stroke={KRP.white} strokeWidth={7} fill="none" />
              <rect x={-70} y={-270} width={140} height={14} rx={7} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
              <circle cx={-98 + Math.sin(f / 8) * 4} cy={-286} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              {/* つかんだカーテン */}
              <path d="M 60 -380 L 120 -380 L 120 -60 Q 90 -150 70 -240 Z" fill="#C98C6A" stroke={C.ink} strokeWidth={4} />
            </g>
          </g>
        )}
        {/* 豆鉄砲の人 (この1人だけ) */}
        <g transform={`rotate(${bow} ${KX} ${KY})`}>
          <KnockerUp x={KX} y={KY} s={0.9} f={f} pose="shoot" face="smile" />
        </g>
        {/* ぷっ (管の先の白い煙) */}
        {puff > 0 && puff < 1 && [0, 1, 2].map((k) => (
          <circle key={k} cx={tube[0] + 10 + k * 14 * puff} cy={tube[1] - 6 - k * 10 * puff} r={8 + puff * 16 - k * 3}
            fill={KRP.white} stroke={C.ink} strokeWidth={2.5} opacity={(1 - puff) * 0.9} />
        ))}
        {/* 飛ぶ豆と軌跡 */}
        {f >= 18 && f < 31 && (
          <g>
            {[0.15, 0.3, 0.45].map((d, k) => {
              const t2 = Math.max(0, ft - d * 0.4);
              return <circle key={k} cx={lerp(tube[0], target[0], t2)} cy={lerp(tube[1], target[1], t2) - Math.sin(t2 * Math.PI) * 70} r={3} fill={KRP.white} opacity={0.6 - k * 0.15} />;
            })}
            <circle cx={pea[0]} cy={pea[1]} r={11} fill={C.green} stroke={C.ink} strokeWidth={3.5} />
            <circle cx={pea[0] - 3} cy={pea[1] - 3} r={3} fill={KRP.white} opacity={0.7} />
          </g>
        )}
        {/* コツン (星の光) */}
        {hit > 0 && (
          <g transform={`translate(${target[0]} ${target[1]}) scale(${0.6 + (1 - hit) * 0.7}) rotate(${(1 - hit) * 40})`} opacity={hit}>
            <path d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill={MP.glow} stroke={C.ink} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={0} y1={-54} x2={0} y2={-74} stroke={MP.glow} strokeWidth={6} strokeLinecap="round" transform={`rotate(${k * 60 + 30})`} />
            ))}
          </g>
        )}
        {/* 落ちた豆が窓台でころん */}
        {f >= 30 && (
          <circle cx={target[0] + Math.min(f - 30, 20) * 1.5} cy={Math.min(target[1] + (f - 30) * (f - 30) * 0.5, W3[1] + 94)} r={10} fill={C.green} stroke={C.ink} strokeWidth={3} />
        )}
      </g>
      {/* 地名札と英国旗 */}
      <g transform="translate(1560 70)">
        <rect x={0} y={0} width={96} height={58} fill="#1F3A7A" stroke={C.ink} strokeWidth={4} />
        <path d="M 0 0 L 96 58 M 96 0 L 0 58" stroke={KRP.white} strokeWidth={12} />
        <path d="M 0 0 L 96 58 M 96 0 L 0 58" stroke="#C8372B" strokeWidth={4} />
        <path d="M 48 0 L 48 58 M 0 29 L 96 29" stroke={KRP.white} strokeWidth={18} />
        <path d="M 48 0 L 48 58 M 0 29 L 96 29" stroke="#C8372B" strokeWidth={10} />
        <rect x={0} y={0} width={96} height={58} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
      <TagPlate x={1780} y={100} text="イギリス" size={38} t={seg(f, 6, 18)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #14 そして最後に、ひとつの謎が残ります。
// 格: 並 / seed 6014
// 絵: どこ: 夜の寝室のナイトテーブルの上 (Shinshitsu の小物を寄りで: スタンドの明かり・コップ)。開いた革表紙の捜査手帳。演出: 手帳のページに、ここまでの3つの事件の鉛筆スケッチが並んでいる (時計の向こうの通路 / 修道院のゆっくりの音符 / 豆鉄砲の窓)。風もないのにページがぱらぱらめくれ、最後に真っ白なページで止まる。そこに上から万年筆のインクが1滴ぽたりと落ち、じわっとにじんで大きな「?」の形になる。手帳の横にいた Kobito が1人、驚いてしりもち (face="surprised")。動き: f0-40 カメラが手帳へ寄る / f40-90 ページがめくれる (3つのスケッチが流れる) / f100 インクが落ちる / f100-140 「?」ににじむ / f130 しりもち
// どこ: 夜の寝室のナイトテーブルの上を寄りで (Shinshitsu と同じ真鍮のスタンドのあかり・水のコップ・暗い縦じまの壁紙)。机の真ん中に開いた革表紙の捜査手帳、手前に鉛筆と消しかす
// 演出: 左のページに、ここまでの3つの事件の鉛筆スケッチ (時計の見える通路 / 修道院のアーチとはちみつの音符 / 豆が飛ぶ窓) がテープで貼ってある。風もないのに右のページがぱらぱらめくれ、真っ白なページで止まる。上から万年筆が降りてきて、インクが1滴ぽたり。じわっとにじんで大きな「?」になる。手帳の横の Kobito が驚いてしりもち
// 動き: f0-40 カメラが手帳へ寄る / f2-28 ページが4枚めくれる / f10-20 万年筆が降りる / f20-30 しずくが落ちる / f30-42 「?」ににじむ / f34 しりもち (星が回る) / そのあと「?」のにじみがゆっくり広がる
const Mz014: React.FC<{ f: number }> = ({ f }) => {
  const sc = 1 + 0.07 * easeOut(seg(f, 0, 40)) + 0.0005 * f;
  const SP = 960, PT = 380, PB = 862, PW = 466;
  const penIn = easeOut(seg(f, 8, 18));
  const NIB: Pt = [1196, 262 - 300 * (1 - penIn)];
  const dropForm = seg(f, 18, 24);
  const dropFall = seg(f, 24, 30);
  const reveal = easeOut(seg(f, 30, 42));
  const bleed = seg(f, 30, 95);
  const fell = f >= 34;
  const pageFlip = (st: number, k: number) => {
    const p = seg(f, st, st + 8);
    if (p <= 0 || p >= 1) return null;
    const c = Math.cos(p * Math.PI);
    const ex = SP + PW * c, lift = Math.sin(p * Math.PI) * 44;
    return (
      <g key={k}>
        <polygon points={`${SP},${PT} ${ex},${PT - lift} ${ex},${PB - lift * 0.5} ${SP},${PB}`} fill={p < 0.5 ? C.page : C.pageBack} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        {p < 0.5 && (
          <g transform={`translate(${SP} 0) scale(${c} 1) translate(${-SP} 0)`} stroke={C.pencil} strokeWidth={4} fill="none" opacity={0.7}>
            <path d={`M 1010 ${440 + k * 30} q 60 -30 120 0 t 120 0`} />
            <rect x={1030} y={520 + k * 20} width={160} height={110} />
            <path d={`M 1240 ${560 + k * 10} l 90 60 M 1240 ${620 + k * 10} l 90 -60`} />
          </g>
        )}
      </g>
    );
  };
  return (
    <Frame f={f} seed={6014} dark>
      <g transform={`translate(1000 600) scale(${sc}) translate(-1000 -600)`}>
        {/* 夜の壁 (縦じまの壁紙) */}
        <rect x={-60} y={-60} width={2040} height={720} fill={C.nightWall} />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-40 + i * 70} y={-60} width={16} height={720} fill={C.nightWallLine} />)}
        {/* スタンドの光の輪 */}
        <circle cx={1720} cy={360} r={640} fill={MP.glow} opacity={0.07} />
        <circle cx={1720} cy={360} r={400} fill={MP.glow} opacity={0.1} />
        {/* 机 (ナイトテーブルの天板) */}
        <rect x={-60} y={600} width={2040} height={540} fill={MP.wood} />
        <rect x={-60} y={596} width={2040} height={18} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
        <g stroke={MP.woodDark} strokeWidth={4} opacity={0.45} fill="none">
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -60 ${660 + i * 80} q 500 ${rnd(14, i) * 30 - 15} 1000 0 t 1000 0`} />)}
        </g>
        <ellipse cx={1500} cy={760} rx={700} ry={260} fill={MP.glow} opacity={0.12} />
        {/* 水のコップ */}
        <g>
          <ellipse cx={300} cy={700} rx={80} ry={16} fill={C.ink} opacity={0.2} />
          <path d="M 226 440 L 240 700 L 360 700 L 374 440 Z" fill="#DCEFF8" stroke={C.ink} strokeWidth={5} opacity={0.95} />
          <path d="M 232 540 L 240 700 L 360 700 L 368 540 Z" fill="#A9D2EA" opacity={0.75} />
          <ellipse cx={300} cy={540} rx={68} ry={10} fill="#C6E3F3" stroke={C.ink} strokeWidth={2.5} />
          <path d="M 252 470 L 262 680" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
          <ellipse cx={300} cy={440} rx={74} ry={12} fill="none" stroke={C.ink} strokeWidth={4} />
        </g>
        {/* スタンド */}
        <g>
          <polygon points="1560,420 1880,420 2000,1100 1360,1100" fill={MP.glow} opacity={0.1} />
          <ellipse cx={1720} cy={700} rx={100} ry={22} fill={MP.brassDark} stroke={C.ink} strokeWidth={5} />
          <rect x={1706} y={420} width={28} height={280} fill={MP.brass} stroke={C.ink} strokeWidth={5} />
          <path d="M 1560 420 L 1880 420 L 1800 120 L 1640 120 Z" fill="#FFE9B0" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 1580 380 L 1860 380" stroke="#E8CB86" strokeWidth={5} />
          <path d="M 1660 150 L 1610 400" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
        </g>
        {/* 手帳 */}
        <g transform="rotate(-1.5 960 620)">
          <ellipse cx={960} cy={900} rx={540} ry={28} fill={C.ink} opacity={0.25} />
          <rect x={466} y={360} width={988} height={524} rx={22} fill={C.leather} stroke={C.ink} strokeWidth={7} />
          <rect x={482} y={376} width={956} height={492} rx={16} fill="none" stroke={C.leatherDark} strokeWidth={4} strokeDasharray="10 8" />
          {/* ページの束の厚み */}
          {[0, 1, 2].map((k) => <path key={k} d={`M ${490 - k * 3} ${PB + 4 + k * 4} L ${1430 + k * 3} ${PB + 4 + k * 4}`} stroke={C.pageLine} strokeWidth={3} />)}
          <rect x={SP - PW} y={PT} width={PW} height={PB - PT} fill={C.page} stroke={C.ink} strokeWidth={4} />
          <rect x={SP} y={PT} width={PW} height={PB - PT} fill={C.page} stroke={C.ink} strokeWidth={4} />
          <rect x={SP - 30} y={PT} width={60} height={PB - PT} fill={C.ink} opacity={0.08} />
          <line x1={SP} y1={PT} x2={SP} y2={PB} stroke={C.ink} strokeWidth={4} />
          {/* しおりのひも */}
          <path d={`M ${SP + 4} ${PT} q 10 260 -6 ${PB - PT + 50}`} stroke="#B8403A" strokeWidth={6} fill="none" />
          {/* 左のページ: 3つの事件の鉛筆スケッチ */}
          <g stroke={C.pencil} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* ① 時計の向こうの通路 */}
            <rect x={516} y={406} width={196} height={152} fill="#FBF7EA" />
            <path d="M 516 406 L 596 466 M 712 406 L 636 466 M 516 558 L 596 504 M 712 558 L 636 504" />
            <rect x={596} y={466} width={40} height={38} />
            <circle cx={616} cy={485} r={11} />
            <path d="M 616 485 L 616 478 M 616 485 L 621 488" />
            <path d="M 540 420 l 10 8 M 690 540 l -10 -8" opacity={0.5} />
            {/* ② 修道院のアーチとはちみつの音符 */}
            <rect x={734} y={406} width={196} height={152} fill="#FBF7EA" />
            <path d="M 760 558 L 760 470 A 72 72 0 0 1 904 470 L 904 558" />
            <path d="M 772 520 Q 830 490 892 452" />
            {[[796, 506], [842, 484], [884, 458]].map(([nx, ny], k) => (
              <g key={k}>
                <ellipse cx={nx} cy={ny} rx={9} ry={6} fill={C.pencil} />
                <path d={`M ${nx + 8} ${ny} l 0 -26 M ${nx} ${ny + 6} q -1 10 0 ${16 + k * 4}`} />
              </g>
            ))}
            {/* ③ 豆鉄砲の窓 */}
            <rect x={610} y={598} width={228} height={176} fill="#FBF7EA" />
            <rect x={740} y={616} width={64} height={82} />
            <path d="M 772 616 L 772 698 M 740 657 L 804 657" />
            <path d="M 636 774 L 636 726 M 624 744 L 648 744" />
            <circle cx={636} cy={716} r={10} />
            <path d="M 648 712 Q 690 640 744 640" strokeDasharray="4 9" />
            <path d="M 744 640 l -8 -10 M 744 640 l 10 -6 M 744 640 l 4 12" />
          </g>
          {/* スケッチを留めるテープ */}
          {([[516, 406, -30], [930, 406, 30], [610, 598, -25], [838, 598, 25]] as const).map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 26} y={ty - 10} width={52} height={20} fill="#E8D9A0" opacity={0.85} stroke={C.ink} strokeWidth={2} transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {/* めくれるページ */}
          {[2, 8, 14, 20].map((st, k) => pageFlip(st, k))}
          {/* インクのにじみ → 「?」 */}
          {reveal > 0 && (
            <g>
              <circle cx={1196} cy={604} r={22 + bleed * 10} fill={C.inkBleed} opacity={0.3 * (1 - reveal * 0.6)} />
              <path d="M 1136 548 C 1136 462 1256 462 1256 548 C 1256 604 1196 606 1196 666" stroke={C.inkBleed} strokeWidth={56 + bleed * 10}
                fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${reveal} 1.2`} opacity={0.3} />
              <path d="M 1136 548 C 1136 462 1256 462 1256 548 C 1256 604 1196 606 1196 666" stroke={C.inkBlue} strokeWidth={36 + Math.sin(f / 9) * 2}
                fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${reveal} 1.2`} />
              <circle cx={1196} cy={736} r={24 * clamp01(reveal * 1.4 - 0.4) + bleed * 4} fill={C.inkBlue} />
              {[[1126, 600, 6], [1270, 640, 5], [1150, 700, 4], [1252, 470, 4], [1110, 520, 3]].map(([sx, sy, r], i) => (
                <circle key={i} cx={sx} cy={sy} r={r * clamp01(reveal * 2)} fill={C.inkBlue} />
              ))}
            </g>
          )}
        </g>
        {/* 万年筆 (上から降りてくる) */}
        <g transform={`translate(${NIB[0]} ${NIB[1]}) rotate(28)`}>
          <path d="M 0 0 L -15 -56 L 15 -56 Z" fill="#D9DDE2" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <line x1={0} y1={-6} x2={0} y2={-44} stroke={C.ink} strokeWidth={2.5} />
          <circle cx={0} cy={-40} r={4} fill={C.ink} />
          <rect x={-20} y={-96} width={40} height={42} rx={6} fill={C.ink} />
          <rect x={-22} y={-420} width={44} height={330} rx={12} fill={C.penBody} stroke={C.ink} strokeWidth={5} />
          <rect x={-22} y={-140} width={44} height={14} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
          <path d="M -10 -400 L -10 -160" stroke={KRP.white} strokeWidth={6} opacity={0.35} strokeLinecap="round" />
        </g>
        {/* インクのしずく */}
        {dropForm > 0 && reveal <= 0 && (
          <g transform={`translate(1196 ${lerp(268, 590, dropFall * dropFall)}) scale(${0.4 + 0.6 * dropForm})`}>
            <path d="M 0 -20 Q 14 0 12 8 Q 8 20 0 20 Q -8 20 -12 8 Q -14 0 0 -20 Z" fill={C.inkBlue} stroke={C.ink} strokeWidth={2.5} />
            <circle cx={-4} cy={6} r={3} fill={KRP.white} opacity={0.6} />
          </g>
        )}
        {/* 手前の鉛筆と消しかす */}
        <g transform="rotate(-8 520 960)">
          <rect x={300} y={944} width={420} height={30} fill="#F2C230" stroke={C.ink} strokeWidth={5} />
          <path d="M 720 944 L 780 959 L 720 974 Z" fill="#E9CFA6" stroke={C.ink} strokeWidth={4} />
          <path d="M 762 954 L 780 959 L 762 964 Z" fill={C.pencil} />
          <rect x={270} y={944} width={34} height={30} fill="#E8A3A0" stroke={C.ink} strokeWidth={4} />
        </g>
        {[[860, 950], [884, 962], [910, 948]].map(([ex, ey], i) => <ellipse key={i} cx={ex} cy={ey} rx={9} ry={4} fill="#E8A3A0" stroke={C.ink} strokeWidth={2} />)}
        {/* 小人 (驚いてしりもち) */}
        {!fell ? (
          <Kobito x={1546} y={812} s={0.5} f={f} face="normal" gaze={[-6, 2]} lean={-4} />
        ) : (
          <g>
            <Kobito x={1560} y={834} s={0.5} f={f} pose="sit" face="surprised" lean={-12} gaze={[-5, -4]} />
            {[0, 1, 2].map((k) => {
              const a = f / 6 + (k * Math.PI * 2) / 3;
              return <path key={k} transform={`translate(${1548 + Math.cos(a) * 54} ${640 + Math.sin(a) * 14}) scale(0.7)`}
                d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={MP.glow} stroke={C.ink} strokeWidth={2.5} />;
            })}
            <path d="M 1490 720 l -24 -10 M 1488 748 l -28 0 M 1494 776 l -22 10" stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={clamp01(1 - (f - 34) / 16)} />
            <path d="M 1612 676 q 8 14 0 20 q -8 -6 0 -20 Z" fill="#8FC3E6" stroke={C.ink} strokeWidth={2.5} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #15 人を起こすのが仕事の人は、毎朝、誰に起こしてもらっていたのか。
// 格: 山 / seed 6015
// 絵: どこ: 夜明け前のイギリスの工業の町の、狭い屋根裏部屋 (傾いた天井・小さな窓・わら布団・壁に長い棒が立てかけてある・窓の外に暗いれんがの家並み)。演出: KnockerUp (pose="sleep", female=false, face=寝顔) が、仕事の棒を壁に立てかけたまま、ぐっすり眠っている。窓の外は静まり返り、誰も窓をたたきに来ない。カメラがゆっくり寝顔へ寄ると、その頭の上に NazoBell (x=0.62, y=0.28, s=1.2, solved=false) が初めて、ぽんと現れて揺れる。ベルの「?」がゆらゆら脈打つ。部屋に時計は描かない (答えのネタバレ禁止)。立てかけた棒の先の針金の房が、すきま風でかすかに揺れる。動き: f0-60 窓の外の町から部屋の中へカメラが入る / f60-110 寝顔へ寄る / f110 NazoBell 登場 (ぽんと拡大) / f110-160 「?」が脈打つ・棒の房が揺れる
// どこ: 夜明け前のイギリスの工業の町の、狭い屋根裏部屋。左上から右下へ傾いた天井と太い垂木・しっくいの壁 (ひび)・天井の小さな窓 (外は暗いれんがの家並みと煙突、星)・床板。わら布団・つぎはぎの掛け布団・木箱の上の消えたろうそく (細い煙)・壁の釘に昼の山高帽と赤いマフラーと灰色のコート・脱いだ長靴。壁に立てかけた仕事の長い棒 (先に針金の房)。★時計は描かない
// 演出: KnockerUp (pose="sleep"、ナイトキャップ) がぐっすり眠っている。窓の外は静まり返り、誰も来ない。カメラが寝顔へ寄ると、頭の上に NazoBell (1190,302 s1.2) がぽんと初めて現れ、「?」が脈打つ。棒の先の房がすきま風でかすかに揺れ、窓のすきまから風の線
// 動き: f0-20 窓の外の町からカメラが引いて部屋の中へ / f20-40 寝顔へ寄る / f34-42 NazoBell がぽんと登場 / そのあと「?」の脈打ち・房のゆれ・寝息・ろうそくの煙・ゆっくり寄り続ける
const Mz015: React.FC<{ f: number }> = ({ f }) => {
  const [cx, cy, sc] = camKeys(f, [[0, 520, 250, 2.1], [20, 960, 540, 1.0], [40, 1140, 500, 1.24], [174, 1150, 490, 1.34]]);
  const bellT = pop(seg(f, 34, 42));
  const pulse = 1 + 0.06 * Math.sin(f / 5) * clamp01(seg(f, 42, 50));
  const draft = Math.sin(f / 23) * 4 + Math.sin(f / 7) * 1.5;
  const HX = 1355, HY = 642; // 寝ている人の足元 (頭は左の x≈1150)
  const winClip = useMzAbId("mz15win");
  return (
    <Frame f={f} seed={6015} dark>
      <g transform={cam(cx, cy, sc)}>
        {/* 奥の壁 (しっくい) */}
        <rect x={-60} y={-60} width={2040} height={900} fill={C.plaster} />
        <g stroke={C.plasterDark} strokeWidth={4} fill="none" opacity={0.7}>
          <path d="M 1500 300 l 30 40 l -12 30 l 40 50 M 1530 340 l 30 -10" />
          <path d="M 260 600 l 24 30 l -6 40 M 284 630 l 30 4" />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={100 + rnd(15, i) * 1760} cy={350 + rnd(16, i) * 420} r={4 + rnd(17, i) * 4} fill={C.plasterDark} stroke="none" opacity={0.5} />)}
        </g>
        {/* 傾いた天井 (左上→右下) と垂木 */}
        <path d="M -60 -60 L 1980 -60 L 1980 360 L -60 120 Z" fill={C.beam} />
        <path d="M -60 120 L 1980 360" stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => {
          const x0 = -40 + i * 330;
          const y0 = 120 + (x0 + 60) * (240 / 2040);
          return (
            <g key={i}>
              <path d={`M ${x0} ${y0} L ${x0 + 120} -60`} stroke={C.beamDark} strokeWidth={30} />
              <path d={`M ${x0} ${y0} L ${x0 + 120} -60`} stroke={C.ink} strokeWidth={3} opacity={0.5} />
            </g>
          );
        })}
        <path d="M -60 120 L 1980 360 L 1980 384 L -60 144 Z" fill={C.beamDark} stroke={C.ink} strokeWidth={5} />
        {/* 天井の小さな窓 (外は暗い町) */}
        <defs><clipPath id={winClip}><rect x={430} y={170} width={180} height={150} /></clipPath></defs>
        <g clipPath={`url(#${winClip})`}>
          <rect x={430} y={170} width={180} height={150} fill={MP.nightDeep} />
          {[[460, 190], [520, 210], [590, 186], [560, 240]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={2.5} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 9 + i)} />
          ))}
          <path d="M 430 320 L 430 270 L 470 250 L 510 270 L 510 256 L 560 256 L 560 236 L 590 220 L 610 236 L 610 320 Z" fill="#3A2A2E" stroke={C.ink} strokeWidth={3} />
          {[[446, 280], [480, 296], [530, 272], [585, 260]].map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={10} height={12} fill="#1E1A28" stroke={C.ink} strokeWidth={1.5} />)}
          <rect x={524} y={214} width={12} height={22} fill="#3A2A2E" stroke={C.ink} strokeWidth={2} />
        </g>
        <rect x={424} y={164} width={192} height={162} fill="none" stroke={C.beamDark} strokeWidth={14} />
        <rect x={418} y={158} width={204} height={174} fill="none" stroke={C.ink} strokeWidth={4} />
        <path d="M 520 170 L 520 320 M 430 245 L 610 245" stroke={C.beamDark} strokeWidth={8} />
        {/* すきま風の線 */}
        {[0, 1, 2].map((k) => {
          const t = ((f / 40 + k / 3) % 1);
          return <path key={k} d={`M ${620 + t * 160} ${250 + k * 20 + t * 40} q 30 -14 60 0 t 60 0`} stroke={KRP.white} strokeWidth={4} fill="none" strokeLinecap="round" opacity={Math.sin(t * Math.PI) * 0.6} />;
        })}
        {/* 月明かり */}
        <polygon points="430,320 610,320 980,840 520,840" fill="#C9D6F2" opacity={0.08} />
        {/* 床板 */}
        <rect x={-60} y={780} width={2040} height={400} fill={MP.woodDark} />
        <rect x={-60} y={772} width={2040} height={16} fill={C.beamDark} stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 50} x2={1980} y2={820 + i * 50} stroke={C.beamDark} strokeWidth={4} />)}
        {/* 壁の釘: 昼の山高帽・赤いマフラー・灰色のコート */}
        <g>
          <circle cx={240} cy={380} r={6} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
          <path d="M 180 400 L 300 400 L 312 700 Q 240 716 168 700 Z" fill="#7D828B" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 240 400 L 240 700" stroke={C.ink} strokeWidth={3} />
          {[460, 520, 580].map((by) => <circle key={by} cx={252} cy={by} r={6} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />)}
          <path d={`M 214 396 Q 206 470 ${218 + draft} 560 L ${238 + draft} 560 Q 228 470 236 396 Z`} fill="#C8372B" stroke={C.ink} strokeWidth={4} />
          <circle cx={340} cy={350} r={6} fill={MP.iron} stroke={C.ink} strokeWidth={2.5} />
          <ellipse cx={340} cy={364} rx={60} ry={10} fill="#2C2A2E" stroke={C.ink} strokeWidth={4} />
          <path d="M 304 364 Q 304 310 340 308 Q 376 310 376 364 Z" fill="#2C2A2E" stroke={C.ink} strokeWidth={4} />
          <path d="M 304 352 Q 340 358 376 352" stroke="#5A5560" strokeWidth={6} fill="none" />
        </g>
        {/* 壁に立てかけた仕事の棒 (先に針金の房) */}
        <g>
          <line x1={700} y1={790} x2={636} y2={208} stroke={C.ink} strokeWidth={15} strokeLinecap="round" />
          <line x1={700} y1={790} x2={636} y2={208} stroke={MP.woodLight} strokeWidth={8} strokeLinecap="round" />
          <line x1={640} y1={236} x2={636} y2={208} stroke={MP.iron} strokeWidth={11} strokeLinecap="round" />
          {[-40, -26, -12, 0, 12, 26, 40].map((d, i) => {
            const a = ((-96 + d + draft * (1 + i * 0.15)) * Math.PI) / 180;
            const ll = 26 + (i % 3) * 7;
            return <path key={i} d={`M 636 208 q ${Math.cos(a) * ll * 0.5 + 3} ${Math.sin(a) * ll * 0.5} ${Math.cos(a) * ll} ${Math.sin(a) * ll}`}
              stroke={MP.ironLight} strokeWidth={3} fill="none" strokeLinecap="round" />;
          })}
        </g>
        {/* 木箱と消えたろうそく (細い煙) */}
        <g>
          <rect x={1560} y={660} width={170} height={130} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
          <path d="M 1560 700 L 1730 700 M 1560 750 L 1730 750" stroke={MP.woodDark} strokeWidth={4} />
          <path d="M 1610 660 Q 1645 670 1680 660 L 1676 650 L 1614 650 Z" fill={MP.iron} stroke={C.ink} strokeWidth={3.5} />
          <rect x={1634} y={616} width={22} height={38} rx={3} fill="#F4ECD4" stroke={C.ink} strokeWidth={3.5} />
          <line x1={1645} y1={616} x2={1645} y2={606} stroke={C.ink} strokeWidth={3} />
          {[0, 1].map((k) => {
            const t = ((f / 70 + k / 2) % 1);
            return <path key={k} d={`M 1645 ${604 - t * 120} q ${8 + draft} -16 0 -32 q -8 -16 0 -32`} stroke="#E2DCD2" strokeWidth={3} fill="none" opacity={(1 - t) * 0.55} />;
          })}
        </g>
        {/* 脱いだ長靴 */}
        <g>
          <path d="M 1450 790 L 1450 700 L 1484 700 L 1486 770 L 1526 772 Q 1534 790 1520 792 Z" fill="#3A3030" stroke={C.ink} strokeWidth={4} />
          <path d="M 1500 790 L 1504 712 L 1536 712 L 1534 772 L 1574 778 Q 1580 794 1566 794 Z" fill="#3A3030" stroke={C.ink} strokeWidth={4} transform="rotate(10 1530 790)" />
        </g>
        {/* わら布団 */}
        <g>
          <rect x={880} y={690} width={560} height={92} rx={30} fill={C.tick} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={910 + i * 60} y1={694} x2={910 + i * 60} y2={778} stroke={C.tickStripe} strokeWidth={6} opacity={0.6} />)}
          {[[884, 740, -150], [1438, 720, -30], [1436, 760, 20], [890, 704, -170]].map(([sx, sy, a], i) => (
            <g key={i} stroke={C.strawDark} strokeWidth={3}>
              {[0, 10, 20].map((d) => <line key={d} x1={sx} y1={sy} x2={sx + Math.cos(((a + d) * Math.PI) / 180) * 26} y2={sy + Math.sin(((a + d) * Math.PI) / 180) * 26} />)}
            </g>
          ))}
          {/* 枕 */}
          <ellipse cx={1128} cy={696} rx={96} ry={26} fill="#EFE8D8" stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 寝ている人 */}
        <KnockerUp x={HX} y={HY} s={0.9} f={f} pose="sleep" />
        {/* つぎはぎの掛け布団 (胸から足まで) */}
        <g>
          <path d={`M 1214 ${600 - Math.sin(f / 20) * 3} Q 1250 ${578 - Math.sin(f / 20) * 4} 1400 592 L 1424 702 Q 1300 714 1210 706 Z`} fill={C.quilt1} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M 1250 ${584 - Math.sin(f / 20) * 4} L 1250 708 M 1330 ${584 - Math.sin(f / 20) * 3} L 1330 710`} stroke={C.ink} strokeWidth={3.5} />
          <path d={`M 1250 ${584 - Math.sin(f / 20) * 4} L 1330 ${584 - Math.sin(f / 20) * 3} L 1330 710 L 1250 708 Z`} fill={C.quilt2} stroke={C.ink} strokeWidth={3.5} />
          <path d={`M 1330 ${584 - Math.sin(f / 20) * 3} L 1400 592 L 1424 702 L 1330 710 Z`} fill={C.quilt3} stroke={C.ink} strokeWidth={3.5} />
          <path d="M 1226 690 l 12 0 M 1270 690 l 12 0 M 1350 690 l 12 0" stroke={KRP.white} strokeWidth={3} strokeDasharray="4 4" opacity={0.7} />
        </g>
        {/* ナゾベル (初登場) */}
        {bellT > 0 && (
          <g transform={`translate(1190 302) scale(${bellT * pulse}) translate(-1190 -302)`}>
            <circle cx={1190} cy={302} r={96} fill={MP.glow} opacity={0.18 + 0.08 * Math.sin(f / 5)} />
            <NazoBell x={1190} y={302} s={1.2} f={f} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #16 まずは、いちばん疑われている、あなたの体から、調べてみます。
// 格: 並 / seed 6016
// 絵: どこ: Shinshitsu (sky=0, sleeper=1, alarms=0)。夜の寝室に戻る。演出: 枕の横から Kobito が3人、自分の背より大きな虫めがねを担いで登場し、「あなた」の寝顔に虫めがねを向ける。虫めがねの丸の中で、寝顔が大きく拡大される。そのとき「あなた」が寝たまま鼻をぽりぽりかき、腕の動きで Kobito たちが枕からころころ転げ落ちそうになる。最後に3人が額の上へよじ登り、中へ入っていく準備 (先頭がヘルメットのライトを点ける)。腕は2本 (「あなた」は右手だけ pose="scratch"、Kobito は pose="carry")。動き: f0-40 虫めがねを担いで登場 / f40-70 寝顔の拡大 / f75-100 鼻をかく・転げそうになる / f100-150 額へよじ登る・ライト点灯 / カメラは寝顔へ寄っていく
// どこ: あなたの寝室 (Shinshitsu sky=0, sleeper=1, alarms=0) を、枕の上の寝顔に寄って
// 演出: 枕の右から Kobito が3人、自分の背より大きな真鍮の虫めがねを担いで登場。寝顔に虫めがねを向けると、丸の中で寝顔が大きく拡大される。そこで「あなた」が寝たまま右手で鼻のあたりをぽりぽり (腕は布団から出る右手1本だけ)。手が虫めがねに当たって、小人たちが枕の端までころころ転げ落ちそうになる (いちばん後ろはふちで片足立ち)。最後に3人が頭のてっぺんへよじ登り、先頭がヘルメットのライトを点ける
// 動き: f0-24 虫めがねを担いで登場 / f26-40 寝顔の拡大 (f45 で拡大中) / f54-62 腕が出る / f60-80 ぽりぽり・虫めがねが押されて転げる / f82-92 腕が戻る / f100-128 頭へよじ登る / f124 ライト点灯 / カメラは寝顔へ寄り続ける
const Mz016: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1.72, 2.05, easeInOut(seg(f, 0, 157)));
  const dim = 0.52;
  const walkIn = 1 - easeOut(seg(f, 0, 24));
  const aim = easeOut(seg(f, 24, 36));
  const arm = easeOut(seg(f, 54, 62)) * (1 - easeOut(seg(f, 82, 92)));
  const bump = easeOut(seg(f, 61, 68));
  const settle = seg(f, 84, 100);
  const climb = easeInOut(seg(f, 100, 128));
  const lampOn = f >= 124;
  const scratch = arm > 0.85 && f < 82 ? Math.sin(f * 1.7) * 5 : 0;
  // 虫めがね
  const LC: Pt = [1062 + walkIn * 110 + bump * 34 - settle * 8, 600 - (1 - aim) * 26 + bump * 6 + settle * 16];
  const LR = 64;
  const lensRot = bump * 18 * (1 - settle) - settle * 25;
  const handleEnd: Pt = [LC[0] + 176, LC[1] - 50 + bump * 10];
  const handleY = (x: number) => lerp(LC[1], handleEnd[1], clamp01((x - LC[0] - LR) / (handleEnd[0] - LC[0] - LR)));
  const shown = aim * (1 - bump);
  // 小人3人 (枕の上 → 転げる → 頭のてっぺん)
  const base: Pt[] = [[1146, 606], [1168, 606], [1190, 606]];
  const top: Pt[] = [[1044, 553], [1068, 551], [1092, 558]];
  const tumbleX = [16, 24, 18];
  const kob = base.map((b, i) => {
    const bx = b[0] + walkIn * 110 + bump * tumbleX[i] * (1 - settle * 0.6);
    const by = b[1] + (i === 2 ? bump * 8 * (1 - settle) : 0);
    const x = lerp(bx, top[i][0], climb);
    const y = lerp(by, top[i][1], climb) - Math.sin(climb * Math.PI) * 26;
    const wob = bump * (1 - settle) * (i === 2 ? 28 + Math.sin(f / 2.6) * 10 : Math.sin(f / 3 + i) * 18);
    const headTilt = climb > 0.5 ? (Math.atan2(top[i][0] - 1062, 600 - top[i][1]) * 180) / Math.PI : 0;
    return { x, y, lean: wob + headTilt * climb, i };
  });
  const youArm = mixColor(MP.you, MP.nightDeep, dim);
  const blanket = mixColor("#EFC46A", MP.nightDeep, dim);
  const hand: Pt = [lerp(992, 1032, arm), lerp(616, 576, arm) + scratch];
  const lensClip = useMzAbId("mz16lens");
  return (
    <Frame f={f} seed={6016} dark>
      <g transform={cam(1075, 588, sc)}>
        <Shinshitsu f={f} sky={0} sleeper={1} alarms={0} />
        {/* 虫めがね */}
        <g transform={`rotate(${lensRot} ${handleEnd[0]} ${handleEnd[1]})`}>
          <line x1={LC[0] + LR} y1={LC[1]} x2={handleEnd[0]} y2={handleEnd[1]} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={LC[0] + LR} y1={LC[1]} x2={handleEnd[0]} y2={handleEnd[1]} stroke="#7B5331" strokeWidth={8} strokeLinecap="round" />
          <defs><clipPath id={lensClip}><circle cx={LC[0]} cy={LC[1]} r={LR} /></clipPath></defs>
          <circle cx={LC[0]} cy={LC[1]} r={LR} fill="#DDE6F0" />
          {shown > 0.05 && (
            <g clipPath={`url(#${lensClip})`} opacity={shown}>
              <rect x={LC[0] - LR} y={LC[1] - LR} width={LR * 2} height={LR * 2} fill={KRP.white} />
              <g transform={`translate(${LC[0]} ${LC[1]})`}>
                <MzAbSleepFace f={f} />
              </g>
            </g>
          )}
          <circle cx={LC[0]} cy={LC[1]} r={LR} fill="none" stroke={MP.brass} strokeWidth={9} />
          <circle cx={LC[0]} cy={LC[1]} r={LR + 5} fill="none" stroke={C.ink} strokeWidth={3} />
          <circle cx={LC[0]} cy={LC[1]} r={LR - 5} fill="none" stroke={C.ink} strokeWidth={2} />
          <path d={`M ${LC[0] - 26} ${LC[1] - 14} A 30 30 0 0 1 ${LC[0] - 10} ${LC[1] - 28}`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
        {/* 布団から出る右手 (鼻をぽりぽり) */}
        {arm > 0.02 && (
          <g>
            <path d={`M 986 624 Q 962 ${lerp(610, 560, arm)} ${hand[0]} ${hand[1]}`} stroke={C.ink} strokeWidth={26} fill="none" strokeLinecap="round" />
            <path d={`M 986 624 Q 962 ${lerp(610, 560, arm)} ${hand[0]} ${hand[1]}`} stroke={youArm} strokeWidth={17} fill="none" strokeLinecap="round" />
            <circle cx={hand[0]} cy={hand[1]} r={11} fill="#C9CCD6" stroke={C.ink} strokeWidth={4} />
            <path d={`M ${hand[0] + 6} ${hand[1] - 10} l 6 -4 M ${hand[0] + 10} ${hand[1] - 2} l 7 -1`} stroke={C.ink} strokeWidth={2.5} />
            <ellipse cx={984} cy={622} rx={20} ry={12} fill={blanket} stroke={C.ink} strokeWidth={4} />
            {scratch !== 0 && [0, 1].map((k) => (
              <path key={k} d={`M ${hand[0] - 20 - k * 8} ${hand[1] - 24 + k * 6} l -10 -6`} stroke={KRP.white} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
            ))}
          </g>
        )}
        {/* 小人たち */}
        {kob.map((k) => {
          const carrying = climb < 0.05 && settle < 0.5;
          const face = bump > 0.1 && climb < 0.3 ? "surprised" : climb > 0.6 ? "smile" : "normal";
          if (carrying) {
            // 担ぐ: 両手を上げて柄を支える
            const hy = (handleY(k.x) - 2 - k.y) / 0.2;
            return (
              <MzAbKobitoBare key={k.i} x={k.x} y={k.y} s={0.2} f={f} lean={k.lean} phase={k.i} face={face} gaze={[-5, -2]}
                arms={[[[-62, -140], [-84, (hy - 140) / 2 - 20], [-40, hy]], [[62, -140], [84, (hy - 140) / 2 - 20], [40, hy]]]} />
            );
          }
          return (
            <MzAbKobitoBare key={k.i} x={k.x} y={k.y} s={0.2} f={f} lean={k.lean} phase={k.i} face={face} lamp={lampOn && k.i === 0}
              gaze={[-4, 3]}
              arms={climb > 0.05 && climb < 0.95
                ? [[[-62, -140], [-100, -200], [-80, -270]], [[62, -140], [90, -90], [70, -40]]]
                : k.i === 0 && lampOn
                  ? [[[-62, -140], [-110, -170], [-150, -210]], [[62, -140], [80, -96], [66, -60]]]
                  : [[[-62, -140], [-110, -120 + Math.sin(f / 2 + k.i) * 20], [-140, -170]], [[62, -140], [110, -120], [140, -170 + Math.cos(f / 2) * 20]]]} />
          );
        })}
        {/* 先頭のヘルメットのライト (頭の中を照らす) */}
        {lampOn && (
          <polygon points={`${kob[0].x - 4},${kob[0].y - 55} ${kob[0].x - 80},${kob[0].y + 10} ${kob[0].x - 34},${kob[0].y + 40}`}
            fill={C.lampYellow} opacity={0.35 + 0.08 * Math.sin(f / 4)} />
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #17 第1章、体の中の、ちょっと遅い時計。
// 格: 山 / seed 6017
// 絵: 章扉。どこ: 「あなた」の体の中。柔らかいピンクの壁の長い廊下、天井に管が何本も通り、ところどころに丸いランプ。廊下の突き当たりに、少しだけ開いた小さな木の扉があり、すき間から黄色い光と「チク、タク」の音の線が漏れている。演出: 画面左寄りで Kobito が3人、ヘルメットのライトを点けて一列でその扉へ歩いていく (先頭はランタンを掲げる)。ChapterDoor num=1 title="体の中の、ちょっと遅い時計。" を画面の右寄りに置く。動き: f0-120 カメラが廊下の奥へゆっくり進む / 管の中を泡が流れる / 扉のすき間の光が音に合わせて明滅 / Kobito の足取り
// どこ: 「あなた」の体の中の長い廊下。柔らかいピンクの肉の壁が輪のひだになって奥へ続き (消失点は左寄り 560,470)、天井に太い管が何本も奥へ走り、輪ごとに丸いランプ。突き当たりに少しだけ開いた小さな木の扉、すき間から黄色い光が床へこぼれ、「チク」「タク」と音の線が交互に漏れる
// 演出: 画面左寄りで Kobito が3人、背中を見せて一列で扉へ歩いていく (ヘルメットのライトの光の筋が前へ伸びる。先頭はランタンを掲げる)。右寄りに章の題字 ChapterDoor (第1章) をクリームの帯の上に
// 動き: f0-116 カメラが廊下の奥へゆっくり進む (輪のひだが手前へ流れてくる) / 管の中を泡が奥へ流れる / 扉の光が15コマごとの「チク」「タク」に合わせて明滅 / 小人の足取り (上下のゆれ)
const Mz017: React.FC<{ f: number }> = ({ f }) => {
  const VP: Pt = [560, 470];
  const door = seg(f, 4, 20);
  const sc = 1 + 0.16 * easeInOut(seg(f, 0, 116));
  const N = 8;
  const rings = Array.from({ length: N }, (_, i) => ((i + f * 0.014) % N) / N).sort((a, b) => b - a);
  const tick = Math.floor(f / 15) % 2;
  const blink = 0.6 + 0.4 * Math.max(0, Math.cos(((f % 15) / 15) * Math.PI));
  const pipes = [[-200, 0.92], [260, 0.78], [760, 0.84], [1300, 0.7], [1900, 0.95]] as const;
  return (
    <Frame f={f} seed={6017}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={1} title="体の中の、ちょっと遅い時計。" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(${VP[0]} ${VP[1]}) scale(${sc}) translate(${-VP[0]} ${-VP[1]})`}>
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.pinkLight} />
        {/* 輪のひだ (奥ほど暗い) */}
        {rings.map((u, i) => {
          const k = 0.07 + 1.55 * u * u;
          const hw = 900 * k, hh = 560 * k;
          const col = mixHex(C.pinkDeep, C.pinkLight, Math.pow(u, 0.7));
          return (
            <g key={i}>
              <rect x={VP[0] - hw} y={VP[1] - hh} width={hw * 2} height={hh * 2} rx={260 * k} fill={col}
                stroke={mixHex(C.pinkDeep, C.pinkDark, u)} strokeWidth={Math.max(2, 26 * k)} />
              <rect x={VP[0] - hw * 0.96} y={VP[1] - hh * 0.95} width={hw * 1.92} height={hh * 1.9} rx={250 * k} fill="none"
                stroke={C.pinkLight} strokeWidth={Math.max(1, 7 * k)} opacity={0.5} />
              {/* 丸いランプ (左右の壁の上) */}
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <circle cx={VP[0] + sd * hw * 0.82} cy={VP[1] - hh * 0.58} r={60 * k} fill={MP.glow} opacity={0.25} />
                  <circle cx={VP[0] + sd * hw * 0.82} cy={VP[1] - hh * 0.58} r={22 * k} fill={C.lampYellow} stroke={C.ink} strokeWidth={Math.max(1.5, 5 * k)} />
                </g>
              ))}
            </g>
          );
        })}
        {/* 床 (奥へ細くなる) */}
        <polygon points={`${VP[0] - 26},${VP[1] + 50} ${VP[0] + 26},${VP[1] + 50} ${2100},${1300} ${-900},${1300}`} fill={C.pinkFloor} opacity={0.45} />
        <path d={`M ${VP[0]} ${VP[1] + 50} L ${VP[0]} 1300`} stroke={C.pinkDeep} strokeWidth={6} opacity={0.3} strokeDasharray="30 30" />
        {/* 天井の管 (泡が奥へ流れる) */}
        {pipes.map(([x0, ty], i) => {
          const far: Pt = [VP[0] + (x0 - VP[0]) * 0.06, VP[1] - 40];
          const near: Pt = [x0, -200];
          const w0 = 70, w1 = 5;
          const nx = -(far[1] - near[1]), ny = far[0] - near[0];
          const nl = Math.hypot(nx, ny);
          const ox = nx / nl, oy = ny / nl;
          return (
            <g key={i}>
              <polygon points={`${near[0] + ox * w0},${near[1] + oy * w0} ${far[0] + ox * w1},${far[1] + oy * w1} ${far[0] - ox * w1},${far[1] - oy * w1} ${near[0] - ox * w0},${near[1] - oy * w0}`}
                fill={C.tube} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              <line x1={near[0] + ox * w0 * 0.5} y1={near[1] + oy * w0 * 0.5} x2={far[0]} y2={far[1]} stroke={C.tubeLight} strokeWidth={8} opacity={0.7} />
              {Array.from({ length: 5 }, (_, j) => {
                const t = ((j / 5 + f * 0.009 + i * 0.13) % 1);
                const tt = Math.pow(t, 0.6);
                return <circle key={j} cx={lerp(near[0], far[0], tt)} cy={lerp(near[1], far[1], tt)} r={Math.max(1.5, 22 * (1 - tt) * ty)}
                  fill={C.bubble} stroke={C.ink} strokeWidth={Math.max(1, 3 * (1 - tt))} opacity={0.9} />;
              })}
            </g>
          );
        })}
        {/* 突き当たりの小さな木の扉 (少しだけ開いて光が漏れる) */}
        <g>
          <polygon points={`${VP[0] + 22},${VP[1] + 52} ${VP[0] + 36},${VP[1] + 52} ${VP[0] + 360},${1300} ${VP[0] + 120},${1300}`} fill={MP.glow} opacity={0.32 * blink} />
          <path d={`M ${VP[0] - 40} ${VP[1] + 54} L ${VP[0] - 40} ${VP[1] - 40} A 40 32 0 0 1 ${VP[0] + 40} ${VP[1] - 40} L ${VP[0] + 40} ${VP[1] + 54} Z`} fill={MP.woodDark} stroke={C.ink} strokeWidth={4} />
          <path d={`M ${VP[0] + 18} ${VP[1] + 52} L ${VP[0] + 18} ${VP[1] - 46} L ${VP[0] + 36} ${VP[1] - 38} L ${VP[0] + 36} ${VP[1] + 52} Z`} fill="#FFE27A" opacity={blink} />
          <path d={`M ${VP[0] - 34} ${VP[1] + 52} L ${VP[0] - 34} ${VP[1] - 38} A 30 26 0 0 1 ${VP[0] + 18} ${VP[1] - 46} L ${VP[0] + 18} ${VP[1] + 52} Z`} fill={MP.wood} stroke={C.ink} strokeWidth={3.5} />
          <path d={`M ${VP[0] - 26} ${VP[1] - 10} L ${VP[0] + 10} ${VP[1] - 10} M ${VP[0] - 26} ${VP[1] + 26} L ${VP[0] + 10} ${VP[1] + 26}`} stroke={MP.woodDark} strokeWidth={3} />
          <circle cx={VP[0] + 10} cy={VP[1] + 10} r={4} fill={MP.brass} stroke={C.ink} strokeWidth={1.5} />
          <circle cx={VP[0] + 30} cy={VP[1]} r={60} fill={MP.glow} opacity={0.3 * blink} />
          {/* 音の線と「チク」「タク」 */}
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${VP[0] + 56 + k * 16} ${VP[1] - 30 - k * 6} q 12 30 0 60`} stroke="#F2B13C" strokeWidth={4} fill="none" strokeLinecap="round" opacity={blink * (1 - k * 0.25)} />
          ))}
          <text x={VP[0] + 126} y={VP[1] - 46 + tick * 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
            fill="#FFE27A" stroke={C.ink} strokeWidth={4} paintOrder="stroke" opacity={blink}>{tick ? "タク" : "チク"}</text>
        </g>
        {/* 小人3人 (背中。ライトの光の筋が扉へ伸びる) */}
        {([[330, 862, 0.55, 0], [434, 762, 0.43, 1], [506, 682, 0.34, 2]] as const).map(([kx, ky, ks, ph]) => (
          <polygon key={`b${ph}`} points={`${kx - 8 * ks},${ky - 276 * ks} ${kx + 8 * ks},${ky - 276 * ks} ${VP[0] + 30},${VP[1] + 40} ${VP[0] - 10},${VP[1] + 20}`}
            fill={C.lampYellow} opacity={0.16} />
        ))}
        <MzAbKobitoBack x={330} y={862} s={0.55} f={f} phase={0} />
        <MzAbKobitoBack x={434} y={762} s={0.43} f={f} phase={1} />
        <MzAbKobitoBack x={506} y={682} s={0.34} f={f} phase={2} lantern />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #18 あなたの体の中には、時計があります。
// 格: 山 / seed 6018
// 絵: どこ: #17 の扉の向こう、脳の奥の小部屋 (丸天井・ピンクの壁・歯車の音が響く)。演出: Kobito が扉を両手で押し開けると、部屋の真ん中に TainaiDokei (lag=0, reset=0, x=0.5, y=0.52, s=1.6) がどーんと現れる。24時間の文字盤・1本の針・1周した先の赤い「はみ出し」区画。文字盤の下の窓から、中で Kobito が2人、大きな歯車を足で踏んで回しているのが見える。先頭の Kobito は「じゃーん」と両手を広げて紹介 (face="smile")。時計は画面の短辺の 2/3 を占める大きさ。腕は2本 (pose="cheer")。動き: f0-30 扉が開く (光があふれる) / f30-60 カメラが引いて時計の全体が入る→すぐ寄る / f60-150 針がゆっくり進む・歯車が回る・中の Kobito の足踏み
// どこ: #17 の扉の向こう、脳の奥の小部屋。ピンクの丸天井 (肋骨のような梁・天井から時計へ降りる2本の管)、しわのある柔らかい壁、左右の丸いランプ、楕円の床。左に今くぐってきた小さな木の扉 (開いている)
// 演出: 扉が開いて光があふれると、部屋の真ん中に TainaiDokei (lag=0, x=960, y=562, s=1.6) がどーん。文字盤の下ののぞき窓の中で、小人が2人で歯車を回す (部品の小人+もう1人が歯車を踏んで足踏み)。先頭の Kobito が扉の前で両手を大きく広げて「じゃーん」と紹介 (face="smile")、扉のかげから後ろの2人が驚いてのぞく
// 動き: f0-22 手前の扉が左右に開き光があふれる (f10-34 光が引く) / カメラ: 寄り(1.25)→f30で引き(0.98)→ゆっくり寄る / 針がゆっくり進む・歯車が回る・中の小人の足踏み / 時計の左右で「カチコチ」の音の線 / 先頭の小人が弾む
const Mz018: React.FC<{ f: number }> = ({ f }) => {
  const open = easeInOut(seg(f, 0, 22));
  const flash = 1 - seg(f, 10, 34);
  const sc = f < 30 ? lerp(1.25, 0.98, easeInOut(seg(f, 0, 30))) : lerp(0.98, 1.06, easeInOut(seg(f, 30, 98)));
  const ta = pop(seg(f, 18, 32));
  const hop = Math.abs(Math.sin(f / 7)) * 8 * clamp01(seg(f, 24, 34));
  const tickSide = Math.floor(f / 12) % 2;
  const leaf = (
    <g>
      <rect x={0} y={-40} width={962} height={1160} fill={MP.wood} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={i * 192} y1={-40} x2={i * 192} y2={1120} stroke={MP.woodDark} strokeWidth={6} />)}
      <rect x={120} y={140} width={700} height={320} rx={20} fill="none" stroke={MP.woodDark} strokeWidth={8} />
      <rect x={120} y={600} width={700} height={360} rx={20} fill="none" stroke={MP.woodDark} strokeWidth={8} />
      <circle cx={890} cy={540} r={26} fill={MP.brass} stroke={C.ink} strokeWidth={5} />
    </g>
  );
  return (
    <Frame f={f} seed={6018}>
      <g transform={`translate(960 540) scale(${sc}) translate(-960 -540)`}>
        {/* 壁 */}
        <rect x={-200} y={-200} width={2320} height={1480} fill={C.pink} />
        <MzAbGyri x={-120} y={260} w={2200} h={600} seed={18} />
        {/* 丸天井と梁 */}
        <path d="M -200 330 Q 960 -260 2120 330 L 2120 -200 L -200 -200 Z" fill={C.pinkDark} />
        <path d="M -200 330 Q 960 -260 2120 330" stroke={C.ink} strokeWidth={7} fill="none" />
        {[-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((k, i) => (
          <path key={i} d={`M ${960 + k * 1180} ${330 - (1 - k * k) * 420} Q ${960 + k * 500} ${-60} 960 -200`} stroke={C.pinkDeep} strokeWidth={14} fill="none" opacity={0.6} />
        ))}
        {/* 天井から時計へ降りる2本の管 */}
        {[[-1, 760], [1, 1160]].map(([sd, x0]) => (
          <g key={sd}>
            <path d={`M ${x0} -200 Q ${x0} 60 ${960 + sd * 30} 120`} stroke={C.ink} strokeWidth={42} fill="none" />
            <path d={`M ${x0} -200 Q ${x0} 60 ${960 + sd * 30} 120`} stroke={C.tube} strokeWidth={32} fill="none" />
            <path d={`M ${x0 - 8} -200 Q ${x0 - 8} 56 ${952 + sd * 30} 116`} stroke={C.tubeLight} strokeWidth={8} fill="none" opacity={0.8} />
            {[0, 1, 2].map((j) => {
              const t = ((f / 40 + j / 3) % 1);
              const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x0 + t * t * (960 + sd * 30);
              const by = (1 - t) * (1 - t) * -200 + 2 * (1 - t) * t * 60 + t * t * 120;
              return <circle key={j} cx={bx} cy={by} r={8} fill={C.bubble} stroke={C.ink} strokeWidth={2.5} />;
            })}
          </g>
        ))}
        <rect x={900} y={112} width={120} height={44} rx={12} fill={MP.brassDark} stroke={C.ink} strokeWidth={5} />
        {/* ランプ */}
        {[250, 1670].map((lx) => (
          <g key={lx}>
            <circle cx={lx} cy={400} r={110} fill={MP.glow} opacity={0.22} />
            <line x1={lx} y1={300} x2={lx} y2={360} stroke={C.ink} strokeWidth={5} />
            <circle cx={lx} cy={400} r={40} fill={C.lampYellow} stroke={C.ink} strokeWidth={6} />
            <path d={`M ${lx - 20} ${388} a 22 22 0 0 1 20 -14`} stroke={KRP.white} strokeWidth={5} fill="none" />
          </g>
        ))}
        {/* 床 */}
        <ellipse cx={960} cy={1020} rx={1240} ry={250} fill={C.pinkFloor} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={900} rx={420} ry={40} fill={C.pinkDeep} opacity={0.35} />
        {/* 左の扉 (くぐってきた扉。開いている) */}
        <g>
          <path d="M 40 880 L 40 560 A 110 110 0 0 1 260 560 L 260 880 Z" fill="#FFE9A8" stroke={C.ink} strokeWidth={7} />
          <path d="M 40 880 L 40 560 A 110 110 0 0 1 260 560 L 260 880" fill="none" stroke={MP.woodDark} strokeWidth={14} />
          <path d="M 40 880 L 40 556 L -30 520 L -30 920 Z" fill={MP.wood} stroke={C.ink} strokeWidth={6} />
          <circle cx={-8} cy={720} r={9} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 扉のかげからのぞく2人 */}
        <Kobito x={200} y={880} s={0.44} f={f} face="surprised" gaze={[6, -2]} lean={8} phase={1} />
        <Kobito x={116} y={872} s={0.4} f={f} face="surprised" gaze={[6, -4]} lean={14} phase={2} />
        {/* 体内時計 */}
        <TainaiDokei x={960} y={562} s={1.6} f={f} lag={0} reset={0} />
        {/* のぞき窓の中のもう1人 (歯車を踏んで足踏み) */}
        <Kobito x={1046} y={776} s={0.24} f={f} pose="hold" face="joy" lean={Math.sin(f / 4) * 8} phase={3} />
        {/* カチコチ (歯車の音) */}
        {[-1, 1].map((sd) => (
          <g key={sd} opacity={sd === (tickSide ? 1 : -1) ? 1 : 0.35}>
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${960 + sd * (430 + k * 26)} ${480 - k * 10} q ${sd * 18} 70 0 140`} stroke={C.pinkDeep} strokeWidth={8} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ))}
        {/* 先頭の小人「じゃーん」 */}
        <g transform={`translate(330 ${870 - hop}) scale(${0.62 * (0.9 + 0.1 * ta)}) translate(-330 -870)`}>
          <MzAbKobitoBare x={330} y={870} s={1} f={f} face="smile" gaze={[6, -2]} lamp
            arms={[[[-62, -140], [-118, -192], [-168, -250]], [[62, -140], [118, -192], [168, -250]]]}
            front={<g>
              {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
                <line key={`${sd}${k}`} x1={sd * 200} y1={-270 + k * 30} x2={sd * 236} y2={-286 + k * 36} stroke={MP.brass} strokeWidth={8} strokeLinecap="round" opacity={ta} />
              )))}
            </g>} />
        </g>
      </g>
      {/* 手前の扉 (左右に開く) と あふれる光 */}
      {flash > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#FFF6D0" opacity={0.75 * flash * flash} />}
      {open < 0.995 && (
        <g>
          <g transform={`scale(${1 - open} 1)`}>{leaf}</g>
          <g transform={`translate(1920 0) scale(${-(1 - open)} 1)`}>{leaf}</g>
          <rect x={960 - open * 960 - 6} y={0} width={open * 1920 + 12} height={1080} fill="#FFF1B8" opacity={0.4 * (1 - open)} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #19 脳の奥にある、小さな時計です。
// 格: 図 / seed 6019
// 絵: どこ: 体の中の廊下の壁に貼られた「館内案内図」(デパートの案内板の形。木の枠・ガラス・角の画びょう)。案内図には頭の断面がやさしい線で描かれ、目・耳・鼻の位置が小さな絵で示される。演出: Kobito が指し棒で案内図の頭の真ん中の奥をトントンと叩く。そこに赤い「現在地」のピンが刺さっていて点滅。カメラが案内図の頭の全体から、ピンの位置へぐっと寄っていくと、ピンのところに小さな TainaiDokei (s=0.5) の絵が描かれている。札は「目」「耳」と「現在地」だけ。腕は2本 (Kobito pose="point" で指し棒)。動き: f0-30 案内図の全体 / f30-60 指し棒でトントン / f60-130 ピンへ寄る (scale 1→2.5) / ピンの点滅
// どこ: 体の中の廊下の壁 (ピンクのタイル壁・上に管・下に幅木と床) に掛かった「館内案内図」。デパートの案内板の形 (木の枠・ガラス・四隅の画びょう・上の飾り帯)。中の紙に横向きの頭の断面がやさしい線で描かれ、脳・目・耳・鼻と口の位置が小さな絵で示される
// 演出: Kobito が左下から長い指し棒で、頭の真ん中の奥をトントン。そこに赤い「現在地」のピンが刺さって点滅し、ピンの下に小さな TainaiDokei (s=0.5) の絵。札は「目」「耳」「現在地」だけ
// 動き: f0-20 案内図の全体 / f20-44 指し棒でトントン (12コマに1回) / f46-88 カメラがピンへぐっと寄る (1→2.3) / ピンの点滅 / 管の泡
const Mz019: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 46, 88));
  const PIN: Pt = [990, 300];
  const tap = f >= 20 ? Math.max(0, Math.sin(((f - 20) / 12) * Math.PI * 2)) : 0;
  const blinkOn = Math.floor(f / 8) % 2 === 0;
  const KX = 214, KY = 932, KS = 0.7;
  const handL: Pt = [110, -236];
  const handG: Pt = [KX + handL[0] * KS, KY + handL[1] * KS];
  const tgt: Pt = [PIN[0] - 18, PIN[1] + 44];
  const dir = [tgt[0] - handG[0], tgt[1] - handG[1]];
  const dl = Math.hypot(dir[0], dir[1]);
  const tip: Pt = [tgt[0] - (dir[0] / dl) * 22 * tap, tgt[1] - (dir[1] / dl) * 22 * tap];
  const head = "M 640 760 C 612 680 566 600 574 470 C 584 300 720 180 890 176 C 1068 174 1196 270 1214 404 L 1226 446 C 1232 462 1228 474 1222 484 L 1262 548 C 1268 560 1258 570 1244 572 L 1238 592 C 1248 602 1244 614 1234 618 C 1242 632 1238 650 1222 664 C 1190 686 1130 690 1086 682 L 1070 760 Z";
  return (
    <Frame f={f} seed={6019}>
      <g transform={`translate(960 540) scale(${lerp(1, 2.3, z)}) translate(${-lerp(960, 990, z)} ${-lerp(540, 380, z)})`}>
        {/* ピンクのタイル壁 */}
        <rect x={-100} y={-100} width={2120} height={1000} fill={C.pink} />
        <g stroke={C.pinkDark} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 12 }, (_, j) => <line key={`h${j}`} x1={-100} y1={-40 + j * 90} x2={2020} y2={-40 + j * 90} />)}
          {Array.from({ length: 12 }, (_, j) => Array.from({ length: 22 }, (_, i) => (
            <line key={`v${j}-${i}`} x1={-60 + i * 100 + (j % 2) * 50} y1={-40 + j * 90} x2={-60 + i * 100 + (j % 2) * 50} y2={50 + j * 90} />
          )))}
        </g>
        {/* 天井の管 */}
        <rect x={-100} y={18} width={2120} height={40} rx={20} fill={C.tube} stroke={C.ink} strokeWidth={5} />
        <rect x={-100} y={26} width={2120} height={8} fill={C.tubeLight} opacity={0.8} />
        {[0, 1, 2, 3, 4].map((j) => <circle key={j} cx={((f * 3 + j * 420) % 2200) - 100} cy={38} r={9} fill={C.bubble} stroke={C.ink} strokeWidth={2.5} />)}
        {/* 幅木と床 */}
        <rect x={-100} y={880} width={2120} height={30} fill={C.pinkDeep} stroke={C.ink} strokeWidth={5} />
        <rect x={-100} y={910} width={2120} height={300} fill={C.pinkFloor} />
        {/* 案内板 (木の枠・飾り帯) */}
        <rect x={290} y={80} width={1340} height={730} rx={14} fill={MP.wood} stroke={C.ink} strokeWidth={8} />
        <rect x={300} y={90} width={1320} height={30} fill={MP.woodDark} />
        {[360, 500, 640, 780, 920, 1060, 1200, 1340, 1480].map((sx) => <circle key={sx} cx={sx} cy={105} r={7} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />)}
        <rect x={326} y={134} width={1268} height={646} fill="#F8F2E2" stroke={C.ink} strokeWidth={5} />
        {/* 頭の断面 */}
        <path d={head} fill={C.skin} stroke={C.pinkDeep} strokeWidth={7} strokeLinejoin="round" />
        {/* 脳 */}
        <path d="M 640 372 C 630 260 760 200 880 206 C 1010 204 1130 262 1144 360 C 1150 420 1100 440 1040 438 C 980 470 900 470 840 452 C 760 470 650 450 640 372 Z" fill={C.pinkLight} stroke={C.pinkDeep} strokeWidth={5} />
        <g stroke={C.pinkDark} strokeWidth={4} fill="none" strokeLinecap="round">
          <path d="M 700 300 q 30 -30 60 0 t 60 0 M 860 260 q 30 -30 60 0 t 60 0 M 960 320 q 30 -30 60 0 t 50 0 M 690 380 q 30 -24 60 0 t 60 0 M 1040 280 q 24 -20 44 4" />
        </g>
        {/* 目 */}
        <g>
          <path d="M 1140 450 Q 1170 428 1204 448 Q 1170 468 1140 450 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <circle cx={1176} cy={449} r={9} fill="#5E7A9C" stroke={C.ink} strokeWidth={2.5} />
          <circle cx={1178} cy={447} r={3} fill={C.ink} />
          <path d="M 1140 436 Q 1172 420 1206 434" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        {/* 目から奥への細い道 (視神経) */}
        <path d="M 1140 452 Q 1080 470 1030 470" stroke={C.pinkDeep} strokeWidth={5} fill="none" strokeDasharray="8 8" />
        {/* 耳 */}
        <path d="M 790 452 C 760 440 750 500 770 540 C 784 566 812 560 808 534 C 806 512 794 506 800 486" fill={C.skin} stroke={C.pinkDeep} strokeWidth={6} strokeLinecap="round" />
        {/* 鼻の穴と口 */}
        <path d="M 1228 566 q 8 4 14 0" stroke={C.pinkDeep} strokeWidth={4} fill="none" />
        <path d="M 1196 612 Q 1214 620 1232 616" stroke={C.pinkDeep} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* 札 (目・耳) */}
        <line x1={1214} y1={446} x2={1330} y2={446} stroke={C.ink} strokeWidth={3.5} strokeDasharray="6 6" />
        <TagPlate x={1380} y={472} text="目" size={34} t={seg(f, 2, 12)} />
        <line x1={760} y1={500} x2={570} y2={500} stroke={C.ink} strokeWidth={3.5} strokeDasharray="6 6" />
        <TagPlate x={520} y={472} text="耳" size={34} t={seg(f, 4, 14)} />
        {/* 小さな体内時計の絵 (脳の奥) */}
        <TainaiDokei x={990} y={470} s={0.5} f={f} lag={0} label={false} />
        {/* 現在地のピン (点滅) */}
        <g>
          <circle cx={PIN[0]} cy={PIN[1]} r={40 + (blinkOn ? 10 : 0)} fill={KRP.red} opacity={blinkOn ? 0.25 : 0.1} />
          <line x1={PIN[0]} y1={PIN[1] + 20} x2={PIN[0]} y2={PIN[1] + 52} stroke={MP.iron} strokeWidth={6} strokeLinecap="round" />
          <path d={`M ${PIN[0]} ${PIN[1] + 34} C ${PIN[0] - 34} ${PIN[1]} ${PIN[0] - 30} ${PIN[1] - 34} ${PIN[0]} ${PIN[1] - 34} C ${PIN[0] + 30} ${PIN[1] - 34} ${PIN[0] + 34} ${PIN[1]} ${PIN[0]} ${PIN[1] + 34} Z`}
            fill={blinkOn ? "#E8453A" : "#B83A30"} stroke={C.ink} strokeWidth={5} />
          <circle cx={PIN[0]} cy={PIN[1] - 6} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        </g>
        <TagPlate x={990} y={222} text="現在地" size={32} t={seg(f, 6, 16)} />
        {/* ガラスのつや */}
        <polygon points="340,134 520,134 340,420" fill={KRP.white} opacity={0.22} />
        <polygon points="1380,780 1594,500 1594,640 1500,780" fill={KRP.white} opacity={0.16} />
        {/* 四隅の画びょう */}
        {[[344, 152, KRP.red], [1576, 152, KRP.blue], [344, 762, KRP.blue], [1576, 762, KRP.red]].map(([px, py, c], i) => (
          <g key={i}>
            <circle cx={px as number} cy={py as number} r={14} fill={c as string} stroke={C.ink} strokeWidth={4} />
            <circle cx={(px as number) - 4} cy={(py as number) - 4} r={4} fill={KRP.white} opacity={0.7} />
          </g>
        ))}
        {/* 指し棒 */}
        <line x1={handG[0] - (dir[0] / dl) * 40} y1={handG[1] - (dir[1] / dl) * 40} x2={tip[0]} y2={tip[1]} stroke={C.ink} strokeWidth={13} strokeLinecap="round" />
        <line x1={handG[0] - (dir[0] / dl) * 40} y1={handG[1] - (dir[1] / dl) * 40} x2={tip[0]} y2={tip[1]} stroke={MP.woodLight} strokeWidth={7} strokeLinecap="round" />
        <circle cx={tip[0]} cy={tip[1]} r={8} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
        {tap > 0.8 && [-40, 0, 40].map((a) => (
          <line key={a} x1={tgt[0]} y1={tgt[1]} x2={tgt[0] + Math.cos(((a - 30) * Math.PI) / 180) * 30} y2={tgt[1] + Math.sin(((a - 30) * Math.PI) / 180) * 30}
            stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`translate(${-Math.cos(((a - 30) * Math.PI) / 180) * 30 - 10} ${-Math.sin(((a - 30) * Math.PI) / 180) * 30 + 10})`} />
        ))}
        {/* 小人 (指し棒を両手で持つ) */}
        <MzAbKobitoBare x={KX} y={KY} s={KS} f={f} face="smile" gaze={[6, -6]} lean={-4}
          arms={[[[-62, -140], [-100, -100], [-64, -74]], [[62, -140], [100, -196], handL]]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #20 ただ、この時計、少しだけ遅れます。
// 格: 並 / seed 6020
// 絵: どこ: 脳の奥の小部屋の TainaiDokei (lag=0→0.35, reset=0, s=1.5)。部屋の壁に、外の寝室の時計を映す丸い小窓がある。演出: Kobito が1人、自分の腕時計と壁の小窓の時計を見比べながら、TainaiDokei の針を見守っている。針が1周の「0時」の線に届くと、外の時計はもう次へ進んでいるのに、こちらの針は止まらずに、赤い「はみ出し」区画へ少しだけ入り込む。Kobito が「あれ?」と首をかしげ (face="worried")、腕時計を耳に当てて振る。腕は2本 (pose="wrist")。動き: f0-90 針が進んで0時の線に近づく / f90-130 赤い区画へはみ出す / f100 外の時計が先に進む / f110-150 首をかしげて腕時計を振る / カメラは文字盤の「0時」付近へ寄る
// どこ: 脳の奥の小部屋 (#18 と同じピンクのしわの壁・ランプ・床)。右に TainaiDokei (s=1.5)、左上の壁に真鍮の丸い小窓があり、外の寝室の壁時計 (Shinshitsu と同じ木の丸時計・縦じまの壁紙) が見える
// 演出: Kobito が1人、左腕の腕時計と小窓の時計と体内時計を見比べている。体内時計の針が「24」の線に届いたとき、小窓の外の時計はもう0時を過ぎて先へ進んでいる。こちらの針は止まらず、赤い「はみ出し」区画へ少しだけ入り込んで赤くなる。Kobito が首をかしげ (worried)、腕時計を耳に当てて振る。頭の上に「?」
// 動き: f0-26 針が0時の線に近づく (外の時計は11時56分→) / f26-40 赤い区画へはみ出す (lag 0→0.35) / f8-40 外の時計が0時11分へ / f34〜 首をかしげて腕時計を耳で振る / カメラが文字盤の「0時」付近へ寄る
const Mz020: React.FC<{ f: number }> = ({ f }) => {
  const lag = 0.35 * easeOut(seg(f, 8, 30));
  const lagDeg = 50 * lag;
  const deg = f < 26 ? lerp(318, 360, easeOut(seg(f, 0, 26)) * 0.4 + seg(f, 0, 26) * 0.6) : lerp(360, 374, easeOut(seg(f, 26, 40))) + Math.max(0, f - 40) * 0.03;
  const hand = Math.min(deg / (360 + lagDeg), 1);
  const outMin = lerp(-4, 11, seg(f, 4, 40)) + Math.max(0, f - 40) * 0.04;
  const tilted = f >= 34;
  const shake = tilted ? Math.sin(f * 1.7) * 7 : 0;
  const sc = 1 + 0.1 * easeInOut(seg(f, 0, 70));
  const PC: Pt = [360, 300];
  const winClip = useMzAbId("mz20win");
  const look = Math.floor(f / 10) % 3;
  return (
    <Frame f={f} seed={6020}>
      <g transform={`translate(1080 420) scale(${sc}) translate(-1080 -420)`}>
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.pink} />
        <MzAbGyri x={-60} y={60} w={2100} h={820} seed={20} />
        <path d="M -100 120 Q 960 -120 2020 120 L 2020 -100 L -100 -100 Z" fill={C.pinkDark} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={1040} rx={1300} ry={190} fill={C.pinkFloor} stroke={C.ink} strokeWidth={6} />
        {/* ランプ */}
        <circle cx={1760} cy={330} r={100} fill={MP.glow} opacity={0.2} />
        <circle cx={1760} cy={330} r={36} fill={C.lampYellow} stroke={C.ink} strokeWidth={6} />
        {/* 外を映す丸い小窓 */}
        <g>
          <circle cx={PC[0]} cy={PC[1]} r={156} fill={MP.brass} stroke={C.ink} strokeWidth={8} />
          <circle cx={PC[0]} cy={PC[1]} r={144} fill="none" stroke={MP.brassLight} strokeWidth={5} opacity={0.7} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <circle key={i} cx={PC[0] + Math.sin(a) * 142} cy={PC[1] - Math.cos(a) * 142} r={6} fill={MP.brassDark} stroke={C.ink} strokeWidth={2.5} />;
          })}
          <defs><clipPath id={winClip}><circle cx={PC[0]} cy={PC[1]} r={126} /></clipPath></defs>
          <g clipPath={`url(#${winClip})`}>
            <rect x={PC[0] - 130} y={PC[1] - 130} width={260} height={260} fill="#E9DAC2" />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={PC[0] - 126 + i * 52} y={PC[1] - 130} width={12} height={260} fill="#DCC8AA" />)}
            {/* 寝室の壁時計 (木の丸時計) */}
            <g transform={`translate(${PC[0]} ${PC[1] + 6})`}>
              <circle r={92} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
              <circle r={76} fill="#FBF6EA" stroke={C.ink} strokeWidth={4} />
              {Array.from({ length: 12 }, (_, i) => (
                <line key={i} x1={0} y1={-66} x2={0} y2={i % 3 === 0 ? -54 : -60} stroke={C.ink} strokeWidth={i % 3 === 0 ? 5 : 3} transform={`rotate(${i * 30})`} />
              ))}
              <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.ink}>12</text>
              <line x1={0} y1={0} x2={0} y2={-38} stroke={C.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${outMin * 0.5})`} />
              <line x1={0} y1={0} x2={0} y2={-60} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${outMin * 6})`} />
              <line x1={0} y1={10} x2={0} y2={-62} stroke={MP.bell} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
              <circle r={7} fill={MP.brass} stroke={C.ink} strokeWidth={2.5} />
            </g>
          </g>
          <path d={`M ${PC[0] - 96} ${PC[1] - 40} A 104 104 0 0 1 ${PC[0] - 40} ${PC[1] - 96}`} stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.5} />
        </g>
        {/* 体内時計 */}
        <TainaiDokei x={1080} y={600} s={1.5} f={f} lag={lag} reset={0} hand={hand} />
        {/* 0時の線を示す点線 */}
        <line x1={1080} y1={600 - 252} x2={1080} y2={600 - 380} stroke={C.ink} strokeWidth={4} strokeDasharray="8 8" opacity={0.6} />
        {/* 小人 (腕時計を見比べる → 耳に当てて振る) */}
        <MzAbKobitoBare x={540} y={884} s={0.6} f={f} face={tilted ? "worried" : "normal"} lean={tilted ? -10 : 0}
          gaze={tilted ? [-5, -2] : look === 0 ? [-6, -6] : look === 1 ? [6, -4] : [-3, 4]}
          arms={tilted
            ? [[[-62, -140], [-122, -186], [-74 + shake, -244]], [[62, -140], [74, -96], [66, -60]]]
            : [[[-62, -140], [-100, -110], [-40, -160]], [[62, -140], [74, -96], [66, -60]]]}
          front={(() => {
            const w: Pt = tilted ? [-90 + shake * 0.7, -222] : [-62, -144];
            return (
              <g transform={`translate(${w[0]} ${w[1]})`}>
                <rect x={-8} y={-16} width={16} height={32} rx={4} fill="#7A4A2E" stroke={C.ink} strokeWidth={3} />
                <circle r={14} fill={KRP.white} stroke={MP.brass} strokeWidth={5} />
                <circle r={14} fill="none" stroke={C.ink} strokeWidth={2} />
                <line x1={0} y1={0} x2={0} y2={-9} stroke={C.ink} strokeWidth={2.5} />
                <line x1={0} y1={0} x2={6} y2={2} stroke={C.ink} strokeWidth={2.5} />
                {tilted && <path d="M -26 -18 q -10 18 0 36 M 26 -18 q 10 18 0 36" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.7} />}
              </g>
            );
          })()} />
        <QMark x={600} y={648} s={0.6} f={f} t={seg(f, 34, 42)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #21 平均すると、1日が、24時間と11分。
// 格: 図 / seed 6021
// 絵: どこ: 脳の奥の小部屋の壁いっぱいの TainaiDokei (lag=1, reset=0, s=1.9。文字盤が画面の短辺いっぱい)。演出: 針が1周ぶんを早回しでぐるっと回る (外周に「24時間」の札)。0時の線を越えても止まらず、赤い「はみ出し」区画へ突入し、区画の端でガタン!と止まる (区画に「11分」の札)。針の先には Kobito がロープを結んで、止めようと引っぱっていたが、針に引きずられてずるずる床を滑り、区画の端で尻もち (face="surprised")。ヘルメットがころん。腕は2本 (pose="pull" で両手でロープ)。動き: f0-90 針が1周 (速く) / f90-120 赤い区画へ・Kobito が引きずられる / f120 ガタン (画面が小さく揺れる) / f125-150 尻もち・ヘルメット / カメラは赤い区画へ寄る
// どこ: 脳の奥の小部屋の壁いっぱいの TainaiDokei (lag=1, s=1.9。文字盤が画面の短辺いっぱい)。後ろはピンクのしわの壁と床。左に「24時間」の札と、外周をまわる点線の矢印。赤い区画には部品の「+11分」の札
// 演出: 針が早回しでぐるっと1周。0時の線を越えても止まらず赤い「はみ出し」区画へ突入し、区画の端でガタン!と止まる (画面が揺れる・衝撃の線)。赤い区画の上に立って針の先にロープを結び、踏んばって止めようとしていた Kobito が、ずるずる引きずられて (足元に砂ぼこり) 区画の端で尻もち (surprised)。ヘルメットがころんと転がり落ちる
// 動き: f0-28 針が1周 (速く) / f28-38 赤い区画へ・小人が引きずられる / f38 ガタン (f38-48 揺れ) / f38〜 尻もち・ヘルメットが弾んで転がる / カメラは赤い区画へ寄る
const Mz021: React.FC<{ f: number }> = ({ f }) => {
  const CX = 930, CY = 548, S = 1.9;
  const R = 180 * S, RO = 242 * S;
  const deg = f < 28 ? 360 * easeInOut(seg(f, 0, 28)) : f < 38 ? 360 + 50 * Math.pow(seg(f, 28, 38), 1.4) : 410;
  const hand = Math.min(deg / 410, 1);
  const jolt = f >= 38 ? Math.exp(-(f - 38) / 4) * Math.sin((f - 38) * 2.6) * 10 : 0;
  const sc = 1 + 0.1 * easeInOut(seg(f, 0, 60));
  const a = (deg * Math.PI) / 180;
  const tip: Pt = [CX + Math.sin(a) * R * 0.92, CY - Math.cos(a) * R * 0.92];
  const fell = f >= 38;
  const th = fell ? 38 : f < 28 ? 13 : lerp(13, 45, Math.pow(seg(f, 28, 38), 1.4));
  const tr = (th * Math.PI) / 180;
  const P: Pt = [CX + Math.sin(tr) * (RO + 2), CY - Math.cos(tr) * (RO + 2)];
  const KS = 0.42;
  const lean = th + 22 + (f < 28 ? Math.sin(f / 3) * 4 : 8);
  // 小人の手 (ロープを持つ) の位置: 体の座標 → 画面
  const toG = (lx: number, ly: number): Pt => {
    const L = (lean * Math.PI) / 180;
    return [P[0] + (lx * Math.cos(L) - ly * Math.sin(L)) * KS, P[1] + (lx * Math.sin(L) + ly * Math.cos(L)) * KS];
  };
  // ロープの向き (体の座標)
  const L = (lean * Math.PI) / 180;
  const dx = (tip[0] - P[0]) / KS, dy = (tip[1] - P[1]) / KS;
  const ldx = dx * Math.cos(-L) - dy * Math.sin(-L), ldy = dx * Math.sin(-L) + dy * Math.cos(-L);
  const ll = Math.hypot(ldx + 0, ldy + 150);
  const ux = ldx / ll, uy = (ldy + 150) / ll;
  const handA: Pt = [ux * 110, -150 + uy * 110];
  const handB: Pt = [ux * 150 + 6, -150 + uy * 150 + 4];
  const ropeFrom = toG(handB[0], handB[1]);
  const hFly = f - 38;
  const helmet: Pt = fell ? [P[0] + 40 + hFly * 7, Math.min(P[1] - 110 + hFly * hFly * 0.5 - hFly * 9, 1010)] : [0, 0];
  return (
    <Frame f={f} seed={6021}>
      <g transform={`translate(${jolt} ${jolt * 0.4}) translate(1150 290) scale(${sc}) translate(-1150 -290)`}>
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.pink} />
        <MzAbGyri x={-60} y={40} w={2100} h={900} seed={21} op={0.4} />
        <ellipse cx={960} cy={1060} rx={1300} ry={170} fill={C.pinkFloor} stroke={C.ink} strokeWidth={6} />
        {/* 外周の点線の矢印 (24時間でひと回り) */}
        <path d={`M ${CX + Math.sin((215 * Math.PI) / 180) * 420} ${CY - Math.cos((215 * Math.PI) / 180) * 420} A 420 420 0 0 1 ${CX + Math.sin((335 * Math.PI) / 180) * 420} ${CY - Math.cos((335 * Math.PI) / 180) * 420}`}
          stroke={C.ink} strokeWidth={7} fill="none" strokeDasharray="18 14" strokeLinecap="round" />
        <path d={`M ${CX + Math.sin((335 * Math.PI) / 180) * 420 - 26} ${CY - Math.cos((335 * Math.PI) / 180) * 420 + 2} l 28 -6 l -12 26`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <TagPlate x={240} y={325} text="24時間" size={40} t={seg(f, 2, 12)} />
        {/* 体内時計 */}
        <TainaiDokei x={CX} y={CY} s={S} f={f} lag={1} reset={0} hand={hand} label={false} />
        <path d="M 1488 300 Q 1420 250 1370 262" stroke={C.ink} strokeWidth={5} fill="none" strokeDasharray="8 8" />
        <TagPlate x={1580} y={325} text="11分" size={44} t={seg(f, 30, 38)} color={KRP.red} />
        {/* ロープ (針の先 → 小人の手) */}
        {!fell ? (
          <g>
            <line x1={tip[0]} y1={tip[1]} x2={ropeFrom[0]} y2={ropeFrom[1]} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
            <line x1={tip[0]} y1={tip[1]} x2={ropeFrom[0]} y2={ropeFrom[1]} stroke={C.rope} strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : (
          <path d={`M ${tip[0]} ${tip[1]} Q ${(tip[0] + P[0]) / 2} ${(tip[1] + P[1]) / 2 + 60} ${P[0] - 10} ${P[1] - 40}`} stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
        )}
        <circle cx={tip[0]} cy={tip[1]} r={9} fill={C.rope} stroke={C.ink} strokeWidth={3} />
        {/* 小人 */}
        {!fell ? (
          <g>
            <MzAbKobitoBare x={P[0]} y={P[1]} s={KS} f={f} face={f < 28 ? "angry" : "surprised"} lean={lean} gaze={[-6, 4]}
              arms={[[[-62, -140], [handA[0] - 20, handA[1] + 10], handB], [[62, -140], [handA[0] + 10, handA[1] - 10], [handB[0] - 14, handB[1] + 10]]]} />
            {/* ずるずる (砂ぼこり) */}
            {f >= 28 && [0, 1, 2].map((k) => {
              const t = ((f - 28) / 10 + k / 3) % 1;
              const back = tr - 0.06 - t * 0.08;
              return <circle key={k} cx={CX + Math.sin(back) * (RO + 14)} cy={CY - Math.cos(back) * (RO + 14)} r={10 + t * 16} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} opacity={(1 - t) * 0.8} />;
            })}
          </g>
        ) : (
          <g>
            <g transform={`rotate(${th} ${P[0]} ${P[1]})`}>
              <Person x={P[0]} y={P[1] + 58 * KS * 0.5} s={KS} f={f} pose="sit" face="surprised" hair="none" cloth={MP.kobitoCloth} clothDark={MP.kobitoClothDark} gaze={[5, -5]} />
            </g>
            {/* 尻もちの星 */}
            {[0, 1, 2].map((k) => {
              const aa = f / 5 + (k * Math.PI * 2) / 3;
              const hc = toG(0, -300);
              return <path key={k} transform={`translate(${hc[0] + Math.cos(aa) * 50} ${hc[1] + Math.sin(aa) * 14}) scale(0.8)`}
                d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={MP.glow} stroke={C.ink} strokeWidth={2.5} />;
            })}
            {/* ころんと転がるヘルメット */}
            <g transform={`translate(${helmet[0]} ${helmet[1]}) rotate(${hFly * 14}) scale(${KS})`}>
              <path d="M -68 30 Q -68 -36 0 -38 Q 68 -36 68 30 Z" fill={MP.kobitoHelmet} stroke={C.ink} strokeWidth={6} />
              <rect x={-80} y={20} width={160} height={16} rx={8} fill={MP.kobitoHelmet} stroke={C.ink} strokeWidth={5} />
              <rect x={-14} y={-10} width={28} height={20} rx={5} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            </g>
          </g>
        )}
        {/* ガタン! (衝撃の線) */}
        {fell && f < 52 && (
          <g opacity={1 - seg(f, 38, 52)}>
            {[-30, -10, 10, 30].map((d, k) => {
              const ea = ((50 + d * 0.4) * Math.PI) / 180;
              const r0 = RO + 40 + k * 4;
              return <line key={k} x1={CX + Math.sin(ea) * r0} y1={CY - Math.cos(ea) * r0} x2={CX + Math.sin(ea) * (r0 + 60)} y2={CY - Math.cos(ea) * (r0 + 60)}
                stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 早回しの残像 */}
        {f < 30 && [1, 2, 3].map((k) => {
          const pa = ((deg - k * 10) * Math.PI) / 180;
          return <line key={k} x1={CX} y1={CY} x2={CX + Math.sin(pa) * R * 0.85} y2={CY - Math.cos(pa) * R * 0.85} stroke={C.ink} strokeWidth={10} opacity={0.18 - k * 0.04} strokeLinecap="round" />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #22 放っておくと、1か月で、5時間以上ずれる計算です。
// 格: 図 / seed 6022
// 絵: どこ: 脳の奥の小部屋の壁。左に日めくりカレンダー (紙の束)、右に壁に描かれた24時間の帯 (朝・昼・夜の色の帯)。TainaiDokei (lag=1, s=0.8) は部屋の奥に小さく見える。演出: カレンダーが1枚ずつびりびりめくれるたびに (30枚)、天井の管から赤い積み木が1個ずつ落ちてきて床に積み上がる (1個=11分)。カメラは積み木の山を追って上へスクロール。山が「5時間以上」の高さの目盛り線に届くころには、24時間の帯の上で「朝」の印が夜の側へ5時間ずれている。Kobito は積み木の山をよじ登りながら汗だく (face="worried")、てっぺんで「30日」のカレンダーの最後の1枚が頭にぱさっと乗る。札は「30日」「5時間以上」。腕は2本 (pose="climb")。動き: f0-130 カレンダーがめくれ積み木が落ちる (30回、加速) / f40-150 カメラが上へスクロール / f140 最後の1枚が頭に乗る
// どこ: 脳の奥の小部屋の壁 (ピンクのしわの壁・天井の管)。左の壁の釘に日めくりカレンダー (紙の束)、右の壁に描いた縦の24時間の帯 (夜=紺・朝=橙・昼=水色・夕=橙・夜=紺。目盛り 0/6/12/18/24)。奥に小さく TainaiDokei (lag=1, s=0.8)。天井の管の口の下に赤い積み木の山
// 演出: カレンダーがびりっとめくれるたびに (30回、だんだん速く)、管の口から赤い積み木 (1個=11分) が1個ずつ落ちて2列に積み上がる。山が「5時間以上」の目盛り線に届くころ、24時間の帯の上で「朝」の太陽の印が、元の6時 (点線の印) から夜の側へ5時間以上ずれている。Kobito が汗だくで山の横をよじ登り、てっぺんで立ち上がると、最後の1枚「30」がひらひら飛んできて頭にぱさっと乗る
// 動き: f1-35 カレンダーがめくれて積み木が落ちる (30回・加速) / f0-40 カメラが山を追って上へスクロール / f36-50 最後の1枚が頭に乗る / そのあと汗・ページのゆれ・管の泡
const Mz022: React.FC<{ f: number }> = ({ f }) => {
  const N = 30;
  const tOf = (i: number) => 1 + 34 * Math.sqrt(i / (N - 1));
  const landed = Array.from({ length: N }, (_, i) => f >= tOf(i) + 4).filter(Boolean).length;
  const torn = Array.from({ length: N }, (_, i) => f >= tOf(i)).filter(Boolean).length;
  const scroll = 120 * easeInOut(seg(f, 0, 40));
  const FLOOR = 1000, BW = 88, BH = 44, BX = 820;
  const layers = Math.ceil(landed / 2);
  const topY = FLOOR - layers * BH;
  const LINE5 = FLOOR - 14 * BH;
  const bandY = (h: number) => 160 + h * 30;
  const sunH = 6 - 5.5 * (landed / N);
  const climbing = f < 38;
  const kX = climbing ? BX + 2 * 90 + 18 : BX + 90;
  const kY = climbing ? Math.min(FLOOR, topY + 70) : FLOOR - 15 * BH;
  const pageT = seg(f, 35, 44);
  const headTop: Pt = [BX + 90, FLOOR - 15 * BH - 292 * 0.45 + 4];
  const pageP: Pt = [lerp(330, headTop[0], easeInOut(pageT)), lerp(330, headTop[1], pageT) - Math.sin(pageT * Math.PI) * 120];
  const pageRot = lerp(-20, 4, pageT) + Math.sin(f / 4) * 14 * (1 - pageT);
  const day = Math.min(torn + 1, N);
  return (
    <Frame f={f} seed={6022}>
      <g transform={`translate(0 ${scroll})`}>
        <rect x={-100} y={-300} width={2120} height={1500} fill={C.pink} />
        <MzAbGyri x={-60} y={-200} w={2100} h={1150} seed={22} op={0.35} />
        <rect x={-100} y={-300} width={2120} height={250} fill={C.pinkDark} />
        <path d="M -100 -50 L 2020 -50" stroke={C.ink} strokeWidth={6} />
        <rect x={-100} y={FLOOR} width={2120} height={400} fill={C.pinkFloor} />
        <line x1={-100} y1={FLOOR} x2={2020} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
        {/* 天井の管と口 */}
        <path d="M -100 30 L 860 30 Q 910 30 910 80 L 910 112" stroke={C.ink} strokeWidth={70} fill="none" />
        <path d="M -100 30 L 860 30 Q 910 30 910 80 L 910 112" stroke={C.tube} strokeWidth={58} fill="none" />
        <path d="M -100 20 L 860 20" stroke={C.tubeLight} strokeWidth={10} opacity={0.8} />
        <rect x={862} y={104} width={96} height={30} rx={8} fill={C.pinkDeep} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((j) => <circle key={j} cx={((f * 9 + j * 300) % 960) - 100} cy={30} r={10} fill={C.bubble} stroke={C.ink} strokeWidth={2.5} />)}
        {/* 奥の小さな体内時計 */}
        <TainaiDokei x={1290} y={650} s={0.8} f={f} lag={1} label={false} hand={0.97} />
        {/* 日めくりカレンダー */}
        <g>
          <circle cx={330} cy={180} r={8} fill={MP.iron} stroke={C.ink} strokeWidth={3} />
          <path d="M 330 180 L 260 214 M 330 180 L 400 214" stroke={C.ink} strokeWidth={3} />
          <rect x={220} y={210} width={220} height={250} rx={6} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
          <rect x={232} y={214} width={196} height={30} fill="#B8403A" stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={236 + k * 2} y={250 + k * 2} width={190 - k * 4} height={196} fill={C.page} stroke={C.ink} strokeWidth={2} opacity={torn < N ? 1 : 0} />)}
          {torn < N ? (
            <g>
              <rect x={236} y={250} width={190} height={196} fill={C.page} stroke={C.ink} strokeWidth={3.5} />
              <text x={331} y={386} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={day % 7 === 0 ? KRP.red : C.ink}>{day}</text>
            </g>
          ) : (
            <rect x={236} y={250} width={190} height={196} fill="#B59A72" stroke={C.ink} strokeWidth={3.5} />
          )}
          {/* ちぎれて飛ぶページ */}
          {Array.from({ length: Math.min(torn, N - 1) }, (_, i) => i).filter((i) => f - tOf(i) < 9).map((i) => {
            const t = (f - tOf(i)) / 9;
            return (
              <g key={i} transform={`translate(${331 - t * 170} ${348 + t * t * 220}) rotate(${-t * 70 + (i % 2) * 20})`} opacity={1 - t}>
                <rect x={-95} y={-98} width={190} height={196} fill={C.page} stroke={C.ink} strokeWidth={3} />
                <text x={0} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={C.ink}>{i + 1}</text>
                <path d="M -95 -98 l 20 10 l 16 -8 l 20 10 l 18 -8 l 20 8 l 18 -8 l 20 10 l 18 -8 l 22 8" stroke={C.ink} strokeWidth={2} fill="none" />
              </g>
            );
          })}
        </g>
        <TagPlate x={330} y={540} text="30日" size={40} t={seg(f, 30, 38)} />
        {/* 24時間の帯 */}
        <g>
          {([[0, 5, MP.night], [5, 8, MP.dawn], [8, 17, MP.morning], [17, 19, MP.dawn], [19, 24, MP.night]] as const).map(([a, b, c]) => (
            <rect key={a} x={1600} y={bandY(a)} width={90} height={bandY(b) - bandY(a)} fill={c} />
          ))}
          <rect x={1600} y={bandY(0)} width={90} height={bandY(24) - bandY(0)} fill="none" stroke={C.ink} strokeWidth={6} />
          {[0, 6, 12, 18, 24].map((h) => (
            <g key={h}>
              <line x1={1580} y1={bandY(h)} x2={1600} y2={bandY(h)} stroke={C.ink} strokeWidth={4} />
              <text x={1570} y={bandY(h) + 11} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>{h}</text>
            </g>
          ))}
          {/* 元の朝 (6時) の点線の印 */}
          <circle cx={1736} cy={bandY(6)} r={26} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="6 6" />
          {/* ずれていく朝の印 (太陽) */}
          <g transform={`translate(1736 ${bandY(sunH)})`}>
            <path d="M -46 0 L -30 -12 L -30 12 Z" fill={C.ink} />
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={-32} x2={0} y2={-42} stroke="#F2B13C" strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45 + f * 2})`} />)}
            <circle r={26} fill="#FFD34D" stroke={C.ink} strokeWidth={5} />
          </g>
          {landed > 4 && <path d={`M 1790 ${bandY(6)} Q 1830 ${(bandY(6) + bandY(sunH)) / 2} 1790 ${bandY(sunH) + 14}`} stroke={KRP.red} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {landed > 4 && <path d={`M 1778 ${bandY(sunH) + 30} l 12 -16 l 14 12`} stroke={KRP.red} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
        {/* 積み木 */}
        {Array.from({ length: N }, (_, i) => {
          const t0 = tOf(i);
          if (f < t0) return null;
          const col = i % 2, lay = Math.floor(i / 2);
          const x = BX + col * 90;
          const yEnd = FLOOR - (lay + 1) * BH;
          const p = clamp01((f - t0) / 4);
          const y = lerp(112, yEnd, p * p);
          return (
            <g key={i}>
              <rect x={x} y={y} width={BW} height={BH} rx={5} fill={MP.bell} stroke={C.ink} strokeWidth={4} />
              <rect x={x + 6} y={y + 5} width={BW - 12} height={8} rx={3} fill="#EE7A68" />
              {p >= 1 && f - t0 < 8 && <path d={`M ${x - 10} ${yEnd + BH} l -14 -6 M ${x + BW + 10} ${yEnd + BH} l 14 -6`} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />}
            </g>
          );
        })}
        {/* 5時間以上の目盛り線 */}
        <line x1={690} y1={LINE5} x2={1100} y2={LINE5} stroke={KRP.red} strokeWidth={6} strokeDasharray="16 10" />
        <TagPlate x={1200} y={384} text="5時間以上" size={36} t={seg(f, 28, 36)} color={KRP.red} />
        {/* 小人 (よじ登る → てっぺんで汗だく) */}
        {climbing ? (
          <Kobito x={kX} y={kY} s={0.45} f={f} pose="hang" face="worried" gaze={[-6, -6]} lean={-6} />
        ) : (
          <Kobito x={kX} y={kY} s={0.45} f={f} pose="stand" face="worried" gaze={[0, -6]} />
        )}
        {[0, 1, 2].map((k) => {
          const t = ((f / 14 + k / 3) % 1);
          const hx = kX + (k - 1) * 34, hy = kY - 0.45 * 250 + t * 40;
          return <path key={k} d={`M ${hx} ${hy} q 7 12 0 18 q -7 -6 0 -18 Z`} fill="#8FC3E6" stroke={C.ink} strokeWidth={2.5} opacity={1 - t} />;
        })}
        {/* 最後の1枚 (頭にぱさっ) */}
        {f >= 35 && (
          <g transform={`translate(${pageP[0]} ${pageP[1]}) rotate(${pageRot}) scale(${lerp(1, 0.55, pageT)})`}>
            <rect x={-95} y={-196} width={190} height={196} fill={C.page} stroke={C.ink} strokeWidth={4} />
            <text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={C.ink}>30</text>
            <path d="M -95 -196 l 20 10 l 16 -8 l 20 10 l 18 -8 l 20 8 l 18 -8 l 20 10 l 18 -8 l 22 8" stroke={C.ink} strokeWidth={2} fill="none" />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #23 それでもずれないのは、毎朝、目から入る光で、針を合わせ直しているからです。
// 格: 山 / seed 6023
// 絵: どこ: 体の中の、目の裏の部屋から脳の奥の小部屋までをつなぐ縦の空間。画面上に大きな丸いガラス窓 (=目。外に朝の寝室が見え、カーテンから朝日)。下に TainaiDokei (lag=1→0, reset=0→1, s=1.4)。演出: 窓から白い朝日の光線が差し込むと、Kobito がサングラスをかけて大きな鏡を構え、光を管の口へ反射させる。光は管の中をジグザグに走り下り、TainaiDokei に命中。時計がぱっと金色に光り、赤い「はみ出し」区画に入っていた針が、カチン!と0時の線へ跳ね戻る。床の赤い積み木 (#22) もしゅわっと消える。Kobito たちがハイタッチ (face="smile")。腕は2本 (pose="mirror" で両手で鏡を持つ)。動き: f0-30 窓に朝日 / f30-90 光線を追ってカメラが上から下へパン / f90 命中・カチン / f100-150 積み木が消える・ハイタッチ
// どこ: 体の中の、目の裏の部屋から脳の奥の小部屋までをつなぐ空間 (ピンクの壁・神経の筋)。左上に大きな丸いガラス窓=目 (まぶたとまつげ・青い虹彩の輪・真鍮のふち)。ガラスの向こうに朝の寝室 (カーテンが開いて朝日)。中段の棚に鏡を構える Kobito、そこから右上へジグザグに走る透明な管、管の出口の下に TainaiDokei (s=1)。床に #22 の赤い積み木の山
// 演出: 窓から白い朝日の光線が差し込み、サングラスの Kobito が大きな丸い鏡を頭の上に構えて、光を管の口へはね返す。光の玉が管の中をジグザグに走り、出口から TainaiDokei に命中。時計がぱっと金色に光り、赤い区画にはみ出していた針がカチン!と0時へ跳ね戻る (はみ出しの区画も縮んで消える)。床の赤い積み木がしゅわっと泡になって消え、下の2人の Kobito がハイタッチ
// 動き: f0-10 窓に朝日 (窓に寄ったカメラ) / f6-14 光線が鏡へ / f14-20 鏡から管の口へ / f18-32 光の玉が管をジグザグに走り、カメラがそれを追う / f32 命中・f32-42 針が0時へ (reset) / f34-46 積み木が消える / f44〜 ハイタッチ (f52 で手が当たる) / 全体が見えるまで引く
const Mz023: React.FC<{ f: number }> = ({ f }) => {
  const [cx, cy, sc] = camKeys(f, [[0, 330, 270, 1.55], [12, 520, 380, 1.35], [22, 1040, 300, 1.3], [32, 1300, 480, 1.22], [44, 960, 540, 1.0], [184, 980, 540, 1.04]]);
  const sun = seg(f, 0, 10);
  const b1 = easeOut(seg(f, 6, 14));
  const b2 = easeOut(seg(f, 14, 20));
  const travel = seg(f, 18, 32);
  const reset = easeOut(seg(f, 32, 42));
  const gone = seg(f, 34, 46);
  const five = seg(f, 44, 52);
  const glow = f >= 32 ? Math.exp(-(f - 32) / 14) : 0;
  const EYE: Pt = [300, 270];
  const MIR: Pt = [640, 352];
  const FUN: Pt = [860, 300];
  const pipe: Pt[] = [[880, 296], [1060, 180], [1220, 300], [1380, 170], [1480, 250], [1490, 300]];
  const segLen = pipe.slice(1).map((p, i) => Math.hypot(p[0] - pipe[i][0], p[1] - pipe[i][1]));
  const total = segLen.reduce((a, b) => a + b, 0);
  const at = (t: number): Pt => {
    let d = t * total;
    for (let i = 0; i < segLen.length; i++) {
      if (d <= segLen[i]) { const k = d / segLen[i]; return [lerp(pipe[i][0], pipe[i + 1][0], k), lerp(pipe[i][1], pipe[i + 1][1], k)]; }
      d -= segLen[i];
    }
    return pipe[pipe.length - 1];
  };
  const orb = at(travel);
  const pipeD = pipe.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const litD = (() => {
    const pts: Pt[] = [pipe[0]];
    let d = travel * total;
    for (let i = 0; i < segLen.length; i++) {
      if (d >= segLen[i]) { pts.push(pipe[i + 1]); d -= segLen[i]; } else { pts.push(at(travel)); break; }
    }
    return pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  })();
  const eyeClip = useMzAbId("mz23eye");
  const FLOOR = 885;
  const blocks = Array.from({ length: 7 }, (_, i) => [600 + (i % 3) * 64 + (Math.floor(i / 3) % 2) * 32, FLOOR - (Math.floor(i / 3) + 1) * 40] as Pt);
  const happy = f >= 34;
  return (
    <Frame f={f} seed={6023}>
      <g transform={cam(cx, cy, sc)}>
        {/* 壁 (神経の筋が縦に走る) */}
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.pink} />
        <MzAbGyri x={-100} y={-60} w={2200} h={1000} seed={23} op={0.3} />
        <g stroke={C.pinkDeep} strokeWidth={5} fill="none" opacity={0.35}>
          {[120, 520, 980, 1700, 1860].map((x0, i) => <path key={i} d={`M ${x0} -200 q ${30 - i * 10} 400 0 700 t ${i * 8} 600`} />)}
        </g>
        <rect x={-200} y={FLOOR} width={2320} height={400} fill={C.pinkFloor} />
        <line x1={-200} y1={FLOOR} x2={2120} y2={FLOOR} stroke={C.ink} strokeWidth={6} />
        {/* 目の窓 */}
        <g>
          <circle cx={EYE[0]} cy={EYE[1]} r={212} fill={C.irisDark} stroke={C.ink} strokeWidth={7} />
          <circle cx={EYE[0]} cy={EYE[1]} r={196} fill={C.iris} />
          {Array.from({ length: 24 }, (_, i) => <line key={i} x1={EYE[0]} y1={EYE[1] - 196} x2={EYE[0]} y2={EYE[1] - 166} stroke={C.irisDark} strokeWidth={4} transform={`rotate(${i * 15} ${EYE[0]} ${EYE[1]})`} />)}
          <circle cx={EYE[0]} cy={EYE[1]} r={164} fill={MP.brass} stroke={C.ink} strokeWidth={6} />
          <defs><clipPath id={eyeClip}><circle cx={EYE[0]} cy={EYE[1]} r={150} /></clipPath></defs>
          <g clipPath={`url(#${eyeClip})`}>
            <rect x={EYE[0] - 160} y={EYE[1] - 160} width={320} height={320} fill={mixColor("#BFAF96", "#F4E6CA", sun)} />
            {/* 朝の寝室の窓 (外の空・カーテン・朝日) */}
            <rect x={EYE[0] - 90} y={EYE[1] - 110} width={180} height={150} fill={mixColor("#5A5890", MP.morning, sun)} stroke={C.ink} strokeWidth={4} />
            <circle cx={EYE[0] + 20} cy={EYE[1] - 50} r={30} fill="#FFE27A" stroke={C.ink} strokeWidth={3} opacity={sun} />
            <path d={`M ${EYE[0] - 90} ${EYE[1] - 110} L ${EYE[0] - 50 - sun * 30} ${EYE[1] - 110} Q ${EYE[0] - 60 - sun * 30} ${EYE[1] - 30} ${EYE[0] - 80 - sun * 10} ${EYE[1] + 40} L ${EYE[0] - 90} ${EYE[1] + 40} Z`} fill="#C9826C" stroke={C.ink} strokeWidth={3} />
            <path d={`M ${EYE[0] + 90} ${EYE[1] - 110} L ${EYE[0] + 50 + sun * 30} ${EYE[1] - 110} Q ${EYE[0] + 60 + sun * 30} ${EYE[1] - 30} ${EYE[0] + 80 + sun * 10} ${EYE[1] + 40} L ${EYE[0] + 90} ${EYE[1] + 40} Z`} fill="#C9826C" stroke={C.ink} strokeWidth={3} />
            <rect x={EYE[0] - 160} y={EYE[1] + 60} width={320} height={100} fill="#E9DAC2" />
            <rect x={EYE[0] - 120} y={EYE[1] + 72} width={240} height={40} rx={14} fill="#EFC46A" stroke={C.ink} strokeWidth={3} />
            {Array.from({ length: 6 }, (_, i) => <polygon key={i} points={`${EYE[0] + 20},${EYE[1] - 50} ${EYE[0] - 140 + i * 50},${EYE[1] + 160} ${EYE[0] - 110 + i * 50},${EYE[1] + 160}`} fill={C.sunbeam} opacity={0.3 * sun} />)}
          </g>
          <path d={`M ${EYE[0] - 110} ${EYE[1] - 90} A 140 140 0 0 1 ${EYE[0] - 30} ${EYE[1] - 138}`} stroke={KRP.white} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.55} />
          {/* まぶたとまつげ */}
          <path d={`M ${EYE[0] - 250} ${EYE[1] - 40} Q ${EYE[0]} ${EYE[1] - 330} ${EYE[0] + 250} ${EYE[1] - 40} Q ${EYE[0]} ${EYE[1] - 280} ${EYE[0] - 250} ${EYE[1] - 40} Z`} fill={C.pinkDark} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => {
            const t = 0.1 + i * 0.1;
            const px = lerp(EYE[0] - 250, EYE[0] + 250, t);
            const py = EYE[1] - 40 - Math.sin(t * Math.PI) * 220;
            return <path key={i} d={`M ${px} ${py} q ${(t - 0.5) * 40} -30 ${(t - 0.5) * 70} -50`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
          })}
        </g>
        {/* 光線1: 目 → 鏡 */}
        {b1 > 0 && (
          <polygon points={`${EYE[0] + 60},${EYE[1] - 30} ${EYE[0] + 120},${EYE[1] + 60} ${lerp(EYE[0] + 120, MIR[0] - 30, b1)},${lerp(EYE[1] + 60, MIR[1] + 30, b1)} ${lerp(EYE[0] + 60, MIR[0] - 30, b1)},${lerp(EYE[1] - 30, MIR[1] - 40, b1)}`}
            fill={C.sunbeam} stroke="#F2D36A" strokeWidth={3} opacity={0.9} />
        )}
        {/* 光線2: 鏡 → 管の口 */}
        {b2 > 0 && (
          <polygon points={`${MIR[0] + 20},${MIR[1] - 40} ${MIR[0] + 30},${MIR[1] + 10} ${lerp(MIR[0] + 30, FUN[0], b2)},${lerp(MIR[1] + 10, FUN[1] + 20, b2)} ${lerp(MIR[0] + 20, FUN[0], b2)},${lerp(MIR[1] - 40, FUN[1] - 20, b2)}`}
            fill={C.sunbeam} stroke="#F2D36A" strokeWidth={3} opacity={0.9} />
        )}
        {/* 棚 (鏡の小人の足場) */}
        <path d="M 500 600 L 790 600 Q 800 630 770 640 L 520 640 Q 490 630 500 600 Z" fill={C.pinkDeep} stroke={C.ink} strokeWidth={6} />
        <path d="M 560 640 L 600 700 M 730 640 L 700 700" stroke={C.pinkDeep} strokeWidth={14} />
        {/* ジグザグの管 (透明) と管の口 */}
        <path d={pipeD} stroke={C.ink} strokeWidth={44} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={pipeD} stroke="#F6E9EE" strokeWidth={34} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={pipeD} stroke={KRP.white} strokeWidth={6} fill="none" strokeLinejoin="round" opacity={0.8} transform="translate(-6 -8)" />
        {travel > 0 && <path d={litD} stroke={C.sunbeam} strokeWidth={22} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.95} />}
        <path d={`M ${FUN[0] - 6} ${FUN[1] - 46} L ${FUN[0] + 40} ${FUN[1] - 20} L ${FUN[0] + 40} ${FUN[1] + 16} L ${FUN[0] - 6} ${FUN[1] + 46} Z`} fill={MP.brass} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={1462} y={286} width={56} height={30} rx={6} fill={MP.brass} stroke={C.ink} strokeWidth={5} />
        {travel > 0 && travel < 1 && (
          <g>
            <circle cx={orb[0]} cy={orb[1]} r={40} fill={MP.glow} opacity={0.5} />
            <circle cx={orb[0]} cy={orb[1]} r={18} fill={KRP.white} stroke="#F2B13C" strokeWidth={4} />
          </g>
        )}
        {/* 床の赤い積み木 (しゅわっと消える) */}
        {blocks.map(([bx, by], i) => {
          const g = clamp01(gone * 1.6 - i * 0.08);
          if (g >= 1) return null;
          return (
            <g key={i} opacity={1 - g} transform={`translate(${bx + 30} ${by + 20}) scale(${1 - g * 0.5}) translate(${-bx - 30} ${-by - 20})`}>
              <rect x={bx} y={by} width={60} height={40} rx={4} fill={MP.bell} stroke={C.ink} strokeWidth={4} />
              <rect x={bx + 5} y={by + 4} width={50} height={7} rx={3} fill="#EE7A68" />
            </g>
          );
        })}
        {gone > 0 && gone < 1 && Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={610 + rnd(23, i) * 190} cy={FLOOR - 20 - gone * 140 - rnd(24, i) * 60} r={6 + rnd(25, i) * 8}
            fill={KRP.white} stroke={C.ink} strokeWidth={2} opacity={1 - gone} />
        ))}
        {/* 体内時計 (命中 → 金色に光る) */}
        {glow > 0.01 && <circle cx={1150} cy={640} r={300 + (1 - glow) * 80} fill={C.gold} opacity={0.45 * glow} />}
        <TainaiDokei x={1150} y={640} s={1} f={f} lag={1} reset={reset} hand={0.975} />
        {glow > 0.01 && <circle cx={1150} cy={640} r={180} fill={C.gold} opacity={0.3 * glow} />}
        {/* カチン! (0時の線で) */}
        {f >= 38 && f < 56 && (
          <g opacity={1 - seg(f, 44, 56)}>
            {[-50, -25, 0, 25, 50].map((d) => (
              <line key={d} x1={1150} y1={640 - 200} x2={1150} y2={640 - 236} stroke={C.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${d} 1150 ${640 - 165})`} />
            ))}
          </g>
        )}
        {/* 鏡の小人 (サングラス・鏡を頭の上に両手で) */}
        <MzAbKobitoBare x={640} y={600} s={0.55} f={f} face={happy ? "smile" : "normal"} gaze={[-4, -6]}
          arms={[[[-62, -140], [-104, -250], [-62, -340]], [[62, -140], [104, -250], [62, -340]]]}
          front={<g>
            {/* サングラス */}
            <rect x={-46} y={-238} width={36} height={26} rx={8} fill="#22242A" stroke={C.ink} strokeWidth={3} />
            <rect x={10} y={-238} width={36} height={26} rx={8} fill="#22242A" stroke={C.ink} strokeWidth={3} />
            <line x1={-10} y1={-228} x2={10} y2={-228} stroke={C.ink} strokeWidth={4} />
            <line x1={-38} y1={-232} x2={-26} y2={-222} stroke={KRP.white} strokeWidth={3} opacity={0.6} />
            {/* 大きな丸い鏡 (少し右上を向く) */}
            <g transform="translate(0 -452) rotate(-18)">
              <ellipse cx={0} cy={0} rx={104} ry={116} fill={MP.woodDark} stroke={C.ink} strokeWidth={7} />
              <ellipse cx={0} cy={0} rx={88} ry={100} fill={b1 > 0.5 ? "#FFF8DC" : "#CFE6F2"} stroke={C.ink} strokeWidth={4} />
              <path d="M -50 -60 L 20 -80 M -60 -20 L 40 -60" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
              <rect x={-14} y={100} width={28} height={30} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
            </g>
          </g>} />
        {/* ハイタッチの2人 */}
        {(() => {
          const reach = easeOut(five);
          const k1: Pt = [300, FLOOR], k2: Pt = [440, FLOOR];
          const meet: Pt = [(k1[0] + k2[0]) / 2, FLOOR - 0.5 * 330];
          const loc = (k: Pt): Pt => [(meet[0] - k[0]) / 0.5, (meet[1] - k[1]) / 0.5];
          const m1 = loc(k1), m2 = loc(k2);
          return (
            <g>
              <MzAbKobitoBare x={k1[0]} y={k1[1]} s={0.5} f={f} face={happy ? "joy" : "worried"} phase={1} gaze={[6, -2]} lean={reach * 6}
                arms={[[[-62, -140], [-90, -96], [-70, -60]], [[62, -140], [lerp(80, 110, reach), lerp(-100, -220, reach)], [lerp(70, m1[0] - 10, reach), lerp(-60, m1[1], reach)]]]} />
              <MzAbKobitoBare x={k2[0]} y={k2[1]} s={0.5} f={f} face={happy ? "joy" : "worried"} phase={2} gaze={[-6, -2]} lean={-reach * 6}
                arms={[[[-62, -140], [lerp(-80, -110, reach), lerp(-100, -220, reach)], [lerp(-70, m2[0] + 10, reach), lerp(-60, m2[1], reach)]], [[62, -140], [90, -96], [70, -60]]]} />
              {five >= 1 && f < 66 && (
                <g transform={`translate(${meet[0]} ${meet[1] - 6}) scale(${0.8 + seg(f, 52, 60) * 0.5})`} opacity={1 - seg(f, 56, 66)}>
                  <path d="M 0 -34 L 9 -10 L 34 0 L 9 10 L 0 34 L -9 10 L -34 0 L -9 -10 Z" fill={C.gold} stroke={C.ink} strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })()}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_012: (f) => <Mz012 f={f} />,
  mz_013: (f) => <Mz013 f={f} />,
  mz_014: (f) => <Mz014 f={f} />,
  mz_015: (f) => <Mz015 f={f} />,
  mz_016: (f) => <Mz016 f={f} />,
  mz_017: (f) => <Mz017 f={f} />,
  mz_018: (f) => <Mz018 f={f} />,
  mz_019: (f) => <Mz019 f={f} />,
  mz_020: (f) => <Mz020 f={f} />,
  mz_021: (f) => <Mz021 f={f} />,
  mz_022: (f) => <Mz022 f={f} />,
  mz_023: (f) => <Mz023 f={f} />,
};

export const MZ_AB_MOTIFS: string[] = [
  "mz_012", // #12
  "mz_013", // #13
  "mz_014", // #14
  "mz_015", // #15
  "mz_016", // #16
  "mz_017", // #17
  "mz_018", // #18
  "mz_019", // #19
  "mz_020", // #20
  "mz_021", // #21
  "mz_022", // #22
  "mz_023", // #23
];

export const mezaAbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
