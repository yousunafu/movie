// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#111〜#120 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L3a。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./YawaShared";
import { YP, Squishy, DameSofa, AgeDial, KaradaChizu } from "./YawaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/YP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  bamboo: "#D9BC72", bambooDark: "#A9873F", bambooLight: "#EEDCA4", tubeIn: "#6A5230",
  stalk: "#86AB5E", stalkDark: "#5B7F3E", stalkLeaf: "#6E9A4C",
  night: "#24344E", nightDeep: "#18233A", nightHaze: "#33476A", moon: "#F7EDC4",
  firefly: "#E8F59C", lotus: "#EFA9BE", lotusDeep: "#D97A99", pad: "#5E8C4E", pond: "#2F4A6A",
  songCloth: "#5E7FA0", songClothDark: "#45627E", tangCloth: "#9B5B43", tangClothDark: "#74402E",
  hat: "#2B2622", beard: "#4A4038",
  tile: "#5C6573", tileDark: "#434B57", pillar: "#B9452F", wallSong: "#EFE4C9", canal: "#7FA6BF",
  stone: "#B9B2A3", stoneDark: "#8E877A", willow: "#93B46C", sky: "#CFE0E6", lantern: "#D9553A",
  paperOld: "#E9DCB6", paperEdge: "#C9B888", inkWash: "#2C2824", seal: "#C2392B",
  wind: "#7FC8E8", windDeep: "#3E9CCB", blush: "#F29C9C", flower: "#E8607A", flowerCore: "#F6D15A",
  bedWood: "#8A5A36", bedWoodDark: "#653F24", mat: "#D6C38E", matLine: "#B7A26A",
  curtain: "#B9D3C6", wine: "#C9A54A",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void YP; void Squishy; void DameSofa; void AgeDial; void KaradaChizu;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;

/* 竹夫人 (竹で編んだ筒)。中心 (x,y)・長さ L・半径 R。spin で筒が軸まわりに回る (網目が流れる)。
   網目は六つ目編み = 軸に平行な竹ひご + 左右2方向のらせん。裏側のひごは中の暗がりに透けて見える */
const L3aTube: React.FC<{
  id: string; x: number; y: number; L: number; R: number; rot?: number; spin?: number; sw?: number;
}> = ({ id, x, y, L, R, rot = 0, spin = 0, sw = 1 }) => {
  const N = 12;
  const k = 1.73 / R;
  const half = L / 2;
  const front: string[] = [];
  const back: string[] = [];
  for (let i = 0; i < N; i++) {
    const ph = spin + (i * Math.PI * 2) / N;
    const yy = R * Math.sin(ph);
    (Math.cos(ph) > 0 ? front : back).push(`M ${-half} ${yy.toFixed(1)} L ${half} ${yy.toFixed(1)}`);
  }
  const SAMP = 90;
  for (const sg of [1, -1]) {
    for (let i = 0; i < N; i++) {
      let cur = ""; let curFront: boolean | null = null;
      for (let j = 0; j <= SAMP; j++) {
        const xx = -half + (L * j) / SAMP;
        const ph = spin + (i * Math.PI * 2) / N + Math.PI / N + sg * k * xx;
        const fr = Math.cos(ph) > 0;
        const pt = `${xx.toFixed(1)} ${(R * Math.sin(ph)).toFixed(1)}`;
        if (curFront === null || fr !== curFront) {
          if (cur) (curFront ? front : back).push(cur);
          cur = `M ${pt}`; curFront = fr;
        } else cur += ` L ${pt}`;
      }
      if (cur) (curFront ? front : back).push(cur);
    }
  }
  const rr = R * 0.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <clipPath id={id}><rect x={-half} y={-R} width={L} height={R * 2} /></clipPath>
      </defs>
      {/* 落ちる影 */}
      <ellipse cx={0} cy={R + 14} rx={half * 0.95} ry={R * 0.22} fill={KRP.ink} opacity={0.16} />
      <g clipPath={`url(#${id})`}>
        <rect x={-half} y={-R} width={L} height={R * 2} fill={C.tubeIn} />
        <path d={back.join(" ")} fill="none" stroke={C.bambooDark} strokeWidth={5 * sw} opacity={0.75} />
        <path d={front.join(" ")} fill="none" stroke={KRP.ink} strokeWidth={13 * sw} />
        <path d={front.join(" ")} fill="none" stroke={C.bamboo} strokeWidth={8 * sw} />
        <rect x={-half} y={-R * 0.82} width={L} height={R * 0.26} fill={KRP.white} opacity={0.2} />
        <rect x={-half} y={R * 0.5} width={L} height={R * 0.5} fill={KRP.ink} opacity={0.22} />
      </g>
      <rect x={-half} y={-R} width={L} height={R * 2} fill="none" stroke={KRP.ink} strokeWidth={6 * sw} />
      {/* 両端の締めの帯 (幅広の竹) */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * (half - R * 0.28) - R * 0.12} y={-R - 3} width={R * 0.24} height={R * 2 + 6} rx={4}
            fill={C.bamboo} stroke={KRP.ink} strokeWidth={5 * sw} />
          <line x1={sd * (half - R * 0.28)} y1={-R} x2={sd * (half - R * 0.28)} y2={R} stroke={C.bambooDark} strokeWidth={3 * sw} />
        </g>
      ))}
      {/* 左の口 (中が空洞なのが見える) */}
      <ellipse cx={-half} cy={0} rx={rr} ry={R} fill={C.tubeIn} stroke={KRP.ink} strokeWidth={16 * sw} />
      <ellipse cx={-half} cy={0} rx={rr} ry={R} fill="none" stroke={C.bamboo} strokeWidth={9 * sw} />
      <ellipse cx={-half + rr * 0.35} cy={0} rx={rr * 0.5} ry={R * 0.7} fill={KRP.ink} opacity={0.35} />
      {/* 右の口 (外側のふち) */}
      <path d={`M ${half} ${-R} A ${rr} ${R} 0 0 1 ${half} ${R}`} fill={C.bamboo} stroke={KRP.ink} strokeWidth={6 * sw} />
      <path d={`M ${half} ${-R} A ${rr} ${R} 0 0 1 ${half} ${R}`} fill="none" stroke={C.bambooLight} strokeWidth={4 * sw} opacity={0.8} />
    </g>
  );
};

/* Person と同じ座標・同じゆれで、頭や服に物を足す (幞頭・あごひげ・長い上着の裾) */
const L3aOn: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number; still?: boolean; children: React.ReactNode;
}> = ({ x, y, s, f, phase = 0, lean = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};
/* 幞頭 (宋代の黒い布の帽子。左右に長い翅) */
const L3aFutou: React.FC<{ wing?: number; flap?: number }> = ({ wing = 1, flap = 0 }) => (
  <g>
    <rect x={-64 - 110 * wing} y={-268 + flap} width={110 * wing} height={11} rx={5} fill={C.hat} stroke={KRP.ink} strokeWidth={3}
      transform={`rotate(${flap * 0.6} -64 -262)`} />
    <rect x={64} y={-268 - flap} width={110 * wing} height={11} rx={5} fill={C.hat} stroke={KRP.ink} strokeWidth={3}
      transform={`rotate(${-flap * 0.6} 64 -262)`} />
    <path d="M -62 -244 Q -66 -300 0 -304 Q 66 -300 62 -244 Q 0 -256 -62 -244 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -30 -298 Q -30 -336 0 -338 Q 30 -336 30 -298 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -54 -262 Q 0 -272 54 -262" fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.7} />
  </g>
);
/* あごひげと口ひげ */
const L3aBeard: React.FC<{ len?: number }> = ({ len = 1 }) => (
  <g>
    <path d={`M -30 -184 Q -26 ${-150 + 10 * (len - 1)} -10 ${-128 - 0} Q 0 ${-104 - 30 * (len - 1) * -1} 10 -128 Q 26 -150 30 -184 Q 16 -172 0 -174 Q -16 -172 -30 -184 Z`}
      fill={C.beard} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -26 -196 Q -12 -186 0 -192 Q 12 -186 26 -196" fill="none" stroke={C.beard} strokeWidth={6} strokeLinecap="round" />
  </g>
);
/* 長い上着の裾 (ズボンの上にかぶせる) */
const L3aRobe: React.FC<{ cloth: string; dark: string }> = ({ cloth, dark }) => (
  <g>
    <path d="M -58 -70 L -72 -12 Q 0 -4 72 -12 L 58 -70 Z" fill={cloth} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 0 -70 L 0 -8" stroke={dark} strokeWidth={4} />
    <path d="M -58 -74 L 58 -74" stroke={dark} strokeWidth={7} />
    <path d="M -24 -160 L 0 -128 L 24 -160" fill="none" stroke={KRP.white} strokeWidth={5} />
  </g>
);

