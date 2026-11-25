// 人は、なぜ暇をつぶすのか: 文#128〜#137 (10文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
  // 1932年の駅
  brick: "#B8543E",
  brickDark: "#8E3B2B",
  stone: "#EFE6D2",
  slate: "#55606E",
  sky32: "#E9DFC6",
  ironGreen: "#3F5A4C",
  platform: "#B9AC96",
  platformLine: "#A0937C",
  wood: "#C8915A",
  woodDark: "#8A5A32",
  woodDeep: "#5E3B20",
  noren: "#34508A",
  kimono: "#4A5E8E",
  sakura: "#F4B8C4",
  smoke: "#E9E6E0",
  loco: "#3A3A40",
  navy: "#2E3E66",
  navyDark: "#1F2A48",
  paperNews: "#ECE7DA",
  skin: "#FDFBF7",
  hairGray: "#C9C6C0",
  mapPaper: "#F4ECD6",
  rail: "#6E8C5A",
  // いまの駅
  skyNow: "#BFDDF0",
  glass: "#9CC3DC",
  glassDark: "#6F9DBD",
  steel: "#E6E9EC",
  concrete: "#B7BBBE",
  concreteLine: "#9FA4A8",
  tactile: "#F2CE4C",
  kioskBody: "#F1F2EE",
  uniform: "#3E5C8A",
  ledWhite: "#FFFDF0",
  // 研究のノート
  labDesk: "#8E9C94",
  labDeskDark: "#6F7C75",
  grid: "#B9D3E3",
  coffeeStain: "#B98A5E",
  // 待合室
  waitWall: "#DCE8D8",
  waitWallLow: "#BFD2BC",
  waitFloor: "#C9BFA8",
  benchSeat: "#5F86B8",
  benchDark: "#46689A",
  sand: "#E8C27A",
  sandDark: "#C79A4E",
  glassLine: "#9CB6C8",
  // 改札
  hallWall: "#E4E0D8",
  hallTile: "#D2CDC2",
  gateBody: "#A9B0B8",
  gateTop: "#3F6FB0",
  signNavy: "#26407A",
  // 電車の中
  carWall: "#EFEADC",
  carCeil: "#DAD5C6",
  strap: "#E8E2D0",
  poster: "#FDFBF7",
  // 夜のホーム
  night: "#1E2440",
  nightMid: "#2E3658",
  lampGlow: "#FFE9A8",
  gold: "#E2B93B",
  goldDark: "#A8852A",
  silverMedal: "#C9CFD4",
  bronzeMedal: "#C78A4E",
  suit: "#5A6170",
  suitDark: "#3E4350",
  tie: "#C0443A",
  tea: "#9DBF6A",
  yunomi: "#7E9A8C",
  podium: "#F3EEE2",
  // 神奈川の名所の詰め合わせ (#136)
  duskTop: "#26285A",
  duskMid: "#7C4F8E",
  duskLow: "#F2995C",
  duskGlow: "#FFD08A",
  sea: "#2C5A88",
  seaLight: "#6E9CC8",
  fujiBody: "#5F6396",
  fujiSnow: "#F6F2FA",
  hakoneFar: "#4C5788",
  hakoneNear: "#3B4874",
  towerBody: "#B7C0D6",
  towerDark: "#8790AA",
  bridgeWhite: "#F4F5F9",
  chinaRed: "#C8352D",
  chinaRedDark: "#952621",
  chinaGreen: "#2E8A60",
  chinaGreenDark: "#1F6646",
  buddha: "#6FA796",
  buddhaDark: "#4D8574",
  buddhaLight: "#9CCAB9",
  islandGreen: "#3E6B4E",
  islandRock: "#8A7A66",
  plaza: "#8B8296",
  plazaLine: "#756D82",
  wheelPink: "#F48FB0",
  wheelCyan: "#7FE0E8",
} as const;

type FolkProps = React.ComponentProps<typeof Person>;
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

// Person と同じゆれ (付け足す帽子などを体に合わせて動かす)
const bobOf = (f: number, phase: number) => Math.sin((f + phase * 17) / 13) * 3;

// Person を (0,0,s=1) で置き、同じ座標系で帽子・持ち物を描き足せる包み
const HmFcFolk: React.FC<FolkProps & { back?: React.ReactNode; children?: React.ReactNode }> = ({
  x, y, s = 1, f = 0, phase = 0, lean = 0, back, children, ...rest
}) => {
  const b = bobOf(f, phase);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {back && <g transform={`translate(0 ${b}) rotate(${lean})`}>{back}</g>}
      <Person x={0} y={0} s={1} f={f} phase={phase} lean={lean} {...rest} />
      {children && <g transform={`translate(0 ${b}) rotate(${lean})`}>{children}</g>}
    </g>
  );
};

// 制帽・学帽 (つばつき)。Person の座標系
const HmFcCap: React.FC<{ color?: string; band?: string; badge?: string }> = ({
  color = C.navy, band = C.navyDark, badge = KRP.brass,
}) => (
  <g>
    <path d="M -60 -270 Q -70 -318 -40 -330 L 44 -330 Q 72 -318 62 -270 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-62} y={-278} width={124} height={16} rx={3} fill={band} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -58 -264 Q 0 -244 58 -264 Q 50 -250 0 -246 Q -50 -250 -58 -264 Z" fill={KRP.ink} />
    <circle cx={0} cy={-300} r={10} fill={badge} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 中折れ帽
const HmFcFedora: React.FC<{ color?: string }> = ({ color = "#6B5A48" }) => (
  <g>
    <ellipse cx={0} cy={-268} rx={92} ry={16} fill={color} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -54 -270 Q -56 -330 -20 -334 Q 0 -322 20 -334 Q 56 -330 54 -270 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-54} y={-286} width={108} height={14} fill={KRP.ink} opacity={0.75} />
  </g>
);

// 割烹着 (白い上っぱり) のえりと三角巾
const HmFcKappogi: React.FC = () => (
  <g>
    <path d="M -24 -160 L 0 -128 L 24 -160 Z" fill={C.kimono} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -64 -246 Q -60 -300 0 -302 Q 60 -300 64 -246 Q 30 -266 0 -266 Q -30 -266 -64 -246 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 56 -262 l 26 -10 l -6 24 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-40} y={-100} width={80} height={10} rx={4} fill={KRP.gray} opacity={0.5} />
  </g>
);

// 1932年の木の売店 (地面の真ん中が原点・幅560・高さ400)。noren 0→1 でのれんが掛かる
const HmFcStall32: React.FC<{ x: number; y: number; s?: number; f: number; noren: number }> = ({ x, y, s = 1, f, noren }) => {
  const rodY = -345 + (1 - easeOut(noren)) * 36;
  const len = 96 * easeOut(clamp01(noren * 1.2 - 0.2));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 奥の板壁 */}
      <rect x={-272} y={-362} width={544} height={362} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
      {[-200, -120, -40, 40, 120, 200].map((lx) => <line key={lx} x1={lx} y1={-360} x2={lx} y2={-170} stroke={C.woodDark} strokeWidth={4} />)}
      {/* 棚: たばこの箱 / 菓子のびん / 小さな本 */}
      {[-300, -236].map((sy) => <rect key={sy} x={-262} y={sy} width={524} height={10} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />)}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-250 + i * 36} y={-336} width={26} height={36} rx={3}
          fill={[KRP.red, KRP.white, KRP.blueDeep, KRP.yellow, KRP.green][i % 5]} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {[-200, -80, 80, 200].map((jx, i) => (
        <g key={jx}>
          <rect x={jx - 30} y={-290} width={60} height={54} rx={12} fill={KRP.blueSoft} opacity={0.75} stroke={KRP.ink} strokeWidth={3} />
          <rect x={jx - 24} y={-298} width={48} height={10} rx={3} fill={C.wood} stroke={KRP.ink} strokeWidth={2.5} />
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={jx - 16 + k * 11} cy={-252 - (k % 2) * 12} r={7}
            fill={[KRP.red, KRP.yellow, KRP.green, KRP.orange][(k + i) % 4]} stroke={KRP.ink} strokeWidth={1.5} />)}
        </g>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={-250 + i * 31} y={-226 + (i % 3) * 4} width={24} height={52 - (i % 3) * 4}
          fill={["#C96A4A", "#E0B84A", "#6EA36A", "#4F7DB8"][i % 4]} stroke={KRP.ink} strokeWidth={2.5} />
      ))}
      {/* 台 (カウンター) と、前に下げた新聞 */}
      <rect x={-286} y={-182} width={572} height={18} rx={3} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-280} y={-166} width={560} height={166} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      {[-210, -140, -70, 0, 70, 140, 210].map((lx) => <line key={lx} x1={lx} y1={-164} x2={lx} y2={-4} stroke={C.woodDark} strokeWidth={3} opacity={0.6} />)}
      {[-200, -70, 60, 190].map((nx, i) => (
        <g key={nx} transform={`rotate(${Math.sin(f / 11 + i) * 1.5} ${nx} -150)`}>
          <rect x={nx - 46} y={-150} width={92} height={110} fill={C.paperNews} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={nx - 36} y={-138} width={72} height={14} fill={KRP.grayDark} opacity={0.7} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={nx - 36} y1={-112 + k * 16} x2={nx + 36} y2={-112 + k * 16} stroke={KRP.gray} strokeWidth={4} />)}
          <rect x={nx - 8} y={-158} width={16} height={14} rx={3} fill={C.woodDark} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      ))}
      {/* 新聞の束 (台の上) */}
      <rect x={-250} y={-206} width={130} height={26} fill={C.paperNews} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-244} y={-222} width={124} height={18} fill={C.paperNews} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={150} y={-214} width={90} height={34} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      {/* 柱 */}
      <rect x={-292} y={-372} width={20} height={372} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={272} y={-372} width={20} height={372} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 屋根 (瓦) */}
      <path d="M -330 -362 L 330 -362 L 290 -410 L -290 -410 Z" fill={C.slate} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-300 + i * 50} y1={-406} x2={-318 + i * 53} y2={-364} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
      <rect x={-300} y={-420} width={600} height={14} rx={5} fill={C.slate} stroke={KRP.ink} strokeWidth={5} />
      {/* のれん */}
      {noren > 0 && (
        <g>
          {[-195, -65, 65, 195].map((nx, i) => (
            <g key={nx} transform={`rotate(${Math.sin(f / 9 + i) * 1.8} ${nx} ${rodY})`}>
              <rect x={nx - 60} y={rodY} width={120} height={len} fill={C.noren} stroke={KRP.ink} strokeWidth={4} />
              {len > 60 && <circle cx={nx} cy={rodY + len * 0.55} r={18} fill={KRP.white} opacity={0.9} />}
            </g>
          ))}
          <rect x={-276} y={rodY - 8} width={552} height={14} rx={7} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// 煙で変わる (#130)
const HmFcPoof: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t <= 0 || t >= 1) return null;
  const grow = easeOut(clamp01(t * 2));
  const fade = 1 - clamp01((t - 0.5) * 2);
  return (
    <g opacity={fade}>
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        const r = 120 + (i % 3) * 50;
        return <circle key={i} cx={x + Math.cos(a) * r * grow} cy={y + Math.sin(a) * r * 0.7 * grow}
          r={(70 + (i % 4) * 22) * grow} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={5} />;
      })}
      <circle cx={x} cy={y} r={190 * grow} fill={KRP.white} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * 60 + 30) * Math.PI / 180;
        return <path key={`s${i}`} d={`M ${x + Math.cos(a) * 300 * grow} ${y + Math.sin(a) * 220 * grow} l 14 -26 l 14 26 l -14 26 Z`}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />;
      })}
    </g>
  );
};

// 1932年の東京駅のホーム (#128 と #130 の前半で同じ構図)
const HmFcHome32: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={2000} height={500} fill={C.sky32} />
    {/* 赤レンガの駅舎 (白い帯・アーチ窓・ドーム) */}
    <rect x={-40} y={110} width={2000} height={300} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-40} y={92} width={2000} height={24} fill={C.slate} stroke={KRP.ink} strokeWidth={5} />
    {[190, 300].map((by) => <rect key={by} x={-40} y={by} width={2000} height={14} fill={C.stone} stroke={KRP.ink} strokeWidth={2.5} />)}
    {[0, 1].map((r) => Array.from({ length: 18 }, (_, i) => (
      <path key={`${r}-${i}`} d={`M ${30 + i * 112} ${280 + r * 110 - 54} l 0 -36 q 18 -22 36 0 l 0 36 Z`} fill="#2F3E58" stroke={C.stone} strokeWidth={3} />
    )))}
    {Array.from({ length: 60 }, (_, i) => <line key={`b${i}`} x1={(i * 37) % 1960} y1={130 + (i % 6) * 46} x2={(i * 37) % 1960 + 24} y2={130 + (i % 6) * 46}
      stroke={C.brickDark} strokeWidth={3} opacity={0.6} />)}
    <path d="M 850 100 Q 850 20 960 8 Q 1070 20 1070 100 Z" fill={C.slate} stroke={KRP.ink} strokeWidth={6} />
    {[890, 930, 990, 1030].map((dx) => <line key={dx} x1={dx} y1={100} x2={dx + (dx - 960) * 0.1} y2={30} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />)}
    <line x1={960} y1={8} x2={960} y2={-30} stroke={KRP.ink} strokeWidth={5} />
    {/* 線路 */}
    <rect x={-40} y={410} width={2000} height={100} fill="#8B8077" />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 70 - 20} y={430} width={40} height={60} fill="#6E6058" />)}
    <rect x={-40} y={438} width={2000} height={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
    <rect x={-40} y={478} width={2000} height={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
    {/* 汽車 (左) と煙 */}
    <g>
      <rect x={-80} y={330} width={440} height={140} rx={30} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <rect x={360} y={280} width={170} height={190} rx={8} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <rect x={385} y={300} width={50} height={50} rx={6} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
      <rect x={455} y={300} width={50} height={50} rx={6} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
      <rect x={70} y={270} width={50} height={64} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <rect x={58} y={258} width={74} height={18} rx={4} fill={C.loco} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-80} y={400} width={440} height={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      {[0, 120, 240, 420].map((wx) => (
        <g key={wx} transform={`rotate(${f * 6} ${wx} 470)`}>
          <circle cx={wx} cy={470} r={38} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <line x1={wx - 30} y1={470} x2={wx + 30} y2={470} stroke={KRP.ink} strokeWidth={4} />
          <line x1={wx} y1={440} x2={wx} y2={500} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const k = ((f * 1.1 + i * 12) % 72) / 72;
        return <circle key={i} cx={95 + k * 200} cy={250 - k * 250} r={24 + k * 64} fill={C.smoke}
          stroke={KRP.grayDark} strokeWidth={3} opacity={(1 - k) * 0.85} />;
      })}
    </g>
    {/* ホーム */}
    <rect x={-40} y={510} width={2000} height={620} fill={C.platform} />
    <rect x={-40} y={506} width={2000} height={20} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.platformLine} strokeWidth={4}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 260 - 100} y1={530} x2={i * 320 - 360} y2={1120} />)}</g>
    <line x1={-40} y1={720} x2={1960} y2={720} stroke={C.platformLine} strokeWidth={4} />
    {/* ホームの屋根と鉄の柱 */}
    <rect x={-40} y={-40} width={2000} height={76} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${i * 130} 36 l 65 -60 l 65 60`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />)}
    {[230, 1270].map((px) => (
      <g key={px}>
        <rect x={px - 14} y={36} width={28} height={850} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${px - 14} 60 q -60 0 -80 -24 M ${px + 14} 60 q 60 0 80 -24`} stroke={C.ironGreen} strokeWidth={10} fill="none" />
        <rect x={px - 24} y={860} width={48} height={26} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
  </g>
);

