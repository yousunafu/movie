// 「旅とお土産の歴史」: ブロック2 = 第3章 + 第4章 (江戸・伊勢参り・伊勢講・御師)。
// 担当範囲: 台本 docs/tabi-miyage-script-v1.txt の 55〜97行目 (文#54〜#96・43文)。
// motif 名は必ず tb2_ で始める。WobbleDefs の seed はこのファイルでは 500〜599 を使う。
// このファイルを編集してよいのはブロック2担当だけ (共有部品は TabiShared/TabiKits/TabiTravel から import)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, TBadge, ChapterDoor } from "./TabiShared";
import {
  TKP, KaidoBg, MatsuTree, Shukuba, ShinmeiTorii,
  EdoTraveler, OnshiPerson, OfudaTag, TegataCard, KouChoubou, SenbetsuPack,
  YuYado, YukataPerson,
} from "./TabiKits";
import { KaidoScroll } from "./TabiTravel";
import {
  GOKAIDO, WAKIKAIDO, JapanCoast, KaidoLabel, KaidoLegend, TjPin,
  tjHead, tjPartial, tjmapXY,
} from "./TabiJapanMap";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Person / EdoTraveler と同じゆれ式 (かぶせ物を同期させる)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== シーンの共通ガワ: クリーム紙地 + ゆらぎ + バッジ + 質感 =====
// zoom: カメラ寄り (zx,zy を中心に拡大)。over = Stamp などの div を重ねる口。
const Frame: React.FC<{
  f: number; seed: number; caption?: string; capX?: number; capY?: number;
  zoom?: number; zx?: number; zy?: number;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, capX = 960, capY = 170, zoom = 1, zx = 960, zy = 540, over, children }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g transform={zoom !== 1 ? `translate(${zx} ${zy}) scale(${zoom}) translate(${-zx} ${-zy})` : undefined}>
        <g filter="url(#wobble)">{children}</g>
      </g>
    </svg>
    {over}
    {caption && <LabelPill x={capX} y={capY} centerX text={caption} />}
    <TBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 小物キット (WatashiB1 の流儀) =====
