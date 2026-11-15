// 「人類は、昔から飛ばして観ていた」: 文#87〜#98 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1122〜1133。
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
import { makeHeimen, HeimenRiku } from "./SaigoChizu";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#242C3C",        // 暗転後の客席の壁
  nightDeep: "#151B28",    // いちばん暗い奥
  nightSeat: "#3A4254",    // 暗がりの座席の背
  warmWall: "#E9CC92",     // 明るい客席の壁 (宴の時代)
  warmDeep: "#D4AC6A",     // 明るい壁の彫りの影
  boxCloth: "#B4454E",     // 桟敷の手すりの布
  boxIn: "#C9953F",        // 桟敷の中 (明るいとき)
  crownDeep: "#B8862E",    // 王冠の土台の影
  brassPipe: "#C9A35B",    // ガス管の真鍮
  ironDark: "#5A544C",     // ガス装置の鉄
  brick: "#4A423C",        // 舞台裏のレンガ壁
  mapSea: "#9FBDD3",       // 地図の海
  mapLand: "#E8DCBC",      // 地図の陸
  doorLight: "#F2DF9E",    // 戸口から差す明かり
  dressRose: "#C9718A",    // 着飾った客のドレス
  dressBlue: "#7FA3C9",
  dressGreen: "#8FBF8A",
  dressGold: "#C9A95B",
} as const;
void Stamp; void QMark; void XMark; void Arrow; void ChapterDoor;
void SaiseiBar; void NenpyoEmaki; void Fuda3; void useCurrentFrame;

// ローカル乱数 (毎フレーム同じ値。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
// 2色をまぜる (暗転の連番 #88→#89 用)
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
  const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  const q = clamp01(t);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * q)).join(",")})`;
};
// 点 (cx,cy) を基準にズーム
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx * (1 - z)} ${cy * (1 - z)}) scale(${z})`;

// ===================================================================
// このファイルだけのローカル部品
// ===================================================================

// シャンデリア (lit 0→1 で明るさが変わる)
const Chandelier: React.FC<{ x: number; y: number; s?: number; f: number; lit: number }> =
  ({ x, y, s = 1, f, lit }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={-190} x2={0} y2={-64} stroke={C.ink} strokeWidth={6} />
      {lit > 0.05 && <circle cx={0} cy={0} r={170} fill={SGP.lampGold} opacity={0.15 * lit} />}
      <path d="M -120 -10 Q 0 60 120 -10" fill="none" stroke={C.ink} strokeWidth={7} />
      <ellipse cx={0} cy={-30} rx={32} ry={44} fill={C.warmDeep} stroke={C.ink} strokeWidth={6} />
      {[-120, -62, 0, 62, 120].map((cx2, i) => {
        const yy = cx2 === 0 ? -66 : Math.abs(cx2) === 62 ? 14 : -10;
        const fl = Math.sin(f / 5 + i * 1.9) * 2;
        return (
          <g key={i} transform={`translate(${cx2} ${yy})`}>
            <rect x={-7} y={-26} width={14} height={26} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            {lit > 0.05 ? (
              <>
                <circle cx={0} cy={-40} r={16} fill={SGP.lampGold} opacity={0.4 * lit} />
                <path d={`M 0 ${-30 + fl} C -6 ${-37 + fl} -5 -44 0 -48 C 5 -44 6 ${-37 + fl} 0 ${-30 + fl} Z`}
                  fill={SGP.lampGold} stroke={C.ink} strokeWidth={3} opacity={Math.max(lit, 0.3)} />
              </>
            ) : (
              <line x1={-5} y1={-44} x2={5} y2={-32} stroke={SGP.lampOff} strokeWidth={3.5} />
            )}
          </g>
        );
      })}
    </g>
  );

// 視線の矢印 (a→b へ弧を描いて伸びる。t 0→1 で描画)
const Gaze: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  t: number; color?: string; bend?: number; w?: number;
}> = ({ x1, y1, x2, y2, t, color = KRP.orange, bend = -70, w = 7 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
  const q = (a: number, c: number, b: number, s: number) =>
    (1 - s) * (1 - s) * a + 2 * (1 - s) * s * c + s * s * b;
  const px = q(x1, mx, x2, tt), py = q(y1, my, y2, tt);
  const dx = 2 * (1 - tt) * (mx - x1) + 2 * tt * (x2 - mx);
  const dy = 2 * (1 - tt) * (my - y1) + 2 * tt * (y2 - my);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g opacity={0.92}>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={color}
        strokeWidth={w} strokeLinecap="round" pathLength={100}
        strokeDasharray={`${tt * 100} 100`} />
      <polygon points="2,0 -26,-13 -26,13" fill={color} stroke={C.ink} strokeWidth={3}
        transform={`translate(${px} ${py}) rotate(${ang})`} />
    </g>
  );
};

