// 作風 sekai「つながる世界史」冒頭3分の共通部品。
//
// 設計書: docs/sekai-boutou-design.md
// ここに置くのは「同じ物が2回以上出てくる」部品だけ (6点法③)。
// 汎用の図形キットは作らない (制作ガイド第13条)。1枚しか出ない物は各担当のファイルに描く。
//
//   WarmStage   逆光の舞台。光源をひとつ決めて、光の帯と埃と周辺減光まで含めて焚く
//   SekaiMap    世界地図    #10 / #31 / #37 / #39
//   SekaiChrono 年表の帯    #9 / #15 / #30 / #34
//   SekaiGlobe  地球の弧    #1 / #3 / #25
//   SekaiCup    毒の杯      #12 / #21
//   SekaiPodium 演説台      #11 / #17 / #21
//   CrossMark   錆朱の×    #26 / #35 / #36
//
// 配色は SekaiBoutou.tsx の COLOR (障子を光源にした逆光) を全編の基準にする。
// 逆光だと人物が黒い影になるので、実在の人物の顔を描かずに済む。

import React from "react";
import { SKP, SEKAI_SERIF, SEKAI_FONT, seg, easeOut, easeInOut, W, H } from "./parts";

// 1文ぶんの絵。<svg viewBox="0 0 1920 1080"> の中に入る SVG だけを返す約束。
// HTML (通知カード・字幕帯) は外側の枠が足すので、ここでは div を使わない。
export type SekaiArt = React.FC<{ f: number }>;

