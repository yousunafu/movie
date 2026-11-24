// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#86〜#93 (8文)
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
  sky: "#CFE3EA", skyLow: "#EAF1E6", hill: "#A9BFA4", hillFar: "#C3D3C0",
  gravel: "#D8CDB4", gravelDot: "#B9AC90",
  plaster: "#F3EEE2", stoneBase: "#9C9486",
  tile: "#5E6670", tileDark: "#444B54",
  woodRed: "#B4553A", woodRedDark: "#8A3E2A",
  woodBrown: "#8A6A48", woodBrownDark: "#6A4E34",
  pine: "#5C8A55", pineDark: "#3F6B48", trunk: "#7A5A3E",
  kiyoCloth: "#5E7D4E", kiyoDark: "#46603A", hairBlack: "#3D3530", skin: "#F2D2B6",
  dokyoKesa: "#5B3E7A", dokyoKesaDark: "#432C5C", dokyoRobe: "#7A6A58", dokyoRobeDark: "#5C4F42",
  yakuCloth: "#8C3B2E", yakuDark: "#6A2B22",
  misu: "#C9B27A", misuDark: "#9C8752", misuEdge: "#3F5A44", shadow: "#2A2025",
  floorWood: "#B89668", floorWoodDark: "#94744C", tatami: "#C9C08A", tatamiEdge: "#4E5E3B",
  nightWall: "#2E2A30", nightPillar: "#5A2E26", dimFloor: "#3A3230", angerRed: "#C8382A",
  water: "#8FC4E0", waterDeep: "#4F8FBF", mud: "#7A5A3A", mudDark: "#5A3F27", bowlWhite: "#F7F4EC",
  tableWood: "#A87C50", tableWoodDark: "#7E5A38",
  sepia: "#C9A97A", sepiaDark: "#8C6A44", sepiaLight: "#EAD9B8",
  wallPlaster: "#E6DDC8", frameWood: "#6E4E32", frameGold: "#C9A24A",
  scrollPaper: "#F1E6C8", scrollLine: "#B9A57E", deskDark: "#5E4430", seaBlue: "#7FAFCF",
  brushBamboo: "#C9B077", brushHair: "#2B2622",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend;
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

// Person の体ゆれ (phase=0) と同じ値。後頭部・冠を体に貼り付けるのに使う
const bobOf = (f: number) => Math.sin(f / 13) * 3;

// 和気清麻呂の後ろ姿 (黒い冠・緑の袍・笏)。顔は描かない (後頭部で隠す)
//   pose "stand": 笏は右手に縦 / "point": 右腕を横に出し、笏を横一文字 (shaku 0→1 で伸びる)
//   scrollUp 0→1: 左腕で巻物 (お告げ) を掲げる
const ND1bKiyomaro: React.FC<{
  x: number; y: number; s: number; f: number; pose?: "stand" | "point"; shaku?: number; scrollUp?: number;
}> = ({ x, y, s, f, pose = "stand", shaku = 1, scrollUp = 0 }) => {
  const b = bobOf(f);
  const tail = Math.sin(f / 11) * 3;
  const up = clamp01(scrollUp);
  const armA = lerp(12, 150, easeOut(up));
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} cloth={C.kiyoCloth} clothDark={C.kiyoDark} hair="none"
        pose={pose === "point" ? "point" : "stand"} pointDir={1} />
      <g transform={`translate(${x} ${y + b}) scale(${s})`}>
        {/* 胸ポケットの線を袍で消す + 背中の縫い目 */}
        <rect x={12} y={-144} width={38} height={32} fill={C.kiyoCloth} />
        <line x1={0} y1={-156} x2={0} y2={-60} stroke={C.kiyoDark} strokeWidth={4} />
        {/* 石帯 (黒い帯) */}
        <rect x={-58} y={-82} width={116} height={14} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={3} />
        {[-38, -14, 10, 34].map((bx) => <circle key={bx} cx={bx} cy={-75} r={4} fill={NP.brass} />)}
        {/* 袍の裾のふくらみ */}
        <path d="M -58 -62 Q -66 -30 -62 -18 L 62 -18 Q 66 -30 58 -62 Z" fill={C.kiyoCloth} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 丸い襟 (盤領) */}
        <path d="M -34 -160 Q 0 -146 34 -160" stroke={C.kiyoDark} strokeWidth={8} fill="none" />
        {/* 右手の笏 */}
        {pose === "stand" && (
          <rect x={60} y={-118} width={15} height={98} rx={5} fill={C.brushBamboo} stroke={KRP.ink} strokeWidth={4} transform="rotate(8 67 -66)" />
        )}
        {pose === "point" && (
          <g>
            {/* 横に出した腕の下に垂れる広い袖 */}
            <path d="M 58 -150 L 140 -146 Q 132 -110 112 -94 Q 80 -96 58 -112 Z" fill={C.kiyoCloth} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={150} y={-160} width={8 + 250 * clamp01(shaku)} height={22} rx={6} fill={C.brushBamboo} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={153} cy={-148} r={11} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 左腕: 巻物を掲げる (下の腕は広い袖で隠す) */}
        {up > 0.01 && (
          <g>
            <path d="M -56 -154 L -96 -144 Q -108 -100 -100 -62 L -56 -60 Z" fill={C.kiyoCloth} stroke={KRP.ink} strokeWidth={4.5} />
            <g transform={`rotate(${armA} -67 -148)`}>
              <path d="M -80 -148 L -54 -148 L -50 -60 L -88 -66 Z" fill={C.kiyoCloth} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={-67} cy={-62} r={11} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
              {/* 巻物 */}
              <g transform="translate(-67 -46)">
                <rect x={-14} y={-4} width={130} height={30} rx={13} fill={C.scrollPaper} stroke={KRP.ink} strokeWidth={4.5} />
                <rect x={-20} y={-6} width={12} height={34} rx={4} fill={C.woodRed} stroke={KRP.ink} strokeWidth={3.5} />
                <rect x={110} y={-6} width={12} height={34} rx={4} fill={C.woodRed} stroke={KRP.ink} strokeWidth={3.5} />
                <path d={`M 40 26 Q ${44 + tail} 50 ${36 + tail} 70`} stroke={NP.mimi} strokeWidth={6} fill="none" />
              </g>
            </g>
          </g>
        )}
        {/* 後頭部 (髪) と耳 */}
        <ellipse cx={-64} cy={-220} rx={10} ry={16} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={64} cy={-220} rx={10} ry={16} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={-228} r={68} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -40 -200 Q 0 -186 40 -200" stroke="#4A423C" strokeWidth={4} fill="none" />
        {/* 黒い冠 (後ろに垂れる纓) */}
        <path d="M -60 -244 Q -62 -300 0 -304 Q 62 -300 60 -244 Q 30 -256 0 -256 Q -30 -256 -60 -244 Z" fill="#141210" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-26} y={-338} width={52} height={42} rx={14} fill="#141210" stroke={KRP.ink} strokeWidth={5} />
        <path d={`M -11 -330 Q ${-14 + tail} -250 ${-6 + tail * 1.6} -168 L ${12 + tail * 1.6} -168 Q ${12 + tail} -250 11 -330 Z`} fill="#141210" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -48 -280 Q 0 -298 48 -280" stroke="#FFFFFF" strokeWidth={4} opacity={0.18} fill="none" />
      </g>
    </g>
  );
};

// 道鏡の後ろ姿 (剃髪・紫の袈裟をたすきがけ)。顔は描かない
const ND1bDokyo: React.FC<{ x: number; y: number; s: number; f: number; lean?: number }> = ({ x, y, s, f, lean = 0 }) => {
  const b = bobOf(f);
  return (
    <g transform={`rotate(${lean} ${x} ${y})`}>
      <Person x={x} y={y} s={s} f={f} cloth={C.dokyoRobe} clothDark={C.dokyoRobeDark} hair="none" />
      <g transform={`translate(${x} ${y + b}) scale(${s})`}>
        <rect x={12} y={-144} width={38} height={32} fill={C.dokyoRobe} />
        {/* 袈裟 (左肩から右腰へ) */}
        <path d="M -58 -160 L -18 -160 L 58 -86 L 58 -52 L 30 -52 L -58 -130 Z" fill={C.dokyoKesa} stroke={KRP.ink} strokeWidth={4.5} />
        <g stroke={C.dokyoKesaDark} strokeWidth={4}>
          <line x1={-40} y1={-146} x2={44} y2={-66} />
          <line x1={-20} y1={-150} x2={-46} y2={-122} />
          <line x1={10} y1={-122} x2={-14} y2={-96} />
          <line x1={38} y1={-96} x2={18} y2={-72} />
        </g>
        <circle cx={-34} cy={-150} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        {/* 衣の裾 */}
        <path d="M -58 -62 Q -70 -26 -64 -14 L 64 -14 Q 70 -26 58 -62 Z" fill={C.dokyoRobe} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 剃髪の後頭部 */}
        <ellipse cx={-64} cy={-220} rx={10} ry={16} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={64} cy={-220} rx={10} ry={16} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={-228} r={68} fill={C.skin} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -44 -262 Q 0 -290 44 -262" stroke="#FFFFFF" strokeWidth={6} opacity={0.45} fill="none" />
        <path d="M -50 -196 Q 0 -176 50 -196" stroke="#C9A98E" strokeWidth={4} fill="none" />
      </g>
    </g>
  );
};

