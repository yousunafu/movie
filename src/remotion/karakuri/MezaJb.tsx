// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#204〜#213 (10文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, Flame, mixColor, skyColors, SHUDOUIN_BEDS,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  cork: "#C99A62",
  corkDark: "#A97C48",
  corkLight: "#DDB57F",
  hairBrown: "#8A5A3B",
  hairBrownDark: "#6A4029",
  hairWhite: "#ECE8E0",
  hairGray: "#BDB8B0",
  sandal: "#6B4A33",
  rope: "#C9A877",
  lining: "#D8C49A",
  blanket: "#8F8A86",
  blanketDark: "#6E6A66",
  navy: "#2E3F66",
  navyDark: "#1F2C4A",
  coatRed: "#C24A44",
  coatRedDark: "#93342F",
  coatGray: "#7E848C",
  coatGrayDark: "#5E636A",
  busBody: "#EDE6D2",
  busStripe: "#4F8E78",
  busStripeDark: "#3A6C5B",
  busSkirt: "#5C5F66",
  busIn: "#3D4A4E",
  seat: "#6E7F86",
  glassDawn: "#B9C6DA",
  road: "#6D6A6E",
  roadDark: "#58565A",
  walk: "#B9B1A4",
  walkDark: "#9C9486",
  bldg: "#7D7A92",
  bldgDark: "#605D78",
  parch: "#EFDDB2",
  parchDark: "#D2B880",
  parchEdge: "#B89A5E",
  inkLine: "#5A4632",
  illumRed: "#B53A30",
  illumBlue: "#3E5FA0",
  desk: "#9A6A40",
  deskDark: "#76502E",
  deskLight: "#B9875A",
  museumWall: "#7A3F3E",
  museumWallDark: "#5E2F2F",
  wainscot: "#8A5E3C",
  velvet: "#A8282E",
  glass: "#DDEFF5",
  pink: "#E58FA0",
  pinkDark: "#C66F82",
  cardigan: "#8C7A66",
  cardiganDark: "#6C5C4A",
  trouser: "#4A4A52",
  bread: "#E8B470",
  breadCrust: "#B97A3A",
  bag: "#5A4A3E",
  bagDark: "#3F332B",
  bronzeDark: "#7A5434",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void MP; void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky; void NazoBell;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const INK = KRP.ink;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;
// カメラ: 世界の点 (px,py) を画面の (sx,sy) に、倍率 k で
const cam = (px: number, py: number, k: number, sx = 960, sy = 540) =>
  `translate(${sx} ${sy}) scale(${k}) translate(${-px} ${-py})`;

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";