// 木札風ラベル (svg内。中央寄せ)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string; fill?: string;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ふきだし (svg内)
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; tailTo?: [number, number];
  text?: string; size?: number; t?: number; color?: string;
}> = ({ x, y, w, h, tailTo, text, size = 38, t = 1, color = KRP.ink }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      {tailTo && (
        <polygon points={`-14,${h / 2 - 8} 14,${h / 2 - 8} ${tailTo[0] - x},${tailTo[1] - y}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {tailTo && (
        <polygon points={`-13,${h / 2 - 10} 13,${h / 2 - 10} ${(tailTo[0] - x) * 0.96},${(tailTo[1] - y) * 0.92}`}
          fill={KRP.white} />
      )}
      {text && (
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={size} fill={color}>{text}</text>
      )}
    </g>
  );
};

// びっくり放射線
const Burst: React.FC<{ x: number; y: number; r?: number; color?: string; t?: number; n?: number }> =
  ({ x, y, r = 60, color = KRP.orange, t = 1, n = 10 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g transform={`translate(${x} ${y})`} opacity={tt}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + 0.25;
          return (
            <line key={i} x1={Math.cos(a) * r * 0.62} y1={Math.sin(a) * r * 0.62}
              x2={Math.cos(a) * r * (0.62 + 0.38 * tt)} y2={Math.sin(a) * r * (0.62 + 0.38 * tt)}
              stroke={color} strokeWidth={7} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

// ○と✕ (判定マーク)
const Maru: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  return sc <= 0 ? null : (
    <circle cx={x} cy={y} r={34 * s * sc} fill="none" stroke={KRP.red} strokeWidth={10 * s} />
  );
};
const Batsu: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  return sc <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}
      stroke={KRP.blueDeep} strokeWidth={11} strokeLinecap="round">
      <line x1={-30} y1={-30} x2={30} y2={30} />
      <line x1={30} y1={-30} x2={-30} y2={30} />
    </g>
  );
};

// ===== この回の登場人物・舞台 (使い回し) =====
// 村人: Person + 着物の襟 + 帯 + ちょんまげ (江戸の庶民)
const Murabito: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; cloth?: string; gaze?: [number, number];
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", cloth = TKP.yukata, gaze = [0, 0] }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={cloth} clothDark={cloth} hair="none" gaze={gaze} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <path d="M -24 -160 L 10 -112 L 34 -160" fill="none" stroke={KRP.white} strokeWidth={7} />
        <rect x={-58} y={-102} width={116} height={18} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 髷 */}
        <path d="M -52 -250 Q 0 -274 52 -250 Q 26 -262 0 -262 Q -26 -262 -52 -250 Z" fill={KRP.ink} />
        <rect x={-6} y={-294} width={12} height={32} rx={6} fill={KRP.ink} transform="rotate(-16 0 -280)" />
      </g>
    </g>
  );
};

// 寛永通宝風の銭 (穴あき)
const Zeni: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={0} r={24} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={-7.5} y={-7.5} width={15} height={15} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// 関所の門 (柱 + 冠木 + 柵)。門は画面中央に置き、柵は span まで = 画面の外まで伸ばす。
const SekishoGate: React.FC<{ x: number; y: number; s?: number; span?: number }> = ({
  x, y, s = 1, span = 1120,
}) => {
  const n = Math.max(2, Math.floor((span - 210) / 88)); // 柵の支柱の本数 (片側)
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 左右の柵 (画面外まで続く) */}
      {[-1, 1].map((d) => (
        <g key={d}>
          {Array.from({ length: n }, (_, i) => {
            const px = 210 + i * 88;
            return (
              <line key={i} x1={d * px} y1={2} x2={d * px + d * 14} y2={-126}
                stroke={TKP.woodDark} strokeWidth={13} strokeLinecap="round" />
            );
          })}
          <line x1={d * 196} y1={-96} x2={d * span} y2={-76}
            stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
          <line x1={d * 196} y1={-46} x2={d * span} y2={-26}
            stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
        </g>
      ))}
      {/* 門柱 + 冠木 + 小屋根 */}
      <rect x={-186} y={-280} width={32} height={280} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={154} y={-280} width={32} height={280} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-216} y={-312} width={432} height={34} rx={6} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -240 -312 L 0 -352 L 240 -312 Z" fill={TKP.iron} stroke={KRP.ink} strokeWidth={5} />
      <text x={0} y={-326} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
        fill={KRP.white}>関所</text>
    </g>
  );
};

// 空っぽの布団 (抜け参り用)。敷布団 + 掛け布団 + 枕、掛け布団の上端がめくれて裏地が見える。
const NORI = "#2E3A33"; // 握り飯の海苔
const FUTON_COVER = "#48597A"; // 掛け布団の表 (紺の木綿)
const FUTON_LINING = "#E4EBF4"; // めくれた裏地 (白藍)
const FUTON_EDGE = "#B9452F"; // 敷布団の縁どり (茜)
const EmptyFuton: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const puff = Math.sin(f / 17) * 2; // ほんのり呼吸するような膨らみ
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 敷布団 (奥が狭いパース) */}
      <path d="M -246 -152 L 246 -152 L 310 66 L -310 66 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -224 -136 L 224 -136 L 282 50 L -282 50 Z"
        fill="none" stroke={FUTON_EDGE} strokeWidth={5} opacity={0.55} strokeLinejoin="round" />
      {/* 枕 (頭の側) */}
      <g>
        <rect x={-82} y={-142} width={164} height={58} rx={27}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -82 -113 L 82 -113" stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
      </g>
      {/* 掛け布団 (手前半分。近い辺はふっくら波打つ) */}
      <path d={`M -268 ${-48 + puff} L 268 ${-48 + puff} L 300 40 Q 150 ${72 + puff} 0 62 Q -150 ${72 - puff} -300 40 Z`}
        fill={FUTON_COVER} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 刺し子 (縫い目) */}
      {[-150, -50, 50, 150].map((qx) => (
        <line key={qx} x1={qx} y1={-40 + puff} x2={qx * 1.12} y2={52}
          stroke={FUTON_LINING} strokeWidth={3.5} opacity={0.4} />
      ))}
      {/* めくれた上端 = 裏地が見える */}
      <path d={`M -268 ${-48 + puff} L 268 ${-48 + puff} L 244 ${-100 + puff} L -244 ${-100 + puff} Z`}
        fill={FUTON_LINING} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      {/* 右手前の角だけ大きく折り返し = ここから抜け出した感じ */}
      <path d={`M 300 40 Q 306 -6 262 ${-30 + puff} Q 212 -2 186 64 Z`}
        fill={FUTON_LINING} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
    </g>
  );
};

// 高札場 (屋根つきの立て札)
const Kousatsu: React.FC<{ x: number; y: number; s?: number; lines?: string[] }> = ({
  x, y, s = 1, lines = ["一、みだりに領地を", "　　離れるべからず"],
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-120} y1={0} x2={-120} y2={-330} stroke={TKP.woodDark} strokeWidth={16} strokeLinecap="round" />
    <line x1={120} y1={0} x2={120} y2={-330} stroke={TKP.woodDark} strokeWidth={16} strokeLinecap="round" />
    <path d="M -200 -330 L 0 -392 L 200 -330 Z" fill={TKP.iron} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={-170} y={-326} width={340} height={210} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
    <text x={0} y={-272} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>定</text>
    {lines.map((ln, i) => (
      <text key={i} x={-150} y={-218 + i * 44} fontFamily={FONT} fontWeight={800} fontSize={30}
        fill={KRP.ink} opacity={0.85}>{ln}</text>
    ))}
  </g>
);

// 村の寄り合い舞台 (畳の間 + 障子 + 行灯)。#78〜#87 の連続シーンの共通ベース
const YoriaiStage: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 障子の壁 */}
    <rect x={-20} y={-20} width={W + 40} height={720} fill={KRP.paper} opacity={0.5} />
    {[260, 660, 1060, 1460].map((sx) => (
      <g key={sx} stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
        <rect x={sx} y={120} width={320} height={560} fill={KRP.white} opacity={0.75} />
        {[1, 2, 3].map((i) => <line key={i} x1={sx} y1={120 + i * 140} x2={sx + 320} y2={120 + i * 140} />)}
        <line x1={sx + 160} y1={120} x2={sx + 160} y2={680} />
      </g>
    ))}
    {/* 鴨居と柱 */}
    <rect x={-20} y={84} width={W + 40} height={34} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={120} y={84} width={30} height={620} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={1770} y={84} width={30} height={620} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 畳 */}
    <rect x={-20} y={690} width={W + 40} height={410} fill={TKP.tuscany} opacity={0.65} />
    <line x1={-20} y1={690} x2={W + 20} y2={690} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
    <line x1={640} y1={690} x2={520} y2={1100} stroke={KRP.ink} strokeWidth={4} opacity={0.25} />
    <line x1={1280} y1={690} x2={1400} y2={1100} stroke={KRP.ink} strokeWidth={4} opacity={0.25} />
    {/* 行灯 (ほのかに明滅) */}
    <g transform="translate(220 860)">
      <rect x={-44} y={-150} width={88} height={130} rx={8} fill={KRP.white} opacity={0.9}
        stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={-86} r={26} fill={KRP.yellow} opacity={0.55 + Math.sin(f / 9) * 0.1} />
      <line x1={-44} y1={-20} x2={44} y2={-20} stroke={TKP.woodDark} strokeWidth={8} />
    </g>
  </g>
);

// =====================================================================
// 第3章 江戸の大発明 (#54〜#75)
// =====================================================================

// #54 時は江戸時代 (章扉): 東海道絵巻スクロールの上に第3章の題字
const SceneCh3Door: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <KaidoScroll f={f} speed={6} />
    <ChapterDoor num={3} title="江戸の大発明" t={seg(f, 12, 42)} left={1030} top={580} width={780} />
    <TBadge />
  </AbsoluteFill>
);

// #55 街道が整備された: 精巧な日本地図に、江戸 (日本橋) から街道が伸びる。
//
// 2026-11-01 作者指摘「東北・中国地方・九州・四国にも街道はなかったのか」への対応で、
// 二段構えにした。
//   前半 f4〜45   関東〜近畿に寄って五街道を1本ずつ引く (濃く太く・五色) …… 主役
//   後半 f46〜102 日本全体まで引いて脇街道を9本足す (細く淡く・墨1色) …… 全国に広がる
// このシーンの持ち時間は136フレーム。全部引き終わるのが遅いと「見る間もなく次へ」に
// なってしまうので、最後の薩摩街道が f94 に、札が f102 に出そろうよう詰めてある
// (旧版は最後の街道が f122 = 残り14フレームで、中国・四国・九州がほぼ映らなかった)。
// 日本列島は画面に収まる大きさ (z=1 で x648〜1278 / y180〜836) なので、寄りを解けば
// 北は青森から南は鹿児島まで1画面に入る。
//
// 札はズーム群の外 (画面座標) に置いて文字の大きさを一定に保つ。
// 札の座標は「海の上」「他の札・線と重ならない」を1枚ずつ検算してある。
const ZX = 1190, ZY = 560;   // 寄りの中心 (五街道が画面中央に来る点)
const ZMAX = 1.95;           // 寄りの倍率。これ以上寄ると東北と九州が画面から出る

// 五街道: [伸び始め, 伸び終わり]
const KAIDO_TIMING: Array<[number, number]> = [
  [10, 26], // 東海道
  [16, 32], // 中山道
  [22, 37], // 甲州道中
  [26, 41], // 日光道中
  [30, 45], // 奥州道中
];
// 五街道の札 (寄っているあいだだけ出す。引きに戻るとき消える)
const KAIDO_LABEL_POS: Array<{ x: number; y: number; tail: [number, number] }> = [
  { x: 909, y: 724, tail: [940, 660] }, // 東海道 (遠州灘の上)
  { x: 715, y: 513, tail: [806, 564] }, // 中山道 (若狭沖 → 関ケ原)
  { x: 1040, y: 419, tail: [991, 506] }, // 甲州道中 (信濃の北 → 諏訪)
  { x: 1354, y: 404, tail: [1145, 401] }, // 日光道中 (常陸沖 → 日光)
  { x: 1441, y: 277, tail: [1192, 352] }, // 奥州道中 (陸奥沖 → 白河)
];

// 脇街道: [伸び始め, 伸び終わり] と 札の位置・引き出し線の先 (すべて引き= z1 の画面座標)
const WAKI_TIMING: Array<[number, number]> = [
  [56, 74], // 奥州街道 (白河から先)
  [59, 77], // 羽州街道
  [62, 79], // 北国街道
  [64, 81], // 北陸道
  [66, 84], // 山陽道
  [68, 86], // 山陰道
  [71, 89], // 金毘羅・土佐街道
  [73, 91], // 長崎街道
  [76, 94], // 薩摩街道
];
const WAKI_LABEL_POS: Array<{ x: number; y: number; size: number; tail: [number, number] }> = [
  { x: 1560, y: 300, size: 26, tail: [1232, 296] }, // 奥州街道 → 盛岡 (三陸沖)
  { x: 1040, y: 250, size: 26, tail: [1179, 295] }, // 羽州街道 → 久保田 (男鹿の沖)
  { x: 1085, y: 340, size: 26, tail: [1085, 453] }, // 北国街道 → 直江津 (越後沖を真下へ)
  // 以下5枚は旧版で引き出し線が画面を横切るほど長く、どこを指しているか分からなかったので、
  // 指す先の近くへ寄せた (2026-11-01)。いずれも海の上・札どうしは縦に60px以上あける。
  { x: 806, y: 392, size: 26, tail: [1006, 491] },  // 北陸道 → 金沢 (能登の北西沖)
  { x: 430, y: 630, size: 26, tail: [719, 652] },   // 山陽道 → 下関 (響灘のさらに西)
  { x: 566, y: 520, size: 26, tail: [775, 600] },   // 山陰道 → 浜田 (日本海)
  { x: 900, y: 758, size: 22, tail: [848, 677] },   // 金毘羅・土佐街道 → 高知 (土佐湾)
  { x: 468, y: 706, size: 26, tail: [686, 697] },   // 長崎街道 → 佐賀 (玄界灘)
  { x: 455, y: 782, size: 26, tail: [706, 742] },   // 薩摩街道 → 八代 (東シナ海)
];

const SceneKaidoSeibi: React.FC<{ f: number }> = ({ f }) => {
  // 寄って (f4〜28)、五街道を引いて、また引く (f58〜80)
  const zin = easeOut(seg(f, 4, 24));
  const zout = easeOut(seg(f, 46, 66));
  const z = 1 + (ZMAX - 1) * (zin - zout);
  const zoomT = `translate(${ZX} ${ZY}) scale(${z}) translate(${-ZX} ${-ZY})`;
  const draw = clamp01(seg(f, 0, 12)); // 地図そのものが現れる
  const goFade = 1 - clamp01(seg(f, 44, 54)); // 五街道の札が消える
  return (
    <Frame f={f} seed={501} caption="街道の整備" capY={92}>
      {/* 海 (ズームの外。画面いっぱい) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.5} />
      <g transform={zoomT}>
        <JapanCoast sw={4.5 / z} opacity={draw} />
        {/* 脇街道 (五街道の下に敷いて、五街道が必ず上に乗るようにする) */}
        {WAKIKAIDO.map((k, i) => {
          const [a, b] = WAKI_TIMING[i];
          const t = easeOut(seg(f, a, b));
          if (t <= 0) return null;
          const head = tjHead(k.pts, t);
          return (
            <g key={k.key}>
              {/* 海岸線の上を通る区間が多いので、白の下敷きを広めに取って線を浮かせる */}
              <path d={tjPartial(k.pts, t)} fill="none" stroke={KRP.white}
                strokeWidth={10 / z} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
              <path d={tjPartial(k.pts, t)} fill="none" stroke={k.color}
                strokeWidth={4.4 / z} strokeLinecap="round" strokeLinejoin="round" />
              {/* 下津井→丸亀は金毘羅船の海路なので点線 */}
              {k.seaSeg && t >= 1 && (
                <path d={tjPartial(k.pts.slice(k.seaSeg[0], k.seaSeg[1] + 1), 1)} fill="none"
                  stroke={k.color} strokeWidth={4.4 / z} strokeDasharray={`${7 / z} ${6 / z}`} />
              )}
              {t < 1 && <circle cx={head[0]} cy={head[1]} r={7 / z} fill={k.color}
                stroke={KRP.white} strokeWidth={2.5 / z} />}
            </g>
          );
        })}
        {/* 五街道 (江戸から1本ずつ伸びる) */}
        {GOKAIDO.map((k, i) => {
          const [a, b] = KAIDO_TIMING[i];
          const t = easeOut(seg(f, a, b));
          if (t <= 0) return null;
          const head = tjHead(k.pts, t);
          return (
            <g key={k.key}>
              {/* 下敷きの白線で、重なった街道どうしを見分けやすくする */}
              <path d={tjPartial(k.pts, t)} fill="none" stroke={KRP.white}
                strokeWidth={10 / z} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
              <path d={tjPartial(k.pts, t)} fill="none" stroke={k.color}
                strokeWidth={5.5 / z} strokeLinecap="round" strokeLinejoin="round" />
              {/* 宮→桑名は海路 (七里の渡し) なので、その区間だけ点線で上書き */}
              {k.seaSeg && t >= 1 && (
                <path d={tjPartial(k.pts.slice(k.seaSeg[0], k.seaSeg[1] + 1), 1)} fill="none"
                  stroke={k.color} strokeWidth={5.5 / z} strokeDasharray={`${9 / z} ${8 / z}`} />
              )}
              {/* 先端の点 */}
              {t < 1 && <circle cx={head[0]} cy={head[1]} r={9 / z} fill={k.color}
                stroke={KRP.white} strokeWidth={3.5 / z} />}
            </g>
          );
        })}
        {/* 起点の江戸 (日本橋) と終点の京都 */}
        {draw > 0.9 && (
          <g>
            <TjPin lon={135.772} lat={35.009} r={8 / z} sw={4 / z} />
            <circle cx={tjmapXY(139.774, 35.684)[0]} cy={tjmapXY(139.774, 35.684)[1]}
              r={13 / z} fill={KRP.white} stroke={KRP.red} strokeWidth={5.5 / z} />
          </g>
        )}
      </g>

      {/* --- 前半: 五街道の札 (寄っているあいだだけ) --- */}
      {GOKAIDO.map((k, i) => {
        const [, b] = KAIDO_TIMING[i];
        const p = KAIDO_LABEL_POS[i];
        return (
          <KaidoLabel key={k.key} x={p.x} y={p.y} text={k.name} color={k.color}
            size={32} t={seg(f, b - 4, b + 5) * goFade} tailTo={p.tail} />
        );
      })}
      <KaidoLabel x={1254} y={591} text="江戸（日本橋）" color={KRP.ink} size={27}
        t={seg(f, 12, 22) * goFade} tailTo={[1141, 534]} />
      <KaidoLabel x={652} y={559} text="京都" color={KRP.ink} size={27}
        t={seg(f, 26, 36) * goFade} tailTo={[735, 606]} />

      {/* --- 後半: 脇街道の札 + 凡例 (引きに戻ってから) --- */}
      {WAKIKAIDO.map((k, i) => {
        const [, b] = WAKI_TIMING[i];
        const p = WAKI_LABEL_POS[i];
        return (
          <KaidoLabel key={k.key} x={p.x} y={p.y} text={k.name} color={k.color}
            size={p.size} t={seg(f, b - 2, b + 8)} tailTo={p.tail} sub />
        );
      })}
      <KaidoLabel x={1400} y={468} text="五街道" color={KRP.red} size={28}
        t={seg(f, 70, 82)} tailTo={[1175, 505]} />
      <KaidoLabel x={1330} y={560} text="江戸" color={KRP.ink} size={26}
        t={seg(f, 70, 82)} tailTo={[1168, 548]} sub />
      <KaidoLegend x={1500} y={640} t={seg(f, 74, 86)} />
    </Frame>
  );
};

// #56 旅は原則自由ではない: 関所の門前で旅人が止められ、大きな✕
const SceneSekishoBatsu: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={502} caption="旅は原則、不自由" capX={430} capY={120}>
      <KaidoBg f={f} fuji={false} />
      {/* 関所は画面中央。柵は左右の画面外まで伸ばして「どこも通れない」を見せる */}
      <SekishoGate x={960} y={884} s={1.06} span={1120} />
      <Murabito x={1250} y={878} s={0.92} f={f} phase={2} face="normal" cloth={TKP.night} gaze={[-5, 0]} />
      <EdoTraveler x={lerp(300, 672, walk)} y={890} s={1.0} f={f} face="worried" />
      <Batsu x={960} y={286} s={2.6} t={seg(f, 42, 62)} />
    </Frame>
  );
};

// #57 勝手に領地を離れてはいけない建前: 高札場を読む村人たち
const SceneKousatsuTatemae: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={503} zoom={1 + easeOut(seg(f, 20, 90)) * 0.08} zx={960} zy={560}
    over={<Stamp x={1310} y={250} text="建前" size={54} />}>
    <KaidoBg f={f} />
    <Kousatsu x={880} y={880} s={1.18} />
    <Murabito x={520} y={886} s={0.98} f={f} phase={1} face="worried" gaze={[5, -3]} />
    <Murabito x={1300} y={890} s={0.94} f={f} phase={4} face="normal" cloth={TKP.noren} gaze={[-5, -3]} />
  </Frame>
);

// #58 例外がふたつ: 「？」の札が2枚ぽんぽんと出る
const SceneReigaiFutatsu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={504} caption="例外は ふたつだけ" capY={120}>
    <KaidoBg f={f} fuji={false} />
    {[0, 1].map((i) => {
      const t = seg(f, 16 + i * 18, 40 + i * 18);
      const sc = pop(clamp01(t));
      const bx = 620 + i * 680;
      return sc <= 0 ? null : (
        <g key={i} transform={`translate(${bx} ${520 + bobOf(f, i * 3)}) scale(${sc})`}>
          <rect x={-180} y={-200} width={360} height={400} rx={22} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={7} />
          <text x={0} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={44} fill={KRP.grayDark}>{`例外${i === 0 ? "①" : "②"}`}</text>
          <text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={170} fill={KRP.orange}>?</text>
        </g>
      );
    })}
    <Murabito x={960} y={980} s={0.7} f={f} phase={2} face="surprised" gaze={[0, -6]} />
  </Frame>
);

// #59 お参りと湯治: ？札がめくれて鳥居と湯けむりに
const SceneOmairiTouji: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={505}>
    <KaidoBg f={f} fuji={false} />
    {[0, 1].map((i) => {
      const t = seg(f, 10 + i * 20, 34 + i * 20);
      const sc = pop(clamp01(t));
      const bx = 620 + i * 680;
      return sc <= 0 ? null : (
        <g key={i} transform={`translate(${bx} ${520 + bobOf(f, i * 3)}) scale(${sc})`}>
          <rect x={-180} y={-200} width={360} height={400} rx={22} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={7} />
          {i === 0 ? (
            <g>
              <ShinmeiTorii x={0} y={110} s={0.72} />
              <text x={0} y={178} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={42} fill={KRP.ink}>お参り</text>
            </g>
          ) : (
            <g>
              <path d="M -90 60 Q 0 112 90 60 L 76 104 Q 0 140 -76 104 Z"
                fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
              <g fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.75}>
                <path d={`M -44 30 Q -58 ${2 - Math.sin(f / 10) * 5} -44 -26 Q -32 -48 -42 -70`} />
                <path d={`M 2 36 Q -12 ${8 + Math.sin(f / 10) * 5} 2 -20 Q 14 -42 4 -64`} />
                <path d={`M 48 30 Q 34 ${2 - Math.sin(f / 10) * 5} 48 -26 Q 60 -48 50 -70`} />
              </g>
              <text x={0} y={178} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={42} fill={KRP.ink}>湯治</text>
            </g>
          )}
        </g>
      );
    })}
    <Murabito x={960} y={980} s={0.7} f={f} phase={2} face="smile" gaze={[0, -6]} />
  </Frame>
);

// #60 「遊びに行きます」は通らない: 門番にそう言ったら✕
const SceneAsobiBatsu: React.FC<{ f: number }> = ({ f }) => (
  // #56 より少し寄って、門番と旅人のやりとりを見せる (同じ絵の繰り返しに見せない)
  <Frame f={f} seed={506} zoom={1.1 + easeOut(seg(f, 0, 70)) * 0.06} zx={960} zy={700}>
    <KaidoBg f={f} fuji={false} />
    <SekishoGate x={960} y={884} s={1.0} span={1120} />
    <Murabito x={1252} y={878} s={0.9} f={f} phase={2} cloth={TKP.night} gaze={[-5, 0]}
      face={f > 50 ? "worried" : "normal"} />
    <EdoTraveler x={666} y={892} s={1.0} f={f} face="smile" />
    <Bubble x={470} y={372} w={520} h={120} tailTo={[640, 580]} text="遊びに行きます！"
      size={46} t={seg(f, 8, 28)} />
    <Batsu x={1420} y={356} s={2.0} t={seg(f, 48, 66)} />
  </Frame>
);

// #61 「お伊勢参りに行きます」なら通る: 手形を見せて○
const SceneIseMaru: React.FC<{ f: number }> = ({ f }) => {
  const show = seg(f, 30, 48);
  return (
    // #60 と対になる構図。こちらは門をくぐれるので、カメラは門の正面に据える
    <Frame f={f} seed={507} zoom={1.08} zx={960} zy={720}>
      <KaidoBg f={f} fuji={false} />
      <SekishoGate x={960} y={884} s={1.0} span={1120} />
      <Murabito x={1252} y={878} s={0.9} f={f} phase={2} cloth={TKP.night} gaze={[-5, 0]}
        face={f > 60 ? "smile" : "normal"} />
      <EdoTraveler x={666} y={892} s={1.0} f={f} face="smile" />
      <Bubble x={482} y={352} w={600} h={120} tailTo={[640, 580]} text="お伊勢参りに行きます"
        size={44} t={seg(f, 6, 26)} />
      {show > 0 && <g opacity={clamp01(show)}>
        <TegataCard x={836} y={lerp(720, 648, easeOut(show))} s={0.9} rot={-6} />
      </g>}
      <Maru x={1420} y={356} s={2.0} t={seg(f, 56, 74)} />
    </Frame>
  );
};

// #62 人々の答えはもうお分かりですね: 旅人がにやり、吹き出しに鳥居
const SceneKotae: React.FC<{ f: number }> = ({ f }) => {
  const th = seg(f, 20, 44);
  return (
    <Frame f={f} seed={508} caption="答えは ひとつ" capX={430} capY={120}
      zoom={1 + easeOut(seg(f, 10, 80)) * 0.1} zx={960} zy={600}>
      <KaidoBg f={f} />
      <EdoTraveler x={880} y={900} s={1.25} f={f} face="smile" />
      {th > 0 && (
        <g opacity={clamp01(th)}>
          <circle cx={1180} cy={560} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1240} cy={500} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <g transform={`translate(1420 380) scale(${pop(clamp01(th))}) translate(-1420 -380)`}>
            <ellipse cx={1420} cy={380} rx={210} ry={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <ShinmeiTorii x={1420} y={450} s={0.52} />
          </g>
        </g>
      )}
    </Frame>
  );
};

// #63 みんなお伊勢参りに行った: 鳥居へ向かう旅人の列
const SceneMinnaIse: React.FC<{ f: number }> = ({ f }) => {
  const m = easeOut(seg(f, 0, 90)) * 60;
  return (
    <Frame f={f} seed={509} caption="みんな伊勢へ" capX={330} capY={110}>
      <KaidoBg f={f} />
      <ShinmeiTorii x={1600} y={830} s={1.25} />
      <MatsuTree x={170} y={820} s={0.95} />
      {[0, 1, 2, 3].map((i) => (
        <EdoTraveler key={i} x={330 + i * 290 + m} y={900 - i * 8} s={1.02 - i * 0.09}
          f={f} phase={i * 2} face="smile" cloth={[TKP.noren, KRP.green, TKP.terracotta, TKP.yukata][i]} />
      ))}
      <Burst x={1600} y={470} r={80} t={seg(f, 60, 80)} />
    </Frame>
  );
};

// #64 当時の川柳が残っています: まだ無地の木札がすとんと下りてくる
const SceneSenryuIntro: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 10, 42));
  return (
    <Frame f={f} seed={510} caption="当時の川柳" capX={330} capY={110}>
      <KaidoBg f={f} fuji={false} />
      <g transform={`translate(960 ${lerp(-560, 150, drop)}) rotate(${(1 - drop) * 6})`}>
        <rect x={-190} y={0} width={380} height={620} rx={14} fill={KRP.cream}
          stroke={KRP.ink} strokeWidth={8} />
        <circle cx={0} cy={54} r={16} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={60} fill={KRP.grayDark} opacity={0.6}>…</text>
      </g>
      <Murabito x={400} y={930} s={0.95} f={f} phase={1} face="surprised" gaze={[6, -5]} />
      <Murabito x={1510} y={936} s={0.9} f={f} phase={4} face="normal" cloth={TKP.noren} gaze={[-6, -5]} />
    </Frame>
  );
};

// #65 「伊勢参り 大神宮にも ちょっと寄り」: 木札に縦書きで大きく (見せ場)
const SENRYU_COLS = ["伊勢参り", "大神宮にも", "ちょっと寄り"];
const SceneSenryu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={511} zoom={1 + easeOut(seg(f, 0, 100)) * 0.07} zx={960} zy={480}>
    <KaidoBg f={f} fuji={false} />
    <g transform="translate(960 130)">
      <rect x={-330} y={0} width={660} height={700} rx={16} fill={KRP.cream}
        stroke={KRP.ink} strokeWidth={9} />
      <circle cx={0} cy={52} r={16} fill="none" stroke={KRP.ink} strokeWidth={6} />
      {SENRYU_COLS.map((col, c) => {
        const cx = 190 - c * 180;
        return col.split("").map((ch, r) => {
          const t = seg(f, 6 + (c * 6 + r) * 3, 18 + (c * 6 + r) * 3);
          return (
            <text key={`${c}-${r}`} x={cx} y={168 + c * 40 + r * 82} textAnchor="middle"
              fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.ink}
              opacity={clamp01(t)}>{ch}</text>
          );
        });
      })}
    </g>
    <MatsuTree x={190} y={880} s={1.0} />
    <Murabito x={1650} y={880} s={0.92} f={f} phase={3} face="smile" gaze={[-6, -4]} />
    <Burst x={960} y={100} r={90} t={seg(f, 70, 88)} />
  </Frame>
);

// #66 本命の神様が「ついで」: 大きな遊び vs 小さな鳥居
// 大小の対比をはっきりさせるための点線の囲み
const DashBox: React.FC<{ x1: number; y1: number; x2: number; y2: number; t?: number; color?: string }> =
  ({ x1, y1, x2, y2, t = 1, color = KRP.ink }) => {
    const o = clamp01(t);
    return o <= 0 ? null : (
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={24} fill="none"
        stroke={color} strokeWidth={5} strokeDasharray="16 13" opacity={o * 0.65} />
    );
  };

const SceneTsuide: React.FC<{ f: number }> = ({ f }) => (
  // 「大きい＝本命／小さい＝ついで」の逆転が一目で分かるよう、
  // 遊びの塊を大きく・神様を小さく囲って並べる。
  <Frame f={f} seed={512} caption="本命と ついで が 逆さま" capY={116}>
    <KaidoBg f={f} fuji={false} />
    {/* 左: 遊び (大きい = 実際の本命)
        2026-11-01 作者指摘で作り直し。
        ・芝居の幟をやめた (縦書きの字が回って読めず、旗1本では「遊び」が伝わらなかった)
        ・茶屋だけでは寂しいので、江戸の参詣でいちばん多かった「湯治 (温泉)」の湯宿と、
          実際に遊んでいる人を足して、通りがにぎわって見えるようにした */}
    <DashBox x1={170} y1={548} x2={1070} y2={874} t={seg(f, 10, 26)} color={KRP.orange} />
    <g transform={`translate(0 ${bobOf(f, 1) * 0.4})`}>
      <Shukuba x={430} y={848} s={0.82} sign="茶屋" />
      <YuYado x={856} y={848} s={0.78} />
      {/* 湯宿の湯けむり (屋根のむこうから立ちのぼる) */}
      {/* 空が淡いクリームなので、TKP.steam (ほぼ白) では消えてしまう。灰みのある白で描く */}
      <g opacity={0.8} stroke="#D3D8D2" fill="none" strokeLinecap="round">
        {/* 点線の囲み (上端 y=548) からはみ出さない高さで止める */}
        <path d={`M 800 640 C ${786 + Math.sin(f / 17) * 10} 614 ${824 + Math.sin(f / 13) * 10} 592 ${806 + Math.sin(f / 19) * 12} 566`}
          strokeWidth={24} />
        <path d={`M 916 646 C ${902 + Math.sin((f + 30) / 15) * 10} 620 ${940 + Math.sin(f / 12) * 9} 600 ${922 + Math.sin((f + 50) / 21) * 12} 578`}
          strokeWidth={19} />
      </g>
    </g>
    {/* 遊んでいる人 (茶屋の前で一服・湯宿へ向かう湯治客) */}
    <EdoTraveler x={262} y={856} s={0.74} f={f} phase={4} face="smile" />
    <YukataPerson x={668} y={858} s={0.74} f={f} phase={9} face="smile" gaze={[5, 0]} />
    <TagPlate x={560} y={326} text="遊び＝本命" size={46} t={seg(f, 18, 38)} fill={KRP.yellow} />
    {/* 右: 神様 (小さい = ついで扱い) */}
    <DashBox x1={1332} y1={652} x2={1672} y2={836} t={seg(f, 36, 52)} color={KRP.red} />
    <ShinmeiTorii x={1502} y={822} s={0.44} />
    <TagPlate x={1502} y={590} text="神様＝ついで" size={34} t={seg(f, 44, 64)} color={KRP.red} />
    {/* 本来の大きさは逆、を示す上下の矢印 */}
    <g opacity={clamp01(seg(f, 56, 72)) * 0.8}>
      <path d="M 1166 492 Q 1260 420 1352 540" fill="none" stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="15 12" strokeLinecap="round" />
      {/* 矢じりは曲線の終点での接線 (1352-1260, 540-420) に合わせて置く。
          旧版は決め打ちの三角で、線の向きとずれて折れ曲がって見えた (2026-11-01修正) */}
      <path d="M 1352 540 L 1321 524 L 1344 505 Z" fill={KRP.ink} />
    </g>
  </Frame>
);

// #67 自分で白状していた: 笑う江戸の人たち + 白状スタンプ
const SceneHakujou: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={513} over={<Stamp x={1250} y={220} text="自分で白状" size={56} />}>
    <KaidoBg f={f} />
    <Murabito x={620} y={910} s={1.1} f={f} phase={0} face="smile" gaze={[4, 2]} />
    <Murabito x={980} y={920} s={1.05} f={f} phase={3} face="smile" cloth={TKP.noren} gaze={[-4, 2]} />
    <g transform="translate(410 300) rotate(-6)">
      <rect x={-130} y={-30} width={260} height={330} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
      <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>伊勢参り</text>
      <text x={0} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink} opacity={0.75}>大神宮にも</text>
      <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink} opacity={0.75}>ちょっと寄り</text>
    </g>
    {/* 笑い声 */}
    {[0, 1, 2].map((i) => (
      <text key={i} x={760 + i * 160} y={480 - (i % 2) * 60 + Math.sin(f / 8 + i) * 8}
        fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.orange}
        opacity={clamp01(seg(f, 20 + i * 10, 36 + i * 10))}>ハハッ</text>
    ))}
  </Frame>
);

// #68 勢いあまって無断で旅立つ: 夜、こっそり抜け出す
const SceneMudan: React.FC<{ f: number }> = ({ f }) => {
  const sneak = easeOut(seg(f, 10, 80));
  return (
    <Frame f={f} seed={514} caption="こっそり…" capX={1430} capY={120}>
      {/* 夜の空気 */}
      <rect x={-20} y={-20} width={W + 40} height={740} fill={TKP.night} opacity={0.32} />
      <circle cx={1620} cy={210} r={74} fill={KRP.yellow} opacity={0.9} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1592} cy={196} r={60} fill={TKP.night} opacity={0.22} />
      <Shukuba x={430} y={840} s={1.2} sign="奉公先" />
      <g transform={`translate(${lerp(760, 1300, sneak)} 0)`}>
        <EdoTraveler x={0} y={900} s={1.0} f={f} face="normal" />
      </g>
      {/* 足音を忍ばせる記号 */}
      {[0, 1, 2].map((i) => (
        <text key={i} x={880 + i * 150} y={840} fontFamily={FONT} fontWeight={800} fontSize={34}
          fill={KRP.ink} opacity={clamp01(seg(f, 20 + i * 14, 34 + i * 14)) * 0.5}>そーっ</text>
      ))}
    </Frame>
  );
};

// #69 置き手紙ひとつで伊勢へ「抜け参り」: 畳の上の置き手紙
const SceneNukemairi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={515}>
    <YoriaiStage f={f} />
    {/* 畳の縁 (布団まわりだけ入れて和室らしさを足す) */}
    <g opacity={0.5}>
      <path d="M 628 690 L 652 690 L 538 1100 L 508 1100 Z" fill={TKP.night} />
      <path d="M 1268 690 L 1292 690 L 1414 1100 L 1386 1100 Z" fill={TKP.night} />
    </g>
    {/* 空っぽの布団 (敷布団 + 掛け布団 + 枕。掛け布団の上端がめくれている) */}
    <EmptyFuton x={606} y={872} s={0.96} f={f} />
    <TagPlate x={606} y={624} text="もぬけのから" size={34} t={seg(f, 28, 48)} />
    {/* 置き手紙 (ぽんと目立つ) */}
    <g transform={`translate(1270 ${lerp(560, 640, easeOut(seg(f, 8, 30)))}) rotate(-4) scale(${pop(seg(f, 8, 30))})`}>
      <rect x={-230} y={-140} width={460} height={280} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
      <text x={0} y={-58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.ink}>伊勢へ</text>
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.ink}>行ってきます</text>
      <line x1={-170} y1={76} x2={170} y2={76} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
    </g>
    <TagPlate x={1270} y={300} text="抜け参り" size={46} t={seg(f, 44, 64)} fill={KRP.yellow} />
  </Frame>
);

// #70 不思議なことにおとがめなし: 手紙を読む主人 + ○
const SceneOtogameNashi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={516}>
    <YoriaiStage f={f} />
    <Murabito x={700} y={940} s={1.15} f={f} phase={1} face="surprised" cloth={TKP.night} gaze={[4, -3]} />
    <g transform={`translate(990 ${700 + bobOf(f, 1)}) rotate(-6)`}>
      <rect x={-130} y={-86} width={260} height={172} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}>伊勢へ</text>
      <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}>行ってきます</text>
    </g>
    {/* ふきだしは主人の頭の上。しっぽは置き手紙の上を通して文字にかぶせない */}
    <Bubble x={1270} y={330} w={460} h={128} tailTo={[900, 608]} text="なら仕方ない"
      size={44} t={seg(f, 30, 50)} />
    <Maru x={1340} y={620} s={1.8} t={seg(f, 56, 74)} />
    <TagPlate x={430} y={300} text="おとがめなし" size={40} t={seg(f, 66, 86)} fill={KRP.yellow} />
  </Frame>
);

// #71 沿道の人々がタダ飯・タダ宿で応援: 施行 (せぎょう)
const SceneSegyou: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={517}>
    <KaidoBg f={f} />
    <Shukuba x={1460} y={840} s={1.1} sign="宿" />
    <EdoTraveler x={520} y={900} s={1.02} f={f} face="smile" />
    {/* 宿の主人。次の #72 にも同じ人が出るので、服は紺 (TKP.night) で固定する。
        旧版はここだけ朱 (terracotta) で、2枚つづけて見ると別人に見えた (2026-11-01 作者指摘)。
        旅人の藍 (TKP.noren) より濃いので、並んでも見分けはつく */}
    <Murabito x={1000} y={906} s={0.98} f={f} phase={3} face="smile" cloth={TKP.night} gaze={[-5, 0]} />
    {/* 差し出すおにぎりのお盆 */}
    <g transform={`translate(830 ${706 + bobOf(f, 3)})`}>
      <ellipse cx={0} cy={16} rx={100} ry={24} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
      {[-46, 0, 46].map((ox) => (
        <g key={ox}>
          {/* 握り飯 (角を丸めた三角) */}
          <path d={`M ${ox - 30} 12 Q ${ox - 32} 2 ${ox - 26} -10 L ${ox - 6} -30 Q ${ox} -34 ${ox + 6} -30 L ${ox + 26} -10 Q ${ox + 32} 2 ${ox + 30} 12 Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          {/* 海苔 (下側にきちんと巻く) */}
          <path d={`M ${ox - 29} 12 Q ${ox - 31} 2 ${ox - 26.5} -8 L ${ox + 26.5} -8 Q ${ox + 31} 2 ${ox + 29} 12 Z`}
            fill={NORI} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <line x1={ox - 26.5} y1={-8} x2={ox + 26.5} y2={-8} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
    </g>
    <TagPlate x={700} y={430} text="タダ飯" size={40} t={seg(f, 24, 44)} fill={KRP.yellow} />
    <TagPlate x={1430} y={430} text="タダ宿" size={40} t={seg(f, 44, 64)} fill={KRP.yellow} />
  </Frame>
);

// #72 相手は神様、止めたらバチが当たる: 神様のあかりに恐縮する人
// 雷 (バチ) 1本。start フレームから数フレームだけ強く光る
const Bolt: React.FC<{ d: string; f: number; start: number; width?: number }> = ({ d, f, start, width = 12 }) => {
  const k = f - start;
  if (k < 0 || k > 14) return null;
  const a = k < 3 ? 1 : k < 6 ? 0.45 : k < 9 ? 0.95 : 0.3 + Math.max(0, (14 - k) / 10) * 0.5;
  return (
    <g opacity={a}>
      {/* 光のにじみ */}
      <path d={d} fill="none" stroke={KRP.white} strokeWidth={width + 12} strokeLinejoin="round"
        strokeLinecap="round" opacity={0.5} />
      <path d={d} fill="none" stroke={KRP.yellow} strokeWidth={width + 5} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={KRP.orange} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

const SceneKamiBachi: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 1 + Math.sin(f / 11) * 0.05;
  // v2修正: 「バチが当たる」を雷雨で見せる (暗い雲・雨・まわりに落ちる雷)
  const storm = seg(f, 4, 24);
  // 雷が光った瞬間だけ画面全体が白くまたたく
  const flash = [30, 52, 70, 92, 110].reduce((m, s) => {
    const k = f - s;
    return k >= 0 && k < 5 ? Math.max(m, (5 - k) / 5) : m;
  }, 0);
  return (
    <Frame f={f} seed={518} caption="相手は神様" capX={474} capY={128}>
      <KaidoBg f={f} fuji={false} />
      {/* --- 雷雨 --- */}
      {/* 空を暗くする */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#3A4455" opacity={0.42 * storm} />
      {/* 雨雲 (3かたまり) */}
      {[{ x: 330, y: 150, s: 1.0 }, { x: 960, y: 108, s: 1.25 }, { x: 1600, y: 160, s: 0.95 }].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y - (1 - storm) * 140}) scale(${c.s})`} opacity={storm}>
          <path d="M -200 40 Q -210 -30 -140 -40 Q -120 -96 -40 -88 Q 10 -130 80 -92 Q 160 -96 170 -34 Q 220 -20 206 40 Z"
            fill="#6B7585" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -150 20 Q -90 -14 -20 10 Q 50 -16 120 14" fill="none" stroke="#505A6B" strokeWidth={7}
            strokeLinecap="round" opacity={0.8} />
        </g>
      ))}
      {/* 雨 (斜めの線がざあざあ降る) */}
      {Array.from({ length: 46 }, (_, i) => {
        const x0 = ((i * 211) % 1960) - 20;
        const y0 = ((i * 137 + f * 26) % 760) + 180;
        return (
          <line key={i} x1={x0} y1={y0} x2={x0 - 22} y2={y0 + 62} stroke={KRP.blueSoft}
            strokeWidth={4} strokeLinecap="round" opacity={0.55 * storm} />
        );
      })}
      {/* 雷 (まわりにごろごろ落ちる。主人の体には当てない) */}
      <Bolt f={f} start={30} d="M 300 210 L 232 400 L 318 388 L 236 620" />
      <Bolt f={f} start={52} d="M 1640 220 L 1572 404 L 1664 392 L 1596 640" width={11} />
      <Bolt f={f} start={70} d="M 1114 300 L 1046 486 L 1138 474 L 1072 700" width={10} />
      <Bolt f={f} start={92} d="M 560 230 L 498 408 L 586 396 L 524 596" width={10} />
      <Bolt f={f} start={110} d="M 1420 240 L 1356 424 L 1446 412 L 1388 652" width={11} />
      {/* 落雷の瞬間のまたたき */}
      {flash > 0 && <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.white} opacity={flash * 0.38} />}
      {/* 神様のあかり (抽象的な光。特定の宗教の絵にしない) */}
      {/* 神様のあかりと宿の主人を画面の真ん中に据える (旅人は出さない) */}
      <g transform={`translate(960 296) scale(${pulse * pop(seg(f, 6, 26))})`}>
        <circle cx={0} cy={0} r={70} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={40} fill={KRP.white} opacity={0.55} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + f / 90;
          return (
            <line key={i} x1={Math.cos(a) * 90} y1={Math.sin(a) * 90}
              x2={Math.cos(a) * 130} y2={Math.sin(a) * 130}
              stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
          );
        })}
      </g>
      {/* 服の紺は #71 の宿の主人とそろえてある (同じ人物として見せる) */}
      <Murabito x={960} y={930} s={1.05} f={f} phase={2} face="worried" cloth={TKP.night} gaze={[4, -6]} />
      <TagPlate x={1452} y={596} text="止めたらバチ" size={38} t={seg(f, 56, 76)} color={KRP.red} />
    </Frame>
  );
};

// #73 文政13年、3か月で427万人: 渡し場の行列 + 回るカウンタ (見せ場)
const SceneYonhyaku: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.floor(easeOut(seg(f, 14, 84)) * 4276500);
  const man = Math.floor(n / 10000);
  return (
    <Frame f={f} seed={519}
      over={<>
        <Stamp x={130} y={226} text="文政13年" size={50} />
        {/* 西暦も添える (文政13年 = 1830年) */}
        <Stamp x={146} y={340} text="＝1830年" size={34} opacity={0.82} />
      </>}>
      <KaidoBg f={f} fuji={false} />
      {/* 宮川の渡し: 川の帯 + 舟 */}
      <rect x={-20} y={700} width={W + 40} height={180} fill={KRP.blueSoft} opacity={0.9} />
      <path d="M -20 700 L 1940 700 M -20 880 L 1940 880" stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${200 + i * 620} ${760 + i * 30} q 60 10 120 0`} fill="none"
          stroke={KRP.white} strokeWidth={5} opacity={0.7} />
      ))}
      <g transform={`translate(${880 + Math.sin(f / 22) * 30} ${770 + Math.sin(f / 13) * 4})`}>
        <path d="M -150 0 Q 0 46 150 0 L 118 -34 L -118 -34 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
        {[-70, 0, 70].map((ox) => (
          <circle key={ox} cx={ox} cy={-56} r={21} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        <line x1={128} y1={-40} x2={190} y2={30} stroke={TKP.woodDark} strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* 向こう岸で順番を待つ行列 (小さな旅人がぎっしり) */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <EdoTraveler key={i} x={1180 + i * 115 + Math.sin(f / 16 + i) * 4} y={690 + (i % 2) * 8}
          s={0.5} f={f} phase={i} face="normal"
          cloth={[TKP.noren, KRP.green, TKP.terracotta, TKP.yukata][i % 4]} />
      ))}
      {/* カウンタ */}
      <g transform={`translate(960 330) scale(${pop(seg(f, 4, 22))})`}>
        <rect x={-430} y={-110} width={860} height={220} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <text x={-120} y={38} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={110}
          fill={KRP.red}>{man}</text>
        <text x={-100} y={34} fontFamily={FONT} fontWeight={900} fontSize={62} fill={KRP.ink}>万人</text>
        <text x={210} y={34} fontFamily={FONT} fontWeight={800} fontSize={40} fill={KRP.grayDark}>/ 3か月</text>
      </g>
    </Frame>
  );
};

