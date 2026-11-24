// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#78〜#85 (8文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 実在の人物と映画の人物は顔を見せない (後ろ姿・シルエット)

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./NamaeShared";
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 朝の空・山
  skyMorningTop: "#BFD8E6", skyMorningLow: "#F6E2C0", sun: "#F7C65A", sunCore: "#FFF0C2",
  mtFar: "#B4C6D6", mtNear: "#8EA6BE", mist: "#FBF6EA",
  // 都の建物
  shu: "#C8442F", shuDark: "#9A3122",
  tile: "#5E6670", tileDark: "#434A53", tileLight: "#7C8590",
  wall: "#F4EEDF", wallShade: "#E2D9C3",
  stone: "#CFC6B4", stoneDark: "#AFA591",
  lattice: "#5E8C6A", gold: "#D9B23C", goldDark: "#A8862A",
  doorway: "#3A2E2A", through: "#FBE7B8",
  // 柳・道
  willow: "#8DB36A", willowDark: "#5F8A45", trunk: "#6B5038",
  road: "#DCCBA4", roadDark: "#C4B088",
  // 机・木簡
  desk: "#8A5A3A", deskDark: "#64402A", deskLight: "#A06C48",
  mokkan: "#E6CFA0", mokkanDark: "#C9AE78", mokkanGrain: "#D2B784",
  shuInk: "#D9503F", sumiPool: "#1C1818", felt: "#3E5A4A",
  // 中庭
  gravel: "#ECE7DA", gravelDot: "#CFC7B4", gravelLine: "#D9D2C0",
  skyDay: "#CFE3EE", skyDayLow: "#F1EBD6",
  bannerGreen: "#5E8C6A",
  // 人
  princess: "#B5577A", princessDark: "#8E3F5D", skirt: "#6E8F9E", skirtStripe: "#4E6E7E", hire: "#FBF8F0",
  hair: "#1F1B1A", skin: "#F2D2B6", sash: "#E9D3A6",
  official: "#8C3B2E", officialDark: "#6E2C22",
  worker1: "#A8B88A", worker1Dark: "#7E8E64", worker2: "#C98E6E", worker2Dark: "#9E6A4E", scarf: "#F3EEE2",
  servant: "#9A8B6E", servantDark: "#76694F",
  spear: "#7A5A3E", blade: "#C9CFD4",
  // 夕方
  duskTop: "#6E4E78", duskMid: "#E58A5E", duskLow: "#F6C88A", duskHill: "#7A5A78",
  duskGround: "#B88A62", duskRoad: "#CFA27A", shadowLong: "#4A3238",
  shuDusk: "#8E3A2C", wallDusk: "#C9AE96", tileDusk: "#3E3A44", tileDuskDark: "#2C2932", stoneDusk: "#9C8676",
  // 暗い部屋
  room: "#2E262A", roomWall: "#3E3236", roomFloor: "#4A3A30", roomFloorLine: "#35281F",
  pillarDim: "#5E2A22", misu: "#A88E5A", misuDark: "#7E6A40", misuBand: "#4E3E5E", tassel: "#B03A3A",
  jar: "#2A2528", jarHi: "#6A6168", jarIn: "#0E0B0C",
  lacquer: "#2E1E1A", lacquerRed: "#7A2A20", flame: "#FFB347", shadowSil: "#1A1416",
  // 明るくなった部屋
  room2Wall: "#8A7462", room2Floor: "#9A7856", room2Line: "#7A5C40", skyWindow: "#EAF3F6",
  // 厨
  mud: "#C9A57E", mudDark: "#A9865F", earthFloor: "#9C8060", beam: "#6B4A30",
  clay: "#B98E66", clayDark: "#8E6A48", pot: "#4A4440", potHi: "#6E6662", fire: "#F08A3A", fireCore: "#FFD36B",
  eggplant: "#5B3E7A", daikon: "#F4F1E6", leaf: "#6FA85A", taro: "#9C7A56",
  basket: "#C9A15E", basketDark: "#9C7A3E", board: "#E3C79A",
  // 屋敷
  pine: "#4F7A4A", pineDark: "#36583A", plainWood: "#7A5A3E", plainWoodDark: "#5A3E28", stud: "#3B332C",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void QMark; void XMark; void Arrow;
void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend;
void clamp01;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const ink = KRP.ink;

