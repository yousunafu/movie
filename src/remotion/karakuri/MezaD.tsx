// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#73〜#84 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, Flame, mixColor, skyColors, BANNIN_CLOCK,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  tunic: "#8A6A48",
  tunicDark: "#6B5034",
  robe: "#F4F0E6",
  robeShade: "#D9D2C2",
  hairBrown: "#8A5A34",
  hairWhite: "#ECE8E0",
  hairGray: "#A9A39A",
  hairDark: "#4A3A30",
  roomStone: "#5A5452",
  roomStoneDark: "#423D3D",
  roomStoneLight: "#6E6764",
  floorDark: "#4E3B2A",
  floorDarkLine: "#3A2B1E",
  greek: "#E6DFCD",
  greekShade: "#C9C0AA",
  olive: "#7E9A55",
  oliveDark: "#5C7640",
  terra: "#C7764A",
  terraDark: "#9A5434",
  paperOld: "#EFE4C6",
  paperLine: "#BFB18E",
  draft: "#EAF1F0",
  draftGrid: "#C8DCDF",
  pencil: "#5E5E66",
  sweater: "#8C9096",
  sweaterDark: "#6E727A",
  desk: "#C39A6B",
  deskDark: "#9A7446",
  timber: "#5C4030",
  plaster: "#EADFC8",
  plasterShade: "#D3C6AA",
  womanRed: "#C2504A",
  womanRedDark: "#963A36",
  pink: "#E59AA6",
  hood: "#F2EEE4",
  bronze: "#B07A3E",
  labWall: "#DCE3DA",
  sash: "#4A78B8",
  waterLine: "#5E9BC2",
  sparkle: "#FFF1A8",
  bird: "#5A5560",
  cloth: "#9E3B3B",
  skin: "#F6E2D0",
  sandal: "#8A5A34",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void XMark; void Arrow;
void Maru; void MaruBatsu;
void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void KoujouMon; void MachiNami; void KnockerUp; void Clocky; void NazoBell;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
const INK = KRP.ink;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
// 点 (px,py) を中心に z 倍 (カメラ)。px,py は z=1 でも動かない点
const zoomAt = (z: number, px: number, py: number) => `translate(${px} ${py}) scale(${z}) translate(${-px} ${-py})`;
// 画面中央 (960,540) に (cx,cy) を写して z 倍
const camC = (z: number, cx: number, cy: number) => `translate(960 540) scale(${z}) translate(${-cx} ${-cy})`;

// 石積みの壁 (段ごとに目地をずらす)
const MzDStone: React.FC<{ x: number; y: number; w: number; h: number; sh?: number; base: string; dark: string; light: string; seed?: number; sw?: number }> = ({
  x, y, w, h, sh = 70, base, dark, light, seed = 1, sw = 4,
}) => {
  const rows = Math.ceil(h / sh);
  const cid = "mzdst" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g clipPath={`url(#${cid})`}>
      <defs><clipPath id={cid}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
      <rect x={x} y={y} width={w} height={h} fill={base} />
      {Array.from({ length: rows }, (_, r) => {
        const off = (r % 2) * 70 + rnd(seed, r) * 30;
        const n = Math.ceil(w / 150) + 2;
        return Array.from({ length: n }, (_, k) => {
          const bx = x - 150 + off + k * 150;
          const v = rnd(seed + 3, r * 40 + k);
          return (
            <rect key={`${r}-${k}`} x={bx + 3} y={y + r * sh + 3} width={144} height={sh - 6} rx={8}
              fill={v < 0.3 ? dark : v > 0.75 ? light : base} stroke={dark} strokeWidth={sw} opacity={0.95} />
          );
        });
      })}
    </g>
  );
};

// 歯車 (歯つき)
const MzDGear: React.FC<{ cx: number; cy: number; r: number; n: number; rot: number; fill?: string }> = ({ cx, cy, r, n, rot, fill = MP.brassDark }) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={cx - r * 0.2} y={cy - r - r * 0.3} width={r * 0.4} height={r * 0.45} fill={fill} stroke={INK} strokeWidth={2}
        transform={`rotate(${(i * 360) / n} ${cx} ${cy})`} />
    ))}
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={INK} strokeWidth={2.5} />
    {[0, 60, 120].map((a) => (
      <line key={a} x1={cx - Math.cos((a * Math.PI) / 180) * r * 0.75} y1={cy - Math.sin((a * Math.PI) / 180) * r * 0.75}
        x2={cx + Math.cos((a * Math.PI) / 180) * r * 0.75} y2={cy + Math.sin((a * Math.PI) / 180) * r * 0.75} stroke={INK} strokeWidth={2} />
    ))}
    <circle cx={cx} cy={cy} r={r * 0.28} fill={MP.iron} stroke={INK} strokeWidth={2} />
  </g>
);

// 火花 (4つ角の星)
const MzDSpark: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number }> = ({ x, y, s = 1, o = 1, rot = 0 }) => (
  o <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <path d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z" fill={C.sparkle} stroke="#D9A02C" strokeWidth={2} />
    </g>
  )
);

// くっきりした鐘の音の線 (実線の弧+放射の短線)
const MzDRing: React.FC<{ x: number; y: number; r?: number; amt: number; f: number; color?: string; w?: number }> = ({ x, y, r = 50, amt, f, color = INK, w = 6 }) => {
  if (amt <= 0.02) return null;
  const pulse = (Math.floor(f / 3) % 2) * 8;
  return (
    <g opacity={clamp01(amt * 1.4)} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round">
      {[-1, 1].map((sd) => [0, 1, 2].map((k) => {
        const rr = r + k * 26 + pulse;
        return <path key={`${sd}${k}`} d={`M ${x + sd * rr * 0.6} ${y - rr * 0.8} Q ${x + sd * rr * 1.05} ${y} ${x + sd * rr * 0.6} ${y + rr * 0.8}`} />;
      }))}
      {[-60, -30, 0, 30, 60].map((a, k) => {
        const rad = ((a - 90) * Math.PI) / 180;
        const r0 = r * 0.9 + pulse * 0.6, r1 = r0 + 22;
        return <line key={k} x1={x + Math.cos(rad) * r0} y1={y + Math.sin(rad) * r0} x2={x + Math.cos(rad) * r1} y2={y + Math.sin(rad) * r1} />;
      })}
    </g>
  );
};

// 点線の丸の「?」(「とされる」「うわさ」の印)
const MzDDotQ: React.FC<{ x: number; y: number; r?: number; t?: number; f?: number }> = ({ x, y, r = 36, t = 1, f = 0 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 12) * 3}) scale(${sc})`}>
      <circle r={r} fill={KRP.white} stroke={INK} strokeWidth={4} strokeDasharray="8 7" />
      <text y={r * 0.42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 1.25} fill={KRP.red}>？</text>
    </g>
  );
};

// ===== 15世紀の鉄の壁掛け目覚まし時計 (#73・#81〜#83)。BanninTou の中の鉄の時計と同じ作り =====
//   x,y = 文字盤の中心より上 (BanninTou と同じ原点。文字盤の中心は (0,38))
//   gear: 歯車の角度 / lift: ハンマーの持ち上がり 0〜1 / ring: 打つ 0〜1 / hand: 針の角度 (12時=0)
//   pin: ピンの角度 (null で無し) / pinOut: ピンが穴から浮いている量 / foliot: てんぷの振れ幅 (度) / wUp: おもりの巻き上げ 0〜1
const MZD_RIM = 54;
const MzDIronClock: React.FC<{
  x: number; y: number; s?: number; f: number; gear?: number; lift?: number; ring?: number; hand?: number;
  pin?: number | null; pinOut?: number; foliot?: number; wUp?: number; rope?: boolean;
}> = ({ x, y, s = 1, f, gear = 0, lift = 0, ring = 0, hand = 150, pin = null, pinOut = 0, foliot = 0, wUp = 0, rope = false }) => {
  const rg = clamp01(ring);
  const osc = rg > 0.02 ? Math.abs(Math.sin(f * 1.4)) * 26 * rg : 0;
  const hamRot = -18 + clamp01(lift) * 34 + osc;
  const shake = rg > 0.02 ? Math.sin(f * 3.3) * 2 * rg : 0;
  const fol = Math.sin(f / 7) * foliot;
  const wl = 190 - wUp * 70;
  const wr = 160 - wUp * 46;
  return (
    <g transform={`translate(${x + shake * s} ${y}) scale(${s})`}>
      {/* 掛け金具 (くぎに掛ける鉄の帯) */}
      <path d="M -72 -34 L 0 -164 L 72 -34" fill="none" stroke={MP.iron} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={0} cy={-166} r={7} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
      {/* おもり2つ (縄つき・石) */}
      <line x1={-36} y1={110} x2={-36} y2={wl} stroke="#B89A6A" strokeWidth={3.5} />
      <line x1={36} y1={110} x2={36} y2={wr} stroke="#B89A6A" strokeWidth={3.5} />
      {rope && <line x1={50} y1={118} x2={50} y2={150} stroke="#B89A6A" strokeWidth={3.5} />}
      <path d={`M -50 ${wl} L -22 ${wl} L -20 ${wl + 46} Q -36 ${wl + 54} -52 ${wl + 46} Z`} fill={MP.stoneDark} stroke={INK} strokeWidth={4} />
      <line x1={-46} y1={wl + 16} x2={-26} y2={wl + 14} stroke={INK} strokeWidth={2} opacity={0.5} />
      <path d={`M 22 ${wr} L 50 ${wr} L 52 ${wr + 46} Q 36 ${wr + 54} 20 ${wr + 46} Z`} fill={MP.stoneDark} stroke={INK} strokeWidth={4} />
      <line x1={26} y1={wr + 20} x2={46} y2={wr + 18} stroke={INK} strokeWidth={2} opacity={0.5} />
      {/* 枠の中 (暗い) と歯車 */}
      <rect x={-70} y={-20} width={140} height={136} fill="#2E3238" stroke={INK} strokeWidth={5} />
      <MzDGear cx={-38} cy={96} r={15} n={10} rot={gear} />
      <MzDGear cx={38} cy={98} r={11} n={8} rot={-gear * 1.36} fill={MP.brass} />
      <MzDGear cx={-50} cy={6} r={12} n={8} rot={-gear * 1.2} />
      <MzDGear cx={50} cy={4} r={10} n={7} rot={gear * 1.5} fill={MP.brass} />
      {/* 四隅の柱 */}
      {[-70, 70].map((px) => (
        <g key={px}>
          <rect x={px - 8} y={-36} width={16} height={156} fill={MP.iron} stroke={INK} strokeWidth={4} />
          <path d={`M ${px - 10} -36 L ${px} -60 L ${px + 10} -36 Z`} fill={MP.iron} stroke={INK} strokeWidth={3.5} />
          <circle cx={px} cy={-62} r={5} fill={MP.ironLight} stroke={INK} strokeWidth={2.5} />
          <line x1={px - 3} y1={-30} x2={px - 3} y2={110} stroke={MP.ironLight} strokeWidth={2} opacity={0.6} />
        </g>
      ))}
      <rect x={-82} y={112} width={164} height={14} fill={MP.iron} stroke={INK} strokeWidth={4} />
      <rect x={-80} y={-34} width={160} height={12} fill={MP.iron} stroke={INK} strokeWidth={4} />
      {/* 文字盤のふち (穴が24個) */}
      <circle cx={0} cy={38} r={60} fill={MP.iron} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        return <circle key={i} cx={Math.sin(a) * MZD_RIM} cy={38 - Math.cos(a) * MZD_RIM} r={2.6} fill="#15171A" />;
      })}
      {/* 文字盤 (針1本) */}
      <circle cx={0} cy={38} r={48} fill="#E9E2CF" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={Math.sin(a) * 36} y1={38 - Math.cos(a) * 36} x2={Math.sin(a) * 44} y2={38 - Math.cos(a) * 44} stroke={INK} strokeWidth={i % 3 ? 2.5 : 4.5} />;
      })}
      <path d="M -3.5 44 L 0 -2 L 3.5 44 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" transform={`rotate(${hand} 0 38)`} />
      <circle cx={0} cy={38} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />
      {/* ピン */}
      {pin !== null && (() => {
        const a = (pin * Math.PI) / 180;
        const px = Math.sin(a) * MZD_RIM, py = 38 - Math.cos(a) * MZD_RIM;
        return (
          <g>
            <circle cx={px + 2 + pinOut * 0.6} cy={py + 3 + pinOut * 0.6} r={5} fill="#000" opacity={0.35} />
            <line x1={px} y1={py} x2={px - pinOut * 0.5} y2={py - pinOut} stroke={MP.ironLight} strokeWidth={4} />
            <circle cx={px - pinOut * 0.5} cy={py - pinOut} r={5.5} fill={MP.brassLight} stroke={INK} strokeWidth={2.5} />
          </g>
        );
      })()}
      {/* てんぷ (上の横棒) */}
      <line x1={0} y1={-34} x2={0} y2={-74} stroke={MP.iron} strokeWidth={6} />
      <g transform={`rotate(${fol} 0 -64)`}>
        <rect x={-66} y={-68} width={132} height={8} rx={3} fill={MP.iron} stroke={INK} strokeWidth={3} />
        <rect x={-66} y={-74} width={14} height={20} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
        <rect x={52} y={-74} width={14} height={20} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
      </g>
      {/* 椀形のベルとハンマー */}
      <line x1={0} y1={-74} x2={0} y2={-92} stroke={MP.iron} strokeWidth={6} />
      <path d="M -34 -96 Q -32 -134 0 -136 Q 32 -134 34 -96 Z" fill={MP.brass} stroke={INK} strokeWidth={5} />
      <path d="M -22 -104 Q -20 -124 -6 -128" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${hamRot} 74 -40)`}>
        <line x1={74} y1={-40} x2={40} y2={-112} stroke={MP.iron} strokeWidth={6} strokeLinecap="round" />
        <circle cx={38} cy={-116} r={10} fill={MP.iron} stroke={INK} strokeWidth={3.5} />
      </g>
      <circle cx={74} cy={-40} r={6} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
    </g>
  );
};

