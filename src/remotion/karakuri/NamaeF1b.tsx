// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#124〜#133 (10文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // 明治の役所の部屋
  wall: "#E6D9BC", wallDark: "#CDBD98", pillar: "#7A5634", pillarDark: "#5A3E25",
  desk: "#B47E4A", deskTop: "#C8935A", deskDark: "#8A5A30",
  washi: "#F4EBD6", washiDark: "#DCCCA6", cover: "#3E5A86", coverDark: "#2C4266",
  sky: "#BFD9EA", skyLow: "#E4EEF2", ground: "#B9B08A",
  barracks: "#6A5E52", barracksDark: "#4E443B", barracksWin: "#9A8C7A",
  soldier: "#3F4A3A", soldierDark: "#2E3729", capRed: "#B23A2E", rifle: "#6B4A2C",
  // 婚礼
  gold: "#E2B84A", goldDark: "#C3962E", goldLight: "#F2D88A", pine: "#5E7A4A",
  tatami: "#CFC28A", tatamiDark: "#B3A56C", heri: "#3D4A3A",
  groom: "#5B6E8C", groomDark: "#44546E", hakama: "#6E6A72", hakamaDark: "#55525A",
  bride: "#B5577A", brideDark: "#8F3F5E", hairBlack: "#231D1A", lacquer: "#A8321F",
  // 民法の本
  book: "#2A3A5E", bookDark: "#1C2846", pageEdge: "#EFE6CF", roof: "#4E4A52",
  // 年表
  ruler: "#E2C489", rulerDark: "#B8975E", board: "#9C7048", boardDark: "#7C5434",
  // からくりの作業場
  workWall: "#5E4630", workWallDark: "#4A3624", bench: "#9A6A3C", benchDark: "#6E4A28",
  narrator: "#6F8FB0",
  // 雨
  rainSky: "#9FA9B3", rainSkyLow: "#C3CBD1", townFar: "#7F8892", townNear: "#6A727C",
  stone: "#8E8A84", stoneDark: "#6F6B66", kasa: "#C8473A", kasaDark: "#93301F", drop: "#DCEAF4",
  // 役人
  official: "#2F3B5C", officialDark: "#1F2840", curtain: "#D9CBA6",
  // 衣桁の着物
  asagi: "#6FA8A0", yamabuki: "#E2A93B", fuji: "#9A86B8", ikou: "#3A2A22",
  // 現代
  binder1: "#4F6E9A", binder2: "#B85A4A", binder3: "#6E9A5A", pc: "#D8DCE0", pcDark: "#9AA2AA",
  screen: "#EAF3FA", screenBlue: "#4A78B8", phone: "#2E3138",
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

