// 人は、なぜ暇をつぶすのか: 文#71〜#82 (12文)
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
  // 港・空・海
  skyDay: "#BFDDEB",
  skyLow: "#F1E7C8",
  sea: "#5E8FB0",
  seaDark: "#3F6E8E",
  seaLight: "#8DB7D0",
  hill: "#8FA878",
  hillDark: "#6E8A5C",
  // 建物
  brick: "#B5603F",
  brickDark: "#8A4530",
  mortar: "#D9C2A0",
  plaster: "#EFE6D2",
  shoji: "#F6F0DE",
  woodWall: "#C9A274",
  woodPanel: "#B88E5E",
  woodDark: "#8E6640",
  woodDeep: "#5E4028",
  roofTile: "#5B5F6A",
  roofTileDark: "#43464F",
  stone: "#B9B2A4",
  stoneDark: "#948C7E",
  iron: "#4A4E55",
  // 人の服
  stripeBlue: "#6F8FC4",
  stripeBlueDark: "#3E5E92",
  stripeBrown: "#A87650",
  stripeBrownDark: "#6E4A2E",
  apron: "#EDE6D2",
  obi: "#B8473A",
  tasuki: "#D96A5A",
  official: "#34313A",
  officialDark: "#211F26",
  suit: "#6E6A62",
  suitDark: "#4E4A44",
  sailor: "#EEF2F6",
  sailorStripe: "#3F5F9A",
  // 光・煙・夜
  smoke: "#9A948E",
  smokeLight: "#C8C2BA",
  dusk: "#E9A070",
  night: "#2C3358",
  nightDeep: "#1E2340",
  gas: "#FFD27A",
  // 黒板・展示
  board: "#3E5A4A",
  boardDark: "#2E463A",
  chalk: "#F2F0E6",
  museumWall: "#6E3A34",
  museumWallDark: "#52292A",
  glass: "#DDEEF2",
  // 和柄・西洋の色
  aizome: "#2F4F86",
  shu: "#C8503C",
  westRed: "#C23B33",
  westBlue: "#2D4E8E",
  // 暦・紙
  paperOld: "#EADCB8",
  paperOldDark: "#CDB98C",
  fish: "#9FB4C4",
  cat: "#E8A85C",
  catDark: "#B97A38",
  gift: "#E56B7A",
  giftRibbon: "#F2CE4C",
  spring: "#9AA2AA",
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

// 2つの色 (#RRGGBB) を混ぜる
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const tt = clamp01(t);
  return "#" + pa.map((v, k) => Math.round(lerp(v, pb[k], tt)).toString(16).padStart(2, "0")).join("");
};

// カメラ (中心 cx,cy を軸に拡大・平行移動)
const Cam: React.FC<{ sc?: number; dx?: number; dy?: number; cx?: number; cy?: number; children?: React.ReactNode }> = ({
  sc = 1, dx = 0, dy = 0, cx = 960, cy = 540, children,
}) => <g transform={`translate(${cx + dx} ${cy + dy}) scale(${sc}) translate(${-cx} ${-cy})`}>{children}</g>;

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";

// 煙 (煙突・汽船)。下から上へ、右へ流れる
const HmDbSmoke: React.FC<{ x: number; y: number; f: number; s?: number; color?: string; n?: number; drift?: number }> = ({
  x, y, f, s = 1, color = C.smoke, n = 6, drift = 70,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = ((f * 0.9 + i * (84 / n)) % 84) / 84;
      const cx = x + (Math.sin(t * 4 + i) * 14 + t * drift) * s;
      const cy = y - t * 260 * s;
      const r = (18 + t * 46) * s;
      return <circle key={i} cx={cx} cy={cy} r={r} fill={color} stroke={KRP.ink} strokeWidth={3} opacity={(1 - t) * 0.85} />;
    })}
  </g>
);

// 明治の女工 (縞の着物・帯・たすき・前かけ・結った髪)。Person の上に着物を重ねる
const HmDbJoko: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: Pose; lean?: number; phase?: number;
  gaze?: [number, number]; stripe?: "blue" | "brown"; apron?: boolean; pointDir?: 1 | -1;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", lean = 0, phase = 0, gaze = [0, 0], stripe = "blue", apron = true, pointDir = 1 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const [c1, c2] = stripe === "blue" ? [C.stripeBlue, C.stripeBlueDark] : [C.stripeBrown, C.stripeBrownDark];
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase} gaze={gaze}
        cloth={c1} clothDark={c2} hair="cap" pointDir={pointDir} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 着物の身ごろと裾 (膝下まで) */}
        <path d="M -60 -156 Q 0 -164 60 -156 L 64 -10 Q 0 -4 -64 -10 Z" fill={c1} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={c2} strokeWidth={6} opacity={0.85}>
          {[-44, -26, -8, 10, 28, 46].map((sx) => <line key={sx} x1={sx} y1={-152} x2={sx * 1.06} y2={-12} />)}
        </g>
        {/* 衿 (白い半衿) */}
        <path d="M -26 -160 L 0 -112 L 26 -160" fill="none" stroke={KRP.white} strokeWidth={12} strokeLinejoin="round" />
        <path d="M -32 -160 L 0 -104 L 32 -160" fill="none" stroke={KRP.ink} strokeWidth={3} />
        {/* たすき (肩にかけた赤いひも。袖をたくし上げる) */}
        <path d="M -30 -160 Q -50 -150 -60 -128" stroke={C.tasuki} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 30 -160 Q 50 -150 60 -128" stroke={C.tasuki} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* 帯 */}
        <rect x={-62} y={-108} width={124} height={26} rx={4} fill={C.obi} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-62} y1={-95} x2={62} y2={-95} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
        {/* 前かけ */}
        {apron && <path d="M -42 -84 L 42 -84 L 46 -16 Q 0 -10 -46 -16 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={4} />}
        {/* 草履 */}
        <ellipse cx={-20} cy={-4} rx={22} ry={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={20} cy={-4} rx={22} ry={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 結った髪 (頭の上のまげ + かんざし) */}
        <ellipse cx={0} cy={-300} rx={36} ry={22} fill={KRP.ink} />
        <line x1={-44} y1={-300} x2={44} y2={-306} stroke={C.giftRibbon} strokeWidth={5} strokeLinecap="round" />
        <path d="M -62 -240 Q -70 -210 -60 -196" stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 62 -240 Q 70 -210 60 -196" stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// 明治の役人・監督 (詰襟の洋服・金ボタン・口ひげ)
const HmDbYakunin: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: Pose; lean?: number; phase?: number;
  gaze?: [number, number]; suit?: boolean;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", lean = 0, phase = 0, gaze = [0, 0], suit = false }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const cl = suit ? C.suit : C.official;
  const cd = suit ? C.suitDark : C.officialDark;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase} gaze={gaze} cloth={cl} clothDark={cd} hair="cap" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 立て衿 */}
        <rect x={-30} y={-168} width={60} height={16} rx={5} fill={cd} stroke={KRP.ink} strokeWidth={4} />
        {/* 金ボタン (詰襟) / 背広ならネクタイ */}
        {suit ? (
          <path d="M -8 -154 L 8 -154 L 12 -90 L 0 -78 L -12 -90 Z" fill={C.obi} stroke={KRP.ink} strokeWidth={3} />
        ) : (
          [-140, -118, -96, -74].map((by) => <circle key={by} cx={0} cy={by} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />)
        )}
        {/* 口ひげ */}
        <path d="M -30 -196 Q -16 -212 0 -200 Q 16 -212 30 -196 Q 16 -202 0 -194 Q -16 -202 -30 -196 Z" fill={KRP.ink} />
      </g>
    </g>
  );
};

