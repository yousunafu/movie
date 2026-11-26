// 「日本のクリスマスは、なぜこうなったのか」(クリスマス回B) だけで何度も出てくる装置と小物。
// 正本: docs/xj-design-common.md「B だけの部品 (XjParts.tsx)」。A・B 共通の物は XmasParts.tsx (ここでは import しない)。
//
// ★ここにある物は、別々の絵師が別々の章で描く「同じ物」。毎回この部品を使い、描き直さない (絵のブレ禁止)。
// ★props の名前を勝手に変えない。足すときは省略可能な props で。
// ★ロゴ・店名・看板の文字は描かない。明かりは「光の丸 (ハロー)」で表し、黒い図形の点滅にしない。
// ★人はここに入れない (人・カメラはシーン側)。
//
// 部品の一覧:
//   Kakeibo      家計簿の机 (1920×1080 の舞台)。12か月の棒・12月の棒が dec で伸びる
//   KakeiboIcon  家計簿の棒の上のアイコン (シーン側で単独でも使える)
//   Cake         クリスマスケーキ 6種 (butter/fresh/fruit/stollen/mini/dog)。cut で1切れ抜ける
//   CakeBox      昭和のケーキの箱 (白い箱・赤いリボン・持ち手)
//   Ichigo       顔のあるイチゴ (大きい丸目)。sleep / run / flower
//   IchigoHouse  冬のイチゴのハウス (1920×1080 の舞台)。light で電照、snow で雪
//   Chicken      ごちそうの鶏 4種 (roast/fried/turkey/kiji)
//   Kadomatsu    門松
//   Sankakubo    紙の三角帽 (赤と金のしま)

import React from "react";
import { useCurrentFrame } from "remotion";
import { KRP, KARAKURI_FONT, seg, easeOut, clamp01, pop } from "./KarakuriScenes";
import { Frame } from "./HimaShared";

const FONT = KARAKURI_FONT;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const INK = KRP.ink;

// B だけの色 (シーン側でも使ってよい)
export const XJ = {
  // ケーキ
  cream: "#FFF8EC", // 生クリーム
  creamShade: "#EADCC4",
  butter: "#FBEBC0", // バタークリーム (少し黄色い)
  butterShade: "#E5CD92",
  sponge: "#F2C878", // スポンジ
  spongeDark: "#D6A452",
  berry: "#E0394A", // イチゴ
  berryDark: "#A8202F",
  berryLight: "#F47A84",
  seed: "#F6E08A", // イチゴのつぶ
  calyx: "#5E9E4A", // へた
  calyxDark: "#3F7432",
  rose: "#F4A0B4", // バタークリームのバラ
  roseDark: "#D26E8A",
  leaf: "#7DBB6A",
  choco: "#7A4A2E",
  chocoDark: "#54311D",
  icing: "#FBFAF4", // 砂糖衣
  fruitCake: "#8A5532",
  sugar: "#FFFFFF",
  silverBall: "#DDE2E6",
  plate: "#F4F1EA",
  plateShade: "#D9D3C6",
  // 箱
  box: "#FCFBF6",
  boxShade: "#E3DFD3",
  ribbon: "#D3402E",
  ribbonDark: "#9E2A1E",
  // 鶏
  roast: "#C9803A",
  roastDark: "#8E5224",
  roastLight: "#E9AE62",
  fried: "#C98C3E",
  friedDark: "#8F5E22",
  friedLight: "#E8B867",
  kraft: "#C9A272", // 茶色の紙の箱
  kraftDark: "#9C7A4E",
  bone: "#F7EEDC",
  parsley: "#5FA34A",
  // 門松
  bamboo: "#7DAF58",
  bambooDark: "#4F7E34",
  bambooCut: "#E9E2B4",
  pine: "#3F7A45",
  pineDark: "#2C5A33",
  ume: "#E0455A",
  straw: "#D9B76A",
  strawDark: "#A98A44",
  // 三角帽
  hatRed: "#D3402E",
  hatGold: "#E8BE3C",
  // ハウス
  film: "#DCEBF2",
  vinylFrame: "#B9C2C8",
  soil: "#8C6A4E",
  mulch: "#6E6478",
  bulb: "#FFE7A0",
  bulbGlow: "#FFD36A",
  winterSky: "#5D6F98",
  // 家計簿
  desk: "#C99A68",
  deskDark: "#A87A4A",
  page: "#FBF7EC",
  rule: "#BFD3E4",
  margin: "#E59A9A",
  pencil: "#4A4440",
} as const;

/* ===================================================================
 * KakeiboIcon — 家計簿の棒の上に付く食べ物・物の小さな絵
 *   x,y: 中心。s=1 で幅 およそ 70px
 * =================================================================== */