// 瓦屋根 (寄棟風)。x=中心, y=軒の線, w=軒の幅, h=棟までの高さ
const ND1Roof: React.FC<{
  x: number; y: number; w: number; h: number; ridge?: number; shibi?: boolean; dusk?: boolean;
}> = ({ x, y, w, h, ridge = 0.6, shibi = false, dusk = false }) => {
  const hw = w / 2;
  const rw = hw * ridge;
  const tile = dusk ? C.tileDusk : C.tile;
  const dark = dusk ? C.tileDuskDark : C.tileDark;
  const n = Math.max(6, Math.round(w / 34));
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-hw} -16 Q ${-hw * 0.86} 8 ${-hw * 0.62} 8 L ${hw * 0.62} 8 Q ${hw * 0.86} 8 ${hw} -16 L ${rw} ${-h} L ${-rw} ${-h} Z`}
        fill={tile} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
      <g stroke={dark} strokeWidth={3.5} opacity={0.75}>
        {Array.from({ length: n - 1 }, (_, i) => {
          const u = (i + 1) / n;
          return <line key={i} x1={lerp(-hw * 0.78, hw * 0.78, u)} y1={4} x2={lerp(-rw, rw, u)} y2={-h + 6} />;
        })}
      </g>
      {/* 軒先の瓦の列 */}
      <path d={`M ${-hw * 0.9} -6 Q ${-hw * 0.8} 10 ${-hw * 0.6} 10 L ${hw * 0.6} 10 Q ${hw * 0.8} 10 ${hw * 0.9} -6`}
        fill="none" stroke={dusk ? "#5A5560" : C.tileLight} strokeWidth={7} />
      {/* 棟 */}
      <rect x={-rw - 12} y={-h - 14} width={rw * 2 + 24} height={18} rx={5} fill={dark} stroke={ink} strokeWidth={4.5} />
      {shibi && [-1, 1].map((sd) => (
        <path key={sd} transform={`translate(${sd * (rw + 6)} ${-h - 10}) scale(${sd} 1)`}
          d="M -8 0 Q -12 -34 10 -58 Q 20 -40 14 -24 Q 10 -10 12 0 Z"
          fill={dusk ? "#8E7A3A" : C.gold} stroke={ink} strokeWidth={4} />
      ))}
    </g>
  );
};

// 二重の門 (朱雀門・羅城門)。x,y=基壇の下の中心。open 0→1 で中央3間の扉が開く
const ND1Gate: React.FC<{ x: number; y: number; s?: number; dusk?: boolean; open?: number; through?: string }> = ({
  x, y, s = 1, dusk = false, open = 1, through = C.through,
}) => {
  const shu = dusk ? C.shuDusk : C.shu;
  const wall = dusk ? C.wallDusk : C.wall;
  const pillars = [-270, -162, -54, 54, 162, 270];
  const bays = [-216, -108, 0, 108, 216];
  const o = clamp01(open);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 基壇 */}
      <rect x={-330} y={-34} width={660} height={34} fill={dusk ? C.stoneDusk : C.stone} stroke={ink} strokeWidth={5} />
      <g stroke={dusk ? "#7E6A5C" : C.stoneDark} strokeWidth={3}>
        {[-250, -150, -50, 50, 150, 250].map((sx) => <line key={sx} x1={sx} y1={-32} x2={sx} y2={-2} />)}
        <line x1={-328} y1={-17} x2={328} y2={-17} />
      </g>
      {/* 柱間 */}
      {bays.map((bx, i) => {
        const outer = i === 0 || i === 4;
        if (outer) {
          return (
            <g key={bx}>
              <rect x={bx - 48} y={-206} width={96} height={172} fill={wall} stroke={ink} strokeWidth={4} />
              <rect x={bx - 34} y={-176} width={68} height={58} fill={dusk ? "#3E4A40" : C.lattice} stroke={ink} strokeWidth={4} />
              <g stroke={ink} strokeWidth={3}>
                {[-22, -10, 2, 14, 26].map((lx) => <line key={lx} x1={bx + lx - 2} y1={-176} x2={bx + lx - 2} y2={-118} />)}
              </g>
            </g>
          );
        }
        const leaf = 43 * (1 - o * 0.82);
        return (
          <g key={bx}>
            <rect x={bx - 44} y={-206} width={88} height={172} fill={C.doorway} stroke={ink} strokeWidth={4} />
            {/* 扉の向こう (光) */}
            <rect x={bx - 40} y={-200} width={80} height={166} fill={through} opacity={0.25 + 0.75 * o} />
            <path d={`M ${bx - 40} -60 L ${bx + 40} -60`} stroke={dusk ? "#E9B07A" : "#E9D3A6"} strokeWidth={3} opacity={o} />
            {/* 扉板 (開くと細くなる) */}
            {[-1, 1].map((sd) => {
              const ex = bx + sd * 44;
              const ix = ex - sd * leaf;
              return (
                <g key={sd}>
                  <path d={`M ${ex} -206 L ${ix} ${-206 + o * 8} L ${ix} ${-34 - o * 8} L ${ex} -34 Z`}
                    fill={shu} stroke={ink} strokeWidth={4} />
                  {[0, 1, 2].map((k) => (
                    <circle key={k} cx={lerp(ex, ix, 0.5)} cy={-170 + k * 50} r={4} fill={C.gold} stroke={ink} strokeWidth={2} />
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}
      {/* 柱 */}
      {pillars.map((px) => <rect key={px} x={px - 11} y={-212} width={22} height={178} fill={shu} stroke={ink} strokeWidth={4} />)}
      {/* 頭貫と組物 */}
      <rect x={-300} y={-228} width={600} height={18} fill={shu} stroke={ink} strokeWidth={4} />
      {pillars.map((px) => (
        <g key={px}>
          <rect x={px - 20} y={-244} width={40} height={16} fill={dusk ? "#6E7A5E" : "#8FB08A"} stroke={ink} strokeWidth={3} />
          <rect x={px - 12} y={-256} width={24} height={12} fill={shu} stroke={ink} strokeWidth={3} />
        </g>
      ))}
      <ND1Roof x={0} y={-252} w={790} h={62} ridge={0.74} dusk={dusk} />
      {/* 上層 */}
      <rect x={-220} y={-390} width={440} height={82} fill={wall} stroke={ink} strokeWidth={4} />
      {[-150, -50, 50, 150].map((wx) => (
        <g key={wx}>
          <rect x={wx - 30} y={-376} width={60} height={46} fill={dusk ? "#3E4A40" : C.lattice} stroke={ink} strokeWidth={3.5} />
          {[-15, 0, 15].map((lx) => <line key={lx} x1={wx + lx} y1={-376} x2={wx + lx} y2={-330} stroke={ink} strokeWidth={3} />)}
        </g>
      ))}
      {[-220, -100, 0, 100, 220].map((px) => <rect key={px} x={px - 9} y={-394} width={18} height={88} fill={shu} stroke={ink} strokeWidth={3.5} />)}
      {/* 高欄 */}
      <rect x={-250} y={-322} width={500} height={10} fill={shu} stroke={ink} strokeWidth={3} />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x={-246 + i * 48} y={-322} width={8} height={18} fill={shu} stroke={ink} strokeWidth={2} />)}
      <ND1Roof x={0} y={-394} w={830} h={124} ridge={0.52} shibi dusk={dusk} />
    </g>
  );
};

// 柳の木。x,y=根元
const ND1Willow: React.FC<{ x: number; y: number; s?: number; f: number; ph?: number }> = ({ x, y, s = 1, f, ph = 0 }) => {
  const sway = Math.sin((f + ph * 13) / 16) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={60} ry={10} fill={ink} opacity={0.12} />
      <path d="M -10 0 Q -16 -110 -4 -230 L 8 -230 Q 4 -110 12 0 Z" fill={C.trunk} stroke={ink} strokeWidth={5} />
      <path d="M 0 -200 Q -40 -250 -80 -262 M 2 -210 Q 40 -260 86 -266" stroke={C.trunk} strokeWidth={9} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-262} rx={110} ry={46} fill={C.willow} stroke={ink} strokeWidth={4.5} />
      {Array.from({ length: 13 }, (_, i) => {
        const sx = -104 + i * 17.3;
        const sy = -262 + Math.abs(sx) * 0.16;
        const len = 150 + rnd(ph + 3, i) * 70;
        const w2 = sway * (0.6 + rnd(ph, i) * 0.6);
        return (
          <g key={i}>
            <path d={`M ${sx} ${sy} Q ${sx * 1.15 + w2 * 0.4} ${sy + len * 0.5} ${sx * 1.2 + w2} ${sy + len}`}
              stroke={ink} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d={`M ${sx} ${sy} Q ${sx * 1.15 + w2 * 0.4} ${sy + len * 0.5} ${sx * 1.2 + w2} ${sy + len}`}
              stroke={i % 3 ? C.willow : C.willowDark} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

// 皇女の後ろ姿 (Person を土台に、後頭部・結い上げ髪・縦じまの裙・白い領巾を重ねる。顔は描かない)
//   hire: 領巾を肩にかけているか / wind: 0〜1 領巾が右へなびく強さ / dy: 肩のびくり / walk: 歩く
const ND1Princess: React.FC<{
  x: number; y: number; s?: number; f: number; hire?: boolean; wind?: number; dy?: number; walk?: boolean; orn?: boolean;
}> = ({ x, y, s = 1, f, hire = true, wind = 0, dy = 0, walk = false, orn = true }) => {
  const bob = walk ? -Math.abs(Math.sin(f / 4)) * 6 : Math.sin(f / 13) * 2.5;
  const step = walk ? Math.sin(f / 4) * 6 : 0;
  const wv = Math.sin(f / 6) * 7 * (0.4 + wind);
  const w = clamp01(wind);
  const left = `M -64 -150 Q ${-100 + w * 30} -96 ${-86 + w * 90 + wv * 0.5} ${-18 - w * 50}`;
  const right = `M 64 -150 C ${112 + w * 40} -118 ${96 + w * 100} ${-40 - w * 10} ${104 + w * 170 + wv} ${-40 - w * 90 + wv}`;
  const back = "M -66 -152 Q 0 -110 66 -152";
  return (
    <g transform={`translate(${x} ${y + bob + dy}) scale(${s})`}>
      <ellipse cx={0} cy={-2} rx={84} ry={14} fill={ink} opacity={0.14} />
      <Person x={0} y={0} s={1} cloth={C.princess} clothDark={C.skirt} hair="cap" f={f} still />
      {/* 裙 (縦じま) */}
      <path d={`M -62 -84 L 62 -84 L ${80 + step} -2 L ${-80 + step} -2 Z`} fill={C.skirt} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
      <g stroke={C.skirtStripe} strokeWidth={6}>
        {[-48, -30, -12, 6, 24, 42].map((sx) => <line key={sx} x1={sx + 3} y1={-82} x2={sx * 1.28 + 4 + step} y2={-6} />)}
      </g>
      {/* 裾から少し見える沓 */}
      <ellipse cx={-24 + step} cy={0} rx={16} ry={7} fill={C.princessDark} stroke={ink} strokeWidth={3} />
      <ellipse cx={24 - step} cy={0} rx={16} ry={7} fill={C.princessDark} stroke={ink} strokeWidth={3} />
      {/* 帯 */}
      <rect x={-60} y={-96} width={120} height={16} rx={5} fill={C.sash} stroke={ink} strokeWidth={4} />
      <path d={`M 10 -82 Q ${16 + wv * 0.3} -50 ${12 + wv * 0.5} -24`} stroke={C.sash} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* 背中の縫い目 (後ろ向きの記号) */}
      <line x1={0} y1={-156} x2={0} y2={-98} stroke={C.princessDark} strokeWidth={4} />
      {/* 耳・後頭部 */}
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 63} cy={-220} rx={10} ry={15} fill={C.skin} stroke={ink} strokeWidth={4} />)}
      <circle cx={0} cy={-228} r={66} fill={C.hair} stroke={ink} strokeWidth={5.5} />
      <path d="M -40 -262 Q 0 -284 40 -262" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.22} />
      {/* うなじの生え際 */}
      <path d="M -30 -170 Q -16 -160 0 -166 Q 16 -160 30 -170" stroke={ink} strokeWidth={4} fill="none" />
      {/* 結い上げた髪 (二つの輪) */}
      <ellipse cx={-26} cy={-300} rx={26} ry={20} fill={C.hair} stroke={ink} strokeWidth={4.5} transform="rotate(-18 -26 -300)" />
      <ellipse cx={26} cy={-300} rx={26} ry={20} fill={C.hair} stroke={ink} strokeWidth={4.5} transform="rotate(18 26 -300)" />
      <ellipse cx={-26} cy={-300} rx={10} ry={7} fill={C.skin} opacity={0.0} />
      <rect x={-10} y={-292} width={20} height={14} rx={4} fill={C.princess} stroke={ink} strokeWidth={3} />
      {orn && (
        <g>
          <path d="M -52 -282 L -78 -296" stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
          <circle cx={-80} cy={-297} r={7} fill={C.gold} stroke={ink} strokeWidth={3} />
        </g>
      )}
      {/* 領巾 (白い薄布) */}
      {hire && (
        <g strokeLinecap="round" fill="none">
          {[back, left, right].map((d, i) => (
            <g key={i}>
              <path d={d} stroke={ink} strokeWidth={24} />
              <path d={d} stroke={C.hire} strokeWidth={17} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// 奈良の役人・兵 (Person + 黒い冠)。顔は描いてよい一般の人
const ND1Kan: React.FC<{
  x: number; y: number; s?: number; f: number; ph?: number;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";
  pointDir?: 1 | -1; gaze?: [number, number]; lean?: number; cloth?: string; clothDark?: string; spear?: boolean;
}> = ({ x, y, s = 1, f, ph = 0, face = "normal", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0,
  cloth = C.official, clothDark = C.officialDark, spear = false }) => {
  const bob = Math.sin((f + ph * 17) / 13) * 3;
  return (
    <g transform={`translate(0 ${bob})`}>
      {spear && (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          <line x1={74} y1={-2} x2={74} y2={-400} stroke={ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={74} y1={-2} x2={74} y2={-400} stroke={C.spear} strokeWidth={8} strokeLinecap="round" />
          <path d="M 74 -470 L 88 -404 L 60 -404 Z" fill={C.blade} stroke={ink} strokeWidth={4} />
          <rect x={64} y={-408} width={20} height={10} fill={C.shu} stroke={ink} strokeWidth={3} />
        </g>
      )}
      <Person x={x} y={y} s={s} cloth={cloth} clothDark={clothDark} f={f} phase={ph} face={face} pose={pose}
        pointDir={pointDir} gaze={gaze} lean={lean} still />
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
        <path d="M -63 -246 Q -66 -300 0 -302 Q 66 -300 63 -246 Q 30 -262 0 -262 Q -30 -262 -63 -246 Z" fill={C.hair} stroke={ink} strokeWidth={4} />
        <rect x={-22} y={-338} width={44} height={46} rx={16} fill={C.hair} stroke={ink} strokeWidth={4} />
        <path d="M 16 -330 Q 76 -362 94 -296" stroke={C.hair} strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d="M -60 -262 Q 0 -278 60 -262" stroke="#55505A" strokeWidth={4} fill="none" />
        {spear && <circle cx={67} cy={-66} r={10} fill={KRP.white} stroke={ink} strokeWidth={4} />}
      </g>
    </g>
  );
};

// 働く女性 (Person + 手ぬぐい)
const ND1Worker: React.FC<{
  x: number; y: number; s?: number; f: number; ph?: number; cloth: string; clothDark: string;
  face?: "normal" | "smile" | "joy" | "surprised"; pose?: "stand" | "point" | "hold"; pointDir?: 1 | -1; gaze?: [number, number]; lean?: number;
}> = ({ x, y, s = 1, f, ph = 0, cloth, clothDark, face = "normal", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0 }) => {
  const bob = Math.sin((f + ph * 17) / 13) * 3;
  return (
    <g transform={`translate(0 ${bob})`}>
      <Person x={x} y={y} s={s} cloth={cloth} clothDark={clothDark} f={f} phase={ph} face={face} pose={pose}
        pointDir={pointDir} gaze={gaze} lean={lean} still />
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
        {/* 手ぬぐい */}
        <path d="M -66 -244 Q -68 -300 0 -302 Q 68 -300 66 -244 Q 34 -262 0 -262 Q -34 -262 -66 -244 Z" fill={C.scarf} stroke={ink} strokeWidth={4.5} />
        <path d="M -40 -290 Q 0 -298 40 -290" stroke={C.wallShade} strokeWidth={4} fill="none" />
        <path d="M 60 -262 L 92 -250 L 78 -232 Z" fill={C.scarf} stroke={ink} strokeWidth={4} />
        {/* 前掛け */}
        <rect x={-44} y={-120} width={88} height={64} rx={6} fill={C.scarf} stroke={ink} strokeWidth={4} opacity={0.95} />
      </g>
    </g>
  );
};

// 黒く塗った小さな壺。x,y=底の中心。rot=倒れる角度 (底の左端を軸に)。inside=口の中 (空っぽ) を見せる
const ND1Jar: React.FC<{ x: number; y: number; s?: number; rot?: number; inside?: number; light?: number }> = ({
  x, y, s = 1, rot = 0, inside = 0, light = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot} -78 0)`}>
    <path d="M -30 -170 Q -34 -150 -60 -130 Q -84 -100 -78 -50 Q -72 -6 -40 0 L 40 0 Q 72 -6 78 -50 Q 84 -100 60 -130 Q 34 -150 30 -170 Z"
      fill={C.jar} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 塗りの刷毛目 */}
    <g stroke="#3A3438" strokeWidth={5} fill="none" opacity={0.9}>
      <path d="M -60 -110 Q 0 -96 62 -112" />
      <path d="M -72 -66 Q 0 -54 74 -68" />
      <path d="M -66 -28 Q 0 -20 66 -30" />
    </g>
    <path d="M -50 -118 Q -66 -80 -54 -36" stroke={C.jarHi} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
    {/* 首の紐 */}
    <path d="M -34 -150 Q 0 -140 34 -150" stroke={C.sash} strokeWidth={6} fill="none" />
    <path d="M 24 -146 Q 34 -126 28 -110 M 24 -146 Q 42 -134 44 -118" stroke={C.sash} strokeWidth={5} fill="none" strokeLinecap="round" />
    {/* 口 */}
    <ellipse cx={0} cy={-172} rx={38} ry={10 + inside * 16} fill={C.jar} stroke={ink} strokeWidth={5} />
    <ellipse cx={0} cy={-172} rx={28} ry={6 + inside * 12} fill={C.jarIn} />
    {inside > 0.05 && (
      <g opacity={inside}>
        {/* 奥の底がうっすら見える = 何も入っていない */}
        <ellipse cx={0} cy={-172} rx={16} ry={4 + inside * 6} fill="none" stroke={C.jarHi} strokeWidth={3} opacity={0.4 + light * 0.5} />
      </g>
    )}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #78 第3章、名前を、汚い名前に書きかえる罰。
