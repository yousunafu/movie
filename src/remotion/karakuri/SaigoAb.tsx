// 「人類は、昔から飛ばして観ていた」: 文#13〜#25 (13文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで13枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1012〜1024。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#242B38",      // 夜の部屋の壁
  deskWood: "#9A7752",   // 現代の机
  deskWoodDark: "#7C5E3F",
  screenBase: "#1F2833", // 画面の地
  glowWarm: "#F6E4A6",   // 画面やろうそくの光
  sajikiWood: "#A4773E", // 桟敷の木
  sajikiDark: "#7E5A2E",
  matsu: "#4E7C45",      // 松羽目の松
  kinji: "#E6CF8B",      // 松羽目の金地
  kimonoRed: "#B24A5E",
  kimonoBlue: "#4C6B8A",
  kimonoGreen: "#6E8F5A",
  zabuton: "#7A9B6A",
  operaRed: "#8E2F38",   // ナポリの壁の赤
  operaGold: "#D9B45C",
  candle: "#F2B64C",     // 炎
  tagPaper: "#E8D9A8",   // 値札・付箋の紙
  roadSand: "#D9C184",   // 街道の土
  dawnTop: "#3A4A6B",    // 夜明けの空の上
  dawnLow: "#E8A45C",    // 夜明けの空の下
  flesh: "#F2C9A0",      // 手・親指
} as const;
void W; void H; void useCurrentFrame;
void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void TagPlate;

// ===================================================================
// このファイルだけの小さな道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 決まった見た目にする擬似乱数 (レンダのたびに変わらない)
const rnd = (s: number, i: number) => {
  const v = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453;
  return v - Math.floor(v);
};
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// 浮かぶ音符 (おしゃべり・笑い声・歌)
const Notes: React.FC<{
  f: number; x: number; y: number; n?: number; spread?: number;
  s?: number; color?: string; seed?: number;
}> = ({ f, x, y, n = 3, spread = 120, s = 1, color = KRP.ink, seed = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = ((f + i * 17 + rnd(seed, i) * 40) % 52) / 52;
      const nx = x + (rnd(seed, i + 9) - 0.5) * spread + Math.sin((f + i * 31) / 9) * 10;
      return (
        <text key={i} x={nx} y={y - p * 110} fontFamily={FONT} fontWeight={900}
          fontSize={(34 + rnd(seed, i + 4) * 18) * s} fill={color}
          opacity={(1 - p) * 0.85}>
          {i % 2 === 0 ? "♪" : "♫"}
        </text>
      );
    })}
  </g>
);

// 提灯 (吊るす #17 / 持つ #25)。x,y は上端の吊り点
const Chochin: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  body?: string; text?: string; glow?: boolean;
}> = ({ x, y, s = 1, f, phase = 0, body = "#E8E2D0", text, glow = true }) => {
  const sway = Math.sin((f + phase * 23) / 17) * 2.5;
  const flick = 0.75 + Math.sin((f + phase * 7) / 5) * 0.12;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`}>
      {glow && <ellipse cx={0} cy={96} rx={92} ry={110} fill={C.glowWarm} opacity={0.22 * flick} />}
      <rect x={-26} y={0} width={52} height={14} rx={4} fill={C.ink} />
      <path d="M -52 18 Q -62 96 -52 174 Q 0 196 52 174 Q 62 96 52 18 Q 0 -2 -52 18 Z"
        fill={body} stroke={C.ink} strokeWidth={5} />
      <g stroke={C.ink} strokeWidth={2.6} opacity={0.55} fill="none">
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M ${-54 + 2 * i} ${44 + i * 32} Q 0 ${58 + i * 32} ${54 - 2 * i} ${44 + i * 32}`} />
        ))}
      </g>
      {text && (
        <text x={0} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={SGP.shuin}>{text}</text>
      )}
      <rect x={-28} y={174} width={56} height={13} rx={4} fill={C.ink} />
    </g>
  );
};

// 座布団 (半畳)。#17 #18 で使う
const Zabuton: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> =
  ({ x, y, s = 1, rot = 0, color = C.zabuton }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-62} y={-40} width={124} height={80} rx={18}
        fill={color} stroke={C.ink} strokeWidth={5.5} />
      <line x1={-62} y1={-40} x2={-40} y2={-18} stroke={C.ink} strokeWidth={3.4} opacity={0.6} />
      <line x1={62} y1={-40} x2={40} y2={-18} stroke={C.ink} strokeWidth={3.4} opacity={0.6} />
      <circle cx={0} cy={0} r={7} fill="none" stroke={C.ink} strokeWidth={3.4} opacity={0.7} />
    </g>
  );

// 重箱 (開いたお弁当)。x,y は底の中心
const Jubako: React.FC<{ x: number; y: number; s?: number; open?: boolean }> =
  ({ x, y, s = 1, open = true }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 下の段2つ */}
      <rect x={-92} y={-58} width={184} height={30} rx={5} fill="#3A2A26" stroke={C.ink} strokeWidth={5} />
      <rect x={-92} y={-88} width={184} height={30} rx={5} fill="#5E2F2A" stroke={C.ink} strokeWidth={5} />
      {open ? (
        <g>
          {/* 開いた上段 (ごちそう) */}
          <rect x={-92} y={-120} width={184} height={34} rx={5} fill="#5E2F2A" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={-52} cy={-118} rx={26} ry={13} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={4} cy={-120} rx={24} ry={12} fill={KRP.orange} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={56} cy={-117} rx={22} ry={12} fill={KRP.green} stroke={C.ink} strokeWidth={4} />
          <circle cx={-24} cy={-112} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3.4} />
          <circle cx={32} cy={-111} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={3.4} />
          {/* 立てかけた蓋 */}
          <rect x={100} y={-124} width={120} height={88} rx={6} fill="#3A2A26"
            stroke={C.ink} strokeWidth={5} transform="rotate(14 160 -80)" />
        </g>
      ) : (
        <rect x={-92} y={-122} width={184} height={36} rx={6} fill="#3A2A26" stroke={C.ink} strokeWidth={5} />
      )}
    </g>
  );

// 徳利とお猪口
const Tokkuri: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -26 0 Q -34 -46 -12 -62 L -12 -84 Q 0 -92 12 -84 L 12 -62 Q 34 -46 26 0 Z"
        fill="#EDE6D6" stroke={C.ink} strokeWidth={5} />
      <path d="M -24 -30 Q 0 -22 24 -30" fill="none" stroke={KRP.blueDeep} strokeWidth={4} opacity={0.8} />
    </g>
  );

