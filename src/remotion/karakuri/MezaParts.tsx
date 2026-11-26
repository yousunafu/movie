// 「人はなぜ、自力で起きられないのか」(目覚まし回): 全巻で共有する装置と、何度も出てくる舞台。
// 設計書: docs/meza-design-common.md「共有装置」が正本 (部品の名前・props・使い道)。
//
// ★ここにある物は、別々の絵師が別々の章で描く「同じ物」。毎回この部品を使い、描き直さない (絵のブレ禁止)。
// ★props の形 (シグネチャ) を勝手に変えない。並走中の全員がこの形で呼ぶ。
// ★舞台の部品 (Shinshitsu / Shudouin / TokiNoKane / BanninTou / KoujouMon / MachiNami) は
//   1920×1080 の <svg> の中にそのまま置く <g>。人は入っていない (手前にシーン側で重ねる)。
// ★小物の部品 (SumahoAlarm / TainaiDokei / Kobito / KnockerUp / BellClock / Clocky / NazoBell) は x, y, s で置く <g>。

import React from "react";
import { KRP, KARAKURI_FONT, seg, easeOut, clamp01, pop, Person } from "./KarakuriScenes";

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "hang" | "sit";

const FONT = KARAKURI_FONT;
const INK = KRP.ink;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const useSafeId = (p: string) => p + React.useId().replace(/[^a-zA-Z0-9]/g, "");

// 装置専用の色 (シーン側でも使ってよい)
export const MP = {
  // 「あなた」の水色のパジャマ (全編この色)
  you: "#8EC6E6",
  youDark: "#5E9BC2",
  // 空と光
  night: "#2A3358",
  nightDeep: "#161C38",
  dawn: "#F0A35E",
  dawnSoft: "#F8D2A2",
  morning: "#BFE1F3",
  mist: "#E9E7EF",
  // 目覚まし
  bell: "#D8432F",
  bellDark: "#A12D1E",
  brass: "#D9B23C",
  brassDark: "#A8862A",
  brassLight: "#F3DC8A",
  // 修道院
  habit: "#2F2A30",
  habitMid: "#4A4450",
  stone: "#B8AF9F",
  stoneDark: "#8C8373",
  stoneLight: "#D2CABC",
  // 木・れんが・鉄
  wood: "#B5814F",
  woodDark: "#7B5331",
  woodLight: "#D8AD76",
  brick: "#B45A3D",
  brickDark: "#86412E",
  brickLight: "#C9714F",
  mortar: "#D9C8B0",
  iron: "#3C4047",
  ironLight: "#646A73",
  soot: "#3A3433",
  // 炎
  flame: "#FFC24A",
  flameCore: "#FFF4BE",
  glow: "#FFE7A0",
  // 体の中の小人
  kobitoHelmet: "#F2C230",
  kobitoCloth: "#3F6FB6",
  kobitoClothDark: "#2D5290",
} as const;

// ===== 色を混ぜる =====
const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mixColor = (a: string, b: string, t: number) => {
  const A = hexRgb(a), B = hexRgb(b), k = clamp01(t);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
};

// ===== 空の色 (sky: 0=夜, 1=夜明け, 2=朝) =====
const SKY_TOP = ["#1B2346", "#5A5890", "#83BDE6"];
const SKY_BOT = ["#34426F", "#F2A363", "#DDF0F8"];
export const skyColors = (sky: number): [string, string] => {
  const v = Math.min(Math.max(sky, 0), 2);
  const i = v >= 1 ? 1 : 0;
  const t = v - i;
  return [mixColor(SKY_TOP[i], SKY_TOP[i + 1], t), mixColor(SKY_BOT[i], SKY_BOT[i + 1], t)];
};
// 空を横じまの帯で塗る (グラデーションの id がぶつからない)
const SkyBands: React.FC<{ x: number; y: number; w: number; h: number; sky: number; n?: number }> = ({ x, y, w, h, sky, n = 12 }) => {
  const [t, b] = skyColors(sky);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y + (h / n) * i - 0.5} width={w} height={h / n + 1} fill={mixColor(t, b, Math.pow(i / (n - 1), 1.3))} />
      ))}
    </g>
  );
};
// 星 (夜ほど濃い。f でまたたく)
const Stars: React.FC<{ pts: [number, number][]; sky: number; f: number }> = ({ pts, sky, f }) => {
  const o = clamp01(1 - sky * 1.3);
  if (o <= 0) return null;
  return (
    <g>
      {pts.map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 3.2 : 2.2} fill="#FFF6D8"
          opacity={o * (0.55 + 0.45 * Math.sin(f / 9 + i * 1.7))} />
      ))}
    </g>
  );
};

// ===== ろうそく・ランプの炎 (x,y=炎の根元) =====
export const Flame: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; glow?: number }> = ({ x, y, s = 1, f, phase = 0, glow = 1 }) => {
  const sw = Math.sin((f + phase * 23) / 4.3) * 3 + Math.sin((f + phase * 11) / 1.9) * 1.2;
  const hh = 30 + Math.sin((f + phase * 7) / 3.1) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow > 0 && <circle cx={0} cy={-14} r={46} fill={MP.glow} opacity={0.22 * glow} />}
      {glow > 0 && <circle cx={0} cy={-14} r={24} fill={MP.glow} opacity={0.3 * glow} />}
      <path d={`M 0 0 C -10 -4 -11 ${-hh * 0.45} ${sw * 0.5} ${-hh * 0.75} Q ${sw} ${-hh * 0.95} ${sw * 1.2} ${-hh} Q ${4 + sw * 0.6} ${-hh * 0.6} 10 -10 C 10 -2 4 0 0 0 Z`}
        fill={MP.flame} stroke="#D9822C" strokeWidth={2} />
      <path d={`M 0 -3 C -5 -6 -5 ${-hh * 0.35} ${sw * 0.4} ${-hh * 0.55} Q ${3 + sw * 0.3} ${-hh * 0.35} 5 -8 C 5 -4 2 -3 0 -3 Z`} fill={MP.flameCore} />
      <line x1={0} y1={2} x2={0} y2={-6} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
};

// ===== 音の線 (鳴っている物のまわりの「))」) =====
const SoundArcs: React.FC<{ x: number; y: number; r?: number; amt: number; f: number; side?: 1 | -1 | 0; color?: string; w?: number }> = ({ x, y, r = 40, amt, f, side = 0, color = INK, w = 6 }) => {
  if (amt <= 0.02) return null;
  const sides = side === 0 ? [-1, 1] : [side];
  const pulse = (Math.floor(f / 3) % 2) * 6;
  return (
    <g opacity={clamp01(amt * 1.4)}>
      {sides.map((sd) => [0, 1, 2].map((k) => {
        const rr = r + k * 22 + pulse;
        const a0 = (-40 * Math.PI) / 180, a1 = (40 * Math.PI) / 180;
        const p0 = [x + sd * Math.cos(a0) * rr, y + Math.sin(a0) * rr];
        const p1 = [x + sd * Math.cos(a1) * rr, y + Math.sin(a1) * rr];
        return <path key={`${sd}${k}`} d={`M ${p0[0]} ${p0[1]} A ${rr} ${rr} 0 0 ${sd === 1 ? 1 : 0} ${p1[0]} ${p1[1]}`}
          stroke={color} strokeWidth={w - k} fill="none" strokeLinecap="round" opacity={1 - k * 0.22} />;
      }))}
    </g>
  );
};

// ===== 時計の文字盤 (12時間。BellClock・寝室の壁時計・工場の門の時計で共通) =====
const ClockFace: React.FC<{ r: number; minutes: number; f: number; numbers?: boolean; roman?: boolean; second?: boolean; face?: string; ticks?: boolean }> = ({
  r, minutes, f, numbers = true, roman = false, second = true, face = KRP.white, ticks = true,
}) => {
  const mA = ((minutes % 60) / 60) * 360;
  const hA = (((minutes / 60) % 12) / 12) * 360;
  const sA = (Math.floor(f / 30) * 6) % 360;
  const ROM = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  return (
    <g>
      <circle r={r} fill={face} stroke={INK} strokeWidth={Math.max(3, r * 0.05)} />
      {ticks && Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0;
        const r0 = r * (big ? 0.8 : 0.86), r1 = r * 0.92;
        return <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * r1} y2={-Math.cos(a) * r1}
          stroke={INK} strokeWidth={big ? Math.max(2.5, r * 0.035) : Math.max(1.2, r * 0.014)} strokeLinecap="round" />;
      })}
      {numbers && Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i;
        const a = (i * 30 * Math.PI) / 180, rr = r * (roman ? 0.64 : 0.66);
        return <text key={i} x={Math.sin(a) * rr} y={-Math.cos(a) * rr + r * 0.075} textAnchor="middle"
          fontFamily={roman ? "serif" : FONT} fontWeight={roman ? 700 : 800} fontSize={r * (roman ? 0.15 : 0.2)} fill={INK}>
          {roman ? ROM[i] : n}</text>;
      })}
      <line x1={0} y1={r * 0.08} x2={0} y2={-r * 0.48} stroke={INK} strokeWidth={Math.max(4, r * 0.075)} strokeLinecap="round" transform={`rotate(${hA})`} />
      <line x1={0} y1={r * 0.1} x2={0} y2={-r * 0.72} stroke={INK} strokeWidth={Math.max(3, r * 0.05)} strokeLinecap="round" transform={`rotate(${mA})`} />
      {second && <line x1={0} y1={r * 0.16} x2={0} y2={-r * 0.8} stroke={KRP.red} strokeWidth={Math.max(1.5, r * 0.02)} transform={`rotate(${sA})`} />}
      <circle r={Math.max(4, r * 0.07)} fill={INK} />
      <circle r={Math.max(1.5, r * 0.025)} fill={MP.brass} />
    </g>
  );
};

// ===== 木目の線 (板の上に数本) =====
const Grain: React.FC<{ x: number; y: number; w: number; h: number; n?: number; seed?: number; color?: string; vertical?: boolean }> = ({ x, y, w, h, n = 3, seed = 1, color = MP.woodDark, vertical = false }) => (
  <g stroke={color} strokeWidth={2.2} fill="none" opacity={0.45} strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const k = (i + 1) / (n + 1);
      const wv = 3 + ((seed * 7 + i * 5) % 5);
      if (vertical) {
        const gx = x + w * k;
        return <path key={i} d={`M ${gx} ${y + 4} Q ${gx + wv} ${y + h * 0.35} ${gx - wv * 0.6} ${y + h * 0.6} T ${gx + 1} ${y + h - 4}`} />;
      }
      const gy = y + h * k;
      return <path key={i} d={`M ${x + 6} ${gy} Q ${x + w * 0.3} ${gy - wv} ${x + w * 0.55} ${gy + wv * 0.4} T ${x + w - 6} ${gy - 1}`} />;
    })}
  </g>
);

// ===== れんがの壁 (x,y,w,h の範囲を目地つきで敷く) =====
const BrickWall: React.FC<{ x: number; y: number; w: number; h: number; bw?: number; bh?: number; base?: string; dark?: string; light?: string; mortar?: string; seed?: number }> = ({
  x, y, w, h, bw = 64, bh = 26, base = MP.brick, dark = MP.brickDark, light = MP.brickLight, mortar = MP.mortar, seed = 3,
}) => {
  const rows = Math.ceil(h / bh);
  const cols = Math.ceil(w / bw) + 1;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={mortar} />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const off = r % 2 ? bw / 2 : 0;
        const bx = x + c * bw - off;
        const by = y + r * bh;
        const v = (r * 13 + c * 7 + seed) % 9;
        const fill = v === 0 ? dark : v === 4 ? light : base;
        const x0 = Math.max(bx + 2, x), x1 = Math.min(bx + bw - 2, x + w);
        const y1 = Math.min(by + bh - 2, y + h);
        if (x1 - x0 < 3 || y1 - (by + 2) < 3) return null;
        return <rect key={`${r}-${c}`} x={x0} y={by + 2} width={x1 - x0} height={y1 - by - 2} fill={fill} />;
      }))}
    </g>
  );
};