// 壁の大時計 (木の枠・文字盤・針)。hourDeg/minDeg は 12時からの角度
const HmDbClock: React.FC<{ x: number; y: number; r: number; hourDeg: number; minDeg: number; f: number; frame?: string }> = ({
  x, y, r, hourDeg, minDeg, f, frame = C.woodDark,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 26} fill={frame} stroke={KRP.ink} strokeWidth={8} />
    <circle r={r + 10} fill="none" stroke={KRP.brass} strokeWidth={5} />
    <circle r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 60 }, (_, i) => {
      const a = (i * 6 * Math.PI) / 180;
      const big = i % 5 === 0;
      const r1 = r * (big ? 0.78 : 0.88);
      return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r * 0.94} y2={-Math.cos(a) * r * 0.94}
        stroke={KRP.ink} strokeWidth={big ? 7 : 2.5} strokeLinecap="round" />;
    })}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={KRP.ink} strokeWidth={r * 0.08} strokeLinecap="round" transform={`rotate(${hourDeg})`} />
    <line x1={0} y1={r * 0.1} x2={0} y2={-r * 0.74} stroke={KRP.ink} strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${minDeg})`} />
    <line x1={0} y1={r * 0.14} x2={0} y2={-r * 0.8} stroke={KRP.red} strokeWidth={Math.max(2.5, r * 0.018)} transform={`rotate(${(f * 6) % 360})`} />
    <circle r={r * 0.07} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// レンガの壁 (範囲を埋める)
const HmDbBrick: React.FC<{ x: number; y: number; w: number; h: number; bw?: number; bh?: number; seed?: number; base?: string }> = ({
  x, y, w, h, bw = 90, bh = 40, seed = 1, base = C.brick,
}) => {
  const rows = Math.ceil(h / bh);
  const cols = Math.ceil(w / bw) + 1;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.mortar} />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const bx = x + c * bw - (r % 2 ? bw / 2 : 0);
        const by = y + r * bh;
        if (bx > x + w || bx + bw < x) return null;
        const v = rnd(seed, r * 37 + c);
        const l = Math.max(bx + 3, x), rr = Math.min(bx + bw - 3, x + w);
        if (rr <= l) return null;
        return <rect key={`${r}-${c}`} x={l} y={by + 3} width={rr - l} height={Math.min(bh - 6, y + h - by - 3)} rx={3}
          fill={v < 0.25 ? C.brickDark : v > 0.8 ? mix(base, "#FFFFFF", 0.12) : base} />;
      }))}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #71 わざわざ変えたのは、西洋の国々と同じリズムで働くためだった、とも言えます。
// 格: 山 / seed 5071
// どこ: 港の見える明治の役所の窓辺 (板張りの壁・カーテン・窓の外に海と蒸気船、対岸の洋館)
// 演出: 窓の桟に大きなメトロノームが2台。左は青海波の和柄「日本」、右は赤白青の縞「西洋」。
//       はじめは振り子がばらばら → f で位相がそろい、f=45 では2本がぴったり同じ角度で振れる。
//       左に立つ役人が窓の外の汽船を見て、満足そうにうなずく
// 動き: 振り子のずれが縮む / 汽船が進み煙が流れる / カモメ / カメラがゆっくり引く
const HmDb71Metro: React.FC<{ x: number; y: number; ang: number; kind: "wa" | "yo"; f: number }> = ({ x, y, ang, kind, f }) => {
  const id = `hmdb71-${kind}`;
  const body = `M ${x - 115} ${y} L ${x - 45} ${y - 380} L ${x + 45} ${y - 380} L ${x + 115} ${y} Z`;
  const px = x, py = y - 70;
  return (
    <g>
      <ellipse cx={x + 16} cy={y + 6} rx={140} ry={16} fill={KRP.ink} opacity={0.25} />
      <defs><clipPath id={id}><path d={body} /></clipPath></defs>
      <path d={body} fill={kind === "wa" ? C.aizome : KRP.white} stroke={KRP.ink} strokeWidth={8} />
      <g clipPath={`url(#${id})`}>
        {kind === "wa" ? (
          // 青海波 (重なる半円の波)
          Array.from({ length: 11 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
            const cx = x - 150 + c * 50 + (r % 2 ? 25 : 0);
            const cy = y - 380 + r * 36;
            return (
              <g key={`${r}-${c}`} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.75}>
                <path d={`M ${cx - 25} ${cy} A 25 25 0 0 1 ${cx + 25} ${cy}`} fill={C.aizome} />
                <path d={`M ${cx - 16} ${cy} A 16 16 0 0 1 ${cx + 16} ${cy}`} />
                <path d={`M ${cx - 7} ${cy} A 7 7 0 0 1 ${cx + 7} ${cy}`} />
              </g>
            );
          }))
        ) : (
          <g>
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={x - 130} y={y - 380 + i * 44} width={260} height={22} fill={C.westRed} />
            ))}
            <rect x={x - 130} y={y - 380} width={260} height={96} fill={C.westBlue} />
            {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={x - 40 + k * 20} cy={y - 330 + (k % 2) * 14} r={4} fill={KRP.white} />)}
          </g>
        )}
        {/* 目盛り板 */}
        <rect x={x - 28} y={y - 350} width={56} height={240} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={x - (i % 2 ? 10 : 18)} y1={y - 336 + i * 21} x2={x + (i % 2 ? 10 : 18)} y2={y - 336 + i * 21}
            stroke={KRP.ink} strokeWidth={i % 2 ? 2 : 3.5} />
        ))}
        {/* 本体の陰 */}
        <path d={`M ${x + 45} ${y - 380} L ${x + 115} ${y} L ${x + 70} ${y} L ${x + 30} ${y - 380} Z`} fill={KRP.ink} opacity={0.18} />
      </g>
      {/* 振り子 */}
      <g transform={`rotate(${ang} ${px} ${py})`}>
        <line x1={px} y1={py} x2={px} y2={py - 330} stroke={KRP.silver} strokeWidth={9} strokeLinecap="round" />
        <line x1={px} y1={py} x2={px} y2={py - 330} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
        <path d={`M ${px - 30} ${py - 210} L ${px + 30} ${py - 210} L ${px + 22} ${py - 170} L ${px - 22} ${py - 170} Z`}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={px} cy={py - 330} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <circle cx={px} cy={py} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      {/* 台座と巻きねじ */}
      <rect x={x - 128} y={y - 22} width={256} height={26} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`translate(${x + 128} ${y - 120}) rotate(${Math.sin(f / 30) * 4})`}>
        <rect x={0} y={-6} width={22} height={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 22 -22 q 18 0 18 22 q 0 22 -18 22 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </g>
  );
};
const Hm071: React.FC<{ f: number }> = ({ f }) => {
  const sync = easeOut(seg(f, 4, 38));
  const w = (2 * Math.PI) / 26;
  const angL = 24 * Math.sin(w * f);
  const angR = 24 * Math.sin(w * f + Math.PI * 0.95 * (1 - sync));
  const shipX = 1530 - f * 2.2;
  const cam = easeInOut(seg(f, 0, 40));
  const nod = f > 36 ? Math.sin((f - 36) / 2.2) * 3 : 0;
  const synced = seg(f, 34, 40);
  return (
    <Frame f={f} seed={5071}>
      <Cam sc={lerp(1.1, 1.0, cam)} cy={430}>
        {/* 板張りの壁 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.woodWall} />
        <g stroke={C.woodPanel} strokeWidth={5}>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 92} y1={-40} x2={i * 92} y2={1120} />)}
        </g>
        {/* 窓の外 (クリップ) */}
        <defs>
          <clipPath id="hmdb71-win"><rect x={320} y={100} width={1280} height={540} /></clipPath>
          <linearGradient id="hmdb71-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.skyDay} /><stop offset="1" stopColor={C.skyLow} />
          </linearGradient>
        </defs>
        <g clipPath="url(#hmdb71-win)">
          <rect x={320} y={100} width={1280} height={540} fill="url(#hmdb71-sky)" />
          {/* 雲 */}
          {[[520, 190], [1180, 160], [1450, 240]].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy})`} fill={KRP.white} opacity={0.9}>
              <ellipse rx={80} ry={24} /><ellipse cx={-40} cy={-14} rx={40} ry={22} /><ellipse cx={30} cy={-20} rx={46} ry={26} />
            </g>
          ))}
          {/* 対岸の丘と洋館 */}
          <path d="M 320 400 Q 520 300 760 360 Q 1000 310 1240 350 Q 1440 300 1600 340 L 1600 430 L 320 430 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const hx = 700 + i * 120, hy = 400;
            return (
              <g key={i}>
                <rect x={hx} y={hy - 50} width={84} height={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                <polygon points={`${hx - 8},${hy - 50} ${hx + 42},${hy - 82} ${hx + 92},${hy - 50}`} fill={C.shu} stroke={KRP.ink} strokeWidth={3.5} />
                {[0, 1, 2].map((k) => <rect key={k} x={hx + 10 + k * 24} y={hy - 38} width={14} height={20} fill={C.seaLight} stroke={KRP.ink} strokeWidth={2} />)}
              </g>
            );
          })}
          <rect x={1440} y={300} width={50} height={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points="1432,300 1465,250 1498,300" fill={C.roofTile} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={1465} cy={330} r={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
          {/* 海 */}
          <rect x={320} y={420} width={1280} height={230} fill={C.sea} />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${330 + ((i * 97 + f * 2) % 1280)} ${450 + (i % 5) * 38} q 18 -8 36 0 q 18 8 36 0`}
              stroke={C.seaLight} strokeWidth={4} fill="none" />
          ))}
          {/* 帆船 (遠く) */}
          <g transform={`translate(${520 + f * 0.6} 470)`}>
            <path d="M -50 0 L 50 0 L 36 18 L -36 18 Z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={-80} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 4 -76 L 44 -10 L 4 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -4 -70 L -36 -10 L -4 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 蒸気船 */}
          <g transform={`translate(${shipX} 540)`}>
            <HmDbSmoke x={60} y={-120} f={f} s={0.7} color={C.smokeLight} drift={110} />
            <path d="M -200 0 L 220 0 L 180 56 L -170 56 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-200} y={-6} width={420} height={14} fill={C.shu} />
            <rect x={-110} y={-56} width={250} height={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={-86 + k * 40} cy={-30} r={9} fill={C.seaLight} stroke={KRP.ink} strokeWidth={2.5} />)}
            <rect x={40} y={-130} width={44} height={76} fill={C.shu} stroke={KRP.ink} strokeWidth={4} />
            <rect x={40} y={-130} width={44} height={16} fill={KRP.ink} />
            <line x1={-150} y1={-4} x2={-150} y2={-150} stroke={KRP.ink} strokeWidth={5} />
            <line x1={170} y1={-4} x2={170} y2={-130} stroke={KRP.ink} strokeWidth={5} />
            <line x1={-150} y1={-150} x2={170} y2={-130} stroke={KRP.ink} strokeWidth={2} />
            <path d={`M 170 -128 l ${34 + Math.sin(f / 3) * 4} 8 l ${-34 - Math.sin(f / 3) * 4} 10 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />
            {/* 外輪 */}
            <path d="M -20 0 A 50 50 0 0 1 80 0 Z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* カモメ */}
          {[0, 1, 2].map((i) => {
            const gx = 400 + ((f * (3 + i) + i * 300) % 1300);
            const gy = 220 + i * 50 + Math.sin(f / 6 + i) * 12;
            const flap = Math.sin(f / 2.5 + i * 2) * 10;
            return <path key={i} d={`M ${gx - 26} ${gy - flap} Q ${gx - 12} ${gy - 12} ${gx} ${gy} Q ${gx + 12} ${gy - 12} ${gx + 26} ${gy - flap}`}
              stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
          })}
        </g>
        {/* 窓枠と桟 */}
        <rect x={320} y={100} width={1280} height={540} fill="none" stroke={C.woodDeep} strokeWidth={28} />
        <rect x={300} y={80} width={1320} height={580} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <line x1={960} y1={100} x2={960} y2={640} stroke={C.woodDeep} strokeWidth={20} />
        <line x1={320} y1={300} x2={1600} y2={300} stroke={C.woodDeep} strokeWidth={14} />
        <path d="M 340 120 L 520 120 L 340 330 Z" fill={KRP.white} opacity={0.16} />
        <path d="M 980 120 L 1100 120 L 980 260 Z" fill={KRP.white} opacity={0.16} />
        {/* カーテン (タッセルで留めた厚手の布) */}
        {[-1, 1].map((sd) => {
          const cx = sd < 0 ? 300 : 1620;
          const sway = Math.sin(f / 18 + sd) * 5;
          return (
            <g key={sd}>
              <path d={`M ${cx - sd * 10} 60 L ${cx + sd * 170} 60 Q ${cx + sd * (60 + sway)} 360 ${cx + sd * 40} 420 Q ${cx + sd * 120} 560 ${cx + sd * 90} 700 L ${cx - sd * 30} 700 Z`}
                fill="#7A3E46" stroke={KRP.ink} strokeWidth={6} />
              <path d={`M ${cx + sd * 40} 100 Q ${cx + sd * 30} 300 ${cx + sd * 30} 400`} stroke="#5E2E36" strokeWidth={5} fill="none" />
              <ellipse cx={cx + sd * 44} cy={418} rx={30} ry={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        <rect x={180} y={44} width={1560} height={24} rx={10} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓の桟 (台) と腰板 */}
        <rect x={-40} y={690} width={2000} height={430} fill={C.woodPanel} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={40 + i * 380} y={740} width={320} height={300} rx={8} fill="none" stroke={C.woodDark} strokeWidth={6} />)}
        <rect x={240} y={640} width={1440} height={30} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={220} y={668} width={1480} height={30} rx={4} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {/* 桟の上の書類と羽ペン */}
        <g transform="rotate(-4 1470 630)">
          {[0, 1, 2].map((k) => <rect key={k} x={1380 + k * 4} y={612 - k * 8} width={170} height={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
          <circle cx={1520} cy={604} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        <path d="M 1590 640 L 1640 520 Q 1660 540 1600 638 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        {/* 2台のメトロノーム */}
        <HmDb71Metro x={760} y={642} ang={angL} kind="wa" f={f} />
        <HmDb71Metro x={1160} y={642} ang={angR} kind="yo" f={f} />
        {/* 振れの軌跡 (そろうと1本の弧が重なる) */}
        {[[760, angL], [1160, angR]].map(([mx, an], i) => (
          <path key={i} d={`M ${(mx as number) - 120} ${300} A 330 330 0 0 1 ${(mx as number) + 120} ${300}`}
            stroke={synced > 0 ? HP.spark : KRP.white} strokeWidth={4} fill="none" strokeDasharray="10 12"
            opacity={0.45 + 0.4 * synced} transform={`translate(0 ${Math.abs(an as number) * 0.2})`} />
        ))}
        {/* そろった合図の音符 */}
        {synced > 0 && [760, 1160].map((mx, i) => (
          <text key={i} x={mx + 120} y={250 - Math.abs(Math.sin(w * f)) * 20} fontFamily={FONT} fontWeight={900} fontSize={64}
            fill={HP.spark} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke" opacity={synced}>♪</text>
        ))}
        {/* 役人 (窓の外の汽船を眺めてうなずく) */}
        <g transform={`rotate(${nod} 190 760)`}>
          <HmDbYakunin x={190} y={1010} s={1.25} f={f} face={synced > 0.5 ? "smile" : "normal"} gaze={[7, -3]} lean={3} phase={2} />
        </g>
        <TagPlate x={760} y={772} text="日本" size={42} t={seg(f, 2, 12)} />
        <TagPlate x={1160} y={772} text="西洋" size={42} t={seg(f, 4, 14)} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #72 外国と取り引きする港の役所は、明治のはじめから、もう日曜に休んでいました。
// 格: 山 / seed 5072
// どこ: 明治のはじめの横浜の港の役所 (瓦屋根に洋風の窓とベランダの和洋折衷の建物・石の岸壁・停泊する船)
// 演出: 日曜。役所の扉は閉まり、扉に太陽マークの「日曜」札。荷物の箱は積まれたまま (縄でくくって放置)。
//       岸壁のふちに外国の船員と日本の役人が並んで腰かけ、のんびり釣り。f の後半に役人の竿に魚がかかり、
//       船員が指さして笑う
// 動き: 波 / 国旗がはためく / 浮きが沈んで魚が上がる / カメラが右へゆっくりパン
const HmDb72Sit: React.FC<{ x: number; y: number; s: number; f: number; children?: React.ReactNode }> = ({ children }) => <g>{children}</g>;
void HmDb72Sit;
const Hm072: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 40));
  const bite = seg(f, 18, 24);
  const pull = easeOut(seg(f, 24, 36));
  const flagWave = (k: number) => Math.sin(f / 4 + k) * 10;
  // 竿の先 (役人)
  const rodBase: [number, number] = [1665, 690];
  const tipJ: [number, number] = [lerp(1820, 1790, bite), lerp(470, 520, bite * (1 - pull)) - pull * 60];
  const floatY = 930 + Math.sin(f / 5) * 5 + bite * (1 - pull) * 22;
  const fishY = lerp(floatY, tipJ[1] + 150, pull);
  const tipS: [number, number] = [1120, 480 + Math.sin(f / 9) * 6];
  return (
    <Frame f={f} seed={5072}>
      <Cam dx={lerp(60, -30, pan)} sc={1.04}>
        {/* 空 */}
        <rect x={-120} y={-40} width={2200} height={600} fill={C.skyDay} />
        <rect x={-120} y={320} width={2200} height={200} fill={C.skyLow} opacity={0.7} />
        {[[300, 120], [1300, 90], [1750, 170]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 50 + i) * 12} ${cy})`} fill={KRP.white}>
            <ellipse rx={90} ry={26} /><ellipse cx={-44} cy={-16} rx={44} ry={24} /><ellipse cx={34} cy={-22} rx={50} ry={28} />
          </g>
        ))}
        {/* 海 (奥) と停泊した帆船 */}
        <rect x={-120} y={430} width={2200} height={240} fill={C.sea} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${900 + ((i * 83 + f * 1.5) % 1200)} ${460 + (i % 4) * 40} q 16 -7 32 0 q 16 7 32 0`} stroke={C.seaLight} strokeWidth={4} fill="none" />
        ))}
        <g transform={`translate(1500 ${520 + Math.sin(f / 10) * 4})`}>
          <path d="M -170 0 L 170 0 L 130 50 L -140 50 Z" fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-170} y={-6} width={340} height={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {[-80, 40].map((mx) => <line key={mx} x1={mx} y1={0} x2={mx} y2={-240} stroke={KRP.ink} strokeWidth={6} />)}
          {/* 帆はたたまれている (日曜) */}
          {[-80, 40].map((mx) => [-200, -130].map((yy) => <rect key={`${mx}${yy}`} x={mx - 60} y={yy} width={120} height={14} rx={7} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />))}
          <path d={`M 40 -240 l ${50 + flagWave(1)} 8 l ${-6} 14 l ${-44 - flagWave(1)} 6 Z`} fill={C.westBlue} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M 40 -232 l ${48 + flagWave(1)} 7`} stroke={KRP.white} strokeWidth={4} />
        </g>
        {/* 運上所 (和洋折衷の役所) */}
        <g>
          {/* 1階: 石の土台と白壁、2階: ベランダつきの洋窓、屋根: 瓦 */}
          <rect x={60} y={300} width={840} height={370} fill={C.plaster} stroke={KRP.ink} strokeWidth={7} />
          <rect x={60} y={620} width={840} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={60 + i * 94} y1={620} x2={60 + i * 94} y2={670} stroke={C.stoneDark} strokeWidth={4} />)}
          <path d="M 20 310 L 160 200 L 800 200 L 940 310 Z" fill={C.roofTile} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={80 + i * 52} y1={300} x2={180 + i * 40} y2={205} stroke={C.roofTileDark} strokeWidth={5} />)}
          <path d="M 140 200 Q 480 170 820 200" stroke={KRP.ink} strokeWidth={10} fill="none" />
          <path d="M 120 210 q -20 -30 0 -50 M 840 210 q 20 -30 0 -50" stroke={KRP.ink} strokeWidth={8} fill="none" />
          {/* 2階のベランダの手すり */}
          <rect x={80} y={430} width={800} height={14} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 27 }, (_, i) => <line key={i} x1={92 + i * 30} y1={444} x2={92 + i * 30} y2={480} stroke={C.woodDark} strokeWidth={5} />)}
          <rect x={80} y={478} width={800} height={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          {/* 洋風の縦長窓 (よろい戸) */}
          {[130, 260, 640, 770].map((wx) => (
            <g key={wx}>
              <rect x={wx} y={330} width={70} height={94} fill={C.seaLight} stroke={KRP.ink} strokeWidth={4} />
              <line x1={wx + 35} y1={330} x2={wx + 35} y2={424} stroke={KRP.ink} strokeWidth={3} />
              <rect x={wx - 22} y={330} width={20} height={94} fill="#6E9A5E" stroke={KRP.ink} strokeWidth={3} />
              <rect x={wx + 72} y={330} width={20} height={94} fill="#6E9A5E" stroke={KRP.ink} strokeWidth={3} />
              <rect x={wx} y={520} width={70} height={80} fill={C.seaDark} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${wx} 520 Q ${wx + 35} 496 ${wx + 70} 520`} fill={C.plaster} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          {/* 閉まった両開きの扉 */}
          <rect x={390} y={490} width={180} height={132} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
          <line x1={480} y1={490} x2={480} y2={622} stroke={KRP.ink} strokeWidth={5} />
          {[410, 500].map((dx) => <rect key={dx} x={dx} y={506} width={60} height={96} rx={4} fill="none" stroke={C.woodDark} strokeWidth={4} />)}
          <circle cx={470} cy={560} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
          <circle cx={490} cy={560} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
          {/* 閂 (かんぬき) */}
          <rect x={400} y={572} width={160} height={14} rx={4} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          {/* 扉の札: 太陽マークの日曜 (ひもで揺れる) */}
          <g transform={`rotate(${Math.sin(f / 9) * 4} 480 486)`}>
            <line x1={456} y1={486} x2={444} y2={510} stroke={KRP.ink} strokeWidth={3} />
            <line x1={504} y1={486} x2={516} y2={510} stroke={KRP.ink} strokeWidth={3} />
            <rect x={420} y={508} width={120} height={58} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={446} cy={537} r={12} fill={HP.rest} stroke={KRP.ink} strokeWidth={2.5} />
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k * 45 * Math.PI) / 180;
              return <line key={k} x1={446 + Math.cos(a) * 16} y1={537 + Math.sin(a) * 16} x2={446 + Math.cos(a) * 22} y2={537 + Math.sin(a) * 22} stroke={HP.rest} strokeWidth={3} strokeLinecap="round" />;
            })}
            <text x={496} y={548} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={HP.rest}>日曜</text>
          </g>
          {/* 屋根の上の旗竿と日の丸 */}
          <line x1={480} y1={180} x2={480} y2={40} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={480} cy={36} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M 484 48 Q ${540 + flagWave(0)} ${40 + flagWave(0) * 0.6} 600 ${50 + flagWave(0) * 0.3} L 600 ${118 + flagWave(0) * 0.3} Q ${540 + flagWave(0)} ${108 + flagWave(0) * 0.6} 484 116 Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={542 + flagWave(0) * 0.3} cy={82 + flagWave(0) * 0.4} r={20} fill={KRP.red} />
        </g>
        {/* 石の岸壁 */}
        <rect x={-120} y={660} width={2200} height={44} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-120} y={700} width={2200} height={190} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 20 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-120 + c * 120 + (r % 2 ? 60 : 0)} y={706 + r * 46} width={114} height={40} rx={6}
            fill={rnd(72, r * 20 + c) < 0.3 ? C.stone : "none"} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        )))}
        {/* 手前の海 */}
        <rect x={-120} y={886} width={2200} height={260} fill={C.seaDark} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${-100 + ((i * 151 + f * 2.4) % 2200)} ${920 + (i % 3) * 50} q 22 -10 44 0 q 22 10 44 0`} stroke={C.seaLight} strokeWidth={5} fill="none" />
        ))}
        {/* 積まれたままの荷物の箱 (縄でくくって、今日は動かない) */}
        {([[960, 660, 150, 110], [1110, 660, 130, 110], [1020, 550, 150, 110], [990, 450, 90, 100]] as const).map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <rect x={bx - bw / 2} y={by - bh} width={bw} height={bh} fill={i % 2 ? "#C99A5E" : "#B8874E"} stroke={KRP.ink} strokeWidth={5} />
            <line x1={bx - bw / 2} y1={by - bh / 2} x2={bx + bw / 2} y2={by - bh / 2} stroke={C.woodDark} strokeWidth={4} />
            <path d={`M ${bx - bw / 2 + 8} ${by - bh + 8} L ${bx + bw / 2 - 8} ${by - 8} M ${bx + bw / 2 - 8} ${by - bh + 8} L ${bx - bw / 2 + 8} ${by - 8}`} stroke={C.woodDark} strokeWidth={3} opacity={0.6} />
          </g>
        ))}
        <path d="M 945 450 L 945 660 M 1035 350 L 1035 660" stroke="#D9C08A" strokeWidth={6} />
        {/* 箱の上で昼寝するカモメ */}
        <g transform={`translate(990 ${346 + Math.sin(f / 14) * 1.5})`}>
          <ellipse rx={30} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={24} cy={-12} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 34 -12 l 12 3 l -12 3 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2} />
          <line x1={20} y1={-14} x2={28} y2={-14} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -30 -4 L -46 -10 L -32 6" fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <text x={1030} y={300 - ((f * 0.8) % 40)} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.blueDeep} opacity={0.7}>z</text>
        {/* 船員 (縞のシャツ・水兵帽) と役人。岸壁のふちに腰かけて釣り */}
        {/* 船員の竿 */}
        <line x1={1275} y1={690} x2={tipS[0]} y2={tipS[1]} stroke={C.woodDark} strokeWidth={7} strokeLinecap="round" />
        <line x1={tipS[0]} y1={tipS[1]} x2={1080} y2={930} stroke={KRP.ink} strokeWidth={2} />
        <g transform={`translate(1080 ${930 + Math.sin(f / 6 + 1) * 5})`}>
          <ellipse rx={9} ry={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-9} y={-2} width={18} height={6} fill={KRP.white} />
        </g>
        <Person x={1340} y={758} s={1.0} f={f} pose="sit" face={pull > 0.3 ? "joy" : "smile"} cloth={C.sailor} clothDark={C.sailorStripe}
          gaze={[5, 2]} phase={1} lean={pull > 0.3 ? -4 : 0} />
        <g transform={`translate(1340 ${758 + Math.sin((f + 17) / 13) * 3})`}>
          {[-130, -108, -86, -64].map((sy) => <line key={sy} x1={-56} y1={sy} x2={56} y2={sy} stroke={C.sailorStripe} strokeWidth={7} />)}
          <path d="M -40 -160 L 0 -128 L 40 -160 Z" fill={C.sailorStripe} stroke={KRP.ink} strokeWidth={3} />
          {/* 水兵帽 */}
          <path d="M -54 -268 Q 0 -300 54 -268 L 50 -256 Q 0 -270 -50 -256 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-50} y={-262} width={100} height={12} fill={C.sailorStripe} />
        </g>
        {/* 役人の竿 (しなる) と糸・浮き・魚 */}
        <path d={`M ${rodBase[0]} ${rodBase[1]} Q ${lerp(rodBase[0], tipJ[0], 0.6)} ${lerp(rodBase[1], tipJ[1], 0.3) - 40} ${tipJ[0]} ${tipJ[1]}`}
          stroke={C.woodDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        <line x1={tipJ[0]} y1={tipJ[1]} x2={tipJ[0] - 10} y2={pull > 0 ? fishY - 30 : floatY} stroke={KRP.ink} strokeWidth={2} />
        {pull <= 0 && (
          <g transform={`translate(${tipJ[0] - 10} ${floatY})`}>
            <ellipse rx={9} ry={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            {bite > 0 && <ellipse cx={0} cy={10} rx={30 * bite} ry={8 * bite} fill="none" stroke={KRP.white} strokeWidth={3} />}
          </g>
        )}
        {pull > 0 && (
          <g transform={`translate(${tipJ[0] - 10} ${fishY}) rotate(${80 + Math.sin(f / 1.6) * 18})`}>
            <ellipse rx={40} ry={17} fill={C.fish} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 36 0 L 62 -18 L 58 0 L 62 18 Z" fill={C.fish} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-22} cy={-4} r={4} fill={KRP.ink} />
            {[0, 1, 2].map((k) => <circle key={k} cx={-40 - k * 10} cy={-30 - k * 12} r={4} fill={C.seaLight} opacity={1 - pull * 0.5} />)}
          </g>
        )}
        <HmDbYakunin x={1600} y={758} s={1.0} f={f} pose="sit" face={pull > 0.3 ? "joy" : bite > 0 ? "surprised" : "smile"} gaze={[6, -2]} phase={3} />
        {/* 船員が指さして笑う (腕を自分で足す) */}
        {pull > 0.2 && (
          <g opacity={clamp01((pull - 0.2) * 4)}>
            <rect x={1262} y={612} width={22} height={140} rx={11} fill={C.sailor} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(160 1273 612)`} />
            <circle cx={1225} cy={480} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        <TagPlate x={760} y={120} text="横浜" size={46} t={seg(f, 2, 12)} rot={-3} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #73 こうして休みは、お祭りの日から、7日ごとの目盛りへと変わっていきます。
// 格: 図 / seed 5073
// どこ: 博物館の展示室 (えんじの壁・木とガラスの展示ケース3台・真鍮の照明・台座の解説札)
// 演出: ケースの中に YasumiCalendar を3枚 (江戸=祭りの日だけ不規則 / 明治のはじめ=5日ごと / 明治9年〜=7日ごと)。
//       各ケースの上に「定規の線」を鉛筆が左から右へ引き、赤い休みの日の位置に目盛りを刻む。
//       間隔の弧が、左はでこぼこ → 右へ行くほど等間隔にそろう
// 動き: ケースの照明が左から順に点く / 鉛筆が補助線を引く / カメラがゆっくり右へパン
const HM73_CASES = [
  { x: 380, title: "江戸", rest: [1, 2, 3, 15, 16, 28], half: [] as number[], startDow: 0, weekHead: false, ticks: [1, 2, 3, 15, 16, 28], label: "祭りの日" },
  { x: 960, title: "明治のはじめ", rest: [1, 6, 11, 16, 21, 26], half: [] as number[], startDow: 3, weekHead: false, ticks: [1, 6, 11, 16, 21, 26], label: "5日ごと" },
  { x: 1540, title: "明治9年〜", rest: [1, 8, 15, 22, 29], half: [7, 14, 21, 28], startDow: 0, weekHead: true, ticks: [1, 8, 15, 22, 29], label: "7日ごと" },
];
const Hm073: React.FC<{ f: number }> = ({ f }) => {
  const P = seg(f, 8, 40) * 3;
  const pan = easeInOut(seg(f, 0, 42));
  const RY = 296; // 定規の線の高さ
  const PLATE_Y = 792;
  const dayX = (cx: number, d: number) => cx - 168 + ((d - 1) * 336) / 30;
  const penCase = Math.min(2, Math.floor(P));
  const penP = clamp01(P - penCase);
  const penX = P >= 3 ? dayX(HM73_CASES[2].x, 31) : dayX(HM73_CASES[penCase].x, 1 + penP * 30);
  return (
    <Frame f={f} seed={5073}>
      <Cam dx={lerp(30, -30, pan)} sc={1.02}>
        {/* 展示室の壁 (えんじの布張り) と腰の木 */}
        <rect x={-80} y={-40} width={2100} height={1160} fill={C.museumWall} />
        <g stroke={C.museumWallDark} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-80 + i * 54} y1={-40} x2={-80 + i * 54} y2={860} />)}
        </g>
        <rect x={-80} y={36} width={2100} height={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-80} y={860} width={2100} height={300} fill={C.woodDeep} />
        <g stroke={C.woodDark} strokeWidth={4}>{Array.from({ length: 14 }, (_, i) => <line key={i} x1={-80 + i * 160} y1={860} x2={-200 + i * 190} y2={1120} />)}</g>
        {HM73_CASES.map((cs, i) => {
          const light = seg(f, 2 + i * 9, 8 + i * 9);
          const pi = clamp01(P - i);
          return (
            <g key={i}>
              {/* 照明の光の筋 */}
              <polygon points={`${cs.x - 60},120 ${cs.x + 60},120 ${cs.x + 250},800 ${cs.x - 250},800`} fill={HP.spark} opacity={0.14 * light} />
              {/* 天井の真鍮ランプ */}
              <line x1={cs.x} y1={56} x2={cs.x} y2={96} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${cs.x - 56} 130 Q ${cs.x} 80 ${cs.x + 56} 130 Z`} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={cs.x} cy={132} rx={34} ry={8} fill={light > 0 ? HP.spark : KRP.grayDark} stroke={KRP.ink} strokeWidth={3} opacity={0.6 + 0.4 * light} />
              {/* ケース (木の枠・ガラス・台座) */}
              <rect x={cs.x - 250} y={180} width={500} height={600} rx={8} fill={C.paperOld} stroke={KRP.ink} strokeWidth={8} />
              <rect x={cs.x - 232} y={198} width={464} height={564} fill={KRP.cream} stroke={C.paperOldDark} strokeWidth={4} />
              {/* 定規の線 (補助線) と目盛り */}
              <line x1={dayX(cs.x, 1)} y1={RY} x2={dayX(cs.x, 1 + 30 * pi)} y2={RY} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
              {Array.from({ length: 31 }, (_, d) => d + 1).filter((d) => (d - 1) / 30 <= pi).map((d) => (
                <line key={d} x1={dayX(cs.x, d)} y1={RY} x2={dayX(cs.x, d)} y2={RY + (d % 5 === 1 ? 14 : 8)} stroke={KRP.ink} strokeWidth={2.5} />
              ))}
              {cs.ticks.filter((d) => (d - 1) / 30 <= pi).map((d, k, arr) => {
                const tx = dayX(cs.x, d);
                const prev = k > 0 ? dayX(cs.x, arr[k - 1]) : null;
                return (
                  <g key={d}>
                    {prev !== null && tx - prev > 1 && (
                      <path d={`M ${prev} ${RY - 8} Q ${(prev + tx) / 2} ${RY - 8 - (tx - prev) * 0.5} ${tx} ${RY - 8}`}
                        stroke={HP.rest} strokeWidth={4} fill="none" />
                    )}
                    <line x1={tx} y1={RY - 20} x2={tx} y2={RY + 22} stroke={HP.rest} strokeWidth={7} strokeLinecap="round" />
                  </g>
                );
              })}
              {/* 暦 (共有部品) */}
              <YasumiCalendar x={cs.x} y={560} s={0.6} title={cs.title} rest={cs.rest} half={cs.half} startDow={cs.startDow}
                weekHead={cs.weekHead} t={seg(f, 2 + i * 9, 14 + i * 9)} f={f} />
              {/* 照明が点く前の暗さ */}
              <rect x={cs.x - 232} y={198} width={464} height={564} fill={KRP.ink} opacity={0.42 * (1 - light)} />
              {/* ガラスの映り込み */}
              <path d={`M ${cs.x - 220} 220 L ${cs.x - 130} 220 L ${cs.x - 220} 380 Z`} fill={KRP.white} opacity={0.3} />
              <path d={`M ${cs.x + 120} 740 L ${cs.x + 220} 560 L ${cs.x + 220} 610 L ${cs.x + 150} 740 Z`} fill={KRP.white} opacity={0.22} />
              {/* 台座 */}
              <rect x={cs.x - 270} y={772} width={540} height={36} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
              <rect x={cs.x - 240} y={808} width={480} height={80} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
              <TagPlate x={cs.x} y={PLATE_Y} text={cs.label} size={32} t={seg(f, 10 + i * 10, 18 + i * 10)} fill={KRP.cream} />
            </g>
          );
        })}
        {/* ケースの間の矢印 */}
        <Arrow x={720} y={560} s={0.55} t={seg(f, 18, 24)} color={HP.rest} />
        <Arrow x={1300} y={560} s={0.55} t={seg(f, 28, 34)} color={HP.rest} />
        {/* 鉛筆 (補助線を引く) */}
        <g transform={`translate(${penX} ${RY}) rotate(32)`}>
          <polygon points="0,0 -14,-34 14,-34" fill="#F3D9A8" stroke={KRP.ink} strokeWidth={4} />
          <polygon points="0,0 -5,-12 5,-12" fill={KRP.ink} />
          <rect x={-14} y={-200} width={28} height={166} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-14} y={-222} width={28} height={22} fill={HP.restSoft} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #74 ただし、日曜休みになったのは、役所と学校だけ。
