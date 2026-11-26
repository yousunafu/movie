// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#133〜#144 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない
//
// ★ノッカー・アップは共有部品 KnockerUp で描く (walk / knock / shoot / female)。
//   KnockerUp に無い姿勢 (立ち止まる・帽子のつばに手・帳面を持つ・腕組み・額の汗をぬぐう) だけ、
//   ローカル部品 MzGKnocker で描く。中身は KnockerUp の前向きの重ね描き (山高帽・灰色のコート・赤いマフラー・
//   ボタン・コートのすそ) をそのまま写したもので、見た目は KnockerUp と同じ。

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, MACHI_WIN, Flame, skyColors, mixColor,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // ノッカー・アップ (KnockerUp と同じ値)
  coat: "#7D828B",
  coatDark: "#4A4E57",
  hat: "#2C2A2E",
  hatBand: "#5A5560",
  scarf: "#C8372B",
  scarfBlue: "#3E73B8",
  scarfGreen: "#4E9A5C",
  // 寝間着とナイトキャップ (男性)
  night: "#EDE6D6",
  nightDark: "#CBC2AE",
  cap: "#F7F3EA",
  capBand: "#DCD2BC",
  // 女性 (#139)
  hair: "#7A4A2C",
  hairDark: "#5C3620",
  gown: "#E7B3BC",
  gownDark: "#C98C98",
  skirt: "#C9707F",
  skirtDark: "#A85362",
  shawl: "#8C3440",
  shawlDark: "#6E2632",
  // 値札・黒板
  tag: "#E9D4A0",
  tagDark: "#C9AF74",
  chalk: "#F1EFE6",
  board: "#2F4A3E",
  boardDark: "#22362D",
  frameWood: "#9A6A3E",
  frameWoodDark: "#6E4A2A",
  // アルバム・机
  album: "#2A2622",
  albumLine: "#3A342E",
  photoBorder: "#EFE6D0",
  corner: "#1A1714",
  desk: "#8A5E3A",
  deskDark: "#6A4428",
  // 帳簿
  ledger: "#EADDB8",
  ledgerDark: "#D2C196",
  ruled: "#9DB4C8",
  inkBlue: "#2F3B5C",
  stain: "#C9A86A",
  // 猫
  cat: "#E39A4C",
  catDark: "#B8742E",
  // 丘
  grass: "#6F8F55",
  grassDark: "#56733F",
  grassLight: "#8DAA6A",
  // スマホ
  phone: "#2B2E36",
  phoneScreen: "#CFE8F6",
  // 中の部屋
  room: "#4A3426",
  roomLight: "#E9B872",
  sweat: "#7FB2E6",
  paleBlue: "#6E8FC0",
} as const;
void W; void H;
void PersonMini; void Stamp; void XMark; void Arrow;
void Maru; void MaruBatsu;
void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void Clocky; void NazoBell;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type KPose = "stand" | "raise" | "point" | "armsFolded" | "hold";
type Pt = [number, number];
const INK = C.ink;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
// カメラ: 世界の (cx,cy) を画面の中心に、z 倍で
const cam = (cx: number, cy: number, z: number) => `translate(960 540) scale(${z}) translate(${-cx} ${-cy})`;
// Person と同じ体のゆれ (重ね描きを体に合わせるため)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ---- ノッカー・アップの棒 (KnockerUp の棒と同じ描き方)。B=手元側の端, T=先 ----
const MzGPole: React.FC<{ B: Pt; T: Pt; s: number; hit?: number; glint?: number }> = ({ B, T, s, hit = 0, glint = 0 }) => {
  const dx = T[0] - B[0], dy = T[1] - B[1];
  const len = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / len, uy = dy / len;
  const a0 = Math.atan2(uy, ux);
  return (
    <g>
      <line x1={B[0]} y1={B[1]} x2={T[0]} y2={T[1]} stroke={INK} strokeWidth={13 * s} strokeLinecap="round" />
      <line x1={B[0]} y1={B[1]} x2={T[0]} y2={T[1]} stroke={MP.woodLight} strokeWidth={7 * s} strokeLinecap="round" />
      <line x1={T[0] - ux * 26 * s} y1={T[1] - uy * 26 * s} x2={T[0]} y2={T[1]} stroke={MP.iron} strokeWidth={10 * s} strokeLinecap="round" />
      {[-34, -20, -8, 4, 16, 28, 38].map((d, i) => {
        const a = a0 + (d * Math.PI) / 180;
        const ll = (24 + (i % 3) * 6) * s;
        return <path key={i} d={`M ${T[0]} ${T[1]} q ${Math.cos(a) * ll * 0.5 - Math.sin(a) * 4 * s} ${Math.sin(a) * ll * 0.5 + Math.cos(a) * 4 * s} ${Math.cos(a) * ll} ${Math.sin(a) * ll}`}
          stroke={MP.ironLight} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
      })}
      {hit > 0.05 && [-50, 0, 50].map((d, i) => {
        const a = a0 + (d * Math.PI) / 180;
        return <line key={i} x1={T[0] + Math.cos(a) * 40 * s} y1={T[1] + Math.sin(a) * 40 * s} x2={T[0] + Math.cos(a) * 64 * s} y2={T[1] + Math.sin(a) * 64 * s}
          stroke={MP.glow} strokeWidth={6 * s} strokeLinecap="round" opacity={hit} />;
      })}
      {glint > 0.02 && <MzGStar x={T[0] + ux * 18 * s} y={T[1] + uy * 18 * s} r={46 * s * glint} rot={glint * 40} />}
    </g>
  );
};

// ---- きらっ (4本の光) ----
const MzGStar: React.FC<{ x: number; y: number; r: number; rot?: number; color?: string }> = ({ x, y, r, rot = 0, color = MP.glow }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M 0 ${-r} Q ${r * 0.12} ${-r * 0.12} ${r} 0 Q ${r * 0.12} ${r * 0.12} 0 ${r} Q ${-r * 0.12} ${r * 0.12} ${-r} 0 Q ${-r * 0.12} ${-r * 0.12} 0 ${-r} Z`}
      fill={color} stroke={INK} strokeWidth={Math.max(2, r * 0.07)} strokeLinejoin="round" />
    <circle r={r * 0.16} fill={KRP.white} />
  </g>
);

// ---- ノッカー・アップ (前向き・KnockerUp に無い姿勢用)。見た目は KnockerUp の前向きと同じ ----
const MzGKnocker: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: KPose; lean?: number; dir?: 1 | -1; phase?: number;
  hatLift?: number; hatTilt?: number; scarf?: string; gaze?: [number, number]; muffle?: boolean; wink?: boolean;
}> = ({ x, y, s = 0.9, f, face = "normal", pose = "stand", lean = 0, dir = 1, phase = 0, hatLift = 0, hatTilt = 0,
  scarf = C.scarf, gaze = [0, 0], muffle = false, wink = false }) => {
  const bob = bobOf(f, phase);
  const flut = Math.sin(f / 3.3 + phase) * 10 + 6;
  const fy = Math.sin(f / 2.6) * 4;
  const mirror = `translate(${x} 0) scale(${dir} 1) translate(${-x} 0)`;
  const inner = `translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`;
  const armsFront = pose === "hold" || pose === "armsFolded";
  return (
    <g transform={mirror}>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase}
        cloth={C.coat} clothDark={C.coatDark} hair="cap" gaze={gaze} />
      <g transform={inner}>
        {/* コートのすそ (ひざまで) */}
        <path d="M -58 -60 L 58 -60 L 68 -22 Q 0 -14 -68 -22 Z" fill={C.coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <line x1={0} y1={-60} x2={0} y2={-18} stroke={INK} strokeWidth={3.5} />
        {!armsFront && <path d="M -30 -160 L 0 -118 L 30 -160" stroke={C.coatDark} strokeWidth={6} fill="none" />}
        {(armsFront ? [-84] : [-136, -110, -84]).map((by) => <circle key={by} cx={0} cy={by} r={6} fill={MP.brass} stroke={INK} strokeWidth={2.5} />)}
        {/* マフラー */}
        <rect x={-52} y={-178} width={104} height={24} rx={11} fill={scarf} stroke={INK} strokeWidth={4} />
        <path d="M -30 -176 L -26 -156 M 0 -178 L 0 -156 M 30 -176 L 26 -156" stroke="#E8D3B0" strokeWidth={4} />
        <path d={`M 26 -160 Q ${44 + flut * 0.4} -130 ${54 + flut} ${-100 + fy} L ${70 + flut} ${-108 + fy} Q ${58 + flut * 0.4} -136 44 -162 Z`}
          fill={scarf} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M ${56 + flut} ${-100 + fy} l -4 10 M ${64 + flut} ${-104 + fy} l 0 10`} stroke={INK} strokeWidth={3} />
        {/* 口元までうずめたマフラー */}
        {muffle && (
          <g>
            <path d="M -50 -176 Q -54 -204 -30 -206 Q 0 -200 30 -206 Q 54 -204 50 -176 Z" fill={scarf} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -30 -202 Q -26 -190 -30 -178 M 0 -200 Q 4 -188 0 -176 M 30 -202 Q 26 -190 30 -178" stroke="#E8D3B0" strokeWidth={3.5} fill="none" />
          </g>
        )}
        {/* ウインク (右目を閉じる) */}
        {wink && (
          <g>
            <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <path d="M 11 -218 Q 24 -232 37 -218" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            <path d="M 34 -232 l 8 -6 M 36 -222 l 10 -1" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
        {/* 黒い山高帽 */}
        <g transform={`translate(0 ${-hatLift}) rotate(${hatTilt} 0 -272)`}>
          <ellipse cx={0} cy={-268} rx={84} ry={14} fill={C.hat} stroke={INK} strokeWidth={4} />
          <path d="M -52 -270 Q -52 -332 0 -334 Q 52 -332 52 -270 Z" fill={C.hat} stroke={INK} strokeWidth={4} />
          <path d="M -52 -282 Q 0 -274 52 -282" stroke={C.hatBand} strokeWidth={7} fill="none" />
          <path d="M -32 -318 Q -18 -326 -4 -326" stroke="#6A6670" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

// ---- KnockerUp のマフラーの色を変える重ね描き (前向き walk 用 / 後ろ姿 shoot 用) ----
const MzGScarfFront: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; dir?: 1 | -1; color: string }> = ({ x, y, s, f, phase = 0, dir = 1, color }) => {
  const flut = Math.sin(f / 3.3 + phase) * 10 + 16;
  const fy = Math.sin(f / 2.6) * 4;
  return (
    <g transform={`translate(${x} 0) scale(${dir} 1) translate(${-x} 0)`}>
      <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
        <rect x={-52} y={-178} width={104} height={24} rx={11} fill={color} stroke={INK} strokeWidth={4} />
        <path d="M -30 -176 L -26 -156 M 0 -178 L 0 -156 M 30 -176 L 26 -156" stroke="#E8D3B0" strokeWidth={4} />
        <path d={`M 26 -160 Q ${44 + flut * 0.4} -130 ${54 + flut} ${-100 + fy} L ${70 + flut} ${-108 + fy} Q ${58 + flut * 0.4} -136 44 -162 Z`}
          fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
  );
};
const MzGScarfBack: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; color: string }> = ({ x, y, s, f, phase = 0, color }) => {
  const flut = Math.sin(f / 3.3 + phase) * 10 + 6;
  return (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <rect x={-52} y={-176} width={104} height={22} rx={10} fill={color} stroke={INK} strokeWidth={4} />
      <path d={`M -20 -160 Q ${-30 - flut * 0.3} -120 ${-36 - flut * 0.5} -96 L ${-18 - flut * 0.5} -94 Q -10 -126 -2 -160 Z`} fill={color} stroke={INK} strokeWidth={4} />
    </g>
  );
};

