// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#178〜#184 (7文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-5.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで7枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L4d。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./YawaShared";
import { YP, Squishy, DameSofa, AgeDial, KaradaChizu } from "./YawaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/YP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // サッコ (#177 と同じ色)
  sacco: "#E8833A", saccoDark: "#C0642A", saccoShine: "#FFC08A",
  // 製図
  draftPaper: "#EEF1E6", draftGrid: "#BCCFC6", draftBlue: "#4F78A8", beadBg: "#F6EFE0", beadLine: "#B9B2A4", ghost: "#9FB7D9",
  // 序のリビング (#7・#8 と同じ色)
  livingWall: "#F4E5C8", floorWood: "#D9B47F", floorWoodDark: "#B48A55", boxTop: "#DDB57F", mug: "#E9E2D2",
  rug: "#D98C6E", rugDark: "#B96D52", curtain: "#E7B85C", curtainDark: "#C99A3E", tvStand: "#9C7449",
  lounge: "#9DB7A0", loungeDark: "#7A9680", remote: "#4A4A55",
  // 2013年の夜の部屋
  nightWall: "#E6D6B8", nightSky: "#2F3F66", bezel: "#3A3D45", screen: "#FBFAF6", chrome: "#DADDE2", blogHead: "#8DA88E",
  heart: "#E8566A", lampGlow: "#FFE7A8", plant: "#6E9A5A", plantDark: "#4F7542",
  // 港
  portSky: "#BFDDEB", sea: "#5D9CC0", seaDark: "#437FA3", hill: "#8FB08A", hillDark: "#6F9270", roofTile: "#5E6B7A",
  houseWall: "#F2EBDD", concrete: "#C9C2B4", concreteDark: "#A39B8B", hull: "#2F4A6B", hullRed: "#A8433A",
  yogi: "#3CB4D8", yogiDark: "#2A8BAA", yogiShine: "#A8E4F2", vest: "#E8A33A", vestDark: "#B97D22",
  crate1: "#C9583F", crate2: "#3E7F8C", crate3: "#D9A63E", crate4: "#6A8F4E",
  // おもちゃ屋
  brick: "#B5654A", brickDark: "#8E4A35", storeIn: "#F7E7C6", sidewalk: "#D4CCBE", sidewalkDark: "#B3AA99", counterBg: "#2B2B33",
  m1: "#F5C6D2", m2: "#BFE3D0", m3: "#D6C8EE", m4: "#FBE3A0", m5: "#F8C9A8", m6: "#BFD8F0", usBlue: "#2D4A86",
  // 現代のリビング・研究室
  oak: "#D8B988", oakDark: "#B0905F", labWall: "#DCE6E3", labTile: "#BFCFCB", bench: "#EDEDE8", benchDark: "#B9BBB4",
  cushion: "#E7A7A0", cushionDark: "#C47F78", pillow: "#E4DDEE", pillowDark: "#B9AED0", penBody: "#5C7FB8", penGrip: "#3B3F4A",
  coat: "#F7F7F4", coatDark: "#C9CBC6",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void YP; void Squishy; void DameSofa; void AgeDial; void KaradaChizu;
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
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;
// 2次ベジェの点と向き
const qpt = (p: number[], t: number) => {
  const [x0, y0, x1, y1, x2, y2] = p;
  const u = 1 - t;
  return {
    x: u * u * x0 + 2 * u * t * x1 + t * t * x2,
    y: u * u * y0 + 2 * u * t * y1 + t * t * y2,
    a: (Math.atan2(2 * u * (y1 - y0) + 2 * t * (y2 - y1), 2 * u * (x1 - x0) + 2 * t * (x2 - x1)) * 180) / Math.PI,
  };
};
// ハート
const L4dHeart: React.FC<{ x: number; y: number; s?: number; op?: number; fill?: string }> = ({ x, y, s = 1, op = 1, fill = C.heart }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={op}
    d="M 0 14 C -34 -10 -30 -42 0 -26 C 30 -42 34 -10 0 14 Z" fill={fill} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
);
// きらり (4つ角の星)
const L4dSpark: React.FC<{ x: number; y: number; s?: number; op?: number; fill?: string }> = ({ x, y, s = 1, op = 1, fill = YP.glow }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={op}
    d="M 0 -30 Q 5 -5 30 0 Q 5 5 0 30 Q -5 5 -30 0 Q -5 -5 0 -30 Z" fill={fill} stroke={C.ink} strokeWidth={3} />
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#178 【図】 中に細かい粒を詰めた、形の決まらない、大きな袋の椅子です。
// 設計: サッコの断面図 (世界=デザインの製図用紙)。袋の中に細かい粒 (白い丸) がぎっしり。座った人の形に合わせて粒が流れる矢印。札「細かい粒」「形が決まらない」
// どこ: デザイン事務所の製図台。木の板に方眼の製図用紙をテープ留め。T定規・鉛筆・コンパス・消しくず
// 演出: #177 と同じ洋梨形のサッコを縦に切った断面図。中は白い粒がぎっしり。座る体の型板 (青い半透明) が降りると、
//       袋の形が「座った形」に変わり、粒が体の下から横・後ろへ流れる (黄色い粒と赤い矢印)。右に粒の拡大の丸窓
// 動き: f6〜30 袋が洋梨→座った形に変形 / f10〜40 黄色い粒が矢印に沿って流れる / 矢印が描かれていく / 左の小さな3つの形が順に光る / カメラは少し引く
const L4dP0 = [-250, 0, -300, -40, -280, -140, -250, -260, -150, -330, -90, -400, -64, -470, -44, -530, 0, -536, 44, -530, 64, -470, 90, -400, 150, -330, 250, -260, 280, -140, 300, -40, 250, 0, 0, 14, -250, 0];
const L4dP1 = [-280, 0, -330, -40, -310, -140, -290, -230, -210, -270, -120, -250, -40, -220, 30, -200, 90, -300, 120, -430, 170, -470, 220, -500, 250, -440, 290, -340, 300, -200, 320, -40, 270, 0, 0, 14, -280, 0];
const l4dPear = (k: number) => {
  const a = L4dP0.map((v, i) => lerp(v, L4dP1[i], k));
  let d = `M ${a[0]} ${a[1]}`;
  for (let i = 2; i < a.length; i += 4) d += ` Q ${a[i]} ${a[i + 1]} ${a[i + 2]} ${a[i + 3]}`;
  return d + " Z";
};
// 流れの矢印 (2次ベジェ)。t で描かれていく
const L4dFlow: React.FC<{ p: number[]; t: number; color?: string }> = ({ p, t, color = KRP.red }) => {
  if (t <= 0.01) return null;
  const e = qpt(p, t);
  return (
    <g>
      <path d={`M ${p[0]} ${p[1]} Q ${p[2]} ${p[3]} ${p[4]} ${p[5]}`} pathLength={1} strokeDasharray={`${t} 1`}
        fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${p[0]} ${p[1]} Q ${p[2]} ${p[3]} ${p[4]} ${p[5]}`} pathLength={1} strokeDasharray={`${t} 1`}
        fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
      <polygon points="18,0 -16,-20 -16,20" fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round"
        transform={`translate(${e.x} ${e.y}) rotate(${e.a})`} />
    </g>
  );
};
const Yw178: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.07, 1.0, easeInOut(seg(f, 0, 40)));
  const k = easeInOut(seg(f, 6, 30));
  const d = l4dPear(k);
  const flowT = easeOut(seg(f, 12, 36));
  const flows = [
    [-80, -200, -220, -70, -270, -210],
    [0, -190, 170, -60, 240, -330],
  ];
  const BX = 840, BY = 830, BS = 1.22;
  const ghostIn = easeOut(seg(f, 2, 14));
  const ghostY = lerp(-160, 0, k);
  return (
    <Frame f={f} seed={3178} bg={YP.wood}>
      <g transform={cam(960, 540, z)}>
        {/* 製図台の木の板 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={YP.wood} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -60 ${40 + i * 150} q 500 ${rnd(1781, i) * 30 - 15} 1000 0 q 500 ${rnd(1782, i) * 30 - 15} 1100 0`}
            fill="none" stroke={YP.woodDark} strokeWidth={5} opacity={0.4} />
        ))}
        {/* 製図用紙 (方眼) */}
        <g transform="rotate(-0.8 960 540)">
          <rect x={70} y={36} width={1780} height={1000} rx={4} fill={C.draftPaper} stroke={C.ink} strokeWidth={7} />
          <g stroke={C.draftGrid} strokeWidth={2}>
            {Array.from({ length: 44 }, (_, i) => <line key={`v${i}`} x1={90 + i * 40} y1={50} x2={90 + i * 40} y2={1024} opacity={i % 5 === 0 ? 1 : 0.5} />)}
            {Array.from({ length: 25 }, (_, i) => <line key={`h${i}`} x1={80} y1={56 + i * 40} x2={1840} y2={56 + i * 40} opacity={i % 5 === 0 ? 1 : 0.5} />)}
          </g>
          {/* 四隅のテープ */}
          {([[100, 60, 38], [1820, 60, -36], [100, 1010, -40], [1820, 1010, 36]] as const).map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 50} y={ty - 18} width={100} height={36} rx={4} fill={i % 2 ? "#E8C9A0" : "#D7E3C8"}
              opacity={0.85} stroke={C.ink} strokeWidth={3} transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {/* 表題欄 */}
          <g transform="translate(1480 70)">
            <rect x={0} y={0} width={340} height={128} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
            <line x1={0} y1={56} x2={340} y2={56} stroke={C.ink} strokeWidth={3.5} />
            <line x1={170} y1={56} x2={170} y2={128} stroke={C.ink} strokeWidth={3.5} />
            <text x={170} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>断面図</text>
            <text x={85} y={104} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.draftBlue}>SACCO</text>
            <text x={255} y={104} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.draftBlue}>1968</text>
          </g>
          {/* 中心線 (一点鎖線) */}
          <line x1={BX} y1={120} x2={BX} y2={880} stroke={C.draftBlue} strokeWidth={3} strokeDasharray="40 10 6 10" opacity={0.6} />
        </g>

        {/* ===== 主役: サッコの断面 ===== */}
        <ellipse cx={BX} cy={BY + 8} rx={330 * BS} ry={22} fill={C.ink} opacity={0.18} />
        <g transform={`translate(${BX} ${BY}) scale(${BS})`}>
          <defs>
            <clipPath id="l4dSac178">
              <path d={d} transform="translate(0 -268) scale(0.93) translate(0 268)" />
            </clipPath>
          </defs>
          {/* 布の層 (オレンジ) */}
          <path d={d} fill={C.sacco} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          {/* 中身: 粒がぎっしり */}
          <g clipPath="url(#l4dSac178)">
            <rect x={-400} y={-600} width={800} height={640} fill={C.beadBg} />
            {Array.from({ length: 24 }, (_, j) =>
              Array.from({ length: 28 }, (_, i) => {
                const x0 = -340 + i * 25 + (j % 2) * 12.5;
                const y0 = -8 - j * 23;
                const jig = Math.sin(f / 3 + i * 1.3 + j * 0.7) * 1.6 * flowT * (1 - seg(f, 36, 42));
                // 座った所の下の粒は横へ逃げる
                const dx = -40 - x0, dy = -230 - y0;
                const near = Math.max(0, 1 - Math.hypot(dx, dy) / 160) * k;
                const px = x0 - Math.sign(dx || 1) * near * 12 + jig;
                const py = y0 * (1 - 0.05 * k) + jig * 0.6;
                return <circle key={`${i}-${j}`} cx={px} cy={py} r={10} fill={KRP.white} stroke={C.beadLine} strokeWidth={2} />;
              }),
            )}
            {/* 流れていく目印の粒 (黄色) */}
            {flows.map((p, fi) => Array.from({ length: 4 }, (_, n) => {
              const tt = clamp01(flowT * 1.1 - n * 0.16);
              if (tt <= 0) return null;
              const e = qpt(p, tt);
              return <circle key={`${fi}-${n}`} cx={e.x + (n % 2) * 14} cy={e.y + (n % 2) * 10} r={12} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />;
            }))}
          </g>
          {/* 布の輪郭をもう一度 (粒の上に) */}
          <path d={d} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          <path d={d} fill="none" stroke={C.saccoDark} strokeWidth={3} strokeDasharray="12 10"
            transform="translate(0 -268) scale(0.965) translate(0 268)" />
          <ellipse cx={lerp(0, 210, k)} cy={lerp(-528, -478, k)} rx={30} ry={10} fill={C.saccoDark} stroke={C.ink} strokeWidth={4} />
          <path d="M -230 -150 Q -230 -250 -160 -300" fill="none" stroke={C.saccoShine} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
          {/* 座る体の型板 (青い半透明) */}
          <g opacity={0.6 * ghostIn} transform={`translate(0 ${ghostY})`}>
            <g stroke={C.ghost} strokeWidth={64} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M -30 -250 L 120 -430" />
              <path d="M -30 -250 L -200 -300 L -330 -30" />
              <path d="M 90 -400 L -40 -330 L -110 -360" strokeWidth={34} />
            </g>
            <circle cx={140} cy={-496} r={56} fill={C.ghost} />
            <g stroke={C.draftBlue} strokeWidth={4} strokeDasharray="12 8" fill="none">
              <circle cx={140} cy={-496} r={56} />
              <path d="M -60 -220 L 100 -410 M 10 -280 L 150 -450" />
            </g>
          </g>
          {/* 体重の矢印 */}
          <g opacity={seg(f, 4, 10) * (1 - seg(f, 30, 38) * 0.6)}>
            <path d={`M -40 ${-640 + k * 120} L -40 ${-440 + k * 120}`} stroke={C.draftBlue} strokeWidth={12} strokeLinecap="round" />
            <polygon points={`-40,${-400 + k * 120} -66,${-446 + k * 120} -14,${-446 + k * 120}`} fill={C.draftBlue} stroke={C.ink} strokeWidth={4} />
          </g>
          {/* 粒の流れ */}
          {flows.map((p, i) => <L4dFlow key={i} p={p} t={clamp01(flowT * 1.05 - i * 0.05)} />)}
        </g>
        {/* 寸法線 (幅は決まらない) */}
        <g stroke={C.draftBlue} strokeWidth={4} fill="none">
          <line x1={BX - 330 * BS} y1={890} x2={BX + 330 * BS} y2={890} />
          <line x1={BX - 330 * BS} y1={868} x2={BX - 330 * BS} y2={912} />
          <line x1={BX + 330 * BS} y1={868} x2={BX + 330 * BS} y2={912} />
        </g>
        <rect x={BX - 44} y={862} width={88} height={56} rx={8} fill={C.draftPaper} />
        <text x={BX} y={906} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.red}>?</text>

        {/* 左: 形が決まらない (同じ袋の3つの形) */}
        <TagPlate x={260} y={250} text="形が決まらない" size={38} t={seg(f, 14, 22)} />
        {[0, 0.5, 1].map((kk, i) => {
          const on = seg(f, 16 + i * 6, 22 + i * 6);
          return (
            <g key={i} transform={`translate(${150 + i * 125} ${560}) scale(${0.18 * (1 + pop(on) * 0.1)})`}>
              <path d={i === 2 ? "M -330 0 Q -340 -60 -300 -110 Q 0 -150 300 -110 Q 340 -60 330 0 Q 0 14 -330 0 Z" : l4dPear(kk)}
                fill={on > 0.5 ? C.sacco : "none"} stroke={C.draftBlue} strokeWidth={18} strokeDasharray={on > 0.5 ? undefined : "40 24"} />
            </g>
          );
        })}
        <path d="M 120 610 Q 270 650 420 610" fill="none" stroke={C.draftBlue} strokeWidth={5} strokeDasharray="10 8" />

        {/* 右: 粒の拡大窓 */}
        <g opacity={seg(f, 8, 16)}>
          <line x1={BX + 120} y1={BY - 120 * BS} x2={1400} y2={520} stroke={C.ink} strokeWidth={4} strokeDasharray="12 8" />
          <circle cx={BX + 120} cy={BY - 120 * BS} r={34} fill="none" stroke={C.ink} strokeWidth={5} />
        </g>
        <g transform={`translate(1540 500) scale(${pop(seg(f, 8, 18))})`}>
          <defs><clipPath id="l4dLens178"><circle r={150} /></clipPath></defs>
          <circle r={160} fill={C.beadBg} stroke={C.ink} strokeWidth={8} />
          <g clipPath="url(#l4dLens178)">
            {Array.from({ length: 5 }, (_, j) => Array.from({ length: 5 }, (_, i) => {
              const cx = -150 + i * 76 + (j % 2) * 38 + Math.sin(f / 5 + i + j) * 2;
              const cy = -150 + j * 70;
              return (
                <g key={`${i}-${j}`}>
                  <circle cx={cx} cy={cy} r={34} fill={KRP.white} stroke={C.beadLine} strokeWidth={4} />
                  <circle cx={cx - 11} cy={cy - 11} r={9} fill={KRP.cream} opacity={0.9} />
                  <path d={`M ${cx + 8} ${cy + 22} q 14 -6 18 -20`} fill="none" stroke={C.beadLine} strokeWidth={3} />
                </g>
              );
            }))}
          </g>
          <circle r={160} fill="none" stroke={C.ink} strokeWidth={8} />
          <circle r={146} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
        </g>
        <TagPlate x={1540} y={730} text="細かい粒" size={44} t={seg(f, 12, 20)} />

        {/* 製図の道具 (下の手前) */}
        <g transform="rotate(-2 960 960)">
          <rect x={120} y={940} width={1100} height={36} fill="#E9D7A8" stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 27 }, (_, i) => <line key={i} x1={140 + i * 40} y1={940} x2={140 + i * 40} y2={i % 5 === 0 ? 966 : 956} stroke={C.ink} strokeWidth={3} />)}
          <rect x={60} y={900} width={80} height={110} fill={YP.woodDark} stroke={C.ink} strokeWidth={5} />
        </g>
        <g transform={`translate(1380 930) rotate(${-18 + Math.sin(f / 9) * 2})`}>
          <rect x={-130} y={-12} width={240} height={24} rx={4} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          <path d="M 110 -12 L 150 0 L 110 12 Z" fill="#E9C9A0" stroke={C.ink} strokeWidth={4} />
          <rect x={-146} y={-12} width={20} height={24} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform="translate(1700 900)">
          <path d="M 0 -60 L -50 70 M 0 -60 L 46 70" stroke={KRP.grayDark} strokeWidth={9} strokeLinecap="round" fill="none" />
          <circle cx={0} cy={-62} r={16} fill={YP.brass} stroke={C.ink} strokeWidth={4} />
        </g>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${1540 + i * 26} ${990 - (i % 2) * 14} q 8 -10 16 0`} stroke={KRP.gray} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#179 【山】 2013年。日本では、無印良品の「体にフィットするソファ」が、あるブログで紹介されました。
// 設計: パソコンの画面の中のブログ (世界=ノートPCの画面と部屋の机)。画面にソファの手描きイラストと、ソファに沈んでいく人の4コマ風の絵。「いいね」のハートが f で増える。札「2013年」「無印良品」(ロゴは描かない)
// どこ: 2013年の夜の部屋の机。窓の外は夜空と月。机の上に大きなノートPC・電気スタンド・マグ・ノート・観葉植物
// 演出: PCの画面にブログ。左にソファの手描きイラスト、右にソファに沈んでいく人の4コマ (DameSofa の小さい版)。
//       カーソルがハートのボタンを押すと「いいね」のハートが次々に湧き、画面の外まであふれる。横の人が身を乗り出して指さす
// 動き: 4コマが f6/12/18/24 に順に出る / f20 クリック → ハートが湧き続ける / カメラが画面に寄る / 湯気・スタンドの光がゆれる
const L4dKoma: React.FC<{ x: number; y: number; sink: number; f: number; t: number; deep?: boolean }> = ({ x, y, sink, f, t, deep }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * pop(t)})`} opacity={clamp01(t * 2)}>
      <rect x={-140} y={-92} width={280} height={184} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <rect x={-140} y={58} width={280} height={34} fill={C.floorWood} opacity={0.6} />
      <line x1={-140} y1={58} x2={140} y2={58} stroke={C.ink} strokeWidth={3} />
      <rect x={70} y={-70} width={50} height={60} fill={C.nightSky} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      <DameSofa x={0} y={80} s={0.23} sink={sink} f={f}>
        <Person x={0} y={deep ? 30 : -100 + sink * 70} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark}
          face={sink > 0.3 ? "joy" : "smile"} pose={sink > 0.2 ? "stand" : "banzai"} still />
      </DameSofa>
      {deep && <circle cx={40} cy={-6} r={6} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />}
    </g>
  );
};
const Yw179: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 4, 40)));
  const click = 20;
  const cur = f < click ? easeInOut(seg(f, 2, click)) : 1;
  const cx = lerp(1300, 640, cur), cy = lerp(700, 612, cur);
  const press = f >= click && f < click + 4;
  const ringT = seg(f, click, click + 8);
  return (
    <Frame f={f} seed={3179} bg={C.nightWall}>
      <g transform={cam(960, 430, z)}>
        {/* 夜の部屋の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={900} fill={C.nightWall} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={-60} x2={i * 150} y2={760} stroke={YP.sofaDark} strokeWidth={3} opacity={0.18} />)}
        {/* 窓と夜空 */}
        <rect x={60} y={110} width={300} height={420} fill={C.nightSky} stroke={C.ink} strokeWidth={8} />
        <circle cx={270} cy={210} r={40} fill={KRP.cream} stroke={C.ink} strokeWidth={4} />
        <circle cx={286} cy={198} r={34} fill={C.nightSky} />
        {[[120, 180], [180, 300], [300, 420], [130, 470]].map(([sx, sy], i) => (
          <L4dSpark key={i} x={sx} y={sy} s={0.3 + 0.1 * Math.sin(f / 6 + i)} fill={KRP.cream} />
        ))}
        <line x1={210} y1={110} x2={210} y2={530} stroke={C.ink} strokeWidth={6} />
        <line x1={60} y1={320} x2={360} y2={320} stroke={C.ink} strokeWidth={6} />
        <path d={`M 40 96 L 40 560 Q ${90 + Math.sin(f / 14) * 6} 330 120 96 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        {/* 壁のカレンダー */}
        <g transform="translate(1560 130) rotate(3)">
          <rect x={0} y={0} width={190} height={220} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={0} y={0} width={190} height={52} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
          <text x={95} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>2013</text>
          {Array.from({ length: 20 }, (_, i) => <rect key={i} x={14 + (i % 5) * 34} y={68 + Math.floor(i / 5) * 36} width={24} height={22} fill={KRP.gray} opacity={0.4} />)}
        </g>
        <TagPlate x={1655} y={440} text="2013年" size={46} t={seg(f, 0, 8)} />
        <TagPlate x={1680} y={570} text="無印良品" size={40} t={seg(f, 4, 12)} rot={-3} />

        {/* 机 */}
        <rect x={-60} y={760} width={W + 120} height={400} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M -60 ${800 + i * 60} q 600 ${rnd(1791, i) * 20 - 10} 2040 0`} fill="none" stroke={YP.woodDark} strokeWidth={4} opacity={0.45} />)}
        {/* 電気スタンドと光 */}
        <path d="M 230 300 L 60 780 L 470 780 Z" fill={C.lampGlow} opacity={0.32 + Math.sin(f / 7) * 0.03} />
        <path d="M 170 770 L 170 520 L 260 330" fill="none" stroke={KRP.grayDark} strokeWidth={12} strokeLinecap="round" />
        <path d="M 200 300 L 320 260 L 310 350 Z" fill={KRP.green} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={170} cy={772} rx={60} ry={14} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        {/* マグと湯気 */}
        <rect x={1570} y={680} width={80} height={90} rx={10} fill={C.mug} stroke={C.ink} strokeWidth={5} />
        <path d="M 1650 700 q 34 0 30 30 q -4 26 -30 22" fill="none" stroke={C.ink} strokeWidth={5} />
        {[0, 1].map((i) => <path key={i} d={`M ${1594 + i * 28} 664 q ${10 * Math.sin(f / 5 + i)} -24 0 -48`} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.75} />)}
        {/* ノートと鉛筆 */}
        <g transform="translate(330 860) rotate(-8)">
          <rect x={0} y={0} width={220} height={150} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={16} y1={30 + i * 30} x2={200} y2={30 + i * 30} stroke={KRP.blueSoft} strokeWidth={3} />)}
          <rect x={150} y={60} width={130} height={16} rx={3} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} transform="rotate(-30 150 60)" />
        </g>
        {/* ===== ノートPC ===== */}
        <path d="M 360 760 L 1560 760 L 1620 812 L 300 812 Z" fill={KRP.gray} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={860} y={772} width={200} height={20} rx={6} fill={KRP.grayDark} opacity={0.5} />
        <rect x={410} y={100} width={1100} height={670} rx={26} fill={C.bezel} stroke={C.ink} strokeWidth={8} />
        <circle cx={960} cy={122} r={6} fill={KRP.grayDark} />
        <rect x={440} y={140} width={1040} height={600} fill={C.screen} stroke={C.ink} strokeWidth={4} />
        {/* ブラウザの枠 */}
        <rect x={440} y={140} width={1040} height={54} fill={C.chrome} />
        {[470, 500, 530].map((dx, i) => <circle key={i} cx={dx} cy={167} r={9} fill={[KRP.red, KRP.yellow, KRP.green][i]} stroke={C.ink} strokeWidth={2.5} />)}
        <rect x={570} y={152} width={800} height={30} rx={15} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        <rect x={590} y={162} width={300} height={10} rx={5} fill={KRP.gray} opacity={0.6} />
        {/* ブログの見出し帯 */}
        <rect x={440} y={194} width={1040} height={60} fill={C.blogHead} />
        <path d="M 470 240 L 470 216 L 486 204 L 502 216 L 502 240 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        <text x={520} y={238} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>ブログ</text>
        <text x={1450} y={236} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>2013</text>
        {/* 左: ソファの手描きイラスト (鉛筆のゆれた線) */}
        <g transform="translate(640 470)">
          <rect x={-180} y={-196} width={360} height={290} fill={KRP.cream} stroke={KRP.gray} strokeWidth={3} />
          <g transform="scale(0.5) translate(0 140)">
            <DameSofa x={0} y={0} s={1} sink={0.15} f={f} />
          </g>
          <path d="M -150 72 q 150 14 300 0" fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="6 6" />
          <text x={0} y={-162} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={23} fill={C.ink}>体にフィットするソファ</text>
        </g>
        {/* いいねボタン */}
        <g transform={`translate(640 640) scale(${press ? 0.9 : 1})`}>
          <rect x={-110} y={-34} width={220} height={68} rx={34} fill={f >= click ? C.heart : KRP.white} stroke={C.ink} strokeWidth={5} />
          <L4dHeart x={-58} y={2} s={0.8} fill={f >= click ? KRP.white : C.heart} />
          <text x={22} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={f >= click ? KRP.white : C.ink}>いいね</text>
        </g>
        {ringT > 0 && ringT < 1 && <circle cx={640} cy={640} r={60 + ringT * 90} fill="none" stroke={C.heart} strokeWidth={8 * (1 - ringT)} />}
        {/* 右: 4コマ (沈んでいく) */}
        <L4dKoma x={1000} y={380} sink={0} f={f} t={seg(f, 6, 12)} />
        <L4dKoma x={1300} y={380} sink={0.45} f={f} t={seg(f, 12, 18)} />
        <L4dKoma x={1000} y={590} sink={0.85} f={f} t={seg(f, 18, 24)} />
        <L4dKoma x={1300} y={590} sink={1} f={f} t={seg(f, 24, 30)} deep />
        {/* 湧いてくるハート (画面の外まであふれる) */}
        {Array.from({ length: 22 }, (_, i) => {
          const t0 = click + i * 1.1;
          const tt = (f - t0) / 22;
          if (tt <= 0 || tt > 1) return null;
          const ang = (rnd(1792, i) - 0.5) * 2.4;
          const dist = 120 + rnd(1793, i) * 420;
          const hx = 640 + Math.sin(ang) * dist * tt + Math.sin(f / 4 + i) * 8;
          const hy = 610 - Math.cos(ang) * dist * tt * 0.9 - tt * 120;
          return <L4dHeart key={i} x={hx} y={hy} s={0.5 + rnd(1794, i) * 0.6} op={1 - tt * tt} />;
        })}
        {/* カーソル */}
        <path transform={`translate(${cx + 20} ${cy + 10}) scale(${press ? 0.85 : 1})`}
          d="M 0 0 L 0 56 L 14 42 L 26 66 L 36 60 L 24 38 L 44 36 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* 横の人 (画面に身を乗り出す) */}
      <g transform={cam(960, 430, z)}>
        <Person x={1780} y={960} s={1.0} f={f} phase={2} cloth={C.lounge} clothDark={C.loungeDark}
          face={f >= 24 ? "joy" : "surprised"} pose="point" pointDir={-1} lean={-8 * easeOut(seg(f, 6, 20))} gaze={[-8, -2]} />
      </g>
    </Frame>
  );
};