// 現代の駅のホーム (#130 の後半。#128 と同じ構図)
const HmFcHomeNow: React.FC<{ f: number }> = ({ f }) => {
  const tx = ((f * 9) % 2600) - 2200;
  return (
    <g>
      <rect x={-40} y={-40} width={2000} height={500} fill={C.skyNow} />
      {/* ガラスの駅ビル */}
      <rect x={-40} y={100} width={2000} height={310} fill={C.glass} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={i * 84} y1={100} x2={i * 84} y2={410} stroke={C.glassDark} strokeWidth={4} />)}
      {[180, 260, 340].map((gy) => <line key={gy} x1={-40} y1={gy} x2={1960} y2={gy} stroke={C.glassDark} strokeWidth={4} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M ${200 + i * 640} 110 l 120 0 l -200 290 l -120 0 Z`} fill={KRP.white} opacity={0.22} />)}
      {/* 線路と電車 (後ろをゆっくり通る) */}
      <rect x={-40} y={410} width={2000} height={100} fill="#8E8C88" />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 70 - 20} y={430} width={40} height={60} fill="#77756F" />)}
      <rect x={-40} y={438} width={2000} height={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
      <rect x={-40} y={478} width={2000} height={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
      <g transform={`translate(${tx} 0)`}>
        <rect x={0} y={270} width={2000} height={200} rx={24} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        <rect x={0} y={410} width={2000} height={22} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={40 + i * 196} y={300} width={130} height={90} rx={8} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={4} />)}
      </g>
      {/* ホーム (点字ブロック) */}
      <rect x={-40} y={510} width={2000} height={620} fill={C.concrete} />
      <rect x={-40} y={506} width={2000} height={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-40} y={540} width={2000} height={30} fill={C.tactile} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 48 }, (_, i) => <circle key={i} cx={i * 42} cy={555} r={5} fill={KRP.ink} opacity={0.3} />)}
      <g stroke={C.concreteLine} strokeWidth={4}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 260 - 100} y1={570} x2={i * 320 - 360} y2={1120} />)}</g>
      {/* 白い鉄骨の屋根と LED */}
      <rect x={-40} y={-40} width={2000} height={76} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={60 + i * 320} y={40} width={200} height={14} rx={7} fill={C.ledWhite} stroke={KRP.ink} strokeWidth={3} />)}
      {[230, 1270].map((px) => (
        <g key={px}>
          <rect x={px - 16} y={36} width={32} height={850} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
          <rect x={px - 26} y={860} width={52} height={26} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

// 現代の売店 (地面の真ん中が原点・幅600・高さ400)。light 0→1 で照明
const HmFcKioskNow: React.FC<{ x: number; y: number; f: number; light: number }> = ({ x, y, f, light }) => (
  <g transform={`translate(${x} ${y})`}>
    {light > 0 && <polygon points="-300,-330 300,-330 420,0 -420,0" fill={C.ledWhite} opacity={0.35 * light} />}
    <rect x={-300} y={-380} width={600} height={380} rx={10} fill={C.kioskBody} stroke={KRP.ink} strokeWidth={6} />
    {/* 光る看板の箱 (字は描かない) */}
    <rect x={-310} y={-420} width={620} height={60} rx={10} fill={light > 0.5 ? C.ledWhite : KRP.gray} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-310} y={-372} width={620} height={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    {/* 冷蔵ケース (左) */}
    <rect x={-290} y={-340} width={170} height={330} rx={6} fill="#DDEFF6" stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={-284} y={-262 + r * 76} width={158} height={6} fill={KRP.gray} />
        {[0, 1, 2, 3, 4].map((c) => (
          <rect key={c} x={-278 + c * 30} y={-318 + r * 76} width={20} height={54} rx={6}
            fill={[KRP.green, KRP.orange, KRP.blueDeep, KRP.yellow, KRP.red][(r + c) % 5]} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
      </g>
    ))}
    <rect x={-290} y={-340} width={170} height={330} rx={6} fill={KRP.white} opacity={0.15 + 0.2 * light} />
    {/* 雑誌のラック (右) */}
    <rect x={120} y={-340} width={170} height={330} rx={6} fill="#D8D4CC" stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => (
      <g key={`${r}${c}`} transform={`rotate(${-6 + c * 6} ${150 + c * 52} ${-280 + r * 78})`}>
        <rect x={130 + c * 52} y={-318 + r * 78} width={44} height={62} rx={3}
          fill={[KRP.red, KRP.blueDeep, KRP.yellow, KRP.green, "#C96A9A"][(r * 3 + c) % 5]} stroke={KRP.ink} strokeWidth={2.5} />
        <rect x={136 + c * 52} y={-302 + r * 78} width={30} height={18} fill={KRP.white} opacity={0.75} />
      </g>
    )))}
    {/* 真ん中の台とお菓子 */}
    <rect x={-120} y={-170} width={240} height={170} fill="#E2E4E0" stroke={KRP.ink} strokeWidth={5} />
    <rect x={-126} y={-182} width={252} height={16} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-108 + i * 37} y={-150} width={28} height={40} rx={5}
        fill={[KRP.yellow, KRP.red, KRP.orange, KRP.green, KRP.blueDeep, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={`l${i}`} x={-108 + i * 37} y={-96} width={28} height={40} rx={5}
        fill={[KRP.green, KRP.orange, KRP.blueDeep, KRP.red, KRP.yellow, KRP.green][i]} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    <rect x={60} y={-220} width={50} height={40} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
    <rect x={66} y={-214} width={38} height={14} fill={HP.screen} opacity={0.6 + 0.3 * Math.sin(f / 6)} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #128 そして1932年4月1日。東京駅と上野駅に、10か所の売店が開きます。
// 格: 山 / seed 5128
// 絵: どこ: 1932年の東京駅のホーム (赤レンガの駅舎・ホームの屋根)。年代札「1932年」。演出: ホームに小さな売店 (新聞・たばこ・菓子・本) が開店し、割烹着の売り子がのれんを掛ける。路線図風の地図に「東京」「上野」の2つの駅のマークと、売店のアイコンが10個ぽんぽんと灯る。動き: のれんが掛かる / アイコンが灯る (10回) / 汽車の煙
// どこ: 1932年の東京駅のホーム。奥に赤レンガの駅舎とドーム、左に汽車、鉄の柱の屋根。桜の花びら (4月)
// 演出: 真ん中の木の売店に、割烹着の売り子がのれんを掛ける。右の柱に下げた路線図に「東京」「上野」と、売店のアイコンが10個灯る。左の客がびっくり
// 動き: のれんが掛かる (f4-20) / アイコンが10回ぽんぽん (f6-36) / 汽車の煙 / カメラがゆっくり寄る
const Hm128: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const noren = seg(f, 4, 20);
  const lit = (i: number) => seg(f, 6 + i * 3, 9 + i * 3);
  const count = Array.from({ length: 10 }, (_, i) => lit(i)).filter((v) => v > 0.5).length;
  const hung = noren >= 1;
  return (
    <Frame f={f} seed={5128}>
      <g transform={`translate(800 620) scale(${cam}) translate(-800 -620)`}>
        <HmFcHome32 f={f} />
        {/* 路線図 (右の柱に下げた板) */}
        <g transform={`rotate(${Math.sin(f / 16) * 0.6} 1580 110)`}>
          {[1380, 1780].map((cx) => <line key={cx} x1={cx} y1={36} x2={cx} y2={120} stroke={KRP.ink} strokeWidth={5} />)}
          <rect x={1330} y={116} width={500} height={460} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1350} y={136} width={460} height={420} rx={6} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={4} />
          {/* 線路 (上野は北・東京は南) */}
          <path d="M 1650 170 Q 1600 280 1640 400" stroke={C.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 1650 170 Q 1600 280 1640 400" stroke={C.rail} strokeWidth={8} fill="none" strokeDasharray="22 10" strokeLinecap="round" />
          <path d="M 1650 170 Q 1700 120 1790 150 M 1640 400 Q 1660 460 1780 470" stroke={C.rail} strokeWidth={6} fill="none" opacity={0.6} />
          {[[1621, 250], [1615, 320]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
          {[[1650, 170, "上野"], [1640, 400, "東京"]].map(([sx, sy, nm]) => (
            <g key={nm as string}>
              <circle cx={sx as number} cy={sy as number} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={sx as number} cy={sy as number} r={9} fill={KRP.red} />
              <text x={(sx as number) - 40} y={(sy as number) + 14} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>{nm}</text>
            </g>
          ))}
          {/* 売店のアイコン10個 */}
          {Array.from({ length: 10 }, (_, i) => {
            const t = lit(i);
            const ix = 1400 + (i % 5) * 90, iy = 460 + Math.floor(i / 5) * 62;
            return (
              <g key={i}>
                <rect x={ix - 26} y={iy - 20} width={52} height={44} rx={6} fill="none" stroke={KRP.gray} strokeWidth={3} strokeDasharray="5 5" />
                {t > 0 && (
                  <g transform={`translate(${ix} ${iy}) scale(${pop(t)})`}>
                    <circle r={34} fill={HP.spark} opacity={0.35 * (1 - t * 0.5)} />
                    <rect x={-22} y={-4} width={44} height={26} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
                    <path d="M -28 -4 L -22 -20 L 22 -20 L 28 -4 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                    <path d="M -12 -20 L -14 -4 M 2 -20 L 2 -4 M 14 -20 L 16 -4" stroke={KRP.white} strokeWidth={4} />
                  </g>
                )}
              </g>
            );
          })}
          <text x={1790} y={210} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.red}>{count}</text>
        </g>
        {/* 木の売店と売り子 */}
        <HmFcStall32 x={800} y={880} s={1.15} f={f} noren={noren} />
        <HmFcFolk x={1004} y={880} s={1.25} f={f} phase={2} pose={hung ? "stand" : "raise"} face={hung ? "smile" : "normal"}
          cloth={KRP.white} clothDark={C.kimono} hair="none" gaze={hung ? [-4, 0] : [2, -6]}>
          <HmFcKappogi />
        </HmFcFolk>
        {hung && seg(f, 20, 30) < 1 && (
          <g opacity={1 - seg(f, 20, 30)}>
            {[0, 1, 2].map((i) => <path key={i} d={`M ${540 + i * 260} 440 q 10 -20 0 -40`} stroke={KRP.ink} strokeWidth={5} fill="none" />)}
          </g>
        )}
        {/* 左の客 (中折れ帽): 開店に気づいて振り向く */}
        <HmFcFolk x={360} y={900} s={0.98} f={f} phase={5} face={f > 22 ? "surprised" : "normal"} gaze={[6, 0]}
          cloth="#5A4A6A" clothDark="#3E3450" lean={f > 22 ? 4 : 0}>
          <HmFcFedora />
          <rect x={-100} y={-90} width={40} height={60} rx={4} fill={C.paperNews} stroke={KRP.ink} strokeWidth={3} />
        </HmFcFolk>
        {/* 桜の花びら */}
        {Array.from({ length: 14 }, (_, i) => {
          const px = (rnd(5128, i) * 1960 + f * (2 + rnd(3, i))) % 1960;
          const py = (rnd(77, i) * 1000 + f * (3 + rnd(9, i) * 2)) % 1000;
          return <ellipse key={i} cx={px} cy={py} rx={9} ry={5} fill={C.sakura} stroke={KRP.ink} strokeWidth={1.5}
            transform={`rotate(${f * 4 + i * 40} ${px} ${py})`} />;
        })}
      </g>
      <TagPlate x={220} y={215} text="1932年" size={52} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #129 開いたのは、鉄道弘済会。仕事中のけがで働けなくなった鉄道員などを、助けるための売店でした。
// 格: 山 / seed 5129
// 絵: どこ: #128 の売店 (続き・アップ)。演出: 売店の中で、元鉄道員 (制帽をかぶった年配の人・腕に包帯ではなく、杖を椅子に立てかけている) が新聞を売っている。客に笑顔でおつりを渡す (face="smile")。売店の上に、鉄道の制帽と手を重ねたマーク (助け合い)。札「鉄道弘済会」。動き: おつりの受け渡し / 新聞がばさっ / 客が会釈
// どこ: #128 の木の売店の中 (正面アップ)。棚のたばこ・菓子のびん・本、吊るした新聞。右の柱の外はホームと赤レンガ
// 演出: 制帽をかぶった年配の元鉄道員が笑顔でおつりを渡す。杖は台に立てかけてある。屋根の板に「助け合い」のマーク (制帽と重ねた手) と札「鉄道弘済会」。学生の客が受け取って会釈
// 動き: 新聞の束がばさっ (f4-14) / おつりが弧を描いて手から手へ (f14-30) / 客が会釈 (f30-40)
const Hm129: React.FC<{ f: number }> = ({ f }) => {
  const flap = seg(f, 4, 14);
  const coin = easeInOut(seg(f, 14, 30));
  const bow = easeOut(seg(f, 30, 40));
  const pan = lerp(16, -16, easeInOut(seg(f, 0, 42)));
  const [hx, hy] = [999, 608];
  const [cx2, cy2] = [1416, 752];
  return (
    <Frame f={f} seed={5129}>
      <g transform={`translate(${pan} 0)`}>
        {/* 売店の外 (右): 赤レンガとホーム */}
        <rect x={-60} y={-40} width={2040} height={760} fill={C.brick} />
        {[150, 330, 510].map((by) => <rect key={by} x={1380} y={by} width={600} height={16} fill={C.stone} stroke={KRP.ink} strokeWidth={2.5} />)}
        {[0, 1].map((r) => [0, 1, 2, 3].map((i) => (
          <path key={`${r}${i}`} d={`M ${1460 + i * 130} ${300 + r * 180} l 0 -60 q 28 -34 56 0 l 0 60 Z`} fill="#2F3E58" stroke={C.stone} strokeWidth={4} />
        )))}
        <rect x={-60} y={720} width={2040} height={400} fill={C.platform} />
        <rect x={1640} y={-40} width={36} height={940} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={6} />
        {/* 店の奥の壁と棚 */}
        <rect x={130} y={140} width={1260} height={520} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        {[260, 400, 540].map((sy) => <rect key={sy} x={140} y={sy} width={1240} height={14} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />)}
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={160 + i * 60} y={206} width={44} height={54} rx={4}
            fill={[KRP.red, KRP.white, KRP.blueDeep, KRP.yellow, KRP.green][i % 5]} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {[250, 420, 1120, 1280].map((jx, i) => (
          <g key={jx}>
            <rect x={jx - 52} y={310} width={104} height={90} rx={20} fill={KRP.blueSoft} opacity={0.8} stroke={KRP.ink} strokeWidth={4} />
            <rect x={jx - 40} y={296} width={80} height={18} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
            {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={jx - 34 + k * 17} cy={378 - (k % 2) * 22} r={11}
              fill={[KRP.red, KRP.yellow, KRP.green, KRP.orange, KRP.white][(k + i) % 5]} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
        ))}
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={160 + i * 40} y={460 + (i % 3) * 6} width={32} height={80 - (i % 3) * 6}
            fill={["#C96A4A", "#E0B84A", "#6EA36A", "#4F7DB8", "#9A6AB0"][i % 5]} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 紐に吊るした新聞 */}
        <path d="M 140 176 Q 760 200 1380 176" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {[230, 380, 1160, 1300].map((nx, i) => (
          <g key={nx} transform={`rotate(${Math.sin(f / 10 + i) * 2} ${nx} 186)`}>
            <rect x={nx - 50} y={186} width={100} height={60} fill={C.paperNews} stroke={KRP.ink} strokeWidth={3} />
            <line x1={nx - 40} y1={204} x2={nx + 40} y2={204} stroke={KRP.grayDark} strokeWidth={6} />
            <line x1={nx - 40} y1={222} x2={nx + 30} y2={222} stroke={KRP.gray} strokeWidth={4} />
            <rect x={nx - 7} y={178} width={14} height={18} rx={3} fill={C.wood} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 元鉄道員 (制帽・白髪・めがね) */}
        <HmFcFolk x={800} y={800} s={1.3} f={f} phase={1} pose="point" pointDir={1} face="smile" glasses hair="none"
          cloth={C.navy} clothDark={C.navyDark} gaze={[5, 2]}>
          <path d="M -64 -236 q -10 -20 4 -40 M 64 -236 q 10 -20 -4 -40" stroke={C.hairGray} strokeWidth={14} strokeLinecap="round" fill="none" />
          <HmFcCap />
          {[-26, 0, 26].map((bx) => <circle key={bx} cx={0} cy={-140 + (bx + 26) * 1.2} r={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />)}
        </HmFcFolk>
        {/* 杖 (台に立てかけてある) */}
        <path d="M 520 900 L 556 590 q 4 -30 32 -24 q 20 6 12 26" stroke="#7A4E2C" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M 520 900 L 556 590 q 4 -30 32 -24 q 20 6 12 26" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5} />
        {/* 台 */}
        <rect x={120} y={636} width={1280} height={28} rx={4} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={130} y={664} width={1260} height={460} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={230 + i * 100} y1={668} x2={230 + i * 100} y2={1100} stroke={C.woodDark} strokeWidth={4} opacity={0.55} />)}
        {[300, 560, 900, 1160].map((nx, i) => (
          <g key={nx} transform={`rotate(${Math.sin(f / 12 + i) * 1.2} ${nx} 690)`}>
            <rect x={nx - 80} y={690} width={160} height={124} fill={C.paperNews} stroke={KRP.ink} strokeWidth={4} />
            <rect x={nx - 66} y={704} width={132} height={22} fill={KRP.grayDark} opacity={0.7} />
            {[0, 1, 2].map((k) => <line key={k} x1={nx - 66} y1={746 + k * 20} x2={nx + 66} y2={746 + k * 20} stroke={KRP.gray} strokeWidth={5} />)}
          </g>
        ))}
        {/* 新聞の束: いちばん上がばさっ */}
        <rect x={210} y={600} width={300} height={36} fill={C.paperNews} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${-38 * Math.sin(flap * Math.PI)} 210 600)`}>
          <rect x={210} y={584} width={300} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={230} y1={593} x2={480} y2={593} stroke={KRP.gray} strokeWidth={4} />
        </g>
        {flap > 0.5 && flap < 1 && [0, 1, 2].map((i) => (
          <path key={i} d={`M ${520 + i * 10} ${560 - i * 24} l 40 -14`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - flap} />
        ))}
        {/* おつりの皿 */}
        <ellipse cx={1180} cy={630} rx={70} ry={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {/* 柱と屋根の板 */}
        <rect x={100} y={30} width={34} height={1100} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1386} y={30} width={34} height={1100} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={60} y={-40} width={1400} height={56} fill={C.slate} stroke={KRP.ink} strokeWidth={6} />
        <rect x={90} y={14} width={1340} height={130} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
        {/* 助け合いのマーク: 制帽と、重ねた手 */}
        <g transform={`translate(560 80) rotate(${Math.sin(f / 14) * 2})`}>
          <circle r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -30 -10 Q -34 -40 -18 -44 L 20 -44 Q 36 -40 30 -10 Z" fill={C.navy} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -34 -10 Q 0 2 34 -10 Q 0 -4 -34 -10 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-28} r={5} fill={KRP.brass} />
          <rect x={-40} y={10} width={56} height={24} rx={12} fill={C.sakura} stroke={KRP.ink} strokeWidth={4} transform="rotate(-14 -12 22)" />
          <rect x={-14} y={14} width={56} height={24} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 14 26)" />
        </g>
        {/* おつり (手から手へ) */}
        {coin > 0 && coin < 1 && [0, 1].map((k) => {
          const t = clamp01(coin - k * 0.08);
          const px = lerp(hx, cx2, t), py = lerp(hy, cy2, t) - Math.sin(t * Math.PI) * 120;
          return (
            <g key={k}>
              <circle cx={px} cy={py} r={14} fill={KRP.copper} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={px} cy={py} r={5} fill="none" stroke={KRP.ink} strokeWidth={2} />
            </g>
          );
        })}
        {coin >= 1 && <circle cx={cx2 - 6} cy={cy2 - 10} r={13} fill={KRP.copper} stroke={KRP.ink} strokeWidth={3} />}
        {/* 客 (学生服・学帽): 受け取って会釈 */}
        <HmFcFolk x={1600} y={930} s={1.2} f={f} phase={4} pose="point" pointDir={-1} cloth="#2E2E36" clothDark="#1E1E24"
          face={coin >= 1 ? "smile" : "normal"} gaze={[-6, 2]} lean={-7 * bow}>
          <HmFcCap color="#2E2E36" band={KRP.white} badge={KRP.brass} />
          {[0, 1, 2].map((k) => <circle key={k} cx={0} cy={-142 + k * 30} r={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />)}
        </HmFcFolk>
      </g>
      <TagPlate x={1000} y={82} text="鉄道弘済会" size={50} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #130 この売店が、のちの「キヨスク」です。
// 格: 並 / seed 5130
// 絵: どこ: 現代の駅のホーム (#128 と同じ構図)。演出: 1932年の木の売店が、f でふわっと現代の売店 (明るい照明・冷蔵ケース・雑誌のラック) に変わる (変身の煙)。売り子も割烹着から制服へ。札「キヨスク」。動き: 煙で変身 / 照明が点く / 客が通り過ぎる
// どこ: #128 と同じ構図のホーム。前半は1932年の木の売店、後半は今の駅 (ガラスの駅ビル・点字ブロック・電車)
// 演出: 売店がぼわんと煙に包まれ、明るい照明・冷蔵ケース・雑誌ラックの今の売店に変わる。売り子も割烹着から制服へ。札「キヨスク」。今の客が横目で見ながら通り過ぎる
// 動き: 煙で変身 (f10-30。前の物は f20 で完全に消える) / 照明が点く (f24-30) / 客が右から歩いてくる
const Hm130: React.FC<{ f: number }> = ({ f }) => {
  const poof = seg(f, 10, 30);
  const oldA = 1 - seg(f, 14, 20);
  const newA = seg(f, 16, 22);
  const light = seg(f, 24, 30);
  const walkX = 1820 - Math.max(0, f - 16) * 7;
  return (
    <Frame f={f} seed={5130}>
      {oldA > 0 && (
        <g opacity={oldA}>
          <HmFcHome32 f={f} />
          <g transform="translate(800 880) scale(1.15) translate(-800 -860)">
          <HmFcStall32 x={800} y={860} f={f} noren={1} />
          <HmFcFolk x={800} y={700} s={1.0} f={f} phase={2} face="smile" cloth={KRP.white} clothDark={C.kimono} hair="none">
            <HmFcKappogi />
          </HmFcFolk>
          <rect x={520} y={694} width={560} height={166} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          </g>
          <HmFcFolk x={1500 - f * 5} y={900} s={0.98} f={f} phase={5} cloth="#5A4A6A" clothDark="#3E3450">
            <HmFcFedora />
          </HmFcFolk>
        </g>
      )}
      {newA > 0 && (
        <g opacity={newA}>
          <HmFcHomeNow f={f} />
          <g transform="translate(800 880) scale(1.15) translate(-800 -860)">
          <HmFcKioskNow x={800} y={860} f={f} light={light} />
          {/* 制服の店員 (台の向こう) */}
          <HmFcFolk x={800} y={760} s={0.9} f={f} phase={2} face="smile" cloth={C.uniform} clothDark={C.navyDark} gaze={[5, 0]}>
            <path d="M -58 -160 L -20 -160 L 0 -120 L 20 -160 L 58 -160" fill="none" stroke={KRP.white} strokeWidth={6} />
            <rect x={18} y={-138} width={30} height={18} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -62 -262 Q -58 -304 0 -306 Q 58 -304 62 -262 Z" fill={C.uniform} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -60 -262 Q 0 -246 76 -262 Q 70 -250 0 -250 Q -50 -250 -60 -262 Z" fill={C.navyDark} />
          </HmFcFolk>
          <rect x={680} y={690} width={240} height={170} fill="#E2E4E0" stroke={KRP.ink} strokeWidth={5} />
          <rect x={674} y={678} width={252} height={16} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={692 + i * 37} y={712} width={28} height={40} rx={5}
              fill={[KRP.yellow, KRP.red, KRP.orange, KRP.green, KRP.blueDeep, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
          </g>
          {/* 通り過ぎる客 (かばん) */}
          <HmFcFolk x={walkX} y={920} s={1.05} f={f} phase={6} face={f > 30 ? "smile" : "normal"} gaze={[-6, 0]} lean={-3}
            cloth="#4E5A6E" clothDark="#353D4C">
            <rect x={56} y={-80} width={70} height={52} rx={8} fill="#6B4A36" stroke={KRP.ink} strokeWidth={4} />
            <path d="M 76 -80 q 15 -16 30 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
          </HmFcFolk>
        </g>
      )}
      <HmFcPoof x={800} y={600} t={poof} />
      <TagPlate x={220} y={215} text="1932年" size={52} t={oldA} />
      <TagPlate x={180} y={215} text="いま" size={52} t={seg(f, 22, 28)} />
      <TagPlate x={800} y={330} text="キヨスク" size={60} t={seg(f, 28, 36)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #131 ちなみに、待ち時間は、実際より長く感じるそうです。
// 格: 山 / seed 5131
// 絵: どこ: 駅のホームのベンチ (現代)。演出: ベンチで待つ人の頭の上の吹き出しの中で、時計の針が**ぐにゃーっと伸びて**長くなる (ダリの時計風に少しとろける)。実際の駅の時計はふつうに動いている。待つ人はうんざり顔 (face="worried")。動き: 吹き出しの時計がとろける / 実際の時計の秒針 / 足をぶらぶら
// どこ: 昼の駅のホーム (今)。向かいのホームの壁・線路・木のベンチ・柱に下がった駅の時計・ハト
// 演出: ベンチで待つ人の頭の上の吹き出しの中で、時計がとろけて針がぐにゃーっと伸びる。柱の本物の時計は、ふつうにカチ、カチ。待つ人はうんざり
// 動き: 吹き出しの時計がとろける (f4-40) / 本物の時計の秒針がカチカチ / 足先トントン・体をそわそわ / ハトがつつく / カメラが吹き出しへ寄る
const HmFcMeltClock: React.FC<{ x: number; y: number; m: number; f: number }> = ({ x, y, m, f }) => {
  const R = 140;
  const warp = (a: number, r: number): [number, number] => {
    const px = Math.sin(a) * r, py = -Math.cos(a) * r;
    const low = Math.max(0, py / R); // 下半分ほど垂れる
    const sag = m * (low * low * 110 + (py > 0 ? Math.max(0, Math.sin(a * 3 + 0.6)) * 70 * low : 0));
    return [x + px * (1 + 0.12 * m * low), y + py + sag + m * 18];
  };
  const pts = Array.from({ length: 73 }, (_, i) => warp((i / 72) * Math.PI * 2, R));
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ") + " Z";
  const mLen = 100 + 150 * m;
  const sway = Math.sin(f / 8) * 4 * m;
  return (
    <g>
      <path d={d} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const [x1, y1] = warp(a, R - 14), [x2, y2] = warp(a, R - (i % 3 ? 30 : 42));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 8} strokeLinecap="round" />;
      })}
      {/* したたり */}
      {[0.38, 0.5, 0.62].map((u, i) => {
        const [dx, dy] = warp(Math.PI * (0.62 + u * 0.75), R);
        const L = m * (30 + i * 24) + Math.sin(f / 7 + i) * 4 * m;
        return L > 2 ? <path key={i} d={`M ${dx - 12} ${dy - 6} Q ${dx - 10} ${dy + L} ${dx} ${dy + L + 12} Q ${dx + 10} ${dy + L} ${dx + 12} ${dy - 6} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} /> : null;
      })}
      {/* 伸びる長針・とろける短針 */}
      <path d={`M ${x} ${y + 18 * m} Q ${x + mLen * 0.55} ${y - 30 + 60 * m + sway} ${x + mLen * 0.8} ${y + 80 * m + sway}`} stroke={KRP.ink}
        strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M ${x} ${y + 18 * m} Q ${x - 40} ${y - 50 + 30 * m} ${x - 60 - 30 * m} ${y - 40 + 70 * m}`} stroke={KRP.ink}
        strokeWidth={13} fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y + 18 * m} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

const Hm131: React.FC<{ f: number }> = ({ f }) => {
  const m = easeInOut(seg(f, 4, 40));
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const tick = Math.floor(f / 15);
  const tap = Math.max(0, Math.sin(f / 3)) * 8;
  const peck = Math.max(0, Math.sin(f / 5)) * 14;
  return (
    <Frame f={f} seed={5131}>
      <g transform={`translate(1000 420) scale(${cam}) translate(-1000 -420)`}>
        {/* 向かいのホームの壁 (タイル・広告枠は無地) */}
        <rect x={-40} y={-40} width={2000} height={470} fill="#DCD8CC" />
        {Array.from({ length: 12 }, (_, r) => <line key={r} x1={-40} y1={r * 40} x2={1960} y2={r * 40} stroke="#C8C3B5" strokeWidth={3} />)}
        {[180, 820, 1460].map((bx, i) => (
          <g key={bx}>
            <rect x={bx} y={170} width={300} height={190} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <rect x={bx + 20} y={190} width={260} height={150} fill={[KRP.blueSoft, "#F6D8B8", "#CFE6C6"][i]} />
            <circle cx={bx + 90} cy={260} r={40} fill={[KRP.blue, KRP.orange, KRP.green][i]} opacity={0.7} />
          </g>
        ))}
        {/* 線路 */}
        <rect x={-40} y={430} width={2000} height={110} fill="#8E8C88" />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 70 - 20} y={450} width={40} height={70} fill="#77756F" />)}
        <rect x={-40} y={462} width={2000} height={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
        <rect x={-40} y={504} width={2000} height={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
        {/* こちらのホーム */}
        <rect x={-40} y={540} width={2000} height={600} fill={C.concrete} />
        <rect x={-40} y={540} width={2000} height={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={572} width={2000} height={26} fill={C.tactile} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={C.concreteLine} strokeWidth={4}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 260 - 100} y1={600} x2={i * 320 - 360} y2={1120} />)}</g>
        {/* 屋根と柱と、本物の駅の時計 */}
        <rect x={-40} y={-40} width={2000} height={60} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1634} y={20} width={32} height={880} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1650} y1={20} x2={1650} y2={110} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(1650 200)">
          <circle r={92} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * 72} y1={-Math.cos(a) * 72} x2={Math.sin(a) * (i % 3 ? 80 : 64)} y2={-Math.cos(a) * (i % 3 ? 80 : 64)}
              stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 7} strokeLinecap="round" />;
          })}
          <line x1={0} y1={0} x2={0} y2={-66} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" transform="rotate(60)" />
          <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" transform="rotate(-62)" />
          <line x1={0} y1={12} x2={0} y2={-76} stroke={KRP.red} strokeWidth={4} transform={`rotate(${tick * 6 + 90})`} />
          <circle r={8} fill={KRP.ink} />
        </g>
        {/* ベンチ (背もたれ) */}
        <rect x={340} y={580} width={600} height={28} rx={6} fill="#B98A57" stroke={KRP.ink} strokeWidth={5} />
        <rect x={340} y={618} width={600} height={28} rx={6} fill="#B98A57" stroke={KRP.ink} strokeWidth={5} />
        {[380, 900].map((lx) => <rect key={lx} x={lx - 8} y={570} width={16} height={240} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 待つ人 */}
        <HmFcFolk x={620} y={770} s={1.1} f={f} phase={3} pose="sit" face="worried" gaze={[4, -4]}
          lean={Math.sin(f / 9) * 2} cloth={KRP.blueDeep} clothDark="#34548F" />
        <rect x={330} y={700} width={620} height={26} rx={8} fill="#C99A64" stroke={KRP.ink} strokeWidth={5} />
        <rect x={330} y={726} width={620} height={10} fill="#9E6F3E" opacity={0.6} />
        <rect x={810} y={660} width={74} height={44} rx={8} fill="#6B4A36" stroke={KRP.ink} strokeWidth={4} />
        {/* つま先トントン */}
        <g opacity={0.8}>
          <path d={`M 660 ${764 - tap} q 14 -12 28 0`} stroke={KRP.ink} strokeWidth={4} fill="none" />
          {tap > 6 && <path d="M 690 770 l 16 -10 M 694 784 l 20 0" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />}
        </g>
        {/* ハト */}
        <g transform={`translate(1180 ${800})`}>
          <ellipse cx={0} cy={-36} rx={50} ry={32} fill="#9AA1AE" stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${peck * 2} 40 -50)`}>
            <circle cx={50} cy={-64} r={20} fill="#7E8696" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={56} cy={-68} r={3.5} fill={KRP.ink} />
            <path d="M 68 -62 l 14 4 l -14 4 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2} />
          </g>
          <path d="M -48 -40 l -30 -8 l 8 20 Z" fill="#7E8696" stroke={KRP.ink} strokeWidth={3} />
          <path d="M -6 -4 l 0 12 M 10 -4 l 0 12" stroke={KRP.orange} strokeWidth={5} />
        </g>
        {/* 頭の上の吹き出し */}
        {[[700, 420, 14], [760, 380, 20], [830, 330, 28]].map(([bx, by, r], i) => (
          <circle key={i} cx={bx} cy={by} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={seg(f, i * 2, i * 2 + 4)} />
        ))}
        <g opacity={seg(f, 4, 10)}>
          <ellipse cx={1110} cy={290} rx={330} ry={240} fill="#F6EFDC" stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return <circle key={i} cx={1110 + Math.cos(a) * 318} cy={290 + Math.sin(a) * 228} r={40} fill="#F6EFDC" stroke={KRP.ink} strokeWidth={6} />;
          })}
          <ellipse cx={1110} cy={290} rx={316} ry={226} fill="#F6EFDC" />
          {/* とろけた時計を乗せる木の枝 (ダリ風) */}
          <path d="M 860 330 Q 1000 300 1180 320 Q 1300 330 1380 300" stroke="#8A5A34" strokeWidth={14} fill="none" strokeLinecap="round" />
          <HmFcMeltClock x={1110} y={210} m={m} f={f} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #132 ある研究では、平均で3割以上、長く見積もられていました。
// 格: 図 / seed 5132
// 絵: どこ: 研究室の机の上の方眼の実験ノート (コーヒーのしみ・ペン)。演出: 2本の棒を並べる。左「実際の待ち時間」の棒、右「感じた待ち時間」の棒。右の棒が f で伸びて、左より**3割以上**長いところで止まる。差の部分に赤いかっこと札「3割以上」。動き: 棒が伸びる / 赤いかっこ / ペンが転がる
// どこ: 研究室の机を真上から。方眼の実験ノート (リング綴じ・コーヒーのしみ)、ストップウォッチ、コーヒー、ペン
// 演出: ノートの上に2本の棒。左「実際の待ち時間」、右「感じた待ち時間」。右が伸びて左の3割以上上で止まる。左の高さの点線と、差の赤いかっこに札「3割以上」
// 動き: 棒が伸びる (左 f2-12 / 右 f10-30) / 点線と赤いかっこ (f28-36) / ペンが転がる / ストップウォッチの針
const Hm132: React.FC<{ f: number }> = ({ f }) => {
  const base = 720, hL = 330, hR = 440;
  const gL = easeOut(seg(f, 2, 12)), gR = easeOut(seg(f, 10, 30));
  const topL = base - hL * gL, topR = base - hR * gR;
  const dash = seg(f, 28, 33), brk = seg(f, 31, 36);
  const roll = easeOut(seg(f, 6, 40));
  const penX = lerp(1640, 1420, roll);
  const cam = 1 + 0.03 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5132}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        {/* 机 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.labDesk} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40} y1={i * 130} x2={1960} y2={i * 130 + 20} stroke={C.labDeskDark} strokeWidth={3} opacity={0.4} />)}
        {/* ストップウォッチ (左上) */}
        <g transform="translate(150 560) rotate(-12)">
          <rect x={-16} y={-120} width={32} height={30} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <circle r={96} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
          <circle r={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-70} x2={0} y2={-60} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={10} x2={0} y2={-66} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 6})`} />
          <circle r={7} fill={KRP.ink} />
        </g>
        {/* ノート */}
        <g transform="rotate(-1.5 960 520)">
          <rect x={300} y={70} width={1340} height={850} rx={10} fill={KRP.ink} opacity={0.2} transform="translate(16 18)" />
          <rect x={300} y={70} width={1340} height={850} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.grid} strokeWidth={2.5}>
            {Array.from({ length: 33 }, (_, i) => <line key={`v${i}`} x1={340 + i * 40} y1={80} x2={340 + i * 40} y2={910} />)}
            {Array.from({ length: 21 }, (_, i) => <line key={`h${i}`} x1={310} y1={100 + i * 40} x2={1630} y2={100 + i * 40} />)}
          </g>
          {Array.from({ length: 15 }, (_, i) => (
            <g key={i}>
              <circle cx={380 + i * 86} cy={70} r={11} fill={C.labDesk} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${380 + i * 86} 82 q -10 -30 0 -40`} stroke={KRP.grayDark} strokeWidth={6} fill="none" />
            </g>
          ))}
          {/* コーヒーのしみ */}
          <circle cx={1500} cy={210} r={70} fill="none" stroke={C.coffeeStain} strokeWidth={10} opacity={0.5} />
          <circle cx={1530} cy={240} r={66} fill="none" stroke={C.coffeeStain} strokeWidth={6} opacity={0.3} />
          {/* 軸 */}
          <line x1={560} y1={base} x2={1380} y2={base} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={560} y1={base} x2={560} y2={180} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <path d="M 546 196 L 560 170 L 574 196" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinejoin="round" />
          <text x={540} y={214} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>長さ</text>
          {/* 棒 (マーカーで塗った感じ) */}
          {[[760, topL, KRP.blue, KRP.blueDeep], [1160, topR, KRP.orange, "#B86A22"]].map(([bx, top, col, dk], i) => (
            <g key={i}>
              <rect x={(bx as number) - 110} y={top as number} width={220} height={base - (top as number)} fill={col as string} stroke={KRP.ink} strokeWidth={7} />
              {Array.from({ length: 10 }, (_, k) => {
                const yy = (top as number) + 20 + k * 40;
                return yy < base - 10 ? <line key={k} x1={(bx as number) - 96} y1={yy + 20} x2={(bx as number) + 96} y2={yy} stroke={dk as string} strokeWidth={5} opacity={0.4} /> : null;
              })}
            </g>
          ))}
          {/* 左の高さの点線 */}
          {dash > 0 && <line x1={870} y1={base - hL} x2={870 + 420 * dash} y2={base - hL} stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 10" />}
          {/* 差の赤いかっこ */}
          {brk > 0 && (
            <path d={`M 1290 ${base - hL} q 30 0 30 -${27.5 * brk} l 0 -${20 * brk} q 0 -${7.5 * brk} 16 -${7.5 * brk} q -16 0 -16 -${7.5 * brk} l 0 -${20 * brk} q 0 -${27.5 * brk} -30 -${27.5 * brk}`}
              stroke={KRP.red} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
        {/* ペン (転がる) */}
        <g transform={`translate(${penX} 980) rotate(${-70 + (1640 - penX) * 0.8})`}>
          <rect x={-130} y={-14} width={230} height={28} rx={12} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 100 -14 L 140 0 L 100 14 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-100} y={-20} width={16} height={40} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* コーヒー (右下) */}
        <g transform="translate(1790 820)">
          <circle r={96} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <circle r={74} fill="#6B4527" />
          <ellipse cx={-20} cy={-24} rx={22} ry={10} fill={KRP.white} opacity={0.3 + 0.1 * Math.sin(f / 6)} />
        </g>
      </g>
      <TagPlate x={760} y={790} text="実際の待ち時間" size={34} t={seg(f, 2, 8)} />
      <TagPlate x={1160} y={790} text="感じた待ち時間" size={34} t={seg(f, 10, 16)} />
      <TagPlate x={1470} y={330} text="3割以上" size={46} t={seg(f, 34, 41)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #133 しかも、何もしないで待つ時間ほど、長く感じる。
// 格: 山 / seed 5133
// 絵: どこ: 病院の待合室風の長いすを2つ並べた舞台 (左右)。演出: 左の人は何も持たずにぼーっと座っていて、頭上の砂時計の砂が**ゆっくり**落ちる。右の人は雑誌を読んでいて、頭上の砂時計の砂が**さらさら速く**落ちる。左の人の顔がだんだんげんなり (face="sad")。動き: 2つの砂時計の速さの違い / ページをめくる / げんなり
// どこ: 病院の待合室風。薄緑の壁・受付の小窓・無地のポスター・観葉植物・雑誌ラック。長いすが左右に2つ
// 演出: 左の人は手ぶらでぼーっと待つ: 頭上の砂時計はぽた…ぽた…とゆっくり (カタツムリが這う)。右の人は雑誌を読む: 砂時計はさらさら速い。左の人はだんだんげんなり
// 動き: 砂の速さの違い / ページをめくる (12コマに1回) / 左の人がうなだれていく (f20-40) とため息
const HmFcSuna: React.FC<{ x: number; y: number; s?: number; p: number; f: number; fast: boolean }> = ({ x, y, s = 1, p, f, fast }) => {
  const L = -100 + 88 * p;
  const w = 70 * ((-12 - L) / 88);
  const h = 8 + 84 * p;
  const k = ((f * 3) % 30) / 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-96} y={-132} width={192} height={22} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-96} y={110} width={192} height={22} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {[-84, 84].map((px) => <rect key={px} x={px - 7} y={-112} width={14} height={224} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />)}
      <path d="M -68 -110 Q -70 -40 -8 -6 L -8 6 Q -70 40 -68 110 L 68 110 Q 70 40 8 6 L 8 -6 Q 70 -40 68 -110 Z" fill={KRP.blueSoft} opacity={0.55} stroke={KRP.ink} strokeWidth={5} />
      {/* 上の砂 */}
      {w > 2 && <path d={`M ${-w} ${L} L ${w} ${L} L 4 -10 L -4 -10 Z`} fill={C.sand} stroke={C.sandDark} strokeWidth={3} />}
      {/* 下の山 */}
      <path d={`M -64 106 Q -30 ${106 - h * 0.6} 0 ${106 - h} Q 30 ${106 - h * 0.6} 64 106 Z`} fill={C.sand} stroke={C.sandDark} strokeWidth={3} />
      {/* 落ちる砂 */}
      {fast ? (
        <line x1={0} y1={-6} x2={0} y2={106 - h} stroke={C.sandDark} strokeWidth={6} strokeDasharray="10 6" strokeDashoffset={-f * 6} />
      ) : (
        <circle cx={0} cy={lerp(-4, 106 - h, k)} r={5} fill={C.sandDark} />
      )}
      <path d="M -50 -96 q -6 40 20 70" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} />
    </g>
  );
};

const Hm133: React.FC<{ f: number }> = ({ f }) => {
  const droop = easeInOut(seg(f, 20, 40));
  const flipK = (f % 12) / 6;
  const flipping = flipK < 1;
  const cam = lerp(1.0, 1.04, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={5133}>
      <g transform={`translate(960 500) scale(${cam}) translate(-960 -500)`}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={2000} height={700} fill={C.waitWall} />
        <rect x={-40} y={520} width={2000} height={140} fill={C.waitWallLow} />
        <rect x={-40} y={512} width={2000} height={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        {/* 受付の小窓 (真ん中奥) と番号の表示 (数字は出さない) */}
        <rect x={830} y={170} width={260} height={200} rx={8} fill="#F4F1E8" stroke={KRP.ink} strokeWidth={6} />
        <rect x={850} y={190} width={220} height={120} fill={KRP.blueSoft} opacity={0.7} stroke={KRP.ink} strokeWidth={4} />
        <rect x={820} y={360} width={280} height={24} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={870} y={70} width={180} height={70} rx={8} fill="#2A2A30" stroke={KRP.ink} strokeWidth={5} />
        <rect x={890} y={90} width={140} height={30} rx={4} fill={KRP.red} opacity={0.35 + 0.15 * Math.sin(f / 7)} />
        {/* ポスター (無地) と時計なしの壁 */}
        {[[120, KRP.blueSoft], [1640, "#F6D8B8"]].map(([px, col], i) => (
          <g key={i} transform={`rotate(${i ? 2 : -2} ${(px as number) + 90} 200)`}>
            <rect x={px as number} y={90} width={180} height={240} fill={col as string} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={(px as number) + 90} cy={170} r={44} fill={KRP.white} opacity={0.7} />
            <rect x={(px as number) + 30} y={240} width={120} height={14} rx={6} fill={KRP.white} opacity={0.7} />
            <circle cx={(px as number) + 90} cy={96} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {/* 床 */}
        <rect x={-40} y={660} width={2000} height={480} fill={C.waitFloor} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180 - 60} y1={660} x2={i * 220 - 300} y2={1120} stroke="#B5AA92" strokeWidth={3} />)}
        {/* 観葉植物 (真ん中) */}
        <g transform="translate(960 820)">
          <path d="M -46 0 L -36 -100 L 36 -100 L 46 0 Z" fill="#B0633F" stroke={KRP.ink} strokeWidth={5} />
          {[-2, -1, 0, 1, 2].map((k) => <ellipse key={k} cx={k * 26} cy={-190 + Math.abs(k) * 20} rx={20} ry={64} fill="#4E8A55" stroke={KRP.ink} strokeWidth={4}
            transform={`rotate(${k * 22 + Math.sin(f / 30 + k) * 2} ${k * 26} -100)`} />)}
        </g>
        {/* 長いす (背) */}
        {[260, 1060].map((bx) => <rect key={bx} x={bx} y={540} width={600} height={140} rx={20} fill={C.benchSeat} stroke={KRP.ink} strokeWidth={6} />)}
        {/* 左の人: 手ぶら・うなだれていく */}
        <HmFcFolk x={560} y={767} s={1.15} f={f} phase={2} face={f > 24 ? "sad" : "normal"} gaze={f > 24 ? [0, 4] : [2, -6]}
          lean={8 * droop} cloth="#8A6A9A" clothDark="#5E4A6E" />
        {/* 右の人: 雑誌 */}
        <HmFcFolk x={1360} y={767} s={1.15} f={f} phase={6} pose="hold" face="smile" gaze={[-2, 6]} cloth={KRP.green} clothDark="#4E8A55">
          <g transform="translate(0 -110)">
            <rect x={-86} y={-56} width={172} height={112} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-80} y={-50} width={76} height={100} fill="#F6D8B8" />
            <rect x={4} y={-50} width={76} height={100} fill={KRP.blueSoft} />
            <circle cx={-42} cy={-14} r={22} fill={KRP.orange} opacity={0.8} />
            {[0, 1, 2].map((k) => <line key={k} x1={14} y1={-30 + k * 22} x2={70} y2={-30 + k * 22} stroke={KRP.grayDark} strokeWidth={4} />)}
            <line x1={0} y1={-56} x2={0} y2={56} stroke={KRP.ink} strokeWidth={4} />
            {flipping && (
              <rect x={0} y={-52} width={78} height={104} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
                transform={`scale(${Math.cos(flipK * Math.PI)} 1)`} />
            )}
          </g>
        </HmFcFolk>
        {/* 長いす (座面と前板。脚を隠す) */}
        {[260, 1060].map((bx) => (
          <g key={bx}>
            <rect x={bx - 10} y={690} width={620} height={30} rx={12} fill={C.benchSeat} stroke={KRP.ink} strokeWidth={6} />
            <rect x={bx} y={718} width={600} height={76} rx={8} fill={C.benchDark} stroke={KRP.ink} strokeWidth={6} />
            {[bx + 30, bx + 560].map((lx) => <rect key={lx} x={lx} y={792} width={18} height={50} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
          </g>
        ))}
        {[[528, 0], [592, 0], [1328, 0], [1392, 0]].map(([sx], i) => <ellipse key={i} cx={sx} cy={812} rx={24} ry={11} fill={KRP.ink} />)}
        {/* ため息 */}
        {f > 28 && (
          <g opacity={seg(f, 28, 34) * (0.7 + 0.3 * Math.sin(f / 5))}>
            <path d={`M ${650} ${560} q 40 -10 50 20 q 30 -20 50 10 q -10 30 -50 20 q -30 20 -50 -10 Z`} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />
          </g>
        )}
        {/* 砂時計 */}
        <HmFcSuna x={560} y={260} s={1.0} p={0.3 + 0.05 * seg(f, 0, 42)} f={f} fast={false} />
        <HmFcSuna x={1360} y={260} s={1.0} p={0.12 + 0.62 * seg(f, 0, 42)} f={f} fast />
        {/* 左: カタツムリがのろのろ */}
        <g transform={`translate(${460 + f * 0.6} 120)`}>
          <ellipse cx={0} cy={0} rx={34} ry={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-4} cy={-18} r={20} fill="#C98A5A" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -4 -18 m -10 0 a 10 10 0 1 1 10 10" stroke={KRP.ink} strokeWidth={3} fill="none" />
          <path d="M 26 -6 l 8 -20 M 32 -4 l 14 -16" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 右: 速さの線 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${1470 + i * 12} ${200 + i * 40} l ${40} 0`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round"
            opacity={0.4 + 0.4 * Math.sin(f / 3 + i)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #134 だから人は、待ち時間に、何かを持ちこむのです。
// 格: 山 / seed 5134
// 絵: どこ: 駅の改札口 (現代・自動改札)。演出: 改札を通る人たちが、それぞれ何かを持って入っていく: 文庫本・新聞・音楽プレーヤーとイヤホン・編み物・スマホ。改札の上の札に「持ちこみ」ではなく、手荷物のマーク。人の列が右へ流れる。動き: 人が改札を通る / 改札のフラップがぱたぱた / 列が流れる
// どこ: 今の駅の改札口を横から。奥にタイルの壁と柱、天井から手荷物マークの案内板。手前と奥に自動改札の箱
// 演出: 人の列が右へ流れ、それぞれ何かを持って改札を通る: 文庫本・新聞・音楽プレーヤーとイヤホン・編み物・スマホ。通る人に合わせてフラップがぱたっと開く
// 動き: 列が右へ流れる (f×4px) / フラップが開閉 / 音符・ページ・画面が動く
const Hm134: React.FC<{ f: number }> = ({ f }) => {
  const gx = 900;
  const xs = [0, 1, 2, 3, 4].map((i) => i * 360 + f * 4);
  const open = Math.max(...xs.map((px) => clamp01(1 - Math.abs(px - gx) / 170)));
  const walkY = (i: number) => -Math.abs(Math.sin((f + i * 7) / 4)) * 6;
  const people: { cloth: string; dark: string; pose: FolkProps["pose"]; face: FolkProps["face"]; gaze: [number, number]; item: React.ReactNode }[] = [
    { cloth: "#8A6A9A", dark: "#5E4A6E", pose: "hold", face: "smile", gaze: [2, 6], item: (
      <g transform="translate(0 -124)">
        <path d="M -40 -26 L 0 -20 L 40 -26 L 40 20 L 0 26 L -40 20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <line x1={0} y1={-20} x2={0} y2={26} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((k) => <line key={k} x1={-32} y1={-10 + k * 10} x2={-8} y2={-8 + k * 10} stroke={KRP.gray} strokeWidth={3} />)}
        <path d="M -44 -28 L -44 24 L -40 20 M 44 -28 L 44 24 L 40 20" stroke={KRP.red} strokeWidth={5} fill="none" />
      </g>) },
    { cloth: "#4E5A6E", dark: "#353D4C", pose: "hold", face: "normal", gaze: [0, 5], item: (
      <g transform={`translate(0 -134) rotate(${Math.sin(f / 10) * 2})`}>
        <rect x={-58} y={-44} width={116} height={86} fill={C.paperNews} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-50} y={-36} width={100} height={16} fill={KRP.grayDark} opacity={0.7} />
        {[0, 1, 2].map((k) => <line key={k} x1={-50} y1={-6 + k * 16} x2={50} y2={-6 + k * 16} stroke={KRP.gray} strokeWidth={4} />)}
        <line x1={0} y1={-44} x2={0} y2={42} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
      </g>) },
    { cloth: "#5A6A9A", dark: "#3E4A70", pose: "stand", face: "joy", gaze: [0, 0], item: (
      <g>
        <path d="M 67 -80 Q 70 -170 64 -222 M 67 -80 Q 0 -150 -64 -222" stroke={KRP.ink} strokeWidth={3} fill="none" />
        <circle cx={-64} cy={-222} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={64} cy={-222} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={56} y={-92} width={24} height={38} rx={5} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={68} cy={-68} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
        {[0, 1].map((k) => {
          const u = ((f * 1.5 + k * 22) % 44) / 44;
          return (
            <g key={k} transform={`translate(${90 + k * 20 + u * 30} ${-260 - u * 90})`} opacity={1 - u}>
              <ellipse cx={0} cy={0} rx={11} ry={8} fill={KRP.ink} transform="rotate(-20)" />
              <line x1={9} y1={-2} x2={9} y2={-38} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 9 -38 q 12 6 14 18" stroke={KRP.ink} strokeWidth={4} fill="none" />
            </g>
          );
        })}
      </g>) },
    { cloth: KRP.orange, dark: "#B86A22", pose: "hold", face: "smile", gaze: [0, 5], item: (
      <g transform="translate(0 -118)">
        <rect x={-30} y={4} width={60} height={46} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => <path key={k} d={`M -26 ${16 + k * 12} l 8 -6 l 8 6 l 8 -6 l 8 6 l 8 -6 l 8 6`} stroke={KRP.white} strokeWidth={2.5} fill="none" opacity={0.7} />)}
        <line x1={-50} y1={-30} x2={34} y2={20 + Math.sin(f / 4) * 4} stroke="#B98A57" strokeWidth={6} strokeLinecap="round" />
        <line x1={50} y1={-30} x2={-34} y2={20 - Math.sin(f / 4) * 4} stroke="#B98A57" strokeWidth={6} strokeLinecap="round" />
        <path d="M 20 50 Q 30 80 40 100" stroke={KRP.red} strokeWidth={3} fill="none" />
        <circle cx={44} cy={114} r={18} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 32 108 q 12 -8 24 4 M 30 118 q 14 -6 26 6" stroke={KRP.white} strokeWidth={2} fill="none" opacity={0.6} />
      </g>) },
    { cloth: "#6A9AB0", dark: "#4A7A90", pose: "hold", face: "normal", gaze: [0, 6], item: (
      <Sumaho x={0} y={-134} s={0.22} f={f} screen="feed" glow={0.7} />) },
  ];
  return (
    <Frame f={f} seed={5134}>
      {/* 奥の壁と柱 */}
      <rect x={-40} y={-40} width={2000} height={720} fill={C.hallWall} />
      {Array.from({ length: 16 }, (_, r) => <line key={r} x1={-40} y1={r * 45} x2={1960} y2={r * 45} stroke={C.hallTile} strokeWidth={3} />)}
      {Array.from({ length: 30 }, (_, c) => <line key={`c${c}`} x1={c * 70} y1={0} x2={c * 70} y2={680} stroke={C.hallTile} strokeWidth={2} opacity={0.6} />)}
      {[240, 1600].map((px) => <rect key={px} x={px} y={-40} width={110} height={720} fill="#CFC9BC" stroke={KRP.ink} strokeWidth={6} />)}
      <rect x={-40} y={-40} width={2000} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 壁のポスター (無地) と発車の表示板 (行の帯だけ) */}
      {[[420, KRP.blueSoft, KRP.blue], [1380, "#F6D8B8", KRP.orange]].map(([px, bg, dot], i) => (
        <g key={i}>
          <rect x={px as number} y={300} width={180} height={250} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={(px as number) + 14} y={314} width={152} height={222} fill={bg as string} />
          <circle cx={(px as number) + 90} cy={400} r={46} fill={dot as string} opacity={0.75} />
          <rect x={(px as number) + 34} y={480} width={112} height={14} rx={6} fill={KRP.white} opacity={0.8} />
        </g>
      ))}
      <g>
        <rect x={700} y={300} width={520} height={200} rx={8} fill="#2A2A30" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x={724} y={324 + r * 56} width={60} height={36} rx={4} fill={[KRP.orange, KRP.green, KRP.blue][r]} opacity={0.85} />
            <rect x={800} y={330 + r * 56} width={260} height={24} rx={4} fill="#FFB347" opacity={r === Math.floor(f / 10) % 3 ? 0.9 : 0.55} />
            <rect x={1080} y={330 + r * 56} width={110} height={24} rx={4} fill="#7FD1FF" opacity={0.7} />
          </g>
        ))}
      </g>
      {/* 天井から下がる案内板: 手荷物のマークと矢印 */}
      <g transform={`rotate(${Math.sin(f / 18) * 0.5} 960 20)`}>
        {[700, 1220].map((lx) => <line key={lx} x1={lx} y1={20} x2={lx} y2={80} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={600} y={78} width={720} height={150} rx={10} fill={C.signNavy} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(760 154)">
          <rect x={-46} y={-30} width={92} height={70} rx={10} fill={KRP.white} />
          <path d="M -20 -30 L -20 -46 L 20 -46 L 20 -30" stroke={KRP.white} strokeWidth={8} fill="none" />
          <line x1={-46} y1={0} x2={46} y2={0} stroke={C.signNavy} strokeWidth={5} />
        </g>
        <g transform="translate(900 160)">
          <rect x={-36} y={-24} width={72} height={58} rx={14} fill={KRP.white} />
          <path d="M -26 -24 Q 0 -70 26 -24" stroke={KRP.white} strokeWidth={7} fill="none" />
        </g>
        <path d="M 1060 154 L 1230 154 M 1190 114 L 1240 154 L 1190 194" stroke={KRP.white} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* 床 */}
      <rect x={-40} y={680} width={2000} height={460} fill="#C9C3B6" />
      <rect x={-40} y={674} width={2000} height={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 190 - 60} y1={686} x2={i * 240 - 360} y2={1120} stroke="#B3AC9E" strokeWidth={3} />)}
      {/* 奥の改札の箱 */}
      <rect x={gx - 120} y={736} width={250} height={140} rx={10} fill="#C3C8CE" stroke={KRP.ink} strokeWidth={5} />
      <rect x={gx - 120} y={728} width={250} height={18} rx={6} fill={C.gateTop} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      {/* 人の列 */}
      {people.map((p, i) => (
        <HmFcFolk key={i} x={xs[i]} y={900 + walkY(i)} s={1.1} f={f} phase={i * 3 + 1} pose={p.pose} face={p.face}
          gaze={p.gaze} cloth={p.cloth} clothDark={p.dark} lean={2}>
          {p.item}
        </HmFcFolk>
      ))}
      {/* 手前の改札の箱とフラップ */}
      <g>
        <rect x={gx - 130} y={800} width={260} height={130} rx={10} fill={C.gateBody} stroke={KRP.ink} strokeWidth={6} />
        <rect x={gx - 130} y={790} width={260} height={22} rx={6} fill={C.gateTop} stroke={KRP.ink} strokeWidth={5} />
        <rect x={gx - 110} y={776} width={70} height={18} rx={5} fill={HP.screen} stroke={KRP.ink} strokeWidth={3} />
        <rect x={gx - 110} y={776} width={70} height={18} rx={5} fill={KRP.white} opacity={0.3 + 0.5 * open} />
        <rect x={gx + 60} y={830} width={44} height={30} rx={4} fill="#2A2A30" />
        <circle cx={gx + 82} cy={845} r={7} fill={open > 0.3 ? KRP.green : KRP.red} />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`rotate(${sd * 70 * open} ${gx + sd * 22} 790)`}>
            <path d={`M ${gx + sd * 22} 790 L ${gx + sd * 22} 730 Q ${gx + sd * 4} 740 ${gx + sd * 4} 790 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #135 いま、日本の人が平日に通勤や通学にかける時間は、行き帰りで、平均1時間19分。
// 格: 図 / seed 5135
// 絵: どこ: 現代の通勤電車の車内の中吊り広告の枠 (の中に図)。演出: 家と会社 (学校) を往復する矢印。行きの矢印と帰りの矢印を足し算して、大きな時計の札「1時間19分」。札「行き帰り」「平均」。吊り革が揺れる。動き: 矢印が伸びて往復 / 時計の札がぽん / 吊り革
// どこ: 今の通勤電車の車内。天井の冷房の吹き出し口と照明、網棚、両脇の窓 (外の景色が流れる)、吊り革。真ん中に中吊り広告の枠
// 演出: 中吊りの枠の中が図: 家 ⇄ 会社・学校。行きの矢印と帰りの矢印が伸び、＋で合わさって、時計と札「1時間19分」がぽん。札「行き帰り」「平均」
// 動き: 行きの矢印 (f4-16) → 帰りの矢印 (f14-26) → ＋ (f24) → 時計の札がぽん (f28-38) / 吊り革と中吊りが揺れる / 窓の外が流れる
const Hm135: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 14);
  const go = easeOut(seg(f, 4, 16)), back = easeOut(seg(f, 14, 26));
  const plus = seg(f, 24, 28), down = seg(f, 26, 30), clk = seg(f, 28, 36);
  const scroll = (f * 14) % 400;
  const Strap: React.FC<{ x: number; y0: number; len: number; ph: number; big?: boolean }> = ({ x, y0, len, ph, big }) => (
    <g transform={`rotate(${Math.sin(f / 10 + ph) * 6 + sway * 3} ${x} ${y0})`}>
      <rect x={x - (big ? 10 : 7)} y={y0} width={big ? 20 : 14} height={len} rx={4} fill={C.strap} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${x} ${y0 + len - 6} m -${big ? 40 : 28} ${big ? 40 : 28} a ${big ? 40 : 28} ${big ? 40 : 28} 0 1 0 ${big ? 80 : 56} 0 a ${big ? 40 : 28} ${big ? 40 : 28} 0 1 0 -${big ? 80 : 56} 0`}
        fill="none" stroke={KRP.white} strokeWidth={big ? 14 : 10} />
      <path d={`M ${x} ${y0 + len - 6} m -${big ? 40 : 28} ${big ? 40 : 28} a ${big ? 40 : 28} ${big ? 40 : 28} 0 1 0 ${big ? 80 : 56} 0 a ${big ? 40 : 28} ${big ? 40 : 28} 0 1 0 -${big ? 80 : 56} 0`}
        fill="none" stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
  return (
    <Frame f={f} seed={5135}>
      {/* 車内の壁・窓 */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={C.carWall} />
      {[[-40, 300], [1640, 1960]].map(([x1, x2], i) => (
        <g key={i}>
          <rect x={x1 + 20} y={420} width={x2 - x1 - 40} height={380} rx={14} fill={C.skyNow} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 4 }, (_, k) => {
            const bx = x1 + 20 + ((k * 130 - scroll * (i ? 1 : 1)) % 520 + 520) % 520 - 60;
            return <rect key={k} x={bx} y={560 + (k % 2) * 40} width={90} height={240 - (k % 2) * 40} fill="#8FA6BC" stroke={KRP.ink} strokeWidth={3} opacity={0.8} />;
          })}
          <rect x={x1 + 20} y={420} width={x2 - x1 - 40} height={380} rx={14} fill="none" stroke={KRP.ink} strokeWidth={7} />
        </g>
      ))}
      {/* 座席の背 (下) */}
      <rect x={-40} y={820} width={2000} height={300} fill="#5E7AA8" />
      <rect x={-40} y={812} width={2000} height={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {/* 天井 */}
      <rect x={-40} y={-40} width={2000} height={150} fill={C.carCeil} stroke={KRP.ink} strokeWidth={6} />
      {[160, 760, 1360].map((lx) => <rect key={lx} x={lx} y={20} width={400} height={30} rx={10} fill={C.ledWhite} stroke={KRP.ink} strokeWidth={4} />)}
      {[460, 1060].map((vx) => (
        <g key={vx}>
          <rect x={vx} y={64} width={300} height={34} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, k) => <line key={k} x1={vx + 20 + k * 36} y1={70} x2={vx + 20 + k * 36} y2={92} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
      ))}
      {/* 網棚 (左右) */}
      {[[-40, 300], [1620, 1960]].map(([x1, x2], i) => (
        <g key={i}>
          <rect x={x1} y={330} width={x2 - x1} height={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, k) => <line key={k} x1={x1 + k * 44} y1={348} x2={x1 + k * 44 + 20} y2={380} stroke={KRP.grayDark} strokeWidth={3} />)}
          <rect x={x1 + 40} y={290} width={110} height={44} rx={10} fill={i ? "#6B4A36" : KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 吊り革の棒と吊り革 (奥) */}
      <rect x={-40} y={140} width={2000} height={14} rx={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {[80, 200, 1720, 1840].map((sx, i) => <Strap key={sx} x={sx} y0={150} len={120} ph={i} />)}
      {/* 中吊り広告の枠 */}
      <g transform={`rotate(${sway * 0.9} 960 150)`}>
        {[420, 1500].map((cx) => <rect key={cx} x={cx - 14} y={140} width={28} height={50} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={292} y={196} width={1336} height={600} rx={8} fill={KRP.ink} opacity={0.18} />
        <rect x={280} y={180} width={1360} height={610} rx={8} fill={C.poster} stroke={KRP.ink} strokeWidth={8} />
        <rect x={300} y={200} width={1320} height={570} rx={4} fill="none" stroke={KRP.blueSoft} strokeWidth={12} />
        {/* 家 */}
        <g transform="translate(470 400)">
          <rect x={-80} y={-50} width={160} height={120} fill="#F6D8B8" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -104 -44 L 0 -130 L 104 -44 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-22} y={4} width={44} height={66} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={38} y={-24} width={30} height={30} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
          <rect x={50} y={-120} width={22} height={50} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 会社と学校 */}
        <g transform="translate(1420 400)">
          <rect x={-40} y={-150} width={120} height={220} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 5 }, (_, r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-28 + c * 36} y={-136 + r * 40} width={24} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />))}
          <rect x={-150} y={-40} width={110} height={110} fill="#F2E3B0" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -160 -40 L -95 -86 L -30 -40 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-95} cy={-6} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -95 -6 l 0 -10 M -95 -6 l 8 0" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 行き (上・右向き) */}
        <g>
          <line x1={600} y1={320} x2={600 + 700 * go} y2={320} stroke={KRP.orange} strokeWidth={22} strokeLinecap="round" />
          {go > 0.05 && <path d={`M ${560 + 700 * go} 284 L ${620 + 700 * go} 320 L ${560 + 700 * go} 356 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />}
        </g>
        {/* 帰り (下・左向き) */}
        <g>
          <line x1={1320} y1={450} x2={1320 - 700 * back} y2={450} stroke={KRP.blueDeep} strokeWidth={22} strokeLinecap="round" />
          {back > 0.05 && <path d={`M ${1360 - 700 * back} 414 L ${1300 - 700 * back} 450 L ${1360 - 700 * back} 486 Z`} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />}
        </g>
        <text x={960} y={292} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink} opacity={go}>行き</text>
        <text x={960} y={512} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink} opacity={back}>帰り</text>
        {/* ＋ と、下への矢印 */}
        {plus > 0 && (
          <g transform={`translate(960 385) scale(${pop(plus)})`}>
            <circle r={34} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -16 0 L 16 0 M 0 -16 L 0 16" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {down > 0 && <path d={`M 960 530 L 960 ${530 + 50 * down}`} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />}
        {/* 時計 */}
        {clk > 0 && (
          <g transform={`translate(660 660) scale(${pop(clk)})`}>
            <circle r={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <path d="M 0 0 L 0 -60 A 60 60 0 0 1 59 -10 Z" fill={KRP.orange} opacity={0.35} />
            <line x1={0} y1={0} x2={0} y2={-42} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${clk * 114})`} />
            <line x1={0} y1={0} x2={0} y2={-28} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" transform="rotate(30)" />
            <circle r={6} fill={KRP.ink} />
          </g>
        )}
        <TagPlate x={960} y={660} text="1時間19分" size={66} t={clk} fill={KRP.yellow} />
        <TagPlate x={1382} y={622} text="行き帰り" size={36} t={seg(f, 32, 38)} />
        <TagPlate x={1346} y={700} text="平均" size={36} t={seg(f, 34, 40)} />
      </g>
      {/* 手前の吊り革 (大きく・画面の上を横切る) */}
      <rect x={-40} y={-40} width={2000} height={22} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {[120, 1800].map((sx, i) => <Strap key={sx} x={sx} y0={-20} len={200} ph={i + 3} big />)}
    </Frame>
  );
};