// ===================================================================
// 配色
// ===================================================================
export const WP = {
  bg: "#241A12", // 奥の空気
  deep: "#120D08", // 周辺減光
  wall: "#4A3524",
  wood: "#4E3522",
  woodDark: "#382416",
  line: "#20150E", // 輪郭 (逆光なので輪郭は暗い)
  paperLit: "#F6E7BC", // 光を透かした紙
  glow: "#FFE6AE", // 光の帯
  shadow: "#1C1410", // 逆光の人・物
  shadowDeep: "#120C09",
  rim: "#D9A764", // 金のリムライト
  amber: "#C98A3C",
  amberLit: "#F0B45C",
  sabi: SKP.sabi,
  sabiDeep: SKP.sabiDeep,
  kinari: SKP.kinari,
  kinariDim: SKP.kinariDim,
  sea: "#1A130D", // 地図の海 (※ 夜の地図のときだけ。昼・寄りの海は seaBlue を使う)
  land: "#3A2E22", // 地図の陸

  // ── 物の色の台帳 ★2026-11-09 追加 ────────────────────────────────
  // 作者指摘「ちゃんと写真に撮ったように、適切なものに適切な色を入れろ」。
  // 上の琥珀系は「室内の電灯・障子の光」の色であって、空や海や炎の色ではない。
  // 画面に出す物は、まずここから色を取ること。無い物は実物を思い出して足す。
  // 守る約束: ①光源の色だけは場面で1つ ②影は黒ではなく「その場の光の補色寄り」
  //          ③一番言いたい物にいちばん強い色を置く (全部を派手にしない)

  // 空と時間
  nightSky: "#0B1430", // 真夜中の空 (紺)
  nightSkyHi: "#1B2C57", // 夜空の上側・街明かりでわずかに明るい所
  duskSky: "#2A3A63", // 夕暮れの空の上
  duskLow: "#D4703A", // 夕暮れの空の地平 (橙)
  dawnSky: "#6E86B8",
  daySky: "#5E8FC4", // 昼の空
  daySkyHi: "#9CC3E4",
  star: "#CFE2FF",
  moon: "#E8EEF7",

  // 水
  seaBlue: "#13456B", // 海 (寄り)
  seaBlueDeep: "#0A2740",
  seaBlueLit: "#2E7BA8", // 波頭・日が当たる面
  foam: "#D6E8F0",

  // 火と熱
  fire: "#E8541E", // 炎
  fireCore: "#FFC24A", // 炎の芯
  ember: "#8E2A10", // 燃え残り・赤熱
  smoke: "#4A4440", // 煙
  smokeLit: "#8A8078",

  // 血と肉と命
  blood: "#8E1A18",
  skin: "#D9A47A", // 肌 (この作風は逆光なので使う場面は少ない)
  skinShade: "#8A5F3F",

  // 草木と土
  leaf: "#2F6B37", // 木の葉
  leafLit: "#5AA050",
  grass: "#4A7A34",
  tatami: "#8A8A4A", // 畳
  tatamiDim: "#5E5E32",
  earth: "#5A4430",
  sand: "#C2A271", // 砂・乾いた土

  // 冬
  snow: "#EAF1F7",
  snowShade: "#AEC2D4",
  ice: "#9FC6D8",

  // 人工物
  steel: "#8E969C", // 鉄・鋼
  steelDark: "#4A5257",
  steelLit: "#C3CBD1",
  concrete: "#9A958D",
  concreteDark: "#5E5A54",
  asphalt: "#35332F",
  glassBlue: "#2B5A72", // 窓ガラスの映り込み
  brass: "#C9A227", // 真鍮・金
  rust: "#8C4A24",

  // 紙・布・印刷
  paperWhite: "#F2EDE1", // 白い紙 (制裁リストなど現代の書類)
  paperAged: "#E3D4AE", // 古い和紙・詔書
  ink: "#1A1714", // 墨
  inkRed: "#B5322A", // 朱肉・判子
  cloth: "#C8BBA4",
  clothRed: "#9E2B25", // 幟・横断幕の赤

  // 画面・光るもの (報道パート用)
  screenBlue: "#1E4C7A",
  screenLit: "#5FD0F0",
  alert: "#E04A2F", // 速報の赤
  signGreen: "#1E8A5A", // 看板の緑
  signRed: "#CE2B2B", // 看板の赤
  neonYellow: "#F2C230",

  // ── 1945年8月15日 正午の日本 ★2026-11-09 時代考証つきで追加 ────────
  // 調べたこと:
  //   ・男性の国民服 = 国民服令 (1940年11月1日 公布施行)。生地は国防色 = カーキ。
  //     甲号 (一般民間人向け・襟を立て襟にもできる) と乙号 (青少年・官吏向け、簡易な軍服風)
  //   ・女性は 1942年制定の標準服。その中の「防空着」が もんぺ (足首で絞ったズボン状)。
  //     本土空襲が始まってからは、女性のほとんどが日常着として常用していた
  //   ・東京の当日は晴れ。最高 32.3℃ の真夏日。**正午なので太陽はほぼ真上**。
  //     → 影は足元に短く濃く落ちる。夕方の長い逆光にしてはいけない
  //   ・受信機は放送局型123号 (トランスレス高一)。戦時末期の代用品で、
  //     スピーカーの枠は紙製。ラジオのない地域では「ラジオのある家で聞け」と役場が指示した
  kokuminFuku: "#7C6B46", // 国民服の国防色 (カーキ)
  kokuminFukuLit: "#9C8959",
  kokuminFukuDark: "#53472C",
  monpe: "#33405A", // もんぺ (紺絣)
  monpeLit: "#4E5E7C",
  kappogi: "#E8E3D4", // 割烹着 (白)
  kappogiShade: "#BCB5A3",
  tenugui: "#DBD4C1", // 手ぬぐい
  gaiter: "#6E6044", // ゲートル (巻脚絆)
  shikkui: "#D9CFB8", // 漆喰の壁
  kawara: "#55585C", // 瓦
  natsuDoro: "#AD8F66", // 真夏の乾いた土
  natsuKage: "#6A543A", // その影
  natsuHikari: "#FFF6DC", // 真昼の白い日差し

  // ── 1945年の茶の間と受信機 ★2026-11-09 追加 (別紙A #1 / #5 / #7) ──────
  // 調べたこと:
  //   ・灯火管制下の裸電球には黒い布か黒く塗った金属の笠をかぶせ、光を下へ落とした
  //   ・放送局型123号のスピーカー枠は紙製。目盛り板は 550〜1500kc
  //   ・ラジオは神棚の下か、神棚を乗せた棚の上に置く家が多かった
  //   ・詔書の巻紙は鳥の子紙。簀の目 (抄紙の簾の跡) が横に走る。軸は黒漆
  denkyuu: "#F7E4A8", // 裸電球のガラスが灯った色
  denkyuuKasa: "#1E1A15", // 灯火管制の黒い布の笠
  chabudai: "#7A4C28", // 卓袱台の漆の天板
  chabudaiDark: "#482B14",
  yunomi: "#5E6B5C", // 湯呑みの釉 (青磁)
  hashiradokei: "#3E2A18", // 柱時計の木枠
  shinkuukan: "#F2A83C", // 真空管のフィラメントの灯
  nunoSpeaker: "#6A5236", // スピーカーの張り布
  sunakabe: "#B4A484", // 砂壁
  sakaki: "#2A5A32", // 神棚の榊の葉
  kome: "#EDE6D2", // 盛った米
  shinbunKiiro: "#D8C79A", // 黄ばんだ1945年の新聞紙
  shinbunKiiroKage: "#AE9B72",
  kuroUrushi: "#17130F", // 巻紙の軸の黒漆

  // ── 1945年8月15日 宮城前広場 ★2026-11-09 追加 (別紙A #8) ─────────────
  //   ・地面は明るい灰白色の玉砂利。芝ではない
  //   ・楠木正成の騎馬銅像は明治期の鋳銅で、表面は緑青に覆われている
  tamajari: "#CFC9BC", // 玉砂利
  tamajariKage: "#9A9486", // 玉砂利の影
  horiMizu: "#3E5A4E", // 濠の水 (松が映って緑に寄る)
  matsu: "#20452A", // 松の葉
  matsuMiki: "#4E3A26", // 松の幹
  ishigaki: "#8E8A7E", // 二重橋の石と石垣
  rokushou: "#4E7A62", // 銅像の緑青
  boukuuZukin: "#4A4034", // 防空頭巾
  takeyari: "#9E8A4E", // 竹槍の竹

  // ── イラン (1988年7月 / 2026年のテヘラン) ★2026-11-09 追加 (別紙A #1 / #10) ──
  //   ・国旗は緑#239F40 / 白 / 赤#DA0000。中央に赤いアッラーの意匠
  //   ・テヘランは標高1200mの大都市。壁は日干し煉瓦と水色のタイル
  //   ・1988年の乗用車はペイカン (Hillman Hunter の現地生産車) の白が圧倒的
  chador: "#15161A", // 黒チャードル
  chadorLit: "#32343C", // その折り目の光
  rusari: "#8E5A6E", // 柄入りのルーサリー
  manto: "#4A4452", // 長いマントー
  tileMizuiro: "#4E9EB4", // 水色のタイル
  tileMizuiroLit: "#8CCBD8",
  hiboshiRenga: "#C09A6A", // 日干し煉瓦
  hiboshiRengaKage: "#8E6E48",
  iranGreen: "#239F40", // イラン国旗の緑
  iranRed: "#DA0000", // イラン国旗の赤
  paykan: "#E4E2D8", // 白いペイカンのセダン
  juiMizu: "#6E8E7A", // 街路の水路 (ジュー) の水
  chai: "#9E4A16", // エステカンのなかの紅茶
  sunaBokori: "#D8C49E", // 砂埃

  // ── 現代の台所と机の上 ★2026-11-09 追加 (別紙A #1 / #2 / #3 / #9) ──────
  stainless: "#B8BEC2", // ステンレス
  stainlessDark: "#7E858A",
  gasFlame: "#3E8ED8", // ガスの炎 (青)
  phoneBlack: "#1C1E22", // 伏せて置いたスマートフォンの背
  enpitsu: "#D8A32E", // 鉛筆の軸
  jogi: "#E0CFA4", // 竹の定規
  gakuran: "#1B1B22", // 学ランの黒
  tenjiYellow: "#F2B22E", // 歩道の点字ブロック
  jihanki: "#D64A2E", // 自販機の前面

  // ── イランの室内と装い ★2026-11-09 追加 (別紙B #11/#12/#17/#19) ──────────
  karpetAka: "#8E2B22", // ペルシア絨毯の赤 (茜)
  karpetKon: "#1E2A4E", // ペルシア絨毯の紺
  karpetKinari: "#E2D2A6", // 絨毯の生成りの地
  turbanKuro: "#15161C", // 聖職者の黒いターバン (サイイドの印)
  turbanOrime: "#2E3038", // ターバンの巻きの折り目
  abaCha: "#4A3722", // 茶のアバ (外衣)
  kaftanCha: "#6E5434", // 下に着るカフタン
  agohige: "#E8E4DA", // 白い顎髭
  shikkuiHagare: "#A89878", // 漆喰が剥がれた下地
  radioKigumi: "#6C4826", // 木枠のラジオ
  shinchuuKage: "#6E4E14", // 真鍮の影側
  hachimakiMidori: "#1E7A42", // 動員兵の緑の鉢巻
  fieldJacket: "#6A6A48", // カーキのフィールドジャケット
  matsubaZue: "#C8A86E", // 松葉杖の木
  koinMidori: "#2A6E4E", // 公印の緑のインク

  // ── 2026年の夜のテヘラン ★2026-11-09 追加 (別紙B #16) ──────────────────
  kyuukyuuAo: "#3A7FE0", // 救急車の青い灯
  housuiMizu: "#BFD8E4", // 消防の放水
  moufu: "#9E5A42", // かけられた毛布
  helmetKi: "#E0B32E", // 消防士のヘルメット
  gaitouDentou: "#FFD98E", // 一本だけ点いている街灯の灯

  // ── 机・卓・紙 ★2026-11-09 追加 (別紙B #13/#15/#18/#19/#20) ────────────
  mokumeTsukue: "#9A6E42", // 机の木目
  mokumeSuji: "#6E4824", // 木目の筋
  noteKeisen: "#7A93B8", // ノートの青い罫線
  keikouPen: "#E8E24A", // 蛍光ペンの黄
  coffeeSame: "#3A2214", // 冷めたコーヒー
  shuIto: "#C4342A", // 朱の糸
  headphoneKuro: "#24262B", // ヘッドホン
  gakubuchiKin: "#C19B4A", // 額縁の金
  shirokinu: "#E6E2D6", // 額に掛けた白布
  shirokinuKage: "#B5AFA0", // その皺の影
  hiyakeAto: "#C9BCA2", // 壁の日焼けの跡
  kabeAojiro: "#6E7A86", // 冷たい青白の光が当たった壁
  recordKuro: "#18181C", // レコード盤 (玉音盤)
  recordMizo: "#45454C", // その溝
  jishoKami: "#F0EAD8", // 辞書の薄い紙
  mushimeganeWaku: "#8A6A3E", // 虫眼鏡の柄
} as const;