/* 竹 (1本)。x・根元 y0・高さ h・太さ w。葉は節から出る。sway で上のほうがゆれる */
const L3aBamboo: React.FC<{
  x: number; y0: number; h: number; w: number; sway?: number; seed: number; dark?: boolean; leaves?: boolean;
}> = ({ x, y0, h, w, sway = 0, seed, dark = false, leaves = true }) => {
  const nodes = Math.floor(h / 120);
  const col = dark ? C.stalkDark : C.stalk;
  return (
    <g transform={`rotate(${sway} ${x} ${y0})`}>
      <rect x={x - w / 2} y={y0 - h} width={w} height={h} fill={col} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={x - w / 2 + w * 0.15} y={y0 - h} width={w * 0.18} height={h} fill={KRP.white} opacity={0.18} />
      {Array.from({ length: nodes }, (_, i) => {
        const ny = y0 - 90 - i * 120 - rnd(seed, i) * 20;
        return (
          <g key={i}>
            <path d={`M ${x - w / 2 - 3} ${ny} Q ${x} ${ny + 7} ${x + w / 2 + 3} ${ny}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
            {leaves && i > nodes * 0.45 && rnd(seed, i + 9) > 0.35 && [0, 1, 2].map((j) => {
              const sd = rnd(seed, i * 3 + j) > 0.5 ? 1 : -1;
              const a = sd * (18 + j * 22) + (sd < 0 ? 180 : 0);
              return (
                <path key={j} d="M 0 0 Q 40 -14 104 0 Q 40 12 0 0 Z" fill={dark ? C.stalkDark : C.stalkLeaf}
                  stroke={KRP.ink} strokeWidth={3} transform={`translate(${x + sd * w / 2} ${ny}) rotate(${a})`} />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/* 提灯 */
const L3aLantern: React.FC<{ x: number; y: number; s?: number; f: number; ph?: number; lit?: number }> = ({ x, y, s = 1, f, ph = 0, lit = 1 }) => {
  const sw = Math.sin((f + ph * 20) / 14) * 4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sw}) scale(${s})`}>
      <line x1={0} y1={-60} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={14} r={70} fill={KRP.yellow} opacity={0.22 * lit} />
      <rect x={-22} y={-38} width={44} height={12} rx={3} fill={C.hat} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={0} cy={14} rx={40} ry={42} fill={C.lantern} stroke={KRP.ink} strokeWidth={4.5} />
      {[-24, -10, 10, 24].map((dx) => (
        <path key={dx} d={`M ${dx * 0.5} -26 Q ${dx * 1.5} 14 ${dx * 0.5} 54`} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.55} />
      ))}
      <ellipse cx={-12} cy={2} rx={10} ry={18} fill={KRP.yellow} opacity={0.4 * lit} />
      <rect x={-22} y={52} width={44} height={12} rx={3} fill={C.hat} stroke={KRP.ink} strokeWidth={3} />
      <path d="M -6 64 L -8 96 M 0 64 L 0 100 M 6 64 L 8 96" stroke={C.lantern} strokeWidth={4} />
    </g>
  );
};

/* 竹の縁台 (前から少し見下ろす)。x 中心・y 座面の手前のへり・w 幅 */
const L3aBench: React.FC<{ x: number; y: number; w: number; depth?: number; leg?: number }> = ({ x, y, w, depth = 70, leg = 120 }) => {
  const poles = 6;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={x + sd * (w / 2 - 40) - 14} y={y} width={28} height={leg} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={x + sd * (w / 2 - 40) - 14} y1={y + leg * 0.5} x2={x + sd * (w / 2 - 40) + 14} y2={y + leg * 0.5} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <rect x={x - w / 2 + 40} y={y + leg * 0.62} width={w - 80} height={16} rx={8} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${x - w / 2 + 50} ${y - depth} L ${x + w / 2 - 50} ${y - depth} L ${x + w / 2} ${y} L ${x - w / 2} ${y} Z`}
        fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: poles - 1 }, (_, i) => {
        const t = (i + 1) / poles;
        const yy = y - depth * t;
        const xl = lerp(x - w / 2, x - w / 2 + 50, t);
        const xr = lerp(x + w / 2, x + w / 2 - 50, t);
        return <line key={i} x1={xl} y1={yy} x2={xr} y2={yy} stroke={C.bambooDark} strokeWidth={3.5} />;
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const xx = x - w / 2 + (w * (i + 0.5)) / 5;
        return <line key={i} x1={xx} y1={y - 4} x2={xx + (xx - x) * -0.06} y2={y - depth + 4} stroke={C.bambooDark} strokeWidth={2.5} opacity={0.5} />;
      })}
      <rect x={x - w / 2} y={y} width={w} height={26} rx={10} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={x - w / 2 + 30 + i * ((w - 60) / 5)} y1={y + 2} x2={x - w / 2 + 30 + i * ((w - 60) / 5)} y2={y + 24} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
    </g>
  );
};

/* 蛍 (点滅しながらただよう) */
const L3aFireflies: React.FC<{ f: number; seed: number; n: number; x0: number; y0: number; w: number; h: number }> = ({ f, seed, n, x0, y0, w, h }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const px = x0 + rnd(seed, i) * w + Math.sin(f / 17 + i * 2.1) * 26;
      const py = y0 + rnd(seed, i + 50) * h + Math.cos(f / 13 + i * 1.7) * 18;
      const bl = 0.35 + 0.65 * Math.max(0, Math.sin(f / 7 + i * 1.3));
      return (
        <g key={i} opacity={bl}>
          <circle cx={px} cy={py} r={16} fill={C.firefly} opacity={0.3} />
          <circle cx={px} cy={py} r={5} fill={C.firefly} />
        </g>
      );
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================
/* 瓦屋根 (反りのある軒)。x 左端・y 軒の下端・w 幅・h 高さ */
const L3aRoof: React.FC<{ x: number; y: number; w: number; h: number; col?: string }> = ({ x, y, w, h, col = C.tile }) => (
  <g>
    <path d={`M ${x - 30} ${y - 26} Q ${x + 10} ${y - 4} ${x + 60} ${y} L ${x + w - 60} ${y} Q ${x + w - 10} ${y - 4} ${x + w + 30} ${y - 26}
      L ${x + w - 70} ${y - h} L ${x + 70} ${y - h} Z`} fill={col} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({ length: Math.floor(w / 34) }, (_, i) => {
      const xx = x + 40 + i * 34;
      return <line key={i} x1={xx} y1={y - 4} x2={lerp(xx, x + w / 2, 0.12)} y2={y - h + 6} stroke={C.tileDark} strokeWidth={4} />;
    })}
    <rect x={x + 56} y={y - h - 14} width={w - 112} height={18} rx={6} fill={C.tileDark} stroke={KRP.ink} strokeWidth={4} />
    <path d={`M ${x + 50} ${y - h - 10} q -16 -10 -12 -28`} fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    <path d={`M ${x + w - 50} ${y - h - 10} q 16 -10 12 -28`} fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
  </g>
);

// ---- 文#111 【山】 第6章、竹でできた、夫人。
// 設計: 章扉。夏の夜の中国の庭 (竹林・月・池・蓮)。竹の縁台の上に、竹で編んだ筒 (竹夫人) が1本ころんと置かれている。蛍。`ChapterDoor` (num=6)。題字の後ろに薄いクリームの帯
// どこ: 夏の夜の中国の庭。奥に竹林、左上に満月、手前に蓮の池。左寄りに竹の縁台
// 演出: 縁台の上に竹夫人が1本だけ「ころん」。題字は右下のクリーム帯の上
// 動き: カメラがゆっくり引く (1.12→1.0)。竹夫人が f8〜22 でころんと転がって止まる。蛍が1匹ふわりと筒の上にとまる。池の月影がゆらぐ
const Yw111: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = 1.12 - 0.12 * easeOut(seg(f, 0, 40));
  const roll = easeOut(seg(f, 6, 22));
  const tubeX = lerp(500, 640, roll);
  const ff = easeInOut(seg(f, 14, 38));
  const flyX = lerp(1080, 690, ff) + Math.sin(f / 5) * 10 * (1 - ff);
  const flyY = lerp(260, 474, ff) - Math.sin(ff * Math.PI) * 90;
  const flyOn = 0.55 + 0.45 * Math.max(0, Math.sin(f / 6));
  return (
    <Frame f={f} seed={3111} bg={C.nightDeep} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={6} title="竹でできた、夫人" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(${620 * (1 - cam)} ${560 * (1 - cam)}) scale(${cam})`}>
        {/* 夜空 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.night} />
        <rect x={-40} y={380} width={W + 80} height={300} fill={C.nightHaze} opacity={0.5} />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={rnd(3111, i) * W} cy={rnd(3112, i) * 360} r={2 + rnd(3113, i) * 2.5} fill={C.moon}
            opacity={0.35 + 0.4 * Math.abs(Math.sin(f / 9 + i))} />
        ))}
        {/* 満月 */}
        <circle cx={300} cy={190} r={150} fill={C.moon} opacity={0.13} />
        <circle cx={300} cy={190} r={92} fill={C.moon} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={272} cy={170} r={16} fill={KRP.paper} opacity={0.7} />
        <circle cx={330} cy={214} r={11} fill={KRP.paper} opacity={0.7} />
        {/* 奥の竹林 (暗い) */}
        {Array.from({ length: 14 }, (_, i) => (
          <L3aBamboo key={i} x={760 + i * 92 + rnd(3114, i) * 30} y0={620} h={680} w={30 + rnd(3115, i) * 10}
            sway={Math.sin(f / 22 + i) * 0.8} seed={3120 + i} dark />
        ))}
        {/* 手前の竹 (明るい・左端と右端) */}
        <L3aBamboo x={60} y0={700} h={760} w={52} sway={Math.sin(f / 20) * 1.1} seed={3131} />
        <L3aBamboo x={150} y0={700} h={720} w={40} sway={Math.sin(f / 18 + 1) * 1.1} seed={3132} />
        <L3aBamboo x={1860} y0={720} h={800} w={56} sway={Math.sin(f / 21 + 2) * 1.0} seed={3133} />
        {/* 庭の地面と池 */}
        <path d="M -40 600 Q 600 570 1960 610 L 1960 1120 L -40 1120 Z" fill={C.stalkDark} opacity={0.85} />
        <ellipse cx={960} cy={900} rx={1100} ry={200} fill={C.pond} stroke={KRP.ink} strokeWidth={5} />
        {/* 池の月影 (ゆらぐ) */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={1280 + Math.sin(f / 6 + i) * 14} cy={790 + i * 22} rx={70 - i * 12} ry={6} fill={C.moon} opacity={0.6 - i * 0.1} />
        ))}
        {/* 蓮の葉と花 */}
        {([[260, 860, 1], [430, 930, 0.8], [980, 960, 1.1], [1500, 880, 0.9], [1700, 960, 1]] as const).map(([px, py, ps], i) => (
          <g key={i} transform={`translate(${px} ${py + Math.sin(f / 15 + i) * 3}) scale(${ps})`}>
            <path d="M -70 0 A 70 24 0 1 0 70 0 L 0 -4 Z" fill={C.pad} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 0 -4 L -40 14 M 0 -4 L 40 14 M 0 -4 L 0 22" stroke={C.stalkDark} strokeWidth={3} />
          </g>
        ))}
        {([[380, 830], [1580, 850]] as const).map(([px, py], i) => (
          <g key={i} transform={`translate(${px} ${py})`}>
            <line x1={0} y1={0} x2={0} y2={40} stroke={C.stalkDark} strokeWidth={6} />
            {[-50, -25, 0, 25, 50].map((a) => (
              <path key={a} d="M 0 0 Q -16 -30 0 -62 Q 16 -30 0 0 Z" fill={a === 0 ? C.lotus : C.lotusDeep}
                stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${a})`} />
            ))}
          </g>
        ))}
        {/* 竹の縁台 + 竹夫人 (ころんと転がってきて止まる) */}
        <L3aBench x={640} y={640} w={780} depth={80} leg={110} />
        <L3aTube id="yw111tube" x={tubeX} y={548} L={600} R={62} spin={-roll * 2.4} />
        {/* 縁台の上のうちわ (小物) */}
        <g transform="translate(1000 600)">
          <path d="M -22 -26 L -16 14 Q 0 20 16 14 L 22 -26 Z" fill={C.canal} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-26} rx={22} ry={6} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 筒にとまりに来る蛍 */}
        <g opacity={flyOn}>
          <circle cx={flyX} cy={flyY} r={26} fill={C.firefly} opacity={0.35} />
          <circle cx={flyX} cy={flyY} r={8} fill={C.firefly} stroke={KRP.ink} strokeWidth={2} />
        </g>
        <L3aFireflies f={f} seed={3116} n={12} x0={120} y0={300} w={1600} h={400} />
      </g>
    </Frame>
  );
};

// ---- 文#112 【山】 舞台は、中国です。
// 設計: 宋の時代の町並み (瓦屋根・赤い柱・提灯・運河と石橋・柳)。宋代の服の人々。札「中国」。中国の国旗は現代のものなので置かない
// どこ: 宋の都の運河ぞい (昼)。左右に瓦屋根の店、真ん中に石の太鼓橋、左端に柳
// 演出: 橋の上で宋代の服の2人があいさつ。右岸の店先に客。運河を小舟が橋の下へ
// 動き: カメラが右へゆっくりパン。小舟が左から右へすべる (f=45 で橋の下)。提灯と柳がゆれる。橋の上の人がおじぎ
const Yw112: React.FC<{ f: number }> = ({ f }) => {
  const pan = -60 * easeInOut(seg(f, 0, 42));
  const boat = lerp(180, 860, easeOut(seg(f, 0, 42)));
  const bow = Math.sin(seg(f, 20, 40) * Math.PI) * 14;
  const tag = seg(f, 8, 20);
  return (
    <Frame f={f} seed={3112} bg={C.sky}>
      <g transform={`translate(${pan + 30 + 960 * -0.18} ${300 * -0.18}) scale(1.18)`}>
        <rect x={-80} y={-40} width={W + 200} height={H + 80} fill={C.sky} />
        {/* 遠くの山と屋根並み */}
        <path d="M -80 380 Q 200 250 480 350 Q 760 240 1060 340 Q 1400 230 2040 360 L 2040 460 L -80 460 Z" fill={C.willow} opacity={0.45} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} opacity={0.55}>
            <rect x={560 + i * 110} y={378} width={96} height={80} fill={C.wallSong} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${548 + i * 110} 384 L ${608 + i * 110} 346 L ${668 + i * 110} 384 Z`} fill={C.tile} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 運河 */}
        <rect x={-80} y={600} width={W + 200} height={520} fill={C.canal} />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${(i * 230 + f * 3) % 2200 - 140} ${650 + (i % 4) * 48} q 30 -8 60 0`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
        ))}
        {/* 左の店 */}
        <rect x={-60} y={300} width={600} height={300} fill={C.wallSong} stroke={KRP.ink} strokeWidth={5} />
        {[0, 180, 360, 520].map((dx) => <rect key={dx} x={-40 + dx} y={300} width={26} height={300} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={0} y={360} width={150} height={150} fill={C.tileDark} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={0} y1={385 + i * 26} x2={150} y2={385 + i * 26} stroke={C.wallSong} strokeWidth={3} />)}
        <rect x={200} y={330} width={46} height={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 212 352 h 22 M 212 380 h 22 M 212 408 h 22 M 212 436 h 22" stroke={KRP.ink} strokeWidth={4} />
        <L3aRoof x={-80} y={310} w={640} h={110} />
        <L3aLantern x={120} y={370} f={f} ph={0} />
        <L3aLantern x={430} y={370} f={f} ph={1} />
        {/* 石の岸 */}
        <rect x={-80} y={590} width={720} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1260} y={590} width={800} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-40 + i * 50 + (i > 12 ? 1300 : 0)} y1={592} x2={-40 + i * 50 + (i > 12 ? 1300 : 0)} y2={638} stroke={C.stoneDark} strokeWidth={3} />
        ))}
        {/* 右の店 (二階建て) */}
        <rect x={1340} y={250} width={640} height={350} fill={C.wallSong} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1340} y={400} width={640} height={16} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />
        {[0, 200, 400, 600].map((dx) => <rect key={dx} x={1350 + dx} y={416} width={24} height={184} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />)}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={1390 + i * 200} y={280} width={130} height={90} fill={C.paperOld} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${1455 + i * 200} 280 v 90 M ${1390 + i * 200} 325 h 130`} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <L3aRoof x={1320} y={262} w={680} h={100} />
        <rect x={1300} y={404} width={720} height={14} fill={C.tileDark} stroke={KRP.ink} strokeWidth={3} />
        <L3aLantern x={1480} y={470} f={f} ph={2} />
        <L3aLantern x={1880} y={470} f={f} ph={3} />
        {/* 店先の客と主人 */}
        <Person x={1640} y={592} s={0.62} f={f} phase={3} face="smile" cloth={C.songCloth} clothDark={C.songClothDark} pose="hold" />
        <L3aOn x={1640} y={592} s={0.62} f={f} phase={3}><L3aRobe cloth={C.songCloth} dark={C.songClothDark} /><L3aFutou wing={0.8} /></L3aOn>
        <rect x={1616} y={498} width={48} height={30} rx={6} fill={C.wine} stroke={KRP.ink} strokeWidth={3} />
        <Person x={1790} y={592} s={0.6} f={f} phase={4} face="normal" cloth={C.tangCloth} clothDark={C.tangClothDark} pose="point" pointDir={-1} />
        {/* 石の太鼓橋 */}
        <path d="M 600 600 Q 960 360 1320 600 L 1260 600 Q 960 440 660 600 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 680 640 Q 960 420 1240 640" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 680 640 Q 960 420 1240 640 L 1260 600 Q 960 440 660 600 Z" fill={C.stoneDark} opacity={0.6} />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10;
          const xx = lerp(640, 1280, t);
          const yy = 600 - 4 * 210 * t * (1 - t);
          return <rect key={i} x={xx - 7} y={yy - 50} width={14} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={3.5} />;
        })}
        <path d="M 630 556 Q 960 324 1290 556" fill="none" stroke={KRP.ink} strokeWidth={7} />
        {/* 橋の上の2人 (おじぎ) */}
        <Person x={880} y={488} s={0.66} f={f} phase={1} lean={bow} face="smile" cloth={C.songCloth} clothDark={C.songClothDark} pose="hold" />
        <L3aOn x={880} y={488} s={0.66} f={f} phase={1} lean={bow}><L3aRobe cloth={C.songCloth} dark={C.songClothDark} /><L3aFutou /><L3aBeard /></L3aOn>
        <Person x={1040} y={488} s={0.66} f={f} phase={2} lean={-bow} face="joy" cloth="#7C8E5E" clothDark="#5D6C44" pose="hold" />
        <L3aOn x={1040} y={488} s={0.66} f={f} phase={2} lean={-bow}><L3aRobe cloth="#7C8E5E" dark="#5D6C44" /><L3aFutou /></L3aOn>
        {/* 小舟と船頭 */}
        <g transform={`translate(${boat} ${720 + Math.sin(f / 8) * 4})`}>
          <path d="M -170 0 Q -150 44 0 46 Q 150 44 190 -10 L -190 -8 Z" fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -60 -8 Q 0 -80 60 -8 Z" fill={C.mat} stroke={KRP.ink} strokeWidth={4} />
          <Person x={120} y={0} s={0.5} f={f} phase={5} face="normal" cloth="#8E7A5C" clothDark="#6E5C42" lean={8} />
          <line x1={150} y1={-150} x2={60} y2={90} stroke={C.bedWoodDark} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* 柳 (左手前) */}
        <rect x={20} y={80} width={40} height={560} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => {
          const sx = -20 + i * 26;
          const sw = Math.sin(f / 14 + i * 0.6) * 18;
          return <path key={i} d={`M ${sx} 70 Q ${sx + 30 + sw * 0.4} 260 ${sx + 20 + sw} ${330 + (i % 4) * 60}`} fill="none" stroke={C.willow} strokeWidth={7} strokeLinecap="round" />;
        })}
        <ellipse cx={170} cy={70} rx={240} ry={70} fill={C.willow} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={960} y={150} text="中国" size={60} t={tag} />
    </Frame>
  );
};