// ===================================================================
// 人物に衣装・小物を重ねるための入れ物
// ===================================================================
// Person は translate(x, y+bob) scale(s) rotate(lean) の順で描かれ、回転の軸は足元。
// 帽子や袖を別の <g> に置くと体が傾いた瞬間に外れるので、
// 人物とまったく同じ変換をかけたこの入れ物の中で「頭の丸 (cx=0 cy=-228 r=64)」基準に描く。
// f / phase / still / lean は人物とまったく同じ値を渡すこと。
const Kasane: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; children?: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// -------------------------------------------------------------------
// 歌舞伎の役者 (#17 #18)。画風は Person が土台。衣装は体より奥に描き、腕は前に出す
//   mie=true  … 両手を広げた見得。片足を踏み出す
//   mie=false … 正面を向いて扇をかざす
const KabukiYakusha: React.FC<{
  x: number; y: number; s?: number; lean?: number; f: number; phase?: number;
  mie?: boolean;
  face?: "normal" | "smile" | "surprised";
  gaze?: [number, number];
  cloth?: string; clothDark?: string; accent?: string;
}> = ({
  x, y, s = 1, lean = 0, f, phase = 0, mie = true, face = "normal",
  gaze = [0, 0], cloth = C.kimonoRed, clothDark = "#8A3448", accent = C.kinji,
}) => {
  // Person の banzai の腕ゆれとまったく同じ式 → 手の先が袖とずれない
  const armSway = Math.sin((f + phase * 17) / 9) * 3;
  const th = ((135 + armSway) * Math.PI) / 180;
  const hx = 82 * Math.sin(th);
  const hy = -148 + 82 * Math.cos(th);
  // 見得: 上げた手から垂れる布 (左ぶんを書いて scale(-1 1) で反転)
  const drapeUp = (
    <g>
      <path d="M -118 -212 Q -160 -148 -152 -62 Q -116 -40 -94 -78 Q -74 -136 -50 -158 Z"
        fill={cloth} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <g fill="none" stroke={accent} strokeWidth={6} opacity={0.8}>
        <path d="M -116 -192 Q -146 -138 -142 -72" />
        <path d="M -98 -174 Q -122 -128 -118 -74" />
        <path d="M -78 -158 Q -98 -122 -96 -80" />
      </g>
    </g>
  );
  // 正面: 肩から垂れる袖 (大きな格子)
  const sodeHang = (
    <g>
      <path d="M -50 -166 Q -140 -154 -150 -90 Q -152 -36 -116 -26 Q -74 -34 -54 -62 Z"
        fill={cloth} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <g fill="none" stroke={accent} strokeWidth={6} opacity={0.8}>
        <path d="M -144 -126 Q -100 -118 -58 -112" />
        <path d="M -148 -84 Q -104 -76 -60 -70" />
        <path d="M -146 -44 Q -106 -38 -66 -40" />
        <path d="M -118 -148 L -114 -30" />
        <path d="M -84 -156 L -82 -34" />
      </g>
    </g>
  );
  const katsura = (
    <g>
      {/* 鬢 (横の髪) */}
      <ellipse cx={-66} cy={-230} rx={11} ry={36} fill={C.ink} />
      <ellipse cx={66} cy={-230} rx={11} ry={36} fill={C.ink} />
      {/* 前髪と生え際 (はっきり) */}
      <path d="M -63 -234 Q -68 -298 0 -300 Q 68 -298 63 -234 Q 42 -250 24 -242
               Q 10 -230 0 -244 Q -10 -230 -24 -242 Q -42 -250 -63 -234 Z" fill={C.ink} />
      {/* 髷 (高く結った髻) と元結 */}
      <g transform="rotate(-8 0 -298)">
        <ellipse cx={0} cy={-300} rx={50} ry={16} fill={C.ink} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={-26} cy={-303} rx={11} ry={8} fill="#4C4C58" opacity={0.7} />
        <rect x={-10} y={-311} width={20} height={25} rx={5} fill={accent}
          stroke={C.ink} strokeWidth={4} />
      </g>
    </g>
  );
  const kumadori = (
    <g fill="none" stroke={SGP.shuin} strokeLinecap="round" opacity={0.9}>
      <path d="M -53 -252 Q -46 -220 -41 -192" strokeWidth={9} />
      <path d="M 53 -252 Q 46 -220 41 -192" strokeWidth={9} />
      <path d="M -32 -174 Q 0 -166 32 -174" strokeWidth={6} opacity={0.8} />
    </g>
  );
  return (
    <g>
      {/* 奥の層: 袖 (腕より奥) */}
      <Kasane x={x} y={y} s={s} lean={lean} f={f} phase={phase}>
        {mie ? (
          <g>
            {drapeUp}
            <g transform="scale(-1 1)">{drapeUp}</g>
          </g>
        ) : (
          <g>
            {sodeHang}
            <g transform="scale(-1 1)">{sodeHang}</g>
          </g>
        )}
      </Kasane>
      <Person x={x} y={y} s={s} lean={lean} f={f} phase={phase}
        cloth={cloth} clothDark={clothDark} hair="none" face={face} gaze={gaze}
        pose={mie ? "banzai" : "hold"} />
      {/* 手前の層: 裾・帯・襟・足袋・鬘・隈取・扇 */}
      <Kasane x={x} y={y} s={s} lean={lean} f={f} phase={phase}>
        {/* 裾 (脚を隠す) と縞 */}
        <path d="M -62 -84 Q -110 -56 -114 -10 L 114 -10 Q 110 -56 62 -84 Z"
          fill={clothDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <g fill="none" stroke={accent} strokeWidth={5} opacity={0.45}>
          <path d="M -54 -80 L -64 -16" />
          <path d="M -8 -82 L -8 -14" />
          <path d="M 44 -80 L 54 -16" />
        </g>
        {/* 足袋 */}
        <ellipse cx={-21} cy={-6} rx={25} ry={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <ellipse cx={23} cy={-6} rx={25} ry={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        {/* 片足を踏み出す (見得) */}
        {mie && (
          <g>
            <path d="M 72 -70 L 108 -58 L 116 -16 L 86 -20 Z"
              fill={clothDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <ellipse cx={116} cy={-8} rx={30} ry={13} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          </g>
        )}
        {/* 帯と結び目 */}
        <rect x={-62} y={-104} width={124} height={30} rx={4} fill={accent}
          stroke={C.ink} strokeWidth={6} />
        <g transform="rotate(14 46 -90)">
          <rect x={24} y={-112} width={46} height={44} rx={6} fill={accent}
            stroke={C.ink} strokeWidth={5} />
          <line x1={26} y1={-90} x2={68} y2={-90} stroke={C.ink} strokeWidth={4} opacity={0.55} />
        </g>
        {/* 襟 (白) */}
        <path d="M -48 -164 L -2 -98 L 46 -164 L 27 -164 L -2 -126 L -29 -164 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {/* 見得の手 (袖から出た指先) */}
        {mie && (
          <g>
            <circle cx={-67 - hx} cy={hy} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={67 + hx} cy={hy} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          </g>
        )}
        {/* 扇 (正面の役者。両手で胸の前にかざす) */}
        {!mie && (
          <g transform={`translate(0 -124) rotate(${Math.sin(f / 13) * 3})`}>
            <path d="M 0 0 L -74 -58 A 94 94 0 0 1 74 -58 Z"
              fill={accent} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <g stroke={C.ink} strokeWidth={3} opacity={0.6}>
              <line x1={0} y1={0} x2={-44} y2={-62} />
              <line x1={0} y1={0} x2={0} y2={-76} />
              <line x1={0} y1={0} x2={44} y2={-62} />
            </g>
            <circle cx={0} cy={0} r={22} fill={SGP.shuin} stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={0} r={7} fill={C.ink} />
          </g>
        )}
        {katsura}
        {kumadori}
      </Kasane>
    </g>
  );
};

// -------------------------------------------------------------------
// おしゃべりの小さな波線 (文字は書かない)。#19 の客席で使う
const Namisen: React.FC<{
  f: number; x: number; y: number; s?: number; seed?: number; color?: string;
}> = ({ f, x, y, s = 1, seed = 1, color = KRP.white }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color}
    strokeWidth={6} strokeLinecap="round">
    {Array.from({ length: 3 }, (_, i) => {
      const p = ((f * 0.9 + i * 15 + rnd(seed, i) * 30) % 42) / 42;
      const w = 20 + i * 8;
      return (
        <path key={i} d={`M ${-w} ${-p * 52} q ${w * 0.5} -11 ${w} 0 q ${w * 0.5} 11 ${w} 0`}
          opacity={0.3 + (1 - p) * 0.65} />
      );
    })}
  </g>
);

// -------------------------------------------------------------------
// 18世紀オペラの歌手 (#19)。裾の広がったドレス・白い鬘・丸く開いた口
// 足元の蝋燭のフットライトに下から照らされている
const OperaKashu: React.FC<{
  x: number; y: number; s?: number; lean?: number; f: number; phase?: number;
  cloth?: string; clothDark?: string; accent?: string;
}> = ({
  x, y, s = 1, lean = 0, f, phase = 0,
  cloth = "#CBD8E6", clothDark = "#9FB2C8", accent = C.operaGold,
}) => {
  const wig = "#EDE9DC";
  const breath = 1 + Math.sin(f / 7) * 0.1; // 熱唱 (口のふるえ)
  return (
    <g>
      {/* 奥: ドレスの外側のひろがり (腕より奥) */}
      <Kasane x={x} y={y} s={s} lean={lean} f={f} phase={phase}>
        <path d="M -56 -104 C -132 -92 -168 -44 -174 0 L 174 0 C 168 -44 132 -92 56 -104 Z"
          fill={clothDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      </Kasane>
      <Person x={x} y={y} s={s} lean={lean} f={f} phase={phase}
        cloth={cloth} clothDark={clothDark} hair="none" face="normal"
        pose="raise" gaze={[0, -3]} />
      <Kasane x={x} y={y} s={s} lean={lean} f={f} phase={phase}>
        {/* ドレスの前身 (脚と下げた腕の先を隠す) */}
        <path d="M -52 -108 C -114 -96 -144 -48 -150 -2 L 150 -2 C 144 -48 114 -96 52 -108 Z"
          fill={cloth} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <g fill="none" stroke={clothDark} strokeWidth={5} opacity={0.8}>
          <path d="M -44 -102 C -84 -86 -108 -46 -114 -8" />
          <path d="M -14 -106 C -26 -72 -34 -40 -36 -8" />
          <path d="M 16 -106 C 28 -72 36 -40 38 -8" />
          <path d="M 46 -102 C 86 -86 110 -46 116 -8" />
        </g>
        <path d="M -148 -24 C -120 -36 -60 -44 0 -44 C 60 -44 120 -36 148 -24"
          fill="none" stroke={accent} strokeWidth={9} opacity={0.9} />
        {/* 胴着とストマッカー */}
        <path d="M -54 -162 Q -60 -126 -52 -104 L 52 -104 Q 60 -126 54 -162 Z"
          fill={cloth} stroke={C.ink} strokeWidth={6} />
        <path d="M -28 -158 L 28 -158 L 15 -106 L -15 -106 Z"
          fill={accent} stroke={C.ink} strokeWidth={4.5} />
        {[-146, -130, -114].map((by) => (
          <path key={by} d={`M -13 ${by} L 13 ${by}`} stroke={C.ink} strokeWidth={4} opacity={0.55} />
        ))}
        {/* 襟のフリル */}
        <path d="M -46 -164 Q -24 -146 0 -150 Q 24 -146 46 -164 Q 24 -174 0 -168 Q -24 -174 -46 -164 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {/* 胸に当てた手 (前腕 → 手 → レースの袖口) */}
        <line x1={-67} y1={-106} x2={-26} y2={-132} stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
        <line x1={-67} y1={-106} x2={-26} y2={-132} stroke={cloth} strokeWidth={21} strokeLinecap="round" />
        <path d="M -62 -92 Q -46 -118 -50 -128 Q -72 -124 -78 -98 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={-22} cy={-134} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        {/* 肘のレースの袖口 (ここから先は鬘の手前に描く) */}
        <path d="M 44 -206 Q 68 -194 92 -206 Q 68 -222 44 -206 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {/* 下からの蝋燭の照り返し (顎と頬) */}
        <path d="M -57 -200 Q -52 -164 0 -164 Q 52 -164 57 -200 Z"
          fill={C.glowWarm} opacity={0.34} />
        {/* 丸く開いた口 (熱唱) */}
        <ellipse cx={0} cy={-181} rx={12} ry={15 * breath} fill="#3A2026"
          stroke={C.ink} strokeWidth={4} />
        <ellipse cx={0} cy={-174} rx={7} ry={4.5} fill="#C0706A" />
        {/* 白い鬘 (巻き毛を横に2段) */}
        <path d="M -62 -236 Q -68 -300 0 -302 Q 68 -300 62 -236 Q 38 -254 0 -250 Q -38 -254 -62 -236 Z"
          fill={wig} stroke={C.ink} strokeWidth={5} />
        {[[-66, -248, 21], [66, -248, 21], [-72, -212, 23], [72, -212, 23]].map(([cx2, cy2, r2], i) => (
          <circle key={i} cx={cx2} cy={cy2} r={r2} fill={wig} stroke={C.ink} strokeWidth={4.5} />
        ))}
        <path d="M -30 -292 Q 0 -300 30 -292" fill="none" stroke={C.ink} strokeWidth={3.4} opacity={0.4} />
        {/* 高く差し出した前腕 (鬘の横から斜め上へ) */}
        <line x1={68} y1={-212} x2={116} y2={-292} stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
        <line x1={68} y1={-212} x2={116} y2={-292} stroke={cloth} strokeWidth={21} strokeLinecap="round" />
        <path d="M 95 -280 Q 116 -270 129 -287 Q 112 -302 95 -280 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={125} cy={-306} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
      </Kasane>
    </g>
  );
};

// -------------------------------------------------------------------
// 蝋燭のフットライト1列 (#19)。x の並びの上に炎とにじむ光
const Footlights: React.FC<{ f: number; xs: number[]; y: number; s?: number }> =
  ({ f, xs, y, s = 1 }) => (
    <g>
      {xs.map((cxx, i) => (
        <g key={i} transform={`translate(${cxx} ${y}) scale(${s})`}>
          <ellipse cx={0} cy={-14} rx={26} ry={30} fill={C.glowWarm} opacity={0.24} />
          <rect x={-6} y={0} width={12} height={30} fill="#EDE6D6" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-12} rx={6.5 + Math.sin((f + i * 9) / 5) * 1.8}
            ry={13 + Math.sin((f + i * 7) / 4) * 3} fill={C.candle} stroke={C.ink} strokeWidth={2.8} />
        </g>
      ))}
    </g>
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #13 ところで、いまは動画の時代です。
// 格: 並 / seed 1012
// 絵: 現代の机。スマホ・タブレット・PCに別々の動画。光が重なる
// どこ: 夜の自室の机。画面の光だけが灯り
// 演出: PC・タブレット・スマホが別々の動画を流し、3色の光が机の上で重なる
// 動き: 再生バーが進む・光が呼吸する・マグの湯気・カメラがゆっくり寄る
const Sg013: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.05;
  // 画面1枚 (中身ちがい)。x,y は左上
  const Screen: React.FC<{
    x: number; y: number; w: number; h: number; hue: string; kind: 0 | 1 | 2; pSpeed: number;
  }> = ({ x, y, w, h, hue, kind, pSpeed }) => {
    const prog = (f * pSpeed) % 1;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={10} fill={C.screenBase} stroke={C.ink} strokeWidth={7} />
        {kind === 0 && (
          <g> {/* 山の動画 */}
            <circle cx={x + w * 0.72} cy={y + h * 0.3} r={h * 0.13} fill={KRP.orange} />
            <path d={`M ${x + 8} ${y + h * 0.78} L ${x + w * 0.3} ${y + h * 0.42} L ${x + w * 0.52} ${y + h * 0.66}
              L ${x + w * 0.72} ${y + h * 0.5} L ${x + w - 8} ${y + h * 0.78} Z`}
              fill={KRP.blueDeep} opacity={0.9} />
          </g>
        )}
        {kind === 1 && (
          <g> {/* おしゃべり動画 */}
            <PersonMini x={x + w * 0.32} y={y + h * 0.84} s={h / 420} color={KRP.orange} f={f} phase={2} face="smile" />
            <PersonMini x={x + w * 0.66} y={y + h * 0.84} s={h / 420} color={KRP.green} f={f} phase={5} face="smile" arms="up" />
          </g>
        )}
        {kind === 2 && (
          <g> {/* 料理動画 */}
            <ellipse cx={x + w * 0.5} cy={y + h * 0.62} rx={w * 0.3} ry={h * 0.16}
              fill={KRP.yellow} stroke={KRP.white} strokeWidth={3} opacity={0.95} />
            <path d={`M ${x + w * 0.42} ${y + h * 0.4} q ${Math.sin(f / 9) * 8} -18 2 -34`}
              fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
          </g>
        )}
        {/* 再生バー */}
        <rect x={x + 14} y={y + h - 26} width={w - 28} height={9} rx={4.5} fill={KRP.grayDark} />
        <rect x={x + 14} y={y + h - 26} width={(w - 28) * prog} height={9} rx={4.5} fill={hue} />
        <circle cx={x + 14 + (w - 28) * prog} cy={y + h - 21.5} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        <polygon points={`${x + 22},${y + h - 62} ${x + 22},${y + h - 40} ${x + 42},${y + h - 51}`} fill={KRP.white} opacity={0.9} />
      </g>
    );
  };
  const breathe = (ph: number) => 0.16 + Math.sin((f + ph) / 13) * 0.05;
  return (
    <Frame f={f} seed={1012} dark bg={C.night}>
    <g transform={zoomAt(z, 960, 560)}>
      {/* 夜の壁と窓 */}
      <rect x={-20} y={-20} width={W + 40} height={700} fill={C.night} />
      <rect x={120} y={80} width={360} height={420} rx={8} fill="#171E2A" stroke={C.ink} strokeWidth={8} />
      <line x1={300} y1={80} x2={300} y2={500} stroke={C.ink} strokeWidth={6} />
      <circle cx={396} cy={170} r={42} fill="#E9E4CE" opacity={0.9} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={140 + rnd(3, i) * 320} cy={240 + rnd(3, i + 20) * 240}
          r={2 + rnd(3, i + 40) * 2} fill="#F6EFC9"
          opacity={0.3 + Math.sin((f + i * 9) / 11) * 0.25} />
      ))}
      {/* 棚 */}
      <rect x={1620} y={60} width={300} height={560} fill="#1D2431" stroke={C.ink} strokeWidth={7} />
      {[180, 340, 500].map((sy) => (
        <g key={sy}>
          <line x1={1620} y1={sy} x2={1920} y2={sy} stroke={C.ink} strokeWidth={6} />
          <rect x={1650 + (sy % 70)} y={sy - 86} width={26} height={86} fill={KRP.grayDark} opacity={0.75} />
          <rect x={1700 + (sy % 50)} y={sy - 72} width={22} height={72} fill={KRP.blueDeep} opacity={0.7} />
          <rect x={1760} y={sy - 80} width={24} height={80} fill={KRP.bronze} opacity={0.7} />
        </g>
      ))}
      {/* 机 */}
      <rect x={-20} y={660} width={W + 40} height={440} fill={C.deskWood} />
      <rect x={-20} y={660} width={W + 40} height={26} fill={C.deskWoodDark} />
      <line x1={-20} y1={660} x2={W + 20} y2={660} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.22}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={lerp(100, -300, i / 7)} y1={1100} x2={lerp(760, 1120, i / 7)} y2={686} />
        ))}
      </g>
      {/* 画面の光 (机に重なって落ちる3色) */}
      <polygon points="330,700 900,700 1050,1080 120,1080" fill={KRP.blueSoft} opacity={breathe(0)} />
      <polygon points="1130,700 1560,700 1760,1080 980,1080" fill={KRP.orange} opacity={breathe(9)} />
      <polygon points="800,760 1120,760 1240,1080 700,1080" fill={KRP.green} opacity={breathe(17)} />
      {/* ノートPC */}
      <g>
        <Screen x={330} y={300} w={580} h={370} hue={KRP.blue} kind={0} pSpeed={0.004} />
        <polygon points="300,670 940,670 1000,742 240,742" fill="#B9C2CC" stroke={C.ink} strokeWidth={7} />
        <g stroke={C.ink} strokeWidth={2.4} opacity={0.5}>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1={330 - i * 8} y1={688 + i * 14} x2={950 + i * 8} y2={688 + i * 14} />
          ))}
        </g>
      </g>
      {/* タブレット (スタンド立て) */}
      <g>
        <polygon points="1240,700 1450,700 1490,760 1200,760" fill={C.deskWoodDark} stroke={C.ink} strokeWidth={6} />
        <Screen x={1130} y={330} w={430} h={330} hue={KRP.orange} kind={1} pSpeed={0.0055} />
      </g>
      {/* スマホ (手前・立てかけ) */}
      <g transform="rotate(-6 980 880)">
        <Screen x={850} y={760} w={260} h={190} hue={KRP.green} kind={2} pSpeed={0.008} />
      </g>
      {/* マグと湯気・イヤホン */}
      <rect x={560} y={820} width={110} height={120} rx={12} fill={KRP.red} stroke={C.ink} strokeWidth={7} />
      <path d="M 670 850 q 46 22 0 56" fill="none" stroke={C.ink} strokeWidth={7} />
      <path d={`M 600 804 q ${Math.sin(f / 10) * 16} -30 4 -58`} fill="none"
        stroke={KRP.white} strokeWidth={5} opacity={0.5} />
      <path d={`M 636 806 q ${Math.sin(f / 10 + 2) * 14} -26 2 -48`} fill="none"
        stroke={KRP.white} strokeWidth={4} opacity={0.4} />
      <g fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.8}>
        <path d="M 1560 880 q 60 -40 130 0 q 60 44 -16 60 q -80 14 -60 -38" />
      </g>
      <circle cx={1562} cy={884} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #14 倍速で観たことのある人は、2024年の調査で47パーセント。