// ---- 豆鉄砲のノッカー・アップの後ろ姿 (#137 男性 / #138 女性)。----
//   KnockerUp pose="shoot" と同じ足元基準・同じ腕と管の位置 (管の先 = (203, -399)) で、頭だけを「人の後頭部」に描き直したもの。
//   後頭部は髪で塗り、顔の部品 (目・口・ほお) は一切描かない。管は口元 (頭の陰) から出て、右手と管の先だけが頭の横から見える。
//   男性: 山高帽 + 短い髪の後頭部 + えり足 + 耳 + マフラー / 女性: ボンネット帽 (つばのある布の帽子) の後ろ + 後ろで結った髷 + 肩掛け + 長いスカート
const MzGShootBack: React.FC<{ x: number; y: number; s: number; f: number; female?: boolean; scarf?: string; phase?: number }> = ({ x, y, s, f, female = false, scarf = C.scarf, phase = 0 }) => {
  const flut = Math.sin(f / 3.3 + phase) * 10 + 6;
  const sleeve = female ? "#6E3442" : C.coat;
  const skin = female ? "#F6EEE6" : KRP.white;
  const tE: Pt = [30 + Math.cos(Math.atan2(-1, 1.15)) * 230, -248 + Math.sin(Math.atan2(-1, 1.15)) * 230]; // 管の先 (KnockerUp と同じ位置)
  const tS: Pt = [56, -222]; // 口元の高さで頭の右の輪郭から出るところ
  const tubeA = Math.atan2(tE[1] - tS[1], tE[0] - tS[0]);
  const arm = (sh: Pt, el: Pt, hd: Pt) => `M ${sh[0]} ${sh[1]} L ${el[0]} ${el[1]} L ${hd[0]} ${hd[1]}`;
  const arms: [Pt, Pt, Pt][] = [[[-56, -150], [-96, -200], [-30, -240]], [[56, -150], [100, -196], [68, -230]]];
  const hairC = female ? C.hair : "#3B2C24";
  const hairD = female ? C.hairDark : "#22180F";
  return (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      {/* 腕 (頭より先。左手は頭の陰=口元) */}
      {arms.map(([sh, el, hd], i) => (
        <g key={i}>
          <path d={arm(sh, el, hd)} stroke={INK} strokeWidth={27} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={arm(sh, el, hd)} stroke={sleeve} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {female ? (
        <g>
          {/* 靴・長いスカート (くるぶしまで)・胴・肩掛け (KnockerUp female と同じ) */}
          <ellipse cx={-20} cy={-4} rx={18} ry={8} fill={INK} />
          <ellipse cx={20} cy={-4} rx={18} ry={8} fill={INK} />
          <path d="M -54 -100 L 54 -100 L 86 -12 Q 0 2 -86 -12 Z" fill="#8C3440" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -30 -96 L -48 -12 M 0 -96 L 0 -6 M 30 -96 L 48 -12" stroke="#6E2632" strokeWidth={4} opacity={0.7} />
          <path d="M -84 -24 Q 0 -10 84 -24" stroke="#B9505C" strokeWidth={6} fill="none" />
          <rect x={-56} y={-162} width={112} height={70} rx={16} fill="#6E3442" stroke={INK} strokeWidth={5} />
          <path d="M -66 -164 Q 0 -176 66 -164 L 40 -118 Q 0 -86 -40 -118 Z" fill="#A47C52" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -50 -150 L 50 -150 M -40 -132 L 40 -132 M -22 -164 L -12 -100 M 22 -164 L 12 -100" stroke="#7A5634" strokeWidth={3} opacity={0.75} />
          {[-30, -18, -6, 6, 18, 30].map((fx) => <line key={fx} x1={fx} y1={-100 - Math.abs(fx) * 0.5} x2={fx * 1.05} y2={-88 - Math.abs(fx) * 0.5} stroke="#7A5634" strokeWidth={2.5} />)}
          {/* ボンネットのつば (顔のまわりに張り出す部分。後ろからは頭の外側にふちだけ見える) */}
          <path d="M -70 -224 Q -84 -300 0 -310 Q 84 -300 70 -224 Q 64 -218 58 -230 Q 56 -284 0 -292 Q -56 -284 -58 -230 Q -64 -218 -70 -224 Z"
            fill="#D8C49A" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          {/* 後頭部 (茶色の髪) */}
          <circle cx={0} cy={-226} r={60} fill={hairC} stroke={INK} strokeWidth={5.5} />
          {/* 髪の流れ (両わきと下から、後ろの髷へ集まる) */}
          <path d="M -54 -224 Q -40 -206 -24 -204 M 54 -224 Q 40 -206 24 -204 M -36 -176 Q -26 -190 -16 -194 M 36 -176 Q 26 -190 16 -194"
            stroke={hairD} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.75} />
          {/* 後ろで結った髷 (まとめ髪) */}
          <circle cx={0} cy={-206} r={25} fill={C.hairDark} stroke={INK} strokeWidth={4} />
          <path d="M -14 -214 Q 0 -226 13 -212 Q 18 -198 4 -194 Q -8 -194 -8 -206 Q -6 -212 2 -210" stroke="#4A2A16" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {/* ヘアピン */}
          <line x1={14} y1={-224} x2={26} y2={-214} stroke="#B9A27A" strokeWidth={3.5} strokeLinecap="round" />
          {/* ボンネットの後ろ (頭の上半分をおおう布) とリボンの帯 */}
          <path d="M -60 -236 Q -60 -292 0 -294 Q 60 -292 60 -236 Q 30 -226 0 -228 Q -30 -226 -60 -236 Z" fill="#E8D9B4" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -34 -286 Q -28 -256 -30 -232 M 0 -294 L 0 -228 M 34 -286 Q 28 -256 30 -232" stroke="#C9B48A" strokeWidth={3} fill="none" opacity={0.8} />
          <path d="M -59 -246 Q 0 -232 59 -246" stroke="#5A3E70" strokeWidth={8} fill="none" />
        </g>
      ) : (
        <g>
          {/* ズボン・靴・長いコート (KnockerUp の男性の後ろ姿と同じ) */}
          <rect x={-30} y={-58} width={24} height={52} fill={C.coatDark} stroke={INK} strokeWidth={4.5} />
          <rect x={6} y={-58} width={24} height={52} fill={C.coatDark} stroke={INK} strokeWidth={4.5} />
          <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={INK} />
          <ellipse cx={18} cy={-4} rx={20} ry={9} fill={INK} />
          <path d="M -60 -162 L 60 -162 L 70 -26 L -70 -26 Z" fill={C.coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 0 -96 L 0 -26" stroke={INK} strokeWidth={3.5} />
          <path d="M -40 -100 L 40 -100" stroke={C.coatDark} strokeWidth={6} />
          <circle cx={-24} cy={-100} r={5} fill={C.coatDark} stroke={INK} strokeWidth={2} />
          <circle cx={24} cy={-100} r={5} fill={C.coatDark} stroke={INK} strokeWidth={2} />
          {/* 耳 (頭の両わき) */}
          <ellipse cx={-60} cy={-224} rx={9} ry={15} fill={skin} stroke={INK} strokeWidth={3.5} />
          <ellipse cx={60} cy={-224} rx={9} ry={15} fill={skin} stroke={INK} strokeWidth={3.5} />
          {/* 後頭部 (短い髪) と、えり足の肌 */}
          <circle cx={0} cy={-228} r={60} fill={hairC} />
          <path d="M -44 -187 Q 0 -178 44 -187 A 60 60 0 0 1 -44 -187 Z" fill={skin} />
          <path d="M -44 -187 Q 0 -178 44 -187" stroke={hairD} strokeWidth={3} fill="none" />
          <circle cx={0} cy={-228} r={60} fill="none" stroke={INK} strokeWidth={5.5} />
          <path d="M -40 -250 Q -30 -226 -30 -200 M 0 -258 L 0 -196 M 40 -250 Q 30 -226 30 -200" stroke={hairD} strokeWidth={3} fill="none" opacity={0.7} />
          {/* マフラー */}
          <rect x={-52} y={-176} width={104} height={22} rx={10} fill={scarf} stroke={INK} strokeWidth={4} />
          <path d={`M -20 -160 Q ${-30 - flut * 0.3} -120 ${-36 - flut * 0.5} -96 L ${-18 - flut * 0.5} -94 Q -10 -126 -2 -160 Z`} fill={scarf} stroke={INK} strokeWidth={4} />
          {/* 山高帽 */}
          <ellipse cx={0} cy={-270} rx={80} ry={13} fill={INK} />
          <path d="M -50 -272 Q -50 -330 0 -332 Q 50 -330 50 -272 Z" fill={C.hat} stroke={INK} strokeWidth={4} />
          <path d="M -50 -282 Q 0 -274 50 -282" stroke="#555058" strokeWidth={6} fill="none" />
        </g>
      )}
      {/* 豆鉄砲の管 (口元=頭の陰から、頭の右横へ出る) と、管をにぎる右手 */}
      <line x1={tS[0]} y1={tS[1]} x2={tE[0]} y2={tE[1]} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <line x1={tS[0]} y1={tS[1]} x2={tE[0]} y2={tE[1]} stroke="#8C6A3E" strokeWidth={8} strokeLinecap="round" />
      <circle cx={tE[0]} cy={tE[1]} r={7} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
      <circle cx={68} cy={-230} r={12} fill={skin} stroke={INK} strokeWidth={4} />
      {/* 飛ぶ豆 (KnockerUp と同じ) */}
      {[0, 1, 2].map((k) => {
        const t = (f / 10 + k / 3) % 1;
        const d = 30 + t * 300;
        return <circle key={k} cx={tE[0] + Math.cos(tubeA) * d} cy={tE[1] + Math.sin(tubeA) * d + t * t * 40} r={7} fill="#B9C46A" stroke={INK} strokeWidth={2.5} opacity={1 - t * 0.6} />;
      })}
    </g>
  );
};

// ---- 白いナイトキャップ (Person の頭に重ねる。座標は Person と同じ足元基準) ----
const MzGNightcap: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number }> = ({ x, y, s, f, phase = 0, lean = 0 }) => {
  const sw = Math.sin(f / 9 + phase) * 4;
  return (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s}) rotate(${lean})`}>
      <path d={`M -66 -252 Q -66 -314 0 -320 Q 56 -320 ${92 + sw} -264 L ${100 + sw} -250 Q 50 -294 66 -252 Z`} fill={C.cap} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M -36 -304 Q 0 -296 30 -312" stroke={C.capBand} strokeWidth={4} fill="none" />
      <rect x={-70} y={-264} width={140} height={16} rx={8} fill={C.capBand} stroke={INK} strokeWidth={4} />
      <circle cx={102 + sw} cy={-246} r={13} fill={C.cap} stroke={INK} strokeWidth={3.5} />
    </g>
  );
};

// ---- 寝間着の男性 (白いナイトキャップ・短い黒髪・寝間着) ----
const MzGSleeper: React.FC<{
  x: number; y: number; s: number; f: number; face?: Face; pose?: KPose; lean?: number; phase?: number;
  gaze?: [number, number]; sleepy?: boolean; pale?: boolean;
}> = ({ x, y, s, f, face = "normal", pose = "stand", lean = 0, phase = 0, gaze = [0, 0], sleepy = false, pale = false }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase} gaze={gaze}
      cloth={C.night} clothDark={C.nightDark} hair="cap" />
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s}) rotate(${lean})`}>
      {/* 寝間着の前あき */}
      <path d="M 0 -158 L 0 -60" stroke={C.nightDark} strokeWidth={4} />
      {[-138, -112, -86].map((by) => <circle key={by} cx={0} cy={by} r={4.5} fill={KRP.white} stroke={INK} strokeWidth={2} />)}
      {/* 寝ぼけまぶた */}
      {sleepy && (
        <g>
          {[-24, 24].map((ex) => (
            <g key={ex}>
              <path d={`M ${ex - 15} -220 Q ${ex} -246 ${ex + 15} -220 Z`} fill={KRP.white} stroke={INK} strokeWidth={4} />
            </g>
          ))}
        </g>
      )}
      {/* 青ざめ (額の縦線) */}
      {pale && (
        <g stroke={C.paleBlue} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
          {[-30, -15, 0, 15, 30].map((lx) => <line key={lx} x1={lx} y1={-262} x2={lx} y2={-240 + Math.abs(lx) * 0.2} />)}
        </g>
      )}
    </g>
    <MzGNightcap x={x} y={y} s={s} f={f} phase={phase} lean={lean} />
  </g>
);

// ---- 窓の中の男性 (窓の枠で切り抜く)。wx,wy = MACHI_WIN の窓の中心 ----
const MzGWinMan: React.FC<{
  id: string; wx: number; wy: number; f: number; rise: number; face?: Face; pose?: KPose; sleepy?: boolean; lean?: number;
}> = ({ id, wx, wy, f, rise, face = "normal", pose = "stand", sleepy = false, lean = 0 }) => {
  if (rise <= 0.01) return null;
  return (
    <g>
      <defs><clipPath id={id}><rect x={wx - 60} y={wy - 80} width={120} height={160} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <MzGSleeper x={wx} y={wy + 110 + (1 - rise) * 110} s={0.42} f={f} face={face} pose={pose} sleepy={sleepy} lean={lean} phase={3} />
      </g>
      {/* ガラスの桟 (人の手前) */}
      <path d={`M ${wx} ${wy - 76} L ${wx} ${wy + 76} M ${wx - 56} ${wy - 42} L ${wx + 56} ${wy - 42} M ${wx - 56} ${wy + 42} L ${wx + 56} ${wy + 42}`}
        stroke="#F1EADF" strokeWidth={4} opacity={0.5} />
      <rect x={wx - 61} y={wy - 81} width={122} height={162} fill="none" stroke={INK} strokeWidth={5} />
    </g>
  );
};

// ---- 寝息の泡 (Zzz)。burst 0→1 でぱちんと割れる ----
const MzGZzz: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; burst?: number }> = ({ x, y, s = 1, f, phase = 0, burst = 0 }) => {
  const bob = Math.sin((f + phase * 23) / 14) * 6;
  if (burst >= 1) return null;
  if (burst > 0) {
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`} opacity={1 - burst}>
        <circle r={30 + burst * 30} fill="none" stroke={KRP.white} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * (36 + burst * 30)} y1={Math.sin(a) * (36 + burst * 30)} x2={Math.cos(a) * (50 + burst * 40)} y2={Math.sin(a) * (50 + burst * 40)}
            stroke={KRP.white} strokeWidth={5} strokeLinecap="round" />;
        })}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <circle cx={-26} cy={40} r={9} fill={KRP.white} opacity={0.8} stroke={INK} strokeWidth={2.5} />
      <circle cx={-38} cy={60} r={5.5} fill={KRP.white} opacity={0.7} stroke={INK} strokeWidth={2} />
      <circle r={31} fill={KRP.white} opacity={0.9} stroke={INK} strokeWidth={3.5} />
      <circle cx={-12} cy={-13} r={6} fill={KRP.white} />
      <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={MP.night}>Z</text>
    </g>
  );
};

// ---- 植木鉢 (窓台の上。x,y=鉢の底) ----
const MzGPot: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-14, 0, 14].map((lx, i) => (
      <g key={i} transform={`rotate(${lx * 0.8 + Math.sin(f / 17 + i) * 3} 0 -24)`}>
        <path d="M 0 -24 Q -4 -40 0 -52" stroke="#4E7A3E" strokeWidth={4} fill="none" />
        <circle cx={0} cy={-56} r={8} fill={i === 1 ? "#D8432F" : "#E25E4A"} stroke={INK} strokeWidth={2.5} />
        <ellipse cx={-7} cy={-36} rx={7} ry={4} fill="#5E8C46" stroke={INK} strokeWidth={2} />
      </g>
    ))}
    <path d="M -18 -24 L 18 -24 L 13 0 L -13 0 Z" fill="#C0643C" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <rect x={-20} y={-28} width={40} height={7} rx={2} fill="#D27A50" stroke={INK} strokeWidth={3} />
  </g>
);

// ---- 猫 (座る。jump 0→1 で跳ね上がる。x,y=足元) ----
const MzGCat: React.FC<{ x: number; y: number; s?: number; f: number; jump?: number }> = ({ x, y, s = 1, f, jump = 0 }) => {
  const up = Math.sin(Math.PI * clamp01(jump)) * 70;
  const spook = jump > 0.02 && jump < 0.98;
  const tail = Math.sin(f / 8) * 8;
  return (
    <g transform={`translate(${x} ${y - up}) scale(${s})`}>
      <path d={`M 18 -6 Q 46 -10 ${40 + tail} ${-40 - (spook ? 20 : 0)}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={`M 18 -6 Q 46 -10 ${40 + tail} ${-40 - (spook ? 20 : 0)}`} stroke={C.cat} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-22} rx={spook ? 24 : 22} ry={spook ? 26 : 22} fill={C.cat} stroke={INK} strokeWidth={3.5} />
      {spook && [-18, -6, 6, 18].map((fx) => <line key={fx} x1={fx} y1={-44} x2={fx * 1.3} y2={-54} stroke={INK} strokeWidth={3} />)}
      <path d="M -10 -6 L -10 0 M 8 -6 L 8 0" stroke={INK} strokeWidth={3} />
      <g transform={`translate(-4 ${spook ? -58 : -50})`}>
        <path d="M -16 -10 L -14 -28 L -4 -16 Z M 16 -10 L 14 -28 L 4 -16 Z" fill={C.cat} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle r={17} fill={C.cat} stroke={INK} strokeWidth={3.5} />
        <path d="M -8 -14 L -6 -6 M 0 -15 L 0 -7 M 8 -14 L 6 -6" stroke={C.catDark} strokeWidth={2.5} />
        {spook ? (
          <g>
            <circle cx={-6} cy={-1} r={5} fill={KRP.white} stroke={INK} strokeWidth={2} />
            <circle cx={6} cy={-1} r={5} fill={KRP.white} stroke={INK} strokeWidth={2} />
            <circle cx={-6} cy={-1} r={1.6} fill={INK} />
            <circle cx={6} cy={-1} r={1.6} fill={INK} />
            <ellipse cx={0} cy={9} rx={3} ry={3.5} fill={INK} />
          </g>
        ) : (
          <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
            <path d="M -10 0 Q -6 3 -2 0" />
            <path d="M 2 0 Q 6 3 10 0" />
            <path d="M -3 7 Q 0 10 3 7" />
          </g>
        )}
        <path d="M -12 6 l -12 -2 M -12 9 l -12 3 M 12 6 l 12 -2 M 12 9 l 12 3" stroke={INK} strokeWidth={1.6} />
      </g>
    </g>
  );
};

// ---- 硬貨 (上から見た円。copper=銅貨 / silver=銀貨) ----
const MzGCoin: React.FC<{ x: number; y: number; r: number; kind: "copper" | "silver"; ghost?: boolean; rot?: number }> = ({ x, y, r, kind, ghost = false, rot = 0 }) => {
  const base = kind === "copper" ? KRP.copper : KRP.silver;
  const rim = kind === "copper" ? "#9A6534" : "#8E979E";
  const hi = kind === "copper" ? "#E3AE78" : "#EEF2F4";
  if (ghost) {
    return (
      <g transform={`translate(${x} ${y})`} opacity={0.6}>
        <circle r={r} fill={base} opacity={0.35} stroke={INK} strokeWidth={4} strokeDasharray="12 9" />
        <circle r={r * 0.72} fill="none" stroke={rim} strokeWidth={3} strokeDasharray="8 7" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={4} cy={r * 0.14 + 4} rx={r} ry={r} fill={INK} opacity={0.25} />
      <circle r={r} fill={base} stroke={INK} strokeWidth={Math.max(3.5, r * 0.08)} />
      <circle r={r * 0.82} fill="none" stroke={rim} strokeWidth={r * 0.07} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * r * 0.66} cy={Math.sin(a) * r * 0.66} r={r * 0.045} fill={rim} />;
      })}
      {/* 中央の冠の模様 (図柄だけ。肖像は描かない) */}
      <path d={`M ${-r * 0.3} ${r * 0.16} L ${-r * 0.34} ${-r * 0.16} L ${-r * 0.15} ${0} L 0 ${-r * 0.26} L ${r * 0.15} 0 L ${r * 0.34} ${-r * 0.16} L ${r * 0.3} ${r * 0.16} Z`}
        fill={rim} stroke={INK} strokeWidth={Math.max(2, r * 0.035)} strokeLinejoin="round" />
      <path d={`M ${-r * 0.62} ${-r * 0.36} A ${r * 0.72} ${r * 0.72} 0 0 1 ${-r * 0.2} ${-r * 0.7}`} stroke={hi} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