/** カメラ: (cx,cy) を中心に s 倍して (dx,dy) ずらす */
const cam = (cx: number, cy: number, s: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`;

/** Person の体ゆれ (後ろ姿の頭を Person に合わせて動かすため) */
const pbob = (f: number, phase: number) => Math.sin((f + phase * 17) / 13) * 3;

/** 後ろ姿の頭 (Person の頭を髪で塗りつぶして顔を隠す)。x,y,s は Person と同じ */
const NF1bBackHead: React.FC<{ x: number; y: number; s: number; kind: "man" | "bride"; bob?: number }> = ({ x, y, s, kind, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    {/* 耳 */}
    {[-1, 1].map((side) => (
      <ellipse key={side} cx={side * 64} cy={-222} rx={11} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    ))}
    {kind === "man" ? (
      <g>
        <circle cx={0} cy={-228} r={68} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 散切り頭の刈り上げ */}
        <path d="M -52 -186 Q 0 -168 52 -186 L 46 -172 Q 0 -158 -46 -172 Z" fill="#4A403A" />
        <path d="M -40 -270 Q 0 -292 40 -270" stroke="#FFFFFF" strokeWidth={5} opacity={0.22} fill="none" />
      </g>
    ) : (
      <g>
        {/* 文金高島田: 大きな髷 + 鬢 + 角隠し */}
        <ellipse cx={-62} cy={-232} rx={22} ry={36} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={62} cy={-232} rx={22} ry={36} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={0} cy={-228} r={66} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5.5} />
        <ellipse cx={0} cy={-176} rx={40} ry={18} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-300} rx={56} ry={34} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5} />
        {/* 簪 */}
        <line x1={-70} y1={-312} x2={70} y2={-292} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
        <circle cx={-74} cy={-313} r={9} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={74} cy={-291} r={9} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        {/* 角隠し (白い帯) */}
        <path d="M -78 -262 Q 0 -300 78 -262 L 74 -238 Q 0 -270 -74 -238 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -50 -330 Q 0 -342 50 -330" stroke="#FFFFFF" strokeWidth={5} opacity={0.25} fill="none" />
      </g>
    )}
  </g>
);

/** 正座の腰から下 (後ろから見た袴・着物の山)。x,y,s は Person と同じ */
const NF1bSeiza: React.FC<{ x: number; y: number; s: number; kind: "man" | "bride"; bob?: number }> = ({ x, y, s, kind, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    {kind === "man" ? (
      <g>
        <path d="M -66 -84 Q -122 -40 -124 4 L 124 4 Q 122 -40 66 -84 Z" fill={C.hakama} stroke={KRP.ink} strokeWidth={5.5} />
        {[-80, -40, 0, 40, 80].map((sx) => (
          <path key={sx} d={`M ${sx * 0.55} -80 L ${sx} 2`} stroke={C.hakamaDark} strokeWidth={5} />
        ))}
        {/* 袴の腰板 */}
        <rect x={-42} y={-100} width={84} height={30} rx={6} fill={C.hakama} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    ) : (
      <g>
        {/* 打掛の裾が畳に広がる */}
        <path d="M -70 -100 Q -150 -40 -190 6 Q 0 24 190 6 Q 150 -40 70 -100 Z" fill={C.bride} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -186 4 Q 0 22 186 4 L 180 -6 Q 0 10 -180 -6 Z" fill={C.brideDark} />
        {/* 金の柄 (鶴と花を点で) */}
        {[[-110, -24], [-60, -50], [10, -30], [70, -60], [120, -20], [-20, -76]].map(([px, py], i) => (
          <g key={i} transform={`translate(${px} ${py})`}>
            {[0, 1, 2, 3, 4].map((k) => (
              <circle key={k} cx={Math.cos((k / 5) * Math.PI * 2) * 8} cy={Math.sin((k / 5) * Math.PI * 2) * 8} r={5} fill={C.goldLight} />
            ))}
            <circle r={4} fill={C.gold} />
          </g>
        ))}
        {/* 帯の結び (後ろ) */}
        <path d="M -54 -150 L 54 -150 L 64 -96 L -64 -96 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -40 -150 L 40 -150 L 28 -110 L -28 -110 Z" fill={C.goldDark} />
      </g>
    )}
  </g>
);

/** 和紙の帳面の山 (役所の名簿)。x=中心, y=底。n=冊数 */
const NF1bLedger: React.FC<{ x: number; y: number; s?: number; n?: number; glow?: number; flutter?: number }> = ({
  x, y, s = 1, n = 5, glow = 0, flutter = 0,
}) => {
  const bw = 340, bh = 34;
  const top = -n * bh;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={bw * 0.62} ry={14} fill={KRP.ink} opacity={0.22} />
      {glow > 0.01 && <ellipse cx={0} cy={top / 2 - 20} rx={bw * 0.78} ry={-top * 0.95 + 30} fill={NP.glow} opacity={0.35 * glow} />}
      {Array.from({ length: n }, (_, i) => {
        const off = (rnd(77, i) - 0.5) * 26;
        const yy = -(i + 1) * bh;
        return (
          <g key={i} transform={`translate(${off} 0)`}>
            <rect x={-bw / 2} y={yy} width={bw} height={bh} rx={4} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
            <g stroke={C.washiDark} strokeWidth={2.5}>
              <line x1={-bw / 2 + 34} y1={yy + 12} x2={bw / 2 - 8} y2={yy + 12} />
              <line x1={-bw / 2 + 34} y1={yy + 22} x2={bw / 2 - 8} y2={yy + 22} />
            </g>
            <rect x={-bw / 2} y={yy} width={bw} height={7} fill={C.cover} />
            <rect x={bw / 2 - 28} y={yy} width={28} height={bh} fill={C.cover} stroke={KRP.ink} strokeWidth={4} />
            {[0.3, 0.7].map((k) => (
              <line key={k} x1={bw / 2 - 24} y1={yy + bh * k} x2={bw / 2 - 4} y2={yy + bh * k} stroke={C.washi} strokeWidth={4} />
            ))}
          </g>
        );
      })}
      {/* いちばん上の帳面の表紙 (斜め上から見える面) */}
      <g transform={`rotate(${-flutter * 6} ${-bw / 2} ${top})`}>
        <path d={`M ${-bw / 2} ${top} L ${bw / 2} ${top} L ${bw / 2 - 34} ${top - 74} L ${-bw / 2 + 34} ${top - 74} Z`}
          fill={C.cover} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* 綴じ糸 (右側の4つ目綴じ) */}
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={bw / 2 - 46 - k * 4} y1={top - 12 - k * 17} x2={bw / 2 - 22 - k * 4} y2={top - 12 - k * 17} stroke={C.washi} strokeWidth={4} />
        ))}
        {/* 題箋 */}
        <rect x={-120} y={top - 62} width={130} height={48} rx={4} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
        <text x={-55} y={top - 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.ink}>名簿</text>
        {/* 糸を結ぶ真鍮の輪 */}
        <circle cx={60} cy={top - 38} r={14} fill="none" stroke={NP.brassDark} strokeWidth={7} />
        <circle cx={60} cy={top - 38} r={14} fill="none" stroke={KRP.ink} strokeWidth={2} />
      </g>
    </g>
  );
};
/** NF1bLedger の糸を結ぶ輪の位置 */
const ledgerTie = (x: number, y: number, s = 1, n = 5): [number, number] => [x + 60 * s, y + (-n * 34 - 38) * s];

/** 煙のポン (変身の記号) */
const NF1bPuff: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 120 }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g opacity={Math.sin(t * Math.PI) * 0.95}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const d = r * (0.3 + 0.7 * t);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.8} r={r * 0.32 * (1 - t * 0.4)}
          fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />;
      })}
      <circle cx={x} cy={y} r={r * 0.5 * (1 - t * 0.5)} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #124 兵隊を集める名簿づくりのために、軍から求められたといわれています。
// 格: 並 / seed 4124
// 絵: 名簿の帳面から、名前が1行ずつ光って抜け出し、小さな兵隊の人形の列 (濃緑の軍服) になって行進していく (f)。机の上の帳面と、背景に兵舎のシルエット。札「〜といわれる」(小さく)
// どこ: 明治の役所の机の上 (開いた名簿の帳面)。奥の窓の外に兵舎と練兵場
// 演出: 名簿の名前が1行ずつ光の玉になって抜け出し、机に着地して濃緑の兵隊の人形になり、窓の兵舎へ向かって行進
// 動き: 列が f4〜34 で順に光る → 玉が弧を描いて飛ぶ → ポンと兵隊 → 列になって行進。カメラはゆっくり右へ寄る
const NF1bSoldier: React.FC<{ x: number; y: number; s: number; f: number; phase: number }> = ({ x, y, s, f, phase }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={70} ry={14} fill={KRP.ink} opacity={0.22} />
    {/* 肩に担いだ銃 (体の後ろ) */}
    <line x1={92} y1={-60} x2={40} y2={-360} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
    <line x1={92} y1={-60} x2={40} y2={-360} stroke={C.rifle} strokeWidth={11} strokeLinecap="round" />
    <line x1={42} y1={-350} x2={34} y2={-400} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
    <Person x={0} y={0} s={1} f={f} phase={phase} cloth={C.soldier} clothDark={C.soldierDark} hair="cap" pose="run" face="normal" />
    {/* 軍服の金ボタン */}
    {[0, 1, 2].map((k) => <circle key={k} cx={0} cy={-142 + k * 28} r={6} fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} />)}
    {/* つばのある軍帽 (赤い帯) */}
    <path d="M -60 -252 L -56 -306 Q 0 -322 56 -306 L 60 -252 Z" fill={C.soldier} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-60} y={-268} width={120} height={16} fill={C.capRed} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={0} cy={-288} r={8} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
    <path d="M -66 -252 Q 0 -236 66 -252 L 62 -242 Q 0 -226 -62 -242 Z" fill={KRP.ink} />
  </g>
);

const Nm124: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const N = 7;
  const colX = (i: number) => 880 - i * 48; // 右ページの列 (日本語は右から読む)
  const born = (i: number) => 4 + i * 5;
  const LX = 1010, LY = 800;
  const slot = (i: number) => 1760 - i * 112;
  const speed = 28;
  return (
    <Frame f={f} seed={4124}>
      <g transform={cam(960, 600, 1 + 0.04 * k, -24 * k, 0)}>
        {/* ===== 奥の壁 (漆喰と柱) ===== */}
        <rect x={-40} y={-40} width={W + 80} height={620} fill={C.wall} />
        <rect x={-40} y={-40} width={W + 80} height={70} fill={C.pillar} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={30} width={80} height={560} fill={C.pillar} stroke={KRP.ink} strokeWidth={6} />
        {/* 掲示板 (布告の紙が貼ってある) */}
        <rect x={130} y={110} width={360} height={290} rx={6} fill={C.pillarDark} stroke={KRP.ink} strokeWidth={6} />
        {[[150, 128, -2], [320, 132, 3], [160, 268, 2], [330, 262, -3]].map(([px, py, r], i) => (
          <g key={i} transform={`rotate(${r} ${px + 70} ${py + 60})`}>
            <rect x={px} y={py} width={140} height={118} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3, 4].map((j) => (
              <line key={j} x1={px + 118 - j * 22} y1={py + 16} x2={px + 118 - j * 22} y2={py + 100 - (j % 2) * 24} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
            ))}
            <circle cx={px + 70} cy={py + 6} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* ===== 窓 (外に兵舎と練兵場) ===== */}
        <rect x={1000} y={80} width={780} height={400} fill={C.sky} />
        <rect x={1000} y={300} width={780} height={60} fill={C.skyLow} />
        <rect x={1000} y={380} width={780} height={100} fill={C.ground} />
        {/* 奥の兵舎 */}
        <rect x={1480} y={310} width={260} height={74} fill={C.barracksWin} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1470 310 L 1750 310 L 1724 286 L 1496 286 Z" fill={C.barracks} stroke={KRP.ink} strokeWidth={4} />
        {/* 手前の兵舎 (2階建て・窓がずらり) */}
        <path d="M 1036 280 L 1620 280 L 1584 236 L 1072 236 Z" fill={C.barracksDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1050} y={280} width={556} height={110} fill={C.barracks} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect x={1066 + i * 45} y={292} width={24} height={30} fill={C.barracksWin} stroke={KRP.ink} strokeWidth={2.5} />
            <rect x={1066 + i * 45} y={340} width={24} height={30} fill={C.barracksWin} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        <rect x={1304} y={334} width={52} height={56} fill={C.barracksDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 旗竿と日の丸 (風でなびく) */}
        <line x1={1690} y1={130} x2={1690} y2={392} stroke={KRP.ink} strokeWidth={6} />
        {(() => {
          const w1 = Math.sin(f / 5) * 6, w2 = Math.sin(f / 5 + 1.4) * 6;
          return (
            <g>
              <path d={`M 1693 136 Q 1720 ${136 + w1} 1748 ${136 + w2 * 0.6} Q 1770 ${136 - w2} 1792 ${138 + w1} L 1792 ${196 + w1} Q 1770 ${194 - w2} 1748 ${194 + w2 * 0.6} Q 1720 ${194 + w1} 1693 194 Z`}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={1744} cy={166 + w2 * 0.4} r={17} fill={KRP.red} />
            </g>
          );
        })()}
        {/* 練兵場で行進する遠くの兵隊 */}
        {Array.from({ length: 6 }, (_, i) => (
          <PersonMini key={i} x={1080 + i * 46 + f * 2} y={455} s={0.2} color={C.soldier} f={f} phase={0} face="none" />
        ))}
        <TagPlate x={1130} y={140} text="兵舎" size={30} />
        {/* 窓枠 */}
        <rect x={1000} y={80} width={780} height={400} fill="none" stroke={C.pillar} strokeWidth={22} />
        <rect x={1000} y={80} width={780} height={400} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <line x1={1390} y1={80} x2={1390} y2={480} stroke={C.pillar} strokeWidth={12} />
        <line x1={1000} y1={220} x2={1780} y2={220} stroke={C.pillar} strokeWidth={10} />
        <rect x={980} y={478} width={820} height={26} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />

        {/* ===== 机 ===== */}
        <rect x={-40} y={540} width={W + 80} height={600} fill={C.deskTop} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.deskDark} strokeWidth={4} opacity={0.45} fill="none">
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M -40 ${590 + i * 80} q 480 ${rnd(4124, i) * 30 - 15} 980 0 q 480 ${rnd(4125, i) * 30 - 15} 980 0`} />
          ))}
        </g>
        {/* ランプ (左奥) */}
        <g transform="translate(96 600)">
          <ellipse cx={0} cy={0} rx={50} ry={12} fill={KRP.ink} opacity={0.25} />
          <path d="M -40 0 L 40 0 L 24 -40 L -24 -40 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-70} rx={34} ry={34} fill={KRP.white} opacity={0.7} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -6 -66 Q 0 ${-96 - Math.sin(f / 3) * 5} 6 -66 Z`} fill={KRP.orange} />
          <rect x={-14} y={-150} width={28} height={50} rx={6} fill={KRP.white} opacity={0.6} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ===== 開いた名簿の帳面 ===== */}
        <g transform="rotate(-1.5 560 690)">
          <rect x={186} y={566} width={760} height={250} rx={6} fill={KRP.ink} opacity={0.2} />
          <rect x={176} y={552} width={384} height={256} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <rect x={560} y={552} width={384} height={256} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 560 552 L 560 808" stroke={C.washiDark} strokeWidth={10} />
          {/* 朱の罫線 */}
          {Array.from({ length: 15 }, (_, j) => (
            <line key={j} x1={200 + j * 48} y1={570} x2={200 + j * 48} y2={790} stroke={KRP.red} strokeWidth={2} opacity={0.35} />
          ))}
          {/* 左ページ (まだ残っている名前) */}
          {Array.from({ length: 7 }, (_, j) => (
            <g key={j} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.75}>
              {Array.from({ length: 5 }, (_, d) => (
                <line key={d} x1={512 - j * 48 - 11} y1={596 + d * 38} x2={512 - j * 48 + 11 - rnd(9, j * 5 + d) * 8} y2={596 + d * 38} />
              ))}
            </g>
          ))}
          {/* 右ページ: 1行ずつ光って抜ける */}
          {Array.from({ length: N }, (_, i) => {
            const b = born(i);
            const lit = seg(f, b - 4, b);
            const gone = seg(f, b, b + 3);
            const cx = colX(i);
            return (
              <g key={i}>
                {lit > 0 && gone < 1 && <rect x={cx - 22} y={572} width={44} height={218} rx={10} fill={NP.glow} opacity={0.7 * lit * (1 - gone)} />}
                <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.85 * (1 - gone * 0.8)}>
                  {Array.from({ length: 5 }, (_, d) => (
                    <line key={d} x1={cx - 11} y1={596 + d * 38} x2={cx + 11 - rnd(8, i * 5 + d) * 8} y2={596 + d * 38} />
                  ))}
                </g>
                {gone >= 1 && <rect x={cx - 16} y={584} width={32} height={196} rx={8} fill="none" stroke={KRP.grayDark} strokeWidth={3} strokeDasharray="6 8" opacity={0.6} />}
              </g>
            );
          })}
          {/* 文鎮 */}
          <rect x={196} y={566} width={130} height={26} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <TagPlate x={360} y={500} text="〜といわれる" size={30} />
        {/* 硯と筆 */}
        <g transform="translate(260 900) rotate(-6)">
          <rect x={-90} y={-40} width={180} height={80} rx={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={-30} cy={0} rx={40} ry={22} fill={KRP.ink} />
          <line x1={110} y1={-30} x2={330} y2={-80} stroke={C.rifle} strokeWidth={14} strokeLinecap="round" />
          <path d="M 110 -30 L 80 -22 L 108 -40 Z" fill={KRP.ink} />
        </g>

        {/* ===== 光の玉 → 兵隊 ===== */}
        {Array.from({ length: N }, (_, i) => {
          const b = born(i);
          const u = seg(f, b, b + 6);
          const cx = colX(i);
          if (u <= 0) return null;
          if (u < 1) {
            const bx = lerp(cx, LX, u);
            const by = lerp(650, LY - 60, u) - Math.sin(u * Math.PI) * 230;
            return (
              <g key={i}>
                {[0.15, 0.3, 0.45].map((d, j) => {
                  const uu = Math.max(0, u - d * 0.5);
                  return <circle key={j} cx={lerp(cx, LX, uu)} cy={lerp(650, LY - 60, uu) - Math.sin(uu * Math.PI) * 230} r={10 - j * 2.5} fill={NP.glow} opacity={0.6 - j * 0.15} />;
                })}
                <circle cx={bx} cy={by} r={30} fill={NP.glow} opacity={0.45} />
                <circle cx={bx} cy={by} r={15} fill={NP.glowCore} stroke={NP.glow} strokeWidth={4} />
              </g>
            );
          }
          const land = b + 6;
          const dist = slot(i) - LX;
          const arrive = land + dist / speed;
          const sx = f < arrive ? LX + (f - land) * speed : slot(i) + (f - arrive) * 3;
          const pp = pop(seg(f, land, land + 4));
          const puff = seg(f, land, land + 7);
          return (
            <g key={i}>
              <g transform={`translate(${sx} ${LY}) scale(${pp}) translate(${-sx} ${-LY})`}>
                <NF1bSoldier x={sx} y={LY} s={0.42} f={f} phase={0} />
              </g>
              {puff > 0 && puff < 1 && (
                <g opacity={(1 - puff) * 0.9}>
                  {[-1, 1].map((d) => <circle key={d} cx={LX + d * 40 * puff} cy={LY - 10} r={8 + 14 * puff} fill="none" stroke={NP.glow} strokeWidth={5} />)}
                </g>
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #125 わずか5年で、名前は、自由に着替える服から、外せない札に変わったのです。
// 格: 図 / seed 4125
// 絵: ★`MeijiLock` (stage=5) を引きで。左に第4章の「名前の衣桁 (着替える服)」、右に錠前が5つかかった `MeijiLock`。真ん中に矢印「5年」。f で衣桁の名札が1枚ずつ右へ飛んでいって錠前の札に吸いこまれる
// どこ: 板壁に貼った大きな和紙の上。左に江戸の衣桁、右に明治8年の名前の錠前 (5つ全部閉まった姿)
// 演出: 衣桁に掛かった3枚の着物 (幼名・通称・隠居名) が1枚ずつ右へ飛んで、錠前の名札に吸いこまれる。衣桁は空になる
// 動き: f8/16/24 から10コマずつ飛ぶ。吸いこまれる瞬間に名札が光る。カメラはゆっくり引く
const NF1bKimono: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <g>
    <path d="M -96 0 L 96 0 L 96 96 L 56 96 L 60 262 L -60 262 L -56 96 L -96 96 Z" fill={color} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -96 80 L -56 80 M 96 80 L 56 80" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
    <path d="M -28 0 L 0 76 L 28 0" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-58} y={118} width={116} height={30} fill={KRP.ink} opacity={0.28} />
    <rect x={-46} y={176} width={92} height={50} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <text x={0} y={212} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 2 ? 26 : 32} fill={KRP.ink}>{label}</text>
  </g>
);

const Nm125: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 40));
  const LOCK_X = 1400, LOCK_Y = 520, LS = 0.68;
  const TX = LOCK_X, TY = LOCK_Y + (-320 + 120) * LS; // 錠前の名札の中心
  const clothes: [number, string, string][] = [[245, C.asagi, "幼名"], [355, C.yamabuki, "通称"], [465, C.fuji, "隠居名"]];
  const absorb = Math.max(...clothes.map((_, i) => { const a = 8 + i * 8; const u = seg(f, a + 7, a + 12); return Math.sin(u * Math.PI); }));
  const swing = Math.sin(f / 6) * 2 * seg(f, 8, 40);
  return (
    <Frame f={f} seed={4125}>
      <g transform={cam(960, 540, 1.06 - 0.06 * k)}>
        {/* 板壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.board} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={-60 + i * 180} y1={-60} x2={-60 + i * 180} y2={H + 60} stroke={C.boardDark} strokeWidth={6} />
        ))}
        {/* 和紙 (四隅を画鋲) */}
        <rect x={70} y={70} width={1780} height={790} fill={KRP.ink} opacity={0.2} />
        <rect x={56} y={56} width={1780} height={790} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.washiDark} strokeWidth={2} opacity={0.6}>
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M 80 ${120 + i * 84} q 400 ${rnd(4125, i) * 16 - 8} 880 0 q 440 ${rnd(4126, i) * 16 - 8} 860 0`} fill="none" />)}
        </g>
        {[[86, 86], [1806, 86], [86, 816], [1806, 816]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* ===== 左: 衣桁 ===== */}
        <g>
          <rect x={136} y={250} width={26} height={500} fill={C.ikou} stroke={KRP.ink} strokeWidth={5} />
          <rect x={548} y={250} width={26} height={500} fill={C.ikou} stroke={KRP.ink} strokeWidth={5} />
          <rect x={96} y={730} width={110} height={30} rx={8} fill={C.ikou} stroke={KRP.ink} strokeWidth={5} />
          <rect x={506} y={730} width={110} height={30} rx={8} fill={C.ikou} stroke={KRP.ink} strokeWidth={5} />
          <rect x={150} y={330} width={410} height={18} fill={C.ikou} stroke={KRP.ink} strokeWidth={4} />
          <rect x={110} y={236} width={500} height={26} rx={8} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
          {/* 着物が抜けたあとの空の形 (点線) */}
          {clothes.map(([cx], i) => {
            const gone = seg(f, 8 + i * 8 + 2, 8 + i * 8 + 8);
            return gone > 0 ? (
              <g key={`g${i}`} transform={`translate(${cx} 262) scale(0.9)`} opacity={gone * 0.8}>
                <path d="M -96 0 L 96 0 L 96 96 L 56 96 L 60 262 L -60 262 L -56 96 L -96 96 Z" fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="14 12" />
              </g>
            ) : null;
          })}
          {/* 掛け紐のフック */}
          {clothes.map(([cx], i) => (
            <path key={i} d={`M ${cx - 20} 262 q 20 18 40 0`} stroke={KRP.ink} strokeWidth={4} fill="none" transform={`rotate(${swing * (i + 1)} ${cx} 262)`} />
          ))}
        </g>
        {/* ===== 右: 錠前 5つ全部 ===== */}
        <g>
          {absorb > 0.01 && <circle cx={TX} cy={TY} r={210} fill={NP.glow} opacity={0.35 * absorb} />}
          <MeijiLock x={LOCK_X} y={LOCK_Y} s={LS} stage={5} t={1} f={f} />
        </g>
        {/* 真ん中の矢印「5年」 */}
        <Arrow x={900} y={540} s={1.7} t={seg(f, 2, 10)} />
        <TagPlate x={800} y={440} text="5年" size={46} t={seg(f, 4, 12)} />
        <TagPlate x={355} y={786} text="江戸" size={34} />
        <TagPlate x={1400} y={786} text="明治8年" size={34} />
        {/* ===== 飛ぶ着物 ===== */}
        {clothes.map(([cx, col, label], i) => {
          const a = 8 + i * 8;
          const u = easeInOut(seg(f, a, a + 10));
          if (u >= 1) return null;
          const px = lerp(cx, TX, u);
          const py = lerp(262, TY - 60, u) - Math.sin(u * Math.PI) * 180;
          const sc = lerp(1, 0.14, u);
          const rot = u * 30 + (u > 0 ? 0 : swing);
          return (
            <g key={i} transform={`translate(${px} ${py}) scale(${sc * 0.9}) rotate(${rot})`} opacity={1 - Math.pow(u, 4)}>
              <NF1bKimono color={col} label={label} />
              {u > 0 && u < 1 && (
                <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.5}>
                  <line x1={-140} y1={60} x2={-230} y2={80} /><line x1={-140} y1={140} x2={-250} y2={150} />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #126 ちなみに、明治のはじめ、結婚した女性は、実家の名字のままでした。
// 格: 並 / seed 4126
// 絵: 明治の婚礼の座敷 (金屏風・三三九度の盃)。新郎新婦は後ろ姿。2人の背中の上に、それぞれ**別の名字の札** (例「田中」「佐藤」のような一般的な名字・2つは違う) が浮かぶ。札「明治9年」
// どこ: 明治の婚礼の座敷。金屏風・燭台・三三九度の盃。新郎新婦は正座の後ろ姿
// 演出: 2人の背中の上に、別々の名字の札 (田中 / 佐藤) がぽんと浮かぶ。間に「≠」
// 動き: f10 田中・f18 佐藤が出る → f26 ≠ が出て札が少し離れる。燭台の火がゆれ、カメラは札へ寄る
const NF1bGoldScreen: React.FC<{ f: number; open?: number }> = ({ open = 1 }) => {
  const pw = 274;
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => {
        const x0 = 138 + i * pw;
        const left = i < 3;
        const sx = open; // 折りたたむと端へ縮む
        const ox = left ? 138 : 138 + 6 * pw;
        return (
          <g key={i} transform={`translate(${ox} 0) scale(${sx} 1) translate(${-ox} 0)`}>
            <rect x={x0} y={100} width={pw} height={500} fill={i % 2 ? C.goldDark : C.gold} stroke={KRP.ink} strokeWidth={5} />
            {/* 金雲 */}
            <path d={`M ${x0 + 20} ${170 + (i % 3) * 40} q 40 -30 80 0 q 40 -30 80 0 q 40 -20 70 0`} fill="none" stroke={C.goldLight} strokeWidth={16} strokeLinecap="round" opacity={0.8} />
            <path d={`M ${x0 + 40} ${470 - (i % 2) * 50} q 50 -26 100 0 q 40 -22 90 0`} fill="none" stroke={C.goldLight} strokeWidth={14} strokeLinecap="round" opacity={0.7} />
          </g>
        );
      })}
      {/* 松の枝 (屏風の絵) */}
      <g opacity={open}>
        <path d="M 300 600 Q 330 440 420 360 Q 520 300 640 320" stroke={C.pillarDark} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M 1640 600 Q 1600 470 1500 400 Q 1400 350 1290 380" stroke={C.pillarDark} strokeWidth={22} fill="none" strokeLinecap="round" />
        {[[420, 340], [540, 300], [650, 316], [1500, 380], [1390, 350], [1290, 366]].map(([px, py], i) => (
          <ellipse key={i} cx={px} cy={py} rx={70} ry={30} fill={C.pine} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      <rect x={130} y={92} width={6 * pw + 16} height={516} fill="none" stroke={C.ikou} strokeWidth={14} opacity={open} />
    </g>
  );
};
const NF1bSakazuki: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* 三方 (白木の台) */}
    <path d="M -90 0 L 90 0 L 70 -60 L -70 -60 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={-30} r={14} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-100} y={-78} width={200} height={20} rx={4} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
    {/* 三つ重ねの朱の盃 */}
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={0} cy={-88 - i * 14} rx={70 - i * 14} ry={14} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
    ))}
    <ellipse cx={0} cy={-120} rx={30} ry={6} fill={C.gold} opacity={0.8} />
    {/* 銚子と雄蝶雌蝶の折り紙 */}
    <g transform="translate(140 -10)">
      <path d="M -30 0 L 30 0 L 22 -90 Q 0 -104 -22 -90 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M 22 -80 L 52 -96" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M -14 -96 L -36 -124 L -2 -112 Z M 14 -96 L 36 -124 L 2 -112 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    </g>
  </g>
);
const NF1bShokudai: React.FC<{ x: number; y: number; f: number; ph: number }> = ({ x, y, f, ph }) => {
  const fl = Math.sin(f / 3 + ph) * 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={50} ry={12} fill={KRP.ink} opacity={0.25} />
      <path d="M -40 0 L 40 0 L 14 -30 L -14 -30 Z" fill={KRP.ink} />
      <rect x={-7} y={-280} width={14} height={252} fill={KRP.ink} />
      <ellipse cx={0} cy={-282} rx={36} ry={8} fill={KRP.ink} />
      <rect x={-12} y={-340} width={24} height={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-370} r={42} fill={NP.glow} opacity={0.35} />
      <path d={`M -10 -342 Q ${fl} -${400 + fl * 2} 10 -342 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
      <path d={`M -4 -344 Q ${fl * 0.5} -${370 + fl} 4 -344 Z`} fill={KRP.yellow} />
    </g>
  );
};