// ===== 寝ている人 (Person を -90° 回して頭を左に)。x,y = 足元。頭の中心は (x − 228s, y) =====
const MzDSleeper: React.FC<{ x: number; y: number; s: number; f: number; face?: Face; cloth: string; clothDark: string; sleep?: boolean; cap?: boolean; phase?: number }> = ({
  x, y, s, f, face = "normal", cloth, clothDark, sleep = true, cap = false, phase = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(-90)`}>
    <Person x={0} y={0} s={s} f={f} face={face} cloth={cloth} clothDark={clothDark} still phase={phase} />
    {sleep && (
      <g transform={`scale(${s})`}>
        {[-24, 24].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <path d={`M ${ex - 12} -220 Q ${ex} -212 ${ex + 12} -220`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          </g>
        ))}
      </g>
    )}
    {cap && (
      <g transform={`scale(${s})`}>
        <path d="M -64 -246 Q -60 -300 0 -300 Q 50 -298 96 -330 Q 84 -280 64 -246 Z" fill={KRP.white} stroke={INK} strokeWidth={4.5} />
        <circle cx={98} cy={-332} r={12} fill={KRP.white} stroke={INK} strokeWidth={4} />
      </g>
    )}
  </g>
);

// ===== 昔の人 (古代ギリシャ・中世)。Person に衣・髪・ひげを足す =====
//   back: 後ろ姿 (頭を髪でおおう。実在の人物用) / female: 茶色の長い髪+結んだ房 (+長い衣)
//   robe: "knee" ひざ丈 / "ankle" くるぶし丈 / beard: ひげの長さ (0で無し)
const MzDOld: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; face?: Face; pose?: Pose; pointDir?: 1 | -1; lean?: number;
  cloth?: string; clothDark?: string; robe?: "knee" | "ankle"; robeColor?: string; sash?: string;
  female?: boolean; back?: boolean; hairColor?: string; beard?: number; beardColor?: string; hood?: boolean; children?: React.ReactNode;
}> = ({
  x, y, s, f, phase = 0, face = "normal", pose = "stand", pointDir = 1, lean = 0,
  cloth = C.robe, clothDark = C.robeShade, robe = "knee", robeColor, sash, female = false, back = false,
  hairColor, beard = 0, beardColor = C.hairDark, hood = false, children,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const rc = robeColor ?? cloth;
  const hc = hairColor ?? (female ? C.hairBrown : INK);
  const by = robe === "knee" ? -30 : -12;
  const bw = robe === "knee" ? 68 : 76;
  return (
    <g transform={`rotate(${lean} ${x} ${y})`}>
      {/* 後ろの髪 (女性: 結んだ房) */}
      {female && !back && (
        <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
          <circle cx={46} cy={-284} r={26} fill={hc} stroke={INK} strokeWidth={4} />
          <path d="M 58 -270 Q 100 -226 78 -160 Q 70 -150 60 -164 Q 78 -214 46 -262 Z" fill={hc} stroke={INK} strokeWidth={4} />
        </g>
      )}
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} pointDir={pointDir} cloth={cloth} clothDark={clothDark}
        hair={female || back || hood ? "none" : "cap"} phase={phase} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 衣 (脚の上半分〜全部をおおう) */}
        <path d={`M -58 -70 L 58 -70 L ${bw} ${by} Q 0 ${by + 8} ${-bw} ${by} Z`} fill={rc} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <path d={`M -20 -62 L -26 ${by} M 18 -62 L 24 ${by}`} stroke={INK} strokeWidth={2.5} opacity={0.35} />
        {sash && <path d="M -56 -158 L -30 -160 L 58 -78 L 58 -58 Z" fill={sash} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />}
        {/* 女性の前髪と左右に垂らした髪 */}
        {female && !back && (
          <g fill={hc} stroke={INK} strokeWidth={3.5}>
            <path d="M -62 -240 Q -64 -294 0 -296 Q 64 -294 62 -240 Q 30 -264 0 -264 Q -30 -264 -62 -240 Z" />
            <path d="M -62 -244 Q -76 -200 -62 -156 L -46 -162 Q -56 -204 -50 -240 Z" />
            <path d="M 62 -244 Q 76 -200 62 -156 L 46 -162 Q 56 -204 50 -240 Z" />
          </g>
        )}
        {/* 頭巾 */}
        {hood && (
          <g>
            <path d="M -70 -226 Q -74 -304 0 -306 Q 74 -304 70 -226 Q 72 -180 60 -170 L 48 -176 Q 56 -220 44 -252 Q 0 -270 -44 -252 Q -56 -220 -48 -176 L -60 -170 Q -72 -180 -70 -226 Z"
              fill={C.pink} stroke={INK} strokeWidth={4} />
            <path d="M -44 -250 Q -20 -268 0 -250 Q 20 -268 44 -250 M -46 -246 Q -54 -210 -48 -178 M 46 -246 Q 54 -210 48 -178" stroke={C.hairBrown} strokeWidth={12} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* 男性の髪の色 (白髪など) */}
        {!female && !back && !hood && hairColor && (
          <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={hairColor} stroke={INK} strokeWidth={3} />
        )}
        {/* ひげ (口の下から) */}
        {beard > 0 && !back && (
          <path d={`M -46 -204 Q -50 -164 0 ${-166 + beard} Q 50 -164 46 -204 Q 32 -174 0 -174 Q -32 -174 -46 -204 Z`} fill={beardColor} stroke={INK} strokeWidth={3.5} />
        )}
        {/* 後ろ姿 (古代ギリシャの年配の男性): 肩にかけた衣で肩幅を広く・頭頂の少しはげた頭・
            首までの短い白髪・左右の耳・横からのぞく白ひげの先。顔の部品は描かない */}
        {back && (
          <g>
            {/* 肩にかけた衣 (ヒマティオン)。肩幅を広く見せる */}
            <path d="M -92 -112 Q -100 -150 -70 -166 Q 0 -184 70 -166 Q 100 -150 92 -112 Q 60 -128 0 -130 Q -60 -128 -92 -112 Z" fill={C.robe} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -60 -160 Q -50 -142 -30 -134 M 0 -168 L 0 -132 M 60 -160 Q 50 -142 30 -134" stroke={INK} strokeWidth={2.5} opacity={0.35} fill="none" />
            {/* 耳 (後ろから見える左右の耳) */}
            <ellipse cx={-66} cy={-228} rx={10} ry={16} fill={C.skin} stroke={INK} strokeWidth={3.5} />
            <ellipse cx={66} cy={-228} rx={10} ry={16} fill={C.skin} stroke={INK} strokeWidth={3.5} />
            {/* 横からのぞく白ひげの先 (あごの左右から外へ) */}
            {beard > 0 && (
              <g fill={beardColor} stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
                <path d="M -48 -198 Q -72 -196 -80 -176 Q -78 -158 -66 -150 Q -70 -164 -62 -170 Q -60 -182 -46 -184 Z" />
                <path d="M 48 -198 Q 72 -196 80 -176 Q 78 -158 66 -150 Q 70 -164 62 -170 Q 60 -182 46 -184 Z" />
              </g>
            )}
            {/* 頭 (後頭部。頭頂は肌が見える) */}
            <circle cx={0} cy={-232} r={64} fill={C.skin} stroke={INK} strokeWidth={5} />
            {/* はげた頭頂のつや */}
            <path d="M -30 -276 Q -4 -292 22 -284" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.9} />
            {/* 首までの短い白髪 (頭頂を残して横と後ろだけ。すそは首のあたりで短くそろう) */}
            <path d="M -64 -236 Q -62 -258 -46 -264 Q -22 -246 0 -246 Q 22 -246 46 -264 Q 62 -258 64 -236 Q 66 -206 52 -182 q -9 8 -17 0 q -9 9 -18 1 q -9 8 -17 0 q -9 8 -18 -1 q -9 8 -17 0 q -9 7 -17 -1 Q -66 -206 -64 -238 Z"
              fill={hc} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -50 -238 q -3 12 2 24 M -30 -236 q -2 14 2 28 M -10 -234 q -1 14 1 30 M 10 -234 q 1 14 -1 30 M 30 -236 q 2 14 -2 28 M 50 -238 q 3 12 -2 24" stroke={C.hairGray} strokeWidth={3} fill="none" strokeLinecap="round" />
            {/* 衣のひだ (くるぶしまでの長衣) */}
            <path d="M -44 -60 L -52 -16 M -6 -62 L -8 -12 M 32 -62 L 40 -14 M 56 -66 L 66 -16" stroke={INK} strokeWidth={2.5} opacity={0.3} fill="none" />
          </g>
        )}
        {children}
      </g>
      {/* 後ろ姿のサンダル (かかとと革ひも)。足は地面に固定 */}
      {back && (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          {[-26, 26].map((fx) => (
            <g key={fx}>
              <ellipse cx={fx} cy={2} rx={24} ry={9} fill={C.sandal} stroke={INK} strokeWidth={3.5} />
              <path d={`M ${fx - 16} 0 Q ${fx - 18} -18 ${fx} -20 Q ${fx + 18} -18 ${fx + 16} 0 Z`} fill={C.skin} stroke={INK} strokeWidth={3.5} />
              <path d={`M ${fx - 17} -8 L ${fx + 17} -8 M ${fx - 14} -15 L ${fx + 14} -15`} stroke={C.sandal} strokeWidth={4} strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #73 第3章、機械が、起こしはじめる。
// 格: 山 / seed 6073
// 絵: 章扉。どこ: 15世紀ヨーロッパの民家の暗い寝室。石の壁・木のベッド・小窓の外に月。壁に鉄の壁掛け目覚まし時計 (鉄の枠・おもり2つ・上に小さなベル・文字盤の穴にピン)。演出: 時計の歯車が、f でガチリ、ガチリと回りはじめ、鉄のベルのハンマーがゆっくり持ち上がる。ベッドでは素朴な服の男性が寝ている。時計の歯車のすき間から小さな火花。ChapterDoor num=3 title="機械が、起こしはじめる。" を画面の右寄りに置き、時計とベッドは左寄り。カメラは寝室から時計へゆっくり寄る。動き: f0-90 歯車が回る / ハンマーが上がる / f120 カーンと一打ちしてベッドの男がびくっ
// どこ: 15世紀ヨーロッパの民家の暗い寝室。石の壁・小窓の月・木のベッド・壁のくぎに掛けた外套・床の木靴。左寄りにベッド、その右の壁に鉄の壁掛け目覚まし時計
// 演出: 章扉。時計の歯車がガチリ、ガチリと段をつけて回り、すき間から火花。鉄のハンマーがゆっくり持ち上がる (f45 で最上段)。f62 に一打ち → ベッドの男がびくっと跳ねる。題字は右寄り
// 動き: f0-90 カメラが寝室から時計へ寄る / f6〜 歯車が9コマに1段ずつ回る / f8-40 ハンマーが上がる / f62 カーン / f63-80 男がびくっ
const Mz073: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const z = lerp(1, 1.22, easeInOut(seg(f, 0, 90)));
  const tick = Math.floor(f / 9);
  const tf = seg(f % 9, 0, 3);
  const gear = f > 6 ? (tick + easeOut(tf)) * 20 : 0;
  const clickOn = f > 6 && f % 9 < 3;
  const strikeF = 62;
  const lift = easeOut(seg(f, 8, 40)) * (1 - seg(f, strikeF - 1, strikeF + 1));
  const ring = f >= strikeF ? 1 - seg(f, strikeF, 90) : 0;
  const jolt = f >= strikeF + 1 ? Math.sin(Math.PI * seg(f, strikeF + 1, strikeF + 13)) : 0;
  const awake = f >= strikeF + 1;
  const CX = 820, CY = 360, CS = 1.5;
  return (
    <Frame f={f} seed={6073} dark bg={C.roomStoneDark}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={3} title="機械が、起こしはじめる。" t={door} left={1000} top={560} />
      </>}>
      <g transform={zoomAt(z, 560, 400)}>
        {/* 石の壁 */}
        <MzDStone x={-200} y={-200} w={2400} h={1060} sh={78} base={C.roomStone} dark={C.roomStoneDark} light={C.roomStoneLight} seed={73} />
        {/* 小窓 (アーチ) と月 */}
        <path d="M 150 340 L 150 220 A 80 80 0 0 1 310 220 L 310 340 Z" fill={MP.nightDeep} stroke={INK} strokeWidth={6} />
        <circle cx={262} cy={210} r={30} fill="#FFF3C8" />
        <circle cx={276} cy={202} r={26} fill={MP.nightDeep} />
        {[[180, 250], [200, 180], [290, 290], [240, 300]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={2.6} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 8 + i * 2)} />
        ))}
        <line x1={230} y1={150} x2={230} y2={340} stroke={MP.iron} strokeWidth={6} />
        <rect x={136} y={336} width={188} height={18} fill={C.roomStoneLight} stroke={INK} strokeWidth={5} />
        {/* 月あかりの帯 */}
        <polygon points="150,350 310,350 640,860 360,860" fill={MP.mist} opacity={0.1} />
        {/* くぎに掛けた外套と帽子 */}
        <circle cx={470} cy={300} r={6} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
        <path d="M 470 302 Q 420 330 430 470 L 512 470 Q 520 330 470 302 Z" fill={C.tunicDark} stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(f / 30) * 1.5} 470 302)`} />
        {/* 床 */}
        <rect x={-200} y={850} width={2400} height={400} fill={C.floorDark} />
        <g stroke={C.floorDarkLine} strokeWidth={4}>
          {[900, 960, 1040].map((ly) => <line key={ly} x1={-200} y1={ly} x2={2200} y2={ly} />)}
        </g>
        <line x1={-200} y1={850} x2={2200} y2={850} stroke={INK} strokeWidth={5} />
        {/* ベッド (木) */}
        <rect x={96} y={560} width={34} height={300} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <circle cx={113} cy={556} r={16} fill={MP.wood} stroke={INK} strokeWidth={4} />
        <rect x={680} y={680} width={30} height={180} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={120} y={730} width={580} height={70} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <line x1={130} y1={760} x2={690} y2={760} stroke={MP.woodDark} strokeWidth={3} />
        <rect x={124} y={712} width={570} height={30} rx={12} fill="#D8C9A2" stroke={INK} strokeWidth={4} />
        {/* 木靴 */}
        <path d="M 300 870 Q 300 846 340 848 L 380 852 Q 396 864 380 874 Z" fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <path d="M 400 880 Q 400 856 440 858 L 480 862 Q 496 874 480 884 Z" fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        {/* 寝ている男 (びくっ) */}
        <g transform={`translate(0 ${-46 * jolt})`}>
          <ellipse cx={320} cy={712} rx={90} ry={24} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <MzDSleeper x={560} y={672} s={0.95} f={f} face={awake ? "surprised" : "normal"} sleep={!awake} cap cloth={C.tunic} clothDark={C.tunicDark} />
          {/* 掛け布団 (継ぎあて) */}
          <path d="M 420 606 Q 470 590 560 596 Q 660 600 704 640 L 704 742 L 408 742 Q 396 680 420 606 Z" fill="#7C6A9A" stroke={INK} strokeWidth={6} />
          <rect x={540} y={640} width={80} height={56} fill="#9A88B6" stroke={INK} strokeWidth={3} strokeDasharray="6 5" />
          <path d="M 440 630 Q 470 660 450 730" stroke={INK} strokeWidth={3} opacity={0.3} fill="none" />
          {!awake && [0, 1, 2].map((k) => {
            const p = ((f + k * 14) % 42) / 42;
            return <text key={k} x={290 + p * 60 + k * 8} y={590 - p * 110} fontFamily={FONT} fontWeight={900} fontSize={30 + k * 8}
              fill={KRP.white} opacity={(1 - p) * 0.8}>z</text>;
          })}
          {awake && jolt > 0.05 && (
            <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
              <line x1={250} y1={560} x2={240} y2={520} /><line x1={300} y1={566} x2={320} y2={530} /><line x1={200} y1={580} x2={170} y2={556} />
            </g>
          )}
        </g>
        {/* 時計のまわりのぼんやりした光 */}
        <circle cx={CX} cy={CY + 30} r={230} fill={MP.glow} opacity={0.08 + (clickOn ? 0.04 : 0) + ring * 0.08} />
        {/* 鉄の壁掛け目覚まし時計 */}
        <MzDIronClock x={CX} y={CY} s={CS} f={f} gear={gear} lift={lift} ring={ring} hand={135} pin={165} foliot={14} />
        {/* 歯車のすき間の火花 (段ごとに) */}
        {clickOn && (
          <g>
            <MzDSpark x={CX - 38 * CS + 22} y={CY + 96 * CS - 20} s={0.8} rot={f * 20} />
            <MzDSpark x={CX + 38 * CS - 18} y={CY + 98 * CS - 16} s={0.6} rot={-f * 25} />
            <MzDSpark x={CX - 50 * CS + 18} y={CY + 6 * CS + 18} s={0.5} />
          </g>
        )}
        {/* ガチリの線 */}
        {clickOn && (
          <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
            <line x1={CX - 140} y1={CY + 150} x2={CX - 168} y2={CY + 140} />
            <line x1={CX - 140} y1={CY + 176} x2={CX - 170} y2={CY + 180} />
          </g>
        )}
        {/* 持ち上がっていくハンマーの「ため」の線 */}
        {lift > 0.6 && f < strikeF && (
          <path d={`M ${CX + 100} ${CY - 220} q 20 -14 40 0`} stroke={KRP.yellow} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 3)} />
        )}
        <MzDRing x={CX} y={CY - 175} r={60} amt={ring} f={f} color={MP.glow} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #74 では、機械の目覚ましは、いつからあるのか。
