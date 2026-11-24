// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#160〜#168 (9文)
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
  // 夜の劇場街
  night: "#1F2440", nightLow: "#2E3358", nightFar: "#262B48", moon: "#F6E7B8",
  street: "#3A3650", streetLine: "#2A2740",
  roof: "#3A3F4E", roofDark: "#2A2E3A", roofLine: "#555B6E",
  facade: "#6E4A2E", facadeDark: "#4E3320", lattice: "#8E6238",
  warm: "#FFD9A0", warmCore: "#FFF0CF",
  lantern: "#D9503F", lanternOff: "#5A3A36",
  noboriRed: "#C8463A", noboriIndigo: "#3F5E96", noboriYellow: "#E2B43C", noboriGreen: "#5E8F5A", noboriWhite: "#EFE6D2",
  // 歌舞伎・寄席
  kami: "#3B3F52", kamiDark: "#2A2D3C",
  jBlack: "#2A2622", kaki: "#B5652E", moegi: "#4E6B3A",
  stage: "#C9A26B", stageDark: "#A8834F", stageLine: "#9A7445",
  pineGround: "#E2C779", pine: "#4E7A45", pineDark: "#35573A", trunk: "#7A5233",
  valance: "#6B2E2A",
  hairGray: "#A9A49A", hairWhite: "#D8D3C8",
  gold: "#E0B43A", goldDark: "#A8862A",
  zenza: "#7A8F5E", futa: "#3B3F52", shin: "#2B2B33", rakugo: "#5B4E86",
  under: "#6B6F86", lapZen: "#6A7D50", lapFuta: "#565A72", lapShin: "#4A4A55",
  zabuton: "#8E3F5E", zabutonDark: "#6E2E48",
  byobu: "#D9B860", byobuDark: "#B8963E",
  // 人
  narr: "#6F8FB0", narrDark: "#56769A",
  skin: "#F4DCC6", mawashi: "#2B2B33", oyakata: "#3B3F52",
  // 作業場
  wallShop: "#CDBE9E", wallShopDark: "#A99877",
  desk: "#B58A5A", deskDark: "#8E6A40",
  dial: "#FBF6EA",
  // 土俵
  dohyo: "#C9A577", dohyoDark: "#A8844F", dohyoFront: "#B38E5E", tawara: "#D9C58A",
  fusaBlue: "#3F6FB0", fusaRed: "#C8463A", fusaWhite: "#F3EFE6", fusaBlack: "#2B2B33",
  maku: "#5B3F7A", makuDark: "#432D5C",
  arena: "#3A3346", arenaSeat: "#6B4E3E",
  // 巻物・床の間
  plaster: "#E9DFC8", plasterDark: "#D3C6A8",
  brocade: "#6B5A44", brocadeLight: "#8E7A5C", scroll: "#F3E9CF",
  tatami: "#C9C08A", tatamiDark: "#A79E6A",
  // 楽屋・袖
  wing: "#24222A", wingLight: "#34313C", rope: "#B89A6A", sandbag: "#9A8A6A",
  bag: "#8E5A32", bagDark: "#6A4224",
  // 相撲部屋
  plank: "#9C7448", plankDark: "#7E5A36", board: "#5C3D24", tag: "#E9D3A6", tagLit: "#F6E4B6",
  clay: "#B99468", glass: "#CFE3EA",
} as const;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void PersonMini; void Stamp; void QMark; void XMark; void Arrow; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock; void W; void H;

type PoseT = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";
type FaceT = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";