const Nm126: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const t1 = seg(f, 10, 16), t2 = seg(f, 18, 24), tn = seg(f, 26, 32);
  const apart = easeOut(seg(f, 28, 40)) * 26;
  const bobA = Math.sin(f / 10) * 5, bobB = Math.sin(f / 10 + 1.5) * 5;
  const GX = 700, BX = 1220, PY = 880, S = 1.3;
  return (
    <Frame f={f} seed={4126}>
      <g transform={cam(960, 450, 1 + 0.05 * k)}>
        {/* 奥の壁・長押 */}
        <rect x={-60} y={-60} width={W + 120} height={680} fill={C.wall} />
        <rect x={-60} y={40} width={W + 120} height={30} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />
        <NF1bGoldScreen f={f} />
        {/* 畳 */}
        <rect x={-60} y={600} width={W + 120} height={540} fill={C.tatami} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.7}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60} y1={620 + i * 34} x2={W + 60} y2={620 + i * 34} />)}
        </g>
        <path d="M 960 600 L 960 1140 M -60 820 L 1980 820" stroke={C.heri} strokeWidth={14} />
        <NF1bShokudai x={250} y={640} f={f} ph={0} />
        <NF1bShokudai x={1670} y={640} f={f} ph={2} />
        <NF1bSakazuki x={940} y={690} />
        {/* ===== 新郎 (後ろ姿・正座) ===== */}
        <Person x={GX} y={PY} s={S} f={f} phase={1} cloth={C.groom} clothDark={C.groomDark} hair="none" />
        <NF1bSeiza x={GX} y={PY} s={S} kind="man" bob={pbob(f, 1)} />
        {/* 羽織の背の家紋 */}
        <g transform={`translate(${GX} ${PY - 140 * S + pbob(f, 1)})`}>
          <circle r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={Math.cos(a) * 10} cy={Math.sin(a) * 10} r={7} fill={C.groom} />;
          })}
        </g>
        <NF1bBackHead x={GX} y={PY} s={S} kind="man" bob={pbob(f, 1)} />
        {/* ===== 新婦 (後ろ姿・正座・打掛) ===== */}
        <Person x={BX} y={PY} s={S} f={f} phase={3} cloth={C.bride} clothDark={C.brideDark} hair="none" />
        <NF1bSeiza x={BX} y={PY} s={S} kind="bride" bob={pbob(f, 3)} />
        <NF1bBackHead x={BX} y={PY} s={S} kind="bride" bob={pbob(f, 3)} />
        {/* ===== 浮かぶ名字の札 ===== */}
        <g transform={`translate(${-apart} ${bobA})`}>
          {t1 > 0 && <line x1={GX} y1={440} x2={GX} y2={PY - 300 * S} stroke={KRP.ink} strokeWidth={3} strokeDasharray="6 8" opacity={t1 * 0.6} />}
          <TagPlate x={GX} y={400} text="田中" size={66} t={t1} rot={-3} />
        </g>
        <g transform={`translate(${apart} ${bobB})`}>
          {t2 > 0 && <line x1={BX} y1={440} x2={BX} y2={PY - 350 * S} stroke={KRP.ink} strokeWidth={3} strokeDasharray="6 8" opacity={t2 * 0.6} />}
          <TagPlate x={BX} y={400} text="佐藤" size={66} t={t2} rot={3} />
        </g>
        {tn > 0 && (
          <g transform={`translate(960 400) scale(${pop(tn)})`}>
            <circle r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} fill={KRP.red}>≠</text>
          </g>
        )}
        <TagPlate x={520} y={170} text="明治9年" size={40} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #127 夫婦が同じ名字になったのは、明治31年の民法からです。