// ---- 外を歩く人の吐く白い息 ----
const MzGBreath: React.FC<{ x: number; y: number; s?: number; f: number; period?: number }> = ({ x, y, s = 1, f, period = 36 }) => (
  <g>
    {[0, 1, 2].map((k) => {
      const t = ((f / period + k / 3) % 1);
      return <circle key={k} cx={x + t * 110 * s} cy={y - t * 80 * s} r={(12 + t * 28) * s} fill={KRP.white} opacity={(1 - t) * 0.55} />;
    })}
  </g>
);

// ---- 朝もや (横に流れる) ----
const MzGMist: React.FC<{ f: number; y: number; n?: number; op?: number; speed?: number }> = ({ f, y, n = 4, op = 0.18, speed = 1.6 }) => (
  <g>
    {Array.from({ length: n }, (_, k) => (
      <ellipse key={k} cx={((f * speed + k * 640) % 2600) - 340} cy={y + (k % 2) * 34} rx={380} ry={38 + (k % 3) * 8} fill={MP.mist} opacity={op} />
    ))}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #133 第5章、止められない、人間。
// 格: 山 / seed 6133
// どこ: MachiNami (窓は全部暗い・sky=0.1) の通り。ガス灯 (x=990) の光の輪の中。夜明け前の紺と朝もや。
// 演出: ノッカー・アップ (山高帽・灰色のコート・赤いマフラー) が画面の左寄りに大きく立ち止まり、
//       棒を右手で立てて持ち、マフラーに口元をうずめて空を見上げる。白い息。長屋の窓には Zzz の泡。
//       右寄りに章扉「第5章 止められない、人間。」(クリームの帯の上)。
// 動き: f0-36 足元から顔へ上へスクロールしつつ少し引く / f10-26 題字 / 白い息がふわっ (36コマ周期) /
//       ガス灯の光の円錐がゆらぐ / 朝もやが流れる / Zzz がゆれる
const Mz133: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 0, 36));
  const z = lerp(1.7, 1.15, e), cx = lerp(820, 1120, e), cy = lerp(800, 520, e);
  const door = easeOut(seg(f, 10, 26));
  const fl = 0.85 + 0.15 * Math.sin(f / 2.3) * Math.sin(f / 5.1);
  const S = 1.75, X = 790, Y = 1000;
  const bob = bobOf(f);
  return (
    <Frame f={f} seed={6133} dark bg={MP.nightDeep} over={<>
      <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
        background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
      <ChapterDoor num={5} title="止められない、人間。" t={door} left={1000} top={560} />
    </>}>
      <g transform={cam(cx, cy, z)}>
        <MachiNami f={f} windows={[0, 0, 0, 0, 0, 0]} sky={0.1} />
        {/* 眠る長屋の Zzz */}
        {MACHI_WIN.map(([wx, wy], i) => <MzGZzz key={i} x={wx + 44} y={wy - 118} s={1.1} f={f} phase={i} />)}
        {/* ガス灯の光の円錐と、石畳の光の輪 */}
        <polygon points="962,500 1018,500 1330,1012 650,1012" fill={MP.glow} opacity={0.1 * fl} />
        <ellipse cx={990} cy={1004} rx={360} ry={50} fill={MP.glow} opacity={0.2 * fl} />
        <ellipse cx={990} cy={1004} rx={200} ry={28} fill={MP.glow} opacity={0.16 * fl} />
        {/* 足元の影 (光と反対の左へ) */}
        <ellipse cx={720} cy={1006} rx={170} ry={22} fill={MP.nightDeep} opacity={0.45} />
        {/* 右手で立てて持つ長い棒 (先の針金の房がガス灯に光る) */}
        <MzGPole B={[870, 1014]} T={[1120, 332]} s={S} glint={0.35 + 0.25 * Math.sin(f / 7)} />
        <MzGKnocker x={X} y={Y} s={S} f={f} face="smile" gaze={[9, -12]} muffle />
        {/* 棒を握る右手 */}
        <circle cx={X + 67 * S} cy={Y + bob - 70 * S} r={12 * S} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
        {/* マフラーからもれる白い息 */}
        <MzGBreath x={X + 60} y={Y - 200 * S} s={1.5} f={f} />
        {/* 朝もや (人の足元の手前を流れる) */}
        <MzGMist f={f} y={958} n={5} op={0.2} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #134 その名も、ノッカー・アップ。
// 格: 山 / seed 6134
// どこ: MachiNami (窓は全部暗い・sky=0.1) の長屋の前の石畳 (#133 の続き)。ガス灯のすぐ右。
// 演出: ノッカー・アップが右手で帽子のつばをちょいと上げ、胸を張ってカメラに名乗る (smile)。
//       左手で棒を立てる。背後のれんが壁 (ガス灯に照らされて明るい) に彼の長い影が映り、
//       その影がもくもくっと「巨大な目覚まし時計」(丸い本体・2つのベル・ハンマー・脚) の形に変わる。棒の房がきらっ。
// 動き: f0-50 全身から顔へぐっと寄る / f4 手がつばへ・f6-14 帽子が上がる / f14-32 影が目覚まし時計に変わる (変わり目に星) /
//       f32-60 棒の房がきらっ
const Mz134: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 0, 50));
  const z = lerp(1.05, 1.4, e), cx = lerp(1000, 1180, e), cy = lerp(560, 600, e);
  const lift = easeOut(seg(f, 6, 14));
  const m = easeInOut(seg(f, 14, 32));
  const glint = seg(f, 32, 40) * (1 - seg(f, 54, 64)) * (0.8 + 0.2 * Math.sin(f / 2));
  const S = 1.6, X = 1100, Y = 1000;
  const bob = bobOf(f);
  const sparkle = seg(f, 18, 30) * (1 - seg(f, 30, 40));
  const fl = 0.85 + 0.15 * Math.sin(f / 2.3) * Math.sin(f / 5.1);
  return (
    <Frame f={f} seed={6134} dark bg={MP.nightDeep}>
      <g transform={cam(cx, cy, z)}>
        <MachiNami f={f} windows={[0, 0, 0, 0, 0, 0]} sky={0.1} />
        {MACHI_WIN.map(([wx, wy], i) => i !== 4 && <MzGZzz key={i} x={wx + 40} y={wy - 50} s={1.0} f={f} phase={i} />)}
        {/* ガス灯に照らされた壁の明るい輪 */}
        <ellipse cx={1420} cy={560} rx={560} ry={400} fill={MP.glow} opacity={0.14 * fl} />
        {/* 壁に映る影: 人の形 → 目覚まし時計の形 */}
        <g opacity={(1 - m) * 0.5} transform={`translate(1520 870) scale(${1.95 * (1 - m * 0.3)} ${1.95 * (1 - m * 0.2)}) skewX(-8)`}>
          <circle cx={0} cy={-228} r={64} fill={MP.nightDeep} />
          <ellipse cx={0} cy={-270} rx={84} ry={14} fill={MP.nightDeep} />
          <path d="M -52 -270 Q -52 -332 0 -334 Q 52 -332 52 -270 Z" fill={MP.nightDeep} />
          <rect x={-60} y={-166} width={120} height={150} rx={14} fill={MP.nightDeep} />
          <rect x={-34} y={-30} width={26} height={30} fill={MP.nightDeep} />
          <rect x={8} y={-30} width={26} height={30} fill={MP.nightDeep} />
          <rect x={-130} y={-150} width={30} height={100} rx={14} fill={MP.nightDeep} transform="rotate(20 -115 -150)" />
          <line x1={-60} y1={0} x2={-150} y2={-420} stroke={MP.nightDeep} strokeWidth={12} />
        </g>
        <g opacity={m * 0.52} transform={`translate(1530 560) scale(${1.75 * (0.7 + 0.3 * pop(m))})`}>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <path d={`M ${sd * 54} 92 L ${sd * 82} 146`} stroke={MP.nightDeep} strokeWidth={18} strokeLinecap="round" />
              <g transform={`translate(${sd * 72} -126) rotate(${sd * 26})`}>
                <path d="M -50 14 Q -50 -42 0 -44 Q 50 -42 50 14 Z" fill={MP.nightDeep} />
              </g>
            </g>
          ))}
          <path d="M -70 -100 Q 0 -178 70 -100" stroke={MP.nightDeep} strokeWidth={14} fill="none" />
          <line x1={0} y1={-104} x2={0} y2={-168} stroke={MP.nightDeep} strokeWidth={12} />
          <rect x={-16} y={-188} width={32} height={24} rx={6} fill={MP.nightDeep} />
          <circle r={114} fill={MP.nightDeep} />
          {/* 影の中にうっすら文字盤の目盛り */}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-84} x2={0} y2={-70} stroke={MP.glow} strokeWidth={6} opacity={0.35} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-58} stroke={MP.glow} strokeWidth={7} opacity={0.35} />
          <line x1={0} y1={0} x2={42} y2={0} stroke={MP.glow} strokeWidth={7} opacity={0.35} />
        </g>
        {/* 影が変わる瞬間のきらきら */}
        {sparkle > 0.02 && [[1300, 300], [1760, 380], [1290, 760], [1780, 760], [1530, 220]].map(([sx, sy], i) => (
          <MzGStar key={i} x={sx} y={sy} r={26 * sparkle} rot={f * 4 + i * 20} color={KRP.white} />
        ))}
        {/* 足元の影と光の輪 */}
        <ellipse cx={990} cy={1004} rx={360} ry={48} fill={MP.glow} opacity={0.18 * fl} />
        <ellipse cx={1180} cy={1006} rx={170} ry={22} fill={MP.nightDeep} opacity={0.45} />
        {/* 左手で立てる棒 */}
        <MzGPole B={[1012, 1014]} T={[862, 372]} s={S} glint={glint} />
        <MzGKnocker x={X} y={Y} s={S} f={f} face="smile" pose={f >= 4 ? "raise" : "stand"} lean={-3 * lift}
          hatLift={20 * lift} hatTilt={-10 * lift} gaze={[0, 3]} />
        {/* 棒を握る左手 */}
        <circle cx={X - 67 * S} cy={Y + bob - 70 * S} r={12 * S} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
        {/* つばを上げた瞬間の「ちょい」の線 */}
        {lift > 0.1 && lift < 1 && [0, 1, 2].map((k) => (
          <line key={k} x1={X + 120 * S} y1={Y - (300 + k * 18) * S} x2={X + 150 * S} y2={Y - (310 + k * 26) * S} stroke={MP.glow} strokeWidth={6} strokeLinecap="round" />
        ))}
        <MzGBreath x={X + 30} y={Y - 196 * S} s={1.4} f={f} period={40} />
        <MzGMist f={f} y={962} n={5} op={0.18} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #135 人間目覚まし時計です。
