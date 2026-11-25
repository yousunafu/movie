// 人は、なぜ暇をつぶすのか: 文#184〜#193 (10文)
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
  // #184 頭の中の部屋
  headWall: "#F4D3CB",
  headWallLine: "#E6B0A5",
  headCeil: "#E3A79B",
  headFloor: "#C98E7A",
  headFloorLine: "#AE735F",
  oldDoor: "#9C6B55",
  newDoor: "#7FA3C9",
  chair: "#7FA36A",
  chairDark: "#5E8250",
  scarfA: "#D9534A",
  scarfB: "#F2CE4C",
  skyIn: "#BFE0F2",
  hill: "#8CC07A",
  // #185 本堂
  templeWall: "#7A4E32",
  templeBoard: "#6A4229",
  beam: "#5A3622",
  pillar: "#9A6A44",
  lacquer: "#8E3426",
  tatami: "#D8C98E",
  tatamiLine: "#C4B276",
  heri: "#3E4A3A",
  sumi: "#3A3A44",
  sumiDark: "#2A2A32",
  kesa: "#8A5A30",
  zabuton: "#2E3550",
  washi: "#F3E6C4",
  scrollWood: "#6A3A24",
  // #186 滝
  rock: "#7D858C",
  rockDark: "#5E656C",
  rockLight: "#9CA3A9",
  pine: "#3E6B4A",
  pineDark: "#2D5038",
  fall: "#D6ECF6",
  pool: "#7FAFD0",
  gyoi: "#EEF2F4",
  gyoiDark: "#C9D3DA",
  cold: "#4E8FD6",
  skyCold: "#DCE9EE",
  // 大昔
  fur: "#A8784A",
  furDark: "#7A5232",
  furSpot: "#6A4428",
  meadow: "#9CC97A",
  meadowDark: "#7DAF5E",
  leaf: "#5E9A4E",
  leafDark: "#467A3A",
  trunk: "#7A5232",
  skyWarm: "#CFE6F0",
  mtn: "#9DB0C4",
  dirt: "#C9B486",
  dirtDark: "#AE9868",
  cliff: "#8C7B6A",
  cliffDark: "#6E5F50",
  cave: "#3B302A",
  dial: "#F4EAD2",
  slab: "#9A8C7C",
  // #190 博物館
  museWall: "#2E5560",
  museWallDark: "#24454E",
  museFloor: "#8C7660",
  museFloorLine: "#776250",
  caseWood: "#6B4A36",
  suit: "#2F3A55",
  // 絵巻
  table: "#5A3B28",
  tableLine: "#4A2F1F",
  brocade: "#7A5A9A",
  moya: "#9AA0A6",
  moyaDark: "#7A8086",
  toga: "#F2EEE6",
  robe: "#7A5A3A",
  robeDark: "#5A4028",
  kimono: "#3E5A8A",
  kimonoDark: "#2C4266",
  vic: "#4A4A52",
  vicDark: "#33333A",
  stone: "#B8B2A6",
  shoji: "#F6F0DE",
  // #193 夜の壁
  nightWall: "#3B3A58",
  nightStripe: "#45446A",
  poster: "#F4ECD6",
  nightFloor: "#5A4636",
  lampWarm: "#FFE2A0",
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

// 顔の上書き (Person と同じ x,y,s,lean で重ねる。Person 側は still にしておく)
//   shut = 静かにとじた目 / yawn = あくび (ぎゅっとつぶった目・大きく開いた口・涙)
const HmHbFace: React.FC<{ x: number; y: number; s: number; lean?: number; mode: "shut" | "yawn" }> = ({ x, y, s, lean = 0, mode }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
    <ellipse cx={-24} cy={-222} rx={17} ry={21} fill={KRP.white} />
    <ellipse cx={24} cy={-222} rx={17} ry={21} fill={KRP.white} />
    {mode === "yawn" ? (
      <g fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M -38 -230 L -16 -221 L -38 -212" />
        <path d="M 38 -230 L 16 -221 L 38 -212" />
      </g>
    ) : (
      <g fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
        <path d="M -36 -222 Q -24 -212 -12 -222" />
        <path d="M 12 -222 Q 24 -212 36 -222" />
      </g>
    )}
    {mode === "yawn" && (
      <g>
        <ellipse cx={0} cy={-186} rx={20} ry={10} fill={KRP.white} />
        <ellipse cx={0} cy={-187} rx={15} ry={19} fill={KRP.ink} />
        <ellipse cx={0} cy={-176} rx={9} ry={5} fill="#E06A5A" />
        <path d="M 44 -212 q 6 9 0 13 q -6 -4 0 -13 Z" fill="#7FA8C9" />
      </g>
    )}
  </g>
);

// 毛皮の衣 (大昔の人)。Person の上に重ねる
const HmHbFur: React.FC<{ x: number; y: number; s: number; lean?: number; pose?: string }> = ({ x, y, s, lean = 0, pose }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
    <path d="M -58 -60 l 0 14 l 12 12 l 12 -12 l 12 12 l 12 -12 l 12 12 l 12 -12 l 12 12 l 12 -12 l 12 12 l 10 -12 l 0 -14 Z"
      fill={C.fur} stroke={KRP.ink} strokeWidth={4} />
    {pose !== "hold" && pose !== "armsFolded" && (
      <polygon points="-44,-160 -16,-160 58,-104 58,-80" fill={C.furDark} stroke={KRP.ink} strokeWidth={3.5} />
    )}
    {([[-30, -78, 9], [22, -70, 7], [36, -96, 6], [-8, -64, 5]] as const).map(([sx, sy, r], i) => (
      <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.7} fill={C.furSpot} />
    ))}
    {/* ぼさぼさ髪 */}
    <path d="M -64 -250 l -14 -14 l 20 0 l -6 -26 l 24 14 l 8 -30 l 18 24 l 18 -26 l 10 28 l 24 -16 l -4 28 l 22 0 l -14 18 Z" fill={KRP.ink} />
  </g>
);

