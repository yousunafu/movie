// 人は、なぜ暇をつぶすのか: 文#36〜#47 (12文)
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
  // ソ連の公園・工場
  skyGray: "#C8D0D6", skySun: "#A8D4EC", cloud: "#F4F2EC", cloudGray: "#AEB5BA",
  grass: "#9DB86E", grassDark: "#7A9A52", hedge: "#5E8A4E", hedgeDark: "#466E3A",
  path: "#DCC89E", pathDark: "#C2AA7C",
  leafOr: "#E39440", leafRed: "#C95A3C", leafYel: "#E9C44C",
  trunk: "#7A5236", trunkDark: "#563824",
  panel: "#CFC9BD", panelDark: "#A9A193", glass: "#9DB6C8", glassDark: "#3C4656",
  stone: "#C4BDB0", stoneDark: "#9A9284", water: "#8CC4DE", waterLight: "#DDF2FB",
  benchWood: "#B07A48", benchIron: "#4B4F55",
  sov: "#6F8398", sovDark: "#4F6276", mom: "#8C7E96", momDark: "#6A5C74",
  scarf: "#A8553C", scarfDark: "#7C3C28",
  kid: "#F0C43A", kidDark: "#C49A22", friend: "#6FA86A", friendDark: "#4F8448",
  friendMom: "#C77E6A", friendMomDark: "#9C5C4A",
  armband: "#C8412F",
  basket: "#C99A5A", basketDark: "#93683A", check: "#D9574A",
  blanket: "#E9C1A8",
  concrete: "#D3CCBF", concreteDark: "#ADA595", cork: "#C9A46E", boardWood: "#8E6A44", floorDark: "#8B8478",
  paperOld: "#EDE3C8",
  // 江戸
  ai: "#3F5C86", aiDark: "#2C4366", momohiki: "#8A6A48", momohikiDark: "#6A4E32",
  shibucha: "#7A5C3E", shibuchaDark: "#5A422A", jochu: "#B0576A", jochuDark: "#863E50",
  plum: "#8E6E96", plumDark: "#6C5074",
  kaya: "#CDB06E", kayaDark: "#9E8448", tsuchi: "#C1A274", tsuchiDark: "#9A7C52",
  paddy: "#A7D0C6", paddyDark: "#7FAE9F", ine: "#A9C25C", ineDark: "#7E9A3C", ineGold: "#E3C25A",
  mtFar: "#B9CABB", mtNear: "#93AE92", mori: "#4F7A4C", moriDark: "#3A5E38", torii: "#D2503A",
  edoWood: "#8A5E3A", edoWoodDark: "#5E3E24", shoji: "#F4EEDC", noren: "#34507A", norenDark: "#22385C",
  tatami: "#D9CB8E", tatamiDark: "#B8A86A", tile: "#5E636B", tileDark: "#43474E", doma: "#4A3A2C",
  furoshiki: "#5E9A6A", furoshikiDark: "#3E7448", eveSky: "#F2D2A2", eveSky2: "#E9B585",
  // 地獄
  hellTop: "#B8432F", hellMid: "#E27A48", hellLow: "#F2B068", rock: "#9C4A3A", rockDark: "#6E3228",
  flame: "#F2A33A", flameCore: "#FFD866", kama: "#4A4A52", kamaDark: "#2F2F36", yu: "#E8946A",
  enma: "#D9553F", enmaDark: "#A83A2A", robe: "#3E3A48", desk: "#B5402F", deskDark: "#7E2A1E",
  oniB: "#7FA8D8", oniBDark: "#567FB0", oniR: "#E88A6E", oniRDark: "#B4553F", tiger: "#F2C14A",
  steam: "#FBF6EE", gold: "#D9B23C",
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
const ink = KRP.ink;

// -------------------------------------------------------------------
// HmBbWear — Person の上に重ねる衣装 (着物のすそ・帯・前かけ・鉢巻・髷・まげ・スカーフ・作業帽)
//   Person と同じ x,y,s,f,phase,lean を渡す (ゆれを合わせる)
// -------------------------------------------------------------------
type WearP = {
  x: number; y: number; s?: number; f: number; phase?: number; lean?: number; still?: boolean;
  robe?: string; obi?: string; apron?: string; collar?: string; mode?: "stand" | "sit" | "run";
  hachimaki?: string; topknot?: string; bun?: string; scarf?: string; scarfDark?: string; cap?: string; capDark?: string;
  grayHair?: boolean;
};
const HmBbWear: React.FC<WearP> = ({
  x, y, s = 1, f, phase = 0, lean = 0, still = false, robe, obi, apron, collar, mode = "stand",
  hachimaki, topknot, bun, scarf, scarfDark, cap, capDark, grayHair,
}) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  const apB = mode === "stand" ? -24 : mode === "sit" ? -46 : -40;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {robe && mode === "stand" && <path d="M -57 -64 L -63 -16 Q 0 -8 63 -16 L 57 -64 Z" fill={robe} stroke={ink} strokeWidth={4.5} />}
      {robe && mode === "sit" && <path d="M -57 -66 L -60 -42 Q 0 -34 60 -42 L 57 -66 Z" fill={robe} stroke={ink} strokeWidth={4.5} />}
      {robe && mode === "run" && <path d="M -57 -64 L -60 -34 Q 0 -26 60 -34 L 57 -64 Z" fill={robe} stroke={ink} strokeWidth={4.5} />}
      {collar && (
        <g fill="none" strokeLinejoin="round">
          <path d="M -32 -160 L 0 -108 L 32 -160" stroke={ink} strokeWidth={13} />
          <path d="M -32 -160 L 0 -108 L 32 -160" stroke={collar} strokeWidth={6} />
        </g>
      )}
      {apron && <path d={`M -42 -104 L 42 -104 L 47 ${apB} L -47 ${apB} Z`} fill={apron} stroke={ink} strokeWidth={4} />}
      {obi && <rect x={-58} y={-98} width={116} height={22} fill={obi} stroke={ink} strokeWidth={4} />}
      {cap && (
        <g>
          <path d="M -66 -254 Q -62 -312 0 -316 Q 62 -312 66 -254 Z" fill={cap} stroke={ink} strokeWidth={5} />
          <path d="M -70 -256 Q 0 -244 92 -252 Q 100 -242 88 -236 Q 0 -232 -70 -246 Z" fill={capDark ?? cap} stroke={ink} strokeWidth={5} />
          <circle cx={0} cy={-314} r={6} fill={capDark ?? cap} stroke={ink} strokeWidth={3} />
        </g>
      )}
      {scarf && (
        <g>
          <path d="M -72 -226 Q -76 -304 0 -306 Q 76 -304 72 -226 Q 62 -262 0 -266 Q -62 -262 -72 -226 Z" fill={scarf} stroke={ink} strokeWidth={5} />
          <path d="M -72 -228 Q -78 -186 -36 -164 L -28 -176 Q -58 -194 -60 -228 Z" fill={scarfDark ?? scarf} stroke={ink} strokeWidth={4} />
          <path d="M 72 -228 Q 78 -186 36 -164 L 28 -176 Q 58 -194 60 -228 Z" fill={scarfDark ?? scarf} stroke={ink} strokeWidth={4} />
          <path d="M -12 -168 L 12 -168 L 20 -146 L 0 -156 L -20 -146 Z" fill={scarfDark ?? scarf} stroke={ink} strokeWidth={4} />
          {[-40, -10, 22, 50].map((dx, i) => <circle key={i} cx={dx} cy={-284 + (i % 2) * 10} r={5} fill={KRP.white} opacity={0.7} />)}
        </g>
      )}
      {grayHair && (
        <g fill={KRP.gray} stroke={ink} strokeWidth={3}>
          <path d="M -64 -250 Q -72 -212 -58 -192 Q -50 -220 -54 -248 Z" />
          <path d="M 64 -250 Q 72 -212 58 -192 Q 50 -220 54 -248 Z" />
        </g>
      )}
      {hachimaki && (
        <g>
          <path d="M -64 -262 Q 0 -278 64 -262 L 64 -246 Q 0 -262 -64 -246 Z" fill={hachimaki} stroke={ink} strokeWidth={3.5} />
          <path d="M 60 -256 l 30 -18 l 6 12 Z" fill={hachimaki} stroke={ink} strokeWidth={3} />
          <path d="M 60 -252 l 28 12 l -8 10 Z" fill={hachimaki} stroke={ink} strokeWidth={3} />
        </g>
      )}
      {topknot && (
        <g>
          <rect x={-9} y={-318} width={18} height={32} rx={7} fill={topknot} stroke={ink} strokeWidth={2} />
          <rect x={-11} y={-302} width={22} height={6} fill={KRP.white} />
        </g>
      )}
      {bun && (
        <g>
          <circle cx={0} cy={-300} r={27} fill={ink} />
          <rect x={-36} y={-308} width={72} height={9} rx={4} fill={bun} stroke={ink} strokeWidth={2.5} />
          <circle cx={30} cy={-318} r={6} fill={KRP.red} stroke={ink} strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

// 地面の影
const HmBbShadow: React.FC<{ x: number; y: number; rx: number; o?: number }> = ({ x, y, rx, o = 0.18 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.18} fill={ink} opacity={o} />
);

// -------------------------------------------------------------------
// HmBbPark — ソ連の公園 (#36 くもり・平日 / #38 晴れ・日曜)。同じ場所・同じ配置
//   ベンチの座面 y=702 (真ん中 x=960)。噴水 (1450, 620)。友だちの家の窓 (608, 332)
// -------------------------------------------------------------------
const HmBbTree: React.FC<{ x: number; y: number; f: number; k: number }> = ({ x, y, f, k }) => (
  <g>
    <path d={`M ${x - 34} ${y} L ${x - 22} ${y - 380} L ${x + 22} ${y - 380} L ${x + 34} ${y} Z`} fill={C.trunk} stroke={ink} strokeWidth={6} />
    <path d={`M ${x} ${y - 300} L ${x - 90} ${y - 400} M ${x + 6} ${y - 340} L ${x + 80} ${y - 430}`} stroke={C.trunkDark} strokeWidth={14} strokeLinecap="round" />
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const cx = x + Math.cos(a) * 120 + Math.sin(f / 30 + i) * 3;
      const cy = y - 460 + Math.sin(a) * 80;
      return <circle key={i} cx={cx} cy={cy} r={78 + rnd(k, i) * 30}
        fill={[C.leafOr, C.leafRed, C.leafYel][(i + k) % 3]} stroke={ink} strokeWidth={5} />;
    })}
    <circle cx={x} cy={y - 470} r={100} fill={C.leafOr} stroke={ink} strokeWidth={5} />
    {Array.from({ length: 7 }, (_, i) => (
      <ellipse key={i} cx={x - 100 + i * 34} cy={y - 500 + (i % 2) * 50} rx={9} ry={5} fill={C.leafRed} transform={`rotate(${i * 30} ${x - 100 + i * 34} ${y - 500 + (i % 2) * 50})`} />
    ))}
  </g>
);

const HmBbBench: React.FC = () => (
  <g>
    {[790, 1130].map((px) => <rect key={px} x={px - 9} y={590} width={18} height={130} fill={C.benchIron} stroke={ink} strokeWidth={4} />)}
    <rect x={760} y={596} width={400} height={24} rx={6} fill={C.benchWood} stroke={ink} strokeWidth={5} />
    <rect x={760} y={632} width={400} height={24} rx={6} fill={C.benchWood} stroke={ink} strokeWidth={5} />
    <rect x={748} y={700} width={424} height={24} rx={6} fill={C.benchWood} stroke={ink} strokeWidth={5} />
    {[780, 1140].map((px) => (
      <path key={px} d={`M ${px} 722 Q ${px + (px < 900 ? -18 : 18)} 760 ${px + (px < 900 ? -10 : 10)} 800`} stroke={C.benchIron} strokeWidth={14} fill="none" strokeLinecap="round" />
    ))}
    <ellipse cx={960} cy={806} rx={240} ry={18} fill={ink} opacity={0.12} />
  </g>
);

const HmBbPark: React.FC<{ f: number; sunny: boolean }> = ({ f, sunny }) => {
  const drift = f * 0.4;
  return (
    <g>
      <rect x={-40} y={-40} width={2000} height={640} fill={sunny ? C.skySun : C.skyGray} />
      {sunny ? (
        <g transform={`translate(1290 110) rotate(${f * 0.6})`}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={0} y1={-86} x2={0} y2={-118} stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 36})`} />
          ))}
          <circle r={66} fill={KRP.yellow} stroke={ink} strokeWidth={5} />
        </g>
      ) : null}
      {[[300, 90, 1], [980, 70, 1.3], [1500, 120, 0.9]].map(([cx, cy, sc], i) => (
        <g key={i} transform={`translate(${cx + drift * (i + 1) * 0.5} ${cy}) scale(${sc})`}>
          {[-70, 0, 70].map((dx, j) => <ellipse key={j} cx={dx} cy={j === 1 ? -20 : 0} rx={70} ry={42}
            fill={sunny ? C.cloud : C.cloudGray} stroke={ink} strokeWidth={4} />)}
        </g>
      ))}
      {/* 奥の工場 (平日は煙が出る) */}
      <g>
        <rect x={1160} y={340} width={340} height={230} fill={C.concreteDark} stroke={ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${1160 + i * 85} 340 l 42 -50 l 43 50`} fill={C.panelDark} stroke={ink} strokeWidth={5} />)}
        <rect x={1410} y={170} width={46} height={200} fill={C.stoneDark} stroke={ink} strokeWidth={6} />
        <rect x={1410} y={200} width={46} height={16} fill={KRP.red} />
        {!sunny && Array.from({ length: 5 }, (_, i) => {
          const p = ((f * 0.9 + i * 14) % 70) / 70;
          return <circle key={i} cx={1433 + p * 120 + Math.sin(p * 6) * 10} cy={160 - p * 140} r={20 + p * 34}
            fill={C.cloudGray} stroke={ink} strokeWidth={3} opacity={0.9 - p * 0.7} />;
        })}
      </g>
      {/* 団地 (パネルの集合住宅) と屋上の赤い星 */}
      <g>
        <rect x={200} y={150} width={700} height={420} fill={C.panel} stroke={ink} strokeWidth={7} />
        <g stroke={C.panelDark} strokeWidth={3}>
          {[1, 2, 3, 4].map((r) => <line key={r} x1={200} y1={150 + r * 76} x2={900} y2={150 + r * 76} />)}
        </g>
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
          const wx = 236 + c * 92, wy = 172 + r * 76;
          const isFriend = c === 4 && r === 2;
          return (
            <g key={`${r}-${c}`}>
              <rect x={wx} y={wy} width={64} height={48} fill={isFriend && !sunny ? C.glassDark : C.glass} stroke={ink} strokeWidth={4} />
              <line x1={wx + 32} y1={wy} x2={wx + 32} y2={wy + 48} stroke={ink} strokeWidth={3} />
              <rect x={wx - 4} y={wy + 46} width={72} height={8} fill={C.panelDark} stroke={ink} strokeWidth={2} />
            </g>
          );
        }))}
        {/* 屋上の赤い星 */}
        <g transform="translate(550 112)">
          <rect x={-4} y={0} width={8} height={40} fill={C.benchIron} />
          <path d="M 0 -42 L 11 -13 L 42 -13 L 17 5 L 26 36 L 0 18 L -26 36 L -17 5 L -42 -13 L -11 -13 Z" fill={KRP.red} stroke={ink} strokeWidth={4} />
        </g>
      </g>
      {/* 地面 */}
      <rect x={-40} y={560} width={2000} height={560} fill={C.grass} />
      <path d="M 460 1120 Q 700 780 960 720 Q 1220 660 1960 660 L 1960 740 Q 1300 750 1120 800 Q 920 880 900 1120 Z" fill={C.path} />
      <path d="M 460 1120 Q 700 780 960 720 Q 1220 660 1960 660" stroke={C.pathDark} strokeWidth={5} fill="none" />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={i} cx={-20 + i * 130} cy={576} rx={80} ry={30} fill={i % 2 ? C.hedge : C.hedgeDark} stroke={ink} strokeWidth={4} />
      ))}
      {/* 地面の落ち葉 */}
      {Array.from({ length: 26 }, (_, i) => (
        <ellipse key={i} cx={rnd(36, i) * 1900} cy={640 + rnd(37, i) * 400} rx={12} ry={6}
          fill={[C.leafOr, C.leafRed, C.leafYel][i % 3]} transform={`rotate(${rnd(38, i) * 180} ${rnd(36, i) * 1900} ${640 + rnd(37, i) * 400})`} />
      ))}
      {/* 噴水 */}
      <g>
        <ellipse cx={1450} cy={650} rx={240} ry={52} fill={C.stoneDark} stroke={ink} strokeWidth={6} />
        <rect x={1210} y={600} width={480} height={50} fill={C.stone} stroke={ink} strokeWidth={6} />
        <ellipse cx={1450} cy={600} rx={240} ry={44} fill={C.stone} stroke={ink} strokeWidth={6} />
        <ellipse cx={1450} cy={602} rx={212} ry={32} fill={C.water} />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={1450} cy={604} rx={60 + ((f * 2 + i * 50) % 150)} ry={(60 + ((f * 2 + i * 50) % 150)) * 0.15}
          fill="none" stroke={C.waterLight} strokeWidth={3} opacity={1 - ((f * 2 + i * 50) % 150) / 150} />)}
        <rect x={1432} y={470} width={36} height={134} fill={C.stone} stroke={ink} strokeWidth={5} />
        <ellipse cx={1450} cy={472} rx={92} ry={22} fill={C.stone} stroke={ink} strokeWidth={5} />
        {sunny ? (
          <g fill="none" strokeLinecap="round">
            <path d={`M 1450 466 L 1450 ${330 + Math.sin(f / 3) * 8}`} stroke={C.waterLight} strokeWidth={14} />
            <path d={`M 1450 466 L 1450 ${330 + Math.sin(f / 3) * 8}`} stroke={C.water} strokeWidth={5} />
            {[-1, 1].map((d) => (
              <g key={d}>
                <path d={`M 1450 ${336 + Math.sin(f / 3) * 8} Q ${1450 + d * 120} 300 ${1450 + d * 180} 590`} stroke={C.waterLight} strokeWidth={10}
                  strokeDasharray="26 14" strokeDashoffset={-f * 6} />
                <path d={`M 1460 470 Q ${1450 + d * 70} 450 ${1450 + d * 96} 596`} stroke={C.water} strokeWidth={6} strokeDasharray="14 10" strokeDashoffset={-f * 5} />
              </g>
            ))}
          </g>
        ) : (
          <circle cx={1450 + 80} cy={500 + ((f * 3) % 96)} r={5} fill={C.water} />
        )}
      </g>
      {/* 街灯 */}
      <g>
        <rect x={1172} y={330} width={16} height={330} fill={C.benchIron} stroke={ink} strokeWidth={4} />
        <path d="M 1150 330 L 1210 330 L 1196 290 L 1164 290 Z" fill={C.benchIron} stroke={ink} strokeWidth={4} />
        <circle cx={1180} cy={312} r={14} fill={sunny ? KRP.white : KRP.yellow} opacity={0.9} />
      </g>
      <HmBbTree x={120} y={700} f={f} k={1} />
      <HmBbTree x={1820} y={690} f={f} k={2} />
      <HmBbBench />
    </g>
  );
};