// ===== 石積みの壁 (修道院・塔。大きさのそろわない切り石) =====
const StoneWall: React.FC<{ x: number; y: number; w: number; h: number; sh?: number; base?: string; dark?: string; light?: string; seed?: number }> = ({
  x, y, w, h, sh = 70, base = MP.stone, dark = MP.stoneDark, light = MP.stoneLight, seed = 5,
}) => {
  const rows = Math.ceil(h / sh);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={dark} />
      {Array.from({ length: rows }, (_, r) => {
        const out: React.ReactNode[] = [];
        let cx = x - ((r * 37 + seed * 11) % 60);
        let c = 0;
        while (cx < x + w) {
          const bw = 90 + ((r * 31 + c * 17 + seed * 5) % 70);
          const v = (r * 5 + c * 3 + seed) % 7;
          const fill = v === 0 ? light : v === 3 ? mixColor(base, dark, 0.35) : base;
          const x0 = Math.max(cx + 3, x), x1 = Math.min(cx + bw - 3, x + w);
          const y0 = y + r * sh + 3, y1 = Math.min(y + (r + 1) * sh - 3, y + h);
          if (x1 - x0 > 6 && y1 - y0 > 6) {
            out.push(<rect key={`${r}-${c}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={7} fill={fill} />);
            if (v === 5) out.push(<path key={`k${r}-${c}`} d={`M ${x0 + 12} ${y0 + 14} l 18 8 l 10 -4`} stroke={dark} strokeWidth={2} fill="none" opacity={0.6} />);
          }
          cx += bw;
          c++;
        }
        return <g key={r}>{out}</g>;
      })}
    </g>
  );
};

/* ===================================================================
 * Shinshitsu — あなたの寝室 (序・7章。#1〜#5・#9〜#11・#16・#36・#152・#153・#211〜#213 で同じ部屋)
 *   画面いっぱいの舞台。ベッドは右が頭 (枕 1075,628)・左が足。右にナイトテーブルとスマホ・壁時計。
 *   窓は上の真ん中 (x 520〜980, y 110〜480)。カーテン・外の町並み。
 *   f: カーテンのゆれ・寝息 (掛け布団の上下)・Zzz・秒針
 *   sky: 0=夜 → 1=夜明け → 2=朝 (窓の外の空・部屋の暗さ・差し込む光)
 *   sleeper: 0=だれも寝ていない (布団がたたまれて平ら) / 0より大=あなたが寝ている (顔は枕の上)。
 *            0.8 以上で、布団を鼻の下まで引き上げた「深い眠り」
 *   alarms: 鳴っているスマホのアラームの数 (0=鳴っていない。1以上で画面が光って震え、赤い数字が付く)
 *   arm: (省略可) 0〜1 で布団から腕が伸びてスマホに届く (#2 寝たまま止める)
 *   head: (省略可) false で寝ている顔を描かない (シーン側で別の顔を描くとき)
 *   time: (省略可) 壁時計の時刻 (0時からの分)。既定 6:00
 *   lamp: (省略可) ナイトテーブルのランプをつける
 * =================================================================== */
export const SHIN = { pillow: [1075, 628], head: [1088, 590], phone: [1330, 606], floorY: 830, clock: [1360, 250] } as const;
export const Shinshitsu: React.FC<{
  f: number; sky?: number; sleeper?: number; alarms?: number; arm?: number; head?: boolean; time?: number; lamp?: boolean;
}> = ({ f, sky = 0, sleeper = 0.5, alarms = 0, arm = 0, head = true, time = 6 * 60, lamp = false }) => {
  const clip = useSafeId("shinWin");
  const dim = 0.52 * clamp01(1 - sky / 1.45);
  const breathe = sleeper > 0 ? Math.sin(f / 21) * 5 : 0;
  const sw = Math.sin(f / 37) * 5 + Math.sin(f / 13) * 1.5;
  const ring = alarms > 0;
  const jit = ring ? Math.sin(f * 2.7) * 3 : 0;
  const deep = sleeper >= 0.8;
  const BL = "#EFC46A", BLD = "#C99A3E";
  const by = (v: number) => v - breathe;
  const blanket = sleeper > 0
    ? `M 1010 650 C 1000 ${by(612)} 960 ${by(598)} 900 ${by(594)} C 800 ${by(586)} 730 ${by(600)} 650 ${by(590)} C 570 ${by(556)} 470 ${by(558)} 410 ${by(590)} C 340 ${by(610)} 290 614 254 642 L 244 700 L 244 792 Q 620 806 1010 792 Z`
    : "M 1010 648 Q 630 638 254 646 L 244 700 L 244 792 Q 620 806 1010 792 Z";
  // 腕 (肩 → ひじ → 手)。arm で手がスマホへ
  const ak = easeOut(clamp01(arm));
  const hand: [number, number] = [lerp(1010, SHIN.phone[0] - 18, ak), lerp(650, SHIN.phone[1] + 8, ak)];
  const c1: [number, number] = [lerp(1000, 1130, ak), lerp(650, 700, ak)];
  const c2: [number, number] = [lerp(1010, 1214, ak), lerp(650, 430, ak)];
  const curtain = (c: string) => mixColor(c, MP.nightDeep, dim * 0.9);
  const zs = [0, 1, 2];
  return (
    <g>
      {/* 壁紙 (細い縦じま) */}
      <rect x={-40} y={-40} width={2000} height={880} fill="#E9DAC2" />
      <g fill="#DCC8AA" opacity={0.7}>
        {Array.from({ length: 34 }, (_, i) => <rect key={i} x={-30 + i * 60} y={-40} width={12} height={880} />)}
      </g>
      <g fill="#C9B08C" opacity={0.6}>
        {Array.from({ length: 34 }, (_, i) => Array.from({ length: 8 }, (_, j) => (
          <circle key={`${i}-${j}`} cx={6 + i * 60} cy={60 + j * 100 + (i % 2) * 50} r={3} />
        )))}
      </g>
      {/* 天井の回り縁 */}
      <rect x={-40} y={-40} width={2000} height={56} fill="#F3EADB" stroke={INK} strokeWidth={5} />
      {/* 左の壁の絵 (山の朝日) */}
      <g>
        <rect x={190} y={200} width={200} height={150} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <rect x={206} y={216} width={168} height={118} fill="#F7E6C4" stroke={INK} strokeWidth={3} />
        <circle cx={300} cy={290} r={22} fill={MP.dawn} />
        <path d="M 206 334 L 260 262 L 296 304 L 330 270 L 374 334 Z" fill="#7E9C8A" stroke={INK} strokeWidth={3} />
        <path d="M 260 262 L 248 278 L 272 280 Z" fill={KRP.white} />
        <line x1={290} y1={200} x2={290} y2={160} stroke={INK} strokeWidth={2.5} />
        <circle cx={290} cy={158} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />
      </g>
      {/* 右のドア */}
      <g>
        <rect x={1620} y={150} width={290} height={690} fill="#CFA978" stroke={INK} strokeWidth={7} />
        <rect x={1660} y={196} width={210} height={250} rx={8} fill="none" stroke={MP.woodDark} strokeWidth={5} opacity={0.6} />
        <rect x={1660} y={486} width={210} height={300} rx={8} fill="none" stroke={MP.woodDark} strokeWidth={5} opacity={0.6} />
        <Grain x={1620} y={150} w={290} h={690} n={4} seed={3} vertical />
        <circle cx={1652} cy={500} r={14} fill={MP.brass} stroke={INK} strokeWidth={4} />
        <rect x={1642} y={516} width={20} height={30} rx={4} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
      </g>
      {/* 壁時計 */}
      <g transform={`translate(${SHIN.clock[0]} ${SHIN.clock[1]})`}>
        <line x1={0} y1={-90} x2={0} y2={-130} stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={-132} r={6} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
        <circle r={92} fill={MP.wood} stroke={INK} strokeWidth={7} />
        <circle r={92} fill="none" stroke={MP.woodLight} strokeWidth={4} opacity={0.6} transform="scale(0.93)" />
        <ClockFace r={76} minutes={time} f={f} />
        <path d="M -52 -42 Q -30 -64 -2 -68" stroke={KRP.white} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.55} />
      </g>
      {/* 窓わく (ガラスの中身は暗さの上から描く) */}
      <g>
        <rect x={496} y={86} width={508} height={418} rx={6} fill="#F5EFE3" stroke={INK} strokeWidth={8} />
        <rect x={518} y={108} width={464} height={374} fill="#2A2F45" stroke={INK} strokeWidth={4} />
        <rect x={744} y={108} width={12} height={374} fill="#F5EFE3" stroke={INK} strokeWidth={3} />
        <rect x={518} y={289} width={464} height={12} fill="#F5EFE3" stroke={INK} strokeWidth={3} />
        <rect x={476} y={500} width={548} height={26} rx={5} fill="#F5EFE3" stroke={INK} strokeWidth={6} />
        {/* 窓台の小さな植木鉢 */}
        <path d="M 880 500 L 874 462 L 930 462 L 924 500 Z" fill="#C46F4A" stroke={INK} strokeWidth={4} />
        {[-1, 0, 1].map((k) => <ellipse key={k} cx={902 + k * 14} cy={440 - Math.abs(k) * -6} rx={9} ry={22} fill="#6E9E62" stroke={INK} strokeWidth={3}
          transform={`rotate(${k * 24 + Math.sin(f / 40 + k) * 2} ${902} 462)`} />)}
      </g>
      {/* 床 (板張り) */}
      <rect x={-40} y={830} width={2000} height={300} fill="#C8986A" />
      <g stroke="#A97B50" strokeWidth={4}>
        {[880, 945, 1020].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={(i * 233) % 1900 + 40} y1={830 + (i % 3) * 50 + (i % 3 ? 50 : 0)} x2={(i * 233) % 1900 + 40} y2={880 + (i % 3) * 65} />)}
      </g>
      <rect x={-40} y={812} width={2000} height={22} fill="#F3EADB" stroke={INK} strokeWidth={5} />
      {/* じゅうたん */}
      <ellipse cx={680} cy={970} rx={390} ry={62} fill="#7F9CC6" stroke={INK} strokeWidth={6} />
      <ellipse cx={680} cy={970} rx={340} ry={44} fill="none" stroke="#B9CBE4" strokeWidth={5} strokeDasharray="14 10" />
      {/* スリッパ */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${1150 + i * 70} ${905 + i * 8}) rotate(${-8 + i * 12})`}>
          <ellipse cx={0} cy={0} rx={38} ry={14} fill={MP.you} stroke={INK} strokeWidth={4} />
          <path d="M 4 -12 Q 30 -16 36 0 Q 30 10 4 12 Z" fill={MP.youDark} stroke={INK} strokeWidth={3} />
        </g>
      ))}
      {/* ベッド: 足板 (左)・頭板 (右)・側の板・脚 */}
      <rect x={214} y={604} width={42} height={236} rx={10} fill={MP.wood} stroke={INK} strokeWidth={6} />
      <Grain x={214} y={604} w={42} h={236} n={1} seed={5} vertical />
      <rect x={1180} y={516} width={74} height={324} rx={16} fill={MP.wood} stroke={INK} strokeWidth={7} />
      <rect x={1196} y={540} width={42} height={90} rx={10} fill="none" stroke={MP.woodDark} strokeWidth={4} opacity={0.55} />
      <Grain x={1180} y={640} w={74} h={190} n={2} seed={2} vertical />
      <rect x={250} y={650} width={940} height={76} rx={20} fill="#F6F1E7" stroke={INK} strokeWidth={6} />
      <line x1={270} y1={704} x2={1170} y2={704} stroke="#D8CFC0" strokeWidth={3} strokeDasharray="10 8" />
      <rect x={240} y={724} width={950} height={58} rx={8} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
      <Grain x={240} y={724} w={950} h={58} n={2} seed={7} />
      {[256, 1160].map((lx) => <rect key={lx} x={lx} y={782} width={28} height={50} rx={5} fill={MP.woodDark} stroke={INK} strokeWidth={5} />)}
      {/* 枕 */}
      <ellipse cx={SHIN.pillow[0]} cy={SHIN.pillow[1]} rx={108} ry={42} fill={KRP.white} stroke={INK} strokeWidth={6} />
      <path d="M 1000 618 Q 1030 630 1060 622 M 1110 640 Q 1130 632 1150 638" stroke="#CFC6B8" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {/* 寝ている顔 (右が頭の上) */}
      {sleeper > 0 && head && (
        <g transform={`translate(${SHIN.head[0]} ${SHIN.head[1] + breathe * 0.2}) rotate(66) scale(0.84) translate(0 228)`}>
          <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
          <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={INK} />
          <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
            <path d="M -36 -222 Q -24 -212 -12 -222" />
            <path d="M 12 -222 Q 24 -212 36 -222" />
            <line x1={-34} y1={-246} x2={-14} y2={-247} />
            <line x1={14} y1={-247} x2={34} y2={-246} />
          </g>
          <ellipse cx={-38} cy={-200} rx={11} ry={6} fill="#F2A7A0" opacity={0.6} />
          <ellipse cx={38} cy={-200} rx={11} ry={6} fill="#F2A7A0" opacity={0.6} />
          <ellipse cx={0} cy={-186} rx={6 + Math.sin(f / 21) * 1.5} ry={7 + Math.sin(f / 21) * 2} fill={INK} />
        </g>
      )}
      {/* 掛け布団 (チェックの線) */}
      <path d={blanket} fill={BL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <g stroke={BLD} strokeWidth={4} opacity={0.55}>
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={300 + i * 80} y1={sleeper > 0 ? 690 : 662} x2={296 + i * 80} y2={796} />)}
        <line x1={250} y1={742} x2={1008} y2={742} />
        <line x1={250} y1={760} x2={1008} y2={760} />
      </g>
      {/* 布団のふち (白い折り返し) */}
      {sleeper > 0 ? (
        <path d={`M 1010 650 C 1000 ${by(612)} 960 ${by(598)} 900 ${by(594)} L 892 ${by(614)} C 940 ${by(620)} 966 632 972 662 L 975 794 L 1012 792 Z`}
          fill={KRP.white} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      ) : (
        <path d="M 1010 648 L 900 646 L 896 664 Q 950 668 976 700 L 978 794 L 1012 792 Z" fill={KRP.white} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      {/* 深い眠り: 布団を鼻の下まで */}
      {sleeper > 0 && deep && head && (
        <g>
          <path d={`M 940 ${by(616)} Q 990 ${by(574)} 1050 ${by(584)} Q 1100 ${by(590)} 1112 640 Q 1060 660 960 654 Z`} fill={BL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M 946 ${by(610)} Q 992 ${by(570)} 1050 ${by(579)} Q 1094 ${by(586)} 1106 628`} stroke={KRP.white} strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* ナイトテーブル */}
      <g>
        <rect x={1262} y={644} width={216} height={22} rx={5} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <rect x={1274} y={664} width={192} height={140} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={1288} y={680} width={164} height={52} rx={5} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <circle cx={1370} cy={706} r={8} fill={MP.brass} stroke={INK} strokeWidth={3} />
        <Grain x={1288} y={744} w={164} h={56} n={2} seed={4} />
        {[1280, 1444].map((lx) => <rect key={lx} x={lx} y={802} width={16} height={30} fill={MP.woodDark} stroke={INK} strokeWidth={4} />)}
        {/* ランプ */}
        <ellipse cx={1430} cy={644} rx={30} ry={8} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
        <rect x={1424} y={572} width={12} height={72} fill={MP.brass} stroke={INK} strokeWidth={4} />
        <path d="M 1388 574 L 1404 506 L 1456 506 L 1472 574 Z" fill={lamp ? "#FFE9B0" : "#E8D9BE"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1396 556 L 1464 556" stroke="#CDB894" strokeWidth={3} opacity={0.7} />
        {/* 水のコップ */}
        <path d="M 1386 644 L 1382 598 L 1410 598 L 1406 644 Z" fill="#DCEFF8" stroke={INK} strokeWidth={3.5} opacity={0.95} />
        <path d="M 1384 616 L 1408 616 L 1406 644 L 1386 644 Z" fill="#A9D2EA" opacity={0.7} />
        {/* スマホ (立てかけ) */}
        <path d="M 1306 646 L 1318 628 L 1352 628 L 1356 646 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={3.5} />
        <g transform={`translate(${SHIN.phone[0] + jit} ${SHIN.phone[1]}) rotate(-10)`}>
          <rect x={-24} y={-42} width={48} height={84} rx={9} fill="#2B2D33" stroke={INK} strokeWidth={4.5} />
          <rect x={-19} y={-35} width={38} height={68} rx={5} fill={ring ? "#CFE9FF" : "#1C2030"} />
          {ring ? (
            <g>
              <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={13} fill={INK}>6:{String(Math.min(alarms - 1, 4) * 5).padStart(2, "0")}</text>
              <rect x={-14} y={6} width={28} height={12} rx={6} fill={MP.bell} opacity={0.6 + 0.4 * (Math.floor(f / 6) % 2)} />
            </g>
          ) : (
            <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={11} fill="#5A6788" opacity={0.6}>{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</text>
          )}
        </g>
      </g>
      {/* 布団から伸びる腕 */}
      {arm > 0.02 && sleeper > 0 && (
        <g>
          <path d={`M 985 652 C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${hand[0]} ${hand[1]}`} stroke={INK} strokeWidth={31} fill="none" strokeLinecap="round" />
          <path d={`M 985 652 C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${hand[0]} ${hand[1]}`} stroke={MP.you} strokeWidth={21} fill="none" strokeLinecap="round" />
          <circle cx={hand[0]} cy={hand[1]} r={14} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
          <path d="M 972 636 Q 986 652 980 672" stroke={KRP.white} strokeWidth={14} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* 部屋の暗さ */}
      {dim > 0.01 && <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={dim} />}
      {/* 窓の外 (暗さの上から描く。わくの内側だけ) */}
      <defs>
        <clipPath id={clip}>
          <rect x={520} y={110} width={224} height={179} />
          <rect x={756} y={110} width={224} height={179} />
          <rect x={520} y={301} width={224} height={179} />
          <rect x={756} y={301} width={224} height={179} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <SkyBands x={518} y={108} w={464} h={374} sky={sky} />
        <Stars pts={[[560, 140], [640, 200], [700, 130], [800, 170], [900, 140], [950, 230], [600, 260], [860, 250], [780, 330]]} sky={sky} f={f} />
        {sky < 1.1 && <g opacity={clamp01(1.1 - sky)}>
          <circle cx={620} cy={190} r={34} fill="#FFF3C8" />
          <circle cx={636} cy={180} r={30} fill={skyColors(sky)[0]} />
        </g>}
        {sky > 0.45 && (() => {
          const k = clamp01((sky - 0.45) / 1.4);
          const sy = lerp(470, 200, k);
          return <g>
            <circle cx={880} cy={sy} r={70} fill={MP.glow} opacity={0.35} />
            <circle cx={880} cy={sy} r={40} fill={mixColor("#F7874A", "#FFF1B8", k)} />
          </g>;
        })()}
        {/* 町並み (屋根と窓明かり) */}
        <path d="M 518 482 L 518 420 L 560 392 L 602 420 L 602 400 L 660 400 L 660 372 L 690 350 L 720 372 L 720 410 L 790 410 L 830 380 L 870 410 L 870 390 L 930 390 L 930 360 L 982 360 L 982 482 Z"
          fill={mixColor("#232A48", "#8A9BB6", sky / 2)} stroke={INK} strokeWidth={3} />
        {[[540, 440], [580, 444], [676, 390], [700, 420], [810, 430], [890, 410], [950, 380], [960, 430]].map(([wx, wy], i) => (
          <rect key={i} x={wx} y={wy} width={12} height={14} fill="#FFD873" opacity={clamp01(1 - sky) * (i % 3 === 1 ? 0.3 : 0.9)} />
        ))}
      </g>
      {/* カーテン (暗さに合わせて色を落とす) */}
      {[-1, 1].map((sd) => {
        const x0 = sd === -1 ? 440 : 1060;
        const x1 = sd === -1 ? 568 : 932;
        const s2 = sw * (sd === -1 ? 1 : 0.8);
        const d = `M ${x0} 70 L ${x1} 70 C ${x1 - sd * 4} 240 ${x1 + sd * 8 + s2} 400 ${x1 - sd * 22 + s2} 540 Q ${(x0 + x1) / 2 + s2} 556 ${x0} 546 Z`;
        return (
          <g key={sd}>
            <path d={d} fill={curtain("#C9826C")} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            {[0.3, 0.55, 0.8].map((k) => {
              const lx = lerp(x0, x1, k);
              return <path key={k} d={`M ${lx} 76 Q ${lx + sd * 6 + s2 * k} 340 ${lx - sd * 6 + s2 * k} 532`} stroke={curtain("#A9614E")} strokeWidth={5} fill="none" strokeLinecap="round" />;
            })}
            <path d={`M ${x0} 104 L ${x1} 104`} stroke={curtain("#E8B9A4")} strokeWidth={6} strokeDasharray="4 14" />
            {/* タッセル */}
            <path d={`M ${x0} 380 Q ${lerp(x0, x1, 0.6) + s2 * 0.6} 396 ${x1 + s2 * 0.6} 386`} stroke={curtain(MP.brass)} strokeWidth={9} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
      <rect x={420} y={60} width={660} height={14} rx={7} fill={mixColor(MP.brass, MP.nightDeep, dim)} stroke={INK} strokeWidth={4} />
      {[420, 1080].map((cx) => <circle key={cx} cx={cx} cy={67} r={14} fill={mixColor(MP.brass, MP.nightDeep, dim)} stroke={INK} strokeWidth={4} />)}
      {/* 窓から差しこむ光 (夜=青白い月明かり、朝=暖かい日差し) */}
      {sky > 1 && <polygon points="522,482 978,482 1160,1080 300,1080" fill="#FFF2C4" opacity={(sky - 1) * 0.2} />}
      {/* ランプの光 */}
      {lamp && [150, 100, 60].map((gr) => <circle key={gr} cx={1430} cy={560} r={gr} fill={MP.glow} opacity={0.09 + 0.01 * Math.sin(f / 5)} />)}
      {/* スマホの光と音 */}
      {ring && (
        <g>
          <circle cx={SHIN.phone[0]} cy={SHIN.phone[1]} r={110} fill="#CFE9FF" opacity={0.25 + 0.1 * Math.sin(f / 2)} />
          <circle cx={SHIN.phone[0]} cy={SHIN.phone[1]} r={56} fill="#EAF6FF" opacity={0.3} />
          <SoundArcs x={SHIN.phone[0]} y={SHIN.phone[1]} r={52} amt={1} f={f} color={KRP.white} w={6} />
          <g transform={`translate(${SHIN.phone[0] + 34} ${SHIN.phone[1] - 54}) scale(${0.9 + 0.1 * Math.sin(f / 3)})`}>
            <circle r={22} fill={MP.bell} stroke={INK} strokeWidth={4} />
            <text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>{alarms}</text>
          </g>
        </g>
      )}
      {/* Zzz */}
      {sleeper > 0 && head && zs.map((i) => {
        const t = ((f / 50 + i / 3) % 1);
        return <text key={i} x={1100 + t * 50 + Math.sin(t * 6 + i) * 10} y={530 - t * 150} fontFamily={FONT} fontWeight={900}
          fontSize={30 + t * 26} fill={KRP.white} stroke={INK} strokeWidth={2.5} opacity={Math.sin(t * Math.PI)}>Z</text>;
      })}
    </g>
  );
};

/* ===================================================================
 * SumahoAlarm — スマホのアラーム画面 (5分おきの5個: 6:00 / 6:05 / 6:10 / 6:15 / 6:20)
 *   x,y: 本体の中心。s=1 で 縦640px・横330px
 *   on: 鳴っているアラームの番号 (0〜4。数か配列。省略で鳴っていない)
 *   off: 止めたアラームの番号の配列 (スイッチが灰色に切れ、時刻も灰色)
 *   f: 鳴っている行の点滅・ベルのゆれ・本体の震え
 *   times: (省略可) 5個の時刻の文字を差し替える
 * =================================================================== */
export const SumahoAlarm: React.FC<{
  x: number; y: number; s?: number; f: number; on?: number | number[]; off?: number[]; times?: string[]; rot?: number;
}> = ({ x, y, s = 1, f, on, off = [], times = ["6:00", "6:05", "6:10", "6:15", "6:20"], rot = 0 }) => {
  const ons = on === undefined ? [] : Array.isArray(on) ? on : [on];
  const ringing = ons.length > 0;
  const jx = ringing ? Math.sin(f * 2.9) * 3 : 0;
  const jr = ringing ? Math.sin(f * 2.3) * 1.2 : 0;
  const blinkOn = Math.floor(f / 5) % 2 === 0;
  return (
    <g transform={`translate(${x + jx * s} ${y}) rotate(${rot + jr}) scale(${s})`}>
      {ringing && <rect x={-200} y={-360} width={400} height={720} rx={70} fill="#CFE9FF" opacity={0.25 + 0.1 * Math.sin(f / 2)} />}
      {/* 側面のボタン */}
      <rect x={-172} y={-190} width={10} height={70} rx={4} fill={KRP.grayDark} stroke={INK} strokeWidth={3} />
      <rect x={162} y={-210} width={10} height={50} rx={4} fill={KRP.grayDark} stroke={INK} strokeWidth={3} />
      <rect x={162} y={-150} width={10} height={50} rx={4} fill={KRP.grayDark} stroke={INK} strokeWidth={3} />
      {/* 本体 */}
      <rect x={-165} y={-320} width={330} height={640} rx={48} fill="#2C2F37" stroke={INK} strokeWidth={8} />
      <rect x={-148} y={-302} width={296} height={604} rx={34} fill="#F7F8FB" />
      {/* 上のふち (カメラ) */}
      <rect x={-44} y={-296} width={88} height={22} rx={11} fill="#2C2F37" />
      <circle cx={24} cy={-285} r={5} fill="#4A5368" />
      {/* ステータスバー */}
      <text x={-122} y={-280} fontFamily={FONT} fontWeight={800} fontSize={18} fill={INK}>{ringing ? times[Math.min(...ons)] : "5:59"}</text>
      <g transform="translate(94 -288)">
        {[0, 1, 2, 3].map((k) => <rect key={k} x={k * 6} y={10 - k * 3} width={4} height={4 + k * 3} fill={INK} />)}
        <rect x={28} y={0} width={26} height={13} rx={3} fill="none" stroke={INK} strokeWidth={2} />
        <rect x={30} y={2} width={12} height={9} fill={MP.bell} />
      </g>
      {/* 見出し */}
      <text x={-122} y={-212} fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>アラーム</text>
      <g transform="translate(108 -226)">
        <circle r={20} fill="#E8ECF3" />
        <path d="M -9 0 L 9 0 M 0 -9 L 0 9" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* 5個の行 */}
      {times.slice(0, 5).map((t, i) => {
        const ry = -170 + i * 86;
        const isOn = ons.includes(i);
        const isOff = off.includes(i) && !isOn;
        const shake = isOn ? Math.sin(f * 3.1 + i) * 4 : 0;
        return (
          <g key={i} transform={`translate(${shake} 0)`}>
            <rect x={-136} y={ry} width={272} height={76} rx={18}
              fill={isOn ? (blinkOn ? "#FFD9D2" : "#FFC1B6") : "#EEF1F6"} stroke={isOn ? MP.bell : "#DDE2EA"} strokeWidth={isOn ? 5 : 2} />
            <text x={-118} y={ry + 52} fontFamily={FONT} fontWeight={900} fontSize={42} fill={isOff ? "#B4BAC4" : INK}>{t}</text>
            <text x={-12} y={ry + 50} fontFamily={FONT} fontWeight={700} fontSize={16} fill={isOff ? "#C3C8D0" : "#7A8294"}>平日</text>
            {/* ベル (鳴っている行だけ) */}
            {isOn && (
              <g transform={`translate(34 ${ry + 38}) rotate(${Math.sin(f * 1.9) * 22})`}>
                <path d="M -11 6 Q -12 -12 0 -13 Q 12 -12 11 6 L 14 10 L -14 10 Z" fill={MP.bell} stroke={INK} strokeWidth={2.5} />
                <circle cx={0} cy={13} r={3.5} fill={INK} />
              </g>
            )}
            {/* スイッチ */}
            {(() => {
              const onSw = !isOff;
              return (
                <g transform={`translate(98 ${ry + 38})`}>
                  <rect x={-30} y={-17} width={60} height={34} rx={17} fill={onSw ? (isOn ? MP.bell : "#5CC26E") : "#C8CDD5"} stroke={INK} strokeWidth={3} />
                  <circle cx={onSw ? 13 : -13} cy={0} r={13} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
                </g>
              );
            })()}
          </g>
        );
      })}
      {/* 下のバー */}
      <rect x={-60} y={280} width={120} height={8} rx={4} fill={INK} opacity={0.75} />
      {/* ガラスのつや */}
      <path d="M -140 -120 L -40 -300 L 10 -300 L -140 -30 Z" fill={KRP.white} opacity={0.18} />
      {/* 鳴っている音 */}
      {ringing && <SoundArcs x={0} y={-40} r={200} amt={1} f={f} color={MP.bell} w={9} />}
    </g>
  );
};

/* ===================================================================
 * TainaiDokei — 体内時計 (脳の奥の小さな時計。#18〜#24・#29・#37・#128・#129・#199)
 *   x,y: 文字盤の中心。s=1 で 文字盤の半径180 (はみ出しの赤い区画を入れて 直径およそ480)
 *   文字盤は24時間・針は1本。12時の位置 (0時=24時) を過ぎた先に、11分ぶんの「はみ出し」の赤い区画 (大げさに描く)
 *   lag: はみ出しの量 0〜1 (0 で無し。1 で 約50度ぶん)
 *   reset: 0〜1 で 右上から朝の光が当たり、はみ出しが縮んで消え、針が0時にそろう
 *   hand: (省略可) 針の位置 0〜1 (1周+はみ出し の割合)。省略すると f でゆっくり回り続ける
 *   kobito: (省略可) false で中の小人を描かない
 *   label: (省略可) false で「+11分」の札を出さない
 * =================================================================== */
export const TainaiDokei: React.FC<{
  x: number; y: number; s?: number; f: number; lag?: number; reset?: number; hand?: number; kobito?: boolean; label?: boolean;
}> = ({ x, y, s = 1, f, lag = 1, reset = 0, hand, kobito = true, label = true }) => {
  const R = 180;
  const rs = easeOut(clamp01(reset));
  const lagDeg = 50 * clamp01(lag) * (1 - rs);
  const lap = 360 + lagDeg;
  const handFrac = hand ?? ((f * 0.004) % 1);
  const handDeg = lerp(handFrac * lap, 0, rs);
  const a2 = (lagDeg * Math.PI) / 180;
  const ro = R + 62, ri = R + 18;
  const extra = lagDeg > 0.5
    ? `M 0 ${-ri} L 0 ${-ro} A ${ro} ${ro} 0 0 1 ${Math.sin(a2) * ro} ${-Math.cos(a2) * ro} L ${Math.sin(a2) * ri} ${-Math.cos(a2) * ri} A ${ri} ${ri} 0 0 0 0 ${-ri} Z`
    : "";
  const gearRot = f * 3;
  const gear = (gx: number, gy: number, r: number, teeth: number, rot: number, fill: string) => (
    <g transform={`translate(${gx} ${gy}) rotate(${rot})`}>
      {Array.from({ length: teeth }, (_, i) => <rect key={i} x={-r * 0.16} y={-r - r * 0.22} width={r * 0.32} height={r * 0.34} rx={2}
        fill={fill} stroke={INK} strokeWidth={2.5} transform={`rotate(${(i * 360) / teeth})`} />)}
      <circle r={r} fill={fill} stroke={INK} strokeWidth={3} />
      <circle r={r * 0.55} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
      {[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={0} x2={0} y2={-r * 0.55} stroke={INK} strokeWidth={2} opacity={0.5} transform={`rotate(${k * 90 + 45})`} />)}
      <circle r={r * 0.18} fill={INK} />
    </g>
  );
  const clipId = useSafeId("tdWin");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 朝の光 (reset) */}
      {rs > 0.01 && (
        <g opacity={clamp01(reset * 2)}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = ((200 + i * 9) * Math.PI) / 180;
            return <polygon key={i} points={`340,-330 ${340 + Math.cos(a) * 520 - 14},${-330 - Math.sin(a) * 520} ${340 + Math.cos(a) * 520 + 14},${-330 - Math.sin(a) * 520 + 20}`}
              fill="#FFF1B8" opacity={0.45} />;
          })}
          <circle cx={340} cy={-330} r={60} fill="#FFE27A" stroke={INK} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={-72} x2={0} y2={-92} stroke="#F2B13C" strokeWidth={8} strokeLinecap="round"
            transform={`translate(340 -330) rotate(${i * 36 + f})`} />)}
          <circle r={R + 30 + rs * 40} fill="none" stroke="#FFE27A" strokeWidth={14 * (1 - rs) + 2} opacity={0.6 * (1 - rs * 0.6)} />
        </g>
      )}
      {/* はみ出し (赤い区画)。輪の外にこぶのように出る */}
      {extra && (
        <g>
          <path d={extra} fill={MP.bell} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: Math.max(1, Math.floor(lagDeg / 8)) }, (_, i) => {
            const a = (((i + 0.5) * lagDeg) / Math.max(1, Math.floor(lagDeg / 8)) * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * (ri + 8)} y1={-Math.cos(a) * (ri + 8)} x2={Math.sin(a) * (ro - 8)} y2={-Math.cos(a) * (ro - 8)}
              stroke={MP.bellDark} strokeWidth={4} strokeLinecap="round" />;
          })}
          {label && lagDeg > 18 && (
            <g transform={`translate(${Math.sin(a2 * 0.5 + 0.35) * (ro + 70)} ${-Math.cos(a2 * 0.5 + 0.35) * (ro + 40)})`}>
              <rect x={-66} y={-28} width={132} height={52} rx={14} fill={KRP.white} stroke={MP.bell} strokeWidth={5} />
              <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={MP.bell}>+11分</text>
            </g>
          )}
        </g>
      )}
      {/* 外わく (真鍮) とねじ */}
      <circle r={R + 22} fill={MP.brass} stroke={INK} strokeWidth={8} />
      <circle r={R + 12} fill="none" stroke={MP.brassLight} strokeWidth={5} opacity={0.7} />
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a}) translate(0 ${-(R + 11)})`}>
          <circle r={6} fill={MP.brassDark} stroke={INK} strokeWidth={2.5} />
          <line x1={-4} y1={0} x2={4} y2={0} stroke={INK} strokeWidth={2} />
        </g>
      ))}
      {/* 上の竜頭 */}
      <rect x={-18} y={-R - 50} width={36} height={30} rx={6} fill={MP.brass} stroke={INK} strokeWidth={5} />
      <rect x={-26} y={-R - 66} width={52} height={20} rx={8} fill={MP.brassDark} stroke={INK} strokeWidth={5} />
      {/* 文字盤 (24時間) */}
      <circle r={R} fill="#FBF3E2" stroke={INK} strokeWidth={6} />
      {/* 夜の半分 (18時→24時→6時。上半分) をうっすら紺に */}
      <path d={`M 0 0 L ${-R * 0.97} 0 A ${R * 0.97} ${R * 0.97} 0 0 1 ${R * 0.97} 0 Z`} fill={MP.night} opacity={0.08} />
      {Array.from({ length: 96 }, (_, i) => {
        const a = (i * 3.75 * Math.PI) / 180;
        const hr = i % 4 === 0, big = i % 24 === 0;
        const r0 = R * (big ? 0.8 : hr ? 0.86 : 0.91), r1 = R * 0.95;
        return <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * r1} y2={-Math.cos(a) * r1}
          stroke={INK} strokeWidth={big ? 6 : hr ? 3.5 : 1.6} strokeLinecap="round" />;
      })}
      {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
        const a = (h * 15 * Math.PI) / 180, rr = R * 0.68;
        const main = h % 6 === 0;
        return <text key={h} x={Math.sin(a) * rr} y={-Math.cos(a) * rr + (main ? 14 : 9)} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={main ? 40 : 24} fill={main ? INK : KRP.grayDark}>{h === 0 ? 24 : h}</text>;
      })}
      {/* 太陽と月の小さな印 */}
      <g transform={`translate(0 ${-R * 0.42})`}>
        <circle r={11} fill="#F3E3A0" stroke={INK} strokeWidth={3} />
        <circle cx={6} cy={-4} r={9} fill="#FBF3E2" />
      </g>
      {/* 小人の窓 (歯車の見えるのぞき窓) */}
      <defs><clipPath id={clipId}><rect x={-96} y={36} width={192} height={96} rx={20} /></clipPath></defs>
      <rect x={-96} y={36} width={192} height={96} rx={20} fill="#5A4A60" stroke={INK} strokeWidth={5} />
      <g clipPath={`url(#${clipId})`}>
        {gear(-44, 92, 30, 10, gearRot, MP.brass)}
        {gear(10, 70, 20, 8, -gearRot * 1.5, MP.brassLight)}
        {gear(56, 112, 24, 9, gearRot * 1.25, MP.brassDark)}
        {kobito && (
          <g>
            {/* 小人がハンドルを回す (歯車の軸にクランク) */}
            <line x1={-44} y1={92} x2={-44 + Math.cos((gearRot * Math.PI) / 180) * 22} y2={92 + Math.sin((gearRot * Math.PI) / 180) * 22} stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <Kobito x={-6 + Math.cos((gearRot * Math.PI) / 180) * 3} y={134} s={0.15} f={f} pose="hold" face="smile" phase={2} />
          </g>
        )}
      </g>
      <rect x={-96} y={36} width={192} height={96} rx={20} fill="none" stroke={INK} strokeWidth={5} />
      <path d="M -82 50 L -40 50" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      {/* 針 (1本) */}
      <g transform={`rotate(${handDeg})`}>
        <path d={`M -9 22 L -5 ${-R * 0.86} L 0 ${-R * 0.94} L 5 ${-R * 0.86} L 9 22 Z`} fill={handDeg > 360 ? MP.bell : INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={0} cy={-R * 0.56} r={10} fill={handDeg > 360 ? MP.bell : INK} />
      </g>
      <circle r={18} fill={MP.brass} stroke={INK} strokeWidth={5} />
      <circle r={6} fill={INK} />
      {/* ガラスのつや */}
      <path d={`M ${-R * 0.78} ${-R * 0.32} A ${R * 0.85} ${R * 0.85} 0 0 1 ${-R * 0.3} ${-R * 0.8}`} stroke={KRP.white} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.55} />
      <path d={`M ${-R * 0.68} ${-R * 0.08} A ${R * 0.7} ${R * 0.7} 0 0 1 ${-R * 0.58} ${-R * 0.34}`} stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.45} />
    </g>
  );
};