// 袈裟 (お坊さん)
const HmHbKesa: React.FC<{ x: number; y: number; s: number; lean?: number }> = ({ x, y, s, lean = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
    <polygon points="-58,-146 -34,-160 58,-74 58,-54 40,-54" fill={C.kesa} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={22} cy={-104} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
  </g>
);

// 座禅のお坊さん (Person + 組んだ脚 + 座布団 + 袈裟 + とじた目)
const HmHbZazen: React.FC<{ x: number; y: number; s: number; f: number; phase: number; open?: boolean; gaze?: [number, number] }> = ({ x, y, s, f, phase, open = false, gaze = [0, 0] }) => (
  <g>
    <ellipse cx={x} cy={y - 4 * s} rx={128 * s} ry={30 * s} fill={C.zabuton} stroke={KRP.ink} strokeWidth={5} />
    <Person x={x} y={y} s={s} f={f} phase={phase} still pose="hold" hair="none" cloth={C.sumi} clothDark={C.sumiDark}
      face={open ? "surprised" : "normal"} gaze={gaze} />
    <HmHbKesa x={x} y={y} s={s} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -108 -14 Q -100 -78 0 -70 Q 100 -78 108 -14 Q 0 6 -108 -14 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -70 -40 Q 0 -56 70 -40" stroke={C.sumiDark} strokeWidth={5} fill="none" />
      <path d="M -40 -22 Q 0 -32 40 -22" stroke={C.sumiDark} strokeWidth={4} fill="none" />
    </g>
    {!open && <HmHbFace x={x} y={y} s={s} mode="shut" />}
  </g>
);

// あくびのもやもや (全時代で同じ形)
const HmHbMoya: React.FC<{ x: number; y: number; s?: number; t?: number; f: number; o?: number }> = ({ x, y, s = 1, t = 1, f, o = 1 }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  const wob = Math.sin(f / 8 + x / 90) * 3;
  return (
    <g transform={`translate(${x} ${y + wob}) scale(${s * p})`} opacity={o}>
      {([[-34, 6, 26], [-8, -14, 32], [24, -6, 28], [40, 12, 20], [4, 14, 26]] as const).map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={C.moya} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {([[-34, 6, 26], [-8, -14, 32], [24, -6, 28], [40, 12, 20], [4, 14, 26]] as const).map(([cx, cy, r], i) => (
        <circle key={`i${i}`} cx={cx} cy={cy} r={r - 4} fill={C.moya} />
      ))}
      <path d="M -24 -4 q 10 -10 20 0 q 10 10 20 0" stroke={C.moyaDark} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ぽんと煙 (変身の記号)
const HmHbPoof: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t <= 0 || t >= 1) return null;
  const o = t < 0.5 ? 1 : (1 - t) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + t * 0.8)})`} opacity={o}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 70} cy={Math.sin(a) * 60} r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />;
      })}
      <circle r={70} fill={KRP.white} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return <path key={i} d={`M ${Math.cos(a) * 120} ${Math.sin(a) * 110} l ${Math.cos(a) * 30} ${Math.sin(a) * 30}`}
          stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};

// 横たわる人 (Person を -90° 回して寝かせる。頭が左)。G = 地面の高さ。中身は Person 座標で描く
const HmHbLie: React.FC<{ x: number; g: number; s: number; children: React.ReactNode; sway?: number }> = ({ x, g, s, children, sway = 0 }) => {
  const py = g - 60 * s;
  return <g transform={`rotate(${sway} ${x - 120 * s} ${py}) rotate(-90 ${x} ${py}) translate(${x} ${py})`}>{children}</g>;
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #184 「いまのことは、もう十分。そろそろ別のことをしよう」と知らせる、心の警報ベルです。
// 格: 山 / seed 5184
// 絵: どこ: #180 の頭の中の部屋 (続き)。演出: 部屋の壁の警報ベルがジリリリと鳴り (ハンマーが小さく速く震える・赤いランプ)、小さな人 (気分) が立ち上がって、別のドア (光が漏れる・新しいこと) へ向かう。古いドアには「もう十分」の札ではなく、時計のマーク。動き: ベルが鳴る / ランプ / 小さな人がドアへ
// どこ: 頭の中の部屋。奥の壁に「目」の形の窓が2つ (外が見える)、天井は頭蓋のような丸天井、壁は脳のしわ模様
// 演出: 長すぎるマフラーを編み終えた気分くんの頭上で警報ベルが鳴り、赤いランプが回る。気分くんは飛び上がって編み棒を置き、
//       光の漏れる新しいドアへ駆けていく。古いドアには時計のマーク
// 動き: ベル (ハンマーが小さく速く震える) / ランプの光が回る / 立つ→走る→ドアの前で指さす / ドアが開いて光が床にこぼれる / カメラが右へ寄る
const Hm184: React.FC<{ f: number }> = ({ f }) => {
  const ringOn = f >= 3;
  const ham = ringOn ? Math.sin(f * 2.7) * 13 : 0;
  const lampRot = (f * 10) % 360;
  const flash = ringOn ? 0.5 + 0.5 * Math.abs(Math.sin(f / 3)) : 0;
  const up = f >= 12;
  const walk = easeInOut(seg(f, 14, 40));
  const arrived = f >= 40;
  const door = easeOut(seg(f, 10, 30));
  const cam = easeInOut(seg(f, 4, 42));
  const s = 0.8;
  const px = up ? lerp(790, 1350, walk) : 740;
  const step = up && !arrived ? Math.abs(Math.sin(f / 2.2)) * 10 : 0;
  const py = up ? 805 - step : 746;
  const leafW = 270 * (1 - 0.78 * door);
  // 脳のしわの波線
  const wave = (y0: number, k: number) => {
    let d = `M -40 ${y0}`;
    for (let i = 0; i < 9; i++) d += ` q 60 ${(i + k) % 2 ? -34 : 34} 120 0 t 120 0`;
    return d;
  };
  const eye = (cx: number, cy: number, id: string) => {
    const shape = `M ${cx - 210} ${cy} Q ${cx} ${cy - 160} ${cx + 210} ${cy} Q ${cx} ${cy + 160} ${cx - 210} ${cy} Z`;
    return (
      <g>
        <defs><clipPath id={id}><path d={shape} /></clipPath></defs>
        <path d={shape} fill={C.skyIn} />
        <g clipPath={`url(#${id})`}>
          <path d={`M ${cx - 240} ${cy + 60} Q ${cx - 80} ${cy - 10} ${cx + 60} ${cy + 40} T ${cx + 260} ${cy + 30} L ${cx + 260} ${cy + 200} L ${cx - 240} ${cy + 200} Z`}
            fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(${cx - 120 + ((f * 1.5) % 80)} ${cy - 50})`}>
            {[[0, 0, 30], [32, -10, 36], [66, 4, 26]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill={KRP.white} />)}
          </g>
          <circle cx={cx + 120} cy={cy - 60} r={26} fill={KRP.yellow} opacity={0.9} />
        </g>
        <line x1={cx} y1={cy - 120} x2={cx} y2={cy + 120} stroke={KRP.ink} strokeWidth={6} />
        <line x1={cx - 210} y1={cy} x2={cx + 210} y2={cy} stroke={KRP.ink} strokeWidth={6} />
        <path d={shape} fill="none" stroke={KRP.ink} strokeWidth={10} />
        {/* まつげ (窓の上のひさし) */}
        {[-120, -40, 40, 120].map((dx, i) => (
          <line key={i} x1={cx + dx} y1={cy - 120 + Math.abs(dx) * 0.28} x2={cx + dx * 1.18} y2={cy - 158 + Math.abs(dx) * 0.2}
            stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        ))}
      </g>
    );
  };
  return (
    <Frame f={f} seed={5184}>
      <g transform={`translate(${960 - 70 * cam} 540) scale(${1 + 0.06 * cam}) translate(-960 -540)`}>
        {/* 壁と脳のしわ */}
        <rect x={-60} y={-60} width={2040} height={860} fill={C.headWall} />
        <g stroke={C.headWallLine} strokeWidth={6} fill="none" opacity={0.7}>
          {[180, 330, 480, 630].map((y0, k) => <path key={k} d={wave(y0, k)} />)}
        </g>
        {/* 丸天井 */}
        <path d="M -60 -60 L 1980 -60 L 1980 150 Q 960 -70 -60 150 Z" fill={C.headCeil} stroke={KRP.ink} strokeWidth={7} />
        {/* 赤いランプの光 (回る) */}
        {ringOn && (
          <g opacity={0.22 * flash}>
            <polygon points="960,60 2000,-120 2000,240" fill={KRP.red} transform={`rotate(${lampRot} 960 60)`} />
            <polygon points="960,60 2000,-120 2000,240" fill={KRP.red} transform={`rotate(${lampRot + 180} 960 60)`} />
          </g>
        )}
        {eye(520, 300, "hb184eyeL")}
        {eye(1400, 300, "hb184eyeR")}
        {/* 回転灯 */}
        <g>
          <rect x={920} y={20} width={80} height={22} rx={5} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 928 42 Q 928 100 960 104 Q 992 100 992 42 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={948} cy={62} rx={7} ry={14} fill={KRP.white} opacity={0.55} />
          {ringOn && <circle cx={960} cy={72} r={60} fill={KRP.red} opacity={0.25 * flash} />}
        </g>
        {/* 警報ベル */}
        <g transform="translate(960 260)">
          <rect x={-26} y={-110} width={52} height={60} rx={8} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-50} x2={0} y2={-150} stroke={KRP.ink} strokeWidth={5} />
          {[-72, 72].map((bx, i) => (
            <g key={i} transform={`translate(${bx + (ringOn ? Math.sin(f * 2.7 + i * 2) * 2 : 0)} 0)`}>
              <path d="M -60 18 Q -62 -62 0 -64 Q 62 -62 60 18 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
              <rect x={-66} y={12} width={132} height={14} rx={6} fill="#A8302A" stroke={KRP.ink} strokeWidth={5} />
              <path d="M -34 -30 Q -30 -52 -8 -54" stroke={KRP.white} strokeWidth={7} fill="none" opacity={0.6} strokeLinecap="round" />
              <circle cx={0} cy={-64} r={8} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* ハンマー */}
          <g transform={`rotate(${ham} 0 70)`}>
            <line x1={0} y1={70} x2={0} y2={-6} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            <circle cx={0} cy={-10} r={15} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <rect x={-40} y={60} width={80} height={44} rx={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* 鳴っている線 */}
          {ringOn && [0, 1, 2].map((k) => (
            <g key={k} opacity={(f + k) % 3 === 0 ? 1 : 0.45} stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
              <path d={`M ${-150 - k * 26} ${-40 + k * 4} q -18 30 0 60`} />
              <path d={`M ${150 + k * 26} ${-40 + k * 4} q 18 30 0 60`} />
            </g>
          ))}
        </g>
        {ringOn && f < 16 && (
          <text x={740} y={470 - Math.sin(f / 2) * 6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90}
            fill={KRP.red} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke">!</text>
        )}
        {/* 床 */}
        <rect x={-60} y={790} width={2040} height={360} fill={C.headFloor} />
        <g stroke={C.headFloorLine} strokeWidth={4}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 190} y1={790} x2={-400 + i * 260} y2={1140} />)}
          <line x1={-60} y1={900} x2={1980} y2={900} />
        </g>
        <rect x={-60} y={776} width={2040} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 古いドア (左) と時計のマーク */}
        <g>
          <rect x={140} y={370} width={270} height={420} fill={C.oldDoor} stroke={KRP.ink} strokeWidth={8} />
          <rect x={172} y={560} width={206} height={190} rx={6} fill="none" stroke="#7A5040" strokeWidth={6} />
          <circle cx={384} cy={600} r={12} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          <g transform="translate(275 465)">
            <circle r={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={Math.sin(a) * 46} y1={-Math.cos(a) * 46} x2={Math.sin(a) * 54} y2={-Math.cos(a) * 54}
                stroke={KRP.ink} strokeWidth={i % 3 ? 3 : 5} />;
            })}
            <line x1={0} y1={0} x2={0} y2={-38} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 6})`} />
            <line x1={0} y1={0} x2={26} y2={0} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
            <circle r={6} fill={KRP.ink} />
          </g>
        </g>
        {/* 新しいドア (右)。開くと光がこぼれる */}
        <g>
          <rect x={1500} y={370} width={270} height={420} fill={KRP.ink} />
          <rect x={1506} y={376} width={258} height={414} fill={KRP.white} opacity={door} />
          <rect x={1506} y={376} width={258} height={414} fill={HP.spark} opacity={0.6 * door} />
          {door > 0 && (
            <g opacity={door}>
              <polygon points={`1506,790 ${1506 + (270 - leafW)},790 ${1400 + (270 - leafW) * 1.6},1140 1180,1140`} fill={HP.spark} opacity={0.35} />
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={1520} y1={420 + i * 80} x2={1420 - i * 10} y2={400 + i * 90} stroke={HP.spark} strokeWidth={8} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 3 + i)} />
              ))}
              {[[1560, 460], [1620, 560], [1580, 660], [1650, 420]].map(([sx, sy], i) => (
                <path key={i} d={`M ${sx} ${sy - 16} L ${sx + 5} ${sy - 5} L ${sx + 16} ${sy} L ${sx + 5} ${sy + 5} L ${sx} ${sy + 16} L ${sx - 5} ${sy + 5} L ${sx - 16} ${sy} L ${sx - 5} ${sy - 5} Z`}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${f * 4 + i * 30} ${sx} ${sy})`} />
              ))}
            </g>
          )}
          {/* 扉の板 (右の蝶番で開く) */}
          <polygon points={`${1770 - leafW},${370 - 14 * door} 1770,370 1770,790 ${1770 - leafW},${790 + 14 * door}`}
            fill={C.newDoor} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={1770 - leafW + 26} cy={590} r={11} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1488} y={356} width={294} height={20} fill={C.headCeil} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 長すぎるマフラーの山 (もう十分) */}
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={420 + (i % 2) * 8} y={790 - (i + 1) * 30} width={170} height={30} rx={12}
              fill={i % 2 ? C.scarfB : C.scarfA} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <path d="M 600 530 q 40 -20 60 40" stroke={C.scarfA} strokeWidth={16} fill="none" />
          <circle cx={640} cy={770} r={28} fill={C.scarfA} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 620 760 q 20 -20 40 0 M 618 776 q 22 -16 44 2" stroke="#A8302A" strokeWidth={3} fill="none" />
          {up && <g stroke={KRP.silver} strokeWidth={6} strokeLinecap="round">
            <line x1={630} y1={770} x2={600} y2={720} /><line x1={650} y1={772} x2={690} y2={724} />
          </g>}
        </g>
        {/* 椅子 */}
        <g>
          <rect x={660} y={520} width={160} height={190} rx={30} fill={C.chair} stroke={KRP.ink} strokeWidth={7} />
          <rect x={640} y={690} width={200} height={40} rx={14} fill={C.chair} stroke={KRP.ink} strokeWidth={7} />
          {[650, 810].map((lx) => <rect key={lx} x={lx} y={728} width={20} height={64} fill={C.chairDark} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {/* 気分くん */}
        {!up ? (
          <g>
            <Person x={px} y={py} s={s} f={f} pose="sit" face={ringOn ? "surprised" : "normal"} gaze={[4, -6]} phase={2}
              cloth={KRP.orange} clothDark="#B8652F" />
            {/* ひざの上の編みかけと編み棒 */}
            <rect x={px - 40} y={py - 70} width={80} height={30} rx={8} fill={C.scarfB} stroke={KRP.ink} strokeWidth={4} />
            <g stroke={KRP.silver} strokeWidth={6} strokeLinecap="round">
              <line x1={px - 30} y1={py - 60} x2={px - 80} y2={py - 110} />
              <line x1={px + 30} y1={py - 60} x2={px + 76} y2={py - 110} />
            </g>
            <path d={`M ${px - 40} ${py - 50} Q ${px - 90} ${py - 10} 590 560`} stroke={C.scarfA} strokeWidth={12} fill="none" />
          </g>
        ) : (
          <Person x={px} y={py} s={s} f={f} pose={arrived ? "point" : "run"} face={arrived ? "joy" : "smile"} gaze={[6, 0]}
            lean={arrived ? 0 : 7} phase={2} cloth={KRP.orange} clothDark="#B8652F" />
        )}
        <TagPlate x={px} y={py - 292 * s - 44} text="気分" size={32} t={seg(f, 2, 10)} />
      </g>
      {/* 警報の赤い明滅 (画面全体) */}
      {ringOn && <rect x={-40} y={-40} width={2000} height={1160} fill={KRP.red} opacity={0.05 * flash} />}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #185 ちなみに、日本語の「退屈」は、もとは仏教の言葉です。
// 格: 山 / seed 5185
// 絵: どこ: 山の寺の本堂 (畳・柱・仏具・線香の煙)。演出: お坊さんたちが座禅を組んでいる。経典の巻物が広げられ、その中に「退屈」の2文字だけが光る (字は札として)。線香の煙がゆらゆら。動き: 線香の煙 / 巻物が広がる / 光
// どこ: 山の寺の本堂。板壁・太い柱・天蓋・須弥壇の金の仏さま・ろうそく・香炉、床は畳
// 演出: 左右で4人のお坊さんが座禅。手前の経机で経典の巻物がするすると広がり、その中の「退屈」の2文字だけが金色に光る。
//       右手前の若いお坊さんだけ、光に気づいて片目…どころか両目をぱっちり開けてしまう
// 動き: 線香の煙がゆらゆら / 巻物が左から右へ広がる / 「退屈」が光る / カメラがゆっくり寄る / ろうそくの炎
const Hm185: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const unroll = easeOut(seg(f, 4, 24));
  const glow = seg(f, 22, 34);
  const peek = f >= 30;
  const rollR = 600 + 760 * unroll;
  const flame = (cx: number, cy: number, k: number) => (
    <g>
      <rect x={cx - 9} y={cy} width={18} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${cx} ${cy - 34 - Math.sin(f / 2 + k) * 4} Q ${cx + 12} ${cy - 10} ${cx} ${cy - 2} Q ${cx - 12} ${cy - 10} ${cx} ${cy - 34 - Math.sin(f / 2 + k) * 4} Z`}
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={cx} cy={cy - 14} r={30} fill={HP.spark} opacity={0.25} />
      <rect x={cx - 26} y={cy + 60} width={52} height={14} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <rect x={cx - 6} y={cy + 74} width={12} height={90} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  return (
    <Frame f={f} seed={5185}>
      <g transform={`translate(960 560) scale(${1 + 0.08 * cam}) translate(-960 -560)`}>
        {/* 板壁 */}
        <rect x={-60} y={-60} width={2040} height={720} fill={C.templeWall} />
        <g stroke={C.templeBoard} strokeWidth={5}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={i * 86} y1={-60} x2={i * 86} y2={660} />)}</g>
        {/* 梁と欄間 */}
        <rect x={-60} y={-60} width={2040} height={70} fill={C.beam} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={100} width={2040} height={46} fill={C.beam} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.gold} strokeWidth={4} fill="none" opacity={0.7}>
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${i * 128} 90 q 32 -60 64 0 q 32 -60 64 0`} />)}
        </g>
        {/* 高窓から差す光 */}
        <polygon points="1460,150 1620,150 1300,660 1000,660" fill={KRP.white} opacity={0.08} />
        {/* 天蓋 */}
        <g transform={`translate(960 146)`}>
          <rect x={-230} y={0} width={460} height={30} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} transform={`rotate(${Math.sin(f / 14 + i) * 3} ${-210 + i * 38} 30)`}>
              <line x1={-210 + i * 38} y1={30} x2={-210 + i * 38} y2={84} stroke={KRP.gold} strokeWidth={5} />
              <circle cx={-210 + i * 38} cy={90} r={7} fill={KRP.gold} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          ))}
        </g>
        {/* 柱 */}
        {[100, 470, 1380, 1750].map((px) => (
          <g key={px}>
            <rect x={px} y={-60} width={74} height={720} fill={C.pillar} stroke={KRP.ink} strokeWidth={7} />
            <line x1={px + 18} y1={-60} x2={px + 18} y2={660} stroke={KRP.white} strokeWidth={5} opacity={0.18} />
          </g>
        ))}
        {/* 須弥壇と金の仏さま */}
        <g>
          <circle cx={960} cy={320} r={150} fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * Math.PI * 2;
            return <line key={i} x1={960 + Math.cos(a) * 110} y1={320 + Math.sin(a) * 110} x2={960 + Math.cos(a) * 146} y2={320 + Math.sin(a) * 146}
              stroke={HP.brassDark} strokeWidth={4} />;
          })}
          <circle cx={960} cy={320} r={106} fill="#E6CF7E" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 860 470 Q 850 360 910 340 L 1010 340 Q 1070 360 1060 470 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={960} cy={292} r={52} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={960} cy={238} rx={26} ry={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 936 296 q 9 6 18 0 M 966 296 q 9 6 18 0" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 900 440 Q 960 410 1020 440" stroke={HP.brassDark} strokeWidth={6} fill="none" />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M ${838 + i * 40} 470 q 20 -36 40 0 Z`} fill="#E6A3A0" stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={700} y={470} width={520} height={190} fill={C.lacquer} stroke={KRP.ink} strokeWidth={7} />
          <rect x={700} y={470} width={520} height={22} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
          <rect x={740} y={520} width={440} height={110} rx={8} fill="none" stroke={KRP.gold} strokeWidth={5} />
          {flame(760, 380, 0)}
          {flame(1160, 380, 2)}
          {/* 香炉と線香の煙 */}
          <path d="M 912 470 Q 912 430 960 430 Q 1008 430 1008 470 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          {[-12, 0, 12].map((dx) => <line key={dx} x1={960 + dx} y1={434} x2={960 + dx * 1.6} y2={384} stroke="#7A3A2A" strokeWidth={4} />)}
          {[0, 1, 2].map((k) => {
            let d = "";
            for (let y = 384; y >= 40; y -= 16) {
              const xx = 960 + (k - 1) * 18 + Math.sin(y / 46 + f / 7 + k * 2) * (8 + (384 - y) * 0.12);
              d += `${y === 384 ? "M" : "L"} ${xx} ${y} `;
            }
            return <path key={k} d={d} stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.5 - k * 0.1} strokeLinecap="round" />;
          })}
        </g>
        {/* 畳 */}
        <rect x={-60} y={660} width={2040} height={500} fill={C.tatami} />
        <g stroke={C.tatamiLine} strokeWidth={2} opacity={0.8}>
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-60} y1={668 + i * 12} x2={1980} y2={668 + i * 12} />)}
        </g>
        <g stroke={C.heri} strokeWidth={10}>
          <line x1={-60} y1={664} x2={1980} y2={664} />
          <line x1={-60} y1={880} x2={1980} y2={880} />
          {[-300, 160, 620, 1080, 1540, 2000].map((x0, i) => <line key={i} x1={960 + (x0 - 960) * 0.55} y1={664} x2={x0} y2={1140} />)}
        </g>
        {/* 座禅のお坊さんたち (奥→手前) */}
        <HmHbZazen x={400} y={760} s={0.72} f={f} phase={1} />
        <HmHbZazen x={1520} y={760} s={0.72} f={f} phase={2} />
        <HmHbZazen x={220} y={870} s={0.92} f={f} phase={3} />
        <HmHbZazen x={1700} y={870} s={0.92} f={f} phase={4} open={peek} gaze={[-7, 2]} />
        {peek && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            {[-1, 0, 1].map((k) => <line key={k} x1={1700 + k * 40} y1={870 - 292 * 0.92 - 18} x2={1700 + k * 56} y2={870 - 292 * 0.92 - 50} />)}
          </g>
        )}
        {/* 経机と巻物 */}
        <g>
          <rect x={540} y={700} width={840} height={26} rx={6} fill={C.scrollWood} stroke={KRP.ink} strokeWidth={6} />
          {[570, 1350].map((lx) => <path key={lx} d={`M ${lx - 14} 726 q 0 50 -24 70 l 52 0 q -24 -20 -24 -70 Z`} fill={C.scrollWood} stroke={KRP.ink} strokeWidth={5} />)}
          <rect x={600} y={470} width={rollR - 600} height={226} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <rect x={600} y={470} width={rollR - 600} height={16} fill={KRP.gold} opacity={0.6} />
          <rect x={600} y={680} width={rollR - 600} height={16} fill={KRP.gold} opacity={0.6} />
          {Array.from({ length: 22 }, (_, k) => {
            const cx = 630 + k * 33;
            if (cx > rollR - 18 || (cx > 920 && cx < 1050)) return null;
            return (
              <g key={k} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75}>
                {[0, 1, 2, 3, 4].map((j) => <line key={j} x1={cx} y1={500 + j * 36} x2={cx} y2={500 + j * 36 + 14 + rnd(5185, k * 5 + j) * 12} />)}
              </g>
            );
          })}
          <rect x={584} y={452} width={22} height={262} rx={8} fill={C.scrollWood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={rollR - 8} y={446} width={34} height={274} rx={14} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <rect x={rollR + 2} y={432} width={14} height={302} rx={6} fill={C.scrollWood} stroke={KRP.ink} strokeWidth={4} />
          {/* 光る「退屈」 */}
          {glow > 0 && (
            <g>
              <circle cx={985} cy={582} r={70 + 70 * glow} fill={HP.spark} opacity={0.35 * glow} />
              {Array.from({ length: 10 }, (_, i) => (
                <line key={i} x1={985} y1={582} x2={985 + Math.cos(i * 0.628 + f / 20) * 170 * glow} y2={582 + Math.sin(i * 0.628 + f / 20) * 120 * glow}
                  stroke={HP.spark} strokeWidth={6} opacity={0.5} strokeLinecap="round" />
              ))}
            </g>
          )}
          <TagPlate x={985} y={590} text="退屈" size={64} t={seg(f, 18, 26)} fill="#FFF3C4" />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #186 修行がつらくて、退いてしまうこと。お坊さんも、たいへんです。
// 格: 山 / seed 5186
// 絵: どこ: 山の寺の滝行の滝 (岩・冷たい水・木)。演出: 滝に打たれていたお坊さんが、寒さに震えて (face="worried")、**そろーりそろーり後ずさり**して滝から出ていく。後ろで先輩のお坊さんが腕組み。お坊さんの頭の上に湯気ではなく、寒さの青い線。動き: 滝 / 後ずさり / 震え
// どこ: 山の寺の裏の滝。苔むした岩の崖・杉林・滝つぼ・飛び石
// 演出: 白い行衣の若いお坊さんが、寒さにがたがた震えながら、滝を見つめたまま「そろーりそろーり」つま先立ちで後ずさり。
//       頭の上には寒さの青い線、おでこには青ざめの縦線、体からは水のしずく。右の岩の上で墨染めの先輩が腕組みでにらむ
// 動き: 滝が流れ落ちる / 滝つぼの波紋 / 後ずさり (つま先の上下) / 震え / しずく / カメラが若いお坊さんを追って右へ
const Hm186: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const back = easeInOut(seg(f, 4, 40));
  const shiver = Math.sin(f * 3.3) * 3;
  const jx = lerp(700, 1120, back) + shiver;
  const tip = Math.abs(Math.sin(f / 3.2)) * (back > 0 && back < 1 ? 12 : 3);
  const js = 0.95;
  const jy = 800 - tip;
  const inPool = jx < 1010;
  const headTop = jy - 292 * js;
  return (
    <Frame f={f} seed={5186}>
      <g transform={`translate(${960 - 70 * cam} 540) scale(1.04) translate(-960 -540)`}>
        {/* 空と遠い山 */}
        <rect x={-60} y={-60} width={2100} height={900} fill={C.skyCold} />
        <path d="M 1100 420 L 1300 230 L 1450 330 L 1640 180 L 1980 380 L 1980 700 L 1100 700 Z" fill={C.mtn} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
        {/* 杉林 (右奥) */}
        {[1240, 1360, 1480, 1620, 1760, 1900].map((tx, i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 18 + i) * 1.2} ${tx} 640)`}>
            <rect x={tx - 10} y={420 + (i % 2) * 30} width={20} height={240} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((k) => (
              <polygon key={k} points={`${tx},${170 + (i % 2) * 30 + k * 90} ${tx - 80 + k * 6},${330 + (i % 2) * 30 + k * 90} ${tx + 80 - k * 6},${330 + (i % 2) * 30 + k * 90}`}
                fill={k % 2 ? C.pineDark : C.pine} stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* 崖 (滝の後ろ) */}
        <path d="M -60 -60 L 1120 -60 L 1140 200 L 1080 420 L 1110 760 L -60 760 Z" fill={C.rock} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.rockDark} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d="M 120 80 l 60 120 l -30 140" /><path d="M 320 260 l 80 60 l -20 160" /><path d="M 960 120 l -40 160 l 50 120" />
          <path d="M 200 520 l 120 40" /><path d="M 980 520 l 60 90" />
        </g>
        {[[240, 160, 60], [430, 520, 46], [1000, 300, 50], [160, 640, 54]].map(([mx, my, r], i) => (
          <ellipse key={i} cx={mx} cy={my} rx={r} ry={r * 0.45} fill={C.leaf} opacity={0.6} />
        ))}
        {/* 崖の上の木 */}
        {[80, 260, 980].map((tx, i) => (
          <g key={i}>
            <polygon points={`${tx},${-80} ${tx - 90},${60} ${tx + 90},${60}`} fill={C.pine} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 滝 */}
        <rect x={590} y={-60} width={220} height={850} fill={C.fall} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round">
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={606 + k * 24} y1={-60} x2={606 + k * 24} y2={790} strokeDasharray={`${70 + (k % 3) * 20} 50`}
              strokeDashoffset={-(f * 16 + k * 23)} />
          ))}
        </g>
        <g stroke={KRP.blue} strokeWidth={4} opacity={0.7}>
          <line x1={598} y1={-60} x2={598} y2={790} /><line x1={802} y1={-60} x2={802} y2={790} />
        </g>
        {/* 滝つぼ */}
        <ellipse cx={720} cy={830} rx={380} ry={80} fill={C.pool} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => {
          const r = ((f * 3 + k * 40) % 120) / 120;
          return <ellipse key={k} cx={700} cy={810} rx={80 + r * 260} ry={16 + r * 50} fill="none" stroke={KRP.white} strokeWidth={4} opacity={(1 - r) * 0.8} />;
        })}
        {/* しぶき */}
        {Array.from({ length: 10 }, (_, i) => {
          const t = ((f * 2 + i * 9) % 24) / 24;
          const sx = 600 + i * 22;
          return <circle key={i} cx={sx + (i % 2 ? 1 : -1) * t * 40} cy={790 - Math.sin(t * Math.PI) * 60} r={10 - t * 6} fill={KRP.white} stroke={KRP.blue} strokeWidth={2} />;
        })}
        <ellipse cx={700} cy={760 + Math.sin(f / 10) * 6} rx={260} ry={40} fill={KRP.white} opacity={0.35} />
        {/* 飛び石と右の岩場 */}
        <path d="M 1000 790 Q 1080 770 1180 790 Q 1200 840 1100 850 Q 1000 850 1000 790 Z" fill={C.rockLight} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1300 820 Q 1320 740 1480 730 Q 1700 720 1820 760 L 2040 760 L 2040 1160 L 1250 1160 Z" fill={C.rock} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1360 780 Q 1560 760 1780 790" stroke={C.rockLight} strokeWidth={8} fill="none" />
        <rect x={-60} y={880} width={2100} height={300} fill={C.rockDark} />
        <path d="M -60 880 Q 300 860 700 900 Q 1100 930 1300 880 L 1300 1180 L -60 1180 Z" fill={C.rock} stroke={KRP.ink} strokeWidth={6} />
        {/* ぬれた足あと */}
        {[1030, 1080, 1130].filter((fx) => fx < jx - 20).map((fx, i) => (
          <ellipse key={i} cx={fx} cy={806 + (i % 2) * 8} rx={14} ry={6} fill={C.pool} opacity={0.8} />
        ))}
        {/* 先輩 (墨染め・腕組み) */}
        <Person x={1600} y={778} s={1.0} f={f} still pose="armsFolded" hair="none" face="angry" gaze={[-7, 1]}
          cloth={C.sumi} clothDark={C.sumiDark} phase={5} />
        <HmHbKesa x={1600} y={778} s={1.0} />
        {/* 若いお坊さん */}
        <Person x={jx} y={jy} s={js} f={f} still pose="hold" hair="none" face="worried" gaze={[-7, -2]} lean={7}
          cloth={C.gyoi} clothDark={C.gyoiDark} phase={1} />
        <g transform={`translate(${jx} ${jy}) scale(${js}) rotate(7)`}>
          <rect x={-66} y={-262} width={132} height={16} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 青ざめの縦線 */}
          <g stroke={C.cold} strokeWidth={4} strokeLinecap="round">
            {[-22, -6, 10, 26].map((dx) => <line key={dx} x1={dx} y1={-244} x2={dx} y2={-232} />)}
          </g>
          {/* 震えの線 */}
          <g stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={f % 4 < 2 ? 1 : 0.5}>
            <path d="M -86 -150 q -12 20 0 40" /><path d="M -100 -140 q -12 20 0 40" />
            <path d="M 86 -150 q 12 20 0 40" /><path d="M 100 -140 q 12 20 0 40" />
          </g>
        </g>
        {/* 寒さの青い線 */}
        <g stroke={C.cold} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {[-50, 0, 50].map((dx, i) => (
            <path key={i} d={`M ${jx + dx} ${headTop - 20} l 8 -12 l -8 -12 l 8 -12 l -8 -12`}
              transform={`translate(${Math.sin(f * 2 + i) * 3} 0)`} />
          ))}
        </g>
        {/* しずく */}
        {[0, 1, 2, 3].map((i) => {
          const t = ((f * 1.6 + i * 7) % 20) / 20;
          return <path key={i} d={`M ${jx - 50 + i * 34} ${jy - 160 + t * 120} q 6 10 0 14 q -6 -4 0 -14 Z`} fill={C.cold} opacity={1 - t} />;
        })}
        {/* 滝つぼの水 (足元を隠す) */}
        {inPool && (
          <g>
            <ellipse cx={jx} cy={jy + 4} rx={74} ry={18} fill={C.pool} opacity={0.85} stroke={KRP.white} strokeWidth={4} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #187 では、昔の人は、いまより暇だったのでしょうか。
// 格: 並 / seed 5187
// 絵: どこ: 大昔の森のはずれ (草原・木・遠くの山)。演出: 草原の木陰で、大昔の人 (毛皮の衣) が寝転んでいる……ように見えるが、頭上に大きな「?」。カメラがゆっくり寄る。動き: 寄る / 「?」がゆれる / 草がゆれる
// どこ: 大昔の森のはずれ。遠くの青い山・草原・大きな木の木陰・石の槍・木の実のかご
// 演出: 木陰で毛皮の衣の人が頭の後ろで手を組んで寝転び、草の茎をくわえてのんびり……に見える。その頭上に大きな「?」
// 動き: カメラがゆっくり寄る / 「?」がゆれる / 草がゆれる / チョウが飛ぶ / 雲が流れる
const Hm187: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.16 * cam;
  const hs = 1.2;
  const hx = 1090;
  const my = 800 - 60 * hs;
  const mx = hx - 186 * hs;
  return (
    <Frame f={f} seed={5187}>
      <defs>
        <linearGradient id="hb187sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9D3EA" /><stop offset="1" stopColor={C.skyWarm} />
        </linearGradient>
      </defs>
      <g transform={`translate(${940} ${650}) scale(${sc}) translate(-940 -650)`}>
        <rect x={-60} y={-60} width={2040} height={720} fill="url(#hb187sky)" />
        {/* 雲 */}
        {[[300, 140], [1500, 110]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + f * 0.8} ${cy})`}>
            {[[0, 0, 44], [50, -16, 54], [104, 0, 40]].map(([a, b, r], j) => <circle key={j} cx={a} cy={b} r={r} fill={KRP.white} />)}
          </g>
        ))}
        {/* 遠くの山 */}
        <path d="M -60 560 L 200 340 L 380 460 L 620 300 L 900 500 L 1180 360 L 1460 480 L 1700 320 L 1980 470 L 1980 640 L -60 640 Z"
          fill={C.mtn} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 620 300 L 660 340 L 640 360 L 590 330 Z M 1700 320 L 1740 356 L 1700 370 L 1670 346 Z" fill={KRP.white} />
        {/* 森のはずれ (左の木立) */}
        {[60, 190, 320].map((tx, i) => (
          <g key={i}>
            <rect x={tx - 14} y={420} width={28} height={220} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={tx} cy={400 - i * 10} r={96} fill={i % 2 ? C.leafDark : C.leaf} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 草原 */}
        <rect x={-60} y={620} width={2040} height={540} fill={C.meadow} />
        <path d="M -60 640 Q 500 600 960 640 T 1980 630 L 1980 660 L -60 660 Z" fill={C.meadowDark} opacity={0.6} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={rnd(5187, i) * 1920} cy={680 + rnd(5188, i) * 400} r={6} fill={i % 3 ? KRP.white : KRP.yellow} stroke={KRP.ink} strokeWidth={2} />
        ))}
        {/* 大きな木と木陰 */}
        <ellipse cx={1060} cy={800} rx={460} ry={56} fill={C.leafDark} opacity={0.35} />
        <path d="M 1250 800 Q 1236 600 1250 330 L 1320 330 Q 1330 600 1330 800 Z" fill={C.trunk} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1270 460 Q 1200 420 1150 360 M 1310 420 Q 1380 380 1420 330" stroke={KRP.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${Math.sin(f / 20) * 0.8} 1290 330)`}>
          {[[1290, 200, 210], [1080, 270, 160], [1500, 260, 160], [1190, 120, 140], [1420, 110, 140]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.leafDark : C.leaf} stroke={KRP.ink} strokeWidth={6} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={1000 + i * 80} cy={330 + (i % 2) * 30} r={12} fill="#D9534A" stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 石の槍と木の実のかご */}
        <line x1={1380} y1={800} x2={1450} y2={430} stroke={C.trunk} strokeWidth={14} strokeLinecap="round" />
        <path d="M 1450 430 L 1432 470 L 1476 476 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1480 800 L 1470 730 L 1600 730 L 1590 800 Z" fill="#C9A06A" stroke={KRP.ink} strokeWidth={5} />
        <g stroke="#A07A44" strokeWidth={3}>{[1490, 1520, 1550, 1580].map((lx) => <line key={lx} x1={lx} y1={736} x2={lx - 4} y2={796} />)}</g>
        {[[1500, 726], [1530, 718], [1560, 724], [1585, 716], [1545, 704]].map(([nx, ny], i) => (
          <circle key={i} cx={nx} cy={ny} r={16} fill="#8A5A30" stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 寝転ぶ大昔の人 (頭が左・手は頭の後ろ) */}
        <HmHbLie x={hx} g={800} s={hs}>
          <Person x={0} y={0} s={hs} f={f} still pose="stand" face="normal" gaze={[5, 0]} cloth={C.fur} clothDark={C.furDark} phase={2} />
          <HmHbFur x={0} y={0} s={hs} />
        </HmHbLie>
        {/* 草の茎をくわえる */}
        <g transform={`rotate(${Math.sin(f / 6) * 6} ${mx} ${my})`}>
          <line x1={mx} y1={my} x2={mx + 70} y2={my - 80} stroke={C.leafDark} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={mx + 76} cy={my - 88} rx={9} ry={16} fill="#D9C06A" stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(40 ${mx + 76} ${my - 88})`} />
        </g>
        {/* 手前の草 (ゆれる) */}
        {Array.from({ length: 22 }, (_, i) => {
          const gx = -40 + i * 92 + rnd(5190, i) * 30;
          const gy = 800 + (i % 3) * 50;
          if (gx > 640 && gx < 1140 && gy < 900) return null;
          return (
            <g key={i} transform={`rotate(${Math.sin(f / 9 + i) * 6} ${gx} ${gy})`}>
              <path d={`M ${gx - 18} ${gy} Q ${gx - 22} ${gy - 50} ${gx - 34} ${gy - 80} Q ${gx - 6} ${gy - 46} ${gx} ${gy} Q ${gx + 4} ${gy - 60} ${gx + 10} ${gy - 96} Q ${gx + 18} ${gy - 50} ${gx + 16} ${gy} Z`}
                fill={C.meadowDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* チョウ */}
        {(() => {
          const bx = 700 + Math.sin(f / 11) * 90, by = 560 + Math.cos(f / 7) * 40;
          const w = 0.4 + 0.6 * Math.abs(Math.sin(f / 1.6));
          return (
            <g transform={`translate(${bx} ${by})`}>
              <ellipse cx={-14 * w} cy={-6} rx={16 * w + 2} ry={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={14 * w} cy={-6} rx={16 * w + 2} ry={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              <line x1={0} y1={-14} x2={0} y2={8} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })()}
        <QMark x={820} y={580} s={1.9} f={f} t={seg(f, 8, 18)} />
      </g>
    </Frame>
  );
};

// ----- #188・#189 で共有する「大昔の暮らしの場」(同じ場所・同じ時間の続き) -----
//   左=岩山と洞穴の入口 / たき火 (x=470) / 木2本 (x=860・1140) とハンモック / 右=時計を彫った大きな岩の板
const HB_CLK = { x: 1500, y: 380, r: 250 };
const HmHbCamp: React.FC<{ f: number; hammock: boolean; hammockSway: number; pot?: boolean }> = ({ f, hammock, hammockSway, pot = false }) => (
  <g>
    <defs>
      <linearGradient id="hbCampSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9FCBE3" /><stop offset="1" stopColor="#F2E2BE" />
      </linearGradient>
    </defs>
    <rect x={-60} y={-60} width={2040} height={880} fill="url(#hbCampSky)" />
    <path d="M 300 560 L 520 400 L 700 500 L 980 360 L 1260 520 L 1980 420 L 1980 760 L 300 760 Z" fill={C.mtn} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
    {/* 岩山と洞穴 */}
    <path d="M -60 -60 L 330 -60 Q 420 200 400 420 Q 440 620 420 800 L -60 800 Z" fill={C.cliff} stroke={KRP.ink} strokeWidth={7} />
    <g stroke={C.cliffDark} strokeWidth={6} fill="none" strokeLinecap="round">
      <path d="M 80 60 l 60 100 l -20 90" /><path d="M 300 120 l -40 120" /><path d="M 340 520 l 40 60" />
    </g>
    <path d="M 40 800 Q 40 520 200 500 Q 360 520 360 800 Z" fill={C.cave} stroke={KRP.ink} strokeWidth={7} />
    {/* 洞穴の壁画 (手形) */}
    {[[110, 300], [170, 270]].map(([hx, hy], i) => (
      <g key={i} fill="#C96A4A" opacity={0.7}>
        <ellipse cx={hx} cy={hy} rx={16} ry={20} />
        {[-12, -4, 4, 12].map((dx) => <rect key={dx} x={hx + dx - 3} y={hy - 40} width={7} height={24} rx={3} />)}
      </g>
    ))}
    {/* 地面 */}
    <rect x={-60} y={790} width={2040} height={370} fill={C.dirt} />
    <path d="M -60 800 Q 600 780 1200 800 T 1980 796" stroke={C.dirtDark} strokeWidth={6} fill="none" />
    {Array.from({ length: 18 }, (_, i) => (
      <path key={i} d={`M ${i * 112 + 20} ${860 + (i % 3) * 60} l 8 -26 l 8 26 l 8 -20 l 6 20`} stroke={C.meadowDark} strokeWidth={4} fill="none" />
    ))}
    {/* 木2本と木陰 */}
    <ellipse cx={1000} cy={810} rx={300} ry={36} fill={C.leafDark} opacity={0.3} />
    {[860, 1140].map((tx) => (
      <rect key={tx} x={tx - 22} y={300} width={44} height={505} fill={C.trunk} stroke={KRP.ink} strokeWidth={6} />
    ))}
    {[[860, 230, 150], [1140, 220, 150], [1000, 140, 160], [760, 300, 110]].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.leafDark : C.leaf} stroke={KRP.ink} strokeWidth={6} />
    ))}
    {/* ハンモック (つるで編んだ網) */}
    {hammock && (
      <g transform={`rotate(${hammockSway} 1000 470)`}>
        <path d="M 882 470 Q 1000 700 1118 470" fill="none" stroke="#C9A06A" strokeWidth={10} />
        <path d="M 882 470 Q 1000 660 1118 470" fill="none" stroke="#C9A06A" strokeWidth={6} />
        {[-1, 0, 1].map((k) => <path key={k} d={`M ${940 + k * 60} 520 l 0 ${80 - Math.abs(k) * 30}`} stroke="#C9A06A" strokeWidth={4} />)}
      </g>
    )}
    {/* たき火 */}
    <g>
      {[-60, -30, 0, 30, 60].map((dx, i) => <ellipse key={i} cx={470 + dx} cy={806} rx={18} ry={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />)}
      <line x1={420} y1={800} x2={520} y2={780} stroke={C.trunk} strokeWidth={14} strokeLinecap="round" />
      <line x1={420} y1={780} x2={520} y2={800} stroke={C.trunk} strokeWidth={14} strokeLinecap="round" />
      <path d={`M 440 790 Q 430 ${740 - Math.sin(f / 2) * 8} 470 ${700 - Math.sin(f / 3) * 10} Q 510 ${740 + Math.sin(f / 2) * 6} 500 790 Z`}
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M 456 790 Q 452 760 470 ${734 - Math.sin(f / 2) * 6} Q 488 760 484 790 Z`} fill={KRP.yellow} />
      <circle cx={470} cy={760} r={80} fill={HP.spark} opacity={0.15 + 0.05 * Math.sin(f / 2)} />
      {[0, 1, 2].map((k) => {
        let d = "";
        for (let y = 690; y >= 330; y -= 20) {
          d += `${y === 690 ? "M" : "L"} ${470 + Math.sin(y / 50 + f / 8 + k * 2) * (6 + (690 - y) * 0.1) + k * 10} ${y} `;
        }
        return <path key={k} d={d} stroke={KRP.gray} strokeWidth={8 - k * 2} fill="none" opacity={0.55 - k * 0.12} strokeLinecap="round" />;
      })}
      {pot && (
        <g>
          <g stroke={C.trunk} strokeWidth={9} strokeLinecap="round">
            <line x1={400} y1={810} x2={470} y2={640} /><line x1={540} y1={810} x2={470} y2={640} />
          </g>
          <line x1={470} y1={640} x2={470} y2={690} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 430 690 L 510 690 Q 512 744 470 746 Q 428 744 430 690 Z" fill="#8A6A4A" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((i) => <path key={i} d={`M ${456 + i * 24} 684 q 8 -16 0 -30`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.7}
            transform={`translate(0 ${-((f * 1.2 + i * 10) % 20)})`} />)}
        </g>
      )}
    </g>
    {/* 木の実のかご */}
    <path d="M 640 820 L 630 760 L 740 760 L 730 820 Z" fill="#C9A06A" stroke={KRP.ink} strokeWidth={5} />
    {[[655, 754], [685, 748], [715, 754], [700, 736]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={15} fill="#8A5A30" stroke={KRP.ink} strokeWidth={3} />)}
    {/* 時計を彫った岩の板 */}
    <path d="M 1210 800 L 1230 120 Q 1260 70 1340 80 L 1700 70 Q 1790 90 1790 160 L 1800 800 Z" fill={C.slab} stroke={KRP.ink} strokeWidth={8} />
    <path d="M 1240 700 l 60 40 M 1760 300 l -30 60 M 1720 720 l 40 -30" stroke={C.cliffDark} strokeWidth={5} />
  </g>
);