// 格: 並 / seed 5074
// どこ: 明治の町の通り (日曜の朝)。左に洋風の役所と木造の学校、右にレンガの工場。土の道
// 演出: 道のまん中に白い境目の線。左側は扉に太陽マークの札がかかり、しんと静か (役所の石段で猫が大あくび)。
//       右側は煙突から煙がもくもく、門が開いて、働く人が次々に吸いこまれていく。右側の空だけ煙でくすむ
// 動き: 煙突の煙 / 工場へ人の列が進む / 猫のあくび / カメラがゆっくり引く
const HmDbSunPlate: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 9 + x) * 4})`}>
    <line x1={-24} y1={-26} x2={-34} y2={0} stroke={KRP.ink} strokeWidth={3} />
    <line x1={24} y1={-26} x2={34} y2={0} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-48} y={0} width={96} height={60} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={30} r={14} fill={HP.rest} stroke={KRP.ink} strokeWidth={2.5} />
    {Array.from({ length: 8 }, (_, k) => {
      const a = (k * 45 * Math.PI) / 180;
      return <line key={k} x1={Math.cos(a) * 18} y1={30 + Math.sin(a) * 18} x2={Math.cos(a) * 25} y2={30 + Math.sin(a) * 25} stroke={HP.rest} strokeWidth={3.5} strokeLinecap="round" />;
    })}
  </g>
);
const Hm074: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const yawn = Math.sin(Math.PI * seg(f, 22, 40));
  const PLATE_Y = 300;
  return (
    <Frame f={f} seed={5074}>
      <Cam sc={lerp(1.08, 1.0, cam)} cy={520}>
        {/* 空 (右だけ煙でくすむ) */}
        <rect x={-80} y={-40} width={2100} height={720} fill={C.skyDay} />
        <rect x={960} y={-40} width={1100} height={720} fill={C.smoke} opacity={0.35} />
        {[[260, 110], [640, 70]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy})`} fill={KRP.white}>
            <ellipse rx={80} ry={22} /><ellipse cx={-36} cy={-14} rx={40} ry={22} /><ellipse cx={30} cy={-18} rx={44} ry={24} />
          </g>
        ))}
        {/* 左: 役所 (白い洋館・旗竿) */}
        <g>
          <rect x={60} y={340} width={440} height={320} fill={C.plaster} stroke={KRP.ink} strokeWidth={7} />
          <polygon points="40,346 280,240 520,346" fill={C.roofTile} stroke={KRP.ink} strokeWidth={7} />
          <rect x={60} y={640} width={440} height={24} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
          {[100, 400].map((wx) => (
            <g key={wx}><rect x={wx} y={420} width={60} height={110} fill={C.seaDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={wx - 6} y={410} width={72} height={12} fill={C.stone} stroke={KRP.ink} strokeWidth={3} /></g>
          ))}
          <rect x={220} y={470} width={120} height={172} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
          <line x1={280} y1={470} x2={280} y2={642} stroke={KRP.ink} strokeWidth={4} />
          <HmDbSunPlate x={280} y={500} f={f} s={0.8} />
          {/* 石段 */}
          {[0, 1].map((k) => <rect key={k} x={200 - k * 20} y={664 + k * 22} width={160 + k * 40} height={22} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />)}
          <line x1={280} y1={240} x2={280} y2={150} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 284 156 q 40 ${Math.sin(f / 5) * 6} 76 0 l 0 50 q -38 ${Math.sin(f / 5 + 1) * 6} -76 0 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={322} cy={181} r={14} fill={KRP.red} />
        </g>
        {/* 左: 学校 (木造・小さな鐘楼) */}
        <g>
          <rect x={540} y={400} width={380} height={260} fill={C.woodWall} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={540} y1={428 + i * 26} x2={920} y2={428 + i * 26} stroke={C.woodPanel} strokeWidth={4} />)}
          <polygon points="520,406 730,330 940,406" fill={C.roofTile} stroke={KRP.ink} strokeWidth={7} />
          <rect x={700} y={250} width={60} height={70} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="690,252 730,210 770,252" fill={C.roofTile} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 716 312 Q 730 270 744 312 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          {[570, 640, 820].map((wx) => <rect key={wx} x={wx} y={450} width={56} height={70} fill={C.shoji} stroke={KRP.ink} strokeWidth={4} />)}
          <rect x={700} y={540} width={100} height={120} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
          <HmDbSunPlate x={750} y={560} f={f + 20} s={0.7} />
          {/* 屋根のすずめ */}
          <g transform={`translate(${860} ${372 + (Math.floor(f / 10) % 2) * -4})`}>
            <ellipse rx={16} ry={11} fill={C.catDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={12} cy={-8} r={7} fill={C.catDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 右: 工場 (レンガ・煙突・開いた門) */}
        <g>
          <HmDbBrick x={1000} y={360} w={880} h={300} seed={74} />
          <rect x={1000} y={360} width={880} height={300} fill="none" stroke={KRP.ink} strokeWidth={7} />
          {/* のこぎり屋根 */}
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M ${1000 + i * 176} 360 L ${1000 + i * 176} 290 L ${1176 + i * 176} 360 Z`} fill={C.roofTile} stroke={KRP.ink} strokeWidth={6} />
          ))}
          {[1040, 1580, 1760].map((wx) => (
            <rect key={wx} x={wx} y={420} width={80} height={100} fill={HP.spark} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={1680} y={60} width={70} height={300} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1670} y={52} width={90} height={22} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          <HmDbSmoke x={1715} y={40} f={f} s={1.6} n={8} drift={-60} />
          <rect x={1210} y={260} width={50} height={110} fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
          <HmDbSmoke x={1235} y={250} f={f + 30} s={1.0} n={6} drift={-40} />
          {/* 門 (開いている) と奥の暗がり */}
          <rect x={1240} y={480} width={260} height={180} fill={KRP.ink} opacity={0.75} />
          <rect x={1240} y={480} width={260} height={180} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1240 480 L 1180 470 L 1180 680 L 1240 660 Z" fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1500 480 L 1560 470 L 1560 680 L 1500 660 Z" fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 3 }, (_, k) => <line key={k} x1={1194 + k * 16} y1={490} x2={1194 + k * 16} y2={664} stroke={C.smokeLight} strokeWidth={3} />)}
          {Array.from({ length: 3 }, (_, k) => <line key={`r${k}`} x1={1514 + k * 16} y1={490} x2={1514 + k * 16} y2={664} stroke={C.smokeLight} strokeWidth={3} />)}
        </g>
        {/* 土の道 */}
        <rect x={-80} y={660} width={2100} height={460} fill={KRP.floor} />
        {Array.from({ length: 18 }, (_, i) => <ellipse key={i} cx={rnd(741, i) * 1920} cy={700 + rnd(742, i) * 340} rx={10 + rnd(743, i) * 16} ry={4} fill={C.stoneDark} opacity={0.4} />)}
        <path d="M 1370 660 L 1200 1120 L 1600 1120 Z" fill={C.stoneDark} opacity={0.18} />
        {/* 境目の線 */}
        <line x1={960} y1={-40} x2={960} y2={1120} stroke={KRP.white} strokeWidth={10} strokeDasharray="34 22" />
        <line x1={960} y1={-40} x2={960} y2={1120} stroke={KRP.ink} strokeWidth={2} strokeDasharray="34 22" opacity={0.4} />
        {/* 工場へ吸いこまれる人の列 */}
        {Array.from({ length: 7 }, (_, i) => {
          const t = ((f * 0.022 + i / 7) % 1);
          const px = lerp(1900, 1370, t);
          const py = lerp(880, 664, t);
          const sc = lerp(0.62, 0.32, t);
          return <PersonMini key={i} x={px} y={py} s={sc} f={f} phase={i} face={t > 0.75 ? "none" : "dot"}
            color={[C.stripeBlue, C.stripeBrown, C.suit][i % 3]} />;
        })}
        {/* 役所の石段の猫 (大あくび) */}
        <g transform="translate(400 700)">
          <ellipse cx={0} cy={0} rx={56} ry={26} fill={C.cat} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 50 -4 q 40 -10 ${30 + Math.sin(f / 6) * 8} -44`} stroke={C.cat} strokeWidth={12} fill="none" strokeLinecap="round" />
          <g transform={`translate(-50 -24) rotate(${-14 * yawn})`}>
            <circle r={30} fill={C.cat} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -26 -14 L -22 -44 L -6 -26 Z M 26 -14 L 22 -44 L 6 -26 Z" fill={C.cat} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -16 -6 q 5 -5 10 0 M 6 -6 q 5 -5 10 0" stroke={KRP.ink} strokeWidth={3.5} fill="none" />
            <ellipse cx={0} cy={12} rx={8 + 4 * yawn} ry={2 + 12 * yawn} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        <TagPlate x={280} y={PLATE_Y} text="役所" size={38} t={seg(f, 2, 10)} />
        <TagPlate x={840} y={PLATE_Y} text="学校" size={38} t={seg(f, 5, 13)} />
        <TagPlate x={1440} y={PLATE_Y} text="工場" size={38} t={seg(f, 8, 16)} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #75 工場で働く人の休みは、まだずっと、少ないままでした。
