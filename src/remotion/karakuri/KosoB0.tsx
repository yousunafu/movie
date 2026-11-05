// 「なぜ高層ビルは生まれたのか」: ブロック0 = 序 (章番号なし)
// 担当範囲: 台本 docs/koso-script-v7.txt の 2〜29行目 (文#1〜#28・28文)。
//   ※2026-11-05 に #8 の次へ1文 (ネット通販) を挿したので、#9以降は v1 より1つ後ろ。
//     部品名 S09〜S27 は v1 のまま (大量改名を避けた)。文番号との対応は K_B0_MOTIFS を正とする。
// motif 名は必ず kb0_ で始める。WobbleDefs の seed はこのファイルでは 400〜499 を使う。
//
// ★背景は1文ごとに作る (制作ガイド §7 第3層)。
//   ただし序の仕掛けは「部屋はそのまま、時間だけ巻き戻す」なので、
//   30階の部屋 (窓壁・流し・床) は "同じ物" として同じ見た目で描く。
//   1文ごとに変えるのは カメラの寄り引き・向き・部屋の中の物・窓の外・光・事件。
//   WinWall / Sink は「同じ部屋だから同じ」であって、背景の使い回しではない。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { KRP, Person, clamp01, pop, easeOut, seg } from "./KarakuriScenes";
import { W, H, abs, FONT, Frame, TagPlate, XMark, QMark, Arrow } from "./KosoShared";
import { Pillar, PillarRow, TowerOnPillars, KPP } from "./KosoPillars";

const KPPMizu = KPP.mizu;

// ===== このファイルの中だけの小道具 =====================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない)
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};

// 30階の部屋の窓壁。children が「窓の外」。
const WinWall: React.FC<{
  x: number; y: number; w: number; h: number; mull?: number;
  sill?: boolean; children?: React.ReactNode;
}> = ({ x, y, w, h, mull = 3, sill = true, children }) => {
  const id = `win_${Math.round(x)}_${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={KRP.blueSoft} />
      <g clipPath={`url(#${id})`}>{children}</g>
      {Array.from({ length: mull - 1 }, (_, i) => (
        <line key={i} x1={x + (w / mull) * (i + 1)} y1={y}
          x2={x + (w / mull) * (i + 1)} y2={y + h}
          stroke={KRP.ink} strokeWidth={8} />
      ))}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={10} />
      {sill && (
        <rect x={x - 14} y={y + h} width={w + 28} height={20} rx={5}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      )}
    </g>
  );
};

// 部屋の床と壁 (同じ部屋。床の木目の向きも毎回同じ)
const RoomBox: React.FC<{
  floorY: number; wall?: string; floor?: string; planks?: number;
}> = ({ floorY, wall = KRP.cream, floor = KRP.floor, planks = 9 }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={floorY + 20} fill={wall} />
    <rect x={-20} y={floorY} width={W + 40} height={H - floorY + 20} fill={floor} />
    <line x1={-20} y1={floorY} x2={W + 20} y2={floorY} stroke={KRP.ink} strokeWidth={7} />
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
      {Array.from({ length: planks }, (_, i) => {
        const t = i / planks;
        return <line key={i} x1={lerp(300, -500, t)} y1={H + 20}
          x2={lerp(820, 1060, t)} y2={floorY} />;
      })}
    </g>
  </g>
);

// 夜の街の灯り (足元に光る粒)
const NightLights: React.FC<{
  f: number; y0: number; y1: number; n?: number; seed?: number;
}> = ({ f, y0, y1, n = 150, seed = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const k = i + seed * 100;
      const d = rnd(k);               // 0=手前(下) 1=奥(上)
      const y = lerp(y1, y0, d * d);
      const x = rnd(k + 0.5) * (W + 200) - 100;
      const r = lerp(5.5, 1.6, d);
      const tw = 0.55 + 0.45 * Math.sin(f / (7 + rnd(k + 2) * 20) + k);
      return <circle key={i} cx={x} cy={y} r={r}
        fill={rnd(k + 3) < 0.22 ? "#F6E7A8" : "#FFF4CE"} opacity={0.35 + tw * 0.6} />;
    })}
  </g>
);