// 格: 図 / seed 1013
// 絵: スマホ画面の中に47%の円グラフが描かれる (画面UIが床)。※出典はクロス・マーケティング2024
// どこ: 机を真上から見たフラットレイ。スマホが主役
// 演出: スマホ画面の中で 47% の円グラフが描き上がる。まわりにコーヒー・イヤホン・ノート
// 動き: 弧が 0→47% に伸びる・先端の火花・湯気・数字のせり上がり
const Sg014: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 8, 34));
  const pct = Math.round(47 * t);
  const ang = (47 * t) / 100 * Math.PI * 2;
  const R = 215;
  const cx = 960, cy = 470;
  const tipX = cx + Math.sin(ang) * R;
  const tipY = cy - Math.cos(ang) * R;
  const arcPath =
    `M ${cx} ${cy} L ${cx} ${cy - R} A ${R} ${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${tipX} ${tipY} Z`;
  return (
    <Frame f={f} seed={1013}>
    <g>
      {/* 木の机 (真上から) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.deskWood} />
      <g stroke={C.ink} strokeWidth={3.4} opacity={0.2}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-20} y1={i * 128 - 10} x2={W + 20} y2={i * 128 + 14} />
        ))}
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={rnd(7, i) * W} cy={rnd(7, i + 10) * H}
          rx={16 + rnd(7, i + 20) * 10} ry={8} fill={C.deskWoodDark} opacity={0.4} />
      ))}
      {/* コーヒー (真上) と湯気 */}
      <g transform="translate(300 300)">
        <circle r={128} fill={KRP.white} stroke={C.ink} strokeWidth={8} />
        <circle r={96} fill="#6B4A32" stroke={C.ink} strokeWidth={5} />
        <ellipse cx={-26} cy={-22} rx={34} ry={16} fill={KRP.white} opacity={0.25} />
        <path d="M 128 -16 q 66 -18 60 36 q -8 44 -66 12" fill="none" stroke={C.ink} strokeWidth={8} />
        <path d={`M -10 -96 q ${Math.sin(f / 9) * 18} -36 6 -70`} fill="none"
          stroke={KRP.white} strokeWidth={6} opacity={0.6} />
        <path d={`M 34 -100 q ${Math.sin(f / 9 + 2) * 15} -30 4 -58`} fill="none"
          stroke={KRP.white} strokeWidth={5} opacity={0.45} />
      </g>
      {/* イヤホン (右) */}
      <g fill="none" stroke={KRP.white} strokeWidth={7}>
        <path d="M 1570 260 q 150 -70 220 60 q 60 130 -90 150 q -140 18 -96 -110 q 36 -96 130 -40" />
      </g>
      <circle cx={1572} cy={264} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <circle cx={1736} cy={320} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      {/* ノートと鉛筆 (左下) */}
      <g transform="rotate(-8 300 900)">
        <rect x={120} y={780} width={380} height={260} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
        <line x1={310} y1={780} x2={310} y2={1040} stroke={C.ink} strokeWidth={4} opacity={0.5} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} stroke={KRP.grayDark} strokeWidth={3.4} opacity={0.6}>
            <line x1={140} y1={820 + i * 42} x2={290} y2={820 + i * 42} />
            <line x1={330} y1={820 + i * 42} x2={480} y2={820 + i * 42} />
          </g>
        ))}
      </g>
      <g transform={`rotate(24 600 980) translate(0 ${Math.sin(f / 15) * 3})`}>
        <rect x={520} y={966} width={190} height={26} rx={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} />
        <polygon points="710,966 744,979 710,992" fill={C.flesh} stroke={C.ink} strokeWidth={5} />
        <polygon points="733,975 744,979 733,983" fill={C.ink} />
      </g>
      {/* スマホ本体 */}
      <rect x={660} y={120} width={600} height={790} rx={48} fill={C.ink} />
      <rect x={678} y={138} width={564} height={754} rx={34} fill={C.screenBase} stroke={C.ink} strokeWidth={6} />
      <rect x={880} y={152} width={160} height={14} rx={7} fill={C.ink} />
      {/* 円グラフ */}
      <circle cx={cx} cy={cy} r={R} fill="#39434F" stroke={KRP.grayDark} strokeWidth={5} />
      {t > 0.01 && <path d={arcPath} fill={KRP.orange} stroke={C.ink} strokeWidth={5} />}
      <circle cx={cx} cy={cy} r={118} fill={C.screenBase} stroke={KRP.grayDark} strokeWidth={4} />
      <text x={cx} y={cy + 26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={88} fill={KRP.white}>{pct}%</text>
      {/* 弧の先端の火花 */}
      {t > 0.05 && t < 0.999 && (
        <g>
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx={tipX + (rnd(9, i + f) - 0.5) * 36}
              cy={tipY + (rnd(9, i + f + 9) - 0.5) * 36}
              r={3 + rnd(9, i) * 4} fill={KRP.yellow} opacity={0.85} />
          ))}
        </g>
      )}
      {/* 画面下の帯: 倍速UI (▶▶ と 2x は固定セット) */}
      <rect x={700} y={742} width={520} height={54} rx={12} fill="#39434F" stroke={KRP.grayDark} strokeWidth={4} />
      <polygon points="730,754 730,784 756,769" fill={KRP.white} />
      <polygon points="758,754 758,784 784,769" fill={KRP.white} />
      <text x={880} y={782} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>倍速視聴</text>
      <text x={1220} y={836} textAnchor="end" fontFamily={FONT} fontWeight={700}
        fontSize={24} fill={KRP.gray}>出典: クロス・マーケティング</text>
      <TagPlate x={960} y={62} text="2024年の調査" size={44} t={seg(f, 2, 12)} />
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #15 10秒飛ばし、スキップ、切り抜き。「最近の人は作品を最後まで観ない」と、よく嘆かれます。
// 格: 並 / seed 1014
// 絵: 10秒送りを連打する親指。横で腕組みのご意見番がやれやれと首を振る
// どこ: 居間。左に巨大なスマホ画面 (手持ち)、右にご意見番
// 演出: 親指が10秒送りを連打、波紋が弾ける。ご意見番は腕組みで首を振る
// 動き: 親指の連打 (f%16)・波紋の拡大・首振り・ため息の「…」
const Sg015: React.FC<{ f: number }> = ({ f }) => {
  const tapCycle = (f % 16) / 16;                 // 0→1 で1連打
  const press = tapCycle < 0.25 ? tapCycle / 0.25 : Math.max(0, 1 - (tapCycle - 0.25) / 0.3);
  const rippleT = clamp01((tapCycle - 0.2) / 0.8); // 押した直後に波紋
  const shake = Math.sin(f / 10) * 4;
  return (
    <Frame f={f} seed={1014}>
    <g>
      {/* 居間の壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill="#EFE6D2" />
      <rect x={-20} y={740} width={W + 40} height={360} fill={KRP.floor} />
      <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.25}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={lerp(200, -300, i / 6)} y1={1100} x2={lerp(900, 1300, i / 6)} y2={752} />
        ))}
      </g>
      {/* 壁の額と電気スタンド */}
      <rect x={1180} y={150} width={200} height={150} rx={8} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={7} />
      <path d="M 1200 270 L 1270 190 L 1330 250 L 1360 220" fill="none" stroke={KRP.blueDeep} strokeWidth={6} />
      <g>
        <rect x={1816} y={420} width={18} height={330} fill={C.ink} />
        <polygon points="1760,430 1890,430 1862,330 1788,330" fill={KRP.yellow} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={1825} cy={760} rx={70} ry={16} fill={C.ink} opacity={0.8} />
      </g>
      {/* 丸ラグ */}
      <ellipse cx={1480} cy={1000} rx={420} ry={110} fill="#D9BFA0" stroke={C.ink} strokeWidth={6} />
      <ellipse cx={1480} cy={1000} rx={320} ry={76} fill="none" stroke={KRP.bronze} strokeWidth={5} opacity={0.55} />
      {/* 巨大スマホ (左。下から手が支える) */}
      <g transform="rotate(-5 540 560)">
        <rect x={150} y={110} width={780} height={930} rx={54} fill={C.ink} />
        <rect x={176} y={136} width={728} height={878} rx={38} fill={C.screenBase} stroke={C.ink} strokeWidth={6} />
        {/* 動画の中身 (一時停止中の風景) */}
        <path d="M 200 700 L 390 480 L 520 600 L 700 440 L 880 640 L 880 860 L 200 860 Z"
          fill={KRP.blueDeep} opacity={0.55} />
        <circle cx={760} cy={300} r={54} fill={KRP.orange} opacity={0.8} />
        {/* UIチップ: スキップ/切り抜き */}
        <g>
          <rect x={220} y={180} width={190} height={58} rx={29} fill="#39434F" stroke={KRP.grayDark} strokeWidth={4} />
          <text x={315} y={220} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.white}>スキップ</text>
          <rect x={430} y={180} width={200} height={58} rx={29} fill="#39434F" stroke={KRP.grayDark} strokeWidth={4} />
          <text x={530} y={220} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.white}>切り抜き</text>
        </g>
        {/* 10秒送りボタン */}
        <g transform={`translate(640 560) scale(${1 + press * 0.12})`}>
          <circle r={95} fill="#39434F" stroke={KRP.white} strokeWidth={5} />
          <path d="M -8 -58 A 58 58 0 1 1 -58 -8" fill="none" stroke={KRP.white} strokeWidth={9} />
          <polygon points="-8,-74 -8,-40 24,-57" fill={KRP.white} />
          <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.white}>10</text>
        </g>
        {/* 波紋 */}
        {rippleT > 0 && rippleT < 1 && (
          <g fill="none" stroke={KRP.yellow} strokeWidth={7 * (1 - rippleT)} opacity={1 - rippleT}>
            <circle cx={640} cy={560} r={100 + rippleT * 130} />
            <circle cx={640} cy={560} r={100 + rippleT * 190} opacity={0.5} />
          </g>
        )}
        {/* 再生バー */}
        <rect x={220} y={930} width={640} height={12} rx={6} fill={KRP.grayDark} />
        <rect x={220} y={930} width={640 * (0.3 + ((f * 0.006) % 0.5))} height={12} rx={6} fill={KRP.red} />
      </g>
      {/* 連打する親指 (右下からぬっと) */}
      <g transform={`translate(${-36 + press * -26} ${60 + press * -40}) rotate(${-26 + press * -7} 980 1080)`}>
        <path d="M 1240 1120 Q 1130 1000 1010 820 Q 970 740 1010 700 Q 1060 668 1104 716
                 Q 1210 840 1320 1040 L 1380 1140 Z"
          fill={C.flesh} stroke={C.ink} strokeWidth={8} />
        <path d="M 1018 736 Q 1048 716 1080 740" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      </g>
      {/* 連打の勢い線 */}
      <g stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" opacity={0.4 + press * 0.5}>
        <line x1={880} y1={660} x2={840} y2={620} />
        <line x1={920} y1={700} x2={872} y2={668} />
        <line x1={820} y1={640} x2={790} y2={596} />
      </g>
      {/* ご意見番: 腕組み・やれやれ */}
      <ellipse cx={1500} cy={1006} rx={110} ry={24} fill={C.ink} opacity={0.16} />
      <Person x={1500} y={996} s={1.55} cloth="#5A5248" clothDark="#403A32"
        pose="armsFolded" face="angry" glasses hair="none" gaze={[-6, 0]}
        lean={shake} f={f} phase={3} />
      {/* ため息の「…」吹き出し */}
      <g opacity={0.65 + Math.sin(f / 8) * 0.2}>
        <path d="M 1640 430 q 110 -36 190 30 q 36 60 -40 86 q -120 30 -168 -30 q -22 -50 18 -86 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <circle cx={1690} cy={560} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <circle cx={1668} cy={606} r={6} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={1684 + i * 44} cy={486} r={9} fill={C.ink}
            opacity={0.3 + ((Math.floor(f / 7) + i) % 3 === 0 ? 0.6 : 0)} />
        ))}
      </g>
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #16 ですが、歴史を見ると、話は逆かもしれません。
// 格: 図 / seed 1015
// 絵: 「最近の人が変」の矢印札がぐるんと半回転して「昔はもっと自由」。回転の軌跡線
// どこ: 丘の上の道しるべ。空と草原
// 演出: 「最近の人が変」の矢印札がぐるんと半回転して「昔はもっと自由」に
// 動き: 札の180度回転・回転の軌跡線・雲の流れ・草のゆれ・決まった瞬間の星
const Sg016: React.FC<{ f: number }> = ({ f }) => {
  const rot = 180 * easeOut(seg(f, 10, 32));
  const done = seg(f, 32, 40);
  const px = 960, py = 430; // 回転の中心 (柱の上端)
  // 矢印札 (ローカル座標: 中心0,0 / 右向きの矢印)
  const Plate: React.FC<{ label: string; color: string; flip?: boolean }> = ({ label, color, flip }) => (
    <g transform={flip ? "rotate(180)" : undefined}>
      <polygon points="-360,-62 258,-62 356,0 258,62 -360,62"
        fill={color} stroke={C.ink} strokeWidth={8} />
      <text x={-40} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={56} fill={KRP.white}>{label}</text>
    </g>
  );
  return (
    <Frame f={f} seed={1015}>
    <g>
      {/* 空と雲 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill={KRP.paperCool} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${((f * (0.5 + i * 0.3) + i * 620) % (W + 500)) - 250} ${110 + i * 120})`}
          opacity={0.85}>
          <path d="M -110 20 q 10 -40 54 -34 q 14 -38 66 -30 q 34 -22 58 10 q 44 -8 46 28 q 24 6 18 26 l -242 0 z"
            fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 丘と道 */}
      <path d={`M -20 820 Q 480 680 960 720 Q 1440 760 1940 700 L 1940 1100 L -20 1100 Z`}
        fill="#BFCB8E" stroke={C.ink} strokeWidth={6} />
      <path d="M 700 1100 Q 880 900 960 760 Q 1040 900 1260 1100 Z"
        fill={C.roadSand} stroke={C.ink} strokeWidth={5} opacity={0.95} />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={830 + rnd(11, i) * 280} cy={860 + rnd(11, i + 9) * 200}
          rx={10 + rnd(11, i + 4) * 10} ry={6} fill={KRP.grayDark} opacity={0.5} />
      ))}
      {/* 草むら (ゆれる) */}
      {Array.from({ length: 12 }, (_, i) => {
        const gx = 60 + rnd(13, i) * 1800;
        const gy = 790 + rnd(13, i + 7) * 240;
        if (gx > 700 && gx < 1260 && gy > 820) return null;
        const sw = Math.sin((f + i * 11) / 12) * 7;
        return (
          <g key={i} stroke={C.matsu} strokeWidth={6} strokeLinecap="round" fill="none">
            <path d={`M ${gx} ${gy} q ${-8 + sw} -26 ${-4 + sw} -46`} />
            <path d={`M ${gx + 14} ${gy} q ${2 + sw} -30 ${8 + sw} -50`} />
            <path d={`M ${gx + 28} ${gy} q ${10 + sw} -24 ${18 + sw} -40`} />
          </g>
        );
      })}
      {/* 柱 */}
      <rect x={px - 17} y={py} width={34} height={430} fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
      <ellipse cx={px} cy={860} rx={80} ry={18} fill={C.ink} opacity={0.15} />
      <circle cx={px} cy={py} r={26} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
      {/* 回転の軌跡 */}
      {rot > 4 && rot < 176 && (
        <g fill="none" stroke={KRP.orange} strokeWidth={8} opacity={0.75} strokeLinecap="round"
          strokeDasharray="26 20">
          <path d={`M ${px + 380} ${py} A 380 380 0 0 0 ${px + 380 * Math.cos((rot * Math.PI) / 180)} ${py - 380 * Math.sin((rot * Math.PI) / 180)}`} />
        </g>
      )}
      {/* 札 (半回転の前後で中身が入れ替わる) */}
      <g transform={`rotate(${-rot} ${px} ${py}) translate(${px} ${py})`}>
        {rot < 90
          ? <Plate label="最近の人が変" color={KRP.grayDark} />
          : <Plate label="昔はもっと自由" color={KRP.orange} flip />}
      </g>
      {/* 決まった瞬間のキラ星 */}
      {done > 0 && (
        <g opacity={Math.min(1, done * 1.4) * (1 - done * 0.4)}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const r = 300 + done * 90;
            return (
              <g key={i} transform={`translate(${px + Math.cos(a) * r * 1.3} ${py - 40 + Math.sin(a) * r * 0.55}) scale(${0.8 + done})`}>
                <path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>
      )}
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #17 江戸の芝居見物のお客さんは、上演の真っ最中に弁当を広げ、酒を飲みました。
// 格: 山 / seed 1016
// 絵: 江戸の桟敷。重箱が開き、徳利が回り、笑い声。舞台では役者が見得を切っているのに視線はごちそうへ
// どこ: 江戸の芝居小屋。左2/3が松羽目の舞台、下に桝席、右に桟敷
// 演出: #17 宴 (重箱・徳利・笑い声) / #18 同じ小屋で半畳が舞台へ飛ぶ
// 動き: 徳利が傾く・音符・ろうそくの炎・提灯のゆれ / 半畳の回転飛行と役者のかわし
// ★#17 と #18 は同じ小屋。絵を複製せず phase で切り替える (憲法第14条)
const SajikiWorld: React.FC<{ f: number; phase: "feast" | "zabuton" }> = ({ f, phase }) => {
  const feast = phase === "feast";
  // 半畳の飛行 (zabuton phase): 桟敷→舞台への放物線
  const zt = easeOut(seg(f, 8, 30));
  const zx = (1 - zt) * (1 - zt) * 1430 + 2 * (1 - zt) * zt * 1020 + zt * zt * 730;
  const zy = (1 - zt) * (1 - zt) * 800 + 2 * (1 - zt) * zt * 330 + zt * zt * 505;
  return (
    <g>
      {/* 小屋の壁 (背景) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E3D3AE" />
      {/* 松羽目の舞台 (金地に松) */}
      <rect x={-20} y={70} width={1270} height={500} fill={C.kinji} stroke={C.ink} strokeWidth={8} />
      <g stroke={C.ink} strokeWidth={2.4} opacity={0.14}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={190 + i * 190} y1={70} x2={190 + i * 190} y2={570} />
        ))}
      </g>
      <g> {/* 松 */}
        <path d="M 300 570 Q 270 430 330 350 Q 290 300 340 240" fill="none"
          stroke="#6E4A28" strokeWidth={26} strokeLinecap="round" />
        <path d="M 330 360 Q 420 360 470 320" fill="none" stroke="#6E4A28" strokeWidth={16} strokeLinecap="round" />
        <ellipse cx={340} cy={210} rx={150} ry={62} fill={C.matsu} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={520} cy={300} rx={120} ry={50} fill={C.matsu} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={180} cy={320} rx={100} ry={44} fill={C.matsu} stroke={C.ink} strokeWidth={6} />
        <g fill="none" stroke="#3C6236" strokeWidth={3} opacity={0.7}>
          <path d="M 260 200 q 80 -20 160 0" />
          <path d="M 450 292 q 70 -18 140 4" />
        </g>
      </g>
      {/* 舞台の床と前板 */}
      <rect x={-20} y={560} width={1270} height={56} fill={SGP.stage} stroke={C.ink} strokeWidth={7} />
      <rect x={-20} y={616} width={1270} height={74} fill={C.sajikiWood} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={i * 220 - 10} y1={560} x2={i * 220 + 40} y2={616} />
        ))}
      </g>
      {/* 舞台の上だけ明るくする (役者が主役に見えるように) */}
      <rect x={-20} y={64} width={1270} height={630} fill={C.glowWarm}
        opacity={0.13 + Math.sin(f / 15) * 0.02} />
      {/* 役者2人 (歌舞伎の扮装)。見得と、正面で扇をかざす者で姿勢を変える */}
      <ellipse cx={feast ? 350 : 320} cy={556} rx={104} ry={18} fill={C.ink} opacity={0.17} />
      <KabukiYakusha x={feast ? 350 : 320} y={548} s={1.3} mie
        face={feast ? "normal" : "surprised"} gaze={feast ? [4, 1] : [8, -4]}
        lean={feast ? 5 : -18} f={f} phase={1} />
      {feast && (
        <g>
          <ellipse cx={750} cy={558} rx={88} ry={16} fill={C.ink} opacity={0.15} />
          <KabukiYakusha x={750} y={552} s={1.08} mie={false} face="smile" gaze={[0, 1]}
            lean={-2} f={f} phase={6}
            cloth={C.kimonoBlue} clothDark="#38506B" accent="#E2E0D4" />
        </g>
      )}
      {/* 見得の決め線 (feast) */}
      {feast && (
        <g stroke={KRP.orange} strokeWidth={6} strokeLinecap="round"
          opacity={0.5 + Math.sin(f / 7) * 0.25}>
          <line x1={220} y1={268} x2={176} y2={226} />
          <line x1={500} y1={286} x2={548} y2={248} />
          <line x1={266} y1={206} x2={244} y2={154} />
        </g>
      )}
      {/* 舞台前のろうそく (footlights)。役者より手前に立つ */}
      {[140, 420, 700, 980].map((cxx, i) => (
        <g key={i}>
          <rect x={cxx - 7} y={520} width={14} height={42} fill="#EDE6D6" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={cxx} cy={508} rx={8 + Math.sin((f + i * 9) / 5) * 2.4}
            ry={15 + Math.sin((f + i * 7) / 4) * 3.5} fill={C.candle} stroke={C.ink} strokeWidth={3} />
          <ellipse cx={cxx} cy={508} rx={26} ry={30} fill={C.glowWarm} opacity={0.22} />
        </g>
      ))}
      {/* 提灯の列 */}
      {[180, 560, 940, 1620].map((cxx, i) => (
        <Chochin key={i} x={cxx} y={-14} s={0.8} f={f} phase={i}
          body={i % 2 === 0 ? "#E8E2D0" : "#D86A4A"} />
      ))}
      {/* 桝席 (土間) の客 */}
      <rect x={-20} y={690} width={1270} height={410} fill="#CBB176" />
      {Array.from({ length: 10 }, (_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const mx = 120 + col * 240 + rnd(21, i) * 40;
        const my = 850 + row * 180;
        return (
          <PersonMini key={i} x={mx} y={my} s={0.62 + row * 0.1}
            color={[KRP.blue, KRP.orange, C.kimonoGreen, "#C98A9A", KRP.bronze][i % 5]}
            f={f} phase={i * 3} face={i % 3 === 0 ? "smile" : "dot"}
            arms={feast ? (i % 4 === 0 ? "up" : "down") : (i % 2 === 0 ? "up" : "down")} />
        );
      })}
      {/* 桝の仕切り (客の手前に) */}
      <g stroke={C.sajikiDark} strokeWidth={10}>
        <line x1={-20} y1={870} x2={1250} y2={870} />
        <line x1={-20} y1={1050} x2={1250} y2={1050} />
        {[220, 460, 700, 940, 1180].map((vx) => (
          <g key={vx}>
            <line x1={vx} y1={700} x2={vx} y2={870} opacity={0.85} />
            <line x1={vx - 20} y1={870} x2={vx - 20} y2={1050} opacity={0.85} />
          </g>
        ))}
      </g>
      {/* 土間の小さなごちそう (feast のとき) */}
      {feast && (
        <g>
          <Jubako x={330} y={1046} s={0.5} />
          <Tokkuri x={580} y={1040} s={0.7} rot={Math.sin(f / 11) * 6} />
        </g>
      )}
      {/* 客席 (桝席) は暗め。2段に分けて境目をぼかす */}
      <rect x={-20} y={690} width={1270} height={110} fill={SGP.nightInk} opacity={0.07} />
      <rect x={-20} y={800} width={1270} height={300} fill={SGP.nightInk} opacity={0.17} />
      {/* 右の桟敷: 大黒柱と2階建て */}
      <rect x={1250} y={-20} width={44} height={1120} fill={C.sajikiDark} stroke={C.ink} strokeWidth={6} />
      {/* 上の桟敷 */}
      <rect x={1294} y={120} width={650} height={420} fill="#D8C08C" />
      {[0, 1, 2].map((i) => (
        <PersonMini key={i} x={1430 + i * 170} y={520} s={0.75}
          color={[C.kimonoBlue, "#C98A9A", KRP.bronze][i]} f={f} phase={i * 5 + 2}
          face="smile" arms={feast ? "down" : "up"} />
      ))}
      <g> {/* 上桟敷の手すり */}
        <rect x={1294} y={430} width={650} height={18} fill={C.sajikiWood} stroke={C.ink} strokeWidth={5} />
        <rect x={1294} y={524} width={650} height={20} fill={C.sajikiWood} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={1320 + i * 92} y={448} width={16} height={76} fill={C.sajikiWood} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>
      <rect x={1294} y={544} width={650} height={40} fill={C.sajikiDark} stroke={C.ink} strokeWidth={6} />
      {/* 下の桟敷 (主役の宴) — 紅白幕と畳 */}
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={1294 + i * 82} y={584} width={82} height={86}
            fill={i % 2 === 0 ? "#D0453C" : KRP.white} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>
      <rect x={1294} y={670} width={650} height={430} fill="#BBB873" />
      <g stroke={C.ink} strokeWidth={3} opacity={0.3}>
        <line x1={1294} y1={880} x2={1944} y2={880} />
        <line x1={1600} y1={670} x2={1560} y2={1100} />
      </g>
      {feast ? (
        <g>
          {/* 宴: 3人が重箱を囲む。視線はごちそうへ */}
          <Zabuton x={1400} y={1040} s={1.1} />
          <Zabuton x={1850} y={1030} s={1.1} color="#9B6A7A" />
          <Person x={1400} y={1020} s={0.95} cloth={C.kimonoBlue} clothDark="#38506B"
            hair="none" face="joy" gaze={[6, 5]} f={f} phase={4} />
          <Person x={1660} y={990} s={0.9} cloth={C.kimonoGreen} clothDark="#53703F"
            hair="none" pose="hold" face="smile" gaze={[-2, 6]} f={f} phase={7} />
          <Person x={1860} y={1030} s={0.95} cloth="#C98A3A" clothDark="#9A6A2A"
            hair="none" pose="raise" face="joy" gaze={[-6, 5]} f={f} phase={9} />
          {/* 持った徳利と、回ってきたお猪口 */}
          <Tokkuri x={1660} y={900 + Math.sin(f / 9) * 4} s={0.9} rot={Math.sin(f / 9) * 10} />
          <circle cx={1776} cy={742 + Math.sin(f / 8) * 5} r={17} fill="#EDE6D6" stroke={C.ink} strokeWidth={4} />
          <Jubako x={1545} y={1070} s={1.15} />
          <Notes f={f} x={1620} y={840} n={4} spread={360} seed={5} />
        </g>
      ) : (
        <g>
          {/* 半畳投げ: 投げた人と、飛ぶ半畳 */}
          <Zabuton x={1850} y={1035} s={1.1} color="#9B6A7A" />
          <Person x={1480} y={1020} s={1.0} cloth={C.kimonoBlue} clothDark="#38506B"
            hair="none" pose="raise" lean={-14} face="angry" gaze={[-7, -3]} f={f} phase={4} />
          <Person x={1800} y={1030} s={0.9} cloth="#C98A3A" clothDark="#9A6A2A"
            hair="none" face="surprised" gaze={[-8, -4]} f={f} phase={9} />
          <Jubako x={1680} y={1075} s={0.9} open={false} />
          {/* 飛ぶ半畳 (回転) と軌跡 */}
          <g fill="none" stroke={KRP.orange} strokeWidth={5} opacity={0.5} strokeDasharray="18 16">
            <path d={`M 1430 800 Q 1020 330 ${zx} ${zy}`} />
          </g>
          <Zabuton x={zx} y={zy} s={1.0} rot={540 * zt} />
          {/* 舞台にもう1枚落ちている */}
          {zt > 0.4 && <Zabuton x={905} y={545} s={0.9} rot={14} color="#9B6A7A" />}
        </g>
      )}
    </g>
  );
};