// ---- 文#113 【図】 さて、ここで問題です。
// 設計: クイズ。竹で編んだすだれ (世界) の上に `QuizQ` がぽん。すだれの編み目
// どこ: 夏の夜の縁側にかかった竹のすだれ (画面いっぱい)
// 演出: すだれが上から降りてきて、真ん中に Q 札がぽん。すだれ越しに、次の問題の「筒」の影がうっすら透ける
// 動き: すだれが f0〜12 で降りる→風でゆれる。Q は f12〜24 でぽん。透ける影がゆっくり濃くなる
const Yw113: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 0, 12));
  const q = seg(f, 12, 24);
  const shade = seg(f, 18, 40);
  const sway = Math.sin(f / 10) * 0.6;
  const bottom = lerp(260, 940, drop);
  const slats = Math.floor((bottom - 70) / 15);
  return (
    <Frame f={f} seed={3113} bg={C.night} dark>
      {/* すだれの向こう = 夜の庭 (暗い) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} />
      <circle cx={1500} cy={260} r={80} fill={C.moon} opacity={0.5} />
      <g opacity={0.35 * shade}>
        <rect x={420} y={640} width={1080} height={40} fill={KRP.ink} />
        <rect x={500} y={560} width={900} height={90} rx={30} fill={KRP.ink} />
      </g>
      {/* 縁側の鴨居 */}
      <rect x={-20} y={30} width={W + 40} height={46} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={30} width={W + 40} height={12} fill={C.bedWoodDark} />
      {/* すだれ本体 */}
      <g transform={`rotate(${sway} 960 76)`}>
        {Array.from({ length: slats }, (_, i) => {
          const yy = 80 + i * 15;
          return (
            <g key={i}>
              <rect x={160} y={yy} width={1600} height={11} rx={5} fill={i % 7 === 3 ? C.bambooDark : C.bamboo}
                stroke={KRP.ink} strokeWidth={2} opacity={0.94} />
              {i % 5 === 0 && <line x1={160 + 300 + (i * 37) % 900} y1={yy + 2} x2={160 + 300 + (i * 37) % 900} y2={yy + 9} stroke={C.bambooDark} strokeWidth={3} />}
            </g>
          );
        })}
        {/* 編み糸 (縦) */}
        {[220, 520, 820, 1100, 1400, 1700].map((xx) => (
          <path key={xx} d={`M ${xx} 76 L ${xx} ${bottom}`} stroke={C.hat} strokeWidth={4} strokeDasharray="8 7" />
        ))}
        {/* 下の巻き軸と房 */}
        <rect x={150} y={bottom - 4} width={1620} height={22} rx={11} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4} />
        {[260, 1660].map((xx, i) => (
          <g key={xx} transform={`rotate(${Math.sin(f / 7 + i) * 6} ${xx} ${bottom + 18})`}>
            <line x1={xx} y1={bottom + 18} x2={xx} y2={bottom + 50} stroke={C.lantern} strokeWidth={5} />
            <path d={`M ${xx - 12} ${bottom + 50} L ${xx + 12} ${bottom + 50} L ${xx + 8} ${bottom + 96} L ${xx - 8} ${bottom + 96} Z`} fill={C.lantern} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 柱 (左右) */}
      <rect x={60} y={30} width={70} height={1060} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1790} y={30} width={70} height={1060} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
      {[180, 460, 760].map((yy) => <line key={yy} x1={74} y1={yy} x2={116} y2={yy + 18} stroke={C.bedWoodDark} strokeWidth={4} />)}
      {/* Q */}
      <QuizQ f={f} x={960} y={460} s={1.9} t={q} />
    </Frame>
  );
};