// 雲 (ちぎれ雲。横に流れる)
const Cloud: React.FC<{ x: number; y: number; s?: number; op?: number }> =
  ({ x, y, s = 1, op = 0.9 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d="M -120 20 q 10 -42 56 -36 q 14 -40 68 -32 q 36 -24 62 10 q 46 -8 48 30
               q 26 6 20 28 l -254 0 z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );

// 遠くの低い街 (時代でシルエットを変える)
const FarTown: React.FC<{
  y: number; seed?: number; maxH?: number; color?: string; n?: number;
}> = ({ y, seed = 1, maxH = 54, color = KRP.grayDark, n = 26 }) => (
  <g opacity={0.5}>
    {Array.from({ length: n }, (_, i) => {
      const k = i + seed * 50;
      const w = 40 + rnd(k) * 70;
      const h = 14 + rnd(k + 1) * maxH;
      const x = (i / n) * (W + 160) - 80;
      return <rect key={i} x={x} y={y - h} width={w} height={h}
        fill={color} stroke={KRP.ink} strokeWidth={3} />;
    })}
    <rect x={-20} y={y} width={W + 40} height={120} fill={color} />
  </g>
);

// 年号の道標 (時代が変わった合図。毎回ちがう場所に立てる)
const YearPost: React.FC<{
  x: number; y: number; text: string; t?: number; rot?: number; s?: number;
}> = ({ x, y, text, t = 1, rot = -3, s = 1 }) => {
  const tt = pop(clamp01(t));
  if (tt <= 0) return null;
  const w = text.length * 44 + 48;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${tt * s})`}>
      <rect x={-9} y={0} width={18} height={150} fill={KRP.bronze}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={-w / 2} y={-62} width={w} height={74} rx={8}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-8} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={50} fill={KRP.ink}>{text}</text>
    </g>
  );
};

// 水の流れ (蛇口・配管)
const WaterFall: React.FC<{
  x: number; y0: number; y1: number; f: number; w?: number;
}> = ({ x, y0, y1, f, w = 13 }) => (
  <g>
    <rect x={x - w / 2} y={y0} width={w} height={y1 - y0} rx={6}
      fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
    <g stroke={KRP.white} strokeWidth={3} opacity={0.75}>
      {Array.from({ length: 5 }, (_, i) => {
        const yy = y0 + ((f * 9 + i * (y1 - y0) / 5) % (y1 - y0));
        return <line key={i} x1={x - 2} y1={yy} x2={x - 2} y2={yy + 16} />;
      })}
    </g>
  </g>
);

// 流し (#3 と #15 は同じ流し。1900年は金具だけ古い)
const Sink: React.FC<{
  x: number; y: number; s?: number; old?: boolean;
}> = ({ x, y, s = 1, old = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 台 */}
    <rect x={-170} y={0} width={340} height={210} rx={6}
      fill={old ? KRP.bronze : KRP.white} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
    <rect x={-170} y={-16} width={340} height={22} rx={6}
      fill={old ? "#9A7A52" : KRP.silver} stroke={KRP.ink} strokeWidth={6} />
    {/* 水盤 */}
    <ellipse cx={0} cy={6} rx={96} ry={22} fill={old ? "#8E7049" : KRP.silver}
      stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={0} cy={6} rx={72} ry={14} fill={KRP.ink} opacity={0.3} />
    {/* 蛇口 */}
    <path d={`M -4 -150 l 0 -34 l ${old ? 70 : 56} 0 l 0 ${old ? 46 : 38}`}
      fill="none" stroke={old ? KRP.bronze : KRP.silver} strokeWidth={18}
      strokeLinecap="round" />
    <path d={`M -4 -150 l 0 -34 l ${old ? 70 : 56} 0 l 0 ${old ? 46 : 38}`}
      fill="none" stroke={KRP.ink} strokeWidth={5} />
    <rect x={-22} y={-152} width={36} height={154} rx={8}
      fill={old ? KRP.bronze : KRP.silver} stroke={KRP.ink} strokeWidth={5} />
    {/* ハンドル */}
    {old ? (
      <g>
        <circle cx={-4} cy={-172} r={30} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <line x1={-34} y1={-172} x2={26} y2={-172} stroke={KRP.ink} strokeWidth={7} />
        <line x1={-4} y1={-202} x2={-4} y2={-142} stroke={KRP.ink} strokeWidth={7} />
      </g>
    ) : (
      <g>
        <rect x={-14} y={-196} width={78} height={16} rx={8}
          fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
      </g>
    )}
  </g>
);

// 段ボール箱
const Carton: React.FC<{
  x: number; y: number; w?: number; h?: number; rot?: number; label?: string;
}> = ({ x, y, w = 96, h = 76, rot = 0, label }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={4}
      fill="#D9B98A" stroke={KRP.ink} strokeWidth={5} />
    <line x1={-w / 2} y1={-h + 16} x2={w / 2} y2={-h + 16} stroke={KRP.ink} strokeWidth={4} />
    <line x1={0} y1={-h} x2={0} y2={-h + 16} stroke={KRP.ink} strokeWidth={4} />
    {label && (
      <text fontFamily={FONT} x={0} y={-h / 2 + 14} textAnchor="middle" fontWeight={900}
        fontSize={28} fill={KRP.ink}>{label}</text>
    )}
  </g>
);

// 2リットル6本のケース
const WaterCase: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-104} y={-108} width={208} height={116} rx={6}
        fill="#E7DCC6" stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={i}>
          <rect x={-92 + i * 64} y={-162} width={52} height={60} rx={8}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-76 + i * 64} y={-178} width={22} height={20} rx={4}
            fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <text fontFamily={FONT} x={0} y={-38} textAnchor="middle" fontWeight={900} fontSize={34}
        fill={KRP.ink}>2L×6</text>
    </g>
  );

// 汗 (しんどさ)
const Sweat: React.FC<{ x: number; y: number; f: number; n?: number }> =
  ({ x, y, f, n = 3 }) => (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const p = ((f + i * 13) % 34) / 34;
        return <ellipse key={i} cx={x + i * 22 - 20} cy={y + p * 46} rx={7} ry={11}
          fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={(1 - p) * 0.95} />;
      })}
    </g>
  );

// 帽子 (y は Person の足元y・s は Person の scale に合わせる)
const Hat: React.FC<{
  x: number; y: number; s?: number; kind?: "cap" | "derby";
  color?: string; dark?: string;
}> = ({ x, y, s = 1, kind = "derby", color = "#2F2A24", dark = "#15120F" }) => (
  <g transform={`translate(${x} ${y - 268 * s}) scale(${s})`}>
    {kind === "derby" ? (
      <g>
        <ellipse cx={0} cy={0} rx={82} ry={16} fill={color} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -46 2 L -48 -54 q 48 -26 96 0 L 46 2 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-47} y={-18} width={94} height={14} fill={dark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ) : (
      <g>
        <path d="M -52 2 L -56 -56 q 56 -28 112 0 L 52 2 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-58} y={-6} width={116} height={20} rx={8} fill={dark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -62 10 q -22 4 -26 16 q 44 8 80 0 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-26} y={-40} width={52} height={18} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
    )}
  </g>
);

// 風の線
const WindLines: React.FC<{
  f: number; y0: number; y1: number; n?: number; speed?: number; len?: number;
}> = ({ f, y0, y1, n = 12, speed = 26, len = 220 }) => (
  <g stroke={KRP.blueDeep} strokeWidth={5} strokeLinecap="round" opacity={0.6} fill="none">
    {Array.from({ length: n }, (_, i) => {
      const k = i + 1;
      const y = lerp(y0, y1, rnd(k));
      const x = ((f * speed + rnd(k + 9) * 2400) % (W + 700)) - 400;
      return <path key={i} d={`M ${x} ${y} q ${len * 0.5} ${-14} ${len} 0`} />;
    })}
  </g>
);

// =====================================================================
// 文#1 あなたは、タワーマンションの30階に住んでいます。
// 室内の引き。手前=ソファと鉢植え、中景=窓際に立つ住人、窓の外=空と遥か下の街。
// カメラはゆっくり窓へ寄る。
// =====================================================================
const S01: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.06;
  const cl = f * 0.28;
  return (
    <g transform={zoomAt(z, 1080, 520)}>
      <RoomBox floorY={830} />
      <WinWall x={520} y={150} w={1340} h={700} mull={3}>
        {/* 上40%が空、その下は「見下ろした地面」。雲が目線より下にあるのが高さの印。 */}
        <rect x={500} y={130} width={1400} height={740} fill="#BBD6EE" />
        <rect x={500} y={130} width={1400} height={240} fill="#A6C9E8" />
        <rect x={500} y={470} width={1400} height={400} fill="#C9D4DC" />
        <rect x={500} y={470} width={1400} height={44} fill="#D6DEE4" opacity={0.9} />
        {/* 眼下の街: 奥ほど小さく、手前(窓の下端)ほど大きい */}
        {Array.from({ length: 130 }, (_, i) => {
          const d = rnd(i + 5);
          const y = lerp(866, 486, d * d);
          const sc = lerp(1, 0.14, d);
          const bw = (24 + rnd(i + 6) * 46) * sc;
          const bh = (40 + rnd(i + 7) * 120) * sc;
          const x = rnd(i + 8) * 1460 + 470;
          return (
            <g key={i} opacity={lerp(1, 0.4, d)}>
              <rect x={x} y={y - bh} width={bw} height={bh}
                fill={d > 0.5 ? "#9FADBA" : "#8E9DAB"} stroke={KRP.ink}
                strokeWidth={Math.max(1.2, 4 * sc)} />
              <rect x={x} y={y - bh} width={bw} height={Math.max(3, 7 * sc)} fill="#7C8B99" />
            </g>
          );
        })}
        {/* 川 */}
        <path d="M 500 700 q 300 -60 620 -40 q 340 12 780 -90 l 0 60
                 q -430 104 -780 90 q -330 -14 -620 46 z"
          fill="#8FB8D8" stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
        {/* 目線より下を流れる雲 = 高さ */}
        <Cloud x={700 + (cl % 1500)} y={690} s={0.72} />
        <Cloud x={1680 - ((cl * 0.7) % 1400)} y={580} s={0.5} op={0.8} />
        <Cloud x={1420 - ((cl * 0.4) % 1200)} y={270} s={0.95} />
        <g stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.7}>
          <path d={`M ${1500 - (cl % 1000)} ${640 + Math.sin(f / 18) * 8} q 13 -11 26 0 q 13 -11 26 0`} />
        </g>
      </WinWall>
      {/* 壁の階数表示 */}
      <g>
        <rect x={150} y={214} width={186} height={100} rx={10}
          fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
        <text fontFamily={FONT} x={243} y={290} textAnchor="middle" fontWeight={900}
          fontSize={64} fill={KRP.yellow}>30F</text>
        <line x1={150} y1={330} x2={336} y2={330} stroke={KRP.grayDark} strokeWidth={5} />
      </g>
      {/* 近景: ソファ (画面外まではみ出させて奥行きを作る) */}
      <g>
        <rect x={-120} y={700} width={620} height={200} rx={26}
          fill="#AEBBC4" stroke={KRP.ink} strokeWidth={8} />
        <rect x={-120} y={556} width={620} height={168} rx={26}
          fill="#C3CED6" stroke={KRP.ink} strokeWidth={8} />
        <rect x={-30} y={596} width={150} height={120} rx={16}
          fill={KRP.orange} stroke={KRP.ink} strokeWidth={7} opacity={0.9} />
        <rect x={160} y={606} width={130} height={110} rx={16}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={7} opacity={0.9} />
        <rect x={-120} y={880} width={620} height={26} rx={10}
          fill="#8F9CA6" stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 近景: ラグ */}
      <ellipse cx={760} cy={1010} rx={540} ry={120} fill="#D9C7A4"
        stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={760} cy={1010} rx={430} ry={86} fill="none"
        stroke={KRP.bronze} strokeWidth={6} opacity={0.6} />
      {/* 近景: 低いテーブル・マグ・本 */}
      <g>
        <rect x={470} y={856} width={420} height={22} rx={9}
          fill="#C89B62" stroke={KRP.ink} strokeWidth={7} />
        <rect x={508} y={878} width={20} height={96} fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={834} y={878} width={20} height={96} fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={560} y={800} width={76} height={58} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 636 814 q 32 15 0 32" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <g fill="none" stroke={KRP.grayDark} strokeWidth={5} opacity={0.5}>
          <path d={`M 586 794 q ${Math.sin(f / 12) * 14} -24 2 -46`} />
        </g>
        <rect x={700} y={836} width={132} height={22} rx={4}
          fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 鉢植え (右端で切る) */}
      <g>
        <path d="M 1700 1010 l 30 -180 l 150 0 l 30 180 z"
          fill={KRP.bronze} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i}
            d={`M 1805 830 q ${-110 + i * 44} ${-70 - i * 16} ${-74 + i * 36} ${-200 - i * 12}`}
            fill="none" stroke={KRP.green} strokeWidth={17} strokeLinecap="round" />
        ))}
      </g>
      <ellipse cx={1180} cy={858} rx={96} ry={22} fill={KRP.ink} opacity={0.16} />
      <Person x={1180} y={848} s={1.5} cloth={KRP.blueDeep} clothDark="#2F5590"
        face="smile" gaze={[0.45, 0.25]} f={f} />
    </g>
  );
};

// =====================================================================
// 文#2 窓の外は、空です。夜は、街の灯りが足元に光ります。
// 夜。窓まで寄って、窓が画面をほぼ占める。灯りは人の足元より下にある。
// =====================================================================
const S02: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + easeOut(clamp01(f / 80)) * 0.06;
  return (
    <g transform={zoomAt(z, 900, 620)}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#2A3242" />
      <RoomBox floorY={940} wall="#394253" floor="#473F33" planks={7} />
      <WinWall x={90} y={120} w={1740} h={800} mull={4}>
        <rect x={70} y={100} width={1800} height={620} fill="#1C2533" />
        <rect x={70} y={100} width={1800} height={180} fill="#151D29" />
        <rect x={70} y={700} width={1800} height={260} fill="#0F1620" />
        <rect x={70} y={690} width={1800} height={26} fill="#2E3A4A" opacity={0.9} />
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={120 + rnd(i + 70) * 1700} cy={150 + rnd(i + 80) * 420}
            r={1.6 + rnd(i + 90) * 2.2} fill={KRP.white}
            opacity={0.35 + 0.5 * Math.sin(f / 13 + i)} />
        ))}
        <circle cx={1580} cy={260} r={52} fill="#F3EAC6" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1562} cy={246} r={11} fill="#DCCFA3" />
        <circle cx={1596} cy={286} r={7} fill="#DCCFA3" />
        {/* 飛行機 (目線より下を横切る) */}
        <g>
          <circle cx={240 + ((f * 6) % 1600)} cy={632} r={8}
            fill={KRP.red} opacity={(f % 40) < 20 ? 0.95 : 0.12} />
          <ellipse cx={240 + ((f * 6) % 1600)} cy={632} rx={22} ry={4}
            fill={KRP.gray} opacity={0.3} />
        </g>
        {/* 眼下の街: ビルの塊 + 灯りの粒 + 道の光の筋 */}
        <g opacity={0.95}>
          {Array.from({ length: 16 }, (_, i) => {
            const d = rnd(i + 30);
            const h = lerp(190, 54, d);
            const y = lerp(940, 712, d);
            return <rect key={i} x={90 + i * 112 + rnd(i + 31) * 40} y={y - h}
              width={56 + rnd(i + 32) * 40} height={h} fill="#1E2735"
              stroke="#0C1118" strokeWidth={4} />;
          })}
        </g>
        <NightLights f={f} y0={706} y1={918} n={260} seed={2} />
        <g stroke="#F6E7A8" strokeWidth={7} opacity={0.5} strokeLinecap="round" fill="none">
          <path d="M 120 900 q 420 -70 760 -60 q 380 12 940 -120" />
          <path d="M 500 920 q 60 -200 120 -330" />
        </g>
      </WinWall>
      {/* 窓にうっすら映る室内 */}
      <g opacity={0.12}>
        <rect x={700} y={430} width={420} height={470} fill={KRP.white} />
      </g>
      {/* 近景: 窓台のグラスとボトル (大きく) */}
      <g>
        <path d="M 250 930 l 20 -120 l 118 0 l 20 120 z" fill="#DCE9F2"
          stroke={KRP.ink} strokeWidth={7} opacity={0.95} />
        <path d="M 266 846 l 86 0 l 14 84 l -114 0 z" fill="#B8543E" opacity={0.75} />
        <g>
          <rect x={440} y={700} width={86} height={230} rx={10} fill="#3E5E46"
            stroke={KRP.ink} strokeWidth={7} />
          <rect x={466} y={620} width={34} height={90} fill="#3E5E46"
            stroke={KRP.ink} strokeWidth={7} />
          <rect x={444} y={776} width={78} height={70} fill={KRP.white} opacity={0.8} />
        </g>
      </g>
      {/* 近景: 床のスリッパとクッション */}
      <g fill="#C8B49A" stroke={KRP.ink} strokeWidth={6}>
        <ellipse cx={1340} cy={1010} rx={88} ry={32} />
        <ellipse cx={1520} cy={1046} rx={88} ry={32} />
      </g>
      <rect x={1640} y={930} width={300} height={170} rx={28}
        fill="#6A5A48" stroke={KRP.ink} strokeWidth={8} />
      {/* 住人: 窓ぎわに立って見下ろす */}
      <ellipse cx={880} cy={950} rx={100} ry={24} fill="#0E131B" opacity={0.5} />
      <Person x={880} y={942} s={1.6} cloth="#6A7585" clothDark="#49525F"
        face="normal" gaze={[0.1, 0.55]} f={f} />
      {/* 足元を指す (札は出さない。街の灯りが下にあることは絵で分かるので、
          言葉を重ねると説明くさくなる) */}
      <Arrow x={700} y={1000} s={0.8} rot={128} t={seg(f, 14, 32)} color={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#3 蛇口をひねれば水が出て、荷物は玄関まで届きます。
// 部屋の中を横に通す引き。左=流し(水が出ている) / 中=廊下 / 右=玄関で宅配を受け取る。
// =====================================================================
const S03: React.FC<{ f: number }> = ({ f }) => {
  const door = easeOut(seg(f, 4, 30));
  const hand = easeOut(seg(f, 30, 60));
  return (
    <g>
      <rect x={-20} y={-20} width={W + 40} height={740} fill="#F3EEE3" />
      <rect x={-20} y={700} width={W + 40} height={400} fill={KRP.floor} />
      <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.26}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={lerp(1500, 200, i / 8)} y1={1100}
            x2={lerp(1180, 980, i / 8)} y2={700} />
        ))}
      </g>
      {/* 天井のダウンライト */}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <circle cx={520 + i * 320} cy={70} r={22} fill={KRP.yellow}
            stroke={KRP.ink} strokeWidth={5} />
          <polygon points={`${498 + i * 320},78 ${542 + i * 320},78 ${610 + i * 320},330 ${430 + i * 320},330`}
            fill={KRP.yellow} opacity={0.14} />
        </g>
      ))}
      {/* 奥: 冷蔵庫 */}
      <g>
        <rect x={70} y={300} width={250} height={400} fill="#E4E8EA"
          stroke={KRP.ink} strokeWidth={7} />
        <line x1={70} y1={440} x2={320} y2={440} stroke={KRP.ink} strokeWidth={6} />
        <rect x={286} y={360} width={16} height={60} rx={6} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={4} />
        <rect x={286} y={470} width={16} height={90} rx={6} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={4} />
        <rect x={120} y={316} width={80} height={60} rx={4} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      </g>
      {/* 吊り戸棚 */}
      <g>
        <rect x={360} y={150} width={560} height={190} fill="#E8E0D0"
          stroke={KRP.ink} strokeWidth={7} />
        <line x1={640} y1={150} x2={640} y2={340} stroke={KRP.ink} strokeWidth={6} />
        <rect x={596} y={300} width={88} height={14} rx={6} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 壁のカレンダー */}
      <g>
        <rect x={980} y={190} width={130} height={160} rx={6} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={980} y={190} width={130} height={36} fill={KRP.red} />
        <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1={996} y1={252 + i * 24} x2={1094} y2={252 + i * 24} />
          ))}
        </g>
      </g>
      {/* ===== 近景: キッチンカウンター ===== */}
      <g>
        <rect x={-80} y={690} width={980} height={48} rx={8} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={-80} y={738} width={980} height={360} fill="#EDE6D8"
          stroke={KRP.ink} strokeWidth={8} />
        <line x1={300} y1={738} x2={300} y2={1098} stroke={KRP.ink} strokeWidth={6} />
        <line x1={600} y1={738} x2={600} y2={1098} stroke={KRP.ink} strokeWidth={6} />
        <rect x={120} y={790} width={120} height={16} rx={8} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={420} y={790} width={120} height={16} rx={8} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={560} cy={712} rx={190} ry={44} fill="#B8BFC4"
          stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={560} cy={716} rx={150} ry={30} fill="#9AA2A8" />
        <g>
          <path d="M 520 700 L 520 560 q 0 -58 70 -58 l 60 0 l 0 72"
            fill="none" stroke={KRP.silver} strokeWidth={40} strokeLinecap="round" />
          <path d="M 520 700 L 520 560 q 0 -58 70 -58 l 60 0 l 0 72"
            fill="none" stroke={KRP.ink} strokeWidth={7} />
          <rect x={448} y={512} width={116} height={26} rx={13} fill={KRP.silver}
            stroke={KRP.ink} strokeWidth={6}
            transform={`rotate(${-22 * hand} 552 525)`} />
          <circle cx={552} cy={525} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <WaterFall x={650} y0={574} y1={706} f={f} w={26} />
        {Array.from({ length: 6 }, (_, i) => {
          const p = ((f + i * 9) % 26) / 26;
          return <circle key={i} cx={650 + Math.cos(i * 2.1) * (30 + p * 60)}
            cy={706 - p * 44 + p * p * 40} r={6 - p * 3}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} opacity={1 - p} />;
        })}
        <g>
          <path d="M 790 712 l 10 -92 l 86 0 l 10 92 z" fill="#E8F2F8"
            stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
          <rect x={798} y={664} width={88} height={46} fill={KRP.blueSoft} opacity={0.85} />
        </g>
        <g>
          <rect x={60} y={600} width={90} height={96} rx={8} fill="#B98B58"
            stroke={KRP.ink} strokeWidth={6} />
          <line x1={84} y1={600} x2={70} y2={520} stroke={KRP.silver} strokeWidth={12} />
          <line x1={84} y1={600} x2={70} y2={520} stroke={KRP.ink} strokeWidth={4} />
          <line x1={126} y1={600} x2={140} y2={536} stroke={KRP.silver} strokeWidth={10} />
          <line x1={126} y1={600} x2={140} y2={536} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={270} cy={668} rx={84} ry={26} fill="#C2C8CC"
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={186} y={600} width={168} height={70} fill="#C2C8CC"
            stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* ===== 中景右: 玄関 ===== */}
      <g>
        <rect x={1240} y={300} width={430} height={400} fill="#D6CEBE"
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={1240} y={300} width={430} height={400} fill="#7E8992" />
        <polygon points={`1670,300 ${1670 + door * 150},${300 - door * 34} ${1670 + door * 150},${700 + door * 24} 1670,700`}
          fill="#C6BBA6" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1670 + door * 30} cy={520} r={14} fill={KRP.brass}
          stroke={KRP.ink} strokeWidth={5} />
        <g opacity={door}>
          {/* 配達員。ただの私服に見えていたので、制服・制帽・胸の名札・伝票を足して
              「配達の人」とひと目で分かる格好にした */}
          <Person x={1520} y={698} s={0.86} cloth="#33507A" clothDark="#22395A"
            hair="cap" face="smile" gaze={[-0.7, 0]} f={f} phase={2} />
          {/* 制帽 (つば + 金の徽章) */}
          <Hat x={1520} y={698} s={0.86} kind="cap" color="#33507A" dark="#1F3454" />
          {/* 襟 */}
          <g stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round">
            <line x1={1494} y1={560} x2={1520} y2={589} />
            <line x1={1546} y1={560} x2={1520} y2={589} />
          </g>
          {/* 胸の名札 */}
          <rect x={1480} y={578} width={27} height={19} rx={3} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={3} />
          {/* 伝票ばさみ */}
          <g transform="rotate(8 1589 643)">
            <rect x={1560} y={606} width={58} height={74} rx={5} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={5} />
            <rect x={1572} y={598} width={34} height={14} rx={4} fill={KRP.silver}
              stroke={KRP.ink} strokeWidth={4} />
            <g stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.6}>
              <line x1={1572} y1={632} x2={1606} y2={632} />
              <line x1={1572} y1={648} x2={1606} y2={648} />
              <line x1={1572} y1={664} x2={1594} y2={664} />
            </g>
          </g>
          <Carton x={1396} y={610 + Math.sin(f / 9) * 4} w={118} h={92} rot={-5} label="水" />
        </g>
        <rect x={1180} y={700} width={560} height={26} fill="#A98A5E"
          stroke={KRP.ink} strokeWidth={6} />
        <g fill="#5F5244" stroke={KRP.ink} strokeWidth={5}>
          <ellipse cx={1720} cy={760} rx={54} ry={20} />
          <ellipse cx={1820} cy={790} rx={54} ry={20} />
        </g>
        <g>
          <rect x={1844} y={580} width={66} height={180} rx={8} fill="#9FA8AF"
            stroke={KRP.ink} strokeWidth={6} />
          <line x1={1866} y1={580} x2={1856} y2={420} stroke={KRP.ink} strokeWidth={9} />
          <path d="M 1826 430 q 30 -40 62 0" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      <ellipse cx={1178} cy={750} rx={74} ry={18} fill={KRP.ink} opacity={0.14} />
      <Person x={1178} y={742} s={1.08} cloth={KRP.orange} clothDark="#C06F22"
        face="smile" gaze={[0.6, -0.1]} f={f} />
      <TagPlate x={1430} y={786} text="玄関まで来る" size={30} t={seg(f, 18, 36)} rot={3} />
      <TagPlate x={286} y={476} text="ひねれば出る" size={30} t={seg(f, 24, 42)} rot={-3} />
    </g>
  );
};

// =====================================================================
// 文#4 最高ですね。
// 寄り。住人の笑顔とキラキラ。手前にコーヒー、奥は窓の空だけ。
// =====================================================================
const S04: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.12 + easeOut(clamp01(f / 60)) * 0.08;
  return (
    <g transform={zoomAt(z, 1010, 700)}>
      <RoomBox floorY={840} />
      <WinWall x={520} y={120} w={1360} h={720} mull={2}>
        <rect x={500} y={100} width={1400} height={760} fill="#CBE2F4" />
        <rect x={500} y={100} width={1400} height={280} fill="#AFD0EC" />
        <rect x={500} y={520} width={1400} height={340} fill="#C7D3DC" />
        <Cloud x={760 + ((f * 0.24) % 1300)} y={300} s={1.05} />
        <Cloud x={1700 - ((f * 0.18) % 1200)} y={640} s={0.62} op={0.85} />
        {Array.from({ length: 40 }, (_, i) => {
          const d = rnd(i + 200);
          const y = lerp(856, 540, d * d);
          const sc = lerp(1, 0.2, d);
          return <rect key={i} x={rnd(i + 201) * 1400 + 500} y={y - 90 * sc}
            width={44 * sc} height={90 * sc} fill="#A3B0BC"
            stroke={KRP.ink} strokeWidth={Math.max(1.4, 4 * sc)} opacity={lerp(1, 0.45, d)} />;
        })}
      </WinWall>
      {/* キラキラ */}
      {Array.from({ length: 11 }, (_, i) => {
        const ph = clamp01((f / 26 + rnd(i + 40)) % 1);
        const sc = pop(ph < 0.5 ? ph * 2 : (1 - ph) * 2) * (0.6 + rnd(i + 41) * 0.9);
        const x = 560 + rnd(i + 42) * 1260;
        const y = 200 + rnd(i + 43) * 520;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}>
            <path d="M 0 -40 L 11 -11 L 40 0 L 11 11 L 0 40 L -11 11 L -40 0 L -11 -11 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          </g>
        );
      })}
      {/* 近景: ローテーブル・コーヒー・本・足元の猫 */}
      <g>
        <rect x={-60} y={820} width={740} height={26} rx={10}
          fill="#C89B62" stroke={KRP.ink} strokeWidth={8} />
        <rect x={40} y={846} width={24} height={120} fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={580} y={846} width={24} height={120} fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={280} y={720} width={122} height={102} rx={10}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 402 744 q 54 30 0 58" fill="none" stroke={KRP.ink} strokeWidth={8} />
        <g fill="none" stroke={KRP.grayDark} strokeWidth={7} opacity={0.6}>
          {Array.from({ length: 3 }, (_, i) => (
            <path key={i} d={`M ${310 + i * 32} 712 q ${Math.sin(f / 11 + i) * 20} -34 1 -66`} />
          ))}
        </g>
        <rect x={436} y={790} width={170} height={28} rx={5}
          fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 近景右: 鉢植え (切る) */}
      <g>
        <path d="M 1706 1030 l 34 -176 l 160 0 l 34 176 z"
          fill={KRP.bronze} stroke={KRP.ink} strokeWidth={9} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i}
            d={`M 1820 854 q ${-100 + i * 48} ${-74 - i * 16} ${-66 + i * 38} ${-206 - i * 12}`}
            fill="none" stroke={KRP.green} strokeWidth={18} strokeLinecap="round" />
        ))}
      </g>
      <ellipse cx={1070} cy={848} rx={112} ry={26} fill={KRP.ink} opacity={0.16} />
      <Person x={1070} y={838} s={1.75} cloth={KRP.orange} clothDark="#C06F22"
        face="smile" gaze={[0, -0.25]} f={f} />
      <TagPlate x={1520} y={300} text="最高" size={78} t={seg(f, 10, 28)}
        rot={8} fill={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#5 では、部屋はそのままで、時間だけ巻き戻します。
// 部屋に大きな掛け時計。針が逆に回る。窓の外の景色だけが横に流れて戻っていく。
// =====================================================================
const S05: React.FC<{ f: number }> = ({ f }) => {
  const a = -f * 7.5;
  const st = f * 30;
  return (
    <g>
      <RoomBox floorY={880} wall="#EFE9DD" />
      <WinWall x={940} y={170} w={940} h={700} mull={2}>
        <rect x={920} y={150} width={980} height={740} fill="#C6DCEF" />
        {/* 昼と夜の帯が逆向きに流れる = 日が巻き戻っている */}
        {Array.from({ length: 5 }, (_, i) => {
          const x = 1900 - ((st * 0.5 + i * 420) % 2100);
          return <rect key={i} x={x} y={150} width={210} height={740}
            fill="#2E3A4E" opacity={0.3} />;
        })}
        {/* 逆走する太陽 */}
        <circle cx={1000 + ((st * 0.5) % 900)} cy={300} r={46}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
        {/* 残像つきの街 (奥) */}
        {Array.from({ length: 24 }, (_, i) => {
          const x = 1900 - ((st + i * 96) % 1180);
          const h = 120 + rnd(i + 20) * 260;
          return <rect key={i} x={x} y={866 - h} width={40} height={h}
            fill="#8FA0B0" stroke={KRP.ink} strokeWidth={3}
            opacity={0.18 + 0.35 * ((i % 4) / 4)} />;
        })}
        {/* 速度線 */}
        <g stroke={KRP.white} strokeWidth={9} opacity={0.8} strokeLinecap="round">
          {Array.from({ length: 16 }, (_, i) => {
            const y = 200 + i * 44;
            const x = 1880 - ((st * 1.8 + i * 260) % 1180);
            return <line key={i} x1={x} y1={y} x2={x + 260} y2={y} />;
          })}
        </g>
        {/* 逆向きの矢 */}
        <g fill={KRP.red} stroke={KRP.ink} strokeWidth={5} opacity={0.9}>
          <polygon points="1010,520 1090,470 1090,570" />
          <polygon points="1110,520 1190,470 1190,570" />
        </g>
      </WinWall>
      {/* 掛け時計 (逆回転) */}
      <g transform="translate(470 450)">
        <circle cx={0} cy={0} r={236} fill={KRP.white} stroke={KRP.ink} strokeWidth={12} />
        <circle cx={0} cy={0} r={206} fill="none" stroke={KRP.grayDark} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-206} x2={0} y2={-176}
            transform={`rotate(${i * 30})`} stroke={KRP.ink} strokeWidth={8} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-132} transform={`rotate(${a})`}
          stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={-186} transform={`rotate(${a * 11})`}
          stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
        <circle cx={0} cy={0} r={17} fill={KRP.ink} />
        <g fill="none" stroke={KRP.red} strokeWidth={13} strokeLinecap="round" opacity={0.9}>
          <path d="M 176 -176 a 249 249 0 0 0 -352 0" />
        </g>
        <polygon points="-176,-176 -154,-228 -216,-212" fill={KRP.red}
          stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 近景: 壁のカレンダーが逆にめくれて飛ぶ */}
      <g>
        <rect x={100} y={760} width={240} height={190} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <rect x={100} y={760} width={240} height={48} fill={KRP.red} />
        <text fontFamily={FONT} x={220} y={900} textAnchor="middle" fontWeight={900}
          fontSize={76} fill={KRP.ink}>1</text>
        {Array.from({ length: 4 }, (_, i) => {
          const ph = clamp01((f / 22 + i * 0.25) % 1);
          const px = 100 + ph * 300;
          const py = 760 - ph * 230;
          return <rect key={i} x={px} y={py} width={240} height={190} rx={8}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={7} opacity={1 - ph}
            transform={`rotate(${ph * 48} ${px + 120} ${py + 95})`} />;
        })}
      </g>
      {/* 部屋の物は動かない = 部屋はそのまま */}
      <g>
        <rect x={420} y={820} width={360} height={22} rx={9}
          fill="#C89B62" stroke={KRP.ink} strokeWidth={7} />
        <rect x={470} y={842} width={20} height={70} fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={714} y={842} width={20} height={70} fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={560} y={774} width={70} height={50} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <ellipse cx={880} cy={888} rx={84} ry={20} fill={KRP.ink} opacity={0.15} />
      <Person x={880} y={878} s={1.3} cloth={KRP.orange} clothDark="#C06F22"
        face="surprised" gaze={[0.5, -0.2]} f={f} still />
      <TagPlate x={1400} y={788} text="部屋はそのまま" size={34} t={seg(f, 14, 32)} rot={-3} />
    </g>
  );
};

// =====================================================================
// 文#6 引っ越しはしません。部屋ごと、過去へ行きます。
// 部屋をブロックごと切り出して、年号の輪が連なる筒を奥へ進む。
// 近景の引っ越しトラックには×。
// =====================================================================
const S06: React.FC<{ f: number }> = ({ f }) => {
  const adv = (f * 0.014) % 1;
  const TX = 1330, TY = 520;
  return (
    <g>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E7E2F0" />
      <rect x={-20} y={-20} width={W + 40} height={560} fill="#DCD6EC" />
      {/* 時間のトンネル: 四角い枠が奥へ連なる */}
      <g>
        {/* 枠の角をつなぐ線 (奥行き) */}
        <g stroke={KRP.blueDeep} strokeWidth={5} opacity={0.3}>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
            <line key={i} x1={TX + sx * 560} y1={TY + sy * 430} x2={TX} y2={TY} />
          ))}
        </g>
        {Array.from({ length: 7 }, (_, i) => {
          const t = (i + adv) / 7;
          const k = Math.pow(t, 2.1);
          const w = 1120 * k, h = 860 * k;
          const op = clamp01(t * 7) * clamp01((1.05 - t) * 2.4);
          const yr = 2020 - (7 - i) * 10;
          return (
            <g key={i} opacity={op}>
              <rect x={TX - w / 2} y={TY - h / 2} width={w} height={h} rx={16}
                fill="none" stroke={KRP.blueDeep} strokeWidth={6 + 14 * k} opacity={0.5} />
              {k > 0.3 && (
                <g>
                  <rect x={TX - 110 * k * 1.2} y={TY - h / 2 - 46 * k} width={220 * k * 1.2}
                    height={74 * k} rx={8} fill={KRP.white}
                    stroke={KRP.ink} strokeWidth={5} />
                  <text fontFamily={FONT} x={TX} y={TY - h / 2 + 10 * k} textAnchor="middle"
                    fontWeight={900} fontSize={56 * k} fill={KRP.blueDeep}>{yr}</text>
                </g>
              )}
            </g>
          );
        })}
      </g>
      {/* 部屋のキューブ (丸ごと切り出されて進む) */}
      <g transform={`translate(${560 + Math.sin(f / 23) * 14} ${540 + Math.sin(f / 16) * 10})`}>
        {/* 奥行き面 */}
        <polygon points="300,-250 420,-310 420,170 300,230" fill="#C9BCA2"
          stroke={KRP.ink} strokeWidth={8} />
        <polygon points="-300,-250 -180,-310 420,-310 300,-250" fill="#EBE3D2"
          stroke={KRP.ink} strokeWidth={8} />
        {/* 正面 */}
        <rect x={-300} y={-250} width={600} height={480} fill={KRP.cream}
          stroke={KRP.ink} strokeWidth={10} />
        <rect x={-300} y={150} width={600} height={80} fill={KRP.floor}
          stroke={KRP.ink} strokeWidth={8} />
        {/* 中の窓 */}
        <rect x={10} y={-170} width={260} height={290} fill="#BFD9EE"
          stroke={KRP.ink} strokeWidth={8} />
        <line x1={140} y1={-170} x2={140} y2={120} stroke={KRP.ink} strokeWidth={6} />
        {/* 中のソファとテーブル */}
        <rect x={-260} y={40} width={200} height={110} rx={16} fill="#AEBBC4"
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={-50} y={110} width={40} height={40} fill="#C89B62"
          stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(-130 150) scale(0.56)">
          <Person x={0} y={0} s={1} cloth={KRP.orange} clothDark="#C06F22"
            face="surprised" gaze={[0.5, 0]} f={f} />
        </g>
        {/* ちぎれた配管とコード */}
        <g fill="none" stroke={KRP.grayDark} strokeWidth={11} strokeLinecap="round">
          <path d={`M -300 212 q -70 ${34 + Math.sin(f / 9) * 12} -130 12`} />
          <path d={`M -300 150 q -56 ${-26 + Math.sin(f / 11) * 12} -108 -8`} />
          <path d={`M 300 196 q 64 ${-20 + Math.sin(f / 13) * 12} 110 16`} />
        </g>
        {/* 進む風 */}
        <g stroke={KRP.blueDeep} strokeWidth={7} opacity={0.4} strokeLinecap="round">
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={-440 - ((f * 4 + i * 40) % 120)} y1={-180 + i * 110}
              x2={-320 - ((f * 4 + i * 40) % 120)} y2={-180 + i * 110} />
          ))}
        </g>
      </g>
      {/* 近景: 引っ越しトラックに× */}
      <g transform="translate(330 980) scale(1.25)">
        <rect x={-200} y={-160} width={260} height={140} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 60 -160 l 100 0 l 36 64 l 0 76 l -136 0 z" fill="#D6E2EA"
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={76} y={-144} width={68} height={48} rx={5} fill={KRP.blueSoft}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-130} cy={-10} r={36} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={124} cy={-10} r={36} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
      </g>
      <Carton x={660} y={1060} w={130} h={100} rot={-6} />
      <XMark x={330} y={900} s={1.8} t={seg(f, 8, 24)} />
      <TagPlate x={330} y={700} text="引っ越しではない" size={32} t={seg(f, 14, 32)} rot={-3} />
    </g>
  );
};

// =====================================================================
// 文#7 まず、2000年。
// 着いた先。部屋のキューブが2000年の街の上に降りてくる。道標に「2000年」。
// =====================================================================
const S07: React.FC<{ f: number }> = ({ f }) => {
  const land = easeOut(clamp01(f / 55));
  const dy = (1 - land) * -260;
  return (
    <g>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#D3E4F2" />
      <rect x={-20} y={-20} width={W + 40} height={420} fill="#BCD6EC" />
      <Cloud x={340 + ((f * 0.2) % 1600)} y={250} s={0.9} />
      <Cloud x={1700 - ((f * 0.14) % 1500)} y={360} s={0.7} op={0.8} />
      {/* 2000年の街 (中層のビルと看板。いちばん高いのが10階くらい) */}
      <g>
        {Array.from({ length: 11 }, (_, i) => {
          const h = 150 + rnd(i + 60) * 240;
          const x = 40 + i * 176;
          return (
            <g key={i}>
              <rect x={x} y={880 - h} width={150} height={h} fill="#C3CDD5"
                stroke={KRP.ink} strokeWidth={5} />
              {Array.from({ length: Math.round(h / 44) }, (_, r) =>
                Array.from({ length: 3 }, (_, c) => (
                  <rect key={`${r}-${c}`} x={x + 14 + c * 44} y={894 - h + r * 44}
                    width={30} height={26} fill={rnd(i * 9 + r * 3 + c) < 0.55 ? "#AFC9DC" : "#8E99A3"}
                    stroke={KRP.ink} strokeWidth={2.4} opacity={0.85} />
                )))}
            </g>
          );
        })}
        {/* 屋上の看板 (中央の赤い看板は、部屋より先に目に入ってしまうので外した) */}
        <g>
          <rect x={1240} y={520} width={150} height={56} rx={6}
            fill={KRP.green} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
        </g>
        {/* 地面と道路 */}
        <rect x={-20} y={880} width={W + 40} height={220} fill="#B9AE98"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={-20} y={950} width={W + 40} height={90} fill="#8A8578" />
        <g stroke={KRP.white} strokeWidth={8} opacity={0.8}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={-40 + i * 230} y1={996} x2={60 + i * 230} y2={996} />
          ))}
        </g>
        {/* 車 */}
        <g transform={`translate(${((f * 7) % 2200) - 200} 952)`}>
          <rect x={-70} y={-54} width={150} height={44} rx={16}
            fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-34} y={-78} width={76} height={30} rx={10}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-38} cy={-8} r={18} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={46} cy={-8} r={18} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 降りてくる部屋のキューブ */}
      <g transform={`translate(1220 ${430 + dy})`} opacity={0.98}>
        <polygon points="-230,-130 -170,-166 -170,120 -230,156" fill="#C6B99F"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={-230} y={-130} width={400} height={286} fill={KRP.cream}
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={-230} y={110} width={400} height={46} fill={KRP.floor}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={-30} y={-80} width={180} height={180} fill="#BFD9EE"
          stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(-130 110) scale(0.44)">
          <Person x={0} y={0} s={1} cloth={KRP.orange} clothDark="#C06F22"
            face="normal" gaze={[0.5, 0.2]} f={f} />
        </g>
        {/* 着地の風 */}
        <g opacity={1 - land} stroke={KRP.white} strokeWidth={6} fill="none">
          <path d="M -300 170 q 60 30 -40 44" />
          <path d="M 240 170 q -60 30 40 44" />
        </g>
      </g>
      <YearPost x={330} y={700} text="2000年" t={seg(f, 16, 38)} rot={-4} />
    </g>
  );
};

// =====================================================================
// 文#8 注文した水が、玄関まで来なくなりました。
// 玄関を外の廊下側から。ドアを開けた住人の足元に、何も置かれていない。
// =====================================================================
const S08: React.FC<{ f: number }> = ({ f }) => {
  // 少しだけ引いた画角から。寄りで始めると「空いた玄関」が画面いっぱいに広がりすぎるので、
  // 0.94 から始めてゆっくり 0.98 まで。背景の板は引いても隅が切れないよう大きめに敷く。
  const z = 0.94 + easeOut(clamp01(f / 70)) * 0.04;
  return (
    <g transform={zoomAt(z, 1020, 620)}>
      {/* #3 と同じ玄関。置かれるはずの物が無い。 */}
      <rect x={-200} y={-200} width={W + 400} height={920} fill="#F3EEE3" />
      <rect x={-200} y={700} width={W + 400} height={600} fill={KRP.floor} />
      <line x1={-200} y1={700} x2={W + 200} y2={700} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.26}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={lerp(1700, 300, i / 8)} y1={1300}
            x2={lerp(1200, 880, i / 8)} y2={700} />
        ))}
      </g>
      {/* 左: 台所のへりを切って「同じ部屋」とわかるように */}
      <g>
        <rect x={-120} y={660} width={420} height={48} rx={8} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={-120} y={708} width={420} height={600} fill="#EDE6D8"
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={-60} y={770} width={130} height={16} rx={8} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={70} y={330} width={210} height={330} fill="#E4E8EA"
          stroke={KRP.ink} strokeWidth={7} />
        <line x1={70} y1={450} x2={280} y2={450} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 玄関の開口 (外は共用廊下)。
          人ひとり分 + 少しの幅 (420px) に絞った。620px あると「空いた空間」が広すぎて、
          荷物が無いことより穴の大きさのほうが目立ってしまう。 */}
      <g>
        <rect x={770} y={210} width={420} height={490} fill="#79848D" />
        {/* 外廊下の奥行き */}
        <polygon points="770,210 900,276 900,638 770,700" fill="#69747D" />
        <rect x={912} y={300} width={100} height={52} rx={6} fill={KRP.green}
          stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <rect x={770} y={450} width={420} height={16} fill={KRP.silver}
          stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
        {/* 外の空 */}
        <rect x={1028} y={248} width={150} height={170} fill="#BCD4E8" opacity={0.9} />
        {/* 枠 */}
        <rect x={770} y={210} width={420} height={490} fill="none"
          stroke={KRP.ink} strokeWidth={9} />
      </g>
      {/* 半開きのドア */}
      <polygon points="1190,210 1370,172 1370,730 1190,700" fill="#C6BBA6"
        stroke={KRP.ink} strokeWidth={8} />
      <circle cx={1226} cy={470} r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 部屋番号 */}
      <g>
        <rect x={1424} y={240} width={160} height={78} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={7} />
        <text fontFamily={FONT} x={1504} y={300} textAnchor="middle" fontWeight={900}
          fontSize={48} fill={KRP.ink}>3005</text>
      </g>
      {/* 上がり框・靴・傘立て (#3 と同じ物) */}
      <rect x={720} y={700} width={520} height={28} fill="#A98A5E"
        stroke={KRP.ink} strokeWidth={6} />
      <g fill="#5F5244" stroke={KRP.ink} strokeWidth={6}>
        <ellipse cx={1388} cy={806} rx={62} ry={24} />
        <ellipse cx={1508} cy={846} rx={62} ry={24} />
      </g>
      <g>
        <rect x={1620} y={600} width={74} height={200} rx={8} fill="#9FA8AF"
          stroke={KRP.ink} strokeWidth={7} />
        <line x1={1646} y1={600} x2={1634} y2={420} stroke={KRP.ink} strokeWidth={10} />
        <path d="M 1600 430 q 34 -44 70 0" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 置かれるはずだった箱の跡 (点線) と × */}
      <g>
        <polygon points="890,700 1060,700 1060,632 890,632" fill="none"
          stroke={KRP.red} strokeWidth={7} strokeDasharray="22 16" opacity={0.8} />
        <polygon points="890,632 934,600 1104,600 1060,632" fill="none"
          stroke={KRP.red} strokeWidth={7} strokeDasharray="22 16" opacity={0.8} />
        <polygon points="1060,632 1104,600 1104,668 1060,700" fill="none"
          stroke={KRP.red} strokeWidth={7} strokeDasharray="22 16" opacity={0.8} />
      </g>
      <XMark x={988} y={650} s={1.4} t={seg(f, 12, 30)} />
      {/* 床に落ちたチラシ */}
      <g transform="translate(800 826) rotate(-9)">
        <rect x={-90} y={-60} width={180} height={120} rx={5}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.grayDark} strokeWidth={5} opacity={0.6}>
          <line x1={-62} y1={-24} x2={62} y2={-24} />
          <line x1={-62} y1={4} x2={62} y2={4} />
          <line x1={-62} y1={32} x2={16} y2={32} />
        </g>
      </g>
      <ellipse cx={600} cy={752} rx={84} ry={20} fill={KRP.ink} opacity={0.14} />
      <Person x={600} y={742} s={1.3} cloth={KRP.orange} clothDark="#C06F22"
        face="worried" gaze={[0.7, 0.3]} f={f} />
      <Sweat x={696} y={520} f={f} n={2} />
      <TagPlate x={1230} y={786} text="誰も来ない" size={36} t={seg(f, 18, 36)} rot={4} />
    </g>
  );
};

// =====================================================================
// 文#9 ★2026-11-05 追加 ネット通販は生まれたばかりで、まだ浸透していないんです。
// 格: 山 (「なぜ水が玄関まで来ないのか」の答えを出す文)
// 何を描くか (作者の指示 2026-11-05):
//   「パソコンを使う絵 → 配送される絵 → 自宅に届く絵」の3コマで "ネット通販とは何か" を見せ、
//   足元に「それは2000年ごろに生まれた」という簡単な年表を添えるだけでいい。
//   ★パソコンの技術 (モデム・電話線・フロッピー) は描かない。歴史を語る絵にもしない。
//   ★ロゴは描かない・ブランドの色も真似ない (商標)。社名は文字だけ。
// 事件: 3コマの流れはもう出来ているのに、「いま、ここ」の赤い印が、
//       その仕組みが生まれた年とぴったり同じ所に立っている = まだ始まったばかり
// 動き: コマ1 カーソルが上がってボタンを押す・掛け時計の針 / コマ2 トラックが走る・車輪が回る
//       ・白線が流れる・雲が流れる / コマ3 受け取った箱がはずむ・よろこびの線
//       / 矢印が順に出る / 年表が左から伸びる
// 置き場のメモ: 見出し札 y=160 / コマ 206〜600 / コマ名 y=648 / 帯 680〜744 / 札の下端 826。
//   字幕の黒帯 (1行 y≈931・2行 y≈854) には触らない。寄りは 1.015 までに抑える。
//   出し終わりは全部 f=46 までに収める (KosoAll の検品は f=45 固定で見るため)。
//   人は座らせられない (Person に座り姿勢がない) ので、コマ1は椅子の座面で脚を隠す = 家の作法。
//   腕は「肩→肘→手」を二度描き (墨→服)。肘は座面の上端より下に置き、Person が自前で描く
//   まっすぐな腕のぶんを完全に覆う (はみ出すと棒が生える)。
// =====================================================================
const S08BCard: React.FC<{
  x: number; y: number; w: number; h: number; clip: string; children?: React.ReactNode;
}> = ({ x, y, w, h, clip, children }) => (
  <g>
    <rect x={x + 9} y={y + 11} width={w} height={h} rx={18} fill={KRP.ink} opacity={0.13} />
    <clipPath id={clip}><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath>
    <g clipPath={`url(#${clip})`}>{children}</g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={KRP.ink} strokeWidth={7} />
  </g>
);

const S08B: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 90)) * 0.015;   // ほんの少しだけ寄る
  const grow = easeOut(seg(f, 10, 34));             // 年表の帯が左から伸びる
  const bl = 150, br = 1790, bt = 680, bb = 744;
  const yx = (y: number) => 170 + (y - 1996.6) * 390;
  const cyc = (f % 72) / 72;
  const pressed = cyc > 0.60 && cyc < 0.74;         // 画面のボタンを押した瞬間
  const curY = 446 - 56 * clamp01(cyc / 0.6);       // カーソルがボタンへ上がっていく
  const wheel = f * 7;                              // 車輪の回転
  const dash = (f * 5) % 120;                       // 道路の白線が流れる
  const bob = Math.sin(f / 9) * 4;                  // 受け取った箱のはずみ
  const PX = 180, PY = 600, PS = 0.95;              // コマ1の人
  const shX = PX + 62 * PS, shY = PY - 146 * PS;    // 肩 (238.9, 461.3)

  return (
    <g transform={zoomAt(z, 960, 430)}>
      {/* ===== 見出し ===== */}
      <TagPlate x={960} y={160} text="ネット通販" size={38} t={seg(f, 0, 10)} fill={KRP.yellow} />

      {/* ================= コマ1: パソコンで注文する ================= */}
      <S08BCard x={90} y={206} w={500} h={394} clip="s08b_c1">
        <rect x={90} y={206} width={500} height={394} fill="#EFE9DD" />
        <rect x={90} y={536} width={500} height={64} fill={KRP.floor} />
        <line x1={90} y1={536} x2={590} y2={536} stroke={KRP.ink} strokeWidth={5} />
        {/* 壁の掛け時計 (部屋だとわかる最小の印) */}
        <circle cx={162} cy={278} r={29} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={162} y1={278} x2={162} y2={259} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <g transform={`rotate(${f * 6} 162 278)`}>
          <line x1={162} y1={278} x2={162} y2={256} stroke={KRP.red} strokeWidth={3} strokeLinecap="round" />
        </g>
        {/* 椅子の背もたれ (人より先に描く) */}
        <rect x={98} y={450} width={20} height={104} rx={7} fill="#B98B52" stroke={KRP.ink} strokeWidth={5} />
        <Person x={PX} y={PY} s={PS} f={f} cloth={KRP.blue} clothDark="#6D96B6" gaze={[0.9, 0]} />
        {/* 椅子の座面 (脚を隠す = 座って見える) */}
        <rect x={108} y={540} width={152} height={62} rx={8} fill="#C79A5E" stroke={KRP.ink} strokeWidth={5} />
        <line x1={118} y1={556} x2={250} y2={556} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {/* 机 */}
        <polygon points="272,494 566,494 578,542 266,542" fill="#C89B62" stroke={KRP.ink} strokeWidth={7} />
        <polygon points="266,542 578,542 578,566 266,566" fill="#A87F4C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={282} y={564} width={18} height={32} fill="#A87F4C" stroke={KRP.ink} strokeWidth={5} />
        <rect x={548} y={564} width={18} height={32} fill="#A87F4C" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={424} cy={594} rx={166} ry={10} fill={KRP.ink} opacity={0.13} />
        {/* モニタ */}
        <rect x={402} y={478} width={28} height={18} fill="#C6BFAE" stroke={KRP.ink} strokeWidth={5} />
        <rect x={316} y={328} width={196} height={152} rx={14} fill="#D9D2C2" stroke={KRP.ink} strokeWidth={7} />
        <rect x={332} y={344} width={164} height={112} rx={5} fill="#DCE6EC" stroke={KRP.ink} strokeWidth={4} />
        <clipPath id="s08b_scr"><rect x={332} y={344} width={164} height={112} rx={5} /></clipPath>
        <g clipPath="url(#s08b_scr)">
          {/* 通販のページ: 題の帯・商品の水・買うボタン */}
          <rect x={332} y={344} width={164} height={17} fill={KRP.blueDeep} />
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${360 + i * 34} 0)`}>
              <rect x={-12} y={374} width={24} height={40} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-5} y={364} width={10} height={11} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-8} y={356} width={16} height={9} rx={2} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          <g stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round">
            <line x1={418} y1={366} x2={482} y2={366} />
            <line x1={418} y1={380} x2={462} y2={380} />
          </g>
          {/* 買うボタン (ときどき押される) */}
          <g transform={`translate(0 ${pressed ? 3 : 0})`}>
            <rect x={412} y={398} width={70} height={26} rx={9}
              fill={pressed ? "#C2741F" : KRP.orange} stroke={KRP.ink} strokeWidth={4} />
            <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round">
              <line x1={424} y1={406} x2={470} y2={406} />
              <line x1={424} y1={416} x2={454} y2={416} />
            </g>
          </g>
          {/* カーソル */}
          <polygon points={`470,${curY} 470,${curY + 21} 476,${curY + 15} 481,${curY + 24} 486,${curY + 21} 481,${curY + 12} 489,${curY + 11}`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
        </g>
        {/* キーボードとマウス */}
        <polygon points="322,506 496,506 506,530 312,530" fill="#E3DCCB" stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
          <line x1={324} y1={514} x2={498} y2={514} />
          <line x1={318} y1={523} x2={502} y2={523} />
        </g>
        <ellipse cx={542} cy={516} rx={19} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <line x1={542} y1={503} x2={542} y2={512} stroke={KRP.ink} strokeWidth={3} />
        {/* 右腕 (机より後に描く = 手がキーボードに乗る) */}
        <g>
          <path d={`M ${shX} ${shY} L 244 532 L 356 510`} fill="none" stroke={KRP.ink}
            strokeWidth={26 * PS + 11} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M ${shX} ${shY} L 244 532 L 356 510`} fill="none" stroke={KRP.blue}
            strokeWidth={26 * PS} strokeLinecap="round" strokeLinejoin="round" />
          {/* 肘の折り目 */}
          <path d="M 262 524 q 12 -6 24 -9" fill="none" stroke="#6D96B6" strokeWidth={6} opacity={0.85} />
          {/* 袖口 */}
          <g transform="rotate(-11 322 517)">
            <rect x={308} y={503} width={28} height={28} rx={7} fill="#6D96B6" stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 手 (キーボードの左に乗る) */}
          <ellipse cx={360} cy={509} rx={26} ry={18} transform="rotate(-11 360 509)"
            fill="#EBCCAA" stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.6}>
            <path d="M 356 497 q 8 12 2 22" />
            <path d="M 372 499 q 7 11 1 20" />
          </g>
        </g>
      </S08BCard>
      <text x={340} y={648} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={34} fill={KRP.ink} opacity={seg(f, 2, 12)}>パソコンで注文する</text>

      <Arrow x={700} y={400} t={seg(f, 8, 18)} color={KRP.red} />

      {/* ================= コマ2: トラックが運ぶ ================= */}
      <S08BCard x={710} y={206} w={500} h={394} clip="s08b_c2">
        <rect x={710} y={206} width={500} height={394} fill="#CBE2F4" />
        <g clipPath="url(#s08b_c2)">
          <Cloud x={880 - ((f * 0.55) % 700)} y={268} s={0.4} op={0.95} />
          <Cloud x={1260 - ((f * 0.4) % 700)} y={322} s={0.3} op={0.8} />
        </g>
        {/* 遠くの町 (地平線に建つ) */}
        {[0, 1, 2, 3].map((i) => {
          const bw = 66 + rnd(i + 61) * 34;
          const bh = 62 + rnd(i + 72) * 70;
          const bx = 726 + i * 122;
          return (
            <g key={i} opacity={0.55}>
              <rect x={bx} y={458 - bh} width={bw} height={bh} fill="#B4C3D1"
                stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2].map((k) => (
                <line key={k} x1={bx + 10} y1={458 - bh + 22 + k * 22} x2={bx + bw - 10}
                  y2={458 - bh + 22 + k * 22} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
              ))}
            </g>
          );
        })}
        {/* 地面と道路 */}
        <rect x={710} y={458} width={500} height={142} fill="#CBD8B2" />
        <line x1={710} y1={458} x2={1210} y2={458} stroke={KRP.ink} strokeWidth={5} />
        <rect x={710} y={530} width={500} height={62} fill="#9AA2A8" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={700 + i * 120 - dash} y={556} width={58} height={9} rx={3} fill={KRP.white} />
        ))}
        {/* 配送のトラック */}
        <g transform={`translate(${Math.sin(f / 15) * 5} ${Math.abs(Math.sin(f / 7)) * 2})`}>
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.45}>
            <line x1={722} y1={404} x2={756} y2={404} />
            <line x1={722} y1={440} x2={748} y2={440} />
            <line x1={722} y1={476} x2={758} y2={476} />
          </g>
          <rect x={752} y={372} width={226} height={128} rx={8} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={7} />
          {/* 後ろの観音扉 */}
          <line x1={776} y1={380} x2={776} y2={492} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
          <rect x={758} y={434} width={28} height={10} rx={5} fill="#C6BFAE" stroke={KRP.ink} strokeWidth={5} />
          {/* 荷物の印 */}
          <Carton x={890} y={468} w={64} h={52} />
          {/* 運転席 */}
          <polygon points="978,410 1050,410 1088,452 1088,500 978,500"
            fill={KRP.orange} stroke={KRP.ink} strokeWidth={7} />
          <polygon points="992,420 1046,420 1068,448 992,448"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          {/* 運転手 (窓の中に頭だけ) */}
          <g>
            <circle cx={1020} cy={438} r={17} fill="#F6E3CC" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 1003 434 q 4 -17 17 -17 q 13 0 17 17 q -9 -7 -17 -7 q -8 0 -17 7 z"
              fill={KRP.ink} />
          </g>
          <rect x={1082} y={484} width={22} height={16} rx={4} fill="#8C8178" stroke={KRP.ink} strokeWidth={5} />
          {[818, 1048].map((wx) => (
            <g key={wx}>
              <circle cx={wx} cy={512} r={34} fill="#4A4440" stroke={KRP.ink} strokeWidth={6} />
              <circle cx={wx} cy={512} r={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              <g transform={`rotate(${wheel} ${wx} 512)`} stroke={KRP.ink} strokeWidth={4}>
                <line x1={wx - 10} y1={512} x2={wx + 10} y2={512} />
                <line x1={wx} y1={502} x2={wx} y2={522} />
              </g>
            </g>
          ))}
        </g>
      </S08BCard>
      <text x={960} y={648} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={34} fill={KRP.ink} opacity={seg(f, 12, 22)}>トラックが運ぶ</text>

      <Arrow x={1320} y={400} t={seg(f, 18, 28)} color={KRP.red} />

      {/* ================= コマ3: 家まで届く ================= */}
      <S08BCard x={1330} y={206} w={500} h={394} clip="s08b_c3">
        <rect x={1330} y={206} width={500} height={394} fill="#EFE9DD" />
        <rect x={1330} y={536} width={500} height={64} fill={KRP.floor} />
        <line x1={1330} y1={536} x2={1830} y2={536} stroke={KRP.ink} strokeWidth={5} />
        {/* 玄関 */}
        <rect x={1392} y={272} width={228} height={266} fill="#8C7B66" stroke={KRP.ink} strokeWidth={7} />
        <rect x={1404} y={284} width={204} height={254} fill="#6B6258" />
        {/* 開いた扉 (手前へ) */}
        <polygon points="1404,284 1346,264 1346,558 1404,538" fill="#C99E62" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1366} cy={420} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 表札 */}
        <rect x={1648} y={316} width={72} height={34} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1660} y1={334} x2={1708} y2={334} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
        {/* よろこびの線 */}
        <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={seg(f, 26, 38)}>
          <line x1={1452} y1={318} x2={1440} y2={300} />
          <line x1={1505} y1={310} x2={1505} y2={290} />
          <line x1={1558} y1={318} x2={1570} y2={300} />
        </g>
        <ellipse cx={1505} cy={540} rx={86} ry={11} fill={KRP.ink} opacity={0.16} />
        <Person x={1505} y={536} s={0.72} f={f} cloth={KRP.orange} clothDark="#C06F22" face="smile" />
        {/* 箱を抱える両腕 (Person のまっすぐな腕を完全に覆う) */}
        <g transform={`translate(0 ${bob})`}>
          {[-1, 1].map((d) => (
            <g key={d}>
              <path d={`M ${1505 + d * 44.6} 430.9 L ${1505 + d * 64} 480 L ${1505 + d * 36} 502`}
                fill="none" stroke={KRP.ink} strokeWidth={26 * 0.72 + 11}
                strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${1505 + d * 44.6} 430.9 L ${1505 + d * 64} 480 L ${1505 + d * 36} 502`}
                fill="none" stroke={KRP.orange} strokeWidth={26 * 0.72}
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </g>
        {/* 受け取った箱 (腕より後に描く = 抱えて見える) */}
        <g transform={`translate(0 ${bob})`}>
          <Carton x={1505} y={514} w={100} h={62} />
          <ellipse cx={1463} cy={496} rx={18} ry={14} transform="rotate(16 1463 496)"
            fill="#EBCCAA" stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1547} cy={496} rx={18} ry={14} transform="rotate(-16 1547 496)"
            fill="#EBCCAA" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 玄関マット */}
        <rect x={1416} y={552} width={180} height={28} rx={7} fill="#A7AEA6" stroke={KRP.ink} strokeWidth={5} />
      </S08BCard>
      <text x={1580} y={648} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={34} fill={KRP.ink} opacity={seg(f, 22, 32)}>家まで届く</text>

      {/* ===== 足元の年表 (添え物。主役は3コマ) =====
          ★ロゴは描かない・ブランドの色も真似ない。社名は本編と同じ字で書くだけ。 */}
      <g>
        <clipPath id="s08b_band">
          <rect x={bl} y={bt - 10} width={(br - bl) * grow} height={bb - bt + 20} />
        </clipPath>
        <g clipPath="url(#s08b_band)">
          <rect x={bl} y={bt} width={br - bl} height={bb - bt} rx={10}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={bl} y={bt} width={br - bl} height={bb - bt} rx={10} fill={KRP.gold} opacity={0.22} />
          {[1997, 1998, 1999].map((y) => (
            <line key={y} x1={yx(y)} y1={bt} x2={yx(y)} y2={bt + 18}
              stroke={KRP.ink} strokeWidth={5} />
          ))}
          <line x1={yx(2000)} y1={bt} x2={yx(2000)} y2={bt + 24} stroke={KRP.red} strokeWidth={9} />
          {/* 年は墨、社名だけ各社のイメージの色に寄せる (作者の指示 2026-11-05)。
              ★ロゴの形・書体は使わない。本編と同じ字で、色だけ寄せる。 */}
          {([
            [1997, "1997 ", "楽天", "#C1272D"],
            [1999, "1999 ", "Yahoo!", "#5F2DA8"],
            [2000, "2000 ", "Amazon日本", "#D98B1E"],
          ] as const).map(([y, head, name, col]) => (
            <text key={y} x={yx(y)} y={bb - 16} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={28} fill={KRP.ink}>
              {head}<tspan fill={col}>{name}</tspan>
            </text>
          ))}
        </g>
        {/* 「いま」の赤い印 (帯の下から上を向く) */}
        <polygon points={`${yx(2000)},${bb} ${yx(2000) - 21},${bb + 26} ${yx(2000) + 21},${bb + 26}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={5} opacity={seg(f, 28, 36)} />
      </g>
      <TagPlate x={560} y={800} text="使う人は、まだわずか" size={30}
        t={seg(f, 34, 44)} fill={KRP.white} />
      <TagPlate x={yx(2000)} y={800} text="いま、ここ" size={30}
        t={seg(f, 30, 40)} fill={KRP.red} color={KRP.white} />
    </g>
  );
};

// =====================================================================
// 文#10 (v1では#9) 2リットル6本を、自分で抱えて上がります。
// 画面を左右2分割。2000年なのでエレベーターはまだ動く。しんどいのは「玄関まで届かない」ぶん。
//   左 = 道からマンションの入口まで、ケースを抱えて歩く (1本こぼれて転がっていく)
//   右 = エレベーターを出て、30階の廊下をドアまで必死に運ぶ
// (前は階段を22階ぶん上がる絵にしていたが、箱が消えるのは #12 の1930年代。
//  2000年の時点で階段を上がらせるのは筋が通らないので組み替えた。階段は #14 の担当)
// =====================================================================
const S09: React.FC<{ f: number }> = ({ f }) => {
  // よいしょ、よいしょ (左右で位相をずらす)
  const hopL = Math.abs(Math.sin(f / 8)) * 8;
  const hopR = Math.abs(Math.sin((f + 10) / 8)) * 9;
  // 廊下 (右) の遠近。t=0 が手前、t=1 が突き当り
  const lw = (t: number) => ({ x: lerp(982, 1400, t), yt: lerp(150, 420, t), yb: lerp(840, 650, t) });
  const rw = (t: number) => ({ x: lerp(1872, 1620, t), yt: lerp(150, 420, t), yb: lerp(840, 650, t) });
  return (
    <g>
      <defs>
        <clipPath id="s09L"><rect x={48} y={150} width={890} height={690} /></clipPath>
        <clipPath id="s09R"><rect x={982} y={150} width={890} height={690} /></clipPath>
      </defs>

      {/* ══════ 左 : 道から、マンションの入口まで ══════ */}
      <g clipPath="url(#s09L)">
        <rect x={48} y={150} width={890} height={690} fill="#D9E8F2" />
        {/* 隣の低いビル */}
        <rect x={80} y={400} width={200} height={240} fill="#CCD3D8" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={100 + (i % 4) * 46} y={424 + Math.floor(i / 4) * 42}
            width={30} height={26} fill="#8FA3B2" stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 奥のタワーマンション (いま住んでいる建物) */}
        <rect x={540} y={150} width={320} height={490} fill="#BFC7CE" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 66 }, (_, i) => (
          <rect key={i} x={560 + (i % 6) * 50} y={176 + Math.floor(i / 6) * 40}
            width={34} height={26} fill={i % 7 === 3 ? KRP.yellow : "#9FB3C2"}
            stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 入口 : 庇とガラス扉 */}
        <rect x={590} y={450} width={300} height={26} fill="#9C9484" stroke={KRP.ink} strokeWidth={6} />
        <rect x={604} y={476} width={272} height={164} fill="#8FB8D8" stroke={KRP.ink} strokeWidth={7} />
        <line x1={740} y1={476} x2={740} y2={640} stroke={KRP.ink} strokeWidth={6} />
        <line x1={672} y1={476} x2={672} y2={640} stroke={KRP.white} strokeWidth={5} opacity={0.5} />
        <line x1={808} y1={476} x2={808} y2={640} stroke={KRP.white} strokeWidth={5} opacity={0.5} />
        {/* 地面 (歩道) */}
        <rect x={48} y={640} width={890} height={200} fill="#C9C2B2" />
        <line x1={48} y1={640} x2={938} y2={640} stroke={KRP.ink} strokeWidth={7} />
        {[692, 748, 812].map((y) => (
          <line key={y} x1={48} y1={y} x2={938} y2={y} stroke={KRP.grayDark} strokeWidth={3} opacity={0.5} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={160 + i * 150} y1={640} x2={100 + i * 170} y2={840}
            stroke={KRP.grayDark} strokeWidth={3} opacity={0.5} />
        ))}
        {/* 植え込み (住人に重ならないよう、入口のそばへ寄せる) */}
        <rect x={430} y={614} width={158} height={34} fill="#9C9484" stroke={KRP.ink} strokeWidth={5} />
        {[[462, 604, 32], [508, 590, 42], [554, 602, 34]].map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* こぼれた1本が歩道を転がっていく (事件) */}
        <g transform={`translate(${640 - ((f * 3.4) % 320)} 788) rotate(${-f * 4})`}>
          <rect x={-40} y={-23} width={80} height={46} rx={14} fill={KRP.blueSoft}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={40} y={-12} width={21} height={24} rx={5} fill={KRP.blue}
            stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 住人 : ケースを抱えて歩く */}
        <ellipse cx={288} cy={796} rx={90} ry={16} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(0 ${-hopL})`}>
          <Person x={288} y={790} s={1.2} f={f} cloth={KRP.orange} clothDark="#C06F22"
            face="worried" gaze={[0.45, -0.15]} lean={-6} />
          <WaterCase x={288} y={752} s={0.8} rot={-4} />
          <Sweat x={374} y={600} f={f} n={3} />
        </g>
      </g>

      {/* ══════ 右 : エレベーターを出て、30階の廊下を部屋まで ══════ */}
      <g clipPath="url(#s09R)">
        {/* 廊下の箱 (一点透視) */}
        <polygon points="982,150 1872,150 1620,420 1400,420" fill="#DCD5C6" />
        <polygon points="982,840 1872,840 1620,650 1400,650" fill="#A9A192" />
        <polygon points="982,150 1400,420 1400,650 982,840" fill="#CFC8B8" />
        <polygon points="1872,150 1620,420 1620,650 1872,840" fill="#BDB5A5" />
        <rect x={1400} y={420} width={220} height={230} fill="#B2AA9A" stroke={KRP.ink} strokeWidth={5} />
        {/* 左壁の窓 2枚 */}
        {[[0.10, 0.34], [0.44, 0.64]].map(([ta, tb]) => {
          const a = lw(ta), b = lw(tb);
          return (
            <polygon key={ta} fill="#E5F0F8" stroke={KRP.ink} strokeWidth={5}
              points={`${a.x},${lerp(a.yt, a.yb, 0.2)} ${b.x},${lerp(b.yt, b.yb, 0.2)} ` +
                `${b.x},${lerp(b.yt, b.yb, 0.54)} ${a.x},${lerp(a.yt, a.yb, 0.54)}`} />
          );
        })}
        {/* 右壁の玄関ドア 3枚 (いちばん手前が目当ての部屋) */}
        {[[0.06, 0.30], [0.38, 0.58], [0.64, 0.80]].map(([ta, tb], i) => {
          const a = rw(ta), b = rw(tb);
          const ay = lerp(a.yt, a.yb, 0.24), by = lerp(b.yt, b.yb, 0.24);
          return (
            <g key={ta}>
              <polygon fill="#9C7B52" stroke={KRP.ink} strokeWidth={6}
                points={`${a.x},${ay} ${b.x},${by} ${b.x},${b.yb} ${a.x},${a.yb}`} />
              <circle cx={lerp(a.x, b.x, 0.22)} cy={lerp(lerp(ay, a.yb, 0.52), lerp(by, b.yb, 0.52), 0.22)}
                r={16 - i * 4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 床の目地 */}
        {[0.18, 0.38, 0.58, 0.76].map((t) => (
          <line key={t} x1={lw(t).x} y1={lw(t).yb} x2={rw(t).x} y2={rw(t).yb}
            stroke={KRP.grayDark} strokeWidth={3} opacity={0.45} />
        ))}
        {/* 天井の照明 3つ (器具の受け皿を描かないと、黄色い棒が浮いて見える) */}
        {[0.12, 0.38, 0.62].map((t) => {
          const cx = lerp(1423, 1510, t);
          const w = lerp(160, 48, t);
          const h = lerp(26, 9, t);
          const y = lerp(166, 404, t);
          return (
            <g key={t}>
              <rect x={cx - w / 2 - 9} y={y - 6} width={w + 18} height={h + 12} rx={8}
                fill="#CFC8B8" stroke={KRP.ink} strokeWidth={4} />
              <rect x={cx - w / 2} y={y} width={w} height={h} rx={5}
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 突き当り : いま出てきたエレベーター (扉が開いていて、中は暗い) */}
        <rect x={1404} y={420} width={222} height={230} fill="#8E8576" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1452} y={392} width={126} height={36} rx={8} fill="#2F2A24" stroke={KRP.ink} strokeWidth={4} />
        <text x={1515} y={420} textAnchor="middle" fontFamily={FONT} fontSize={25} fontWeight={700}
          fill={KRP.yellow}>30</text>
        <rect x={1456} y={440} width={118} height={206} fill="#3A342C" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1472} y={450} width={86} height={15} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        <polygon points="1478,467 1552,467 1568,644 1462,644" fill={KRP.yellow} opacity={0.2} />
        <rect x={1410} y={428} width={46} height={218} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1574} y={428} width={46} height={218} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {/* 床に残る、置いて休んだ跡 */}
        <ellipse cx={1596} cy={742} rx={66} ry={17} fill={KRP.blueDeep} opacity={0.16} />
        <ellipse cx={1706} cy={796} rx={78} ry={20} fill={KRP.blueDeep} opacity={0.14} />
        {/* 住人 : こちらへ運んでくる */}
        <ellipse cx={1196} cy={826} rx={99} ry={18} fill={KRP.ink} opacity={0.2} />
        <g transform={`translate(0 ${-hopR})`}>
          <Person x={1196} y={820} s={1.3} f={f} phase={3} cloth={KRP.orange} clothDark="#C06F22"
            face="worried" gaze={[-0.2, 0.1]} lean={5} />
          <WaterCase x={1196} y={768} s={0.87} rot={6} />
          <Sweat x={1098} y={494} f={f} n={3} />
        </g>
      </g>

      {/* 2枚の枠と仕切り */}
      <rect x={44} y={146} width={898} height={698} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <rect x={978} y={146} width={898} height={698} fill="none" stroke={KRP.ink} strokeWidth={8} />

      <TagPlate x={497} y={212} text="マンションまで" size={36} t={seg(f, 4, 18)} fill={KRP.white} rot={-2} />
      <TagPlate x={1427} y={212} text="部屋まで" size={36} t={seg(f, 20, 34)} fill={KRP.white} rot={2} />
    </g>
  );
};

// =====================================================================
// 場面の割り当て (motif 名 → 絵)。1文 = 1枚。
// =====================================================================

// =====================================================================
// 文#10 次に、1960年代。エアコンが、消えました。
// 同じ30階の部屋。壁のエアコンが点線になって消える。手前に大きな首振り扇風機。
// 窓の外は1960年代の低い家並みと入道雲。
// =====================================================================
const S10: React.FC<{ f: number }> = ({ f }) => {
  const gone = seg(f, 6, 26);
  const bl = f * 11;
  const sw = Math.sin(f / 24) * 17;
  return (
    <g>
      <RoomBox floorY={880} />
      <WinWall x={620} y={150} w={1240} h={640}>
        <rect x={620} y={150} width={1240} height={640} fill="#CFE4F2" />
        <rect x={620} y={150} width={1240} height={170} fill="#B9D7EE" />
        <circle cx={1750} cy={248} r={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        <Cloud x={930} y={320} s={1.7} />
        <Cloud x={1450} y={268} s={2.1} />
        <Cloud x={1700} y={420} s={1.1} op={0.8} />
        {/* 地平 */}
        <rect x={620} y={632} width={1240} height={158} fill="#C9CCB2" />
        <line x1={620} y1={632} x2={1860} y2={632} stroke={KRP.ink} strokeWidth={3} />
        {/* 1960年代の低い家並み (高い建物はまだ少ない) */}
        {Array.from({ length: 52 }, (_, i) => {
          const d = rnd(i + 31);
          const x = 624 + rnd(i + 77) * 1190;
          const y = lerp(784, 640, d);
          const w = lerp(88, 24, d);
          const h = lerp(60, 16, d);
          return (
            <g key={i} opacity={lerp(1, 0.45, d)}>
              <rect x={x} y={y - h} width={w} height={h}
                fill={rnd(i + 3) > 0.5 ? "#E8E1D2" : "#D8D0BF"} stroke={KRP.ink} strokeWidth={2} />
              <path d={`M ${x - 5} ${y - h} L ${x + w / 2} ${y - h - w * 0.26} L ${x + w + 5} ${y - h}`}
                fill="#B98463" stroke={KRP.ink} strokeWidth={2} />
            </g>
          );
        })}
        {/* 2本だけ背の高いビルと煙突 */}
        <rect x={1180} y={540} width={44} height={96} fill="#DDD6C7" stroke={KRP.ink} strokeWidth={3} />
        <rect x={880} y={566} width={34} height={70} fill="#DDD6C7" stroke={KRP.ink} strokeWidth={3} />
        <rect x={1560} y={556} width={18} height={80} fill="#B5795A" stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 4 }, (_, i) => (
          <circle key={i} cx={1569 + i * 16 + Math.sin((f + i * 20) / 16) * 7}
            cy={548 - i * 30} r={12 + i * 5} fill={KRP.gray} opacity={0.45 - i * 0.08} />
        ))}
      </WinWall>

      {/* 壁 : 消えるエアコン */}
      <g opacity={1 - gone}>
        <rect x={150} y={212} width={392} height={140} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={168} y={308} width={356} height={28} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        <line x1={182} y1={248} x2={510} y2={248} stroke={KRP.gray} strokeWidth={4} />
        <circle cx={504} cy={278} r={10} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <rect x={150} y={212} width={392} height={140} rx={18} fill="none"
        stroke={KRP.red} strokeWidth={6} strokeDasharray="20 16" opacity={gone} />
      <XMark x={346} y={282} s={1.6} t={seg(f, 16, 34)} />

      {/* 近景 : 首振り扇風機 */}
      <g transform="translate(236 1012) scale(1.28)">
        <ellipse cx={0} cy={6} rx={118} ry={26} fill={KRP.grayDark} opacity={0.22} />
        <ellipse cx={0} cy={-4} rx={100} ry={24} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-17} y={-298} width={34} height={296} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`translate(0 -348) rotate(${sw})`}>
          <circle cx={0} cy={0} r={112} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={0} cy={0} r={26 + i * 21} fill="none" stroke={KRP.gray} strokeWidth={3} />
          ))}
          <g transform={`rotate(${bl})`} opacity={0.88}>
            {[0, 1, 2].map((i) => (
              <path key={i} transform={`rotate(${i * 120})`}
                d="M 0 0 q 46 -26 80 -8 q -18 40 -80 8 Z"
                fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
          <circle cx={0} cy={0} r={20} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 扇風機の風 (弱い) */}
      <g stroke={KRP.blueDeep} strokeWidth={5} fill="none" opacity={0.5} strokeLinecap="round">
        {[0, 1, 2].map((i) => {
          const px = ((f * 7 + i * 90) % 230) + 380;
          return <path key={i} d={`M ${px} ${500 + i * 54} q 56 -12 112 0`} opacity={0.6 - i * 0.12} />;
        })}
      </g>

      {/* 近景 : 卓袱台・麦茶・うちわ・溶けるアイス (画面右下で切れる) */}
      <g>
        <rect x={1280} y={930} width={760} height={28} rx={8} fill="#C58C4F" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1340} y={958} width={26} height={120} fill="#A8743F" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1900} y={958} width={26} height={120} fill="#A8743F" stroke={KRP.ink} strokeWidth={5} />
        {/* 麦茶のタンブラー */}
        <path d="M 1438 806 L 1448 926 L 1524 926 L 1534 806 Z" fill="#C98B3E" opacity={0.72} />
        <path d="M 1432 742 L 1448 926 L 1524 926 L 1540 742 Z" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={1486} cy={742} rx={54} ry={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1486} cy={806} rx={49} ry={11} fill="#E0AE63" stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((i) => (
          <rect key={i} x={1452 + i * 40} y={760 + i * 22} width={30} height={26} rx={5}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} opacity={0.95}
            transform={`rotate(${i ? 14 : -11} ${1467 + i * 40} ${773 + i * 22})`} />
        ))}
        {/* 水滴 */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={1442 + i * 6} cy={840 + i * 34} rx={5} ry={9}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* うちわ */}
        <g transform={`translate(1702 846) rotate(${-14 + Math.sin(f / 7) * 6})`}>
          <ellipse cx={0} cy={-52} rx={78} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-56} r={26} fill={KRP.red} opacity={0.85} />
          <rect x={-10} y={-10} width={20} height={86} rx={8} fill="#C9A86A" stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>

      {/* 人 : 暑がる */}
      {/* 床 : 扇風機のコードと投げ出した新聞 */}
      <path d="M 236 1030 C 420 1066, 560 1010, 700 1050 C 800 1078, 880 1040, 960 1062"
        fill="none" stroke={KRP.ink} strokeWidth={6} opacity={0.75} />
      <g transform="translate(1180 1022) rotate(-7)">
        <rect x={-150} y={-56} width={300} height={112} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-56} x2={0} y2={56} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-132} y1={-32 + i * 22} x2={-18} y2={-32 + i * 22}
            stroke={KRP.gray} strokeWidth={5} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={18} y1={-32 + i * 22} x2={132} y2={-32 + i * 22}
            stroke={KRP.gray} strokeWidth={5} />
        ))}
      </g>
      <ellipse cx={940} cy={1004} rx={136} ry={26} fill={KRP.ink} opacity={0.14} />
      <Person x={940} y={1000} s={1.95} f={f} cloth={KRP.blueSoft} clothDark={KRP.blue}
        face="worried" gaze={[-0.5, -0.25]} />
      <Sweat x={1046} y={578} f={f} n={3} />
      <TagPlate x={1620} y={300} text="1960年代" size={46} t={seg(f, 2, 20)} fill={KRP.white} />
    </g>
  );
};

// =====================================================================
// 文#11 窓は開きます。ただし30階の風は、かなり暴力的です。
// 窓を右半分に。サッシは左右へ開ききり、カーテンが水平に吹き飛ぶ。
// 書類が舞い、鉢植えが倒れ、人は風上へ踏ん張る。
// =====================================================================
const S11: React.FC<{ f: number }> = ({ f }) => {
  const wob = (k: number) => Math.sin(f / 8 + k) * 24;
  return (
    <g>
      <RoomBox floorY={880} />
      {/* 開いた窓 */}
      <defs>
        <clipPath id="s11win">
          <rect x={900} y={120} width={960} height={720} />
        </clipPath>
      </defs>
      <g clipPath="url(#s11win)">
        <rect x={900} y={120} width={960} height={720} fill="#CBE2F3" />
        <rect x={900} y={120} width={960} height={190} fill="#B2D2EC" />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 900 + (((f * (13 + i * 4) + i * 420) % 1500) - 300);
          return <Cloud key={i} x={x} y={200 + i * 118} s={0.7 + (i % 3) * 0.45} op={0.92} />;
        })}
        {/* 眼下の街 (はるか下) */}
        <rect x={900} y={706} width={960} height={134} fill="#C3CBC8" opacity={0.8} />
        <rect x={900} y={700} width={960} height={18} fill="#D6DEE4" opacity={0.9} />
        <line x1={900} y1={706} x2={1860} y2={706} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
        {Array.from({ length: 64 }, (_, i) => {
          const d = rnd(i + 51);
          const x = 902 + rnd(i + 91) * 940;
          const y = lerp(844, 712, d * d);
          const w = lerp(46, 9, d);
          const h = lerp(58, 10, d);
          return <rect key={i} x={x} y={y - h} width={w} height={h}
            fill={rnd(i + 7) > 0.5 ? "#DFE5E4" : "#CBD3D2"} stroke={KRP.ink}
            strokeWidth={1.6} opacity={lerp(1, 0.32, d)} />;
        })}
        {/* 川 */}
        <path d="M 900 800 C 1120 770, 1280 816, 1500 782 C 1660 758, 1780 778, 1860 764"
          fill="none" stroke="#9FBBD2" strokeWidth={18} opacity={0.8} />
        {/* 足元の雲 = 高さの証拠 */}
        <Cloud x={1160} y={660} s={1.0} op={0.85} />
        <Cloud x={1680} y={620} s={0.8} op={0.8} />
        {/* 飛ぶ鳥 (風に流される) */}
        {[0, 1].map((i) => {
          const x = 1860 - ((f * 22 + i * 500) % 1100);
          return <path key={i} d={`M ${x} ${330 + i * 90} q 22 -20 42 0 q 20 -20 42 0`}
            fill="none" stroke={KRP.ink} strokeWidth={4} />;
        })}
      </g>
      {/* 窓枠と開ききったサッシ */}
      <rect x={900} y={120} width={960} height={720} fill="none" stroke={KRP.ink} strokeWidth={9} />
      <g fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} opacity={0.75}>
        <rect x={900} y={120} width={118} height={720} />
        <rect x={1742} y={120} width={118} height={720} />
      </g>
      <rect x={880} y={840} width={1000} height={26} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />

      {/* 風の線 (右から左へ : 反転) */}
      <g transform="translate(1920 0) scale(-1 1)">
        <WindLines f={f} y0={200} y1={820} n={16} speed={46} len={300} />
      </g>

      {/* カーテン : 窓の左上から室内へ水平に吹き飛ぶ */}
      <path d={`M 1010 128
        C 820 ${170 + wob(0)}, 640 ${120 + wob(1)}, 380 ${210 + wob(2)}
        L 330 ${520 + wob(3)}
        C 600 ${600 + wob(4)}, 800 ${520 + wob(5)}, 1010 ${640 + wob(6)} Z`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={7} opacity={0.96} />
      {[0, 1, 2, 3, 4].map((i) => {
        const x0 = 980 - i * 148;
        return (
          <path key={i}
            d={`M ${x0} ${146 + i * 16 + wob(i)} C ${x0 - 70} ${300 + wob(i + 2)}, ${x0 - 20} ${420 + wob(i + 1)}, ${x0 - 86} ${600 + i * 26 + wob(i + 3)}`}
            fill="none" stroke={KRP.gray} strokeWidth={6} opacity={0.85} strokeLinecap="round" />
        );
      })}

      {/* 舞う書類 */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = (f * (9 + i * 2) + i * 340) % 1900;
        const x = 1800 - t;
        const y = 300 + i * 112 + Math.sin((f + i * 37) / 13) * 70;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(f * 5 + i * 72) % 360})`}>
            <rect x={-48} y={-34} width={96} height={68} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <line x1={-30} y1={-12} x2={30} y2={-12} stroke={KRP.gray} strokeWidth={4} />
            <line x1={-30} y1={6} x2={16} y2={6} stroke={KRP.gray} strokeWidth={4} />
          </g>
        );
      })}

      {/* 倒れた鉢植えと転がるペン立て (近景・左下) */}
      <g transform="translate(300 980) rotate(-78) scale(1.15)">
        <path d="M -62 0 L -46 -120 L 46 -120 L 62 0 Z" fill="#C97F52" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-120} rx={48} ry={14} fill="#6E5B46" stroke={KRP.ink} strokeWidth={5} />
        {[-1, 0, 1].map((i) => (
          <path key={i} d={`M 0 -124 q ${i * 66} -70 ${i * 90} -124`}
            fill="none" stroke={KRP.green} strokeWidth={14} strokeLinecap="round" />
        ))}
      </g>
      {/* こぼれた土 */}
      <ellipse cx={200} cy={990} rx={120} ry={22} fill="#6E5B46" stroke={KRP.ink} strokeWidth={4} opacity={0.85} />

      {/* 人 : 風上へ踏ん張る */}
      {/* 窓台 : 転がるマグ */}
      <g transform={`translate(${1180 + (f * 6) % 260} 826) rotate(96)`}>
        <rect x={-30} y={-34} width={60} height={68} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 30 -16 q 30 16 0 34" fill="none" stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 床の影 */}
      <ellipse cx={664} cy={890} rx={116} ry={22} fill={KRP.ink} opacity={0.14} />
      <Person x={660} y={884} s={1.55} f={f} cloth={KRP.orange} clothDark="#B96F22"
        face="surprised" gaze={[0.5, 0]} lean={13} />
      <TagPlate x={1440} y={778} text="30階の風" size={42} t={seg(f, 14, 32)} fill={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#12 1930年代。エレベーターのボタンが、消えました。
// かごの中。真鍮の蛇腹格子・木目の壁・半円の階数ダイヤル。
// カメラ: かご全体の引き → ボタン板へ寄る (1.0倍 → 1.6倍)。
// 事件: 寄った先で、真鍮の押しボタン8個が上から順に消えていき、点線の跡だけが残る。
//       そこへ乗客の手が伸びてくるが、もう押すところがない。
// 札はカメラの外に置いてある (寄っても札だけは大きさが変わらないように)。
// (運転係とレバーは #13 で出す。ここは「消えた」ことだけを見せる)
// =====================================================================
const S12: React.FC<{ f: number }> = ({ f }) => {
  const nd = -62 + ((f * 0.9) % 124); // 階数の針
  // カメラ: k=0 で引き (変形なし)、k=1 でボタン板が画面の左寄りに大きく来る。
  // 1.6倍まで寄せたら壁だけの絵になったので 1.28倍で止め、乗客と蛇腹扉を画面に残す。
  const k = seg(f, 6, 34);
  const z = 1 + k * 0.28;
  const ccx = lerp(960, 620, k);
  const ccy = lerp(540, 578, k);
  const cam = `translate(${960 - ccx * z} ${540 - ccy * z}) scale(${z})`;
  // ボタンが消えていく順 (上から下へ、左列→右列)
  const gone = (i: number) => seg(f, 16 + i * 2.4, 24 + i * 2.4);
  // 伸びてくる手
  const reach = seg(f, 26, 40);
  const hgx = lerp(900, 545, reach);
  return (
    <g>
    <g transform={cam}>
      {/* かごの壁 (木目) */}
      <rect x={-300} y={-200} width={W + 600} height={H + 400} fill="#A9793F" />
      <rect x={-300} y={-200} width={W + 600} height={320} fill="#8E6331" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M ${60 + i * 122} 120 C ${90 + i * 122} 420, ${30 + i * 122} 640, ${70 + i * 122} 940`}
          fill="none" stroke="#8E6331" strokeWidth={5} opacity={0.6} />
      ))}
      {/* ボタン板の左右に真鍮の縁飾り (寄ったときに壁がのっぺりしないように) */}
      {[170, 640].map((bx) => (
        <g key={bx}>
          <rect x={bx} y={300} width={30} height={400} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <line x1={bx + 15} y1={300} x2={bx + 15} y2={700} stroke="#8E6331" strokeWidth={5} opacity={0.5} />
        </g>
      ))}
      {/* 腰板と手すり */}
      <rect x={-300} y={700} width={W + 600} height={26} fill="#C99A55" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-300} y={726} width={W + 600} height={214} fill="#916739" />
      {/* 真鍮の手すり */}
      <g>
        <rect x={-300} y={668} width={W + 600} height={18} rx={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={60 + i * 330} y={686} width={20} height={34} fill={KRP.brass}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* 床 : モザイクタイル */}
      <rect x={-300} y={940} width={W + 600} height={340} fill="#D8CFBC" stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 26 }, (_, i) => (
        <path key={i} d={`M ${-120 + i * 86} 1080 L ${160 + i * 70} 940`}
          stroke={KRP.grayDark} strokeWidth={3} opacity={0.6} />
      ))}
      <line x1={-300} y1={1012} x2={W + 300} y2={1012} stroke={KRP.grayDark} strokeWidth={3} opacity={0.6} />

      {/* 天井の照明 */}
      <g>
        <rect x={880} y={0} width={24} height={70} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 790 70 L 994 70 L 960 160 L 824 160 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="824,162 960,162 1080,1080 704,1080" fill={KRP.yellow} opacity={0.14} />
      </g>

      {/* 奥 : 真鍮の蛇腹格子扉 (閉じている) */}
      <g>
        <rect x={1150} y={150} width={640} height={790} fill="#6E5636" stroke={KRP.ink} strokeWidth={8} />
        <rect x={1150} y={150} width={640} height={790} fill="#2F2A24" opacity={0.35} />
        <g stroke={KRP.brass} strokeWidth={9} opacity={0.95}>
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line x1={1150 + i * 64} y1={150} x2={1150 + i * 64 + 150} y2={940} />
              <line x1={1150 + i * 64} y1={940} x2={1150 + i * 64 + 150} y2={150} />
            </g>
          ))}
        </g>
        <rect x={1150} y={150} width={640} height={790} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <rect x={1700} y={480} width={34} height={120} rx={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* 半円の階数ダイヤル (ボタン板に寄る都合で右上に寄せてある) */}
      <g transform="translate(790 430)">
        <path d="M -190 0 A 190 190 0 0 1 190 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <path d="M -190 0 A 190 190 0 0 1 190 0" fill="none" stroke={KRP.brass} strokeWidth={10} />
        {Array.from({ length: 21 }, (_, i) => {
          const a = (-180 + i * 9) * Math.PI / 180;
          const big = i % 4 === 0;
          return <line key={i} x1={Math.cos(a) * (big ? 152 : 170)} y1={Math.sin(a) * (big ? 152 : 170)}
            x2={Math.cos(a) * 185} y2={Math.sin(a) * 185} stroke={KRP.ink} strokeWidth={big ? 6 : 3} />;
        })}
        {[0, 6, 12, 18, 24, 30].map((n, i) => {
          const a = (-172 + i * 34.4) * Math.PI / 180;
          return <text key={n} x={Math.cos(a) * 120} y={Math.sin(a) * 120 + 12} textAnchor="middle"
            fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>{n}</text>;
        })}
        <g transform={`rotate(${nd})`}>
          <polygon points="0,0 -8,-20 0,-168 8,-20" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={0} cy={0} r={18} fill={KRP.ink} />
      </g>

      {/* 押しボタンの板。最初はボタンがあり、上から順に消えて点線の跡だけが残る */}
      <g>
        <rect x={280} y={320} width={280} height={360} rx={18} fill="#C99A55"
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={310} y={350} width={220} height={300} rx={12} fill="#B98A5A"
          stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
        {/* 板のネジ4本 */}
        {[[300, 340], [540, 340], [300, 660], [540, 660]].map(([sx, sy]) => (
          <g key={`${sx}-${sy}`}>
            <circle cx={sx} cy={sy} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <line x1={sx - 6} y1={sy} x2={sx + 6} y2={sy} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {[30, 25, 20, 15, 10, 5, 2, 1].map((n, i) => {
          const cx = 360 + (i % 2) * 120;
          const cy = 392 + Math.floor(i / 2) * 72;
          const g = gone(i);
          return (
            <g key={n}>
              <g opacity={1 - g}>
                <circle cx={cx} cy={cy} r={28} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
                <circle cx={cx} cy={cy - 4} r={21} fill="#E3C45C" stroke={KRP.ink} strokeWidth={4} />
                <text x={cx} y={cy + 5} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                  fontSize={26} fill={KRP.ink}>{n}</text>
              </g>
              <circle cx={cx} cy={cy} r={28} fill="none" stroke={KRP.red} strokeWidth={7}
                strokeDasharray="13 11" opacity={g * 0.9} />
            </g>
          );
        })}
      </g>

      {/* 乗客2人 (帽子の紳士・婦人)。消えた板のほうを見ている */}
      <Person x={1060} y={1000} s={1.42} f={f} phase={2} cloth="#4A4A52" clothDark="#32323A"
        face="worried" gaze={[-0.7, -0.1]} />
      <Hat x={1060} y={1000} s={1.42} kind="derby" />
      <Person x={1250} y={1004} s={1.38} f={f} phase={5} cloth="#9C5A74" clothDark="#7B4257"
        face="worried" gaze={[-0.7, -0.1]} />
      <Sweat x={1142} y={706} f={f} n={2} />

      {/* 紳士の手が板へ伸びてくる。でも、もう押すところがない */}
      <g opacity={reach}>
        {/* 袖 (ひじで一度折る。まっすぐだと板きれに見える) */}
        <path d={`M 1170 806 L 923 742 L ${hgx + 96} 578`} fill="none" stroke={KRP.ink}
          strokeWidth={76} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M 1170 806 L 923 742 L ${hgx + 96} 578`} fill="none" stroke="#4A4A52"
          strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
        {/* カフス */}
        <g transform={`translate(${hgx + 92} 574) rotate(-26)`}>
          <rect x={-18} y={-36} width={34} height={72} rx={9} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 手のひらと、押そうとしている人さし指 */}
        <ellipse cx={hgx + 32} cy={552} rx={46} ry={37} fill="#E8C39E" stroke={KRP.ink} strokeWidth={6}
          transform={`rotate(-16 ${hgx + 32} 552)`} />
        <rect x={hgx - 30} y={522} width={70} height={29} rx={14} fill="#E8C39E"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={hgx + 18} y={572} width={52} height={25} rx={12} fill="#E8C39E"
          stroke={KRP.ink} strokeWidth={6} transform={`rotate(20 ${hgx + 44} 584)`} />
      </g>
      {/* ×印は置かない。点線の跡と、空ぶりした手だけで「消えた」は伝わる */}
    </g>

    {/* 札はカメラの外 : 寄っても大きさが変わらない */}
    <TagPlate x={250} y={200} text="1930年代" size={46} t={seg(f, 4, 20)} fill={KRP.white} />
    <TagPlate x={430} y={760} text="押すところが、ない" size={38} t={seg(f, 32, 42)} rot={-3} />
    </g>
  );
};