// -------------------------------------------------------------------
// HmBbMark — 行事のしるし (提灯 / 門松 / 盆の灯籠)
// -------------------------------------------------------------------
const HmBbMark: React.FC<{ kind: "pine" | "lantern" | "toro"; x: number; y: number; s?: number; t?: number; f?: number }> = ({
  kind, x, y, s = 1, t = 1, f = 0,
}) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0.001) return null;
  const sw = Math.sin(f / 8 + x) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${kind === "lantern" ? sw : 0})`}>
      {kind === "lantern" && (
        <g>
          <line x1={0} y1={-52} x2={0} y2={-40} stroke={ink} strokeWidth={4} />
          <rect x={-14} y={-42} width={28} height={9} rx={2} fill={ink} />
          <ellipse cx={0} cy={-6} rx={24} ry={32} fill={KRP.red} stroke={ink} strokeWidth={4} />
          {[-18, -6, 6, 18].map((dy) => <path key={dy} d={`M -22 ${dy} Q 0 ${dy + 5} 22 ${dy}`} stroke={ink} strokeWidth={2} fill="none" opacity={0.5} />)}
          <ellipse cx={-8} cy={-14} rx={6} ry={12} fill={KRP.white} opacity={0.45} />
          <rect x={-14} y={22} width={28} height={9} rx={2} fill={ink} />
        </g>
      )}
      {kind === "pine" && (
        <g>
          <path d="M -12 -10 L -12 -46 L 0 -56 L 0 -10 Z" fill="#6FAE5A" stroke={ink} strokeWidth={3.5} />
          <path d="M 2 -10 L 2 -38 L 14 -48 L 14 -10 Z" fill="#6FAE5A" stroke={ink} strokeWidth={3.5} />
          <path d="M -26 -10 L -26 -30 L -14 -40 L -14 -10 Z" fill="#6FAE5A" stroke={ink} strokeWidth={3.5} />
          {[-26, 12].map((px, i) => <path key={i} d={`M ${px} -26 l 10 -14 l 10 14 l -10 -6 Z`} fill="#2F6B3A" stroke={ink} strokeWidth={2.5} />)}
          <path d="M -32 -12 L 32 -12 L 26 30 L -26 30 Z" fill="#D9B86A" stroke={ink} strokeWidth={4} />
          {[-18, -6, 6, 18].map((px) => <line key={px} x1={px} y1={-10} x2={px} y2={28} stroke={ink} strokeWidth={2} opacity={0.5} />)}
          <rect x={-34} y={2} width={68} height={7} fill={KRP.red} stroke={ink} strokeWidth={2} />
        </g>
      )}
      {kind === "toro" && (
        <g>
          <path d="M -30 -34 L 0 -52 L 30 -34 Z" fill={C.edoWoodDark} stroke={ink} strokeWidth={4} />
          <rect x={-22} y={-34} width={44} height={50} fill="#FFF2C8" stroke={ink} strokeWidth={4} />
          <rect x={-22} y={-34} width={44} height={50} fill={KRP.yellow} opacity={0.3 + 0.2 * Math.sin(f / 5)} />
          <line x1={0} y1={-34} x2={0} y2={16} stroke={ink} strokeWidth={2.5} />
          <rect x={-28} y={16} width={56} height={10} fill={C.edoWoodDark} stroke={ink} strokeWidth={4} />
          <path d="M -10 26 L -16 38 M 10 26 L 16 38" stroke={ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// -------------------------------------------------------------------
// HmBbKoyomi — 商家の柱の暦 (#43 と #46 で同じ物)。12か月が1枚の紙に並ぶ。
//   x,y: 紙の中心。紙は 280×420。1月と7月の16日に赤い点。札は紙の右に出る
//   glow: 2つの札の光 (0〜1) / extra: 足される小札の進み (#46 で使う 0〜1)
// -------------------------------------------------------------------
const KOYO_ROW = (i: number) => -140 + i * 29;
const KOYO_DX = (d: number) => -88 + ((d - 1) / 29) * 210;
const HmBbKoyomi: React.FC<{ x: number; y: number; s?: number; f: number; glow?: number; extra?: number }> = ({
  x, y, s = 1, f, glow = 1, extra = 0,
}) => {
  const sw = Math.sin(f / 14) * 0.8;
  const EXTRA: [number, number, "pine" | "lantern" | "toro"][] = [[0, 2, "pine"], [6, 13, "toro"], [8, 9, "lantern"], [10, 22, "lantern"]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sw})`}>
      {/* 釘とひも */}
      <path d="M -60 -212 L 0 -252 L 60 -212" stroke={ink} strokeWidth={4} fill="none" />
      <circle cx={0} cy={-254} r={9} fill={KRP.brass} stroke={ink} strokeWidth={3} />
      {/* 紙 */}
      <rect x={-132} y={-202} width={280} height={420} fill={ink} opacity={0.15} />
      <rect x={-140} y={-210} width={280} height={420} rx={4} fill={C.paperOld} stroke={ink} strokeWidth={6} />
      <rect x={-140} y={-210} width={280} height={52} rx={4} fill={HP.rest} stroke={ink} strokeWidth={6} />
      <text x={0} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.white}>暦</text>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <text x={-112} y={KOYO_ROW(i) + 9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={ink}>{i + 1}</text>
          <line x1={-92} y1={KOYO_ROW(i) + 13} x2={126} y2={KOYO_ROW(i) + 13} stroke={KRP.gray} strokeWidth={2} />
          {Array.from({ length: 30 }, (_, d) => (
            <rect key={d} x={KOYO_DX(d + 1) - 2} y={KOYO_ROW(i) - 4} width={4} height={8} fill={ink} opacity={0.35} />
          ))}
        </g>
      ))}
      {/* 藪入りの2日 (1月16日・7月16日) */}
      {[0, 6].map((row, k) => {
        const yy = KOYO_ROW(row);
        const ty = k === 0 ? -120 : 30;
        return (
          <g key={row}>
            <circle cx={KOYO_DX(16)} cy={yy} r={11} fill={HP.rest} stroke={ink} strokeWidth={3} />
            <path d={`M ${KOYO_DX(16) + 10} ${yy} Q 150 ${yy} 170 ${ty}`} stroke={HP.rest} strokeWidth={4} fill="none" opacity={glow} />
            <rect x={160} y={ty - 40} width={220} height={80} rx={18} fill={HP.rest} opacity={glow * (0.25 + 0.15 * Math.sin(f / 4 + k))} />
          </g>
        );
      })}
      <TagPlate x={270} y={-120} text="1月16日" size={30} t={glow} color={HP.rest} fill={KRP.white} />
      <TagPlate x={270} y={30} text="7月16日" size={30} t={glow} color={HP.rest} fill={KRP.white} />
      {/* 足される小札 (祭り・盆・正月) */}
      {EXTRA.map(([row, d, kind], k) => {
        const tt = clamp01(extra * EXTRA.length - k);
        if (tt <= 0) return null;
        return (
          <g key={k}>
            <circle cx={KOYO_DX(d)} cy={KOYO_ROW(row)} r={9} fill={HP.restSoft} stroke={HP.rest} strokeWidth={3} opacity={tt} />
            <g transform={`translate(${KOYO_DX(d)} ${KOYO_ROW(row) + (row === 0 ? 62 : -6)})`}>
              <rect x={-20} y={-52} width={40} height={48} rx={6} fill={KRP.white} stroke={ink} strokeWidth={3}
                transform={`scale(${pop(tt)})`} opacity={tt} />
              <HmBbMark kind={kind} x={0} y={-30} s={0.42} t={tt} f={f} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

// -------------------------------------------------------------------
// HmBbEnma — えんま様 (赤い顔の大きな像。少しとぼけた顔)。足元 (0,0)・頭の中心 (0,-280)・顔の半径74
//   yawn: あくびの口 (0〜1) / eyes: "sleepy" 半目 | "joy" にっこり閉じ目 / crown: 冠をかぶるか / fan: 扇の角度 (なしは undefined)
// -------------------------------------------------------------------
const HmBbEnma: React.FC<{ yawn?: number; eyes?: "sleepy" | "joy"; crown?: boolean; fan?: number }> = ({
  yawn = 0, eyes = "sleepy", crown = false, fan,
}) => (
  <g>
    {/* 左腕 (袖) */}
    <path d="M -96 -196 Q -150 -150 -150 -70 L -100 -60 Q -104 -130 -80 -160 Z" fill={C.robe} stroke={ink} strokeWidth={6} />
    <circle cx={-128} cy={-62} r={22} fill={C.enma} stroke={ink} strokeWidth={5} />
    {/* 胴 (黒い衣) */}
    <path d="M -98 -206 Q -124 -100 -112 0 L 112 0 Q 124 -100 98 -206 Q 0 -226 -98 -206 Z" fill={C.robe} stroke={ink} strokeWidth={7} />
    <path d="M -50 -214 L 0 -120 L 50 -214" fill="none" stroke={ink} strokeWidth={20} strokeLinejoin="round" />
    <path d="M -50 -214 L 0 -120 L 50 -214" fill="none" stroke={C.gold} strokeWidth={11} strokeLinejoin="round" />
    <rect x={-112} y={-112} width={224} height={26} fill={C.desk} stroke={ink} strokeWidth={5} />
    {[-70, -20, 30, 80].map((px) => <circle key={px} cx={px} cy={-99} r={5} fill={C.gold} />)}
    {/* 右腕 (扇を持つ) */}
    {fan !== undefined ? (
      <g>
        <path d="M 92 -196 Q 150 -190 156 -250 L 120 -262 Q 116 -220 84 -168 Z" fill={C.robe} stroke={ink} strokeWidth={6} />
        <g transform={`translate(140 -262) rotate(${fan})`}>
          <path d="M 0 0 L -62 -96 A 114 114 0 0 1 62 -96 Z" fill={KRP.white} stroke={ink} strokeWidth={5} />
          <path d="M 0 0 L -62 -96 A 114 114 0 0 1 62 -96 Z" fill={C.gold} opacity={0.35} />
          {[-40, -20, 0, 20, 40].map((a) => <line key={a} x1={0} y1={0} x2={Math.sin((a * Math.PI) / 180) * 112} y2={-Math.cos((a * Math.PI) / 180) * 112} stroke={ink} strokeWidth={2} opacity={0.5} />)}
          <path d="M -24 -60 Q 0 -80 24 -60" stroke={KRP.red} strokeWidth={6} fill="none" />
        </g>
        <circle cx={140} cy={-258} r={22} fill={C.enma} stroke={ink} strokeWidth={5} />
      </g>
    ) : (
      <g>
        <path d="M 96 -196 Q 150 -150 150 -70 L 100 -60 Q 104 -130 80 -160 Z" fill={C.robe} stroke={ink} strokeWidth={6} />
        <circle cx={128} cy={-62} r={22} fill={C.enma} stroke={ink} strokeWidth={5} />
      </g>
    )}
    {/* 頭 */}
    <circle cx={-76} cy={-280} r={18} fill={C.enma} stroke={ink} strokeWidth={5} />
    <circle cx={76} cy={-280} r={18} fill={C.enma} stroke={ink} strokeWidth={5} />
    <circle cx={0} cy={-280} r={74} fill={C.enma} stroke={ink} strokeWidth={7} />
    {/* 髪 (てっぺんのまげ) */}
    <path d="M -70 -300 Q -62 -356 0 -358 Q 62 -356 70 -300 Q 40 -330 0 -330 Q -40 -330 -70 -300 Z" fill={ink} />
    {!crown && <ellipse cx={0} cy={-366} rx={22} ry={14} fill={ink} />}
    {/* 冠 (かぶっているとき) */}
    {crown && (
      <g>
        <path d="M -66 -330 L -60 -410 Q 0 -428 60 -410 L 66 -330 Z" fill={ink} stroke={ink} strokeWidth={5} />
        <rect x={-70} y={-346} width={140} height={20} fill={C.gold} stroke={ink} strokeWidth={4} />
        <circle cx={0} cy={-376} r={14} fill={C.gold} stroke={ink} strokeWidth={3} />
      </g>
    )}
    {/* まゆ (太くて下がり気味 = とぼけ顔) */}
    <path d="M -58 -312 Q -36 -330 -12 -310" stroke={ink} strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d="M 58 -312 Q 36 -330 12 -310" stroke={ink} strokeWidth={13} fill="none" strokeLinecap="round" />
    {/* 目 */}
    {eyes === "sleepy" ? (
      <g>
        {[-30, 30].map((ex) => (
          <g key={ex}>
            <path d={`M ${ex - 18} -292 A 18 16 0 0 0 ${ex + 18} -292 Z`} fill={KRP.white} stroke={ink} strokeWidth={4} />
            <circle cx={ex} cy={-286} r={6} fill={ink} />
            <line x1={ex - 20} y1={-292} x2={ex + 20} y2={-292} stroke={ink} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
        {/* あくびの涙 */}
        {yawn > 0.6 && <path d={`M 52 -280 q 6 12 0 18 q -6 -6 0 -18 Z`} fill={KRP.blue} stroke={ink} strokeWidth={2} opacity={(yawn - 0.6) / 0.4} />}
      </g>
    ) : (
      <g fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round">
        <path d="M -46 -290 Q -30 -306 -14 -290" />
        <path d="M 14 -290 Q 30 -306 46 -290" />
      </g>
    )}
    {/* 鼻 */}
    <circle cx={0} cy={-264} r={15} fill={C.enmaDark} stroke={ink} strokeWidth={4} />
    {/* ひげ */}
    <path d="M -68 -262 Q -84 -186 -34 -164 Q 0 -148 34 -164 Q 84 -186 68 -262 Q 44 -238 0 -240 Q -44 -238 -68 -262 Z" fill={ink} />
    {[-40, -14, 14, 40].map((px) => <path key={px} d={`M ${px} -200 q 4 14 -2 24`} stroke={KRP.grayDark} strokeWidth={3} fill="none" />)}
    {/* 口 (あくびで大きく開く) */}
    <ellipse cx={0} cy={-226 + yawn * 6} rx={20 + yawn * 10} ry={5 + yawn * 26} fill="#7A2420" stroke={KRP.white} strokeWidth={3} />
    {yawn > 0.3 && <ellipse cx={0} cy={-212 + yawn * 14} rx={12 + yawn * 4} ry={6 + yawn * 6} fill="#E58A8A" />}
    {/* 口ひげ */}
    <path d="M -6 -246 Q -40 -260 -62 -236 Q -40 -246 -6 -240 Z" fill={ink} />
    <path d="M 6 -246 Q 40 -260 62 -236 Q 40 -246 6 -240 Z" fill={ink} />
  </g>
);

// 冠 (脱いで置いた物)
const HmBbKanmuri: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <ellipse cx={0} cy={4} rx={80} ry={12} fill={ink} opacity={0.2} />
    <path d="M -66 0 L -60 -80 Q 0 -98 60 -80 L 66 0 Z" fill={ink} stroke={ink} strokeWidth={5} />
    <rect x={-70} y={-16} width={140} height={20} fill={C.gold} stroke={ink} strokeWidth={4} />
    <circle cx={0} cy={-46} r={14} fill={C.gold} stroke={ink} strokeWidth={3} />
    <path d="M -40 -70 Q -20 -80 0 -78" stroke={KRP.grayDark} strokeWidth={4} fill="none" />
  </g>
);

// -------------------------------------------------------------------
// HmBbOni — 寝そべる小鬼 (色つき)。x,y: お腹の下の接地点。flip で左右反転。snore: いびきの泡
// -------------------------------------------------------------------
const HmBbOni: React.FC<{ x: number; y: number; s?: number; f: number; col: string; dark: string; flip?: boolean; ph?: number }> = ({
  x, y, s = 1, f, col, dark, flip = false, ph = 0,
}) => {
  const breathe = Math.sin((f + ph) / 8) * 3;
  const bub = ((f + ph * 7) % 36) / 36;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={150} ry={16} fill={ink} opacity={0.2} />
      {/* 脚 */}
      <rect x={60} y={-46} width={90} height={34} rx={17} fill={col} stroke={ink} strokeWidth={5} />
      <rect x={70} y={-22} width={86} height={30} rx={15} fill={col} stroke={ink} strokeWidth={5} />
      {/* 胴 */}
      <ellipse cx={0} cy={-46 - breathe} rx={96} ry={48 + breathe} fill={col} stroke={ink} strokeWidth={6} />
      {/* 虎の腰巻 */}
      <path d={`M 30 ${-92 - breathe} Q 70 -50 40 0 L 96 -10 Q 110 -50 86 -82 Z`} fill={C.tiger} stroke={ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${52 + i * 14} ${-76 + i * 18} l 18 -6`} stroke={ink} strokeWidth={6} strokeLinecap="round" />)}
      {/* 腕 (枕にしている) */}
      <rect x={-150} y={-40} width={90} height={30} rx={15} fill={col} stroke={ink} strokeWidth={5} />
      {/* 頭 */}
      <circle cx={-118} cy={-66} r={50} fill={col} stroke={ink} strokeWidth={6} />
      <path d="M -160 -86 Q -150 -126 -110 -118 Q -80 -118 -74 -92 Q -110 -104 -160 -86 Z" fill={dark} stroke={ink} strokeWidth={4} />
      {[[-140, -112, -18], [-92, -116, 18]].map(([hx, hy, r], i) => (
        <path key={i} d="M -9 0 L 0 -30 L 9 0 Z" fill={KRP.white} stroke={ink} strokeWidth={4} transform={`translate(${hx} ${hy}) rotate(${r})`} />
      ))}
      {/* 閉じた目と口 */}
      <path d="M -142 -66 q 10 8 20 0 M -110 -66 q 10 8 20 0" stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <ellipse cx={-116} cy={-42} rx={10} ry={6} fill="#7A2420" />
      <path d="M -124 -46 l 3 6 l 3 -6" fill={KRP.white} stroke={ink} strokeWidth={1.5} />
      {/* いびきの泡 */}
      <circle cx={-150 - bub * 30} cy={-60 - bub * 40} r={6 + bub * 26} fill={KRP.blueSoft} stroke={ink} strokeWidth={3} opacity={bub < 0.92 ? 0.85 : 0} />
      <circle cx={-150 - bub * 30 - 6 - bub * 8} cy={-66 - bub * 46} r={3 + bub * 5} fill={KRP.white} opacity={bub < 0.92 ? 0.8 : 0} />
    </g>
  );
};

// 金棒 (置いた物)
const HmBbKanabo: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-10} y={-20} width={20} height={70} rx={8} fill={C.edoWoodDark} stroke={ink} strokeWidth={4} />
    <path d="M -22 -20 L -16 -190 Q 0 -204 16 -190 L 22 -20 Z" fill={KRP.grayDark} stroke={ink} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <circle cx={-20} cy={-40 - i * 26} r={6} fill={KRP.silver} stroke={ink} strokeWidth={2.5} />
        <circle cx={20} cy={-52 - i * 26} r={6} fill={KRP.silver} stroke={ink} strokeWidth={2.5} />
      </g>
    ))}
  </g>
);

// 炎の形
const flamePath = (x: number, y: number, h: number, f: number, k: number) => {
  const w = h * 0.45;
  const sw = Math.sin(f / 5 + k) * h * 0.12;
  return `M ${x - w} ${y} Q ${x - w * 1.1} ${y - h * 0.5} ${x - w * 0.2 + sw} ${y - h * 0.7} Q ${x - w * 0.3 + sw} ${y - h * 0.9} ${x + sw * 1.5} ${y - h}
    Q ${x + w * 0.5 + sw} ${y - h * 0.6} ${x + w * 0.4} ${y - h * 0.45} Q ${x + w * 1.1} ${y - h * 0.4} ${x + w} ${y} Z`;
};

// -------------------------------------------------------------------
// 江戸の村の部品: 茅葺きの家 / 鳥居 / 鍬 / 鎌 / 幟
// -------------------------------------------------------------------
const HmBbKaya: React.FC<{ x: number; y: number; s?: number; f: number; smoke?: boolean }> = ({ x, y, s = 1, f, smoke = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 壁 (土壁と柱) */}
    <rect x={-170} y={-150} width={340} height={150} fill={C.tsuchi} stroke={ink} strokeWidth={6} />
    {[-170, -60, 60, 170].map((px) => <rect key={px} x={px - 8} y={-150} width={16} height={150} fill={C.edoWood} stroke={ink} strokeWidth={4} />)}
    <rect x={-50} y={-110} width={100} height={110} fill={C.doma} stroke={ink} strokeWidth={5} />
    <rect x={80} y={-120} width={70} height={56} fill={C.shoji} stroke={ink} strokeWidth={4} />
    <line x1={115} y1={-120} x2={115} y2={-64} stroke={ink} strokeWidth={3} />
    {/* 茅葺きの屋根 */}
    <path d="M -230 -140 L -120 -320 L 120 -320 L 230 -140 Z" fill={C.kaya} stroke={ink} strokeWidth={7} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={-200 + i * 36} y1={-150} x2={-110 + i * 20} y2={-310} stroke={C.kayaDark} strokeWidth={4} opacity={0.7} />
    ))}
    <path d="M -230 -140 Q 0 -126 230 -140" stroke={C.kayaDark} strokeWidth={10} fill="none" />
    <rect x={-130} y={-340} width={260} height={30} rx={10} fill={C.kayaDark} stroke={ink} strokeWidth={6} />
    {[-90, -30, 30, 90].map((px) => <rect key={px} x={px - 6} y={-352} width={12} height={20} fill={C.edoWoodDark} stroke={ink} strokeWidth={3} />)}
    {smoke && Array.from({ length: 4 }, (_, i) => {
      const p = ((f * 0.8 + i * 18) % 72) / 72;
      return <circle key={i} cx={60 + p * 60} cy={-360 - p * 160} r={14 + p * 26} fill={KRP.white} stroke={ink} strokeWidth={2.5} opacity={0.8 - p * 0.7} />;
    })}
  </g>
);

const HmBbTorii: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-70, 70].map((px) => <rect key={px} x={px - 11} y={-170} width={22} height={170} fill={C.torii} stroke={ink} strokeWidth={5} />)}
    <rect x={-96} y={-150} width={192} height={18} fill={C.torii} stroke={ink} strokeWidth={5} />
    <path d="M -116 -186 Q 0 -176 116 -186 L 110 -166 L -110 -166 Z" fill={ink} />
    <rect x={-12} y={-166} width={24} height={20} fill={C.torii} stroke={ink} strokeWidth={4} />
  </g>
);

const HmBbKuwa: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-7} y={-230} width={14} height={230} rx={6} fill={C.edoWood} stroke={ink} strokeWidth={4} />
    <path d="M -6 -232 L 46 -220 L 52 -170 L 10 -186 Z" fill={KRP.silver} stroke={ink} strokeWidth={4} />
  </g>
);

const HmBbKama: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-6} y={-130} width={12} height={130} rx={5} fill={C.edoWood} stroke={ink} strokeWidth={4} />
    <path d="M -4 -128 Q 50 -160 72 -110 Q 46 -136 4 -114 Z" fill={KRP.silver} stroke={ink} strokeWidth={4} />
  </g>
);

const HmBbNobori: React.FC<{ x: number; y: number; h?: number; f: number; col?: string; edge?: string; ph?: number }> = ({
  x, y, h = 560, f, col = KRP.white, edge = KRP.red, ph = 0,
}) => {
  const w1 = Math.sin(f / 6 + ph) * 14, w2 = Math.sin(f / 6 + ph + 1.4) * 18;
  return (
    <g>
      <rect x={x - 6} y={y - h} width={12} height={h} fill={C.edoWoodDark} stroke={ink} strokeWidth={4} />
      <rect x={x - 6} y={y - h + 10} width={90} height={10} fill={C.edoWoodDark} stroke={ink} strokeWidth={3} />
      <path d={`M ${x + 6} ${y - h + 20} L ${x + 84} ${y - h + 20} Q ${x + 90 + w1} ${y - h * 0.62} ${x + 86 + w2} ${y - h * 0.25}
        L ${x + 6} ${y - h * 0.25} Z`} fill={col} stroke={ink} strokeWidth={5} />
      <path d={`M ${x + 6} ${y - h + 20} L ${x + 84} ${y - h + 20} L ${x + 84} ${y - h + 50} L ${x + 6} ${y - h + 50} Z`} fill={edge} stroke={ink} strokeWidth={4} />
      {[0.42, 0.56, 0.7].map((k, i) => (
        <circle key={i} cx={x + 45 + w1 * 0.5 * k} cy={y - h * (1 - k) - h * 0.2} r={12} fill={edge} opacity={0.85} />
      ))}
    </g>
  );
};

// 風呂敷包み
const HmBbFuroshiki: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -56 -10 Q -64 -56 -20 -64 Q 20 -72 50 -50 Q 70 -20 50 20 Q 0 40 -46 22 Q -60 10 -56 -10 Z" fill={C.furoshiki} stroke={ink} strokeWidth={5} />
    {[[-30, -30], [10, -40], [30, 0], [-14, 10]].map(([px, py], i) => (
      <path key={i} d={`M ${px} ${py} q 8 -10 16 0 q 8 10 16 0`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.85} />
    ))}
    <path d="M -10 -60 L -26 -84 M 6 -62 L 20 -86" stroke={C.furoshikiDark} strokeWidth={10} strokeLinecap="round" />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #36 家族でお出かけも、友だちと遊ぶのも、むずかしい。
// 格: 山 / seed 5036
// どこ: ソ連の公園 (くもりの平日)。奥に団地 (屋上の赤い星)・煙を吐く工場・止まった噴水・紅葉の木
// 演出: 黄色い服の子がベンチにひとり。ボールをひざでぽんぽん。友だちの家の窓は暗く、歯車のマーク (= 仕事中) が回る。
//       ピクニックかごがベンチの横にぽつん (かごに落ち葉が積もる)。足元でハトが1羽だけ相手をしている
// 動き: 落ち葉が子のまわりをくるくる / ボールを軽くつく / 窓の歯車が回る / カメラがゆっくり子に寄る
const Hm036: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const toss = Math.abs(Math.sin((f * Math.PI) / 22));
  const ballY = 664 - 40 * toss;
  const peck = Math.max(0, Math.sin(f / 4)) * 10;
  return (
    <Frame f={f} seed={5036}>
      <g transform={`translate(960 640) scale(${cam}) translate(-960 -640)`}>
        <HmBbPark f={f} sunny={false} />
        {/* 友だちの家の窓: 暗い窓に歯車 (仕事中) */}
        <g>
          <rect x={604} y={316} width={72} height={64} fill={KRP.yellow} opacity={0.18 + 0.08 * Math.sin(f / 6)} />
          <g transform={`translate(640 344) rotate(${f * 4})`}>
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-5} y={-22} width={10} height={10} fill={KRP.orange} stroke={ink} strokeWidth={2} transform={`rotate(${i * 45})`} />)}
            <circle r={15} fill={KRP.orange} stroke={ink} strokeWidth={3} />
            <circle r={5} fill={C.glassDark} />
          </g>
        </g>
        {/* ほかの窓にも歯車 (みんな別の日に仕事) */}
        {[[328, 192], [512, 420], [788, 268]].map(([wx, wy], i) => (
          <g key={i} transform={`translate(${wx} ${wy}) rotate(${-f * 3 + i * 20})`} opacity={0.75}>
            {Array.from({ length: 8 }, (_, k) => <rect key={k} x={-4} y={-16} width={8} height={8} fill={KRP.grayDark} transform={`rotate(${k * 45})`} />)}
            <circle r={11} fill={KRP.grayDark} />
          </g>
        ))}
        {/* ピクニックかご (ぽつん) */}
        <g transform="translate(1268 792)">
          <HmBbShadow x={0} y={6} rx={90} />
          <path d="M -70 -40 Q 0 -150 70 -40" stroke={C.basketDark} strokeWidth={14} fill="none" />
          <path d="M -70 -40 Q 0 -150 70 -40" stroke={ink} strokeWidth={3} fill="none" />
          <path d="M -86 -44 L 86 -44 L 70 0 L -70 0 Z" fill={C.basket} stroke={ink} strokeWidth={6} />
          {[-60, -30, 0, 30, 60].map((px) => <line key={px} x1={px} y1={-44} x2={px * 0.85} y2={0} stroke={C.basketDark} strokeWidth={4} />)}
          <line x1={-78} y1={-22} x2={78} y2={-22} stroke={C.basketDark} strokeWidth={4} />
          <path d="M -60 -44 Q -40 -64 -10 -52 L 20 -60 Q 40 -50 60 -44 Z" fill={C.check} stroke={ink} strokeWidth={4} />
          {[-40, -8, 26].map((px) => <rect key={px} x={px} y={-56} width={12} height={10} fill={KRP.white} opacity={0.8} />)}
          {/* かごの上に積もった落ち葉 */}
          {[[-30, -50, C.leafRed], [10, -58, C.leafYel], [44, -48, C.leafOr]].map(([px, py, c], i) => (
            <ellipse key={i} cx={px as number} cy={py as number} rx={13} ry={6} fill={c as string} stroke={ink} strokeWidth={2} transform={`rotate(${i * 40 - 20} ${px} ${py})`} />
          ))}
        </g>
        {/* ハト (つつく) */}
        <g transform={`translate(600 812)`}>
          <HmBbShadow x={0} y={4} rx={40} />
          <ellipse cx={0} cy={-26} rx={38} ry={24} fill={KRP.gray} stroke={ink} strokeWidth={4} />
          <g transform={`rotate(${peck * 3} -30 -40)`}>
            <circle cx={-36} cy={-46} r={16} fill={KRP.grayDark} stroke={ink} strokeWidth={4} />
            <path d="M -52 -46 l -12 4 l 12 4 Z" fill={KRP.orange} stroke={ink} strokeWidth={2} />
            <circle cx={-40} cy={-50} r={3} fill={ink} />
          </g>
          <path d="M 30 -30 l 26 -10 l -4 18 Z" fill={KRP.grayDark} stroke={ink} strokeWidth={3} />
          <path d="M -6 0 l 0 -8 M 8 0 l 0 -8" stroke={KRP.orange} strokeWidth={4} />
        </g>
        {/* 子ども (ひとりでベンチに) */}
        <Person x={960} y={760} s={1.0} f={f} face="sad" pose="sit" cloth={C.kid} clothDark={C.kidDark} gaze={[-4, -3]} phase={2} />
        {/* ひざのボール */}
        <g transform={`translate(960 ${ballY}) rotate(${f * 3})`}>
          <circle r={42} fill={KRP.red} stroke={ink} strokeWidth={5} />
          <path d="M -42 0 Q 0 -18 42 0" stroke={KRP.white} strokeWidth={10} fill="none" />
          <path d="M -42 0 Q 0 -18 42 0" stroke={ink} strokeWidth={2} fill="none" opacity={0.4} />
          <ellipse cx={-14} cy={-22} rx={10} ry={6} fill={KRP.white} opacity={0.5} />
        </g>
        {toss < 0.15 && <path d="M 900 690 q -10 6 -18 0 M 1020 690 q 10 6 18 0" stroke={ink} strokeWidth={3} fill="none" opacity={0.6} />}
        {/* 子のまわりをくるくる回る落ち葉 */}
        {Array.from({ length: 11 }, (_, i) => {
          const a = f * 0.07 + (i / 11) * Math.PI * 2;
          const r = 230 + Math.sin(f / 9 + i) * 30;
          const lx = 960 + Math.cos(a) * r;
          const ly = 520 + Math.sin(a) * r * 0.42 + Math.sin(f / 7 + i) * 14;
          return (
            <g key={i} transform={`translate(${lx} ${ly}) rotate(${f * 6 + i * 33})`}>
              <path d="M -16 0 Q 0 -12 16 0 Q 0 12 -16 0 Z" fill={[C.leafOr, C.leafRed, C.leafYel][i % 3]} stroke={ink} strokeWidth={2.5} />
              <line x1={-16} y1={0} x2={16} y2={0} stroke={ink} strokeWidth={1.5} opacity={0.6} />
            </g>
          );
        })}
        <TagPlate x={1640} y={108} text="ソ連" size={42} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #37 不満がたまって、1940年、ソ連は7日の週に戻しました。
// 格: 並 / seed 5037
// どこ: 工場の壁の掲示板 (コンクリートの壁・配管・コルク板)。年代札「1940年」
// 演出: 5日周期の交代表 (休みのマークが斜め) の上に、7マスの新しい表が上からばさっと落ちて画鋲で留まる。
//       各組の休みのマークがすーっと右へ滑り、最後の列 (日) に1列にそろう。前で家族3人が見上げて、ほっとして手をつなぐ
// 動き: f4-14 新しい表が落ちる / f14 画鋲・ばさっの線 / f18-42 休みのマークが日の列へ / f30〜 家族が笑顔で手をつなぎ小さく跳ぶ
const Hm037: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 4, 14));
  const bounce = f >= 14 && f < 22 ? -12 * Math.sin(((f - 14) / 8) * Math.PI) : 0;
  const dy = -760 * (1 - drop) + bounce;
  const rot = lerp(-9, -0.8, drop);
  const X0 = 400, Y0 = 140, LW = 140, CW = 140, HH = 60, RH = 78;
  const GROUP = [KRP.yellow, "#E9A0B4", KRP.red, "#9A7AC0", KRP.green];
  const happy = f >= 30;
  const jump = -16 * Math.sin(seg(f, 32, 40) * Math.PI);
  const fam: { x: number; s: number; cloth: string; dark: string; ph: number }[] = [
    { x: 760, s: 0.95, cloth: C.sov, dark: C.sovDark, ph: 1 },
    { x: 960, s: 0.92, cloth: C.mom, dark: C.momDark, ph: 2 },
    { x: 1150, s: 0.72, cloth: C.kid, dark: C.kidDark, ph: 3 },
  ];
  const hand = (k: number, side: -1 | 1): [number, number] => {
    const p = fam[k];
    const bob = Math.sin((f + p.ph * 17) / 13) * 3;
    return [p.x + side * 67 * p.s, 930 + jump + bob - 66 * p.s];
  };
  return (
    <Frame f={f} seed={5037}>
      {/* 壁 */}
      <rect x={-40} y={-40} width={2000} height={900} fill={C.concrete} />
      <g stroke={C.concreteDark} strokeWidth={4}>
        {[240, 720, 1200, 1680].map((px) => <line key={px} x1={px} y1={-40} x2={px} y2={860} />)}
        {[300, 620].map((py) => <line key={py} x1={-40} y1={py} x2={1960} y2={py} opacity={0.5} />)}
      </g>
      {/* 配管 */}
      <rect x={-40} y={40} width={2000} height={30} fill={KRP.grayDark} stroke={ink} strokeWidth={5} />
      <rect x={1760} y={40} width={30} height={820} fill={KRP.grayDark} stroke={ink} strokeWidth={5} />
      {[200, 900, 1500].map((px) => <rect key={px} x={px} y={34} width={22} height={42} rx={4} fill={KRP.silver} stroke={ink} strokeWidth={4} />)}
      <g transform="translate(1775 640)">
        <circle r={36} fill={KRP.red} stroke={ink} strokeWidth={5} />
        <rect x={-6} y={-30} width={12} height={60} fill={KRP.white} transform={`rotate(${Math.sin(f / 10) * 4})`} />
      </g>
      {/* 床 */}
      <rect x={-40} y={860} width={2000} height={300} fill={C.floorDark} />
      <rect x={-40} y={852} width={2000} height={16} fill={KRP.yellow} stroke={ink} strokeWidth={4} />
      {/* 掲示板 */}
      <rect x={360} y={108} width={1200} height={510} rx={10} fill={C.boardWood} stroke={ink} strokeWidth={8} />
      <rect x={380} y={128} width={1160} height={470} fill={C.cork} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={390 + rnd(371, i) * 1140} cy={140 + rnd(372, i) * 450} r={3} fill={C.boardWood} opacity={0.5} />)}
      {/* 古い交代表 (5日周期・休みが斜め) */}
      <g transform="rotate(1.5 960 360)">
        <rect x={440} y={160} width={1040} height={420} fill={C.paperOld} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, c) => <line key={c} x1={600 + c * 176} y1={160} x2={600 + c * 176} y2={580} stroke={ink} strokeWidth={3} />)}
        {Array.from({ length: 5 }, (_, r) => (
          <g key={r}>
            <line x1={440} y1={220 + r * 72} x2={1480} y2={220 + r * 72} stroke={ink} strokeWidth={3} />
            <circle cx={520} cy={256 + r * 72} r={20} fill={GROUP[r]} stroke={ink} strokeWidth={3} />
            <circle cx={688 + r * 176} cy={256 + r * 72} r={24} fill={HP.rest} stroke={ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 新しい7日の表 (上から落ちてくる) */}
      <g transform={`translate(0 ${dy}) rotate(${rot} 960 365)`}>
        <rect x={X0 + 10} y={Y0 + 12} width={1120} height={450} fill={ink} opacity={0.2} />
        <rect x={X0} y={Y0} width={1120} height={450} fill={KRP.white} stroke={ink} strokeWidth={6} />
        <rect x={X0} y={Y0} width={1120} height={HH} fill={KRP.blueSoft} stroke={ink} strokeWidth={5} />
        {/* 日の列のハイライト */}
        <rect x={X0 + LW + 6 * CW} y={Y0 + HH} width={CW} height={RH * 5} fill={HP.restSoft} opacity={seg(f, 34, 42)} />
        {["月", "火", "水", "木", "金", "土", "日"].map((d, c) => (
          <text key={d} x={X0 + LW + c * CW + CW / 2} y={Y0 + 44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36}
            fill={c === 6 ? HP.rest : ink}>{d}</text>
        ))}
        {Array.from({ length: 8 }, (_, c) => <line key={c} x1={X0 + LW + c * CW} y1={Y0} x2={X0 + LW + c * CW} y2={Y0 + 450} stroke={ink} strokeWidth={3} />)}
        {Array.from({ length: 5 }, (_, r) => {
          const yy = Y0 + HH + r * RH;
          const t = easeInOut(seg(f, 18 + r * 4, 30 + r * 3));
          const mx = lerp(X0 + LW + r * CW + CW / 2, X0 + LW + 6 * CW + CW / 2, t);
          return (
            <g key={r}>
              <line x1={X0} y1={yy + RH} x2={X0 + 1120} y2={yy + RH} stroke={ink} strokeWidth={3} />
              <circle cx={X0 + LW / 2} cy={yy + RH / 2} r={22} fill={GROUP[r]} stroke={ink} strokeWidth={4} />
              {t > 0 && t < 1 && <line x1={X0 + LW + r * CW + CW / 2} y1={yy + RH / 2} x2={mx - 30} y2={yy + RH / 2}
                stroke={HP.rest} strokeWidth={6} strokeDasharray="10 10" opacity={0.6} />}
              <g transform={`translate(${mx} ${yy + RH / 2}) scale(${t >= 1 ? 1 + 0.12 * Math.sin(seg(f, 30 + r * 3, 34 + r * 3) * Math.PI) : 1})`}>
                <circle r={28} fill={HP.rest} stroke={ink} strokeWidth={4} />
                <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white}>休</text>
              </g>
            </g>
          );
        })}
        {/* 画鋲 */}
        {[[X0 + 20, Y0 + 20], [X0 + 1100, Y0 + 20], [X0 + 20, Y0 + 430], [X0 + 1100, Y0 + 430]].map(([px, py], i) => (
          <g key={i} transform={`translate(${px} ${py}) scale(${pop(seg(f, 14 + i, 18 + i))})`}>
            <circle r={14} fill={[KRP.red, KRP.blueDeep, KRP.green, KRP.yellow][i]} stroke={ink} strokeWidth={4} />
            <circle cx={-4} cy={-4} r={4} fill={KRP.white} opacity={0.7} />
          </g>
        ))}
      </g>
      {/* ばさっ (着地の線とほこり) */}
      {f >= 13 && f < 24 && (
        <g opacity={1 - seg(f, 13, 24)} stroke={ink} strokeWidth={6} strokeLinecap="round">
          {[[350, 200, -1], [350, 400, -1], [1570, 220, 1], [1570, 420, 1]].map(([px, py, d], i) => (
            <line key={i} x1={px} y1={py} x2={(px as number) + (d as number) * 60} y2={(py as number) - 20} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={420 + i * 270} cy={600 + seg(f, 13, 24) * 20} r={16 + seg(f, 13, 24) * 24}
            fill={KRP.white} stroke={ink} strokeWidth={3} />)}
        </g>
      )}
      <TagPlate x={1700} y={182} text="1940年" size={46} t={seg(f, 2, 10)} />
      {/* 家族3人 */}
      {fam.map((p, k) => (
        <g key={k}>
          <HmBbShadow x={p.x} y={934} rx={70 * p.s} />
          <Person x={p.x} y={930 + jump} s={p.s} f={f} face={happy ? "joy" : "worried"} cloth={p.cloth} clothDark={p.dark}
            phase={p.ph} gaze={[0, -4]} hair={k === 1 ? "none" : "cap"} />
          {k === 0 && <HmBbWear x={p.x} y={930 + jump} s={p.s} f={f} phase={p.ph} cap={C.sovDark} capDark={C.sov} />}
          {k === 1 && <HmBbWear x={p.x} y={930 + jump} s={p.s} f={f} phase={p.ph} scarf={C.scarf} scarfDark={C.scarfDark} />}
        </g>
      ))}
      {/* つないだ手 */}
      {happy && [[0, 1], [1, 2]].map(([a, b], i) => {
        const [ax, ay] = hand(a, 1);
        const [bx, by] = hand(b, -1);
        return (
          <g key={i} opacity={seg(f, 30, 33)}>
            <path d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${Math.max(ay, by) + 14} ${bx} ${by}`} stroke={ink} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${Math.max(ay, by) + 14} ${bx} ${by}`} stroke={KRP.white} strokeWidth={7} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      {happy && [0, 1, 2].map((i) => (
        <path key={i} d={`M ${720 + i * 220} ${640 - seg(f, 32, 42) * 30} l 10 -18 l 10 18 l -10 -6 Z`} fill={HP.rest} opacity={seg(f, 32, 36)} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #38 休みは、みんなで同じ日に休んで、はじめて休みになるのです。
// 格: 山 / seed 5038
// どこ: #36 と同じソ連の公園。晴れの日曜。工場の煙は止まり、友だちの窓は開いて花の鉢
// 演出: 黄色い服の子が投げたボールが、友だちの手にすぽっと収まる。左に家族の両親 (ピクニック敷物とかご)、右に友だちの両親が手を振る。
//       噴水が上がり、まわりに人が集まる。ベンチの上には外した腕章が並ぶ
// 動き: f10-38 ボールが弧を描いて友だちへ / 噴水 / 鳥が横切る / カメラがゆっくり右へ
const Hm038: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(16, -16, easeInOut(seg(f, 0, 42)));
  const bt = easeInOut(seg(f, 10, 38));
  const bx = lerp(700, 1290, bt);
  const by = lerp(690, 706, bt) - Math.sin(bt * Math.PI) * 380;
  const caught = f >= 38;
  const kidS = 0.85;
  return (
    <Frame f={f} seed={5038}>
      <g transform={`translate(${pan} 0)`}>
        <HmBbPark f={f} sunny />
        {/* 友だちの窓: 開いたカーテンと花 */}
        <g>
          <path d="M 604 316 q 10 30 0 52 L 616 316 Z M 676 316 q -10 30 0 52 L 664 316 Z" fill="#E9A0B4" stroke={ink} strokeWidth={2} />
          <rect x={618} y={354} width={44} height={16} fill={HP.hi} stroke={ink} strokeWidth={2} />
          {[-12, 0, 12].map((dx) => <circle key={dx} cx={640 + dx} cy={344 + Math.abs(dx) * 0.3} r={7} fill={[KRP.red, KRP.yellow, KRP.red][(dx + 12) / 12]} stroke={ink} strokeWidth={1.5} />)}
        </g>
        {/* 鳥 */}
        {[0, 1, 2, 3].map((i) => {
          const x = ((f * 7 + i * 260) % 2200) - 140;
          const y = 120 + i * 34 + Math.sin(f / 5 + i) * 10;
          const w = Math.sin(f / 2 + i) * 12;
          return <path key={i} d={`M ${x - 26} ${y - w} Q ${x - 12} ${y - 8} ${x} ${y} Q ${x + 12} ${y - 8} ${x + 26} ${y - w}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* 噴水のまわりに集まる人 */}
        {[1270, 1340, 1560, 1630, 1690].map((px, i) => (
          <PersonMini key={i} x={px} y={660} s={0.42} f={f} phase={i} color={[KRP.blue, KRP.orange, C.friend, KRP.red, KRP.blueDeep][i]} face="smile" arms={i % 2 ? "up" : "down"} />
        ))}
        {/* ベンチの上の腕章 (外して置いた) */}
        {[820, 900, 980, 1060].map((px, i) => (
          <g key={i} transform={`translate(${px} 698) rotate(${(i - 1.5) * 8})`}>
            <rect x={-34} y={-14} width={68} height={22} rx={8} fill={C.armband} stroke={ink} strokeWidth={4} />
            <rect x={-34} y={-6} width={68} height={6} fill={KRP.yellow} />
          </g>
        ))}
        {/* 左: 家族の敷物とかご */}
        <ellipse cx={360} cy={858} rx={250} ry={48} fill={C.blanket} stroke={ink} strokeWidth={5} />
        {[-160, -80, 0, 80, 160].map((dx) => <line key={dx} x1={360 + dx} y1={816} x2={360 + dx * 1.1} y2={900} stroke={C.check} strokeWidth={4} opacity={0.6} />)}
        <g transform="translate(520 852)">
          <path d="M -50 -30 Q 0 -110 50 -30" stroke={C.basketDark} strokeWidth={10} fill="none" />
          <path d="M -60 -32 L 60 -32 L 48 0 L -48 0 Z" fill={C.basket} stroke={ink} strokeWidth={5} />
          <circle cx={-20} cy={-40} r={14} fill={KRP.red} stroke={ink} strokeWidth={3} />
          <ellipse cx={18} cy={-40} rx={26} ry={12} fill="#D9A45A" stroke={ink} strokeWidth={3} />
        </g>
        <HmBbShadow x={250} y={850} rx={70} />
        <Person x={250} y={850} s={0.92} f={f} face="smile" pose="armsFolded" cloth={C.sov} clothDark={C.sovDark} phase={1} gaze={[4, -2]} />
        <HmBbWear x={250} y={850} s={0.92} f={f} phase={1} cap={C.sovDark} capDark={C.sov} />
        <HmBbShadow x={400} y={852} rx={66} />
        <Person x={400} y={852} s={0.88} f={f} face="joy" pose="hold" cloth={C.mom} clothDark={C.momDark} phase={2} hair="none" />
        <HmBbWear x={400} y={852} s={0.88} f={f} phase={2} scarf={C.scarf} scarfDark={C.scarfDark} />
        <g transform={`translate(400 ${852 - 118 * 0.88 + Math.sin((f + 34) / 13) * 3})`}>
          <rect x={-14} y={-24} width={28} height={26} rx={4} fill={KRP.white} stroke={ink} strokeWidth={3} />
          <path d={`M -4 -30 q 6 -10 0 -20`} stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.8} transform={`translate(0 ${-(f % 12)})`} />
        </g>
        {/* 黄色い服の子 (投げた) */}
        <HmBbShadow x={660} y={836} rx={56} />
        <Person x={660} y={832} s={kidS} f={f} face="joy" pose={f < 12 ? "hold" : "raise"} cloth={C.kid} clothDark={C.kidDark} phase={3} gaze={[4, -3]} />
        {/* 友だち (受け取る) */}
        <HmBbShadow x={1290} y={836} rx={56} />
        <Person x={1290} y={832} s={kidS} f={f} face={caught ? "joy" : "surprised"} pose={caught ? "hold" : "banzai"} cloth={C.friend} clothDark={C.friendDark} phase={4} gaze={[-4, -3]} />
        {/* 右: 友だちの両親 (手を振る) */}
        <HmBbShadow x={1600} y={866} rx={68} />
        <Person x={1600} y={862} s={0.9} f={f} face="joy" pose="raise" cloth={C.sov} clothDark={C.sovDark} phase={5} gaze={[-4, 0]} lean={Math.sin(f / 6) * 3} />
        <HmBbWear x={1600} y={862} s={0.9} f={f} phase={5} lean={Math.sin(f / 6) * 3} cap={C.sovDark} capDark={C.sov} />
        <HmBbShadow x={1740} y={866} rx={66} />
        <Person x={1740} y={862} s={0.86} f={f} face="smile" cloth={C.friendMom} clothDark={C.friendMomDark} phase={6} gaze={[-4, 0]} hair="none" />
        <HmBbWear x={1740} y={862} s={0.86} f={f} phase={6} scarf={KRP.blueDeep} scarfDark={C.ai} />
        {/* ボール */}
        <g transform={`translate(${caught ? 1290 : bx} ${caught ? 832 - 118 * kidS + 14 + Math.sin((f + 68) / 13) * 3 : by}) rotate(${f * 9})`}>
          <circle r={36} fill={KRP.red} stroke={ink} strokeWidth={5} />
          <path d="M -36 0 Q 0 -16 36 0" stroke={KRP.white} strokeWidth={9} fill="none" />
        </g>
        {!caught && bt > 0 && (
          <path d={`M 700 690 Q 995 ${690 - 760 * 0.5} ${bx} ${by}`} stroke={ink} strokeWidth={4} fill="none" strokeDasharray="6 14" opacity={0.35} />
        )}
        {caught && <g opacity={1 - seg(f, 38, 42) * 0.6}>{[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * 60 * Math.PI) / 180;
          return <line key={i} x1={1290 + Math.cos(a) * 50} y1={746 + Math.sin(a) * 50} x2={1290 + Math.cos(a) * 80} y2={746 + Math.sin(a) * 80} stroke={HP.spark} strokeWidth={7} strokeLinecap="round" />;
        })}</g>}
        <TagPlate x={1640} y={108} text="ソ連" size={42} />
        <TagPlate x={960} y={150} text="日曜" size={48} t={seg(f, 2, 12)} fill={HP.restSoft} color={HP.rest} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #39 暇のものさしに、最初の目盛り、「日」が刻まれました。
// 格: 山 / seed 5039
// どこ: #18 の作業机 (Sagyozukue)。ものさしは (960,560)。捜索係は机の向こう側に立つ (腰から下は机に隠れる)
// 演出: のみが「日」の区画を左から刻む (木くずがくるくる)。刻み終わると「日」の札が橙に。区画の上に週の暦の1枚がぽん。
//       捜索係は虫めがねを机に置いて、ぱちぱち拍手
// 動き: f2-34 刻む (Monosashi の lit 0→1・火花) / f34 札が塗られて光のはじけ / f35-41 暦の1枚が乗る / 拍手 / カメラは「日」に寄ってから引く
const Hm039: React.FC<{ f: number }> = ({ f }) => {
  const lit = seg(f, 2, 34);
  const pull = easeInOut(seg(f, 30, 42));
  const s = lerp(1.5, 1.0, pull);
  const fx = lerp(640, 960, pull), fy = lerp(560, 540, pull);
  const [sx, sy] = monoSlot(0, 960, 560, 1);
  const burst = seg(f, 33, 41);
  const clap = f >= 34 && Math.floor((f - 33) / 3) % 2 === 0;
  const SX = 1440, SY = 432, SS = 0.95;
  return (
    <Frame f={f} seed={5039}>
      <g transform={`translate(960 540) scale(${s}) translate(${-fx} ${-fy})`}>
        <Sagyozukue f={f} />
        {/* 捜索係 (机の向こう) */}
        <Sousa x={SX} y={SY} s={SS} f={f} face={f < 34 ? "surprised" : "joy"} pose={f < 34 ? "armsFolded" : clap ? "hold" : "stand"}
          lean={f < 34 ? -5 : 0} gaze={[-5, 2]} lens={false} />
        {/* 机の天板で腰から下を隠す */}
        <rect x={1300} y={384} width={300} height={80} fill="#B9874F" />
        <path d="M 1300 440 q 150 -6 300 0" stroke="#9E6F3E" strokeWidth={4} fill="none" opacity={0.6} />
        <rect x={-40} y={372} width={2000} height={24} fill="#8E6234" stroke={ink} strokeWidth={6} />
        {/* 拍手のはじけ */}
        {clap && (
          <g>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = ([-25, 0, 25, 155, 180][i] * Math.PI) / 180;
              return <line key={i} x1={SX + Math.cos(a) * 46} y1={SY - 118 * SS + Math.sin(a) * 46} x2={SX + Math.cos(a) * 80} y2={SY - 118 * SS + Math.sin(a) * 80}
                stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 机に置いた虫めがね */}
        <g transform="translate(1250 712) rotate(-20)">
          <rect x={30} y={-8} width={110} height={16} rx={8} fill="#6E4526" stroke={ink} strokeWidth={4} />
          <circle r={40} fill={HP.screenCore} opacity={0.5} />
          <circle r={40} fill="none" stroke={HP.brass} strokeWidth={10} />
          <circle r={40} fill="none" stroke={ink} strokeWidth={3} />
        </g>
        {/* ものさし */}
        <Monosashi x={960} y={560} s={1} lit={lit} f={f} focus={f >= 34 ? 0 : undefined} />
        {/* 木くず (刻んだ溝のうしろに積もる) */}
        {Array.from({ length: 9 }, (_, i) => {
          const q = (i + 0.5) / 9;
          if (q > lit) return null;
          const cx = 280 + 310 * q + (rnd(390, i) - 0.5) * 20;
          const cy = 470 - rnd(391, i) * 30;
          return <path key={i} d={`M ${cx - 10} ${cy} q 10 -16 18 0 q 4 10 -8 10`} stroke={HP.woodDark} strokeWidth={5} fill={HP.wood} />;
        })}
        {/* 刻み終わりの光のはじけ */}
        {burst > 0 && burst < 1 && (
          <g opacity={1 - burst}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r1 = 120 + burst * 120, r2 = r1 + 50;
              return <line key={i} x1={sx + Math.cos(a) * r1} y1={560 + Math.sin(a) * r1 * 0.6} x2={sx + Math.cos(a) * r2} y2={560 + Math.sin(a) * r2 * 0.6}
                stroke={HP.hi} strokeWidth={9} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 区画の上に乗る週の暦の1枚 */}
        {f >= 35 && (
          <g transform={`translate(${sx} ${sy}) scale(${pop(seg(f, 35, 41))}) rotate(${-4 + Math.sin(f / 9) * 1.5})`}>
            <rect x={-96} y={-116} width={192} height={116} rx={6} fill={ink} opacity={0.2} transform="translate(6 4)" />
            <rect x={-96} y={-116} width={192} height={116} rx={6} fill={KRP.white} stroke={ink} strokeWidth={5} />
            <rect x={-96} y={-116} width={192} height={30} rx={6} fill={HP.hi} stroke={ink} strokeWidth={5} />
            {[-60, -20, 20, 60].map((rx) => <circle key={rx} cx={rx} cy={-116} r={7} fill={KRP.paper} stroke={ink} strokeWidth={3} />)}
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x={-86 + i * 25} y={-72} width={20} height={44} rx={4}
                fill={i === 6 ? HP.hi : KRP.cream} stroke={i === 6 ? HP.hiDark : KRP.gray} strokeWidth={3} />
            ))}
            <path d="M -76 -14 L 76 -14" stroke={KRP.gray} strokeWidth={3} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #40 第2章、休まないと、罰金。
// 格: 山 / seed 5040
// どこ: 江戸の農村の辻。奥に山・鎮守の森と鳥居・茅葺きの家 (煙)、手前に水を張った田んぼ
// 演出: 辻に立つ高札 (字はなし。鍬に×・巾着のマーク)。若者3人 (藍の半纏・鉢巻) が高札の前で腕組み、得意げにうなずく。
//       右に章扉の題字
// 動き: 幟がはためく / 田んぼの水面がきらめく / 若者がうなずく / カメラがゆっくり右へ流れる
const Hm040: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const pan = lerp(0, -24, easeInOut(seg(f, 0, 42)));
  const youths: { x: number; face: "smile" | "angry"; ph: number }[] = [
    { x: 300, face: "smile", ph: 1 }, { x: 560, face: "angry", ph: 2 }, { x: 830, face: "smile", ph: 3 },
  ];
  return (
    <Frame f={f} seed={5040}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={2} title="休まないと、罰金。" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(${pan} 0) scale(1.02)`}>
        {/* 空と山 */}
        <rect x={-40} y={-40} width={2040} height={560} fill="#CFE3E8" />
        <path d="M -40 380 Q 200 220 420 330 Q 640 180 900 320 Q 1160 200 1400 330 Q 1660 230 2000 340 L 2000 520 L -40 520 Z" fill={C.mtFar} stroke={ink} strokeWidth={4} />
        <path d="M -40 450 Q 300 340 600 430 Q 900 360 1200 440 Q 1500 380 2000 450 L 2000 540 L -40 540 Z" fill={C.mtNear} stroke={ink} strokeWidth={4} />
        {/* 鎮守の森と鳥居 */}
        {[[1180, 420, 90], [1260, 390, 110], [1350, 410, 96], [1430, 430, 80]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.mori : C.moriDark} stroke={ink} strokeWidth={5} />
        ))}
        <HmBbTorii x={1300} y={520} s={0.7} />
        {/* 茅葺きの家 */}
        <HmBbKaya x={1720} y={540} s={0.8} f={f} smoke />
        {/* 地面 (田んぼと畦道) */}
        <rect x={-40} y={520} width={2040} height={600} fill={C.ineDark} />
        {[[-40, 540, 760, 220], [760, 540, 1240, 220], [-40, 900, 2040, 220]].map(([px, py, w, h], i) => (
          <g key={i}>
            <rect x={px} y={py} width={w} height={h} fill={C.paddy} stroke={ink} strokeWidth={5} />
            {Array.from({ length: Math.floor((w as number) / 60) }, (_, k) => Array.from({ length: 3 }, (_, r) => (
              <path key={`${k}-${r}`} d={`M ${(px as number) + 30 + k * 60 + (r % 2) * 30} ${(py as number) + 40 + r * 60} q -10 -8 -12 -18 M ${(px as number) + 30 + k * 60 + (r % 2) * 30} ${(py as number) + 40 + r * 60} l 0 -22 M ${(px as number) + 30 + k * 60 + (r % 2) * 30} ${(py as number) + 40 + r * 60} q 10 -8 12 -18`}
                stroke={C.ineDark} strokeWidth={3} />
            )))}
          </g>
        ))}
        {/* 空の映り込みのきらめき */}
        {Array.from({ length: 14 }, (_, i) => {
          const px = rnd(401, i) * 1900, py = 560 + rnd(402, i) * 180 + (i % 3 === 0 ? 360 : 0);
          const tw = Math.max(0, Math.sin(f / 4 + i * 1.7));
          return <path key={i} d={`M ${px} ${py - 14 * tw} L ${px + 4} ${py} L ${px} ${py + 14 * tw} L ${px - 4} ${py} Z M ${px - 14 * tw} ${py} L ${px} ${py - 4} L ${px + 14 * tw} ${py} L ${px} ${py + 4} Z`}
            fill={KRP.white} opacity={0.9} />;
        })}
        {/* 辻 (十字の道) */}
        <rect x={-40} y={760} width={2040} height={140} fill={C.tsuchi} stroke={ink} strokeWidth={5} />
        <path d="M 470 760 L 520 520 L 600 520 L 650 760 Z" fill={C.tsuchi} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={rnd(403, i) * 1900} cy={780 + rnd(404, i) * 110} r={4} fill={C.tsuchiDark} />)}
        {/* 高札 */}
        <g>
          {[430, 690].map((px) => <rect key={px} x={px - 12} y={210} width={24} height={600} fill={C.edoWood} stroke={ink} strokeWidth={5} />)}
          <path d="M 360 240 L 560 172 L 760 240 L 748 258 L 372 258 Z" fill={C.edoWoodDark} stroke={ink} strokeWidth={6} />
          <rect x={396} y={258} width={328} height={228} fill="#E6CFA0" stroke={ink} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={406} y1={290 + i * 50} x2={714} y2={290 + i * 50} stroke={C.kayaDark} strokeWidth={2} opacity={0.4} />)}
          <line x1={560} y1={270} x2={560} y2={474} stroke={ink} strokeWidth={3} opacity={0.5} />
          {/* 鍬に× */}
          <HmBbKuwa x={470} y={460} rot={-20} s={0.8} />
          <XMark x={480} y={370} s={0.9} t={seg(f, 6, 14)} />
          {/* 巾着 (お金) */}
          <g transform="translate(642 380)">
            <path d="M -30 -40 Q -60 0 -50 40 Q 0 66 50 40 Q 60 0 30 -40 Z" fill={KRP.brass} stroke={ink} strokeWidth={5} />
            <path d="M -34 -40 Q 0 -30 34 -40 L 30 -54 Q 0 -46 -30 -54 Z" fill={KRP.red} stroke={ink} strokeWidth={4} />
            <path d="M -8 -56 q -14 -16 -4 -26 M 8 -56 q 14 -16 4 -26" stroke={KRP.red} strokeWidth={5} fill="none" />
            <circle cx={0} cy={8} r={16} fill={KRP.gold} stroke={ink} strokeWidth={3} />
            <rect x={-5} y={3} width={10} height={10} fill={KRP.brass} stroke={ink} strokeWidth={2} />
          </g>
        </g>
        {/* 幟 */}
        <HmBbNobori x={110} y={820} h={640} f={f} />
        {/* 若者たち */}
        {youths.map((p, i) => {
          const nod = Math.sin(f / 6 + i * 1.3) * 2.5;
          return (
            <g key={i}>
              <HmBbShadow x={p.x} y={834} rx={70} />
              <Person x={p.x} y={830} s={0.95} f={f} face={p.face} pose="armsFolded" cloth={C.ai} clothDark={C.momohiki} phase={p.ph}
                lean={nod} gaze={[i === 0 ? 3 : i === 2 ? -3 : 0, 1]} />
              <HmBbWear x={p.x} y={830} s={0.95} f={f} phase={p.ph} lean={nod} hachimaki={KRP.white} topknot={ink} />
            </g>
          );
        })}
        {/* 得意げの「ふふん」の鼻息 */}
        {[300, 830].map((px, i) => (
          <g key={i} opacity={0.7}>
            <path d={`M ${px + (i ? -40 : 40)} ${830 - 205} q ${i ? -20 : 20} -6 ${i ? -30 : 30} 4`} stroke={ink} strokeWidth={4} fill="none"
              transform={`translate(0 ${-((f + i * 9) % 18)})`} opacity={1 - ((f + i * 9) % 18) / 18} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #41 江戸時代の日本には、7日に1度の休みは、ありませんでした。
// 格: 図 / seed 5041
// どこ: 江戸の商家の帳場。黒い柱にかけた暦 (YasumiCalendar title="江戸")。左にのれん、右奥に大福帳、手前に帳場格子と算盤
// 演出: 暦の7日ごとの位置に、赤い点線の枠と「?」が出る → すぐに×がつく (= そんな休みはない)。番頭が帳場格子の向こうで首を振る
// 動き: f6-21 点線の?が順に出る / f22-38 ×が順につく / 番頭の首振り / 算盤の玉がぱちぱち / カメラが暦に少し寄る
const Hm041: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const CX = 900, CY = 420, CS = 0.95;
  const shake = Math.sin(f / 2.5) * 6 * (f > 20 ? 1 : 0.3);
  return (
    <Frame f={f} seed={5041}>
      <g transform={`translate(960 500) scale(${cam}) translate(-960 -500)`}>
        {/* 壁 (土壁と板) */}
        <rect x={-40} y={-40} width={2000} height={820} fill="#D9C39A" />
        <rect x={-40} y={-40} width={2000} height={60} fill={C.edoWoodDark} />
        {[120, 260].map((py) => <rect key={py} x={-40} y={py} width={2000} height={14} fill={C.edoWood} stroke={ink} strokeWidth={3} />)}
        {/* のれん (左の出入り口) */}
        <rect x={60} y={40} width={420} height={740} fill={C.doma} stroke={ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => {
          const sw = Math.sin(f / 9 + i) * 6;
          return (
            <path key={i} d={`M ${70 + i * 102} 40 L ${166 + i * 102} 40 L ${166 + i * 102 + sw} 400 L ${70 + i * 102 + sw} 400 Z`}
              fill={C.noren} stroke={ink} strokeWidth={5} />
          );
        })}
        <circle cx={270 + Math.sin(f / 9 + 1.5) * 5} cy={220} r={56} fill="none" stroke={KRP.white} strokeWidth={10} />
        {/* 大福帳 (右奥の壁にぶら下げた帳簿) */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${1660 + i * 150} 180) rotate(${Math.sin(f / 16 + i) * 2})`}>
            <line x1={0} y1={-60} x2={0} y2={-10} stroke={ink} strokeWidth={4} />
            <rect x={-56} y={-10} width={112} height={250} rx={4} fill={C.paperOld} stroke={ink} strokeWidth={6} />
            <rect x={-56} y={-10} width={112} height={40} fill={C.ai} stroke={ink} strokeWidth={5} />
            {[60, 100, 140, 180, 220].map((py) => <line key={py} x1={-56} y1={py} x2={56} y2={py} stroke={ink} strokeWidth={2} opacity={0.3} />)}
            <path d="M -56 0 L -66 236 L -56 240" stroke={ink} strokeWidth={4} fill="none" />
          </g>
        ))}
        {/* 柱 */}
        <rect x={840} y={-40} width={120} height={830} fill={C.edoWoodDark} stroke={ink} strokeWidth={6} />
        <path d="M 870 0 L 870 780 M 920 0 L 920 780" stroke={C.edoWood} strokeWidth={4} opacity={0.6} />
        {/* 暦 */}
        <line x1={CX} y1={CY - 270 * CS} x2={CX - 120} y2={CY - 250 * CS} stroke={ink} strokeWidth={4} />
        <line x1={CX} y1={CY - 270 * CS} x2={CX + 120} y2={CY - 250 * CS} stroke={ink} strokeWidth={4} />
        <circle cx={CX} cy={CY - 272 * CS} r={10} fill={KRP.brass} stroke={ink} strokeWidth={3} />
        <YasumiCalendar x={CX} y={CY} s={CS} title="江戸" days={30} startDow={0} rest={[]} weekHead={false} f={f} />
        {/* 7日ごとの「?」と× */}
        {[0, 1, 2, 3].map((r) => {
          const cx = CX + 216 * CS, cy = CY + (-111 + 62 * r) * CS;
          const q = seg(f, 6 + r * 4, 10 + r * 4);
          const x = seg(f, 22 + r * 4, 26 + r * 4);
          return (
            <g key={r}>
              {q > 0 && <rect x={cx - 38} y={cy - 33} width={76} height={66} rx={10} fill={HP.restSoft} fillOpacity={0.4 * q}
                stroke={HP.rest} strokeWidth={5} strokeDasharray="10 8" strokeDashoffset={-f} opacity={q} />}
              {x < 1 && <QMark x={cx} y={cy + 22} s={0.42 * (1 - x * 0.6)} t={q} f={f} color={HP.rest} />}
              <XMark x={cx} y={cy} s={0.5} t={x} color={ink} />
            </g>
          );
        })}
        {/* 床 (板の間) */}
        <rect x={-40} y={780} width={2000} height={340} fill={C.edoWood} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-40} y1={800 + i * 32} x2={1960} y2={800 + i * 32} stroke={C.edoWoodDark} strokeWidth={3} opacity={0.6} />)}
        {/* 番頭 (帳場格子の向こうに座る・首を振る) */}
        <Person x={1500} y={760} s={1.0} f={f} face="normal" pose="sit" cloth={C.shibucha} clothDark={C.shibuchaDark} lean={shake} gaze={[-5, 0]} phase={2} />
        <HmBbWear x={1500} y={760} s={1.0} f={f} phase={2} lean={shake} collar={KRP.white} topknot={ink} />
        {f > 20 && [0, 1].map((k) => (
          <path key={k} d={k ? "M 1580 470 q 20 30 0 60" : "M 1420 470 q -20 30 0 60"} stroke={ink} strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        {/* 帳場格子 */}
        <g>
          <rect x={1260} y={666} width={520} height={124} fill={C.edoWood} stroke={ink} strokeWidth={6} />
          {Array.from({ length: 13 }, (_, i) => <rect key={i} x={1276 + i * 38} y={678} width={14} height={100} fill={C.edoWoodDark} />)}
          <rect x={1250} y={656} width={540} height={20} rx={4} fill={C.edoWoodDark} stroke={ink} strokeWidth={5} />
        </g>
        {/* 算盤 (手前の机) */}
        <g transform="translate(1060 772)">
          <rect x={-200} y={0} width={400} height={30} fill={C.edoWoodDark} stroke={ink} strokeWidth={5} />
          <rect x={-170} y={-90} width={340} height={100} rx={8} fill={C.edoWood} stroke={ink} strokeWidth={6} />
          <rect x={-170} y={-62} width={340} height={8} fill={C.edoWoodDark} />
          {Array.from({ length: 9 }, (_, i) => {
            const flick = Math.floor((f + i * 5) / 6) % 9 === i ? 1 : 0;
            return (
              <g key={i}>
                <line x1={-150 + i * 37} y1={-84} x2={-150 + i * 37} y2={2} stroke={ink} strokeWidth={3} />
                <ellipse cx={-150 + i * 37} cy={-74 + flick * 8} rx={15} ry={7} fill={ink} />
                {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={-150 + i * 37} cy={-40 + k * 12 - (k === 0 && flick ? 8 : 0)} rx={15} ry={6} fill={C.edoWoodDark} stroke={ink} strokeWidth={1.5} />)}
              </g>
            );
          })}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #42 休みを決めるのは、カレンダーではなく、お祭りや行事です。
// 格: 山 / seed 5042
// どこ: 江戸の村の秋祭り。神社の境内 (拝殿・鳥居・のぼり・屋台・提灯の列)。拝殿の前の掲示板に暦
// 演出: 暦 (weekHead=false) のばらばらの日に、門松・提灯・灯籠のしるしがぽん、ぽんと貼られて赤く塗られる (不規則)。
//       その前を神輿が「わっしょい」と上下に揺れながら横切る
// 動き: 神輿が左から右へ / f6-34 しるしが貼られていく / 提灯がゆれる / 担ぎ手が上下
const Hm042: React.FC<{ f: number }> = ({ f }) => {
  const REST = [2, 3, 12, 15, 16, 27];
  const KIND: Record<number, "pine" | "lantern" | "toro"> = { 2: "pine", 3: "pine", 12: "lantern", 15: "toro", 16: "toro", 27: "lantern" };
  const CX = 960, CY = 330, CS = 0.74, SD = 2;
  const t = seg(f, 6, 34);
  const mx = lerp(-160, 1240, f / 54);
  const hop = -Math.abs(Math.sin(f / 4)) * 16;
  return (
    <Frame f={f} seed={5042}>
      {/* 夕方の空 */}
      <rect x={-40} y={-40} width={2000} height={700} fill={C.eveSky} />
      <rect x={-40} y={300} width={2000} height={360} fill={C.eveSky2} opacity={0.6} />
      {/* 鎮守の森 */}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={i * 240 - 40} cy={400 + (i % 2) * 30} r={150} fill={i % 2 ? C.mori : C.moriDark} stroke={ink} strokeWidth={5} />
      ))}
      {/* 拝殿 (掲示板のうしろ) */}
      <g>
        <path d="M 520 300 Q 960 180 1400 300 L 1360 330 L 560 330 Z" fill={C.tile} stroke={ink} strokeWidth={6} />
        <rect x={600} y={330} width={720} height={260} fill={C.edoWood} stroke={ink} strokeWidth={6} />
        {[640, 800, 1120, 1280].map((px) => <rect key={px} x={px - 10} y={330} width={20} height={260} fill={C.torii} stroke={ink} strokeWidth={4} />)}
      </g>
      {/* 鳥居 (左) */}
      <HmBbTorii x={280} y={640} s={1.6} />
      {/* 地面 (境内の砂利) */}
      <rect x={-40} y={600} width={2000} height={520} fill="#D9CDB0" />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={rnd(421, i) * 1960} cy={620 + rnd(422, i) * 460} r={3} fill={KRP.grayDark} opacity={0.4} />)}
      {/* 屋台 (左右) */}
      {[[60, 1], [1600, -1]].map(([px], i) => (
        <g key={i} transform={`translate(${px} 0)`}>
          <rect x={20} y={470} width={300} height={190} fill={C.edoWood} stroke={ink} strokeWidth={6} />
          <path d="M 0 470 L 340 470 L 320 410 L 20 410 Z" fill={KRP.white} stroke={ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M ${20 + k * 60} 410 L ${50 + k * 60} 410 L ${44 + k * 60} 470 L ${10 + k * 60} 470 Z`} fill={KRP.red} />)}
          {i === 0 ? [80, 150, 220].map((cx) => <circle key={cx} cx={cx} cy={540} r={24} fill={[KRP.red, KRP.yellow, KRP.green][(cx - 80) / 70]} stroke={ink} strokeWidth={4} />)
            : [80, 160, 240].map((cx) => <g key={cx}><rect x={cx - 8} y={510} width={16} height={60} fill={C.edoWoodDark} /><circle cx={cx} cy={510} r={18} fill="#F2B8C0" stroke={ink} strokeWidth={3} /></g>)}
        </g>
      ))}
      {/* のぼり */}
      <HmBbNobori x={480} y={680} h={560} f={f} ph={0} />
      <HmBbNobori x={1430} y={680} h={560} f={f} ph={1.2} />
      {/* 提灯の列 (上) */}
      <path d={`M -40 70 Q 960 ${150 + Math.sin(f / 10) * 6} 1960 70`} stroke={ink} strokeWidth={4} fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const px = 40 + i * 166;
        const tt = px / 1920;
        const py = 70 + (150 - 70) * 4 * tt * (1 - tt) * 1 + 20;
        return <HmBbMark key={i} kind="lantern" x={px} y={py + 30} s={0.9} f={f + i * 7} />;
      })}
      {/* 掲示板と暦 */}
      <g>
        {[CX - 230, CX + 230].map((px) => <rect key={px} x={px - 12} y={120} width={24} height={600} fill={C.edoWood} stroke={ink} strokeWidth={5} />)}
        <path d={`M ${CX - 280} 120 L ${CX} 72 L ${CX + 280} 120 L ${CX + 270} 136 L ${CX - 270} 136 Z`} fill={C.edoWoodDark} stroke={ink} strokeWidth={6} />
        <rect x={CX - 236} y={136} width={472} height={390} fill={C.edoWood} stroke={ink} strokeWidth={5} />
        <YasumiCalendar x={CX} y={CY + 10} s={CS} title="江戸" days={30} startDow={SD} rest={REST} weekHead={false} t={t} f={f} />
        {REST.map((d, k) => {
          const cell = SD + d - 1;
          const cx = CX + (-216 + 72 * (cell % 7)) * CS;
          const cy = CY + 10 + (-111 + 62 * Math.floor(cell / 7)) * CS;
          const tt = clamp01(t * REST.length - k);
          return <HmBbMark key={d} kind={KIND[d]} x={cx + 16} y={cy - 6} s={0.4} t={tt} f={f} />;
        })}
      </g>
      {/* 神輿と担ぎ手 */}
      <g transform={`translate(${mx} ${hop})`}>
        {[-300, -175, 175, 300].map((dx, i) => (
          <g key={i}>
            <HmBbShadow x={dx} y={904 - hop} rx={60} />
            <Person x={dx} y={900} s={0.8} f={f} face={i % 2 ? "joy" : "smile"} pose="stand" cloth={C.ai} clothDark={C.momohiki} phase={i} />
            <HmBbWear x={dx} y={900} s={0.8} f={f} phase={i} hachimaki={KRP.white} topknot={ink} />
          </g>
        ))}
        {/* 担ぎ棒 */}
        <rect x={-380} y={770} width={760} height={22} rx={10} fill={C.edoWood} stroke={ink} strokeWidth={5} />
        {/* 神輿の本体 */}
        <rect x={-130} y={690} width={260} height={80} fill={C.edoWoodDark} stroke={ink} strokeWidth={6} />
        <rect x={-110} y={620} width={220} height={74} fill={C.torii} stroke={ink} strokeWidth={6} />
        {[-70, 0, 70].map((px) => <rect key={px} x={px - 16} y={632} width={32} height={50} fill={KRP.brass} stroke={ink} strokeWidth={3} />)}
        <path d="M -160 624 Q 0 540 160 624 L 140 632 L -140 632 Z" fill={ink} />
        <path d="M -160 624 Q -170 600 -150 596 M 160 624 Q 170 600 150 596" stroke={KRP.brass} strokeWidth={8} fill="none" />
        <g transform={`translate(0 572) rotate(${Math.sin(f / 4) * 4})`}>
          <path d="M 0 -50 Q 30 -40 26 -10 L 40 -30 L 30 0 L -30 0 L -40 -30 L -26 -10 Q -30 -40 0 -50 Z" fill={KRP.brass} stroke={ink} strokeWidth={4} />
        </g>
        {/* 房 */}
        {[-150, 150].map((px) => <path key={px} d={`M ${px} 630 l ${Math.sin(f / 4) * 8} 60`} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />)}
      </g>
      <TagPlate x={1640} y={176} text="秋祭り" size={40} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #43 住みこみで働く奉公人の休みは、「藪入り」。1月16日と、7月16日です。
// 格: 山 / seed 5043
// どこ: 江戸の商家の店先 (瓦屋根・のれん・格子・土間)。左は通りと柳
// 演出: 丁稚と女中が風呂敷包みを背負い、主人にもらった小遣いの包みを握って店から駆け出す。主人 (渋茶) は戸口で手を振る。
//       格子の壁にかかった柱暦の「1月16日」「7月16日」が赤く光る。左上に札「藪入り」
// 動き: 2人が左へ駆け出す (砂ぼこり) / のれんが揺れる / 主人が手を振る / f20〜 札が光る
const Hm043: React.FC<{ f: number }> = ({ f }) => {
  const run = easeOut(seg(f, 6, 42));
  const runners = [
    { x: lerp(900, 470, run), s: 0.8, cloth: C.ai, dark: C.aiDark, ph: 1, bun: undefined as string | undefined },
    { x: lerp(1060, 760, run), s: 0.92, cloth: C.jochu, dark: C.jochuDark, ph: 2, bun: KRP.yellow as string },
  ];
  const wave = Math.sin(f / 4) * 8;
  return (
    <Frame f={f} seed={5043}>
      {/* 空と向かいの町並み */}
      <rect x={-40} y={-40} width={2000} height={820} fill="#DCEBEF" />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={-40 + i * 150} y={420} width={140} height={360} fill={C.tsuchi} stroke={ink} strokeWidth={4} />
          <path d={`M ${-56 + i * 150} 430 L ${30 + i * 150} 380 L ${116 + i * 150} 430 Z`} fill={C.tile} stroke={ink} strokeWidth={4} />
        </g>
      ))}
      {/* 柳 */}
      <g>
        <path d="M 210 800 Q 190 600 230 360" stroke={C.trunk} strokeWidth={26} fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const sw = Math.sin(f / 10 + i) * 10;
          return <path key={i} d={`M ${130 + i * 24} 360 Q ${120 + i * 24 + sw} 480 ${110 + i * 26 + sw * 2} 640`} stroke={C.hedge} strokeWidth={8} fill="none" strokeLinecap="round" />;
        })}
        <ellipse cx={230} cy={360} rx={140} ry={60} fill={C.hedge} stroke={ink} strokeWidth={4} />
      </g>
      {/* 通り */}
      <rect x={-40} y={780} width={2000} height={340} fill={C.tsuchi} />
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={rnd(431, i) * 1900} cy={800 + rnd(432, i) * 260} r={4} fill={C.tsuchiDark} />)}
      {/* 商家 */}
      <g>
        <rect x={860} y={120} width={1100} height={680} fill={C.edoWoodDark} stroke={ink} strokeWidth={7} />
        {/* 瓦屋根 */}
        <path d="M 820 150 L 900 40 L 1980 40 L 1980 150 Z" fill={C.tile} stroke={ink} strokeWidth={7} />
        {Array.from({ length: 18 }, (_, i) => <line key={i} x1={900 + i * 62} y1={44} x2={880 + i * 62} y2={146} stroke={C.tileDark} strokeWidth={5} />)}
        <rect x={820} y={140} width={1160} height={22} fill={C.tileDark} stroke={ink} strokeWidth={5} />
        {/* 土間 (入口の奥) */}
        <rect x={900} y={162} width={460} height={638} fill={C.doma} stroke={ink} strokeWidth={5} />
        <rect x={960} y={470} width={340} height={40} fill={C.edoWood} stroke={ink} strokeWidth={4} />
        {/* のれん */}
        {[0, 1, 2, 3].map((i) => {
          const sw = Math.sin(f / 5 + i * 0.8) * (8 + seg(f, 4, 14) * 16) * (1 - seg(f, 30, 42) * 0.5);
          return <path key={i} d={`M ${904 + i * 114} 162 L ${1014 + i * 114} 162 L ${1014 + i * 114 + sw} 380 L ${904 + i * 114 + sw * 1.2} 384 Z`}
            fill={C.noren} stroke={ink} strokeWidth={5} />;
        })}
        <circle cx={1130 + Math.sin(f / 5 + 1.5) * 10} cy={280} r={50} fill="none" stroke={KRP.white} strokeWidth={9} />
        {/* 柱 */}
        <rect x={1360} y={162} width={44} height={638} fill={C.edoWood} stroke={ink} strokeWidth={5} />
        {/* 格子 */}
        <rect x={1404} y={162} width={556} height={638} fill={C.edoWood} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 18 }, (_, i) => <rect key={i} x={1414 + i * 31} y={170} width={12} height={620} fill={C.edoWoodDark} />)}
      </g>
      {/* 柱暦 (格子の壁) */}
      <HmBbKoyomi x={1550} y={430} s={0.95} f={f} glow={seg(f, 18, 28)} />
      {/* 主人 (戸口で手を振る) */}
      <HmBbShadow x={1160} y={804} rx={74} />
      <Person x={1160} y={800} s={1.0} f={f} face="smile" pose="raise" cloth={C.shibucha} clothDark={C.shibuchaDark} phase={3} lean={wave * 0.4} gaze={[-5, 0]} />
      <HmBbWear x={1160} y={800} s={1.0} f={f} phase={3} lean={wave * 0.4} robe={C.shibucha} obi={C.shibuchaDark} collar={KRP.white} topknot={ink} />
      {[0, 1].map((k) => <path key={k} d={`M ${1250 + k * 24} ${470 + k * 6} q 14 14 0 28`} stroke={ink} strokeWidth={4} fill="none" opacity={0.6} />)}
      {/* 駆け出す2人 */}
      {runners.map((p, i) => {
        const y = 820;
        return (
          <g key={i}>
            {/* 砂ぼこり */}
            {[0, 1, 2].map((k) => {
              const q = ((f + k * 6 + i * 3) % 18) / 18;
              return <circle key={k} cx={p.x + 60 + q * 80} cy={y - 10 - q * 20} r={10 + q * 22} fill={C.tsuchi} stroke={ink} strokeWidth={3} opacity={(1 - q) * run} />;
            })}
            {/* 背中の風呂敷 (右が背中) */}
            <HmBbFuroshiki x={p.x + 52 * p.s} y={y - 150 * p.s} s={p.s * 1.0} />
            <HmBbShadow x={p.x} y={y + 4} rx={60 * p.s} />
            <Person x={p.x} y={y} s={p.s} f={f} face="joy" pose="run" cloth={p.cloth} clothDark={p.dark} phase={p.ph} lean={-8} hair="cap" />
            <HmBbWear x={p.x} y={y} s={p.s} f={f} phase={p.ph} lean={-8} mode="run" robe={p.cloth} obi={i === 0 ? C.shibucha : KRP.yellow}
              apron={i === 0 ? C.shibucha : undefined} bun={p.bun} />
            {/* 結び目 */}
            <circle cx={p.x - 14 * p.s} cy={y - 150 * p.s} r={10 * p.s} fill={C.furoshikiDark} stroke={ink} strokeWidth={3} />
            {/* 小遣いの包み (握っている) */}
            <g transform={`translate(${p.x - 120 * p.s} ${y - 92 * p.s}) rotate(-14)`}>
              <rect x={-18} y={-24} width={36} height={46} rx={3} fill={KRP.white} stroke={ink} strokeWidth={4} />
              <rect x={-18} y={-6} width={36} height={8} fill={KRP.red} />
            </g>
          </g>
        );
      })}
      {/* 弾む足どりの線 */}
      {runners.map((p, i) => (
        <path key={i} d={`M ${p.x + 90} ${700 - i * 40} l 60 0 M ${p.x + 100} ${730 - i * 40} l 44 0`} stroke={ink} strokeWidth={5} strokeLinecap="round" opacity={0.5 * run} />
      ))}
      <TagPlate x={560} y={170} text="藪入り" size={56} t={seg(f, 2, 12)} fill={HP.restSoft} color={HP.rest} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #44 この日は、地獄の釜のふたまで開いて、えんま様も休むと言われていました。
// 格: 山 / seed 5044
// どこ: 地獄 (絵本調)。赤い岩の柱・ゆらめく炎の模様・ひび割れの地面。中央左に大きな鉄の釜、右奥にえんま様の机
// 演出: 釜のふたがぱかっと開いて湯気がもくもく。えんま様は冠を脱いで机に置き、扇であおぎながら大あくび。
//       手前で青鬼と赤鬼が金棒を置いて寝そべり、いびきの泡
// 動き: f6-14 ふたが開く / f10〜 湯気 / f18-38 あくび / 扇 / いびきの泡 / カメラがゆっくり引く
const Hm044: React.FC<{ f: number }> = ({ f }) => {
  const cam = lerp(1.08, 1.0, easeInOut(seg(f, 0, 42)));
  const lid = pop(seg(f, 6, 14)) * 46;
  const steamOn = seg(f, 8, 16);
  const yawn = seg(f, 18, 38);
  const fan = Math.sin(f / 3) * 16;
  return (
    <Frame f={f} seed={5044}>
      <defs>
        <linearGradient id="hmbbHell44" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.hellTop} /><stop offset="0.55" stopColor={C.hellMid} /><stop offset="1" stopColor={C.hellLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        <rect x={-40} y={-40} width={2000} height={820} fill="url(#hmbbHell44)" />
        {/* 岩の柱 */}
        {[[-40, 80, 200], [180, 200, 150], [1700, 60, 260], [1560, 240, 150], [720, 280, 120]].map(([px, top, w], i) => (
          <path key={i} d={`M ${px} 780 L ${(px as number) + 20} ${(top as number) + 60} L ${(px as number) + (w as number) * 0.4} ${top} L ${(px as number) + (w as number) * 0.7} ${(top as number) + 80} L ${(px as number) + (w as number)} 780 Z`}
            fill={i % 2 ? C.rock : C.rockDark} stroke={ink} strokeWidth={6} />
        ))}
        {/* 炎の模様 */}
        {Array.from({ length: 12 }, (_, i) => {
          const fx = 40 + i * 165, fy = 780;
          const h = 120 + rnd(441, i) * 90;
          return (
            <g key={i}>
              <path d={flamePath(fx, fy, h, f, i)} fill={C.flame} stroke={ink} strokeWidth={4} opacity={0.9} />
              <path d={flamePath(fx, fy, h * 0.55, f + 3, i + 2)} fill={C.flameCore} />
            </g>
          );
        })}
        {/* 地面 */}
        <rect x={-40} y={770} width={2000} height={360} fill={C.rockDark} />
        {[[100, 830, 400, 870], [700, 880, 1100, 840], [1300, 900, 1800, 860]].map(([a, b, c, d], i) => (
          <path key={i} d={`M ${a} ${b} L ${(a + c) / 2} ${(b + d) / 2 + 14} L ${c} ${d}`} stroke={C.flame} strokeWidth={6} fill="none" opacity={0.6 + 0.3 * Math.sin(f / 5 + i)} />
        ))}
        {/* えんま様の机 */}
        <g>
          <g transform="translate(1450 760) scale(1.35)">
            <HmBbEnma yawn={yawn} eyes="sleepy" fan={fan} />
          </g>
          <rect x={1110} y={560} width={680} height={36} rx={6} fill={C.desk} stroke={ink} strokeWidth={7} />
          <rect x={1140} y={596} width={620} height={170} fill={C.deskDark} stroke={ink} strokeWidth={7} />
          <rect x={1160} y={616} width={580} height={130} fill="none" stroke={C.gold} strokeWidth={6} />
          {/* 脱いだ冠 */}
          <HmBbKanmuri x={1210} y={560} s={0.85} rot={-12} />
          {/* 帳面と筆 */}
          <rect x={1600} y={528} width={150} height={34} rx={4} fill={C.robe} stroke={ink} strokeWidth={5} />
          <rect x={1612} y={520} width={126} height={12} fill={C.paperOld} stroke={ink} strokeWidth={3} />
          <rect x={1520} y={540} width={70} height={22} rx={6} fill={ink} />
          <line x1={1530} y1={530} x2={1610} y2={500} stroke={C.edoWood} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* あくびの「ふわぁ」の息 */}
        {/* 大きな釜 */}
        <g>
          {/* 釜の下の火と薪 */}
          {[600, 700, 800].map((lx, i) => <rect key={i} x={lx - 80} y={776 + (i % 2) * 8} width={160} height={24} rx={10} fill={C.edoWoodDark} stroke={ink} strokeWidth={4} transform={`rotate(${(i - 1) * 12} ${lx} 786)`} />)}
          {[560, 650, 740, 830].map((lx, i) => <path key={i} d={flamePath(lx, 790, 90, f * 1.5, i + 5)} fill={C.flame} stroke={ink} strokeWidth={4} />)}
          {/* 脚 */}
          {[480, 920].map((lx) => <rect key={lx} x={lx - 16} y={700} width={32} height={90} fill={C.kamaDark} stroke={ink} strokeWidth={5} />)}
          <path d="M 400 540 Q 380 760 560 790 L 840 790 Q 1020 760 1000 540 Z" fill={C.kama} stroke={ink} strokeWidth={8} />
          <path d="M 440 600 Q 440 720 560 750" stroke={KRP.grayDark} strokeWidth={8} fill="none" opacity={0.6} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={470 + i * 115} cy={600} r={10} fill={C.kamaDark} stroke={ink} strokeWidth={3} />)}
          <ellipse cx={700} cy={540} rx={310} ry={56} fill={C.kamaDark} stroke={ink} strokeWidth={8} />
          <ellipse cx={700} cy={540} rx={270} ry={40} fill={C.yu} />
          {lid > 4 && [0, 1, 2, 3, 4].map((i) => {
            const q = ((f * 1.4 + i * 9) % 30) / 30;
            return <circle key={i} cx={560 + i * 70} cy={540 - q * 10} r={8 + q * 10} fill="none" stroke={KRP.white} strokeWidth={4} opacity={1 - q} />;
          })}
          {/* 湯気 */}
          {Array.from({ length: 9 }, (_, i) => {
            const q = ((f * 1.2 + i * 11) % 60) / 60;
            return <circle key={i} cx={700 + (i - 4) * 56 + Math.sin(q * 6 + i) * 24} cy={510 - q * 440} r={30 + q * 64}
              fill={C.steam} stroke={ink} strokeWidth={4} opacity={(1 - q) * 0.9 * steamOn} />;
          })}
          {/* ふた (右端の蝶番で、ぱかっ) */}
          <g transform={`rotate(${lid * 0.85} 1000 528)`}>
            <ellipse cx={700} cy={524} rx={316} ry={50} fill={C.edoWoodDark} stroke={ink} strokeWidth={8} />
            <ellipse cx={700} cy={516} rx={290} ry={38} fill={C.edoWood} stroke={ink} strokeWidth={4} />
            {[560, 700, 840].map((px) => <line key={px} x1={px} y1={482} x2={px} y2={552} stroke={C.edoWoodDark} strokeWidth={5} />)}
            <rect x={660} y={470} width={80} height={30} rx={10} fill={C.edoWoodDark} stroke={ink} strokeWidth={5} />
          </g>
          {/* ぱかっ の線 */}
          {f >= 10 && f < 22 && (
            <g opacity={1 - seg(f, 10, 22)} stroke={ink} strokeWidth={7} strokeLinecap="round">
              <line x1={380} y1={500} x2={320} y2={470} /><line x1={380} y1={540} x2={300} y2={540} /><line x1={420} y1={460} x2={380} y2={410} />
            </g>
          )}
        </g>
        {/* 寝そべる小鬼と金棒 */}
        <HmBbKanabo x={430} y={850} rot={-80} s={0.9} />
        <HmBbOni x={240} y={830} s={0.95} f={f} col={C.oniB} dark={C.oniBDark} ph={0} />
        <HmBbKanabo x={1620} y={860} rot={84} s={0.9} />
        <HmBbOni x={1350} y={840} s={0.95} f={f} col={C.oniR} dark={C.oniRDark} ph={13} />
        <TagPlate x={960} y={110} text="地獄" size={46} t={seg(f, 2, 10)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #45 えんま様が休むなら、奉公人も休んでいい。なかなか強い理屈です。
// 格: 山 / seed 5045
// どこ: 画面を上下に分ける。上 = 地獄 (開いた釜・寝る小鬼)、下 = 丁稚の実家の縁側 (障子・軒の風鈴・庭)
// 演出: 上のえんま様と下の丁稚が、同じ角度で同時にごろんと横になる (頭の位置も縦にそろう)。
//       縁側では母親が腰かけて、お盆のお茶を丁稚のほうへすっと出す。真ん中の天秤 (左の皿に冠・右の皿に風呂敷) がゆれて水平に止まる
// 動き: f4-18 2人が同時に寝転ぶ / 天秤がゆれて f38 で水平 / 風鈴がゆれる / お茶の湯気
const Hm045: React.FC<{ f: number }> = ({ f }) => {
  const rot = lerp(-48, -90, easeOut(seg(f, 4, 18)));
  const beam = 16 * Math.cos(f * 0.35) * Math.max(0, 1 - f / 38);
  const tray = lerp(660, 860, easeInOut(seg(f, 12, 32)));
  const bell = Math.sin(f / 6) * 14;
  const DX = 1608, DY = 742;
  const EX = 1380 + 280 * 1.15, EY = 368;
  const PIV: [number, number] = [960, 250];
  const pan = (side: -1 | 1): [number, number] => {
    const a = (beam * Math.PI) / 180;
    return [PIV[0] + side * 230 * Math.cos(a), PIV[1] + side * 230 * Math.sin(a)];
  };
  return (
    <Frame f={f} seed={5045}>
      <defs>
        <linearGradient id="hmbbHell45" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.hellTop} /><stop offset="1" stopColor={C.hellMid} />
        </linearGradient>
        <clipPath id="hmbbTop45"><rect x={-40} y={-40} width={2000} height={560} /></clipPath>
        <clipPath id="hmbbBot45"><rect x={-40} y={520} width={2000} height={620} /></clipPath>
      </defs>
      {/* ===== 上: 地獄 ===== */}
      <g clipPath="url(#hmbbTop45)">
        <rect x={-40} y={-40} width={2000} height={600} fill="url(#hmbbHell45)" />
        {[[-40, 60, 180], [1760, 40, 220], [620, 140, 110]].map(([px, top, w], i) => (
          <path key={i} d={`M ${px} 520 L ${(px as number) + 20} ${(top as number) + 50} L ${(px as number) + (w as number) * 0.45} ${top} L ${(px as number) + (w as number)} 520 Z`}
            fill={i % 2 ? C.rock : C.rockDark} stroke={ink} strokeWidth={6} />
        ))}
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={flamePath(60 + i * 200, 480, 90 + rnd(451, i) * 60, f, i)} fill={C.flame} stroke={ink} strokeWidth={4} opacity={0.85} />)}
        <rect x={-40} y={470} width={2000} height={90} fill={C.rockDark} />
        {/* 開いた釜 */}
        <g transform="translate(330 470) scale(0.55)">
          <path d="M -300 -260 Q -320 -20 -140 0 L 140 0 Q 320 -20 300 -260 Z" fill={C.kama} stroke={ink} strokeWidth={10} />
          <ellipse cx={0} cy={-260} rx={310} ry={56} fill={C.kamaDark} stroke={ink} strokeWidth={10} />
          <ellipse cx={0} cy={-260} rx={270} ry={40} fill={C.yu} />
          <g transform="rotate(40 300 -270)">
            <ellipse cx={0} cy={-276} rx={316} ry={50} fill={C.edoWood} stroke={ink} strokeWidth={9} />
          </g>
          {Array.from({ length: 5 }, (_, i) => {
            const q = ((f * 1.2 + i * 12) % 60) / 60;
            return <circle key={i} cx={(i - 2) * 80 + Math.sin(q * 6) * 20} cy={-300 - q * 400} r={40 + q * 60} fill={C.steam} stroke={ink} strokeWidth={6} opacity={(1 - q) * 0.85} />;
          })}
        </g>
        <HmBbOni x={680} y={478} s={0.62} f={f} col={C.oniB} dark={C.oniBDark} ph={5} />
        {/* 岩の枕 */}
        <ellipse cx={1380} cy={448} rx={96} ry={36} fill={C.rock} stroke={ink} strokeWidth={6} />
        <HmBbKanmuri x={1250} y={474} s={0.6} rot={10} />
        {/* えんま様 (ごろん) */}
        <g transform={`rotate(${rot} ${EX} ${EY})`}>
          <g transform={`translate(${EX} ${EY}) scale(1.15)`}>
            <HmBbEnma eyes="joy" yawn={0.15} />
          </g>
        </g>
        <TagPlate x={760} y={80} text="地獄" size={40} />
      </g>
      {/* ===== 下: 実家の縁側 ===== */}
      <g clipPath="url(#hmbbBot45)">
        <rect x={-40} y={520} width={2000} height={620} fill="#CFE6D8" />
        {/* 軒と障子 */}
        <rect x={-40} y={540} width={2000} height={40} fill={C.edoWoodDark} stroke={ink} strokeWidth={6} />
        <rect x={-40} y={580} width={2000} height={190} fill={C.shoji} stroke={ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-40 + i * 170} y1={580} x2={-40 + i * 170} y2={770} stroke={C.edoWood} strokeWidth={10} />)}
        {Array.from({ length: 36 }, (_, i) => <line key={i} x1={-40 + i * 57} y1={580} x2={-40 + i * 57} y2={770} stroke={C.edoWood} strokeWidth={3} opacity={0.6} />)}
        {[640, 700].map((py) => <line key={py} x1={-40} y1={py} x2={1960} y2={py} stroke={C.edoWood} strokeWidth={3} opacity={0.6} />)}
        {/* 縁側 */}
        <rect x={-40} y={770} width={2000} height={40} fill={C.edoWood} stroke={ink} strokeWidth={6} />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-40 + i * 100} y1={772} x2={-40 + i * 100} y2={808} stroke={C.edoWoodDark} strokeWidth={3} />)}
        <rect x={-40} y={810} width={2000} height={60} fill={C.edoWoodDark} stroke={ink} strokeWidth={5} />
        {/* 庭 */}
        <rect x={-40} y={870} width={2000} height={260} fill={C.grass} />
        <ellipse cx={1100} cy={960} rx={90} ry={26} fill={C.stone} stroke={ink} strokeWidth={4} />
        <ellipse cx={1320} cy={1000} rx={80} ry={24} fill={C.stone} stroke={ink} strokeWidth={4} />
        {/* 風鈴 */}
        <g transform={`translate(240 580) rotate(${bell})`}>
          <line x1={0} y1={0} x2={0} y2={40} stroke={ink} strokeWidth={3} />
          <path d="M -26 76 Q -28 40 0 40 Q 28 40 26 76 Z" fill={KRP.blueSoft} stroke={ink} strokeWidth={4} />
          <path d="M -16 60 q 8 -8 16 0 q 8 8 16 0" stroke={KRP.red} strokeWidth={3} fill="none" />
          <line x1={0} y1={76} x2={0} y2={110} stroke={ink} strokeWidth={2} />
          <rect x={-12} y={110} width={24} height={60} fill={KRP.yellow} stroke={ink} strokeWidth={3} transform={`rotate(${bell * 0.8} 0 110)`} />
        </g>
        {Math.abs(bell) > 10 && <path d="M 290 640 q 10 10 0 20 M 306 632 q 14 18 0 36" stroke={ink} strokeWidth={3} fill="none" opacity={0.5} />}
        {/* 母親 (縁側に腰かける) */}
        <Person x={520} y={856} s={0.95} f={f} face="smile" pose="sit" cloth={C.plum} clothDark={C.plumDark} phase={2} gaze={[5, 0]} />
        <HmBbWear x={520} y={856} s={0.95} f={f} phase={2} mode="sit" robe={C.plum} obi={C.shibucha} collar={KRP.white} bun={KRP.yellow} />
        {/* お盆とお茶 */}
        <g transform={`translate(${tray} 772)`}>
          <ellipse cx={0} cy={0} rx={70} ry={14} fill={C.edoWoodDark} stroke={ink} strokeWidth={4} />
          <path d="M -24 -4 L -20 -40 L 20 -40 L 24 -4 Z" fill="#7FA88A" stroke={ink} strokeWidth={4} />
          <rect x={36} y={-22} width={22} height={18} rx={4} fill={KRP.white} stroke={ink} strokeWidth={3} />
          {[0, 1].map((i) => <path key={i} d={`M ${-8 + i * 14} -48 q 8 -12 0 -24`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.8}
            transform={`translate(0 ${-((f + i * 7) % 14)})`} />)}
        </g>
        {/* 座布団の枕 */}
        <rect x={1300} y={776} width={150} height={30} rx={12} fill="#C9574A" stroke={ink} strokeWidth={5} />
        {/* 丁稚 (ごろん) */}
        <g transform={`rotate(${rot} ${DX} ${DY})`}>
          <Person x={DX} y={DY} s={1.0} f={f} face="joy" cloth={C.ai} clothDark={C.aiDark} phase={4} still />
          <HmBbWear x={DX} y={DY} s={1.0} f={f} phase={4} still robe={C.ai} obi={C.shibucha} />
        </g>
        <HmBbFuroshiki x={1820} y={760} s={0.8} />
        <TagPlate x={760} y={630} text="実家" size={40} />
      </g>
      {/* 上下の境目 (破いた紙) */}
      <path d={`M -40 512 ${Array.from({ length: 25 }, (_, i) => `L ${i * 82} ${512 + (i % 2 ? 14 : -6)}`).join(" ")} L 1960 512 L 1960 540 ${Array.from({ length: 25 }, (_, i) => `L ${1960 - i * 82} ${540 + (i % 2 ? 8 : -8)}`).join(" ")} L -40 540 Z`}
        fill={KRP.cream} stroke={ink} strokeWidth={5} />
      {/* 天秤 (真ん中) */}
      <g>
        <rect x={PIV[0] - 12} y={PIV[1]} width={24} height={530} fill={KRP.brass} stroke={ink} strokeWidth={5} />
        <ellipse cx={PIV[0]} cy={790} rx={90} ry={20} fill={HP.brassDark} stroke={ink} strokeWidth={5} />
        <g transform={`rotate(${beam} ${PIV[0]} ${PIV[1]})`}>
          <rect x={PIV[0] - 240} y={PIV[1] - 10} width={480} height={20} rx={8} fill={KRP.brass} stroke={ink} strokeWidth={5} />
        </g>
        <circle cx={PIV[0]} cy={PIV[1]} r={20} fill={HP.brassDark} stroke={ink} strokeWidth={5} />
        <path d={`M ${PIV[0]} ${PIV[1] - 20} L ${PIV[0]} ${PIV[1] - 60}`} stroke={ink} strokeWidth={6} />
        <polygon points={`${PIV[0] - 12},${PIV[1] - 60} ${PIV[0] + 12},${PIV[1] - 60} ${PIV[0]},${PIV[1] - 30}`} fill={beam === 0 ? HP.rest : ink} />
        {([-1, 1] as const).map((side) => {
          const [px, py] = pan(side);
          return (
            <g key={side}>
              <path d={`M ${px} ${py} L ${px - 70} ${py + 150} M ${px} ${py} L ${px + 70} ${py + 150}`} stroke={ink} strokeWidth={4} />
              <path d={`M ${px - 90} ${py + 150} Q ${px} ${py + 200} ${px + 90} ${py + 150} Z`} fill={KRP.brass} stroke={ink} strokeWidth={5} />
              {side === -1 ? <HmBbKanmuri x={px} y={py + 150} s={0.5} /> : <HmBbFuroshiki x={px} y={py + 140} s={0.7} />}
            </g>
          );
        })}
        {f >= 38 && <g opacity={seg(f, 38, 42)}>{[-1, 1].map((d) => <path key={d} d={`M ${PIV[0] + d * 270} ${PIV[1] - 30} l ${d * 16} -16 M ${PIV[0] + d * 270} ${PIV[1]} l ${d * 22} 0`}
          stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />)}</g>}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #46 もっとも、休みがこの2日だけだったわけでは、ないようです。
// 格: 並 / seed 5046
// どこ: #43 と同じ商家の格子の壁に寄る。柱暦 (HmBbKoyomi) を大きく
// 演出: 「1月16日」「7月16日」の札のほかに、門松・灯籠・提灯の小札がぽつぽつ足されていく。
//       右で番頭が両手を下に向けて「まあまあ」となだめる (冷や汗)。手前の棚の茶碗から湯気
// 動き: f8-38 小札が足されていく / 番頭の手が上下 / 湯気 / カメラがゆっくり右から左へ
const Hm046: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(-30, 10, easeInOut(seg(f, 0, 42)));
  const pat = Math.sin(f / 3.5) * 8;
  const BX = 1500, BY = 900, BS = 1.2;
  return (
    <Frame f={f} seed={5046}>
      <g transform={`translate(${pan} 0)`}>
        {/* 格子の壁 */}
        <rect x={-60} y={-40} width={2040} height={1160} fill={C.edoWood} />
        {Array.from({ length: 36 }, (_, i) => <rect key={i} x={-50 + i * 58} y={-40} width={22} height={1160} fill={C.edoWoodDark} />)}
        <rect x={-60} y={-40} width={2040} height={70} fill={C.edoWoodDark} stroke={ink} strokeWidth={6} />
        {/* 柱 */}
        <rect x={1140} y={-40} width={80} height={1160} fill={C.edoWood} stroke={ink} strokeWidth={6} />
        {/* 柱暦 */}
        <HmBbKoyomi x={660} y={480} s={1.5} f={f} glow={1} extra={seg(f, 8, 38)} />
        {/* 棚と茶碗 */}
        <rect x={1060} y={760} width={360} height={26} fill={C.edoWoodDark} stroke={ink} strokeWidth={5} />
        <g transform="translate(1180 760)">
          <path d="M -40 0 Q -46 -50 -40 -56 L 40 -56 Q 46 -50 40 0 Z" fill="#7FA88A" stroke={ink} strokeWidth={5} />
          <ellipse cx={0} cy={-56} rx={40} ry={9} fill="#9C7A3A" stroke={ink} strokeWidth={3} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${-16 + i * 16} -66 q 10 -16 0 -32 q -10 -14 0 -28`} stroke={KRP.white} strokeWidth={5} fill="none"
            opacity={0.75 - ((f + i * 9) % 26) / 40} transform={`translate(0 ${-((f + i * 9) % 26)})`} />)}
        </g>
        {/* 番頭 (まあまあ) */}
        <HmBbShadow x={BX} y={BY + 4} rx={74} />
        <Person x={BX} y={BY} s={BS} f={f} face="smile" pose="hold" cloth={C.shibucha} clothDark={C.shibuchaDark} phase={2} lean={-4} gaze={[-5, 0]} />
        <HmBbWear x={BX} y={BY} s={BS} f={f} phase={2} lean={-4} robe={C.shibucha} obi={C.shibuchaDark} collar={KRP.white} topknot={ink} />
        {/* 下に向けた手のひら (上下になでる) */}
        {[-1, 1].map((d) => {
          const hx = BX + d * 30, hy = BY - 150 + pat;
          return (
            <g key={d}>
              <ellipse cx={hx} cy={hy} rx={22} ry={11} fill={KRP.white} stroke={ink} strokeWidth={4} />
              <path d={`M ${hx - 20} ${hy + 22} q 20 10 40 0`} stroke={ink} strokeWidth={3} fill="none" opacity={0.5} />
            </g>
          );
        })}
        {/* 冷や汗 */}
        <path d={`M ${BX + 70} ${BY - 320} q 10 16 0 24 q -10 -8 0 -24 Z`} fill={KRP.blue} stroke={ink} strokeWidth={3}
          transform={`translate(0 ${(f % 20) * 0.8})`} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #47 村には、村じゅうで仕事を休む、「遊び日」がありました。
// 格: 山 / seed 5047
// どこ: 江戸の村の全景 (田畑・曲がる川と橋・茅葺きの家々・鎮守の森と鳥居)。手前は村の広場
// 演出: 田んぼの人がみんな村へ引き上げていき (消える)、手前の家の軒先に鍬と鎌が立てかけられる。
//       広場で若者が相撲、子どもが凧揚げ、年寄りは縁台で碁。札「遊び日」
// 動き: f4-36 田んぼの人が去る / 鎌が立てかけられる / 相撲の押し合い / 凧がゆれる / 碁石がぱちり
const Hm047: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const push = Math.sin(f / 7) * 14;
  const kx = 1720 + Math.sin(f / 9) * 34, ky = 220 + Math.sin(f / 7) * 18;
  const KIDX = 1560, KIDY = 830, KIDS = 0.72;
  const hx = KIDX + 67 * KIDS, hy = KIDY - 310 * KIDS;
  const lean = lerp(-40, 0, easeOut(seg(f, 6, 16)));
  return (
    <Frame f={f} seed={5047}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        <rect x={-40} y={-40} width={2000} height={340} fill="#CFE5EE" />
        <path d="M -40 260 Q 300 120 600 230 Q 900 130 1250 240 Q 1550 150 2000 250 L 2000 320 L -40 320 Z" fill={C.mtFar} stroke={ink} strokeWidth={4} />
        {/* 田畑のつぎはぎ */}
        <rect x={-40} y={290} width={2000} height={300} fill={C.ine} />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, c) => {
          const x0 = -40 + c * 250 + r * 20, y0 = 290 + r * 56;
          const col = [C.ine, C.ineGold, C.paddy, C.ineDark][(r * 3 + c) % 4];
          return <path key={`${r}-${c}`} d={`M ${x0} ${y0} L ${x0 + 240} ${y0} L ${x0 + 250} ${y0 + 54} L ${x0 + 8} ${y0 + 54} Z`} fill={col} stroke={ink} strokeWidth={3} />;
        }))}
        {/* 川と橋 */}
        <path d="M 1000 290 Q 1100 380 980 450 Q 860 520 1060 590 L 1180 590 Q 980 520 1100 450 Q 1220 380 1080 290 Z" fill={C.water} stroke={ink} strokeWidth={4} />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${1010 + (i % 2) * 40} ${320 + i * 54} q 14 -6 28 0`} stroke={C.waterLight} strokeWidth={4} fill="none"
          transform={`translate(${Math.sin(f / 6 + i) * 6} 0)`} />)}
        <path d="M 920 452 Q 1040 420 1160 452" stroke={C.edoWood} strokeWidth={14} fill="none" />
        <path d="M 920 452 Q 1040 420 1160 452" stroke={ink} strokeWidth={3} fill="none" />
        {/* 鎮守の森と鳥居 */}
        {[[1640, 300, 80], [1730, 280, 96], [1820, 300, 80]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.mori : C.moriDark} stroke={ink} strokeWidth={4} />)}
        <HmBbTorii x={1730} y={390} s={0.55} />
        {/* 奥の家々 */}
        <HmBbKaya x={420} y={430} s={0.42} f={f} smoke />
        <HmBbKaya x={640} y={450} s={0.38} f={f} />
        <HmBbKaya x={1380} y={440} s={0.4} f={f} smoke />
        {/* 田畑から引き上げる人 (村へ向かって消えていく) */}
        {Array.from({ length: 7 }, (_, i) => {
          const sx = 220 + i * 240, sy = 340 + (i % 3) * 60;
          const go = seg(f, 4 + i * 2, 24 + i * 2);
          const tx = lerp(sx, i < 4 ? 520 : 1380, go);
          return <PersonMini key={i} x={tx} y={sy + 40} s={0.32} f={f} phase={i} color={i % 2 ? C.ai : C.momohiki} face="dot" />;
        }).map((el, i) => <g key={i} opacity={1 - seg(f, 18 + i * 2, 30 + i * 2)}>{el}</g>)}
        {/* 広場 */}
        <rect x={-40} y={580} width={2000} height={540} fill={C.tsuchi} />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(471, i) * 1960} cy={600 + rnd(472, i) * 460} r={4} fill={C.tsuchiDark} />)}
        {/* 手前の家と立てかけた鍬・鎌 */}
        <g>
          <rect x={-40} y={300} width={300} height={500} fill={C.tsuchi} stroke={ink} strokeWidth={6} />
          <rect x={200} y={300} width={22} height={500} fill={C.edoWood} stroke={ink} strokeWidth={5} />
          <path d="M -60 330 L 120 200 L 330 330 Z" fill={C.kaya} stroke={ink} strokeWidth={7} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-40 + i * 50} y1={326} x2={60 + i * 34} y2={212} stroke={C.kayaDark} strokeWidth={4} />)}
          <HmBbKuwa x={250} y={800} rot={-14} />
          <HmBbKuwa x={290} y={800} rot={-10} />
          <g transform={`rotate(${lean} 340 800)`}><HmBbKama x={340} y={800} rot={-8} /></g>
          <HmBbShadow x={300} y={804} rx={80} />
        </g>
        {/* 年寄りの碁 (縁台) */}
        <g>
          <rect x={380} y={756} width={420} height={26} fill={C.edoWood} stroke={ink} strokeWidth={5} />
          {[400, 780].map((px) => <rect key={px} x={px - 8} y={780} width={16} height={50} fill={C.edoWoodDark} stroke={ink} strokeWidth={4} />)}
          {[{ x: 430, g: 4, ph: 1 }, { x: 750, g: -4, ph: 2 }].map((p, i) => (
            <g key={i}>
              <Person x={p.x} y={814} s={0.85} f={f} face={i ? "normal" : "smile"} pose="sit" cloth={C.shibucha} clothDark={C.shibuchaDark} hair="none" gaze={[p.g, 3]} phase={p.ph} />
              <HmBbWear x={p.x} y={814} s={0.85} f={f} phase={p.ph} mode="sit" robe={C.shibucha} collar={KRP.white} topknot={KRP.gray} grayHair />
            </g>
          ))}
          <rect x={530} y={704} width={120} height={54} fill="#E2BE76" stroke={ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={540 + i * 25} y1={708} x2={540 + i * 25} y2={722} stroke={ink} strokeWidth={2} />)}
          <ellipse cx={590} cy={706} rx={60} ry={12} fill="#E2BE76" stroke={ink} strokeWidth={4} />
          {[[560, 704, 0], [584, 700, 1], [606, 708, 0], [620, 702, 1]].map(([px, py, c], i) => <ellipse key={i} cx={px} cy={py} rx={7} ry={4} fill={c ? KRP.white : ink} stroke={ink} strokeWidth={1.5} />)}
          {Math.floor(f / 12) % 2 === 1 && <ellipse cx={574} cy={710 - seg(f % 12, 0, 4) * 0} rx={7} ry={4} fill={ink} />}
          {f % 24 > 12 && f % 24 < 16 && <path d="M 560 690 l -10 -12 M 574 686 l 0 -14 M 588 690 l 10 -12" stroke={ink} strokeWidth={3} />}
        </g>
        {/* 相撲 */}
        <ellipse cx={1010} cy={830} rx={240} ry={52} fill="none" stroke={C.kaya} strokeWidth={16} />
        <ellipse cx={1010} cy={830} rx={240} ry={52} fill="none" stroke={ink} strokeWidth={3} />
        {[860, 1160].map((px, i) => <PersonMini key={i} x={px + (i ? 60 : -60)} y={760} s={0.5} f={f} phase={i + 3} color={i ? KRP.orange : KRP.green} arms="up" face="smile" />)}
        <HmBbShadow x={900 + push} y={824} rx={64} />
        <Person x={900 + push} y={820} s={0.92} f={f} face="angry" pose="hold" cloth={C.ai} clothDark={C.momohiki} lean={11} phase={1} />
        <HmBbWear x={900 + push} y={820} s={0.92} f={f} phase={1} lean={11} hachimaki={KRP.white} topknot={ink} />
        <HmBbShadow x={1120 + push} y={824} rx={64} />
        <Person x={1120 + push} y={820} s={0.92} f={f} face="worried" pose="hold" cloth={C.momohiki} clothDark={C.ai} lean={-11} phase={2} />
        <HmBbWear x={1120 + push} y={820} s={0.92} f={f} phase={2} lean={-11} hachimaki={KRP.red} topknot={ink} />
        {[0, 1].map((k) => {
          const q = ((f + k * 9) % 18) / 18;
          return <circle key={k} cx={1010 + push + (k ? 90 : -90) + (k ? q * 40 : -q * 40)} cy={810 - q * 20} r={10 + q * 16} fill={C.tsuchi} stroke={ink} strokeWidth={3} opacity={1 - q} />;
        })}
        {/* 凧あげの子 */}
        <path d={`M ${hx} ${hy} Q ${(hx + kx) / 2 + 40} ${(hy + ky) / 2 + 60} ${kx} ${ky + 40}`} stroke={ink} strokeWidth={3} fill="none" />
        <g transform={`translate(${kx} ${ky}) rotate(${Math.sin(f / 8) * 8})`}>
          <path d="M 0 -70 L 54 0 L 0 70 L -54 0 Z" fill={KRP.red} stroke={ink} strokeWidth={5} />
          <path d="M 0 -70 L 0 70 M -54 0 L 54 0" stroke={ink} strokeWidth={3} />
          <circle cx={0} cy={0} r={22} fill={KRP.yellow} stroke={ink} strokeWidth={3} />
          <path d={`M 0 70 q ${Math.sin(f / 4) * 20} 40 0 80 q ${-Math.sin(f / 4) * 20} 40 0 80`} stroke={KRP.blueDeep} strokeWidth={6} fill="none" />
        </g>
        <HmBbShadow x={KIDX} y={KIDY + 4} rx={52} />
        <Person x={KIDX} y={KIDY} s={KIDS} f={f} face="joy" pose="raise" cloth={C.ai} clothDark={C.momohiki} phase={4} gaze={[3, -4]} />
        <HmBbWear x={KIDX} y={KIDY} s={KIDS} f={f} phase={4} robe={C.ai} obi={KRP.yellow} />
        <TagPlate x={960} y={140} text="遊び日" size={56} t={seg(f, 2, 12)} fill={HP.restSoft} color={HP.rest} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_036: (f) => <Hm036 f={f} />,
  hm_037: (f) => <Hm037 f={f} />,
  hm_038: (f) => <Hm038 f={f} />,
  hm_039: (f) => <Hm039 f={f} />,
  hm_040: (f) => <Hm040 f={f} />,
  hm_041: (f) => <Hm041 f={f} />,
  hm_042: (f) => <Hm042 f={f} />,
  hm_043: (f) => <Hm043 f={f} />,
  hm_044: (f) => <Hm044 f={f} />,
  hm_045: (f) => <Hm045 f={f} />,
  hm_046: (f) => <Hm046 f={f} />,
  hm_047: (f) => <Hm047 f={f} />,
};

export const HM_BB_MOTIFS: string[] = [
  "hm_036", // #36
  "hm_037", // #37
  "hm_038", // #38
  "hm_039", // #39
  "hm_040", // #40
  "hm_041", // #41
  "hm_042", // #42
  "hm_043", // #43
  "hm_044", // #44
  "hm_045", // #45
  "hm_046", // #46
  "hm_047", // #47
];

export const himaBbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