// 格: 山 / seed 4078
// 絵: 章扉。奈良の都 (平城京) の朝。朱雀大路の先に朱塗りの大きな門 (朱雀門)、瓦屋根の重なり、遠くに青い山並み、柳の並木。手前の机に**木簡の束**と筆と朱の硯。`ChapterDoor` (num=3)。題字の後ろにクリームの帯
// どこ: 奈良の都・平城京の朝。朱雀大路をまっすぐ見通した先に朱雀門。左右に柳並木と瓦屋根、右奥に五重塔、遠くに青い山
// 演出: 手前は役所の机 (木簡の束・筆・朱の硯)。主役の門は左寄り、題字は右。朝日が昇り、門の扉が開いて光が差す
// 動き: 全体がゆっくり門へ寄る / 朝日が昇る / f8〜30 で門の扉が開く / 柳がゆれる / 鳥が横切る / 朱の硯に波紋
const Nm078: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.05 * cam;
  const sunUp = easeOut(seg(f, 0, 34));
  const open = easeInOut(seg(f, 8, 30));
  const ripple = seg(f, 24, 42);
  const GX = 540, GY = 600;
  // 柳の並木 (奥 t=0 → 手前 t=1)
  const trees = [0.1, 0.3, 0.55, 0.85];
  const edgeL = (t: number): [number, number] => [lerp(440, 150, t) - 40 * t, GY + t * 150];
  const edgeR = (t: number): [number, number] => [lerp(640, 940, t) + 40 * t, GY + t * 150];
  return (
    <Frame f={f} seed={4078}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={3} title="名前を、汚い名前に書きかえる罰" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <linearGradient id="nd1-78-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyMorningTop} />
          <stop offset="1" stopColor={C.skyMorningLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(${GX} ${GY - 100}) scale(${zoom}) translate(${-GX} ${-(GY - 100)})`}>
        <rect x={-40} y={-40} width={W + 80} height={820} fill="url(#nd1-78-sky)" />
        {/* 朝日 */}
        <g transform={`translate(1200 ${lerp(470, 300, sunUp)})`}>
          <circle r={190} fill={C.sun} opacity={0.18} />
          <circle r={120} fill={C.sun} opacity={0.3} />
          <circle r={70} fill={C.sunCore} stroke={ink} strokeWidth={5} />
        </g>
        {/* 鳥 */}
        {[0, 1, 2, 3].map((i) => {
          const bx = -100 + ((f * (5 + i) + i * 260) % 2100);
          const by = 150 + i * 34 + Math.sin(f / 5 + i) * 6;
          const fl = Math.sin(f / 2.5 + i) * 7;
          return <path key={i} d={`M ${bx - 18} ${by - fl} Q ${bx - 8} ${by - 6} ${bx} ${by} Q ${bx + 8} ${by - 6} ${bx + 18} ${by - fl}`}
            stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
        })}
        {/* 遠い山並み */}
        <path d="M -40 470 Q 120 380 300 420 Q 460 330 640 400 Q 820 350 1000 410 Q 1200 340 1400 400 Q 1620 350 1960 420 L 1960 620 L -40 620 Z"
          fill={C.mtFar} stroke={ink} strokeWidth={4} />
        <path d="M -40 520 Q 160 450 360 500 Q 560 450 760 510 Q 980 460 1180 505 Q 1440 450 1960 500 L 1960 640 L -40 640 Z"
          fill={C.mtNear} stroke={ink} strokeWidth={4} />
        {/* 五重塔 (奈良の記号) */}
        <g transform="translate(1520 590)">
          <rect x={-8} y={-330} width={16} height={60} fill={C.gold} stroke={ink} strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <rect x={-44 + k * 4} y={-58 - k * 52} width={88 - k * 8} height={30} fill={C.shu} stroke={ink} strokeWidth={3.5} />
              <ND1Roof x={0} y={-58 - k * 52} w={170 - k * 16} h={24} ridge={0.3} />
            </g>
          ))}
        </g>
        {/* 朝もや */}
        {[0, 1].map((i) => (
          <rect key={i} x={-200 + ((f * (1.4 + i)) % 300)} y={548 + i * 40} width={2400} height={24} rx={12} fill={C.mist} opacity={0.55} />
        ))}
        {/* 左右の瓦屋根の家並み */}
        {[
          [80, 600, 170], [250, 590, 150], [380, 605, 110],
          [760, 600, 140], [900, 592, 170], [1070, 600, 160], [1250, 596, 180], [1440, 606, 170], [1640, 598, 190], [1840, 604, 170],
          [30, 680, 220], [1050, 690, 260], [1330, 700, 280], [1650, 694, 300],
        ].map(([hx, hy, hw], i) => (
          <g key={i}>
            <rect x={hx - hw * 0.42} y={hy - hw * 0.28} width={hw * 0.84} height={hw * 0.28} fill={i % 3 ? C.wall : C.wallShade} stroke={ink} strokeWidth={4} />
            <rect x={hx - hw * 0.12} y={hy - hw * 0.2} width={hw * 0.24} height={hw * 0.2} fill={C.doorway} opacity={0.7} />
            <ND1Roof x={hx} y={hy - hw * 0.28} w={hw} h={hw * 0.24} ridge={0.5} />
          </g>
        ))}
        {/* 朱雀大路 */}
        <path d={`M 450 ${GY} L 630 ${GY} L 1240 1080 L -240 1080 Z`} fill={C.road} stroke={ink} strokeWidth={4} />
        <g stroke={C.roadDark} strokeWidth={4} opacity={0.7}>
          <line x1={540} y1={GY + 4} x2={500} y2={1080} strokeDasharray="20 26" />
          <line x1={500} y1={GY + 4} x2={200} y2={1080} strokeDasharray="14 30" />
          <line x1={580} y1={GY + 4} x2={800} y2={1080} strokeDasharray="14 30" />
        </g>
        {/* 朱雀門 */}
        <ND1Gate x={GX} y={GY} s={0.74} open={open} />
        {/* 門から差す光 */}
        <path d={`M 500 ${GY - 10} L 580 ${GY - 10} L 700 760 L 380 760 Z`} fill={C.sunCore} opacity={0.35 * open} />
        {/* 道ゆく人 (遠景) */}
        {[0, 1, 2].map((i) => (
          <PersonMini key={i} x={lerp(470, 640, i / 2) + Math.sin(f / 20 + i) * 6} y={GY + 40 + i * 26} s={0.22 + i * 0.03}
            color={[C.official, C.worker1, C.princess][i]} f={f} phase={i} />
        ))}
        {/* 柳の並木 */}
        {trees.map((t, i) => {
          const [lx, ly] = edgeL(t);
          const [rx, ry] = edgeR(t);
          const sc = 0.3 + t * 0.72;
          return (
            <g key={i}>
              <ND1Willow x={lx - 30 * sc} y={ly} s={sc} f={f} ph={i} />
              <ND1Willow x={rx + 30 * sc} y={ry} s={sc} f={f} ph={i + 7} />
            </g>
          );
        })}
      </g>
      {/* 手前の机 (役所の文机) */}
      <g transform={`translate(0 ${cam * 6})`}>
        <path d="M -20 742 L 1940 726 L 1940 1100 L -20 1100 Z" fill={C.desk} stroke={ink} strokeWidth={6} />
        <path d="M -20 742 L 1940 726 L 1940 748 L -20 764 Z" fill={C.deskLight} />
        <g stroke={C.deskDark} strokeWidth={4} opacity={0.55} fill="none">
          {[800, 860, 930, 1010].map((gy, i) => (
            <path key={i} d={`M -20 ${gy} q 480 ${rnd(4078, i) * 24 - 12} 980 -6 q 480 ${rnd(4079, i) * 24 - 12} 980 -6`} />
          ))}
        </g>
        {/* 木簡の束 */}
        {[4, 3, 2, 1, 0].map((i) => {
          const sx = 130 + rnd(78, i) * 30;
          const sy = 772 + i * 18;
          return (
            <g key={i} transform={`rotate(${-3 + rnd(79, i) * 3} ${sx + 190} ${sy})`}>
              <rect x={sx} y={sy} width={380} height={30} rx={4} fill={i % 2 ? C.mokkanDark : C.mokkan} stroke={ink} strokeWidth={4} />
              {i === 0 && (
                <g stroke={C.sumiPool} strokeWidth={4} strokeLinecap="round" opacity={0.75}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                    <line key={k} x1={sx + 40 + k * 40} y1={sy + 10} x2={sx + 62 + k * 40} y2={sy + 18 + (k % 2) * 4} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
        {[220, 440].map((tx) => (
          <rect key={tx} x={tx} y={764} width={14} height={110} rx={4} fill={C.sash} stroke={ink} strokeWidth={3} />
        ))}
        {/* 筆置きと筆 */}
        <rect x={600} y={790} width={150} height={22} rx={10} fill={C.lacquer} stroke={ink} strokeWidth={4} />
        <line x1={590} y1={778} x2={870} y2={770} stroke={ink} strokeWidth={16} strokeLinecap="round" />
        <line x1={590} y1={778} x2={870} y2={770} stroke={C.mokkanDark} strokeWidth={9} strokeLinecap="round" />
        <path d="M 870 770 L 920 774 L 870 782 Z" fill={C.shuInk} stroke={ink} strokeWidth={3} />
        {/* 朱の硯 */}
        <g transform="translate(1010 800)">
          <rect x={-90} y={-36} width={180} height={78} rx={18} fill={C.tileDark} stroke={ink} strokeWidth={5} />
          <ellipse cx={-26} cy={0} rx={52} ry={22} fill={C.shuInk} stroke={ink} strokeWidth={4} />
          <ellipse cx={-26} cy={0} rx={52 * ripple} ry={22 * ripple} fill="none" stroke={KRP.white} strokeWidth={3} opacity={(1 - ripple) * 0.8} />
          <ellipse cx={-40} cy={-6} rx={14} ry={4} fill={KRP.white} opacity={0.6} />
          <rect x={40} y={-24} width={34} height={54} rx={8} fill={C.shuDark} stroke={ink} strokeWidth={3} />
        </g>
        {/* 巻物と文鎮 */}
        <rect x={1300} y={770} width={420} height={44} rx={22} fill={C.wall} stroke={ink} strokeWidth={4} />
        <rect x={1290} y={766} width={26} height={52} rx={8} fill={C.lacquerRed} stroke={ink} strokeWidth={3} />
        <rect x={1740} y={776} width={110} height={34} rx={8} fill={C.goldDark} stroke={ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #79 769年、奈良時代の都で、ひとりの皇女が罪に問われました。
// 格: 山 / seed 4079
// 絵: 平城宮の中庭 (白い玉砂利・朱の回廊・瓦屋根)。役人たちが巻物を広げて読み上げる。庭の真ん中に、**皇女の後ろ姿** (紅の上衣・縦じまの裙・白い領巾がなびく) が立たされている。札「769年」「奈良」。f で巻物が開いていく
// どこ: 平城宮の中庭。奥に大きな殿舎 (瓦屋根・朱の柱・基壇)、左右に朱の回廊、地面は白い玉砂利
// 演出: カメラは皇女の背中ごし。基壇の上の役人3人がこちら (皇女) を向き、真ん中の役人が巻物を広げて読み上げる。両脇に槍の兵
// 動き: 全体がゆっくり皇女へ寄る / f6〜30 巻物が左右に開いて文字の行が並ぶ / f26〜 風が吹いて領巾と幡がなびく / 役人のまばたき
const Nm079: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.05 * cam;
  const unroll = easeOut(seg(f, 6, 30));
  const wind = 0.25 + 0.75 * seg(f, 26, 38);
  const half = 20 + 160 * unroll;
  return (
    <Frame f={f} seed={4079}>
      <defs>
        <clipPath id="nd1-79-scroll"><rect x={960 - half} y={380} width={half * 2} height={130} /></clipPath>
      </defs>
      <g transform={`translate(960 640) scale(${zoom}) translate(-960 -640)`}>
        <rect x={-40} y={-40} width={W + 80} height={300} fill={C.skyDay} />
        {/* 奥の殿舎 */}
        <ND1Roof x={960} y={258} w={1760} h={160} ridge={0.6} shibi />
        <rect x={150} y={266} width={1620} height={16} fill={C.shu} stroke={ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => {
          const bx = 150 + i * 180;
          const open = i === 3 || i === 4;
          return (
            <g key={i}>
              <rect x={bx} y={282} width={180} height={190} fill={open ? C.doorway : C.wall} stroke={ink} strokeWidth={4} />
              {!open && (
                <g>
                  <rect x={bx + 40} y={312} width={100} height={70} fill={C.lattice} stroke={ink} strokeWidth={3.5} />
                  {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={bx + 56 + k * 17} y1={312} x2={bx + 56 + k * 17} y2={382} stroke={ink} strokeWidth={3} />)}
                </g>
              )}
              {open && <rect x={bx + 10} y={290} width={160} height={70} fill={C.misu} opacity={0.8} />}
            </g>
          );
        })}
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={150 + i * 180 - 12} y={278} width={24} height={196} fill={C.shu} stroke={ink} strokeWidth={4} />)}
        {/* 基壇と階段 */}
        <rect x={100} y={472} width={1720} height={74} fill={C.stone} stroke={ink} strokeWidth={5} />
        <g stroke={C.stoneDark} strokeWidth={3}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={160 + i * 140} y1={474} x2={160 + i * 140} y2={544} />)}
        </g>
        <path d="M 1300 472 L 1460 472 L 1500 546 L 1260 546 Z" fill={C.stoneDark} stroke={ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => <line key={k} x1={1290 - k * 10} y1={490 + k * 16} x2={1470 + k * 10} y2={490 + k * 16} stroke={ink} strokeWidth={3} />)}
        {/* 左右の朱の回廊 */}
        {[-1, 1].map((sd) => {
          const cx = sd < 0 ? 140 : 1780;
          return (
            <g key={sd}>
              <rect x={cx - 200} y={420} width={400} height={20} fill={C.shu} stroke={ink} strokeWidth={4} />
              {[-180, -90, 0, 90, 180].map((px) => <rect key={px} x={cx + px - 10} y={430} width={20} height={190} fill={C.shu} stroke={ink} strokeWidth={4} />)}
              <rect x={cx - 210} y={600} width={420} height={24} fill={C.stone} stroke={ink} strokeWidth={4} />
              <ND1Roof x={cx} y={420} w={480} h={80} ridge={0.8} />
            </g>
          );
        })}
        {/* 玉砂利 */}
        <rect x={-40} y={546} width={W + 80} height={600} fill={C.gravel} />
        <path d="M -40 624 L 2000 624" stroke={ink} strokeWidth={4} />
        <g stroke={C.gravelLine} strokeWidth={4} fill="none">
          {Array.from({ length: 9 }, (_, i) => {
            const gy = 660 + i * i * 7 + i * 30;
            return <path key={i} d={`M -40 ${gy} Q 480 ${gy - 8} 960 ${gy} Q 1440 ${gy + 8} 1960 ${gy}`} />;
          })}
        </g>
        {Array.from({ length: 90 }, (_, i) => (
          <circle key={i} cx={rnd(4079, i) * 1920} cy={560 + rnd(79, i) * 520} r={2 + rnd(7, i) * 3} fill={C.gravelDot} />
        ))}
        {/* 幡 (旗竿) */}
        {[560, 1360].map((px, i) => {
          const w2 = Math.sin(f / 6 + i) * 10 * wind;
          return (
            <g key={px}>
              <line x1={px} y1={560} x2={px} y2={120} stroke={ink} strokeWidth={12} />
              <line x1={px} y1={560} x2={px} y2={120} stroke={C.spear} strokeWidth={6} />
              <circle cx={px} cy={116} r={10} fill={C.gold} stroke={ink} strokeWidth={4} />
              <path d={`M ${px} 140 L ${px + 50} 140 Q ${px + 60 + w2 + wind * 30} 250 ${px + 54 + w2 * 2 + wind * 60} 360 L ${px + 8 + w2 * 2 + wind * 50} 360 Q ${px + 6 + w2} 250 ${px} 140 Z`}
                fill={i ? C.bannerGreen : C.shu} stroke={ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 基壇の上の役人たち (こちら = 皇女を見下ろす) */}
        <ND1Kan x={700} y={484} s={0.74} f={f} ph={1} face="angry" gaze={[2, 4]} />
        <ND1Kan x={1220} y={484} s={0.74} f={f} ph={2} face="normal" pose="armsFolded" gaze={[-2, 4]} />
        <ND1Kan x={960} y={484} s={0.74} f={f} ph={3} face="normal" pose="hold" gaze={[0, 5]} />
        {/* 読み上げる巻物 */}
        <g>
          <rect x={960 - half} y={402} width={half * 2} height={96} fill={C.wall} stroke={ink} strokeWidth={4} />
          <g clipPath="url(#nd1-79-scroll)" stroke={ink} strokeWidth={3.5} strokeLinecap="round">
            {Array.from({ length: 16 }, (_, k) => {
              const lx = 790 + k * 22;
              return <path key={k} d={`M ${lx} 414 l 2 18 m -2 6 l 1 14 m 0 6 l -1 18 m 1 8 l 0 12`} />;
            })}
          </g>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <rect x={960 + sd * half - 9} y={392} width={18} height={116} rx={6} fill={C.lacquerRed} stroke={ink} strokeWidth={4} />
              <circle cx={960 + sd * half} cy={390} r={8} fill={C.gold} stroke={ink} strokeWidth={3} />
              <circle cx={960 + sd * half} cy={510} r={8} fill={C.gold} stroke={ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 読み上げの声 (音の線) */}
        {unroll > 0.3 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${1030 + k * 16} ${300 - k * 6} q 12 22 0 44`} stroke={ink} strokeWidth={4} fill="none"
            opacity={0.3 + 0.5 * Math.abs(Math.sin(f / 4 + k))} strokeLinecap="round" />
        ))}
        {/* 両脇の兵 */}
        <ND1Kan x={420} y={780} s={0.92} f={f} ph={4} face="normal" gaze={[3, 0]} spear />
        <ND1Kan x={1500} y={780} s={0.92} f={f} ph={5} face="normal" gaze={[-3, 0]} spear />
        {/* 立たされた皇女 (後ろ姿) */}
        <ND1Princess x={960} y={900} s={1.2} f={f} wind={wind * 0.8} />
        {/* 風の線 */}
        {wind > 0.3 && [0, 1, 2].map((k) => {
          const u = ((f * 0.06 + k * 0.33) % 1);
          return <path key={k} d={`M ${600 + u * 900} ${520 + k * 70} q 60 -14 120 0`} stroke={KRP.grayDark} strokeWidth={4}
            fill="none" opacity={0.5 * Math.sin(u * Math.PI)} strokeLinecap="round" />;
        })}
      </g>
      <TagPlate x={260} y={210} text="769年" size={50} t={seg(f, 2, 12)} />
      <TagPlate x={1700} y={130} text="奈良" size={50} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #80 天皇を呪った、という罪です。