// 御簾 (すだれ) と、その奥の天皇の影。shake で影が揺れる / glow で奥が赤く光る
const ND1bMisu: React.FC<{ x: number; y: number; w: number; h: number; f: number; shake?: number; red?: number; big?: number }> = ({
  x, y, w, h, f, shake = 0, red = 0, big = 1,
}) => {
  const sx = Math.sin(f * 0.9) * 14 * shake;
  const sy = Math.cos(f * 1.3) * 5 * shake;
  const id = `nd1b-misu-${x}-${y}`;
  return (
    <g>
      <defs>
        <clipPath id={id}><rect x={x} y={y + 40} width={w} height={h - 40} /></clipPath>
      </defs>
      {/* 奥の間 (ほの明るい) */}
      <rect x={x} y={y + 40} width={w} height={h - 40} fill={red > 0 ? C.angerRed : "#E8D9AE"} opacity={red > 0 ? 0.35 + 0.4 * red : 1} />
      <rect x={x} y={y + 40} width={w} height={h - 40} fill="#E8D9AE" opacity={red > 0 ? 0.5 * (1 - red) : 0} />
      {/* 天皇の影 (座る姿・冠) */}
      <g clipPath={`url(#${id})`} opacity={0.8 + 0.18 * red}>
        <g transform={`translate(${x + w / 2 + sx} ${y + h + sy}) scale(${big})`}>
          <path d="M -150 0 Q -150 -150 -80 -190 L 80 -190 Q 150 -150 150 0 Z" fill={C.shadow} />
          <circle cx={0} cy={-250} r={66} fill={C.shadow} />
          <rect x={-40} y={-350} width={80} height={60} rx={16} fill={C.shadow} />
          <path d="M -14 -350 Q -10 -420 10 -440 L 26 -430 Q 12 -400 14 -350 Z" fill={C.shadow} />
          <path d="M -150 -40 Q -200 -60 -190 0 L -150 0 Z M 150 -40 Q 200 -60 190 0 L 150 0 Z" fill={C.shadow} />
        </g>
      </g>
      {/* すだれの細い竹 */}
      <g stroke={C.misuDark} strokeWidth={3} opacity={0.85}>
        {Array.from({ length: Math.floor((h - 40) / 14) }, (_, i) => (
          <line key={i} x1={x} y1={y + 48 + i * 14} x2={x + w} y2={y + 48 + i * 14} />
        ))}
      </g>
      <rect x={x} y={y + 40} width={w} height={h - 40} fill={C.misu} opacity={0.32} />
      {/* 編み糸 (縦) */}
      {[0.2, 0.4, 0.6, 0.8].map((u) => (
        <line key={u} x1={x + w * u} y1={y + 40} x2={x + w * u} y2={y + h} stroke={C.misuEdge} strokeWidth={3} opacity={0.7} />
      ))}
      {/* 上の帽額 (もこう: 緑の縁布) と房 */}
      <rect x={x - 10} y={y} width={w + 20} height={46} fill={C.misuEdge} stroke={KRP.ink} strokeWidth={5} />
      <g fill="#E9D9A0">
        {Array.from({ length: Math.floor(w / 80) }, (_, i) => (
          <ellipse key={i} cx={x + 40 + i * 80} cy={y + 23} rx={18} ry={9} />
        ))}
      </g>
      {[x + w * 0.25, x + w * 0.75].map((tx, i) => (
        <g key={i} transform={`rotate(${Math.sin(f / 10 + i) * 4 + shake * Math.sin(f) * 6} ${tx} ${y + 46})`}>
          <line x1={tx} y1={y + 46} x2={tx} y2={y + 150} stroke={NP.mimi} strokeWidth={6} />
          <path d={`M ${tx - 16} ${y + 150} L ${tx + 16} ${y + 150} L ${tx + 10} ${y + 210} L ${tx - 10} ${y + 210} Z`} fill={NP.mimi} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={6} />
    </g>
  );
};

// 大きな筆 (穂先を下に)。tipX,tipY が穂先。shu で穂先が朱に染まる
const ND1bFude: React.FC<{ tipX: number; tipY: number; s?: number; rot?: number; shu?: boolean }> = ({ tipX, tipY, s = 1, rot = 0, shu = true }) => (
  <g transform={`translate(${tipX} ${tipY}) rotate(${rot}) scale(${s})`}>
    {/* 軸 (竹) */}
    <rect x={-20} y={-560} width={40} height={430} rx={14} fill={C.brushBamboo} stroke={KRP.ink} strokeWidth={6} />
    {[-470, -330, -200].map((ny) => <line key={ny} x1={-20} y1={ny} x2={20} y2={ny} stroke={C.woodBrown} strokeWidth={5} />)}
    <rect x={-6} y={-600} width={12} height={44} rx={5} fill={NP.mimiDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 口金 */}
    <rect x={-26} y={-140} width={52} height={36} rx={6} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5} />
    {/* 穂 */}
    <path d="M -28 -106 Q -34 -40 0 0 Q 34 -40 28 -106 Z" fill={C.brushHair} stroke={KRP.ink} strokeWidth={5} />
    {shu && <path d="M -22 -50 Q -14 -16 0 0 Q 14 -16 22 -50 Q 0 -40 -22 -50 Z" fill={NP.mimi} />}
    <path d="M -10 -96 Q -12 -50 -2 -14" stroke="#5A524C" strokeWidth={3} fill="none" />
  </g>
);

// 名札の裏面 (字のない白木)。Nafuda と同じ寸法
const ND1bNafudaBack: React.FC<{ x: number; y: number; s: number; sx: number; rot?: number }> = ({ x, y, s, sx, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <path d="M 0 -150 L -60 -98 M 0 -150 L 60 -98" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    <circle cx={0} cy={-152} r={13} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
    <g transform={`scale(${sx} 1)`}>
      <rect x={-200} y={-95} width={400} height={190} rx={22} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={NP.woodDark} strokeWidth={3} fill="none" opacity={0.7}>
        <path d="M -180 -30 q 90 14 180 0 q 90 -14 170 4" />
        <path d="M -182 30 q 100 -12 190 0 q 80 12 170 -6" />
      </g>
      <circle cx={-60} cy={-74} r={10} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={60} cy={-74} r={10} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);

// 名札をくるりと裏返す。t 0→0.5 で表A が細くなり、0.5→1 で表B が広がる
const ND1bFlip: React.FC<{ x: number; y: number; s: number; t: number; f: number; a?: string; b: string; rot?: number; knots?: Record<string, number> }> = ({
  x, y, s, t, f, a, b, rot = 0,
}) => {
  const sx = Math.max(0.03, Math.abs(Math.cos(clamp01(t) * Math.PI)));
  const second = t >= 0.5;
  const label = second ? b : a;
  return (
    <g>
      {label === undefined ? (
        <ND1bNafudaBack x={x} y={y} s={s} sx={sx} rot={rot} />
      ) : (
        <g transform={`translate(${x} ${y}) scale(${sx} 1) translate(${-x} ${-y})`}>
          <Nafuda x={x} y={y} s={s} text={label} f={f} rot={rot} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #86 和気清麻呂です。
// 格: 山 / seed 4086
// 絵: ★#85 の名札が f でくるりと表を向き、`Nafuda text="和気 清麻呂"` (名札の装置)。その前に**清麻呂の後ろ姿** (黒い冠・緑の袍・笏)。背景は屋敷の門と松
// どこ: 奈良の都。朝の屋敷の門前 (瓦屋根の四脚門・白い築地塀・左右に松・玉砂利の道)
// 演出: 門の前に清麻呂の後ろ姿が大きく立つ。門の軒先に裏向きの名札が下がっていて、くるりと表を向く
// 動き: f6〜24 で名札が裏→表に回り、f22〜34 で光がはじける。松の枝が風でゆれ、松葉が舞う。カメラはゆっくり寄る
const Nm086: React.FC<{ f: number }> = ({ f }) => {
  const fl = easeInOut(seg(f, 6, 24));
  const shine = seg(f, 22, 36);
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const wind = Math.sin(f / 18);
  const pine = (px: number, flip: number) => (
    <g transform={`translate(${px} 0) scale(${flip} 1)`}>
      <path d="M -30 760 Q -50 560 10 440 Q 60 330 20 200 L 56 196 Q 100 340 46 450 Q 0 560 26 760 Z" fill={C.trunk} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.woodBrownDark} strokeWidth={3} fill="none">
        <path d="M -16 700 q 10 -20 0 -40" /><path d="M 8 600 q 12 -20 2 -44" /><path d="M 30 420 q 12 -18 4 -40" />
      </g>
      <path d="M 30 420 Q 140 400 230 360" stroke={C.trunk} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M 20 300 Q -80 270 -170 240" stroke={C.trunk} strokeWidth={18} fill="none" strokeLinecap="round" />
      {([[250, 340, 150, 52], [-170, 225, 130, 46], [50, 170, 170, 58], [140, 260, 110, 40], [-60, 330, 100, 36]] as const).map(([cx, cy, rx, ry], i) => (
        <g key={i} transform={`rotate(${wind * (2 + i * 0.6)} ${cx} ${cy + ry})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.pineDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={cx - rx * 0.1} cy={cy - ry * 0.3} rx={rx * 0.8} ry={ry * 0.5} fill={C.pine} />
          <g stroke={C.pineDark} strokeWidth={3}>
            {Array.from({ length: 7 }, (_, k) => {
              const nx = cx - rx * 0.7 + (k * rx * 1.4) / 6;
              return <path key={k} d={`M ${nx} ${cy - ry * 0.5} l -8 -14 M ${nx} ${cy - ry * 0.5} l 8 -14`} />;
            })}
          </g>
        </g>
      ))}
    </g>
  );
  return (
    <Frame f={f} seed={4086} bg={C.sky}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* 空と遠い山 */}
        <rect x={-40} y={-40} width={W + 80} height={760} fill={C.sky} />
        <rect x={-40} y={360} width={W + 80} height={360} fill={C.skyLow} opacity={0.8} />
        <path d="M -40 470 Q 200 330 460 430 Q 700 300 980 410 Q 1260 310 1520 420 Q 1740 340 1960 430 L 1960 600 L -40 600 Z" fill={C.hillFar} />
        <path d="M -40 520 Q 300 420 620 500 Q 1000 420 1360 500 Q 1660 440 1960 510 L 1960 640 L -40 640 Z" fill={C.hill} />
        {/* 雲 */}
        {[[300, 140], [1500, 110]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${(f * 0.6) * (i ? -1 : 1)} 0)`}>
            <ellipse cx={cx} cy={cy} rx={120} ry={32} fill={KRP.white} opacity={0.85} />
            <ellipse cx={cx + 70} cy={cy - 18} rx={70} ry={28} fill={KRP.white} opacity={0.85} />
          </g>
        ))}
        {/* 築地塀 (左右) */}
        {[[-40, 640], [1280, 700]].map(([wx, ww], i) => (
          <g key={i}>
            <rect x={wx} y={420} width={ww} height={320} fill={C.plaster} stroke={KRP.ink} strokeWidth={6} />
            {[470, 520, 570].map((ly) => <line key={ly} x1={wx} y1={ly} x2={wx + ww} y2={ly} stroke={C.gravelDot} strokeWidth={3} opacity={0.6} />)}
            <rect x={wx} y={680} width={ww} height={60} fill={C.stoneBase} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${wx - 10} 424 L ${wx + 20} 384 L ${wx + ww - 20} 384 L ${wx + ww + 10} 424 Z`} fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor(ww / 34) }, (_, k) => (
              <line key={k} x1={wx + 20 + k * 34} y1={388} x2={wx + 16 + k * 34} y2={422} stroke={C.tileDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 門 */}
        <g>
          <rect x={700} y={240} width={520} height={500} fill={C.woodBrownDark} />
          {/* 開いた門の奥: 中庭と奥の建物 */}
          <rect x={760} y={300} width={400} height={440} fill={C.skyLow} />
          <path d="M 780 470 L 960 400 L 1140 470 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={4} />
          <rect x={810} y={470} width={300} height={150} fill={C.plaster} stroke={KRP.ink} strokeWidth={4} />
          {[850, 920, 990, 1060].map((px) => <rect key={px} x={px} y={470} width={14} height={150} fill={C.woodRed} />)}
          <rect x={760} y={620} width={400} height={120} fill={C.gravel} />
          {/* 開いた扉 */}
          <path d="M 760 300 L 700 280 L 700 760 L 760 740 Z" fill={C.woodBrown} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1160 300 L 1220 280 L 1220 760 L 1160 740 Z" fill={C.woodBrown} stroke={KRP.ink} strokeWidth={5} />
          {[360, 460, 560, 660].map((ry) => (
            <g key={ry}><circle cx={730} cy={ry} r={6} fill={NP.brassDark} /><circle cx={1190} cy={ry} r={6} fill={NP.brassDark} /></g>
          ))}
          {/* 柱 */}
          {[680, 1220].map((px) => <rect key={px} x={px - 20} y={240} width={40} height={510} fill={C.woodRed} stroke={KRP.ink} strokeWidth={6} />)}
          <rect x={640} y={240} width={640} height={36} fill={C.woodRed} stroke={KRP.ink} strokeWidth={6} />
          {/* 瓦屋根 */}
          <path d="M 560 250 Q 660 232 760 120 L 1160 120 Q 1260 232 1360 250 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 22 }, (_, k) => {
            const tx = 600 + k * 34;
            return <line key={k} x1={tx} y1={246} x2={lerp(tx, 960, 0.42) + (tx < 960 ? 20 : -20)} y2={126} stroke={C.tileDark} strokeWidth={3} />;
          })}
          <rect x={740} y={96} width={440} height={28} rx={6} fill={C.tileDark} stroke={KRP.ink} strokeWidth={6} />
          {[734, 1186].map((ox) => <circle key={ox} cx={ox} cy={104} r={20} fill={C.tileDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 名札を吊る紐 (軒から) */}
          <line x1={960} y1={276} x2={960} y2={298} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 松 (左右) */}
        {pine(230, 1)}
        {pine(1690, -1)}
        {/* 玉砂利 */}
        <rect x={-40} y={736} width={W + 80} height={400} fill={C.gravel} />
        <path d="M 760 740 L 1160 740 L 1500 1120 L 420 1120 Z" fill={C.skyLow} opacity={0.55} />
        {Array.from({ length: 70 }, (_, i) => (
          <ellipse key={i} cx={rnd(4086, i) * W} cy={760 + rnd(4087, i) * 320} rx={6 + rnd(1, i) * 6} ry={3 + rnd(2, i) * 3} fill={C.gravelDot} />
        ))}
        {/* 舞う松葉 */}
        {[0, 1, 2, 3].map((i) => {
          const px = (300 + i * 420 + f * (5 + i)) % (W + 100);
          const py = 260 + i * 90 + Math.sin(f / 7 + i) * 30 + f * 1.5;
          return <path key={i} d={`M ${px} ${py} l 14 -18 M ${px} ${py} l 18 -6`} stroke={C.pineDark} strokeWidth={4} strokeLinecap="round" />;
        })}
        {/* 清麻呂の後ろ姿 */}
        <ellipse cx={960} cy={1008} rx={150} ry={22} fill={KRP.ink} opacity={0.18} />
        <ND1bKiyomaro x={960} y={1010} s={1.45} f={f} pose="stand" />
        {/* 名札がくるりと表を向く */}
        <ND1bFlip x={960} y={400} s={1.0} t={fl} f={f} b="和気 清麻呂" />
        {shine > 0 && shine < 1 && (
          <g opacity={1 - shine} stroke={NP.glow} strokeWidth={8} strokeLinecap="round">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r1 = 230 + shine * 60, r2 = 280 + shine * 110;
              return <line key={i} x1={960 + Math.cos(a) * r1} y1={400 + Math.sin(a) * r1 * 0.55} x2={960 + Math.cos(a) * r2} y2={400 + Math.sin(a) * r2 * 0.55} />;
            })}
          </g>
        )}
        <TagPlate x={1640} y={56} text="769年 奈良" size={36} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #87 彼は、僧の道鏡が天皇の位につくのを、命がけで止めました。
// 格: 山 / seed 4087
// 絵: 宇佐の神社 (八幡宮) へ使いに行った清麻呂が、都の宮中で報告する場面。御簾の奥に天皇の影、横に**紫の袈裟の僧 (道鏡) の後ろ姿**。清麻呂の後ろ姿が巻物 (お告げ) を掲げて立ちはだかる。**玉座に向かう道鏡の前に、清麻呂の笏が横一文字に差し出される**図 (止める動き)。札「道鏡」は付けてよい
// どこ: 都の宮中の正殿。朱の柱・板の床・奥に一段高い玉座の壇と御簾 (奥に天皇の影)
// 演出: 右から紫の袈裟の道鏡 (後ろ姿) が玉座の壇へ歩み寄る。左の清麻呂 (後ろ姿) が宇佐のお告げの巻物を掲げ、笏を横一文字に差し出して道をふさぐ
// 動き: 道鏡が f0〜20 で壇へ進む → f14〜24 で笏がシュッと伸びる → f24 で道鏡がのけぞって止まる (衝撃線)。巻物は f4〜18 で掲がる。御簾の影がわずかに揺れる。カメラは右へ少しパン
const Nm087: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 22));
  const block = easeOut(seg(f, 14, 24));
  const hit = seg(f, 24, 34);
  const recoil = Math.sin(clamp01(hit) * Math.PI) * -6 + (hit > 0 ? -2 : 0);
  const dx = lerp(1340, 1210, walk) + (hit > 0 ? 12 * easeOut(hit) : 0);
  const pan = lerp(20, -20, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={4087} bg={C.floorWood}>
      <g transform={`translate(${pan} 0)`}>
        {/* 奥の壁 */}
        <rect x={-60} y={-40} width={W + 120} height={700} fill={C.plaster} />
        {/* 天井の梁 */}
        <rect x={-60} y={-40} width={W + 120} height={90} fill={C.woodRed} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={50} width={W + 120} height={22} fill={C.woodRedDark} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-40 + i * 170} y={50} width={40} height={22} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 床 (板張り・奥へすぼまる線) */}
        <rect x={-60} y={640} width={W + 120} height={500} fill={C.floorWood} />
        {Array.from({ length: 16 }, (_, i) => {
          const bx = -200 + i * 160;
          return <line key={i} x1={lerp(bx, 960, 0.35)} y1={640} x2={bx} y2={1100} stroke={C.floorWoodDark} strokeWidth={4} />;
        })}
        <line x1={-60} y1={640} x2={W + 60} y2={640} stroke={KRP.ink} strokeWidth={6} />
        {/* 畳の座 (縁は鶯色) */}
        <path d="M 360 700 L 1560 700 L 1700 860 L 220 860 Z" fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 360 700 L 1560 700 L 1574 716 L 346 716 Z" fill={C.tatamiEdge} />
        <path d="M 220 860 L 1700 860 L 1686 844 L 234 844 Z" fill={C.tatamiEdge} />
        {/* 玉座の壇 (三段) */}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={560 + k * 40} y={620 - k * 36} width={800 - k * 80} height={40} fill={k === 0 ? C.woodBrownDark : C.woodBrown} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 御簾と天皇の影 */}
        <ND1bMisu x={640} y={110} w={640} h={440} f={f} shake={0.15 + hit * 0.4} />
        {/* 柱 (朱) */}
        {[120, 520, 1400, 1800].map((px, i) => (
          <g key={px}>
            <rect x={px - 34} y={60} width={68} height={i === 0 || i === 3 ? 1000 : 600} fill={C.woodRed} stroke={KRP.ink} strokeWidth={6} />
            <rect x={px - 26} y={60} width={14} height={i === 0 || i === 3 ? 1000 : 600} fill="#FFFFFF" opacity={0.15} />
            <rect x={px - 44} y={i === 0 || i === 3 ? 1000 : 640} width={88} height={30} fill={C.stoneBase} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 灯台 (燭台) */}
        {[330, 1600].map((lx, i) => (
          <g key={lx}>
            <rect x={lx - 6} y={470} width={12} height={250} fill={KRP.ink} />
            <ellipse cx={lx} cy={720} rx={34} ry={10} fill={KRP.ink} />
            <ellipse cx={lx} cy={470} rx={30} ry={9} fill={C.woodBrownDark} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${lx} 466 q ${-10 + Math.sin(f / 4 + i) * 3} -24 0 -44 q ${10} 20 0 44`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={lx} cy={446} r={46} fill={NP.glow} opacity={0.22 + Math.sin(f / 5 + i) * 0.05} />
          </g>
        ))}
        {/* 道鏡 (後ろ姿) が壇へ歩む */}
        <ellipse cx={dx} cy={968} rx={110} ry={18} fill={KRP.ink} opacity={0.18} />
        <ND1bDokyo x={dx} y={970} s={1.28} f={f + (walk < 1 ? f * 0.8 : 0)} lean={recoil} />
        {walk < 1 && [0, 1, 2].map((i) => (
          <line key={i} x1={dx + 110 + i * 26} y1={720 + i * 40} x2={dx + 160 + i * 26} y2={720 + i * 40} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5 * (1 - walk)} />
        ))}
        {/* 清麻呂 (後ろ姿): 巻物を掲げ、笏で道をふさぐ */}
        <ellipse cx={620} cy={962} rx={120} ry={18} fill={KRP.ink} opacity={0.18} />
        <ND1bKiyomaro x={620} y={965} s={1.36} f={f} pose="point" shaku={block} scrollUp={easeOut(seg(f, 4, 18))} />
        {/* 笏が当たった衝撃 */}
        {hit > 0 && hit < 1 && (
          <g stroke={KRP.red} strokeWidth={7} strokeLinecap="round" opacity={1 - hit}>
            {[-50, -20, 10, 40].map((a, i) => {
              const r = (a * Math.PI) / 180;
              const cx = 1150, cy = 760;
              return <line key={i} x1={cx + Math.cos(r) * (30 + hit * 30)} y1={cy + Math.sin(r) * (30 + hit * 30)} x2={cx + Math.cos(r) * (70 + hit * 50)} y2={cy + Math.sin(r) * (70 + hit * 50)} />;
            })}
          </g>
        )}
        {hit > 0.3 && <XMark x={1260} y={560} s={0.55} t={seg(f, 28, 38)} />}
        {/* 札 */}
        <TagPlate x={dx + 10} y={440} text="道鏡" size={40} t={seg(f, 6, 14)} />
        <TagPlate x={420} y={360} text="宇佐八幡のお告げ" size={30} t={seg(f, 16, 26)} />
        <TagPlate x={960} y={92} text="宮中" size={30} t={seg(f, 0, 8)} fill={KRP.white} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #88 その怒りを買って、名前を書きかえられます。
// 格: 並 / seed 4088
// 絵: 御簾の奥の影が大きく揺れる (怒り)。空気が赤く染まる。清麻呂の名札 `Nafuda` に、上から**大きな筆**が近づく (f)。筆先に朱
// どこ: #87 と同じ正殿の、御簾の真ん前 (寄り)。左右に朱の柱、床に倒れた灯台の火影
// 演出: 御簾の奥の影が大きくなって揺れ、部屋の空気が赤く染まる。手前に吊られた清麻呂の名札へ、右上から朱を含んだ大きな筆が下りてくる
// 動き: f0〜20 で赤みが広がり、影が膨らんで震える。f10〜40 で筆が名札の字へ近づく。f34〜42 で穂先から朱が一滴落ちる。画面はかすかに震える
const Nm088: React.FC<{ f: number }> = ({ f }) => {
  const rage = easeOut(seg(f, 0, 20));
  const come = easeInOut(seg(f, 10, 40));
  const drip = seg(f, 34, 42);
  const tipX = lerp(1640, 1130, come);
  const tipY = lerp(-60, 560, come);
  const quake = Math.sin(f * 1.3) * 4 * rage;
  return (
    <Frame f={f} seed={4088} bg={C.nightWall}>
      <g transform={`translate(${quake} ${Math.cos(f * 1.7) * 2 * rage})`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.nightWall} />
        {/* 床 */}
        <rect x={-40} y={800} width={W + 80} height={320} fill={C.floorWoodDark} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-40} y1={820 + i * 30} x2={W + 40} y2={820 + i * 30} stroke={C.woodBrownDark} strokeWidth={3} />)}
        {/* 床に落ちた巻物 (お告げ) と、床に映る赤い光 */}
        <ellipse cx={960} cy={900} rx={760} ry={60} fill={C.angerRed} opacity={0.25 * rage} />
        <g transform="rotate(-8 420 960)">
          <rect x={300} y={940} width={260} height={40} rx={18} fill={C.scrollPaper} stroke={KRP.ink} strokeWidth={5} />
          <rect x={290} y={936} width={16} height={48} rx={5} fill={C.woodRed} stroke={KRP.ink} strokeWidth={3} />
          <rect x={554} y={936} width={16} height={48} rx={5} fill={C.woodRed} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 560 960 Q 640 990 720 970" stroke={NP.mimi} strokeWidth={6} fill="none" />
        </g>
        <rect x={1300} y={930} width={18} height={130} rx={6} fill={C.brushBamboo} stroke={KRP.ink} strokeWidth={4} transform="rotate(70 1309 995)" />
        {/* 大きな御簾 (寄り) */}
        <ND1bMisu x={220} y={40} w={1480} h={740} f={f} shake={0.3 + rage * 0.9} red={rage} big={1.7 + 0.12 * rage} />
        {/* 柱 */}
        {[110, 1810].map((px) => (
          <g key={px}>
            <rect x={px - 60} y={-40} width={120} height={1140} fill={C.woodRed} stroke={KRP.ink} strokeWidth={7} />
            <rect x={px - 46} y={-40} width={20} height={1140} fill="#FFFFFF" opacity={0.12} />
          </g>
        ))}
        {/* 赤く染まる空気 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.angerRed} opacity={0.22 * rage} />
        {/* 怒りの波 (影から広がる輪) */}
        {[0, 1, 2].map((i) => {
          const p = ((f + i * 10) % 30) / 30;
          return <ellipse key={i} cx={960} cy={420} rx={200 + p * 600} ry={120 + p * 300} fill="none" stroke={C.angerRed} strokeWidth={8} opacity={(1 - p) * 0.5 * rage} />;
        })}
        {/* 吊られた名札 (清麻呂) */}
        <line x1={960} y1={40} x2={960} y2={470} stroke={KRP.ink} strokeWidth={6} />
        <Nafuda x={960} y={640} s={1.15} text="和気 清麻呂" f={f} />
        {/* 大きな筆 (朱を含む) */}
        <ellipse cx={tipX - 40} cy={700} rx={60 * come} ry={10 * come} fill={KRP.ink} opacity={0.2 * come} />
        <ND1bFude tipX={tipX} tipY={tipY} s={1.0} rot={lerp(38, 24, come)} />
        {/* 朱のしずく */}
        {drip > 0 && (
          <path d={`M ${tipX} ${tipY + 10 + drip * 60} q -12 18 0 28 q 12 -10 0 -28`} fill={NP.mimi} stroke={KRP.ink} strokeWidth={3} />
        )}
        <TagPlate x={1500} y={170} text="天皇の怒り" size={34} t={seg(f, 8, 18)} fill={KRP.white} color={KRP.red} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #89 「清麻呂」の「清」が、けがれの「穢」に。
// 格: 山 / seed 4089
// 絵: ★文字の書きかえの見せ場 (からくり)。名札の「清」の一字を大きく寄りで。筆が f で「清」に×をつけ、その上に「穢」の字が墨で書かれる (2つの字を大きく並べる: 「清」→「穢」)。左右に小さく「きよらか」「けがれ」の意味の絵 (澄んだ水の雫 / 泥のしみ)
// どこ: 名札の板の超寄り (画面いっぱいの白木の木目)。上辺に吊り金具、四隅に机の上の硯と筆置きが少しのぞく
// 演出: 左に大きな「清」、右に墨で書かれる「穢」。間に矢印。筆が「清」に朱の×をつけ、続けて右に「穢」を書く。左下に澄んだ水の雫、右下に泥のしみ (意味の絵)
// 動き: f4〜16 で朱の×が2画で引かれる → f18〜38 で「穢」が左から右へ書き現れる (筆が追いかける)。雫はきらりと揺れ、泥のしみはじわっと広がる。カメラは「清」から「穢」へゆっくりパン
const Nm089: React.FC<{ f: number }> = ({ f }) => {
  const x1 = easeOut(seg(f, 4, 10));
  const x2 = easeOut(seg(f, 10, 16));
  const write = easeInOut(seg(f, 18, 38));
  const arrow = seg(f, 14, 22);
  const pan = lerp(50, -40, easeInOut(seg(f, 0, 42)));
  // 筆の位置: ×を引く → 穢を書く → 右上へ抜ける
  let bx = 560, by = 300;
  if (f < 10) { bx = lerp(400, 720, x1); by = lerp(240, 560, x1); }
  else if (f < 16) { bx = lerp(720, 400, x2); by = lerp(240, 560, x2); }
  else if (f < 38) { const u = write; bx = lerp(1180, 1560, u); by = 260 + Math.abs(Math.sin(u * Math.PI * 5)) * 280; }
  else { const u = seg(f, 38, 42); bx = lerp(1560, 1700, u); by = lerp(300, 250, u); }
  const writing = f >= 4 && f < 38;
  const stain = easeOut(seg(f, 22, 42));
  return (
    <Frame f={f} seed={4089} bg={NP.wood}>
      <defs>
        <clipPath id="nd1b-089-write"><rect x={1160} y={150} width={460 * write} height={520} /></clipPath>
      </defs>
      <g transform={`translate(${pan} 0)`}>
        {/* 机 (札の外側) */}
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.deskDark} />
        {/* 札の板 (超寄り) */}
        <rect x={40} y={40} width={1840} height={820} rx={60} fill={NP.wood} stroke={KRP.ink} strokeWidth={12} />
        <rect x={40} y={40} width={1840} height={90} rx={40} fill={NP.woodMid} opacity={0.5} />
        <g stroke={NP.grain} strokeWidth={5} fill="none" opacity={0.75}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M 70 ${150 + i * 90} q 420 ${rnd(4089, i) * 40 - 20} 880 0 q 440 ${rnd(4090, i) * 40 - 20} 900 ${rnd(3, i) * 20 - 10}`} />
          ))}
        </g>
        {/* 吊り金具の穴 */}
        {[560, 1360].map((hx) => <circle key={hx} cx={hx} cy={92} r={22} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />)}
        {/* 左の結び目 (板の端) */}
        <circle cx={40} cy={480} r={34} fill={NP.brass} stroke={KRP.ink} strokeWidth={7} />
        {/* 「清」(元の字) */}
        <text x={560} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={420} fill={NP.sumi}>清</text>
        {/* 朱の× */}
        <g stroke={NP.mimi} strokeWidth={34} strokeLinecap="round" fill="none">
          {x1 > 0 && <line x1={400} y1={240} x2={lerp(400, 720, x1)} y2={lerp(240, 560, x1)} />}
          {x2 > 0 && <line x1={720} y1={240} x2={lerp(720, 400, x2)} y2={lerp(240, 560, x2)} />}
        </g>
        {/* 矢印 */}
        <Arrow x={960} y={400} s={1.8} rot={0} t={arrow} />
        {/* 「穢」(墨で書かれていく) */}
        <rect x={1150} y={160} width={480} height={500} rx={20} fill={NP.woodMid} opacity={0.25 * write} />
        <g clipPath="url(#nd1b-089-write)">
          <text x={1390} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={420} fill={NP.sumi}>穢</text>
        </g>
        {/* 墨のにじみ・飛び */}
        {write > 0.2 && [0, 1, 2, 3].map((i) => (
          <circle key={i} cx={1200 + rnd(7, i) * 400} cy={200 + rnd(8, i) * 440} r={6 + rnd(9, i) * 8} fill={NP.sumi} opacity={0.7 * clamp01((write - 0.2 - i * 0.15) * 4)} />
        ))}
        {/* 左下: 澄んだ水の雫 (きよらか) */}
        <g transform={`translate(330 720) scale(${1 + Math.sin(f / 6) * 0.04})`}>
          <ellipse cx={0} cy={70} rx={80} ry={14} fill={C.water} opacity={0.5} />
          <path d="M 0 -70 Q 52 10 44 34 Q 34 70 0 70 Q -34 70 -44 34 Q -52 10 0 -70 Z" fill={C.water} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -18 0 Q -24 30 -8 48" stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={20} cy={-10} r={7} fill={KRP.white} opacity={0.6 + Math.sin(f / 4) * 0.3} />
        </g>
        <TagPlate x={560} y={760} text="きよらか" size={36} t={seg(f, 2, 10)} />
        {/* 右下: 泥のしみ (けがれ) */}
        <g transform={`translate(1640 730) scale(${0.6 + 0.4 * stain})`}>
          <path d="M -90 0 Q -100 -50 -40 -56 Q -10 -90 40 -60 Q 100 -60 92 -10 Q 120 30 60 50 Q 10 80 -40 52 Q -110 50 -90 0 Z" fill={C.mud} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={-10} cy={-6} rx={40} ry={22} fill={C.mudDark} />
          <circle cx={110} cy={-50} r={14} fill={C.mud} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-120} cy={40} r={10} fill={C.mud} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <TagPlate x={1390} y={760} text="けがれ" size={36} t={seg(f, 30, 38)} />
        {/* 机の手前: 硯・墨・朱の皿・文鎮 */}
        <rect x={180} y={920} width={260} height={130} rx={20} fill="#2F2A2A" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={280} cy={968} rx={70} ry={26} fill={NP.sumi} />
        <rect x={480} y={940} width={150} height={44} rx={8} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1380} cy={990} rx={90} ry={34} fill={C.bowlWhite} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={1380} cy={984} rx={64} ry={20} fill={NP.mimi} />
        <rect x={900} y={930} width={360} height={36} rx={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 筆 */}
        <ND1bFude tipX={bx} tipY={by} s={0.8} rot={writing ? 18 : 28} shu={f < 18} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #90 新しい名前は、「別部穢麻呂」。
// 格: 山 / seed 4090
// 絵: `Nafuda` の札が f で入れ替わる: `"和気 清麻呂"` → `"別部 穢麻呂"` (古い札が裏返って新しい札になる)。札が少し傾いてぶら下がる。背景は暗い役所の柱
// どこ: 夕暮れの暗い役所 (太い古びた柱・梁・高窓からの細い光・木簡の棚・文机)
// 演出: 梁から吊られた名札「和気 清麻呂」がくるりと裏返り、「別部 穢麻呂」になって少し傾いてぶら下がる。左で筆を持った役人が無表情に見上げる
// 動き: f8〜26 で名札が回って入れ替わる (半回転ごとに板が細くなる) → f26〜36 で傾いてぎし、と揺れが止まる。光の筋の中をホコリが舞う。カメラはゆっくり寄る
const Nm090: React.FC<{ f: number }> = ({ f }) => {
  const fl = easeInOut(seg(f, 8, 26));
  const settle = seg(f, 26, 40);
  const rot = fl < 1 ? 0 : 5 * easeOut(settle) + Math.sin(settle * Math.PI * 3) * 4 * (1 - settle);
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const yb = bobOf(f);
  return (
    <Frame f={f} seed={4090} bg={C.nightWall} dark>
      <g transform={`translate(960 480) scale(${cam}) translate(-960 -480)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightWall} />
        {/* 奥の板壁 */}
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={-60 + i * 150} y={-60} width={150} height={860} fill={i % 2 ? "#36313A" : "#322D35"} stroke="#24202A" strokeWidth={4} />
        ))}
        {/* 高窓 (格子) と光の筋 */}
        <rect x={300} y={70} width={260} height={150} fill="#E9C98A" stroke={KRP.ink} strokeWidth={6} />
        {[352, 404, 456, 508].map((gx) => <rect key={gx} x={gx - 6} y={70} width={12} height={150} fill={C.nightPillar} />)}
        <path d="M 300 220 L 560 220 L 1240 860 L 760 860 Z" fill={NP.glow} opacity={0.13 + Math.sin(f / 9) * 0.02} />
        {/* 床 */}
        <rect x={-60} y={800} width={W + 120} height={340} fill={C.dimFloor} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 34} x2={W + 60} y2={820 + i * 34} stroke="#2A2422" strokeWidth={4} />)}
        <path d="M 760 860 L 1240 860 L 1320 960 L 700 960 Z" fill={NP.glow} opacity={0.1} />
        {/* 太い柱 */}
        {[150, 1770].map((px) => (
          <g key={px}>
            <rect x={px - 80} y={-60} width={160} height={920} fill={C.nightPillar} stroke={KRP.ink} strokeWidth={8} />
            <rect x={px - 60} y={-60} width={24} height={920} fill="#FFFFFF" opacity={0.07} />
            <g stroke="#3E1F1A" strokeWidth={4} fill="none">
              <path d={`M ${px - 30} 120 q 10 120 -4 260`} /><path d={`M ${px + 26} 300 q -10 140 4 300`} />
            </g>
            <rect x={px - 96} y={840} width={192} height={40} fill={C.stoneBase} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 梁 */}
        <rect x={-60} y={130} width={W + 120} height={70} fill={C.nightPillar} stroke={KRP.ink} strokeWidth={7} />
        {/* 右: 木簡の棚 */}
        <g>
          <rect x={1380} y={360} width={300} height={440} fill="#4A3A30" stroke={KRP.ink} strokeWidth={6} />
          {[480, 600, 720].map((sy) => <rect key={sy} x={1380} y={sy} width={300} height={14} fill="#2E241E" />)}
          {[0, 1, 2].map((r) => Array.from({ length: 9 }, (_, k) => (
            <rect key={`${r}-${k}`} x={1396 + k * 30} y={378 + r * 120} width={20} height={98} rx={3}
              fill={NP.woodMid} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${(rnd(r, k) - 0.5) * 6} ${1406 + k * 30} ${476 + r * 120})`} />
          )))}
        </g>
        {/* 文机と硯 */}
        <rect x={1300} y={760} width={420} height={40} fill={C.woodBrown} stroke={KRP.ink} strokeWidth={6} />
        {[1330, 1690].map((lx) => <rect key={lx} x={lx - 10} y={800} width={20} height={70} fill={C.woodBrownDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={1360} y={732} width={120} height={30} rx={8} fill="#2F2A2A" stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1400} cy={745} rx={26} ry={8} fill={NP.sumi} />
        {/* 吊り紐 */}
        <line x1={960} y1={200} x2={960} y2={250} stroke={KRP.ink} strokeWidth={7} />
        {/* 名札の入れ替わり (裏返る) */}
        <ND1bFlip x={960} y={480} s={1.5} t={fl} f={f} a="和気 清麻呂" b="別部 穢麻呂" rot={rot} />
        {fl > 0.05 && fl < 0.95 && (
          <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.6}>
            <path d="M 600 420 q -30 60 0 120" fill="none" /><path d="M 1320 420 q 30 60 0 120" fill="none" />
          </g>
        )}
        {settle > 0 && settle < 0.6 && (
          <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6 * (1 - settle / 0.6)}>
            <line x1={1290} y1={680} x2={1330} y2={700} /><line x1={1280} y1={720} x2={1320} y2={750} />
          </g>
        )}
        {/* 左: 筆を持った役人 (赤茶の袍・黒い冠) */}
        <ellipse cx={420} cy={968} rx={110} ry={16} fill="#000000" opacity={0.25} />
        <Person x={420} y={970} s={1.2} f={f} cloth={C.yakuCloth} clothDark={C.yakuDark} hair="none" face="normal" gaze={[5, -4]} pose="hold" />
        <g transform={`translate(420 ${970 + yb}) scale(1.2)`}>
          <path d="M -60 -246 Q -62 -300 0 -304 Q 62 -300 60 -246 Q 30 -258 0 -258 Q -30 -258 -60 -246 Z" fill="#141210" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-24} y={-338} width={48} height={40} rx={14} fill="#141210" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-58} y={-82} width={116} height={14} fill={C.hairBlack} />
          {/* 手元の筆 */}
          <rect x={-4} y={-210} width={10} height={100} rx={4} fill={C.brushBamboo} stroke={KRP.ink} strokeWidth={3} transform="rotate(62 0 -118)" />
          <path d="M -10 -112 q 4 22 12 30 q 6 -10 2 -30 Z" fill={NP.sumi} transform="rotate(62 0 -118)" />
        </g>
        <TagPlate x={960} y={730} text="新しい名" size={36} t={seg(f, 28, 36)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #91 清らかな男が、けがれた男にされたのです。
// 格: 図 / seed 4091
// 絵: 天秤のからくり (真鍮)。左の皿に澄んだ水の入った白い器 (清)、右の皿に泥の器 (穢)。清麻呂の名札が f で左の皿から右の皿へ移されて、天秤ががくんと傾く。木の台の上=世界
// どこ: 木の作業台の上に据えた、大きな真鍮の天秤のからくり (後ろは土壁、台の上に分銅と硯)
// 演出: 左の皿=澄んだ水の白い器 (清)、右の皿=泥の器 (穢)。清麻呂の名札は左の鎖の鉤に吊ってある。それが外れて弧を描き、右の鉤へ移ると天秤ががくんと右へ傾く
// 動き: f8〜26 で名札が左→右へ飛ぶ (軌跡の点線) → f26〜40 で天秤が右へ傾いて2〜3回ゆれて止まる。泥の器から泥がはねる。水面がきらめく
const Nm091: React.FC<{ f: number }> = ({ f }) => {
  const mv = easeInOut(seg(f, 8, 26));
  const land = seg(f, 26, 40);
  const a = f < 26 ? lerp(-6, 0, easeOut(seg(f, 8, 16)))
    : 13 * easeOut(clamp01(land * 1.6)) + Math.sin(land * Math.PI * 3) * 5 * (1 - land);
  const rad = (a * Math.PI) / 180;
  const PX = 960, PY = 300, L = 540;
  const hook = (side: -1 | 1): [number, number] => [PX + Math.cos(rad) * L * side, PY + Math.sin(rad) * L * side];
  const [lx, ly] = hook(-1);
  const [rx, ry] = hook(1);
  const tx = lerp(lx, rx, mv);
  const ty = lerp(ly, ry, mv) + 100 - Math.sin(mv * Math.PI) * 240;
  const splash = seg(f, 27, 38);
  const pan = (hx: number, hy: number, kind: "kiyo" | "kega") => {
    const py = hy + 280;
    return (
      <g>
        {/* 鎖 */}
        {[-130, 0, 130].map((ox) => (
          <line key={ox} x1={hx} y1={hy} x2={hx + ox} y2={py - 6} stroke={NP.brassDark} strokeWidth={5} strokeDasharray="12 6" />
        ))}
        <circle cx={hx} cy={hy} r={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 皿 */}
        <path d={`M ${hx - 170} ${py} Q ${hx} ${py + 70} ${hx + 170} ${py} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={hx} cy={py} rx={170} ry={16} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 器 */}
        <path d={`M ${hx - 100} ${py - 100} Q ${hx - 96} ${py - 6} ${hx} ${py - 4} Q ${hx + 96} ${py - 6} ${hx + 100} ${py - 100} Z`}
          fill={kind === "kiyo" ? C.bowlWhite : C.mud} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={hx} cy={py - 100} rx={100} ry={20} fill={kind === "kiyo" ? C.water : C.mudDark} stroke={KRP.ink} strokeWidth={5} />
        {kind === "kiyo" ? (
          <g>
            <path d={`M ${hx - 60} ${py - 104} q 20 -6 40 0`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6 + Math.sin(f / 5) * 0.3} />
            <circle cx={hx + 40} cy={py - 102} r={5} fill={KRP.white} opacity={0.5 + Math.sin(f / 3) * 0.4} />
            <path d={`M ${hx - 80} ${py - 60} q 80 20 160 0`} stroke={C.waterDeep} strokeWidth={4} fill="none" opacity={0.4} />
          </g>
        ) : (
          <g>
            {[-40, 10, 50].map((bx, i) => (
              <circle key={bx} cx={hx + bx} cy={py - 102} r={7 + ((f + i * 7) % 20) / 4} fill="none" stroke={C.mud} strokeWidth={4} />
            ))}
            {[-60, -20, 30, 70].map((sx, i) => <circle key={sx} cx={hx + sx} cy={py - 60 + (i % 2) * 22} r={9} fill={C.mudDark} opacity={0.7} />)}
            {splash > 0 && splash < 1 && [-1, -0.4, 0.4, 1].map((d) => (
              <circle key={d} cx={hx + d * (40 + splash * 90)} cy={py - 110 - Math.sin(splash * Math.PI) * 90} r={10} fill={C.mud} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        )}
        <TagPlate x={hx} y={py + 55} text={kind === "kiyo" ? "清" : "穢"} size={44} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={4091} bg={C.wallPlaster}>
      {/* 土壁 */}
      <rect x={-40} y={-40} width={W + 80} height={820} fill={C.wallPlaster} />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={rnd(4091, i) * W} cy={rnd(4092, i) * 760} r={2 + rnd(5, i) * 3} fill={C.sepia} opacity={0.5} />
      ))}
      <rect x={-40} y={60} width={W + 80} height={30} fill={C.woodBrown} stroke={KRP.ink} strokeWidth={5} />
      {/* 作業台 */}
      <rect x={-40} y={780} width={W + 80} height={340} fill={C.tableWood} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M -40 ${810 + i * 46} q 500 ${rnd(1, i) * 24 - 12} 1000 0 q 500 ${rnd(2, i) * 24 - 12} 1000 0`} stroke={C.tableWoodDark} strokeWidth={4} fill="none" opacity={0.6} />
      ))}
      {/* 台の上の小物: 分銅の山・硯 */}
      {[0, 1, 2].map((k) => (
        <rect key={k} x={170 + k * 6} y={800 - k * 34} width={90 - k * 12} height={34} rx={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <rect x={1640} y={790} width={160} height={40} rx={10} fill="#2F2A2A" stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={1690} cy={808} rx={34} ry={10} fill={NP.sumi} />
      {/* 木簡の束 */}
      <g transform="rotate(-6 420 820)">
        {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={340 + k * 26} y={800} width={22} height={110} rx={3} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={334} y={840} width={170} height={14} fill={NP.mimi} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 天秤の土台と柱 */}
      <path d="M 820 840 L 1100 840 L 1060 790 L 860 790 Z" fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={936} y={PY} width={48} height={545} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
      {[400, 560, 700].map((ry2) => <rect key={ry2} x={926} y={ry2} width={68} height={16} rx={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />)}
      {/* 針と目盛 */}
      <path d="M 880 260 A 80 80 0 0 1 1040 260" stroke={KRP.ink} strokeWidth={5} fill="none" />
      {[-30, -15, 0, 15, 30].map((g) => {
        const gr = ((g - 90) * Math.PI) / 180;
        return <line key={g} x1={PX + Math.cos(gr) * 80} y1={PY - 40 + Math.sin(gr) * 80} x2={PX + Math.cos(gr) * 94} y2={PY - 40 + Math.sin(gr) * 94} stroke={KRP.ink} strokeWidth={4} />;
      })}
      {/* 梁 */}
      <g transform={`rotate(${a} ${PX} ${PY})`}>
        <rect x={PX - L - 20} y={PY - 16} width={2 * L + 40} height={32} rx={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        <line x1={PX - L} y1={PY - 4} x2={PX + L} y2={PY - 4} stroke={NP.glowCore} strokeWidth={4} opacity={0.6} />
        <path d={`M ${PX} ${PY} L ${PX - 8} ${PY - 120} L ${PX + 8} ${PY - 120} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <circle cx={PX} cy={PY} r={26} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      {pan(lx, ly, "kiyo")}
      {pan(rx, ry, "kega")}
      {/* 名札の移動 (軌跡) */}
      {mv > 0 && mv < 1 && (
        <path d={`M ${lx} ${ly + 100} Q ${PX} ${PY - 260} ${tx} ${ty}`} stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="10 12" fill="none" />
      )}
      {mv >= 1 && <line x1={rx} y1={ry} x2={rx} y2={ry + 30} stroke={KRP.ink} strokeWidth={5} />}
      {mv <= 0 && <line x1={lx} y1={ly} x2={lx} y2={ly + 30} stroke={KRP.ink} strokeWidth={5} />}
      <Nafuda x={tx} y={ty} s={0.6} text="和気 清麻呂" f={f} rot={mv > 0 && mv < 1 ? Math.sin(mv * Math.PI) * 20 : 0} />
      {/* がくん */}
      {land > 0 && land < 0.5 && (
        <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - land * 2}>
          <line x1={rx + 200} y1={ry + 180} x2={rx + 240} y2={ry + 220} />
          <line x1={rx + 210} y1={ry + 250} x2={rx + 260} y2={ry + 260} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #92 映画の中の話だと思っていたことが、本当にあったのです。
// 格: 山 / seed 4092
// 絵: ★**作品から現実への橋**。画面の左半分に、序の「契約書の名前の欄から光が浮く」小さな絵 (映画の思い出・セピア色の額縁)、右半分に #90 の「別部 穢麻呂」の名札 (奈良の色)。真ん中で額縁の枠が f で割れて、2つの絵が1つにつながる。※映画の人物は描かない (契約書の紙と光だけ)
// どこ: 展示室の白い壁に並んだ2枚の額。左=セピア色の額 (映画の思い出: 机の上の契約書、名前の欄から光が浮く)、右=奈良の色の額 (暗い役所に吊られた「別部 穢麻呂」の名札)
// 演出: 2枚のあいだの額の枠にひびが入り、割れて崩れ落ちる。契約書から浮いた光が右へ流れて名札に届き、2枚の絵が1枚につながる。最後に大きな金の額が2枚を1つに囲む
// 動き: f0〜12 光の粒が契約書から浮く → f12〜22 ひび → f22〜34 内側の枠が崩れ落ち、あいだがつながる → f26〜38 光の帯が名札へ → f32〜42 大きな額。カメラは寄りから少し引く
const Nm092: React.FC<{ f: number }> = ({ f }) => {
  const crack = seg(f, 12, 22);
  const brk = seg(f, 22, 34);
  const join = easeOut(seg(f, 24, 36));
  const beam = easeInOut(seg(f, 26, 38));
  const outer = easeOut(seg(f, 32, 42));
  const cam = lerp(1.08, 1.0, easeInOut(seg(f, 0, 42)));
  const LX = 120, LW = 780, RX = 1020, RW = 780, FY = 100, FH = 560;
  const bar = 40;
  const pieces = (x0: number, dir: number, key: string) =>
    Array.from({ length: 5 }, (_, i) => {
      const py = FY + (i * FH) / 5;
      const d = brk * brk * (380 + i * 60);
      return (
        <rect key={`${key}${i}`} x={x0} y={py + d} width={bar} height={FH / 5 + 2} fill={i % 2 ? C.frameWood : "#7A5838"} stroke={KRP.ink} strokeWidth={4}
          opacity={1 - brk} transform={`rotate(${brk * dir * (20 + i * 15)} ${x0 + bar / 2} ${py + d + FH / 10})`} />
      );
    });
  return (
    <Frame f={f} seed={4092} bg={C.plaster}>
      <defs>
        <clipPath id="nd1b-092-l"><rect x={LX} y={FY} width={LW + 120 * join} height={FH} /></clipPath>
        <clipPath id="nd1b-092-r"><rect x={RX - 120 * join} y={FY} width={RW + 120 * join} height={FH} /></clipPath>
        <linearGradient id="nd1b-092-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={C.sepia} /><stop offset="1" stopColor={C.nightWall} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 430) scale(${cam}) translate(-960 -430)`}>
        {/* 展示室の壁と床 */}
        <rect x={-60} y={-60} width={W + 120} height={860} fill={C.plaster} />
        <rect x={-60} y={800} width={W + 120} height={340} fill={C.floorWood} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 36} x2={W + 60} y2={820 + i * 36} stroke={C.floorWoodDark} strokeWidth={3} />)}
        <rect x={-60} y={784} width={W + 120} height={20} fill={C.woodBrown} stroke={KRP.ink} strokeWidth={4} />
        {/* 天井のスポットライト */}
        {[510, 1410].map((sx) => <path key={sx} d={`M ${sx - 40} -60 L ${sx + 40} -60 L ${sx + 300} 780 L ${sx - 300} 780 Z`} fill={NP.glow} opacity={0.08} />)}
        {/* 額の影 */}
        <rect x={LX + 14} y={FY + 18} width={LW} height={FH} fill={KRP.ink} opacity={0.15} />
        <rect x={RX + 14} y={FY + 18} width={RW} height={FH} fill={KRP.ink} opacity={0.15} />
        {/* つながった中央 */}
        <rect x={LX + LW - 20} y={FY} width={RX - LX - LW + 40} height={FH} fill="url(#nd1b-092-g)" opacity={join} />
        {/* 左の絵: セピアの契約書 */}
        <g clipPath="url(#nd1b-092-l)">
          <rect x={LX} y={FY} width={LW + 140} height={FH} fill={C.sepia} />
          <rect x={LX} y={FY + 380} width={LW + 140} height={200} fill={C.sepiaDark} />
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={LX + rnd(4092, i) * LW} cy={FY + rnd(4093, i) * FH} r={2 + rnd(6, i) * 2} fill={C.sepiaDark} opacity={0.4} />
          ))}
          {/* 契約書 */}
          <g transform="rotate(-4 510 420)">
            <rect x={300} y={200} width={420} height={420} fill={C.sepiaLight} stroke={C.sepiaDark} strokeWidth={6} />
            {Array.from({ length: 7 }, (_, i) => <line key={i} x1={340} y1={250 + i * 30} x2={680 - (i % 3) * 40} y2={250 + i * 30} stroke={C.sepiaDark} strokeWidth={5} opacity={0.6} />)}
            {/* 名前の欄 (光る) */}
            <rect x={340} y={490} width={340} height={80} fill={NP.glowCore} stroke={C.sepiaDark} strokeWidth={5} />
            <rect x={340} y={490} width={340} height={80} fill={NP.glow} opacity={0.35 + Math.sin(f / 4) * 0.15} />
            <circle cx={640} cy={600} r={22} fill={C.sepiaDark} opacity={0.6} />
          </g>
          {/* 浮いてくる光の粒 */}
          {Array.from({ length: 7 }, (_, i) => {
            const p = ((f * 1.2 + i * 9) % 40) / 40;
            return <circle key={i} cx={380 + i * 45 + Math.sin(f / 6 + i) * 10} cy={520 - p * 280} r={8 - p * 4} fill={NP.glowCore} opacity={(1 - p) * 0.9} />;
          })}
          {/* セピアの縁の焼け */}
          <rect x={LX} y={FY} width={LW} height={FH} fill="none" stroke={C.sepiaDark} strokeWidth={40} opacity={0.35} />
        </g>
        {/* 右の絵: 奈良の役所の名札 */}
        <g clipPath="url(#nd1b-092-r)">
          <rect x={RX - 140} y={FY} width={RW + 140} height={FH} fill={C.nightWall} />
          <rect x={RX - 140} y={FY + 460} width={RW + 140} height={120} fill={C.dimFloor} />
          <rect x={RX + 40} y={FY} width={90} height={FH} fill={C.nightPillar} stroke={KRP.ink} strokeWidth={5} />
          <rect x={RX + RW - 130} y={FY} width={90} height={FH} fill={C.nightPillar} stroke={KRP.ink} strokeWidth={5} />
          <rect x={RX - 140} y={FY + 40} width={RW + 140} height={44} fill={C.nightPillar} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${RX + 180} ${FY + 84} L ${RX + 320} ${FY + 84} L ${RX + 600} ${FY + 580} L ${RX + 300} ${FY + 580} Z`} fill={NP.glow} opacity={0.12} />
          <line x1={1410} y1={FY + 84} x2={1410} y2={FY + 150} stroke={KRP.ink} strokeWidth={6} />
          {beam > 0.9 && <circle cx={1410} cy={440} r={230} fill={NP.glow} opacity={0.25 * seg(f, 36, 42)} />}
          <Nafuda x={1410} y={440} s={1.0} text="別部 穢麻呂" f={f} rot={7} />
        </g>
        {/* つながった中央 (2枚の色が混ざる) */}
        <rect x={LX + LW - 30} y={FY} width={RX - LX - LW + 60} height={FH} fill="url(#nd1b-092-g)" opacity={join * 0.9} />
        {join > 0 && <ellipse cx={960} cy={FY + FH / 2} rx={70} ry={FH * 0.45 * join} fill={NP.glow} opacity={0.35 * join} />}

        {/* 光の帯 (契約書 → 名札) */}
        {beam > 0 && (
          <path d={`M 520 520 Q 960 ${260 - 40 * Math.sin(f / 8)} ${lerp(520, 1210, beam)} ${lerp(520, 440, beam)}`}
            stroke={NP.glow} strokeWidth={26} strokeLinecap="round" fill="none" opacity={0.75} />
        )}
        {beam > 0 && (
          <path d={`M 520 520 Q 960 ${260 - 40 * Math.sin(f / 8)} ${lerp(520, 1210, beam)} ${lerp(520, 440, beam)}`}
            stroke={NP.glowCore} strokeWidth={9} strokeLinecap="round" fill="none" />
        )}
        {/* 左の額 (外側3辺 + 内側の辺) */}
        <g fill={C.frameWood} stroke={KRP.ink} strokeWidth={6}>
          <rect x={LX - bar} y={FY - bar} width={LW + bar} height={bar} />
          <rect x={LX - bar} y={FY + FH} width={LW + bar} height={bar} />
          <rect x={LX - bar} y={FY - bar} width={bar} height={FH + 2 * bar} />
          <rect x={RX} y={FY - bar} width={RW + bar} height={bar} />
          <rect x={RX} y={FY + FH} width={RW + bar} height={bar} />
          <rect x={RX + RW} y={FY - bar} width={bar} height={FH + 2 * bar} />
        </g>
        {/* 内側の枠: ひび → 崩れ落ちる */}
        {brk < 1 && pieces(LX + LW - bar, -1, "l")}
        {brk < 1 && pieces(RX, 1, "r")}
        {crack > 0 && brk < 0.4 && (
          <g stroke={KRP.ink} strokeWidth={5} fill="none" opacity={1 - brk * 2.5}>
            <path d={`M ${LX + LW - 20} ${FY + 40} l -14 ${60 * crack} l 18 ${50 * crack} l -16 ${70 * crack} l 14 ${80 * crack}`} />
            <path d={`M ${RX + 20} ${FY + 200} l 14 ${70 * crack} l -18 ${50 * crack} l 16 ${90 * crack}`} />
          </g>
        )}
        {/* 割れのはじけ */}
        {brk > 0 && brk < 0.6 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - brk / 0.6}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const ang = (i / 6) * Math.PI * 2;
              return <line key={i} x1={960 + Math.cos(ang) * 60} y1={410 + Math.sin(ang) * 60} x2={960 + Math.cos(ang) * (110 + brk * 80)} y2={410 + Math.sin(ang) * (110 + brk * 80)} />;
            })}
          </g>
        )}        {/* 展示室の手前: 綱の仕切り (支柱と赤い綱) */}
        {[200, 960, 1720].map((sx) => (
          <g key={sx}>
            <rect x={sx - 10} y={880} width={20} height={130} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={sx} cy={878} r={16} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={sx} cy={1012} rx={46} ry={12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {[[200, 960], [960, 1720]].map(([a1, a2]) => (
          <path key={a1} d={`M ${a1} 890 Q ${(a1 + a2) / 2} ${950 + Math.sin(f / 10) * 4} ${a2} 890`} stroke={C.angerRed} strokeWidth={12} fill="none" />
        ))}
        {/* 大きな金の額 (2枚を1つに囲む) */}
        {outer > 0 && (
          <rect x={LX - bar - 20} y={FY - bar - 20} width={RX + RW - LX + 2 * bar + 40} height={FH + 2 * bar + 40}
            stroke={C.frameGold} fill="none" strokeWidth={18} opacity={outer}
            strokeDasharray={`${outer * 5400} 5400`} />
        )}
        <TagPlate x={510} y={762} text="映画" size={34} t={seg(f, 2, 10)} />
        <TagPlate x={1410} y={762} text="769年 奈良" size={34} t={seg(f, 6, 14)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #93 名前を奪うことは、正式な刑罰でした。
// 格: 図 / seed 4093
// 絵: 奈良時代の刑罰の巻物 (法典の巻物=世界) が机に広がり、「刑罰」の欄に、流罪の舟の絵・位を奪う冠の絵、そして**名札の絵**が並ぶ。f で名札の絵に朱の丸がつく。札「刑罰」
// どこ: 役所の黒い文机の上。法典の巻物が横に大きく広げられ、上端を真鍮の文鎮で押さえてある。机には硯・筆・灯明
// 演出: 巻物の「刑罰」の欄に3つの絵: 流罪の舟 (島へ流される) / 位を奪う冠 (冠が台から外される) / 名札 (名を奪う)。最後の名札の絵に朱の丸がぐるりとつく
// 動き: f0〜14 で右の軸がころがって巻物が開く → 3つの絵が順に浮かぶ (舟は波でゆれ、冠は台からずり落ちる) → f24〜38 で名札の絵に朱の丸が引かれる。カメラは左から右 (名札) へパン
const Nm093: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 0, 14));
  const ring = easeInOut(seg(f, 24, 38));
  const pan = lerp(40, -50, easeInOut(seg(f, 6, 42)));
  const rollX = lerp(560, 1800, open);
  const pv = (k: number) => seg(f, 10 + k * 4, 18 + k * 4);
  const slide = easeOut(seg(f, 16, 30));
  const boatBob = Math.sin(f / 7) * 6;
  const circ = 2 * Math.PI * 200;
  const panel = (x: number, k: number, children: React.ReactNode) => (
    <g opacity={pv(k)} transform={`translate(0 ${(1 - pv(k)) * 20})`}>
      <rect x={x} y={300} width={360} height={340} fill="none" stroke={C.scrollLine} strokeWidth={5} />
      {children}
    </g>
  );
  return (
    <Frame f={f} seed={4093} bg={C.deskDark}>
      <defs>
        <clipPath id="nd1b-093-open"><rect x={100} y={150} width={rollX - 100} height={640} /></clipPath>
      </defs>
      <g transform={`translate(${pan} 0)`}>
        {/* 黒い文机 */}
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.deskDark} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -80 ${40 + i * 120} q 500 ${rnd(4093, i) * 30 - 15} 1000 0 q 500 ${rnd(4094, i) * 30 - 15} 1060 0`} stroke="#4A3424" strokeWidth={5} fill="none" opacity={0.7} />
        ))}
        {/* 巻物の影 */}
        <rect x={110} y={166} width={rollX - 100} height={640} fill="#000000" opacity={0.25} />
        {/* 巻物 (開いた部分) */}
        <g clipPath="url(#nd1b-093-open)">
          <rect x={100} y={150} width={1720} height={640} fill={C.scrollPaper} stroke={KRP.ink} strokeWidth={6} />
          <rect x={100} y={150} width={1720} height={24} fill={C.sepia} opacity={0.5} />
          <rect x={100} y={766} width={1720} height={24} fill={C.sepia} opacity={0.5} />
          {/* 本文の行 (字の代わりの墨の点線・縦書き) */}
          {Array.from({ length: 6 }, (_, c) => (
            <g key={c}>
              {Array.from({ length: 9 }, (_, r) => (
                <rect key={r} x={180 + c * 52} y={330 + r * 44} width={14} height={20 + rnd(c, r) * 12} rx={4} fill={NP.sumi} opacity={0.55} />
              ))}
            </g>
          ))}
          <line x1={500} y1={290} x2={500} y2={720} stroke={C.scrollLine} strokeWidth={4} />
          {/* 1. 流罪の舟 */}
          {panel(540, 0, (
            <g>
              <ellipse cx={820} cy={410} rx={60} ry={24} fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 790 392 q 14 -40 30 -6 q 8 -24 20 2" fill={C.pineDark} stroke={KRP.ink} strokeWidth={3} />
              <g transform={`translate(${680 + slide * 40} ${520 + boatBob}) rotate(${Math.sin(f / 7) * 4})`}>
                <path d="M -80 0 L 80 0 L 56 34 L -56 34 Z" fill={C.woodBrown} stroke={KRP.ink} strokeWidth={5} />
                <line x1={0} y1={0} x2={0} y2={-110} stroke={KRP.ink} strokeWidth={6} />
                <path d="M 4 -104 L 64 -40 L 4 -30 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={-30} cy={-22} r={14} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={3} />
                <rect x={-42} y={-12} width={24} height={14} fill={C.kiyoCloth} />
              </g>
              <g stroke={C.seaBlue} strokeWidth={6} fill="none" strokeLinecap="round">
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M ${570 + ((f * 2 + i * 40) % 40)} ${570 + i * 22} q 25 -14 50 0 q 25 14 50 0 q 25 -14 50 0 q 25 14 50 0 q 25 -14 50 0`} />
                ))}
              </g>
            </g>
          ))}
          {/* 2. 位を奪う冠 */}
          {panel(960, 1, (
            <g>
              <rect x={1060} y={560} width={160} height={40} rx={6} fill={C.woodRed} stroke={KRP.ink} strokeWidth={5} />
              <rect x={1080} y={600} width={120} height={20} fill={C.woodRedDark} stroke={KRP.ink} strokeWidth={4} />
              <g transform={`translate(${1140 + slide * 46} ${480 + slide * 26}) rotate(${slide * 20})`}>
                <path d="M -70 60 Q -72 -10 0 -14 Q 72 -10 70 60 Z" fill="#141210" stroke={KRP.ink} strokeWidth={5} />
                <rect x={-26} y={-60} width={52} height={50} rx={14} fill="#141210" stroke={KRP.ink} strokeWidth={5} />
                <path d="M -60 40 Q 0 30 60 40" stroke={KRP.white} strokeWidth={5} opacity={0.35} fill="none" />
                <rect x={-72} y={46} width={144} height={14} rx={6} fill={C.woodRedDark} stroke={KRP.ink} strokeWidth={3} />
                <path d="M 10 -50 Q 60 -40 90 10" stroke="#141210" strokeWidth={14} fill="none" strokeLinecap="round" />
              </g>
              {slide > 0.1 && <path d="M 1100 420 q 60 -30 120 10" stroke={KRP.grayDark} strokeWidth={5} fill="none" strokeDasharray="8 8" />}
            </g>
          ))}
          {/* 3. 名札 (名を奪う) */}
          {panel(1380, 2, (
            <g transform={`rotate(${Math.sin(f / 12) * 2} 1560 470)`}>
              <path d="M 1560 360 L 1500 410 M 1560 360 L 1620 410" stroke={NP.sumi} strokeWidth={5} fill="none" />
              <circle cx={1560} cy={358} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              <rect x={1440} y={410} width={240} height={120} rx={16} fill={NP.wood} stroke={NP.sumi} strokeWidth={7} />
              <text x={1560} y={492} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={NP.sumi}>名</text>
              <path d="M 1470 560 q 90 30 180 0" stroke={NP.sumi} strokeWidth={5} fill="none" opacity={0.5} />
            </g>
          ))}
          {/* 朱の丸 */}
          <circle cx={1560} cy={470} r={200} fill="none" stroke={NP.mimi} strokeWidth={22} strokeLinecap="round"
            strokeDasharray={`${circ * ring} ${circ}`} transform="rotate(-100 1560 470)" opacity={ring > 0 ? 0.92 : 0} />
          {ring > 0.95 && [0, 1, 2].map((i) => (
            <circle key={i} cx={1740 + i * 18} cy={340 - i * 26} r={8 - i * 2} fill={NP.mimi} />
          ))}
        </g>
        {/* 左の軸 */}
        <rect x={70} y={130} width={50} height={680} rx={14} fill={C.woodRed} stroke={KRP.ink} strokeWidth={6} />
        <rect x={80} y={110} width={30} height={24} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={80} y={806} width={30} height={24} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 右の軸 (ころがって開く) */}
        <g>
          <rect x={rollX - 10} y={136} width={70} height={668} rx={22} fill={C.scrollPaper} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={rollX + 4 + ((i * 20 + f * 8) % 56)} y1={150} x2={rollX + 4 + ((i * 20 + f * 8) % 56)} y2={790} stroke={C.scrollLine} strokeWidth={3} />
          ))}
          <rect x={rollX + 8} y={110} width={34} height={26} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={rollX + 8} y={804} width={34} height={26} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 真鍮の文鎮 */}
        <rect x={560} y={128} width={300} height={34} rx={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} opacity={open > 0.4 ? 1 : 0} />
        <rect x={1100} y={128} width={300} height={34} rx={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} opacity={open > 0.8 ? 1 : 0} />
        {/* 硯・筆・灯明 (机の下側) */}
        <rect x={240} y={850} width={240} height={120} rx={18} fill="#2F2A2A" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={330} cy={895} rx={60} ry={24} fill={NP.sumi} />
        <ellipse cx={318} cy={888} rx={20} ry={6} fill="#FFFFFF" opacity={0.15} />
        <g transform="rotate(-8 900 900)">
          <rect x={620} y={890} width={420} height={22} rx={10} fill={C.brushBamboo} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1040 884 L 1110 901 L 1040 918 Z" fill={NP.mimi} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g>
          <ellipse cx={1620} cy={940} rx={70} ry={20} fill={C.woodBrownDark} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 1620 930 q ${-14 + Math.sin(f / 4) * 4} -34 0 -64 q 14 30 0 64`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={1620} cy={890} r={70} fill={NP.glow} opacity={0.2 + Math.sin(f / 5) * 0.05} />
        </g>
        {/* 札 */}
        <TagPlate x={300} y={240} text="刑罰" size={52} t={seg(f, 4, 12)} color={KRP.red} />
        <TagPlate x={720} y={700} text="流罪" size={34} t={pv(0)} />
        <TagPlate x={1140} y={700} text="位を奪う" size={34} t={pv(1)} />
        <TagPlate x={1560} y={700} text="名を奪う" size={34} t={pv(2)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_086: (f) => <Nm086 f={f} />,
  nm_087: (f) => <Nm087 f={f} />,
  nm_088: (f) => <Nm088 f={f} />,
  nm_089: (f) => <Nm089 f={f} />,
  nm_090: (f) => <Nm090 f={f} />,
  nm_091: (f) => <Nm091 f={f} />,
  nm_092: (f) => <Nm092 f={f} />,
  nm_093: (f) => <Nm093 f={f} />,
};

export const NM_D1B_MOTIFS: string[] = [
  "nm_086", // #86
  "nm_087", // #87
  "nm_088", // #88
  "nm_089", // #89
  "nm_090", // #90
  "nm_091", // #91
  "nm_092", // #92
  "nm_093", // #93
];

export const namaeD1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
