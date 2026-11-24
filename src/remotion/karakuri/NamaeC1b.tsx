// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#62〜#69 (8文)
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
  // 和紙・机
  washi: "#F1E6CC", washiShade: "#E2D3B1", washiFiber: "#CDBB93",
  desk: "#A4764A", deskDark: "#7A5130", deskGrain: "#8E6138",
  lacquer: "#2A2626", sumiStone: "#45403C",
  // 平安の夜の部屋
  wall: "#3A2E2A", wallDark: "#2A211E", pillar: "#5A4232",
  tatami: "#B9A66A", tatamiDark: "#9C8A52", heri: "#2F4A36",
  kouai: "#A14B6E", kouaiDark: "#7A3352", kasaneY: "#E8B04A", kasaneG: "#6E8F4E",
  hair: "#1E1A1A", flame: "#FFB648", lampGlow: "#FFD98A",
  // 月夜の庭
  night: "#1D2442", nightMid: "#2D3760", moon: "#F4E9C4", sand: "#8E93A8", sandDark: "#6E7390",
  misu: "#C8AE6E", misuDark: "#8E7642", rail: "#B8533A", railDark: "#8A3A26", inside: "#6A4B3A",
  noshi: "#4E5F8A", noshiDark: "#36456A", pine: "#2E4A3A",
  // 春の丘
  sky: "#D6E8EE", haze: "#F7F4EA", mtn: "#9FB3C2", mtnDark: "#7D93A6",
  hill: "#9CC67A", hillDark: "#79A65A", hillDeep: "#5E8A46",
  nanohana: "#F2D23C", petal: "#F4BFCB", petalDark: "#D98FA0",
  manWhite: "#E9E2CF", manWhiteDark: "#CFC6AE", girl: "#C77A4E", girlDark: "#9A5A36",
  basket: "#B88A4E", basketDark: "#86602F", blush: "#E77F8F", sakuraTrunk: "#6B4A3A",
  // 水引
  mizuRed: "#D3402E", mizuGold: "#D9B23C", mizuWhite: "#FDFBF7",
  // からくりの作業場
  peg: "#C9A77A", pegDark: "#A9875A", bench: "#B07A48", benchDark: "#7E5330",
  metal: "#9AA3AB", metalDark: "#6E767E", shield: "#C69A5E", shieldDark: "#946C38",
  omaRed: "#C2453A", omaBlue: "#3F5E96",
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

// 人物の頭の上書き (顔を見せない後ろ頭 / 控えめな横顔)。Person と同じ transform で重ねる
const NC1bHead: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number;
  mode: "back" | "profile"; dir?: 1 | -1; hairColor?: string; cloth?: string; children?: React.ReactNode;
}> = ({ x, y, s, f, phase = 0, lean = 0, mode, dir = -1, hairColor = C.hair, cloth, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {mode === "back" ? (
        <g>
          {/* 背中から見えない胸ポケットを服の色で消す */}
          {cloth && <rect x={13} y={-143} width={36} height={30} fill={cloth} />}
          {[-1, 1].map((sd) => (
            <ellipse key={sd} cx={sd * 64} cy={-220} rx={9} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <circle cx={0} cy={-228} r={66} fill={hairColor} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -40 -272 Q 0 -292 40 -272" stroke="#FFFFFF" strokeWidth={5} opacity={0.18} fill="none" />
          <path d="M 0 -294 L 0 -250" stroke="#000000" strokeWidth={3} opacity={0.25} />
          {children}
        </g>
      ) : (
        <g transform={`scale(${dir === -1 ? 1 : -1} 1)`}>
          <circle cx={0} cy={-228} r={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 鼻の小さなふくらみ */}
          <path d="M -64 -236 Q -77 -224 -64 -214" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {/* 伏し目 (表情は控えめ) */}
          <path d="M -46 -226 Q -38 -219 -30 -226" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M -42 -190 L -32 -190" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          {/* 髪 (後ろ半分と頭の上) */}
          <path d="M -54 -262 Q -10 -304 48 -278 Q 76 -250 66 -198 Q 58 -170 30 -166 Q 26 -198 12 -214 Q -20 -244 -54 -262 Z"
            fill={hairColor} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={12} cy={-214} rx={9} ry={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {children}
        </g>
      )}
    </g>
  );
};

// 菜の花ひと株
const NC1bNanohana: React.FC<{ x: number; y: number; s?: number; f: number; i: number }> = ({ x, y, s = 1, f, i }) => {
  const sw = Math.sin(f / 16 + i * 1.3) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sw})`}>
      <path d="M 0 0 Q -4 -40 0 -84" stroke={C.hillDeep} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 0 -30 Q -24 -42 -30 -26 Q -14 -18 0 -30 Z" fill={C.hillDark} stroke={KRP.ink} strokeWidth={2.5} />
      <path d="M 0 -48 Q 22 -60 28 -44 Q 12 -38 0 -48 Z" fill={C.hillDark} stroke={KRP.ink} strokeWidth={2.5} />
      {[[0, -94], [-13, -86], [13, -86], [-7, -104], [8, -105], [0, -114]].map(([px, py], k) => (
        <circle key={k} cx={px} cy={py} r={8} fill={C.nanohana} stroke={KRP.ink} strokeWidth={2.5} />
      ))}
    </g>
  );
};

// 桜の花びら (先に切れ込み)
const NC1bPetal: React.FC<{ x: number; y: number; r?: number; s?: number; o?: number }> = ({ x, y, r = 0, s = 1, o = 1 }) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}
    d="M 0 -7 L -3 -13 Q -12 -8 -9 3 Q -5 12 0 12 Q 5 12 9 3 Q 12 -8 3 -13 Z"
    fill={C.petal} stroke={KRP.ink} strokeWidth={2.2} />
);

// 檜扇 (ひおうぎ)。open = 片側の開き角 (度)
const NC1bFan: React.FC<{ x: number; y: number; s?: number; rot?: number; open?: number; f: number }> = ({ x, y, s = 1, rot = 0, open = 62, f }) => {
  const P = (a: number, r: number) => [r * Math.sin((a * Math.PI) / 180), -r * Math.cos((a * Math.PI) / 180)];
  const [ax, ay] = P(-open, 130);
  const [bx, by] = P(open, 130);
  const [cx, cy] = P(-open, 96);
  const [dx, dy] = P(open, 96);
  const n = 11;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      <path d={`M 0 0 L ${ax} ${ay} A 130 130 0 0 1 ${bx} ${by} Z`} fill="#F7EFD9" stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${cx} ${cy} A 96 96 0 0 1 ${dx} ${dy}`} stroke={C.kasaneG} strokeWidth={18} fill="none" />
      <path d={`M ${cx * 0.75} ${cy * 0.75} A 72 72 0 0 1 ${dx * 0.75} ${dy * 0.75}`} stroke={C.kouai} strokeWidth={10} fill="none" opacity={0.85} />
      {Array.from({ length: n }, (_, k) => {
        const a = -open + (2 * open * k) / (n - 1);
        const [px, py] = P(a, 130);
        return <line key={k} x1={0} y1={0} x2={px} y2={py} stroke={KRP.ink} strokeWidth={2} opacity={0.55} />;
      })}
      <circle cx={0} cy={0} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      {/* 両端の飾り糸 */}
      {[[ax, ay, -1], [bx, by, 1]].map(([px, py, sd], k) => (
        <g key={k}>
          {[C.mizuRed, C.kasaneY, C.kasaneG].map((col, j) => (
            <path key={j} d={`M ${px} ${py} q ${sd * (14 + j * 6)} ${40 + j * 8} ${sd * (8 + j * 4) + Math.sin(f / 10 + j) * 6} ${96 + j * 10}`}
              stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      ))}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #62 父の役職などにちなんだ、呼び名で呼ばれていたのです。
// 格: 図 / seed 4062
// 絵: 呼び名の作り方の図 (和紙の上=世界)。左に父親の役職の札「式部」(官職の札)、矢印で女性の呼び名「○式部」へ (○は空欄の四角)。父の冠と女性の扇の小さな絵。f で札がつながる。※特定の人名は書かない
// どこ: 文机の上に広げた大きな和紙。左上に硯、右上に筆、和紙は四隅を文鎮で押さえる
// 演出: 左に父の官職の札「式部」(上に父の冠の絵)。墨の矢印が伸び、「式部」の2文字が右の札へ写っていく。
//       右の札は娘の呼び名。いちばん上だけ空欄の四角 (誰の、は入らない)。横に娘の扇
// 動き: f2〜18 札が置かれる / f14〜28 墨の矢印 / f18〜34 2文字が弧を描いて写る / f34〜42 空欄が赤く点滅して出る。カメラはゆっくり寄る
const NC1bKanmuri: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const sway = Math.sin(f / 15) * 4;
  const ei = `M 30 -84 Q 112 -112 120 -40 Q ${126 + sway} 20 ${112 + sway} 70`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={14} rx={90} ry={14} fill={KRP.ink} opacity={0.15} />
      {/* 纓 (後ろに垂れる帯) */}
      <path d={ei} stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={ei} stroke={C.lacquer} strokeWidth={20} fill="none" strokeLinecap="round" />
      {/* 巾子 (こじ) */}
      <rect x={-6} y={-124} width={58} height={72} rx={24} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
      {/* 冠の本体 */}
      <path d="M -74 8 Q -78 -66 -6 -70 Q 66 -70 70 8 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
      <g stroke="#5A524C" strokeWidth={2} opacity={0.7}>
        {[-48, -28, -8, 12, 32, 50].map((k) => <line key={k} x1={k} y1={-56} x2={k + 6} y2={-4} />)}
      </g>
      <path d="M -74 0 L 70 0" stroke={KRP.ink} strokeWidth={6} />
      <path d="M -50 -46 Q -10 -62 30 -52" stroke="#FFFFFF" strokeWidth={5} opacity={0.3} fill="none" />
    </g>
  );
};
const NC1bTatefuda: React.FC<{ x: number; y: number; w: number; h: number; t: number; rot?: number; children?: React.ReactNode }> = ({ x, y, w, h, t, rot = 0, children }) => {
  if (t <= 0) return null;
  const drop = (1 - easeOut(t)) * -60;
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${rot})`} opacity={clamp01(t * 2)}>
      <rect x={-w / 2 + 10} y={-h / 2 + 12} width={w} height={h} rx={14} fill={KRP.ink} opacity={0.18} />
      {/* 上が山形の立て札 */}
      <path d={`M ${-w / 2} ${-h / 2 + 30} L 0 ${-h / 2 - 10} L ${w / 2} ${-h / 2 + 30} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`}
        fill={NP.wood} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-w / 2 + 16} y={-h / 2 + 40} width={w - 32} height={h - 56} rx={6} fill="none" stroke={NP.woodDark} strokeWidth={3} opacity={0.7} />
      <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.6}>
        <path d={`M ${-w / 2 + 30} ${-h / 2 + 60} q 10 ${h * 0.3} -4 ${h * 0.6}`} />
        <path d={`M ${w / 2 - 34} ${-h / 2 + 80} q -12 ${h * 0.25} 4 ${h * 0.55}`} />
      </g>
      <circle cx={0} cy={-h / 2 + 18} r={9} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      {children}
    </g>
  );
};
const Nm062: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.05, cam);
  const tL = seg(f, 2, 12);
  const tR = seg(f, 8, 18);
  const arrowT = easeOut(seg(f, 14, 28));
  const fly = easeInOut(seg(f, 18, 34));
  const land = seg(f, 30, 36);
  const boxT = seg(f, 34, 42);
  const blinkBox = boxT > 0 ? 0.6 + 0.4 * Math.abs(Math.sin(f / 4)) : 0;
  const LX = 560, RX = 1360;
  const chars: [string, number, number][] = [["式", 420, 470], ["部", 580, 610]];
  const arrowLen = 520;
  return (
    <Frame f={f} seed={4062}>
      {/* 机の天板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.desk} />
      <g stroke={C.deskGrain} strokeWidth={5} opacity={0.55} fill="none">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -20 ${40 + i * 140} q 480 ${rnd(62, i) * 40 - 20} 980 0 q 480 ${rnd(63, i) * 40 - 20} 980 0`} />
        ))}
      </g>
      <g transform={`translate(960 520) scale(${sc}) translate(-960 -520)`}>
        {/* 和紙 (四辺がけば立つ) */}
        <g transform="rotate(-0.8 960 520)">
          <rect x={150} y={96} width={1620} height={800} rx={4} fill={KRP.ink} opacity={0.2} transform="translate(12 14)" />
          <path d={`M 150 96 ${Array.from({ length: 28 }, (_, i) => `L ${150 + (i + 1) * 58} ${96 + (rnd(620, i) - 0.5) * 8}`).join(" ")} L 1770 896 ${Array.from({ length: 28 }, (_, i) => `L ${1770 - (i + 1) * 58} ${896 + (rnd(621, i) - 0.5) * 8}`).join(" ")} Z`}
            fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.washiFiber} strokeWidth={2.5} opacity={0.7} strokeLinecap="round">
            {Array.from({ length: 70 }, (_, i) => {
              const fx = 190 + rnd(64, i) * 1540, fy = 130 + rnd(65, i) * 730, a = rnd(66, i) * 6.28;
              return <line key={i} x1={fx} y1={fy} x2={fx + Math.cos(a) * 26} y2={fy + Math.sin(a) * 12} />;
            })}
          </g>
          {/* 文鎮 (四隅) */}
          {[[260, 120], [1660, 118], [262, 872], [1658, 874]].map(([bx, by], i) => (
            <g key={i}>
              <rect x={bx - 70} y={by - 16} width={140} height={32} rx={8} fill={C.sumiStone} stroke={KRP.ink} strokeWidth={4} />
              <rect x={bx - 60} y={by - 12} width={120} height={8} rx={4} fill="#FFFFFF" opacity={0.18} />
            </g>
          ))}
        </g>
        {/* 父の冠 (左の札の左上) */}
        <g opacity={clamp01(tL * 2)}>
          {/* 父 (後ろ姿の胸から上) に冠 */}
          <path d="M 196 600 Q 200 500 296 492 Q 392 500 396 600 Z" fill={C.noshi} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 262 494 L 296 540 L 330 494" stroke={C.noshiDark} strokeWidth={6} fill="none" />
          <circle cx={296} cy={428} r={70} fill={C.hair} stroke={KRP.ink} strokeWidth={5} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={296 + sd * 70} cy={436} rx={10} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          <NC1bKanmuri x={300} y={392} s={1.0} f={f} />
        </g>
        {/* 左: 父の官職の札 */}
        <NC1bTatefuda x={LX} y={465} w={240} h={470} t={tL}>
          {chars.map(([ch, , by]) => (
            <text key={ch} x={0} y={by - 465 - 20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={NP.sumi}>{ch}</text>
          ))}
        </NC1bTatefuda>
        {/* 墨の矢印 (筆で引いたかすれ線) */}
        <path d={`M 720 465 Q 960 395 ${720 + arrowLen} 465`} stroke={NP.sumi} strokeWidth={18} fill="none" strokeLinecap="round"
          strokeDasharray={`${arrowT * 600} 900`} />
        <path d={`M 720 459 Q 960 389 ${720 + arrowLen} 459`} stroke={C.washi} strokeWidth={3} fill="none" strokeDasharray="20 34" opacity={0.6}
          strokeDashoffset={0} style={{ display: arrowT > 0.05 ? undefined : "none" }} />
        <Arrow x={1252} y={470} s={0.8} rot={8} t={seg(f, 24, 30)} />
        {/* 右: 娘の呼び名の札 */}
        <NC1bTatefuda x={RX} y={440} w={240} h={530} t={tR}>
          {/* いちばん上は空欄の四角 */}
          <rect x={-52} y={-200} width={104} height={104} rx={6} fill={boxT > 0 ? "#FFF4EE" : "none"}
            stroke={KRP.red} strokeWidth={7} strokeDasharray="16 10" opacity={boxT > 0 ? blinkBox * pop(boxT) : 0.25} />
          {chars.map(([ch], i) => (
            <text key={ch} x={0} y={(i === 0 ? 470 : 610) - 440} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}
              fill={NP.sumi} opacity={land}>{ch}</text>
          ))}
        </NC1bTatefuda>
        {/* 写っていく途中の2文字 */}
        {fly > 0 && land < 1 && chars.map(([ch, , ly], i) => {
          const sx = LX, sy = ly - 20, ex = RX, ey = i === 0 ? 470 : 610;
          const px = lerp(sx, ex, fly), py = lerp(sy, ey, fly) - Math.sin(fly * Math.PI) * (180 - i * 40);
          return (
            <text key={ch} x={px} y={py} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120 * (0.85 + 0.15 * Math.cos(fly * Math.PI * 2))}
              fill={NP.sumi} opacity={0.85 * (1 - land)} transform={`rotate(${Math.sin(fly * Math.PI) * (i ? -10 : 10)} ${px} ${py})`}>{ch}</text>
          );
        })}
        {/* 娘の扇 (右の札の右上) */}
        <g opacity={clamp01(tR * 2)}>
          <NC1bFan x={1630} y={420} s={1.05} rot={14 + Math.sin(f / 13) * 3} f={f} />
        </g>
        {/* 札の名前 */}
        <TagPlate x={LX} y={772} text="父の役職" size={34} t={seg(f, 10, 18)} />
        <TagPlate x={RX} y={772} text="娘の呼び名" size={34} t={seg(f, 16, 24)} />
      </g>
      {/* 机の上の道具: 硯と筆 (端に) */}
      <g transform="translate(70 960) rotate(-8)">
        <rect x={-90} y={-70} width={200} height={150} rx={18} fill={C.sumiStone} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={10} cy={-20} rx={60} ry={30} fill={KRP.ink} />
        <ellipse cx={-6} cy={-28} rx={20} ry={8} fill="#FFFFFF" opacity={0.2} />
      </g>
      <g transform={`translate(1840 ${70 + Math.sin(f / 20) * 2}) rotate(58)`}>
        <rect x={-14} y={-180} width={28} height={260} rx={10} fill="#9C6B3E" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -14 80 Q 0 150 14 80 Z" fill={NP.sumi} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #63 そのため、あの紫式部でさえ、本名は分かっていません。