// =====================================================================
// 文#13 代わりに、行き先を聞いてレバーを操る運転係が現れます。この人がいないと、箱は動きません。
// #12 と同じかごの、運転係の手元。レバーとダイヤルを見せる。
// (寄りすぎだったので 0.9 倍に引いた。背景は引いても隅が切れないよう大きめに敷く)
// 2つのヤマ: 前半=「何階ですか」と行き先を聞く / 後半=その手を丸で囲んで
//            「この人しか、動かせない」。奥に影の乗客を置くと幽霊に見えたので外した。
// =====================================================================
const S13: React.FC<{ f: number }> = ({ f }) => {
  const lev = -26 + Math.sin(f / 22) * 14;
  // 階数の針。上半分の文字盤なので、角度は -90〜+90 の内側に収めないと盤から外れる
  const nd = -70 + ((f * 1.6) % 150);
  const rad = (lev - 90) * Math.PI / 180;
  // レバー台の中心と、握りの位置
  const LX = 820, LY = 880, LL = 300;
  const hx = LX + Math.cos(rad + Math.PI / 2) * 0 + Math.sin(lev * Math.PI / 180) * LL;
  const hy = LY - Math.cos(lev * Math.PI / 180) * LL;
  return (
    <g transform={zoomAt(0.9, 960, 560)}>
      {/* かごの壁 */}
      <rect x={-160} y={-160} width={W + 320} height={H + 320} fill="#A9793F" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M ${110 + i * 200} 0 C ${160 + i * 200} 200, ${70 + i * 200} 360, ${130 + i * 200} 520`}
          fill="none" stroke="#8E6331" strokeWidth={7} opacity={0.6} />
      ))}
      {/* 真鍮の手すり */}
      <rect x={-160} y={520} width={W + 320} height={22} rx={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={70 + i * 340} y={542} width={24} height={42} fill={KRP.brass}
          stroke={KRP.ink} strokeWidth={5} />
      ))}
      <rect x={-160} y={584} width={W + 320} height={316} fill="#916739" />
      {/* 床 */}
      <rect x={-160} y={900} width={W + 320} height={400} fill="#D8CFBC" stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 22 }, (_, i) => (
        <path key={i} d={`M ${-140 + i * 100} 1080 L ${110 + i * 84} 900`}
          stroke={KRP.grayDark} strokeWidth={3} opacity={0.55} />
      ))}
      <line x1={-160} y1={988} x2={W + 160} y2={988} stroke={KRP.grayDark} strokeWidth={3} opacity={0.55} />

      {/* 右端 : 蛇腹格子の一部 */}
      <g>
        <rect x={1600} y={0} width={320} height={900} fill="#5E4A2E" stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.brass} strokeWidth={10}>
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <line x1={1600 + i * 70} y1={0} x2={1600 + i * 70 + 170} y2={900} />
              <line x1={1600 + i * 70} y1={900} x2={1600 + i * 70 + 170} y2={0} />
            </g>
          ))}
        </g>
        <rect x={1600} y={0} width={320} height={900} fill="none" stroke={KRP.ink} strokeWidth={8} />
      </g>

      {/* 階数ダイヤル (壁・大) */}
      <g transform="translate(1310 430)">
        <path d="M -250 0 A 250 250 0 0 1 250 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={10} />
        <path d="M -250 0 A 250 250 0 0 1 250 0" fill="none" stroke={KRP.brass} strokeWidth={14} />
        {Array.from({ length: 21 }, (_, i) => {
          const a = (-180 + i * 9) * Math.PI / 180;
          const big = i % 4 === 0;
          return <line key={i} x1={Math.cos(a) * (big ? 200 : 222)} y1={Math.sin(a) * (big ? 200 : 222)}
            x2={Math.cos(a) * 243} y2={Math.sin(a) * 243} stroke={KRP.ink} strokeWidth={big ? 7 : 4} />;
        })}
        {[0, 6, 12, 18, 24, 30].map((n, i) => {
          const a = (-172 + i * 34.4) * Math.PI / 180;
          return <text key={n} x={Math.cos(a) * 158} y={Math.sin(a) * 158 + 15} textAnchor="middle"
            fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>{n}</text>;
        })}
        <g transform={`rotate(${nd})`}>
          <polygon points="0,0 -11,-28 0,-222 11,-28" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <circle cx={0} cy={0} r={26} fill={KRP.ink} />
      </g>

      {/* 操作レバー。扇形の目盛り板を立てないと、ただの棒きれに見える */}
      <g>
        <ellipse cx={LX} cy={1046} rx={118} ry={28} fill={KRP.ink} opacity={0.16} />
        {/* 台の柱 */}
        <path d={`M ${LX - 62} 1046 L ${LX - 44} ${LY + 6} L ${LX + 44} ${LY + 6} L ${LX + 62} 1046 Z`}
          fill="#8A6A3A" stroke={KRP.ink} strokeWidth={8} />
        <rect x={LX - 54} y={972} width={108} height={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        {/* 扇形の目盛り板 */}
        <path d={`M ${LX - 182} ${LY} A 182 182 0 0 1 ${LX + 182} ${LY} Z`}
          fill="#C99A55" stroke={KRP.ink} strokeWidth={8} />
        <path d={`M ${LX - 182} ${LY} A 182 182 0 0 1 ${LX + 182} ${LY}`}
          fill="none" stroke={KRP.brass} strokeWidth={12} />
        {/* レバーがすべる溝 */}
        <path d={`M ${LX - 148} ${LY} A 148 148 0 0 1 ${LX + 148} ${LY}`}
          fill="none" stroke="#5A3A20" strokeWidth={22} strokeLinecap="round" />
        {[-62, -31, 0, 31, 62].map((d) => {
          const a = (d - 90) * Math.PI / 180;
          return <line key={d} x1={LX + Math.cos(a) * 156} y1={LY + Math.sin(a) * 156}
            x2={LX + Math.cos(a) * 178} y2={LY + Math.sin(a) * 178} stroke={KRP.ink} strokeWidth={6} />;
        })}
        {/* 「停」は真上なのでレバーに隠れる。下・上だけ書く */}
        {([["下", -62], ["上", 62]] as [string, number][]).map(([t, d]) => {
          const a = (d - 90) * Math.PI / 180;
          return (
            <text key={t} x={LX + Math.cos(a) * 116} y={LY + Math.sin(a) * 116 + 14} textAnchor="middle"
              fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>{t}</text>
          );
        })}
        <g transform={`translate(${LX} ${LY}) rotate(${lev})`}>
          <polygon points={`-19,4 19,4 13,${-LL} -13,${-LL}`} fill={KRP.silver}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={-27} y={-LL - 8} width={54} height={80} rx={23} fill="#5A3A20"
            stroke={KRP.ink} strokeWidth={8} />
          <circle cx={0} cy={-LL - 26} r={32} fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
        </g>
        <circle cx={LX} cy={LY} r={24} fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
      </g>

      {/* 係員 */}
      <Person x={430} y={1030} s={2.1} f={f} cloth="#B23B2E" clothDark="#8A2A1F"
        face="smile" gaze={[0.6, 0.1]} />
      <Hat x={430} y={1030} s={2.1} kind="cap" color="#B23B2E" dark="#5A1F18" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={430} cy={728 + i * 56} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* レバーへ伸びる腕 */}
      <g>
        <path d={`M 548 722 L ${hx - 10} ${hy + 6}`} stroke={KRP.ink} strokeWidth={56} strokeLinecap="round" />
        <path d={`M 548 722 L ${hx - 10} ${hy + 6}`} stroke="#B23B2E" strokeWidth={44} strokeLinecap="round" />
        <ellipse cx={hx - 4} cy={hy + 10} rx={44} ry={36} fill="#F2D3B0" stroke={KRP.ink} strokeWidth={8} />
      </g>

      {/* 前半 : 行き先を聞く */}
      <g opacity={seg(f, 4, 20)}>
        <path d="M 150 110 L 1010 110 L 1010 290 L 620 290 L 500 384 L 528 290 L 150 290 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
        <text x={580} y={234} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={92} fill={KRP.ink}>何階ですか</text>
      </g>

      {/* 後半 : レバーを握る手を丸で囲んで、この人しか動かせないと言う */}
      <g opacity={seg(f, 24, 36)}>
        <circle cx={hx - 4} cy={hy + 10} r={122} fill="none" stroke={KRP.red}
          strokeWidth={10} strokeDasharray="26 20" />
      </g>
      <Arrow x={900} y={622} s={1.15} rot={180} t={seg(f, 28, 40)} />
      <TagPlate x={1322} y={622} text="この人しか、動かせない" size={42}
        t={seg(f, 30, 42)} fill={KRP.yellow} rot={-2} />
    </g>
  );
};

// =====================================================================
// 文#14 夜中に帰ってきたら、30階まで、階段です。
// どこ: 1930年代、深夜のロビー。天井の灯りが1つだけ残っている。
// 事件: 蛇腹扉に鎖がかかって「運転 終了」。運転係の丸椅子は空で、帽子だけが残る。
//       #13 で「この人しか動かせない」と言った直後なので、不在がそのまま詰みになる。
// 動き: じわっと寄る。灯りがゆらぐ。住人は荷物を床に置いて、右の暗い階段を見上げる。
// (#9 から階段を外したので、階段が出てくるのはこの1枚だけ)
// =====================================================================
const S14: React.FC<{ f: number }> = ({ f }) => {
  const push = 1 + seg(f, 0, 42) * 0.07;        // じわっと寄る
  const flick = 0.88 + Math.sin(f / 9) * 0.1;   // 灯りのゆらぎ
  const FLOORY = 760;
  return (
    <g transform={zoomAt(push, 960, 520)}>
      <defs>
        <clipPath id="s14door">
          <rect x={152} y={300} width={496} height={460} />
        </clipPath>
        <radialGradient id="s14dark" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#241F1B" stopOpacity="0.88" />
          <stop offset="0.6" stopColor="#241F1B" stopOpacity="0.5" />
          <stop offset="1" stopColor="#241F1B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 夜の壁 (羽目板) */}
      <rect x={-220} y={-220} width={W + 440} height={H + 440} fill="#7C6A51" />
      <rect x={-220} y={-220} width={W + 440} height={360} fill="#68583F" />
      <line x1={-220} y1={140} x2={W + 220} y2={140} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={-120 + i * 172} y1={140} x2={-120 + i * 172} y2={FLOORY}
          stroke="#68583F" strokeWidth={7} opacity={0.6} />
      ))}

      {/* 床 (夜なので市松は沈ませる) */}
      <rect x={-220} y={FLOORY} width={W + 440} height={560} fill="#5A4E3C" />
      {Array.from({ length: 7 }, (_, r) => {
        const y0 = FLOORY + Math.pow(r / 7, 1.7) * 320;
        const y1 = FLOORY + Math.pow((r + 1) / 7, 1.7) * 320;
        const k0 = (y0 - FLOORY) / 320, k1 = (y1 - FLOORY) / 320;
        return (
          <g key={r}>
            {Array.from({ length: 10 }, (_, c) => {
              if ((r + c) % 2 !== 0) return null;
              const s0 = (c - 5) / 5, s1 = (c - 4) / 5;
              return <polygon key={c} fill="#6E6252" opacity={0.6}
                points={`${960 + s0 * (200 + k0 * 1500)},${y0} ${960 + s1 * (200 + k0 * 1500)},${y0} ` +
                  `${960 + s1 * (200 + k1 * 1500)},${y1} ${960 + s0 * (200 + k1 * 1500)},${y1}`} />;
            })}
          </g>
        );
      })}
      <line x1={-220} y1={FLOORY} x2={W + 220} y2={FLOORY} stroke={KRP.ink} strokeWidth={6} />

      {/* 天井の灯り : これ1つだけが残っている */}
      <g transform="translate(960 0)">
        <line x1={0} y1={-80} x2={0} y2={62} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -92 112 q 92 -60 184 0 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={0} cy={130} r={23} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} opacity={flick} />
      </g>
      <polygon points={`930,142 990,142 1300,${FLOORY + 20} 620,${FLOORY + 20}`}
        fill={KRP.yellow} opacity={0.14 * flick} />

      {/* ───── 左 : エレベーターは閉まっている ───── */}
      {/* 階数の針は「1」で止まったまま。かごは下に置き去りにされている */}
      <g transform="translate(400 238)">
        <path d="M -86 0 A 86 86 0 0 1 86 0 Z" fill="#D6CDBA" stroke={KRP.ink} strokeWidth={8} />
        <path d="M -86 0 A 86 86 0 0 1 86 0" fill="none" stroke={KRP.brass} strokeWidth={10} />
        {Array.from({ length: 11 }, (_, i) => {
          const a = (-180 + i * 18) * Math.PI / 180;
          return <line key={i} x1={Math.cos(a) * 64} y1={Math.sin(a) * 64}
            x2={Math.cos(a) * 80} y2={Math.sin(a) * 80} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <g transform="rotate(-84)">
          <polygon points="0,0 -7,-16 0,-74 7,-16" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={0} cy={0} r={13} fill={KRP.ink} />
      </g>

      {/* 蛇腹の格子扉 (枠の中だけに格子を描く) */}
      <rect x={110} y={258} width={580} height={502} rx={8} fill="#A9793F" stroke={KRP.ink} strokeWidth={9} />
      <g clipPath="url(#s14door)">
        <rect x={152} y={300} width={496} height={460} fill="#241F1B" />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i} stroke={KRP.brass} strokeWidth={9} opacity={0.8}>
            <line x1={40 + i * 76} y1={300} x2={40 + i * 76 + 152} y2={760} />
            <line x1={40 + i * 76} y1={760} x2={40 + i * 76 + 152} y2={300} />
          </g>
        ))}
      </g>
      <rect x={152} y={300} width={496} height={460} fill="none" stroke={KRP.ink} strokeWidth={7} />

      {/* 鎖 */}
      <line x1={126} y1={458} x2={674} y2={438} stroke={KRP.ink} strokeWidth={9} />
      {Array.from({ length: 15 }, (_, i) => {
        const cx = 136 + i * 38, cy = 457 - i * 1.4;
        return <ellipse key={i} cx={cx} cy={cy} rx={19} ry={12} fill="none"
          stroke={KRP.silver} strokeWidth={8}
          transform={`rotate(${i % 2 ? 90 : 0} ${cx} ${cy})`} />;
      })}
      <TagPlate x={400} y={566} text="運転 終了" size={54} t={seg(f, 6, 22)} fill={KRP.white} rot={-3} />

      {/* 運転係はもういない : 空の丸椅子に、帽子だけ残っている */}
      <g transform={`translate(760 ${FLOORY})`}>
        <ellipse cx={0} cy={6} rx={80} ry={18} fill={KRP.ink} opacity={0.22} />
        {[-54, 0, 54].map((dx) => (
          <line key={dx} x1={dx * 0.46} y1={-200} x2={dx} y2={0} stroke={KRP.ink} strokeWidth={9} />
        ))}
        <ellipse cx={0} cy={-212} rx={74} ry={22} fill="#7C5A33" stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={0} cy={-226} rx={74} ry={22} fill="#A08A69" stroke={KRP.ink} strokeWidth={8} />
      </g>
      <Hat x={760} y={FLOORY - 234 + 268} s={1} kind="cap" color="#B23B2E" dark="#5A1F18" />

      {/* ───── 右 : 上は闇に消える階段 ───── */}
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const sx = 1150 + t * 470;
        const sw = 300 - t * 172;
        const sy = 752 - i * 46;
        return (
          <g key={i}>
            <rect x={sx} y={sy + 15} width={sw} height={33} fill="#5F5240" stroke={KRP.ink} strokeWidth={5} />
            <rect x={sx} y={sy} width={sw} height={17} fill="#8E7A5E" stroke={KRP.ink} strokeWidth={5} />
          </g>
        );
      })}
      {/* 手すり。段板の左端 (1150+t*470, 752-i*46) の真上 118px に立てる */}
      {[0, 3, 6, 9].map((i) => {
        const sx = 1150 + (i / 12) * 470, sy = 752 - i * 46;
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={sx} y2={sy - 118} stroke={KRP.ink} strokeWidth={14} />
            <line x1={sx} y1={sy} x2={sx} y2={sy - 118} stroke={KRP.brass} strokeWidth={7} />
          </g>
        );
      })}
      <line x1={1150} y1={634} x2={1542} y2={174} stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" />
      <line x1={1150} y1={634} x2={1542} y2={174} stroke={KRP.brass} strokeWidth={10} strokeLinecap="round" />
      <ellipse cx={1716} cy={214} rx={310} ry={240} fill="url(#s14dark)" />

      {/* ───── 中央 : 住人。荷物を床に置いて、階段を見上げる ───── */}
      <ellipse cx={990} cy={876} rx={126} ry={24} fill={KRP.ink} opacity={0.22} />
      <Person x={990} y={872} s={1.9} f={f} cloth={KRP.orange} clothDark="#C06F22"
        face="worried" gaze={[0.2, -0.55]} lean={3} />
      <Sweat x={1086} y={424} f={f} n={2} />
      {/* 足元に置いたかばん (持って上がる気力も出ない) */}
      <g>
        <path d="M 826 770 q 32 -58 64 0" fill="none" stroke={KRP.ink} strokeWidth={9} />
        <rect x={794} y={766} width={128} height={48} rx={8} fill="#6B4A2B" stroke={KRP.ink} strokeWidth={7} />
        <rect x={794} y={780} width={128} height={12} fill="#4E351E" stroke={KRP.ink} strokeWidth={4} />
      </g>

      <TagPlate x={1240} y={286} text="30階ぶん" size={52} t={seg(f, 18, 32)} fill={KRP.yellow} rot={-2} />
      <Arrow x={1540} y={400} s={1.3} rot={-47} t={seg(f, 26, 40)} />
    </g>
  );
};


// =====================================================================
// 文#15 1900年。蛇口から、水が出なくなりました。
// #3 と同じ流しに寄る。金具は真鍮の古い型。しずくが1滴ぶら下がって、止まる。
// =====================================================================
const S15: React.FC<{ f: number }> = ({ f }) => {
  const dz = 1 + Math.sin(f / 18) * 0.06;
  // 床の線。流し台も人も、この線の上に立たせる (人が流しに乗って見えないように)
  const FLOORY = 842;
  return (
    <g>
      {/* 板張りの台所。一歩引いた画角で、流し台ぜんたいが画面に収まるようにしてある。
          見せたいのは「蛇口とその周り」なので、掛け時計・大きな窓・棚いっぱいの器は外し、
          棚は一段だけ・窓は奥に小さく置いて、視線が蛇口に行くようにした。 */}
      <rect x={0} y={0} width={W} height={H} fill="#EADFC8" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={0} y1={60 + i * 62} x2={W} y2={60 + i * 62}
          stroke="#D6C7A8" strokeWidth={5} />
      ))}
      {/* 床 (引いた分、床が見えるので立体に見える) */}
      <rect x={0} y={FLOORY} width={W} height={H - FLOORY} fill="#D8C9A8" />
      <line x1={0} y1={FLOORY} x2={W} y2={FLOORY} stroke={KRP.ink} strokeWidth={8} />
      <g stroke="#C4B392" strokeWidth={5}>
        <line x1={0} y1={920} x2={W} y2={920} />
        <line x1={0} y1={1000} x2={W} y2={1000} />
      </g>

      {/* 奥の小窓 (1900年の空) */}
      <g>
        <rect x={1444} y={180} width={296} height={238} fill="#CFE0EE" stroke={KRP.ink} strokeWidth={8} />
        <line x1={1592} y1={180} x2={1592} y2={418} stroke={KRP.ink} strokeWidth={6} />
        <Cloud x={1524} y={252} s={0.58} op={0.9} />
        <rect x={1444} y={360} width={296} height={58} fill="#C6C9B4" />
        <line x1={1444} y1={360} x2={1740} y2={360} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={1448 + rnd(i + 21) * 278} y={360 - 8 - rnd(i + 3) * 18}
            width={12 + rnd(i + 9) * 12} height={10 + rnd(i + 3) * 20}
            fill="#DAD3C2" stroke={KRP.ink} strokeWidth={2} />
        ))}
      </g>

      {/* 吊り棚 (一段だけ・琺瑯の器3つ) */}
      <g>
        <rect x={190} y={272} width={360} height={26} fill="#B98A5A" stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${250 + i * 120} 272)`}>
            <path d="M -46 0 L -36 -62 L 36 -62 L 46 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-39} y={-72} width={78} height={12} rx={5} fill={KRP.blue} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
      </g>

      {/* 人 : 流し台の左に、床に立って蛇口を見ている */}
      <ellipse cx={282} cy={850} rx={80} ry={19} fill={KRP.ink} opacity={0.14} />
      <Person x={282} y={FLOORY} s={1.12} f={f} cloth={KRP.blueSoft} clothDark={KRP.blue}
        face="worried" gaze={[0.8, 0.1]} />
      <Sweat x={376} y={566} f={f} n={3} />

      {/* 石の流し台 (左右とも画面に収まる = 引いた画 ) */}
      <g>
        <ellipse cx={960} cy={844} rx={490} ry={20} fill={KRP.ink} opacity={0.13} />
        <rect x={470} y={560} width={980} height={64} rx={10} fill="#C9C2B2" stroke={KRP.ink} strokeWidth={8} />
        <rect x={500} y={624} width={920} height={218} fill="#A9793F" stroke={KRP.ink} strokeWidth={8} />
        {[0, 1].map((i) => (
          <rect key={i} x={530 + i * 460} y={660} width={400} height={148} rx={8}
            fill="#B98A5A" stroke={KRP.ink} strokeWidth={7} />
        ))}
        {[0, 1].map((i) => (
          <circle key={i} cx={898 + i * 124} cy={734} r={17} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 流しの桶 */}
        <ellipse cx={880} cy={604} rx={220} ry={40} fill="#8E8A80" stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={880} cy={596} rx={220} ry={40} fill="#D4CEC0" stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={880} cy={604} rx={32} ry={9} fill="#6E6A62" stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* 真鍮の古い蛇口 (この絵の主役) */}
      <g>
        <path d="M 790 572 L 790 418 q 0 -60 70 -60 l 62 0"
          fill="none" stroke={KRP.brass} strokeWidth={38} strokeLinecap="round" />
        <path d="M 790 572 L 790 418 q 0 -60 70 -60 l 62 0"
          fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        <rect x={896} y={338} width={30} height={40} rx={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
        {/* ハンドルと管をつなぐ枝 */}
        <rect x={700} y={402} width={100} height={34} rx={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
        {/* 十字ハンドル */}
        <g transform="translate(706 418) rotate(-14) scale(0.84)">
          <rect x={-14} y={-96} width={28} height={110} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
          <g transform="translate(0 -104)">
            {[0, 1].map((i) => (
              <rect key={i} x={-58} y={-11} width={116} height={22} rx={10} fill={KRP.brass}
                stroke={KRP.ink} strokeWidth={7} transform={`rotate(${i * 90})`} />
            ))}
            <circle cx={0} cy={0} r={18} fill="#E3C45C" stroke={KRP.ink} strokeWidth={6} />
          </g>
        </g>
      </g>
      {/* 1滴だけ (落ちない) */}
      <g transform={`translate(911 394) scale(${dz})`}>
        <path d="M 0 -26 C 22 2, 22 26, 0 32 C -22 26, -22 2, 0 -26 Z"
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <XMark x={1200} y={442} s={1.5} t={seg(f, 10, 28)} />

      {/* 空のバケツ (床に置く) */}
      <g transform="translate(1640 775) scale(0.78)">
        <ellipse cx={0} cy={92} rx={120} ry={26} fill={KRP.ink} opacity={0.14} />
        <path d="M -108 -70 L -86 86 L 86 86 L 108 -70 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={0} cy={-70} rx={108} ry={26} fill="#E3E6E8" stroke={KRP.ink} strokeWidth={8} />
        <path d="M -102 -76 q 102 -128 204 0" fill="none" stroke={KRP.ink} strokeWidth={9} />
      </g>

      <TagPlate x={1180} y={740} text="1900年" size={48} t={seg(f, 2, 20)} fill={KRP.white} />
    </g>
  );
};

// =====================================================================
// 文#16 水道の圧力が、30階まで届かないんです。
// ビルの断面図。立ち上がり管の水が6階で止まる。地上に本管と作業員。
// =====================================================================
const S16: React.FC<{ f: number }> = ({ f }) => {
  const TOPY = 170, BOTY = 880, FLOORS = 30;
  const fy = (n: number) => BOTY - (n / FLOORS) * (BOTY - TOPY);
  const lvl = fy(6) + Math.sin(f / 13) * 4;
  return (
    <g>
      {/* 空と地面 */}
      <rect x={0} y={0} width={W} height={H} fill="#DCE8F2" />
      <rect x={0} y={0} width={W} height={260} fill="#C8DCEE" />
      <Cloud x={1560} y={190} s={1.4} op={0.85} />
      <Cloud x={300} y={150} s={1.0} op={0.8} />
      <rect x={0} y={880} width={W} height={200} fill="#C8A86E" stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={rnd(i + 61) * W} cy={916 + rnd(i + 11) * 150} r={4 + rnd(i + 5) * 7}
          fill="#A3864F" opacity={0.5} />
      ))}

      {/* ビルの断面 */}
      <g>
        <rect x={520} y={TOPY} width={760} height={BOTY - TOPY} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={9} />
        {Array.from({ length: FLOORS }, (_, i) => (
          <line key={i} x1={520} y1={fy(i + 1)} x2={1280} y2={fy(i + 1)}
            stroke={KRP.gray} strokeWidth={2.5} />
        ))}
        {/* 各階の部屋 (右半分) */}
        {Array.from({ length: FLOORS }, (_, i) => (
          <rect key={i} x={960} y={fy(i + 1) + 3} width={240} height={(BOTY - TOPY) / FLOORS - 9}
            fill={i < 6 ? KRP.blueSoft : "#F3F1EA"} stroke={KRP.gray} strokeWidth={2} />
        ))}
        {/* 屋根 */}
        <path d="M 520 170 L 900 96 L 1280 170 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={8} />
      </g>

      {/* 階数の目盛 */}
      {[1, 6, 10, 20, 30].map((n) => (
        <g key={n}>
          <line x1={440} y1={fy(n)} x2={520} y2={fy(n)} stroke={KRP.ink} strokeWidth={5} />
          <text x={424} y={fy(n) + 14} textAnchor="end" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={KRP.ink}>{n}F</text>
        </g>
      ))}

      {/* 立ち上がり管 */}
      <g>
        <rect x={680} y={TOPY + 20} width={74} height={BOTY - TOPY - 20} rx={8}
          fill="#E6E2D8" stroke={KRP.ink} strokeWidth={8} />
        {/* 水 (6階まで) */}
        <rect x={688} y={lvl} width={58} height={BOTY - lvl - 4} fill={KPPMizu} opacity={0.9} />
        <path d={`M 688 ${lvl} q 14 -12 29 0 q 15 12 29 0 l 0 10 l -58 0 Z`} fill={KPPMizu} />
        <rect x={680} y={TOPY + 20} width={74} height={BOTY - TOPY - 20} rx={8}
          fill="none" stroke={KRP.ink} strokeWidth={8} />
        {/* 止まった水面の点線 */}
        <line x1={420} y1={lvl} x2={1700} y2={lvl} stroke={KRP.red} strokeWidth={6}
          strokeDasharray="22 16" />
      </g>
      {/* 届かない高さ (点線) */}
      <line x1={1300} y1={fy(30)} x2={1700} y2={fy(30)} stroke={KRP.grayDark} strokeWidth={5}
        strokeDasharray="16 12" />
      <g stroke={KRP.red} strokeWidth={7} fill="none" strokeLinecap="round">
        <line x1={1620} y1={lvl - 10} x2={1620} y2={fy(30) + 10} />
        <polyline points="1600,214 1620,184 1640,214" />
      </g>
      <TagPlate x={1620} y={370} text="届かない" size={44} t={seg(f, 12, 30)} fill={KRP.white} color={KRP.red} />
      <Arrow x={880} y={lvl} s={1.2} rot={180} t={seg(f, 6, 24)} />
      <TagPlate x={1020} y={lvl + 76} text="6階で止まる" size={44} t={seg(f, 16, 34)} fill={KRP.yellow} />

      {/* 地面の下 : 本管 */}
      <g>
        <rect x={0} y={960} width={W} height={70} rx={18} fill="#E6E2D8" stroke={KRP.ink} strokeWidth={8} />
        <rect x={10} y={972} width={W - 20} height={46} fill={KPPMizu} opacity={0.85} />
        {Array.from({ length: 6 }, (_, i) => {
          const x = ((f * 5 + i * 320) % (W + 200)) - 100;
          return <path key={i} d={`M ${x} 995 l 46 0`} stroke={KRP.white} strokeWidth={7}
            strokeLinecap="round" opacity={0.7} />;
        })}
        <rect x={700} y={884} width={34} height={80} fill="#E6E2D8" stroke={KRP.ink} strokeWidth={8} />
      </g>
      {/* 作業員と圧力計 */}
      <Person x={260} y={880} s={1.15} f={f} cloth={KRP.orange} clothDark="#B96F22"
        helmet face="worried" gaze={[0.5, -0.3]} />
      <g transform="translate(420 760)">
        <circle cx={0} cy={0} r={72} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={0} cy={0} r={72} fill="none" stroke={KRP.brass} strokeWidth={10} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = (-210 + i * 30) * Math.PI / 180;
          return <line key={i} x1={Math.cos(a) * 50} y1={Math.sin(a) * 50}
            x2={Math.cos(a) * 64} y2={Math.sin(a) * 64} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <g transform={`rotate(${-122 + Math.sin(f / 15) * 6})`}>
          <polygon points="0,0 -6,-14 0,-58 6,-14" fill={KRP.red} />
        </g>
        <circle cx={0} cy={0} r={11} fill={KRP.ink} />
        <rect x={-10} y={72} width={20} height={118} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <TagPlate x={1500} y={720} text="1900年" size={48} t={seg(f, 2, 20)} fill={KRP.white} />
    </g>
  );
};