// 格: 山 / seed 6135
// どこ: MachiNami の長屋の前 (#134 の続き)。真正面の寄り。
// 演出: ノッカー・アップの体に目覚まし時計の部品がぽんぽんと重なる見立て。
//       山高帽の上に BellClock のベル2つとハンマー → コートのお腹に BellClock の丸い文字盤 → 肩の後ろからゼンマイのつまみ (くるくる)。
//       最後に帽子のベルがジリリと鳴り (ring=1)、本人がウインク。2階の窓 (#4) で寝ていた男性 (白いナイトキャップ) がびくっと起きる。
// 動き: f2-10 帽子のベル / f10-18 お腹の文字盤 / f18-26 ゼンマイ / f30-34 ベルが鳴りだす・画面がゆれる /
//       f36-44 窓に明かり・男性がびくっ / f42 ウインク / そのあとも鳴り続け、ゼンマイが回り続ける
const Mz135: React.FC<{ f: number }> = ({ f }) => {
  const ring = seg(f, 30, 34);
  const jit = ring * (1 - seg(f, 50, 63) * 0.7);
  const sx = Math.sin(f * 2.7) * 6 * jit, sy = Math.cos(f * 3.3) * 4 * jit;
  const S = 1.6, X = 1100, Y = 1000;
  const bob = bobOf(f);
  const p1 = pop(seg(f, 2, 10)), p2 = pop(seg(f, 10, 18)), p3 = pop(seg(f, 18, 26));
  const hatTop = Y + bob - 334 * S; // 帽子のてっぺん
  const belly = Y + bob - 106 * S;
  const lit = seg(f, 36, 40);
  const rise = easeOut(seg(f, 36, 42));
  const keyX = X + 74 * S, keyY = Y + bob - 168 * S;
  return (
    <Frame f={f} seed={6135} dark bg={MP.nightDeep}>
      <g transform={`translate(${sx} ${sy}) ${cam(1150, 680, 1.35)}`}>
        <MachiNami f={f} windows={[0, 0, 0, 0, lit, 0]} sky={0.12} />
        {[1, 2, 3, 5].map((i) => <MzGZzz key={i} x={MACHI_WIN[i][0] + 44} y={MACHI_WIN[i][1] - 118} s={1.1} f={f} phase={i} />)}
        {lit < 0.5 && <MzGZzz x={MACHI_WIN[4][0] + 44} y={MACHI_WIN[4][1] - 118} s={1.1} f={f} phase={4} burst={seg(f, 34, 40)} />}
        <MzGWinMan id="mzg135win" wx={MACHI_WIN[4][0]} wy={MACHI_WIN[4][1]} f={f} rise={rise} face="surprised" pose={f > 40 ? "raise" : "stand"} />
        {rise > 0.5 && [-40, 0, 40].map((a) => (
          <line key={a} x1={MACHI_WIN[4][0]} y1={MACHI_WIN[4][1] - 100} x2={MACHI_WIN[4][0]} y2={MACHI_WIN[4][1] - 132}
            stroke={MP.glow} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a} ${MACHI_WIN[4][0]} ${MACHI_WIN[4][1] - 20})`} />
        ))}
        <ellipse cx={1120} cy={1006} rx={190} ry={24} fill={MP.nightDeep} opacity={0.45} />
        {/* ゼンマイのつまみ (肩の後ろから。体より奥に描く) */}
        {p3 > 0.01 && (
          <g transform={`translate(${keyX} ${keyY}) scale(${p3 * 1.5})`}>
            <rect x={-8} y={-6} width={30} height={14} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} transform="rotate(-40)" />
            <g transform={`translate(22 -22) scale(${Math.cos(f / 3)} 1)`}>
              <path d="M -4 0 Q -30 -26 -10 -40 Q 4 -36 0 -14 Q 4 -36 18 -40 Q 38 -26 4 0 Z" fill={MP.brass} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <circle cx={0} cy={-6} r={5} fill={MP.brassDark} stroke={INK} strokeWidth={2.5} />
            </g>
          </g>
        )}
        {/* 右手で立てる棒 (先は窓 #4 のほうへ) */}
        <MzGPole B={[1196, 1014]} T={[1420, 300]} s={S} />
        <MzGKnocker x={X} y={Y} s={S} f={f} face="smile" wink={f >= 42} gaze={[0, 2]} />
        <circle cx={X + 67 * S} cy={Y + bob - 70 * S} r={12 * S} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
        {/* 帽子の上のベル (BellClock の上半分だけを切り抜く) */}
        <defs>
          <clipPath id="mzg135hat"><rect x={X - 220} y={hatTop - 260} width={440} height={264} /></clipPath>
          <clipPath id="mzg135belly"><circle cx={X} cy={belly} r={84} /></clipPath>
        </defs>
        {p1 > 0.01 && (
          <g transform={`translate(${X} ${hatTop}) scale(${p1}) translate(${-X} ${-hatTop})`}>
            <g clipPath="url(#mzg135hat)">
              <BellClock x={X} y={hatTop + 92} s={0.82} f={f} ring={ring} />
            </g>
            <ellipse cx={X} cy={hatTop + 2} rx={54} ry={10} fill={MP.brass} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {/* お腹の文字盤 (BellClock の本体だけを切り抜く) */}
        {p2 > 0.01 && (
          <g transform={`translate(${X} ${belly}) scale(${p2}) translate(${-X} ${-belly})`}>
            <g clipPath="url(#mzg135belly)">
              <BellClock x={X} y={belly} s={0.72} f={f} time={5 * 60 + 40} />
            </g>
          </g>
        )}
        {/* ジリリの音の線 (帽子のベルのまわり) */}
        {ring > 0.05 && [-1, 1].map((sd) => [0, 1, 2].map((k) => (
          <path key={`${sd}${k}`} d={`M ${X + sd * (150 + k * 34)} ${hatTop - 150 - k * 10} q ${sd * 20} 46 0 92`}
            stroke={MP.glow} strokeWidth={7} fill="none" strokeLinecap="round" opacity={ring * (0.5 + 0.5 * Math.sin(f * 1.3 + k))} />
        )))}
        <MzGMist f={f} y={962} n={5} op={0.16} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #136 夜明け前、長い棒を持って町を歩き、2階の寝室の窓を、コンコンと叩いて起こします。
// 格: 山 / seed 6136
// どこ: MachiNami (sky=0.15) の長屋。2階の窓 #3 (窓台に植木鉢) の高さまでカメラが上がる。
// 演出: 石畳の KnockerUp (pose="knock") の長い棒が2階の窓へ伸び、針金の房で窓ガラスをコンコン (擬音「コン」と波紋)。
//       窓の中で寝ていた男性 (白いナイトキャップ・寝間着) が寝ぼけまなこで窓に来て、窓辺のろうそくに火 → 窓に明かり。
//       男性が手を振ると、棒がすーっと隣の窓 #4 へ移って、またコンコン。
// 動き: f0-34 石畳から棒を伝って窓へ上へ寄る / f30-80 コンコン (KnockerUp の打つ周期に合わせて擬音と波紋) /
//       f78-88 明かり・f84-94 男性が窓へ / f88 ろうそく / f100 手を振る / f112-140 棒と人とカメラが隣の窓へ / そのあとコンコン
const Mz136: React.FC<{ f: number }> = ({ f }) => {
  const e1 = easeInOut(seg(f, 0, 34));
  const e2 = easeInOut(seg(f, 112, 140));
  const z = lerp(1.0, 2.0, e1), cx = lerp(960, 1090, e1) + 330 * e2, cy = lerp(540, 400, e1);
  const [w3x, w3y] = MACHI_WIN[3];
  const [w4x, w4y] = MACHI_WIN[4];
  const lit3 = seg(f, 78, 88);
  const rise = easeOut(seg(f, 84, 94));
  const tip: Pt = [lerp(w3x - 26, w4x - 26, e2), w3y - 28];
  const kx = lerp(820, 1150, e2);
  // KnockerUp の当てる瞬間 (部品と同じ式)
  const tapT = Math.sin(f * 0.55);
  const hit = tapT < -0.75 ? (-tapT - 0.75) * 4 : 0;
  const moving = f > 112 && f < 140;
  const knocking = !moving && (f > 28 && (f < 92 || f > 138));
  const hitN = Math.floor((f * 0.55 + Math.PI / 2) / (Math.PI * 2));
  const waving = f >= 100;
  return (
    <Frame f={f} seed={6136} dark bg={MP.nightDeep}>
      <g transform={cam(cx, cy, z)}>
        <MachiNami f={f} windows={[0, 0, 0, lit3, 0, 0]} sky={0.15} />
        {/* 窓台の植木鉢 */}
        <MzGPot x={w3x + 40} y={w3y + 82} f={f} />
        <MzGPot x={w4x - 38} y={w4y + 82} s={0.9} f={f + 20} />
        {/* 窓の中の男性 */}
        <MzGWinMan id="mzg136win" wx={w3x} wy={w3y} f={f} rise={rise} face={waving ? "smile" : "normal"} sleepy={!waving}
          pose={waving ? "raise" : "stand"} lean={waving ? Math.sin(f / 5) * 5 : -4} />
        {/* 窓辺のろうそく (部屋の内側、ガラスの手前) */}
        {f >= 88 && (
          <g>
            <ellipse cx={w3x - 30} cy={w3y + 76} rx={20} ry={6} fill={MP.brass} stroke={INK} strokeWidth={3} />
            <rect x={w3x - 37} y={w3y + 46} width={14} height={30} rx={3} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <Flame x={w3x - 30} y={w3y + 46} s={0.7} f={f} />
          </g>
        )}
        {/* Zzz (窓 #3 は明かりで割れる) */}
        {lit3 < 1 && <MzGZzz x={w3x + 52} y={w3y - 112} f={f} burst={seg(f, 80, 88)} />}
        <MzGZzz x={w4x + 52} y={w4y - 112} f={f} phase={2} />
        <MzGZzz x={MACHI_WIN[2][0] + 52} y={MACHI_WIN[2][1] - 112} f={f} phase={4} />
        {/* 石畳のノッカー・アップと長い棒 */}
        <ellipse cx={kx + 10} cy={1006} rx={110} ry={18} fill={MP.nightDeep} opacity={0.45} />
        <KnockerUp x={kx} y={1000} s={1.05} f={f} pose="knock" tip={tip} face="smile" />
        {/* コンコン: ガラスの波紋と擬音 */}
        {knocking && (
          <g>
            {[0, 1].map((k) => (
              <circle key={k} cx={tip[0]} cy={tip[1]} r={14 + k * 14 + hit * 8} fill="none" stroke={KRP.white} strokeWidth={3} opacity={clamp01(hit) * (0.8 - k * 0.3)} />
            ))}
            <text x={tip[0] + (hitN % 2 ? 46 : 30)} y={tip[1] - (hitN % 2 ? 34 : 58)} fontFamily={FONT} fontWeight={900} fontSize={34}
              fill={MP.glow} stroke={INK} strokeWidth={5} paintOrder="stroke" transform={`rotate(${hitN % 2 ? 12 : -8} ${tip[0] + 40} ${tip[1] - 40})`}
              opacity={clamp01(0.6 + hit)}>コン</text>
          </g>
        )}
        {/* 手を振る男性のまわりの「おはよう」の光 */}
        {waving && f < 140 && [0, 1, 2].map((k) => (
          <circle key={k} cx={w3x + 30} cy={w3y + 8} r={10 + ((f - 100 + k * 6) % 18) * 2} fill="none" stroke={MP.glow} strokeWidth={2.5}
            opacity={1 - ((f - 100 + k * 6) % 18) / 18} />
        ))}
        <MzGMist f={f} y={960} n={5} op={0.16} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #137 中には、豆鉄砲で、窓に豆を当てる人もいました。
// 格: 並 / seed 6137
// どこ: MachiNami (sky=0.15) の長屋の左寄りを、ぐっと手前の石畳から見上げる。窓 #2 の窓台に猫と植木鉢。
// 演出: 手前に大きく、豆鉄砲のノッカー・アップ (MzGShootBack: 後ろ姿・短い髪の後頭部・マフラーは青) が細い管を口に当てて豆を吹く。
//       豆が窓 #2 のガラスにパチン (星)。窓台の猫が飛び上がり、窓の奥で人が身じろぎ (明かりと影)。
//       奥の通りには棒のノッカー・アップが2人 (窓 #4・#5 を棒でたたく) = 主流は棒、豆鉄砲は1人だけ。
// 動き: f0-14 構える / f14 ぷっ (管の先の煙) / f6-40 豆の弧を追ってカメラが右へパン / f30-44 パチン /
//       f32-52 猫が跳ねる / f50-64 窓の奥に明かりと人影 / 豆はくり返し飛ぶ
const Mz137: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 6, 40));
  const cx = lerp(870, 960, e);
  const X = 212, Y = 1129, S = 1.3;
  const tube: Pt = [X + 203 * S, Y + bobOf(f) - 399 * S];
  const [w2x, w2y] = MACHI_WIN[2];
  const hitP: Pt = [800, 378];
  const pach = seg(f, 30, 36) * (1 - seg(f, 44, 56));
  const stir = 0.55 * seg(f, 50, 64);
  const puff = seg(f, 12, 26);
  // 最初の1粒 (いちばん大きく見せる豆)
  const b = seg(f, 14, 32);
  const bx = lerp(tube[0], hitP[0], b), by = lerp(tube[1], hitP[1], b) - Math.sin(Math.PI * b) * 90;
  return (
    <Frame f={f} seed={6137} dark bg={MP.nightDeep}>
      <g transform={cam(cx, 700, 1.06)}>
        <MachiNami f={f} windows={[0, 0, stir, 0, 1, 0]} sky={0.15} />
        {/* 手前に続く石畳 */}
        <rect x={-40} y={1118} width={2000} height={400} fill="#6E655E" />
        {Array.from({ length: 8 }, (_, r) => Array.from({ length: 30 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-40 + c * 70 + (r % 2) * 35} y={1124 + r * 46} width={62} height={38} rx={13}
            fill={(r * 3 + c) % 4 ? "#857B73" : "#91877E"} stroke={INK} strokeWidth={2.5} />
        )))}
        {/* 窓の奥の身じろぎ (人影) */}
        {stir > 0.05 && (
          <g opacity={stir * 1.4}>
            <ellipse cx={w2x - 14 + Math.sin(f / 7) * 10} cy={w2y + 10} rx={24} ry={28} fill="#7A5A48" />
            <ellipse cx={w2x - 14 + Math.sin(f / 7) * 10} cy={w2y + 66} rx={44} ry={30} fill="#7A5A48" />
          </g>
        )}
        <MzGPot x={w2x - 36} y={w2y + 82} s={0.95} f={f} />
        <MzGCat x={w2x + 36} y={w2y + 82} s={1} f={f} jump={seg(f, 32, 52)} />
        {f < 50 && <MzGZzz x={w2x + 50} y={w2y - 112} f={f} burst={seg(f, 34, 42)} />}
        <MzGZzz x={MACHI_WIN[1][0] + 50} y={MACHI_WIN[1][1] - 112} f={f} phase={1} />
        <MzGZzz x={MACHI_WIN[5][0] + 50} y={MACHI_WIN[5][1] - 112} f={f} phase={5} />
        {/* 奥の通りの、棒のノッカー・アップ2人 (主流) */}
        <KnockerUp x={1330} y={905} s={0.7} f={f} pose="knock" tip={[1440, 330]} phase={1} />
        <KnockerUp x={1650} y={905} s={0.7} f={f} pose="knock" tip={[1762, 336]} phase={2} />
        {/* パチン! */}
        {pach > 0.02 && (
          <g>
            <MzGStar x={hitP[0]} y={hitP[1]} r={56 * pop(pach)} rot={f * 3} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={hitP[0] + Math.cos(a) * 50} y1={hitP[1] + Math.sin(a) * 50} x2={hitP[0] + Math.cos(a) * (70 + pach * 30)} y2={hitP[1] + Math.sin(a) * (70 + pach * 30)}
                stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={pach} />;
            })}
            {/* ガラスの小さなひび風の線 */}
            <path d={`M ${hitP[0]} ${hitP[1]} l 18 -10 M ${hitP[0]} ${hitP[1]} l -14 -16 M ${hitP[0]} ${hitP[1]} l 6 20`} stroke={KRP.white} strokeWidth={2.5} opacity={pach} />
          </g>
        )}
        {/* 最初の1粒の豆 (大きめ・軌跡つき) */}
        {b > 0 && b < 1 && (
          <g>
            <path d={`M ${tube[0]} ${tube[1]} Q ${(tube[0] + hitP[0]) / 2} ${(tube[1] + hitP[1]) / 2 - 180} ${bx} ${by}`} stroke={KRP.white} strokeWidth={3} strokeDasharray="6 12" fill="none" opacity={0.7} />
            <circle cx={bx} cy={by} r={10} fill="#B9C46A" stroke={INK} strokeWidth={3} />
          </g>
        )}
        {/* 手前の豆鉄砲の人 (後ろ姿・マフラーは青) */}
        <ellipse cx={X + 10} cy={Y + 6} rx={150} ry={22} fill={MP.nightDeep} opacity={0.45} />
        <MzGShootBack x={X} y={Y} s={S} f={f} scarf={C.scarfBlue} />
        {/* ぷっ (管の先の煙) */}
        {puff > 0 && puff < 1 && [0, 1, 2].map((k) => (
          <circle key={k} cx={tube[0] + 20 + k * 16 * puff} cy={tube[1] - 14 - k * 10 * puff} r={10 + puff * 18} fill={KRP.white} opacity={(1 - puff) * 0.6} />
        ))}
        <MzGMist f={f} y={1040} n={5} op={0.16} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #138 ロンドンには、豆鉄砲を構えた、女性のノッカー・アップの写真が残っています。
// 格: 山 / seed 6138
// どこ: 机の上に開いた古いアルバムの1ページ (黒い台紙・写真コーナー・ほかの小さなセピア写真)。
//       まん中の写真の中は MachiNami の長屋の通り (ロンドン)。地名札「ロンドン」だけ (年号は書かない)。
// 演出: セピアの写真の中で、女性のノッカー・アップ (MzGShootBack female: ボンネット帽の後ろ・後ろで結った髷・肩掛け・長いスカート) が
//       後ろ姿で豆鉄砲を2階の窓 #3 へ構える (顔は見せない)。カメラがアルバムから写真の中へぐっと寄ると、写真が色づいて動き出す。
//       豆が窓にパチン → 窓に明かりがつき、中の男性 (ナイトキャップ) がびくっと起きる。
// 動き: f0-34 アルバムから写真の中へ寄る / f30-42 セピアが色づく / 豆はくり返し飛ぶ / f46-60 パチン /
//       f52-60 窓に明かり / f56-66 男性が起きる / f40- 写真の中がゆっくり寄り続ける / アルバムの写真の角が少しめくれる
const Mz138: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 0, 34));
  const Z = lerp(0.9, 2.2, e), cy = lerp(540, 450, e);
  const c = seg(f, 30, 42); // 0=セピア 1=色
  const push = 1 + 0.08 * easeInOut(seg(f, 40, 174));
  const sep = [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131];
  const idm = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const mv = sep.map((v, i) => lerp(v, idm[i], c));
  const matrix = `${mv[0]} ${mv[1]} ${mv[2]} 0 0 ${mv[3]} ${mv[4]} ${mv[5]} 0 0 ${mv[6]} ${mv[7]} ${mv[8]} 0 0 0 0 0 1 0`;
  const lit3 = seg(f, 52, 60);
  const rise = easeOut(seg(f, 56, 66));
  const pach = seg(f, 46, 52) * (1 - seg(f, 64, 76));
  const curl = 26 + Math.sin(f / 14) * 8;
  const [w3x, w3y] = MACHI_WIN[3];
  // 小さな写真 (セピアのまま・中は形だけ)
  const smallPhoto = (x: number, y: number, w: number, h: number, kind: number, rot: number) => (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill={C.photoBorder} stroke={INK} strokeWidth={4} />
      <rect x={x} y={y} width={w} height={h} fill="#C9A878" />
      <rect x={x} y={y + h * 0.62} width={w} height={h * 0.38} fill="#A9855A" />
      {kind === 0 && <g fill="#6E5236"><rect x={x + w * 0.2} y={y + h * 0.18} width={w * 0.1} height={h * 0.5} /><rect x={x + w * 0.6} y={y + h * 0.3} width={w * 0.08} height={h * 0.4} /><circle cx={x + w * 0.3} cy={y + h * 0.14} r={w * 0.1} opacity={0.6} /></g>}
      {kind === 1 && <g fill="#6E5236"><rect x={x + w * 0.46} y={y + h * 0.2} width={w * 0.06} height={h * 0.6} /><path d={`M ${x + w * 0.4} ${y + h * 0.22} L ${x + w * 0.58} ${y + h * 0.22} L ${x + w * 0.49} ${y + h * 0.1} Z`} /></g>}
      {kind === 2 && <g fill="#6E5236"><rect x={x + w * 0.3} y={y + h * 0.2} width={w * 0.4} height={h * 0.5} /><circle cx={x + w * 0.5} cy={y + h * 0.32} r={w * 0.12} fill="#E9D8B4" stroke="#6E5236" strokeWidth={3} /></g>}
      {[[x, y, 0], [x + w, y, 90], [x + w, y + h, 180], [x, y + h, 270]].map(([px, py, r], i) => (
        <path key={i} d="M -6 -6 L 34 -6 L -6 34 Z" fill={C.corner} stroke="#5A524A" strokeWidth={2.5} transform={`translate(${px} ${py}) rotate(${r})`} />
      ))}
    </g>
  );
  return (
    <Frame f={f} seed={6138} bg={C.desk}>
      {/* 机 (木目) */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={C.desk} />
      <g stroke={C.deskDark} strokeWidth={5} opacity={0.5} fill="none">
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M -20 ${40 + i * 140} q 480 ${rnd(6, i) * 36 - 18} 980 0 q 480 ${rnd(7, i) * 36 - 18} 980 0`} />)}
      </g>
      <g transform={cam(960, cy, Z)}>
        {/* アルバムの台紙 (黒) と、とじ目 */}
        <rect x={136} y={46} width={1660} height={1020} rx={8} fill={INK} opacity={0.35} />
        <rect x={120} y={30} width={1660} height={1020} rx={8} fill={C.album} stroke={INK} strokeWidth={8} />
        <rect x={120} y={30} width={70} height={1020} fill={C.albumLine} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={155} cy={110 + i * 170} r={10} fill={MP.brass} stroke={INK} strokeWidth={3} />)}
        <g stroke={C.albumLine} strokeWidth={2} opacity={0.7}>
          {Array.from({ length: 30 }, (_, i) => <line key={i} x1={200} y1={50 + i * 34} x2={1770} y2={54 + i * 34} />)}
        </g>
        {/* ページの右下のめくれ */}
        <path d={`M 1780 ${1050 - curl * 3} L 1780 1050 L ${1780 - curl * 3} 1050 Z`} fill={C.album} stroke={INK} strokeWidth={4} />
        <path d={`M 1780 ${1050 - curl * 3} Q ${1780 - curl * 2} ${1050 - curl * 2} ${1780 - curl * 3} 1050 L ${1780 - curl * 2.4} ${1050 - curl * 0.4} Q ${1780 - curl * 1.6} ${1050 - curl * 1.6} ${1780 - curl * 0.4} ${1050 - curl * 2.4} Z`} fill="#4A443E" stroke={INK} strokeWidth={3} />
        {smallPhoto(240, 110, 220, 160, 0, -3)}
        {smallPhoto(250, 690, 210, 250, 1, 2.5)}
        {smallPhoto(1470, 640, 230, 300, 2, -2)}
        {/* 白いペンの手書き風の線 (字は書かない) */}
        <g stroke="#D9D2C4" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round">
          <path d="M 250 320 q 20 -12 40 0 t 40 0 t 40 0" />
          <path d="M 1490 980 q 20 -12 40 0 t 40 0 t 40 0 t 40 0" />
        </g>
        {/* まん中の写真 */}
        <rect x={548} y={140} width={840} height={580} fill={INK} opacity={0.3} />
        <rect x={540} y={130} width={840} height={580} fill={C.photoBorder} stroke={INK} strokeWidth={5} />
        <defs>
          <clipPath id="mzg138photo"><rect x={560} y={150} width={800} height={540} /></clipPath>
          <filter id="mzg138sepia" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={matrix} /></filter>
        </defs>
        <g clipPath="url(#mzg138photo)">
          <g filter="url(#mzg138sepia)">
            <g transform={`translate(960 420) scale(${push}) translate(-960 -420) translate(560 150) scale(0.5) translate(-160 -100)`}>
              <MachiNami f={c > 0.5 ? f : 30} windows={[0, 0, 0, lit3, 0, 0]} sky={0.25} />
              <rect x={-40} y={1118} width={2000} height={200} fill="#6E655E" />
              {Array.from({ length: 30 }, (_, k) => (
                <rect key={k} x={-40 + k * 70} y={1126} width={62} height={38} rx={13} fill={k % 4 ? "#857B73" : "#91877E"} stroke={INK} strokeWidth={2.5} />
              ))}
              <MzGPot x={w3x + 40} y={w3y + 82} f={f} />
              <MzGWinMan id="mzg138win" wx={w3x} wy={w3y} f={f} rise={rise} face={f < 72 ? "surprised" : "normal"} sleepy={f >= 72} />
              {f < 56 && <MzGZzz x={w3x + 52} y={w3y - 112} f={f} burst={seg(f, 48, 56)} />}
              {pach > 0.02 && <MzGStar x={1110} y={372} r={54 * pop(pach)} rot={f * 3} />}
              <MzGShootBack x={477} y={1176} s={1.4} f={c > 0.5 ? f : 31} female />
            </g>
          </g>
          {/* 古い写真の粒とすじ (色づくと消える) */}
          <g opacity={(1 - c) * 0.6}>
            {Array.from({ length: 40 }, (_, i) => (
              <circle key={i} cx={560 + rnd(3, i) * 800} cy={150 + rnd(4, i) * 540} r={1.5 + rnd(5, i) * 2.5} fill={i % 2 ? "#FFF6E0" : "#3B2A18"} />
            ))}
            <line x1={760} y1={150} x2={752} y2={690} stroke="#FFF6E0" strokeWidth={2} />
            <line x1={1180} y1={150} x2={1190} y2={690} stroke="#3B2A18" strokeWidth={1.5} />
            <rect x={560} y={150} width={800} height={540} fill="none" stroke="#3B2A18" strokeWidth={40} opacity={0.4} />
          </g>
        </g>
        {/* 写真コーナー */}
        {[[560, 150, 0], [1360, 150, 90], [1360, 690, 180], [560, 690, 270]].map(([px, py, r], i) => (
          <path key={i} d="M -10 -10 L 56 -10 L -10 56 Z" fill={C.corner} stroke="#5A524A" strokeWidth={3} transform={`translate(${px} ${py}) rotate(${r})`} />
        ))}
      </g>
      <TagPlate x={960} y={782} text="ロンドン" size={40} t={seg(f, 14, 26)} />
    </Frame>
  );
};