// 格: 山 / seed 4063
// 絵: 文机に向かって筆を走らせる女性の**後ろ姿** (紫式部・顔は見せない)。机の上に積まれた物語の冊子。灯台 (油の明かり) が揺れる。彼女の背中の上に名札が浮かび、**字の部分が空白** (`Nafuda` は使わず、ここは自作の白い札でよい)。`QMark` が札の上にぽん
// どこ: 平安の夜の部屋。上に御簾、左に几帳、畳。右に灯台 (油の火)。文机の上に紙と、物語の冊子の山
// 演出: 文机に向かう女性を斜め後ろから。長い黒髪が背中から床へ流れ、袿の重ね色が裾に見える。顔は見せない。
//       背中の上に白い札が浮かぶが、字の場所は空白。札の角に「？」がぽん
// 動き: 筆を持つ手が小さく動き、紙に墨の行が増えていく / 灯の火がゆらぎ、壁の影が伸び縮み /
//       f14〜26 札が浮かぶ / f26〜34 ？ / カメラはゆっくり寄る
const Nm063: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.05, cam);
  const flick = 1 + Math.sin(f * 0.9) * 0.06 + Math.sin(f * 2.3) * 0.03;
  const wx = Math.sin(f / 5) * 7;
  const lines = Math.floor(lerp(2, 9, seg(f, 0, 40)));
  const plateT = seg(f, 14, 26);
  const qT = seg(f, 26, 34);
  const PX = 760, PY = 820, PS = 1.5;
  const books = [C.kouai, C.washi, C.kasaneG, C.misu, C.kouaiDark, C.washi, C.kasaneY];
  return (
    <Frame f={f} seed={4063} bg={C.wall} dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wall} />
      <g transform={`translate(800 500) scale(${sc}) translate(-800 -500)`}>
        {/* 壁の板と柱・長押 */}
        <g stroke={C.wallDark} strokeWidth={4} opacity={0.7}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={180} x2={i * 150} y2={650} />)}
        </g>
        <rect x={-20} y={230} width={W + 40} height={34} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />
        {[110, 1820].map((px) => <rect key={px} x={px - 34} y={150} width={68} height={520} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 灯に照らされた壁の影 (火のゆらぎで伸び縮み) */}
        <g transform={`translate(470 650) scale(${flick * 1.25} ${flick * 1.3})`} fill={C.wallDark} opacity={0.75}>
          <circle cx={0} cy={-330} r={90} />
          <ellipse cx={-10} cy={-120} rx={230} ry={240} />
        </g>
        {/* 畳 */}
        <rect x={-20} y={650} width={W + 40} height={460} fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.8}>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-20} y1={664 + i * 26} x2={W + 20} y2={664 + i * 26} />)}
        </g>
        <g fill={C.heri} stroke={KRP.ink} strokeWidth={3}>
          <rect x={-20} y={650} width={W + 40} height={20} />
          <polygon points="560,670 590,670 380,1100 340,1100" />
          <polygon points="1360,670 1390,670 1620,1100 1580,1100" />
        </g>
        {/* 几帳 (左) */}
        <g>
          {[70, 340].map((px) => <rect key={px} x={px - 9} y={250} width={18} height={600} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />)}
          <rect x={50} y={246} width={310} height={18} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((k) => {
            const sw = Math.sin(f / 18 + k) * 6;
            const x0 = 84 + k * 86;
            return (
              <g key={k}>
                <path d={`M ${x0} 264 L ${x0 + 84} 264 L ${x0 + 86 + sw} 800 L ${x0 + 2 + sw} 800 Z`}
                  fill={k === 1 ? C.kouai : C.kasaneG} stroke={KRP.ink} strokeWidth={4} />
                <path d={`M ${x0 + 42} 264 L ${x0 + 44 + sw} 800`} stroke={k === 1 ? C.kasaneY : C.washi} strokeWidth={8} />
                <path d={`M ${x0 + 42} 280 q ${8 + sw} 200 ${sw} 560`} stroke={C.mizuRed} strokeWidth={4} fill="none" />
              </g>
            );
          })}
        </g>
        {/* 灯台 (右) */}
        <g>
          <ellipse cx={1660} cy={842} rx={74} ry={18} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1651} y={380} width={18} height={462} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={1660} cy={376} rx={54} ry={12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1660 372 L 1690 364" stroke={KRP.white} strokeWidth={4} />
          <g transform={`translate(1690 362) scale(${1 / flick} ${flick * 1.08})`}>
            <path d="M 0 0 Q -20 -24 0 -66 Q 20 -24 0 0 Z" fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 0 -4 Q -8 -18 0 -38 Q 8 -18 0 -4 Z" fill={NP.glowCore} />
          </g>
        </g>
        {/* 文机 */}
        <g>
          <polygon points="1000,566 1470,566 1500,612 970,612" fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={970} y={612} width={530} height={22} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 970 634 L 1500 634" stroke={NP.brass} strokeWidth={3} opacity={0.7} />
          {[995, 1475].map((lx) => <path key={lx} d={`M ${lx} 634 Q ${lx + (lx < 1200 ? -18 : 18)} 690 ${lx} 740`} stroke={C.lacquer} strokeWidth={18} fill="none" />)}
          {/* 紙と、増えていく墨の行 */}
          <polygon points="1050,572 1290,572 1304,606 1036,606" fill={C.washi} stroke={KRP.ink} strokeWidth={3} />
          <g stroke={NP.sumi} strokeWidth={3} strokeLinecap="round">
            {Array.from({ length: lines }, (_, i) => {
              const lx = 1276 - i * 24;
              return <path key={i} d={`M ${lx} 578 q 3 6 -1 12 q 3 6 0 12`} fill="none" />;
            })}
          </g>
          {/* 硯 */}
          <rect x={1020} y={584} width={30} height={16} rx={4} fill={C.sumiStone} stroke={KRP.ink} strokeWidth={3} />
          {/* 物語の冊子の山 */}
          {books.map((col, i) => (
            <g key={i} transform={`translate(${1395 + (rnd(631, i) - 0.5) * 16} ${592 - i * 18})`}>
              <rect x={-78} y={-16} width={156} height={18} rx={3} fill={col} stroke={KRP.ink} strokeWidth={3.5} />
              {[-62, -52, -42].map((dx) => <circle key={dx} cx={dx} cy={-7} r={2.4} fill={KRP.ink} />)}
            </g>
          ))}
        </g>
        {/* 床に置いた冊子 */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${1240 + i * 6} ${800 - i * 16}) rotate(${-4 + i * 3})`}>
            <rect x={-90} y={-16} width={180} height={18} rx={3} fill={[C.kasaneG, C.washi, C.kouai][i]} stroke={KRP.ink} strokeWidth={3.5} />
            {[-74, -64, -54].map((dx) => <circle key={dx} cx={dx} cy={-7} r={2.4} fill={KRP.ink} />)}
          </g>
        ))}
        {/* 女性 (後ろ姿)。体 → 袿 → 髪 → 袖 の順に重ねる */}
        <Person x={PX} y={PY} s={PS} f={f} cloth={C.kouai} clothDark={C.kouaiDark} hair="none" still />
        {/* 床に広がる袿 (重ね色) */}
        <path d="M 590 680 Q 520 790 400 872 L 1110 872 Q 1000 790 940 680 Z" fill={C.kasaneG} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 598 676 Q 532 786 420 858 L 1090 858 Q 990 786 932 676 Z" fill={C.kasaneY} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 606 672 Q 546 780 442 842 L 1068 842 Q 978 780 924 672 Z" fill={C.kouai} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.kouaiDark} strokeWidth={4} fill="none" opacity={0.7}>
          <path d="M 660 700 Q 620 780 560 830" /><path d="M 870 700 Q 910 780 960 830" />
        </g>
        {/* 左の袖 (垂れる) */}
        <path d="M 690 590 Q 600 630 586 770 Q 640 800 706 772 Q 704 680 712 610 Z" fill={C.kouai} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 586 770 Q 640 800 706 772" stroke={C.kasaneY} strokeWidth={8} fill="none" />
        {/* 長い黒髪 (背中から床へ) */}
        <path d="M 698 470 Q 674 640 690 760 Q 690 840 640 884 L 830 884 Q 842 840 836 760 Q 848 640 822 470 Z" fill={C.hair} stroke={KRP.ink} strokeWidth={5} />
        <g stroke="#FFFFFF" strokeWidth={3} opacity={0.14} fill="none">
          <path d="M 730 520 Q 720 680 730 840" /><path d="M 790 520 Q 800 680 790 840" />
        </g>
        <NC1bHead x={PX} y={PY} s={PS} f={0} mode="back" />
        {/* 右の袖 (机へ伸びて筆を持つ) */}
        <path d={`M 836 586 Q 960 556 ${1092 + wx} 574 L ${1100 + wx} 606 Q 1000 640 962 700 Q 900 722 850 690 Z`} fill={C.kouai} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${1092 + wx} 574 L ${1100 + wx} 606`} stroke={C.kasaneY} strokeWidth={9} />
        <g transform={`translate(${1112 + wx} ${588 + Math.cos(f / 5) * 2})`}>
          <line x1={-14} y1={-46} x2={10} y2={18} stroke="#9C6B3E" strokeWidth={8} strokeLinecap="round" />
          <path d="M 6 10 L 14 30 L 16 10 Z" fill={NP.sumi} />
          <circle cx={0} cy={0} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 灯の光 */}
        <g opacity={0.9}>
          <circle cx={1690} cy={330} r={320 * flick} fill={C.lampGlow} opacity={0.04} />
          <circle cx={1690} cy={330} r={170 * flick} fill={C.lampGlow} opacity={0.08} />
          <circle cx={1690} cy={330} r={70 * flick} fill={C.lampGlow} opacity={0.22} />
        </g>
        {/* 御簾 (上) */}
        <rect x={-20} y={-20} width={W + 40} height={210} fill={C.misu} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.misuDark} strokeWidth={2.5}>
          {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-20} y1={4 + i * 8} x2={W + 20} y2={4 + i * 8} />)}
        </g>
        <rect x={-20} y={184} width={W + 40} height={14} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />
        {[560, 1300].map((tx, i) => {
          const sw = Math.sin(f / 14 + i) * 4;
          return (
            <g key={tx}>
              <path d={`M ${tx} 198 q ${sw} 40 ${sw * 1.5} 70`} stroke={C.mizuRed} strokeWidth={6} fill="none" />
              <path d={`M ${tx + sw * 1.5 - 12} 266 L ${tx + sw * 1.5 + 12} 266 L ${tx + sw * 1.5 + 18} 320 L ${tx + sw * 1.5 - 18} 320 Z`} fill={C.mizuRed} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          );
        })}
      </g>
      {/* 背中の上に浮かぶ、字のない札 */}
      {plateT > 0 && (
        <g transform={`translate(760 ${292 + Math.sin(f / 12) * 6}) scale(${pop(plateT)}) rotate(${Math.sin(f / 17) * 2})`}>
          <circle cx={0} cy={0} r={210} fill={NP.glow} opacity={0.06} />
          <rect x={-172} y={-72} width={360} height={160} rx={18} fill={KRP.ink} opacity={0.25} />
          <rect x={-180} y={-80} width={360} height={160} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-150} y={-50} width={300} height={100} rx={8} fill="none" stroke={KRP.gray} strokeWidth={4} strokeDasharray="14 12" />
        </g>
      )}
      <QMark x={950} y={250} s={0.95} f={f} t={qT} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #64 名前を知られることには、特別な意味がありました。