// =====================================================================
// 文#17 1880年。電気が消えて、灯りはガスの火に。
// 暗い室内。天井の電球が消え、壁のガス灯の炎だけが残る。壁に大きな影。
// =====================================================================
const S17: React.FC<{ f: number }> = ({ f }) => {
  const fl = 1 + Math.sin(f / 5) * 0.09 + Math.sin(f / 2.3) * 0.05;
  const off = seg(f, 6, 24);
  return (
    <g>
      {/* 暗い部屋 */}
      <rect x={0} y={0} width={W} height={H} fill="#3A3228" />
      <rect x={0} y={820} width={W} height={260} fill="#2C2218" />
      <line x1={0} y1={820} x2={W} y2={820} stroke="#1E1812" strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-120 + i * 260} y1={1080} x2={180 + i * 210} y2={820}
          stroke="#211A12" strokeWidth={5} />
      ))}
      {/* 窓 : 1880年の夜の街 (点々のガス灯) */}
      <g>
        <rect x={1180} y={150} width={620} height={560} fill="#1D232E" stroke="#6A5A44" strokeWidth={9} />
        <line x1={1490} y1={150} x2={1490} y2={710} stroke="#6A5A44" strokeWidth={7} />
        <line x1={1180} y1={430} x2={1800} y2={430} stroke="#6A5A44" strokeWidth={7} />
        <rect x={1188} y={520} width={604} height={182} fill="#141A22" />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={1192 + rnd(i + 41) * 580} y={520 - 8 - rnd(i + 7) * 60}
            width={18 + rnd(i + 13) * 26} height={20 + rnd(i + 3) * 60}
            fill="#20262F" stroke="#39414D" strokeWidth={2} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={1200 + rnd(i + 81) * 580} cy={560 + rnd(i + 23) * 130}
            r={4 + rnd(i + 5) * 4} fill={KRP.yellow}
            opacity={0.5 + Math.sin((f + i * 17) / 9) * 0.25} />
        ))}
        <circle cx={1700} cy={236} r={44} fill="#E8E2CC" opacity={0.9} />
      </g>

      {/* 消えた電球 */}
      <g transform="translate(-310 -95) scale(1.5)">
        <line x1={620} y1={0} x2={620} y2={190} stroke="#7E7362" strokeWidth={8} />
        <g>
          <path d="M 586 190 q 34 -46 68 0 q 0 66 -34 74 q -34 -8 -34 -74 Z"
            fill={off > 0.5 ? "#5E584C" : KRP.yellow} stroke="#A79A82" strokeWidth={7} />
          <path d="M 604 232 q 16 -16 32 0" fill="none" stroke="#A79A82" strokeWidth={5} />
          <rect x={602} y={176} width={36} height={24} rx={6} fill="#8A7652" stroke="#A79A82" strokeWidth={6} />
        </g>
        <g opacity={off} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round">
          <line x1={520} y1={232} x2={470} y2={200} />
          <line x1={720} y1={232} x2={770} y2={200} />
          <line x1={620} y1={310} x2={620} y2={356} />
        </g>
      </g>
      <XMark x={800} y={300} s={1.6} t={seg(f, 14, 32)} />

      {/* 壁のガス灯 */}
      <g transform="translate(240 500) scale(1.25)">
        <rect x={-14} y={-20} width={28} height={300} fill="#8A7652" stroke="#C0AF8C" strokeWidth={6} />
        <path d="M -16 -20 q 16 -40 60 -40 l 54 0" fill="none" stroke="#8A7652" strokeWidth={22} strokeLinecap="round" />
        {/* ホヤ (ガラス) */}
        <g transform="translate(110 -84)">
          <path d="M -46 36 q -14 -90 46 -120 q 60 30 46 120 Z" fill="#E8EEF2" opacity={0.16} />
          <path d="M -46 36 q -14 -90 46 -120 q 60 30 46 120 Z" fill="none"
            stroke="#EAF1F6" strokeWidth={9} opacity={0.9} />
          <ellipse cx={0} cy={38} rx={48} ry={13} fill="#A98F5E" stroke="#D8C9A6" strokeWidth={6} />
          {/* 炎 */}
          <g transform={`translate(0 24) scale(${fl})`}>
            <path d="M 0 0 C -24 -20, -20 -58, 0 -84 C 20 -58, 24 -20, 0 0 Z"
              fill={KRP.yellow} stroke="#C58F20" strokeWidth={4} />
            <path d="M 0 -4 C -11 -20, -9 -42, 0 -58 C 9 -42, 11 -20, 0 -4 Z" fill="#FFF3C2" />
          </g>
        </g>
        {/* 光の輪 */}
        <circle cx={110} cy={-60} r={300} fill={KRP.yellow} opacity={0.08 * fl} />
        <circle cx={110} cy={-60} r={170} fill={KRP.yellow} opacity={0.10 * fl} />
      </g>

      {/* 壁に落ちる大きな影 */}
      <g opacity={0.5}>
        <ellipse cx={1080} cy={470} rx={150} ry={168} fill="#1E1812" />
        <rect x={930} y={470} width={300} height={360} fill="#1E1812" />
      </g>

      {/* 人 : 炎に照らされる */}
      <Person x={820} y={880} s={1.75} f={f} cloth="#C79A52" clothDark="#9A7336"
        face="surprised" gaze={[-0.6, 0]} />
      <circle cx={820} cy={482} r={118} fill={KRP.yellow} opacity={0.18} />

      {/* 近景 : マッチ箱と燭台 */}
      <g transform="translate(1430 980)">
        <rect x={-110} y={-56} width={220} height={112} rx={10} fill="#8A5A3A" stroke="#1E1812" strokeWidth={7} />
        <rect x={-80} y={-30} width={160} height={60} rx={6} fill="#C9A86A" stroke="#1E1812" strokeWidth={5} />
        <circle cx={0} cy={0} r={18} fill={KRP.red} opacity={0.8} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${160 + i * 40} ${20 - i * 6}) rotate(${-20 + i * 16})`}>
            <rect x={-6} y={-54} width={12} height={108} rx={5} fill="#D8C79A" stroke="#1E1812" strokeWidth={4} />
            <circle cx={0} cy={-58} r={11} fill={KRP.red} stroke="#1E1812" strokeWidth={4} />
          </g>
        ))}
      </g>
      <TagPlate x={1480} y={778} text="1880年" size={46} t={seg(f, 2, 20)} fill={KRP.white} />
    </g>
  );
};

// =====================================================================
// 文#18 そして1850年。足元の床が、消えます。
// 室内。床板が手前から1枚ずつ消え、下は空。人は最後の一枚に立つ。
// =====================================================================
const S18: React.FC<{ f: number }> = ({ f }) => {
  const EDGE = 620 + easeOut(clamp01(f / 34)) * 540; // 床の切れ目が右へ進む
  return (
    <g>
      {/* ---- 床の下 = 空 (まず全面に空を敷く) ---- */}
      <rect x={0} y={0} width={W} height={H} fill="#CBE0F0" />
      <rect x={0} y={740} width={W} height={200} fill="#B6D2E8" />
      {/* はるか下の地面 */}
      <rect x={0} y={1004} width={W} height={76} fill="#C3C6AE" />
      <line x1={0} y1={1004} x2={W} y2={1004} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      {Array.from({ length: 56 }, (_, i) => {
        const d = rnd(i + 71);
        const x = rnd(i + 17) * W;
        const h = lerp(46, 9, d);
        return <rect key={i} x={x} y={1004 - 3 - h} width={lerp(32, 7, d)} height={h}
          fill="#DCD6C6" stroke={KRP.ink} strokeWidth={1.6} opacity={lerp(0.9, 0.3, d)} />;
      })}
      <Cloud x={560} y={900} s={1.0} op={0.8} />
      <Cloud x={1520} y={856} s={0.8} op={0.7} />
      {/* 鳥 (足元を飛ぶ) */}
      {[0, 1].map((i) => (
        <path key={i} d={`M ${1040 + i * 260 + ((f * 2) % 160)} ${830 + i * 48} q 24 -22 46 0 q 22 -22 46 0`}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      ))}

      {/* ---- 部屋 (壁と窓は残っている) ---- */}
      <rect x={0} y={0} width={W} height={740} fill={KRP.cream} />
      <WinWall x={1180} y={130} w={660} h={520}>
        <rect x={1180} y={130} width={660} height={520} fill="#CFE4F2" />
        <rect x={1180} y={130} width={660} height={150} fill="#B9D7EE" />
        <Cloud x={1360} y={290} s={1.1} />
        <Cloud x={1720} y={400} s={0.8} op={0.8} />
        <rect x={1180} y={566} width={660} height={84} fill="#C9CCB2" />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={1184 + rnd(i + 31) * 640} y={566 - 5 - rnd(i + 9) * 20}
            width={12 + rnd(i + 5) * 12} height={9 + rnd(i + 3) * 22}
            fill="#DED6C4" stroke={KRP.ink} strokeWidth={2} opacity={0.8} />
        ))}
      </WinWall>
      {/* 壁の額 */}
      <g transform="translate(260 280)">
        <rect x={-110} y={-130} width={220} height={260} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-84} y={-104} width={168} height={208} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -84 104 L -10 -10 L 40 50 L 84 10 L 84 104 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 幅木 */}
      <rect x={0} y={700} width={W} height={40} fill="#C8BBA0" stroke={KRP.ink} strokeWidth={6} />

      {/* ---- 残っている床 (左側だけ) ---- */}
      <g>
        <path d={`M 0 740 L ${EDGE} 740 L ${EDGE - 36} 784 L ${EDGE - 4} 826
          L ${EDGE - 70} 862 L ${EDGE - 36} 904 L ${EDGE - 120} 940
          L ${EDGE - 86} 1000 L ${EDGE - 170} 1080 L 0 1080 Z`}
          fill={KRP.floor} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={0} y1={782 + i * 42} x2={EDGE - 40 - i * 16} y2={782 + i * 42}
            stroke="#C2AE83" strokeWidth={5} />
        ))}
        {/* 折れた根太 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={EDGE - 44 + i * 10} y={800 + i * 96} width={110} height={22}
            fill="#BFA476" stroke={KRP.ink} strokeWidth={6}
            transform={`rotate(${8 + i * 7} ${EDGE} ${810 + i * 96})`} />
        ))}
      </g>
      {/* 元の床の位置 (赤い点線) */}
      <line x1={0} y1={742} x2={W} y2={742} stroke={KRP.red} strokeWidth={6} strokeDasharray="24 18" opacity={0.9} />

      {/* 落ちていく床板と椅子 */}
      {[0, 1, 2].map((i) => {
        const t = clamp01((f - 4 - i * 8) / 40);
        if (t <= 0) return null;
        return (
          <g key={i} transform={`translate(${1250 + i * 230} ${760 + t * t * 300}) rotate(${t * (i % 2 ? 76 : -62)})`}
            opacity={1 - t * 0.45}>
            <rect x={-120} y={-15} width={240} height={30} fill={KRP.floor} stroke={KRP.ink} strokeWidth={6} />
          </g>
        );
      })}
      <g transform={`translate(1680 ${800 + clamp01((f - 8) / 34) * 190}) rotate(${clamp01((f - 8) / 34) * 124})`}
        opacity={1 - clamp01((f - 8) / 34) * 0.3}>
        <rect x={-60} y={-20} width={120} height={22} fill="#A9793F" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={-130} width={22} height={112} fill="#A9793F" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-54} y={2} width={18} height={80} fill="#A9793F" stroke={KRP.ink} strokeWidth={5} />
        <rect x={36} y={2} width={18} height={80} fill="#A9793F" stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ---- 床のきわに立つ人 ---- */}
      <ellipse cx={EDGE - 290} cy={884} rx={110} ry={22} fill={KRP.ink} opacity={0.14} />
      <Person x={EDGE - 290} y={880} s={1.7} f={f} cloth={KRP.orange} clothDark="#B96F22"
        face="surprised" gaze={[0.55, 0.45]} lean={-5} />
      <Sweat x={EDGE - 200} y={560} f={f} n={3} />

      <TagPlate x={430} y={620} text="1850年" size={48} t={seg(f, 2, 20)} fill={KRP.white} />
      <TagPlate x={1430} y={776} text="床が、ない" size={48} t={seg(f, 18, 36)} fill={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#19 この高さに建物を建てる方法が、まだありません。
// 1850年の煉瓦の街を引きで。最高でも6階。点線で30階の高さを示し、石工が見上げる。
// =====================================================================
const S19: React.FC<{ f: number }> = ({ f }) => {
  const TOP = 150;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#DCE8F2" />
      <rect x={0} y={0} width={W} height={300} fill="#C6DAEC" />
      <Cloud x={420} y={200} s={1.5} op={0.9} />
      <Cloud x={1420} y={150} s={1.9} op={0.9} />
      {/* 遠景の街 (低い) */}
      {Array.from({ length: 30 }, (_, i) => {
        const d = rnd(i + 91);
        const x = rnd(i + 23) * W;
        const h = lerp(130, 40, d);
        return <rect key={i} x={x} y={700 - h} width={lerp(90, 36, d)} height={h}
          fill="#CBC3B2" stroke={KRP.ink} strokeWidth={2} opacity={lerp(0.85, 0.3, d)} />;
      })}
      {/* 煉瓦の街並み (最高6階) */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = -40 + i * 340;
        const fl = 4 + Math.round(rnd(i + 3) * 2);
        const h = fl * 86;
        const y = 860 - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={300} height={h} fill={i % 2 ? "#C98466" : "#B87456"}
              stroke={KRP.ink} strokeWidth={7} />
            <rect x={x - 12} y={y - 22} width={324} height={26} fill="#9E5F44" stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: fl }, (_, r) =>
              [0, 1, 2].map((c) => (
                <rect key={`${r}-${c}`} x={x + 36 + c * 86} y={y + 28 + r * 86}
                  width={52} height={58} rx={4} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
              ))
            )}
            {/* 煙突 */}
            <rect x={x + 212} y={y - 86} width={36} height={66} fill="#9E5F44" stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 3 }, (_, k) => (
              <circle key={k} cx={x + 232 + Math.sin((f + k * 24) / 14) * 12} cy={y - 100 - k * 34}
                r={14 + k * 7} fill={KRP.gray} opacity={0.38 - k * 0.09} />
            ))}
          </g>
        );
      })}
      {/* 石畳 */}
      <rect x={0} y={860} width={W} height={220} fill="#BFB8A8" stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          <line x1={0} y1={892 + r * 36} x2={W} y2={892 + r * 36} stroke="#A49C8C" strokeWidth={3} />
          {Array.from({ length: 14 }, (_, c) => (
            <line key={c} x1={(r % 2 ? 70 : 0) + c * 148} y1={892 + r * 36}
              x2={(r % 2 ? 70 : 0) + c * 148} y2={928 + r * 36} stroke="#A49C8C" strokeWidth={3} />
          ))}
        </g>
      ))}

      {/* 30階の高さ = 点線のゴースト */}
      <g>
        <rect x={640} y={TOP} width={300} height={430} fill="none" stroke={KRP.red}
          strokeWidth={6} strokeDasharray="22 16" opacity={0.85} />
        <line x1={640} y1={TOP} x2={1760} y2={TOP} stroke={KRP.red} strokeWidth={5}
          strokeDasharray="18 14" opacity={0.8} />
        <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" fill="none">
          <line x1={1700} y1={TOP + 16} x2={1700} y2={600} />
          <polyline points="1680,176 1700,144 1720,176" />
          <polyline points="1680,580 1700,612 1720,580" />
        </g>
        <TagPlate x={1700} y={380} text="30階" size={46} t={seg(f, 10, 28)} fill={KRP.white} color={KRP.red} rot={-90} />
      </g>
      <XMark x={790} y={330} s={2.1} t={seg(f, 16, 34)} />

      {/* 見上げる石工 */}
      <g>
        <Person x={560} y={1010} s={1.6} f={f} cloth="#8E7A58" clothDark="#6B5B40"
          face="surprised" gaze={[0.2, -0.5]} />
        <Hat x={560} y={1010} s={1.6} kind="derby" color="#6B5B40" dark="#4A3E2B" />
        {/* つるはしと石材 */}
        <g transform="translate(770 1010) rotate(-16)">
          <rect x={-10} y={-230} width={20} height={230} rx={8} fill="#A9793F" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -66 -232 q 66 -36 132 0 q -66 22 -132 0 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        </g>
        <g>
          <rect x={330} y={940} width={150} height={70} fill="#D6CFBE" stroke={KRP.ink} strokeWidth={6} />
          <rect x={360} y={880} width={150} height={62} fill="#E0D9C8" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 馬車 */}
      <g transform={`translate(${1230 + ((f * 3) % 500)} 980)`}>
        <rect x={-120} y={-120} width={200} height={104} rx={10} fill="#6E5B46" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-96} y={-104} width={64} height={54} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-86} cy={-8} r={42} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <circle cx={44} cy={-8} r={42} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <path d="M 80 -80 l 90 -14" stroke={KRP.ink} strokeWidth={7} />
        <g transform="translate(220 -14)">
          <ellipse cx={0} cy={-62} rx={76} ry={44} fill="#8A5A3A" stroke={KRP.ink} strokeWidth={7} />
          <path d="M 60 -92 q 46 -22 54 10 q -26 18 -54 6 Z" fill="#8A5A3A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-56} y={-20} width={20} height={20} fill="#8A5A3A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={34} y={-20} width={20} height={20} fill="#8A5A3A" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      <YearPost x={210} y={790} text="1850年" t={seg(f, 2, 20)} rot={-4} s={0.95} />
    </g>
  );
};


// =====================================================================
// 文#20 あなたの部屋は、空中にありました。
// 引きの空。部屋だけが高いところに浮き、はるか下に1850年の煉瓦の街。
// =====================================================================
// 空中の「あなたの部屋」。#20 と #22 で同じ物を使う (同じ物は同じ見た目にする)。
const AirRoom: React.FC<{ f: number; floor?: boolean }> = ({ f, floor = true }) => (
  <g>
    {/* 立体 (側面・天面) */}
    <polygon points="560,0 700,-86 700,318 560,404" fill="#BDB5A2" stroke={KRP.ink} strokeWidth={7} />
    <polygon points="0,0 140,-86 700,-86 560,0" fill="#DDD5C3" stroke={KRP.ink} strokeWidth={7} />
    <rect x={0} y={0} width={560} height={404} fill={KRP.cream} stroke={KRP.ink} strokeWidth={8} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={6} y1={96 + i * 98} x2={554} y2={96 + i * 98} stroke="#E6DCC8" strokeWidth={6} />
    ))}
    {/* 窓 */}
    <rect x={52} y={52} width={300} height={168} fill="#BFD9EC" stroke={KRP.ink} strokeWidth={7} />
    <line x1={202} y1={52} x2={202} y2={220} stroke={KRP.ink} strokeWidth={6} />
    <rect x={38} y={220} width={328} height={16} fill="#CFC6AE" stroke={KRP.ink} strokeWidth={5} />
    {/* 壁の額 */}
    <rect x={428} y={72} width={94} height={76} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <path d="M 440 136 l 26 -36 l 22 26 l 16 -18 l 16 28 z" fill={KRP.green} />
    {/* ソファ */}
    <rect x={300} y={248} width={212} height={46} rx={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
    <rect x={296} y={286} width={220} height={74} rx={14} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
    {/* 住人 */}
    <Person x={168} y={380} s={0.82} f={f} cloth={KRP.orange} clothDark="#B96F22"
      face="surprised" gaze={[0.3, 0.45]} />
    {/* 床板 */}
    {floor ? (
      <g>
        <rect x={0} y={378} width={560} height={26} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
        {[1, 2, 3, 4].map((i) => (
          <line key={i} x1={i * 112} y1={378} x2={i * 112} y2={404} stroke="#B9A47A" strokeWidth={4} />
        ))}
      </g>
    ) : (
      <g>
        {/* 床が無い = 折れた根太だけ残る */}
        <polyline points="0,378 46,404 92,372 138,404 186,374 232,404 280,376 328,404 376,374 424,404 472,376 520,404 560,378"
          fill="none" stroke={KRP.ink} strokeWidth={7} />
        <line x1={0} y1={378} x2={560} y2={378} stroke={KRP.red} strokeWidth={6} strokeDasharray="22 16" opacity={0.85} />
      </g>
    )}
    {/* ちぎれた配管 */}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${108 + i * 170} 404 q ${i % 2 ? 28 : -28} 54 ${i % 2 ? 12 : -12} 104`}
        fill="none" stroke={KRP.gray} strokeWidth={14} strokeLinecap="round" />
    ))}
  </g>
);