// ---- 文#180 【山】 ついたあだ名が、そう、「人をダメにするソファ」です。
// 設計: ★序の #7・#8 と同じリビング・同じ `DameSofa`・同じ部屋着の大人が沈んでいる。吊るされた木札「人をダメにするソファ」(序と同じ見た目)。3度目の登場なので、木札が f でぴかっと光る
// どこ: 序 #7・#8 と同じリビング (同じ壁色・窓とカーテン・木の床・天井の梁)。#8 と同じ寄りの構図
// 演出: 同じ DameSofa に同じ部屋着の大人がすっかり沈んで寝ている (片手だけふちから出る・Zzz)。
//       天井の梁から吊るした同じ木札「人をダメにするソファ」が、3度目の登場なので f でぴかっと光る (光の帯が走り、後光と星が出る)
// 動き: 札はゆっくり揺れている / f16〜26 光の帯が札を横切る / f22〜 後光が脈打ち、星がきらめく / Zzz が上がる / 寝息でソファがふくらむ / カメラはゆっくり寄る
const L4dLiving: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-80} y={-80} width={W + 160} height={900} fill={C.livingWall} />
    {/* 窓とカーテン */}
    <rect x={1180} y={200} width={380} height={360} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={7} />
    <path d="M 1180 470 Q 1300 420 1420 470 Q 1500 500 1560 460 L 1560 560 L 1180 560 Z" fill={C.hill} opacity={0.7} />
    <line x1={1370} y1={200} x2={1370} y2={560} stroke={C.ink} strokeWidth={6} />
    <line x1={1180} y1={380} x2={1560} y2={380} stroke={C.ink} strokeWidth={6} />
    <path d={`M 1150 180 L 1150 590 Q ${1205 + Math.sin(f / 16) * 6} 400 1240 180 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
    <path d={`M 1590 180 L 1590 590 Q ${1535 + Math.sin(f / 16 + 1) * 6} 400 1500 180 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
    <path d="M 1170 220 L 1170 560 M 1570 220 L 1570 560" stroke={C.curtainDark} strokeWidth={4} />
    <rect x={1130} y={170} width={480} height={16} rx={6} fill={C.tvStand} stroke={C.ink} strokeWidth={4} />
    {/* 額の絵 */}
    <rect x={330} y={260} width={200} height={160} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
    <path d="M 350 400 L 410 320 L 450 370 L 480 340 L 510 400 Z" fill={C.hill} stroke={C.ink} strokeWidth={3} />
    <circle cx={480} cy={300} r={14} fill={KRP.yellow} />
    {/* 幅木と床 */}
    <rect x={-80} y={740} width={W + 160} height={24} fill={C.tvStand} stroke={C.ink} strokeWidth={5} />
    <rect x={-80} y={764} width={W + 160} height={400} fill={C.floorWood} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-80 + i * 180} y1={764} x2={-80 + i * 180 - 60} y2={1160} stroke={C.floorWoodDark} strokeWidth={4} />)}
    {/* 観葉植物 */}
    <path d="M 1700 760 L 1680 640 L 1800 640 L 1780 760 Z" fill={C.rug} stroke={C.ink} strokeWidth={5} />
    {[-40, -10, 20, 50].map((a, i) => (
      <path key={i} d={`M 1740 640 Q ${1740 + a * 2} ${540 - i * 10} ${1740 + a * 3 + Math.sin(f / 12 + i) * 5} ${470 + (i % 2) * 30}`}
        fill="none" stroke={i % 2 ? C.plant : C.plantDark} strokeWidth={16} strokeLinecap="round" />
    ))}
  </g>
);
const Yw180: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const sw = Math.sin(f / 9) * 2.2;
  const label = "人をダメにするソファ";
  const bw = label.length * 76 + 90;
  const handX = 960 + 150 * 1.7, handY = 1080 + 1.7 * (-240 - 10);
  const sweep = seg(f, 16, 28);
  const glow = seg(f, 20, 30) * (0.85 + Math.sin(f / 3) * 0.15);
  const burst = seg(f, 20, 34);
  return (
    <Frame f={f} seed={3180} bg={C.livingWall}>
      <g transform={cam(960, 500, z)}>
        <g transform="translate(960 560) scale(1.5) translate(-960 -560)">
          <L4dLiving f={f} />
        </g>
        {/* ラグ */}
        <ellipse cx={960} cy={1090} rx={820} ry={80} fill={C.rug} stroke={C.ink} strokeWidth={6} />
        {/* ソファ (寄り) */}
        <DameSofa x={960} y={1080} s={1.7} sink={1} f={f}>
          <Person x={0} y={-30} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark} face="joy" still />
        </DameSofa>
        {/* だらりと出た片手 */}
        <rect x={handX - 18} y={handY - 96} width={40} height={120} rx={20} fill={C.lounge} stroke={C.ink} strokeWidth={6}
          transform={`rotate(${56 + Math.sin(f / 18) * 3} ${handX} ${handY})`} />
        <circle cx={handX + 98} cy={handY - 60} r={22} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {/* 床に落ちたリモコン */}
        <g transform="translate(1660 1030) rotate(200)">
          <rect x={-16} y={-46} width={32} height={92} rx={10} fill={C.remote} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={-28} r={6} fill={KRP.red} />
        </g>
        {/* Zzz */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={1060 + t * 90 + i * 10} y={600 - t * 160} fontFamily={FONT} fontWeight={900}
              fontSize={44 + i * 12} fill={KRP.blueDeep} opacity={Math.sin(t * Math.PI)} stroke={C.ink} strokeWidth={2} paintOrder="stroke">Z</text>
          );
        })}
        {/* 天井の梁 */}
        <rect x={-40} y={-40} width={W + 80} height={96} fill={C.tvStand} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 210} y1={10} x2={i * 210 + 120} y2={10} stroke={C.ink} strokeWidth={3} opacity={0.3} />)}
        {/* 後光 (札の後ろ) */}
        {glow > 0 && (
          <g opacity={glow}>
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2 + f / 40;
              const r0 = 300, r1 = 300 + 120 * burst + (i % 2) * 60;
              return <line key={i} x1={960 + Math.cos(a) * r0 * 1.5} y1={198 + Math.sin(a) * r0 * 0.5} x2={960 + Math.cos(a) * r1 * 1.6} y2={198 + Math.sin(a) * r1 * 0.62}
                stroke={YP.glow} strokeWidth={14} strokeLinecap="round" />;
            })}
            <rect x={960 - bw / 2 - 40} y={80} width={bw + 80} height={236} rx={40} fill={YP.glow} opacity={0.45} />
          </g>
        )}
        {/* 吊るした木の板 (序と同じ見た目) */}
        <g transform={`rotate(${sw} 960 0)`}>
          <defs>
            <clipPath id="l4dBoard180"><rect x={960 - bw / 2} y={110} width={bw} height={176} rx={14} /></clipPath>
          </defs>
          <line x1={960 - bw / 2 + 50} y1={-600} x2={960 - bw / 2 + 50} y2={120} stroke={C.ink} strokeWidth={5} />
          <line x1={960 + bw / 2 - 50} y1={-600} x2={960 + bw / 2 - 50} y2={120} stroke={C.ink} strokeWidth={5} />
          <rect x={960 - bw / 2} y={110} width={bw} height={176} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={8} />
          <rect x={960 - bw / 2 + 14} y={124} width={bw - 28} height={148} rx={8} fill={glow > 0 ? YP.glowCore : C.boxTop} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${960 - bw / 2 + 30} ${160 + i * 38} q ${bw / 4} ${-10 + i * 6} ${bw / 2} 0 q ${bw / 4} ${8 - i * 5} ${bw / 2 - 60} 0`}
              fill="none" stroke={YP.woodDark} strokeWidth={3} opacity={0.35} />
          ))}
          {[-1, 1].map((d) => <circle key={d} cx={960 + d * (bw / 2 - 50)} cy={124} r={10} fill={YP.brass} stroke={C.ink} strokeWidth={3} />)}
          {/* 光の帯が横切る */}
          {sweep > 0 && sweep < 1 && (
            <g clipPath="url(#l4dBoard180)">
              <path d={`M ${lerp(960 - bw / 2 - 200, 960 + bw / 2 + 100, sweep)} 100 l 120 0 l -100 200 l -120 0 Z`} fill={KRP.white} opacity={0.85} />
              <path d={`M ${lerp(960 - bw / 2 - 200, 960 + bw / 2 + 100, sweep) + 150} 100 l 40 0 l -100 200 l -40 0 Z`} fill={KRP.white} opacity={0.6} />
            </g>
          )}
          <text x={960} y={226} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={C.ink}>{label}</text>
        </g>
        {/* 星のきらめき */}
        {f >= 22 && [[960 - bw / 2 - 30, 130], [960 + bw / 2 + 20, 120], [960 + bw / 2 - 40, 300], [960 - bw / 2 + 60, 310], [960, 70]].map(([sx, sy], i) => (
          <L4dSpark key={i} x={sx} y={sy} s={pop(seg(f, 22 + i * 2, 30 + i * 2)) * (0.9 + Math.sin(f / 3 + i) * 0.25)} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#181 【山】 翌年の2014年には、アメリカ生まれのヨギボーが、日本に上陸します。
// 設計: 港に着いた大きな貨物船から、大きな袋のソファ (長いまくら形・明るい色) がクレーンでつり下ろされる。日本の港の街並み。札「2014年」「ヨギボー」(ロゴは描かない)
// どこ: 日本の港の岸壁。向こう岸に瓦屋根の家並み・緑の山・赤い灯台。岸壁に日の丸。左に船尾に星条旗の大きな貨物船 (コンテナ山積み)
// 演出: 赤白の門形クレーンが、船の上から長いまくら形の大きな袋のソファ (明るい水色) をつり上げて岸壁へ運び、そっと下ろす。
//       着地でぽよんと潰れて弾む。港の作業員2人が指さし・ばんざいで迎える。カモメが飛ぶ
// 動き: f2〜20 トロリーが右へ走り袋が振り子のように揺れる / f20〜37 下りる / f37〜 着地でぽよん (f45 でまだ弾んでいる) / 波・旗・カモメ / カメラはゆっくり着地点に寄る
const L4dFlagUS: React.FC<{ x: number; y: number; w: number; h: number; f: number }> = ({ x, y, w, h, f }) => {
  const wave = (i: number) => Math.sin(f / 5 + i * 0.9) * h * 0.04;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={0} y={(i * h) / 7 + wave(i)} width={w} height={h / 7 + 1} fill={i % 2 ? KRP.white : KRP.red} />
      ))}
      <rect x={0} y={wave(0)} width={w * 0.45} height={h * 0.55} fill={C.usBlue} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={w * 0.08 + (i % 3) * w * 0.14} cy={h * 0.14 + Math.floor(i / 3) * h * 0.24 + wave(0)} r={w * 0.025} fill={KRP.white} />)}
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
const L4dYogi: React.FC<{ x: number; y: number; sx?: number; sy?: number; rot?: number }> = ({ x, y, sx = 1, sy = 1, rot = 0 }) => (
  // x,y は袋の底の中心。幅 300 × 高さ 115 (長さ 約170cm)
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sx} ${sy})`}>
    <path d="M -150 -14 Q -162 -112 -100 -116 Q 0 -124 100 -116 Q 162 -112 150 -14 Q 140 4 0 4 Q -140 4 -150 -14 Z"
      fill={C.yogi} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -100 -116 Q -126 -60 -100 2 M 100 -116 Q 126 -60 100 2" fill="none" stroke={C.yogiDark} strokeWidth={4.5} strokeDasharray="10 8" />
    <path d="M -120 -86 Q -60 -104 20 -100" fill="none" stroke={C.yogiShine} strokeWidth={12} strokeLinecap="round" opacity={0.85} />
    <path d="M -40 -40 q 20 10 40 0 M 30 -52 q 18 10 36 0" fill="none" stroke={C.yogiDark} strokeWidth={4} strokeLinecap="round" />
    <rect x={138} y={-70} width={22} height={34} rx={5} fill={C.yogiDark} stroke={C.ink} strokeWidth={3.5} />
  </g>
);
const Yw181: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.1, easeInOut(seg(f, 6, 42)));
  const move = easeInOut(seg(f, 2, 20));
  const tx = lerp(800, 1400, move);
  const vel = seg(f, 2, 20) > 0 && seg(f, 2, 20) < 1 ? Math.sin(seg(f, 2, 20) * Math.PI) : 0;
  const swing = -vel * 9 + (f > 20 ? Math.sin((f - 20) / 2.6) * 6 * Math.exp(-(f - 20) / 8) : 0);
  const down = easeInOut(seg(f, 20, 37));
  const by = lerp(480, 800, down); // 袋の底
  const landed = f >= 37;
  const sq = landed ? Math.sin((f - 37) / 2.2 + Math.PI / 2) * Math.exp(-(f - 37) / 9) : 0;
  const ssx = 1 + 0.14 * Math.max(0, sq) - 0.05 * Math.max(0, -sq);
  const ssy = 1 - 0.2 * Math.max(0, sq) + 0.07 * Math.max(0, -sq);
  const hookY = by - 200;
  const K = 1.3; // 袋の大きさ (人 s1.15 に合わせる)
  return (
    <Frame f={f} seed={3181} bg={C.portSky}>
      <g transform={cam(1250, 620, z)}>
        {/* 空と雲 */}
        <rect x={-80} y={-80} width={W + 160} height={700} fill={C.portSky} />
        {[[300, 120, 1], [1000, 70, 0.8], [1650, 150, 0.9]].map(([cx0, cy0, s], i) => (
          <g key={i} transform={`translate(${cx0 + f * 0.6} ${cy0}) scale(${s})`}>
            <path d="M -110 20 Q -120 -20 -70 -24 Q -50 -60 0 -50 Q 40 -70 70 -30 Q 120 -30 110 20 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 向こう岸: 山・家並み・灯台 */}
        <path d="M 900 470 Q 1100 280 1320 380 Q 1500 240 1720 360 Q 1860 300 2000 380 L 2000 520 L 900 520 Z" fill={C.hill} stroke={C.ink} strokeWidth={5} />
        <path d="M 1000 470 Q 1200 390 1400 440" fill="none" stroke={C.hillDark} strokeWidth={5} />
        {Array.from({ length: 11 }, (_, i) => {
          const hx = 1000 + i * 90, hh = 46 + (i % 3) * 14;
          return (
            <g key={i}>
              <rect x={hx} y={520 - hh} width={72} height={hh} fill={C.houseWall} stroke={C.ink} strokeWidth={3.5} />
              <path d={`M ${hx - 10} ${522 - hh} L ${hx + 36} ${500 - hh} L ${hx + 82} ${522 - hh} Z`} fill={C.roofTile} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
              <rect x={hx + 14} y={530 - hh + 10} width={16} height={14} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={2} />
            </g>
          );
        })}
        {/* 山の上の鳥居 */}
        <g transform="translate(1560 330)" stroke={C.ink} strokeWidth={3}>
          <rect x={-30} y={-6} width={60} height={10} fill={KRP.red} />
          <rect x={-22} y={4} width={7} height={34} fill={KRP.red} />
          <rect x={15} y={4} width={7} height={34} fill={KRP.red} />
        </g>
        <g transform="translate(1880 470)">
          <rect x={-18} y={-110} width={36} height={110} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => <rect key={i} x={-18} y={-100 + i * 34} width={36} height={14} fill={KRP.red} />)}
          <rect x={-24} y={-134} width={48} height={26} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 海 */}
        <rect x={-80} y={500} width={W + 160} height={160} fill={C.sea} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${((i * 170 + f * 3) % 2100) - 100} ${530 + (i % 3) * 36} q 20 -10 40 0 q 20 10 40 0`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
        ))}
        {/* ===== 貨物船 ===== */}
        <g transform={`translate(0 ${Math.sin(f / 10) * 4})`}>
          <path d="M 60 400 L 1140 400 L 1100 640 L 120 640 Z" fill={C.hull} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <rect x={110} y={590} width={1000} height={50} fill={C.hullRed} />
          <line x1={70} y1={430} x2={1135} y2={430} stroke={KRP.white} strokeWidth={6} />
          {/* コンテナ */}
          {Array.from({ length: 3 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
            if (r === 2 && (c === 3 || c === 4)) return null;
            const col = [C.crate1, C.crate2, C.crate3, C.crate4][(r * 3 + c * 2) % 4];
            return (
              <g key={`${r}-${c}`}>
                <rect x={330 + c * 86} y={340 - r * 60} width={82} height={58} fill={col} stroke={C.ink} strokeWidth={4} />
                {[1, 2, 3].map((k) => <line key={k} x1={330 + c * 86 + k * 20} y1={346 - r * 60} x2={330 + c * 86 + k * 20} y2={392 - r * 60} stroke={C.ink} strokeWidth={2} opacity={0.35} />)}
              </g>
            );
          }))}
          {/* 船橋と煙突 */}
          <rect x={110} y={210} width={190} height={190} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          {[0, 1, 2].map((i) => <rect key={i} x={126 + i * 58} y={236} width={44} height={30} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />)}
          <rect x={90} y={196} width={230} height={20} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={220} y={130} width={56} height={70} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
          {[0, 1].map((i) => <circle key={i} cx={250 + Math.sin(f / 6 + i) * 8 + i * 20} cy={110 - i * 40 - (f % 20)} r={18 + i * 8} fill={KRP.gray} opacity={0.5} />)}
          {/* 船尾の星条旗 */}
          <line x1={74} y1={400} x2={74} y2={250} stroke={C.ink} strokeWidth={6} />
          <L4dFlagUS x={76} y={254} w={120} h={76} f={f} />
        </g>
        {/* 岸壁 */}
        <rect x={-80} y={640} width={W + 160} height={500} fill={C.concrete} stroke={C.ink} strokeWidth={7} />
        <rect x={-80} y={640} width={W + 160} height={26} fill={C.concreteDark} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={666} x2={i * 240 - 80} y2={1100} stroke={C.concreteDark} strokeWidth={4} opacity={0.6} />)}
        {[200, 700].map((bx) => (
          <g key={bx}>
            <rect x={bx - 22} y={620} width={44} height={36} rx={8} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
            <path d={`M ${bx} 630 Q ${bx - 80} 560 ${bx - 140} 600`} fill="none" stroke={KRP.grayDark} strokeWidth={5} />
          </g>
        ))}
        {/* クレーンのレール・黄色い安全線・パレットとコーン */}
        {[700, 760].map((ry) => <line key={ry} x1={-80} y1={ry} x2={W + 80} y2={ry} stroke={KRP.grayDark} strokeWidth={8} />)}
        <line x1={-80} y1={900} x2={W + 80} y2={900} stroke={KRP.yellow} strokeWidth={14} strokeDasharray="80 40" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${150 + i * 10} ${880 - i * 34})`}>
            <rect x={0} y={0} width={200} height={34} fill={YP.wood} stroke={C.ink} strokeWidth={4} />
            {[20, 90, 160].map((px) => <rect key={px} x={px} y={10} width={22} height={24} fill={YP.woodDark} />)}
          </g>
        ))}
        {[520, 640].map((cx0, i) => (
          <g key={cx0} transform={`translate(${cx0} ${880 + i * 20})`}>
            <path d="M -30 0 L -10 -80 L 10 -80 L 30 0 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
            <rect x={-18} y={-50} width={36} height={14} fill={KRP.white} />
            <rect x={-40} y={-4} width={80} height={12} rx={3} fill={KRP.grayDark} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 日の丸 */}
        <line x1={1700} y1={640} x2={1700} y2={380} stroke={C.ink} strokeWidth={7} />
        <g transform={`translate(1704 390) skewY(${Math.sin(f / 6) * 3})`}>
          <rect x={0} y={0} width={110} height={74} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <circle cx={55} cy={37} r={22} fill={KRP.red} />
        </g>
        {/* ===== 門形クレーン ===== */}
        {[1170, 1640].map((lx) => (
          <g key={lx}>
            <rect x={lx - 20} y={230} width={40} height={430} fill={KRP.red} stroke={C.ink} strokeWidth={6} />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={lx - 20} y={260 + i * 70} width={40} height={30} fill={KRP.white} opacity={0.85} />)}
            <rect x={lx - 50} y={650} width={100} height={30} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        <path d="M 1190 600 L 1620 300 M 1190 300 L 1620 600" stroke={KRP.red} strokeWidth={10} opacity={0.5} />
        <rect x={640} y={200} width={1140} height={44} fill={KRP.red} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 19 }, (_, i) => <line key={i} x1={660 + i * 60} y1={200} x2={690 + i * 60} y2={244} stroke={KRP.white} strokeWidth={5} />)}
        <rect x={1460} y={140} width={200} height={62} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <rect x={1480} y={156} width={60} height={30} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />
        <ellipse cx={tx} cy={806} rx={200 * (0.5 + down * 0.5)} ry={16} fill={C.ink} opacity={0.08 + 0.14 * down} />
        {/* トロリーとワイヤー */}
        <rect x={tx - 50} y={238} width={100} height={36} rx={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${swing} ${tx} 274)`}>
          <line x1={tx - 20} y1={274} x2={tx - 6} y2={hookY} stroke={C.ink} strokeWidth={4} />
          <line x1={tx + 20} y1={274} x2={tx + 6} y2={hookY} stroke={C.ink} strokeWidth={4} />
          <path d={`M ${tx} ${hookY} q 0 30 -16 30`} fill="none" stroke={KRP.grayDark} strokeWidth={9} strokeLinecap="round" />
          <rect x={tx - 16} y={hookY - 20} width={32} height={24} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          {/* 吊り帯 */}
          <path d={`M ${tx} ${hookY + 26} L ${tx - 100 * K} ${by - 112 * K * ssy} M ${tx} ${hookY + 26} L ${tx + 100 * K} ${by - 112 * K * ssy}`} stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" />
          {/* 袋の影 (着地が近いほど濃い) */}
          <L4dYogi x={tx} y={by} sx={ssx * K} sy={ssy * K} />
          <path d={`M ${tx - 100 * K * ssx} ${by - 116 * K * ssy} L ${tx - 100 * K * ssx} ${by} M ${tx + 100 * K * ssx} ${by - 116 * K * ssy} L ${tx + 100 * K * ssx} ${by}`} stroke={KRP.orange} strokeWidth={9} opacity={0.9} />
        </g>
        {/* 着地のぽよん */}
        {landed && f < 48 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" opacity={1 - seg(f, 37, 42) * 0.6}>
            <path d={`M ${tx - 240} 790 q -30 -10 -50 -40`} />
            <path d={`M ${tx - 250} 810 q -40 0 -60 -10`} />
            <path d={`M ${tx + 240} 790 q 30 -10 50 -40`} />
            <path d={`M ${tx + 250} 810 q 40 0 60 -10`} />
          </g>
        )}
        <TagPlate x={1250} y={500} text="ヨギボー" size={44} t={seg(f, 30, 38)} rot={-4} />
        <TagPlate x={960} y={100} text="2014年" size={50} t={seg(f, 0, 8)} />
        {/* カモメ */}
        {[0, 1, 2].map((i) => {
          const gx = ((f * (4 + i) + i * 500) % 2000) - 40, gy = 140 + i * 50 + Math.sin(f / 5 + i) * 10;
          const wv = Math.sin(f / 2 + i) * 10;
          return <path key={i} d={`M ${gx - 26} ${gy - wv} Q ${gx - 12} ${gy - 16} ${gx} ${gy} Q ${gx + 12} ${gy - 16} ${gx + 26} ${gy - wv}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
        })}
        {/* 作業員2人 */}
        <ellipse cx={960} cy={824} rx={70} ry={12} fill={C.ink} opacity={0.18} />
        <Person x={960} y={820} s={1.15} f={f} phase={1} helmet cloth={C.vest} clothDark={C.vestDark}
          face={landed ? "joy" : "surprised"} pose="point" pointDir={1} gaze={[6, -4]} />
        <ellipse cx={1800} cy={824} rx={70} ry={12} fill={C.ink} opacity={0.18} />
        <Person x={1810} y={820} s={1.15} f={f} phase={5} helmet cloth={C.vest} clothDark={C.vestDark}
          face={landed ? "joy" : "smile"} pose={landed ? "banzai" : "raise"} gaze={[-6, -2]} />
      </g>
    </Frame>
  );
};