// 格: 並 / seed 4064
// 絵: 平安の庭先で、男性が御簾越しに何かをたずねる (後ろ姿)。御簾の内側の女性が扇で口元を隠す。2人のあいだに小さな札が浮かび、まだ裏返し (字は見えない)。月夜
// どこ: 月夜の平安の庭。左上に満月と雲、松。白砂の庭と飛び石、池に映る月。右は屋敷の縁側 (朱の高欄) と御簾
// 演出: 烏帽子の男性 (後ろ姿) が御簾に向かって手をさしのべ、たずねる。御簾の向こうの女性は檜扇で口元を隠す。
//       2人のあいだに小さな札が浮かぶが、裏を向いたまま (字は見えない)。くるりと返りかけて、また裏に戻る
// 動き: 男の声の波が御簾へ / f10〜22 札が浮かぶ / 札が返りかけて戻る / 雲が月をよぎる・池の月がゆれる / カメラは右へゆっくり
const NC1bEboshi: React.FC = () => (
  <g>
    <path d="M -50 -268 Q -58 -340 -14 -366 Q 30 -376 46 -344 Q 58 -310 52 -268 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -30 -300 Q -22 -340 10 -352" stroke="#FFFFFF" strokeWidth={4} opacity={0.22} fill="none" />
    <path d="M -50 -276 Q 0 -262 52 -276" stroke={KRP.ink} strokeWidth={4} fill="none" />
  </g>
);
const Nm064: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const panX = lerp(30, -30, cam);
  const plateT = seg(f, 10, 22);
  // 返りかけて戻る (裏のまま): 幅だけ細くなって、また戻る
  const flipK = 0.25 + 0.75 * Math.abs(Math.cos((seg(f, 22, 40) * Math.PI) + f / 30));
  const cloudX = lerp(-40, 120, clamp01(f / 60));
  return (
    <Frame f={f} seed={4064} bg={C.night} dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} />
      <g transform={`translate(${panX} 0)`}>
        {/* 空の星 */}
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={rnd(641, i) * 1100 - 40} cy={30 + rnd(642, i) * 360} r={2 + rnd(643, i) * 2.5}
            fill={C.moon} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
        ))}
        {/* 満月と雲 */}
        <circle cx={300} cy={200} r={170} fill={C.moon} opacity={0.12} />
        <circle cx={300} cy={200} r={96} fill={C.moon} stroke={KRP.ink} strokeWidth={5} />
        <g fill="#E3D7AE" opacity={0.6}><circle cx={270} cy={180} r={16} /><circle cx={330} cy={230} r={10} /><circle cx={310} cy={160} r={8} /></g>
        <g transform={`translate(${cloudX} 0)`}>
          <path d="M 120 250 Q 150 214 200 228 Q 230 196 280 216 Q 330 200 350 236 Q 390 240 380 268 L 120 268 Z" fill={C.nightMid} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
        </g>
        {/* 遠くの透垣と松 */}
        <rect x={-60} y={470} width={1140} height={90} fill={C.nightMid} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-40 + i * 56} y1={474} x2={-40 + i * 56 + 28} y2={556} />)}
        </g>
        <g transform={`translate(780 470) rotate(${Math.sin(f / 30) * 1})`}>
          <path d="M 0 0 Q -10 -120 20 -230" stroke={C.wallDark} strokeWidth={26} fill="none" strokeLinecap="round" />
          {[[-60, -150, 110], [80, -200, 120], [10, -270, 100]].map(([cx, cy, rx], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={36} fill={C.pine} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 白砂の庭 (月明かり) と砂紋 */}
        <rect x={-60} y={556} width={2100} height={560} fill={C.sand} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={C.sandDark} strokeWidth={3} fill="none" opacity={0.8}>
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -60 ${590 + i * 34} q 300 -10 600 0 q 300 10 600 0`} />)}
        </g>
        {/* 池と、ゆれる月の影 */}
        <ellipse cx={180} cy={900} rx={300} ry={90} fill={C.nightMid} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={200 + Math.sin(f / 7 + i) * 8} cy={880 + i * 14} rx={50 - i * 12} ry={6} fill={C.moon} opacity={0.7 - i * 0.15} />
        ))}
        {/* 飛び石 */}
        {[[360, 700], [470, 760], [700, 690], [860, 640]].map(([sx, sy], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx={60} ry={18} fill={C.mtnDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 屋敷: 軒・縁側・高欄・御簾 */}
        <polygon points="1000,0 1980,0 1980,110 1040,110" fill={C.wallDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={3}>{Array.from({ length: 14 }, (_, i) => <rect key={i} x={1050 + i * 68} y={92} width={30} height={22} fill={C.pillar} />)}</g>
        <rect x={1040} y={110} width={960} height={530} fill={C.inside} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1650} cy={300} r={220} fill={C.lampGlow} opacity={0.06} />
        {/* 御簾の向こうの女性 (檜扇で口元を隠す) */}
        <g opacity={0.92}>
          <path d="M 1340 300 Q 1310 420 1300 600 L 1460 600 Q 1450 420 1420 300 Z" fill={C.hair} stroke={KRP.ink} strokeWidth={4} />
          <Person x={1380} y={640} s={1.25} f={f} cloth={C.kouai} clothDark={C.kouaiDark} hair="none" gaze={[-6, 2]} phase={2} />
          <path d="M 1306 330 Q 1300 280 1380 262 Q 1460 280 1454 330 Q 1420 296 1380 296 Q 1340 296 1306 330 Z" fill={C.hair} />
          <path d="M 1312 330 Q 1300 420 1314 470" stroke={C.hair} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M 1448 330 Q 1460 420 1446 470" stroke={C.hair} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M 1340 445 L 1380 480 L 1420 445" stroke={C.kasaneY} strokeWidth={8} fill="none" />
          <path d="M 1346 452 L 1380 488 L 1414 452" stroke={C.kasaneG} strokeWidth={6} fill="none" />
          <NC1bFan x={1372} y={420} s={0.62} rot={-8 + Math.sin(f / 16) * 2} open={58} f={f} />
          <circle cx={1372} cy={428} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 御簾の簾 (手前にかかる) */}
        <rect x={1060} y={120} width={820} height={440} fill={C.misu} opacity={0.42} />
        <g stroke={C.misuDark} strokeWidth={2.4} opacity={0.9}>
          {Array.from({ length: 54 }, (_, i) => <line key={i} x1={1060} y1={128 + i * 8} x2={1880} y2={128 + i * 8} />)}
        </g>
        <rect x={1060} y={116} width={820} height={34} fill={C.noshi} stroke={KRP.ink} strokeWidth={4} />
        <g fill={C.kasaneY}>{Array.from({ length: 10 }, (_, i) => <circle key={i} cx={1100 + i * 82} cy={133} r={7} />)}</g>
        {[1060, 1880].map((bx) => <rect key={bx} x={bx - 8} y={116} width={16} height={448} fill={C.noshi} stroke={KRP.ink} strokeWidth={3} />)}
        <path d={`M 1240 150 q ${Math.sin(f / 12) * 5} 60 0 120`} stroke={C.mizuRed} strokeWidth={6} fill="none" />
        {/* 縁側と朱の高欄 */}
        <rect x={1020} y={600} width={980} height={50} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1020} y={650} width={980} height={200} fill={C.wallDark} stroke={KRP.ink} strokeWidth={4} />
        {[1080, 1400, 1720].map((px) => <rect key={px} x={px - 14} y={650} width={28} height={220} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={1020} y={548} width={980} height={16} fill={C.rail} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1020} y={580} width={980} height={12} fill={C.rail} stroke={KRP.ink} strokeWidth={3.5} />
        {[1040, 1260, 1480, 1700, 1920].map((px) => <rect key={px} x={px - 10} y={530} width={20} height={72} fill={C.railDark} stroke={KRP.ink} strokeWidth={3.5} />)}
        {/* 男性 (後ろ姿・烏帽子)。御簾に手をさしのべる */}
        <Person x={600} y={930} s={1.55} f={f} cloth={C.noshi} clothDark={C.noshiDark} hair="none" pose="point" pointDir={1} phase={1} />
        <NC1bHead x={600} y={930} s={1.55} f={f} phase={1} mode="back" cloth={C.noshi}><NC1bEboshi /></NC1bHead>
        {/* 声の波 */}
        {[0, 1, 2].map((i) => {
          const u = ((f / 30 + i / 3) % 1);
          const on = seg(f, 4 + i * 4, 10 + i * 4);
          return (
            <path key={i} d={`M ${760 + u * 320} ${520 - 40} q 22 40 0 80`} stroke={C.moon} strokeWidth={6} fill="none" strokeLinecap="round"
              opacity={on * (1 - u) * 0.85} />
          );
        })}
      </g>
      {/* 2人のあいだの札 (裏を向いたまま) */}
      {plateT > 0 && (
        <g transform={`translate(900 ${330 + Math.sin(f / 11) * 8}) scale(${pop(plateT) * flipK * 1.15} ${pop(plateT) * 1.15})`}>
          <circle cx={0} cy={0} r={110} fill={C.moon} opacity={0.08} />
          <rect x={-100} y={-62} width={200} height={124} rx={14} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={NP.woodMid} strokeWidth={3} fill="none" opacity={0.8}>
            <path d="M -86 -30 q 50 -10 90 0 q 40 10 80 -2" /><path d="M -86 10 q 60 10 100 0 q 40 -8 70 4" /><path d="M -70 40 q 40 -6 80 0" />
          </g>
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #65 万葉集のいちばん最初の歌は、雄略天皇の歌として伝わる、こんな歌です。
// 格: 山 / seed 4065
// 絵: 古い巻物が f で机の上に広がっていく (巻物の軸・紐・料紙の模様まで)。巻物の冒頭に、歌の行 (読めない万葉仮名風の波線) と、絵の部分に春の丘の風景。札「万葉集」「巻のいちばん最初」
// どこ: 書見台がわりの古い机の上 (真上寄り)。左下に硯、右上に湯呑み。桜の花びらが数枚
// 演出: 古い巻物が右から左へ広がっていく (巻物は右が始まり)。右端に錦の表紙・八双・紐。
//       料紙には金の切箔と雲母の雲。始まりの行は読めない万葉仮名風の筆の線、その左に春の丘の絵
// 動き: f4〜34 軸が転がって左へ (縞が回る) / 紐がゆれる / f30〜40 札「万葉集」「巻のいちばん最初」と矢印 / カメラは軸を追って少しパン
const Nm065: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeInOut(seg(f, 4, 34));
  const RX = lerp(1560, 300, roll);
  const panX = lerp(-60, 30, roll);
  const sc = lerp(1.04, 1.0, roll);
  const T = 300, B = 760;
  const cols = [1500, 1446, 1392, 1338, 1284, 1230, 1176, 1122];
  const colPath = (x: number, k: number) => {
    const len = 260 + rnd(651, k) * 140;
    let d = `M ${x} 360`;
    for (let j = 1; j <= 12; j++) {
      const yy = 360 + (len * j) / 12;
      d += ` Q ${x + (j % 2 ? 14 : -14) + rnd(652, k * 20 + j) * 6} ${yy - len / 24} ${x + (rnd(653, k * 20 + j) - 0.5) * 8} ${yy}`;
    }
    return d;
  };
  return (
    <Frame f={f} seed={4065}>
      {/* 机の天板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.deskDark} />
      <g transform={`translate(${960 + panX} 540) scale(${sc}) translate(-960 -540)`}>
        <rect x={-120} y={60} width={2160} height={1000} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.deskGrain} strokeWidth={5} opacity={0.55} fill="none">
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M -120 ${110 + i * 140} q 520 ${rnd(654, i) * 40 - 20} 1080 0 q 520 ${rnd(655, i) * 40 - 20} 1080 0`} />
          ))}
        </g>
        {/* 硯と筆 */}
        <g transform="translate(150 880) rotate(-6)">
          <rect x={-100} y={-60} width={210} height={130} rx={16} fill={C.sumiStone} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={10} cy={-14} rx={64} ry={28} fill={KRP.ink} />
          <rect x={130} y={-40} width={26} height={220} rx={10} fill="#9C6B3E" stroke={KRP.ink} strokeWidth={4} transform="rotate(-70 130 -40)" />
        </g>
        {/* 湯呑み */}
        <g transform="translate(1800 150)">
          <ellipse cx={0} cy={30} rx={70} ry={24} fill={KRP.ink} opacity={0.2} />
          <circle cx={0} cy={0} r={62} fill={C.mtnDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={0} r={46} fill="#8E9B6A" stroke={KRP.ink} strokeWidth={3} />
          <path d={`M -10 -60 q ${Math.sin(f / 8) * 8} -30 0 -60`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.5} />
        </g>
        {/* 巻物の影 */}
        <rect x={RX} y={T + 14} width={1820 - RX + 10} height={B - T} fill={KRP.ink} opacity={0.18} />
        {/* 広がった料紙 (軸の位置から右だけ見える) */}
        <defs>
          <clipPath id="nc1b65clip"><rect x={RX} y={T - 10} width={1700} height={B - T + 20} /></clipPath>
        </defs>
        <g clipPath="url(#nc1b65clip)">
          <rect x={250} y={T} width={1400} height={B - T} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          {/* 雲母の雲 */}
          <g fill={KRP.white} opacity={0.5}>
            {[[1300, 420], [900, 640], [560, 400], [1500, 680]].map(([cx, cy], i) => (
              <path key={i} d={`M ${cx - 120} ${cy} q 40 -40 90 -10 q 40 -30 80 0 q 50 -10 70 20 Z`} />
            ))}
          </g>
          {/* 金の切箔 */}
          {Array.from({ length: 46 }, (_, i) => (
            <rect key={i} x={260 + rnd(656, i) * 1380} y={T + 10 + rnd(657, i) * (B - T - 20)} width={6 + rnd(658, i) * 8} height={6 + rnd(659, i) * 8}
              fill={KRP.gold} stroke={NP.brassDark} strokeWidth={1.5} transform={`rotate(${rnd(660, i) * 90} ${260 + rnd(656, i) * 1380} ${T + 10 + rnd(657, i) * (B - T - 20)})`} />
          ))}
          {/* 界線 */}
          <g stroke={NP.brassDark} strokeWidth={3} opacity={0.75}>
            <line x1={250} y1={T + 30} x2={1650} y2={T + 30} />
            <line x1={250} y1={B - 30} x2={1650} y2={B - 30} />
            {[1580, ...cols.map((c) => c - 27), 1068].map((x, i) => <line key={i} x1={x} y1={T + 30} x2={x} y2={B - 30} opacity={0.5} />)}
          </g>
          {/* 巻名の行 (太め) と朱の小印 */}
          <path d={colPath(1612, 99)} stroke={NP.sumi} strokeWidth={10} fill="none" strokeLinecap="round" />
          <rect x={1596} y={680} width={32} height={32} fill="none" stroke={KRP.red} strokeWidth={4} />
          {/* 歌の行 (読めない万葉仮名風) */}
          {cols.map((x, k) => <path key={k} d={colPath(x, k)} stroke={NP.sumi} strokeWidth={6} fill="none" strokeLinecap="round" />)}
          {/* 絵の部分: 春の丘 */}
          <g>
            <rect x={300} y={T + 40} width={740} height={B - T - 80} fill={C.sky} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M 300 560 Q 420 470 560 520 Q 700 440 860 500 Q 960 470 1040 510 L 1040 ${B - 40} L 300 ${B - 40} Z`} fill={C.mtn} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M 300 640 Q 500 540 760 600 Q 900 630 1040 580 L 1040 ${B - 40} L 300 ${B - 40} Z`} fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M 300 690 Q 600 640 1040 680 L 1040 ${B - 40} L 300 ${B - 40} Z`} fill={C.hillDark} stroke={KRP.ink} strokeWidth={3} />
            {[0, 1].map((i) => (
              <rect key={i} x={300} y={500 + i * 70 + Math.sin(f / 12 + i) * 4} width={740} height={18} fill={C.haze} opacity={0.75} />
            ))}
            {Array.from({ length: 30 }, (_, i) => (
              <circle key={i} cx={320 + rnd(661, i) * 700} cy={650 + rnd(662, i) * 60} r={5} fill={C.nanohana} stroke={KRP.ink} strokeWidth={1.5} />
            ))}
            {/* 遠くの小さな2人 (顔なし) */}
            <g transform="translate(640 640)">
              <rect x={-8} y={-36} width={16} height={30} rx={5} fill={C.manWhite} stroke={KRP.ink} strokeWidth={2.5} />
              <circle cx={0} cy={-44} r={9} fill={C.hair} />
              <rect x={42} y={-30} width={16} height={26} rx={5} fill={C.girl} stroke={KRP.ink} strokeWidth={2.5} />
              <circle cx={50} cy={-38} r={8} fill={C.hair} />
            </g>
          </g>
        </g>
        {/* 表紙 (錦)・八双・紐 */}
        <g>
          <rect x={1650} y={T - 4} width={170} height={B - T + 8} fill={C.kouaiDark} stroke={KRP.ink} strokeWidth={5} />
          <g fill={C.kasaneY} opacity={0.85}>
            {Array.from({ length: 24 }, (_, i) => (
              <path key={i} d={`M ${1672 + (i % 4) * 42} ${T + 26 + Math.floor(i / 4) * 76} l 10 -12 l 10 12 l -10 12 Z`} />
            ))}
          </g>
          {/* 題簽 (字は札で示す) */}
          <rect x={1712} y={T + 24} width={46} height={250} fill={C.washi} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={1735} y1={T + 50} x2={1735} y2={T + 240} stroke={NP.sumi} strokeWidth={5} strokeDasharray="20 12" />
          <rect x={1816} y={T - 8} width={16} height={B - T + 16} rx={6} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 1832 ${(T + B) / 2} q 50 ${-20 + Math.sin(f / 10) * 10} 70 30 q 10 60 -40 ${90 + Math.sin(f / 13) * 12} q -30 40 ${10 + Math.sin(f / 9) * 8} 120`}
            stroke={C.mizuRed} strokeWidth={9} fill="none" strokeLinecap="round" />
          <circle cx={1832} cy={(T + B) / 2} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 巻いてある残りの紙と軸 */}
        <g>
          <rect x={RX - 42} y={T - 8} width={84} height={B - T + 16} rx={36} fill={C.washiShade} stroke={KRP.ink} strokeWidth={5} />
          <g clipPath="url(#nc1b65clip2)">
            {Array.from({ length: 5 }, (_, i) => {
              const xx = RX - 40 + ((i * 20 + (1 - roll) * 400) % 84);
              return <line key={i} x1={xx} y1={T - 4} x2={xx} y2={B + 4} stroke={C.washiFiber} strokeWidth={4} />;
            })}
          </g>
          <defs><clipPath id="nc1b65clip2"><rect x={RX - 42} y={T - 8} width={84} height={B - T + 16} rx={36} /></clipPath></defs>
          {[T - 30, B + 30].map((yy) => (
            <g key={yy}>
              <rect x={RX - 10} y={Math.min(yy, yy - 0) - (yy < T ? 0 : 22)} width={20} height={22} fill={C.lacquer} />
              <ellipse cx={RX} cy={yy} rx={26} ry={20} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={RX - 6} cy={yy - 6} rx={8} ry={5} fill={KRP.white} />
            </g>
          ))}
        </g>
        {/* 文鎮 (広がった端を押さえる) */}
        {roll > 0.5 && (
          <rect x={1420} y={B - 22} width={160} height={34} rx={8} fill={C.sumiStone} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 24, 30)} />
        )}
        {/* 花びら */}
        {[[420, 210, 20], [1180, 860, -30], [880, 250, 60], [1500, 900, 10]].map(([px, py, r], i) => (
          <NC1bPetal key={i} x={px + Math.sin(f / 15 + i) * 6} y={py} r={r + f * 0.4} s={1.6} />
        ))}
      </g>
      <TagPlate x={1700} y={232} text="万葉集" size={46} t={seg(f, 28, 34)} />
      <TagPlate x={1310} y={232} text="巻のいちばん最初" size={36} t={seg(f, 32, 38)} />
      <Arrow x={1530} y={352} s={0.6} rot={90} t={seg(f, 36, 41)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #66 家告らせ、名告らさね。
// 格: 山 / seed 4066
// 絵: ★歌の場面。春の丘で菜を摘む娘 (籠を持つ) に、白い衣の男性 (角髪) が声をかける。**どちらも横顔か後ろ姿で表情は控えめ** (雄略天皇の顔は見せない)。2人のあいだに、ことばの帯が流れる (歌の文字は字幕に任せ、絵では小さな花びらの帯)。丘の上の霞・菜の花
// どこ: 古代の春の丘。遠くの青い山なみに霞の帯がたなびき、丘一面に菜の花。空にひばり
// 演出: 手前左に白い衣の男性 (角髪・後ろ姿)。丘の上で籠を抱えて菜を摘む娘 (横顔・伏し目)。
//       男性から娘へ、花びらの帯がゆるやかに流れる (ことばの代わり。歌の字は字幕に任せる)
// 動き: f8〜30 花びらの帯が伸び、流れつづける / 霞が流れる / 菜の花がゆれる / ひばりが飛ぶ / カメラは右へ少しパンして寄る
const NC1bMizura: React.FC = () => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <ellipse cx={sd * 72} cy={-204} rx={14} ry={26} fill="none" stroke={KRP.ink} strokeWidth={17} />
        <ellipse cx={sd * 72} cy={-204} rx={14} ry={26} fill="none" stroke={C.hair} strokeWidth={10} />
        <rect x={sd * 68 - 8} y={-236} width={16} height={12} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
  </g>
);
// 古代の男性の白い衣の飾り (帯と足結)。Person と同じ transform
const NC1bKoromo: React.FC<{ x: number; y: number; s: number; f: number; phase?: number }> = ({ x, y, s, f, phase = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <rect x={-60} y={-78} width={120} height={16} rx={5} fill={C.mizuRed} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 30 -62 q 6 20 -2 36" stroke={C.mizuRed} strokeWidth={6} fill="none" />
      {[-18, 18].map((lx) => <rect key={lx} x={lx - 14} y={-28} width={28} height={8} fill={C.mizuRed} stroke={KRP.ink} strokeWidth={2.5} />)}
    </g>
  );
};
// 娘の籠 (菜が入っている)
const NC1bKago: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-24, -4, 16].map((lx, i) => <path key={i} d={`M ${lx} -20 q 6 -30 ${12 - i * 6} -44`} stroke={C.hillDeep} strokeWidth={8} fill="none" strokeLinecap="round" />)}
    <ellipse cx={0} cy={-58} rx={16} ry={9} fill={C.hillDark} stroke={KRP.ink} strokeWidth={2.5} />
    <path d="M -62 -22 L 62 -22 L 48 40 Q 0 54 -48 40 Z" fill={C.basket} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.basketDark} strokeWidth={3}>
      {[-40, -20, 0, 20, 40].map((lx) => <line key={lx} x1={lx} y1={-20} x2={lx * 0.8} y2={44} />)}
      {[-4, 12, 28].map((ly) => <line key={ly} x1={-58} y1={ly} x2={58} y2={ly} />)}
    </g>
    <ellipse cx={0} cy={-22} rx={62} ry={10} fill={C.basketDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Nm066: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.05, cam);
  const panX = lerp(20, -20, cam);
  const band = seg(f, 8, 30);
  const A: [number, number] = [600, 470], Bp: [number, number] = [1290, 450], Cp: [number, number] = [940, 230];
  const Q = (u: number): [number, number] => [
    (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * Cp[0] + u * u * Bp[0],
    (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * Cp[1] + u * u * Bp[1],
  ];
  return (
    <Frame f={f} seed={4066} bg={C.sky}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.sky} />
      <g transform={`translate(${960 + panX} 540) scale(${sc}) translate(-960 -540)`}>
        {/* 春の日と雲 */}
        <circle cx={1660} cy={150} r={70} fill={C.haze} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1660} cy={150} r={120} fill={C.haze} opacity={0.4} />
        {/* 遠くの山なみ */}
        <path d="M -60 470 Q 160 300 360 400 Q 560 260 820 380 Q 1060 280 1300 390 Q 1520 300 1980 420 L 1980 640 L -60 640 Z" fill={C.mtn} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -60 520 Q 260 420 520 500 Q 800 430 1100 510 Q 1400 440 1980 520 L 1980 640 L -60 640 Z" fill={C.mtnDark} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        {/* 霞の帯 (流れる) */}
        {[0, 1, 2].map((i) => {
          const dx = ((f * (1.2 + i * 0.4) + i * 300) % 600) - 300;
          return <path key={i} d={`M ${-700 + dx} ${430 + i * 50} q 400 -30 800 0 q 400 30 800 0 q 400 -30 800 0 q 400 30 800 0 l 0 26 q -400 20 -800 0 q -400 -20 -800 0 q -400 20 -800 0 q -400 -20 -800 0 Z`}
            fill={C.haze} opacity={0.8 - i * 0.15} />;
        })}
        {/* 丘 */}
        <path d="M -60 760 Q 400 620 900 640 Q 1300 600 1980 700 L 1980 1120 L -60 1120 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 900 660 Q 1200 560 1520 610 Q 1760 640 1980 640 L 1980 1120 L 900 1120 Z" fill={C.hillDark} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {/* 奥の菜の花畑 (小さな点) */}
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={rnd(661, i) * 2000 - 40} cy={660 + rnd(662, i) * 90} r={5 + rnd(663, i) * 3} fill={C.nanohana} stroke={KRP.ink} strokeWidth={1.8} />
        ))}
        {/* ひばり */}
        <g transform={`translate(${lerp(1100, 1300, clamp01(f / 60))} ${180 + Math.sin(f / 6) * 10})`}>
          <path d={`M -30 0 Q -14 ${-14 + Math.sin(f / 2) * 10} 0 0 Q 14 ${-14 + Math.sin(f / 2) * 10} 30 0`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* 娘 (丘の上・横顔で左を向く) */}
        <Person x={1360} y={780} s={1.2} f={f} cloth={C.girl} clothDark={C.girlDark} hair="none" pose="hold" phase={3} lean={-4} />
        <NC1bHead x={1360} y={780} s={1.2} f={f} phase={3} lean={-4} mode="profile" dir={-1}>
          {/* 後ろで束ねた長い髪 */}
          <path d="M 40 -200 Q 70 -120 60 -40" stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d="M 40 -200 Q 70 -120 60 -40" stroke={C.hair} strokeWidth={22} fill="none" strokeLinecap="round" />
          <rect x={36} y={-196} width={26} height={12} rx={4} fill={C.mizuWhite} stroke={KRP.ink} strokeWidth={3} />
        </NC1bHead>
        <NC1bKago x={1355} y={680} s={1.15} />
        {/* 娘の前の菜の花 (下半身を隠す) */}
        {Array.from({ length: 11 }, (_, i) => (
          <NC1bNanohana key={i} x={1180 + i * 38} y={890 + (i % 2) * 14} s={1.5} f={f} i={i} />
        ))}
        {/* 男性 (手前・後ろ姿・角髪) */}
        <Person x={470} y={950} s={1.65} f={f} cloth={C.manWhite} clothDark={C.manWhiteDark} hair="none" pose="point" pointDir={1} phase={1} />
        <NC1bKoromo x={470} y={950} s={1.65} f={f} phase={1} />
        <NC1bHead x={470} y={950} s={1.65} f={f} phase={1} mode="back" cloth={C.manWhite}><NC1bMizura /></NC1bHead>
        {/* 花びらの帯 (ことばの流れ) */}
        <path d={`M ${A[0]} ${A[1]} Q ${Cp[0]} ${Cp[1]} ${Bp[0]} ${Bp[1]}`} stroke={C.petal} strokeWidth={30} fill="none" strokeLinecap="round"
          opacity={0.35} strokeDasharray={`${band * 900} 1400`} />
        {Array.from({ length: 20 }, (_, i) => {
          const u = (i / 20 + f * 0.01) % 1;
          if (u > band) return null;
          const [px, py] = Q(u);
          return <NC1bPetal key={i} x={px} y={py + Math.sin(f / 5 + i) * 12} r={f * 3 + i * 40} s={1.5} />;
        })}
        {/* 手前の菜の花 (画面の下、ぼかし気味に大きく) */}
        {Array.from({ length: 9 }, (_, i) => (
          <NC1bNanohana key={i} x={720 + i * 140 + (i % 2) * 40} y={1110} s={2.4} f={f} i={i + 20} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #67 あなたの家はどこ。名前を教えて。
// 格: 並 / seed 4067
// 絵: #66 の2人に寄る。男性の手から、娘の方へ「家の絵の札」と「名札の札」の2枚がふわりと差し出される。娘の頬が赤くなる (照れの線)
// どこ: #66 と同じ春の丘。2人に寄った構図 (肩越し)。後ろは霞と青い山、下に大きな菜の花
// 演出: 左手前に男性の背中と角髪。伸ばした手から「家の絵の札」と「名札の札」の2枚がふわりと娘の方へ。
//       横顔の娘の頬が赤くなり、照れの線が出る。少しうつむく
// 動き: f6〜24 家の札 / f12〜30 名札の札 / f26〜38 頬の赤み・照れの線 / 花びらが舞う / カメラは2枚の札へ寄る
const NC1bIeFuda: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-96} y={-66} width={200} height={140} rx={14} fill={KRP.ink} opacity={0.2} />
    <rect x={-100} y={-72} width={200} height={140} rx={14} fill={NP.wood} stroke={KRP.ink} strokeWidth={6} />
    {/* 高床の家と、まわりの垣 */}
    <polygon points="-56,-6 0,-56 56,-6" fill={C.basket} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <g stroke={C.basketDark} strokeWidth={2.5}>{[-30, -12, 6, 24].map((lx) => <line key={lx} x1={lx} y1={-34 + Math.abs(lx) * 0.4} x2={lx * 1.6} y2={-8} />)}</g>
    <rect x={-36} y={-6} width={72} height={30} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-10} y={2} width={20} height={22} fill={KRP.ink} opacity={0.6} />
    {[-30, 30].map((lx) => <line key={lx} x1={lx} y1={24} x2={lx} y2={50} stroke={KRP.ink} strokeWidth={5} />)}
    <line x1={-80} y1={50} x2={80} y2={50} stroke={C.hillDeep} strokeWidth={5} />
  </g>
);
const NC1bNaFuda: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <path d="M 0 -96 L -36 -58 M 0 -96 L 36 -58" stroke={C.mizuRed} strokeWidth={5} fill="none" />
    <circle cx={0} cy={-96} r={8} fill={C.mizuRed} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-96} y={-54} width={200} height={120} rx={14} fill={KRP.ink} opacity={0.2} />
    <rect x={-100} y={-60} width={200} height={120} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-100} y={-60} width={200} height={22} rx={10} fill={NP.wood} opacity={0.8} />
    <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.grayDark}>○○</text>
  </g>
);
const Nm067: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.06, cam);
  const h1 = easeOut(seg(f, 6, 24));
  const h2 = easeOut(seg(f, 12, 30));
  const blush = seg(f, 26, 38);
  const HX = 770, HY = 592;
  return (
    <Frame f={f} seed={4067} bg={C.sky}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.sky} />
      <g transform={`translate(1000 480) scale(${sc}) translate(-1000 -480)`}>
        {/* 遠景: 山と霞 */}
        <path d="M -60 520 Q 300 340 640 450 Q 980 320 1300 430 Q 1620 330 1980 450 L 1980 760 L -60 760 Z" fill={C.mtn} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((i) => {
          const dx = ((f * (1.4 + i * 0.5) + i * 260) % 520) - 260;
          return <path key={i} d={`M ${-260 + dx} ${470 + i * 70} q 500 -36 1000 0 q 500 36 1000 0 q 300 -20 600 0 l 0 34 q -300 20 -600 0 q -500 -36 -1000 0 q -500 36 -1000 0 Z`}
            fill={C.haze} opacity={0.75} />;
        })}
        {/* 丘の稜線 */}
        <path d="M -60 760 Q 600 640 1200 690 Q 1600 720 1980 660 L 1980 1120 L -60 1120 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={rnd(671, i) * 2000 - 40} cy={700 + rnd(672, i) * 120} r={6 + rnd(673, i) * 4} fill={C.nanohana} stroke={KRP.ink} strokeWidth={2} />
        ))}
        {/* 娘 (横顔・左向き)。うつむき気味 */}
        <Person x={1450} y={1120} s={2.1} f={f} cloth={C.girl} clothDark={C.girlDark} hair="none" pose="hold" phase={3} lean={-2 - blush * 2} />
        <NC1bHead x={1450} y={1120} s={2.1} f={f} phase={3} lean={-2 - blush * 2} mode="profile" dir={-1}>
          <path d="M 40 -200 Q 70 -120 60 -40" stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d="M 40 -200 Q 70 -120 60 -40" stroke={C.hair} strokeWidth={22} fill="none" strokeLinecap="round" />
          <rect x={36} y={-196} width={26} height={12} rx={4} fill={C.mizuWhite} stroke={KRP.ink} strokeWidth={3} />
          {/* 頬の赤み と 照れの線 */}
          <ellipse cx={-30} cy={-200} rx={18} ry={11} fill={C.blush} opacity={0.75 * blush} />
          <g stroke={C.blush} strokeWidth={4} strokeLinecap="round" opacity={blush}>
            {[0, 1, 2].map((k) => <line key={k} x1={-44 + k * 12} y1={-206} x2={-50 + k * 12} y2={-194} />)}
          </g>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${-80 - k * 10} ${-262 + k * 22} l ${-14 * blush} ${-6 * blush}`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={blush} />
          ))}
        </NC1bHead>
        {/* 男性の背中 (左手前) と伸ばした腕 */}
        <Person x={300} y={1080} s={2.3} f={f} cloth={C.manWhite} clothDark={C.manWhiteDark} hair="none" phase={1} />
        <NC1bKoromo x={300} y={1080} s={2.3} f={f} phase={1} />
        <NC1bHead x={300} y={1080} s={2.3} f={f} phase={1} mode="back" cloth={C.manWhite}><NC1bMizura /></NC1bHead>
        <path d={`M 430 712 Q 600 640 ${HX - 10} ${HY - 4} L ${HX + 4} ${HY + 30} Q 620 700 470 790 Z`} fill={C.manWhite} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${HX - 10} ${HY - 4} L ${HX + 4} ${HY + 30}`} stroke={C.mizuRed} strokeWidth={8} />
        <circle cx={HX + 18} cy={HY + 8} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* ふわりと差し出される2枚 */}
        {h1 > 0 && <NC1bIeFuda x={lerp(HX + 40, 930, h1)} y={lerp(HY - 10, 380, h1) + Math.sin(f / 10) * 8} s={0.4 + 0.75 * h1} rot={lerp(-20, -5, h1) + Math.sin(f / 13) * 3} />}
        {h2 > 0 && <NC1bNaFuda x={lerp(HX + 40, 1140, h2)} y={lerp(HY - 10, 520, h2) + Math.sin(f / 11 + 1) * 8} s={0.4 + 0.75 * h2} rot={lerp(20, 6, h2) + Math.sin(f / 12) * 3} />}
        {/* 舞う花びら */}
        {Array.from({ length: 10 }, (_, i) => (
          <NC1bPetal key={i} x={((rnd(674, i) * 2000 + f * (3 + i % 3)) % 2000) - 40} y={120 + rnd(675, i) * 500 + Math.sin(f / 8 + i) * 20} r={f * 4 + i * 30} s={1.6} />
        ))}
        {/* 手前の大きな菜の花 */}
        {Array.from({ length: 7 }, (_, i) => (
          <NC1bNanohana key={i} x={860 + i * 120} y={1140} s={2.6} f={f} i={i + 30} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #68 名前をたずねることが、そのまま、求婚の言葉だったと考えられています。
// 格: 山 / seed 4068
// 絵: #67 の続き。名札の札が娘の手に渡ると、2人のまわりに**ハートではなく結び紐 (水引)** がふわりと結ばれる。背景に春の野。札「名前をたずねる ＝ 求婚」(と考えられている、を小さく添える)
// どこ: #67 の続き。少し引いた春の野。右に満開の山桜、遠くに山と霞、蝶が2匹
// 演出: 男性の手から名札の札が娘の両手に渡る。すると2人のまわりを水引 (朱・金・白の3本の紐) が
//       ぐるりと一周し、頭の上で「あわじ結び」に結ばれる (ハートは使わない)。上に札「名前をたずねる ＝ 求婚」
// 動き: f4〜18 札が娘の手へ / f14〜34 水引が2人を囲んで伸びる / f30〜40 結び目がぽん / カメラはゆっくり引く
const NC1bAwaji: React.FC<{ x: number; y: number; s?: number; t: number; f: number }> = ({ x, y, s = 1, t, f }) => {
  if (t <= 0) return null;
  const cols = [C.mizuRed, C.mizuGold, C.mizuWhite];
  const loops = (o: number) => [
    `M ${-110 + o} ${30} Q ${-150 + o} ${-40} ${-70} ${-46 + o} Q ${-10} ${-50} ${10} ${0 + o}`,
    `M ${110 - o} ${30} Q ${150 - o} ${-40} ${70} ${-46 + o} Q ${10} ${-50} ${-10} ${0 + o}`,
    `M ${-40} ${10 + o} Q ${-60 - o} ${-110} ${0} ${-118 + o} Q ${60 + o} ${-110} ${40} ${10 + o}`,
    `M ${-30} ${10 + o} Q ${-80} ${50 + o} ${-130 - o} ${110}`,
    `M ${30} ${10 + o} Q ${80} ${50 + o} ${130 + o} ${110}`,
  ];
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 12) * 4}) scale(${s * pop(t)})`}>
      <circle cx={0} cy={-20} r={140} fill={NP.glow} opacity={0.08} />
      {cols.map((col, k) => (
        <g key={k}>
          {loops((k - 1) * 9).map((d, j) => (
            <g key={j}>
              <path d={d} stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d={d} stroke={col} strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};
const Nm068: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.08, 1.0, cam);
  const give = easeInOut(seg(f, 4, 18));
  const ring = easeOut(seg(f, 14, 34));
  const knot = seg(f, 30, 40);
  const blush = seg(f, 14, 24);
  const EX = 940, EY = 600, ERX = 560, ERY = 310;
  const ellipse = (dr: number) => `M ${EX} ${EY - ERY - dr} A ${ERX + dr} ${ERY + dr} 0 1 1 ${EX - 0.1} ${EY - ERY - dr}`;
  const per = 2 * Math.PI * Math.sqrt((ERX * ERX + ERY * ERY) / 2) + 40;
  return (
    <Frame f={f} seed={4068} bg={C.sky}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.sky} />
      <g transform={`translate(960 560) scale(${sc}) translate(-960 -560)`}>
        {/* 遠くの山と霞 */}
        <path d="M -60 500 Q 240 360 520 440 Q 820 340 1120 430 Q 1420 360 1980 450 L 1980 700 L -60 700 Z" fill={C.mtn} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((i) => {
          const dx = ((f * (1.1 + i * 0.5) + i * 200) % 500) - 250;
          return <path key={i} d={`M ${-250 + dx} ${460 + i * 60} q 500 -30 1000 0 q 500 30 1000 0 q 300 -20 500 0 l 0 26 q -200 20 -500 0 q -500 -30 -1000 0 q -500 30 -1000 0 Z`}
            fill={C.haze} opacity={0.75} />;
        })}
        {/* 春の野 */}
        <path d="M -60 680 Q 500 620 1000 650 Q 1500 680 1980 630 L 1980 1120 L -60 1120 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.hillDark} strokeWidth={4} strokeLinecap="round">
          {Array.from({ length: 40 }, (_, i) => {
            const gx = rnd(681, i) * 1960, gy = 700 + rnd(682, i) * 300;
            return <path key={i} d={`M ${gx} ${gy} l -6 -18 M ${gx} ${gy} l 6 -16`} />;
          })}
        </g>
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} cx={rnd(683, i) * 1960} cy={670 + rnd(684, i) * 70} r={5 + rnd(685, i) * 3} fill={C.nanohana} stroke={KRP.ink} strokeWidth={1.8} />
        ))}
        {/* 山桜 (右) */}
        <path d="M 1760 900 Q 1740 700 1790 520 M 1780 620 Q 1700 560 1640 500 M 1786 580 Q 1860 520 1900 470" stroke={C.sakuraTrunk} strokeWidth={30} fill="none" strokeLinecap="round" />
        {[[1640, 450, 110], [1780, 400, 140], [1900, 440, 110], [1700, 520, 90], [1860, 540, 90]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={C.petal} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <g fill={C.petalDark} opacity={0.7}>
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={1560 + rnd(686, i) * 400} cy={320 + rnd(687, i) * 280} r={6} />)}
        </g>
        {/* 蝶 */}
        {[0, 1].map((i) => {
          const bx = 300 + i * 900 + Math.sin(f / 20 + i * 2) * 60, by = 300 + i * 60 + Math.cos(f / 14 + i) * 30;
          const wing = 0.4 + 0.6 * Math.abs(Math.sin(f / 3 + i));
          return (
            <g key={i} transform={`translate(${bx} ${by})`}>
              {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 14 * wing} cy={0} rx={14 * wing} ry={18} fill={i ? C.nanohana : KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
              <line x1={0} y1={-12} x2={0} y2={12} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 男性 (後ろ姿) */}
        <Person x={620} y={900} s={1.55} f={f} cloth={C.manWhite} clothDark={C.manWhiteDark} hair="none" pose="point" pointDir={1} phase={1} />
        <NC1bKoromo x={620} y={900} s={1.55} f={f} phase={1} />
        <NC1bHead x={620} y={900} s={1.55} f={f} phase={1} mode="back" cloth={C.manWhite}><NC1bMizura /></NC1bHead>
        {/* 娘 (横顔・名札の札を胸に受け取る) */}
        <Person x={1260} y={900} s={1.4} f={f} cloth={C.girl} clothDark={C.girlDark} hair="none" pose="hold" phase={3} />
        <NC1bHead x={1260} y={900} s={1.4} f={f} phase={3} mode="profile" dir={-1}>
          <path d="M 40 -200 Q 70 -120 60 -40" stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d="M 40 -200 Q 70 -120 60 -40" stroke={C.hair} strokeWidth={22} fill="none" strokeLinecap="round" />
          <rect x={36} y={-196} width={26} height={12} rx={4} fill={C.mizuWhite} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={-30} cy={-200} rx={18} ry={11} fill={C.blush} opacity={0.75 * blush} />
          <g stroke={C.blush} strokeWidth={4} strokeLinecap="round" opacity={blush}>
            {[0, 1, 2].map((k) => <line key={k} x1={-44 + k * 12} y1={-206} x2={-50 + k * 12} y2={-194} />)}
          </g>
        </NC1bHead>
        {/* 手渡される名札の札 */}
        <NC1bNaFuda x={lerp(880, 1250, give)} y={lerp(650, 712, give) - Math.sin(give * Math.PI) * 90 + Math.sin(f / 12) * 3} s={0.55} rot={lerp(14, -4, give)} />
        {/* 2人を囲む水引 (3本) */}
        {[-14, 0, 14].map((dr, k) => (
          <g key={k}>
            <path d={ellipse(dr)} stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${ring * per} ${per + 100}`} />
            <path d={ellipse(dr)} stroke={[C.mizuRed, C.mizuGold, C.mizuWhite][k]} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${ring * per} ${per + 100}`} />
          </g>
        ))}
        <NC1bAwaji x={EX} y={EY - ERY + 10} s={0.95} t={knot} f={f} />
        {/* 舞う花びら */}
        {Array.from({ length: 12 }, (_, i) => (
          <NC1bPetal key={i} x={((rnd(688, i) * 2000 - f * (3 + i % 3)) % 2000 + 2000) % 2000 - 40} y={140 + rnd(689, i) * 640 + Math.sin(f / 8 + i) * 20} r={f * 4 + i * 30} s={1.5} />
        ))}
      </g>
      <TagPlate x={960} y={130} text="名前をたずねる ＝ 求婚" size={50} t={seg(f, 32, 40)} fill={KRP.white} />
      <TagPlate x={1430} y={200} text="（と考えられている）" size={26} t={seg(f, 36, 42)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #69 名前で身を守る、という工夫もありました。
// 格: 並 / seed 4069
// 絵: 名札の前に、盾の形の板が f ですっと立つ (からくりの作業台の上)。盾の表には何も書かない。周りに魔除けの小物 (お守り・鈴)
// どこ: からくりの作業場。壁は道具を掛けた有孔板と棚 (歯車・糸巻き)。上から作業灯。手前は木の作業台
// 演出: 作業台の上の木の掛け台に名札が下がっている。台の溝から盾の形の板がすっとせり上がり、名札の前に立つ。
//       盾の表は無地 (木目と鉄の縁と鋲だけ)。左にお守り2つ、右の掛け台の端に鈴。盾が立つと鈴が鳴る
// 動き: f6〜22 盾がせり上がる (少し弾む) / f20〜30 溝から木くずの煙 / f26〜40 鈴がゆれて鳴る・盾に光が走る / カメラはゆっくり寄る
const NC1bSuzu: React.FC<{ x: number; y: number; s?: number; swing: number; f: number }> = ({ x, y, s = 1, swing, f }) => {
  const a = Math.sin(f / 2.2) * 14 * swing;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${a})`}>
      <path d="M 0 0 L 0 70" stroke={C.mizuRed} strokeWidth={8} />
      <path d="M -18 40 Q 0 30 18 40 L 10 70 L -10 70 Z" fill={C.mizuRed} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={0} cy={112} r={44} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -44 112 L 44 112" stroke={KRP.ink} strokeWidth={4} />
      <path d="M -10 130 L 10 130 M 0 122 L 0 152" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={-14} cy={96} rx={12} ry={7} fill={KRP.white} opacity={0.5} />
    </g>
  );
};
const NC1bOmamori: React.FC<{ x: number; y: number; s?: number; col: string; rot?: number }> = ({ x, y, s = 1, col, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <ellipse cx={0} cy={6} rx={70} ry={12} fill={KRP.ink} opacity={0.2} />
    <path d="M -56 0 L -56 -150 Q -56 -190 -28 -196 L 28 -196 Q 56 -190 56 -150 L 56 0 Z" fill={col} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={KRP.gold} strokeWidth={4} opacity={0.9} fill="none">
      {[-120, -80, -40].map((ly) => <path key={ly} d={`M -46 ${ly} q 23 -14 46 0 q 23 14 46 0`} />)}
    </g>
    <rect x={-56} y={-176} width={112} height={14} fill={KRP.gold} opacity={0.7} />
    {/* 口の紐 (結び) */}
    <path d="M -18 -196 Q -30 -230 0 -226 Q 30 -230 18 -196" stroke={KRP.white} strokeWidth={8} fill="none" />
    <path d="M -18 -196 Q -30 -230 0 -226 Q 30 -230 18 -196" stroke={KRP.ink} strokeWidth={2} fill="none" />
    <circle cx={0} cy={-218} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const Nm069: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.04, cam);
  const rise = pop(seg(f, 6, 22));
  const SY = lerp(1140, 760, rise);
  const puff = seg(f, 20, 32);
  const ring = seg(f, 24, 32);
  const shine = seg(f, 28, 40);
  const TOP = 776;
  return (
    <Frame f={f} seed={4069} bg={C.peg}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.peg} />
      <g transform={`translate(1000 520) scale(${sc}) translate(-1000 -520)`}>
        {/* 有孔板と道具 */}
        <g fill={C.pegDark}>
          {Array.from({ length: 13 * 20 }, (_, i) => <circle key={i} cx={40 + (i % 20) * 96} cy={40 + Math.floor(i / 20) * 56} r={5} />)}
        </g>
        <g stroke={KRP.ink} strokeWidth={4}>
          {/* のこぎり */}
          <g transform={`translate(180 140) rotate(${Math.sin(f / 25) * 1.5})`}>
            <rect x={-10} y={0} width={20} height={70} rx={6} fill={C.benchDark} />
            <path d="M -30 70 L 30 70 L 40 330 L -40 330 Z" fill={C.metal} />
            <path d="M -40 330 l 10 10 l 10 -10 l 10 10 l 10 -10 l 10 10 l 10 -10 l 10 10 l 10 -10" fill="none" />
          </g>
          {/* ノミ3本 */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${330 + i * 50} 120)`}>
              <rect x={-10} y={0} width={20} height={90} rx={6} fill={[C.omaRed, C.benchDark, C.omaBlue][i]} />
              <rect x={-6} y={90} width={12} height={100} fill={C.metal} />
            </g>
          ))}
          {/* 木槌 */}
          <g transform="translate(1640 130) rotate(-8)">
            <rect x={-8} y={0} width={16} height={210} fill={C.benchDark} />
            <rect x={-60} y={-40} width={120} height={60} rx={10} fill={C.bench} />
          </g>
          {/* 棚と歯車・糸巻き */}
          <rect x={1380} y={420} width={520} height={18} fill={C.benchDark} />
          {[[1580, 370, 44], [1680, 380, 34]].map(([gx, gy, r], i) => (
            <g key={i} transform={`translate(${gx} ${gy}) rotate(${f * (i ? -2 : 1.5)})`}>
              <circle r={r} fill={C.metal} />
              {Array.from({ length: 10 }, (_, k) => <rect key={k} x={-6} y={-r - 10} width={12} height={14} fill={C.metal} transform={`rotate(${k * 36})`} />)}
              <circle r={r * 0.35} fill={C.metalDark} />
            </g>
          ))}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${1780 + i * 80} 360)`}>
              <rect x={-30} y={-50} width={60} height={14} fill={C.bench} />
              <rect x={-24} y={-36} width={48} height={60} fill={[NP.mimi, NP.chobo][i]} />
              <rect x={-30} y={24} width={60} height={14} fill={C.bench} />
            </g>
          ))}
        </g>
        {/* 作業灯 */}
        <line x1={1000} y1={-20} x2={1000} y2={40} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 930 90 Q 1000 20 1070 90 Z" fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 930 90 L 820 700 L 1180 700 L 1070 90 Z" fill={NP.glow} opacity={0.08} />
        {/* 作業台 */}
        <polygon points={`-20,${TOP} 1940,${TOP} 1940,${TOP + 40} -20,${TOP + 40}`} fill={C.bench} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-20} y={TOP + 40} width={W + 40} height={300} fill={C.benchDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.bench} strokeWidth={4} opacity={0.5} fill="none">
          {[880, 950, 1010].map((ly, i) => <path key={i} d={`M -20 ${ly} q 500 ${10 - i * 8} 980 0 q 480 -10 980 0`} />)}
        </g>
        {/* 名札の掛け台 */}
        <g>
          {[700, 1300].map((px) => (
            <g key={px}>
              <rect x={px - 16} y={150} width={32} height={TOP - 150} fill={C.bench} stroke={KRP.ink} strokeWidth={5} />
              <rect x={px - 40} y={TOP - 30} width={80} height={34} rx={6} fill={C.benchDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          <rect x={660} y={134} width={820} height={30} rx={8} fill={C.bench} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1000} cy={186} r={10} fill={C.metalDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <Nafuda x={1000} y={360} s={1.1} text="山田 花子" f={f} />
        {/* 鈴 (掛け台の右端) */}
        <NC1bSuzu x={1440} y={164} s={1.1} swing={ring} f={f} />
        {ring > 0.05 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${1530 + k * 18} ${260 - k * 10} q 16 30 0 60`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round"
            opacity={ring * (0.5 + 0.5 * Math.sin(f / 2 + k))} />
        ))}
        {/* 盾 (台の溝からせり上がる・表は無地) */}
        <defs><clipPath id="nc1b69clip"><rect x={-20} y={-20} width={W + 40} height={TOP + 40} /></clipPath></defs>
        <g clipPath="url(#nc1b69clip)">
          <g transform={`translate(1000 ${SY})`}>
            <path d="M -230 -250 Q 0 -286 230 -250 L 220 20 Q 190 160 0 220 Q -190 160 -220 20 Z" fill={C.shield} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
            {[-77, 77].map((lx) => <line key={lx} x1={lx} y1={-262} x2={lx} y2={180} stroke={C.shieldDark} strokeWidth={4} />)}
            <g stroke={C.shieldDark} strokeWidth={3} fill="none" opacity={0.7}>
              <path d="M -190 -180 q 20 100 -6 220" /><path d="M -30 -200 q -20 120 10 260" /><path d="M 130 -190 q 20 110 -10 240" />
            </g>
            {/* 鉄の縁と鋲 */}
            <path d="M -230 -250 Q 0 -286 230 -250 L 220 20 Q 190 160 0 220 Q -190 160 -220 20 Z" fill="none" stroke={C.metalDark} strokeWidth={16} opacity={0.85} />
            {[[-210, -236], [0, -258], [210, -236], [-212, -100], [212, -100], [-206, 30], [206, 30], [-120, 150], [120, 150]].map(([rx2, ry2], i) => (
              <circle key={i} cx={rx2} cy={ry2} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
            ))}
            {/* 光が走る */}
            {shine > 0 && shine < 1 && (
              <path d={`M ${-260 + shine * 520} -270 l 60 0 l -120 500 l -60 0 Z`} fill={KRP.white} opacity={0.35 * Math.sin(shine * Math.PI)} />
            )}
          </g>
        </g>
        {/* 台の溝 */}
        <rect x={750} y={TOP - 8} width={500} height={16} rx={6} fill={KRP.ink} />
        {/* 木くずの煙 */}
        {puff > 0 && puff < 1 && (
          <g opacity={(1 - puff) * 0.85}>
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={1000 + (i - 3) * 80 * (0.5 + puff)} cy={TOP - 10 - puff * 30 - (i % 2) * 14} r={14 + puff * 22} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />
            ))}
          </g>
        )}
        {/* 魔除けの小物: お守り2つ */}
        <NC1bOmamori x={380} y={TOP + 14} s={1.0} col={C.omaRed} rot={-4} />
        <NC1bOmamori x={540} y={TOP + 20} s={0.8} col={C.omaBlue} rot={6} />
        {/* 台の上の小物: 糸巻き・ピンセット・木くず */}
        <g transform="translate(1560 790)">
          <rect x={-60} y={-70} width={120} height={18} fill={C.bench} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-48} y={-52} width={96} height={56} fill={NP.shinyo} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={4} width={120} height={18} fill={C.bench} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <path d="M 1700 800 L 1860 770 M 1700 806 L 1860 790" stroke={C.metalDark} strokeWidth={8} strokeLinecap="round" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${180 + rnd(691, i) * 1600} ${TOP + 12} q 8 -10 16 0`} stroke={C.benchDark} strokeWidth={4} fill="none" />
        ))}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_062: (f) => <Nm062 f={f} />,
  nm_063: (f) => <Nm063 f={f} />,
  nm_064: (f) => <Nm064 f={f} />,
  nm_065: (f) => <Nm065 f={f} />,
  nm_066: (f) => <Nm066 f={f} />,
  nm_067: (f) => <Nm067 f={f} />,
  nm_068: (f) => <Nm068 f={f} />,
  nm_069: (f) => <Nm069 f={f} />,
};

export const NM_C1B_MOTIFS: string[] = [
  "nm_062", // #62
  "nm_063", // #63
  "nm_064", // #64
  "nm_065", // #65
  "nm_066", // #66
  "nm_067", // #67
  "nm_068", // #68
  "nm_069", // #69
];

export const namaeC1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