export type KakeiboItem = "cake" | "kani" | "mochi" | "chicken" | "toy";
export const KakeiboIcon: React.FC<{ x: number; y: number; s?: number; item: KakeiboItem; f?: number }> = ({ x, y, s = 1, item, f = 0 }) => {
  const sw = 3.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {item === "cake" && (
        <g>
          {/* 三角の1切れ (横から見た形) */}
          <path d="M -34 22 L 34 22 L 34 -6 L -34 -14 Z" fill={XJ.sponge} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M -34 6 L 34 10" stroke={XJ.cream} strokeWidth={6} />
          <path d="M -34 6 L 34 10" stroke={XJ.berry} strokeWidth={2.5} strokeDasharray="6 6" />
          <path d="M -36 -14 L 34 -6 L 36 -16 L -30 -24 Z" fill={XJ.cream} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M 6 -18 Q 4 -40 16 -40 Q 28 -40 24 -18 Z" fill={XJ.berry} stroke={INK} strokeWidth={sw} />
          <path d="M 8 -38 l 7 5 l 7 -6" stroke={XJ.calyx} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      )}
      {item === "kani" && (
        <g>
          {/* 脚 */}
          {[-1, 1].map((d) => [0, 1, 2].map((k) => (
            <path key={`${d}${k}`} d={`M ${d * 20} ${4 + k * 7} q ${d * 16} ${2 + k * 4} ${d * 22} ${14 + k * 4}`}
              stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
          )))}
          {[-1, 1].map((d) => [0, 1, 2].map((k) => (
            <path key={`c${d}${k}`} d={`M ${d * 20} ${4 + k * 7} q ${d * 16} ${2 + k * 4} ${d * 22} ${14 + k * 4}`}
              stroke="#E0573C" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          )))}
          <ellipse cx={0} cy={6} rx={28} ry={18} fill="#E0573C" stroke={INK} strokeWidth={sw} />
          <ellipse cx={-6} cy={0} rx={12} ry={5} fill="#F59A7E" opacity={0.8} />
          {/* うで + はさみ (f で少しチョキチョキ) */}
          {[-1, 1].map((d) => {
            const o = Math.max(0, Math.sin(f / 5 + d)) * 14;
            return (
              <g key={d}>
                <path d={`M ${d * 16} -6 Q ${d * 30} -14 ${d * 30} -26`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
                <path d={`M ${d * 16} -6 Q ${d * 30} -14 ${d * 30} -26`} stroke="#E0573C" strokeWidth={4} fill="none" strokeLinecap="round" />
                <g transform={`translate(${d * 30} -30)`}>
                  <ellipse cx={0} cy={0} rx={11} ry={9} fill="#E0573C" stroke={INK} strokeWidth={3} />
                  <path d={`M ${-d * 2} -6 Q ${d * 4} -26 ${d * 12} -22 Q ${d * 8} -12 ${d * 6} -6 Z`} fill="#E0573C" stroke={INK} strokeWidth={3}
                    transform={`rotate(${-d * o} 0 -6)`} />
                  <path d={`M ${-d * 8} -4 Q ${-d * 10} -22 ${-d * 2} -24 Q ${0} -14 ${d * 0} -6 Z`} fill="#E0573C" stroke={INK} strokeWidth={3} />
                </g>
              </g>
            );
          })}
          <circle cx={-8} cy={-12} r={4} fill={INK} /><circle cx={8} cy={-12} r={4} fill={INK} />
        </g>
      )}
      {item === "mochi" && (
        <g>
          {/* 三方の台 */}
          <path d="M -34 30 L 34 30 L 28 16 L -28 16 Z" fill="#E2C38A" stroke={INK} strokeWidth={sw} />
          <ellipse cx={0} cy={6} rx={30} ry={12} fill={KRP.white} stroke={INK} strokeWidth={sw} />
          <ellipse cx={0} cy={-8} rx={22} ry={10} fill={KRP.white} stroke={INK} strokeWidth={sw} />
          <circle cx={0} cy={-24} r={9} fill={KRP.orange} stroke={INK} strokeWidth={3} />
          <path d="M 0 -33 l 6 -5" stroke={XJ.calyx} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      {item === "chicken" && (
        <g transform="rotate(-25)">
          <rect x={14} y={-6} width={26} height={12} rx={6} fill={XJ.bone} stroke={INK} strokeWidth={sw} />
          <circle cx={42} cy={-7} r={7} fill={XJ.bone} stroke={INK} strokeWidth={3} />
          <circle cx={42} cy={7} r={7} fill={XJ.bone} stroke={INK} strokeWidth={3} />
          <path d="M -36 0 Q -36 -26 -6 -24 Q 18 -20 20 0 Q 18 20 -6 24 Q -36 26 -36 0 Z" fill={XJ.roast} stroke={INK} strokeWidth={sw} />
          <path d="M -24 -12 Q -12 -18 2 -14" stroke={XJ.roastLight} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {item === "toy" && (
        <g>
          {/* ぜんまいのロボット */}
          <line x1={0} y1={-38} x2={0} y2={-28} stroke={INK} strokeWidth={3} />
          <circle cx={0} cy={-40} r={5} fill={KRP.red} stroke={INK} strokeWidth={2.5} />
          <rect x={-18} y={-28} width={36} height={24} rx={5} fill={KRP.silver} stroke={INK} strokeWidth={sw} />
          <circle cx={-7} cy={-16} r={4} fill={INK} /><circle cx={7} cy={-16} r={4} fill={INK} />
          <rect x={-22} y={-4} width={44} height={28} rx={5} fill={KRP.blueDeep} stroke={INK} strokeWidth={sw} />
          <circle cx={0} cy={10} r={5} fill={KRP.yellow} stroke={INK} strokeWidth={2.5} />
          <rect x={-18} y={24} width={12} height={10} fill={KRP.grayDark} stroke={INK} strokeWidth={2.5} />
          <rect x={6} y={24} width={12} height={10} fill={KRP.grayDark} stroke={INK} strokeWidth={2.5} />
          <g transform={`translate(24 8) rotate(${f * 6})`}>
            <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke={KRP.brass} strokeWidth={4} strokeLinecap="round" />
          </g>
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * Kakeibo — 家計簿の机 (導入 #8〜9・落ち #203〜208)。1920×1080 いっぱいの舞台
 *   上にリングのついた横長のノート。12か月の棒グラフ。棒の上に item のアイコン。
 *   item: どの物の家計簿か ("cake"|"kani"|"mochi"|"chicken"|"toy")
 *   dec:  12月の棒の伸び (0 = ほかの月なみ → 1 = グラフのてっぺん)。途中 (0.02〜0.98) は鉛筆が棒の先で描いている
 *   f:    湯気・レシートの角・鉛筆の動き・12月のアイコンの弾み
 *   棒の根元 y=800、てっぺん y=370。12月の棒の中心 x = KAKEIBO_DEC_X (シーン側で指や札を置くとき用)
 * =================================================================== */
const KB_DATA: Record<KakeiboItem, number[]> = {
  cake: [0.1, 0.09, 0.11, 0.09, 0.11, 0.09, 0.1, 0.09, 0.09, 0.1, 0.11],
  kani: [0.15, 0.08, 0.07, 0.06, 0.06, 0.05, 0.05, 0.06, 0.06, 0.07, 0.1],
  mochi: [0.24, 0.08, 0.05, 0.04, 0.04, 0.03, 0.03, 0.03, 0.03, 0.04, 0.06],
  chicken: [0.16, 0.15, 0.15, 0.16, 0.16, 0.15, 0.16, 0.16, 0.15, 0.16, 0.17],
  toy: [0.08, 0.07, 0.1, 0.08, 0.14, 0.07, 0.12, 0.1, 0.07, 0.08, 0.12],
};
const KB_COLOR: Record<KakeiboItem, [string, string]> = {
  cake: [XJ.berryLight, XJ.berryDark],
  kani: ["#EE8A6E", "#B84A30"],
  mochi: ["#E8D9B0", "#A89458"],
  chicken: [XJ.roastLight, XJ.roastDark],
  toy: ["#8FB0E0", "#3F64A0"],
};
const KB_X0 = 400, KB_STEP = 100, KB_BASE = 800, KB_TOP = 370;
export const KAKEIBO_DEC_X = KB_X0 + 11 * KB_STEP;
export const Kakeibo: React.FC<{ f: number; item?: KakeiboItem; dec?: number }> = ({ f, item = "cake", dec = 1 }) => {
  const data = KB_DATA[item];
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const d = clamp01(dec);
  const decV = lerp(avg, 1, d);
  const [c, cd] = KB_COLOR[item];
  const H = KB_BASE - KB_TOP;
  const drawing = d > 0.02 && d < 0.98;
  const decTop = KB_BASE - decV * H;
  return (
    <g>
      <defs>
        <pattern id={`xjHatch-${item}`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1={0} y1={0} x2={0} y2={14} stroke={cd} strokeWidth={3} opacity={0.45} />
        </pattern>
      </defs>
      {/* 机 (木の天板を上から) */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={XJ.desk} />
      <g stroke={XJ.deskDark} strokeWidth={4} fill="none" opacity={0.55}>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -40 ${60 + i * 130} C 400 ${30 + i * 130} 900 ${110 + i * 130} 1960 ${70 + i * 130}`} />
        ))}
        <ellipse cx={180} cy={980} rx={50} ry={16} />
        <ellipse cx={1780} cy={140} rx={40} ry={12} />
      </g>
      {/* 卓上ランプの光 (左上から) */}
      <ellipse cx={760} cy={480} rx={1100} ry={640} fill="#FFE9B8" opacity={0.16 + 0.02 * Math.sin(f / 23)} />
      {/* レシートの束 (左) */}
      <g transform="translate(130 420) rotate(-8)">
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${k * 10} ${k * -14}) rotate(${(k - 1) * 7})`}>
            <path d={`M -60 -150 L 60 -150 L 60 150 l -12 -10 l -12 10 l -12 -10 l -12 10 l -12 -10 l -12 10 l -12 -10 l -12 10 l -12 -10 L -60 150 Z`}
              fill={KRP.white} stroke={INK} strokeWidth={4} />
            {Array.from({ length: 7 }, (_, j) => (
              <line key={j} x1={-42} y1={-112 + j * 34} x2={j % 3 === 2 ? 0 : 38} y2={-112 + j * 34} stroke={KRP.gray} strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        ))}
        {/* 一番上の角が風でぴらっ */}
        <path d={`M 80 -164 L 80 ${-120 - 10 * Math.sin(f / 11)} L ${50 - 6 * Math.sin(f / 11)} -164 Z`} fill={KRP.paper} stroke={INK} strokeWidth={3.5} />
      </g>
      {/* 電卓 (左下) */}
      <g transform="translate(150 860) rotate(6)">
        <rect x={-90} y={-120} width={180} height={240} rx={18} fill="#5A5E66" stroke={INK} strokeWidth={6} />
        <rect x={-70} y={-100} width={140} height={50} rx={6} fill="#C7D6BC" stroke={INK} strokeWidth={3.5} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, k) => (
          <rect key={`${r}${k}`} x={-70 + k * 36} y={-36 + r * 36} width={28} height={26} rx={5}
            fill={k === 3 ? KRP.orange : "#E6E6E2"} stroke={INK} strokeWidth={2.5} />
        )))}
      </g>
      {/* 湯のみ (右上) と湯気 */}
      <g transform="translate(1790 230)">
        <ellipse cx={0} cy={70} rx={88} ry={22} fill={XJ.deskDark} opacity={0.5} />
        <path d="M -62 -30 L -52 62 Q 0 80 52 62 L 62 -30 Z" fill="#7C9A8A" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-30} rx={62} ry={18} fill="#B9D0A0" stroke={INK} strokeWidth={5} />
        <path d="M -48 10 Q 0 22 48 10" stroke="#A7BFB2" strokeWidth={6} fill="none" />
        {[0, 1, 2].map((i) => {
          const t = ((f * 0.9 + i * 22) % 66) / 66;
          return <path key={i} d={`M ${-22 + i * 22} -56 q 14 -22 0 -44 q -14 -22 0 -44`} stroke={KRP.white} strokeWidth={6}
            fill="none" strokeLinecap="round" opacity={0.55 * Math.sin(t * Math.PI)} transform={`translate(${Math.sin(f / 13 + i) * 6} ${-t * 50})`} />;
        })}
      </g>
      {/* ノートの影 */}
      <rect x={292} y={168} width={1360} height={800} rx={20} fill={INK} opacity={0.18} />
      {/* ノート */}
      <rect x={270} y={150} width={1360} height={800} rx={18} fill={XJ.page} stroke={INK} strokeWidth={7} />
      {/* 罫線と赤い余白線 */}
      <g stroke={XJ.rule} strokeWidth={3}>
        {Array.from({ length: 15 }, (_, i) => <line key={i} x1={276} y1={250 + i * 46} x2={1624} y2={250 + i * 46} />)}
      </g>
      <line x1={350} y1={156} x2={350} y2={944} stroke={XJ.margin} strokeWidth={3.5} />
      {/* 上のリング */}
      {Array.from({ length: 17 }, (_, i) => (
        <g key={i}>
          <circle cx={330 + i * 78} cy={186} r={10} fill={XJ.desk} stroke={INK} strokeWidth={3.5} />
          <path d={`M ${330 + i * 78} 186 Q ${322 + i * 78} 150 ${336 + i * 78} 128`} stroke={KRP.grayDark} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M ${330 + i * 78} 186 Q ${322 + i * 78} 150 ${336 + i * 78} 128`} stroke={KRP.silver} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* 左上の手書きの見出し (字ではなく家の絵と波線) */}
      <g transform="translate(400 238)">
        <path d="M -20 10 L 0 -10 L 20 10 L 20 26 L -20 26 Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 40 14 q 20 -12 40 0 t 40 0 t 40 0" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
      </g>
      {/* 目盛りの軸 */}
      <line x1={360} y1={KB_BASE} x2={1580} y2={KB_BASE} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={360} y1={KB_BASE} x2={360} y2={KB_TOP - 20} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <line key={v} x1={352} y1={KB_BASE - v * H} x2={368} y2={KB_BASE - v * H} stroke={INK} strokeWidth={4} />
      ))}
      {/* 棒 */}
      {Array.from({ length: 12 }, (_, i) => {
        const isDec = i === 11;
        const v = isDec ? decV : data[i];
        const bx = KB_X0 + i * KB_STEP;
        const top = KB_BASE - v * H;
        const w = isDec ? 72 : 56;
        const bob = isDec ? Math.sin(f / 7) * 4 * (0.3 + d) : 0;
        return (
          <g key={i}>
            <rect x={bx - w / 2} y={top} width={w} height={KB_BASE - top} fill={c} opacity={isDec ? 1 : 0.75} />
            <rect x={bx - w / 2} y={top} width={w} height={KB_BASE - top} fill={`url(#xjHatch-${item})`} />
            <rect x={bx - w / 2} y={top} width={w} height={KB_BASE - top} fill="none" stroke={INK} strokeWidth={isDec ? 6 : 4.5} strokeLinejoin="round" />
            <KakeiboIcon x={bx} y={top - (isDec ? 52 : 34) + bob} s={isDec ? lerp(0.85, 1.25, d) : 0.6} item={item} f={f} />
            <text x={bx} y={KB_BASE + 52} textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={isDec ? 40 : 32} fill={isDec ? KRP.red : INK}>{i + 1}</text>
          </g>
        );
      })}
      {/* 12月を囲む赤鉛筆の丸 (伸びきったら) */}
      {d > 0.6 && (
        <ellipse cx={KAKEIBO_DEC_X} cy={KB_BASE + 38} rx={44} ry={34} fill="none" stroke={KRP.red} strokeWidth={5}
          strokeDasharray={280} strokeDashoffset={280 * (1 - seg(d, 0.6, 1))} transform={`rotate(-8 ${KAKEIBO_DEC_X} ${KB_BASE + 38})`} />
      )}
      {/* 鉛筆: 伸びている最中は棒の先で描く、止まっているときはノートの右に置いてある */}
      {drawing ? (
        <g transform={`translate(${KAKEIBO_DEC_X + 36 + Math.sin(f / 2.2) * 8} ${decTop + Math.cos(f / 2.2) * 3}) rotate(-35)`}>
          <Pencil />
        </g>
      ) : (
        <g transform={`translate(1745 ${830 + Math.sin(f / 31) * 2}) rotate(-14)`}>
          <Pencil />
        </g>
      )}
      {/* 消しゴム */}
      <g transform="translate(1800 990) rotate(14)">
        <rect x={-50} y={-24} width={100} height={48} rx={8} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <rect x={-50} y={-24} width={46} height={48} rx={8} fill={KRP.blueDeep} stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};
// 鉛筆 (原点 = 芯の先。上に向かって軸が伸びる)
const Pencil: React.FC = () => (
  <g>
    <path d="M 0 0 L -14 -40 L 14 -40 Z" fill="#F0D7A8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 0 L -5 -14 L 5 -14 Z" fill={XJ.pencil} />
    <rect x={-14} y={-260} width={28} height={220} fill={KRP.yellow} stroke={INK} strokeWidth={4.5} />
    <line x1={0} y1={-256} x2={0} y2={-44} stroke="#D8B238" strokeWidth={4} />
    <rect x={-15} y={-290} width={30} height={32} fill={KRP.silver} stroke={INK} strokeWidth={4} />
    <rect x={-15} y={-310} width={30} height={22} rx={8} fill="#F0A0A0" stroke={INK} strokeWidth={4} />
  </g>
);

/* ===================================================================
 * Cake — クリスマスケーキ
 *   x,y: お皿 (シュトーレンはまな板) の底の中心 = 机に接するところ。s=1 で 丸いケーキの直径 およそ 300px
 *   kind: "butter" 昭和のバタークリーム (ピンクのバラ・銀の粒・チョコの板) / "fresh" イチゴと生クリーム /
 *         "fruit" 砂糖衣のフルーツケーキ (焦げ茶の生地に白い砂糖衣が垂れる) / "stollen" シュトーレン (粉砂糖の細長いパン) /
 *         "mini" ひとり用の小さいケーキ (イチゴ1つ・ろうそく1本) / "dog" 犬用 (骨のクッキーと足あと)
 *   cut: 0〜1。右手前の1切れが右へ抜けて、切り口 (スポンジとクリームの層) が見える。0 で切っていない
 *   f: クリームのつや・イチゴの光・ろうそくの炎・抜けかけの1切れのゆれ
 *   ※ケーキの天面の中心 = CAKE_TOP(kind, s) で取れる (フォークや札をシーン側で置くとき用)
 * =================================================================== */
export type CakeKind = "butter" | "fresh" | "fruit" | "stollen" | "mini" | "dog";
const CAKE_DIM: Record<Exclude<CakeKind, "stollen">, { R: number; h: number }> = {
  butter: { R: 150, h: 108 },
  fresh: { R: 150, h: 112 },
  fruit: { R: 138, h: 96 },
  dog: { R: 112, h: 78 },
  mini: { R: 74, h: 84 },
};
export const CAKE_TOP = (kind: CakeKind, s = 1): [number, number] =>
  kind === "stollen" ? [0, -100 * s] : [0, -(22 + CAKE_DIM[kind].h) * s];

// 立っているイチゴ (天面に飾る。x,y = 根元)
const TopBerry: React.FC<{ x: number; y: number; r: number; f: number; ph?: number }> = ({ x, y, r, f, ph = 0 }) => {
  const gl = 0.45 + 0.35 * Math.max(0, Math.sin(f / 17 + ph));
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-r} ${-r * 0.2} Q ${-r * 1.05} ${-r * 1.6} 0 ${-r * 2.1} Q ${r * 1.05} ${-r * 1.6} ${r} ${-r * 0.2} Q 0 ${r * 0.35} ${-r} ${-r * 0.2} Z`}
        fill={XJ.berry} stroke={INK} strokeWidth={Math.max(2.5, r * 0.18)} strokeLinejoin="round" />
      {[[-0.45, -0.7], [0.4, -0.85], [-0.1, -1.3], [0.5, -0.35], [-0.55, -0.25], [0.05, -0.55]].map(([sx, sy], i) => (
        <ellipse key={i} cx={sx * r} cy={sy * r} rx={r * 0.08} ry={r * 0.12} fill={XJ.seed} />
      ))}
      <ellipse cx={-r * 0.42} cy={-r * 1.15} rx={r * 0.16} ry={r * 0.34} fill={KRP.white} opacity={gl} transform={`rotate(20 ${-r * 0.42} ${-r * 1.15})`} />
    </g>
  );
};
// しぼったクリーム (x,y = 根元)
const Dollop: React.FC<{ x: number; y: number; r: number; col: string; shade: string }> = ({ x, y, r, col, shade }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-r * 0.3} rx={r} ry={r * 0.55} fill={col} stroke={INK} strokeWidth={Math.max(2.2, r * 0.16)} />
    <ellipse cx={0} cy={-r * 0.8} rx={r * 0.7} ry={r * 0.42} fill={col} stroke={INK} strokeWidth={Math.max(2.2, r * 0.16)} />
    <path d={`M ${-r * 0.3} ${-r * 1.05} Q 0 ${-r * 1.7} ${r * 0.12} ${-r * 1.15}`} fill={col} stroke={INK} strokeWidth={Math.max(2.2, r * 0.16)} />
    <path d={`M ${-r * 0.6} ${-r * 0.35} Q 0 ${-r * 0.05} ${r * 0.6} ${-r * 0.35}`} stroke={shade} strokeWidth={Math.max(2, r * 0.14)} fill="none" />
  </g>
);
// バタークリームのバラ
const Rose: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-r * 0.9} ${-r * 0.1} q ${-r * 0.9} ${-r * 0.2} ${-r * 1.5} ${r * 0.25} q ${r * 0.8} ${r * 0.35} ${r * 1.5} ${-r * 0.25} Z`} fill={XJ.leaf} stroke={INK} strokeWidth={2.5} />
    <path d={`M ${r * 0.9} ${-r * 0.1} q ${r * 0.9} ${-r * 0.2} ${r * 1.5} ${r * 0.25} q ${-r * 0.8} ${r * 0.35} ${-r * 1.5} ${-r * 0.25} Z`} fill={XJ.leaf} stroke={INK} strokeWidth={2.5} />
    <ellipse cx={0} cy={-r * 0.45} rx={r} ry={r * 0.75} fill={XJ.rose} stroke={INK} strokeWidth={3} />
    <path d={`M ${-r * 0.55} ${-r * 0.4} Q 0 ${-r * 1.2} ${r * 0.55} ${-r * 0.45} Q 0 ${-r * 0.1} ${-r * 0.25} ${-r * 0.55}`} stroke={XJ.roseDark} strokeWidth={2.5} fill="none" />
  </g>
);
// ヒイラギ
const Holly: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    {[-1, 1].map((d) => (
      <path key={d} d={`M 0 0 q ${d * r * 0.5} ${-r * 0.5} ${d * r * 1.6} ${-r * 0.35} q ${-d * r * 0.2} ${r * 0.2} ${-d * r * 0.05} ${r * 0.45}
        q ${-d * r * 0.3} ${-r * 0.1} ${-d * r * 0.45} ${r * 0.2} q ${-d * r * 0.3} ${-r * 0.15} ${-d * r * 0.5} ${r * 0.15} q ${-d * r * 0.25} ${-r * 0.2} ${-d * r * 0.6} ${-r * 0.45} Z`}
        fill={XJ.calyx} stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
    ))}
    {[[-0.28, -0.42], [0.28, -0.42], [0, -0.7]].map(([bx, by], i) => (
      <circle key={i} cx={bx * r} cy={by * r} r={r * 0.24} fill={KRP.red} stroke={INK} strokeWidth={2.5} />
    ))}
  </g>
);
// 犬の足あと (天面に平たく)
const Paw: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y}) scale(1 0.45)`} fill={XJ.roseDark} opacity={0.85}>
    <ellipse cx={0} cy={r * 0.2} rx={r * 0.55} ry={r * 0.45} />
    {[-0.6, -0.2, 0.2, 0.6].map((k, i) => <circle key={i} cx={k * r} cy={-r * (0.5 - Math.abs(k) * 0.4)} r={r * 0.2} />)}
  </g>
);

type Deco = { a: number; rf: number; t: "berry" | "dollop" | "rose" | "ball" | "holly" | "paw" | "dot" };
const CAKE_DECO: Record<Exclude<CakeKind, "stollen">, Deco[]> = {
  fresh: [
    ...Array.from({ length: 8 }, (_, i) => ({ a: i * 45 + 22.5, rf: 0.76, t: "berry" as const })),
    ...Array.from({ length: 8 }, (_, i) => ({ a: i * 45, rf: 0.8, t: "dollop" as const })),
  ],
  butter: [
    ...Array.from({ length: 12 }, (_, i) => ({ a: i * 30 + 15, rf: 0.86, t: "ball" as const })),
    { a: 55, rf: 0.6, t: "rose" }, { a: 90, rf: 0.62, t: "rose" }, { a: 125, rf: 0.6, t: "rose" },
    { a: 235, rf: 0.6, t: "rose" }, { a: 305, rf: 0.6, t: "rose" },
  ],
  fruit: [
    ...Array.from({ length: 6 }, (_, i) => ({ a: i * 60 + 30, rf: 0.72, t: "ball" as const })),
    { a: 60, rf: 0.55, t: "holly" },
  ],
  dog: [
    ...Array.from({ length: 10 }, (_, i) => ({ a: i * 36, rf: 0.84, t: "dot" as const })),
    { a: 50, rf: 0.55, t: "paw" }, { a: 140, rf: 0.55, t: "paw" }, { a: 270, rf: 0.5, t: "paw" },
  ],
  mini: Array.from({ length: 6 }, (_, i) => ({ a: i * 60 + 30, rf: 0.72, t: "dollop" as const })),
};
// 層 [上端, 下端, 色] (割合)
const CAKE_LAYERS: Record<Exclude<CakeKind, "stollen">, [number, number, string][]> = {
  fresh: [[0, 0.1, XJ.cream], [0.1, 0.44, XJ.sponge], [0.44, 0.58, XJ.cream], [0.58, 0.92, XJ.sponge], [0.92, 1, XJ.cream]],
  mini: [[0, 0.1, XJ.cream], [0.1, 0.44, XJ.sponge], [0.44, 0.58, XJ.cream], [0.58, 0.92, XJ.sponge], [0.92, 1, XJ.cream]],
  butter: [[0, 0.1, XJ.butter], [0.1, 0.45, XJ.sponge], [0.45, 0.53, XJ.butter], [0.53, 0.92, XJ.sponge], [0.92, 1, XJ.butter]],
  fruit: [[0, 0.09, XJ.icing], [0.09, 1, XJ.fruitCake]],
  dog: [[0, 0.12, "#F6EBD6"], [0.12, 1, "#E2C9A0"]],
};
const CAKE_SIDE: Record<Exclude<CakeKind, "stollen">, [string, string]> = {
  fresh: [XJ.cream, XJ.creamShade],
  mini: [XJ.cream, XJ.creamShade],
  butter: [XJ.butter, XJ.butterShade],
  fruit: [XJ.fruitCake, "#6A3F22"],
  dog: ["#F2E4C8", "#D9C39C"],
};
const W1 = 20, W2 = 80; // 抜ける1切れの角度 (度。90 = 真正面)

export const Cake: React.FC<{ x: number; y: number; s?: number; f: number; kind?: CakeKind; cut?: number }> = ({
  x, y, s = 1, f, kind = "fresh", cut = 0,
}) => {
  if (kind === "stollen") return <Stollen x={x} y={y} s={s} f={f} cut={cut} />;
  const { R, h } = CAKE_DIM[kind];
  const k = R / 150;
  const ry = R * 0.36;
  const yb = -22; // 底の楕円の中心
  const yt = yb - h; // 天面の楕円の中心
  const rad = (a: number) => (a * Math.PI) / 180;
  const P = (a: number, rf: number, yy: number): [number, number] => [rf * R * Math.cos(rad(a)), yy + rf * ry * Math.sin(rad(a))];
  const arc = (a1: number, a2: number, yy: number, rf = 1) => {
    const n = Math.max(2, Math.ceil(Math.abs(a2 - a1) / 4));
    return Array.from({ length: n + 1 }, (_, i) => P(a1 + ((a2 - a1) * i) / n, rf, yy));
  };
  const pts = (p: [number, number][]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
  const c = clamp01(cut);
  const isCut = c > 0.02;
  const inW = (a: number) => {
    const m = ((a % 360) + 360) % 360;
    return m >= W1 - 4 && m <= W2 + 4;
  };
  const [side, sideShade] = CAKE_SIDE[kind];
  const layers = CAKE_LAYERS[kind];
  const topCol = layers[0][2];
  const sw = Math.max(3.5, 6 * k);
  const ce = easeOut(c);
  const ox = ce * 170 * k + (c < 1 ? Math.sin(f / 3) * 2 * Math.sin(c * Math.PI) : 0);
  const oy = ce * 26 * k - Math.sin(c * Math.PI) * 30 * k;

  // 側面の帯 (a1→a2)
  const sideBand = (a1: number, a2: number) => (
    <g>
      <polygon points={pts([...arc(a1, a2, yt), ...arc(a2, a1, yb)])} fill={side} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      {/* 側面の陰 (右側を少し暗く) */}
      <polygon points={pts([...arc(Math.max(a1, 0), Math.min(a2, 50), yt), ...arc(Math.min(a2, 50), Math.max(a1, 0), yb)])}
        fill={sideShade} opacity={a1 < 50 ? 0.55 : 0} />
    </g>
  );
  // 側面の飾り (角度で間引く)
  const sideDeco = (ok: (a: number) => boolean) => (
    <g>
      {kind === "fresh" || kind === "mini" ? (
        // つやの帯
        <polygon points={pts([...arc(120, 150, yt + 10 * k), ...arc(150, 120, yb - 10 * k)])} fill={KRP.white}
          opacity={ok(135) ? 0.5 + 0.2 * Math.sin(f / 19) : 0} />
      ) : null}
      {kind === "butter" && Array.from({ length: 6 }, (_, i) => {
        const a1 = i * 30, a2 = a1 + 30;
        if (!ok(a1 + 15)) return null;
        const [x1, y1] = P(a1, 1, yt + h * 0.32), [x2, y2] = P(a2, 1, yt + h * 0.32);
        const [xm, ym] = P(a1 + 15, 1, yt + h * 0.62);
        return <path key={i} d={`M ${x1} ${y1} Q ${xm} ${ym + 8 * k} ${x2} ${y2}`} stroke={XJ.roseDark} strokeWidth={4.5 * k + 1} fill="none" strokeLinecap="round" />;
      })}
      {kind === "fruit" && Array.from({ length: 18 }, (_, i) => {
        const a = i * 10 + 5;
        if (!ok(a)) return null;
        const [dx, dy] = P(a, 1, yt);
        const len = (14 + ((i * 37) % 5) * 9) * k;
        return <path key={i} d={`M ${dx - 9 * k} ${dy - 2} L ${dx - 7 * k} ${dy + len} Q ${dx} ${dy + len + 10 * k} ${dx + 7 * k} ${dy + len} L ${dx + 9 * k} ${dy - 2} Z`}
          fill={XJ.icing} stroke={INK} strokeWidth={2.5} />;
      })}
      {kind === "dog" && Array.from({ length: 12 }, (_, i) => {
        const a = i * 15 + 7;
        if (!ok(a)) return null;
        const [dx, dy] = P(a, 1, yt + h * 0.5);
        return <circle key={i} cx={dx} cy={dy} r={5 * k + 1} fill={XJ.roseDark} opacity={0.6} />;
      })}
      {/* 底のしぼり (ひと回り) */}
      {kind !== "fruit" && Array.from({ length: 16 }, (_, i) => {
        const a = i * 11.25 + 2;
        if (!ok(a)) return null;
        const [bx, by] = P(a, 1, yb);
        return <ellipse key={i} cx={bx} cy={by - 4 * k} rx={11 * k + 1} ry={8 * k + 1} fill={side} stroke={INK} strokeWidth={2.5} />;
      })}
      {/* 天面のふちのしぼり (バタークリームだけ) */}
      {kind === "butter" && Array.from({ length: 16 }, (_, i) => {
        const a = i * 11.25 + 2;
        if (!ok(a)) return null;
        const [bx, by] = P(a, 1, yt);
        return <ellipse key={i} cx={bx} cy={by} rx={10} ry={7} fill={XJ.butter} stroke={INK} strokeWidth={2.5} />;
      })}
    </g>
  );
  // 切り口 (角度 a の面)
  const face = (a: number, dark: number) => {
    const [px, py] = P(a, 1, yt);
    const C: [number, number] = [0, yt];
    return (
      <g>
        {layers.map(([v1, v2, col], i) => (
          <polygon key={i} points={pts([[C[0], C[1] + v1 * h], [px, py + v1 * h], [px, py + v2 * h], [C[0], C[1] + v2 * h]])} fill={col} />
        ))}
        {/* イチゴの断面 (生クリームのケーキだけ) */}
        {(kind === "fresh" || kind === "mini") && [0.3, 0.68].map((u, i) => (
          <g key={i}>
            <ellipse cx={px * u} cy={C[1] + (py - C[1]) * u + h * 0.51} rx={9 * k + 2} ry={7 * k + 2} fill={XJ.berry} stroke={INK} strokeWidth={2} />
            <ellipse cx={px * u} cy={C[1] + (py - C[1]) * u + h * 0.51} rx={4 * k + 1} ry={3 * k + 1} fill={XJ.berryLight} />
          </g>
        ))}
        {/* フルーツの粒 */}
        {kind === "fruit" && Array.from({ length: 7 }, (_, i) => {
          const u = 0.15 + ((i * 0.37) % 0.75), v = 0.2 + ((i * 0.53) % 0.7);
          return <circle key={i} cx={px * u} cy={C[1] + (py - C[1]) * u + h * v} r={5 * k + 1.5}
            fill={[KRP.red, "#8BBF5A", KRP.yellow, "#5A2E18"][i % 4]} />;
        })}
        {/* スポンジの気泡 */}
        {(kind === "fresh" || kind === "mini" || kind === "butter") && Array.from({ length: 6 }, (_, i) => {
          const u = 0.2 + ((i * 0.41) % 0.7), v = i % 2 ? 0.27 : 0.76;
          return <circle key={`b${i}`} cx={px * u} cy={C[1] + (py - C[1]) * u + h * v} r={2.2} fill={XJ.spongeDark} opacity={0.7} />;
        })}
        <polygon points={pts([C, [px, py], [px, py + h], [C[0], C[1] + h]])} fill={INK} opacity={dark} />
        <polygon points={pts([C, [px, py], [px, py + h], [C[0], C[1] + h]])} fill="none" stroke={INK} strokeWidth={sw * 0.8} strokeLinejoin="round" />
      </g>
    );
  };
  // 天面の飾り
  const topDeco = (ok: (a: number) => boolean) => {
    const list = CAKE_DECO[kind].filter((d) => ok(d.a)).sort((p, q) => Math.sin(rad(p.a)) - Math.sin(rad(q.a)));
    return list.map((d, i) => {
      const [dx, dy] = P(d.a, d.rf, yt);
      switch (d.t) {
        case "berry": return <TopBerry key={i} x={dx} y={dy} r={17 * k + 2} f={f} ph={i} />;
        case "dollop": return <Dollop key={i} x={dx} y={dy} r={(kind === "mini" ? 11 : 15) * k + 3} col={topCol} shade={sideShade} />;
        case "rose": return <Rose key={i} x={dx} y={dy} r={19 * k} />;
        case "ball": return <g key={i}><circle cx={dx} cy={dy - 4} r={5.5 * k + 1.5} fill={XJ.silverBall} stroke={INK} strokeWidth={2} />
          <circle cx={dx - 2} cy={dy - 6} r={1.8} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 9 + i)} /></g>;
        case "holly": return <Holly key={i} x={dx} y={dy} r={30 * k} />;
        case "paw": return <Paw key={i} x={dx} y={dy} r={22 * k} />;
        case "dot": return <circle key={i} cx={dx} cy={dy} r={6 * k + 1} fill={XJ.berry} stroke={INK} strokeWidth={2} />;
      }
      return null;
    });
  };
  // 天面の真ん中の飾り
  const center = (
    <g>
      {kind === "butter" && (
        <g transform={`translate(0 ${yt - 6}) rotate(-6)`}>
          <rect x={-46} y={-30} width={92} height={40} rx={6} fill={XJ.choco} stroke={INK} strokeWidth={3.5} />
          <path d="M -32 -10 q 8 -10 16 0 t 16 0 t 16 0 t 16 0" stroke={XJ.butter} strokeWidth={4} fill="none" strokeLinecap="round" />
          <rect x={-42} y={-27} width={30} height={5} rx={2} fill={KRP.white} opacity={0.25} />
        </g>
      )}
      {kind === "fresh" && <Holly x={-6} y={yt + 4} r={30} />}
      {kind === "fruit" && (
        <g>
          <Holly x={-10} y={yt + 6} r={34 * k} />
          {/* 砂糖衣のきらめき (光の十字) */}
          {[[-60, 6], [50, -10], [10, 22]].map(([sx, sy], i) => {
            const o = Math.max(0, Math.sin(f / 10 + i * 2));
            return <path key={i} d={`M ${sx} ${yt + sy - 8} L ${sx + 2} ${yt + sy - 2} L ${sx + 8} ${yt + sy} L ${sx + 2} ${yt + sy + 2} L ${sx} ${yt + sy + 8} L ${sx - 2} ${yt + sy + 2} L ${sx - 8} ${yt + sy} L ${sx - 2} ${yt + sy - 2} Z`}
              fill={KRP.white} opacity={o} stroke={KRP.gray} strokeWidth={1} />;
          })}
        </g>
      )}
      {kind === "dog" && (
        <g transform={`translate(-4 ${yt - 4}) rotate(-12)`}>
          <path d="M -40 -6 a 10 10 0 1 1 6 -14 L 34 -20 a 10 10 0 1 1 6 14 a 10 10 0 1 1 -6 14 L -34 8 a 10 10 0 1 1 -6 -14 Z"
            fill="#E7B877" stroke={INK} strokeWidth={3.5} />
          <path d="M -26 -6 L 26 -6" stroke="#C99456" strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
      {kind === "mini" && (
        <g>
          {/* ろうそく (天面の奥) */}
          <g transform={`translate(${-22} ${yt - 8})`}>
            <rect x={-5} y={-54} width={10} height={54} rx={3} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <path d="M -5 -44 L 5 -38 M -5 -30 L 5 -24 M -5 -16 L 5 -10" stroke={KRP.red} strokeWidth={3} />
            <line x1={0} y1={-54} x2={0} y2={-60} stroke={INK} strokeWidth={2.5} />
            <circle cx={0} cy={-72} r={22 + Math.sin(f / 4) * 2} fill={XJ.bulbGlow} opacity={0.35} />
            <path d={`M 0 ${-60} Q ${-8 + Math.sin(f / 3) * 2} -70 ${Math.sin(f / 2.5) * 2.5} ${-86 - Math.sin(f / 3.5) * 3} Q 8 -70 0 -60 Z`}
              fill={KRP.yellow} stroke={KRP.orange} strokeWidth={2.5} />
          </g>
          <TopBerry x={10} y={yt + 6} r={20} f={f} />
        </g>
      )}
    </g>
  );
  const plateRx = R + (kind === "mini" ? 22 : 34);
  const notW = (a: number) => !isCut || !inW(a);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* お皿 */}
      <ellipse cx={0} cy={-6} rx={plateRx} ry={plateRx * 0.36} fill={XJ.plateShade} stroke={INK} strokeWidth={sw} />
      <ellipse cx={0} cy={-12} rx={plateRx * 0.96} ry={plateRx * 0.33} fill={XJ.plate} stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={-12} rx={plateRx * 0.72} ry={plateRx * 0.24} fill="none" stroke={XJ.plateShade} strokeWidth={3} />
      {/* 影 */}
      <ellipse cx={8} cy={yb + 6} rx={R * 1.02} ry={ry * 1.02} fill={INK} opacity={0.14} />
      {/* 本体 */}
      {sideBand(0, 180)}
      {sideDeco(notW)}
      <ellipse cx={0} cy={yt} rx={R} ry={ry} fill={topCol} stroke={INK} strokeWidth={sw} />
      {(kind === "fresh" || kind === "mini") && <ellipse cx={-R * 0.3} cy={yt - ry * 0.3} rx={R * 0.35} ry={ry * 0.25} fill={KRP.white} opacity={0.55} />}
      {kind === "butter" && Array.from({ length: 16 }, (_, i) => {
        const a = i * 22.5 + 190;
        const [bx, by] = P(a, 1, yt);
        return Math.sin(rad(a)) < 0 ? <ellipse key={i} cx={bx} cy={by} rx={10} ry={7} fill={XJ.butter} stroke={INK} strokeWidth={2.5} /> : null;
      })}
      {/* 抜けたあと (お皿が見える+2つの切り口) */}
      {isCut && (
        <g>
          <polygon points={pts([[0, yt], ...arc(W1, W2, yt), ...arc(W2, W1, yb)])} fill={XJ.plate} />
          {face(W1, 0.12)}
          {face(W2, 0)}
        </g>
      )}
      {topDeco((a) => notW(a) && Math.sin(rad(a)) <= 0)}
      {center}
      {topDeco((a) => notW(a) && Math.sin(rad(a)) > 0)}
      {/* 抜けていく1切れ */}
      {isCut && (
        <g transform={`translate(${ox} ${oy})`}>
          <ellipse cx={P(50, 0.6, yb)[0]} cy={P(50, 0.6, yb)[1] + 4} rx={R * 0.45} ry={ry * 0.4} fill={INK} opacity={0.12 * ce} />
          {sideBand(W1, W2)}
          {sideDeco((a) => inW(a))}
          {face(W2, 0)}
          <polygon points={pts([[0, yt], ...arc(W1, W2, yt)])} fill={topCol} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          {topDeco((a) => inW(a))}
        </g>
      )}
    </g>
  );
};

// シュトーレン (Cake kind="stollen" から呼ぶ)
const Stollen: React.FC<{ x: number; y: number; s: number; f: number; cut: number }> = ({ x, y, s, f, cut }) => {
  const c = clamp01(cut);
  const isCut = c > 0.02;
  const E = isCut ? 100 : 130;
  const ce = easeOut(c);
  // 断面の形 (幅120・高さ96。原点 = 底の中心)
  const prof = "M -60 0 Q -66 -60 -36 -88 Q 0 -104 36 -88 Q 66 -60 60 0 Z";
  const inside = (
    <g>
      <path d={prof} fill="#F2D59A" stroke={INK} strokeWidth={5} />
      <path d="M -50 -6 Q -54 -56 -30 -78 Q 0 -92 30 -78 Q 54 -56 50 -6 Z" fill="#F7E2B0" />
      {/* マジパンの芯 */}
      <ellipse cx={0} cy={-42} rx={16} ry={12} fill="#F3EBC4" stroke="#D9C78A" strokeWidth={3} />
      {[[-34, -30, KRP.red], [28, -60, "#8BBF5A"], [-14, -70, "#7A3A22"], [36, -24, KRP.yellow], [-38, -58, "#7A3A22"], [14, -14, KRP.red], [-8, -20, "#8BBF5A"]].map(([px, py, col], i) => (
        <rect key={i} x={(px as number) - 5} y={(py as number) - 4} width={10} height={8} rx={3} fill={col as string} transform={`rotate(${i * 27} ${px} ${py})`} />
      ))}
      {/* 上の粉砂糖の層 */}
      <path d="M -40 -84 Q 0 -110 40 -84 Q 20 -76 0 -80 Q -20 -76 -40 -84 Z" fill={XJ.sugar} stroke={INK} strokeWidth={3} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* まな板 */}
      <rect x={-250} y={-26} width={500} height={34} rx={14} fill="#B98A55" stroke={INK} strokeWidth={6} />
      <path d="M -250 -14 L 250 -14" stroke="#D4A76E" strokeWidth={6} />
      <ellipse cx={-10} cy={-22} rx={210} ry={10} fill={INK} opacity={0.15} />
      <g transform="translate(0 -24)">
        {/* 本体 */}
        <path d={isCut ? `M -186 0 C -214 -40 -200 -98 -140 -100 L ${E} -100 L ${E} 0 Z` : `M -186 0 C -214 -40 -200 -98 -140 -100 L ${E} -100 C 190 -98 204 -40 176 0 Z`} fill="#D9A25A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* 折り返しの段 */}
        <path d={`M -170 -40 Q -60 -66 ${E} -58`} stroke="#B07A38" strokeWidth={6} fill="none" />
        {/* 粉砂糖 */}
        <path d={`M -196 -50 C -200 -98 -170 -112 -130 -112 L ${E} -112 ${isCut ? "" : "C 176 -112 200 -86 198 -56 Q 180 -70 " + E + " -78"} L ${E} -78 Q ${E - 30} -66 ${E - 60} -76 Q ${E - 100} -88 ${E - 140} -72 Q -60 -60 -100 -74 Q -150 -90 -196 -50 Z`}
          fill={XJ.sugar} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={-170 + i * 26} cy={-58 + ((i * 7) % 4) * 6} r={3} fill={XJ.sugar} opacity={0.9} />
        ))}
        {/* きらめき */}
        {[[-120, -100], [-20, -106], [60, -98]].map(([sx, sy], i) => (
          <circle key={`g${i}`} cx={sx} cy={sy} r={5} fill={KRP.white} opacity={Math.max(0, Math.sin(f / 11 + i * 2))} />
        ))}
        {/* 右の端: 切ったら断面 (切っていなければ丸い端のまま) */}
        {isCut && (
          <g transform={`translate(${E} 0) scale(0.36 1)`}>{inside}</g>
        )}
        {/* 切った1切れ (右へ倒れて断面をこちらに向ける) */}
        {isCut && (
          <g transform={`translate(${E + 50 + ce * 120} ${ce * 18}) rotate(${(1 - ce) * -6 + Math.sin(f / 4) * Math.sin(c * Math.PI) * 2}) scale(${lerp(0.36, 1, ce)} ${lerp(1, 0.92, ce)})`}>
            {inside}
          </g>
        )}
      </g>
    </g>
  );
};

/* ===================================================================
 * CakeBox — 昭和のケーキの箱 (3章の終わり〜4章のお父さんが提げる箱)。白い箱・赤いリボン・持ち手。店名なし
 *   x,y: 置いたとき = 箱の底の中心。hang=true のとき = 持ち手のにぎり (手の位置) になり、箱がその下で揺れる
 *   s=1 で 正面の幅 220px・高さ 140px (持ち手まで入れると およそ 245px)。Person s=1 の手 (x+67*s, y-66*s) に hang で提げるなら s≈0.4
 *   f: リボンの端のゆれ (hang のときは箱ごと振り子のように揺れる)
 *   swing: hang のときの揺れの大きさ (度。省略 4)
 * =================================================================== */
export const CakeBox: React.FC<{ x: number; y: number; s?: number; f: number; hang?: boolean; swing?: number }> = ({
  x, y, s = 1, f, hang = false, swing = 4,
}) => {
  const rot = hang ? Math.sin(f / 11) * swing : 0;
  const tail = Math.sin(f / 7) * 5;
  // 持ち手のにぎり = (25, -233)
  const body = (
    <g>
      {/* 影 */}
      {!hang && <ellipse cx={30} cy={2} rx={150} ry={14} fill={INK} opacity={0.16} />}
      {/* 右の面 */}
      <polygon points="110,0 160,-40 160,-180 110,-140" fill={XJ.boxShade} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* 正面 */}
      <rect x={-110} y={-140} width={220} height={140} fill={XJ.box} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-100} y={-132} width={24} height={124} fill={KRP.white} opacity={0.7} />
      {/* 上の面 (ふたの合わせ目つき) */}
      <polygon points="-110,-140 110,-140 160,-180 -60,-180" fill={KRP.white} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <line x1={-85} y1={-160} x2={135} y2={-160} stroke={KRP.gray} strokeWidth={3} />
      {/* リボン: 正面のたて・上の面の十字・右の面のたて */}
      <rect x={-12} y={-140} width={24} height={140} fill={XJ.ribbon} stroke={INK} strokeWidth={3.5} />
      <line x1={-4} y1={-136} x2={-4} y2={-4} stroke={KRP.white} strokeWidth={3} opacity={0.35} />
      <polygon points="-12,-140 12,-140 62,-180 38,-180" fill={XJ.ribbon} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <polygon points="-85,-166 135,-166 135,-154 -85,-154" fill={XJ.ribbon} stroke={INK} strokeWidth={3.5} />
      <polygon points="129,-160 141,-170 141,-30 129,-20" fill={XJ.ribbonDark} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      {/* 丸い金のシール (字なし) */}
      <circle cx={-62} cy={-58} r={16} fill={KRP.gold} stroke={INK} strokeWidth={3} />
      <circle cx={-62} cy={-58} r={9} fill="none" stroke={KRP.brass} strokeWidth={2.5} />
      {/* 持ち手のひも (結び目から上へ) */}
      <path d="M 14 -164 Q 8 -200 18 -228" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 36 -164 Q 42 -200 32 -228" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 14 -164 Q 8 -200 18 -228" stroke={XJ.ribbon} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d="M 36 -164 Q 42 -200 32 -228" stroke={XJ.ribbon} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* にぎり */}
      <rect x={-8} y={-244} width={66} height={22} rx={11} fill={XJ.ribbon} stroke={INK} strokeWidth={5} />
      <rect x={0} y={-240} width={34} height={5} rx={2} fill={KRP.white} opacity={0.4} />
      {/* ちょう結び */}
      <g transform="translate(25 -164)">
        <path d={`M 0 0 Q -10 20 ${-26 + tail} 40 L ${-14 + tail} 42 Q -4 22 0 4`} fill={XJ.ribbon} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M 0 0 Q 12 18 ${30 - tail} 36 L ${40 - tail} 30 Q 16 14 2 2`} fill={XJ.ribbonDark} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d="M 0 0 Q -40 -30 -46 -6 Q -40 14 0 0 Z" fill={XJ.ribbon} stroke={INK} strokeWidth={3.5} />
        <path d="M 0 0 Q 40 -30 46 -6 Q 40 14 0 0 Z" fill={XJ.ribbon} stroke={INK} strokeWidth={3.5} />
        <path d="M -12 -4 Q -30 -16 -36 -6" stroke={XJ.ribbonDark} strokeWidth={2.5} fill="none" />
        <path d="M 12 -4 Q 30 -16 36 -6" stroke={XJ.ribbonDark} strokeWidth={2.5} fill="none" />
        <ellipse cx={0} cy={-1} rx={9} ry={8} fill={XJ.ribbonDark} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
  return hang ? (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot}) translate(-25 233)`}>{body}</g>
  ) : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>{body}</g>
  );
};

/* ===================================================================
 * Ichigo — 顔のあるイチゴ (4章の主役。#83 走ってくる・#90「春だ!」)
 *   x,y: 実の中心。s=1 で 実の高さ およそ 140px (へた・花まで入れると 220px)
 *   face: "normal" | "smile" | "joy" | "surprised" | "worried" | "pant" (息を切らす) | "proud" (どや顔)
 *   sleep: true で目を閉じて眠る (Zz が浮かぶ・ゆっくり上下)
 *   run: true で短い脚が出て走る (腕もふる)
 *   flower: 0〜1 で頭の上に白いイチゴの花が開く (#90)
 *   arms: "down" | "banzai" (省略 down。run のときはふる)
 *   ★目は大きい丸目 (白目+黒目+光)。勝手に小さくしない
 * =================================================================== */
export type IchigoFace = "normal" | "smile" | "joy" | "surprised" | "worried" | "pant" | "proud";
export const Ichigo: React.FC<{
  x: number; y: number; s?: number; f: number; face?: IchigoFace; sleep?: boolean;
  run?: boolean; flower?: number; arms?: "down" | "banzai"; phase?: number; gaze?: [number, number];
}> = ({ x, y, s = 1, f, face = "normal", sleep = false, run = false, flower = 0, arms = "down", phase = 0, gaze = [0, 0] }) => {
  const ff = f + phase * 23;
  const bob = sleep ? Math.sin(ff / 22) * 3 : run ? -Math.abs(Math.sin(ff / 4)) * 12 : Math.sin(ff / 13) * 3;
  const blink = !sleep && (ff % 89) < 5 && f > 2 && face !== "joy";
  const sw = Math.sin(ff / 4);
  const [gx, gy] = gaze;
  const fl = clamp01(flower);
  const body = "M 0 72 C -42 68 -78 12 -72 -28 C -68 -62 -32 -70 0 -62 C 32 -70 68 -62 72 -28 C 78 12 42 68 0 72 Z";
  const seeds: [number, number][] = [[-50, -40], [-58, -6], [-44, 28], [-22, 52], [0, 62], [22, 52], [44, 28], [58, -6], [50, -40],
    [-30, -50], [30, -50], [-14, 40], [14, 40], [-34, 44], [34, 44]];
  const limb = (cx: number, cy: number, rot: number, len: number) => (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <rect x={cx - 6} y={cy} width={12} height={len} rx={6} fill={XJ.calyx} stroke={INK} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${run ? 8 : sleep ? -6 : 0})`}>
      {/* 影 (地面) */}
      {!run && <ellipse cx={0} cy={90 - bob} rx={54} ry={9} fill={INK} opacity={0.12} />}
      {/* 脚 (run のときだけ) */}
      {run && (
        <g>
          {limb(-18, 50, 35 * sw, 52)}
          {limb(18, 50, -35 * sw, 52)}
          <ellipse cx={-18 - Math.sin((35 * sw * Math.PI) / 180) * 52} cy={50 + Math.cos((35 * sw * Math.PI) / 180) * 52} rx={14} ry={8} fill={INK} />
          <ellipse cx={18 + Math.sin((35 * sw * Math.PI) / 180) * 52} cy={50 + Math.cos((35 * sw * Math.PI) / 180) * 52} rx={14} ry={8} fill={INK} />
        </g>
      )}
      {/* 腕 (2本) */}
      {run ? (
        <g>{limb(-66, -4, 50 + 35 * sw, 36)}{limb(66, -4, -50 + 35 * sw, 36)}</g>
      ) : arms === "banzai" ? (
        <g>{limb(-62, -20, 140 + Math.sin(ff / 8) * 6, 38)}{limb(62, -20, -140 - Math.sin(ff / 8) * 6, 38)}</g>
      ) : (
        <g>{limb(-66, -4, 24, 30)}{limb(66, -4, -24, 30)}</g>
      )}
      {/* 実 */}
      <path d={body} fill={XJ.berry} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 40 -50 C 66 -40 70 10 40 52" stroke={XJ.berryDark} strokeWidth={10} fill="none" opacity={0.35} strokeLinecap="round" />
      <ellipse cx={-44} cy={-34} rx={10} ry={20} fill={KRP.white} opacity={0.4 + 0.15 * Math.sin(ff / 15)} transform="rotate(25 -44 -34)" />
      {seeds.map(([sx, sy], i) => (
        <path key={i} d={`M ${sx} ${sy - 5} Q ${sx + 4} ${sy} ${sx} ${sy + 5} Q ${sx - 4} ${sy} ${sx} ${sy - 5} Z`} fill={XJ.seed} stroke={XJ.berryDark} strokeWidth={1.2} />
      ))}
      {/* へた */}
      <g transform="translate(0 -62)">
        {[-70, -35, 0, 35, 70].map((a, i) => (
          <path key={i} d="M 0 0 Q -10 -6 -6 -30 Q 0 -36 6 -30 Q 10 -6 0 0 Z" fill={i % 2 ? XJ.calyxDark : XJ.calyx} stroke={INK} strokeWidth={3.5}
            transform={`rotate(${a + 180 + Math.sin(ff / 17 + i) * 3}) translate(0 -2)`} />
        ))}
        <path d="M 0 -4 Q 2 -24 -4 -38" stroke={XJ.calyxDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* 花 (flower) */}
        {fl > 0.01 && (
          <g transform={`translate(-4 -40) scale(${pop(fl)}) rotate(${Math.sin(ff / 20) * 5})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-16} rx={11} ry={15} fill={KRP.white} stroke={INK} strokeWidth={3} transform={`rotate(${a + (1 - fl) * 40})`} />
            ))}
            <circle r={9} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5].map((j) => <circle key={j} cx={Math.cos(j) * 4} cy={Math.sin(j) * 4} r={1.6} fill="#C99A1E" />)}
          </g>
        )}
      </g>
      {/* ほっぺ */}
      <ellipse cx={-42} cy={14} rx={11} ry={7} fill={XJ.berryLight} opacity={0.85} />
      <ellipse cx={42} cy={14} rx={11} ry={7} fill={XJ.berryLight} opacity={0.85} />
      {/* 目 (大きい丸目) */}
      {sleep || blink || face === "joy" ? (
        <g fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round">
          {face === "joy" && !sleep ? (
            <><path d="M -36 -10 Q -24 -26 -12 -10" /><path d="M 12 -10 Q 24 -26 36 -10" /></>
          ) : (
            <><path d="M -36 -14 Q -24 -4 -12 -14" /><path d="M 12 -14 Q 24 -4 36 -14" /></>
          )}
        </g>
      ) : (
        <g>
          {[-24, 24].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex} cy={-16} rx={16} ry={20} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
              <circle cx={ex + gx + (face === "proud" ? 0 : 0)} cy={-14 + gy + (face === "worried" ? 3 : 0)} r={face === "surprised" ? 6 : 9} fill={INK} />
              <circle cx={ex + gx - 3} cy={-18 + gy} r={3} fill={KRP.white} />
            </g>
          ))}
          {face === "proud" && (
            // 半目 (まぶたが半分おりる)
            <g>
              {[-24, 24].map((ex) => <path key={ex} d={`M ${ex - 17} -18 Q ${ex} -40 ${ex + 17} -18 Z`} fill={XJ.berry} stroke={INK} strokeWidth={4} />)}
            </g>
          )}
        </g>
      )}
      {/* 眉 */}
      {face === "worried" || face === "pant" ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-36} y1={-46} x2={-14} y2={-40} /><line x1={14} y1={-40} x2={36} y2={-46} /></g>
      ) : face === "surprised" ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-34} y1={-48} x2={-14} y2={-48} /><line x1={14} y1={-48} x2={34} y2={-48} /></g>
      ) : null}
      {/* 口 */}
      {sleep ? (
        <ellipse cx={0} cy={20} rx={5} ry={5 + Math.sin(ff / 22) * 1.5} fill={INK} />
      ) : face === "smile" || face === "proud" ? (
        <path d="M -14 14 Q 0 28 14 14" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "joy" ? (
        <g><path d="M -18 12 Q 0 40 18 12 Z" fill={INK} /><ellipse cx={0} cy={26} rx={7} ry={3.5} fill={XJ.berryLight} /></g>
      ) : face === "surprised" ? (
        <ellipse cx={0} cy={22} rx={9} ry={12} fill={INK} />
      ) : face === "pant" ? (
        <g><ellipse cx={0} cy={22} rx={12} ry={9 + Math.abs(Math.sin(ff / 3)) * 5} fill={INK} /><ellipse cx={0} cy={28} rx={6} ry={3} fill={XJ.berryLight} /></g>
      ) : face === "worried" ? (
        <path d="M -12 22 Q 0 14 12 22" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <line x1={-10} y1={18} x2={10} y2={18} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      )}
      {/* 汗と息 (pant) */}
      {face === "pant" && (
        <g>
          {[0, 1].map((i) => {
            const t = ((ff * 1.2 + i * 18) % 36) / 36;
            return <path key={i} d={`M ${70 + t * 30} ${-50 - i * 16 + t * 20} q -7 10 0 14 q 7 -4 0 -14 Z`} fill="#8EC3E6" stroke={INK} strokeWidth={2.5} opacity={1 - t} />;
          })}
          {[0, 1].map((i) => {
            const t = ((ff + i * 15) % 30) / 30;
            return <circle key={`p${i}`} cx={-30 - t * 50} cy={28 + i * 6} r={6 + t * 10} fill={KRP.white} stroke={KRP.gray} strokeWidth={2} opacity={0.8 * (1 - t)} />;
          })}
        </g>
      )}
      {/* Zz (sleep) */}
      {sleep && [0, 1, 2].map((i) => {
        const t = ((ff * 0.6 + i * 20) % 60) / 60;
        return <text key={i} x={56 + t * 40 + i * 6} y={-60 - t * 70} fontFamily={FONT} fontWeight={900} fontSize={22 + i * 8}
          fill={KRP.blueDeep} opacity={Math.sin(t * Math.PI)}>Z</text>;
      })}
    </g>
  );
};

/* ===================================================================
 * IchigoHouse — 冬のイチゴのハウス (4章・栃木)。1920×1080 いっぱいの舞台 (中から奥を見る)
 *   ビニールの屋根 (アーチの骨組み)・3本の畝 (マルチの上に株・白い花・赤い実)・電照の電球・暖房機とダクト・奥の出入り口から冬の外
 *   light: 電照 0〜1 (電球が灯り、光の丸が広がり、ハウスの中が暖かい色になる)。0 は消えている
 *   snow:  true で外は雪 (出入り口の外に雪が降り積もり、屋根に雪の影)
 *   f: 葉のゆれ・暖房の温風・雪・電球のわずかなゆれ
 *   人を立たせるなら 通路 (x≈660 / x≈1260、y 850〜1080) が空いている
 * =================================================================== */
const IH_VP: [number, number] = [960, 470];
export const IchigoHouse: React.FC<{ f: number; light?: number; snow?: boolean }> = ({ f, light = 0, snow = false }) => {
  const L = clamp01(light);
  const BACK_Y = 650, FRONT_Y = 1210;
  const ridges = [{ b: 870, fr: 340 }, { b: 960, fr: 960 }, { b: 1050, fr: 1580 }];
  const depth = (u: number) => Math.pow(u, 1.7); // 奥 0 → 手前 1
  const at = (b: number, fr: number, t: number): [number, number, number] => [lerp(b, fr, t), lerp(BACK_Y, FRONT_Y, t), lerp(0.16, 1.25, t)];
  const ribs = [0, 0.08, 0.2, 0.36, 0.56, 0.8, 1.05];
  const rib = (t: number) => {
    const by = lerp(BACK_Y, 1400, t), hw = lerp(300, 1500, t), hh = lerp(330, 1500, t);
    return `M ${960 - hw} ${by} A ${hw} ${hh} 0 0 1 ${960 + hw} ${by}`;
  };
  const leafCol = lerp(0, 1, L) > 0.5 ? "#6FB25C" : "#5E9E4A";
  const plant = (px: number, py: number, k: number, i: number) => {
    const sway = Math.sin(f / 19 + i * 1.7) * 4;
    return (
      <g key={`${px}-${py}`} transform={`translate(${px} ${py}) scale(${k})`}>
        {/* 葉 (3枚1組 × 3) */}
        {[-40, 0, 40].map((a, j) => (
          <g key={j} transform={`rotate(${a + sway})`}>
            <line x1={0} y1={0} x2={0} y2={-46} stroke={XJ.calyxDark} strokeWidth={5} />
            {[-30, 0, 30].map((b, m) => (
              <ellipse key={m} cx={0} cy={-62} rx={13} ry={20} fill={j === 1 ? leafCol : XJ.calyx} stroke={INK} strokeWidth={3.5}
                transform={`rotate(${b} 0 -46)`} />
            ))}
          </g>
        ))}
        {/* 白い花 */}
        {i % 2 === 0 && (
          <g transform={`translate(${24 + sway} -40)`}>
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-7} rx={6} ry={8} fill={KRP.white} stroke={INK} strokeWidth={2} transform={`rotate(${a})`} />)}
            <circle r={4} fill={KRP.yellow} />
          </g>
        )}
        {/* 赤い実 (畝の肩から垂れる) */}
        {[-1, 1].map((d) => (i + d) % 3 !== 0 && (
          <g key={d} transform={`translate(${d * 34} ${14 + Math.sin(f / 23 + i) * 1.5})`}>
            <path d="M 0 -10 Q -14 -6 -11 8 Q -6 22 0 24 Q 6 22 11 8 Q 14 -6 0 -10 Z" fill={XJ.berry} stroke={INK} strokeWidth={3} />
            <path d="M -8 -10 L 0 -6 L 8 -10" stroke={XJ.calyx} strokeWidth={4} fill="none" strokeLinecap="round" />
            <circle cx={-4} cy={2} r={2.5} fill={KRP.white} opacity={0.6} />
          </g>
        ))}
      </g>
    );
  };
  const bulbs = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8];
  const wires = [{ b: 900, fr: 520, yb: 380, yf: 40 }, { b: 1020, fr: 1400, yb: 380, yf: 40 }];
  return (
    <g>
      <defs>
        <linearGradient id="xjIHsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={snow ? "#5D6F98" : "#7F9CC6"} /><stop offset="1" stopColor={snow ? "#A9B6CF" : "#D7E3EE"} />
        </linearGradient>
        <linearGradient id="xjIHfilm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={snow ? "#C7D3DD" : XJ.film} /><stop offset="1" stopColor="#F2F6F6" />
        </linearGradient>
        <clipPath id="xjIHdoor"><path d="M 840 650 L 840 470 Q 960 420 1080 470 L 1080 650 Z" /></clipPath>
      </defs>
      {/* ビニールの内側 */}
      <rect x={-40} y={-40} width={2000} height={1160} fill="url(#xjIHfilm)" />
      {/* 外の雪が透ける (屋根の上に積もった影・降る雪) */}
      {snow && (
        <g>
          {[[300, 120, 260], [760, 40, 220], [1240, 70, 300], [1650, 160, 240], [520, 260, 160], [1420, 280, 180]].map(([sx, sy, r], i) => (
            <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.35} fill="#9FB0C2" opacity={0.28} />
          ))}
          {Array.from({ length: 40 }, (_, i) => {
            const sx = (i * 173) % 1960, sy = ((i * 97 + f * (1.6 + (i % 3) * 0.5)) % 1100) - 20;
            return <circle key={i} cx={sx + Math.sin(f / 20 + i) * 10} cy={sy} r={3 + (i % 3)} fill={KRP.white} opacity={0.35} />;
          })}
        </g>
      )}
      {/* 骨組みのアーチ (奥から手前へ) */}
      {ribs.map((t, i) => (
        <g key={i}>
          <path d={rib(t)} stroke={INK} strokeWidth={lerp(5, 14, t)} fill="none" />
          <path d={rib(t)} stroke={XJ.vinylFrame} strokeWidth={lerp(2.5, 7, t)} fill="none" />
        </g>
      ))}
      {/* 屋根の通しの棒 (奥へ向かう線) */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((k, i) => (
        <line key={i} x1={960 + k * 300} y1={BACK_Y - 330 * Math.sqrt(1 - k * k)} x2={960 + k * 1800} y2={1400 - 1500 * Math.sqrt(1 - k * k)}
          stroke={XJ.vinylFrame} strokeWidth={5} opacity={0.8} />
      ))}
      {/* 奥の出入り口と外 */}
      <g clipPath="url(#xjIHdoor)">
        <rect x={820} y={400} width={280} height={260} fill="url(#xjIHsky)" />
        <path d="M 820 600 Q 900 560 980 590 Q 1040 570 1100 590 L 1100 660 L 820 660 Z" fill={snow ? "#E8EEF4" : "#9DB07A"} />
        <path d="M 820 620 L 1100 620 L 1100 660 L 820 660 Z" fill={snow ? KRP.white : "#B8A27A"} />
        {snow && Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={830 + ((i * 53) % 260)} cy={400 + ((i * 41 + f * 1.8) % 230)} r={3} fill={KRP.white} />
        ))}
      </g>
      <path d="M 840 650 L 840 470 Q 960 420 1080 470 L 1080 650" stroke={INK} strokeWidth={6} fill="none" />
      <path d="M 960 445 L 960 650" stroke={XJ.vinylFrame} strokeWidth={4} />
      {/* 床 (通路の土) */}
      <polygon points={`${640},${BACK_Y} ${1280},${BACK_Y} 2200,${FRONT_Y} -280,${FRONT_Y}`} fill={XJ.soil} />
      <polygon points={`${640},${BACK_Y} ${1280},${BACK_Y} 2200,${FRONT_Y} -280,${FRONT_Y}`} fill="#E8D2A8" opacity={0.18} />
      <line x1={640} y1={BACK_Y} x2={1280} y2={BACK_Y} stroke={INK} strokeWidth={4} />
      {/* 暖房のダクト (右の通路を奥へ。穴から温風) */}
      <g>
        <path d="M 1840 880 Q 1500 790 1110 660" stroke={INK} strokeWidth={54} fill="none" strokeLinecap="round" />
        <path d="M 1840 880 Q 1500 790 1110 660" stroke="#EDF3F6" strokeWidth={44} fill="none" strokeLinecap="round" />
        <path d="M 1840 868 Q 1500 778 1110 652" stroke={KRP.white} strokeWidth={10} fill="none" opacity={0.8} />
        {[0.15, 0.35, 0.55, 0.75].map((t, i) => {
          const qx = (1 - t) * (1 - t) * 1840 + 2 * (1 - t) * t * 1500 + t * t * 1110;
          const qy = (1 - t) * (1 - t) * 880 + 2 * (1 - t) * t * 790 + t * t * 660;
          const k = lerp(1, 0.4, t);
          return (
            <g key={i}>
              <circle cx={qx} cy={qy} r={7 * k} fill="#B9C2C8" stroke={INK} strokeWidth={2} />
              {[0, 1].map((j) => {
                const tt = ((f * 1.3 + j * 20 + i * 9) % 40) / 40;
                return <path key={j} d={`M ${qx - 10 * k} ${qy - 14 * k - tt * 60 * k} q ${10 * k} ${-10 * k} 0 ${-20 * k} q ${-10 * k} ${-10 * k} 0 ${-20 * k}`}
                  stroke="#F6B07A" strokeWidth={4 * k + 1} fill="none" strokeLinecap="round" opacity={0.7 * Math.sin(tt * Math.PI)} />;
              })}
            </g>
          );
        })}
      </g>
      {/* 暖房機 (右手前) */}
      <g transform="translate(1800 900)">
        <rect x={-130} y={-260} width={260} height={290} rx={14} fill={KRP.silver} stroke={INK} strokeWidth={7} />
        <rect x={-110} y={-236} width={110} height={70} rx={6} fill="#5A5E66" stroke={INK} strokeWidth={4} />
        <circle cx={-80} cy={-200} r={9} fill={KRP.orange} opacity={0.6 + 0.4 * Math.sin(f / 5)} />
        <rect x={-40} y={-210} width={26} height={12} rx={4} fill="#8FD18A" />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-110} y1={-140 + i * 22} x2={110} y2={-140 + i * 22} stroke={KRP.grayDark} strokeWidth={5} />)}
        <path d="M 30 -250 L 30 -320 Q 30 -340 50 -340 L 60 -340" stroke={KRP.grayDark} strokeWidth={22} fill="none" />
        <path d="M 30 -250 L 30 -320 Q 30 -340 50 -340 L 60 -340" stroke={INK} strokeWidth={4} fill="none" opacity={0.6} />
      </g>
      {/* 畝 (マルチをかぶった盛り土) */}
      {ridges.map((r, i) => {
        const bw = 26, fw = 190;
        return (
          <g key={i}>
            <polygon points={`${r.b - bw - 6},${BACK_Y + 4} ${r.b + bw + 6},${BACK_Y + 4} ${r.fr + fw + 30},${FRONT_Y + 10} ${r.fr - fw - 30},${FRONT_Y + 10}`} fill="#6F523A" />
            <polygon points={`${r.b - bw},${BACK_Y - 6} ${r.b + bw},${BACK_Y - 6} ${r.fr + fw},${FRONT_Y - 70} ${r.fr - fw},${FRONT_Y - 70}`}
              fill={XJ.mulch} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <line x1={r.b} y1={BACK_Y - 6} x2={r.fr} y2={FRONT_Y - 70} stroke="#8A8096" strokeWidth={4} opacity={0.6} />
          </g>
        );
      })}
      {/* 電照の光だまり (畝の上) */}
      {L > 0.01 && ridges.map((r, i) => bulbs.map((u, j) => {
        const [px, py, k] = at(r.b, r.fr, depth(u + 0.06));
        return <ellipse key={`${i}${j}`} cx={px} cy={py - 60 * k} rx={150 * k} ry={46 * k} fill={XJ.bulbGlow} opacity={0.3 * L} />;
      }))}
      {/* 株 (奥から手前へ) */}
      {Array.from({ length: 9 }, (_, n) => n).map((n) => ridges.map((r, i) => {
        const u = 0.04 + n * 0.115;
        const [px, py, k] = at(r.b, r.fr, depth(u));
        return plant(px, py - 64 * k - 4, k * 0.9, n * 3 + i);
      }))}
      {/* 電球の線と電球 */}
      {wires.map((w, i) => (
        <g key={i}>
          <line x1={w.b} y1={w.yb} x2={w.fr} y2={w.yf} stroke={INK} strokeWidth={3} />
          {bulbs.map((u, j) => {
            const t = depth(u);
            const wx = lerp(w.b, w.fr, t), wy = lerp(w.yb, w.yf, t);
            const k = lerp(0.25, 1.2, t);
            const sway = Math.sin(f / 21 + j + i) * 2 * k;
            const drop = 70 * k;
            return (
              <g key={j}>
                <line x1={wx} y1={wy} x2={wx + sway} y2={wy + drop} stroke={INK} strokeWidth={2.5 * k + 0.5} />
                {L > 0.01 && <circle cx={wx + sway} cy={wy + drop + 18 * k} r={90 * k * (0.6 + 0.4 * L)} fill={XJ.bulbGlow} opacity={0.28 * L} />}
                {L > 0.01 && <circle cx={wx + sway} cy={wy + drop + 18 * k} r={40 * k} fill={XJ.bulb} opacity={0.55 * L} />}
                <rect x={wx + sway - 7 * k} y={wy + drop - 2} width={14 * k} height={10 * k} fill={KRP.grayDark} stroke={INK} strokeWidth={2} />
                <ellipse cx={wx + sway} cy={wy + drop + 18 * k} rx={13 * k} ry={16 * k}
                  fill={L > 0.01 ? (L > 0.5 ? XJ.bulb : "#FFF3CC") : "#EEF0EE"} stroke={INK} strokeWidth={2.5 * k + 0.5} />
                <ellipse cx={wx + sway - 4 * k} cy={wy + drop + 12 * k} rx={3 * k} ry={5 * k} fill={KRP.white} opacity={0.8} />
              </g>
            );
          })}
        </g>
      ))}
      {/* 温度計 (右の線の手前にぶら下がる) */}
      <g transform={`translate(1500 ${120 + Math.sin(f / 25) * 2}) rotate(${Math.sin(f / 25) * 3})`}>
        <line x1={0} y1={-140} x2={0} y2={0} stroke={INK} strokeWidth={3} />
        <rect x={-22} y={0} width={44} height={170} rx={10} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <rect x={-5} y={24} width={10} height={110} rx={5} fill={KRP.paperCool} stroke={INK} strokeWidth={2.5} />
        <rect x={-5} y={lerp(100, 54, snow ? 0.55 : 0.8)} width={10} height={134 - lerp(100, 54, snow ? 0.55 : 0.8)} rx={5} fill={KRP.red} />
        <circle cx={0} cy={142} r={12} fill={KRP.red} stroke={INK} strokeWidth={3} />
        {[40, 60, 80, 100, 120].map((ty) => <line key={ty} x1={8} y1={ty} x2={16} y2={ty} stroke={INK} strokeWidth={2.5} />)}
      </g>
      {/* 電照の暖かい空気 */}
      {L > 0.01 && <rect x={-40} y={-40} width={2000} height={1160} fill="#FFC86A" opacity={0.15 * L} />}
    </g>
  );
};

/* ===================================================================
 * Chicken — ごちそうの鶏 (5章)
 *   x,y: お皿 (fried は紙の箱) の底の中心。s=1 で お皿の幅 およそ 340px
 *   kind: "roast" 丸ごとのローストチキン (脚の先に白い紙の飾り) / "fried" 骨付きの揚げた鶏 (茶色の紙の箱。しまのバケツ・人形・看板は描かない) /
 *         "turkey" 七面鳥 (ひと回り大きく焦げ茶・ぶどうとクランベリー) / "kiji" きじの丸焼き (細長い体・飾りの長い尾羽)
 *   f: 湯気・照りのつや
 * =================================================================== */
export type ChickenKind = "roast" | "fried" | "turkey" | "kiji";
const bumpy = (rx: number, ry: number, seed: number, n = 48) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.07 * Math.sin(a * 7 + seed) + 0.05 * Math.sin(a * 13 + seed * 2) + 0.03 * Math.sin(a * 23 + seed);
    return `${(Math.cos(a) * rx * r).toFixed(1)},${(Math.sin(a) * ry * r).toFixed(1)}`;
  }).join(" ");
const Steam: React.FC<{ f: number; xs: number[]; y: number; k?: number }> = ({ f, xs, y, k = 1 }) => (
  <g>
    {xs.map((sx, i) => {
      const t = ((f * 0.8 + i * 19) % 60) / 60;
      return <path key={i} d={`M ${sx} ${y} q ${14 * k} ${-24 * k} 0 ${-48 * k} q ${-14 * k} ${-24 * k} 0 ${-48 * k}`} stroke={KRP.white} strokeWidth={7 * k}
        fill="none" strokeLinecap="round" opacity={0.6 * Math.sin(t * Math.PI)} transform={`translate(${Math.sin(f / 14 + i) * 8} ${-t * 60 * k})`} />;
    })}
  </g>
);
const Frill: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-10} y={-14} width={20} height={26} rx={4} fill={XJ.bone} stroke={INK} strokeWidth={3.5} />
    <path d="M -16 -12 L -12 -34 L -6 -20 L 0 -38 L 6 -20 L 12 -34 L 16 -12 Z" fill={KRP.white} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <line x1={-14} y1={-6} x2={14} y2={-6} stroke={KRP.red} strokeWidth={3} />
  </g>
);
export const Chicken: React.FC<{ x: number; y: number; s?: number; f: number; kind?: ChickenKind }> = ({ x, y, s = 1, f, kind = "roast" }) => {
  const shine = 0.35 + 0.25 * Math.sin(f / 16);
  if (kind === "fried") {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={10} cy={2} rx={170} ry={16} fill={INK} opacity={0.15} />
        {/* 箱の奥の縁 */}
        <polygon points="-130,-170 130,-170 150,-190 -110,-190" fill={XJ.kraftDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* 中身 (骨付きの揚げた鶏 4つ) */}
        {[
          { cx: -70, cy: -196, rx: 62, ry: 46, rot: -20, sd: 1, bone: [-118, -238, -40] },
          { cx: 60, cy: -204, rx: 66, ry: 48, rot: 16, sd: 4, bone: [116, -250, 40] },
          { cx: -4, cy: -226, rx: 58, ry: 44, rot: -6, sd: 7, bone: null },
          { cx: 10, cy: -180, rx: 70, ry: 40, rot: 4, sd: 10, bone: null },
        ].map((p, i) => (
          <g key={i}>
            {p.bone && (
              <g transform={`rotate(${p.bone[2]} ${p.bone[0]} ${p.bone[1]})`}>
                <rect x={p.bone[0] - 9} y={p.bone[1]} width={18} height={44} rx={8} fill={XJ.bone} stroke={INK} strokeWidth={3.5} />
                <circle cx={p.bone[0] - 7} cy={p.bone[1]} r={9} fill={XJ.bone} stroke={INK} strokeWidth={3} />
                <circle cx={p.bone[0] + 7} cy={p.bone[1]} r={9} fill={XJ.bone} stroke={INK} strokeWidth={3} />
              </g>
            )}
            <g transform={`translate(${p.cx} ${p.cy}) rotate(${p.rot})`}>
              <polygon points={bumpy(p.rx, p.ry, p.sd)} fill={XJ.fried} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              {Array.from({ length: 9 }, (_, j) => (
                <circle key={j} cx={((j * 37) % (p.rx * 1.4)) - p.rx * 0.7} cy={((j * 23) % (p.ry * 1.2)) - p.ry * 0.6} r={4 + (j % 3) * 2}
                  fill={j % 2 ? XJ.friedLight : XJ.friedDark} opacity={0.8} />
              ))}
              <ellipse cx={-p.rx * 0.3} cy={-p.ry * 0.4} rx={p.rx * 0.35} ry={p.ry * 0.18} fill={XJ.friedLight} opacity={shine + 0.2} />
            </g>
          </g>
        ))}
        {/* 箱の正面 (無地の茶色の紙。字・しまなし) */}
        <polygon points="-130,-170 130,-170 112,0 -112,0" fill={XJ.kraft} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <polygon points="130,-170 150,-190 132,-16 112,0" fill={XJ.kraftDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -126 -150 L 126 -150" stroke={XJ.kraftDark} strokeWidth={4} />
        {/* 油のしみ */}
        <ellipse cx={-50} cy={-92} rx={26} ry={18} fill={XJ.kraftDark} opacity={0.35} />
        <ellipse cx={58} cy={-50} rx={14} ry={10} fill={XJ.kraftDark} opacity={0.3} />
        <Steam f={f} xs={[-40, 20, 70]} y={-260} />
      </g>
    );
  }
  const big = kind === "turkey" ? 1.22 : 1;
  const kiji = kind === "kiji";
  const col = kind === "turkey" ? "#A9662E" : kind === "kiji" ? "#B87638" : XJ.roast;
  const dark = kind === "turkey" ? "#6E3F1A" : XJ.roastDark;
  const light = kind === "turkey" ? "#D08E4E" : XJ.roastLight;
  const brx = (kiji ? 132 : 112) * big, bry = (kiji ? 54 : 70) * big;
  const bcy = -26 - bry;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* お皿 (楕円の大皿) */}
      <ellipse cx={0} cy={-8} rx={180 * big} ry={50 * big} fill={XJ.plateShade} stroke={INK} strokeWidth={6} />
      <ellipse cx={0} cy={-14} rx={170 * big} ry={44 * big} fill={XJ.plate} stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={-14} rx={140 * big} ry={34 * big} fill="none" stroke={kind === "kiji" ? "#4A78B8" : XJ.plateShade} strokeWidth={4} opacity={0.7} />
      {/* きじの尾羽 (体の奥に刺さる飾り) */}
      {kiji && [-18, -6, 8].map((a, i) => (
        <g key={i} transform={`translate(${110} ${bcy - 10}) rotate(${a + 40 + Math.sin(f / 18 + i) * 2})`}>
          <path d="M -10 0 Q -26 -120 4 -260 Q 30 -120 16 0 Z" fill="#C9995A" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, j) => (
            <path key={j} d={`M ${-14 + j * 1.6} ${-20 - j * 29} q 14 -8 ${28 - j * 2.4} -2`} stroke="#5A3A1E" strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* つけあわせ (奥) */}
      {kind === "turkey" ? (
        <g>
          {[[-170, -40], [-150, -60], [-185, -58], [-162, -78]].map(([gx, gy], i) => <circle key={i} cx={gx} cy={gy} r={15} fill="#7B4E9E" stroke={INK} strokeWidth={3} />)}
          {[[160, -46], [178, -60], [146, -62], [168, -30]].map(([gx, gy], i) => <circle key={`c${i}`} cx={gx} cy={gy} r={9} fill={KRP.red} stroke={INK} strokeWidth={2.5} />)}
        </g>
      ) : (
        <g>
          {[[-150, -44], [150, -44]].map(([px, py], i) => (
            <g key={i} transform={`translate(${px} ${py})`}>
              {[-16, 0, 16].map((dx, j) => <circle key={j} cx={dx} cy={-Math.abs(dx) * 0.4 - 6} r={14} fill={XJ.parsley} stroke={INK} strokeWidth={3} />)}
            </g>
          ))}
        </g>
      )}
      {/* 体 */}
      <ellipse cx={0} cy={bcy} rx={brx} ry={bry} fill={col} stroke={INK} strokeWidth={6} />
      <path d={`M ${-brx * 0.8} ${bcy + bry * 0.3} Q 0 ${bcy + bry * 1.05} ${brx * 0.8} ${bcy + bry * 0.3}`} fill={dark} opacity={0.3} />
      <ellipse cx={-brx * 0.25} cy={bcy - bry * 0.4} rx={brx * 0.45} ry={bry * 0.28} fill={light} opacity={shine + 0.25} />
      <ellipse cx={-brx * 0.35} cy={bcy - bry * 0.5} rx={brx * 0.16} ry={bry * 0.08} fill={KRP.white} opacity={shine} />
      {/* 皮のこげ目 */}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M ${-brx * 0.7 + i * brx * 0.22} ${bcy + bry * 0.1 - (i % 2) * 14} q 10 -6 20 0`} stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
      ))}
      {/* 胸の合わせ目 */}
      <path d={`M ${brx * 0.05} ${bcy - bry * 0.9} Q ${brx * 0.12} ${bcy} ${brx * 0.02} ${bcy + bry * 0.8}`} stroke={dark} strokeWidth={4} fill="none" opacity={0.7} />
      {/* 手羽 (左右) */}
      {[-1, 1].map((d) => (
        <path key={d} d={`M ${d * brx * 0.82} ${bcy - bry * 0.1} q ${d * 34} ${10} ${d * 22} ${bry * 0.7} q ${-d * 20} ${4} ${-d * 30} ${-bry * 0.3} Z`}
          fill={col} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      ))}
      {/* 脚 (もも+骨+紙の飾り)。きじは細い */}
      {[-1, 1].map((d) => {
        const lx = d * brx * 0.45, ly = bcy + bry * 0.35;
        const tipX = d * brx * (kiji ? 0.95 : 0.85), tipY = bcy - bry * (kiji ? 1.0 : 1.25);
        const ang = (Math.atan2(tipY - ly, tipX - lx) * 180) / Math.PI;
        const len = Math.hypot(tipX - lx, tipY - ly);
        return (
          <g key={d}>
            <g transform={`translate(${lx} ${ly}) rotate(${ang})`}>
              <path d={`M -10 ${-26 * big} Q ${len * 0.4} ${-32 * big} ${len * 0.74} -9 L ${len * 0.74} 9 Q ${len * 0.4} ${32 * big} -10 ${26 * big} Q -40 0 -10 ${-26 * big} Z`}
                fill={col} stroke={INK} strokeWidth={5} strokeLinejoin="round" transform={kiji ? "scale(1 0.7)" : undefined} />
              <rect x={len * 0.7} y={-8} width={len * 0.3} height={16} rx={7} fill={XJ.bone} stroke={INK} strokeWidth={3.5} />
              <path d={`M 0 -14 Q ${len * 0.35} -22 ${len * 0.65} -6`} stroke={light} strokeWidth={6} fill="none" strokeLinecap="round" opacity={shine + 0.3} />
            </g>
            <Frill x={tipX} y={tipY} rot={ang + 90} />
          </g>
        );
      })}
      {/* つけあわせ (手前): ミニトマトとレモン / 七面鳥はローズマリー */}
      {kind === "turkey" ? (
        [-60, 60].map((rx2, i) => (
          <g key={i} transform={`translate(${rx2} -22) rotate(${i ? 20 : -20})`}>
            <line x1={-40} y1={0} x2={40} y2={0} stroke="#4E7442" strokeWidth={4} />
            {Array.from({ length: 8 }, (_, j) => <line key={j} x1={-36 + j * 10} y1={0} x2={-30 + j * 10} y2={j % 2 ? -12 : 12} stroke="#4E7442" strokeWidth={4} strokeLinecap="round" />)}
          </g>
        ))
      ) : (
        <g>
          {[[-110, -24], [118, -22], [-86, -10]].map(([tx, ty], i) => (
            <g key={i}><circle cx={tx} cy={ty} r={16} fill={KRP.red} stroke={INK} strokeWidth={3.5} /><circle cx={tx - 5} cy={ty - 5} r={4} fill={KRP.white} opacity={0.6} />
              <path d={`M ${tx - 6} ${ty - 15} l 6 4 l 6 -4`} stroke={XJ.calyx} strokeWidth={3.5} fill="none" /></g>
          ))}
          <g transform="translate(90 -14)">
            <ellipse rx={20} ry={11} fill={KRP.yellow} stroke={INK} strokeWidth={3.5} />
            <ellipse rx={13} ry={6} fill="#FBEFA0" />
          </g>
        </g>
      )}
      <Steam f={f} xs={[-50, 10, 60]} y={bcy - bry - 20} k={big} />
    </g>
  );
};

