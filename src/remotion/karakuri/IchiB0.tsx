// 「『2位』は、120年前に発明された」: 序 (導入クイズ〜巻き戻し宣言)
// 担当範囲: 台本 docs/ichiban-script-v1.txt の 2〜21行目 (文#1〜#20・20文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで20枚。
// motif 名は必ず ib0_ で始める。WobbleDefs の seed はこのファイルでは 900〜919 を使う。
// 設計書: docs/briefs/IchiB0.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。
//   seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間を写すため)。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark,
} from "./IchiShared";
import { GridPaper, rnd } from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (序 = 古代ギリシャ + 弥生の村)
// ===================================================================
const C = {
  marble: "#E8E2D4",      // 大理石の白 (彫像・神殿)
  marbleDark: "#B8AE99",  // 大理石の影
  aegean: "#4A7A96",      // エーゲ海の青 (空・遠景)
  laurel: "#6E8F5A",      // 月桂樹の緑 (勝者の冠)
  terracotta: "#B9674A",  // テラコッタ (壺・屋根)
  terraDark: "#8A4A34",
  nightInk: "#3A4250",    // 裏通りの夜
  riceGold: "#C9A84C",    // 弥生の稲穂
  riceDark: "#99782E",
  soil: "#A08A62",        // 土・あぜ道
  gold: "#D9A93E",        // 金メダル
  silver: "#AEB4BC",      // 銀メダル
  bronze: "#A9744B",      // 銅メダル
  dohyo: "#C9B88E",       // 土俵マップの輪
  dusk: "#D99A5E",        // #7 夕空の帯
  nightWall: "#4A5266",   // #8 路地の壁
  nightWallDark: "#303848", // #8 路地の壁の影
  forest: "#4C6B44",      // #14 深い森
  mist: "#DCDED6",        // #14 霧
  wood: "#B98A50",        // #18 表彰台の木
  woodDark: "#8A6436",    // #18 木の陰
  cloud: "#EFECE2",       // #11 想像の雲
  curtain: "#A8333A",     // 表彰式会場の緞帳の赤
  curtainDark: "#7C2129", // 緞帳の影
  venueWall: "#CFC4AC",   // 会場の壁
  museumWall: "#B9B9A4",  // #4/#5 展示室の壁・#16 工房の壁
  washi: "#F4ECD8",       // #15/#19/#20 和紙・絵巻の紙
};

// ===================================================================
// この章だけのローカル部品
// ===================================================================

// 記録の石碑。y は接地。blank なら刻み線なし。欠け・ノミ跡・台座まで描く
const Sekihi: React.FC<{
  x: number; y: number; w?: number; h?: number; blank?: boolean; t?: number; seed?: number;
}> = ({ x, y, w = 340, h = 460, blank = false, t = 1, seed = 1 }) => {
  const sc = clamp01(t);
  if (sc <= 0) return null;
  const rows = 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.9 + sc * 0.1})`} opacity={sc}>
      {/* 台座 */}
      <rect x={-w / 2 - 34} y={-34} width={w + 68} height={34} rx={6}
        fill={C.marbleDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 石本体 (上が丸い) */}
      <path d={`M ${-w / 2} -34 L ${-w / 2} ${-h + 70} Q ${-w / 2} ${-h} ${-w / 2 + 70} ${-h}
        L ${w / 2 - 70} ${-h} Q ${w / 2} ${-h} ${w / 2} ${-h + 70} L ${w / 2} -34 Z`}
        fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
      {/* 縁の欠け */}
      <polygon points={`${w / 2 - 4},${-h + 110} ${w / 2 + 10},${-h + 128} ${w / 2 - 4},${-h + 150}`}
        fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
      <polygon points={`${-w / 2 + 4},${-120} ${-w / 2 - 10},${-104} ${-w / 2 + 4},${-88}`}
        fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
      {/* ノミ跡 (斜めの短線) */}
      <g stroke={C.marbleDark} strokeWidth={3} opacity={0.7}>
        <line x1={-w / 2 + 26} y1={-h + 40} x2={-w / 2 + 48} y2={-h + 56} />
        <line x1={w / 2 - 54} y1={-70} x2={w / 2 - 30} y2={-54} />
        <line x1={-w / 2 + 30} y1={-54} x2={-w / 2 + 52} y2={-42} />
      </g>
      {/* 刻まれた名前の線 (読める文字は彫らない) */}
      {!blank && (
        <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
          {Array.from({ length: rows }, (_, i) => {
            const yy = -h + 64 + i * ((h - 120) / rows);
            const len = 60 + rnd(seed * 31 + i) * (w - 160);
            return <line key={i} x1={-w / 2 + 44} y1={yy} x2={-w / 2 + 44 + len} y2={yy} />;
          })}
        </g>
      )}
    </g>
  );
};

// ギリシャ神殿の柱。y は接地
const GreekColumn: React.FC<{
  x: number; y: number; h?: number; w?: number; fill?: string; opacity?: number;
}> = ({ x, y, h = 560, w = 76, fill = C.marble, opacity = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-w / 2 - 18} y={-26} width={w + 36} height={26} fill={fill} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-w / 2} y={-h + 44} width={w} height={h - 70} fill={fill} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 溝 (フルーティング) */}
    <g stroke={C.marbleDark} strokeWidth={3} opacity={0.75}>
      <line x1={-w / 6} y1={-h + 50} x2={-w / 6} y2={-32} />
      <line x1={w / 6} y1={-h + 50} x2={w / 6} y2={-32} />
    </g>
    <rect x={-w / 2 - 20} y={-h + 18} width={w + 40} height={28} fill={fill} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-w / 2 - 10} y={-h + 44} width={w + 20} height={12} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 月桂冠 (2本の枝が弧を描く)
const LaurelCrown: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({
  x, y, s = 1, color = C.laurel,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -54 10 Q -60 -34 0 -40 Q 60 -34 54 10" fill="none" stroke={color} strokeWidth={8} />
    {[-46, -30, -12, 12, 30, 46].map((lx, i) => (
      <ellipse key={i} cx={lx} cy={-18 - Math.abs(lx) * -0.2 - 14} rx={12} ry={6}
        fill={color} stroke={KRP.ink} strokeWidth={2.5}
        transform={`rotate(${lx * 1.1} ${lx} ${-32})`} />
    ))}
  </g>
);

// 人型アイコン (図用の簡素な人形。y は足元)
// ghost を立てると中身が抜けて破線だけになる = 「いるはずの人がいない」
const HumanIcon: React.FC<{
  x: number; y: number; s?: number; color?: string; t?: number; crown?: boolean;
  ghost?: boolean; f?: number; phase?: number;
}> = ({ x, y, s = 1, color = KRP.gray, t = 1, crown = false, ghost = false, f = 0, phase = 0 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const bob = Math.sin((f + phase * 23) / 13) * 3;
  const body = ghost
    ? { fill: "none", stroke: KRP.ink, strokeWidth: 4, strokeDasharray: "15 13", opacity: 0.6 }
    : { fill: color, stroke: KRP.ink, strokeWidth: 5 };
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * sc})`}>
      <path d="M -40 0 L -40 -70 Q -40 -104 0 -104 Q 40 -104 40 -70 L 40 0 Z" {...body} />
      <circle cx={0} cy={-134} r={32} {...body} />
      {crown && <LaurelCrown x={0} y={-150} s={0.72} />}
    </g>
  );
};

// 歓声の村人/群衆 (腕を上げて振る。y は足元)
const CheerPerson: React.FC<{
  x: number; y: number; s?: number; cloth?: string; f?: number; phase?: number;
}> = ({ x, y, s = 1, cloth = C.terracotta, f = 0, phase = 0 }) => {
  const wave = Math.sin((f + phase * 19) / 7) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 腕 (上げて振る) */}
      <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
        <rect x={-66} y={-210} width={20} height={70} rx={10} fill={cloth}
          transform={`rotate(${-30 + wave} -56 -150)`} />
        <rect x={46} y={-210} width={20} height={70} rx={10} fill={cloth}
          transform={`rotate(${30 - wave} 56 -150)`} />
      </g>
      {/* 体 */}
      <path d="M -44 0 L -40 -150 Q -38 -170 0 -170 Q 38 -170 40 -150 L 44 0 Z"
        fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 頭 */}
      <circle cx={0} cy={-206} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={-12} cy={-208} r={4.5} fill={KRP.ink} />
      <circle cx={12} cy={-208} r={4.5} fill={KRP.ink} />
      <path d="M -10 -192 Q 0 -182 10 -192" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

// ── 古代ギリシャの人 (#6/#7/#8 用) ────────────────────────────────
// キトン (肩でフィブラで留める一枚布。ベルトで締め、裾がひだになって揺れる) +
// ヒマティオン (片肩から斜めに掛ける外衣) + サンダル。ひげ・タイニア (髪を留める布)・
// 月桂冠 (優勝者だけ) は prop で足す。y は足元。裾・ひだ・まばたき・歩みが f で動く。
//   stand = 立つ / cheer = 両手を上げる / lyre = 竪琴をかまえる
//   mourn = うなだれる / cover = 両手で顔を覆う / bend = 膝に手をついて前かがみ
//   sit   = 座り込んで膝を抱える / away = 背を向けて去る / hide = 頭から被って足早
type GreekPose =
  | "stand" | "cheer" | "lyre" | "mourn" | "cover" | "bend" | "sit" | "away" | "hide";

const GreekPerson: React.FC<{
  x: number; y: number; s?: number;
  cloth?: string; clothDark?: string; himation?: string; skin?: string;
  pose?: GreekPose; beard?: boolean; crown?: boolean; band?: boolean;
  flip?: boolean; t?: number; opacity?: number; f?: number; phase?: number;
}> = ({
  x, y, s = 1, cloth = C.marble, clothDark = C.marbleDark, himation,
  skin = KRP.white, pose = "stand", beard = false, crown = false, band = false,
  flip = false, t = 1, opacity = 1, f = 0, phase = 0,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const ph = phase * 17;
  const sway = Math.sin((f + ph) / 9) * 5;        // 裾とひだのゆれ
  const bob = Math.sin((f + ph) / 14) * 2.5;      // 肩の上下 (息)
  const HEM = -66, BELT = -124, SHO = -184, HEADY = -232, HEADR = 38;
  const LSX = -44, RSX = 44, SY = SHO + 4;
  const sit = pose === "sit";
  const away = pose === "away";
  const hood = pose === "hide";
  const down = pose === "mourn" || pose === "cover" || pose === "bend" || hood || sit;
  const lean = hood ? -14 : pose === "bend" ? -24 : pose === "mourn" ? -9
    : pose === "cover" ? -6 : sit ? -6 : away ? 2 : 0;
  const tilt = hood ? 15 : pose === "bend" ? 22 : pose === "mourn" ? 16
    : pose === "cover" ? 9 : sit ? 13 : 0;
  const drop = sit ? 58 : 0;                      // 座ると腰が落ちる
  const gait = hood || away ? Math.sin((f + ph) / 4.6) * 13 : 0; // 歩みで脚が交互に出る
  const blink = ((f + phase * 41) % 101) < 5 && f > 2;

  // 手足。ang は度 (90=真下 / -90=真上 / 0=右)。ink の太線 + 色の細線で輪郭をつける
  const limb = (
    sx: number, sy: number, ang: number, len: number, col: string, w = 18, cap = true,
  ) => {
    const r = (ang * Math.PI) / 180;
    const ex = sx + Math.cos(r) * len, ey = sy + Math.sin(r) * len;
    return (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={KRP.ink} strokeWidth={w + 9} strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={col} strokeWidth={w} strokeLinecap="round" />
        {cap && <circle cx={ex} cy={ey} r={w * 0.64} fill={col} stroke={KRP.ink} strokeWidth={4} />}
      </g>
    );
  };
  // サンダル (革の底 + X に交わる紐)
  const sandal = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={-4} rx={21} ry={9} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
      <g stroke={C.woodDark} strokeWidth={4} strokeLinecap="round">
        <line x1={cx - 10} y1={-12} x2={cx + 8} y2={-24} />
        <line x1={cx + 10} y1={-12} x2={cx - 8} y2={-24} />
      </g>
    </g>
  );
  // [左腕の角度, 右腕の角度, 腕の長さ]
  const ARMS: Record<GreekPose, [number, number, number]> = {
    stand: [100 + sway * 0.4, 80 - sway * 0.4, 80],
    cheer: [-115 + sway, -65 - sway, 86],
    lyre: [52 + sway * 0.3, 26 - sway * 0.3, 76],
    mourn: [104 + sway * 0.3, 76 - sway * 0.3, 88],
    cover: [-74, -106, 70],
    bend: [70, 110, 100],
    sit: [58, 122, 78],
    away: [96 + sway * 0.3, 84 - sway * 0.3, 80],
    hide: [46, 88 - sway * 0.4, 68],
  };
  const [aL, aR, aLen] = ARMS[pose];
  const hemL = HEM + 4 + sway * 0.8, hemR = HEM + 4 - sway * 0.8;

  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * sc} ${s * sc})`} opacity={opacity}>
      {/* 立っているときの脚 (キトンの裾から下だけ見える) */}
      {!sit && (
        <g>
          <g transform={`rotate(${gait * 0.5} ${-18} ${HEM})`}>
            <rect x={-30} y={-76} width={23} height={76} rx={10} fill={skin} stroke={KRP.ink} strokeWidth={4.5} />
            {sandal(-18)}
          </g>
          <g transform={`rotate(${-gait * 0.5} 18 ${HEM})`}>
            <rect x={7} y={-76} width={23} height={76} rx={10} fill={skin} stroke={KRP.ink} strokeWidth={4.5} />
            {sandal(18)}
          </g>
        </g>
      )}
      {/* 上半身 (腰で前に倒れる。座るときは腰ごと落ちる) */}
      <g transform={`translate(0 ${drop + bob * 0.3}) rotate(${lean} 0 ${HEM})`}>
        {/* キトン本体 (裾が f で波打つ) */}
        <path d={`M -56 ${hemL}
          Q -63 ${BELT} -44 ${SHO}
          Q 0 ${SHO - 15} 44 ${SHO}
          Q 63 ${BELT} 56 ${hemR}
          Q 28 ${HEM + 17 - sway} 0 ${HEM + 10}
          Q -28 ${HEM + 17 + sway} -56 ${hemL} Z`}
          fill={cloth} stroke={KRP.ink} strokeWidth={5} />
        {/* 胸もとのひだ (肩からベルトへ) */}
        <g stroke={clothDark} strokeWidth={3.5} strokeLinecap="round" opacity={0.6}>
          <line x1={-26} y1={SHO + 10} x2={-18} y2={BELT - 6} />
          <line x1={22} y1={SHO + 8} x2={16} y2={BELT - 6} />
        </g>
        {/* 裾のひだ (ベルトから裾へ。f で流れる) */}
        <g stroke={clothDark} strokeWidth={4} strokeLinecap="round" opacity={0.85}>
          {[-32, -11, 11, 32].map((fx, i) => (
            <line key={i} x1={fx} y1={BELT + 8} x2={fx + sway * (0.3 + i * 0.14)} y2={HEM + 8} />
          ))}
        </g>
        {/* ベルト (結び目つき) */}
        <path d={`M -53 ${BELT} Q 0 ${BELT + 13} 53 ${BELT}`}
          fill="none" stroke={clothDark} strokeWidth={12} strokeLinecap="round" />
        <path d={`M -53 ${BELT} Q 0 ${BELT + 13} 53 ${BELT}`}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
        <circle cx={8} cy={BELT + 11} r={7.5} fill={clothDark} stroke={KRP.ink} strokeWidth={3} />
        {/* ヒマティオン (片肩から斜めに掛かる外衣。脇に垂れる布が揺れる) */}
        {himation && !hood && (
          <g>
            <path d={`M -50 ${SHO - 2} Q -86 ${BELT} ${-78 + sway * 0.7} ${HEM - 2}
              Q -58 ${HEM + 14} ${-40 + sway * 0.35} ${HEM - 12}
              Q -36 ${BELT} -22 ${SHO + 14} Z`}
              fill={himation} stroke={KRP.ink} strokeWidth={4.5} />
            <path d={`M -52 ${SHO - 4} Q -8 ${SHO + 32} 42 ${BELT + 2}
              L 60 ${BELT + 30} Q -4 ${SHO + 58} -60 ${SHO + 18} Z`}
              fill={himation} stroke={KRP.ink} strokeWidth={4.5} />
            <path d={`M -50 ${SHO + 10} Q -12 ${SHO + 40} 40 ${BELT + 14}`}
              fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.38} />
          </g>
        )}
        {/* 肩で留めるフィブラ (留め金) */}
        <g fill={C.gold} stroke={KRP.ink} strokeWidth={3}>
          <circle cx={-38} cy={SHO + 3} r={7} />
          <circle cx={38} cy={SHO + 3} r={7} />
        </g>
        {/* 首と頭 */}
        <g transform={`rotate(${tilt} 0 ${SHO})`}>
          <rect x={-13} y={SHO - 26} width={26} height={30} fill={skin} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={HEADY} r={HEADR} fill={skin} stroke={KRP.ink} strokeWidth={5} />
          {away ? (
            /* 後ろ姿。顔は描かず、後頭部の髪とうなじだけ */
            <g>
              <circle cx={0} cy={HEADY} r={HEADR - 2} fill={KRP.ink} opacity={0.8} />
              <path d={`M -32 ${HEADY + 22} Q 0 ${HEADY + 44} 32 ${HEADY + 22}`}
                fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* 短い巻き毛 */}
              <path d={`M -38 ${HEADY - 4} Q -41 ${HEADY - 44} 0 ${HEADY - 43}
                Q 41 ${HEADY - 44} 38 ${HEADY - 4}
                Q 22 ${HEADY - 26} 0 ${HEADY - 24} Q -22 ${HEADY - 26} -38 ${HEADY - 4} Z`}
                fill={KRP.ink} />
              {[-28, -10, 10, 28].map((hx, i) => (
                <circle key={i} cx={hx} cy={HEADY - 31 + Math.abs(hx) * 0.24} r={9} fill={KRP.ink} />
              ))}
              {/* タイニア (髪を留める布) */}
              {band && (
                <path d={`M -39 ${HEADY - 11} Q 0 ${HEADY - 27} 39 ${HEADY - 11}`}
                  fill="none" stroke={C.terracotta} strokeWidth={9} strokeLinecap="round" />
              )}
              {/* 目 (うつむく姿勢では伏せ目) */}
              {down ? (
                <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" fill="none">
                  <path d={`M -23 ${HEADY + 3} q 10 8 19 0`} />
                  <path d={`M 4 ${HEADY + 3} q 10 8 19 0`} />
                </g>
              ) : (
                <g fill={KRP.ink}>
                  <ellipse cx={-13} cy={HEADY + 2} rx={5} ry={blink ? 1.2 : 5} />
                  <ellipse cx={13} cy={HEADY + 2} rx={5} ry={blink ? 1.2 : 5} />
                </g>
              )}
              {/* 口 */}
              <path d={down ? `M -11 ${HEADY + 25} q 11 -6 22 0` : `M -11 ${HEADY + 22} q 11 9 22 0`}
                fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
              {/* ひげ */}
              {beard && (
                <path d={`M -34 ${HEADY + 8} Q -31 ${HEADY + 56} 0 ${HEADY + 60}
                  Q 31 ${HEADY + 56} 34 ${HEADY + 8}
                  Q 18 ${HEADY + 32} 0 ${HEADY + 32} Q -18 ${HEADY + 32} -34 ${HEADY + 8} Z`}
                  fill={KRP.ink} opacity={0.75} />
              )}
            </g>
          )}
          {crown && <LaurelCrown x={0} y={HEADY - 24} s={0.8} />}
          {/* ヒマティオンを頭から被る (顔を隠す) */}
          {hood && (
            <g>
              <path d={`M -60 ${SHO + 26}
                Q -78 ${HEADY - 12} -16 ${HEADY - 48}
                Q 50 ${HEADY - 42} 66 ${SHO + 8}
                Q 30 ${SHO + 48} -60 ${SHO + 26} Z`}
                fill={himation ?? clothDark} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M -46 ${HEADY - 6} Q -6 ${HEADY - 34} 44 ${HEADY + 4}`}
                fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
            </g>
          )}
        </g>
        {/* 腕 (素肌。キトンは袖なし) */}
        {limb(LSX, SY, aL, aLen, skin)}
        {limb(RSX, SY, aR, aLen, skin)}
        {/* 顔を覆う両手 (手のひらを大きく重ねる) */}
        {pose === "cover" && (
          <g transform={`rotate(${tilt} 0 ${SHO})`}>
            <ellipse cx={-19} cy={HEADY - 2} rx={24} ry={29} fill={skin} stroke={KRP.ink} strokeWidth={4.5}
              transform={`rotate(12 -19 ${HEADY - 2})`} />
            <ellipse cx={19} cy={HEADY - 4} rx={24} ry={29} fill={skin} stroke={KRP.ink} strokeWidth={4.5}
              transform={`rotate(-12 19 ${HEADY - 4})`} />
          </g>
        )}
        {/* 肩の短い袖 (キトンの布が肩から少し落ちる) */}
        <g fill={cloth} stroke={KRP.ink} strokeWidth={4}>
          <path d={`M -55 ${SHO + 2} Q -59 ${SHO + 32} -33 ${SHO + 34} Q -27 ${SHO + 12} -44 ${SHO - 3} Z`} />
          <path d={`M 55 ${SHO + 2} Q 59 ${SHO + 32} 33 ${SHO + 34} Q 27 ${SHO + 12} 44 ${SHO - 3} Z`} />
        </g>
      </g>
      {/* 座り込んだときの脚 (膝を立てて抱える。キトンの上に出す) */}
      {sit && (
        <g>
          {limb(-14, -24, -28, 70, skin, 20, false)}
          {limb(48, -57, 80, 58, skin, 18, false)}
          {limb(-4, -18, -36, 76, skin, 20, false)}
          {limb(57, -62, 74, 60, skin, 18, false)}
          {sandal(58)}
          {sandal(74)}
        </g>
      )}
    </g>
  );
};

