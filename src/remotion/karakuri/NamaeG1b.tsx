// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#143〜#151 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend, Ushiro, MeijiLock } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 検査室 (物差しのからくりの部屋)
  tile: "#CFE0D4", tileLine: "#A9C2B2", wainscot: "#8C6A48", wainscotDark: "#6E5236",
  roomFloor: "#C9B48C", roomFloorDark: "#A8936A",
  steel: "#7C8B96", steelDark: "#56636D", slot: "#E9E1CC", belt: "#4A4440",
  lampOff: "#9A9389", redGlow: "#FF7A5C", greenLamp: "#5DBB63", greenGlow: "#B7F0A8",
  board: "#33463C", boardDark: "#22302A", chalk: "#F4F1E6",
  smoke: "#C9C4BC",
  // 新聞
  news: "#ECE6D6", newsLine: "#B8B0A0",
  // 実績の小物
  roster: "#3F6B8F", award: "#C9A94A", clinic: "#EAF3F6",
  wornStain: "#C7A46E",
  // 現代の部屋 (#148・#149)
  wallNight: "#3E4660", wallNightDark: "#2C3248", lampWarm: "#FFE2A0", sofa: "#8E6E8E",
  wallDay: "#EFE6D2", curtain: "#9FBFA8", desk: "#B98A5A", deskDark: "#8E6640",
  phone: "#26262C", phoneScreen: "#F4F6FA", bubbleGray: "#E3E6EC", shadow: "#18141C",
  landline: "#EDE9E0",
  // 裁判所 (#150)
  sky: "#BFDDF0", skyLow: "#E3EFF5", stone: "#D9D2C2", stoneDark: "#B3AA95", glass: "#9FC4D9", glassDark: "#6E98B2",
  hedge: "#6E9E5A", hedgeDark: "#4E7A40", paving: "#C8C0B0", pavingDark: "#A69E8C", hall: "#EFE7D6", courtDoor: "#7A5232",
  // 計数器 (#151)
  workbench: "#A9794C", workbenchDark: "#7E5836", drum: "#F6F1E2", paperBundle: "#F4EFE2", stringTie: "#B5533F",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
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

// 放物線で飛ぶ: [x, y, 進み]
const ng1bFly = (f: number, a: number, b: number, from: [number, number], to: [number, number], h: number): [number, number, number] => {
  const t = seg(f, a, b);
  const x = lerp(from[0], to[0], t);
  const y = lerp(from[1], to[1], t) - Math.sin(t * Math.PI) * h;
  return [x, y, t];
};

/* -------------------------------------------------------------------
 * NG1bCard — 審査に通す「名前の札」(白い紙札+木の台。上にふりがな、下に漢字)
 *   x,y: 台の底の中心 / s / kanji / kana / hot: ふりがなの何文字目から赤くするか
 *   worn: 使い込まれた札 (角が丸く・しみ・折れ) / flat: 0〜1 床に寝た (縦につぶれる)
 * ------------------------------------------------------------------- */