/* ===================================================================
 * Kadomatsu — 門松 (背骨のツリーのすぐ隣にいつも立つ。落ちで主役になる)
 *   x,y: 足元 (こもの底) の中心。s=1 で 高さ およそ 720px・幅 320px
 *   f: 松葉のゆれ・飾りなわの房のゆれ・梅の花びらがときどき舞う
 *   flip: true で左右反対 (2本を対で立てるとき)
 * =================================================================== */
export const Kadomatsu: React.FC<{ x: number; y: number; s?: number; f: number; flip?: boolean }> = ({ x, y, s = 1, f, flip = false }) => {
  const bamboos = [{ bx: 0, top: -700, w: 56 }, { bx: -60, top: -600, w: 52 }, { bx: 58, top: -520, w: 52 }];
  const sway = Math.sin(f / 21) * 2.5;
  const pineTuft = (px: number, py: number, r: number, i: number) => (
    <g key={`p${i}`} transform={`translate(${px} ${py}) rotate(${Math.sin(f / 19 + i) * 3})`}>
      {Array.from({ length: 15 }, (_, j) => {
        const a = (-170 + j * 12) * Math.PI / 180;
        return <line key={j} x1={0} y1={0} x2={Math.cos(a) * r} y2={Math.sin(a) * r * 0.8} stroke={j % 2 ? XJ.pine : XJ.pineDark} strokeWidth={5} strokeLinecap="round" />;
      })}
      <circle r={6} fill={XJ.pineDark} />
    </g>
  );
  const petalT = (f % 150) / 150;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={170} ry={18} fill={INK} opacity={0.16} />
      {/* 竹 (斜めにそいだ口。右が高い) */}
      {bamboos.map((b, i) => {
        const l = b.bx - b.w / 2, r = b.bx + b.w / 2, dh = b.w * 0.95;
        const cx = b.bx, cy = b.top + dh / 2, ang = (-Math.atan2(dh, b.w) * 180) / Math.PI;
        const half = Math.hypot(b.w, dh) / 2;
        return (
          <g key={i}>
            <path d={`M ${l} ${b.top + dh} L ${r} ${b.top} L ${r} -180 L ${l} -180 Z`} fill={XJ.bamboo} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <rect x={l + 7} y={b.top + dh} width={9} height={-b.top - dh - 190} fill={KRP.white} opacity={0.3} />
            <rect x={r - 14} y={b.top + 10} width={8} height={-b.top - 200} fill={XJ.bambooDark} opacity={0.35} />
            {/* 節 */}
            {[0.42, 0.78].map((t, j) => {
              const ny = lerp(b.top + dh + 20, -190, t);
              return <g key={j}><line x1={l} y1={ny} x2={r} y2={ny} stroke={INK} strokeWidth={4} />
                <line x1={l + 2} y1={ny + 6} x2={r - 2} y2={ny + 6} stroke={XJ.bambooDark} strokeWidth={3} /></g>;
            })}
            {/* 切り口 */}
            <ellipse cx={cx} cy={cy} rx={half} ry={b.w * 0.2} fill={XJ.bambooCut} stroke={INK} strokeWidth={4.5} transform={`rotate(${ang} ${cx} ${cy})`} />
            <ellipse cx={cx} cy={cy} rx={half * 0.72} ry={b.w * 0.11} fill="#A99A5E" transform={`rotate(${ang} ${cx} ${cy})`} />
          </g>
        );
      })}
      {/* 松 (竹の根元を囲む) */}
      {[[-110, -210, 70], [110, -214, 72], [-70, -250, 60], [80, -256, 58], [0, -232, 64], [-130, -180, 56], [134, -184, 56]].map(([px, py, r], i) => pineTuft(px, py, r, i))}
      {/* 梅の枝 (右へ) */}
      <g transform={`rotate(${sway} 60 -230)`}>
        <path d="M 60 -230 Q 120 -280 150 -350 M 120 -282 Q 160 -290 180 -318" stroke="#5A3A24" strokeWidth={7} fill="none" strokeLinecap="round" />
        {[[150, -350], [132, -308], [178, -318], [100, -262], [160, -296]].map(([ux, uy], i) => (
          <g key={i} transform={`translate(${ux} ${uy})`}>
            {i === 3 ? <circle r={7} fill={XJ.ume} stroke={INK} strokeWidth={2.5} /> : (
              <g>
                {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 8} cy={Math.sin((a * Math.PI) / 180) * 8} r={7} fill={XJ.ume} stroke={INK} strokeWidth={2} />)}
                <circle r={4.5} fill={KRP.yellow} />
              </g>
            )}
          </g>
        ))}
      </g>
      {/* 舞う梅の花びら */}
      {petalT < 0.7 && (
        <ellipse cx={150 + petalT * 80 + Math.sin(f / 6) * 10} cy={-340 + petalT * 300} rx={6} ry={4} fill={XJ.ume} opacity={1 - petalT / 0.7}
          transform={`rotate(${f * 6} ${150 + petalT * 80} ${-340 + petalT * 300})`} />
      )}
      {/* 南天の赤い実 (左) */}
      {[[-150, -230], [-162, -244], [-140, -248], [-156, -260], [-170, -228]].map(([nx, ny], i) => (
        <circle key={i} cx={nx} cy={ny} r={8} fill={KRP.red} stroke={INK} strokeWidth={2.5} />
      ))}
      {/* こも (わらで巻いた台) */}
      <path d="M -140 -190 L 140 -190 L 130 0 L -130 0 Z" fill={XJ.straw} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={-190} rx={140} ry={20} fill={XJ.strawDark} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={-130 + i * 12.4} y1={-180} x2={-122 + i * 11.6} y2={-6} stroke={XJ.strawDark} strokeWidth={3} opacity={0.75} />
      ))}
      {/* しめなわ (3本巻き) */}
      {[-150, -90, -30].map((ry, i) => (
        <g key={i}>
          <path d={`M -138 ${ry} Q 0 ${ry + 22} 138 ${ry}`} stroke={INK} strokeWidth={14} fill="none" />
          <path d={`M -138 ${ry} Q 0 ${ry + 22} 138 ${ry}`} stroke="#6E5A34" strokeWidth={8} fill="none" strokeDasharray="10 6" />
        </g>
      ))}
      {/* 結び目と房 */}
      <g transform="translate(0 -80)">
        <ellipse rx={16} ry={12} fill="#6E5A34" stroke={INK} strokeWidth={4} />
        {[-1, 1].map((d) => (
          <path key={d} d={`M ${d * 4} 6 Q ${d * 14 + Math.sin(f / 13 + d) * 4} 40 ${d * 10 + Math.sin(f / 13 + d) * 8} 70`} stroke="#6E5A34" strokeWidth={8} fill="none" strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
};

/* ===================================================================
 * Sankakubo — 紙の三角帽 (2章のダンスホール・3章の酔っぱらい・#77 のお父さん)
 *   x,y: 帽子のふちの中心 (= 頭のてっぺんに乗せる位置。Person なら頭の上 y-290*s あたり)
 *   s=1 で 高さ 150px・ふちの幅 110px
 *   color: 地の色 (省略 赤)。しまは金
 *   tilt: 傾き (度)。f でてっぺんの房がぷるぷる揺れる
 *   string: あごのゴムひも (省略 false。true であごの下まで細い線)
 * =================================================================== */
export const Sankakubo: React.FC<{ x: number; y: number; s?: number; f: number; color?: string; tilt?: number; string?: boolean }> = ({
  x, y, s = 1, f, color = XJ.hatRed, tilt = 0, string = false,
}) => {
  const wob = Math.sin(f / 5) * 6;
  const H = 150, W = 55;
  const stripes = 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt + Math.sin(f / 17) * 2})`}>
      {string && <path d={`M ${-W + 4} 0 Q -84 120 0 158 Q 84 120 ${W - 4} 0`} stroke={INK} strokeWidth={2.5} fill="none" opacity={0.55} />}
      {/* 地 */}
      <path d={`M 0 ${-H} L ${W} 0 Q 0 16 ${-W} 0 Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* 金のしま (てっぺんから扇形に) */}
      {Array.from({ length: stripes }, (_, i) => {
        const u1 = -1 + (i * 2 + 0.5) / stripes, u2 = u1 + 0.85 / stripes;
        const yy = (u: number) => 8 * (1 - u * u) + 0;
        return <path key={i} d={`M 0 ${-H} L ${u1 * W} ${yy(u1)} L ${u2 * W} ${yy(u2)} Z`} fill={XJ.hatGold} />;
      })}
      <path d={`M 0 ${-H} L ${W} 0 Q 0 16 ${-W} 0 Z`} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -8 ${-H + 26} L ${-W * 0.62} -6`} stroke={KRP.white} strokeWidth={5} opacity={0.35} strokeLinecap="round" />
      {/* ふちの金のぎざぎざ */}
      <path d={`M ${-W} 0 ${Array.from({ length: 11 }, (_, i) => {
        const u = -1 + (i + 0.5) * (2 / 11), u2 = -1 + (i + 1) * (2 / 11);
        return `L ${u * W} ${8 * (1 - u * u) + 10} L ${u2 * W} ${8 * (1 - u2 * u2)}`;
      }).join(" ")}`} fill={XJ.hatGold} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {/* てっぺんの房 */}
      <g transform={`translate(0 ${-H}) rotate(${wob})`}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 * Math.PI) / 180;
          return <line key={i} x1={0} y1={-6} x2={Math.cos(a) * 20} y2={-6 + Math.sin(a) * 20} stroke={i % 2 ? XJ.hatGold : KRP.white} strokeWidth={5} strokeLinecap="round" />;
        })}
        <circle cx={0} cy={-6} r={8} fill={XJ.hatGold} stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

/* ===================================================================
 * プレビュー (検品用)。1コマ = 1つの見本
 * =================================================================== */
import { Person } from "./KarakuriScenes";

const Table: React.FC<{ y?: number }> = ({ y = 620 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={y} fill="#E9DCC6" />
    <rect x={0} y={y} width={1920} height={1080 - y} fill="#C99A68" />
    <rect x={0} y={y} width={1920} height={14} fill="#A87A4A" />
  </g>
);

export const XJ_PARTS_PREVIEW_FRAMES = 12;
export const XjPartsPreview: React.FC = () => {
  const fr = useCurrentFrame();
  const f = 30 + fr * 7;
  if (fr === 0) return <Frame f={f} seed={91}><Kakeibo f={f} item="cake" dec={1} /></Frame>;
  if (fr === 1) return <Frame f={f} seed={92}><Kakeibo f={f} item="kani" dec={0.45} /></Frame>;
  if (fr === 2) return <Frame f={f} seed={93}><Kakeibo f={f} item="mochi" dec={0} /></Frame>;
  if (fr === 3) return (
    <Frame f={f} seed={94}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      {(["cake", "kani", "mochi", "chicken", "toy"] as KakeiboItem[]).map((it, i) => <KakeiboIcon key={it} x={240 + i * 200} y={200} s={1.8} item={it} f={f} />)}
      <Sankakubo x={1300} y={300} s={1.2} f={f} />
      <Sankakubo x={1520} y={300} s={1.2} f={f} color="#4A78B8" tilt={-18} />
      <Sankakubo x={1740} y={300} s={1.2} f={f} color="#7FBF7A" tilt={14} string={false} />
      {/* お父さん: 三角帽 + 提げた箱 */}
      <Person x={600} y={1000} s={1.15} f={f} face="smile" cloth="#3E4B66" clothDark="#2E3850" />
      <Sankakubo x={600} y={1000 - 286 * 1.15} s={0.95} f={f} tilt={-8} />
      <CakeBox x={600 + 67 * 1.15} y={1000 - 66 * 1.15} s={0.45} f={f} hang />
      <Person x={1300} y={1000} s={1.15} f={f} face="joy" cloth="#3E4B66" clothDark="#2E3850" phase={2} />
      <CakeBox x={1300 + 67 * 1.15} y={1000 - 66 * 1.15} s={0.45} f={f} hang swing={9} />
    </Frame>
  );
  if (fr === 4 || fr === 5) {
    const cut = fr === 5 ? 0.85 : 0;
    const kinds: CakeKind[] = ["butter", "fresh", "fruit", "stollen", "mini", "dog"];
    return (
      <Frame f={f} seed={95 + fr}>
        <Table y={300} />
        {kinds.map((k, i) => <Cake key={k} x={330 + (i % 3) * 630} y={i < 3 ? 560 : 1000} s={0.95} f={f} kind={k} cut={cut} />)}
      </Frame>
    );
  }
  if (fr === 6) return (
    <Frame f={f} seed={97}>
      <Table y={760} />
      <CakeBox x={380} y={880} s={1.3} f={f} />
      <Kadomatsu x={1050} y={1000} s={1.15} f={f} />
      <Kadomatsu x={1620} y={1000} s={1.15} f={f} flip />
    </Frame>
  );
  if (fr === 7) {
    const v: { face: IchigoFace; sleep?: boolean; run?: boolean; flower?: number; arms?: "down" | "banzai" }[] = [
      { face: "normal" }, { face: "smile" }, { face: "joy", arms: "banzai" }, { face: "surprised" }, { face: "worried" },
      { face: "pant", run: true }, { face: "proud" }, { face: "normal", sleep: true }, { face: "joy", flower: 1, arms: "banzai" }, { face: "smile", flower: 0.5 },
    ];
    return (
      <Frame f={f} seed={98}>
        <rect x={0} y={0} width={1920} height={1080} fill={KRP.paperCool} />
        {v.map((p, i) => <Ichigo key={i} x={200 + (i % 5) * 380} y={i < 5 ? 320 : 820} s={1.25} f={f} phase={i} {...p} />)}
      </Frame>
    );
  }
  if (fr === 8) return <Frame f={f} seed={99}><IchigoHouse f={f} light={0} /></Frame>;
  if (fr === 9) return (
    <Frame f={f} seed={100}>
      <IchigoHouse f={f} light={1} snow />
      <Ichigo x={680} y={900} s={1.1} f={f} face="joy" flower={1} arms="banzai" />
    </Frame>
  );
  if (fr === 10) return (
    <Frame f={f} seed={101}>
      <Table y={360} />
      {(["roast", "fried", "turkey", "kiji"] as ChickenKind[]).map((k, i) => (
        <Chicken key={k} x={i % 2 ? 1400 : 520} y={i < 2 ? 580 : 1010} s={i === 2 ? 0.95 : 1.05} f={f} kind={k} />
      ))}
    </Frame>
  );
  return <Frame f={f} seed={102}><Kakeibo f={f} item="toy" dec={1} /></Frame>;
};
void IH_VP; void seg; void pop;
