// 「人類は、昔から飛ばして観ていた」: 文#114〜#125 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1200〜1211。
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
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";
import {
  ChikyuGi, chikyuTen, chikyuPath, HONSHU, HOKKAIDO, KYUSHU, SHIKOKU,
} from "./SaigoChizu";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 煉瓦街・街路
  brick: "#B2573D",
  brickDark: "#8E4530",
  mortar: "#D9C3A8",
  skyDay: "#CDE3EA",
  road: "#C8B590",
  // 書斎・地球儀
  deskWood: "#9A6B42",
  sea: "#A8CBD6",
  land: "#C9B97E",
  plankWall: "#6B5139",
  washi: "#F4ECD8",
  // 和装・祝い
  kuro: "#2C2622",
  kohaku: "#C84B3C",
  norenAi: "#33506B",
  chochin: "#E8B46A",
  lacqRed: "#8E3A2E",
  rope: "#A58A5C",
  tagPaper: "#EFE3C2",
  // 洋館
  wallpaper: "#D9CBB4",
  dado: "#7C5A3E",
  carpet: "#8A4A44",
  // 歌舞伎座・帝劇
  kabukiKaki: "#C97B3A",
  kabukiMoegi: "#5E7D52",
  shirokabe: "#EFE9DA",
  duskTop: "#39385E",
  duskMid: "#6F5A74",
  duskLow: "#C7876B",
  glow: "#F4D98C",
  chairRed: "#A64038",
  tileA: "#D8CFBC",
  tileB: "#C9BFA8",
  // 震災・焼け跡
  qSkyTop: "#2C171B",
  qSkyMid: "#5A2A24",
  qSkyLow: "#8C3A26",
  qGlow: "#C05A30",
  qDark: "#241A18",
  qSmoke: "#4A3A36",
  ashSky: "#D9D6CC",
  ashGround: "#B5AC9C",
  charcoal: "#55473E",
  burnWood: "#6E5440",
};
void Stamp; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void useCurrentFrame; void clamp01; void QMark;

// ===================================================================
// ファイル内ヘルパ
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
// 点(cx,cy)を中心に z 倍ズームする transform
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// ===================================================================
// ローカル部品 (このファイル専用)
// ===================================================================

// ふわふわ流れる雲
const CloudPuff: React.FC<{ x: number; y: number; s?: number; f: number; sp?: number; color?: string; op?: number }> =
  ({ x, y, s = 1, f, sp = 0.3, color = KRP.white, op = 0.8 }) => (
    <g transform={`translate(${x + f * sp} ${y + Math.sin(f / 16 + x) * 3}) scale(${s})`} opacity={op}>
      <ellipse cx={0} cy={0} rx={90} ry={30} fill={color} />
      <ellipse cx={-50} cy={8} rx={55} ry={22} fill={color} />
      <ellipse cx={55} cy={6} rx={60} ry={24} fill={color} />
    </g>
  );

// シルクハット (Person の頭に被せる。頭中心 = y-228*s 想定)
// f・phase・still は人物と同じ値を渡す。体ゆれを合わせないと帽子だけ取り残される
const TopHat: React.FC<{
  x: number; y: number; s?: number; color?: string;
  f?: number; phase?: number; still?: boolean;
}> = ({ x, y, s = 1, color = "#2C2622", f = 0, phase = 0, still = false }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob - 228 * s}) scale(${s})`}>
      <rect x={-52} y={-62} width={104} height={14} rx={6} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-36} y={-128} width={72} height={70} rx={6} fill={color} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// 着物の裾 (Person の脚の上に重ねる台形。足元 = y)
const KimonoSkirt: React.FC<{ x: number; y: number; s?: number; color?: string }> =
  ({ x, y, s = 1, color = "#5A6B55" }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -40 -62 L 40 -62 L 50 0 L -50 0 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={-56} x2={0} y2={-6} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
    </g>
  );

// ガス灯 (炎が f で揺れる)
const GasLamp: React.FC<{ x: number; y: number; s?: number; f: number; lit?: boolean }> =
  ({ x, y, s = 1, f, lit = false }) => {
    const fl = 1 + Math.sin(f / 3 + x) * 0.18;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-7} y={-300} width={14} height={300} fill="#3F4A50" stroke={KRP.ink} strokeWidth={4} />
        <rect x={-26} y={-310} width={52} height={14} rx={5} fill="#3F4A50" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -22 -310 L -16 -372 L 16 -372 L 22 -310 Z" fill="#DCE8EC" stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <path d="M -20 -372 L 0 -392 L 20 -372 Z" fill="#3F4A50" stroke={KRP.ink} strokeWidth={4} />
        {lit && <ellipse cx={0} cy={-340} rx={10 * fl} ry={15 * fl} fill={KRP.yellow} opacity={0.95} />}
        {!lit && <circle cx={0} cy={-340} r={7} fill={KRP.gray} opacity={0.7} />}
      </g>
    );
  };

// 人力車 (車輪が回る。run=true で車夫が走る)
const Jinrikisha: React.FC<{ x: number; y: number; s?: number; f: number; run?: boolean; hood?: string }> =
  ({ x, y, s = 1, f, run = true, hood = "#3E3A35" }) => {
    const rot = run ? f * 14 : 0;
    const bob = run ? Math.sin(f / 2.5) * 3 : 0;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 車輪 */}
        <g transform={`translate(0 -52) rotate(${rot})`}>
          <circle r={52} fill="none" stroke={KRP.ink} strokeWidth={7} />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1={-50} y1={0} x2={50} y2={0} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(${a})`} />
          ))}
          <circle r={9} fill={KRP.ink} />
        </g>
        {/* 座席と幌 */}
        <path d="M -56 -150 Q -70 -70 -40 -62 L 46 -62 L 46 -128 Q 10 -168 -56 -150 Z"
          fill={hood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-46} y={-108} width={78} height={48} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        {/* 乗客 (頭だけ覗く) */}
        <circle cx={-4} cy={-122} r={24} fill="#E8C49A" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-12} cy={-126} r={3.4} fill={KRP.ink} />
        {/* 梶棒 */}
        <line x1={40} y1={-66} x2={150} y2={-96} stroke={KRP.ink} strokeWidth={7} />
        {/* 車夫 */}
        <Person x={166} y={0} s={0.52} cloth="#4A5B6B" pose={run ? "run" : "hold"} f={f} still={!run} />
      </g>
    );
  };

// 茶屋の看板 (burnt で煤け半欠け)
const ChayaKanban: React.FC<{ x: number; y: number; s?: number; rot?: number; burnt?: boolean }> =
  ({ x, y, s = 1, rot = 0, burnt = false }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {burnt ? (
        <>
          <path d="M -70 -170 L 70 -170 L 66 -40 L 30 -18 L -8 -52 L -40 -24 L -70 -58 Z"
            fill="#8A7B64" stroke={C.charcoal} strokeWidth={6} />
          <text x={0} y={-96} textAnchor="middle" fontSize={78} fontWeight={900}
            fill={C.charcoal} fontFamily={FONT} opacity={0.85}>茶</text>
          <path d="M -66 -60 Q -20 -30 30 -22" stroke={C.qDark} strokeWidth={14} fill="none" opacity={0.5} strokeLinecap="round" />
          <circle cx={44} cy={-150} r={14} fill={C.qDark} opacity={0.4} />
          <circle cx={-52} cy={-120} r={10} fill={C.qDark} opacity={0.35} />
        </>
      ) : (
        <>
          <rect x={-70} y={-240} width={140} height={240} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-56} y={-226} width={112} height={212} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
          <text x={0} y={-140} textAnchor="middle" fontSize={76} fontWeight={900}
            fill={KRP.ink} fontFamily={FONT}>茶</text>
          <text x={0} y={-46} textAnchor="middle" fontSize={76} fontWeight={900}
            fill={KRP.ink} fontFamily={FONT}>屋</text>
        </>
      )}
    </g>
  );