// ---- 寝間着にショールの女性 (#139)。茶色の髪を後ろで結ぶ・えんじのショール・くるぶしまでのスカート ----
const MzGWoman: React.FC<{ x: number; y: number; s: number; f: number; face?: Face; gaze?: [number, number]; phase?: number }> = ({ x, y, s, f, face = "smile", gaze = [0, 0], phase = 0 }) => {
  const tr = `translate(${x} ${y + bobOf(f, phase)}) scale(${s})`;
  return (
    <g>
      {/* 後ろで結んだ髪の房 (頭の後ろ) */}
      <g transform={tr}>
        <circle cx={46} cy={-276} r={26} fill={C.hair} stroke={INK} strokeWidth={4.5} />
        <path d="M 60 -262 Q 84 -230 70 -196 Q 60 -226 50 -250 Z" fill={C.hair} stroke={INK} strokeWidth={4} />
      </g>
      <Person x={x} y={y} s={s} f={f} face={face} pose="hold" phase={phase} gaze={gaze} cloth={C.gown} clothDark={C.gownDark} hair="none" />
      <g transform={tr}>
        {/* くるぶしまでの長いスカート (寝間着のすそ) */}
        <path d="M -56 -66 L 56 -66 L 78 -10 Q 0 0 -78 -10 Z" fill={C.skirt} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -24 -60 L -36 -10 M 0 -60 L 0 -6 M 24 -60 L 36 -10" stroke={C.skirtDark} strokeWidth={3.5} opacity={0.7} />
        <path d="M -76 -18 Q 0 -6 76 -18" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6} />
        {/* えんじのショール (肩から胸へ) */}
        <path d="M -68 -162 Q 0 -178 68 -162 L 60 -118 Q 30 -104 8 -122 L 0 -96 L -8 -122 Q -30 -104 -60 -118 Z" fill={C.shawl} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -50 -150 Q 0 -162 50 -150" stroke={C.shawlDark} strokeWidth={3.5} fill="none" />
        {[-44, -30, 30, 44].map((fx) => <line key={fx} x1={fx} y1={-116 + Math.abs(fx) * 0.04} x2={fx} y2={-104} stroke={C.shawlDark} strokeWidth={3} />)}
        {/* 手 (ショールの上) */}
        <circle cx={-14} cy={-118} r={9} fill={KRP.white} stroke={INK} strokeWidth={4} />
        <circle cx={14} cy={-118} r={9} fill={KRP.white} stroke={INK} strokeWidth={4} />
        {/* 前髪と、肩まで垂らした茶色の髪 */}
        <path d="M -64 -232 Q -68 -296 0 -298 Q 68 -296 64 -232 Q 44 -264 0 -260 Q -44 -264 -64 -232 Z" fill={C.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -64 -240 Q -76 -200 -66 -160 L -50 -164 Q -58 -200 -54 -236 Z" fill={C.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 64 -240 Q 76 -200 66 -160 L 50 -164 Q 58 -200 54 -236 Z" fill={C.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -30 -290 Q -20 -270 -26 -258 M 20 -292 Q 30 -274 24 -260" stroke={C.hairDark} strokeWidth={3} fill="none" />
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// #139 料金は、週ぎめです。
// 格: 並 / seed 6139
// どこ: MachiNami の長屋の玄関先 (家 #2 の木の扉・真鍮のノッカー・石の踏み段・牛乳びん)。朝の薄明かり (sky=0.6)。
// 演出: 扉が開き、寝間着にえんじのショールの女性 (結んだ茶色の髪・くるぶしまでのスカート) が、小銭をノッカー・アップの帳面にちゃりん。
//       右上の吹き出しに帳面の大写し: 月〜日の7つの丸に、ぐるっと1週間ぶんの印がつく。扉の横のれんがにもチョークで7本の印。
//       最後にノッカー・アップが帽子のつばに手をやって会釈。
// 動き: f0-10 扉が開く / f6-14 女性が出る / f10-22 小銭が弧を描いてちゃりん / f20-28 吹き出し / f24-42 7つの丸に印が順に /
//       f44- 帽子に手をやって会釈 / 全体はゆっくり寄る
const Mz139: React.FC<{ f: number }> = ({ f }) => {
  const Z = lerp(1.9, 2.15, easeInOut(seg(f, 0, 60)));
  const o = easeOut(seg(f, 0, 10));
  const out = easeOut(seg(f, 6, 14));
  const cb = seg(f, 10, 22);
  const coinA: Pt = [727, 794], coinB: Pt = [882, 812];
  const coinX = lerp(coinA[0], coinB[0], cb), coinY = lerp(coinA[1], coinB[1], cb) - Math.sin(Math.PI * cb) * 46;
  const chari = seg(f, 22, 30) * (1 - seg(f, 30, 40));
  const bubble = pop(seg(f, 20, 28));
  const marks = (i: number) => seg(f, 24 + i * 2.4, 27 + i * 2.4);
  const bow = easeInOut(seg(f, 50, 60));
  const dx = 676, dw = 84 * (1 - 0.75 * o);
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  // 吹き出し (画面座標)。しっぽの先 = 帳面の画面上の位置
  const nbS: Pt = [960 + (890 - 770) * Z, 540 + (818 - 690) * Z];
  return (
    <Frame f={f} seed={6139} bg={MP.nightDeep}>
      <g transform={cam(770, 690, Z)}>
        <MachiNami f={f} windows={[0, 0, 1, 0, 0, 0]} sky={0.6} />
        {/* 開いた玄関の中 (廊下と、ろうそくの明かり) */}
        {o > 0.02 && (
          <g>
            <rect x={dx} y={620} width={84} height={240} fill={C.room} stroke={INK} strokeWidth={5} />
            <ellipse cx={730} cy={700} rx={50} ry={70} fill={C.roomLight} opacity={0.35 + 0.05 * Math.sin(f / 3)} />
            <path d="M 690 860 L 700 780 L 750 780 L 756 860" stroke="#6A4A34" strokeWidth={3} fill="none" opacity={0.7} />
            <line x1={700} y1={810} x2={752} y2={810} stroke="#6A4A34" strokeWidth={3} opacity={0.7} />
            <Flame x={742} y={690} s={0.45} f={f} />
            <rect x={738} y={690} width={8} height={16} fill={KRP.white} stroke={INK} strokeWidth={2} />
          </g>
        )}
        {/* 内側へ開いた扉 */}
        <path d={`M ${dx} 620 L ${dx + dw} ${620 + 16 * o} L ${dx + dw} ${860 - 8 * o} L ${dx} 860 Z`} fill="#2E3F5C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={dx + dw * 0.5} cy={700} r={8} fill="none" stroke={MP.brass} strokeWidth={4} />
        {/* 扉の左のれんがに、チョークの週の印 (正の字ではなく棒7本) */}
        <g stroke={C.chalk} strokeWidth={3.5} strokeLinecap="round">
          {Array.from({ length: 7 }, (_, i) => {
            const t = marks(i);
            if (t <= 0) return null;
            const lx = 640 + (i % 5) * 6.5 + (i >= 5 ? 0 : 0);
            const ly = i >= 5 ? 778 : 742;
            if (i === 4) return <line key={i} x1={636} y1={758} x2={636 + 34 * t} y2={742} />;
            return <line key={i} x1={i >= 5 ? 642 + (i - 5) * 7 : lx} y1={ly} x2={i >= 5 ? 642 + (i - 5) * 7 : lx} y2={ly + 24 * t} />;
          })}
        </g>
        {/* 牛乳びん */}
        <g transform="translate(652 856)">
          <path d="M -8 0 L -8 -26 Q -8 -32 -4 -36 L -4 -44 L 4 -44 L 4 -36 Q 8 -32 8 -26 L 8 0 Z" fill={KRP.white} stroke={INK} strokeWidth={2.5} />
          <rect x={-5} y={-48} width={10} height={5} fill={MP.bell} stroke={INK} strokeWidth={1.5} />
        </g>
        {/* 女性 */}
        <g opacity={clamp01(o * 3)}>
          <MzGWoman x={lerp(716, 724, out)} y={866} s={0.6} f={f} face="smile" gaze={[7, 1]} />
        </g>
        {/* ノッカー・アップ (帳面を持つ → 会釈) と、壁に立てかけた棒 */}
        <MzGPole B={[968, 900]} T={[1010, 520]} s={0.66} />
        <MzGKnocker x={890} y={902} s={0.66} f={f} dir={-1} pose={bow > 0.02 ? "raise" : "hold"} face="smile" gaze={[6, 2]}
          lean={14 * bow} hatTilt={-16 * bow} />
        {/* 帳面 */}
        {bow <= 0.02 && (
          <g transform="translate(890 822)">
            <rect x={-17} y={-11} width={34} height={22} rx={2} fill="#7B5331" stroke={INK} strokeWidth={2.5} />
            <rect x={-14} y={-9} width={28} height={17} fill={KRP.white} stroke={INK} strokeWidth={1.5} />
            <line x1={0} y1={-9} x2={0} y2={8} stroke={INK} strokeWidth={1.2} />
          </g>
        )}
        {/* 小銭 */}
        {f >= 10 && f < 50 && <MzGCoin x={coinX} y={coinY} r={7} kind="copper" />}
        {chari > 0.02 && [0, 1, 2, 3, 4].map((k) => {
          const a = -Math.PI / 2 + (k - 2) * 0.55;
          return <line key={k} x1={coinB[0] + Math.cos(a) * 12} y1={coinB[1] + Math.sin(a) * 12} x2={coinB[0] + Math.cos(a) * (18 + chari * 10)} y2={coinB[1] + Math.sin(a) * (18 + chari * 10)}
            stroke={MP.glow} strokeWidth={2.5} strokeLinecap="round" opacity={chari} />;
        })}
      </g>
      {/* 帳面の大写しの吹き出し */}
      {bubble > 0.02 && (
        <g>
          <path d={`M ${1600} ${470} L ${nbS[0] + 26} ${nbS[1] - 6} L ${1700} ${440} Z`} fill={C.ledger} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={clamp01(bubble)} />
          <g transform={`translate(1460 320) scale(${bubble})`}>
            <ellipse cx={8} cy={10} rx={330} ry={196} fill={INK} opacity={0.25} />
            <ellipse rx={330} ry={196} fill={C.ledger} stroke={INK} strokeWidth={6} />
            {/* 帳面のページ */}
            <rect x={-250} y={-130} width={500} height={260} rx={8} fill="#FBF6E8" stroke={INK} strokeWidth={4} />
            <line x1={0} y1={-130} x2={0} y2={130} stroke={C.ledgerDark} strokeWidth={4} />
            {[-70, -20, 30, 80].map((ly) => <line key={ly} x1={-240} y1={ly} x2={240} y2={ly} stroke={C.ruled} strokeWidth={2} />)}
            {days.map((d, i) => {
              const cx2 = -198 + i * 66;
              const t = marks(i);
              return (
                <g key={d}>
                  <text x={cx2} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={INK}>{d}</text>
                  <circle cx={cx2} cy={8} r={24} fill={KRP.white} stroke={INK} strokeWidth={4} />
                  {t > 0 && <path d={`M ${cx2 - 13} ${8} L ${cx2 - 3} ${20} L ${cx2 + 16} ${-8}`} stroke={MP.bell} strokeWidth={7} fill="none"
                    strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - t)} />}
                </g>
              );
            })}
            {/* 1週間を ぐるっと囲む印 */}
            {seg(f, 40, 48) > 0 && (
              <rect x={-236} y={-22} width={472} height={62} rx={30} fill="none" stroke={MP.bell} strokeWidth={5}
                strokeDasharray="1100" strokeDashoffset={1100 * (1 - seg(f, 40, 48))} />
            )}
            {/* 鉛筆 */}
            <g transform={`translate(${-198 + Math.min(6, Math.floor(seg(f, 24, 42) * 7)) * 66 + 26} ${-6}) rotate(35)`}>
              <rect x={-6} y={-70} width={12} height={62} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
              <path d="M -6 -8 L 6 -8 L 0 6 Z" fill="#E8C99A" stroke={INK} strokeWidth={2.5} />
              <rect x={-6} y={-80} width={12} height={10} fill="#E28A8A" stroke={INK} strokeWidth={2.5} />
            </g>
            {/* 受け取った小銭 */}
            <MzGCoin x={200} y={92} r={22} kind="copper" />
          </g>
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #140 1853年の記録では、朝6時より後なら、週に2ペンスか3ペンス。それより早いと、6ペンス。
// 格: 図 / seed 6140
// どこ: MachiNami の玄関先の石の踏み段の上に開いた、1853年の古い帳簿 (黄ばんだ紙・インクの罫線・しみ・インクつぼ)。背景に石畳と朝もや。
// 演出: 帳簿の見開きに横長の時刻の目盛り (4時〜7時)。6時に赤い線。遅い側 (右) に小さな銅貨2枚と「もう1枚かも」の点線の銅貨、
//       早い側 (左) に大きな6ペンス銀貨がどん。札「1853年」「6時」「2〜3ペンス」「6ペンス」。
//       灰色のコートの袖の手が、新しい銅貨を右から左へずらすと、6時の線を越えたところで銀貨にぽんと変わる。
// 動き: f0-40 右から左へパン / f0-10 年代札 / f6-24 銅貨がちゃりん / f16-26 銀貨がどん (ゆれの線) / f28-36 数字札 /
//       f60-80 手が来る / f80-112 銅貨をずらす / f96-104 6時を越えて銀貨にぽん / f112-140 手が戻る / そのあとゆっくり寄る
const Mz140: React.FC<{ f: number }> = ({ f }) => {
  const px = lerp(70, 0, easeInOut(seg(f, 0, 40))) - 40 * easeInOut(seg(f, 60, 112));
  const zz = 1 + 0.03 * easeInOut(seg(f, 140, 253));
  const AX = (h: number) => 330 + (h - 4) * 420; // 時刻 → x
  const drop = (a: number, b: number) => easeOut(seg(f, a, b));
  const c1 = drop(6, 14), c2 = drop(10, 18), c3 = drop(14, 22);
  const sv = seg(f, 16, 24);
  const svY = 470 - (1 - easeOut(sv)) * 260 + (sv >= 1 ? Math.max(0, Math.sin((f - 24) / 2) * 10 * (1 - seg(f, 24, 34))) * -1 : 0);
  const thud = seg(f, 24, 30) * (1 - seg(f, 30, 40));
  // 手と、ずらす銅貨
  const hin = easeInOut(seg(f, 60, 80)), drag = easeInOut(seg(f, 80, 112)), hout = easeInOut(seg(f, 112, 140));
  const coinX = lerp(1520, 930, drag);
  const handX = lerp(1880, 1520, hin) + (coinX - 1520) * (drag > 0 ? 1 : 0) + 500 * hout;
  const handY = lerp(960, 470, hin) + 480 * hout;
  const becameSilver = coinX < AX(6);
  const flip = seg(f, 96, 104);
  return (
    <Frame f={f} seed={6140} bg={MP.nightDeep}>
      {/* 背景: 玄関先の石段と石畳 (朝もや) */}
      <g transform={cam(720, 820, 1.8)}>
        <MachiNami f={f} windows={[1, 1, 1, 1, 1, 1]} sky={0.55} />
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill={MP.mist} opacity={0.3} />
      <MzGMist f={f} y={980} n={4} op={0.25} />
      <g transform={`translate(960 540) scale(${zz}) translate(-960 -540) translate(${px} 0)`}>
        {/* 帳簿の影・見開き */}
        <rect x={186} y={146} width={1580} height={680} rx={10} fill={INK} opacity={0.35} />
        <g>
          <path d="M 160 136 Q 560 112 960 140 L 960 810 Q 560 790 160 806 Z" fill={C.ledger} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 960 140 Q 1360 112 1760 136 L 1760 806 Q 1360 790 960 810 Z" fill={C.ledger} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {/* 紙の重なり (下の小口) */}
          <path d="M 166 814 Q 560 798 960 818 Q 1360 798 1754 814" stroke={C.ledgerDark} strokeWidth={5} fill="none" />
          <path d="M 172 822 Q 560 806 960 826 Q 1360 806 1748 822" stroke={C.ledgerDark} strokeWidth={4} fill="none" />
          {/* のど (中央のくぼみの影) */}
          {[0, 1, 2].map((k) => <line key={k} x1={960 + (k - 1) * 10} y1={142} x2={960 + (k - 1) * 10} y2={808} stroke={C.ledgerDark} strokeWidth={8 - k * 2} opacity={0.6} />)}
          {/* 罫線と赤い余白線 */}
          <g stroke={C.ruled} strokeWidth={2} opacity={0.75}>
            {Array.from({ length: 15 }, (_, i) => <line key={i} x1={190} y1={200 + i * 40} x2={1730} y2={200 + i * 40} />)}
          </g>
          <line x1={250} y1={150} x2={250} y2={796} stroke="#D98A8A" strokeWidth={3} />
          <line x1={1040} y1={150} x2={1040} y2={796} stroke="#D98A8A" strokeWidth={3} />
          {/* インクの手書き (読めない走り書き) */}
          <g stroke={C.inkBlue} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.75}>
            {[0, 1, 2].map((r) => (
              <path key={r} d={`M ${520 + r * 10} ${232 + r * 40} q 14 -14 28 0 t 28 0 t 28 0 t 28 0 q 10 -16 22 0 t 26 0 t 30 0 t 22 0`} />
            ))}
            {[0, 1, 2].map((r) => (
              <path key={r} d={`M ${1100} ${232 + r * 40} q 14 -14 28 0 t 28 0 t 28 0 q 10 -16 22 0 t 26 0 t 30 0 t 22 0 t 28 0 t 26 0`} />
            ))}
          </g>
          {/* しみ・インクのしずく */}
          <ellipse cx={1620} cy={740} rx={70} ry={44} fill={C.stain} opacity={0.35} />
          <ellipse cx={300} cy={760} rx={44} ry={30} fill={C.stain} opacity={0.3} />
          <circle cx={1690} cy={250} r={14} fill={C.inkBlue} opacity={0.7} />
          <circle cx={1712} cy={266} r={6} fill={C.inkBlue} opacity={0.7} />
          {/* 早い側・遅い側のうっすらした色分け */}
          <rect x={AX(4)} y={330} width={AX(6) - AX(4)} height={270} fill={KRP.orange} opacity={0.1} />
          <rect x={AX(6)} y={330} width={AX(7) - AX(6)} height={270} fill={KRP.blue} opacity={0.12} />
          {/* 時刻の目盛り */}
          <line x1={AX(4) - 20} y1={560} x2={AX(7) + 30} y2={560} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <path d={`M ${AX(7) + 30} 560 l -20 -12 l 0 24 Z`} fill={INK} />
          {[4, 5, 6, 7].map((h) => (
            <g key={h}>
              <line x1={AX(h)} y1={546} x2={AX(h)} y2={574} stroke={INK} strokeWidth={6} />
              {h !== 6 && <text x={AX(h)} y={614} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>{h}時</text>}
            </g>
          ))}
          {[4.5, 5.5, 6.5].map((h) => <line key={h} x1={AX(h)} y1={552} x2={AX(h)} y2={568} stroke={INK} strokeWidth={4} />)}
          {/* 6時の赤い線 */}
          <line x1={AX(6)} y1={330} x2={AX(6)} y2={600} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
          {/* 遅い側の銅貨 (2枚 + 点線の3枚目) */}
          {c1 > 0 && <MzGCoin x={1300} y={480 - (1 - c1) * 120} r={44} kind="copper" rot={-8} />}
          {c2 > 0 && <MzGCoin x={1410} y={480 - (1 - c2) * 120} r={44} kind="copper" rot={10} />}
          {c3 > 0 && <g opacity={c3}><MzGCoin x={1520} y={480} r={44} kind="copper" ghost /></g>}
          {/* 早い側の大きな銀貨 */}
          {sv > 0 && <MzGCoin x={AX(5)} y={svY} r={80} kind="silver" />}
          {thud > 0.02 && (
            <g opacity={thud}>
              {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
                <line key={`${sd}${k}`} x1={AX(5) + sd * (96 + k * 4)} y1={520 - k * 26} x2={AX(5) + sd * (130 + k * 10)} y2={510 - k * 34} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              )))}
            </g>
          )}
          {/* ずらされて銀貨に変わる硬貨 */}
          {hin > 0.3 && (becameSilver ? (
            <g transform={`translate(${coinX} 470) scale(${0.8 + 0.2 * pop(flip)}) translate(${-coinX} -470)`}>
              <MzGCoin x={coinX} y={470} r={56} kind="silver" />
            </g>
          ) : <MzGCoin x={coinX} y={470} r={44} kind="copper" />)}
          {flip > 0 && flip < 1 && [0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k / 6) * Math.PI * 2;
            return <circle key={k} cx={AX(6) - 20 + Math.cos(a) * 70 * flip} cy={470 + Math.sin(a) * 70 * flip} r={16 + flip * 12} fill={KRP.white} opacity={(1 - flip) * 0.8} />;
          })}
          {/* 札 */}
          <TagPlate x={330} y={206} text="1853年" size={44} t={seg(f, 0, 10)} />
          <TagPlate x={1170} y={300} text="6時" size={40} t={seg(f, 4, 14)} color={KRP.red} />
          <TagPlate x={750} y={690} text="6ペンス" size={42} t={seg(f, 28, 36)} />
          <TagPlate x={1410} y={690} text="2〜3ペンス" size={42} t={seg(f, 26, 34)} />
        </g>
        {/* 灰色のコートの袖と手 */}
        {hin > 0.01 && hout < 0.99 && (
          <g transform={`translate(${handX + 46} ${handY - 6}) rotate(-28)`}>
            <rect x={14} y={-38} width={520} height={86} rx={26} fill={C.coat} stroke={INK} strokeWidth={6} />
            <rect x={14} y={-38} width={44} height={86} rx={14} fill={C.coatDark} stroke={INK} strokeWidth={5} />
            <ellipse cx={-6} cy={4} rx={50} ry={42} fill={KRP.white} stroke={INK} strokeWidth={6} />
            <ellipse cx={-34} cy={-28} rx={18} ry={13} fill={KRP.white} stroke={INK} strokeWidth={5} transform="rotate(-30 -34 -28)" />
          </g>
        )}
      </g>
      {/* 石段の上のインクつぼと羽ペン */}
      <g transform="translate(104 760)">
        <path d="M -40 0 L -32 -54 L 32 -54 L 40 0 Z" fill="#2E3446" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-16} y={-70} width={32} height={18} fill="#2E3446" stroke={INK} strokeWidth={4} />
        <path d={`M 4 -64 Q 30 -160 ${70 + Math.sin(f / 20) * 4} -240 Q 40 -150 14 -64 Z`} fill={KRP.white} stroke={INK} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #141 早起きほど、高くつきます。
