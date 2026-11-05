// 「なぜ高層ビルは生まれたのか」: 第6章「高いほど、安い部屋だった。」5 (ポンプが止まる〜五本の柱)
// 担当範囲: 台本 docs/koso-script-v7.txt の 262〜272行目 (文#261〜#271・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb6_ で始める。WobbleDefs の seed はこのファイルでは 894〜904 を使う。
// 設計書: docs/koso-ch6-design.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層-7)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。

import React from "react";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, Pillar, Tower, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  stone: "#E0D6C2",
  stoneDark: "#B6A88E",
  zinc: "#A9B0B4",
  zincDark: "#7B8488",
  amber: "#C9A06A",
  candle: "#F0C971",
  night: "#2B3A4A",
  nightPale: "#4C6076",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  rain: "#8FA3B2",
  mudWater: "#6E7257",
  emerGreen: "#4FA06A",
  dark: "#39414B",
};

// ===================================================================
// このファイルだけのローカル部品 (同じ物が2回以上出る物だけ切り出す)
// ===================================================================

// 柱の定位置 (KosoPillars の PILLAR_X と同じ値。装置に合わせて札を置くため)
const PX = { hone: 380, hako: 670, mizu: 960, akari: 1250, kuuki: 1540 };
const P_TOP = 552;
const P_BOT = 824;

/** 雨 (武蔵小杉パートの空気。f で落ちる) */
const Kb6eRain: React.FC<{ f: number; n?: number; y1?: number; op?: number }> = ({
  f, n = 56, y1 = H, op = 0.42,
}) => (
  <g stroke={C.rain} strokeWidth={3} strokeLinecap="round" opacity={op}>
    {Array.from({ length: n }, (_, i) => {
      const sp = 9 + rnd(i * 3.1) * 7;
      const x = rnd(i * 1.7) * (W + 160) - 80;
      const y = (rnd(i * 5.3) * y1 + f * sp) % y1;
      const L = 24 + rnd(i * 9.1) * 30;
      return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + L} />;
    })}
  </g>
);

/** コンクリートの階段1本 (#263 と #264 で同じ形を使う) */
const Kb6eStair: React.FC<{
  x0: number; y0: number; n: number; tread?: number; riser?: number;
  face: string; faceDark: string; nose: string; rail?: string; op?: number;
}> = ({ x0, y0, n, tread = 126, riser = 66, face, faceDark, nose, rail, op = 1 }) => {
  const d: string[] = [`M ${x0} ${y0}`];
  for (let i = 0; i < n; i++) {
    const yr = y0 - (i + 1) * riser;
    d.push(`L ${x0 + i * tread} ${yr}`, `L ${x0 + (i + 1) * tread} ${yr}`);
  }
  d.push(`L ${x0 + n * tread} ${y0 + 160}`, `L ${x0} ${y0 + 160}`, "Z");
  return (
    <g opacity={op}>
      <path d={d.join(" ")} fill={face} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: n }, (_, i) => {
        const yr = y0 - (i + 1) * riser;
        const xl = x0 + i * tread;
        return (
          <g key={i}>
            {/* 段鼻 (踏み面の縁) */}
            <rect x={xl} y={yr} width={tread} height={15} fill={nose}
              stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={xl} y={yr + 15} width={tread} height={11} fill={faceDark} opacity={0.5} />
            {/* 蹴込みの骨材 (コンクリートの肌) */}
            {[0, 1, 2, 3, 4].map((k) => (
              <circle key={k}
                cx={xl + 18 + rnd(i * 7 + k * 1.3) * (tread - 36)}
                cy={yr + 34 + rnd(i * 3.7 + k * 5) * (riser - 44)}
                r={3 + rnd(i + k * 2.2) * 3} fill={faceDark} opacity={0.45} />
            ))}
            {/* 滑り止めの溝 */}
            <line x1={xl + 10} y1={yr + 9} x2={xl + tread - 10} y2={yr + 9}
              stroke={KRP.ink} strokeWidth={2.6} opacity={0.5} />
          </g>
        );
      })}
      {/* 手すり (親柱つき) */}
      {rail && (
        <g>
          {Array.from({ length: n }, (_, i) => {
            const xp = x0 + i * tread + tread / 2;
            return (
              <line key={i} x1={xp} y1={y0 - (i + 1) * riser}
                x2={xp} y2={y0 - 196 - (i + 0.5) * riser}
                stroke={rail} strokeWidth={7} strokeLinecap="round" />
            );
          })}
          <line x1={x0 + tread / 2 - 24} y1={y0 - 196 - 0.5 * riser + riser * 0.19}
            x2={x0 + (n - 1) * tread + tread / 2 + 24} y2={y0 - 196 - (n - 0.5) * riser - riser * 0.19}
            stroke={rail} strokeWidth={15} strokeLinecap="round" />
          <line x1={x0 + tread / 2 - 24} y1={y0 - 196 - 0.5 * riser + riser * 0.19 - 5}
            x2={x0 + (n - 1) * tread + tread / 2 + 24} y2={y0 - 196 - (n - 0.5) * riser - riser * 0.19 - 5}
            stroke={KRP.white} strokeWidth={3.5} strokeLinecap="round" opacity={0.5} />
        </g>
      )}
    </g>
  );
};

/** 水の入ったペットボトル2本 (#263 #264 の現代の住人が抱える物) */
const Kb6ePet: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 段ボールの受け */}
    <path d="M -72 10 L 72 10 L 62 74 L -62 74 Z" fill={BP.woodLight}
      stroke={KRP.ink} strokeWidth={5} />
    <line x1={-64} y1={34} x2={64} y2={34} stroke={BP.woodDark} strokeWidth={4} opacity={0.6} />
    {[-36, 36].map((dx, i) => {
      const sway = Math.sin(f / 9 + i * 1.7) * 2.4;
      return (
        <g key={i} transform={`translate(${dx} 0) rotate(${sway})`}>
          {/* 胴 */}
          <rect x={-29} y={-104} width={58} height={118} rx={13}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {/* 中の水 */}
          <rect x={-22} y={-66} width={44} height={74} rx={9} fill={KPP.mizu} opacity={0.75} />
          <path d={`M -22 ${-66 + Math.sin(f / 7 + i) * 2} q 11 -6 22 0 q 11 6 22 0 l 0 10 l -44 0 Z`}
            fill={KPP.mizuDark} opacity={0.5} />
          {/* リブ */}
          <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.45}>
            <line x1={-29} y1={-44} x2={29} y2={-44} />
            <line x1={-29} y1={-28} x2={29} y2={-28} />
          </g>
          {/* 肩と首 */}
          <path d="M -29 -104 q 10 -22 29 -22 q 19 0 29 22" fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={-13} y={-140} width={26} height={22} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4.5} />
          {/* キャップ */}
          <rect x={-17} y={-156} width={34} height={20} rx={4} fill={KPP.mizuDark}
            stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      );
    })}
  </g>
);

/** 木の手桶 (#264 パリの水運び屋) */
const Kb6ePail: React.FC<{ x: number; y: number; s?: number; f: number; ph?: number }> = ({
  x, y, s = 1, f, ph = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 10 + ph) * 3}) scale(${s})`}>
    {/* 吊り手 */}
    <path d="M -40 -8 q 40 -58 80 0" fill="none" stroke={BP.steelDark} strokeWidth={7} />
    {/* 桶 */}
    <path d="M -46 0 L 46 0 L 36 96 L -36 96 Z" fill={BP.wood}
      stroke={KRP.ink} strokeWidth={5.5} />
    {/* 板の継ぎ目 */}
    <g stroke={BP.woodDark} strokeWidth={3.5} opacity={0.65}>
      <line x1={-22} y1={2} x2={-18} y2={94} />
      <line x1={0} y1={2} x2={0} y2={94} />
      <line x1={22} y1={2} x2={18} y2={94} />
    </g>
    {/* たが (鉄の輪) */}
    <rect x={-45} y={22} width={90} height={9} fill={BP.steel} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-41} y={66} width={82} height={9} fill={BP.steel} stroke={KRP.ink} strokeWidth={3} />
    {/* 水面 */}
    <ellipse cx={0} cy={6} rx={44} ry={11} fill={KPP.mizu} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={Math.sin(f / 8 + ph) * 4} cy={6} rx={30} ry={6} fill={KPP.mizuDark} opacity={0.6} />
  </g>
);

/** 蛇口 (#268) */
const Kb6eFaucet: React.FC<{ x: number; y: number; on: number; f: number }> = ({ x, y, on, f }) => {
  const drip = on > 0.5 ? (f * 7) % 90 : 0;
  return (
    <g>
      {/* 壁の座 */}
      <rect x={x - 26} y={y - 24} width={26} height={48} rx={4}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 胴 */}
      <rect x={x} y={y - 26} width={54} height={52} rx={9}
        fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* ハンドル */}
      <g stroke={KRP.ink} strokeWidth={5}>
        <line x1={x + 27} y1={y - 26} x2={x + 27} y2={y - 52} />
        <ellipse cx={x + 27} cy={y - 58} rx={26} ry={9}
          fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 吐水口 */}
      <path d={`M ${x + 54} ${y - 14} q 40 0 40 34 l 0 18`} fill="none"
        stroke={BP.brass} strokeWidth={20} />
      <path d={`M ${x + 54} ${y - 14} q 40 0 40 34 l 0 18`} fill="none"
        stroke={KRP.ink} strokeWidth={26} opacity={0.18} />
      <rect x={x + 82} y={y + 32} width={24} height={12} rx={3}
        fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 出ている水 / しずく */}
      {on > 0.5 ? (
        <g>
          <rect x={x + 88} y={y + 44} width={12} height={46 + Math.sin(f / 6) * 6}
            fill={KPP.mizu} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
          <ellipse cx={x + 94} cy={y + 100} rx={9 + Math.sin(f / 5) * 2} ry={6}
            fill={KPP.mizuDark} opacity={0.7} />
        </g>
      ) : (
        <circle cx={x + 94} cy={y + 46 + drip * 0.18} r={6} fill={KPP.mizu}
          stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
      )}
    </g>
  );
};

// ----- 日数の升目 (#265 と #266 で座標ごと共通) -----
const DX0 = 152;
const DCW = 96;
const DY = 366;
const DH = 188;
const DN = 17;
const dsX = (d: number) => DX0 + (d - 1) * DCW;

const Kb6eDayGrid: React.FC<{ f: number; solid: number }> = ({ f, solid }) => (
  <g>
    {/* 基準線 */}
    <line x1={DX0 - 30} y1={DY + DH} x2={DX0 + DN * DCW + 46} y2={DY + DH}
      stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
    {Array.from({ length: DN }, (_, i) => {
      const d = i + 1;
      const t = seg(f, 2 + i * 1.5, 11 + i * 1.5);
      const dark = d <= solid;
      const x = dsX(d);
      return (
        <g key={d}>
          <rect x={x} y={DY} width={DCW} height={DH} fill={dark ? C.dark : KRP.white}
            opacity={dark ? 0.14 + 0.46 * t : 1}
            stroke={KRP.ink} strokeWidth={dark ? 5 : 4}
            strokeDasharray={dark ? undefined : "14 12"} />
          {/* 停電の斜線 */}
          {dark && (
            <g opacity={0.45 * t} stroke={C.dark} strokeWidth={4}>
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={x + 6 + k * 26} y1={DY + DH - 8}
                  x2={x + 6 + k * 26 + 52} y2={DY + 8} />
              ))}
            </g>
          )}
          {/* 刻み + 日の数字 */}
          <line x1={x} y1={DY + DH} x2={x} y2={DY + DH + (d % 5 === 0 ? 32 : 17)}
            stroke={KRP.ink} strokeWidth={5} />
          <text x={x + DCW / 2} y={DY + DH + 76} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={d % 5 === 0 ? 44 : 36}
            fill={d % 5 === 0 ? KRP.ink : KRP.grayDark}>{d}</text>
        </g>
      );
    })}
    <line x1={DX0 + DN * DCW} y1={DY + DH} x2={DX0 + DN * DCW} y2={DY + DH + 32}
      stroke={KRP.ink} strokeWidth={5} />
    <text x={DX0 + DN * DCW + 56} y={DY + DH + 76} fontFamily={FONT} fontWeight={900}
      fontSize={40} fill={KRP.ink}>日</text>
  </g>
);

/** 升目を1つ灯す (#265 #266 の印の下地) */
const Kb6eDayLit: React.FC<{ d: number; t: number; f: number; color: string }> = ({ d, t, f, color }) => {
  const ap = clamp01(t);
  if (ap <= 0) return null;
  const pulse = 0.6 + 0.4 * ((Math.sin(f / 7) + 1) / 2);
  return (
    <g opacity={ap}>
      <rect x={dsX(d) - 10} y={DY - 10} width={DCW + 20} height={DH + 20} rx={10}
        fill={color} opacity={0.3 * pulse} />
      <rect x={dsX(d)} y={DY} width={DCW} height={DH} fill={color} opacity={0.55}
        stroke={KRP.ink} strokeWidth={7} />
    </g>
  );
};

/** エレベーターのかごの印 (#265 #266) */
const Kb6eLiftIcon: React.FC<{ x: number; y: number; t: number; f: number; s?: number }> = ({
  x, y, t, f, s = 1,
}) => {
  const ap = pop(clamp01(t));
  if (ap <= 0) return null;
  const cage = Math.sin(f / 11) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${ap * s})`}>
      {/* 昇降路 */}
      <rect x={-72} y={-108} width={144} height={216} rx={7}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {/* 滑車とロープ */}
      <circle cx={0} cy={-92} r={16} fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={0} y1={-92} x2={0} y2={-30 + cage} stroke={KRP.ink} strokeWidth={4} />
      {/* かご */}
      <g transform={`translate(0 ${cage})`}>
        <rect x={-50} y={-30} width={100} height={112} rx={6}
          fill={KPP.hako} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-24} x2={0} y2={76} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <rect x={-38} y={-18} width={76} height={26} rx={3} fill={KPP.akari}
          stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      </g>
      {/* ガイドレール */}
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
        <line x1={-62} y1={-100} x2={-62} y2={100} />
        <line x1={62} y1={-100} x2={62} y2={100} />
      </g>
    </g>
  );
};

