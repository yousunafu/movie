// 「人類は、昔から飛ばして観ていた」: 文#207〜#218 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1335〜1346。
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
  night: "#232B3A",        // 夜の壁・ビル
  nightWall: "#303848",    // 夜の部屋の壁
  nightDeep: "#161D2A",    // 夜空の最暗部
  duskSky: "#4A4258",      // 夕暮れの空 (上)
  duskLow: "#C97B4A",      // 夕暮れの空 (下・残照)
  lanternGlow: "#F6C96A",  // 提灯の明かり
  tatami: "#CDBD7E",       // 畳
  plaster: "#EFE6D0",      // 漆喰壁
  deskDark: "#5A4634",     // 濃い机
  page: "#F8F3E4",         // 本のページ
  phoneBody: "#3A3F4A",    // スマホ筐体
  screenDim: "#1E2430",    // スマホ画面の暗部
  gilt: "#C9A84C",         // 鏡の金縁
  warmWall: "#F2E0B0",     // #216左の暖かい壁
  coolWall: "#DCE6EE",     // #216右の涼しい壁
  sofaBlue: "#6B7FA0",     // ソファ
  velvet: "#7A2E3C",       // 18世紀のボックスのビロード (curtainと別)
  wigWhite: "#EDE8DF",     // 18世紀のかつら
  coatPlum: "#7C5A78",     // 18世紀の上着
  roadGray: "#454B58",     // 夜の路面
  morning: "#FBF6E3",      // 朝の光
  kumiMat: "#2C3752",      // #211 組紐を置く藍の毛氈
  kumiMatLit: "#3B4868",   // #211 毛氈のランプの当たり
  rulerWood: "#E6CF98",    // #211 物差し
};
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具 (ローカル部品)
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (seed: number, i: number) => {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// カメラ寄せ: (cx,cy) を中心に z 倍
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 円グラフの扇形パス (12時起点・時計回り・frac 0..1)
const arcPath = (cx: number, cy: number, r: number, frac: number) => {
  const a = Math.min(0.9999, Math.max(0.0001, frac)) * Math.PI * 2;
  const x = cx + Math.sin(a) * r;
  const y = cy - Math.cos(a) * r;
  const large = a > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y} Z`;
};

// 指さす手 (手袋風)。(x,y)=人差し指の先。rot で向き
const HandPoint: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> =
  ({ x, y, s = 1, rot = 0, color = KRP.white }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* 人差し指 → 手の甲 → 袖 */}
      <path d="M 0 0 L 16 34 Q 20 46 34 50 L 78 64 Q 108 74 112 104 L 108 142 Q 100 164 70 160 L 30 150 Q -6 140 -2 100 L 2 44 Q -4 14 0 0 Z"
        fill={color} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 34 86 q 20 -6 38 2 M 36 112 q 20 -4 36 4" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
      <rect x={18} y={140} width={104} height={56} rx={14} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={7} />
    </g>
  );

// 提灯。(x,y)=吊り元。lit で発光
const Chochin: React.FC<{ x: number; y: number; s?: number; f: number; ph?: number; lit?: boolean }> =
  ({ x, y, s = 1, f, ph = 0, lit = true }) => {
    const sway = Math.sin(f / 11 + ph) * 3;
    const flick = 0.85 + Math.sin(f / 5 + ph * 2) * 0.1;
    return (
      <g transform={`translate(${x} ${y}) rotate(${sway})`}>
        {lit && <circle cy={86 * s} r={120 * s} fill={C.lanternGlow} opacity={0.22 * flick} />}
        <line y2={18 * s} stroke={C.ink} strokeWidth={5} />
        <ellipse cy={86 * s} rx={52 * s} ry={70 * s}
          fill={lit ? C.lanternGlow : SGP.lampOff} stroke={C.ink} strokeWidth={6} />
        {[-36, -12, 12, 36].map((dy, i) => (
          <path key={i} d={`M ${-50 * s} ${(86 + dy) * s} Q 0 ${(86 + dy + 7) * s} ${50 * s} ${(86 + dy) * s}`}
            fill="none" stroke={C.ink} strokeWidth={3} opacity={0.45} />
        ))}
        <rect x={-26 * s} y={12 * s} width={52 * s} height={12 * s} fill={C.ink} />
        <rect x={-26 * s} y={148 * s} width={52 * s} height={12 * s} fill={C.ink} />
      </g>
    );
  };

// 人物に衣装を重ねる入れ物 (掟3章の契約どおり)。Person と同じ変換・同じ bob。
// 中の Person には x={0} y={0} still を渡す。座標は人物ローカル (頭 cy=-228 / あご -164 / 胴 -160..-52 / 足元 0)
const Kasane: React.FC<{
  x: number; y: number; s?: number; lean?: number; f: number; phase?: number;
  back?: React.ReactNode; front?: React.ReactNode; children: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f, phase = 0, back, front, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {back}{children}{front}
    </g>
  );
};

// 着物の袂 (胴の後ろ。両脇から袖が垂れて見える)
const KimonoBack: React.FC<{ cloth: string; dark: string }> = ({ cloth, dark }) => (
  <g fill={cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round">
    <path d="M -100 -150 L -52 -156 L -52 -74 Q -52 -60 -76 -60 Q -100 -60 -100 -76 Z" />
    <path d="M 100 -150 L 52 -156 L 52 -74 Q 52 -60 76 -60 Q 100 -60 100 -76 Z" />
    <path d="M -94 -82 Q -76 -72 -58 -82 M 94 -82 Q 76 -72 58 -82" fill="none" stroke={dark} strokeWidth={4} />
  </g>
);
// 着物の衿 (右前 = 見る側から「y」の形) と帯。衿はあご (-164) より下から
const KimonoFront: React.FC<{ obi: string; mage?: boolean }> = ({ obi, mage }) => (
  <g>
    <g fill={C.page} stroke={C.ink} strokeWidth={4} strokeLinejoin="round">
      <path d="M -40 -158 L -24 -162 L 2 -126 L -6 -116 Z" />
      <path d="M 40 -158 L 24 -162 L -14 -104 L -26 -110 Z" />
    </g>
    <rect x={-60} y={-98} width={120} height={26} rx={5} fill={obi} stroke={C.ink} strokeWidth={4.5} />
    <path d="M -56 -85 L 56 -85" stroke={C.ink} strokeWidth={2.5} opacity={0.35} />
    {mage && (
      <g>
        <path d="M -16 -288 Q 4 -312 34 -300 L 30 -288 Q 8 -296 -10 -282 Z" fill={C.ink} />
        <rect x={-4} y={-300} width={14} height={10} rx={3} fill={C.page} stroke={C.ink} strokeWidth={2.5} transform="rotate(-18 3 -295)" />
      </g>
    )}
  </g>
);
// 部屋着のパーカー: 後ろにフード / 前にひも (あごより下から)
const HoodieBack: React.FC<{ cloth: string }> = ({ cloth }) => (
  <path d="M -58 -150 Q -76 -186 -44 -196 L 44 -196 Q 76 -186 58 -150 Z"
    fill={cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
);
const HoodieFront: React.FC<{ dark: string }> = ({ dark }) => (
  <g>
    <path d="M -34 -160 Q 0 -146 34 -160" fill="none" stroke={dark} strokeWidth={6} strokeLinecap="round" />
    <g stroke={C.page} strokeWidth={4} strokeLinecap="round">
      <line x1={-12} y1={-154} x2={-14} y2={-134} />
      <line x1={12} y1={-154} x2={14} y2={-134} />
    </g>
    <path d="M -40 -96 L 40 -96 L 46 -64 L -46 -64 Z" fill="none" stroke={dark} strokeWidth={4.5} strokeLinejoin="round" />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #207 再生速度の、ボタンです。
// 格: 図 / seed 1335
// 絵: `SaiseiBar`。速度メニューが開き「1倍 → 1.5倍 → 2倍」。指がホバーする
// どこ: 板壁の工房。大きなクラフト紙を画鋲で貼り その上に再生バーの図解
// 演出: バーの右の速度メニューが木札で開き 1倍→1.5倍→2倍 と選択が進む。指がホバー
// 動き: つまみが右へ進む / 選択ハイライトが段階で移る / 指が札を追って上下
const Sg207: React.FC<{ f: number }> = ({ f }) => {
  const sel = f < 16 ? 0 : f < 28 ? 1 : 2; // どの速度を選んでいるか
  const menuT = pop(seg(f, 2, 12));
  const speeds = ["1倍", "1.5倍", "2倍"];
  return (
    <Frame f={f} seed={1335}>
      {/* 板壁 */}
      <rect width={W} height={H} fill={SGP.wood} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1={0} y1={i * 190 + 60} x2={W} y2={i * 190 + 66} stroke={SGP.woodDark} strokeWidth={5} opacity={0.5} />
          <ellipse cx={200 + rnd(1, i) * 1500} cy={i * 190 + 150} rx={26} ry={10}
            fill="none" stroke={SGP.woodDark} strokeWidth={3} opacity={0.4} />
        </g>
      ))}
      {/* 壁の小物: 棚と工具 */}
      <rect x={60} y={200} width={240} height={14} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
      <rect x={90} y={130} width={54} height={70} rx={6} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} />
      <rect x={168} y={146} width={44} height={54} rx={6} fill={KRP.orange} stroke={C.ink} strokeWidth={5} opacity={0.85} />
      {/* クラフト紙の大判 */}
      <g transform={`rotate(-0.6 960 520)`}>
        <rect x={150} y={225} width={1630} height={620} rx={10} fill={SGP.paper} stroke={C.ink} strokeWidth={7} />
        <rect x={150} y={225} width={1630} height={620} rx={10} fill="none" stroke={SGP.paperOld} strokeWidth={22} opacity={0.35} />
        {/* 画鋲とテープ */}
        {[[200, 262], [1724, 262], [200, 806], [1724, 806]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={13} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={880} y={210} width={150} height={40} fill={KRP.yellow} opacity={0.6} transform="rotate(-3 955 230)" />
      </g>
      {/* 再生バー (共有装置) — つまみがわずかに進む */}
      <SaiseiBar f={f} x={880} y={620} s={0.98} progress={0.3 + seg(f, 4, 42) * 0.16} />
      {/* 紙の下半分: 設計の落書きと文房具 (素肌禁止の埋め) */}
      <g opacity={0.55} stroke={KRP.grayDark} fill="none" strokeWidth={4}>
        {/* つまみのスケッチ (十字入り) */}
        <circle cx={380} cy={760} r={44} />
        <path d="M 336 760 L 424 760 M 380 716 L 380 804" opacity={0.7} />
        <path d="M 330 820 q 50 -10 100 0" />
        {/* ボタンのスケッチ ▶▶ */}
        <rect x={560} y={716} width={110} height={88} rx={14} />
        <path d="M 586 744 L 610 760 L 586 776 Z M 616 744 L 640 760 L 616 776 Z" fill={KRP.gray} stroke="none" />
        <path d="M 550 820 q 60 -12 130 0" />
        {/* 考え中のぐるぐると矢印 */}
        <path d="M 760 770 q 24 -30 48 0 q 24 30 48 0" />
        <path d="M 880 766 q 40 -14 80 -4" />
        <path d="M 948 752 L 966 764 L 944 772 Z" fill={KRP.gray} stroke="none" />
      </g>
      {/* つまみの先の「飛ばし」の跳ね矢印 (点線の山なり) */}
      <path d={`M 830 586 Q 960 ${506 - seg(f, 10, 30) * 14} 1090 586`} fill="none"
        stroke={KRP.orange} strokeWidth={7} strokeDasharray="14 12" opacity={seg(f, 10, 34)} />
      <path d="M 1072 556 L 1096 588 L 1058 584 Z" fill={KRP.orange} opacity={seg(f, 10, 34)} />
      {/* 紙の上に置かれた鉛筆と消しゴム */}
      <g transform="translate(1310 782) rotate(-8)">
        <rect x={-170} y={-13} width={300} height={26} rx={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} />
        <path d="M 130 -13 L 178 0 L 130 13 Z" fill="#F0C8A0" stroke={C.ink} strokeWidth={5} />
        <path d="M 160 -5 L 178 0 L 160 5 Z" fill={C.ink} />
        <rect x={-206} y={-13} width={36} height={26} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
      </g>
      <rect x={1560} y={740} width={96} height={52} rx={10} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} transform="rotate(10 1608 766)" />
      {/* 速度メニュー: 2×ボタンから木のパネルが開く */}
      <g transform={`translate(1580 300) scale(${lerp(0.2, 1, menuT)})`} opacity={menuT}>
        <path d="M 0 212 L -36 248 L 10 240 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={-150} y={-120} width={300} height={340} rx={16} fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        <rect x={-134} y={-104} width={268} height={308} rx={10} fill={SGP.paperOld} stroke={C.ink} strokeWidth={4} />
        <text x={0} y={-62} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.ink} fontFamily={FONT}>速度</text>
        {speeds.map((sp, i) => {
          const on = sel === i;
          return (
            <g key={i} transform={`translate(0 ${-20 + i * 72})`}>
              <rect x={-110} y={-26} width={220} height={54} rx={10}
                fill={on ? KRP.orange : KRP.white} stroke={C.ink} strokeWidth={5} />
              <text x={0} y={14} textAnchor="middle" fontSize={34} fontWeight={800}
                fill={on ? KRP.white : C.ink} fontFamily={FONT}>{sp}</text>
            </g>
          );
        })}
      </g>
      {/* ホバーする指 (選択中の札の右) */}
      <HandPoint x={1708} y={300 + (-20 + sel * 72) + Math.sin(f / 6) * 6} s={1.05} rot={-108} />
      {/* 床の端の作業台の気配 */}
      <rect x={0} y={960} width={W} height={120} fill={SGP.woodDark} opacity={0.5} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #208 倍速で観た経験のある人は、2021年の調査で、34パーセント。
// 格: 図 / seed 1336
// 絵: 円グラフ34% (スマホ画面の世界)。年号札2021
// どこ: 夕方の部屋の机。手に持った縦スマホの画面の中に調査の円グラフ
// 演出: 一時停止した動画の下に調査カードがせり上がり 橙の扇形が34%まで育つ
// 動き: 扇形スイープ / 34%の数字がポン / 湯気と窓の残照
const Sg208: React.FC<{ f: number }> = ({ f }) => {
  const sweep = easeOut(seg(f, 8, 36)) * 0.34;
  const numT = pop(seg(f, 32, 42));
  return (
    <Frame f={f} seed={1336}>
      {/* 夕方の壁と窓 */}
      <rect width={W} height={H} fill="#E8DCC2" />
      <rect x={1430} y={120} width={400} height={520} rx={10} fill={C.duskLow} stroke={C.ink} strokeWidth={8} />
      <circle cx={1540} cy={260} r={52} fill={KRP.yellow} opacity={0.9} />
      <path d="M 1430 480 L 1620 360 L 1830 470 L 1830 640 L 1430 640 Z" fill="#9A6A4A" opacity={0.6} />
      <line x1={1630} y1={120} x2={1630} y2={640} stroke={C.ink} strokeWidth={7} />
      <line x1={1430} y1={380} x2={1830} y2={380} stroke={C.ink} strokeWidth={7} />
      {/* 壁の棚 */}
      <rect x={120} y={170} width={300} height={14} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
      <rect x={150} y={96} width={60} height={74} rx={6} fill={KRP.green} stroke={C.ink} strokeWidth={5} opacity={0.8} />
      <rect x={236} y={110} width={46} height={60} rx={6} fill={KRP.blue} stroke={C.ink} strokeWidth={5} opacity={0.8} />
      <circle cx={356} cy={140} r={28} fill={KRP.orange} stroke={C.ink} strokeWidth={5} opacity={0.8} />
      {/* 机 */}
      <rect x={0} y={880} width={W} height={200} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
      <line x1={0} y1={920} x2={W} y2={920} stroke={SGP.woodDark} strokeWidth={4} opacity={0.5} />
      {/* マグと湯気 */}
      <g transform="translate(1560 830)">
        <rect x={-56} y={-88} width={112} height={92} rx={12} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={7} />
        <path d="M 56 -66 q 44 4 40 36 q -4 28 -40 24" fill="none" stroke={C.ink} strokeWidth={7} />
        <path d={`M -20 -104 q ${Math.sin(f / 7) * 10} -28 0 -52 M 18 -102 q ${Math.sin(f / 7 + 2) * 10} -24 0 -46`}
          fill="none" stroke={KRP.gray} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </g>
      {/* ノートとペン */}
      <g transform="translate(300 930) rotate(-6)">
        <rect x={-130} y={-60} width={260} height={120} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-100} y1={-28 + i * 28} x2={100} y2={-28 + i * 28} stroke={KRP.gray} strokeWidth={4} />
        ))}
        <rect x={140} y={-16} width={110} height={16} rx={8} fill={KRP.red} stroke={C.ink} strokeWidth={5} transform="rotate(14)" />
      </g>
      {/* 縦スマホを持つ手 */}
      <g transform={`translate(870 520) rotate(-3) translate(0 ${Math.sin(f / 12) * 4})`}>
        {/* 持つ手 (下から) */}
        <path d="M -220 420 Q -140 350 -30 368 L 150 400 Q 230 420 220 520 L -240 520 Z"
          fill="#F0C8A0" stroke={C.ink} strokeWidth={7} />
        <path d="M -60 372 q 30 -16 64 -4 M 20 382 q 30 -14 62 -2" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
        {/* 筐体 */}
        <rect x={-280} y={-420} width={560} height={860} rx={48} fill={C.phoneBody} stroke={C.ink} strokeWidth={9} />
        <clipPath id="sg208scr"><rect x={-252} y={-392} width={504} height={804} rx={28} /></clipPath>
        <rect x={-252} y={-392} width={504} height={804} rx={28} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <g clipPath="url(#sg208scr)">
          {/* 上: 一時停止中の動画 */}
          <rect x={-252} y={-392} width={504} height={240} fill={C.screenDim} />
          <path d="M -252 -222 L -120 -300 L 30 -236 L 150 -312 L 252 -250 L 252 -152 L -252 -152 Z" fill="#3E4A5E" />
          <g opacity={0.9}>
            <rect x={-44} y={-316} width={88} height={88} rx={14} fill={KRP.white} opacity={0.85} />
            <rect x={-20} y={-294} width={14} height={44} fill={C.ink} />
            <rect x={6} y={-294} width={14} height={44} fill={C.ink} />
          </g>
          <rect x={-252} y={-166} width={504} height={10} fill={KRP.gray} />
          <rect x={-252} y={-166} width={300} height={10} fill={KRP.red} />
          {/* 下: 調査カード */}
          <rect x={-252} y={-140} width={504} height={560} fill={KRP.cream} />
          <rect x={-200} y={-118} width={400} height={64} rx={30} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} />
          <text x={0} y={-74} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.ink} fontFamily={FONT}>倍速で観た経験</text>
          {/* 円グラフ */}
          <circle cx={0} cy={160} r={190} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={8} />
          <path d={arcPath(0, 160, 190, Math.max(0.002, sweep))} fill={KRP.orange} stroke={C.ink} strokeWidth={7} />
          <circle cx={0} cy={160} r={190} fill="none" stroke={C.ink} strokeWidth={8} />
        </g>
        {/* 34% は画面の上に大きく */}
        <g transform={`translate(118 268) scale(${numT})`} opacity={numT}>
          <rect x={-120} y={-56} width={240} height={104} rx={14} fill={KRP.white} stroke={C.ink} strokeWidth={7} transform="rotate(-4)" />
          <text y={26} textAnchor="middle" fontSize={72} fontWeight={900} fill={KRP.orange} fontFamily={FONT} transform="rotate(-4)">34%</text>
        </g>
      </g>
      {/* 年号札 */}
      <TagPlate x={350} y={300} text="2021" size={52} rot={-5} t={pop(seg(f, 2, 10))} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #209 3年後の2024年には、47パーセントまで増えました。
// 格: 図 / seed 1337
// 絵: 同じ円グラフが連番でぐっと育って47%に。年号札2024。増分の矢印
// どこ: 夜。#208と同じスマホ画面にぐっと寄る (連番2枚目)。左に電気スタンドの光
// 演出: 34%の上に赤い増分がせり出して47%へ。増分の曲がり矢印 (数字なし)
// 動き: 増分の扇形が育つ / 矢印がポン / 画面の反射がゆっくり流れる
const Sg209: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 6, 32));
  const frac = 0.34 + 0.13 * grow;
  const arrT = pop(seg(f, 26, 36));
  const numT = pop(seg(f, 30, 40));
  return (
    <Frame f={f} seed={1337} dark bg={C.nightWall}>
      <rect width={W} height={H} fill={C.nightWall} />
      {/* 電気スタンドの光だまり (左) */}
      <circle cx={240} cy={300} r={420} fill={C.lanternGlow} opacity={0.12} />
      <g transform="translate(180 420)">
        <path d="M -20 0 L 20 0 L 10 -200 L -10 -200 Z" fill={C.ink} opacity={0.8} />
        <path d="M -80 -200 L 80 -200 L 44 -300 L -44 -300 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={6} opacity={0.9} />
        <circle cx={0} cy={-210} r={16} fill={C.lanternGlow} opacity={0.9} />
      </g>
      {/* 観葉植物のシルエット (右下) */}
      <g opacity={0.55} fill="#1E2A26">
        <path d="M 1800 1080 q -30 -200 40 -320 q 30 120 -4 320 Z" />
        <path d="M 1860 1080 q -80 -160 -170 -210 q 110 10 170 110 Z" />
        <rect x={1770} y={1020} width={150} height={60} rx={8} />
      </g>
      {/* 寄ったスマホ: 筐体は画面端で切れる */}
      <g transform={`translate(${Math.sin(f / 15) * 3} 0)`}>
        <rect x={330} y={-80} width={1260} height={1240} rx={90} fill={C.phoneBody} stroke={C.ink} strokeWidth={10} />
        <clipPath id="sg209scr"><rect x={390} y={-20} width={1140} height={1120} rx={48} /></clipPath>
        <rect x={390} y={-20} width={1140} height={1120} rx={48} fill={KRP.cream} stroke={C.ink} strokeWidth={6} />
        <g clipPath="url(#sg209scr)">
          {/* カードのヘッダ */}
          <rect x={470} y={60} width={460} height={70} rx={32} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={6} />
          <text x={700} y={108} textAnchor="middle" fontSize={38} fontWeight={800} fill={C.ink} fontFamily={FONT}>倍速で観た経験</text>
          {/* 円グラフ (大) */}
          <circle cx={820} cy={580} r={270} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={9} />
          <path d={arcPath(820, 580, 270, 0.34)} fill={KRP.orange} stroke={C.ink} strokeWidth={7} />
          {/* 増分: 34%の縁から赤がせり出す */}
          <g opacity={grow > 0.02 ? 1 : 0}>
            <path d={`M 820 580 L ${820 + Math.sin(0.34 * Math.PI * 2) * 270} ${580 - Math.cos(0.34 * Math.PI * 2) * 270} A 270 270 0 0 1 ${820 + Math.sin(frac * Math.PI * 2) * 270} ${580 - Math.cos(frac * Math.PI * 2) * 270} Z`}
              fill={KRP.red} stroke={C.ink} strokeWidth={7} />
          </g>
          {/* 34の境界の点線 */}
          <line x1={820} y1={580}
            x2={820 + Math.sin(0.34 * Math.PI * 2) * 300} y2={580 - Math.cos(0.34 * Math.PI * 2) * 300}
            stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" opacity={0.6} />
          <circle cx={820} cy={580} r={270} fill="none" stroke={C.ink} strokeWidth={9} />
          {/* 増分の曲がり矢印 (数字なし) */}
          <g opacity={arrT} transform={`scale(${lerp(0.6, 1, arrT)})`} style={{ transformOrigin: "1190px 430px" }}>
            <path d="M 1140 620 A 330 330 0 0 0 1062 330" fill="none" stroke={KRP.red} strokeWidth={14} strokeLinecap="round" />
            <path d="M 1026 356 L 1062 330 L 1072 374 Z" fill={KRP.red} stroke={KRP.red} strokeWidth={6} />
          </g>
          {/* 画面の反射 (ゆっくり流れる) */}
          <rect x={300 + (f * 4) % 500} y={-120} width={90} height={1400} fill={KRP.white} opacity={0.08} transform="rotate(18 960 540)" />
          <rect x={430 + (f * 4) % 500} y={-120} width={36} height={1400} fill={KRP.white} opacity={0.08} transform="rotate(18 960 540)" />
        </g>
        {/* 47% 大きく */}
        <g transform={`translate(1270 700) scale(${numT})`} opacity={numT}>
          <rect x={-168} y={-74} width={336} height={140} rx={16} fill={KRP.white} stroke={C.ink} strokeWidth={8} transform="rotate(3)" />
          <text y={36} textAnchor="middle" fontSize={100} fontWeight={900} fill={KRP.red} fontFamily={FONT} transform="rotate(3)">47%</text>
        </g>
      </g>
      {/* 年号札 */}
      <TagPlate x={380} y={200} text="2024" size={52} rot={4} t={pop(seg(f, 2, 10))} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #210 若い世代では、スキップ再生の経験が、半分を超えています。
// 格: 図 / seed 1338
// 絵: 世代別の棒グラフ (連番3枚目)。若い世代の棒が50%の線を越える。越えた分が光る
// どこ: 朝の明るい机。スタンドに立てた横向きスマホ (連番3枚目)。窓から光の帯
// 演出: 若い世代の棒が点線の50%線をぐんと越え 越えた分が金色に光る
// 動き: 棒が伸びる / 越えた分が脈打つ / キラが2つポン / 光の帯がゆらぐ
const Sg210: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 6, 34));
  const barTop = lerp(700, 360, up);    // 画面内の棒の上端
  const lineY = 450;                    // 50%の点線
  const over = Math.max(0, lineY - barTop);
  const glow = 0.55 + Math.sin(f / 5) * 0.25;
  const sp1 = pop(seg(f, 34, 40));
  const sp2 = pop(seg(f, 37, 42));
  return (
    <Frame f={f} seed={1338} bg={C.morning}>
      <rect width={W} height={H} fill={C.morning} />
      {/* 窓からの光の帯 */}
      <g opacity={0.5}>
        <path d={`M -100 0 L 300 0 L ${760 + Math.sin(f / 16) * 14} 1080 L 320 1080 Z`} fill={KRP.yellow} opacity={0.3} />
        <path d={`M 360 0 L 560 0 L ${1020 + Math.sin(f / 16) * 14} 1080 L 830 1080 Z`} fill={KRP.yellow} opacity={0.22} />
      </g>
      {/* 奥の壁の額とカレンダー (数字は描かない) */}
      <rect x={1560} y={140} width={240} height={300} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={1590} y1={230 + i * 50} x2={1770} y2={230 + i * 50} stroke={KRP.gray} strokeWidth={5} />
      ))}
      <rect x={100} y={150} width={200} height={150} rx={8} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={7} />
      <path d="M 110 280 L 180 200 L 230 250 L 290 180" fill="none" stroke={KRP.blueDeep} strokeWidth={6} />
      {/* 机 */}
      <rect x={0} y={840} width={W} height={240} fill="#E2CFA4" stroke={C.ink} strokeWidth={7} />
      <line x1={0} y1={884} x2={W} y2={884} stroke="#C4AE80" strokeWidth={4} />
      {/* 机の小物: 朝のパンとコップ */}
      <g transform="translate(260 900)">
        <ellipse cx={0} cy={26} rx={110} ry={26} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <path d="M -60 10 q 60 -56 120 0 q -60 26 -120 0 Z" fill="#E0A860" stroke={C.ink} strokeWidth={6} />
      </g>
      <g transform="translate(1680 870)">
        <path d="M -38 -90 L 38 -90 L 30 40 L -30 40 Z" fill={KRP.blueSoft} stroke={C.ink} strokeWidth={6} opacity={0.9} />
        <rect x={-38} y={-60} width={76} height={20} fill={KRP.orange} opacity={0.6} />
      </g>
      {/* スタンドに立てた横スマホ */}
      <g transform={`translate(0 ${Math.sin(f / 14) * 2})`}>
        <path d="M 820 950 L 1140 950 L 1100 880 L 860 880 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        <rect x={310} y={170} width={1320} height={720} rx={44} fill={C.phoneBody} stroke={C.ink} strokeWidth={9} />
        <clipPath id="sg210scr"><rect x={360} y={218} width={1220} height={624} rx={24} /></clipPath>
        <rect x={360} y={218} width={1220} height={624} rx={24} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <g clipPath="url(#sg210scr)">
          <rect x={360} y={218} width={1220} height={624} fill={KRP.cream} />
          {/* ヘッダ: スキップの二重三角アイコン + チップ */}
          <g transform="translate(470 300)">
            <rect x={-60} y={-44} width={120} height={88} rx={14} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={6} />
            <path d="M -36 -24 L -4 0 L -36 24 Z M 0 -24 L 32 0 L 0 24 Z" fill={KRP.white} />
          </g>
          <rect x={570} y={258} width={520} height={84} rx={38} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={6} />
          <text x={830} y={314} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.ink} fontFamily={FONT}>スキップ再生の経験</text>
          {/* グラフ床 */}
          <line x1={430} y1={740} x2={1520} y2={740} stroke={C.ink} strokeWidth={8} />
          {/* 50%の点線と小チップ */}
          <line x1={430} y1={lineY} x2={1520} y2={lineY} stroke={KRP.red} strokeWidth={6} strokeDasharray="20 14" />
          <rect x={1310} y={lineY - 66} width={150} height={56} rx={12} fill={KRP.white} stroke={KRP.red} strokeWidth={6} />
          <text x={1385} y={lineY - 26} textAnchor="middle" fontSize={36} fontWeight={900} fill={KRP.red} fontFamily={FONT}>50%</text>
          {/* 主役の棒 */}
          <rect x={760} y={barTop} width={360} height={740 - barTop} rx={10} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={8} />
          {over > 2 && (
            <g>
              <rect x={760 - 18} y={barTop - 18} width={396} height={over + 18} rx={16}
                fill={KRP.yellow} opacity={0.35 * glow} />
              <rect x={760} y={barTop} width={360} height={over} rx={10} fill={KRP.yellow} stroke={C.ink} strokeWidth={8} />
              <rect x={766} y={barTop + 6} width={348} height={Math.max(0, over - 6)} rx={8}
                fill={KRP.white} opacity={0.25 + glow * 0.2} />
            </g>
          )}
          {/* キラ */}
          <g transform={`translate(700 ${barTop - 20}) scale(${sp1})`} opacity={sp1}>
            <path d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          </g>
          <g transform={`translate(1190 ${barTop + 30}) scale(${sp2})`} opacity={sp2}>
            <path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={4} />
          </g>
        </g>
      </g>
      {/* 棒のラベル札 (回転なし: 下端 790+36*0.85=820.6) */}
      <TagPlate x={940} y={790} text="若い世代" size={36} t={pop(seg(f, 8, 16))} fill={KRP.white} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #211 150年かけて組み上げられた「最初から最後まで」が、ほどけていきます。
// 格: 山 / seed 1339
// 絵 (修正3で作り直し): 藍の毛氈の上に置いた太い組紐を真上から。6色の撚り糸それぞれに
//   この動画に出てきたルールの荷札 (年号つき) が結んである。左端は固く結ばれ 右端 (いま) で糸がほどけて広がり
//   ほどけた糸の先が 倍速「2×」・スキップ・スマホに軽く触れている。上に「150年」の物差し
// 動き: 荷札が年の順にポン / ほどけ目がじわじわ左へ進む / ほどけた糸が波打つ / 糸くずが漂う / ゆっくり寄る
// ルールは台本で確認: 1876消灯(#86) 1897遅刻お断り(#101-104) 1911椅子席(#121-122)
//   1960途中入場お断り(#153-156) 1984入替制(#178) 1996全席指定(#184)
const KUMI_COL = ["#D3402E", "#E8B33A", "#7FB069", "#F1EBDD", "#6F9AD0", "#9C6CB4"]; // 朱 金 萌黄 白 藍 紫
const KUMI_RULES: [string, string][] = [
  ["1876", "消灯"], ["1897", "遅刻お断り"], ["1911", "椅子席"],
  ["1960", "途中入場お断り"], ["1984", "入替制"], ["1996", "全席指定"],
];
// 木の荷札。(x,y)=紐穴。year は小さく 上 / rule は大きく 下
const Nifuda: React.FC<{ x: number; y: number; year: string; rule: string; t: number; rot: number }> =
  ({ x, y, year, rule, t, rot }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    const w = Math.max(rule.length * 32, 96) + 44;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
        <path d={`M ${-w / 2 + 18} 0 L ${w / 2 - 18} 0 L ${w / 2} 18 L ${w / 2} 100 L ${-w / 2} 100 L ${-w / 2} 18 Z`}
          fill={SGP.paper} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${-w / 2 + 10} 92 L ${w / 2 - 10} 92`} stroke={SGP.paperOld} strokeWidth={6} />
        <circle cx={0} cy={14} r={7} fill={C.kumiMat} stroke={C.ink} strokeWidth={3.5} />
        <text x={0} y={48} textAnchor="middle" fontSize={28} fontWeight={800} fill={SGP.woodDark} fontFamily={FONT}>{year}</text>
        <text x={0} y={84} textAnchor="middle" fontSize={32} fontWeight={900} fill={C.ink} fontFamily={FONT}>{rule}</text>
      </g>
    );
  };