const NG1bCard: React.FC<{
  x: number; y: number; s?: number; kanji: string; kana: string; rot?: number;
  hot?: number; worn?: boolean; flat?: number; batsu?: number;
}> = ({ x, y, s = 1, kanji, kana, rot = 0, hot = 99, worn = false, flat = 0, batsu = 0 }) => {
  const kch = Array.from(kana);
  const kfs = Math.min(46, Math.floor(230 / kch.length));
  const jfs = kanji.length > 1 ? 100 : 120;
  const sy = 1 - 0.45 * clamp01(flat);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${s * sy})`}>
      {/* 影 */}
      <rect x={-136} y={-206} width={284} height={206} rx={worn ? 30 : 10} fill={KRP.ink} opacity={0.16} />
      {/* 木の台 */}
      <rect x={-110} y={-26} width={220} height={26} rx={6} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 紙札 */}
      <rect x={-140} y={-216} width={280} height={196} rx={worn ? 32 : 10} fill={worn ? "#F3E8CF" : KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {/* ふりがなの欄 */}
      <line x1={-120} y1={-160} x2={120} y2={-160} stroke={KRP.gray} strokeWidth={3} strokeDasharray="8 6" />
      {kch.map((ch, i) => {
        const cx = (i - (kch.length - 1) / 2) * kfs * 1.02;
        return (
          <text key={i} x={cx} y={-172} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={kfs}
            fill={i >= hot ? KRP.red : KRP.ink}>{ch}</text>
        );
      })}
      <text x={0} y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={jfs} fill={NP.sumi}>{kanji}</text>
      {worn && (
        <g>
          {/* しみ・すり減り・折れ */}
          <ellipse cx={92} cy={-60} rx={26} ry={16} fill={C.wornStain} opacity={0.45} />
          <ellipse cx={-100} cy={-188} rx={18} ry={10} fill={C.wornStain} opacity={0.4} />
          <path d="M 108 -216 L 140 -184 L 108 -184 Z" fill="#E2D2AE" stroke={KRP.ink} strokeWidth={4} />
          <g stroke={C.wornStain} strokeWidth={3} opacity={0.7}>
            <line x1={-126} y1={-120} x2={-110} y2={-112} />
            <line x1={-124} y1={-96} x2={-112} y2={-92} />
            <line x1={118} y1={-130} x2={128} y2={-140} />
          </g>
          {/* 貼り直したテープ */}
          <rect x={-150} y={-74} width={56} height={22} rx={3} fill="#E8D9A8" opacity={0.85} stroke={KRP.ink} strokeWidth={2.5}
            transform="rotate(-28 -122 -63)" />
        </g>
      )}
      {batsu > 0 && <XMark x={0} y={-118} s={0.85} t={batsu} />}
    </g>
  );
};

/* -------------------------------------------------------------------
 * NG1bGauge — 「ふりがなの物差し」のからくり (#143〜#147 で同じ機械)
 *   x,y: ベルトの上面の中心 / layer: "back" (ベルトと奥の板) / "front" (柱・物差し・針・ランプ)
 *   needle: 針の角度 (度。0=まっすぐ上、-90=左端の緑、+90=右端の赤)
 *   lamp: "red" | "green" | "off" / lampOn: 0〜1 / buzz: 0〜1 (ブザーが鳴る)
 *   probe: 物差しの「さぐり針」のx (札の上をなぞる) / probeDown: 0〜1 下りる
 *   jolt: ガクンと引っかかる量 / f
 * ------------------------------------------------------------------- */
const NG1bGauge: React.FC<{
  x: number; y: number; s?: number; layer: "back" | "front"; needle?: number;
  lamp?: "red" | "green" | "off"; lampOn?: number; buzz?: number; probe?: number; probeDown?: number;
  jolt?: number; f: number; legs?: number;
}> = ({ x, y, s = 1, layer, needle = -60, lamp = "off", lampOn = 0, buzz = 0, probe = 0, probeDown = 0, jolt = 0, f, legs = 180 }) => {
  const shake = buzz > 0 ? Math.sin(f * 2.3) * 3 * buzz : 0;
  if (layer === "back") {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* ベルトの脚 */}
        {[-640, -240, 240, 640].map((lx) => (
          <g key={lx}>
            <rect x={lx - 14} y={40} width={28} height={legs - 40} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={lx - 30} y={legs - 10} width={60} height={14} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 奥の板 (門の中・方眼の計り板) */}
        <rect x={-180} y={-400} width={360} height={400} fill={C.slot} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.tileLine} strokeWidth={2.5} opacity={0.8}>
          {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1={-180} y1={-50 * (i + 1)} x2={180} y2={-50 * (i + 1)} />)}
          {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={-180 + 45 * (i + 1)} y1={-400} x2={-180 + 45 * (i + 1)} y2={0} />)}
        </g>
        {/* ベルト */}
        <rect x={-760} y={-6} width={1520} height={52} rx={26} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-744} y={-10} width={1488} height={14} rx={7} fill={C.belt} stroke={KRP.ink} strokeWidth={4} />
        {/* ベルトの目 (流れる) */}
        <g stroke="#6E6660" strokeWidth={4}>
          {Array.from({ length: 30 }, (_, i) => {
            const bx = -740 + ((i * 52 + f * 6) % 1480);
            return <line key={i} x1={bx} y1={-8} x2={bx} y2={2} />;
          })}
        </g>
        {/* ローラー */}
        {Array.from({ length: 11 }, (_, i) => {
          const rx = -700 + i * 140;
          return (
            <g key={i} transform={`translate(${rx} 22) rotate(${f * 9})`}>
              <circle r={17} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
              <line x1={-12} y1={0} x2={12} y2={0} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
      </g>
    );
  }
  const lampCol = lamp === "red" ? KRP.red : lamp === "green" ? C.greenLamp : C.lampOff;
  const glowCol = lamp === "red" ? C.redGlow : C.greenGlow;
  const blinkOn = lamp === "red" ? (Math.floor(f / 4) % 2 === 0 ? 1 : 0.55) : 1;
  const L = clamp01(lampOn) * blinkOn;
  return (
    <g transform={`translate(${x + shake} ${y - jolt * 10}) scale(${s}) rotate(${jolt * 1.6})`}>
      {/* 柱 (白木+真鍮の帯) */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * 200 - 26} y={-420} width={52} height={420} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
          <line x1={sd * 200 - 8} y1={-410} x2={sd * 200 - 8} y2={-10} stroke={NP.grain} strokeWidth={3} />
          {[-360, -200, -40].map((by) => (
            <rect key={by} x={sd * 200 - 30} y={by} width={60} height={16} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
      ))}
      {/* はり */}
      <rect x={-260} y={-450} width={520} height={52} rx={10} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {[-220, 220].map((bx) => <circle key={bx} cx={bx} cy={-424} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />)}
      {/* 物差し (真鍮の目盛り) */}
      <rect x={-176} y={-318} width={352} height={36} rx={5} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={3}>
        {Array.from({ length: 23 }, (_, i) => (
          <line key={i} x1={-165 + i * 15} y1={-318} x2={-165 + i * 15} y2={i % 5 === 0 ? -296 : -306} />
        ))}
      </g>
      {/* さぐり針 (物差しの上をすべり、下りて札のふりがなをなぞる) */}
      <g transform={`translate(${probe} 0)`}>
        <rect x={-18} y={-328} width={36} height={56} rx={6} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
        <line x1={0} y1={-272} x2={0} y2={-272 + 50 * probeDown} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={0} cy={-268 + 50 * probeDown} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 目盛り盤 (半円) */}
      <path d="M -150 -450 A 150 150 0 0 1 150 -450 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -126 -450 A 126 126 0 0 1 -60 -561" fill="none" stroke={KRP.green} strokeWidth={18} />
      <path d="M 60 -561 A 126 126 0 0 1 126 -450" fill="none" stroke={KRP.red} strokeWidth={18} />
      <g stroke={KRP.ink} strokeWidth={4}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (-90 + i * 22.5) * Math.PI / 180;
          return <line key={i} x1={Math.sin(a) * 104} y1={-450 - Math.cos(a) * 104} x2={Math.sin(a) * 88} y2={-450 - Math.cos(a) * 88} />;
        })}
      </g>
      <g transform={`rotate(${needle} 0 -450)`}>
        <polygon points="-8,-450 8,-450 0,-570" fill={KRP.ink} />
      </g>
      <circle cx={0} cy={-450} r={16} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* ブザー (左上のラッパ) */}
      <g transform={`translate(-250 -470) rotate(${buzz > 0 ? Math.sin(f * 1.9) * 8 * buzz : 0})`}>
        <rect x={-6} y={0} width={12} height={30} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 0 -6 L -70 -50 L -70 40 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={-70} cy={-5} rx={14} ry={45} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        {buzz > 0 && [0, 1, 2].map((i) => (
          <path key={i} d={`M ${-100 - i * 30} -50 Q ${-120 - i * 30} -5 ${-100 - i * 30} 40`} fill="none" stroke={KRP.red}
            strokeWidth={7} strokeLinecap="round" opacity={buzz * (0.4 + 0.6 * ((Math.floor(f / 2) + i) % 3 === 0 ? 1 : 0.4))} />
        ))}
      </g>
      {/* ランプ (右上) */}
      <g transform="translate(260 -470)">
        <rect x={-8} y={0} width={16} height={30} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {L > 0.01 && <circle cx={0} cy={-34} r={110} fill={glowCol} opacity={0.32 * L} />}
        <path d="M -44 -6 A 44 44 0 0 1 44 -6 Z" fill={L > 0.01 ? lampCol : C.lampOff} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -24 -22 A 26 26 0 0 1 4 -40" fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.6} strokeLinecap="round" />
        <rect x={-54} y={-8} width={108} height={14} rx={5} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
        {L > 0.5 && [0, 1, 2, 3, 4].map((i) => {
          const a = (-80 + i * 40) * Math.PI / 180;
          return <line key={i} x1={Math.sin(a) * 62} y1={-20 - Math.cos(a) * 62} x2={Math.sin(a) * 86} y2={-20 - Math.cos(a) * 86}
            stroke={lampCol} strokeWidth={7} strokeLinecap="round" />;
        })}
      </g>
    </g>
  );
};

/* 後ろ向きの人 (Person の顔の上を後頭部で覆う) */
const NG1bBackHead: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-228} r={66} fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -38 -262 Q 0 -284 38 -262" stroke={KRP.white} strokeWidth={5} opacity={0.22} fill="none" />
    {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 64} cy={-222} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
  </g>
);

/* 検査室の壁と床 (#143〜#145 は同じ部屋・同じ時間の続き) */
const NG1bInspectRoom: React.FC<{ floorY: number; f: number; clock?: boolean; clockAt?: [number, number] }> = ({ floorY, f, clock = true, clockAt = [330, 300] }) => (
  <g>
    <rect x={-40} y={-40} width={W + 80} height={floorY + 40} fill={C.tile} />
    <g stroke={C.tileLine} strokeWidth={3}>
      {Array.from({ length: 20 }, (_, i) => <line key={`v${i}`} x1={i * 100} y1={-40} x2={i * 100} y2={floorY - 140} />)}
      {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={-40} y1={i * 100} x2={W + 40} y2={i * 100} />).filter((_, i) => i * 100 < floorY - 140)}
    </g>
    {/* 腰板 */}
    <rect x={-40} y={floorY - 140} width={W + 80} height={140} fill={C.wainscot} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-40} y={floorY - 150} width={W + 80} height={16} fill={C.wainscotDark} stroke={KRP.ink} strokeWidth={4} />
    {Array.from({ length: 10 }, (_, i) => (
      <line key={i} x1={i * 200 + 60} y1={floorY - 134} x2={i * 200 + 60} y2={floorY} stroke={C.wainscotDark} strokeWidth={4} />
    ))}
    {/* 床 */}
    <rect x={-40} y={floorY} width={W + 80} height={H - floorY + 40} fill={C.roomFloor} stroke={KRP.ink} strokeWidth={6} />
    <g stroke={C.roomFloorDark} strokeWidth={4}>
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={960 + (i - 6) * 170} y1={floorY} x2={960 + (i - 6) * 330} y2={H + 40} />
      ))}
      <line x1={-40} y1={floorY + 90} x2={W + 40} y2={floorY + 90} />
      <line x1={-40} y1={floorY + 220} x2={W + 40} y2={floorY + 220} />
    </g>
    {/* 壁の時計 (秒針が動く) */}
    {clock && (
      <g transform={`translate(${clockAt[0]} ${clockAt[1]})`}>
        <circle r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.sin(a) * 44} y1={-Math.cos(a) * 44} x2={Math.sin(a) * 52} y2={-Math.cos(a) * 52} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={0} y1={0} x2={26} y2={10} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(f / 5) * 44} y2={-Math.cos(f / 5) * 44} stroke={KRP.red} strokeWidth={3} />
        <circle r={6} fill={KRP.ink} />
      </g>
    )}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #143 太郎と書いて、ジョージ。
// 格: 山 / seed 4143
// 絵: ★笑いの山。#141 の物差しのからくりに「太郎」の札+ふりがな「ジョージ」が通ると、**赤いランプとブザー** (f)、札がはじき出されて床に転がる。物差しの横に大きく「太郎」→「ジョージ」✕
// どこ: 役所の検査室。緑のタイル壁・腰板・板の床。中央に「ふりがなの物差し」のからくり (ベルト+門+目盛り盤+ランプ+ブザー)
// 演出: 札「太郎/ジョージ」が門に入る→さぐり針が下りる→針が赤へ振り切れる→赤ランプとブザー→札がはじき出されて床に転がる。右の黒板に「太郎→ジョージ」✕。係がのけぞる
// 動き: 札がベルトで流れる f0-14 / 針 f12-22 / 赤ランプ・ブザー f20〜 / 札が放物線で飛ぶ f24-36・着地の砂煙 / ✕ f22-28 / カメラがじわっと寄り、ブザーで揺れる
const Nm143: React.FC<{ f: number }> = ({ f }) => {
  const GX = 860, GY = 600, GS = 0.9;
  const inT = easeOut(seg(f, 0, 14));
  const probeDown = seg(f, 10, 16);
  const swing = seg(f, 14, 22);
  const needle = f < 22 ? lerp(-60, 78, easeOut(swing)) : 72 + Math.sin(f * 1.4) * 6;
  const alarm = f >= 20 ? 1 : 0;
  const [cx, cy, ft] = f < 24 ? [lerp(GX - 560 * GS, GX, inT), GY - 8, 0] : ng1bFly(f, 24, 36, [GX, GY - 8], [330, 790], 280);
  const landed = ft >= 1;
  const bounce = landed ? Math.abs(Math.sin(seg(f, 36, 42) * Math.PI)) * 10 * (1 - seg(f, 36, 42)) : 0;
  const rot = f < 24 ? 0 : landed ? -16 : lerp(0, -376, ft);
  const puff = seg(f, 34, 42);
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const shake = alarm ? Math.sin(f * 2.1) * 3 : 0;
  return (
    <Frame f={f} seed={4143}>
      <g transform={`translate(${shake} 0) translate(860 520) scale(${cam}) translate(-860 -520)`}>
        <NG1bInspectRoom floorY={740} f={f} />
        {/* 赤ランプの光が部屋を赤く染める */}
        {alarm > 0 && <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={KRP.red} opacity={Math.floor(f / 4) % 2 === 0 ? 0.08 : 0.03} />}
        {/* 右の黒板: 太郎 → ジョージ ✕ */}
        <g transform="rotate(1.5 1590 290)">
          <rect x={1334} y={84} width={520} height={400} rx={12} fill={C.wainscotDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1352} y={102} width={484} height={364} rx={6} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
          <g opacity={seg(f, 2, 8)}>
            <text x={1594} y={236} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={C.chalk}>太郎</text>
          </g>
          <g opacity={seg(f, 8, 12)}>
            <path d="M 1594 262 L 1594 316 M 1572 296 L 1594 320 L 1616 296" stroke={KRP.yellow} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g opacity={seg(f, 12, 16)}>
            <text x={1594} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={C.chalk}>ジョージ</text>
          </g>
          <XMark x={1594} y={386} s={1.5} t={seg(f, 22, 30)} />
          {/* チョーク受けとチョーク */}
          <rect x={1360} y={466} width={468} height={14} rx={4} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={1420} y={456} width={40} height={11} rx={4} fill={C.chalk} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        {/* 待っている札の木箱 (ベルトの左端) */}
        <g>
          <rect x={150} y={470} width={180} height={120} rx={8} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={168 + i * 50} y={432 + i * 6} width={44} height={60} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(${-8 + i * 7} ${190 + i * 50} 480)`} />
          ))}
          <rect x={150} y={470} width={180} height={34} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 機械 (奥) */}
        <NG1bGauge x={GX} y={GY} s={GS} layer="back" f={f} />
        {/* 流れてくる札 (門の中) */}
        {f < 24 && <NG1bCard x={cx} y={cy} s={GS} kanji="太郎" kana="ジョージ" hot={alarm ? 0 : 99} />}
        <NG1bGauge x={GX} y={GY} s={GS} layer="front" f={f} needle={needle} lamp="red" lampOn={alarm} buzz={alarm}
          probeDown={probeDown * (f < 24 ? 1 : 0)} jolt={f >= 20 && f < 24 ? 1 - seg(f, 20, 24) : 0} />
        {/* はじき出された札 (前の層) */}
        {f >= 24 && <NG1bCard x={cx} y={cy - bounce} s={GS} kanji="太郎" kana="ジョージ" rot={rot} flat={landed ? 1 : 0} hot={0} batsu={landed ? seg(f, 36, 42) : 0} />}
        {/* 飛ぶ軌跡 */}
        {f >= 24 && ft < 1 && (
          <path d={`M ${GX} ${GY - 120} Q ${(GX + cx) / 2} ${Math.min(GY, cy) - 200} ${cx} ${cy - 100}`} fill="none" stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 12" opacity={0.5} />
        )}
        {/* 着地の砂煙 */}
        {puff > 0 && puff < 1 && (
          <g opacity={(1 - puff) * 0.8}>
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={330 + (i - 2.5) * 44 * (0.4 + puff)} cy={784 - puff * 20} r={10 + puff * 16} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
            ))}
          </g>
        )}
        {/* 係の人: のけぞる */}
        <Person x={1590} y={800} s={0.95} f={f} cloth="#E8E4DA" clothDark="#2F3B5C" face={f >= 20 ? "surprised" : "normal"}
          pose={f >= 22 ? "banzai" : "hold"} lean={f >= 22 ? -6 : 0} gaze={f >= 24 ? [-8, 0] : [-6, 2]} />
        {/* 紺のベスト */}
        <g transform={`translate(1590 ${800 + Math.sin(f / 13) * 3}) scale(0.95) rotate(${f >= 22 ? -6 : 0})`}>
          <path d="M -58 -150 L -20 -150 L 0 -100 L 20 -150 L 58 -150 L 58 -56 L -58 -56 Z" fill="#2F3B5C" stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          {[-1, 1].map((sd) => <circle key={sd} cx={sd * 30} cy={-84} r={5} fill={NP.brass} />)}
        </g>
        {f >= 22 && [0, 1, 2].map((i) => (
          <line key={i} x1={1500 + i * 90} y1={460 - (i === 1 ? 14 : 0)} x2={1490 + i * 100} y2={430 - (i === 1 ? 18 : 0)} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #144 健と書いて、ケンサマ。
// 格: 山 / seed 4144
// 絵: 同じからくりに「健」+「ケンサマ」。今度は物差しが「さま」の部分でガクンと引っかかって、ブザー。札が飛ぶ。からくりの係の人 (Person) がずっこける
// どこ: 同じ検査室を、からくりの右寄りから少し寄って見る (#143 の続き)。壁に掲示板・消火器
// 演出: 札「健/ケンサマ」のふりがなを、さぐり針が左からなぞる→「サ」でガクンと引っかかり機械ごと跳ねる (火花)→ブザー・赤ランプ→札が右へ飛ぶ。左の係がずっこけ、バインダーが宙を舞う
// 動き: 札が流れる f0-12 / 針がなぞる f12-20 / ガクン f20-26 / ブザー f24〜 / 札が飛ぶ f28-38 / 係が倒れる f24-34 / カメラはガクンで縦に揺れる
const Nm144: React.FC<{ f: number }> = ({ f }) => {
  const GX = 1060, GY = 630, GS = 0.96;
  const inT = easeOut(seg(f, 0, 12));
  const probeDown = seg(f, 9, 13);
  const slide = seg(f, 12, 20);
  const probe = f < 20 ? lerp(-100, 24, slide) : 24 + Math.sin(f * 3) * 3 * (f < 28 ? 1 : 0);
  const stuck = f >= 20;
  const joltT = seg(f, 20, 26);
  const jolt = stuck && f < 28 ? Math.sin(joltT * Math.PI) * 1.2 : 0;
  const alarm = f >= 24 ? 1 : 0;
  const needle = f < 20 ? lerp(-60, 10, slide) : f < 24 ? 10 + Math.sin(f * 2) * 20 : lerp(30, 88, seg(f, 24, 28)) + Math.sin(f * 1.3) * 5;
  const [cx, cy, ft] = f < 28 ? [lerp(GX - 620 * GS, GX, inT), GY - 8, 0] : ng1bFly(f, 28, 38, [GX, GY - 8], [1690, 806], 240);
  const landed = ft >= 1;
  const rot = f < 28 ? 0 : landed ? 14 : lerp(0, 374, ft);
  // ずっこけ
  const fall = easeOut(seg(f, 24, 32));
  const pr = -100 * fall;
  const pivotX = 380, pivotY0 = 790 - 52, pivotY1 = 742;
  const pivotY = lerp(pivotY0, pivotY1, fall);
  const [bx, by, bt] = ng1bFly(f, 25, 39, [380, 680], [600, 796], 380);
  const camY = jolt * 14;
  return (
    <Frame f={f} seed={4144}>
      <g transform={`translate(0 ${camY}) translate(960 540) scale(1.04) translate(-960 -540)`}>
        <NG1bInspectRoom floorY={760} f={f} clock={false} />
        {alarm > 0 && <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={KRP.red} opacity={Math.floor(f / 4) % 2 === 0 ? 0.08 : 0.03} />}
        {/* 掲示板 (紙の文字は線だけ) */}
        <g transform="rotate(-1 1640 250)">
          <rect x={1460} y={110} width={380} height={290} rx={10} fill="#C9A274" stroke={KRP.ink} strokeWidth={7} />
          {[[1490, 140, -3, KRP.white], [1640, 150, 4, "#FBE7A6"], [1510, 270, 2, "#DDEBF3"], [1670, 278, -4, KRP.white]].map(([px, py, r, c], i) => (
            <g key={i} transform={`rotate(${r} ${Number(px) + 70} ${Number(py) + 50})`}>
              <rect x={Number(px)} y={Number(py)} width={140} height={100} fill={String(c)} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2].map((k) => <line key={k} x1={Number(px) + 16} y1={Number(py) + 30 + k * 24} x2={Number(px) + 124 - k * 20} y2={Number(py) + 30 + k * 24} stroke={KRP.gray} strokeWidth={5} />)}
              <circle cx={Number(px) + 70} cy={Number(py) + 6} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 消火器 */}
        <g transform="translate(1850 650)">
          <rect x={-30} y={-10} width={60} height={110} rx={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-14} y={-30} width={28} height={24} fill={KRP.ink} />
          <path d="M 10 -24 Q 50 -20 44 40" stroke={KRP.ink} strokeWidth={6} fill="none" />
          <rect x={-22} y={30} width={44} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <NG1bGauge x={GX} y={GY} s={GS} layer="back" f={f} />
        {f < 28 && <NG1bCard x={cx} y={cy} s={GS} kanji="健" kana="ケンサマ" hot={stuck ? 2 : 99} />}
        <NG1bGauge x={GX} y={GY} s={GS} layer="front" f={f} needle={needle} lamp="red" lampOn={alarm} buzz={alarm}
          probe={probe} probeDown={probeDown * (f < 28 ? 1 : 0)} jolt={jolt} />
        {/* 引っかかって飛び出したばね (ぼよん) */}
        {stuck && (
          <g transform={`translate(${GX + probe * GS} ${GY - 312 * GS + jolt * -10}) rotate(${-30 + Math.sin(f * 0.9) * 14 * (1 - seg(f, 28, 42))})`}>
            <path d={`M 0 0 ${Array.from({ length: 6 }, (_, k) => `l ${k % 2 ? -16 : 16} -14`).join(" ")}`} fill="none" stroke={C.steelDark} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={0} cy={-90} r={10} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {/* 引っかかった所の火花 */}
        {stuck && f < 30 && (
          <g transform={`translate(${GX + probe * GS} ${GY - 222 * GS})`} opacity={1 - seg(f, 24, 30)}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2 + f * 0.3;
              const r1 = 22, r2 = 46 + (i % 2) * 18;
              return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" />;
            })}
            <circle r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {/* 飛んだ札 */}
        {f >= 28 && <NG1bCard x={cx} y={cy} s={GS} kanji="健" kana="ケンサマ" rot={rot} flat={landed ? 1 : 0} hot={2} batsu={landed ? 1 : 0} />}
        {f >= 28 && !landed && [0, 1, 2].map((i) => (
          <line key={i} x1={cx - 150 - i * 10} y1={cy - 160 + i * 50} x2={cx - 230 - i * 20} y2={cy - 140 + i * 50} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        ))}
        {/* 係の人: ずっこける */}
        <g transform={`translate(${pivotX} ${pivotY}) rotate(${pr}) translate(${-pivotX} ${-pivotY0})`}>
          <Person x={pivotX} y={790} s={0.95} f={f} cloth="#E8E4DA" clothDark="#2F3B5C" still={fall > 0}
            face={f >= 20 ? "surprised" : "normal"} pose={fall > 0 ? "banzai" : "hold"} gaze={[8, -2]} />
          <g transform={`translate(${pivotX} 790) scale(0.95)`}>
            <path d="M -58 -150 L -20 -150 L 0 -104 L 20 -150 L 58 -150 L 58 -56 L -58 -56 Z" fill="#2F3B5C" stroke={KRP.ink} strokeWidth={4} />
            {[-1, 1].map((sd) => <circle key={sd} cx={sd * 30} cy={-84} r={5} fill={NP.brass} />)}
          </g>
        </g>
        {fall > 0.3 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7}>
            <path d="M 240 600 Q 300 540 380 560" fill="none" />
            <path d="M 210 650 Q 270 600 340 610" fill="none" />
          </g>
        )}
        {fall >= 1 && <ellipse cx={300} cy={800} rx={200} ry={14} fill={KRP.ink} opacity={0.15} />}
        {/* 宙を舞うバインダー */}
        {f >= 25 && (
          <g transform={`translate(${bx} ${by}) rotate(${bt >= 1 ? 8 : bt * 540}) scale(1 ${bt >= 1 ? 0.5 : 1})`}>
            <rect x={-50} y={-66} width={100} height={132} rx={8} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-40} y={-50} width={80} height={106} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-22} y={-74} width={44} height={18} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
            {[0, 1, 2].map((k) => <line key={k} x1={-28} y1={-26 + k * 24} x2={26} y2={-26 + k * 24} stroke={KRP.gray} strokeWidth={4} />)}
          </g>
        )}
        {f < 25 && (
          <g transform={`translate(380 ${672 + Math.sin(f / 13) * 3})`}>
            <rect x={-46} y={-60} width={92} height={120} rx={8} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-36} y={-46} width={72} height={96} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-20} y={-68} width={40} height={16} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #145 高と書いて、ヒクシ。
// 格: 山 / seed 4145
// 絵: 同じからくりに「高」+「ヒクシ」。物差しの針が**上と下にぐるぐる回って混乱** (高いのに低い)、ぷしゅーと煙。札が飛ぶ。3枚の✕の札が床に並ぶ
// どこ: 同じ検査室を引きで (#144 の続き)。からくりの右に「高さの柱」(高/低) を足した姿。右の床に✕の札が並ぶ
// 演出: 札「高/ヒクシ」が入ると、目盛り盤の針がぐるぐる回り、高さの柱の玉も上へ下へ暴れる (高いのに低い)。盤から「ぷしゅー」と煙。札が飛んで床の3枚目になる。係は頭を抱える
// 動き: 札が流れる f0-12 / 針が回る f12〜 / 玉が上下 f12〜 / 煙 f16〜 / 札が飛ぶ f26-38 / カメラが寄りから引いて床の列を見せる f0-30
const Nm145: React.FC<{ f: number }> = ({ f }) => {
  const GX = 860, GY = 560, GS = 0.85;
  const inT = easeOut(seg(f, 0, 12));
  const crazy = seg(f, 12, 18);
  const needle = f < 12 ? -60 : -60 + crazy * ((f - 12) * 38 + Math.sin(f / 3) * 60);
  const ballY = f < 12 ? 0.5 : 0.5 + 0.45 * Math.sin((f - 12) * 0.9) * crazy;
  const alarm = f >= 18 ? 1 : 0;
  const [cx, cy, ft] = f < 26 ? [lerp(GX - 600 * GS, GX, inT), GY - 8, 0] : ng1bFly(f, 26, 38, [GX, GY - 8], [1740, 786], 300);
  const landed = ft >= 1;
  const rot = f < 26 ? 0 : landed ? -8 : lerp(0, -368, ft);
  const cam = lerp(1.12, 1, easeInOut(seg(f, 4, 30)));
  const MX = GX + 380 * GS; // 高さの柱
  const mTop = GY - 400 * GS, mBot = GY - 60 * GS;
  return (
    <Frame f={f} seed={4145}>
      <g transform={`translate(900 420) scale(${cam}) translate(-900 -420)`}>
        <NG1bInspectRoom floorY={700} f={f} />
        {alarm > 0 && <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={KRP.red} opacity={Math.floor(f / 4) % 2 === 0 ? 0.07 : 0.02} />}
        <NG1bGauge x={GX} y={GY} s={GS} layer="back" f={f} legs={170} />
        {f < 26 && <NG1bCard x={cx} y={cy} s={GS} kanji="高" kana="ヒクシ" hot={alarm ? 0 : 99} />}
        <NG1bGauge x={GX} y={GY} s={GS} layer="front" f={f} needle={needle} lamp="red" lampOn={alarm} buzz={alarm}
          probeDown={seg(f, 8, 12) * (f < 26 ? 1 : 0)} />
        {/* 針の残像 (ぐるぐる) */}
        {crazy > 0 && (
          <g transform={`translate(${GX} ${GY - 450 * GS})`} opacity={0.5}>
            <circle r={118 * GS} fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="20 16" transform={`rotate(${f * 20})`} />
          </g>
        )}
        {/* 高さの柱 (高/低) と暴れる玉 */}
        <g>
          <rect x={MX - 22} y={mTop - 10} width={44} height={mBot - mTop + 20} rx={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={MX - 8} y={mTop} width={16} height={mBot - mTop} rx={8} fill={C.tileLine} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={MX + 22} y1={mTop + (i * (mBot - mTop)) / 8} x2={MX + 40} y2={mTop + (i * (mBot - mTop)) / 8} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={MX - 40} y={mBot + 6} width={80} height={24} rx={6} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={MX} cy={lerp(mBot, mTop, ballY)} r={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {crazy > 0 && <path d={`M ${MX - 34} ${lerp(mBot, mTop, ballY) - 30} L ${MX - 34} ${lerp(mBot, mTop, ballY) + 30}`} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />}
          <TagPlate x={1270} y={214} text="高" size={40} t={seg(f, 2, 8)} />
          <TagPlate x={1270} y={500} text="低" size={40} t={seg(f, 4, 10)} />
        </g>
        {/* ぷしゅーの煙 */}
        {f >= 16 && Array.from({ length: 7 }, (_, i) => {
          const life = ((f - 16 + i * 4) % 26) / 26;
          return (
            <circle key={i} cx={GX + (i % 2 ? 40 : -50) + Math.sin(life * 4 + i) * 30 + life * 80} cy={GY - 560 * GS - life * 220} r={22 + life * 46}
              fill={C.smoke} stroke={KRP.ink} strokeWidth={4} opacity={(1 - life) * 0.85} />
          );
        })}
        {/* 床に並んだ✕の札 */}
        <NG1bCard x={1380} y={786} s={0.6} kanji="太郎" kana="ジョージ" rot={-6} flat={1} hot={0} batsu={1} />
        <NG1bCard x={1560} y={786} s={0.6} kanji="健" kana="ケンサマ" rot={5} flat={1} hot={2} batsu={1} />
        {f >= 26 && (
          <NG1bCard x={cx} y={cy} s={landed ? 0.6 : lerp(GS, 0.6, ft)} kanji="高" kana="ヒクシ" rot={rot} flat={landed ? 1 : 0} hot={0} batsu={landed ? seg(f, 38, 42) : 0} />
        )}
        {/* 係の人: 頭を抱える */}
        <Person x={290} y={790} s={0.9} f={f} cloth="#E8E4DA" clothDark="#2F3B5C" face={f >= 14 ? "worried" : "normal"}
          pose={f >= 14 ? "banzai" : "stand"} gaze={[6, -6]} lean={f >= 14 ? Math.sin(f / 5) * 3 : 0} />
        <g transform={`translate(290 ${790 + Math.sin(f / 13) * 3}) scale(0.9)`}>
          <path d="M -58 -150 L -20 -150 L 0 -104 L 20 -150 L 58 -150 L 58 -56 L -58 -56 Z" fill="#2F3B5C" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {f >= 14 && <path d={`M 360 ${470 + (f % 12)} q 8 14 0 20 q -8 -6 0 -20 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #146 ただし、キラキラネームが禁止された、というわけではありません。
// 格: 並 / seed 4146
// 絵: #143〜#145 の床の札の横に、「キラキラネーム禁止」と書いた新聞の見出し風の札があり、それに**赤い×**がつく (誤解の訂正)。からくりの係の人が首を横に振る
// どこ: 同じ検査室の床の隅 (#145 の続き)。床に✕の札3枚、その横の壁に新聞が立てかけてある
// 演出: 新聞の大見出し「キラキラネーム禁止」に、赤い大きな×が2画で引かれる (誤解の訂正)。係が新聞を指して首を横に振る
// 動き: カメラが札から新聞へゆっくりパン f0-30 / ×の1画目 f14-22・2画目 f22-30 / 係の首ふり (ゆっくり) / 新聞の端が風でめくれる
const Nm146: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(60, 0, easeInOut(seg(f, 0, 30)));
  const s1 = seg(f, 14, 22), s2 = seg(f, 22, 30);
  const shakeHead = f >= 24 ? Math.sin((f - 24) / 3.2) * 5 : 0;
  const curl = Math.sin(f / 9) * 6;
  return (
    <Frame f={f} seed={4146}>
      <g transform={`translate(${pan} 0)`}>
        <NG1bInspectRoom floorY={700} f={f} clock={false} />
        {/* 床の✕の札 */}
        <NG1bCard x={210} y={792} s={0.7} kanji="太郎" kana="ジョージ" rot={-7} flat={1} hot={0} batsu={1} />
        <NG1bCard x={420} y={796} s={0.7} kanji="健" kana="ケンサマ" rot={4} flat={1} hot={2} batsu={1} />
        <NG1bCard x={630} y={790} s={0.7} kanji="高" kana="ヒクシ" rot={-3} flat={1} hot={0} batsu={1} />
        {/* 立てかけた新聞 */}
        <g transform="rotate(-3 1110 700)">
          <rect x={762} y={196} width={700} height={510} fill={KRP.ink} opacity={0.18} />
          <path d={`M 750 184 L 1450 184 L 1450 ${690 + curl} L 1410 700 L 750 700 Z`} fill={C.news} stroke={KRP.ink} strokeWidth={7} />
          {/* めくれた角 */}
          <path d={`M 1450 ${640 + curl} L 1410 700 L 1450 ${690 + curl} Z`} fill="#D8D0BE" stroke={KRP.ink} strokeWidth={4} />
          {/* 題字の帯 */}
          <rect x={780} y={212} width={640} height={30} fill={C.newsLine} />
          <line x1={780} y1={252} x2={1420} y2={252} stroke={KRP.ink} strokeWidth={4} />
          {/* 大見出し (黒帯に白抜き) */}
          <rect x={780} y={266} width={640} height={110} fill={KRP.ink} />
          <text x={1100} y={346} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={KRP.white}>キラキラネーム禁止</text>
          {/* 写真の枠 */}
          <rect x={790} y={396} width={240} height={180} fill="#C9C2B2" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={910} cy={470} r={36} fill="#AFA796" />
          <rect x={860} y={510} width={100} height={66} rx={20} fill="#AFA796" />
          {/* 本文 (線だけ) */}
          <g stroke={C.newsLine} strokeWidth={6} strokeLinecap="round">
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1060} y1={404 + i * 30} x2={1410 - (i % 3) * 30} y2={404 + i * 30} />)}
            {Array.from({ length: 3 }, (_, i) => <line key={`b${i}`} x1={790} y1={606 + i * 30} x2={1400 - i * 60} y2={606 + i * 30} />)}
          </g>
          {/* 赤い大きな× (2画) */}
          <g stroke={KRP.red} strokeWidth={34} strokeLinecap="round" fill="none" opacity={0.92}>
            <line x1={820} y1={230} x2={lerp(820, 1390, s1)} y2={lerp(230, 670, s1)} opacity={s1 > 0 ? 1 : 0} />
            <line x1={1390} y1={230} x2={lerp(1390, 820, s2)} y2={lerp(230, 670, s2)} opacity={s2 > 0 ? 1 : 0} />
          </g>
          {/* 画鋲 */}
          {[800, 1400].map((px) => <circle key={px} cx={px} cy={200} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        <TagPlate x={1100} y={140} text="うわさ" size={40} t={seg(f, 4, 10)} rot={-3} />
        {/* 係の人: 指して首を横に振る */}
        <g transform={`rotate(${shakeHead} 1680 640)`}>
          <Person x={1680} y={800} s={0.95} f={f} cloth="#E8E4DA" clothDark="#2F3B5C" face={f >= 24 ? "smile" : "normal"}
            pose="point" pointDir={-1} gaze={f >= 24 ? [shakeHead * 1.2, 0] : [-8, -2]} />
          <g transform={`translate(1680 ${800 + Math.sin(f / 13) * 3}) scale(0.95)`}>
            <path d="M -58 -150 L -20 -150 L 0 -104 L 20 -150 L 58 -150 L 58 -56 L -58 -56 Z" fill="#2F3B5C" stroke={KRP.ink} strokeWidth={4} />
            {[-1, 1].map((sd) => <circle key={sd} cx={sd * 30} cy={-84} r={5} fill={NP.brass} />)}
          </g>
        </g>
        {f >= 24 && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${1680 + sd * 96} 520 q ${sd * 16} 24 0 48`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #147 すでに使われている名前は、使ってきた実績があれば認められます。
// 格: 並 / seed 4147
// 絵: 使い込まれた名札 (角がすり減った) が、通知の書類と一緒に物差しを通って、**緑のランプ**が点く (f)。名札の下に、学校の名簿・診察券・賞状など「使ってきた実績」の小物が並ぶ
// どこ: 同じ検査室の、からくりの正面。手前に木の台 (実績の小物を並べる台)
// 演出: 角のすり減った使い込みの札「陽葵/ヒマリ」が、通知の封筒と一緒に門を通る→針は緑で止まり、緑のランプが点いてきらきら。台の上に名簿・診察券・賞状が次々に置かれ、金の点線で札とつながる。係がにっこり
// 動き: 札と封筒が流れる f0-12 / さぐり針 f10-14 / 緑ランプ f18〜 / 小物が順に出る f22-34 / 点線 f30-38 / カメラが札へ寄る
const Nm147: React.FC<{ f: number }> = ({ f }) => {
  const GX = 960, GY = 548, GS = 0.86;
  const inT = easeOut(seg(f, 0, 12));
  const cx = lerp(GX - 620 * GS, GX, inT);
  const needle = f < 12 ? -60 : -60 + Math.sin(seg(f, 12, 18) * Math.PI) * 18 + Math.sin(f / 6) * 2;
  const ok = f >= 18 ? 1 : 0;
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 40));
  const items = [seg(f, 22, 28), seg(f, 26, 32), seg(f, 30, 36)];
  const link = seg(f, 32, 40);
  return (
    <Frame f={f} seed={4147}>
      <g transform={`translate(960 380) scale(${cam}) translate(-960 -380)`}>
        <NG1bInspectRoom floorY={720} f={f} clockAt={[1640, 260]} />
        {ok > 0 && <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.greenLamp} opacity={0.06} />}
        <NG1bGauge x={GX} y={GY} s={GS} layer="back" f={f} />
        {/* 使い込まれた札+通知の封筒 */}
        <g transform={`translate(${cx + 96} ${GY - 150}) rotate(16) scale(0.9)`}>
          <rect x={-86} y={-104} width={172} height={104} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -86 -104 L 0 -48 L 86 -104" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-74} y={-96} width={84} height={30} fill={C.clinic} stroke={KRP.ink} strokeWidth={3} />
          <text x={-32} y={-73} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>通知</text>
          <rect x={46} y={-94} width={30} height={34} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <NG1bCard x={cx} y={GY - 8} s={GS} kanji="陽葵" kana="ヒマリ" worn />
        <NG1bGauge x={GX} y={GY} s={GS} layer="front" f={f} needle={needle} lamp="green" lampOn={ok} probeDown={seg(f, 10, 14)} />
        {/* きらきら */}
        {ok > 0 && [[-150, -210], [150, -250], [-120, -40], [170, -90], [0, -300]].map(([dx, dy], i) => {
          const tw = 0.6 + 0.4 * Math.sin(f / 3 + i * 1.7);
          return (
            <g key={i} transform={`translate(${GX + dx} ${GY + dy}) scale(${tw * pop(seg(f, 18 + i, 26 + i))})`}>
              <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 手前の木の台 */}
        <rect x={260} y={700} width={1400} height={40} rx={8} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
        <rect x={290} y={740} width={1340} height={140} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {[560, 960, 1360].map((dx) => <circle key={dx} cx={dx} cy={800} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 金の点線: 小物 → 札 */}
        {link > 0 && [500, 960, 1420].map((ix, i) => (
          <path key={i} d={`M ${ix} ${i === 1 ? 590 : 570} Q ${(ix + GX) / 2} ${i === 1 ? 560 : 420} ${GX + (i - 1) * 100} ${GY - (i === 1 ? 30 : 120)}`} fill="none" stroke={KRP.orange}
            strokeWidth={6} strokeDasharray="10 12" strokeDashoffset={-f * 2} opacity={link} />
        ))}
        {/* 学校の名簿 (開いた冊子) */}
        <g transform={`translate(500 700) scale(${0.85 * pop(items[0])}) rotate(-4)`}>
          <path d="M -150 0 L -150 -120 Q -75 -136 0 -120 Q 75 -136 150 -120 L 150 0 Q 75 -16 0 0 Q -75 -16 -150 0 Z" fill={C.roster} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -138 -8 L -138 -114 Q -70 -126 -4 -112 L -4 -6 Q -70 -20 -138 -8 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 4 -6 L 4 -112 Q 70 -126 138 -114 L 138 -8 Q 70 -20 4 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <g key={k} stroke={KRP.gray} strokeWidth={4}>
              <line x1={-124} y1={-92 + k * 22} x2={-20} y2={-90 + k * 22} />
              <line x1={20} y1={-90 + k * 22} x2={124} y2={-92 + k * 22} />
            </g>
          ))}
          <rect x={-122} y={-50} width={98} height={18} fill={KRP.yellow} opacity={0.6} />
          <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} paintOrder="stroke">名簿</text>
        </g>
        {/* 診察券 */}
        <g transform={`translate(960 700) scale(${0.85 * pop(items[1])}) rotate(3)`}>
          <rect x={-110} y={-130} width={220} height={130} rx={14} fill={C.clinic} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-110} y={-130} width={220} height={34} rx={12} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -70 -72 h 16 v -16 h 16 v 16 h 16 v 16 h -16 v 16 h -16 v -16 h -16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2].map((k) => <line key={k} x1={-6} y1={-74 + k * 22} x2={88} y2={-74 + k * 22} stroke={KRP.gray} strokeWidth={5} />)}
          <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} paintOrder="stroke">診察券</text>
        </g>
        {/* 賞状 */}
        <g transform={`translate(1420 700) scale(${0.85 * pop(items[2])}) rotate(-3)`}>
          <rect x={-130} y={-170} width={260} height={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-118} y={-158} width={236} height={146} fill="none" stroke={C.award} strokeWidth={8} />
          <text x={0} y={-112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>賞状</text>
          {[0, 1].map((k) => <line key={k} x1={-84} y1={-80 + k * 22} x2={84} y2={-80 + k * 22} stroke={KRP.gray} strokeWidth={5} />)}
          <circle cx={82} cy={-34} r={18} fill={KRP.red} opacity={0.85} />
        </g>
        {/* 係の人: にっこり */}
        <Person x={1760} y={790} s={0.88} f={f} cloth="#E8E4DA" clothDark="#2F3B5C" face={ok ? "joy" : "normal"} pose={ok ? "raise" : "stand"} gaze={[-8, -2]} />
        <g transform={`translate(1760 ${790 + Math.sin(f / 13) * 3}) scale(0.88)`}>
          <path d="M -58 -150 L -20 -150 L 0 -104 L 20 -150 L 58 -150 L 58 -56 L -58 -56 Z" fill="#2F3B5C" stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #148 届け出をしないと罰金、という話もまちがいです。そういう連絡は、詐欺を疑ってください。
// 格: 山 / seed 4148
// 絵: スマホに「罰金」の怪しいメッセージ (画面の文字は「罰金」だけ)。メッセージの吹き出しから詐欺師の**黒い影**の手が伸びる。現代の人がスマホを持って「?」→ f で画面に大きな赤い×と「詐欺に注意」の札。電話の受話器を置く
// どこ: 夜の居間 (現代)。紺の壁・窓の外に夜の町と月・スタンドの灯り・ソファ・電話台の固定電話
// 演出: 現代の人の手のスマホを、大きな拡大の丸で見せる。画面に「罰金」の吹き出し。吹き出しから黒い影の手がにゅっと伸びて人に迫る→人「？」→画面に赤い大きな×、影の手は引っこむ。「詐欺に注意」の札。人はもう片方の手で受話器をガチャリと置く
// 動き: 拡大の丸が開く f0-8 / 吹き出し f6-12 / 影の手が伸びる f10-22 / ？ f8-14 / ×と手の引っこみ f24-32 / 札 f30-36 / 受話器を置く f30-38 / カメラがゆっくり寄る
const Nm148: React.FC<{ f: number }> = ({ f }) => {
  const PX = 1400, PY = 830, PS = 1.1;
  const open = easeOut(seg(f, 0, 8));
  const bub = pop(seg(f, 6, 12));
  const reach = easeOut(seg(f, 10, 22)) * (1 - 0.55 * easeOut(seg(f, 24, 32)));
  const busted = seg(f, 24, 30);
  const hang = easeInOut(seg(f, 30, 38));
  const cam = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const BX = 760, BY = 430, BR = 330 * open;
  // 影の手の先
  const hx = lerp(1000, 1280, reach), hy = lerp(330, 470, reach) + Math.sin(f / 3) * 6 * reach;
  const handHand: [number, number] = [PX + 153 * PS, PY - 148 * PS];
  const hsX = lerp(handHand[0] + 10, 1668, hang), hsY = lerp(handHand[1] - 8, 676, hang);
  return (
    <Frame f={f} seed={4148} bg={C.wallNight}>
      <g transform={`translate(960 500) scale(${cam}) translate(-960 -500)`}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={W + 80} height={800} fill={C.wallNight} />
        <g stroke={C.wallNightDark} strokeWidth={3} opacity={0.7}>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130} y1={-40} x2={i * 130} y2={760} />)}
        </g>
        {/* 窓 (夜の町と月) */}
        <rect x={40} y={110} width={300} height={380} rx={8} fill="#1F2640" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={260} cy={180} r={34} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={4} />
        {[[70, 360, 70, 130], [150, 320, 60, 170], [220, 380, 90, 110]].map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} fill="#2E3656" stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 4 }, (_, k) => (
              <rect key={k} x={bx + 12 + (k % 2) * 26} y={by + 16 + Math.floor(k / 2) * 34} width={14} height={16}
                fill={C.lampWarm} opacity={(k + i + Math.floor(f / 12)) % 3 === 0 ? 0.3 : 0.9} />
            ))}
          </g>
        ))}
        <line x1={190} y1={110} x2={190} y2={490} stroke={KRP.ink} strokeWidth={7} />
        <line x1={40} y1={300} x2={340} y2={300} stroke={KRP.ink} strokeWidth={7} />
        {/* カーテン */}
        <path d="M 20 96 Q 60 300 30 510 L 0 510 L 0 96 Z" fill={C.sofa} stroke={KRP.ink} strokeWidth={5} />
        {/* スタンドの灯り */}
        <g transform="translate(1860 760)">
          <circle cx={0} cy={-470} r={170} fill={C.lampWarm} opacity={0.18 + Math.sin(f / 10) * 0.02} />
          <rect x={-6} y={-450} width={12} height={450} fill={KRP.ink} />
          <path d="M -70 -440 L 70 -440 L 46 -540 L -46 -540 Z" fill={C.lampWarm} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-4} rx={50} ry={10} fill={KRP.ink} />
        </g>
        {/* ソファ */}
        <g>
          <rect x={1080} y={560} width={520} height={160} rx={30} fill={C.sofa} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1100} y={640} width={480} height={90} rx={20} fill="#A383A3" stroke={KRP.ink} strokeWidth={5} />
          <rect x={1300} y={590} width={120} height={70} rx={14} fill={C.curtain} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8 1360 625)" />
        </g>
        {/* 床 */}
        <rect x={-40} y={760} width={W + 80} height={360} fill="#6E5844" stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#5A4636" strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={760} x2={i * 220 - 80} y2={H + 40} />)}</g>
        {/* 電話台と固定電話 */}
        <g>
          <rect x={1560} y={690} width={220} height={22} rx={5} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1580} y={712} width={20} height={110} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1740} y={712} width={20} height={110} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1600 690 L 1610 640 L 1740 640 L 1750 690 Z" fill={C.landline} stroke={KRP.ink} strokeWidth={5} />
          <g>{Array.from({ length: 6 }, (_, k) => <circle key={k} cx={1640 + (k % 3) * 30} cy={662 + Math.floor(k / 3) * 16} r={6} fill={KRP.grayDark} />)}</g>
          {/* 受話器のコード */}
          <path d={`M 1612 668 Q ${(1612 + hsX) / 2} ${Math.max(700, hsY + 60)} ${hsX - 50} ${hsY + 6}`} fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="6 4" />
          {/* 受話器 */}
          <g transform={`translate(${hsX} ${hsY}) rotate(${lerp(-30, 0, hang)})`}>
            <path d="M -70 -6 Q -70 -24 -50 -24 L 50 -24 Q 70 -24 70 -6 L 70 6 L 40 6 L 30 -6 L -30 -6 L -40 6 L -70 6 Z" fill={C.landline} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {hang > 0.9 && f < 44 && [0, 1, 2].map((i) => (
            <line key={i} x1={1640 + i * 40} y1={624} x2={1630 + i * 50} y2={596} stroke={C.lampWarm} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
        {/* 現代の人 (左手にスマホ・右手で受話器) */}
        <Person x={PX} y={PY} s={PS} f={f} cloth="#6F8FB0" clothDark="#4F6E8E" pose="point" pointDir={1}
          face={busted > 0.5 ? "angry" : reach > 0.4 ? "worried" : "normal"} gaze={busted > 0.5 ? [-4, 0] : [-10, 2]} lean={-reach * 5} />
        <g transform={`translate(${PX - 70 * PS} ${PY - 70 * PS + Math.sin(f / 13) * 3})`}>
          <rect x={-22} y={-40} width={44} height={78} rx={8} fill={C.phone} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-32} width={32} height={58} rx={4} fill={busted > 0.5 ? "#F6D0C8" : C.phoneScreen} />
        </g>
        <QMark x={PX + 20} y={PY - 330 * PS} s={0.9} f={f} t={seg(f, 8, 14) * (1 - seg(f, 24, 28))} />
        {/* 拡大の丸 (スマホの画面) */}
        {BR > 2 && (
          <g>
            <path d={`M ${PX - 70 * PS - 20} ${PY - 110} L ${BX + BR * 0.55} ${BY - BR * 0.83} L ${BX + BR * 0.8} ${BY + BR * 0.6} Z`} fill={KRP.white} opacity={0.14} />
            <circle cx={BX} cy={BY} r={BR + 14} fill={KRP.ink} opacity={0.25} />
            <circle cx={BX} cy={BY} r={BR} fill="#D9DEE8" stroke={KRP.ink} strokeWidth={8} />
            <g transform={`translate(${BX} ${BY}) scale(${open}) translate(${-BX} ${-BY})`}>
              <rect x={600} y={140} width={320} height={580} rx={44} fill={C.phone} stroke={KRP.ink} strokeWidth={7} />
              <rect x={618} y={176} width={284} height={510} rx={20} fill={busted > 0 ? lerp(0, 1, busted) > 0.5 ? "#FBE5E0" : C.phoneScreen : C.phoneScreen} />
              <rect x={720} y={152} width={80} height={14} rx={7} fill="#44444C" />
              {/* 知らない差出人 */}
              <circle cx={656} cy={222} r={22} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
              <rect x={690} y={212} width={120} height={18} rx={9} fill={KRP.gray} />
              {/* 吹き出し */}
              <g transform={`translate(760 360) scale(${bub}) translate(-760 -360)`}>
                <rect x={636} y={272} width={250} height={150} rx={26} fill={C.bubbleGray} stroke={KRP.ink} strokeWidth={5} />
                <path d="M 660 420 L 646 456 L 696 420 Z" fill={C.bubbleGray} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
                <text x={761} y={380} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={KRP.red}>罰金</text>
                {/* 怪しい点滅 */}
                <circle cx={866} cy={290} r={12} fill={KRP.red} opacity={Math.floor(f / 3) % 2 ? 1 : 0.3} />
              </g>
              {/* 下のボタン (字なし) */}
              <rect x={650} y={560} width={220} height={54} rx={27} fill={KRP.red} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
              <XMark x={760} y={430} s={2.6} t={busted} />
            </g>
          </g>
        )}
        {/* 黒い影の手 (吹き出しから伸びる) */}
        {reach > 0.02 && (
          <g opacity={0.95}>
            <path d={`M 880 330 Q ${(880 + hx) / 2} ${hy - 90 + Math.sin(f / 4) * 14} ${hx} ${hy}`} fill="none" stroke={C.shadow} strokeWidth={46} strokeLinecap="round" />
            <path d={`M 880 330 Q ${(880 + hx) / 2} ${hy - 90 + Math.sin(f / 4) * 14} ${hx} ${hy}`} fill="none" stroke="#3A3044" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
            <g transform={`translate(${hx} ${hy}) rotate(${20 + Math.sin(f / 3) * 6})`}>
              <ellipse cx={18} cy={0} rx={44} ry={36} fill={C.shadow} />
              {[-30, -10, 10, 30].map((a, i) => (
                <path key={i} d={`M 40 ${a * 0.8} q 40 ${a * 0.6} 52 ${a * 0.3 + 14}`} stroke={C.shadow} strokeWidth={18} strokeLinecap="round" fill="none" />
              ))}
              <path d="M 0 -30 q -10 -40 20 -54" stroke={C.shadow} strokeWidth={18} strokeLinecap="round" fill="none" />
            </g>
          </g>
        )}
        <TagPlate x={760} y={690} text="詐欺に注意" size={42} t={seg(f, 30, 36)} fill={KRP.yellow} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #149 では、名前を変えたくなったら、どうするのか。
// 格: 並 / seed 4149
// 絵: 現代の人が自分の名札を手に取って見つめる。名札の横に消しゴムと鉛筆。`QMark`
// どこ: 昼の自室の机 (現代)。後ろに本棚・窓とカーテン・壁かけの暦。手前に机の天板
// 演出: 現代の人が、自分の名札 (クリップ付きの白い札) を両手で持ち上げて、じっと見つめる。机の上で鉛筆が転がって消しゴムに当たって止まる。頭の上に「？」
// 動き: カメラが名札へ寄る f0-40 / 名札が少しずつ持ち上がって傾く / 鉛筆が転がる f8-24 / 消しゴムがぐらり f24-30 / ？ f18-24 / まばたき
const Nm149: React.FC<{ f: number }> = ({ f }) => {
  const PX = 860, PY = 860, PS = 1.25;
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 40));
  const lift = easeOut(seg(f, 0, 16));
  const tilt = Math.sin(f / 14) * 2 - 3 * lift;
  const roll = easeOut(seg(f, 8, 24));
  const pencilX = lerp(1460, 1196, roll);
  const wob = f >= 24 ? Math.sin((f - 24) * 0.8) * 8 * (1 - seg(f, 24, 36)) : 0;
  return (
    <Frame f={f} seed={4149} bg={C.wallDay}>
      <g transform={`translate(880 640) scale(${cam}) translate(-880 -640)`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wallDay} />
        <g stroke="#E2D6BC" strokeWidth={5}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={-40} x2={i * 170} y2={760} />)}</g>
        {/* 本棚 */}
        <g>
          <rect x={60} y={120} width={420} height={640} fill={C.deskDark} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={80} y={300 + r * 200} width={380} height={16} fill={C.desk} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 9 }, (_, k) => {
                const bh = 120 + ((k * 37 + r * 11) % 50);
                const cols = [KRP.blueDeep, KRP.red, C.curtain, KRP.yellow, "#8E6E8E", KRP.white];
                return <rect key={k} x={92 + k * 40} y={300 + r * 200 - bh} width={34} height={bh} fill={cols[(k + r) % cols.length]} stroke={KRP.ink} strokeWidth={4} />;
              })}
            </g>
          ))}
        </g>
        {/* 窓とカーテン */}
        <rect x={1300} y={100} width={480} height={440} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1660} cy={190} r={40} fill={KRP.white} opacity={0.6} />
        <path d="M 1310 420 Q 1400 380 1480 410 Q 1560 440 1770 400 L 1770 530 L 1310 530 Z" fill={C.hedge} opacity={0.6} />
        <line x1={1540} y1={100} x2={1540} y2={540} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M 1280 80 Q ${1330 + Math.sin(f / 12) * 8} 320 1300 580 L 1250 580 L 1250 80 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 1800 80 Q ${1760 + Math.sin(f / 12 + 1) * 8} 320 1790 580 L 1840 580 L 1840 80 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        {/* 壁の暦 (字なし) */}
        <g transform="translate(1080 160) rotate(2)">
          <rect x={-80} y={-10} width={160} height={190} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-80} y={-10} width={160} height={40} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 15 }, (_, k) => <rect key={k} x={-66 + (k % 5) * 28} y={44 + Math.floor(k / 5) * 40} width={18} height={18} fill={KRP.gray} />)}
          <circle cx={0} cy={-20} r={7} fill={KRP.ink} />
        </g>
        {/* 現代の人 */}
        <Person x={PX} y={PY} s={PS} f={f} cloth="#6F8FB0" clothDark="#4F6E8E" pose="hold" face="worried" gaze={[2, 8]} lean={Math.sin(f / 16) * 2} />
        <QMark x={PX + 150} y={PY - 310 * PS} s={1.1} f={f} t={seg(f, 18, 24)} />
        {/* 机の天板 */}
        <rect x={-40} y={770} width={W + 80} height={60} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={830} width={W + 80} height={300} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.deskDark} strokeWidth={3} opacity={0.6}>
          <path d="M 0 790 q 400 -6 900 0 q 500 6 1020 0" fill="none" />
          <path d="M 0 812 q 500 6 1000 0 q 400 -6 920 0" fill="none" />
        </g>
        {/* 自分の名札 (両手で持つ) */}
        <g transform={`translate(${PX} ${lerp(776, 738, lift)}) rotate(${tilt}) scale(0.74)`}>
          <rect x={-180} y={-96} width={360} height={190} rx={14} fill={KRP.ink} opacity={0.2} transform="translate(8 8)" />
          <rect x={-180} y={-96} width={360} height={190} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-180} y={-96} width={360} height={46} rx={14} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-30} y={-122} width={60} height={34} rx={6} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          <text x={0} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={NP.sumi}>佐藤 健一</text>
          {/* 持つ手 */}
          {[-1, 1].map((sd) => <circle key={sd} cx={sd * 172} cy={30} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />)}
        </g>
        {/* 消しゴム */}
        <g transform={`translate(1150 800) rotate(${wob} 0 10)`}>
          <rect x={-46} y={-30} width={92} height={40} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-18} y={-32} width={54} height={44} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {[0, 1, 2].map((i) => <circle key={i} cx={1090 - i * 20} cy={806 + (i % 2) * 6} r={5} fill="#D9D2C6" stroke={KRP.ink} strokeWidth={2} />)}
        {/* 鉛筆 (転がってくる) */}
        <g transform={`translate(${pencilX + 120} 794)`}>
          <g transform={`rotate(${(1 - roll) * 6})`}>
            <rect x={-120} y={-11} width={200} height={22} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <line x1={-120} y1={-3} x2={80} y2={-3} stroke={KRP.orange} strokeWidth={3} />
            <polygon points="-120,-11 -160,0 -120,11" fill="#E9C9A0" stroke={KRP.ink} strokeWidth={4} />
            <polygon points="-148,-4 -160,0 -148,4" fill={KRP.ink} />
            <rect x={80} y={-11} width={22} height={22} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
            <rect x={102} y={-11} width={20} height={22} rx={5} fill="#E8A3A0" stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {roll > 0 && roll < 1 && [0, 1].map((i) => (
          <line key={i} x1={pencilX + 260 + i * 30} y1={784 + i * 14} x2={pencilX + 300 + i * 30} y2={784 + i * 14} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #150 家庭裁判所に、許可を求めます。
// 格: 山 / seed 4150
// 絵: 家庭裁判所の建物の外観 (現代のビル・植え込み・案内板 (字は「家庭裁判所」だけ))。入口の扉が開き、申し立ての書類を持った人が入っていく。奥に裁判所の扉と天秤のマーク
// どこ: 昼の家庭裁判所の前 (現代)。石張りの4階建てのビル・植え込み・木・石の案内板 (字は「家庭裁判所」だけ)・石畳
// 演出: 正面のガラスの自動扉が左右に開き、奥の廊下の突き当たりに木の扉と天秤の印が見える。申立書の封筒を抱えた人が、背中を見せて入口へ歩いていく
// 動き: 扉が開く f4-18 / 人が手前から入口へ歩く f0-42 (小さくなる・足が交互) / カメラが入口へ寄る f0-42 / 雲が流れる・木の葉がゆれる
const Nm150: React.FC<{ f: number }> = ({ f }) => {
  const op = easeInOut(seg(f, 4, 18));
  const walk = easeInOut(seg(f, 0, 42));
  const px = lerp(1320, 980, walk), py = lerp(930, 784, walk), ps = lerp(1.0, 0.7, walk);
  const step = Math.sin(f / 3.2);
  const cam = 1 + 0.12 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4150} bg={C.sky}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        <rect x={-40} y={-40} width={W + 80} height={500} fill={C.sky} />
        <rect x={-40} y={400} width={W + 80} height={400} fill={C.skyLow} />
        {[[200, 120], [1500, 90], [1000, 60]].map(([cx0, cy], i) => {
          const cx = cx0 + ((f * (0.6 + i * 0.2)) % 60);
          return (
            <g key={i} opacity={0.9}>
              {[0, 1, 2].map((k) => <circle key={k} cx={cx + k * 46} cy={cy - (k === 1 ? 16 : 0)} r={k === 1 ? 40 : 30} fill={KRP.white} />)}
            </g>
          );
        })}
        {/* ビル本体 */}
        <rect x={350} y={130} width={1220} height={640} fill={C.stone} stroke={KRP.ink} strokeWidth={8} />
        <rect x={330} y={110} width={1260} height={36} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 石の目地 */}
        <g stroke={C.stoneDark} strokeWidth={3} opacity={0.7}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={350} y1={160 + i * 50} x2={1570} y2={160 + i * 50} />)}
        </g>
        {/* 窓 (3階分) */}
        {[0, 1, 2].map((r) => Array.from({ length: 8 }, (_, k) => {
          const wx = 400 + k * 145;
          if (r === 2 && k >= 3 && k <= 4) return null;
          return (
            <g key={`${r}-${k}`}>
              <rect x={wx} y={170 + r * 105} width={100} height={72} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
              <line x1={wx + 50} y1={170 + r * 105} x2={wx + 50} y2={242 + r * 105} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${wx + 10} ${232 + r * 105} L ${wx + 34} ${180 + r * 105}`} stroke={KRP.white} strokeWidth={5} opacity={0.5} />
            </g>
          );
        }))}
        {/* 玄関のひさし */}
        <rect x={770} y={420} width={380} height={34} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        {[790, 1110].map((cx) => <rect key={cx} x={cx} y={454} width={20} height={316} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 奥の廊下 (扉が開くと見える) */}
        <rect x={830} y={470} width={260} height={300} fill={C.hall} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 830 770 L 920 640 L 1000 640 L 1090 770 Z" fill={C.paving} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 830 470 L 920 560 L 1000 560 L 1090 470" fill="none" stroke={C.stoneDark} strokeWidth={4} />
        {/* 突き当たりの木の扉と天秤 */}
        <rect x={924} y={560} width={72} height={82} fill={C.courtDoor} stroke={KRP.ink} strokeWidth={4} />
        <line x1={960} y1={566} x2={960} y2={640} stroke={KRP.ink} strokeWidth={3} />
        <g transform="translate(960 532)">
          <circle r={22} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-14} x2={0} y2={12} stroke={KRP.ink} strokeWidth={3} />
          <line x1={-14} y1={-8} x2={14} y2={-8} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -18 4 L -14 -8 L -10 4 Z M 10 4 L 14 -8 L 18 4 Z" fill="none" stroke={KRP.ink} strokeWidth={2.5} />
          <line x1={-6} y1={12} x2={6} y2={12} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* ガラスの自動扉 (左右に開く) */}
        {[-1, 1].map((sd) => {
          const dx = sd * op * 120;
          const x0 = sd === -1 ? 830 : 960;
          return (
            <g key={sd} transform={`translate(${dx} 0)`}>
              <rect x={x0} y={470} width={130} height={300} fill={C.glass} opacity={0.55} stroke={KRP.ink} strokeWidth={6} />
              <path d={`M ${x0 + 20} 740 L ${x0 + 60} 500`} stroke={KRP.white} strokeWidth={7} opacity={0.5} />
              <rect x={sd === -1 ? x0 + 112 : x0 + 8} y={590} width={10} height={60} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 扉の外枠の袖 (開いた扉が隠れる壁) */}
        <rect x={700} y={470} width={130} height={300} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1090} y={470} width={130} height={300} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {op > 0.2 && op < 1 && <path d="M 870 450 L 850 430 M 1050 450 L 1070 430" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />}
        {/* 植え込み */}
        {[[350, 690, 330], [1240, 690, 330]].map(([hx, hy, hw], i) => (
          <g key={i}>
            <rect x={hx} y={hy + 40} width={hw} height={60} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, k) => (
              <circle key={k} cx={hx + 30 + k * 55} cy={hy + 34 + Math.sin(f / 10 + k) * 2} r={40} fill={k % 2 ? C.hedge : C.hedgeDark} stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* 石の案内板 (家庭裁判所) */}
        <g>
          <rect x={560} y={380} width={110} height={400} fill="#8E8A80" stroke={KRP.ink} strokeWidth={7} />
          <rect x={540} y={760} width={150} height={30} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from("家庭裁判所").map((ch, i) => (
            <text key={i} x={615} y={448 + i * 62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={KRP.white}>{ch}</text>
          ))}
        </g>
        {/* 木 */}
        {[180, 1740].map((tx, i) => (
          <g key={tx} transform={`rotate(${Math.sin(f / 15 + i) * 1.2} ${tx} 800)`}>
            <rect x={tx - 18} y={520} width={36} height={280} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx} cy={440} r={130} fill={C.hedge} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={tx - 70} cy={510} r={80} fill={C.hedgeDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx + 70} cy={500} r={84} fill={C.hedge} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 石畳 */}
        <rect x={-40} y={780} width={W + 80} height={360} fill={C.paving} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.pavingDark} strokeWidth={4}>
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={960 + (i - 6) * 100} y1={780} x2={960 + (i - 6) * 300} y2={H + 40} />)}
          {[840, 920, 1020].map((ly) => <line key={ly} x1={-40} y1={ly} x2={W + 40} y2={ly} />)}
        </g>
        {/* 申し立てに行く人 (背中) */}
        <g transform={`translate(${px} ${py})`}>
          <ellipse cx={0} cy={0} rx={80 * ps} ry={14 * ps} fill={KRP.ink} opacity={0.18} />
          <g transform={`rotate(${step * 3} 0 ${-40 * ps})`}>
            <Person x={0} y={0} s={ps} f={f} cloth="#6F8FB0" clothDark="#4F6E8E" />
          </g>
          <NG1bBackHead x={0} y={Math.sin(f / 13) * 3} s={ps} />
          {/* 申立書の封筒 (脇に抱える) */}
          <g transform={`translate(${70 * ps} ${-120 * ps}) rotate(8) scale(${ps})`}>
            <rect x={-20} y={-70} width={100} height={130} rx={4} fill={C.wornStain} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-6} y={-50} width={72} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <text x={30} y={-28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={KRP.ink}>申立書</text>
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #151 2025年に名前の変更を申し立てたのは、4979件。
// 格: 図 / seed 4151
// 絵: 書類の束の山がからくりの計数器 (真鍮の数字の回転ドラム) を通り、数字が f で回って「4979」で止まる。札「2025年」「件」
// どこ: 板張りの壁の作業場の、木の作業台の上。左に申し立ての書類の束の山、中央に真鍮の計数器 (4つの数字ドラム・歯車・ハンドル)、右に数え終わった束の受け台
// 演出: 束がすべり台で計数器に吸い込まれ、ドラムがからから回って左から順に 4・9・7・9 で止まる。止まるたびにカチッ。最後にベルが鳴る。札「2025年」「件」
// 動き: 束が流れる (ずっと) / ドラムが回る f4〜、止まる f22・28・34・40 / 歯車とハンドルが回る / 右の束が積み上がる / カメラがドラムへ寄る
const Nm151: React.FC<{ f: number }> = ({ f }) => {
  const target = [4, 9, 7, 9];
  const stops = [22, 28, 34, 40];
  const DX = [610, 750, 890, 1030];
  const DY = 330, DW = 130, DH = 180;
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const running = f < 40;
  const outN = 2 + Math.floor(seg(f, 0, 42) * 5);
  const bundle = (bx: number, by: number, rot: number, key: string | number) => (
    <g key={key} transform={`translate(${bx} ${by}) rotate(${rot})`}>
      <rect x={-100} y={-34} width={200} height={60} rx={6} fill={C.paperBundle} stroke={KRP.ink} strokeWidth={5} />
      {[-18, -4, 10].map((ly) => <line key={ly} x1={-96} y1={ly} x2={96} y2={ly} stroke={KRP.gray} strokeWidth={3} />)}
      <line x1={-30} y1={-34} x2={-30} y2={26} stroke={C.stringTie} strokeWidth={6} />
      <line x1={36} y1={-34} x2={36} y2={26} stroke={C.stringTie} strokeWidth={6} />
    </g>
  );
  return (
    <Frame f={f} seed={4151}>
      <g transform={`translate(900 440) scale(${cam}) translate(-900 -440)`}>
        {/* 板張りの壁 */}
        <rect x={-40} y={-40} width={W + 80} height={800} fill={C.wainscot} />
        <g stroke={C.wainscotDark} strokeWidth={5}>{Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 160} y1={-40} x2={i * 160} y2={760} />)}</g>
        {/* 作業台 */}
        <rect x={-40} y={740} width={W + 80} height={80} fill={C.workbench} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-40} y={820} width={W + 80} height={300} fill={C.workbenchDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.workbenchDark} strokeWidth={3} opacity={0.6}>
          <path d="M 0 768 q 500 -8 960 0 q 460 8 960 0" fill="none" />
          <path d="M 0 798 q 400 6 900 0 q 520 -6 1020 0" fill="none" />
        </g>
        {/* 左: 書類の束の山 */}
        {Array.from({ length: 10 }, (_, i) => {
          const row = i < 4 ? 0 : i < 7 ? 1 : i < 9 ? 2 : 3;
          const idx = i < 4 ? i : i < 7 ? i - 4 : i < 9 ? i - 7 : 0;
          const n = 4 - row;
          return bundle(260 + (idx - (n - 1) / 2) * 120, 708 - row * 60, (rnd(4151, i) - 0.5) * 8, i);
        })}
        {/* すべり台 */}
        <path d="M 250 470 L 560 600 L 560 630 L 250 500 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1].map((k) => {
          const u = ((f + k * 21) % 42) / 42;
          return bundle(lerp(280, 540, u), lerp(458, 566, u), 22, `m${k}`);
        })}
        {/* 計数器の本体 */}
        <rect x={548} y={230} width={830} height={500} rx={30} fill={KRP.ink} opacity={0.2} transform="translate(12 12)" />
        <rect x={548} y={230} width={830} height={500} rx={30} fill={NP.brass} stroke={KRP.ink} strokeWidth={9} />
        <rect x={572} y={254} width={782} height={452} rx={20} fill="none" stroke={NP.brassDark} strokeWidth={5} />
        {[[580, 262], [1346, 262], [580, 698], [1346, 698]].map(([rx, ry], i) => <circle key={i} cx={rx} cy={ry} r={11} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 吸い込み口 */}
        <rect x={540} y={560} width={40} height={110} fill={KRP.ink} />
        {/* ドラムの窓 */}
        {DX.map((dx, i) => {
          const spin = 1 - easeOut(seg(f, 4, stops[i]));
          const v = target[i] + spin * (18 + i * 6);
          const base = Math.floor(v);
          const frac = v - base;
          const done = f >= stops[i];
          return (
            <g key={i}>
              <defs>
                <clipPath id={`ng1b151c${i}`}><rect x={dx} y={DY} width={DW} height={DH} rx={10} /></clipPath>
              </defs>
              <rect x={dx - 8} y={DY - 8} width={DW + 16} height={DH + 16} rx={14} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
              <rect x={dx} y={DY} width={DW} height={DH} rx={10} fill={C.drum} />
              <g clipPath={`url(#ng1b151c${i})`}>
                {[-1, 0, 1].map((k) => (
                  <text key={k} x={dx + DW / 2} y={DY + DH / 2 + 50 + (k + frac) * DH * 0.9} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                    fontSize={140} fill={KRP.ink} opacity={done ? 1 : 0.85}>{(((base - k) % 10) + 10) % 10}</text>
                ))}
                {/* 胴の陰影 */}
                <rect x={dx} y={DY} width={DW} height={34} fill={KRP.ink} opacity={0.18} />
                <rect x={dx} y={DY + DH - 34} width={DW} height={34} fill={KRP.ink} opacity={0.18} />
              </g>
              {/* 止まった印のカチッ */}
              {done && f < stops[i] + 6 && [-1, 1].map((sd) => (
                <line key={sd} x1={dx + DW / 2 + sd * 40} y1={DY - 16} x2={dx + DW / 2 + sd * 62} y2={DY - 44} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
              ))}
            </g>
          );
        })}
        <TagPlate x={1260} y={420} text="件" size={70} t={seg(f, 38, 42)} />
        {/* 歯車 */}
        {[[700, 620, 56, 1], [820, 630, 40, -1.4], [1180, 620, 60, -1]].map(([gx, gy, gr, dir], i) => (
          <g key={i} transform={`translate(${gx} ${gy}) rotate(${running ? f * 8 * dir : 40 * 8 * dir})`}>
            {Array.from({ length: 10 }, (_, k) => (
              <rect key={k} x={-8} y={-gr - 12} width={16} height={20} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${k * 36})`} />
            ))}
            <circle r={gr} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
            <circle r={gr * 0.35} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* ハンドル */}
        <g transform={`translate(1378 520) rotate(${running ? f * 12 : 480})`}>
          <rect x={-6} y={-90} width={12} height={90} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-96} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle r={18} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ベル */}
        <g transform={`translate(960 200) rotate(${f >= 40 ? Math.sin(f * 2) * 14 : 0})`}>
          <path d="M -34 20 Q -34 -34 0 -34 Q 34 -34 34 20 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <circle cy={26} r={8} fill={KRP.ink} />
        </g>
        {f >= 40 && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${960 + sd * 60} 160 q ${sd * 20} 30 0 60`} stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
        <TagPlate x={960} y={110} text="2025年" size={50} t={seg(f, 0, 6)} />
        {/* 右: 数え終わった束 */}
        <rect x={1420} y={724} width={380} height={20} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: outN }, (_, i) => bundle(1610 + (rnd(4152, i) - 0.5) * 30, 692 - i * 58, (rnd(4153, i) - 0.5) * 6, `o${i}`))}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_143: (f) => <Nm143 f={f} />,
  nm_144: (f) => <Nm144 f={f} />,
  nm_145: (f) => <Nm145 f={f} />,
  nm_146: (f) => <Nm146 f={f} />,
  nm_147: (f) => <Nm147 f={f} />,
  nm_148: (f) => <Nm148 f={f} />,
  nm_149: (f) => <Nm149 f={f} />,
  nm_150: (f) => <Nm150 f={f} />,
  nm_151: (f) => <Nm151 f={f} />,
};

export const NM_G1B_MOTIFS: string[] = [
  "nm_143", // #143
  "nm_144", // #144
  "nm_145", // #145
  "nm_146", // #146
  "nm_147", // #147
  "nm_148", // #148
  "nm_149", // #149
  "nm_150", // #150
  "nm_151", // #151
];

export const namaeG1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