/* ===================================================================
 * Kobito — 体の中の小人の作業員 (黄色いヘルメット・青い作業着の丸頭)
 *   x,y: 足元。s 既定 0.3 (高さ およそ100px)
 *   pose / face / f / phase / gaze / lean / pointDir は Person と同じ (そのまま渡る)
 *   lamp: (省略可) ヘルメットのライトを光らせる
 * =================================================================== */
export const Kobito: React.FC<{
  x: number; y: number; s?: number; f: number; pose?: Pose; face?: Face; phase?: number;
  gaze?: [number, number]; lean?: number; pointDir?: 1 | -1; lamp?: boolean;
}> = ({ x, y, s = 0.3, f, pose = "stand", face = "normal", phase = 0, gaze = [0, 0], lean = 0, pointDir = 1, lamp = false }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} pose={pose} face={face} phase={phase} gaze={gaze} lean={lean} pointDir={pointDir}
        cloth={MP.kobitoCloth} clothDark={MP.kobitoClothDark} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 作業着の胸のポケットと反射テープ */}
        <rect x={-58} y={-100} width={116} height={12} fill={MP.kobitoHelmet} opacity={0.85} />
        {/* 黄色いヘルメット */}
        <path d="M -68 -246 Q -68 -312 0 -314 Q 68 -312 68 -246 Z" fill={MP.kobitoHelmet} stroke={INK} strokeWidth={6} />
        <path d="M -8 -312 L -8 -248 M 8 -312 L 8 -248" stroke="#C99A1E" strokeWidth={5} />
        <rect x={-80} y={-256} width={160} height={16} rx={8} fill={MP.kobitoHelmet} stroke={INK} strokeWidth={5} />
        <path d="M -44 -296 Q -30 -306 -16 -304" stroke={KRP.white} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
        {/* ヘルメットのライト */}
        <rect x={-14} y={-286} width={28} height={20} rx={5} fill={KRP.white} stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={-276} r={6} fill={lamp ? "#FFF1A8" : "#D9DDE2"} />
        {lamp && <circle cx={0} cy={-276} r={26} fill="#FFF1A8" opacity={0.35 + 0.1 * Math.sin(f / 4)} />}
      </g>
    </g>
  );
};

// ===== ろうそく1本 (x,y=燭台の皿の中心。h=ろうの高さ) =====
const Candle: React.FC<{ x: number; y: number; s?: number; f: number; h?: number; phase?: number; lit?: boolean }> = ({ x, y, s = 1, f, h = 90, phase = 0, lit = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 鉄の燭台 */}
    <path d="M -36 0 Q 0 14 36 0 L 30 8 Q 0 20 -30 8 Z" fill={MP.iron} stroke={INK} strokeWidth={3.5} />
    <rect x={-6} y={6} width={12} height={20} fill={MP.iron} stroke={INK} strokeWidth={3} />
    <path d="M -22 28 L 22 28 L 14 20 L -14 20 Z" fill={MP.ironLight} stroke={INK} strokeWidth={3} />
    {/* ろう (たれたろうつき) */}
    <rect x={-13} y={-h} width={26} height={h} rx={4} fill="#F4ECD4" stroke={INK} strokeWidth={3.5} />
    <path d={`M -13 ${-h + 6} Q -13 ${-h + 26} -9 ${-h + 30} Q -6 ${-h + 26} -6 ${-h + 8} Z`} fill="#FBF6E6" stroke={INK} strokeWidth={2} />
    <path d={`M 6 ${-h + 4} Q 8 ${-h + 46} 11 ${-h + 50} Q 15 ${-h + 44} 13 ${-h + 4} Z`} fill="#FBF6E6" stroke={INK} strokeWidth={2} />
    <path d="M -24 0 Q -20 -10 -10 -6 Q -2 -2 8 -6 Q 18 -8 22 0 Z" fill="#F4ECD4" stroke={INK} strokeWidth={2.5} />
    <rect x={-9} y={-h + 4} width={5} height={h - 10} fill={KRP.white} opacity={0.6} />
    {lit && <Flame x={0} y={-h - 2} f={f} phase={phase} />}
  </g>
);

/* ===================================================================
 * Shudouin — 6世紀の修道院の寝室 (#50〜#58・#61〜#64・#206〜#208)
 *   画面いっぱいの舞台。石積みの壁・丸いアーチが3つ・その中の細長い窓・木のベッドが4台・十字架・合図の鈴。
 *   ベッドの寝る面の位置は SHUDOUIN_BEDS (中心x, 敷き布団の上のy)。修道士はシーン側で重ねる
 *   f: ろうそくのゆらぎ・鈴のゆれ
 *   dark: 夜の暗さ 0〜1 (1=真夜中。窓の外も暗い / 0=明け方の光)
 *   candle: ともっているろうそくの数 0〜4 (柱の台に左から順に)
 *   bell: 0〜1 で 右上の鈴が揺れて鳴る
 * =================================================================== */