/** 電気の印 (稲妻) (#266) */
const Kb6eBoltIcon: React.FC<{ x: number; y: number; t: number; f: number; s?: number }> = ({
  x, y, t, f, s = 1,
}) => {
  const ap = pop(clamp01(t));
  if (ap <= 0) return null;
  const glow = 0.55 + 0.45 * ((Math.sin(f / 6) + 1) / 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${ap * s})`}>
      <circle cx={0} cy={0} r={118} fill={KPP.akari} opacity={0.26 * glow} />
      <circle cx={0} cy={0} r={96} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <polygon points="-18,-86 36,-20 6,-14 40,80 -36,2 0,-6 -34,-86"
        fill={KPP.akari} stroke={KRP.ink} strokeWidth={6} />
      {/* 火花 */}
      <g stroke={KPP.akariDark} strokeWidth={5} strokeLinecap="round" opacity={glow}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * 60 + f * 1.2) * (Math.PI / 180);
          return (
            <line key={i} x1={Math.cos(a) * 104} y1={Math.sin(a) * 104}
              x2={Math.cos(a) * 128} y2={Math.sin(a) * 128} />
          );
        })}
      </g>
    </g>
  );
};

/** 非常灯 (#263 #264) */
const Kb6eEmerLight: React.FC<{ x: number; y: number; f: number; s?: number }> = ({
  x, y, f, s = 1,
}) => {
  const on = 0.55 + 0.45 * ((Math.sin(f / 8) + 1) / 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={190} ry={120} fill={C.emerGreen} opacity={0.22 * on} />
      <rect x={-86} y={-48} width={172} height={96} rx={8}
        fill={C.emerGreen} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
      <rect x={-78} y={-40} width={156} height={80} rx={5} fill={KPP.kuuki} opacity={0.5 * on} />
      {/* 走る人と矢印 */}
      <g fill={KRP.white}>
        <circle cx={-34} cy={-16} r={11} />
        <path d="M -48 -4 l 26 -4 l 16 22 l -10 8 l -12 -16 l -8 24 l -12 -4 Z" />
        <path d="M 18 0 l 34 0 l 0 -14 l 26 14 l -26 14 l 0 -14 l -34 0 Z" />
      </g>
      {/* 取付の金具 */}
      <g fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4}>
        <rect x={-96} y={-18} width={12} height={36} rx={3} />
        <rect x={84} y={-18} width={12} height={36} rx={3} />
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== #261 ポンプが止まったからです。 =====
// 格: 図
// どこ: 図。方眼のクリーム地に、揚水ポンプの渦巻きケーシングを断面で大きく1つ
// 演出: 羽根・圧力計・電源ランプの3つで「止まった」を言う。主役は画面の半分を超える
// 動き: 羽根が減速して止まる / 針が78→0へ落ちて揺れが収まる / ランプが明滅して消える / ×が出る
// 絵: 止まったポンプを大きく。羽根が動かない、圧力計の針が0、電源のランプが消えている。×
const Kb6ePumpGaTomatta: React.FC<{ f: number }> = ({ f }) => {
  const CX = 620, CY = 470, CR = 250;
  const spin = easeOut(seg(f, 0, 22));
  const rot = 150 * spin + Math.sin(f / 2.2) * 0.9 * (1 - seg(f, 20, 36));
  const GX = 1522, GY = 500, GR = 168;
  const th = lerp(78, -120, easeOut(seg(f, 2, 20))) + Math.sin(f / 5) * 3.2 * (1 - seg(f, 22, 40));
  const dial = (a: number, r: number): [number, number] => [
    GX + Math.sin((a * Math.PI) / 180) * r,
    GY - Math.cos((a * Math.PI) / 180) * r,
  ];
  const lampOn = (1 - seg(f, 0, 14)) * (Math.sin(f * 1.9) > -0.2 ? 1 : 0.15);
  const blade = (a: number) => {
    const r0 = 60, r1 = 206, bend = 27, wid = 14;
    const p = (r: number, da: number): [number, number] => [
      CX + Math.cos(((a + da) * Math.PI) / 180) * r,
      CY + Math.sin(((a + da) * Math.PI) / 180) * r,
    ];
    const [x0, y0] = p(r0, 0);
    const [c1x, c1y] = p((r0 + r1) / 2, bend * 0.35);
    const [x1, y1] = p(r1, bend);
    const [x2, y2] = p(r1, bend + wid);
    const [c2x, c2y] = p((r0 + r1) / 2, bend * 0.35 + wid);
    const [x3, y3] = p(r0, wid);
    return `M ${x0} ${y0} Q ${c1x} ${c1y} ${x1} ${y1} L ${x2} ${y2} Q ${c2x} ${c2y} ${x3} ${y3} Z`;
  };
  return (
    <Frame f={f} seed={894} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 吸込み管 (画面の左端から) ===== */}
      <rect x={-20} y={405} width={392} height={130} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={405} width={392} height={26} fill={BP.steelLight} opacity={0.8} />
      <rect x={346} y={386} width={30} height={168} rx={5} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <Rivets x1={361} y1={400} x2={361} y2={540} n={5} r={7} fill={BP.iron} />
      {/* ===== 吐出し管 (上へ、そして右へ) ===== */}
      <rect x={556} y={146} width={128} height={120} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={556} y={146} width={1012} height={128} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={556} y={146} width={1012} height={24} fill={BP.steelLight} opacity={0.75} />
      <Rivets x1={600} y1={160} x2={1540} y2={160} n={13} r={7} fill={BP.iron} />
      <rect x={1540} y={128} width={30} height={164} rx={5} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 計器の取出し管 */}
      <rect x={1500} y={266} width={44} height={70} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* ===== 台と据付け ===== */}
      <rect x={366} y={766} width={600} height={74} fill={BP.slab}
        stroke={KRP.ink} strokeWidth={6} />
      <g opacity={0.5} stroke={BP.slabDark} strokeWidth={4}>
        <line x1={366} y1={790} x2={966} y2={790} />
      </g>
      <rect x={540} y={700} width={212} height={70} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={420} y={800} r={17} fill={BP.ironDark} />
      <HexBolt x={912} y={800} r={17} fill={BP.ironDark} />
      {/* ===== ケーシング (渦巻き) ===== */}
      <circle cx={CX} cy={CY} r={CR} fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
      <circle cx={CX} cy={CY} r={CR - 34} fill={BP.shaft} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={CX} cy={CY} r={CR - 34} fill={BP.shaftDeep} opacity={0.14} />
      {/* ふたのボルト */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <HexBolt key={i} x={CX + Math.cos(a) * (CR - 17)} y={CY + Math.sin(a) * (CR - 17)}
            r={13} rot={i * 11} fill={BP.steelDark} />
        );
      })}
      {/* 羽根車 */}
      <g transform={`rotate(${rot} ${CX} ${CY})`}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={blade(i * 51.4)} fill={BP.brass}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
        <circle cx={CX} cy={CY} r={64} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={CX} cy={CY} r={26} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={CX - 64} y1={CY} x2={CX + 64} y2={CY} stroke={KRP.ink}
          strokeWidth={4} opacity={0.4} />
      </g>
      {/* 渦巻きの出口 (上の管へつながる喉) */}
      <path d={`M ${CX - 64} ${CY - CR + 6} L ${CX - 64} 266 L ${CX + 64} 266 L ${CX + 64} ${CY - CR + 6}`}
        fill="none" stroke={KRP.ink} strokeWidth={7} />
      {/* ===== 電動機と端子箱 ===== */}
      <rect x={880} y={398} width={412} height={266} rx={18} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={916 + i * 34} y1={404} x2={916 + i * 34} y2={658} />
        ))}
      </g>
      <ellipse cx={880} cy={531} rx={26} ry={133} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={1292} cy={531} rx={26} ry={133} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 軸 (ポンプとつながっている) */}
      <rect x={760} y={514} width={124} height={34} rx={6} fill={BP.steelLight}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={792} y={498} width={26} height={66} rx={4} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={4.5} />
      {/* 端子箱とランプ */}
      <rect x={1004} y={326} width={184} height={76} rx={8} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={6} />
      <circle cx={1090} cy={364} r={38} fill={KPP.akari} opacity={0.3 * lampOn} />
      <circle cx={1090} cy={364} r={23} fill={lampOn > 0.4 ? BP.lamp : KRP.grayDark}
        stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1090} cy={364} r={10} fill={lampOn > 0.4 ? BP.lampGlow : BP.ironDark} />
      {/* 電線 */}
      <path d="M 1140 326 q 40 -70 108 -70 q 70 0 70 -66 l 0 -46" fill="none"
        stroke={BP.grease} strokeWidth={13} />
      <path d="M 1140 326 q 40 -70 108 -70 q 70 0 70 -66 l 0 -46" fill="none"
        stroke={KRP.ink} strokeWidth={17} opacity={0.2} />
      {/* ===== 圧力計 ===== */}
      <circle cx={GX} cy={GY} r={GR + 14} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={GX} cy={GY} r={GR} fill={BP.paper} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = -120 + i * 24;
        const [ax, ay] = dial(a, GR - 12);
        const [bx, by] = dial(a, GR - (i % 5 === 0 ? 46 : 32));
        const [tx, ty] = dial(a, GR - 78);
        return (
          <g key={i}>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke={KRP.ink}
              strokeWidth={i % 5 === 0 ? 7 : 4} />
            {i % 5 === 0 && (
              <text x={tx} y={ty + 14} textAnchor="middle" fontFamily={FONT}
                fontWeight={900} fontSize={40} fill={KRP.ink}>{i}</text>
            )}
          </g>
        );
      })}
      {/* 赤いゼロ帯 */}
      <path d={`M ${dial(-120, GR - 12)[0]} ${dial(-120, GR - 12)[1]} A ${GR - 12} ${GR - 12} 0 0 1 ${dial(-96, GR - 12)[0]} ${dial(-96, GR - 12)[1]}`}
        fill="none" stroke={KRP.red} strokeWidth={14} opacity={0.8} />
      {/* 針 */}
      <g>
        <line x1={GX} y1={GY} x2={dial(th, GR - 40)[0]} y2={dial(th, GR - 40)[1]}
          stroke={KRP.red} strokeWidth={11} strokeLinecap="round" />
        <line x1={GX} y1={GY} x2={dial(th + 180, 36)[0]} y2={dial(th + 180, 36)[1]}
          stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
        <circle cx={GX} cy={GY} r={19} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <text x={GX} y={GY + 112} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={34} fill={KRP.grayDark}>MPa</text>
      {/* ===== 止まった印 ===== */}
      <XMark x={CX} y={CY} s={2.7} t={seg(f, 18, 36)} />
      <ForceArrow x={1300} y={700} len={176} rot={-128} w={20} color={KRP.red}
        t={seg(f, 24, 40)} label="止" labelSize={38} />
      {/* ===== 札 ===== */}
      <TagPlate x={210} y={762} text="ポンプ" size={52} t={seg(f, 4, 18)} />
      <TagPlate x={1522} y={742} text="圧力 0" size={48} t={seg(f, 22, 38)} color={KRP.red} />
      <TagPlate x={1268} y={254} text="電源" size={40} t={seg(f, 12, 28)} color={KRP.red} />
      <TagPlate x={420} y={226} text="揚水 停止" size={44} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #262 ★電気の柱を1本抜くと、水の柱も一緒に倒れます。 =====
// 格: 山
// どこ: 雨の夜。濁った水が足元まで来た街。5本柱の装置を正面から全景で
// 演出: 「灯り」を引き抜く → 支えを失った「水」が根元から倒れる → 上の板が折れて右半分が沈む
// 動き: pull 4〜24 で灯りが抜け、22〜40 で水が倒れ、26〜42 で板が折れて沈む。窓の灯が落ちる
// 絵: ★5本柱の装置。「灯り」の柱が抜かれ、つられて「水」の柱も倒れる。街の板が折れて右半分が沈む
//
// ★ここは共通部品の TowerOnPillars を使わず、板と棟を手で組んでいる。
//   理由: 真ん中2本 (水・灯り) が無いのに板が水平だと「宙に浮いている」ように見える。
//   共通部品の傾きの決まり (KosoPillars の規約) は正しいので触らず、
//   この1枚だけ「板が折れる」という別の壊れ方を自前で描く。
//   板は x=862 で折れる。左半分 (骨・箱の上) は水平のまま。
//   右半分は空気の柱 (x=1540) を蝶番に -7.5度 回り、折れ口が 88px 沈む。
//   棟も同じ回転のなかに入れるので、建物は板と一緒に傾く。
const KB6E_SLAB_Y = 520;      // 板の上面
const KB6E_SLAB_H = 32;       // 板の厚み
const KB6E_BX = 862;          // 折れ口のx (手前の棟と棟のあいだ)
const KB6E_HINGE_X = 1540;    // 蝶番 = 空気の柱

const Kb6eHashiraWo1Hon: React.FC<{ f: number }> = ({ f }) => {
  const pull = seg(f, 4, 24);        // 灯りを抜く
  const fall = seg(f, 22, 40);       // 水が倒れる
  const brk = seg(f, 26, 42);        // 板が折れて沈む
  const lit = 1 - pull * 0.92;       // 窓の灯が落ちる
  // 右半分の傾き (沈む側が下。最後に少しだけ余韻で揺れる)
  const tilt = -(7.5 * brk) + Math.sin(f / 9) * 0.55 * brk;
  const jolt = Math.sin(f / 7) * 2.2 * brk;   // 左半分の縦の衝撃
  const RROT = `rotate(${tilt} ${KB6E_HINGE_X} ${KB6E_SLAB_Y})`;
  const SY = KB6E_SLAB_Y, SB = KB6E_SLAB_Y + KB6E_SLAB_H;
  return (
    <Frame f={f} seed={895} bg={KRP.cream} dark>
      {/* ===== 雨の夜の空 ===== */}
      <rect x={-20} y={-20} width={W + 40} height={566} fill={C.night} />
      <rect x={-20} y={-20} width={W + 40} height={566} fill={C.dark} opacity={0.35} />
      {/* ちぎれ雲 */}
      <g fill={C.nightPale} opacity={0.45}>
        {[[220, 120, 180], [760, 72, 150], [1480, 140, 210], [1180, 60, 120]].map(([cx, cy, r], i) => (
          <ellipse key={i} cx={cx + Math.sin(f / 70 + i) * 14} cy={cy}
            rx={r} ry={r * 0.33} />
        ))}
      </g>
      {/* 奥の低い街 (停電で真っ暗) */}
      <g fill={C.dark} stroke={KRP.ink} strokeWidth={4} opacity={0.85}>
        {[[60, 180, 96], [250, 120, 64], [1620, 200, 110], [1820, 140, 70]].map(([x, w, h], i) => (
          <rect key={i} x={x} y={520 - h} width={w} height={h} />
        ))}
      </g>
      {/* 鉛直の基準線 (建物の傾きが分かる) */}
      <line x1={960} y1={40} x2={960} y2={560} stroke={KRP.white} strokeWidth={5}
        strokeDasharray="18 16" opacity={0.42} />

      {/* ===== 抜けた「灯り」の跡 (ここに柱が要る、という破線の穴) ===== */}
      {pull > 0.5 && (
        <g opacity={clamp01((pull - 0.5) / 0.3)}>
          <rect x={PX.akari - 62} y={P_TOP + 4} width={124} height={P_BOT - P_TOP}
            fill={KRP.red} opacity={0.09} />
          <rect x={PX.akari - 62} y={P_TOP + 4} width={124} height={P_BOT - P_TOP}
            fill="none" stroke={KRP.red} strokeWidth={6} strokeDasharray="20 16" />
        </g>
      )}

      {/* ===== 5本の柱 (ぜんぶ同じ素の Pillar。札は自分で下に置く) ===== */}
      {/* 立っている3本: 骨・箱・空気 */}
      <Pillar id="hone" f={f} label={false} />
      <Pillar id="hako" f={f} label={false} />
      <Pillar id="kuuki" f={f} label={false} />
      {/* 抜かれる1本: 灯り (pull=1 で消える) */}
      <Pillar id="akari" f={f} label={false} out={pull} outDir={1} />

      {/* ===== 街の板 (x=862 で折れている) ===== */}
      {/* 左半分: 骨と箱が受けているので水平のまま。衝撃でわずかに上下する */}
      <g transform={`translate(0 ${jolt})`}>
        <path d={`M 292 ${SY} L 848 ${SY} L ${KB6E_BX} ${SY + 10} L 846 ${SY + 20} L 860 ${SB} L 292 ${SB} Z`}
          fill={KPP.ground} stroke={KRP.ink} strokeWidth={6} />
        <rect x={292} y={SB - 11} width={556} height={11} fill={KPP.groundDark} opacity={0.8} />
        {/* 折れ口からはみ出た鉄筋 */}
        <g stroke={C.zincDark} strokeWidth={6} strokeLinecap="round">
          <line x1={850} y1={SY + 8} x2={898} y2={SY + 6} />
          <line x1={852} y1={SY + 18} x2={904} y2={SY + 22} />
          <line x1={856} y1={SY + 27} x2={894} y2={SY + 33} />
        </g>
        {/* 奥の棟2つ (左半分の上) */}
        <Tower x={520} base={SY} h={296} w={150} f={f} lit={lit} night front={false} seed={5} />
        <Tower x={760} base={SY} h={386} w={186} f={f} lit={lit} night seed={2} />
      </g>

      {/* 右半分: 空気の柱だけが受けている。折れ口が沈んで、棟ごと傾く */}
      <g transform={RROT}>
        {/* 奥の棟 → 手前の棟。板より先に描いて、板の上に建っているように見せる */}
        <Tower x={1420} base={SY} h={268} w={140} f={f} lit={lit} night front={false} seed={9} />
        <Tower x={1180} base={SY} h={340} w={170} f={f} lit={lit} night seed={7} />
        <Tower x={972} base={SY} h={430} w={200} f={f} lit={lit} night seed={1} />
        <path d={`M 878 ${SY} L 1628 ${SY} L 1628 ${SB} L 874 ${SB} L 890 ${SY + 21} L 872 ${SY + 11} Z`}
          fill={KPP.ground} stroke={KRP.ink} strokeWidth={6} />
        <rect x={886} y={SB - 11} width={742} height={11} fill={KPP.groundDark} opacity={0.8} />
        {/* 折れ口の断面 (骨材が見える) */}
        <path d={`M 878 ${SY} L 890 ${SY + 21} L 872 ${SY + 11} L 874 ${SB} L 894 ${SB} L 894 ${SY} Z`}
          fill={KPP.groundDark} opacity={0.55} />
      </g>

      {/* もとの水平の高さ (ここまで板があった = どれだけ沈んだかが分かる) */}
      {brk > 0.1 && (
        <line x1={880} y1={SY} x2={1596} y2={SY} stroke={KRP.white} strokeWidth={4}
          strokeDasharray="16 14" opacity={0.5 * brk} />
      )}

      {/* 折れ口の粉じんと破片 */}
      {brk > 0.05 && (
        <g opacity={brk}>
          <g fill={C.stoneDark} opacity={0.4}>
            {[[878, 596, 54], [916, 628, 38], [848, 620, 30]].map(([cx, cy, r], i) => (
              <ellipse key={i} cx={cx} cy={cy + Math.sin(f / 11 + i) * 6}
                rx={r} ry={r * 0.62} />
            ))}
          </g>
          <g fill={KPP.groundDark} stroke={KRP.ink} strokeWidth={3}>
            {[[866, 646], [900, 676], [844, 690], [918, 712]].map(([x0, y0], i) => (
              <polygon key={i}
                points={`${x0},${y0 + brk * 26} ${x0 + 17},${y0 + 7 + brk * 26} ${x0 + 5},${y0 + 21 + brk * 26}`} />
            ))}
          </g>
        </g>
      )}

      {/* ===== 倒れる「水」の柱 (ほかの柱と同じ素の Pillar。札は1枚だけ) ===== */}
      <Pillar id="mizu" f={f} label={false} fallen={fall * 0.58} outDir={1} />
      {/* 倒れた軌跡 (立っていた所から、いまの先端まで)。建物の上は薄く通す */}
      {fall > 0.05 && (
        <path d={`M ${PX.mizu} ${P_TOP} A 272 272 0 0 1 1153 632`}
          fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="14 16"
          opacity={0.5 * fall} />
      )}
      {/* 倒れていく向き (灯りの抜けた穴へ倒れ込む) */}
      <ForceArrow x={1142} y={586} len={150} rot={47} w={20} color={KRP.red}
        t={seg(f, 28, 42)} />

      {/* ===== 足元の濁った水 ===== */}
      <rect x={-20} y={826} width={W + 40} height={H - 806} fill={C.mudWater} />
      <line x1={-20} y1={828} x2={W + 20} y2={828} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.white} strokeWidth={4} opacity={0.3}>
        {Array.from({ length: 9 }, (_, i) => {
          const x = 70 + i * 215;
          const y = 840 + Math.sin(f / 13 + i) * 4;
          return <path key={i} d={`M ${x} ${y} q 36 -9 72 0 q 36 9 72 0`} fill="none" />;
        })}
      </g>
      {/* 雨 */}
      <Kb6eRain f={f} n={60} op={0.4} />

      {/* ===== 「抜く」は灯りの柱の穴を指す (右端の空気ではない) ===== */}
      <Arrow x={1330} y={676} s={1.08} rot={180} t={seg(f, 2, 16)} />
      <TagPlate x={1398} y={716} text="抜く" size={38} t={seg(f, 2, 16)} color={KRP.red} />
      {/* 折れた所 */}
      <TagPlate x={816} y={676} text="折れた" size={38} t={seg(f, 30, 42)} color={KRP.red} />

      {/* ===== 柱の名札 (1本に1枚だけ。倒れた柱の札はその根元の横に置く) ===== */}
      <TagPlate x={PX.hone} y={778} text="骨" size={46} t={seg(f, 0, 12)} />
      <TagPlate x={PX.hako} y={778} text="箱" size={46} t={seg(f, 0, 12)} />
      <TagPlate x={888} y={778} text="水" size={46} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={PX.akari} y={778} text="灯り" size={46} t={seg(f, 6, 20)} color={KRP.red} />
      <TagPlate x={PX.kuuki} y={778} text="空気" size={46} t={seg(f, 0, 12)} />
      {/* 「連鎖」は、倒れた「水」と抜かれた「灯り」のちょうど間。
           ただし名札の列より一段だけ上に置く (6本目の柱の名前と読み違えないように) */}
      <TagPlate x={1056} y={726} text="連鎖" size={42} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #263 住民は、階段で水を運びました。 =====
// 格: 並
// どこ: 停電した非常階段の「踊り場」。#264 の横並びの階段とは別のカメラ
// 演出: ★カメラを変えた。横から見た階段ではなく、踊り場まで寄る。
//       人は登っている途中ではなく、水を床に下ろして足を止めている (次の #264 と姿勢が別)
//       非常灯は左の壁。階数標識は壁掛けの琺瑯板。右奥に次の一段が立ち上がる
// 動き: 肩で息をする / 非常灯が脈打つ / 懐中電灯の光が次の段をなめる / ボトルの水が揺れる
// 絵: 非常階段の踊り場。足を止めた住民、床に置いた水2本、壁の14F標識、左の非常灯、右奥の次の段
const Kb6eKaidanDeHakobu: React.FC<{ f: number }> = ({ f }) => {
  const FX = 640, FY = 760;                     // 人の足元 (踊り場の床の上)
  const hx = FX + 86, hy = FY - 96;             // 懐中電灯のある手
  const flick = 0.72 + 0.28 * ((Math.sin(f / 3.3) + Math.sin(f / 7.7)) / 2 + 1) / 2;
  const puff = seg(f, 8, 30);                   // 息を吐く
  // 踊り場の床 (奥 y=716 → 手前 y=912 の面)
  const FL_BACK = 716, FL_FRONT = 912;
  return (
    <Frame f={f} seed={896} bg={KRP.cream} dark>
      {/* ===== 壁 (コンクリートブロック。寄ったぶん目地を大きく) ===== */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.rain} opacity={0.5} />
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.dark} opacity={0.34} />
      <g stroke={C.zincDark} strokeWidth={5} opacity={0.4}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1={-20} y1={46 + i * 148} x2={W + 20} y2={46 + i * 148} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`v${i}`} x1={i * 318 - 60} y1={-20} x2={i * 318 - 60} y2={FL_BACK} />
        ))}
      </g>
      {/* 壁の汚れ (雨漏りの筋) */}
      <g fill={C.zincDark} opacity={0.18}>
        <path d="M 1092 0 l 26 0 l 10 470 l -46 0 Z" />
        <path d="M 520 0 l 14 0 l 6 300 l -26 0 Z" />
      </g>

      {/* ===== 壁の立管 (消火・揚水の赤い竪管。水の柱が死んでいる印) ===== */}
      <g>
        <rect x={1096} y={-20} width={56} height={FL_BACK + 20} fill="#9E4B42"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1096} y={-20} width={16} height={FL_BACK + 20} fill={KRP.white} opacity={0.22} />
        {[120, 352, 584].map((y) => (
          <g key={y}>
            <rect x={1080} y={y} width={88} height={26} rx={4} fill="#863E36"
              stroke={KRP.ink} strokeWidth={5} />
            <HexBolt x={1092} y={y + 13} r={8} fill={BP.ironDark} />
            <HexBolt x={1156} y={y + 13} r={8} fill={BP.ironDark} />
          </g>
        ))}
        <XMark x={1124} y={470} s={0.78} t={seg(f, 24, 38)} />
      </g>

      {/* ===== 階数の標識 (壁掛けの琺瑯板。ステンシルをやめて読める板に) ===== */}
      <g>
        <rect x={766} y={168} width={222} height={152} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={780} y={182} width={194} height={124} rx={6} fill="none"
          stroke={C.zincDark} strokeWidth={5} />
        <text x={877} y={268} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={80} fill={KRP.ink}>14F</text>
        <HexBolt x={788} y={190} r={9} fill={BP.ironDark} />
        <HexBolt x={966} y={190} r={9} fill={BP.ironDark} />
        <HexBolt x={788} y={298} r={9} fill={BP.ironDark} />
        <HexBolt x={966} y={298} r={9} fill={BP.ironDark} />
        {/* 上下の階 */}
        <rect x={766} y={324} width={222} height={52} rx={7} fill={C.zinc}
          stroke={KRP.ink} strokeWidth={5} />
        <text x={877} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={30} fill={KRP.ink}>↑15F  ↓13F</text>
      </g>

      {/* ===== 非常灯 (左の壁。#264 の右端と逆に置く) ===== */}
      <Kb6eEmerLight x={296} y={248} f={f} s={1.18} />
      {/* 非常灯が床に落とす緑の照り */}
      <ellipse cx={360} cy={800} rx={430} ry={96} fill={C.emerGreen} opacity={0.12} />

      {/* ===== 右奥: 次の一段が立ち上がる ===== */}
      <Kb6eStair x0={1180} y0={FL_BACK} n={4} tread={176} riser={100}
        face={C.zinc} faceDark={C.zincDark} nose={KRP.white} rail={BP.steel} />

      {/* ===== 踊り場の床 (奥から手前へ広がる面) ===== */}
      <polygon points={`-20,${FL_BACK} 1246,${FL_BACK} 1186,${FL_FRONT} -20,${FL_FRONT}`}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
      <polygon points={`-20,${FL_BACK} 1246,${FL_BACK} 1240,${FL_BACK + 14} -20,${FL_BACK + 14}`}
        fill={C.zincDark} opacity={0.55} />
      {/* 床の滑り止め目地 */}
      <g stroke={C.zincDark} strokeWidth={4} opacity={0.35}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-20} y1={FL_BACK + 42 + i * 42} x2={1232 - i * 13}
            y2={FL_BACK + 42 + i * 42} />
        ))}
      </g>
      {/* 床にこぼれた水 */}
      <g fill={KPP.mizu} opacity={0.42}>
        {[[520, 788, 44], [880, 846, 56], [250, 870, 38]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.3} />
        ))}
      </g>
      {/* 踊り場より手前 = 下りの段 (真っ暗) */}
      <rect x={-20} y={FL_FRONT} width={W + 40} height={H - FL_FRONT + 20} fill={C.night} />
      <rect x={-20} y={FL_FRONT} width={W + 40} height={12} fill={KRP.ink} opacity={0.5} />

      {/* ===== 懐中電灯の光 (次の段をなめる) ===== */}
      <g opacity={0.26 * flick}>
        <polygon points={`${hx + 10},${hy} ${hx + 760},${hy - 330} ${hx + 790},${hy - 70} ${hx + 60},${hy + 70}`}
          fill={C.candle} />
      </g>
      <g opacity={0.46 * flick}>
        <polygon points={`${hx + 10},${hy} ${hx + 430},${hy - 180} ${hx + 444},${hy - 36} ${hx + 48},${hy + 40}`}
          fill={C.candle} />
      </g>

      {/* ===== 足を止めた住民 ===== */}
      {/* 床に落ちる影 */}
      <ellipse cx={FX + 6} cy={FY + 10} rx={116} ry={24} fill={KRP.ink} opacity={0.26} />
      <Person x={FX} y={FY} s={1.24} f={f} lean={2} face="worried"
        cloth="#8FA8C0" clothDark="#4C6076" gaze={[0.8, -1]} />
      {/* 肩で息をする (吐いた息) */}
      <g opacity={0.5 * puff}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={FX + 108 + i * 34 + Math.sin(f / 7 + i) * 5}
            cy={FY - 282 - i * 22} r={11 + i * 5} fill={KRP.white} opacity={0.6 - i * 0.14} />
        ))}
      </g>
      {/* 床に下ろした水2本 */}
      <Kb6ePet x={352} y={716} s={1.02} f={f} />
      {/* 懐中電灯 (右手) */}
      <g transform={`translate(${hx} ${hy}) rotate(-28)`}>
        <rect x={-10} y={-16} width={70} height={32} rx={7} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={56} y={-21} width={19} height={42} rx={5} fill={BP.brass}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={70} cy={0} r={11} fill={BP.lampGlow} opacity={flick} />
      </g>

      {/* ===== 札 =====
           ★左上 (x 60〜436 / y 54〜111) はチャンネルのバッジが載るので札を置かない。
             札どうしも重ねない (非常灯 → 水 2本 → 矢印 の順に縦に離す)。 */}
      <TagPlate x={620} y={96} text="非常階段" size={50} t={seg(f, 2, 16)} />
      <TagPlate x={300} y={372} text="非常灯" size={40} t={seg(f, 12, 26)} color={C.emerGreen} />
      <TagPlate x={240} y={486} text="水 2本" size={44} t={seg(f, 20, 34)} />
      <Arrow x={392} y={560} s={0.85} rot={90} t={seg(f, 24, 38)} />
      <TagPlate x={1534} y={176} text="14階まで" size={44} t={seg(f, 28, 42)} />
      <Arrow x={1392} y={298} s={1.05} rot={-56} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// ===== #264 ★170年前のパリと、同じことをしています。 =====
// 格: 山
// どこ: 左=1850年ごろパリの石の階段 (蝋燭)。右=いまのタワマンの非常階段 (非常灯)
// 演出: まったく同じ形の階段を左右に。段数・踏面・蹴上げ・人の姿勢も同じ。真ん中で突き合わせる
// 演出: 同じであることは、階段の形・姿勢・真ん中の「同じ」札と左右の矢印だけで言う。
//   ★二重写し (右の人にパリの水運び屋を半透明で重ねる) は、絵がブレて見えるので使わない (作者指摘)
// 動き: 2人が同じ拍で同じ1段を登る / 蝋燭が揺れ / 非常灯が脈打つ
// 絵: ★左にパリの水運び屋、右に現代の住人。同じ形の階段を同じ姿勢で登っている
const Kb6eN170NenMaeToOnaji: React.FC<{ f: number }> = ({ f }) => {
  const TR = 118, RI = 60, N = 7;
  const p = easeOut(seg(f, 6, 34));
  const dx = TR * p;
  const dy = -RI * p - 22 * Math.sin(p * Math.PI);
  const LX = 120 + 3 * TR + TR / 2;      // 左の人 (3段目の中央)
  const RXp = 990 + 3 * TR + TR / 2;     // 右の人 (同じ3段目)
  const FY = 820 - 4 * RI;
  const cand = 0.7 + 0.3 * ((Math.sin(f / 4.1) + Math.sin(f / 6.3)) / 2 + 1) / 2;
  return (
    <Frame f={f} seed={897} bg={KRP.cream} dark>
      {/* ===== 左: パリの石の壁 ===== */}
      <rect x={-20} y={-20} width={988} height={H + 40} fill={C.stone} />
      <g stroke={C.stoneDark} strokeWidth={4} opacity={0.6}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`lh${i}`} x1={-20} y1={40 + i * 128} x2={968} y2={40 + i * 128} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`lv${i}`} x1={i * 190} y1={-20} x2={i * 190} y2={H + 20} />
        ))}
      </g>
      {/* 石のアーチ窓 */}
      <g>
        <path d="M 112 470 L 112 300 Q 112 206 206 206 Q 300 206 300 300 L 300 470 Z"
          fill={C.night} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 112 470 L 112 300 Q 112 206 206 206 Q 300 206 300 300 L 300 470"
          fill="none" stroke={C.stoneDark} strokeWidth={16} opacity={0.5} />
        <line x1={206} y1={206} x2={206} y2={470} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
        <line x1={112} y1={340} x2={300} y2={340} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
      </g>
      {/* 蝋燭の掛け燭台 */}
      <g>
        <rect x={417} y={252} width={26} height={96} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={430} cy={252} rx={44} ry={13} fill={BP.brass}
          stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={415} y={184} width={30} height={70} rx={5} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={430} cy={160 + Math.sin(f / 5) * 3} rx={13 + Math.sin(f / 4) * 2} ry={26}
          fill={C.candle} stroke={KRP.ink} strokeWidth={3.5} opacity={cand} />
        <circle cx={430} cy={166} r={104} fill={C.candle} opacity={0.17 * cand} />
      </g>
      {/* ===== 右: コンクリートの壁 ===== */}
      <rect x={968} y={-20} width={W - 948} height={H + 40} fill={C.rain} opacity={0.62} />
      <rect x={968} y={-20} width={W - 948} height={H + 40} fill={C.dark} opacity={0.42} />
      <g stroke={C.zincDark} strokeWidth={4} opacity={0.4}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`rh${i}`} x1={968} y1={40 + i * 128} x2={W + 20} y2={40 + i * 128} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`rv${i}`} x1={1040 + i * 190} y1={-20} x2={1040 + i * 190} y2={H + 20} />
        ))}
      </g>
      <Kb6eEmerLight x={1750} y={300} f={f} s={0.82} />
      {/* ===== 同じ形の階段 (左右で同じ寸法) ===== */}
      <Kb6eStair x0={120} y0={820} n={N} tread={TR} riser={RI}
        face={C.stone} faceDark={C.stoneDark} nose={C.amber} rail={BP.woodDark} />
      <Kb6eStair x0={990} y0={820} n={N} tread={TR} riser={RI}
        face={C.zinc} faceDark={C.zincDark} nose={KRP.white} rail={BP.steel} />
      {/* ===== 左: パリの水運び屋 ===== */}
      <g>
        <Person x={LX + dx} y={FY + dy} s={0.88} f={f} lean={9} face="normal"
          cloth={C.amber} clothDark={BP.woodDark} />
        <Kb6ePail x={LX + dx - 92} y={FY + dy - 128} s={0.66} f={f} ph={0} />
        <Kb6ePail x={LX + dx + 92} y={FY + dy - 128} s={0.66} f={f} ph={2.1} />
        {/* 担い棒 */}
        <rect x={LX + dx - 124} y={FY + dy - 150} width={248} height={14} rx={7}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* ===== 右: いまの住人 =====
           ★顔が淡い壁に溶けないように、背後をひと段暗く落として、服の彩度を上げる */}
      <g>
        <ellipse cx={RXp + dx} cy={FY + dy - 170} rx={214} ry={238}
          fill={C.night} opacity={0.26} />
        <ellipse cx={RXp + dx} cy={FY + dy - 168} rx={158} ry={180}
          fill={C.night} opacity={0.22} />
        <Person x={RXp + dx} y={FY + dy} s={0.88} f={f} lean={9} face="worried"
          cloth="#7E9CB8" clothDark="#3F5872" />
        {/* ★水は体の右脇に抱える。顔の上に重ねると表情が消える (左の水運び屋が桶を±92に
             振り分けているのと同じ理由) */}
        <Kb6ePet x={RXp + dx + 122} y={FY + dy - 104} s={0.7} f={f} />
      </g>
      {/* ===== 真ん中の継ぎ目 ===== */}
      <line x1={968} y1={110} x2={968} y2={830} stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="20 18" opacity={0.55} />
      <ForceArrow x={740} y={344} len={150} rot={0} w={22} color={KRP.red} t={seg(f, 20, 34)} />
      <ForceArrow x={1200} y={344} len={150} rot={180} w={22} color={KRP.red} t={seg(f, 20, 34)} />
      {/* ===== 札 ===== */}
      <TagPlate x={700} y={150} text="1850年ごろ・パリ" size={40} t={seg(f, 2, 16)}
        fill={C.stone} />
      <TagPlate x={1420} y={150} text="いま・タワマン" size={40} t={seg(f, 8, 22)}
        fill={KRP.white} />
      <TagPlate x={968} y={344} text="同じ" size={54} t={seg(f, 26, 40)} color={KRP.red} />
      <TagPlate x={460} y={768} text="水運び屋" size={44} t={seg(f, 14, 28)} />
      <TagPlate x={1330} y={768} text="住民" size={44} t={seg(f, 18, 32)} />
    </Frame>
  );
};

// ===== #265 エレベーターが動いたのは、6日後。 =====
// 格: 図
// どこ: 図。方眼の上に、停電からの日数の升目を画面の端から端まで1本
// 演出: 1〜5日は斜線で塗りつぶし(止まっている)。6日目だけが黄で灯り、上にかごの印
// 動き: 升目が左から順に埋まる / 6日目が脈打つ / かごが上下する / 矢印と札が出る
// 絵: 日数の目盛り。1日ずつの升目。6日目にエレベーターの印が灯る
const Kb6eN6KaGo: React.FC<{ f: number }> = ({ f }) => {
  const cx6 = dsX(6) + DCW / 2;
  return (
    <Frame f={f} seed={898} bg={KRP.cream}>
      <GridPaper />
      <Kb6eDayGrid f={f} solid={5} />
      <Kb6eDayLit d={6} t={seg(f, 20, 32)} f={f} color={KPP.akari} />
      {/* 6日目の印 */}
      <Kb6eLiftIcon x={cx6} y={198} t={seg(f, 22, 36)} f={f} s={1.06} />
      <ForceArrow x={cx6} y={318} len={44} rot={90} w={22} color={KPP.hakoDark}
        t={seg(f, 28, 40)} />
      {/* 動き出した合図 */}
      <ForceArrow x={cx6 + 112} y={300} len={120} rot={-90} w={20} color={KRP.green}
        t={seg(f, 30, 42)} label="動いた" labelSize={34} />
      {/* 1〜5日は止まったまま (升目の中の印) */}
      <g>
        {[1, 2, 3, 4, 5].map((d) => (
          <XMark key={d} x={dsX(d) + DCW / 2} y={DY + DH / 2} s={0.52}
            t={seg(f, 6 + d * 2, 18 + d * 2)} />
        ))}
      </g>
      {/* 札 */}
      <TagPlate x={340} y={166} text="停電からの日数" size={46} t={seg(f, 2, 14)} />
      <TagPlate x={cx6} y={700} text="6日目" size={50} t={seg(f, 26, 40)} color={KPP.hakoDark} />
      <QMark x={1430} y={498} s={1.25} f={f} t={seg(f, 32, 42)} color={KRP.grayDark} />
      <TagPlate x={340} y={762} text="エレベーター 停止" size={34} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #266 電気が全部戻るまで、17日かかりました。 =====
// 格: 図 (#265 とまったく同じ升目・同じ座標。伸びるところだけが違う)
// どこ: 図。#265 の升目のまま、点線だった6日目より先が実線で埋まって17日まで届く
// 演出: 6日目のかごの印はそのまま残し (連番)、17日目に電気の印が灯る
// 動き: 6→17 へ埋まりが伸びる / 稲妻の火花が回る / かごは上下を続ける / 期間の矢印が伸びる
// 絵: #265と同じ目盛りが17日まで伸びる。17日目に電気の印 (連番)
const Kb6eN17KaKakatta: React.FC<{ f: number }> = ({ f }) => {
  const cx6 = dsX(6) + DCW / 2;
  const cx17 = dsX(17) + DCW / 2;
  const grow = easeOut(seg(f, 4, 30));
  return (
    <Frame f={f} seed={899} bg={KRP.cream}>
      <GridPaper />
      <Kb6eDayGrid f={f} solid={16} />
      {/* 6日目 (#265 と同じ位置・同じ印。ここは変えない) */}
      <Kb6eDayLit d={6} t={1} f={f} color={KPP.akari} />
      <Kb6eLiftIcon x={cx6} y={198} t={1} f={f} s={0.74} />
      {/* 17日目 = 電気が全部戻る */}
      <Kb6eDayLit d={17} t={seg(f, 24, 36)} f={f} color={KPP.akari} />
      <Kb6eBoltIcon x={cx17} y={198} t={seg(f, 26, 40)} f={f} s={1.0} />
      {/* 6日目 → 17日目 の期間 */}
      <g>
        <line x1={cx6} y1={690} x2={cx6 + (cx17 - cx6) * grow} y2={690}
          stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
        <line x1={cx6} y1={668} x2={cx6} y2={712} stroke={KRP.red} strokeWidth={9} />
        <line x1={cx17} y1={668} x2={cx17} y2={712} stroke={KRP.red} strokeWidth={9}
          opacity={grow > 0.98 ? 1 : 0.25} />
      </g>
      {/* 札 */}
      <TagPlate x={340} y={166} text="停電からの日数" size={46} t={seg(f, 2, 14)} />
      <TagPlate x={cx6} y={766} text="6日目" size={40} t={seg(f, 6, 18)} color={KPP.hakoDark} />
      <TagPlate x={cx17 - 60} y={766} text="17日目" size={46} t={seg(f, 28, 40)} color={KRP.red} />
      <TagPlate x={1050} y={766} text="11日" size={44} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #267 ニューヨークの2003年の大停電でも、同じでした。 =====
// 格: 並
// どこ: 2003年8月の夜の街路。描くのは「灯の消えた街」1つだけ。人は1人
// 演出: 背景4つ(月/真っ暗なビル群/消えた信号/路上の蝋燭)。明かりは蝋燭と月だけ
// 動き: 蝋燭の炎が揺れる / 月の暈が脈打つ / 星が瞬く / 人が蝋燭を持って立ちつくす
// 絵: 2003年の夜のニューヨーク。真っ暗なビル群、月明かり、路上のろうそく、止まった信号
const Kb6eNy2003: React.FC<{ f: number }> = ({ f }) => {
  const moon = 0.78 + 0.22 * ((Math.sin(f / 16) + 1) / 2);
  const BL: [number, number, number, number][] = [
    [40, 210, 470, 1], [250, 150, 330, 2], [560, 230, 600, 3],
    [800, 170, 420, 4], [980, 250, 690, 5], [1250, 160, 380, 6],
    [1430, 220, 540, 7], [1670, 190, 300, 8],
  ];
  return (
    <Frame f={f} seed={900} bg={KRP.cream} dark>
      {/* ===== 夜空 ===== */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} />
      <rect x={-20} y={-20} width={W + 40} height={560} fill={C.dark} opacity={0.4} />
      {/* 星 */}
      <g fill={KRP.white}>
        {Array.from({ length: 46 }, (_, i) => {
          const x = rnd(i * 2.3) * W;
          const y = rnd(i * 7.1) * 420;
          const tw = 0.3 + 0.7 * ((Math.sin(f / 9 + i * 1.7) + 1) / 2);
          return <circle key={i} cx={x} cy={y} r={1.8 + rnd(i * 3.3) * 2.6} opacity={0.5 * tw} />;
        })}
      </g>
      {/* 月 */}
      <g>
        <circle cx={1630} cy={168} r={158} fill={C.candle} opacity={0.14 * moon} />
        <circle cx={1630} cy={168} r={104} fill={C.candle} opacity={0.2 * moon} />
        <circle cx={1630} cy={168} r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={5}
          opacity={0.96} />
        <circle cx={1664} cy={152} r={62} fill={C.night} opacity={0.92} />
        <g fill={C.nightPale} opacity={0.5}>
          <circle cx={1598} cy={192} r={13} />
          <circle cx={1612} cy={142} r={8} />
        </g>
      </g>
      {/* ===== 真っ暗なビル群 ===== */}
      {BL.map(([x, w, h, sd], i) => (
        <g key={i}>
          <rect x={x} y={800 - h} width={w} height={h} fill={i % 2 ? C.dark : C.night}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={x + w - 14} y={800 - h} width={14} height={h} fill={KRP.ink} opacity={0.3} />
          {/* 窓 (★大停電。灯りは1つも点いていない。
               見えているのは月あかりの照り返しだけ = 自分では光っていない) */}
          {Array.from({ length: Math.floor((h - 40) / 54) }, (_, r) =>
            Array.from({ length: Math.floor((w - 30) / 50) }, (_, c) => {
              const k = (r * 7 + c * 13 + sd * 29) % 100;
              // 月(右上)に近い面ほど、わずかに照り返す。色は青灰色だけを使う。
              const refl = 0.10 + (k % 11) * 0.012 + (x > 1100 ? 0.05 : 0);
              return (
                <rect key={`${r}-${c}`} x={x + 18 + c * 50} y={800 - h + 26 + r * 54}
                  width={32} height={36} rx={2}
                  fill={C.nightPale} opacity={refl}
                  stroke={KRP.ink} strokeWidth={2.4} />
              );
            }))}
          {/* 屋上の水槽 */}
          <rect x={x + w / 2 - 22} y={800 - h - 34} width={44} height={34}
            fill={C.dark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* ===== 路面と歩道 ===== */}
      <rect x={-20} y={796} width={W + 40} height={H - 776} fill={C.dark} />
      <rect x={-20} y={796} width={W + 40} height={16} fill={C.nightPale} opacity={0.5} />
      <g stroke={C.zinc} strokeWidth={7} opacity={0.3}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={60 + i * 300} y1={836} x2={190 + i * 300} y2={836} />
        ))}
      </g>
      {/* ===== 消えた信号 ===== */}
      <g>
        <rect x={400} y={430} width={26} height={372} fill={C.dark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={348} y={330} width={130} height={248} rx={12} fill={C.dark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* ★3つとも消えている。筐体より暗いレンズ + 斜めの照りだけ (色は点けない) */}
        {[386, 452, 518].map((cy, i) => (
          <g key={i}>
            <circle cx={413} cy={cy} r={38} fill="#1E2630" stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${393} ${cy + 26} a 38 38 0 0 1 ${-16} ${-42}`}
              fill="none" stroke={C.nightPale} strokeWidth={5} opacity={0.3} />
            <path d={`M ${375} ${cy - 30} q 38 -16 76 0 l 0 -8 q -38 -14 -76 0 Z`}
              fill={C.dark} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        {/* 垂れた吊り線 */}
        <path d="M 348 356 q -170 44 -348 20" fill="none" stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* ===== 路上の蝋燭 ===== */}
      {[[720, 0], [820, 1.4], [1130, 2.7], [1226, 0.8], [1340, 2.1]].map(([x, ph], i) => {
        const fl = 0.7 + 0.3 * ((Math.sin(f / 4.3 + ph) + Math.sin(f / 6.1 + ph)) / 2 + 1) / 2;
        return (
          <g key={i}>
            <circle cx={x} cy={766} r={74} fill={C.candle} opacity={0.17 * fl} />
            {/* ガラスの瓶 */}
            <rect x={x - 25} y={752} width={50} height={54} rx={6} fill={C.nightPale}
              stroke={KRP.ink} strokeWidth={4.5} opacity={0.8} />
            <rect x={x - 17} y={768} width={34} height={38} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={3} opacity={0.7} />
            {/* 炎 */}
            <ellipse cx={x + Math.sin(f / 4 + ph) * 2.5} cy={762} rx={9} ry={19 + Math.sin(f / 3.2 + ph) * 3}
              fill={C.candle} stroke={KRP.ink} strokeWidth={3} opacity={fl} />
          </g>
        );
      })}
      {/* ===== 立ちつくす1人 ===== */}
      <g>
        {/* ★蝋燭に照らされた身体 (夜の闇に首から下が溶けないように)
             = 明るい上着 + 二重のハロー。胴体と夜空の明度差をはっきり付ける。 */}
        <ellipse cx={978} cy={700} rx={150} ry={158} fill={C.candle} opacity={0.14} />
        <ellipse cx={978} cy={706} rx={112} ry={120} fill={C.candle} opacity={0.26} />
        <Person x={972} y={800} s={0.84} f={f} face="worried"
          cloth="#D8DCE6" clothDark="#9BA3B6" gaze={[1, -2]} />
        {/* 手に持った蝋燭 */}
        <g>
          <circle cx={1032} cy={732} r={66} fill={C.candle} opacity={0.2} />
          <rect x={1023} y={726} width={18} height={44} rx={4} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={1032 + Math.sin(f / 4) * 2} cy={712} rx={8}
            ry={17 + Math.sin(f / 3.4) * 3} fill={C.candle} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={300} y={212} text="大停電" size={56} t={seg(f, 2, 16)} color={KRP.red} />
      <TagPlate x={300} y={296} text="2003年 ニューヨーク" size={34} t={seg(f, 10, 24)} />
      <TagPlate x={1430} y={700} text="灯り× 水×" size={40} t={seg(f, 24, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #268 5階より高い建物では、水圧が戻るまで水は出ない。 =====
// 格: 図
// どこ: 図。左に階の数直線、真ん中に立管を1本通し、右に各階の蛇口を並べる
// 演出: 立管の水は5階までしか上がらない。境い目に赤い線。下は○、上は×
// 動き: 水面が下から5階まで上がって止まり、揺れる / 泡が上る / 2階4階は水が出る / ×が順に出る
// 絵: 階の数直線。5階に線。それより上の階の蛇口に×、下には○
const Kb6eN5KaiYoriTakai: React.FC<{ f: number }> = ({ f }) => {
  const yOf = (n: number) => 800 - 60 * n;
  const rise = easeOut(seg(f, 4, 28));
  const top = lerp(806, yOf(5), rise) + Math.sin(f / 9) * 3.2 * rise;
  const FL: [number, boolean][] = [[2, true], [4, true], [6, false], [8, false], [10, false]];
  return (
    <Frame f={f} seed={901} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 階の数直線 ===== */}
      <FloorScale x={262} yTop={176} yBot={806} max={10} marks={[2, 4, 6, 8, 10]}
        dashedFrom={5} t={seg(f, 2, 16)} />
      {/* ===== 立管 ===== */}
      <rect x={712} y={170} width={96} height={636} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={7} />
      {/* 継ぎ目のフランジ */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <g key={n}>
          <rect x={700} y={yOf(n) - 9} width={120} height={18} rx={4}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 中の水 (5階まで) */}
      <g>
        <rect x={719} y={top} width={82} height={806 - top} fill={KPP.mizu} opacity={0.9} />
        <path d={`M 719 ${top} q 20 -11 41 0 q 21 11 41 0 l 0 12 l -82 0 Z`}
          fill={KPP.mizuDark} opacity={0.75} />
        {/* 泡 */}
        <g fill={KRP.white} opacity={0.55}>
          {Array.from({ length: 7 }, (_, i) => {
            const y = 800 - ((i * 44 + f * 2.6) % (806 - top));
            return <circle key={i} cx={740 + rnd(i * 3.1) * 42} cy={y} r={5 + rnd(i) * 5} />;
          })}
        </g>
      </g>
      {/* 根元のポンプ */}
      <circle cx={760} cy={806} r={30} fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={6} />
      {/* ===== 各階の枝管と蛇口 ===== */}
      {FL.map(([n, on], i) => (
        <g key={n}>
          <rect x={808} y={yOf(n) - 17} width={272} height={34}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <rect x={808} y={yOf(n) - 17} width={272} height={8}
            fill={BP.steelLight} opacity={0.8} />
          {/* 枝管の中の水 (5階より下だけ) */}
          {on && (
            <rect x={812} y={yOf(n) - 10} width={264} height={20}
              fill={KPP.mizu} opacity={0.8 * rise} />
          )}
          <Kb6eFaucet x={1080} y={yOf(n)} on={on ? 1 : 0} f={f} />
          {on
            ? <Maru x={1392} y={yOf(n)} s={0.5} t={seg(f, 20 + i * 4, 32 + i * 4)} stroke={16} />
            : <XMark x={1392} y={yOf(n)} s={0.82} t={seg(f, 20 + i * 4, 32 + i * 4)} />}
        </g>
      ))}
      {/* ===== 境い目 (5階) ===== */}
      <line x1={150} y1={yOf(5)} x2={1800} y2={yOf(5)} stroke={KRP.red}
        strokeWidth={9} strokeDasharray="26 20" opacity={0.92 * easeOut(seg(f, 14, 30))} />
      <ForceArrow x={616} y={806} len={lerp(0, 300, rise)} rot={-90} w={22}
        color={KPP.mizuDark} t={seg(f, 6, 24)} label="水圧" labelSize={38} />
      {/* ===== 札 ===== */}
      <TagPlate x={1660} y={yOf(5) + 4} text="5階" size={56} t={seg(f, 16, 30)} color={KRP.red} />
      <TagPlate x={1650} y={300} text="出ない" size={46} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={1650} y={672} text="出る" size={46} t={seg(f, 20, 34)} color={KRP.green} />
      <TagPlate x={388} y={768} text="ポンプが止まる" size={38} t={seg(f, 2, 16)} />
    </Frame>
  );
};

// ===== #269 高い建物は、誰か一人が発明した物ではありません。 =====
// 格: 図
// どこ: 図。方眼の上に、石の記念台座を1つだけ大きく。背景も人も置かない
// 演出: 台座の上の人影は「誰でもない」から薄れていく。銘板は空欄のまま。大きな×
// 動き: 人影が薄れる / 銘板の空欄の点線が流れる / ×が大きく出る / ？が揺れる
// 絵: 台座の上の一人の人影に大きな×。台座の銘板は空欄
const Kb6eHitoriDeNai: React.FC<{ f: number }> = ({ f }) => {
  const fade = 1 - 0.55 * easeOut(seg(f, 20, 42));
  const dash = -((f * 1.4) % 30);
  return (
    <Frame f={f} seed={902} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 台座 ===== */}
      <g>
        {/* 床と影 */}
        <line x1={120} y1={846} x2={1420} y2={846} stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={720} cy={846} rx={420} ry={20} fill={C.stoneDark} opacity={0.35} />
        {/* 下段 */}
        <rect x={390} y={798} width={660} height={48} fill={C.stone}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={390} y={798} width={660} height={12} fill={KRP.white} opacity={0.6} />
        {/* 中段 */}
        <rect x={430} y={756} width={580} height={44} fill={C.stone}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={430} y={756} width={580} height={11} fill={KRP.white} opacity={0.55} />
        {/* 胴 */}
        <rect x={470} y={470} width={500} height={288} fill={C.stone}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={930} y={470} width={40} height={288} fill={C.stoneDark} opacity={0.6} />
        {/* 石の目 (のみ跡) */}
        <g stroke={C.stoneDark} strokeWidth={3} opacity={0.45}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={484} y1={492 + i * 19} x2={484 + 34 + rnd(i) * 40} y2={492 + i * 19} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`r${i}`} x1={846 - rnd(i * 2) * 40} y1={498 + i * 19} x2={918} y2={498 + i * 19} />
          ))}
        </g>
        {/* 蛇腹 (上の飾り縁) */}
        <rect x={440} y={436} width={560} height={36} fill={C.stone}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={440} y={436} width={560} height={10} fill={KRP.white} opacity={0.6} />
        {/* ===== 空欄の銘板 ===== */}
        <rect x={528} y={548} width={384} height={146} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.grayDark} strokeWidth={6} strokeDasharray="16 14"
          strokeDashoffset={dash} opacity={0.75}>
          <line x1={560} y1={592} x2={880} y2={592} />
          <line x1={560} y1={634} x2={880} y2={634} />
          <line x1={560} y1={676} x2={790} y2={676} />
        </g>
        {/* 銘板の留め鋲 */}
        <Rivets x1={546} y1={564} x2={894} y2={564} n={5} r={7} fill={BP.brassDark} />
        <Rivets x1={546} y1={678} x2={894} y2={678} n={5} r={7} fill={BP.brassDark} />
      </g>
      {/* ===== 台座の上の人影 (誰でもない) ===== */}
      <g opacity={fade}>
        {/* 脚 */}
        <path d="M 684 436 L 684 330 L 756 330 L 756 436 Z" fill={C.dark} />
        <line x1={720} y1={436} x2={720} y2={340} stroke={KRP.cream} strokeWidth={5} opacity={0.5} />
        {/* 胴 */}
        <path d="M 652 340 q -6 -104 32 -126 l 72 0 q 38 22 32 126 Z" fill={C.dark} />
        {/* 腕 */}
        <path d="M 648 300 q -26 -40 -16 -82 l 22 -6 q 2 44 18 76 Z" fill={C.dark} />
        <path d="M 792 300 q 26 -40 16 -82 l -22 -6 q -2 44 -18 76 Z" fill={C.dark} />
        {/* 頭 */}
        <circle cx={720} cy={176} r={54} fill={C.dark} />
        <path d="M 684 214 q 36 22 72 0 l 0 14 l -72 0 Z" fill={C.dark} />
      </g>
      {/* ===== 大きな× ===== */}
      <XMark x={720} y={300} s={4.2} t={seg(f, 14, 34)} />
      {/* ===== 札 ===== */}
      <TagPlate x={1420} y={244} text="一人" size={50} t={seg(f, 6, 20)} color={KRP.red} />
      <Arrow x={968} y={296} s={1.3} rot={180} t={seg(f, 10, 24)} />
      <TagPlate x={1236} y={620} text="銘板" size={46} t={seg(f, 18, 32)} />
      <Arrow x={940} y={620} s={1.2} rot={180} t={seg(f, 22, 36)} />
      <QMark x={1520} y={660} s={1.5} f={f} t={seg(f, 28, 42)} />
      <TagPlate x={1448} y={772} text="空欄" size={46} t={seg(f, 32, 42)} color={KRP.grayDark} />
      <TagPlate x={300} y={204} text="発明者の像" size={44} t={seg(f, 2, 16)} />
    </Frame>
  );
};