// 額の汗 (KosoB0 の型)
const SweatDrop: React.FC<{ x: number; y: number; f: number; s?: number }> =
  ({ x, y, f, s = 1 }) => {
    const t = (f % 26) / 26;
    return (
      <g transform={`translate(${x} ${y + t * 26}) scale(${s})`} opacity={0.9 - t * 0.5}>
        <path d="M 0 -14 Q 9 2 0 10 Q -9 2 0 -14 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #114 第6章、犯人は、明治。
// 格: 山 / seed 1200
// 絵: 章扉。文明開化の銀座煉瓦街。ガス灯、人力車、洋装と和装の行き交い。遠くに劇場の普請
// どこ: 文明開化の銀座煉瓦街の大通り (昼)
// 演出: 煉瓦街が奥へ続く引きの構図。ガス灯の列・走る人力車・洋装と和装の通行人。遠景に劇場の普請足場。章扉は over で重ねる
// 動き: ゆっくりズームイン / 人力車が走る / 雲が流れる / 章扉がスライドイン
const Sg114: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.06, easeOut(seg(f, 0, 42)));
  const doorT = seg(f, 8, 26);
  return (
    <Frame f={f} seed={1200}
      over={<ChapterDoor num={6} title="犯人は明治" t={doorT} left={990} top={560} width={860} />}>
      <g transform={zoomAt(z, 760, 560)}>
        {/* 空と雲 */}
        <rect x={-40} y={-40} width={2000} height={660} fill={C.skyDay} />
        <CloudPuff x={300} y={150} f={f} sp={0.35} s={1.1} />
        <CloudPuff x={1100} y={100} f={f} sp={0.22} s={0.8} op={0.65} />
        {/* 遠景: 劇場の普請 (足場と骨組み) */}
        <g opacity={0.55}>
          <rect x={1210} y={300} width={300} height={310} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1190 300 L 1360 212 L 1530 300 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={1216} y1={340 + i * 86} x2={1504} y2={340 + i * 86} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={1240 + i * 76} y1={306} x2={1240 + i * 76} y2={606} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {/* 旗 */}
          <line x1={1360} y1={212} x2={1360} y2={158} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M 1360 158 q ${20 + Math.sin(f / 5) * 6} 6 44 2 l 0 22 q -${22 - Math.sin(f / 5) * 5} 5 -44 -2 Z`}
            fill={KRP.red} opacity={0.85} />
        </g>
        {/* 左: 煉瓦街の列 (奥へ退く) */}
        {[0, 1, 2].map((i) => {
          const bx = 40 + i * 330;
          const sc = 1 - i * 0.18;
          const by = 620 - i * 36;
          return (
            <g key={i} transform={`translate(${bx} ${by}) scale(${sc})`} opacity={1 - i * 0.14}>
              <rect x={0} y={-430} width={320} height={430} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((r) => (
                <line key={r} x1={4} y1={-404 + r * 52} x2={316} y2={-404 + r * 52} stroke={C.mortar} strokeWidth={3} opacity={0.7} />
              ))}
              {[0, 1].map((wv) => (
                <g key={wv}>
                  <rect x={46 + wv * 150} y={-360} width={86} height={120} rx={38} fill="#E9F0F0" stroke={KRP.ink} strokeWidth={5} />
                  <line x1={89 + wv * 150} y1={-356} x2={89 + wv * 150} y2={-244} stroke={KRP.ink} strokeWidth={3} />
                </g>
              ))}
              <rect x={100} y={-150} width={110} height={150} rx={8} fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
              {/* 軒の帯 */}
              <rect x={-8} y={-452} width={336} height={26} rx={6} fill={C.mortar} stroke={KRP.ink} strokeWidth={5} />
            </g>
          );
        })}
        {/* 道路 */}
        <rect x={-40} y={616} width={2000} height={470} fill={C.road} />
        <path d="M -40 616 L 1960 616" stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={160 + i * 330 + rnd(1200, i) * 80} cy={760 + rnd(1200, i + 9) * 180}
            rx={60} ry={10} fill={KRP.ink} opacity={0.13} />
        ))}
        {/* 轍と小石 */}
        <path d="M -40 980 Q 500 940 1100 962 Q 1500 976 1960 950" fill="none"
          stroke={KRP.ink} strokeWidth={5} opacity={0.14} />
        <path d="M -40 1030 Q 520 992 1120 1012 Q 1520 1026 1960 1002" fill="none"
          stroke={KRP.ink} strokeWidth={5} opacity={0.14} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={100 + i * 250 + rnd(1200, i + 20) * 120}
            cy={880 + rnd(1200, i + 30) * 160} r={5 + rnd(1200, i + 40) * 4}
            fill={KRP.ink} opacity={0.14} />
        ))}
        {/* ガス灯の列 */}
        <GasLamp x={430} y={880} s={1.05} f={f} />
        <GasLamp x={960} y={760} s={0.78} f={f} />
        <GasLamp x={1310} y={690} s={0.55} f={f} />
        {/* 人力車 (左から右へ走り抜ける) */}
        <g transform={`translate(${lerp(40, 300, seg(f, 0, 42))} 0)`}>
          <Jinrikisha x={560} y={900} s={1.0} f={f} run />
        </g>
        {/* 通行人: 洋装と和装 */}
        <g>
          <Person x={1500} y={930} s={0.78} cloth="#55606E" f={f} gaze={[-5, 0]} />
          <TopHat x={1500} y={930} s={0.78} f={f} />
          <KimonoSkirt x={1710} y={940} s={0.82} color="#7B5B6E" />
          <Person x={1710} y={940} s={0.82} cloth="#7B5B6E" hair="none" f={f} phase={1} gaze={[-5, 0]} />
          <ellipse cx={1500} cy={934} rx={66} ry={12} fill={KRP.ink} opacity={0.14} />
          <ellipse cx={1710} cy={944} rx={66} ry={12} fill={KRP.ink} opacity={0.14} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #115 では、日本の劇場は、どうだったのでしょうか。
// 格: 並 / seed 1201
// 絵: 地球儀がくるりと戻って日本へ。芝居小屋の屋根にピン
// どこ: 書斎の机の上の地球儀 (ランプの灯る夕方)
// 演出: 大きな地球儀が主役。経線ごと回って日本が正面に来る。小さな芝居小屋がぽんと出て赤ピンが屋根に刺さる。横で学者が指さす
// 動き: 地球儀の回転 (くるり) / ピンの落下 / ランプの炎の揺れ / くるり軌跡の点線
const Sg115: React.FC<{ f: number }> = ({ f }) => {
  // 地球儀がくるりと回って、日本が正面に来る (正面の経度そのものを動かす)
  const lon0 = lerp(6, 138, easeOut(seg(f, 2, 28)));
  const hutT = pop(seg(f, 27, 35));
  const pinT = easeOut(seg(f, 32, 40));
  const R = 300;
  const GX = 860, GY = 490;
  const TILT = 14;
  const fl = 1 + Math.sin(f / 3) * 0.2;
  // 球の上の一点を、台座の g (原点 = 球の中心) の座標へ。地軸の傾きのぶんだけ回す
  const gpt = (lon: number, lat: number): [number, number] | null => {
    const p = chikyuTen(lon, lat, R, lon0);
    if (!p) return null;
    const t = (TILT * Math.PI) / 180;
    return [p[0] * Math.cos(t) - p[1] * Math.sin(t), p[0] * Math.sin(t) + p[1] * Math.cos(t)];
  };
  const nippon = gpt(138.5, 36.5);
  return (
    <Frame f={f} seed={1201}>
      {/* 書斎の壁と本棚 */}
      <rect x={0} y={0} width={W} height={H} fill="#5E4A38" />
      <rect x={60} y={120} width={440} height={560} rx={10} fill="#4A3828" stroke={KRP.ink} strokeWidth={7} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={80} y={150 + r * 180} width={400} height={150} fill="#3C2D20" />
          {[0, 1, 2, 3, 4, 5, 6].map((b) => (
            <rect key={b} x={96 + b * 55} y={168 + r * 180 + rnd(1201, r * 9 + b) * 16}
              width={40} height={130 - rnd(1201, r * 9 + b) * 16}
              fill={[C.lacqRed, C.norenAi, C.land, KRP.grayDark][(r + b) % 4]}
              stroke={KRP.ink} strokeWidth={3} />
          ))}
          <rect x={76} y={300 + r * 180} width={408} height={12} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {/* 窓 (夕空) */}
      <rect x={1520} y={110} width={330} height={470} rx={10} fill={C.duskMid} stroke={KRP.ink} strokeWidth={7} />
      <rect x={1520} y={110} width={330} height={200} fill={C.duskTop} opacity={0.8} />
      <circle cx={1660} cy={250} r={26} fill={C.glow} opacity={0.9} />
      <line x1={1685} y1={114} x2={1685} y2={576} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1524} y1={340} x2={1846} y2={340} stroke={KRP.ink} strokeWidth={5} />
      {/* 机 */}
      <rect x={200} y={760} width={1560} height={60} rx={10} fill={C.deskWood} stroke={KRP.ink} strokeWidth={7} />
      <rect x={260} y={820} width={60} height={200} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1640} y={820} width={60} height={200} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* ランプ */}
      <g transform="translate(1430 760)">
        <rect x={-16} y={-36} width={32} height={36} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -30 -36 L -16 -118 L 16 -118 L 30 -36 Z" fill={C.glow} opacity={0.85} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-76} rx={10 * fl} ry={16 * fl} fill={KRP.orange} opacity={0.9} />
        <circle cx={0} cy={-80} r={120 * fl} fill={C.glow} opacity={0.12} />
      </g>
      {/* 地球儀の台座 */}
      <g transform={`translate(${GX} ${GY})`}>
        <path d={`M 0 ${R + 36} L 0 ${R + 92}`} stroke={KRP.ink} strokeWidth={14} />
        <ellipse cx={0} cy={R + 108} rx={150} ry={26} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 弓metal */}
        <path d={`M ${-R - 34} 0 A ${R + 34} ${R + 34} 0 0 0 ${R + 34} 0`}
          transform="rotate(14)" fill="none" stroke={KRP.brass} strokeWidth={14} />
        {/* 球。海岸線は実際の経度・緯度、経緯線は正射図法の式どおりの位置 */}
        <ChikyuGi cx={0} cy={0} r={R} lon0={lon0} tilt={TILT}
          sea={C.sea} land={C.land} ink={KRP.ink} grid={KRP.white} landWidth={4}>
          {/* 日本列島だけ朱で塗り直す (球と一緒に傾く) */}
          {[HONSHU, HOKKAIDO, KYUSHU, SHIKOKU].map((poly, i) => {
            const d = chikyuPath(poly, R, lon0);
            return d ? (
              <path key={i} d={d} fill={KRP.red} stroke={KRP.ink} strokeWidth={4}
                strokeLinejoin="round" />
            ) : null;
          })}
        </ChikyuGi>
        {/* くるり軌跡 */}
        <path d={`M ${-R - 70} -60 A ${R + 70} ${R + 70} 0 0 1 60 ${-R - 66}`}
          fill="none" stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 16"
          opacity={0.5 * (1 - seg(f, 24, 34))} />
        <path d="M 60 -366 l 36 -14 l -8 38 Z" transform={`translate(0 ${-R + 300 - 300})`}
          fill={KRP.ink} opacity={0.5 * (1 - seg(f, 24, 34))} />
        {/* 日本を丸で囲んで、そこから芝居小屋へ引き出す */}
        {nippon && hutT > 0.05 && (
          <g opacity={Math.min(hutT, 1) * 0.9}>
            <circle cx={nippon[0]} cy={nippon[1]} r={30} fill="none"
              stroke={KRP.ink} strokeWidth={5} />
            <line x1={nippon[0] + 24} y1={nippon[1] + 20} x2={nippon[0] + 108} y2={nippon[1] + 94}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 芝居小屋 + ピン (日本のすぐ脇、太平洋の上に建つ) */}
        <g transform={`translate(${nippon ? nippon[0] + 146 : 0} ${nippon ? nippon[1] + 128 : 0}) scale(${hutT * 0.9})`}
          opacity={nippon ? 1 : 0}>
          <rect x={-44} y={-24} width={88} height={54} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -58 -24 L 0 -66 L 58 -24 Z" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 櫓 */}
          <rect x={-14} y={-92} width={28} height={28} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
          {/* ピン */}
          <g transform={`translate(0 ${lerp(-260, -66, pinT)})`} opacity={pinT > 0.02 ? 1 : 0}>
            <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-46} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {pinT > 0.9 && (
            <g opacity={0.8}>
              <line x1={-30} y1={-100} x2={-44} y2={-116} stroke={KRP.orange} strokeWidth={5} />
              <line x1={30} y1={-100} x2={44} y2={-116} stroke={KRP.orange} strokeWidth={5} />
            </g>
          )}
        </g>
      </g>
      {/* 学者 (指さす) */}
      <Person x={1620} y={1010} s={1.0} cloth="#4A5B50" glasses f={f}
        pose="point" pointDir={-1} gaze={[-5, 0]} face="smile" />
      <ellipse cx={1620} cy={1014} rx={90} ry={16} fill={KRP.ink} opacity={0.2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #116 こちらも犯人は、放送ではありません。明治の近代化です。
// 格: 図 / seed 1202
// 絵: `MaruBatsu`。容疑者ラジオに×(まだ生まれてもいない)、「明治の近代化」の烏帽子…ではなく紋付の札に○
// どこ: 板壁に貼られた大きな和紙の見立て図
// 演出: MaruBatsu。左=まだ存在しないラジオ (点線の幽霊+?)、右=紋付羽織を衣桁に掛けた「明治の近代化」。和紙の四隅に画鋲
// 動き: MaruBatsu の登場 pop / ラジオの幽霊が明滅 / ? がふわふわ / 行灯の明かりが揺れる
const Sg116: React.FC<{ f: number }> = ({ f }) => {
  const ghost = 0.35 + Math.sin(f / 6) * 0.15;
  const fl = 0.1 + Math.sin(f / 3.4) * 0.03;
  return (
    <Frame f={f} seed={1202}>
      {/* 板壁 */}
      <rect x={0} y={0} width={W} height={H} fill={C.plankWall} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <line x1={i * 250 + 30} y1={0} x2={i * 250 + 30} y2={H} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
          <path d={`M ${i * 250 + 140} ${180 + rnd(1202, i) * 600} q 18 8 36 0`}
            stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.25} />
        </g>
      ))}
      {/* 行灯の明かりだまり */}
      <circle cx={240} cy={930} r={260} fill={C.glow} opacity={fl} />
      <g transform="translate(240 1020)">
        <rect x={-52} y={-150} width={104} height={150} rx={8} fill={C.washi} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
        <line x1={0} y1={-146} x2={0} y2={-4} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        <ellipse cx={0} cy={-80} rx={13} ry={19} fill={KRP.orange} opacity={0.8 + Math.sin(f / 3) * 0.15} />
      </g>
      {/* 大きな和紙 */}
      <rect x={160} y={120} width={1600} height={780} rx={14} fill={C.washi} stroke={KRP.ink} strokeWidth={8} />
      <rect x={180} y={140} width={1560} height={740} rx={10} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      {[[192, 152], [1728, 152], [192, 868], [1728, 868]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* MaruBatsu 本体 */}
      <MaruBatsu x={960} y={660} t={seg(f, 6, 20)} gap={760}
        leftText="ラジオ" rightText="明治の近代化" labelSize={40}
        leftNode={
          <g opacity={ghost}>
            {/* まだ生まれていないラジオ: 点線の幽霊 */}
            <rect x={-110} y={-190} width={220} height={150} rx={16} fill="none"
              stroke={KRP.grayDark} strokeWidth={6} strokeDasharray="16 12" />
            <circle cx={-48} cy={-115} r={40} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="10 9" />
            <rect x={14} y={-150} width={72} height={70} rx={8} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="10 9" />
            <path d="M 60 -190 L 110 -250" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="10 9" fill="none" />
          </g>
        }
        rightNode={
          <g transform="scale(0.76)">
            {/* 衣桁に掛かった紋付羽織 */}
            <line x1={-130} y1={-300} x2={130} y2={-300} stroke={SGP.woodDark} strokeWidth={10} />
            <line x1={-118} y1={-300} x2={-118} y2={0} stroke={SGP.woodDark} strokeWidth={10} />
            <line x1={118} y1={-300} x2={118} y2={0} stroke={SGP.woodDark} strokeWidth={10} />
            <path d="M -96 -290 L -40 -256 L -40 -40 L -96 -60 Z" fill={C.kuro} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 96 -290 L 40 -256 L 40 -40 L 96 -60 Z" fill={C.kuro} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -40 -256 L 0 -238 L 40 -256 L 40 -40 L -40 -40 Z" fill={C.kuro} stroke={KRP.ink} strokeWidth={5} />
            {/* 白い家紋 */}
            <circle cx={-68} cy={-230} r={11} fill={KRP.white} />
            <circle cx={68} cy={-230} r={11} fill={KRP.white} />
            <circle cx={0} cy={-200} r={11} fill={KRP.white} />
            {/* 襟の白 */}
            <path d="M -40 -256 L 0 -238 L 40 -256" fill="none" stroke={KRP.white} strokeWidth={7} />
          </g>
        }
      />
      {/* ラジオ側に ? (まだ居ない感) */}
      <QMark x={330} y={310} s={0.7} f={f} t={seg(f, 18, 28)} color={KRP.grayDark} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #117 1886年、演劇改良会という団体が立ち上がります。
// 格: 並 / seed 1203
// 絵: 発足式。紋付と燕尾服が入り混じる面々、「演劇改良会」の看板を掛ける
// どこ: 洋風事務所の玄関前 発足式 (昼)
// 演出: 紅白幕の掛かる玄関に縦看板「演劇改良会」を梯子の男が掛ける瞬間。下に紋付と燕尾服が入り混じって見上げ、万歳する群衆
// 動き: 看板が傾きから pop で水平に収まる / 群衆の腕が上がる / 幕が揺れる
const Sg117: React.FC<{ f: number }> = ({ f }) => {
  const hang = pop(seg(f, 8, 24));
  const rot = lerp(14, 0, hang) + Math.sin(f / 10) * (1 - seg(f, 20, 34)) * 3;
  const chars = ["演", "劇", "改", "良", "会"];
  return (
    <Frame f={f} seed={1203}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={620} fill={C.skyDay} />
      <CloudPuff x={260} y={130} f={f} sp={0.25} s={0.9} />
      {/* 建物 */}
      <rect x={340} y={140} width={1240} height={760} fill={C.shirokabe} stroke={KRP.ink} strokeWidth={8} />
      <rect x={320} y={100} width={1280} height={56} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={430 + i * 920} y={220} width={140} height={200} rx={54} fill="#DCE8EC" stroke={KRP.ink} strokeWidth={6} />
          <line x1={500 + i * 920} y1={226} x2={500 + i * 920} y2={414} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 玄関と紅白幕 */}
      <rect x={760} y={470} width={400} height={430} fill="#4A3828" stroke={KRP.ink} strokeWidth={7} />
      <rect x={790} y={510} width={340} height={390} fill="#2E2218" stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i}
          d={`M ${640 + i * 80} 440 Q ${680 + i * 80} ${520 + Math.sin(f / 8 + i) * 8} ${720 + i * 80} 440 L ${720 + i * 80} 440 Z`}
          fill={i % 2 === 0 ? C.kohaku : KRP.white} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <line x1={620} y1={440} x2={1300} y2={440} stroke={KRP.ink} strokeWidth={6} />
      {/* 縦看板 (掛ける途中→収まる) */}
      <g transform={`translate(700 ${lerp(430, 480, hang)}) rotate(${rot})`}>
        <rect x={-52} y={0} width={104} height={420} rx={8} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        {chars.map((ch, i) => (
          <text key={i} x={0} y={78 + i * 78} textAnchor="middle" fontSize={62} fontWeight={900}
            fill={KRP.ink} fontFamily={FONT} opacity={hang > 0.2 ? 1 : 0.6}>{ch}</text>
        ))}
        <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 梯子と掛け役 */}
      <g>
        <line x1={420} y1={900} x2={480} y2={420} stroke={SGP.wood} strokeWidth={10} />
        <line x1={510} y1={900} x2={570} y2={420} stroke={SGP.wood} strokeWidth={10} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={432 + i * 10} y1={820 - i * 72} x2={522 + i * 10} y2={820 - i * 72}
            stroke={SGP.woodDark} strokeWidth={7} />
        ))}
        <Person x={536} y={560} s={0.62} cloth="#5B6E55" f={f} pose="raise" gaze={[5, 0]} />
      </g>
      {/* 地面 */}
      <rect x={0} y={880} width={W} height={200} fill={C.road} />
      <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      {/* 面々: 紋付と燕尾服 */}
      <KimonoSkirt x={930} y={1016} s={0.9} color={C.kuro} />
      <Person x={930} y={1016} s={0.9} cloth={C.kuro} hair="none" f={f} gaze={[-5, 0]} face="smile" />
      <Person x={1130} y={1020} s={0.92} cloth="#3A3F4C" f={f} phase={2} gaze={[-5, 0]} face="smile" />
      <TopHat x={1130} y={1020} s={0.92} color="#3A3F4C" f={f} phase={2} />
      <KimonoSkirt x={1330} y={1012} s={0.86} color="#4C4338" />
      <Person x={1330} y={1012} s={0.86} cloth="#4C4338" hair="none" f={f} phase={4} gaze={[-5, 0]} pose="banzai" face="joy" />
      {[930, 1130, 1330].map((px) => (
        <ellipse key={px} cx={px} cy={1020} rx={82} ry={14} fill={KRP.ink} opacity={0.16} />
      ))}
      {/* 群衆 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <PersonMini key={i} x={1540 + i * 85} y={990 + rnd(1203, i) * 26} s={1.05}
          color={[KRP.blue, C.kohaku, KRP.green, KRP.gray, C.norenAi][i]} f={f} phase={i * 2}
          face="smile" arms={i % 2 === 0 ? "up" : "down"} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #118 彼らの考えはこうです。西洋に見せて恥ずかしくない、上品な演劇にしたい。
// 格: 並 / seed 1204
// 絵: 洋館の広間。外国の賓客の視線を気にしながら劇場の絵を見せる役人。額の汗
// どこ: 洋館の広間 (夜会。シャンデリアの下)
// 演出: イーゼルの劇場スケッチを役人が指し示し、シルクハットとドレスの賓客がじっと見る。役人の額に汗
// 動き: 汗が落ち続ける / シャンデリアの蝋燭が揺れる / カーテンが揺れる / ゆるズーム
const Sg118: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.05, 1, easeOut(seg(f, 0, 40)));
  return (
    <Frame f={f} seed={1204}>
      <g transform={zoomAt(z, 960, 600)}>
        {/* 壁 (腰板+ストライプ壁紙) */}
        <rect x={0} y={0} width={W} height={760} fill={C.wallpaper} />
        {[...Array(16)].map((_, i) => (
          <rect key={i} x={i * 124} y={0} width={44} height={760} fill={KRP.white} opacity={0.35} />
        ))}
        <rect x={0} y={640} width={W} height={120} fill={C.dado} stroke={KRP.ink} strokeWidth={5} />
        {[...Array(10)].map((_, i) => (
          <rect key={i} x={30 + i * 192} y={662} width={140} height={76} rx={8} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        ))}
        {/* 窓とカーテン (夜) */}
        <rect x={110} y={120} width={330} height={480} rx={12} fill={C.duskTop} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={240} cy={240} r={22} fill={C.glow} opacity={0.9} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={160 + rnd(1204, i) * 240} cy={160 + rnd(1204, i + 5) * 160} r={3}
            fill={KRP.white} opacity={0.5 + Math.sin(f / 5 + i * 2) * 0.4} />
        ))}
        <line x1={275} y1={124} x2={275} y2={596} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 90 110 Q ${150 + Math.sin(f / 9) * 8} 360 120 610 L 70 610 L 70 110 Z`}
          fill={C.carpet} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 460 110 Q ${410 - Math.sin(f / 9) * 8} 360 440 610 L 480 610 L 480 110 Z`}
          fill={C.carpet} stroke={KRP.ink} strokeWidth={5} />
        {/* シャンデリア */}
        <g transform="translate(1210 0)">
          <line x1={0} y1={0} x2={0} y2={120} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -150 120 Q 0 200 150 120" fill="none" stroke={KRP.brass} strokeWidth={10} />
          {[-150, -75, 0, 75, 150].map((cx2, i) => (
            <g key={i} transform={`translate(${cx2} ${120 + Math.abs(Math.sin((cx2 / 150) * 1.57)) * 0 + (cx2 === 0 ? 62 : Math.abs(cx2) === 75 ? 48 : 0)})`}>
              <rect x={-6} y={-26} width={12} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={0} cy={-34} rx={6} ry={10 * (1 + Math.sin(f / 3 + i) * 0.25)} fill={KRP.orange} opacity={0.9} />
            </g>
          ))}
          <circle cx={0} cy={150} r={200} fill={C.glow} opacity={0.08 + Math.sin(f / 6) * 0.02} />
        </g>
        {/* 床 */}
        <rect x={0} y={760} width={W} height={320} fill={C.carpet} />
        <line x1={0} y1={760} x2={W} y2={760} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        {[...Array(6)].map((_, i) => (
          <path key={i} d={`M ${120 + i * 320} 800 q 60 20 120 0`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.18} />
        ))}
        {/* イーゼルと劇場スケッチ */}
        <g transform="translate(700 0)">
          <line x1={-80} y1={960} x2={0} y2={430} stroke={SGP.woodDark} strokeWidth={10} />
          <line x1={80} y1={960} x2={0} y2={430} stroke={SGP.woodDark} strokeWidth={10} />
          <line x1={0} y1={960} x2={0} y2={620} stroke={SGP.woodDark} strokeWidth={8} />
          <rect x={-190} y={440} width={380} height={300} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
          <rect x={-170} y={460} width={340} height={260} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          {/* スケッチ: 劇場の正面 */}
          <g opacity={0.9}>
            <rect x={-120} y={560} width={240} height={110} fill="none" stroke={KRP.ink} strokeWidth={4} />
            <path d="M -140 560 L 0 495 L 140 560 Z" fill="none" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-30} y={610} width={60} height={60} fill="none" stroke={KRP.ink} strokeWidth={3} />
            <line x1={-90} y1={590} x2={-50} y2={590} stroke={KRP.ink} strokeWidth={3} />
            <line x1={50} y1={590} x2={90} y2={590} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 役人 (指し示す・汗) */}
        <KimonoSkirt x={1010} y={1000} s={1.05} color={C.kuro} />
        <Person x={1010} y={1000} s={1.05} cloth={C.kuro} hair="none" f={f}
          pose="point" pointDir={-1} gaze={[5, 0]} face="worried" />
        <SweatDrop x={1065} y={740} f={f} s={1.2} />
        <SweatDrop x={1085} y={760} f={f + 12} s={0.9} />
        {/* 賓客ふたり (じっと見る) */}
        <Person x={1430} y={1004} s={1.0} cloth="#3A3F4C" glasses f={f} phase={3} gaze={[-5, 0]} />
        <TopHat x={1430} y={1004} s={1.0} color="#3A3F4C" f={f} phase={3} />
        <path d="M 1560 1004 L 1700 1004 L 1676 870 L 1584 870 Z" fill="#7B4A5E" stroke={KRP.ink} strokeWidth={5} />
        <Person x={1630} y={1004} s={0.98} cloth="#7B4A5E" hair="none" f={f} phase={5} gaze={[-5, 0]} />
        {[1010, 1430, 1630].map((px) => (
          <ellipse key={px} cx={px} cy={1008} rx={90} ry={15} fill={KRP.ink} opacity={0.18} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #119 そこでやり玉に挙がったのが、芝居茶屋と、客席の飲み食いでした。
// 格: 山 / seed 1205
// 絵: **事件**。明治の洋装の紳士 (演劇改良会) が、左の「芝居茶屋」と右の「桟敷の飲み食い」を
//     2つの標的として指さし、帳面に書き付ける。標的には赤い的の輪が順に照準を合わせる
// どこ: 芝居町の通り (午後)。左=芝居茶屋の店構え / 右=芝居小屋の中を覗かせた桟敷
// 演出: 標的を左右にはっきり2つに分ける。中央の朱札「改良対象」から左右へ矢印
// 動き: 的の輪が左→右の順に照準を合わせる / 暖簾と提灯が揺れる / 湯呑の湯気 / 帳面の筆 / ゆるズーム

// 明治の紳士の扮装 (フロックコート・山高帽・口ひげ)。Person と同じ変換の入れ物に重ねる (共通の掟の Kasane)
const Shinshi: React.FC<{
  x: number; y: number; s?: number; lean?: number; f: number; phase?: number;
  coat?: string; extra?: React.ReactNode; children: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f, phase = 0, coat = "#2E3036", extra, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {children}
      {/* フロックコートの裾 (膝上まで。前の合わせが少し開く) */}
      <path d="M -60 -70 L 60 -70 L 66 -20 L 10 -20 L 0 -44 L -10 -20 L -66 -20 Z"
        fill={coat} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <line x1={-56} y1={-66} x2={56} y2={-66} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
      {/* シャツの V と襟 (ラペル) */}
      <path d="M -24 -160 L 24 -160 L 0 -112 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -24 -160 L 0 -112 L -14 -104 L -40 -156 Z" fill="#1E2024" stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 24 -160 L 0 -112 L 14 -104 L 40 -156 Z" fill="#1E2024" stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 蝶ネクタイ */}
      <path d="M 0 -152 L -16 -160 L -16 -144 Z M 0 -152 L 16 -160 L 16 -144 Z" fill={KRP.ink} />
      <circle cx={0} cy={-152} r={4} fill={KRP.ink} />
      {/* ボタンと懐中時計の鎖 */}
      {[-92, -78].map((by) => (
        <circle key={by} cx={0} cy={by} r={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
      ))}
      <path d="M -34 -96 Q -14 -84 2 -92" fill="none" stroke={KRP.brass} strokeWidth={3.5} strokeLinecap="round" />
      {/* 口ひげ (八の字) */}
      <path d="M 0 -197 C -8 -205 -22 -206 -34 -196 C -28 -191 -22 -190 -16 -193 C -10 -196 -4 -195 0 -192 Z"
        fill={KRP.ink} />
      <path d="M 0 -197 C 8 -205 22 -206 34 -196 C 28 -191 22 -190 16 -193 C 10 -196 4 -195 0 -192 Z"
        fill={KRP.ink} />
      {/* 山高帽 (シルクハット)。頭のてっぺん -292 にのせる */}
      <rect x={-40} y={-374} width={80} height={92} rx={7} fill="#24262B" stroke={KRP.ink} strokeWidth={5} />
      <rect x={-40} y={-312} width={80} height={14} fill="#5A4048" stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M -64 -286 Q 0 -298 64 -286 L 60 -274 Q 0 -284 -60 -274 Z"
        fill="#24262B" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <line x1={-28} y1={-366} x2={-28} y2={-318} stroke={KRP.white} strokeWidth={4} opacity={0.18} strokeLinecap="round" />
      {extra}
    </g>
  );
};

// 的の輪 (照準)。t: 0→1 で大きい輪から絞り込んで止まる
const MatoRing: React.FC<{ x: number; y: number; r: number; t: number; f: number }> =
  ({ x, y, r, t, f }) => {
    if (t <= 0) return null;
    const e = easeOut(t);
    const sc = lerp(1.6, 1, e);
    const rot = (1 - e) * 70 + Math.sin(f / 22) * 2;
    const pulse = 1 + Math.sin(f / 7) * 0.012 * e;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc * pulse}) rotate(${rot})`} opacity={Math.min(1, t * 2)}>
        <circle r={r} fill={KRP.red} opacity={0.07} />
        <circle r={r} fill="none" stroke={KRP.white} strokeWidth={18} opacity={0.55} />
        <circle r={r} fill="none" stroke={KRP.red} strokeWidth={11} />
        <circle r={r * 0.62} fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.75} strokeDasharray="26 16" />
        {[45, 135, 225, 315].map((a) => (
          <line key={a} x1={r * 0.8} y1={0} x2={r * 1.14} y2={0} stroke={KRP.red} strokeWidth={10}
            strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
      </g>
    );
  };

// 芝居茶屋の店構え (2階建て・瓦屋根・暖簾・格子・提灯・縁台)。x,y = 1階の床の左端
const ShibaiChaya: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const kawara = "#5E6268";
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 2階の壁と格子窓 */}
      <rect x={50} y={-410} width={620} height={190} fill="#E6DAC0" stroke={KRP.ink} strokeWidth={7} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${100 + i * 196} -384)`}>
          <rect x={0} y={0} width={150} height={120} fill="#4A3A2C" stroke={KRP.ink} strokeWidth={5} />
          <rect x={6} y={6} width={138} height={108} fill={C.glow} opacity={0.35} />
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={15 + k * 15} y1={4} x2={15 + k * 15} y2={116} stroke={SGP.woodDark} strokeWidth={5} />
          ))}
          <line x1={0} y1={60} x2={150} y2={60} stroke={SGP.woodDark} strokeWidth={5} />
        </g>
      ))}
      {/* 大屋根 (瓦) */}
      <path d="M -10 -406 L 730 -406 L 680 -488 L 40 -488 Z" fill={kawara} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: 25 }, (_, k) => (
        <line key={k} x1={20 + k * 29} y1={-484} x2={4 + k * 29.6} y2={-410} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      ))}
      <rect x={30} y={-504} width={660} height={20} rx={6} fill="#4A4E54" stroke={KRP.ink} strokeWidth={5} />
      <path d="M 18 -500 q -4 -34 26 -30 l 0 26 Z" fill="#4A4E54" stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M 702 -500 q 4 -34 -26 -30 l 0 26 Z" fill="#4A4E54" stroke={KRP.ink} strokeWidth={4.5} />
      {/* 1階のひさし (瓦) */}
      <path d="M -30 -196 L 750 -196 L 720 -240 L 0 -240 Z" fill={kawara} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: 26 }, (_, k) => (
        <line key={k} x1={8 + k * 28} y1={-238} x2={-8 + k * 29} y2={-198} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
      ))}
      {/* 1階: 柱と格子と店の奥 */}
      <rect x={50} y={-196} width={620} height={196} fill="#5A4433" stroke={KRP.ink} strokeWidth={6} />
      <rect x={230} y={-190} width={260} height={190} fill="#2E241C" />
      <rect x={236} y={-120} width={248} height={120} fill={C.glow} opacity={0.22} />
      {[50, 230, 490, 670].map((px) => (
        <rect key={px} x={px - 9} y={-196} width={18} height={196} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {Array.from({ length: 10 }, (_, k) => (
        <line key={k} x1={66 + k * 16} y1={-186} x2={66 + k * 16} y2={-6} stroke={SGP.wood} strokeWidth={6} />
      ))}
      {/* 暖簾 (3枚。丸紋) */}
      {[0, 1, 2].map((i) => {
        const sw = Math.sin(f / 9 + i * 0.9) * 6;
        const x0 = 240 + i * 82;
        return (
          <g key={i}>
            <path d={`M ${x0} -192 L ${x0 + 78} -192 L ${x0 + 78 + sw} -84 L ${x0 + sw * 0.8} -84 Z`}
              fill={C.norenAi} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            {i === 1 && (
              <g transform={`translate(${x0 + 39 + sw * 0.4} -140)`}>
                <circle r={26} fill="none" stroke={KRP.white} strokeWidth={6} />
                <circle r={10} fill={KRP.white} />
              </g>
            )}
          </g>
        );
      })}
      <line x1={232} y1={-192} x2={490} y2={-192} stroke={KRP.ink} strokeWidth={6} />
      {/* 縁台 (緋毛氈と茶盆) */}
      <g transform="translate(580 -6)">
        <rect x={-80} y={-60} width={160} height={18} rx={4} fill={C.kohaku} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-66} y1={-42} x2={-66} y2={0} stroke={KRP.ink} strokeWidth={7} />
        <line x1={66} y1={-42} x2={66} y2={0} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-40} y={-72} width={70} height={12} rx={4} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M -30 -72 L -28 -94 L -10 -94 L -8 -72 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M 2 -72 L 4 -90 L 20 -90 L 22 -72 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 軒の提灯 2つ */}
      {[100, 620].map((px, i) => (
        <g key={px} transform={`translate(${px} -196) rotate(${Math.sin(f / 10 + i * 2) * 5})`}>
          <line x1={0} y1={0} x2={0} y2={16} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={14} width={32} height={10} rx={3} fill={KRP.ink} />
          <ellipse cx={0} cy={66} rx={38} ry={44} fill={C.chochin} stroke={KRP.ink} strokeWidth={5} />
          {[-22, 0, 22].map((yy) => (
            <path key={yy} d={`M -36 ${66 + yy} Q 0 ${72 + yy} 36 ${66 + yy}`} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.45} />
          ))}
          <circle cx={0} cy={66} r={14} fill="none" stroke={C.lacqRed} strokeWidth={5} />
          <rect x={-16} y={108} width={32} height={10} rx={3} fill={KRP.ink} />
        </g>
      ))}
    </g>
  );
};

// 桟敷の飲み食い (芝居小屋の中を覗かせる。手すりの上に広げた重箱・徳利・湯呑)。x,y = 桟敷の床の左端
const SajikiNomikui: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const steam = (i: number) => {
    const t = ((f + i * 20) % 40) / 40;
    return (
      <path key={i} d={`M 0 0 C ${8 + Math.sin(f / 6 + i) * 5} -14 ${-8} -26 ${2} ${-40}`}
        transform={`translate(0 ${-t * 16})`} fill="none" stroke={KRP.white} strokeWidth={4.5}
        strokeLinecap="round" opacity={0.75 * (1 - t)} />
    );
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 小屋の大屋根と梁 */}
      <path d="M -60 -500 L 880 -500 L 830 -580 L -10 -580 Z" fill="#5E6268" stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: 30 }, (_, k) => (
        <line key={k} x1={0 + k * 29} y1={-576} x2={-40 + k * 30.5} y2={-504} stroke={KRP.ink} strokeWidth={3} opacity={0.32} />
      ))}
      {/* 中の奥壁 */}
      <rect x={0} y={-500} width={820} height={500} fill="#5B4232" stroke={KRP.ink} strokeWidth={7} />
      <rect x={0} y={-500} width={820} height={46} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {[200, 410, 620].map((px) => (
        <rect key={px} x={px - 8} y={-454} width={16} height={454} fill="#4A3426" opacity={0.8} />
      ))}
      {/* 奥に覗く定式幕 (黒・柿・萌葱) */}
      <g>
        {Array.from({ length: 6 }, (_, k) => (
          <rect key={k} x={706 + k * 19} y={-454} width={19} height={360}
            fill={[C.kuro, C.kabukiKaki, C.kabukiMoegi][k % 3]} />
        ))}
        <rect x={706} y={-454} width={114} height={360} fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 梁から下がる提灯 */}
      {[90, 300, 520].map((px, i) => (
        <g key={px} transform={`translate(${px} -454) rotate(${Math.sin(f / 11 + i * 1.7) * 4})`}>
          <line x1={0} y1={0} x2={0} y2={14} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-22} y={12} width={44} height={74} rx={18} fill={C.chochin} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-20} y1={36} x2={20} y2={36} stroke={KRP.ink} strokeWidth={2.5} opacity={0.45} />
          <line x1={-20} y1={60} x2={20} y2={60} stroke={KRP.ink} strokeWidth={2.5} opacity={0.45} />
          <circle cx={0} cy={48} r={30} fill={C.glow} opacity={0.18} />
        </g>
      ))}
      {/* 桟敷の客 (手すりの奥に座る) */}
      <PersonMini x={72} y={-120} s={0.92} color="#7B5B6E" f={f} phase={1} face="smile" />
      <PersonMini x={640} y={-120} s={0.9} color={KRP.blueDeep} f={f} phase={3} face="smile" arms="up" />
      {/* 手すり (朱塗り) と下の羽目板 */}
      <rect x={-10} y={-130} width={840} height={24} rx={6} fill={C.lacqRed} stroke={KRP.ink} strokeWidth={6} />
      <rect x={0} y={-106} width={820} height={106} fill="#7A5A3E" stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 13 }, (_, k) => (
        <line key={k} x1={30 + k * 64} y1={-100} x2={30 + k * 64} y2={-6} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
      ))}
      {/* 手すりに広げた緋毛氈 */}
      <path d="M 220 -132 L 560 -132 L 566 -96 L 214 -96 Z" fill={C.kohaku} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 重箱 (2段を並べて開けた) */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${250 + i * 132} -132)`}>
          <path d="M 0 0 L 116 0 L 116 -34 L 0 -34 Z" fill={C.kuro} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 0 -34 L 116 -34 L 100 -70 L 16 -70 Z" fill={C.lacqRed} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <line x1={58} y1={-34} x2={58} y2={-70} stroke={KRP.ink} strokeWidth={3} />
          {i === 0 ? (
            <g>
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M ${18 + k * 26} -40 L ${30 + k * 26} -62 L ${42 + k * 26} -40 Z`}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
              ))}
              <rect x={66} y={-58} width={36} height={16} rx={3} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ) : (
            <g>
              <ellipse cx={30} cy={-50} rx={16} ry={9} fill="#E8A0A0" stroke={KRP.ink} strokeWidth={3} />
              <circle cx={84} cy={-52} r={12} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
              <rect x={56} y={-62} width={8} height={22} fill={KRP.orange} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          )}
        </g>
      ))}
      {/* 徳利と湯呑 2つ (湯気) */}
      <g transform="translate(540 -132)">
        <path d="M -24 0 Q -32 -46 -12 -64 L -12 -82 Q -12 -90 0 -90 Q 12 -90 12 -82 L 12 -64 Q 32 -46 24 0 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -20 -36 Q 0 -42 20 -36" fill="none" stroke={KRP.blueDeep} strokeWidth={5} />
      </g>
      {[[598, 0], [470, 1]].map(([cx2, i]) => (
        <g key={i} transform={`translate(${cx2} -132)`}>
          <path d="M -18 0 L -22 -34 L 22 -34 L 18 0 Z" fill="#D9CBB0" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <ellipse cx={0} cy={-34} rx={22} ry={6} fill="#8A6A4A" stroke={KRP.ink} strokeWidth={3.5} />
          <g transform="translate(0 -44)">{steam(i)}</g>
        </g>
      ))}
      {/* 箸 */}
      <line x1={226} y1={-112} x2={300} y2={-148} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
      <line x1={232} y1={-104} x2={306} y2={-140} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
      {/* 柱 (左右) */}
      <rect x={-18} y={-500} width={22} height={500} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={816} y={-500} width={22} height={500} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

const Sg119: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.04, easeOut(seg(f, 0, 42)));
  const lock1 = seg(f, 4, 18);
  const lock2 = seg(f, 14, 28);
  const pen = Math.sin(f / 3) * 7;
  return (
    <Frame f={f} seed={1205}>
      <g transform={zoomAt(z, 960, 560)}>
        {/* 午後の空と遠くの屋根並み */}
        <rect x={-40} y={-40} width={W + 80} height={800} fill="#EADFC4" />
        <CloudPuff x={760} y={110} f={f} sp={0.25} s={0.8} op={0.7} />
        {/* 幟 (中央の通りの奥) */}
        <g transform="translate(900 0)">
          <line x1={0} y1={420} x2={0} y2={720} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 0 430 L ${46 + Math.sin(f / 6) * 6} ${434 + Math.sin(f / 5) * 3} L ${44 + Math.sin(f / 6) * 6} 610 L 0 606 Z`}
            fill={C.kohaku} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 通り */}
        <rect x={-40} y={720} width={W + 80} height={400} fill={C.road} />
        <line x1={-40} y1={720} x2={W + 40} y2={720} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
        <rect x={-40} y={720} width={W + 80} height={22} fill="#B7A47F" opacity={0.7} />
        {/* ① 芝居茶屋 (左) */}
        <ShibaiChaya x={90} y={720} f={f} />
        {/* ② 桟敷の飲み食い (右) */}
        <SajikiNomikui x={1060} y={720} f={f} />
        {/* 標的の輪 */}
        <MatoRing x={450} y={470} r={235} t={lock1} f={f} />
        <MatoRing x={1486} y={540} r={212} t={lock2} f={f} />
        {/* 紳士たち (明治の洋装) */}
        {[820, 1110, 1640].map((px) => (
          <ellipse key={px} cx={px} cy={1014} rx={86} ry={15} fill={KRP.ink} opacity={0.18} />
        ))}
        <Shinshi x={820} y={1010} s={0.96} lean={4} f={f}>
          <Person x={0} y={0} f={f} still cloth="#2E3036" clothDark="#55565C" hair="none"
            pose="point" pointDir={-1} gaze={[-6, -4]} face="angry" />
        </Shinshi>
        <Shinshi x={1110} y={1010} s={0.96} lean={-4} f={f} phase={2} coat="#353A44">
          <Person x={0} y={0} f={f} phase={2} still cloth="#353A44" clothDark="#5A5E68" hair="none"
            pose="point" pointDir={1} gaze={[6, -4]} />
        </Shinshi>
        <Shinshi x={1640} y={1010} s={0.94} f={f} phase={4} coat="#3B3530"
          extra={
            <g transform="translate(0 -124)">
              <g transform="rotate(-8)">
                <rect x={-62} y={-44} width={124} height={86} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
                <line x1={0} y1={-44} x2={0} y2={42} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
                {[-22, -4, 14].map((ly) => (
                  <line key={ly} x1={10} y1={ly} x2={50} y2={ly} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
                ))}
                <path d="M -50 -22 L -34 -10 M -34 -22 L -50 -10" stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
                <path d="M -50 8 L -34 20 M -34 8 L -50 20" stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
              </g>
              <g transform={`translate(${30 + pen} -14) rotate(${38 + pen})`}>
                <line x1={0} y1={0} x2={0} y2={-46} stroke={SGP.woodDark} strokeWidth={7} strokeLinecap="round" />
                <path d="M -4 0 L 4 0 L 0 12 Z" fill={KRP.ink} />
              </g>
            </g>
          }>
          <Person x={0} y={0} f={f} phase={4} still cloth="#3B3530" clothDark="#5E5850" hair="none"
            glasses pose="hold" gaze={[0, 5]} />
        </Shinshi>
        {/* 札 */}
        <TagPlate x={450} y={186} text="芝居茶屋" size={44} t={seg(f, 8, 18)} />
        <TagPlate x={1486} y={292} text="飲み食い" size={44} t={seg(f, 18, 28)} />
        <TagPlate x={940} y={330} text="改良対象" size={46} t={seg(f, 24, 34)} fill={KRP.red} color={KRP.white} />
        <Arrow x={700} y={422} s={0.8} rot={153} t={seg(f, 28, 36)} />
        <Arrow x={1272} y={446} s={0.8} rot={24} t={seg(f, 30, 38)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #120 1889年には、歌舞伎座が開場します。
// 格: 並 / seed 1206
// 絵: 開場式の歌舞伎座。幕が掛かり、人だかり。年号札1889
// どこ: 開場式の歌舞伎座 正面 (晴れの昼・祝祭)
// 演出: 真正面の引き。大屋根と櫓、三色の引幕、揺れる提灯の列、のぼり旗、押し寄せる人だかり。年号札1889
// 動き: のぼりと提灯が揺れる / 群衆の腕が上がる / 雲が流れる / 年号札 pop
const Sg120: React.FC<{ f: number }> = ({ f }) => {
  const flagW = Math.sin(f / 6) * 10;
  return (
    <Frame f={f} seed={1206}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={760} fill={C.skyDay} />
      <CloudPuff x={190} y={120} f={f} sp={0.3} s={1.0} />
      <CloudPuff x={1500} y={170} f={f} sp={0.2} s={0.75} op={0.6} />
      {/* 建物本体 */}
      <g>
        {/* 大屋根 */}
        <path d="M 330 330 Q 960 240 1590 330 L 1530 420 Q 960 346 390 420 Z"
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={8} />
        {/* 千鳥破風 */}
        <path d="M 800 330 Q 960 200 1120 330 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
        {/* 櫓 */}
        <g transform="translate(960 210)">
          <rect x={-80} y={-70} width={160} height={78} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -96 -70 L 0 -122 L 96 -70 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-32} r={22} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 白壁の2階 */}
        <rect x={420} y={420} width={1080} height={200} fill={C.shirokabe} stroke={KRP.ink} strokeWidth={7} />
        {[...Array(8)].map((_, i) => (
          <rect key={i} x={470 + i * 130} y={450} width={90} height={130} rx={8}
            fill="#E3DAC4" stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 1階: 三色の引幕 (黒・柿・萌葱) */}
        <rect x={420} y={620} width={1080} height={280} fill={C.kuro} stroke={KRP.ink} strokeWidth={7} />
        {[...Array(9)].map((_, i) => (
          <rect key={i} x={420 + i * 120} y={620} width={120} height={280}
            fill={[C.kuro, C.kabukiKaki, C.kabukiMoegi][i % 3]} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 提灯の列 */}
        {[...Array(9)].map((_, i) => (
          <g key={i} transform={`translate(${480 + i * 120} 636) rotate(${Math.sin(f / 7 + i) * 7})`}>
            <ellipse cx={0} cy={36} rx={28} ry={38} fill={C.chochin} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -26 28 Q 0 34 26 28 M -27 46 Q 0 52 27 46" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} />
          </g>
        ))}
        {/* 入口 */}
        <rect x={860} y={740} width={200} height={160} fill="#241C14" stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* のぼり旗 */}
      {[260, 1660].map((px, i) => (
        <g key={i} transform={`translate(${px} 0)`}>
          <line x1={0} y1={340} x2={0} y2={900} stroke={KRP.ink} strokeWidth={7} />
          <path d={`M 0 350 L ${70 + flagW * (i === 0 ? 1 : -1)} ${356 + Math.sin(f / 5 + i) * 4} L ${66 + flagW * (i === 0 ? 1 : -1)} 620 L 0 614 Z`}
            fill={i === 0 ? C.kohaku : C.norenAi} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 地面と人だかり */}
      <rect x={0} y={900} width={W} height={180} fill={C.road} />
      <line x1={0} y1={900} x2={W} y2={900} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      {[...Array(14)].map((_, i) => (
        <PersonMini key={i} x={330 + i * 95 + rnd(1206, i) * 30} y={968 + rnd(1206, i + 20) * 46}
          s={1.0 + rnd(1206, i + 40) * 0.2}
          color={[KRP.blue, C.kohaku, KRP.green, KRP.gray, C.norenAi, KRP.orange, "#7B5B6E"][i % 7]}
          f={f} phase={i * 3} face="smile" arms={i % 3 === 0 ? "up" : "down"} />
      ))}
      <Person x={160} y={1040} s={0.9} cloth="#55606E" f={f} gaze={[5, 0]} face="joy" />
      <TopHat x={160} y={1040} s={0.9} f={f} />
      <KimonoSkirt x={1800} y={1036} s={0.88} color="#7B5B6E" />
      <Person x={1800} y={1036} s={0.88} cloth="#7B5B6E" hair="none" f={f} phase={6} gaze={[-5, 0]} face="smile" />
      {/* 年号札 */}
      <TagPlate x={180} y={250} text="1889" size={56} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #121 1911年には、帝国劇場ができます。
// 格: 並 / seed 1207
// 絵: 白亜の帝国劇場 (初代)。左右対称の洋風の正面を画面の主役に。年号札1911
// どこ: 夕暮れの丸の内。手前に皇居の濠と石垣・松、その向こうの通りに馬車・人力車・洋装と和装の人
// 演出: 正面を真正面から左右対称で大きく。3段の窓・アーチ窓・柱型・軒の装飾帯・欄干・車寄せ。
//       像・紋章・塔など確信の持てない装飾は描かない。建物に文字は書かない
// 動き: 馬車が右から車寄せへ滑り込んで停まる / 人力車が走る / 窓とガス灯が明滅 / 濠の映り込みが揺れる / ゆるズーム

// 馬車 (左向き)。y = 地面。roll: 車輪の回転角
const Basha: React.FC<{ x: number; y: number; s?: number; f: number; roll: number; moving: number }> =
  ({ x, y, s = 1, f, roll, moving }) => {
    const gait = Math.sin(f / 2.6) * 14 * moving;
    const wheel = (cx: number, cy: number, r: number) => (
      <g transform={`translate(${cx} ${cy}) rotate(${roll})`}>
        <circle r={r} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <circle r={r - 7} fill="none" stroke="#8A6A3A" strokeWidth={3} />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <line key={a} x1={-r + 4} y1={0} x2={r - 4} y2={0} stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${a})`} />
        ))}
        <circle r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* 馬 */}
        <g transform="translate(-330 0)">
          {[[-58, 1], [-34, -1], [44, -1], [66, 1]].map(([lx, d], i) => (
            <line key={i} x1={lx} y1={-80} x2={lx + gait * d * 0.6} y2={-2}
              stroke="#4A3828" strokeWidth={13} strokeLinecap="round" />
          ))}
          <ellipse cx={0} cy={-112} rx={96} ry={44} fill="#5A4636" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -70 -128 Q -112 -150 -118 -206 L -86 -214 Q -74 -176 -40 -146 Z"
            fill="#5A4636" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -120 -206 L -152 -170 L -132 -160 L -96 -190 Z" fill="#5A4636" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -100 -218 L -94 -236 L -86 -214 Z" fill="#5A4636" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-112} cy={-196} r={4} fill={KRP.ink} />
          <path d={`M 92 -118 Q 122 -100 ${118 + Math.sin(f / 7) * 6} -50`} fill="none" stroke="#3A2A1E" strokeWidth={12} strokeLinecap="round" />
          <path d="M -80 -150 L 40 -120" stroke={C.kohaku} strokeWidth={6} />
        </g>
        {/* 轅 (ながえ) */}
        <line x1={-140} y1={-92} x2={-300} y2={-118} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        {/* 車体 */}
        <path d="M -140 -84 L 140 -84 L 150 -190 Q 0 -206 -150 -190 Z" fill={C.kuro} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={-70} y={-176} width={84} height={64} rx={8} fill={C.glow} opacity={0.75} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-28} y1={-176} x2={-28} y2={-112} stroke={KRP.ink} strokeWidth={3} />
        <rect x={34} y={-178} width={70} height={90} rx={6} fill="none" stroke={KRP.brass} strokeWidth={4} opacity={0.8} />
        <rect x={-160} y={-212} width={316} height={18} rx={6} fill={C.kuro} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-152} cy={-150} r={11} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        {/* 御者台と御者 */}
        <rect x={-196} y={-150} width={60} height={16} rx={5} fill={C.kuro} stroke={KRP.ink} strokeWidth={4.5} />
        <Person x={-166} y={-150} s={0.36} cloth="#3A3F4C" f={f} phase={5} />
        <TopHat x={-166} y={-150} s={0.36} color="#2C2622" f={f} phase={5} />
        {wheel(-86, -44, 44)}
        {wheel(92, -54, 54)}
      </g>
    );
  };

// 松 (濠端の石垣の上)。dir=-1 で左右反転
const Matsu: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; f: number }> =
  ({ x, y, s = 1, dir = 1, f }) => {
    const pads: [number, number, number][] = [[-30, -420, 120], [110, -360, 130], [-100, -300, 110], [40, -250, 150], [170, -190, 100]];
    return (
      <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
        <path d="M -20 0 Q -40 -120 0 -220 Q 30 -300 -10 -420 L 14 -424 Q 56 -300 26 -214 Q -2 -120 22 0 Z"
          fill="#4A3A2E" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 10 -230 Q 80 -250 140 -330" fill="none" stroke="#4A3A2E" strokeWidth={14} strokeLinecap="round" />
        <path d="M 4 -170 Q 90 -170 170 -180" fill="none" stroke="#4A3A2E" strokeWidth={12} strokeLinecap="round" />
        <path d="M 0 -300 Q -60 -300 -100 -290" fill="none" stroke="#4A3A2E" strokeWidth={12} strokeLinecap="round" />
        {pads.map(([px, py, pw], i) => (
          <g key={i} transform={`translate(${px + Math.sin(f / 30 + i) * 2} ${py})`}>
            <path d={`M ${-pw / 2} 10 Q ${-pw / 2} -26 ${-pw / 4} -30 Q 0 -46 ${pw / 4} -30 Q ${pw / 2} -26 ${pw / 2} 10 Q ${pw / 4} 22 0 16 Q ${-pw / 4} 22 ${-pw / 2} 10 Z`}
              fill="#36503E" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M ${-pw / 3} -18 Q 0 -32 ${pw / 3} -18`} fill="none" stroke="#5E7D62" strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  };

// 帝国劇場の正面 (左右対称)。中心 x=960 / 基壇 y=660 で描く
const TeigekiFacade: React.FC<{ f: number }> = ({ f }) => {
  const wall = C.shirokabe;
  const trim = "#DCD2BC";
  const shade = "#C9BFA6";
  const lit = (i: number) => 0.78 + Math.sin(f / 6 + i * 1.9) * 0.1;
  const dark = (i: number) => rnd(1207, i + 50) < 0.18;
  // アーチ窓
  const archWin = (cx: number, top: number, w: number, h: number, i: number, key: string) => (
    <g key={key}>
      <path d={`M ${cx - w / 2 - 7} ${top + h} L ${cx - w / 2 - 7} ${top + w / 2} A ${w / 2 + 7} ${w / 2 + 7} 0 0 1 ${cx + w / 2 + 7} ${top + w / 2} L ${cx + w / 2 + 7} ${top + h} Z`}
        fill={trim} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${cx - w / 2} ${top + h} L ${cx - w / 2} ${top + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${top + w / 2} L ${cx + w / 2} ${top + h} Z`}
        fill={dark(i) ? C.duskTop : C.glow} opacity={dark(i) ? 1 : lit(i)} stroke={KRP.ink} strokeWidth={4} />
      <line x1={cx} y1={top + 4} x2={cx} y2={top + h} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      <line x1={cx - w / 2} y1={top + w / 2 + 6} x2={cx + w / 2} y2={top + w / 2 + 6} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      <path d={`M ${cx - 8} ${top - 9} L ${cx + 8} ${top - 9} L ${cx + 6} ${top + 6} L ${cx - 6} ${top + 6} Z`} fill={trim} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
  // 四角い窓 (ped: 0=なし 1=三角の破風 2=水平の庇)
  const rectWin = (cx: number, top: number, w: number, h: number, ped: 0 | 1 | 2, i: number, key: string) => (
    <g key={key}>
      <rect x={cx - w / 2 - 7} y={top - 7} width={w + 14} height={h + 14} fill={trim} stroke={KRP.ink} strokeWidth={4} />
      <rect x={cx - w / 2} y={top} width={w} height={h} fill={dark(i) ? C.duskTop : C.glow}
        opacity={dark(i) ? 1 : lit(i)} stroke={KRP.ink} strokeWidth={4} />
      <line x1={cx} y1={top} x2={cx} y2={top + h} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      <line x1={cx - w / 2} y1={top + h * 0.38} x2={cx + w / 2} y2={top + h * 0.38} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      <rect x={cx - w / 2 - 12} y={top + h + 6} width={w + 24} height={8} fill={trim} stroke={KRP.ink} strokeWidth={3} />
      {ped === 1 && (
        <path d={`M ${cx - w / 2 - 14} ${top - 9} L ${cx} ${top - 34} L ${cx + w / 2 + 14} ${top - 9} Z`}
          fill={trim} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      )}
      {ped === 2 && (
        <rect x={cx - w / 2 - 14} y={top - 20} width={w + 28} height={12} fill={trim} stroke={KRP.ink} strokeWidth={4} />
      )}
    </g>
  );
  const wingCols = [507, 620, 733, 1187, 1300, 1413];
  const pavCols = [390, 1530];
  return (
    <g>
      {/* 低い屋根 */}
      <path d="M 350 210 L 420 152 L 1500 152 L 1570 210 Z" fill="#4C535E" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: 24 }, (_, k) => (
        <line key={k} x1={440 + k * 45} y1={156} x2={430 + k * 46} y2={206} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />
      ))}
      {/* 壁 (翼部+両端の張り出し) */}
      <rect x={330} y={238} width={1260} height={422} fill={wall} stroke={KRP.ink} strokeWidth={7} />
      {[[330, 450], [1470, 1590]].map(([a, b], i) => (
        <g key={i}>
          <rect x={a} y={226} width={b - a} height={434} fill={wall} stroke={KRP.ink} strokeWidth={7} />
          {/* 隅石 */}
          {Array.from({ length: 13 }, (_, k) => (
            <g key={k}>
              <rect x={a} y={244 + k * 31} width={k % 2 ? 22 : 34} height={27} fill={trim} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
              <rect x={b - (k % 2 ? 22 : 34)} y={244 + k * 31} width={k % 2 ? 22 : 34} height={27} fill={trim} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
            </g>
          ))}
        </g>
      ))}
      {/* 1階の石積み目地 */}
      {[586, 612, 638].map((yy) => (
        <line key={yy} x1={334} y1={yy} x2={1586} y2={yy} stroke={KRP.ink} strokeWidth={2.5} opacity={0.22} />
      ))}
      {/* 欄干 (屋上の手すり) */}
      <rect x={340} y={200} width={1240} height={10} fill={trim} stroke={KRP.ink} strokeWidth={3.5} />
      {Array.from({ length: 56 }, (_, k) => (
        <rect key={k} x={346 + k * 22} y={210} width={10} height={18} rx={4} fill={wall} stroke={KRP.ink} strokeWidth={2.5} />
      ))}
      {/* 軒の装飾帯 (コーニス + 歯飾り + フリーズ) */}
      <rect x={316} y={226} width={1288} height={22} fill={trim} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 64 }, (_, k) => (
        <rect key={k} x={326 + k * 20} y={248} width={10} height={11} fill={shade} stroke={KRP.ink} strokeWidth={2} />
      ))}
      <rect x={330} y={259} width={1260} height={8} fill={KRP.ink} opacity={0.12} />
      <rect x={330} y={270} width={1260} height={14} fill={trim} stroke={KRP.ink} strokeWidth={3} />
      {/* 胴蛇腹 (階の境) */}
      <rect x={326} y={384} width={1268} height={12} fill={trim} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={326} y={548} width={1268} height={14} fill={trim} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={330} y={562} width={1260} height={6} fill={KRP.ink} opacity={0.12} />
      {/* 翼部の窓 3段 */}
      {[...wingCols, ...pavCols].map((cx, i) => (
        <g key={cx}>
          {rectWin(cx, 304, 56, 58, 2, i, `a${cx}`)}
          {rectWin(cx, 430, 60, 100, pavCols.includes(cx) ? 2 : 1, i + 10, `b${cx}`)}
          {archWin(cx, 576, 58, 70, i + 20, `c${cx}`)}
        </g>
      ))}
      {/* 中央の張り出し (柱型と大アーチ窓) */}
      <g>
        <rect x={784} y={226} width={352} height={434} fill={C.duskMid} opacity={0.18} />
        <rect x={790} y={220} width={340} height={440} fill={wall} stroke={KRP.ink} strokeWidth={7} />
        {/* 頂部 (弓形の破風) */}
        <path d="M 780 230 L 780 156 Q 960 92 1140 156 L 1140 230 Z" fill={wall} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 800 162 Q 960 108 1120 162" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        <rect x={770} y={220} width={380} height={22} fill={trim} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={960} cy={178} r={26} fill={C.glow} opacity={lit(40)} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={960} cy={178} r={34} fill="none" stroke={trim} strokeWidth={8} />
        <circle cx={960} cy={178} r={38} fill="none" stroke={KRP.ink} strokeWidth={3} />
        {/* 柱型 (ピラスター) 4本 */}
        {[812, 913, 1007, 1108].map((px) => (
          <g key={px}>
            <rect x={px - 10} y={262} width={20} height={286} fill={trim} stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={px - 16} y={252} width={32} height={14} fill={trim} stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={px - 15} y={540} width={30} height={10} fill={trim} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 大アーチ窓 (2〜3階を通す) */}
        {[866, 960, 1054].map((cx, i) => archWin(cx, 292, 64, 236, 41 + i, `d${cx}`))}
        {/* 玄関のアーチ扉 */}
        {[866, 960, 1054].map((cx, i) => archWin(cx, 584, 66, 76, 60 + i, `e${cx}`))}
      </g>
      {/* 基壇 */}
      <rect x={316} y={646} width={1288} height={18} fill={shade} stroke={KRP.ink} strokeWidth={4} />
      {/* 車寄せ (玄関のひさし) と玉電灯 */}
      <g>
        <rect x={792} y={588} width={336} height={22} rx={4} fill="#4C535E" stroke={KRP.ink} strokeWidth={5} />
        <rect x={786} y={576} width={348} height={14} rx={4} fill={trim} stroke={KRP.ink} strokeWidth={4} />
        {[812, 1108].map((px) => (
          <g key={px}>
            <rect x={px - 7} y={610} width={14} height={92} fill={trim} stroke={KRP.ink} strokeWidth={4} />
            <rect x={px - 11} y={694} width={22} height={10} fill={shade} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {[830, 960, 1090].map((gx, i) => (
          <g key={gx}>
            <circle cx={gx} cy={560} r={24} fill={C.glow} opacity={0.22 + Math.sin(f / 3.4 + i * 1.8) * 0.06} />
            <circle cx={gx} cy={562} r={11} fill={C.glow} stroke={KRP.ink} strokeWidth={3.5} />
            <line x1={gx} y1={573} x2={gx} y2={578} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    </g>
  );
};

const Sg121: React.FC<{ f: number }> = ({ f }) => {
  const arrive = easeOut(seg(f, 0, 30));
  const coachX = lerp(1380, 1060, arrive);
  const roll = -(1 - arrive) * 0 + -lerp(0, 330, arrive);
  const z = 1 + 0.035 * easeOut(clamp01(f / 120));
  const rikiX = 290 + f * 1.1;
  return (
    <Frame f={f} seed={1207} dark>
      <defs>
        <linearGradient id="sg121sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="0.55" stopColor={C.duskMid} />
          <stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
      </defs>
      <g transform={zoomAt(z, 960, 420)}>
        {/* 夕暮れの空・星・月 */}
        <rect x={-40} y={-40} width={W + 80} height={720} fill="url(#sg121sky)" />
        {[...Array(9)].map((_, i) => (
          <circle key={i} cx={60 + rnd(1207, i) * 1800} cy={40 + rnd(1207, i + 9) * 200} r={3}
            fill={KRP.white} opacity={0.35 + Math.sin(f / 4 + i * 2.2) * 0.3} />
        ))}
        <g transform="translate(200 300)">
          <circle r={34} fill="#F3E6B8" opacity={0.9} />
          <circle cx={14} cy={-8} r={30} fill={C.duskMid} opacity={0.95} />
        </g>
        {/* 遠くの街並み */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const bx = i < 3 ? i * 120 - 20 : 1560 + (i - 3) * 100;
          const bh = 90 + rnd(1207, i + 30) * 90;
          return <rect key={i} x={bx} y={660 - bh} width={112} height={bh} fill={C.duskTop} opacity={0.5} />;
        })}
        {/* 帝国劇場 */}
        <TeigekiFacade f={f} />
        {/* 歩道と通り */}
        <rect x={-40} y={660} width={W + 80} height={26} fill="#8C7F6C" />
        <rect x={-40} y={686} width={W + 80} height={90} fill="#5C5248" />
        <line x1={-40} y1={686} x2={W + 40} y2={686} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        <rect x={792} y={662} width={336} height={24} fill={C.glow} opacity={0.14} />
        {/* ガス灯 */}
        {[560, 1360].map((gx) => (
          <g key={gx}>
            <circle cx={gx} cy={694 - 340 * 0.5} r={30} fill={C.glow} opacity={0.18} />
            <GasLamp x={gx} y={694} s={0.5} f={f} lit />
          </g>
        ))}
        {/* 人 (洋装と和装が混ざる) */}
        <Person x={430} y={712} s={0.34} cloth="#3A3F4C" f={f} phase={1} gaze={[3, 0]} />
        <TopHat x={430} y={712} s={0.34} color="#2C2622" f={f} phase={1} />
        <KimonoSkirt x={500} y={714} s={0.34} color="#7B4A5E" />
        <Person x={500} y={714} s={0.34} cloth="#7B4A5E" hair="cap" f={f} phase={3} gaze={[-3, 0]} face="smile" />
        <KimonoSkirt x={1260} y={712} s={0.34} color="#4C5A48" />
        <Person x={1260} y={712} s={0.34} cloth="#4C5A48" hair="none" f={f} phase={5} gaze={[3, 0]} />
        <Person x={1450} y={714} s={0.34} cloth="#55606E" f={f} phase={2} gaze={[-3, 0]} face="smile" />
        <TopHat x={1450} y={714} s={0.34} color="#3A3F4C" f={f} phase={2} />
        <KimonoSkirt x={1516} y={712} s={0.32} color="#8E5A3C" />
        <Person x={1516} y={712} s={0.32} cloth="#8E5A3C" f={f} phase={6} gaze={[-3, 0]} />
        {/* 人力車 (左から走ってくる) */}
        <Jinrikisha x={rikiX} y={768} s={0.4} f={f} run hood="#2E3A44" />
        {/* 馬車 (右から車寄せへ) */}
        <Basha x={coachX} y={770} s={0.42} f={f} roll={roll} moving={1 - arrive} />
        {/* 濠の向こう岸の石の縁 */}
        <rect x={-40} y={776} width={W + 80} height={14} fill="#7E776C" stroke={KRP.ink} strokeWidth={4} />
        {/* 濠 (映り込みが揺れる) */}
        <rect x={-40} y={790} width={W + 80} height={120} fill="#27324A" />
        {[390, 507, 620, 733, 866, 960, 1054, 1187, 1300, 1413, 1530].map((wx, i) => (
          <path key={wx}
            d={`M ${wx - 14 + Math.sin(f / 9 + i) * 5} 800 l 28 0 M ${wx - 10 + Math.sin(f / 7 + i * 2) * 6} 822 l 20 0 M ${wx - 6 + Math.sin(f / 8 + i) * 5} 844 l 12 0`}
            stroke={C.glow} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
        ))}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-40 + ((f * 0.8 + i * 640) % 2000)} ${860 + i * 14} q 30 -6 60 0`}
            fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.2} />
        ))}
        {/* 手前の石垣 */}
        <rect x={-40} y={900} width={W + 80} height={220} fill="#8C8478" />
        {Array.from({ length: 4 }, (_, r) => (
          <g key={r}>
            {Array.from({ length: 16 }, (_, k) => {
              const sx = -60 + k * 130 + (r % 2) * 65 + rnd(1207, r * 16 + k) * 20;
              const sy = 908 + r * 46;
              return <path key={k} d={`M ${sx} ${sy} L ${sx + 118} ${sy + 4} L ${sx + 114} ${sy + 42} L ${sx + 4} ${sy + 40} Z`}
                fill={r % 2 ? "#958C7E" : "#A0978A"} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />;
            })}
          </g>
        ))}
        <rect x={-40} y={896} width={W + 80} height={12} fill="#55684E" stroke={KRP.ink} strokeWidth={3} />
        {/* 松 (左右の手前) */}
        <Matsu x={96} y={990} s={0.92} f={f} />
        <Matsu x={1836} y={996} s={0.9} dir={-1} f={f} />
      </g>
      {/* 札 */}
      <TagPlate x={1740} y={110} text="1911" size={56} t={seg(f, 6, 16)} />
      <TagPlate x={1740} y={214} text="帝国劇場" size={38} t={seg(f, 12, 22)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #122 切符は窓口で直接売り、客席は椅子席。上演時間も短くなりました。
// 格: 並 / seed 1208
// 絵: 三点セット: 窓口で切符を買う列、整然と並ぶ椅子席、短くなった時間の時計。新式の匂い
// どこ: 新式劇場のロビー (昼の屋内)
// 演出: 三点セット。左=切符窓口に整然とした列、右=開口から覗く椅子席の列、中央上=大時計。タイル床で新式の匂い
// 動き: 切符がぴょこんと手に渡る / 大時計の分針がぐるぐる早回り / 列の客が小さく揺れる
const Sg122: React.FC<{ f: number }> = ({ f }) => {
  const ticketT = pop(seg(f, 18, 30));
  const clockRot = f * 9;
  return (
    <Frame f={f} seed={1208}>
      {/* 壁 */}
      <rect x={0} y={0} width={W} height={780} fill={C.wallpaper} />
      <rect x={0} y={700} width={W} height={80} fill={C.dado} stroke={KRP.ink} strokeWidth={5} />
      {[...Array(12)].map((_, i) => (
        <line key={i} x1={i * 168} y1={0} x2={i * 168} y2={700} stroke={KRP.ink} strokeWidth={2.5} opacity={0.12} />
      ))}
      {/* タイル床 (市松) */}
      <rect x={0} y={780} width={W} height={300} fill={C.tileA} />
      {[...Array(10)].map((_, r) =>
        [...Array(16)].map((_, c2) => (
          (r + c2) % 2 === 0 ? (
            <path key={`${r}-${c2}`}
              d={`M ${c2 * 130 - r * 6} ${780 + r * 30} l 124 0 l -6 30 l -124 0 Z`}
              fill={C.tileB} opacity={0.9} />
          ) : null
        ))
      )}
      <line x1={0} y1={780} x2={W} y2={780} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      {/* 左: 切符窓口 */}
      <g>
        <rect x={90} y={300} width={430} height={480} rx={10} fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
        <rect x={140} y={360} width={330} height={240} rx={10} fill="#3A2E20" stroke={KRP.ink} strokeWidth={6} />
        <rect x={160} y={380} width={290} height={200} rx={60} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓口の格子 */}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={200 + i * 70} y1={386} x2={200 + i * 70} y2={576} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        ))}
        {/* 看板「切符」 */}
        <rect x={200} y={236} width={210} height={76} rx={10} fill={C.norenAi} stroke={KRP.ink} strokeWidth={6} />
        <text x={305} y={292} textAnchor="middle" fontSize={52} fontWeight={900} fill={KRP.white} fontFamily={FONT}>切符</text>
        {/* 係員 (窓口の中) */}
        <Person x={305} y={640} s={0.62} cloth="#4A5B6B" glasses f={f} still gaze={[5, 0]} />
        <rect x={140} y={600} width={330} height={180} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 切符が手に渡る */}
        <g transform={`translate(500 560) scale(${ticketT})`}>
          <rect x={-46} y={-26} width={92} height={52} rx={6} fill={C.tagPaper} stroke={KRP.ink} strokeWidth={5}
            transform={`rotate(${Math.sin(f / 6) * 6})`} />
          <line x1={-20} y1={-18} x2={-20} y2={18} stroke={KRP.ink} strokeWidth={3} strokeDasharray="5 5"
            transform={`rotate(${Math.sin(f / 6) * 6})`} />
        </g>
      </g>
      {/* 列 (整然) */}
      <Person x={620} y={1000} s={0.94} cloth="#55606E" f={f} pose="hold" gaze={[-5, 0]} face="smile" />
      <TopHat x={620} y={1000} s={0.94} f={f} />
      {[0, 1, 2].map((i) => (
        <PersonMini key={i} x={790 + i * 120} y={980 + Math.sin(f / 8 + i) * 3} s={1.25}
          color={[C.norenAi, "#7B5B6E", KRP.green][i]} f={f} phase={i * 4} face="dot" />
      ))}
      <ellipse cx={620} cy={1004} rx={84} ry={14} fill={KRP.ink} opacity={0.16} />
      {/* 中央上: 大時計 (針が早回り) */}
      <g transform="translate(820 260)">
        <circle r={118} fill={C.washi} stroke={KRP.ink} strokeWidth={9} />
        <circle r={100} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1={0} y1={-98} x2={0} y2={-84} stroke={KRP.ink} strokeWidth={5}
            transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={10} x2={0} y2={-58} stroke={KRP.ink} strokeWidth={9}
          transform={`rotate(${clockRot / 12})`} strokeLinecap="round" />
        <line x1={0} y1={12} x2={0} y2={-88} stroke={KRP.red} strokeWidth={6}
          transform={`rotate(${clockRot})`} strokeLinecap="round" />
        <circle r={10} fill={KRP.ink} />
        {/* 早回りの軌跡 */}
        <path d="M 70 -100 A 122 122 0 0 1 118 -20" fill="none" stroke={KRP.orange} strokeWidth={6}
          opacity={0.5 + Math.sin(f / 4) * 0.3} />
        <path d="M 118 -20 l 14 -16 l 6 22 Z" fill={KRP.orange} opacity={0.6} />
      </g>
      {/* 右: 開口から覗く椅子席 */}
      <g>
        <rect x={1200} y={180} width={640} height={700} rx={14} fill="#2A2018" stroke={KRP.ink} strokeWidth={9} />
        <g>
          <clipPath id="sg122hall"><rect x={1212} y={192} width={616} height={676} rx={10} /></clipPath>
          <g clipPath="url(#sg122hall)">
            <rect x={1212} y={192} width={616} height={300} fill="#3A2C20" />
            {/* 舞台の幕 */}
            <rect x={1300} y={230} width={440} height={180} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
            {[...Array(6)].map((_, i) => (
              <path key={i} d={`M ${1330 + i * 76} 232 q ${Math.sin(f / 9 + i) * 5} 90 0 176`}
                stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.4} />
            ))}
            {/* 椅子席の列 (遠近) */}
            {[0, 1, 2, 3].map((r) => {
              const ry = 470 + r * 104;
              const rs = 0.62 + r * 0.16;
              return (
                <g key={r}>
                  {[...Array(7)].map((_, c2) => (
                    <g key={c2} transform={`translate(${1270 + c2 * 86 + r * 10} ${ry}) scale(${rs})`}>
                      <rect x={-30} y={-66} width={60} height={66} rx={10} fill={C.chairRed} stroke={KRP.ink} strokeWidth={4} />
                      <rect x={-34} y={-6} width={68} height={16} rx={6} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
                    </g>
                  ))}
                </g>
              );
            })}
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #123 茶屋を通さず、座布団も投げられない劇場の誕生です。
// 格: 図 / seed 1209
// 絵: ビフォーアフター対比図。茶屋経由の矢印に×、固定椅子に「投げられません」の小札
// どこ: 設計室の製図板に広げた対比図 (罫線紙)
// 演出: 図。左「むかし」= 客→茶屋→劇場の経路に×、右「新式」= 客→劇場へ一直線に○。右下に床ボルト付き固定椅子+「投げられません」の小札
// 動き: 矢印が順に伸びる / × と ○ が時間差で押される / 小札が振り子で揺れる
const Sg123: React.FC<{ f: number }> = ({ f }) => {
  const a1 = seg(f, 6, 14), a2 = seg(f, 12, 20), a3 = seg(f, 16, 24);
  const sway = Math.sin(f / 8) * 7;
  // ミニ劇場アイコン
  const Theater = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-90} y={-70} width={180} height={70} fill={C.shirokabe} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -104 -70 L 0 -122 L 104 -70 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-26} y={-44} width={52} height={44} fill="#3A2E20" stroke={KRP.ink} strokeWidth={4} />
      <line x1={-62} y1={-34} x2={-40} y2={-34} stroke={KRP.ink} strokeWidth={4} />
      <line x1={40} y1={-34} x2={62} y2={-34} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  // ミニ茶屋アイコン
  const Chaya = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-80} y={-64} width={160} height={64} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -94 -64 L 0 -106 L 94 -64 Z" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -54 -64 L -10 -64 L -10 -20 L -54 -20 Z" fill={C.norenAi} stroke={KRP.ink} strokeWidth={4} />
      <text x={32} y={-24} textAnchor="middle" fontSize={40} fontWeight={900} fill={KRP.ink} fontFamily={FONT}>茶</text>
    </g>
  );
  return (
    <Frame f={f} seed={1209}>
      {/* 製図室の机と板 */}
      <rect x={0} y={0} width={W} height={H} fill="#5E4A38" />
      <rect x={40} y={40} width={1840} height={1000} rx={16} fill={C.deskWood} stroke={KRP.ink} strokeWidth={8} />
      {/* 図面紙 */}
      <rect x={120} y={90} width={1680} height={880} rx={10} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
      {[...Array(13)].map((_, i) => (
        <line key={i} x1={150} y1={150 + i * 64} x2={1770} y2={150 + i * 64} stroke={C.norenAi} strokeWidth={1.6} opacity={0.18} />
      ))}
      {/* 角の文鎮と定規 */}
      <circle cx={190} cy={140} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1730} cy={140} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1340} y={918} width={400} height={26} rx={6} fill="#D9C79A" stroke={KRP.ink} strokeWidth={4}
        transform="rotate(-2 1540 930)" />
      {/* 中央の仕切り */}
      <line x1={960} y1={160} x2={960} y2={900} stroke={KRP.ink} strokeWidth={4} strokeDasharray="16 14" opacity={0.5} />
      {/* 見出し札 */}
      <TagPlate x={400} y={210} text="むかし" size={46} t={seg(f, 2, 10)} fill="#E3D4AE" />
      <TagPlate x={1270} y={210} text="新式" size={46} t={seg(f, 4, 12)} fill="#D8E4D2" />
      {/* 左: 客 → 茶屋 → 劇場 */}
      <g>
        <PersonMini x={300} y={560} s={1.7} color={C.norenAi} f={f} face="dot" />
        <g opacity={a1}>
          <Arrow x={510} y={480} s={1.1} t={a1} />
        </g>
        <Chaya x={680} y={530} s={1.0} />
        <g opacity={a2}>
          <Arrow x={700} y={660} s={1.1} rot={90} t={a2} />
        </g>
        <Theater x={700} y={840} s={0.9} />
        {/* 経路 (茶屋経由) に × */}
        <XMark x={455} y={478} s={1.2} t={seg(f, 24, 31)} />
      </g>
      {/* 右: 客 →(一直線)→ 劇場 */}
      <g>
        <PersonMini x={1120} y={560} s={1.7} color={KRP.green} f={f} phase={5} face="smile" />
        <g opacity={a3}>
          <Arrow x={1330} y={480} s={1.3} t={a3} />
        </g>
        <Theater x={1560} y={560} s={1.1} />
        <Maru x={1330} y={370} s={0.85} t={seg(f, 31, 38)} />
      </g>
      {/* 右下: 床ボルト付き固定椅子 + 小札 */}
      <g transform="translate(1210 840)">
        <line x1={-160} y1={0} x2={300} y2={0} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        <rect x={-120} y={-150} width={110} height={100} rx={12} fill={C.chairRed} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-130} y={-56} width={130} height={22} rx={8} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-106} y1={-34} x2={-106} y2={0} stroke={KRP.ink} strokeWidth={7} />
        <line x1={-24} y1={-34} x2={-24} y2={0} stroke={KRP.ink} strokeWidth={7} />
        {/* 床ボルト */}
        <circle cx={-106} cy={-4} r={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-24} cy={-4} r={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {/* 小札 (背もたれの角から振り子) */}
        <g transform={`translate(12 -144) rotate(${sway})`}>
          <line x1={0} y1={0} x2={0} y2={22} stroke={C.rope} strokeWidth={4} />
          <g transform="translate(118 22)">
            <rect x={-130} y={0} width={260} height={62} rx={8} fill={C.tagPaper} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={44} textAnchor="middle" fontSize={31} fontWeight={800}
              fill={KRP.red} fontFamily={FONT}>投げられません</text>
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #124 とどめは、1923年の関東大震災でした。
// 格: 山 / seed 1210
// 絵: **事件**。赤黒い空、傾く街並み。年号札1923が煤ける。人々が逃げ惑う遠景 (直接の被害描写は引きで抑える)
// どこ: 川向こうの高台から見た東京の遠景 (1923年の夕刻。直接の被害は描かず引きで)
// 演出: 事件。赤黒い帯状の空、立ちのぼる煙の柱、傾いたシルエットの街並み、橋を渡って避難する豆粒の人影。年号札1923が煤ける
// 動き: 冒頭の揺れが減衰 / 空の明滅 / 煙がゆっくり伸びる / 灰が舞う / 人影が橋を進む
const Sg124: React.FC<{ f: number }> = ({ f }) => {
  const shake = (1 - seg(f, 0, 26)) * 5;
  const sx = Math.sin(f * 2.7) * shake;
  const sy = Math.cos(f * 3.1) * shake * 0.6;
  const pulse = 0.5 + Math.sin(f / 7) * 0.12;
  return (
    <Frame f={f} seed={1210} dark bg={C.qDark}>
      <g transform={`translate(${sx} ${sy})`}>
        {/* 赤黒い帯状の空 */}
        <rect x={-20} y={-20} width={1960} height={360} fill={C.qSkyTop} />
        <rect x={-20} y={320} width={1960} height={220} fill={C.qSkyMid} />
        <rect x={-20} y={520} width={1960} height={180} fill={C.qSkyLow} />
        <ellipse cx={1180} cy={660} rx={760} ry={170} fill={C.qGlow} opacity={pulse * 0.5} />
        {/* 煙の柱 */}
        {[520, 900, 1340, 1620].map((px, i) => {
          const h = 240 + rnd(1210, i) * 160 + seg(f, 0, 40) * 40;
          return (
            <g key={i} opacity={0.72}>
              <path d={`M ${px} 700 Q ${px - 24 + Math.sin(f / 10 + i) * 14} ${700 - h * 0.55} ${px + 12} ${700 - h}`}
                fill="none" stroke={C.qSmoke} strokeWidth={54 + i * 8} strokeLinecap="round" />
              <circle cx={px + 12 + Math.sin(f / 9 + i) * 10} cy={700 - h - 20} r={52}
                fill={C.qSmoke} opacity={0.85} />
              <circle cx={px + 60 + Math.sin(f / 8 + i * 2) * 12} cy={700 - h - 44} r={36}
                fill={C.qSmoke} opacity={0.7} />
            </g>
          );
        })}
        {/* 傾いた街並みシルエット */}
        {[...Array(12)].map((_, i) => {
          const bx = i * 165 - 20;
          const bh = 90 + rnd(1210, i + 7) * 130;
          const tilt = (rnd(1210, i + 19) - 0.5) * 14;
          return (
            <g key={i} transform={`translate(${bx} 700) rotate(${tilt})`}>
              <rect x={0} y={-bh} width={140} height={bh} fill={C.qDark} stroke="#140D0C" strokeWidth={4} />
              {rnd(1210, i + 31) > 0.5 && (
                <circle cx={70} cy={-bh * 0.4} r={8}
                  fill={C.qGlow} opacity={0.5 + Math.sin(f / 3 + i * 2) * 0.35} />
              )}
            </g>
          );
        })}
        <rect x={-20} y={694} width={1960} height={16} fill="#140D0C" />
        {/* 川と照り返し */}
        <rect x={-20} y={710} width={1960} height={170} fill="#2A2026" />
        {[...Array(8)].map((_, i) => (
          <path key={i} d={`M ${90 + i * 240} ${748 + rnd(1210, i + 44) * 90} q 50 ${Math.sin(f / 6 + i) * 6} 110 0`}
            stroke={C.qGlow} strokeWidth={5} fill="none" opacity={0.35 + Math.sin(f / 5 + i * 1.7) * 0.2} />
        ))}
        {/* 橋と避難の人影 (豆粒・遠景) */}
        <g>
          <path d="M 340 800 Q 760 740 1180 800" fill="none" stroke="#17100F" strokeWidth={16} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={480 + i * 190} y1={770 + Math.abs(i - 1.5) * 10} x2={480 + i * 190} y2={840}
              stroke="#17100F" strokeWidth={9} />
          ))}
          {[...Array(7)].map((_, i) => {
            const t = ((f * 0.6 + i * 17) % 100) / 100;
            const px = lerp(1150, 380, t);
            const py = 790 - Math.sin(((px - 340) / 840) * Math.PI) * 42;
            return (
              <g key={i} transform={`translate(${px} ${py})`} opacity={0.9}>
                <circle cx={0} cy={-26} r={7} fill="#17100F" />
                <path d="M -7 -20 L 7 -20 L 5 0 L -5 0 Z" fill="#17100F" />
              </g>
            );
          })}
        </g>
        {/* 手前の暗い土手と電信柱 */}
        <path d="M -20 880 Q 500 830 980 872 Q 1500 910 1940 862 L 1940 1090 L -20 1090 Z"
          fill="#17100F" />
        <g transform="translate(1690 880) rotate(8)">
          <line x1={0} y1={0} x2={0} y2={-330} stroke="#0E0908" strokeWidth={16} />
          <line x1={-78} y1={-296} x2={78} y2={-296} stroke="#0E0908" strokeWidth={10} />
          <path d={`M -78 -292 Q -180 ${-210 + Math.sin(f / 8) * 8} -300 -240`} fill="none" stroke="#0E0908" strokeWidth={5} />
          <path d="M 78 -292 Q 150 -220 160 -140" fill="none" stroke="#0E0908" strokeWidth={5} />
        </g>
        {/* 舞う灰 */}
        {[...Array(12)].map((_, i) => (
          <circle key={i}
            cx={(rnd(1210, i + 60) * 1920 + f * (6 + rnd(1210, i + 70) * 5)) % 1920}
            cy={(rnd(1210, i + 80) * 1000 + f * 2.2) % 1000}
            r={3 + rnd(1210, i + 90) * 3} fill={C.ashSky} opacity={0.35} />
        ))}
      </g>
      {/* 年号札 1923 (煤ける) */}
      <TagPlate x={200} y={240} text="1923" size={56} t={seg(f, 4, 14)} fill="#D8CCB4" />
      <g opacity={seg(f, 14, 30)}>
        <circle cx={250} cy={205} r={17} fill={C.qDark} opacity={0.55} />
        <circle cx={420} cy={272} r={13} fill={C.qDark} opacity={0.5} />
        <path d="M 320 282 q 6 26 2 44" stroke={C.qDark} strokeWidth={8} fill="none" opacity={0.45} strokeLinecap="round" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #125 東京の芝居茶屋は焼け、そのまま復活しませんでした。