export const SHUDOUIN_BEDS = [[300, 742], [740, 742], [1180, 742], [1620, 742]] as const;
export const Shudouin: React.FC<{ f: number; dark?: number; candle?: number; bell?: number }> = ({ f, dark = 1, candle = 1, bell = 0 }) => {
  const clip = useSafeId("sdWin");
  const sky = lerp(1.3, 0, clamp01(dark));
  const piers = [160, 700, 1220, 1760];
  const bays = [430, 960, 1490];
  const ARCH_R = 270, SPRING = 380;
  const winPath = (cx: number) => `M ${cx - 42} 540 L ${cx - 42} 250 A 42 42 0 0 1 ${cx + 42} 250 L ${cx + 42} 540 Z`;
  const bellSw = Math.sin(f * 1.25) * 28 * clamp01(bell);
  return (
    <g>
      {/* 壁 (石積み) */}
      <StoneWall x={-40} y={-40} w={2000} h={880} sh={66} seed={4} />
      {/* 天井 (アーチの上の暗いヴォールト) */}
      <rect x={-40} y={-40} width={2000} height={120} fill={MP.stoneDark} />
      <g stroke={INK} strokeWidth={4} opacity={0.35} fill="none">
        {bays.map((cx) => <path key={cx} d={`M ${cx - 270} 80 Q ${cx} 10 ${cx + 270} 80`} />)}
      </g>
      <rect x={-40} y={70} width={2000} height={16} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
      {/* アーチ (くさび石つき) */}
      {bays.map((cx) => (
        <g key={cx}>
          <path d={`M ${cx - ARCH_R} ${SPRING} A ${ARCH_R} ${ARCH_R} 0 0 1 ${cx + ARCH_R} ${SPRING}`} stroke={MP.stoneLight} strokeWidth={40} fill="none" />
          <path d={`M ${cx - ARCH_R - 20} ${SPRING} A ${ARCH_R + 20} ${ARCH_R + 20} 0 0 1 ${cx + ARCH_R + 20} ${SPRING}`} stroke={INK} strokeWidth={5} fill="none" />
          <path d={`M ${cx - ARCH_R + 20} ${SPRING} A ${ARCH_R - 20} ${ARCH_R - 20} 0 0 1 ${cx + ARCH_R - 20} ${SPRING}`} stroke={INK} strokeWidth={5} fill="none" />
          {Array.from({ length: 13 }, (_, i) => {
            const a = Math.PI - (i + 0.5) * (Math.PI / 13);
            return <line key={i} x1={cx + Math.cos(a) * (ARCH_R - 20)} y1={SPRING - Math.sin(a) * (ARCH_R - 20)}
              x2={cx + Math.cos(a) * (ARCH_R + 20)} y2={SPRING - Math.sin(a) * (ARCH_R + 20)} stroke={INK} strokeWidth={3} opacity={0.7} />;
          })}
          {/* アーチの奥のくぼみ (少し暗い) */}
          <path d={`M ${cx - ARCH_R + 20} ${SPRING} A ${ARCH_R - 20} ${ARCH_R - 20} 0 0 1 ${cx + ARCH_R - 20} ${SPRING} L ${cx + ARCH_R - 20} 820 L ${cx - ARCH_R + 20} 820 Z`}
            fill={MP.stoneDark} opacity={0.22} />
          {/* 細長い窓のわく */}
          <path d={winPath(cx)} fill="#1E2540" stroke={INK} strokeWidth={7} />
          <path d={`M ${cx - 56} 556 L ${cx - 56} 250 A 56 56 0 0 1 ${cx + 56} 250 L ${cx + 56} 556 Z`} fill="none" stroke={MP.stoneLight} strokeWidth={10} />
          <path d={`M ${cx - 62} 560 L ${cx + 62} 560`} stroke={MP.stoneLight} strokeWidth={16} strokeLinecap="round" />
          <path d={`M ${cx - 66} 568 L ${cx + 66} 568`} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {/* 柱 (アーチを受ける太い石の柱) */}
      {piers.map((px, i) => (
        <g key={px}>
          <rect x={px - 40} y={SPRING - 10} width={80} height={450} fill={MP.stone} stroke={INK} strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={px - 40} y1={SPRING + 60 + k * 66} x2={px + 40} y2={SPRING + 60 + k * 66} stroke={INK} strokeWidth={3} opacity={0.45} />)}
          <rect x={px - 52} y={SPRING - 26} width={104} height={24} fill={MP.stoneLight} stroke={INK} strokeWidth={5} />
          {/* ろうそくの台 */}
          <rect x={px - 46} y={556} width={92} height={16} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
          <path d={`M ${px - 30} 572 L ${px} 600 L ${px + 30} 572 Z`} fill={MP.stoneDark} stroke={INK} strokeWidth={3.5} />
          {/* ろうがたれて固まったあと */}
          <path d={`M ${px - 14} 572 q 3 14 6 0 M ${px + 10} 572 q 3 20 6 0`} stroke="#EFE5C9" strokeWidth={4} fill="none" opacity={i < candle ? 0.9 : 0.5} />
        </g>
      ))}
      {/* 十字架 (真ん中のアーチの下) */}
      <g>
        <rect x={952} y={590} width={16} height={110} rx={3} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
        <rect x={922} y={614} width={76} height={16} rx={3} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      </g>
      {/* 合図の鈴 (右上の柱の腕木から吊るす) */}
      <g>
        <path d="M 1760 300 L 1860 300 L 1860 316 L 1776 316 Z" fill={MP.woodDark} stroke={INK} strokeWidth={4} />
        <path d="M 1790 316 L 1776 360" stroke={MP.iron} strokeWidth={5} />
        <g transform={`rotate(${bellSw} 1840 316)`}>
          <line x1={1840} y1={316} x2={1840} y2={340} stroke={MP.iron} strokeWidth={5} />
          <path d="M 1818 386 Q 1816 344 1840 340 Q 1864 344 1862 386 L 1870 396 L 1810 396 Z" fill={MP.brass} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <path d="M 1826 384 Q 1826 356 1836 350" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle cx={1840 - bellSw * 0.25} cy={402} r={7} fill={MP.iron} stroke={INK} strokeWidth={2.5} />
          {/* 引き綱 */}
          <path d={`M 1840 404 Q ${1844 + bellSw * 0.4} 500 ${1838 + bellSw * 0.8} 620`} stroke="#C9A877" strokeWidth={5} fill="none" />
          <circle cx={1838 + bellSw * 0.8} cy={624} r={8} fill="#C9A877" stroke={INK} strokeWidth={2.5} />
        </g>
      </g>
      {/* 床 (石の板) */}
      <rect x={-40} y={820} width={2000} height={300} fill={MP.stoneDark} />
      <g stroke={INK} strokeWidth={3} opacity={0.45}>
        <line x1={-40} y1={820} x2={1960} y2={820} />
        {[880, 960, 1060].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={i * 200 - 40} y1={820} x2={(i - 5) * 300 + 960} y2={1120} />)}
      </g>
      {/* 木のベッド4台 (わらの敷き布団・灰色の毛布) */}
      {SHUDOUIN_BEDS.map(([bx], i) => (
        <g key={bx}>
          <rect x={bx - 175} y={700} width={22} height={140} rx={4} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
          <rect x={bx - 170} y={760} width={340} height={40} rx={4} fill={MP.wood} stroke={INK} strokeWidth={5} />
          <Grain x={bx - 170} y={760} w={340} h={40} n={2} seed={i + 2} />
          {/* 木の継ぎ目の釘 */}
          {[-150, 150].map((nx) => <circle key={nx} cx={bx + nx} cy={780} r={4} fill={INK} />)}
          {[-160, 150].map((lx) => <rect key={lx} x={bx + lx} y={800} width={18} height={40} fill={MP.woodDark} stroke={INK} strokeWidth={4} />)}
          {/* わらの敷き布団 */}
          <rect x={bx - 160} y={736} width={326} height={28} rx={12} fill="#D9BF7E" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, k) => <line key={k} x1={bx - 146 + k * 36} y1={742} x2={bx - 132 + k * 36} y2={756} stroke="#A88B4A" strokeWidth={2.5} />)}
          <path d={`M ${bx - 158} 750 l -10 -4 M ${bx + 164} 744 l 10 -6 M ${bx + 164} 754 l 12 2`} stroke="#B89A55" strokeWidth={2.5} />
          {/* たたんだ毛布 (足もと) と わらの枕 */}
          <rect x={bx + 60} y={716} width={100} height={26} rx={8} fill="#8F8A86" stroke={INK} strokeWidth={4} />
          <line x1={bx + 66} y1={728} x2={bx + 154} y2={728} stroke="#6E6A66" strokeWidth={3} />
          <ellipse cx={bx - 118} cy={728} rx={40} ry={14} fill="#E3CF97" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {/* 夜の暗さ */}
      {dark > 0.01 && <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={0.58 * clamp01(dark)} />}
      {/* 窓の外 (暗さの上から) */}
      <defs><clipPath id={clip}>{bays.map((cx) => <path key={cx} d={winPath(cx)} />)}</clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <SkyBands x={300} y={200} w={1300} h={345} sky={sky} />
        <Stars pts={bays.flatMap((cx, i) => [[cx - 18, 260 + i * 10], [cx + 20, 330], [cx - 10, 420 - i * 14], [cx + 14, 480]] as [number, number][])} sky={sky} f={f} />
        {bays.map((cx) => <path key={cx} d={`M ${cx - 42} 540 L ${cx - 42} 500 Q ${cx - 10} 470 ${cx + 42} 492 L ${cx + 42} 540 Z`} fill={mixColor("#1A1F38", "#6F7790", sky / 1.3)} />)}
      </g>
      {bays.map((cx) => <path key={cx} d={winPath(cx)} fill="none" stroke={INK} strokeWidth={7} />)}
      {/* 窓の格子 */}
      {bays.map((cx) => <path key={`g${cx}`} d={`M ${cx} 210 L ${cx} 540 M ${cx - 42} 330 L ${cx + 42} 330 M ${cx - 42} 430 L ${cx + 42} 430`} stroke={MP.iron} strokeWidth={5} />)}
      {/* 明け方の光の筋 */}
      {dark < 0.7 && bays.map((cx) => (
        <polygon key={cx} points={`${cx - 42},540 ${cx + 42},540 ${cx + 200},1080 ${cx + 20},1080`} fill="#F7E2B4" opacity={0.14 * (1 - dark / 0.7)} />
      ))}
      {/* ろうそく (柱の台の上) */}
      {piers.map((px, i) => i < candle && (
        <g key={px}>
          {[170, 120, 75].map((gr, gi) => <circle key={gr} cx={px} cy={470} r={gr + Math.sin(f / 4 + i) * 3} fill={MP.glow} opacity={(0.04 + 0.07 * clamp01(dark)) * (gi + 1) * 0.7} />)}
          <Candle x={px} y={556} f={f} h={70 + ((i * 23) % 30)} phase={i} />
        </g>
      ))}
      {/* 鈴の音 */}
      <SoundArcs x={1840} y={370} r={46} amt={bell} f={f} color={dark > 0.5 ? MP.glow : INK} />
    </g>
  );
};

/* ===================================================================
 * TokiNoKane — 江戸の時の鐘 (#65〜#72・#201)
 *   画面いっぱいの舞台。石垣の上の木の鐘楼 (瓦屋根)・釣り鐘・撞木・手前の町並みの屋根。
 *   鐘の中心 (960,530)。撞木の綱の端 (1290,790) を、シーン側の鐘撞き (男性・半纏) の手に合わせる
 *   f: ちょうちんのゆらぎ・鐘の響きの輪
 *   swing: 撞木の振り 0〜1 (0=後ろへ引いた所、1=鐘に当たる。0.9より上で鐘が鳴る)
 *   sky: 0=夜 / 1=夜明け / 2=朝
 * =================================================================== */