// ===================================================================
// 逆光の舞台
// ===================================================================
// 素の地に図を浮かせない (第16条)。背景・光源・光の帯・埃・周辺減光を一組で焚く。
// src で光源の位置を決めると、光の帯がそこから下へ広がる。

const shaft = (sx: number, sy: number, top: number, lean: number, spread: number) =>
  `M ${sx - top},${sy} L ${sx + top},${sy}
   L ${sx + lean + spread},${H} L ${sx + lean - spread},${H} Z`;

export const WarmStage: React.FC<{
  f: number;
  uid: string;
  src?: [number, number]; // 光源
  srcR?: number;
  glow?: string;
  bg?: string;
  shafts?: boolean;
  motes?: number;
  vig?: number;
  children: React.ReactNode;
}> = ({
  f,
  uid,
  src = [960, 180],
  srcR = 760,
  glow = WP.glow,
  bg = WP.bg,
  shafts = true,
  motes = 30,
  vig = 0.8,
  children,
}) => {
  const up = easeOut(seg(f, 0, 26));
  const [sx, sy] = src;
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-src`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity={0.5} />
          <stop offset="46%" stopColor={glow} stopOpacity={0.18} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="50%" cy="42%" r="74%">
          <stop offset="50%" stopColor={WP.deep} stopOpacity={0} />
          <stop offset="100%" stopColor={WP.deep} stopOpacity={vig} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={bg} />
      <circle cx={sx} cy={sy} r={srcR} fill={`url(#${uid}-src)`} opacity={up} />
      {children}
      {shafts && (
        <g opacity={easeOut(seg(f, 6, 46))}>
          <path d={shaft(sx - 300, sy, 190, -320, 430)} fill={glow} opacity={0.15} />
          <path d={shaft(sx + 300, sy, 180, 380, 420)} fill={glow} opacity={0.13} />
          <path d={shaft(sx, sy, 90, -60, 160)} fill={glow} opacity={0.09} />
        </g>
      )}
      {motes > 0 && (
        <g opacity={easeOut(seg(f, 14, 60)) * 0.42}>
          {Array.from({ length: motes }, (_, i) => {
            const px = 160 + ((i * 251) % 1600);
            const py = 140 + ((i * 437 + f * 0.7) % 860);
            return (
              <circle key={i} cx={px} cy={py} r={i % 3 === 0 ? 3.2 : 2} fill="#FFE9BC" />
            );
          })}
        </g>
      )}
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-vig)`} />
    </>
  );
};

// ===================================================================
// 部品1: 世界地図 SekaiMap   #10 / #31 / #37 / #39
// ===================================================================
// 毎回ちがう図を発明せず、同じ地図の「違う場所だけ」を灯して使い回す。
// 2回目から視聴者が読み方を覚えなくて済む。
// 扱う土地は5つだけ (日本 / イラン / イスラエル / アメリカ / 江戸)。

// 経度緯度 → 画面座標。数値を変えると4枚ぜんぶ動くので触らない
const PX = 5.8,
  PY = 6.6,
  LON0 = 22,
  LAT0 = 30,
  CX = 960,
  CY = 500;
export const mp = (lon: number, lat: number): [number, number] => [
  CX + (lon - LON0) * PX,
  CY - (lat - LAT0) * PY,
];
const poly = (pts: [number, number][]) =>
  pts.map(([lo, la]) => mp(lo, la).join(",")).join(" ");

const NA: [number, number][] = [
  [-125, 49], [-124, 40], [-120, 34], [-114, 30], [-110, 24], [-106, 23],
  [-97, 26], [-94, 29], [-89, 29], [-84, 30], [-80, 25], [-81, 31],
  [-76, 35], [-74, 40], [-70, 42], [-66, 45], [-60, 47], [-56, 51],
  [-64, 58], [-78, 62], [-85, 67], [-95, 69], [-110, 69], [-125, 70],
];
const GREENLAND: [number, number][] = [
  [-45, 60], [-22, 70], [-20, 80], [-45, 83], [-58, 76], [-55, 65],
];
const SA: [number, number][] = [
  [-92, 15], [-84, 10], [-78, 8], [-72, 11], [-62, 10], [-52, 5],
  [-48, -1], [-44, -3], [-38, -6], [-39, -14], [-48, -25], [-58, -34],
  [-62, -41], [-68, -50], [-74, -45], [-72, -35], [-71, -20], [-76, -10],
  [-80, -3], [-78, 2], [-82, 8], [-86, 12],
];
const AFRICA: [number, number][] = [
  [-17, 15], [-16, 20], [-10, 27], [-2, 32], [10, 34], [20, 32],
  [32, 31], [34, 28], [38, 22], [43, 12], [51, 12], [48, 5],
  [42, -2], [40, -10], [35, -20], [32, -26], [28, -33], [20, -35],
  [15, -28], [13, -18], [12, -6], [9, 4], [5, 5], [-4, 5], [-8, 4], [-13, 9],
];
const EURASIA: [number, number][] = [
  [-9, 38], [-9, 43], [-2, 43], [-1, 46], [-4, 48], [0, 49], [4, 51],
  [8, 54], [9, 57], [5, 59], [11, 58], [11, 64], [16, 69], [25, 71],
  [40, 70], [55, 71], [70, 73], [90, 75], [110, 74], [130, 72], [142, 69],
  [140, 62], [135, 57], [130, 48], [122, 40], [121, 32], [112, 22],
  [107, 11], [100, 13], [98, 8], [94, 16], [90, 22], [86, 21], [80, 16],
  [77, 8], [73, 20], [70, 24], [66, 25], [62, 25], [57, 25], [50, 29],
  [48, 30], [44, 29], [39, 22], [35, 28], [36, 36], [30, 40], [26, 38],
  [23, 40], [19, 40], [14, 38], [12, 45], [8, 44], [3, 43], [-3, 36],
];
const HONSHU: [number, number][] = [
  [130.5, 33.5], [134, 34], [136.5, 34.5], [139, 36], [141.5, 40.5],
  [141, 42], [139, 41.5], [137, 38.5], [134.5, 35.8], [132, 35], [130, 34.6],
];
const HOKKAIDO: [number, number][] = [
  [140.5, 42.5], [145, 43], [145.5, 45.5], [143, 45.5], [141, 43.8],
];
const KYUSHU: [number, number][] = [
  [129.5, 31.5], [131.5, 31], [132, 33], [130.5, 33.3],
];
const IRAN: [number, number][] = [
  [48.5, 30], [52, 27], [56, 26.5], [61, 25.2], [62, 26.5], [61.5, 30],
  [63, 32], [60, 35.5], [56, 38], [52, 39.5], [48, 39.5], [45, 38.5],
  [44.5, 37], [46, 33], [48, 31.5],
];
const USA: [number, number][] = [
  [-124, 48], [-123, 40], [-120, 34], [-117, 32.5], [-111, 31.3],
  [-106, 31.8], [-103, 29], [-97, 26], [-94, 29], [-89, 29], [-85, 30],
  [-82, 26], [-80, 25], [-81, 31], [-76, 35], [-74, 40], [-70, 42],
  [-67, 45], [-70, 45], [-83, 42], [-88, 48], [-95, 49], [-110, 49],
];

export type MapLand = "japan" | "iran" | "israel" | "usa" | "edo";

type LandDef = {
  lon: number;
  lat: number;
  name: string;
  shapes: [number, number][][] | null; // null = 小さすぎるので印だけ
  off: [number, number]; // 名札の位置 (土地からのずれ)
};

export const MAP_LAND: Record<MapLand, LandDef> = {
  japan: { lon: 138, lat: 36.4, name: "日本", shapes: [HONSHU, HOKKAIDO, KYUSHU], off: [66, -96] },
  iran: { lon: 53.5, lat: 32.5, name: "イラン", shapes: [IRAN], off: [104, 74] },
  israel: { lon: 35, lat: 31.5, name: "イスラエル", shapes: null, off: [-122, 98] },
  usa: { lon: -98, lat: 39.5, name: "アメリカ", shapes: [USA], off: [-8, -116] },
  edo: { lon: 139.7, lat: 35.7, name: "江戸", shapes: null, off: [-48, 104] },
};

const LandPlate: React.FC<{ x: number; y: number; text: string; t: number }> = ({
  x,
  y,
  text,
  t,
}) => {
  const w = text.length * 27 + 30;
  return (
    <g opacity={t}>
      <rect x={x - w / 2} y={y - 26} width={w} height={50} rx={3} fill={WP.kinari} />
      <rect x={x - w / 2} y={y - 26} width={5} height={50} fill={WP.sabi} />
      <text
        x={x + 3}
        y={y + 11}
        fontFamily={SEKAI_SERIF}
        fontSize={28}
        fontWeight={700}
        fill={SKP.sumi}
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
};

export const SekaiMap: React.FC<{
  f: number;
  uid: string;
  /** 琥珀に灯る土地。灯りはじめるフレームも指定できる */
  lit?: Partial<Record<MapLand, number>>;
  /** 錆朱の弧。from→to へ f で伸びる */
  arcs?: { from: MapLand; to: MapLand; at?: number; lift?: number; hit?: boolean }[];
  /** 寄る土地と倍率 */
  focus?: MapLand;
  zoom?: number;
  labels?: boolean;
}> = ({ f, uid, lit = {}, arcs = [], focus, zoom = 1, labels = true }) => {
  const draw = easeOut(seg(f, 0, 34));
  const z = focus ? zoom : 1;
  const [fx, fy] = focus ? mp(MAP_LAND[focus].lon, MAP_LAND[focus].lat) : [CX, CY];
  const k = 1 / z; // 寄っても線の太さは変えない
  const outline = (pts: [number, number][], key: string) => (
    <polygon
      key={key}
      points={poly(pts)}
      fill={WP.land}
      stroke={WP.kinariDim}
      strokeWidth={2.2 * k}
      opacity={0.5}
    />
  );
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={WP.amberLit} stopOpacity={0.85} />
          <stop offset="100%" stopColor={WP.amberLit} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 海。地図も素地に浮かせない */}
      <rect x={0} y={0} width={W} height={H} fill={WP.sea} />
      <g
        transform={
          z === 1 ? undefined : `translate(${CX} ${CY}) scale(${z}) translate(${-fx} ${-fy})`
        }
      >
        {/* 緯度経度の罫 */}
        <g opacity={0.07}>
          {Array.from({ length: 19 }, (_, i) => {
            const lon = -180 + i * 20;
            const [x] = mp(lon, 0);
            return (
              <line key={`v${i}`} x1={x} y1={-400} x2={x} y2={H + 400} stroke={WP.kinari} strokeWidth={1.4 * k} />
            );
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const lat = -80 + i * 20;
            const [, y] = mp(0, lat);
            return (
              <line key={`h${i}`} x1={-600} y1={y} x2={W + 600} y2={y} stroke={WP.kinari} strokeWidth={1.4 * k} />
            );
          })}
        </g>
        {/* 陸 */}
        <g opacity={draw}>
          {outline(NA, "na")}
          {outline(GREENLAND, "gl")}
          {outline(SA, "sa")}
          {outline(AFRICA, "af")}
          {outline(EURASIA, "eu")}
          {[HONSHU, HOKKAIDO, KYUSHU].map((p, i) => outline(p, `jp${i}`))}
        </g>
        {/* 灯る土地 */}
        {(Object.keys(lit) as MapLand[]).map((key) => {
          const L = MAP_LAND[key];
          const at = lit[key] ?? 0;
          const t = easeOut(seg(f, at, at + 26));
          if (t <= 0) return null;
          const [lx, ly] = mp(L.lon, L.lat);
          const pulse = 0.82 + Math.sin((f - at) / 11) * 0.18;
          return (
            <g key={key}>
              <circle cx={lx} cy={ly} r={(L.shapes ? 150 : 86) * t} fill={`url(#${uid}-glow)`} opacity={0.5 * pulse} />
              {L.shapes ? (
                L.shapes.map((p, i) => (
                  <polygon
                    key={i}
                    points={poly(p)}
                    fill={WP.amber}
                    stroke={WP.amberLit}
                    strokeWidth={3 * k}
                    opacity={t}
                  />
                ))
              ) : (
                <>
                  <circle cx={lx} cy={ly} r={13 * t} fill={WP.amberLit} />
                  <circle cx={lx} cy={ly} r={26} fill="none" stroke={WP.amberLit} strokeWidth={2.6 * k} opacity={t * 0.7} />
                </>
              )}
            </g>
          );
        })}
        {/* 関係は錆朱の弧。必ず端から端へ伸びる (出しっぱなしにしない) */}
        {arcs.map((a, i) => {
          const at = a.at ?? 20;
          const t = easeInOut(seg(f, at, at + 42));
          if (t <= 0) return null;
          const [x1, y1] = mp(MAP_LAND[a.from].lon, MAP_LAND[a.from].lat);
          const [x2, y2] = mp(MAP_LAND[a.to].lon, MAP_LAND[a.to].lat);
          const mx = (x1 + x2) / 2,
            my = (y1 + y2) / 2 - (a.lift ?? 190);
          return (
            <g key={i}>
              <path
                d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`}
                fill="none"
                stroke={WP.sabi}
                strokeWidth={6 * k}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - t}
              />
              {a.hit && t >= 1 && (
                <circle
                  cx={x2}
                  cy={y2}
                  r={18 + ((f - at - 42) % 34) * 3.4}
                  fill="none"
                  stroke={WP.sabi}
                  strokeWidth={4 * k}
                  opacity={1 - (((f - at - 42) % 34) / 34)}
                />
              )}
            </g>
          );
        })}
      </g>
      {/* 名札は寄っても大きさを変えない (画面の外に出ないように外側で描く) */}
      {labels &&
        (Object.keys(lit) as MapLand[]).map((key) => {
          const L = MAP_LAND[key];
          const at = lit[key] ?? 0;
          const t = easeOut(seg(f, at + 10, at + 34));
          if (t <= 0) return null;
          const [lx0, ly0] = mp(L.lon, L.lat);
          const lx = z === 1 ? lx0 : CX + (lx0 - fx) * z;
          const ly = z === 1 ? ly0 : CY + (ly0 - fy) * z;
          const px = lx + L.off[0],
            py = ly + L.off[1];
          return (
            <g key={key}>
              <line x1={lx} y1={ly} x2={px} y2={py} stroke={WP.amberLit} strokeWidth={2} opacity={t * 0.6} />
              <LandPlate x={px} y={py} text={L.name} t={t} />
            </g>
          );
        })}
    </g>
  );
};

// ===================================================================
// 部品2: 年表の帯 SekaiChrono   #9 / #15 / #30 / #34
// ===================================================================
// 上段 = 大きな時代 (1701 / 1945 / 1988 / 2026)、下段 = 2026年の月日。
// 時代が飛ぶときは朱の点がスーッと走ってから札が立つ。これで「飛んだ」と分かる。
// 目盛りの間隔は実年数に比例しない。比例させると1701〜1945が画面外になるため、
// 代わりに目盛りと目盛りのあいだに「〜」を入れて、縮めてあることを見せる。

export const ERA = ["1701", "1945", "1988", "2026"] as const;
export type EraKey = (typeof ERA)[number];
const ERA_LABEL: Record<EraKey, [string, string]> = {
  "1701": ["一七〇一", "忠臣蔵"],
  "1945": ["一九四五", "玉音放送"],
  "1988": ["一九八八", "毒の杯"],
  "2026": ["二〇二六", "いま"],
};
export const MONTH = ["2月28日", "3月", "4月", "6月", "11月3日"] as const;
export type MonthKey = (typeof MONTH)[number];

const X0 = 320,
  X1 = 1620;
const eraX = (k: EraKey) => X0 + (ERA.indexOf(k) / (ERA.length - 1)) * (X1 - X0);
const monthX = (k: MonthKey) => X0 + (MONTH.indexOf(k) / (MONTH.length - 1)) * (X1 - X0);

// 縦書きの札。YearTag と同じ字形にして「同じ物」だと分かるようにする
const ChronoTag: React.FC<{
  x: number;
  base: number;
  text: string;
  sub?: string;
  t: number;
  accent?: boolean;
}> = ({ x, base, text, sub, t, accent }) => {
  const chars = text.split("");
  const hgt = chars.length * 44 + 22;
  const top = base - 34 - hgt;
  return (
    <g opacity={t}>
      <line x1={x} y1={base} x2={x} y2={base - 30} stroke={accent ? WP.sabi : WP.kinariDim} strokeWidth={4} />
      <rect x={x - 32} y={top + (1 - t) * 16} width={64} height={hgt} rx={3} fill={WP.kinari} opacity={0.96} />
      <rect x={x - 32} y={top + (1 - t) * 16} width={5} height={hgt} fill={accent ? WP.sabi : WP.amber} />
      {chars.map((c, i) => (
        <text
          key={i}
          x={x + 3}
          y={top + 36 + i * 44 + (1 - t) * 16}
          fontFamily={SEKAI_SERIF}
          fontSize={34}
          fontWeight={700}
          fill={SKP.sumi}
          textAnchor="middle"
        >
          {c}
        </text>
      ))}
      {sub && (
        <text
          x={x}
          y={base + 48}
          fontFamily={SEKAI_FONT}
          fontSize={26}
          fill={accent ? WP.sabi : WP.kinariDim}
          textAnchor="middle"
        >
          {sub}
        </text>
      )}
    </g>
  );
};

export const SekaiChrono: React.FC<{
  f: number;
  /** 上段。どの時代に札を立てるか */
  at: EraKey;
  /** 上段。どこから朱の点が走ってくるか */
  from?: EraKey;
  /** 下段を開くか。開いたら月日のどこに印を打つか */
  month?: MonthKey;
  monthFrom?: MonthKey;
  /** 走りはじめるフレーム */
  runAt?: number;
  /** 下段が開きはじめるフレーム */
  monthAt?: number;
  y?: number;
  // ── 色 ★2026-11-09 追加 (制作ガイド §9-4 第12条「物に本当の色を入れる」) ──
  // 既定は今までの暖色。報道パート (#30 / #34) のように場面の色が違うときだけ渡す。
  /** 上段の罫と目盛り */
  rail?: string;
  /** 下段の罫と目盛り */
  railLower?: string;
  /** 走る点・立つ札の差し色 */
  mark?: string;
  /** 文字 */
  label?: string;
}> = ({
  f,
  at,
  from,
  month,
  monthFrom,
  runAt = 8,
  monthAt,
  y = 690,
  rail = WP.sabi,
  railLower = WP.amber,
  mark = WP.sabi,
  label = WP.kinariDim,
}) => {
  // 「3月。」のような短い図でも印が動き終わるように、58フレームで全部終える
  const mAt = monthAt ?? runAt + 4;
  const line = easeOut(seg(f, 0, 22));
  const run = easeInOut(seg(f, runAt, runAt + 24));
  const stand = easeOut(seg(f, runAt + 20, runAt + 42));
  const xa = eraX(at);
  const xf = from ? eraX(from) : X0;
  const dot = xf + (xa - xf) * run;
  const my = y + 220;
  const mOpen = month ? easeOut(seg(f, mAt, mAt + 24)) : 0;
  const mxTo = month ? monthX(month) : 0;
  const mxFrom = monthFrom ? monthX(monthFrom) : X0;
  const mRun = easeInOut(seg(f, mAt + 14, mAt + 46));
  const mdot = mxFrom + (mxTo - mxFrom) * mRun;
  return (
    <g>
      {/* 上段 */}
      <line x1={X0} y1={y} x2={X0 + (X1 - X0) * line} y2={y} stroke={rail} strokeWidth={6} strokeLinecap="round" />
      {ERA.map((k) => {
        const x = eraX(k);
        const done = ERA.indexOf(k) <= ERA.indexOf(at);
        const t = easeOut(seg(f, 6, 26));
        return (
          <g key={k} opacity={t}>
            <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke={rail} strokeWidth={5} />
            <circle cx={x} cy={y} r={12} fill={done ? mark : WP.sea} stroke={rail} strokeWidth={4} />
          </g>
        );
      })}
      {/* 目盛りのあいだを縮めてあることを見せる */}
      <g opacity={line * 0.5}>
        {ERA.slice(0, -1).map((k, i) => {
          const x = (eraX(k) + eraX(ERA[i + 1])) / 2;
          return (
            <text key={k} x={x} y={y - 16} fontFamily={SEKAI_SERIF} fontSize={30} fill={label} textAnchor="middle">
              〜
            </text>
          );
        })}
      </g>
      {/* 走る点 */}
      {run > 0 && run < 1 && (
        <>
          <line x1={xf} y1={y} x2={dot} y2={y} stroke={mark} strokeWidth={10} strokeLinecap="round" />
          <circle cx={dot} cy={y} r={17} fill={mark} />
          <circle cx={dot} cy={y} r={34} fill={mark} opacity={0.26} />
        </>
      )}
      {/* 札 */}
      {ERA.filter((k) => ERA.indexOf(k) < ERA.indexOf(at)).map((k) => (
        <ChronoTag key={k} x={eraX(k)} base={y - 20} text={ERA_LABEL[k][0]} sub={ERA_LABEL[k][1]} t={easeOut(seg(f, 4, 24)) * 0.55} />
      ))}
      <ChronoTag x={xa} base={y - 20} text={ERA_LABEL[at][0]} sub={ERA_LABEL[at][1]} t={stand} accent />

      {/* 下段 = 2026年の月日 */}
      {month && (
        <g opacity={mOpen}>
          <line x1={xa} y1={y + 14} x2={(X0 + X1) / 2} y2={my - 40} stroke={label} strokeWidth={2.6} opacity={0.5} strokeDasharray="8 8" />
          <line x1={X0} y1={my} x2={X0 + (X1 - X0) * mOpen} y2={my} stroke={railLower} strokeWidth={5} strokeLinecap="round" />
          {MONTH.map((k) => {
            const x = monthX(k);
            return (
              <g key={k}>
                <line x1={x} y1={my - 11} x2={x} y2={my + 11} stroke={railLower} strokeWidth={4} />
                <text x={x} y={my + 52} fontFamily={SEKAI_FONT} fontSize={28} fill={label} textAnchor="middle">
                  {k}
                </text>
              </g>
            );
          })}
          {mRun > 0 && (
            <>
              <circle cx={mdot} cy={my} r={16} fill={mark} />
              <circle cx={mdot} cy={my} r={32} fill={mark} opacity={0.24} />
              <line x1={mdot} y1={my} x2={mdot} y2={my - 64} stroke={mark} strokeWidth={4} />
              <circle cx={mdot} cy={my - 72} r={9} fill={mark} />
            </>
          )}
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 部品3: 地球の弧 SekaiGlobe   #1 / #3 / #25
// ===================================================================
// 画面の下に大きな球の上端だけを出す。灯は4つ (江戸 / 日本 / イラン / アメリカ)。
// #25 では5つ目 (制裁を受けた日本人) が小さく灯る。線はまだ引かない。

const GR = 1400,
  GCX = 960,
  GCY = 1520;
const gpt = (deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [GCX + GR * Math.sin(a), GCY - GR * Math.cos(a)];
};
// 灯る順 (台本#1 の読み上げ順)
const GLOBE_LIGHTS: { deg: number; name: string; off: [number, number] }[] = [
  { deg: 27, name: "江戸", off: [54, 74] },
  { deg: 17, name: "日本", off: [10, -92] },
  { deg: -2, name: "イラン", off: [-6, -96] },
  { deg: -27, name: "アメリカ", off: [-30, 78] },
];

export const SekaiGlobe: React.FC<{
  f: number;
  uid: string;
  /** 各灯がともりはじめるフレーム。要素数だけ灯る */
  lightAt?: number[];
  /** 灯と灯を錆朱の線で結びはじめるフレーム */
  linkAt?: number;
  /** 5つ目の小さな灯 */
  fifthAt?: number;
  labels?: boolean;
}> = ({ f, uid, lightAt = [0, 16, 32, 48], linkAt, fifthAt, labels = true }) => {
  const rise = easeOut(seg(f, 0, 40));
  const n = lightAt.length;
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-globe`} cx="50%" cy="22%" r="62%">
          <stop offset="0%" stopColor="#3A2A1C" />
          <stop offset="62%" stopColor="#241A12" />
          <stop offset="100%" stopColor="#120D08" />
        </radialGradient>
        <radialGradient id={`${uid}-lamp`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={WP.amberLit} stopOpacity={0.9} />
          <stop offset="100%" stopColor={WP.amberLit} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 大気 */}
      <circle cx={GCX} cy={GCY} r={GR + 54} fill="none" stroke={WP.amber} strokeWidth={60} opacity={0.07 * rise} />
      <circle cx={GCX} cy={GCY} r={GR + 16} fill="none" stroke={WP.amber} strokeWidth={14} opacity={0.2 * rise} />
      {/* 球 */}
      <circle cx={GCX} cy={GCY} r={GR} fill={`url(#${uid}-globe)`} stroke={WP.rim} strokeWidth={3.4} opacity={rise} />
      {/* 経線。球に見せるための手がかり */}
      <g opacity={0.14 * rise} clipPath={`url(#${uid}-gclip)`}>
        {[-60, -40, -20, 0, 20, 40, 60].map((d) => {
          const [x] = gpt(d);
          return <ellipse key={d} cx={GCX} cy={GCY} rx={Math.abs(x - GCX)} ry={GR} fill="none" stroke={WP.kinari} strokeWidth={2} />;
        })}
        {[1180, 1320].map((ry) => (
          <ellipse key={ry} cx={GCX} cy={GCY} rx={GR} ry={ry} fill="none" stroke={WP.kinari} strokeWidth={2} />
        ))}
      </g>
      <clipPath id={`${uid}-gclip`}>
        <circle cx={GCX} cy={GCY} r={GR} />
      </clipPath>
      {/* 灯と灯を結ぶ */}
      {linkAt !== undefined &&
        GLOBE_LIGHTS.slice(0, Math.max(n, 1)).map((L, i, arr) => {
          if (i === arr.length - 1) return null;
          const t = easeInOut(seg(f, linkAt + i * 12, linkAt + i * 12 + 40));
          if (t <= 0) return null;
          const [x1, y1] = gpt(L.deg);
          const [x2, y2] = gpt(arr[i + 1].deg);
          const pulse = 0.68 + Math.sin(f / 16 + i) * 0.26;
          return (
            <path
              key={i}
              d={`M ${x1},${y1} Q ${(x1 + x2) / 2},${(y1 + y2) / 2 - 120} ${x2},${y2}`}
              fill="none"
              stroke={WP.sabi}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={pulse}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - t}
            />
          );
        })}
      {/* 灯 */}
      {GLOBE_LIGHTS.slice(0, n).map((L, i) => {
        const at = lightAt[i];
        const t = easeOut(seg(f, at, at + 22));
        if (t <= 0) return null;
        const [x, y] = gpt(L.deg);
        const pulse = 0.84 + Math.sin((f - at) / 13) * 0.16;
        return (
          <g key={L.name}>
            <circle cx={x} cy={y} r={150 * t * pulse} fill={`url(#${uid}-lamp)`} opacity={0.5} />
            <circle cx={x} cy={y} r={16 * t} fill={WP.amberLit} />
            <circle cx={x} cy={y} r={34 * t} fill="none" stroke={WP.amberLit} strokeWidth={3} opacity={0.6 * t} />
            {labels && (
              <>
                <line x1={x} y1={y} x2={x + L.off[0]} y2={y + L.off[1]} stroke={WP.amberLit} strokeWidth={2} opacity={t * 0.6} />
                <LandPlate x={x + L.off[0]} y={y + L.off[1]} text={L.name} t={easeOut(seg(f, at + 8, at + 30))} />
              </>
            )}
          </g>
        );
      })}
      {/* 5つ目。まだ名前も線もない */}
      {fifthAt !== undefined &&
        (() => {
          const t = easeOut(seg(f, fifthAt, fifthAt + 30));
          if (t <= 0) return null;
          const [x, y] = gpt(8);
          return (
            <g>
              <circle cx={x} cy={y + 150} r={60 * t} fill={`url(#${uid}-lamp)`} opacity={0.3} />
              <circle cx={x} cy={y + 150} r={7 * t} fill={WP.amberLit} opacity={0.9} />
              <circle cx={x} cy={y + 150} r={20} fill="none" stroke={WP.amberLit} strokeWidth={2} opacity={t * 0.4} />
            </g>
          );
        })()}
    </g>
  );
};