// 格: 山 / seed 4127
// 絵: #126 の2人の名字の札が、f で大きな**「家」の札** (屋根の形の札) に吸いこまれて、同じ1つの名字になる。背景が明治31年の民法の分厚い本の表紙 (表紙の字は「民法」だけ) に変わる。札「明治31年」
// どこ: #126 の座敷 → 金屏風がたたまれて、奥に明治31年の民法の分厚い本の表紙が現れる
// 演出: 2人の名字の札 (田中・佐藤) が大きな屋根形の「家」の札に吸いこまれ、家の札に「田中」1つだけが残る。そこから2枚の「田中」が2人の頭上へ降りる
// 動き: f0〜14 屏風がたたまれる / f8 家の札 / f14〜24 吸いこみ / f24 光って名字が1つに / f30〜40 2枚の田中が降りる。カメラは引き
const NF1bIeFuda: React.FC<{ x: number; y: number; s: number; t: number; name: string; nameT: number; flash: number }> = ({ x, y, s, t, name, nameT, flash }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      {flash > 0.01 && (
        <g opacity={flash}>
          <circle r={330} fill={NP.glow} opacity={0.4} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 250} y1={Math.sin(a) * 250} x2={Math.cos(a) * 340} y2={Math.sin(a) * 340} stroke={NP.glow} strokeWidth={12} strokeLinecap="round" />;
          })}
        </g>
      )}
      <rect x={-200} y={-50} width={400} height={230} rx={10} fill={KRP.ink} opacity={0.2} transform="translate(10 12)" />
      {/* 札の板 */}
      <rect x={-190} y={-60} width={380} height={230} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7}>
        <path d="M -170 0 q 90 -12 170 0 q 90 12 160 -4" /><path d="M -170 130 q 90 10 170 0 q 80 -10 160 4" />
      </g>
      {/* 屋根 (瓦) */}
      <path d="M -250 -40 L 0 -200 L 250 -40 L 220 -30 L 0 -168 L -220 -30 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -220 -30 L 0 -168 L 220 -30 L 190 -60 L -190 -60 Z" fill={C.roof} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
      {[-150, -90, -30, 30, 90, 150].map((rx) => (
        <line key={rx} x1={rx} y1={-60 - (150 - Math.abs(rx)) * 0.62} x2={rx * 1.1} y2={-48} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      ))}
      {/* 破風の札「家」 */}
      <rect x={-38} y={-140} width={76} height={68} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={KRP.red}>家</text>
      {/* 1つになった名字 */}
      <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={NP.sumi} opacity={nameT}
        transform={`scale(${0.6 + 0.4 * pop(nameT)})`}>{name}</text>
      {nameT < 0.5 && <rect x={-140} y={-20} width={280} height={150} rx={10} fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="10 10" opacity={1 - nameT * 2} />}
    </g>
  );
};