const S20: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f / 26) * 9;
  const RX = 520, RY = 250 + bob;
  const BOT = RY + 404;
  return (
    <g>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={H} fill="#CFE2F1" />
      <rect x={0} y={0} width={W} height={300} fill="#AFCDE7" />
      <Cloud x={1620} y={176} s={1.7} op={0.9} />
      <Cloud x={300} y={142} s={1.1} op={0.8} />

      {/* はるか下 : 1850年の煉瓦の街 */}
      <rect x={0} y={898} width={W} height={182} fill="#C4BCA8" />
      <rect x={0} y={898} width={W} height={46} fill="#CFC7B3" opacity={0.8} />
      <line x1={0} y1={898} x2={W} y2={898} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
      {/* 川 */}
      <path d="M -20 988 q 320 -34 640 8 q 330 44 700 -16 q 300 -48 620 4 l 0 110 l -1960 0 z"
        fill="#A9C4D4" opacity={0.65} />
      {/* 道 */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={240 + i * 560} y1={1080} x2={360 + i * 560} y2={900}
          stroke="#D6CEBA" strokeWidth={14} opacity={0.8} />
      ))}
      {Array.from({ length: 86 }, (_, i) => {
        const d = rnd(i + 101);
        const x = rnd(i + 37) * W;
        const h = lerp(74, 12, d);
        const w = lerp(52, 10, d);
        const by = lerp(1010, 902, d);
        return (
          <g key={i} opacity={lerp(0.95, 0.35, d)}>
            <rect x={x} y={by - h} width={w} height={h}
              fill={rnd(i + 5) > 0.5 ? "#C08263" : "#A9735A"} stroke={KRP.ink} strokeWidth={1.8} />
            <rect x={x - 3} y={by - h - 5} width={w + 6} height={6} fill="#8E5A42" />
            {d < 0.4 && <rect x={x + w * 0.6} y={by - h - 16} width={5} height={14} fill="#8E5A42" />}
          </g>
        );
      })}
      {/* もや (遠さ) */}
      <rect x={0} y={860} width={W} height={90} fill="#DCE8EE" opacity={0.55} />

      {/* 部屋より下の雲 = 高さの証拠 */}
      <Cloud x={430} y={744} s={1.5} op={0.95} />
      <Cloud x={1430} y={800} s={1.2} op={0.9} />
      <Cloud x={980} y={862} s={0.85} op={0.8} />
      {/* 鳥 (部屋より下) */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i}
          d={`M ${300 + i * 380 + ((f * 2.4) % 180)} ${700 + ((i * 53) % 110)} q 20 -18 38 0 q 18 -18 38 0`}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      ))}

      {/* 浮いている部屋 */}
      <g transform={`translate(${RX} ${RY})`}><AirRoom f={f} /></g>

      {/* 高さの赤い点線 */}
      <g stroke={KRP.red} strokeWidth={6} opacity={0.9}>
        <line x1={1420} y1={BOT + 10} x2={1420} y2={892} strokeDasharray="24 18" />
        <line x1={1270} y1={BOT + 10} x2={1560} y2={BOT + 10} strokeDasharray="18 14" />
        <g fill="none" strokeLinecap="round">
          <polyline points={`1400,${BOT + 46} 1420,${BOT + 14} 1440,${BOT + 46}`} />
          <polyline points="1400,856 1420,888 1440,856" />
        </g>
      </g>
      <TagPlate x={1640} y={772} text="空中" size={54} t={seg(f, 10, 28)} fill={KRP.white} color={KRP.red} />

      {/* 近景 : 手前を横切る雲 (切れて入る) */}
      <Cloud x={120} y={1150} s={2.2} op={0.95} />
      <Cloud x={1840} y={1130} s={1.8} op={0.9} />

      <Arrow x={1300} y={286} rot={180} s={0.9} t={seg(f, 16, 32)} />
      <TagPlate x={1560} y={286} text="あなたの部屋" size={46} t={seg(f, 18, 36)} fill={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#21 いま、柱を5本抜きました。
// 自分で作った夕空の上に、5本柱の装置を置く。柱はぜんぶ抜けて画面下に山になる。
// =====================================================================
const S21: React.FC<{ f: number }> = ({ f }) => {
  const pull = clamp01(f / 30);
  const seats = [380, 670, 960, 1250, 1540];
  return (
    <g>
      {/* 夕空 */}
      <rect x={0} y={0} width={W} height={H} fill="#F0D9B8" />
      <rect x={0} y={0} width={W} height={330} fill="#E0B991" />
      <rect x={0} y={330} width={W} height={300} fill="#F3E2C6" />
      <circle cx={1700} cy={290} r={92} fill={KRP.yellow} opacity={0.8} />
      <circle cx={1700} cy={290} r={150} fill={KRP.yellow} opacity={0.18} />
      <Cloud x={400} y={200} s={1.5} op={0.55} />
      <Cloud x={1200} y={150} s={1.0} op={0.5} />
      {/* 遠くの街のシルエット */}
      {Array.from({ length: 60 }, (_, i) => {
        const d = rnd(i + 131);
        const x = rnd(i + 59) * W;
        const h = lerp(170, 36, d);
        return <rect key={i} x={x} y={902 - h} width={lerp(80, 22, d)} height={h}
          fill="#C8A98A" opacity={lerp(0.9, 0.28, d)} />;
      })}
      <rect x={0} y={900} width={W} height={180} fill="#C9B08C" stroke={KRP.ink} strokeWidth={6} />

      {/* 柱が在った場所 (点線の跡) */}
      <g opacity={seg(f, 12, 30) * 0.85}>
        {seats.map((x) => (
          <g key={x}>
            <rect x={x - 62} y={552} width={124} height={272} rx={6} fill="none"
              stroke={KRP.red} strokeWidth={6} strokeDasharray="20 16" />
            <XMark x={x} y={688} s={0.62} t={seg(f, 18, 34)} />
          </g>
        ))}
      </g>

      {/* 装置 : 柱をぜんぶ抜いた状態 */}
      <TowerOnPillars f={f} labels={false}
        pulled={{ hone: pull, hako: pull, mizu: pull, akari: pull, kuuki: pull }}
        float={pull} />

      {/* 抜けた5本が足元に積まれている */}
      <g>
        {(["hone", "hako", "mizu", "akari", "kuuki"] as const).map((id, i) => (
          <g key={id}
            transform={`translate(${250 + i * 142} ${1012 + (i % 2) * 32}) rotate(${-76 + i * 9}) scale(0.62)`}
            opacity={seg(f, 8 + i * 4, 26 + i * 4)}>
            <Pillar id={id} x={0} top={-280} h={280} w={120} f={f} label={false} />
          </g>
        ))}
        {/* 砂ぼこり */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={220 + i * 130 + Math.sin(f / 7 + i) * 7} cy={1056 - (i % 3) * 16}
            r={26 + (i % 3) * 9} fill="#D8C4A2" stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
        ))}
      </g>
      {/* 帯OK: 赤い点線 (y=844) の上に置く札なので下げられない。
          札は x 308〜732 で、中央寄せの字幕帯 (x≈960中心) とは横にずれているため重ならない。 */}
      <TagPlate x={520} y={840} text="5本、抜きました" size={48} t={seg(f, 16, 34)}
        fill={KRP.white} color={KRP.red} />
    </g>
  );
};