// Person を自前の座標で包む (重ね描き under/over を Person のローカル座標で描ける)
//   ローカル座標: 足元 (0,0)・頭の中心 (0,-228) 半径64・胴 -160〜-52・手 stand (±67,-62) / raise 右手 (67,-236) / hold (±14,-118)
type FigProps = {
  x: number; y: number; s?: number; f: number; lean?: number; phase?: number; face?: Face; pose?: Pose;
  cloth?: string; clothDark?: string; hair?: "cap" | "none"; gaze?: [number, number]; pointDir?: 1 | -1;
  under?: React.ReactNode; over?: React.ReactNode; opacity?: number; still?: boolean; sx?: number; sy?: number;
};
const MzJbFig: React.FC<FigProps> = ({
  x, y, s = 1, f, lean = 0, phase = 0, face = "normal", pose = "stand", cloth, clothDark, hair = "cap",
  gaze = [0, 0], pointDir = 1, under, over, opacity = 1, still = false, sx = 1, sy = 1,
}) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y + bob}) rotate(${lean}) scale(${s * sx} ${s * sy})`}>
      {under}
      <Person x={0} y={0} s={1} f={f + 1} phase={phase} still face={face} pose={pose}
        cloth={cloth} clothDark={clothDark} hair={hair} gaze={gaze} pointDir={pointDir} />
      {over}
    </g>
  );
};

// あなた (水色のパジャマ・短い黒髪。全編この姿)
const MzJbYou: React.FC<FigProps> = (p) => (
  <MzJbFig {...p} cloth={MP.you} clothDark={MP.youDark} hair="cap"
    over={<>
      <path d="M -26 -160 L -4 -136 L 18 -160" stroke={MP.youDark} strokeWidth={5} fill="none" strokeLinejoin="round" />
      {p.pose !== "hold" && p.pose !== "armsFolded" && [-124, -100, -76].map((by) => (
        <circle key={by} cx={-4} cy={by} r={5} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
      ))}
      {p.over}
    </>} />
);

// あなたの後ろ姿 (頭の後ろの黒髪で顔は見えない。両手を上げて鉄格子をつかむ)
const MzJbYouBack: React.FC<{ x: number; y: number; s?: number; f: number; squash?: number }> = ({ x, y, s = 1, f, squash = 0 }) => (
  <MzJbFig x={x} y={y} s={s} f={f} still pose="banzai" cloth={MP.you} clothDark={MP.youDark} hair="cap" sy={1 - squash * 0.04}
    over={<>
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 63} cy={-222} rx={10} ry={15} fill={KRP.white} stroke={INK} strokeWidth={4} />)}
      <circle cx={0} cy={-230} r={67} fill={INK} />
      <path d="M -40 -270 Q -10 -290 30 -276" stroke={KRP.grayDark} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d="M -24 -160 Q 0 -150 24 -160" stroke={MP.youDark} strokeWidth={6} fill="none" />
      <line x1={0} y1={-156} x2={0} y2={-56} stroke={MP.youDark} strokeWidth={3} opacity={0.6} />
      {[-1, 1].map((sd) => <circle key={`h${sd}`} cx={sd * 125} cy={-206} r={13} fill={KRP.white} stroke={INK} strokeWidth={4.5} />)}
    </>} />
);

// 女性の長い髪 (肩まで届く茶色。Person は hair="none" で使う)
const MzJbLongHair: React.FC = () => (
  <g>
    <path d="M -64 -236 Q -88 -190 -74 -144 L -46 -146 Q -56 -190 -50 -232 Z" fill={C.hairBrown} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 64 -236 Q 88 -190 74 -144 L 46 -146 Q 56 -190 50 -232 Z" fill={C.hairBrown} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -65 -236 Q -66 -298 0 -300 Q 66 -298 65 -236 Q 40 -260 4 -258 Q -30 -262 -65 -236 Z" fill={C.hairBrown} stroke={INK} strokeWidth={4} />
    <path d="M -30 -284 Q 0 -292 30 -282" stroke={C.hairBrownDark} strokeWidth={3} fill="none" opacity={0.6} />
  </g>
);

// 修道士 (頭巾は首の後ろに下ろした黒い U 字のえり・長い修道服・縄の帯)。男性とひと目で分かる姿 (MezaFixCommon「修道士の見た目」):
//   young = 短い黒髪 + 頭のてっぺんの丸い剃り跡 (トンスラ) + 太めの眉 / old = 耳の上に白髪が少しだけ残るはげ頭 + 大きな白ひげ + 太め
//   abbot = old の姿 + 首から十字架 + 手に小さな鈴 (bell に MzJbHandBell を渡して手の位置に描く)
const MzJbMonk: React.FC<{
  x: number; y: number; s?: number; f: number; kind: "young" | "old" | "abbot"; face?: Face; pose?: Pose; pointDir?: 1 | -1;
  lean?: number; phase?: number; gaze?: [number, number]; sleep?: boolean; closed?: boolean; messy?: boolean;
  sing?: number; opacity?: number; still?: boolean; extra?: React.ReactNode; bell?: React.ReactNode;
}> = ({ x, y, s = 1, f, kind, face = "normal", pose = "stand", pointDir = 1, lean = 0, phase = 0, gaze = [0, 0],
  sleep = false, closed = false, messy = false, sing = 0, opacity = 1, still = false, extra, bell }) => {
  const elder = kind !== "young";
  const eyesShut = sleep || closed;
  // 下ろした頭巾: 首の後ろで肩の左右にのぞく布のたまり (頭のうしろ・顔はかこまない)
  const under = (
    <path d="M -96 -136 Q -104 -178 -70 -186 Q 0 -196 70 -186 Q 104 -178 96 -136 Z"
      fill={MP.habitMid} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  );
  const over = (
    <g>
      {/* 長い修道服のすそ (脚をかくす) とサンダル */}
      <path d="M -60 -70 L 60 -70 L 76 -2 L -76 -2 Z" fill={MP.habit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -24 -64 L -32 -6 M 22 -64 L 30 -6" stroke={MP.habitMid} strokeWidth={4} />
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 22} cy={-1} rx={17} ry={7} fill={C.sandal} stroke={INK} strokeWidth={3} />)}
      {/* 縄の帯と結び目 */}
      <path d="M -58 -76 Q 0 -66 58 -76" stroke={C.rope} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M 20 -72 q 6 22 -2 40 M 30 -73 q 8 18 4 34" stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* 首の後ろに下ろした頭巾の U 字のえり (あごの下) */}
      <path d="M -70 -168 Q -74 -154 -60 -146 Q 0 -122 60 -146 Q 74 -154 70 -168 Q 40 -150 0 -148 Q -40 -150 -70 -168 Z"
        fill={MP.habitMid} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M -50 -152 Q 0 -134 50 -152" stroke={MP.habit} strokeWidth={3} fill="none" opacity={0.8} />
      {/* 若い修道士: 頭のてっぺんの丸い剃り跡 (トンスラ) + 太めの眉 */}
      {!elder && (
        <g>
          <ellipse cx={0} cy={-284} rx={23} ry={9} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
          {!eyesShut && [-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 40} -256 Q ${sd * 26} -263 ${sd * 11} -258`} stroke={INK} strokeWidth={7.5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      )}
      {/* 寝ぐせ (若い修道士) */}
      {!elder && messy && (
        <path d="M -48 -272 l -24 -26 l 30 6 Z M -26 -286 l -12 -32 l 22 22 Z M 30 -282 l 30 -20 l -8 30 Z M 50 -268 l 30 -6 l -22 22 Z"
          fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      )}
      {/* 年上・院長: はげ頭 (つやの線) + 耳の上に少しだけ残る白髪 */}
      {elder && (
        <g>
          <path d="M -30 -276 Q -10 -286 12 -284" stroke={C.hairGray} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 58} -258 Q ${sd * 78} -256 ${sd * 74} -238 Q ${sd * 84} -224 ${sd * 70} -208 Q ${sd * 64} -222 ${sd * 60} -236 Z`}
              fill={C.hairWhite} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          ))}
        </g>
      )}
      {/* 歌う口 */}
      {sing > 0.02 && !sleep && !elder && <ellipse cx={0} cy={-184} rx={8 + 3 * sing} ry={5 + 8 * sing} fill={INK} />}
      {/* 大きな白ひげ (年上・院長) */}
      {elder && (
        <g>
          <path d="M -48 -202 Q -54 -138 0 -110 Q 54 -138 48 -202 Q 32 -176 0 -172 Q -32 -176 -48 -202 Z" fill={C.hairWhite} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M -28 -198 Q -14 -208 0 -199 Q 14 -208 28 -198 Q 14 -192 0 -194 Q -14 -192 -28 -198 Z" fill={C.hairWhite} stroke={INK} strokeWidth={3} />
          <path d="M -22 -156 q 4 12 0 22 M 10 -152 q 4 12 0 22" stroke={C.hairGray} strokeWidth={3} fill="none" />
          {sing > 0.02 && !sleep && <ellipse cx={0} cy={-185} rx={7 + 3 * sing} ry={3 + 7 * sing} fill={INK} />}
        </g>
      )}
      {/* 院長の十字架 (首から下げる) */}
      {kind === "abbot" && (
        <g>
          <path d="M -30 -150 L 0 -106 L 30 -150" stroke={MP.brassDark} strokeWidth={3} fill="none" />
          <rect x={-5} y={-108} width={10} height={36} rx={2} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
          <rect x={-14} y={-98} width={28} height={9} rx={2} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
        </g>
      )}
      {/* とじた目 */}
      {eyesShut && (
        <g>
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 24} cy={-222} rx={16} ry={21} fill={KRP.white} />)}
          <path d="M -36 -220 Q -24 -210 -12 -220 M 12 -220 Q 24 -210 36 -220" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          {!elder && [-1, 1].map((sd) => (
            <path key={`b${sd}`} d={`M ${sd * 40} -250 Q ${sd * 26} -256 ${sd * 11} -252`} stroke={INK} strokeWidth={7.5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      )}
      {bell}
      {extra}
    </g>
  );
  return (
    <MzJbFig x={x} y={y} s={kind === "young" ? s * 0.92 : s} f={f} lean={lean} phase={phase} face={face} pose={pose}
      pointDir={pointDir} gaze={gaze} cloth={MP.habit} clothDark={MP.habit} hair={kind === "young" ? "cap" : "none"}
      sx={elder ? 1.12 : 1} under={under} over={over} opacity={opacity} still={still} />
  );
};

// 手に持ったろうそく (x,y = 手のひら)
const MzJbHeldCandle: React.FC<{ x: number; y: number; f: number; phase?: number; glow?: number }> = ({ x, y, f, phase = 0, glow = 1 }) => (
  <g>
    <ellipse cx={x} cy={y + 2} rx={26} ry={7} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} />
    <path d={`M ${x + 24} ${y} q 16 0 14 14 q -2 8 -12 4`} stroke={MP.brassDark} strokeWidth={4} fill="none" />
    <rect x={x - 9} y={y - 54} width={18} height={56} rx={3} fill="#F4ECD4" stroke={INK} strokeWidth={3} />
    <path d={`M ${x - 9} ${y - 48} q 3 12 6 0`} stroke={KRP.white} strokeWidth={3} fill="none" />
    <Flame x={x} y={y - 56} s={0.8} f={f} phase={phase} glow={glow} />
    <circle cx={x} cy={y + 6} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
  </g>
);

// 修道院の合図の鈴 (手で持つ。x,y = 持ち手をにぎる手)
const MzJbHandBell: React.FC<{ x: number; y: number; rot?: number; hand?: boolean; s?: number }> = ({ x, y, rot = 0, hand = true, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-6} y={-20} width={12} height={34} rx={5} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
    <path d="M -26 52 Q -28 14 0 12 Q 28 14 26 52 L 32 58 L -32 58 Z" fill={MP.brass} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -16 48 Q -16 26 -4 20" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cx={0} cy={64} r={6} fill={MP.iron} stroke={INK} strokeWidth={2} />
    {hand && <circle cx={0} cy={-4} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />}
  </g>
);

// 音符 (x,y = 玉の中心)。len で旗 (しっぽ) が横に長くのびる。ふつう 50〜60
const MzJbNote: React.FC<{ x: number; y: number; s?: number; len?: number; f: number; phase?: number; fill?: string; opacity?: number; halo?: boolean }> = ({
  x, y, s = 1, len = 55, f, phase = 0, fill = INK, opacity = 1, halo = false,
}) => {
  const n = Math.max(3, Math.round(len / 14));
  const amp = 7 * Math.min(1, len / 80);
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return `${(14 + t * len).toFixed(1)} ${(-62 + t * 16 + Math.sin(t * Math.PI * 2.2 + f / 9 + phase) * amp).toFixed(1)}`;
  });
  const d = "M " + pts.join(" L ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {halo && <circle cx={0} cy={-20} r={56} fill={MP.glow} opacity={0.35} />}
      <path d={d} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={fill} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={14} y1={-2} x2={14} y2={-62} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={18} ry={13} fill={fill} stroke={INK} strokeWidth={5} transform="rotate(-22)" />
    </g>
  );
};

// 石積み (修道院の壁。自分のシーン用)
const MzJbStones: React.FC<{ x: number; y: number; w: number; h: number; seed: number; sh?: number }> = ({ x, y, w, h, seed, sh = 70 }) => {
  const rows = Math.ceil(h / sh);
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    let cx = x - (r % 2) * 60;
    let c = 0;
    while (cx < x + w) {
      const bw = 110 + rnd(seed, r * 31 + c) * 80;
      const v = rnd(seed + 1, r * 17 + c);
      const fill = v < 0.4 ? MP.stone : v < 0.75 ? MP.stoneLight : mixColor(MP.stone, MP.stoneDark, 0.5);
      out.push(<rect key={`${r}-${c}`} x={cx + 3} y={y + r * sh + 3} width={bw - 6} height={sh - 6} rx={8} fill={fill} stroke={INK} strokeWidth={2.5} strokeOpacity={0.5} />);
      cx += bw;
      c++;
    }
  }
  return <g><rect x={x} y={y} width={w} height={h} fill={MP.stoneDark} />{out}</g>;
};

// 寝ている「あなた」の顔 (Shinshitsu の寝顔と同じ置き方。head={false} のときにこちらで描く)
const MzJbBedHead: React.FC<{ f: number; x?: number; y?: number; rot?: number; mode: "sleep" | "smile" | "frown" | "surprised"; smile?: number }> = ({
  f, x = 1062, y, rot = 80, mode, smile = 1,
}) => {
  const breathe = Math.sin(f / 21) * 5;
  const yy = y ?? 600 + breathe * 0.2;
  return (
    <g transform={`translate(${x} ${yy}) rotate(${rot}) scale(0.8) translate(0 228)`}>
      <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
      <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={INK} />
      {mode === "surprised" ? (
        <g>
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 24} cy={-222} rx={14} ry={19} fill={KRP.white} stroke={INK} strokeWidth={4} />)}
          {[-1, 1].map((sd) => <circle key={`p${sd}`} cx={sd * 24} cy={-222} r={4.5} fill={INK} />)}
          <line x1={-34} y1={-256} x2={-14} y2={-256} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          <line x1={14} y1={-256} x2={34} y2={-256} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          <ellipse cx={0} cy={-186} rx={10} ry={13} fill={INK} />
        </g>
      ) : (
        <g>
          <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
            <path d="M -36 -222 Q -24 -212 -12 -222" />
            <path d="M 12 -222 Q 24 -212 36 -222" />
            {mode === "frown" ? (
              <>
                <line x1={-34} y1={-250} x2={-14} y2={-244} />
                <line x1={14} y1={-244} x2={34} y2={-250} />
              </>
            ) : (
              <>
                <line x1={-34} y1={-246} x2={-14} y2={-247} />
                <line x1={14} y1={-247} x2={34} y2={-246} />
              </>
            )}
          </g>
          <ellipse cx={-38} cy={-200} rx={11} ry={6} fill="#F2A7A0" opacity={0.6 + (mode === "smile" ? 0.3 * smile : 0)} />
          <ellipse cx={38} cy={-200} rx={11} ry={6} fill="#F2A7A0" opacity={0.6 + (mode === "smile" ? 0.3 * smile : 0)} />
          {mode === "sleep" && <ellipse cx={0} cy={-186} rx={6 + Math.sin(f / 21) * 1.5} ry={7 + Math.sin(f / 21) * 2} fill={INK} />}
          {mode === "smile" && <path d={`M -14 -190 Q 0 ${-190 + 14 * smile} 14 -190`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />}
          {mode === "frown" && <path d="M -12 -184 Q -6 -190 0 -184 Q 6 -178 12 -184" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />}
        </g>
      )}
    </g>
  );
};

// 寝息の Z
const MzJbZzz: React.FC<{ f: number; x: number; y: number; s?: number; opacity?: number }> = ({ f, x, y, s = 1, opacity = 1 }) => (
  <g opacity={opacity}>
    {[0, 1, 2].map((i) => {
      const t = (f / 50 + i / 3) % 1;
      return <text key={i} x={x - t * 40 * s + Math.sin(t * 6 + i) * 10} y={y - t * 150 * s} fontFamily={FONT} fontWeight={900}
        fontSize={(30 + t * 26) * s} fill={KRP.white} stroke={INK} strokeWidth={2.5} opacity={Math.sin(t * Math.PI)}>Z</text>;
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #204 でも、他人が決めた時刻には、ひとつだけ、いいところがあります。
// 格: 並 / seed 6204
// どこ: あなたの寝室 (Shinshitsu, sky=1, sleeper=0)。窓の左の壁に、#198 の赤い糸の写真カードのコルクボード (左の壁の絵の上に掛ける)。
// 演出: ボードには 鶏人のとさか・修道院の鈴・時の鐘・工場の門の時計・ノッカー・アップの棒 の5枚のカードが赤い糸でつながる。
//       右下の端だけ、ピンが1本刺さっているのに何も留まっていない「空き」。そこに窓からの朝の光が丸く当たって光る。
//       ボードの前のあなたが空きに気づき、指を1本立てて (右腕は上・左腕は下の2本) 首をかしげて顔を近づける (surprised)。
//       光の丸の中に、ろうそくの小さな灯とスヌーズボタンの形が、うっすら重なって見えかける (まだぼんやり)。
// 動き: f0-26 カメラが部屋からボードの空きへ寄る / f10-30 光の丸がふわっと光る / f20-38 指を立てて顔を近づける /
//       f26-42 光の中の形がうっすら (そのあと f140 までさらに少し濃く) / 尺の最後までゆっくり寄り続ける
const MZJB_CARDS = [
  { x: 100, y: 196, r: -4, icon: 0 },
  { x: 222, y: 184, r: 3, icon: 1 },
  { x: 342, y: 200, r: -3, icon: 2 },
  { x: 108, y: 340, r: 4, icon: 3 },
  { x: 228, y: 352, r: -2, icon: 4 },
] as const;
const MZJB_SPOT = [350, 392] as const;

const MzJbCardIcon: React.FC<{ icon: number }> = ({ icon }) => {
  if (icon === 0) return ( // 鶏人のとさかの冠 (鶏)
    <g>
      <rect x={-36} y={-36} width={72} height={56} fill={MP.dawnSoft} />
      <path d="M -10 -18 q 2 -14 8 -4 q 4 -14 9 -2 q 7 -10 7 5 Z" fill={KRP.red} stroke={INK} strokeWidth={2.5} />
      <circle cx={0} cy={-4} r={14} fill={KRP.white} stroke={INK} strokeWidth={3} />
      <path d="M 12 -6 L 24 -2 L 12 2 Z" fill={KRP.yellow} stroke={INK} strokeWidth={2.5} />
      <circle cx={4} cy={-7} r={2.5} fill={INK} />
      <path d="M 8 6 q 4 10 -2 12 q -4 -4 2 -12" fill={KRP.red} stroke={INK} strokeWidth={2} />
      <path d="M -14 10 Q -6 20 6 12" stroke={INK} strokeWidth={2.5} fill="none" />
    </g>
  );
  if (icon === 1) return ( // 修道院の鈴
    <g>
      <rect x={-36} y={-36} width={72} height={56} fill={MP.stoneLight} />
      <path d="M -32 -36 L -32 -14 A 32 26 0 0 1 32 -14 L 32 -36" fill={MP.stone} opacity={0.6} />
      <MzJbHandBell x={0} y={-18} s={0.5} hand={false} />
    </g>
  );
  if (icon === 2) return ( // 江戸の時の鐘
    <g>
      <rect x={-36} y={-36} width={72} height={56} fill={MP.dawn} opacity={0.7} />
      <path d="M -30 -24 L 0 -34 L 30 -24 Z" fill={MP.woodDark} stroke={INK} strokeWidth={2.5} />
      <path d="M -14 14 L -14 -12 Q -14 -22 0 -22 Q 14 -22 14 -12 L 14 14 Z" fill={KRP.bronze} stroke={INK} strokeWidth={3} />
      <path d="M -14 -6 L 14 -6 M -14 4 L 14 4" stroke={C.bronzeDark} strokeWidth={2.5} />
      <rect x={-26} y={-24} width={4} height={40} fill={MP.woodDark} />
      <rect x={22} y={-24} width={4} height={40} fill={MP.woodDark} />
    </g>
  );
  if (icon === 3) return ( // 工場の門の時計
    <g>
      <rect x={-36} y={-36} width={72} height={56} fill={MP.mist} />
      <rect x={-34} y={-6} width={68} height={26} fill={MP.brick} stroke={INK} strokeWidth={2.5} />
      <path d="M -20 20 L -20 2 M -10 20 L -10 2 M 0 20 L 0 2 M 10 20 L 10 2 M 20 20 L 20 2" stroke={MP.iron} strokeWidth={3} />
      <circle cx={0} cy={-18} r={14} fill={KRP.white} stroke={INK} strokeWidth={3} />
      <path d="M 0 -18 L 0 -28 M 0 -18 L 7 -15" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
  return ( // ノッカー・アップの長い棒と窓
    <g>
      <rect x={-36} y={-36} width={72} height={56} fill={MP.night} />
      <rect x={4} y={-30} width={26} height={22} fill={KRP.yellow} stroke={INK} strokeWidth={2.5} />
      <line x1={-30} y1={18} x2={6} y2={-18} stroke={MP.woodLight} strokeWidth={4} strokeLinecap="round" />
      <path d="M 6 -18 l 6 -4 M 6 -18 l 4 -8 M 6 -18 l 8 0" stroke={KRP.silver} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

const Mz204: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 26));
  const k = lerp(1, 1.55, z) + 0.07 * seg(f, 42, 162);
  const P: [number, number] = [lerp(960, 420, z), lerp(540, 420, z)];
  const S: [number, number] = [lerp(960, 700, z), lerp(540, 520, z)];
  const g1 = easeOut(seg(f, 10, 30));
  const pulse = 1 + 0.06 * Math.sin(f / 7);
  const notice = f >= 20;
  const lean = -12 * easeOut(seg(f, 20, 38)) + Math.sin(f / 30) * 1.2;
  const sh = 0.14 + 0.22 * seg(f, 26, 42) + 0.22 * seg(f, 60, 140);
  const bang = seg(f, 22, 28) * (1 - seg(f, 40, 52));
  const [ex, ey] = MZJB_SPOT;
  // 糸の通り道 (ピンの位置)
  const pins = MZJB_CARDS.map((c) => [c.x, c.y - 40] as [number, number]);
  const emptyPin: [number, number] = [ex, ey - 46];
  const chain = [...pins, emptyPin];
  const string = chain.slice(1).map((p, i) => {
    const a = chain[i];
    return `Q ${(a[0] + p[0]) / 2} ${Math.max(a[1], p[1]) + 26} ${p[0]} ${p[1]}`;
  }).join(" ");
  return (
    <Frame f={f} seed={6204}>
      <g transform={cam(P[0], P[1], k, S[0], S[1])}>
        <Shinshitsu f={f} sky={1} sleeper={0} alarms={0} />
        {/* 窓からボードの端へさしこむ朝の光 */}
        <polygon points={`540,316 604,476 ${ex + 10},${ey + 46} ${ex - 30},${ey - 44}`} fill={MP.glow} opacity={0.12 + 0.16 * g1} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t = (f / 90 + i / 6) % 1;
          return <circle key={i} cx={lerp(560, ex, t) + Math.sin(i * 3 + f / 20) * 14} cy={lerp(380, ey, t) + (i % 3 - 1) * 18} r={3}
            fill={KRP.white} opacity={0.6 * Math.sin(t * Math.PI) * g1} />;
        })}
        {/* コルクボード (木の枠・コルクの粒) */}
        <rect x={20} y={112} width={420} height={372} rx={10} fill={MP.woodLight} stroke={INK} strokeWidth={7} />
        <rect x={38} y={130} width={384} height={336} rx={4} fill={C.cork} stroke={INK} strokeWidth={4} />
        <g>
          {Array.from({ length: 90 }, (_, i) => (
            <circle key={i} cx={46 + rnd(204, i) * 368} cy={138 + rnd(205, i) * 320} r={2 + rnd(206, i) * 2.5}
              fill={i % 3 ? C.corkDark : C.corkLight} opacity={0.6} />
          ))}
        </g>
        {/* 写真カード */}
        {MZJB_CARDS.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`}>
            <rect x={-44} y={-40} width={92} height={88} fill={INK} opacity={0.18} />
            <rect x={-46} y={-44} width={92} height={88} rx={3} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            <MzJbCardIcon icon={c.icon} />
            <rect x={-36} y={-36} width={72} height={56} fill="none" stroke={INK} strokeWidth={2.5} />
            <line x1={-26} y1={33} x2={20} y2={33} stroke={KRP.gray} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
        {/* 赤い糸 (最後は空きのピンへ) */}
        <path d={`M ${chain[0][0]} ${chain[0][1]} ${string}`} stroke={MP.bellDark} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M ${chain[0][0]} ${chain[0][1]} ${string}`} stroke={MP.bell} strokeWidth={3} fill="none" strokeLinecap="round" />
        {pins.map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={8} fill={MP.bell} stroke={INK} strokeWidth={3} />
            <circle cx={px - 2} cy={py - 2} r={2.5} fill={KRP.white} />
          </g>
        ))}
        {/* 空き: 光の丸 */}
        <g transform={`translate(${ex} ${ey}) scale(${pulse})`}>
          <circle r={70} fill={MP.glow} opacity={0.22 * g1} />
          <circle r={50} fill={MP.glow} opacity={0.45 * g1} />
          <circle r={30} fill={MP.flameCore} opacity={0.55 * g1} />
          <circle r={56} fill="none" stroke={MP.dawn} strokeWidth={3} strokeDasharray="8 10" opacity={0.7 * g1}
            transform={`rotate(${f * 1.5})`} />
        </g>
        <rect x={ex - 44} y={ey - 40} width={88} height={84} rx={4} fill="none" stroke={C.corkDark} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
        {/* 光の中に、ろうそくの灯とスヌーズボタンの形がうっすら */}
        <g opacity={sh}>
          <rect x={ex - 30} y={ey - 6} width={12} height={30} rx={3} fill="#F4ECD4" stroke={INK} strokeWidth={2.5} />
          <Flame x={ex - 24} y={ey - 8} s={0.45} f={f} glow={0} />
          <rect x={ex - 4} y={ey - 8} width={40} height={14} rx={6} fill={mixColor(MP.bell, KRP.white, 0.35)} stroke={INK} strokeWidth={2.5} />
          <path d={`M ${ex - 6} ${ey + 14} A 22 22 0 0 0 ${ex + 38} ${ey + 14}`} stroke={MP.bell} strokeWidth={4} fill="none" />
        </g>
        <circle cx={emptyPin[0]} cy={emptyPin[1]} r={8} fill={MP.brass} stroke={INK} strokeWidth={3} />
        {/* あなた */}
        <MzJbYou x={590} y={880} s={1.72} f={f} lean={lean} face={notice ? "surprised" : "normal"}
          pose={notice ? "raise" : "stand"} gaze={notice ? [-8, -6] : [-7, -3]}
          over={notice ? (
            <g>
              <rect x={62} y={-272} width={10} height={32} rx={5} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
              <circle cx={67} cy={-238} r={13} fill={KRP.white} stroke={INK} strokeWidth={4} />
            </g>
          ) : null} />
        {/* ひらめきの線 */}
        {bang > 0.01 && (
          <g opacity={bang} stroke={INK} strokeWidth={6} strokeLinecap="round">
            <line x1={420} y1={330} x2={392} y2={300} />
            <line x1={490} y1={300} x2={490} y2={262} />
            <line x1={560} y1={316} x2={588} y2={288} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #205 他人は、待ってもくれるのです。
// 格: 山 / seed 6205
// どこ: 夜明けの町のバス停 (#197 と同じ朝もやの坂の下)。夜明けの空・遠くのビル・左に下ってくる坂道・歩道とバス停の柱・時刻表。
// 演出: 坂を走ってきたあなた (水色のパジャマ) がバスの扉にたどり着き、ぜえぜえ言いながらステップに上がる。
//       運転手 (紺の制服と帽子・男性) がにこっと笑って帽子のつばを持ち上げ、それからレバーで扉を閉める (腕は2本)。
//       窓の中の乗客 (女性=肩までの茶色の髪・赤いコート / 男性=短い黒髪・灰色の上着) が、にこにこ席を詰めてくれる。
//       バスが走り出すと、時刻表の「1分」の赤い印が小さく揺れる。
// 動き: f0-16 あなたが扉へ走る / f14-30 ステップに上がる・運転手が帽子を上げてにこり / f22-38 乗客が詰める /
//       f48-60 扉が閉まる / f56-79 走り出す・もやが流れる
const MZJB_BUSWIN = [690, 958, 1226, 1494] as const;
const MZJB_RIDERS = [
  { x: 760, w: true, dx: 46 }, { x: 870, w: false, dx: 36 }, { x: 1070, w: false, dx: 26 },
  { x: 1320, w: true, dx: 14 }, { x: 1610, w: false, dx: 0 },
] as const;

const Mz205: React.FC<{ f: number }> = ({ f }) => {
  const arrive = easeOut(seg(f, 0, 16));
  const climb = easeInOut(seg(f, 14, 30));
  const tip = seg(f, 16, 24) * (1 - seg(f, 44, 50));
  const scoot = easeOut(seg(f, 22, 38));
  const close = easeInOut(seg(f, 48, 60));
  const go = Math.pow(seg(f, 56, 79), 2);
  const busDx = -go * 170;
  const k = 1 + 0.06 * easeOut(seg(f, 0, 40));
  const P: [number, number] = [740 + busDx * 0.4, 600];
  const [skyT, skyB] = skyColors(1.15);
  const youX = f < 16 ? lerp(300, 560, arrive) : lerp(560, 578, climb);
  const youY = f < 16 ? 930 : lerp(930, 790, climb);
  const running = f < 15;
  const panelW = lerp(16, 80, close);
  const clipId = "mzjb205win";
  return (
    <Frame f={f} seed={6205} bg={MP.dawnSoft}>
      <g transform={cam(P[0], P[1], k)}>
        {/* 夜明けの空 */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-260} y={-160 + i * 80} width={2440} height={82} fill={mixColor(skyT, skyB, i / 11)} />
        ))}
        <circle cx={1660} cy={330} r={130} fill={MP.glow} opacity={0.35} />
        <circle cx={1660} cy={330} r={70} fill={MP.dawnSoft} />
        {/* 遠くのビル */}
        {Array.from({ length: 14 }, (_, i) => {
          const bx = -260 + i * 180;
          const top = 150 + rnd(2051, i) * 130;
          return (
            <g key={i}>
              <rect x={bx} y={top} width={170} height={700} fill={i % 2 ? C.bldg : C.bldgDark} stroke={INK} strokeWidth={4} />
              {Array.from({ length: 8 }, (_, j) => (
                <rect key={j} x={bx + 22 + (j % 3) * 46} y={top + 30 + Math.floor(j / 3) * 60} width={26} height={30}
                  fill={rnd(2052, i * 9 + j) > 0.55 ? MP.flame : C.bldgDark} opacity={0.85} />
              ))}
            </g>
          );
        })}
        {/* 左の坂道 (#197 で走ってきた坂) */}
        <path d="M -260 380 Q 60 420 260 760 L -260 760 Z" fill={C.walk} stroke={INK} strokeWidth={5} />
        <path d="M -200 420 Q 60 470 200 720" stroke={KRP.white} strokeWidth={6} strokeDasharray="30 24" fill="none" opacity={0.7} />
        {/* 朝もや (奥) */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={((i * 760 + f * 1.2 + go * 400) % 2600) - 300} cy={640 + i * 30} rx={520} ry={56} fill={MP.mist} opacity={0.55} />
        ))}
        {/* 道路 */}
        <rect x={-260} y={740} width={2440} height={130} fill={C.road} />
        <rect x={-260} y={846} width={2440} height={18} fill={C.walkDark} stroke={INK} strokeWidth={4} />
        <rect x={-260} y={862} width={2440} height={400} fill={C.walk} />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-260 + i * 120} y1={864} x2={-300 + i * 120} y2={1200} stroke={C.walkDark} strokeWidth={4} />)}
        <line x1={-260} y1={960} x2={2180} y2={960} stroke={C.walkDark} strokeWidth={4} />
        {/* バス (扉の中のあなたもいっしょに動く) */}
        <g transform={`translate(${busDx} ${go > 0 ? Math.sin(f * 1.4) * 2 : 0})`}>
          <ellipse cx={1000} cy={846} rx={820} ry={20} fill={INK} opacity={0.25} />
          <path d="M 300 300 L 1740 300 Q 1780 300 1780 340 L 1780 790 L 230 790 L 230 420 Q 232 330 300 300 Z" fill={C.busBody} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <rect x={300} y={286} width={1430} height={20} rx={10} fill={C.busBody} stroke={INK} strokeWidth={5} />
          <rect x={234} y={600} width={1542} height={40} fill={C.busStripe} />
          <rect x={234} y={640} width={1542} height={10} fill={C.busStripeDark} />
          <path d="M 232 740 L 1778 740 L 1778 788 L 232 788 Z" fill={C.busSkirt} />
          {/* 行き先の表示 (字は書かない・明かりだけ) */}
          <rect x={320} y={318} width={340} height={44} rx={6} fill="#2B2D33" stroke={INK} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={340 + i * 62} y={332} width={44} height={16} rx={4} fill={MP.flame} opacity={0.75} />)}
          {/* 前のガラス・運転席の窓 */}
          <path d="M 236 430 Q 240 380 290 376 L 290 560 L 236 560 Z" fill={C.glassDawn} stroke={INK} strokeWidth={5} />
          <defs>
            <clipPath id={clipId}>
              <rect x={300} y={380} width={170} height={180} rx={10} />
              {MZJB_BUSWIN.map((wx) => <rect key={wx} x={wx} y={380} width={250} height={180} rx={10} />)}
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect x={290} y={370} width={1460} height={200} fill={C.busIn} />
            {/* 手すりとつり革 */}
            <line x1={680} y1={392} x2={1740} y2={392} stroke={KRP.silver} strokeWidth={6} />
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i} transform={`rotate(${go * 14 + Math.sin(f / 8 + i) * 2} ${720 + i * 104} 392)`}>
                <line x1={720 + i * 104} y1={392} x2={720 + i * 104} y2={418} stroke={KRP.grayDark} strokeWidth={4} />
                <circle cx={720 + i * 104} cy={428} r={10} fill="none" stroke={KRP.white} strokeWidth={4} />
              </g>
            ))}
            {/* 運転手 */}
            <MzJbFig x={392} y={640} s={0.72} f={f} phase={2} face="smile" cloth={C.navy} clothDark={C.navyDark}
              pose={f >= 48 ? "point" : tip > 0.05 ? "raise" : "stand"} pointDir={1} gaze={[6, 2]}
              over={
                <g transform={`translate(0 ${-tip * 14}) rotate(${-tip * 16} 60 -262)`}>
                  <path d="M -60 -262 Q -58 -320 0 -324 Q 58 -320 60 -262 Z" fill={C.navy} stroke={INK} strokeWidth={5} />
                  <path d="M -66 -262 Q 0 -250 78 -262 Q 44 -238 -60 -252 Z" fill={C.navyDark} stroke={INK} strokeWidth={4} />
                  <circle cx={0} cy={-292} r={9} fill={MP.brass} stroke={INK} strokeWidth={3} />
                </g>
              } />
            {/* 乗客 (席を詰める) */}
            {MZJB_RIDERS.map((r, i) => (
              <MzJbFig key={i} x={r.x + r.dx * scoot} y={640} s={0.7} f={f} phase={i + 3}
                face={f < 22 ? "worried" : "smile"} gaze={[-6, 0]}
                cloth={r.w ? C.coatRed : C.coatGray} clothDark={r.w ? C.coatRedDark : C.coatGrayDark}
                hair={r.w ? "none" : "cap"} over={r.w ? <MzJbLongHair /> : null} />
            ))}
            {/* 座席の背 */}
            {MZJB_BUSWIN.map((wx) => <rect key={`s${wx}`} x={wx - 4} y={536} width={258} height={30} rx={8} fill={C.seat} stroke={INK} strokeWidth={3} />)}
            {/* ガラスのつや */}
            {[300, ...MZJB_BUSWIN].map((wx) => <path key={`g${wx}`} d={`M ${wx + 30} 560 L ${wx + 110} 380 M ${wx + 70} 560 L ${wx + 130} 420`} stroke={KRP.white} strokeWidth={8} opacity={0.25} />)}
          </g>
          {[[300, 170], ...MZJB_BUSWIN.map((wx) => [wx, 250])].map(([wx, ww]) => (
            <rect key={`f${wx}`} x={wx} y={380} width={ww} height={180} rx={10} fill="none" stroke={INK} strokeWidth={6} />
          ))}
          {/* 扉の中 */}
          <rect x={490} y={360} width={160} height={430} fill={C.busIn} stroke={INK} strokeWidth={6} />
          <rect x={490} y={768} width={160} height={22} fill={C.busSkirt} stroke={INK} strokeWidth={4} />
          <line x1={636} y1={380} x2={636} y2={770} stroke={KRP.silver} strokeWidth={8} />
          {/* あなた */}
          <MzJbYou x={youX} y={youY} s={0.95} f={f} phase={1} pose={running ? "run" : "stand"}
            face={f < 30 ? "surprised" : "joy"} lean={running ? -4 : lerp(-8, -2, seg(f, 30, 42))} gaze={[4, -2]} />
          {/* ぜえぜえの息と汗 */}
          {[0, 1, 2].map((i) => {
            const t = ((f / 14 + i / 3) % 1);
            return <circle key={i} cx={youX - 30 - t * 70} cy={youY - 186 * 0.95 - t * 30} r={10 + t * 14}
              fill={KRP.white} stroke={INK} strokeWidth={3} opacity={(1 - t) * 0.9 * (1 - seg(f, 44, 56))} />;
          })}
          {[[-50, -300], [56, -290]].map(([sx, sy], i) => (
            <path key={i} d={`M ${youX + sx} ${youY + sy + Math.sin(f / 4 + i) * 4} q -8 14 0 18 q 8 -4 0 -18 Z`} fill={KRP.blue} stroke={INK} strokeWidth={2.5}
              opacity={1 - seg(f, 46, 58)} />
          ))}
          {/* 扉 (折れ戸2枚) */}
          {[0, 1].map((i) => {
            const x0 = i === 0 ? 490 : 650 - panelW;
            return (
              <g key={i}>
                <rect x={x0} y={362} width={panelW} height={406} fill={C.glassDawn} stroke={INK} strokeWidth={5} opacity={0.92} />
                <rect x={x0} y={362} width={panelW} height={406} fill="none" stroke={C.busStripeDark} strokeWidth={4} />
                <line x1={x0 + panelW / 2} y1={380} x2={x0 + panelW / 2} y2={750} stroke={KRP.white} strokeWidth={4} opacity={0.5} />
              </g>
            );
          })}
          {/* 車輪 */}
          {[480, 1500].map((wx) => (
            <g key={wx}>
              <path d={`M ${wx - 96} 790 A 96 96 0 0 1 ${wx + 96} 790 Z`} fill={INK} />
              <circle cx={wx} cy={800} r={74} fill="#2E2F33" stroke={INK} strokeWidth={6} />
              <circle cx={wx} cy={800} r={38} fill={KRP.silver} stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3, 4].map((s) => (
                <line key={s} x1={wx} y1={800} x2={wx} y2={770} stroke={INK} strokeWidth={4}
                  transform={`rotate(${s * 72 + (busDx / 74) * 57} ${wx} 800)`} />
              ))}
            </g>
          ))}
          {/* ライトとミラー */}
          <circle cx={248} cy={700} r={20} fill={MP.flame} stroke={INK} strokeWidth={4} />
          <circle cx={248} cy={700} r={50} fill={MP.glow} opacity={0.3} />
          <path d="M 236 440 L 186 430 L 186 500" stroke={INK} strokeWidth={6} fill="none" />
          <rect x={170} y={490} width={32} height={56} rx={8} fill={C.busSkirt} stroke={INK} strokeWidth={4} />
          <rect x={226} y={760} width={30} height={30} fill={C.busSkirt} stroke={INK} strokeWidth={4} />
        </g>
        {/* バス停の柱と時刻表 */}
        <g>
          <ellipse cx={150} cy={992} rx={60} ry={14} fill={INK} opacity={0.3} />
          <rect x={142} y={430} width={16} height={560} fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
          <circle cx={150} cy={400} r={64} fill={KRP.white} stroke={INK} strokeWidth={7} />
          <circle cx={150} cy={400} r={50} fill="none" stroke={C.busStripe} strokeWidth={8} />
          <rect x={118} y={378} width={64} height={38} rx={8} fill={C.busStripe} stroke={INK} strokeWidth={3.5} />
          <rect x={126} y={384} width={20} height={14} fill={KRP.white} />
          <rect x={154} y={384} width={20} height={14} fill={KRP.white} />
          <circle cx={132} cy={420} r={6} fill={INK} />
          <circle cx={168} cy={420} r={6} fill={INK} />
          <rect x={90} y={530} width={120} height={180} rx={6} fill={KRP.white} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={i === 4 && go > 0 ? `rotate(${Math.sin(f * 1.3) * 4} 150 ${560 + i * 22})` : undefined}>
              <line x1={104} y1={556 + i * 22} x2={132} y2={556 + i * 22} stroke={INK} strokeWidth={4} />
              {/* 時刻は読めない横線だけ (数字は書かない) */}
              <line x1={144} y1={556 + i * 22} x2={[192, 178, 188, 170, 194, 182, 174][i]} y2={556 + i * 22} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
              {i === 4 && <circle cx={100} cy={556 + i * 22} r={6} fill={MP.bell} stroke={INK} strokeWidth={2} />}
            </g>
          ))}
        </g>
        {/* 走り出すと流れるもや (手前) */}
        {[0, 1].map((i) => (
          <ellipse key={i} cx={((i * 1100 + f * 2 + go * 900) % 2600) - 300} cy={900 + i * 60} rx={420} ry={40} fill={MP.mist} opacity={0.45} />
        ))}
        {go > 0.05 && [0, 1, 2, 3].map((i) => (
          <line key={i} x1={1820 + i * 30} y1={420 + i * 90} x2={1960 + i * 30 + go * 120} y2={420 + i * 90} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={go * 0.6} />
        ))}
      </g>
      <TagPlate x={500} y={480} text="1分" size={34} t={seg(f, 60, 68)} color={MP.bellDark} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #206 1500年前の修道院を、思い出してください。
// 格: 山 / seed 6206
// どこ: #205 のバスの窓 (緑の窓わく・朝もや) がディゾルブして、Shudouin (dark=0.9, candle=1) の修道院の寝室へ。冬の夜。年代札「約1500年前」。
// 演出: 木のベッドに修道士が服を着たまま眠る。並びは #57 と同じ: 左=年上 (白いひげ・太め)、2台目=若い修道士 (黒髪・小さめ)、
//       3台目=年上。4台目は起きている院長のベッド (毛布がたたんである)。手前の通路に院長 (首に十字架) が、
//       左手にろうそく・右手に小さな鈴を持って静かに立つ (腕は2本)。寝息の Z。
// 動き: f0-16 窓わくが消え f8-30 もやが石のアーチへ溶ける / f4-118 カメラがゆっくり奥へ進む / f96-110 院長が鈴を持ち上げる・ろうそくがゆれる
const Mz206: React.FC<{ f: number }> = ({ f }) => {
  const k = 1 + 0.2 * easeInOut(seg(f, 4, 118));
  const lift = f >= 100;
  const frameO = 1 - easeInOut(seg(f, 0, 16));
  const mistO = 1 - easeInOut(seg(f, 8, 30));
  const sleepers = [{ i: 0, kind: "old" as const }, { i: 1, kind: "young" as const }, { i: 2, kind: "old" as const }];
  return (
    <Frame f={f} seed={6206} dark bg={MP.nightDeep}>
      <g transform={cam(960, 580, k, 960, 580)}>
        <Shudouin f={f} dark={0.9} candle={1} bell={0} />
        {/* 眠る修道士たち (服を着たまま・毛布を胸まで) */}
        {sleepers.map(({ i, kind }) => {
          const bx = SHUDOUIN_BEDS[i][0];
          const br = Math.sin(f / 20 + i * 2) * 4;
          return (
            <g key={i}>
              <g transform={`translate(${bx + 150} ${746 - 58 * 0.95}) rotate(-90)`}>
                <MzJbMonk x={0} y={0} s={0.95} f={f} kind={kind} sleep still phase={i} />
              </g>
              <path d={`M ${bx + 14} 756 L ${bx + 4} 680 Q ${bx + 14} ${616 - br} ${bx + 90} ${612 - br} Q ${bx + 160} ${612 - br} ${bx + 176} 680 L ${bx + 178} 756 Z`}
                fill={C.blanket} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d={`M ${bx + 40} ${660 - br * 0.6} Q ${bx + 90} ${672 - br * 0.6} ${bx + 150} ${658 - br * 0.6} M ${bx + 60} 728 L ${bx + 150} 726`}
                stroke={C.blanketDark} strokeWidth={4} fill="none" />
              <MzJbZzz f={f + i * 17} x={bx - 50} y={610} s={0.7} opacity={0.8} />
            </g>
          );
        })}
        {/* 夜の暗さ (人の上にも) */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={0.22} />
        {/* 院長のろうそくの明かり */}
        <circle cx={1330} cy={820} r={300} fill={MP.glow} opacity={0.12 + 0.02 * Math.sin(f / 4)} />
        <circle cx={1330} cy={820} r={150} fill={MP.glow} opacity={0.14} />
        <ellipse cx={1400} cy={936} rx={110} ry={18} fill={INK} opacity={0.35} />
        <MzJbMonk x={1400} y={935} s={1.05} f={f} kind="abbot" face="smile" gaze={[-6, 3]} phase={4}
          pose={lift ? "raise" : "stand"}
          extra={<>
            <MzJbHeldCandle x={-67} y={-58} f={f} phase={2} glow={1.2} />
            {lift
              ? <MzJbHandBell x={67} y={-238} rot={Math.sin(f / 5) * 4} />
              : <MzJbHandBell x={67} y={-60} rot={Math.sin(f / 18) * 2} />}
          </>} />
      </g>
      {/* バスの窓 (ディゾルブで消える) */}
      {mistO > 0.01 && (
        <g>
          <g opacity={mistO}>
            <rect x={160} y={90} width={1600} height={850} rx={60} fill={MP.mist} opacity={0.85} />
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={300 + i * 440 + f * 3} cy={420 + (i % 2) * 180} rx={360} ry={90} fill={KRP.white} opacity={0.5} />
            ))}
          </g>
          <g opacity={frameO}>
            <path fillRule="evenodd" d="M -20 -20 H 1940 V 1100 H -20 Z M 160 150 Q 160 90 220 90 H 1700 Q 1760 90 1760 150 V 880 Q 1760 940 1700 940 H 220 Q 160 940 160 880 Z"
              fill={C.busStripe} stroke={INK} strokeWidth={8} />
            <path d="M 260 880 L 520 120 M 380 900 L 640 140" stroke={KRP.white} strokeWidth={14} opacity={0.3} />
            <rect x={-20} y={960} width={1960} height={40} fill={C.busStripeDark} />
          </g>
        </g>
      )}
      <TagPlate x={250} y={150} text="約1500年前" size={40} t={seg(f, 14, 26)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #207 遅れてくる者のために、最初のお祈りの歌は、わざとゆっくり唱えること。
// 格: 山 / seed 6207
// どこ: 修道院の礼拝堂 (夜明け前)。石の壁・細い窓に星・奥の祭壇 (白い布・2本の燭台・壁の十字架)・壁つきの柱・
//       長い木の聖歌隊の机 (開いた本)・右の壁のアーチの木の扉。
// 演出: 机の後ろに並んだ年上の修道士4人が歌い、口から出る音符の旗が3倍にびよーんと伸びて漂う。
//       左手前の院長が両手を大きくゆっくり振って指揮しながら、横目で扉を見る。
//       扉がそーっと開き、寝ぐせ・頭巾が裏返った若い修道士が、つま先立ちで忍び込む。低く垂れた長い音符の下を
//       かがんでくぐり、机の空き (左から3番目) にすべり込む。席に着いた瞬間に音符がふつうの長さに戻り、
//       となりの年上の修道士が横目でにやり。
// 動き: f0-18 音符が伸びる / f0〜 院長がゆっくり指揮 (24コマ周期) / f18-32 扉が開く / f30-104 若い修道士が忍び込む
//       (f36-88 低い音符の下でかがむ) / f104-112 席へ / f112-122 音符がもどる / f116- にやり
const MZJB_CHOIR = [
  { x: 520, kind: "old" as const }, { x: 710, kind: "old" as const },
  { x: 1090, kind: "old" as const }, { x: 1280, kind: "old" as const },
];
const Mz207: React.FC<{ f: number }> = ({ f }) => {
  const seated = f >= 112;
  const str = !seated ? 1 + 2 * easeOut(seg(f, 0, 18)) : 3 - 2 * easeOut(seg(f, 112, 122));
  const door = easeInOut(seg(f, 18, 32));
  // 若い修道士の通り道
  const walk = seg(f, 30, 104);
  let lx = lerp(1750, 905, walk);
  let ly = f < 42 ? lerp(806, 880, seg(f, 30, 42)) : 880;
  if (f >= 104) { ly = lerp(880, 790, easeInOut(seg(f, 104, 112))); lx = 900; }
  const step = Math.abs(Math.sin(f / 4)) * 8 * (f > 30 && f < 104 ? 1 : 0);
  const duck = f < 104 ? clamp01((1790 - lx) / 50) * clamp01((lx - 1250) / 60) : 0;
  const lateVisible = f >= 24;
  const behindDesk = ly < 836;
  const smirkX = 1090;
  const late = lateVisible && (
    <g>
      {!behindDesk && <ellipse cx={lx} cy={ly + 4} rx={60} ry={12} fill={INK} opacity={0.25} />}
      <MzJbMonk x={lx} y={ly + duck * 58 - step} s={0.95} f={f} kind="young" messy phase={7}
        pose={seated ? "stand" : "hold"} lean={seated ? 0 : -8 - duck * 6}
        face={seated ? "smile" : "worried"} gaze={seated ? [0, 0] : [-6, -5]} sing={seated ? 0.6 + 0.3 * Math.sin(f / 10) : 0} />
    </g>
  );
  const lowNote = (
    <MzJbNote x={1360 + Math.sin(f / 30) * 10} y={668} len={120 * str} f={f} phase={2} fill={MP.glow} halo />
  );
  return (
    <Frame f={f} seed={6207} dark bg={MP.stoneDark}>
      <g transform={cam(960, 560, 1 + 0.04 * seg(f, 40, 168))}>
        <MzJbStones x={-80} y={-60} w={2080} h={880} seed={207} />
        {/* ヴォールト天井 */}
        <rect x={-80} y={-60} width={2080} height={140} fill={MP.stoneDark} />
        {[300, 960, 1620].map((cx) => <path key={cx} d={`M ${cx - 340} 80 Q ${cx} -30 ${cx + 340} 80`} stroke={MP.stoneLight} strokeWidth={14} fill="none" />)}
        <rect x={-80} y={74} width={2080} height={18} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
        {/* 細い窓と星 */}
        {[300, 620, 1300, 1560].map((wx, i) => (
          <g key={wx}>
            <path d={`M ${wx - 50} 450 L ${wx - 50} 210 A 50 50 0 0 1 ${wx + 50} 210 L ${wx + 50} 450 Z`} fill={MP.stoneLight} stroke={INK} strokeWidth={5} />
            <path d={`M ${wx - 34} 440 L ${wx - 34} 214 A 34 34 0 0 1 ${wx + 34} 214 L ${wx + 34} 440 Z`} fill={MP.night} stroke={INK} strokeWidth={5} />
            {[0, 1, 2].map((s) => (
              <circle key={s} cx={wx - 14 + ((s * 23 + i * 7) % 30)} cy={240 + s * 70} r={3}
                fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 8 + s + i)} />
            ))}
            <line x1={wx} y1={180} x2={wx} y2={440} stroke={MP.iron} strokeWidth={4} />
          </g>
        ))}
        {/* 壁の柱 */}
        {[460, 1460].map((px) => (
          <g key={px}>
            <rect x={px - 36} y={90} width={72} height={700} fill={MP.stone} stroke={INK} strokeWidth={5} />
            <rect x={px - 48} y={90} width={96} height={30} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
            {[0, 1, 2, 3, 4, 5].map((r) => <line key={r} x1={px - 36} y1={180 + r * 100} x2={px + 36} y2={180 + r * 100} stroke={INK} strokeWidth={3} opacity={0.4} />)}
          </g>
        ))}
        {/* 祭壇・十字架・燭台 */}
        <rect x={948} y={150} width={24} height={210} rx={4} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={900} y={196} width={120} height={22} rx={4} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <circle cx={960} cy={480} r={260} fill={MP.glow} opacity={0.14 + 0.02 * Math.sin(f / 5)} />
        <rect x={770} y={470} width={380} height={30} fill={MP.stoneLight} stroke={INK} strokeWidth={5} />
        <rect x={790} y={498} width={340} height={180} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <rect x={790} y={498} width={340} height={26} fill={KRP.red} stroke={INK} strokeWidth={3} />
        {[830, 1090].map((cx, i) => (
          <g key={cx}>
            <rect x={cx - 6} y={392} width={12} height={80} fill={MP.brass} stroke={INK} strokeWidth={3} />
            <ellipse cx={cx} cy={470} rx={26} ry={7} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
            <rect x={cx - 9} y={350} width={18} height={44} fill="#F4ECD4" stroke={INK} strokeWidth={3} />
            <Flame x={cx} y={348} f={f} phase={i} />
          </g>
        ))}
        {/* 右の壁の扉 (そーっと開く) */}
        <path d="M 1640 810 L 1640 520 A 110 110 0 0 1 1860 520 L 1860 810 Z" fill={MP.stoneLight} stroke={INK} strokeWidth={6} />
        <path d="M 1660 810 L 1660 524 A 90 90 0 0 1 1840 524 L 1840 810 Z" fill={MP.nightDeep} stroke={INK} strokeWidth={5} />
        <path d="M 1660 810 L 1700 600 L 1800 600 L 1840 810 Z" fill={MP.glow} opacity={0.12 * door} />
        <g transform={`translate(1840 0) scale(${1 - 0.78 * door} 1) translate(-1840 0)`}>
          <path d="M 1660 810 L 1660 524 A 90 90 0 0 1 1840 524 L 1840 810 Z" fill={MP.wood} stroke={INK} strokeWidth={5} />
          {[1700, 1750, 1800].map((bx) => <line key={bx} x1={bx} y1={460} x2={bx} y2={810} stroke={MP.woodDark} strokeWidth={4} />)}
          {[580, 730].map((by) => <rect key={by} x={1660} y={by} width={180} height={14} fill={MP.iron} stroke={INK} strokeWidth={3} />)}
          <circle cx={1680} cy={670} r={10} fill={MP.iron} stroke={INK} strokeWidth={3} />
        </g>
        {/* 床 */}
        <rect x={-80} y={800} width={2080} height={420} fill={MP.stoneDark} />
        <g stroke={INK} strokeWidth={3} opacity={0.4}>
          {[800, 870, 960, 1070].map((ly2) => <line key={ly2} x1={-80} y1={ly2} x2={2000} y2={ly2} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180 - 80} y1={800} x2={(i - 6) * 260 + 960} y2={1200} />)}
        </g>
        {/* 聖歌隊 (机の後ろ) */}
        {MZJB_CHOIR.map((m, i) => {
          const smirk = m.x === smirkX;
          const g: [number, number] = smirk ? (seated ? [-7, 0] : lx > m.x ? [6, 0] : [-6, 0]) : [0, -2];
          return (
            <MzJbMonk key={i} x={m.x} y={790} s={0.95} f={f} kind={m.kind} phase={i}
              closed={!smirk} gaze={g} face={smirk && f >= 116 ? "smile" : "normal"}
              sing={smirk && f >= 116 ? 0 : 0.6 + 0.35 * Math.sin(f / 12 + i)} />
          );
        })}
        {behindDesk && late}
        {/* 長い木の机と開いた本 */}
        <path d="M 380 690 L 1420 690 L 1440 714 L 360 714 Z" fill={MP.woodLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={370} y={712} width={1060} height={100} fill={MP.wood} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${400 + i * 130} 800 L ${400 + i * 130} 752 A 40 30 0 0 1 ${480 + i * 130} 752 L ${480 + i * 130} 800`} fill="none" stroke={MP.woodDark} strokeWidth={4} />
        ))}
        {[520, 710, 900, 1090, 1280].map((bx) => (
          <g key={bx}>
            <path d={`M ${bx - 60} 690 L ${bx - 50} 666 Q ${bx - 24} 660 ${bx} 670 Q ${bx + 24} 660 ${bx + 50} 666 L ${bx + 60} 690 Z`} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            <line x1={bx} y1={670} x2={bx} y2={690} stroke={INK} strokeWidth={2.5} />
            {[0, 1].map((r) => <line key={r} x1={bx - 44} y1={676 + r * 6} x2={bx - 10} y2={676 + r * 6} stroke={KRP.grayDark} strokeWidth={2} />)}
          </g>
        ))}
        {/* 伸びた音符 */}
        {MZJB_CHOIR.map((m, i) => [0, 1].map((j) => (
          <MzJbNote key={`${i}-${j}`} x={m.x + 10 + ((f * 0.5 + j * 60) % 120)} y={420 - j * 120 + Math.sin(f / 16 + i + j) * 8}
            len={(52 + j * 10) * str} f={f} phase={i + j} s={0.85} fill={MP.glow} />
        )))}
        {lowNote}
        {!behindDesk && late}
        {/* 院長 (左手前・ゆっくり指揮) */}
        <ellipse cx={240} cy={932} rx={110} ry={18} fill={INK} opacity={0.3} />
        <MzJbMonk x={240} y={930} s={1.05} f={f} kind="abbot" pose="banzai" lean={Math.sin(f / 24) * 7}
          gaze={seated ? [0, 0] : [8, -1]} face={seated ? "smile" : "normal"} phase={5}
          bell={<MzJbHandBell x={120} y={-214} s={0.75} rot={Math.sin(f / 6) * 6} />} />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${240 + sd * 150} ${640 + Math.sin(f / 24) * 30} q ${sd * 40} -40 ${sd * 10} -90`} stroke={MP.glow} strokeWidth={6}
            fill="none" strokeLinecap="round" strokeDasharray="10 12" opacity={0.8} />
        ))}
        {/* 忍び足の足あと */}
        {f > 34 && f < 104 && [1, 2, 3].map((i) => (
          <ellipse key={i} cx={lx + i * 60} cy={ly + 6} rx={14} ry={5} fill={MP.stoneLight} opacity={0.5 - i * 0.12} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #208 起きる時刻を決めた人たちは、起きられない人のために、ちょっとだけ待つ決まりも、作っていました。
// 格: 並 / seed 6208
// どこ: 修道院の写字室。石の壁・左の細い窓 (夜明け前の空)・ななめの木の書見台・大きな羊皮紙の規則の書
//       (飾り文字の頭文字・波線の行)・ろうそく・インク壺と予備の羽ペン。札「規則の書」。
// 演出: 年上の修道士の手元だけ (黒い袖・白い袖口。顔は描かない)。右手が羽ペンで、いちばん下に新しい1行を書き足す。
//       上の行の余白には 鈴 と 朝日 (起きる) のしるし、新しい行のあとには 砂時計 と ゆっくり伸びた音符 (待つ決まり)。
//       左手は紙を押さえていたが、書き終えると ろうそくを その行のそばへ寄せて照らす (腕は2本)。窓がうっすら明るむ。
// 動き: f0-22 カメラが書見台へ寄る / f6-32 新しい行を書く / f30-42 砂時計と音符が浮かぶ / f50-100 ろうそくを寄せる / f30-206 窓が明るむ
const MZJB_ROWS = [
  { y: 262, x0: 620 }, { y: 318, x0: 620 }, { y: 374, x0: 620 },
  { y: 436, x0: 480 }, { y: 492, x0: 480 }, { y: 548, x0: 480 }, { y: 604, x0: 480 },
] as const;
const MzJbWavy: React.FC<{ x0: number; x1: number; y: number; seed: number; w?: number }> = ({ x0, x1, y, seed, w = 5 }) => {
  const n = Math.max(2, Math.round((x1 - x0) / 16));
  const d = "M " + Array.from({ length: n + 1 }, (_, i) => `${(x0 + ((x1 - x0) * i) / n).toFixed(1)} ${(y + Math.sin(i * 1.4 + seed) * 4).toFixed(1)}`).join(" L ");
  return <path d={d} stroke={C.inkLine} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={`${60 + (seed % 3) * 14} 14 ${36 + (seed % 4) * 8} 14 ${80} 16`} />;
};
const MzJbHourglass: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const sand = (f / 120) % 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-34} y={-58} width={68} height={12} rx={3} fill={MP.woodDark} stroke={INK} strokeWidth={3.5} />
      <rect x={-34} y={46} width={68} height={12} rx={3} fill={MP.woodDark} stroke={INK} strokeWidth={3.5} />
      <path d="M -24 -46 Q -24 -6 -4 0 Q -24 6 -24 46 L 24 46 Q 24 6 4 0 Q 24 -6 24 -46 Z" fill={C.glass} stroke={INK} strokeWidth={3.5} opacity={0.95} />
      <path d={`M -18 ${-30 + sand * 20} Q 0 ${-24 + sand * 20} 18 ${-30 + sand * 20} Q 6 -6 0 -2 Q -6 -6 -18 ${-30 + sand * 20} Z`} fill={MP.dawn} />
      <line x1={0} y1={0} x2={0} y2={40} stroke={MP.dawn} strokeWidth={2.5} />
      <path d={`M -20 44 Q 0 ${30 - sand * 10} 20 44 Z`} fill={MP.dawn} />
      {[-1, 1].map((sd) => <rect key={sd} x={sd * 30 - 3} y={-48} width={6} height={96} fill={MP.wood} stroke={INK} strokeWidth={2} />)}
    </g>
  );
};

const Mz208: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(0.86, 1, easeInOut(seg(f, 0, 22))) + 0.04 * seg(f, 44, 206);
  const wp = easeInOut(seg(f, 6, 32));
  const icons = pop(seg(f, 30, 40));
  const cand = easeInOut(seg(f, 50, 100));
  const sky = lerp(0.35, 1.05, seg(f, 30, 206));
  const [st, sb] = skyColors(sky);
  const clip = "mzjb208row";
  const NEW_Y = 668;
  // 羽ペンの先
  const tip: [number, number] = f < 32
    ? [lerp(480, 1110, wp), NEW_Y + Math.sin(f * 1.7) * 3]
    : f < 42 ? [lerp(1110, 1250, seg(f, 32, 38)), lerp(NEW_Y, 650, seg(f, 32, 42))]
      : [lerp(1250, 1330, easeOut(seg(f, 42, 70))), lerp(650, 560, easeOut(seg(f, 42, 70))) + Math.sin(f / 20) * 4];
  const hand: [number, number] = [tip[0] + 40, tip[1] + 58];
  const candle: [number, number] = [lerp(300, 395, cand), lerp(760, 700, cand)];
  const lHand: [number, number] = cand > 0 && cand < 1
    ? [candle[0] - 34, candle[1] + 20]
    : f < 50 ? [520, 790] : [lerp(candle[0] - 34, 470, easeOut(seg(f, 100, 130))), lerp(candle[1] + 20, 800, easeOut(seg(f, 100, 130)))];
  return (
    <Frame f={f} seed={6208} bg={MP.stoneDark}>
      <g transform={cam(960, 520, k)}>
        <MzJbStones x={-260} y={-160} w={2440} h={1400} seed={208} />
        {/* 左の細い窓 (夜明け前→うっすら明るい) */}
        <path d="M 40 600 L 40 220 A 90 90 0 0 1 220 220 L 220 600 Z" fill={MP.stoneLight} stroke={INK} strokeWidth={6} />
        <clipPath id="mzjb208win"><path d="M 66 580 L 66 224 A 64 64 0 0 1 194 224 L 194 580 Z" /></clipPath>
        <g clipPath="url(#mzjb208win)">
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={60} y={150 + i * 56} width={140} height={58} fill={mixColor(st, sb, i / 7)} />)}
          {[[100, 230], [160, 300], [120, 380]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={3} fill="#FFF6D8" opacity={clamp01(1.2 - sky) * (0.6 + 0.4 * Math.sin(f / 9 + i))} />
          ))}
          <path d="M 60 580 L 60 520 Q 120 490 200 510 L 200 580 Z" fill={MP.night} opacity={0.8} />
        </g>
        <path d="M 66 580 L 66 224 A 64 64 0 0 1 194 224 L 194 580 Z" fill="none" stroke={INK} strokeWidth={6} />
        <path d="M 130 160 L 130 580 M 66 380 L 194 380" stroke={MP.iron} strokeWidth={5} />
        <polygon points="70,580 194,580 620,1100 180,1100" fill={MP.dawnSoft} opacity={0.06 + 0.1 * seg(f, 30, 206)} />
        {/* ななめの書見台 */}
        <path d="M 300 130 L 1620 130 L 1730 960 L 190 960 Z" fill={C.desk} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${290 - i * 22} ${200 + i * 170} Q 960 ${190 + i * 170 + (i % 2 ? 14 : -14)} ${1630 + i * 22} ${200 + i * 170}`} stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.5} />
        ))}
        <rect x={170} y={940} width={1580} height={46} rx={8} fill={C.deskLight} stroke={INK} strokeWidth={6} />
        {/* 羊皮紙の規則の書 */}
        <g transform="rotate(-1.2 960 500)">
          <path d="M 416 178 L 1504 172 L 1512 832 L 408 840 Z" fill={C.parch} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 416 178 L 1504 172 L 1512 832 L 408 840 Z" fill="none" stroke={C.parchDark} strokeWidth={18} opacity={0.5} transform="translate(0 0)" />
          <path d="M 1504 172 l -40 0 l 40 34 Z" fill={C.parchDark} stroke={INK} strokeWidth={3} />
          {/* 飾り文字の頭文字 */}
          <rect x={470} y={218} width={118} height={130} rx={6} fill={C.illumBlue} stroke={INK} strokeWidth={4} />
          <rect x={478} y={226} width={102} height={114} rx={4} fill="none" stroke={MP.brass} strokeWidth={4} />
          <path d="M 486 334 q 20 -30 0 -60 M 572 236 q -20 30 0 60" stroke={MP.brassLight} strokeWidth={3} fill="none" />
          <text x={529} y={322} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={100} fill={C.illumRed} stroke={INK} strokeWidth={3}>R</text>
          {/* 書いてある行 */}
          {MZJB_ROWS.map((r, i) => <MzJbWavy key={i} x0={r.x0} x1={1380 - (i === 6 ? 300 : 0)} y={r.y} seed={i + 2} />)}
          {/* 余白のしるし: 鈴 と 朝日 (起きる) */}
          <MzJbHandBell x={1440} y={262} s={0.55} hand={false} />
          <g transform="translate(1440 396)">
            <path d="M -36 10 A 36 36 0 0 1 36 10 Z" fill={MP.dawn} stroke={INK} strokeWidth={3.5} />
            {[-60, -30, 0, 30, 60].map((a) => <line key={a} x1={0} y1={-34} x2={0} y2={-50} stroke={MP.dawn} strokeWidth={5} strokeLinecap="round" transform={`rotate(${a} 0 10)`} />)}
            <line x1={-46} y1={10} x2={46} y2={10} stroke={INK} strokeWidth={4} />
          </g>
          {/* 新しく書き足す1行 */}
          <clipPath id={clip}><rect x={460} y={NEW_Y - 30} width={Math.max(1, tip[0] - 460)} height={60} /></clipPath>
          <g clipPath={`url(#${clip})`}><MzJbWavy x0={480} x1={1110} y={NEW_Y} seed={9} /></g>
          {/* 待つ決まりのしるし: 砂時計とゆっくり伸びた音符 */}
          {icons > 0.01 && (
            <g opacity={clamp01(icons)}>
              <circle cx={1290} cy={NEW_Y - 10} r={110 * icons} fill={MP.glow} opacity={0.3} />
              <MzJbHourglass x={1200} y={NEW_Y - 4} s={0.62 * icons} f={f} />
              <MzJbNote x={1260} y={NEW_Y + 24} s={0.75 * icons} len={150} f={f} fill={MP.glow} />
            </g>
          )}
          {/* 余白のメモの点線 (下) */}
          <MzJbWavy x0={480} x1={900} y={760} seed={4} w={3} />
        </g>
        {/* インク壺と予備の羽ペン */}
        <g>
          <path d="M 1560 940 L 1570 880 Q 1610 864 1650 880 L 1660 940 Z" fill={MP.habit} stroke={INK} strokeWidth={5} />
          <ellipse cx={1610} cy={880} rx={40} ry={10} fill={INK} />
          <path d="M 1620 878 L 1700 700" stroke={KRP.white} strokeWidth={4} />
          <path d="M 1660 790 Q 1690 720 1704 690 Q 1716 730 1672 796 Z" fill={KRP.white} stroke={INK} strokeWidth={3} />
        </g>
        {/* ろうそく (左手が寄せる) */}
        <circle cx={candle[0]} cy={candle[1] - 120} r={220 + 60 * cand} fill={MP.glow} opacity={0.16 + 0.08 * cand + 0.02 * Math.sin(f / 4)} />
        <ellipse cx={candle[0]} cy={candle[1]} rx={46} ry={12} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
        <rect x={candle[0] - 14} y={candle[1] - 110} width={28} height={110} rx={4} fill="#F4ECD4" stroke={INK} strokeWidth={4} />
        <path d={`M ${candle[0] - 14} ${candle[1] - 100} q 4 20 8 0 M ${candle[0] + 4} ${candle[1] - 104} q 4 32 8 0`} stroke={KRP.white} strokeWidth={4} fill="none" />
        <Flame x={candle[0]} y={candle[1] - 112} s={1.3} f={f} glow={1.4} />
        {cand > 0.3 && <ellipse cx={760} cy={NEW_Y} rx={420} ry={70} fill={MP.glow} opacity={0.18 * cand} />}
        {/* 左腕 (黒い袖・白い袖口・手) */}
        <path d={`M -40 1180 Q ${lHand[0] - 160} ${lHand[1] + 120} ${lHand[0] - 26} ${lHand[1] + 30}`} stroke={INK} strokeWidth={72} fill="none" strokeLinecap="round" />
        <path d={`M -40 1180 Q ${lHand[0] - 160} ${lHand[1] + 120} ${lHand[0] - 26} ${lHand[1] + 30}`} stroke={MP.habit} strokeWidth={60} fill="none" strokeLinecap="round" />
        <circle cx={lHand[0] - 22} cy={lHand[1] + 26} r={32} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <ellipse cx={lHand[0]} cy={lHand[1]} rx={34} ry={26} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <path d={`M ${lHand[0] + 14} ${lHand[1] - 14} l 22 -6 M ${lHand[0] + 18} ${lHand[1]} l 24 -2`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {/* 右腕と羽ペン */}
        <path d={`M 2000 1200 Q ${hand[0] + 200} ${hand[1] + 140} ${hand[0] + 30} ${hand[1] + 40}`} stroke={INK} strokeWidth={72} fill="none" strokeLinecap="round" />
        <path d={`M 2000 1200 Q ${hand[0] + 200} ${hand[1] + 140} ${hand[0] + 30} ${hand[1] + 40}`} stroke={MP.habit} strokeWidth={60} fill="none" strokeLinecap="round" />
        <circle cx={hand[0] + 26} cy={hand[1] + 36} r={32} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <line x1={tip[0]} y1={tip[1]} x2={tip[0] + 160} y2={tip[1] - 190} stroke="#E9E1CF" strokeWidth={6} />
        <path d={`M ${tip[0] + 40} ${tip[1] - 46} Q ${tip[0] + 80} ${tip[1] - 150} ${tip[0] + 176} ${tip[1] - 212} Q ${tip[0] + 150} ${tip[1] - 110} ${tip[0] + 64} ${tip[1] - 40} Z`}
          fill={KRP.white} stroke={INK} strokeWidth={3.5} />
        {[0.3, 0.5, 0.7].map((t) => (
          <line key={t} x1={tip[0] + 40 + t * 130} y1={tip[1] - 46 - t * 160} x2={tip[0] + 64 + t * 130} y2={tip[1] - 34 - t * 160} stroke={KRP.gray} strokeWidth={2.5} />
        ))}
        <path d={`M ${tip[0]} ${tip[1]} l 10 -12`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={hand[0]} cy={hand[1]} rx={30} ry={24} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <path d={`M ${hand[0] - 26} ${hand[1] - 8} q -8 -12 2 -22`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <TagPlate x={960} y={96} text="規則の書" size={34} t={seg(f, 14, 24)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #209 そして1400年あまりのち、目覚まし時計に、スヌーズがつきました。
// 格: 図 / seed 6209
// どこ: #208 の羊皮紙が、写字室の机の上で横にずーっとほどけて長い年表の巻物になる (同じ羊皮紙・ろうそくの光)。
// 演出: 左端に修道院の礼拝堂の小さな絵 (歌う頭巾の3人・伸びた音符)。そこから音符が1本の光る線になって右へ流れ、
//       途中の 時の鐘・番人の塔・工場の門 (待ってくれない側として薄く) を通り過ぎ、右端の BellClock (snooze) の
//       スヌーズボタンにするっと吸い込まれ、ボタンがぽうっと温かく光る。札「6世紀」「1400年あまり」(矢印)「1955年」。
// 動き: f0-18 巻物が右へほどける / f0-30 カメラが左端から全体へ引く / f6-36 音符の線が右へ流れる /
//       f34-40 ボタンに吸い込まれる / f36-42 ボタンが光る / そのあと ゆっくり寄る・ボタンが脈うつ
const MZJB_PLATE_Y209 = 286;
const Mz209: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 0, 30));
  const tr = f < 30
    ? cam(lerp(520, 960, e), 540, lerp(1.35, 1, e))
    : cam(1200, 540, 1 + 0.05 * seg(f, 42, 161), 1200, 540);
  const right = lerp(620, 1800, easeInOut(seg(f, 0, 18)));
  const lp = easeInOut(seg(f, 6, 36));
  const glow = easeOut(seg(f, 36, 42));
  const CX = 1640, CY = 600, BTN = CY - 0.7 * 116;
  // 音符の線の点
  const pts: [number, number][] = [];
  for (let x = 400; x <= 1540; x += 20) pts.push([x, 548 + Math.sin(x / 70) * 22]);
  for (let i = 1; i <= 10; i++) {
    const t = i / 10;
    pts.push([lerp(1540, CX, t) + Math.sin(t * Math.PI) * 10, lerp(548 + Math.sin(1540 / 70) * 22, BTN, t) - Math.sin(t * Math.PI) * 60]);
  }
  const line = "M " + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  const headI = Math.min(pts.length - 1, Math.floor(lp * (pts.length - 1)));
  const head = pts[headI];
  const passed = (x: number) => clamp01((head[0] - x + 60) / 120) * (headI >= pts.length - 11 ? 1 : 1);
  return (
    <Frame f={f} seed={6209} bg={C.deskDark}>
      <g transform={tr}>
        {/* 写字室の机 */}
        <rect x={-260} y={-160} width={2440} height={1400} fill={C.desk} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -260 ${-40 + i * 150} q 600 ${rnd(209, i) * 30 - 15} 1220 0 q 600 ${rnd(210, i) * 30 - 15} 1220 0`} stroke={C.deskDark} strokeWidth={5} fill="none" opacity={0.5} />
        ))}
        {/* ろうそく (左上) */}
        <circle cx={110} cy={130} r={260} fill={MP.glow} opacity={0.18 + 0.02 * Math.sin(f / 4)} />
        <ellipse cx={110} cy={210} rx={50} ry={13} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
        <rect x={96} y={110} width={28} height={100} rx={4} fill="#F4ECD4" stroke={INK} strokeWidth={4} />
        <Flame x={110} y={108} s={1.2} f={f} glow={1.2} />
        {/* 巻物 */}
        <clipPath id="mzjb209scroll"><rect x={120} y={300} width={Math.max(1, right - 120)} height={500} /></clipPath>
        <rect x={124} y={346} width={right - 124} height={440} fill={INK} opacity={0.2} />
        <g clipPath="url(#mzjb209scroll)">
          <rect x={120} y={330} width={1760} height={440} fill={C.parch} stroke={INK} strokeWidth={6} />
          <rect x={120} y={346} width={1760} height={10} fill={C.parchDark} opacity={0.6} />
          <rect x={120} y={744} width={1760} height={10} fill={C.parchDark} opacity={0.6} />
          {/* #208 の行のなごり */}
          {[640, 680, 720].map((y, i) => <MzJbWavy key={y} x0={170} x1={560 - i * 60} y={y} seed={i + 3} w={4} />)}
          {/* 左端: 修道院の礼拝堂の小さな絵 (6世紀) */}
          <g>
            <path d="M 170 620 L 170 470 A 110 110 0 0 1 390 470 L 390 620 Z" fill={MP.stoneLight} stroke={INK} strokeWidth={5} />
            <path d="M 260 480 L 260 430 A 20 20 0 0 1 300 430 L 300 480 Z" fill={MP.night} stroke={INK} strokeWidth={3.5} />
            {[210, 280, 350].map((hx, i) => (
              <g key={hx}>
                <path d={`M ${hx - 30} 620 L ${hx - 26} 560 Q ${hx} 540 ${hx + 26} 560 L ${hx + 30} 620 Z`} fill={MP.habit} stroke={INK} strokeWidth={3.5} />
                {/* 修道士 (頭巾は首の後ろ。はげ頭+白ひげ = 男性。2026-11-26 修道女に見えないよう直し) */}
                <path d={`M ${hx - 22} 566 Q ${hx} 578 ${hx + 22} 566`} fill="none" stroke={MP.habitMid} strokeWidth={8} />
                <circle cx={hx} cy={538} r={21} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                <ellipse cx={hx - 20} cy={540} rx={5} ry={8} fill="#E8E4DA" stroke={INK} strokeWidth={2} />
                <ellipse cx={hx + 20} cy={540} rx={5} ry={8} fill="#E8E4DA" stroke={INK} strokeWidth={2} />
                <circle cx={hx - 7} cy={534} r={3} fill={INK} />
                <circle cx={hx + 7} cy={534} r={3} fill={INK} />
                <path d={`M ${hx - 11} 527 L ${hx - 3} 526 M ${hx + 3} 526 L ${hx + 11} 527`} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
                <path d={`M ${hx - 15} 546 Q ${hx} 574 ${hx + 15} 546 Z`} fill="#F2F0EA" stroke={INK} strokeWidth={2.5} />
                <ellipse cx={hx} cy={550} rx={3.5} ry={3 + Math.sin(f / 8 + i) * 1.5} fill={INK} />
              </g>
            ))}
            <Flame x={390} y={600} s={0.6} f={f} glow={0.6} />
          </g>
          {/* 途中の「待ってくれない側」(薄く) */}
          <g opacity={0.2 + 0.25 * passed(720)} transform="translate(720 690)">
            <path d="M -60 0 L -60 -90 L 60 -90 L 60 0" stroke={MP.woodDark} strokeWidth={8} fill="none" />
            <path d="M -76 -90 L 0 -130 L 76 -90 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
            <path d="M -24 -20 L -24 -64 Q -24 -80 0 -80 Q 24 -80 24 -64 L 24 -20 Z" fill={KRP.bronze} stroke={INK} strokeWidth={4} />
          </g>
          <g opacity={0.2 + 0.25 * passed(1010)} transform="translate(1010 700)">
            <rect x={-44} y={-150} width={88} height={150} fill={MP.stone} stroke={INK} strokeWidth={4} />
            <path d="M -54 -150 L 0 -196 L 54 -150 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
            <path d="M -18 -96 L -18 -126 Q 0 -140 18 -126 L 18 -96 Z" fill={MP.brass} stroke={INK} strokeWidth={3} />
            <rect x={-14} y={-60} width={28} height={40} fill={MP.night} stroke={INK} strokeWidth={3} />
          </g>
          <g opacity={0.2 + 0.25 * passed(1300)} transform="translate(1300 700)">
            <rect x={-80} y={-70} width={30} height={70} fill={MP.brick} stroke={INK} strokeWidth={4} />
            <rect x={50} y={-70} width={30} height={70} fill={MP.brick} stroke={INK} strokeWidth={4} />
            {[-36, -18, 0, 18, 36].map((bx) => <line key={bx} x1={bx} y1={0} x2={bx} y2={-56} stroke={MP.iron} strokeWidth={4} />)}
            <circle cx={0} cy={-100} r={28} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <path d="M 0 -100 L 0 -120 M 0 -100 L 14 -94" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          </g>
          {/* 音符の線 */}
          <path d={line} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${lp} 1`} />
          <path d={line} stroke={MP.glow} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${lp} 1`} />
          {[560, 840, 1150, 1440].map((nx, i) => head[0] > nx && (
            <MzJbNote key={nx} x={nx} y={520 + Math.sin(nx / 70) * 22 + Math.sin(f / 14 + i) * 6} s={0.55} len={110} f={f} phase={i} fill={MP.glow} />
          ))}
          {lp < 0.98 && <MzJbNote x={head[0]} y={head[1] + 20} s={0.8} len={60} f={f} fill={MP.glow} halo />}
          {/* 右端: スヌーズつきの目覚まし時計 */}
          {right > 1500 && (
            <g>
              <circle cx={CX} cy={BTN} r={70 + 8 * Math.sin(f / 6)} fill={MP.glow} opacity={0.35 * glow} />
              <circle cx={CX} cy={BTN} r={40} fill={MP.flameCore} opacity={0.5 * glow} />
              <BellClock x={CX} y={CY} s={0.7} f={f} snooze snoozePress={seg(f, 34, 37) * (1 - seg(f, 38, 42))} />
              <rect x={CX - 32} y={BTN - 10} width={64} height={18} rx={6} fill={MP.flameCore} opacity={0.6 * glow * (0.8 + 0.2 * Math.sin(f / 6))} />
            </g>
          )}
        </g>
        {/* 巻物の軸 */}
        {[120, right].map((rx, i) => (
          <g key={i}>
            <rect x={rx - 26} y={318} width={52} height={464} rx={20} fill={C.parchDark} stroke={INK} strokeWidth={6} />
            <line x1={rx - 8} y1={330} x2={rx - 8} y2={770} stroke={C.parchEdge} strokeWidth={5} />
            {[306, 794].map((ky) => <ellipse key={ky} cx={rx} cy={ky} rx={22} ry={16} fill={MP.woodDark} stroke={INK} strokeWidth={5} />)}
          </g>
        ))}
        {/* 年代札と矢印 */}
        <TagPlate x={260} y={MZJB_PLATE_Y209} text="6世紀" size={34} t={seg(f, 26, 34)} />
        <TagPlate x={960} y={MZJB_PLATE_Y209} text="1400年あまり" size={34} t={seg(f, 30, 38)} />
        <TagPlate x={1640} y={MZJB_PLATE_Y209} text="1955年" size={34} t={seg(f, 34, 42)} />
        {seg(f, 30, 38) > 0 && (
          <g opacity={seg(f, 30, 38)} stroke={KRP.white} strokeWidth={7} strokeLinecap="round" fill="none">
            <line x1={350} y1={MZJB_PLATE_Y209} x2={808} y2={MZJB_PLATE_Y209} />
            <line x1={1112} y1={MZJB_PLATE_Y209} x2={1520} y2={MZJB_PLATE_Y209} />
            <path d={`M 1500 ${MZJB_PLATE_Y209 - 16} L 1524 ${MZJB_PLATE_Y209} L 1500 ${MZJB_PLATE_Y209 + 16}`} />
            <path d={`M 372 ${MZJB_PLATE_Y209 - 16} L 348 ${MZJB_PLATE_Y209} L 372 ${MZJB_PLATE_Y209 + 16}`} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #210 人類は、寝坊する人を起こす道具と同じくらい、寝坊する人を待ってあげる仕組みも、作り続けてきたのです。
// 格: 図 / seed 6210
// どこ: 博物館の展示室 (えんじの壁・腰板・額の絵・天井のスポットライト・寄せ木の床)。真ん中のガラスケースに大きな真鍮の天秤。
//       木の台座の札「起こす道具」「待つ仕組み」。手前に赤いロープの柵。
// 演出: 左の皿に 鶏人の赤い冠・修道院の鈴・時の鐘の模型・ノッカー・アップの長い棒・BellClock・Clocky が順に載って左が下がる。
//       右の皿に ゆっくり伸びた音符・砂時計・スヌーズボタン が載り、最後のボタンでぐらぐら揺れて、ぴたりと水平 (針が真上)。
//       右の見学のおじいさん (白髪・口ひげ・つえ・男性) と孫娘 (おさげの茶色の髪・赤いスカート) が、顔を見合わせてにっこり。
// 動き: f2-22 左に道具が載る / f21-34 右に仕組みが載る / f29-42 揺れてつり合う / f38- 2人がにっこり / そのあとゆっくり寄る・きらきら
const MZJB_PLATE_Y210 = 794;
const MzJbCrown: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -20 -40 q 2 -26 13 -9 q 6 -24 15 -5 q 11 -16 11 7 Z" fill={KRP.red} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -38 0 Q -40 -42 0 -46 Q 40 -42 38 0 Z" fill={KRP.red} stroke={INK} strokeWidth={4} />
    <rect x={-40} y={-12} width={80} height={12} rx={4} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
    <path d="M -22 -34 Q -10 -40 4 -38" stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
  </g>
);
const MzJbBellModel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-6} width={80} height={8} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
    {[-30, 30].map((px) => <rect key={px} x={px - 4} y={-80} width={8} height={76} fill={MP.wood} stroke={INK} strokeWidth={3} />)}
    <path d="M -44 -78 L 0 -100 L 44 -78 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={3.5} />
    <path d="M -16 -16 L -16 -56 Q -16 -68 0 -68 Q 16 -68 16 -56 L 16 -16 Z" fill={KRP.bronze} stroke={INK} strokeWidth={3.5} />
    <path d="M -16 -40 L 16 -40 M -16 -28 L 16 -28" stroke={C.bronzeDark} strokeWidth={2.5} />
  </g>
);
const MzJbSnoozeBtn: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-20} r={70} fill={MP.glow} opacity={0.3 + 0.08 * Math.sin(f / 6)} />
    <rect x={-66} y={-14} width={132} height={16} rx={5} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
    <rect x={-54} y={-46} width={108} height={34} rx={11} fill={mixColor(MP.bell, KRP.white, 0.35)} stroke={INK} strokeWidth={5} />
    <path d="M -40 -38 L 40 -38" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
  </g>
);

const Mz210: React.FC<{ f: number }> = ({ f }) => {
  const dropAt = (t0: number) => easeOut(seg(f, t0, t0 + 5));
  const tL = [2, 6, 10, 14, 18, 22];
  const tR = [21, 25, 29];
  const wL = tL.reduce((a, t) => a + dropAt(t), 0) / 6;
  const wR = tR.reduce((a, t) => a + dropAt(t), 0) / 3;
  let th = 11 * wL - 11 * wR;
  if (f > 29) th += 7 * Math.sin((f - 29) * 0.75) * Math.exp(-(f - 29) / 4.5);
  const rad = (th * Math.PI) / 180;
  const PV: [number, number] = [960, 250];
  const L = 430;
  const Lend: [number, number] = [PV[0] - L * Math.cos(rad), PV[1] + L * Math.sin(rad)];
  const Rend: [number, number] = [PV[0] + L * Math.cos(rad), PV[1] - L * Math.sin(rad)];
  const HANG = 240;
  const lp: [number, number] = [Lend[0], Lend[1] + HANG];
  const rp: [number, number] = [Rend[0], Rend[1] + HANG];
  const fall = (t0: number) => -(1 - dropAt(t0)) * 170;
  const seen = (t0: number) => f >= t0;
  const happy = f >= 38;
  const k = 1 + 0.05 * seg(f, 44, 236);
  const pan = (p: [number, number], end: [number, number], items: React.ReactNode) => (
    <g>
      {[-150, 0, 150].map((dx) => <line key={dx} x1={end[0]} y1={end[1] + 12} x2={p[0] + dx} y2={p[1] - (dx === 0 ? 30 : 4)} stroke={MP.brassDark} strokeWidth={4} strokeDasharray="10 4" />)}
      <path d={`M ${p[0] - 160} ${p[1]} Q ${p[0]} ${p[1] + 66} ${p[0] + 160} ${p[1]} Z`} fill={MP.brass} stroke={INK} strokeWidth={6} />
      <g transform={`translate(${p[0]} ${p[1]})`}>{items}</g>
      <ellipse cx={p[0]} cy={p[1]} rx={160} ry={16} fill="none" stroke={INK} strokeWidth={5} />
      <path d={`M ${p[0] - 140} ${p[1] + 10} Q ${p[0] - 60} ${p[1] + 34} ${p[0] - 10} ${p[1] + 36}`} stroke={MP.brassLight} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <Frame f={f} seed={6210} bg={C.museumWallDark}>
      <g transform={cam(1000, 800, k, 1000, 800)}>
        {/* 展示室の壁・腰板・額 */}
        <rect x={-260} y={-160} width={2440} height={990} fill={C.museumWall} />
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-260 + i * 96} y={-160} width={10} height={760} fill={C.museumWallDark} opacity={0.35} />)}
        <rect x={-260} y={600} width={2440} height={230} fill={C.wainscot} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-230 + i * 200} y={630} width={170} height={170} rx={6} fill="none" stroke={MP.woodDark} strokeWidth={4} opacity={0.7} />)}
        {[[80, 200], [1700, 180]].map(([fx, fy], i) => (
          <g key={i}>
            <rect x={fx} y={fy} width={170} height={210} fill={MP.brass} stroke={INK} strokeWidth={6} />
            <rect x={fx + 16} y={fy + 16} width={138} height={178} fill={i ? MP.dawnSoft : MP.mist} stroke={INK} strokeWidth={3} />
            {i === 0
              ? <path d={`M ${fx + 16} ${fy + 194} L ${fx + 70} ${fy + 110} L ${fx + 100} ${fy + 150} L ${fx + 154} ${fy + 90} L ${fx + 154} ${fy + 194} Z`} fill={KRP.green} stroke={INK} strokeWidth={3} />
              : <circle cx={fx + 85} cy={fy + 110} r={36} fill={MP.dawn} stroke={INK} strokeWidth={3} />}
          </g>
        ))}
        <rect x={-260} y={-160} width={2440} height={150} fill={C.museumWallDark} />
        {/* スポットライト */}
        <rect x={930} y={-20} width={60} height={50} rx={8} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <polygon points="920,30 1000,30 1440,830 480,830" fill={MP.glow} opacity={0.16} />
        {/* 床 (寄せ木) */}
        <rect x={-260} y={830} width={2440} height={420} fill={C.desk} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-260 + i * 90} y1={830} x2={-300 + i * 90} y2={1250} stroke={C.deskDark} strokeWidth={4} />)}
        {[900, 980, 1080].map((ly) => <line key={ly} x1={-260} y1={ly} x2={2180} y2={ly} stroke={C.deskDark} strokeWidth={3} />)}
        <ellipse cx={960} cy={860} rx={720} ry={30} fill={MP.glow} opacity={0.15} />
        {/* 台座 */}
        <rect x={300} y={740} width={1320} height={110} fill={C.deskDark} stroke={INK} strokeWidth={6} />
        <rect x={290} y={728} width={1340} height={20} fill={C.deskLight} stroke={INK} strokeWidth={5} />
        {/* 天秤の柱と台 */}
        <path d="M 860 728 L 900 690 L 1020 690 L 1060 728 Z" fill={MP.brass} stroke={INK} strokeWidth={5} />
        <rect x={944} y={250} width={32} height={444} fill={MP.brass} stroke={INK} strokeWidth={5} />
        {[340, 480, 620].map((ry) => <rect key={ry} x={934} y={ry} width={52} height={16} rx={6} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} />)}
        <line x1={952} y1={262} x2={952} y2={680} stroke={MP.brassLight} strokeWidth={5} opacity={0.7} />
        {/* つり合いの目盛りと針 */}
        <path d="M 900 186 A 70 70 0 0 1 1020 186" stroke={INK} strokeWidth={5} fill="none" />
        {[-30, -15, 0, 15, 30].map((a) => <line key={a} x1={960} y1={176} x2={960} y2={190} stroke={INK} strokeWidth={a === 0 ? 5 : 3} transform={`rotate(${a} 960 250)`} />)}
        <g transform={`rotate(${-th} 960 250)`}>
          <path d="M 954 250 L 960 186 L 966 250 Z" fill={KRP.red} stroke={INK} strokeWidth={3} />
        </g>
        {/* 皿 */}
        {pan(lp, Lend, (
          <g>
            {seen(2) && <MzJbCrown x={-112} y={fall(2) - 2} s={0.95} />}
            {seen(6) && <MzJbHandBell x={-40} y={fall(6) - 72} s={0.95} hand={false} />}
            {seen(10) && <MzJbBellModel x={30} y={fall(10) - 2} s={0.95} />}
            {seen(14) && (
              <g transform={`translate(0 ${fall(14)})`}>
                <line x1={-200} y1={-36} x2={170} y2={-120} stroke={INK} strokeWidth={14} strokeLinecap="round" />
                <line x1={-200} y1={-36} x2={170} y2={-120} stroke={MP.woodLight} strokeWidth={7} strokeLinecap="round" />
                {[-30, -12, 6, 22].map((a) => <line key={a} x1={170} y1={-120} x2={170 + 24 * Math.cos((a * Math.PI) / 180)} y2={-120 - 24 * Math.sin(((a + 30) * Math.PI) / 180)} stroke={KRP.silver} strokeWidth={4} strokeLinecap="round" />)}
              </g>
            )}
            {seen(18) && <BellClock x={104} y={fall(18) - 54} s={0.3} f={f} />}
            {seen(22) && <Clocky x={-80} y={fall(22) - 90} s={0.27} f={f} face="normal" />}
          </g>
        ))}
        {pan(rp, Rend, (
          <g>
            {seen(21) && <MzJbNote x={-96} y={fall(21) - 14} s={0.85} len={130} f={f} fill={MP.glow} halo />}
            {seen(25) && <MzJbHourglass x={50} y={fall(25) - 58} s={0.9} f={f} />}
            {seen(29) && <MzJbSnoozeBtn x={40} y={fall(29) - 110} s={0.8} f={f} />}
          </g>
        ))}
        {/* さお */}
        <g transform={`rotate(${-th} 960 250)`}>
          <rect x={530} y={240} width={860} height={20} rx={10} fill={MP.brass} stroke={INK} strokeWidth={5} />
          <line x1={550} y1={246} x2={1370} y2={246} stroke={MP.brassLight} strokeWidth={4} />
          {[530, 1390].map((ex) => <circle key={ex} cx={ex} cy={250} r={14} fill={MP.brassDark} stroke={INK} strokeWidth={4} />)}
        </g>
        <circle cx={960} cy={250} r={20} fill={MP.brassDark} stroke={INK} strokeWidth={5} />
        <path d="M 948 232 L 960 196 L 972 232 Z" fill={MP.brass} stroke={INK} strokeWidth={4} />
        {/* つり合ったきらきら */}
        {f > 40 && [0, 1, 2, 3].map((i) => {
          const t = ((f - 40) / 30 + i / 4) % 1;
          const a = i * 1.7 + 0.4;
          return <path key={i} d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={MP.glow} stroke={INK} strokeWidth={2}
            transform={`translate(${960 + Math.cos(a) * (60 + t * 40)} ${200 + Math.sin(a) * (40 + t * 30)}) scale(${Math.sin(t * Math.PI)})`} />;
        })}
        {/* ガラスケース */}
        <rect x={330} y={90} width={1260} height={640} fill={C.glass} opacity={0.1} stroke={INK} strokeWidth={6} />
        {[[400, 700, 560, 120], [470, 700, 630, 120], [1380, 700, 1540, 120]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.white} strokeWidth={i === 1 ? 6 : 12} opacity={0.22} />
        ))}
        {[[330, 90], [1590, 90]].map(([cx, cy]) => <rect key={cx} x={cx - 12} y={cy - 12} width={24} height={24} fill={MP.brass} stroke={INK} strokeWidth={3} />)}
        <TagPlate x={540} y={MZJB_PLATE_Y210} text="起こす道具" size={30} t={seg(f, 2, 10)} />
        <TagPlate x={1380} y={MZJB_PLATE_Y210} text="待つ仕組み" size={30} t={seg(f, 20, 28)} />
        {/* ロープの柵 */}
        {[[380, 960], [960, 1500]].map(([a, b]) => (
          <path key={a} d={`M ${a} 846 Q ${(a + b) / 2} 900 ${b} 846`} stroke={INK} strokeWidth={20} fill="none" />
        ))}
        {[[380, 960], [960, 1500]].map(([a, b]) => (
          <path key={`v${a}`} d={`M ${a} 846 Q ${(a + b) / 2} 900 ${b} 846`} stroke={C.velvet} strokeWidth={12} fill="none" />
        ))}
        {[380, 960, 1500].map((px) => (
          <g key={px}>
            <ellipse cx={px} cy={940} rx={34} ry={10} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
            <rect x={px - 6} y={836} width={12} height={104} fill={MP.brass} stroke={INK} strokeWidth={3.5} />
            <circle cx={px} cy={832} r={12} fill={MP.brass} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {/* 見学のおじいさんと孫娘 */}
        <ellipse cx={1690} cy={960} rx={180} ry={20} fill={INK} opacity={0.25} />
        <MzJbFig x={1610} y={935} s={0.72} f={f} phase={3} cloth={C.pink} clothDark={C.trouser} hair="none"
          face={happy ? (f > 90 ? "joy" : "smile") : "surprised"} gaze={happy ? [7, -6] : [-7, -5]}
          lean={happy ? 3 : 0}
          under={<>
            {[-1, 1].map((sd) => (
              <g key={sd}>
                {[0, 1, 2].map((j) => <circle key={j} cx={sd * (64 + j * 4)} cy={-214 + j * 26} r={13} fill={C.hairBrown} stroke={INK} strokeWidth={3.5} />)}
                <path d={`M ${sd * 72 - 10} -150 L ${sd * 72 + 10} -150 L ${sd * 72} -138 Z`} fill={KRP.red} stroke={INK} strokeWidth={3} />
              </g>
            ))}
          </>}
          over={<>
            <path d="M -65 -236 Q -66 -298 0 -300 Q 66 -298 65 -236 Q 40 -260 4 -258 Q -30 -262 -65 -236 Z" fill={C.hairBrown} stroke={INK} strokeWidth={4} />
            <path d="M -52 -76 L 52 -76 L 72 -26 L -72 -26 Z" fill={KRP.red} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -30 -72 L -40 -30 M 0 -72 L 0 -28 M 30 -72 L 40 -30" stroke={MP.bellDark} strokeWidth={3} />
          </>} />
        <MzJbFig x={1780} y={962} s={1.1} f={f} phase={1} cloth={C.cardigan} clothDark={C.trouser} hair="none"
          face={happy ? (f > 90 ? "joy" : "smile") : "normal"} gaze={happy ? [-7, 6] : [-7, -4]} lean={happy ? -3 : 0}
          over={<>
            <path d="M -65 -236 Q -65 -293 0 -296 Q 65 -293 65 -236 Q 58 -264 30 -273 Q 0 -279 -30 -273 Q -58 -264 -65 -236 Z" fill={C.hairWhite} stroke={INK} strokeWidth={3.5} />
            <path d="M -28 -198 Q -14 -208 0 -199 Q 14 -208 28 -198 Q 14 -190 0 -193 Q -14 -190 -28 -198 Z" fill={C.hairWhite} stroke={INK} strokeWidth={3} />
            {[-130, -106, -82].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={C.cardiganDark} stroke={INK} strokeWidth={2} />)}
            <line x1={0} y1={-160} x2={0} y2={-56} stroke={C.cardiganDark} strokeWidth={4} />
            <path d="M 67 -62 L 86 0" stroke={INK} strokeWidth={12} strokeLinecap="round" />
            <path d="M 67 -62 L 86 0" stroke={MP.woodDark} strokeWidth={7} strokeLinecap="round" />
            <path d="M 52 -66 Q 66 -80 82 -66" stroke={MP.woodDark} strokeWidth={8} fill="none" strokeLinecap="round" />
            <circle cx={67} cy={-62} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
          </>} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #211 明日の朝、スヌーズを押したら、思い出してください。
// 格: 山 / seed 6211
// どこ: あなたの寝室 (Shinshitsu, sky=1→1.25, sleeper=1)。翌朝の夜明け。ナイトテーブルに BellClock (snooze)。
// 演出: 鳴る時計に、布団からあなたの腕 (水色のパジャマの袖) がにゅっと伸びて、スヌーズボタンをぽちっ。時計が止まる。
//       押した指先から光の音符がひとつ浮かび、カーテンのあいだの朝日へのぼっていく。あなたは目を閉じたまま口元がゆるむ。
// 動き: f0-24 時計が鳴る (あなたは眉をしかめる) / f6-23 腕が伸びる / f23-27 ぽちっ・止まる / f26-105 音符がのぼる /
//       f36-50 口元がゆるむ / f44-70 腕が布団へもどる / f0-120 カメラが時計の大写しから部屋全体へ引く
const Mz211: React.FC<{ f: number }> = ({ f }) => {
  const t = easeInOut(seg(f, 0, 120));
  const k = lerp(2.3, 1, t);
  const P: [number, number] = [lerp(1235, 960, t), lerp(570, 540, t)];
  const ring = 1 - seg(f, 23, 26);
  const press = seg(f, 23, 26) * (1 - seg(f, 34, 38));
  const CX = 1340, CY = 576, S = 0.42;
  const BTN: [number, number] = [CX, CY - S * 116];
  const reach = easeOut(seg(f, 6, 23));
  const back = easeInOut(seg(f, 44, 70));
  const H0: [number, number] = [1000, 612];
  const H1: [number, number] = [BTN[0] - 14, BTN[1] - 14];
  const H2: [number, number] = [1120, 640];
  const hand: [number, number] = back > 0 ? [lerp(H1[0], H2[0], back), lerp(H1[1], H2[1], back)] : [lerp(H0[0], H1[0], reach), lerp(H0[1], H1[1], reach)];
  const elbow: [number, number] = [(990 + hand[0]) / 2, Math.min(616, hand[1]) - 24 * reach * (1 - back)];
  const n = easeInOut(seg(f, 26, 105));
  const nq = (a: number, b: number, c: number) => (1 - n) * (1 - n) * a + 2 * (1 - n) * n * b + n * n * c;
  const note: [number, number] = [nq(BTN[0], 1180, 884), nq(BTN[1] - 20, 230, 360)];
  const smile = easeOut(seg(f, 36, 50));
  const breathe = Math.sin(f / 21) * 5;
  return (
    <Frame f={f} seed={6211}>
      <g transform={cam(P[0], P[1], k)}>
        <Shinshitsu f={f} sky={lerp(1, 1.25, seg(f, 60, 122))} sleeper={1} alarms={0} head={false} />
        {f >= 40 && <MzJbZzz f={f} x={1000} y={520} opacity={seg(f, 40, 60)} />}
        {/* 時計の光 (鳴っているあいだ) */}
        {ring > 0 && <circle cx={CX} cy={CY - 20} r={120} fill={MP.glow} opacity={0.18 * ring + 0.06 * Math.sin(f)} />}
        <BellClock x={CX} y={CY} s={S} f={f} ring={ring} snooze snoozePress={press} />
        {/* ぽちっ */}
        {f >= 23 && f < 34 && (
          <g opacity={1 - seg(f, 28, 34)} stroke={INK} strokeWidth={3} strokeLinecap="round">
            {[-60, -20, 20, 60].map((a) => (
              <line key={a} x1={BTN[0]} y1={BTN[1] - 18} x2={BTN[0]} y2={BTN[1] - 34} transform={`rotate(${a} ${BTN[0]} ${BTN[1]})`} />
            ))}
          </g>
        )}
        {/* 布団から伸びる腕 */}
        {(reach > 0.02 && back < 0.98) && (
          <g>
            <path d={`M 990 ${616 - breathe} Q ${elbow[0]} ${elbow[1]} ${hand[0]} ${hand[1]}`} stroke={INK} strokeWidth={31} fill="none" strokeLinecap="round" />
            <path d={`M 990 ${616 - breathe} Q ${elbow[0]} ${elbow[1]} ${hand[0]} ${hand[1]}`} stroke={MP.you} strokeWidth={21} fill="none" strokeLinecap="round" />
            <rect x={hand[0] + 2} y={hand[1] - 2} width={20} height={9} rx={4.5} fill={KRP.white} stroke={INK} strokeWidth={3}
              transform={`rotate(32 ${hand[0]} ${hand[1]})`} />
            <circle cx={hand[0]} cy={hand[1]} r={13} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <path d={`M 990 ${600 - breathe} Q 1000 ${620 - breathe} 996 ${636 - breathe}`} stroke="#EFC46A" strokeWidth={14} fill="none" strokeLinecap="round" />
          </g>
        )}
        <MzJbBedHead f={f} mode={f < 24 ? "frown" : f < 36 ? "sleep" : "smile"} smile={smile} />
        {/* 光の音符 (指先から朝日へ) */}
        {f >= 26 && n < 0.995 && (
          <g>
            {[0.04, 0.08, 0.12].map((d, i) => {
              const m = Math.max(0, n - d);
              const q = (a: number, b: number, c: number) => (1 - m) * (1 - m) * a + 2 * (1 - m) * m * b + m * m * c;
              return <circle key={i} cx={q(BTN[0], 1180, 884)} cy={q(BTN[1] - 20, 230, 360)} r={7 - i * 2} fill={MP.glow} opacity={0.8 - i * 0.2} />;
            })}
            <MzJbNote x={note[0]} y={note[1]} s={0.5 + 0.1 * Math.sin(f / 6)} len={70} f={f} fill={MP.glow} halo />
          </g>
        )}
        {n > 0.95 && <circle cx={884} cy={360} r={90 + 20 * Math.sin(f / 5)} fill={MP.glow} opacity={0.3 * seg(f, 100, 112)} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #212 それは、1500年前から続く、やさしさです。
// 格: 山 / seed 6212
// どこ: あなたの寝室 (Shinshitsu, sky=1.15→1.9, sleeper=1) の続き。天井近くに #211 の光の音符がただよう。
// 演出: 天井と壁に、うっすら石のアーチ (Shudouin を半透明で上半分だけ) が重なる。ベッドの向こうに半透明の修道士
//       (若い修道士・白いひげの年上・院長) が並び、ゆっくり伸びた音符で歌いながら静かに待つ。院長はろうそくを
//       あなたの寝顔へそっと差し出し、その光が朝日と同じ色になって寝顔を照らす。あなたは寝返りをうってすやすや (smile)。
//       ナイトテーブルの BellClock のスヌーズボタンがぽうっと光る。
// 動き: f0-16 石のアーチの影が重なる / f8-26 修道士の影が現れて歌う / f20-40 ろうそくの光と朝日が重なる /
//       f26-38 寝返り / f92-124 影がゆっくり溶けて元の寝室にもどる
const Mz212: React.FC<{ f: number }> = ({ f }) => {
  const ghost = easeOut(seg(f, 0, 16)) * (1 - easeInOut(seg(f, 96, 124)));
  const monkO = easeOut(seg(f, 8, 26)) * (1 - easeInOut(seg(f, 92, 120))) * 0.62;
  const light = easeOut(seg(f, 20, 40));
  const roll = easeInOut(seg(f, 26, 38));
  const sky = lerp(1.15, 1.9, seg(f, 0, 126));
  const CX = 1340, CY = 576, S = 0.42;
  const k = 1.12 - 0.06 * easeInOut(seg(f, 0, 126));
  return (
    <Frame f={f} seed={6212}>
      <g transform={cam(1000, 470, k)}>
        <Shinshitsu f={f} sky={sky} sleeper={1} alarms={0} head={false} />
        {/* 石のアーチの影 (上半分だけ・半透明) */}
        <clipPath id="mzjb212up"><rect x={-40} y={-40} width={2000} height={680} /></clipPath>
        <g clipPath="url(#mzjb212up)" opacity={0.3 * ghost}>
          <Shudouin f={f} dark={0.3} candle={2} bell={0} />
        </g>
        {/* 半透明の修道士 (ベッドの向こうに立つ) */}
        <clipPath id="mzjb212bed"><rect x={-40} y={-40} width={2000} height={668} /></clipPath>
        <g clipPath="url(#mzjb212bed)" opacity={monkO}>
          <MzJbMonk x={470} y={712} s={0.88} f={f} kind="young" phase={1} sing={0.5 + 0.3 * Math.sin(f / 12)} face="smile" />
          <MzJbMonk x={630} y={698} s={0.95} f={f} kind="old" phase={2} closed sing={0.5 + 0.3 * Math.sin(f / 12 + 1)} />
          <MzJbMonk x={870} y={690} s={0.95} f={f} kind="abbot" phase={3} pose="banzai" face="smile" gaze={[7, 3]}
            bell={<MzJbHandBell x={-120} y={-214} s={0.75} rot={Math.sin(f / 9) * 4} />}
            extra={<MzJbHeldCandle x={120} y={-214} f={f} phase={1} glow={1.3} />} />
        </g>
        {/* ゆっくり伸びた音符 (天井の近く) */}
        {[0, 1, 2, 3].map((i) => (
          <MzJbNote key={i} x={360 + i * 260 + ((f * 0.6) % 80)} y={190 + Math.sin(f / 18 + i) * 14 + (i % 2) * 70}
            len={150} s={0.7} f={f} phase={i} fill={MP.glow} opacity={monkO * 1.4} />
        ))}
        <MzJbNote x={900 + Math.sin(f / 20) * 20} y={170} s={0.55} len={70} f={f} fill={MP.glow} halo opacity={0.6 + 0.4 * (1 - ghost)} />
        {/* 朝日の筋と、ろうそくの光が寝顔で重なる */}
        <polygon points="850,330 912,330 1100,620 1010,640" fill={MP.glow} opacity={0.22 * light} />
        <circle cx={1050} cy={592} r={lerp(40, 150, light)} fill={mixColor(MP.glow, MP.dawnSoft, roll)} opacity={0.38 * light} />
        <MzJbBedHead f={f} rot={lerp(80, 98, roll)} x={1062 - 6 * roll} mode={f < 30 ? "sleep" : "smile"} smile={easeOut(seg(f, 30, 42))} />
        {roll > 0 && roll < 1 && [0, 1].map((i) => (
          <path key={i} d={`M ${960 + i * 20} ${590 - i * 14} q 12 -8 24 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={1 - roll} />
        ))}
        {f > 44 && <MzJbZzz f={f} x={1000} y={520} opacity={0.7} />}
        {/* スヌーズボタンが温かく光る */}
        <circle cx={CX} cy={CY - S * 116} r={44 + 6 * Math.sin(f / 6)} fill={MP.glow} opacity={0.35 + 0.1 * Math.sin(f / 6)} />
        <BellClock x={CX} y={CY} s={S} f={f} snooze />
        <rect x={CX - 18} y={CY - S * 116 - 5} width={36} height={8} rx={3} fill={MP.flameCore} opacity={0.7} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #213 ただし、会社の始業時刻は、たぶん、待ってくれません。