// 格: 山 / seed 5075
// どこ: 明治の紡績工場の門の前 (レンガの塀・鉄の門・奥に工場の屋根と煙突・塀の掲示板)
// 演出: 掲示板に工場の暦が1枚。赤い休みは月に2日だけ (1日と15日)。ほかは全部ふつうの日。
//       縞の着物の女工が2人、暦を見上げて「やれやれ」と肩をすくめる (汗・肩の線)。もう1人は先に門へ入っていく
// 動き: 門が開く / 煙 / 女工の列が進む / カメラが掲示板へ寄る
const Hm075: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 2, 16));
  const cam = easeInOut(seg(f, 0, 40));
  const walkA = easeInOut(seg(f, 8, 42));
  const shrug = seg(f, 26, 32);
  const shrugBob = shrug > 0 ? -Math.abs(Math.sin((f - 26) / 3)) * 8 * (f < 40 ? 1 : 0.5) : 0;
  const BX = 280, BY = 250; // 掲示板の左上
  return (
    <Frame f={f} seed={5075}>
      <Cam sc={lerp(1.0, 1.07, cam)} cx={620} cy={480}>
        {/* 空と奥の工場 */}
        <rect x={-80} y={-40} width={2100} height={600} fill={mix(C.skyDay, C.smoke, 0.25)} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${300 + i * 260} 300 L ${300 + i * 260} 210 L ${560 + i * 260} 300 Z`} fill={C.roofTile} stroke={KRP.ink} strokeWidth={6} />
        ))}
        <rect x={300} y={296} width={1560} height={20} fill={C.roofTileDark} />
        <rect x={1640} y={20} width={84} height={300} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
        {[60, 120, 180, 240].map((by) => <line key={by} x1={1640} y1={by} x2={1724} y2={by} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />)}
        <rect x={1628} y={10} width={108} height={24} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
        <HmDbSmoke x={1682} y={0} f={f} s={1.7} n={8} drift={-90} />
        {/* レンガの塀 */}
        <HmDbBrick x={-80} y={300} w={1180} h={480} seed={75} />
        <HmDbBrick x={1560} y={300} w={460} h={480} seed={76} />
        <rect x={-80} y={290} width={1180} height={22} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1560} y={290} width={460} height={22} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {/* 門柱 */}
        {[1060, 1560].map((px) => (
          <g key={px}>
            <rect x={px - 40} y={230} width={80} height={560} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
            <rect x={px - 50} y={214} width={100} height={26} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={px} cy={200} r={20} fill={HP.spark} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          </g>
        ))}
        {/* 門の中 (工場の敷地・明かりのついた窓) */}
        <rect x={1100} y={300} width={420} height={480} fill={C.mortar} />
        <rect x={1100} y={380} width={420} height={400} fill={C.brick} />
        {[1140, 1260, 1380].map((wx) => <rect key={wx} x={wx} y={430} width={80} height={110} fill={HP.spark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={1100} y={640} width={420} height={140} fill={KRP.floor} />
        {/* 鉄の門扉 (外側へ開く) */}
        {[-1, 1].map((sd) => {
          const hx = sd < 0 ? 1100 : 1520;
          const wd = 210 * (1 - open * 0.8);
          return (
            <g key={sd}>
              <rect x={sd < 0 ? hx : hx - wd} y={330} width={wd} height={450} fill="none" stroke={C.iron} strokeWidth={10} />
              {Array.from({ length: 7 }, (_, k) => {
                const lx = sd < 0 ? hx + (wd * (k + 0.5)) / 7 : hx - (wd * (k + 0.5)) / 7;
                return <line key={k} x1={lx} y1={330} x2={lx} y2={780} stroke={C.iron} strokeWidth={6} />;
              })}
              <line x1={hx} y1={480} x2={sd < 0 ? hx + wd : hx - wd} y2={480} stroke={C.iron} strokeWidth={8} />
            </g>
          );
        })}
        {/* 地面 */}
        <rect x={-80} y={780} width={2100} height={340} fill={KRP.floor} />
        <rect x={-80} y={776} width={2100} height={10} fill={C.stoneDark} />
        {/* 掲示板 (屋根つき) と工場の暦 */}
        <g>
          <polygon points={`${BX - 30},${BY + 10} ${BX + 250},${BY - 50} ${BX + 530},${BY + 10}`} fill={C.roofTile} stroke={KRP.ink} strokeWidth={6} />
          <rect x={BX} y={BY + 10} width={500} height={420} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={BX + 20} y={BY + 30} width={460} height={380} fill={C.woodPanel} stroke={KRP.ink} strokeWidth={4} />
          {[BX + 60, BX + 440].map((lx) => <rect key={lx} x={lx - 10} y={BY + 430} width={20} height={110} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
          <g transform={`rotate(${-1.5 + Math.sin(f / 16) * 0.6} ${BX + 250} ${BY + 60})`}>
            <rect x={BX + 50} y={BY + 50} width={400} height={340} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
            <rect x={BX + 50} y={BY + 50} width={400} height={44} fill={C.paperOldDark} stroke={KRP.ink} strokeWidth={5} />
            {/* 見出しは赤い丸の印だけ (字は数字のみ) */}
            <circle cx={BX + 250} cy={BY + 72} r={12} fill={HP.rest} stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 31 }, (_, k) => {
              const d = k + 1;
              const cx = BX + 82 + (k % 7) * 56, cy = BY + 126 + Math.floor(k / 7) * 56;
              const red = d === 1 || d === 15;
              return (
                <g key={d}>
                  {red && <rect x={cx - 24} y={cy - 24} width={48} height={48} rx={6} fill={HP.restSoft} stroke={HP.rest} strokeWidth={4}
                    transform={`translate(${cx} ${cy}) scale(${1 + 0.08 * Math.sin(f / 5)}) translate(${-cx} ${-cy})`} />}
                  <text x={cx} y={cy + 10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={red ? HP.rest : KRP.ink}>{d}</text>
                </g>
              );
            })}
            {[[BX + 62, BY + 60], [BX + 438, BY + 60]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
        </g>
        {/* 先に門へ入っていく女工 */}
        <g opacity={1 - seg(f, 36, 42) * 0.6}>
          <HmDbJoko x={lerp(940, 1300, walkA)} y={lerp(930, 820, walkA)} s={lerp(0.92, 0.72, walkA)} f={f} stripe="brown" face="normal"
            lean={Math.sin(f / 4) * 2} phase={5} gaze={[5, 0]} />
        </g>
        {/* 暦を見上げて肩をすくめる2人 */}
        {[[470, "blue", 1], [720, "brown", 3]].map(([x, st, ph], i) => (
          <g key={i} transform={`translate(0 ${shrugBob})`}>
            <HmDbJoko x={x as number} y={935} s={0.95} f={f} stripe={st as "blue" | "brown"} face={shrug > 0 ? "worried" : "normal"}
              gaze={[i === 0 ? 3 : -2, -7]} phase={ph as number} lean={i === 0 ? -3 : 3} />
            {shrug > 0 && (
              <g opacity={shrug} stroke={KRP.ink} strokeWidth={4.5} fill="none" strokeLinecap="round">
                <path d={`M ${(x as number) - 86} ${935 - 175} q -14 -12 -6 -30`} />
                <path d={`M ${(x as number) + 86} ${935 - 175} q 14 -12 6 -30`} />
                <path d={`M ${(x as number) + 58} ${935 - 250} q 8 12 0 20 q -8 -8 0 -20 Z`} fill={KRP.blue} strokeWidth={3} />
              </g>
            )}
          </g>
        ))}
        {/* 吹き出し (ため息) */}
        {shrug > 0 && (
          <g opacity={shrug} transform={`translate(880 ${560 - shrug * 10})`}>
            <ellipse rx={58} ry={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-22} cy={0} r={6} fill={KRP.ink} /><circle cx={0} cy={0} r={6} fill={KRP.ink} /><circle cx={22} cy={0} r={6} fill={KRP.ink} />
          </g>
        )}
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #76 第4章、時計が、1日を切り分けた。
// 格: 山 / seed 5076
// どこ: 明治の紡績工場の外観 (レンガの棟・のこぎり屋根・まん中に大きな時計塔・煙突・土の前庭)
// 演出: 時計塔の長針がぐるりと1周するあいだに、針が通った後ろの空がパイのように切り分けられ、
//       朝 (淡い黄)・昼 (青)・夕 (橙)・夜 (紺に星) の4つの扇形になって文字盤から広がる。切れ目に白い光の筋。
//       右に章の題字
// 動き: 針が回る / 扇形が広がる / 煙突の煙 / カメラが時計塔へ寄る
const HM76_SKY = ["#F6DFA6", "#A9D3EC", "#EFA36E", "#2F3866"];
const Hm076: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const sweep = 360 * easeInOut(seg(f, 6, 38));
  const R = lerp(140, 640, easeOut(seg(f, 4, 34)));
  const cam = easeInOut(seg(f, 0, 40));
  const CX = 520, CY = 330;
  const sector = (a0: number, a1: number) => {
    const p = (a: number) => [CX + Math.sin((a * Math.PI) / 180) * R, CY - Math.cos((a * Math.PI) / 180) * R];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  return (
    <Frame f={f} seed={5076}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={4} title="時計が、1日を切り分けた。" t={door} left={1000} top={560} />
      </>}>
      <Cam sc={lerp(1.0, 1.12, cam)} cx={CX} cy={CY + 120}>
        {/* もとの空 (灰色がかった白) */}
        <rect x={-200} y={-200} width={2400} height={900} fill={mix(C.skyDay, KRP.white, 0.4)} />
        {/* 切り分けられる空 */}
        <defs><clipPath id="hmdb76-sky"><rect x={-200} y={-200} width={2400} height={900} /></clipPath></defs>
        <g clipPath="url(#hmdb76-sky)">
          {[0, 1, 2, 3].map((i) => {
            const a0 = i * 90, a1 = Math.min(sweep, (i + 1) * 90);
            if (a1 <= a0 + 0.5) return null;
            return <path key={i} d={sector(a0, a1)} fill={HM76_SKY[i]} stroke={KRP.ink} strokeWidth={5} />;
          })}
          {/* 夜の扇の星と月 */}
          {sweep > 280 && [[-80, -40], [-200, 60], [-300, -120], [-140, -220], [-360, 20]].map(([sx, sy], i) => (
            <circle key={i} cx={CX + sx * (R / 600)} cy={CY + sy * (R / 600)} r={5} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} />
          ))}
          {sweep > 300 && <circle cx={CX - 300 * (R / 700)} cy={CY - 120 * (R / 700)} r={30} fill="#FFF3C4" />}
          {/* 朝と昼の太陽 */}
          {sweep > 40 && <circle cx={CX + 180 * (R / 700)} cy={CY - 300 * (R / 700)} r={34} fill={KRP.white} opacity={0.8} />}
          {sweep > 130 && <circle cx={CX + 610 * (R / 700)} cy={CY + 60 * (R / 700)} r={40} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />}
          {/* 切れ目の光 */}
          {[0, 90, 180, 270].filter((a) => a < sweep).map((a) => (
            <line key={a} x1={CX} y1={CY} x2={CX + Math.sin((a * Math.PI) / 180) * R} y2={CY - Math.cos((a * Math.PI) / 180) * R}
              stroke={KRP.white} strokeWidth={10} opacity={0.7} />
          ))}
        </g>
        {/* 煙突と煙 */}
        <rect x={860} y={140} width={80} height={440} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={848} y={128} width={104} height={24} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
        <HmDbSmoke x={900} y={110} f={f} s={1.4} n={7} drift={120} />
        {/* 工場の棟 (レンガ + のこぎり屋根) */}
        <HmDbBrick x={-200} y={500} w={1260} h={260} seed={760} />
        <rect x={-200} y={500} width={1260} height={260} fill="none" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <path d={`M ${-200 + i * 160} 500 L ${-200 + i * 160} 420 L ${-40 + i * 160} 500 Z`} fill={C.roofTile} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-196 + i * 160} y={432} width={12} height={64} fill={C.glass} />
          </g>
        ))}
        {[-140, 20, 700, 860].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={560} width={90} height={120} rx={44} fill={HP.spark} stroke={KRP.ink} strokeWidth={5} />
            <line x1={wx + 45} y1={560} x2={wx + 45} y2={680} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 時計塔 */}
        <rect x={410} y={190} width={220} height={570} fill={C.brick} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 14 }, (_, r) => <line key={r} x1={410} y1={220 + r * 38} x2={630} y2={220 + r * 38} stroke={C.brickDark} strokeWidth={3} />)}
        <polygon points="390,196 520,70 650,196" fill={C.roofTile} stroke={KRP.ink} strokeWidth={8} />
        <line x1={520} y1={70} x2={520} y2={20} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={520} cy={18} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <rect x={470} y={560} width={100} height={200} rx={50} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <HmDbClock x={CX} y={CY} r={96} hourDeg={sweep / 12 + 180} minDeg={sweep} f={f} frame={C.stone} />
        {/* 針の先の光 */}
        <circle cx={CX + Math.sin((sweep * Math.PI) / 180) * 70} cy={CY - Math.cos((sweep * Math.PI) / 180) * 70} r={8} fill={HP.spark} opacity={0.9} />
        {/* 前庭 */}
        <rect x={-200} y={760} width={2400} height={400} fill={KRP.floor} />
        <rect x={-200} y={756} width={2400} height={10} fill={C.stoneDark} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #77 明治の紡績工場では、機械が一日中、止まりません。
// 格: 山 / seed 5077
// どこ: 紡績工場の中 (高い窓の並ぶ壁・天井を走る回転軸と滑車・ベルト・奥と手前の2列の精紡機・板の床・綿ぼこり)
// 演出: 何十本もの紡錘がくるくる回り、上の篠巻きから糸がぴんと張って流れ落ちる。
//       窓の外の空が f で 昼 → 夕焼け → 夜 (星・月) と変わり、壁の時計の針も早回し。それでも機械は回りっぱなし。
//       夜になると天井のランプが点く。手前で女工が糸を見張り続ける
// 動き: 紡錘の回転 / ベルトの流れ / 窓の空の色 / 時計の早回し / カメラがゆっくりパン
const Hm077: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 4, 40);
  const sky = t < 0.5 ? mix(C.skyDay, C.dusk, t * 2) : mix(C.dusk, C.night, t * 2 - 1);
  const lamp = seg(f, 28, 36);
  const pan = easeInOut(seg(f, 0, 42));
  const dash = -f * 7;
  const SpinRow: React.FC<{ y: number; s: number; n: number; x0: number; gap: number; ph: number }> = ({ y, s, n, x0, gap, ph }) => (
    <g>
      {/* 機械の台 */}
      <rect x={x0 - 40} y={y - 190 * s} width={gap * n + 60} height={26 * s} rx={6} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x0 - 40} y={y - 40 * s} width={gap * n + 60} height={40 * s} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x0 - 40} y={y} width={gap * n + 60} height={90 * s} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: Math.ceil(n / 4) + 1 }, (_, k) => (
        <rect key={k} x={x0 - 40 + k * gap * 4} y={y - 190 * s} width={16 * s} height={280 * s} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const sx = x0 + i * gap;
        const hl = ((f * 9 + i * 11 + ph) % 26) - 13;
        const vib = Math.sin(f * 1.7 + i) * 1.2;
        return (
          <g key={i}>
            {/* 篠巻き (上の大きな糸巻き) */}
            <rect x={sx - 12 * s} y={y - 250 * s} width={24 * s} height={60 * s} rx={8 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            {/* 張った糸 */}
            <path d={`M ${sx} ${y - 190 * s} Q ${sx + vib} ${y - 130 * s} ${sx} ${y - 76 * s}`} stroke={KRP.white} strokeWidth={2.5} fill="none" />
            <path d={`M ${sx} ${y - 190 * s} Q ${sx + vib} ${y - 130 * s} ${sx} ${y - 76 * s}`} stroke={KRP.ink} strokeWidth={0.8} fill="none" opacity={0.5} />
            {/* 回る紡錘 (糸の巻けた胴) */}
            <ellipse cx={sx} cy={y - 58 * s} rx={15 * s} ry={22 * s} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
            <line x1={sx + hl * s * 0.8} y1={y - 76 * s} x2={sx + hl * s * 0.8} y2={y - 40 * s} stroke={KRP.white} strokeWidth={4 * s} opacity={0.9} />
            <line x1={sx + (hl * 0.8 - 8) * s} y1={y - 74 * s} x2={sx + (hl * 0.8 - 8) * s} y2={y - 42 * s} stroke={KRP.grayDark} strokeWidth={2} opacity={0.6} />
            <line x1={sx} y1={y - 84 * s} x2={sx} y2={y - 30 * s} stroke={KRP.ink} strokeWidth={3} />
          </g>
        );
      })}
      {/* 回転のしるし (台の端の歯車) */}
      <g transform={`translate(${x0 - 70} ${y + 30 * s}) rotate(${f * 12})`}>
        <circle r={36 * s} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-6 * s} y={-46 * s} width={12 * s} height={14 * s} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${k * 45})`} />)}
        <circle r={8 * s} fill={KRP.ink} />
      </g>
    </g>
  );
  const hh = 180 + t * 300, mm = t * 3600;
  return (
    <Frame f={f} seed={5077} dark={t > 0.7}>
      <Cam dx={lerp(40, -40, pan)} sc={1.06}>
        {/* 奥の壁 */}
        <rect x={-120} y={-40} width={2200} height={700} fill={mix(C.plaster, C.night, t * 0.45)} />
        {/* 高い窓 (空の色が昼→夕→夜) */}
        {Array.from({ length: 7 }, (_, i) => {
          const wx = -40 + i * 300;
          return (
            <g key={i}>
              <rect x={wx} y={70} width={170} height={300} rx={80} fill={sky} stroke={KRP.ink} strokeWidth={7} />
              {t > 0.7 && [0, 1, 2].map((k) => <circle key={k} cx={wx + 40 + k * 46} cy={140 + ((k * 53 + i * 31) % 120)} r={4} fill={KRP.white} opacity={(t - 0.7) * 3 * (0.6 + 0.4 * Math.sin(f / 4 + k + i))} />)}
              {t > 0.55 && i === 4 && <circle cx={wx + 110} cy={150} r={26} fill="#FFF3C4" opacity={(t - 0.55) * 2.2} />}
              {t < 0.4 && i === 1 && <circle cx={wx + 80} cy={140 + t * 300} r={30} fill={KRP.yellow} opacity={1 - t * 2.2} />}
              <line x1={wx + 85} y1={70} x2={wx + 85} y2={370} stroke={KRP.ink} strokeWidth={5} />
              <line x1={wx} y1={240} x2={wx + 170} y2={240} stroke={KRP.ink} strokeWidth={5} />
              <rect x={wx - 10} y={366} width={190} height={16} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 壁の時計 (早回し) */}
        <HmDbClock x={1010} y={240} r={70} hourDeg={hh} minDeg={mm} f={f} />
        {/* 天井の回転軸・滑車・ベルト */}
        <rect x={-120} y={-40} width={2200} height={70} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-120} y={34} width={2200} height={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 7 }, (_, i) => {
          const px = 110 + i * 300;
          return (
            <g key={i}>
              <path d={`M ${px - 26} 41 L ${px - 30} 560 M ${px + 26} 41 L ${px + 30} 560`} stroke={C.woodDeep} strokeWidth={10} strokeDasharray="22 10" strokeDashoffset={dash} />
              <path d={`M ${px - 26} 41 L ${px - 30} 560 M ${px + 26} 41 L ${px + 30} 560`} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
              <g transform={`translate(${px} 41) rotate(${f * 14})`}>
                <circle r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
                <line x1={-26} y1={0} x2={26} y2={0} stroke={KRP.ink} strokeWidth={4} />
                <line x1={0} y1={-26} x2={0} y2={26} stroke={KRP.ink} strokeWidth={4} />
              </g>
            </g>
          );
        })}
        {/* 天井のランプ (夜に点く) */}
        {[260, 860, 1460].map((lx) => (
          <g key={lx}>
            <line x1={lx} y1={48} x2={lx} y2={110} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 34} 140 Q ${lx} 96 ${lx + 34} 140 Z`} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={144} r={12} fill={lamp > 0 ? C.gas : KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <polygon points={`${lx - 30},144 ${lx + 30},144 ${lx + 220},700 ${lx - 220},700`} fill={C.gas} opacity={0.16 * lamp} />
          </g>
        ))}
        {/* 奥の列の機械 */}
        <SpinRow y={560} s={0.62} n={36} x0={20} gap={52} ph={5} />
        {/* 板の床 */}
        <rect x={-120} y={640} width={2200} height={500} fill={mix(KRP.floor, C.night, t * 0.3)} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-120} y1={660 + i * 40} x2={2080} y2={660 + i * 40} stroke={C.woodPanel} strokeWidth={3} opacity={0.5} />)}
        {/* 手前の列の機械 */}
        <SpinRow y={800} s={1.0} n={22} x0={60} gap={84} ph={0} />
        {/* 舞う綿ぼこり */}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={(rnd(770, i) * 2000 + f * (1 + i % 3)) % 2000} cy={300 + rnd(771, i) * 400 + Math.sin(f / 7 + i) * 10} r={4 + (i % 3) * 2}
            fill={KRP.white} opacity={0.65} />
        ))}
        {/* 手前で糸を見張る女工 */}
        <HmDbJoko x={1500} y={960} s={0.95} f={f} stripe="blue" face="normal" gaze={[-5, -5]} lean={-4} phase={2} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #78 昼の組と夜の組が交代で、1日11時間以上、働きました。
// 格: 山 / seed 5078
// どこ: 工場の入口の土間 (板壁・開いた大戸の向こうに夕暮れの構内・戸の上の大時計・左の壁の名札掛け)
// 演出: 夕方の交代。戸口から昼の組 (青い縞) がくたびれ顔で出てきて左へ、夜の組 (茶の縞・提灯) が右から戸口へ入っていく。
//       戸口の前ですれちがう。名札掛けの木札が1枚ずつ、ぱたぱたと裏返る (表=白 → 裏=黒)
// 動き: 2組のすれちがい / 札が順に裏返る / 時計の針 / 提灯のゆれ / カメラがゆっくり寄る
const Hm078: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeInOut(seg(f, 2, 42));
  const cam = easeInOut(seg(f, 0, 42));
  const PY = 640;
  return (
    <Frame f={f} seed={5078}>
      <Cam sc={lerp(1.0, 1.05, cam)} cy={480}>
        {/* 板壁 */}
        <rect x={-80} y={-40} width={2100} height={900} fill={C.woodWall} />
        <g stroke={C.woodPanel} strokeWidth={5}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={-80 + i * 90} y1={-40} x2={-80 + i * 90} y2={860} />)}</g>
        <rect x={-80} y={-40} width={2100} height={40} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        {/* 開いた大戸と外の夕暮れ */}
        <rect x={720} y={230} width={480} height={600} fill={C.dusk} />
        <rect x={720} y={230} width={480} height={240} fill={mix(C.dusk, C.night, 0.35)} />
        <circle cx={1080} cy={420} r={44} fill={KRP.yellow} opacity={0.9} />
        <path d="M 720 560 L 860 470 L 1000 470 L 1000 560 Z" fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1100} y={420} width={40} height={140} fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
        <HmDbSmoke x={1120} y={410} f={f} s={0.6} n={5} drift={50} />
        <rect x={720} y={560} width={480} height={270} fill={KRP.floor} />
        <rect x={700} y={210} width={520} height={30} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={700} y={210} width={30} height={620} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1190} y={210} width={30} height={620} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {/* 引き戸 (右に寄せてある) */}
        <rect x={1220} y={240} width={240} height={590} fill={C.woodPanel} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, k) => <line key={k} x1={1220} y1={330 + k * 100} x2={1460} y2={330 + k * 100} stroke={C.woodDark} strokeWidth={4} />)}
        {/* 戸の上の大時計 */}
        <rect x={880} y={30} width={160} height={36} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        <HmDbClock x={960} y={130} r={70} hourDeg={180 + f * 0.25} minDeg={f * 3} f={f} />
        {/* 名札掛け */}
        <g>
          <rect x={110} y={170} width={460} height={400} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
          <polygon points="90,176 340,120 590,176" fill={C.roofTile} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 24 }, (_, k) => {
            const c = k % 6, r = Math.floor(k / 6);
            const px = 160 + c * 72, py = 210 + r * 88;
            const p = seg(f, 6 + k * 1.3, 9 + k * 1.3);
            const sx = Math.abs(Math.cos(Math.PI * p));
            // 上の2段 = 昼の組 (白→黒に裏返る)、下の2段 = 夜の組 (黒→白に表返る)
            const back = k < 12 ? p > 0.5 : p <= 0.5;
            const swing = p > 0 && p < 1 ? Math.sin(p * Math.PI) * 6 : 0;
            return (
              <g key={k}>
                <circle cx={px + 25} cy={py} r={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
                <g transform={`translate(${px + 25} ${py + 6}) scale(${Math.max(sx, 0.06)} 1) rotate(${swing})`}>
                  <rect x={-25} y={0} width={50} height={70} rx={4} fill={back ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <rect x={-12} y={12} width={24} height={46} rx={3} fill="none" stroke={back ? KRP.grayDark : C.paperOldDark} strokeWidth={3} />
                </g>
              </g>
            );
          })}
        </g>
        {/* 土間 */}
        <rect x={-80} y={830} width={2100} height={300} fill={C.stoneDark} />
        <rect x={-80} y={824} width={2100} height={12} fill={C.woodDeep} />
        {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={rnd(781, i) * 1920} cy={860 + rnd(782, i) * 200} rx={14} ry={4} fill={C.stone} opacity={0.5} />)}
        {/* 夜の組 (右から戸口へ・奥へ小さくなる) */}
        {[0, 1, 2].map((i) => {
          const x = lerp(1640 + i * 130, 1060 + i * 110, walk);
          const s = lerp(0.88, 0.74, walk);
          const y = lerp(980, 900, walk) + i * 6;
          return (
            <g key={`n${i}`}>
              <HmDbJoko x={x} y={y} s={s} f={f} stripe="brown" face="normal" gaze={[-5, -1]} lean={-3 + Math.sin(f / 5 + i) * 2} phase={i + 4} />
              {i === 0 && (
                <g>
                <line x1={x - 67 * s} y1={y - 66 * s} x2={x - 170 * s} y2={y - 250 * s} stroke={C.woodDark} strokeWidth={7} strokeLinecap="round" />
                <circle cx={x - 67 * s} cy={y - 66 * s} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                <g transform={`translate(${x - 170 * s} ${y - 250 * s}) rotate(${Math.sin(f / 6) * 8})`}>
                  <line x1={0} y1={0} x2={0} y2={30} stroke={KRP.ink} strokeWidth={4} />
                  <ellipse cx={0} cy={58} rx={24} ry={32} fill={C.gas} stroke={KRP.ink} strokeWidth={4} />
                  {[44, 58, 72].map((ly) => <line key={ly} x1={-22} y1={ly} x2={22} y2={ly} stroke={C.giftRibbon} strokeWidth={2} opacity={0.8} />)}
                  <circle cx={0} cy={58} r={40} fill={C.gas} opacity={0.25} />
                </g>
                </g>
              )}
            </g>
          );
        })}
        {/* 昼の組 (戸口から出て左へ・くたびれ顔) */}
        {[0, 1, 2].map((i) => {
          const x = lerp(920 + i * 70, 260 + i * 170, walk);
          const s = lerp(0.76, 0.9, walk);
          const y = lerp(900, 960, walk) - i * 6;
          return (
            <g key={`d${i}`}>
              <HmDbJoko x={x} y={y} s={s} f={f} stripe="blue" face={i === 1 ? "sad" : "normal"} gaze={[-5, 4]} lean={4 + Math.sin(f / 6 + i) * 2} phase={i} />
              {i === 1 && (
                // くたびれの汗と、とぼとぼの線
                <g stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7}>
                  <path d={`M ${x + 70 * s} ${y - 280 * s} q 10 8 4 20`} />
                  <path d={`M ${x + 84 * s} ${y - 250 * s} q 10 8 4 20`} />
                </g>
              )}
            </g>
          );
        })}
        <TagPlate x={420} y={PY} text="昼の組" size={36} t={seg(f, 6, 14)} fill={C.glass} />
        <TagPlate x={1180} y={PY} text="夜の組" size={36} t={seg(f, 8, 16)} fill={C.paperOld} />
        <TagPlate x={1560} y={110} text="1日11時間以上" size={40} t={seg(f, 14, 22)} rot={2} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #79 何時に来て、何時に帰るか。決めるのは、壁の時計です。
// 格: 山 / seed 5079
// どこ: 工場の中のレンガの壁。まん中に大きな壁時計、その下に監督の机。左右の壁に出入りの戸
// 演出: 時計の長針と短針の先から長い糸が垂れ、女工たちは操り人形の十字の板につながれている。
//       長針の糸に引かれた組は左の戸から入ってきて、短針の糸の組は右の戸から出ていく (ぴょこぴょこ歩き)。
//       机の監督は時計を見上げて笛を吹く (ピッの音の線)
// 動き: 針が回る / 糸に引かれて人が動く / 笛の音 / カメラがゆっくり引く
const HmDb79Puppet: React.FC<{ x: number; y: number; s: number; f: number; stripe: "blue" | "brown"; phase: number; tip: [number, number]; face?: Face }> = ({
  x, y, s, f, stripe, phase, tip, face = "normal",
}) => {
  const hop = -Math.abs(Math.sin((f + phase * 7) / 4)) * 12;
  const yy = y + hop;
  const barY = yy - 380 * s;
  const tilt = Math.sin((f + phase * 7) / 4) * 8;
  return (
    <g>
      {/* 時計の針から十字の板へ */}
      <line x1={tip[0]} y1={tip[1]} x2={x} y2={barY} stroke={KRP.white} strokeWidth={3.5} />
      <line x1={tip[0]} y1={tip[1]} x2={x} y2={barY} stroke={KRP.ink} strokeWidth={1.2} opacity={0.6} />
      <HmDbJoko x={x} y={yy} s={s} f={f} stripe={stripe} face={face} gaze={[0, -6]} lean={tilt * 0.4} phase={phase} />
      {/* 十字の板と、頭・両手へ垂れる糸 */}
      <g transform={`rotate(${tilt} ${x} ${barY})`}>
        {[[x, yy - 300 * s], [x - 90 * s, yy - 70 * s], [x + 90 * s, yy - 70 * s]].map(([sx, sy], k) => (
          <line key={k} x1={x + (k === 0 ? 0 : k === 1 ? -80 : 80) * s} y1={barY} x2={sx} y2={sy} stroke={KRP.ink} strokeWidth={2} opacity={0.75} />
        ))}
        <rect x={x - 90 * s} y={barY - 8} width={180 * s} height={16} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={x - 8} y={barY - 50 * s} width={16} height={100 * s} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};
const Hm079: React.FC<{ f: number }> = ({ f }) => {
  const CX = 960, CY = 270, R = 180;
  const minDeg = 250 + f * 2.2, hourDeg = 40 + f * 0.5;
  const tipOf = (deg: number, len: number): [number, number] =>
    [CX + Math.sin((deg * Math.PI) / 180) * R * len, CY - Math.cos((deg * Math.PI) / 180) * R * len];
  const mTip = tipOf(minDeg, 0.74), hTip = tipOf(hourDeg, 0.5);
  const walk = easeInOut(seg(f, 2, 42));
  const cam = easeInOut(seg(f, 0, 40));
  const blow = (f % 20) < 8 && f > 8;
  return (
    <Frame f={f} seed={5079}>
      <Cam sc={lerp(1.06, 1.0, cam)} cy={460}>
        {/* レンガの壁と腰板 */}
        <HmDbBrick x={-80} y={-40} w={2100} h={640} seed={79} />
        <rect x={-80} y={600} width={2100} height={240} fill={C.woodPanel} />
        <rect x={-80} y={596} width={2100} height={16} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        {/* 左右の戸 */}
        {[[70, "左"], [1610, "右"]].map(([dx], i) => (
          <g key={i}>
            <rect x={dx as number} y={330} width={240} height={510} fill={KRP.ink} opacity={0.82} />
            <rect x={(dx as number) - 16} y={314} width={272} height={526} fill="none" stroke={C.woodDeep} strokeWidth={22} />
            <rect x={(dx as number) - 26} y={304} width={292} height={546} fill="none" stroke={KRP.ink} strokeWidth={5} />
            <rect x={(dx as number) + 30} y={360} width={180} height={120} fill={i === 0 ? C.skyLow : C.dusk} opacity={0.6} />
          </g>
        ))}
        {/* 大時計 (振り子つきの箱) */}
        <rect x={CX - 230} y={CY - 240} width={460} height={540} rx={30} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={8} />
        <rect x={CX - 60} y={CY + 220} width={120} height={60} rx={8} fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 5) * 14} ${CX} ${CY + 200})`}>
          <line x1={CX} y1={CY + 200} x2={CX} y2={CY + 262} stroke={KRP.brass} strokeWidth={5} />
          <circle cx={CX} cy={CY + 266} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <HmDbClock x={CX} y={CY} r={R} hourDeg={hourDeg} minDeg={minDeg} f={f} frame={C.woodDark} />
        {/* 針の先の糸の結び目 */}
        {[mTip, hTip].map(([tx, ty], i) => <circle key={i} cx={tx} cy={ty} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 床 */}
        <rect x={-80} y={840} width={2100} height={300} fill={KRP.floor} />
        <g stroke={C.woodPanel} strokeWidth={3} opacity={0.6}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={-80} y1={870 + i * 40} x2={2000} y2={870 + i * 40} />)}</g>
        {/* 長針の糸の組: 左の戸から入ってくる */}
        <HmDb79Puppet x={lerp(150, 470, walk)} y={900} s={0.78} f={f} stripe="blue" phase={0} tip={mTip} face="normal" />
        <HmDb79Puppet x={lerp(-60, 260, walk)} y={910} s={0.78} f={f} stripe="brown" phase={2} tip={mTip} />
        {/* 短針の糸の組: 右の戸から出ていく */}
        <HmDb79Puppet x={lerp(1420, 1720, walk)} y={900} s={0.78} f={f} stripe="blue" phase={4} tip={hTip} />
        <HmDb79Puppet x={lerp(1240, 1530, walk)} y={910} s={0.78} f={f} stripe="brown" phase={6} tip={hTip} face="sad" />
        {/* 監督の机と監督 (時計を見上げて笛) */}
        <HmDbYakunin x={960} y={900} s={0.95} f={f} suit face={blow ? "angry" : "normal"} gaze={[0, -8]} pose="stand" phase={1} />
        <g>
          <rect x={940} y={704} width={46} height={16} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={990} cy={712} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={990} y1={724} x2={1000} y2={760} stroke={C.obi} strokeWidth={3} />
          {blow && [0, 1, 2].map((k) => (
            <path key={k} d={`M ${1020 + k * 22} ${690 - k * 6} q 14 22 0 44`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - k * 0.25} />
          ))}
        </g>
        <rect x={720} y={790} width={480} height={30} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={740} y={818} width={440} height={180} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={780} y={760} width={150} height={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => <line key={k} x1={790} y1={770 + k * 8} x2={910} y2={770 + k * 8} stroke={KRP.gray} strokeWidth={3} />)}
        <rect x={1060} y={740} width={20} height={54} fill={KRP.ink} />
        <ellipse cx={1070} cy={740} rx={22} ry={8} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #80 工場と時計が、仕事の時間と、仕事の外の時間を、くっきり分けた。そんな説があります。