// =====================================================================
// 文#22 あの部屋を支えていたのは、床ではありません。
// #20 と同じ部屋。床板だけが外れて落ちていくが、部屋はまだ浮いている。
// =====================================================================
const S22: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f / 22) * 8;
  const RX = 400, RY = 210 + bob;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#D3E4F2" />
      <rect x={0} y={0} width={W} height={320} fill="#B7D3EA" />
      <Cloud x={1560} y={210} s={1.6} op={0.9} />
      <Cloud x={300} y={130} s={1.0} op={0.8} />
      {/* はるか下の街 */}
      <rect x={0} y={952} width={W} height={128} fill="#C5C8B2" />
      <line x1={0} y1={952} x2={W} y2={952} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      {Array.from({ length: 58 }, (_, i) => {
        const d = rnd(i + 181);
        const h = lerp(46, 8, d);
        const by = lerp(1030, 956, d);
        return <rect key={i} x={rnd(i + 29) * W} y={by - h} width={lerp(34, 7, d)} height={h}
          fill={rnd(i + 3) > 0.5 ? "#B6AE98" : "#A79F88"} stroke={KRP.ink} strokeWidth={1.8}
          opacity={lerp(0.95, 0.35, d)} />;
      })}
      <rect x={0} y={912} width={W} height={70} fill="#E2EAEE" opacity={0.45} />
      <Cloud x={1250} y={886} s={1.0} op={0.85} />
      <Cloud x={330} y={820} s={1.4} op={0.9} />
      <Cloud x={820} y={930} s={0.8} op={0.8} />
      {/* 鳥 (部屋より下) */}
      {[0, 1, 2].map((i) => (
        <path key={i}
          d={`M ${260 + i * 330 + ((f * 2.2) % 160)} ${700 + ((i * 61) % 120)} q 20 -18 38 0 q 18 -18 38 0`}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
      ))}

      {/* 部屋 (床だけ無い) */}
      <g transform={`translate(${RX} ${RY})`}><AirRoom f={f} floor={false} /></g>

      {/* 落ちていく床板 */}
      <g transform={`translate(1460 ${800 + Math.sin(f / 19) * 10}) rotate(-21)`}>
        <polygon points="-300,0 -250,-34 300,-34 250,0" fill="#E8D8B2" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-300} y={0} width={600} height={34} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
        {[1, 2, 3, 4].map((i) => (
          <line key={i} x1={-300 + i * 120} y1={0} x2={-250 + i * 120} y2={-34}
            stroke="#C2AE83" strokeWidth={5} />
        ))}
      </g>
      {/* 落ちた跡の線 */}
      <g stroke={KRP.grayDark} strokeWidth={6} opacity={0.45} strokeLinecap="round">
        {[0, 1, 2].map((i) => (
          <line key={i} x1={1180 + i * 70} y1={620 + i * 24} x2={1330 + i * 70} y2={720 + i * 24} />
        ))}
      </g>
      <XMark x={1470} y={806} s={2.0} t={seg(f, 10, 28)} />
      <TagPlate x={1480} y={672} text="床では、ない" size={48} t={seg(f, 18, 36)}
        fill={KRP.white} color={KRP.red} />
      <QMark x={1170} y={430} s={1.2} f={f} t={seg(f, 22, 40)} />
      <TagPlate x={1430} y={170} text="でも、部屋は落ちない" size={44} t={seg(f, 6, 24)} fill={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#23 骨と、箱と、水と、灯りと、空気です。
// 夜明けの空に5本の柱が並び、名札が付く。
// =====================================================================
const S23: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 夜明け */}
    <rect x={0} y={0} width={W} height={H} fill="#E9E0EE" />
    <rect x={0} y={0} width={W} height={260} fill="#A9A8CE" />
    <rect x={0} y={260} width={W} height={200} fill="#D7C4D6" />
    <rect x={0} y={460} width={W} height={260} fill="#F2D9C0" />
    <circle cx={960} cy={760} r={170} fill={KRP.yellow} opacity={0.45} />
    <circle cx={960} cy={760} r={96} fill={KRP.yellow} opacity={0.55} />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={rnd(i + 211) * W} cy={rnd(i + 17) * 240} r={2 + rnd(i + 3) * 3}
        fill={KRP.white} opacity={0.5 + Math.sin((f + i * 13) / 11) * 0.3} />
    ))}
    {/* 遠くの街 */}
    {Array.from({ length: 52 }, (_, i) => {
      const d = rnd(i + 151);
      const h = lerp(140, 30, d);
      return <rect key={i} x={rnd(i + 67) * W} y={936 - h} width={lerp(72, 20, d)} height={h}
        fill="#C0B4C4" opacity={lerp(0.8, 0.25, d)} />;
    })}
    {/* 地面 */}
    <rect x={0} y={932} width={W} height={148} fill="#CBBFC9" stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 26 }, (_, i) => (
      <ellipse key={i} cx={rnd(i + 311) * W} cy={960 + rnd(i + 7) * 100}
        rx={6 + rnd(i + 19) * 12} ry={3 + rnd(i + 23) * 5} fill="#B6A8B4" opacity={0.6} />
    ))}

    {/* 5本の柱 */}
    <PillarRow f={f} done={["hone", "hako", "mizu", "akari", "kuuki"]}
      top={420} h={400} subs={false} checkT={seg(f, 16, 34)} />
    <TagPlate x={960} y={200} text="この5本" size={54} t={seg(f, 6, 24)} fill={KRP.white} />
  </g>
);