const Sg211: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 150)) * 0.05;          // ゆっくり寄る
  const xA = lerp(1340, 1250, easeOut(clamp01(f / 110)));  // ほどけ目 (じわじわ左へ)
  const yc = 400;                                          // 組紐の中心
  const ropeY = (x: number) => yc + Math.sin(x / 260) * 10; // 置いた紐のゆるい波
  // 組目 (矢羽の山形) を左から並べる。ほどけ目に近いほど目が粗く ふくらむ
  const chev: { x: number; d: number; h: number; k: number }[] = [];
  {
    let x = 150; let k = 0;
    while (x < xA) {
      const loose = clamp01((x - (xA - 260)) / 260);
      const d = 34 + loose * 26;
      chev.push({ x, d, h: 52 + loose * 16, k });
      x += d; k += 1;
    }
  }
  // ほどけた6本の糸の終点 (上から順に)。1・3・5本目はアイコンに触れる
  const ends: [number, number][] = [
    [1560, 236], [1734, 300], [1640, 412], [1752, 528], [1620, 640], [1724, 736],
  ];
  const touch = [false, true, false, true, false, true]; // アイコンに触れる糸は終点を固定
  const spread = 0.82 + 0.18 * easeOut(clamp01(f / 120)); // 糸がじわっと広がる
  return (
    <Frame f={f} seed={1339} bg={C.kumiMat} dark>
      <g transform={zoomAt(z, 1150, 470)}>
        {/* 藍の毛氈 (真上から) と 卓上ランプの明かり */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.kumiMat} />
        <ellipse cx={980} cy={470} rx={980} ry={520} fill={C.kumiMatLit} opacity={0.55} />
        {[...Array(18)].map((_, i) => (
          <circle key={i} cx={rnd(41, i) * W} cy={rnd(42, i) * 1000} r={2 + rnd(43, i) * 2.5}
            fill={KRP.white} opacity={0.08} />
        ))}
        {/* 毛氈の縁の縫い目 */}
        <rect x={30} y={30} width={W - 60} height={H - 60} rx={20} fill="none"
          stroke={KRP.white} strokeWidth={4} strokeDasharray="14 12" opacity={0.18} />
        {/* 物差し「150年」(組紐の始まりから いまの端まで) */}
        <g>
          <rect x={110} y={156} width={1700} height={58} rx={8} fill={C.rulerWood} stroke={C.ink} strokeWidth={6} />
          {[...Array(44)].map((_, i) => (
            <line key={i} x1={130 + i * 38.6} y1={156} x2={130 + i * 38.6} y2={i % 5 === 0 ? 188 : 172}
              stroke={C.ink} strokeWidth={i % 5 === 0 ? 4 : 3} opacity={0.7} />
          ))}
          <rect x={872} y={166} width={156} height={44} rx={8} fill={C.rulerWood} />
          <text x={950} y={203} textAnchor="middle" fontSize={36} fontWeight={900} fill={C.ink} fontFamily={FONT}>150年</text>
        </g>
        {/* 組紐の糸巻き (横に寝かせた木の枠に色糸) が2つ */}
        {[[420, 268, 0, -4], [640, 272, 4, 5]].map(([bx, by, ci, r], i) => (
          <g key={i} transform={`translate(${bx} ${by}) rotate(${r})`}>
            <rect x={-56} y={-22} width={112} height={44} rx={10} fill={KUMI_COL[ci]} stroke={C.ink} strokeWidth={5} />
            {[...Array(6)].map((_, k) => (
              <line key={k} x1={-46 + k * 18} y1={-22} x2={-38 + k * 18} y2={22} stroke={C.ink} strokeWidth={2.5} opacity={0.35} />
            ))}
            <rect x={-72} y={-32} width={20} height={64} rx={6} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
            <rect x={52} y={-32} width={20} height={64} rx={6} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {/* ===== ほどけた6本の糸 (組目より先に描き 根元を組目の下に隠す) ===== */}
        {ends.map(([ex0, ey0], i) => {
          const sx = xA - 40;
          const sy = ropeY(sx) + (i - 2.5) * 14;
          const ex = touch[i] ? ex0 : lerp(sx + 120, ex0, spread);
          const ey = touch[i] ? ey0 : lerp(sy, ey0, spread);
          const w1 = Math.sin(f / 9 + i * 1.3) * 22;
          const w2 = Math.sin(f / 11 + i * 2.1) * 18;
          const twist = (i % 2 ? 1 : -1) * (i < 3 ? 30 : 16);
          const d = `M ${sx} ${sy} C ${sx + 170} ${sy + twist + w1} ${ex - 170} ${ey - twist + w2} ${ex} ${ey}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
              <path d={d} fill="none" stroke={KUMI_COL[i]} strokeWidth={14} strokeLinecap="round" />
              {/* 撚りの名残 (糸の上の細い斜線) */}
              <path d={d} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="3 15" opacity={0.35} />
              {/* 先っぽのほつれ */}
              <g stroke={KUMI_COL[i]} strokeWidth={4} strokeLinecap="round">
                <line x1={ex} y1={ey} x2={ex + 20} y2={ey - 11} />
                <line x1={ex} y1={ey} x2={ex + 24} y2={ey + 1} />
                <line x1={ex} y1={ey} x2={ex + 19} y2={ey + 12} />
              </g>
            </g>
          );
        })}
        {/* ===== 組紐本体: 矢羽の組目 ===== */}
        {/* 左端の締め (固く巻いた糸) と房 */}
        <g transform={`translate(170 ${ropeY(170)})`}>
          {/* 房: 締めの左から扇に広がる */}
          {[...Array(9)].map((_, i) => {
            const ey = -46 + i * 11.5 + Math.sin(f / 10 + i) * 3;
            return (
              <g key={i}>
                <path d={`M -30 ${-20 + i * 5} Q -70 ${-16 + i * 4} -118 ${ey}`}
                  fill="none" stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
                <path d={`M -30 ${-20 + i * 5} Q -70 ${-16 + i * 4} -118 ${ey}`}
                  fill="none" stroke={KUMI_COL[i % 6]} strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
        {chev.map(({ x, d, h, k }) => {
          const y = ropeY(x);
          const yN = ropeY(x + d * 1.2);
          const cU = KUMI_COL[k % 6];
          const cL = KUMI_COL[(k + 3) % 6];
          return (
            <g key={k} strokeLinecap="round">
              <line x1={x} y1={y - h} x2={x + d * 1.2} y2={yN - 4} stroke={C.ink} strokeWidth={34} />
              <line x1={x} y1={y - h} x2={x + d * 1.2} y2={yN - 4} stroke={cU} strokeWidth={24} />
              <line x1={x} y1={y + h} x2={x + d * 1.2} y2={yN + 4} stroke={C.ink} strokeWidth={34} />
              <line x1={x} y1={y + h} x2={x + d * 1.2} y2={yN + 4} stroke={cL} strokeWidth={24} />
            </g>
          );
        })}
        {/* 組紐のつや (上側に細い光) */}
        <path d={`M 230 ${ropeY(230) - 44} ${[...Array(12)].map((_, i) => {
          const x = 230 + (i + 1) * ((xA - 490) / 12);
          return `L ${x} ${ropeY(x) - 44}`;
        }).join(" ")}`} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.22} strokeLinecap="round" />
        <g transform="translate(160 0)">
          <rect x={-22} y={ropeY(160) - 70} width={44} height={140} rx={12} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
          {[...Array(5)].map((_, i) => (
            <line key={i} x1={-22} y1={ropeY(160) - 50 + i * 25} x2={22} y2={ropeY(160) - 44 + i * 25}
              stroke={C.ink} strokeWidth={3} opacity={0.5} />
          ))}
        </g>
        {/* ===== ほどけた先に触れている いまの道具 (悪者でも英雄でもなく 淡々と) ===== */}
        <g transform={`translate(1800 300) rotate(${Math.sin(f / 13) * 2})`}>
          <rect x={-62} y={-40} width={124} height={80} rx={40} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <text x={0} y={16} textAnchor="middle" fontSize={44} fontWeight={900} fill={C.ink} fontFamily={FONT}>2×</text>
        </g>
        <g transform={`translate(1810 528) rotate(${Math.sin(f / 13 + 2) * 2})`}>
          <circle r={52} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <path d="M -26 -20 L -2 0 L -26 20 Z M -2 -20 L 22 0 L -2 20 Z" fill={C.ink} />
          <rect x={22} y={-20} width={8} height={40} rx={2} fill={C.ink} />
        </g>
        <g transform={`translate(1770 742) rotate(${-8 + Math.sin(f / 13 + 4) * 2})`}>
          <rect x={-46} y={-76} width={92} height={152} rx={16} fill={C.phoneBody} stroke={C.ink} strokeWidth={6} />
          <rect x={-36} y={-62} width={72} height={118} rx={8} fill={SGP.phoneBlue} opacity={0.85 + Math.sin(f / 7) * 0.1} />
          <path d="M -12 -18 L 16 0 L -12 18 Z" fill={KRP.white} />
          <circle cx={0} cy={66} r={4} fill={KRP.gray} />
        </g>
        {/* 漂う糸くず */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const tx = 1380 + rnd(51, i) * 360 + Math.sin(f / 17 + i) * 14;
          const ty = 300 + rnd(52, i) * 420 - ((f * 0.5 + i * 23) % 60);
          return (
            <path key={i} d={`M ${tx} ${ty} q 8 -6 16 0 q 8 6 16 0`} fill="none"
              stroke={KUMI_COL[i]} strokeWidth={3.5} strokeLinecap="round" opacity={0.75} />
          );
        })}
        {/* ===== ルールの荷札: 撚り糸の色の紐で 組紐から下がる (年の順にポン) ===== */}
        {KUMI_RULES.map(([year, rule], i) => {
          const tx = 270 + i * 186;
          const low = i % 2 === 1;
          const ty = low ? 640 : 516;
          const rot = Math.sin(f / 12 + i * 1.7) * 3;
          const t = seg(f, 2 + i * 5, 10 + i * 5);
          return (
            <g key={i}>
              <path d={`M ${tx - 6} ${ropeY(tx) + 40} Q ${tx + 10} ${(ropeY(tx) + ty) / 2} ${tx} ${ty + 14}`}
                fill="none" stroke={C.ink} strokeWidth={8} opacity={clamp01(t * 4)} />
              <path d={`M ${tx - 6} ${ropeY(tx) + 40} Q ${tx + 10} ${(ropeY(tx) + ty) / 2} ${tx} ${ty + 14}`}
                fill="none" stroke={KUMI_COL[i]} strokeWidth={4.5} opacity={clamp01(t * 4)} />
              <Nifuda x={tx} y={ty} year={year} rule={rule} t={t} rot={rot} />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #212 ここで、むかしの明るい客席を、思い出してください。
// 格: 並 / seed 1340
// 絵: 回想の泡。1巻の明るい客席 (江戸の桟敷・ナポリのボックス) がふわりと並んで浮かぶ
// どこ: 夕暮れの居間。ソファの後頭部の上に 回想の泡が2つ浮かぶ
// 演出: 左の泡=江戸の桟敷 (弁当と提灯) / 右の泡=ナポリのボックス席 (燭台とおしゃべり)
// 動き: 泡が順にポン / 互い違いにふわふわ / 泡の中の客も小さく動く
const Sg212: React.FC<{ f: number }> = ({ f }) => {
  const b1 = pop(seg(f, 4, 14));
  const b2 = pop(seg(f, 12, 22));
  const fl1 = Math.sin(f / 12) * 8;
  const fl2 = Math.sin(f / 12 + Math.PI) * 8;
  return (
    <Frame f={f} seed={1340} bg="#6E7886">
      <rect width={W} height={H} fill="#6E7886" />
      <rect x={0} y={0} width={W} height={400} fill="#5F6978" />
      {/* 窓の外の夕暮れ (左奥) */}
      <rect x={90} y={120} width={280} height={360} rx={10} fill={C.duskLow} stroke={C.ink} strokeWidth={8} opacity={0.9} />
      <circle cx={180} cy={240} r={36} fill={KRP.yellow} opacity={0.85} />
      <path d="M 90 400 L 210 330 L 370 410 L 370 480 L 90 480 Z" fill="#6A4A3A" opacity={0.7} />
      <line x1={230} y1={120} x2={230} y2={480} stroke={C.ink} strokeWidth={6} />
      {/* フロアランプ (右) */}
      <g transform="translate(1760 560)">
        <circle cy={-130} r={190} fill={C.lanternGlow} opacity={0.14} />
        <rect x={-8} y={-80} width={16} height={340} fill={C.ink} opacity={0.85} />
        <path d="M -90 -80 L 90 -80 L 56 -200 L -56 -200 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={7} opacity={0.95} />
        <ellipse cx={0} cy={262} rx={90} ry={20} fill={C.ink} opacity={0.6} />
      </g>
      {/* ソファと後頭部 (下中央) */}
      <rect x={430} y={900} width={1060} height={180} rx={30} fill={C.sofaBlue} stroke={C.ink} strokeWidth={8} />
      <rect x={430} y={860} width={200} height={140} rx={28} fill={C.sofaBlue} stroke={C.ink} strokeWidth={8} />
      <rect x={1290} y={860} width={200} height={140} rx={28} fill={C.sofaBlue} stroke={C.ink} strokeWidth={8} />
      <line x1={700} y1={920} x2={700} y2={1080} stroke={C.ink} strokeWidth={5} opacity={0.4} />
      <line x1={1220} y1={920} x2={1220} y2={1080} stroke={C.ink} strokeWidth={5} opacity={0.4} />
      <g transform={`translate(960 ${932 + Math.sin(f / 14) * 3})`}>
        <circle r={86} fill="#55483C" stroke={C.ink} strokeWidth={8} />
        <path d="M -86 -6 Q -40 -96 40 -74 Q 80 -60 86 -4" fill="#463B30" stroke={C.ink} strokeWidth={5} />
        <path d="M -60 40 Q 0 70 60 40 L 70 86 L -70 86 Z" fill="#8A7A64" stroke={C.ink} strokeWidth={6} />
      </g>
      {/* 回想トレイル (小泡) */}
      <circle cx={760} cy={810} r={16 + b1 * 6} fill={KRP.white} opacity={0.7 * b1} />
      <circle cx={660} cy={720} r={26 + b1 * 8} fill={KRP.white} opacity={0.8 * b1} />
      <circle cx={1160} cy={800} r={16 + b2 * 6} fill={KRP.white} opacity={0.7 * b2} />
      <circle cx={1260} cy={710} r={26 + b2 * 8} fill={KRP.white} opacity={0.8 * b2} />
      {/* 左の泡: 江戸の桟敷 */}
      <g transform={`translate(540 ${400 + fl1}) scale(${lerp(0.4, 1, b1)})`} opacity={b1}>
        <ellipse rx={360} ry={270} fill={KRP.white} stroke={C.ink} strokeWidth={9} />
        <clipPath id="sg212edo"><ellipse rx={338} ry={248} /></clipPath>
        <g clipPath="url(#sg212edo)">
          <rect x={-340} y={-250} width={680} height={500} fill="#F6E8C2" />
          {/* 桟敷の仕切りと手すり */}
          <rect x={-340} y={60} width={680} height={190} fill={C.tatami} />
          <line x1={-340} y1={60} x2={340} y2={60} stroke={C.ink} strokeWidth={7} />
          <line x1={-110} y1={60} x2={-110} y2={250} stroke={SGP.woodDark} strokeWidth={10} />
          <line x1={130} y1={60} x2={130} y2={250} stroke={SGP.woodDark} strokeWidth={10} />
          <Chochin x={-220} y={-250} s={0.65} f={f} ph={1} />
          <Chochin x={240} y={-250} s={0.65} f={f} ph={3} />
          {/* 客 (PersonMini) と弁当 */}
          <PersonMini x={-200} y={240} s={0.9} color="#B06A4A" f={f} phase={1} face="smile" arms="down" />
          <PersonMini x={0} y={250} s={0.95} color={SGP.aoshizuka} f={f} phase={2} face="smile" arms="up" />
          <PersonMini x={210} y={244} s={0.9} color="#7A8A4A" f={f} phase={3} face="smile" arms="down" />
          <rect x={-80} y={188} width={70} height={34} rx={6} fill={C.ink} />
          <rect x={-74} y={194} width={58} height={22} rx={4} fill={KRP.white} />
          <circle cx={-58} cy={205} r={6} fill={KRP.red} />
          <circle cx={-40} cy={205} r={6} fill={KRP.yellow} />
        </g>
        <ellipse rx={360} ry={270} fill="none" stroke={C.ink} strokeWidth={9} />
      </g>
      {/* 右の泡: ナポリのボックス席 */}
      <g transform={`translate(1390 ${410 + fl2}) scale(${lerp(0.4, 1, b2)})`} opacity={b2}>
        <ellipse rx={350} ry={265} fill={KRP.white} stroke={C.ink} strokeWidth={9} />
        <clipPath id="sg212nap"><ellipse rx={328} ry={243} /></clipPath>
        <g clipPath="url(#sg212nap)">
          <rect x={-330} y={-245} width={660} height={490} fill="#EFDFC8" />
          {/* 2段のボックス */}
          {[-1, 0].map((row) =>
            [-1, 0, 1].map((col) => (
              <g key={`${row}${col}`} transform={`translate(${col * 212} ${row * 220 + 120})`}>
                <rect x={-96} y={-96} width={192} height={176} rx={14} fill="#D9B98A" stroke={C.ink} strokeWidth={7} />
                <rect x={-96} y={48} width={192} height={32} fill={C.gilt} stroke={C.ink} strokeWidth={5} />
                <PersonMini x={-34} y={62} s={0.62} color={C.coatPlum} f={f} phase={row * 3 + col} face="smile" arms="down" />
                <PersonMini x={36} y={62} s={0.62} color="#4A6A8A" f={f} phase={row * 3 + col + 1} face="smile" arms={col === 0 ? "up" : "down"} />
              </g>
            ))
          )}
          {/* 燭台シャンデリア */}
          <g transform="translate(0 -220)">
            <circle r={40} fill={C.lanternGlow} opacity={0.5 + Math.sin(f / 5) * 0.15} />
            <path d="M -60 10 Q 0 44 60 10" fill="none" stroke={C.gilt} strokeWidth={10} />
            {[-60, 0, 60].map((dx, i) => (
              <g key={i} transform={`translate(${dx} ${i === 1 ? 26 : 10})`}>
                <rect x={-5} y={-26} width={10} height={26} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
                <circle cy={-34} r={8 + Math.sin(f / 4 + i) * 2} fill={KRP.orange} />
              </g>
            ))}
          </g>
        </g>
        <ellipse rx={350} ry={265} fill="none" stroke={C.ink} strokeWidth={9} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #213 騒がしい18世紀のお客は、音楽を聴いていなかったのでしょうか。
// 格: 並 / seed 1341
// 絵: 18世紀の客席。おしゃべりしながらも、扇が拍子を取り、足先がリズムを刻んでいる細部
// どこ: 18世紀のボックス席の中。縞の金壁紙とビロードの手すり。左下に舞台の気配
// 演出: おしゃべりする2人。だが手前の扇は拍子を取り 下の靴の爪先も同じテンポで刻む
// 動き: 扇が±14°で振れる / 靴のかかとが同じ周期で上下 / 蝋燭が揺れる / 吹き出しがポン
const Sg213: React.FC<{ f: number }> = ({ f }) => {
  const beat = Math.sin(f / 5);               // 拍子 (扇と足で共有 = 聴いている証拠)
  const bub1 = pop(seg(f, 6, 14));
  const bub2 = pop(seg(f, 14, 22));
  return (
    <Frame f={f} seed={1341} bg="#E8D5A8">
      {/* 縞の金壁紙 */}
      <rect width={W} height={H} fill="#E8D5A8" />
      {[...Array(13)].map((_, i) => (
        <rect key={i} x={i * 150 - 20} y={0} width={74} height={H} fill="#D9BE84" opacity={0.7} />
      ))}
      <rect x={0} y={0} width={W} height={70} fill={C.gilt} stroke={C.ink} strokeWidth={6} />
      {/* 左下: 舞台の気配 (奥のオーケストラ) */}
      <g>
        <path d="M 0 520 L 430 620 L 430 1080 L 0 1080 Z" fill="#B99A5E" stroke={C.ink} strokeWidth={7} />
        <path d="M 0 520 L 430 620 L 430 660 L 0 564 Z" fill={C.gilt} stroke={C.ink} strokeWidth={5} />
        <circle cx={200} cy={830} r={150} fill={C.lanternGlow} opacity={0.25 + Math.sin(f / 6) * 0.08} />
        <PersonMini x={120} y={940} s={0.72} color={C.ink} f={f} phase={0} face="none" arms="up" />
        <PersonMini x={240} y={960} s={0.72} color={C.ink} f={f} phase={2} face="none" arms="up" />
        <path d={`M 150 760 q 14 ${-18 + beat * 6} 34 -10 M 250 780 q 14 ${-16 - beat * 6} 32 -8`}
          fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      </g>
      {/* 蝋燭の壁灯 (右上) */}
      <g transform="translate(1710 240)">
        <circle r={110} fill={C.lanternGlow} opacity={0.3 + Math.sin(f / 4) * 0.1} />
        <path d="M -40 60 Q 0 90 40 60" fill="none" stroke={C.gilt} strokeWidth={10} />
        <rect x={-8} y={0} width={16} height={56} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <ellipse cy={-16} rx={10 + Math.sin(f / 4) * 2} ry={20 + Math.sin(f / 3) * 3} fill={KRP.orange} stroke={C.ink} strokeWidth={3} />
      </g>
      {/* おしゃべりする2人 (かつら・談笑) */}
      <g transform="translate(0 40)">
        <Person x={760} y={760} s={1.08} cloth={C.coatPlum} clothDark="#5E4260" hair="none"
          face="joy" gaze={[1, 0]} f={f} phase={1} pose="stand" />
        <Person x={1210} y={760} s={1.04} cloth="#4A6A8A" clothDark="#35506A" hair="none"
          face="joy" gaze={[-1, 0]} f={f} phase={3} pose="raise" />
        {/* 白いかつら (頭上に重ねる。頭頂 ≈ y −268*s) */}
        <g transform={`translate(760 ${760 - 268 * 1.08 + Math.sin((f + 1 * 7) / 9) * 3})`}>
          <path d="M -64 26 Q -74 -52 0 -56 Q 74 -52 64 26 Q 40 10 0 12 Q -40 10 -64 26 Z"
            fill={C.wigWhite} stroke={C.ink} strokeWidth={6} />
          <circle cx={-58} cy={30} r={16} fill={C.wigWhite} stroke={C.ink} strokeWidth={5} />
          <circle cx={58} cy={30} r={16} fill={C.wigWhite} stroke={C.ink} strokeWidth={5} />
        </g>
        <g transform={`translate(1210 ${760 - 268 * 1.04 + Math.sin((f + 3 * 7) / 9) * 3})`}>
          <path d="M -62 24 Q -72 -50 0 -54 Q 72 -50 62 24 Q 38 8 0 10 Q -38 8 -62 24 Z"
            fill={C.wigWhite} stroke={C.ink} strokeWidth={6} />
          <circle cx={-56} cy={28} r={15} fill={C.wigWhite} stroke={C.ink} strokeWidth={5} />
          <circle cx={56} cy={28} r={15} fill={C.wigWhite} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 談笑の吹き出し (音符や文字は描かない。もにゃもにゃ線) */}
        <g transform={`translate(620 310) scale(${bub1})`} opacity={bub1}>
          <ellipse rx={92} ry={56} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <path d="M 30 48 L 56 86 L 66 44 Z" fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <path d="M -56 -8 q 18 -16 36 0 q 18 16 36 0 M -48 18 q 16 -14 32 0 q 16 14 32 0" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
        <g transform={`translate(1392 290) scale(${bub2})`} opacity={bub2}>
          <ellipse rx={84} ry={52} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <path d="M -30 44 L -56 82 L -64 40 Z" fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <path d="M -48 -6 q 16 -14 32 0 q 16 14 32 0 M -40 18 q 14 -12 28 0 q 14 12 28 0" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
      </g>
      {/* ビロードの手すり (人物の脚を隠す) */}
      <rect x={0} y={900} width={W} height={180} fill={C.velvet} stroke={C.ink} strokeWidth={8} />
      <rect x={0} y={880} width={W} height={44} rx={20} fill={C.gilt} stroke={C.ink} strokeWidth={6} />
      {[...Array(9)].map((_, i) => (
        <path key={i} d={`M ${i * 230 + 60} 940 q 24 46 0 110`} fill="none" stroke="#5E2230" strokeWidth={6} opacity={0.6} />
      ))}
      {/* 手前の大きな扇: 拍子を取る (主役の細部) */}
      <g transform={`translate(430 820) rotate(${beat * 14})`}>
        <g>
          {[...Array(7)].map((_, i) => {
            const a = -62 + i * 20;
            return (
              <g key={i} transform={`rotate(${a})`}>
                <path d="M 0 0 L -26 -268 Q 0 -288 26 -268 Z"
                  fill={i % 2 ? "#F2D8A8" : KRP.white} stroke={C.ink} strokeWidth={5} />
              </g>
            );
          })}
          <circle r={22} fill={C.gilt} stroke={C.ink} strokeWidth={6} />
          <path d="M -150 -212 Q 0 -266 150 -212" fill="none" stroke={KRP.red} strokeWidth={7} opacity={0.8} />
        </g>
        {/* 扇を持つ手 */}
        <ellipse cx={0} cy={34} rx={44} ry={34} fill="#F0C8A0" stroke={C.ink} strokeWidth={6} />
        <path d="M -30 20 q 14 -14 30 -8 M -16 40 q 16 -10 34 -4" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      </g>
      {/* 拍子の弧線 (扇の軌跡) */}
      <path d="M 240 600 A 240 240 0 0 1 620 600" fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="4 16" opacity={0.5} />
      {/* 下端: 手すりの下から覗く靴の爪先が同じテンポで刻む */}
      <g transform="translate(1540 1020)">
        <g transform={`rotate(${Math.max(0, beat) * -14} 96 46)`}>
          <path d="M -40 10 Q 10 -22 76 -8 L 108 8 Q 124 22 108 40 L -40 46 Z"
            fill="#2E2520" stroke={C.ink} strokeWidth={6} />
          <rect x={30} y={-16} width={34} height={18} rx={6} fill={C.gilt} stroke={C.ink} strokeWidth={4} />
        </g>
        <line x1={-80} y1={52} x2={180} y2={52} stroke={C.ink} strokeWidth={5} opacity={0.4} />
        {/* トントンの小波紋 */}
        <path d={`M 120 58 q 16 ${6 + Math.max(0, -beat) * 8} 40 0`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5 + Math.max(0, -beat) * 0.3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #214 研究者は、こう釘を刺しています。聴いていなかったのではない、聴き方が違っただけだ、と。
// 格: 並 / seed 1342
// 絵: 研究書の机。「聴き方が違っただけ」の一文に定規で線が引かれる
// どこ: 夜の研究机を真上から。ランプの光だまりの中に開いた研究書
// 演出: もにゃもにゃの本文の中で「聴き方が違っただけ」の一文だけ読める。定規と赤鉛筆で下線が伸びる
// 動き: 下線がすーっと伸びる / 赤鉛筆が先端を追う / 湯気とランプ光が揺れる / カメラがわずかに寄る
const Sg214: React.FC<{ f: number }> = ({ f }) => {
  const lu = easeOut(seg(f, 12, 36));   // 下線の伸び
  const z = 1 + seg(f, 0, 42) * 0.04;
  const lineX0 = 1040, lineY = 560;
  const lineW = 410 * lu;
  return (
    <Frame f={f} seed={1342} dark bg="#2A2420">
      <g transform={zoomAt(z, 1100, 560)}>
        {/* 暗い机とランプの光だまり */}
        <rect width={W} height={H} fill="#2A2420" />
        <circle cx={960} cy={540} r={760} fill="#8A6E42" opacity={0.35 + Math.sin(f / 9) * 0.03} />
        <circle cx={960} cy={540} r={560} fill="#C9A86A" opacity={0.3 + Math.sin(f / 9) * 0.04} />
        {/* ランプの傘 (上から) */}
        <g transform="translate(300 150)">
          <circle r={150} fill={KRP.yellow} opacity={0.5} />
          <circle r={110} fill={C.lanternGlow} stroke={C.ink} strokeWidth={8} />
          <circle r={34} fill={KRP.white} opacity={0.9} />
        </g>
        {/* 本の山 (左下) */}
        <g transform="translate(260 840) rotate(-8)">
          <rect x={-170} y={-50} width={340} height={100} rx={8} fill="#6E4A3A" stroke={C.ink} strokeWidth={7} />
          <rect x={-150} y={-90} width={300} height={56} rx={8} fill={SGP.aoshizuka} stroke={C.ink} strokeWidth={7} transform="rotate(3)" />
          <line x1={-150} y1={-20} x2={150} y2={-20} stroke={KRP.white} strokeWidth={4} opacity={0.5} />
        </g>
        {/* メガネとコーヒー (右上) */}
        <g transform="translate(1690 230) rotate(14)">
          <circle cx={-52} r={44} fill="none" stroke={C.ink} strokeWidth={7} />
          <circle cx={52} r={44} fill="none" stroke={C.ink} strokeWidth={7} />
          <path d="M -10 0 L 10 0" stroke={C.ink} strokeWidth={7} />
          <circle cx={-52} r={36} fill={KRP.blueSoft} opacity={0.4} />
          <circle cx={52} r={36} fill={KRP.blueSoft} opacity={0.4} />
        </g>
        <g transform="translate(1700 450)">
          <circle r={64} fill="#4E3A2E" stroke={C.ink} strokeWidth={7} />
          <circle r={46} fill="#2E201A" />
          <ellipse cx={-14} cy={-10} rx={16} ry={8} fill={KRP.white} opacity={0.25} />
          <path d={`M -10 -70 q ${Math.sin(f / 7) * 10} -26 0 -50`} fill="none" stroke={KRP.gray} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        </g>
        {/* 開いた研究書 (見開き) */}
        <g transform="translate(960 560) rotate(-1.5)">
          <path d="M -520 -300 Q -510 -320 -490 -318 L -10 -296 L -10 304 L -500 322 Q -522 320 -520 300 Z"
            fill={C.page} stroke={C.ink} strokeWidth={8} />
          <path d="M 520 -300 Q 510 -320 490 -318 L 10 -296 L 10 304 L 500 322 Q 522 320 520 300 Z"
            fill={C.page} stroke={C.ink} strokeWidth={8} />
          <path d="M -10 -296 Q 0 -306 10 -296 L 10 304 Q 0 316 -10 304 Z" fill="#E4D8BC" stroke={C.ink} strokeWidth={5} />
          {/* 左ページ: もにゃもにゃ本文 */}
          {[...Array(8)].map((_, i) => (
            <path key={i}
              d={`M -460 ${-230 + i * 68} q 40 ${-8 + rnd(7, i) * 16} 90 0 q 50 ${8 - rnd(8, i) * 16} 100 0 q 50 ${-6 + rnd(9, i) * 12} 110 0 q 40 ${6 - rnd(10, i) * 12} 90 0`}
              fill="none" stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          ))}
          {/* 右ページ: 上下はもにゃもにゃ 中央だけ読める */}
          {[0, 1, 2].map((i) => (
            <path key={i}
              d={`M 70 ${-230 + i * 68} q 40 ${-8 + rnd(11, i) * 16} 90 0 q 50 ${8 - rnd(12, i) * 16} 100 0 q 50 ${-6 + rnd(13, i) * 12} 110 0 q 40 ${6 - rnd(14, i) * 12} 80 0`}
              fill="none" stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <path key={i}
              d={`M 70 ${100 + i * 56} q 40 ${-8 + rnd(15, i) * 14} 90 0 q 50 ${8 - rnd(16, i) * 14} 100 0 q 50 ${-6 + rnd(17, i) * 12} 110 0 q 40 ${6 - rnd(18, i) * 12} 80 0`}
              fill="none" stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          ))}
          {/* 読める一文 (机の真上なので回転は本と共有) */}
          <text x={280} y={14} textAnchor="middle" fontSize={44} fontWeight={800} fill={C.ink} fontFamily={FONT}>聴き方が違っただけ</text>
        </g>
        {/* 定規 (一文の下に当てる) */}
        <g transform={`translate(${lineX0 + 200} ${lineY + 52}) rotate(-1.5)`}>
          <rect x={-290} y={0} width={580} height={54} rx={6} fill="#E9D9A0" opacity={0.92} stroke={C.ink} strokeWidth={6} />
          {[...Array(13)].map((_, i) => (
            <line key={i} x1={-260 + i * 44} y1={0} x2={-260 + i * 44} y2={i % 2 ? 12 : 20} stroke={C.ink} strokeWidth={3} opacity={0.6} />
          ))}
        </g>
        {/* 伸びる赤い下線 + 赤鉛筆 */}
        <g transform="rotate(-1.5 960 560)">
          <line x1={lineX0} y1={lineY + 44} x2={lineX0 + lineW} y2={lineY + 44}
            stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
          <g transform={`translate(${lineX0 + lineW} ${lineY + 44}) rotate(38)`}>
            <rect x={-10} y={-260} width={20} height={230} rx={4} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
            <path d="M -10 -30 L 0 10 L 10 -30 Z" fill="#F0C8A0" stroke={C.ink} strokeWidth={4} />
            <path d="M -3 -8 L 0 10 L 3 -8 Z" fill={C.ink} />
          </g>
        </g>
        {/* 付箋 */}
        <rect x={1430} y={760} width={120} height={120} fill={KRP.yellow} opacity={0.9} stroke={C.ink} strokeWidth={5} transform="rotate(8 1490 820)" />
        <path d="M 1456 800 q 30 -8 68 0 M 1456 834 q 30 -8 68 0" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} transform="rotate(8 1490 820)" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #215 なら、こうも言えるはずです。
// 格: 図 / seed 1343
// 絵: 等式の札。「18世紀のおしゃべり=聴き方のひとつ」の下に「倍速・スキップ=?」が並ぶ。?が揺れる
// どこ: 漆喰壁の掲示場。上の梁から縄で札が吊られている。下の棚に燭台とスマホ
// 演出: 上段「18世紀のおしゃべり = 聴き方のひとつ」/ 下段「倍速・スキップ = ?」。?が振り子で揺れる
// 動き: 札が順にポン / ?がぶらぶら / 2つの=を点線が結ぶ / 蝋燭の炎とスマホの光が明滅
const Sg215: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 2, 10));
  const t2 = pop(seg(f, 8, 16));
  const t3 = pop(seg(f, 16, 24));
  const t4 = pop(seg(f, 22, 30));
  const qswing = Math.sin(f / 7) * 7;
  const link = seg(f, 28, 40);
  const eq = (x: number, y: number, t: number) => (
    <g transform={`translate(${x} ${y}) scale(${pop(t)})`} opacity={pop(t)}>
      <rect x={-44} y={-30} width={88} height={20} rx={6} fill={C.ink} />
      <rect x={-44} y={10} width={88} height={20} rx={6} fill={C.ink} />
    </g>
  );
  return (
    <Frame f={f} seed={1343} bg={C.plaster}>
      <rect width={W} height={H} fill={C.plaster} />
      {/* 漆喰のムラ */}
      {[...Array(7)].map((_, i) => (
        <ellipse key={i} cx={150 + rnd(21, i) * 1650} cy={120 + rnd(22, i) * 760}
          rx={90 + rnd(23, i) * 80} ry={26} fill="#E2D6B8" opacity={0.5} />
      ))}
      {/* 上の梁と柱 */}
      <rect x={0} y={60} width={W} height={70} fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
      <rect x={30} y={60} width={64} height={1020} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
      <rect x={1826} y={60} width={64} height={1020} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
      {[...Array(5)].map((_, i) => (
        <line key={i} x1={44} y1={200 + i * 180} x2={80} y2={206 + i * 180} stroke={SGP.woodDark} strokeWidth={4} opacity={0.6} />
      ))}
      {/* 吊り縄 */}
      <line x1={560} y1={130} x2={560} y2={282} stroke="#8A7050" strokeWidth={7} />
      <line x1={1430} y1={130} x2={1430} y2={282} stroke="#8A7050" strokeWidth={7} />
      <line x1={985} y1={130} x2={985} y2={296} stroke="#8A7050" strokeWidth={5} opacity={0.7} />
      {/* 上段の等式 */}
      <TagPlate x={560} y={330} text="18世紀のおしゃべり" size={44} t={t1} fill={KRP.white} />
      {eq(985, 330 - 20, t2)}
      <TagPlate x={1430} y={330} text="聴き方のひとつ" size={44} t={t2} fill={KRP.blueSoft} />
      {/* 下段の等式 */}
      <line x1={560} y1={450} x2={560} y2={592} stroke="#8A7050" strokeWidth={7} />
      <line x1={985} y1={450} x2={985} y2={606} stroke="#8A7050" strokeWidth={5} opacity={0.7} />
      <TagPlate x={560} y={640} text="倍速・スキップ" size={44} t={t3} fill={KRP.white} />
      {eq(985, 640 - 20, t4)}
      {/* ? は振り子 (縄の支点 1430,450 からぶら下がる) */}
      <g transform={`rotate(${qswing} 1430 450)`} opacity={pop(t4)}>
        <line x1={1430} y1={450} x2={1430} y2={560} stroke="#8A7050" strokeWidth={7} />
        <QMark f={f} x={1430} y={620} s={1.25} t={t4} color={KRP.orange} />
      </g>
      {/* 2つの=を結ぶ点線 (類推の線) */}
      <path d="M 985 400 Q 920 475 985 550" fill="none" stroke={KRP.blueDeep} strokeWidth={6}
        strokeDasharray="16 14" strokeDashoffset={-(link * 60)} opacity={link * 0.9} />
      <path d="M 975 530 L 985 556 L 1000 532 Z" fill={KRP.blueDeep} opacity={link} />
      {/* 下の棚: 蝋燭 (18世紀) とスマホ (現代) が並ぶ */}
      <rect x={94} y={860} width={1732} height={34} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
      <path d="M 220 894 L 260 980 M 1700 894 L 1660 980" stroke={SGP.woodDark} strokeWidth={10} />
      <g transform="translate(600 860)">
        <path d="M -60 0 L 60 0 L 40 -22 L -40 -22 Z" fill={C.gilt} stroke={C.ink} strokeWidth={6} />
        <rect x={-14} y={-110} width={28} height={88} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <ellipse cy={-128} rx={9 + Math.sin(f / 4) * 2} ry={18 + Math.sin(f / 3) * 3} fill={KRP.orange} stroke={C.ink} strokeWidth={3} />
        <circle cy={-128} r={40} fill={C.lanternGlow} opacity={0.3 + Math.sin(f / 4) * 0.1} />
      </g>
      <g transform="translate(1330 860)">
        <path d="M -44 0 L 44 0 L 30 -18 L -30 -18 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={-156} width={80} height={140} rx={12} fill={C.phoneBody} stroke={C.ink} strokeWidth={6} />
        <rect x={-30} y={-146} width={60} height={120} rx={6} fill={KRP.blueSoft} opacity={0.65 + Math.sin(f / 6) * 0.2} />
        <circle cy={-86} r={56} fill={KRP.blueSoft} opacity={0.18 + Math.sin(f / 6) * 0.08} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #216 飛ばして観る人は、観ていないのではない。観方が、変わっただけかもしれません。
// 格: 山 / seed 1344
// 絵: 章結び。左右分割はそのまま (左=江戸の桟敷・暖 / 右=いまのソファ・寒 / 中央に金の鏡柱)。
//   修正3: 人物をメインキャラクター (Person) に。同じ大きさ・同じ笑顔・同じ「手元に持つ」姿勢・同じ揺れで対等に
//   左=着物に髷で弁当を広げる / 右=パーカーで倍速リモコン。どちらも中央 (舞台/テレビ) の方を楽しそうに見る
// 動き: 2人が同位相でゆっくり揺れる / 鏡の光が流れる / 提灯とテレビの光が明滅 / 湯気とリモコンの光
const Sg216: React.FC<{ f: number }> = ({ f }) => {
  const glint = (f * 10) % 1400 - 200;
  const tv = 0.75 + Math.sin(f / 6) * 0.15;
  const PS = 1.25;   // 2人とも同じ大きさ
  const FOOT = 800;  // 2人とも同じ足元 (腰から下は手すり/座面で隠す)
  return (
    <Frame f={f} seed={1344}>
      {/* ===== 左: 江戸の桟敷 (暖) ===== */}
      <rect x={0} y={0} width={960} height={H} fill={C.warmWall} />
      {/* 板壁の目 */}
      {[...Array(6)].map((_, i) => (
        <line key={i} x1={i * 160 + 40} y1={0} x2={i * 160 + 40} y2={700} stroke="#E2CC96" strokeWidth={5} opacity={0.8} />
      ))}
      {/* 上の梁と 舞台からの明かり (右=鏡の側から差す) */}
      <rect x={0} y={60} width={960} height={40} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
      <path d="M 908 100 L 560 712 L 908 712 Z" fill={C.lanternGlow} opacity={0.3 + Math.sin(f / 9) * 0.06} />
      {/* 障子 */}
      <rect x={60} y={150} width={300} height={470} fill="#F8F0D8" stroke={C.ink} strokeWidth={7} />
      <line x1={210} y1={150} x2={210} y2={620} stroke={C.ink} strokeWidth={5} opacity={0.6} />
      {[307, 463].map((yy) => (
        <line key={yy} x1={60} y1={yy} x2={360} y2={yy} stroke={C.ink} strokeWidth={5} opacity={0.6} />
      ))}
      <Chochin x={700} y={100} s={0.9} f={f} ph={2} />
      {/* 江戸の客 (Person + 着物 + 髷)。弁当を手に 舞台の方を見てにっこり */}
      <Kasane x={470} y={FOOT} s={PS} f={f} phase={0}
        back={<KimonoBack cloth="#8A5A3C" dark="#6E4028" />}
        front={
          <g>
            <KimonoFront obi="#3E4B66" mage />
            {/* 手に持った弁当 (重箱の一段。ふたは脇に) */}
            <g transform="translate(0 -116)">
              <rect x={-66} y={-22} width={132} height={40} rx={6} fill={C.ink} />
              <rect x={-58} y={-16} width={116} height={28} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              <line x1={-20} y1={-16} x2={-20} y2={12} stroke={C.ink} strokeWidth={3} />
              <line x1={20} y1={-16} x2={20} y2={12} stroke={C.ink} strokeWidth={3} />
              <circle cx={-40} cy={-2} r={10} fill={KRP.red} stroke={C.ink} strokeWidth={2.5} />
              <circle cx={0} cy={-2} r={10} fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} />
              <rect x={30} y={-11} width={20} height={18} fill={KRP.green} stroke={C.ink} strokeWidth={2.5} />
              {/* 箸 (あごより下・顔にかからない) */}
              <line x1={30} y1={-6} x2={62} y2={-40} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
              <line x1={38} y1={-4} x2={70} y2={-36} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
            </g>
          </g>
        }>
        <Person x={0} y={0} s={1} f={f} phase={0} still cloth="#8A5A3C" clothDark="#6E4028"
          face="smile" gaze={[3, 1]} pose="hold" />
      </Kasane>
      {/* 桟敷の手すり: 緋毛氈を掛けた木の手すり (腰から下を隠す) */}
      <rect x={-20} y={712} width={940} height={30} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
      <path d="M -20 738 L 920 738 L 920 800 Q 900 790 880 800 Q 860 790 840 800 L -20 800 Z"
        fill={KRP.red} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -20 752 L 920 752" stroke="#A8302A" strokeWidth={4} opacity={0.7} />
      <rect x={-20} y={800} width={940} height={300} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
      {[...Array(9)].map((_, i) => (
        <line key={i} x1={40 + i * 104} y1={800} x2={40 + i * 104} y2={1080} stroke={C.ink} strokeWidth={4} opacity={0.4} />
      ))}
      {/* 手すりの上: 湯呑みと 弁当の包み (風呂敷) */}
      <g transform="translate(250 712)">
        <path d="M -22 -40 L 22 -40 L 17 0 L -17 0 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={-20} y={-30} width={40} height={8} fill={KRP.blueDeep} opacity={0.6} />
        <path d={`M -4 -54 q ${Math.sin(f / 7) * 6} -18 0 -34`} fill="none" stroke={KRP.grayDark} strokeWidth={4} opacity={0.55} />
      </g>
      <g transform="translate(700 712)">
        <path d="M -60 0 Q -64 -40 -30 -48 L 30 -48 Q 64 -40 60 0 Z" fill="#6E8C5A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -20 -48 Q -30 -74 -6 -70 Q 0 -56 6 -70 Q 30 -74 20 -48" fill="#6E8C5A" stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -40 -24 q 10 -6 20 0 M 10 -30 q 10 -6 20 0" fill="none" stroke={C.page} strokeWidth={3.5} opacity={0.7} />
      </g>

      {/* ===== 右: いまのソファ (寒) ===== */}
      <rect x={960} y={0} width={960} height={H} fill={C.coolWall} />
      <rect x={960} y={760} width={960} height={320} fill="#B9A98E" stroke={C.ink} strokeWidth={7} />
      <ellipse cx={1450} cy={900} rx={360} ry={80} fill="#8FA3B8" opacity={0.6} />
      {/* 窓の夜景 */}
      <rect x={1560} y={120} width={300} height={400} fill={C.nightDeep} stroke={C.ink} strokeWidth={7} />
      {[...Array(8)].map((_, i) => (
        <rect key={i} x={1590 + (i % 3) * 86} y={190 + Math.floor(i / 3) * 110} width={26} height={36}
          fill={KRP.yellow} opacity={0.25 + rnd(31, i) * 0.5} />
      ))}
      <line x1={1710} y1={120} x2={1710} y2={520} stroke={C.ink} strokeWidth={5} opacity={0.6} />
      <circle cx={1640} cy={170} r={18} fill={KRP.cream} opacity={0.85} />
      {/* テレビ (斜め3/4見付け) */}
      <g transform="translate(1110 440)">
        <path d="M -60 -220 L 110 -180 L 110 200 L -60 240 Z" fill={C.phoneBody} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M -44 -196 L 94 -162 L 94 182 L -44 216 Z" fill={KRP.blueSoft} opacity={tv} />
        <path d="M -44 -120 L 94 -100 L 94 -60 L -44 -84 Z" fill={KRP.white} opacity={0.35} />
        <path d="M 110 -180 L 134 -168 L 134 190 L 110 200 Z" fill="#23272F" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 10 240 L 36 236 L 44 320 L 2 322 Z" fill={C.ink} opacity={0.85} />
        <ellipse cx={24} cy={326} rx={70} ry={14} fill={C.ink} opacity={0.7} />
      </g>
      <path d="M 1250 300 L 1520 520 L 1520 760 L 1250 640 Z" fill={KRP.blueSoft} opacity={0.12 + Math.sin(f / 6) * 0.05} />
      {/* ソファの背もたれと肘掛け (人物の後ろ) */}
      <rect x={1230} y={620} width={460} height={160} rx={28} fill={C.sofaBlue} stroke={C.ink} strokeWidth={8} />
      <line x1={1460} y1={640} x2={1460} y2={760} stroke={C.ink} strokeWidth={4} opacity={0.35} />
      {/* いまの客 (Person + パーカー)。倍速リモコンを手に テレビの方を見てにっこり */}
      <Kasane x={1450} y={FOOT} s={PS} f={f} phase={0}
        back={<HoodieBack cloth="#4F6B57" />}
        front={
          <g>
            <HoodieFront dark="#3B5243" />
            {/* 手に持ったリモコン: 倍速ボタンが光る */}
            <g transform="translate(0 -118)">
              <rect x={-46} y={-16} width={92} height={32} rx={10} fill={C.ink} />
              <circle cx={-26} cy={0} r={6} fill={KRP.gray} />
              <rect x={-8} y={-10} width={44} height={20} rx={6} fill={KRP.blueSoft} opacity={0.6 + Math.sin(f / 5) * 0.3} />
              <path d="M -2 -6 L 8 0 L -2 6 Z M 10 -6 L 20 0 L 10 6 Z" fill={C.ink} />
            </g>
          </g>
        }>
        <Person x={0} y={0} s={1} f={f} phase={0} still cloth="#4F6B57" clothDark="#3B5243"
          face="smile" gaze={[-3, 1]} pose="hold" />
      </Kasane>
      {/* 肘掛けと座面 (腰から下を隠す) */}
      <rect x={1192} y={680} width={90} height={160} rx={24} fill="#7D8EA6" stroke={C.ink} strokeWidth={7} />
      <rect x={1640} y={680} width={90} height={160} rx={24} fill="#7D8EA6" stroke={C.ink} strokeWidth={7} />
      <rect x={1240} y={724} width={440} height={110} rx={22} fill="#7D8EA6" stroke={C.ink} strokeWidth={7} />
      <line x1={1460} y1={736} x2={1460} y2={824} stroke={C.ink} strokeWidth={4} opacity={0.35} />
      {/* 肘掛けの上: ポップコーン (弁当の包みとの対) */}
      <g transform="translate(1686 680)">
        <path d="M -40 -64 L 40 -64 L 30 0 L -30 0 Z" fill={KRP.red} stroke={C.ink} strokeWidth={6} />
        <line x1={-14} y1={-64} x2={-10} y2={0} stroke={KRP.white} strokeWidth={9} />
        <line x1={14} y1={-64} x2={10} y2={0} stroke={KRP.white} strokeWidth={9} />
        {[...Array(4)].map((_, i) => (
          <circle key={i} cx={-30 + i * 20} cy={-74 - rnd(33, i) * 12} r={11} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>

      {/* ===== 中央: 金の鏡柱 ===== */}
      <rect x={908} y={0} width={104} height={H} fill={C.gilt} stroke={C.ink} strokeWidth={8} />
      <rect x={930} y={0} width={60} height={H} fill="#E8D9A8" stroke={C.ink} strokeWidth={4} />
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={960} cy={90 + i * 180} r={10} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
      ))}
      <clipPath id="sg216mir"><rect x={930} y={0} width={60} height={H} /></clipPath>
      <g clipPath="url(#sg216mir)">
        <rect x={900} y={glint} width={120} height={160} fill={KRP.white} opacity={0.75} transform="rotate(8 960 540)" />
        <rect x={900} y={glint + 220} width={120} height={60} fill={KRP.white} opacity={0.5} transform="rotate(8 960 540)" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #217 最後に、ひとつだけ、不思議な場所を紹介します。
// 格: 並 / seed 1345
// 絵: 夜の上野の街角。ビルの谷間にぽつんと暖色の灯り。そこへ歩いていく足元
// どこ: 夜の上野の街角。暗いビルの谷間の奥に ぽつんと暖色の灯り
// 演出: 手前は歩いていく後ろ姿の足元。路地の奥の光が呼んでいる
// 動き: 足が交互に蹴り出す / 奥の灯りが脈打つ / 窓明かりがまたたく / 月に雲
const Sg217: React.FC<{ f: number }> = ({ f }) => {
  const stepL = Math.max(0, Math.sin(f / 6));
  const stepR = Math.max(0, -Math.sin(f / 6));
  const pulse = 0.75 + Math.sin(f / 8) * 0.18;
  return (
    <Frame f={f} seed={1345} dark bg={C.nightDeep}>
      {/* 夜空 */}
      <rect width={W} height={H} fill={C.nightDeep} />
      {[...Array(14)].map((_, i) => (
        <circle key={i} cx={80 + rnd(41, i) * 1760} cy={30 + rnd(42, i) * 260}
          r={2.5 + rnd(43, i) * 2} fill={KRP.white}
          opacity={0.4 + Math.sin(f / 9 + i * 2) * 0.3} />
      ))}
      {/* 月と雲 */}
      <g transform="translate(1700 150)">
        <circle r={58} fill={KRP.yellow} opacity={0.9} />
        <circle cx={-22} cy={-10} r={50} fill={C.nightDeep} />
      </g>
      <ellipse cx={1500 + Math.sin(f / 30) * 20} cy={190} rx={180} ry={30} fill={KRP.white} opacity={0.1} />
      {/* 左右の暗いビル */}
      {[
        { x: 0, w: 560, h0: 240, win: 51 },
        { x: 1360, w: 560, h0: 200, win: 61 },
      ].map((b, bi) => (
        <g key={bi}>
          <rect x={b.x} y={b.h0} width={b.w} height={1080 - b.h0} fill={C.night} stroke={C.ink} strokeWidth={8} />
          <rect x={b.x + (bi ? 60 : 380)} y={b.h0 - 90} width={120} height={90} fill="#2A3242" stroke={C.ink} strokeWidth={6} />
          {/* 窓の格子 */}
          {[...Array(15)].map((_, i) => {
            const col = i % 3, row = Math.floor(i / 3);
            const lit = rnd(b.win, i) > 0.62;
            const flick = rnd(b.win + 1, i) > 0.85 ? (Math.sin(f / 4 + i) > 0 ? 1 : 0.2) : 1;
            return (
              <rect key={i} x={b.x + 80 + col * 150} y={b.h0 + 70 + row * 150}
                width={82} height={96} rx={4}
                fill={lit ? KRP.yellow : "#1B2230"} opacity={lit ? 0.5 * flick : 0.9}
                stroke={C.ink} strokeWidth={4} />
            );
          })}
          {/* 室外機と看板 */}
          <rect x={b.x + (bi ? 420 : 60)} y={900} width={110} height={70} rx={8} fill="#39404E" stroke={C.ink} strokeWidth={5} />
          <rect x={b.x + (bi ? 140 : 300)} y={430} width={70} height={240} rx={8} fill="#454E60" stroke={C.ink} strokeWidth={6} />
        </g>
      ))}
      {/* 電線 */}
      <path d="M 0 150 Q 500 230 960 180 Q 1430 140 1920 210" fill="none" stroke={C.ink} strokeWidth={5} opacity={0.8} />
      <path d="M 0 190 Q 500 270 960 220" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
      {/* 路地 (奥へ) */}
      <path d="M 560 1080 L 1360 1080 L 1130 460 L 820 460 Z" fill={C.roadGray} stroke={C.ink} strokeWidth={7} />
      {[...Array(5)].map((_, i) => (
        <line key={i} x1={700 + i * 130} y1={1080} x2={890 + i * 42} y2={470} stroke="#555D6C" strokeWidth={4} opacity={0.5} />
      ))}
      {/* 奥の暖色の灯り (主役) */}
      <circle cx={975} cy={520} r={190} fill={C.lanternGlow} opacity={0.22 * pulse} />
      <circle cx={975} cy={520} r={100} fill={C.lanternGlow} opacity={0.3 * pulse} />
      <rect x={905} y={460} width={140} height={120} rx={8} fill="#5A4430" stroke={C.ink} strokeWidth={6} />
      <rect x={931} y={482} width={88} height={98} rx={6} fill={C.lanternGlow} opacity={0.95 * pulse} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={942 + i * 34} cy={452 - Math.sin(f / 10 + i) * 4} r={9}
          fill={C.lanternGlow} opacity={0.8} />
      ))}
      {/* 路面の暖色の照り返しと水たまり */}
      <path d="M 920 600 L 1030 600 L 1120 1080 L 800 1080 Z" fill={C.lanternGlow} opacity={0.1 * pulse} />
      <ellipse cx={810} cy={860} rx={100} ry={26} fill="#2C3648" stroke={C.ink} strokeWidth={4} />
      <ellipse cx={810} cy={860} rx={56} ry={13} fill={C.lanternGlow} opacity={0.35 * pulse} />
      {/* 手前: 灯りへ歩いていく後ろ姿 (頭から足まで。足元が主役の大きさ) */}
      <g transform={`translate(660 1040) translate(0 ${-Math.abs(Math.sin(f / 6)) * 6})`}>
        {/* 頭とマフラー */}
        <circle cx={10} cy={-560} r={74} fill="#2E2A26" stroke={C.ink} strokeWidth={8} />
        <path d="M -56 -582 Q 8 -640 76 -580 Q 40 -606 8 -604 Q -26 -602 -56 -582 Z" fill="#201D1A" stroke={C.ink} strokeWidth={5} />
        <path d="M -62 -500 Q 10 -464 82 -500 L 78 -452 Q 10 -422 -58 -452 Z"
          fill="#9A4A3C" stroke={C.ink} strokeWidth={7} />
        <path d={`M 64 -468 q 30 ${26 + Math.sin(f / 9) * 8} 18 70 l -34 -8 q 10 -34 -4 -56 Z`}
          fill="#9A4A3C" stroke={C.ink} strokeWidth={6} />
        {/* コート (肩→裾) */}
        <path d="M -118 -460 Q 10 -520 136 -458 L 168 -180 Q 10 -130 -146 -180 Z"
          fill="#3C4454" stroke={C.ink} strokeWidth={8} />
        <path d="M 6 -470 L 10 -180" stroke={C.ink} strokeWidth={4} opacity={0.45} />
        <path d="M -80 -420 q -16 110 -24 220 M 96 -418 q 16 108 26 218" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.3} />
        {/* 腕 (片方だけ見える) */}
        <path d="M -118 -440 Q -158 -340 -142 -240 L -104 -246 Q -116 -336 -84 -420 Z"
          fill="#333A48" stroke={C.ink} strokeWidth={7} />
        {/* 左脚 (蹴り上げ) */}
        <g transform={`rotate(${stepL * -16} -50 -180)`}>
          <rect x={-90} y={-188} width={72} height={160} rx={22} fill="#2E3542" stroke={C.ink} strokeWidth={7} />
          <path d="M -96 -36 L -10 -36 L 2 0 Q 0 16 -22 14 L -92 6 Q -106 -14 -96 -36 Z"
            fill="#20242E" stroke={C.ink} strokeWidth={6} />
        </g>
        {/* 右脚 */}
        <g transform={`rotate(${stepR * -16} 80 -180)`}>
          <rect x={40} y={-184} width={72} height={160} rx={22} fill="#2E3542" stroke={C.ink} strokeWidth={7} />
          <path d="M 34 -32 L 120 -32 L 134 2 Q 132 18 110 16 L 38 8 Q 24 -12 34 -32 Z"
            fill="#20242E" stroke={C.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 吐息の白 */}
      <ellipse cx={790} cy={480} rx={26 + Math.sin(f / 8) * 6} ry={14} fill={KRP.white} opacity={0.16 + Math.sin(f / 8) * 0.05} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #218 東京、上野。寄席の、鈴本演芸場です。
// 格: 山 / seed 1346
// 絵: 鈴本演芸場の正面。提灯、寄席文字の看板、めくり。ビルの谷間に江戸の火が灯っている構図
// どこ: 宵の上野。高いビルの谷間に鈴本演芸場の正面。提灯の列と寄席文字の看板
// 演出: ビルは暗く 寄席だけが江戸の火色で灯る。開いた入口から光が路面にこぼれ 客が吸い込まれる
// 動き: 提灯が揺れて明滅 / こぼれ光が揺らぐ / ビルの窓がまたたく / 2人の客が歩み寄る
const Sg218: React.FC<{ f: number }> = ({ f }) => {
  const spill = 0.8 + Math.sin(f / 7) * 0.12;
  const walk = seg(f, 4, 40);
  return (
    <Frame f={f} seed={1346} dark bg={C.duskSky}>
      {/* 宵の空 */}
      <rect width={W} height={H} fill={C.duskSky} />
      <rect y={0} width={W} height={200} fill="#3A3450" />
      <rect y={330} width={W} height={160} fill="#6A4E58" opacity={0.6} />
      {[...Array(10)].map((_, i) => (
        <circle key={i} cx={120 + rnd(51, i) * 1680} cy={30 + rnd(52, i) * 180}
          r={2.5 + rnd(53, i) * 2} fill={KRP.white} opacity={0.35 + Math.sin(f / 9 + i * 2) * 0.25} />
      ))}
      {/* 両脇の高いビル (暗) */}
      {[
        { x: 0, w: 430, seed: 55 },
        { x: 1490, w: 430, seed: 65 },
      ].map((b, bi) => (
        <g key={bi}>
          <rect x={b.x} y={60} width={b.w} height={1020} fill={C.night} stroke={C.ink} strokeWidth={8} />
          <rect x={b.x + (bi ? 50 : 280)} y={0} width={100} height={60} fill="#2A3242" stroke={C.ink} strokeWidth={6} />
          {[...Array(18)].map((_, i) => {
            const col = i % 3, row = Math.floor(i / 3);
            const lit = rnd(b.seed, i) > 0.6;
            const flick = rnd(b.seed + 1, i) > 0.86 ? (Math.sin(f / 4 + i) > 0 ? 1 : 0.25) : 1;
            return (
              <rect key={i} x={b.x + 55 + col * 125} y={130 + row * 155}
                width={72} height={88} rx={4}
                fill={lit ? KRP.yellow : "#1B2230"} opacity={lit ? 0.45 * flick : 0.9}
                stroke={C.ink} strokeWidth={4} />
            );
          })}
        </g>
      ))}
      {/* 路面 */}
      <rect x={0} y={960} width={W} height={120} fill={C.roadGray} stroke={C.ink} strokeWidth={7} />
      <line x1={0} y1={1010} x2={W} y2={1010} stroke="#555D6C" strokeWidth={4} opacity={0.5} />
      {/* 鈴本演芸場の正面 */}
      <g>
        {/* 建物の顔 */}
        <rect x={430} y={300} width={1060} height={660} fill="#EFE2C4" stroke={C.ink} strokeWidth={9} />
        <rect x={430} y={300} width={1060} height={56} fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        {/* 縦の大看板 (黒地に黄の寄席文字) */}
        <g transform="translate(560 320)">
          <rect x={-78} y={0} width={156} height={520} rx={10} fill="#191511" stroke={C.gilt} strokeWidth={8} />
          {["鈴", "本", "演", "芸", "場"].map((ch, i) => (
            <text key={i} x={0} y={96 + i * 100} textAnchor="middle" fontSize={78} fontWeight={900}
              fill={KRP.yellow} fontFamily={FONT}>{ch}</text>
          ))}
        </g>
        {/* 赤い庇 (波型) */}
        <g>
          <rect x={680} y={430} width={700} height={60} fill={SGP.curtain} stroke={C.ink} strokeWidth={7} />
          {[...Array(10)].map((_, i) => (
            <path key={i} d={`M ${680 + i * 70} 490 a 35 26 0 0 0 70 0 Z`} fill={SGP.curtain} stroke={C.ink} strokeWidth={5} />
          ))}
        </g>
        {/* 提灯の列 */}
        {[...Array(6)].map((_, i) => (
          <Chochin key={i} x={730 + i * 120} y={520} s={0.52} f={f} ph={i * 1.3} />
        ))}
        {/* 入口 (開いていて中が暖色) */}
        <rect x={790} y={660} width={340} height={300} fill="#3A2A1C" stroke={C.ink} strokeWidth={8} />
        <rect x={806} y={676} width={308} height={284} fill={C.lanternGlow} opacity={0.9 * spill} />
        <path d="M 850 676 L 850 960 M 960 676 L 960 960 M 1070 676 L 1070 960" stroke="#B4883C" strokeWidth={5} opacity={0.7} />
        {/* 中の気配: のれんと客席へ上がる段 */}
        <rect x={806} y={676} width={308} height={60} fill={SGP.curtain} opacity={0.85} />
        <path d="M 858 736 L 858 700 M 962 736 L 962 700 M 1062 736 L 1062 700" stroke="#7A2430" strokeWidth={8} />
        <rect x={840} y={900} width={240} height={26} fill="#C9A061" stroke={C.ink} strokeWidth={4} opacity={0.9} />
        {/* めくり (白地に黒のもにゃ文字。名前は書かない) */}
        {[
          { x: 700, ph: 0 },
          { x: 1220, ph: 2 },
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.x} 700) rotate(${Math.sin(f / 13 + m.ph) * 1.2})`}>
            <rect x={-56} y={0} width={112} height={230} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
            <rect x={-56} y={0} width={112} height={230} fill="none" stroke={KRP.red} strokeWidth={10} opacity={0.85} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${-26 + k * 26} 40 q ${10 - rnd(71, i * 3 + k) * 20} 40 0 70 q ${-10 + rnd(72, i * 3 + k) * 20} 40 0 76`}
                fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
            ))}
          </g>
        ))}
        {/* 右端: 切符売り場の小窓 */}
        <g transform="translate(1420 760)">
          <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#D9C49A" stroke={C.ink} strokeWidth={6} />
          <rect x={-38} y={-56} width={76} height={70} rx={6} fill={C.lanternGlow} opacity={0.8 * spill} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={44} r={9} fill={C.ink} />
        </g>
        {/* 小さな縦のれん「寄席」 */}
        <g transform="translate(1180 540)">
          <rect x={-36} y={0} width={72} height={190} fill={SGP.aoshizuka} stroke={C.ink} strokeWidth={6} />
          <text x={0} y={70} textAnchor="middle" fontSize={44} fontWeight={900} fill={KRP.white} fontFamily={FONT}>寄</text>
          <text x={0} y={140} textAnchor="middle" fontSize={44} fontWeight={900} fill={KRP.white} fontFamily={FONT}>席</text>
        </g>
      </g>
      {/* 路面へのこぼれ光 */}
      <path d="M 790 960 L 1130 960 L 1260 1080 L 660 1080 Z" fill={C.lanternGlow} opacity={0.25 * spill} />
      <path d="M 870 960 L 1050 960 L 1110 1080 L 810 1080 Z" fill={C.lanternGlow} opacity={0.22 * spill} />
      {/* 吸い込まれる2人の客 (頭は y830 より上に出ない小ささ) */}
      <PersonMini x={640 + walk * 110} y={1052} s={1.05} color="#5A4A6A" f={f} phase={1} face="none" arms="down" />
      <PersonMini x={1300 - walk * 90} y={1060} s={1.1} color="#3E5A50" f={f} phase={3} face="none" arms="down" />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_207: (f) => <Sg207 f={f} />,
  sg_208: (f) => <Sg208 f={f} />,
  sg_209: (f) => <Sg209 f={f} />,
  sg_210: (f) => <Sg210 f={f} />,
  sg_211: (f) => <Sg211 f={f} />,
  sg_212: (f) => <Sg212 f={f} />,
  sg_213: (f) => <Sg213 f={f} />,
  sg_214: (f) => <Sg214 f={f} />,
  sg_215: (f) => <Sg215 f={f} />,
  sg_216: (f) => <Sg216 f={f} />,
  sg_217: (f) => <Sg217 f={f} />,
  sg_218: (f) => <Sg218 f={f} />,
};

export const S_B10B_MOTIFS: string[] = [
  "sg_207", // #207
  "sg_208", // #208
  "sg_209", // #209
  "sg_210", // #210
  "sg_211", // #211
  "sg_212", // #212
  "sg_213", // #213
  "sg_214", // #214
  "sg_215", // #215
  "sg_216", // #216
  "sg_217", // #217
  "sg_218", // #218
];

export const saigoB10bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