// ===================================================================
// 部品4: 毒の杯 SekaiCup   #12 / #21
// ===================================================================
// 黒い液面に光と輪郭が映る。金の縁。差し出す手は影。
// #21 では持つ手がなく、液面に演説台が映る。

export const SekaiCup: React.FC<{
  x: number;
  y: number;
  s?: number;
  f: number;
  uid: string;
  /** 差し出す影の手。省略すると手が無い (#21) */
  hands?: boolean;
  /** 液面に映すもの */
  reflect?: "self" | "podium" | "none";
}> = ({ x, y, s = 1, f, uid, hands = true, reflect = "self" }) => {
  const wob = Math.sin(f / 19) * 3;
  const sheen = 0.5 + Math.sin(f / 23) * 0.22;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${uid}-cupgold`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#F2C878" />
          <stop offset="40%" stopColor="#C08A3C" />
          <stop offset="100%" stopColor="#5E3C16" />
        </linearGradient>
        <radialGradient id={`${uid}-liquid`} cx="46%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#241B14" />
          <stop offset="70%" stopColor="#0C0907" />
          <stop offset="100%" stopColor="#060403" />
        </radialGradient>
        <clipPath id={`${uid}-bowl`}>
          <ellipse cx={0} cy={0} rx={196} ry={62} />
        </clipPath>
      </defs>
      {/* 差し出す腕と手のひら。椀より奥なので先に描く */}
      {hands &&
        [-1, 1].map((d) => (
          <g key={d}>
            <path
              d={`M ${d * 232},70 L ${d * 326},26 L ${d * 540},560 L ${d * 356},600 Z`}
              fill={WP.shadowDeep}
              stroke={WP.rim}
              strokeWidth={3}
            />
            <ellipse cx={d * 238} cy={34} rx={96} ry={88} fill={WP.shadowDeep} stroke={WP.rim} strokeWidth={3} />
          </g>
        ))}
      {/* 脚と台 */}
      <path d="M -34,128 L -22,250 L -96,268 L -108,300 L 108,300 L 96,268 L 22,250 L 34,128 Z" fill={`url(#${uid}-cupgold)`} stroke={WP.line} strokeWidth={4} />
      <ellipse cx={0} cy={300} rx={134} ry={26} fill={`url(#${uid}-cupgold)`} stroke={WP.line} strokeWidth={4} />
      <ellipse cx={6} cy={326} rx={160} ry={18} fill="#000" opacity={0.34} />
      {/* 椀 */}
      <path d="M -196,0 C -196,86 -110,138 0,138 C 110,138 196,86 196,0 Z" fill={`url(#${uid}-cupgold)`} stroke={WP.line} strokeWidth={4.4} />
      {/* 彫り */}
      <g opacity={0.4}>
        {[-130, -66, 0, 66, 130].map((dx) => (
          <path key={dx} d={`M ${dx},10 C ${dx * 0.9},56 ${dx * 0.6},94 ${dx * 0.3},126`} fill="none" stroke="#3E2810" strokeWidth={3} />
        ))}
      </g>
      {/* 液面 */}
      <ellipse cx={0} cy={0} rx={196} ry={62} fill={`url(#${uid}-liquid)`} />
      <g clipPath={`url(#${uid}-bowl)`}>
        {/* 天井の明かり */}
        <ellipse cx={-52 + wob} cy={-22} rx={54} ry={15} fill={WP.glow} opacity={0.3 * sheen} />
        <ellipse cx={-52 + wob} cy={-22} rx={22} ry={6} fill="#FFF6DC" opacity={0.6 * sheen} />
        {reflect === "self" && (
          // 自分の輪郭が映る。顔は描かない
          <>
            <ellipse cx={58} cy={16 + wob * 0.4} rx={28} ry={11} fill={WP.rim} opacity={0.2} />
            <path d={`M 24,42 C 30,${12 + wob * 0.5} 86,${12 + wob * 0.5} 92,42 Z`} fill={WP.rim} opacity={0.14} />
          </>
        )}
        {reflect === "podium" && (
          // 空の演説台が映る。マイクの細い棒だけでそれと分かる
          <>
            <rect x={38} y={6} width={70} height={44} fill={WP.rim} opacity={0.17} />
            <line x1={73} y1={6} x2={73} y2={-26} stroke={WP.rim} strokeWidth={4} opacity={0.3} />
            <circle cx={73} cy={-30} r={8} fill={WP.rim} opacity={0.3} />
          </>
        )}
      </g>
      {/* 金の縁。ここだけ強く光らせる */}
      <ellipse cx={0} cy={0} rx={196} ry={62} fill="none" stroke={`url(#${uid}-cupgold)`} strokeWidth={13} />
      <ellipse cx={0} cy={0} rx={196} ry={62} fill="none" stroke={WP.line} strokeWidth={3} />
      <path d="M -170,-24 C -130,-54 -40,-62 20,-56" fill="none" stroke="#FFE7B0" strokeWidth={5} opacity={0.7} strokeLinecap="round" />
    </g>
  );
};