// 格: 並 / seed 1211
// 絵: 焼け跡の更地。煤けた茶屋の看板が半分だけ残り、再建の槌音はよそから聞こえる
// どこ: 焼け跡の更地 (灰色の朝。#124 の暗赤と対比の淡い色)
// 演出: 更地に礎石と炭の梁、半分欠けた煤けた茶屋看板が斜めに残る。遠くの足場では再建の槌音 (音の波紋)。水たまりと芽吹き
// 動き: ゆっくり横パン / 槌を振る豆人影と波紋 / 水たまりの波紋 / 芽が揺れる / 小鳥の尾
const Sg125: React.FC<{ f: number }> = ({ f }) => {
  const panX = lerp(30, -30, seg(f, 0, 42));
  const hammer = Math.sin(f / 4);
  const ringT = (f % 22) / 22;
  return (
    <Frame f={f} seed={1211}>
      <g transform={`translate(${panX} 0)`}>
        {/* 灰色の空とにじむ朝日 */}
        <rect x={-60} y={-20} width={2040} height={640} fill={C.ashSky} />
        <circle cx={1500} cy={210} r={86} fill={KRP.white} opacity={0.75} />
        <circle cx={1500} cy={210} r={150} fill={KRP.white} opacity={0.25 + Math.sin(f / 10) * 0.05} />
        {/* 遠景: 無事だった街並みと再建の足場 */}
        <g opacity={0.5}>
          {[...Array(8)].map((_, i) => (
            <rect key={i} x={-40 + i * 260} y={470 - rnd(1211, i) * 70} width={200} height={160}
              fill="#A8A294" stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 再建の足場 (槌音はよそから) */}
        <g transform="translate(360 600)" opacity={0.75}>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-120 + i * 120} y1={0} x2={-120 + i * 120} y2={-290} stroke={C.burnWood} strokeWidth={9} />
          ))}
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-130} y1={-70 - i * 100} x2={130} y2={-70 - i * 100} stroke={C.burnWood} strokeWidth={7} />
          ))}
          {/* 槌を振る人影 */}
          <g transform="translate(10 -290)">
            <circle cx={0} cy={-34} r={13} fill={C.charcoal} />
            <path d="M -12 -24 L 12 -24 L 9 6 L -9 6 Z" fill={C.charcoal} />
            <g transform={`rotate(${-50 + hammer * 46})`}>
              <line x1={0} y1={-20} x2={44} y2={-52} stroke={C.charcoal} strokeWidth={6} />
              <rect x={38} y={-64} width={22} height={24} rx={4} fill={C.charcoal} />
            </g>
          </g>
          {/* 槌音の波紋 */}
          {[0, 1].map((i) => {
            const tt = (ringT + i * 0.5) % 1;
            return (
              <circle key={i} cx={46} cy={-340} r={20 + tt * 90} fill="none"
                stroke={KRP.orange} strokeWidth={5} opacity={(1 - tt) * 0.6} />
            );
          })}
        </g>
        {/* 更地の地面 */}
        <rect x={-60} y={620} width={2040} height={470} fill={C.ashGround} />
        <line x1={-60} y1={620} x2={1980} y2={620} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        {/* 茶屋の礎石の輪郭 */}
        <path d="M 760 740 L 1540 740 L 1600 960 L 700 960 Z" fill="none"
          stroke={C.charcoal} strokeWidth={6} strokeDasharray="4 14" opacity={0.7} />
        {[[800, 756], [1500, 756], [1560, 930], [740, 930], [1150, 748], [1140, 944]].map(([px, py], i) => (
          <rect key={i} x={px - 26} y={py - 14} width={52} height={28} rx={5}
            fill="#8F887A" stroke={C.charcoal} strokeWidth={4} />
        ))}
        {/* 炭になった梁 */}
        <g>
          <rect x={880} y={812} width={360} height={30} rx={10} fill={C.charcoal}
            transform="rotate(-7 1060 827)" />
          <rect x={1120} y={850} width={280} height={26} rx={9} fill={C.burnWood}
            transform="rotate(5 1260 863)" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={940 + i * 90} cy={816 - i * 8} r={5} fill={C.qDark} opacity={0.5} />
          ))}
        </g>
        {/* 半分欠けた煤け看板 (斜めに刺さる) */}
        <ChayaKanban x={1430} y={880} s={1.25} rot={12} burnt />
        <ellipse cx={1452} cy={886} rx={120} ry={16} fill={KRP.ink} opacity={0.14} />
        {/* 水たまりと波紋 */}
        <g transform="translate(560 900)">
          <ellipse cx={0} cy={0} rx={170} ry={38} fill="#C2C8C4" stroke={KRP.ink} strokeWidth={3.5} opacity={0.9} />
          <ellipse cx={-20} cy={-2} rx={20 + ringT * 90} ry={(20 + ringT * 90) * 0.22}
            fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={(1 - ringT) * 0.8} />
          <circle cx={120} cy={-8} r={26} fill={KRP.white} opacity={0.4} />
        </g>
        {/* 割れた湯呑み */}
        <g transform="translate(830 1000)">
          <path d="M -30 0 Q -34 -34 -6 -38 L 2 -20 L -8 0 Z" fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 16 0 Q 36 -8 30 -32 L 12 -22 L 6 0 Z" fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 芽吹き (揺れる) */}
        <g transform={`translate(300 968) rotate(${Math.sin(f / 7) * 6})`}>
          <path d="M 0 0 Q -2 -34 0 -56" fill="none" stroke={KRP.green} strokeWidth={6} />
          <path d="M 0 -42 Q -30 -58 -34 -82 Q -6 -74 0 -52 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M 0 -52 Q 26 -66 34 -90 Q 8 -84 0 -56 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 小鳥 (看板の上。尾が動く) */}
        <g transform="translate(1398 712)">
          <ellipse cx={0} cy={0} rx={22} ry={16} fill="#8A7A66" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={18} cy={-10} r={11} fill="#8A7A66" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 26 -10 l 12 3 l -12 4 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={21} cy={-12} r={2.4} fill={KRP.ink} />
          <path d={`M -18 -4 L ${-44} ${-10 + Math.sin(f / 5) * 8} L -20 4 Z`}
            fill="#6E6052" stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_114: (f) => <Sg114 f={f} />,
  sg_115: (f) => <Sg115 f={f} />,
  sg_116: (f) => <Sg116 f={f} />,
  sg_117: (f) => <Sg117 f={f} />,
  sg_118: (f) => <Sg118 f={f} />,
  sg_119: (f) => <Sg119 f={f} />,
  sg_120: (f) => <Sg120 f={f} />,
  sg_121: (f) => <Sg121 f={f} />,
  sg_122: (f) => <Sg122 f={f} />,
  sg_123: (f) => <Sg123 f={f} />,
  sg_124: (f) => <Sg124 f={f} />,
  sg_125: (f) => <Sg125 f={f} />,
};

export const S_B6_MOTIFS: string[] = [
  "sg_114", // #114
  "sg_115", // #115
  "sg_116", // #116
  "sg_117", // #117
  "sg_118", // #118
  "sg_119", // #119
  "sg_120", // #120
  "sg_121", // #121
  "sg_122", // #122
  "sg_123", // #123
  "sg_124", // #124
  "sg_125", // #125
];

export const saigoB6Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