// ===== #270 骨と、箱と、水と、灯りと、空気。 =====
// 格: 図
// どこ: 図。クリーム地に5本の柱だけを定位置で、画面の高さの半分 (500px) まで大きく
// 演出: 左から順に1本ずつ灯り、名札が出る。柱の肌 (鋲・真鍮の艶・結露・硝子の照り・亜鉛の斑) まで描く
// 動き: 柱の中身が動き続ける (かご・水・電球・空気) / 左から順に灯る / 名札が順に出る
// 絵: 5本の柱に名前の札が左から順に灯る。柱の表面の質感まで描く
const Kb6eHoneHakoMizuAkariKuuki: React.FC<{ f: number }> = ({ f }) => {
  const TOP = 230, HH = 500, PW = 150;
  const BASE = TOP + HH;
  const ids = ["hone", "hako", "mizu", "akari", "kuuki"] as const;
  const xs = [PX.hone, PX.hako, PX.mizu, PX.akari, PX.kuuki];
  const names = ["骨", "箱", "水", "灯り", "空気"];
  const subs = ["鉄の骨組み", "エレベーター", "ポンプと水槽", "電気", "換気と空調"];
  const tOf = (i: number) => seg(f, 3 + i * 6, 14 + i * 6);
  return (
    <Frame f={f} seed={903} bg={KRP.cream}>
      <GridPaper />
      {/* 地面 (柱の根が据わる線) */}
      <line x1={120} y1={BASE + 20} x2={1800} y2={BASE + 20}
        stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <g opacity={0.3}>
        {xs.map((x, i) => (
          <ellipse key={i} cx={x + 16} cy={BASE + 24} rx={PW * 0.72} ry={13}
            fill={C.stoneDark} />
        ))}
      </g>
      {/* 柱 (札は自分で置く) */}
      {ids.map((id, i) => {
        const t = tOf(i);
        const on = t > 0.5;
        return (
          <g key={id}>
            <Pillar id={id} f={f} x={xs[i]} top={TOP} h={HH} w={PW} label={false}
              dim={on ? 0 : 1} glow={on ? (Math.sin(f / 9) + 1) / 2 * 0.8 : 0} />
            {/* 柱の肌 */}
            {on && (
              <g opacity={0.85}>
                {/* 稜の照り */}
                <rect x={xs[i] - PW / 2 + 10} y={TOP + 6} width={13} height={HH - 12}
                  fill={KRP.white} opacity={0.4} />
                {id === "hone" && (
                  <g>
                    <Rivets x1={xs[i] - PW / 2 + 32} y1={TOP + 20} x2={xs[i] - PW / 2 + 32}
                      y2={BASE - 20} n={11} r={7} fill={KPP.honeDark} />
                    <Rivets x1={xs[i] + PW / 2 - 32} y1={TOP + 20} x2={xs[i] + PW / 2 - 32}
                      y2={BASE - 20} n={11} r={7} fill={KPP.honeDark} />
                  </g>
                )}
                {id === "hako" && (
                  <g>
                    {[0, 1, 2].map((k) => (
                      <rect key={k} x={xs[i] - PW / 2 + 18} y={TOP + 40 + k * 160}
                        width={PW - 36} height={16} fill={BP.brassLight} opacity={0.55}
                        transform={`rotate(-9 ${xs[i]} ${TOP + 48 + k * 160})`} />
                    ))}
                  </g>
                )}
                {id === "mizu" && (
                  <g fill={KRP.white} opacity={0.6}>
                    {Array.from({ length: 16 }, (_, k) => (
                      <circle key={k}
                        cx={xs[i] - PW / 2 + 22 + rnd(k * 2.7) * (PW - 44)}
                        cy={TOP + 24 + rnd(k * 5.1) * (HH - 48)}
                        r={3 + rnd(k * 1.3) * 4} />
                    ))}
                  </g>
                )}
                {id === "akari" && (
                  <g stroke={KRP.white} strokeWidth={5} opacity={0.5}>
                    {[0, 1, 2, 3].map((k) => (
                      <line key={k} x1={xs[i] - PW / 2 + 26} y1={TOP + 70 + k * 120}
                        x2={xs[i] - PW / 2 + 62} y2={TOP + 36 + k * 120} />
                    ))}
                  </g>
                )}
                {id === "kuuki" && (
                  <g fill={KPP.kuukiDark} opacity={0.5}>
                    {Array.from({ length: 22 }, (_, k) => (
                      <rect key={k}
                        x={xs[i] - PW / 2 + 16 + rnd(k * 3.3) * (PW - 32)}
                        y={TOP + 18 + rnd(k * 6.7) * (HH - 36)}
                        width={7} height={7} />
                    ))}
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}
      {/* 名札 (左から順に灯る) */}
      {names.map((n, i) => (
        <TagPlate key={n} x={xs[i]} y={786} text={n} size={48} t={tOf(i)} />
      ))}
      {subs.map((s, i) => (
        <TagPlate key={s} x={xs[i]} y={152} text={s} size={30} t={seg(f, 8 + i * 6, 19 + i * 6)}
          color={KRP.grayDark} />
      ))}
      {/* 本数 */}
      <TagPlate x={960} y={74} text="五本の柱" size={54} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #271 ★この五本の柱が、同じ20年に立ちました。 =====
// 格: 山
// どこ:
// 演出:
// 動き:
// 絵: ★5本柱の装置の全景。足元の地面に1880〜1900の帯。上のタワマン群が安定している。見上げる人2人
// #271 ★この五本の柱が、同じ20年に立ちました。(山)
// どこ: 夜明けの街の全景。手前の地面に1880〜1900の年表の帯、その奥に5本柱の装置。
// 演出: 章の色をいったん装置の色へ戻す。空は明るい薄桃〜水色。柱は抜かず倒さず、
//       上のタワマン群が水平に落ち着いている。帯が左から伸び、柱の名札が順に点く。
//       手前に見上げる人2人 (柱と柱のあいだの隙間に立たせて装置を隠さない)。
// 動き: 雲が流れる / 帯が左から伸びる (seg 6→30) / 名札が左から順に点く (〜42) /
//       2人が呼吸でゆれる / 装置の内側 (水・灯り) が f で動く。
const Kb6eOnaji20Nen: React.FC<{ f: number }> = ({ f }) => {
  // ★カメラ: 装置をひと回り引いて上へ送り、手前に地面を広く残す (#270 #272 と同じ構図にしない)。
  //   足元の年表の帯は、字幕の黒帯 (y=854) に絶対にかからない高さに置く。
  const Z = 0.82;
  const DY_ = -92;
  const sx = (x: number) => 960 - 960 * Z + x * Z;         // 装置のxを画面座標へ
  const feetY = 540 - 540 * Z + P_BOT * Z + DY_;           // 柱の足元 ≈ 681
  const gY = feetY + 16;                                   // 地面線 ≈ 697
  // 年表の帯 (地面線のすぐ下。下端 759 = 字幕帯まで 95px の余裕)
  const bandL = 150;
  const bandR = 1790;
  const bandT = 705;
  const bandB = 759;
  const grow = easeOut(seg(f, 6, 30));
  const names: [string, string][] = [
    ["hone", "骨"], ["hako", "箱"], ["mizu", "水"], ["akari", "灯り"], ["kuuki", "空気"],
  ];
  return (
    <Frame f={f} seed={904} bg={KRP.cream}>
      {/* --- 夜明けの空 --- */}
      <rect x={0} y={0} width={W} height={gY} fill="#EAF2F6" />
      <rect x={0} y={0} width={W} height={300} fill="#FBEDE2" opacity={0.85} />
      <circle cx={1660} cy={176} r={92} fill="#FBD9A6" opacity={0.5} />
      <circle cx={1660} cy={176} r={52} fill="#FCE9C4" opacity={0.75} />
      {[0, 1, 2, 3, 4].map((i) => {
        const bx = ((rnd(i * 7 + 3) * 2200) + f * (1.1 + i * 0.35)) % 2320 - 200;
        const by = 92 + rnd(i * 11 + 5) * 190;
        const bs = 0.7 + rnd(i * 13 + 1) * 0.7;
        return (
          <g key={`cl${i}`} transform={`translate(${bx} ${by}) scale(${bs})`} opacity={0.62}>
            <ellipse cx={0} cy={0} rx={96} ry={34} fill={KRP.white} />
            <ellipse cx={-62} cy={12} rx={54} ry={24} fill={KRP.white} />
            <ellipse cx={58} cy={14} rx={62} ry={25} fill={KRP.white} />
            <ellipse cx={-10} cy={-24} rx={52} ry={28} fill={KRP.white} />
          </g>
        );
      })}
      {/* 遠景の低い街 (装置の奥) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const bw = 112 + rnd(i * 5 + 2) * 86;
        const bh = 70 + rnd(i * 9 + 4) * 110;
        const bx = -40 + i * 222 + rnd(i * 3 + 7) * 40;
        return (
          <rect key={`fb${i}`} x={bx} y={gY - bh} width={bw} height={bh}
            fill="#CBD8DF" stroke="#AFC0C9" strokeWidth={3} opacity={0.75} />
        );
      })}

      {/* --- 地面 --- */}
      <rect x={0} y={gY} width={W} height={H - gY} fill="#E6DECD" />
      <line x1={0} y1={gY} x2={W} y2={gY} stroke={KRP.ink} strokeWidth={5} />

      {/* --- 1880〜1900 の帯 (足元の年表) --- */}
      <g clipPath="url(#kb6e271clip)">
        <defs>
          <clipPath id="kb6e271clip">
            <rect x={bandL} y={bandT - 10} width={(bandR - bandL) * grow + 2} height={bandB - bandT + 24} />
          </clipPath>
        </defs>
        <rect x={bandL} y={bandT} width={bandR - bandL} height={bandB - bandT}
          rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 1年きざみの目盛り */}
        {Array.from({ length: 21 }).map((_, i) => {
          const tx = bandL + (i * (bandR - bandL)) / 20;
          const big = i % 5 === 0;
          return (
            <line key={`tk${i}`} x1={tx} y1={bandT + (big ? 4 : 18)} x2={tx} y2={bandB - 4}
              stroke={big ? KRP.ink : KRP.grayDark} strokeWidth={big ? 5 : 3} />
          );
        })}
        <rect x={bandL + 4} y={bandT + 4} width={bandR - bandL - 8} height={(bandB - bandT) / 2 - 4}
          fill={C.gold} opacity={0.3} />
        {/* 年の文字は手前の2人に隠れない位置へ (帯の端から内側へ寄せる) */}
        <text x={bandL + 156} y={bandB - 14} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={40} fill={KRP.ink}>1880</text>
        <text x={bandR - 156} y={bandB - 14} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={40} fill={KRP.ink}>1900</text>
        <text x={960} y={bandB - 15} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={36} fill={KRP.red}>20年</text>
      </g>

      {/* --- 5本柱の装置 (抜かない・倒さない = 安定) --- */}
      <g transform={`translate(0 ${DY_}) ${zoomAt(Z, 960, 540)}`}>
        <TowerOnPillars f={f} labels={false} />
      </g>

      {/* --- 柱の名札 (左から順に点く) --- */}
      {names.map(([id, label], i) => {
        const t = seg(f, 4 + i * 6, 16 + i * 6);
        return (
          <TagPlate key={id} x={sx(PX[id as keyof typeof PX])} y={632}
            text={label} size={40} t={t} fill={KRP.white} />
        );
      })}

      {/* --- 見上げる人2人 (帯より手前。足元は帯の下の地面に着く = 奥行きが出る) --- */}
      <Person x={150} y={772} s={0.86} f={f} phase={0}
        cloth="#3E4B66" clothDark="#2E3850" gaze={[0.6, -0.8]} />
      <Person x={1770} y={772} s={0.83} f={f} phase={1.4}
        cloth="#6E4B3A" clothDark="#53372A" gaze={[-0.6, -0.8]} />

      {/* --- 見出し --- */}
      <TagPlate x={960} y={96} text="同じ20年" size={50} t={pop(seg(f, 0, 12))}
        fill={C.gold} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb6_pump_ga_tomatta: (f) => <Kb6ePumpGaTomatta f={f} />,
  kb6_hashira_wo_1hon: (f) => <Kb6eHashiraWo1Hon f={f} />,
  kb6_kaidan_de_hakobu: (f) => <Kb6eKaidanDeHakobu f={f} />,
  kb6_170nen_mae_to_onaji: (f) => <Kb6eN170NenMaeToOnaji f={f} />,
  kb6_6ka_go: (f) => <Kb6eN6KaGo f={f} />,
  kb6_17ka_kakatta: (f) => <Kb6eN17KaKakatta f={f} />,
  kb6_ny_2003: (f) => <Kb6eNy2003 f={f} />,
  kb6_5kai_yori_takai: (f) => <Kb6eN5KaiYoriTakai f={f} />,
  kb6_hitori_de_nai: (f) => <Kb6eHitoriDeNai f={f} />,
  kb6_hone_hako_mizu_akari_kuuki: (f) => <Kb6eHoneHakoMizuAkariKuuki f={f} />,
  kb6_onaji_20nen: (f) => <Kb6eOnaji20Nen f={f} />,
};

export const K_B6E_MOTIFS: string[] = [
  "kb6_pump_ga_tomatta",             // #261 ポンプが止まったからです。
  "kb6_hashira_wo_1hon",             // #262 ★電気の柱を1本抜くと、水の柱も一緒に倒れます。
  "kb6_kaidan_de_hakobu",            // #263 住民は、階段で水を運びました。
  "kb6_170nen_mae_to_onaji",         // #264 ★170年前のパリと、同じことをしています。
  "kb6_6ka_go",                      // #265 エレベーターが動いたのは、6日後。
  "kb6_17ka_kakatta",                // #266 電気が全部戻るまで、17日かかりました。
  "kb6_ny_2003",                     // #267 ニューヨークの2003年の大停電でも、同じでした。
  "kb6_5kai_yori_takai",             // #268 5階より高い建物では、水圧が戻るまで水は出ない。
  "kb6_hitori_de_nai",               // #269 高い建物は、誰か一人が発明した物ではありません。
  "kb6_hone_hako_mizu_akari_kuuki",  // #270 骨と、箱と、水と、灯りと、空気。
  "kb6_onaji_20nen",                 // #271 ★この五本の柱が、同じ20年に立ちました。
];

export const kosoB6eScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
