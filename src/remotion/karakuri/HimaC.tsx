// 人は、なぜ暇をつぶすのか: 文#48〜#58 (11文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
  washi: "#F4EAD2",
  washiDark: "#E2D2AE",
  desk: "#8A5A36",
  deskDark: "#6A4226",
  deskLine: "#76492B",
  sumi: "#2E2A26",
  ai: "#3F5F8F",       // 藍の半纏
  aiDark: "#2C4468",
  momo: "#8A6A4A",     // 茶の股引
  momoDark: "#6A4E34",
  shibu: "#8C7650",    // 渋茶の着物
  shibuDark: "#6C5A3A",
  hair: "#3B332C",
  gray: "#C9C4BA",     // 年寄りの白髪
  tatami: "#C9C08A",
  tatamiDark: "#A9A06A",
  tatamiEdge: "#4E5A3A",
  nightWall: "#4A3F36",
  nightWall2: "#3A3029",
  andon: "#FFD98A",
  shoji: "#F6EFDC",
  shojiFrame: "#9A7550",
  ita: "#C79A62",      // 板の間
  itaDark: "#A87B47",
  ine: "#7FAE5A",      // 田の稲
  ineDark: "#5E8A40",
  mizu: "#9CC3C9",
  mud: "#9A7B55",
  sky: "#BFDDF0",
  skyHaze: "#EAF2EE",
  hill: "#8FB27A",
  hillDark: "#6E945C",
  wara: "#D8B868",     // わら屋根
  waraDark: "#B8984A",
  tsuchi: "#D8C49A",   // 土の道
  kinchaku: "#B8454A",
  kinchakuDark: "#8A2E33",
  coin: "#D9B23C",
  dango1: "#F6F0E4",
  dango2: "#F2B8C6",
  dango3: "#9CC48A",
  kaki: "#B85A3A",     // 垣根の竹
  bamboo: "#A8B86A",
  bambooDark: "#7E8E48",
  hiNoMi: "#7A5A3C",
  kura: "#EEE6D6",
  kuraDark: "#CFC3AA",
  meijiDesk: "#7A4A2E",
  meijiDeskTop: "#5E8A5A", // 机の緑の羅紗
  meijiWall: "#E6D9BC",
  tsume: "#2E3240",     // 詰襟
  tsumeDark: "#1E212C",
  lampGlass: "#FFF2C0",
  brick: "#B86A4A",
} as const;

// 江戸の人: Person に重ねる頭と襟 (Person と同じ bob/座標系)
const HmCOver: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number;
  kind: "young" | "elder" | "kid" | "meiji"; band?: string;
}> = ({ x, y, s, f, phase = 0, lean = 0, kind, band = KRP.white }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 襟 (着物の合わせ) */}
      {kind !== "meiji" ? (
        <g>
          <path d="M -30 -160 L 4 -96 L 30 -160" fill="none" stroke={KRP.white} strokeWidth={12} strokeLinejoin="round" />
          <path d="M -30 -160 L 4 -96 L 30 -160" fill="none" stroke={KRP.ink} strokeWidth={3} />
          <rect x={-58} y={-92} width={116} height={14} fill={kind === "elder" ? C.shibuDark : kind === "kid" ? KRP.red : C.momoDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ) : (
        <g>
          {/* 詰襟と金ボタン */}
          <rect x={-26} y={-166} width={52} height={14} rx={4} fill={C.tsumeDark} stroke={KRP.ink} strokeWidth={3} />
          {[-140, -118, -96, -74].map((by) => <circle key={by} cx={0} cy={by} r={4.5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />)}
        </g>
      )}
      {kind === "young" && (
        <g>
          {/* 鉢巻 */}
          <path d="M -64 -258 Q 0 -276 64 -258 L 63 -244 Q 0 -262 -63 -244 Z" fill={band} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 60 -254 q 26 ${-6 + Math.sin(f / 6 + phase) * 4} 40 ${4 + Math.sin(f / 6 + phase) * 4} l -6 10 q -14 -8 -34 -2 Z`} fill={band} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
      {kind === "elder" && (
        <g>
          {/* 白髪と小さなまげ・あごひげ */}
          <path d="M -62 -232 Q -66 -270 -40 -282 L -30 -262 Q -50 -254 -56 -226 Z" fill={C.gray} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 62 -232 Q 66 -270 40 -282 L 30 -262 Q 50 -254 56 -226 Z" fill={C.gray} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-10} y={-306} width={20} height={22} rx={6} fill={C.gray} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -22 -172 Q 0 -140 22 -172 Q 0 -160 -22 -172 Z" fill={C.gray} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {kind === "kid" && (
        <g>
          {/* 前髪の子ども */}
          <path d="M -40 -262 Q 0 -246 40 -262 Q 30 -240 0 -244 Q -30 -240 -40 -262 Z" fill={C.hair} />
        </g>
      )}
      {kind === "meiji" && (
        <g>
          {/* 口ひげ */}
          <path d="M -26 -196 Q -12 -206 0 -198 Q 12 -206 26 -196 Q 14 -192 0 -194 Q -14 -192 -26 -196 Z" fill={C.hair} stroke={KRP.ink} strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

// 1年の巻物 (365マス・12か月)。marks = 赤い印のつく日 (0〜364)、t = 何個目まで押されたか
const HmCScroll: React.FC<{
  x: number; y: number; w: number; h: number; marks: number[]; shown: number; f: number;
  rollW?: number; newest?: boolean;
}> = ({ x, y, w, h, marks, shown, f, rollW = 34, newest = true }) => {
  const cols = 31, rows = 12;
  const cw = (w - 84) / cols, ch = (h - 40) / rows;
  const n = Math.floor(shown);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={6} y={10} width={w} height={h} fill={KRP.ink} opacity={0.18} />
      <rect x={0} y={0} width={w} height={h} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
      {/* 和紙の繊維 */}
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M ${rnd(48, i) * w} ${rnd(49, i) * h} q 14 ${rnd(50, i) * 10 - 5} 30 0`} stroke={C.washiDark} strokeWidth={2} fill="none" />
      ))}
      {/* 月の見出し帯と升目 */}
      {Array.from({ length: rows }, (_, r) => (
        <g key={r}>
          <rect x={26} y={20 + r * ch} width={40} height={ch - 4} rx={3} fill={r % 2 ? C.washiDark : "#EADCB8"} stroke={KRP.ink} strokeWidth={1.5} />
          <text x={46} y={20 + r * ch + ch * 0.72} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={ch * 0.6} fill={KRP.ink}>{r + 1}</text>
          {Array.from({ length: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][r] }, (_, c) => (
            <rect key={c} x={72 + c * cw} y={20 + r * ch} width={cw - 2} height={ch - 4} fill="none" stroke={C.washiDark} strokeWidth={1.5} />
          ))}
        </g>
      ))}
      {/* 赤い印 */}
      {marks.slice(0, Math.ceil(shown)).map((d, k) => {
        const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        let m = 11; while (cum[m] > d) m--;
        const c = d - cum[m];
        const p = k < n ? 1 : shown - n;
        const sc = pop(clamp01(p));
        const cx = 72 + c * cw + cw / 2 - 1, cy = 20 + m * ch + ch / 2 - 2;
        const fresh = newest && k === n - 1;
        return (
          <g key={k} transform={`translate(${cx} ${cy}) scale(${sc})`}>
            <circle r={Math.min(cw, ch) * 0.62} fill={HP.rest} stroke={KRP.red} strokeWidth={2} opacity={0.9} />
            {fresh && <circle r={Math.min(cw, ch) * (0.9 + 0.1 * Math.sin(f / 3))} fill="none" stroke={KRP.red} strokeWidth={2} opacity={0.5} />}
          </g>
        );
      })}
      {/* 両端の軸 */}
      {[0, w].map((ex, i) => (
        <g key={i}>
          <rect x={ex - rollW / 2} y={-18} width={rollW} height={h + 36} rx={rollW / 2} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={ex - rollW / 2 - 4} y={-30} width={rollW + 8} height={16} rx={6} fill={KRP.ink} />
          <rect x={ex - rollW / 2 - 4} y={h + 14} width={rollW + 8} height={16} rx={6} fill={KRP.ink} />
        </g>
      ))}
    </g>
  );
};

// 巻物の中の d 日目の升の中心 (画面座標)
const markPos = (d: number, x: number, y: number, w: number, h: number): [number, number] => {
  const cw = (w - 84) / 31, ch = (h - 40) / 12;
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let m = 11; while (cum[m] > d) m--;
  return [x + 72 + (d - cum[m]) * cw + cw / 2 - 1, y + 20 + m * ch + ch / 2 - 2];
};

// 朱の判子 (持ち手つき)。down 0〜1 で押し下げ
const HmCHanko: React.FC<{ x: number; y: number; s?: number; down: number }> = ({ x, y, s = 1, down }) => (
  <g transform={`translate(${x} ${y - (1 - down) * 70}) scale(${s})`}>
    <ellipse cx={0} cy={70 * (1 - down) + 4} rx={30} ry={9} fill={KRP.ink} opacity={0.15 + 0.15 * down} />
    <rect x={-24} y={-20} width={48} height={22} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -18 -20 Q -22 -70 0 -96 Q 22 -70 18 -20 Z" fill={HP.woodMid} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-96} r={14} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -8 -76 Q -10 -50 -6 -28" stroke={KRP.white} strokeWidth={4} opacity={0.5} fill="none" />
  </g>
);

// 年に d 日の印を、だいたい均等にばらまいた日の並び (seed で揺らす)
const spreadDays = (count: number, seed: number) =>
  Array.from({ length: count }, (_, i) => Math.min(364, Math.floor(((i + 0.2 + rnd(seed, i) * 0.6) / count) * 365)));
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

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #48 ある研究によると、江戸の中ごろまで、遊び日は年に20日ほど。
// 格: 図 / seed 5048
// 絵: どこ: 古文書を広げた学者の机 (和紙・筆・文鎮・眼鏡)。演出: 1年を表す横長の帯 (365マスを12か月に区切った巻物) に、遊び日の赤い印が**20個**ぽつぽつとつく。札「江戸の中ごろ」「約20日」。動き: 印が順番に押される (判子) / 筆が動く
// どこ: 学者の机を斜め上から。黒っぽい木の天板に、1年の巻物 (12か月×日の升) を広げ、文鎮で押さえる。硯・筆・眼鏡・古文書の束・湯のみ
// 演出: 朱の判子が升へ「とん」と降りるたびに赤い印が1つずつ増え、ちょうど20個で止まる。右下の木札のカウンターが 0→20
// 動き: カメラがゆっくり寄る / 判子が上下 / 筆置きの筆がころっと揺れる / 湯のみの湯気
const Hm048: React.FC<{ f: number }> = ({ f }) => {
  const SX = 220, SY = 250, SW = 1480, SH = 440;
  const marks = spreadDays(20, 48);
  const shown = 20 * seg(f, 4, 40);
  const n = Math.min(19, Math.floor(shown));
  const local = shown - Math.floor(shown); // いま押しているコマの進み
  const [hx, hy] = markPos(marks[n], SX, SY, SW, SH);
  const down = shown >= 20 ? 0 : Math.sin(Math.PI * local);
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const count = Math.min(20, Math.round(shown));
  return (
    <Frame f={f} seed={5048}>
      <g transform={`translate(960 500) scale(${cam}) translate(-960 -500)`}>
        {/* 机の天板と木目 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.desk} />
        <g stroke={C.deskLine} strokeWidth={5} fill="none" opacity={0.7}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M -40 ${40 + i * 130} q 500 ${rnd(4801, i) * 30 - 15} 1000 0 q 500 ${rnd(4802, i) * 30 - 15} 1000 0`} />
          ))}
        </g>
        <rect x={-40} y={1000} width={2000} height={80} fill={C.deskDark} />
        {/* 奥: 古文書の束 (紐でしばる) */}
        <g transform="rotate(-4 330 140)">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={170 + i * 6} y={70 + i * 18} width={340} height={70} rx={4} fill={i % 2 ? C.washiDark : C.washi} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={320} y={60} width={18} height={130} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 奥右: 眼鏡 (丸眼鏡) */}
        <g transform="translate(1530 150) rotate(8)">
          <circle cx={-44} cy={0} r={36} fill={HP.screenCore} opacity={0.4} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={44} cy={0} r={36} fill={HP.screenCore} opacity={0.4} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -8 -4 Q 0 -14 8 -4" stroke={KRP.ink} strokeWidth={5} fill="none" />
          <path d="M -80 0 L -150 30 M 80 0 L 150 -10" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -60 -16 q 10 -10 22 -10" stroke={KRP.white} strokeWidth={4} fill="none" />
        </g>
        {/* 巻物 */}
        <HmCScroll x={SX} y={SY} w={SW} h={SH} marks={marks} shown={shown} f={f} />
        {/* 文鎮 (左右) */}
        {[SX + 120, SX + SW - 120].map((bx, i) => (
          <g key={i}>
            <rect x={bx - 70} y={SY + SH - 24} width={140} height={34} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={bx - 60} y={SY + SH - 20} width={120} height={8} rx={4} fill={KRP.silver} opacity={0.6} />
          </g>
        ))}
        {/* 手前左: 硯と墨 */}
        <g transform="translate(330 860)">
          <rect x={-140} y={-70} width={280} height={140} rx={20} fill={C.sumi} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={-40} cy={0} rx={80} ry={44} fill="#1A1816" />
          <ellipse cx={-56} cy={-12} rx={22} ry={8} fill={KRP.white} opacity={0.18} />
          <rect x={60} y={-50} width={44} height={100} rx={6} fill="#24201C" stroke={KRP.ink} strokeWidth={4} transform="rotate(14 82 0)" />
        </g>
        {/* 筆と筆置き (筆がころっと揺れる) */}
        <g transform={`translate(760 880) rotate(${-8 + Math.sin(f / 7) * 3})`}>
          <rect x={-200} y={-12} width={340} height={24} rx={10} fill="#C9A15A" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-200} y={-12} width={40} height={24} rx={6} fill={KRP.ink} />
          <path d="M 140 -12 Q 210 0 140 12 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <path d="M 600 912 q 20 -30 40 0 q 20 -30 40 0" fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 手前右: 湯のみ (湯気) */}
        <g transform="translate(1560 860)">
          <path d="M -60 -60 L 60 -60 L 48 50 Q 0 64 -48 50 Z" fill="#8FA88A" stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-60} rx={60} ry={14} fill="#6B8A3E" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-16 + i * 30} -84 q 12 -20 0 -40 q -12 -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none"
              opacity={0.55} transform={`translate(0 ${-((f * 1.2 + i * 14) % 26)})`} />
          ))}
        </g>
        {/* 朱の判子 */}
        <HmCHanko x={hx} y={hy - 6} down={down} s={1.25} />
        {/* 押した瞬間の小さな衝撃 */}
        {down > 0.85 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
            <line x1={hx - 34} y1={hy - 4} x2={hx - 50} y2={hy - 14} />
            <line x1={hx + 34} y1={hy - 4} x2={hx + 50} y2={hy - 14} />
          </g>
        )}
      </g>
      {/* 札 */}
      <TagPlate x={420} y={170} text="江戸の中ごろ" size={44} t={seg(f, 0, 10)} rot={-2} />
      <g transform="translate(1520 770)">
        <rect x={-190} y={-58} width={380} height={116} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-128} cy={0} r={30} fill={HP.rest} stroke={KRP.red} strokeWidth={4} />
        <text x={-80} y={20} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>約</text>
        <text x={90} y={22} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.red}>{count}</text>
        <text x={100} y={20} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>日</text>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #49 それが江戸の終わりには、30日、40日と増え、多い村では80日にもなりました。