// 格: 図 / seed 5080
// どこ: 工場の監督の黒板 (木の枠・チョーク受け・チョークと黒板消し・上に吊るした小さな時計)。板壁に掛けてある
// 演出: 黒板の上に「1日」の1本の帯 (チョークで24の目盛り)。持ち手が時計の形のハサミが飛んできて、じょきん!
//       切れた帯は左「仕事の時間」(灰色・歯車) と右「仕事の外の時間」(橙・家) に色づいて、ぱっと離れる。
//       右上に小さく「〜という説」
// 動き: ハサミが寄って切る / チョークの粉が散る / 2つに分かれて離れる / カメラが少し寄る
const Hm080: React.FC<{ f: number }> = ({ f }) => {
  const come = easeOut(seg(f, 2, 14));
  const snip = seg(f, 14, 20);
  const part = easeOut(seg(f, 20, 32));
  const color = seg(f, 22, 30);
  const cam = easeInOut(seg(f, 0, 40));
  const CUT = 1030;
  const BY = 470, BH = 120;
  const L0 = 300, R0 = 1620;
  const off = part * 70;
  const open = snip < 1 ? (1 - Math.sin(snip * Math.PI)) * 26 : 26 * seg(f, 26, 34);
  const sx = lerp(1500, CUT, come), sy = lerp(260, BY + BH + 40, come);
  const Gear: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
    <g transform={`translate(${x} ${y}) rotate(${f * 4})`}>
      {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-r * 0.22} y={-r * 1.25} width={r * 0.44} height={r * 0.5} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${k * 45})`} />)}
      <circle r={r} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <circle r={r * 0.36} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  return (
    <Frame f={f} seed={5080}>
      <Cam sc={lerp(1.0, 1.05, cam)} cy={500}>
        {/* 板壁 */}
        <rect x={-80} y={-40} width={2100} height={1160} fill={C.woodWall} />
        <g stroke={C.woodPanel} strokeWidth={5}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={-80 + i * 90} y1={-40} x2={-80 + i * 90} y2={1120} />)}</g>
        {/* 黒板 */}
        <rect x={130} y={110} width={1660} height={720} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={160} y={140} width={1600} height={660} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
        {/* 消し残しのチョークのあと */}
        {[[300, 220, 260], [1300, 700, 300], [700, 740, 180]].map(([ex, ey, ew], i) => (
          <path key={i} d={`M ${ex} ${ey} q ${ew / 2} -20 ${ew} 0`} stroke={C.chalk} strokeWidth={26} opacity={0.08} fill="none" strokeLinecap="round" />
        ))}
        {/* チョーク受けとチョーク・黒板消し */}
        <rect x={180} y={800} width={1560} height={24} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        {[[420, KRP.white], [470, KRP.yellow], [520, HP.restSoft]].map(([cx, cc], i) => <rect key={i} x={cx as number} y={786} width={40} height={14} rx={6} fill={cc as string} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={1460} y={772} width={120} height={30} rx={4} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1460} y={792} width={120} height={12} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        {/* 帯: 1日 (24の目盛り) */}
        {(() => {
          const leftW = CUT - L0, rightW = R0 - CUT;
          return (
            <g>
              <g transform={`translate(${-off} ${part * 16}) rotate(${-part * 3} ${L0} ${BY})`}>
                <rect x={L0} y={BY} width={leftW} height={BH} rx={14} fill={mix(C.paperOld, "#9AA0A8", color)} stroke={C.chalk} strokeWidth={6} />
                {Array.from({ length: 16 }, (_, k) => <line key={k} x1={L0 + (k + 1) * ((R0 - L0) / 24)} y1={BY} x2={L0 + (k + 1) * ((R0 - L0) / 24)} y2={BY + (k % 6 === 5 ? 40 : 22)} stroke={C.chalk} strokeWidth={4} />)}
                {color > 0 && <g opacity={color}><Gear x={L0 + leftW / 2} y={BY + BH / 2} r={34} /></g>}
              </g>
              <g transform={`translate(${off} ${part * 16}) rotate(${part * 3} ${R0} ${BY})`}>
                <rect x={CUT} y={BY} width={rightW} height={BH} rx={14} fill={mix(C.paperOld, KRP.orange, color)} stroke={C.chalk} strokeWidth={6} />
                {Array.from({ length: 7 }, (_, k) => <line key={k} x1={CUT + (k + 1) * ((R0 - L0) / 24) - 7} y1={BY} x2={CUT + (k + 1) * ((R0 - L0) / 24) - 7} y2={BY + 22} stroke={C.chalk} strokeWidth={4} />)}
                {color > 0 && (
                  <g opacity={color} transform={`translate(${CUT + rightW / 2} ${BY + BH / 2 + 6})`}>
                    <rect x={-34} y={-16} width={68} height={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                    <polygon points="-46,-14 0,-52 46,-14" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                    <rect x={-10} y={6} width={20} height={24} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
                  </g>
                )}
              </g>
            </g>
          );
        })()}
        {/* 切れ目のチョークの粉と火花 */}
        {snip > 0.5 && part < 1 && Array.from({ length: 10 }, (_, k) => {
          const a = (k * 36 * Math.PI) / 180;
          const d = 30 + part * 110;
          return <circle key={k} cx={CUT + Math.cos(a) * d} cy={BY + BH / 2 + Math.sin(a) * d * 0.8} r={7 - part * 4} fill={C.chalk} opacity={1 - part} />;
        })}
        {snip > 0.5 && part < 0.8 && [0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k * 60 + 30) * Math.PI / 180;
          return <line key={k} x1={CUT + Math.cos(a) * 80} y1={BY + BH / 2 + Math.sin(a) * 80} x2={CUT + Math.cos(a) * 130} y2={BY + BH / 2 + Math.sin(a) * 130} stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={1 - part} />;
        })}
        {/* 時計のハサミ (持ち手の輪が時計) */}
        <g transform={`translate(${sx} ${sy}) rotate(${lerp(-50, 0, come) + part * 8})`}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`rotate(${sd * open * 0.5})`}>
              {/* 刃 (支点から上へ) */}
              <path d={`M -13 4 L 13 4 L ${sd * 6} -214 Q ${-sd * 10} -120 -13 4 Z`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              <line x1={sd * 2} y1={-20} x2={sd * 5} y2={-190} stroke={KRP.white} strokeWidth={3} opacity={0.7} />
              {/* 柄 (支点から反対側の下へ) と、時計の輪 */}
              <line x1={0} y1={0} x2={-sd * 36} y2={56} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
              <line x1={0} y1={0} x2={-sd * 36} y2={56} stroke={KRP.silver} strokeWidth={12} strokeLinecap="round" />
              <g transform={`translate(${-sd * 42} 96)`}>
                <circle r={44} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
                <circle r={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-26} x2={0} y2={-20} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${a})`} />)}
                <line x1={0} y1={0} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${f * 8 * sd})`} />
                <line x1={0} y1={0} x2={14} y2={0} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
              </g>
            </g>
          ))}
          <circle r={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <TagPlate x={680} y={720} text="仕事の時間" size={40} t={seg(f, 26, 34)} fill={KRP.gray} />
        <TagPlate x={1360} y={720} text="仕事の外の時間" size={40} t={seg(f, 28, 36)} fill={KRP.cream} />
        <TagPlate x={1600} y={200} text="〜という説" size={28} t={seg(f, 32, 40)} rot={4} />
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #81 といっても、時計が暇をプレゼントしてくれたわけでは、ありません。
// 格: 山 / seed 5081
// どこ: 工場の休憩所 (しっくい壁と腰板・柱掛けの大きな振り子時計・長いすとお茶の盆・やかん)
// 演出: 振り子時計の下の扉がぱかっと開き、リボンのかかったプレゼントの箱が出てくる。上には「暇」の雲の夢。
//       女工がにこにこ手を伸ばした瞬間、ふたが飛んで、中からばねつきの糸巻きがびよーん! (びっくり箱)。
//       女工はのけぞり、長いすでお茶を飲んでいた同僚は吹き出してお茶がこぼれる
// 動き: 扉が開く / 箱が出て着地 / ふたが飛ぶ / ばねの伸び縮み / のけぞり
const Hm081: React.FC<{ f: number }> = ({ f }) => {
  const doorOpen = easeOut(seg(f, 2, 8));
  const out = easeOut(seg(f, 6, 16));
  const land = seg(f, 14, 18);
  const dream = seg(f, 14, 20) * (1 - seg(f, 26, 29));
  const OPEN = 26;
  const tt = Math.max(0, (f - OPEN) / 16);
  const ext = f >= OPEN ? 280 * (1 - Math.exp(-4 * tt) * Math.cos(13 * tt)) : 0;
  const shock = seg(f, OPEN, OPEN + 4);
  const BX = 960;
  const boxY = lerp(560, 780, out) - Math.sin(land * Math.PI) * 14; // 箱の底
  const lidFly = f >= OPEN ? easeOut(seg(f, OPEN, OPEN + 12)) : 0;
  const top = boxY - 120;
  const coils = 9;
  const springPath = Array.from({ length: coils * 2 + 1 }, (_, k) => {
    const yy = top - (ext * k) / (coils * 2);
    const xx = BX + (k === 0 || k === coils * 2 ? 0 : k % 2 ? 30 : -30);
    return `${k === 0 ? "M" : "L"} ${xx} ${yy}`;
  }).join(" ");
  const spY = top - ext;
  const lean = lerp(5, -16, shock);
  return (
    <Frame f={f} seed={5081}>
      <Cam sc={1.0 + 0.03 * shock + Math.sin(f / 1.2) * 0.004 * shock * (1 - seg(f, 32, 40))} cy={520}>
        {/* しっくい壁・柱・腰板 */}
        <rect x={-80} y={-40} width={2100} height={700} fill={C.plaster} />
        {[160, 1760].map((px) => <rect key={px} x={px} y={-40} width={50} height={700} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={-80} y={620} width={2100} height={220} fill={C.woodPanel} />
        <rect x={-80} y={614} width={2100} height={14} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-80} y={830} width={2100} height={300} fill={KRP.floor} />
        <g stroke={C.woodPanel} strokeWidth={3} opacity={0.6}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={-80} y1={860 + i * 40} x2={2000} y2={860 + i * 40} />)}</g>
        {/* 壁の貼り紙 (休憩の印だけ) と窓 */}
        <rect x={1380} y={120} width={300} height={220} fill={C.skyDay} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1530} y1={120} x2={1530} y2={340} stroke={KRP.ink} strokeWidth={5} />
        <HmDbSmoke x={1460} y={330} f={f} s={0.5} n={4} drift={30} />
        {/* 振り子時計 */}
        <g>
          <rect x={BX - 170} y={40} width={340} height={560} rx={24} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={8} />
          <polygon points={`${BX - 190},48 ${BX},-10 ${BX + 190},48`} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <HmDbClock x={BX} y={180} r={100} hourDeg={300} minDeg={f * 4} f={f} frame={C.woodDark} />
          {/* 振り子の窓の奥 (暗がり) と振り子 */}
          <rect x={BX - 110} y={330} width={220} height={240} rx={10} fill={KRP.ink} opacity={0.85} />
          <g transform={`rotate(${Math.sin(f / 5) * 12} ${BX} 330)`}>
            <line x1={BX} y1={330} x2={BX} y2={520} stroke={KRP.brass} strokeWidth={6} />
            <circle cx={BX} cy={526} r={26} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 扉 (左の蝶番で開く) */}
          <g transform={`translate(${BX - 110} 330) scale(${1 - doorOpen * 0.86} 1)`}>
            <rect x={0} y={0} width={220} height={240} rx={10} fill={C.glass} opacity={0.5} stroke={C.woodDark} strokeWidth={14} />
            <rect x={0} y={0} width={220} height={240} rx={10} fill="none" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={200} cy={120} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 長いすと、お茶を飲む同僚 */}
        <rect x={180} y={720} width={480} height={34} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {[210, 610].map((lx) => <rect key={lx} x={lx} y={752} width={24} height={90} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />)}
        <HmDbJoko x={420} y={778} s={0.9} f={f} pose="sit" stripe="brown" face={shock > 0.5 ? "joy" : "normal"} gaze={[6, 0]} phase={3} apron={false} />
        {/* 湯のみ (同僚の右手) とこぼれるお茶 */}
        <g transform={`translate(${420 + 70} ${778 - 66 * 0.9 - 10}) rotate(${shock * 40})`}>
          <path d="M -18 -30 L 18 -30 L 14 6 L -14 6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-24} width={32} height={8} fill={HP.fun} opacity={0.7} />
        </g>
        {shock > 0 && [0, 1, 2, 3].map((k) => (
          <circle key={k} cx={510 + k * 16 + seg(f, OPEN, 40) * 30} cy={700 + k * 8 + seg(f, OPEN, 40) * 80 * (k + 1) * 0.4} r={7} fill="#9AB86A" stroke={KRP.ink} strokeWidth={2} opacity={1 - seg(f, 34, 42)} />
        ))}
        {/* お盆とやかん */}
        <rect x={700} y={800} width={160} height={20} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 730 800 Q 726 750 770 744 Q 814 750 810 800 Z" fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 810 772 l 34 -20" stroke={C.iron} strokeWidth={9} strokeLinecap="round" />
        <path d="M 744 752 Q 770 712 796 752" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {[0, 1].map((i) => <path key={i} d={`M ${846 + i * 10} 740 q 8 -14 0 -28`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.6} transform={`translate(0 ${-((f * 1.2 + i * 12) % 20)})`} />)}
        {/* 「暇」の雲の夢 (ふたが開くと消える) */}
        {dream > 0 && (
          <g opacity={dream} transform={`translate(${BX + 260} ${430 + Math.sin(f / 6) * 6})`}>
            <circle cx={-170} cy={150} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={-130} cy={110} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <g fill={KRP.white} stroke={KRP.ink} strokeWidth={5}>
              <ellipse cx={0} cy={0} rx={110} ry={60} />
              <ellipse cx={-70} cy={-20} rx={50} ry={40} />
              <ellipse cx={60} cy={-34} rx={56} ry={42} />
            </g>
            <ellipse cx={0} cy={0} rx={104} ry={54} fill={KRP.white} />
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.blueDeep}>暇</text>
          </g>
        )}
        {/* プレゼントの箱 */}
        {out > 0 && (
          <g>
            <ellipse cx={BX} cy={boxY + 4} rx={110 * land + 20} ry={12} fill={KRP.ink} opacity={0.2 * land} />
            <rect x={BX - 90} y={boxY - 120} width={180} height={120} rx={8} fill={C.gift} stroke={KRP.ink} strokeWidth={6} />
            <rect x={BX - 14} y={boxY - 120} width={28} height={120} fill={C.giftRibbon} stroke={KRP.ink} strokeWidth={4} />
            {/* ばねと糸巻き */}
            {ext > 2 && (
              <g>
                <path d={springPath} stroke={C.spring} strokeWidth={9} fill="none" strokeLinejoin="round" />
                <path d={springPath} stroke={KRP.ink} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
                <g transform={`translate(${BX} ${spY - 50}) rotate(${Math.sin(f / 2) * 10 * (1 - seg(f, 34, 42))})`}>
                  <rect x={-62} y={-66} width={124} height={22} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={-62} y={44} width={124} height={22} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={-44} y={-44} width={88} height={88} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                  {Array.from({ length: 8 }, (_, k) => <line key={k} x1={-44} y1={-36 + k * 10} x2={44} y2={-32 + k * 10} stroke={KRP.gray} strokeWidth={3} />)}
                  <path d="M 44 10 Q 90 30 70 70" stroke={KRP.grayDark} strokeWidth={3} fill="none" />
                </g>
                {/* びよーんの線 */}
                {f < 40 && [-1, 1].map((sd) => [0, 1, 2].map((k) => (
                  <line key={`${sd}${k}`} x1={BX + sd * (90 + k * 20)} y1={spY + 30 + k * 40} x2={BX + sd * (130 + k * 20)} y2={spY + 10 + k * 40}
                    stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 34, 40)} />
                )))}
              </g>
            )}
            {/* ふた (開くと飛んでいく) */}
            <g transform={`translate(${BX + lidFly * -260} ${boxY - 130 - lidFly * 300 + lidFly * lidFly * 220}) rotate(${-lidFly * 200})`}>
              <rect x={-100} y={-16} width={200} height={32} rx={6} fill={C.gift} stroke={KRP.ink} strokeWidth={6} />
              <rect x={-14} y={-16} width={28} height={32} fill={C.giftRibbon} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 0 -16 Q -50 -60 -40 -20 Z M 0 -16 Q 50 -60 40 -20 Z" fill={C.giftRibbon} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        )}
        {/* 手を伸ばしてから、のけぞる女工 */}
        <HmDbJoko x={1330} y={940} s={0.95} f={f} pose={shock > 0.3 ? "banzai" : "point"} stripe="blue" pointDir={-1}
          face={shock > 0.3 ? "surprised" : out > 0.5 ? "joy" : "smile"} gaze={[-6, -3]} lean={lean} phase={1} />
        {shock > 0.3 && (
          <text x={1450} y={560} fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} paintOrder="stroke"
            transform={`rotate(12 1450 560)`} opacity={seg(f, OPEN + 1, OPEN + 5)}>！</text>
        )}
      </Cam>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #82 産業革命のはじめのころ、働く時間は、むしろ長くなったと考えられています。
// 格: 図 / seed 5082
// どこ: 19世紀のイギリスの工場のレンガの壁。左右に腕木のガス灯。壁に大きな古い紙を鋲で貼ってある (角がめくれ・破れ)
// 演出: 紙の上に「1日」の帯 (24の目盛り・両端だけ 0 と 24)。灰色の仕事のバー (歯車つき) が右へずるずる伸び、
//       橙の家の時間を押しのける。家のマークはぎゅうっと押しつぶされて汗をかく。元の長さは点線で残す
// 動き: 灰色のバーが伸びる / 橙が押し出される / ガス灯のゆらぎ / カメラが少し寄る
const Hm082: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeInOut(seg(f, 6, 40));
  const cam = easeInOut(seg(f, 0, 42));
  const L = 400, R = 1520, BY = 430, BH = 110;
  const hx = (h: number) => L + ((R - L) * h) / 24;
  const ws = lerp(7, 5.5, grow), we = lerp(16, 22, grow);
  const restW = R - hx(we);
  const squash = clamp01(restW / (R - hx(16)));
  const flick = (k: number) => 0.75 + 0.15 * Math.sin(f / 3 + k) + 0.1 * Math.sin(f * 1.9 + k * 2);
  return (
    <Frame f={f} seed={5082} dark>
      <Cam sc={lerp(1.0, 1.05, cam)} cy={480}>
        {/* レンガの壁 (煤けている) */}
        <HmDbBrick x={-80} y={-40} w={2100} h={1160} seed={82} base={mix(C.brick, C.night, 0.25)} />
        <rect x={-80} y={-40} width={2100} height={1160} fill={C.nightDeep} opacity={0.25} />
        {/* ガス灯 */}
        {[150, 1770].map((gx, k) => (
          <g key={gx}>
            <circle cx={gx} cy={330} r={190} fill={C.gas} opacity={0.18 * flick(k)} />
            <path d={`M ${gx + (k ? 60 : -60)} 410 L ${gx + (k ? 60 : -60)} 380 L ${gx} 380`} stroke={C.iron} strokeWidth={10} fill="none" />
            <rect x={gx + (k ? 50 : -70)} y={400} width={20} height={40} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${gx - 36} 290 L ${gx + 36} 290 L ${gx + 26} 370 L ${gx - 26} 370 Z`} fill={C.gas} opacity={flick(k)} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${gx - 44} 290 L ${gx} 250 L ${gx + 44} 290 Z`} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
            <rect x={gx - 30} y={370} width={60} height={14} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${gx} ${352} q ${-8 * flick(k + 1)} -20 0 ${-34 * flick(k)} q ${8 * flick(k + 2)} 20 0 34 Z`} fill={KRP.white} opacity={0.9} />
          </g>
        ))}
        {/* 貼り紙 */}
        <g transform="rotate(-0.8 960 460)">
          <rect x={312} y={162} width={1320} height={620} fill={KRP.ink} opacity={0.3} />
          <path d="M 300 150 L 1620 150 L 1620 690 L 1560 770 L 300 770 Z" fill={C.paperOld} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1620 690 L 1560 770 L 1572 700 Z" fill={C.paperOldDark} stroke={KRP.ink} strokeWidth={4} />
          {[[330, 180], [1590, 180], [330, 740]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />)}
          {/* しみ */}
          <ellipse cx={1400} cy={640} rx={80} ry={40} fill={C.paperOldDark} opacity={0.4} />
          <ellipse cx={500} cy={330} rx={60} ry={26} fill={C.paperOldDark} opacity={0.3} />
          {/* 帯の地 = 家の時間 (橙) */}
          <rect x={L} y={BY} width={R - L} height={BH} rx={12} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
          {/* 元の長さ (点線) */}
          <rect x={hx(7)} y={BY - 14} width={hx(16) - hx(7)} height={BH + 28} rx={12} fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 10" opacity={0.6} />
          {/* 仕事の時間 (灰色) が伸びる */}
          <rect x={hx(ws)} y={BY} width={hx(we) - hx(ws)} height={BH} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, k) => (
            <line key={k} x1={hx(ws) + 30 + k * 60 - ((f * 3) % 60)} y1={BY + 10} x2={hx(ws) + 10 + k * 60 - ((f * 3) % 60)} y2={BY + BH - 10}
              stroke={KRP.gray} strokeWidth={6} opacity={hx(ws) + 30 + k * 60 - ((f * 3) % 60) < hx(we) - 10 ? 0.5 : 0} />
          ))}
          <g transform={`translate(${(hx(ws) + hx(we)) / 2} ${BY + BH / 2}) rotate(${f * 5})`}>
            {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-8} y={-44} width={16} height={18} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${k * 45})`} />)}
            <circle r={32} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
            <circle r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 押し出す先端 (ずるずるの線) */}
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${hx(we) - 20 - k * 26} ${BY - 26} l 14 -10`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7 * (grow < 1 ? 1 : 0.4)} />
          ))}
          {/* 押しつぶされる家 */}
          <g transform={`translate(${(hx(we) + R) / 2} ${BY + BH / 2 + 8}) scale(${0.45 + 0.55 * squash} ${1 + (1 - squash) * 0.25})`}>
            <rect x={-34} y={-16} width={68} height={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <polygon points="-46,-14 0,-50 46,-14" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-10} y={6} width={20} height={24} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {grow > 0.5 && [0, 1].map((k) => (
            <path key={k} d={`M ${(hx(we) + R) / 2 + 30 + k * 16} ${BY - 4 - k * 14} q 8 10 2 20 q -8 -8 -2 -20 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={seg(f, 24, 30)} />
          ))}
          {/* 24の目盛り (両端だけ数字) */}
          {Array.from({ length: 25 }, (_, h) => (
            <line key={h} x1={hx(h)} y1={BY + BH + 6} x2={hx(h)} y2={BY + BH + (h % 6 === 0 ? 34 : 18)} stroke={KRP.ink} strokeWidth={h % 6 === 0 ? 5 : 3} />
          ))}
          {[0, 24].map((h) => (
            <text key={h} x={hx(h)} y={BY + BH + 74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>{h}</text>
          ))}
          {/* 伸びた分の矢印 */}
          <Arrow x={hx(we) + 10} y={BY - 60} s={0.5} t={seg(f, 8, 14)} color={KRP.grayDark} />
        </g>
        <TagPlate x={960} y={250} text="産業革命のはじめ" size={42} t={seg(f, 2, 10)} fill={KRP.white} />
        <TagPlate x={1430} y={712} text="〜と考えられる" size={28} t={seg(f, 30, 38)} rot={-3} />
      </Cam>
    </Frame>
  );
};


// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_071: (f) => <Hm071 f={f} />,
  hm_072: (f) => <Hm072 f={f} />,
  hm_073: (f) => <Hm073 f={f} />,
  hm_074: (f) => <Hm074 f={f} />,
  hm_075: (f) => <Hm075 f={f} />,
  hm_076: (f) => <Hm076 f={f} />,
  hm_077: (f) => <Hm077 f={f} />,
  hm_078: (f) => <Hm078 f={f} />,
  hm_079: (f) => <Hm079 f={f} />,
  hm_080: (f) => <Hm080 f={f} />,
  hm_081: (f) => <Hm081 f={f} />,
  hm_082: (f) => <Hm082 f={f} />,
};

export const HM_DB_MOTIFS: string[] = [
  "hm_071", // #71
  "hm_072", // #72
  "hm_073", // #73
  "hm_074", // #74
  "hm_075", // #75
  "hm_076", // #76
  "hm_077", // #77
  "hm_078", // #78
  "hm_079", // #79
  "hm_080", // #80
  "hm_081", // #81
  "hm_082", // #82
];

export const himaDbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