// 後ろ姿の人 (Person の上から後頭部を髪の色で塗って顔を隠す)。kami で裃、mage でまげ
const NH1Back: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; cloth?: string; clothDark?: string;
  hair?: string; pose?: PoseT; lean?: number; mage?: boolean; kami?: boolean; hood?: string;
}> = ({ x, y, s = 1, f = 0, phase = 0, cloth = C.narr, clothDark, hair = KRP.ink, pose = "stand", lean = 0, mage = false, kami = false }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 2.5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <Person x={0} y={0} f={f} phase={phase} cloth={cloth} clothDark={clothDark ?? cloth} pose={pose} still hair="none" />
      {kami && (
        <g>
          {/* 袴 */}
          <path d="M -46 -66 L 46 -66 L 60 -2 L -60 -2 Z" fill={C.kami} stroke={KRP.ink} strokeWidth={4.5} />
          <g stroke={C.kamiDark} strokeWidth={3}>
            <line x1={-24} y1={-62} x2={-30} y2={-6} /><line x1={0} y1={-62} x2={0} y2={-6} /><line x1={24} y1={-62} x2={30} y2={-6} />
          </g>
          {/* 肩衣 (かたぎぬ) の張った肩 */}
          <path d="M -58 -160 L -118 -170 Q -122 -150 -104 -126 L -58 -128 Z" fill={C.kami} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 58 -160 L 118 -170 Q 122 -150 104 -126 L 58 -128 Z" fill={C.kami} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-58} y={-160} width={116} height={34} rx={8} fill={C.kami} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-158} x2={0} y2={-70} stroke={C.kamiDark} strokeWidth={4} />
          {/* 白足袋 */}
          <ellipse cx={-22} cy={-2} rx={18} ry={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={22} cy={-2} rx={18} ry={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 耳 → 後頭部 (髪) */}
      <ellipse cx={-64} cy={-220} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={64} cy={-220} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-228} r={66} fill={hair} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -40 -262 Q 0 -286 40 -262" stroke={KRP.white} strokeWidth={5} opacity={0.22} fill="none" />
      {/* 襟足 */}
      <path d="M -26 -168 Q 0 -160 26 -168" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.6} />
      {mage && (
        <g>
          <path d="M -12 -292 Q -16 -318 0 -322 Q 16 -318 12 -292 Z" fill={hair} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-298} width={32} height={8} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
    </g>
  );
};

// 正座の人 (Person の脚を切って、ひざを描く)。children は Person と同じ座標で上に重ねる
const NH1Seated: React.FC<{
  id: string; x: number; y: number; s?: number; f?: number; phase?: number; cloth: string; clothDark?: string;
  face?: FaceT; pose?: PoseT; hair?: "cap" | "none"; lap: string; gaze?: [number, number]; lean?: number;
  children?: React.ReactNode;
}> = ({ id, x, y, s = 1, f = 0, phase = 0, cloth, clothDark, face = "normal", pose = "stand", hair = "cap", lap, gaze = [0, 0], lean = 0, children }) => {
  const breathe = 1 + Math.sin((f + phase * 9) / 12) * 0.008;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      <defs>
        <clipPath id={id}><rect x={-320} y={-560} width={640} height={556} /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`} transform={`scale(1 ${breathe})`}>
        <g transform="translate(0 52)">
          <Person x={0} y={0} f={f} phase={phase} cloth={cloth} clothDark={clothDark ?? cloth} face={face} pose={pose} hair={hair} gaze={gaze} still />
          {children}
        </g>
      </g>
      {/* 正座のひざ */}
      <path d="M -98 -16 Q -128 28 -94 46 L 94 46 Q 128 28 98 -16 Q 0 -30 -98 -16 Z" fill={lap} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -6 -18 L -4 44" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
    </g>
  );
};

// 着物の襟 (Person 座標)。under = 中の色
const NH1Collar: React.FC<{ under?: string }> = ({ under = KRP.white }) => (
  <g>
    <path d="M -30 -160 L 0 -112 L 30 -160 Z" fill={under} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -20 -160 L 0 -126 L 20 -160" fill="none" stroke={KRP.white} strokeWidth={7} />
  </g>
);

// 提灯 (字は描かない)。lit 0〜1
const NH1Chochin: React.FC<{ x: number; y: number; s?: number; lit?: number; f?: number; phase?: number; color?: string }> = ({ x, y, s = 1, lit = 1, f = 0, phase = 0, color = C.lantern }) => {
  const sw = Math.sin((f + phase * 13) / 15) * 3;
  const L = clamp01(lit);
  return (
    <g transform={`translate(${x} ${y}) rotate(${sw}) scale(${s})`}>
      <line x1={0} y1={-56} x2={0} y2={-36} stroke={KRP.ink} strokeWidth={4} />
      {L > 0.01 && <circle cx={0} cy={0} r={58} fill={C.warm} opacity={0.28 * L} />}
      <ellipse cx={0} cy={0} rx={26} ry={34} fill={L > 0.5 ? color : C.lanternOff} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={14} ry={30} fill={C.warmCore} opacity={0.5 * L} />
      {[-18, -6, 6, 18].map((yy) => (
        <path key={yy} d={`M -25 ${yy} Q 0 ${yy + 4} 25 ${yy}`} stroke={KRP.ink} strokeWidth={1.8} fill="none" opacity={0.45} />
      ))}
      <rect x={-16} y={-40} width={32} height={9} rx={3} fill={KRP.ink} />
      <rect x={-16} y={31} width={32} height={9} rx={3} fill={KRP.ink} />
    </g>
  );
};

// 金の縁の札 (名跡の札。字は描かず、中が光る)
const NH1Kinfuda: React.FC<{ x: number; y: number; w?: number; h?: number; glow?: number; f?: number; rot?: number }> = ({ x, y, w = 360, h = 190, glow = 1, f = 0, rot = 0 }) => {
  const G = clamp01(glow);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={w * 0.62} fill={NP.glow} opacity={0.16 + 0.18 * G} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + f / 60;
        return (
          <line key={i} x1={Math.cos(a) * w * 0.42} y1={Math.sin(a) * h * 0.62} x2={Math.cos(a) * w * 0.66} y2={Math.sin(a) * h * 0.95}
            stroke={NP.glow} strokeWidth={8} strokeLinecap="round" opacity={0.5 * G} />
        );
      })}
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={16} fill={KRP.ink} opacity={0.2} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={C.gold} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-w / 2 + 18} y={-h / 2 + 18} width={w - 36} height={h - 36} rx={8} fill={NP.wood} stroke={C.goldDark} strokeWidth={5} />
      <rect x={-w / 2 + 30} y={-h / 2 + 30} width={w - 60} height={h - 60} rx={6} fill={NP.glowCore} opacity={0.5 + 0.5 * G} />
      {/* 光る中身 (字の代わりのきらめき) */}
      {[[-0.22, -0.05, 1], [0.05, 0.12, 0.7], [0.24, -0.12, 0.85]].map(([px, py, k], i) => {
        const tw = 0.6 + 0.4 * Math.sin(f / 6 + i * 2);
        const r = 22 * k * tw;
        return (
          <path key={i} transform={`translate(${px * w} ${py * h})`}
            d={`M 0 ${-r} Q 3 -3 ${r} 0 Q 3 3 0 ${r} Q -3 3 ${-r} 0 Q -3 -3 0 ${-r} Z`} fill={KRP.white} opacity={0.9 * G} />
        );
      })}
      {/* 四隅の金具 */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <circle key={i} cx={sx * (w / 2 - 14)} cy={sy * (h / 2 - 14)} r={9} fill={C.goldDark} stroke={KRP.ink} strokeWidth={3} />
      ))}
    </g>
  );
};

// 白木の札 (名前の字つき)。#161 用
const NH1Fuda: React.FC<{ x: number; y: number; w?: number; h?: number; text: string; fs?: number }> = ({ x, y, w = 440, h = 200, text, fs = 92 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={20} fill={KRP.ink} opacity={0.18} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={20} fill={NP.wood} stroke={KRP.ink} strokeWidth={8} />
    <rect x={-w / 2} y={-h / 2} width={w} height={30} rx={14} fill={NP.woodMid} opacity={0.6} />
    <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7}>
      <path d={`M ${-w / 2 + 20} ${-h * 0.2} q ${w * 0.25} -14 ${w * 0.5} 0 q ${w * 0.2} 12 ${w * 0.42} -4`} />
      <path d={`M ${-w / 2 + 16} ${h * 0.28} q ${w * 0.25} 12 ${w * 0.48} 0 q ${w * 0.2} -12 ${w * 0.44} 6`} />
    </g>
    <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={NP.sumi}>{text}</text>
  </g>
);

// 夜空の星
const NH1Stars: React.FC<{ f: number; n?: number; seed: number; yMax?: number }> = ({ f, n = 36, seed, yMax = 420 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={rnd(seed, i) * 1920} cy={20 + rnd(seed + 1, i) * yMax} r={2 + rnd(seed + 2, i) * 2.5}
        fill={KRP.white} opacity={0.35 + 0.45 * (0.5 + 0.5 * Math.sin(f / 7 + i * 1.7))} />
    ))}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #160 第7章、名前は、誰のものか。
// 格: 山 / seed 4160
// 絵: 章扉。夜の劇場街 (芝居小屋の大きな屋根・幟 (のぼり・字は描かない無地の色)・提灯の列・入口に並ぶ人の後ろ姿)。`ChapterDoor` (num=7, title「名前は、誰のものか」)。題字の後ろにクリームの帯
// どこ: 夜の芝居町。左に大きな芝居小屋 (櫓・唐破風・絵看板・提灯の列)、右へ幟と提灯の綱が続く通り
// 演出: 小屋の提灯が左から順に灯り、入口の暖簾がゆれ、客の列 (後ろ姿) が入口へ少しずつ進む。右上に月
// 動き: f0〜42 でカメラがゆっくり引く (1.1→1.0)。提灯 f4〜26 で順に点灯。幟がはためく。題字 f4〜20
const Nm160: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = lerp(1.1, 1.0, easeOut(seg(f, 0, 42)));
  const march = easeOut(seg(f, 0, 42)) * 26;
  const noboriCols = [C.noboriRed, C.noboriIndigo, C.noboriYellow, C.noboriGreen, C.noboriWhite];
  const nobori = (x: number, top: number, len: number, w: number, col: string, i: number) => {
    const wv = Math.sin(f / 7 + i * 1.3) * 8;
    return (
      <g key={`nb${i}`}>
        <line x1={x} y1={top - 20} x2={x} y2={top + len + 260} stroke={C.facadeDark} strokeWidth={7} />
        <line x1={x} y1={top} x2={x + w + 10} y2={top} stroke={C.facadeDark} strokeWidth={6} />
        <path d={`M ${x + 4} ${top} L ${x + w} ${top} Q ${x + w + wv} ${top + len * 0.5} ${x + w + wv * 0.6} ${top + len} L ${x + 4} ${top + len} Z`}
          fill={col} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${x + 4} ${top + 14} L ${x + w} ${top + 14}`} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
        {/* 縫い目の乳 (ち) */}
        {Array.from({ length: Math.floor(len / 60) }, (_, k) => (
          <circle key={k} cx={x + 2} cy={top + 30 + k * 60} r={4} fill={KRP.ink} opacity={0.6} />
        ))}
      </g>
    );
  };
  return (
    <Frame f={f} seed={4160} dark bg={C.night}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={7} title="名前は、誰のものか" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(${480 * (1 - cam)} ${560 * (1 - cam)}) scale(${cam})`}>
        {/* 夜空 */}
        <rect x={-100} y={-100} width={2120} height={1280} fill={C.night} />
        <rect x={-100} y={440} width={2120} height={420} fill={C.nightLow} opacity={0.7} />
        <NH1Stars f={f} seed={4160} />
        <circle cx={1720} cy={150} r={110} fill={C.moon} opacity={0.12} />
        <circle cx={1720} cy={150} r={62} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1700} cy={138} r={10} fill="#E6D39C" /><circle cx={1738} cy={168} r={7} fill="#E6D39C" />
        {/* 遠くの町並み (屋根の影) */}
        <path d="M 900 560 L 960 520 L 1060 520 L 1110 560 L 1160 500 L 1300 500 L 1350 560 L 1420 530 L 1560 530 L 1600 560 L 1660 510 L 1800 510 L 1850 560 L 2020 560 L 2020 900 L 900 900 Z"
          fill={C.nightFar} stroke={KRP.ink} strokeWidth={3} />
        {[1000, 1220, 1480, 1720].map((wx, i) => (
          <rect key={wx} x={wx} y={580} width={40} height={30} rx={4} fill={C.warm} opacity={0.35 + 0.25 * Math.sin(f / 10 + i)} />
        ))}
        {/* 通りの奥へ続く幟 */}
        {[0, 1, 2, 3, 4].map((i) => nobori(1040 + i * 150, 250 + i * 16, 250 - i * 30, 52 - i * 5, noboriCols[i], i + 3))}
        {/* 通りを渡る提灯の綱 */}
        <path d="M 940 330 Q 1420 400 1920 300" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {[1060, 1200, 1340, 1480, 1620, 1760].map((lx, i) => {
          const ly = 330 + (lx - 940) * 0.04 + Math.sin(((lx - 940) / 980) * Math.PI) * 52 - 8;
          return <NH1Chochin key={lx} x={lx} y={ly + 40} s={0.7} lit={seg(f, 14 + i * 2, 18 + i * 2)} f={f} phase={i} />;
        })}
        {/* ===== 芝居小屋 ===== */}
        {/* 櫓 (やぐら) */}
        <g>
          <rect x={470} y={150} width={140} height={100} fill={C.facade} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <rect key={k} x={470 + k * 20} y={150} width={20} height={100} fill={k % 2 ? C.noboriWhite : C.noboriIndigo} opacity={0.85} />
          ))}
          <rect x={470} y={150} width={140} height={100} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 446 156 L 540 110 L 634 156 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
          {/* 梵天 (白い房) */}
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${540 + sd * 56} 100) rotate(${Math.sin(f / 9 + sd) * 4})`}>
              <line x1={0} y1={0} x2={0} y2={-46} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={0} cy={-54} rx={14} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 大屋根 (瓦) */}
        <path d="M 70 410 L 1010 410 L 870 240 L 210 240 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 22 }, (_, k) => {
          const u = k / 21;
          return <line key={k} x1={lerp(210, 870, u)} y1={244} x2={lerp(70, 1010, u)} y2={406} stroke={C.roofLine} strokeWidth={3} />;
        })}
        {[290, 350].map((yy) => (
          <line key={yy} x1={lerp(210, 70, (yy - 240) / 170)} y1={yy} x2={lerp(870, 1010, (yy - 240) / 170)} y2={yy} stroke={C.roofDark} strokeWidth={4} />
        ))}
        <rect x={190} y={228} width={700} height={18} rx={8} fill={C.roofDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 正面の壁 */}
        <rect x={120} y={410} width={840} height={420} fill={C.facade} stroke={KRP.ink} strokeWidth={6} />
        <rect x={120} y={410} width={840} height={30} fill={C.facadeDark} />
        {/* 絵看板 (字なし。色の面だけ) */}
        {[160, 340, 740].map((bx, i) => (
          <g key={bx}>
            <rect x={bx} y={470} width={i === 2 ? 180 : 160} height={150} rx={4} fill={C.noboriWhite} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={bx + 55} cy={520} r={20} fill={[C.noboriRed, C.noboriIndigo, C.noboriGreen][i]} opacity={0.85} />
            <path d={`M ${bx + 30} 600 Q ${bx + 60} 540 ${bx + 90} 600 Z`} fill={[C.noboriIndigo, C.noboriRed, C.noboriYellow][i]} opacity={0.85} />
            <path d={`M ${bx + 100} 500 q 20 20 0 40 q -20 20 0 40`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />
            <rect x={bx} y={470} width={i === 2 ? 180 : 160} height={18} fill={C.facadeDark} />
          </g>
        ))}
        {/* 格子 */}
        {Array.from({ length: 14 }, (_, k) => (
          <line key={k} x1={150 + k * 20} y1={650} x2={150 + k * 20} y2={820} stroke={C.lattice} strokeWidth={5} />
        ))}
        {Array.from({ length: 14 }, (_, k) => (
          <line key={k} x1={670 + k * 20} y1={650} x2={670 + k * 20} y2={820} stroke={C.lattice} strokeWidth={5} />
        ))}
        {/* 唐破風の入口 */}
        <path d="M 400 470 Q 420 420 470 420 Q 540 360 610 420 Q 660 420 680 470 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
        <rect x={430} y={560} width={220} height={270} fill={C.warm} stroke={KRP.ink} strokeWidth={6} />
        <rect x={450} y={580} width={180} height={250} fill={C.warmCore} opacity={0.6} />
        {/* 暖簾 (無地。裾がゆれる) */}
        {[0, 1, 2].map((k) => {
          const wv = Math.sin(f / 8 + k) * 6;
          return (
            <path key={k} d={`M ${436 + k * 70} 560 L ${500 + k * 70} 560 L ${500 + k * 70 + wv} 650 L ${436 + k * 70 + wv} 650 Z`}
              fill={C.noboriIndigo} stroke={KRP.ink} strokeWidth={4} />
          );
        })}
        <ellipse cx={540} cy={900} rx={330} ry={70} fill={C.warm} opacity={0.22} />
        {/* 軒の提灯の列 (左から順に灯る) */}
        <line x1={130} y1={426} x2={950} y2={426} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => (
          <NH1Chochin key={i} x={170 + i * 70} y={462} s={0.72} lit={seg(f, 4 + i * 1.8, 7 + i * 1.8)} f={f} phase={i} />
        ))}
        {/* 手前の大きな幟 */}
        {nobori(60, 300, 380, 58, C.noboriRed, 0)}
        {nobori(980, 360, 300, 50, C.noboriYellow, 1)}
        {/* 石畳 */}
        <rect x={-100} y={828} width={2120} height={360} fill={C.street} />
        {Array.from({ length: 7 }, (_, k) => (
          <line key={k} x1={-100} y1={850 + k * 38} x2={2020} y2={850 + k * 38} stroke={C.streetLine} strokeWidth={3} />
        ))}
        <ellipse cx={540} cy={860} rx={260} ry={34} fill={C.warm} opacity={0.25} />
        {/* 入口に並ぶ客 (後ろ姿・少しずつ進む) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const cols = [C.noboriIndigo, "#7A5A8E", C.noboriGreen, "#8E5A3A", C.narr, "#9E4A4A", "#5A6E7A"];
          const hairs = [KRP.ink, "#4A3A2E", KRP.ink, C.hairGray, KRP.ink, "#5A4030", KRP.ink];
          return (
            <NH1Back key={i} x={560 + i * 96 - march * (i === 0 ? 0.4 : 1)} y={880 + (i % 2) * 6} s={0.42} f={f} phase={i}
              cloth={cols[i]} hair={hairs[i]} lean={-2} />
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #161 名前には、もうひとつ、不思議な性質があります。
// 格: 並 / seed 4161
// 絵: からくりの作業台の上の名札 (自作の白木の札でよい) が、f でゆっくり重くなって台の秤の針が動く。名札のまわりに金の粒がひとつ、ふたつ浮かぶ
// どこ: からくり職人の作業場。板壁に工具掛け・吊りランプ。作業台の上に真鍮の台秤
// 演出: 台秤の皿に立てた白木の名札が、だんだん重くなって皿が沈み、文字盤の針が右へ振れる。
//       名札のまわりに金の粒がひとつ、ふたつと浮かぶ。右の現代の人が身を乗り出して目を丸くする
// 動き: 針 f4〜40 (ゆっくり・最後に小さく揺れて止まる)。金の粒 f12・f24 から。カメラは秤へ少し寄る
const Nm161: React.FC<{ f: number }> = ({ f }) => {
  const w = easeInOut(seg(f, 4, 40));
  const wob = Math.sin(f / 3) * 3 * seg(f, 34, 42) * (1 - 0.5 * seg(f, 38, 42));
  const needle = lerp(-62, 38, w) + wob;
  const sink = 16 * w;
  const cam = lerp(1.0, 1.07, easeOut(seg(f, 0, 42)));
  const DX = 860; // 秤の中心
  const grains = [
    { a: 12, x: DX - 260, y: 300 }, { a: 24, x: DX + 250, y: 260 }, { a: 33, x: DX - 190, y: 210 },
  ];
  return (
    <Frame f={f} seed={4161}>
      <g transform={`translate(${DX * (1 - cam)} ${480 * (1 - cam)}) scale(${cam})`}>
        {/* 板壁 */}
        <rect x={-40} y={-40} width={2000} height={760} fill={C.wallShop} />
        {Array.from({ length: 13 }, (_, k) => (
          <line key={k} x1={k * 160} y1={-40} x2={k * 160} y2={700} stroke={C.wallShopDark} strokeWidth={5} />
        ))}
        {/* 工具掛け (左) */}
        <rect x={60} y={120} width={330} height={360} rx={10} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={95 + c * 65} cy={150 + r * 60} r={5} fill={KRP.ink} opacity={0.5} />
        )))}
        <g transform={`rotate(${Math.sin(f / 16) * 2} 140 150)`}>
          <rect x={132} y={150} width={16} height={170} rx={6} fill={C.desk} stroke={KRP.ink} strokeWidth={4} />
          <rect x={100} y={140} width={80} height={36} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g>
          <path d="M 230 160 L 300 160 L 300 360 L 230 340 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, k) => <line key={k} x1={230} y1={180 + k * 18} x2={222} y2={186 + k * 18} stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={290} y={150} width={40} height={60} rx={10} fill={C.noboriRed} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g>
          <path d="M 330 300 L 350 420 M 370 300 L 350 420" stroke={KRP.grayDark} strokeWidth={10} strokeLinecap="round" />
          <circle cx={350} cy={410} r={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={322} y={286} width={18} height={30} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <rect x={362} y={286} width={18} height={30} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 棚の歯車 (右上) */}
        <rect x={1260} y={170} width={560} height={20} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
        {[[1340, 120, 46], [1450, 135, 32], [1560, 115, 52]].map(([gx, gy, gr], i) => (
          <g key={i} transform={`rotate(${(i % 2 ? -1 : 1) * f * 1.5} ${gx} ${gy})`}>
            {Array.from({ length: 10 }, (_, k) => (
              <rect key={k} x={gx - 7} y={gy - gr - 10} width={14} height={18} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3}
                transform={`rotate(${k * 36} ${gx} ${gy})`} />
            ))}
            <circle cx={gx} cy={gy} r={gr} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={gx} cy={gy} r={gr * 0.3} fill={C.deskDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={1660} y={100} width={70} height={70} rx={8} fill={C.noboriGreen} stroke={KRP.ink} strokeWidth={4} />
        {/* 吊りランプと光 */}
        <line x1={DX} y1={-40} x2={DX} y2={40} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${DX - 70} 90 L ${DX + 70} 90 L ${DX + 40} 40 L ${DX - 40} 40 Z`} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${DX - 70} 90 L ${DX - 360} 680 L ${DX + 360} 680 L ${DX + 70} 90 Z`} fill={NP.glow} opacity={0.14 + 0.03 * Math.sin(f / 5)} />
        {/* 人 (秤の向こうから身を乗り出す) */}
        <Person x={1500} y={735} s={1.05} f={f} cloth={C.narr} clothDark={C.narrDark} face={w > 0.45 ? "surprised" : "normal"}
          gaze={[-7, 3]} lean={lerp(0, -10, easeOut(seg(f, 18, 34)))} pose="stand" />
        {/* 作業台 */}
        <rect x={-40} y={660} width={2000} height={460} fill={C.desk} />
        <rect x={-40} y={660} width={2000} height={26} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.deskDark} strokeWidth={4} opacity={0.5} fill="none">
          {[740, 820, 900, 980].map((yy, k) => (
            <path key={yy} d={`M -40 ${yy} q 500 ${rnd(4161, k) * 30 - 15} 1000 0 q 500 ${rnd(4162, k) * 30 - 15} 1000 0`} />
          ))}
        </g>
        {/* 台の上の小物: 油差し・ねじ回し・帳面 */}
        <g>
          <path d="M 250 690 L 330 690 L 316 620 L 264 620 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 300 626 L 360 560" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <rect x={1250} y={700} width={220} height={30} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(-6 1360 715)" />
          <rect x={1170} y={704} width={90} height={22} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} transform="rotate(-6 1360 715)" />
          <rect x={1580} y={690} width={240} height={150} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(4 1700 765)" />
          {[720, 750, 780, 810].map((yy) => (
            <path key={yy} d={`M 1610 ${yy} q 40 -8 80 0 t 80 0 t 40 0`} stroke={KRP.grayDark} strokeWidth={3} fill="none" transform="rotate(4 1700 765)" />
          ))}
        </g>
        {/* ===== 台秤 ===== */}
        <g>
          {/* 本体 */}
          <rect x={DX - 330 + 10} y={480 + 12} width={660} height={220} rx={20} fill={KRP.ink} opacity={0.2} />
          <rect x={DX - 330} y={480} width={660} height={210} rx={20} fill={NP.brass} stroke={KRP.ink} strokeWidth={7} />
          <rect x={DX - 300} y={500} width={600} height={20} rx={8} fill={NP.brassDark} opacity={0.6} />
          {[-300, 300].map((sx) => <circle key={sx} cx={DX + sx * 0.97} cy={660} r={10} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />)}
          {/* 文字盤 */}
          <circle cx={DX} cy={600} r={88} fill={C.dial} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 11 }, (_, k) => {
            const a = ((-70 + k * 14) * Math.PI) / 180;
            const big = k % 5 === 0;
            return (
              <line key={k} x1={DX + Math.sin(a) * 70} y1={600 - Math.cos(a) * 70} x2={DX + Math.sin(a) * (big ? 52 : 60)} y2={600 - Math.cos(a) * (big ? 52 : 60)}
                stroke={k >= 8 ? KRP.red : KRP.ink} strokeWidth={big ? 5 : 3} />
            );
          })}
          <g transform={`rotate(${needle} ${DX} 600)`}>
            <path d={`M ${DX - 6} 610 L ${DX} 528 L ${DX + 6} 610 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <circle cx={DX} cy={600} r={11} fill={KRP.ink} />
          {/* 皿 (沈む) */}
          <g transform={`translate(0 ${sink})`}>
            <rect x={DX - 30} y={450} width={60} height={40} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={DX - 300} y={432} width={600} height={26} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
            {/* 名札 (立てて置く) */}
            <g transform={`rotate(${Math.sin(f / 14) * 0.8} ${DX} 430)`}>
              <circle cx={DX} cy={322} r={260} fill={NP.glow} opacity={0.12 + 0.22 * w} />
              <NH1Fuda x={DX} y={322} text="山田 花子" />
              {/* 支え */}
              <path d={`M ${DX - 180} 430 L ${DX - 150} 400 L ${DX - 120} 430 Z M ${DX + 120} 430 L ${DX + 150} 400 L ${DX + 180} 430 Z`}
                fill={NP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
          {/* ずしっと沈む線 */}
          {w > 0.2 && [-1, 1].map((sd) => (
            <g key={sd} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6 * Math.sin(w * Math.PI)}>
              <line x1={DX + sd * 330} y1={440} x2={DX + sd * 370} y2={452} />
              <line x1={DX + sd * 330} y1={468} x2={DX + sd * 372} y2={472} />
            </g>
          ))}
        </g>
        {/* 金の粒 (ひとつ、ふたつ…ゆっくり浮かぶ) */}
        {grains.map((g, i) => {
          const t = seg(f, g.a, g.a + 14);
          if (t <= 0) return null;
          const yy = g.y - 40 * easeOut(seg(f, g.a, g.a + 40)) + Math.sin(f / 8 + i) * 5;
          const r = 16 * pop(t);
          return (
            <g key={i} transform={`translate(${g.x} ${yy})`}>
              <circle r={r * 2.2} fill={NP.glow} opacity={0.3} />
              <circle r={r} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.3} fill={KRP.white} opacity={0.8} />
              <path d={`M ${r * 1.4} ${-r * 1.4} l 0 -14 M ${r * 1.4 - 7} ${-r * 1.4 - 7} l 14 0`} stroke={NP.glowCore} strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #162 使えば使うほど、値打ちが貯まっていくのです。
// 格: 図 / seed 4162
// 絵: 名札の形をした**貯金箱**のからくり。名前が呼ばれるたび (吹き出しが飛んでくる) に、上の口から金の玉が1つずつ入り、横の目盛りが上がっていく (f)。木と真鍮の箱
// どこ: 商家の帳場。後ろは引き出しだらけの箪笥の壁、手前は帳場の台 (そろばん・大福帳)
// 演出: 台の上に名札の形をした木と真鍮の貯金箱。左右から「花子さん」の吹き出しが飛んできて、
//       上の口に吸い込まれると金の玉になって落ち、窓の中の玉が1つ増え、横の目盛りが上がる
// 動き: 吹き出し4つ (f2/12/22/32 発 → 7コマで口へ)。玉は f+10 で窓に増える。カメラはゆっくり寄る
const Nm162: React.FC<{ f: number }> = ({ f }) => {
  const cam = lerp(1.0, 1.05, easeOut(seg(f, 0, 42)));
  const SX = 880, SY = 318; // 口
  const starts = [0, 9, 18, 27, 38];
  const from: [number, number][] = [[150, 170], [1760, 150], [200, 330], [1720, 300], [160, 120]];
  const added = starts.filter((a) => f >= a + 14).length;
  const base = 15;
  const count = base + added;
  const levelT = (base + starts.reduce((s, a) => s + easeOut(seg(f, a + 12, a + 16)), 0)) / 24;
  const ballPos = (i: number): [number, number] => {
    const row = Math.floor(i / 8), col = i % 8;
    return [628 + col * 42 + (row % 2) * 10, 688 - row * 38];
  };
  return (
    <Frame f={f} seed={4162}>
      <g transform={`translate(${SX * (1 - cam)} ${520 * (1 - cam)}) scale(${cam})`}>
        {/* 箪笥の壁 */}
        <rect x={-40} y={-40} width={2000} height={820} fill={C.plankDark} />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
          const x = -10 + c * 220, y = 10 + r * 150;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={206} height={136} rx={6} fill={C.plank} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${x + 20} ${y + 40} q 80 -10 160 0`} stroke={C.plankDark} strokeWidth={3} fill="none" opacity={0.5} />
              <path d={`M ${x + 78} ${y + 70} q 25 22 50 0`} stroke={KRP.ink} strokeWidth={6} fill="none" />
              <rect x={x + 92} y={y + 60} width={22} height={14} rx={3} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        }))}
        {/* 帳場の台 */}
        <rect x={-40} y={750} width={2000} height={400} fill={C.deskDark} />
        <rect x={-40} y={750} width={2000} height={24} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {[820, 900, 980].map((yy, k) => (
          <path key={yy} d={`M -40 ${yy} q 500 ${rnd(4162, k) * 24 - 12} 1000 0 q 500 ${rnd(4163, k) * 24 - 12} 1000 0`} stroke={C.board} strokeWidth={4} fill="none" opacity={0.5} />
        ))}
        {/* そろばん */}
        <g transform="rotate(-4 290 700)">
          <rect x={110} y={640} width={360} height={120} rx={8} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
          <rect x={126} y={672} width={328} height={8} fill={C.plank} />
          {Array.from({ length: 9 }, (_, k) => (
            <g key={k}>
              <line x1={146 + k * 36} y1={650} x2={146 + k * 36} y2={750} stroke={C.plank} strokeWidth={3} />
              <ellipse cx={146 + k * 36} cy={661} rx={14} ry={8} fill={C.plankDark} stroke={KRP.ink} strokeWidth={2.5} />
              {[0, 1, 2, 3].map((b) => (
                <ellipse key={b} cx={146 + k * 36} cy={(k === added + 2 ? 696 : 704) + b * 14} rx={14} ry={7} fill={C.plankDark} stroke={KRP.ink} strokeWidth={2.5} />
              ))}
            </g>
          ))}
        </g>
        {/* 大福帳 */}
        <g transform={`rotate(${3 + Math.sin(f / 18)} 1460 660)`}>
          <rect x={1360} y={520} width={200} height={240} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1360} y={520} width={200} height={30} fill={C.noboriIndigo} stroke={KRP.ink} strokeWidth={4} />
          {[590, 630, 670, 710].map((yy) => (
            <path key={yy} d={`M 1390 ${yy} q 30 -6 60 0 t 60 0 t 30 0`} stroke={KRP.grayDark} strokeWidth={3} fill="none" />
          ))}
          <line x1={1360} y1={540} x2={1560} y2={540} stroke={KRP.ink} strokeWidth={2} />
        </g>
        {/* ===== 名札の形の貯金箱 ===== */}
        <g>
          {/* 影 */}
          <ellipse cx={900} cy={756} rx={380} ry={22} fill={KRP.ink} opacity={0.22} />
          {/* 右の側面 */}
          <path d="M 1220 360 L 1262 318 L 1262 712 L 1220 754 Z" fill={NP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {/* 上面 */}
          <path d="M 560 360 L 1220 360 L 1262 318 L 602 318 Z" fill={NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
          {/* 口 (真鍮) */}
          <rect x={SX - 80} y={SY - 14} width={160} height={28} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} transform={`skewX(-40) translate(${SY * 0.84} 0)`} />
          <rect x={SX - 60} y={SY - 6} width={120} height={12} rx={5} fill={KRP.ink} transform={`skewX(-40) translate(${SY * 0.84} 0)`} />
          {/* 正面 (名札) */}
          <rect x={560} y={360} width={660} height={394} rx={30} fill={NP.wood} stroke={KRP.ink} strokeWidth={8} />
          <rect x={560} y={360} width={660} height={36} rx={18} fill={NP.woodMid} opacity={0.55} />
          <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7}>
            <path d="M 590 440 q 150 -14 300 0 q 150 14 300 -4" />
            <path d="M 990 600 q 60 10 120 0" />
          </g>
          <text x={780} y={432} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={NP.sumi}>山田 花子</text>
          {/* 四隅の真鍮金具 */}
          {[[580, 380], [1200, 380], [580, 734], [1200, 734]].map(([cx, cy], i) => (
            <path key={i} d={`M ${cx} ${cy} l ${i % 2 ? -36 : 36} 0 l ${i % 2 ? 36 : -36} ${i < 2 ? 36 : -36} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 窓 (中の玉が見える) */}
          <rect x={604} y={456} width={366} height={260} rx={16} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={616} y={468} width={342} height={236} rx={10} fill={C.glass} />
          {Array.from({ length: count }, (_, i) => {
            const [bx, by] = ballPos(i);
            const newA = starts[i - base];
            const sc = i >= base ? pop(seg(f, newA + 13, newA + 17)) : 1;
            return (
              <g key={i} transform={`translate(${bx} ${by}) scale(${sc})`}>
                <circle r={19} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={-6} cy={-6} r={5} fill={KRP.white} opacity={0.8} />
              </g>
            );
          })}
          <path d="M 630 480 L 700 480 L 640 560 Z" fill={KRP.white} opacity={0.35} />
          {/* 目盛り (値打ち) */}
          <TagPlate x={1100} y={420} text="値打ち" size={30} />
          <rect x={1072} y={462} width={56} height={256} rx={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1080} y={470 + 240 * (1 - levelT)} width={40} height={240 * levelT} rx={20} fill={C.gold} />
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={1032} y1={490 + k * 26} x2={k % 2 ? 1052 : 1062} y2={490 + k * 26} stroke={KRP.ink} strokeWidth={k % 2 ? 3 : 5} />
          ))}
          <g transform={`translate(1170 ${470 + 240 * (1 - levelT)})`}>
            <path d="M -30 0 L 0 -16 L 0 16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 吹き出し → 金の玉 */}
        {starts.map((a, i) => {
          const t = clamp01((f - a) / 11);
          if (f < a) return null;
          const [fx, fy] = from[i];
          if (t < 1) {
            const u = easeInOut(t);
            const bx = lerp(fx, SX, u);
            const by = lerp(fy, SY - 60, u) - Math.sin(u * Math.PI) * 90;
            const sc = lerp(1, 0.25, u * u) * pop(seg(f, a, a + 3));
            const flip = fx > SX ? -1 : 1;
            return (
              <g key={i} transform={`translate(${bx} ${by}) scale(${sc})`}>
                <path d={`M ${-30 * flip} 30 L ${-80 * flip} 72 L ${10 * flip} 36 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-120} y={-44} width={240} height={84} rx={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
                <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>花子さん</text>
              </g>
            );
          }
          // 玉が口へ落ちる + チャリンの光
          const d = seg(f, a + 11, a + 14);
          const sp = seg(f, a + 12, a + 20);
          return (
            <g key={i}>
              {d < 1 && (
                <g transform={`translate(${SX} ${SY - 60 + 60 * d * d})`}>
                  <circle r={20} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
                </g>
              )}
              {sp > 0 && sp < 1 && (
                <g stroke={NP.glow} strokeWidth={7} strokeLinecap="round" opacity={1 - sp}>
                  {Array.from({ length: 8 }, (_, k) => {
                    const ang = (k / 8) * Math.PI * 2;
                    return <line key={k} x1={SX + Math.cos(ang) * (30 + sp * 30)} y1={SY - 30 + Math.sin(ang) * (20 + sp * 20)}
                      x2={SX + Math.cos(ang) * (50 + sp * 50)} y2={SY - 30 + Math.sin(ang) * (34 + sp * 34)} />;
                  })}
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
// #163 歌舞伎の世界では、大きな名前は「名跡」と呼ばれ、親から子へ、師匠から弟子へ受け継がれます。
// 格: 山 / seed 4163
// 絵: 歌舞伎の舞台 (定式幕 (黒・柿・萌葱の縦じま)・花道・提灯・客席の後ろ姿)。舞台の上に大きな**名跡の札** (金の縁の札・字は描かず光る) が掲げられ、年配の役者の後ろ姿から若い役者の後ろ姿へ、札が f で手渡される
// どこ: 歌舞伎の舞台を客席の後ろから。上に一文字幕と提灯、左右に寄せた定式幕 (黒・柿・萌葱)、奥は松の羽目板、左下へ花道
// 演出: 舞台の真ん中で、裃の年配の役者 (白髪・後ろ姿) が掲げた金の縁の名跡の札が、光の弧を描いて
//       若い役者 (黒髪・後ろ姿) の上へ渡る。若い役者が両手で受け、スポットが若い方へ移る。客席の頭がわずかにゆれる
// 動き: 札の受け渡し f8〜34 (弧)。年配は前半バンザイ→後半おろす、若い方は後半バンザイ。カメラ f0〜42 でゆっくり寄る
const Nm163: React.FC<{ f: number }> = ({ f }) => {
  const cam = lerp(1.0, 1.08, easeOut(seg(f, 0, 42)));
  const pass = easeInOut(seg(f, 8, 34));
  const EX = 700, YX = 1220;
  const px = lerp(EX, YX, pass);
  const py = 420 - Math.sin(pass * Math.PI) * 180;
  const spot = easeOut(seg(f, 22, 40));
  const stripe = (x0: number, w0: number, bot: (x: number) => number, key: string) => {
    const cols = [C.jBlack, C.kaki, C.moegi];
    const n = 9;
    const sw = w0 / n;
    return (
      <g key={key}>
        {Array.from({ length: n }, (_, k) => {
          const x = x0 + k * sw;
          return <path key={k} d={`M ${x} 60 L ${x + sw} 60 L ${x + sw} ${bot(x + sw)} Q ${x + sw / 2} ${bot(x + sw / 2) + 14} ${x} ${bot(x)} Z`}
            fill={cols[k % 3]} stroke={KRP.ink} strokeWidth={3} />;
        })}
      </g>
    );
  };
  return (
    <Frame f={f} seed={4163} bg={C.jBlack}>
      <g transform={`translate(${960 * (1 - cam)} ${420 * (1 - cam)}) scale(${cam})`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.jBlack} />
        {/* 奥の松羽目 */}
        <rect x={180} y={80} width={1560} height={560} fill={C.pineGround} stroke={KRP.ink} strokeWidth={6} />
        {[480, 780, 1080, 1380].map((x) => <line key={x} x1={x} y1={80} x2={x} y2={640} stroke={C.byobuDark} strokeWidth={4} opacity={0.6} />)}
        <g>
          <path d="M 940 640 Q 900 520 960 430 Q 1010 360 980 260" stroke={C.trunk} strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d="M 940 640 Q 900 520 960 430 Q 1010 360 980 260" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />
          {[[760, 250, 220], [1180, 220, 240], [980, 160, 200], [640, 380, 160], [1300, 380, 170]].map(([cx, cy, rw], i) => (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={rw} ry={58} fill={C.pine} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${cx - rw * 0.7} ${cy} q ${rw * 0.35} -24 ${rw * 0.7} 0 q ${rw * 0.35} -24 ${rw * 0.7} 0`} stroke={C.pineDark} strokeWidth={5} fill="none" />
            </g>
          ))}
        </g>
        {/* 舞台の床 */}
        <path d="M 120 640 L 1800 640 L 1960 880 L -40 880 Z" fill={C.stage} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 15 }, (_, k) => {
          const u = k / 14;
          return <line key={k} x1={lerp(120, 1800, u)} y1={640} x2={lerp(-40, 1960, u)} y2={880} stroke={C.stageLine} strokeWidth={3} />;
        })}
        {/* スポットライト */}
        <ellipse cx={lerp(EX, YX, spot)} cy={770} rx={210} ry={46} fill={NP.glowCore} opacity={0.5} />
        <path d={`M ${lerp(EX, YX, spot) - 60} -40 L ${lerp(EX, YX, spot) - 210} 770 L ${lerp(EX, YX, spot) + 210} 770 L ${lerp(EX, YX, spot) + 60} -40 Z`} fill={NP.glowCore} opacity={0.13} />
        {/* 花道 (左下へ) */}
        <path d="M 300 880 L 500 880 L 300 1100 L 60 1100 Z" fill={C.stage} stroke={KRP.ink} strokeWidth={6} />
        <line x1={400} y1={880} x2={180} y2={1100} stroke={C.stageLine} strokeWidth={3} />
        <rect x={-60} y={880} width={2040} height={30} fill={C.stageDark} />
        {/* 名跡の札 */}
        <NH1Kinfuda x={px} y={py} w={360} h={190} glow={0.6 + 0.4 * Math.sin(pass * Math.PI)} f={f} rot={Math.sin(pass * Math.PI) * -4} />
        {/* 役者 (後ろ姿・裃) */}
        <NH1Back x={EX} y={772} s={1.0} f={f} phase={1} cloth={C.kami} hair={C.hairWhite} kami mage lean={pass > 0.55 ? 3 : 0}
          pose={pass < 0.55 ? "banzai" : "stand"} />
        <NH1Back x={YX} y={772} s={1.0} f={f} phase={2} cloth={C.kami} hair={KRP.ink} kami mage
          pose={pass > 0.5 ? "banzai" : "stand"} />
        {/* 光の弧 (札の通り道) */}
        <path d={`M ${EX} 420 Q ${(EX + YX) / 2} 60 ${YX} 420`} stroke={NP.glow} strokeWidth={6} fill="none" strokeDasharray="4 22" strokeLinecap="round"
          opacity={0.8 * Math.sin(pass * Math.PI) + 0.1} />
        {Array.from({ length: 6 }, (_, k) => {
          const u = clamp01(pass - k * 0.06);
          if (u <= 0 || u >= 1) return null;
          return <circle key={k} cx={lerp(EX, YX, u)} cy={420 - Math.sin(u * Math.PI) * 180} r={10 - k} fill={NP.glowCore} opacity={0.8 - k * 0.12} />;
        })}
        <TagPlate x={960} y={714} text="名跡" size={34} t={seg(f, 30, 38)} />
        {/* 一文字幕と提灯 */}
        <rect x={-60} y={-60} width={2040} height={120} fill={C.valance} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -60 60 Q 120 90 300 60 Q 480 90 660 60 Q 840 90 1020 60 Q 1200 90 1380 60 Q 1560 90 1740 60 Q 1920 90 2100 60" fill={C.valance} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <NH1Chochin key={i} x={330 + i * 140} y={130} s={0.62} f={f} phase={i} color={i % 2 ? KRP.white : C.lantern} />
        ))}
        {/* 定式幕 (左右に寄せてある) */}
        {stripe(-60, 300, (x) => 900 - (x + 60) * 0.6, "L")}
        {stripe(1680, 300, (x) => 720 + (x - 1680) * 0.6, "R")}
        <TagPlate x={250} y={270} text="歌舞伎" size={40} />
        {/* 客席 (後ろ姿の頭) */}
        {Array.from({ length: 12 }, (_, i) => (
          <NH1Back key={i} x={560 + i * 128 + (i % 2) * 20} y={1150 + (i % 3) * 14} s={0.62} f={f} phase={i}
            cloth={["#6B4E3E", C.noboriIndigo, "#7A6A5A", C.narr][i % 4]} hair={[KRP.ink, "#4A3A2E", C.hairGray][i % 3]} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <NH1Back key={`b${i}`} x={-20 + i * 120} y={1180 + (i % 2) * 20} s={0.62} f={f} phase={i + 5}
            cloth={["#7A6A5A", C.narr][i % 2]} hair={KRP.ink} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #164 継ぐたびに、十三代目、のように代が数えられます。
// 格: 図 / seed 4164
// 絵: 系図の巻物 (=世界)。初代・二代目・三代目……と札が縦に連なり、f で下へ伸びていき、いちばん下に「十三代目」の札が光る。札の中は代数だけ (役者の名前は書かない)
// どこ: 床の間。土壁・床柱・畳。床の間に大きな系図の掛け軸が下がる。脇に香炉 (煙) と花
// 演出: 掛け軸がするすると下へ開き、初代→二代目→…と木札が縦に連なって線でつながる (3列で折り返す)。
//       いちばん最後に大きな「十三代目」の札が金色に光る
// 動き: 軸が開く f0〜12。札 f8〜35 で順に。十三代目 f34〜40 で光る。カメラは上から引いて全体へ
const Nm164: React.FC<{ f: number }> = ({ f }) => {
  const unroll = easeOut(seg(f, 0, 12));
  const cam = lerp(1.14, 1.0, easeInOut(seg(f, 0, 38)));
  const botY = lerp(130, 820, unroll);
  const names = ["初代", "二代目", "三代目", "四代目", "五代目", "六代目", "七代目", "八代目", "九代目", "十代目", "十一代目", "十二代目"];
  const cols = [600, 960, 1320];
  const rows = [210, 320, 430, 540, 650];
  const pos = (k: number): [number, number] => (k < 10 ? [cols[Math.floor(k / 5)], rows[k % 5]] : [cols[2], rows[k - 10]]);
  const at = (k: number) => 8 + k * 2.2;
  const last = seg(f, 34, 40);
  // 線 (札と札をつなぐ)
  const link = (k: number) => {
    const [x1, y1] = pos(k);
    const [x2, y2] = k + 1 < 12 ? pos(k + 1) : [cols[2], 614];
    const t = seg(f, at(k) + 0.6, at(k + 1));
    const d = x1 === x2 ? `M ${x1} ${y1 + 32} L ${x2} ${y2 - 32}` : `M ${x1} ${y1 + 32} L ${x1} 712 L ${(x1 + x2) / 2} 712 L ${(x1 + x2) / 2} 160 L ${x2} 160 L ${x2} ${y2 - 32}`;
    return <path key={`l${k}`} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} stroke={NP.sumi} strokeWidth={6} fill="none" strokeLinejoin="round" />;
  };
  return (
    <Frame f={f} seed={4164}>
      <g transform={`translate(${960 * (1 - cam)} ${120 * (1 - cam)}) scale(${cam})`}>
        {/* 土壁 */}
        <rect x={-60} y={-60} width={2040} height={1000} fill={C.plaster} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(4164, i) * 1920} cy={rnd(4165, i) * 880} r={3 + rnd(4166, i) * 4} fill={C.plasterDark} opacity={0.7} />
        ))}
        {/* 落とし掛け (上の横木) と床柱 */}
        <rect x={-60} y={-60} width={2040} height={70} fill={C.plank} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 120 10 Q 110 400 130 880 L 200 880 Q 180 400 190 10 Z" fill={C.trunk} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 150 60 q 8 120 0 240 M 165 420 q -6 140 4 300" stroke={C.facadeDark} strokeWidth={4} fill="none" />
        {/* 床板と畳 */}
        <rect x={-60} y={860} width={2040} height={60} fill={C.plank} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={920} width={2040} height={200} fill={C.tatami} />
        {Array.from({ length: 30 }, (_, k) => <line key={k} x1={-60 + k * 70} y1={920} x2={-60 + k * 70} y2={1100} stroke={C.tatamiDark} strokeWidth={2} />)}
        <rect x={-60} y={920} width={2040} height={14} fill={C.noboriGreen} />
        {/* 花 (左) */}
        <g>
          <path d="M 300 860 L 290 790 Q 320 770 350 790 L 340 860 Z" fill={C.noboriIndigo} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 320 785 Q 300 700 270 640 M 320 785 Q 340 690 380 650" stroke={C.pineDark} strokeWidth={6} fill="none" />
          <circle cx={268} cy={636} r={18} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={382} cy={646} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 香炉と煙 (右) */}
        <g>
          <ellipse cx={1700} cy={850} rx={60} ry={16} fill={KRP.ink} opacity={0.2} />
          <path d="M 1650 800 Q 1650 852 1700 852 Q 1750 852 1750 800 Z" fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1700} cy={800} rx={50} ry={12} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 1700 792 q ${-20 + Math.sin(f / 6) * 10} -50 0 -100 q ${20 + Math.sin(f / 7) * 12} -50 0 -100 q -16 -40 6 -80`}
            stroke={KRP.grayDark} strokeWidth={5} fill="none" opacity={0.5} strokeLinecap="round" />
        </g>
        {/* ===== 掛け軸 ===== */}
        <line x1={960} y1={10} x2={960} y2={-20} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 820 76 L 960 24 L 1100 76" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {/* 表装 (外の布) */}
        <rect x={390} y={80} width={1140} height={botY - 80} fill={C.brocade} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: Math.floor((botY - 100) / 60) }, (_, k) => (
          <g key={k} opacity={0.5}>
            <circle cx={415} cy={110 + k * 60} r={7} fill={C.brocadeLight} />
            <circle cx={1505} cy={110 + k * 60} r={7} fill={C.brocadeLight} />
          </g>
        ))}
        {/* 本紙 */}
        <rect x={440} y={100} width={1040} height={Math.max(0, botY - 120)} fill={C.scroll} stroke={KRP.ink} strokeWidth={4} />
        <TagPlate x={600} y={134} text="系図" size={30} t={seg(f, 4, 10)} />
        {Array.from({ length: 12 }, (_, k) => (pos(k)[1] < botY - 40 ? link(k) : null))}
        {names.map((nm, k) => {
          const [x, y] = pos(k);
          if (y > botY - 40) return null;
          const t = pop(seg(f, at(k), at(k) + 3));
          if (t <= 0) return null;
          return (
            <g key={k} transform={`translate(${x} ${y}) scale(${t})`}>
              <rect x={-118} y={-28} width={240} height={64} rx={8} fill={KRP.ink} opacity={0.16} />
              <rect x={-120} y={-32} width={240} height={64} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
              <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={nm.length > 3 ? 32 : 36} fill={NP.sumi}>{nm}</text>
            </g>
          );
        })}
        {/* 十三代目 (光る) */}
        {last > 0 && (
          <g transform={`translate(${cols[2]} 640) scale(${pop(last)})`}>
            <circle r={200} fill={NP.glow} opacity={0.3 + 0.08 * Math.sin(f / 4)} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 + f / 50;
              return <line key={i} x1={Math.cos(a) * 160} y1={Math.sin(a) * 90} x2={Math.cos(a) * 220} y2={Math.sin(a) * 125} stroke={NP.glow} strokeWidth={8} strokeLinecap="round" />;
            })}
            <rect x={-166} y={-52} width={340} height={112} rx={12} fill={KRP.ink} opacity={0.2} />
            <rect x={-170} y={-58} width={340} height={112} rx={12} fill={C.gold} stroke={KRP.ink} strokeWidth={7} />
            <rect x={-154} y={-42} width={308} height={80} rx={6} fill={NP.glowCore} stroke={C.goldDark} strokeWidth={4} />
            <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={NP.sumi}>十三代目</text>
          </g>
        )}
        {/* 軸棒 (下へ動く) */}
        <rect x={380} y={70} width={1160} height={22} rx={10} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        <rect x={370} y={botY - 6} width={1180} height={26} rx={12} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        <rect x={340} y={botY - 12} width={40} height={38} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1540} y={botY - 12} width={40} height={38} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #165 名前が、人から人へ、引っ越していくのです。
// 格: 並 / seed 4165
// 絵: 名跡の札が小さなかばんを持って、人から人へと歩いていく (#46 の「旅をする絵本」と同じトーンの擬人化)。足あとの点線。舞台の袖
// どこ: 歌舞伎の舞台の袖 (楽屋側)。黒い袖幕・吊り綱と砂袋・はしご・板の床。右の奥から舞台の明かりがさす
// 演出: 金の縁の名跡の札に手足が生え、小さなかばんを提げて、左の年配の役者 (手を振る後ろ姿) から
//       右の若い役者 (両手を広げて迎える後ろ姿) へ、てくてく歩いていく。歩いたあとに足あとの点線
// 動き: 札の歩み f0〜40 (足は約10コマで1歩)。カメラは札を追って右へパン。若い役者は f28 から迎える
const NH1Walker: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const step = Math.sin(f / 3.2);
  const bob = -Math.abs(step) * 8;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx={0} cy={-bob + 4} rx={110} ry={14} fill={KRP.ink} opacity={0.25} />
      {/* 脚 */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`rotate(${step * 22 * sd} ${sd * 40} -70)`}>
          <line x1={sd * 40} y1={-70} x2={sd * 40} y2={-12} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <ellipse cx={sd * 40 + 10} cy={-8} rx={22} ry={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* かばんを持つ腕 (右) と振る腕 (左) */}
      <path d={`M -112 -140 Q -150 ${-120 + step * 10} -158 ${-96 + step * 14}`} stroke={KRP.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={-158} cy={-96 + step * 14} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 112 -140 Q 140 -120 146 -96" stroke={KRP.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${-step * 8} 146 -96)`}>
        <path d="M 126 -90 Q 146 -118 166 -90" stroke={C.bagDark} strokeWidth={7} fill="none" />
        <rect x={104} y={-92} width={84} height={64} rx={10} fill={C.bag} stroke={KRP.ink} strokeWidth={5} />
        <rect x={104} y={-92} width={84} height={18} rx={8} fill={C.bagDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={138} y={-80} width={16} height={14} rx={3} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 116 -50 L 176 -50" stroke={C.bagDark} strokeWidth={3} strokeDasharray="6 5" />
      </g>
      {/* 体 = 名跡の札 */}
      <NH1Kinfuda x={0} y={-150} w={230} h={130} glow={0.8} f={f} rot={step * 3} />
      {/* 顔 (札の中の、点の目と口) */}
      <g transform={`rotate(${step * 3} 0 -150)`}>
        <circle cx={-34} cy={-162} r={8} fill={KRP.ink} />
        <circle cx={34} cy={-162} r={8} fill={KRP.ink} />
        <path d="M -16 -136 Q 0 -124 16 -136" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={-54} cy={-140} rx={10} ry={6} fill={KRP.red} opacity={0.35} />
        <ellipse cx={54} cy={-140} rx={10} ry={6} fill={KRP.red} opacity={0.35} />
      </g>
    </g>
  );
};
const Nm165: React.FC<{ f: number }> = ({ f }) => {
  const prog = seg(f, 0, 40);
  const X0 = 500, X1 = 1330;
  const wx = lerp(X0, X1, prog);
  const pan = lerp(70, -70, easeInOut(prog));
  const welcome = seg(f, 28, 34) > 0;
  const prints = Math.floor((wx - X0) / 56);
  return (
    <Frame f={f} seed={4165} bg={C.wing}>
      <g transform={`translate(${pan} 0)`}>
        {/* 奥の壁 */}
        <rect x={-200} y={-60} width={2320} height={860} fill={C.wingLight} />
        {Array.from({ length: 14 }, (_, k) => <line key={k} x1={-200 + k * 170} y1={-60} x2={-200 + k * 170} y2={800} stroke={C.wing} strokeWidth={5} />)}
        {/* 右奥から舞台の明かり */}
        <path d="M 2120 -60 L 1500 -60 L 900 800 L 2120 800 Z" fill={NP.glowCore} opacity={0.16} />
        <rect x={1760} y={-60} width={360} height={860} fill={NP.glow} opacity={0.35} />
        {/* はしご */}
        <g stroke={KRP.ink} strokeWidth={5}>
          <rect x={700} y={60} width={16} height={720} fill={C.plank} />
          <rect x={800} y={60} width={16} height={720} fill={C.plank} />
          {Array.from({ length: 9 }, (_, k) => <rect key={k} x={716} y={100 + k * 76} width={84} height={12} fill={C.plank} />)}
        </g>
        {/* 吊り綱と砂袋 */}
        {[1000, 1080, 1160].map((rx, i) => {
          const sw = Math.sin(f / 18 + i) * 4;
          return (
            <g key={rx} transform={`rotate(${sw} ${rx} -60)`}>
              <line x1={rx} y1={-60} x2={rx} y2={330 + i * 40} stroke={C.rope} strokeWidth={6} />
              <path d={`M ${rx - 34} ${330 + i * 40} L ${rx + 34} ${330 + i * 40} L ${rx + 40} ${410 + i * 40} Q ${rx} ${426 + i * 40} ${rx - 40} ${410 + i * 40} Z`}
                fill={C.sandbag} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${rx - 14} ${330 + i * 40} L ${rx} ${312 + i * 40} L ${rx + 14} ${330 + i * 40}`} stroke={KRP.ink} strokeWidth={4} fill="none" />
            </g>
          );
        })}
        {/* 黒い袖幕 (左と右) */}
        {[[-200, 340], [1600, 220]].map(([cx, cw], j) => (
          <g key={j}>
            {Array.from({ length: 5 }, (_, k) => {
              const x = cx + (k * cw) / 5;
              const wv = Math.sin(f / 14 + k + j) * 4;
              return <path key={k} d={`M ${x} -60 L ${x + cw / 5} -60 L ${x + cw / 5 + wv} 800 L ${x + wv} 800 Z`} fill={k % 2 ? C.wing : "#2E2B35"} stroke={KRP.ink} strokeWidth={3} />;
            })}
          </g>
        ))}
        {/* 板の床 */}
        <rect x={-200} y={780} width={2320} height={400} fill={C.stageDark} />
        {Array.from({ length: 6 }, (_, k) => <line key={k} x1={-200} y1={800 + k * 50} x2={2120} y2={800 + k * 50} stroke={C.stageLine} strokeWidth={3} />)}
        <rect x={-200} y={776} width={2320} height={10} fill={KRP.ink} opacity={0.4} />
        {/* これから歩く道 (薄い点線) と足あと */}
        <line x1={wx + 60} y1={808} x2={1500} y2={808} stroke={NP.glow} strokeWidth={5} strokeDasharray="6 18" strokeLinecap="round" opacity={0.6} />
        {Array.from({ length: prints }, (_, k) => (
          <ellipse key={k} cx={X0 + 30 + k * 56} cy={k % 2 ? 816 : 798} rx={16} ry={8} fill={NP.glow} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
        ))}
        {/* 年配の役者 (送り出す) と若い役者 (迎える)。どちらも後ろ姿 */}
        <NH1Back x={300} y={800} s={0.95} f={f} phase={1} cloth={C.kami} hair={C.hairWhite} kami mage pose="raise" lean={-4} />
        <NH1Back x={1700} y={800} s={0.95} f={f} phase={2} cloth={C.kami} hair={KRP.ink} kami mage pose={welcome ? "banzai" : "stand"} lean={welcome ? 3 : 0} />
        {/* 名跡の札が歩く */}
        <NH1Walker x={wx} y={800} f={f} s={1.05} />
        <TagPlate x={580} y={170} text="舞台の袖" size={36} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #166 落語家も、師匠から名前をもらい、出世するたびに名前を変える人が多くいます。
// 格: 山 / seed 4166
// 絵: 寄席の高座 (座布団・めくり (演者名を出す台・字は波線)・出囃子の三味線)。同じ1人の噺家が f で前座 (羽織なし) → 二ツ目 (羽織) → 真打 (紋付の黒) と着替わり、めくりの札も3回めくれる。師匠 (年配の噺家) が袖から見守る
// どこ: 寄席の高座を客席から。金屏風・座布団・右にめくり台・右端の御簾の奥で出囃子の三味線・左の袖幕から師匠がのぞく
// 演出: 同じ噺家が煙とともに 前座 (羽織なし・緑) → 二ツ目 (羽織) → 真打 (紋付の黒) と着替わり、
//       そのたびにめくりの紙が1枚めくれ、上の札も変わる。師匠は袖からにこにこ見守る
// 動き: 着替え f14・f28 (煙6〜8コマ)。めくり f14〜19・f28〜33。三味線の音符がゆっくり浮かぶ。カメラはゆっくり寄る
const Nm166: React.FC<{ f: number }> = ({ f }) => {
  const st = f < 14 ? 0 : f < 28 ? 1 : 2;
  const cam = lerp(1.0, 1.06, easeOut(seg(f, 0, 42)));
  const cloth = [C.zenza, C.futa, C.shin][st];
  const lap = [C.lapZen, C.lapFuta, C.lapShin][st];
  const face: FaceT = st === 0 ? "normal" : st === 1 ? "smile" : "joy";
  const ranks = ["前座", "二ツ目", "真打"];
  const talk = Math.sin(f / 6) * 2;
  const puff = (a: number) => {
    const t = seg(f, a - 2, a + 8);
    if (t <= 0 || t >= 1) return null;
    return (
      <g key={a} opacity={1 - t}>
        {Array.from({ length: 9 }, (_, k) => {
          const ang = (k / 9) * Math.PI * 2;
          const r = 120 + t * 140;
          return <circle key={k} cx={960 + Math.cos(ang) * r} cy={470 + Math.sin(ang) * r * 0.8} r={46 + t * 30} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />;
        })}
        {Array.from({ length: 6 }, (_, k) => {
          const ang = (k / 6) * Math.PI * 2 + 0.3;
          return <path key={`s${k}`} transform={`translate(${960 + Math.cos(ang) * 260} ${470 + Math.sin(ang) * 200})`}
            d="M 0 -22 Q 3 -3 22 0 Q 3 3 0 22 Q -3 3 -22 0 Q -3 -3 0 -22 Z" fill={NP.glow} stroke={KRP.ink} strokeWidth={2} />;
        })}
      </g>
    );
  };
  // めくり: 3枚。k 枚目がめくれる時間
  const flips = [14, 28];
  const sheet = (k: number) => {
    const waves = [
      "M 1545 450 q 12 30 0 60 q -12 30 0 60 q 12 30 0 60",
      "M 1560 445 q -14 26 0 52 q 14 26 0 52 q -14 26 0 52 q 14 26 0 52",
      "M 1552 448 q 16 34 0 68 q -16 34 0 68 q 16 34 0 68",
    ];
    return (
      <g>
        <rect x={1490} y={420} width={140} height={270} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d={waves[k]} stroke={k === 2 ? KRP.red : NP.sumi} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M 1600 470 q 8 24 0 48 q -8 24 0 48`} stroke={NP.sumi} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={4166}>
      <g transform={`translate(${960 * (1 - cam)} ${460 * (1 - cam)}) scale(${cam})`}>
        {/* 壁と天井 */}
        <rect x={-60} y={-60} width={2040} height={900} fill={C.plankDark} />
        <rect x={-60} y={-60} width={2040} height={110} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, k) => <line key={k} x1={k * 180} y1={50} x2={k * 180} y2={840} stroke={C.board} strokeWidth={5} opacity={0.6} />)}
        {/* 提灯 (天井) */}
        {[260, 520, 1400, 1660].map((lx, i) => <NH1Chochin key={lx} x={lx} y={110} s={0.6} f={f} phase={i} color={i % 2 ? KRP.white : C.lantern} />)}
        {/* 金屏風 */}
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k}>
            <rect x={420 + k * 180} y={150} width={180} height={500} fill={k % 2 ? C.byobu : C.byobuDark} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${430 + k * 180} ${300 + (k % 2) * 30} q 80 -30 160 0`} stroke={C.gold} strokeWidth={6} fill="none" opacity={0.7} />
          </g>
        ))}
        <rect x={410} y={140} width={1100} height={20} fill={KRP.ink} />
        {/* 高座 */}
        <rect x={480} y={640} width={960} height={200} fill={C.plank} stroke={KRP.ink} strokeWidth={6} />
        <rect x={480} y={640} width={960} height={22} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 480 690 Q 720 740 960 690 Q 1200 740 1440 690 L 1440 840 L 480 840 Z" fill={C.maku} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 480 690 Q 720 740 960 690 Q 1200 740 1440 690" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} />
        {/* 座布団 */}
        <path d="M 790 612 Q 960 598 1130 612 L 1150 664 Q 960 680 770 664 Z" fill={C.zabuton} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 800 640 Q 960 650 1120 640" stroke={C.zabutonDark} strokeWidth={4} fill="none" />
        {/* 手ぬぐい */}
        <rect x={1112} y={622} width={70} height={22} rx={4} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1124} y1={624} x2={1124} y2={642} stroke={KRP.blue} strokeWidth={4} />
        {/* 噺家 (正座) */}
        <g transform={`rotate(${talk} 960 640)`}>
          <NH1Seated id="nh1-166-hanashika" x={960} y={640} s={1.18} f={f} phase={3} cloth={cloth} face={face} pose="hold" hair="cap" lap={lap} gaze={[0, 2]}>
            {st === 1 && <rect x={-22} y={-160} width={44} height={108} fill={C.under} stroke={KRP.ink} strokeWidth={3} />}
            <NH1Collar under={st === 0 ? KRP.white : st === 1 ? C.under : "#55555F"} />
            {st === 0 && <rect x={-58} y={-76} width={116} height={20} fill={C.facadeDark} stroke={KRP.ink} strokeWidth={3} />}
            {st >= 1 && (
              <g>
                <circle cx={-10} cy={-122} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                <circle cx={10} cy={-122} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              </g>
            )}
            {st === 2 && [-38, 38].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy={-146} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                <circle cx={cx} cy={-146} r={4} fill={C.shin} />
              </g>
            ))}
            {/* 扇子 */}
            <g transform={`rotate(${-38 + Math.sin(f / 7) * 6} 0 -118)`}>
              <rect x={-6} y={-200} width={12} height={90} rx={4} fill={NP.wood} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={0} y1={-196} x2={0} y2={-116} stroke={NP.woodDark} strokeWidth={2} />
            </g>
          </NH1Seated>
        </g>
        {/* めくり台 */}
        <g>
          <line x1={1500} y1={690} x2={1480} y2={830} stroke={C.board} strokeWidth={12} />
          <line x1={1620} y1={690} x2={1640} y2={830} stroke={C.board} strokeWidth={12} />
          <rect x={1474} y={404} width={172} height={300} rx={6} fill={C.board} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1470} y={398} width={180} height={16} rx={6} fill={C.plank} stroke={KRP.ink} strokeWidth={4} />
          {/* 下の紙 (次の名前) */}
          {sheet(Math.min(2, st + (f >= flips[st] ? 1 : 0)))}
          {sheet(st)}
          {/* めくれる紙 */}
          {flips.map((a, k) => {
            const t = seg(f, a, a + 5);
            if (t <= 0 || t >= 1) return null;
            return (
              <g key={a} transform={`translate(0 420) scale(1 ${1 - 2 * t}) translate(0 -420)`}>
                {sheet(k)}
              </g>
            );
          })}
          <rect x={1474} y={408} width={172} height={14} fill={C.board} />
        </g>
        {/* 御簾の奥の三味線 (右端) */}
        <g>
          <rect x={1700} y={300} width={300} height={470} fill={C.byobuDark} opacity={0.5} />
          <g transform={`rotate(${-28 + Math.sin(f / 10) * 1.5} 1840 620)`}>
            <ellipse cx={1840} cy={640} rx={58} ry={54} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
            <rect x={1834} y={360} width={12} height={240} fill={C.board} stroke={KRP.ink} strokeWidth={3} />
            <rect x={1826} y={346} width={28} height={30} rx={4} fill={C.board} stroke={KRP.ink} strokeWidth={3} />
            {[-4, 0, 4].map((dx) => <line key={dx} x1={1840 + dx} y1={370} x2={1840 + dx} y2={670} stroke={KRP.white} strokeWidth={1.5} />)}
          </g>
          <path d={`M 1800 ${600 + Math.sin(f / 5) * 10} L 1880 ${560 + Math.sin(f / 5) * 10} L 1870 ${620 + Math.sin(f / 5) * 10} Z`} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
          {/* 御簾 (すだれ) */}
          {Array.from({ length: 20 }, (_, k) => <line key={k} x1={1700} y1={300 + k * 24} x2={2000} y2={300 + k * 24} stroke={C.rope} strokeWidth={4} opacity={0.75} />)}
          <rect x={1700} y={290} width={300} height={16} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((k) => {
            const t = ((f + k * 15) % 45) / 45;
            return (
              <text key={k} x={1760 - t * 60 + k * 20} y={300 - t * 120} fontFamily={FONT} fontWeight={900} fontSize={54}
                fill={NP.sumi} opacity={Math.sin(t * Math.PI)}>♪</text>
            );
          })}
        </g>
        {/* 左の袖幕と師匠 (のぞく) */}
        <rect x={-60} y={830} width={2040} height={400} fill={C.board} />
        <rect x={-60} y={830} width={2040} height={14} fill={KRP.ink} opacity={0.35} />
        {Array.from({ length: 5 }, (_, k) => <line key={k} x1={-60} y1={880 + k * 50} x2={1980} y2={880 + k * 50} stroke={C.facadeDark} strokeWidth={3} />)}
        <rect x={150} y={790} width={300} height={44} rx={6} fill={C.plank} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${6 + Math.sin(f / 15) * 1.5} 300 790)`}>
          <NH1Seated id="nh1-166-shisho" x={300} y={790} s={0.95} f={f} phase={5} cloth={C.rakugo} face="smile" pose="hold" hair="none" lap={C.makuDark} gaze={[7, 2]}>
            <NH1Collar under={KRP.white} />
            <path d="M -66 -222 Q -70 -250 -52 -262 M 66 -222 Q 70 -250 52 -262" stroke={C.hairWhite} strokeWidth={12} fill="none" strokeLinecap="round" />
          </NH1Seated>
        </g>
        <g>
          {Array.from({ length: 4 }, (_, k) => {
            const wv = Math.sin(f / 13 + k) * 4;
            return <path key={k} d={`M ${-60 + k * 60} -60 L ${k * 60} -60 L ${k * 60 + wv} 860 L ${-60 + k * 60 + wv} 860 Z`} fill={k % 2 ? C.maku : C.makuDark} stroke={KRP.ink} strokeWidth={3} />;
          })}
        </g>
        {puff(14)}{puff(28)}
        <TagPlate x={960} y={96} text={ranks[st]} size={46} t={seg(f, [0, 14, 28][st] + 1, [0, 14, 28][st] + 6)} />
        <TagPlate x={1560} y={360} text="めくり" size={28} />
        <TagPlate x={250} y={190} text="寄席" size={36} />
        {/* 客席 (後ろ姿の頭) */}
        {Array.from({ length: 11 }, (_, i) => (
          <NH1Back key={i} x={60 + i * 180 + (i % 2) * 30} y={1170 + (i % 3) * 12} s={0.62} f={f} phase={i}
            cloth={["#6B4E3E", C.noboriIndigo, "#7A6A5A", C.narr][i % 4]} hair={[KRP.ink, "#4A3A2E", C.hairGray][i % 3]} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #167 大相撲には、親方になるための名前、年寄名跡があります。
// 格: 山 / seed 4167
// 絵: 国技館の土俵 (吊り屋根・四色の房・土俵・客席)。土俵の脇に親方 (着物) が座り、その頭の上に年寄名跡の木札 (字は描かない・木札の形だけ)。若い力士が土俵の上で四股を踏む
// どこ: 国技館。上に吊り屋根と紫の水引幕・四色の房 (青・赤・白・黒)、まわりは升席の客、真ん中に土俵
// 演出: 土俵の上で若い力士が右足を高く上げて四股を踏む (ドスン・砂ぼこり)。土俵の左脇に正座した親方 (着物)。
//       その頭の上に、字のない年寄名跡の木札がふわりと下りてきて光る
// 動き: 四股 f6〜20 で足を上げ、f22〜26 で踏む、砂ぼこり f26〜40。木札 f20〜34。カメラはゆっくり引く
const NH1Rikishi: React.FC<{ id: string; x: number; y: number; s?: number; f: number; leg: number }> = ({ id, x, y, s = 1, f, leg }) => {
  const L = clamp01(leg);
  const lean = -9 * L;
  const legShape = (sd: -1 | 1) => (
    <g>
      <path d={`M ${sd * 8} -60 L ${sd * 58} -60 L ${sd * 62} -6 L ${sd * 14} -6 Z`} fill={C.skin} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={sd * 40} cy={-4} rx={30} ry={11} fill={C.skin} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`rotate(${lean} 0 -56)`}>
        {legShape(-1)}
        {L < 0.05 && legShape(1)}
        <defs><clipPath id={id}><rect x={-300} y={-500} width={600} height={446} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          <Person x={0} y={0} f={f} phase={2} cloth={C.skin} clothDark={C.skin} face={L > 0.5 ? "angry" : "normal"} pose="stand" still />
        </g>
        {/* 太いおなか */}
        <ellipse cx={0} cy={-108} rx={80} ry={66} fill={C.skin} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -40 -150 q 14 10 28 0 M 12 -150 q 14 10 28 0" stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.7} />
        <circle cx={0} cy={-100} r={4} fill={KRP.ink} />
        {/* まわし */}
        <path d="M -82 -78 Q 0 -62 82 -78 L 80 -46 Q 0 -32 -80 -46 Z" fill={C.mawashi} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -22 -48 L 22 -48 L 14 -10 L -14 -10 Z" fill={C.mawashi} stroke={KRP.ink} strokeWidth={4} />
        {[-16, -8, 0, 8, 16].map((dx) => (
          <line key={dx} x1={dx} y1={-44} x2={dx * 1.2 + Math.sin(f / 5 + dx) * 2} y2={-8} stroke={C.mawashi} strokeWidth={4} />
        ))}
        {/* 上げた右足 (体の前に描く。上がるほど長く見せる) */}
        {L >= 0.05 && (
          <g transform={`rotate(${-102 * L} 30 -56)`}>
            <g transform={`translate(30 -60) scale(1 ${1 + L * 1.3}) translate(-30 60)`}>
              <path d="M 8 -60 L 58 -60 L 62 -6 L 14 -6 Z" fill={C.skin} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            </g>
            <ellipse cx={40} cy={-60 + 56 * (1 + L * 1.3)} rx={30} ry={11} fill={C.skin} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        )}
        {/* ちょんまげ */}
        <path d="M -20 -290 Q 0 -306 20 -290 L 30 -312 Q 4 -326 -10 -310 Z" fill={KRP.ink} />
        <ellipse cx={0} cy={-292} rx={24} ry={8} fill={KRP.ink} />
      </g>
    </g>
  );
};
const Nm167: React.FC<{ f: number }> = ({ f }) => {
  const cam = lerp(1.08, 1.0, easeOut(seg(f, 0, 42)));
  const up = easeOut(seg(f, 4, 15));
  const down = easeInOut(seg(f, 17, 20));
  const up2 = easeOut(seg(f, 26, 40));
  const leg = up * (1 - down) + up2;
  const dust = seg(f, 20, 34);
  const shake = f >= 20 && f < 24 ? Math.sin(f * 3) * 4 : 0;
  const fuda = easeOut(seg(f, 20, 34));
  const fusa = (x: number, top: number, len: number, col: string, k: number) => {
    const sw = Math.sin(f / 16 + k) * 3;
    return (
      <g key={k} transform={`rotate(${sw} ${x} ${top})`}>
        <line x1={x} y1={top} x2={x} y2={top + len} stroke={col} strokeWidth={12} />
        <line x1={x} y1={top} x2={x} y2={top + len} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
        <circle cx={x} cy={top + len} r={16} fill={col} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${x - 22} ${top + len + 10} L ${x + 22} ${top + len + 10} L ${x + 30} ${top + len + 90} L ${x - 30} ${top + len + 90} Z`} fill={col} stroke={KRP.ink} strokeWidth={4} />
        {[-14, 0, 14].map((dx) => <line key={dx} x1={x + dx} y1={top + len + 22} x2={x + dx * 1.3} y2={top + len + 86} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />)}
      </g>
    );
  };
  return (
    <Frame f={f} seed={4167} bg={C.arena}>
      <g transform={`translate(${960 * (1 - cam) + shake} ${500 * (1 - cam)}) scale(${cam})`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.arena} />
        {/* 升席の客 (遠く) */}
        {Array.from({ length: 4 }, (_, r) => (
          <g key={r}>
            <rect x={-60} y={300 + r * 80} width={2040} height={10} fill={C.arenaSeat} />
            {Array.from({ length: 26 }, (_, c) => (
              <PersonMini key={c} x={-30 + c * 78 + (r % 2) * 38} y={300 + r * 80} s={0.28} f={f} phase={c + r * 7}
                color={["#7A6A5A", C.noboriIndigo, "#8E5A3A", C.narr, "#9E4A4A"][(c + r) % 5]} face="none" />
            ))}
          </g>
        ))}
        {/* 吊り屋根 */}
        <g>
          <line x1={700} y1={-60} x2={700} y2={70} stroke={KRP.ink} strokeWidth={5} />
          <line x1={1220} y1={-60} x2={1220} y2={70} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 560 150 L 1360 150 L 1240 60 L 680 60 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 16 }, (_, k) => <line key={k} x1={lerp(680, 1240, k / 15)} y1={62} x2={lerp(560, 1360, k / 15)} y2={148} stroke={C.roofLine} strokeWidth={3} />)}
          {/* 千木と鰹木 */}
          <path d="M 680 60 L 650 10 M 680 60 L 710 10 M 1240 60 L 1210 10 M 1240 60 L 1270 10" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          {[820, 900, 980, 1060, 1140].map((kx) => <rect key={kx} x={kx - 20} y={44} width={40} height={18} rx={8} fill={C.roofDark} stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={540} y={150} width={840} height={40} fill={C.facade} stroke={KRP.ink} strokeWidth={5} />
          {/* 水引幕 */}
          <path d="M 540 190 L 1380 190 L 1380 220 Q 1275 250 1170 220 Q 1065 250 960 220 Q 855 250 750 220 Q 645 250 540 220 Z" fill={C.maku} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 540 204 L 1380 204" stroke={C.makuDark} strokeWidth={4} />
        </g>
        {/* 房 (奥2本は小さめ) */}
        {fusa(640, 210, 70, C.fusaBlack, 0)}
        {fusa(1280, 210, 70, C.fusaBlue, 1)}
        {/* 土俵 */}
        <path d="M 520 600 L 1400 600 L 1580 740 L 340 740 Z" fill={C.dohyo} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 340 740 L 1580 740 L 1610 840 L 310 840 Z" fill={C.dohyoFront} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 330 790 L 1590 790" stroke={C.dohyoDark} strokeWidth={4} />
        {[620, 860, 1060, 1300].map((sx) => <rect key={sx} x={sx} y={760} width={50} height={30} fill={C.tawara} stroke={KRP.ink} strokeWidth={3} />)}
        <ellipse cx={960} cy={668} rx={420} ry={54} fill="none" stroke={C.tawara} strokeWidth={18} />
        <ellipse cx={960} cy={668} rx={420} ry={54} fill="none" stroke={KRP.ink} strokeWidth={2.5} strokeDasharray="10 16" />
        <line x1={880} y1={668} x2={880} y2={690} stroke={KRP.white} strokeWidth={6} />
        <line x1={1040} y1={668} x2={1040} y2={690} stroke={KRP.white} strokeWidth={6} />
        {/* 塩かご */}
        <path d="M 1480 700 L 1540 700 L 1530 730 L 1490 730 Z" fill={C.rope} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1510} cy={698} rx={30} ry={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        {/* 力士 (四股) */}
        <ellipse cx={960} cy={694} rx={120} ry={16} fill={KRP.ink} opacity={0.2} />
        <NH1Rikishi id="nh1-167-rikishi" x={960} y={694} s={1.0} f={f} leg={leg} />
        {/* ドスン: 砂ぼこりと衝撃 */}
        {dust > 0 && dust < 1 && (
          <g opacity={1 - dust}>
            {Array.from({ length: 8 }, (_, k) => {
              const sd = k % 2 ? 1 : -1;
              return <circle key={k} cx={1000 + sd * (40 + dust * (60 + k * 16))} cy={688 - dust * (10 + k * 5)} r={14 + dust * 18}
                fill={C.dohyo} stroke={C.dohyoDark} strokeWidth={4} />;
            })}
            <ellipse cx={1000} cy={694} rx={60 + dust * 160} ry={10 + dust * 24} fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {f >= 19 && f < 27 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 19, 27)}>
            <line x1={1110} y1={610} x2={1150} y2={580} /><line x1={1130} y1={650} x2={1180} y2={640} />
            <line x1={880} y1={610} x2={840} y2={580} />
          </g>
        )}
        {/* 手前の房 */}
        {fusa(500, 210, 140, C.fusaWhite, 2)}
        {fusa(1420, 210, 140, C.fusaRed, 3)}
        {/* 床 (土俵だまり) */}
        <rect x={-60} y={838} width={2040} height={300} fill={C.arenaSeat} />
        <rect x={-60} y={838} width={2040} height={12} fill={KRP.ink} opacity={0.35} />
        {/* 親方 (土俵の脇に正座) */}
        <rect x={80} y={884} width={230} height={40} rx={10} fill={C.zabuton} stroke={KRP.ink} strokeWidth={5} />
        <NH1Seated id="nh1-167-oyakata" x={195} y={900} s={0.95} f={f} phase={4} cloth={C.oyakata} face="normal" pose="armsFolded" hair="cap" lap={C.kamiDark} gaze={[6, 0]}>
          <NH1Collar under={C.kamiDark} />
        </NH1Seated>
        {/* 年寄名跡の木札 (字なし。ふわりと下りて光る) */}
        <g transform={`translate(195 ${lerp(470, 568, fuda)}) rotate(${Math.sin(f / 12) * 2})`} opacity={fuda}>
          <circle r={130} fill={NP.glow} opacity={0.3} />
          <line x1={0} y1={-140} x2={0} y2={-92} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -55 -60 L -30 -88 L 30 -88 L 55 -60 L 55 80 L -55 80 Z" fill={KRP.ink} opacity={0.18} transform="translate(6 8)" />
          <path d="M -55 -60 L -30 -88 L 30 -88 L 55 -60 L 55 80 L -55 80 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-66} r={7} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -40 -20 q 40 -8 80 0 M -40 30 q 40 8 80 0" stroke={NP.grain} strokeWidth={3} fill="none" />
        </g>
        <TagPlate x={230} y={400} text="年寄名跡" size={32} t={seg(f, 30, 38)} />
        <TagPlate x={1720} y={110} text="国技館" size={36} />
        {/* 手前の客 (後ろ姿) */}
        {Array.from({ length: 8 }, (_, i) => (
          <NH1Back key={i} x={560 + i * 190 + (i % 2) * 24} y={1180 + (i % 3) * 12} s={0.62} f={f} phase={i}
            cloth={["#6B4E3E", C.noboriIndigo, "#7A6A5A", C.narr][i % 4]} hair={[KRP.ink, "#4A3A2E", C.hairGray][i % 3]} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #168 数は、一代かぎりのものを除いて、105。
// 格: 図 / seed 4168
// 絵: 相撲部屋の壁に、**木札がずらりと並ぶ掛け板** (105枚・字は描かず木札の形)。f で札が数えられて数字のカウンターが「105」で止まる。端に「一代かぎり」の札が別に1〜2枚、少し離して掛かる
// どこ: 相撲部屋の稽古場の板壁。土の床・上がり座敷の縁。壁に大きな掛け板
// 演出: 掛け板に字のない木札が 15×7=105 枚ずらりと掛かる。左上から順に札が明るく返って数えられ、
//       右の真鍮の数取り器が 0 から回って「105」でカチッと止まる。右下に少し離して「一代かぎり」の札が2枚
// 動き: 数え f4〜38 (はじめゆっくり→速く)。止まった瞬間 f38〜42 に光。カメラはゆっくり寄る
const Nm168: React.FC<{ f: number }> = ({ f }) => {
  const cam = lerp(1.0, 1.05, easeOut(seg(f, 0, 42)));
  const cnt = Math.round(105 * easeInOut(seg(f, 4, 38)));
  const done = seg(f, 38, 42);
  const BX = 140, BY = 200, NC = 15, NR = 7, SXp = 86, SYp = 80;
  const digits = String(cnt).padStart(3, "0").split("");
  return (
    <Frame f={f} seed={4168}>
      <g transform={`translate(${800 * (1 - cam)} ${480 * (1 - cam)}) scale(${cam})`}>
        {/* 板壁 */}
        <rect x={-60} y={-60} width={2040} height={940} fill={C.plank} />
        {Array.from({ length: 16 }, (_, k) => (
          <g key={k}>
            <line x1={-60 + k * 132} y1={-60} x2={-60 + k * 132} y2={880} stroke={C.plankDark} strokeWidth={5} />
            <path d={`M ${-20 + k * 132} ${80 + rnd(4168, k) * 500} q 20 40 0 90`} stroke={C.plankDark} strokeWidth={3} fill="none" opacity={0.5} />
          </g>
        ))}
        <rect x={-60} y={-60} width={2040} height={60} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {/* 土の床と上がり座敷の縁 */}
        <rect x={-60} y={860} width={2040} height={300} fill={C.clay} />
        <rect x={-60} y={840} width={2040} height={26} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={rnd(4169, i) * 1920} cy={900 + rnd(4170, i) * 160} r={4} fill={C.dohyoDark} opacity={0.6} />)}
        <TagPlate x={790} y={120} text="年寄名跡" size={42} />
        {/* 掛け板 */}
        <rect x={BX - 40 + 10} y={BY - 40 + 12} width={NC * SXp + 60} height={NR * SYp + 60} rx={14} fill={KRP.ink} opacity={0.22} />
        <rect x={BX - 40} y={BY - 40} width={NC * SXp + 60} height={NR * SYp + 60} rx={14} fill={C.board} stroke={KRP.ink} strokeWidth={8} />
        <rect x={BX - 22} y={BY - 22} width={NC * SXp + 24} height={NR * SYp + 24} rx={8} fill={C.facade} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: NR }, (_, r) => (
          <line key={r} x1={BX - 16} y1={BY + r * SYp + 4} x2={BX + NC * SXp - 4} y2={BY + r * SYp + 4} stroke={C.facadeDark} strokeWidth={4} />
        ))}
        {Array.from({ length: NR * NC }, (_, i) => {
          const r = Math.floor(i / NC), c = i % NC;
          const x = BX + c * SXp + SXp / 2 - 10, y = BY + r * SYp + 10;
          const lit = i < cnt;
          const just = lit && i >= cnt - 3 && done === 0;
          const sw = Math.sin(f / 10 + i * 0.7) * 1.5;
          return (
            <g key={i} transform={`rotate(${sw + (just ? -6 : 0)} ${x} ${y})`}>
              <circle cx={x} cy={y} r={4} fill={KRP.ink} />
              {just && <circle cx={x} cy={y + 34} r={38} fill={NP.glow} opacity={0.5} />}
              <path d={`M ${x - 24} ${y + 12} L ${x - 14} ${y + 2} L ${x + 14} ${y + 2} L ${x + 24} ${y + 12} L ${x + 24} ${y + 64} L ${x - 24} ${y + 64} Z`}
                fill={lit ? C.tagLit : NP.woodMid} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={x - 12} y1={y + 30} x2={x + 12} y2={y + 30} stroke={lit ? NP.grain : NP.woodDark} strokeWidth={3} opacity={0.6} />
              {lit && <circle cx={x} cy={y + 46} r={3.5} fill={KRP.red} opacity={0.8} />}
            </g>
          );
        })}
        {/* 数取り器 (真鍮) */}
        <g transform={`translate(1660 330) scale(${1 + 0.08 * Math.sin(done * Math.PI)})`}>
          {done > 0 && <circle r={190} fill={NP.glow} opacity={0.35 * done} />}
          <rect x={-170 + 8} y={-90 + 10} width={340} height={180} rx={24} fill={KRP.ink} opacity={0.22} />
          <rect x={-170} y={-90} width={340} height={180} rx={24} fill={NP.brass} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-150} y={-70} width={300} height={140} rx={12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          {digits.map((d, k) => (
            <g key={k}>
              <rect x={-136 + k * 92} y={-58} width={84} height={116} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <line x1={-136 + k * 92} y1={0} x2={-52 + k * 92} y2={0} stroke={KRP.gray} strokeWidth={2} />
              <text x={-94 + k * 92} y={32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} fill={done > 0 ? KRP.red : KRP.ink}>{d}</text>
            </g>
          ))}
          <rect x={150} y={-30} width={40} height={60} rx={8} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-110} r={20} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} transform={`translate(0 ${cnt < 105 ? Math.abs(Math.sin(f)) * 6 : 0})`} />
        </g>
        {/* 少し離して: 一代かぎりの札 */}
        <line x1={1500} y1={480} x2={1500} y2={780} stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 12" opacity={0.6} />
        <rect x={1550} y={500} width={270} height={30} rx={8} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {[1630, 1740].map((x, k) => (
          <g key={x} transform={`rotate(${Math.sin(f / 11 + k) * 3} ${x} 530)`}>
            <line x1={x} y1={530} x2={x} y2={560} stroke={KRP.red} strokeWidth={5} />
            <path d={`M ${x - 36} 576 L ${x - 22} 560 L ${x + 22} 560 L ${x + 36} 576 L ${x + 36} 680 L ${x - 36} 680 Z`} fill={C.tag} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${x - 22} 610 q 22 -6 44 0 M ${x - 22} 646 q 22 6 44 0`} stroke={NP.grain} strokeWidth={3} fill="none" />
          </g>
        ))}
        <TagPlate x={1685} y={750} text="一代かぎり" size={32} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_160: (f) => <Nm160 f={f} />,
  nm_161: (f) => <Nm161 f={f} />,
  nm_162: (f) => <Nm162 f={f} />,
  nm_163: (f) => <Nm163 f={f} />,
  nm_164: (f) => <Nm164 f={f} />,
  nm_165: (f) => <Nm165 f={f} />,
  nm_166: (f) => <Nm166 f={f} />,
  nm_167: (f) => <Nm167 f={f} />,
  nm_168: (f) => <Nm168 f={f} />,
};

export const NM_H1_MOTIFS: string[] = [
  "nm_160", // #160
  "nm_161", // #161
  "nm_162", // #162
  "nm_163", // #163
  "nm_164", // #164
  "nm_165", // #165
  "nm_166", // #166
  "nm_167", // #167
  "nm_168", // #168
];

export const namaeH1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