// ===================================================================
// 部品5: 演説台 SekaiPodium   #11 / #17 / #21
// ===================================================================
// 台とマイクと垂れ幕だけ。立つ人物は各担当が影で足す (顔は描かない)。

export const SekaiPodium: React.FC<{
  x: number;
  y: number;
  s?: number;
  f: number;
  uid: string;
  mic?: boolean;
  drape?: boolean;
  /** 垂れ幕の文字 (読ませる気はないので短く) */
  drapeText?: string;
}> = ({ x, y, s = 1, f, uid, mic = true, drape = true, drapeText }) => {
  const wind = Math.sin(f / 26) * 7;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${uid}-pod`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#2E231B" />
          <stop offset="100%" stopColor="#0E0A07" />
        </linearGradient>
      </defs>
      {/* 床に伸びる長い影 */}
      <path d="M -230,300 L 230,300 L 420,470 L -420,470 Z" fill={WP.shadowDeep} opacity={0.55} />
      {/* 台 */}
      <path d="M -210,-60 L 210,-60 L 184,300 L -184,300 Z" fill={`url(#${uid}-pod)`} stroke={WP.line} strokeWidth={4.4} />
      <rect x={-226} y={-82} width={452} height={30} rx={5} fill={WP.wood} stroke={WP.line} strokeWidth={4} />
      <path d="M -226,-82 L 226,-82 L 226,-72 L -226,-72 Z" fill={WP.rim} opacity={0.5} />
      {/* 垂れ幕。風で揺れる */}
      {drape && (
        <g>
          <path
            d={`M -168,-30 L 168,-30 L ${168 + wind * 0.5},240 C 96,${264 + wind} -96,${216 - wind} ${-168 - wind * 0.5},240 Z`}
            fill={WP.sabiDeep}
            stroke={WP.line}
            strokeWidth={3.4}
          />
          <path d={`M -150,10 L 150,10`} stroke={WP.amber} strokeWidth={4} opacity={0.6} />
          <path d={`M -150,196 L ${150 + wind * 0.4},196`} stroke={WP.amber} strokeWidth={4} opacity={0.6} />
          {drapeText && (
            <text
              x={0}
              y={118}
              fontFamily={SEKAI_SERIF}
              fontSize={62}
              fontWeight={700}
              fill={WP.kinari}
              textAnchor="middle"
              opacity={0.82}
              letterSpacing={10}
            >
              {drapeText}
            </text>
          )}
        </g>
      )}
      {/* マイク2本 */}
      {mic &&
        [-54, 46].map((dx, i) => (
          <g key={dx}>
            <path d={`M ${dx},-78 C ${dx + (i ? 12 : -12)},-150 ${dx + (i ? 20 : -20)},-196 ${dx + (i ? 26 : -26)},-226`} fill="none" stroke={WP.shadowDeep} strokeWidth={9} strokeLinecap="round" />
            <path d={`M ${dx},-78 C ${dx + (i ? 12 : -12)},-150 ${dx + (i ? 20 : -20)},-196 ${dx + (i ? 26 : -26)},-226`} fill="none" stroke={WP.rim} strokeWidth={2.6} strokeLinecap="round" opacity={0.7} />
            <ellipse cx={dx + (i ? 30 : -30)} cy={-242} rx={21} ry={25} fill={WP.shadowDeep} stroke={WP.rim} strokeWidth={3} />
            <ellipse cx={dx + (i ? 30 : -30)} cy={-242} rx={11} ry={14} fill="none" stroke={WP.rim} strokeWidth={1.8} opacity={0.5} />
          </g>
        ))}
    </g>
  );
};

// ===================================================================
// 部品6: 錆朱の×   #26 / #35 / #36
// ===================================================================
// 「違う」「もういない」を一筆で出す。2本の線が順に引かれる。

export const CrossMark: React.FC<{
  x: number;
  y: number;
  r?: number;
  f: number;
  at?: number;
  w?: number;
}> = ({ x, y, r = 120, f, at = 0, w = 16 }) => {
  const a = easeOut(seg(f, at, at + 14));
  const b = easeOut(seg(f, at + 10, at + 26));
  return (
    <g transform={`translate(${x} ${y})`} strokeLinecap="round">
      <line x1={-r} y1={-r} x2={-r + 2 * r * a} y2={-r + 2 * r * a} stroke={WP.sabi} strokeWidth={w} opacity={a} />
      <line x1={r} y1={-r} x2={r - 2 * r * b} y2={-r + 2 * r * b} stroke={WP.sabi} strokeWidth={w} opacity={b} />
    </g>
  );
};