// 古代ギリシャの壺 (アンフォラ)。y は接地。胴がわずかに f で傾く
const GreekAmphora: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  fill?: string; dark?: string; opacity?: number;
}> = ({ x, y, s = 1, f = 0, phase = 0, fill = C.terracotta, dark = C.terraDark, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin((f + phase * 23) / 17) * 1.2} 0 0)`}
    opacity={opacity}>
    {/* 接地の影 */}
    <ellipse cx={0} cy={2} rx={46} ry={10} fill={KRP.ink} opacity={0.34} />
    {/* 胴 */}
    <path d="M -46 0 Q -66 -62 -40 -104 Q -48 -118 -34 -124 L 34 -124 Q 48 -118 40 -104 Q 66 -62 46 0 Z"
      fill={fill} stroke={KRP.ink} strokeWidth={6} />
    {/* 取っ手 (両耳) */}
    <path d="M -34 -118 Q -62 -112 -52 -78" fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
    <path d="M 34 -118 Q 62 -112 52 -78" fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
    {/* 口縁 */}
    <ellipse cx={0} cy={-124} rx={34} ry={9} fill={dark} stroke={KRP.ink} strokeWidth={5} />
    {/* 黒絵式の帯 (幾何文様) */}
    <path d="M -56 -58 Q 0 -50 56 -58" fill="none" stroke={dark} strokeWidth={9} />
    <g stroke={dark} strokeWidth={4} fill="none">
      <path d="M -44 -34 l 14 -12 l 14 12 l 14 -12 l 14 12 l 14 -12 l 14 12" />
    </g>
  </g>
);

// 編み籠。y は接地。かぶせた布のふちが f でそよぐ
const GreekBasket: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; opacity?: number;
}> = ({ x, y, s = 1, f = 0, phase = 0, opacity = 1 }) => {
  const w = Math.sin((f + phase * 19) / 11) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx={0} cy={2} rx={44} ry={9} fill={KRP.ink} opacity={0.34} />
      <path d="M -44 0 L -36 -62 L 36 -62 L 44 0 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 編み目 */}
      <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.85}>
        <line x1={-40} y1={-20} x2={40} y2={-20} />
        <line x1={-38} y1={-42} x2={38} y2={-42} />
        <line x1={-14} y1={-62} x2={-18} y2={0} />
        <line x1={14} y1={-62} x2={18} y2={0} />
      </g>
      {/* ふちにかけた布 */}
      <path d={`M -40 -62 Q 0 -74 40 -62 Q ${28 + w} -48 0 ${-54 + w * 0.5} Q ${-28 - w} -48 -40 -62 Z`}
        fill={C.mist} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
};

// 野良犬 (路地にいる)。尾が f で振れ、鼻先がかすかに上下する
const StrayDog: React.FC<{
  x: number; y: number; s?: number; f?: number; flip?: boolean; opacity?: number; color?: string;
}> = ({ x, y, s = 1, f = 0, flip = false, opacity = 1, color = C.soil }) => {
  const tail = Math.sin(f / 5) * 22;
  const sniff = Math.sin(f / 9) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
      {/* 接地の影 */}
      <ellipse cx={0} cy={0} rx={58} ry={10} fill={KRP.ink} opacity={0.34} />
      {/* 尾 (振れる) */}
      <path d={`M 52 -54 Q ${74 + tail} ${-72 - tail * 0.5} ${66 + tail} ${-96 - tail * 0.4}`}
        fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      {/* 脚 */}
      <g stroke={color} strokeWidth={11} strokeLinecap="round">
        <line x1={-34} y1={-40} x2={-36} y2={-2} />
        <line x1={-16} y1={-40} x2={-12} y2={-2} />
        <line x1={34} y1={-40} x2={38} y2={-2} />
        <line x1={16} y1={-40} x2={14} y2={-2} />
      </g>
      {/* 胴 */}
      <path d="M -46 -46 Q -52 -82 -22 -86 L 30 -86 Q 56 -82 50 -46 Q 10 -34 -46 -46 Z"
        fill={color} stroke={KRP.ink} strokeWidth={5} />
      {/* 首と頭 (鼻先が下がる) */}
      <g transform={`translate(-54 ${-74 + sniff}) rotate(${10 + sniff})`}>
        <circle cx={0} cy={0} r={22} fill={color} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -8 4 Q -34 8 -38 20 Q -22 26 -4 18 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={-36} cy={19} r={5} fill={KRP.ink} />
        <circle cx={4} cy={-4} r={4} fill={KRP.ink} />
        {/* 耳 */}
        <path d="M 10 -18 Q 26 -26 22 -4 Q 14 -8 10 -18 Z" fill={color} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// 石積みの壁。パースのついた台形 (手前=u:0 / 奥=u:1) に目地を段ちがいで刻む。
// warp を 1 より小さくすると、奥に行くほど石が細くなって奥行きが出る
const StoneWall: React.FC<{
  xNear: number; topNear: number; botNear: number;
  xFar: number; topFar: number; botFar: number;
  rows?: number; cols?: number; warp?: number; opacity?: number; color?: string;
}> = ({
  xNear, topNear, botNear, xFar, topFar, botFar,
  rows = 7, cols = 8, warp = 0.55, opacity = 0.45, color = KRP.ink,
}) => {
  const lx = (u: number) => xNear + (xFar - xNear) * u;
  const py = (u: number, v: number) => {
    const t0 = topNear + (topFar - topNear) * u;
    const b0 = botNear + (botFar - botNear) * u;
    return t0 + (b0 - t0) * v;
  };
  return (
    <g stroke={color} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={opacity}>
      {Array.from({ length: rows - 1 }, (_, i) => {
        const v = (i + 1) / rows;
        return <line key={`h${i}`} x1={lx(0)} y1={py(0, v)} x2={lx(1)} y2={py(1, v)} />;
      })}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const u = Math.pow((c + (r % 2 ? 0.5 : 0)) / cols, warp);
          if (u <= 0.02 || u >= 0.99) return null;
          return (
            <line key={`v${r}-${c}`} x1={lx(u)} y1={py(u, r / rows)} x2={lx(u)} y2={py(u, (r + 1) / rows)} />
          );
        }),
      )}
    </g>
  );
};

// 高床式倉庫 (弥生)。y は接地
const TakayukaKura: React.FC<{
  x: number; y: number; s?: number; silhouette?: boolean; opacity?: number;
}> = ({ x, y, s = 1, silhouette = false, opacity = 1 }) => {
  const body = silhouette ? C.soil : C.riceGold;
  const roof = silhouette ? C.soil : C.terraDark;
  const sw = silhouette ? 0 : 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {/* 柱4本 */}
      {[-96, -34, 34, 96].map((px, i) => (
        <rect key={i} x={px - 10} y={-110} width={20} height={110} fill={silhouette ? C.soil : C.soil}
          stroke={KRP.ink} strokeWidth={sw} />
      ))}
      {/* ねずみ返し */}
      {!silhouette && [-96, 96].map((px, i) => (
        <ellipse key={i} cx={px} cy={-112} rx={26} ry={8} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 床・壁 */}
      <rect x={-130} y={-186} width={260} height={76} rx={6} fill={body} stroke={KRP.ink} strokeWidth={sw} />
      {!silhouette && <rect x={-20} y={-176} width={40} height={56} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />}
      {/* 茅葺き屋根 (千木つき) */}
      <polygon points="-170,-186 0,-280 170,-186" fill={roof} stroke={KRP.ink} strokeWidth={sw} />
      <g stroke={silhouette ? C.soil : KRP.ink} strokeWidth={6} strokeLinecap="round">
        <line x1={-26} y1={-314} x2={8} y2={-268} />
        <line x1={26} y1={-314} x2={-8} y2={-268} />
      </g>
    </g>
  );
};

// 稲束 (束ねた稲穂)。y は束の根元
const IneBundle: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      {[-30, -15, 0, 15, 30].map((sx, i) => (
        <g key={i} transform={`rotate(${sx * 0.8} 0 0)`}>
          <line x1={0} y1={0} x2={sx * 1.4} y2={-96} stroke={C.riceDark} strokeWidth={7} strokeLinecap="round" />
          {/* 穂 (粒) */}
          {[0.55, 0.72, 0.9].map((k, j) => (
            <ellipse key={j} cx={sx * 1.4 * k} cy={-96 * k} rx={9} ry={5.5}
              fill={C.riceGold} stroke={KRP.ink} strokeWidth={2.5}
              transform={`rotate(${sx} ${sx * 1.4 * k} ${-96 * k})`} />
          ))}
        </g>
      ))}
      {/* 結び */}
      <rect x={-20} y={-14} width={40} height={20} rx={8} fill={C.soil} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 炎アイコン (勝ちたい気持ち)。y は下端
const FlameIcon: React.FC<{ x: number; y: number; s?: number; f?: number; t?: number }> = ({
  x, y, s = 1, f = 0, t = 1,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const flick = 1 + Math.sin(f / 5) * 0.045;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc} ${s * sc * flick})`}>
      <path d="M 0 0 C -92 0 -120 -74 -104 -142 C -92 -196 -52 -228 -40 -286
        C -14 -246 -22 -220 -8 -198 C 12 -232 2 -282 42 -330
        C 48 -256 94 -222 104 -150 C 114 -70 84 0 0 0 Z"
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 0 -8 C -44 -8 -58 -52 -48 -92 C -40 -126 -16 -140 2 -182
        C 26 -140 52 -118 50 -76 C 48 -34 36 -8 0 -8 Z"
        fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
};

// 歯車 (人間が作った仕組み)
const GearIcon: React.FC<{ x: number; y: number; r?: number; f?: number; t?: number }> = ({
  x, y, r = 150, f = 0, t = 1,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const rot = f * 0.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={-20} y={-r - 30} width={40} height={44} rx={8}
          fill={KRP.gray} stroke={KRP.ink} strokeWidth={5}
          transform={`rotate(${i * 36})`} />
      ))}
      <circle r={r} fill={KRP.gray} stroke={KRP.ink} strokeWidth={7} />
      <circle r={r * 0.62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <circle r={r * 0.2} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ===================================================================
// v2 の舞台部品 (素の方眼を廃止し、全シーンを「舞台の中」に置くための共通セット)
// ===================================================================

// 表彰式会場の壁・床・スポットライトの光芒 (#1〜#3)。緞帳は CurtainTop を手前がけ
const VenueStage: React.FC<{
  f: number; beams?: Array<[number, number]>; floorY?: number;
}> = ({ f, beams = [[600, 840], [1320, 1080]], floorY = 890 }) => (
  <g>
    {/* 会場の壁 (うっすら) */}
    <rect x={-20} y={-20} width={W + 40} height={floorY + 20} fill={C.venueWall} opacity={0.4} />
    <line x1={-20} y1={floorY - 210} x2={W + 20} y2={floorY - 210}
      stroke={C.woodDark} strokeWidth={4} opacity={0.3} />
    {/* 舞台の床 */}
    <rect x={-20} y={floorY} width={W + 40} height={H - floorY + 20} fill={C.wood} opacity={0.4} />
    <line x1={-20} y1={floorY} x2={W + 20} y2={floorY} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
    {/* 床板の継ぎ目 (奥→手前に開く) */}
    <g stroke={C.woodDark} strokeWidth={3} opacity={0.4}>
      {[300, 700, 1220, 1620].map((bx, i) => (
        <line key={i} x1={bx} y1={floorY} x2={bx + (bx - 960) * 0.22} y2={H + 20} />
      ))}
    </g>
    {/* スポットライトの光芒 (fでゆらぐ) */}
    {beams.map(([sx, tx], i) => (
      <polygon key={i}
        points={`${sx - 54},-20 ${sx + 54},-20 ${tx + 250},${floorY + 60} ${tx - 250},${floorY + 60}`}
        fill={KRP.yellow} opacity={0.13 + Math.sin((f + i * 8) / 9) * 0.03} />
    ))}
    {/* 床の光だまり */}
    {beams.map(([, tx], i) => (
      <ellipse key={`p${i}`} cx={tx} cy={floorY + 40} rx={260} ry={36}
        fill={KRP.yellow} opacity={0.16 + Math.sin((f + i * 8) / 9) * 0.03} />
    ))}
  </g>
);

// 緞帳 (上辺の赤幕+房)。#1〜#3・#17。シーンの最後に手前がけで描く
const CurtainTop: React.FC<{ f: number }> = ({ f }) => {
  const SW = 246; // 波ひと山の幅
  return (
    <g>
      {/* 幕の上枠 */}
      <rect x={-20} y={-20} width={W + 40} height={74} fill={C.curtainDark} stroke={KRP.ink} strokeWidth={5} />
      {/* スカラップ (波形の裾) */}
      {Array.from({ length: 8 }, (_, i) => {
        const x0 = -22 + i * SW;
        return (
          <path key={i}
            d={`M ${x0} 50 Q ${x0 + SW / 2} 166 ${x0 + SW} 50 L ${x0 + SW} -20 L ${x0} -20 Z`}
            fill={C.curtain} stroke={KRP.ink} strokeWidth={5.5} />
        );
      })}
      {/* ひだの線 */}
      <g stroke={C.curtainDark} strokeWidth={3.5} opacity={0.7}>
        {Array.from({ length: 8 }, (_, i) => {
          const xm = -22 + i * SW + SW / 2;
          return <path key={i} d={`M ${xm - 40} -10 Q ${xm - 34} 60 ${xm - 46} 128`} fill="none" />;
        })}
      </g>
      {/* 房 (タッセル。fでかすかに揺れる) */}
      {Array.from({ length: 7 }, (_, i) => {
        const tx = -22 + (i + 1) * SW;
        const sway = Math.sin((f + i * 9) / 11) * 4;
        return (
          <g key={i} transform={`translate(${tx} 46) rotate(${sway})`}>
            <line x1={0} y1={0} x2={0} y2={28} stroke={C.gold} strokeWidth={5} />
            <circle cx={0} cy={34} r={11} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -10 42 L -7 68 M 0 45 L 0 72 M 10 42 L 7 68"
              stroke={C.gold} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          </g>
        );
      })}
    </g>
  );
};

// 博物館の展示室 (#4/#5)。壁・床・天井の額照明・展示台座・ロープ柵
const MuseumRoom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 壁と腰壁 */}
    <rect x={-20} y={-20} width={W + 40} height={880} fill={C.museumWall} opacity={0.38} />
    <rect x={-20} y={712} width={W + 40} height={148} fill={C.museumWall} opacity={0.3} />
    <line x1={-20} y1={712} x2={W + 20} y2={712} stroke={C.woodDark} strokeWidth={4} opacity={0.4} />
    {/* 床 */}
    <rect x={-20} y={860} width={W + 40} height={240} fill={C.woodDark} opacity={0.28} />
    <line x1={-20} y1={860} x2={W + 20} y2={860} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
    <g stroke={C.woodDark} strokeWidth={3} opacity={0.4}>
      {[260, 700, 1240, 1700].map((bx, i) => (
        <line key={i} x1={bx} y1={860} x2={bx + (bx - 960) * 0.2} y2={H + 20} />
      ))}
    </g>
    {/* 天井の額照明 (展示品を照らす) */}
    <line x1={960} y1={-20} x2={960} y2={92} stroke={KRP.ink} strokeWidth={9} />
    <path d="M 896 92 Q 960 54 1024 92 L 1006 126 L 914 126 Z"
      fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={960} cy={128} rx={42} ry={11} fill={KRP.yellow} opacity={0.95} />
    <polygon points="918,128 1002,128 1640,830 280,830"
      fill={KRP.yellow} opacity={0.11 + Math.sin(f / 9) * 0.02} />
    {/* 展示台座 */}
    <rect x={330} y={830} width={1260} height={26} rx={6} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={370} y={856} width={1180} height={148} fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
    <g stroke={C.marbleDark} strokeWidth={3.5} opacity={0.6}>
      <line x1={400} y1={930} x2={720} y2={930} />
      <line x1={1200} y1={930} x2={1520} y2={930} />
    </g>
    {/* 銘板 */}
    <rect x={898} y={892} width={124} height={58} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
      <line x1={916} y1={912} x2={1004} y2={912} />
      <line x1={916} y1={930} x2={982} y2={930} />
    </g>
    {/* ロープ柵 (手前) */}
    {[170, 1750].map((px, i) => (
      <g key={i}>
        <ellipse cx={px} cy={1042} rx={48} ry={13} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
        <rect x={px - 11} y={806} width={22} height={236} rx={8} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={px} cy={798} r={17} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
    <path d={`M 170 816 Q 960 ${986 + Math.sin(f / 13) * 7} 1750 816`}
      fill="none" stroke={KRP.red} strokeWidth={13} strokeLinecap="round" />
  </g>
);

// 木の机 (全面の下敷き)。#15・#19・#20
const DeskBack: React.FC = () => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wood} opacity={0.45} />
    <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.45}>
      {[120, 370, 620, 870, 1040].map((ly, i) => (
        <line key={i} x1={-20} y1={ly} x2={W + 20} y2={ly} />
      ))}
    </g>
    {/* 木の節 */}
    <g stroke={C.woodDark} strokeWidth={3} fill="none" opacity={0.5}>
      <ellipse cx={240} cy={1010} rx={26} ry={10} />
      <ellipse cx={1690} cy={60} rx={22} ry={9} />
    </g>
  </g>
);