const Nm127: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const fold = 1 - easeInOut(seg(f, 0, 14));
  const ieT = seg(f, 8, 14);
  const suck = easeInOut(seg(f, 14, 24));
  const nameT = seg(f, 24, 30);
  const flash = Math.sin(seg(f, 22, 34) * Math.PI);
  const drop = easeOut(seg(f, 30, 40));
  const GX = 760, BX = 1160, PY = 930, S = 1.0;
  const IX = 960, IY = 310;
  const TAGY = 520;
  return (
    <Frame f={f} seed={4127}>
      <g transform={cam(960, 500, 1.06 - 0.06 * k)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.wall} />
        {/* ===== 民法の分厚い本 (表紙) ===== */}
        <g>
          {/* 小口 (ページの厚み) */}
          <path d="M 1700 60 L 1790 100 L 1790 840 L 1700 800 Z" fill={C.pageEdge} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={1700 + i * 7.5} y1={64 + i * 3.4} x2={1700 + i * 7.5} y2={796 + i * 3.4} stroke={C.washiDark} strokeWidth={2} />
          ))}
          <rect x={220} y={40} width={1490} height={770} rx={14} fill={C.book} stroke={KRP.ink} strokeWidth={8} />
          <rect x={258} y={76} width={1414} height={698} rx={6} fill="none" stroke={C.gold} strokeWidth={7} />
          <rect x={276} y={94} width={1378} height={662} rx={4} fill="none" stroke={C.gold} strokeWidth={3} />
          {/* 角の金具 */}
          {[[230, 50, 0], [1700, 50, 90], [1700, 800, 180], [230, 800, 270]].map(([cx, cy, r], i) => (
            <path key={i} d="M 0 0 L 70 0 L 0 70 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={4} transform={`translate(${cx} ${cy}) rotate(${r})`} />
          ))}
          {/* 布目 */}
          <g stroke={C.bookDark} strokeWidth={2} opacity={0.6}>
            {Array.from({ length: 16 }, (_, i) => <line key={i} x1={280} y1={120 + i * 40} x2={1650} y2={120 + i * 40} />)}
          </g>
          {/* 題字「民法」(縦) */}
          <rect x={330} y={130} width={140} height={300} rx={6} fill={C.bookDark} stroke={C.gold} strokeWidth={5} />
          <text x={400} y={252} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={C.goldLight}>民</text>
          <text x={400} y={392} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={C.goldLight}>法</text>
        </g>
        {/* ===== たたまれていく金屏風 (#126 から) ===== */}
        {fold > 0.01 && <NF1bGoldScreen f={f} open={fold} />}
        {/* ===== 畳 ===== */}
        <rect x={-60} y={800} width={W + 120} height={340} fill={C.tatami} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.7}>
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 34} x2={W + 60} y2={820 + i * 34} />)}
        </g>
        {/* ===== 2人 (後ろ姿・正座) ===== */}
        <Person x={GX} y={PY} s={S} f={f} phase={1} cloth={C.groom} clothDark={C.groomDark} hair="none" />
        <NF1bSeiza x={GX} y={PY} s={S} kind="man" bob={pbob(f, 1)} />
        <NF1bBackHead x={GX} y={PY} s={S} kind="man" bob={pbob(f, 1)} />
        <Person x={BX} y={PY} s={S} f={f} phase={3} cloth={C.bride} clothDark={C.brideDark} hair="none" />
        <NF1bSeiza x={BX} y={PY} s={S} kind="bride" bob={pbob(f, 3)} />
        <NF1bBackHead x={BX} y={PY} s={S} kind="bride" bob={pbob(f, 3)} />
        {/* ===== 家の札 ===== */}
        <NF1bIeFuda x={IX} y={IY} s={0.95} t={ieT} name="田中" nameT={nameT} flash={flash} />
        {/* 吸いこまれる2枚の札 (元の札は吸いこまれて消える) */}
        {suck < 1 && ([[GX, "田中", -3], [BX, "佐藤", 3]] as [number, string, number][]).map(([sx, txt, r], i) => {
          const px = lerp(sx, IX, suck);
          const py = lerp(TAGY, IY + 60, suck) - Math.sin(suck * Math.PI) * 80;
          const sc = lerp(1, 0.2, suck);
          return (
            <g key={i} transform={cam(px, py, sc)} opacity={1 - Math.pow(suck, 3)}>
              <TagPlate x={px} y={py} text={txt} size={54} rot={r + suck * (i ? 40 : -40)} />
            </g>
          );
        })}
        {/* 家の札から降りてくる2枚の「田中」 */}
        {drop > 0 && [GX, BX].map((sx, i) => {
          const px = lerp(IX, sx, drop);
          const py = lerp(IY + 60, TAGY, drop);
          return (
            <g key={i} transform={cam(px, py, lerp(0.3, 1, drop))}>
              <TagPlate x={px} y={py} text="田中" size={54} />
              {drop > 0.9 && <line x1={px} y1={py + 46} x2={px} y2={py + 80} stroke={KRP.ink} strokeWidth={3} strokeDasharray="6 8" opacity={0.6} />}
            </g>
          );
        })}
        {drop > 0.95 && (
          <g transform={`translate(960 ${TAGY}) scale(${pop(seg(f, 38, 42))})`}>
            <circle r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.green}>＝</text>
          </g>
        )}
        <TagPlate x={1480} y={150} text="明治31年" size={42} t={seg(f, 4, 12)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #128 昔から夫婦は同じ名字だった、というわけではないのです。
// 格: 図 / seed 4128
// 絵: 年表の帯 (木の物差しのような年表=世界)。左端から「江戸」「明治はじめ (別々)」「明治31年 (同じ)」「今」。明治31年のところに旗が立つ。「昔から同じ」の札に赤い×が f でつく
// どこ: 木の机の上に置いた、長い木の物差しの年表
// 演出: 「昔から同じ」の札と、江戸から今までずっと続く点線。明治31年に旗が立ち、札に赤い×。点線は明治31年から先だけ緑の実線になる
// 動き: f6〜16 旗が立つ / f24〜30 ×がつき札がうなだれる / f30〜42 31年より前の点線が消え、後ろが緑の実線に。カメラは物差しに沿って右へ
const NF1bMiniTag: React.FC<{ x: number; y: number; text: string; dim?: boolean }> = ({ x, y, text, dim }) => (
  <g transform={`translate(${x} ${y})`} opacity={dim ? 0.55 : 1}>
    <rect x={-44} y={-26} width={88} height={52} rx={6} fill={NP.wood} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={0} cy={-34} r={6} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
    <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={NP.sumi}>{text}</text>
  </g>
);

const Nm128: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const flag = easeOut(seg(f, 6, 16));
  const xT = seg(f, 24, 30);
  const droop = easeOut(seg(f, 28, 38));
  const fade = seg(f, 30, 38);
  const solid = easeOut(seg(f, 32, 42));
  const P = { edo: 330, meiji: 790, m31: 1200, now: 1640 };
  const RY = 470; // 物差しの上端
  const wave = Math.sin(f / 5) * 6;
  return (
    <Frame f={f} seed={4128}>
      <g transform={cam(960, 540, 1.02, 30 - 50 * k, 0)}>
        {/* 机 (木目) */}
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.45} fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M -80 ${40 + i * 130} q 500 ${rnd(4128, i) * 40 - 20} 1040 0 q 500 ${rnd(4129, i) * 40 - 20} 1040 0`} />
          ))}
        </g>
        {/* 鉛筆と消しゴム */}
        <g transform="translate(1500 900) rotate(-8)">
          <rect x={-200} y={-14} width={360} height={28} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 160 -14 L 210 0 L 160 14 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 196 -4 L 210 0 L 196 4 Z" fill={KRP.ink} />
        </g>
        <rect x={200} y={860} width={120} height={60} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} transform="rotate(10 260 890)" />
        {/* ===== 物差し ===== */}
        <rect x={110} y={RY + 12} width={1720} height={130} rx={10} fill={KRP.ink} opacity={0.22} />
        <rect x={96} y={RY} width={1720} height={130} rx={10} fill={C.ruler} stroke={KRP.ink} strokeWidth={7} />
        <rect x={96} y={RY + 100} width={1720} height={30} rx={8} fill={C.rulerDark} opacity={0.5} />
        {Array.from({ length: 86 }, (_, i) => {
          const x = 116 + i * 20;
          const big = i % 5 === 0;
          return <line key={i} x1={x} y1={RY} x2={x} y2={RY + (big ? 44 : 22)} stroke={KRP.ink} strokeWidth={big ? 4 : 2.5} />;
        })}
        {/* 時代の帯の色 (物差しの下側) */}
        <rect x={110} y={RY + 60} width={P.m31 - 110} height={28} fill={KRP.gray} opacity={0.5} />
        <rect x={P.m31} y={RY + 60} width={1800 - P.m31} height={28} fill={KRP.green} opacity={0.55} />
        {/* 目盛りの点 */}
        {[P.edo, P.meiji, P.m31, P.now].map((x, i) => (
          <circle key={i} cx={x} cy={RY + 74} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 下の札 */}
        <TagPlate x={330} y={680} text="江戸" size={38} />
        <TagPlate x={790} y={680} text="明治はじめ" size={38} />
        <TagPlate x={1200} y={680} text="明治31年" size={38} />
        <TagPlate x={1640} y={680} text="今" size={38} />
        <TagPlate x={790} y={770} text="別々" size={32} color={KRP.red} />
        <TagPlate x={1200} y={770} text="同じ" size={32} color={KRP.green} />
        <TagPlate x={1640} y={770} text="同じ" size={32} color={KRP.green} />
        {/* ===== 物差しの上の小札 ===== */}
        <QMark x={P.edo} y={430} s={0.6} f={f} color={KRP.grayDark} />
        <NF1bMiniTag x={P.meiji - 58} y={410} text="田中" />
        <NF1bMiniTag x={P.meiji + 58} y={410} text="佐藤" />
        <NF1bMiniTag x={P.now - 48} y={410} text="田中" />
        <NF1bMiniTag x={P.now + 48} y={410} text="田中" />
        {/* 明治31年の旗 */}
        <g>
          <line x1={P.m31} y1={RY + 6} x2={P.m31} y2={RY - 290 * flag} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          {flag > 0.6 && (
            <g opacity={seg(f, 12, 16)}>
              <path d={`M ${P.m31 + 4} ${RY - 286} Q ${P.m31 + 70} ${RY - 286 + wave} ${P.m31 + 150} ${RY - 276 - wave} L ${P.m31 + 150} ${RY - 210 - wave} Q ${P.m31 + 70} ${RY - 220 + wave} ${P.m31 + 4} ${RY - 216} Z`}
                fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
              <text x={P.m31 + 76} y={RY - 236} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>民法</text>
            </g>
          )}
          <NF1bMiniTag x={P.m31 - 58} y={410} text="田中" />
          <NF1bMiniTag x={P.m31 + 58} y={410} text="田中" />
          <circle cx={P.m31} cy={RY + 4} r={12} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ===== 「ずっと同じ」の点線 → 31年から先だけ実線 ===== */}
        <g opacity={1 - fade}>
          <line x1={P.edo} y1={300} x2={P.now} y2={300} stroke={KRP.grayDark} strokeWidth={7} strokeDasharray="18 14" strokeLinecap="round" />
          <line x1={P.edo} y1={284} x2={P.edo} y2={316} stroke={KRP.grayDark} strokeWidth={7} />
        </g>
        {fade > 0 && (
          <line x1={P.m31} y1={300} x2={lerp(P.m31, P.now, solid)} y2={300} stroke={KRP.green} strokeWidth={12} strokeLinecap="round" />
        )}
        <line x1={P.now} y1={284} x2={P.now} y2={316} stroke={fade > 0 ? KRP.green : KRP.grayDark} strokeWidth={7} />
        {/* 「昔から同じ」の札と×  */}
        <g transform={`rotate(${droop * -8} 660 180)`} >
          <line x1={660} y1={226} x2={660} y2={300} stroke={KRP.ink} strokeWidth={4} opacity={1 - fade} />
          <TagPlate x={660} y={190} text="昔から同じ" size={52} />
          <XMark x={660} y={190} s={1.5} t={xT} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #129 こうして、名前から、2本目の糸が伸びました。
// 格: 山 / seed 4129
// 絵: ★**リキャップ③**。からくりの作業台、`Nafuda text="山田 花子"`。左の耳の糸 (朱) はナレーター役の耳に結ばれている。下の結び目 (chobo) から**藍の糸** (`Ito kind="chobo"`) が f6〜30 で下へ伸びていく
// どこ: からくりの作業場。木の枠の作業台の上段に名札が吊られ、下段に布をかけた何かの山 (#130 で名簿と分かる)
// 演出: 耳の糸 (朱) はナレーター役の耳に結ばれたまま。名札の下の結び目がぽっと光り、藍の糸がするすると下へ伸びる。ナレーター役が驚いて指さす
// 動き: f2〜8 結び目が光る / f6〜30 藍の糸が伸びる (滑車が回る) / f14 ナレーター役が驚く。カメラは糸を追って下へ
const BENCH = { NX: 1000, NY: 260, NS: 1.1, LX: 1000, LY: 760 };
const NF1bWorkshop: React.FC<{
  f: number; choboT: number; tied: boolean; knotGlow: number; ledgerGlow: number; flutter: number; cover: number;
  face: "normal" | "surprised" | "smile" | "joy"; legendChobo: number; spin: number;
}> = ({ f, choboT, tied, knotGlow, ledgerGlow, flutter, cover, face, legendChobo, spin }) => {
  const { NX, NY, NS, LX, LY } = BENCH;
  const mimiK = nafudaKnot("mimi", NX, NY, NS);
  const choboK = nafudaKnot("chobo", NX, NY, NS);
  const tie = ledgerTie(LX, LY, 1, 4);
  const PX = 300, PY = 900, PS = 1.2;
  const ear: [number, number] = [PX + 66 * PS, PY - 224 * PS + pbob(f, 2)];
  const gear = (cx: number, cy: number, r: number, rot: number, key: string) => (
    <g key={key} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={-r * 0.16} y={-r - 16} width={r * 0.32} height={30} rx={4} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 36})`} />
      ))}
      <circle r={r} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
      <circle r={r * 0.62} fill="none" stroke={NP.brassDark} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={0} y1={0} x2={r * 0.62} y2={0} stroke={NP.brassDark} strokeWidth={6} transform={`rotate(${i * 90 + 45})`} />)}
      <circle r={14} fill={KRP.ink} />
    </g>
  );
  return (
    <g>
      {/* 作業場の壁 (板) */}
      <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.workWall} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-80 + i * 160} y1={-80} x2={-80 + i * 160} y2={H + 80} stroke={C.workWallDark} strokeWidth={6} />)}
      {/* 壁の歯車 (ゆっくり回る) */}
      {gear(1700, 520, 90, spin, "g1")}
      {gear(1585, 640, 56, -spin * 1.6, "g2")}
      {gear(150, 200, 70, -spin, "g3")}
      {/* 壁の道具: のこぎり・金づち */}
      <g transform="translate(1640 820) rotate(-12)">
        <rect x={-150} y={-24} width={240} height={48} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -150 24 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14 l 12 14 l 12 -14" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <rect x={90} y={-30} width={70} height={60} rx={10} fill={C.bench} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 吊りランプ */}
      <line x1={1350} y1={-20} x2={1350} y2={120} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1350} cy={160} r={70} fill={NP.glow} opacity={0.25} />
      <path d="M 1310 120 L 1390 120 L 1400 190 L 1300 190 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* ===== 作業台の木の枠 ===== */}
      <rect x={560} y={70} width={44} height={1060} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1396} y={70} width={44} height={1060} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
      <rect x={530} y={60} width={940} height={56} rx={8} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
      <rect x={530} y={760} width={940} height={44} rx={6} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
      <rect x={530} y={804} width={940} height={14} fill={C.benchDark} />
      {[[582, 92], [1418, 92], [582, 782], [1418, 782]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={3.5} />)}
      {/* 梁の滑車 (糸が伸びると回る) */}
      {gear(1200, 88, 34, spin * 4, "pul")}
      {/* 名札の吊り紐 */}
      <line x1={NX} y1={116} x2={NX} y2={NY - 152 * NS} stroke={KRP.ink} strokeWidth={6} />
      {/* ===== 下段: 名簿の山 (布がかかっている → めくれる) ===== */}
      <NF1bLedger x={LX} y={LY} n={4} glow={ledgerGlow} flutter={flutter} />
      {cover > 0.01 && (
        <g opacity={cover}>
          <path d={`M ${LX - 200} ${LY} Q ${LX - 210} ${LY - 140} ${LX - 120} ${LY - 200} Q ${LX} ${LY - 236} ${LX + 120} ${LY - 200} Q ${LX + 210} ${LY - 140} ${LX + 200} ${LY} Z`}
            fill={C.curtain} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${LX - 120} ${LY - 190} Q ${LX - 140} ${LY - 90} ${LX - 110} ${LY - 4} M ${LX + 70} ${LY - 214} Q ${LX + 90} ${LY - 100} ${LX + 60} ${LY - 4}`} stroke={C.wallDark} strokeWidth={5} fill="none" />
        </g>
      )}
      {/* ===== ナレーター役 ===== */}
      <Person x={PX} y={PY} s={PS} f={f} phase={2} cloth={C.narrator} face={face} pose="point" gaze={[1, 0.6]} />
      <ellipse cx={ear[0]} cy={ear[1]} rx={13} ry={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* ===== 糸 ===== */}
      <Ito from={mimiK} to={ear} kind="mimi" t={1} sag={70} f={f} />
      <circle cx={ear[0] + 4} cy={ear[1] + 14} r={9} fill={NP.mimi} stroke={KRP.ink} strokeWidth={3.5} />
      <Ito from={choboK} to={tie} kind="chobo" t={choboT} sag={0} f={f} />
      {tied && (
        <g>
          <circle cx={tie[0]} cy={tie[1]} r={13} fill={NP.chobo} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${tie[0] - 4} ${tie[1] + 8} l -14 20 M ${tie[0] + 4} ${tie[1] + 8} l 14 20`} stroke={NP.chobo} strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
      {/* 名札 (上段) */}
      <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ mimi: 1, chobo: knotGlow }} f={f} />
      <ItoLegend x={1580} y={110} s={0.85} lit={{ mimi: 1, chobo: legendChobo }} />
    </g>
  );
};