// ---- 文#114 【山】 この、竹で編んだ筒のようなもの。何に使う道具でしょうか。
// 設計: ★竹夫人の見せ場。竹で編んだ筒 (長さは人の背丈の6割ほど・六つ目編みの網目・両端の口) を画面いっぱいに斜めに置く。f でゆっくり回転して全体を見せる。横に `QMark`。下は竹の縁台
// どこ: 昼の縁側。大きな竹の縁台の座面に寄る。奥は格子窓の壁と、すだれ越しの庭の緑
// 演出: 長さ約1m の竹夫人を画面いっぱいに斜めに。目盛りの物差しで大きさを示す。右上に大きな？
// 動き: 筒が軸まわりにゆっくり回り (網目が流れる)、カメラが左の口から右へなめるようにパン。光の筋が網目を走る
const Yw114: React.FC<{ f: number }> = ({ f }) => {
  const spin = f * 0.035;
  const camX = lerp(40, -40, easeInOut(seg(f, 0, 42)));
  const tilt = lerp(-15, -11, easeInOut(seg(f, 0, 42)));
  const qm = seg(f, 18, 30);
  const ruler = seg(f, 8, 20);
  const glint = (f * 22) % 1800 - 300;
  return (
    <Frame f={f} seed={3114} bg={C.wallSong}>
      <g transform={`translate(${camX} 0)`}>
        {/* 奥の壁と格子窓 */}
        <rect x={-80} y={-20} width={W + 160} height={520} fill={C.wallSong} />
        <rect x={1180} y={60} width={560} height={330} fill={C.stalk} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={1180 + i * 80} y1={60} x2={1180 + i * 80} y2={390} stroke={C.bedWood} strokeWidth={12} />)}
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={1180} y1={60 + i * 82} x2={1740} y2={60 + i * 82} stroke={C.bedWood} strokeWidth={12} />)}
        <rect x={1180} y={60} width={560} height={330} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={100} y={40} width={240} height={420} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 220 90 q -30 120 10 300" fill="none" stroke={C.inkWash} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        <path d="M 210 170 q 40 -10 70 -40 M 230 260 q -40 -10 -70 -30" fill="none" stroke={C.inkWash} strokeWidth={6} opacity={0.6} />
        <rect x={84} y={30} width={272} height={16} rx={6} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-80} y={480} width={W + 160} height={30} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        {/* 大きな竹の縁台の座面 (寄り) */}
        <path d="M -80 520 L 2000 520 L 2000 1100 L -80 1100 Z" fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => {
          const yy = 540 + i * 48;
          return (
            <g key={i}>
              <line x1={-80} y1={yy} x2={2000} y2={yy} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={-80} y1={yy + 6} x2={2000} y2={yy + 6} stroke={C.bambooLight} strokeWidth={4} opacity={0.6} />
              {[0, 1, 2].map((j) => {
                const nx = (rnd(3114, i * 3 + j) * 1900) | 0;
                return <line key={j} x1={nx} y1={yy + 2} x2={nx} y2={yy + 44} stroke={C.bambooDark} strokeWidth={4} />;
              })}
            </g>
          );
        })}
        {/* 主役: 竹夫人 */}
        <L3aTube id="yw114tube" x={900} y={540} L={1420} R={128} rot={tilt} spin={spin} sw={1.3} />
        {/* 網目を走る光 */}
        <g transform={`translate(900 540) rotate(${tilt})`} opacity={0.5}>
          <rect x={glint - 710} y={-128} width={40} height={256} fill={KRP.white} transform={`skewX(-20)`} opacity={glint < 1400 ? 0.5 : 0} />
        </g>
        {/* 物差し (大きさ) */}
        <g transform={`translate(900 540) rotate(${tilt})`} opacity={ruler}>
          <line x1={-710} y1={-200} x2={710} y2={-200} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={-710 + i * 142} y1={-200} x2={-710 + i * 142} y2={i % 5 === 0 ? -232 : -218} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        <TagPlate x={840} y={285} text="約1m" size={40} t={ruler} />
        {/* 縁台の上のうちわと湯のみ (大きさの手がかり) */}
        <g transform="translate(1540 880) rotate(18)">
          <line x1={0} y1={0} x2={0} y2={90} stroke={C.bambooDark} strokeWidth={12} strokeLinecap="round" />
          <ellipse cx={0} cy={-50} rx={74} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -50 -60 Q 0 -10 50 -66" fill="none" stroke={C.pad} strokeWidth={6} />
        </g>
        <g transform="translate(300 900)">
          <ellipse cx={0} cy={50} rx={60} ry={14} fill={KRP.ink} opacity={0.18} />
          <path d="M -50 -30 L -40 46 Q 0 58 40 46 L 50 -30 Z" fill={C.canal} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-30} rx={50} ry={12} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-10 + i * 20} -50 q ${10 * Math.sin(f / 6 + i)} -20 0 -40 q ${-10 * Math.sin(f / 6 + i)} -20 0 -40`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.7} />
          ))}
        </g>
      </g>
      <QMark x={1720} y={300} s={1.7} f={f} t={qm} />
    </Frame>
  );
};

// ---- 文#115 【山】 答えは、抱き枕、です。
// 設計: 寝台の上で、宋代の服の人が竹夫人に腕と脚をからめて抱えて眠っている (Person を寝かせ、腕を自分で描き足す)。顔は気持ちよさそう (smile)。札「抱き枕」
// どこ: 宋代の寝室の夜。奥の壁に丸窓 (月)、天蓋つきの木の寝台、蚊帳の布は左右にたばねてある。頭の下に宋の陶枕
// 演出: 寝台を少し見下ろす。宋代の服の男が竹夫人に右腕と右脚をからめて、すやすや (目を閉じた笑顔 = 気持ちよさそう)
// 動き: カメラがゆっくり寄る。胸が息で上下。Zzz がのぼる。窓からの風で蚊帳がゆれる。札「抱き枕」が f14 でぽん
const Yw115: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const breath = Math.sin(f / 11) * 4;
  const tag = seg(f, 14, 26);
  const px = 1340, py = 560, ps = 2;
  const S = [px - 296, py - 134 + breath * 0.5];
  const Hd = [px - 160, py - 196];
  return (
    <Frame f={f} seed={3115} bg={C.nightDeep} dark>
      <g transform={`translate(${1060 * (1 - cam)} ${520 * (1 - cam)}) scale(${cam})`}>
        {/* 奥の壁と丸窓 */}
        <rect x={-40} y={-40} width={W + 80} height={420} fill={C.bedWoodDark} />
        <rect x={-40} y={-40} width={W + 80} height={420} fill={C.night} opacity={0.35} />
        <circle cx={960} cy={170} r={140} fill={C.night} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={1010} cy={140} r={46} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={840 + i * 60} y1={40} x2={840 + i * 60} y2={300} stroke={C.bedWood} strokeWidth={7} />)}
        <circle cx={960} cy={170} r={140} fill="none" stroke={C.bedWood} strokeWidth={14} />
        {/* 月の光の帯 */}
        <path d="M 860 290 L 1060 290 L 1500 760 L 700 760 Z" fill={C.moon} opacity={0.1} />
        {/* 寝台の天蓋と柱 */}
        <rect x={150} y={20} width={1620} height={46} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={190 + i * 132} y={30} width={60} height={26} rx={6} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={170} y={20} width={44} height={860} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1706} y={20} width={44} height={860} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        {/* たばねた蚊帳 (風でゆれる) */}
        {[-1, 1].map((sd) => {
          const bx = sd < 0 ? 214 : 1706;
          const sw = Math.sin(f / 12 + sd) * 16;
          return (
            <g key={sd}>
              <path d={`M ${bx} 66 Q ${bx - sd * 150 + sw} 260 ${bx - sd * 40} 330 Q ${bx - sd * 120 + sw} 480 ${bx - sd * 30 + sw} 640 L ${bx} 640 Z`}
                fill={C.curtain} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
              <rect x={bx - (sd < 0 ? 0 : 70)} y={318} width={70} height={22} rx={8} fill={C.lantern} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 寝台のござ (見下ろし) */}
        <path d="M 230 380 L 1690 380 L 1740 740 L 180 740 Z" fill={C.mat} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 14 }, (_, i) => {
          const yy = 400 + i * 24;
          return <line key={i} x1={lerp(228, 182, (yy - 380) / 360)} y1={yy} x2={lerp(1692, 1738, (yy - 380) / 360)} y2={yy} stroke={C.matLine} strokeWidth={3} />;
        })}
        {/* 寝台の手前のへりと脚 */}
        <rect x={170} y={740} width={1580} height={60} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={240 + i * 190} y={756} width={110} height={28} rx={8} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={180} y={800} width={60} height={120} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1680} y={800} width={60} height={120} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 陶枕 (宋の焼き物の枕) */}
        <g transform="translate(860 650)">
          <path d="M -150 -40 Q 0 -10 150 -40 L 140 50 L -140 50 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -150 -40 Q 0 -10 150 -40" fill="none" stroke={C.canal} strokeWidth={8} />
          <path d="M -80 14 q 20 -20 40 0 q 20 20 40 0 q 20 -20 40 0" fill="none" stroke={C.canal} strokeWidth={5} />
        </g>
        {/* 寝ている人 (Person を寝かせる) */}
        <g transform={`translate(${px} ${py}) rotate(-90)`}>
          <g transform={`scale(1 ${1 + breath * 0.004})`}>
            <Person x={0} y={0} s={ps} f={f} face="joy" cloth={C.songCloth} clothDark={C.songClothDark} still />
            <g transform={`scale(${ps})`}><L3aRobe cloth={C.songCloth} dark={C.songClothDark} /></g>
          </g>
        </g>
        {/* 薄掛け (足もと) */}
        <rect x={px - 160} y={py - 96} width={230} height={270} rx={30} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${px - 140} ${py - 40 + i * 70} q 50 -16 100 0 q 50 16 90 0`} fill="none" stroke={C.pad} strokeWidth={4} opacity={0.7} />)}
        {/* 竹夫人 (体の横に添わせて抱える) */}
        <L3aTube id="yw115tube" x={px - 110} y={py - 150} L={440} R={46} spin={0.4} sw={0.8} />
        {/* からめた右脚 (薄掛けから出て、筒の上にかける) */}
        {[[KRP.ink, 58], [C.songClothDark, 48]].map(([col, w], i) => (
          <path key={i} d={`M ${px - 70} ${py - 80} Q ${px - 40} ${py - 240} ${px + 20} ${py - 236} L ${px + 110} ${py - 180}`}
            fill="none" stroke={col as string} strokeWidth={w as number} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <ellipse cx={px + 128} cy={py - 168} rx={34} ry={18} fill={KRP.ink} transform={`rotate(30 ${px + 128} ${py - 168})`} />
        {/* からめた右腕 (筒を上から抱える) */}
        {[[KRP.ink, 54], [C.songCloth, 44]].map(([col, w], i) => (
          <path key={i} d={`M ${S[0]} ${S[1]} Q ${S[0] + 10} ${py - 250} ${Hd[0]} ${Hd[1]}`}
            fill="none" stroke={col as string} strokeWidth={w as number} strokeLinecap="round" />
        ))}
        <circle cx={Hd[0]} cy={Hd[1]} r={21} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 髪のまげ (寝るときは帽子を取っている) */}
        <circle cx={px - 600} cy={py - 10} r={30} fill={KRP.ink} />
        {/* Zzz */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={760 + t * 60 + i * 30} y={420 - t * 140} fontFamily={FONT} fontWeight={900}
              fontSize={40 + i * 12} fill={C.moon} stroke={KRP.ink} strokeWidth={3} paintOrder="stroke" opacity={Math.sin(t * Math.PI)}>z</text>
          );
        })}
        <L3aFireflies f={f} seed={3155} n={3} x0={300} y0={120} w={400} h={200} />
      </g>
      <TagPlate x={1440} y={230} text="抱き枕" size={60} t={tag} />
    </Frame>
  );
};