export const TOKI_ROPE = [1290, 790] as const;
export const TokiNoKane: React.FC<{ f: number; swing?: number; sky?: number }> = ({ f, swing = 0, sky = 1 }) => {
  const sw = clamp01(swing);
  const dx = lerp(130, 0, sw * sw);
  const hit = sw > 0.9 ? (sw - 0.9) / 0.1 : 0;
  const shake = hit > 0 ? Math.sin(f * 2.2) * 2.5 * hit : 0;
  const ring = hit > 0 ? 1 : 0;
  const roofC = mixColor("#4A556E", "#7D8AA3", sky / 2);
  const night = clamp01(1 - sky);
  const tileRow = (y0: number, x0: number, x1: number, h: number, i: number) => (
    <g key={i}>
      <path d={`M ${x0} ${y0 + h} L ${x0 + 30} ${y0} L ${x1 - 30} ${y0} L ${x1} ${y0 + h} Z`} fill={roofC} stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.floor((x1 - x0) / 18) }, (_, k) => <line key={k} x1={x0 + 14 + k * 18} y1={y0 + 4} x2={x0 + 12 + k * 18} y2={y0 + h - 2} stroke={INK} strokeWidth={2} opacity={0.35} />)}
    </g>
  );
  return (
    <g>
      <SkyBands x={-40} y={-40} w={2000} h={900} sky={sky} n={16} />
      <Stars pts={[[120, 80], [300, 160], [520, 60], [700, 200], [1300, 90], [1500, 180], [1700, 70], [1850, 220], [420, 280], [1620, 300]]} sky={sky} f={f} />
      {/* 朝日 (夜明け以降) */}
      {sky > 0.5 && <circle cx={1650} cy={lerp(760, 380, clamp01((sky - 0.5) / 1.5))} r={64} fill={mixColor("#F48A4C", "#FFF0B5", (sky - 0.5) / 1.5)} opacity={0.95} />}
      {/* 遠くの町並み (2段の屋根)。家のすき間に空が抜けないよう奥に塀の帯 */}
      <rect x={-40} y={700} width={2000} height={190} fill={mixColor("#4A3E32", "#857059", sky / 2)} />
      {[0, 1].map((row) => (
        <g key={row} opacity={row === 0 ? 0.75 : 1}>
          {Array.from({ length: 11 }, (_, i) => {
            const hx = -60 + i * 190 + row * 90;
            const hy = row === 0 ? 650 : 730;
            const hw = 170 + ((i * 37) % 40);
            return (
              <g key={i}>
                <rect x={hx + 10} y={hy + 34} width={hw - 20} height={140} fill={mixColor("#5E4E3E", "#9B8467", sky / 2)} stroke={INK} strokeWidth={3} />
                {/* 障子窓の明かり */}
                <rect x={hx + 36} y={hy + 60} width={44} height={30} fill="#FFE1A0" stroke={INK} strokeWidth={2.5} opacity={0.35 + 0.6 * night * ((i + row) % 3 ? 1 : 0.2)} />
                <line x1={hx + 58} y1={hy + 60} x2={hx + 58} y2={hy + 90} stroke={INK} strokeWidth={2} opacity={0.5} />
                {tileRow(hy, hx, hx + hw, 40, i)}
                <rect x={hx + 26} y={hy - 6} width={hw - 52} height={8} rx={3} fill={mixColor(roofC, INK, 0.3)} stroke={INK} strokeWidth={3} />
              </g>
            );
          })}
        </g>
      ))}
      {/* 朝もや */}
      <rect x={-40} y={700} width={2000} height={50} fill={MP.mist} opacity={0.18 + 0.15 * Math.sin(f / 60)} />
      {/* 地面 */}
      <rect x={-40} y={880} width={2000} height={240} fill={mixColor("#6B5A44", "#B49B76", sky / 2)} />
      <path d="M -40 880 L 1960 880" stroke={INK} strokeWidth={4} />
      {/* 石垣 */}
      <path d="M 700 900 L 740 760 L 1180 760 L 1220 900 Z" fill={MP.stone} stroke={INK} strokeWidth={6} />
      <g stroke={INK} strokeWidth={3} opacity={0.55}>
        {[800, 845].map((ly) => <line key={ly} x1={700 + (900 - ly) * 0.28} y1={ly} x2={1220 - (900 - ly) * 0.28} y2={ly} />)}
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={760 + i * 50 + (i % 2) * 20} y1={760} x2={760 + i * 50 + (i % 2) * 20} y2={800} />)}
        {Array.from({ length: 9 }, (_, i) => <line key={`b${i}`} x1={740 + i * 52} y1={800} x2={736 + i * 52} y2={845} />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`c${i}`} x1={724 + i * 52} y1={845} x2={720 + i * 52} y2={900} />)}
      </g>
      {/* 鐘楼の床と柱 (奥の柱は細く暗く) */}
      {[850, 1070].map((px) => <rect key={px} x={px - 9} y={380} width={18} height={384} fill={MP.woodDark} stroke={INK} strokeWidth={4} />)}
      <rect x={756} y={740} width={408} height={26} fill={MP.wood} stroke={INK} strokeWidth={5} />
      {[792, 1128].map((px) => (
        <g key={px}>
          <rect x={px - 16} y={360} width={32} height={404} fill={MP.wood} stroke={INK} strokeWidth={6} />
          <Grain x={px - 16} y={360} w={32} h={404} n={1} seed={px} vertical />
        </g>
      ))}
      {/* 筋かいと貫 */}
      <rect x={770} y={392} width={480} height={24} fill={MP.wood} stroke={INK} strokeWidth={5} />
      <Grain x={770} y={392} w={480} h={24} n={1} seed={4} />
      <rect x={776} y={680} width={368} height={14} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      <path d="M 808 680 L 1112 416 M 1112 680 L 808 416" stroke={MP.woodDark} strokeWidth={6} opacity={0.35} />
      {/* 屋根 (反った瓦屋根) */}
      <path d="M 620 368 Q 700 352 760 300 L 1160 300 Q 1220 352 1300 368 Q 1240 384 1150 378 L 770 378 Q 680 384 620 368 Z" fill={roofC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 760 300 L 820 200 L 1100 200 L 1160 300 Z" fill={roofC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <g stroke={INK} strokeWidth={2.5} opacity={0.4}>
        {Array.from({ length: 19 }, (_, i) => <line key={i} x1={790 + i * 18} y1={206} x2={770 + i * 21} y2={298} />)}
        {Array.from({ length: 30 }, (_, i) => <line key={`l${i}`} x1={660 + i * 21} y1={350 + Math.abs(i - 14.5) * 0.4} x2={656 + i * 21} y2={374} />)}
      </g>
      <rect x={800} y={186} width={320} height={18} rx={6} fill={mixColor(roofC, INK, 0.35)} stroke={INK} strokeWidth={5} />
      {[800, 1120].map((ox) => <path key={ox} d={`M ${ox - 10} 204 L ${ox - 10} 168 Q ${ox} 160 ${ox + 10} 168 L ${ox + 10} 204 Z`} fill={mixColor(roofC, INK, 0.35)} stroke={INK} strokeWidth={4} />)}
      <path d="M 770 378 L 1150 378" stroke={MP.woodDark} strokeWidth={8} />
      {/* 鐘を吊る金具 */}
      <rect x={946} y={412} width={28} height={30} rx={4} fill={MP.iron} stroke={INK} strokeWidth={4} />
      {/* 釣り鐘 (青銅。乳の粒・帯・撞座) */}
      <g transform={`translate(${960 + shake} 0)`}>
        <path d="M -40 446 Q -40 430 0 428 Q 40 430 40 446 Z" fill="#5F7A63" stroke={INK} strokeWidth={4} />
        <path d="M -78 470 Q -80 444 0 442 Q 80 444 78 470 L 84 630 Q 88 652 96 660 L -96 660 Q -88 652 -84 630 Z" fill="#6E8C70" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -82 530 L 82 530 M -84 546 L 84 546 M -88 618 L 88 618" stroke={INK} strokeWidth={3.5} opacity={0.6} />
        <path d="M 0 470 L 0 530" stroke={INK} strokeWidth={3} opacity={0.5} />
        {[-1, 1].map((sd) => Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
          <circle key={`${sd}${r}${c}`} cx={sd * (22 + c * 16)} cy={470 + r * 18} r={5} fill="#86A586" stroke={INK} strokeWidth={2} />
        ))))}
        {/* 撞座 (撞木が当たる丸い所) */}
        <circle cx={60} cy={588} r={15} fill="#86A586" stroke={INK} strokeWidth={3.5} />
        <circle cx={60} cy={588} r={6} fill="none" stroke={INK} strokeWidth={2} />
        <path d="M -62 480 Q -66 560 -64 640" stroke="#A9C4A6" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.6} />
      </g>
      {/* 撞木 (2本の綱で吊った丸太)。綱の上端は貫に固定 */}
      <path d={`M 1110 416 L ${1090 + dx} 576 M 1220 416 L ${1210 + dx} 576`} stroke={INK} strokeWidth={8} />
      <path d={`M 1110 416 L ${1090 + dx} 576 M 1220 416 L ${1210 + dx} 576`} stroke="#C9A877" strokeWidth={4.5} />
      <g transform={`translate(${dx} 0)`}>
        <rect x={1046} y={566} width={210} height={44} rx={22} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <ellipse cx={1050} cy={588} rx={10} ry={21} fill="#E8C795" stroke={INK} strokeWidth={4} />
        <path d="M 1050 580 a 4 4 0 1 0 1 0" stroke={MP.woodDark} strokeWidth={2} fill="none" />
        <Grain x={1060} y={566} w={190} h={44} n={2} seed={9} />
        {/* 引き綱 */}
        <path d={`M 1256 590 Q ${1290 - dx * 0.5} 690 ${TOKI_ROPE[0] - dx} ${TOKI_ROPE[1]}`} stroke="#C9A877" strokeWidth={6} fill="none" />
        <path d={`M 1256 590 Q ${1290 - dx * 0.5} 690 ${TOKI_ROPE[0] - dx} ${TOKI_ROPE[1]}`} stroke={INK} strokeWidth={1.5} fill="none" strokeDasharray="6 6" opacity={0.6} />
      </g>
      {/* ちょうちん (左の柱) */}
      <g transform={`rotate(${Math.sin(f / 31) * 4} 760 430)`}>
        <line x1={760} y1={430} x2={760} y2={460} stroke={INK} strokeWidth={3} />
        <rect x={744} y={458} width={32} height={8} fill={INK} />
        <ellipse cx={760} cy={496} rx={26} ry={34} fill="#F2E2B6" stroke={INK} strokeWidth={4} />
        {[-14, 0, 14].map((k) => <path key={k} d={`M 735 ${496 + k} Q 760 ${500 + k} 785 ${496 + k}`} stroke={INK} strokeWidth={1.8} fill="none" opacity={0.5} />)}
        <rect x={744} y={526} width={32} height={8} fill={INK} />
        <circle cx={760} cy={496} r={70} fill={MP.glow} opacity={(0.15 + 0.05 * Math.sin(f / 3)) * (0.4 + night)} />
      </g>
      {/* 鐘の響き */}
      {ring > 0 && (
        <g>
          {[0, 1, 2].map((k) => {
            const t = ((f / 24 + k / 3) % 1);
            return <ellipse key={k} cx={960} cy={550} rx={140 + t * 520} ry={90 + t * 300} fill="none" stroke={KRP.white} strokeWidth={9 * (1 - t)} opacity={(1 - t) * 0.8 * hit} />;
          })}
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k * 60 + 30) * Math.PI / 180;
            return <line key={`s${k}`} x1={960 + Math.cos(a) * 130} y1={550 + Math.sin(a) * 110} x2={960 + Math.cos(a) * 170} y2={550 + Math.sin(a) * 140}
              stroke={MP.flame} strokeWidth={7} strokeLinecap="round" opacity={hit} />;
          })}
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * BanninTou — ウィーンの塔の最上階と番人の部屋 (#84〜#88・#203)
 *   画面いっぱいの舞台。石の壁・左の大きなアーチ窓 (夜の町と教会の尖塔)・天井の梁から吊る大きな鐘・
 *   右下の番人のわら布団・その枕元の木箱の上に「番人を起こす小さなベル付きの鉄の時計」・壁のランタン・床の上げぶた。
 *   番人はシーン側で重ねる (わら布団の上 BANNIN_BED = 中心x, 寝る面のy)
 *   f: ランタンの炎・時計のてんぷ (横棒) のゆれ
 *   ring: 鉄の時計のベル 0〜1 (ハンマーが打ち、音の線・時計が震える)
 *   wake: 番人が起きる 0〜1 (毛布がめくれ、ランタンが明るくなり、部屋の暗さが少し引く)
 *   sky: (省略可) 窓の外の空 (既定 0.15 = 夜明け前)
 * =================================================================== */
export const BANNIN_BED = [1560, 888] as const;
export const BANNIN_CLOCK = [1000, 590] as const;
export const BanninTou: React.FC<{ f: number; ring?: number; wake?: number; sky?: number }> = ({ f, ring = 0, wake = 0, sky = 0.15 }) => {
  const clip = useSafeId("btWin");
  const rg = clamp01(ring);
  const wk = easeOut(clamp01(wake));
  const hammer = rg > 0.02 ? Math.sin(f * 2.6) * 34 * rg : 0;
  const shake = rg > 0.02 ? Math.sin(f * 3.3) * 2.5 * rg : 0;
  const foliot = Math.sin(f / 7) * 18;
  const archD = "M 160 760 L 160 420 A 300 300 0 0 1 760 420 L 760 760 Z";
  const [cx, cy] = BANNIN_CLOCK;
  const blanketL = lerp(1330, 1620, wk);
  return (
    <g>
      <StoneWall x={-40} y={-40} w={2000} h={940} sh={74} seed={9} base="#A89F90" dark="#786F62" light="#C3BAAB" />
      {/* 天井の太い梁 */}
      <rect x={-40} y={60} width={2000} height={64} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
      <Grain x={-40} y={60} w={2000} h={64} n={2} seed={6} color="#5A3C22" />
      {[300, 900, 1500].map((bx) => <rect key={bx} x={bx} y={124} width={36} height={60} fill={MP.woodDark} stroke={INK} strokeWidth={4} transform={`skewX(${bx < 960 ? 20 : -20})`} />)}
      {/* アーチ窓のわく (くさび石) */}
      <path d="M 120 780 L 120 420 A 340 340 0 0 1 800 420 L 800 780 Z" fill={MP.stoneLight} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI - (i + 0.5) * (Math.PI / 11);
        return <line key={i} x1={460 + Math.cos(a) * 300} y1={420 - Math.sin(a) * 300} x2={460 + Math.cos(a) * 340} y2={420 - Math.sin(a) * 340} stroke={INK} strokeWidth={3} />;
      })}
      <path d={archD} fill="#1B2240" stroke={INK} strokeWidth={6} />
      {/* 窓台と手すり */}
      <rect x={100} y={740} width={720} height={40} fill={MP.stoneLight} stroke={INK} strokeWidth={6} />
      {/* 大きな鐘 (塔の鐘) */}
      <g transform={`rotate(${Math.sin(f / 50) * 0.8} 1240 124)`}>
        <rect x={1222} y={124} width={36} height={40} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <path d="M 1150 200 Q 1150 160 1240 158 Q 1330 160 1330 200 L 1350 420 Q 1356 450 1386 470 L 1094 470 Q 1124 450 1130 420 Z" fill="#9C7A3E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 1140 250 L 1340 250 M 1138 268 L 1342 268 M 1124 440 L 1356 440" stroke={INK} strokeWidth={4} opacity={0.6} />
        <path d="M 1166 210 Q 1158 330 1150 430" stroke="#C9A45E" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* 舌 (内側の振り子) */}
        <line x1={1240} y1={420} x2={1240} y2={480} stroke={MP.iron} strokeWidth={8} />
        <circle cx={1240} cy={488} r={14} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <path d="M 1240 502 Q 1250 600 1236 700" stroke="#B89A6A" strokeWidth={6} fill="none" />
      </g>
      {/* 床 (板張り) と上げぶた */}
      <rect x={-40} y={880} width={2000} height={240} fill="#8C6A48" />
      <g stroke="#6A4C30" strokeWidth={4}>
        {[930, 990, 1060].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={(i * 211) % 1900} y1={880 + (i % 3) * 55} x2={(i * 211) % 1900} y2={930 + (i % 3) * 60} />)}
      </g>
      <path d="M -40 880 L 1960 880" stroke={INK} strokeWidth={5} />
      <g>
        <path d="M 760 950 L 1000 950 L 1020 1030 L 740 1030 Z" fill="#5E4530" stroke={INK} strokeWidth={5} />
        <rect x={780} y={940} width={20} height={16} fill={MP.iron} stroke={INK} strokeWidth={3} />
        <rect x={960} y={940} width={20} height={16} fill={MP.iron} stroke={INK} strokeWidth={3} />
        <circle cx={880} cy={990} r={12} fill="none" stroke={MP.iron} strokeWidth={5} />
      </g>
      {/* わら布団 */}
      <g>
        <path d="M 1300 880 Q 1290 852 1320 846 L 1820 846 Q 1850 852 1840 880 L 1840 900 L 1300 900 Z" fill="#D8BC72" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 22 }, (_, k) => <line key={k} x1={1316 + k * 24} y1={852 + (k % 3) * 8} x2={1330 + k * 24} y2={878 + (k % 2) * 6} stroke="#A68845" strokeWidth={2.5} />)}
        {[[1296, 870, -14, -6], [1302, 890, -16, 4], [1842, 862, 14, -8], [1846, 884, 16, 4], [1500, 900, 4, 12], [1700, 900, -4, 12]].map(([sx, sy, ex, ey], k) => (
          <line key={`p${k}`} x1={sx} y1={sy} x2={sx + ex} y2={sy + ey} stroke="#B89A55" strokeWidth={3} strokeLinecap="round" />
        ))}
        {/* わらの枕 */}
        <ellipse cx={1356} cy={842} rx={50} ry={16} fill="#E3CC8A" stroke={INK} strokeWidth={4} />
        {/* 毛布 (継ぎあて付き)。wake でめくれる */}
        <path d={`M ${blanketL} 846 Q ${blanketL - 14} 842 ${blanketL - 6} 872 L ${blanketL} 900 L 1842 900 L 1838 846 Z`} fill="#7A5A44" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={Math.max(blanketL + 60, 1560)} y={856} width={60} height={34} fill="#9A6E50" stroke={INK} strokeWidth={3} strokeDasharray="5 4" />
        {wk > 0.05 && (
          <path d={`M ${blanketL} 846 Q ${blanketL + 40} ${846 - 30 * wk} ${blanketL + 100 * wk} 846 Z`} fill="#94705A" stroke={INK} strokeWidth={4} />
        )}
      </g>
      {/* 木箱 (時計の台) と砂時計 */}
      <g>
        <rect x={870} y={760} width={260} height={130} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={870} y={760} width={260} height={16} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <Grain x={870} y={780} w={260} h={110} n={3} seed={8} />
        {[884, 1116].map((nx) => [790, 870].map((ny) => <circle key={`${nx}${ny}`} cx={nx} cy={ny} r={4} fill={INK} />))}
      </g>
      {/* 鉄の時計 (小さなベル付き)。木箱の上 */}
      <g transform={`translate(${cx + shake} ${cy}) scale(1.35)`}>
        {/* おもり (箱の前に垂れる) */}
        <line x1={-36} y1={110} x2={-36} y2={190 + Math.sin(f / 90) * 4} stroke="#B89A6A" strokeWidth={3} />
        <line x1={36} y1={110} x2={36} y2={160} stroke="#B89A6A" strokeWidth={3} />
        <rect x={-48} y={190 + Math.sin(f / 90) * 4} width={24} height={44} rx={4} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <rect x={24} y={160} width={24} height={44} rx={4} fill={MP.iron} stroke={INK} strokeWidth={4} />
        {/* 枠 (四隅の柱) */}
        <rect x={-70} y={-20} width={140} height={136} fill="#4E535B" stroke={INK} strokeWidth={5} />
        {[-70, 70].map((px) => (
          <g key={px}>
            <rect x={px - 8} y={-36} width={16} height={156} fill={MP.iron} stroke={INK} strokeWidth={4} />
            <path d={`M ${px - 10} -36 L ${px} -60 L ${px + 10} -36 Z`} fill={MP.iron} stroke={INK} strokeWidth={3.5} />
            <circle cx={px} cy={-62} r={5} fill={MP.ironLight} stroke={INK} strokeWidth={2.5} />
          </g>
        ))}
        <rect x={-82} y={112} width={164} height={14} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <rect x={-80} y={-34} width={160} height={12} fill={MP.iron} stroke={INK} strokeWidth={4} />
        {/* 中の歯車 (枠のすき間から見える) */}
        <circle cx={-34} cy={92} r={14} fill={MP.brassDark} stroke={INK} strokeWidth={2.5} transform={`rotate(${f * 2} -34 92)`} />
        <circle cx={40} cy={92} r={10} fill={MP.brassDark} stroke={INK} strokeWidth={2.5} />
        {/* 文字盤 (針1本) */}
        <circle cx={0} cy={38} r={50} fill="#E9E2CF" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={Math.sin(a) * 38} y1={38 - Math.cos(a) * 38} x2={Math.sin(a) * 46} y2={38 - Math.cos(a) * 46} stroke={INK} strokeWidth={i % 3 ? 2.5 : 4.5} />;
        })}
        <path d="M -3 42 L 0 2 L 3 42 Z" fill={INK} stroke={INK} strokeWidth={3} transform="rotate(150 0 38)" />
        <circle cx={0} cy={38} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />
        {/* てんぷ (上の横棒と小さなおもり) */}
        <line x1={0} y1={-34} x2={0} y2={-74} stroke={MP.iron} strokeWidth={6} />
        <g transform={`rotate(${foliot} 0 -64)`}>
          <rect x={-66} y={-68} width={132} height={8} rx={3} fill={MP.iron} stroke={INK} strokeWidth={3} />
          <rect x={-66} y={-74} width={14} height={20} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
          <rect x={52} y={-74} width={14} height={20} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
        </g>
        {/* 小さなベル (上) とハンマー (右から打つ) */}
        <line x1={0} y1={-74} x2={0} y2={-92} stroke={MP.iron} strokeWidth={6} />
        <path d="M -34 -96 Q -32 -134 0 -136 Q 32 -134 34 -96 Z" fill={MP.brass} stroke={INK} strokeWidth={5} />
        <path d="M -22 -104 Q -20 -124 -6 -128" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${-18 + hammer * 0.6} 74 -40)`}>
          <line x1={74} y1={-40} x2={40} y2={-112} stroke={MP.iron} strokeWidth={6} strokeLinecap="round" />
          <circle cx={38} cy={-116} r={10} fill={MP.iron} stroke={INK} strokeWidth={3.5} />
        </g>
        <circle cx={74} cy={-40} r={6} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
      </g>
      {/* ランタン (壁の鉤から) */}
      <g transform={`rotate(${Math.sin(f / 40) * 3} 1700 520)`}>
        <path d="M 1680 520 L 1720 520" stroke={MP.iron} strokeWidth={6} />
        <line x1={1700} y1={520} x2={1700} y2={560} stroke={MP.iron} strokeWidth={4} />
        <path d="M 1676 576 L 1700 556 L 1724 576 Z" fill={MP.iron} stroke={INK} strokeWidth={4} />
        <rect x={1676} y={576} width={48} height={70} fill="#F7E4B0" stroke={INK} strokeWidth={5} opacity={0.9} />
        <line x1={1700} y1={576} x2={1700} y2={646} stroke={INK} strokeWidth={3} />
        <rect x={1670} y={644} width={60} height={12} fill={MP.iron} stroke={INK} strokeWidth={4} />
      </g>
      {/* 夜の暗さ (起きると少し引く) */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={0.5 * (1 - wk * 0.45)} />
      {/* 窓の外 (暗さの上から) */}
      <defs><clipPath id={clip}><path d={archD} /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <SkyBands x={150} y={110} w={620} h={660} sky={sky} />
        <Stars pts={[[220, 300], [300, 200], [420, 160], [560, 210], [690, 300], [640, 420], [260, 420], [480, 300]]} sky={sky} f={f} />
        <circle cx={620} cy={260} r={34} fill="#FFF3C8" opacity={clamp01(1 - sky)} />
        <circle cx={636} cy={250} r={30} fill={skyColors(sky)[0]} opacity={clamp01(1 - sky)} />
        {/* 夜の町 (急な屋根と教会の尖塔) */}
        <path d="M 150 770 L 150 640 L 200 590 L 250 640 L 250 610 L 310 560 L 370 610 L 370 650 L 430 650 L 430 520 L 456 380 L 482 520 L 482 650 L 540 650 L 540 600 L 600 550 L 660 600 L 660 630 L 720 590 L 770 630 L 770 770 Z"
          fill="#141A30" stroke={INK} strokeWidth={3} />
        {[[180, 660], [210, 690], [300, 640], [330, 680], [450, 560], [560, 640], [620, 670], [700, 650]].map(([wx, wy], i) => (
          <rect key={i} x={wx} y={wy} width={11} height={14} fill="#FFD27A" opacity={(i % 3 === 0 ? 0.25 : 0.85) * clamp01(1 - sky * 0.8)} />
        ))}
        <rect x={150} y={700} width={620} height={70} fill={MP.mist} opacity={0.12} />
      </g>
      <path d={archD} fill="none" stroke={INK} strokeWidth={6} />
      {/* 窓の鉄格子 */}
      <path d="M 310 180 L 310 760 M 460 120 L 460 760 M 610 180 L 610 760 M 160 560 L 760 560" stroke={MP.iron} strokeWidth={7} opacity={0.9} />
      {/* ランタンの火と光 */}
      {[1, 0.66, 0.36].map((k, gi) => <circle key={gi} cx={1700} cy={610} r={(200 + wk * 140) * k} fill={MP.glow} opacity={(0.05 + 0.06 * wk + 0.01 * Math.sin(f / 3)) * (gi + 1) * 0.8} />)}
      <Flame x={1700} y={632} s={0.9 + wk * 0.35} f={f} phase={3} glow={0.6 + wk} />
      {/* 時計のベルの音 */}
      <SoundArcs x={cx} y={cy - 116 * 1.35} r={70} amt={rg} f={f} color={MP.glow} />
    </g>
  );
};

/* ===================================================================
 * KoujouMon — イギリスの工場の門 (#104〜#113・#127・#201。#213 は company で会社の門に)
 *   画面いっぱいの舞台。奥のれんがの工場 (窓2段)・高い煙突2本と煙・れんがの門柱 (上にランプ)・
 *   鉄の門 (槍の先・渦巻きの飾り・錠前)・門の上の大きな時計 (ローマ数字)・石畳。
 *   門の内側の地面は y=900。門の幅は x 720〜1200
 *   f: 煙がのぼる・門柱のランプのゆらぎ・秒針
 *   gate: 門の開き 1=開 / 0=閉 (途中はゆっくり閉まっていく途中)
 *   hands: 時計の時刻 (0時からの分。例 6*60 = 6:00)
 *   smoke: 煙の量 0〜1
 *   sky: (省略可) 空 (既定 0.9 = 夜明けのくもり空)
 *   company: (省略可) true で現代の会社の門の色 (灰色の壁・銀の門・煙なし)。形は同じ
 * =================================================================== */
export const KoujouMon: React.FC<{ f: number; gate?: number; hands?: number; smoke?: number; sky?: number; company?: boolean }> = ({
  f, gate = 1, hands = 6 * 60, smoke = 1, sky = 0.9, company = false,
}) => {
  const g = clamp01(gate);
  const k = lerp(1, 0.14, easeOut(g));
  const brick = company ? { base: "#B9B6AE", dark: "#9C998F", light: "#CFCCC4", mortar: "#E2DFD8" } : { base: MP.brick, dark: MP.brickDark, light: MP.brickLight, mortar: MP.mortar };
  const ironC = company ? "#9AA3AD" : MP.iron;
  const ironHi = company ? "#C9D0D8" : MP.ironLight;
  const smk = company ? 0 : clamp01(smoke);
  const dim = 0.3 * clamp01(1 - sky / 1.6);
  const leaf = (dir: 1 | -1) => (
    <g transform={`translate(${dir === 1 ? 720 : 1200} 0) scale(${dir * k} 1)`}>
      {/* 横の桟 */}
      <rect x={0} y={560} width={240} height={14} fill={ironC} stroke={INK} strokeWidth={4} />
      <rect x={0} y={700} width={240} height={14} fill={ironC} stroke={INK} strokeWidth={4} />
      <rect x={0} y={860} width={240} height={14} fill={ironC} stroke={INK} strokeWidth={4} />
      {/* 縦の棒と槍の先 (門の真ん中ほど高い) */}
      {Array.from({ length: 10 }, (_, i) => {
        const bx = 12 + i * 24;
        const top = 520 - i * 9;
        return (
          <g key={i}>
            <rect x={bx - 4} y={top} width={8} height={874 - top} fill={ironC} stroke={INK} strokeWidth={2.5} />
            <path d={`M ${bx - 9} ${top + 4} L ${bx} ${top - 22} L ${bx + 9} ${top + 4} Z`} fill={company ? ironHi : MP.brass} stroke={INK} strokeWidth={2.5} />
          </g>
        );
      })}
      {/* 渦巻きの飾り (中段の桟の間) */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${30 + i * 56} 700 C ${30 + i * 56} 650 ${74 + i * 56} 650 ${74 + i * 56} 680 C ${74 + i * 56} 696 ${56 + i * 56} 696 ${56 + i * 56} 684`}
          stroke={ironC} strokeWidth={7} fill="none" strokeLinecap="round" />
      ))}
      {[0, 1, 2, 3].map((i) => <circle key={`o${i}`} cx={42 + i * 56} cy={786} r={20} fill="none" stroke={ironC} strokeWidth={6} />)}
      {/* 錠前 (門の合わせ目) */}
      <rect x={226} y={640} width={22} height={44} rx={4} fill={company ? ironHi : MP.brassDark} stroke={INK} strokeWidth={3.5} />
    </g>
  );
  return (
    <g>
      <SkyBands x={-40} y={-40} w={2000} h={900} sky={sky} n={14} />
      {/* くもり (すすけた空) */}
      {!company && <rect x={-40} y={-40} width={2000} height={500} fill="#6B6460" opacity={0.18} />}
      {/* 煙突 (2本) */}
      {[320, 1610].map((chx, i) => (
        <g key={chx} transform="translate(0 90)">
          <path d={`M ${chx - 56} 420 L ${chx - 38} 60 L ${chx + 38} 60 L ${chx + 56} 420 Z`} fill={brick.base} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 14 }, (_, r) => (
            <line key={r} x1={chx - 54 + r * 1.2} y1={80 + r * 26} x2={chx + 54 - r * 1.2} y2={80 + r * 26} stroke={brick.mortar} strokeWidth={3} opacity={0.75} />
          ))}
          <rect x={chx - 50} y={40} width={100} height={30} fill={brick.dark} stroke={INK} strokeWidth={5} />
          {/* すす (上のほうが黒い) */}
          {!company && <path d={`M ${chx - 50} 40 L ${chx + 50} 40 L ${chx + 46} 140 Q ${chx} 120 ${chx - 44} 150 Z`} fill={MP.soot} opacity={0.55} />}
          {/* 煙 */}
          {smk > 0 && Array.from({ length: 7 }, (_, j) => {
            const t = ((f / 140 + j / 7 + i * 0.13) % 1);
            const r = 30 + t * 110;
            return <circle key={j} cx={chx + t * 420 + Math.sin(t * 5 + j) * 20} cy={30 - t * 190} r={r}
              fill={mixColor("#5A5452", "#A9A3A0", t)} opacity={smk * (1 - t) * 0.75} stroke={INK} strokeWidth={2} strokeOpacity={0.25 * (1 - t)} />;
          })}
        </g>
      ))}
      {/* 奥の工場 (れんが・窓2段・上の石の笠木) */}
      <BrickWall x={-40} y={300} w={2000} h={560} {...brick} />
      <rect x={-40} y={284} width={2000} height={24} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={5} />
      {[0, 1].map((row) => Array.from({ length: 12 }, (_, i) => {
        const wx = 10 + i * 164;
        const wy = 350 + row * 190;
        if (wx > 560 && wx < 1300 && row === 1) return null;
        const lit = (i * 3 + row) % 4 !== 0;
        return (
          <g key={`${row}-${i}`}>
            <path d={`M ${wx} ${wy + 120} L ${wx} ${wy + 30} A 46 30 0 0 1 ${wx + 92} ${wy + 30} L ${wx + 92} ${wy + 120} Z`}
              fill={lit ? "#E9C77A" : "#3C4256"} stroke={INK} strokeWidth={5} />
            <path d={`M ${wx + 46} ${wy} L ${wx + 46} ${wy + 120} M ${wx} ${wy + 60} L ${wx + 92} ${wy + 60} M ${wx} ${wy + 90} L ${wx + 92} ${wy + 90}`} stroke={company ? "#7A828C" : MP.woodDark} strokeWidth={3.5} />
            <rect x={wx - 8} y={wy + 118} width={108} height={12} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={3.5} />
          </g>
        );
      }))}
      {/* 門の向こうの中庭 */}
      <rect x={720} y={760} width={480} height={140} fill={company ? "#A7A49C" : "#7E7264"} />
      {/* 手前の塀 */}
      <BrickWall x={-40} y={660} w={700} h={240} {...brick} seed={7} />
      <BrickWall x={1260} y={660} w={700} h={240} {...brick} seed={8} />
      <rect x={-40} y={644} width={700} height={22} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={5} />
      <rect x={1260} y={644} width={700} height={22} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={5} />
      {/* 門柱 (左右) */}
      {[670, 1250].map((px, i) => (
        <g key={px}>
          <BrickWall x={px - 50} y={420} w={100} h={480} bw={50} bh={24} {...brick} seed={i + 2} />
          <rect x={px - 50} y={420} width={100} height={480} fill="none" stroke={INK} strokeWidth={6} />
          <rect x={px - 62} y={400} width={124} height={26} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={5} />
          <rect x={px - 56} y={560} width={112} height={16} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={4} />
          {/* 蝶番 */}
          {[600, 820].map((hy) => <rect key={hy} x={i === 0 ? px + 44 : px - 56} y={hy} width={12} height={30} fill={ironC} stroke={INK} strokeWidth={3} />)}
          {/* ランプ (柱の上) */}
          <rect x={px - 8} y={350} width={16} height={52} fill={ironC} stroke={INK} strokeWidth={3.5} />
          <path d={`M ${px - 30} 300 L ${px + 30} 300 L ${px + 22} 356 L ${px - 22} 356 Z`} fill="#F7E2A8" stroke={INK} strokeWidth={4.5} />
          <path d={`M ${px - 36} 300 L ${px} 272 L ${px + 36} 300 Z`} fill={ironC} stroke={INK} strokeWidth={4} />
          <line x1={px} y1={300} x2={px} y2={356} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}
      {/* 門の上の鉄のアーチと大きな時計 */}
      <path d="M 720 430 Q 960 330 1200 430" stroke={ironC} strokeWidth={14} fill="none" />
      <path d="M 720 470 Q 960 380 1200 470" stroke={ironC} strokeWidth={8} fill="none" />
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${960 + sd * 200} 440 c ${sd * -10} -40 ${sd * -60} -40 ${sd * -60} -10 c 0 20 ${sd * 24} 20 ${sd * 24} 4`} stroke={ironC} strokeWidth={7} fill="none" strokeLinecap="round" />
      ))}
      <g transform="translate(960 300)">
        <circle r={140} fill={company ? "#D9D6CF" : MP.stoneLight} stroke={INK} strokeWidth={8} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={0} y1={-122} x2={0} y2={-140} stroke={INK} strokeWidth={3} transform={`rotate(${i * 22.5})`} />)}
        <circle r={122} fill={company ? ironHi : MP.brass} stroke={INK} strokeWidth={6} />
        <ClockFace r={108} minutes={hands} f={f} roman face="#FBF6E8" />
        <path d="M -70 -60 Q -40 -92 0 -98" stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.5} />
      </g>
      {/* 鉄の門 (2枚) */}
      {leaf(1)}
      {leaf(-1)}
      {/* 石畳 */}
      <rect x={-40} y={900} width={2000} height={220} fill={company ? "#8E918F" : "#7C7066"} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 26 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-40 + c * 80 + (r % 2) * 40} y={910 + r * 42} width={70} height={34} rx={12}
          fill={company ? "#A3A6A4" : ((r + c) % 3 ? "#93867A" : "#A0948A")} stroke={INK} strokeWidth={2.5} opacity={0.9} />
      )))}
      <path d="M -40 900 L 1960 900" stroke={INK} strokeWidth={5} />
      {/* 暗さ (夜明け前) */}
      {dim > 0.01 && <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={dim} />}
      {/* ランプの火 */}
      {[670, 1250].map((px, i) => <Flame key={px} x={px} y={348} s={0.8} f={f} phase={i + 4} glow={0.5 + dim * 2} />)}
    </g>
  );
};

// ===== 仮の部品 (作りかけ。本物ができたら置き換える) =====
void seg; void pop;

/* ===================================================================
 * MachiNami — イギリスの工業の町の連続住宅 (夜明け前。#132・#134〜#143・#147・#154・#155・#158〜#161・#183・#195)
 *   画面いっぱいの舞台。2階建てのれんがの長屋 6軒 (玄関・1階の窓・2階の寝室の窓)・屋根の煙突・
 *   歩道と石畳・ガス灯 (x=990)・遠くの工場の煙突と煙・朝もや。
 *   2階の窓の中心は MACHI_WIN[i] (i=0〜5)。KnockerUp の棒の先をここに合わせる
 *   f: ガス灯の炎のゆらぎ・煙・もや
 *   windows: 各2階の窓の状態の配列 (0/false=暗い・カーテンが閉まっている、1/true=明かりがつく。0〜1 の途中も可)。
 *            "open" を入れると窓が上に開いて明かりがつく (寝ぼけた人が顔を出す用)
 *   sky: 0=夜 / 1=夜明け / 2=朝 (既定 0.3)
 * =================================================================== */
export const MACHI_WIN = Array.from({ length: 6 }, (_, i) => [-30 + i * 330 + 165, 360] as [number, number]);
export const MACHI_GROUND = 880;
export const MachiNami: React.FC<{ f: number; windows?: (number | boolean | "open")[]; sky?: number }> = ({ f, windows = [], sky = 0.3 }) => {
  const dim = 0.5 * clamp01(1 - sky / 1.5);
  const litOf = (i: number) => {
    const v = windows[i];
    return v === "open" ? 1 : v === true ? 1 : typeof v === "number" ? clamp01(v) : 0;
  };
  const isOpen = (i: number) => windows[i] === "open";
  const slate = mixColor("#3E4556", "#6E7686", sky / 2);
  const lampFl = 0.85 + 0.15 * Math.sin(f / 2.3) * Math.sin(f / 5.1);
  const sashWin = (cx: number, cy: number, w: number, h: number, key: string, open = false) => (
    <g key={key}>
      {/* まぐさ石・窓台 */}
      <rect x={cx - w / 2 - 14} y={cy - h / 2 - 26} width={w + 28} height={22} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
      <rect x={cx - w / 2 - 12} y={cy + h / 2 + 2} width={w + 24} height={16} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="#262B40" stroke={INK} strokeWidth={5} />
      {/* カーテン (閉まった状態) */}
      <path d={`M ${cx - w / 2 + 6} ${cy - h / 2 + 6} L ${cx - 2} ${cy - h / 2 + 6} Q ${cx - 6} ${cy} ${cx - 2} ${cy + h / 2 - 6} L ${cx - w / 2 + 6} ${cy + h / 2 - 6} Z`} fill="#6F4F5E" opacity={0.85} />
      <path d={`M ${cx + w / 2 - 6} ${cy - h / 2 + 6} L ${cx + 2} ${cy - h / 2 + 6} Q ${cx + 6} ${cy} ${cx + 2} ${cy + h / 2 - 6} L ${cx + w / 2 - 6} ${cy + h / 2 - 6} Z`} fill="#6F4F5E" opacity={0.85} />
      {/* 上下の窓わく (開くときは下の窓が上にずれる) */}
      <rect x={cx - w / 2 + 4} y={cy - h / 2 + 4} width={w - 8} height={h / 2 - 4} fill="none" stroke="#F1EADF" strokeWidth={7} />
      <rect x={cx - w / 2 + 4} y={cy - (open ? h / 2 - 20 : 0)} width={w - 8} height={h / 2 - 4} fill="none" stroke="#F1EADF" strokeWidth={7} />
      <path d={`M ${cx} ${cy - h / 2 + 4} L ${cx} ${cy + h / 2 - 4} M ${cx - w / 2 + 4} ${cy - h / 4} L ${cx + w / 2 - 4} ${cy - h / 4} M ${cx - w / 2 + 4} ${cy + h / 4} L ${cx + w / 2 - 4} ${cy + h / 4}`}
        stroke="#F1EADF" strokeWidth={4} />
    </g>
  );
  return (
    <g>
      <SkyBands x={-40} y={-40} w={2000} h={700} sky={sky} n={14} />
      <Stars pts={[[80, 60], [260, 120], [460, 50], [640, 110], [860, 40], [1100, 90], [1320, 50], [1560, 120], [1760, 60], [1880, 140]]} sky={sky} f={f} />
      {/* 遠くの工場の煙突と煙 */}
      {[240, 700, 1380, 1720].map((cx, i) => (
        <g key={cx}>
          <rect x={cx - 16} y={40 + (i % 2) * 30} width={32} height={200} fill={mixColor("#2E3348", "#7C8294", sky / 2)} />
          {Array.from({ length: 4 }, (_, j) => {
            const t = ((f / 160 + j / 4 + i * 0.21) % 1);
            return <circle key={j} cx={cx + t * 160} cy={40 + (i % 2) * 30 - t * 120} r={16 + t * 50} fill="#6D6A75" opacity={(1 - t) * 0.45} />;
          })}
        </g>
      ))}
      {/* 屋根 (スレート) と煙突 */}
      <path d="M -40 240 L -40 150 L 1960 150 L 1960 240 Z" fill={slate} stroke={INK} strokeWidth={6} />
      <g stroke={INK} strokeWidth={2} opacity={0.35}>
        {[172, 196, 220].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}
      </g>
      {Array.from({ length: 6 }, (_, i) => {
        const hx = -30 + i * 330 + 300;
        return (
          <g key={i}>
            <BrickWall x={hx - 40} y={80} w={80} h={70} bw={40} bh={18} seed={i} />
            <rect x={hx - 40} y={80} width={80} height={70} fill="none" stroke={INK} strokeWidth={5} />
            <rect x={hx - 48} y={70} width={96} height={14} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
            {[-20, 4].map((px) => <rect key={px} x={hx + px} y={46} width={18} height={26} fill="#B5643E" stroke={INK} strokeWidth={3.5} />)}
            {/* 起きた家の煙突から細い煙 */}
            {litOf(i) > 0.3 && [0, 1, 2].map((j) => {
              const t = ((f / 90 + j / 3) % 1);
              return <circle key={j} cx={hx - 11 + t * 40} cy={44 - t * 90} r={8 + t * 20} fill="#B8B4BC" opacity={(1 - t) * 0.5} />;
            })}
          </g>
        );
      })}
      {/* れんがの壁 */}
      <BrickWall x={-40} y={240} w={2000} h={620} seed={11} />
      <rect x={-40} y={232} width={2000} height={14} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
      {/* 2階と1階の境の帯 */}
      <rect x={-40} y={480} width={2000} height={14} fill={MP.brickDark} stroke={INK} strokeWidth={3} />
      {Array.from({ length: 6 }, (_, i) => {
        const x0 = -30 + i * 330;
        const [wx, wy] = MACHI_WIN[i];
        return (
          <g key={i}>
            {/* 家の境の雨どい */}
            <rect x={x0 - 6} y={240} width={12} height={620} fill={MP.iron} stroke={INK} strokeWidth={3} />
            {/* 2階の寝室の窓 */}
            {sashWin(wx, wy, 130, 170, `u${i}`, isOpen(i))}
            {/* 1階の窓 */}
            {sashWin(x0 + 230, 680, 120, 150, `d${i}`)}
            {/* 玄関 (扇形の明かり取り・ノッカー・石段) */}
            <rect x={x0 + 40} y={600} width={96} height={20} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
            <path d={`M ${x0 + 46} 620 A 42 26 0 0 1 ${x0 + 130} 620 Z`} fill="#3A3F52" stroke={INK} strokeWidth={3.5} />
            <rect x={x0 + 46} y={620} width={84} height={240} fill={["#3E5C46", "#5A2E2E", "#2E3F5C", "#5C4A2E", "#40363E", "#2E5452"][i]} stroke={INK} strokeWidth={5} />
            <rect x={x0 + 58} y={640} width={60} height={80} fill="none" stroke={INK} strokeWidth={3} opacity={0.4} />
            <rect x={x0 + 58} y={740} width={60} height={100} fill="none" stroke={INK} strokeWidth={3} opacity={0.4} />
            <circle cx={x0 + 88} cy={700} r={8} fill="none" stroke={MP.brass} strokeWidth={4} />
            <circle cx={x0 + 120} cy={760} r={5} fill={MP.brass} />
            <text x={x0 + 88} y={636} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={14} fill="#F1EADF">{i * 2 + 3}</text>
            <rect x={x0 + 34} y={856} width={108} height={16} fill={MP.stone} stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
      {/* 歩道 (敷石) */}
      <rect x={-40} y={860} width={2000} height={60} fill="#9C958C" />
      {Array.from({ length: 21 }, (_, i) => <line key={i} x1={-40 + i * 100} y1={860} x2={-60 + i * 100} y2={920} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}
      <rect x={-40} y={916} width={2000} height={14} fill="#B5AEA4" stroke={INK} strokeWidth={4} />
      {/* 石畳 */}
      <rect x={-40} y={930} width={2000} height={190} fill="#6E655E" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 30 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-40 + c * 70 + (r % 2) * 35} y={938 + r * 44} width={62} height={36} rx={13}
          fill={(r * 3 + c) % 4 ? "#857B73" : "#91877E"} stroke={INK} strokeWidth={2.5} />
      )))}
      {/* ガス灯 (柱) */}
      <g>
        <rect x={976} y={500} width={28} height={420} fill={MP.iron} stroke={INK} strokeWidth={5} />
        <rect x={962} y={880} width={56} height={40} rx={6} fill={MP.iron} stroke={INK} strokeWidth={5} />
        <rect x={940} y={530} width={100} height={10} fill={MP.iron} stroke={INK} strokeWidth={3.5} />
        <path d="M 960 820 q 30 -20 60 0" stroke={MP.ironLight} strokeWidth={4} fill="none" />
        <path d="M 950 420 L 1030 420 L 1018 500 L 962 500 Z" fill="#F6E7B6" stroke={INK} strokeWidth={5} />
        <path d="M 940 420 L 990 380 L 1040 420 Z" fill={MP.iron} stroke={INK} strokeWidth={5} />
        <circle cx={990} cy={374} r={7} fill={MP.iron} stroke={INK} strokeWidth={3} />
        <path d="M 975 420 L 970 500 M 1005 420 L 1010 500" stroke={INK} strokeWidth={3} />
      </g>
      {/* 暗さ */}
      {dim > 0.01 && <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={dim} />}
      {/* 明かりのついた窓 (暗さの上から) */}
      {MACHI_WIN.map(([wx, wy], i) => {
        const l = litOf(i);
        if (l <= 0.01) return null;
        return (
          <g key={i} opacity={l}>
            {[130, 95].map((gr) => <circle key={gr} cx={wx} cy={wy} r={gr} fill={MP.glow} opacity={0.1} />)}
            <rect x={wx - 60} y={wy - 80} width={120} height={160} fill="#FFD983" />
            <path d={`M ${wx - 60} ${wy - 80} L ${wx - 30} ${wy - 80} Q ${wx - 40} ${wy} ${wx - 52} ${wy + 80} L ${wx - 60} ${wy + 80} Z`} fill="#C98C6A" />
            <path d={`M ${wx + 60} ${wy - 80} L ${wx + 30} ${wy - 80} Q ${wx + 40} ${wy} ${wx + 52} ${wy + 80} L ${wx + 60} ${wy + 80} Z`} fill="#C98C6A" />
            <path d={`M ${wx} ${wy - 76} L ${wx} ${wy + 76} M ${wx - 56} ${wy - 42} L ${wx + 56} ${wy - 42} M ${wx - 56} ${wy + 42} L ${wx + 56} ${wy + 42}`} stroke="#F1EADF" strokeWidth={4} />
            {isOpen(i) && (
              <g>
                {/* 下の窓を上に押し上げた: 上半分は窓わくが2重、下半分はガラスの無い吹き抜け */}
                <rect x={wx - 56} y={wy - 72} width={112} height={70} fill="none" stroke="#F1EADF" strokeWidth={7} />
                <rect x={wx - 56} y={wy + 2} width={112} height={76} fill="#FFE6A8" />
                <rect x={wx - 60} y={wy - 4} width={120} height={8} fill="#F1EADF" stroke={INK} strokeWidth={2.5} />
              </g>
            )}
            <rect x={wx - 61} y={wy - 81} width={122} height={162} fill="none" stroke={INK} strokeWidth={5} />
            <polygon points={`${wx - 60},${wy + 98} ${wx + 60},${wy + 98} ${wx + 90},${wy + 160} ${wx - 90},${wy + 160}`} fill={MP.glow} opacity={0.12} />
          </g>
        );
      })}
      {/* ガス灯の火と光 */}
      <circle cx={990} cy={460} r={220} fill={MP.glow} opacity={0.12 * lampFl * (0.4 + dim * 1.6)} />
      <circle cx={990} cy={460} r={90} fill={MP.glow} opacity={0.2 * lampFl} />
      <g transform={`translate(990 488) scale(${0.95 + 0.08 * lampFl})`}>
        <path d={`M -12 0 Q -16 -24 ${Math.sin(f / 3) * 3} -44 Q 16 -24 12 0 Z`} fill={MP.flame} stroke="#D9822C" strokeWidth={2} />
        <path d={`M -6 0 Q -8 -14 ${Math.sin(f / 3) * 2} -26 Q 8 -14 6 0 Z`} fill={MP.flameCore} />
        <ellipse cx={0} cy={2} rx={10} ry={4} fill="#7FB2E6" opacity={0.9} />
      </g>
      {/* 道のもや */}
      <rect x={-40} y={880 + Math.sin(f / 50) * 6} width={2000} height={70} fill={MP.mist} opacity={0.16 * (1 - sky / 2)} />
      <ellipse cx={(f * 1.2) % 2400 - 240} cy={940} rx={320} ry={34} fill={MP.mist} opacity={0.14} />
    </g>
  );
};

/* ===================================================================
 * KnockerUp — ノッカー・アップ (窓をたたいて起こす職業の人。#134〜#168・#183・#192・#195・#203)
 *   x,y: 足元。s 既定 0.9 (高さ およそ290px)。dir: 1=右を向いて棒を右へ (既定) / -1=左へ
 *   男性 (既定): 黒い山高帽・長い灰色のコート (ボタン3つ)・赤いマフラー (はためく)・長い棒 (先に針金の房)
 *   female: 後ろ姿の女性 (帽子・肩掛け・くるぶしまでの長いスカート・後ろで結んだ髪の房)。顔は見せない (#138)
 *   old: 白髪・白い口ひげ・白い眉・少し曲がった腰 (#163〜#168 のボルトンの72歳)
 *   pose: "walk" 棒をかついで歩く / "knock" 棒で2階の窓をたたく (tip で棒の先を窓に合わせる) /
 *         "shoot" 後ろ姿で豆鉄砲 (細い管) を窓に向けて吹く / "sleep" 寝ている (あお向け・頭が左。寝間着とナイトキャップ) /
 *         "jump" 飛び起きる (ばんざい・驚き顔・帽子が飛ぶ)
 *   tip: (省略可) knock / shoot のときの棒・豆の先の画面座標。MACHI_WIN[i] を渡すと窓に届く
 *   night: (省略可) 寝間着とナイトキャップ (sleep と jump の既定は true)
 *   shots / shotFrom: (省略可) shoot の豆の数。省略=豆が飛び続ける / 0=豆なし / n=フレーム shotFrom から12コマおきに n 粒だけ飛んで止まる
 *   ※ walk の棒は肩の後ろ (頭より奥) を通す。knock の棒も体の奥に描くので、顔に棒はかからない
 *   face / phase: Person と同じ (female と sleep では顔は描かない/目を閉じる)
 * =================================================================== */
export const KnockerUp: React.FC<{
  x: number; y: number; s?: number; f: number; pose?: "walk" | "knock" | "shoot" | "sleep" | "jump";
  female?: boolean; old?: boolean; face?: Face; phase?: number; dir?: 1 | -1; tip?: [number, number]; night?: boolean;
  shots?: number; shotFrom?: number;
}> = ({ x, y, s = 0.9, f, pose = "walk", female = false, old = false, face, phase = 0, dir = 1, tip, night, shots, shotFrom = 0 }) => {
  const isNight = night ?? (pose === "sleep" || pose === "jump");
  const backView = female || pose === "shoot";
  const lean = old && pose !== "sleep" ? 8 : 0;
  const jumpY = pose === "jump" ? -Math.abs(Math.sin(f / 5)) * 46 * s - 20 * s : 0;
  const bob = Math.sin((f + phase * 17) / 13) * 3 + jumpY;
  const L = (lean * Math.PI) / 180;
  // Person の座標 → 画面の座標 (dir の左右反転・lean の傾きこみ)
  const toS = (px: number, py: number): [number, number] => {
    const rx = px * Math.cos(L) - py * Math.sin(L), ry = px * Math.sin(L) + py * Math.cos(L);
    return [x + dir * rx * s, y + bob + ry * s];
  };
  const coat = isNight ? "#E9E3D4" : "#7D828B";
  const coatDark = isNight ? "#C9C1AE" : "#4A4E57";
  const scarfRed = "#C8372B";
  const flut = Math.sin(f / 3.3 + phase) * 10 + (pose === "walk" ? 16 : 6);
  const mirror = `translate(${x} 0) scale(${dir} 1) translate(${-x} 0)`;
  const inner = `translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`;

  // ---- 棒 (針金の房つき) ----
  const pole = (H: [number, number], T: [number, number], hit: number) => {
    const dx = T[0] - H[0], dy = T[1] - H[1];
    const len = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / len, uy = dy / len;
    const B: [number, number] = [H[0] - ux * 90 * s, H[1] - uy * 90 * s];
    const a0 = Math.atan2(uy, ux);
    return (
      <g>
        <line x1={B[0]} y1={B[1]} x2={T[0]} y2={T[1]} stroke={INK} strokeWidth={13 * s} strokeLinecap="round" />
        <line x1={B[0]} y1={B[1]} x2={T[0]} y2={T[1]} stroke={MP.woodLight} strokeWidth={7 * s} strokeLinecap="round" />
        {/* 先の金具と針金の房 */}
        <line x1={T[0] - ux * 26 * s} y1={T[1] - uy * 26 * s} x2={T[0]} y2={T[1]} stroke={MP.iron} strokeWidth={10 * s} strokeLinecap="round" />
        {[-34, -20, -8, 4, 16, 28, 38].map((d, i) => {
          const a = a0 + (d * Math.PI) / 180;
          const ll = (24 + (i % 3) * 6) * s;
          return <path key={i} d={`M ${T[0]} ${T[1]} q ${Math.cos(a) * ll * 0.5 - Math.sin(a) * 4 * s} ${Math.sin(a) * ll * 0.5 + Math.cos(a) * 4 * s} ${Math.cos(a) * ll} ${Math.sin(a) * ll}`}
            stroke={MP.ironLight} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />;
        })}
        {/* コツコツ (当たった瞬間の線) */}
        {hit > 0.05 && [-50, 0, 50].map((d, i) => {
          const a = a0 + (d * Math.PI) / 180;
          return <line key={i} x1={T[0] + Math.cos(a) * 40 * s} y1={T[1] + Math.sin(a) * 40 * s} x2={T[0] + Math.cos(a) * 64 * s} y2={T[1] + Math.sin(a) * 64 * s}
            stroke={MP.glow} strokeWidth={6 * s} strokeLinecap="round" opacity={hit} />;
        })}
      </g>
    );
  };
  // knock のとき: 棒を引いては当てる
  const tapT = Math.sin(f * 0.55 + phase);
  const tapBack = Math.max(0, tapT) * 16 * s;
  const hit = tapT < -0.75 ? (-tapT - 0.75) * 4 : 0;
  const knockTip = (H: [number, number]): [number, number] => {
    const T0: [number, number] = tip ?? [H[0] + dir * Math.cos((62 * Math.PI) / 180) * 430 * s, H[1] - Math.sin((62 * Math.PI) / 180) * 430 * s];
    const dx = T0[0] - H[0], dy = T0[1] - H[1], len = Math.max(Math.hypot(dx, dy), 1);
    return [T0[0] - (dx / len) * tapBack, T0[1] - (dy / len) * tapBack];
  };

  // ================= 後ろ姿 (女性・豆鉄砲) =================
  if (backView) {
    const swing = pose === "walk" ? Math.sin(f / 5 + phase) * 10 : 0;
    const handR: [number, number] = pose === "knock" ? [100, -252] : pose === "shoot" ? [30, -240] : [70 + swing * 0.3, -70];
    const elbowR: [number, number] = pose === "knock" ? [98, -196] : pose === "shoot" ? [98, -198] : [72, -110];
    const handL: [number, number] = pose === "shoot" ? [-26, -238] : [-70 - swing * 0.3, -70];
    const elbowL: [number, number] = pose === "shoot" ? [-96, -200] : [-72, -110];
    const sleeve = female ? "#6E3442" : coat;
    const armPath = (sh: [number, number], el: [number, number], hd: [number, number]) => `M ${sh[0]} ${sh[1]} L ${el[0]} ${el[1]} L ${hd[0]} ${hd[1]}`;
    const tubeA = Math.atan2(-1, 1.15);
    const tubeEnd: [number, number] = [30 + Math.cos(tubeA) * 230, -248 + Math.sin(tubeA) * 230];
    const handRS = toS(handR[0], handR[1]);
    return (
      <g>
        {pose === "knock" && pole(handRS, knockTip(handRS), hit)}
        <g transform={mirror}>
          <g transform={inner}>
            {/* 腕 (頭より先に描く。豆鉄砲のときは手が顔の前=頭の陰に入る) */}
            {[[[-56, -150], elbowL, handL], [[56, -150], elbowR, handR]].map(([sh, el, hd], i) => (
              <g key={i}>
                <path d={armPath(sh as [number, number], el as [number, number], hd as [number, number])} stroke={INK} strokeWidth={27} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d={armPath(sh as [number, number], el as [number, number], hd as [number, number])} stroke={sleeve} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={(hd as number[])[0]} cy={(hd as number[])[1]} r={11} fill={female ? "#F6EEE6" : KRP.white} stroke={INK} strokeWidth={4} />
              </g>
            ))}
            {female ? (
              <g>
                {/* 靴 */}
                <ellipse cx={-20} cy={-4} rx={18} ry={8} fill={INK} />
                <ellipse cx={20} cy={-4} rx={18} ry={8} fill={INK} />
                {/* 長いスカート (くるぶしまで) */}
                <path d={`M -54 -100 L 54 -100 L ${86 + swing * 0.4} -12 Q 0 2 ${-86 + swing * 0.4} -12 Z`} fill="#8C3440" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                <path d={`M -30 -96 L ${-48 + swing * 0.3} -12 M 0 -96 L ${swing * 0.3} -6 M 30 -96 L ${48 + swing * 0.3} -12`} stroke="#6E2632" strokeWidth={4} opacity={0.7} />
                <path d={`M ${-84 + swing * 0.4} -24 Q 0 -10 ${84 + swing * 0.4} -24`} stroke="#B9505C" strokeWidth={6} fill="none" />
                {/* 胴 (ブラウス) と肩掛け */}
                <rect x={-56} y={-162} width={112} height={70} rx={16} fill="#6E3442" stroke={INK} strokeWidth={5} />
                <path d="M -66 -164 Q 0 -176 66 -164 L 40 -118 Q 0 -86 -40 -118 Z" fill="#A47C52" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                <path d="M -50 -150 L 50 -150 M -36 -130 L 36 -130" stroke="#7A5634" strokeWidth={3} opacity={0.75} />
                {[-30, -18, -6, 6, 18, 30].map((fx) => <line key={fx} x1={fx} y1={-100 - Math.abs(fx) * 0.5} x2={fx * 1.05} y2={-88 - Math.abs(fx) * 0.5} stroke="#7A5634" strokeWidth={2.5} />)}
                {/* 頭 (後ろ姿=髪) と結んだ髪の房 */}
                <circle cx={0} cy={-228} r={62} fill="#7A4A2C" stroke={INK} strokeWidth={5.5} />
                {/* 髪の流れ (後ろの結び目へ集まる線) */}
                <path d="M -56 -250 Q -36 -214 -16 -186 M -30 -270 Q -14 -230 -6 -190 M 30 -270 Q 14 -230 6 -190 M 56 -250 Q 36 -214 16 -186" stroke="#5C3620" strokeWidth={4} fill="none" strokeLinecap="round" />
                {/* 結んで垂らした髪の房 (首の後ろへ) */}
                <path d={`M -10 -184 Q ${-14 + Math.sin(f / 6) * 3} -158 ${-4 + Math.sin(f / 6) * 5} -132 Q 4 -128 10 -134 Q 12 -160 10 -184 Z`} fill="#6A3E24" stroke={INK} strokeWidth={3.5} />
                <path d={`M -2 -176 Q ${-3 + Math.sin(f / 6) * 2} -156 ${Math.sin(f / 6) * 4} -138`} stroke="#4E2C18" strokeWidth={2.5} fill="none" />
                {/* 結び目の紺のリボン (小さな蝶結び) */}
                <path d="M 0 -186 L -18 -196 L -18 -176 Z M 0 -186 L 18 -196 L 18 -176 Z" fill="#3E4E8A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                <circle cx={0} cy={-186} r={5} fill="#3E4E8A" stroke={INK} strokeWidth={2.5} />
                {/* 帽子 (つば付きの小さな麦わら帽) */}
                <ellipse cx={0} cy={-268} rx={78} ry={14} fill="#C9A55E" stroke={INK} strokeWidth={5} />
                <path d="M -46 -270 Q -44 -314 0 -316 Q 44 -314 46 -270 Z" fill="#D9B870" stroke={INK} strokeWidth={5} />
                <path d="M -46 -280 Q 0 -270 46 -280" stroke="#5A3E70" strokeWidth={8} fill="none" />
              </g>
            ) : (
              <g>
                {/* 男性の後ろ姿 (ズボン・長いコート・マフラー・山高帽) */}
                <rect x={-30} y={-58} width={24} height={52} fill={coatDark} stroke={INK} strokeWidth={4.5} />
                <rect x={6} y={-58} width={24} height={52} fill={coatDark} stroke={INK} strokeWidth={4.5} />
                <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={INK} />
                <ellipse cx={18} cy={-4} rx={20} ry={9} fill={INK} />
                <path d="M -60 -162 L 60 -162 L 70 -26 L -70 -26 Z" fill={coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                <path d="M 0 -96 L 0 -26" stroke={INK} strokeWidth={3.5} />
                <path d="M -40 -100 L 40 -100" stroke={coatDark} strokeWidth={6} />
                <circle cx={-24} cy={-100} r={5} fill={coatDark} stroke={INK} strokeWidth={2} />
                <circle cx={24} cy={-100} r={5} fill={coatDark} stroke={INK} strokeWidth={2} />
                <circle cx={0} cy={-228} r={62} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
                <path d={old ? "M -62 -224 Q -64 -206 -40 -192 Q 0 -184 40 -192 Q 64 -206 62 -224 Q 0 -212 -62 -224 Z" : "M -62 -240 Q -64 -200 0 -190 Q 64 -200 62 -240 Q 0 -230 -62 -240 Z"} fill={old ? "#ECECEC" : INK} stroke={old ? INK : "none"} strokeWidth={2} />
                <ellipse cx={-62} cy={-226} rx={8} ry={14} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                <ellipse cx={62} cy={-226} rx={8} ry={14} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                <rect x={-52} y={-176} width={104} height={22} rx={10} fill={scarfRed} stroke={INK} strokeWidth={4} />
                <path d={`M -20 -160 Q ${-30 - flut * 0.3} -120 ${-36 - flut * 0.5} -96 L ${-18 - flut * 0.5} -94 Q -10 -126 -2 -160 Z`} fill={scarfRed} stroke={INK} strokeWidth={4} />
                <ellipse cx={0} cy={-270} rx={80} ry={13} fill={INK} />
                <path d="M -50 -272 Q -50 -330 0 -332 Q 50 -330 50 -272 Z" fill="#2C2A2E" stroke={INK} strokeWidth={4} />
                <path d="M -50 -282 Q 0 -274 50 -282" stroke="#555058" strokeWidth={6} fill="none" />
              </g>
            )}
            {/* 豆鉄砲 (細い管) と飛ぶ豆 */}
            {pose === "shoot" && (
              <g>
                <line x1={30} y1={-248} x2={tubeEnd[0]} y2={tubeEnd[1]} stroke={INK} strokeWidth={14} strokeLinecap="round" />
                <line x1={30} y1={-248} x2={tubeEnd[0]} y2={tubeEnd[1]} stroke="#8C6A3E" strokeWidth={8} strokeLinecap="round" />
                <circle cx={tubeEnd[0]} cy={tubeEnd[1]} r={7} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
                {(shots === undefined ? [0, 1, 2] : Array.from({ length: Math.max(0, Math.floor(shots)) }, (_, k) => k)).map((k) => {
                  const t = shots === undefined ? ((f / 10 + k / 3) % 1) : (f - shotFrom - k * 12) / 30;
                  if (t < 0 || t > 1) return null;
                  const d = 30 + t * 300;
                  return <circle key={k} cx={tubeEnd[0] + Math.cos(tubeA) * d} cy={tubeEnd[1] + Math.sin(tubeA) * d + t * t * 40} r={7} fill="#B9C46A" stroke={INK} strokeWidth={2.5} opacity={1 - t * 0.6} />;
                })}
                {/* ほおのふくらみ (吹いている) */}
                <path d="M 54 -214 q 18 -6 14 -22" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>
      </g>
    );
  }

  // ================= 前向き (男性。Person を使う) =================
  const personPose: Pose = pose === "walk" ? "run" : pose === "knock" ? "raise" : pose === "jump" ? "banzai" : "stand";
  const fc: Face = face ?? (pose === "jump" ? "surprised" : "normal");
  const hatUp = pose === "jump" ? 70 + Math.abs(Math.sin(f / 5)) * 30 : 0;
  // 帽子・マフラー・コートのすそ・ボタン・(old) 白髪とひげ を Person の上に重ねる
  const overlay = (
    <g transform={inner}>
      {/* コートのすそ (ひざまで) */}
      <path d="M -58 -60 L 58 -60 L 68 -22 Q 0 -14 -68 -22 Z" fill={coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <line x1={0} y1={-60} x2={0} y2={-18} stroke={INK} strokeWidth={3.5} />
      {/* 胸の折り返しとボタン */}
      {!isNight && <path d="M -30 -160 L 0 -118 L 30 -160" stroke={coatDark} strokeWidth={6} fill="none" />}
      {[-136, -110, -84].map((by) => <circle key={by} cx={0} cy={by} r={6} fill={isNight ? "#B9B09A" : MP.brass} stroke={INK} strokeWidth={2.5} />)}
      {/* マフラー (寝間着のときは無し) */}
      {!isNight && (
        <g>
          <rect x={-52} y={-178} width={104} height={24} rx={11} fill={scarfRed} stroke={INK} strokeWidth={4} />
          <path d="M -30 -176 L -26 -156 M 0 -178 L 0 -156 M 30 -176 L 26 -156" stroke="#E8D3B0" strokeWidth={4} />
          <path d={`M 26 -160 Q ${44 + flut * 0.4} -130 ${54 + flut} ${-100 + Math.sin(f / 2.6) * 4} L ${70 + flut} ${-108 + Math.sin(f / 2.6) * 4} Q ${58 + flut * 0.4} -136 44 -162 Z`}
            fill={scarfRed} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M ${56 + flut} ${-100 + Math.sin(f / 2.6) * 4} l -4 10 M ${64 + flut} ${-104 + Math.sin(f / 2.6) * 4} l 0 10`} stroke={INK} strokeWidth={3} />
        </g>
      )}
      {/* 老人: 白髪 (横)・白い眉・白い口ひげ・しわ */}
      {old && (
        <g>
          <path d="M -64 -250 Q -78 -226 -62 -198 Q -56 -222 -54 -244 Z" fill="#F1F1EE" stroke={INK} strokeWidth={3.5} />
          <path d="M 64 -250 Q 78 -226 62 -198 Q 56 -222 54 -244 Z" fill="#F1F1EE" stroke={INK} strokeWidth={3.5} />
          <g stroke="#F4F4F0" strokeWidth={7} strokeLinecap="round">
            <line x1={-36} y1={-250} x2={-12} y2={-250} />
            <line x1={12} y1={-250} x2={36} y2={-250} />
          </g>
          <path d="M -32 -194 Q -16 -210 0 -199 Q 16 -210 32 -194 Q 18 -184 0 -193 Q -18 -184 -32 -194 Z" fill="#F4F4F0" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M -44 -212 l -8 -4 M 44 -212 l 8 -4" stroke={INK} strokeWidth={2.5} opacity={0.6} />
        </g>
      )}
      {/* 帽子 (昼=黒い山高帽 / 夜=しま模様のナイトキャップ) */}
      {isNight ? (
        <g transform={`translate(0 ${-hatUp}) rotate(${hatUp ? -16 : 0} 0 -270)`}>
          <path d={`M -64 -262 Q -60 -312 0 -318 Q 50 -320 ${86 + Math.sin(f / 8) * 4} -276 L ${96 + Math.sin(f / 8) * 4} -264 Q 40 -300 64 -262 Z`} fill="#6E8FC0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <path d="M -40 -300 Q 0 -290 30 -312 M -56 -280 Q 0 -270 52 -296" stroke={KRP.white} strokeWidth={6} fill="none" />
          <rect x={-68} y={-268} width={136} height={14} rx={7} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <circle cx={96 + Math.sin(f / 8) * 4} cy={-262} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
        </g>
      ) : (
        <g transform={`translate(0 ${-hatUp}) rotate(${hatUp ? 18 : 0} 0 -272)`}>
          <ellipse cx={0} cy={-268} rx={84} ry={14} fill="#2C2A2E" stroke={INK} strokeWidth={4} />
          <path d="M -52 -270 Q -52 -332 0 -334 Q 52 -332 52 -270 Z" fill="#2C2A2E" stroke={INK} strokeWidth={4} />
          <path d="M -52 -282 Q 0 -274 52 -282" stroke="#5A5560" strokeWidth={7} fill="none" />
          <path d="M -32 -318 Q -18 -326 -4 -326" stroke="#6A6670" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* 飛び起きた驚きの線 */}
      {pose === "jump" && [-60, -20, 20, 60].map((a) => (
        <line key={a} x1={0} y1={-228} x2={0} y2={-330} stroke={INK} strokeWidth={6} strokeLinecap="round"
          transform={`rotate(${a} 0 -228) translate(0 ${-30 - (f % 6)})`} strokeDasharray="0 40 30 200" />
      ))}
    </g>
  );

  if (pose === "sleep") {
    // あお向けに寝る (頭が左)。足元 x,y を中心に -90度回す。シーン側でベッドを下に描く
    return (
      <g>
        <g transform={`rotate(-90 ${x} ${y})`}>
          <Person x={x} y={y} s={s} f={f} face="normal" pose="stand" phase={phase} still cloth={coat} clothDark={coatDark} hair={old ? "none" : "cap"} />
          <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M -58 -60 L 58 -60 L 64 -8 Q 0 0 -64 -8 Z" fill={coat} stroke={INK} strokeWidth={5} />
            {[-136, -110, -84].map((by) => <circle key={by} cx={0} cy={by} r={6} fill="#B9B09A" stroke={INK} strokeWidth={2.5} />)}
            {/* 閉じた目と口 (いびき) */}
            <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <path d="M -36 -220 Q -24 -210 -12 -220 M 12 -220 Q 24 -210 36 -220" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            <rect x={-14} y={-192} width={28} height={12} fill={KRP.white} />
            <ellipse cx={0} cy={-186} rx={7 + Math.sin(f / 20) * 2} ry={8 + Math.sin(f / 20) * 2} fill={INK} />
            {old && (
              <g>
                <path d="M -64 -250 Q -78 -226 -62 -198 Q -56 -222 -54 -244 Z" fill="#F1F1EE" stroke={INK} strokeWidth={3.5} />
                <path d="M 64 -250 Q 78 -226 62 -198 Q 56 -222 54 -244 Z" fill="#F1F1EE" stroke={INK} strokeWidth={3.5} />
                <path d="M -32 -196 Q -16 -212 0 -201 Q 16 -212 32 -196 Q 18 -186 0 -195 Q -18 -186 -32 -196 Z" fill="#F4F4F0" stroke={INK} strokeWidth={3.5} />
              </g>
            )}
            <g>
              <path d={`M -64 -262 Q -60 -312 0 -318 Q 50 -320 ${86 + Math.sin(f / 30) * 3} -276 L ${96 + Math.sin(f / 30) * 3} -264 Q 40 -300 64 -262 Z`} fill="#6E8FC0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
              <path d="M -40 -300 Q 0 -290 30 -312 M -56 -280 Q 0 -270 52 -296" stroke={KRP.white} strokeWidth={6} fill="none" />
              <rect x={-68} y={-268} width={136} height={14} rx={7} fill={KRP.white} stroke={INK} strokeWidth={4} />
              <circle cx={96 + Math.sin(f / 30) * 3} cy={-262} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            </g>
          </g>
        </g>
        {/* Zzz */}
        {[0, 1, 2].map((i) => {
          const t = ((f / 50 + i / 3) % 1);
          return <text key={i} x={x - 230 * s + t * 50 * s} y={y - 90 * s - t * 160 * s} fontFamily={FONT} fontWeight={900} fontSize={(28 + t * 24) * s / 0.9}
            fill={KRP.white} stroke={INK} strokeWidth={2.5} opacity={Math.sin(t * Math.PI)}>Z</text>;
        })}
      </g>
    );
  }

  const handS = toS(67, -232);
  return (
    <g>
      {pose === "knock" && pole(handS, knockTip(handS), hit)}
      {pose === "walk" && (() => {
        // 棒は右肩にかつぐ (後ろ上へ)。Person より先に描くので、頭と体の奥を通り、顔にはかからない
        const S = toS(52, -160);
        const ang = (58 * Math.PI) / 180;
        const T: [number, number] = [S[0] - dir * Math.cos(ang) * 470 * s, S[1] - Math.sin(ang) * 470 * s];
        return pole([S[0] + dir * Math.cos(ang) * 10 * s, S[1] + Math.sin(ang) * 10 * s], T, 0);
      })()}
      <g transform={mirror}>
        <Person x={x} y={y + jumpY} s={s} f={f} face={fc} pose={personPose} lean={lean} phase={phase}
          cloth={coat} clothDark={coatDark} hair={old ? "none" : "cap"} />
        {overlay}
      </g>
    </g>
  );
};