// 格: 図 / seed 5049
// 絵: どこ: #48 と同じ机の巻物 (続き。カメラが少し引く)。演出: 赤い印がどんどん増えていく (20→30→40)、さらに右端に別の巻物「多い村」が転がって広がり、印が80個。カウンター札「20日→40日→80日」が数字だけぱらぱら変わる。学者がずり落ちた眼鏡を押さえる。動き: 印が加速して増える / 巻物が転がる / 数字がめくれる
// どこ: #48 と同じ学者の机 (同じ天板・硯・湯のみ)。カメラが引いて、机の左に学者 (眼鏡) が見える
// 演出: 上の巻物の印が 20→40 と加速して増える。右下から「多い村」の巻物が転がってきて広がり、印が80個びっしり。学者はずり落ちた眼鏡を指で押し上げてのぞきこむ
// 動き: カメラが引く / 印が加速 / 巻物が転がる / カウンターの数字がめくれる / 眼鏡がずり落ちて押し上げられる
const Hm049: React.FC<{ f: number }> = ({ f }) => {
  const S1 = { x: 560, y: 205, w: 1180, h: 290 };
  const S2 = { x: 560, y: 545, w: 1180, h: 262 };
  const m1 = spreadDays(40, 49);
  const m2 = spreadDays(80, 491);
  const a = seg(f, 0, 22);
  const shown1 = 20 + 20 * a * a; // 加速して増える
  const roll = easeOut(seg(f, 16, 30));
  const shown2 = 80 * seg(f, 26, 40);
  const cam = lerp(1.04, 0.96, easeInOut(seg(f, 0, 30)));
  const val = f < 26 ? Math.round(shown1 / 10) * 10 : (shown2 >= 79.5 ? 80 : Math.max(40, Math.round(shown2)));
  const stage = val >= 80 ? 2 : val >= 40 ? 1 : 0;
  // 眼鏡: ずり落ちる → 指で押し上げる
  const slide = seg(f, 6, 28) * 22 - easeOut(seg(f, 32, 38)) * 22;
  const push = seg(f, 28, 34) - seg(f, 38, 42);
  const px = 300, py = 1010, ps = 1.05;
  return (
    <Frame f={f} seed={5049}>
      <g transform={`translate(960 520) scale(${cam}) translate(-960 -520)`}>
        <rect x={-80} y={-80} width={2080} height={1240} fill={C.desk} />
        <g stroke={C.deskLine} strokeWidth={5} fill="none" opacity={0.7}>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M -80 ${20 + i * 120} q 500 ${rnd(4901, i) * 30 - 15} 1000 0 q 500 ${rnd(4902, i) * 30 - 15} 1100 0`} />
          ))}
        </g>
        {/* 硯と湯のみ (#48 と同じ物を端に) */}
        <g transform="translate(140 260)">
          <rect x={-110} y={-60} width={220} height={120} rx={18} fill={C.sumi} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={-30} cy={0} rx={60} ry={36} fill="#1A1816" />
        </g>
        <g transform="translate(1850 940)">
          <path d="M -50 -50 L 50 -50 L 40 40 Q 0 52 -40 40 Z" fill="#8FA88A" stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-50} rx={50} ry={12} fill="#6B8A3E" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 上の巻物 (同じ村・江戸の終わりへ) */}
        <HmCScroll x={S1.x} y={S1.y} w={S1.w} h={S1.h} marks={m1} shown={shown1} f={f} />
        {/* 下の巻物「多い村」: 左端を残して、右へ転がりながら広がる */}
        <defs>
          <clipPath id="hmc049roll">
            <rect x={S2.x - 30} y={S2.y - 40} width={30 + S2.w * roll} height={S2.h + 80} />
          </clipPath>
        </defs>
        {roll > 0 && (
          <g>
            <g clipPath="url(#hmc049roll)">
              <HmCScroll x={S2.x} y={S2.y} w={S2.w} h={S2.h} marks={m2} shown={shown2} f={f} newest={false} />
            </g>
            {/* 転がる巻き (太い筒) */}
            {roll < 0.999 && (
              <g transform={`translate(${S2.x + S2.w * roll} ${S2.y + S2.h / 2})`}>
                <rect x={-34} y={-S2.h / 2 - 20} width={68} height={S2.h + 40} rx={30} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
                <g transform={`rotate(${roll * 900})`}>
                  <line x1={-20} y1={0} x2={20} y2={0} stroke={C.washiDark} strokeWidth={4} />
                </g>
                {[0, 1, 2].map((i) => <line key={i} x1={-20 + i * 20} y1={-S2.h / 2 - 10} x2={-20 + i * 20} y2={S2.h / 2 + 10}
                  stroke={C.washiDark} strokeWidth={3} opacity={0.6} transform={`translate(${((roll * 400 + i * 20) % 60) - 30} 0)`} />)}
              </g>
            )}
          </g>
        )}
        {/* 学者 (机の左。眼鏡を押し上げる) */}
        <Person x={px} y={py} s={ps} f={f} face="surprised" pose="stand" cloth={C.shibu} clothDark={C.shibuDark} hair="none" phase={2} gaze={[5, -3]} />
        <HmCOver x={px} y={py} s={ps} f={f} phase={2} kind="elder" />
        {(() => {
          const bob = Math.sin((f + 2 * 17) / 13) * 3;
          const hx = px, hy = py + bob - 228 * ps; // 頭の中心
          const gy = hy + 6 * ps + slide;
          return (
            <g>
              {/* 丸眼鏡 (ずり落ちる) */}
              <g fill={HP.screenCore} fillOpacity={0.35} stroke={KRP.ink} strokeWidth={5}>
                <circle cx={hx - 24 * ps} cy={gy} r={22 * ps} />
                <circle cx={hx + 24 * ps} cy={gy} r={22 * ps} />
              </g>
              <line x1={hx - 4} y1={gy - 2} x2={hx + 4} y2={gy - 2} stroke={KRP.ink} strokeWidth={5} />
              {/* 押し上げる右腕と人さし指 */}
              <path d={`M ${hx + 67 * ps} ${py + bob - 148 * ps} Q ${hx + 110} ${gy + 40} ${hx + 10 + 30 * (1 - push)} ${gy + 26 - 14 * push}`}
                stroke={KRP.ink} strokeWidth={30 * ps} fill="none" strokeLinecap="round" />
              <path d={`M ${hx + 67 * ps} ${py + bob - 148 * ps} Q ${hx + 110} ${gy + 40} ${hx + 10 + 30 * (1 - push)} ${gy + 26 - 14 * push}`}
                stroke={C.shibu} strokeWidth={22 * ps} fill="none" strokeLinecap="round" />
              <circle cx={hx + 6 + 30 * (1 - push)} cy={gy + 22 - 14 * push} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              {/* 汗 */}
              <path d={`M ${hx - 70} ${hy - 30} q -8 14 0 20 q 8 -6 0 -20 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5}
                transform={`translate(0 ${(f % 20) * 0.8})`} />
            </g>
          );
        })()}
      </g>
      {/* 札とカウンター (同じ y に3つ並べる) */}
      <TagPlate x={300} y={175} text="江戸の終わり" size={40} t={seg(f, 0, 8)} rot={-2} />
      <TagPlate x={400} y={565} text="多い村" size={36} t={seg(f, 22, 30)} fill={C.washi} rot={3} />
      {[20, 40, 80].map((v, i) => {
        const on = stage >= i;
        const cx = 900 + i * 300;
        return (
          <g key={v}>
            <g transform={`translate(${cx} 100)`}>
              <rect x={-110} y={-46} width={220} height={92} rx={12} fill={on ? KRP.white : KRP.paper} stroke={KRP.ink} strokeWidth={5} opacity={on ? 1 : 0.55} />
              <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
                fill={i === stage ? KRP.red : KRP.ink} opacity={on ? 1 : 0.4}>
                {i === stage ? `${val}日` : `${v}日`}
              </text>
            </g>
            {i < 2 && <Arrow x={cx + 170} y={100} s={0.5} t={stage > i ? 1 : 0.4} color={stage > i ? KRP.red : KRP.gray} />}
          </g>
        );
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #50 増やした犯人は、村の若者たちです。
// 格: 山 / seed 5050
// 絵: どこ: 夜の村の若者宿 (若者の集会所・行灯・畳・壁の法被)。演出: 時代劇の「犯人はお前だ」風に、スポットライトが若者たち (5〜6人・鉢巻) に当たる。若者たちは**悪びれず得意げ**に腕組み (face="smile")。真ん中の若者が「遊び日」の札を掲げている。動き: スポットライトがぱっと当たる / 行灯のゆらぎ / 若者が札を掲げる
// どこ: 夜の村の若者宿。板壁・梁・壁にかけた法被と提灯・左右の行灯・畳の床
// 演出: 時代劇の「犯人はお前だ」。画面の外から伸びた指が若者たちを指し、上からスポットライトがぱっと当たる。若者5人は鉢巻で腕組み、悪びれずに胸を張ってにっこり。真ん中の若者が「遊び日」の札を高く掲げる。キラーンの光
// 動き: 指がぐいっと出る / スポットライトが f8 でぱっ / 行灯のゆらぎ / 札が持ち上がる / カメラが少し寄る
const Hm050: React.FC<{ f: number }> = ({ f }) => {
  const spot = seg(f, 8, 12);
  const lift = easeOut(seg(f, 16, 28));
  const pointIn = easeOut(seg(f, 0, 10));
  const cam = 1 + 0.06 * easeInOut(seg(f, 10, 42));
  const flick = 0.85 + 0.1 * Math.sin(f / 3) + 0.05 * Math.sin(f * 1.9);
  const YS = [
    { x: 420, lean: -3, phase: 1, band: KRP.white },
    { x: 690, lean: 2, phase: 4, band: KRP.red },
    { x: 1230, lean: -2, phase: 2, band: KRP.red },
    { x: 1500, lean: 3, phase: 5, band: KRP.white },
  ];
  const cy = 840, cs = 1.15;
  const handY = cy - 310 * cs - lift * 30;
  return (
    <Frame f={f} seed={5050} dark bg={C.nightWall2}>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        {/* 板壁と梁 */}
        <rect x={-60} y={-60} width={2040} height={720} fill={C.nightWall} />
        <g stroke={C.nightWall2} strokeWidth={6}>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130 - 20} y1={-60} x2={i * 130 - 20} y2={660} />)}
        </g>
        <rect x={-60} y={40} width={2040} height={46} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
        {[300, 1620].map((bx) => <rect key={bx} x={bx - 26} y={-60} width={52} height={720} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />)}
        {/* 壁の法被 (2枚) と提灯 */}
        {[[560, C.ai], [1360, KRP.red]].map(([hx, col], i) => (
          <g key={i} transform={`translate(${hx} 150) rotate(${Math.sin(f / 25 + i) * 1.5})`}>
            <line x1={-150} y1={0} x2={150} y2={0} stroke={HP.woodDark} strokeWidth={10} strokeLinecap="round" />
            <path d="M -140 6 L 140 6 L 120 70 L 90 70 L 90 250 L -90 250 L -90 70 L -120 70 Z" fill={col as string} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -24 6 L 0 120 L 24 6" fill="none" stroke={KRP.white} strokeWidth={10} />
            <rect x={-90} y={226} width={180} height={24} fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={0} cy={170} r={34} fill="none" stroke={KRP.white} strokeWidth={8} />
          </g>
        ))}
        <g transform="translate(960 130)">
          <line x1={0} y1={-70} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={20} rx={52} ry={66} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          {[-30, 0, 30].map((ly) => <path key={ly} d={`M -50 ${20 + ly} Q 0 ${28 + ly} 50 ${20 + ly}`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5} />)}
          <rect x={-30} y={-52} width={60} height={14} fill={KRP.ink} />
          <rect x={-30} y={80} width={60} height={14} fill={KRP.ink} />
        </g>
        {/* 畳 */}
        <rect x={-60} y={640} width={2040} height={520} fill={C.tatami} />
        <g stroke={C.tatamiDark} strokeWidth={3} opacity={0.7}>
          {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-60} y1={660 + i * 18} x2={1980} y2={660 + i * 18} />)}
        </g>
        {[[-60, 640, 700], [640, 640, 700], [1340, 640, 700]].map(([tx, ty, tw], i) => (
          <rect key={i} x={tx} y={ty} width={tw} height={480} fill="none" stroke={C.tatamiEdge} strokeWidth={14} />
        ))}
        <rect x={-60} y={630} width={2040} height={18} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 左右の行灯 */}
        {[150, 1770].map((ax, i) => (
          <g key={ax}>
            <ellipse cx={ax} cy={560} rx={220 * flick} ry={260 * flick} fill={C.andon} opacity={0.16} />
            <rect x={ax - 56} y={440} width={112} height={180} fill={C.andon} opacity={0.6 + 0.4 * flick} stroke={KRP.ink} strokeWidth={6} />
            <g stroke={HP.woodDark} strokeWidth={4}>
              <line x1={ax - 56} y1={500} x2={ax + 56} y2={500} /><line x1={ax - 56} y1={560} x2={ax + 56} y2={560} />
              <line x1={ax} y1={440} x2={ax} y2={620} />
            </g>
            <rect x={ax - 66} y={430} width={132} height={16} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            {[-50, 50].map((lx) => <rect key={lx} x={ax + lx - 6} y={620} width={12} height={90} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
            <ellipse cx={ax + (i ? -1 : 1) * 2} cy={530} rx={8} ry={14 * flick} fill={HP.spark} />
          </g>
        ))}
        {/* 闇 (スポットライトの外を暗く) */}
        <rect x={-60} y={-60} width={2040} height={1220} fill="#000" opacity={0.45 * spot} />
        {/* スポットライト */}
        {spot > 0 && [[420, 0.9], [690, 0.95], [960, 1.25], [1230, 0.95], [1500, 0.9]].map(([sx, w], i) => (
          <g key={i} opacity={spot}>
            <polygon points={`${sx - 40},-60 ${sx + 40},-60 ${sx + 170 * (w as number)},${cy + 10} ${sx - 170 * (w as number)},${cy + 10}`}
              fill={C.lampGlass} opacity={0.22} />
            <ellipse cx={sx} cy={cy + 6} rx={180 * (w as number)} ry={38} fill={C.lampGlass} opacity={0.4} />
          </g>
        ))}
        {/* 若者たち (腕組み・得意げ) */}
        {YS.map((y, i) => (
          <g key={i}>
            <Person x={y.x} y={830} s={1.02} f={f} face="smile" pose="armsFolded" cloth={C.ai} clothDark={C.momo} lean={y.lean} phase={y.phase} gaze={[0, -4]} />
            <HmCOver x={y.x} y={830} s={1.02} f={f} phase={y.phase} lean={y.lean} kind="young" band={y.band} />
          </g>
        ))}
        {/* 真ん中の若者: 札を掲げる */}
        <Person x={960} y={cy} s={cs} f={f} face="smile" pose="raise" cloth={C.ai} clothDark={C.momo} phase={0} gaze={[0, -5]} />
        <HmCOver x={960} y={cy} s={cs} f={f} phase={0} kind="young" band={KRP.red} />
        <line x1={960 + 67 * cs} y1={handY + 20} x2={960 + 67 * cs} y2={handY - 40} stroke={HP.woodDark} strokeWidth={12} strokeLinecap="round" />
        {/* キラーン */}
        {spot > 0.9 && [[420, 0], [690, 1], [1230, 2], [1500, 3], [960, 4]].map(([kx, k]) => {
          const tw = 0.6 + 0.4 * Math.sin(f / 2 + k);
          const ky = (kx === 960 ? cy - 300 * cs : 830 - 300 * 1.02) - 6;
          return (
            <path key={k} transform={`translate(${kx + 70} ${ky}) scale(${tw})`}
              d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={3} />
          );
        })}
      </g>
      {/* 掲げた札 (カメラの外に出して文字を端で切らない) */}
      <TagPlate x={67 * cs * cam + 960} y={(handY - 60 - 560) * cam + 560} text="遊び日" size={56} t={seg(f, 14, 22)} fill={HP.restSoft} color={KRP.red} rot={-4} />
      {/* 画面の外から指さし (犯人はお前だ) */}
      <g transform={`translate(${lerp(-420, 0, pointIn)} 0) rotate(14 0 365)`}>
        <rect x={-60} y={330} width={300} height={70} rx={30} fill={C.shibu} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={250} cy={365} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={262} y={348} width={90} height={26} rx={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={pointIn}>
          <line x1={372} y1={330} x2={400} y2={312} /><line x1={378} y1={362} x2={412} y2={362} /><line x1={372} y1={394} x2={400} y2={412} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #51 新しい神さまがはやると、そのお祭りの日を、休みにしてほしいと願い出ます。
// 格: 山 / seed 5051
// 絵: どこ: 庄屋の屋敷の座敷 (村役人)。演出: 若者の代表が、新しい神さまの小さなお札 (宝船や狐のマーク) を掲げて、頭を下げて願い出る。庄屋 (渋茶の着物・年寄り) は腕組みでうーんと考える (face="worried")。障子の外から若者たちがのぞいている。動き: お札がきらっと光る / 障子のすき間の目がぱちぱち / 庄屋がうなる
// どこ: 庄屋の屋敷の座敷。奥に床の間 (掛け軸・花瓶)、右奥は障子、欄間、畳と座布団
// 演出: 左で若者の代表が深々と頭を下げ、新しい神さまのお札 (狐の印) を両手で差し出す。右の座布団で庄屋 (渋茶・白髪) が腕組みしてうーんと考える。障子の破れ穴から若者たちの目がのぞいてぱちぱち
// 動き: 若者がお辞儀する / お札がきらっ / 障子の目がまばたき・きょろきょろ / 庄屋の頭の上でうなりの渦が回る / カメラが右へ少しパン
const Hm051: React.FC<{ f: number }> = ({ f }) => {
  const bow = easeOut(seg(f, 2, 16));
  const shine = seg(f, 18, 26) - seg(f, 30, 40) * 0.5;
  const pan = -40 * easeInOut(seg(f, 0, 42));
  const ux = 560, uy = 830, us = 1.2;
  const ex = 1330, ey = 800, es = 1.12;
  const EYES = [[1010, 300, 0], [1200, 420, 1], [1520, 260, 2], [1700, 470, 3]];
  return (
    <Frame f={f} seed={5051}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁・欄間 */}
        <rect x={-60} y={-60} width={2100} height={700} fill="#E8D9B6" />
        <rect x={-60} y={-60} width={2100} height={120} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${40 + i * 170} 50 q 40 -50 80 0 q 40 50 80 0`} stroke={HP.woodDark} strokeWidth={6} fill="none" />
        ))}
        <rect x={-60} y={60} width={2100} height={22} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 床の間 */}
        <rect x={80} y={82} width={560} height={560} fill="#D9C79E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={90} y={600} width={540} height={40} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(360 120) rotate(${Math.sin(f / 30) * 0.8} 0 0)`}>
          <rect x={-90} y={0} width={180} height={400} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-90} y={0} width={180} height={40} fill="#6A7F5A" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-90} y={360} width={180} height={40} fill="#6A7F5A" stroke={KRP.ink} strokeWidth={4} />
          {/* 墨絵の山と月 */}
          <path d="M -70 300 L -20 200 L 10 250 L 40 180 L 76 300 Z" fill="#8C8C84" opacity={0.7} />
          <circle cx={40} cy={110} r={22} fill="none" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-104} y={396} width={208} height={16} rx={8} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="translate(180 600)">
          <path d="M -30 0 Q -40 -60 -14 -90 L 14 -90 Q 40 -60 30 0 Z" fill="#5E7F9A" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 0 -90 Q -20 -160 -40 -190 M 0 -90 Q 10 -170 30 -200" stroke={KRP.green} strokeWidth={6} fill="none" />
          <circle cx={-40} cy={-194} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={30} cy={-204} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 右奥の障子 (破れ穴から目がのぞく) */}
        <rect x={760} y={82} width={1200} height={560} fill={C.shoji} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.shojiFrame} strokeWidth={6}>
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={760 + i * 150} y1={82} x2={760 + i * 150} y2={642} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={760} y1={82 + i * 112} x2={1960} y2={82 + i * 112} />)}
        </g>
        {EYES.map(([hx, hy, k]) => {
          const look = Math.sin(f / 6 + k) * 5;
          const shut = ((f + k * 13) % 26) < 3;
          return (
            <g key={k}>
              <path d={`M ${hx - 70} ${hy} q 10 -40 70 -44 q 60 4 70 44 q -10 40 -70 40 q -60 0 -70 -40 Z`} fill={C.nightWall} stroke={KRP.ink} strokeWidth={4} />
              {k % 2 === 0 && <path d={`M ${hx - 60} ${hy - 30} Q ${hx} ${hy - 44} ${hx + 60} ${hy - 30} L ${hx + 58} ${hy - 20} Q ${hx} ${hy - 34} ${hx - 58} ${hy - 20} Z`} fill={KRP.red} />}
              {[-28, 28].map((dx) => shut ? (
                <line key={dx} x1={hx + dx - 14} y1={hy} x2={hx + dx + 14} y2={hy} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" />
              ) : (
                <g key={dx}>
                  <ellipse cx={hx + dx} cy={hy} rx={15} ry={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                  <circle cx={hx + dx + look} cy={hy + 3} r={7} fill={KRP.ink} />
                </g>
              ))}
              {/* ちぎれた紙のふち */}
              <path d={`M ${hx - 74} ${hy - 4} l 10 -10 l 6 10 M ${hx + 66} ${hy + 10} l 10 6 l -4 10`} stroke={C.washiDark} strokeWidth={4} fill="none" />
            </g>
          );
        })}
        {/* 畳 */}
        <rect x={-60} y={640} width={2100} height={520} fill={C.tatami} />
        <g stroke={C.tatamiDark} strokeWidth={3} opacity={0.7}>
          {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-60} y1={660 + i * 18} x2={2040} y2={660 + i * 18} />)}
        </g>
        {[[-60, 960], [960, 1100]].map(([tx, tw], i) => (
          <rect key={i} x={tx} y={640} width={tw} height={480} fill="none" stroke={C.tatamiEdge} strokeWidth={14} />
        ))}
        <rect x={-60} y={632} width={2100} height={16} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 庄屋の座布団と煙草盆 */}
        <path d={`M ${ex - 190} ${ey + 4} L ${ex + 190} ${ey + 4} L ${ex + 220} ${ey + 60} L ${ex - 220} ${ey + 60} Z`} fill="#8A3E4A" stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(1720 820)">
          <rect x={-90} y={-60} width={180} height={70} rx={6} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-70} y={-96} width={60} height={40} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M -40 -100 q 12 -20 0 -40 q -12 -20 0 -40`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.5}
            transform={`translate(0 ${-((f * 1.1) % 22)})`} />
          <rect x={20} y={-110} width={14} height={56} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 庄屋 (腕組み・うーん) */}
        <Person x={ex} y={ey} s={es} f={f} face="worried" pose="armsFolded" cloth={C.shibu} clothDark={C.shibuDark} hair="none" phase={3} lean={-3} gaze={[-6, 2]} />
        <HmCOver x={ex} y={ey} s={es} f={f} phase={3} lean={-3} kind="elder" />
        {/* 正座のひざ (脚を隠す) */}
        <path d={`M ${ex - 120} ${ey - 64} Q ${ex - 140} ${ey + 4} ${ex - 100} ${ey + 8} L ${ex + 100} ${ey + 8} Q ${ex + 140} ${ey + 4} ${ex + 120} ${ey - 64} Z`}
          fill={C.shibu} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${ex} ${ey - 60} L ${ex} ${ey + 6}`} stroke={C.shibuDark} strokeWidth={4} />
        {/* うなりの渦 */}
        <g transform={`translate(${ex + 20} ${ey - 360 * es}) rotate(${f * 8})`}>
          <path d="M 0 0 m -30 0 a 30 30 0 1 1 30 30 a 20 20 0 1 1 -20 -20 a 10 10 0 1 1 10 10" stroke={KRP.ink} strokeWidth={5} fill="none" />
        </g>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${ex + 90 + i * 22} ${ey - 300 * es + i * 14} q 10 -10 0 -20`} stroke={KRP.ink} strokeWidth={4} fill="none"
            opacity={0.4 + 0.6 * ((Math.floor(f / 5) + i) % 3 === 0 ? 1 : 0)} />
        ))}
        {/* 若者の代表 (お辞儀してお札を差し出す) */}
        <g transform={`rotate(${22 * bow} ${ux} ${uy - 60})`}>
          <Person x={ux} y={uy} s={us} f={f} face="normal" pose="hold" cloth={C.ai} clothDark={C.momo} phase={1} still gaze={[6, 6]} />
          <HmCOver x={ux} y={uy} s={us} f={0} phase={1} kind="young" band={KRP.red} />
          {/* お札へ伸ばす両腕 */}
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <line x1={ux + sd * 50 * us} y1={uy - 140 * us} x2={ux + 128 * us} y2={uy - 130 * us + sd * 10} stroke={KRP.ink} strokeWidth={30 * us} strokeLinecap="round" />
              <line x1={ux + sd * 50 * us} y1={uy - 140 * us} x2={ux + 128 * us} y2={uy - 130 * us + sd * 10} stroke={C.ai} strokeWidth={21 * us} strokeLinecap="round" />
            </g>
          ))}
          {/* お札 (狐の印) */}
          <g transform={`translate(${ux + 150 * us} ${uy - 190 * us}) rotate(${-22 * bow - 8})`}>
            {shine > 0 && <circle r={90 + 20 * shine} fill={HP.spark} opacity={0.35 * shine} />}
            <rect x={-40} y={-80} width={80} height={160} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -40 -80 L 0 -100 L 40 -80 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            {/* 狐の顔 */}
            <path d="M -24 -30 L -18 -54 L -6 -36 L 6 -36 L 18 -54 L 24 -30 Q 22 0 0 14 Q -22 0 -24 -30 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -14 -24 l 8 4 M 14 -24 l -8 4" stroke={KRP.ink} strokeWidth={3} />
            <circle cx={0} cy={8} r={3.5} fill={KRP.ink} />
            <rect x={-20} y={30} width={40} height={36} fill={KRP.red} opacity={0.8} stroke={KRP.ink} strokeWidth={2.5} />
            {shine > 0.3 && <path d="M 46 -70 l 6 16 l 16 6 l -16 6 l -6 16 l -6 -16 l -16 -6 l 16 -6 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={2.5} />}
          </g>
        </g>
        {/* 若者の正座のひざ (お辞儀しても床に残る) */}
        <path d={`M ${ux - 110} ${uy - 64} Q ${ux - 130} ${uy + 4} ${ux - 90} ${uy + 8} L ${ux + 100} ${uy + 8} Q ${ux + 140} ${uy + 4} ${ux + 120} ${uy - 64} Z`}
          fill={C.ai} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <TagPlate x={1330} y={150} text="庄屋" size={40} t={seg(f, 4, 12)} />
      <TagPlate x={560} y={150} text="新しい神さま" size={40} t={seg(f, 14, 22)} fill={HP.restSoft} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #52 神さまが1人増えるたびに、休みが1日増える。
// 格: 図 / seed 5052
// 絵: どこ: 神棚の前の板の間。演出: 神棚に小さな神さまの像 (丸い顔の小さな置物・それぞれ違う色) が**1体ずつ**ぽん、ぽんと増え、そのたびに下の暦に赤い休みの日が1日ずつ増える (神さま3体→休み3日)。矢印で神さまと休みをつなぐ。動き: 神さまが増える (f6/18/30) / 暦が塗られる / ろうそくのゆらぎ
// どこ: 村の家の板の間。板壁の上に神棚 (しめ縄と紙垂・榊・小さなお社)、その下の壁に村の暦 (ひと月30日の升)。左右の燭台
// 演出: 神棚に小さな神さまの置物 (丸顔・赤/青/緑) が f6/18/30 にぽん、ぽん、ぽんと1体ずつ現れ、そのたびに矢印が下へ伸びて暦の1日が赤く塗られる。下の札「神さま」と「休み」の数がそろって 1→2→3
// 動き: 神さまのぽん (けむり) / 矢印が伸びる / 升が塗られる / ろうそくの炎のゆらぎ / 紙垂のゆれ / カメラがゆっくり寄る
const Hm052: React.FC<{ f: number }> = ({ f }) => {
  const T = [6, 18, 30];
  const GX = [700, 960, 1220];
  const GCOL: [string, string][] = [[KRP.red, "#9E2E22"], [KRP.blueDeep, "#34548F"], [KRP.green, "#4E8A4A"]];
  const KX = 390, KY = 470, CW = 76, CH = 96;
  const DAYS = [5, 23, 11]; // 神さまの真下あたりの日
  const cellPos = (d: number): [number, number] => {
    const c = (d - 1) % 15, r = Math.floor((d - 1) / 15);
    return [KX + 38 + c * CW + CW / 2, KY + 40 + r * CH + CH / 2];
  };
  const appear = T.map((t) => seg(f, t, t + 6));
  const fill = T.map((t) => seg(f, t + 5, t + 10));
  const count = fill.filter((v) => v > 0.5).length;
  const cam = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const flick = (k: number) => 1 + 0.12 * Math.sin(f / 2.3 + k) + 0.06 * Math.sin(f * 1.7 + k);
  return (
    <Frame f={f} seed={5052}>
      <g transform={`translate(960 420) scale(${cam}) translate(-960 -420)`}>
        {/* 板壁 */}
        <rect x={-60} y={-60} width={2040} height={840} fill={C.ita} />
        <g stroke={C.itaDark} strokeWidth={5}>
          {Array.from({ length: 17 }, (_, i) => <line key={i} x1={i * 124 - 30} y1={-60} x2={i * 124 - 30} y2={780} />)}
        </g>
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={rnd(5201, i) * 1900} cy={rnd(5202, i) * 700} rx={10} ry={18} fill="none" stroke={C.itaDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 神棚 */}
        <rect x={500} y={330} width={920} height={34} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={6} />
        {[540, 1380].map((bx) => <path key={bx} d={`M ${bx - 20} 364 L ${bx + 20} 364 L ${bx} 420 Z`} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 小さなお社 (奥) */}
        <g transform="translate(960 250) scale(0.8) translate(0 20)">
          <path d="M -120 -20 L 0 -90 L 120 -20 Z" fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-90} y={-20} width={180} height={100} fill={HP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-30} y={0} width={60} height={80} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={36} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 榊 */}
        {[560, 1360].map((sx, i) => (
          <g key={sx} transform={`translate(${sx} 330)`}>
            <rect x={-22} y={-56} width={44} height={56} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {[-1, 0, 1].map((k) => <ellipse key={k} cx={k * 22} cy={-90 - Math.abs(k) * -10} rx={14} ry={34} fill={C.ineDark} stroke={KRP.ink} strokeWidth={3}
              transform={`rotate(${k * 26 + Math.sin(f / 15 + i) * 2} ${k * 22} -56)`} />)}
          </g>
        ))}
        {/* しめ縄と紙垂 */}
        <path d="M 480 84 Q 960 150 1440 84" stroke={C.wara} strokeWidth={22} fill="none" />
        <path d="M 480 84 Q 960 150 1440 84" stroke={KRP.ink} strokeWidth={3} fill="none" strokeDasharray="14 10" />
        {[640, 800, 1120, 1280].map((sx, i) => {
          const sy = 84 + (1 - Math.pow((sx - 960) / 480, 2)) * 33 + 4;
          return (
            <path key={sx} transform={`rotate(${Math.sin(f / 9 + i) * 4} ${sx} ${sy})`}
              d={`M ${sx - 10} ${sy} l 20 0 l 0 22 l -20 0 l 0 22 l 20 0 l 0 22 l -20 0`} stroke={KRP.ink} strokeWidth={3} fill={KRP.white} />
          );
        })}
        {/* 暦 (ひと月30日) */}
        <rect x={KX + 8} y={KY + 8} width={1180} height={260} fill={KRP.ink} opacity={0.2} />
        <rect x={KX} y={KY} width={1180} height={260} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <rect x={KX} y={KY} width={1180} height={32} fill={C.washiDark} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, k) => {
          const d = k + 1;
          const [cx, cy] = cellPos(d);
          const di = DAYS.indexOf(d);
          const p = di >= 0 ? fill[di] : 0;
          return (
            <g key={d}>
              <rect x={cx - CW / 2 + 3} y={cy - CH / 2 + 3} width={CW - 6} height={CH - 6} rx={6} fill={KRP.cream} stroke={C.washiDark} strokeWidth={2} />
              {p > 0 && <rect x={cx - CW / 2 + 3} y={cy - CH / 2 + 3} width={CW - 6} height={CH - 6} rx={6} fill={HP.restSoft} stroke={HP.rest} strokeWidth={5}
                transform={`translate(${cx} ${cy}) scale(${pop(p)}) translate(${-cx} ${-cy})`} />}
              <text x={cx} y={cy + 12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={p > 0.5 ? KRP.red : KRP.ink}>{d}</text>
            </g>
          );
        })}
        {/* 神さま → 休みの矢印 */}
        {GX.map((gx, i) => {
          const a = seg(f, T[i] + 2, T[i] + 7);
          if (a <= 0) return null;
          const [tx, ty] = cellPos(DAYS[i]);
          const sx = gx, sy = 380;
          const ex = lerp(sx, tx, a), ey = lerp(sy, ty - CH / 2 - 4, a);
          return (
            <g key={i}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={KRP.red} strokeWidth={8} strokeDasharray="14 10" strokeLinecap="round" />
              {a > 0.9 && <path d={`M ${ex} ${ey + 4} l -14 -22 l 28 0 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3}
                transform={`rotate(${Math.atan2(ey - sy, ex - sx) * 180 / Math.PI - 90} ${ex} ${ey})`} />}
            </g>
          );
        })}
        {/* 神さまの置物 */}
        {GX.map((gx, i) => {
          const a = appear[i];
          if (a <= 0) return null;
          const sc = pop(a);
          const [c1, c2] = GCOL[i];
          const wob = Math.sin(f / 6 + i * 2) * 2;
          return (
            <g key={i}>
              {a < 1 && [0, 1, 2, 3, 4].map((k) => (
                <circle key={k} cx={gx + Math.cos(k * 1.26) * 80 * a} cy={300 + Math.sin(k * 1.26) * 50 * a} r={20 * (1 - a) + 6}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={1 - a} />
              ))}
              <g transform={`translate(${gx} 330) scale(${sc}) rotate(${wob})`}>
                <ellipse cx={0} cy={-2} rx={62} ry={10} fill={KRP.ink} opacity={0.25} />
                <path d="M -58 0 Q -66 -80 0 -96 Q 66 -80 58 0 Z" fill={c1} stroke={KRP.ink} strokeWidth={5} />
                <path d="M -30 -10 Q 0 -60 30 -10" stroke={c2} strokeWidth={6} fill="none" />
                <circle cx={0} cy={-126} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                <path d="M -18 -128 q 6 -8 12 0 M 6 -128 q 6 -8 12 0" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
                <path d="M -10 -108 Q 0 -98 10 -108" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
                <circle cx={-24} cy={-112} r={7} fill={HP.restSoft} /><circle cx={24} cy={-112} r={7} fill={HP.restSoft} />
                {/* それぞれ違う帽子・持ち物 */}
                {i === 0 && <path d="M -34 -156 Q 0 -190 34 -156 Q 0 -166 -34 -156 Z" fill={c2} stroke={KRP.ink} strokeWidth={4} />}
                {i === 1 && <path d="M -30 -158 L 0 -196 L 30 -158 Z" fill={c2} stroke={KRP.ink} strokeWidth={4} />}
                {i === 2 && <g><rect x={-30} y={-176} width={60} height={22} rx={8} fill={c2} stroke={KRP.ink} strokeWidth={4} /><circle cx={0} cy={-182} r={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} /></g>}
                {i === 0 && <g transform="translate(46 -40)"><rect x={-6} y={-40} width={12} height={46} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={3} /><rect x={-22} y={-58} width={44} height={24} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} /></g>}
                {i === 1 && <g transform="translate(-48 -40)"><circle r={18} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} /><path d="M -6 -4 l 6 8 l 6 -8" stroke={KRP.ink} strokeWidth={3} fill="none" /></g>}
                {i === 2 && <g transform="translate(46 -50)"><path d="M 0 0 Q 26 -10 30 14 Q 10 24 0 0 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} /></g>}
              </g>
            </g>
          );
        })}
        {/* 板の間 */}
        <rect x={-60} y={770} width={2040} height={400} fill={C.itaDark} />
        <rect x={-60} y={762} width={2040} height={16} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.desk} strokeWidth={4}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={810 + i * 50} x2={1980} y2={810 + i * 50} />)}</g>
        {/* 燭台とろうそく */}
        {[190, 1730].map((cx, k) => (
          <g key={cx}>
            <ellipse cx={cx} cy={380} rx={120 * flick(k)} ry={150 * flick(k)} fill={HP.spark} opacity={0.12} />
            <rect x={cx - 10} y={440} width={20} height={360} fill={KRP.ink} />
            <ellipse cx={cx} cy={800} rx={70} ry={16} fill={KRP.ink} />
            <ellipse cx={cx} cy={440} rx={50} ry={12} fill={KRP.ink} />
            <rect x={cx - 18} y={340} width={36} height={100} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <line x1={cx} y1={340} x2={cx} y2={326} stroke={KRP.ink} strokeWidth={3} />
            <path transform={`translate(${cx} 326) scale(${flick(k)} ${flick(k + 1)})`} d="M 0 -50 Q 18 -20 12 -4 Q 0 6 -12 -4 Q -18 -20 0 -50 Z" fill={HP.spark} stroke={KRP.orange} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 数の札 (同じ y にそろえる) */}
      {[["神さま", 560], ["休み", 1360]].map(([lab, x], i) => (
        <g key={i} transform={`translate(${x} 770)`}>
          <rect x={-170} y={-48} width={340} height={96} rx={14} fill={i ? HP.restSoft : KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <text x={-30} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.ink}>{lab}</text>
          <text x={110} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={KRP.red}>{i ? `${count}日` : `${count}`}</text>
        </g>
      ))}
      <text x={960} y={790} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.ink}>=</text>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #53 そして、休みの守らせ方が、なかなか厳しい。
// 格: 並 / seed 5053
// 絵: どこ: 村の辻の高札 (#40 と同じ高札・アップ)。演出: 高札に釘が打たれ、巾着と×の鍬のマークの決まりが掲げられる。釘を打つ若者の木槌がとん、とん (ゆっくり)。周りの村人が背筋を伸ばす。動き: 木槌 (10コマに1回) / 村人がぴしっと / 高札のゆれ
// どこ: 村の辻の高札 (屋根つきの掲示板・石の土台) のアップ。背景に土の道・わら屋根の家・山
// 演出: 高札に新しい決まりの板が打ちつけられる。板の絵は「×のついた鍬 → 巾着」(働いたら罰金)。右で若者が踏み台に乗って木槌でとん、とん。左の村人2人が背筋をぴしっと伸ばす
// 動き: 木槌 (12コマに1回・小さく) / 打つたびに高札と板が小さくゆれる / 村人が猫背からぴしっ / 遠くの雲
const Hm053: React.FC<{ f: number }> = ({ f }) => {
  const h = (f % 12) / 12;
  const ang = h < 0.7 ? -34 * easeOut(h / 0.7) : -34 * (1 - (h - 0.7) / 0.3);
  const hit = f % 12 < 2 && f > 4 ? 1 : 0;
  const sway = hit * 1.2 * (f % 2 ? -1 : 1);
  const plank = easeOut(seg(f, 0, 8));
  const straight = easeOut(seg(f, 12, 18));
  const BX = 960;
  const ys = 1.1, yx = 1450, yy = 770;
  const bob = Math.sin((f + 2 * 17) / 13) * 3;
    const hand: [number, number] = [yx - 67 * ys - 20, yy + bob - 300 * ys];
  const aim = Math.atan2(400 - hand[1], BX + 284 - hand[0]) * 180 / Math.PI;
  return (
    <Frame f={f} seed={5053}>
      {/* 空・雲・山 */}
      <rect x={-40} y={-40} width={2000} height={700} fill={C.sky} />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${((f * 0.6 + i * 900) % 2200) - 200} ${110 + i * 60})`}>
          <ellipse rx={110} ry={34} fill={KRP.white} opacity={0.9} /><ellipse cx={60} cy={-20} rx={70} ry={30} fill={KRP.white} opacity={0.9} />
        </g>
      ))}
      <path d="M -40 520 Q 300 300 620 470 Q 900 340 1240 480 Q 1560 320 1960 500 L 1960 700 L -40 700 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
      {/* わら屋根の家 */}
      {[[220, 560, 1], [1700, 570, 0.9]].map(([hx, hy, s], i) => (
        <g key={i} transform={`translate(${hx} ${hy}) scale(${s})`}>
          <rect x={-130} y={-30} width={260} height={130} fill="#C9A878" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -170 -20 L 0 -170 L 170 -20 Z" fill={C.wara} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -120 -40 L 0 -146 L 120 -40" stroke={C.waraDark} strokeWidth={5} fill="none" />
          <rect x={-40} y={10} width={80} height={90} fill="#5A4636" stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 土の道 */}
      <rect x={-40} y={660} width={2000} height={460} fill={C.tsuchi} />
      <path d="M 700 1120 L 880 660 L 1040 660 L 1220 1120 Z" fill="#CDB585" />
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={rnd(5301, i) * 1900} cy={700 + rnd(5302, i) * 380} rx={14} ry={6} fill={C.mud} opacity={0.5} />)}
      {/* 高札 */}
      <g transform={`rotate(${sway} ${BX} 800)`}>
        <rect x={BX - 380} y={700} width={760} height={70} fill="#A9A49A" stroke={KRP.ink} strokeWidth={6} />
        {[BX - 320, BX + 320].map((px) => <rect key={px} x={px - 22} y={150} width={44} height={560} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={6} />)}
        <path d={`M ${BX - 450} 170 L ${BX} 70 L ${BX + 450} 170 L ${BX + 420} 190 L ${BX - 420} 190 Z`} fill="#5E4A38" stroke={KRP.ink} strokeWidth={7} />
        <rect x={BX - 340} y={196} width={680} height={400} fill={HP.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 古い札 (墨の行・かすれ) */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={BX - 320 + i * 220} y={214} width={200} height={150} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3].map((k) => <line key={k} x1={BX - 290 + i * 220 + k * 42} y1={232} x2={BX - 290 + i * 220 + k * 42} y2={340} stroke={KRP.ink} strokeWidth={5} opacity={0.35} />)}
          </g>
        ))}
        {/* 新しい決まりの板 (上から下りて打ちつけられる) */}
        <g transform={`translate(0 ${(1 - plank) * -120}) rotate(${hit * (f % 2 ? 1 : -1) * 0.8} ${BX} 480)`} opacity={plank}>
          <rect x={BX - 300} y={386} width={600} height={196} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <rect x={BX - 300} y={386} width={600} height={40} fill={HP.restSoft} stroke={KRP.ink} strokeWidth={4} />
          <text x={BX} y={418} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.red}>遊び日</text>
          {/* ×の鍬 */}
          <g transform={`translate(${BX - 170} 506)`}>
            <rect x={-6} y={-60} width={12} height={110} rx={5} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={3} transform="rotate(30)" />
            <path d="M 14 -58 L 62 -52 L 58 -22 L 24 -32 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} transform="rotate(30)" />
            <g stroke={KRP.red} strokeWidth={12} strokeLinecap="round"><line x1={-56} y1={-56} x2={56} y2={56} /><line x1={56} y1={-56} x2={-56} y2={56} /></g>
          </g>
          <Arrow x={BX + 40} y={506} s={0.7} color={KRP.ink} />
          {/* 巾着 */}
          <g transform={`translate(${BX + 170} 512)`}>
            <path d="M -40 -30 Q -60 40 0 46 Q 60 40 40 -30 Z" fill={C.kinchaku} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -40 -30 Q 0 -50 40 -30 L 30 -44 Q 0 -60 -30 -44 Z" fill={C.kinchakuDark} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -10 -46 q -20 -20 -6 -26 M 10 -46 q 20 -20 6 -26" stroke={KRP.ink} strokeWidth={4} fill="none" />
            <circle cx={0} cy={8} r={16} fill={C.coin} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-5} y={3} width={10} height={10} fill={C.kinchakuDark} />
          </g>
          {/* 釘 (4本。右上をいま打っている) */}
          {[[BX - 284, 400], [BX + 284, 400], [BX - 284, 568], [BX + 284, 568]].map(([nx, ny], i) => (
            <circle key={i} cx={nx} cy={ny} r={7} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      </g>
      {/* 打った衝撃 */}
      {hit > 0 && (
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={BX + 300} y1={372} x2={BX + 320} y2={350} /><line x1={BX + 312} y1={410} x2={BX + 342} y2={410} />
          <line x1={BX + 300} y1={436} x2={BX + 322} y2={456} />
        </g>
      )}
      {/* 若者 (踏み台に乗って木槌) */}
      <rect x={yx - 110} y={yy} width={220} height={70} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={6} />
      <rect x={yx - 100} y={yy + 70} width={24} height={60} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={yx + 76} y={yy + 70} width={24} height={60} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`translate(${2 * yx} 0) scale(-1 1)`}>
        <Person x={yx} y={yy} s={ys} f={f} face="angry" pose="raise" cloth={C.ai} clothDark={C.momo} phase={2} gaze={[7, -2]} lean={4} />
        <HmCOver x={yx} y={yy} s={ys} f={f} phase={2} lean={4} kind="young" band={KRP.white} />
      </g>
      <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${aim - ang})`}>
        <rect x={0} y={-8} width={100} height={16} rx={6} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={4} />
        <rect x={92} y={-36} width={46} height={72} rx={10} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={100} y1={-30} x2={100} y2={30} stroke={HP.woodMid} strokeWidth={4} opacity={0.6} />
        <circle r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 村人2人 (猫背 → ぴしっ) */}
      {[[330, 0.98, 1, C.shibu, C.shibuDark, "elder"], [580, 0.92, 4, "#7A8A6A", "#5A6A4A", "young"]].map(([vx, vs, ph, c1, c2, kd], i) => {
        const ln = lerp(i ? 10 : -10, 0, straight);
        return (
          <g key={i}>
            <Person x={vx as number} y={900} s={vs as number} f={f} face={straight > 0.5 ? "surprised" : "normal"} pose="stand" cloth={c1 as string} clothDark={c2 as string}
              hair={kd === "elder" ? "none" : "cap"} phase={ph as number} lean={ln} gaze={[6, -2]} />
            <HmCOver x={vx as number} y={900} s={vs as number} f={f} phase={ph as number} lean={ln} kind={kd as "elder" | "young"} band={C.ai} />
            {straight > 0.3 && (
              <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={straight}>
                <line x1={(vx as number) - 90} y1={900 - 330 * (vs as number)} x2={(vx as number) - 90} y2={900 - 250 * (vs as number)} />
                <line x1={(vx as number) + 90} y1={900 - 330 * (vs as number)} x2={(vx as number) + 90} y2={900 - 250 * (vs as number)} />
                <line x1={(vx as number) - 70} y1={900 - 360 * (vs as number)} x2={(vx as number) - 56} y2={900 - 340 * (vs as number)} />
                <line x1={(vx as number) + 70} y1={900 - 360 * (vs as number)} x2={(vx as number) + 56} y2={900 - 340 * (vs as number)} />
              </g>
            )}
          </g>
        );
      })}
      <TagPlate x={1640} y={200} text="高札" size={44} t={seg(f, 0, 8)} rot={3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #54 遊び日に働いた人は、罰金。
// 格: 山 / seed 5054
// 絵: どこ: 遊び日の田んぼ (誰もいない)。演出: ひとりだけこっそり田んぼで草取りをしていた村人 (face="worried")。そこへ若者たちが駆けつけ、巾着 (罰金) を突きつける。村人は鍬を持ったまま固まる。巾着から小銭がちゃりんとこぼれる。札「罰金」。動き: 若者が走ってくる / 巾着が突きつけられる / 小銭がこぼれる
// どこ: 遊び日の田んぼ。青い稲の列・水面・あぜ道・遠くの山と大きな木 (木陰でみんなが寝転んで休んでいる)
// 演出: ひとりだけこっそり草取りをしていた村人が、鍬を握ったまま凍りつく (汗・ギクッ)。右のあぜ道から若者3人が駆けつけ、先頭が巾着をずいっと突きつける。巾着の口から小銭がちゃりんとこぼれて水に落ちる。札「罰金」
// 動き: 若者が走り込む (f0〜16) / 巾着が突きつけられる (f16〜22) / 小銭がこぼれて水の輪 / カメラが巾着へ少し寄る
const Hm054: React.FC<{ f: number }> = ({ f }) => {
  const run = easeOut(seg(f, 0, 16));
  const thrust = easeOut(seg(f, 15, 22));
  const cam = 1 + 0.06 * easeInOut(seg(f, 10, 42));
  const freeze = seg(f, 12, 16);
  const lx = lerp(2150, 1230, run), ly = 830, ls = 1.1;
  const arrived = run > 0.98;
  const bob = Math.sin((f + 1 * 17) / 13) * 3;
  // 巾着の位置 (先頭の若者の前に突き出した手)
  const kx = lx - 153 * ls - 20 * thrust, ky = ly + bob - 148 * ls;
  const vx = 640, vy = 860, vs = 1.12;
  const COINS = [0, 1, 2, 3];
  return (
    <Frame f={f} seed={5054}>
      <g transform={`translate(900 520) scale(${cam}) translate(-900 -520)`}>
        {/* 空と山 */}
        <rect x={-80} y={-80} width={2100} height={560} fill={C.sky} />
        <path d="M -80 380 Q 200 180 520 330 Q 820 150 1180 320 Q 1500 200 2020 340 L 2020 470 L -80 470 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -80 420 Q 400 320 900 410 Q 1400 330 2020 420 L 2020 480 L -80 480 Z" fill={C.hillDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 遠くの大きな木と、木陰で寝転ぶ村人 (みんな休んでいる) */}
        <g transform="translate(1560 430)">
          <rect x={-16} y={-120} width={32} height={130} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-170} rx={150} ry={90} fill={C.ineDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={10} rx={170} ry={18} fill={C.hillDark} opacity={0.8} />
          {[-110, -40, 50, 120].map((px, i) => (
            <g key={i} transform={`translate(${px} 2)`}>
              <rect x={-26} y={-12} width={44} height={16} rx={8} fill={[C.ai, C.shibu, KRP.red, "#7A8A6A"][i]} stroke={KRP.ink} strokeWidth={2.5} />
              <circle cx={26} cy={-6} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
              <text x={34} y={-20 - ((f + i * 9) % 30) * 0.6} fontFamily={FONT} fontWeight={900} fontSize={16} fill={KRP.ink} opacity={0.7}>z</text>
            </g>
          ))}
        </g>
        {/* 田んぼ (水面と稲の列) */}
        <rect x={-80} y={470} width={2100} height={700} fill={C.mizu} />
        {Array.from({ length: 7 }, (_, r) => (
          <g key={r}>
            {Array.from({ length: 22 }, (_, c) => {
              const y = 500 + r * r * 14 + r * 40;
              const x = -60 + c * (90 + r * 14) - r * 40;
              const sc = 0.6 + r * 0.16;
              return (
                <g key={c} transform={`translate(${x} ${y}) scale(${sc}) rotate(${Math.sin(f / 14 + c * 0.7) * 3})`}>
                  <path d="M 0 0 L -14 -46 M 0 0 L 0 -54 M 0 0 L 14 -46" stroke={C.ineDark} strokeWidth={6} strokeLinecap="round" />
                  <ellipse cx={0} cy={2} rx={14} ry={4} fill={C.ineDark} opacity={0.3} />
                </g>
              );
            })}
          </g>
        ))}
        {/* 右のあぜ道 */}
        <path d="M 1060 1200 L 1240 470 L 1420 470 L 2040 1000 L 2040 1200 Z" fill={C.tsuchi} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${1300 + i * 80} ${560 + i * 60} q 10 -20 20 0`} stroke={C.ineDark} strokeWidth={5} fill="none" />)}
        {/* 村人 (田の中。鍬を握って凍りつく) */}
        <g transform={`translate(${freeze ? Math.sin(f * 3) * 2 * freeze : 0} 0)`}>
          <Person x={vx} y={vy} s={vs} f={f} face={freeze ? "worried" : "normal"} pose="hold" cloth="#7A8A6A" clothDark="#5A6A4A" phase={4} gaze={[8, -2]} lean={freeze ? -6 : 8} />
          <HmCOver x={vx} y={vy} s={vs} f={f} phase={4} lean={freeze ? -6 : 8} kind="young" band={KRP.white} />
          {/* すねまで水 */}
          <rect x={vx - 120} y={vy - 30} width={240} height={70} fill={C.mizu} />
          <ellipse cx={vx} cy={vy - 30} rx={110} ry={14} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.7} />
          {/* 鍬 (両手で握ったまま) */}
          <line x1={vx - 70} y1={vy - 150} x2={vx + 130} y2={vy - 24} stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" />
          <line x1={vx - 70} y1={vy - 150} x2={vx + 130} y2={vy - 24} stroke={HP.woodMid} strokeWidth={10} strokeLinecap="round" />
          <path d={`M ${vx + 118} ${vy - 40} L ${vx + 190} ${vy - 70} L ${vx + 204} ${vy - 34} L ${vx + 140} ${vy - 8} Z`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={vx - 14 * vs} cy={vy - 118 * vs} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={vx + 20 * vs} cy={vy - 100 * vs} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 抜いた草のかご */}
          <g transform={`translate(${vx - 230} ${vy - 40})`}>
            <path d="M -60 -40 L 60 -40 L 46 30 L -46 30 Z" fill={C.wara} stroke={KRP.ink} strokeWidth={5} />
            {[-30, 0, 30].map((gx) => <path key={gx} d={`M ${gx} -40 q -10 -40 -20 -50 M ${gx} -40 q 10 -44 24 -52`} stroke={C.ine} strokeWidth={6} fill="none" />)}
          </g>
          {/* ギクッ & 汗 */}
          {freeze > 0 && (
            <g opacity={freeze}>
              {[[-110, -300], [-90, -350], [100, -350], [120, -300]].map(([dx, dy], i) => (
                <line key={i} x1={vx + dx * vs} y1={vy + dy * vs} x2={vx + dx * vs * 1.25} y2={vy + dy * vs - 24} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
              ))}
              {[0, 1].map((i) => (
                <path key={i} d={`M ${vx + (i ? 70 : -74) * vs} ${vy - 250 * vs + ((f + i * 7) % 16)} q -10 16 0 24 q 10 -8 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
          )}
        </g>
        {/* 後ろの若者2人 (遅れて走ってくる) */}
        {[[lx + 300, 0.98, 3], [lx + 560, 0.92, 5]].map(([x, s, ph], i) => (
          <g key={i}>
            <Person x={x as number} y={800 - i * 30} s={s as number} f={f} face={arrived ? "angry" : "normal"} pose={arrived ? "point" : "run"} pointDir={-1}
              cloth={C.ai} clothDark={C.momo} phase={ph as number} gaze={[-8, 0]} lean={arrived ? 0 : -10} />
            <HmCOver x={x as number} y={800 - i * 30} s={s as number} f={f} phase={ph as number} lean={arrived ? 0 : -10} kind="young" band={i ? KRP.white : KRP.red} />
          </g>
        ))}
        {/* 先頭の若者 */}
        <Person x={lx} y={ly} s={ls} f={f} face={arrived ? "angry" : "normal"} pose={run < 0.95 ? "run" : "point"} pointDir={-1}
          cloth={C.ai} clothDark={C.momo} phase={1} gaze={[-9, 2]} lean={run < 0.95 ? -12 : -6 * thrust} />
        <HmCOver x={lx} y={ly} s={ls} f={f} phase={1} lean={run < 0.95 ? -12 : -6 * thrust} kind="young" band={KRP.red} />
        {/* 走りの土ぼこり */}
        {run < 1 && [0, 1, 2].map((i) => (
          <circle key={i} cx={lx + 90 + i * 50} cy={ly - 10 - i * 6} r={20 + i * 8} fill={C.tsuchi} stroke={KRP.ink} strokeWidth={3} opacity={0.7 * (1 - run)} />
        ))}
        {/* 突きつけた巾着 */}
        {run > 0.9 && (
          <g transform={`translate(${kx} ${ky}) rotate(${Math.sin(f / 4) * 4})`}>
            <path d="M 0 -30 Q 6 -10 0 6" stroke={KRP.ink} strokeWidth={5} fill="none" />
            <g transform="translate(0 60)">
              <path d="M -54 -40 Q -80 60 0 70 Q 80 60 54 -40 Z" fill={C.kinchaku} stroke={KRP.ink} strokeWidth={6} />
              <path d="M -54 -40 Q 0 -64 54 -40 L 40 -58 Q 0 -78 -40 -58 Z" fill={C.kinchakuDark} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -30 0 q 30 20 60 0" stroke={C.kinchakuDark} strokeWidth={5} fill="none" />
              <circle cx={-26} cy={-56} r={8} fill={C.coin} stroke={KRP.ink} strokeWidth={3} />
            </g>
          </g>
        )}
        {/* こぼれる小銭 */}
        {COINS.map((i) => {
          const t0 = 22 + i * 5;
          const p = seg(f, t0, t0 + 9);
          if (p <= 0) return null;
          const cx = kx - 40 - i * 34, top = ky + 20;
          const land = 700 + i * 22;
          const cy = lerp(top, land, p * p);
          return (
            <g key={i}>
              {p < 1 ? (
                <g transform={`translate(${cx} ${cy}) rotate(${p * 540})`}>
                  <ellipse rx={16} ry={16 * Math.abs(Math.cos(p * 8))} fill={C.coin} stroke={KRP.ink} strokeWidth={3} />
                </g>
              ) : (
                <g>
                  {[0, 1].map((k) => {
                    const rp = clamp01((f - t0 - 9 - k * 4) / 14);
                    return rp > 0 && rp < 1 ? <ellipse key={k} cx={cx} cy={land} rx={20 + 50 * rp} ry={6 + 14 * rp} fill="none" stroke={KRP.white} strokeWidth={4} opacity={1 - rp} /> : null;
                  })}
                </g>
              )}
              {p > 0.05 && p < 0.5 && <text x={cx + 20} y={top - 10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink} opacity={1 - p * 2}>♪</text>}
            </g>
          );
        })}
      </g>
      <TagPlate x={980} y={210} text="罰金" size={62} t={seg(f, 20, 28)} fill={HP.restSoft} color={KRP.red} rot={-3} />
      <TagPlate x={330} y={190} text="遊び日" size={40} t={seg(f, 0, 8)} rot={2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #55 働いている人を知らせた人には、ほうび。
// 格: 山 / seed 5055
// 絵: どこ: 村の家の垣根の陰。演出: 垣根の陰から、子どもがこっそり田んぼを指さして若者に耳打ち。若者が子どもにお団子 (ほうび) を渡す。子どもはにんまり (face="joy")。札「ほうび」。動き: 耳打ち / 団子が渡される / 子どもが跳ねる
// どこ: 村の家の竹垣の陰。左にわら屋根の家の軒と土壁、右奥に遊び日の田んぼ (遠くでひとりだけ働いている人が小さく見える)
// 演出: 垣根に身をかくした子どもが、田んぼの人を指さしながら若者に耳打ち (ひそひその点線)。若者は身をかがめて聞き、三色のお団子をさっと渡す。子どもはにんまりで跳ねる。札「ほうび」
// 動き: 耳打ちの点線が流れる (f0〜20) / 団子が手から手へ (f20〜30) / 子どもがぴょんぴょん跳ねる (f30〜) / 遠くの働く人の鍬が上下 / カメラが少し寄る
const Hm055: React.FC<{ f: number }> = ({ f }) => {
  const whisper = seg(f, 2, 20);
  const give = easeInOut(seg(f, 20, 30));
  const hop = f > 30 ? Math.abs(Math.sin((f - 30) / 3.2)) * 26 : 0;
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 40));
  const kx = 780, ky = 845 - hop, ks = 0.82;
  const yx = 1090, yy = 900, ys = 1.12;
  const kHead: [number, number] = [kx, ky - 228 * ks];
  // 団子: 若者の手 → 子どもの手
  const from: [number, number] = [yx - 100, yy - 300];
  const to: [number, number] = [kx + 105 * ks, ky - 300 * ks];
  const dx = lerp(from[0], to[0], give), dy = lerp(from[1], to[1], give) - Math.sin(Math.PI * give) * 60;
  return (
    <Frame f={f} seed={5055}>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        {/* 空と遠くの田んぼ */}
        <rect x={-80} y={-80} width={2100} height={620} fill={C.sky} />
        <path d="M -80 400 Q 400 300 700 420 Q 1000 260 1400 380 Q 1700 300 2020 380 L 2020 520 L -80 520 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-80} y={500} width={2100} height={300} fill={C.mizu} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 16 }, (_, c) => (
          <path key={`${r}-${c}`} d={`M ${820 + c * 80 + r * 20} ${530 + r * 40} l -6 -18 M ${820 + c * 80 + r * 20} ${530 + r * 40} l 0 -22 M ${820 + c * 80 + r * 20} ${530 + r * 40} l 6 -18`}
            stroke={C.ineDark} strokeWidth={4} strokeLinecap="round" />
        )))}
        {/* 遠くでひとり働く人 (小さく) */}
        <g transform="translate(1560 560)">
          <rect x={-14} y={-50} width={28} height={36} rx={6} fill="#7A8A6A" stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-64} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -14 -72 Q 0 -80 14 -72" stroke={KRP.white} strokeWidth={4} />
          <g transform={`rotate(${-30 + Math.abs(Math.sin(f / 5)) * 40} 10 -40)`}>
            <line x1={10} y1={-40} x2={46} y2={-70} stroke={HP.woodDark} strokeWidth={5} />
            <rect x={40} y={-78} width={14} height={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
          </g>
          <ellipse cx={0} cy={-12} rx={30} ry={6} fill="none" stroke={KRP.white} strokeWidth={3} />
        </g>
        {/* 左: 家の土壁とわら屋根の軒 */}
        <rect x={-80} y={120} width={560} height={700} fill="#D2B98C" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${-40 + rnd(5501, i) * 480} ${200 + rnd(5502, i) * 520} q 20 6 40 0`} stroke="#B89E70" strokeWidth={4} fill="none" />)}
        <rect x={220} y={300} width={180} height={150} fill="#5A4636" stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => <line key={i} x1={265 + i * 45} y1={300} x2={265 + i * 45} y2={450} stroke={HP.woodMid} strokeWidth={8} />)}
        <path d="M -80 160 L 620 60 L 640 130 L -80 260 Z" fill={C.wara} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-60 + i * 70} y1={235 - i * 13} x2={-50 + i * 70} y2={255 - i * 13} stroke={C.waraDark} strokeWidth={5} />)}
        {/* 地面 */}
        <rect x={-80} y={790} width={2100} height={400} fill={C.tsuchi} />
        {/* 子ども (垣根の陰。田んぼを指さす) */}
        <Person x={kx} y={ky} s={ks} f={f} face={give > 0.9 ? "joy" : "smile"} pose={give > 0.9 ? "banzai" : "point"} pointDir={1}
          cloth={KRP.yellow} clothDark={C.momo} phase={6} gaze={[8, -2]} lean={give > 0.9 ? 0 : 6} />
        <HmCOver x={kx} y={ky} s={ks} f={f} phase={6} lean={give > 0.9 ? 0 : 6} kind="kid" />
        {/* 若者 (かがんで耳を寄せる) */}
        <Person x={yx} y={yy} s={ys} f={f} face={give > 0.5 ? "smile" : "normal"} pose="stand" cloth={C.ai} clothDark={C.momo} phase={2} gaze={[-8, 4]} lean={-16} />
        <HmCOver x={yx} y={yy} s={ys} f={f} phase={2} lean={-16} kind="young" band={KRP.red} />
        {/* 若者の耳に手を当てる (聞いている) */}
        <circle cx={yx - 10} cy={yy - 250 * ys + 30} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={1 - give} />
        {/* ひそひそ (点線が子どもの口から若者の耳へ流れる) */}
        {whisper > 0 && give < 0.6 && (
          <g opacity={1 - give}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${kHead[0] + 50} ${kHead[1] + 20 + i * 14} Q ${(kHead[0] + yx) / 2 + 40} ${kHead[1] - 60 + i * 14} ${yx - 150} ${yy - 290 + i * 12}`}
                stroke={KRP.ink} strokeWidth={4} fill="none" strokeDasharray="6 12" strokeDashoffset={-f * 3}
                strokeLinecap="round" opacity={whisper} />
            ))}
          </g>
        )}
        {/* お団子 */}
        <g transform={`translate(${dx} ${dy}) rotate(${-30 + give * 20})`}>
          {give > 0.95 && <circle r={70 + Math.sin(f / 3) * 6} fill={HP.spark} opacity={0.3} />}
          <line x1={0} y1={60} x2={0} y2={-80} stroke={HP.woodMid} strokeWidth={6} strokeLinecap="round" />
          {[C.dango3, C.dango1, C.dango2].map((col, i) => (
            <g key={i}>
              <circle cx={0} cy={36 - i * 38} r={20} fill={col} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M -8 ${28 - i * 38} q 4 -6 10 -6`} stroke={KRP.white} strokeWidth={3} fill="none" />
            </g>
          ))}
        </g>
        {/* 竹垣 (四つ目垣)。人の体を胸まで隠す */}
        <g>
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i}>
              <rect x={460 + i * 72} y={708 - (i % 2) * 10} width={24} height={240} rx={8} fill={C.bamboo} stroke={KRP.ink} strokeWidth={4} />
              <line x1={462 + i * 72} y1={770} x2={482 + i * 72} y2={770} stroke={C.bambooDark} strokeWidth={4} />
            </g>
          ))}
          {[730, 810].map((by) => (
            <g key={by}>
              <rect x={440} y={by} width={1040} height={18} rx={9} fill={C.bamboo} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${466 + i * 72} ${by - 2} l 12 22 M ${478 + i * 72} ${by - 2} l -12 22`} stroke={C.kaki} strokeWidth={3} />)}
            </g>
          ))}
        </g>
        {/* 跳ねたときの記号 */}
        {hop > 4 && [[-1, 0], [1, 1]].map(([sd, k]) => (
          <path key={k} transform={`translate(${kx + sd * 120} ${ky - 300})`} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z"
            fill={HP.spark} stroke={KRP.ink} strokeWidth={3} />
        ))}
      </g>
      <TagPlate x={940} y={250} text="ほうび" size={56} t={seg(f, 24, 32)} fill={HP.restSoft} color={KRP.red} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #56 休みなのに、見張りつきです。