// 格: 並 / seed 6074
// 絵: どこ: 時代の古い順に目覚ましが並んだ、博物館の長い廊下風の展示通路 (石の床・壁のニッチ)。演出: 主役は手前の空っぽの台座。手前から奥へ、台座が並び、奥の方には (BellClock s=0.4 のような) 近代の目覚ましがぼんやり、中ほどに #73 の鉄の壁掛け時計がぼんやり見える。いちばん手前の、いちばん古い台座だけが空っぽで、そこに「?」の札が立ち、スポットライトが当たる。素朴な服の案内係 (男性) がランタンで台座を照らして首をかしげる。カメラは奥から手前の空の台座へ寄る (時代をさかのぼる)。動き: f0-60 奥から手前へ寄る / f60 スポットライト / f70-110 案内係が首をかしげる
// どこ: 目覚ましを時代の古い順に並べた博物館の長い展示通路 (石の床・石の壁・リブのある天井・赤い縄の仕切り・壁の額)。奥の台座に近代のベル式目覚まし、中ほどの台座に #73 の鉄の壁掛け時計がぼんやり
// 演出: いちばん手前の、いちばん古い台座だけが空っぽ。「?」の札が立ち、天井からスポットライト。素朴な服の案内係 (男性) がランタンで台座を照らして首をかしげる
// 動き: f0-30 カメラが奥 (近代) から手前 (空の台座) へ引いてくる = 時代をさかのぼる / f26-36 スポットライト / f34-44 首をかしげる / 以後ランタンゆれ・ゆっくり寄る
const Mz074: React.FC<{ f: number }> = ({ f }) => {
  const back = easeInOut(seg(f, 0, 30));
  const z0 = lerp(2.0, 1, back);
  const z1 = lerp(1, 1.06, easeInOut(seg(f, 40, 123)));
  const spot = easeOut(seg(f, 26, 36));
  const tilt = easeOut(seg(f, 34, 44));
  const wallL = "#B9B0A0", wallR = "#AEA595", ceil = "#8E8576", floorC = "#C9BFA9";
  const yTop = (x: number) => lerp(-100, 300, (x + 200) / 960);
  const yBot = (x: number) => lerp(1180, 560, (x + 200) / 960);
  const ped = (x: number, by: number, k: number, key: string) => (
    <g key={key}>
      <ellipse cx={x} cy={by + 4 * k} rx={100 * k} ry={16 * k} fill="#000" opacity={0.18} />
      <rect x={x - 70 * k} y={by - 220 * k} width={140 * k} height={220 * k} fill={MP.stoneLight} stroke={INK} strokeWidth={Math.max(3, 5 * k)} />
      <rect x={x - 86 * k} y={by - 244 * k} width={172 * k} height={28 * k} fill={MP.stone} stroke={INK} strokeWidth={Math.max(3, 5 * k)} />
      <rect x={x - 82 * k} y={by - 22 * k} width={164 * k} height={22 * k} fill={MP.stone} stroke={INK} strokeWidth={Math.max(3, 5 * k)} />
      <line x1={x - 40 * k} y1={by - 200 * k} x2={x - 40 * k} y2={by - 30 * k} stroke={MP.stoneDark} strokeWidth={3 * k} opacity={0.5} />
    </g>
  );
  return (
    <Frame f={f} seed={6074} bg={ceil}>
      <g transform={`${zoomAt(z1, 900, 520)} ${zoomAt(z0, 1000, 470)}`}>
        {/* 天井 (リブ) */}
        <polygon points="-200,-100 2120,-100 1160,300 760,300" fill={ceil} />
        {[0.25, 0.5, 0.7, 0.85].map((d, i) => {
          const xl = lerp(-200, 760, d), xr = lerp(2120, 1160, d), yt = lerp(-100, 300, d);
          return <path key={i} d={`M ${xl} ${yt} Q 960 ${yt - 120 * (1 - d)} ${xr} ${yt}`} stroke={MP.stoneDark} strokeWidth={8 * (1 - d) + 3} fill="none" />;
        })}
        {/* 左右の壁 */}
        <polygon points="-200,-100 760,300 760,560 -200,1180" fill={wallL} stroke={INK} strokeWidth={5} />
        <polygon points="2120,-100 1160,300 1160,560 2120,1180" fill={wallR} stroke={INK} strokeWidth={5} />
        {[0.2, 0.4, 0.6, 0.8].map((k) => (
          <g key={k} stroke={MP.stoneDark} strokeWidth={3} opacity={0.6}>
            <line x1={-200} y1={lerp(-100, 1180, k)} x2={760} y2={lerp(300, 560, k)} />
            <line x1={2120} y1={lerp(-100, 1180, k)} x2={1160} y2={lerp(300, 560, k)} />
          </g>
        ))}
        {[0.3, 0.55, 0.72, 0.85].map((d) => {
          const xl = lerp(-200, 760, d), xr = 1920 - xl;
          return (
            <g key={d} stroke={MP.stoneDark} strokeWidth={4} opacity={0.7}>
              <line x1={xl} y1={yTop(xl)} x2={xl} y2={yBot(xl)} />
              <line x1={xr} y1={yTop(xl)} x2={xr} y2={yBot(xl)} />
            </g>
          );
        })}
        {/* 壁の額 (中身はぼんやりした歯車の版画) */}
        {[[120, 300, 1], [560, 360, 0.55]].map(([fx, fy, k], i) => (
          <g key={i}>
            <polygon points={`${fx - 70 * k},${fy - 80 * k} ${fx + 70 * k},${fy - 50 * k} ${fx + 70 * k},${fy + 70 * k} ${fx - 70 * k},${fy + 90 * k}`} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
            <polygon points={`${fx - 54 * k},${fy - 62 * k} ${fx + 54 * k},${fy - 38 * k} ${fx + 54 * k},${fy + 56 * k} ${fx - 54 * k},${fy + 72 * k}`} fill={C.paperOld} />
            <MzDGear cx={fx} cy={fy + 6 * k} r={26 * k} n={9} rot={f * 0.5} fill={MP.stone} />
          </g>
        ))}
        {/* 奥の壁と出口のアーチ */}
        <rect x={760} y={300} width={400} height={260} fill="#9F9686" stroke={INK} strokeWidth={5} />
        <path d="M 900 560 L 900 440 A 60 60 0 0 1 1020 440 L 1020 560 Z" fill={MP.glow} opacity={0.7} stroke={INK} strokeWidth={4} />
        {/* 床 (石畳) */}
        <polygon points="-200,1180 760,560 1160,560 2120,1180" fill={floorC} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={760 + i * (400 / 6)} y1={560} x2={-200 + i * (2320 / 6)} y2={1180} stroke={MP.stoneDark} strokeWidth={3} opacity={0.6} />
        ))}
        {[590, 640, 720, 840, 1020].map((ly) => (
          <line key={ly} x1={lerp(760, -200, (ly - 560) / 620)} y1={ly} x2={lerp(1160, 2120, (ly - 560) / 620)} y2={ly} stroke={MP.stoneDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 奥: 近代のベル式目覚まし (ぼんやり) */}
        <g opacity={0.75}>
          {ped(1060, 600, 0.3, "far")}
          <BellClock x={1060} y={516} s={0.22} f={f} ring={0} />
        </g>
        {/* 中ほど: 鉄の壁掛け時計 (ぼんやり) */}
        <g opacity={0.8}>
          {ped(1290, 720, 0.6, "mid")}
          <MzDIronClock x={1290} y={510} s={0.42} f={f} gear={f * 2} hand={150} foliot={10} />
        </g>
        {/* 赤い縄の仕切り */}
        {[[700, 640, 0.5], [580, 700, 0.65], [400, 800, 0.85]].map(([sx, sy, k], i) => (
          <g key={i}>
            <rect x={sx - 6 * k} y={sy - 120 * k} width={12 * k} height={120 * k} fill={MP.brass} stroke={INK} strokeWidth={3} />
            <circle cx={sx} cy={sy - 124 * k} r={10 * k} fill={MP.brassLight} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <path d="M 700 582 Q 650 620 580 624 M 580 624 Q 500 680 400 698" stroke={KRP.red} strokeWidth={7} fill="none" />
        {/* まわりが少し暗くなる */}
        <rect x={-400} y={-300} width={2800} height={1700} fill={MP.nightDeep} opacity={0.32 * spot} />
        {/* スポットライト */}
        <polygon points="860,-100 940,-100 1110,520 690,520" fill={MP.glow} opacity={0.32 * spot} />
        <ellipse cx={900} cy={636} rx={180} ry={34} fill={MP.glow} opacity={0.4 * spot} />
        {/* 手前: 空っぽの台座 (いちばん古い) */}
        {ped(900, 880, 1.6, "near")}
        <ellipse cx={900} cy={496} rx={120} ry={16} fill="#000" opacity={0.12} />
        <line x1={900} y1={492} x2={900} y2={452} stroke={MP.woodDark} strokeWidth={6} />
        <g transform={`rotate(${Math.sin(f / 16) * 2} 900 492)`}>
          <TagPlate x={900} y={420} text="？" size={70} color={KRP.red} t={seg(f, 20, 30)} />
        </g>
        {/* 案内係 (男性) がランタンで照らして首をかしげる */}
        <g transform={`rotate(${-9 * tilt + Math.sin(f / 20) * 0.8} 1330 900)`}>
          <Person x={1330} y={900} s={1.1} f={f} pose="point" pointDir={-1} face={tilt > 0.3 ? "worried" : "normal"}
            cloth={C.tunic} clothDark={C.tunicDark} gaze={[-5, 2]} />
          {/* 前かけ */}
          <path d="M 1290 790 L 1370 790 L 1376 860 L 1284 860 Z" fill={C.plaster} stroke={INK} strokeWidth={4} />
          <g transform={`rotate(${Math.sin(f / 11) * 6} 1162 737)`}>
            <line x1={1162} y1={737} x2={1162} y2={762} stroke={MP.iron} strokeWidth={4} />
            <path d="M 1140 772 L 1162 756 L 1184 772 Z" fill={MP.iron} stroke={INK} strokeWidth={3} />
            <rect x={1140} y={772} width={44} height={56} fill="#F7E4B0" stroke={INK} strokeWidth={4} />
            <Flame x={1162} y={818} s={0.6} f={f} glow={1.4} />
            <rect x={1136} y={826} width={52} height={10} fill={MP.iron} stroke={INK} strokeWidth={3} />
          </g>
        </g>
        {tilt > 0.5 && <QMark x={1460} y={600} s={0.45} f={f} t={seg(f, 40, 46)} color={KRP.orange} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #75 よく元祖として名前が出るのが、古代ギリシャの哲学者、プラトンです。
// 格: 山 / seed 6075
// 絵: どこ: 古代ギリシャの夜の家の中庭。白い柱・オリーブの鉢・素焼きの水がめ・ランプの灯。演出: プラトン (実在の人物なので**顔を描かない**。白い衣の背中、長い髪とひげの後ろ姿) が中庭に立ち、巻物を片手に夜空を見上げている (腕は2本、pose で右手に巻物、左手は腰)。その背中の上に、#74 の「?」の札がふわりと飛んできて、くるっと回り、「元祖?」の小札に変わってプラトンの頭上に止まる。中庭の柱の陰で、古代ギリシャの一般の人2人 (白い衣・顔あり) がひそひそと指さす。カメラは中庭の引きからプラトンの背中へ寄る。動き: f0-40 札が飛んでくる / f40-60 くるっと回る / f60-120 寄り・ランプの炎
// どこ: 古代ギリシャの夜の家の中庭。白い柱の列・屋根の瓦の縁・石畳・オリーブの鉢・素焼きの水がめ・青銅のランプ台・月と星
// 演出: プラトン (顔を描かない。白い衣の背中、頭頂の少しはげた首までの短い白髪・横からのぞく白ひげの先・肩にかけた衣・サンダル) が中央に立ち、右手の巻物を掲げて夜空を見上げる。#74 の「?」札がふわりと飛んできてくるっと回り、「元祖？」の札に変わって頭上に止まる。左の柱の陰で一般の人2人 (男・女) がひそひそ指さす
// 動き: f0-28 札が弧を描いて飛ぶ / f28-40 くるっと一回転して文字が変わる / f30-150 カメラがプラトンの背中へ寄る / ランプの炎・星のまたたき・札のゆれ
const Mz075: React.FC<{ f: number }> = ({ f }) => {
  const fly = easeInOut(seg(f, 0, 28));
  const spin = seg(f, 28, 40);
  const px = lerp(-80, 960, fly);
  const py = lerp(140, 330, fly) - Math.sin(Math.PI * fly) * 120;
  const sx = Math.cos(spin * Math.PI * 2);
  const shown = spin > 0.25 ? "元祖？" : "？";
  const z = lerp(1, 1.16, easeInOut(seg(f, 30, 150)));
  const [skyT, skyB] = skyColors(0.05);
  const colX = [130, 470, 1450, 1790];
  return (
    <Frame f={f} seed={6075} dark bg={skyT}>
      <g transform={zoomAt(z, 960, 560)}>
        {/* 夜空 */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={-200} y={-200 + i * 70} width={2400} height={72} fill={mixColor(skyT, skyB, i / 7)} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={rnd(75, i) * 1900 + 10} cy={rnd(76, i) * 300 + 20} r={i % 4 === 0 ? 3.4 : 2.2} fill="#FFF6D8"
            opacity={0.45 + 0.55 * Math.abs(Math.sin(f / 10 + i * 1.3))} />
        ))}
        <circle cx={1640} cy={150} r={46} fill="#FFF3C8" />
        <circle cx={1622} cy={140} r={8} fill="#EADFB0" opacity={0.7} />
        <circle cx={1650} cy={166} r={6} fill="#EADFB0" opacity={0.7} />
        {/* 奥の家の壁と屋根の縁 */}
        <rect x={-200} y={360} width={2400} height={420} fill="#9C9585" />
        <rect x={-200} y={330} width={2400} height={40} fill={C.terraDark} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M ${-200 + i * 96} 370 q 48 26 96 0`} fill={C.terra} stroke={INK} strokeWidth={3} />
        ))}
        {/* 戸口 (奥の部屋の灯り) */}
        <rect x={820} y={480} width={280} height={300} fill="#5A4A3A" stroke={INK} strokeWidth={5} />
        <rect x={840} y={500} width={240} height={280} fill={MP.glow} opacity={0.35} />
        {/* 石畳 */}
        <rect x={-200} y={780} width={2400} height={500} fill="#BDB3A0" />
        {Array.from({ length: 5 }, (_, r) => (
          <g key={r}>
            <line x1={-200} y1={780 + r * 60} x2={2200} y2={780 + r * 60} stroke={MP.stoneDark} strokeWidth={3} />
            {Array.from({ length: 16 }, (_, k) => (
              <line key={k} x1={-150 + k * 150 + (r % 2) * 75} y1={780 + r * 60} x2={-150 + k * 150 + (r % 2) * 75} y2={840 + r * 60} stroke={MP.stoneDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        <line x1={-200} y1={780} x2={2200} y2={780} stroke={INK} strokeWidth={5} />
        {/* 柱の陰の一般の人 (女性: ひそひそ / 男性: 指さす) */}
        <MzDOld x={300} y={880} s={1.0} f={f} phase={2} female robe="ankle" sash={C.pink} face="smile" lean={6} />
        <MzDOld x={520} y={880} s={1.05} f={f} phase={5} pose="point" pointDir={1} face="surprised" beard={26} sash={C.sash} />
        {/* 白い柱 (前列) */}
        {colX.map((cx, i) => (
          <g key={i}>
            <rect x={cx - 56} y={300} width={112} height={490} fill={C.greek} stroke={INK} strokeWidth={6} />
            {[-30, -10, 10, 30].map((dx) => <line key={dx} x1={cx + dx} y1={330} x2={cx + dx} y2={770} stroke={C.greekShade} strokeWidth={5} />)}
            <rect x={cx - 76} y={276} width={152} height={30} fill={C.greek} stroke={INK} strokeWidth={5} />
            <rect x={cx - 70} y={776} width={140} height={22} fill={C.greekShade} stroke={INK} strokeWidth={5} />
          </g>
        ))}
        {/* 青銅のランプ台 */}
        <g>
          <line x1={1250} y1={880} x2={1250} y2={600} stroke={C.bronze} strokeWidth={10} />
          <path d="M 1214 884 L 1250 850 L 1286 884 Z" fill={C.bronze} stroke={INK} strokeWidth={4} />
          <path d="M 1212 600 Q 1250 620 1288 600 L 1280 588 L 1220 588 Z" fill={C.bronze} stroke={INK} strokeWidth={4} />
          <path d="M 1222 588 Q 1250 566 1284 580 L 1296 574 L 1290 590 Z" fill={C.terra} stroke={INK} strokeWidth={4} />
          <Flame x={1294} y={576} s={0.9} f={f} glow={1.6} />
        </g>
        <circle cx={1294} cy={560} r={260} fill={MP.glow} opacity={0.08 + 0.02 * Math.sin(f / 4)} />
        {/* 水がめとオリーブの鉢 */}
        <path d="M 1600 880 Q 1550 820 1566 760 Q 1580 720 1610 712 L 1610 690 L 1650 690 L 1650 712 Q 1680 720 1694 760 Q 1710 820 1660 880 Z" fill={C.terra} stroke={INK} strokeWidth={5} />
        <path d="M 1580 770 Q 1630 786 1680 770" stroke={INK} strokeWidth={3} fill="none" />
        <path d="M 1714 880 L 1700 800 L 1860 800 L 1846 880 Z" fill={C.terraDark} stroke={INK} strokeWidth={5} />
        <line x1={1780} y1={800} x2={1776} y2={640} stroke={MP.woodDark} strokeWidth={9} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return <ellipse key={i} cx={1778 + Math.cos(a) * 60} cy={620 + Math.sin(a) * 40} rx={26} ry={10} fill={i % 2 ? C.olive : C.oliveDark} stroke={INK} strokeWidth={3}
            transform={`rotate(${(a * 180) / Math.PI + Math.sin(f / 18 + i) * 4} ${1778 + Math.cos(a) * 60} ${620 + Math.sin(a) * 40})`} />;
        })}
        {/* プラトン (後ろ姿・顔なし)。右手に巻物、左手は下 */}
        <MzDOld x={960} y={900} s={1.5} f={f} phase={1} back pose="raise" robe="ankle" sash={C.robeShade} hairColor={C.hairWhite} beard={20} beardColor={C.hairWhite}>
          {/* 掲げた巻物 (右手) */}
          <g transform={`rotate(${Math.sin(f / 22) * 3} 67 -232)`}>
            <rect x={44} y={-280} width={46} height={64} rx={6} fill={C.paperOld} stroke={INK} strokeWidth={4} />
            <rect x={38} y={-288} width={58} height={12} rx={6} fill={MP.woodLight} stroke={INK} strokeWidth={3} />
            <rect x={38} y={-222} width={58} height={12} rx={6} fill={MP.woodLight} stroke={INK} strokeWidth={3} />
          </g>
        </MzDOld>
        {/* ランプの光が白い衣の右側に */}
        <path d="M 1030 700 Q 1050 780 1060 880" stroke={MP.glow} strokeWidth={10} fill="none" opacity={0.5} />
        {/* 飛んでくる札 → 「元祖？」 */}
        <g transform={`translate(0 ${Math.sin(f / 14) * 4 * spin}) translate(${px} ${py}) scale(${spin > 0 ? Math.abs(sx) * 0.96 + 0.04 : 1} 1) rotate(${(1 - fly) * -20}) translate(${-px} ${-py})`}>
          <TagPlate x={px} y={py} text={shown} size={56} color={KRP.red} t={seg(f, 0, 6)} />
        </g>
        {spin > 0.7 && spin < 1 && <MzDSpark x={px + 110} y={py - 50} s={0.9} o={1 - spin} />}
        {spin >= 1 && f < 60 && <MzDSpark x={px - 110} y={py - 46} s={0.7} o={1 - seg(f, 40, 60)} rot={f * 6} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #76 紀元前4世紀、水を使った夜の時計を作った、と伝わっています。
// 格: 並 / seed 6076
// 絵: どこ: #75 の夜の中庭の続き。演出: 主役はプラトンの手元 (顔は描かない)。手元の作業台の上に、**ぼんやりした点線だけで描いた**水の器の時計の輪郭があり (中身の仕組みは描かず、器の外形と水の線だけ)、輪郭の上に大きな「?」が浮かぶ。器の中を水がちょろちょろ満ちていく線だけ見せる。年代札「紀元前4世紀」を左上に。そばのランプの火が揺れ、夜空に星。中庭の柱の陰の一般の人が身を乗り出して見る。カメラはプラトンの手元へ寄る。動き: f0-30 寄り / f30-120 点線の器に水がたまる線 / 「?」がゆらゆら / 星がまたたく
// どこ: #75 の夜の中庭の続き。白い柱・瓦の縁・星空。中庭の石の作業台 (天板の木目・ろう板と尖筆・ランプ)
// 演出: 主役はプラトンの手元 (背中ごしに、顔は描かない)。作業台の上に点線だけで描いた水の器の時計の輪郭 (中身の仕組みは描かない)。点線の樋から水がちょろちょろ入り、器の中の点線の水面が上がっていく。輪郭の上に大きな「?」。年代札「紀元前4世紀」。柱の陰の一般の人が身を乗り出す
// 動き: f0-30 手元へ寄る / f8〜 点線の水がたまっていく (f42 で半分) / 「?」がゆらゆら / 星がまたたく / ランプの炎 / 指先が器をなぞる
const Mz076: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.12, easeInOut(seg(f, 0, 30)));
  const lvl = f < 42 ? lerp(0.08, 0.5, easeOut(seg(f, 8, 42))) : lerp(0.5, 0.84, seg(f, 42, 165));
  const lean = easeOut(seg(f, 14, 34));
  const [skyT, skyB] = skyColors(0.05);
  const VX = 760, VB = 720, VT = 360;
  const jar = `M ${VX - 120} ${VB} Q ${VX - 150} ${VB - 120} ${VX - 150} ${VB - 200} Q ${VX - 150} ${VT + 40} ${VX - 100} ${VT + 10} L ${VX - 90} ${VT} L ${VX + 90} ${VT} L ${VX + 100} ${VT + 10} Q ${VX + 150} ${VT + 40} ${VX + 150} ${VB - 200} Q ${VX + 150} ${VB - 120} ${VX + 120} ${VB} Z`;
  const wy = VB - (VB - VT) * lvl;
  const clipId = "mzd076jar";
  return (
    <Frame f={f} seed={6076} dark bg={skyT}>
      <g transform={zoomAt(z, 860, 560)}>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-200} y={-200 + i * 96} width={2400} height={98} fill={mixColor(skyT, skyB, i / 4)} />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={rnd(176, i) * 1900 + 10} cy={rnd(177, i) * 200 + 20} r={i % 3 === 0 ? 3.6 : 2.3} fill="#FFF6D8"
            opacity={0.35 + 0.65 * Math.abs(Math.sin(f / 9 + i * 1.9))} />
        ))}
        {/* 奥の壁と瓦の縁 */}
        <rect x={-200} y={270} width={2400} height={420} fill="#958E7E" />
        <rect x={-200} y={240} width={2400} height={36} fill={C.terraDark} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M ${-200 + i * 96} 276 q 48 24 96 0`} fill={C.terra} stroke={INK} strokeWidth={3} />)}
        {/* 身を乗り出す一般の人 (男性) と柱 */}
        <MzDOld x={280} y={650} s={0.95} f={f} phase={4} face="surprised" beard={24} sash={C.sash} lean={14 * lean} />
        <rect x={64} y={220} width={112} height={480} fill={C.greek} stroke={INK} strokeWidth={6} />
        {[-30, -10, 10, 30].map((dx) => <line key={dx} x1={120 + dx} y1={250} x2={120 + dx} y2={690} stroke={C.greekShade} strokeWidth={5} />)}
        <rect x={44} y={198} width={152} height={30} fill={C.greek} stroke={INK} strokeWidth={5} />
        <rect x={1700} y={220} width={112} height={480} fill={C.greek} stroke={INK} strokeWidth={6} />
        <rect x={1680} y={198} width={152} height={30} fill={C.greek} stroke={INK} strokeWidth={5} />
        {/* 作業台 (石の脚に木の天板) */}
        <path d="M -200 640 L 2120 640 L 2120 800 L -200 800 Z" fill={MP.wood} stroke={INK} strokeWidth={6} />
        {[670, 712, 760].map((ly, i) => <path key={i} d={`M -200 ${ly} q 500 ${(i - 1) * 10} 1100 0 q 600 ${(1 - i) * 10} 1220 0`} stroke={MP.woodDark} strokeWidth={4} fill="none" opacity={0.5} />)}
        <rect x={-200} y={800} width={2400} height={400} fill={C.greekShade} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, k) => <line key={k} x1={-120 + k * 200} y1={800} x2={-120 + k * 200} y2={1100} stroke={MP.stoneDark} strokeWidth={4} opacity={0.6} />)}
        <line x1={-200} y1={900} x2={2200} y2={900} stroke={MP.stoneDark} strokeWidth={4} opacity={0.6} />
        {/* ろう板と尖筆 */}
        <g transform="rotate(-6 1120 690)">
          <rect x={1020} y={656} width={200} height={70} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          <rect x={1032} y={666} width={176} height={50} fill="#C9A55C" />
          {[678, 692, 706].map((ly) => <line key={ly} x1={1044} y1={ly} x2={1190} y2={ly} stroke={INK} strokeWidth={2} opacity={0.4} strokeDasharray="14 6" />)}
        </g>
        <line x1={980} y1={760} x2={1060} y2={740} stroke={C.bronze} strokeWidth={6} strokeLinecap="round" />
        {/* ランプ */}
        <path d="M 420 712 Q 470 734 520 712 L 512 694 L 430 694 Z" fill={C.terra} stroke={INK} strokeWidth={4} />
        <path d="M 512 700 L 540 690 L 536 704 Z" fill={C.terra} stroke={INK} strokeWidth={3} />
        <Flame x={540} y={690} s={0.9} f={f} glow={1.5} />
        <circle cx={540} cy={670} r={240} fill={MP.glow} opacity={0.08 + 0.02 * Math.sin(f / 4)} />
        {/* 点線の器 (うわさの時計の輪郭だけ) */}
        <path d={jar} fill={KRP.white} opacity={0.08} />
        <defs><clipPath id={clipId}><path d={jar} /></clipPath></defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x={VX - 160} y={wy} width={320} height={VB - wy + 10} fill={MP.you} opacity={0.18} />
          {[0, 1, 2, 3].map((k) => {
            const ly = wy + k * 46;
            if (ly > VB - 6) return null;
            const ph = f / 5 + k;
            return <path key={k} d={`M ${VX - 160} ${ly} q 40 ${Math.sin(ph) * 8} 80 0 q 40 ${-Math.sin(ph) * 8} 80 0 q 40 ${Math.sin(ph) * 8} 80 0 q 40 ${-Math.sin(ph) * 8} 80 0`}
              stroke={C.waterLine} strokeWidth={5} fill="none" strokeDasharray="12 9" opacity={k === 0 ? 1 : 0.5} />;
          })}
        </g>
        <path d={jar} fill="none" stroke={KRP.white} strokeWidth={6} strokeDasharray="16 12" strokeDashoffset={-f * 0.6} opacity={0.9} />
        {/* 点線の樋と、ちょろちょろ落ちる水 */}
        <path d={`M 470 330 L ${VX - 30} 370`} stroke={KRP.white} strokeWidth={5} strokeDasharray="12 10" opacity={0.75} />
        {[0, 1, 2, 3, 4].map((k) => {
          const p = ((f + k * 7) % 35) / 35;
          const yy = lerp(374, wy, p);
          return <circle key={k} cx={VX - 30 + Math.sin(p * 3) * 3} cy={yy} r={5} fill={C.waterLine} opacity={p < 0.95 ? 0.9 : 0} />;
        })}
        <QMark x={VX} y={300 + Math.sin(f / 9) * 6} s={1.3} f={f} t={seg(f, 4, 16)} />
        {/* プラトンの背中と手元 (顔なし)。左手で器を指す */}
        <MzDOld x={1420} y={997} s={1.6} f={f} phase={1} back pose="point" pointDir={-1} robe="ankle" sash={C.robeShade} hairColor={C.hairWhite} beard={20} beardColor={C.hairWhite} />
        <path d="M 1175 760 Q 1120 740 1090 724" stroke={KRP.white} strokeWidth={4} strokeDasharray="6 6" fill="none" opacity={0.6 + 0.4 * Math.sin(f / 6)} />
      </g>
      {/* 年代札 (カメラの外) */}
      <TagPlate x={360} y={200} text="紀元前4世紀" size={44} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #77 ただ、古代に残っている記録は、たった1文。
// 格: 図 / seed 6077
// 絵: どこ: 古い石造りの書庫の床 (石の棚・積まれた巻物・ろうそく)。演出: 図の主役は1本の巻物。巻物が床の上を手前から奥へ、**ころころころと延々に転がって**広がっていき、画面の端まで届く。広がった巻物はほとんどが白紙に近い薄い行ばかり、その長い巻物のどこか一か所にだけ、プラトンの名の行が1行だけ赤く光る (字は読めない線、横に小札「1文」)。巻物を広げた書庫番 (一般の人・灰色の衣・顔あり) が、ろうそくを持って巻物の上を歩き、その1行を見つけて膝をつく。カメラは巻物を追って右へ長くパンし、1行で止まる。動き: f0-60 巻物が転がる / f60-110 パン / f110 1行が光る・書庫番が膝をつく
// どこ: 古い石造りの書庫。奥の壁いっぱいの石の棚 (巻物の丸い端がぎっしり)・棚のろうそく・石畳の床
// 演出: 図の主役は1本の巻物。床の上をころころ転がって延々と広がり、画面の端まで届く。ほとんど薄い行ばかり (白紙に近い)。ただ1か所だけ、1行が赤く光る (字は読めない線)。小札「1文」。ろうそくを持った書庫番 (一般の人・灰色の衣) が巻物に沿って歩き、その1行を見つけて膝をつく
// 動き: f0-30 巻物が転がる / f6-36 カメラが右へ長くパン / f34 1行が光る / f36-44 書庫番が膝をつく / f50〜 カメラが引いて巻物の長さを見せる
const Mz077: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeOut(seg(f, 0, 30));
  const rollX = lerp(320, 3320, roll);
  const RED = 2520;
  const pan = easeInOut(seg(f, 6, 36));
  const tx = lerp(0, RED - 960, pan);
  const zo = lerp(1, 0.78, easeInOut(seg(f, 50, 112)));
  const glow = seg(f, 32, 38);
  const kneel = easeOut(seg(f, 36, 44));
  const walkT = seg(f, 6, 36);
  const kx = lerp(700, RED - 150, easeInOut(walkT));
  const step = f < 36 ? Math.abs(Math.sin(f / 3)) * 6 : 0;
  const SY0 = 612, SY1 = 800;
  return (
    <Frame f={f} seed={6077} bg="#6E655A">
      <g transform={`${zoomAt(zo, 960, 600)} translate(${-tx} 0)`}>
        {/* 奥の石の棚 */}
        <rect x={-600} y={-200} width={4800} height={760} fill="#8A8072" />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 30 }, (_, k) => {
          const bx = -560 + k * 160, by = -40 + r * 140;
          return (
            <g key={`${r}-${k}`}>
              <rect x={bx} y={by} width={150} height={130} fill="#4E463D" stroke={INK} strokeWidth={4} />
              {Array.from({ length: 6 }, (_, j) => {
                const ex = bx + 26 + (j % 3) * 48, ey = by + 40 + Math.floor(j / 3) * 52;
                return rnd(77 + r, k * 6 + j) < 0.85 ? (
                  <g key={j}>
                    <circle cx={ex} cy={ey} r={22} fill={j % 2 ? C.paperOld : "#E2D3AE"} stroke={INK} strokeWidth={3} />
                    <circle cx={ex} cy={ey} r={7} fill={MP.woodDark} />
                  </g>
                ) : null;
              })}
            </g>
          );
        }))}
        {/* 棚のろうそく */}
        {[200, 1100, 1900, 2700, 3500].map((cx, i) => (
          <g key={i}>
            <rect x={cx - 9} y={472} width={18} height={44} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <Flame x={cx} y={472} s={0.7} f={f} phase={i} glow={1.2} />
          </g>
        ))}
        <rect x={-600} y={520} width={4800} height={30} fill={MP.stone} stroke={INK} strokeWidth={5} />
        {/* 石畳の床 */}
        <rect x={-600} y={550} width={4800} height={700} fill={MP.stoneDark} />
        {Array.from({ length: 6 }, (_, r) => (
          <g key={r}>
            <line x1={-600} y1={550 + r * 100} x2={4200} y2={550 + r * 100} stroke="#6E665A" strokeWidth={4} />
            {Array.from({ length: 30 }, (_, k) => <line key={k} x1={-560 + k * 180 + (r % 2) * 90} y1={550 + r * 100} x2={-560 + k * 180 + (r % 2) * 90} y2={650 + r * 100} stroke="#6E665A" strokeWidth={4} />)}
          </g>
        ))}
        {/* 広がった巻物 */}
        <rect x={260} y={SY0} width={rollX - 260} height={SY1 - SY0} fill={C.paperOld} stroke={INK} strokeWidth={5} />
        <rect x={260} y={SY1 - 4} width={rollX - 260} height={12} fill="#000" opacity={0.15} />
        {Array.from({ length: 52 }, (_, i) => {
          const cx0 = 300 + i * 58;
          if (cx0 + 44 > rollX - 30) return null;
          return Array.from({ length: 7 }, (_, j) => {
            const ly = 640 + j * 22;
            if (rnd(770 + i, j) < 0.62) return null;
            const isRed = Math.abs(cx0 - (RED - 40)) < 30 && j === 3;
            if (isRed) return null;
            return <line key={`${i}-${j}`} x1={cx0} y1={ly} x2={cx0 + 20 + rnd(771, i * 7 + j) * 24} y2={ly} stroke={C.paperLine} strokeWidth={4} strokeLinecap="round" opacity={0.6} />;
          });
        })}
        {/* ただ1行、赤く光る */}
        {rollX > RED + 60 && (
          <g>
            <ellipse cx={RED} cy={706} rx={110 + 10 * Math.sin(f / 4)} ry={28} fill={MP.glow} opacity={0.55 * glow} />
            <line x1={RED - 64} y1={706} x2={RED + 64} y2={706} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" opacity={0.35 + 0.65 * glow} />
            <path d={`M ${RED - 60} 696 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0`} stroke={KRP.red} strokeWidth={3} fill="none" opacity={glow} />
            {glow > 0 && <MzDSpark x={RED + 86} y={680} s={0.8} o={glow * (0.6 + 0.4 * Math.sin(f / 3))} rot={f * 4} />}
          </g>
        )}
        {/* 転がる巻物の芯 */}
        <g>
          <rect x={rollX - 10} y={SY0 - 14} width={56} height={SY1 - SY0 + 28} rx={20} fill="#E2D3AE" stroke={INK} strokeWidth={5} />
          <ellipse cx={rollX + 18} cy={SY0 - 14} rx={28} ry={12} fill={C.paperOld} stroke={INK} strokeWidth={4} />
          <g transform={`rotate(${roll * 2400} ${rollX + 18} ${SY0 - 14})`}>
            <path d={`M ${rollX + 18} ${SY0 - 14} m -16 0 a 16 7 0 1 1 16 6`} stroke={INK} strokeWidth={3} fill="none" />
          </g>
          {f < 30 && [0, 1, 2].map((k) => <line key={k} x1={rollX + 60 + k * 18} y1={650 + k * 40} x2={rollX + 90 + k * 18} y2={650 + k * 40} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.8} />)}
        </g>
        {/* 書庫番 (灰色の衣) */}
        <g transform={`translate(0 ${kneel * 46 - step})`}>
          <MzDOld x={kx} y={610} s={0.98} f={f} phase={3} pose="point" pointDir={1} robe="ankle" cloth="#8E8E94" clothDark="#6E6E76"
            face={kneel > 0.2 ? "surprised" : "normal"} beard={30} beardColor={C.hairGray} lean={12 * kneel}>
            <rect x={145} y={-196} width={16} height={40} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <Flame x={153} y={-196} s={0.8} f={f} glow={1.3} />
          </MzDOld>
        </g>
        <TagPlate x={RED + 190} y={560} text="1文" size={44} color={KRP.red} t={seg(f, 36, 44)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #78 しかも書かれたのは、プラトンが亡くなってから、約550年後です。
// 格: 図 / seed 6078
// 絵: どこ: 古代の石畳の長い道 (道の両脇に崩れかけの柱が並ぶ、時の流れを表す道)。演出: 図の主役は道の長さ。左端の出発点に、プラトンのランプの灯 (人物は描かず、ランプだけ) が消えて煙になる。そこから右へ、伝令の若者 (一般の人・白い衣・顔あり) が書き付けを持って走りだすが、道の柱ごとに年が過ぎ、若者が走るうちに髪が白くなりひげが伸び、杖をついた老人になり、次の世代の若者に書き付けを手渡す……を2回くり返して、やっと右端の書き手の机 (巻物とペン) に届く。道の上に大きな数字札「約550年」。カメラは道を左から右へ長くパン。動き: f0-150 パン / f40・f90 世代交代 / f150 机に届く
// どこ: 古代の石畳の長い道。両脇に崩れかけの柱が並ぶ「時の流れの道」。遠くに丘とオリーブの木。左端にプラトンのランプ (人物は描かない)、右端に書き手の机 (巻物・羽ペン・インク壺)
// 演出: 図の主役は道の長さ。ランプの灯が消えて煙になる。白い衣の伝令の若者が書き付けを持って走りだし、走るうちに髪が白くなりひげが伸び、杖をついた老人になって次の若者に手渡す (2回)。老人は柱の切り株に座って手を振る。道の上に数字札「約550年」と、端から端までの矢印のリボン
// 動き: f0-150 カメラが道を左から右へ長くパン / f0-12 灯が消える→煙 / f40・f90 世代交代 / f150 机に届く
const Mz078: React.FC<{ f: number }> = ({ f }) => {
  const rx = (t: number) => Math.min(380 + (t / 150) * 3420, 3800);
  const starts = [0, 40, 90], ends = [40, 90, 152];
  const g = f < 40 ? 0 : f < 90 ? 1 : 2;
  const age = seg(f, starts[g], ends[g]);
  const runX = rx(f);
  const tx = Math.min(Math.max(runX - 860, 0), 4300 - 1920);
  const RY = 860;
  const flameO = 1 - seg(f, 2, 12);
  const runner = (x: number, a: number, key: string, phase: number) => {
    const old = a >= 0.72;
    const hc = a < 0.35 ? undefined : a < 0.72 ? C.hairGray : C.hairWhite;
    const bob = old ? Math.abs(Math.sin(f / 4)) * 3 : Math.abs(Math.sin(f / 2.2)) * 10;
    return (
      <g key={key} transform={`translate(0 ${-bob})`}>
        <MzDOld x={x} y={RY} s={0.9} f={f} phase={phase} pose={old ? "stand" : "run"} face={old ? "worried" : "smile"}
          hairColor={hc} beard={a < 0.25 ? 0 : lerp(0, 54, a)} beardColor={hc ?? INK} lean={old ? 10 : 4} sash={C.sash}>
          {/* 書き付け (小さな巻物) */}
          <rect x={30} y={-150} width={22} height={56} rx={6} fill={C.paperOld} stroke={INK} strokeWidth={3.5} transform="rotate(20 41 -122)" />
          {old && <line x1={67} y1={-66} x2={96} y2={0} stroke={MP.woodDark} strokeWidth={7} strokeLinecap="round" />}
          {old && <path d="M -98 -230 q -10 10 0 20" stroke={C.waterLine} strokeWidth={4} fill="none" />}
        </MzDOld>
        {!old && [0, 1, 2].map((k) => <line key={k} x1={x - 110 - k * 10} y1={RY - 140 + k * 36} x2={x - 170 - k * 10} y2={RY - 140 + k * 36} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.4} />)}
      </g>
    );
  };
  return (
    <Frame f={f} seed={6078} bg={KRP.paperCool}>
      <g transform={`translate(${-tx} 0)`}>
        {/* 空と丘 */}
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-100} y={i * 90} width={4500} height={92} fill={mixColor("#BFDDEB", "#F4E9D2", i / 5)} />)}
        <path d="M -100 560 Q 400 430 900 520 Q 1500 410 2100 510 Q 2700 420 3300 500 Q 3900 430 4400 520 L 4400 660 L -100 660 Z" fill="#B9C58F" stroke={INK} strokeWidth={4} />
        {[600, 1700, 2600, 3500].map((ox, i) => (
          <g key={i}>
            <line x1={ox} y1={540} x2={ox} y2={500} stroke={MP.woodDark} strokeWidth={6} />
            <ellipse cx={ox} cy={490} rx={44} ry={26} fill={C.oliveDark} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 時の流れのリボン (端から端まで) */}
        <line x1={260} y1={330} x2={3960} y2={330} stroke={KRP.red} strokeWidth={8} strokeDasharray="30 14" />
        <path d="M 3990 330 L 3950 308 L 3950 352 Z" fill={KRP.red} stroke={INK} strokeWidth={3} />
        <circle cx={250} cy={330} r={14} fill={KRP.red} stroke={INK} strokeWidth={3} />
        {/* 奥の列の崩れかけた柱 */}
        {Array.from({ length: 14 }, (_, i) => {
          const cx = 140 + i * 300, h = 220 + rnd(78, i) * 150, top = 650 - h;
          return (
            <g key={i}>
              <path d={`M ${cx - 34} 650 L ${cx - 34} ${top + 10} L ${cx - 10} ${top} L ${cx + 6} ${top + 16} L ${cx + 34} ${top + 4} L ${cx + 34} 650 Z`} fill={C.greek} stroke={INK} strokeWidth={5} />
              {[-14, 0, 14].map((dx) => <line key={dx} x1={cx + dx} y1={top + 24} x2={cx + dx} y2={640} stroke={C.greekShade} strokeWidth={4} />)}
              {rnd(79, i) > 0.5 && <rect x={cx + 40} y={622} width={50} height={28} rx={4} fill={C.greekShade} stroke={INK} strokeWidth={4} transform={`rotate(${rnd(80, i) * 30 - 15} ${cx + 65} 636)`} />}
            </g>
          );
        })}
        {/* 石畳の道 */}
        <rect x={-100} y={650} width={4500} height={600} fill="#CDBE9E" />
        {Array.from({ length: 5 }, (_, r) => (
          <g key={r}>
            <line x1={-100} y1={650 + r * 70} x2={4400} y2={650 + r * 70} stroke="#A8987A" strokeWidth={4} />
            {Array.from({ length: 40 }, (_, k) => <line key={k} x1={-60 + k * 120 + (r % 2) * 60} y1={650 + r * 70} x2={-60 + k * 120 + (r % 2) * 60} y2={720 + r * 70} stroke="#A8987A" strokeWidth={4} />)}
          </g>
        ))}
        <line x1={-100} y1={650} x2={4400} y2={650} stroke={INK} strokeWidth={5} />
        {/* 出発点: プラトンのランプ (人物なし) が消えて煙 */}
        <rect x={170} y={700} width={150} height={150} fill={C.greekShade} stroke={INK} strokeWidth={5} />
        <path d="M 200 700 Q 245 722 290 700 L 282 682 L 208 682 Z" fill={C.terra} stroke={INK} strokeWidth={4} />
        <path d="M 282 690 L 308 680 L 304 694 Z" fill={C.terra} stroke={INK} strokeWidth={3} />
        {flameO > 0.05 && <g opacity={flameO}><Flame x={308} y={680} s={0.9 * flameO + 0.1} f={f} glow={flameO} /></g>}
        {f > 8 && [0, 1, 2].map((k) => {
          const p = ((f - 8 + k * 12) % 40) / 40;
          return <path key={k} d={`M ${308 + Math.sin(p * 6 + k) * 12} ${670 - p * 160} q 14 -14 0 -28 q -14 -14 0 -28`} stroke={KRP.gray} strokeWidth={6} fill="none" strokeLinecap="round" opacity={(1 - p) * 0.8} />;
        })}
        {/* 休む老人 (受け渡しの済んだ世代) */}
        {[1, 2].map((gg) => {
          if (g < gg) return null;
          const hx = rx(starts[gg]) - 60;
          return (
            <g key={gg}>
              <rect x={hx - 46} y={RY - 52} width={92} height={70} fill={C.greekShade} stroke={INK} strokeWidth={4} />
              <MzDOld x={hx} y={RY + 8} s={0.85} f={f} phase={gg * 3} pose="sit" face="joy" hairColor={C.hairWhite} beard={54} beardColor={C.hairWhite} sash={C.sash}>
                <line x1={67} y1={-66} x2={110} y2={60} stroke={MP.woodDark} strokeWidth={7} strokeLinecap="round" />
              </MzDOld>
            </g>
          );
        })}
        {/* 待っている次の若者 */}
        {[1, 2].map((gg) => {
          if (g !== gg - 1 || f < ends[gg - 1] - 28) return null;
          const wx = rx(ends[gg - 1]) + 40;
          return (
            <MzDOld key={`w${gg}`} x={wx} y={RY} s={0.9} f={f} phase={gg * 5} pose="raise" face="smile" sash={C.sash} />
          );
        })}
        {/* いま走っている人 */}
        {runner(runX, age, "r", g * 2)}
        {/* 受け渡しの瞬間のきらり */}
        {[40, 90].map((hf) => (f >= hf && f < hf + 10 ? <MzDSpark key={hf} x={rx(hf) - 10} y={RY - 220} s={1.1} o={1 - seg(f, hf, hf + 10)} rot={f * 8} /> : null))}
        {/* 右端の書き手の机 */}
        <g>
          <rect x={3880} y={700} width={300} height={24} fill={MP.wood} stroke={INK} strokeWidth={5} />
          <rect x={3900} y={724} width={22} height={150} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          <rect x={4136} y={724} width={22} height={150} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          <rect x={3920} y={668} width={160} height={34} rx={8} fill={C.paperOld} stroke={INK} strokeWidth={4} />
          {[680, 690].map((ly) => <line key={ly} x1={3934} y1={ly} x2={4060} y2={ly} stroke={C.paperLine} strokeWidth={3} />)}
          <rect x={4100} y={672} width={34} height={30} rx={6} fill={MP.iron} stroke={INK} strokeWidth={4} />
          <path d={`M 4116 676 Q 4150 600 4190 ${560 + Math.sin(f / 8) * 4}`} stroke={INK} strokeWidth={4} fill="none" />
          <path d={`M 4190 ${560 + Math.sin(f / 8) * 4} Q 4160 600 4140 640 Q 4176 610 4190 ${560 + Math.sin(f / 8) * 4} Z`} fill={KRP.white} stroke={INK} strokeWidth={3} />
        </g>
      </g>
      <TagPlate x={960} y={190} text="約550年" size={72} color={KRP.red} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #79 元祖の目覚まし、ほぼ、うわさ話です。
// 格: 山 / seed 6079
// 絵: どこ: 古代ギリシャの市場の柱廊 (白い柱・日よけの布・つぼの並ぶ露店)。演出: 笑いどころ。白い衣の一般の人たち (男女を混ぜる。女性は長い衣に髪を後ろで結ぶ、男性は短髪とひげ) が一列に並び、手で口元を隠して耳打ちの伝言ゲーム。1人目の吹き出しには小さな水の器の絵、2人目では器が大きくなり、3人目では器に笛が付き、4人目ではラッパが付き、5人目ではついに器に羽が生えて空を飛んでいる絵になる。最後の人が「えっ」と目を丸くする (face="surprised")。吹き出しの絵はどれも点線のふち (うわさ)。カメラは列を左から右へパン。動き: f0-120 耳打ちが順に進む (20fごと) / 吹き出しの絵がどんどん盛られる / f130 最後の人がのけぞる
// どこ: 古代ギリシャの市場の柱廊。白い柱の列・赤とクリームのしま模様の日よけの布・つぼの並ぶ露店の棚・石畳
// 演出: 笑いどころ。白い衣の一般の人5人 (男・女・男・女・男) が一列で耳打ちの伝言ゲーム。点線のふちの吹き出しの絵が、小さな水の器 → 大きな器 → 笛付き → ラッパ付き → 羽が生えて空を飛ぶ器、とどんどん盛られる。最後の男が目を丸くしてのけぞる。そのあと羽の器が吹き出しを抜け出して空へ飛んでいく
// 動き: f0-40 カメラが列を左から右へパンしながら引く / 吹き出しが8コマごとに順に出る / f38-46 最後の人がのけぞる / f50-106 羽の器が飛び去る・みんな笑う
const Mz079: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 40));
  const z = lerp(1.3, 1, pan);
  const cx = lerp(560, 960, pan);
  const xs = [250, 590, 930, 1270, 1620];
  const fem = [false, true, false, true, false];
  const tIn = (i: number) => seg(f, 2 + i * 8, 8 + i * 8);
  const shock = easeOut(seg(f, 38, 46));
  const flyOff = easeInOut(seg(f, 50, 100));
  const vessel = (k: number, whistle: boolean, horn: boolean, wings: boolean) => (
    <g transform={`scale(${k})`}>
      {wings && (
        <g fill={KRP.white} stroke={INK} strokeWidth={3}>
          <path d={`M -30 -20 Q -80 ${-60 + Math.sin(f / 2) * 16} -96 -10 Q -70 -16 -30 0 Z`} />
          <path d={`M 30 -20 Q 80 ${-60 + Math.sin(f / 2) * 16} 96 -10 Q 70 -16 30 0 Z`} />
        </g>
      )}
      <path d="M -26 30 Q -40 0 -34 -22 L -20 -34 L 20 -34 L 34 -22 Q 40 0 26 30 Z" fill={C.terra} stroke={INK} strokeWidth={3.5} />
      <path d="M -32 -4 Q 0 6 32 -4" stroke={C.waterLine} strokeWidth={4} fill="none" />
      {whistle && <g><rect x={20} y={-56} width={12} height={26} fill={MP.brass} stroke={INK} strokeWidth={3} /><circle cx={26} cy={-60} r={6} fill={MP.brassLight} stroke={INK} strokeWidth={2.5} /></g>}
      {horn && <path d="M -22 -34 L -40 -62 L -66 -84 L -44 -54 L -28 -30 Z" fill={MP.brass} stroke={INK} strokeWidth={3} />}
      {wings && [0, 1].map((j) => <line key={j} x1={-50} y1={40 + j * 14} x2={-80} y2={50 + j * 14} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
    </g>
  );
  const contents = [
    () => vessel(0.7, false, false, false),
    () => vessel(1.0, false, false, false),
    () => vessel(1.15, true, false, false),
    () => vessel(1.25, true, true, false),
    () => vessel(1.3, true, true, true),
  ];
  return (
    <Frame f={f} seed={6079} bg="#E3D8C2">
      <g transform={camC(z, cx, 540)}>
        {/* 柱廊の奥の壁 */}
        <rect x={-500} y={-200} width={2900} height={900} fill="#DCD2BC" />
        {/* 露店の棚とつぼ */}
        {xs.map((x, i) => (
          <g key={i}>
            <rect x={x - 130} y={640} width={260} height={16} fill={MP.wood} stroke={INK} strokeWidth={4} />
            {[-90, -30, 30, 90].map((dx, j) => (
              <path key={j} d={`M ${x + dx - 18} 640 Q ${x + dx - 30} 600 ${x + dx - 14} 580 L ${x + dx - 8} 566 L ${x + dx + 8} 566 L ${x + dx + 14} 580 Q ${x + dx + 30} 600 ${x + dx + 18} 640 Z`}
                fill={(i + j) % 2 ? C.terra : C.terraDark} stroke={INK} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 柱 */}
        {[-170, 80, 420, 760, 1100, 1440, 1790, 2100].map((px) => (
          <g key={px}>
            <rect x={px - 40} y={150} width={80} height={600} fill={C.greek} stroke={INK} strokeWidth={5} />
            {[-18, 0, 18].map((dx) => <line key={dx} x1={px + dx} y1={170} x2={px + dx} y2={740} stroke={C.greekShade} strokeWidth={4} />)}
            <rect x={px - 56} y={130} width={112} height={24} fill={C.greek} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {/* 日よけの布 (しま) */}
        <rect x={-500} y={60} width={2900} height={74} fill={C.greek} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${-500 + i * 100} 134 L ${-400 + i * 100} 134 L ${-400 + i * 100} 170 Q ${-450 + i * 100} ${196 + Math.sin(f / 10 + i) * 4} ${-500 + i * 100} 170 Z`}
            fill={i % 2 ? C.cloth : KRP.cream} stroke={INK} strokeWidth={3} />
        ))}
        {/* 石畳 */}
        <rect x={-500} y={750} width={2900} height={500} fill="#C2B59A" />
        {[790, 850, 930].map((ly) => <line key={ly} x1={-500} y1={ly} x2={2400} y2={ly} stroke="#A2957A" strokeWidth={4} />)}
        <line x1={-500} y1={750} x2={2400} y2={750} stroke={INK} strokeWidth={5} />
        {/* 5人の伝言ゲーム */}
        {xs.map((x, i) => {
          const last = i === 4;
          const whisper = i < 4 && tIn(i + 1) > 0 && f < 50;
          const face: Face = last ? (shock > 0.2 ? "surprised" : "normal") : f > 50 ? "joy" : whisper ? "smile" : "normal";
          return (
            <MzDOld key={i} x={x} y={860} s={0.95} f={f} phase={i * 2} female={fem[i]} robe={fem[i] ? "ankle" : "knee"}
              sash={fem[i] ? C.pink : C.sash} beard={fem[i] ? 0 : 24} pose={last ? (shock > 0.3 ? "banzai" : "stand") : "point"} pointDir={1}
              face={face} lean={last ? -14 * shock : whisper ? 7 : 0}>
              {/* ひそひそ声の小さな点線 (耳打ち中) */}
              {whisper && <path d={`M 170 -170 q 20 -10 40 0 M 176 -150 q 20 -10 40 0`} stroke={INK} strokeWidth={4} fill="none" strokeDasharray="5 5" opacity={0.6} />}
            </MzDOld>
          );
        })}
        {/* 点線の吹き出し */}
        {xs.map((x, i) => {
          const t = tIn(i);
          if (t <= 0) return null;
          const sc = pop(t);
          const rxB = 100 + i * 14;
          const by = 380;
          return (
            <g key={i} transform={`translate(${x} ${by}) scale(${sc})`}>
              <path d={`M -16 ${70 + i * 4} L 0 ${130 + i * 2} L 16 ${70 + i * 4} Z`} fill={KRP.white} stroke={INK} strokeWidth={4} strokeDasharray="8 6" />
              <ellipse cx={0} cy={0} rx={rxB} ry={80 + i * 6} fill={KRP.white} stroke={INK} strokeWidth={5} strokeDasharray="12 9" />
              {!(i === 4 && flyOff > 0) && <g transform={`translate(0 ${10 + Math.sin(f / 6 + i) * 3})`}>{contents[i]()}</g>}
            </g>
          );
        })}
        {/* 飛び去る羽の器 */}
        {flyOff > 0 && (
          <g transform={`translate(${lerp(1620, 1900, flyOff)} ${lerp(390, 20, flyOff)}) rotate(${-12 + Math.sin(f / 4) * 6})`}>
            {vessel(1.3, true, true, true)}
          </g>
        )}
        {/* びっくりの線 */}
        {shock > 0.3 && (
          <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round">
            <line x1={1560} y1={560} x2={1530} y2={526} /><line x1={1620} y1={548} x2={1620} y2={504} /><line x1={1680} y1={560} x2={1712} y2={526} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #80 水がたまると笛が鳴る、という仕組みも、後の時代の人が考えた、復元です。
// 格: 図 / seed 6080
// 絵: どこ: 現代の研究室の製図机 (電気スタンド・定規・消しゴムのかす・コーヒーカップ・壁に古代の柱の写真)。演出: 図の主役は机の上の大きな製図用紙。そこに、水の器と管と笛の「復元図」が、**すべて点線と鉛筆の下書き**で描かれていて、図の角に赤い判子「復元」。研究者 (一般の現代の人・男性・眼鏡・灰色のセーター) が鉛筆で笛の部分を描き足し、笛から点線の音符が「ぴー?」と出かかるが、音符の頭に「?」が付いたまま宙で止まる。研究者は消しゴムを持って首をかしげ、描き直す (腕は2本、pose で右手に鉛筆、左手に消しゴム)。カメラは用紙の全体から笛の部分へ寄る。動き: f0-40 鉛筆の線 / f40-70 音符が出かかって止まる / f80-130 消しゴムでこする
// どこ: 現代の研究室。壁 (古代の柱の写真をピン留め・電気スタンド)・傾けた製図板・方眼の製図用紙・定規・消しゴムのかす・コーヒーカップ
// 演出: 図の主役は製図用紙の「復元図」。水の器・管・笛がすべて点線と鉛筆の下書きで、角に赤い判子「復元」。研究者 (現代の男性・眼鏡・灰色のセーター) が鉛筆で笛を描き足すと、笛から点線の音符「ぴー?」が出かかり、頭に「?」が付いたまま宙で止まる。研究者は首をかしげ、消しゴムで笛をこすって描き直す (右手に鉛筆→消しゴム、左手に消しゴム→鉛筆の持ちかえ。腕は2本)
// 動き: f0-20 鉛筆の線が笛を描く / f20-34 音符が出かかって止まる / f24-60 カメラが笛へ寄る / f36-60 首をかしげる / f80-125 消しゴムでこする (かすが増える) / f130-175 別の形の笛を描き直す
const Mz080: React.FC<{ f: number }> = ({ f }) => {
  const draw = seg(f, 0, 20);
  const note = easeOut(seg(f, 20, 34));
  const z = lerp(1, 1.18, easeInOut(seg(f, 24, 60)));
  const tilt = easeOut(seg(f, 36, 48)) * (1 - seg(f, 70, 80));
  const erasing = f >= 80 && f < 126;
  const erased = seg(f, 80, 125);
  const redraw = seg(f, 130, 175);
  const holdEraser = f >= 78;
  const rub = erasing ? Math.sin(f / 1.6) * 14 : 0;
  const tipX = 1236 + rub, tipY = 636;
  const dash = { stroke: C.pencil, strokeWidth: 5, strokeDasharray: "14 9", fill: "none", strokeLinecap: "round" as const };
  return (
    <Frame f={f} seed={6080} bg={C.labWall}>
      <g transform={zoomAt(z, 1150, 560)}>
        {/* 壁 */}
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.labWall} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-200} y1={120 + i * 260} x2={2200} y2={120 + i * 260} stroke="#C9D2C8" strokeWidth={3} />)}
        {/* 古代の柱の写真 (ピン留め) */}
        <g transform={`rotate(4 1660 190)`}>
          <rect x={1540} y={90} width={240} height={190} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <rect x={1556} y={106} width={208} height={140} fill="#C9B994" />
          {[1600, 1660, 1720].map((cx) => <rect key={cx} x={cx - 14} y={130} width={28} height={110} fill={C.greek} stroke={INK} strokeWidth={2.5} />)}
          <rect x={1580} y={118} width={170} height={14} fill={C.greek} stroke={INK} strokeWidth={2.5} />
          <circle cx={1660} cy={98} r={9} fill={KRP.red} stroke={INK} strokeWidth={3} />
        </g>
        {/* 製図板と用紙 */}
        <rect x={170} y={140} width={1230} height={720} rx={10} fill={MP.woodLight} stroke={INK} strokeWidth={7} />
        <rect x={220} y={190} width={1120} height={610} fill={C.draft} stroke={INK} strokeWidth={4} />
        {Array.from({ length: 23 }, (_, i) => <line key={`v${i}`} x1={220 + i * 50} y1={190} x2={220 + i * 50} y2={800} stroke={C.draftGrid} strokeWidth={2} />)}
        {Array.from({ length: 13 }, (_, i) => <line key={`h${i}`} x1={220} y1={190 + i * 50} x2={1340} y2={190 + i * 50} stroke={C.draftGrid} strokeWidth={2} />)}
        {[[232, 202], [1328, 202], [232, 788], [1328, 788]].map(([tx, ty], i) => (
          <rect key={i} x={tx - 26} y={ty - 12} width={52} height={24} fill="#E8D99A" opacity={0.9} stroke={INK} strokeWidth={2.5} transform={`rotate(${i % 2 ? -35 : 35} ${tx} ${ty})`} />
        ))}
        {/* 復元図 (すべて点線の下書き) */}
        <path d="M 380 700 Q 340 600 350 470 Q 356 400 400 380 L 560 380 Q 600 400 606 470 Q 616 600 576 700 Z" {...dash} />
        <path d="M 360 560 q 60 14 120 0 q 60 -14 120 0" {...dash} stroke={C.waterLine} />
        <path d="M 560 400 L 900 400 Q 960 400 970 460 L 980 600" {...dash} />
        <path d="M 940 600 L 1020 600" {...dash} />
        {/* 寸法線と小さな「?」 */}
        <path d="M 330 740 L 620 740 M 330 730 L 330 750 M 620 730 L 620 750" stroke={C.pencil} strokeWidth={3} opacity={0.6} />
        <text x={760} y={372} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.pencil} opacity={0.7}>?</text>
        <text x={420} y={340} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.pencil} opacity={0.7}>?</text>
        {/* 笛 (鉛筆で描き足す → こすって消す) */}
        <defs><clipPath id="mzd080draw"><rect x={1000} y={540} width={260 * draw} height={120} /></clipPath></defs>
        <g clipPath="url(#mzd080draw)" opacity={1 - 0.75 * erased}>
          <rect x={1020} y={572} width={220} height={56} rx={10} {...dash} />
          <path d="M 1100 572 L 1120 552 L 1140 572" {...dash} />
        </g>
        {/* 描き直した笛 (別の形) */}
        {redraw > 0 && (
          <g opacity={redraw}>
            <path d="M 1020 580 L 1200 566 L 1250 540 L 1250 660 L 1200 634 L 1020 620 Z" {...dash} />
          </g>
        )}
        {/* 消しゴムのかす */}
        {Array.from({ length: 14 }, (_, i) => {
          const show = i < 5 || erased * 14 > i - 5;
          return show ? <path key={i} d={`M ${1040 + rnd(80, i) * 230} ${640 + rnd(81, i) * 110} q 8 -4 14 2`} stroke="#E7A9A9" strokeWidth={6} strokeLinecap="round" fill="none" /> : null;
        })}
        {/* 出かかって止まった点線の音符 */}
        {note > 0 && (
          <g transform={`translate(${lerp(1240, 1290, note)} ${lerp(600, 470, note) + (f > 34 ? Math.sin(f / 7) * 3 : 0)})`} opacity={1 - 0.8 * erased}>
            <ellipse cx={0} cy={0} rx={22} ry={16} fill="none" stroke={C.pencil} strokeWidth={5} strokeDasharray="8 6" transform="rotate(-20)" />
            <path d="M 20 -6 L 20 -80 Q 40 -70 46 -50" fill="none" stroke={C.pencil} strokeWidth={5} strokeDasharray="8 6" />
            <text x={40} y={-90} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.red}>？</text>
            <text x={-30} y={60} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.pencil}>ぴー?</text>
          </g>
        )}
        {/* 赤い判子「復元」 */}
        <g transform={`translate(340 270) rotate(-8) scale(${pop(seg(f, 6, 16))})`}>
          <rect x={-92} y={-44} width={184} height={88} rx={12} fill="none" stroke={KRP.red} strokeWidth={7} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.red}>復元</text>
        </g>
        {/* 定規 */}
        <g transform="rotate(-12 760 760)">
          <rect x={560} y={740} width={420} height={40} fill="#F3E3A0" opacity={0.9} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 20 }, (_, i) => <line key={i} x1={575 + i * 20} y1={740} x2={575 + i * 20} y2={i % 5 ? 752 : 762} stroke={INK} strokeWidth={2.5} />)}
        </g>
        {/* 板の下の溝 (鉛筆) とコーヒーカップ */}
        <rect x={170} y={850} width={1230} height={26} fill={MP.wood} stroke={INK} strokeWidth={5} />
        <rect x={260} y={842} width={140} height={10} rx={5} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
        <g>
          <path d="M 40 760 L 52 840 L 116 840 L 128 760 Z" fill={KRP.white} stroke={INK} strokeWidth={5} />
          <path d="M 128 776 q 30 8 0 40" stroke={INK} strokeWidth={5} fill="none" />
          <ellipse cx={84} cy={762} rx={42} ry={10} fill="#6B4A30" stroke={INK} strokeWidth={4} />
          {[0, 1].map((k) => <path key={k} d={`M ${70 + k * 24} ${740 - ((f + k * 20) % 40)} q 10 -12 0 -24`} stroke={KRP.gray} strokeWidth={4} fill="none" opacity={0.6} />)}
        </g>
        {/* 電気スタンド */}
        <path d="M 60 -40 L 300 70" stroke={MP.iron} strokeWidth={12} strokeLinecap="round" />
        <path d="M 270 40 L 380 40 L 400 110 L 250 110 Z" fill="#5E7F9A" stroke={INK} strokeWidth={5} />
        <polygon points="260,110 390,110 900,700 300,700" fill={MP.glow} opacity={0.14} />
        {/* 研究者 (男性・眼鏡・灰色のセーター) */}
        <g transform={`rotate(${-5 * tilt + (erasing ? Math.sin(f / 1.6) * 1.2 : 0)} 1480 900)`}>
          <Person x={1480} y={900} s={1.2} f={f} pose="point" pointDir={-1} glasses cloth={C.sweater} clothDark="#4A5060"
            face={f >= 34 && f < 80 ? "worried" : erasing ? "normal" : "smile"} gaze={[-5, 2]} />
          {/* セーターのしま */}
          <path d="M 1412 760 L 1548 760 M 1412 776 L 1548 776" stroke={C.sweaterDark} strokeWidth={4} />
          {/* 指す手の道具 */}
          {holdEraser ? (
            <g>
              <line x1={1300} y1={722} x2={tipX + 20} y2={tipY + 10} stroke={C.sweater} strokeWidth={4} opacity={0} />
              <rect x={tipX - 30} y={tipY - 18} width={60} height={36} rx={6} fill="#E7A9A9" stroke={INK} strokeWidth={4} transform={`rotate(-20 ${tipX} ${tipY})`} />
            </g>
          ) : (
            <g>
              <line x1={1300} y1={722} x2={tipX} y2={tipY} stroke={KRP.yellow} strokeWidth={12} strokeLinecap="round" />
              <line x1={1300} y1={722} x2={tipX} y2={tipY} stroke={INK} strokeWidth={2} />
              <circle cx={tipX} cy={tipY} r={5} fill={INK} />
            </g>
          )}
          {/* 下ろした手の道具 */}
          {holdEraser ? (
            <line x1={1560} y1={830} x2={1570} y2={760} stroke={KRP.yellow} strokeWidth={12} strokeLinecap="round" />
          ) : (
            <rect x={1540} y={820} width={44} height={26} rx={5} fill="#E7A9A9" stroke={INK} strokeWidth={4} />
          )}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #81 はっきりした目覚まし時計が出てくるのは、15世紀ごろ、とされます。
// 格: 山 / seed 6081
// 絵: どこ: 15世紀ヨーロッパの町の朝 (木組みの家・石畳・教会の尖塔)。#73 の民家を外から見る。演出: 霧の朝の町並みに、窓のひとつから**カーンカーンカーン**と鉄のベルの音の線が飛び出す。音の線が、それまでの点線のぼんやりした絵 (#76〜#80 の点線) と違って、**くっきりした実線**で描かれる。年代札「15世紀ごろ」と小さな「?」の点線の丸 (とされる)。窓の中で寝ていた男性が跳ね起き、窓をばんと開けて外に顔を出す (face="surprised")。向かいの家の窓では、頭巾の女性が何事かと顔を出す。カメラは町並みの引きから、その窓へ寄る。動き: f0-30 霧 / f30 ベルの音 / f40-80 寄り / f80 窓がばん / 向かいの女性
// どこ: 15世紀ヨーロッパの町の霧の朝。木組みの家 (しっくいの壁に黒い梁・急な屋根・木の雨戸) が2軒、奥に教会の尖塔と屋根並み、石畳、屋根の鳩
// 演出: #73 の民家を外から見る。閉じた雨戸のすき間から、くっきりした実線の鐘の音の線がカーンカーンと飛び出す (これまでの点線とちがう)。雨戸がばんと開き、ナイトキャップの男が目を丸くして顔を出す。向かいの家では頭巾の女性が何事かと顔を出す。屋根の鳩が驚いて飛び立つ。年代札「15世紀ごろ」と点線の「?」の丸 (とされる)
// 動き: f0-30 霧が流れて薄くなる / f8〜 音の線 / f10-40 カメラが窓へ寄る / f26-30 雨戸がばん / f28-34 男が飛び出す / f34-40 向かいの女性 / f10〜 鳩が飛び立つ
const Mz081: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.28, easeInOut(seg(f, 10, 40)));
  const ring = f >= 8 ? 1 : 0;
  const open = easeOut(seg(f, 26, 30));
  const man = pop(seg(f, 28, 34));
  const woman = easeOut(seg(f, 34, 42));
  const fog = 1 - 0.6 * seg(f, 0, 40);
  const WX = 560, WY = 430, WW = 200, WH = 170;
  const WX2 = 1340, WY2 = 400;
  const [skyT, skyB] = skyColors(1.55);
  const house = (x0: number, w: number, top: number, key: string) => (
    <g key={key}>
      <path d={`M ${x0 - 30} ${top + 200} L ${x0 + w / 2} ${top} L ${x0 + w + 30} ${top + 200} Z`} fill={C.terraDark} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x0 + w / 2 - (i + 1) * (w / 12)} y1={top + (i + 1) * 30} x2={x0 + w / 2 + (i + 1) * (w / 12)} y2={top + (i + 1) * 30} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
      <rect x={x0} y={top + 200} width={w} height={760 - top - 200 + 100} fill={C.plaster} stroke={INK} strokeWidth={6} />
      {/* 木組み (黒い梁) */}
      <g stroke={C.timber} strokeWidth={14} strokeLinecap="square">
        <line x1={x0} y1={top + 210} x2={x0 + w} y2={top + 210} />
        <line x1={x0} y1={620} x2={x0 + w} y2={620} />
        <line x1={x0 + 14} y1={top + 200} x2={x0 + 14} y2={860} />
        <line x1={x0 + w - 14} y1={top + 200} x2={x0 + w - 14} y2={860} />
        <line x1={x0 + 14} y1={620} x2={x0 + w * 0.3} y2={top + 210} />
        <line x1={x0 + w - 14} y1={620} x2={x0 + w * 0.7} y2={top + 210} />
      </g>
      <rect x={x0 + w / 2 - 60} y={680} width={120} height={180} rx={8} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
      <circle cx={x0 + w / 2 + 36} cy={770} r={7} fill={MP.iron} />
    </g>
  );
  // 窓 (中の暗がり・人・下の壁でかくす・雨戸)
  const win = (x: number, y: number, o: number, person: React.ReactNode, key: string) => (
    <g key={key}>
      <rect x={x - WW / 2} y={y - WH / 2} width={WW} height={WH} fill="#3A3040" stroke={INK} strokeWidth={6} />
      {person}
      <rect x={x - WW / 2 - 20} y={y + WH / 2} width={WW + 40} height={150} fill={C.plaster} />
      <line x1={x - WW / 2 - 20} y1={620} x2={x + WW / 2 + 20} y2={620} stroke={C.timber} strokeWidth={14} />
      <rect x={x - WW / 2 - 20} y={y + WH / 2 - 4} width={WW + 40} height={22} fill={MP.wood} stroke={INK} strokeWidth={5} />
      {/* 雨戸 (左右の板) */}
      {[-1, 1].map((sd) => {
        const k = lerp(1, -0.25, o);
        return (
          <g key={sd} transform={`translate(${x + sd * WW / 2} ${y}) scale(${k} 1) translate(${-sd * WW / 2} 0)`}>
            <rect x={sd === -1 ? 0 : -WW / 2} y={-WH / 2} width={WW / 2} height={WH} fill={MP.wood} stroke={INK} strokeWidth={5} />
            {[-40, 0, 40].map((dy) => <line key={dy} x1={sd === -1 ? 8 : -WW / 2 + 8} y1={dy} x2={sd === -1 ? WW / 2 - 8 : -8} y2={dy} stroke={MP.woodDark} strokeWidth={4} />)}
          </g>
        );
      })}
    </g>
  );
  return (
    <Frame f={f} seed={6081} bg={skyT}>
      <g transform={zoomAt(z, 600, 440)}>
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-200} y={-200 + i * 110} width={2400} height={112} fill={mixColor(skyT, skyB, i / 7)} />)}
        {/* 奥の屋根並みと教会の尖塔 */}
        <path d="M -200 620 L -100 520 L 0 600 L 100 500 L 220 600 L 900 600 L 960 520 L 1040 600 L 1440 600 L 1440 360 L 1500 120 L 1560 360 L 1560 600 L 1700 600 L 1780 500 L 1880 600 L 2100 560 L 2100 1000 L -200 1000 Z" fill="#A7A9BA" stroke={INK} strokeWidth={4} />
        <path d="M 1500 120 L 1500 70 M 1484 86 L 1516 86" stroke={INK} strokeWidth={5} />
        {[1470, 1530].map((x) => <rect key={x} x={x - 8} y={420} width={16} height={36} rx={8} fill="#6E7086" />)}
        {/* 霧 (奥) */}
        <rect x={-200} y={520} width={2400} height={160} fill={MP.mist} opacity={0.5 * fog} />
        {/* 2軒の家 */}
        {house(260, 600, 110, "a")}
        {house(1060, 580, 90, "b")}
        {win(WX, WY, open, (
          <g transform={`translate(0 ${(1 - man) * 170})`}>
            <Person x={WX} y={WY + 210} s={0.85} f={f} pose="banzai" face="surprised" cloth={C.tunic} clothDark={C.tunicDark} lean={-4} />
            {/* ナイトキャップ */}
            <path d={`M ${WX - 54} ${WY + 210 - 236} Q ${WX - 50} ${WY + 210 - 290} ${WX + 10} ${WY + 210 - 286} Q ${WX + 70} ${WY + 210 - 300} ${WX + 96} ${WY + 210 - 250} Q ${WX + 60} ${WY + 210 - 262} ${WX + 54} ${WY + 210 - 236} Z`} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <circle cx={WX + 98} cy={WY + 210 - 246} r={11} fill={KRP.white} stroke={INK} strokeWidth={4} />
          </g>
        ), "w1")}
        {win(WX2, WY2, woman, (
          <g transform={`translate(${(1 - woman) * 60} ${(1 - woman) * 160})`}>
            <MzDOld x={WX2} y={WY2 + 200} s={0.78} f={f} phase={4} hood robe="ankle" cloth={C.womanRed} clothDark={C.womanRedDark} face="worried" lean={6} />
          </g>
        ), "w2")}
        {/* 窓ぎわの植木鉢 */}
        <rect x={WX2 - 70} y={WY2 + 60} width={60} height={30} fill={C.terra} stroke={INK} strokeWidth={4} />
        <circle cx={WX2 - 50} cy={WY2 + 54} r={12} fill={KRP.red} stroke={INK} strokeWidth={3} />
        <circle cx={WX2 - 28} cy={WY2 + 50} r={12} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
        {/* 石畳 */}
        <rect x={-200} y={860} width={2400} height={400} fill="#9D968A" />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 26 }, (_, k) => (
          <ellipse key={`${r}-${k}`} cx={-180 + k * 90 + (r % 2) * 45} cy={880 + r * 50} rx={40} ry={20} fill="#B3AC9E" stroke={INK} strokeWidth={3} />
        )))}
        {/* くっきり実線の鐘の音 (窓から) */}
        <MzDRing x={WX} y={WY} r={130} amt={ring} f={f} color={INK} w={8} />
        {[0, 1, 2].map((k) => {
          const p = ((f - 8 + k * 9) % 27) / 27;
          if (f < 8) return null;
          return <circle key={k} cx={WX} cy={WY} r={120 + p * 260} fill="none" stroke={INK} strokeWidth={6 * (1 - p) + 1} opacity={(1 - p) * 0.8} />;
        })}
        {/* 屋根の鳩が飛び立つ */}
        {[0, 1, 2].map((k) => {
          const t = seg(f, 10 + k * 3, 60 + k * 3);
          const bx = lerp(760 + k * 50, 1100 + k * 160, t);
          const byy = lerp(250 - k * 14, -40 + k * 40, t);
          const wing = Math.sin(f / 1.8 + k) * 16;
          return (
            <g key={k} transform={`translate(${bx} ${byy})`}>
              <ellipse cx={0} cy={0} rx={22} ry={13} fill={C.bird} stroke={INK} strokeWidth={3} />
              <circle cx={18} cy={-8} r={9} fill={C.bird} stroke={INK} strokeWidth={3} />
              <path d={`M -6 -4 L -26 ${-24 - wing} L 8 -6 Z`} fill={KRP.gray} stroke={INK} strokeWidth={3} />
            </g>
          );
        })}
        {/* 霧 (手前) */}
        {[0, 1].map((k) => (
          <ellipse key={k} cx={((f * (2 + k)) % 2600) - 300 + k * 900} cy={700 + k * 90} rx={700} ry={70} fill={MP.mist} opacity={0.45 * fog} />
        ))}
      </g>
      <TagPlate x={1480} y={190} text="15世紀ごろ" size={46} t={seg(f, 2, 12)} />
      <MzDDotQ x={1720} y={190} r={34} t={seg(f, 8, 16)} f={f} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #82 ヨーロッパで、鉄でできた、壁掛けの目覚まし時計が、使われるようになりました。
// 格: 並 / seed 6082
// 絵: どこ: #81 の民家の寝室の中。石の壁・木のベッド・ろうそく。演出: 主役は壁の鉄の目覚まし時計 (#73 と同じもの)。作り込み: 黒い鉄の四角い枠・四隅の小さな柱・てっぺんの鉄の椀形ベルとハンマー・文字盤は1本針・下に垂れた石のおもり2つ (縄つき)・文字盤のふちに小さな穴が並ぶ。家の主人 (素朴な服の男性) が、ベッドの上に立って壁にくぎを打ち、時計を掛けたところ。おもりの縄を引いて巻き上げると、歯車がカチカチ動きだす (腕は2本、pose で両手で縄を引く)。カメラは時計に寄って、短辺いっぱいに。動き: f0-40 時計を掛ける / f40-90 おもりを巻き上げる / f90 振り子のような天符が左右に動きだす
// どこ: #81 の民家の寝室の中 (#73 と同じ部屋)。石の壁・壁の棚のろうそく・小窓・木のベッド・床板
// 演出: 主役は壁の鉄の目覚まし時計 (#73 と同じ物。黒い鉄の枠・四隅の柱・椀形のベルとハンマー・1本針・ふちの穴・石のおもり2つ)。家の主人 (素朴な服の男性) がベッドの上に立ち、くぎに掛け終えたところ。両手で縄を引くと、おもりが上がり、歯車が動きだし、てんぷが左右に振れはじめる
// 動き: f0-22 掛けた時計がゆらゆら揺れて止まる (くぎに「コン」) / f22〜 両手で縄を引く (12コマに1回) / f24-100 おもりが上がる / f28-38 てんぷが振れだす・歯車が回る / f50-150 カメラが時計に寄る
const Mz082: React.FC<{ f: number }> = ({ f }) => {
  const sway = 7 * Math.cos(f / 3) * (1 - seg(f, 0, 22));
  const pulling = f >= 22;
  const pullC = pulling ? Math.max(0, Math.sin(((f - 22) / 12) * Math.PI)) : 0;
  const wUp = seg(f, 24, 100);
  const fol = 16 * seg(f, 28, 38);
  const gear = f > 28 ? (f - 28) * 3 : 0;
  const z = lerp(1, 1.32, easeInOut(seg(f, 50, 150)));
  const CX = 760, CY = 400, CS = 1.75;
  const nailY = CY - 166 * CS;
  const MX = 1180, MY = 760, MS = 1.1;
  const handX = MX - 4 * pullC, handY = MY - 118 * MS + 6 * pullC;
  return (
    <Frame f={f} seed={6082} dark bg={C.roomStoneDark}>
      <g transform={zoomAt(z, CX, 470)}>
        <MzDStone x={-200} y={-200} w={2400} h={1060} sh={78} base={C.roomStone} dark={C.roomStoneDark} light={C.roomStoneLight} seed={82} />
        {/* 小窓 (夜) */}
        <path d="M 1560 320 L 1560 210 A 70 70 0 0 1 1700 210 L 1700 320 Z" fill={MP.nightDeep} stroke={INK} strokeWidth={6} />
        {[[1590, 230], [1660, 190], [1640, 280]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={2.6} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 8 + i)} />)}
        <rect x={1546} y={316} width={168} height={18} fill={C.roomStoneLight} stroke={INK} strokeWidth={5} />
        {/* 壁の棚とろうそく・水差し */}
        <rect x={1360} y={460} width={260} height={20} fill={MP.wood} stroke={INK} strokeWidth={5} />
        <path d="M 1380 480 L 1400 520 M 1600 480 L 1580 520" stroke={MP.woodDark} strokeWidth={8} />
        <rect x={1410} y={410} width={22} height={50} fill={KRP.white} stroke={INK} strokeWidth={3} />
        <Flame x={1421} y={410} s={0.8} f={f} glow={1.4} />
        <circle cx={1421} cy={390} r={300} fill={MP.glow} opacity={0.08 + 0.015 * Math.sin(f / 4)} />
        <path d="M 1500 460 Q 1484 420 1500 400 L 1530 400 Q 1546 420 1530 460 Z" fill={C.terra} stroke={INK} strokeWidth={4} />
        {/* 床 */}
        <rect x={-200} y={860} width={2400} height={400} fill={C.floorDark} />
        {[910, 980].map((ly) => <line key={ly} x1={-200} y1={ly} x2={2200} y2={ly} stroke={C.floorDarkLine} strokeWidth={4} />)}
        <line x1={-200} y1={860} x2={2200} y2={860} stroke={INK} strokeWidth={5} />
        {/* ベッド */}
        <rect x={950} y={620} width={34} height={250} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={1700} y={700} width={30} height={170} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={970} y={780} width={740} height={70} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={974} y={756} width={730} height={32} rx={12} fill="#D8C9A2" stroke={INK} strokeWidth={4} />
        <path d="M 1300 760 Q 1400 726 1520 744 Q 1640 740 1700 770 L 1700 790 L 1290 790 Z" fill="#7C6A9A" stroke={INK} strokeWidth={5} />
        {/* 鉄の壁掛け目覚まし時計 (くぎに掛けた直後に揺れる) */}
        <g transform={`rotate(${sway} ${CX} ${nailY})`}>
          <MzDIronClock x={CX} y={CY} s={CS} f={f} gear={gear} hand={150} foliot={fol} wUp={wUp} />
          {/* 引き縄の滑車 */}
          <circle cx={CX + 50 * CS} cy={CY + 118 * CS} r={10} fill={MP.ironLight} stroke={INK} strokeWidth={4} />
        </g>
        {/* くぎを打った「コン」 */}
        {f < 12 && (
          <g stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 0, 12)}>
            <line x1={CX - 30} y1={nailY - 20} x2={CX - 56} y2={nailY - 40} /><line x1={CX + 30} y1={nailY - 20} x2={CX + 56} y2={nailY - 40} /><line x1={CX} y1={nailY - 30} x2={CX} y2={nailY - 60} />
          </g>
        )}
        {/* 引き縄 (滑車 → 主人の手) */}
        <path d={`M ${CX + 50 * CS + 8} ${CY + 118 * CS} Q ${(CX + 50 * CS + handX) / 2} ${CY + 118 * CS + 30 - 20 * pullC} ${handX} ${handY}`} stroke="#B89A6A" strokeWidth={5} fill="none" />
        <path d={`M ${handX} ${handY} q 6 40 -4 70`} stroke="#B89A6A" strokeWidth={5} fill="none" />
        {/* 主人 (素朴な服の男性)。ベッドの上に立つ */}
        <g transform={`rotate(${pulling ? 7 * pullC : 0} ${MX} ${MY})`}>
          <Person x={MX} y={MY} s={MS} f={f} pose={pulling ? "hold" : "raise"} face={pulling ? (pullC > 0.5 ? "worried" : "smile") : "joy"}
            cloth={C.tunic} clothDark={C.tunicDark} gaze={[-5, -3]} />
          <path d={`M ${MX - 64} ${MY - 66} L ${MX + 64} ${MY - 66}`} stroke={C.tunicDark} strokeWidth={8} />
          {!pulling && (
            <g transform={`rotate(${Math.sin(f / 4) * 10} ${MX + 74} ${MY - 253})`}>
              <line x1={MX + 74} y1={MY - 240} x2={MX + 74} y2={MY - 310} stroke={MP.woodDark} strokeWidth={8} strokeLinecap="round" />
              <rect x={MX + 50} y={MY - 330} width={48} height={24} rx={4} fill={MP.iron} stroke={INK} strokeWidth={4} />
            </g>
          )}
        </g>
        {/* 動きだした「カチカチ」の線 */}
        {f > 30 && Math.floor(f / 6) % 2 === 0 && (
          <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
            <line x1={CX - 160} y1={CY + 40} x2={CX - 190} y2={CY + 30} /><line x1={CX - 160} y1={CY + 70} x2={CX - 192} y2={CY + 76} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #83 鳴らしたい時刻の穴に、ピンを差しておくと、そこでベルが鳴るしくみです。
// 格: 山 / seed 6083
// 絵: どこ: #82 の寝室の、鉄の時計の文字盤の超大写し (ろうそくの光で鉄が鈍く光る)。演出: 主人の指先が小さな鉄のピンをつまみ、文字盤のふちの穴のひとつにぐっと差し込む。カメラが引くと、主人はもうベッドで寝ている (夜の窓)。1本針がゆっくり回り、ピンに**こつん**と当たった瞬間、ピンが引き金を外して、てっぺんのハンマーがベルを**カンカンカン**と連打する。ベッドの主人が布団ごと宙に飛び上がる (face="surprised")。札は「ピン」の1語だけ。カメラは文字盤の寄り→引き→針とピンへ再び寄る。動き: f0-30 ピンを差す / f30-60 引き・寝る / f60-110 針がピンに近づく / f110 こつん→カンカン / f115 飛び上がる
// どこ: #82 の寝室の夜。鉄の時計の文字盤の超大写しから入る (ろうそくの光で鉄が鈍く光る)。石の壁・月の小窓・ベッド・腰掛けのろうそく
// 演出: 主人の指先が小さな鉄のピンをつまみ、文字盤のふちの穴にぐっと差し込む。カメラが引くと主人はもうベッドで寝ている。1本針がゆっくり回ってピンにこつんと当たり、ハンマーがベルをカンカンと連打。主人が布団ごと宙に飛び上がる。札は「ピン」だけ
// 動き: f0-10 ピンを差す (超大写し) / f12-26 引き・寝ている / f14-32 針がピンに近づく / f32 こつん→連打 / f34-58 布団ごと飛び上がる (f46 が頂点) / f50-110 カメラが針とピンへ再び寄る / f85-110 鳴りやむ
const Mz083: React.FC<{ f: number }> = ({ f }) => {
  const CX = 700, CY = 360, CS = 1.4, PIN = 120;
  const pa = (PIN * Math.PI) / 180;
  const PX = CX + Math.sin(pa) * MZD_RIM * CS, PY = CY + (38 - Math.cos(pa) * MZD_RIM) * CS;
  const t1 = easeInOut(seg(f, 12, 26));
  const t2 = easeInOut(seg(f, 50, 110));
  let z = lerp(3.4, 1, t1), cx = lerp(PX, 960, t1), cy = lerp(PY, 540, t1);
  z = lerp(z, 1.7, t2); cx = lerp(cx, 740, t2); cy = lerp(cy, 430, t2);
  const pinOut = 14 * (1 - easeOut(seg(f, 2, 10)));
  const fingerAway = easeInOut(seg(f, 10, 16));
  const ht = seg(f, 14, 32);
  const hand = PIN - 60 + 60 * ht * ht - 3.5;
  const hit = f >= 32;
  const ring = f >= 33 ? 1 - seg(f, 85, 110) : 0;
  const jt = seg(f, 34, 58);
  const jy = -170 * Math.sin(Math.PI * jt);
  const awake = f >= 33;
  return (
    <Frame f={f} seed={6083} dark bg={C.roomStoneDark}>
      <g transform={camC(z, cx, cy)}>
        <MzDStone x={-300} y={-300} w={2600} h={1160} sh={78} base={C.roomStone} dark={C.roomStoneDark} light={C.roomStoneLight} seed={83} />
        {/* 月の小窓 */}
        <path d="M 180 300 L 180 190 A 80 80 0 0 1 340 190 L 340 300 Z" fill={MP.nightDeep} stroke={INK} strokeWidth={6} />
        <circle cx={300} cy={180} r={28} fill="#FFF3C8" /><circle cx={312} cy={172} r={24} fill={MP.nightDeep} />
        <rect x={166} y={296} width={188} height={18} fill={C.roomStoneLight} stroke={INK} strokeWidth={5} />
        {/* 床 */}
        <rect x={-300} y={860} width={2600} height={400} fill={C.floorDark} />
        <line x1={-300} y1={860} x2={2300} y2={860} stroke={INK} strokeWidth={5} />
        {[910, 980].map((ly) => <line key={ly} x1={-300} y1={ly} x2={2300} y2={ly} stroke={C.floorDarkLine} strokeWidth={4} />)}
        {/* 腰掛けとろうそく */}
        <rect x={850} y={740} width={110} height={20} fill={MP.wood} stroke={INK} strokeWidth={5} />
        <path d="M 864 760 L 856 860 M 946 760 L 954 860" stroke={MP.woodDark} strokeWidth={10} />
        <rect x={894} y={696} width={22} height={46} fill={KRP.white} stroke={INK} strokeWidth={3} />
        <Flame x={905} y={696} s={0.8} f={f} glow={1.4} />
        <circle cx={905} cy={680} r={320} fill={MP.glow} opacity={0.09 + 0.015 * Math.sin(f / 4)} />
        {/* ベッド */}
        <rect x={980} y={600} width={34} height={270} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={1700} y={690} width={30} height={180} rx={6} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={1000} y={770} width={720} height={70} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={1004} y={744} width={712} height={32} rx={12} fill="#D8C9A2" stroke={INK} strokeWidth={4} />
        {/* 主人 (布団ごと飛び上がる) */}
        <g transform={`translate(0 ${jy}) rotate(${-6 * Math.sin(Math.PI * jt)} 1300 700)`}>
          <ellipse cx={1090} cy={740} rx={86} ry={22} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <MzDSleeper x={1330} y={706} s={1.0} f={f} face={awake ? "surprised" : "normal"} sleep={!awake} cap cloth={C.tunic} clothDark={C.tunicDark} />
          <path d="M 1190 636 Q 1260 616 1400 622 Q 1600 626 1706 670 L 1706 774 L 1176 774 Q 1160 700 1190 636 Z" fill="#7C6A9A" stroke={INK} strokeWidth={6} />
          <rect x={1420} y={664} width={86} height={60} fill="#9A88B6" stroke={INK} strokeWidth={3} strokeDasharray="6 5" />
          {awake && jt > 0 && jt < 1 && (
            <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round">
              <line x1={1080} y1={580} x2={1066} y2={530} /><line x1={1130} y1={584} x2={1150} y2={536} /><line x1={1030} y1={600} x2={996} y2={570} />
            </g>
          )}
        </g>
        {awake && jt > 0.1 && jt < 0.95 && (
          <g stroke={INK} strokeWidth={4} opacity={0.5}>
            {[1200, 1400, 1600].map((lx) => <line key={lx} x1={lx} y1={800} x2={lx} y2={850} />)}
          </g>
        )}
        {!awake && f > 12 && [0, 1, 2].map((k) => {
          const p = ((f + k * 10) % 30) / 30;
          return <text key={k} x={1060 + p * 50 + k * 10} y={600 - p * 90} fontFamily={FONT} fontWeight={900} fontSize={28 + k * 8} fill={KRP.white} opacity={(1 - p) * 0.8}>z</text>;
        })}
        {/* 鉄の時計 */}
        <circle cx={CX} cy={CY + 50} r={200} fill={MP.glow} opacity={0.06 + ring * 0.08} />
        <MzDIronClock x={CX} y={CY} s={CS} f={f} gear={f * 1.5} ring={ring} hand={hand} pin={PIN} pinOut={pinOut} foliot={14} />
        {/* ろうそくの光で鉄が鈍く光る */}
        <path d={`M ${CX + 40} ${CY + 10} A 70 70 0 0 1 ${CX + 74} ${CY + 70}`} stroke={MP.glow} strokeWidth={5} fill="none" opacity={0.5} />
        {/* ピンをつまむ指先 */}
        {fingerAway < 1 && (
          <g transform={`translate(${fingerAway * 160} ${fingerAway * 40})`}>
            <rect x={PX + 14} y={PY - 6} width={120} height={22} rx={11} fill={C.tunic} stroke={INK} strokeWidth={3} transform={`rotate(14 ${PX + 14} ${PY})`} />
            <ellipse cx={PX + 6} cy={PY - 8} rx={9} ry={6} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
            <ellipse cx={PX + 8} cy={PY + 8} rx={9} ry={6} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
            <circle cx={PX + 18} cy={PY} r={10} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
          </g>
        )}
        {f >= 8 && f < 14 && <MzDSpark x={PX - 10} y={PY - 12} s={0.35} o={1 - seg(f, 8, 14)} />}
        {/* こつん */}
        {hit && f < 44 && <MzDSpark x={PX} y={PY} s={0.9} o={1 - seg(f, 32, 44)} rot={f * 10} />}
        <MzDRing x={CX} y={CY - 175 * CS * 0.75} r={56} amt={ring} f={f} color={MP.glow} w={7} />
        {/* 札「ピン」 */}
        <line x1={PX + 6} y1={PY - 6} x2={870} y2={326} stroke={KRP.white} strokeWidth={4} opacity={seg(f, 18, 26)} />
        <TagPlate x={900} y={300} text="ピン" size={40} color={KRP.red} t={seg(f, 18, 26)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #84 そのころのウィーンには、こんな時計が、残っています。
// 格: 並 / seed 6084
// 絵: どこ: 15世紀のウィーンの町を見下ろす夜明け前の景色。石の家並みの向こうに、高い石の塔がそびえる。BanninTou (ring=0, wake=0) の塔の外観から入る。演出: 主役は塔。カメラが町並みから塔の壁を**下から上へスクロール**して、てっぺんの小窓まで上がり、小窓の中へ入っていく (BanninTou の部屋の中が見えてくる)。部屋の中に大きな鐘と、壁の小さなベル付きの鉄の時計がランタンの光で浮かび、時計のベルだけがきらっと光る。年代札「15世紀前半」と「?」の点線の丸、地名札「ウィーン」。動き: f0-90 下から上へスクロール / f90-130 小窓へ寄る / f130 ベルがきらっ / 塔の旗がはためく
// どこ: 15世紀のウィーン、夜明け前。石の家並み (窓の灯) の向こうにそびえる高い石の塔 (積み石・張り出しの帯・細い窓・とんがり屋根と旗)。てっぺんの小窓の中は BanninTou (番人の部屋)
// 演出: 主役は塔。カメラが町並みから塔の壁を下から上へスクロールし、てっぺんの灯のともる小窓へ寄って、そのまま中へ入る。部屋の中に大きな鐘と、木箱の上の小さなベル付きの鉄の時計がランタンの光で浮かび、時計のベルだけがきらっと光る。わら布団では番人が毛布をかぶって寝ている (顔は出さず帽子だけ)。年代札「15世紀前半」と点線の「?」、地名札「ウィーン」
// 動き: f0-26 下から上へスクロール (旗がはためく) / f24-38 小窓へ寄る / f30-40 部屋の中へ切りかわる / f38-52 ベルがきらっ (f45 が頂点、f80 にもう一度) / f45-121 時計へゆっくり寄る / 毛布が寝息で上下
const Mz084: React.FC<{ f: number }> = ({ f }) => {
  const ty = lerp(0, 1580, easeInOut(seg(f, 0, 26)));
  const zi = seg(f, 24, 38);
  const zIn = lerp(1, 5.5, zi * zi);
  const inside = easeOut(seg(f, 30, 40));
  const zRoom = lerp(1.3, 1, inside) * lerp(1, 1.12, easeInOut(seg(f, 45, 121)));
  const [bx, by] = BANNIN_CLOCK;
  const sparkA = Math.sin(Math.PI * seg(f, 38, 52));
  const sparkB = Math.sin(Math.PI * seg(f, 80, 94));
  const spark = Math.max(sparkA, sparkB);
  const breath = Math.sin(f / 14) * 5;
  const [skyT, skyB] = skyColors(0.45);
  const flagW = Math.sin(f / 4) * 10;
  return (
    <Frame f={f} seed={6084} dark bg={skyT}>
      {/* 外: 空 (画面に固定) */}
      {inside < 1 && (
        <g opacity={1 - inside}>
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-20} y={i * 140 - 20} width={1960} height={142} fill={mixColor(skyT, skyB, i / 7)} />)}
          {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={rnd(84, i) * 1900} cy={rnd(85, i) * 600} r={2.4} fill="#FFF6D8" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />)}
          <g transform={`${zoomAt(zIn, 960, 380)} translate(0 ${ty})`}>
            {/* 塔 */}
            <MzDStone x={800} y={-1320} w={320} h={2420} sh={64} base={MP.stone} dark={MP.stoneDark} light={MP.stoneLight} seed={84} />
            <rect x={800} y={-1320} width={320} height={2420} fill="none" stroke={INK} strokeWidth={7} />
            {[-800, -300, 200, 650].map((ly) => <rect key={ly} x={780} y={ly} width={360} height={30} fill={MP.stoneLight} stroke={INK} strokeWidth={5} />)}
            {[-560, -60, 420].map((ly) => <rect key={ly} x={948} y={ly} width={24} height={80} rx={12} fill="#2A2438" stroke={INK} strokeWidth={4} />)}
            {/* てっぺんの部屋: 張り出し・小窓 (灯) */}
            <rect x={770} y={-1340} width={380} height={40} fill={MP.stoneLight} stroke={INK} strokeWidth={6} />
            <rect x={770} y={-1060} width={380} height={34} fill={MP.stoneLight} stroke={INK} strokeWidth={6} />
            <path d="M 890 -1100 L 890 -1240 A 70 70 0 0 1 1030 -1240 L 1030 -1100 Z" fill={MP.glow} stroke={INK} strokeWidth={6} />
            <path d="M 905 -1100 L 905 -1230 A 55 55 0 0 1 1015 -1230 L 1015 -1100 Z" fill="#E7B65E" opacity={0.7 + 0.1 * Math.sin(f / 3)} />
            <path d="M 925 -1110 Q 925 -1180 960 -1182 Q 995 -1180 995 -1110 Z" fill="#9C7A3E" stroke={INK} strokeWidth={4} />
            <path d="M 960 -1100 L 960 -1300 M 890 -1170 L 1030 -1170" stroke={MP.iron} strokeWidth={6} />
            <circle cx={960} cy={-1170} r={220} fill={MP.glow} opacity={0.12} />
            {/* とんがり屋根と旗 */}
            <path d="M 760 -1340 L 960 -1520 L 1160 -1340 Z" fill={MP.night} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            {Array.from({ length: 5 }, (_, i) => <line key={i} x1={800 + i * 10} y1={-1350 - i * 30} x2={1120 - i * 10} y2={-1350 - i * 30} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
            <line x1={960} y1={-1520} x2={960} y2={-1600} stroke={INK} strokeWidth={6} />
            <path d={`M 962 -1598 Q 1000 ${-1610 + flagW} 1040 -1594 Q 1020 ${-1578 - flagW} 1046 -1566 Q 1000 ${-1574 + flagW} 962 -1566 Z`} fill={KRP.red} stroke={INK} strokeWidth={4} />
            {/* 町並み (夜明け前) */}
            {[[-40, 260, 640], [200, 300, 700], [480, 280, 620], [1180, 300, 660], [1460, 260, 600], [1700, 280, 690]].map(([hx, hw, ht], i) => (
              <g key={i}>
                <path d={`M ${hx} 1100 L ${hx} ${ht + 120} L ${hx + hw / 2} ${ht} L ${hx + hw} ${ht + 120} L ${hx + hw} 1100 Z`} fill={i % 2 ? "#5A5872" : "#4E4C66"} stroke={INK} strokeWidth={5} />
                {[0, 1].map((r) => [0, 1].map((c) => (
                  <rect key={`${r}${c}`} x={hx + 50 + c * (hw - 140)} y={ht + 180 + r * 120} width={40} height={52} fill="#FFD27A"
                    opacity={(i + r + c) % 3 === 0 ? 0.25 : 0.85} stroke={INK} strokeWidth={3} />
                )))}
              </g>
            ))}
            <rect x={-40} y={1020} width={2000} height={100} fill={MP.mist} opacity={0.25} />
          </g>
        </g>
      )}
      {/* 中: 番人の部屋 */}
      {inside > 0 && (
        <g opacity={inside} transform={zoomAt(zRoom, bx, by)}>
          <BanninTou f={f} ring={0} wake={0} />
          {/* 毛布をかぶって寝ている番人 (帽子だけ見える) */}
          <path d={`M 1400 850 Q 1440 ${790 - breath} 1560 ${786 - breath} Q 1700 ${792 - breath * 0.6} 1780 850 Z`} fill="#6E5140" stroke={INK} strokeWidth={5} />
          <path d={`M 1480 ${812 - breath} Q 1540 ${800 - breath} 1600 ${806 - breath}`} stroke={INK} strokeWidth={3} opacity={0.35} fill="none" />
          <path d="M 1330 842 Q 1334 806 1370 802 Q 1404 806 1408 842 Z" fill={C.timber} stroke={INK} strokeWidth={4} />
          <ellipse cx={1369} cy={842} rx={52} ry={10} fill={C.timber} stroke={INK} strokeWidth={4} />
          {[0, 1, 2].map((k) => {
            const p = ((f + k * 12) % 36) / 36;
            return <text key={k} x={1420 + p * 50 + k * 12} y={760 - p * 100} fontFamily={FONT} fontWeight={900} fontSize={30 + k * 8} fill={KRP.white} opacity={(1 - p) * 0.7}>z</text>;
          })}
          {/* 時計のベルだけ、きらっ */}
          <circle cx={bx} cy={by - 116} r={70} fill={MP.glow} opacity={0.35 * spark} />
          <MzDSpark x={bx + 26} y={by - 132} s={1.2 * spark + 0.01} o={spark} rot={f * 3} />
          <MzDSpark x={bx - 34} y={by - 104} s={0.6 * spark + 0.01} o={spark} rot={-f * 4} />
        </g>
      )}
      <TagPlate x={340} y={200} text="ウィーン" size={46} t={seg(f, 2, 12)} />
      <TagPlate x={1500} y={200} text="15世紀前半" size={44} t={seg(f, 4, 14)} />
      <MzDDotQ x={1720} y={200} r={34} t={seg(f, 10, 18)} f={f} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_073: (f) => <Mz073 f={f} />,
  mz_074: (f) => <Mz074 f={f} />,
  mz_075: (f) => <Mz075 f={f} />,
  mz_076: (f) => <Mz076 f={f} />,
  mz_077: (f) => <Mz077 f={f} />,
  mz_078: (f) => <Mz078 f={f} />,
  mz_079: (f) => <Mz079 f={f} />,
  mz_080: (f) => <Mz080 f={f} />,
  mz_081: (f) => <Mz081 f={f} />,
  mz_082: (f) => <Mz082 f={f} />,
  mz_083: (f) => <Mz083 f={f} />,
  mz_084: (f) => <Mz084 f={f} />,
};

export const MZ_D_MOTIFS: string[] = [
  "mz_073", // #73
  "mz_074", // #74
  "mz_075", // #75
  "mz_076", // #76
  "mz_077", // #77
  "mz_078", // #78
  "mz_079", // #79
  "mz_080", // #80
  "mz_081", // #81
  "mz_082", // #82
  "mz_083", // #83
  "mz_084", // #84
];

export const mezaDScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