// #74 渡し場で実際に数えた記録: 帳面に「正」の字を刻む役人
const SceneKiroku: React.FC<{ f: number }> = ({ f }) => {
  const marks = Math.min(Math.floor(seg(f, 10, 90) * 12), 12);
  return (
    <Frame f={f} seed={520} caption="当時の記録" capX={330} capY={110}
      zoom={1 + easeOut(seg(f, 20, 90)) * 0.08} zx={1050} zy={560}>
      <KaidoBg f={f} fuji={false} />
      <rect x={-20} y={760} width={W + 40} height={140} fill={KRP.blueSoft} opacity={0.8} />
      <Murabito x={520} y={930} s={1.05} f={f} phase={1} face="normal" cloth={TKP.night} gaze={[6, 2]} />
      {/* 大きな帳面 */}
      <g transform="translate(1120 560) rotate(-3)">
        <rect x={-330} y={-220} width={660} height={440} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={8} />
        <line x1={0} y1={-220} x2={0} y2={220} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
        <text x={-165} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>宮川の渡し</text>
        {Array.from({ length: marks }, (_, i) => (
          <text key={i} x={-280 + (i % 4) * 150} y={-60 + Math.floor(i / 4) * 110}
            fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.ink}
            opacity={0.85}>正</text>
        ))}
      </g>
      {/* 筆 (書くたびに動く) */}
      <g transform={`translate(${860 + (marks % 4) * 40} ${430 + Math.sin(f / 5) * 8}) rotate(24)`}>
        <line x1={0} y1={0} x2={0} y2={110} stroke={TKP.woodDark} strokeWidth={10} strokeLinecap="round" />
        <path d="M -8 110 L 0 150 L 8 110 Z" fill={KRP.ink} />
      </g>
    </Frame>
  );
};