// 格: 山 (★笑いどころ) / seed 6141
// どこ: MachiNami (sky=0.1) の通りの真ん中に立つ、ノッカー・アップの「お品書き」の黒板の立て看板 (木の枠・チョーク)。夜明け前の石畳とガス灯。
// 演出: 看板には3時〜7時の時刻。各時刻から値札がぶら下がる (数字は書かない)。7時は親指ほど・6時は手のひら・5時は顔ほど・
//       4時は人の背丈ほど・3時は看板をはみ出して空から落ち、石畳にずしんとめり込む巨大さ。
//       寝間着の男性 (ナイトキャップ) が財布をのぞいて青ざめ、そっと7時の小さい値札を指す (財布から蛾がひらひら)。
//       隣でノッカー・アップが腕組みしてにやり。
// 動き: f0-26 小さい値札から引きながら上へ (値札がどんどん大きく) / f22-30 3時の値札が落ちる / f30 ずしん・画面ゆれ・土ぼこり・ひび /
//       f30 男性が青ざめ・f34 7時を指す / f34- 蛾 / f40 ノッカー・アップの目がきらっ
const Mz141: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 0, 26));
  const Z = lerp(2.0, 1.0, e), cx = lerp(660, 960, e), cy = lerp(700, 540, e);
  const fall = seg(f, 22, 30);
  const dropY = -760 * (1 - fall * fall) + (f >= 30 ? -Math.max(0, Math.sin((f - 30) / 1.6)) * 14 * (1 - seg(f, 30, 40)) : 0);
  const shake = f >= 30 ? Math.sin(f * 3.3) * 12 * (1 - seg(f, 30, 44)) : 0;
  const dust = seg(f, 30, 50);
  const rows = [3, 4, 5, 6, 7];
  const rowY = (h: number) => 220 + (h - 3) * 130;
  // 値札: [中心x, 上端y, 幅, 高さ]
  const tags: Record<number, [number, number, number, number]> = {
    7: [664, 758, 26, 18], 6: [686, 632, 60, 42], 5: [770, 514, 124, 88], 4: [960, 380, 210, 300], 3: [1420, 262, 560, 760],
  };
  const pale = f >= 30;
  const moth = seg(f, 34, 76);
  return (
    <Frame f={f} seed={6141} dark bg={MP.nightDeep}>
      <g transform={`translate(${shake} ${shake * 0.4}) ${cam(cx, cy, Z)}`}>
        <MachiNami f={f} windows={[0, 0, 0, 0, 0, 0]} sky={0.1} />
        {MACHI_WIN.map(([wx, wy], i) => (i === 0 || i === 5) && <MzGZzz key={i} x={wx + 44} y={wy - 118} f={f} phase={i} />)}
        {/* 立て看板 (A字の脚・木の枠・黒板) */}
        <line x1={190} y1={880} x2={250} y2={120} stroke={C.frameWoodDark} strokeWidth={20} />
        <line x1={590} y1={880} x2={530} y2={120} stroke={C.frameWoodDark} strokeWidth={20} />
        <rect x={140} y={110} width={500} height={770} rx={10} fill={C.frameWood} stroke={INK} strokeWidth={7} />
        <rect x={164} y={134} width={452} height={722} rx={4} fill={C.board} stroke={INK} strokeWidth={5} />
        <g stroke={C.boardDark} strokeWidth={10} opacity={0.5}>{[260, 520, 700].map((ly) => <line key={ly} x1={176} y1={ly} x2={604} y2={ly - 20} />)}</g>
        {/* 看板の上のチョークの絵 (棒と房) */}
        <g stroke={C.chalk} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}>
          <line x1={480} y1={160} x2={590} y2={150} />
          {[-30, -10, 10, 30].map((a) => <line key={a} x1={590} y1={150} x2={590 + Math.cos((a * Math.PI) / 180) * 18} y2={150 + Math.sin((a * Math.PI) / 180) * 18} />)}
        </g>
        {rows.map((h) => (
          <g key={h}>
            <text x={250} y={rowY(h) + 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={C.chalk} opacity={0.92}>{h}時</text>
            <line x1={320} y1={rowY(h) + 2} x2={590} y2={rowY(h) + 2} stroke={C.chalk} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={0.7} />
            <circle cx={604} cy={rowY(h)} r={8} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 値札 (小さい順に) */}
        {rows.slice().reverse().map((h) => {
          const [tx, ty0, tw, th] = tags[h];
          const ty = h === 3 ? ty0 + dropY : ty0;
          const sw = h === 3 ? 0 : Math.sin(f / 14 + h) * 2;
          return (
            <g key={h}>
              <path d={`M 604 ${rowY(h)} Q ${(604 + tx) / 2} ${Math.max(rowY(h), ty) + 18} ${tx} ${ty + Math.min(th * 0.12, 30)}`} stroke={KRP.white} strokeWidth={h === 3 ? 6 : 3} fill="none" />
              <g transform={`rotate(${sw} ${tx} ${ty})`}>
                {h === 3 && <clipPath id="mzg141ground"><rect x={tx - tw} y={-2000} width={tw * 2} height={2000 + 990} /></clipPath>}
                <g clipPath={h === 3 ? "url(#mzg141ground)" : undefined}>
                  <path d={`M ${tx - tw / 2 + tw * 0.16} ${ty} L ${tx + tw / 2 - tw * 0.16} ${ty} L ${tx + tw / 2} ${ty + th * 0.14} L ${tx + tw / 2} ${ty + th} L ${tx - tw / 2} ${ty + th} L ${tx - tw / 2} ${ty + th * 0.14} Z`}
                    fill={C.tag} stroke={INK} strokeWidth={Math.max(2.5, Math.min(8, tw * 0.03))} strokeLinejoin="round" />
                  <path d={`M ${tx - tw / 2 + tw * 0.08} ${ty + th * 0.3} L ${tx + tw / 2 - tw * 0.08} ${ty + th * 0.3}`} stroke={C.tagDark} strokeWidth={Math.max(1.5, tw * 0.012)} />
                  <circle cx={tx} cy={ty + Math.min(th * 0.12, 30)} r={Math.max(3, Math.min(th * 0.04, 22))} fill={C.board} stroke={C.tagDark} strokeWidth={Math.max(2, tw * 0.012)} />
                </g>
              </g>
            </g>
          );
        })}
        {/* 石畳にめり込んだひびと土ぼこり */}
        {f >= 30 && (
          <g>
            <path d="M 1130 992 l -60 22 l -40 -6 M 1710 992 l 50 18 l 46 -4 M 1300 994 l -10 30 M 1560 994 l 14 28" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
            <rect x={1130} y={986} width={580} height={14} fill="#4E4640" />
          </g>
        )}
        {dust > 0 && dust < 1 && Array.from({ length: 7 }, (_, k) => (
          <circle key={k} cx={1140 + k * 92 + (k - 3) * 30 * dust} cy={990 - dust * 50 - (k % 2) * 20} r={30 + dust * 50} fill="#B8AE9E" opacity={(1 - dust) * 0.7} />
        ))}
        {/* 寝間着の男性: 財布をのぞいて青ざめ、7時の小さな札を指す */}
        <MzGSleeper x={470} y={890} s={1.0} f={f} face={pale ? "worried" : "normal"} pose={f >= 34 ? "point" : "stand"} pale={pale}
          gaze={f >= 34 ? [8, 2] : [-4, 8]} />
        {pale && <path d={`M 548 ${676 + Math.sin(f / 4) * 3} q -10 16 0 22 q 10 -6 0 -22 Z`} fill={C.sweat} stroke={INK} strokeWidth={2.5} />}
        {/* 財布 (左手) */}
        <g transform={`translate(403 ${830 + bobOf(f)})`}>
          <path d="M -26 -6 L 0 -26 L 0 6 L -26 18 Z" fill="#8A5A34" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 0 -26 L 26 -6 L 26 18 L 0 6 Z" fill="#A06A40" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        </g>
        {/* 空の財布から蛾がひらひら */}
        {moth > 0 && moth < 1 && (
          <g transform={`translate(${403 - moth * 120 + Math.sin(f / 3) * 14} ${812 - moth * 200})`} opacity={1 - moth * 0.5}>
            <ellipse cx={-9} cy={0} rx={11} ry={7 + Math.sin(f * 1.2) * 4} fill="#B8B0A4" stroke={INK} strokeWidth={2.5} />
            <ellipse cx={9} cy={0} rx={11} ry={7 + Math.sin(f * 1.2) * 4} fill="#B8B0A4" stroke={INK} strokeWidth={2.5} />
            <ellipse cx={0} cy={0} rx={3} ry={8} fill={INK} />
          </g>
        )}
        {/* 腕組みでにやりのノッカー・アップと、立てかけた棒 */}
        <MzGPole B={[1300, 990]} T={[1360, 470]} s={0.95} />
        <MzGKnocker x={1230} y={960} s={0.95} f={f} pose="armsFolded" face="smile" gaze={[-8, 0]} lean={-4} />
        {seg(f, 40, 48) > 0 && <MzGStar x={1194} y={724} r={20 * pop(seg(f, 40, 48)) * (1 - seg(f, 60, 70))} rot={f * 5} color={KRP.white} />}
        <MzGMist f={f} y={970} n={4} op={0.14} />
      </g>
    </Frame>
  );
};

// ---- 手回しの数取り器 (真鍮のカウンター)。n = 表示する数 ----
const MzGTally: React.FC<{ x: number; y: number; s?: number; n: number; press: number }> = ({ x, y, s = 1, n, press }) => {
  const digits = String(Math.max(0, Math.min(9999, Math.floor(n)))).padStart(4, "0").split("");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 指を通す輪 */}
      <circle cx={0} cy={150} r={44} fill="none" stroke={INK} strokeWidth={20} />
      <circle cx={0} cy={150} r={44} fill="none" stroke={KRP.silver} strokeWidth={12} />
      {/* 押しボタン */}
      <g transform={`translate(0 ${press * 14})`}>
        <rect x={-22} y={-196} width={44} height={70} rx={8} fill={KRP.silver} stroke={INK} strokeWidth={6} />
        <rect x={-34} y={-208} width={68} height={22} rx={10} fill={KRP.silver} stroke={INK} strokeWidth={6} />
      </g>
      {/* 本体 */}
      <circle cx={6} cy={8} r={134} fill={INK} opacity={0.3} />
      <circle r={134} fill={MP.brass} stroke={INK} strokeWidth={8} />
      <circle r={112} fill="none" stroke={MP.brassDark} strokeWidth={8} />
      <path d="M -100 -50 A 110 110 0 0 1 -40 -104" stroke={MP.brassLight} strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* リセットのつまみ */}
      <circle cx={128} cy={-44} r={20} fill={MP.brassDark} stroke={INK} strokeWidth={5} />
      <path d="M 118 -54 l 20 20 M 138 -54 l -20 20" stroke={INK} strokeWidth={2.5} opacity={0.5} />
      {/* 数字の窓 */}
      <rect x={-104} y={-42} width={208} height={84} rx={8} fill={INK} />
      {digits.map((d, i) => (
        <g key={i}>
          <rect x={-98 + i * 50} y={-36} width={46} height={72} rx={4} fill={KRP.white} stroke={INK} strokeWidth={3} />
          <text x={-75 + i * 50} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>{d}</text>
        </g>
      ))}
      <line x1={-104} y1={0} x2={104} y2={0} stroke={INK} strokeWidth={1.5} opacity={0.3} />
    </g>
  );
};