// =====================================================================
// 文#24 30階に住むとは、こういうことです。
// 装置は上に小さく置き、下は朝の歩道。人は装置に重ならない位置に置く。
// =====================================================================
const S24: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 朝の空 */}
    <rect x={0} y={0} width={W} height={H} fill="#DCEAF4" />
    <rect x={0} y={0} width={W} height={280} fill="#C2DCF0" />
    <circle cx={210} cy={160} r={70} fill={KRP.yellow} opacity={0.75} />
    <circle cx={210} cy={160} r={118} fill={KRP.yellow} opacity={0.2} />
    <Cloud x={1480} y={170} s={1.5} op={0.9} />
    <Cloud x={760} y={120} s={0.9} op={0.75} />

    {/* 足元 : 朝の歩道 (装置より先に敷く。名札が隠れないように) */}
    <rect x={0} y={600} width={W} height={480} fill="#CFC9BB" stroke={KRP.ink} strokeWidth={7} />
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1={0} y1={660 + i * 48} x2={W} y2={660 + i * 48} stroke="#B0A998" strokeWidth={4} opacity={0.8} />
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <line key={i} x1={120 + i * 260} y1={600} x2={60 + i * 300} y2={1080} stroke="#B0A998" strokeWidth={4} opacity={0.8} />
    ))}
    {/* 縁石と車道 */}
    <rect x={0} y={1016} width={W} height={64} fill="#B7B1A2" stroke={KRP.ink} strokeWidth={6} />
    {/* マンホール */}
    <g transform="translate(1010 978)">
      <ellipse cx={0} cy={0} rx={62} ry={24} fill="#9A9486" stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={0} rx={44} ry={15} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    </g>
    {/* 鳩 */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${760 + i * 70} ${1002 + i * 8}) scale(${1 - i * 0.12})`}>
        <ellipse cx={0} cy={0} rx={26} ry={17} fill="#9FA6AE" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={20} cy={-16} r={12} fill="#9FA6AE" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 30 -14 l 14 4 l -14 5 z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        <line x1={-6} y1={17} x2={-6} y2={30} stroke={KRP.ink} strokeWidth={4} />
        <line x1={8} y1={17} x2={8} y2={30} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {/* 街路樹 */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${110 + i * 1700} 1050)`}>
        <rect x={-18} y={-230} width={36} height={230} fill="#8A6A44" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-290} r={96} fill={KRP.green} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={-70} cy={-232} r={60} fill={KRP.green} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={70} cy={-238} r={56} fill={KRP.green} stroke={KRP.ink} strokeWidth={7} />
      </g>
    ))}
    {/* 装置 (5本そろい) : 小さめに、上へ */}
    <g transform="translate(211.2 -60) scale(0.78)">
      <TowerOnPillars f={f} labels subs={false} />
    </g>
    {/* ベンチ */}
    <g transform="translate(300 1040)">
      <rect x={-120} y={-46} width={240} height={22} rx={6} fill="#A9793F" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-120} y={-12} width={240} height={20} rx={6} fill="#A9793F" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-104} y={8} width={18} height={58} fill="#7C5A33" stroke={KRP.ink} strokeWidth={5} />
      <rect x={86} y={8} width={18} height={58} fill="#7C5A33" stroke={KRP.ink} strokeWidth={5} />
    </g>
    {/* 見上げる親子 */}
    <Person x={430} y={1046} s={1.22} f={f} cloth={KRP.blueDeep} clothDark="#35578A"
      face="smile" gaze={[0.1, -0.55]} />
    <Person x={556} y={1054} s={0.84} f={f} phase={5} cloth={KRP.red} clothDark="#A02E20"
      face="surprised" gaze={[0.1, -0.55]} />
    {/* 歩く人 */}
    <Person x={1420} y={1042} s={1.14} f={f} phase={8} cloth="#6E8C6A" clothDark="#536C50"
      face="normal" gaze={[-0.4, 0]} />
    <Person x={1600} y={1052} s={1.0} f={f} phase={2} cloth="#9C5A74" clothDark="#7B4257"
      face="normal" gaze={[-0.4, 0]} />
    {/* 自転車 (近景) */}
    <g transform="translate(1180 1066)" opacity={0.95}>
      <circle cx={-72} cy={0} r={46} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <circle cx={72} cy={0} r={46} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <path d="M -72 0 L -10 -58 L 72 0 M -10 -58 L 24 -58 M -72 0 L 10 0 L 72 0"
        fill="none" stroke={KRP.ink} strokeWidth={8} />
    </g>
    <TagPlate x={960} y={702} text="30階に住む = これ全部" size={40} t={seg(f, 14, 32)} fill={KRP.yellow} />
  </g>
);