// #75 当時の人口3000万、ざっと7人に1人: 人型7人のうち1人が色づく
const SceneNanaHitori: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={521} caption="当時の人口 約3000万" capY={100}>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const t = pop(seg(f, 6 + i * 5, 22 + i * 5));
      const hit = i === 3;
      const lit = hit && f > 50;
      const col = lit ? KRP.orange : KRP.gray;
      if (t <= 0) return null;
      return (
        <g key={i} transform={`translate(${300 + i * 220} ${640 + bobOf(f, i)}) scale(${t * (lit ? 1.14 : 1)})`}>
          <circle cx={0} cy={-170} r={52} fill={col} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -62 120 L -62 -40 Q -62 -104 0 -104 Q 62 -104 62 -40 L 62 120 Z"
            fill={col} stroke={KRP.ink} strokeWidth={5.5} />
          {lit && (
            <path d="M -70 -250 L 0 -302 L 70 -250 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          )}
        </g>
      );
    })}
    <Burst x={960} y={330} r={76} t={seg(f, 50, 66)} />
    <TagPlate x={960} y={844} text="7人に1人が伊勢へ" size={44} t={seg(f, 56, 76)} fill={KRP.yellow} />
  </Frame>
);

// =====================================================================
// 第4章 お土産の誕生 (#76〜#96)
// =====================================================================