// 格: 山 / seed 5056
// 絵: どこ: 遊び日の村を見下ろす火の見やぐら。演出: やぐらの上で若者が望遠鏡 (遠眼鏡) をのぞいて、村をぐるっと見張っている。眼鏡の丸い視界の中に、のんびり寝転ぶ村人たち (全員休んでいる)。見張りの若者だけが**休めていない** (汗・face="worried")。動き: 遠眼鏡が左右にスイープ / 寝転ぶ村人の寝息 / 見張りの汗
// どこ: 遊び日の村を見下ろす火の見やぐら (とんがり屋根・半鐘・はしご・筋かい)。下にわら屋根の村と田んぼ
// 演出: やぐらの上で若者が遠眼鏡をのぞき、村をぐるっと見張る。右の大きな丸い「のぞいた視界」の中では、村人たちが草の上でのんびり寝転び、寝息の z が上がる (全員休んでいる)。見張りの若者だけが汗だくで休めていない
// 動き: 遠眼鏡が左右にスイープし、視界の中身も同じだけ流れる / 寝息の z / 見張りの汗がたれる / 半鐘のゆれ / 雲
const Hm056: React.FC<{ f: number }> = ({ f }) => {
  const sweep = Math.sin(f / 11);
  const tx = 470, py = 450;
  const ys = 0.95, yx = 420;
  const bob = Math.sin((f + 3 * 17) / 13) * 3;
  const eye: [number, number] = [yx + 40 * ys, py + bob - 226 * ys];
  const ang = sweep * 7;
  const VX = 1330, VY = 430, VR = 340;
  const pan = -sweep * 160;
  const sleepers = [
    { x: 1030, col: C.ai, dark: C.aiDark, hat: false },
    { x: 1290, col: KRP.red, dark: "#9E2E22", hat: true },
    { x: 1560, col: C.shibu, dark: C.shibuDark, hat: false },
    { x: 1820, col: "#7A8A6A", dark: "#5A6A4A", hat: false },
    { x: 800, col: KRP.yellow, dark: C.momo, hat: true },
  ];
  return (
    <Frame f={f} seed={5056}>
      {/* 空 */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={C.sky} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${((f * 0.5 + i * 700) % 2300) - 200} ${80 + i * 50})`}>
          <ellipse rx={100} ry={30} fill={KRP.white} opacity={0.85} /><ellipse cx={50} cy={-16} rx={60} ry={26} fill={KRP.white} opacity={0.85} />
        </g>
      ))}
      {/* 下に見える村 (遠く) */}
      <path d="M -40 760 Q 500 640 960 720 Q 1400 640 1960 740 L 1960 1120 L -40 1120 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
      {[[860, 820], [1080, 790], [1500, 830], [1720, 800]].map(([hx, hy], i) => (
        <g key={i} transform={`translate(${hx} ${hy}) scale(0.5)`}>
          <rect x={-100} y={-20} width={200} height={90} fill="#C9A878" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -130 -10 L 0 -120 L 130 -10 Z" fill={C.wara} stroke={KRP.ink} strokeWidth={7} />
        </g>
      ))}
      <rect x={-40} y={900} width={2000} height={220} fill={C.mizu} opacity={0.8} />
      {/* 火の見やぐら */}
      <g>
        {/* 脚と筋かい */}
        {[[tx - 170, tx - 300], [tx + 170, tx + 300]].map(([a, b], i) => (
          <line key={i} x1={a} y1={py} x2={b} y2={1120} stroke={C.hiNoMi} strokeWidth={26} />
        ))}
        {[0, 1, 2].map((k) => {
          const y1 = py + 30 + k * 220, y2 = y1 + 220;
          const w1 = 170 + (y1 - py) * 0.2, w2 = 170 + (y2 - py) * 0.2;
          return (
            <g key={k} stroke={C.hiNoMi} strokeWidth={12}>
              <line x1={tx - w1} y1={y1} x2={tx + w2} y2={y2} /><line x1={tx + w1} y1={y1} x2={tx - w2} y2={y2} />
              <line x1={tx - w1} y1={y1} x2={tx + w1} y2={y1} />
            </g>
          );
        })}
        {/* はしご */}
        <g stroke={KRP.ink} strokeWidth={8}>
          <line x1={tx - 40} y1={py} x2={tx - 50} y2={1120} /><line x1={tx + 40} y1={py} x2={tx + 50} y2={1120} />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={tx - 42 - i} y1={py + 40 + i * 64} x2={tx + 42 + i} y2={py + 40 + i * 64} />)}
        </g>
        {/* 見張り台の床と手すり */}
        <rect x={tx - 230} y={py - 10} width={460} height={34} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 屋根と柱 */}
        {[tx - 200, tx + 200].map((cx) => <rect key={cx} x={cx - 10} y={120} width={20} height={py - 120} fill={C.hiNoMi} stroke={KRP.ink} strokeWidth={4} />)}
        <path d={`M ${tx - 260} 140 L ${tx} 20 L ${tx + 260} 140 Z`} fill="#5E4A38" stroke={KRP.ink} strokeWidth={7} />
        <line x1={tx} y1={20} x2={tx} y2={-20} stroke={KRP.ink} strokeWidth={6} />
        {/* 半鐘 */}
        <g transform={`translate(${tx + 150} 150) rotate(${Math.sin(f / 9) * 5})`}>
          <line x1={0} y1={-10} x2={0} y2={20} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -34 90 Q -36 30 0 20 Q 36 30 34 90 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-40} y={86} width={80} height={12} rx={4} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
          {[40, 60].map((by) => <line key={by} x1={-28} y1={by} x2={28} y2={by} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
        </g>
        {/* 見張りの若者 */}
        <Person x={yx} y={py} s={ys} f={f} face="worried" pose="hold" cloth={C.ai} clothDark={C.momo} phase={3} gaze={[9, -2]} />
        <HmCOver x={yx} y={py} s={ys} f={f} phase={3} kind="young" band={KRP.white} />
        {/* 汗 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${yx + [-70, -80, 66][i] * ys} ${py - [270, 220, 280][i] * ys + ((f * 1.4 + i * 9) % 26)} q -9 16 0 22 q 9 -6 0 -22 Z`}
            fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 遠眼鏡 (目から右へ。スイープ) */}
        <g transform={`translate(${eye[0]} ${eye[1]}) rotate(${ang})`}>
          <rect x={0} y={-16} width={90} height={32} rx={6} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
          <rect x={86} y={-20} width={90} height={40} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={172} y={-26} width={70} height={52} rx={8} fill="#6E4526" stroke={KRP.ink} strokeWidth={5} />
          <rect x={92} y={-14} width={70} height={6} rx={3} fill={KRP.white} opacity={0.5} />
          {/* 支える手 */}
          <circle cx={60} cy={22} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={150} cy={26} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 手と腕 */}
        {[[-14, 60], [14, 150]].map(([hx0, tx0], i) => {
          const a = (ang * Math.PI) / 180;
          const ex = eye[0] + Math.cos(a) * tx0 - Math.sin(a) * 22;
          const ey = eye[1] + Math.sin(a) * tx0 + Math.cos(a) * 22;
          return (
            <g key={i}>
              <line x1={yx + hx0 * ys} y1={py + bob - 118 * ys} x2={ex} y2={ey + 8} stroke={KRP.ink} strokeWidth={26 * ys} strokeLinecap="round" />
              <line x1={yx + hx0 * ys} y1={py + bob - 118 * ys} x2={ex} y2={ey + 8} stroke={C.ai} strokeWidth={18 * ys} strokeLinecap="round" />
            </g>
          );
        })}
        {/* 手すり (前) */}
        <rect x={tx - 230} y={py - 90} width={460} height={14} fill={C.hiNoMi} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={tx - 226 + i * 74} y={py - 90} width={12} height={84} fill={C.hiNoMi} stroke={KRP.ink} strokeWidth={3} />)}
      </g>
      {/* のぞいた視界への点線 */}
      {(() => {
        const a = (ang * Math.PI) / 180;
        const lx = eye[0] + Math.cos(a) * 242, ly = eye[1] + Math.sin(a) * 242;
        return (
          <g stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 12" opacity={0.6}>
            <line x1={lx} y1={ly - 20} x2={VX - VR * 0.7} y2={VY - VR * 0.7} />
            <line x1={lx} y1={ly + 20} x2={VX - VR * 0.7} y2={VY + VR * 0.7} />
          </g>
        );
      })()}
      {/* のぞいた視界 (丸) */}
      <defs><clipPath id="hmc056view"><circle cx={VX} cy={VY} r={VR} /></clipPath></defs>
      <circle cx={VX + 10} cy={VY + 14} r={VR + 20} fill={KRP.ink} opacity={0.25} />
      <g clipPath="url(#hmc056view)">
        <rect x={VX - VR} y={VY - VR} width={VR * 2} height={VR * 2} fill={C.sky} />
        <g transform={`translate(${pan} 0)`}>
          <path d={`M 400 ${VY - 60} Q 1000 ${VY - 160} 1500 ${VY - 80} Q 1900 ${VY - 160} 2400 ${VY - 60} L 2400 ${VY + 400} L 400 ${VY + 400} Z`} fill={C.hill} />
          <rect x={400} y={VY - 20} width={2000} height={400} fill={C.ine} />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${500 + i * 60} ${VY + 10 + (i % 3) * 70} q 6 -16 12 0`} stroke={C.ineDark} strokeWidth={4} fill="none" />)}
          {/* 寝転ぶ村人 */}
          {sleepers.map((sp, i) => {
            const gy = VY + 150 + (i % 2) * 40;
            const breath = 1 + 0.04 * Math.sin(f / 6 + i);
            return (
              <g key={i}>
                <ellipse cx={sp.x} cy={gy + 6} rx={150} ry={16} fill={C.ineDark} opacity={0.4} />
                <g transform={`rotate(-90 ${sp.x} ${gy}) translate(${sp.x} ${gy}) scale(1 ${breath}) translate(${-sp.x} ${-gy})`}>
                  <Person x={sp.x} y={gy + 64 * 0.62} s={0.62} f={0} face="normal" pose="stand" cloth={sp.col} clothDark={sp.dark} hair={i === 2 ? "none" : "cap"} still />
                </g>
                {/* とじた目 (寝顔) を上書き */}
                <g transform={`translate(${sp.x - 102} ${gy})`}>
                  <circle r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <path d="M -2 -22 q 8 6 0 12 M -2 10 q 8 6 0 12" stroke={KRP.ink} strokeWidth={4} fill="none" />
                  {sp.hat && <ellipse cx={-10} cy={0} rx={30} ry={56} fill={C.wara} stroke={KRP.ink} strokeWidth={4} />}
                </g>
                {/* 寝息 */}
                {[0, 1, 2].map((k) => {
                  const p = ((f + k * 10 + i * 5) % 30) / 30;
                  return <text key={k} x={sp.x - 120 + p * 30 + k * 8} y={gy - 60 - p * 80} fontFamily={FONT} fontWeight={900}
                    fontSize={26 + k * 8} fill={KRP.ink} opacity={1 - p}>z</text>;
                })}
              </g>
            );
          })}
        </g>
        {/* 十字の目盛り */}
        <g stroke={KRP.ink} strokeWidth={2} opacity={0.35}>
          <line x1={VX - VR} y1={VY} x2={VX + VR} y2={VY} /><line x1={VX} y1={VY - VR} x2={VX} y2={VY + VR} />
        </g>
        <circle cx={VX} cy={VY} r={VR} fill="none" stroke={KRP.ink} strokeWidth={60} opacity={0.18} />
      </g>
      <circle cx={VX} cy={VY} r={VR} fill="none" stroke={KRP.brass} strokeWidth={18} />
      <circle cx={VX} cy={VY} r={VR + 9} fill="none" stroke={KRP.ink} strokeWidth={5} />
      <circle cx={VX} cy={VY} r={VR - 9} fill="none" stroke={KRP.ink} strokeWidth={4} />
      <TagPlate x={1760} y={120} text="遊び日" size={40} t={seg(f, 0, 8)} fill={HP.restSoft} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #57 もっとも、これで「江戸の人は暇だった」とは言えません。休みの数は、村や時代によって、ばらばらでした。
// 格: 図 / seed 5057
// 絵: どこ: 庄屋の蔵の中の棚。演出: 村ごとの暦 (巻物) が5本並び、それぞれ赤い休みの数がばらばら (少ない・多い・中くらい)。巻物の長さの違いで一目で分かる。札は村名ではなく「A村」「B村」…ではなく、**村のマーク (山・川・海・田・森)** だけ。天秤が「暇だった?」の吊り札とともに揺れて決まらない。動き: 巻物が順に広がる / 天秤が揺れ続ける
// どこ: 庄屋の蔵の中。しっくいの壁・太い梁・格子の小窓から差す光・木の棚 (5段)。右に古い天秤
// 演出: 5つの村の暦の巻物が棚に1本ずつ転がって広がる。長さも赤い休みの印の数もばらばら (短い・長い・中くらい)。巻物の左端には村のマーク (山・川・海・田・森) だけ。右の天秤は「暇だった?」の札を吊るしたまま、両方の皿 (短い巻物/長い巻物) が上下し続けて決まらない
// 動き: 巻物が順に広がる (f2〜34) / 天秤がずっと揺れる / 窓の光のホコリ / カメラがゆっくり左から右へパン
const Hm057: React.FC<{ f: number }> = ({ f }) => {
  const ROWS = [
    { len: 420, n: 7, icon: "yama" },
    { len: 1000, n: 30, icon: "kawa" },
    { len: 640, n: 14, icon: "umi" },
    { len: 860, n: 22, icon: "ta" },
    { len: 260, n: 4, icon: "mori" },
  ];
  const X0 = 210, Y0 = 160, RH = 136, SH = 84;
  const pan = -30 * easeInOut(seg(f, 0, 42));
  const tilt = Math.sin(f / 7) * 14 + Math.sin(f / 3.3) * 4;
  const BX = 1620, BY = 280;
  const icon = (k: string) => {
    switch (k) {
      case "yama": return <path d="M -30 18 L -8 -20 L 4 -2 L 14 -16 L 32 18 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={4} />;
      case "kawa": return <path d="M -28 -16 q 14 -8 28 0 t 28 0 M -28 0 q 14 -8 28 0 t 28 0 M -28 16 q 14 -8 28 0 t 28 0" stroke={KRP.blueDeep} strokeWidth={5} fill="none" />;
      case "umi": return <g><path d="M -30 10 q 10 -16 20 0 q 10 -16 20 0 q 10 -16 20 0 L 30 22 L -30 22 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={3.5} /><path d="M -6 -4 L 6 -24 L 12 -4 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} /></g>;
      case "ta": return <g><rect x={-26} y={-22} width={52} height={44} fill={C.ine} stroke={KRP.ink} strokeWidth={4} /><line x1={0} y1={-22} x2={0} y2={22} stroke={KRP.ink} strokeWidth={4} /><line x1={-26} y1={0} x2={26} y2={0} stroke={KRP.ink} strokeWidth={4} /></g>;
      default: return <g>{[-16, 0, 16].map((tx) => <g key={tx}><rect x={tx - 3} y={6} width={6} height={14} fill={HP.woodDark} /><path d={`M ${tx - 12} 8 L ${tx} -22 L ${tx + 12} 8 Z`} fill={C.ineDark} stroke={KRP.ink} strokeWidth={3} /></g>)}</g>;
    }
  };
  return (
    <Frame f={f} seed={5057}>
      <g transform={`translate(${pan} 0)`}>
        {/* しっくいの壁と梁 */}
        <rect x={-60} y={-60} width={2100} height={1240} fill={C.kura} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${rnd(5701, i) * 1900} ${rnd(5702, i) * 900} q 30 10 60 0`} stroke={C.kuraDark} strokeWidth={4} fill="none" />
        ))}
        <rect x={-60} y={40} width={2100} height={50} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {[100, 1380, 1960].map((px) => <rect key={px} x={px - 30} y={90} width={60} height={1000} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={6} />)}
        {/* 格子の小窓と光 */}
        <rect x={1520} y={110} width={200} height={140} fill="#FFF6D8" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={1540 + i * 44} y={110} width={14} height={140} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
        <polygon points="1520,250 1720,250 1900,900 1400,900" fill={KRP.white} opacity={0.22} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={1560 + rnd(5703, i) * 220 + Math.sin(f / 10 + i) * 10} cy={320 + ((f * 2 + i * 120) % 560)} r={3} fill={KRP.white} opacity={0.8} />
        ))}
        {/* 床 */}
        <rect x={-60} y={880} width={2100} height={300} fill={C.ita} />
        <g stroke={C.itaDark} strokeWidth={4}>{Array.from({ length: 4 }, (_, i) => <line key={i} x1={-60} y1={920 + i * 50} x2={2040} y2={920 + i * 50} />)}</g>
        {/* 棚と巻物 */}
        {ROWS.map((r, i) => {
          const y = Y0 + i * RH;
          const t0 = 2 + i * 6;
          const p = easeOut(seg(f, t0, t0 + 10));
          const w = 60 + r.len * p;
          const marks = Array.from({ length: r.n }, (_, k) => k);
          return (
            <g key={i}>
              {/* 棚板 */}
              <rect x={150} y={y + SH + 6} width={1210} height={22} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={5} />
              <rect x={150} y={y + SH + 28} width={1210} height={8} fill={KRP.ink} opacity={0.15} />
              {/* 紙 */}
              <rect x={X0} y={y} width={w} height={SH} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
              <g>
                {Array.from({ length: Math.floor(w / 26) }, (_, k) => (
                  <line key={k} x1={X0 + 50 + k * 26} y1={y + 8} x2={X0 + 50 + k * 26} y2={y + SH - 8} stroke={C.washiDark} strokeWidth={1.5} />
                ))}
              </g>
              {/* 赤い休みの印 (長さの中にばらまく) */}
              {marks.map((k) => {
                const mx = X0 + 64 + ((k + 0.5) / r.n) * (r.len - 30) + (rnd(5704 + i, k) - 0.5) * 10;
                const my = y + 22 + ((k * 7 + i) % 3) * 20;
                if (mx > X0 + w - 16) return null;
                return <circle key={k} cx={mx} cy={my} r={9} fill={HP.rest} stroke={KRP.red} strokeWidth={2} />;
              })}
              {/* 左の軸と村のマーク */}
              <rect x={X0 - 16} y={y - 12} width={32} height={SH + 24} rx={14} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
              <g transform={`translate(${X0 - 70} ${y + SH / 2})`}>
                <circle r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                {icon(r.icon)}
              </g>
              {/* 右の巻き (転がる) */}
              <g transform={`translate(${X0 + w} ${y + SH / 2})`}>
                <rect x={-20} y={-SH / 2 - 10} width={40} height={SH + 20} rx={18} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
                <line x1={-8} y1={-SH / 2} x2={-8} y2={SH / 2} stroke={C.washiDark} strokeWidth={3} transform={`translate(${(p * 80) % 16} 0)`} />
              </g>
            </g>
          );
        })}
        {/* 天秤 (揺れ続けて決まらない) */}
        <g>
          <rect x={BX - 90} y={860} width={180} height={34} rx={8} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={BX - 14} y={BY} width={28} height={590} fill={HP.woodMid} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`translate(${BX} ${BY}) rotate(${tilt})`}>
            <rect x={-230} y={-10} width={460} height={20} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * 215} 0) rotate(${-tilt})`}>
                <line x1={0} y1={0} x2={-56} y2={170} stroke={KRP.ink} strokeWidth={3} />
                <line x1={0} y1={0} x2={56} y2={170} stroke={KRP.ink} strokeWidth={3} />
                <path d="M -76 170 Q 0 210 76 170 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
                {/* 皿の上: 左は短い巻物、右は長い巻物 */}
                <rect x={sd < 0 ? -26 : -60} y={142} width={sd < 0 ? 52 : 120} height={28} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
                {Array.from({ length: sd < 0 ? 1 : 5 }, (_, k) => <circle key={k} cx={(sd < 0 ? 0 : -44) + k * 22} cy={156} r={6} fill={HP.rest} />)}
              </g>
            ))}
            <circle r={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 吊り札 (ゆれる) */}
          {(() => {
            const a = (-tilt * 0.6 * Math.PI) / 180;
            const tx = BX - Math.sin(a) * 340, ty = BY + 14 + Math.cos(a) * 340;
            return (
              <g>
                <line x1={BX} y1={BY + 14} x2={BX - Math.sin(a) * 300} y2={BY + 14 + Math.cos(a) * 300} stroke={KRP.ink} strokeWidth={4} />
                <TagPlate x={tx} y={ty} text="暇だった?" size={40} t={seg(f, 8, 16)} rot={-tilt * 0.6} />
              </g>
            );
          })()}
          <QMark x={BX + 210} y={BY - 40} s={0.7} f={f} t={seg(f, 14, 22)} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #58 そのばらばらを、明治政府が、ひとつにそろえます。
// 格: 山 / seed 5058
// 絵: どこ: 明治の役所の大きな机 (洋風の机・ランプ・地球儀)。演出: ばらばらの長さの暦の巻物が机の上に集められ、黒い詰襟の役人が大きな定規 (まっすぐな木の定規) で**ぱしっと**そろえる。巻物の端が一直線になる。窓の外に洋風の建物と人力車。動き: 巻物が集まる / 定規でそろえる / ランプのゆらぎ
// どこ: 明治の役所の執務室。腰板つきの壁・上げ下げ窓 (外にれんがの洋館と走る人力車)・緑の羅紗を張った大きな洋机・石油ランプ・地球儀・インク壺と羽ペン
// 演出: ばらばらの長さ・ばらばらの位置の暦 (5本) が机の上にすべりこんで集まる。黒い詰襟に口ひげの役人が、まっすぐな木の大定規を「ぱしっ」と当てて左端を一直線にそろえ、さらに長さまで同じにそろう
// 動き: 巻物が集まる (f0〜14) / 定規でぱしっ (f18〜24) / 長さがそろう (f26〜36) / ランプの炎のゆらぎ / 窓の外の人力車が走る / 地球儀がゆっくり回る
const Hm058: React.FC<{ f: number }> = ({ f }) => {
  const gather = easeOut(seg(f, 0, 14));
  const slap = easeInOut(seg(f, 18, 23));
  const hitT = seg(f, 23, 30);
  const even = easeInOut(seg(f, 26, 36));
  const shake = f >= 23 && f < 27 ? Math.sin(f * 5) * 4 : 0;
  const ROWS = [
    { l: 600, len: 520, col: C.washi, from: [-400, -300] },
    { l: 690, len: 840, col: "#F1E4C4", from: [900, -500] },
    { l: 540, len: 380, col: C.washi, from: [-500, 200] },
    { l: 760, len: 660, col: "#F1E4C4", from: [1200, 300] },
    { l: 630, len: 300, col: C.washi, from: [-300, 500] },
  ];
  const ALIGN = 560, EVEN = 760;
  const rulerX = lerp(380, ALIGN - 20, slap);
  const ox = 400, oy = 650, os = 1.2;
  const bob = Math.sin((f + 2 * 17) / 13) * 3;
  const flick = 1 + 0.1 * Math.sin(f / 2.5) + 0.05 * Math.sin(f * 1.9);
  const rick = ((f * 9) % 900) - 120;
  return (
    <Frame f={f} seed={5058}>
      <g transform={`translate(${shake} 0)`}>
        {/* 壁と腰板 */}
        <rect x={-60} y={-60} width={2040} height={700} fill={C.meijiWall} />
        <g stroke="#D6C7A6" strokeWidth={3}>{Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 70} y1={-60} x2={i * 70} y2={420} />)}</g>
        <rect x={-60} y={420} width={2040} height={220} fill={C.meijiDesk} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 230 - 20} y={446} width={190} height={160} rx={6} fill="none" stroke="#5E3620" strokeWidth={5} />)}
        {/* 上げ下げ窓と外の景色 */}
        <g>
          <rect x={1240} y={60} width={600} height={400} fill={C.sky} stroke={KRP.ink} strokeWidth={8} />
          <defs><clipPath id="hmc058win"><rect x={1244} y={64} width={592} height={392} /></clipPath></defs>
          <g clipPath="url(#hmc058win)">
            {/* れんがの洋館 */}
            <rect x={1300} y={170} width={360} height={290} fill={C.brick} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 9 }, (_, r) => <line key={r} x1={1300} y1={190 + r * 30} x2={1660} y2={190 + r * 30} stroke="#9A5236" strokeWidth={3} />)}
            {[1340, 1430, 1520, 1610].map((wx) => <rect key={wx} x={wx - 10} y={210} width={44} height={70} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
            <path d="M 1280 170 L 1480 100 L 1680 170 Z" fill="#6A6A72" stroke={KRP.ink} strokeWidth={5} />
            <rect x={1700} y={250} width={180} height={210} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            {/* ガス灯 */}
            <rect x={1690} y={250} width={8} height={210} fill={KRP.ink} />
            <path d="M 1680 240 L 1708 240 L 1700 220 L 1688 220 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            {/* 道と人力車 */}
            <rect x={1240} y={400} width={600} height={60} fill={C.tsuchi} />
            <g transform={`translate(${1240 + rick} 410)`}>
              <circle cx={40} cy={20} r={26} fill="none" stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2].map((k) => <line key={k} x1={40} y1={20} x2={40 + Math.cos(f / 2 + k) * 26} y2={20 + Math.sin(f / 2 + k) * 26} stroke={KRP.ink} strokeWidth={3} />)}
              <path d="M 10 0 L 70 0 L 74 -40 L 20 -54 Z" fill={KRP.ink} />
              <circle cx={44} cy={-40} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <line x1={70} y1={0} x2={140} y2={-10} stroke={KRP.ink} strokeWidth={5} />
              <g transform={`translate(150 -6) rotate(${Math.sin(f / 2) * 6})`}>
                <rect x={-8} y={-30} width={16} height={30} fill={C.ai} stroke={KRP.ink} strokeWidth={3} />
                <circle cx={0} cy={-40} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                <path d="M -16 -46 L 16 -46 L 0 -60 Z" fill={C.wara} stroke={KRP.ink} strokeWidth={2} />
                <line x1={-4} y1={0} x2={-12} y2={16} stroke={KRP.ink} strokeWidth={4} /><line x1={4} y1={0} x2={12} y2={16} stroke={KRP.ink} strokeWidth={4} />
              </g>
            </g>
          </g>
          <line x1={1240} y1={260} x2={1840} y2={260} stroke={KRP.white} strokeWidth={14} />
          <line x1={1240} y1={260} x2={1840} y2={260} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1540} y1={60} x2={1540} y2={460} stroke={KRP.white} strokeWidth={10} />
          <rect x={1220} y={456} width={640} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 掛け時計 */}
        <g transform="translate(860 200)">
          <rect x={-70} y={-90} width={140} height={210} rx={20} fill={C.meijiDesk} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-20} r={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-20} x2={0} y2={-60} stroke={KRP.ink} strokeWidth={5} /><line x1={0} y1={-20} x2={28} y2={-20} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${Math.sin(f / 5) * 14} 0 40)`}><line x1={0} y1={40} x2={0} y2={96} stroke={KRP.brass} strokeWidth={4} /><circle cx={0} cy={96} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} /></g>
        </g>
        {/* 役人 (机の向こう。上半身) */}
        <Person x={ox} y={oy} s={os} f={f} face={f > 30 ? "smile" : f > 22 ? "angry" : "normal"} pose="stand" cloth={C.tsume} clothDark={C.tsumeDark} phase={2} gaze={[8, 6]} />
        <HmCOver x={ox} y={oy} s={os} f={f} phase={2} kind="meiji" />
        {/* 机 (緑の羅紗の天板) */}
        <path d="M 180 560 L 1780 560 L 1880 790 L 80 790 Z" fill={C.meijiDeskTop} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 210 572 L 1750 572 L 1846 778 L 114 778 Z" fill="none" stroke="#4A7046" strokeWidth={4} />
        <rect x={60} y={790} width={1840} height={340} fill={C.meijiDesk} stroke={KRP.ink} strokeWidth={7} />
        {[300, 960, 1620].map((dx) => (
          <g key={dx}><rect x={dx - 200} y={830} width={400} height={120} rx={6} fill="none" stroke="#5E3620" strokeWidth={5} />
            <rect x={dx - 40} y={880} width={80} height={16} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} /></g>
        ))}
        {/* 暦の巻物 (集まる → 左端がそろう → 長さもそろう) */}
        {ROWS.map((r, i) => {
          const y = 590 + i * 38;
          const left = lerp(r.l, ALIGN, slap);
          const len = lerp(r.len, EVEN, even);
          const gx = (1 - gather) * r.from[0], gy = (1 - gather) * r.from[1];
          return (
            <g key={i} transform={`translate(${gx} ${gy}) rotate(${(1 - gather) * (i % 2 ? 20 : -20)} ${left} ${y})`}>
              <rect x={left + 6} y={y + 6} width={len} height={30} fill={KRP.ink} opacity={0.18} />
              <rect x={left} y={y} width={len} height={30} fill={r.col} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: Math.max(1, Math.floor(len / 70)) }, (_, k) => (
                <circle key={k} cx={left + 40 + k * 70} cy={y + 15} r={8} fill={HP.rest} stroke={KRP.red} strokeWidth={2} />
              ))}
              <rect x={left + len - 10} y={y - 6} width={24} height={42} rx={10} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={left - 12} y={y - 6} width={24} height={42} rx={10} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 定規を持つ両腕 */}
        {[-1, 1].map((sd) => {
          const hx = rulerX + 8, hy = 600 + (sd < 0 ? 0 : 30);
          return (
            <g key={sd}>
              <path d={`M ${ox + sd * 67 * os} ${oy + bob - 148 * os} Q ${ox + sd * 40 + 60} ${hy - 20} ${hx} ${hy}`} stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
              <path d={`M ${ox + sd * 67 * os} ${oy + bob - 148 * os} Q ${ox + sd * 40 + 60} ${hy - 20} ${hx} ${hy}`} stroke={C.tsume} strokeWidth={21} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        {/* 木の大定規 */}
        <g transform={`translate(${rulerX} 0)`}>
          <rect x={-14} y={566} width={28} height={220} rx={4} fill={HP.wood} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, k) => <line key={k} x1={-14} y1={580 + k * 20} x2={k % 5 ? -2 : 6} y2={580 + k * 20} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        {/* 役人の手 */}
        <circle cx={rulerX + 8} cy={600} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={rulerX + 8} cy={630} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* ぱしっ */}
        {hitT > 0 && hitT < 1 && (
          <g opacity={1 - hitT}>
            {[0, 1, 2, 3, 4].map((k) => {
              const a = (-70 + k * 35) * Math.PI / 180;
              return <line key={k} x1={rulerX - 30 - Math.cos(a) * 30} y1={680 + Math.sin(a) * 60} x2={rulerX - 30 - Math.cos(a) * (70 + 40 * hitT)} y2={680 + Math.sin(a) * (110 + 40 * hitT)}
                stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* そろった後の一直線のガイド */}
        {even > 0 && (
          <g stroke={KRP.red} strokeWidth={5} strokeDasharray="12 10" opacity={even}>
            <line x1={ALIGN + EVEN} y1={572} x2={ALIGN + EVEN} y2={780} />
          </g>
        )}
        {/* 右: インク壺と羽ペン・石油ランプ・地球儀 */}
        <g transform="translate(1470 640)">
          <rect x={-30} y={-30} width={60} height={46} rx={10} fill={KRP.ink} />
          <path d="M 10 -30 Q 60 -120 90 -160 Q 50 -90 20 -30 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="translate(1600 640)">
          <ellipse cx={0} cy={-120} rx={90 * flick} ry={110 * flick} fill={HP.spark} opacity={0.18} />
          <path d="M -50 10 L 50 10 L 30 -50 L -30 -50 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -26 -50 Q -56 -120 0 -180 Q 56 -120 26 -50 Z" fill={C.lampGlass} opacity={0.8} stroke={KRP.ink} strokeWidth={5} />
          <path transform={`translate(0 -96) scale(${flick} ${1 / flick + 0.05})`} d="M 0 -36 Q 14 -10 8 4 Q 0 10 -8 4 Q -14 -10 0 -36 Z" fill={HP.spark} stroke={KRP.orange} strokeWidth={3} />
          <rect x={-14} y={-196} width={28} height={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="translate(1760 600)">
          <rect x={-40} y={40} width={80} height={20} rx={6} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={40} x2={0} y2={10} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-50} r={66} fill={KRP.blue} stroke={KRP.ink} strokeWidth={5} />
          <defs><clipPath id="hmc058globe"><circle cx={0} cy={-50} r={64} /></clipPath></defs>
          <g clipPath="url(#hmc058globe)">
            {[0, 1].map((k) => {
              const gx = ((f * 2 + k * 90) % 180) - 90;
              return <path key={k} d={`M ${gx - 20} -90 q 30 10 24 40 q -10 30 10 50 l -30 -10 q -20 -40 -4 -80 Z`} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />;
            })}
          </g>
          <path d="M -20 -126 A 76 76 0 0 1 60 14" stroke={KRP.brass} strokeWidth={8} fill="none" />
        </g>
      </g>
      <TagPlate x={620} y={180} text="明治政府" size={44} t={seg(f, 0, 8)} rot={-2} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_048: (f) => <Hm048 f={f} />,
  hm_049: (f) => <Hm049 f={f} />,
  hm_050: (f) => <Hm050 f={f} />,
  hm_051: (f) => <Hm051 f={f} />,
  hm_052: (f) => <Hm052 f={f} />,
  hm_053: (f) => <Hm053 f={f} />,
  hm_054: (f) => <Hm054 f={f} />,
  hm_055: (f) => <Hm055 f={f} />,
  hm_056: (f) => <Hm056 f={f} />,
  hm_057: (f) => <Hm057 f={f} />,
  hm_058: (f) => <Hm058 f={f} />,
};

export const HM_C_MOTIFS: string[] = [
  "hm_048", // #48
  "hm_049", // #49
  "hm_050", // #50
  "hm_051", // #51
  "hm_052", // #52
  "hm_053", // #53
  "hm_054", // #54
  "hm_055", // #55
  "hm_056", // #56
  "hm_057", // #57
  "hm_058", // #58
];

export const himaCScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