// ---- 文#182 【山】 海の向こうでは、ぬいぐるみのスクイッシュマロウが、2022年だけで、およそ1億個も売れました。
// 設計: アメリカの大きなおもちゃ屋の棚。丸くてもちもちのぬいぐるみ (ロゴなし・丸いマシュマロ形に顔) が天井まで山積み。店の前に行列。カウンタ「約1億個」がカタカタ回る。アメリカの国旗。札「2022年」
// どこ: アメリカの街角の大きなおもちゃ屋の店先 (レンガの壁・しま模様の日よけ・「TOYS」の看板・星条旗・歩道と街灯)
// 演出: 大きなショーウィンドウの中は、丸いマシュマロ形のぬいぐるみが天井まで山積み (下の段から順にぽんぽん埋まる)。
//       店の前には行列 (右の画面外まで続く)。看板の横の回転カウンタがカタカタ回って 100,000,000 で止まり「約1億個」。
//       先頭の人がぬいぐるみを受け取ってぎゅっと抱く。左では買った人がうれしそうに帰っていく
// 動き: f2〜30 棚が埋まる / f4〜36 カウンタが回る → f36 止まって札 / f28 先頭の人の腕にぬいぐるみ / 旗がはためく / カメラはゆっくり右へパン
const L4dMallow: React.FC<{ x: number; y: number; w: number; c: string; f?: number; ph?: number; rot?: number; t?: number }> = ({
  x, y, w, c, f = 0, ph = 0, rot = 0, t = 1,
}) => {
  if (t <= 0) return null;
  const h = w * 0.86;
  const jig = Math.sin(f / 4 + ph) * 0.02;
  const sc = pop(clamp01(t));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc * (1 + jig)} ${sc * (1 - jig)})`}>
      <path d={`M ${-w / 2} ${-h * 0.18} Q ${-w / 2} ${-h} 0 ${-h} Q ${w / 2} ${-h} ${w / 2} ${-h * 0.18} Q ${w / 2} 0 0 0 Q ${-w / 2} 0 ${-w / 2} ${-h * 0.18} Z`}
        fill={c} stroke={C.ink} strokeWidth={Math.max(2.5, w * 0.06)} strokeLinejoin="round" />
      <ellipse cx={-w * 0.16} cy={-h * 0.8} rx={w * 0.16} ry={h * 0.07} fill={KRP.white} opacity={0.6} />
      <circle cx={-w * 0.15} cy={-h * 0.48} r={w * 0.045} fill={C.ink} />
      <circle cx={w * 0.15} cy={-h * 0.48} r={w * 0.045} fill={C.ink} />
      <path d={`M ${-w * 0.06} ${-h * 0.36} Q 0 ${-h * 0.3} ${w * 0.06} ${-h * 0.36}`} fill="none" stroke={C.ink} strokeWidth={Math.max(2, w * 0.035)} strokeLinecap="round" />
      <ellipse cx={-w * 0.27} cy={-h * 0.38} rx={w * 0.08} ry={w * 0.045} fill={KRP.red} opacity={0.35} />
      <ellipse cx={w * 0.27} cy={-h * 0.38} rx={w * 0.08} ry={w * 0.045} fill={KRP.red} opacity={0.35} />
    </g>
  );
};
const L4dMC = [C.m1, C.m2, C.m3, C.m4, C.m5, C.m6];
const L4dShopWindow: React.FC<{ x0: number; f: number; seed: number }> = ({ x0, f, seed }) => {
  const rows = 6, cols = 10, ww = 660;
  return (
    <g>
      <rect x={x0} y={250} width={ww} height={470} fill={C.storeIn} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: rows }, (_, r) => {
        const sy = 712 - r * 78;
        return (
          <g key={r}>
            <rect x={x0 + 6} y={sy} width={ww - 12} height={10} fill={YP.wood} stroke={C.ink} strokeWidth={3} />
            {Array.from({ length: cols }, (_, c) => {
              const idx = r * cols + c;
              const t = seg(f, 2 + r * 4 + rnd(seed, idx) * 4, 8 + r * 4 + rnd(seed, idx) * 4);
              const w = 58 + rnd(seed + 1, idx) * 14;
              return <L4dMallow key={c} x={x0 + 36 + c * 65 + (r % 2) * 10} y={sy} w={w} c={L4dMC[(idx * 7 + r) % 6]} f={f} ph={idx} rot={(rnd(seed + 2, idx) - 0.5) * 14} t={t} />;
            })}
          </g>
        );
      })}
      {/* ガラスの映り込み */}
      <path d={`M ${x0 + 60 + (f % 42) * 6} 250 l 60 0 l -160 470 l -60 0 Z`} fill={KRP.white} opacity={0.18} />
      <rect x={x0} y={250} width={ww} height={470} fill="none" stroke={C.ink} strokeWidth={8} />
    </g>
  );
};
const Yw182: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const cnt = Math.round(1e8 * easeOut(seg(f, 4, 36)));
  const stopped = f >= 36;
  const digitH = 80;
  const people = [
    { x: 1100, c: KRP.blue, d: KRP.blueDeep, face: "joy" as const, pose: "hold" as const },
    { x: 1235, c: KRP.green, d: "#3F7A4A", face: "smile" as const, pose: "stand" as const },
    { x: 1365, c: C.crate3, d: C.vestDark, face: "surprised" as const, pose: "point" as const },
    { x: 1495, c: C.m3, d: C.pillowDark, face: "smile" as const, pose: "stand" as const },
    { x: 1625, c: C.crate1, d: C.brickDark, face: "joy" as const, pose: "raise" as const },
    { x: 1755, c: C.yogi, d: C.yogiDark, face: "smile" as const, pose: "stand" as const },
    { x: 1885, c: KRP.grayDark, d: C.ink, face: "normal" as const, pose: "armsFolded" as const },
  ];
  return (
    <Frame f={f} seed={3182} bg={C.portSky}>
      <g transform={`translate(${pan} 0)`}>
        {/* 空 */}
        <rect x={-120} y={-60} width={W + 240} height={300} fill={C.portSky} />
        {/* レンガの壁 */}
        <rect x={-120} y={20} width={W + 240} height={800} fill={C.brick} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 20 }, (_, r) => (
          <g key={r}>
            <line x1={-120} y1={40 + r * 40} x2={W + 120} y2={40 + r * 40} stroke={C.brickDark} strokeWidth={3} opacity={0.5} />
            {Array.from({ length: 22 }, (_, c) => <line key={c} x1={-100 + c * 100 + (r % 2) * 50} y1={40 + r * 40} x2={-100 + c * 100 + (r % 2) * 50} y2={80 + r * 40} stroke={C.brickDark} strokeWidth={3} opacity={0.5} />)}
          </g>
        ))}
        {/* 看板 TOYS */}
        <rect x={470} y={56} width={500} height={120} rx={14} fill={KRP.cream} stroke={C.ink} strokeWidth={7} />
        {["T", "O", "Y", "S"].map((ch, i) => (
          <text key={i} x={560 + i * 108} y={150 + Math.sin(f / 5 + i) * 4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100}
            fill={[KRP.red, KRP.blue, KRP.yellow, KRP.green][i]} stroke={C.ink} strokeWidth={5} paintOrder="stroke">{ch}</text>
        ))}
        {/* 回転カウンタ */}
        <g transform="translate(1010 56)">
          <rect x={0} y={0} width={820} height={130} rx={14} fill={C.counterBg} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 9 }, (_, i) => {
            const p = 8 - i; // 桁
            const gx = 30 + i * 84 + Math.floor(i / 3) * 18;
            const v = cnt / Math.pow(10, p);
            const dgt = Math.floor(v) % 10;
            const frac = stopped ? 0 : p < 6 ? (v - Math.floor(v)) : 0;
            return (
              <g key={i}>
                <defs><clipPath id={`l4dDg182_${i}`}><rect x={gx} y={22} width={70} height={86} rx={6} /></clipPath></defs>
                <rect x={gx} y={22} width={70} height={86} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
                <g clipPath={`url(#l4dDg182_${i})`}>
                  {[0, 1].map((k) => (
                    <text key={k} x={gx + 35} y={94 - frac * digitH + k * digitH} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70}
                      fill={i === 0 && stopped ? KRP.red : C.ink}>{(dgt + k) % 10}</text>
                  ))}
                </g>
                <line x1={gx} y1={65} x2={gx + 70} y2={65} stroke={C.ink} strokeWidth={2} opacity={0.3} />
                {i % 3 === 2 && i < 8 && <circle cx={gx + 80} cy={104} r={5} fill={KRP.white} />}
              </g>
            );
          })}
          {/* 回っている間のカタカタ線 */}
          {!stopped && [0, 1, 2].map((k) => (
            <path key={k} d={`M ${830 + k * 10} ${30 + k * 30} l 24 ${-8 + (f % 2) * 16}`} stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
        {stopped && [0, 1, 2, 3].map((i) => <L4dSpark key={i} x={1010 + [20, 800, 40, 820][i]} y={56 + [0, 0, 130, 130][i]} s={pop(seg(f, 36 + i, 42)) * 0.9} />)}
        {/* 日よけ (しま) */}
        {[100, 1120].map((ax) => (
          <g key={ax}>
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d={`M ${ax + i * 70} 196 L ${ax + i * 70 + 70} 196 L ${ax + i * 70 + 70} 236 Q ${ax + i * 70 + 35} ${252 + Math.sin(f / 5 + i) * 3} ${ax + i * 70} 236 Z`}
                fill={i % 2 ? KRP.white : KRP.red} stroke={C.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* ショーウィンドウ2つ */}
        <L4dShopWindow x0={130} f={f} seed={1821} />
        <L4dShopWindow x0={1150} f={f} seed={1822} />
        {/* 入口 */}
        <rect x={850} y={250} width={240} height={530} fill={C.storeIn} stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
          <L4dMallow key={`${r}-${c}`} x={900 + c * 70} y={760 - r * 66} w={64} c={L4dMC[(r + c * 2) % 6]} f={f} ph={r * 3 + c} t={seg(f, 4 + r * 5, 10 + r * 5)} />
        )))}
        <rect x={860} y={260} width={110} height={510} fill={KRP.blueSoft} opacity={0.22} stroke={C.ink} strokeWidth={4} />
        <rect x={970} y={260} width={110} height={510} fill={KRP.blueSoft} opacity={0.22} stroke={C.ink} strokeWidth={4} />
        <rect x={880} y={300} width={180} height={50} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <text x={970} y={337} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.green}>OPEN</text>
        {/* 星条旗 */}
        <rect x={56} y={170} width={14} height={790} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <circle cx={63} cy={166} r={12} fill={YP.brass} stroke={C.ink} strokeWidth={4} />
        <L4dFlagUS x={70} y={186} w={200} h={126} f={f} />
        <TagPlate x={480} y={300} text="2022年" size={48} t={seg(f, 0, 8)} />
        <TagPlate x={1420} y={300} text="約1億個" size={54} t={seg(f, 36, 42)} />
        {/* 歩道 */}
        <rect x={-120} y={780} width={W + 240} height={400} fill={C.sidewalk} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={780} x2={i * 180 - 70} y2={1100} stroke={C.sidewalkDark} strokeWidth={4} />)}
        <rect x={-120} y={1000} width={W + 240} height={24} fill={C.sidewalkDark} stroke={C.ink} strokeWidth={4} />
        {/* 街灯 */}

        {/* 買って帰る2人 (左) */}
        <Person x={330} y={940} s={0.88} f={f} phase={3} face="joy" pose="hold" cloth={C.m5} clothDark={C.cushionDark} gaze={[-6, 0]} lean={-4} />
        <L4dMallow x={330} y={940 - 108 * 0.88 + 40} w={96} c={C.m2} f={f} ph={2} />
        <Person x={560} y={950} s={0.84} f={f} phase={7} face="smile" pose="hold" cloth={C.usBlue} clothDark={C.ink} gaze={[-6, 0]} />
        <L4dMallow x={560} y={950 - 108 * 0.84 + 40} w={86} c={C.m4} f={f} ph={5} />
        {/* 行列 (右の画面外まで続く) */}
        {people.map((p, i) => (
          <g key={i}>
            <ellipse cx={p.x} cy={952} rx={58} ry={10} fill={C.ink} opacity={0.16} />
            <Person x={p.x} y={948} s={0.86} f={f} phase={i * 2} face={p.face} pose={p.pose} pointDir={-1}
              cloth={p.c} clothDark={p.d} gaze={[-6, -1]} lean={Math.sin(f / 11 + i) * 2} />
          </g>
        ))}
        {/* 先頭の人が受け取ったぬいぐるみ */}
        <L4dMallow x={1100} y={948 - 108 * 0.86 + 40} w={100} c={C.m1} f={f} ph={9} t={seg(f, 26, 32)} />
        {f >= 30 && <L4dHeart x={1170 + Math.sin(f / 4) * 6} y={720 - seg(f, 30, 42) * 50} s={0.8} op={1 - seg(f, 36, 42) * 0.5} />}
        {/* 行列の誘導ロープ */}
        <line x1={1040} y1={870} x2={1960} y2={870} stroke={KRP.red} strokeWidth={8} />
        {[1040, 1300, 1560, 1820].map((px) => <rect key={px} x={px - 8} y={860} width={16} height={110} fill={YP.brass} stroke={C.ink} strokeWidth={4} />)}
      </g>
    </Frame>
  );
};