// #76 とはいえ伊勢への旅は大出費 (章扉): 財布から銭が飛ぶ + 第4章の題字
const SceneCh4Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={522}
    over={<ChapterDoor num={4} title="お土産の誕生" t={seg(f, 26, 56)} left={1030} top={560} width={780} />}>
    <KaidoBg f={f} />
    <EdoTraveler x={520} y={900} s={1.15} f={f} face="worried" />
    {/* 逆さの財布から銭がこぼれ飛ぶ */}
    <g transform={`translate(700 ${560 + bobOf(f, 0)}) rotate(160)`}>
      <path d="M -54 -40 Q 0 -74 54 -40 L 44 46 Q 0 72 -44 46 Z" fill={KRP.orange}
        stroke={KRP.ink} strokeWidth={5.5} />
      <line x1={-40} y1={-34} x2={40} y2={-34} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    </g>
    {[0, 1, 2, 3, 4].map((i) => {
      const t = seg(f, 10 + i * 9, 58 + i * 9);
      if (t <= 0 || t >= 1) return null;
      return <Zeni key={i} x={700 + t * (120 + i * 40)} y={620 + t * 220 - Math.sin(t * Math.PI) * 160}
        s={0.9} />;
    })}
    <TagPlate x={460} y={360} text="大出費…" size={42} t={seg(f, 40, 60)} color={KRP.red} />
  </Frame>
);

// #77 庶民の年収の数か月分「ともいわれる」: 銭の山と小さな財布の対比
const SceneNenshu: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 14, 70));
  return (
    <Frame f={f} seed={523} caption="年収の数か月分“とも”" capY={110}>
      <YoriaiStage f={f} />
      {/* 旅の費用: 銭の山がせり上がる */}
      <g>
        {Array.from({ length: 18 }, (_, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const show = grow * 18 > i;
          return show ? (
            <Zeni key={i} x={1180 + col * 86 - row * 14} y={850 - row * 52} s={1.15} />
          ) : null;
        })}
        <TagPlate x={1330} y={520} text="旅の費用" size={38} t={seg(f, 60, 80)} />
      </g>
      {/* ふだんの財布 (小さい) */}
      <g transform={`translate(520 ${830 + bobOf(f, 2)})`}>
        <path d="M -48 -36 Q 0 -66 48 -36 L 40 40 Q 0 64 -40 40 Z" fill={KRP.orange}
          stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      <TagPlate x={520} y={640} text="ふだんの蓄え" size={34} t={seg(f, 30, 50)} />
      <Murabito x={790} y={940} s={1.0} f={f} phase={1} face="worried" gaze={[6, -4]} />
    </Frame>
  );
};