// 広げた絵巻物 (#19/#20)。紙と両端の巻き軸
const Emaki: React.FC = () => {
  const PL = 170, PR = 1760, PT = 95, PB = 805;
  return (
    <g>
      {/* 紙の影 */}
      <rect x={PL + 14} y={PT + 16} width={PR - PL} height={PB - PT} rx={10} fill={KRP.ink} opacity={0.14} />
      {/* 紙 */}
      <rect x={PL} y={PT} width={PR - PL} height={PB - PT} rx={10} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
      <rect x={PL + 16} y={PT + 16} width={PR - PL - 32} height={PB - PT - 32} rx={6}
        fill="none" stroke={C.marbleDark} strokeWidth={3} opacity={0.55} />
      {/* 両端の巻き軸 */}
      {[PL - 28, PR + 28].map((rx, i) => (
        <g key={i}>
          <rect x={rx - 32} y={PT - 28} width={64} height={PB - PT + 56} rx={28}
            fill={C.wood} stroke={KRP.ink} strokeWidth={6.5} />
          <ellipse cx={rx} cy={PT - 28} rx={32} ry={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={rx} cy={PB + 28} rx={32} ry={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

// ===================================================================
// 連番ペア用の共有部品 (#4/#5・#9/#10・#19/#20。コピペ禁止 → phase で分岐)
// ===================================================================

// #5 で「紙に書かれた物」が見えている量 (1=見えている → 0=消えた)。
// S5 と RecordRoll(phase=2) の両方で同じ区間を使うので、ここに1本化しておく。
const ib0S5Ink = (f: number) => 1 - seg(f, 40, 70);

// #4/#5: 開いた巻物の記録簿。phase=1 風化の否定 / phase=2 「2位」の欄ごと無い
// phase=2 は #4 の最後の絵からそのまま続く (巻物は開ききった状態で始まり、
// 書かれた物が ib0S5Ink でフェードアウトして、空いた場所に赤点線と？が出る)。
const RecordRoll: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const open = phase === 1 ? easeOut(seg(f, 2, 16)) : 1;
  const ink = phase === 1 ? 1 : ib0S5Ink(f);
  const PL = 330, PR = 1590, PT = 250, PB = 780; // 紙面
  const rowY1 = 380; // 「1位」の行
  const rowY2 = 590; // 下の行 (phase1: かすれ痕 / phase2: 枠ごと無い)
  return (
    <g>
      {/* 紙面 (左右に開く) */}
      <g transform={`translate(${(PL + PR) / 2} ${(PT + PB) / 2}) scale(${0.25 + open * 0.75} 1) translate(${-(PL + PR) / 2} ${-(PT + PB) / 2})`}>
        <rect x={PL} y={PT} width={PR - PL} height={PB - PT} rx={10}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={PL + 18} y={PT + 18} width={PR - PL - 36} height={PB - PT - 36} rx={6}
          fill="none" stroke={C.marbleDark} strokeWidth={3} opacity={0.7} />
        {/* 「1位」の行 (#5 では #4 の続きで出たまま、やがて消えていく) */}
        <g opacity={phase === 1 ? seg(f, 14, 22) : ink}>
          <rect x={PL + 60} y={rowY1 - 54} width={150} height={104} rx={10}
            fill={C.gold} stroke={KRP.ink} strokeWidth={6} />
          <text x={PL + 135} y={rowY1 + 18} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={56} fill={KRP.ink}>1位</text>
          {/* 名前の刻み線 */}
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.85}>
            <line x1={PL + 260} y1={rowY1 - 20} x2={PL + 720} y2={rowY1 - 20} />
            <line x1={PL + 260} y1={rowY1 + 22} x2={PL + 580} y2={rowY1 + 22} />
          </g>
          <LaurelCrown x={PR - 160} y={rowY1 - 6} s={1.1} />
        </g>
        {/* 行の仕切り */}
        <line x1={PL + 40} y1={(rowY1 + rowY2) / 2 - 10} x2={PR - 40} y2={(rowY1 + rowY2) / 2 - 10}
          stroke={C.marbleDark} strokeWidth={4} opacity={0.8} />
        {/* かすれた文字痕 → 「風化して消えた?」の仮説 (#5 では続きで出たまま消える) */}
        <g opacity={phase === 1 ? seg(f, 20, 28) : ink}>
          <g stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
            strokeDasharray="10 16" opacity={0.4}>
            <line x1={PL + 260} y1={rowY2 - 20} x2={PL + 640} y2={rowY2 - 20} />
            <line x1={PL + 260} y1={rowY2 + 22} x2={PL + 500} y2={rowY2 + 22} />
          </g>
          <rect x={PL + 60} y={rowY2 - 54} width={150} height={104} rx={10}
            fill={KRP.white} stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="12 10" />
          <text x={PL + 135} y={rowY2 + 16} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={48} fill={KRP.grayDark} opacity={0.6}>2位</text>
        </g>
        {/* #5 だけ: 文字が消えたあと、「2位」の行の枠ごと無いことを赤点線で見せる */}
        {phase === 2 && (
          <g opacity={seg(f, 52, 72)}>
            <rect x={PL + 60} y={rowY2 - 70} width={PR - PL - 180} height={140} rx={12}
              fill="none" stroke={KRP.red} strokeWidth={7}
              strokeDasharray="26 18" strokeDashoffset={-f * 1.5} />
          </g>
        )}
      </g>
      {/* 巻物の軸 (左右) */}
      {[PL - 26, PR + 26].map((rx, i) => (
        <g key={i}>
          <rect x={rx - 34} y={PT - 30} width={68} height={PB - PT + 60} rx={30}
            fill={C.wood} stroke={KRP.ink} strokeWidth={6.5} />
          <ellipse cx={rx} cy={PT - 30} rx={34} ry={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={rx} cy={PB + 30} rx={34} ry={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {phase === 1 ? (
        <g>
          <XMark x={1130} y={590} s={1.25} t={seg(f, 28, 36)} />
          <TagPlate x={1460} y={170} text="風化 ×" size={54} t={seg(f, 32, 42)} color={KRP.red} />
        </g>
      ) : (
        <g>
          {/* #4 の「×」も続きで出たまま消える (札は寄りの外=S5側で持つ) */}
          <g opacity={ink}><XMark x={1130} y={590} s={1.25} /></g>
          <QMark x={620} y={600} s={1.3} f={f} t={seg(f, 70, 88)} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 各シーン
// ===================================================================

// #1 いきなりですが、クイズです。
// どこ: 表彰式会場の舞台。緞帳とスポットライトの中、イーゼルに立てた出題パネル
// 演出: 方眼はパネルに貼った紙として使う。直径580pxの丸枠「Q」がドンと pop
// 動き: Qが pop / 赤点線リングが回る / 光芒がゆらぐ / 緞帳の房が揺れる / QMarkが上下
const S1: React.FC<{ f: number }> = ({ f }) => {
  const tQ = pop(seg(f, 2, 16));
  return (
    <Frame f={f} seed={900}>
      <VenueStage f={f} beams={[[560, 840], [1300, 900]]} floorY={890} />
      {/* イーゼルの脚 */}
      <g stroke={C.woodDark} strokeWidth={14} strokeLinecap="round">
        <line x1={560} y1={840} x2={468} y2={1016} />
        <line x1={1120} y1={840} x2={1212} y2={1016} />
        <line x1={840} y1={870} x2={840} y2={1024} />
      </g>
      <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
        <line x1={560} y1={840} x2={468} y2={1016} />
        <line x1={1120} y1={840} x2={1212} y2={1016} />
        <line x1={840} y1={870} x2={840} y2={1024} />
      </g>
      {/* 出題パネル (方眼紙を貼った板) */}
      <rect x={508} y={210} width={688} height={688} rx={14} fill={KRP.ink} opacity={0.16} />
      <rect x={496} y={196} width={688} height={688} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={9} />
      <clipPath id="ib0s1paper"><rect x={506} y={206} width={668} height={668} rx={8} /></clipPath>
      <g clipPath="url(#ib0s1paper)"><GridPaper tombo={false} /></g>
      {/* パネルの留め金 */}
      {[[530, 230], [1150, 230], [530, 850], [1150, 850]].map(([mx, my], i) => (
        <circle key={i} cx={mx} cy={my} r={9} fill={C.gold} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      {/* Q (主役。大きさ・位置は従来のまま) */}
      <g transform={`translate(840 540) scale(${tQ})`}>
        <circle r={292} fill={KRP.white} stroke={KRP.ink} strokeWidth={11} />
        <circle r={256} fill="none" stroke={KRP.red} strokeWidth={8}
          strokeDasharray="40 20" transform={`rotate(${f * 0.6})`} />
        <text y={118} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={340} fill={KRP.ink}>Q</text>
      </g>
      <QMark x={1440} y={400} s={1.7} f={f} t={seg(f, 18, 28)} />
      <TagPlate x={1440} y={640} text="クイズ" size={62} t={seg(f, 26, 40)} color={KRP.red} />
      {/* 手前の観客の影 (後ろ姿) */}
      <PersonMini x={140} y={1180} s={1.8} color={C.nightInk} f={f} phase={1} face="none" />
      <PersonMini x={1790} y={1190} s={1.9} color={C.nightInk} f={f} phase={4} face="none" />
      {/* 緞帳 (手前がけ) */}
      <CurtainTop f={f} />
    </Frame>
  );
};

// #2 古代オリンピックで2位になった人の名前は、何人わかっているでしょうか。
// どこ: #1と同じ表彰式会場。殿堂の壁の前に記録碑が2基、その前に選手が2人立つ
// 演出: スポットライト1本が「優勝者」から「隣の2位」へ振れる。当たっていない側は影に沈む
// 動き: 光が左→右へ振れる / 石碑が順に立つ / 書記の槌が打つ / 房が揺れる / 人がゆれる
const I_S2_TAG_Y = 270;  // 左右で見くらべる1対の札の高さ (1pxもずらさない)
const I_S2_WIN_X = 620;  // 優勝者の立ち位置 = スポットの最初の振り先
const I_S2_2ND_X = 1090; // 「2位」の選手の立ち位置 = スポットの振り終わり
const S2: React.FC<{ f: number }> = ({ f }) => {
  const hammer = Math.abs(Math.sin(f / 5)) * 26;
  // スポットライトは1本だけ。台本が「2位になった人」と読むあたりで隣へなめらかに移る
  const k = seg(f, 30, 48);
  const swing = k * k * (3 - 2 * k); // 出入りのなめらかな振り
  const spotX = I_S2_WIN_X + (I_S2_2ND_X - I_S2_WIN_X) * swing; // 床の当たり位置
  const spotHangX = 790 + 110 * swing; // 吊り元 (天井側) もわずかに動く
  const litL = 1 - swing; // 優勝者に当たっている量
  const litR = swing;     // 2位に当たっている量
  const bobW = Math.sin((f + 34) / 13) * 3; // 優勝者の体ゆれ (冠も一緒に動かす)
  const bob2 = Math.sin((f + 85) / 13) * 3; // 2位の体ゆれ
  return (
    <Frame f={f} seed={901} bg={C.marble}>
      <defs>
        {/* 光の当たっていない側を沈ませる影 (ふちがぼける) */}
        <radialGradient id="ib0s2shade">
          <stop offset="0.4" stopColor={C.nightInk} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.nightInk} stopOpacity={0} />
        </radialGradient>
      </defs>
      <VenueStage f={f} beams={[[spotHangX, spotX]]} floorY={880} />
      {/* 動くスポットの芯 (ここがいちばん明るい) */}
      <polygon
        points={`${spotHangX - 26},-20 ${spotHangX + 26},-20 ${spotX + 150},940 ${spotX - 150},940`}
        fill={KRP.yellow} opacity={0.14 + Math.sin(f / 8) * 0.025} />
      {/* 殿堂の柱2本 */}
      <GreekColumn x={150} y={900} h={640} opacity={0.85} />
      <GreekColumn x={1790} y={900} h={640} opacity={0.85} />
      {/* オリーブの飾り (壁) */}
      <g transform="translate(240 330) rotate(18)">
        <path d="M 0 0 Q 120 30 250 10" fill="none" stroke={C.laurel} strokeWidth={8} />
        {[40, 90, 140, 190].map((lx, i) => (
          <g key={i}>
            <ellipse cx={lx} cy={2} rx={22} ry={9} fill={C.laurel} stroke={KRP.ink} strokeWidth={3}
              transform={`rotate(${i % 2 ? 34 : -30} ${lx} 2)`} />
          </g>
        ))}
      </g>
      {/* 左: 優勝者の石碑 (刻み線びっしり) と、月桂冠をかぶった優勝者 */}
      <g opacity={0.62 + 0.38 * litL}>
        <Sekihi x={560} y={892} w={380} h={520} t={seg(f, 2, 12)} seed={3} />
        <ellipse cx={I_S2_WIN_X} cy={896} rx={86} ry={15} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(0 ${bobW})`}>
          <Person x={I_S2_WIN_X} y={892} s={1.02} cloth={KRP.white} clothDark={C.marbleDark}
            face="joy" pose="raise" hair="cap" f={f} phase={2} still />
          <LaurelCrown x={I_S2_WIN_X} y={892 - 250 * 1.02} s={1.47} />
        </g>
      </g>
      {/* 右: まっさらの石碑と、冠のない「2位」の選手 (うつむきがち) */}
      <g opacity={0.62 + 0.38 * litR}>
        <Sekihi x={1150} y={892} w={380} h={520} blank t={seg(f, 8, 18)} seed={5} />
        <ellipse cx={I_S2_2ND_X} cy={896} rx={84} ry={15} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(0 ${bob2})`}>
          <Person x={I_S2_2ND_X} y={892} s={1.0} cloth={KRP.gray} clothDark={KRP.grayDark}
            face="sad" gaze={[0, 7]} lean={5} hair="cap" f={f} phase={5} still />
        </g>
      </g>
      {/* 光の当たっていない側は影に沈む */}
      <ellipse cx={560} cy={670} rx={430} ry={400} fill="url(#ib0s2shade)" opacity={litR} />
      <ellipse cx={1150} cy={670} rx={430} ry={400} fill="url(#ib0s2shade)" opacity={litL} />
      {/* 1対の札 (高さは I_S2_TAG_Y でそろえる) */}
      <TagPlate x={560} y={I_S2_TAG_Y} text="優勝者" size={48} t={seg(f, 14, 24)} />
      <TagPlate x={1150} y={I_S2_TAG_Y} text="第2位" size={48} t={seg(f, 20, 30)} color={KRP.red} />
      <QMark x={1255} y={560} s={1.3} f={f} t={seg(f, 24, 34)} />
      {/* 書記 (彫る人) */}
      <Person x={1520} y={904} s={0.98} cloth={C.terracotta} clothDark={C.terraDark}
        face="normal" gaze={[-6, 2]} f={f} phase={2} />
      {/* 槌 (fで打つ) */}
      <g transform={`translate(1402 ${680 + hammer * 0.2}) rotate(${-38 - hammer})`}>
        <rect x={-10} y={-80} width={20} height={80} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-30} y={-116} width={60} height={40} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 手前の観客の影 (後ろ姿) */}
      <PersonMini x={180} y={1150} s={1.6} color={C.nightInk} f={f} phase={0} face="none" />
      <PersonMini x={855} y={1170} s={1.5} color={C.nightInk} f={f} phase={3} face="none" />
      <PersonMini x={1800} y={1155} s={1.6} color={C.nightInk} f={f} phase={6} face="none" />
      {/* 緞帳 (手前がけ) */}
      <CurtainTop f={f} />
    </Frame>
  );
};

// #3 答えは、ゼロ人です。
// どこ: #1/#2と同じ会場。「まっさらの石碑」へ大きく寄り、中央のスポットライトが当たる
// 演出: 画面いっぱいの白い石碑に、巨大な「0人」の判子がドンと押される
// 動き: スポットが f につれて絞られ、まっさらな石碑と判子に光が集まる / 判子が pop / 房が揺れる
const S3: React.FC<{ f: number }> = ({ f }) => {
  const st = pop(seg(f, 16, 26));
  const rise = easeOut(seg(f, 0, 12));
  // 光が絞られていく (広い → まっさらな石碑と「0人」に集まる)
  const iris = easeOut(seg(f, 2, 30));
  const topHalf = 300 - 232 * iris;  // 吊り元の半幅 300 → 68
  const botHalf = 760 - 430 * iris;  // 床での半幅 760 → 330
  const puls = Math.sin(f / 7) * 0.025; // 光の脈
  const flash = seg(f, 16, 21) * (1 - seg(f, 24, 36)) * 0.06; // 判子が落ちた瞬間の強まり
  return (
    <Frame f={f} seed={902}
      over={
        <div style={{
          position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
          opacity: clamp01(st), transform: `scale(${0.7 + clamp01(st) * 0.3})`,
          transformOrigin: "960px 470px",
        }}>
          {st > 0 && <Stamp x={700} y={320} text="0人" size={210} />}
        </div>
      }>
      <defs>
        {/* 絞るほど、まわりが暗く落ちる (光が中央に集まって見える) */}
        <radialGradient id="ib0s3iris">
          <stop offset={0.2 + 0.14 * (1 - iris)} stopColor={C.nightInk} stopOpacity={0} />
          <stop offset="1" stopColor={C.nightInk} stopOpacity={0.4} />
        </radialGradient>
      </defs>
      {/* #1/#2 と同じ会場 (壁・木床・床板の継ぎ目)。光芒はこのシーンで自前に描く */}
      <VenueStage f={f} beams={[]} floorY={1010} />
      {/* 絞られていく光芒 (外側のやわらかい光) */}
      <polygon
        points={`${960 - topHalf},-20 ${960 + topHalf},-20 ${960 + botHalf},1090 ${960 - botHalf},1090`}
        fill={KRP.yellow} opacity={0.09 + 0.05 * iris + puls + flash} />
      {/* 絞られていく光芒の芯 (さらに細く・さらに強く) */}
      <polygon
        points={`${960 - topHalf * 0.46},-20 ${960 + topHalf * 0.46},-20
          ${960 + botHalf * 0.5},1090 ${960 - botHalf * 0.5},1090`}
        fill={KRP.yellow} opacity={0.06 + 0.11 * iris + puls + flash} />
      {/* 床の光だまり (絞るほど小さく強く) */}
      <ellipse cx={960} cy={1050} rx={botHalf * 0.86} ry={34 + 22 * iris}
        fill={KRP.yellow} opacity={0.13 + 0.11 * iris + puls + flash} />
      {/* 殿堂の柱 (#2 と同じ。左右の端) */}
      <GreekColumn x={120} y={1012} h={700} opacity={0.8} />
      <GreekColumn x={1800} y={1012} h={700} opacity={0.8} />
      {/* 壁のオリーブ飾り (#2 と同じ意匠。左右対) */}
      <g transform="translate(250 380) rotate(14)" opacity={0.85}>
        <path d="M 0 0 Q 100 26 210 8" fill="none" stroke={C.laurel} strokeWidth={7} />
        {[36, 80, 124, 168].map((lx, i) => (
          <ellipse key={i} cx={lx} cy={2} rx={19} ry={8} fill={C.laurel} stroke={KRP.ink}
            strokeWidth={3} transform={`rotate(${i % 2 ? 32 : -28} ${lx} 2)`} />
        ))}
      </g>
      <g transform="translate(1670 430) scale(-1 1) rotate(14)" opacity={0.85}>
        <path d="M 0 0 Q 100 26 210 8" fill="none" stroke={C.laurel} strokeWidth={7} />
        {[36, 80, 124, 168].map((lx, i) => (
          <ellipse key={i} cx={lx} cy={2} rx={19} ry={8} fill={C.laurel} stroke={KRP.ink}
            strokeWidth={3} transform={`rotate(${i % 2 ? 32 : -28} ${lx} 2)`} />
        ))}
      </g>
      {/* まっさらの石碑に大きく寄る (短辺の1/2以上) */}
      <g transform={`translate(0 ${(1 - rise) * 140})`}>
        <Sekihi x={960} y={1030} w={760} h={860} blank seed={5} />
        {/* 寄りで見えるノミ跡の追加 */}
        <g stroke={C.marbleDark} strokeWidth={4} opacity={0.65}>
          <line x1={700} y1={420} x2={746} y2={448} />
          <line x1={1180} y1={560} x2={1224} y2={584} />
          <line x1={820} y1={760} x2={870} y2={784} />
          <line x1={1100} y1={330} x2={1140} y2={356} />
        </g>
      </g>
      {/* 石碑の面に当たる光 (石碑より手前。絞るほど石碑と判子に集まる) */}
      <polygon
        points={`${960 - topHalf * 0.5},-20 ${960 + topHalf * 0.5},-20
          ${960 + botHalf * 0.42},1090 ${960 - botHalf * 0.42},1090`}
        fill={KRP.yellow} opacity={0.04 + 0.1 * iris + puls * 0.8 + flash} />
      {/* まわりが暗く落ちていく */}
      <ellipse cx={960} cy={470} rx={1320} ry={920}
        fill="url(#ib0s3iris)" opacity={0.3 + 0.7 * iris} />
      {/* 手前の観客の影 (下辺の後ろ姿。#1/#2 と同等の並び) */}
      <PersonMini x={240} y={1250} s={2.2} color={C.nightInk} f={f} phase={2} face="none" />
      <PersonMini x={530} y={1320} s={2.4} color={C.nightInk} f={f} phase={0} face="none" />
      <PersonMini x={1390} y={1330} s={2.5} color={C.nightInk} f={f} phase={3} face="none" />
      <PersonMini x={1660} y={1260} s={2.3} color={C.nightInk} f={f} phase={5} face="none" />
      {/* 緞帳 (手前がけ) */}
      <CurtainTop f={f} />
    </Frame>
  );
};

// #4 名前が残っていないのではありません。
// どこ: 博物館の展示室。台座の上に開かれた記録簿の巻物 (phase=1)
// 演出: 「1位」の行には名前の線。下の行は「風化して消えた?」のかすれ痕 → ×で否定
// 動き: 巻物が開く / 1位の行が灯る / 額照明の光がゆらぐ / ロープがたわむ
const S4: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={903}>
    <MuseumRoom f={f} />
    <RecordRoll f={f} phase={1} />
  </Frame>
);

// #5 そもそも「2位」という記録自体が、存在しないのです。
// どこ: #4と同じ展示室・同じ巻物 (phase=2)。#4 の最後の絵からそのまま続く1枚
// 演出: 「存在しない」で紙の書き込み (1位の文字・名前の線・かすれた2位の痕・風化×) が
//       フェードアウトし、空いた「2位」の欄へカメラが寄っていく (最後は1.75倍)
// 動き: 書き込みが消える / 展示室ごとズームイン / 赤点線が流れる / ？が出る / ロープがたわむ
// ※seed は #4 と同じ 903。手描きゆらぎの出方までそろえて、切り替わりを見えなくする
const S5: React.FC<{ f: number }> = ({ f }) => {
  const ink = ib0S5Ink(f); // #4 から持ち越した書き込みが消える量
  const e = easeOut(seg(f, 45, 115)); // カメラの寄り (易しい加速)
  const z = 1 + 0.75 * e; // 最後は1.75倍
  const CX = 465, CY = 590; // 「2位」の欄 (紙の左下)。ここを動かさずに寄る
  const px = (960 - CX) * 0.6 * e; // 寄りながら、欄を少しだけ画面中央へ送る
  const py = (540 - CY) * 0.6 * e;
  return (
    <Frame f={f} seed={903}>
      {/* 展示室ごと寄る (札だけは寄りの外に出して、画面外へ飛ばさない) */}
      <g transform={`translate(${px} ${py}) translate(${CX} ${CY}) scale(${z}) translate(${-CX} ${-CY})`}>
        <MuseumRoom f={f} />
        <RecordRoll f={f} phase={2} />
      </g>
      {/* #4 から続く札 → 紙の書き込みと一緒に消える */}
      <g opacity={ink}>
        <TagPlate x={1460} y={170} text="風化 ×" size={54} color={KRP.red} />
      </g>
      {/* 消えたあとに出る札 */}
      <TagPlate x={1430} y={170} text="らんが ない" size={50} t={seg(f, 74, 100)} color={KRP.red} />
    </Frame>
  );
};

// #6 古代ギリシャのオリンピア。優勝者は彫像が建ち、詩人が歌をつくり、故郷の英雄になりました。
// どこ: 凱旋の広場。遠景の丘と神殿、左端に聖火台、中央に台座、左に詩人、二重の群衆が囲む
// 演出: 事件=彫像が台座の中から seg でせり上がって除幕される
// 動き: 彫像がせり上がる / 群衆が腕を振る / 聖火と煙がゆらぐ / 花びらが舞う / 竪琴の弦が揺れる
// 装い: 人はぜんぶ GreekPerson (キトン + ヒマティオン + サンダル + ひげ + タイニア)。
//       彫像は競技者像なので、裸ではなく腰布 (ペリゾマ) と片肩のヒマティオンの装いにしてある
const S6: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 6, 26));
  return (
    <Frame f={f} seed={905} bg={C.marble}>
      {/* 空と床 */}
      <rect x={-20} y={-20} width={W + 40} height={420} fill={C.aegean} opacity={0.32} />
      <rect x={-20} y={870} width={W + 40} height={230} fill={C.marbleDark} opacity={0.45} />
      {/* 遠景の丘 */}
      <path d="M -20 430 Q 260 300 560 430 Z" fill={C.laurel} opacity={0.28} />
      <path d="M 1340 430 Q 1620 290 1940 430 Z" fill={C.laurel} opacity={0.28} />
      {/* 神殿 (奥) */}
      <g opacity={0.8}>
        <polygon points="640,230 960,130 1280,230" fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
        <rect x={660} y={230} width={600} height={26} fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
        {[720, 880, 1040, 1200].map((cx, i) => (
          <GreekColumn key={i} x={cx} y={560} h={310} w={54} />
        ))}
        <rect x={650} y={560} width={620} height={22} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 聖火台 (左端。煙が立ちのぼる) */}
      <g transform="translate(130 800)">
        <g stroke={KRP.ink} strokeWidth={9} strokeLinecap="round">
          <line x1={-48} y1={0} x2={-14} y2={-122} />
          <line x1={48} y1={0} x2={14} y2={-122} />
          <line x1={0} y1={0} x2={0} y2={-122} />
        </g>
        <path d="M -80 -196 Q -70 -130 0 -124 Q 70 -130 80 -196 Z"
          fill={C.marbleDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-196} rx={80} ry={16} fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
        <FlameIcon x={0} y={-200} s={0.36} f={f + 5} />
        {/* 煙 */}
        {[0, 1, 2].map((i) => {
          const riseS = (f * 1.4 + i * 80) % 240;
          return (
            <circle key={i} cx={12 + Math.sin((f + i * 20) / 9) * 14} cy={-330 - riseS}
              r={14 + riseS * 0.08} fill={C.mist} opacity={0.5 * (1 - riseS / 240)} />
          );
        })}
      </g>
      {/* 彫像 (台座の中からせり上がる。台座より下はクリップで隠す) */}
      <clipPath id="ib0s6clip"><rect x={700} y={-20} width={520} height={690} /></clipPath>
      <g clipPath="url(#ib0s6clip)">
        <g transform={`translate(960 ${670 + (1 - rise) * 320})`}>
          {/* 競技者像: 腰布 (ペリゾマ) と片肩のヒマティオンだけの、競技前の装い */}
          {/* 脚 (片足を踏み出したコントラポスト) */}
          <g stroke={KRP.ink} strokeWidth={6}>
            <path d="M -44 0 L -48 -112 L -14 -112 L -12 0 Z" fill={C.marble} />
            <path d="M 10 0 L 16 -112 L 50 -112 L 44 0 Z" fill={C.marble} />
          </g>
          {/* 腰布 (裾が彫刻のひだになる) */}
          <path d="M -58 -106 Q -64 -148 -52 -176 L 52 -176 Q 64 -148 58 -106
            Q 28 -92 0 -100 Q -28 -92 -58 -106 Z" fill={C.marble} stroke={KRP.ink} strokeWidth={6.5} />
          {/* 胴 (胸と腹の彫り) */}
          <path d="M -58 -172 Q -66 -232 -48 -262 Q 0 -278 48 -262 Q 66 -232 58 -172 Z"
            fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
          <g fill="none" stroke={C.marbleDark} strokeWidth={4.5} opacity={0.85}>
            <path d="M -34 -244 Q 0 -226 34 -244" />
            <line x1={0} y1={-226} x2={0} y2={-182} />
            <path d="M -24 -206 q 24 8 48 0" />
          </g>
          {/* 片肩に掛かるヒマティオン (布の縁が彫られている) */}
          <path d="M -52 -258 Q -92 -206 -84 -150 Q -62 -138 -46 -152 Q -40 -206 -22 -248 Z"
            fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.marbleDark} strokeWidth={4} opacity={0.8}>
            <line x1={-74} y1={-212} x2={-66} y2={-154} />
            <line x1={-58} y1={-224} x2={-52} y2={-158} />
          </g>
          {/* 腕 (右腕で月桂冠を高く掲げる・左腕は下げて布をつかむ) */}
          <path d="M 48 -256 L 104 -334 L 134 -316 L 80 -240 Z" fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -50 -254 L -94 -188 L -68 -170 L -30 -236 Z" fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
          {/* 掲げた月桂冠 */}
          <LaurelCrown x={128} y={-346} s={0.85} />
          {/* 頭 (巻き毛の彫りと月桂冠) */}
          <circle cx={0} cy={-312} r={54} fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
          <g fill={C.marbleDark} opacity={0.75}>
            {[-34, -12, 12, 34].map((hx, i) => (
              <circle key={i} cx={hx} cy={-348 + Math.abs(hx) * 0.3} r={12} />
            ))}
          </g>
          <g stroke={C.marbleDark} strokeWidth={4} opacity={0.8} fill="none">
            <path d="M -20 -316 q 9 6 17 0" />
            <path d="M 4 -316 q 9 6 17 0" />
            <line x1={0} y1={-310} x2={0} y2={-292} />
          </g>
          <LaurelCrown x={0} y={-338} s={0.95} />
        </g>
      </g>
      {/* 台座 */}
      <g>
        <rect x={810} y={670} width={300} height={210} rx={8} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={780} y={856} width={360} height={36} rx={6} fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
        <rect x={840} y={700} width={240} height={60} rx={6} fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
        {/* 台座の銘 (読めない刻み線) */}
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.75}>
          <line x1={866} y1={722} x2={1050} y2={722} />
          <line x1={866} y1={742} x2={990} y2={742} />
        </g>
      </g>
      {/* 観衆の奥の列 (キトン姿。遠いので小さく薄く) */}
      {([[320, 0.52, 0], [560, 0.56, 1], [1240, 0.54, 2], [1440, 0.5, 3], [1680, 0.58, 4]] as const)
        .map(([mx, ms, ph], i) => (
          <GreekPerson key={i} x={mx} y={890} s={ms} pose={i % 2 ? "cheer" : "stand"}
            cloth={[C.terracotta, C.mist, C.aegean, C.laurel, C.terraDark][i]}
            clothDark={C.terraDark} band={i % 3 === 0} beard={i % 2 === 1}
            opacity={0.62} f={f} phase={ph} />
        ))}
      {/* 詩人 (左・ひげ・タイニア・ヒマティオンを掛けて竪琴をかまえる) */}
      <GreekPerson x={430} y={918} s={1.05} pose="lyre" cloth={C.mist} clothDark={C.marbleDark}
        himation={C.aegean} beard band f={f} phase={1} />
      <g transform={`translate(540 ${800 + Math.sin(f / 9) * 3})`}>
        <path d="M -40 0 Q -56 -90 -16 -120 M 40 0 Q 56 -90 16 -120 M -40 0 Q 0 24 40 0"
          fill="none" stroke={C.wood} strokeWidth={10} strokeLinecap="round" />
        {[-20, -7, 7, 20].map((lx, i) => (
          <line key={i} x1={lx * 0.8} y1={-110} x2={lx} y2={6}
            stroke={KRP.ink} strokeWidth={2.5}
            transform={`translate(${Math.sin((f + i * 5) / 4) * 1.5} 0)`} />
        ))}
      </g>
      {/* 群衆 (キトン + ヒマティオンで両手を上げる) */}
      <GreekPerson x={190} y={1012} s={0.84} pose="cheer" cloth={C.terracotta}
        clothDark={C.terraDark} himation={C.mist} band f={f} phase={0} />
      <GreekPerson x={620} y={1046} s={0.9} pose="cheer" cloth={C.mist}
        clothDark={C.marbleDark} beard f={f} phase={1} />
      <GreekPerson x={1310} y={1042} s={0.92} pose="cheer" cloth={C.aegean}
        clothDark="#35596E" himation={C.terracotta} f={f} phase={2} />
      <GreekPerson x={1540} y={1008} s={0.82} pose="stand" cloth={C.laurel}
        clothDark="#4A6B3C" beard band f={f} phase={3} />
      <GreekPerson x={1766} y={1046} s={0.88} pose="cheer" cloth={C.terraDark}
        clothDark="#6B3826" himation={C.mist} f={f} phase={4} />
      {/* 舞い散る花びら (fで落ちる) */}
      {Array.from({ length: 10 }, (_, i) => {
        const px = 180 + rnd(i * 7 + 2) * 1560;
        const py = ((f * (2.2 + rnd(i) * 2) + i * 173) % 760) + 60;
        return (
          <ellipse key={i} cx={px + Math.sin((f + i * 31) / 13) * 22} cy={py}
            rx={11} ry={6} fill={i % 2 ? C.laurel : KRP.yellow}
            stroke={KRP.ink} strokeWidth={2}
            transform={`rotate(${f * 4 + i * 40} ${px} ${py})`} opacity={0.9} />
        );
      })}
      <TagPlate x={1620} y={210} text="英雄！" size={54} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// #7 では、負けた選手はどうなったのか。
// どこ: 祝祭の光の輪の外。夕暮れの競技場の隅 (くずれた円柱・一番星)
// 演出: 負けた選手が8人。うなだれる/顔を覆う/座り込む/膝に手をつく/背を向けて去る と
//       姿勢を変え、奥の人は小さく薄く置いて奥行きを出す。1人ずつ seg でずれて現れる。
//       足元に落ちた月桂冠。右奥に宴の灯り、神殿シルエット。頭上に？
// 動き: 1人ずつ現れる / 宴の灯りが f でちらつく / 影が伸びる / 一番星がまたたく / QMarkが揺れる
const S7: React.FC<{ f: number }> = ({ f }) => {
  const shadow = 0.7 + easeOut(seg(f, 4, 30)) * 0.3;
  // 負けた選手たち。手前は大きく濃く、奥は小さく薄く。右の宴の光に背を照らされて影は左へ伸びる
  // [x, 足元y, 大きさ, 姿勢, キトン, ひだの影, 不透明度, 左右反転]
  const LOSERS: Array<[number, number, number, GreekPose, string, string, number, boolean]> = [
    [1232, 792, 0.5, "mourn", C.mist, C.marbleDark, 0.5, true],
    [878, 806, 0.55, "away", C.soil, C.terraDark, 0.55, false],
    [612, 834, 0.66, "stand", C.aegean, "#35596E", 0.66, false],
    [1118, 874, 0.8, "mourn", C.terracotta, C.terraDark, 0.8, true],
    [286, 904, 0.9, "away", C.mist, C.marbleDark, 0.86, false],
    [934, 936, 1.02, "cover", C.soil, C.terraDark, 0.95, false],
    [470, 1004, 1.14, "sit", C.aegean, "#35596E", 1, false],
    [716, 962, 1.24, "bend", C.terracotta, C.terraDark, 1, false],
  ];
  return (
    <Frame f={f} seed={906} bg={C.marble}>
      {/* 夕空 */}
      <rect x={-20} y={-20} width={W + 40} height={560} fill={C.aegean} opacity={0.5} />
      <rect x={-20} y={380} width={W + 40} height={180} fill={C.dusk} opacity={0.55} />
      {/* 地面 */}
      <rect x={-20} y={560} width={W + 40} height={540} fill={C.marbleDark} opacity={0.5} />
      {/* 遠くの神殿シルエット */}
      <g opacity={0.75} fill={C.terraDark} stroke="none">
        <polygon points="1370,430 1540,370 1710,430" />
        <rect x={1390} y={430} width={300} height={130} />
        {[1420, 1490, 1560, 1630].map((cx, i) => (
          <rect key={i} x={cx} y={440} width={26} height={120} fill={C.marble} opacity={0.5} />
        ))}
      </g>
      {/* 遠景にもう1本の折れ柱 (地平線ぎわのシルエット) */}
      <g fill={C.terraDark} opacity={0.6}>
        <rect x={1092} y={596} width={56} height={10} />
        <path d="M 1104 596 L 1104 508 L 1114 516 L 1122 502 L 1132 514 L 1136 596 Z" />
      </g>
      {/* 薄い夕雲 (帯の上をゆっくり流れる) */}
      <g fill="none" stroke={C.marble} strokeWidth={9} strokeLinecap="round" opacity={0.5}>
        <path d={`M ${1080 + Math.sin(f / 19) * 10} 190 q 80 -14 200 0 q 90 10 170 2`} />
        <path d={`M ${640 + Math.sin(f / 23 + 2) * 8} 270 q 70 -12 170 0`} />
      </g>
      {/* 小さな星たち (一番星のまわりに控えめに) */}
      <g fill={KRP.yellow} opacity={0.85}>
        <circle cx={760} cy={120} r={5 + Math.sin(f / 9) * 1.5} />
        <circle cx={1210} cy={70} r={4 + Math.sin(f / 7 + 2) * 1.5} />
        <circle cx={960} cy={210} r={3.5 + Math.sin(f / 8 + 4) * 1.2} />
      </g>
      {/* もう1羽のツバメ (遠く) */}
      <path d={`M 1660 ${132 + Math.sin(f / 7 + 3) * 6} q 12 -11 24 0 q 12 -11 24 0`}
        fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />
      {/* 宴の光の輪 (彼はその外にいる) */}
      <circle cx={1560} cy={620} r={330} fill={KRP.yellow}
        opacity={0.26 + Math.sin(f / 7) * 0.05} />
      {/* 宴の灯り (ちらつく松明) */}
      {[1430, 1560, 1690].map((tx, i) => (
        <g key={i} transform={`translate(${tx} 600)`}>
          <rect x={-7} y={0} width={14} height={76} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 0 4 C -22 4 -28 -22 -20 -40 C -14 -54 -6 -58 0 -76 C 8 -58 16 -52 20 -38 C 26 -20 22 4 0 4 Z`}
            fill={KRP.orange} stroke={KRP.ink} strokeWidth={4}
            transform={`scale(1 ${1 + Math.sin((f + i * 9) / 4) * 0.12})`} />
        </g>
      ))}
      {/* くずれた円柱 (競技場の隅) */}
      <g transform="translate(150 948)">
        <rect x={-58} y={-26} width={116} height={26} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -40 -26 L -40 -250 L -16 -232 L 4 -262 L 26 -238 L 40 -256 L 40 -26 Z"
          fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.marbleDark} strokeWidth={3} opacity={0.7}>
          <line x1={-13} y1={-226} x2={-13} y2={-34} />
          <line x1={13} y1={-232} x2={13} y2={-34} />
        </g>
        {/* 転がった破片 */}
        <ellipse cx={124} cy={-14} rx={46} ry={16} fill={C.marble} stroke={KRP.ink} strokeWidth={5}
          transform="rotate(-8 124 -14)" />
      </g>
      {/* 乾いた地面の線 (土のひび・踏み跡) */}
      <g fill="none" stroke={C.terraDark} strokeWidth={4} strokeLinecap="round" opacity={0.35}>
        <path d="M 360 700 q 90 10 190 2" />
        <path d="M 560 810 q 80 8 170 0" />
        <path d="M 980 760 q 70 10 150 4" />
        <path d="M 330 950 q 76 8 160 2" />
        <path d="M 1010 1010 q 90 10 180 2" />
        <path d="M 120 1060 q 80 8 170 2" />
      </g>
      {/* 小石 */}
      <g fill={C.marble} stroke={KRP.ink} strokeWidth={3.5}>
        <ellipse cx={470} cy={1016} rx={24} ry={14} />
        <ellipse cx={524} cy={1034} rx={14} ry={9} />
        <ellipse cx={1120} cy={936} rx={18} ry={11} />
        <ellipse cx={330} cy={742} rx={13} ry={8} />
        <ellipse cx={1030} cy={668} rx={11} ry={7} />
      </g>
      {/* 乾いた草 (fでかすかに揺れる) */}
      <g fill="none" stroke={C.riceDark} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
        <path d={`M 420 790 Q ${414 + Math.sin(f / 8) * 5} 756 ${418 + Math.sin(f / 8) * 8} 732`} />
        <path d={`M 436 790 Q ${436 + Math.sin(f / 8 + 1) * 5} 760 ${446 + Math.sin(f / 8 + 1) * 8} 740`} />
        <path d={`M 1060 880 Q ${1052 + Math.sin(f / 9 + 2) * 5} 846 ${1056 + Math.sin(f / 9 + 2) * 8} 822`} />
        <path d={`M 1076 880 Q ${1076 + Math.sin(f / 9 + 3) * 5} 852 ${1086 + Math.sin(f / 9 + 3) * 8} 832`} />
        <path d={`M 250 1066 Q ${242 + Math.sin(f / 8 + 4) * 5} 1030 ${246 + Math.sin(f / 8 + 4) * 8} 1004`} />
      </g>
      {/* 一番星とツバメ */}
      <g transform={`translate(260 110) scale(${0.8 + Math.sin(f / 7) * 0.25})`}
        stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
        <line x1={-16} y1={0} x2={16} y2={0} />
        <line x1={0} y1={-16} x2={0} y2={16} />
      </g>
      <path d={`M 470 ${96 + Math.sin(f / 8) * 5} q 16 -14 32 0 q 16 -14 32 0`}
        fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      {/* 負けた選手たちの長い影 (右の宴の光と反対=左へ、斜めに伸びる) */}
      {LOSERS.map(([lx, ly, ls, , , , op], i) => {
        const t = seg(f, 2 + i * 3, 12 + i * 3);
        const len = (130 + ls * 190) * shadow;
        return (
          <polygon key={`sh${i}`} opacity={0.3 * op * t}
            points={`${lx - 34 * ls},${ly} ${lx + 34 * ls},${ly}
              ${lx - len + 44 * ls},${ly + 56 * ls} ${lx - len - 26 * ls},${ly + 56 * ls}`}
            fill={KRP.ink} />
        );
      })}
      {/* 足元に落ちた月桂冠 (ふたつ。踏まれて転がっている) */}
      <g transform="translate(862 982) rotate(24)" opacity={seg(f, 10, 20)}>
        <LaurelCrown x={0} y={0} s={0.85} />
      </g>
      <g transform="translate(1316 896) rotate(-14)" opacity={seg(f, 16, 26)}>
        <LaurelCrown x={0} y={0} s={0.5} />
      </g>
      {/* 負けた選手 8人 (奥から順に。姿勢をぜんぶ変えて、1人ずつずれて現れる) */}
      {LOSERS.map(([lx, ly, ls, lpose, lc, lcd, op, lflip], i) => (
        <GreekPerson key={i} x={lx} y={ly} s={ls} pose={lpose}
          cloth={lc} clothDark={lcd} flip={lflip}
          beard={i % 3 === 0} band={i % 4 === 1} opacity={op}
          t={seg(f, 2 + i * 3, 12 + i * 3)} f={f} phase={i + 1} />
      ))}
      <QMark x={1012} y={430} s={1.5} f={f} t={seg(f, 18, 30)} />
      <TagPlate x={330} y={300} text="光の そと" size={48} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// #8 詩人ピンダロスは書いています。敗者は母親に会うのも恥ずかしくて、裏通りをこそこそ帰った、と。
// どこ: 日が落ちた直後の裏通り。路地の低い位置から、突き当たりの明るい表通りへ向かって見る
// 演出: 石積みの壁がパースで迫り、頭上に軒と干した布。突き当たりは残照で白く抜けた表通りで、
//       神殿の列柱と祝宴の人影が影絵になっている。その明かりを背に、ヒマティオンを頭から被って
//       肩を丸めた敗者が、こちら (暗がり) へ足早に帰ってくる。表通りの光が長い影を斜めに落とす。
// 動き: 敗者が奥→手前へ歩き大きくなる (脚が交互・裾が揺れる) / 表通りの明かりと篝火がゆらぐ /
//       壁の灯明の炎と光の輪がゆれる / 干した布がそよぐ / 雲が流れる / 野良犬の尾が振れる
const S8: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 4, 38));
  const px = 1110 - walk * 210;   // 敗者の位置 (奥→手前へ)
  const py = 802 + walk * 192;    // 手前に来るほど足元が下がる
  const ps = 0.78 + walk * 0.62;  // 手前に来るほど大きい
  const glow = 0.34 + Math.sin(f / 11) * 0.05; // 表通りの明かりのゆらぎ
  return (
    <Frame f={f} seed={907} bg={C.nightInk} dark>
      {/* ── 空 (日が落ちた直後。上は藍、地平ぎわに残照) ── */}
      <rect x={-20} y={-20} width={W + 40} height={420} fill="#242B3A" />
      <rect x={-20} y={180} width={W + 40} height={240} fill={C.nightInk} opacity={0.55} />
      <rect x={-20} y={286} width={W + 40} height={134} fill={C.dusk} opacity={0.22} />
      {/* 月 (路地の上。かけ具合を影で作る) */}
      <circle cx={1000} cy={148} r={72} fill={KRP.yellow} opacity={0.9} />
      <circle cx={976} cy={132} r={58} fill="#242B3A" opacity={0.3} />
      {/* 流れる雲 */}
      <g opacity={0.12} fill={KRP.blueSoft}>
        <ellipse cx={(1200 + f * 1.6) % (W + 400) - 200} cy={104} rx={170} ry={28} />
        <ellipse cx={(400 + f * 1.1) % (W + 400) - 200} cy={212} rx={210} ry={34} />
      </g>
      {/* ── 突き当たり = 明るい表通り (残照と祝宴の灯りで白く抜ける) ── */}
      <rect x={880} y={330} width={420} height={420} fill={C.dusk} opacity={0.5} />
      <rect x={880} y={462} width={420} height={288} fill={KRP.yellow} opacity={glow} />
      {/* 向かいの家並み (影絵) */}
      <polygon points="880,330 880,478 1006,478 1006,396" fill={C.nightWallDark} />
      <polygon points="1300,330 1300,448 1186,448 1186,382" fill={C.nightWallDark} />
      {/* 神殿の列柱と破風 (表通りの奥。影になって立っている) */}
      <polygon points="1010,370 1184,338 1184,384 1010,398" fill={C.nightWallDark} />
      <polygon points="1030,340 1098,316 1166,340" fill={C.nightWallDark} />
      {[1030, 1068, 1106, 1144, 1176].map((cx2, i) => (
        <GreekColumn key={i} x={cx2} y={566} h={188} w={22}
          fill={C.nightWallDark} opacity={0.96} />
      ))}
      {/* 表通りの篝火 (祝宴の火。ゆらぐ) */}
      <circle cx={1248} cy={636} r={62} fill={KRP.yellow} opacity={0.3 + Math.sin(f / 6) * 0.07} />
      <FlameIcon x={1248} y={652} s={0.17} f={f + 9} />
      {/* 表通りを行く祝宴の人影 (遠いので小さい影絵) */}
      <GreekPerson x={944} y={724} s={0.3} pose="cheer" cloth={C.nightWallDark}
        clothDark={C.nightWallDark} skin={C.nightWallDark} opacity={0.95} f={f} phase={2} />
      <GreekPerson x={1266} y={742} s={0.34} pose="stand" cloth={C.nightWallDark}
        clothDark={C.nightWallDark} skin={C.nightWallDark} opacity={0.95} f={f} phase={5} />
      {/* ── 左右の壁 (パース) ── */}
      <polygon points="-20,-20 880,330 880,750 -20,1100" fill={C.nightWall} stroke={KRP.ink} strokeWidth={6} />
      <polygon points="1940,-20 1300,330 1300,750 1940,1100" fill={C.nightWallDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 石積みの目地 (奥に行くほど石が細くなる) */}
      <StoneWall xNear={-20} topNear={-20} botNear={1100} xFar={880} topFar={330} botFar={750}
        rows={8} cols={9} warp={0.5} opacity={0.42} />
      <StoneWall xNear={1940} topNear={-20} botNear={1100} xFar={1300} topFar={330} botFar={750}
        rows={8} cols={8} warp={0.5} opacity={0.34} />
      {/* 壁のてっぺんの明かり (残照が上の石だけ照らす) */}
      <polygon points="-20,-20 880,330 880,392 -20,78" fill={C.dusk} opacity={0.13} />
      <polygon points="1940,-20 1300,330 1300,386 1940,66" fill={C.dusk} opacity={0.1} />
      {/* ── 軒 (路地の上に張り出す。瓦の木口が並ぶ) ── */}
      <polygon points="-20,-66 880,284 880,330 -20,-20" fill="#1F2430" stroke={KRP.ink} strokeWidth={5} />
      <polygon points="1940,-66 1300,284 1300,330 1940,-20" fill="#1F2430" stroke={KRP.ink} strokeWidth={5} />
      <g fill={C.terraDark} stroke={KRP.ink} strokeWidth={3}>
        {Array.from({ length: 9 }, (_, i) => {
          const u = Math.pow(i / 9, 0.62);
          return <circle key={`eL${i}`} cx={-20 + 900 * u} cy={-43 + 350 * u} r={15 - u * 9} />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const u = Math.pow(i / 8, 0.62);
          return <circle key={`eR${i}`} cx={1940 - 640 * u} cy={-43 + 350 * u} r={15 - u * 9} />;
        })}
      </g>
      {/* ── 左の壁: 格子窓・低い戸口・壁龕 ── */}
      <polygon points="330,470 466,508 466,642 330,606" fill="#1C2029" stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.85}>
        <line x1={364} y1={479} x2={364} y2={615} />
        <line x1={398} y1={489} x2={398} y2={624} />
        <line x1={432} y1={498} x2={432} y2={633} />
        <line x1={330} y1={546} x2={466} y2={578} />
      </g>
      {/* 低い板戸の戸口と、すり減った上がり段 */}
      <polygon points="600,566 742,618 742,744 600,702" fill="#1A1E27" stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.65}>
        <line x1={648} y1={583} x2={648} y2={718} />
        <line x1={696} y1={600} x2={696} y2={731} />
      </g>
      <polygon points="596,744 746,746 760,772 592,772" fill={C.nightWallDark}
        stroke={KRP.ink} strokeWidth={4.5} />
      {/* ── 右の壁: 灯明 (オイルランプ) と、その光の輪 ── */}
      <circle cx={1486} cy={556} r={112} fill={KRP.yellow} opacity={0.13 + Math.sin(f / 7) * 0.04} />
      <polygon points="1424,486 1552,512 1552,616 1424,586" fill="#1A1E27" stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M 1436 582 Q 1488 598 1540 582 L 1536 566 Q 1488 582 1440 566 Z"
        fill={C.terraDark} stroke={KRP.ink} strokeWidth={3.5} />
      <FlameIcon x={1488} y={570} s={0.1} f={f} />
      {/* ── 洗濯ひもと干した布 (路地の頭上に生活の気配。そよぐ) ── */}
      <path d={`M 560 400 Q 1000 ${468 + Math.sin(f / 12) * 5} 1450 408`}
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
      {([[700, 436, C.mist], [872, 452, C.soil], [1010, 462, C.terracotta], [1250, 440, C.aegean]] as Array<[number, number, string]>)
        .map(([cxx, cyy, col], i) => (
          <g key={i} transform={`translate(${cxx} ${cyy}) rotate(${Math.sin((f + i * 13) / 9) * 5})`}>
            <rect x={-36} y={0} width={72} height={94} rx={6} fill={col} stroke={KRP.ink} strokeWidth={4}
              opacity={0.82} />
            <line x1={-36} y1={26} x2={36} y2={26} stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
            {/* 洗濯ばさみ代わりの結び */}
            <circle cx={0} cy={2} r={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      {/* ── 石敷きの地面 ── */}
      <polygon points="-20,1100 880,750 1300,750 1940,1100" fill="#262B38" stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.36} fill="none">
        {Array.from({ length: 9 }, (_, k) => {
          const v = Math.pow((k + 1) / 10, 1.7);
          return (
            <line key={`gr${k}`} x1={880 - 900 * v} y1={750 + v * 350}
              x2={1300 + 640 * v} y2={750 + v * 350} />
          );
        })}
        {Array.from({ length: 9 }, (_, k) => {
          const v0 = Math.pow(k / 10, 1.7), v1 = Math.pow((k + 1) / 10, 1.7);
          const at = (vv: number, u: number) =>
            [(880 - 900 * vv) + ((1300 + 640 * vv) - (880 - 900 * vv)) * u, 750 + vv * 350] as const;
          return Array.from({ length: 7 }, (_, c) => {
            const u = (c + (k % 2 ? 0.5 : 0)) / 7;
            const a = at(v0, u), b = at(v1, u);
            return <line key={`gc${k}-${c}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
          });
        })}
      </g>
      {/* 路地の真ん中を走る排水の溝 */}
      <polygon points="1078,752 1102,752 1016,1100 912,1100" fill="#1B1F2A"
        stroke={KRP.ink} strokeWidth={3.5} opacity={0.8} />
      {/* ── 表通りの明かりが落とす、斜めに長い影 ── */}
      <g fill={KRP.ink} opacity={0.24}>
        <polygon points="880,752 988,752 586,1104 150,1104" />
        <polygon points="1204,752 1300,752 1792,1104 1414,1104" />
      </g>
      {/* 敗者の長い影 (光を背にして、こちらへ斜めに伸びる) */}
      <polygon opacity={0.44} fill={KRP.ink}
        points={`${px - 46 * ps},${py} ${px + 46 * ps},${py}
          ${px - 86 * ps},1130 ${px - 300 * ps},1130`} />
      {/* ── 敗者 (ヒマティオンを頭から被り、肩を丸めて足早に帰る) ── */}
      <GreekPerson x={px} y={py} s={ps} pose="hide"
        cloth={C.nightWall} clothDark={C.nightWallDark} himation={C.terraDark}
        skin={C.mist} f={f} phase={0} />
      {/* ── 手前と中景の小物 ── */}
      <GreekAmphora x={1336} y={846} s={0.46} f={f} phase={4} opacity={0.9} />
      <GreekBasket x={1468} y={1002} s={0.72} f={f} phase={2} />
      {/* 路地にいる野良犬 (敗者を見ている) */}
      <StrayDog x={1380} y={968} s={0.76} f={f} color={C.soil} opacity={0.92} />
      <GreekBasket x={404} y={1090} s={1.02} f={f} phase={1} />
      <GreekAmphora x={238} y={1052} s={1.14} f={f} phase={0} />
      <GreekAmphora x={1690} y={1092} s={1.0} f={f} phase={3}
        fill={C.terraDark} dark="#5E2F1F" />
      {/* 割れた壺のかけら (踏まれて散っている) */}
      <g fill={C.terracotta} stroke={KRP.ink} strokeWidth={4} opacity={0.85}>
        <path d="M 540 1066 Q 572 1042 606 1060 Q 580 1078 540 1066 Z" />
        <path d="M 648 1092 Q 670 1074 696 1088 Q 676 1100 648 1092 Z" />
      </g>
      <TagPlate x={340} y={190} text="夜の うらどおり" size={46} t={seg(f, 26, 38)}
        fill={KRP.white} />
    </Frame>
  );
};

// #9 用: 丘の上の勝者1人と、ふもとで見上げる群衆
// どこ: 青空と山なみの野外。緑の丘の頂に金の勝者、ふもとに灰色の群衆12人
// 演出: 丘=舞台。金の人型が頂で光り、PersonMini の群衆が腕を上げて歓声
// 動き: 金がpop / 群衆が順に現れ腕を振る / 「勝者 1」「のこり全員」の札が出る
// ※ もと phase 2 (#10) の分岐はここから外した。#10 は三分割の奉納壁 (S10) に作り直し
const RankChart: React.FC<{ f: number; phase: 1 }> = ({ f }) => (
  <g>
    {/* 空の帯 */}
    <rect x={-20} y={-20} width={W + 40} height={540} fill={C.aegean} opacity={0.2} />
    {/* 遠景の山 */}
    <polygon points="-20,520 230,380 500,520" fill={C.aegean} opacity={0.25} />
    <polygon points="1450,520 1700,360 1940,520" fill={C.aegean} opacity={0.25} />
    {/* 勝者の立つ丘 */}
    <path d={`M 240 1100 C 700 260 1220 260 1680 1100 Z`} fill={C.laurel} opacity={0.38} />
    <path d={`M 420 1100 C 840 350 1080 350 1500 1100 Z`} fill={C.laurel} opacity={0.3} />
    {/* 地面 */}
    <rect x={-20} y={800} width={W + 40} height={300} fill={C.soil} opacity={0.32} />
    <line x1={-20} y1={800} x2={W + 20} y2={800} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {/* 勝者 (金・大) */}
    <circle cx={960} cy={240} r={210} fill={KRP.yellow} opacity={0.18 + Math.sin(f / 8) * 0.05} />
    <HumanIcon x={960} y={470} s={2.5} color={C.gold} crown t={seg(f, 2, 12)} f={f} />
    {/* ふもとの群衆 (12人・腕を上げて歓声) */}
    {Array.from({ length: 12 }, (_, i) => (
      <g key={i} opacity={clamp01(seg(f, 8 + i * 1.6, 14 + i * 1.6))}>
        <PersonMini x={210 + i * 137} y={790} s={0.92} color={KRP.gray} f={f} phase={i}
          face="dot" arms="up" />
      </g>
    ))}
    <TagPlate x={470} y={250} text="勝者 1" size={60} t={seg(f, 14, 26)} color={KRP.red} />
    <TagPlate x={1480} y={420} text="のこり全員" size={52} t={seg(f, 26, 40)} />
  </g>
);

// #9 勝者がひとり。あとは全員、ただの敗者。
const S9: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={908}>
    <RankChart f={f} phase={1} />
  </Frame>
);

// ── #10 「無かった三つ」用の部品 ──────────────────────────────────
// 画面を割る墨の縦線。筆で引いたようにふらつき、上から下へ引かれる
const SumiDivider: React.FC<{
  x: number; y0: number; y1: number; t?: number; seed?: number;
}> = ({ x, y0, y1, t = 1, seed = 1 }) => {
  const d = clamp01(t);
  if (d <= 0) return null;
  const n = 12;
  const len = (y1 - y0) * 1.1;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const off = (rnd(seed * 31 + i) - 0.5) * 12 + Math.sin(u * 6.1 + seed) * 4;
    return `${(x + off).toFixed(1)} ${(y0 + (y1 - y0) * u).toFixed(1)}`;
  });
  return (
    <g>
      {/* にじみ (太く薄く) */}
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={KRP.ink} strokeWidth={16}
        strokeLinecap="round" opacity={0.16}
        strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={KRP.ink} strokeWidth={7}
        strokeLinecap="round" opacity={0.82}
        strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
    </g>
  );
};

// 神殿の奉納壁にうがったアーチのくぼみ (奉納品を置く棚)。
// 奥が暗く、左上から影が回り込み、下に石の棚板がつく。
// cx=中心 / top=アーチの頂 / bottom=棚の上面 (ここが置き物の接地) / hw=半幅
const IchiNiche: React.FC<{
  cx: number; top: number; bottom: number; hw: number; seed?: number;
}> = ({ cx, top, bottom, hw, seed = 1 }) => {
  const arc = hw * 0.62;
  const shell = `M ${cx - hw} ${bottom} L ${cx - hw} ${top + arc}
    Q ${cx - hw} ${top} ${cx} ${top} Q ${cx + hw} ${top} ${cx + hw} ${top + arc}
    L ${cx + hw} ${bottom} Z`;
  return (
    <g>
      {/* くぼみの奥 */}
      <path d={shell} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 左上から回り込む影 */}
      <path d={`M ${cx - hw} ${bottom} L ${cx - hw} ${top + arc}
        Q ${cx - hw} ${top} ${cx} ${top} L ${cx} ${top + 32}
        Q ${cx - hw + 34} ${top + 36} ${cx - hw + 34} ${top + arc + 26}
        L ${cx - hw + 34} ${bottom} Z`} fill={KRP.ink} opacity={0.16} />
      {/* 奥の石の目地 */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.2}>
        {[0.36, 0.6, 0.84].map((u, i) => {
          const yy = top + (bottom - top) * u + rnd(seed * 13 + i) * 7;
          return <line key={i} x1={cx - hw + 12} y1={yy} x2={cx + hw - 12} y2={yy} />;
        })}
      </g>
      {/* 石の棚板 (前に出ている) */}
      <rect x={cx - hw - 22} y={bottom} width={hw * 2 + 44} height={26} rx={4}
        fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
      <rect x={cx - hw - 13} y={bottom + 26} width={hw * 2 + 26} height={15}
        fill={C.marbleDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// 石の表彰台 (段の高さと刻字を prop で変える)。y は接地。正面に数字を刻む
const StonePedestal: React.FC<{
  x: number; y: number; w?: number; h?: number; label?: string; t?: number;
}> = ({ x, y, w = 190, h = 150, label, t = 1 }) => {
  const d = clamp01(pop(t));
  if (d <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${d})`}>
      <ellipse cx={8} cy={6} rx={w * 0.62} ry={13} fill={KRP.ink} opacity={0.22} />
      {/* 胴 */}
      <rect x={-w / 2} y={-h} width={w} height={h} fill={C.marble}
        stroke={KRP.ink} strokeWidth={7} />
      {/* 石の目地 (上の帯だけ。下は刻字の場所) */}
      <g stroke={C.marbleDark} strokeWidth={4} opacity={0.7}>
        <line x1={-w / 2} y1={-h * 0.66} x2={w / 2} y2={-h * 0.66} />
        <line x1={-w * 0.16} y1={-h * 0.66} x2={-w * 0.16} y2={-h} />
      </g>
      {/* 天板 */}
      <rect x={-w / 2 - 18} y={-h - 26} width={w + 36} height={28} rx={4}
        fill={C.marbleDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 正面の刻字 (数字だけ) */}
      {label && (
        <text x={0} y={-h * 0.14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={h * 0.56} fill={C.terraDark} opacity={0.88}>{label}</text>
      )}
    </g>
  );
};

// 奉納の銘板 (ピナクス)。壁の釘からタイニア (布のひも) で下げる。
// 面には名を書く罫だけがあって空っぽ = 「載る名が無い」。y は釘の位置
const PinaxPlaque: React.FC<{
  x: number; y: number; w?: number; h?: number; t?: number; f?: number;
}> = ({ x, y, w = 250, h = 286, t = 1, f = 0 }) => {
  const d = clamp01(pop(t));
  if (d <= 0) return null;
  const sway = Math.sin(f / 15) * 1.8;
  const top = 86;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 壁に打った釘 */}
      <circle cx={0} cy={0} r={10} fill={C.marbleDark} stroke={KRP.ink} strokeWidth={4.5} />
      <g transform={`rotate(${sway}) scale(${d})`}>
        {/* つり紐 (タイニア) */}
        <path d={`M 0 5 Q ${-w * 0.2} ${top * 0.62} ${-w * 0.34} ${top}`} fill="none"
          stroke={C.terracotta} strokeWidth={7} strokeLinecap="round" />
        <path d={`M 0 5 Q ${w * 0.2} ${top * 0.62} ${w * 0.34} ${top}`} fill="none"
          stroke={C.terracotta} strokeWidth={7} strokeLinecap="round" />
        {/* 板 */}
        <rect x={-w / 2} y={top} width={w} height={h} rx={6}
          fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-w / 2 + 14} y={top + 14} width={w - 28} height={h - 28} rx={4}
          fill="none" stroke={C.marbleDark} strokeWidth={4} opacity={0.8} />
        {/* 上に月桂の小枝 (飾り) */}
        <LaurelCrown x={0} y={top + 78} s={0.62} />
        {/* 名を書く罫 (ぜんぶ空欄) */}
        <g stroke={C.marbleDark} strokeWidth={4} opacity={0.75}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-w / 2 + 30} y1={top + 130 + i * 38}
              x2={w / 2 - 30} y2={top + 130 + i * 38} />
          ))}
        </g>
      </g>
    </g>
  );
};

// 墨の塗りつぶし。t で中心から広がり、ふちがでこぼこ、粒が飛んで下にしたたる
const SumiBlot: React.FC<{
  cx: number; cy: number; rx: number; ry: number; t: number; seed?: number; f?: number;
}> = ({ cx, cy, rx, ry, t, seed = 1, f = 0 }) => {
  const d = clamp01(t);
  if (d <= 0) return null;
  const n = 20;
  const breathe = 1 + Math.sin(f / 11) * 0.012;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = (0.76 + rnd(seed * 17 + i) * 0.4) * d * breathe;
    return `${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`;
  });
  const late = clamp01((d - 0.62) / 0.3);
  return (
    <g>
      <path d={`M ${pts.join(" L ")} Z`} fill={KRP.ink} opacity={0.92} />
      {/* はねた墨の粒 */}
      {late > 0 && Array.from({ length: 6 }, (_, i) => (
        <circle key={i}
          cx={cx + (rnd(seed * 29 + i) - 0.5) * rx * 2.3}
          cy={cy + (rnd(seed * 43 + i) - 0.5) * ry * 2.0}
          r={(4 + rnd(seed * 53 + i) * 9) * late}
          fill={KRP.ink} opacity={0.78} />
      ))}
      {/* したたり */}
      {late > 0 && [0.28, 0.7].map((u, i) => (
        <line key={i}
          x1={cx + (u - 0.5) * rx * 1.1} y1={cy + ry * 0.74}
          x2={cx + (u - 0.5) * rx * 1.1} y2={cy + ry * 0.74 + (34 + i * 22) * late}
          stroke={KRP.ink} strokeWidth={11 - i * 3} strokeLinecap="round" opacity={0.85} />
      ))}
    </g>
  );
};

// #10 2位も、3位も、入賞もありませんでした。
// どこ: 神殿の宝物庫。奉納壁に三つのアーチのくぼみが並び、墨の縦線で三分割
// 演出: 左=2位の台座 / 中=3位の台座 / 右=入賞の銘板。どれも中身は空 (破線の人型・空欄の罫)
//       それを左→中→右の順に墨で塗りつぶし、札に取り消し線、×を打って「無かった」ことにする
// 動き: 墨線が上から引かれる → 三つが順に出る → 順に墨で潰れる / 見に来た2人がうなだれる
const S10: React.FC<{ f: number }> = ({ f }) => {
  // くぼみの位置 (左/中/右)。棚の上面 714 = 置き物の接地
  const NICHE = [330, 960, 1590];
  const TOP = 250, BOT = 714, HW = 240;
  // 出る時刻と、墨で潰れる時刻 (左→中→右)
  const APPEAR = [2, 13, 24];
  const ERASE = [26, 50, 72];
  const TAGS = ["2位の台座", "3位の台座", "入賞の銘板"];
  // ゆっくり寄るカメラ
  const cam = 1 + 0.035 * easeOut(clamp01(f / 100));
  return (
    <Frame f={f} seed={909}>
      <g transform={`translate(${960 - 960 * cam} ${500 - 500 * cam}) scale(${cam})`}>
        {/* ── 世界: 神殿の奉納壁 ── */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.marble} />
        {/* 上の帯 (雷文のフリーズ) */}
        <rect x={-20} y={34} width={W + 40} height={86} fill={C.marbleDark}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.45}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${-10 + i * 122} 104 l 0 -50 l 54 0 l 0 32 l -28 0`} />
          ))}
        </g>
        {/* 壁の石の目地 */}
        <g stroke={C.marbleDark} strokeWidth={4} opacity={0.5}>
          {[216, 404, 592, 770].map((yy, i) => (
            <line key={i} x1={-20} y1={yy} x2={W + 20} y2={yy} />
          ))}
          {Array.from({ length: 9 }, (_, i) => {
            const bx = 90 + i * 210 + rnd(i * 7) * 24;
            return <line key={`v${i}`} x1={bx} y1={216} x2={bx} y2={770} opacity={0.5} />;
          })}
        </g>
        {/* 左上からさす光 */}
        <polygon points="-20,34 420,34 180,800 -20,800" fill={KRP.white} opacity={0.18} />
        {/* 床 (奥から手前へ) */}
        <rect x={-20} y={800} width={W + 40} height={H - 760} fill={C.soil} opacity={0.3} />
        <line x1={-20} y1={800} x2={W + 20} y2={800} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.18}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={300 + i * 440} y1={800} x2={120 + i * 560} y2={H} />
          ))}
        </g>

        {/* ── 三分割の墨線 (上から引かれる) ── */}
        <SumiDivider x={640} y0={126} y1={H} t={seg(f, 0, 14)} seed={5} />
        <SumiDivider x={1280} y0={126} y1={H} t={seg(f, 4, 18)} seed={11} />

        {/* ── 三つのくぼみ ── */}
        {NICHE.map((cx, i) => (
          <IchiNiche key={i} cx={cx} top={TOP} bottom={BOT} hw={HW} seed={i * 3 + 2} />
        ))}

        {/* ── 中身 ── */}
        {/* 左: 2位の台座 (中くらいに高い) + いるはずの人 (破線) */}
        <StonePedestal x={NICHE[0]} y={BOT} w={196} h={152} label="2"
          t={seg(f, APPEAR[0], APPEAR[0] + 9)} />
        <HumanIcon x={NICHE[0]} y={BOT - 178} s={0.94} ghost f={f} phase={0}
          t={seg(f, APPEAR[0] + 4, APPEAR[0] + 13)} />
        {/* 中: 3位の台座 (一段低い) + いるはずの人 (破線) */}
        <StonePedestal x={NICHE[1]} y={BOT} w={196} h={108} label="3"
          t={seg(f, APPEAR[1], APPEAR[1] + 9)} />
        <HumanIcon x={NICHE[1]} y={BOT - 134} s={0.94} ghost f={f} phase={3}
          t={seg(f, APPEAR[1] + 4, APPEAR[1] + 13)} />
        {/* 右: 入賞の銘板 (名を書く罫が空欄) + 棚の上の壺と籠 */}
        <GreekBasket x={1408} y={BOT} s={0.5} f={f} phase={1} opacity={0.95} />
        <GreekAmphora x={1776} y={BOT} s={0.56} f={f} phase={2} opacity={0.95} />
        <PinaxPlaque x={NICHE[2]} y={316} w={252} h={282} f={f}
          t={seg(f, APPEAR[2], APPEAR[2] + 9)} />

        {/* ── 見に来た2人 (くぼみの間に立つ。空っぽを見てうなだれる) ── */}
        <GreekPerson x={648} y={828} s={0.6} pose="mourn" flip
          cloth={C.marble} clothDark={C.marbleDark} himation={C.aegean}
          skin={C.mist} beard f={f} phase={1} t={seg(f, 8, 20)} />
        <GreekPerson x={1288} y={828} s={0.6} pose="cover"
          cloth={C.mist} clothDark={C.marbleDark} himation={C.terracotta}
          skin={C.mist} f={f} phase={4} t={seg(f, 14, 26)} />

        {/* ── 無かったことにする墨 (左→中→右) ── */}
        {NICHE.map((cx, i) => {
          const blot = seg(f, ERASE[i], ERASE[i] + 14);
          return (
            <g key={i}>
              <SumiBlot cx={cx} cy={(TOP + BOT) / 2} rx={232} ry={226}
                t={blot} seed={i * 9 + 3} f={f} />
              <XMark x={cx} y={(TOP + BOT) / 2} s={1.7}
                t={seg(f, ERASE[i] + 8, ERASE[i] + 18)} color={KRP.white} />
            </g>
          );
        })}

        {/* ── 札 (何の棚かを示す。墨が乗ったら取り消し線が走る) ── */}
        {NICHE.map((cx, i) => {
          const strike = seg(f, ERASE[i] + 4, ERASE[i] + 16);
          const tw = TAGS[i].length * 48 + 40;
          return (
            <g key={i}>
              <TagPlate x={cx} y={186} text={TAGS[i]} size={48}
                t={seg(f, APPEAR[i], APPEAR[i] + 8)} />
              {strike > 0 && (
                <line x1={cx - tw / 2 - 8} y1={192}
                  x2={cx - tw / 2 - 8 + (tw + 16) * strike} y2={180}
                  stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" opacity={0.9} />
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// #11 ところで、ちょっと想像してみてください。
// どこ: 場面転換。夕空と地平線の荒野に人1人と大きな想像の雲
// 演出: 腕組み (pose="armsFolded") して目を閉じる人。雲の中に稲穂と高床倉庫の影
// 動き: 雲がもくもく育つ / 雲の中身がじわっと浮かぶ / 小さな泡が f で揺れる
const S11: React.FC<{ f: number }> = ({ f }) => {
  const grow = pop(seg(f, 4, 20));
  const inner = seg(f, 22, 40) * 0.42;
  const px = 640, py = 936, ps = 1.3;
  return (
    <Frame f={f} seed={910}>
      {/* 夕空のグラデ (上半分。上ほど濃い3段) */}
      <rect x={-20} y={-20} width={W + 40} height={240} fill={C.dusk} opacity={0.4} />
      <rect x={-20} y={220} width={W + 40} height={190} fill={C.dusk} opacity={0.26} />
      <rect x={-20} y={410} width={W + 40} height={160} fill={C.dusk} opacity={0.13} />
      {/* 沈む夕日 (左の地平線ぎわ) */}
      <circle cx={190} cy={930} r={74} fill={C.dusk} opacity={0.75} />
      <circle cx={190} cy={930} r={120} fill={C.dusk} opacity={0.25 + Math.sin(f / 11) * 0.05} />
      {/* 一番星たち (左の空) */}
      <g fill={C.riceGold} opacity={0.9}>
        <g transform={`translate(150 120) scale(${0.8 + Math.sin(f / 8) * 0.2})`}
          stroke={C.riceGold} strokeWidth={5} strokeLinecap="round">
          <line x1={-13} y1={0} x2={13} y2={0} />
          <line x1={0} y1={-13} x2={0} y2={13} />
        </g>
        <circle cx={520} cy={90} r={4.5 + Math.sin(f / 7 + 2) * 1.5} />
        <circle cx={680} cy={160} r={3.5 + Math.sin(f / 9 + 4) * 1.2} />
      </g>
      {/* 帰る鳥 (遠く) */}
      <path d={`M 560 ${300 + Math.sin(f / 8 + 1) * 5} q 13 -11 26 0 q 13 -11 26 0`}
        fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
      {/* 地平線と遠くの丘 */}
      <path d="M -20 930 Q 260 846 540 930 Z" fill={C.soil} opacity={0.3} />
      <path d="M 340 930 Q 700 856 1060 930 Z" fill={C.soil} opacity={0.22} />
      <path d="M 1480 930 Q 1740 866 1940 920 L 1940 930 Z" fill={C.soil} opacity={0.26} />
      {/* 丘の上の木立 (シルエット) */}
      <g fill={C.riceDark} opacity={0.4}>
        {([[200, 886, 1], [300, 898, 0.8], [980, 896, 0.9], [1700, 896, 0.85]] as const).map(([tx, ty, ts], i) => (
          <g key={i} transform={`translate(${tx} ${ty}) scale(${ts})`}>
            <rect x={-5} y={-26} width={10} height={26} />
            <circle cx={0} cy={-44} r={24} />
          </g>
        ))}
      </g>
      <rect x={-20} y={930} width={W + 40} height={170} fill={C.soil} opacity={0.18} />
      <line x1={-20} y1={930} x2={W + 20} y2={930} stroke={KRP.ink} strokeWidth={4} opacity={0.28} />
      {/* 床の影 */}
      <ellipse cx={px} cy={py + 8} rx={230} ry={30} fill={C.marbleDark} opacity={0.25} />
      {/* 考える人 (腕組み・ゆれ停止→目とじを上から描く) */}
      <Person x={px} y={py} s={ps} cloth={C.aegean} clothDark="#35596E" still f={0} pose="armsFolded" />
      {/* 目を閉じる (上書き) */}
      <g>
        <ellipse cx={px - 24 * ps} cy={py - 222 * ps} rx={16 * ps} ry={21 * ps} fill={KRP.white} />
        <ellipse cx={px + 24 * ps} cy={py - 222 * ps} rx={16 * ps} ry={21 * ps} fill={KRP.white} />
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
          <path d={`M ${px - 42 * ps} ${py - 222 * ps} Q ${px - 24 * ps} ${py - 210 * ps} ${px - 8 * ps} ${py - 222 * ps}`} fill="none" />
          <path d={`M ${px + 8 * ps} ${py - 222 * ps} Q ${px + 24 * ps} ${py - 210 * ps} ${px + 42 * ps} ${py - 222 * ps}`} fill="none" />
        </g>
      </g>
      {/* 想像の泡 (頭→雲へ) */}
      <circle cx={px + 150} cy={py - 470} r={16 + Math.sin(f / 9) * 2} fill={C.cloud} stroke={KRP.ink} strokeWidth={4} opacity={grow} />
      <circle cx={px + 230} cy={py - 560} r={26 + Math.sin(f / 8) * 3} fill={C.cloud} stroke={KRP.ink} strokeWidth={4.5} opacity={grow} />
      {/* 大きな想像の雲 (もくもく) */}
      <g transform={`translate(1230 ${330 + Math.sin(f / 12) * 8}) scale(${grow})`}>
        <g fill={C.cloud} stroke={KRP.ink} strokeWidth={6}>
          <ellipse cx={0} cy={40} rx={430} ry={160} />
          <circle cx={-310} cy={-20} r={120} />
          <circle cx={-130} cy={-110} r={150} />
          <circle cx={90} cy={-130} r={160} />
          <circle cx={300} cy={-50} r={130} />
        </g>
        {/* 継ぎ目消し */}
        <ellipse cx={0} cy={0} rx={380} ry={150} fill={C.cloud} />
        {/* 雲の中: 薄い稲穂と高床倉庫 */}
        <g opacity={inner}>
          {/* 想像の中の地面とあぜ道 */}
          <line x1={-330} y1={112} x2={310} y2={112} stroke={C.soil} strokeWidth={7}
            strokeLinecap="round" opacity={0.7} />
          <path d="M -330 86 q 90 -10 200 -4" fill="none" stroke={C.soil} strokeWidth={4}
            strokeLinecap="round" opacity={0.5} />
          {/* 想像の空を飛ぶ鳥 */}
          <g fill="none" stroke={C.soil} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
            <path d="M -250 -70 q 10 -9 20 0 q 10 -9 20 0" />
            <path d="M -170 -110 q 8 -7 16 0 q 8 -7 16 0" />
          </g>
          <TakayukaKura x={120} y={110} s={0.8} silhouette />
          {[-290, -220, -150, -80].map((ix, i) => (
            <g key={i} transform={`translate(${ix} 110)`}>
              <path d={`M 0 0 Q ${8 + i * 2} -70 ${26 + i * 4} -96`} fill="none"
                stroke={C.riceDark} strokeWidth={7} strokeLinecap="round" />
              {[0.6, 0.8, 1].map((k, j) => (
                <ellipse key={j} cx={(26 + i * 4) * k} cy={-96 * k} rx={10} ry={6}
                  fill={C.riceGold} />
              ))}
            </g>
          ))}
        </g>
      </g>
      <TagPlate x={330} y={250} text="もしも の話" size={50} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// #12 弥生時代の村に、稲作がいちばんうまい人がいたとします。
// どこ: 弥生の村の全景。稲田・高床倉庫・竪穴住居・遠くの山なみ
// 演出: 事件=名人が稲束をドンと高く掲げ、村人3人が喜ぶ
// 動き: 稲束が pop で掲がる / 衝撃線 / 村人が腕を振る / 稲がそよぐ
const S12: React.FC<{ f: number }> = ({ f }) => {
  const lift = easeOut(seg(f, 8, 20));
  const sway = Math.sin(f / 10) * 4;
  return (
    <Frame f={f} seed={911} bg={KRP.cream}>
      {/* 暖色の空 */}
      <rect x={-20} y={-20} width={W + 40} height={430} fill={KRP.yellow} opacity={0.22} />
      {/* 太陽と渡り鳥 (v2: 空気を1つ足す) */}
      <circle cx={1740} cy={120} r={66} fill={KRP.yellow} opacity={0.55} />
      <g stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6}>
        <path d={`M 1180 ${120 + Math.sin(f / 7) * 6} q 14 -12 28 0 q 14 -12 28 0`} />
        <path d={`M 1300 ${170 + Math.sin((f + 8) / 7) * 6} q 12 -10 24 0 q 12 -10 24 0`} />
        <path d={`M 1110 ${196 + Math.sin((f + 4) / 7) * 6} q 10 -9 20 0 q 10 -9 20 0`} />
      </g>
      {/* 遠景の山なみ */}
      <polygon points="-20,430 330,210 700,430" fill={C.laurel} opacity={0.5} />
      <polygon points="480,430 900,160 1360,430" fill={C.laurel} opacity={0.65} />
      <polygon points="1200,430 1600,240 1940,430" fill={C.laurel} opacity={0.5} />
      {/* 土の地面 */}
      <rect x={-20} y={430} width={W + 40} height={670} fill={C.soil} opacity={0.5} />
      {/* あぜ道 */}
      <polygon points="880,430 1040,430 1280,1100 640,1100" fill={KRP.cream} opacity={0.65} />
      {/* 稲田 (そよぐ稲の列) */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {Array.from({ length: 11 }, (_, i) => {
            const rx = 60 + i * 180 + row * 55;
            const ry = 530 + row * 130;
            if (rx > 820 - row * 40 && rx < 1120 + row * 60) return null; // あぜ道を避ける
            return (
              <g key={i} transform={`translate(${rx} ${ry})`}>
                {[-16, 0, 16].map((bx, j) => (
                  <g key={j}>
                    <path d={`M 0 0 Q ${bx * 0.6 + sway} -42 ${bx * 1.5 + sway * 1.6} -76`}
                      fill="none" stroke={C.riceDark} strokeWidth={4} strokeLinecap="round" />
                    {[0.78, 0.9, 1].map((k, m) => (
                      <ellipse key={m} cx={bx * 1.5 * k + sway * 1.6 * k} cy={-76 * k} rx={7} ry={4.5}
                        fill={C.riceGold} stroke={C.riceDark} strokeWidth={1.5}
                        transform={`rotate(${bx * 1.5} ${bx * 1.5 * k} ${-76 * k})`} />
                    ))}
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      ))}
      {/* 高床式倉庫と竪穴住居2つ */}
      <TakayukaKura x={1560} y={470} s={1.0} />
      {[[270, 470, 0.9], [520, 452, 0.72]].map(([hx, hy, hs], i) => (
        <g key={i} transform={`translate(${hx} ${hy}) scale(${hs})`}>
          <polygon points="-150,0 0,-190 150,0" fill={C.terraDark} stroke={KRP.ink} strokeWidth={6} />
          <polygon points="-24,0 0,-44 24,0" fill={KRP.ink} opacity={0.8} />
          <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5}>
            <line x1={-100} y1={-62} x2={100} y2={-62} />
            <line x1={-56} y1={-118} x2={56} y2={-118} />
          </g>
        </g>
      ))}
      {/* 名人 (中央・稲束を掲げる) */}
      <Person x={950} y={960} s={1.2} cloth={C.riceDark} clothDark="#7A5E22"
        face="smile" gaze={[0, -8]} f={f} phase={0} />
      {/* 掲げる腕 (肩から稲束の根元へ。上書き) */}
      <g stroke={C.riceDark} strokeWidth={26} strokeLinecap="round">
        <line x1={950 - 68} y1={960 - 180} x2={950 - 40} y2={600 + (1 - lift) * 110} />
        <line x1={950 + 68} y1={960 - 180} x2={950 + 40} y2={600 + (1 - lift) * 110} />
      </g>
      <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9}>
        <line x1={950 - 68} y1={960 - 180} x2={950 - 40} y2={600 + (1 - lift) * 110} />
        <line x1={950 + 68} y1={960 - 180} x2={950 + 40} y2={600 + (1 - lift) * 110} />
      </g>
      {/* 稲束 (頭上へドン) */}
      <IneBundle x={950} y={585 + (1 - lift) * 110} s={1.5} t={seg(f, 8, 20)} />
      <Bolt x={790} y={430} s={0.9} opacity={pop(seg(f, 18, 26)) * (1 - seg(f, 36, 42))} />
      <Bolt x={1120} y={400} s={0.75} opacity={pop(seg(f, 20, 28)) * (1 - seg(f, 36, 42))} />
      {/* 喜ぶ村人3人 */}
      <CheerPerson x={560} y={1030} s={0.85} cloth={C.terracotta} f={f} phase={1} />
      <CheerPerson x={1300} y={1040} s={0.9} cloth={C.soil} f={f} phase={2} />
      <CheerPerson x={1700} y={1020} s={0.8} cloth={C.terraDark} f={f} phase={3} />
      <TagPlate x={350} y={180} text="いなさく名人" size={50} t={seg(f, 26, 38)} color={KRP.red} />
    </Frame>
  );
};

// 「1位＝てっぺん」のひとかたまり (#13 の吹き出しの中身)。
// 一段だけ高い石の台 (正面に「1」) の上に王冠が浮き、光がさす。
// t1 = 台が出る / t2 = 王冠が出る / t3 = 光の線が出る。王冠は f でゆらゆら揺れる
const TopRankIcon: React.FC<{
  x: number; y: number; s?: number; f: number; t1: number; t2: number; t3: number;
}> = ({ x, y, s = 1, f, t1, t2, t3 }) => {
  const d1 = clamp01(pop(t1));
  const d2 = clamp01(pop(t2));
  const d3 = clamp01(t3);
  const tilt = Math.sin(f / 9) * 3.5;     // 宙ぶらりん (言うか言わないか)
  const lift = Math.sin(f / 11) * 5;
  if (d1 <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 王冠から横へさす光の線 (吹き出しの楕円からはみ出さない長さに収めてある) */}
      {d3 > 0 && (
        <g stroke={C.gold} strokeWidth={9} strokeLinecap="round" opacity={0.7 * d3}>
          {[-82, -58, 58, 82].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const r0 = 100, r1 = 100 + (20 + (i % 2) * 12) * d3;
            return (
              <line key={i}
                x1={Math.cos(r) * r0} y1={-250 + Math.sin(r) * r0}
                x2={Math.cos(r) * r1} y2={-250 + Math.sin(r) * r1} />
            );
          })}
        </g>
      )}
      {/* 一段だけ高い石の台 (縦に伸びる = てっぺん) */}
      <g transform={`scale(1 ${d1})`}>
        {/* 台の影 */}
        <ellipse cx={6} cy={6} rx={118} ry={16} fill={KRP.ink} opacity={0.2} />
        {/* 胴 */}
        <rect x={-96} y={-142} width={192} height={142} fill={C.marble}
          stroke={KRP.ink} strokeWidth={7} />
        {/* 石の目地 */}
        <g stroke={C.marbleDark} strokeWidth={4} opacity={0.65}>
          <line x1={-96} y1={-74} x2={96} y2={-74} />
          <line x1={-20} y1={-74} x2={-20} y2={0} />
        </g>
        {/* 天板 (ここが「てっぺん」) */}
        <rect x={-116} y={-168} width={232} height={30} rx={5} fill={C.marbleDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 正面の刻字「1」 */}
        <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={92} fill={C.terraDark} opacity={0.9}>1</text>
      </g>
      {/* 王冠 (天板の上に浮く) */}
      {d2 > 0 && (
        <g transform={`translate(0 ${-250 + lift}) rotate(${tilt}) scale(${d2})`}>
          {/* 冠の本体 (5つの山) */}
          <path d="M -104 44 L -104 -10 L -62 26 L -32 -42 L 0 22 L 32 -42 L 62 26 L 104 -10 L 104 44 Z"
            fill={C.gold} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          {/* 縁の二重線 */}
          <line x1={-104} y1={22} x2={104} y2={22} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          <rect x={-104} y={44} width={208} height={22} rx={8} fill={C.gold}
            stroke={KRP.ink} strokeWidth={6} />
          {/* 山の先の玉 */}
          {[[-32, -54], [0, 10], [32, -54]].map(([bx, by], i) => (
            <circle key={i} cx={bx} cy={by} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* はめ込んだ石 */}
          <ellipse cx={0} cy={44} rx={16} ry={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={-56} cy={46} rx={11} ry={9} fill={C.laurel} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={56} cy={46} rx={11} ry={9} fill={C.laurel} stroke={KRP.ink} strokeWidth={4} />
          {/* 金の照り返し */}
          <path d="M -86 -2 L -70 16" stroke={KRP.white} strokeWidth={5}
            strokeLinecap="round" opacity={0.75} />
        </g>
      )}
    </g>
  );
};

// #13 その人は「おれは世界一だ」と言ったでしょうか。
// どこ: 名人のアップ。背景は稲田と倉庫の2要素だけ
// 演出: 頭上の吹き出しの中身を「1位っぽい物」に差し替え (v3)。
//       字幕が「世界一」と言うので、札で同じ言葉を書かず、王冠+一段高い台の絵で見せる
// 動き: ①吹き出しが尻尾から ふくらむ → ②中の台が立ち上がり王冠がポンと乗る →
//       ③光がさす。王冠は f でゆらゆら (言うか言わないかの宙ぶらりん)。？は最後に出る
const S13: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 10) * 5;
  const blow = clamp01(pop(seg(f, 6, 18)));   // ①吹き出しがふくらむ
  return (
    <Frame f={f} seed={912} bg={KRP.cream}>
      {/* 背景0: 遠景の山なみと奥の稲 (v2: 奥行き強化) */}
      <polygon points="-20,700 260,540 640,700" fill={C.aegean} opacity={0.22} />
      <polygon points="420,700 900,500 1430,700" fill={C.aegean} opacity={0.18} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform={`translate(${40 + i * 205} 756) scale(0.55)`} opacity={0.65}>
          {[-16, 0, 16].map((bx, j) => (
            <path key={j} d={`M 0 0 Q ${bx * 0.6 + sway} -48 ${bx * 1.5 + sway * 1.6} -88`}
              fill="none" stroke={C.riceDark} strokeWidth={4.5} strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* 背景1: 稲田の帯 */}
      <rect x={-20} y={700} width={W + 40} height={400} fill={C.riceGold} opacity={0.35} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(${90 + i * 250} 850)`}>
          {[-20, 0, 20].map((bx, j) => (
            <g key={j}>
              <path d={`M 0 0 Q ${bx * 0.6 + sway} -48 ${bx * 1.5 + sway * 1.6} -88`}
                fill="none" stroke={C.riceDark} strokeWidth={4.5} strokeLinecap="round" />
              {[0.78, 0.9, 1].map((k, m) => (
                <ellipse key={m} cx={bx * 1.5 * k + sway * 1.6 * k} cy={-88 * k} rx={8} ry={5}
                  fill={C.riceGold} stroke={C.riceDark} strokeWidth={1.5}
                  transform={`rotate(${bx * 1.5} ${bx * 1.5 * k} ${-88 * k})`} />
              ))}
            </g>
          ))}
        </g>
      ))}
      {/* 背景2: 高床倉庫 (遠く) */}
      <TakayukaKura x={1650} y={700} s={0.85} opacity={0.85} />
      {/* 名人のアップ (稲束を胸に) */}
      <Person x={660} y={1070} s={1.9} cloth={C.riceDark} clothDark="#7A5E22"
        face="normal" gaze={[8, -6]} f={f} phase={0} />
      <IneBundle x={800} y={820} s={1.35} t={seg(f, 2, 10)} />
      {/* ① 吹き出し (尻尾の付け根からふくらむ) */}
      <g opacity={blow}>
        <circle cx={880} cy={610} r={18 * blow} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={960} cy={530} r={30 * blow} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`translate(1310 330) scale(${blow}) translate(-1310 -330)`}>
          <ellipse cx={1310} cy={330} rx={330} ry={200} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {/* 内側の薄い縁 (紙の二重線) */}
          <ellipse cx={1310} cy={330} rx={308} ry={180} fill="none"
            stroke={C.marbleDark} strokeWidth={3} opacity={0.5} />
        </g>
      </g>
      {/* ② 吹き出しの中身 = 1位 (一段高い台 + 王冠)。文字は台の刻字「1」だけ */}
      <TopRankIcon x={1296} y={452} s={0.84} f={f}
        t1={seg(f, 20, 30)} t2={seg(f, 27, 38)} t3={seg(f, 33, 42)} />
      {/* ③ 言ったのか? (吹き出しの外・右上の空にだけ逃がす。倉庫の屋根より上) */}
      <QMark x={1760} y={300} s={1.3} f={f} t={seg(f, 34, 42)} />
    </Frame>
  );
};

// #14 言わないですよね。隣の村のことすら、よく知らないのですから。
// どこ: 村はずれ。目の前に深い森と山、その向こうは霧
// 演出: 名人が立ち尽くす。山の向こうに霧がかかり、？が浮かぶ。札「となりの村」は霧の中に薄く
// 動き: 霧が f で横に流れる / QMarkが揺れる / 木々がかすかに揺れる
const S14: React.FC<{ f: number }> = ({ f }) => {
  const drift = Math.sin(f / 16) * 30;
  return (
    <Frame f={f} seed={913} bg={KRP.cream}>
      {/* 遠くの山 (霧の奥) */}
      <polygon points="900,560 1400,150 1940,560" fill={C.aegean} opacity={0.4} />
      <polygon points="1300,560 1680,260 1940,500" fill={C.aegean} opacity={0.3} />
      {/* 渡り鳥 (v2: 空気を1つ足す) */}
      <g stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55}>
        <path d={`M 330 ${150 + Math.sin(f / 8) * 7} q 15 -13 30 0 q 15 -13 30 0`} />
        <path d={`M 470 ${110 + Math.sin((f + 6) / 8) * 7} q 12 -11 24 0 q 12 -11 24 0`} />
        <path d={`M 250 ${210 + Math.sin((f + 12) / 8) * 7} q 11 -10 22 0 q 11 -10 22 0`} />
      </g>
      {/* 深い森 (手前の木々) */}
      {Array.from({ length: 7 }, (_, i) => {
        const tx = 820 + i * 170;
        const ts = 0.8 + rnd(i * 13 + 1) * 0.5;
        return (
          <g key={i} transform={`translate(${tx} ${700 + rnd(i * 7) * 60}) scale(${ts}) rotate(${Math.sin((f + i * 11) / 14) * 1.5})`}>
            <rect x={-14} y={-20} width={28} height={70} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <polygon points="-90,-20 0,-190 90,-20" fill={C.forest} stroke={KRP.ink} strokeWidth={5} />
            <polygon points="-70,-110 0,-250 70,-110" fill={C.forest} stroke={KRP.ink} strokeWidth={5} />
          </g>
        );
      })}
      {/* 霧 (山と森の上を流れる) */}
      <g fill={C.mist} opacity={0.75}>
        <ellipse cx={1380 + drift} cy={400} rx={480} ry={82} />
        <ellipse cx={1120 - drift} cy={330} rx={360} ry={62} />
        <ellipse cx={1640 + drift * 0.6} cy={300} rx={300} ry={56} />
      </g>
      {/* 霧の中の？と薄い札 */}
      <QMark x={1430} y={330} s={1.4} f={f} t={seg(f, 16, 28)} />
      <g opacity={0.5}>
        <TagPlate x={1400} y={470} text="となりの村" size={48} t={seg(f, 24, 36)} color={KRP.grayDark} />
      </g>
      {/* 村はずれの地面 */}
      <rect x={-20} y={760} width={W + 40} height={H - 740} fill={C.soil} opacity={0.5} />
      {/* 村境の杭 */}
      <g transform="translate(360 870)">
        <rect x={-12} y={-130} width={24} height={130} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="-12,-130 0,-156 12,-130" fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 名人 (遠くを見て立ち尽くす) */}
      <Person x={560} y={980} s={1.25} cloth={C.riceDark} clothDark="#7A5E22"
        face="worried" gaze={[10, -4]} f={f} phase={0} />
    </Frame>
  );
};

// #15 「何位か」に意味が生まれるには、同じ土俵の仲間と、同じ物差しと、記録する誰かが要るのです。
// どこ: 図。この動画全体で使い回す「土俵マップ」の初出
// 演出: 大きな土俵の輪。縁に3つの持ち物 (仲間・物差し・記録係) が順に灯る
// 動き: 輪が描かれる → 仲間の点々が集まる → 3つの持ち物が順に pop して光る
// ★3つの持ち物が灯る時刻は appear prop。S15 では読み上げに合わせて 76/120/156 を渡す
//   (このシーンだけは f=42 までに全部出そろわない。土台だけが f=42 までに完成する)
// appear = 3つの持ち物が出るフレーム [仲間, 物差し, 記録係]。
// 既定は従来どおりの早出し (他の文で使い回すときの見た目を変えないため)。
// S15 はナレーションに合わせた遅い値を明示で渡している。
const DohyoMap: React.FC<{
  f: number; cx?: number; cy?: number; r?: number;
  appear?: [number, number, number];
}> = ({
  f, cx = 830, cy = 540, r = 330, appear = [8, 20, 30],
}) => {
  const ringT = easeOut(seg(f, 2, 14));
  const CIRC = 2 * Math.PI * (r + 14);
  // 持ち物: [角度(度), 出る時刻]
  const items: Array<[number, number]> = [
    [-90, appear[0]], [-5, appear[1]], [160, appear[2]],
  ];
  const ipos = items.map(([deg]) => [
    cx + Math.cos((deg * Math.PI) / 180) * (r + 10),
    cy + Math.sin((deg * Math.PI) / 180) * (r + 10),
  ]);
  return (
    <g>
      {/* 土俵の輪 (二重縁・描かれていく) */}
      <circle cx={cx} cy={cy} r={r} fill={C.dohyo} opacity={0.4 * ringT} />
      <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke={KRP.ink} strokeWidth={10}
        strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - ringT)}
        transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r - 10} fill="none" stroke={KRP.white} strokeWidth={6} opacity={ringT * 0.9} />
      {/* 輪の中の仲間 (点々と集まる) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.4;
        const rr = r * (0.28 + rnd(i * 17 + 3) * 0.5);
        return (
          <HumanIcon key={i} x={cx + Math.cos(a) * rr} y={cy + Math.sin(a) * rr * 0.9 + 50}
            s={0.52} color={C.soil} t={seg(f, 10 + i * 2, 16 + i * 2)} f={f} phase={i} />
        );
      })}
      {/* ① 仲間 (上) */}
      <g>
        <circle cx={ipos[0][0]} cy={ipos[0][1]} r={74} fill={KRP.yellow}
          opacity={pop(seg(f, items[0][1], items[0][1] + 8)) * (0.5 + Math.sin(f / 7) * 0.12)} />
        <circle cx={ipos[0][0]} cy={ipos[0][1]} r={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
          opacity={clamp01(pop(seg(f, items[0][1], items[0][1] + 8)))} />
        <HumanIcon x={ipos[0][0] - 16} y={ipos[0][1] + 38} s={0.42} color={C.terracotta}
          t={seg(f, items[0][1] + 2, items[0][1] + 9)} f={f} />
        <HumanIcon x={ipos[0][0] + 20} y={ipos[0][1] + 38} s={0.42} color={C.aegean}
          t={seg(f, items[0][1] + 3, items[0][1] + 10)} f={f} phase={2} />
        {/* ★作者修正 (2026-11-07): 札「同じ土俵の仲間」は字幕とまったく同文なので消した。
            読み上げと同時に絵が出るようになったぶん、重複が目立つため (①②③すべて同じ理由)。 */}
      </g>
      {/* ② 物差し (右) */}
      <g>
        <circle cx={ipos[1][0]} cy={ipos[1][1]} r={74} fill={KRP.yellow}
          opacity={pop(seg(f, items[1][1], items[1][1] + 8)) * (0.5 + Math.sin((f + 4) / 7) * 0.12)} />
        <circle cx={ipos[1][0]} cy={ipos[1][1]} r={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
          opacity={clamp01(pop(seg(f, items[1][1], items[1][1] + 8)))} />
        <g transform={`translate(${ipos[1][0]} ${ipos[1][1]}) rotate(-38) scale(${clamp01(pop(seg(f, items[1][1] + 2, items[1][1] + 10)))})`}>
          <rect x={-56} y={-16} width={112} height={32} rx={5} fill={C.riceGold} stroke={KRP.ink} strokeWidth={5} />
          {[-40, -24, -8, 8, 24, 40].map((mx, i) => (
            <line key={i} x1={mx} y1={-16} x2={mx} y2={i % 2 ? -2 : 4}
              stroke={KRP.ink} strokeWidth={3.5} />
          ))}
        </g>
        {/* 札「同じ物差し」も字幕と同文なので消した (上の①と同じ理由) */}
      </g>
      {/* ③ 記録する誰か (左下: 筆+巻物) */}
      <g>
        <circle cx={ipos[2][0]} cy={ipos[2][1]} r={74} fill={KRP.yellow}
          opacity={pop(seg(f, items[2][1], items[2][1] + 8)) * (0.5 + Math.sin((f + 8) / 7) * 0.12)} />
        <circle cx={ipos[2][0]} cy={ipos[2][1]} r={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
          opacity={clamp01(pop(seg(f, items[2][1], items[2][1] + 8)))} />
        <g transform={`translate(${ipos[2][0]} ${ipos[2][1]}) scale(${clamp01(pop(seg(f, items[2][1] + 2, items[2][1] + 10)))})`}>
          {/* 巻物 */}
          <rect x={-46} y={-18} width={92} height={44} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-46} cy={4} r={12} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={46} cy={4} r={12} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-26} y1={-2} x2={20} y2={-2} stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
          <line x1={-26} y1={12} x2={6} y2={12} stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
          {/* 筆 */}
          <g transform="rotate(-42 28 -22)">
            <rect x={22} y={-58} width={12} height={52} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={3.5} />
            <polygon points="22,-6 34,-6 28,12" fill={KRP.ink} />
          </g>
        </g>
        {/* 札「記録する誰か」も字幕と同文なので消した (上の①と同じ理由) */}
      </g>
    </g>
  );
};

// S15 v2: 机の上に広げた和紙の絵図として土俵マップを描く。文鎮と筆を添える
const S15: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={914}>
    <DeskBack />
    {/* 広げた和紙 (影→紙→内枠) */}
    <rect x={164} y={56} width={1650} height={940} rx={10} fill={KRP.ink} opacity={0.14} />
    <rect x={150} y={40} width={1650} height={940} rx={8} fill={C.washi}
      stroke={KRP.ink} strokeWidth={7} />
    <rect x={166} y={56} width={1618} height={908} rx={4} fill="none"
      stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
    {/* 紙の上の方眼 (紙にクリップ) */}
    <clipPath id="ib0s15paper"><rect x={158} y={48} width={1634} height={924} rx={6} /></clipPath>
    <g clipPath="url(#ib0s15paper)" opacity={0.8}><GridPaper tombo={false} /></g>
    {/* 文鎮 ×2 (紙の押さえ) */}
    {([[440, 86, -5], [1636, 90, 4]] as const).map(([bx, by, br], i) => (
      <g key={i} transform={`translate(${bx} ${by}) rotate(${br})`}>
        <rect x={-85} y={-17} width={170} height={34} rx={14} fill={KRP.grayDark}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={7} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
    {/* 筆 (紙のわき) */}
    <g transform="translate(350 938) rotate(-4)">
      <rect x={-110} y={-11} width={200} height={22} rx={10} fill={C.wood}
        stroke={KRP.ink} strokeWidth={4.5} />
      <polygon points="90,-10 150,0 90,12" fill={KRP.ink} />
      <rect x={82} y={-11} width={14} height={22} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
    </g>
    {/* ★この3つの持ち物はナレーションに合わせて f=76 / 120 / 156 で出る。
        「同じ土俵の仲間と、」= f≈76 / 「同じ物差しと、」= f≈120 /
        「記録する誰かが要るのです。」= f≈156 (このシーンは229フレームある)。
        検品プレビューは f=45 の1枚だけなので、3つがまだ出ていないのが正しい。
        プレビューで見えるのは土台 (机・和紙・方眼・文鎮・筆・土俵の輪・仲間の点々) まで。 */}
    <DohyoMap f={f} appear={[76, 120, 156]} />
    {/* 3つ出そろってから締めの札。これもプレビュー (f=45) では出ない */}
    <TagPlate x={1630} y={760} text="3つの持ち物" size={44} t={seg(f, 162, 174)} color={KRP.red} />
  </Frame>
);

// #16 つまり「順位」は、勝ちたい気持ちとは別の、人間が作った仕組みでした。
// どこ: 工房の作業台の上。左=炎の絵札 (気持ち)、右=歯車の装置+土俵の輪 (仕組み)、間に大きな≠
// 演出: 壁と道具棚をうっすら敷き、主役2つを「実物」として台の上に置く。≠がドンと入る
// 動き: 炎が f で揺らめく / 歯車が回り続ける / ≠が pop
const S16: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={915}>
    {/* 工房の壁 */}
    <rect x={-20} y={-20} width={W + 40} height={780} fill={C.museumWall} opacity={0.28} />
    {/* 壁の板目と柱 (うっすら) */}
    <g stroke={C.woodDark} strokeWidth={3} opacity={0.16}>
      {[140, 380, 620, 860, 1100, 1340, 1580, 1820].map((bx) => (
        <line key={bx} x1={bx} y1={-20} x2={bx} y2={716} />
      ))}
      <line x1={-20} y1={660} x2={W + 20} y2={660} strokeWidth={4} />
    </g>
    <rect x={944} y={-20} width={32} height={736} fill={C.woodDark} opacity={0.2} />
    {/* 壁の掛け道具 (中央上。のこぎりと縄の束) */}
    <g opacity={0.55}>
      <circle cx={760} cy={70} r={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      <g transform="translate(760 80) rotate(8)">
        <rect x={-14} y={0} width={28} height={54} rx={10} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -8 54 L -8 160 L 20 150 L 6 142 L 20 132 L 6 124 L 20 114 L 6 106 L 20 96 L 6 88 L 20 78 L 6 70 L 8 54 Z"
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      </g>
      <circle cx={1140} cy={70} r={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      <g fill="none" stroke={C.soil} strokeWidth={9}>
        <ellipse cx={1140} cy={130} rx={40} ry={56} />
        <ellipse cx={1140} cy={130} rx={26} ry={46} />
      </g>
      <path d="M 1134 180 L 1130 230 M 1148 182 L 1152 226" fill="none"
        stroke={C.soil} strokeWidth={6} strokeLinecap="round" />
    </g>
    {/* 道具棚 (左上・うっすら) */}
    <g opacity={0.6}>
      <rect x={40} y={140} width={520} height={16} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
      <rect x={80} y={92} width={56} height={48} rx={8} fill={C.terracotta} stroke={KRP.ink} strokeWidth={4} />
      <rect x={170} y={104} width={44} height={36} rx={7} fill={C.aegean} stroke={KRP.ink} strokeWidth={4} />
      {/* 巻物2本 (棚に横置き) */}
      <g fill={C.washi} stroke={KRP.ink} strokeWidth={3.5}>
        <rect x={228} y={112} width={74} height={20} rx={10} />
        <rect x={236} y={94} width={74} height={20} rx={10} />
        <circle cx={302} cy={122} r={10} fill={C.marbleDark} />
        <circle cx={310} cy={104} r={10} fill={C.marbleDark} />
      </g>
      <g transform="translate(330 60)">
        <line x1={0} y1={0} x2={0} y2={46} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-26} y={46} width={52} height={26} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <path d="M 450 60 L 436 130 M 450 60 L 466 130" stroke={KRP.ink} strokeWidth={5}
        fill="none" strokeLinecap="round" />
      {/* 小壺 (ふた付き) */}
      <g fill={C.terraDark} stroke={KRP.ink} strokeWidth={4}>
        <path d="M 500 140 Q 490 112 502 98 L 534 98 Q 546 112 536 140 Z" />
        <rect x={508} y={88} width={20} height={10} rx={4} />
      </g>
    </g>
    {/* 道具棚 (右上・うっすら。左と対) */}
    <g opacity={0.6}>
      <rect x={1360} y={140} width={520} height={16} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
      {/* 大壺 */}
      <path d="M 1414 140 Q 1398 100 1414 76 L 1462 76 Q 1478 100 1462 140 Z"
        fill={C.terracotta} stroke={KRP.ink} strokeWidth={4} />
      <line x1={1414} y1={92} x2={1462} y2={92} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      {/* 巻物 (立てかけ) */}
      <g fill={C.washi} stroke={KRP.ink} strokeWidth={3.5}>
        <rect x={1510} y={70} width={18} height={70} rx={9} transform="rotate(10 1519 105)" />
        <rect x={1544} y={64} width={18} height={76} rx={9} transform="rotate(-6 1553 102)" />
      </g>
      {/* 木づち */}
      <g transform="translate(1660 112) rotate(-34)">
        <rect x={-6} y={-6} width={12} height={64} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={-24} y={-30} width={48} height={26} rx={7} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 皿の重ね */}
      <g fill={C.marble} stroke={KRP.ink} strokeWidth={3.5}>
        <rect x={1760} y={128} width={92} height={12} rx={6} />
        <rect x={1768} y={116} width={76} height={12} rx={6} />
        <rect x={1776} y={104} width={60} height={12} rx={6} />
      </g>
    </g>
    {/* 作業台 */}
    <rect x={100} y={720} width={1720} height={54} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
    <line x1={100} y1={744} x2={1820} y2={744} stroke={C.woodDark} strokeWidth={4} opacity={0.7} />
    {[230, 960, 1690].map((lx, i) => (
      <rect key={i} x={lx - 26} y={768} width={52} height={272} fill={C.woodDark}
        stroke={KRP.ink} strokeWidth={5} />
    ))}
    <line x1={-20} y1={1040} x2={W + 20} y2={1040} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
    {/* 床: 脚もとの影とかんなくず */}
    {[230, 960, 1690].map((lx, i) => (
      <ellipse key={`sh${i}`} cx={lx} cy={1046} rx={88} ry={14} fill={KRP.ink} opacity={0.12} />
    ))}
    <g fill="none" stroke={C.wood} strokeWidth={5} strokeLinecap="round" opacity={0.75}>
      <path d="M 420 1000 q 14 -22 34 -10 q 16 10 2 24 q -12 10 -20 -2" />
      <path d="M 1240 1016 q 12 -20 30 -9 q 14 9 2 21 q -11 9 -18 -2" />
      <path d="M 560 1024 q 20 -10 40 -2" />
      <path d="M 1380 996 q 18 -8 36 0" />
    </g>
    <g fill={C.woodDark} opacity={0.5}>
      <ellipse cx={500} cy={1030} rx={9} ry={4} />
      <ellipse cx={1310} cy={1032} rx={8} ry={4} />
      <ellipse cx={660} cy={1004} rx={7} ry={3.5} />
    </g>
    {/* 左: 炎の絵札 (台の上に立てた札) */}
    <g opacity={clamp01(seg(f, 2, 10))}>
      <rect x={318} y={222} width={348} height={510} rx={14} fill={KRP.ink} opacity={0.14} />
      <rect x={306} y={210} width={348} height={510} rx={14} fill={KRP.cream}
        stroke={KRP.ink} strokeWidth={8} />
      <rect x={326} y={230} width={308} height={470} rx={8} fill="none"
        stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
    </g>
    <FlameIcon x={480} y={700} s={1.4} f={f} t={seg(f, 2, 12)} />
    <TagPlate x={480} y={766} text="きもち" size={46} t={seg(f, 12, 22)} color={KRP.red} />
    {/* 右: 歯車の装置 (台に立てた柱に据え付け) + 土俵の輪 */}
    <g opacity={clamp01(seg(f, 8, 18))}>
      <rect x={1408} y={400} width={44} height={320} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1352} y1={720} x2={1414} y2={610} stroke={C.wood} strokeWidth={12} strokeLinecap="round" />
      <line x1={1508} y1={720} x2={1446} y2={610} stroke={C.wood} strokeWidth={12} strokeLinecap="round" />
    </g>
    <ellipse cx={1430} cy={720} rx={150} ry={16} fill={KRP.ink} opacity={0.15} />
    <GearIcon x={1430} y={400} r={140} f={f} t={seg(f, 8, 18)} />
    <g opacity={clamp01(pop(seg(f, 12, 22)))}>
      <circle cx={1430} cy={590} r={120} fill={C.dohyo} opacity={0.45} />
      <circle cx={1430} cy={590} r={126} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <HumanIcon x={1398} y={632} s={0.5} color={C.soil} t={seg(f, 16, 24)} f={f} />
      <HumanIcon x={1452} y={638} s={0.5} color={C.terracotta} t={seg(f, 18, 26)} f={f} phase={3} />
    </g>
    <TagPlate x={1430} y={766} text="しくみ" size={46} t={seg(f, 22, 32)} />
    {/* 中央: ≠ */}
    <g transform={`translate(950 520) scale(${clamp01(pop(seg(f, 26, 38)))})`}>
      <circle r={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
      <text y={62} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={190} fill={KRP.red}>≠</text>
    </g>
  </Frame>
);

// #17 金銀銅のメダルが生まれたのは、たった120年前。
// どこ: 図。メダル3つがリボン付きで大きく並ぶ。下に短い年表帯
// 演出: 金銀銅が順に pop。縁の二重線・リボンの折り返し・ハイライトまで描く
// 動き: 順に pop / きらめきの星が f で回る / 年表帯の赤点が点滅
const IchiMedal: React.FC<{ x: number; y: number; color: string; dark: string; num: string; t?: number; f?: number }> = ({
  x, y, color, dark, num, t = 1, f = 0,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      {/* リボン (折り返しつき) */}
      <polygon points="-96,-320 -22,-128 42,-128 -32,-320" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      <polygon points="96,-320 22,-128 -42,-128 32,-320" fill={C.terraDark} stroke={KRP.ink} strokeWidth={5.5} />
      <polygon points="-40,-150 40,-150 24,-108 -24,-108" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      {/* メダル本体 (直径280・二重縁) */}
      <circle r={140} fill={color} stroke={KRP.ink} strokeWidth={8} />
      <circle r={112} fill="none" stroke={dark} strokeWidth={6} />
      <circle r={102} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.7} />
      {/* 刻みの番号 */}
      <text y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill={KRP.ink}
        opacity={0.85}>{num}</text>
      {/* ハイライト */}
      <path d="M -92 -70 Q -52 -112 10 -116" fill="none" stroke={KRP.white} strokeWidth={10}
        strokeLinecap="round" opacity={0.8} />
      {/* きらめき */}
      <g transform={`translate(78 -84) rotate(${f * 3}) scale(${0.7 + Math.sin(f / 6) * 0.3})`}
        stroke={KRP.white} strokeWidth={7} strokeLinecap="round">
        <line x1={-20} y1={0} x2={20} y2={0} />
        <line x1={0} y1={-20} x2={0} y2={20} />
      </g>
    </g>
  );
};

// S17 v2: 表彰式会場の壁面展示。緞帳と脇幕、下に小さな観客のシルエット
const S17: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={916}>
    {/* 会場の壁と床 */}
    <rect x={-20} y={-20} width={W + 40} height={890} fill={C.venueWall} opacity={0.35} />
    <rect x={-20} y={850} width={W + 40} height={250} fill={C.wood} opacity={0.3} />
    <line x1={-20} y1={850} x2={W + 20} y2={850} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
    {/* 左右の脇幕 */}
    {([[-20, 0], [1810, 1]] as const).map(([dx, i]) => (
      <g key={i}>
        <rect x={dx} y={-20} width={130} height={H + 40} fill={C.curtain}
          stroke={KRP.ink} strokeWidth={6} />
        {[26, 62, 98].map((ox, j) => (
          <path key={j} d={`M ${dx + ox} -10 Q ${dx + ox + (j % 2 ? 10 : -8)} 540 ${dx + ox} 1090`}
            fill="none" stroke={C.curtainDark} strokeWidth={5} opacity={0.7} />
        ))}
      </g>
    ))}
    <IchiMedal x={500} y={460} color={C.gold} dark={C.riceDark} num="1" t={seg(f, 2, 12)} f={f} />
    <IchiMedal x={960} y={500} color={C.silver} dark={KRP.grayDark} num="2" t={seg(f, 10, 20)} f={f + 7} />
    <IchiMedal x={1420} y={540} color={C.bronze} dark={C.terraDark} num="3" t={seg(f, 18, 28)} f={f + 13} />
    {/* 短い年表帯 */}
    <g opacity={clamp01(seg(f, 24, 34))}>
      <line x1={220} y1={800} x2={1760} y2={800} stroke={KRP.ink} strokeWidth={7} />
      {[220, 530, 840, 1150, 1460].map((tx, i) => (
        <line key={i} x1={tx} y1={788} x2={tx} y2={812} stroke={KRP.ink} strokeWidth={5} />
      ))}
      <circle cx={1660} cy={800} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={4}
        opacity={0.6 + Math.sin(f / 5) * 0.4} />
    </g>
    <TagPlate x={1600} y={720} text="120年前" size={52} t={seg(f, 30, 42)} color={KRP.red} />
    {/* 手前の観客シルエット (画面下端) */}
    {[260, 620, 980, 1340, 1700].map((ax, i) => (
      <PersonMini key={i} x={ax} y={1116} s={1.15} color={C.nightInk} f={f} phase={i}
        face="none" arms={i === 2 ? "up" : "down"} />
    ))}
    <CurtainTop f={f} />
  </Frame>
);

// #18 3段の表彰台にいたっては、96年前の発明です。
// どこ: 競技場。空+観客席+トラックの白線の前に3段の表彰台が組み上がる
// 演出: 1位台→2位台→3位台の順に立ち上がり、PersonMini が1人ずつ乗る (1位は腕上げ)
// 動き: seg で1段ずつ scaleY / 組み上がりの衝撃線 / 人が順に乗る / 札「96年前」
const S18: React.FC<{ f: number }> = ({ f }) => {
  const GY = 820; // 接地
  const steps: Array<{ x: number; w: number; h: number; n: string; a: number }> = [
    { x: 960, w: 400, h: 360, n: "1", a: 4 },   // 1位 (中央)
    { x: 560, w: 380, h: 240, n: "2", a: 16 },  // 2位 (左)
    { x: 1360, w: 380, h: 160, n: "3", a: 28 }, // 3位 (右)
  ];
  return (
    <Frame f={f} seed={917}>
      {/* 競技場の空 */}
      <rect x={-20} y={-20} width={W + 40} height={520} fill={C.aegean} opacity={0.22} />
      <g fill={KRP.white} opacity={0.8}>
        <ellipse cx={300 + Math.sin(f / 18) * 10} cy={150} rx={130} ry={40} />
        <ellipse cx={380 + Math.sin(f / 18) * 10} cy={120} rx={90} ry={32} />
        <ellipse cx={1680 - Math.sin(f / 16) * 8} cy={210} rx={110} ry={36} />
      </g>
      {/* 遠くの観客席の帯 */}
      <rect x={-20} y={440} width={W + 40} height={80} fill={C.marbleDark} opacity={0.35} />
      <line x1={-20} y1={440} x2={W + 20} y2={440} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={60 + i * 80} cy={465 + (i % 2) * 24} r={9} fill={KRP.ink} opacity={0.25} />
      ))}
      {/* フィールドとトラック */}
      <rect x={-20} y={520} width={W + 40} height={300} fill={C.laurel} opacity={0.22} />
      <rect x={-20} y={GY} width={W + 40} height={H - GY + 20} fill={C.terracotta} opacity={0.3} />
      {/* 地面線 */}
      <line x1={120} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      {/* トラックの白線 */}
      <g stroke={KRP.white} strokeWidth={9} opacity={0.85}>
        <line x1={-20} y1={886} x2={W + 20} y2={886} />
        <line x1={-20} y1={962} x2={W + 20} y2={962} />
        <line x1={-20} y1={1042} x2={W + 20} y2={1042} />
      </g>
      {steps.map((st, i) => {
        const t = easeOut(seg(f, st.a, st.a + 10));
        const h = st.h * t;
        return (
          <g key={i}>
            {/* 側面の影 (立体) */}
            <polygon points={`${st.x + st.w / 2},${GY - h} ${st.x + st.w / 2 + 42},${GY - h - 26}
              ${st.x + st.w / 2 + 42},${GY - 26} ${st.x + st.w / 2},${GY}`}
              fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} opacity={t} />
            {/* 天板 */}
            <polygon points={`${st.x - st.w / 2},${GY - h} ${st.x + st.w / 2},${GY - h}
              ${st.x + st.w / 2 + 42},${GY - h - 26} ${st.x - st.w / 2 + 42},${GY - h - 26}`}
              fill={C.riceGold} stroke={KRP.ink} strokeWidth={5} opacity={t} />
            {/* 前面 */}
            <rect x={st.x - st.w / 2} y={GY - h} width={st.w} height={h}
              fill={C.wood} stroke={KRP.ink} strokeWidth={7} opacity={Math.min(t * 2, 1)} />
            {/* 木目 */}
            <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.7 * t}>
              <line x1={st.x - st.w / 2 + 30} y1={GY - h + 34} x2={st.x + st.w / 2 - 30} y2={GY - h + 38} />
              <line x1={st.x - st.w / 2 + 40} y1={GY - h / 2} x2={st.x + st.w / 2 - 50} y2={GY - h / 2 + 6} />
              <ellipse cx={st.x - st.w / 4} cy={GY - h + 70} rx={16} ry={7} fill="none" />
            </g>
            {/* 番号 */}
            <text x={st.x} y={GY - h + Math.min(h * 0.62, 130)} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={Math.min(110, 40 + h * 0.3)} fill={KRP.ink} opacity={t}>{st.n}</text>
            <Bolt x={st.x - st.w / 2 - 50} y={GY - st.h - 60} s={0.65}
              opacity={pop(seg(f, st.a + 8, st.a + 12)) * (1 - seg(f, st.a + 13, st.a + 14))} />
          </g>
        );
      })}
      {/* 表彰台の3人 (1位は腕を上げて) */}
      <g opacity={clamp01(seg(f, 16, 22))}>
        <PersonMini x={960} y={460} s={1.5} color={C.gold} f={f} phase={0} face="smile" arms="up" />
      </g>
      <g opacity={clamp01(seg(f, 28, 34))}>
        <PersonMini x={560} y={580} s={1.35} color={C.silver} f={f} phase={2} face="dot" />
      </g>
      <g opacity={clamp01(seg(f, 38, 42))}>
        <PersonMini x={1360} y={660} s={1.25} color={C.bronze} f={f} phase={4} face="dot" />
      </g>
      <TagPlate x={1590} y={300} text="96年前" size={56} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// #19/#20 の共有部品: 広げた絵巻物の上の横長年表。phase=1 長さの対比 / phase=2 さかのぼる矢印
// どこ: 机の上に広げた絵巻 (Emaki) の紙の上
// 演出: 「きもち」の長い帯 (炎つき) と右端ギリギリの短い赤帯「しくみ」
// 動き: 帯が左から伸びる / 赤帯が pop / (phase2) 矢印が右→左に走り時計が逆回転
const IchiTimeline: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const AY = 600; // 軸
  const grow = easeOut(seg(f, 4, phase === 1 ? 24 : 14));
  const arrowT = easeOut(seg(f, 10, 32));
  const ax = 1540 - arrowT * 1180; // phase2 矢印の先端x
  return (
    <g>
      {/* 軸と目盛り (絵巻の紙 170..1760 に収める) */}
      <line x1={240} y1={AY + 90} x2={1688} y2={AY + 90} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={280 + i * 110} y1={AY + 78} x2={280 + i * 110} y2={AY + 102}
          stroke={KRP.ink} strokeWidth={4.5} />
      ))}
      <polygon points={`1688,${AY + 56} 1688,${AY + 124} 1726,${AY + 90}`} fill={KRP.ink} />
      {/* ラベル: 大昔 / いま */}
      <text x={300} y={AY + 170} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={48} fill={KRP.ink}>大昔</text>
      <text x={1620} y={AY + 170} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={48} fill={KRP.ink}>いま</text>
      {/* きもちの帯 (左端→右端近くまで・高さ110) */}
      <g transform={`translate(240 ${AY - 55}) scale(${grow} 1)`}>
        <rect x={0} y={0} width={1280} height={110} rx={16}
          fill={KRP.orange} stroke={KRP.ink} strokeWidth={7} opacity={0.9} />
        <line x1={36} y1={55} x2={1244} y2={55} stroke={KRP.yellow} strokeWidth={14}
          strokeLinecap="round" opacity={0.6} />
      </g>
      <FlameIcon x={320} y={AY - 70} s={0.42} f={f} t={seg(f, 2, 10)} />
      <TagPlate x={520} y={AY - 150} text="きもち" size={50} t={seg(f, 14, 24)} color={KRP.red} />
      {/* しくみの帯 (右端ギリギリの短い赤) */}
      <g transform={`translate(1580 ${AY - 55}) scale(${clamp01(pop(seg(f, phase === 1 ? 26 : 16, phase === 1 ? 36 : 24)))})`}>
        <rect x={-30} y={0} width={116} height={110} rx={14}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
      </g>
      <TagPlate x={1580} y={AY - 150} text="しくみ" size={50}
        t={seg(f, phase === 1 ? 32 : 20, phase === 1 ? 42 : 28)} />
      {phase === 2 && (
        <g>
          {/* 右→左へ走る大矢印 (時間を巻き戻す) */}
          <g opacity={clamp01(seg(f, 8, 14))}>
            <rect x={ax} y={270} width={arrowT * 1180} height={56} rx={14}
              fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
            <polygon points={`${ax - 104},298 ${ax + 16},232 ${ax + 16},364`}
              fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          </g>
          {/* 逆回転の時計 */}
          <g transform={`translate(${ax + 150} 298) scale(${clamp01(pop(seg(f, 10, 18)))})`}>
            <circle r={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            {[0, 90, 180, 270].map((d, i) => (
              <line key={i} x1={0} y1={-66} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={5}
                transform={`rotate(${d})`} />
            ))}
            <line x1={0} y1={0} x2={0} y2={-48} stroke={KRP.ink} strokeWidth={8}
              strokeLinecap="round" transform={`rotate(${-f * 9})`} />
            <line x1={0} y1={0} x2={30} y2={0} stroke={KRP.red} strokeWidth={6}
              strokeLinecap="round" transform={`rotate(${-f * 2.2})`} />
            <circle r={8} fill={KRP.ink} />
          </g>
          <TagPlate x={960} y={150} text="さかのぼる" size={56} t={seg(f, 24, 36)} color={KRP.red} />
        </g>
      )}
    </g>
  );
};

// #19 勝ちたい気持ちは大昔から。「1位」の仕組みは、驚くほど最近できた。
// v2: 机の上に広げた絵巻物の上に年表を描く
const S19: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={918}>
    <DeskBack />
    <Emaki />
    <IchiTimeline f={f} phase={1} />
  </Frame>
);

// #20 人類が「順位」を発明していく歴史、さかのぼってみましょう。
// v2: #19と同じ絵巻の舞台のまま、矢印で巻き戻す
const S20: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={919}>
    <DeskBack />
    <Emaki />
    <IchiTimeline f={f} phase={2} />
  </Frame>
);

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib0_ikinari_quiz:    (f) => <S1 f={f} />,
  ib0_nii_nannin:      (f) => <S2 f={f} />,
  ib0_zero_nin:        (f) => <S3 f={f} />,
  ib0_nokotte_nai:     (f) => <S4 f={f} />,
  ib0_kiroku_ga_nai:   (f) => <S5 f={f} />,
  ib0_olympia_eiyu:    (f) => <S6 f={f} />,
  ib0_maketa_senshu:   (f) => <S7 f={f} />,
  ib0_uradori:         (f) => <S8 f={f} />,
  ib0_shousha_hitori:  (f) => <S9 f={f} />,
  ib0_nii_mo_nai:      (f) => <S10 f={f} />,
  ib0_souzou:          (f) => <S11 f={f} />,
  ib0_yayoi_mura:      (f) => <S12 f={f} />,
  ib0_sekaiichi_da:    (f) => <S13 f={f} />,
  ib0_tonari_shiranai: (f) => <S14 f={f} />,
  ib0_dohyo_map:       (f) => <S15 f={f} />,
  ib0_shikumi_datta:   (f) => <S16 f={f} />,
  ib0_medal_120:       (f) => <S17 f={f} />,
  ib0_hyoshodai_96:    (f) => <S18 f={f} />,
  ib0_kimochi_shikumi: (f) => <S19 f={f} />,
  ib0_sakanoborou:     (f) => <S20 f={f} />,
};

export const I_B0_MOTIFS: string[] = [
  "ib0_ikinari_quiz",    // #1 いきなりですが、クイズです。
  "ib0_nii_nannin",      // #2 古代オリンピックで2位になった人の名前は、何人わかっているでしょうか。
  "ib0_zero_nin",        // #3 答えは、ゼロ人です。
  "ib0_nokotte_nai",     // #4 名前が残っていないのではありません。
  "ib0_kiroku_ga_nai",   // #5 そもそも「2位」という記録自体が、存在しないのです。
  "ib0_olympia_eiyu",    // #6 古代ギリシャのオリンピア。優勝者は彫像が建ち、詩人が歌をつくり、故郷の英雄になりました。
  "ib0_maketa_senshu",   // #7 では、負けた選手はどうなったのか。
  "ib0_uradori",         // #8 詩人ピンダロスは書いています。敗者は母親に会うのも恥ずかしくて、裏通りをこそこそ帰った、と。
  "ib0_shousha_hitori",  // #9 勝者がひとり。あとは全員、ただの敗者。
  "ib0_nii_mo_nai",      // #10 2位も、3位も、入賞もありませんでした。
  "ib0_souzou",          // #11 ところで、ちょっと想像してみてください。
  "ib0_yayoi_mura",      // #12 弥生時代の村に、稲作がいちばんうまい人がいたとします。
  "ib0_sekaiichi_da",    // #13 その人は「おれは世界一だ」と言ったでしょうか。
  "ib0_tonari_shiranai", // #14 言わないですよね。隣の村のことすら、よく知らないのですから。
  "ib0_dohyo_map",       // #15 「何位か」に意味が生まれるには、同じ土俵の仲間と、同じ物差しと、記録する誰かが要るのです。
  "ib0_shikumi_datta",   // #16 つまり「順位」は、勝ちたい気持ちとは別の、人間が作った仕組みでした。
  "ib0_medal_120",       // #17 金銀銅のメダルが生まれたのは、たった120年前。
  "ib0_hyoshodai_96",    // #18 3段の表彰台にいたっては、96年前の発明です。
  "ib0_kimochi_shikumi", // #19 勝ちたい気持ちは大昔から。「1位」の仕組みは、驚くほど最近できた。
  "ib0_sakanoborou",     // #20 人類が「順位」を発明していく歴史、さかのぼってみましょう。
];

export const ichiB0Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B0_PREVIEW_FRAMES = Math.max(I_B0_MOTIFS.length, 1);
export const IchiB0Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B0_MOTIFS.length - 1);
  return <>{ichiB0Scene(I_B0_MOTIFS[i] ?? "", 45)}</>;
};

// ===== 動き確認用: 1シーン 200フレーム ずつ通して再生する =====
// 上のプレビューは f=45 の一瞬しか写らないので、#15 のように
// ナレーションに合わせて f=76/120/156 で絵が出るシーンは確認できない。
// こちらは「コマ番号 = (文番号 − 1) × 200 + 見たい f」で狙い撃ちできる。
export const ICHI_B0_MOTION_PER = 200;
export const ICHI_B0_MOTION_FRAMES = Math.max(I_B0_MOTIFS.length * ICHI_B0_MOTION_PER, 1);
export const IchiB0Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / ICHI_B0_MOTION_PER), I_B0_MOTIFS.length - 1);
  return <>{ichiB0Scene(I_B0_MOTIFS[i] ?? "", frame - i * ICHI_B0_MOTION_PER)}</>;
};