// 客席ホール (#88/#89 の連番用。dim 0→1 で同じ構図のまま暗転する)
// 左=舞台の額縁ごしの明かり / 右2/3=桟敷6つ (2段×3) / 下=平土間の背中 / 上=シャンデリア
const OperaHall: React.FC<{ f: number; dim: number }> = ({ f, dim }) => {
  const wall = mix(C.warmWall, C.night, dim);
  const wallD = mix(C.warmDeep, C.nightDeep, dim);
  const boxIn = mix(C.boxIn, "#10151F", dim);
  const cloth = mix(C.boxCloth, "#3A2630", dim * 0.85);
  const seat = mix("#EADFC8", C.nightSeat, dim);
  const lit = 1 - dim;
  const boxes = [
    { x: 700, y: 400 }, { x: 1180, y: 400 }, { x: 1660, y: 400 },
    { x: 700, y: 740 }, { x: 1180, y: 740 }, { x: 1660, y: 740 },
  ];
  const dress = [C.dressRose, C.dressBlue, C.dressGreen, C.dressGold];
  return (
    <g>
      {/* 壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={wall} />
      {/* 壁の彫り (横の帯) */}
      <rect x={400} y={236} width={1540} height={18} fill={wallD} />
      <rect x={400} y={574} width={1540} height={18} fill={wallD} />
      <rect x={400} y={906} width={1540} height={18} fill={wallD} />
      {/* 桟敷のあいだの柱 + 壁の燭台 */}
      {[470, 940, 1420, 1880].map((px, i) => (
        <g key={px}>
          <rect x={px - 24} y={240} width={48} height={684} fill={wallD} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${px - 24} 268 L ${px + 24} 268 M ${px - 24} 896 L ${px + 24} 896`}
            stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
          {/* 燭台 */}
          <g transform={`translate(${px} 560)`}>
            <path d="M 0 26 L 0 6 M -12 26 L 12 26" stroke={C.ink} strokeWidth={4.5} fill="none" />
            <rect x={-6} y={-16} width={12} height={22} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
            {lit > 0.05 ? (
              <>
                <circle cx={0} cy={-26} r={13} fill={SGP.lampGold} opacity={0.4 * lit} />
                <path d={`M 0 ${-20 + Math.sin(f / 5 + i) * 1.6} C -5 -26 -4 -31 0 -34 C 4 -31 5 -26 0 ${-20 + Math.sin(f / 5 + i) * 1.6} Z`}
                  fill={SGP.lampGold} stroke={C.ink} strokeWidth={2.5} opacity={Math.max(lit, 0.3)} />
              </>
            ) : (
              <line x1={-4} y1={-31} x2={4} y2={-21} stroke={SGP.lampOff} strokeWidth={3} />
            )}
          </g>
        </g>
      ))}
      {/* 桟敷6つ */}
      {boxes.map((b, bi) => (
        <g key={bi}>
          {/* 開口 (上が丸いアーチ) */}
          <path d={`M ${b.x - 180} ${b.y + 120} L ${b.x - 180} ${b.y - 90} Q ${b.x} ${b.y - 150} ${b.x + 180} ${b.y - 90} L ${b.x + 180} ${b.y + 120} Z`}
            fill={boxIn} stroke={C.ink} strokeWidth={6} />
          {/* 中の客2人 (着飾り色) */}
          <PersonMini x={b.x - 70} y={b.y + 150} s={0.8} color={dress[(bi * 2) % 4]}
            f={f} phase={bi * 2} face="smile" />
          <PersonMini x={b.x + 66} y={b.y + 150} s={0.8} color={dress[(bi * 2 + 1) % 4]}
            f={f} phase={bi * 2 + 1} face="dot" />
          {/* 扇 (右側の客が持つ。明るいうちはひらひら) */}
          <g transform={`translate(${b.x + 118} ${b.y + 10}) rotate(${-24 + Math.sin(f / 7 + bi) * 10 * lit})`}>
            <path d="M 0 22 L -26 -18 M 0 22 L -10 -24 M 0 22 L 8 -25 M 0 22 L 24 -20"
              stroke={C.ink} strokeWidth={3.5} />
            <path d="M -26 -18 Q 0 -34 24 -20 L 8 -25 L -10 -24 Z"
              fill={dress[(bi + 2) % 4]} stroke={C.ink} strokeWidth={3.5} />
          </g>
          {/* 手すり + 垂れ布 */}
          <rect x={b.x - 192} y={b.y + 92} width={384} height={30} rx={10}
            fill={wallD} stroke={C.ink} strokeWidth={5.5} />
          <path d={`M ${b.x - 178} ${b.y + 122} Q ${b.x - 120} ${b.y + 168} ${b.x - 60} ${b.y + 122} Q ${b.x} ${b.y + 168} ${b.x + 60} ${b.y + 122} Q ${b.x + 120} ${b.y + 168} ${b.x + 178} ${b.y + 122} Z`}
            fill={cloth} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 左: 舞台の額縁 (いつも明るい側) */}
      <rect x={-20} y={-20} width={330} height={H + 40} fill="#F1E3B6" />
      {/* 舞台の中: 役者ひとり */}
      <g transform={`translate(150 760) rotate(${Math.sin(f / 10) * 2})`}
        fill="#6E5A4A" stroke={C.ink} strokeWidth={5} strokeLinejoin="round">
        <path d="M -30 0 L -18 -70 L 18 -70 L 30 0 Z" />
        <circle cx={0} cy={-92} r={17} />
        <path d="M -14 -64 L -52 -98 M 14 -64 L 44 -44" fill="none" strokeWidth={6} strokeLinecap="round" />
      </g>
      <rect x={-20} y={820} width={330} height={40} fill={C.warmDeep} stroke={C.ink} strokeWidth={5} />
      {/* 額縁の柱 */}
      <rect x={300} y={-20} width={64} height={H + 40} fill={mix("#C9A35B", "#3A3426", dim * 0.6)}
        stroke={C.ink} strokeWidth={6} />
      <path d="M 318 60 L 318 1020 M 346 60 L 346 1020" stroke={C.ink} strokeWidth={3} opacity={0.4} />
      {/* 平土間: 手前の背中の列 */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const sx = 420 + i * 265 + (rnd(21, i) - 0.5) * 40;
        return (
          <g key={i} transform={`translate(${sx} ${1035 + Math.sin(f / 13 + i * 1.4) * 3})`}
            fill={seat} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
            <path d="M -92 60 Q -96 -30 -58 -44 L 58 -44 Q 96 -30 92 60 Z" />
            <circle cx={0} cy={-78} r={46} />
          </g>
        );
      })}
      {/* シャンデリア */}
      <Chandelier x={1150} y={160} s={1.05} f={f} lit={lit} />
      {/* 暗転の帳 (桟敷側だけ沈む。舞台の額縁は沈まない) */}
      <rect x={364} y={-20} width={1580} height={H + 40} fill={C.nightDeep} opacity={dim * 0.42} />
    </g>
  );
};

// 王冠 (#91 の主役。1巻の王冠と同じ記号: 3つ山+宝石)
const Crown: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> =
  ({ x, y, s = 1, rot = 0, o = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} opacity={o}>
      <path d="M -74 30 L -84 -38 L -40 -6 L 0 -54 L 40 -6 L 84 -38 L 74 30 Z"
        fill={KRP.gold} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-74} y={30} width={148} height={26} rx={9}
        fill={C.crownDeep} stroke={C.ink} strokeWidth={5.5} />
      <circle cx={0} cy={-54} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
      <circle cx={-84} cy={-38} r={7} fill={KRP.blue} stroke={C.ink} strokeWidth={4} />
      <circle cx={84} cy={-38} r={7} fill={KRP.blue} stroke={C.ink} strokeWidth={4} />
      <circle cx={-38} cy={43} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={38} cy={43} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
    </g>
  );

// きらめき (王冠の軌跡など)
const Spark: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> =
  ({ x, y, s = 1, o = 1, color = KRP.yellow }) => (
    <path d={`M ${x} ${y - 14 * s} L ${x + 4 * s} ${y - 4 * s} L ${x + 14 * s} ${y} L ${x + 4 * s} ${y + 4 * s} L ${x} ${y + 14 * s} L ${x - 4 * s} ${y + 4 * s} L ${x - 14 * s} ${y} L ${x - 4 * s} ${y - 4 * s} Z`}
      fill={color} stroke={C.ink} strokeWidth={2.5} opacity={o} />
  );

// 壁掛けのガス灯1本 (#93 の客席側。dimT 0→1 で炎がすとんと落ちる)
const WallGas: React.FC<{ x: number; y: number; f: number; i: number; dimT: number }> =
  ({ x, y, f, i, dimT }) => {
    const fl = 1 - dimT * 0.94;
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M 0 30 Q -26 26 -30 0" fill="none" stroke={C.brassPipe} strokeWidth={9} />
        <path d="M 0 30 Q -26 26 -30 0" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        <path d="M -12 -2 L 12 -2 L 7 -20 L -7 -20 Z" fill={C.brassPipe} stroke={C.ink} strokeWidth={4.5} />
        {fl > 0.08 && <circle cx={0} cy={-34} r={30 * fl + 8} fill={SGP.lampGold} opacity={0.35 * fl} />}
        <path d={`M 0 ${-22 - 26 * fl + Math.sin(f / 4 + i) * 2 * fl} C ${-7 * fl} ${-30 * fl - 22} ${-6 * fl} -24 0 -22 C ${6 * fl} -24 ${7 * fl} ${-30 * fl - 22} 0 ${-22 - 26 * fl + Math.sin(f / 4 + i) * 2 * fl} Z`}
          fill={SGP.lampGold} stroke={C.ink} strokeWidth={3} opacity={Math.max(fl, 0.15)} />
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #87 思い出してください。それまでの客席は、明るいのが当たり前でした。
// 格: 並 / seed 1122
// 絵: 回想の泡の中に、1巻の明るい客席 (ナポリの宴) が小さく浮かぶ
// どこ: 暗転したいまの客席。左下の客ひとりが昔を思い出している
// 演出: 青暗い「いま」と、泡の中の暖色の「宴」の対比。泡の中は1巻のナポリの賑わい
// 動き: 泡が順にぽこぽこ出る→大泡がふわふわ浮く。中の客は腕を振り音符が舞う
const Sg087: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f / 9) * 8;
  const bubT = pop(seg(f, 10, 24));
  return (
    <Frame f={f} seed={1122} bg={C.nightDeep} dark>
      {/* ===== いまの客席 (青暗い) ===== */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightDeep} />
      <rect x={-20} y={-20} width={W + 40} height={520} fill={C.night} />
      <rect x={-20} y={496} width={W + 40} height={10} fill={C.ink} opacity={0.5} />
      {/* 奥の座席列 (暗がりの背中) */}
      {[0, 1, 2].map((row) => {
        const ry = 640 + row * 160;
        const sc = 0.72 + row * 0.3;
        return (
          <g key={row}>
            <rect x={-20} y={ry + 56 * sc} width={W + 40} height={160 * sc}
              fill={mix(C.nightSeat, C.nightDeep, 0.3 + row * 0.12)} stroke={C.ink} strokeWidth={5} />
            {Array.from({ length: 9 - row * 2 }).map((_, i) => {
              const sx = 140 + i * (240 + row * 130) + (rnd(31 + row, i) - 0.5) * 50;
              return (
                <g key={i} transform={`translate(${sx} ${ry + Math.sin(f / 14 + i + row) * 2.5}) scale(${sc})`}
                  fill={C.nightSeat} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round">
                  <path d="M -66 60 Q -70 -24 -42 -34 L 42 -34 Q 70 -24 66 60 Z" />
                  <circle cx={0} cy={-62} r={34} fill={mix(C.nightSeat, "#5A6478", 0.5)} />
                </g>
              );
            })}
          </g>
        );
      })}
      {/* 消えたままの壁ランプ (いまは灯らない) */}
      <g transform="translate(1800 300)">
        <path d="M -16 0 L 16 0 L 9 -22 L -9 -22 Z" fill={SGP.lampOff} stroke={C.ink} strokeWidth={4.5} />
        <line x1={-8} y1={-40} x2={8} y2={-26} stroke={SGP.lampOff} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={26} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* ===== 思い出す客 (左下の大きな背中) ===== */}
      <g transform={`translate(330 ${1052 + Math.sin(f / 12) * 3})`}
        fill={C.nightSeat} stroke={C.ink} strokeWidth={7} strokeLinejoin="round">
        <path d="M -130 80 Q -138 -50 -84 -66 L 84 -66 Q 138 -50 130 80 Z" />
        <circle cx={0} cy={-118} r={64} fill={mix(C.nightSeat, "#5A6478", 0.5)} />
        <path d="M 44 -140 Q 58 -132 58 -116" fill="none" strokeWidth={4.5} opacity={0.7} />
      </g>
      {/* 泡のしっぽ (客の頭から右上へぽこぽこ) */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={470 + i * 90} cy={860 - i * 95}
          r={(16 + i * 12) * pop(seg(f, 2 + i * 4, 10 + i * 4))}
          fill={KRP.white} stroke={C.ink} strokeWidth={5} opacity={0.95} />
      ))}
      {/* ===== 回想の大泡: 1巻の明るい客席 (ナポリの宴) ===== */}
      <g transform={`translate(1150 ${430 + bob}) scale(${bubT})`}>
        <defs>
          <clipPath id="sg87bub"><ellipse cx={0} cy={0} rx={470} ry={330} /></clipPath>
        </defs>
        {/* 泡のもこもこ輪郭 */}
        <g fill={KRP.white} stroke={C.ink} strokeWidth={7}>
          <ellipse cx={0} cy={0} rx={492} ry={352} />
          <circle cx={-430} cy={-190} r={92} />
          <circle cx={-180} cy={-320} r={110} />
          <circle cx={140} cy={-330} r={104} />
          <circle cx={420} cy={-200} r={90} />
          <circle cx={-420} cy={190} r={86} />
          <circle cx={430} cy={190} r={84} />
          <circle cx={60} cy={330} r={96} />
          <circle cx={-250} cy={320} r={88} />
        </g>
        <ellipse cx={0} cy={0} rx={470} ry={330} fill={C.warmWall} />
        <g clipPath="url(#sg87bub)">
          {/* 宴の客席: 暖色の壁 + 桟敷の手すり + 燭台 */}
          <rect x={-470} y={-330} width={940} height={660} fill={C.warmWall} />
          <rect x={-470} y={-96} width={940} height={16} fill={C.warmDeep} />
          <rect x={-470} y={96} width={940} height={200} fill={C.warmDeep} opacity={0.5} />
          {/* 手すりの垂れ布 */}
          <rect x={-470} y={80} width={940} height={26} rx={8} fill={C.warmDeep} stroke={C.ink} strokeWidth={5} />
          <path d="M -460 106 Q -390 148 -320 106 Q -250 148 -180 106 Q -110 148 -40 106 Q 30 148 100 106 Q 170 148 240 106 Q 310 148 380 106 Q 430 140 470 110"
            fill={C.boxCloth} stroke={C.ink} strokeWidth={4.5} />
          {/* 宴の客たち (弁当・おしゃべり・万歳) */}
          <PersonMini x={-300} y={70} s={0.74} color={C.dressRose} f={f} phase={1} face="smile" arms="up" />
          <PersonMini x={-130} y={74} s={0.74} color={C.dressGold} f={f} phase={2} face="smile" />
          <PersonMini x={40} y={70} s={0.74} color={C.dressBlue} f={f} phase={3} face="smile" arms="up" />
          <PersonMini x={210} y={74} s={0.74} color={C.dressGreen} f={f} phase={4} face="smile" />
          <PersonMini x={360} y={70} s={0.74} color={C.dressRose} f={f} phase={5} face="dot" />
          {/* 弁当と徳利 */}
          <g transform="translate(-130 86)">
            <rect x={-30} y={-14} width={60} height={22} rx={4} fill={SGP.wood} stroke={C.ink} strokeWidth={4.5} />
            <line x1={-30} y1={-4} x2={30} y2={-4} stroke={C.ink} strokeWidth={3} />
          </g>
          <path d="M -8 0 L -8 -14 Q -14 -22 -7 -30 L 7 -30 Q 14 -22 8 -14 L 8 0 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={4.5} transform="translate(268 86)" />
          {/* おしゃべりの音符 (浮き沈み) */}
          {[-220, -40, 150, 320].map((nx, i) => (
            <g key={i} transform={`translate(${nx} ${-50 + Math.sin(f / 7 + i * 1.6) * 9})`}>
              <ellipse cx={0} cy={0} rx={10} ry={8} fill={C.ink} transform="rotate(-18)" />
              <path d="M 9 -2 L 9 -34 Q 19 -32 24 -24" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            </g>
          ))}
          {/* 泡の中のシャンデリア */}
          <Chandelier x={0} y={-250} s={0.8} f={f} lit={1} />
          {/* 暖かい光のかさ */}
          <ellipse cx={0} cy={-40} rx={430} ry={260} fill={SGP.lampGold} opacity={0.13 + Math.sin(f / 11) * 0.03} />
        </g>
        {/* 泡のつや */}
        <path d="M -400 -200 Q -320 -300 -180 -316" fill="none" stroke={KRP.white}
          strokeWidth={10} strokeLinecap="round" opacity={0.8} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #88 明るい客席では、お客はお互いの顔を見て、着飾って、社交をします。
// 格: 並 / seed 1123
// 絵: 明るい客席。視線の矢印が客→客→客へ飛び交う。ドレスと扇の見せ合い
// どこ: 明るい客席 (OperaHall dim=0)。桟敷2段×3と平土間
// 演出: 視線の矢印が客→客→客へ飛び交う。舞台は左端で誰も見ていない
// 動き: 矢印が時間差で弧を描いて伸びる。扇がひらひら・シャンデリアの炎がゆれる
const Sg088: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1123} bg={C.warmWall}>
    <OperaHall f={f} dim={0} />
    {/* 視線の矢印: 客から客へ (舞台には1本も向かわない) */}
    <Gaze x1={770} y1={350} x2={1096} y2={356} t={seg(f, 4, 14)} bend={-90} />
    <Gaze x1={1250} y1={356} x2={1576} y2={350} t={seg(f, 9, 19)} bend={-90} />
    <Gaze x1={1590} y1={696} x2={1266} y2={700} t={seg(f, 14, 24)} bend={-80} />
    <Gaze x1={1110} y1={700} x2={786} y2={696} t={seg(f, 19, 29)} bend={-80} />
    <Gaze x1={700} y1={660} x2={1130} y2={430} t={seg(f, 24, 34)} bend={-40} />
    <Gaze x1={1660} y1={430} x2={1240} y2={660} t={seg(f, 29, 39)} bend={-40} />
  </Frame>
);

// -------------------------------------------------------------------
// #89 暗い客席では、見えるものは、舞台だけ。
// 格: 並 / seed 1124
// 絵: 同じ構図が暗転 (連番)。視線の矢印が全部、舞台の一点へ束ねられる
// どこ: #88 とまったく同じ構図 (OperaHall) が暗転する連番
// 演出: 視線の矢印が全部、左の舞台の一点へ束ねられる。明るいのは舞台だけ
// 動き: dim 0→1 ですっと暗くなり、そのあと黄色の視線が順に舞台へ集まる
const Sg089: React.FC<{ f: number }> = ({ f }) => {
  const dim = seg(f, 2, 18);
  return (
    <Frame f={f} seed={1124} bg={C.night} dark>
      <OperaHall f={f} dim={dim} />
      {/* 舞台へ束ねられる視線 (全部おなじ一点へ) */}
      <Gaze x1={700} y1={360} x2={300} y2={560} t={seg(f, 16, 26)} bend={-60} color={KRP.yellow} />
      <Gaze x1={1180} y1={360} x2={310} y2={530} t={seg(f, 19, 29)} bend={-110} color={KRP.yellow} />
      <Gaze x1={1660} y1={360} x2={320} y2={500} t={seg(f, 22, 32)} bend={-150} color={KRP.yellow} />
      <Gaze x1={700} y1={700} x2={300} y2={620} t={seg(f, 25, 35)} bend={-30} color={KRP.yellow} />
      <Gaze x1={1180} y1={700} x2={310} y2={600} t={seg(f, 28, 38)} bend={-80} color={KRP.yellow} />
      <Gaze x1={1660} y1={700} x2={320} y2={580} t={seg(f, 31, 41)} bend={-120} color={KRP.yellow} />
      {/* 舞台だけが光る (暗転が進むほど際立つ) */}
      <ellipse cx={140} cy={620} rx={360} ry={420} fill={SGP.lampGold}
        opacity={(0.1 + Math.sin(f / 10) * 0.02) * dim} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #90 お客にできることは、黙って観ることだけになります。
// 格: 図 / seed 1125
// 絵: 選択肢カード3枚。「おしゃべり」「お弁当」が灰色に沈み、「観る」だけが光って残る
// どこ: 暗い舞台の上。選択肢カード3枚にスポットライトが1本ずつ当たっている
// 演出: 「おしゃべり」「お弁当」のスポットが順に落ちてカードが灰色に沈み「観る」だけ光って残る
// 動き: スポットが時間差でふっと消える→沈んだカードが傾く。「観る」は光が脈打ち少し迫り出す
const Sg090: React.FC<{ f: number }> = ({ f }) => {
  const cards = [
    { x: 480, label: "おしゃべり", offT: seg(f, 10, 16) },
    { x: 1440, label: "お弁当", offT: seg(f, 20, 26) },
  ];
  const pulse = 1 + Math.sin(f / 8) * 0.025;
  return (
    <Frame f={f} seed={1125} bg={C.nightDeep} dark>
      {/* 舞台の奥 (暗幕のひだ) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightDeep} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M ${i * 260 - 60} -20 Q ${i * 260 + 40} 400 ${i * 260 - 20} 700`}
          fill="none" stroke={C.night} strokeWidth={54} opacity={0.8} />
      ))}
      {/* 舞台の床板 */}
      <rect x={-20} y={700} width={W + 40} height={400} fill={mix(SGP.stage, C.nightDeep, 0.55)}
        stroke={C.ink} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={i} x1={i * 240 - 60 - (i % 2) * 60} y1={700} x2={i * 240 - 160} y2={1100}
          stroke={C.ink} strokeWidth={3} opacity={0.3} />
      ))}
      <line x1={-20} y1={760} x2={1940} y2={760} stroke={C.ink} strokeWidth={3} opacity={0.3} />
      {/* 手前: 観ている客の背中 (暗がり) */}
      {[180, 640, 1240, 1720].map((sx, i) => (
        <g key={i} transform={`translate(${sx} ${1120 + Math.sin(f / 13 + i * 1.3) * 3})`}
          fill={C.nightSeat} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
          <path d="M -98 60 Q -104 -36 -62 -50 L 62 -50 Q 104 -36 98 60 Z" />
          <circle cx={0} cy={-92} r={48} fill={mix(C.nightSeat, "#5A6478", 0.4)} />
        </g>
      ))}
      {/* ===== 沈む2枚 (おしゃべり/お弁当) ===== */}
      {cards.map((cd, ci) => {
        const off = cd.offT;
        const tilt = off * (ci === 0 ? -7 : 7);
        const cardFill = mix(KRP.white, "#6A7080", off);
        return (
          <g key={ci}>
            {/* スポットライトの筒 (消えるとなくなる) */}
            <polygon points={`${cd.x - 40},-20 ${cd.x + 40},-20 ${cd.x + 190},470 ${cd.x - 190},470`}
              fill={SGP.lampGold} opacity={0.2 * (1 - off)} />
            <ellipse cx={cd.x} cy={690} rx={230} ry={40} fill={SGP.lampGold} opacity={0.18 * (1 - off)} />
            {/* カード (立て札) */}
            <g transform={`translate(${cd.x} ${470 + off * 26}) rotate(${tilt})`}>
              <rect x={-24} y={160} width={48} height={120} fill={mix(SGP.wood, "#4A4A52", off)}
                stroke={C.ink} strokeWidth={5.5} />
              <rect x={-170} y={-160} width={340} height={330} rx={16}
                fill={cardFill} stroke={C.ink} strokeWidth={7} />
              <rect x={-146} y={-136} width={292} height={282} rx={10}
                fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
              {/* 絵柄 */}
              {ci === 0 ? (
                <g opacity={1 - off * 0.45} transform="translate(0 -40)">
                  <ellipse cx={-18} cy={10} rx={17} ry={13} fill={C.ink} transform="rotate(-18 -18 10)" />
                  <path d="M -3 6 L -3 -48 Q 14 -44 22 -32" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
                  <ellipse cx={44} cy={-6} rx={12} ry={9} fill={C.ink} transform="rotate(-18 44 -6)" />
                  <path d="M 55 -10 L 55 -46" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
                </g>
              ) : (
                <g opacity={1 - off * 0.45} transform="translate(0 -44)">
                  <rect x={-66} y={-18} width={132} height={52} rx={6} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
                  <line x1={-66} y1={4} x2={66} y2={4} stroke={C.ink} strokeWidth={4} />
                  <path d="M -48 -18 L -48 -34 M 0 -18 L 0 -34 M 48 -18 L 48 -34" stroke={C.ink} strokeWidth={4} />
                </g>
              )}
              <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={54} fill={mix(C.ink, "#3C4048", off)}>{cd.label}</text>
            </g>
          </g>
        );
      })}
      {/* ===== 残る1枚 (観る) ===== */}
      <g>
        <polygon points="920,-20 1000,-20 1170,470 750,470" fill={SGP.lampGold} opacity={0.28} />
        <ellipse cx={960} cy={690} rx={260} ry={44} fill={SGP.lampGold} opacity={0.26} />
        <g transform={`translate(960 466) scale(${pulse * (1 + seg(f, 26, 36) * 0.06)})`}>
          <rect x={-26} y={166} width={52} height={124} fill={SGP.wood} stroke={C.ink} strokeWidth={5.5} />
          <circle cx={0} cy={0} r={252} fill={SGP.lampGold} opacity={0.2} />
          <rect x={-185} y={-172} width={370} height={352} rx={16}
            fill={KRP.white} stroke={C.ink} strokeWidth={8} />
          <rect x={-159} y={-146} width={318} height={300} rx={10}
            fill="none" stroke={KRP.orange} strokeWidth={4} opacity={0.7} />
          {/* 大きな目 (観る) */}
          <g transform="translate(0 -46)">
            <path d="M -92 0 Q 0 -74 92 0 Q 0 74 -92 0 Z" fill={KRP.white} stroke={C.ink} strokeWidth={7} />
            <circle cx={0} cy={0} r={34} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={5} />
            <circle cx={0} cy={0} r={14} fill={C.ink} />
            <circle cx={11} cy={-11} r={6} fill={KRP.white} />
          </g>
          <text x={0} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={64} fill={C.ink}>観る</text>
        </g>
        {/* きらめき */}
        <Spark x={690} y={300} s={0.9} o={0.5 + Math.sin(f / 6) * 0.4} />
        <Spark x={1240} y={360} s={0.7} o={0.5 + Math.sin(f / 6 + 2) * 0.4} />
        <Spark x={1180} y={180} s={0.6} o={0.5 + Math.sin(f / 6 + 4) * 0.4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #91 劇場の主役が、お客から作品へ。この日、交代したのです。
// 格: 山 / seed 1126
// 絵: 1巻#64の王冠が、客席からふわりと持ち上がり、舞台へ移って載る。交代の儀式。客席側に残るのは空の台座
// どこ: 暗くなったホールの引き。左=額縁と舞台 / 右=段々の客席と客 / 中央で王冠が飛ぶ
// 演出: 1巻#64の王冠が客席の台座からふわりと持ち上がり、弧を描いて舞台へ載る交代の儀式。
//       客席側には空の台座と王冠の残像だけが残る。スポットライトが王冠を追う
// 動き: 王冠が弧を描いて飛ぶ (seg 8-34)→着地できらめきが散る。カメラがゆっくり寄る
const Sg091: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 8, 34));
  const q = (a: number, c: number, b: number, s: number) =>
    (1 - s) * (1 - s) * a + 2 * (1 - s) * s * c + s * s * b;
  const cx = q(1330, 900, 492, t);   // 客席の台座 → 舞台の台座
  const cy = q(560, 160, 342, t);
  const land = seg(f, 34, 40);
  const z = 1 + easeOut(seg(f, 0, 42)) * 0.05;
  return (
    <Frame f={f} seed={1126} bg={C.night} dark>
      <g transform={zoomAt(z, 860, 500)}>
        {/* 壁と天井 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} />
        <rect x={-20} y={-20} width={W + 40} height={150} fill={C.nightDeep} />
        <rect x={-20} y={124} width={W + 40} height={12} fill={C.ink} opacity={0.6} />
        {/* ===== 左: 舞台 ===== */}
        {/* 額縁 */}
        <rect x={700} y={-20} width={56} height={700} fill={mix(C.brassPipe, C.night, 0.45)} stroke={C.ink} strokeWidth={6} />
        <rect x={-20} y={110} width={740} height={48} fill={mix(C.brassPipe, C.night, 0.45)} stroke={C.ink} strokeWidth={6} />
        {/* 緞帳 (左に寄せた赤) */}
        <path d="M -20 158 L 130 158 Q 150 420 120 640 Q 40 660 -20 640 Z"
          fill={mix(SGP.curtain, C.nightDeep, 0.25)} stroke={C.ink} strokeWidth={5.5} />
        <path d="M 40 170 Q 48 400 38 630 M 92 170 Q 102 400 88 634"
          fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
        {/* 舞台の床と前板 */}
        <rect x={-20} y={640} width={760} height={30} fill={SGP.stage} stroke={C.ink} strokeWidth={6} />
        <rect x={-20} y={670} width={760} height={240} fill={mix(SGP.wood, C.nightDeep, 0.35)} stroke={C.ink} strokeWidth={6} />
        <path d="M 60 730 Q 220 722 360 732 M 420 820 Q 560 812 680 822" fill="none"
          stroke={C.ink} strokeWidth={3} opacity={0.4} />
        {/* 舞台中央の台座 (作品の側) */}
        <g transform="translate(492 640)">
          <rect x={-120} y={-36} width={240} height={36} rx={8} fill={C.brassPipe} stroke={C.ink} strokeWidth={6} />
          <rect x={-86} y={-150} width={172} height={114} fill={mix(C.brassPipe, "#8A6A30", 0.5)} stroke={C.ink} strokeWidth={6} />
          <path d="M -70 -128 Q 0 -136 70 -126" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
          <rect x={-104} y={-186} width={208} height={36} rx={8} fill={C.brassPipe} stroke={C.ink} strokeWidth={6} />
          {/* 赤いクッション */}
          <path d="M -88 -186 Q 0 -226 88 -186 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* フットライト */}
        {[120, 260, 400, 540, 660].map((fx, i) => (
          <g key={fx} transform={`translate(${fx} 640)`}>
            <path d="M -10 0 A 10 10 0 0 1 10 0 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-9} r={5} fill={SGP.lampGold} stroke={C.ink} strokeWidth={2.5}
              opacity={0.85 + Math.sin(f / 6 + i) * 0.15} />
          </g>
        ))}
        {/* ===== 右: 客席の奥の壁 (アーチと消えた燭台) ===== */}
        {[1020, 1340, 1660].map((ax, i) => (
          <g key={`arc${i}`} opacity={0.75}>
            <path d={`M ${ax - 90} 560 L ${ax - 90} 330 Q ${ax} 258 ${ax + 90} 330 L ${ax + 90} 560`}
              fill={C.nightDeep} stroke={C.ink} strokeWidth={5} />
            <line x1={ax} y1={282} x2={ax} y2={560} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          </g>
        ))}
        {[1180, 1500, 1820].map((sx2, i) => (
          <g key={`sc${i}`} transform={`translate(${sx2} 430)`} opacity={0.9}>
            <rect x={-8} y={18} width={16} height={26} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={0} r={15} fill={SGP.lampOff} stroke={C.ink} strokeWidth={4.5} />
            <line x1={-6} y1={-6} x2={6} y2={6} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 消えたシャンデリア (天井から) */}
        <Chandelier x={1490} y={225} s={0.85} f={f} lit={0} />
        {/* ===== 右: 段々の客席 ===== */}
        <path d="M 820 910 L 820 790 L 1160 790 L 1160 700 L 1500 700 L 1500 610 L 1900 610 L 1900 910 Z"
          fill={mix(SGP.stage, C.nightDeep, 0.5)} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <line x1={820} y1={790} x2={1160} y2={790} stroke={C.ink} strokeWidth={7} />
        <line x1={1160} y1={700} x2={1500} y2={700} stroke={C.ink} strokeWidth={7} />
        <line x1={1500} y1={610} x2={1900} y2={610} stroke={C.ink} strokeWidth={7} />
        {/* 客 (みんな舞台側=王冠の行き先を見ている) */}
        <PersonMini x={940} y={790} s={0.82} color={C.nightSeat} f={f} phase={1} face="dot" />
        <PersonMini x={1080} y={790} s={0.82} color={mix(C.nightSeat, C.dressBlue, 0.4)} f={f} phase={2} face="dot" />
        <PersonMini x={1270} y={700} s={0.82} color={mix(C.nightSeat, C.dressRose, 0.4)} f={f} phase={3} face="dot" />
        <PersonMini x={1620} y={610} s={0.82} color={C.nightSeat} f={f} phase={4} face="dot" />
        <PersonMini x={1790} y={610} s={0.82} color={mix(C.nightSeat, C.dressGreen, 0.4)} f={f} phase={5} face="dot" />
        {/* ===== 客席の台座 (王冠が居た場所。空になる) ===== */}
        <g transform="translate(1330 700)">
          <rect x={-110} y={-32} width={220} height={32} rx={8} fill={mix(C.brassPipe, C.night, 0.3)} stroke={C.ink} strokeWidth={6} />
          <rect x={-78} y={-128} width={156} height={96} fill={mix(C.brassPipe, C.night, 0.45)} stroke={C.ink} strokeWidth={6} />
          <rect x={-94} y={-160} width={188} height={32} rx={8} fill={mix(C.brassPipe, C.night, 0.3)} stroke={C.ink} strokeWidth={6} />
          <path d="M -80 -160 Q 0 -196 80 -160 Z" fill={mix(SGP.curtain, C.nightDeep, 0.4)} stroke={C.ink} strokeWidth={5} />
          {/* クッションのへこみ + 王冠の残像 (点線) */}
          <path d="M -46 -172 Q 0 -160 46 -172" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.6 * t} />
          <g opacity={0.5 * t}>
            <path d="M -44 -176 L -50 -216 L -24 -198 L 0 -226 L 24 -198 L 50 -216 L 44 -176 Z"
              fill="none" stroke={KRP.gray} strokeWidth={3.5} strokeDasharray="8 7" />
          </g>
        </g>
        {/* ===== スポットライト (王冠を追う) ===== */}
        <polygon points={`${cx - 34},-20 ${cx + 34},-20 ${cx + 150},${cy + 130} ${cx - 150},${cy + 130}`}
          fill={SGP.lampGold} opacity={0.2} />
        {/* 飛ぶ王冠 */}
        <circle cx={cx} cy={cy} r={120} fill={SGP.lampGold} opacity={0.22} />
        <Crown x={cx} y={cy} s={1.15 + land * 0.05} rot={Math.sin(t * Math.PI) * -10} />
        {/* 軌跡のきらめき */}
        {[0.12, 0.26, 0.4, 0.54, 0.68].map((d, i) => {
          const st = clamp01(t - d);
          if (st <= 0 || t >= 1) return null;
          return <Spark key={i} x={q(1330, 900, 492, st)} y={q(560, 160, 342, st) + 30}
            s={0.7 - i * 0.08} o={0.7 - d} />;
        })}
        {/* 着地のきらめき */}
        {land > 0 && (
          <g opacity={1 - land * 0.3}>
            <Spark x={492 - 150 * land} y={320 - 90 * land} s={0.9} o={1 - land} />
            <Spark x={492 + 160 * land} y={300 - 70 * land} s={0.8} o={1 - land} />
            <Spark x={492 + 40 * land} y={240 - 110 * land} s={0.7} o={1 - land} />
            <circle cx={492} cy={352} r={60 + land * 150} fill="none"
              stroke={KRP.yellow} strokeWidth={6} opacity={(1 - land) * 0.8} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #92 ちなみに、ワーグナーの計画では、明かりは「弱める」だけのはずでした。
// 格: 並 / seed 1127
// 絵: 余談。設計メモ「客席灯: 弱める」の筆跡。ワーグナーの指がその行を叩く
// どこ: 夜の書斎の机の上 (真上からの寄り)。設計メモ・羽ペン・蝋燭・ベレー帽
// 演出: メモの中の1行「客席灯 弱める」だけ本物の字。ワーグナーの指がその行をとんとん叩く
// 動き: 指のタップ (周期)・叩いた瞬間の衝撃線・蝋燭の炎ゆらぎ・インクの照り
const Sg092: React.FC<{ f: number }> = ({ f }) => {
  const tap = Math.max(0, Math.sin(f / 6));        // 0..1 (1=叩いた瞬間)
  const handY = (1 - tap) * 16;                    // 上がって下りる
  return (
    <Frame f={f} seed={1127} bg={SGP.woodDark}>
      {/* 机の板 (真上から) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={SGP.woodDark} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line x1={-20} y1={i * 190 + 40} x2={1940} y2={i * 190 + 30} stroke={C.ink} strokeWidth={4} opacity={0.4} />
          <path d={`M ${300 + i * 260} ${i * 190 + 110} q 40 10 90 4`} fill="none"
            stroke={C.ink} strokeWidth={3} opacity={0.25} />
        </g>
      ))}
      {/* 蝋燭 (左上。皿と炎) */}
      <g transform="translate(220 230)">
        <circle cx={0} cy={60} r={110} fill={C.brassPipe} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={60} r={86} fill={mix(C.brassPipe, "#8A6A30", 0.4)} stroke={C.ink} strokeWidth={4} />
        <rect x={-30} y={-80} width={60} height={140} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <path d="M -30 -56 q 12 16 6 36 l -6 0 Z" fill="#E8E2D2" stroke={C.ink} strokeWidth={3} />
        <circle cx={0} cy={-120} r={40 + Math.sin(f / 5) * 4} fill={SGP.lampGold} opacity={0.35} />
        <path d={`M 0 ${-96 + Math.sin(f / 5) * 3} C -13 -116 -10 -134 0 -142 C 10 -134 13 -116 0 ${-96 + Math.sin(f / 5) * 3} Z`}
          fill={SGP.lampGold} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 蝋燭の明かりだまり */}
      <ellipse cx={760} cy={520} rx={820} ry={560} fill={SGP.lampGold} opacity={0.08 + Math.sin(f / 11) * 0.02} />
      {/* ベレー帽 (右上の隅。持ち主の気配) */}
      <g transform="translate(1690 170) rotate(14)">
        <ellipse cx={0} cy={0} rx={150} ry={96} fill={C.ink} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={-20} cy={-14} rx={104} ry={58} fill="#4E443C" opacity={0.9} />
        <circle cx={6} cy={-66} r={13} fill="#4E443C" stroke={C.ink} strokeWidth={4} />
      </g>
      {/* ===== 設計メモの紙 ===== */}
      <g transform="translate(900 560) rotate(-2)">
        <rect x={-560} y={-400} width={1120} height={800} fill={SGP.paper} stroke={C.ink} strokeWidth={7} />
        <path d="M -560 -360 L -520 -400 M 560 360 L 516 400" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
        <path d="M 440 -400 q 10 44 -6 84" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
        {/* 上半分: 扇形の客席スケッチ (バイロイトの平面図らしい弧) */}
        <g transform="translate(-230 -180)" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.75}>
          <path d="M 0 120 L -210 -60 M 0 120 L 210 -60" />
          {[70, 110, 150, 190, 230].map((r) => (
            <path key={r} d={`M ${-r * 0.86} ${120 - r * 0.5} A ${r} ${r} 0 0 1 ${r * 0.86} ${120 - r * 0.5}`} />
          ))}
          <rect x={-56} y={128} width={112} height={44} strokeWidth={4.5} />
        </g>
        {/* スケッチへの書き込み線 (読めない字) */}
        <g fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.55}>
          <path d="M 150 -300 q 60 -8 120 2 q 50 8 100 -2" />
          <path d="M 150 -240 q 80 10 170 0" />
          <path d="M 150 -180 q 60 -6 130 4 q 40 6 90 -4" />
          <path d="M -480 20 q 90 10 180 0 q 80 -8 160 2" />
          <path d="M -480 90 q 70 -8 150 2 q 90 10 170 0 q 60 -6 120 2" />
        </g>
        {/* ===== 本物の1行: 客席灯 弱める ===== */}
        <g transform="translate(0 196)">
          <rect x={-490} y={-52} width={980} height={104} rx={12}
            fill={KRP.white} stroke={KRP.orange} strokeWidth={5} opacity={0.95} />
          <text x={-440} y={22} fontFamily={FONT} fontWeight={900} fontSize={62} fill={C.ink}>客席灯</text>
          <text x={-130} y={22} fontFamily={FONT} fontWeight={900} fontSize={62} fill={C.ink}>弱める</text>
          {/* 「弱める」の下の強調線 (本人の筆) */}
          <path d="M -140 44 q 160 14 330 2" fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.85} />
          {/* 消すのではない: ランプ絵文字的な小さい図 (全灯→半灯) */}
          <g transform="translate(330 -2)" fill="none" stroke={C.ink} strokeWidth={4}>
            <circle cx={0} cy={0} r={26} fill={SGP.lampGold} opacity={0.9} />
            <path d="M 52 -14 L 84 -22 M 52 14 L 84 22" strokeWidth={5} strokeLinecap="round" />
            <circle cx={128} cy={0} r={26} fill={SGP.lampGold} opacity={0.45} />
          </g>
        </g>
      </g>
      {/* 羽ペンとインク壺 (紙の左下) */}
      <g transform="translate(330 870) rotate(-24)">
        <path d="M 0 0 Q 90 -60 210 -80 Q 130 -20 70 10 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <path d="M 30 -8 Q 110 -50 190 -72" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.6} />
        <path d="M 0 0 L -34 26" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      </g>
      <g transform="translate(180 960)">
        <path d="M -44 0 Q -48 -56 0 -60 Q 48 -56 44 0 Q 30 16 0 16 Q -30 16 -44 0 Z"
          fill="#3A3E46" stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-58} rx={24} ry={8} fill={C.ink} />
      </g>
      {/* ===== ワーグナーの手 (右から。1行を指で叩く) ===== */}
      <g transform={`translate(${1530} ${724 + handY}) rotate(${-4 - tap * 3})`}>
        {/* 袖 (濃い上着 + 白いカフス) */}
        <path d="M 430 160 L 150 10 Q 120 -6 90 8 L 60 24 Q 100 90 200 170 L 430 260 Z"
          fill="#3E3630" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 150 10 Q 120 -6 90 8 L 60 24 Q 78 56 110 92 L 170 52 Q 158 28 150 10 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        {/* 手の甲とにぎった指 */}
        <path d="M 90 8 Q 30 -14 -20 16 Q -44 34 -30 58 Q 0 90 60 84 Q 100 72 110 92 L 60 24 Z"
          fill="#EAD9C2" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -8 44 q 18 14 44 16 M 16 28 q 14 10 34 14" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
        {/* 伸ばした人差し指 */}
        <path d="M -20 16 Q -120 20 -176 46 Q -194 56 -188 72 Q -180 86 -158 82 Q -80 70 -24 62 Q -40 38 -20 16 Z"
          fill="#EAD9C2" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {/* 叩いた瞬間の衝撃線 (指先 = だいたい (1330, 794)) */}
      <g opacity={tap > 0.82 ? 1 : 0} stroke={KRP.orange} strokeWidth={6} strokeLinecap="round">
        <line x1={1270} y1={754} x2={1240} y2={724} />
        <line x1={1330} y1={740} x2={1330} y2={700} />
        <line x1={1390} y1={754} x2={1420} y2={724} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #93 ところが当日、ガス装置の調子が悪く、客席はほとんど真っ暗に。
// 格: 並 / seed 1128
// 絵: ガス装置がぷすぷすと咳き込み、技師が配管に飛びつく。客席の明かりがすとんと落ちる
// どこ: 劇場の裏方 (レンガ壁のガス室)。左=咳き込むガス装置と技師 / 右=壁の向こうの客席の灯
// 演出: 装置がぷすぷす煙を吐き、技師がバルブに飛びつく。右の切り欠きで客席の明かりがすとんと落ちる
// 動き: 煙の輪が周期で吐かれる・タンクがぶるぶる・技師が傾いて回す・炎が seg(12,30) で落ちる
const Sg093: React.FC<{ f: number }> = ({ f }) => {
  const drop = seg(f, 12, 30);              // 客席の明かりが落ちる
  const shake = Math.sin(f / 2.2) * 2.2;    // 装置の咳き込み
  return (
    <Frame f={f} seed={1128} bg={C.brick} dark>
      {/* レンガ壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.brick} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((r) => (
        <g key={r} stroke={C.ink} strokeWidth={3} opacity={0.35}>
          <line x1={-20} y1={r * 130 + 30} x2={1300} y2={r * 130 + 30} />
          {[0, 1, 2, 3, 4].map((cI) => (
            <line key={cI} x1={(cI + (r % 2) * 0.5) * 260 + 30} y1={r * 130 + 30}
              x2={(cI + (r % 2) * 0.5) * 260 + 30} y2={r * 130 + 160} />
          ))}
        </g>
      ))}
      {/* 床 */}
      <rect x={-20} y={960} width={W + 40} height={140} fill={mix(C.ironDark, C.nightDeep, 0.4)}
        stroke={C.ink} strokeWidth={6} />
      {/* ===== ガス装置: タンク + 配管 + 計器 ===== */}
      <g transform={`translate(${shake * 0.6} 0)`}>
        {/* タンク */}
        <g transform="translate(330 740)">
          <rect x={-230} y={-260} width={460} height={480} rx={60}
            fill={C.ironDark} stroke={C.ink} strokeWidth={8} />
          <path d="M -200 -200 Q 0 -230 200 -200" fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.25} />
          <line x1={-230} y1={-100} x2={230} y2={-100} stroke={C.ink} strokeWidth={4} opacity={0.6} />
          <line x1={-230} y1={80} x2={230} y2={80} stroke={C.ink} strokeWidth={4} opacity={0.6} />
          {[-180, -90, 0, 90, 180].map((rx) => (
            <g key={rx}>
              <circle cx={rx} cy={-100} r={6} fill={C.ink} />
              <circle cx={rx} cy={80} r={6} fill={C.ink} />
            </g>
          ))}
          {/* 計器 (針が暴れる) */}
          <circle cx={0} cy={-20} r={86} fill={SGP.paper} stroke={C.ink} strokeWidth={7} />
          <circle cx={0} cy={-20} r={66} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
          {[-60, -30, 0, 30, 60].map((a) => (
            <line key={a} x1={Math.sin((a * Math.PI) / 180) * 54} y1={-20 - Math.cos((a * Math.PI) / 180) * 54}
              x2={Math.sin((a * Math.PI) / 180) * 64} y2={-20 - Math.cos((a * Math.PI) / 180) * 64}
              stroke={C.ink} strokeWidth={4} />
          ))}
          <g transform={`rotate(${Math.sin(f / 1.8) * 34 - 20} 0 -20)`}>
            <line x1={0} y1={-20} x2={0} y2={-74} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
          </g>
          <circle cx={0} cy={-20} r={9} fill={C.ink} />
          {/* 脚 */}
          <rect x={-200} y={220} width={44} height={40} fill={C.ink} />
          <rect x={156} y={220} width={44} height={40} fill={C.ink} />
        </g>
        {/* 配管: タンク→天井→右の客席壁へ */}
        <path d="M 330 480 L 330 240 Q 330 180 390 180 L 1420 180"
          fill="none" stroke={C.brassPipe} strokeWidth={30} />
        <path d="M 330 480 L 330 240 Q 330 180 390 180 L 1420 180"
          fill="none" stroke={C.ink} strokeWidth={5} opacity={0.5} />
        {/* 継手 */}
        {[{ x: 330, y: 360 }, { x: 700, y: 180 }, { x: 1120, y: 180 }].map((p, i) => (
          <rect key={i} x={p.x - 26} y={p.y - 26} width={52} height={52} rx={8}
            fill={mix(C.brassPipe, "#8A6A30", 0.4)} stroke={C.ink} strokeWidth={5.5} />
        ))}
        {/* 横のバルブ管 (技師が回す) */}
        <path d="M 560 740 L 760 740" fill="none" stroke={C.brassPipe} strokeWidth={26} />
        <path d="M 560 740 L 760 740" fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.5} />
      </g>
      {/* 咳き込む煙 (継手から周期でぽふっ) */}
      {[0, 1, 2].map((i) => {
        const cyc = ((f * 1.6 + i * 26) % 60) / 60;  // 0→1 ループ
        return (
          <g key={i} opacity={(1 - cyc) * 0.8}>
            <circle cx={700 + cyc * 40 + i * 8} cy={130 - cyc * 90} r={14 + cyc * 26}
              fill={KRP.gray} stroke={C.ink} strokeWidth={3.5} />
          </g>
        );
      })}
      {[0, 1].map((i) => {
        const cyc = ((f * 1.6 + 14 + i * 32) % 64) / 64;
        return (
          <circle key={i} cx={356 + cyc * 30} cy={330 - cyc * 70} r={10 + cyc * 20}
            fill={KRP.gray} stroke={C.ink} strokeWidth={3} opacity={(1 - cyc) * 0.7} />
        );
      })}
      {/* ===== 技師: バルブ車に飛びついて回す ===== */}
      <Person x={880} y={1000} s={1.3} cloth="#5A6E5A" clothDark="#45553F"
        face="surprised" pose="hold" lean={-10} gaze={[-0.5, -0.3]} f={f} />
      {/* バルブの車 (技師の手の位置に重ねる) */}
      <g transform={`translate(${854} ${830}) rotate(${f * 4})`}>
        <circle cx={0} cy={0} r={54} fill="none" stroke={C.brassPipe} strokeWidth={14} />
        <circle cx={0} cy={0} r={54} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        <path d="M -54 0 L 54 0 M 0 -54 L 0 54" stroke={C.brassPipe} strokeWidth={11} />
        <circle cx={0} cy={0} r={12} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* あわての汗と動き線 */}
      <path d={`M 950 ${600 + Math.sin(f / 5) * 4} q 10 14 0 24 q -10 -10 0 -24`}
        fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
      <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
        <line x1={1010} y1={700} x2={1050} y2={680} />
        <line x1={1020} y1={760} x2={1064} y2={748} />
      </g>
      {/* ===== 右: 壁の切り欠き (客席側の明かりが落ちる) ===== */}
      <g>
        {/* 仕切り壁の断面 */}
        <rect x={1380} y={-20} width={44} height={1000} fill={C.ink} />
        <rect x={1380} y={-20} width={44} height={1000} fill={SGP.woodDark} opacity={0.5} />
        {/* 客席側の空間 */}
        <rect x={1424} y={-20} width={520} height={1000} fill={mix(C.warmWall, C.nightDeep, 0.25 + drop * 0.72)} />
        {/* 壁のガス灯2本 (すとんと落ちる) */}
        <WallGas x={1560} y={300} f={f} i={0} dimT={drop} />
        <WallGas x={1800} y={300} f={f} i={1} dimT={drop} />
        {/* 客席の客 (暗くなって驚いて上を見る) */}
        <PersonMini x={1560} y={940} s={0.9} color={mix(C.dressRose, C.nightSeat, drop * 0.7)}
          f={f} phase={2} face="dot" />
        <PersonMini x={1800} y={940} s={0.9} color={mix(C.dressBlue, C.nightSeat, drop * 0.7)}
          f={f} phase={5} face="dot" />
        {/* 驚きの「!」線 (暗くなった後) */}
        <g opacity={drop} stroke={KRP.white} strokeWidth={5} strokeLinecap="round">
          <line x1={1530} y1={740} x2={1518} y2={712} />
          <line x1={1834} y1={744} x2={1848} y2={716} />
        </g>
        {/* 配管が壁を抜けていく先 */}
        <rect x={1424} y={154} width={90} height={52} rx={10} fill={C.brassPipe} stroke={C.ink} strokeWidth={5.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #94 歴史的な「暗闇の発明」は、半分、ガスの事故だったのです。
// 格: 図 / seed 1129
// 絵: ガス管の計器盤の上に円グラフ。「発明 50%」「事故 50%」。針が真ん中で震えている
// どこ: ガス室の壁に付いた大きな計器盤 (#93 と同じレンガの世界)
// 演出: 文字盤そのものが円グラフ。「発明 50%」は暖色・「事故 50%」は鉄色。針が真ん中で震える
// 動き: 盤がぽんと出る→左右の半円が順に染まる→針がぶるぶる震え続ける。蒸気がしゅう
const Sg094: React.FC<{ f: number }> = ({ f }) => {
  const bezel = pop(seg(f, 2, 14));
  const half1 = seg(f, 12, 20);
  const half2 = seg(f, 18, 26);
  const needle = Math.sin(f / 2.4) * 5 + Math.sin(f / 1.3) * 1.6;  // 真ん中で震える
  return (
    <Frame f={f} seed={1129} bg={C.brick} dark>
      {/* レンガ壁 (#93 と同じ世界) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.brick} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((r) => (
        <g key={r} stroke={C.ink} strokeWidth={3} opacity={0.3}>
          <line x1={-20} y1={r * 130 + 50} x2={1940} y2={r * 130 + 50} />
          {[0, 1, 2, 3, 4, 5, 6].map((cI) => (
            <line key={cI} x1={(cI + (r % 2) * 0.5) * 280 + 20} y1={r * 130 + 50}
              x2={(cI + (r % 2) * 0.5) * 280 + 20} y2={r * 130 + 180} />
          ))}
        </g>
      ))}
      {/* 下の配管マニホールド */}
      <rect x={-20} y={920} width={W + 40} height={46} fill={C.brassPipe} stroke={C.ink} strokeWidth={6} />
      <line x1={-20} y1={936} x2={1940} y2={936} stroke={KRP.white} strokeWidth={4} opacity={0.3} />
      {[180, 560, 1360, 1740].map((px) => (
        <rect key={px} x={px - 30} y={908} width={60} height={70} rx={8}
          fill={mix(C.brassPipe, "#8A6A30", 0.4)} stroke={C.ink} strokeWidth={5.5} />
      ))}
      {/* 計器盤へ立ち上がる左右の管 */}
      <path d="M 560 920 L 560 700 Q 560 650 610 650 L 680 650" fill="none" stroke={C.brassPipe} strokeWidth={26} />
      <path d="M 1360 920 L 1360 700 Q 1360 650 1310 650 L 1240 650" fill="none" stroke={C.brassPipe} strokeWidth={26} />
      <path d="M 560 920 L 560 700 Q 560 650 610 650 L 680 650 M 1360 920 L 1360 700 Q 1360 650 1310 650 L 1240 650"
        fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.5} />
      {/* 蒸気 (左の継手からしゅう) */}
      {[0, 1, 2].map((i) => {
        const cyc = ((f * 1.4 + i * 20) % 56) / 56;
        return (
          <circle key={i} cx={560 + cyc * 50} cy={690 - cyc * 110} r={10 + cyc * 22}
            fill={KRP.gray} stroke={C.ink} strokeWidth={3} opacity={(1 - cyc) * 0.6} />
        );
      })}
      {/* 置き忘れたスパナ (下の管の上) */}
      <g transform="translate(1600 900) rotate(-12)">
        <rect x={-70} y={-9} width={140} height={18} rx={9} fill={C.ironDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 70 -20 A 24 24 0 1 1 70 20 L 56 10 L 56 -10 Z" fill={C.ironDark} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* ===== 大計器盤 = 円グラフ ===== */}
      <g transform={`translate(960 470) scale(${bezel})`}>
        {/* 取り付け座 */}
        <rect x={-360} y={-360} width={720} height={720} rx={48}
          fill={C.ironDark} stroke={C.ink} strokeWidth={8} />
        {[[-320, -320], [320, -320], [-320, 320], [320, 320]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={10} fill={mix(C.ironDark, KRP.white, 0.25)} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 真鍮ベゼル */}
        <circle cx={0} cy={0} r={316} fill={C.brassPipe} stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 296} cy={Math.sin(a) * 296} r={7}
            fill={mix(C.brassPipe, C.ink, 0.5)} stroke={C.ink} strokeWidth={3} />;
        })}
        {/* 文字盤 */}
        <circle cx={0} cy={0} r={266} fill={SGP.paper} stroke={C.ink} strokeWidth={6} />
        {/* 左半分 = 発明 (暖色) / 右半分 = 事故 (鉄色)。上から縦に割る */}
        <path d="M 0 -266 A 266 266 0 0 0 0 266 Z" fill={SGP.lampGold} opacity={0.85 * half1} />
        <path d="M 0 -266 A 266 266 0 0 1 0 266 Z" fill={mix(C.ironDark, KRP.gray, 0.4)} opacity={0.9 * half2} />
        <line x1={0} y1={-266} x2={0} y2={266} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={266} fill="none" stroke={C.ink} strokeWidth={6} />
        {/* 目盛り */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={Math.cos(a) * 240} y1={Math.sin(a) * 240}
            x2={Math.cos(a) * 262} y2={Math.sin(a) * 262} stroke={C.ink} strokeWidth={4} opacity={0.7} />;
        })}
        {/* ラベル (半円の中) */}
        <g opacity={half1}>
          <path d="M -222 -36 C -214 -84 -180 -120 -136 -138" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.4} />
          <text x={-128} y={-26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={52} fill={C.ink}>発明</text>
          <text x={-128} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={58} fill={C.ink}>50%</text>
          {/* 発明側の小さな図: 整った炎 */}
          <path d="M -128 118 C -142 100 -139 86 -128 78 C -117 86 -114 100 -128 118 Z"
            fill={SGP.lampGold} stroke={C.ink} strokeWidth={4} />
        </g>
        <g opacity={half2}>
          <text x={128} y={-26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={52} fill={KRP.white}>事故</text>
          <text x={128} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={58} fill={KRP.white}>50%</text>
          {/* 事故側の小さな図: 煙ひとすじ */}
          <path d={`M 120 118 C ${132 + Math.sin(f / 7) * 3} 102 ${114 + Math.sin(f / 9) * 3} 90 126 74`}
            fill="none" stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" opacity={0.9} />
        </g>
        {/* 針 (真上で震える) + 釣り合いおもり */}
        <g transform={`rotate(${needle})`}>
          <line x1={0} y1={60} x2={0} y2={-236} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
          <polygon points="0,-236 -14,-196 14,-196" fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={0} cy={60} r={16} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        </g>
        <circle cx={0} cy={0} r={20} fill={C.ironDark} stroke={C.ink} strokeWidth={5} />
        {/* 震えの強調線 */}
        <g stroke={KRP.red} strokeWidth={4} strokeLinecap="round" opacity={0.6 + Math.sin(f / 2.4) * 0.3}>
          <path d="M -44 -250 Q -52 -262 -46 -274" fill="none" />
          <path d="M 44 -250 Q 52 -262 46 -274" fill="none" />
        </g>
        {/* ガラスの照り */}
        <path d="M -190 -150 A 240 240 0 0 1 -40 -240" fill="none" stroke={KRP.white}
          strokeWidth={12} strokeLinecap="round" opacity={0.4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #95 とはいえ効果は絶大で、客席の暗闇は、各国の劇場へ広がっていきます。
// 格: 並 / seed 1130
// 絵: 欧州の地図。劇場の明かりの点が、バイロイトから波紋状にぱた、ぱた、と消えていく
// どこ: 劇場事務室の机に広げた欧州の古地図 (羅針図・デバイダー・画鋲つき)
// 演出: バイロイトの星印から波紋が広がり 各都市の劇場ランプが「ぱた ぱた」と灰色に落ちる
// 動き: 波紋リング拡大 / ランプは距離順に seg で消灯 (消える瞬間に小さな煙)
const Sg095: React.FC<{ f: number }> = ({ f }) => {
  // 地図の窓 (経度 -25〜45・緯度 35〜63)。緯度で横をちぢめるので形がゆがまない
  const M95 = makeHeimen({
    lonMin: -25, lonMax: 45, latMin: 35, latMax: 63,
    x0: 140, y0: 100, w: 1640, h: 740,
  });
  // バイロイト (波紋の中心)。本当の経度・緯度から出す
  const BX = M95.x(11.58), BY = M95.y(49.95);
  // 各都市の劇場 (経度, 緯度)
  const cities: Array<[number, number]> = ([
    [11.58, 48.14],  // ミュンヘン
    [16.37, 48.21],  // ウィーン
    [13.40, 52.52],  // ベルリン
    [14.42, 50.09],  // プラハ
    [12.37, 51.34],  // ライプツィヒ
    [2.35, 48.86],   // パリ
    [-0.13, 51.51],  // ロンドン
    [9.19, 45.46],   // ミラノ
    [19.04, 47.50],  // ブダペスト
    [4.84, 45.76],   // リヨン
    [21.01, 52.23],  // ワルシャワ
    [-0.58, 44.84],  // ボルドー
  ] as Array<[number, number]>).map(([lo, la]) => [M95.x(lo), M95.y(la)] as [number, number]);
  return (
    <Frame f={f} seed={1130} bg="#4A3C30">
      {/* 机の木目 (地図の下地) */}
      <rect x={0} y={0} width={W} height={H} fill="#4A3C30" />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={`wd${i}`}
          d={`M 0 ${80 + i * 140} Q ${500 + rnd(31, i) * 300} ${60 + i * 140} 1920 ${95 + i * 140}`}
          fill="none" stroke="#3A2E24" strokeWidth={5} opacity={0.6} />
      ))}
      {/* デバイダー (机の隅) */}
      <g transform="translate(140 870) rotate(-18)" opacity={0.9}>
        <line x1={0} y1={0} x2={-46} y2={110} stroke="#8A8E96" strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={46} y2={110} stroke="#8A8E96" strokeWidth={9} strokeLinecap="round" />
        <circle cx={0} cy={0} r={14} fill={C.dressGold} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 地図の紙 (羊皮紙) */}
      <g transform="translate(960 470) rotate(-1)">
        <rect x={-840} y={-385} width={1680} height={770} rx={6}
          fill="#EFE3C4" stroke={C.ink} strokeWidth={7} />
        <rect x={-818} y={-363} width={1636} height={726}
          fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        {/* 紙の折りじわ */}
        <line x1={-280} y1={-385} x2={-300} y2={385} stroke={C.ink} strokeWidth={2.5} opacity={0.22} />
        <line x1={330} y1={-385} x2={345} y2={385} stroke={C.ink} strokeWidth={2.5} opacity={0.22} />
        {/* めくれた角 */}
        <path d="M 840 300 L 840 385 L 755 385 Q 815 355 840 300 Z" fill="#DECFA8" stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 画鋲 4隅 */}
      {([[150, 105], [1775, 75], [135, 835], [1790, 820]] as Array<[number, number]>).map(([px, py], i) => (
        <g key={`pin${i}`} transform={`translate(${px} ${py})`}>
          <circle cx={0} cy={0} r={14} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <circle cx={-4} cy={-4} r={4} fill={KRP.white} opacity={0.7} />
        </g>
      ))}
      {/* 地図のクリップ */}
      <clipPath id="sg95map">
        <rect x={140} y={100} width={1640} height={740} />
      </clipPath>
      <g clipPath="url(#sg95map)">
        {/* 海 */}
        <rect x={140} y={100} width={1640} height={740} fill={C.mapSea} opacity={0.55} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={`wv${i}`}
            d={`M ${170 + rnd(77, i) * 300} ${150 + i * 80} q 30 -12 60 0 q 30 12 60 0`}
            fill="none" stroke="#7FA0B8" strokeWidth={3.5} opacity={0.6} />
        ))}
        {/* 陸地 (本当の海岸線を、正距円筒図法で起こしたもの) */}
        <HeimenRiku m={M95} land={C.mapLand} ink={C.ink} width={6} />
        {/* 経緯線 (10度・5度ごと) */}
        <g fill="none" stroke={C.ink} strokeWidth={2} opacity={0.2}>
          {[-20, -10, 0, 10, 20, 30, 40].map((lo) => (
            <line key={`gl${lo}`} x1={M95.x(lo)} y1={100} x2={M95.x(lo)} y2={840} />
          ))}
          {[35, 40, 45, 50, 55, 60].map((la) => (
            <line key={`gt${la}`} x1={140} y1={M95.y(la)} x2={1780} y2={M95.y(la)} />
          ))}
        </g>
        {/* 山脈のしるし (アルプス。本当の位置) */}
        {[0, 1, 2, 3].map((i) => {
          const mx = M95.x(6.4 + i * 2.1), my = M95.y(46.2);
          return (
            <path key={`mt${i}`} d={`M ${mx - 20} ${my} l 20 -26 l 20 26`}
              fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
          );
        })}
        {/* 波紋 (バイロイトから広がる) */}
        {[0, 1, 2].map((k) => {
          const rr = ((f * 10 + k * 150) % 460) + 30;
          const op = Math.max(0, 0.55 - rr / 520);
          return <circle key={`rp${k}`} cx={BX} cy={BY} r={rr} fill="none"
            stroke={KRP.orange} strokeWidth={6} opacity={op} strokeDasharray="26 18" />;
        })}
        {/* 各都市のランプ: 距離順に消える */}
        {cities.map(([cx2, cy2], i) => {
          const d = Math.hypot(cx2 - BX, cy2 - BY);
          const off = seg(f, 5 + d * 0.034, 11 + d * 0.034);
          const lit = 1 - off;
          return (
            <g key={`ct${i}`} transform={`translate(${cx2} ${cy2})`}>
              {lit > 0.05 && <circle cx={0} cy={0} r={26} fill={SGP.lampGold} opacity={0.4 * lit} />}
              <circle cx={0} cy={0} r={13}
                fill={mix(SGP.lampGold, SGP.lampOff, off)} stroke={C.ink} strokeWidth={4.5} />
              {/* 炎 (点いている間だけ) */}
              {lit > 0.05 && (
                <path d={`M 0 ${-9 + Math.sin(f / 4 + i) * 1.5} C -5 -15 -4 -21 0 -25 C 4 -21 5 -15 0 ${-9 + Math.sin(f / 4 + i) * 1.5} Z`}
                  fill={SGP.lampGold} stroke={C.ink} strokeWidth={2.5} opacity={lit} />
              )}
              {/* 消えた瞬間の煙 */}
              {off > 0.1 && off < 0.95 && (
                <path d={`M 0 -12 Q ${6} ${-24 - off * 14} -3 ${-34 - off * 18}`}
                  fill="none" stroke={SGP.lampOff} strokeWidth={4} strokeLinecap="round" opacity={1 - off} />
              )}
            </g>
          );
        })}
        {/* バイロイト本体 (星印。ここは最初から暗い=源) */}
        <g transform={`translate(${BX} ${BY})`}>
          <circle cx={0} cy={0} r={34} fill={C.night} stroke={C.ink} strokeWidth={6} />
          <path d="M 0 -20 L 6 -6 L 21 -6 L 9 3 L 14 18 L 0 9 L -14 18 L -9 3 L -21 -6 L -6 -6 Z"
            fill={SGP.lampOff} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 羅針図 */}
      <g transform="translate(1660 215)" opacity={0.95}>
        <circle cx={0} cy={0} r={62} fill="#EFE3C4" stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={46} fill="none" stroke={C.ink} strokeWidth={3} />
        <path d="M 0 -46 L 10 0 L 0 46 L -10 0 Z" fill={KRP.red} stroke={C.ink} strokeWidth={3}
          transform={`rotate(${Math.sin(f / 9) * 6})`} />
        <text x={0} y={-72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>N</text>
      </g>
      {/* バイロイトの札 (海の上に置き 線で指す) */}
      <TagPlate x={400} y={760} text="バイロイト" size={30} t={seg(f, 2, 10)} fill={KRP.white} />
      <line x1={490} y1={736} x2={BX - 18} y2={BY + 26} stroke={C.ink} strokeWidth={4} opacity={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// 都市の名札に添える小旗。1890年代の旗にそろえる
// (ドイツは帝国なので黒白赤。いまの黒赤金ではない。オーストリアは赤白赤)
const KuniBata: React.FC<{ x: number; y: number; kuni: "at" | "fr" | "uk" | "de" }> =
  ({ x, y, kuni }) => {
    const w = 58, h = 40;
    const yoko = (a: string, b: string, c: string) => (
      <>
        <rect x={-w / 2} y={-h / 2} width={w} height={h / 3} fill={a} />
        <rect x={-w / 2} y={-h / 2 + h / 3} width={w} height={h / 3} fill={b} />
        <rect x={-w / 2} y={-h / 2 + (h * 2) / 3} width={w} height={h / 3} fill={c} />
      </>
    );
    return (
      <g transform={`translate(${x} ${y})`}>
        {kuni === "at" && yoko("#C8102E", "#F4F1E8", "#C8102E")}
        {kuni === "de" && yoko("#2B2B2B", "#F4F1E8", "#C8102E")}
        {kuni === "fr" && (
          <>
            <rect x={-w / 2} y={-h / 2} width={w / 3} height={h} fill="#28418C" />
            <rect x={-w / 6} y={-h / 2} width={w / 3} height={h} fill="#F4F1E8" />
            <rect x={w / 6} y={-h / 2} width={w / 3} height={h} fill="#C8102E" />
          </>
        )}
        {kuni === "uk" && (
          <>
            {/* 斜めの筋が旗の外へ出ないように、旗の四角で切り抜く */}
            <defs>
              <clipPath id="ukclip96">
                <rect x={-w / 2} y={-h / 2} width={w} height={h} />
              </clipPath>
            </defs>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#28418C" />
            <g clipPath="url(#ukclip96)">
              <path d={`M ${-w / 2} ${-h / 2} L ${w / 2} ${h / 2} M ${w / 2} ${-h / 2} L ${-w / 2} ${h / 2}`}
                stroke="#F4F1E8" strokeWidth={9} />
              <path d={`M ${-w / 2} ${-h / 2} L ${w / 2} ${h / 2} M ${w / 2} ${-h / 2} L ${-w / 2} ${h / 2}`}
                stroke="#C8102E" strokeWidth={4} />
            </g>
            <path d={`M 0 ${-h / 2} L 0 ${h / 2} M ${-w / 2} 0 L ${w / 2} 0`}
              stroke="#F4F1E8" strokeWidth={13} />
            <path d={`M 0 ${-h / 2} L 0 ${h / 2} M ${-w / 2} 0 L ${w / 2} 0`}
              stroke="#C8102E" strokeWidth={7} />
          </>
        )}
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
    );
  };

// #96 1890年代までには、ヨーロッパの主要な都市で、当たり前になりました。
// 格: 図 / seed 1131
// 絵: 年表に「1890年代: 標準装備」の判子。各都市の名札が暗色に揃う
// どこ: 劇場ロビーの壁の掲示板。貼り紙の年表に判子が押される
// 演出: 年表の帯が右へ伸び 右端に朱印「1890年代 標準装備」がドンと落ちる
// 動き: 帯の伸び seg(2,20) / 判子の腕が降りて朱印 pop / 都市の名札が順に暗色へ
const Sg096: React.FC<{ f: number }> = ({ f }) => {
  const grow = seg(f, 2, 20);               // 年表の帯
  const stampDown = seg(f, 14, 20);         // 判子の腕が降りる
  const inkT = pop(seg(f, 19, 26));         // 朱印の出現
  const lift = seg(f, 26, 32);              // 判子が持ち上がる
  return (
    <Frame f={f} seed={1131} bg="#55604E">
      {/* ロビーの壁 */}
      <rect x={0} y={0} width={W} height={H} fill="#55604E" />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`wl${i}`} x1={0} y1={120 + i * 150} x2={1920} y2={116 + i * 150}
          stroke="#47523F" strokeWidth={4} opacity={0.6} />
      ))}
      {/* 腰板 */}
      <rect x={0} y={880} width={W} height={200} fill="#5E4A38" stroke={C.ink} strokeWidth={6} />
      <line x1={0} y1={905} x2={1920} y2={905} stroke={C.ink} strokeWidth={4} opacity={0.5} />
      {/* 吊りランプ (板を照らす) */}
      <g transform="translate(250 150)">
        <line x1={0} y1={-150} x2={0} y2={0} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={44} r={90} fill={SGP.lampGold} opacity={0.18} />
        <path d="M -34 0 L 34 0 L 22 52 L -22 52 Z" fill={C.brassPipe} stroke={C.ink} strokeWidth={5} />
        <path d={`M 0 ${30 + Math.sin(f / 5) * 2} C -6 22 -5 14 0 10 C 5 14 6 22 0 ${30 + Math.sin(f / 5) * 2} Z`}
          fill={SGP.lampGold} stroke={C.ink} strokeWidth={3} />
      </g>
      {/* 掲示板の枠 */}
      <g transform="translate(1000 470)">
        <rect x={-760} y={-310} width={1520} height={620} rx={14}
          fill="#6B5138" stroke={C.ink} strokeWidth={8} />
        <rect x={-726} y={-276} width={1452} height={552} rx={8}
          fill="#8A6B47" stroke={C.ink} strokeWidth={5} />
        {/* 貼り紙 (年表の紙) */}
        <g transform="rotate(-0.6)">
          <rect x={-680} y={-230} width={1360} height={300} rx={6}
            fill="#F2E9CE" stroke={C.ink} strokeWidth={6} />
          {/* 画鋲 */}
          {([[-655, -205], [655, -210], [-660, 45], [658, 42]] as Array<[number, number]>).map(([px, py], i) => (
            <circle key={`tk${i}`} cx={px} cy={py} r={11} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          ))}
          {/* 年表の帯 */}
          <line x1={-600} y1={-60} x2={600} y2={-60} stroke={C.ink} strokeWidth={6} />
          {[-600, -360, -120, 120, 360, 600].map((tx, i) => (
            <line key={`tc${i}`} x1={tx} y1={-78} x2={tx} y2={-42} stroke={C.ink} strokeWidth={5} />
          ))}
          <rect x={-600} y={-74} width={1200 * grow} height={28} rx={6}
            fill={mix(SGP.lampGold, C.night, grow * 0.75)} stroke="none" opacity={0.85} />
          {/* 帯の先頭の矢じり */}
          {grow > 0.03 && grow < 1 && (
            <polygon points="26,0 -10,-16 -10,16" fill={C.night}
              transform={`translate(${-600 + 1200 * grow} ${-60})`} />
          )}
          {/* 帯の左端 = 明るい時代のランプ / 右端へ行くほど暗い */}
          <g transform="translate(-600 -130)">
            <circle cx={0} cy={0} r={15} fill={SGP.lampGold} stroke={C.ink} strokeWidth={4} />
            <path d="M 0 -11 C -5 -17 -4 -23 0 -27 C 4 -23 5 -17 0 -11 Z"
              fill={SGP.lampGold} stroke={C.ink} strokeWidth={2.5} />
          </g>
          <g transform="translate(405 -130)" opacity={seg(f, 8, 16)}>
            <circle cx={0} cy={0} r={15} fill={SGP.lampOff} stroke={C.ink} strokeWidth={4} />
            <line x1={-6} y1={-6} x2={6} y2={6} stroke={C.ink} strokeWidth={3.5} />
          </g>
          {/* 朱印 (右端に落ちる) */}
          {inkT > 0 && (
            <g transform={`translate(405 -55) scale(${inkT}) rotate(-7)`}>
              <circle cx={0} cy={0} r={118} fill="none" stroke={KRP.red} strokeWidth={9} />
              <circle cx={0} cy={0} r={100} fill="none" stroke={KRP.red} strokeWidth={4} />
              <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={38} fill={KRP.red}>1890年代</text>
              <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={36} fill={KRP.red}>標準装備</text>
            </g>
          )}
        </g>
        {/* 都市の名札 (順に暗色へ揃う) */}
        {([["ウィーン", "at"], ["パリ", "fr"], ["ロンドン", "uk"], ["ベルリン", "de"]] as const)
          .map(([nm, kuni], i) => {
            const dk = seg(f, 20 + i * 5, 26 + i * 5);
            const px = -510 + i * 340;
            return (
              <g key={nm} transform={`translate(${px} 200)`}>
                <rect x={-150} y={-44} width={300} height={88} rx={10}
                  fill={mix("#C9A878", "#3A4254", dk)} stroke={C.ink} strokeWidth={6} />
                {/* 字は少し左へ寄せ、空いた右側に小旗を立てる */}
                <text x={-26} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                  fontSize={36} fill={mix("#3A2E20", "#E8E2D0", dk)}>{nm}</text>
                <KuniBata x={106} y={0} kuni={kuni} />
                {/* 暗くなったら消灯ランプの小印 (旗とぶつからない左上へ) */}
                {dk > 0.6 && (
                  <g transform="translate(-124 -26)" opacity={(dk - 0.6) / 0.4}>
                    <circle cx={0} cy={0} r={9} fill={SGP.lampOff} stroke={C.ink} strokeWidth={3} />
                    <line x1={-4} y1={-4} x2={4} y2={4} stroke={C.ink} strokeWidth={2.5} />
                  </g>
                )}
              </g>
            );
          })}
      </g>
      {/* 判子の腕 (上から降りて持ち上がる) */}
      {stampDown > 0 && (
        <g transform={`translate(1405 ${-230 + stampDown * 480 - lift * 300}) rotate(-7)`}>
          <rect x={-60} y={100} width={120} height={120} rx={14}
            fill="#8A4A3A" stroke={C.ink} strokeWidth={6} />
          <rect x={-26} y={-30} width={52} height={136} rx={20}
            fill="#B07050" stroke={C.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-34} rx={40} ry={22} fill="#8A4A3A" stroke={C.ink} strokeWidth={6} />
        </g>
      )}
      {/* 押した衝撃線 */}
      {inkT > 0.3 && lift < 0.6 && (
        <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={0.8 - lift}>
          <line x1={1245} y1={330} x2={1210} y2={295} />
          <line x1={1570} y1={330} x2={1605} y2={295} />
          <line x1={1245} y1={480} x2={1210} y2={515} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #97 ヨーロッパのホールで、最初の明かりが消えた。
// 格: 山 / seed 1132
// 絵: **`Danmen` 状態B。リキャップ②**。5灯のうち欧州側の2灯がふっと消える。出入口⇄はまだ生きている。手配書②ワーグナーに御用印
// どこ: 夜の詰所の壁。左に劇場断面図 (状態B) 右の柱に手配書②ワーグナー
// 演出: リキャップ②。左2灯の名残の光がふっと薄れ 手配書に「御用」の朱印が落ちる
// 動き: 名残の光 1-seg(8,22) で消える / 手配書 t=seg(4,14) / 御用 goyoT=seg(22,36)
const Sg097: React.FC<{ f: number }> = ({ f }) => {
  const fade = 1 - seg(f, 8, 22);           // 消えた2灯の名残の光
  const DS = 0.82, DX = 740, DY = 520;      // 断面図の置き場
  // 断面図のランプ (local x {-160,55}) → global
  const lampGX = [-160, 55].map((lx) => DX + lx * DS);
  const lampGY = DY + -138 * DS;
  return (
    <Frame f={f} seed={1132} bg="#202838" dark>
      {/* 夜の壁 (石積み) */}
      <rect x={0} y={0} width={W} height={H} fill="#202838" />
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`st${i}`} x1={0} y1={140 + i * 190} x2={1920} y2={135 + i * 190}
          stroke="#1A2130" strokeWidth={5} opacity={0.8} />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`sv${i}`} x1={120 + i * 160 + (i % 2) * 70} y1={140 + (i % 5) * 190}
          x2={120 + i * 160 + (i % 2) * 70} y2={135 + (i % 5 + 1) * 190}
          stroke="#1A2130" strokeWidth={4} opacity={0.7} />
      ))}
      {/* 床 */}
      <rect x={0} y={920} width={W} height={160} fill={C.nightDeep} stroke={C.ink} strokeWidth={5} />
      {/* 月明かりの窓 */}
      <g transform="translate(220 190)">
        <rect x={-90} y={-110} width={180} height={220} rx={10}
          fill="#31405C" stroke={C.ink} strokeWidth={6} />
        <line x1={0} y1={-110} x2={0} y2={110} stroke={C.ink} strokeWidth={5} />
        <line x1={-90} y1={0} x2={90} y2={0} stroke={C.ink} strokeWidth={5} />
        <circle cx={34} cy={-44} r={26} fill="#E8E2C8" opacity={0.9} />
      </g>
      {/* 断面図 (状態B) — 左2灯が消えている */}
      <Danmen f={f} state="B" x={DX} y={DY} s={DS} t={seg(f, 0, 16) * 0.6 + 0.4} />
      {/* 消えた2灯の名残の光 (ふっと薄れる) */}
      {fade > 0.02 && lampGX.map((gx, i) => (
        <g key={`gl${i}`} opacity={fade}>
          <circle cx={gx} cy={lampGY} r={46} fill={SGP.lampGold} opacity={0.3} />
          <circle cx={gx} cy={lampGY} r={22} fill={SGP.lampGold} opacity={0.45} />
          <path d={`M ${gx} ${lampGY - 28} Q ${gx + 8} ${lampGY - 46} ${gx - 4} ${lampGY - 60}`}
            fill="none" stroke={SGP.lampOff} strokeWidth={4} strokeLinecap="round"
            opacity={1 - fade} />
        </g>
      ))}
      {/* 手配書の柱 */}
      <g transform="translate(1650 500)">
        <rect x={-110} y={-500} width={220} height={1000} fill="#3A3228" stroke={C.ink} strokeWidth={7} />
        <path d="M -90 -440 Q -70 -200 -92 100 M 88 -380 Q 70 -60 90 240"
          fill="none" stroke="#2A241C" strokeWidth={4} opacity={0.8} />
        {/* 釘と縄 */}
        <circle cx={0} cy={-330} r={9} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <path d={`M 0 -330 Q ${-14 + Math.sin(f / 8) * 3} -290 -8 -258`}
          fill="none" stroke="#9A8560" strokeWidth={5} />
      </g>
      {/* 手配書②ワーグナー + 御用 */}
      <Tehaisho f={f} who={2} x={1650} y={420} s={0.78}
        t={seg(f, 4, 14)} goyoT={seg(f, 22, 36)} />
      {/* 柱の足元の提灯 (詰所の明かり) */}
      <g transform="translate(1480 850)">
        <line x1={0} y1={-90} x2={0} y2={-52} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={64} fill={SGP.lampGold} opacity={0.14} />
        <ellipse cx={0} cy={0} rx={40} ry={50} fill="#E8B870" stroke={C.ink} strokeWidth={6} />
        <line x1={-38} y1={-14} x2={38} y2={-14} stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
        <line x1={-40} y1={6} x2={40} y2={6} stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
        <path d={`M 0 ${12 + Math.sin(f / 4.5) * 2} C -6 4 -5 -4 0 -9 C 5 -4 6 4 0 ${12 + Math.sin(f / 4.5) * 2} Z`}
          fill={SGP.lampGold} stroke={C.ink} strokeWidth={3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #98 客席から、おしゃべりと弁当が消えるのは、時間の問題でした。
// 格: 並 / seed 1133
// 絵: 章結び寄り。暗い客席の隅で、擬人化された弁当包みとおしゃべりの音符が、肩を落として退場口へとぼとぼ
// どこ: 暗転後の客席の隅。左に退場口 (戸が細く開いて明かりが差す)
// 演出: 擬人化した弁当包みと八分音符が 肩を落として出口へとぼとぼ歩く
// 動き: walkT=seg(0,42) で左へ / 足は sin で交互 / ため息の小さな湯気
const Sg098: React.FC<{ f: number }> = ({ f }) => {
  const walkT = seg(f, 0, 42);
  const bx = 880 - walkT * 260;               // 弁当の位置
  const bob = Math.abs(Math.sin(f / 4)) * 7;  // 歩きの上下
  const legA = Math.sin(f / 4) * 16;          // 足の振り
  return (
    <Frame f={f} seed={1133} bg={C.night} dark>
      {/* 暗い客席の壁 */}
      <rect x={0} y={0} width={W} height={H} fill={C.night} />
      <rect x={0} y={0} width={W} height={340} fill={C.nightDeep} />
      <path d="M 0 340 Q 960 300 1920 340" fill="none" stroke={C.ink} strokeWidth={5} opacity={0.6} />
      {/* 奥の舞台の気配 (右上にかすかな幕) */}
      <g opacity={0.5}>
        <rect x={1430} y={60} width={490} height={420} fill="#2E3648" stroke={C.ink} strokeWidth={5} />
        <path d="M 1430 60 Q 1550 220 1480 480 M 1920 60 Q 1800 230 1870 480"
          fill="none" stroke="#242B3A" strokeWidth={10} />
        <ellipse cx={1675} cy={470} rx={190} ry={26} fill={SGP.lampGold} opacity={0.08} />
      </g>
      {/* 消えた壁ランプ */}
      {[760, 1180].map((wx, i) => (
        <g key={`wl${i}`} transform={`translate(${wx} 300)`} opacity={0.9}>
          <rect x={-10} y={26} width={20} height={34} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={6} r={20} fill={SGP.lampOff} stroke={C.ink} strokeWidth={5} />
          <line x1={-8} y1={-2} x2={8} y2={14} stroke={C.ink} strokeWidth={3.5} />
        </g>
      ))}
      {/* 客席 (空の座席の背 2列) */}
      {[0, 1].map((row) => (
        <g key={`row${row}`}>
          {Array.from({ length: 6 }).map((_, i) => {
            const sx = 980 + i * 165 - row * 70;
            const sy = 560 + row * 150;
            const sc = 1 + row * 0.22;
            return (
              <g key={`seat${row}-${i}`} transform={`translate(${sx} ${sy}) scale(${sc})`}>
                <rect x={-58} y={-70} width={116} height={96} rx={16}
                  fill={C.nightSeat} stroke={C.ink} strokeWidth={5} />
                <rect x={-58} y={10} width={116} height={22} rx={8}
                  fill="#2E3444" stroke={C.ink} strokeWidth={4} />
              </g>
            );
          })}
        </g>
      ))}
      {/* 床板 */}
      <rect x={0} y={760} width={W} height={320} fill="#2A2F3E" stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={`fb${i}`} d={`M 0 ${810 + i * 55} L 1920 ${800 + i * 55}`}
          stroke={C.ink} strokeWidth={3} opacity={0.35} fill="none" />
      ))}
      {/* 退場口 (細く開いた戸と差す明かり) */}
      <g transform="translate(230 560)">
        {/* 明かりのくさび */}
        <path d={`M 60 -240 L ${430 + Math.sin(f / 7) * 14} 400 L 60 400 Z`}
          fill={C.doorLight} opacity={0.16} />
        <rect x={-130} y={-260} width={260} height={520} rx={8}
          fill="#171D2A" stroke={C.ink} strokeWidth={7} />
        {/* 開いた戸 */}
        <path d="M 60 -250 L 130 -232 L 130 268 L 60 250 Z"
          fill="#4A3C2E" stroke={C.ink} strokeWidth={6} />
        <circle cx={78} cy={16} r={7} fill={C.brassPipe} stroke={C.ink} strokeWidth={3} />
        {/* 戸口からこぼれる光の帯 */}
        <rect x={40} y={-250} width={22} height={500} fill={C.doorLight} opacity={0.75} />
        {/* 床への光だまり */}
        <ellipse cx={160} cy={290} rx={210} ry={44} fill={C.doorLight} opacity={0.14} />
      </g>
      {/* 出口の標識 */}
      <g transform="translate(230 240)">
        <rect x={-92} y={-40} width={184} height={80} rx={10}
          fill="#2E4A3A" stroke={C.ink} strokeWidth={6} />
        <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={44} fill={C.doorLight}>出口</text>
      </g>
      {/* 擬人化おしゃべりの音符 (弁当のすこし後ろを跳ねずに俯いて歩く) */}
      <g transform={`translate(${bx + 185} ${700 - bob * 0.6}) rotate(${-6 + Math.sin(f / 6) * 2})`}>
        <ellipse cx={0} cy={86} rx={46} ry={10} fill="#141924" opacity={0.7} />
        {/* 符頭 = 顔 */}
        <ellipse cx={0} cy={30} rx={40} ry={32} fill="#8A93A8" stroke={C.ink} strokeWidth={6}
          transform="rotate(-18)" />
        {/* 符幹とうなだれた旗 */}
        <line x1={34} y1={16} x2={44} y2={-96} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        <path d={`M 44 -96 Q 96 -72 ${64 + Math.sin(f / 7) * 4} ${-20 + Math.sin(f / 7) * 4}`}
          fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        {/* 伏し目 */}
        <path d="M -18 24 Q -10 30 -2 24" fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
        <path d="M 8 30 Q 16 36 24 30" fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
        {/* 足 */}
        <line x1={-12} y1={56} x2={-12 - legA * 0.7} y2={84} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={12} y1={56} x2={12 + legA * 0.7} y2={84} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      </g>
      {/* 擬人化弁当包み (肩を落としてとぼとぼ) */}
      <g transform={`translate(${bx} ${690 - bob})`}>
        <ellipse cx={0} cy={100} rx={74} ry={13} fill="#141924" opacity={0.7} />
        {/* 包みの体 */}
        <path d="M -78 60 Q -84 -10 -30 -34 Q 0 -46 30 -34 Q 84 -10 78 60 Q 40 76 0 76 Q -40 76 -78 60 Z"
          fill="#A8604E" stroke={C.ink} strokeWidth={7} />
        {/* 布の格子柄 */}
        <path d="M -52 -20 Q -20 60 8 70 M -10 -40 Q 30 20 58 56 M -72 24 Q -10 36 70 28"
          fill="none" stroke="#7E4238" strokeWidth={4} opacity={0.8} />
        {/* 結び目 (うなだれた耳) */}
        <path d={`M -16 -38 Q -40 ${-72 + Math.sin(f / 6) * 3} -56 -52 Q -42 -36 -16 -38 Z`}
          fill="#A8604E" stroke={C.ink} strokeWidth={6} />
        <path d={`M 16 -38 Q 40 ${-70 + Math.sin(f / 6 + 1) * 3} 56 -54 Q 42 -36 16 -38 Z`}
          fill="#A8604E" stroke={C.ink} strokeWidth={6} />
        {/* 伏し目と への字口 */}
        <path d="M -30 8 Q -22 14 -14 8" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M 14 8 Q 22 14 30 8" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M -10 36 Q 0 30 10 36" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        {/* 足 */}
        <line x1={-26} y1={74} x2={-26 + legA} y2={98} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={26} y1={74} x2={26 - legA} y2={98} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        {/* ため息 */}
        <path d={`M -58 -6 Q ${-76 - Math.sin(f / 8) * 4} -14 -70 -28`}
          fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round"
          opacity={0.35 + Math.sin(f / 8) * 0.15} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_087: (f) => <Sg087 f={f} />,
  sg_088: (f) => <Sg088 f={f} />,
  sg_089: (f) => <Sg089 f={f} />,
  sg_090: (f) => <Sg090 f={f} />,
  sg_091: (f) => <Sg091 f={f} />,
  sg_092: (f) => <Sg092 f={f} />,
  sg_093: (f) => <Sg093 f={f} />,
  sg_094: (f) => <Sg094 f={f} />,
  sg_095: (f) => <Sg095 f={f} />,
  sg_096: (f) => <Sg096 f={f} />,
  sg_097: (f) => <Sg097 f={f} />,
  sg_098: (f) => <Sg098 f={f} />,
};

export const S_B4_MOTIFS: string[] = [
  "sg_087", // #87
  "sg_088", // #88
  "sg_089", // #89
  "sg_090", // #90
  "sg_091", // #91
  "sg_092", // #92
  "sg_093", // #93
  "sg_094", // #94
  "sg_095", // #95
  "sg_096", // #96
  "sg_097", // #97
  "sg_098", // #98
];

export const saigoB4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