// =====================================================================
// 文#25 今日の問いは、二つ。
// ビルの谷間を見上げる。細い空の帯に？が2つ縦に並ぶ。
// =====================================================================
const S25: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#CFE2F1" />
    <rect x={0} y={0} width={W} height={300} fill="#A9C9E7" />
    <Cloud x={930} y={120} s={0.7} op={0.9} />
    {/* 左右の棟 (上ですぼまる = 見上げ) */}
    {[0, 1].map((i) => {
      const sgn = i ? 1 : -1;
      const xin0 = 960 + sgn * 250;
      const xin1 = 960 + sgn * 120;
      const xout = 960 + sgn * 1200;
      return (
        <g key={i}>
          <polygon points={`${xin0},1080 ${xout},1080 ${xout},0 ${xin1},0`}
            fill={i ? "#C3CED7" : "#D6DEE5"} stroke={KRP.ink} strokeWidth={9} />
          {Array.from({ length: 16 }, (_, r) => {
            const t = r / 15;
            const y = 1080 - t * 1080;
            const xa = lerp(xin0, xin1, t);
            return (
              <g key={r}>
                <line x1={xa} y1={y} x2={xout} y2={y} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
                {[0, 1, 2, 3, 4].map((c) => (
                  <rect key={c} x={xa + sgn * (66 + c * 156) - 34} y={y - 56} width={68} height={42}
                    fill={(r + c) % 5 === 0 ? "#E8E2C8" : "#AFC9DC"} stroke={KRP.ink} strokeWidth={3}
                    opacity={0.92} />
                ))}
              </g>
            );
          })}
          {/* 角の影 */}
          <polygon points={`${xin0},1080 ${xin0 + sgn * 26},1080 ${xin1 + sgn * 26},0 ${xin1},0`}
            fill={KRP.ink} opacity={0.12} />
        </g>
      );
    })}
    {/* 空の帯に問いが2つ */}
    <QMark x={960} y={250} s={1.1} f={f} t={seg(f, 4, 22)} />
    <TagPlate x={960} y={368} text="問い 一" size={44} t={seg(f, 10, 28)} fill={KRP.white} rot={-3} />
    <QMark x={960} y={560} s={1.1} f={f} t={seg(f, 14, 32)} />
    <TagPlate x={960} y={672} text="問い 二" size={44} t={seg(f, 20, 38)} fill={KRP.white} rot={3} />
    {/* 谷底 : 路面と見上げる人 */}
    <rect x={640} y={1000} width={640} height={80} fill="#BDB6A6" stroke={KRP.ink} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={690 + i * 150} y={1016} width={96} height={18} rx={4} fill={KRP.white} opacity={0.75} />
    ))}
    {/* 街灯 (近景・切れて入る) */}
    <g transform="translate(700 1080)">
      <rect x={-12} y={-400} width={24} height={400} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 0 -400 q 0 -54 58 -54" fill="none" stroke={KRP.ink} strokeWidth={10} />
      <ellipse cx={62} cy={-440} rx={36} ry={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
    </g>
    <Person x={1010} y={1062} s={1.15} f={f} cloth={KRP.orange} clothDark="#B96F22"
      face="surprised" gaze={[0, -0.55]} />
  </g>
);

// =====================================================================
// 文#26 高い建物は、何が揃って初めて建ったのか。
// 建設現場。部品の棚に5つ揃うが、その先の塔はまだ点線 = ほんとに建つ？
// =====================================================================
const S26: React.FC<{ f: number }> = ({ f }) => {
  const items = ["骨", "箱", "水", "灯", "空"] as const;
  const names = ["骨", "箱", "水", "灯り", "空気"];
  const cols = [KPP.hone, KPP.hako, KPP.mizu, KPP.akari, KPP.kuuki];
  return (
    <g>
      {/* 建設現場の空 */}
      <rect x={0} y={0} width={W} height={H} fill="#DCE8F2" />
      <rect x={0} y={0} width={W} height={280} fill="#C6DAEC" />
      <Cloud x={560} y={150} s={1.3} op={0.8} />
      {/* 奥 : 建設中の鉄骨 */}
      <g opacity={0.42}>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={120 + i * 380} y={120} width={26} height={760} fill={KPP.hone}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
        {Array.from({ length: 4 }, (_, r) => (
          <rect key={r} x={120} y={200 + r * 170} width={1660} height={22} fill={KPP.hone}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={146 + (i % 4) * 380} y1={222 + Math.floor(i / 4) * 170}
            x2={120 + ((i % 4) + 1) * 380} y2={200 + (Math.floor(i / 4) + 1) * 170}
            stroke={KPP.hone} strokeWidth={14} />
        ))}
      </g>
      {/* クレーン (左上) */}
      <g opacity={0.7}>
        <rect x={160} y={60} width={34} height={820} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        <rect x={160} y={60} width={700} height={26} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        <line x1={700} y1={86} x2={700} y2={260} stroke={KRP.ink} strokeWidth={6} />
        <rect x={652} y={260} width={100} height={70} fill={KPP.hone} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 地面 */}
      <rect x={0} y={880} width={W} height={200} fill="#C8A86E" stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 22 }, (_, i) => (
        <ellipse key={i} cx={rnd(i + 401) * W} cy={906 + rnd(i + 11) * 150}
          rx={8 + rnd(i + 31) * 14} ry={4 + rnd(i + 37) * 6} fill="#B3914F" opacity={0.6} />
      ))}

      {/* 部品の棚 (左) */}
      <g>
        <rect x={110} y={470} width={1020} height={390} rx={10} fill="#EDE7DA"
          stroke={KRP.ink} strokeWidth={9} />
        <line x1={110} y1={672} x2={1130} y2={672} stroke={KRP.ink} strokeWidth={8} />
        {items.map((t, i) => {
          const x = 212 + i * 192;
          return (
            <g key={t}>
              <rect x={x - 80} y={506} width={160} height={136} rx={8}
                fill={cols[i]} stroke={KRP.ink} strokeWidth={7} />
              <text x={x} y={600} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={72} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
                paintOrder="stroke">{t}</text>
              <rect x={x - 70} y={702} width={140} height={44} rx={8} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={5} />
              <text x={x} y={736} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={30} fill={KRP.ink}>{names[i]}</text>
              {/* 揃った印 */}
              <g opacity={seg(f, 6 + i * 3, 22 + i * 3)}>
                <circle cx={x + 64} cy={496} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                <path d={`M ${x + 52} 496 l 9 11 l 18 -22`} fill="none" stroke={KRP.green}
                  strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          );
        })}
      </g>

      {/* 近景 : 資材 (画面の下で切れる) */}
      <g transform="translate(150 1030)">
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(${r * 18} ${-r * 44})`}>
            <rect x={-230} y={-34} width={460} height={40} fill="#8E8A80" stroke={KRP.ink} strokeWidth={6} />
            <rect x={-230} y={-34} width={460} height={12} fill="#A5A198" />
          </g>
        ))}
      </g>
      {/* 近景 : 土嚢と手押し車 */}
      <g transform="translate(830 1050)">
        <path d="M -70 0 q -16 -70 54 -74 q 70 4 54 74 z" fill="#C7B48C" stroke={KRP.ink} strokeWidth={6} />
        <path d="M -16 -74 q -10 -22 0 -26 q 12 2 12 26" fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform="translate(610 1048)">
        <path d="M -90 -70 L 110 -70 L 70 -14 L -50 -14 z" fill="#B8502E" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-66} cy={16} r={30} fill="#55514A" stroke={KRP.ink} strokeWidth={6} />
        <line x1={110} y1={-70} x2={168} y2={-96} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={-50} y1={-14} x2={-66} y2={16} stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 「で、建つの？」 : 点線の塔 */}
      <Arrow x={1390} y={600} rot={-18} s={1.2} t={seg(f, 14, 30)} />
      <polygon points="1430,860 1492,190 1848,190 1900,860" fill={KRP.white} opacity={0.3} />
      <polygon points="1430,860 1492,190 1848,190 1900,860" fill="none"
        stroke={KRP.red} strokeWidth={7} strokeDasharray="24 18" />
      <QMark x={1664} y={500} s={1.5} f={f} t={seg(f, 18, 36)} />
      {/* 見上げる作業員 */}
      <Person x={1250} y={1052} s={1.3} f={f} cloth={KRP.orange} clothDark="#B96F22"
        helmet face="normal" gaze={[0.45, -0.4]} />
      <TagPlate x={620} y={330} text="何が揃えば、建つ？" size={50} t={seg(f, 10, 28)} fill={KRP.yellow} />
    </g>
  );
};

// =====================================================================
// 文#27 そして、高さの代金を、いま誰が払っているのか。
// タワマンの足元。電気・水道のメーターがぐるぐる回り、請求書が積まれる。
// =====================================================================
const S27: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 足元から見上げたタワマン (上は画面の外へ) */}
    <rect x={0} y={0} width={W} height={H} fill="#DCE8F2" />
    <rect x={0} y={0} width={W} height={240} fill="#C4D9EB" />
    <Cloud x={190} y={300} s={1.5} op={0.85} />
    <Cloud x={1780} y={210} s={1.2} op={0.8} />
    <polygon points="260,920 450,-30 1470,-30 1660,920" fill="#DDE4EA" stroke={KRP.ink} strokeWidth={9} />
    {/* 壁の陰 (立体感) */}
    <polygon points="1470,-30 1660,920 1540,920 1398,-30" fill={KRP.ink} opacity={0.09} />
    {Array.from({ length: 13 }, (_, r) => {
      const t = r / 13;
      const y = 920 - t * 950;
      const xa = lerp(260, 450, t), xb = lerp(1660, 1470, t);
      return (
        <g key={r}>
          <line x1={xa} y1={y} x2={xb} y2={y} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((u, c) => (
            <rect key={c} x={lerp(xa, xb, u) - 34} y={y - 52} width={68} height={40}
              fill={(r + c) % 6 === 0 ? "#EDE6C6" : "#AFC9DC"} stroke={KRP.ink} strokeWidth={3}
              opacity={0.9} />
          ))}
        </g>
      );
    })}
    {/* 入口の庇 */}
    <g>
      <rect x={700} y={836} width={520} height={28} rx={8} fill="#B9C2C9" stroke={KRP.ink} strokeWidth={7} />
      <rect x={760} y={864} width={400} height={58} fill="#9FB4C4" stroke={KRP.ink} strokeWidth={7} />
      <line x1={960} y1={864} x2={960} y2={922} stroke={KRP.ink} strokeWidth={6} />
    </g>
    {/* 地面 */}
    <rect x={0} y={920} width={W} height={160} fill="#CFC9BB" stroke={KRP.ink} strokeWidth={7} />
    {Array.from({ length: 4 }, (_, i) => (
      <line key={i} x1={0} y1={964 + i * 36} x2={W} y2={964 + i * 36} stroke="#B5AE9E" strokeWidth={3} />
    ))}

    {/* 壁のメーター盤 */}
    <g transform="translate(330 630)">
      <rect x={-250} y={-180} width={500} height={320} rx={14} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={9} />
      <rect x={-250} y={-180} width={500} height={56} rx={14} fill={KRP.gray}
        stroke={KRP.ink} strokeWidth={8} />
      <text x={0} y={-138} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={34} fill={KRP.ink}>電気・水道</text>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${-110 + i * 220} -10)`}>
          <circle cx={0} cy={0} r={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          <circle cx={0} cy={0} r={78} fill="none" stroke={i ? KPPMizu : KPP.akari} strokeWidth={11} />
          <g transform={`rotate(${f * (i ? 7 : 11)})`}>
            <polygon points="0,0 -7,-18 0,-64 7,-18" fill={KRP.red} />
          </g>
          <circle cx={0} cy={0} r={12} fill={KRP.ink} />
        </g>
      ))}
      <rect x={-180} y={78} width={360} height={46} rx={8} fill="#2F2A24" stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => (
        <text key={i} x={-148 + i * 58} y={114} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={38} fill={KRP.yellow}>
          {Math.floor((f * (i + 1) * 3) / (i + 2)) % 10}
        </text>
      ))}
    </g>

    {/* 積まれた請求書 */}
    <g transform="translate(1500 1010)">
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(${Math.sin(i * 2.1) * 28} ${-i * 36}) rotate(${Math.sin(i * 1.3) * 5})`}>
          <rect x={-180} y={-42} width={360} height={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-144} y1={-16} x2={30} y2={-16} stroke={KRP.gray} strokeWidth={6} />
          <line x1={-144} y1={10} x2={-30} y2={10} stroke={KRP.gray} strokeWidth={6} />
          <text x={120} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={KRP.red}>¥</text>
        </g>
      ))}
    </g>
    {/* 近景 : ポスト (画面の端で切れる) */}
    <g transform="translate(140 1080)">
      <rect x={-130} y={-300} width={260} height={300} rx={16} fill={KRP.red}
        stroke={KRP.ink} strokeWidth={9} />
      <rect x={-92} y={-246} width={184} height={28} rx={8} fill="#2F2A24" stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${-40 + i * 44} ${-262 - i * 10}) rotate(${-14 + i * 12})`}>
          <rect x={-66} y={-22} width={132} height={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={34} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={26} fill={KRP.red}>¥</text>
        </g>
      ))}
    </g>
    {/* 硬貨 */}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${1140 + i * 74} ${1046 - i * 10})`}>
        <circle cx={0} cy={0} r={32} fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={11} fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}

    {/* 見上げる住人 */}
    <Person x={840} y={1050} s={1.45} f={f} cloth={KRP.blueDeep} clothDark="#35578A"
      face="worried" gaze={[-0.45, -0.3]} />
    <QMark x={1000} y={330} s={1.5} f={f} t={seg(f, 8, 26)} />
    <TagPlate x={1000} y={520} text="代金は、誰が？" size={52} t={seg(f, 16, 34)} fill={KRP.yellow} />
  </g>
);

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb0_room30:        (f) => <Frame f={f} seed={400}><S01 f={f} /></Frame>,
  kb0_night_window:  (f) => <Frame f={f} seed={401} dark><S02 f={f} /></Frame>,
  kb0_tap_and_door:  (f) => <Frame f={f} seed={402}><S03 f={f} /></Frame>,
  kb0_saikou:        (f) => <Frame f={f} seed={403}><S04 f={f} /></Frame>,
  kb0_rewind:        (f) => <Frame f={f} seed={404}><S05 f={f} /></Frame>,
  kb0_room_cube:     (f) => <Frame f={f} seed={405}><S06 f={f} /></Frame>,
  kb0_y2000:         (f) => <Frame f={f} seed={406}><S07 f={f} /></Frame>,
  kb0_no_delivery:   (f) => <Frame f={f} seed={407}><S08 f={f} /></Frame>,
  kb0_netshop_mada:  (f) => <Frame f={f} seed={427}><S08B f={f} /></Frame>,
  kb0_carry_water:   (f) => <Frame f={f} seed={408}><S09 f={f} /></Frame>,
  kb0_y1960_ac:      (f) => <Frame f={f} seed={409}><S10 f={f} /></Frame>,
  kb0_wind:          (f) => <Frame f={f} seed={410}><S11 f={f} /></Frame>,
  kb0_y1930_cage:    (f) => <Frame f={f} seed={411}><S12 f={f} /></Frame>,
  kb0_lever:         (f) => <Frame f={f} seed={412}><S13 f={f} /></Frame>,
  kb0_hako_shoulder: (f) => <Frame f={f} seed={413}><S14 f={f} /></Frame>,
  kb0_y1900_tap:     (f) => <Frame f={f} seed={414}><S15 f={f} /></Frame>,
  kb0_pressure:      (f) => <Frame f={f} seed={415}><S16 f={f} /></Frame>,
  kb0_y1880_gas:     (f) => <Frame f={f} seed={416} dark><S17 f={f} /></Frame>,
  kb0_y1850_floor:   (f) => <Frame f={f} seed={417}><S18 f={f} /></Frame>,
  kb0_no_method:     (f) => <Frame f={f} seed={418}><S19 f={f} /></Frame>,
  kb0_in_the_air:    (f) => <Frame f={f} seed={419}><S20 f={f} /></Frame>,
  kb0_five_pulled:   (f) => <Frame f={f} seed={420}><S21 f={f} /></Frame>,
  kb0_not_floor:     (f) => <Frame f={f} seed={421}><S22 f={f} /></Frame>,
  kb0_five_names:    (f) => <Frame f={f} seed={422}><S23 f={f} /></Frame>,
  kb0_thats_30f:     (f) => <Frame f={f} seed={423}><S24 f={f} /></Frame>,
  kb0_two_questions: (f) => <Frame f={f} seed={424}><S25 f={f} /></Frame>,
  kb0_q1:            (f) => <Frame f={f} seed={425}><S26 f={f} /></Frame>,
  kb0_q2:            (f) => <Frame f={f} seed={426}><S27 f={f} /></Frame>,
};

export const K_B0_MOTIFS: string[] = [
  "kb0_room30",        // #1
  "kb0_night_window",  // #2
  "kb0_tap_and_door",  // #3
  "kb0_saikou",        // #4
  "kb0_rewind",        // #5
  "kb0_room_cube",     // #6
  "kb0_y2000",         // #7
  "kb0_no_delivery",   // #8
  "kb0_netshop_mada",  // #9  ★2026-11-05 追加
  "kb0_carry_water",   // #10 (v1では#9)
  "kb0_y1960_ac",      // #11
  "kb0_wind",          // #12
  "kb0_y1930_cage",    // #13
  "kb0_lever",         // #14
  "kb0_hako_shoulder", // #15
  "kb0_y1900_tap",     // #16
  "kb0_pressure",      // #17
  "kb0_y1880_gas",     // #18
  "kb0_y1850_floor",   // #19
  "kb0_no_method",     // #20
  "kb0_in_the_air",    // #21
  "kb0_five_pulled",   // #22
  "kb0_not_floor",     // #23
  "kb0_five_names",    // #24
  "kb0_thats_30f",     // #25
  "kb0_two_questions", // #26
  "kb0_q1",            // #27
  "kb0_q2",            // #28
];

export const kosoB0Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

export const KOSO_B0_PREVIEW_FRAMES = Math.max(K_B0_MOTIFS.length, 1);

export const KosoB0Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B0_MOTIFS.length - 1);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {kosoB0Scene(K_B0_MOTIFS[i] ?? "", 45)}
      <svg width={W} height={H} style={abs} />
    </AbsoluteFill>
  );
};