// どこ: 上の SajikiWorld (phase="feast")
// 演出: 宴が主役。カメラは桟敷へゆっくり寄る
// 動き: 徳利・音符・炎・提灯・見得の決め線
const Sg017: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.07;
  return (
    <Frame f={f} seed={1016}>
      <g transform={zoomAt(z, 1450, 820)}>
        <SajikiWorld f={f} phase="feast" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #18 気に入らなければ、敷いていた座布団を、舞台に投げました。
// 格: 並 / seed 1017
// 絵: 同じ桟敷 (舞台続きの演出)。半畳がくるくる舞台へ。役者がひょいとかわす
// どこ: 同じ小屋だがカメラを土間へ下ろす。客の後頭部ごしに舞台と天井を見上げるローアングル (#17 の引きと別構図)
// 演出: 右上の桟敷から半畳が次々と飛び、役者がのけぞってかわす。手前は客の後ろ姿
// 動き: 半畳2枚の放物線 (1枚は着地・1枚は周回)・回転・軌跡の点線・提灯と炎のゆれ
const Sg018: React.FC<{ f: number }> = ({ f }) => {
  // 1枚目: 右上の桟敷から役者の足元へ飛んで着地する (一発もの)
  const t1 = easeOut(seg(f, 4, 24));
  const ax = (1 - t1) * (1 - t1) * 1660 + 2 * (1 - t1) * t1 * 1000 + t1 * t1 * 290;
  const ay = (1 - t1) * (1 - t1) * 430 + 2 * (1 - t1) * t1 * 140 + t1 * t1 * 608;
  // 2枚目: 少し遅れて何度でも飛んでくる (周回)。山なりの頂点でカメラに近づき大きくなる
  const tb = ((f + 30) % 52) / 52;
  const bx = (1 - tb) * (1 - tb) * 1680 + 2 * (1 - tb) * tb * 1200 + tb * tb * 820;
  const by = (1 - tb) * (1 - tb) * 470 + 2 * (1 - tb) * tb * 110 + tb * tb * 560;
  const bs = 1.2 + 0.8 * Math.sin(Math.PI * tb);
  const bo = Math.min(1, tb * 8, (1 - tb) * 8);
  return (
    <Frame f={f} seed={1017}>
      {/* 小屋の壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E3D3AE" />
      {/* 見上げた天井: 放射状の板目と梁 */}
      <rect x={-20} y={-20} width={W + 40} height={302} fill={C.sajikiDark} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.28}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={960 + (i - 5.5) * 62} y1={-20}
            x2={960 + (i - 5.5) * 270} y2={282} />
        ))}
      </g>
      <rect x={-20} y={238} width={W + 40} height={44} rx={4} fill="#5E4322"
        stroke={C.ink} strokeWidth={6} />
      {/* 梁から下がる提灯 (見上げているので大きい) */}
      {[250, 730, 1180].map((cxx, i) => (
        <Chochin key={i} x={cxx} y={278} s={1.0 + (i % 2) * 0.12} f={f} phase={i * 2}
          body={i % 2 === 0 ? "#E8E2D0" : "#D86A4A"} />
      ))}
      {/* 松羽目の金地 (下からあおるので上半分だけ見える) */}
      <rect x={-20} y={282} width={1210} height={362} fill={C.kinji} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.ink} strokeWidth={2.4} opacity={0.12}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={160 + i * 220} y1={282} x2={160 + i * 220} y2={644} />
        ))}
      </g>
      {/* 松の裾が左端にかかる */}
      <path d="M -20 640 Q 40 520 10 440" fill="none" stroke="#6E4A28"
        strokeWidth={24} strokeLinecap="round" />
      <ellipse cx={60} cy={412} rx={170} ry={64} fill={C.matsu} stroke={C.ink} strokeWidth={6} />
      <path d="M -20 400 q 80 -20 160 4" fill="none" stroke="#3C6236" strokeWidth={3} opacity={0.7} />
      {/* 舞台の床の縁と前板 (ローアングルなので前板が大きい) */}
      <rect x={-20} y={644} width={1210} height={52} fill={SGP.stage} stroke={C.ink} strokeWidth={7} />
      <rect x={-20} y={696} width={1210} height={300} fill={C.sajikiWood} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={60 + i * 170} y1={696} x2={60 + i * 170} y2={996} />
        ))}
        <line x1={-20} y1={760} x2={1190} y2={760} />
      </g>
      {/* 舞台の上だけ明るく */}
      <rect x={-20} y={282} width={1210} height={414} fill={C.glowWarm}
        opacity={0.12 + Math.sin(f / 15) * 0.02} />
      {/* 役者 (歌舞伎の扮装): 見上げる位置で大きく。のけぞって半畳をかわす */}
      <ellipse cx={560} cy={652} rx={132} ry={20} fill={C.ink} opacity={0.17} />
      <KabukiYakusha x={588} y={646} s={1.7} mie face="surprised"
        lean={-18} gaze={[8, -5]} f={f} phase={1} />
      {/* 舞台前のろうそく (近いので大きめ)。役者より手前に立つ */}
      {[150, 560, 960].map((cxx, i) => (
        <g key={i}>
          <rect x={cxx - 9} y={586} width={18} height={58} fill="#EDE6D6" stroke={C.ink} strokeWidth={4.5} />
          <ellipse cx={cxx} cy={570} rx={10 + Math.sin((f + i * 9) / 5) * 2.8}
            ry={19 + Math.sin((f + i * 7) / 4) * 4} fill={C.candle} stroke={C.ink} strokeWidth={3} />
          <ellipse cx={cxx} cy={570} rx={34} ry={40} fill={C.glowWarm} opacity={0.22} />
        </g>
      ))}
      {/* かわした風の線 */}
      <g stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
        <line x1={790 + Math.sin(f / 6) * 6} y1={300} x2={880 + Math.sin(f / 6) * 6} y2={330} />
        <line x1={810} y1={370} x2={910} y2={386} />
      </g>
      {/* 右上: 桟敷を見上げる。投げ手が手すりから身を乗り出す */}
      <rect x={1310} y={-20} width={48} height={1120} fill={C.sajikiDark} stroke={C.ink} strokeWidth={6} />
      <rect x={1358} y={170} width={582} height={322} fill="#D8C08C" />
      <Person x={1600} y={470} s={1.2} cloth={C.kimonoBlue} clothDark="#38506B"
        hair="none" pose="raise" face="angry" lean={-14} gaze={[-8, -3]} f={f} phase={4} />
      <Person x={1832} y={466} s={1.05} cloth="#C98A3A" clothDark="#9A6A2A"
        hair="none" face="surprised" gaze={[-8, -4]} f={f} phase={9} />
      <g> {/* 手すり (人物の足元を隠す) */}
        <rect x={1358} y={442} width={582} height={20} fill={C.sajikiWood} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={1388 + i * 92} y={460} width={15} height={88}
            fill={C.sajikiWood} stroke={C.ink} strokeWidth={4} />
        ))}
        <rect x={1358} y={548} width={582} height={22} fill={C.sajikiWood} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 桟敷の下の紅白幕と腰壁 */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={1358 + i * 73} y={570} width={73} height={84}
          fill={i % 2 === 0 ? "#D0453C" : KRP.white} stroke={C.ink} strokeWidth={4} />
      ))}
      <rect x={1358} y={654} width={582} height={446} fill="#BBB873" />
      <g stroke={C.ink} strokeWidth={3} opacity={0.3}>
        <line x1={1358} y1={830} x2={1940} y2={830} />
        <line x1={1650} y1={654} x2={1620} y2={1100} />
      </g>
      {/* 飛ぶ半畳 1枚目: 軌跡つきで舞台へ着地 */}
      <g fill="none" stroke={KRP.orange} strokeWidth={5} opacity={0.45}
        strokeDasharray="18 16" strokeDashoffset={-f * 5}>
        <path d="M 1660 430 Q 1000 140 290 608" />
      </g>
      <Zabuton x={ax} y={ay} s={1.25} rot={500 * t1} />
      {/* 飛ぶ半畳 2枚目: 何度でも飛んでくる。頂点でカメラに迫る */}
      <g opacity={bo}>
        <Zabuton x={bx} y={by} s={bs} rot={560 * tb} color="#9B6A7A" />
      </g>
      {/* 桝の仕切りの頭 */}
      <rect x={-20} y={990} width={W + 40} height={34} fill={C.sajikiDark} stroke={C.ink} strokeWidth={5} />
      {/* 手前: 土間の客の後ろ姿ごしに見る */}
      {Array.from({ length: 5 }, (_, i) => (
        <PersonMini key={`r1${i}`} x={90 + i * 420 + rnd(31, i) * 60} y={1150} s={1.35}
          color={[KRP.blue, C.kimonoGreen, "#C98A9A", KRP.bronze, KRP.orange][i]}
          f={f} phase={i * 3 + 1} face="none" arms={i % 2 === 0 ? "up" : "down"} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <PersonMini key={`r2${i}`} x={260 + i * 470 + rnd(32, i) * 50} y={1290} s={1.8}
          color={["#6E5E70", KRP.bronze, C.kimonoBlue, "#A8505A"][i]}
          f={f} phase={i * 5 + 2} face="none" arms={i % 2 === 1 ? "up" : "down"} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #19 ナポリのオペラハウスでは、お客はしゃべりっぱなし。
// 格: 並 / seed 1018
// 絵: 馬蹄形のボックス席。扇子と笑い声の音符。舞台の歌手は豆粒で熱唱
// どこ: ナポリのオペラハウス。客席の奥から舞台を見る一点透視
// 演出: 左右3段のボックス席はおしゃべりの真っ最中。舞台の歌手は豆粒で熱唱
// 動き: 扇のあおぎ・音符の群れ・シャンデリアの炎・歌声の弧
const Sg019: React.FC<{ f: number }> = ({ f }) => {
  // ボックス席1区画。おしゃべり中の2人
  const Box: React.FC<{ x: number; y: number; w: number; h: number; i: number }> =
    ({ x, y, w, h, i }) => {
      const fan = rnd(31, i) > 0.4;
      const fanRot = Math.sin((f + i * 13) / 8) * 22;
      const ps = h / 330;
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} fill="#5E222A" stroke={C.ink} strokeWidth={5} />
          {/* 2人は互いに向き合って (少し内に傾いて) しゃべりっぱなし */}
          <g transform={`rotate(6 ${x + w * 0.32} ${y + h * 0.94})`}>
            <PersonMini x={x + w * 0.32} y={y + h * 0.94} s={ps}
              color={["#C98A9A", C.kimonoBlue, C.operaGold, "#7A5E8E"][i % 4]}
              f={f} phase={i * 7} face="smile" />
          </g>
          <g transform={`rotate(-6 ${x + w * 0.7} ${y + h * 0.94})`}>
            <PersonMini x={x + w * 0.7} y={y + h * 0.94} s={ps}
              color={["#6E8F5A", "#B0603A", KRP.blueSoft, "#9A4A52"][(i + 2) % 4]}
              f={f} phase={i * 7 + 3} face="smile" arms={i % 3 === 0 ? "up" : "down"} />
          </g>
          {/* 口元から出るおしゃべりの波線 */}
          <Namisen f={f} x={x + w * 0.44} y={y + h * 0.56} s={ps * 0.92} seed={i + 41} />
          <Namisen f={f} x={x + w * 0.62} y={y + h * 0.5} s={ps * 0.8} seed={i + 77} />
          {fan && (
            <g transform={`translate(${x + w * 0.5} ${y + h * 0.42}) rotate(${fanRot})`}>
              <path d="M 0 0 L -34 -52 A 62 62 0 0 1 34 -52 Z"
                fill={C.operaGold} stroke={C.ink} strokeWidth={4} />
              <line x1={0} y1={0} x2={0} y2={-58} stroke={C.ink} strokeWidth={3} />
              <line x1={0} y1={0} x2={-24} y2={-52} stroke={C.ink} strokeWidth={2.4} />
              <line x1={0} y1={0} x2={24} y2={-52} stroke={C.ink} strokeWidth={2.4} />
            </g>
          )}
          {/* 手すり (金) */}
          <rect x={x - 6} y={y + h - 26} width={w + 12} height={26} rx={8}
            fill={C.operaGold} stroke={C.ink} strokeWidth={5} />
        </g>
      );
    };
  const z = 1 + easeOut(clamp01(f / 70)) * 0.04;
  return (
    <Frame f={f} seed={1018} bg={C.operaRed}>
    <g transform={zoomAt(z, 960, 480)}>
      {/* 壁 (赤) と天井 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.operaRed} />
      <path d="M -20 150 Q 960 -90 1940 150 L 1940 -40 L -20 -40 Z" fill="#6E2129" stroke={C.ink} strokeWidth={6} />
      {/* 舞台 (奥・中央) */}
      <g>
        <path d="M 640 180 Q 960 100 1280 180 L 1280 700 L 640 700 Z"
          fill="#3A2430" stroke={C.ink} strokeWidth={8} />
        <path d="M 640 180 Q 960 100 1280 180 L 1280 300 Q 960 240 640 300 Z"
          fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
        <path d="M 640 180 L 640 700 L 740 700 Q 690 420 640 180 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
        <path d="M 1280 180 L 1280 700 L 1180 700 Q 1230 420 1280 180 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
        <rect x={640} y={640} width={640} height={60} fill={SGP.stage} stroke={C.ink} strokeWidth={6} />
        {/* フットライトから舞台へ立ちのぼる光 */}
        <polygon points="770,660 1170,660 1100,330 840,330" fill={C.glowWarm}
          opacity={0.16 + Math.sin(f / 11) * 0.03} />
        {/* 18世紀オペラの歌手 (熱唱) */}
        <OperaKashu x={960} y={650} s={0.62} f={f} phase={1} />
        {/* 蝋燭のフットライト (歌手より手前。下から顔を照らす) */}
        <Footlights f={f} y={668} xs={[775, 840, 905, 970, 1035, 1100, 1165]} />
        <g fill="none" stroke={C.glowWarm} strokeWidth={5} opacity={0.8}>
          {[0, 1, 2].map((i) => {
            const rr = 36 + ((f * 2.2 + i * 26) % 80);
            return <path key={i} d={`M ${960 - rr * 0.8} ${470 - rr * 0.5} A ${rr} ${rr} 0 0 1 ${960 + rr * 0.8} ${470 - rr * 0.5}`}
              opacity={0.8 - ((f * 2.2 + i * 26) % 80) / 110} />;
          })}
        </g>
        <Notes f={f} x={960} y={420} n={3} spread={140} s={0.8} color={C.glowWarm} seed={8} />
      </g>
      {/* 左右のボックス席 (3段×2列が奥へすぼむ) */}
      {Array.from({ length: 3 }, (_, r) => {
        const y0 = 150 + r * 290;
        return (
          <g key={r}>
            <Box x={10} y={y0} w={300} h={250} i={r * 4} />
            <Box x={340} y={y0 + 24} w={240} h={212} i={r * 4 + 1} />
            <Box x={1340} y={y0 + 24} w={240} h={212} i={r * 4 + 2} />
            <Box x={1610} y={y0} w={300} h={250} i={r * 4 + 3} />
          </g>
        );
      })}
      {/* 平土間の後頭部の列 (手前・影) */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <circle cx={240 + i * 180 + rnd(33, i) * 40} cy={1035 + rnd(33, i + 9) * 40}
            r={64} fill="#2A1B20" stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* おしゃべりの音符 (客席のあちこち) */}
      <Notes f={f} x={300} y={400} n={4} spread={360} seed={2} color={KRP.white} />
      <Notes f={f} x={1620} y={430} n={4} spread={360} seed={3} color={KRP.white} />
      <Notes f={f} x={420} y={900} n={3} spread={300} seed={4} color={KRP.white} s={0.8} />
      <Notes f={f} x={1500} y={930} n={3} spread={300} seed={6} color={KRP.white} s={0.8} />
      {/* シャンデリア */}
      <g transform={`translate(960 70) rotate(${Math.sin(f / 21) * 1.6})`}>
        <line x1={0} y1={-90} x2={0} y2={0} stroke={C.operaGold} strokeWidth={7} />
        <path d="M -130 40 Q 0 110 130 40 L 110 10 Q 0 70 -110 10 Z"
          fill={C.operaGold} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={26} rx={64} ry={20} fill={C.operaGold} stroke={C.ink} strokeWidth={5} />
        {[-120, -62, 0, 62, 120].map((lx, i) => (
          <g key={i}>
            <rect x={lx - 5} y={6 - Math.abs(lx) * 0.2} width={10} height={24} fill="#EDE6D6" stroke={C.ink} strokeWidth={3} />
            <ellipse cx={lx} cy={-4 - Math.abs(lx) * 0.2} rx={6 + Math.sin((f + i * 7) / 5) * 1.8}
              ry={12 + Math.sin((f + i * 9) / 4) * 2.6} fill={C.candle} stroke={C.ink} strokeWidth={2.6} />
          </g>
        ))}
        <ellipse cx={0} cy={0} rx={190} ry={80} fill={C.glowWarm} opacity={0.14 + Math.sin(f / 9) * 0.04} />
      </g>
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #20 作曲家は「どうせ聴かれない時間」のための曲まで、書いていました。
// 格: 並 / seed 1019
// 絵: 蝋燭の書斎。五線譜に羽ペン。余白に小さく「※ここは聴かれません」の付箋
// どこ: 蝋燭ひとつの作曲家の書斎。机の上の五線譜に寄る
// 演出: 羽ペンが音符を書き進める。余白に「※ここは聴かれません」の付箋
// 動き: 羽ペンの前進と上下・音符が1個ずつ現れる・炎と光のゆれ・付箋のポン
const Sg020: React.FC<{ f: number }> = ({ f }) => {
  const writeT = seg(f, 4, 40);                  // 書き進む
  const penX = lerp(560, 1210, writeT);
  const penBob = Math.sin(f / 3.2) * 4;
  const flick = 1 + Math.sin(f / 4.6) * 0.1;
  // 五線譜1段 (x0..x1, 中心y)
  const Stave: React.FC<{ y: number }> = ({ y }) => (
    <g stroke={C.ink} strokeWidth={3} opacity={0.75}>
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={500} y1={y + i * 16} x2={1480} y2={y + i * 16} />
      ))}
    </g>
  );
  const NoteHead: React.FC<{ x: number; y: number; up?: boolean }> = ({ x, y, up = true }) => (
    <g>
      <ellipse cx={x} cy={y} rx={11} ry={8.5} fill={C.ink} transform={`rotate(-16 ${x} ${y})`} />
      <line x1={up ? x + 10 : x - 10} y1={y - 2} x2={up ? x + 10 : x - 10} y2={up ? y - 42 : y + 42}
        stroke={C.ink} strokeWidth={3.6} />
    </g>
  );
  return (
    <Frame f={f} seed={1019} dark bg="#352A22">
    <g>
      {/* 書斎の壁・本棚・窓 */}
      <rect x={-20} y={-20} width={W + 40} height={620} fill="#473828" />
      <g> {/* 本棚 (左奥) */}
        <rect x={60} y={60} width={420} height={520} fill="#32261A" stroke={C.ink} strokeWidth={7} />
        {[200, 360, 520].map((sy) => (
          <g key={sy}>
            <line x1={60} y1={sy} x2={480} y2={sy} stroke={C.ink} strokeWidth={6} />
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x={86 + i * 54} y={sy - 96 - rnd(41, sy + i) * 22}
                width={40} height={96 + rnd(41, sy + i) * 22}
                fill={["#6E4A32", "#8A5E3A", "#5E4A5E", "#4A5E50"][i % 4]}
                stroke={C.ink} strokeWidth={3.4} opacity={0.85} />
            ))}
          </g>
        ))}
      </g>
      {/* 窓 (右奥・夜) */}
      <rect x={1520} y={80} width={340} height={440} rx={8} fill="#1B2232" stroke={C.ink} strokeWidth={8} />
      <line x1={1690} y1={80} x2={1690} y2={520} stroke={C.ink} strokeWidth={6} />
      <line x1={1520} y1={300} x2={1860} y2={300} stroke={C.ink} strokeWidth={6} />
      <circle cx={1620} cy={190} r={36} fill="#E9E4CE" opacity={0.85} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={1540 + rnd(43, i) * 300} cy={330 + rnd(43, i + 9) * 170}
          r={1.8 + rnd(43, i + 4) * 2} fill="#F6EFC9" opacity={0.4 + Math.sin((f + i * 7) / 9) * 0.3} />
      ))}
      {/* 作曲家 (机の向こう側。下半身は机に隠れる) */}
      <Person x={310} y={742} s={1.2} cloth="#4A3A5E" clothDark="#372B48"
        hair="none" pose="hold" face="normal" gaze={[7, 6]} f={f} phase={2} />
      {/* 机 */}
      <rect x={-20} y={600} width={W + 40} height={500} fill="#5E452E" />
      <line x1={-20} y1={600} x2={W + 20} y2={600} stroke={C.ink} strokeWidth={8} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.25}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={lerp(300, -200, i / 5)} y1={1100} x2={lerp(1000, 1400, i / 5)} y2={610} />
        ))}
      </g>
      {/* 楽譜 (大きく机の主面積) */}
      <g transform="rotate(-2 960 760)">
        <rect x={440} y={560} width={1100} height={420} rx={8}
          fill="#F0E6C8" stroke={C.ink} strokeWidth={7} />
        <rect x={452} y={572} width={1076} height={396} rx={6}
          fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.3} />
        <Stave y={620} />
        <Stave y={750} />
        <Stave y={880} />
        {/* 1段目: 書き終わった音符 */}
        {Array.from({ length: 11 }, (_, i) => (
          <NoteHead key={i} x={560 + i * 82} y={636 + (rnd(45, i) - 0.5) * 48} up={i % 3 !== 2} />
        ))}
        {/* 2段目: いま書いている音符 (ペンの後ろに現れる) */}
        {Array.from({ length: 8 }, (_, i) => {
          const nx = 560 + i * 88;
          return nx < penX - 30 && (
            <NoteHead key={i} x={nx} y={766 + (rnd(46, i) - 0.5) * 48} up={i % 2 === 0} />
          );
        })}
        {/* インクの点 (ペン先) */}
        <circle cx={penX} cy={770 + penBob * 0.4} r={4} fill={C.ink} opacity={0.8} />
        {/* 付箋 「※ここは聴かれません」 (3段目の余白) */}
        <g transform={`translate(1200 892) rotate(5) scale(${pop(seg(f, 26, 36))})`}>
          <rect x={-180} y={-40} width={360} height={84} rx={6}
            fill={C.tagPaper} stroke={C.ink} strokeWidth={5} />
          <rect x={-40} y={-52} width={80} height={20} fill={KRP.yellow}
            stroke={C.ink} strokeWidth={3.4} opacity={0.9} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={27} fill={C.ink}>※ここは聴かれません</text>
        </g>
      </g>
      {/* 羽ペン (書く手の代わりに羽ペンが動く) */}
      <g transform={`translate(${penX} ${764 + penBob}) rotate(24)`}>
        <line x1={0} y1={0} x2={26} y2={-110} stroke={C.ink} strokeWidth={5} />
        <path d="M 10 -44 Q -30 -140 36 -210 Q 64 -130 24 -58 Z"
          fill="#E8E2D0" stroke={C.ink} strokeWidth={5} />
        <path d="M 14 -60 Q 10 -130 34 -186" fill="none" stroke={C.ink} strokeWidth={2.6} opacity={0.6} />
      </g>
      {/* インク壺 */}
      <g transform="translate(1620 880)">
        <path d="M -44 0 Q -52 -40 -20 -52 L -20 -70 L 20 -70 L 20 -52 Q 52 -40 44 0 Z"
          fill="#2A3240" stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-70} rx={20} ry={7} fill={C.ink} />
      </g>
      {/* 蝋燭 (左) と光 */}
      <g transform="translate(180 560)">
        <ellipse cx={0} cy={44} rx={56} ry={16} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
        <rect x={-34} y={28} width={68} height={18} rx={8} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <rect x={-14} y={-98} width={28} height={128} rx={6} fill="#EDE6D6" stroke={C.ink} strokeWidth={5} />
        <path d={`M -8 -86 q 8 ${Math.sin(f / 7) * 6} 14 0`} fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.4} />
        <ellipse cx={0} cy={-124} rx={11 * flick} ry={26 * flick} fill={C.candle} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={0} cy={-128} rx={4.5} ry={11} fill={KRP.white} opacity={0.85} />
      </g>
      <ellipse cx={240} cy={560} rx={520} ry={420} fill={C.glowWarm} opacity={0.1 * flick} />
      <ellipse cx={240} cy={560} rx={300} ry={250} fill={C.glowWarm} opacity={0.1 * flick} />
      {/* 書いている曲の音が少し漏れる */}
      <Notes f={f} x={1000} y={520} n={3} spread={240} s={0.75} color="#C9B88E" seed={9} />
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #21 人類は、ほとんどの時代、最後まで観ていないのです。
// 格: 山 / seed 1020
// 絵: `NenpyoEmaki` 初登場。巻物がばーっと開く。数千年の帯はぜんぶ賑やか、右端のほんの一節だけ青く静か
// どこ: 書見の間。大きな文机の上で絵巻年表がばーっと開く
// 演出: NenpyoEmaki 初登場。開き切ると右端の青い一節に目が行く
// 動き: openT で開く・開く最中のほこり星・虫眼鏡ごしの光・見届け人2人の反応
const Sg021: React.FC<{ f: number }> = ({ f }) => {
  const openT = seg(f, 4, 30);
  const opened = seg(f, 30, 40);
  return (
    <Frame f={f} seed={1020}>
    <g>
      {/* 部屋: 壁と畳敷きの文机まわり */}
      <rect x={-20} y={-20} width={W + 40} height={560} fill="#E8DCBC" />
      <g stroke={C.ink} strokeWidth={3} opacity={0.18}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={-20} y1={80 + i * 100} x2={1940} y2={80 + i * 100} />
        ))}
      </g>
      {/* 窓からの光 (斜めのすじ) */}
      <polygon points="1240,-20 1620,-20 1040,560 760,560" fill={C.glowWarm}
        opacity={0.2 + Math.sin(f / 15) * 0.05} />
      <polygon points="1700,-20 1900,-20 1460,560 1300,560" fill={C.glowWarm}
        opacity={0.14 + Math.sin(f / 15 + 2) * 0.04} />
      {/* 大きな文机 (画面の下半分) */}
      <rect x={-20} y={520} width={W + 40} height={580} fill={C.deskWood} />
      <line x1={-20} y1={520} x2={W + 20} y2={520} stroke={C.ink} strokeWidth={8} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.2}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={lerp(160, -400, i / 8)} y1={1100} x2={lerp(880, 1240, i / 8)} y2={530} />
        ))}
      </g>
      {/* 湯のみ (左上) */}
      <g transform="translate(150 560)">
        <ellipse cx={0} cy={26} rx={52} ry={14} fill={C.ink} opacity={0.15} />
        <path d="M -40 20 Q -46 -34 -30 -44 L 30 -44 Q 46 -34 40 20 Z"
          fill="#5E7A5E" stroke={C.ink} strokeWidth={5} />
        <path d={`M -8 -56 q ${Math.sin(f / 9) * 10} -22 4 -44`} fill="none"
          stroke={KRP.white} strokeWidth={4} opacity={0.5} />
      </g>
      {/* ===== 絵巻年表 (共有装置・初登場) ===== */}
      <NenpyoEmaki f={f} x={960} y={620} s={1} openT={openT}
        highlight={opened > 0 ? "short" : undefined} />
      {/* 開く最中のほこり星 */}
      {openT > 0.05 && openT < 1 && (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const side = i % 2 === 0 ? -1 : 1;
            const ex = 960 + side * 850 * openT + (rnd(51, i) - 0.5) * 120;
            const ey = 450 + rnd(51, i + 9) * 340;
            return (
              <path key={i} transform={`translate(${ex} ${ey}) scale(${0.7 + rnd(51, i + 4)})`}
                d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z"
                fill={KRP.yellow} stroke={C.ink} strokeWidth={2} opacity={0.85} />
            );
          })}
        </g>
      )}
      {/* 文鎮 (開き切ったら両端にトン) */}
      <g opacity={easeOut(opened)}>
        <rect x={130} y={440} width={36} height={160} rx={12} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1754} y={440} width={36} height={160} rx={12} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 虫眼鏡 (右端の青い一節のそば) */}
      <g transform={`translate(1560 870) rotate(${-24 + Math.sin(f / 17) * 2})`}>
        <circle r={86} fill={KRP.blueSoft} opacity={0.4} />
        <circle r={86} fill="none" stroke={KRP.brass} strokeWidth={14} />
        <circle r={86} fill="none" stroke={C.ink} strokeWidth={4} />
        <rect x={74} y={52} width={130} height={30} rx={14} fill={SGP.woodDark}
          stroke={C.ink} strokeWidth={5} transform="rotate(38)" />
      </g>
      {/* 見届け人2人 (机の手前で反応) */}
      <ellipse cx={250} cy={1056} rx={100} ry={20} fill={C.ink} opacity={0.15} />
      <Person x={250} y={1046} s={1.15} cloth={C.kimonoBlue} clothDark="#38506B"
        face="surprised" gaze={[7, -6]} f={f} phase={3} />
      <ellipse cx={1740} cy={1056} rx={100} ry={20} fill={C.ink} opacity={0.15} />
      <Person x={1740} y={1046} s={1.15} cloth={KRP.orange} clothDark="#B06A2A"
        pose="point" pointDir={-1} face="smile" gaze={[-7, -6]} f={f} phase={6} />
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #22 では、「黙って、座って、最初から最後まで」は、いつ、誰が決めたのでしょうか。
// 格: 図 / seed 1021
// 絵: `Fuda3` 初登場。三枚札が吊るされ、値札に大きな「?」。誰の発明か不明の品
// どこ: 骨董屋のような陳列の間。板壁にスポットライト
// 演出: Fuda3 初登場。三枚札が吊るされ、ぶら下がる値札に大きな「?」=作者不明の品
// 動き: 札がトントンと下りる・値札の振り子・スポットの中のほこり・？のゆれ
const Sg022: React.FC<{ f: number }> = ({ f }) => {
  // 三枚札それぞれの真下に立つ「その札に当てはまる人」。札の中心は 503 / 833 / 1290
  const tachi = easeOut(seg(f, 14, 36)); // 人がすっと浮かび上がる
  return (
    <Frame f={f} seed={1021}>
    <g>
      {/* 板壁 (縦板) */}
      <rect x={-20} y={-20} width={W + 40} height={820} fill="#C7A878" />
      <g stroke={C.ink} strokeWidth={4} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 164 + 40} y1={-20} x2={i * 164 + 40} y2={800} />
        ))}
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={rnd(61, i) * W} cy={rnd(61, i + 7) * 700}
          rx={10 + rnd(61, i + 3) * 8} ry={5} fill={C.ink} opacity={0.12} />
      ))}
      {/* 鴨居と吊り紐 */}
      <rect x={-20} y={96} width={W + 40} height={40} fill={C.sajikiDark} stroke={C.ink} strokeWidth={6} />
      {[540, 960, 1420].map((lx, i) => (
        <line key={i} x1={lx} y1={136} x2={lx} y2={320}
          stroke="#8A7A5A" strokeWidth={7} opacity={0.9} />
      ))}
      {/* スポットライト (左上から三枚札へ) */}
      <polygon points="200,-20 560,-20 1560,820 540,820" fill={C.glowWarm}
        opacity={0.26 + Math.sin(f / 13) * 0.05} />
      {/* スポットの中のほこり */}
      {Array.from({ length: 10 }, (_, i) => {
        const p = ((f * 0.6 + rnd(63, i) * 100) % 100) / 100;
        return (
          <circle key={i} cx={lerp(400, 1300, rnd(63, i + 5)) + Math.sin((f + i * 13) / 17) * 20}
            cy={lerp(60, 760, p)} r={2.4 + rnd(63, i + 8) * 2.6}
            fill={KRP.white} opacity={(1 - p) * 0.5} />
        );
      })}
      {/* ===== 三枚札 (共有装置・初登場) ===== */}
      <Fuda3 f={f} x={960} y={420} s={1.1} t={seg(f, 4, 30)} />
      {/* 陳列台 */}
      <rect x={-20} y={800} width={W + 40} height={300} fill={C.deskWoodDark} />
      <line x1={-20} y1={800} x2={W + 20} y2={800} stroke={C.ink} strokeWidth={8} />
      <rect x={200} y={830} width={1520} height={34} rx={8} fill="#B08A52" stroke={C.ink} strokeWidth={6} opacity={0.9} />
      {/* ===== 札それぞれの真下に立つ3人 (スポットの光が落ちる位置) ===== */}
      <g opacity={tachi}>
        {/* 足元に落ちるスポットの明かりと影 */}
        {[[503, 812], [833, 802], [1290, 806]].map(([px, py], i) => (
          <g key={i}>
            <ellipse cx={px} cy={py} rx={128} ry={16} fill={C.glowWarm} opacity={0.3} />
            <ellipse cx={px} cy={py + 2} rx={86} ry={10} fill={C.ink} opacity={0.17} />
          </g>
        ))}
        {/* 「黙って」 — 口の前に人差し指を立てている人 */}
        <Person x={503} y={812} s={0.98} lean={-3} f={f} phase={2}
          cloth={C.kimonoBlue} clothDark="#38506B" pose="hold" face="normal" gaze={[1, 1]} />
        <Kasane x={503} y={812} s={0.98} lean={-3} f={f} phase={2}>
          {/* 袖口 (組んだ前腕の手先に重なる) */}
          <rect x={-26} y={-130} width={52} height={28} rx={14}
            fill={C.kimonoBlue} stroke={C.ink} strokeWidth={4.5} />
          {/* 前腕 (肘は腰のあたり → 手は顎の下) */}
          <rect x={-2} y={-172} width={24} height={68} rx={12}
            fill={C.kimonoBlue} stroke={C.ink} strokeWidth={4.5} />
          <circle cx={8} cy={-160} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          {/* 立てた人差し指 (口の前。目にはかからない) */}
          <rect x={-6} y={-210} width={15} height={48} rx={7.5}
            fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        </Kasane>
        {/* 「座って」 — 座布団にきちんと腰かけている人 */}
        <g>
          <rect x={735} y={778} width={196} height={44} rx={14}
            fill={C.zabuton} stroke={C.ink} strokeWidth={6} />
          <line x1={741} y1={793} x2={925} y2={793} stroke={C.ink} strokeWidth={3.4} opacity={0.45} />
          <circle cx={833} cy={801} r={8} fill="none" stroke={C.ink} strokeWidth={3.4} opacity={0.6} />
        </g>
        <Person x={833} y={798} s={0.9} f={f} phase={5}
          cloth="#C98A3A" clothDark="#9A6A2A" pose="stand" face="normal" gaze={[0, 2]} />
        <Kasane x={833} y={798} s={0.9} f={f} phase={5}>
          {/* 裾 (腰から下を隠す) と膝 */}
          <path d="M -50 -78 Q -110 -48 -120 6 L 120 6 Q 110 -48 50 -78 Z"
            fill="#C98A3A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={-50} cy={-18} rx={44} ry={30} fill="#9A6A2A" stroke={C.ink} strokeWidth={5.5} />
          <ellipse cx={50} cy={-18} rx={44} ry={30} fill="#9A6A2A" stroke={C.ink} strokeWidth={5.5} />
          <g fill="none" stroke="#9A6A2A" strokeWidth={4.5} opacity={0.7}>
            <path d="M -16 -72 L -22 -24" />
            <path d="M 16 -72 L 22 -24" />
          </g>
          {/* 帯 */}
          <rect x={-56} y={-90} width={112} height={26} rx={4} fill="#9A6A2A"
            stroke={C.ink} strokeWidth={5} />
        </Kasane>
        {/* 「最初から最後まで」 — 腕を組んでじっと観ている人 */}
        <Person x={1290} y={806} s={0.95} lean={2} f={f} phase={8}
          cloth={C.kimonoGreen} clothDark="#53703F" pose="armsFolded" face="normal" gaze={[-1, 0]} />
      </g>
      {/* 縄の柵 (手前) */}
      {[380, 1540].map((px2, i) => (
        <g key={i}>
          <rect x={px2 - 14} y={880} width={28} height={190} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          <circle cx={px2} cy={872} r={22} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      <path d={`M 380 900 Q 960 ${1030 + Math.sin(f / 19) * 8} 1540 900`}
        fill="none" stroke={SGP.shuin} strokeWidth={13} opacity={0.9} />
      <path d={`M 380 900 Q 960 ${1030 + Math.sin(f / 19) * 8} 1540 900`}
        fill="none" stroke={C.ink} strokeWidth={3.4} opacity={0.5} strokeDasharray="12 18" />
      {/* 首をかしげる ? (左の空きに) */}
      <QMark x={270} y={330} s={1.1} f={f} t={seg(f, 32, 40)} />
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #23 調べていくと、犯人には、名前と顔がありました。
// 格: 山 / seed 1022
// 絵: 暗い資料室。机にランプ。分厚い捜査ファイルがバサッと開き、`Tehaisho` の顔がのぞく
// どこ: 夜の資料室。奥に資料箱の棚、机の上にランプ
// 演出: 分厚い捜査ファイルがバサッと開き、手配書の顔が2枚のぞく
// 動き: 表紙がめくれる・手配書がせり上がる・紙が舞う・ランプの光がまたたく
const Sg023: React.FC<{ f: number }> = ({ f }) => {
  const openT = easeOut(seg(f, 6, 18));     // 表紙がめくれる
  const rise = easeOut(seg(f, 16, 32));     // 手配書がのぞく
  const flick = 0.9 + Math.sin(f / 5.4) * 0.07 + Math.sin(f / 2.3) * 0.03;
  return (
    <Frame f={f} seed={1022} dark bg={C.night}>
    <g>
      {/* 暗い壁と資料棚 */}
      <rect x={-20} y={-20} width={W + 40} height={660} fill="#2A3140" />
      <g opacity={0.55}>
        {[0, 1].map((r) => (
          <g key={r}>
            <line x1={-20} y1={250 + r * 230} x2={1940} y2={250 + r * 230} stroke={C.ink} strokeWidth={10} />
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <rect x={40 + i * 210 + rnd(71, i + r * 9) * 30} y={130 + r * 230}
                  width={160} height={118} rx={4} fill="#3A4252" stroke={C.ink} strokeWidth={5} />
                <rect x={70 + i * 210 + rnd(71, i + r * 9) * 30} y={160 + r * 230}
                  width={100} height={26} rx={3} fill="#555F72" opacity={0.8} />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* 机 */}
      <rect x={-20} y={640} width={W + 40} height={460} fill="#3E3226" />
      <line x1={-20} y1={640} x2={W + 20} y2={640} stroke={C.ink} strokeWidth={8} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.2}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={lerp(240, -300, i / 6)} y1={1100} x2={lerp(900, 1300, i / 6)} y2={650} />
        ))}
      </g>
      {/* ランプの光の輪 (ファイルを照らす) */}
      <ellipse cx={930} cy={810} rx={720} ry={330} fill={C.glowWarm} opacity={0.13 * flick} />
      <ellipse cx={930} cy={810} rx={460} ry={210} fill={C.glowWarm} opacity={0.12 * flick} />
      {/* 緑笠のランプ (左) */}
      <g transform="translate(330 640)">
        <ellipse cx={0} cy={-2} rx={70} ry={16} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
        <rect x={-10} y={-120} width={20} height={118} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <path d="M -104 -120 Q 0 -190 104 -120 L 84 -96 Q 0 -150 -84 -96 Z"
          fill="#3E7A52" stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-104} rx={58} ry={16} fill={C.glowWarm} opacity={0.85 * flick} />
      </g>
      {/* ===== 捜査ファイル (中央) ===== */}
      <g transform="rotate(-3 960 840)">
        {/* 下の台紙と紙の束 */}
        <rect x={620} y={700} width={680} height={300} rx={10} fill="#8A6A42" stroke={C.ink} strokeWidth={8} />
        <rect x={648} y={716} width={624} height={264} rx={6} fill="#EDE2C4" stroke={C.ink} strokeWidth={5} />
        <g stroke={C.ink} strokeWidth={2.5} opacity={0.5}>
          <line x1={648} y1={740} x2={1272} y2={740} />
          <line x1={648} y1={960} x2={1272} y2={960} />
        </g>
        {/* のぞく手配書2枚 (紙の束の奥からせり上がる) */}
        <g>
          <Tehaisho f={f} who={1} x={880} y={870 - rise * 180} s={0.78} t={1} />
          <Tehaisho f={f} who={2} x={1100} y={900 - rise * 150} s={0.72} t={1} />
        </g>
        {/* 束の手前の紙 (手配書の下半分を隠す) */}
        <rect x={636} y={850} width={648} height={150} rx={6} fill="#E3D6B2" stroke={C.ink} strokeWidth={5} />
        <g stroke={KRP.grayDark} strokeWidth={3.4} opacity={0.6}>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1={680} y1={886 + i * 26} x2={1240} y2={886 + i * 26} />
          ))}
        </g>
        {/* めくれた表紙 (左へバサッ) */}
        <g transform={`translate(620 850) scale(${1 - openT * 1.96} 1) translate(-620 -850)`}>
          <rect x={620} y={700} width={680} height={300} rx={10}
            fill={openT < 0.5 ? "#8A6A42" : "#6E5434"} stroke={C.ink} strokeWidth={8} />
          {openT < 0.5 && (
            <g>
              <TagPlate x={960} y={776} text="捜査ファイル" size={40} t={1} fill="#EDE2C4" />
              <circle cx={700} cy={760} r={16} fill={SGP.shuin} opacity={0.8} />
            </g>
          )}
        </g>
      </g>
      {/* 舞う紙2枚 */}
      {openT > 0.3 && (
        <g>
          <rect x={520} y={620 - openT * 90} width={110} height={80} rx={4}
            fill="#EDE2C4" stroke={C.ink} strokeWidth={4}
            transform={`rotate(${-20 + Math.sin(f / 7) * 10} 575 ${660 - openT * 90})`} opacity={0.95} />
          <rect x={1310} y={660 - openT * 60} width={96} height={70} rx={4}
            fill="#E3D6B2" stroke={C.ink} strokeWidth={4}
            transform={`rotate(${16 + Math.sin(f / 8 + 2) * 10} 1358 ${695 - openT * 60})`} opacity={0.95} />
        </g>
      )}
      {/* 調べる人 (右。虫眼鏡を構えて驚く) */}
      <ellipse cx={1600} cy={1056} rx={110} ry={22} fill={C.ink} opacity={0.3} />
      <Person x={1600} y={1046} s={1.35} cloth="#4A4238" clothDark="#36302A"
        pose="hold" glasses face="surprised" gaze={[-8, -2]} f={f} phase={5} />
      <g transform={`translate(1582 880) rotate(-30)`}>
        <circle r={54} fill={KRP.blueSoft} opacity={0.35} />
        <circle r={54} fill="none" stroke={KRP.brass} strokeWidth={10} />
        <circle r={54} fill="none" stroke={C.ink} strokeWidth={3.4} />
        <rect x={46} y={34} width={84} height={22} rx={11} fill={SGP.woodDark}
          stroke={C.ink} strokeWidth={4} transform="rotate(38)" />
      </g>
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #24 しかも、複数犯です。
// 格: 図 / seed 1023
// 絵: 掲示板に手配書が1枚→パパパッと6枚に増える。「複数犯」の朱印
// どこ: 街角の高札場。屋根つきの掲示板
// 演出: 手配書が1枚→パパパッと6枚に増え、「複数犯」の朱印がドン
// 動き: 1枚ずつのポン・朱印のフェード・雲・見物人のざわめき
const Sg024: React.FC<{ f: number }> = ({ f }) => {
  const sheets: Array<{ who: 1 | 2 | 3 | 4 | 5 | 6; x: number; y: number; at: number }> = [
    { who: 1, x: 620, y: 420, at: 0 },
    { who: 2, x: 960, y: 430, at: 8 },
    { who: 3, x: 1300, y: 420, at: 12 },
    { who: 4, x: 620, y: 700, at: 16 },
    { who: 5, x: 960, y: 710, at: 20 },
    { who: 6, x: 1300, y: 700, at: 24 },
  ];
  return (
    <Frame f={f} seed={1023}
      over={
        <Stamp x={1360} y={180} text="複数犯" size={78}
          opacity={0.92 * easeOut(seg(f, 30, 40))} />
      }>
    <g>
      {/* 空と雲 */}
      <rect x={-20} y={-20} width={W + 40} height={880} fill={KRP.paperCool} />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${((f * (0.6 + i * 0.4) + i * 900) % (W + 600)) - 300} ${90 + i * 70})`}
          opacity={0.9}>
          <path d="M -110 20 q 10 -40 54 -34 q 14 -38 66 -30 q 34 -22 58 10 q 44 -8 46 28 q 24 6 18 26 l -242 0 z"
            fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 遠くの町並み */}
      <g opacity={0.45}>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={i * 200 - 40} y={700 - rnd(81, i) * 60} width={170} height={160}
              fill="#B0A488" stroke={C.ink} strokeWidth={4} />
            <polygon points={`${i * 200 - 60},${700 - rnd(81, i) * 60} ${i * 200 + 45},${640 - rnd(81, i) * 60} ${i * 200 + 150},${700 - rnd(81, i) * 60}`}
              fill="#8A7E66" stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 地面 */}
      <rect x={-20} y={840} width={W + 40} height={260} fill={C.roadSand} />
      <line x1={-20} y1={840} x2={W + 20} y2={840} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={rnd(83, i) * W} cy={880 + rnd(83, i + 9) * 170}
          rx={12 + rnd(83, i + 4) * 14} ry={6} fill={KRP.grayDark} opacity={0.5} />
      ))}
      {/* 高札場: 柱・屋根・板 */}
      <rect x={330} y={300} width={44} height={560} fill={C.sajikiDark} stroke={C.ink} strokeWidth={7} />
      <rect x={1546} y={300} width={44} height={560} fill={C.sajikiDark} stroke={C.ink} strokeWidth={7} />
      <rect x={420} y={290} width={1080} height={560} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={9} />
      <g stroke={C.ink} strokeWidth={3.4} opacity={0.3}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={420} y1={380 + i * 100} x2={1500} y2={380 + i * 100} />
        ))}
      </g>
      {/* 屋根 */}
      <polygon points="250,300 960,180 1670,300 1670,250 960,130 250,250"
        fill="#6E5434" stroke={C.ink} strokeWidth={7} />
      <polygon points="250,300 960,180 1670,300 1600,322 960,210 320,322"
        fill="#8A6A42" stroke={C.ink} strokeWidth={6} />
      {/* 手配書 6枚 (1枚→パパパッ) */}
      {sheets.map((sh, i) => (
        <Tehaisho key={i} f={f} who={sh.who} x={sh.x} y={sh.y} s={0.6}
          t={i === 0 ? 1 : seg(f, sh.at, sh.at + 6)} />
      ))}
      {/* 見物人 (手前の影) */}
      <PersonMini x={240} y={1095} s={1.5} color="#4A4238" f={f} phase={2} face="none" />
      <PersonMini x={1700} y={1100} s={1.6} color="#3A3E48" f={f} phase={5} face="none" />
      <PersonMini x={1520} y={1070} s={1.25} color="#5A5248" f={f} phase={8} face="none" arms="up" />
      {/* ざわめき */}
      <Notes f={f} x={250} y={960} n={2} spread={160} s={0.7} seed={12} />
      <Notes f={f} x={1640} y={980} n={2} spread={160} s={0.7} seed={13} />
    </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #25 今日は、この犯人たちを、年代順に逮捕していきます。
// 格: 山 / seed 1024
// 絵: 年表の道の上に手配書が年代順に立ち、先頭で捕縄と提灯を持った案内人が歩き出す。逮捕行脚の出発
// どこ: 夜明けの街道。手配書が道しるべのように年代順に立ち並ぶ
// 演出: 朝日に向かう道 = これからの旅程。先頭の案内人が御用提灯と捕縄を持って歩き出す
// 動き: 手配書が手前から順にパタパタ立つ → 道に点線の矢印が走る → 案内人が一歩ずつ進む
const Sg025: React.FC<{ f: number }> = ({ f }) => {
  const sunT = easeOut(seg(f, 0, 36));           // 朝日が少し昇る
  const walkT = easeOut(seg(f, 10, 42));         // 案内人が歩き出す
  const routeT = easeOut(seg(f, 20, 40));        // 道の点線矢印
  const gx = 290 + walkT * 110;                  // 案内人の足元x
  const gy = 955;
  const poleSway = Math.sin(f / 11) * 2.2;
  // 手配書 6枚: 手前 (大) → 奥 (小)。年代順 who=1..6
  const posts: Array<[number, number, number]> = [
    [775, 592, 0.55], [1010, 568, 0.45], [1195, 550, 0.37],
    [1345, 540, 0.30], [1460, 532, 0.25], [1555, 527, 0.21],
  ];
  return (
    <Frame f={f} seed={1024}>
      <g transform={zoomAt(1 + 0.05 * easeOut(seg(f, 0, 42)), 760, 680)}>
        {/* 夜明けの空 (上は夜の名残り・下は朝焼け) */}
        <rect x={-60} y={-60} width={2040} height={420} fill={C.dawnTop} />
        <rect x={-60} y={320} width={2040} height={160} fill="#7A6A78" />
        <rect x={-60} y={450} width={2040} height={160} fill={C.dawnLow} />
        {/* 朝日 (右の地平から昇る) */}
        <g transform={`translate(1560 ${600 - sunT * 52})`}>
          <circle r={150} fill={C.glowWarm} opacity={0.3 + Math.sin(f / 9) * 0.06} />
          <circle r={86} fill="#F6CE6B" stroke={C.ink} strokeWidth={6} />
          <g stroke="#F6CE6B" strokeWidth={7} opacity={0.75} transform={`rotate(${f / 5})`}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={0} y1={-108} x2={0} y2={-142}
                transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
        {/* 遠くの山なみと町影 */}
        <path d="M -60 560 L 180 462 L 420 548 L 650 478 L 900 556 L 1180 500 L 1500 556 L 1920 520 L 1980 560 Z"
          fill="#45527A" opacity={0.85} />
        <g fill="#38445F" opacity={0.9}>
          <rect x={120} y={520} width={46} height={44} />
          <path d="M 108 522 L 143 498 L 178 522 Z" />
          <rect x={250} y={530} width={38} height={36} />
          <path d="M 240 532 L 269 512 L 298 532 Z" />
        </g>
        {/* 朝の雲 (ゆっくり流れる) */}
        {Array.from({ length: 3 }, (_, i) => {
          const cx = ((260 + i * 560 + f * (0.5 + i * 0.2)) % 2100) - 90;
          return (
            <g key={i} transform={`translate(${cx} ${150 + i * 90})`} opacity={0.5}>
              <ellipse rx={120} ry={26} fill="#C9B9C4" />
              <ellipse cx={70} cy={-12} rx={70} ry={20} fill="#C9B9C4" />
            </g>
          );
        })}
        {/* 渡り鳥 */}
        {Array.from({ length: 3 }, (_, i) => (
          <path key={i}
            d="M -16 0 Q 0 -12 0 0 Q 0 -12 16 0"
            transform={`translate(${1200 - f * 2.4 - i * 70} ${180 + i * 36 + Math.sin((f + i * 9) / 7) * 6})`}
            fill="none" stroke={C.ink} strokeWidth={5} opacity={0.8} />
        ))}
        {/* 野原 (地面。草の色むらを敷く) */}
        <rect x={-60} y={556} width={2040} height={600} fill="#A8A062" />
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={rnd(31, i) * 1920} cy={600 + rnd(32, i) * 440}
            rx={90 + rnd(33, i) * 130} ry={16 + rnd(34, i) * 22}
            fill={C.matsu} opacity={0.14 + rnd(35, i) * 0.1} />
        ))}
        {/* 街道 (左手前から朝日の方へうねる) */}
        <path d={`M 40 1120 Q 300 870 560 760 Q 900 630 1180 596 Q 1400 572 1520 568
                  L 1530 590 Q 1380 600 1150 630 Q 880 668 640 800 Q 420 920 330 1120 Z`}
          fill={C.roadSand} stroke={C.ink} strokeWidth={6} />
        {/* 道の縁の石と草 */}
        {Array.from({ length: 8 }, (_, i) => {
          const t = i / 7;
          const sx = lerp(300, 1480, t) + (rnd(41, i) - 0.5) * 50;
          const sy = lerp(880, 585, t);
          const ss = lerp(1, 0.3, t);
          return (
            <g key={i} transform={`translate(${sx} ${sy}) scale(${ss})`}>
              <ellipse rx={18} ry={11} fill="#8C8470" stroke={C.ink} strokeWidth={3.5} />
            </g>
          );
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const t = i / 6;
          const sx = lerp(180, 1430, t) + (rnd(51, i) - 0.5) * 90;
          const sy = lerp(980, 600, t) + rnd(52, i) * 30;
          const ss = lerp(1.2, 0.35, t);
          const sw = Math.sin((f + i * 13) / 8) * 7;
          return (
            <g key={i} transform={`translate(${sx} ${sy}) scale(${ss})`}
              stroke={C.matsu} strokeWidth={4.5} fill="none" opacity={0.85}>
              <path d={`M 0 0 Q ${-8 + sw} -26 ${-14 + sw} -44`} />
              <path d={`M 0 0 Q ${2 + sw} -30 ${sw} -52`} />
              <path d={`M 0 0 Q ${10 + sw} -24 ${16 + sw} -40`} />
            </g>
          );
        })}
        {/* 旅程の点線矢印 (年代順に奥へ) */}
        <g opacity={routeT}>
          <path d="M 430 860 Q 700 712 980 656 Q 1140 626 1258 606"
            fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round"
            strokeDasharray="26 22" strokeDashoffset={1100 * (1 - routeT) - f * 1.5} />
          <path d="M 1222 628 L 1272 604 L 1238 578"
            fill="none" stroke={KRP.red} strokeWidth={9}
            strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* 手配書の立て札 (年代順 手前→奥) */}
        {posts.map(([px, py, ps], i) => {
          const t = seg(f, 4 + i * 3, 10 + i * 3);
          const halfH = 226 * ps;
          return (
            <g key={i}>
              <rect x={px - 9 * ps} y={py + halfH - 6}
                width={18 * ps} height={92 * ps} fill={C.sajikiDark}
                stroke={C.ink} strokeWidth={4.5} opacity={easeOut(t)} />
              <ellipse cx={px} cy={py + halfH + 88 * ps} rx={60 * ps} ry={12 * ps}
                fill={C.ink} opacity={0.18 * easeOut(t)} />
              <Tehaisho f={f} who={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6}
                x={px} y={py} s={ps} t={t} />
            </g>
          );
        })}
        {/* 案内人 (御用提灯と捕縄を持って出発) */}
        <ellipse cx={gx} cy={gy + 10} rx={150} ry={26} fill={C.ink} opacity={0.16} />
        {/* 提灯の竿 (手元から前上へ) */}
        <g transform={`rotate(${poleSway} ${gx + 60} ${gy - 200})`}>
          <line x1={gx + 44} y1={gy - 168} x2={gx + 196} y2={gy - 560}
            stroke={C.sajikiDark} strokeWidth={11} strokeLinecap="round" />
          <Chochin x={gx + 186} y={gy - 566} s={0.92} f={f} phase={3}
            body="#F0E8D2" text="御用" />
        </g>
        <Person x={gx} y={gy} s={1.58} f={f} pose="hold" face="smile"
          cloth={C.kimonoBlue} clothDark="#3A5570" gaze={[2, -1]} />
        {/* 捕縄 (腰の縄束。先がゆれる) */}
        <g transform={`translate(${gx - 78} ${gy - 182})`}>
          <circle r={34} fill="none" stroke="#B48A4C" strokeWidth={9} />
          <circle r={20} fill="none" stroke="#B48A4C" strokeWidth={8} />
          <path d={`M -6 30 Q ${-18 + Math.sin(f / 7) * 8} 74 ${-2 + Math.sin(f / 7) * 14} 104`}
            fill="none" stroke="#B48A4C" strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 歩き出しの土ぼこり */}
        {Array.from({ length: 3 }, (_, i) => {
          const p = ((f + i * 14) % 40) / 40;
          return (
            <circle key={i} cx={gx - 120 - p * 60 - i * 26} cy={gy - 8 - p * 24}
              r={(10 + i * 4) * (1 - p)} fill="#C9B88C" opacity={(1 - p) * 0.6 * walkT} />
          );
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_013: (f) => <Sg013 f={f} />,
  sg_014: (f) => <Sg014 f={f} />,
  sg_015: (f) => <Sg015 f={f} />,
  sg_016: (f) => <Sg016 f={f} />,
  sg_017: (f) => <Sg017 f={f} />,
  sg_018: (f) => <Sg018 f={f} />,
  sg_019: (f) => <Sg019 f={f} />,
  sg_020: (f) => <Sg020 f={f} />,
  sg_021: (f) => <Sg021 f={f} />,
  sg_022: (f) => <Sg022 f={f} />,
  sg_023: (f) => <Sg023 f={f} />,
  sg_024: (f) => <Sg024 f={f} />,
  sg_025: (f) => <Sg025 f={f} />,
};

export const S_AB_MOTIFS: string[] = [
  "sg_013", // #13
  "sg_014", // #14
  "sg_015", // #15
  "sg_016", // #16
  "sg_017", // #17
  "sg_018", // #18
  "sg_019", // #19
  "sg_020", // #20
  "sg_021", // #21
  "sg_022", // #22
  "sg_023", // #23
  "sg_024", // #24
  "sg_025", // #25
];

export const saigoAbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