// #78 村人たちがすごい仕組みを考えた: 寄り合いでひらめき
const SceneSugoiShikumi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={524}>
    <YoriaiStage f={f} />
    <Murabito x={560} y={930} s={1.02} f={f} phase={0} face="normal" gaze={[5, -4]} />
    <Murabito x={960} y={950} s={1.06} f={f} phase={3} face="smile" cloth={TKP.terracotta} gaze={[0, -6]} />
    <Murabito x={1360} y={930} s={1.0} f={f} phase={6} face="normal" cloth={TKP.noren} gaze={[-5, -4]} />
    <Burst x={960} y={420} r={96} color={KRP.yellow} t={seg(f, 30, 50)} n={12} />
    <text x={960} y={452} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
      fill={KRP.orange} opacity={clamp01(seg(f, 34, 48))}>！</text>
  </Frame>
);

// #79 「伊勢講」です: 同じ寄り合いに大きな札がどん
const SceneIsekouFuda: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 10, 34));
  return (
    <Frame f={f} seed={525}>
      <YoriaiStage f={f} />
      <Murabito x={430} y={930} s={0.98} f={f} phase={0} face="smile" gaze={[6, -4]} />
      <Murabito x={1490} y={930} s={0.98} f={f} phase={5} face="smile" cloth={TKP.noren} gaze={[-6, -4]} />
      {t > 0 && (
        <g transform={`translate(960 ${480 + bobOf(f, 1) * 0.5}) scale(${t})`}>
          <rect x={-330} y={-150} width={660} height={300} rx={20} fill={KRP.yellow}
            stroke={KRP.ink} strokeWidth={9} />
          <text x={0} y={48} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={140} fill={KRP.ink}>伊勢講</text>
        </g>
      )}
      <Burst x={960} y={240} r={84} t={seg(f, 30, 48)} />
    </Frame>
  );
};

// #80 みんなで少しずつ積み立てる: 銭が帳場の箱へ弧を描いて飛ぶ
const SceneTsumitate: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={526} caption="みんなで積み立て" capY={110}>
    <YoriaiStage f={f} />
    <Murabito x={400} y={930} s={0.98} f={f} phase={0} face="smile" gaze={[6, -4]} />
    <Murabito x={760} y={950} s={1.0} f={f} phase={3} face="smile" cloth={TKP.terracotta} gaze={[4, -4]} />
    <Murabito x={1560} y={930} s={0.98} f={f} phase={6} face="smile" cloth={TKP.noren} gaze={[-6, -4]} />
    <KouChoubou x={1180} y={800} s={1.25} />
    {[0, 1, 2].map((i) => {
      const t = seg((f + i * 26) % 80, 0, 46);
      if (t <= 0 || t >= 1) return null;
      const sx = [400, 760, 1560][i];
      const px = lerp(sx, 1180, easeOut(t));
      const py = lerp(620, 760, t) - Math.sin(t * Math.PI) * 190;
      return <Zeni key={i} x={px} y={py} s={1.0} />;
    })}
  </Frame>
);

// #81 くじで選ばれた代表だけが伊勢へ: くじ棒が1本だけ光って抜ける
const SceneKuji: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 40, 66));
  return (
    <Frame f={f} seed={527} caption="くじで代参を選ぶ" capY={110}>
      <YoriaiStage f={f} />
      <Murabito x={430} y={930} s={0.98} f={f} phase={0} face="normal" gaze={[6, -5]} />
      <Murabito x={1490} y={930} s={0.98} f={f} phase={5} face="normal" cloth={TKP.noren} gaze={[-6, -5]} />
      {/* くじの筒 */}
      <g transform={`translate(960 ${760 + bobOf(f, 2) * 0.5})`}>
        <path d="M -110 -120 L 110 -120 L 88 90 L -88 90 Z" fill={TKP.woodLight}
          stroke={KRP.ink} strokeWidth={6.5} />
        <ellipse cx={0} cy={-120} rx={110} ry={26} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
        {[-64, -32, 0, 32, 64].map((ox, i) => {
          const win = i === 2;
          const lift = win ? up * 210 : 0;
          return (
            <g key={ox} transform={`translate(${ox} ${-150 - lift}) rotate(${(i - 2) * 5})`}>
              <rect x={-11} y={-110} width={22} height={130} rx={8}
                fill={win && f > 40 ? KRP.red : KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
              {win && f > 52 && (
                <text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                  fontSize={26} fill={KRP.white} transform="rotate(0)">当</text>
              )}
            </g>
          );
        })}
      </g>
      <Burst x={960} y={330} r={86} t={seg(f, 58, 76)} />
      <TagPlate x={960} y={210} text="代参" size={44} t={seg(f, 66, 86)} fill={KRP.yellow} />
    </Frame>
  );
};

// #82 代表に村中から餞別: のし包みが代表に集まる
const SceneSenbetsu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={528}>
    <YoriaiStage f={f} />
    <EdoTraveler x={960} y={930} s={1.12} f={f} face="smile" />
    <Murabito x={360} y={930} s={0.95} f={f} phase={1} face="smile" gaze={[6, -2]} />
    <Murabito x={620} y={960} s={0.9} f={f} phase={4} face="smile" cloth={TKP.terracotta} gaze={[6, -2]} />
    <Murabito x={1310} y={960} s={0.9} f={f} phase={7} face="smile" cloth={TKP.noren} gaze={[-6, -2]} />
    <Murabito x={1570} y={930} s={0.95} f={f} phase={9} face="smile" cloth={KRP.green} gaze={[-6, -2]} />
    {[0, 1, 2, 3].map((i) => {
      const t = easeOut(seg(f, 14 + i * 12, 54 + i * 12));
      const sx = [360, 620, 1310, 1570][i];
      // 顔にも体にもかぶらないよう、代表の左右の畳の上に振り分けて置く
      const px = lerp(sx, [658, 836, 1084, 1262][i], t);
      const py = lerp(620, [884, 838, 838, 884][i], t) - Math.sin(t * Math.PI) * 150;
      return <SenbetsuPack key={i} x={px} y={py} s={0.72} />;
    })}
    <TagPlate x={960} y={300} text="餞別" size={48} t={seg(f, 50, 70)} fill={KRP.yellow} />
  </Frame>
);

// #83 餞別の正体は割り勘: 「餞別 = 銭+銭+銭」の図解
const SceneWarikan: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={529}>
    <YoriaiStage f={f} />
    <g transform="translate(960 520)">
      <g transform={`scale(${pop(seg(f, 6, 26))})`}>
        <SenbetsuPack x={-560} y={0} s={1.5} />
      </g>
      <text x={-310} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84}
        fill={KRP.ink} opacity={clamp01(seg(f, 26, 40))}>=</text>
      {[0, 1, 2].map((i) => {
        const t = pop(seg(f, 32 + i * 10, 50 + i * 10));
        if (t <= 0) return null;
        return (
          <g key={i} transform={`translate(${-120 + i * 260} 0) scale(${t})`}>
            <Zeni x={0} y={-30} s={1.5} />
            {/* 出した人の小さな顔 (手ぬぐいの色を一人ずつ変えて村人らしく) */}
            <circle cx={0} cy={66} r={34} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -32 58 Q 0 22 32 58 Z" fill={[TKP.yukata, TKP.terracotta, TKP.forest][i]}
              stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <circle cx={-19} cy={74} r={6.5} fill={KRP.red} opacity={0.3} />
            <circle cx={19} cy={74} r={6.5} fill={KRP.red} opacity={0.3} />
            <circle cx={-11} cy={66} r={4.5} fill={KRP.ink} />
            <circle cx={11} cy={66} r={4.5} fill={KRP.ink} />
            <path d="M -10 82 Q 0 90 10 82" fill="none" stroke={KRP.ink} strokeWidth={4} />
            {i < 2 && (
              <text x={140} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={64} fill={KRP.ink}>+</text>
            )}
          </g>
        );
      })}
    </g>
    <TagPlate x={960} y={790} text="正体は 割り勘" size={46} t={seg(f, 54, 74)} fill={KRP.yellow} />
  </Frame>
);

// #84 割り勘の旅なら手ぶらでは帰れない: 空の両手に✕
const SceneTebura: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={530} caption="手ぶらでは帰れない" capY={110}
    zoom={1 + easeOut(seg(f, 16, 86)) * 0.09} zx={860} zy={560}>
    <KaidoBg f={f} />
    <ShinmeiTorii x={1660} y={840} s={0.7} />
    <EdoTraveler x={860} y={920} s={1.2} f={f} face="worried" />
    {/* 持って帰るはずの土産包みが「ない」ことを、点線の空っぽ包みで見せる */}
    <g opacity={clamp01(seg(f, 20, 40)) * 0.75}>
      <path d="M -88 44 Q -98 -22 -56 -48 L 56 -48 Q 98 -22 88 44 Z"
        transform="translate(534 788)" fill="none" stroke={KRP.grayDark}
        strokeWidth={6} strokeDasharray="15 12" strokeLinejoin="round" />
      <path d="M -56 -48 Q -22 -88 0 -52 Q 22 -88 56 -48"
        transform="translate(534 788)" fill="none" stroke={KRP.grayDark}
        strokeWidth={6} strokeDasharray="15 12" strokeLinejoin="round" />
      <text x={534} y={808} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={62} fill={KRP.grayDark} opacity={0.6}>?</text>
    </g>
    <Batsu x={860} y={430} s={1.9} t={seg(f, 40, 58)} />
    {/* 頭に浮かぶ村のみんな */}
    <g opacity={clamp01(seg(f, 56, 76))}>
      <ellipse cx={1360} cy={340} rx={190} ry={120} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {[-90, 0, 90].map((ox, i) => (
        <g key={ox}>
          <circle cx={1360 + ox} cy={330} r={34} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={1349 + ox} cy={326} r={4} fill={KRP.ink} />
          <circle cx={1371 + ox} cy={326} r={4} fill={KRP.ink} />
          <line x1={1348 + ox} y1={344} x2={1372 + ox} y2={344} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      <circle cx={1180} cy={470} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={1120} cy={520} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  </Frame>
);

// #85 神宮のお札を全員ぶん持ち帰った: お札の扇をかかえて帰る代表
const SceneOfudaMochikaeri: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={531}>
    <KaidoBg f={f} />
    <ShinmeiTorii x={300} y={840} s={0.72} />
    <EdoTraveler x={760} y={920} s={1.15} f={f} face="smile" />
    {/* 胸の前にお札の扇 */}
    {[0, 1, 2, 3, 4].map((i) => {
      const t = pop(seg(f, 14 + i * 8, 32 + i * 8));
      if (t <= 0) return null;
      return (
        <g key={i} transform={`translate(${1060 + i * 10} ${660 + bobOf(f, 0)}) rotate(${-26 + i * 13}) scale(${0.72 * t})`}>
          <OfudaTag x={0} y={-130} s={1} />
        </g>
      );
    })}
    <TagPlate x={1210} y={300} text="全員ぶんのお札" size={40} t={seg(f, 56, 76)} fill={KRP.yellow} />
  </Frame>
);

// #86 お土産はプレゼントではなく「配当」: お札が村人全員へ放射状に
const SceneHaitou: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={532} over={<Stamp x={1380} y={180} text="配当" size={64} />}>
    <YoriaiStage f={f} />
    <EdoTraveler x={960} y={940} s={1.05} f={f} face="smile" />
    {[0, 1, 2, 3].map((i) => {
      const tx = [280, 600, 1330, 1650][i];
      const t = easeOut(seg(f, 10 + i * 10, 48 + i * 10));
      const px = lerp(960, tx, t);
      const py = lerp(600, 680, t) - Math.sin(t * Math.PI) * 170;
      return (
        <g key={i}>
          <Murabito x={tx} y={930} s={0.92} f={f} phase={i * 2 + 1} face="smile"
            cloth={[TKP.yukata, TKP.terracotta, TKP.noren, KRP.green][i]}
            gaze={[tx < 960 ? 6 : -6, -4]} />
          <OfudaTag x={px} y={py} s={0.52} />
        </g>
      );
    })}
  </Frame>
);