// 格: 並 / seed 4080
// 絵: 役人が差し出す証拠の品: **黒く塗った小さな壺** (罪状の「髪を入れたとされる」髑髏は描かない・壺だけ)。御簾の奥に天皇の影。皇女の後ろ姿の肩がぴくりと揺れる。重い空気 (色を暗めに)
// どこ: 宮中の薄暗い一室。奥に御簾 (みす)、その向こうに灯りに浮かぶ天皇の座った影。右手前に灯台の小さな炎
// 演出: 主役は真ん中の台に載った黒い小さな壺。右から役人の袖と手が台ごと差し出す。左手前に皇女の後ろ姿 (肩から上の大写し)
// 動き: カメラが壺へゆっくり寄る / f4〜18 壺の台が右から滑り出る / f26〜32 皇女の肩がびくりと跳ね、そのあと小さく震える / 炎がゆらぐ / 御簾の房がゆれる
const Nm080: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.06 * cam;
  const push = easeOut(seg(f, 4, 18));
  const withdraw = easeOut(seg(f, 20, 30));
  const twitch = -Math.sin(seg(f, 26, 32) * Math.PI) * 16 + (f > 32 ? Math.sin(f * 2.3) * 1.6 : 0);
  const shock = seg(f, 26, 34);
  const fl = Math.sin(f / 3) * 0.08 + Math.sin(f / 1.7) * 0.05;
  const TX = 1000 + (1 - push) * 300;
  return (
    <Frame f={f} seed={4080} dark bg={C.room}>
      <defs>
        <radialGradient id="nd1-80-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.flame} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.flame} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="nd1-80-vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor={C.room} stopOpacity={0} />
          <stop offset="1" stopColor={C.room} stopOpacity={0.75} />
        </radialGradient>
      </defs>
      <g transform={`translate(1000 540) scale(${zoom}) translate(-1000 -540)`}>
        {/* 奥の壁と柱 */}
        <rect x={-40} y={-40} width={W + 80} height={680} fill={C.roomWall} />
        {[560, 1720].map((px) => <rect key={px} x={px - 26} y={-40} width={52} height={680} fill={C.pillarDim} stroke={ink} strokeWidth={5} />)}
        <rect x={-40} y={20} width={W + 80} height={20} fill={C.pillarDim} stroke={ink} strokeWidth={4} />
        {/* 御簾の向こうの灯りと影 */}
        <ellipse cx={1150} cy={330} rx={420} ry={260} fill="url(#nd1-80-glow)" opacity={0.9 + fl} />
        <g opacity={0.82} transform={`translate(0 ${Math.sin(f / 18) * 3})`}>
          <path d="M 940 600 Q 950 420 1060 380 Q 1150 350 1240 380 Q 1350 420 1360 600 Z" fill={C.shadowSil} />
          <circle cx={1150} cy={300} r={58} fill={C.shadowSil} />
          <rect x={1126} y={210} width={48} height={50} rx={14} fill={C.shadowSil} />
        </g>
        {/* 御簾 */}
        <rect x={620} y={60} width={1060} height={540} fill={C.misu} opacity={0.5} />
        <g stroke={C.misuDark} strokeWidth={3} opacity={0.9}>
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={620} y1={104 + i * 12.5} x2={1680} y2={104 + i * 12.5} />)}
        </g>
        {[620, 900, 1150, 1400, 1680].map((bx) => <line key={bx} x1={bx} y1={60} x2={bx} y2={600} stroke={C.misuBand} strokeWidth={8} />)}
        <rect x={610} y={50} width={1080} height={56} fill={C.misuBand} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={680 + i * 118} cy={78} r={14} fill="none" stroke={C.gold} strokeWidth={4} opacity={0.8} />
        ))}
        <rect x={610} y={596} width={1080} height={14} fill={C.misuBand} stroke={ink} strokeWidth={4} />
        {/* 房 */}
        {[700, 1600].map((tx, i) => {
          const sw = Math.sin(f / 14 + i) * 5;
          return (
            <g key={tx} transform={`rotate(${sw} ${tx} 106)`}>
              <line x1={tx} y1={106} x2={tx} y2={250} stroke={C.tassel} strokeWidth={8} />
              <circle cx={tx} cy={256} r={16} fill={C.tassel} stroke={ink} strokeWidth={4} />
              <path d={`M ${tx - 16} 266 L ${tx - 22} 340 L ${tx + 22} 340 L ${tx + 16} 266 Z`} fill={C.tassel} stroke={ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 床板 */}
        <rect x={-40} y={640} width={W + 80} height={500} fill={C.roomFloor} />
        <line x1={-40} y1={640} x2={1960} y2={640} stroke={ink} strokeWidth={5} />
        <g stroke={C.roomFloorLine} strokeWidth={4}>
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={1150 + (i - 6) * 130} y1={640} x2={1150 + (i - 6) * 420} y2={1100} />)}
        </g>
        {/* 灯台 */}
        <g transform="translate(1800 840)">
          <ellipse cx={0} cy={0} rx={60} ry={14} fill={C.lacquer} stroke={ink} strokeWidth={4} />
          <rect x={-8} y={-360} width={16} height={360} fill={C.lacquer} stroke={ink} strokeWidth={4} />
          <ellipse cx={0} cy={-360} rx={44} ry={10} fill={C.lacquerRed} stroke={ink} strokeWidth={4} />
          <circle cx={0} cy={-390} r={110} fill="url(#nd1-80-glow)" />
          <path d={`M -10 -366 Q ${-12 + fl * 30} -400 ${fl * 40} ${-430 - fl * 60} Q ${12 + fl * 20} -400 10 -366 Z`} fill={C.flame} stroke={ink} strokeWidth={3} />
          <path d="M -4 -368 Q -4 -386 0 -396 Q 4 -386 4 -368 Z" fill={NP.glowCore} />
        </g>
        {/* 差し出される台と黒い壺 */}
        <g transform={`translate(${TX - 1000} 0)`}>
          <ellipse cx={1000} cy={792} rx={170} ry={24} fill={ink} opacity={0.35} />
          <path d="M 930 680 L 1070 680 L 1110 790 L 890 790 Z" fill={C.lacquer} stroke={ink} strokeWidth={5} />
          <rect x={880} y={780} width={240} height={16} rx={6} fill={C.lacquer} stroke={ink} strokeWidth={4} />
          <rect x={800} y={642} width={400} height={40} rx={8} fill={C.lacquer} stroke={ink} strokeWidth={5} />
          <rect x={812} y={646} width={376} height={10} fill={C.lacquerRed} />
          <ND1Jar x={1000} y={646} s={1.15} />
          {/* 灯りの照り返し */}
          <path d="M 1048 520 Q 1068 560 1060 600" stroke={C.flame} strokeWidth={6} fill="none" opacity={0.55 + fl} strokeLinecap="round" />
        </g>
        {/* 役人の袖と手 (右から) */}
        <g transform={`translate(${TX - 1000 + withdraw * 90} 0)`}>
          {[[1196, 664, 0], [1196, 712, 1]].map(([hx, hy, k]) => (
            <g key={k}>
              <path d={`M 2000 ${hy + 60 + k * 30} Q 1500 ${hy + 30} ${hx + 50} ${hy}`} stroke={ink} strokeWidth={96} fill="none" strokeLinecap="round" />
              <path d={`M 2000 ${hy + 60 + k * 30} Q 1500 ${hy + 30} ${hx + 50} ${hy}`} stroke={C.officialDark} strokeWidth={86} fill="none" strokeLinecap="round" />
              <ellipse cx={hx + 6} cy={hy} rx={30} ry={22} fill={KRP.white} stroke={ink} strokeWidth={4.5} />
            </g>
          ))}
        </g>
        {/* 皇女の後ろ姿 (手前・肩から上) */}
        <ND1Princess x={400} y={1030} s={1.9} f={f} dy={twitch} wind={0.05} />
        {/* びくりの線 */}
        {shock > 0 && shock < 1 && [0, 1, 2].map((k) => (
          <line key={k} x1={560 + k * 10} y1={620 - k * 40} x2={600 + k * 18} y2={600 - k * 52}
            stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={1 - shock} />
        ))}
      </g>
      <rect x={0} y={0} width={W} height={H} fill="url(#nd1-80-vig)" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #81 彼女は皇族の身分を取り上げられ、さらに名前まで変えられて、都を追われました。
// 格: 山 / seed 4081
// 絵: 都の門 (羅城門) から、牛車ではなく**歩いて**出ていく皇女の後ろ姿。肩の領巾が風で飛ばされる (f)。門番が見送る。後ろで、皇族の身分を示す冠の飾りと名札が地面に落ちる。夕方の長い影
// どこ: 夕方の都のはずれ、羅城門。門の向こうに沈む夕日、左右に都を囲む土の壁。門の外には野と遠い山
// 演出: 皇女が牛車ではなく歩いて門へ向かう (後ろ姿)。逆光で長い影がこちらへ伸びる。門の両脇の兵が見送る。歩いた後ろに冠の飾りと札が落ちている
// 動き: カメラがゆっくり寄る / 皇女が奥へ歩いていく (小さくなる) / f4〜16 冠の飾りと札が落ちて跳ねる / f16〜42 領巾が風で肩から飛ばされ空へ / カラスが帰る
const Nm081: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.05 * cam;
  const walkT = seg(f, 0, 42);
  const py = lerp(750, 690, walkT);
  const ps = lerp(0.92, 0.82, walkT);
  const flyT = seg(f, 16, 42);
  const flown = f >= 16;
  const drop = (a: number, b: number) => {
    const t = seg(f, a, b);
    return t < 0.7 ? (t / 0.7) * (t / 0.7) : 1 - Math.sin(((t - 0.7) / 0.3) * Math.PI) * 0.12;
  };
  const d1 = drop(4, 14);
  const d2 = drop(7, 17);
  // 飛ばされた領巾の位置
  const hx = lerp(1000, 1480, easeOut(flyT));
  const hy = lerp(py - 150 * ps, 330, easeOut(flyT)) + Math.sin(f / 4) * 16;
  const hw = Math.sin(f / 3) * 30;
  return (
    <Frame f={f} seed={4081} bg={C.duskMid}>
      <defs>
        <linearGradient id="nd1-81-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="0.55" stopColor={C.duskMid} />
          <stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <radialGradient id="nd1-81-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.duskLow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
        <rect x={-40} y={-40} width={W + 80} height={640} fill="url(#nd1-81-sky)" />
        {/* 夕日 (門の真後ろ) */}
        <circle cx={960} cy={420} r={380} fill="url(#nd1-81-sun)" />
        <circle cx={960} cy={440} r={96} fill={C.sun} stroke={ink} strokeWidth={5} />
        {/* 遠い山 */}
        <path d="M -40 520 Q 200 440 420 500 Q 640 430 880 490 Q 1120 440 1360 495 Q 1620 430 1960 500 L 1960 600 L -40 600 Z"
          fill={C.duskHill} stroke={ink} strokeWidth={4} />
        {/* 帰るカラス */}
        {[0, 1, 2, 3, 4].map((i) => {
          const bx = 1900 - ((f * (4 + i * 0.7) + i * 230) % 2100);
          const by = 120 + i * 40 + Math.sin(f / 6 + i) * 8;
          const fl = Math.sin(f / 2.2 + i) * 9;
          return <path key={i} d={`M ${bx - 22} ${by - fl} Q ${bx - 10} ${by - 8} ${bx} ${by} Q ${bx + 10} ${by - 8} ${bx + 22} ${by - fl}`}
            stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* 都を囲む土の壁 (羅城) */}
        {[[-40, 640], [1280, 1960]].map(([a, b], i) => (
          <g key={i}>
            <rect x={a} y={470} width={b - a} height={108} fill={C.wallDusk} stroke={ink} strokeWidth={5} />
            <g stroke={C.stoneDusk} strokeWidth={4}>
              {[500, 530, 560].map((ly) => <line key={ly} x1={a} y1={ly} x2={b} y2={ly} />)}
            </g>
            <rect x={a - 10} y={452} width={b - a + 20} height={22} rx={6} fill={C.tileDusk} stroke={ink} strokeWidth={4} />
          </g>
        ))}
        {/* 地面と道 */}
        <rect x={-40} y={576} width={W + 80} height={600} fill={C.duskGround} />
        <line x1={-40} y1={576} x2={1960} y2={576} stroke={ink} strokeWidth={5} />
        <path d="M 860 576 L 1060 576 L 1500 1100 L 420 1100 Z" fill={C.duskRoad} stroke={ink} strokeWidth={4} />
        {/* 羅城門 */}
        <ND1Gate x={960} y={578} s={0.95} dusk open={1} through={C.duskLow} />
        {/* 門の影 (こちらへ長く伸びる) */}
        <path d="M 650 578 L 1270 578 L 1700 1100 L 220 1100 Z" fill={C.shadowLong} opacity={0.28} />
        <path d="M 870 578 L 1050 578 L 1200 1100 L 720 1100 Z" fill={C.duskLow} opacity={0.3} />
        {/* 見送る門番 */}
        <path d="M 560 600 L 600 600 L 470 900 L 420 900 Z" fill={C.shadowLong} opacity={0.3} />
        <path d="M 1340 600 L 1380 600 L 1500 900 L 1450 900 Z" fill={C.shadowLong} opacity={0.3} />
        <ND1Kan x={580} y={604} s={0.6} f={f} ph={1} face="sad" gaze={[5, 3]} spear />
        <ND1Kan x={1360} y={604} s={0.6} f={f} ph={2} face="worried" gaze={[-5, 3]} spear />
        {/* 皇女の長い影 */}
        <path d={`M ${960 - 50 * ps} ${py} L ${960 + 50 * ps} ${py} L ${1010} 1100 L ${880} 1100 Z`} fill={C.shadowLong} opacity={0.42} />
        {/* 落ちた冠の飾り (金の飾り) と札 */}
        <g transform={`translate(860 ${lerp(640, 790, d1)}) rotate(${d1 * 24})`}>
          <ellipse cx={0} cy={14} rx={50} ry={9} fill={C.shadowLong} opacity={0.4 * d1} />
          <path d="M -44 0 Q 0 -44 44 0" fill="none" stroke={ink} strokeWidth={14} strokeLinecap="round" />
          <path d="M -44 0 Q 0 -44 44 0" fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
          {[-30, -10, 10, 30].map((bx, i) => (
            <g key={bx}>
              <line x1={bx} y1={-14 - (i % 3 ? 6 : 0)} x2={bx} y2={6} stroke={C.goldDark} strokeWidth={3} />
              <circle cx={bx} cy={8} r={6} fill={i % 2 ? C.shu : C.lattice} stroke={ink} strokeWidth={2.5} />
            </g>
          ))}
          <circle cx={0} cy={-24} r={10} fill={C.gold} stroke={ink} strokeWidth={3} />
        </g>
        <g transform={`translate(1090 ${lerp(620, 784, d2)}) rotate(${-8 + d2 * 70})`}>
          <ellipse cx={0} cy={30} rx={46} ry={8} fill={C.shadowLong} opacity={0.4 * d2} />
          <rect x={-26} y={-44} width={52} height={88} rx={6} fill={C.mokkanDark} stroke={ink} strokeWidth={4} />
          <g stroke={C.mokkanGrain} strokeWidth={3}>
            <line x1={-14} y1={-34} x2={-14} y2={34} />
            <line x1={8} y1={-30} x2={8} y2={36} />
          </g>
          <path d="M 0 -44 Q -18 -70 -40 -60" stroke={C.sash} strokeWidth={4} fill="none" />
        </g>
        {d1 >= 0.95 && f < 26 && [0, 1, 2].map((k) => (
          <circle key={k} cx={860 + (k - 1) * 40 * seg(f, 14, 26)} cy={800 - k * 4} r={10 + 20 * seg(f, 14, 26)}
            fill="none" stroke={C.wallDusk} strokeWidth={4} opacity={1 - seg(f, 14, 26)} />
        ))}
        {/* 歩いて門へ向かう皇女 (後ろ姿) */}
        <ND1Princess x={960} y={py} s={ps} f={f} walk hire={!flown} wind={0.5} orn={false} />
        {/* 飛ばされた領巾 */}
        {flown && (
          <g transform={`translate(${hx} ${hy}) rotate(${-20 + flyT * 40})`}>
            {[24, 17].map((sw, i) => (
              <path key={i} d={`M -120 ${hw * 0.4} C -60 ${-40 + hw} 0 ${40 - hw} 60 ${hw * 0.3} S 140 ${-30 - hw * 0.5} 170 ${10 + hw * 0.4}`}
                stroke={i ? C.hire : ink} strokeWidth={sw} fill="none" strokeLinecap="round" />
            ))}
          </g>
        )}
        {/* 風の線 */}
        {[0, 1, 2, 3].map((k) => {
          const u = (f * 0.05 + k * 0.25) % 1;
          return <path key={k} d={`M ${700 + u * 900} ${300 + k * 90 - u * 60} q 70 -20 140 0`} stroke={C.wallDusk} strokeWidth={5}
            fill="none" opacity={0.7 * Math.sin(u * Math.PI)} strokeLinecap="round" />;
        })}
      </g>
      <TagPlate x={1660} y={150} text="羅城門" size={46} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #82 新しい名前は、「厨真人厨女」。
// 格: 山 / seed 4082
// 絵: ★新しい名前の札の見せ場。役所の机の上で、役人が大きな木の札に筆で「厨真人厨女」と書く (f で一字ずつ現れる)。墨の飛沫。机の端に、元の名前の札 (字は塗りつぶされて読めない) が伏せて置かれる
// どこ: 役所の文机を真上から。木目の机・緑の下敷き・硯・水滴・積んだ白い木簡・巻紙
// 演出: 真ん中の大きな縦長の木の札に、右上から伸びた役人の手が筆で新しい名前を一字ずつ書く。左の机の端に元の名前の札が伏せて置かれ、めくれた角から真っ黒に塗りつぶした面がのぞく
// 動き: カメラが札へゆっくり寄る / f6〜40 一字ずつ上から書かれ、筆先が字をなぞる / 字ができるたびに墨が飛ぶ / f40〜 筆が上がって離れる / 硯の墨に波紋
const Nm082: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1 + 0.05 * cam;
  const name = Array.from("厨真人厨女");
  const cy = (i: number) => 190 + i * 140;
  const start = (i: number) => 6 + i * 7;
  const prog = (i: number) => seg(f, start(i), start(i) + 6);
  const active = Math.min(4, Math.max(0, Math.floor((f - 6) / 7)));
  const done = f >= 39;
  const p = prog(active);
  let tx = 960 + Math.sin(p * Math.PI * 4) * 42;
  let ty = cy(active) - 52 + p * 104;
  if (f < 6) { tx = lerp(1120, 960, seg(f, 0, 6)); ty = lerp(120, 138, seg(f, 0, 6)); }
  if (done) { const u = easeOut(seg(f, 39, 42)); tx = lerp(tx, 1250, u); ty = lerp(ty, 520, u); }
  const dx = 0.574, dy = -0.819;
  const hand: [number, number] = [tx + 210 * dx, ty + 210 * dy];
  const end: [number, number] = [tx + 430 * dx, ty + 430 * dy];
  const sleeve = `M ${hand[0] + 30} ${hand[1] - 20} Q ${hand[0] + 300} ${hand[1] - 60} 2100 ${hand[1] - 380}`;
  return (
    <Frame f={f} seed={4082} bg={C.desk}>
      <defs>
        {name.map((_, i) => (
          <clipPath key={i} id={`nd1-82-c${i}`}>
            <rect x={860} y={cy(i) - 70} width={200} height={140 * prog(i)} />
          </clipPath>
        ))}
      </defs>
      <g transform={`translate(960 440) scale(${zoom}) translate(-960 -440)`}>
        {/* 机 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -40 ${40 + i * 150} q 480 ${rnd(4082, i) * 40 - 20} 980 0 q 480 ${rnd(82, i) * 40 - 20} 1000 0`} />
          ))}
        </g>
        {/* 下敷き */}
        <rect x={700} y={30} width={520} height={810} rx={10} fill={C.felt} stroke={ink} strokeWidth={6} />
        {/* 積んだ白い木簡 (左上) */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={140 + i * 6} y={110 + i * 34} width={420} height={40} rx={5} fill={i % 2 ? C.mokkan : C.mokkanDark}
            stroke={ink} strokeWidth={4} transform={`rotate(${-4 + i * 1.5} 350 ${130 + i * 34})`} />
        ))}
        {/* 伏せられた元の名前の札 (左) */}
        <g transform="rotate(-9 360 620)">
          <rect x={170} y={540} width={380} height={150} rx={10} fill={C.mokkanDark} stroke={ink} strokeWidth={6} />
          <g stroke={C.mokkanGrain} strokeWidth={4} fill="none">
            <path d="M 190 575 q 90 -8 180 0 q 80 8 160 -2" />
            <path d="M 190 625 q 100 8 190 0 q 70 -8 150 4" />
            <path d="M 200 665 q 60 -6 120 0" />
          </g>
          {/* 裏まで染みた墨 */}
          <ellipse cx={330} cy={612} rx={90} ry={30} fill={C.sumiPool} opacity={0.18} />
          {/* めくれた角: 表は墨で真っ黒に塗りつぶされている */}
          <path d="M 550 610 L 550 690 L 470 690 Q 500 650 550 610 Z" fill={C.sumiPool} stroke={ink} strokeWidth={5} />
          <path d="M 550 610 Q 520 660 470 690 L 560 702 Z" fill={C.mokkan} stroke={ink} strokeWidth={4} opacity={0.0} />
          <g stroke="#3A3438" strokeWidth={5} strokeLinecap="round">
            <line x1={500} y1={680} x2={540} y2={640} />
            <line x1={518} y1={684} x2={546} y2={656} />
          </g>
          <rect x={540} y={600} width={14} height={14} rx={3} fill={C.sash} stroke={ink} strokeWidth={3} />
        </g>
        {/* 硯・水滴・筆置き (右) */}
        <g transform="translate(1450 640)">
          <rect x={-120} y={-150} width={240} height={300} rx={24} fill={C.tileDark} stroke={ink} strokeWidth={6} />
          <rect x={-96} y={-40} width={192} height={166} rx={14} fill={C.tile} stroke={ink} strokeWidth={4} />
          <ellipse cx={0} cy={-96} rx={86} ry={38} fill={C.sumiPool} stroke={ink} strokeWidth={4} />
          <ellipse cx={0} cy={-96} rx={86 * seg(f, 20, 42)} ry={38 * seg(f, 20, 42)} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.6 * (1 - seg(f, 20, 42))} />
          <ellipse cx={-30} cy={-108} rx={22} ry={6} fill={KRP.white} opacity={0.35} />
          <rect x={-30} y={10} width={60} height={110} rx={8} fill={C.sumiPool} stroke={ink} strokeWidth={4} />
        </g>
        <g transform="translate(1690 470)">
          <circle r={44} fill={C.goldDark} stroke={ink} strokeWidth={5} />
          <circle r={14} cx={-8} cy={-8} fill={C.gold} />
          <rect x={-6} y={-60} width={12} height={20} fill={C.goldDark} stroke={ink} strokeWidth={3} />
        </g>
        {/* 巻紙と文鎮 (右上) */}
        <rect x={1330} y={130} width={460} height={110} rx={8} fill={C.wall} stroke={ink} strokeWidth={5} />
        <rect x={1760} y={120} width={60} height={130} rx={28} fill={C.wallShade} stroke={ink} strokeWidth={5} />
        <rect x={1440} y={150} width={180} height={70} rx={10} fill={C.goldDark} stroke={ink} strokeWidth={5} />
        {/* 大きな木の札 */}
        <rect x={778} y={72} width={380} height={750} rx={10} fill={ink} opacity={0.2} />
        <path d="M 770 60 L 1150 60 L 1150 100 L 1136 112 L 1150 124 L 1150 810 L 770 810 L 770 124 L 784 112 L 770 100 Z"
          fill={C.mokkan} stroke={ink} strokeWidth={7} strokeLinejoin="round" />
        <g stroke={C.mokkanGrain} strokeWidth={4} fill="none">
          <path d="M 800 140 q 8 300 -2 640" />
          <path d="M 1118 150 q -10 280 2 630" />
          <path d="M 1060 400 q 6 120 -4 220" />
        </g>
        {/* 新しい名前 (一字ずつ現れる) */}
        {name.map((ch, i) => (
          <g key={i} clipPath={`url(#nd1-82-c${i})`}>
            <text x={960} y={cy(i) + 42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} fill={NP.sumi}>{ch}</text>
          </g>
        ))}
        {/* 墨の飛沫 */}
        {name.map((_, i) => {
          const a = seg(f, start(i) + 5, start(i) + 7);
          if (a <= 0) return null;
          return (
            <g key={i} fill={C.sumiPool} opacity={0.85}>
              {[0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={960 + (rnd(i + 9, k) - 0.5) * 300} cy={cy(i) + (rnd(i + 19, k) - 0.5) * 130}
                  r={(2 + rnd(i + 29, k) * 5) * pop(a)} />
              ))}
            </g>
          );
        })}
        {/* 筆と役人の手 */}
        <path d={sleeve} stroke={ink} strokeWidth={150} fill="none" strokeLinecap="round" />
        <path d={sleeve} stroke={C.official} strokeWidth={138} fill="none" strokeLinecap="round" />
        <path d={`M ${hand[0] + 60} ${hand[1] - 40} Q ${hand[0] + 200} ${hand[1] - 90} 2100 ${hand[1] - 330}`} stroke={C.officialDark} strokeWidth={8} fill="none" />
        <line x1={tx + 40 * dx} y1={ty + 40 * dy} x2={end[0]} y2={end[1]} stroke={ink} strokeWidth={22} strokeLinecap="round" />
        <line x1={tx + 40 * dx} y1={ty + 40 * dy} x2={end[0]} y2={end[1]} stroke={C.mokkanDark} strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${tx} ${ty} L ${tx + 44 * dx - 12 * dy} ${ty + 44 * dy + 12 * dx} L ${tx + 44 * dx + 12 * dy} ${ty + 44 * dy - 12 * dx} Z`}
          fill={C.sumiPool} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={hand[0]} cy={hand[1]} r={34} fill={KRP.white} stroke={ink} strokeWidth={5} />
        <path d={`M ${hand[0] - 26} ${hand[1] + 6} q 10 14 24 10 M ${hand[0] - 18} ${hand[1] - 18} q 14 6 18 18`} stroke={ink} strokeWidth={4} fill="none" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #83 台所で働く女を思わせる名前だった、と読まれています。
// 格: 並 / seed 4083
// 絵: 奈良の都の厨 (台所: かまど・大きな鍋・湯気・まな板と包丁・野菜の籠)。働く女性たちの姿 (顔は描いてよい・一般の人)。手前に #82 の札が浮かび、「厨」の字の上に台所の小さな絵が重なる
// どこ: 奈良の都の厨 (台所)。土壁・梁・煙出しの窓・土間。左に大きなかまどと鍋、壁の棚に甕と器、梁から干した菜
// 演出: 鍋をかき混ぜる女性と、まな板で大根を切る女性。右手前に #82 の札が浮かび、「厨」の字に台所の小さな絵 (かまど) が重なる
// 動き: カメラがゆっくり右の札へパン / 湯気が立ちのぼる / かまどの火がゆらぐ / 包丁がゆっくりトン (12コマに1回) / f4〜16 札が右から入る / f18〜28 「厨」に台所の絵がぽんと重なる
const Nm083: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const tagIn = easeOut(seg(f, 4, 16));
  const badge = seg(f, 18, 28);
  const glow = seg(f, 24, 34);
  const chop = Math.max(0, Math.sin((f % 12) / 12 * Math.PI * 2)) * 14;
  const fl = Math.sin(f / 2.6) * 0.1 + Math.sin(f / 1.5) * 0.06;
  const name = Array.from("厨真人厨女");
  const TX = 1620 + (1 - tagIn) * 420;
  const TY = Math.sin(f / 10) * 6;
  const cy = (i: number) => 205 + i * 128;
  return (
    <Frame f={f} seed={4083} bg={C.mud}>
      <defs>
        <radialGradient id="nd1-83-fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fireCore} stopOpacity={0.8} />
          <stop offset="1" stopColor={C.fire} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${lerp(20, -30, pan)} 0)`}>
        {/* 土壁と梁 */}
        <rect x={-80} y={-40} width={W + 160} height={700} fill={C.mud} />
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1={rnd(83, i) * 2000} y1={rnd(84, i) * 620} x2={rnd(83, i) * 2000 + 14} y2={rnd(84, i) * 620 + 5}
            stroke={C.mudDark} strokeWidth={3} strokeLinecap="round" />
        ))}
        <rect x={-80} y={84} width={W + 160} height={34} fill={C.beam} stroke={ink} strokeWidth={5} />
        {[80, 1380].map((px) => <rect key={px} x={px - 22} y={-40} width={44} height={700} fill={C.beam} stroke={ink} strokeWidth={5} />)}
        {/* 煙出しの窓と差しこむ光 */}
        <rect x={420} y={-10} width={240} height={80} fill={C.skyDay} stroke={ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={440 + k * 50} y1={-10} x2={440 + k * 50} y2={70} stroke={C.beam} strokeWidth={8} />)}
        <path d="M 430 70 L 650 70 L 900 640 L 600 640 Z" fill={NP.glowCore} opacity={0.18} />
        {/* 梁から下がる干し菜 */}
        {[920, 1010, 1100, 1190].map((hx, i) => {
          const sw = Math.sin(f / 15 + i) * 3;
          return (
            <g key={hx} transform={`rotate(${sw} ${hx} 118)`}>
              <line x1={hx} y1={118} x2={hx} y2={160} stroke={C.sash} strokeWidth={4} />
              <path d={`M ${hx - 22} 160 Q ${hx} 150 ${hx + 22} 160 L ${hx + 12} 250 L ${hx - 12} 250 Z`} fill={i % 2 ? C.leaf : C.willowDark} stroke={ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 棚と甕・器 */}
        <rect x={880} y={330} width={420} height={18} fill={C.beam} stroke={ink} strokeWidth={4} />
        {[[930, 330, 44, 70], [1020, 330, 36, 54], [1110, 330, 50, 80], [1210, 330, 40, 50]].map(([jx, jy, jw, jh], i) => (
          <g key={i}>
            <path d={`M ${jx - jw * 0.5} ${jy} Q ${jx - jw} ${jy - jh * 0.5} ${jx - jw * 0.4} ${jy - jh} L ${jx + jw * 0.4} ${jy - jh} Q ${jx + jw} ${jy - jh * 0.5} ${jx + jw * 0.5} ${jy} Z`}
              fill={i % 2 ? C.clay : C.clayDark} stroke={ink} strokeWidth={4} />
            <ellipse cx={jx} cy={jy - jh} rx={jw * 0.4} ry={5} fill={C.pot} stroke={ink} strokeWidth={3} />
          </g>
        ))}
        {/* 土間 */}
        <rect x={-80} y={640} width={W + 160} height={500} fill={C.earthFloor} />
        <line x1={-80} y1={640} x2={2000} y2={640} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={rnd(830, i) * 2000} cy={660 + rnd(831, i) * 400} r={3 + rnd(832, i) * 4} fill={C.mudDark} />
        ))}
        {/* かまど */}
        <ellipse cx={520} cy={710} rx={260} ry={26} fill={ink} opacity={0.2} />
        <path d="M 290 706 L 300 520 Q 310 470 380 466 L 660 466 Q 730 470 740 520 L 750 706 Z" fill={C.clay} stroke={ink} strokeWidth={6} />
        <path d="M 300 520 Q 520 500 740 520" stroke={C.clayDark} strokeWidth={5} fill="none" />
        <path d="M 450 706 L 450 630 Q 520 570 590 630 L 590 706 Z" fill={C.doorway} stroke={ink} strokeWidth={5} />
        <ellipse cx={520} cy={670} rx={110} ry={70} fill="url(#nd1-83-fire)" opacity={0.9 + fl} />
        <path d={`M 470 704 Q ${490 + fl * 40} ${640 - fl * 60} 500 ${620 - fl * 40} Q 520 650 ${530 + fl * 30} ${610 + fl * 30} Q 550 650 570 704 Z`} fill={C.fire} stroke={ink} strokeWidth={3} />
        <path d="M 500 704 Q 515 664 520 650 Q 528 670 540 704 Z" fill={C.fireCore} />
        {[0, 1, 2].map((k) => <rect key={k} x={460 + k * 30} y={690 + (k % 2) * 6} width={60} height={14} rx={6} fill={C.trunk} stroke={ink} strokeWidth={3} transform={`rotate(${-10 + k * 10} ${490 + k * 30} 697)`} />)}
        {/* 大きな鍋 */}
        <path d="M 360 440 Q 360 520 520 524 Q 680 520 680 440 Z" fill={C.pot} stroke={ink} strokeWidth={6} />
        <ellipse cx={520} cy={440} rx={170} ry={30} fill={C.potHi} stroke={ink} strokeWidth={6} />
        <ellipse cx={520} cy={444} rx={146} ry={22} fill={C.wallShade} />
        {[[-1, 340], [1, 700]].map(([sd, ex]) => <rect key={sd} x={ex - 16} y={446} width={32} height={14} rx={5} fill={C.pot} stroke={ink} strokeWidth={4} />)}
        {/* 湯気 */}
        {[0, 1, 2].map((k) => {
          const u = ((f / 30) + k / 3) % 1;
          return (
            <path key={k} d={`M ${470 + k * 50} ${420 - u * 260} q ${-26 + k * 6} -30 0 -60 q 26 -30 0 -60`} stroke={KRP.white} strokeWidth={14}
              fill="none" strokeLinecap="round" opacity={0.75 * Math.sin(u * Math.PI)} />
          );
        })}
        {/* 野菜の籠 */}
        <g transform="translate(170 760)">
          <ellipse cx={0} cy={50} rx={120} ry={16} fill={ink} opacity={0.2} />
          <ellipse cx={-50} cy={-6} rx={44} ry={22} fill={C.eggplant} stroke={ink} strokeWidth={4} transform="rotate(-20 -50 -6)" />
          <ellipse cx={30} cy={-14} rx={20} ry={58} fill={C.daikon} stroke={ink} strokeWidth={4} transform="rotate(40 30 -14)" />
          <path d="M 64 -56 l 30 -30 m -24 34 l 36 -20" stroke={C.leaf} strokeWidth={10} strokeLinecap="round" />
          <circle cx={-10} cy={-10} r={24} fill={C.taro} stroke={ink} strokeWidth={4} />
          <path d="M -110 0 L 110 0 L 90 50 L -90 50 Z" fill={C.basket} stroke={ink} strokeWidth={5} />
          <g stroke={C.basketDark} strokeWidth={4}>
            {[-80, -50, -20, 10, 40, 70].map((bx) => <line key={bx} x1={bx} y1={2} x2={bx * 0.86} y2={48} />)}
            <line x1={-100} y1={24} x2={100} y2={24} />
          </g>
        </g>
        {/* かき混ぜる女性 */}
        <ND1Worker x={880} y={730} s={0.86} f={f} ph={1} cloth={C.worker1} clothDark={C.worker1Dark} face="smile" pose="point" pointDir={-1} gaze={[-5, 0]} />
        {(() => {
          const hx = 880 - 153 * 0.86, hy = 730 - 148 * 0.86 + Math.sin((f + 17) / 13) * 3;
          const st = Math.sin(f / 5) * 26;
          return (
            <g>
              <line x1={hx} y1={hy} x2={600 + st} y2={430} stroke={ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={hx} y1={hy} x2={600 + st} y2={430} stroke={C.mokkanDark} strokeWidth={8} strokeLinecap="round" />
              <ellipse cx={600 + st} cy={436} rx={26} ry={10} fill={C.mokkanDark} stroke={ink} strokeWidth={4} />
            </g>
          );
        })()}
        {/* まな板の台と切る女性 */}
        <ND1Worker x={1150} y={770} s={0.8} f={f} ph={2} cloth={C.worker2} clothDark={C.worker2Dark} face="normal" pose="hold" gaze={[0, 6]} />
        <rect x={1010} y={700} width={320} height={30} rx={6} fill={C.beam} stroke={ink} strokeWidth={5} />
        {[1030, 1290].map((lx) => <rect key={lx} x={lx} y={728} width={18} height={80} fill={C.beam} stroke={ink} strokeWidth={4} />)}
        <rect x={1040} y={680} width={260} height={24} rx={6} fill={C.board} stroke={ink} strokeWidth={4} />
        <rect x={1060} y={664} width={120} height={22} rx={10} fill={C.daikon} stroke={ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => <ellipse key={k} cx={1200 + k * 26} cy={676} rx={10} ry={8} fill={C.daikon} stroke={ink} strokeWidth={3} />)}
        <g transform={`translate(0 ${-chop})`}>
          <rect x={1214} y={628} width={46} height={14} rx={4} fill={C.trunk} stroke={ink} strokeWidth={3} transform="rotate(-20 1214 635)" />
          <path d="M 1206 640 L 1214 632 L 1240 664 L 1214 676 Z" fill={C.blade} stroke={ink} strokeWidth={3} />
        </g>
        {chop < 1 && f % 12 < 2 && <path d="M 1150 690 l -16 6 M 1206 690 l 16 6" stroke={ink} strokeWidth={4} strokeLinecap="round" />}
      </g>
      {/* 浮かぶ名前の札 (#82 の札) */}
      <g transform={`translate(${TX - 1620} ${TY})`}>
        <rect x={1488} y={128} width={280} height={680} rx={10} fill={ink} opacity={0.22} />
        <path d="M 1480 116 L 1760 116 L 1760 150 L 1748 160 L 1760 170 L 1760 800 L 1480 800 L 1480 170 L 1492 160 L 1480 150 Z"
          fill={C.mokkan} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={C.mokkanGrain} strokeWidth={4} fill="none">
          <path d="M 1504 190 q 6 260 -2 580" />
          <path d="M 1736 200 q -8 240 2 570" />
        </g>
        {[0, 3].map((i) => (
          <circle key={i} cx={1620} cy={cy(i) - 4} r={66} fill={NP.glow} opacity={(i === 0 ? 0.6 : 0.4) * glow} />
        ))}
        {name.map((ch, i) => (
          <text key={i} x={1620} y={cy(i) + 34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={NP.sumi}>{ch}</text>
        ))}
        {/* 「厨」に重なる台所の小さな絵 */}
        <g transform={`translate(1500 150) scale(${pop(badge)})`}>
          <circle r={70} fill={KRP.white} stroke={ink} strokeWidth={6} />
          <path d="M -40 40 L -36 -2 Q -34 -12 -20 -12 L 20 -12 Q 34 -12 36 -2 L 40 40 Z" fill={C.clay} stroke={ink} strokeWidth={4} />
          <path d="M -10 40 L -10 22 Q 0 10 10 22 L 10 40 Z" fill={C.fire} stroke={ink} strokeWidth={3} />
          <path d="M -32 -14 Q -32 -34 0 -36 Q 32 -34 32 -14 Z" fill={C.pot} stroke={ink} strokeWidth={4} />
          <path d={`M -8 -40 q -10 -10 0 -20 q 10 -10 0 -20 M 10 -40 q -10 -10 0 -20`} stroke={KRP.grayDark} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        {/* 台所の絵とかまどを結ぶ点線 */}
        {badge > 0.5 && (
          <path d="M 1430 160 Q 1100 120 760 380" stroke={KRP.red} strokeWidth={6} strokeDasharray="14 12" fill="none"
            strokeDashoffset={-f * 2} opacity={seg(f, 22, 30)} />
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #84 のちにこの罪は、でっちあげだったと分かります。
// 格: 山 / seed 4084
// 絵: #80 の黒い壺が f でひっくり返り、中から**空っぽ**であることがわかる (何も出てこない)。役人が別の巻物を広げ直し、「無実」を示す朱の印がドンと押される。札「のちに」。皇女の後ろ姿に光が差す
// どこ: #80 と同じ宮中の一室の、のちの日。蔀戸 (しとみど) が上がって外の光が入り、御簾は巻き上げられて奥はもう空
// 演出: 真ん中の黒い壺が倒れて口がこちらを向き、中が空っぽと分かる。右の役人が気づいて壺を指さし、机の新しい巻物に朱の印がドンと押される。左の皇女の後ろ姿に窓の光が差す
// 動き: カメラがゆっくり引いて全体を見せる / f6〜16 壺が倒れて小さく跳ねる・口からホコリだけ / f8〜22 巻物が開く / f26〜30 印が落ちてドン / f32〜40 印が上がって朱の跡 / f28〜42 光の筋が強くなる
const Nm084: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const zoom = 1.06 - 0.06 * cam;
  const tip = easeOut(seg(f, 6, 16));
  const bounce = Math.sin(seg(f, 16, 24) * Math.PI) * 7;
  const rot = -98 * tip + bounce;
  const puff = seg(f, 15, 30);
  const unroll = easeOut(seg(f, 8, 22));
  const fall = seg(f, 26, 30);
  const lift = easeOut(seg(f, 32, 40));
  const sx = lerp(1560, 1700, lift);
  const sy = fall < 1 ? lerp(280, 640, fall * fall) : lerp(640, 470, lift);
  const mark = f >= 30;
  const don = seg(f, 30, 38);
  const light = seg(f, 28, 42);
  return (
    <Frame f={f} seed={4084} bg={C.room2Wall}>
      <g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
        {/* 壁と柱 */}
        <rect x={-60} y={-60} width={W + 120} height={700} fill={C.room2Wall} />
        {[700, 1060].map((px) => <rect key={px} x={px - 26} y={-60} width={52} height={700} fill={C.shuDark} stroke={ink} strokeWidth={5} />)}
        {/* 上がった蔀戸と外の光 (左上) */}
        <rect x={80} y={60} width={560} height={360} fill={C.skyWindow} stroke={ink} strokeWidth={6} />
        <path d="M 80 160 Q 300 120 640 170 L 640 420 L 80 420 Z" fill={C.willow} opacity={0.6} />
        <path d="M 70 60 L 650 60 L 690 -10 L 110 -10 Z" fill={C.plainWood} stroke={ink} strokeWidth={5} />
        <g stroke={C.plainWoodDark} strokeWidth={4}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={150 + k * 80} y1={-6} x2={120 + k * 80} y2={58} />)}
        </g>
        {/* 巻き上げた御簾 (奥は空) */}
        <rect x={1100} y={60} width={720} height={540} fill={C.roomWall} opacity={0.55} stroke={ink} strokeWidth={5} />
        <rect x={1090} y={40} width={740} height={60} rx={30} fill={C.misu} stroke={ink} strokeWidth={5} />
        <g stroke={C.misuDark} strokeWidth={3}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={1110 + i * 30} y1={44} x2={1110 + i * 30} y2={96} />)}</g>
        {[1160, 1760].map((tx) => (
          <g key={tx}>
            <line x1={tx} y1={100} x2={tx} y2={200} stroke={C.tassel} strokeWidth={8} />
            <path d={`M ${tx - 14} 200 L ${tx - 20} 260 L ${tx + 20} 260 L ${tx + 14} 200 Z`} fill={C.tassel} stroke={ink} strokeWidth={4} />
          </g>
        ))}
        {/* 床 */}
        <rect x={-60} y={640} width={W + 120} height={520} fill={C.room2Floor} />
        <line x1={-60} y1={640} x2={1980} y2={640} stroke={ink} strokeWidth={5} />
        <g stroke={C.room2Line} strokeWidth={4}>
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={960 + (i - 6) * 140} y1={640} x2={960 + (i - 6) * 420} y2={1120} />)}
        </g>
        {/* 窓からの光の筋 */}
        <path d="M 80 420 L 640 420 L 620 1100 L -60 1100 Z" fill={NP.glowCore} opacity={0.12 + 0.38 * light} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={100 + rnd(840, i) * 480 + Math.sin(f / 9 + i) * 10} cy={460 + ((rnd(841, i) * 600 + f * 2) % 600)} r={3 + rnd(842, i) * 3}
            fill={KRP.white} opacity={0.7 * light} />
        ))}
        {/* 台と倒れた壺 */}
        <ellipse cx={860} cy={792} rx={190} ry={24} fill={ink} opacity={0.25} />
        <path d="M 790 680 L 930 680 L 970 790 L 750 790 Z" fill={C.lacquer} stroke={ink} strokeWidth={5} />
        <rect x={740} y={780} width={240} height={16} rx={6} fill={C.lacquer} stroke={ink} strokeWidth={4} />
        <rect x={620} y={642} width={480} height={40} rx={8} fill={C.lacquer} stroke={ink} strokeWidth={5} />
        <rect x={632} y={646} width={456} height={10} fill={C.lacquerRed} />
        <ND1Jar x={900} y={646} s={1.15} rot={rot} inside={tip} light={light} />
        {/* 口から出てくるのはホコリだけ */}
        {puff > 0 && puff < 1 && [0, 1, 2, 3].map((k) => (
          <circle key={k} cx={680 - puff * (60 + k * 30)} cy={560 - k * 14 - puff * 30} r={10 + puff * (16 + k * 4)}
            fill={C.wallShade} opacity={0.7 * (1 - puff)} />
        ))}
        {/* からっぽの響き */}
        {f > 18 && [0, 1, 2].map((k) => {
          const u = ((f - 18) / 14 + k / 3) % 1;
          return <path key={k} d={`M ${640 - u * 120} ${510 - u * 30} q -26 40 0 80`} stroke={KRP.white} strokeWidth={5} fill="none"
            opacity={0.8 * (1 - u)} strokeLinecap="round" />;
        })}
        {/* 皇女の後ろ姿 (光の中) */}
        <ellipse cx={270} cy={880} rx={150} ry={40} fill={NP.glow} opacity={0.35 * light} />
        <ND1Princess x={270} y={880} s={1.05} f={f} wind={0.1} />
        {/* 気づいて壺を指さす役人 */}
        <ND1Kan x={1460} y={760} s={1.0} f={f} ph={3} face={f > 14 ? "surprised" : "normal"} pose="point" pointDir={-1} gaze={[-6, 2]} />
        {/* 文机と新しい巻物 */}
        <path d="M 1160 640 L 1780 640 L 1800 690 L 1140 690 Z" fill={C.deskLight} stroke={ink} strokeWidth={5} />
        <rect x={1140} y={690} width={660} height={90} fill={C.desk} stroke={ink} strokeWidth={5} />
        <rect x={1180} y={780} width={30} height={40} fill={C.deskDark} stroke={ink} strokeWidth={4} />
        <rect x={1730} y={780} width={30} height={40} fill={C.deskDark} stroke={ink} strokeWidth={4} />
        <path d={`M 1240 648 L ${1240 + 460 * unroll} 648 L ${1250 + 460 * unroll} 682 L 1230 682 Z`} fill={C.wall} stroke={ink} strokeWidth={4} />
        <rect x={1226 + 460 * unroll} y={642} width={30} height={46} rx={12} fill={C.lacquerRed} stroke={ink} strokeWidth={4} />
        <g stroke={ink} strokeWidth={3} opacity={0.75}>
          {Array.from({ length: Math.floor(unroll * 12) }, (_, k) => (
            <line key={k} x1={1262 + k * 22} y1={654} x2={1266 + k * 22} y2={676} strokeDasharray="6 4" />
          ))}
        </g>
        {/* 朱の印の跡 */}
        {mark && (
          <g transform={`translate(1560 664) scale(${1 + 0.15 * (1 - don)} 1)`}>
            <rect x={-62} y={-20} width={124} height={40} rx={4} fill="none" stroke={KRP.red} strokeWidth={6} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.red}
              transform="scale(1 0.9)">無実</text>
          </g>
        )}
        {/* ドンの衝撃線 */}
        {don > 0 && don < 1 && Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return <line key={k} x1={1560 + Math.cos(a) * (80 + don * 40)} y1={664 + Math.sin(a) * (34 + don * 20)}
            x2={1560 + Math.cos(a) * (120 + don * 60)} y2={664 + Math.sin(a) * (54 + don * 30)}
            stroke={KRP.red} strokeWidth={7} strokeLinecap="round" opacity={1 - don} />;
        })}
        {/* 印 (木の柄と朱の印面) */}
        <g transform={`translate(${sx} ${sy})`}>
          <rect x={-58} y={-26} width={116} height={30} rx={4} fill={KRP.red} stroke={ink} strokeWidth={5} />
          <rect x={-50} y={-90} width={100} height={66} rx={8} fill={C.plainWood} stroke={ink} strokeWidth={5} />
          <rect x={-18} y={-150} width={36} height={62} rx={14} fill={C.plainWoodDark} stroke={ink} strokeWidth={5} />
          <circle cx={0} cy={-158} r={22} fill={C.plainWood} stroke={ink} strokeWidth={5} />
        </g>
      </g>
      <TagPlate x={960} y={110} text="のちに" size={54} t={seg(f, 0, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #85 同じ年、もうひとり、名前を奪われた人がいます。
// 格: 並 / seed 4085
// 絵: 同じ都の空の下、場面が左へパンして、別の屋敷の門の前へ。門の扉に、まだ伏せられた名札がかかっている (裏返し)。札「同じ769年」
// どこ: 同じ奈良の都の昼の空の下。宮の朱の築地塀の前から、左へパンして、別の屋敷 (土塀に四脚門・松) の前へ
// 演出: 門の扉の真ん中に、まだ伏せられた (裏返しの) 名札がかかっている。門前を掃いていた下働きの男が手を止めて札を見上げる
// 動き: f0〜32 カメラが左へパン (宮の塀 → 屋敷の門) / 札がゆれる / f30〜40 風で札がくるりとねじれかけて、また裏のまま戻る / ？が浮かぶ / 屋根のカラス
const Nm085: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 32));
  const tx = lerp(-900, 0, pan);
  const gust = seg(f, 30, 40);
  const twist = Math.sin(gust * Math.PI) * 0.75;
  const swing = Math.sin(f / 11) * 4 + Math.sin(gust * Math.PI) * 8;
  const q = seg(f, 34, 42);
  return (
    <Frame f={f} seed={4085} bg={C.skyDay}>
      <defs>
        <linearGradient id="nd1-85-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyDay} />
          <stop offset="1" stopColor={C.skyDayLow} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#nd1-85-sky)" />
      {/* 遠景 (ゆっくり動く) */}
      <g transform={`translate(${tx * 0.3} 0)`}>
        <path d="M -400 470 Q -100 380 200 440 Q 500 360 800 430 Q 1100 370 1400 430 Q 1700 360 2000 420 Q 2300 370 2700 440 L 2700 640 L -400 640 Z"
          fill={C.mtFar} stroke={ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={200 + i * 700 + ((f * 0.6) % 200)} cy={140 + i * 40} rx={130} ry={34} fill={KRP.white} opacity={0.8} stroke={ink} strokeWidth={3} />
        ))}
      </g>
      <g transform={`translate(${tx} 0)`}>
        {/* 道 */}
        <rect x={-300} y={640} width={3400} height={500} fill={C.road} />
        <line x1={-300} y1={640} x2={3100} y2={640} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={-200 + rnd(850, i) * 3200} cy={670 + rnd(851, i) * 380} r={3 + rnd(852, i) * 4} fill={C.roadDark} />
        ))}
        {/* 右: 宮の朱の築地塀と、その奥の殿舎 */}
        <ND1Roof x={2360} y={330} w={760} h={110} ridge={0.6} shibi />
        <rect x={2020} y={330} width={680} height={110} fill={C.wall} stroke={ink} strokeWidth={4} />
        {[2060, 2200, 2340, 2480, 2620].map((px) => <rect key={px} x={px - 10} y={330} width={20} height={110} fill={C.shu} stroke={ink} strokeWidth={3} />)}
        <rect x={1780} y={440} width={1300} height={200} fill={C.wall} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1800 + i * 130} y={440} width={22} height={200} fill={C.shu} stroke={ink} strokeWidth={4} />)}
        <rect x={1770} y={418} width={1320} height={26} rx={6} fill={C.tile} stroke={ink} strokeWidth={4} />
        {/* 屋敷の奥の松 */}
        {[380, 1500].map((px, i) => (
          <g key={px} transform={`translate(${px} 440)`}>
            <path d="M -14 0 Q -24 -120 10 -220 L 26 -214 Q 4 -110 14 0 Z" fill={C.trunk} stroke={ink} strokeWidth={5} />
            {[[-80, -180, 110], [60, -240, 120], [-20, -290, 90]].map(([cx, cy, rw], k) => (
              <ellipse key={k} cx={cx + Math.sin(f / 18 + i + k) * 3} cy={cy} rx={rw} ry={38} fill={k % 2 ? C.pine : C.pineDark} stroke={ink} strokeWidth={4.5} />
            ))}
          </g>
        ))}
        {/* 屋敷の土塀 (筋の入った築地塀) */}
        {[[160, 790], [1130, 1780]].map(([a, b], i) => (
          <g key={i}>
            <rect x={a} y={440} width={b - a} height={200} fill={C.mud} stroke={ink} strokeWidth={5} />
            <g stroke={KRP.white} strokeWidth={5} opacity={0.75}>
              {[480, 510, 540].map((ly) => <line key={ly} x1={a + 6} y1={ly} x2={b - 6} y2={ly} />)}
            </g>
            <rect x={a - 10} y={418} width={b - a + 20} height={26} rx={6} fill={C.tile} stroke={ink} strokeWidth={4} />
          </g>
        ))}
        {/* 四脚門 */}
        <ND1Roof x={960} y={370} w={560} h={110} ridge={0.55} />
        <rect x={760} y={370} width={400} height={30} fill={C.plainWood} stroke={ink} strokeWidth={5} />
        {[790, 1130].map((px) => <rect key={px} x={px - 18} y={396} width={36} height={248} fill={C.plainWood} stroke={ink} strokeWidth={5} />)}
        {[-1, 1].map((sd) => {
          const x0 = sd < 0 ? 808 : 960;
          return (
            <g key={sd}>
              <rect x={x0} y={400} width={152} height={240} fill={C.plainWoodDark} stroke={ink} strokeWidth={5} />
              {[0, 1, 2, 3].map((k) => <line key={k} x1={x0 + 38 * (k + 1)} y1={402} x2={x0 + 38 * (k + 1)} y2={638} stroke={ink} strokeWidth={3} opacity={0.5} />)}
              {[440, 520, 600].map((ry) => (
                <g key={ry}>
                  <rect x={x0 + 4} y={ry - 6} width={144} height={12} fill={C.stud} opacity={0.8} />
                  {[0, 1, 2, 3].map((k) => <circle key={k} cx={x0 + 22 + k * 36} cy={ry} r={6} fill={C.goldDark} stroke={ink} strokeWidth={2} />)}
                </g>
              ))}
            </g>
          );
        })}
        <rect x={900} y={636} width={120} height={12} fill={C.stoneDark} stroke={ink} strokeWidth={3} />
        {/* 門にかかった、伏せられた名札 (裏の白木。字はまだ見せない) */}
        <circle cx={960} cy={420} r={8} fill={C.goldDark} stroke={ink} strokeWidth={3} />
        <g transform={`rotate(${swing} 960 420)`}>
          <path d="M 960 420 L 920 462 M 960 420 L 1000 462" stroke={C.sash} strokeWidth={5} fill="none" />
          <g transform={`translate(960 0) scale(${1 - twist} 1) translate(-960 0)`}>
            <rect x={880} y={458} width={160} height={150} rx={12} fill={twist > 0.5 ? C.mokkanDark : C.mokkan} stroke={ink} strokeWidth={6} />
            <g stroke={C.mokkanGrain} strokeWidth={4} fill="none">
              <path d="M 894 492 q 40 -6 80 0 q 30 6 52 -2" />
              <path d="M 894 540 q 50 6 100 0 q 20 -4 32 2" />
              <path d="M 900 580 q 30 -4 60 0" />
            </g>
          </g>
        </g>
        {/* 門前を掃いていた下働きの男 */}
        <g>
          <line x1={500} y1={800} x2={610} y2={600} stroke={ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={500} y1={800} x2={610} y2={600} stroke={C.mokkanDark} strokeWidth={8} strokeLinecap="round" />
          <path d="M 470 792 L 530 806 L 512 836 L 452 822 Z" fill={C.basket} stroke={ink} strokeWidth={4} />
        </g>
        <Person x={560} y={800} s={0.8} cloth={C.servant} clothDark={C.servantDark} f={f} phase={2}
          face={q > 0 ? "surprised" : "normal"} gaze={[6, -5]} pose="hold" />
        {/* 屋根のカラス */}
        <g transform={`translate(1150 ${252 + Math.sin(f / 7) * 2})`}>
          <ellipse cx={0} cy={0} rx={30} ry={20} fill={C.hair} stroke={ink} strokeWidth={4} />
          <circle cx={-26} cy={-14} r={14} fill={C.hair} stroke={ink} strokeWidth={4} />
          <path d="M -40 -14 L -56 -10 L -40 -6 Z" fill={C.gold} stroke={ink} strokeWidth={2} />
          <circle cx={-28} cy={-16} r={3} fill={KRP.white} />
          <path d="M 24 -4 L 52 -16 L 46 6 Z" fill={C.hair} stroke={ink} strokeWidth={3} />
          <line x1={-6} y1={18} x2={-6} y2={30} stroke={ink} strokeWidth={4} />
          <line x1={8} y1={18} x2={8} y2={30} stroke={ink} strokeWidth={4} />
        </g>
        <QMark x={1110} y={500} s={0.7} f={f} t={q} />
        {/* 風の線 */}
        {gust > 0 && gust < 1 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${700 + gust * 300 + k * 30} ${470 + k * 50} q 60 -16 120 0`} stroke={KRP.grayDark} strokeWidth={5}
            fill="none" opacity={Math.sin(gust * Math.PI)} strokeLinecap="round" />
        ))}
      </g>
      <TagPlate x={1620} y={130} text="同じ769年" size={46} t={seg(f, 28, 38)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_078: (f) => <Nm078 f={f} />,
  nm_079: (f) => <Nm079 f={f} />,
  nm_080: (f) => <Nm080 f={f} />,
  nm_081: (f) => <Nm081 f={f} />,
  nm_082: (f) => <Nm082 f={f} />,
  nm_083: (f) => <Nm083 f={f} />,
  nm_084: (f) => <Nm084 f={f} />,
  nm_085: (f) => <Nm085 f={f} />,
};

export const NM_D1_MOTIFS: string[] = [
  "nm_078", // #78
  "nm_079", // #79
  "nm_080", // #80
  "nm_081", // #81
  "nm_082", // #82
  "nm_083", // #83
  "nm_084", // #84
  "nm_085", // #85
];

export const namaeD1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