/* ===================================================================
 * BellClock — ベル式の目覚まし時計 (#145〜#153・#166・#167・#170〜#182・#209〜#212)
 *   x,y: 文字盤の中心。s=1 で 本体の直径224px (ベル・脚を入れて 幅およそ330・高さ およそ360)
 *   丸い文字盤 (数字・60の目盛り・赤い目覚まし針・秒針)・上に2つのベル・間のハンマー・2本の脚・後ろのゼンマイのつまみ
 *   ring: 鳴る 0〜1 (ハンマーが左右のベルを高速で打つ・本体が震えて跳ねる・音の線)
 *   snooze: true で上にスヌーズボタン (横長のボタン) が付いた版。snoozePress (0〜1) でボタンが沈む
 *   time: (省略可) 時刻 (0時からの分。既定 6:00)。alarm: 目覚まし針の時刻 (既定 6:00)
 *   body: (省略可) 本体の色 (既定 赤)
 * =================================================================== */
export const BellClock: React.FC<{
  x: number; y: number; s?: number; f: number; ring?: number; snooze?: boolean; snoozePress?: number; time?: number; alarm?: number; body?: string; rot?: number;
}> = ({ x, y, s = 1, f, ring = 0, snooze = false, snoozePress = 0, time = 6 * 60, alarm = 6 * 60, body = MP.bell, rot = 0 }) => {
  const rg = clamp01(ring);
  const hammer = rg > 0.01 ? Math.sin(f * 2.4) * 34 * rg : 0;
  const shake = rg > 0.01 ? Math.sin(f * 3.1) * 4 * rg : 0;
  const hop = rg > 0.01 ? -Math.abs(Math.sin(f * 1.2)) * 8 * rg : 0;
  const bodyDark = mixColor(body, INK, 0.3);
  const alA = (((alarm / 60) % 12) / 12) * 360;
  const sp = clamp01(snoozePress) * 8;
  return (
    <g transform={`translate(${x} ${y + hop * s}) rotate(${rot + shake}) scale(${s})`}>
      {/* 後ろのゼンマイのつまみ (右) と目覚ましのつまみ (左) */}
      <g>
        <rect x={96} y={-84} width={20} height={14} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} transform="rotate(-30 106 -77)" />
        <path d="M 116 -112 Q 138 -128 150 -106 Q 140 -92 124 -96 Q 140 -80 128 -62 Q 108 -66 112 -88 Z" fill={MP.brass} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={-112} cy={-74} r={12} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} />
        <path d="M -118 -80 l 12 12 M -106 -80 l -12 12" stroke={INK} strokeWidth={2} opacity={0.5} />
      </g>
      {/* 脚 (2本・丸い足先) */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 54} 92 L ${sd * 82} 146`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
          <path d={`M ${sd * 54} 92 L ${sd * 82} 146`} stroke={MP.brass} strokeWidth={9} strokeLinecap="round" />
          <circle cx={sd * 84} cy={150} r={12} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {/* ベルを支える弓形の金具 */}
      <path d="M -70 -100 Q 0 -178 70 -100" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d="M -70 -100 Q 0 -178 70 -100" stroke={MP.brass} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* ベル2つ */}
      {[-1, 1].map((sd) => {
        const hitNow = rg > 0.01 && Math.sign(hammer) === sd && Math.abs(hammer) > 26 * rg;
        return (
          <g key={sd} transform={`translate(${sd * 72} -126) rotate(${sd * 26 + (hitNow ? sd * 4 : 0)})`}>
            <line x1={0} y1={0} x2={0} y2={20} stroke={MP.brassDark} strokeWidth={8} />
            <path d="M -50 14 Q -50 -42 0 -44 Q 50 -42 50 14 Z" fill={MP.brass} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d="M -50 14 L 50 14" stroke={MP.brassDark} strokeWidth={6} />
            <path d="M -32 2 Q -32 -26 -12 -34" stroke={MP.brassLight} strokeWidth={7} fill="none" strokeLinecap="round" />
            <circle cx={0} cy={-46} r={8} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} />
          </g>
        );
      })}
      {/* ハンマー (2つのベルの間で左右に打つ) */}
      <g transform={`rotate(${hammer} 0 -104)`}>
        <line x1={0} y1={-104} x2={0} y2={-168} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={-104} x2={0} y2={-168} stroke={MP.brassDark} strokeWidth={4} strokeLinecap="round" />
        <rect x={-14} y={-184} width={28} height={20} rx={6} fill={MP.iron} stroke={INK} strokeWidth={4} />
      </g>
      {/* スヌーズボタン */}
      {snooze && (
        <g transform={`translate(0 ${sp})`}>
          <rect x={-10} y={-122} width={20} height={14} fill={MP.brassDark} stroke={INK} strokeWidth={3.5} />
          <rect x={-46} y={-146} width={92} height={26} rx={9} fill={mixColor(body, KRP.white, 0.35)} stroke={INK} strokeWidth={5} />
          <path d="M -34 -139 L 34 -139" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        </g>
      )}
      {/* 本体 */}
      <circle r={112} fill={body} stroke={INK} strokeWidth={8} />
      <circle r={112} fill="none" stroke={bodyDark} strokeWidth={8} transform="scale(0.94)" opacity={0.6} />
      <path d="M -88 -60 A 108 108 0 0 1 -30 -104" stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5} />
      <circle r={98} fill={MP.brass} stroke={INK} strokeWidth={5} />
      <g>
        <ClockFace r={90} minutes={time} f={f} />
        {/* 目覚まし針 (赤い先) */}
        <g transform={`rotate(${alA})`}>
          <line x1={0} y1={0} x2={0} y2={-54} stroke={MP.bellDark} strokeWidth={4} />
          <path d="M -7 -48 L 0 -64 L 7 -48 Z" fill={MP.bell} stroke={INK} strokeWidth={2.5} />
        </g>
        <circle r={7} fill={INK} />
      </g>
      {/* ガラスのつや */}
      <path d="M -66 -38 A 76 76 0 0 1 -20 -74" stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d="M -70 -10 A 76 76 0 0 1 -66 -26" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5} />
      <path d="M 50 62 A 80 80 0 0 0 68 40" stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.35} />
      {/* 音 */}
      <SoundArcs x={0} y={-120} r={120} amt={rg} f={f} w={9} />
      {rg > 0.3 && [-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * 150} 40 l ${sd * 26} 6 M ${sd * 140} 80 l ${sd * 22} 14`} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={rg} />
      ))}
    </g>
  );
};