// ---- 文#116 【図】 夏の暑い夜に、抱えて寝ると、すき間を風が通って、涼しいのです。
// 設計: 竹夫人の断面図 (世界=宋代の書物の挿絵のページ)。筒の網目を風の矢印 (水色) が通り抜け、抱えた腕と体のあいだを冷やす。札「風が通る」「涼しい」
// どこ: 机の上に広げた古い絵巻 (木版の挿絵風)。両端に軸、すみに朱の印
// 演出: 体の断面・抱えた腕・竹夫人の輪切りを墨の線で。右から風の矢印が網目のすき間を抜け、腕と体のあいだを通って左へ
// 動き: 風の点線が流れる。はじめ赤い熱のゆらぎが体から立つ→風が届くと消えて、体の色が赤から水色へ冷える
const Yw116: React.FC<{ f: number }> = ({ f }) => {
  const cool = seg(f, 12, 34);
  const t1 = seg(f, 20, 30);
  const t2 = seg(f, 30, 40);
  const R = 200;
  const tcx = 900, tcy = 470;
  const flow = -f * 6;
  const winds = [
    `M 1640 360 C 1300 340 1120 380 ${tcx + 40} ${tcy - 60} C 800 ${tcy - 110} 640 360 520 300`,
    `M 1640 480 C 1340 470 1180 480 ${tcx} ${tcy} C 720 ${tcy + 10} 640 520 520 520`,
    `M 1640 600 C 1320 620 1140 600 ${tcx + 30} ${tcy + 90} C 780 ${tcy + 150} 640 680 500 660`,
  ];
  return (
    <Frame f={f} seed={3116} bg={C.bedWoodDark}>
      {/* 机 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.bedWood} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M -20 ${80 + i * 150} q 480 ${rnd(3116, i) * 30 - 15} 980 0 q 480 ${rnd(3117, i) * 30 - 15} 980 0`} fill="none" stroke={C.bedWoodDark} strokeWidth={5} opacity={0.5} />
      ))}
      {/* 絵巻 */}
      <rect x={130} y={120} width={1660} height={760} fill={C.paperOld} stroke={KRP.ink} strokeWidth={6} />
      <rect x={130} y={120} width={1660} height={760} fill={C.paperEdge} opacity={0.18} />
      <rect x={170} y={160} width={1580} height={680} fill="none" stroke={C.inkWash} strokeWidth={4} />
      <rect x={182} y={172} width={1556} height={656} fill="none" stroke={C.inkWash} strokeWidth={2} />
      {[110, 1810].map((xx) => (
        <g key={xx}>
          <rect x={xx - 22} y={100} width={44} height={800} rx={14} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={xx - 30} y={86} width={60} height={26} rx={8} fill={C.wine} stroke={KRP.ink} strokeWidth={4} />
          <rect x={xx - 30} y={888} width={60} height={26} rx={8} fill={C.wine} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 朱の印 */}
      <rect x={1620} y={690} width={90} height={90} rx={6} fill="none" stroke={C.seal} strokeWidth={7} />
      <path d="M 1640 712 h 50 M 1665 712 v 50 M 1640 762 h 50" stroke={C.seal} strokeWidth={7} />
      {/* 体の断面 (腹のあたり) */}
      <ellipse cx={420} cy={480} rx={170} ry={250} fill={C.blush} opacity={0.55 * (1 - cool)} />
      <ellipse cx={420} cy={480} rx={170} ry={250} fill={C.wind} opacity={0.4 * cool} />
      <ellipse cx={420} cy={480} rx={170} ry={250} fill="none" stroke={C.inkWash} strokeWidth={7} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={300 + i * 26} y1={300 + (i % 2) * 10} x2={280 + i * 26} y2={660} stroke={C.inkWash} strokeWidth={2.5} opacity={0.3} />
      ))}
      {/* 熱のゆらぎ (冷えると消える) */}
      <g opacity={1 - cool}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${340 + i * 70} 210 q 14 -24 0 -48 q -14 -24 0 -48`} fill="none" stroke={KRP.red} strokeWidth={6}
            strokeLinecap="round" transform={`translate(0 ${-((f * 2 + i * 10) % 30)})`} />
        ))}
      </g>
      {/* 竹夫人の輪切り: ひごの断面がぐるりと並び、あいだがすき間 */}
      <circle cx={tcx} cy={tcy} r={R} fill={C.paperOld} />
      <circle cx={tcx} cy={tcy} r={R} fill="none" stroke={C.inkWash} strokeWidth={3} strokeDasharray="6 10" />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return (
          <rect key={i} x={-26} y={-11} width={52} height={22} rx={8} fill={C.bamboo} stroke={C.inkWash} strokeWidth={4}
            transform={`translate(${tcx + Math.cos(a) * R} ${tcy + Math.sin(a) * R}) rotate(${(a * 180) / Math.PI + 90})`} />
        );
      })}
      <text x={tcx} y={tcy + 14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.inkWash} opacity={0.5}>空洞</text>
      {/* 抱えた腕 (体から竹夫人の上をまわって先へ) */}
      <path d={`M 470 250 Q 600 140 ${tcx} ${tcy - R - 50} Q ${tcx + R + 60} ${tcy - R} ${tcx + R + 40} ${tcy - 40}`}
        fill="none" stroke={C.inkWash} strokeWidth={80} strokeLinecap="round" />
      <path d={`M 470 250 Q 600 140 ${tcx} ${tcy - R - 50} Q ${tcx + R + 60} ${tcy - R} ${tcx + R + 40} ${tcy - 40}`}
        fill="none" stroke={C.paperOld} strokeWidth={66} strokeLinecap="round" />
      <path d={`M 470 250 Q 600 140 ${tcx} ${tcy - R - 50} Q ${tcx + R + 60} ${tcy - R} ${tcx + R + 40} ${tcy - 40}`}
        fill="none" stroke={C.wind} strokeWidth={66} strokeLinecap="round" opacity={0.35 * cool} />
      {/* 風 (水色の流れる点線と矢じり) */}
      {winds.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" strokeDasharray="44 30" strokeDashoffset={flow + i * 20} opacity={0.85} />
          <path d={d} fill="none" stroke={C.wind} strokeWidth={10} strokeLinecap="round" strokeDasharray="44 30" strokeDashoffset={flow + i * 20} />
        </g>
      ))}
      {[[520, 300, 200], [520, 520, 180], [500, 660, 170]].map(([ax, ay, r], i) => (
        <polygon key={i} points="0,0 34,-20 34,20" fill={C.windDeep} stroke={KRP.ink} strokeWidth={4}
          transform={`translate(${ax} ${ay}) rotate(${r - 180})`} opacity={seg(f, 8 + i * 3, 16 + i * 3)} />
      ))}
      <TagPlate x={1400} y={250} text="風が通る" size={50} t={t1} />
      <TagPlate x={420} y={760} text="涼しい" size={50} t={t2} fill={C.curtain} />
    </Frame>
  );
};

// ---- 文#117 【並】 唐の時代には「竹夾膝」、ひざにはさむ竹、と呼ばれていました。
// 設計: 唐の時代の人 (服をやや古風に) が、竹夫人をひざにはさんで座り、扇であおぐ。札「竹夾膝」「唐」
// どこ: 唐の都の庭 (朱塗りの欄干・牡丹・遠くに大雁塔のような塔)。夏の昼下がり
// 演出: 唐風の赤茶の服 (柔らかい幞頭の垂れ) の男が、丸い腰掛けに座り、竹夫人をひざのあいだに斜めにはさんで、団扇であおぐ
// 動き: 団扇が f でぱたぱた→風の筋が顔へ。カメラがゆっくり寄る。牡丹の花びらが1枚ひらり。札は f10 と f20 でぽん
const Yw117: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const fan = Math.sin(f / 3.2) * 22;
  const tA = seg(f, 10, 22);
  const tB = seg(f, 20, 32);
  const px = 860, seatY = 640, ps = 1.6;
  const py = seatY + 52 * ps;
  const petal = (f % 60) / 60;
  return (
    <Frame f={f} seed={3117} bg={C.sky}>
      <g transform={`translate(${860 * (1 - cam)} ${500 * (1 - cam)}) scale(${cam})`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.sky} />
        {/* 遠くの塔 (唐の都) */}
        <g transform="translate(1560 470)" opacity={0.6}>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={-70 + i * 8} y={-60 - i * 52} width={140 - i * 16} height={52} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-84 + i * 8} y={-66 - i * 52} width={168 - i * 16} height={10} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          <path d="M -12 -424 L 0 -470 L 12 -424 Z" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <path d="M -40 470 Q 500 420 1000 460 Q 1500 420 1960 470 L 1960 520 L -40 520 Z" fill={C.willow} opacity={0.6} />
        {/* 地面 (石だたみ) */}
        <rect x={-40} y={500} width={W + 80} height={620} fill={C.stone} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40} y1={540 + i * 90} x2={W + 40} y2={540 + i * 90} stroke={C.stoneDark} strokeWidth={4} />)}
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={(i % 12) * 170 + (Math.floor(i / 12) % 2) * 85} y1={540 + Math.floor(i / 12) * 90} x2={(i % 12) * 170 + (Math.floor(i / 12) % 2) * 85} y2={630 + Math.floor(i / 12) * 90} stroke={C.stoneDark} strokeWidth={3} />)}
        {/* 朱塗りの欄干 */}
        <rect x={-40} y={420} width={W + 80} height={22} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={500} width={W + 80} height={18} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 130} y={420} width={20} height={98} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />)}
        {Array.from({ length: 15 }, (_, i) => <path key={i} d={`M ${i * 130 + 20} 442 L ${i * 130 + 130} 500 M ${i * 130 + 130} 442 L ${i * 130 + 20} 500`} stroke={C.pillar} strokeWidth={6} />)}
        {/* 牡丹 (左) */}
        {([[230, 520, 1.2], [370, 560, 1], [140, 600, 0.9]] as const).map(([bx, by, bs], i) => (
          <g key={i} transform={`translate(${bx} ${by + Math.sin(f / 16 + i) * 3}) scale(${bs})`}>
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <path key={r} d="M 0 0 Q -40 -30 -10 -70 Q 0 -50 10 -70 Q 40 -30 0 0 Z" fill={C.lotus} stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${r})`} />
            ))}
            <circle r={18} fill={C.lotusDeep} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -80 60 Q -30 30 0 70 Q 30 30 80 60" fill={C.pad} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        <path d={`M ${300 + petal * 400} ${480 + petal * 300 + Math.sin(petal * 12) * 20} q 14 -10 24 4 q -10 14 -24 -4 Z`} fill={C.lotus} stroke={KRP.ink} strokeWidth={2.5} />
        {/* 丸い腰掛け (墩) */}
        <path d={`M ${px - 150} ${seatY + 10} Q ${px - 170} ${seatY + 130} ${px - 130} ${seatY + 250} L ${px + 130} ${seatY + 250} Q ${px + 170} ${seatY + 130} ${px + 150} ${seatY + 10} Z`}
          fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={px} cy={seatY + 10} rx={150} ry={26} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        {[-80, 0, 80].map((dx) => <circle key={dx} cx={px + dx} cy={seatY + 130} r={14} fill={C.wine} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 座る人 (唐の服・柔らかい幞頭) */}
        <g transform={`translate(${px} ${py}) scale(${ps})`}>
          <path d="M -40 -296 Q -70 -250 -64 -170 L -48 -170 Q -54 -250 -26 -290 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 40 -296 Q 70 -250 64 -170 L 48 -170 Q 54 -250 26 -290 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <Person x={px} y={py} s={ps} f={f} face="smile" cloth={C.tangCloth} clothDark={C.tangClothDark} pose="hold" />
        <L3aOn x={px} y={py} s={ps} f={f}>
          <L3aFutou wing={0} />
          <path d="M -24 -160 L 0 -134 L 24 -160" fill="none" stroke={C.wine} strokeWidth={6} />
        </L3aOn>
        {/* ひざ (足を開いて座る) とすね */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <rect x={px + sd * 120 - 26} y={seatY + 30} width={52} height={210} rx={18} fill={C.tangClothDark} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={px + sd * 126} cy={seatY + 250} rx={40} ry={16} fill={KRP.ink} />
          </g>
        ))}
        <path d={`M ${px - 90} ${seatY - 26} Q ${px - 150} ${seatY - 10} ${px - 150} ${seatY + 40} L ${px - 90} ${seatY + 40} Z`} fill={C.tangCloth} stroke={KRP.ink} strokeWidth={5} />
        {/* 竹夾膝 (ひざのあいだに斜めにはさむ) */}
        <L3aTube id="yw117tube" x={px} y={seatY + 20} L={330} R={36} rot={-58} spin={0.3} sw={0.7} />
        {/* ひざがしら (筒の手前) */}
        {[-1, 1].map((sd) => (
          <ellipse key={sd} cx={px + sd * 92} cy={seatY + 26} rx={52} ry={40} fill={C.tangCloth} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 団扇 (右手) と風 */}
        <g transform={`translate(${px + 22} ${py - 118 * ps}) rotate(${58 + fan * 0.6})`}>
          <line x1={0} y1={0} x2={0} y2={-150} stroke={C.bambooDark} strokeWidth={9} strokeLinecap="round" />
          <ellipse cx={0} cy={-210} rx={62} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 -220 Q -10 -180 30 -240" fill="none" stroke={C.lotusDeep} strokeWidth={6} />
          <circle cx={20} cy={-190} r={10} fill={C.lotus} />
        </g>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${px + 150} ${300 + i * 40} q -40 -10 -80 0`} fill="none" stroke={C.windDeep} strokeWidth={5} strokeLinecap="round"
            opacity={Math.max(0, Math.sin(f / 3.2 + i))} />
        ))}
      </g>
      <TagPlate x={200} y={240} text="唐" size={70} t={tA} />
      <TagPlate x={1260} y={680} text="竹夾膝" size={54} t={tB} />
    </Frame>
  );
};

// ---- 文#118 【並】 それが宋の時代になると、名前が変わります。
// 設計: 竹夫人に下げた木の名札が f でくるりと裏返る (表に「竹夾膝」、裏はまだ見せない)。背景は宋の町
// どこ: 宋の町の店先 (瓦の軒・赤い柱・提灯)。店台に置いた竹夫人に寄る
// 演出: 竹夫人の帯から木の名札が下がる。宋の服の袖の手が名札をつまんで、くるりと裏返していく (裏はまだ見せない)
// 動き: 名札が f20 から回り始め、f45 では半分近くまで回った瞬間 (表の字が細く見える)。回転の矢印。提灯ゆれ
const Yw118: React.FC<{ f: number }> = ({ f }) => {
  const ang = Math.min(180, Math.max(0, f - 20) * 2.2);
  const cs = Math.cos((ang * Math.PI) / 180);
  const sw = Math.sin(f / 9) * 2 * (1 - seg(f, 14, 20));
  const arr = seg(f, 22, 32);
  const tg = seg(f, 6, 16);
  const tagX = 980, TC = 590;
  return (
    <Frame f={f} seed={3118} bg={C.wallSong}>
      {/* 店の奥 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallSong} />
      {[60, 520, 1380, 1820].map((xx) => <rect key={xx} x={xx} y={-20} width={44} height={700} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />)}
      <rect x={620} y={60} width={680} height={250} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={620 + i * 85} y1={60} x2={620 + i * 85} y2={310} stroke={C.bedWood} strokeWidth={8} />)}
      {Array.from({ length: 3 }, (_, i) => <line key={i} x1={620} y1={60 + i * 83} x2={1300} y2={60 + i * 83} stroke={C.bedWood} strokeWidth={8} />)}
      <L3aRoof x={-60} y={40} w={2040} h={80} />
      <L3aLantern x={330} y={120} f={f} ph={0} s={0.9} />
      <L3aLantern x={1620} y={120} f={f} ph={2} s={0.9} />
      {/* 店台 */}
      <rect x={-20} y={640} width={W + 40} height={460} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={640} width={W + 40} height={30} fill={C.bedWoodDark} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M -20 ${720 + i * 70} q 960 ${rnd(3118, i) * 20 - 10} 1960 0`} fill="none" stroke={C.bedWoodDark} strokeWidth={4} opacity={0.5} />)}
      {/* 竹夫人 (店台の上、寄り) */}
      {/* 棚板 */}
      <rect x={160} y={346} width={1600} height={24} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
      {[260, 1660].map((xx) => <path key={xx} d={`M ${xx} 370 l 0 60 l 60 -60`} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />)}
      <L3aTube id="yw118tube" x={960} y={250} L={1440} R={92} spin={0.2 + f * 0.004} sw={1.1} />
      {/* 名札 (帯からつるす。くるりと回る) */}
      <g transform={`rotate(${sw} ${tagX} 300)`}>
        <path d={`M ${tagX} 300 L ${tagX} ${TC - 160}`} stroke={C.lantern} strokeWidth={6} />
        <circle cx={tagX} cy={300} r={10} fill={C.lantern} stroke={KRP.ink} strokeWidth={3} />
        <g transform={`translate(${tagX} ${TC}) scale(${0.9 * Math.max(0.04, Math.abs(cs))} 0.9)`}>
          <path d="M -140 -210 L 140 -210 L 140 210 L 0 250 L -140 210 Z" fill={cs > 0 ? C.bamboo : C.bambooDark} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={0} cy={-170} r={14} fill={C.tubeIn} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M -120 ${-120 + i * 70} q 120 12 240 0`} fill="none" stroke={C.bambooDark} strokeWidth={3} opacity={0.6} />)}
          {cs > 0 && ["竹", "夾", "膝"].map((ch, i) => (
            <text key={ch} x={0} y={-60 + i * 110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={KRP.ink}>{ch}</text>
          ))}
          <rect x={-140} y={-210} width={280} height={420} fill={KRP.ink} opacity={0.25 * (1 - Math.abs(cs))} />
        </g>
      </g>
      {/* 名札をつまむ手 (宋の袖) */}
      <g transform={`translate(${tagX + 126 * Math.abs(cs) + 4} ${TC + 40})`}>
        <path d="M 0 0 L 900 -40 L 900 120 L 30 70 Z" fill={C.songCloth} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 60 4 L 60 66" stroke={C.songClothDark} strokeWidth={8} />
        <circle cx={0} cy={34} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={-26} cy={20} rx={16} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 回転の矢印 */}
      <g opacity={arr}>
        <path d={`M ${tagX - 220} ${TC + 140} A 230 70 0 0 0 ${tagX + 220} ${TC + 140}`} fill="none" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
        <polygon points="0,-24 36,0 0,24" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} transform={`translate(${tagX + 222} ${TC + 136}) rotate(-70)`} />
      </g>
      <TagPlate x={200} y={560} text="宋" size={70} t={tg} />
    </Frame>
  );
};

// ---- 文#119 【山】 「竹夫人」。竹の、奥さんです。
// 設計: ★笑い。竹夫人に、ちょこんと花のかんざしと、ほんのり頬紅がついたように描く (擬人化の笑い。顔は描かない)。持ち主の男性が照れる。札「竹夫人」
// どこ: 宋の家の座敷 (夕方)。奥に山水の屏風、丸い花台に花びん、天井から提灯
// 演出: 竹夫人が「奥さん」のように男の横にすっと立っている。上の口に花のかんざし、上のほうに頬紅、胴に桃色の帯のちょう結び (顔は描かない)。男は頬を赤くして目をそらし、汗
// 動き: かんざしが f8〜18 でちょこん (きらり)、頬紅が f14〜28 でぽっと浮く、男の頬が f22〜34 で赤くなる。ハートがふわり。カメラが2人にゆっくり寄る
const Yw119: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const pin = pop(seg(f, 8, 18));
  const rouge = seg(f, 14, 28);
  const shy = seg(f, 22, 34);
  const tag = seg(f, 4, 14);
  const tx = 800, tTop = 330, tL = 500, tR = 62;
  const lean = -3 + Math.sin(f / 20) * 1;
  return (
    <Frame f={f} seed={3119} bg={C.wallSong}>
      <g transform={`translate(${1000 * (1 - cam)} ${560 * (1 - cam)}) scale(${cam})`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wallSong} />
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={KRP.orange} opacity={0.08} />
        {/* 山水の屏風 */}
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={160 + i * 270} y={110} width={270} height={560} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
            <rect x={160 + i * 270} y={110} width={270} height={560} fill={KRP.ink} opacity={i % 2 ? 0.05 : 0} />
          </g>
        ))}
        <path d="M 180 560 Q 320 300 460 520 Q 560 360 700 500 Q 860 240 1040 520 Q 1200 380 1360 520 Q 1500 300 1740 560" fill="none" stroke={C.inkWash} strokeWidth={8} opacity={0.4} />
        <path d="M 200 600 Q 500 560 800 600 Q 1200 640 1720 590" fill="none" stroke={C.inkWash} strokeWidth={5} opacity={0.3} />
        <circle cx={1580} cy={220} r={40} fill={C.seal} opacity={0.5} />
        <rect x={150} y={96} width={1640} height={18} rx={6} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        {/* 床 */}
        <rect x={-40} y={670} width={W + 80} height={460} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40} y1={720 + i * 64} x2={W + 40} y2={720 + i * 64} stroke={C.bedWoodDark} strokeWidth={4} />)}
        {/* 花台と花びん (左) */}
        <rect x={250} y={520} width={170} height={20} rx={6} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={270} y={540} width={16} height={180} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={384} y={540} width={16} height={180} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 310 520 Q 290 460 320 430 L 350 430 Q 380 460 360 520 Z" fill={C.canal} stroke={KRP.ink} strokeWidth={4} />
        {[[-30, -60], [0, -80], [30, -56]].map(([dx, dy], i) => (
          <g key={i}>
            <path d={`M 335 430 L ${335 + dx} ${430 + dy}`} stroke={C.stalkDark} strokeWidth={4} />
            <circle cx={335 + dx} cy={430 + dy} r={14} fill={C.flower} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 提灯 */}
        <L3aLantern x={1660} y={130} f={f} s={1.1} />
        {/* ★竹夫人 (立って、奥さんのように男の横に) */}
        <g transform={`rotate(${lean} ${tx} ${tTop + tL})`}>
          <ellipse cx={tx} cy={tTop + tL + 6} rx={90} ry={14} fill={KRP.ink} opacity={0.2} />
          <L3aTube id="yw119tube" x={tx} y={tTop + tL / 2} L={tL} R={tR} rot={-90} spin={0.5 + Math.sin(f / 30) * 0.1} sw={0.9} />
          {/* 頬紅 (顔は描かない。上のほうに、ほんのり2つ) */}
          <g opacity={rouge}>
            <ellipse cx={tx - 36} cy={tTop + 110} rx={26} ry={14} fill={C.blush} opacity={0.85} />
            <ellipse cx={tx + 36} cy={tTop + 110} rx={26} ry={14} fill={C.blush} opacity={0.85} />
            {[-1, 1].map((sd) => <path key={sd} d={`M ${tx + sd * 36 - 10} ${tTop + 104} l 6 10 M ${tx + sd * 36 + 4} ${tTop + 104} l 6 10`} stroke={C.lotusDeep} strokeWidth={3} />)}
          </g>
          {/* 胴の帯 (ちょう結び) */}
          <rect x={tx - tR - 4} y={tTop + 260} width={tR * 2 + 8} height={34} rx={8} fill={C.lotus} stroke={KRP.ink} strokeWidth={4.5} />
          <path d={`M ${tx + 20} ${tTop + 277} q 50 -40 60 0 q -10 40 -60 0 Z M ${tx + 20} ${tTop + 277} q -10 50 20 80 M ${tx + 20} ${tTop + 277} q 30 40 50 70`}
            fill={C.lotus} stroke={KRP.ink} strokeWidth={4} />
          {/* 花のかんざし (上の口にちょこん) */}
          <g transform={`translate(${tx + 34} ${tTop - 6}) scale(${pin}) rotate(${20 + Math.sin(f / 8) * 4})`}>
            <line x1={0} y1={0} x2={-60} y2={60} stroke={YP.brass} strokeWidth={8} strokeLinecap="round" />
            <line x1={0} y1={0} x2={-60} y2={60} stroke={KRP.ink} strokeWidth={2} />
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx={0} cy={-22} rx={14} ry={22} fill={C.flower} stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${r})`} />
            ))}
            <circle r={11} fill={C.flowerCore} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 20 20 l 4 40 M 30 14 l 10 36" stroke={YP.brass} strokeWidth={4} />
            <circle cx={24} cy={62} r={6} fill={C.flowerCore} stroke={KRP.ink} strokeWidth={2} />
            <circle cx={40} cy={52} r={6} fill={C.flowerCore} stroke={KRP.ink} strokeWidth={2} />
          </g>
          {/* きらり */}
          {pin > 0.6 && [0, 1, 2].map((i) => {
            const a = i * 2.1 + f / 10;
            return <path key={i} d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2}
              transform={`translate(${tx + 34 + Math.cos(a) * 80} ${tTop - 10 + Math.sin(a) * 60}) scale(${0.7 + 0.3 * Math.sin(f / 4 + i)})`} />;
          })}
        </g>
        {/* ハート */}
        {[0, 1].map((i) => {
          const t = ((f + i * 20) % 40) / 40;
          return <path key={i} d="M 0 8 C -20 -8 -14 -26 0 -14 C 14 -26 20 -8 0 8 Z" fill={C.flower} stroke={KRP.ink} strokeWidth={3}
            transform={`translate(${1030 + i * 30} ${420 - t * 120}) scale(${1.4 * Math.sin(t * Math.PI)})`} opacity={rouge} />;
        })}
        {/* 照れる持ち主 */}
        <Person x={1260} y={990} s={2.1} f={f} face="smile" gaze={[6, 4]} lean={6} cloth={C.songCloth} clothDark={C.songClothDark} pose="hold" />
        <L3aOn x={1260} y={990} s={2.1} f={f} lean={6}>
          <L3aRobe cloth={C.songCloth} dark={C.songClothDark} />
          <L3aFutou />
          <g opacity={shy}>
            <ellipse cx={-38} cy={-204} rx={18} ry={10} fill={C.blush} />
            <ellipse cx={38} cy={-204} rx={18} ry={10} fill={C.blush} />
            {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 38 - 8} -210 l 5 9 M ${sd * 38 + 4} -210 l 5 9`} stroke={KRP.red} strokeWidth={2.5} />)}
            <path d="M 78 -270 q 10 18 0 28 q -10 -10 0 -28 Z" fill={C.wind} stroke={KRP.ink} strokeWidth={2.5} transform={`translate(0 ${seg(f, 26, 40) * 18})`} />
            {[0, 1, 2].map((i) => <line key={i} x1={-96 - i * 4} y1={-250 + i * 22} x2={-120 - i * 4} y2={-256 + i * 22} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />)}
          </g>
        </L3aOn>
      </g>
      <TagPlate x={460} y={830 - 50 * 0.85} text="竹夫人" size={50} t={tag} />
    </Frame>
  );
};

// ---- 文#120 【山】 蘇軾や陸游といった詩人たちは、この竹夫人を、詩によみました。
// 設計: 宋代の詩人2人 (あごひげ) が、竹林の東屋で筆を持ち、紙に詩を書く。横に竹夫人。月と酒の杯。札「蘇軾」「陸游」
// どこ: 夏の夜の竹林。月の下に東屋が2つ、霧と竹でへだてて並ぶ (蘇軾と陸游は生きた時代がちがうので、同じ席には座らせない)
// 演出: 左の東屋で蘇軾、右の東屋で陸游。どちらも低い机で筆をとり、紙に詩を書いている。机に酒の杯、横に竹夫人がごろり
// 動き: 筆の先から墨の行が f で伸びていく (詩が書けていく)。杯の酒に月がゆれる。霧が流れ、カメラが左から右へゆっくりパン。蛍
const L3aPoetBooth: React.FC<{ f: number; cx: number; name: string; seed: number; phase: number; delay: number; tubeSide: 1 | -1 }> = ({ f, cx, name, seed, phase, delay, tubeSide }) => {
  const write = seg(f, 6 + delay, 38 + delay * 0.1);
  const tg = seg(f, 10 + delay, 22 + delay);
  const ps = 1.25, py = 790;
  const handY = py - 118 * ps;
  return (
    <g>
      {/* 石の基壇 */}
      <rect x={cx - 330} y={790} width={660} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={cx - 330 + i * 110} y1={792} x2={cx - 330 + i * 110} y2={838} stroke={C.stoneDark} strokeWidth={3} />)}
      {/* 柱 */}
      {[-280, 280].map((dx) => <rect key={dx} x={cx + dx - 16} y={250} width={32} height={540} fill={C.pillar} stroke={KRP.ink} strokeWidth={5} />)}
      <rect x={cx - 300} y={250} width={600} height={24} fill={C.pillar} stroke={KRP.ink} strokeWidth={4} />
      <L3aRoof x={cx - 330} y={260} w={660} h={100} />
      {/* 詩人 (座っている: 足は机に隠れる) */}
      <Person x={cx - 30} y={py} s={ps} f={f} phase={phase} face="normal" gaze={[2, 5]} cloth={C.songCloth} clothDark={C.songClothDark} pose="hold" lean={4} />
      <L3aOn x={cx - 30} y={py} s={ps} f={f} phase={phase} lean={4}><L3aFutou wing={0.9} /><L3aBeard /></L3aOn>
      {/* 竹夫人 (横にごろり) */}
      <L3aTube id={`yw120tube${seed}`} x={cx + tubeSide * 160} y={756} L={290} R={32} spin={0.3} sw={0.7} />
      {/* 低い机 */}
      <rect x={cx - 230} y={690} width={360} height={22} rx={5} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={cx - 210} y={712} width={20} height={78} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={cx + 90} y={712} width={20} height={78} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={cx - 220} y={712} width={340} height={60} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
      {/* 紙と、書けていく詩の行 (字ではなく墨の筆跡) */}
      <path d={`M ${cx - 190} 694 L ${cx + 40} 694 L ${cx + 60} 650 L ${cx - 170} 650 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      {[0, 1, 2, 3].map((i) => {
        const L = clamp01(write * 4 - i);
        return <line key={i} x1={cx + 30 - i * 44} y1={656} x2={cx + 30 - i * 44 - 10 * L} y2={656 + 32 * L} stroke={C.inkWash} strokeWidth={5} strokeDasharray="7 4" />;
      })}
      {/* 筆 (右手) */}
      <g transform={`translate(${cx - 30 + 14 * ps} ${handY}) rotate(${-24 + Math.sin(f / 4 + phase) * 6})`}>
        <line x1={0} y1={-40} x2={0} y2={50} stroke={C.bambooDark} strokeWidth={8} strokeLinecap="round" />
        <path d="M -5 50 L 5 50 L 0 74 Z" fill={C.inkWash} stroke={KRP.ink} strokeWidth={2} />
      </g>
      {/* 硯と酒の杯 */}
      <rect x={cx - 220} y={670} width={50} height={22} rx={4} fill={C.inkWash} stroke={KRP.ink} strokeWidth={3} />
      <g transform={`translate(${cx + 90} 676)`}>
        <path d="M -20 -10 L 20 -10 L 12 12 L -12 12 Z" fill={C.wine} stroke={KRP.ink} strokeWidth={3.5} />
        <ellipse cx={0} cy={-10} rx={20} ry={5} fill={C.moon} stroke={KRP.ink} strokeWidth={2.5} />
        <ellipse cx={Math.sin(f / 5 + phase) * 4} cy={-10} rx={5} ry={2} fill={KRP.white} />
      </g>
      <TagPlate x={cx} y={120} text={name} size={50} t={tg} />
    </g>
  );
};