const Nm129: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const grow = easeOut(seg(f, 6, 30));
  const choboT = 0.9 * grow;
  const pulse = Math.sin(seg(f, 2, 12) * Math.PI);
  const { NX, NY, NS } = BENCH;
  const [kx, ky] = nafudaKnot("chobo", NX, NY, NS);
  return (
    <Frame f={f} seed={4129}>
      <g transform={cam(1000, 450, 1 + 0.05 * k, 0, 30 - 50 * k)}>
        <NF1bWorkshop f={f} choboT={choboT} tied={false} knotGlow={pulse} ledgerGlow={0} flutter={0} cover={1}
          face={f < 14 ? "normal" : "surprised"} legendChobo={0} spin={f * 1.2 + grow * 160} />
        {/* 結び目から糸が生まれる光のリング */}
        {pulse > 0.01 && <circle cx={kx} cy={ky} r={30 + 50 * seg(f, 2, 12)} fill="none" stroke={NP.glow} strokeWidth={8} opacity={pulse} />}
        {/* 伸びる先端の光の粒 */}
        {grow > 0 && grow < 1 && <circle cx={kx} cy={lerp(ky, 590, choboT)} r={22} fill={NP.glow} opacity={0.5} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #130 国の名簿につながる、帳簿の糸です。
// 格: 山 / seed 4130
// 絵: #129 の続き。藍の糸の先が、作業台の下の段に置かれた**役所の名簿 (和紙の帳面の山)** に結ばれる (`t`=1)。結び目が光る (`knots={{ mimi: 1, chobo: 1 }}`)。右上に `ItoLegend lit={{ mimi: 1, chobo: 1 }}`
// どこ: #129 と同じ作業場の続き (同じ場所・同じ時間)
// 演出: 下段の布がはらりと落ちて、役所の名簿 (和紙の帳面の山) が現れる。藍の糸の先が名簿の輪に結ばれ、名札の結び目と名簿が光る。凡例の「帳簿の糸」が点る
// 動き: f2〜10 布が落ちる / f6〜14 糸が結ばれる / f14〜22 結び目が光り名簿の表紙がめくれる / f20〜28 凡例が点く。カメラは下段へ寄る
const Nm130: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const cover = 1 - seg(f, 2, 10);
  const choboT = lerp(0.9, 1, easeOut(seg(f, 6, 14)));
  const tied = f >= 14;
  const knot = seg(f, 14, 22);
  const ring = seg(f, 14, 26);
  const flutter = Math.sin(seg(f, 14, 26) * Math.PI);
  const tie = ledgerTie(BENCH.LX, BENCH.LY, 1, 4);
  return (
    <Frame f={f} seed={4130}>
      <g transform={cam(1000, 450, 1.05 + 0.05 * k, 0, -20 - 30 * k)}>
        <NF1bWorkshop f={f} choboT={choboT} tied={tied} knotGlow={knot} ledgerGlow={knot * (0.6 + 0.4 * Math.sin(f / 4))} flutter={flutter}
          cover={0} face={f < 14 ? "surprised" : "smile"} legendChobo={seg(f, 20, 28)} spin={f * 1.2 + 160} />
        {/* 落ちていく布 */}
        {cover > 0.01 && (
          <g transform={`translate(${BENCH.LX - 40 * (1 - cover)} ${(1 - cover) * 200}) rotate(${(1 - cover) * -14} ${BENCH.LX} ${BENCH.LY})`} opacity={cover}>
            <path d={`M ${BENCH.LX - 200} ${BENCH.LY} Q ${BENCH.LX - 210} ${BENCH.LY - 140} ${BENCH.LX - 120} ${BENCH.LY - 200} Q ${BENCH.LX} ${BENCH.LY - 236} ${BENCH.LX + 120} ${BENCH.LY - 200} Q ${BENCH.LX + 210} ${BENCH.LY - 140} ${BENCH.LX + 200} ${BENCH.LY} Z`}
              fill={C.curtain} stroke={KRP.ink} strokeWidth={6} transform={`translate(${-BENCH.LX} 0)`} />
          </g>
        )}
        {/* 結ばれた瞬間の波紋 */}
        {ring > 0 && ring < 1 && (
          <g opacity={1 - ring}>
            <circle cx={tie[0]} cy={tie[1]} r={20 + 90 * ring} fill="none" stroke={NP.glow} strokeWidth={8} />
            <circle cx={tie[0]} cy={tie[1]} r={10 + 50 * ring} fill="none" stroke={NP.chobo} strokeWidth={5} />
          </g>
        )}
        <TagPlate x={1000} y={790} text="役所" size={30} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #131 名簿に載れば、国に守られます。
// 格: 並 / seed 4131
// 絵: 名簿の帳面の上に、**大きな傘** (国の守り) が開いて、名札を雨から守る (f で雨粒が傘ではじかれる)。藍の糸はそのまま
// どこ: 雨の明治の町の広場。石の台の上に役所の名簿の山。名簿から立つ傘の柄に名札が掛かっている
// 演出: 名簿から伸びた柄の先で、朱の蛇の目傘 (「国」の字) がばっと開く。雨粒は傘ではじかれ、名札はぬれずに落ち着く
// 動き: f0〜4 雨に打たれて名札がふるえる / f4〜16 傘が開く / それ以降、雨粒が傘ではじけ、縁からしずくが垂れる。カメラはゆっくり寄る
const Nm131: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const open = easeOut(seg(f, 4, 16));
  const CX = 960;
  const hw = lerp(46, 580, open);
  const rim = lerp(430, 340, open);
  const apex = 150;
  const surf = (x: number) => {
    const d = (x - CX) / hw;
    return Math.abs(d) > 1 ? Infinity : rim - (rim - apex) * (1 - d * d);
  };
  const NX = 960, NY = 470, NS = 0.78;
  const LX = 870, LY = 790;
  const tie = ledgerTie(LX, LY, 1, 4);
  const shiver = (1 - open) * Math.sin(f * 1.7) * 4;
  const GROUND = 900;
  return (
    <Frame f={f} seed={4131} bg={C.rainSky}>
      <defs>
        <clipPath id="nf1bKasaClip">
          <path d={`M ${CX - hw} ${rim} Q ${CX} ${2 * apex - rim} ${CX + hw} ${rim} Z`} />
        </clipPath>
      </defs>
      <g transform={cam(960, 500, 1 + 0.04 * k)}>
        {/* 雨の空と町 */}
        <rect x={-60} y={-60} width={W + 120} height={700} fill={C.rainSky} />
        <rect x={-60} y={420} width={W + 120} height={260} fill={C.rainSkyLow} opacity={0.7} />
        {/* 遠くの町並み (瓦屋根・洋館の時計塔) */}
        <path d="M -60 640 L -60 520 L 120 520 L 160 480 L 330 480 L 370 520 L 520 520 L 520 470 L 640 470 L 640 640 Z" fill={C.townFar} stroke={KRP.ink} strokeWidth={4} />
        <g>
          <rect x={1400} y={380} width={140} height={260} fill={C.townFar} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1390 380 L 1470 300 L 1550 380 Z" fill={C.townNear} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1470} cy={430} r={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1470} y1={430} x2={1470} y2={404} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1470} y1={430} x2={1488} y2={438} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1250} y={500} width={600} height={140} fill={C.townNear} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={1280 + i * 95} y={530} width={40} height={60} fill={C.rainSkyLow} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        <path d="M 620 640 L 620 540 L 700 500 L 900 500 L 980 540 L 980 640 Z" fill={C.townNear} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
        {/* 石畳 */}
        <rect x={-60} y={640} width={W + 120} height={500} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 7 }, (_, r) => (
          <g key={r}>
            <line x1={-60} y1={680 + r * 60} x2={W + 60} y2={680 + r * 60} stroke={C.stoneDark} strokeWidth={4} />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={(i * 180 + (r % 2) * 90) - 40} y1={640 + r * 60} x2={(i * 180 + (r % 2) * 90) - 40} y2={680 + r * 60} stroke={C.stoneDark} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* 水たまり */}
        {[[360, 930, 160], [1560, 960, 200], [760, 1010, 120]].map(([px, py, rx], i) => (
          <g key={i}>
            <ellipse cx={px} cy={py} rx={rx} ry={rx * 0.22} fill={C.rainSkyLow} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
            <ellipse cx={px + 20} cy={py} rx={(rx * 0.5 * ((f + i * 7) % 14)) / 14} ry={(rx * 0.11 * ((f + i * 7) % 14)) / 14} fill="none" stroke={KRP.white} strokeWidth={3} opacity={1 - ((f + i * 7) % 14) / 14} />
          </g>
        ))}
        {/* 石の台 */}
        <rect x={660} y={790} width={480} height={60} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={700} y={850} width={400} height={120} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        {/* ===== 傘 ===== */}
        {/* 柄 (名簿の山の奥に立つ) */}
        <rect x={CX - 9} y={apex} width={18} height={LY - 100 - apex} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />
        {/* 名簿の山 */}
        <NF1bLedger x={LX} y={LY} n={4} />
        {/* 骨 (内側) */}
        {open > 0.3 && Array.from({ length: 9 }, (_, i) => {
          const rx = CX + hw * ((i - 4) / 4);
          return <line key={i} x1={CX} y1={rim + 70 * open} x2={rx} y2={rim + 4} stroke={C.pillarDark} strokeWidth={5} opacity={open} />;
        })}
        {/* 傘の表 */}
        <path d={`M ${CX - hw} ${rim} Q ${CX} ${2 * apex - rim} ${CX + hw} ${rim} Q ${CX} ${rim + 40 * open} ${CX - hw} ${rim} Z`}
          fill={C.kasa} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g clipPath="url(#nf1bKasaClip)">
          {/* 蛇の目の白い輪 */}
          <path d={Array.from({ length: 25 }, (_, i) => { const x = CX - hw + (2 * hw * i) / 24; return `${i ? "L" : "M"} ${x} ${surf(x) + 96 * open}`; }).join(" ")}
            stroke={KRP.white} strokeWidth={30 * open} fill="none" />
          {/* 上の骨の線 */}
          {Array.from({ length: 9 }, (_, i) => {
            const rx = CX + hw * ((i - 4) / 4) * 0.98;
            return <path key={i} d={`M ${CX} ${apex} Q ${lerp(CX, rx, 0.55)} ${apex + (rim - apex) * 0.25} ${rx} ${rim}`} stroke={C.kasaDark} strokeWidth={4} fill="none" />;
          })}
        </g>
        {open > 0.6 && (
          <g opacity={seg(f, 12, 18)}>
            <circle cx={CX} cy={rim - 70} r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text x={CX} y={rim - 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.kasaDark}>国</text>
          </g>
        )}
        <circle cx={CX} cy={apex - 6} r={14} fill={C.pillarDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 縁から垂れるしずく */}
        {open > 0.9 && [-1, 1].map((side) => [0, 1, 2].map((j) => {
          const dx = CX + side * (hw - 20 - j * 90);
          const ph = ((f * 9 + j * 70) % 210);
          const y0 = surf(dx) + 6;
          return <ellipse key={`${side}${j}`} cx={dx} cy={y0 + ph} rx={6} ry={10} fill={C.drop} stroke={KRP.ink} strokeWidth={2} opacity={1 - ph / 210} />;
        }))}
        {/* 藍の糸と名札 */}
        <Ito from={nafudaKnot("chobo", NX, NY, NS)} to={tie} kind="chobo" t={1} sag={20} f={f} />
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ mimi: 1, chobo: 1 }} rot={shiver} f={f} />
        {/* 傘が開く前、名札をぬらすしずく */}
        {open < 1 && [-90, 40, 120].map((dx, i) => (
          <ellipse key={i} cx={NX + dx} cy={NY - 30 + ((f * 6 + i * 20) % 60)} rx={7} ry={11} fill={C.drop} stroke={KRP.ink} strokeWidth={2} opacity={1 - open} />
        ))}
        {/* ===== 雨 ===== */}
        {Array.from({ length: 90 }, (_, i) => {
          const x0 = rnd(4131, i) * 2100 - 90;
          const ph = rnd(4132, i);
          const y = ((f * 34 + ph * 1300) % 1300) - 200;
          const x = x0 + y * 0.12;
          const sY = open > 0.95 ? surf(x) : Infinity;
          if (y < sY) {
            if (y > GROUND + 60) return null;
            return <line key={i} x1={x} y1={y} x2={x - 5} y2={y - 40} stroke={C.drop} strokeWidth={4} strokeLinecap="round" opacity={0.85} />;
          }
          const d = y - sY;
          if (d > 120) return null;
          const u = d / 120;
          return (
            <g key={i} opacity={1 - u}>
              {[-1, 1].map((s2) => (
                <circle key={s2} cx={x + s2 * 56 * u + (x - CX) * 0.08 * u} cy={sY - Math.sin(u * Math.PI) * 60} r={7} fill={C.drop} stroke={KRP.ink} strokeWidth={1.5} />
              ))}
              <path d={`M ${x - 14} ${sY - 2} q 14 -14 28 0`} stroke={KRP.white} strokeWidth={3} fill="none" />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #132 同時に、国から逃げられなくもなりました。
// 格: 山 / seed 4132
// 絵: 名札が窓の外へ飛んでいこうとするが、**藍の糸の真ん中に錠前がかかり** (`lock` 0→1)、糸がぴんと張って名札は引き戻される (`tension`)。名札が少しじたばた (おおげさすぎない)
// どこ: 明治の役所の部屋。左に役人の机と名簿の山、右に開いた洋風の窓 (外は青空と鳥)
// 演出: 名札が窓の外へ飛んでいこうとする → 藍の糸の真ん中に真鍮の錠前ががちゃり → 糸がぴんと張って名札は引き戻され、少しじたばた。外の鳥は自由に飛んでいく
// 動き: f2〜16 名札が窓へ飛ぶ / f14〜22 錠前 / f18〜24 糸が張る / f20〜30 引き戻し / 以後小さくじたばた。役人は腕組みで見ている。カメラはわずかに右へ
const Nm132: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const fly = easeOut(seg(f, 2, 16));
  const lock = seg(f, 14, 22);
  const tension = seg(f, 18, 24);
  const yank = seg(f, 20, 30);
  const far: [number, number] = [lerp(820, 1340, fly), lerp(380, 270, fly)];
  const back: [number, number] = [1150, 330];
  const yk = pop(yank);
  const jit = seg(f, 28, 34);
  const nx = lerp(far[0], back[0], yk) + Math.sin(f * 1.1) * 6 * jit;
  const ny = lerp(far[1], back[1], yk) + Math.cos(f * 1.3) * 4 * jit;
  const rot = 12 * fly * (1 - yank) + Math.sin(f * 0.9) * 5 * jit - 6 * Math.sin(yank * Math.PI);
  const NS = 0.8;
  const LX = 540, LY = 640;
  const tie = ledgerTie(LX, LY, 1, 3);
  const OX = 215, OY = 730, OS = 1.3;
  return (
    <Frame f={f} seed={4132}>
      <g transform={cam(960, 540, 1.03, 10 - 30 * k, 0)}>
        {/* 壁と腰板 */}
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.wall} />
        <rect x={-80} y={560} width={W + 160} height={520} fill={C.pillar} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-80 + i * 150} y1={560} x2={-80 + i * 150} y2={1080} stroke={C.pillarDark} strokeWidth={5} />)}
        <rect x={-80} y={-60} width={W + 160} height={90} fill={C.pillar} stroke={KRP.ink} strokeWidth={6} />
        {/* 吊りランプ */}
        <line x1={700} y1={30} x2={700} y2={110} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 660 110 L 740 110 L 760 160 L 640 160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={700} cy={176} r={18} fill={NP.glow} stroke={KRP.ink} strokeWidth={4} />
        {/* ===== 窓 ===== */}
        <rect x={1170} y={100} width={660} height={560} fill={C.sky} />
        <rect x={1170} y={480} width={660} height={180} fill={C.skyLow} />
        <path d="M 1170 560 Q 1320 480 1480 540 Q 1640 470 1830 530 L 1830 660 L 1170 660 Z" fill={KRP.green} opacity={0.7} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${((f * (1.2 + i * 0.6)) % 200) + i * 260} 0)`}>
            <ellipse cx={1300} cy={190 + i * 90} rx={80} ry={30} fill={KRP.white} opacity={0.9} />
            <ellipse cx={1350} cy={176 + i * 90} rx={50} ry={30} fill={KRP.white} opacity={0.9} />
          </g>
        ))}
        {/* 自由に飛ぶ鳥 */}
        {[0, 1, 2].map((i) => {
          const bx = 1420 + i * 90 + f * 5, by = 300 - i * 30 - f * 2;
          const w = Math.sin(f / 2 + i) * 10;
          return <path key={i} d={`M ${bx - 22} ${by - w} Q ${bx - 10} ${by - 10} ${bx} ${by} Q ${bx + 10} ${by - 10} ${bx + 22} ${by - w}`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* 窓枠 (右の窓は外へ開いている) */}
        <rect x={1170} y={100} width={660} height={560} fill="none" stroke={C.pillarDark} strokeWidth={24} />
        <line x1={1500} y1={100} x2={1500} y2={660} stroke={C.pillarDark} strokeWidth={14} />
        <path d="M 1500 112 L 1720 60 L 1720 720 L 1500 648 Z" fill={C.skyLow} opacity={0.5} stroke={C.pillarDark} strokeWidth={12} />
        <line x1={1610} y1={86} x2={1610} y2={684} stroke={C.pillarDark} strokeWidth={8} />
        <rect x={1150} y={652} width={700} height={30} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />
        {/* カーテン (風でゆれる) */}
        <path d={`M 1130 90 L 1230 90 Q ${1250 + Math.sin(f / 5) * 20} 360 ${1210 + Math.sin(f / 5) * 30} 640 L 1130 640 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        {/* ===== 役人 (机の後ろ) ===== */}
        <Person x={OX} y={OY} s={OS} f={f} phase={4} cloth={C.official} clothDark={C.officialDark} hair="cap" pose="armsFolded" gaze={[1, -0.5]} face="normal" />
        <g transform={`translate(${OX} ${OY + pbob(f, 4)}) scale(${OS})`}>
          {/* 詰襟の金ボタン */}
          <rect x={-22} y={-164} width={44} height={16} rx={4} fill={C.officialDark} stroke={KRP.ink} strokeWidth={3} />
          {/* 口ひげ */}
          <path d="M -30 -192 Q -14 -202 0 -194 Q 14 -202 30 -192 Q 14 -186 0 -190 Q -14 -186 -30 -192 Z" fill={KRP.ink} />
          {/* つば付きの制帽 */}
          <path d="M -62 -254 L -58 -300 Q 0 -316 58 -300 L 62 -254 Z" fill={C.official} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-62} y={-270} width={124} height={16} fill={C.gold} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M -68 -254 Q 0 -236 68 -254 L 64 -244 Q 0 -228 -64 -244 Z" fill={KRP.ink} />
        </g>
        {/* ===== 机 ===== */}
        <rect x={80} y={600} width={880} height={40} rx={6} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={110} y={640} width={820} height={300} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={150} y={680} width={340} height={110} rx={6} fill="none" stroke={C.deskDark} strokeWidth={5} />
        <rect x={550} y={680} width={340} height={110} rx={6} fill="none" stroke={C.deskDark} strokeWidth={5} />
        <circle cx={320} cy={736} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={720} cy={736} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        {/* 名簿 */}
        <NF1bLedger x={LX} y={LY} n={3} />
        {/* 印鑑と朱肉 */}
        <rect x={760} y={560} width={26} height={44} rx={6} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={840} cy={596} rx={34} ry={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* ===== 糸・錠前・名札 ===== */}
        <Ito from={tie} to={nafudaKnot("chobo", nx, ny, NS)} kind="chobo" t={1} sag={90} lock={lock} tension={tension} f={f} />
        {/* ぴんと張った瞬間の「ぴん」の線 */}
        {tension > 0 && yank < 1 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - yank}>
            <line x1={tie[0] + 60} y1={tie[1] - 70} x2={tie[0] + 80} y2={tie[1] - 100} />
            <line x1={tie[0] + 100} y1={tie[1] - 40} x2={tie[0] + 130} y2={tie[1] - 60} />
          </g>
        )}
        {/* 飛んでいく勢いの線 */}
        {fly > 0 && fly < 1 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.5}>
            {[-50, 0, 50].map((d) => <line key={d} x1={nx - 230} y1={ny + d + 20} x2={nx - 320} y2={ny + d + 40} />)}
          </g>
        )}
        <Nafuda x={nx} y={ny} s={NS} text="山田 花子" knots={{ mimi: 1, chobo: 1 }} hang={false} rot={rot} f={f} />
        {/* じたばたの汗 */}
        {jit > 0 && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${nx + sd * 190} ${ny - 90} q ${sd * 14} -10 ${sd * 24} 6`} stroke={KRP.ink} strokeWidth={5} fill="none" opacity={jit * (0.5 + 0.5 * Math.sin(f / 2))} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #133 この帳簿の糸は、いまも、形を変え続けています。
// 格: 並 / seed 4133
// 絵: 藍の糸の先の名簿が、f で和紙の帳面 → 紙のファイル → パソコンの画面 → スマートフォンの画面、と姿を変えていく (時代の流れ)。糸は結ばれたまま
// どこ: 壁の釘に名札が掛かった机の上。上に時代の札の帯 (明治→昭和→平成→令和) と、針が早回りする柱時計
// 演出: 藍の糸の先の名簿が、ポンと煙を出すたびに 和紙の帳面 → 紙のファイル → パソコン → スマートフォン と姿を変える。糸は結ばれたまま、先だけ付け替わる
// 動き: f10/20/30 で変身 (前の物は完全に消える)。時代の札の光が右へ移り、時計の針が回る。カメラはゆっくり寄る
const NF1bBinders: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={260} ry={16} fill={KRP.ink} opacity={0.2} />
    {[C.binder1, C.binder2, C.binder3, C.binder1].map((col, i) => (
      <g key={i} transform={`translate(${-210 + i * 110} 0) rotate(${i === 3 ? 6 : 0} 50 0)`}>
        <rect x={0} y={-360} width={100} height={360} rx={6} fill={col} stroke={KRP.ink} strokeWidth={6} />
        <rect x={16} y={-320} width={68} height={110} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((j) => <line key={j} x1={26} y1={-296 + j * 30} x2={74} y2={-296 + j * 30} stroke={KRP.grayDark} strokeWidth={4} />)}
        <circle cx={50} cy={-80} r={18} fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
  </g>
);
const NF1bPC: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={300} ry={18} fill={KRP.ink} opacity={0.2} />
    <path d="M -60 0 L 60 0 L 36 -90 L -36 -90 Z" fill={C.pcDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-270} y={-440} width={540} height={360} rx={16} fill={C.pc} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-240} y={-412} width={480} height={290} rx={6} fill={C.screen} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-240} y={-412} width={480} height={44} fill={C.screenBlue} />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x={-224} y={-356 + i * 44} width={448} height={36} fill={i === 2 ? KRP.yellow : KRP.white} stroke={KRP.grayDark} strokeWidth={2} />
        <line x1={-210} y1={-338 + i * 44} x2={-60} y2={-338 + i * 44} stroke={KRP.grayDark} strokeWidth={6} />
        <line x1={-20} y1={-338 + i * 44} x2={180} y2={-338 + i * 44} stroke={KRP.gray} strokeWidth={6} />
      </g>
    ))}
    <rect x={-90 + ((f * 7) % 180)} y={-262} width={6} height={22} fill={KRP.ink} opacity={f % 10 < 5 ? 1 : 0} />
    <rect x={-330} y={20} width={420} height={50} rx={8} fill={C.pc} stroke={KRP.ink} strokeWidth={5} transform="translate(0 -30)" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-316 + i * 33} y={-4} width={26} height={18} rx={3} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={2} />)}
  </g>
);
const NF1bPhone: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={4} rx={220} ry={16} fill={KRP.ink} opacity={0.2} />
    {/* スタンド */}
    <path d="M -150 0 L 150 0 L 110 -40 L -110 -40 Z" fill={C.pcDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-160} y={-600} width={320} height={570} rx={40} fill={C.phone} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-140} y={-570} width={280} height={510} rx={22} fill={C.screen} />
    <rect x={-40} y={-586} width={80} height={10} rx={5} fill={KRP.ink} />
    <rect x={-140} y={-540} width={280} height={56} fill={C.screenBlue} />
    <text x={0} y={-500} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white}>名簿</text>
    {Array.from({ length: 6 }, (_, i) => {
      const hl = i === 1;
      return (
        <g key={i}>
          <rect x={-128} y={-470 + i * 66} width={256} height={56} rx={10} fill={hl ? KRP.yellow : KRP.white} stroke={KRP.grayDark} strokeWidth={2} opacity={hl ? 0.6 + 0.4 * Math.sin(f / 4) : 1} />
          <circle cx={-96} cy={-442 + i * 66} r={18} fill={KRP.gray} stroke={KRP.ink} strokeWidth={2} />
          {hl ? (
            <text x={-66} y={-432 + i * 66} fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>山田 花子</text>
          ) : (
            <line x1={-66} y1={-442 + i * 66} x2={60 - (i % 3) * 20} y2={-442 + i * 66} stroke={KRP.gray} strokeWidth={8} strokeLinecap="round" />
          )}
        </g>
      );
    })}
    <rect x={-20} y={-38} width={40} height={10} rx={4} fill={KRP.grayDark} />
  </g>
);

const Nm133: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const stage = f < 10 ? 0 : f < 20 ? 1 : f < 30 ? 2 : 3;
  const OX = 1240, OY = 760;
  const NX = 470, NY = 330, NS = 0.85;
  const ends: [number, number][] = [ledgerTie(OX, OY, 1.15, 5), [OX - 50, OY - 80], [OX, OY - 40], [OX, OY - 31]];
  const eras = ["明治", "昭和", "平成", "令和"];
  const marker = lerp(0, 3, Math.min(1, f / 30));
  return (
    <Frame f={f} seed={4133}>
      <g transform={cam(1000, 520, 1 + 0.04 * k)}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.wall} />
        <g stroke={C.wallDark} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-60} y1={60 + i * 70} x2={W + 60} y2={60 + i * 70} />)}
        </g>
        {/* 時代の札の帯 */}
        <rect x={700} y={60} width={1100} height={110} rx={14} fill={C.board} stroke={KRP.ink} strokeWidth={6} />
        <line x1={760} y1={150} x2={1740} y2={150} stroke={C.boardDark} strokeWidth={8} />
        {eras.map((e, i) => (
          <TagPlate key={e} x={830 + i * 280} y={112} text={e} size={40} fill={stage === i ? KRP.yellow : KRP.white} />
        ))}
        <path d={`M ${830 + marker * 280 - 16} 168 L ${830 + marker * 280 + 16} 168 L ${830 + marker * 280} 186 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* 柱時計 (針が早回り) */}
        <g transform="translate(180 260)">
          <rect x={-90} y={-130} width={180} height={340} rx={20} fill={C.pillar} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-40} r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-100} x2={0} y2={-90} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 30} 0 -40)`} />)}
          <line x1={0} y1={-40} x2={0} y2={-92} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 40} 0 -40)`} />
          <line x1={0} y1={-40} x2={0} y2={-74} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" transform={`rotate(${f * 4} 0 -40)`} />
          <line x1={0} y1={40} x2={Math.sin(f / 4) * 40} y2={150} stroke={NP.brassDark} strokeWidth={5} />
          <circle cx={Math.sin(f / 4) * 40} cy={156} r={18} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 名札を掛ける釘 */}
        <circle cx={NX} cy={NY - 152 * NS} r={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 机 */}
        <rect x={-60} y={760} width={W + 120} height={40} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={800} width={W + 120} height={320} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.deskDark} strokeWidth={4} opacity={0.5}>
          {[850, 920, 990].map((yy) => <path key={yy} d={`M -60 ${yy} q 500 10 1000 0 q 500 -10 1040 0`} fill="none" />)}
        </g>
        {/* 机の上の小物: 湯のみ・ペン・付箋 */}
        <g transform="translate(720 760)">
          <ellipse cx={0} cy={2} rx={56} ry={10} fill={KRP.ink} opacity={0.2} />
          <path d="M -40 0 L 40 0 L 46 -96 L -46 -96 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -44 -70 L 44 -70" stroke={C.cover} strokeWidth={8} />
          {[0, 1].map((i) => <path key={i} d={`M ${-14 + i * 24} -106 q ${8 + Math.sin(f / 6 + i) * 6} -24 0 -48`} stroke={KRP.grayDark} strokeWidth={4} fill="none" opacity={0.6} />)}
        </g>
        <rect x={820} y={736} width={150} height={20} rx={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} transform="rotate(-6 895 746)" />
        <rect x={500} y={720} width={90} height={40} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} transform="rotate(4 545 740)" />
        {/* ===== 姿を変える名簿 ===== */}
        {stage === 0 && <NF1bLedger x={OX} y={OY} s={1.15} n={5} />}
        {stage === 1 && <NF1bBinders x={OX} y={OY} />}
        {stage === 2 && <NF1bPC x={OX} y={OY} f={f} />}
        {stage === 3 && <g transform={`translate(${OX} ${OY}) scale(0.92) translate(${-OX} ${-OY})`}><NF1bPhone x={OX} y={OY} f={f} /></g>}
        {/* 糸 (先は今の姿に結ばれたまま) */}
        <Ito from={nafudaKnot("chobo", NX, NY, NS)} to={ends[stage]} kind="chobo" t={1} sag={120} f={f} />
        <circle cx={ends[stage][0]} cy={ends[stage][1]} r={13} fill={NP.chobo} stroke={KRP.ink} strokeWidth={4} />
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ mimi: 1, chobo: 1 }} f={f} />
        {/* 変身の煙 */}
        {[10, 20, 30].map((a) => <NF1bPuff key={a} x={OX} y={OY - 260} t={seg(f, a - 3, a + 5)} r={240} />)}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_124: (f) => <Nm124 f={f} />,
  nm_125: (f) => <Nm125 f={f} />,
  nm_126: (f) => <Nm126 f={f} />,
  nm_127: (f) => <Nm127 f={f} />,
  nm_128: (f) => <Nm128 f={f} />,
  nm_129: (f) => <Nm129 f={f} />,
  nm_130: (f) => <Nm130 f={f} />,
  nm_131: (f) => <Nm131 f={f} />,
  nm_132: (f) => <Nm132 f={f} />,
  nm_133: (f) => <Nm133 f={f} />,
};

export const NM_F1B_MOTIFS: string[] = [
  "nm_124", // #124
  "nm_125", // #125
  "nm_126", // #126
  "nm_127", // #127
  "nm_128", // #128
  "nm_129", // #129
  "nm_130", // #130
  "nm_131", // #131
  "nm_132", // #132
  "nm_133", // #133
];

export const namaeF1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