/* ===================================================================
 * Clocky — 逃げる目覚まし (左右に大きな車輪。#189〜#196)
 *   x,y: 本体の中心。s=1 で 幅およそ340・高さ およそ200 (車輪の下端 y+92)
 *   run: 走る 0〜1 (車輪が回る・本体が跳ねて前に傾く・後ろに速さの線と土ぼこり・アラームが鳴る)
 *   face: 画面の顔 "normal" | "smirk" (にやり) | "surprised" | "sleep"
 *   dir: 1=右へ走る (既定) / -1=左へ
 *   body: (省略可) 本体の色
 * =================================================================== */
export const Clocky: React.FC<{
  x: number; y: number; s?: number; f: number; run?: number; face?: "normal" | "smirk" | "surprised" | "sleep"; dir?: 1 | -1; body?: string;
}> = ({ x, y, s = 1, f, run = 0, face = "normal", dir = 1, body = "#E8EEF2" }) => {
  const r = clamp01(run);
  const spin = f * 14 * r;
  const hop = -Math.abs(Math.sin(f * 0.8)) * 12 * r;
  const tilt = 8 * r + Math.sin(f * 1.6) * 2 * r;
  const wheel = (wx: number, front: boolean) => (
    <g transform={`translate(${wx} 6)`}>
      <circle r={86} fill="#3C3A3E" stroke={INK} strokeWidth={7} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={-8} y={-92} width={16} height={14} rx={3} fill="#2A282C" stroke={INK} strokeWidth={2.5} transform={`rotate(${i * 22.5 + spin})`} />
      ))}
      <circle r={58} fill={front ? "#F0A63A" : "#C98629"} stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={0} y1={0} x2={0} y2={-52} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${k * 72 + spin})`} />)}
      <circle r={16} fill={MP.iron} stroke={INK} strokeWidth={4} />
      <circle cx={-4} cy={-4} r={5} fill={KRP.white} opacity={0.6} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      {/* 土ぼこりと速さの線 (後ろ) */}
      {r > 0.05 && (
        <g opacity={r}>
          {[0, 1, 2, 3].map((k) => {
            const t = ((f / 12 + k / 4) % 1);
            return <circle key={k} cx={-150 - t * 120} cy={86 - t * 40} r={14 + t * 30} fill="#D9CDB6" stroke={INK} strokeWidth={3} opacity={1 - t} />;
          })}
          {[-50, -10, 30].map((ly, k) => (
            <line key={ly} x1={-190 - (f * 9 + k * 40) % 60} y1={ly} x2={-300 - (f * 9 + k * 40) % 60} y2={ly} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={0.6} />
          ))}
        </g>
      )}
      <g transform={`translate(0 ${hop}) rotate(${tilt} 0 90)`}>
        {wheel(-112, false)}
        {wheel(112, true)}
        {/* 本体 (丸みのある箱) */}
        <rect x={-96} y={-76} width={192} height={158} rx={70} fill={body} stroke={INK} strokeWidth={7} />
        <path d="M -70 -50 Q -40 -72 0 -72" stroke={KRP.white} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.8} />
        {/* 上のスヌーズボタン */}
        <rect x={-40} y={-92} width={80} height={20} rx={8} fill="#9AA6B0" stroke={INK} strokeWidth={5} />
        {/* 画面 (時刻と顔) */}
        <rect x={-66} y={-42} width={132} height={92} rx={22} fill="#24323A" stroke={INK} strokeWidth={5} />
        <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#8FF0C8" opacity={0.9}>6:00</text>
        {face === "sleep" ? (
          <path d="M -36 14 Q -24 22 -12 14 M 12 14 Q 24 22 36 14" stroke="#8FF0C8" strokeWidth={5} fill="none" strokeLinecap="round" />
        ) : face === "smirk" ? (
          <g fill="#8FF0C8">
            <path d="M -38 10 Q -24 0 -12 10 L -12 16 L -38 16 Z" />
            <path d="M 12 10 Q 26 0 38 10 L 38 16 L 12 16 Z" />
            <path d="M -18 32 Q 4 42 24 26" stroke="#8FF0C8" strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g fill="#8FF0C8">
            <ellipse cx={-24} cy={14} rx={face === "surprised" ? 11 : 9} ry={face === "surprised" ? 14 : 12} opacity={(f % 90) < 4 && face === "normal" ? 0.2 : 1} />
            <ellipse cx={24} cy={14} rx={face === "surprised" ? 11 : 9} ry={face === "surprised" ? 14 : 12} opacity={(f % 90) < 4 && face === "normal" ? 0.2 : 1} />
            {face === "surprised" && <ellipse cx={0} cy={38} rx={7} ry={6} />}
          </g>
        )}
        {/* スピーカーの穴 */}
        {[-1, 0, 1].map((k) => <circle key={k} cx={k * 16} cy={66} r={4} fill={INK} opacity={0.6} />)}
        {/* 鳴っている音 */}
        <SoundArcs x={0} y={-60} r={110} amt={r} f={f} side={0} w={7} />
      </g>
    </g>
  );
};

/* ===================================================================
 * NazoBell — ナゾベル (「?」付きの小さな目覚ましベルのマーク。繰り返しの謎「起こす人を、誰が起こすのか」の印)
 *   #15 初登場・#45・#58・#88・#158 で同じ印、#168 で solved (「?」が外れて「!」に)
 *   x,y: 中心。s=1 で 直径110 (「?」の札を入れて 幅およそ150)
 *   f: ベルがゆらゆら揺れる・「?」がぴょこぴょこ
 *   solved: true で「?」が「!」になり、まわりにきらきら
 * =================================================================== */
export const NazoBell: React.FC<{ x: number; y: number; s?: number; f: number; solved?: boolean; opacity?: number }> = ({ x, y, s = 1, f, solved = false, opacity = 1 }) => {
  const sw = Math.sin(f / 6) * 12;
  const bounce = -Math.abs(Math.sin(f / 9)) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {solved && (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            const rr = 72 + (Math.floor(f / 4) % 2) * 6;
            return <path key={i} d={`M ${Math.cos(a) * rr} ${Math.sin(a) * rr} l 0 -12 l 4 8 l 8 4 l -8 4 l -4 8 l -4 -8 l -8 -4 l 8 -4 Z`} fill={MP.brassLight} stroke={INK} strokeWidth={2} />;
          })}
        </g>
      )}
      <circle r={56} fill="#FBF3E2" stroke={INK} strokeWidth={6} />
      <circle r={48} fill="none" stroke={solved ? "#3E9A62" : MP.bell} strokeWidth={5} strokeDasharray={solved ? undefined : "10 7"} />
      {/* 小さな目覚ましベル */}
      <g transform={`rotate(${sw} 0 -26)`}>
        <line x1={0} y1={-34} x2={0} y2={-26} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <circle cx={0} cy={-36} r={5} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
        <path d="M -24 18 Q -26 -26 0 -28 Q 26 -26 24 18 L 32 28 L -32 28 Z" fill={MP.bell} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -14 14 Q -16 -12 -4 -20" stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
        <circle cx={-sw * 0.4} cy={34} r={7} fill={MP.brass} stroke={INK} strokeWidth={3} />
      </g>
      {/* 右上の札 (? または !) */}
      <g transform={`translate(44 ${-44 + bounce})`}>
        <circle r={26} fill={solved ? "#3E9A62" : MP.bell} stroke={INK} strokeWidth={5} />
        <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.white}>{solved ? "!" : "?"}</text>
      </g>
    </g>
  );
};

/* ===================================================================
 * プレビュー (検品用)。1コマ = 1部品の見本。動きの props は 2つ並べて比べる
 * =================================================================== */
import { useCurrentFrame } from "remotion";
import { Frame } from "./HimaShared";

export const MEZA_PARTS_PREVIEW_FRAMES = 19;
export const MezaPartsPreview: React.FC = () => {
  const fr = useCurrentFrame();
  const f = 30 + fr * 7;
  const P = (seed: number, children: React.ReactNode, dark = false) => <Frame f={f} seed={seed} dark={dark}>{children}</Frame>;
  switch (fr) {
    case 0: return P(90, <Shinshitsu f={f} sky={0} sleeper={0.5} />, true);
    case 1: return P(91, <Shinshitsu f={f} sky={1} sleeper={0.5} alarms={3} arm={0.9} />);
    case 2: return P(92, <g><Shinshitsu f={f} sky={2} sleeper={0} time={7 * 60 + 40} />
      <Person x={1450} y={930} s={1.05} f={f} face="surprised" cloth={MP.you} clothDark={MP.youDark} /></g>);
    case 3: return P(93, <Shinshitsu f={f} sky={0.4} sleeper={1} lamp />, true);
    case 4: return P(94, <g><rect x={0} y={0} width={1920} height={1080} fill={KRP.paperCool} />
      <SumahoAlarm x={420} y={540} s={1.2} f={f} />
      <SumahoAlarm x={1000} y={540} s={1.2} f={f} on={2} off={[0, 1]} />
      <NazoBell x={1500} y={380} s={1.6} f={f} />
      <NazoBell x={1500} y={760} s={1.6} f={f} solved /></g>);
    case 5: return P(95, <g><rect x={0} y={0} width={1920} height={1080} fill="#F3C9C4" />
      <TainaiDokei x={500} y={580} s={1.2} f={f} lag={1} />
      <TainaiDokei x={1400} y={580} s={1.2} f={f} lag={1} reset={0.6} /></g>);
    case 6: return P(96, <g><rect x={0} y={0} width={1920} height={1080} fill="#F3C9C4" />
      {(["stand", "banzai", "point", "run", "hold", "armsFolded"] as Pose[]).map((p, i) => (
        <Kobito key={p} x={260 + i * 280} y={760} s={0.9} f={f} pose={p} face={(["normal", "joy", "smile", "worried", "normal", "angry"] as Face[])[i]} phase={i} lamp={i === 1} />
      ))}</g>);
    case 7: return P(97, <Shudouin f={f} dark={1} candle={3} bell={0} />, true);
    case 8: return P(98, <Shudouin f={f} dark={0.3} candle={1} bell={1} />);
    case 9: return P(99, <TokiNoKane f={f} swing={0} sky={0.6} />);
    case 10: return P(100, <TokiNoKane f={f} swing={1} sky={1.5} />);
    case 11: return P(101, <BanninTou f={f} ring={0} wake={0} />, true);
    case 12: return P(102, <BanninTou f={f} ring={1} wake={1} />, true);
    case 13: return P(103, <KoujouMon f={f} gate={1} hands={6 * 60} smoke={1} />);
    case 14: return P(104, <KoujouMon f={f} gate={0.15} hands={9 * 60} company sky={1.8} />);
    case 15: return P(105, <g><MachiNami f={f} windows={[0, 1, 0, "open", 0.5, 0]} />
      <KnockerUp x={480} y={MACHI_GROUND + 40} s={0.9} f={f} pose="knock" tip={MACHI_WIN[2]} />
      <KnockerUp x={1500} y={MACHI_GROUND + 60} s={0.9} f={f} pose="shoot" female shots={2} shotFrom={f - 16} /></g>, true);
    case 16: return P(106, <g><rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <KnockerUp x={200} y={900} s={0.75} f={f} pose="walk" />
      <KnockerUp x={500} y={900} s={0.75} f={f} pose="walk" old face="smile" />
      <KnockerUp x={800} y={900} s={0.75} f={f} pose="knock" old />
      <KnockerUp x={1080} y={900} s={0.75} f={f} pose="walk" female />
      <KnockerUp x={1380} y={900} s={0.75} f={f} pose="jump" old />
      <KnockerUp x={1840} y={980} s={0.75} f={f} pose="sleep" old /></g>);
    case 17: return P(107, <g><rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <BellClock x={400} y={540} s={1.3} f={f} ring={0} />
      <BellClock x={960} y={540} s={1.3} f={f} ring={1} />
      <BellClock x={1520} y={540} s={1.3} f={f} snooze time={6 * 60 + 9} /></g>);
    default: return P(108, <g><rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <rect x={0} y={760} width={1920} height={320} fill={KRP.floor} />
      <Clocky x={520} y={660} s={1.4} f={f} run={0} face="sleep" />
      <Clocky x={1340} y={660} s={1.4} f={f} run={1} face="smirk" /></g>);
  }
};