// #87 配らないと済まされない暗黙の決まり: 全員がお札を掲げてうなずく
const SceneAnmoku: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={533}>
    <YoriaiStage f={f} />
    {[0, 1, 2, 3].map((i) => {
      const tx = 330 + i * 420;
      return (
        <g key={i}>
          <Murabito x={tx} y={930} s={0.98} f={f} phase={i * 3} face="smile"
            cloth={[TKP.yukata, TKP.terracotta, TKP.noren, KRP.green][i]} gaze={[0, -5]} />
          <g transform={`translate(${tx + 96} ${600 + bobOf(f, i * 3)}) scale(${pop(seg(f, 10 + i * 8, 28 + i * 8))})`}>
            <OfudaTag x={0} y={0} s={0.56} />
          </g>
        </g>
      );
    })}
    <TagPlate x={960} y={300} text="暗黙の決まり" size={46} t={seg(f, 48, 68)} fill={KRP.yellow} />
  </Frame>
);

// #88 「みやげ」語源は宮笥説が有力とされる: 神様の器にお札 (断定しない)
const SceneMiyake: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 8, 30));
  return (
    <Frame f={f} seed={534} caption="語源には諸説あり" capX={1500} capY={110}>
      <KaidoBg f={f} fuji={false} />
      <ShinmeiTorii x={960} y={520} s={0.9} />
      {/* 宮笥 = 神から授かった器 */}
      <g transform={`translate(960 ${760 + bobOf(f, 1) * 0.4}) scale(${t})`}>
        <path d="M -220 -60 Q 0 30 220 -60 L 184 90 Q 0 160 -184 90 Z" fill={TKP.woodLight}
          stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={-46} rx={214} ry={44} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <g opacity={clamp01(seg(f, 30, 48))}>
        <OfudaTag x={960} y={640} s={0.72} />
      </g>
      {/* 説明は1枚にまとめて大きく、鳥居の真上 (画面中央) に置く */}
      <TagPlate x={960} y={184} text="宮笥（みやけ）＝ 神様の器" size={50}
        t={seg(f, 44, 64)} fill={KRP.yellow} />
      <TagPlate x={1498} y={430} text="有力とされる説" size={36} t={seg(f, 70, 88)} />
    </Frame>
  );
};

// #89 「土産」の字は後からの当て字 (これは断定可): 字がはんこで押される
const SceneAteji: React.FC<{ f: number }> = ({ f }) => {
  const stampT = seg(f, 40, 52);
  const sc = stampT <= 0 ? 0 : lerp(1.7, 1, easeOut(stampT));
  return (
    <Frame f={f} seed={535}>
      <KaidoBg f={f} fuji={false} />
      <g transform="translate(960 470)">
        <rect x={-560} y={-230} width={1120} height={460} rx={22} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={8} />
        <text x={-250} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={150} fill={KRP.ink} opacity={clamp01(seg(f, 6, 20))}>みやげ</text>
        {stampT > 0 && (
          <g transform={`translate(300 0) rotate(-7) scale(${sc})`} opacity={clamp01(stampT * 2)}>
            <rect x={-170} y={-120} width={340} height={240} rx={14} fill="none"
              stroke={KRP.red} strokeWidth={10} />
            <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={150} fill={KRP.red}>土産</text>
          </g>
        )}
      </g>
      <Burst x={1260} y={300} r={70} t={seg(f, 50, 66)} />
      <TagPlate x={960} y={820} text="漢字は後からの当て字" size={40} t={seg(f, 62, 82)} fill={KRP.yellow} />
    </Frame>
  );
};

// #90 もともとは土地の名物ではなく神様の証拠品: まんじゅう✕ / お札○
const SceneShoukohin: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={536} caption="もともとの お土産" capY={100}>
    <KaidoBg f={f} fuji={false} />
    {/* 左: 土地の名物 (まんじゅう) → ✕ */}
    <g transform={`translate(540 ${620 + bobOf(f, 1) * 0.4}) scale(${pop(seg(f, 8, 28))})`}>
      <ellipse cx={0} cy={66} rx={170} ry={40} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
      {[[-66, 30], [66, 30], [0, -24]].map(([ox, oy], i) => (
        <g key={i} transform={`translate(${ox} ${oy})`}>
          <path d="M -62 24 Q -62 -34 0 -34 Q 62 -34 62 24 Z" fill={TKP.tuscany}
            stroke={KRP.ink} strokeWidth={5.5} />
        </g>
      ))}
      <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
        fill={KRP.ink}>土地の名物</text>
    </g>
    <Batsu x={540} y={400} s={1.7} t={seg(f, 34, 50)} />
    {/* 右: 神様の証拠品 (お札) → ○ */}
    <g transform={`translate(1380 ${640 + bobOf(f, 4) * 0.4}) scale(${pop(seg(f, 20, 40))})`}>
      <OfudaTag x={0} y={0} s={1.0} />
      <text x={0} y={240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
        fill={KRP.ink}>神様の証拠品</text>
    </g>
    <Maru x={1380} y={380} s={1.7} t={seg(f, 52, 70)} />
  </Frame>
);

// #91 この旅には影の主役がいる: スポットライトの中の黒い人影
const SceneKageShuyaku: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp01(seg(f, 14, 40));
  return (
    <Frame f={f} seed={537} caption="影の主役…？" capX={1460} capY={140}>
      {/* 暗がり */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.55} />
      {/* スポットライト */}
      <path d={`M 960 -40 L ${960 - 340 * t} 900 L ${960 + 340 * t} 900 Z`}
        fill={KRP.yellow} opacity={0.3 + Math.sin(f / 12) * 0.04} />
      <ellipse cx={960} cy={890} rx={340 * t} ry={54} fill={KRP.yellow} opacity={0.35} />
      {/* 黒い人影 (正体はまだ見せない) */}
      <g opacity={t}>
        <g transform={`translate(960 ${880 + bobOf(f, 2)})`}>
          <rect x={-66} y={-200} width={132} height={150} rx={20} fill={KRP.ink} />
          <circle cx={0} cy={-268} r={70} fill={KRP.ink} />
          <rect x={-90} y={-188} width={26} height={92} rx={13} fill={KRP.ink} />
          <rect x={64} y={-188} width={26} height={92} rx={13} fill={KRP.ink} />
        </g>
        <text x={960} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={120} fill={KRP.yellow} opacity={clamp01(seg(f, 40, 56))}>？</text>
      </g>
    </Frame>
  );
};

// #92 伊勢の「御師」: 影が晴れて御師が登場
const SceneOnshi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={538}>
    <KaidoBg f={f} fuji={false} />
    <ShinmeiTorii x={340} y={800} s={0.78} />
    <Shukuba x={1560} y={810} s={0.95} sign="御師" />
    <g transform={`translate(960 540) scale(${lerp(0.8, 1, pop(seg(f, 6, 26)))}) translate(-960 -540)`}>
      <OnshiPerson x={960} y={910} s={1.3} f={f} face="smile" />
    </g>
    <Burst x={960} y={300} r={90} t={seg(f, 24, 42)} />
    <TagPlate x={960} y={210} text="御師（おんし）" size={48} t={seg(f, 36, 56)} fill={KRP.yellow} />
  </Frame>
);

// #93 宿の手配・道案内・祈祷・お土産までぜんぶやる: 4役が次々ポップ
const SceneOnshiFour: React.FC<{ f: number }> = ({ f }) => {
  const items: Array<{ x: number; y: number; label: string; icon: React.ReactNode }> = [
    {
      x: 430, y: 380, label: "宿の手配",
      icon: <g><rect x={-54} y={-34} width={108} height={64} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -70 -34 L 0 -76 L 70 -34 Z" fill={TKP.iron} stroke={KRP.ink} strokeWidth={5} /></g>,
    },
    {
      x: 1490, y: 380, label: "道案内",
      icon: <g><line x1={0} y1={40} x2={0} y2={-56} stroke={TKP.woodDark} strokeWidth={10} strokeLinecap="round" />
        <path d="M -8 -56 L -8 -20 L 66 -38 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} /></g>,
    },
    {
      x: 430, y: 700, label: "祈祷",
      icon: <g><line x1={0} y1={44} x2={0} y2={-40} stroke={TKP.woodDark} strokeWidth={8} strokeLinecap="round" />
        <path d="M 0 -40 L -40 -24 L -34 10 L 0 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 0 -40 L 40 -24 L 34 10 L 0 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} /></g>,
    },
    {
      x: 1490, y: 700, label: "お土産",
      icon: <OfudaTag x={0} y={0} s={0.34} />,
    },
  ];
  return (
    <Frame f={f} seed={539}>
      <KaidoBg f={f} fuji={false} />
      <OnshiPerson x={960} y={920} s={1.15} f={f} face="smile" />
      {items.map((it, i) => {
        const t = pop(seg(f, 8 + i * 14, 26 + i * 14));
        if (t <= 0) return null;
        return (
          <g key={i} transform={`translate(${it.x} ${it.y + bobOf(f, i * 2)}) scale(${t})`}>
            <circle cx={0} cy={-10} r={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
            <g transform="translate(0 -36)">{it.icon}</g>
            <text x={0} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={34} fill={KRP.ink}>{it.label}</text>
            <line x1={it.x < 960 ? 116 : -116} y1={0} x2={it.x < 960 ? 300 : -300} y2={130}
              stroke={KRP.ink} strokeWidth={5} strokeDasharray="12 10" opacity={0.5} />
          </g>
        );
      })}
      <TagPlate x={960} y={200} text="ぜんぶやる" size={42} t={seg(f, 54, 74)} fill={KRP.yellow} />
    </Frame>
  );
};

// #94 旅行代理店+ホテル+営業マンをひとりで: 3枚の札が御師に重なっていく
const SceneHitoriSanyaku: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={540} over={<Stamp x={1330} y={230} text="ひとりで兼任" size={48} />}>
    <KaidoBg f={f} fuji={false} />
    <OnshiPerson x={960} y={920} s={1.2} f={f} face="smile" />
    {["旅行代理店", "ホテル", "営業マン"].map((label, i) => {
      const t = easeOut(seg(f, 8 + i * 16, 42 + i * 16));
      if (t <= 0) return null;
      // 札は左・上・右に配置し、引き出し線は御師の輪郭の手前で止める (体を貫かない)
      const from = [[196, 332], [960, 176], [1726, 332]][i];
      const dest = [[430, 468], [960, 312], [1482, 468]][i];
      const aim = [[876, 592], [960, 528], [1044, 592]][i];
      const px = lerp(from[0], dest[0], t);
      const py = lerp(from[1], dest[1], t);
      return (
        <g key={i}>
          <line x1={px} y1={py + 36} x2={aim[0]} y2={aim[1]} stroke={KRP.ink} strokeWidth={4.5}
            strokeDasharray="10 9" opacity={0.4 * t} />
          <TagPlate x={px} y={py} text={label} size={40} fill={[KRP.blueSoft, KRP.yellow, KRP.white][i]} />
        </g>
      );
    })}
  </Frame>
);