// -------------------------------------------------------------------
// #142 1人が回る家は、1日に、80軒から100軒。
// 格: 山 / seed 6142
// どこ: MachiNami の長屋 (2つつなげて12軒) を、高い位置から斜めに見下ろす。通りは右手前から左奥へずっと続き、奥は朝もやにかすむ。
// 演出: KnockerUp (pose="knock") が早送りで窓から窓へ叩いて回り、叩いた窓に明かりがぽっ、ぽっ、ぽっ (手前から奥へ明かりの列)。
//       後ろに残像と汗のしずく。右上に真鍮の数取り器が大写しで、数字が80を越えて100に近づく。数字札「80〜100軒」。
//       最後に奥でノッカー・アップが立ち止まり、額の汗をぬぐう。
// 動き: f0-62 窓から窓へ (早送り)・明かりが順につく / カウンターは f40 で80、そのあと97へ / f0-90 カメラが通りに沿って奥へパン /
//       f64- 額の汗をぬぐう・汗が飛ぶ / 煙突の煙
const Mz142: React.FC<{ f: number }> = ({ f }) => {
  const A = 0.46, B = 0.1, D = 0.55, F0 = -20;
  const P = (X: number, Y: number): Pt => [A * X, B * X + D * Y + F0];
  const pan = easeInOut(seg(f, 0, 90));
  const tx = 240 * pan, ty = 70 * pan;
  const run = seg(f, 2, 62);
  const kx = 3800 - 3650 * run;
  const Xs = Array.from({ length: 12 }, (_, i) => MACHI_WIN[i % 6][0] + 1980 * Math.floor(i / 6));
  const litOf = (i: number) => clamp01((Xs[i] + 80 - kx) / 100);
  const cand = Xs.filter((X) => X <= kx + 60);
  const tgt = cand.length ? Math.max(...cand) : Xs[0];
  const tip = P(tgt - 20, 335);
  const ks = lerp(0.85, 0.62, run);
  const [kpx, kpy] = P(kx, 1040);
  const n = f < 40 ? (80 * f) / 40 : 80 + 17 * seg(f, 40, 120);
  const press = f < 120 && f % 4 < 2 ? 1 : 0;
  const done = f >= 64;
  const [sky0, sky1] = skyColors(0.2);
  const clipRects = (
    <>
      <rect x={-40} y={148} width={2000} height={1000} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-30 + i * 330 + 300 - 50} y={44} width={100} height={106} />)}
    </>
  );
  return (
    <Frame f={f} seed={6142} dark bg={MP.nightDeep}>
      {/* 空 */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={0} y={i * 60 - 1} width={1920} height={62} fill={mixColor(sky0, sky1, i / 11)} />
      ))}
      <g transform={`translate(${tx} ${ty})`}>
        {/* 遠くの工場の煙突 */}
        {[1250, 1480, 1700].map((cxx, i) => (
          <g key={cxx}>
            <rect x={cxx - 18} y={150 + i * 40} width={36} height={300} fill="#3A4058" />
            {[0, 1, 2].map((j) => {
              const t = ((f / 120 + j / 3 + i * 0.3) % 1);
              return <circle key={j} cx={cxx - 60 * t} cy={150 + i * 40 - t * 110} r={18 + t * 40} fill="#6D6A75" opacity={(1 - t) * 0.4} />;
            })}
          </g>
        ))}
        <defs><clipPath id="mzg142clip">{clipRects}</clipPath></defs>
        {[-1, 0, 1].map((c) => (
          <g key={c} transform={`matrix(${A} ${B} 0 ${D} ${A * 1980 * c} ${B * 1980 * c + F0})`}>
            <g clipPath="url(#mzg142clip)">
              <MachiNami f={f + c * 40} windows={Array.from({ length: 6 }, (_, i) => (c < 0 ? 0 : litOf(c * 6 + i)))} sky={0.2} />
            </g>
            {/* 通りの石畳 (家並みの手前に広がる) */}
            <rect x={-40} y={1118} width={2000} height={900} fill="#6E655E" />
            {Array.from({ length: 18 }, (_, r) => Array.from({ length: 29 }, (_, cc) => (
              <rect key={`${r}-${cc}`} x={-40 + cc * 70 + (r % 2) * 35} y={1124 + r * 46} width={62} height={38} rx={13}
                fill={(r * 3 + cc) % 4 ? "#857B73" : "#91877E"} stroke={INK} strokeWidth={2.5} />
            )))}
            {/* 起きた家の煙突の煙 */}
            {Array.from({ length: 6 }, (_, i) => c >= 0 && litOf(c * 6 + i) > 0.3 && [0, 1, 2].map((j) => {
              const t = ((f / 60 + j / 3) % 1);
              const hx = -30 + i * 330 + 300;
              return <circle key={`${i}${j}`} cx={hx - 11 + t * 60} cy={44 - t * 120} r={10 + t * 26} fill="#B8B4BC" opacity={(1 - t) * 0.5} />;
            }))}
          </g>
        ))}
        {/* 通りの端の家の妻壁 (手前右) */}
        {(() => {
          const [ax, ay] = P(3940, 150), [bx, by] = P(3940, 1118);
          return (
            <g>
              <path d={`M ${ax} ${ay} L ${ax + 130} ${ay + 70} L ${bx + 130} ${by + 70} L ${bx} ${by} Z`} fill={MP.brickDark} stroke={INK} strokeWidth={5} />
              {Array.from({ length: 14 }, (_, k) => <line key={k} x1={ax} y1={ay + k * ((by - ay) / 14)} x2={ax + 130} y2={ay + 70 + k * ((by - ay) / 14)} stroke={MP.brick} strokeWidth={3} />)}
            </g>
          );
        })()}
        {/* Zzz (まだ起きていない窓) */}
        {Xs.map((X, i) => {
          const l = litOf(i);
          const [zx, zy] = P(X + 40, 240);
          return l < 1 && <MzGZzz key={i} x={zx} y={zy} s={0.8} f={f} phase={i} burst={clamp01(l * 2)} />;
        })}
        {/* 残像 */}
        {!done && [3, 2, 1].map((g) => {
          const gx = kx + g * 150;
          const [gpx, gpy] = P(gx, 1040);
          return (
            <g key={g} opacity={0.32 / g}>
              <KnockerUp x={gpx} y={gpy} s={ks} f={f - g * 2} pose="walk" dir={-1} />
            </g>
          );
        })}
        {/* ノッカー・アップ */}
        <ellipse cx={kpx} cy={kpy + 4} rx={90 * ks} ry={14 * ks} fill={MP.nightDeep} opacity={0.4} />
        {!done ? (
          <KnockerUp x={kpx} y={kpy} s={ks} f={f} pose="knock" dir={-1} tip={tip} face="smile" />
        ) : (
          <MzGKnocker x={kpx} y={kpy} s={ks} f={f} pose="raise" dir={-1} face="joy" />
        )}
        {/* 足元の汗のしずく・速さの線 */}
        {[0, 1, 2].map((k) => {
          const t = ((f / (done ? 16 : 9) + k / 3) % 1);
          const ox = done ? (k - 1) * 30 * t : 40 + t * 60;
          return <path key={k} d={`M ${kpx + ox} ${kpy - (done ? 250 : 200) * ks + t * 60} q -6 10 0 14 q 6 -4 0 -14 Z`} fill={C.sweat} stroke={INK} strokeWidth={2} opacity={1 - t} />;
        })}
        {!done && [0, 1, 2].map((k) => (
          <line key={k} x1={kpx + 70} y1={kpy - 40 - k * 40} x2={kpx + 150 + (f * 7 + k * 30) % 40} y2={kpy - 30 - k * 40} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        ))}
        {/* 奥の朝もや (遠いほど濃い) */}
        {Array.from({ length: 6 }, (_, k) => (
          <ellipse key={k} cx={-260 + k * 40} cy={300 + k * 60} rx={420 - k * 30} ry={520} fill={MP.mist} opacity={0.09} />
        ))}
      </g>
      {/* 数取り器と札 (画面に固定) */}
      <MzGTally x={1580} y={250} s={0.95} n={n} press={press} />
      <TagPlate x={1580} y={470} text="80〜100軒" size={44} t={seg(f, 8, 20)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #143 朝の数時間で、町じゅうを起こして回りました。
// 格: 山 / seed 6143
// どこ: 丘の上から見下ろす町全体 (この章の全景)。MachiNami の長屋が奥から手前へ3列、遠くに工場の煙突。手前は草の丘と、柱の上の町の時計。
// 演出: 3つの通りを、ノッカー・アップが1人ずつ (マフラーは赤・青・緑) 歩く。通ったところから窓の明かりが波のように広がり、
//       窓の上の Zzz の泡がぱちん、ぱちんと割れる。起きた家の煙突から煙。空が紺から夜明けの橙へ。最後の1軒が明かるくなると時計がちょうど6時。
// 動き: f0-100 空が明るくなる (sky 0.1→0.8) / 窓の明かりが3つの通りで順に広がる / Zzz が割れる / 時計の針が3時→6時 /
//       工場と家の煙 / f0-110 カメラがゆっくり引く
const Mz143: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 0, 100);
  const sky = lerp(0.1, 0.8, t);
  const Z = lerp(1.12, 1.0, easeInOut(seg(f, 0, 110)));
  const [s0, s1] = skyColors(sky);
  const rows = [
    { k: 0.18, yg: 300, ox: -120, path: (ff: number) => -60 + 2060 * seg(ff, 4, 96), dir: 1 as 1 | -1, scarf: C.scarfGreen },
    { k: 0.22, yg: 475, ox: -300, path: (ff: number) => 1980 - 2060 * seg(ff, 0, 90), dir: -1 as 1 | -1, scarf: C.scarfBlue },
    { k: 0.27, yg: 690, ox: -60, path: (ff: number) => -60 + 2060 * seg(ff, 8, 100), dir: 1 as 1 | -1, scarf: C.scarf },
  ];
  const hourA = 90 + 90 * t, minA = 360 * 3 * t;
  return (
    <Frame f={f} seed={6143} dark={sky < 0.5} bg={MP.nightDeep}>
      <defs>
        <clipPath id="mzg143clip">
          <rect x={-40} y={148} width={2000} height={792} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-30 + i * 330 + 250} y={44} width={100} height={106} />)}
        </clipPath>
      </defs>
      <g transform={`translate(960 540) scale(${Z}) translate(-960 -540)`}>
        {/* 空 */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-100} y={-100 + i * 50} width={2120} height={52} fill={mixColor(s0, s1, i / 9)} />
        ))}
        <ellipse cx={1480} cy={190} rx={520} ry={120} fill={MP.dawn} opacity={0.35 * t} />
        <circle cx={1480} cy={196} r={46 * t} fill={MP.dawnSoft} opacity={0.6 * t} />
        {/* 遠くの丘と工場の煙突 */}
        <path d="M -100 200 Q 300 140 700 180 T 1500 170 T 2100 190 L 2100 300 L -100 300 Z" fill={mixColor("#2E3348", "#7C8294", sky / 2)} />
        {[260, 640, 1180, 1640].map((cxx, i) => (
          <g key={cxx}>
            <rect x={cxx - 12} y={70 + (i % 2) * 24} width={24} height={150} fill={mixColor("#2A2F44", "#6C7284", sky / 2)} />
            {[0, 1, 2, 3].map((j) => {
              const tt = ((f / 90 + j / 4 + i * 0.27) % 1);
              return <circle key={j} cx={cxx + tt * 110} cy={70 + (i % 2) * 24 - tt * 80} r={(10 + tt * 34) * (0.4 + 0.6 * seg(f, 10, 80))} fill="#8C8894" opacity={(1 - tt) * 0.45} />;
            })}
          </g>
        ))}
        {/* 長屋の3列 (奥から) */}
        {rows.map((r, ri) => {
          const kxNow = r.path(f);
          const w = 1980 * r.k;
          const nCopies = Math.ceil((2100 - r.ox) / w) + 1;
          const knY = r.yg + 40 * r.k;
          return (
            <g key={ri}>
              {Array.from({ length: nCopies }, (_, n) => {
                const x0 = r.ox + n * w;
                const winLit = MACHI_WIN.map(([wx]) => {
                  const sx = x0 + wx * r.k;
                  return clamp01((r.dir === 1 ? kxNow - sx : sx - kxNow) / 50);
                });
                return (
                  <g key={n} transform={`translate(${x0} ${r.yg - 880 * r.k}) scale(${r.k})`}>
                    <g clipPath="url(#mzg143clip)">
                      <MachiNami f={f + n * 13 + ri * 7} windows={winLit} sky={sky} />
                    </g>
                    {winLit.map((l, i) => l > 0.3 && [0, 1].map((j) => {
                      const tt = ((f / 70 + j / 2 + i * 0.13) % 1);
                      const hx = -30 + i * 330 + 300;
                      return <circle key={`${i}${j}`} cx={hx - 11 + tt * 70} cy={44 - tt * 150} r={14 + tt * 36} fill="#C8C4CC" opacity={(1 - tt) * 0.5} />;
                    }))}
                    {[1, 4].map((i) => winLit[i] < 1 && (
                      <MzGZzz key={i} x={MACHI_WIN[i][0] + 50} y={MACHI_WIN[i][1] - 120} s={1.5} f={f} phase={i + n} burst={clamp01(winLit[i] * 1.5)} />
                    ))}
                  </g>
                );
              })}
              {/* この通りのノッカー・アップ */}
              <KnockerUp x={kxNow} y={knY} s={0.9 * r.k * 1.3} f={f} pose="walk" dir={r.dir} phase={ri} />
              <MzGScarfFront x={kxNow} y={knY} s={0.9 * r.k * 1.3} f={f} phase={ri} dir={r.dir} color={r.scarf} />
            </g>
          );
        })}
        {/* 手前の草の丘 */}
        <path d="M -100 706 Q 400 698 900 712 T 2100 704 L 2100 1200 L -100 1200 Z" fill={C.grass} stroke={INK} strokeWidth={6} />
        <path d="M -100 830 Q 500 800 1000 830 T 2100 820 L 2100 1200 L -100 1200 Z" fill={C.grassDark} opacity={0.5} />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M ${i * 92 + 20} ${790 + (i % 3) * 26} l 6 -22 l 6 22 l 6 -16 l 4 16`} stroke={C.grassLight} strokeWidth={4} fill="none"
            transform={`rotate(${Math.sin(f / 18 + i) * 4} ${i * 92 + 26} ${790 + (i % 3) * 26})`} />
        ))}
        {/* 丘の木の柵 */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={540 + i * 150} y={736 + Math.sin(i) * 6} width={14} height={70} fill={MP.wood} stroke={INK} strokeWidth={3.5} />
        ))}
        <path d="M 540 760 Q 1140 744 1754 756" stroke={MP.woodDark} strokeWidth={8} fill="none" />
        {/* 町の時計 (柱の上) */}
        <g>
          <rect x={180} y={360} width={20} height={520} fill={MP.iron} stroke={INK} strokeWidth={5} />
          <rect x={160} y={860} width={60} height={30} rx={6} fill={MP.iron} stroke={INK} strokeWidth={5} />
          <circle cx={190} cy={300} r={70} fill={MP.iron} stroke={INK} strokeWidth={6} />
          <circle cx={190} cy={300} r={58} fill={KRP.cream} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={190} y1={248} x2={190} y2={i % 3 === 0 ? 260 : 255} stroke={INK} strokeWidth={i % 3 === 0 ? 5 : 3} transform={`rotate(${i * 30} 190 300)`} />
          ))}
          <line x1={190} y1={300} x2={190} y2={266} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hourA} 190 300)`} />
          <line x1={190} y1={300} x2={190} y2={252} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minA} 190 300)`} />
          <circle cx={190} cy={300} r={6} fill={KRP.red} stroke={INK} strokeWidth={2} />
          <path d="M 116 236 L 190 196 L 264 236 Z" fill={MP.iron} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {t >= 1 && <circle cx={190} cy={300} r={70 + ((f - 100) % 14) * 3} fill="none" stroke={MP.glow} strokeWidth={5} opacity={1 - ((f - 100) % 14) / 14} />}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #144 でも、おかしいと思いませんか。
// 格: 並 / seed 6144
// どこ: 夜明けの MachiNami (sky=0.8・窓は全部明るい) の通り。ガス灯の柱。
// 演出: 仕事を終えたノッカー・アップがガス灯の柱にもたれて休む。左の画面の端から、水色のパジャマのあなたが
//       時代を飛び越えたように (青い渦から) ひょいと現れ、ノッカー・アップと手の中のスマホを見比べて首をかしげる。頭の上に大きな「？」。
//       ノッカー・アップもスマホを見て「なんだそれ?」と首をかしげる (小さな「？」)。
// 動き: f0-16 あなたが端から出てくる (渦が消える) / f14-24 スマホを見る / f24-32 ノッカー・アップを見る / f32- またスマホ /
//       f34-42 二人同時に首をかしげる・「？」がぽん / f30-90 あなたの顔へ少し寄る
const Mz144: React.FC<{ f: number }> = ({ f }) => {
  const ez = easeInOut(seg(f, 30, 90));
  const Z = lerp(1.45, 1.6, ez), cx = lerp(900, 860, ez);
  const yx = lerp(80, 560, easeOut(seg(f, 0, 16)));
  const tilt = easeOut(seg(f, 34, 42));
  const lookK = f >= 24 && f < 32;
  const yGaze: [number, number] = f < 14 ? [6, 0] : lookK ? [10, -2] : [3, 9];
  const warp = 1 - seg(f, 10, 26);
  const YY = 990, YS = 0.95;
  const yb = bobOf(f, 2);
  const phX = yx + 6, phY = YY + yb - 150 * YS;
  return (
    <Frame f={f} seed={6144} bg={MP.nightDeep}>
      <g transform={cam(cx, 700, Z)}>
        <MachiNami f={f} windows={[1, 1, 1, 1, 1, 1]} sky={0.8} />
        {/* 時代を飛び越えた青い渦 */}
        {warp > 0.02 && (
          <g opacity={warp}>
            {[0, 1, 2, 3].map((k) => (
              <ellipse key={k} cx={330} cy={820} rx={90 + k * 40} ry={200 + k * 50} fill="none" stroke={k % 2 ? MP.you : KRP.white} strokeWidth={8 - k}
                strokeDasharray="40 30" strokeDashoffset={f * 8 * (k % 2 ? 1 : -1)} />
            ))}
            {Array.from({ length: 6 }, (_, k) => <MzGStar key={k} x={330 + Math.cos(f / 5 + k) * 160} y={820 + Math.sin(f / 5 + k) * 260} r={14} color={KRP.white} />)}
          </g>
        )}
        {/* 壁に立てかけた棒 */}
        <MzGPole B={[1190, 1004]} T={[1310, 470]} s={1} />
        {/* ガス灯にもたれるノッカー・アップ */}
        <ellipse cx={1080} cy={996} rx={100} ry={16} fill={INK} opacity={0.25} />
        <MzGKnocker x={1090} y={990} s={1.0} f={f} dir={-1} pose="armsFolded" lean={10 + 7 * tilt}
          face={f < 30 ? "smile" : "worried"} gaze={f < 30 ? [0, 0] : [7, 5]} />
        <QMark x={1010} y={630} s={0.6} f={f} t={seg(f, 36, 42)} />
        {/* あなた (水色のパジャマ)。スマホを持って見比べる */}
        <ellipse cx={yx} cy={996} rx={90} ry={15} fill={INK} opacity={0.25} />
        <Person x={yx} y={YY} s={YS} f={f} pose="hold" cloth={MP.you} clothDark={MP.youDark} hair="cap"
          face={f < 14 ? "surprised" : "worried"} gaze={yGaze} lean={-10 * tilt} phase={2} />
        {/* スマホ (ロゴなし。画面にアラームの行だけ) */}
        <g transform={`rotate(${-8 - 10 * tilt} ${phX} ${phY + 30})`}>
          <circle cx={phX} cy={phY} r={50} fill={C.phoneScreen} opacity={0.35 + 0.1 * Math.sin(f / 4)} />
          <rect x={phX - 19} y={phY - 34} width={38} height={66} rx={7} fill={C.phone} stroke={INK} strokeWidth={4} />
          <rect x={phX - 14} y={phY - 28} width={28} height={52} rx={3} fill={C.phoneScreen} />
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <rect x={phX - 11} y={phY - 23 + k * 12} width={14} height={6} rx={2} fill={MP.youDark} />
              <circle cx={phX + 7} cy={phY - 20 + k * 12} r={3} fill={k === 0 ? MP.bell : KRP.gray} />
            </g>
          ))}
        </g>
        <QMark x={yx - 10} y={680} s={1.1} f={f} t={seg(f, 34, 42)} />
        {/* 見比べる視線の点線 */}
        {lookK && <path d={`M ${yx + 40} ${YY - 230} Q ${(yx + 1040) / 2} ${YY - 330} 1040 ${YY - 230}`} stroke={KRP.white} strokeWidth={4} strokeDasharray="6 12" fill="none" opacity={0.8} />}
        <MzGMist f={f} y={960} n={4} op={0.14} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_133: (f) => <Mz133 f={f} />,
  mz_134: (f) => <Mz134 f={f} />,
  mz_135: (f) => <Mz135 f={f} />,
  mz_136: (f) => <Mz136 f={f} />,
  mz_137: (f) => <Mz137 f={f} />,
  mz_138: (f) => <Mz138 f={f} />,
  mz_139: (f) => <Mz139 f={f} />,
  mz_140: (f) => <Mz140 f={f} />,
  mz_141: (f) => <Mz141 f={f} />,
  mz_142: (f) => <Mz142 f={f} />,
  mz_143: (f) => <Mz143 f={f} />,
  mz_144: (f) => <Mz144 f={f} />,
};

export const MZ_G_MOTIFS: string[] = [
  "mz_133", // #133
  "mz_134", // #134
  "mz_135", // #135
  "mz_136", // #136
  "mz_137", // #137
  "mz_138", // #138
  "mz_139", // #139
  "mz_140", // #140
  "mz_141", // #141
  "mz_142", // #142
  "mz_143", // #143
  "mz_144", // #144
];

export const mezaGScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