// ---- 文#183 【山】 柔らかさは、背中、首、腕を越えて、ついに全身を包むようになったのです。
// 設計: ★リキャップ。`KaradaChizu` (lit={{ back: 1, arms: 1, body: L }}、L は f6〜26 で 0→1)。全身の輪郭が光る。背景は現代のリビング (大きな袋のソファの柔らかい曲線を全身の光と重ねる)
// どこ: 現代のリビング (明るい壁・大きな窓・木の床・観葉植物・フロアランプ)。人の真後ろに、#181 と同じ水色の大きな袋のソファが立てかけてある
// 演出: KaradaChizu (x760 y920 s2.3)。背中・腕は点灯済み、首は消えたまま。f6〜26 で全身の輪郭が光る。
//       同時に後ろの袋のソファのふちも足元から頭へ光が走り、「全身を包む柔らかい物」と光の座が重なる。凡例の下には木の板
// 動き: f6〜26 全身の光が育ち、袋のふちの光が下から上へ走る / f26〜 きらめきが体のまわりを回る / 窓の外の雲・植物のゆれ / カメラはゆっくり引く
const Yw183: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.05, 1.0, easeInOut(seg(f, 0, 40)));
  const L = easeInOut(seg(f, 6, 26));
  const bag = "M 420 900 Q 350 720 420 570 Q 480 420 640 430 Q 760 360 900 410 Q 1090 470 1110 640 Q 1140 800 1080 900 Z";
  return (
    <Frame f={f} seed={3183} bg={C.livingWall}>
      <g transform={cam(960, 540, z)}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={W + 120} height={960} fill={C.livingWall} />
        {/* 大きな窓 (左) */}
        <rect x={60} y={120} width={330} height={520} fill={C.portSky} stroke={C.ink} strokeWidth={7} />
        {[0, 1].map((i) => (
          <path key={i} transform={`translate(${130 + i * 150 + ((f * 0.8) % 60)} ${200 + i * 90})`}
            d="M -60 14 Q -64 -12 -36 -14 Q -24 -36 4 -30 Q 26 -40 40 -16 Q 66 -14 60 14 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        ))}
        <path d="M 60 560 Q 200 500 390 540 L 390 640 L 60 640 Z" fill={C.hill} />
        <line x1={225} y1={120} x2={225} y2={640} stroke={C.ink} strokeWidth={6} />
        <rect x={40} y={636} width={370} height={18} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {/* フロアランプ */}
        <path d="M 1700 120 L 1800 120 L 1830 220 L 1670 220 Z" fill={C.lampGlow} stroke={C.ink} strokeWidth={5} />
        <path d="M 1670 220 L 1600 600 L 1900 600 L 1830 220 Z" fill={C.lampGlow} opacity={0.25} />
        <rect x={1742} y={220} width={16} height={660} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={1750} cy={882} rx={60} ry={12} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        {/* 床 */}
        <rect x={-60} y={880} width={W + 120} height={300} fill={C.oak} />
        <line x1={-60} y1={880} x2={W + 60} y2={880} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 180} y1={880} x2={-60 + i * 180 - 70} y2={1160} stroke={C.oakDark} strokeWidth={4} />)}
        {/* 観葉植物 (左手前) */}
        <path d="M 150 900 L 130 790 L 250 790 L 230 900 Z" fill={C.rug} stroke={C.ink} strokeWidth={5} />
        {[-40, -10, 20, 50].map((a, i) => (
          <path key={i} d={`M 190 790 Q ${190 + a * 2} ${690 - i * 10} ${190 + a * 3 + Math.sin(f / 12 + i) * 6} ${630 + (i % 2) * 30}`}
            fill="none" stroke={i % 2 ? C.plant : C.plantDark} strokeWidth={16} strokeLinecap="round" />
        ))}
        {/* 人の後ろの大きな袋のソファ */}
        <ellipse cx={760} cy={906} rx={320} ry={26} fill={C.ink} opacity={0.18} />
        <path d={bag} fill={C.yogi} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 470 860 Q 420 720 470 600 Q 510 500 600 470" fill="none" stroke={C.yogiShine} strokeWidth={18} strokeLinecap="round" opacity={0.7} />
        <path d="M 520 880 Q 480 720 530 560 M 1010 880 Q 1060 720 1010 560" fill="none" stroke={C.yogiDark} strokeWidth={5} strokeDasharray="14 10" />
        <path d="M 690 430 q 40 22 84 2 M 860 440 q 36 18 70 0 M 470 760 q 30 10 50 -10 M 1040 760 q 24 14 44 -6" fill="none" stroke={C.yogiDark} strokeWidth={5} strokeLinecap="round" />
        {/* 袋のふちを走る光 (足元→頭) */}
        {L > 0 && (
          <path d={bag} pathLength={2} strokeDasharray={`${L} 2`} strokeDashoffset={0} fill="none" stroke={YP.glow} strokeWidth={22} strokeLinecap="round" opacity={0.8} />
        )}
        {L > 0 && (
          <path d="M 1080 900 Q 1140 800 1110 640 Q 1090 470 900 410 Q 760 360 640 430" pathLength={1} strokeDasharray={`${L} 1`} fill="none" stroke={YP.glow} strokeWidth={22} strokeLinecap="round" opacity={0.8} />
        )}
        {/* 凡例の下の木の板 */}
        <g>
          <rect x={1190} y={24} width={410} height={720} rx={16} fill={C.oak} stroke={C.ink} strokeWidth={7} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={1190 + 102 * (i + 1)} y1={30} x2={1190 + 102 * (i + 1)} y2={740} stroke={C.oakDark} strokeWidth={4} opacity={0.6} />)}
          {[[1214, 48], [1576, 48], [1214, 720], [1576, 720]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={9} fill={YP.brass} stroke={C.ink} strokeWidth={3} />)}
        </g>
        {/* ===== からだの地図 ===== */}
        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={{ back: 1, arms: 1, body: L }} />
        {/* 全身のまわりを回るきらめき */}
        {L > 0.9 && Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + f / 12;
          return <L4dSpark key={i} x={760 + Math.cos(a) * 300} y={575 + Math.sin(a) * 420} s={0.9 + Math.sin(f / 3 + i) * 0.2} />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#184 【並】 では、こうした柔らかいものは、本当に私たちの役に立っているのでしょうか。
// 設計: 研究所の机の上に、クッション・低反発枕・太軸ペン・ぬいぐるみが並べられ、虫めがねがかざされる。`QMark`。第10章への引き
// どこ: 研究室の白い実験台。後ろはタイルの壁・薬品棚のフラスコ・時計・ブラインドの窓
// 演出: 実験台に4つの試料 (クッション・低反発枕・太軸ペン・丸いぬいぐるみ) を番号札つきで並べ、大きな虫めがねが順に調べる。
//       レンズの中は拡大して見える。最後に太軸ペンの上で止まり、大きな ? が出る。右で白衣の研究者が腕を組んで首をかしげる
// 動き: f0〜6 クッション → f8〜14 枕 → f22〜30 ペンへ移動して止まる / 枕の手の跡がゆっくり戻る / f30 大きな ? / 時計の針・フラスコの泡 / カメラは少し寄る
const L4dLabItems: React.FC<{ f: number }> = ({ f }) => {
  const dent = 1 - seg(f, 4, 40);
  return (
    <g>
      {/* 1: クッション (40cm) */}
      <g transform="translate(400 730)">
        <ellipse cx={0} cy={6} rx={120} ry={14} fill={C.ink} opacity={0.15} />
        <path d="M -110 -170 Q 0 -150 110 -170 Q 96 -85 110 0 Q 0 -14 -110 0 Q -96 -85 -110 -170 Z" fill={C.cushion} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={0} cy={-85} r={10} fill={C.cushionDark} stroke={C.ink} strokeWidth={3} />
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => <line key={i} x1={sx * 14} y1={-85 + sy * 14} x2={sx * 76} y2={-85 + sy * 62} stroke={C.cushionDark} strokeWidth={4} />)}
      </g>
      {/* 2: 低反発枕 (波形・手の跡がゆっくり戻る) */}
      <g transform="translate(760 730)">
        <ellipse cx={0} cy={6} rx={150} ry={14} fill={C.ink} opacity={0.15} />
        <path d="M -140 0 Q -150 -70 -110 -84 Q -60 -96 -20 -66 Q 20 -46 60 -70 Q 110 -98 140 -70 Q 152 -30 140 0 Q 0 8 -140 0 Z" fill={C.pillow} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {[-90, -30, 30, 90].map((dx, i) => <circle key={i} cx={dx} cy={-26} r={6} fill={C.pillowDark} opacity={0.7} />)}
        {dent > 0.02 && [-34, -12, 10, 32].map((dx, i) => (
          <ellipse key={i} cx={dx} cy={-64 - Math.abs(dx) * 0.2} rx={9} ry={16} fill={C.pillowDark} opacity={0.6 * dent} />
        ))}
      </g>
      {/* 3: 太軸ペン (小さな台に斜めに置く) */}
      <g transform="translate(1060 730)">
        <path d="M -80 0 L 80 0 L 60 -30 L -60 -30 Z" fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <g transform="translate(0 -52) rotate(-14)">
          <rect x={-70} y={-13} width={120} height={26} rx={12} fill={C.penBody} stroke={C.ink} strokeWidth={4.5} />
          <rect x={-2} y={-15} width={52} height={30} rx={13} fill={C.penGrip} stroke={C.ink} strokeWidth={4.5} />
          {[8, 20, 32, 44].map((gx) => <line key={gx} x1={gx} y1={-12} x2={gx} y2={12} stroke={KRP.gray} strokeWidth={2.5} />)}
          <path d="M 50 -9 L 72 0 L 50 9 Z" fill={KRP.cream} stroke={C.ink} strokeWidth={3.5} />
          <rect x={-62} y={-20} width={44} height={8} rx={3} fill={KRP.gray} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 4: 丸いぬいぐるみ */}
      <ellipse cx={1370} cy={736} rx={90} ry={12} fill={C.ink} opacity={0.15} />
      <L4dMallow x={1370} y={730} w={170} c={C.m1} f={f} ph={3} />
      {/* 番号札 */}
      {[400, 760, 1060, 1370].map((nx, i) => (
        <g key={i} transform={`translate(${nx} 780) rotate(${(i % 2 ? 1 : -1) * 3})`}>
          <rect x={-46} y={-20} width={92} height={40} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>No.{i + 1}</text>
        </g>
      ))}
    </g>
  );
};
const Yw184: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  // 虫めがねの道すじ
  const lx = f < 6 ? 400 : f < 14 ? lerp(400, 760, easeInOut(seg(f, 6, 14))) : f < 22 ? 760 : lerp(760, 1060, easeInOut(seg(f, 22, 30)));
  const ly = 640 + Math.sin(f / 5) * 6 * (f < 30 ? 1 : 0.4);
  const LR = 130;
  const tick = Math.floor(f / 6);
  return (
    <Frame f={f} seed={3184} bg={C.labWall}>
      <g transform={cam(960, 560, z)}>
        {/* タイルの壁 */}
        <rect x={-60} y={-60} width={W + 120} height={720} fill={C.labWall} />
        {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={-60} y1={i * 50} x2={W + 60} y2={i * 50} stroke={C.labTile} strokeWidth={3} />)}
        {Array.from({ length: 34 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={-60} x2={i * 60} y2={620} stroke={C.labTile} strokeWidth={3} />)}
        {/* ブラインドの窓 */}
        <rect x={80} y={110} width={300} height={330} fill={C.portSky} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={84} y={118 + i * 32} width={292} height={16} fill={KRP.white} opacity={0.85} stroke={C.ink} strokeWidth={2} />)}
        {/* 時計 */}
        <g transform="translate(960 150)">
          <circle r={70} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-58} x2={0} y2={-48} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={0} y2={-38} stroke={C.ink} strokeWidth={7} strokeLinecap="round" transform="rotate(300)" />
          <line x1={0} y1={0} x2={0} y2={-54} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" transform={`rotate(${tick * 6})`} />
          <circle r={7} fill={C.ink} />
        </g>
        <TagPlate x={650} y={110} text="研究室" size={36} t={seg(f, 0, 8)} rot={-2} />
        {/* 薬品棚とフラスコ */}
        <rect x={1240} y={170} width={520} height={20} fill={YP.wood} stroke={C.ink} strokeWidth={5} />
        <rect x={1240} y={360} width={520} height={20} fill={YP.wood} stroke={C.ink} strokeWidth={5} />
        {[1290, 1400, 1520, 1650].map((bx, i) => (
          <g key={bx}>
            <path d={`M ${bx - 16} 80 L ${bx - 16} 120 L ${bx - 44} 168 L ${bx + 44} 168 L ${bx + 16} 120 L ${bx + 16} 80 Z`} fill={KRP.white} opacity={0.8} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${bx - 34} 150 L ${bx + 34} 150 L ${bx + 44} 168 L ${bx - 44} 168 Z`} fill={[KRP.blue, KRP.green, KRP.orange, C.m3][i]} />
            <circle cx={bx + Math.sin(f / 4 + i) * 6} cy={150 - ((f * 2 + i * 9) % 30)} r={4} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} />
            <rect x={bx - 26} y={290} width={52} height={70} rx={6} fill={[C.m6, C.m4, C.m2, C.m5][i]} stroke={C.ink} strokeWidth={4} />
            <rect x={bx - 16} y={276} width={32} height={16} fill={KRP.grayDark} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 実験台 */}
        <path d="M -60 610 L 1980 610 L 1980 800 L -60 800 Z" fill={C.bench} stroke={C.ink} strokeWidth={7} />
        <rect x={-60} y={800} width={W + 120} height={320} fill={C.benchDark} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={40 + i * 320} y={840} width={280} height={200} rx={8} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4} />)}
        {/* 試料 */}
        <L4dLabItems f={f} />
        {/* 前に調べた試料の ? (小) */}
        <QMark x={400} y={500} s={0.5} f={f} t={seg(f, 6, 12)} />
        <QMark x={760} y={560} s={0.5} f={f} t={seg(f, 16, 22)} />
        {/* ===== 虫めがね ===== */}
        <defs><clipPath id="l4dLens184"><circle cx={lx} cy={ly} r={LR} /></clipPath></defs>
        <g clipPath="url(#l4dLens184)">
          <rect x={lx - LR} y={ly - LR} width={LR * 2} height={LR * 2} fill={C.bench} />
          <g transform={`translate(${lx} ${ly}) scale(1.8) translate(${-lx} ${-ly - 20})`}>
            <path d="M -60 610 L 1980 610 L 1980 800 L -60 800 Z" fill={C.bench} />
            <L4dLabItems f={f} />
          </g>
          <path d={`M ${lx - 90} ${ly - 60} Q ${lx - 60} ${ly - 100} ${lx - 10} ${ly - 110}`} fill="none" stroke={KRP.white} strokeWidth={12} strokeLinecap="round" opacity={0.6} />
        </g>
        <g transform={`rotate(-38 ${lx} ${ly})`}>
          <rect x={lx + LR + 6} y={ly - 22} width={60} height={44} rx={8} fill={YP.brassDark} stroke={C.ink} strokeWidth={5} />
          <rect x={lx + LR + 60} y={ly - 26} width={190} height={52} rx={24} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
        </g>
        <circle cx={lx} cy={ly} r={LR + 10} fill="none" stroke={YP.brass} strokeWidth={22} />
        <circle cx={lx} cy={ly} r={LR + 10} fill="none" stroke={C.ink} strokeWidth={5} />
        <circle cx={lx} cy={ly} r={LR + 22} fill="none" stroke={C.ink} strokeWidth={4} />
        {/* 大きな ? */}
        <QMark x={1060} y={430} s={1.5} f={f} t={seg(f, 30, 38)} />
        {/* 研究者 */}
        <Person x={1700} y={960} s={1.15} f={f} phase={3} glasses cloth={C.coat} clothDark={C.coatDark}
          face={f >= 30 ? "worried" : "normal"} pose="armsFolded" gaze={[-8, 2]} lean={-5 * easeOut(seg(f, 20, 34))} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_178: (f) => <Yw178 f={f} />,
  yw_179: (f) => <Yw179 f={f} />,
  yw_180: (f) => <Yw180 f={f} />,
  yw_181: (f) => <Yw181 f={f} />,
  yw_182: (f) => <Yw182 f={f} />,
  yw_183: (f) => <Yw183 f={f} />,
  yw_184: (f) => <Yw184 f={f} />,
};

export const YW_F4_MOTIFS: string[] = [
  "yw_178",
  "yw_179",
  "yw_180",
  "yw_181",
  "yw_182",
  "yw_183",
  "yw_184",
];

export const yawaF4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