const Yw120: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3120} bg={C.night} dark>
      <g transform={`translate(${pan} 0)`}>
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.night} />
        {/* 月 */}
        <circle cx={960} cy={110} r={120} fill={C.moon} opacity={0.14} />
        <circle cx={960} cy={110} r={70} fill={C.moon} stroke={KRP.ink} strokeWidth={5} />
        {/* 奥の竹林 */}
        {Array.from({ length: 20 }, (_, i) => (
          <L3aBamboo key={i} x={-40 + i * 104 + rnd(3120, i) * 30} y0={800} h={820} w={26 + rnd(3121, i) * 10}
            sway={Math.sin(f / 24 + i) * 0.7} seed={3140 + i} dark />
        ))}
        <rect x={-80} y={780} width={W + 160} height={360} fill={C.stalkDark} />
        {/* 2つの東屋 */}
        <L3aPoetBooth f={f} cx={560} name="蘇軾" seed={1} phase={0} delay={0} tubeSide={1} />
        <L3aPoetBooth f={f} cx={1420} name="陸游" seed={2} phase={2} delay={6} tubeSide={1} />
        {/* あいだをへだてる霧と手前の竹 */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={960 + Math.sin(f / 20 + i) * 30} cy={420 + i * 150} rx={150} ry={50} fill={C.moon} opacity={0.12} />
        ))}
        <L3aBamboo x={930} y0={900} h={700} w={58} sway={Math.sin(f / 18) * 0.8} seed={3150} />
        <L3aBamboo x={985} y0={900} h={660} w={42} sway={Math.sin(f / 16 + 1) * 0.8} seed={3151} />
        <L3aFireflies f={f} seed={3122} n={10} x0={80} y0={300} w={1760} h={420} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_111: (f) => <Yw111 f={f} />,
  yw_112: (f) => <Yw112 f={f} />,
  yw_113: (f) => <Yw113 f={f} />,
  yw_114: (f) => <Yw114 f={f} />,
  yw_115: (f) => <Yw115 f={f} />,
  yw_116: (f) => <Yw116 f={f} />,
  yw_117: (f) => <Yw117 f={f} />,
  yw_118: (f) => <Yw118 f={f} />,
  yw_119: (f) => <Yw119 f={f} />,
  yw_120: (f) => <Yw120 f={f} />,
};

export const YW_E1_MOTIFS: string[] = [
  "yw_111",
  "yw_112",
  "yw_113",
  "yw_114",
  "yw_115",
  "yw_116",
  "yw_117",
  "yw_118",
  "yw_119",
  "yw_120",
];

export const yawaE1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