// 時計の文字盤 (比喩)。parts = [始まりの角度, 終わりの角度, 色] の扇形を塗る (12時から時計回り)
const HmHbDial: React.FC<{ f: number; parts: [number, number, string][] }> = ({ f, parts }) => {
  const { x, y, r } = HB_CLK;
  const pt = (a: number, rr: number) => [x + Math.sin((a * Math.PI) / 180) * rr, y - Math.cos((a * Math.PI) / 180) * rr];
  const sector = (a0: number, a1: number) => {
    const [x0, y0] = pt(a0, r - 14), [x1, y1] = pt(a1, r - 14);
    return `M ${x} ${y} L ${x0} ${y0} A ${r - 14} ${r - 14} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  const end = parts.length ? Math.max(...parts.map((p) => p[1])) : 0;
  return (
    <g>
      <circle cx={x + 10} cy={y + 14} r={r} fill={KRP.ink} opacity={0.2} />
      <circle cx={x} cy={y} r={r} fill={C.dial} stroke={C.trunk} strokeWidth={18} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={KRP.ink} strokeWidth={5} />
      {parts.map(([a0, a1, col], i) => a1 - a0 > 0.5 && (
        <path key={i} d={sector(a0, a1)} fill={col} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const [ax, ay] = pt(i * 30, r - 20), [bx, by] = pt(i * 30, r - (i % 3 ? 40 : 58));
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={KRP.ink} strokeWidth={i % 3 ? 5 : 9} strokeLinecap="round" />;
      })}
      {/* 塗っている先の針 */}
      {(() => { const [hx, hy] = pt(end, r - 30); return <line x1={x} y1={y} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />; })()}
      <circle cx={x} cy={y} r={16} fill={KRP.ink} />
      <circle cx={x - 4} cy={y - 4} r={5} fill={KRP.white} opacity={0.4 + 0.3 * Math.sin(f / 6)} />
    </g>
  );
};
const hbDialPt = (a: number, rr: number): [number, number] =>
  [HB_CLK.x + Math.sin((a * Math.PI) / 180) * rr, HB_CLK.y - Math.cos((a * Math.PI) / 180) * rr];

// 寝息の「z」
const HmHbZzz: React.FC<{ x: number; y: number; f: number; k: number }> = ({ x, y, f, k }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = ((f + k * 11 + i * 9) % 27) / 27;
      const sz = 16 + i * 6;
      return (
        <path key={i} d={`M ${x + t * 40 + i * 14} ${y - t * 70 - i * 26} l ${sz} 0 l ${-sz} ${sz} l ${sz} 0`}
          stroke={KRP.blueDeep} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={1 - t * 0.6} />
      );
    })}
  </g>
);

// -------------------------------------------------------------------
// #188「大昔の人は、1日に数時間しか働かなかった」という話があります。
// 格: 山 / seed 5188
// 絵: どこ: 大昔の人の暮らしの場 (たき火・洞穴の入口・木の実のかご)。演出: 時計の文字盤 (比喩) の上で、「働く」の扇形が**小さく**だけ塗られ、残りはハンモックや昼寝のマーク。大昔の人たちがのんびり木陰で寝ている。札「〜という話」。動き: 扇形が塗られる / 寝息 / たき火の煙
// どこ: 大昔の人の暮らしの場 (洞穴の入口・手形の壁画・たき火・木の実のかご・木と木陰)。右に時計を彫った大きな岩の板
// 演出: 3人がのんびり。洞穴の前で丸太に座ってうとうと / たき火のそばで寝転ぶ / 木のハンモックでぐうぐう。
//       岩の時計では「働く」の扇形が小さくだけ塗られ、残りには ハンモック・寝息・月 の昼寝マーク。札「〜という話」
// 動き: 扇形が塗られる / 寝息の z が上る / ハンモックがゆれる / たき火の煙 / カメラがゆっくり右へ
const Hm188: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const work = 40 * easeOut(seg(f, 6, 20));
  const icons = seg(f, 16, 26);
  const sway = Math.sin(f / 12) * 3;
  return (
    <Frame f={f} seed={5188}>
      <g transform={`translate(${960 - 40 * cam} 540) scale(1.03) translate(-960 -540)`}>
        <HmHbCamp f={f} hammock hammockSway={sway} />
        {/* 洞穴の前でうとうと */}
        <rect x={160} y={742} width={150} height={44} rx={20} fill={C.trunk} stroke={KRP.ink} strokeWidth={5} />
        <Person x={235} y={786} s={0.75} f={f} still pose="sit" cloth={C.fur} clothDark={C.furDark} phase={1} lean={-6} />
        <HmHbFur x={235} y={786} s={0.75} lean={-6} />
        <HmHbFace x={235} y={786} s={0.75} lean={-6} mode="shut" />
        <HmHbZzz x={280} y={540} f={f} k={0} />
        {/* たき火のそばで寝転ぶ */}
        <HmHbLie x={770} g={806} s={0.8}>
          <Person x={0} y={0} s={0.8} f={f} still pose="banzai" cloth={C.fur} clothDark={C.furDark} phase={2} />
          <HmHbFur x={0} y={0} s={0.8} />
          <HmHbFace x={0} y={0} s={0.8} mode="shut" />
        </HmHbLie>
        <HmHbZzz x={600} y={690} f={f} k={1} />
        {/* ハンモックでぐうぐう */}
        <g transform={`rotate(${sway} 1000 470)`}>
          <HmHbLie x={1100} g={622} s={0.66}>
            <Person x={0} y={0} s={0.66} f={f} still pose="banzai" cloth={C.fur} clothDark={C.furDark} phase={3} />
            <HmHbFur x={0} y={0} s={0.66} />
            <HmHbFace x={0} y={0} s={0.66} mode="yawn" />
          </HmHbLie>
          <path d="M 890 520 Q 1000 660 1110 520" fill="none" stroke="#C9A06A" strokeWidth={7} />
          {[930, 970, 1010, 1050, 1090].map((lx) => <line key={lx} x1={lx} y1={560 + Math.abs(lx - 1000) * -0.4} x2={lx} y2={610 - Math.abs(lx - 1000) * 0.6} stroke="#C9A06A" strokeWidth={4} />)}
        </g>
        <HmHbZzz x={900} y={480} f={f} k={2} />
        {/* 岩の時計 */}
        <HmHbDial f={f} parts={[[0, work, KRP.orange]]} />
        <g opacity={icons}>
          {/* ハンモックのマーク */}
          {(() => { const [ix, iy] = hbDialPt(150, 150); return (
            <g transform={`translate(${ix} ${iy})`}>
              <line x1={-44} y1={-30} x2={-44} y2={30} stroke={C.trunk} strokeWidth={8} /><line x1={44} y1={-30} x2={44} y2={30} stroke={C.trunk} strokeWidth={8} />
              <path d="M -44 -20 Q 0 44 44 -20 Q 0 20 -44 -20 Z" fill="#C9A06A" stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={0} cy={-34} rx={40} ry={14} fill={C.leaf} stroke={KRP.ink} strokeWidth={4} />
            </g>); })()}
          {/* 寝顔のマーク */}
          {(() => { const [ix, iy] = hbDialPt(230, 150); return (
            <g transform={`translate(${ix} ${iy})`}>
              <circle r={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -18 -2 q 6 6 12 0 M 6 -2 q 6 6 12 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
              <path d="M 30 -40 l 16 0 l -16 16 l 16 0" stroke={KRP.blueDeep} strokeWidth={4} fill="none" />
            </g>); })()}
          {/* 月のマーク */}
          {(() => { const [ix, iy] = hbDialPt(305, 150); return (
            <path transform={`translate(${ix} ${iy})`} d="M 4 -34 A 34 34 0 1 0 4 34 A 44 44 0 0 1 4 -34 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />); })()}
        </g>
        {work > 8 && (() => { const [ix, iy] = hbDialPt(work / 2, 160); return (
          <g transform={`translate(${ix} ${iy})`}>
            <path d="M -18 10 L -14 -12 L 14 -12 L 18 10 Z" fill="#C9A06A" stroke={KRP.ink} strokeWidth={3} />
            <circle cx={-6} cy={-16} r={6} fill="#D9534A" stroke={KRP.ink} strokeWidth={2} /><circle cx={6} cy={-18} r={6} fill="#D9534A" stroke={KRP.ink} strokeWidth={2} />
          </g>); })()}
        <TagPlate x={1620} y={96} text="働く" size={32} t={seg(f, 14, 22)} fill="#FCE3C6" />
        <TagPlate x={1500} y={730} text="〜という話" size={40} t={seg(f, 24, 34)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #189 でもこれは、食べ物を集める時間だけを数えたもので、いまでは疑問が出されています。
// 格: 山 / seed 5189
// 絵: どこ: #188 と同じ場 (続き)。演出: 時計の文字盤の「働く」の扇形に、あとから「料理」(たき火の鍋)・「道具づくり」(石を打つ)・「水くみ」(皮袋) の扇形が**次々と足されて**、どんどん大きくなる。寝ていた人たちも、実は石を打ったり鍋をかき混ぜたりしている姿に切りかわる。札「疑問」。動き: 扇形が足される / 人が働く姿に変わる
// どこ: #188 と同じ暮らしの場 (続き)
// 演出: 岩の時計の「働く」に、「料理」「道具づくり」「水くみ」の扇形が次々と足されてどんどん大きくなる。
//       扇形が1つ足されるたびに、寝ていた人が「ぽん!」と煙に包まれて働く姿に切りかわる
//       (たき火の人→鍋をかき混ぜる / ハンモックの人→石を打つ・ハンモックは空っぽでゆれるだけ / 洞穴の人→皮袋で水を運ぶ)。
//       最後に「〜という話」の札に赤い「疑問」の札がばんと貼られる
// 動き: 扇形が足される / ぽんと切りかわる / 鍋の湯気・石のかけら・水のしずく / カメラは #188 の終わりの位置から始まる
const Hm189: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const a1 = 40 + 40 * easeOut(seg(f, 6, 14));
  const a2 = 80 + 40 * easeOut(seg(f, 16, 24));
  const a3 = 120 + 40 * easeOut(seg(f, 26, 34));
  const pA = seg(f, 6, 16), pB = seg(f, 16, 26), pC = seg(f, 26, 36);
  const doneA = f >= 11, doneB = f >= 21, doneC = f >= 31;
  const sway = Math.sin(f / 7) * (doneB ? 7 : 3);
  const stir = Math.sin(f / 4) * 14;
  const knock = Math.abs(Math.sin(f / 3.5));
  return (
    <Frame f={f} seed={5189}>
      <g transform={`translate(${920 - 30 * cam} 540) scale(${1.03 + 0.02 * cam}) translate(-960 -540)`}>
        <HmHbCamp f={f} hammock hammockSway={sway} pot={doneA} />
        {/* 洞穴の人: うとうと → 皮袋で水くみ */}
        {!doneC ? (
          <g>
            <rect x={160} y={742} width={150} height={44} rx={20} fill={C.trunk} stroke={KRP.ink} strokeWidth={5} />
            <Person x={235} y={786} s={0.75} f={f} still pose="sit" cloth={C.fur} clothDark={C.furDark} phase={1} lean={-6} />
            <HmHbFur x={235} y={786} s={0.75} lean={-6} />
            <HmHbFace x={235} y={786} s={0.75} lean={-6} mode="shut" />
          </g>
        ) : (
          <g>
            <rect x={160} y={742} width={150} height={44} rx={20} fill={C.trunk} stroke={KRP.ink} strokeWidth={5} />
            <g transform="translate(34 0)">
            {/* 皮袋 (肩にかついだ水) */}
            <path d="M 300 568 Q 360 560 368 620 Q 372 690 320 696 Q 268 690 276 620 Q 282 580 300 568 Z" fill="#B07A4A" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 296 578 q 20 -8 34 4" stroke={C.furDark} strokeWidth={5} fill="none" />
            </g>
            <Person x={250} y={800} s={0.75} f={f} pose="raise" face="worried" gaze={[4, 0]} cloth={C.fur} clothDark={C.furDark} phase={1} />
            <HmHbFur x={250} y={800} s={0.75} pose="raise" />
            {[0, 1].map((i) => { const t = ((f * 1.5 + i * 10) % 20) / 20; return (
              <path key={i} d={`M ${330 + i * 14} ${700 + t * 80} q 5 8 0 12 q -5 -4 0 -12 Z`} fill={KRP.blue} opacity={1 - t} />); })}
            <path d="M 196 528 q 4 10 0 14 q -5 -4 0 -14 Z" fill="#7FA8C9" />
          </g>
        )}
        <HmHbPoof x={250} y={680} t={pC} />
        {/* たき火の人: 寝転ぶ → 鍋をかき混ぜる */}
        {!doneA ? (
          <HmHbLie x={770} g={806} s={0.8}>
            <Person x={0} y={0} s={0.8} f={f} still pose="banzai" cloth={C.fur} clothDark={C.furDark} phase={2} />
            <HmHbFur x={0} y={0} s={0.8} />
            <HmHbFace x={0} y={0} s={0.8} mode="shut" />
          </HmHbLie>
        ) : (
          <g>
            <Person x={620} y={806} s={0.8} f={f} pose="hold" face="normal" gaze={[-6, 3]} lean={-6} cloth={C.fur} clothDark={C.furDark} phase={2} />
            <HmHbFur x={620} y={806} s={0.8} lean={-6} pose="hold" />
            <line x1={600} y1={712} x2={490 + stir * 0.4} y2={714 + Math.abs(stir) * 0.2} stroke={C.trunk} strokeWidth={9} strokeLinecap="round" />
          </g>
        )}
        <HmHbPoof x={680} y={720} t={pA} />
        {/* ハンモックの人: ぐうぐう → 木陰で石を打つ (ハンモックは空っぽでゆれる) */}
        {!doneB ? (
          <g transform={`rotate(${sway} 1000 470)`}>
            <HmHbLie x={1100} g={622} s={0.66}>
              <Person x={0} y={0} s={0.66} f={f} still pose="banzai" cloth={C.fur} clothDark={C.furDark} phase={3} />
              <HmHbFur x={0} y={0} s={0.66} />
              <HmHbFace x={0} y={0} s={0.66} mode="yawn" />
            </HmHbLie>
          </g>
        ) : (
          <g>
            <Person x={1000} y={812} s={0.72} f={f} pose="hold" face="angry" gaze={[0, 5]} cloth={C.fur} clothDark={C.furDark} phase={3} />
            <HmHbFur x={1000} y={812} s={0.72} pose="hold" />
            {/* 台の石と、打つ石 */}
            <path d="M 1050 812 L 1062 760 L 1130 756 L 1142 812 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 1078 754 L 1096 724 L 1116 756 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={1030 + knock * 20} cy={720 - knock * 40} rx={18} ry={14} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            {knock < 0.35 && [0, 1, 2].map((i) => (
              <path key={i} d={`M ${1100 + i * 18} ${730 - i * 14} l 10 -6 l 2 10 Z`} fill={KRP.gray} stroke={KRP.ink} strokeWidth={2} />
            ))}
            {knock < 0.35 && <path d="M 1100 712 l 20 -20 M 1120 726 l 26 -8" stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" />}
          </g>
        )}
        <g transform={`rotate(${sway} 1000 470)`}>
          <path d="M 890 520 Q 1000 660 1110 520" fill="none" stroke="#C9A06A" strokeWidth={7} />
          {[930, 970, 1010, 1050, 1090].map((lx) => <line key={lx} x1={lx} y1={560 + Math.abs(lx - 1000) * -0.4} x2={lx} y2={610 - Math.abs(lx - 1000) * 0.6} stroke="#C9A06A" strokeWidth={4} />)}
        </g>
        <HmHbPoof x={1020} y={600} t={pB} />
        {/* 岩の時計: 扇形が足されていく */}
        <HmHbDial f={f} parts={[[0, 40, KRP.orange], [40, a1, KRP.red], [80, a2, KRP.grayDark], [120, a3, KRP.blueDeep]]} />
        {/* 昼寝マーク (残りの所) */}
        {(() => { const [ix, iy] = hbDialPt(230, 150); return (
          <g transform={`translate(${ix} ${iy})`}>
            <circle r={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -18 -2 q 6 6 12 0 M 6 -2 q 6 6 12 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
          </g>); })()}
        {(() => { const [ix, iy] = hbDialPt(305, 150); return (
          <path transform={`translate(${ix} ${iy})`} d="M 4 -34 A 34 34 0 1 0 4 34 A 44 44 0 0 1 4 -34 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />); })()}
        {/* 扇形の中のしるし */}
        {(() => { const [ix, iy] = hbDialPt(20, 160); return (
          <g transform={`translate(${ix} ${iy})`}>
            <path d="M -18 10 L -14 -12 L 14 -12 L 18 10 Z" fill="#C9A06A" stroke={KRP.ink} strokeWidth={3} />
            <circle cx={-6} cy={-16} r={6} fill="#D9534A" stroke={KRP.ink} strokeWidth={2} /><circle cx={6} cy={-18} r={6} fill="#D9534A" stroke={KRP.ink} strokeWidth={2} />
          </g>); })()}
        {a1 > 70 && (() => { const [ix, iy] = hbDialPt(60, 160); return (
          <g transform={`translate(${ix} ${iy})`}>
            <path d="M -24 -8 L 24 -8 Q 24 22 0 24 Q -24 22 -24 -8 Z" fill="#8A6A4A" stroke={KRP.ink} strokeWidth={4} />
            <path d="M -6 -14 q 6 -10 0 -18 M 8 -14 q 6 -10 0 -18" stroke={KRP.white} strokeWidth={4} fill="none" />
          </g>); })()}
        {a2 > 110 && (() => { const [ix, iy] = hbDialPt(100, 160); return (
          <g transform={`translate(${ix} ${iy})`}>
            <path d="M -24 16 L -10 -18 L 10 -14 L 22 16 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -2 -6 l 8 14" stroke={KRP.ink} strokeWidth={3} />
          </g>); })()}
        {a3 > 150 && (() => { const [ix, iy] = hbDialPt(140, 160); return (
          <g transform={`translate(${ix} ${iy})`}>
            <path d="M -8 -24 Q 22 -26 22 6 Q 22 26 0 26 Q -22 26 -20 4 Q -18 -16 -8 -24 Z" fill="#B07A4A" stroke={KRP.ink} strokeWidth={4} />
          </g>); })()}
        <TagPlate x={1620} y={96} text="働く" size={30} fill="#FCE3C6" />
        <TagPlate x={1770} y={226} text="料理" size={30} t={seg(f, 10, 18)} fill="#F6C6BD" />
        <TagPlate x={1770} y={426} text="道具づくり" size={28} t={seg(f, 20, 28)} fill={KRP.silver} />
        <TagPlate x={1690} y={620} text="水くみ" size={30} t={seg(f, 30, 38)} fill={KRP.blueSoft} />
        <TagPlate x={1450} y={730} text="〜という話" size={40} />
        <TagPlate x={1610} y={772} text="疑問" size={50} t={seg(f, 34, 42)} fill={KRP.red} color={KRP.white} rot={-8} />
        <QMark x={1740} y={720} s={0.6} f={f} t={seg(f, 36, 42)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #190 昔の人がのんびりしていた、とは言い切れません。
// 格: 並 / seed 5190
// 絵: どこ: 博物館の展示パネル (「大昔の人の暮らし」の模型)。演出: 模型の前に置かれた「のんびり」の札が、学芸員の手で**そっと外されて**、かわりに「?」の札に替えられる。来館者が首をかしげる。動き: 札が外される / 「?」 / 首をかしげる
// どこ: 博物館の展示室。深緑の壁・天井のスポットライト・ガラスケースの中の「大昔のくらし」のジオラマ・ロープの柵・床のつや
// 演出: ケースの前の「のんびり」の札を、白手袋の学芸員の手が左から伸びてそっと持ち去り、かわりに「?」の札を置いていく。
//       右のパンフレットを持った来館者が、だんだん首をかしげる
// 動き: 手が伸びる→札を外す→「?」の札を置く / たき火のゆらぎ / 首をかしげる / カメラが少し寄る
const Hm190: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const a = easeInOut(seg(f, 2, 10)), b = easeInOut(seg(f, 10, 20)), c = easeInOut(seg(f, 20, 30)), d = easeInOut(seg(f, 30, 40));
  let hx: number, hy: number;
  if (f < 10) { hx = lerp(-160, 920, a); hy = lerp(640, 740, a); }
  else if (f < 20) { hx = lerp(920, -220, b); hy = lerp(740, 600, b) - Math.sin(b * Math.PI) * 60; }
  else if (f < 30) { hx = lerp(-220, 920, c); hy = lerp(620, 740, c) - Math.sin(c * Math.PI) * 40; }
  else { hx = lerp(920, 640, d); hy = lerp(740, 690, d); }
  const tilt = lerp(0, -8, easeInOut(seg(f, 28, 40)));
  const vx = 1580, vy = 930, vs = 1.0;
  const fireF = Math.sin(f / 2) * 3;
  return (
    <Frame f={f} seed={5190}>
      <g transform={`translate(960 640) scale(${1 + 0.05 * cam}) translate(-960 -640)`}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={2040} height={780} fill={C.museWall} />
        <rect x={-60} y={600} width={2040} height={120} fill={C.museWallDark} />
        <rect x={-60} y={-60} width={2040} height={70} fill="#22383F" />
        {/* スポットライト */}
        {[620, 960, 1300].map((lx, i) => (
          <g key={i}>
            <polygon points={`${lx - 20},40 ${lx + 20},40 ${lx + 260},620 ${lx - 260},620`} fill={KRP.white} opacity={0.07} />
            <rect x={lx - 26} y={6} width={52} height={40} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={lx} cy={48} rx={22} ry={8} fill={KRP.yellow} />
          </g>
        ))}
        {/* 展示の見出し */}
        <rect x={720} y={66} width={480} height={84} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <text x={960} y={124} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>大昔のくらし</text>
        {/* ガラスケースとジオラマ */}
        <g>
          <defs>
            <linearGradient id="hb190back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#A9D3EA" /><stop offset="1" stopColor="#F2E2BE" />
            </linearGradient>
          </defs>
          <rect x={370} y={180} width={1180} height={380} fill="url(#hb190back)" />
          <path d="M 370 420 L 520 320 L 680 400 L 900 290 L 1120 410 L 1320 320 L 1550 400 L 1550 470 L 370 470 Z" fill={C.mtn} stroke={KRP.ink} strokeWidth={4} />
          <rect x={370} y={460} width={1180} height={100} fill={C.dirt} />
          {/* 小さな洞穴 */}
          <path d="M 370 560 L 370 300 Q 520 260 620 360 Q 660 460 640 560 Z" fill={C.cliff} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 420 560 Q 430 420 510 410 Q 590 420 590 560 Z" fill={C.cave} stroke={KRP.ink} strokeWidth={4} />
          {/* 小さな木 */}
          <rect x={1300} y={340} width={20} height={180} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1310} cy={320} r={70} fill={C.leaf} stroke={KRP.ink} strokeWidth={5} />
          {/* 小さなたき火 */}
          <path d={`M 940 540 Q 932 ${510 - fireF} 960 ${484 - fireF} Q 988 ${510 + fireF} 980 540 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={960} cy={520} r={44} fill={HP.spark} opacity={0.2} />
          <line x1={930} y1={544} x2={990} y2={534} stroke={C.trunk} strokeWidth={8} strokeLinecap="round" />
          {/* 人形 */}
          <PersonMini x={780} y={550} s={0.5} color={C.fur} f={f} phase={1} />
          <PersonMini x={1100} y={552} s={0.5} color={C.fur} f={f} phase={2} arms="up" />
          <PersonMini x={1200} y={548} s={0.42} color={C.furDark} f={f} phase={3} />
          {/* ガラスの枠と反射 */}
          <rect x={360} y={170} width={1200} height={400} fill="none" stroke={KRP.ink} strokeWidth={8} />
          <rect x={360} y={170} width={1200} height={400} fill={KRP.white} opacity={0.08} />
          {[[460, 0], [820, 1], [1380, 0]].map(([gx, k], i) => (
            <polygon key={i} points={`${gx},180 ${gx + 60 + k * 40},180 ${gx - 60 + k * 40},560 ${gx - 120},560`} fill={KRP.white} opacity={0.14} />
          ))}
          <rect x={340} y={566} width={1240} height={140} fill={C.caseWood} stroke={KRP.ink} strokeWidth={7} />
          <rect x={380} y={600} width={1160} height={70} rx={6} fill="none" stroke="#5A3C2A" strokeWidth={5} />
        </g>
        {/* 床 */}
        <rect x={-60} y={706} width={2040} height={460} fill={C.museFloor} />
        <g stroke={C.museFloorLine} strokeWidth={4}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 190} y1={706} x2={-300 + i * 230} y2={1160} />)}</g>
        <rect x={340} y={712} width={1240} height={40} fill={KRP.white} opacity={0.08} />
        {/* ロープの柵 */}
        {[300, 1620].map((px) => (
          <g key={px}>
            <rect x={px - 8} y={690} width={16} height={190} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={px} cy={688} r={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={px} cy={884} rx={34} ry={10} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 300 700 Q 620 790 840 760 M 1080 760 Q 1300 790 1620 700" stroke="#A8302A" strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* 札の台 */}
        <rect x={952} y={770} width={16} height={130} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={960} cy={900} rx={60} ry={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={860} y={762} width={200} height={14} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 札: 「のんびり」は手に持ち去られ、「?」が置かれる */}
        {f < 10 && <TagPlate x={960} y={730} text="のんびり" size={44} />}
        {f >= 10 && f < 20 && <TagPlate x={hx + 40} y={hy - 4} text="のんびり" size={44} rot={-14 * b} />}
        {f >= 20 && f < 30 && <TagPlate x={hx + 40} y={hy - 4} text="？" size={60} rot={lerp(12, 0, c)} fill="#FFF3C4" />}
        {f >= 30 && <TagPlate x={960} y={724} text="？" size={60} fill="#FFF3C4" />}
        {/* 学芸員の腕と白手袋 */}
        <g>
          <line x1={hx - 900} y1={hy + 340} x2={hx - 30} y2={hy + 8} stroke={KRP.ink} strokeWidth={58} strokeLinecap="round" />
          <line x1={hx - 900} y1={hy + 340} x2={hx - 30} y2={hy + 8} stroke={C.suit} strokeWidth={48} strokeLinecap="round" />
          <line x1={hx - 70} y1={hy + 24} x2={hx - 40} y2={hy + 12} stroke={KRP.white} strokeWidth={50} />
          <ellipse cx={hx} cy={hy} rx={34} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={hx + 22} cy={hy - 20} rx={14} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${hx + 10} ${hy + 4} l 26 0 M ${hx + 8} ${hy + 14} l 22 0`} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 来館者 */}
        <Person x={vx} y={vy} s={vs} f={f} pose="hold" face={f >= 30 ? "worried" : "normal"} gaze={[-7, 2]} lean={tilt}
          cloth="#C96A4A" clothDark="#8A4A32" phase={4} />
        <g transform={`translate(${vx} ${vy}) scale(${vs}) rotate(${tilt})`}>
          <rect x={-36} y={-150} width={72} height={52} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-28} y={-142} width={26} height={20} fill={C.fur} opacity={0.7} />
          <line x1={4} y1={-136} x2={28} y2={-136} stroke={KRP.gray} strokeWidth={4} />
          <line x1={-28} y1={-114} x2={28} y2={-114} stroke={KRP.gray} strokeWidth={4} />
        </g>
        <QMark x={1700} y={610} s={0.6} f={f} t={seg(f, 32, 40)} />
      </g>
    </Frame>
  );
};

// ----- #191・#192 で共有する「時代を並べた横長の絵巻」(同じ物の続き) -----
//   机の上に広げた絵巻。6つの場面 (大昔・ローマ・修道院・江戸・19世紀・現代) を金の雲で区切る
const HB_EM = { x0: 76, x1: 1844, top: 176, bot: 744, ground: 690 };
const HB_WP = (HB_EM.x1 - HB_EM.x0) / 6;
const hbCx = (i: number) => HB_EM.x0 + HB_WP * (i + 0.5);
const HB_OFF = [-62, -62, -58, -58, -52, -8];
const hbPx = (i: number) => hbCx(i) + HB_OFF[i];
const HB_ERA = ["大昔", "ローマ", "修道院", "江戸", "19世紀", "現代"];

const HmHbEmaki: React.FC<{ f: number }> = ({ f }) => {
  const { x0, x1, top, bot, ground } = HB_EM;
  const bg = (i: number) => {
    const cx = hbCx(i), l = x0 + HB_WP * i;
    const tint = ["#ECE2C4", "#DCE8EE", "#DAD5CB", "#F0E7CE", "#D8C6A6", "#E6E2F0"][i];
    return (
      <g key={i} clipPath={`url(#hbEm${i})`}>
        <rect x={l} y={top} width={HB_WP} height={bot - top} fill={tint} />
        {i === 0 && (
          <g>
            <path d={`M ${l} ${ground} L ${l} 400 Q ${l + 90} 360 ${l + 150} 460 Q ${l + 170} 560 ${l + 150} ${ground} Z`} fill={C.cliff} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${l + 20} ${ground} Q ${l + 30} 560 ${l + 80} 552 Q ${l + 130} 560 ${l + 130} ${ground} Z`} fill={C.cave} />
            <path d={`M ${l + 150} 520 L ${l + 220} 440 L ${l + 300} 520 Z`} fill={C.mtn} stroke={KRP.ink} strokeWidth={3} />
            <rect x={l} y={ground} width={HB_WP} height={60} fill={C.dirt} />
            <path d={`M ${cx + 4} ${ground} Q ${cx - 4} ${ground - 26 - Math.sin(f / 2) * 4} ${cx + 12} ${ground - 40} Q ${cx + 28} ${ground - 22} ${cx + 20} ${ground} Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {i === 1 && (
          <g>
            <polygon points={`${cx - 120},380 ${cx},320 ${cx + 120},380`} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
            <rect x={cx - 124} y={378} width={248} height={18} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
            {[-96, -40, 40, 96].map((dx) => (
              <g key={dx}>
                <rect x={cx + dx - 12} y={396} width={24} height={ground - 410} fill="#E6E0D2" stroke={KRP.ink} strokeWidth={3.5} />
                <line x1={cx + dx - 4} y1={400} x2={cx + dx - 4} y2={ground - 16} stroke={C.stone} strokeWidth={3} />
              </g>
            ))}
            <rect x={l} y={ground - 14} width={HB_WP} height={74} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {i === 2 && (
          <g>
            <g stroke="#BDB6AA" strokeWidth={3}>
              {Array.from({ length: 9 }, (_, r) => <line key={r} x1={l} y1={top + 40 + r * 56} x2={l + HB_WP} y2={top + 40 + r * 56} />)}
              {Array.from({ length: 40 }, (_, k) => <line key={`v${k}`} x1={l + (k % 5) * 66 + ((Math.floor(k / 5) % 2) * 33)} y1={top + 40 + Math.floor(k / 5) * 56}
                x2={l + (k % 5) * 66 + ((Math.floor(k / 5) % 2) * 33)} y2={top + 96 + Math.floor(k / 5) * 56} />)}
            </g>
            {[-76, 80].map((dx) => (
              <g key={dx}>
                <path d={`M ${cx + dx - 26} 450 L ${cx + dx - 26} 340 Q ${cx + dx} 290 ${cx + dx + 26} 340 L ${cx + dx + 26} 450 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={4} />
                <line x1={cx + dx} y1={316} x2={cx + dx} y2={450} stroke={KRP.ink} strokeWidth={3} />
                <polygon points={`${cx + dx - 26},450 ${cx + dx + 26},450 ${cx + dx + 120},${ground} ${cx + dx + 40},${ground}`} fill={KRP.white} opacity={0.18} />
              </g>
            ))}
            <rect x={l} y={ground} width={HB_WP} height={60} fill="#A69E90" />
          </g>
        )}
        {i === 3 && (
          <g>
            <rect x={l} y={300} width={HB_WP} height={ground - 300} fill={C.shoji} stroke={KRP.ink} strokeWidth={4} />
            <g stroke="#B9A57E" strokeWidth={4}>
              {[1, 2, 3, 4, 5].map((k) => <line key={k} x1={l + k * 50} y1={300} x2={l + k * 50} y2={ground} />)}
              {[1, 2, 3, 4, 5, 6].map((k) => <line key={`h${k}`} x1={l} y1={300 + k * 56} x2={l + HB_WP} y2={300 + k * 56} />)}
            </g>
            <rect x={l} y={ground - 16} width={HB_WP} height={76} fill={C.tatami} stroke={KRP.ink} strokeWidth={3} />
            <rect x={cx + 6} y={ground - 92} width={40} height={60} fill="#FFF1C4" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={cx + 26} cy={ground - 62} r={34} fill={HP.spark} opacity={0.2 + 0.06 * Math.sin(f / 3)} />
            <rect x={cx + 2} y={ground - 32} width={48} height={16} fill={C.trunk} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {i === 4 && (
          <g>
            <g stroke="#B9A27E" strokeWidth={3}>{Array.from({ length: 7 }, (_, k) => <line key={k} x1={l + k * 46} y1={top} x2={l + k * 46} y2={ground} />)}</g>
            <rect x={l + 20} y={300} width={HB_WP - 40} height={170} rx={16} fill="#BFE0F2" stroke={KRP.ink} strokeWidth={5} />
            <g clipPath={`url(#hbEmWin)`}>
              <path d={`M ${l - 300 + ((f * 6) % 200)} 440 q 100 -70 200 0 t 200 0 t 200 0 t 200 0 L ${l + 600} 480 L ${l - 300} 480 Z`} fill={C.hill} stroke={KRP.ink} strokeWidth={3} />
              {[0, 1, 2].map((k) => <line key={k} x1={l + ((k * 120 + f * 14) % 300)} y1={460} x2={l + ((k * 120 + f * 14) % 300)} y2={400} stroke={C.trunk} strokeWidth={5} />)}
            </g>
            <line x1={l + 10} y1={270} x2={l + HB_WP - 10} y2={270} stroke={KRP.brass} strokeWidth={6} />
            <rect x={l} y={560} width={170} height={110} rx={14} fill="#8E3A3A" stroke={KRP.ink} strokeWidth={4} />
            <rect x={l} y={656} width={190} height={30} rx={8} fill="#A84A4A" stroke={KRP.ink} strokeWidth={4} />
            <rect x={l} y={ground} width={HB_WP} height={60} fill="#7A5A3A" />
          </g>
        )}
        {i === 5 && (
          <g>
            <rect x={cx + 24} y={300} width={110} height={160} fill="#3E4A7A" stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((k) => <rect key={k} x={cx + 34 + k * 34} y={380 - k * 24} width={26} height={90} fill="#5A6A9A" stroke={KRP.ink} strokeWidth={2} />)}
            {[0, 1, 2, 3].map((k) => <rect key={`w${k}`} x={cx + 40 + (k % 3) * 34} y={400 + (k % 2) * 20} width={8} height={8} fill={KRP.yellow} />)}
            <rect x={l} y={ground} width={HB_WP} height={60} fill="#9C8A7A" />
            <path d={`M ${cx + 100} ${ground} L ${cx + 92} ${ground - 50} L ${cx + 128} ${ground - 50} L ${cx + 120} ${ground} Z`} fill="#B0633F" stroke={KRP.ink} strokeWidth={3} />
            {[-1, 0, 1].map((k) => <ellipse key={k} cx={cx + 110 + k * 14} cy={ground - 84 + Math.abs(k) * 10} rx={10} ry={30} fill={C.leaf} stroke={KRP.ink} strokeWidth={3}
              transform={`rotate(${k * 22} ${cx + 110 + k * 14} ${ground - 50})`} />)}
          </g>
        )}
      </g>
    );
  };
  return (
    <g>
      {/* 机 */}
      <rect x={-60} y={-60} width={2040} height={1220} fill={C.table} />
      <g stroke={C.tableLine} strokeWidth={6} fill="none" opacity={0.7}>
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -60 ${40 + i * 130} q 500 ${i % 2 ? 16 : -16} 1000 0 q 500 ${i % 2 ? -16 : 16} 1040 0`} />)}
      </g>
      <defs>
        {Array.from({ length: 6 }, (_, i) => (
          <clipPath key={i} id={`hbEm${i}`}><rect x={x0 + HB_WP * i} y={top} width={HB_WP} height={bot - top} /></clipPath>
        ))}
        <clipPath id="hbEmWin"><rect x={x0 + HB_WP * 4 + 20} y={300} width={HB_WP - 40} height={170} rx={16} /></clipPath>
      </defs>
      {/* 紙と表装 */}
      <rect x={x0 + 12} y={top - 14} width={x1 - x0} height={bot - top + 40} fill={KRP.ink} opacity={0.3} />
      <rect x={x0} y={top - 26} width={x1 - x0} height={bot - top + 52} fill={C.brocade} stroke={KRP.ink} strokeWidth={6} />
      <g fill={KRP.gold} opacity={0.6}>
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={x0 + 22 + i * 45} cy={top - 13} r={4} />)}
        {Array.from({ length: 40 }, (_, i) => <circle key={`b${i}`} cx={x0 + 22 + i * 45} cy={bot + 13} r={4} />)}
      </g>
      {Array.from({ length: 6 }, (_, i) => bg(i))}
      <rect x={x0} y={top} width={x1 - x0} height={bot - top} fill="none" stroke={KRP.ink} strokeWidth={5} />
      {/* 金の雲 (すやり霞): 上下の帯と場面の区切り */}
      <g fill={KRP.gold} stroke={HP.brassDark} strokeWidth={3}>
        {Array.from({ length: 26 }, (_, i) => <ellipse key={i} cx={x0 + 30 + i * 70} cy={top + 22 + (i % 2) * 8} rx={50} ry={24} />)}
        {Array.from({ length: 26 }, (_, i) => <ellipse key={`d${i}`} cx={x0 + 30 + i * 70} cy={bot - 20 - (i % 2) * 8} rx={50} ry={22} />)}
        {[1, 2, 3, 4, 5].map((k) => (
          <g key={k}>
            {Array.from({ length: 9 }, (_, j) => <ellipse key={j} cx={x0 + HB_WP * k + (j % 2 ? 8 : -8)} cy={top + 50 + j * 62} rx={18} ry={34} />)}
          </g>
        ))}
      </g>
      {/* 軸 */}
      {[x0 - 30, x1 + 4].map((ax, i) => (
        <g key={i}>
          <rect x={ax} y={top - 60} width={26} height={bot - top + 120} rx={10} fill={C.scrollWood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={ax - 4} y={top - 74} width={34} height={22} rx={6} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
          <rect x={ax - 4} y={bot + 52} width={34} height={22} rx={6} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {HB_ERA.map((t, i) => <TagPlate key={t} x={hbCx(i)} y={226} text={t} size={30} />)}
    </g>
  );
};

// 時代ごとの人 (服と髪の上書きつき)。y は足元 (地面 690)
const HmHbEra: React.FC<{ i: number; f: number; yawn: boolean; face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "hold" | "sit"; gaze?: [number, number] }> = ({ i, f, yawn, face = "normal", pose = "stand", gaze = [0, 0] }) => {
  const x = hbPx(i), y = HB_EM.ground, s = 0.5;
  const cloth = [C.fur, C.toga, C.robe, C.kimono, C.vic, HP.you][i];
  const clothDark = [C.furDark, "#CFC6B4", C.robeDark, C.kimonoDark, C.vicDark, HP.youDark][i];
  const hair = i === 2 ? "none" : "cap";
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} still pose={pose} face={yawn ? "normal" : face} gaze={gaze} cloth={cloth} clothDark={clothDark} hair={hair} phase={i} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {i === 1 && <polygon points="-58,-150 -34,-160 58,-74 58,-54 40,-54" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />}
        {i === 2 && <path d="M -64 -236 Q -70 -200 -50 -180 L -40 -196 Q -56 -214 -52 -240 Z M 64 -236 Q 70 -200 50 -180 L 40 -196 Q 56 -214 52 -240 Z" fill={C.robeDark} stroke={KRP.ink} strokeWidth={3} />}
        {i === 2 && <path d="M -58 -160 Q 0 -120 58 -160 L 58 -150 Q 0 -110 -58 -150 Z" fill={C.robeDark} />}
        {i === 3 && <g><rect x={-10} y={-318} width={20} height={36} rx={6} fill={KRP.ink} transform="rotate(-20 0 -290)" />
          <path d="M -58 -160 L 0 -100 L 58 -160" fill="none" stroke={KRP.white} strokeWidth={6} /></g>}
        {i === 4 && <g>
          <rect x={-70} y={-296} width={140} height={12} rx={5} fill={KRP.ink} />
          <path d="M -46 -290 Q -48 -350 0 -352 Q 48 -350 46 -290 Z" fill={KRP.ink} />
          <path d="M -20 -160 L 0 -120 L 20 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>}
        {i === 5 && <path d="M -40 -150 Q 0 -128 40 -150" stroke={HP.youDark} strokeWidth={6} fill="none" />}
      </g>
      {i === 0 && <HmHbFur x={x} y={y} s={s} pose={pose} />}
      {yawn && <HmHbFace x={x} y={y} s={s} mode="yawn" />}
    </g>
  );
};

// -------------------------------------------------------------------
// #191わかっているのは、退屈が、ずっと昔からあったこと。
// 格: 山 / seed 5191
// 絵: どこ: 時代を並べた横長の絵巻 (左=大昔・古代ローマ・中世の修道院・江戸・現代)。演出: どの時代の場面にも、あくびをしている人が1人ずついて、そのあくびが**同じ形の灰色のもやもや**で表される。もやもやが絵巻の上でつながって1本の線になる。動き: あくびが順に出る / もやもやがつながる
// どこ: 机の上に広げた横長の絵巻。金の霞で区切った6場面 (大昔の洞穴 / ローマの神殿 / 中世の修道院 / 江戸の座敷 / 19世紀の汽車 / 現代の部屋)
// 演出: 左の時代から順に、1人ずつ大あくび (大昔とローマと江戸の人は伸びまでする)。口から出る灰色のもやもやが、どの時代も同じ形。
//       最後にもやもやどうしが1本の灰色の線でつながる
// 動き: あくびが左から順に出る / もやもやがぽんと出てゆれる / 線が左から右へ伸びる / カメラがゆっくり左から右へ
const HB_YAWN = [4, 9, 14, 19, 24, 29];
const Hm191: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const line = easeInOut(seg(f, 32, 42));
  const my = 470;
  let d = `M ${hbPx(0) + 30} ${my}`;
  for (let i = 1; i < 6; i++) {
    const xa = hbPx(i - 1) + 30, xb = hbPx(i) + 30;
    d += ` Q ${(xa + xb) / 2} ${i % 2 ? my - 50 : my + 40} ${xb} ${my}`;
  }
  const poses: ("stand" | "banzai" | "hold" | "sit")[] = ["banzai", "banzai", "hold", "banzai", "sit", "stand"];
  return (
    <Frame f={f} seed={5191}>
      <g transform={`translate(${960 + lerp(20, -10, cam)} 540) scale(1.09) translate(-960 -470)`}>
        <HmHbEmaki f={f} />
        <path d={d} stroke={C.moya} strokeWidth={16} fill="none" strokeLinecap="round" pathLength={100}
          strokeDasharray="100 100" strokeDashoffset={100 * (1 - line)} opacity={0.9} />
        <path d={d} stroke={C.moyaDark} strokeWidth={4} fill="none" strokeLinecap="round" pathLength={100}
          strokeDasharray="2 4" strokeDashoffset={-f * 0.5} opacity={line > 0 ? 0.6 * line : 0} />
        {Array.from({ length: 6 }, (_, i) => {
          const on = f >= HB_YAWN[i];
          const px = hbPx(i);
          return (
            <g key={i}>
              <HmHbEra i={i} f={f} yawn={on} pose={on ? poses[i] : poses[i] === "banzai" ? "stand" : poses[i]} />
              {i === 2 && (
                <g>
                  <rect x={px - 30} y={612} width={60} height={42} rx={4} fill="#8A3A2A" stroke={KRP.ink} strokeWidth={3} transform={`rotate(-8 ${px} 632)`} />
                  <line x1={px} y1={614} x2={px - 4} y2={652} stroke={KRP.gold} strokeWidth={3} />
                </g>
              )}
              {on && (
                <path d={`M ${px + 12} 600 Q ${px + 52} 590 ${px + 42} 540 Q ${px + 32} 512 ${px + 30} 496`}
                  stroke={C.moya} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />
              )}
              <HmHbMoya x={px + 30} y={my} s={0.85} t={seg(f, HB_YAWN[i] + 1, HB_YAWN[i] + 7)} f={f} />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #192 変わったのは、退屈が来たときの、逃げ道のほうです。
// 格: 山 / seed 5192
// 絵: どこ: #191 の絵巻 (続き)。演出: 各時代のあくびの人から、それぞれの逃げ道の扉が開く: 大昔=たき火のおしゃべり、ローマ=広場、江戸=祭り、19世紀=本、現代=スマホ。現代の扉がいちばん近く (手の届くところ) にある。動き: 扉が順に開く / 現代の扉がいちばん速く開く
// どこ: #191 の絵巻 (続き)。もやもやの線は薄く残っている
// 演出: 各時代のあくびの人の先に「逃げ道の扉」が出て、順に開く: 大昔=たき火のおしゃべり / ローマ=広場の人だかり / 江戸=祭りの提灯 /
//       19世紀=本。扉は時代が新しいほど人に近い (足あとの点線が短くなる)。修道院の扉だけは鎖と錠前でがっちり閉まって、
//       お坊さんが困り顔でがちゃがちゃ (お坊さんも、たいへんです)。現代は扉が手の中のスマホそのもので、いちばん速くぱっと開く
// 動き: 扉が左から順に開く (現代がいちばん速い) / 扉の光 / 錠前がゆれる / 開いた人がにっこり / カメラが右の現代へ寄る
type HbVig = "fire" | "forum" | "lock" | "matsuri" | "book";
const HB_DOOR: { i: number; dx: number; kind: HbVig; a: number; b: number }[] = [
  { i: 0, dx: 92, kind: "fire", a: 6, b: 20 },
  { i: 1, dx: 84, kind: "forum", a: 10, b: 22 },
  { i: 2, dx: 76, kind: "lock", a: 99, b: 100 },
  { i: 3, dx: 68, kind: "matsuri", a: 16, b: 26 },
  { i: 4, dx: 58, kind: "book", a: 20, b: 28 },
];
const HmHbDoor: React.FC<{ x: number; open: number; kind: HbVig; f: number; id: string }> = ({ x, open, kind, f, id }) => {
  const g = HB_EM.ground, w = 84, h = 132, l = x - w / 2, t = g - h;
  const lw = w * (1 - 0.82 * open);
  const shake = kind === "lock" && f > 12 ? Math.sin(f * 2.2) * 3 : 0;
  return (
    <g>
      <defs><clipPath id={id}><rect x={l} y={t} width={w} height={h} /></clipPath></defs>
      {open > 0 && <polygon points={`${l},${g} ${l + w},${g} ${l + w + 60},${g + 40} ${l - 60},${g + 40}`} fill={HP.spark} opacity={0.3 * open} />}
      <rect x={l - 8} y={t - 8} width={w + 16} height={h + 8} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
      <g clipPath={`url(#${id})`}>
        <rect x={l} y={t} width={w} height={h} fill={kind === "matsuri" ? "#2E3560" : kind === "forum" ? "#BFE0F2" : "#F6D69A"} />
        {kind === "fire" && (
          <g>
            <path d={`M ${x - 10} ${g - 6} Q ${x - 16} ${g - 40 - Math.sin(f / 2) * 4} ${x} ${g - 58} Q ${x + 16} ${g - 40} ${x + 10} ${g - 6} Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
            {[-28, 28].map((dx) => <circle key={dx} cx={x + dx} cy={g - 50} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
            <ellipse cx={x - 22} cy={g - 96} rx={18} ry={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={x + 20} cy={g - 106} rx={18} ry={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {kind === "forum" && (
          <g>
            {[-26, 0, 26].map((dx) => <rect key={dx} x={x + dx - 5} y={t + 20} width={10} height={70} fill={C.stone} stroke={KRP.ink} strokeWidth={2} />)}
            {[-30, -10, 10, 30].map((dx, k) => <circle key={dx} cx={x + dx} cy={g - 30 + (k % 2) * 6 - Math.abs(Math.sin(f / 4 + k)) * 4} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        )}
        {kind === "matsuri" && (
          <g>
            <path d={`M ${l} ${t + 30} Q ${x} ${t + 50} ${l + w} ${t + 30}`} stroke={KRP.ink} strokeWidth={2} fill="none" />
            {[-26, 0, 26].map((dx, k) => (
              <g key={dx} transform={`rotate(${Math.sin(f / 6 + k) * 6} ${x + dx} ${t + 40})`}>
                <ellipse cx={x + dx} cy={t + 58} rx={11} ry={15} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                <circle cx={x + dx} cy={t + 58} r={18} fill={HP.spark} opacity={0.3} />
              </g>
            ))}
            {[-20, 16].map((dx) => <PersonMini key={dx} x={x + dx} y={g} s={0.26} color={KRP.blueDeep} f={f} arms="up" phase={dx} />)}
          </g>
        )}
        {kind === "book" && (
          <g>
            <circle cx={x} cy={g - 60} r={46} fill={HP.spark} opacity={0.35} />
            <path d={`M ${x} ${g - 40} Q ${x - 22} ${g - 54} ${x - 36} ${g - 46} L ${x - 36} ${g - 84} Q ${x - 22} ${g - 92} ${x} ${g - 78} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${x} ${g - 40} Q ${x + 22} ${g - 54} ${x + 36} ${g - 46} L ${x + 36} ${g - 84} Q ${x + 22} ${g - 92} ${x} ${g - 78} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
      </g>
      {/* 扉の板 */}
      <polygon points={`${l},${t} ${l + lw},${t - 6 * open} ${l + lw},${g + 6 * open} ${l},${g}`} fill="#A0703F" stroke={KRP.ink} strokeWidth={4} />
      <circle cx={l + lw - 12} cy={g - 64} r={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
      {kind === "lock" && (
        <g transform={`translate(${shake} 0)`}>
          <path d={`M ${l - 4} ${t + 20} L ${l + w + 4} ${g - 20} M ${l + w + 4} ${t + 20} L ${l - 4} ${g - 20}`} stroke={KRP.grayDark} strokeWidth={9} strokeDasharray="12 4" />
          <path d={`M ${x - 12} ${g - 76} Q ${x - 12} ${g - 98} ${x} ${g - 98} Q ${x + 12} ${g - 98} ${x + 12} ${g - 76}`} stroke={KRP.grayDark} strokeWidth={6} fill="none" />
          <rect x={x - 20} y={g - 78} width={40} height={32} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={x} cy={g - 64} r={4} fill={KRP.ink} />
        </g>
      )}
      {open > 0.2 && [0, 1, 2].map((k) => (
        <line key={k} x1={l + lw + 6} y1={t + 20 + k * 40} x2={l + lw + 36} y2={t + 10 + k * 44} stroke={HP.spark} strokeWidth={5} strokeLinecap="round" opacity={open} />
      ))}
    </g>
  );
};
const Hm192: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const phone = easeOut(seg(f, 24, 27));
  const px5 = hbPx(5);
  return (
    <Frame f={f} seed={5192}>
      <g transform={`translate(960 540) scale(${1.07 + 0.03 * cam}) translate(-960 -470)`}>
        <HmHbEmaki f={f} />
        {Array.from({ length: 6 }, (_, i) => <HmHbMoya key={i} x={hbPx(i) + 30} y={470} s={0.7} f={f} o={0.35} />)}
        {HB_DOOR.map(({ i, dx, kind, a, b }) => {
          const open = kind === "lock" ? 0 : easeOut(seg(f, a, b));
          const px = hbPx(i), dxp = hbCx(i) + dx;
          return (
            <g key={i}>
              {/* 足あとの点線 (扉までの遠さ) */}
              <line x1={px + 34} y1={HB_EM.ground + 4} x2={dxp - 50} y2={HB_EM.ground + 4} stroke={KRP.ink} strokeWidth={5} strokeDasharray="6 10" strokeLinecap="round" opacity={0.6} />
              <HmHbDoor x={dxp} open={open} kind={kind} f={f} id={`hb192d${i}`} />
              <HmHbEra i={i} f={f} yawn={kind === "lock" ? false : open < 0.5}
                face={kind === "lock" ? "worried" : "joy"} pose={i === 4 ? "sit" : i === 2 ? "hold" : "stand"} gaze={[5, 0]} />
              {i === 2 && (
                <rect x={px - 30} y={612} width={60} height={42} rx={4} fill="#8A3A2A" stroke={KRP.ink} strokeWidth={3} transform={`rotate(-8 ${px} 632)`} />
              )}
              {kind === "lock" && f > 12 && (
                <path d={`M ${px + 40} 520 q 6 10 0 14 q -6 -4 0 -14 Z`} fill="#7FA8C9" />
              )}
            </g>
          );
        })}
        {/* 現代: 扉は手の中のスマホ */}
        <HmHbEra i={5} f={f} yawn={phone < 0.5} face="smile" pose="hold" gaze={[0, 5]} />
        <Sumaho x={px5} y={642} s={0.2} f={f} screen={phone > 0.5 ? "feed" : "off"} glow={phone} />
        {phone < 1 && (
          <polygon points={`${px5 - 15},612 ${px5 - 15 + 30 * (1 - 0.85 * phone)},${610 - 4 * phone} ${px5 - 15 + 30 * (1 - 0.85 * phone)},${674 + 4 * phone} ${px5 - 15},672`}
            fill="#A0703F" stroke={KRP.ink} strokeWidth={3} />
        )}
        {phone > 0 && [0, 1, 2, 3].map((k) => {
          const a = -Math.PI / 2 + (k - 1.5) * 0.5;
          return <line key={k} x1={px5 + Math.cos(a) * 30 + (k - 1.5) * 30} y1={642 + Math.sin(a) * 20} x2={px5 + Math.cos(a) * 50 + (k - 1.5) * 44} y2={642 + Math.sin(a) * 34}
            stroke={HP.spark} strokeWidth={5} strokeLinecap="round" opacity={phone} />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #193 結び、暇は、どこへ消えたのか。
// 格: 山 / seed 5193
// 絵: 章扉 (結び)。どこ: 序の #15 と同じ「尋ね人」の貼り紙のある夜の部屋の壁。演出: 貼り紙の暇の雲の絵に、捜索係が虫めがねを当てる。貼り紙の端がまたぱたぱた揺れる。ChapterDoor の num は付けずに title だけ「結び、暇は、どこへ消えたのか。」を右に (前作の結びの章扉の作り方にならう: num={0})。動き: 貼り紙のゆれ / 虫めがね / 時計
// どこ: 夜の部屋の壁 (しま模様の壁紙・電気スタンドの明かり・月の見える窓・壁の時計・床)。壁に「尋ね人」の貼り紙
// 演出: 木の踏み台に乗った捜索係が、貼り紙の暇の雲の絵に虫めがねを当てる。虫めがねが来ると、絵の雲がちらっと目をそらす。
//       すきま風で貼り紙の右下の角がぱたぱためくれる。右に章の題字
// 動き: 貼り紙の角のゆれ / 虫めがねが雲へ寄る / 雲の目 / 時計の秒針 / カーテンのゆれ / カメラが少し寄る
const Hm193: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const flap = 0.5 + 0.5 * Math.sin(f / 3.5);
  const e = easeInOut(seg(f, 6, 26));
  const lx = lerp(540, 615, e) + Math.sin(f / 7) * 6, ly = lerp(480, 405, e) + Math.cos(f / 9) * 4;
  const shy = seg(f, 24, 32);
  const fold = 40 + 34 * flap;
  return (
    <Frame f={f} seed={5193} dark
      over={<ChapterDoor num={0} title="結び、暇は、どこへ消えたのか。" t={seg(f, 8, 22)} />}>
      <g transform={`translate(700 420) scale(${1 + 0.05 * cam}) translate(-700 -420)`}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={2040} height={960} fill={C.nightWall} />
        <g stroke={C.nightStripe} strokeWidth={14}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={i * 88} y1={-60} x2={i * 88} y2={900} />)}</g>
        {/* 電気スタンドの明かり */}
        <ellipse cx={720} cy={400} rx={560} ry={420} fill={C.lampWarm} opacity={0.16} />
        <ellipse cx={720} cy={400} rx={380} ry={300} fill={C.lampWarm} opacity={0.12} />
        {/* 窓と月とカーテン */}
        <rect x={1330} y={290} width={380} height={300} fill="#1F2240" stroke={KRP.ink} strokeWidth={8} />
        <line x1={1520} y1={290} x2={1520} y2={590} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1620} cy={370} r={40} fill="#FFF3C4" />
        <circle cx={1606} cy={362} r={8} fill="#EADBA0" />
        {[[1380, 340], [1450, 460], [1680, 520], [1400, 540]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3.5} fill={KRP.white} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i))} />)}
        <path d={`M 1310 280 L 1310 600 Q ${1370 + Math.sin(f / 9) * 10} 560 1380 280 Z`} fill="#6A4E7A" stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 1730 280 L 1730 600 Q ${1670 + Math.sin(f / 9 + 1) * 10} 560 1660 280 Z`} fill="#6A4E7A" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1290} y={266} width={460} height={18} rx={8} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁の時計 */}
        <g transform="translate(1520 150)">
          <circle r={86} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * 66} y1={-Math.cos(a) * 66} x2={Math.sin(a) * (i % 3 ? 74 : 60)} y2={-Math.cos(a) * (i % 3 ? 74 : 60)} stroke={KRP.ink} strokeWidth={i % 3 ? 3 : 6} />;
          })}
          <line x1={0} y1={0} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" transform="rotate(-60)" />
          <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${60 + f * 0.1})`} />
          <line x1={0} y1={10} x2={0} y2={-66} stroke={KRP.red} strokeWidth={3} transform={`rotate(${f * 6})`} />
          <circle r={7} fill={KRP.ink} />
        </g>
        {/* 「尋ね人」の貼り紙 */}
        <g transform="rotate(-2 710 390)">
          <rect x={446} y={86} width={560} height={630} fill={KRP.ink} opacity={0.3} />
          <path d={`M 430 70 L 990 70 L 990 ${700 - fold} L ${990 - fold} 700 L 430 700 Z`} fill={C.poster} stroke={KRP.ink} strokeWidth={7} />
          {/* めくれた角の裏 */}
          <path d={`M 990 ${700 - fold} L ${990 - fold} 700 L ${990 - fold * 0.9} ${700 - fold * 0.95} Z`} fill="#D9CDB0" stroke={KRP.ink} strokeWidth={5} />
          <text x={710} y={178} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#8A3A2A">尋ね人</text>
          <rect x={500} y={214} width={420} height={320} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {/* 暇の雲の似顔絵 */}
          <g transform={`translate(710 ${380 + Math.sin(f / 10) * 3})`}>
            {([[-80, 20, 56], [-30, -30, 70], [40, -20, 64], [90, 26, 50], [10, 40, 62]] as const).map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            ))}
            {([[-80, 20, 56], [-30, -30, 70], [40, -20, 64], [90, 26, 50], [10, 40, 62]] as const).map(([cx, cy, r], i) => (
              <circle key={`i${i}`} cx={cx} cy={cy} r={r - 5} fill={KRP.white} />
            ))}
            <ellipse cx={-22 + 12 * shy} cy={4} rx={8} ry={11} fill={KRP.ink} />
            <ellipse cx={30 + 12 * shy} cy={4} rx={8} ry={11} fill={KRP.ink} />
            <path d="M -8 34 Q 4 42 16 34" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            {shy > 0.5 && <path d="M 80 -30 q 6 10 0 14 q -6 -4 0 -14 Z" fill="#7FA8C9" />}
          </g>
          <text x={710} y={610} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.ink}>暇</text>
          {[640, 668].map((ly2) => <rect key={ly2} x={540} y={ly2} width={ly2 === 640 ? 340 : 260} height={10} rx={5} fill={KRP.gray} />)}
          {/* 画びょうとテープ */}
          {[470, 950].map((tx) => <g key={tx}><circle cx={tx} cy={100} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} /><circle cx={tx - 4} cy={96} r={4} fill={KRP.white} opacity={0.6} /></g>)}
          <rect x={410} y={666} width={90} height={32} fill="#E8D9A0" opacity={0.85} stroke={KRP.ink} strokeWidth={3} transform="rotate(-30 455 682)" />
        </g>
        {/* すきま風の線 */}
        {[0, 1].map((k) => (
          <path key={k} d={`M ${1100 + k * 30} ${650 + k * 30} q -40 -20 -80 0`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.3 + 0.3 * flap} strokeLinecap="round" />
        ))}
        {/* 床と幅木 */}
        <rect x={-60} y={890} width={2040} height={280} fill={C.nightFloor} />
        <rect x={-60} y={880} width={2040} height={20} fill="#2E2C44" stroke={KRP.ink} strokeWidth={4} />
        {/* 踏み台と捜索係 */}
        <rect x={210} y={800} width={240} height={30} rx={6} fill="#A06A3C" stroke={KRP.ink} strokeWidth={6} />
        {[230, 410].map((sx) => <rect key={sx} x={sx} y={828} width={22} height={150} fill="#8A5A30" stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={236} y={900} width={190} height={16} fill="#8A5A30" stroke={KRP.ink} strokeWidth={4} />
        <Sousa x={330} y={802} s={0.95} f={f} pose="raise" face={shy > 0.5 ? "surprised" : "normal"} gaze={[6, -4]} lensAt={[lx, ly]} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_184: (f) => <Hm184 f={f} />,
  hm_185: (f) => <Hm185 f={f} />,
  hm_186: (f) => <Hm186 f={f} />,
  hm_187: (f) => <Hm187 f={f} />,
  hm_188: (f) => <Hm188 f={f} />,
  hm_189: (f) => <Hm189 f={f} />,
  hm_190: (f) => <Hm190 f={f} />,
  hm_191: (f) => <Hm191 f={f} />,
  hm_192: (f) => <Hm192 f={f} />,
  hm_193: (f) => <Hm193 f={f} />,
};

export const HM_HB_MOTIFS: string[] = [
  "hm_184", // #184
  "hm_185", // #185
  "hm_186", // #186
  "hm_187", // #187
  "hm_188", // #188
  "hm_189", // #189
  "hm_190", // #190
  "hm_191", // #191
  "hm_192", // #192
  "hm_193", // #193
];

export const himaHbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