// 格: 山 / seed 6213
// どこ: 前半 あなたの寝室 (Shinshitsu, sky=2・壁の時計は8:50)、後半 会社の門 (KoujouMon company: 灰色の外壁・銀の鉄の門・門の上の大時計)。
// 演出: 前半、寝顔の目がぱっと開き、布団をはね飛ばしてベッドの上で跳ね起きる (surprised・両手を上げる)。
//       ホイップ・パンで後半へ。ガラガラ閉まっていく門の前を、水色のパジャマのまま、右手に食パン・左手にかばんを
//       持って全力ダッシュ (残像)。針がカチッと 9:00 を指し、門はあと一歩で閉まる。あなたは後ろ姿で鉄格子をつかんで
//       顔を押しつけ、かばんと食パンが落ちる。右の守衛さん (紺の制服・帽子・男性) が腕時計を見て、ゆっくり首を横に振る。札「始業」。
// 動き: f0-13 目が開いて跳ね起きる / f9-20 ホイップ・パン / f16-40 門が閉まる・ダッシュ / f38 針がカチッ / f40- 格子に顔を押しつける /
//       f40- 守衛が首を振る (約19コマごとに左右) / f42- カメラがゆっくり寄る
const Mz213: React.FC<{ f: number }> = ({ f }) => {
  const whipOut = Math.pow(seg(f, 9, 14), 2);
  const whipIn = 1 - easeOut(seg(f, 14, 20));
  const streak = seg(f, 8, 13) * (1 - seg(f, 15, 21));
  // 後半
  const gate = 1 - Math.pow(seg(f, 16, 40), 2);
  const e = seg(f, 16, 40);
  const runX = lerp(-160, 860, e);
  const atGate = f >= 40;
  const hit = seg(f, 40, 44) * (1 - seg(f, 46, 54));
  const shake = Math.sin(f / 6);
  const drop = easeOut(seg(f, 40, 52));
  const k = 1 + 0.05 * seg(f, 42, 145);
  return (
    <Frame f={f} seed={6213} bg={KRP.grayDark}>
      {f < 14 ? (
        <g transform={`translate(${-whipOut * 900} 0)`}>
          <Shinshitsu f={f} sky={2} sleeper={f < 5 ? 1 : 0} alarms={0} head={false} time={8 * 60 + 50} />
          {f < 5 && <MzJbBedHead f={f} mode={f < 2 ? "sleep" : "surprised"} />}
          {f >= 5 && (
            <g>
              <MzJbYou x={820} y={650 - 70 * Math.sin(Math.PI * seg(f, 5, 13))} s={1} f={f} pose="banzai" face="surprised" gaze={[7, -6]} />
              {/* はね飛んだ布団 */}
              <g transform={`translate(${lerp(640, 380, easeOut(seg(f, 4, 12)))} ${lerp(640, 300, easeOut(seg(f, 4, 12)))}) rotate(${-26 * seg(f, 4, 12)})`}>
                <path d="M -260 -60 Q 0 -100 260 -60 L 240 60 Q 0 90 -240 60 Z" fill="#EFC46A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
                {[-160, -60, 40, 140].map((lx) => <line key={lx} x1={lx} y1={-74} x2={lx + 6} y2={70} stroke="#C99A3E" strokeWidth={4} opacity={0.6} />)}
              </g>
            </g>
          )}
          {/* 壁の時計の「!」 */}
          {f >= 3 && (
            <g stroke={INK} strokeWidth={6} strokeLinecap="round">
              {[-50, 0, 50].map((a) => <line key={a} x1={1360} y1={130} x2={1360} y2={100} transform={`rotate(${a} 1360 250)`} />)}
            </g>
          )}
        </g>
      ) : (
        <g transform={`translate(${whipIn * 900} 0)`}>
          <g transform={cam(960, 700, k, 960, 700)}>
            <KoujouMon f={f} company gate={gate} hands={f < 38 ? 8 * 60 + 59 : 9 * 60} sky={1.7} />
            {/* 針がカチッ */}
            {f >= 38 && f < 52 && (
              <g opacity={1 - seg(f, 44, 52)} stroke={INK} strokeWidth={6} strokeLinecap="round">
                {[-70, -35, 0, 35, 70].map((a) => <line key={a} x1={960} y1={140} x2={960} y2={112} transform={`rotate(${a} 960 300)`} />)}
              </g>
            )}
            <TagPlate x={960} y={586} text="始業" size={34} t={seg(f, 38, 44)} color={MP.bellDark} />
            {/* 守衛さん */}
            <ellipse cx={1480} cy={980} rx={90} ry={16} fill={INK} opacity={0.3} />
            <MzJbFig x={1480} y={978} s={1.1} f={f} phase={2} pose="hold" cloth={C.navy} clothDark={C.navyDark}
              face={atGate ? "worried" : "normal"} gaze={atGate ? [shake > 0 ? 7 : -7, 0] : [-2, 7]} lean={atGate ? shake * 3 : 0}
              over={<>
                <path d="M -60 -262 Q -58 -320 0 -324 Q 58 -320 60 -262 Z" fill={C.navy} stroke={INK} strokeWidth={5} />
                <path d="M -70 -262 Q 0 -246 70 -262 Q 40 -240 -64 -250 Z" fill={C.navyDark} stroke={INK} strokeWidth={4} />
                <path d="M 0 -306 l 6 10 l 10 2 l -8 8 l 2 10 l -10 -5 l -10 5 l 2 -10 l -8 -8 l 10 -2 Z" fill={MP.brass} stroke={INK} strokeWidth={2} />
                <circle cx={-14} cy={-128} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                <circle cx={-14} cy={-128} r={6} fill={MP.brassLight} stroke={INK} strokeWidth={2} />
                <rect x={36} y={-140} width={14} height={20} rx={3} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
              </>} />
            {atGate && [-1, 1].map((sd) => (
              <path key={sd} d={`M ${1480 + sd * 96} ${700} q ${sd * 14} -14 0 -30`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
            ))}
            {/* ダッシュするあなた (残像つき) */}
            {!atGate && f >= 16 && (
              <g>
                {[3, 2, 1].map((i) => (
                  <MzJbYou key={i} x={runX - i * 90} y={975} s={1.1} f={f} pose="run" face="surprised" opacity={0.32 - i * 0.08} still />
                ))}
                {[0, 1, 2, 3].map((i) => (
                  <line key={`l${i}`} x1={runX - 140 - i * 30} y1={760 + i * 50} x2={runX - 320 - i * 30} y2={760 + i * 50} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
                ))}
                <MzJbYou x={runX} y={975} s={1.1} f={f} pose="run" face="surprised" gaze={[6, -4]} lean={-6}
                  over={<>
                    {/* 右手 (前) に食パン */}
                    <g transform="translate(150 -200) rotate(-12)">
                      <path d="M -26 30 L -26 -6 Q -34 -30 0 -32 Q 34 -30 26 -6 L 26 30 Z" fill={C.breadCrust} stroke={INK} strokeWidth={4} />
                      <path d="M -18 24 L -18 -4 Q -24 -22 0 -24 Q 24 -22 18 -4 L 18 24 Z" fill={C.bread} />
                    </g>
                    <circle cx={139} cy={-186} r={12} fill={KRP.white} stroke={INK} strokeWidth={4} />
                    {/* 左手 (後ろ) にかばん */}
                    <g transform="translate(-126 -60)">
                      <path d="M -16 -26 Q -16 -40 0 -40 Q 16 -40 16 -26" stroke={INK} strokeWidth={6} fill="none" />
                      <rect x={-46} y={-26} width={92} height={64} rx={8} fill={C.bag} stroke={INK} strokeWidth={4.5} />
                      <rect x={-10} y={-8} width={20} height={12} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
                    </g>
                    <circle cx={-118} cy={-83} r={12} fill={KRP.white} stroke={INK} strokeWidth={4} />
                  </>} />
              </g>
            )}
            {/* 門に間に合わなかった: 後ろ姿で格子に顔を押しつける */}
            {atGate && (
              <g>
                <ellipse cx={940} cy={975} rx={90} ry={16} fill={INK} opacity={0.3} />
                <MzJbYouBack x={940} y={968} s={1.1} f={f} squash={hit} />
                {hit > 0 && [-1, 1].map((sd) => (
                  <path key={sd} d={`M ${940 + sd * 90} 660 l ${sd * 30} -20 M ${940 + sd * 96} 700 l ${sd * 36} 0`} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={hit} />
                ))}
                {/* 落ちたかばんと食パン */}
                <g transform={`translate(${lerp(1080, 1110, drop)} ${lerp(850, 952, drop)}) rotate(${drop * 8})`}>
                  <path d="M -16 -26 Q -16 -40 0 -40 Q 16 -40 16 -26" stroke={INK} strokeWidth={6} fill="none" />
                  <rect x={-46} y={-26} width={92} height={64} rx={8} fill={C.bag} stroke={INK} strokeWidth={4.5} />
                  <rect x={-10} y={-8} width={20} height={12} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
                </g>
                <g transform={`translate(${lerp(820, 760, drop)} ${lerp(740, 972, drop)}) rotate(${-drop * 160})`}>
                  <path d="M -26 30 L -26 -6 Q -34 -30 0 -32 Q 34 -30 26 -6 L 26 30 Z" fill={C.breadCrust} stroke={INK} strokeWidth={4} />
                  <path d="M -18 24 L -18 -4 Q -24 -22 0 -24 Q 24 -22 18 -4 L 18 24 Z" fill={C.bread} />
                </g>
              </g>
            )}
          </g>
        </g>
      )}
      {/* ホイップ・パンの流れ線 */}
      {streak > 0.01 && (
        <g opacity={streak}>
          <rect x={0} y={0} width={1920} height={1080} fill={KRP.white} opacity={0.35} />
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1={-100 + rnd(213, i) * 600} y1={40 + i * 66} x2={900 + rnd(214, i) * 1100} y2={40 + i * 66}
              stroke={i % 3 ? KRP.gray : INK} strokeWidth={8 + (i % 4) * 4} strokeLinecap="round" opacity={0.6} />
          ))}
        </g>
      )}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_204: (f) => <Mz204 f={f} />,
  mz_205: (f) => <Mz205 f={f} />,
  mz_206: (f) => <Mz206 f={f} />,
  mz_207: (f) => <Mz207 f={f} />,
  mz_208: (f) => <Mz208 f={f} />,
  mz_209: (f) => <Mz209 f={f} />,
  mz_210: (f) => <Mz210 f={f} />,
  mz_211: (f) => <Mz211 f={f} />,
  mz_212: (f) => <Mz212 f={f} />,
  mz_213: (f) => <Mz213 f={f} />,
};

export const MZ_JB_MOTIFS: string[] = [
  "mz_204", // #204
  "mz_205", // #205
  "mz_206", // #206
  "mz_207", // #207
  "mz_208", // #208
  "mz_209", // #209
  "mz_210", // #210
  "mz_211", // #211
  "mz_212", // #212
  "mz_213", // #213
];

export const mezaJbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