// #95 出かける口実と帰ってからの言い訳: 2枚のカード
const SceneKoujitsuIiwake: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={541}>
    <KaidoBg f={f} fuji={false} />
    {[0, 1].map((i) => {
      const t = pop(seg(f, 10 + i * 24, 34 + i * 24));
      if (t <= 0) return null;
      const bx = 560 + i * 800;
      return (
        <g key={i} transform={`translate(${bx} ${520 + bobOf(f, i * 4)}) scale(${t})`}>
          <rect x={-250} y={-230} width={500} height={460} rx={24} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={8} />
          <text x={0} y={-160} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={46} fill={i === 0 ? KRP.blueDeep : KRP.red}>
            {i === 0 ? "出かける口実" : "帰りの言い訳"}</text>
          {i === 0 ? (
            <g><ShinmeiTorii x={0} y={150} s={0.78} />
              <text x={0} y={204} textAnchor="middle" fontFamily={FONT} fontWeight={800}
                fontSize={34} fill={KRP.grayDark}>お伊勢参り</text></g>
          ) : (
            <g><OfudaTag x={0} y={10} s={0.78} />
              <text x={0} y={204} textAnchor="middle" fontFamily={FONT} fontWeight={800}
                fontSize={34} fill={KRP.grayDark}>お土産のお札</text></g>
          )}
        </g>
      );
    })}
  </Frame>
);

// #96 講と御師の仕組みの中でセットで完成: 2枚のカードが結ばれる (結論)
const SceneSetKansei: React.FC<{ f: number }> = ({ f }) => {
  const join = easeOut(seg(f, 10, 44));
  return (
    <Frame f={f} seed={542} over={<Stamp x={790} y={120} text="セットで完成" size={52} />}>
      <KaidoBg f={f} fuji={false} />
      {[0, 1].map((i) => {
        const bx = lerp(i === 0 ? 480 : 1440, i === 0 ? 650 : 1270, join);
        return (
          <g key={i} transform={`translate(${bx} ${540 + bobOf(f, i * 4)})`}>
            <rect x={-230} y={-200} width={460} height={400} rx={24} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={8} />
            <text x={0} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={42} fill={i === 0 ? KRP.blueDeep : KRP.red}>
              {i === 0 ? "出かける口実" : "帰りの言い訳"}</text>
            {i === 0 ? <ShinmeiTorii x={0} y={140} s={0.68} /> : <OfudaTag x={0} y={10} s={0.68} />}
          </g>
        );
      })}
      {/* 結び目 (水引) */}
      <g opacity={clamp01(seg(f, 44, 62))} transform={`translate(960 540) scale(${pop(seg(f, 44, 64))})`}>
        <circle cx={0} cy={0} r={74} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -30 -10 Q 0 -40 30 -10 Q 0 22 -30 -10" fill="none" stroke={KRP.red} strokeWidth={8} />
        <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26}
          fill={KRP.ink}>講×御師</text>
      </g>
      <TagPlate x={960} y={860} text="講と御師の仕組みの中で" size={36} t={seg(f, 64, 84)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== マスター出口: motif を知っていれば描く / 知らなければ null =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  // 第3章
  tb2_ch3_door: (f) => <SceneCh3Door f={f} />,
  tb2_kaido_seibi: (f) => <SceneKaidoSeibi f={f} />,
  tb2_sekisho_batsu: (f) => <SceneSekishoBatsu f={f} />,
  tb2_kousatsu_tatemae: (f) => <SceneKousatsuTatemae f={f} />,
  tb2_reigai_futatsu: (f) => <SceneReigaiFutatsu f={f} />,
  tb2_omairi_touji: (f) => <SceneOmairiTouji f={f} />,
  tb2_asobi_batsu: (f) => <SceneAsobiBatsu f={f} />,
  tb2_ise_maru: (f) => <SceneIseMaru f={f} />,
  tb2_kotae: (f) => <SceneKotae f={f} />,
  tb2_minna_ise: (f) => <SceneMinnaIse f={f} />,
  tb2_senryu_intro: (f) => <SceneSenryuIntro f={f} />,
  tb2_senryu: (f) => <SceneSenryu f={f} />,
  tb2_tsuide: (f) => <SceneTsuide f={f} />,
  tb2_hakujou: (f) => <SceneHakujou f={f} />,
  tb2_mudan: (f) => <SceneMudan f={f} />,
  tb2_nukemairi: (f) => <SceneNukemairi f={f} />,
  tb2_otogame_nashi: (f) => <SceneOtogameNashi f={f} />,
  tb2_segyou: (f) => <SceneSegyou f={f} />,
  tb2_kami_bachi: (f) => <SceneKamiBachi f={f} />,
  tb2_427man: (f) => <SceneYonhyaku f={f} />,
  tb2_kiroku: (f) => <SceneKiroku f={f} />,
  tb2_nana_hitori: (f) => <SceneNanaHitori f={f} />,
  // 第4章
  tb2_ch4_door: (f) => <SceneCh4Door f={f} />,
  tb2_nenshu: (f) => <SceneNenshu f={f} />,
  tb2_sugoi_shikumi: (f) => <SceneSugoiShikumi f={f} />,
  tb2_isekou_fuda: (f) => <SceneIsekouFuda f={f} />,
  tb2_tsumitate: (f) => <SceneTsumitate f={f} />,
  tb2_kuji: (f) => <SceneKuji f={f} />,
  tb2_senbetsu: (f) => <SceneSenbetsu f={f} />,
  tb2_warikan: (f) => <SceneWarikan f={f} />,
  tb2_tebura: (f) => <SceneTebura f={f} />,
  tb2_ofuda_mochikaeri: (f) => <SceneOfudaMochikaeri f={f} />,
  tb2_haitou: (f) => <SceneHaitou f={f} />,
  tb2_anmoku: (f) => <SceneAnmoku f={f} />,
  tb2_miyake: (f) => <SceneMiyake f={f} />,
  tb2_ateji: (f) => <SceneAteji f={f} />,
  tb2_shoukohin: (f) => <SceneShoukohin f={f} />,
  tb2_kage_shuyaku: (f) => <SceneKageShuyaku f={f} />,
  tb2_onshi: (f) => <SceneOnshi f={f} />,
  tb2_onshi_four: (f) => <SceneOnshiFour f={f} />,
  tb2_hitori_sanyaku: (f) => <SceneHitoriSanyaku f={f} />,
  tb2_koujitsu_iiwake: (f) => <SceneKoujitsuIiwake f={f} />,
  tb2_set_kansei: (f) => <SceneSetKansei f={f} />,
};

export const tabiB2Scene = (motif: string, f: number): React.ReactElement | null => {
  const S = SCENES[motif];
  return S ? S(f) : null;
};

// 文#54〜#96 に1対1で対応する motif 名の列 (長さは必ず43。再利用は同じ名前を繰り返す)
export const T_B2_MOTIFS: string[] = [
  // 第3章 江戸の大発明 (#54〜#75)
  "tb2_ch3_door", // #54 時は江戸時代 (章扉+絵巻スクロール)
  "tb2_kaido_seibi", // #55 世の中は平和になり街道が整備された
  "tb2_sekisho_batsu", // #56 庶民の旅は原則として自由ではない
  "tb2_kousatsu_tatemae", // #57 勝手に領地を離れてはいけない建前
  "tb2_reigai_futatsu", // #58 例外がふたつだけあった
  "tb2_omairi_touji", // #59 お参りと湯治
  "tb2_asobi_batsu", // #60 「遊びに行きます」は通らない
  "tb2_ise_maru", // #61 「お伊勢参りに行きます」なら通る
  "tb2_kotae", // #62 人々の答えはもうお分かりですね
  "tb2_minna_ise", // #63 みんなお伊勢参りに行った
  "tb2_senryu_intro", // #64 当時の川柳が残っている
  "tb2_senryu", // #65 「伊勢参り 大神宮にも ちょっと寄り」(見せ場)
  "tb2_tsuide", // #66 本命の神様が「ついで」になっている
  "tb2_hakujou", // #67 江戸の人たち自分で白状していた
  "tb2_mudan", // #68 勢いあまって無断で旅立つ人まで
  "tb2_nukemairi", // #69 置き手紙ひとつで伊勢へ「抜け参り」
  "tb2_otogame_nashi", // #70 不思議なことにおとがめなし
  "tb2_segyou", // #71 沿道の人々がタダ飯やタダ宿で応援
  "tb2_kami_bachi", // #72 相手は神様、止めたらバチが当たる
  "tb2_427man", // #73 文政13年、3か月で427万人 (見せ場)
  "tb2_kiroku", // #74 渡し場で実際に数えた当時の記録
  "tb2_nana_hitori", // #75 人口およそ3000万、ざっと7人に1人
  // 第4章 お土産の誕生 (#76〜#96)
  "tb2_ch4_door", // #76 とはいえ伊勢への旅は大出費 (章扉)
  "tb2_nenshu", // #77 庶民の年収の数か月分ともいわれる
  "tb2_sugoi_shikumi", // #78 村人たちがすごい仕組みを考えた
  "tb2_isekou_fuda", // #79 「伊勢講」です
  "tb2_tsumitate", // #80 村のみんなで少しずつ積み立てる
  "tb2_kuji", // #81 くじで選ばれた代表だけが伊勢へ
  "tb2_senbetsu", // #82 代表には村中から「餞別」が渡される
  "tb2_warikan", // #83 餞別の正体はみんなで出し合った旅費=割り勘
  "tb2_tebura", // #84 割り勘の旅なら手ぶらでは帰れない
  "tb2_ofuda_mochikaeri", // #85 神宮のお札を留守番の全員ぶん持ち帰った
  "tb2_haitou", // #86 お土産はプレゼントではなく「配当」
  "tb2_anmoku", // #87 配らないと済まされない暗黙の決まり
  "tb2_miyake", // #88 「みやげ」語源は宮笥説が有力とされる
  "tb2_ateji", // #89 「土産」の字が後からの当て字なのは確か
  "tb2_shoukohin", // #90 土地の名物ではなく神様の証拠品
  "tb2_kage_shuyaku", // #91 この旅には影の主役がいる
  "tb2_onshi", // #92 伊勢の「御師」と呼ばれる人たち
  "tb2_onshi_four", // #93 宿・案内・祈祷・土産までぜんぶやる
  "tb2_hitori_sanyaku", // #94 旅行代理店とホテルと営業マンをひとりで
  "tb2_koujitsu_iiwake", // #95 出かける口実と帰ってからの言い訳
  "tb2_set_kansei", // #96 講と御師の仕組みの中でセットで完成
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const T_B2_PREVIEW_FRAMES = Math.max(T_B2_MOTIFS.length, 1);
export const TabiB2Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(T_B2_MOTIFS.length - 1, 0));
  const motif = T_B2_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {tabiB2Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 54} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