// #136 の背景: 神奈川の名所の詰め合わせ (地理はわざと無視。字・ロゴは描かない)
// 奥から: 夕焼けの空・サーチライト → 箱根の山と富士山 (夕日) → ランドマークタワー → 海 → ベイブリッジ
// → 江の島とシーキャンドル → 大観覧車 → 赤レンガ倉庫 → 港の広場と手すり → 中華街の門と鎌倉の大仏 → カモメ
const HmFcGull: React.FC<{ x: number; y: number; s?: number; flap: number; perched?: boolean }> = ({ x, y, s = 1, flap, perched }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {perched ? (
      <g>
        <ellipse cx={0} cy={0} rx={22} ry={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -6 -4 q 14 -4 26 6" stroke={KRP.grayDark} strokeWidth={4} fill="none" />
        <circle cx={-18} cy={-14} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-21} cy={-16} r={2.2} fill={KRP.ink} />
        <path d="M -27 -13 l -12 3 l 11 3 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M -4 12 v 9 M 6 12 v 9" stroke={KRP.orange} strokeWidth={4} strokeLinecap="round" />
      </g>
    ) : (
      <g>
        <path d={`M -34 ${-4 - 16 * flap} Q -16 ${-14 * flap - 2} 0 2 Q 16 ${-14 * flap - 2} 34 ${-4 - 16 * flap}`}
          stroke={KRP.ink} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M -34 ${-4 - 16 * flap} Q -16 ${-14 * flap - 2} 0 2 Q 16 ${-14 * flap - 2} 34 ${-4 - 16 * flap}`}
          stroke={KRP.white} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )}
  </g>
);

const HmFcKanagawaBg: React.FC<{ f: number }> = ({ f }) => {
  const wheelRot = f * 0.7; // 観覧車がゆっくり回る
  const beamA = Math.sin(f / 18) * 16;
  const beamB = Math.sin(f / 15 + 2) * 18;
  const candleRot = f * 5; // シーキャンドルの光が回る
  const candleFront = 0.5 + 0.5 * Math.cos((candleRot * Math.PI) / 180);
  // 大仏の頭に降りてくるカモメ
  const gl = easeInOut(seg(f, 10, 38));
  const glX = lerp(640, 214, gl), glY = lerp(170, 568, gl) - Math.sin(gl * Math.PI) * 60;
  return (
    <g>
      <defs>
        <linearGradient id="hm136sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="0.42" stopColor={C.duskMid} />
          <stop offset="0.8" stopColor={C.duskLow} />
          <stop offset="1" stopColor={C.duskGlow} />
        </linearGradient>
        <radialGradient id="hm136sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.duskGlow} stopOpacity={0.95} />
          <stop offset="1" stopColor={C.duskGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 夕焼けの空 */}
      <rect x={-40} y={-40} width={2000} height={590} fill="url(#hm136sky)" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={360 + rnd(5136, i) * 1560} cy={rnd(36, i) * 170 + 16} r={3}
          fill={KRP.white} opacity={0.35 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
      ))}
      {/* うすい夕焼け雲 (ゆっくり流れる) */}
      {[[700, 210, 1], [1480, 170, 1.2], [1040, 120, 0.8]].map(([cx, cy, k], i) => (
        <g key={i} transform={`translate(${cx + f * 0.6 * (i % 2 ? -1 : 1)} ${cy}) scale(${k})`} opacity={0.55}>
          <path d="M -150 0 q 30 -30 80 -14 q 30 -34 84 -10 q 46 -16 70 18 q 40 4 46 24 L -170 18 q -6 -14 20 -18 Z" fill={C.wheelPink} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {/* サーチライト (華やか) */}
      <g opacity={0.16}>
        <polygon points="0,0 -46,-640 46,-640" fill={C.duskGlow} transform={`translate(780 540) rotate(${-14 + beamA})`} />
        <polygon points="0,0 -46,-640 46,-640" fill={C.duskGlow} transform={`translate(1160 540) rotate(${16 + beamB})`} />
      </g>
      {/* 夕日 (富士山のうしろ) */}
      <circle cx={1250} cy={470} r={200} fill="url(#hm136sun)" />
      <circle cx={1250} cy={470} r={58} fill={C.duskGlow} stroke={KRP.ink} strokeWidth={4} />
      {/* 箱根の山 (遠く) */}
      <path d="M 560 540 Q 640 470 740 500 Q 820 440 920 488 Q 1000 470 1060 500 L 1720 500 Q 1800 450 1880 480 Q 1940 470 1980 490 L 1980 545 L 560 545 Z"
        fill={C.hakoneFar} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 富士山 */}
      <path d="M 840 545 L 1180 270 Q 1250 248 1320 270 L 1680 545 Z" fill={C.fujiBody} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 1180 270 Q 1250 248 1320 270 L 1372 310 L 1346 330 L 1320 312 L 1296 336 L 1270 316 L 1244 340 L 1220 316 L 1196 334 L 1172 314 L 1150 328 L 1130 310 Z"
        fill={C.fujiSnow} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 箱根の山 (手前) */}
      <path d="M 700 548 Q 790 500 880 520 Q 960 486 1060 516 Q 1140 492 1220 530 L 1220 548 Z" fill={C.hakoneNear} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* ランドマークタワー (上が少し細い・窓の灯り・てっぺんの赤い灯) */}
      <g>
        <path d="M 1592 545 Q 1608 300 1628 74 L 1712 74 Q 1732 300 1748 545 Z" fill={C.towerBody} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 1670 74 L 1670 545" stroke={C.towerDark} strokeWidth={4} />
        {Array.from({ length: 15 }, (_, r) => {
          const yy = 96 + r * 30;
          const half = 42 + (yy - 74) * 0.065;
          return [0, 1, 2, 3].map((c) => (
            <rect key={`${r}-${c}`} x={1670 - half + 10 + c * ((half * 2 - 20) / 4)} y={yy} width={(half * 2 - 20) / 4 - 8} height={14}
              fill={C.lampGlow} opacity={(r * 3 + c + Math.floor(f / 12)) % 5 === 0 ? 0.25 : 0.85} />
          ));
        })}
        <path d="M 1632 74 L 1644 44 L 1696 44 L 1708 74 Z" fill={C.towerDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={1670} cy={36} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} opacity={Math.floor(f / 10) % 2 ? 1 : 0.35} />
      </g>
      {/* 海 (夕日が映ってきらきら) */}
      <rect x={-40} y={530} width={2000} height={130} fill={C.sea} />
      {Array.from({ length: 12 }, (_, i) => {
        const wx = ((rnd(77, i) * 2000 + f * 2.2) % 2040) - 60;
        return <path key={i} d={`M ${wx} ${560 + (i % 4) * 22} q 18 -8 36 0 q 18 8 36 0`} stroke={C.seaLight} strokeWidth={4} fill="none" />;
      })}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={1250 - 60 + rnd(88, i) * 120 - 30 + Math.sin(f / 5 + i) * 8} y={540 + i * 18} width={60 - i * 6} height={6} rx={3}
          fill={C.duskGlow} opacity={0.75} />
      ))}
      {/* 横浜ベイブリッジ (白い橋・斜めのケーブル・灯り) */}
      <g>
        {[1430, 1860].map((tx) => (
          <g key={tx}>
            {Array.from({ length: 7 }, (_, k) => (
              <g key={k}>
                <line x1={tx} y1={316} x2={tx - 60 - k * 46} y2={468} stroke={C.bridgeWhite} strokeWidth={3} />
                <line x1={tx} y1={316} x2={tx + 60 + k * 46} y2={468} stroke={C.bridgeWhite} strokeWidth={3} />
              </g>
            ))}
          </g>
        ))}
        <rect x={1020} y={462} width={980} height={18} fill={C.bridgeWhite} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1020} y={486} width={980} height={12} fill={C.towerBody} stroke={KRP.ink} strokeWidth={4} />
        {[1430, 1860].map((tx) => (
          <g key={tx}>
            <path d={`M ${tx - 30} 545 L ${tx - 14} 300 L ${tx + 14} 300 L ${tx + 30} 545`} fill="none" stroke={KRP.ink} strokeWidth={22} strokeLinejoin="round" />
            <path d={`M ${tx - 30} 545 L ${tx - 14} 300 L ${tx + 14} 300 L ${tx + 30} 545`} fill="none" stroke={C.bridgeWhite} strokeWidth={13} strokeLinejoin="round" />
            <line x1={tx - 24} y1={410} x2={tx + 24} y2={410} stroke={KRP.ink} strokeWidth={10} />
            <line x1={tx - 24} y1={410} x2={tx + 24} y2={410} stroke={C.bridgeWhite} strokeWidth={5} />
            <circle cx={tx} cy={294} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} opacity={Math.floor(f / 10 + 1) % 2 ? 1 : 0.35} />
          </g>
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={1036 + i * 40} cy={471} r={4} fill={C.lampGlow} opacity={0.45 + 0.55 * Math.abs(Math.sin(f / 7 + i * 0.6))} />
        ))}
      </g>
      {/* 江の島とシーキャンドル (灯台の塔・光が回る) */}
      <g>
        <path d="M 1070 590 Q 1110 516 1176 500 Q 1240 470 1306 500 Q 1356 520 1384 590 Z" fill={C.islandGreen} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {[1120, 1160, 1290, 1330].map((tx, i) => <circle key={tx} cx={tx} cy={526 - (i % 2) * 14} r={20} fill={C.islandGreen} stroke={KRP.ink} strokeWidth={4} />)}
        <path d="M 1070 590 L 1100 566 L 1140 584 L 1190 568 L 1250 586 L 1310 566 L 1384 590 Z" fill={C.islandRock} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <polygon points="0,0 -24,-300 24,-300" fill={C.duskGlow} opacity={0.18 + 0.3 * candleFront}
          transform={`translate(1240 332) rotate(${75 * Math.sin((candleRot * Math.PI) / 180)})`} />
        <path d="M 1226 490 L 1232 360 L 1248 360 L 1254 490 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1229 440 L 1251 440 M 1231 400 L 1249 400" stroke={KRP.gray} strokeWidth={3} />
        <path d="M 1204 364 L 1276 364 L 1264 346 L 1216 346 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={1226} y={318} width={28} height={28} rx={4} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1222 318 L 1240 300 L 1258 318 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* 大観覧車 (真ん中は時計の円。ゆっくり回る) */}
      <g>
        <path d="M 474 540 L 560 270 L 646 540" stroke={KRP.ink} strokeWidth={16} fill="none" strokeLinejoin="round" />
        <path d="M 474 540 L 560 270 L 646 540" stroke={C.bridgeWhite} strokeWidth={8} fill="none" strokeLinejoin="round" />
        <g transform={`rotate(${wheelRot} 560 270)`}>
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i * 18 * Math.PI) / 180;
            return <line key={i} x1={560 + Math.cos(a) * 50} y1={270 + Math.sin(a) * 50} x2={560 + Math.cos(a) * 196} y2={270 + Math.sin(a) * 196}
              stroke={i % 2 ? C.wheelCyan : C.wheelPink} strokeWidth={3.5} opacity={0.9} />;
          })}
        </g>
        <circle cx={560} cy={270} r={196} fill="none" stroke={KRP.ink} strokeWidth={14} />
        <circle cx={560} cy={270} r={196} fill="none" stroke={C.bridgeWhite} strokeWidth={7} />
        {Array.from({ length: 36 }, (_, i) => {
          const a = ((i * 10 + wheelRot) * Math.PI) / 180;
          return <circle key={i} cx={560 + Math.cos(a) * 196} cy={270 + Math.sin(a) * 196} r={4}
            fill={[C.wheelPink, C.wheelCyan, KRP.yellow][(i + Math.floor(f / 6)) % 3]} />;
        })}
        {Array.from({ length: 16 }, (_, i) => {
          const a = ((i * 22.5 + wheelRot) * Math.PI) / 180;
          const gx = 560 + Math.cos(a) * 206, gy = 270 + Math.sin(a) * 206;
          return (
            <g key={i}>
              <line x1={gx} y1={gy - 4} x2={gx} y2={gy + 6} stroke={KRP.ink} strokeWidth={3} />
              <rect x={gx - 14} y={gy + 4} width={28} height={24} rx={8}
                fill={[KRP.red, KRP.yellow, KRP.blue, KRP.green][i % 4]} stroke={KRP.ink} strokeWidth={3} />
              <rect x={gx - 8} y={gy + 9} width={16} height={8} rx={2} fill={C.lampGlow} />
            </g>
          );
        })}
        {/* 真ん中の時計 (数字は描かない) */}
        <circle cx={560} cy={270} r={50} fill={C.ledWhite} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={560 + Math.cos(a) * 38} y1={270 + Math.sin(a) * 38} x2={560 + Math.cos(a) * 45} y2={270 + Math.sin(a) * 45} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <line x1={560} y1={270} x2={560 + Math.cos(((-90 + 195) * Math.PI) / 180) * 24} y2={270 + Math.sin(((-90 + 195) * Math.PI) / 180) * 24} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <line x1={560} y1={270} x2={560 + Math.cos(((-90 + 240 + f * 3) * Math.PI) / 180) * 36} y2={270 + Math.sin(((-90 + 240 + f * 3) * Math.PI) / 180) * 36} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <circle cx={560} cy={270} r={5} fill={KRP.ink} />
      </g>
      {/* 対岸の土地 */}
      <rect x={-40} y={528} width={1080} height={14} fill={C.hakoneNear} stroke={KRP.ink} strokeWidth={4} />
      {/* 赤レンガ倉庫 (横長の2棟) */}
      {[[330, 440, 250], [612, 452, 236]].map(([bx, by, bw], i) => (
        <g key={i}>
          <rect x={bx} y={by} width={bw} height={536 - by} fill={C.brick} stroke={KRP.ink} strokeWidth={5} />
          <rect x={bx - 6} y={by - 12} width={bw + 12} height={14} fill={C.slate} stroke={KRP.ink} strokeWidth={4} />
          <rect x={bx + bw / 2 - 22} y={by - 34} width={44} height={24} fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${bx + bw / 2 - 26} ${by - 34} L ${bx + bw / 2} ${by - 48} L ${bx + bw / 2 + 26} ${by - 34} Z`} fill={C.slate} stroke={KRP.ink} strokeWidth={3} />
          <line x1={bx} y1={by + 38} x2={bx + bw} y2={by + 38} stroke={C.brickDark} strokeWidth={4} />
          {Array.from({ length: Math.floor(bw / 34) }, (_, k) => (
            <g key={k}>
              <path d={`M ${bx + 14 + k * 34} ${by + 30} v -12 a 8 8 0 0 1 16 0 v 12 Z`} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
              <path d={`M ${bx + 14 + k * 34} ${by + 74} v -14 a 8 8 0 0 1 16 0 v 14 Z`} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={2.5} opacity={(k + i) % 3 === 0 ? 0.4 : 0.9} />
            </g>
          ))}
        </g>
      ))}
      {/* 港の広場 (石畳) と手すり */}
      <rect x={-40} y={652} width={2000} height={480} fill={C.plaza} />
      <g stroke={C.plazaLine} strokeWidth={4}>
        {[700, 770, 860, 970].map((yy) => <line key={yy} x1={-40} y1={yy} x2={1960} y2={yy} />)}
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={i * 200 - 40} y1={652} x2={(i * 200 - 40 - 960) * 1.6 + 960} y2={1100} />)}
      </g>
      <rect x={-40} y={648} width={2000} height={10} fill={C.plazaLine} stroke={KRP.ink} strokeWidth={4} />
      <line x1={-40} y1={606} x2={1960} y2={606} stroke={KRP.ink} strokeWidth={7} />
      <line x1={-40} y1={606} x2={1960} y2={606} stroke={KRP.silver} strokeWidth={3} />
      {Array.from({ length: 33 }, (_, i) => <line key={i} x1={i * 60} y1={606} x2={i * 60} y2={650} stroke={KRP.ink} strokeWidth={4} />)}
      {/* 中華街の門 (赤い柱と緑の屋根。字は描かない) */}
      <g>
        {[50, 372].map((px) => (
          <g key={px}>
            <rect x={px - 16} y={440} width={32} height={440} fill={C.chinaRed} stroke={KRP.ink} strokeWidth={5} />
            <rect x={px - 26} y={846} width={52} height={36} rx={4} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <rect x={20} y={474} width={382} height={26} fill={C.chinaRed} stroke={KRP.ink} strokeWidth={5} />
        <rect x={20} y={500} width={382} height={12} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        {/* 真ん中の額 (字は書かない・飾りの模様だけ) */}
        <rect x={160} y={430} width={102} height={48} rx={4} fill={C.chinaGreen} stroke={KRP.ink} strokeWidth={4} />
        <rect x={168} y={438} width={86} height={32} fill="none" stroke={C.gold} strokeWidth={3} />
        <circle cx={211} cy={454} r={7} fill={C.gold} />
        {/* 大屋根 (反りあがり) */}
        <path d="M -10 448 Q 40 438 60 412 L 362 412 Q 382 438 432 448 L 418 466 L 4 466 Z" fill={C.chinaGreen} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={40 + i * 28} y1={416} x2={34 + i * 29} y2={464} stroke={C.chinaGreenDark} strokeWidth={3} />)}
        <path d="M -10 448 q -14 -14 -4 -26" stroke={C.gold} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 432 448 q 14 -14 4 -26" stroke={C.gold} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* 上の小屋根 */}
        <rect x={150} y={392} width={122} height={22} fill={C.chinaRed} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 110 384 Q 140 380 154 358 L 268 358 Q 282 380 312 384 L 300 398 L 122 398 Z" fill={C.chinaGreen} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={211} cy={350} r={9} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        {/* ちょうちん (ゆれる) */}
        {[110, 312].map((lx, i) => (
          <g key={lx} transform={`rotate(${Math.sin(f / 9 + i) * 6} ${lx} 512)`}>
            <line x1={lx} y1={512} x2={lx} y2={530} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={lx} cy={556} rx={22} ry={28} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <rect x={lx - 12} y={526} width={24} height={6} fill={C.gold} stroke={KRP.ink} strokeWidth={2} />
            <rect x={lx - 12} y={580} width={24} height={6} fill={C.gold} stroke={KRP.ink} strokeWidth={2} />
            <ellipse cx={lx} cy={556} rx={30} ry={34} fill={C.lampGlow} opacity={0.18 + 0.08 * Math.sin(f / 4 + i)} />
          </g>
        ))}
      </g>
      {/* 鎌倉の大仏 (正面・おだやか・目を閉じて座る) */}
      <g>
        <path d="M 66 884 Q 76 846 120 838 L 300 838 Q 346 846 356 884 Z" fill={C.buddhaDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 体 (衣) */}
        <path d="M 150 690 Q 112 702 104 740 Q 92 800 82 846 Q 211 872 340 846 Q 330 800 318 740 Q 310 702 272 690 Z"
          fill={C.buddha} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 150 692 Q 196 744 214 800 M 272 692 Q 254 730 250 780" stroke={C.buddhaDark} strokeWidth={4} fill="none" />
        <path d="M 96 820 Q 211 800 326 820" stroke={C.buddhaDark} strokeWidth={4} fill="none" />
        {/* ひざの上で組んだ手 */}
        <path d="M 150 818 Q 150 794 182 794 Q 211 800 240 794 Q 272 794 272 818 Q 211 840 150 818 Z" fill={C.buddhaLight} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 166 814 Q 182 804 200 812 M 222 812 Q 240 804 256 814" stroke={C.buddhaDark} strokeWidth={3} fill="none" />
        <path d="M 196 800 Q 211 780 226 800" stroke={KRP.ink} strokeWidth={4} fill={C.buddhaLight} />
        {/* 首と頭 */}
        <rect x={192} y={670} width={38} height={26} fill={C.buddha} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 154 640 q -16 4 -14 30 q 2 22 16 26" fill={C.buddha} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 268 640 q 16 4 14 30 q -2 22 -16 26" fill={C.buddha} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={211} cy={640} rx={56} ry={58} fill={C.buddha} stroke={KRP.ink} strokeWidth={6} />
        {/* 頭の粒々 (螺髪) と盛り上がり */}
        <ellipse cx={211} cy={586} rx={30} ry={18} fill={C.buddhaDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 157 628 Q 160 584 211 580 Q 262 584 265 628 Q 211 610 157 628 Z" fill={C.buddhaDark} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={170 + (i % 6) * 16 + (i >= 6 ? 8 : 0)} cy={i >= 6 ? 616 : 600} r={4} fill={C.buddhaLight} />)}
        <circle cx={211} cy={630} r={3.5} fill={C.buddhaLight} stroke={KRP.ink} strokeWidth={1.5} />
        <path d="M 182 644 q 10 6 20 0 M 220 644 q 10 6 20 0" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 211 648 l -4 16 l 8 0" stroke={C.buddhaDark} strokeWidth={3} fill="none" />
        <path d="M 200 676 q 11 6 22 0" stroke={KRP.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {/* 夕日の照り */}
        <path d="M 172 612 q 6 -14 18 -18" stroke={C.duskGlow} strokeWidth={4} fill="none" opacity={0.5 + 0.3 * Math.sin(f / 8)} strokeLinecap="round" />
      </g>
      {/* カモメ (空を横切る) と、大仏の頭にとまるカモメ */}
      {[0, 1, 2].map((i) => (
        <HmFcGull key={i} x={((rnd(321, i) * 1900 + f * (3 + i)) % 2000) - 40} y={110 + i * 46 + Math.sin(f / 7 + i) * 8}
          s={0.9 + i * 0.15} flap={Math.sin(f / 3 + i * 2)} />
      ))}
      {gl < 1
        ? <HmFcGull x={glX} y={glY} s={1.0} flap={Math.sin(f / 2.5)} />
        : <HmFcGull x={214} y={572} s={0.9} flap={0} perched />}
    </g>
  );
};

// -------------------------------------------------------------------
// #136 神奈川県は1時間40分で、全国1位です。おつかれさまです。
// 格: 山 / seed 5136
// 絵: どこ: 神奈川の駅のホーム (夜・帰り)。地名札「神奈川」。演出: 表彰台の1位に、くたびれた会社員 (ネクタイがゆるんでいる) が立ち、首に「1時間40分」のメダルをかけられる。駅員がそっと湯のみのお茶を差し出す (おつかれさま)。会社員は苦笑い。動き: メダルがかけられる / お茶の湯気 / 苦笑い
// どこ: (第1回修正) 神奈川の名所の詰め合わせ (夕焼け〜夜・ライトアップ)。ランドマークタワー・ベイブリッジ・大観覧車・赤レンガ倉庫・中華街の門・鎌倉の大仏・江の島とシーキャンドル・箱根と富士山。地名札「神奈川」
// 演出: ホームに表彰台。1位の台に、ネクタイのゆるんだくたびれた会社員。首に「1時間40分」の金メダルがかかる。頭をかいて苦笑い。駅員が湯のみのお茶をそっと差し出す。紙吹雪
// 動き: メダルが降りてきてかかる (f4-22) / 駅員が近づいてお茶 (f20-34) / 湯気 / 紙吹雪 / 苦笑い (f22〜) / 観覧車が回る・カモメ・灯台の光・サーチライト・大仏の頭にカモメがとまる (f10-38)
const Hm136: React.FC<{ f: number }> = ({ f }) => {
  const medal = easeOut(seg(f, 4, 22));
  const landed = medal >= 1;
  const staffX = lerp(1800, 1690, easeOut(seg(f, 20, 34)));
  const cam = lerp(1.04, 1.0, easeInOut(seg(f, 0, 42)));
  const mY = lerp(-460, 0, medal);
  return (
    <Frame f={f} seed={5136} dark bg={C.duskTop}>
      <g transform={`translate(960 520) scale(${cam}) translate(-960 -520)`}>
        {/* 背景: 神奈川の名所の詰め合わせ (夕焼け〜夜) */}
        <HmFcKanagawaBg f={f} />
        {/* 表彰台 */}
        {[[420, 760, 690, "2", C.silverMedal], [1160, 1500, 730, "3", C.bronzeMedal], [760, 1160, 600, "1", C.gold]].map(([x1, x2, top, n, col]) => (
          <g key={n as string}>
            <rect x={x1 as number} y={top as number} width={(x2 as number) - (x1 as number)} height={920 - (top as number)} fill={C.podium} stroke={KRP.ink} strokeWidth={7} />
            <rect x={x1 as number} y={top as number} width={(x2 as number) - (x1 as number)} height={22} fill={col as string} stroke={KRP.ink} strokeWidth={5} />
            <text x={((x1 as number) + (x2 as number)) / 2} y={(top as number) + 140} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={n === "1" ? 120 : 90} fill={col as string} stroke={KRP.ink} strokeWidth={4}>{n}</text>
          </g>
        ))}
        {/* 2位と3位の台には、置き忘れの傘とかばんだけ */}
        <path d="M 560 690 L 600 600 L 650 540 L 632 600 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 560 690 L 640 520" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M 640 520 q 14 -18 26 -2" stroke={KRP.ink} strokeWidth={6} fill="none" />
        <rect x={1290} y={680} width={90} height={52} rx={8} fill="#6B4A36" stroke={KRP.ink} strokeWidth={4} />
        {/* 会社員 (1位) */}
        <HmFcFolk x={960} y={600} s={1.25} f={f} phase={2} pose={landed ? "raise" : "stand"} face={landed ? "smile" : "worried"}
          gaze={landed ? [-3, 2] : [0, -6]} lean={landed ? -3 : 2} cloth={C.suit} clothDark={C.suitDark}
          back={null}>
          {/* ぼさぼさの髪 */}
          <path d="M -30 -292 l -8 -26 M 0 -294 l 4 -30 M 30 -290 l 12 -22" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          {/* くま */}
          <path d="M -36 -200 q 12 6 24 0 M 12 -200 q 12 6 24 0" stroke={KRP.grayDark} strokeWidth={3.5} fill="none" />
          {/* 汗 */}
          {landed && <path d={`M 72 ${-250 + Math.sin(f / 5) * 3} q -10 16 0 22 q 10 -6 0 -22 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={2.5} />}
          {/* えりとゆるんだネクタイ */}
          <path d="M -28 -160 L 0 -134 L 28 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <g transform="rotate(16 0 -138)">
            <path d="M -8 -142 L 8 -142 L 10 -128 L -10 -128 Z" fill={C.tie} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -8 -128 L 8 -128 L 14 -78 L 0 -66 L -14 -78 Z" fill={C.tie} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* かばん (左手) */}
          <rect x={-110} y={-70} width={86} height={60} rx={8} fill="#4A3A2E" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -88 -70 q 21 -18 42 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
        </HmFcFolk>
        {/* メダル (上から降りてきて首にかかる) */}
        <g transform={`translate(0 ${mY})`}>
          <path d={`M 920 400 L 960 ${462} L 1000 400`} stroke={KRP.red} strokeWidth={16} fill="none" strokeLinejoin="round" />
          <path d={`M 920 400 L 960 ${462} L 1000 400`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinejoin="round" opacity={0.6} />
          <g transform={`translate(0 -14) rotate(${landed ? Math.sin(f / 6) * 4 : 0} 960 450)`}>
            <circle cx={960} cy={540} r={74} fill={C.gold} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={960} cy={540} r={60} fill="none" stroke={C.goldDark} strokeWidth={4} />
            <text x={960} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>1時間</text>
            <text x={960} y={570} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>40分</text>
            <path d="M 910 500 q 10 -20 30 -24" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.7} />
          </g>
        </g>
        {landed && seg(f, 22, 32) < 1 && [0, 1, 2, 3, 4, 5].map((j) => {
          const a = (j * 60) * Math.PI / 180, r = 100 + 60 * seg(f, 22, 32);
          return <path key={j} d={`M ${960 + Math.cos(a) * r} ${540 + Math.sin(a) * r} l 8 -16 l 8 16 l -8 16 Z`} fill={HP.spark} stroke={KRP.ink} strokeWidth={2} opacity={1 - seg(f, 22, 32)} />;
        })}
        {/* 駅員: 湯のみのお茶をそっと */}
        <HmFcFolk x={staffX} y={900} s={1.05} f={f} phase={5} pose="point" pointDir={-1} face="smile" gaze={[-6, -3]} lean={-4}
          cloth={C.navy} clothDark={C.navyDark}>
          <HmFcCap />
          <rect x={18} y={-138} width={30} height={20} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {/* おぼんと湯のみ (手の上) */}
          <ellipse cx={-160} cy={-158} rx={56} ry={12} fill="#8A5A34" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -184 -210 L -180 -164 Q -160 -156 -140 -164 L -136 -210 Z" fill={C.yunomi} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-160} cy={-210} rx={24} ry={7} fill={C.tea} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${-172 + k * 12} -222 q 10 -18 0 -34 q -10 -18 0 -36`} stroke={KRP.white} strokeWidth={4} fill="none"
              opacity={0.7} transform={`translate(0 ${-((f * 1.2 + k * 11) % 26)})`} />
          ))}
        </HmFcFolk>
        {/* 紙吹雪 */}
        {Array.from({ length: 22 }, (_, i) => {
          const px = 560 + rnd(9, i) * 800 + Math.sin(f / 8 + i) * 20;
          const py = ((rnd(19, i) * 600 + f * (5 + rnd(4, i) * 3)) % 700) - 40;
          return <rect key={i} x={px} y={py} width={14} height={8} fill={[KRP.red, KRP.yellow, KRP.blue, KRP.green, KRP.white][i % 5]}
            transform={`rotate(${f * 8 + i * 30} ${px} ${py})`} opacity={seg(f, 18, 24)} />;
        })}
      </g>
      {/* 地名札 (駅名標ふう) */}
      <g>
        <line x1={150} y1={20} x2={150} y2={166} stroke={KRP.ink} strokeWidth={5} />
        <line x1={330} y1={20} x2={330} y2={166} stroke={KRP.ink} strokeWidth={5} />
        <TagPlate x={240} y={215} text="神奈川" size={58} t={seg(f, 0, 8)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #137 暇のものさしに、3つ目の目盛り、「分」が刻まれました。
// 格: 山 / seed 5137
// 絵: どこ: 前半と同じ作業机 (木の天板・工具・メモ・虫めがね)。演出: Monosashi の lit が f で 2→3。「日」と「時間」はすでに塗られている。のみが「分」の区画を刻み、刻み終わると札が青緑に。区画の上に小さな駅の時計と黄色い本がぽんと乗る。捜索係が汗をふく。動き: f0-34 刻む / 札が塗られる / 小物がぽん
// どこ: 前半と同じ作業机 (Sagyozukue)。天板の真ん中に暇のものさし
// 演出: 「日」「時間」は塗り済み。のみが「分」の区画を左から刻み、刻み終わると札が青緑に。区画の上に小さな駅の時計と黄色い本がぽん。捜索係は虫めがねで見守り、終わると虫めがねを置いて汗をふく
// 動き: f2-34 刻む (木くずが散る) / 札が塗られる (f34) / 小物がぽん (f35-42) / 捜索係が汗をふく (f34〜) / カメラが「分」へ寄る
const Hm137: React.FC<{ f: number }> = ({ f }) => {
  const lit = 2 + easeInOut(seg(f, 2, 34));
  const done = lit >= 3;
  const [sx, sy] = monoSlot(2, 960, 560, 1);
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 40));
  const chips = Math.floor(seg(f, 2, 34) * 14);
  const chiselX = 960 - 525 + 350 * 2 - 175 + 20 + 310 * clamp01(lit - 2);
  const clockT = seg(f, 35, 40), bookT = seg(f, 37, 42);
  return (
    <Frame f={f} seed={5137}>
      <g transform={`translate(${sx} 560) scale(${cam}) translate(${-sx} -560)`}>
        <Sagyozukue f={f} />
        <Monosashi x={960} y={560} s={1} lit={lit} f={f} focus={done ? 2 : undefined} />
        {/* 木くず */}
        {Array.from({ length: chips }, (_, i) => {
          const cx = 1135 - 150 + i * 22 + rnd(5137, i) * 20;
          const cy = 760 + rnd(11, i) * 40;
          return <path key={i} d={`M ${cx} ${cy} q 10 -10 20 0 q -10 6 -20 0 Z`} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={2}
            transform={`rotate(${rnd(3, i) * 180} ${cx + 10} ${cy})`} />;
        })}
        {!done && f > 2 && [0, 1, 2].map((j) => {
          const u = ((f * 2 + j * 9) % 18) / 18;
          return <path key={j} d={`M ${chiselX + 10 + u * 50} ${480 - u * 40 + j * 8} q 8 -8 16 0 q -8 5 -16 0 Z`} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={2} opacity={1 - u} />;
        })}
        {done && seg(f, 34, 40) < 1 && (
          <g opacity={1 - seg(f, 34, 40)}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => {
              const a = (j * 45) * Math.PI / 180, r = 200 + 60 * seg(f, 34, 40);
              return <path key={j} d={`M ${sx + Math.cos(a) * r} ${560 + Math.sin(a) * r * 0.5} l 10 -18 l 10 18 l -10 18 Z`} fill={HP.spark} stroke={KRP.ink} strokeWidth={2.5} />;
            })}
          </g>
        )}
        {/* 区画の上の小物: 小さな駅の時計 */}
        {clockT > 0 && (
          <g transform={`translate(${sx - 70} ${sy}) scale(${pop(clockT)})`}>
            <rect x={-6} y={-60} width={12} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={0} cy={0} rx={30} ry={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={0} cy={-96} r={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-130} x2={0} y2={-124} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i * 30} 0 -96)`} />)}
            <line x1={0} y1={-96} x2={0} y2={-124} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform="rotate(40 0 -96)" />
            <line x1={0} y1={-96} x2={0} y2={-116} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(-80 0 -96)" />
            <line x1={0} y1={-90} x2={0} y2={-128} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6} 0 -96)`} />
          </g>
        )}
        {/* 黄色い本 */}
        {bookT > 0 && (
          <g transform={`translate(${sx + 70} ${sy}) scale(${pop(bookT)}) rotate(-8)`}>
            <rect x={-40} y={-104} width={80} height={104} rx={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-40} y={-104} width={14} height={104} fill="#D9B23C" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-16} y={-84} width={46} height={30} fill={KRP.white} opacity={0.6} />
            <path d="M 40 -98 L 46 -92 L 46 4 L 40 0" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {/* 捜索係 */}
        {!done ? (
          <Sousa x={1380} y={900} s={0.62} f={f} face="surprised" lean={-4} lensAt={[chiselX + 40, 520]} />
        ) : (
          <g>
            {/* 置いた虫めがね */}
            <g transform="translate(1560 820) rotate(-20)">
              <rect x={30} y={-10} width={110} height={22} rx={10} fill="#6E4526" stroke={KRP.ink} strokeWidth={4} />
              <circle r={42} fill={HP.screenCore} opacity={0.5} />
              <circle r={42} fill="none" stroke={HP.brass} strokeWidth={10} />
              <circle r={42} fill="none" stroke={KRP.ink} strokeWidth={3} />
            </g>
            <Sousa x={1380} y={900} s={0.62} f={f} face="joy" pose="raise" lens={false} lean={-6} />
            {/* ハンカチで汗をふく (上げた手から額へ) */}
            <g transform={`translate(1380 ${900 + bobOf(f, 3)}) scale(0.62) rotate(-6)`}>
              <path d={`M 60 -312 Q 30 ${-286 + Math.sin(f / 3) * 6} 4 -270 L 30 -256 Q 54 -280 80 -300 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1].map((k) => {
                const u = ((f * 2 + k * 10) % 20) / 20;
                return <path key={k} d={`M ${-80 - u * 40} ${-250 - u * 30 + k * 30} q -8 12 0 18 q 8 -6 0 -18 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={2.5} opacity={1 - u} />;
              })}
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_128: (f) => <Hm128 f={f} />,
  hm_129: (f) => <Hm129 f={f} />,
  hm_130: (f) => <Hm130 f={f} />,
  hm_131: (f) => <Hm131 f={f} />,
  hm_132: (f) => <Hm132 f={f} />,
  hm_133: (f) => <Hm133 f={f} />,
  hm_134: (f) => <Hm134 f={f} />,
  hm_135: (f) => <Hm135 f={f} />,
  hm_136: (f) => <Hm136 f={f} />,
  hm_137: (f) => <Hm137 f={f} />,
};

export const HM_FC_MOTIFS: string[] = [
  "hm_128", // #128
  "hm_129", // #129
  "hm_130", // #130
  "hm_131", // #131
  "hm_132", // #132
  "hm_133", // #133
  "hm_134", // #134
  "hm_135", // #135
  "hm_136", // #136
  "hm_137", // #137
];

export const himaFcScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
