// 第3章「1300年前の全国模試。」専用のローカル部品 (科挙・中国の役所と宮城)
// このファイルは IchiB3.tsx からだけ読む。共通部品 (KarakuriScenes / IchiShared) は変更しない。
// 第16条「作り込みの床の法」: 石畳・漆喰壁・瓦の軒・絵巻の机 — 床を一段敷くための道具箱。

import React from "react";
import { KRP, Person, PersonMini } from "./KarakuriScenes";
import { W, H, FONT } from "./IchiShared";
import { GridPaper, rnd, bobOf, lerp } from "./KosoB2Parts";

export type IFace = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
export type IPose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// ===================================================================
// 色 (この章の統一パレット)
// ===================================================================
export const C3 = {
  ink: "#3A3A34",
  plaster: "#E3DAC4",      // 役所の漆喰壁
  plasterShade: "#CDC1A4",
  brick: "#BCA987",        // 城壁
  brickDark: "#9B8866",
  tile: "#6E7A78",         // 瓦
  tileDark: "#515D5A",
  stone: "#CFC8B4",        // 石畳
  stoneLine: "#ADA38C",
  wood: "#9B7B4F",
  woodDark: "#775B36",
  robe: "#4A5A78",         // 官人の長袍
  robeDark: "#36425C",
  robeGray: "#8C8676",     // 受験生の衣
  robeGrayDark: "#6E6858",
  red: "#B5452F",
  redDeep: "#8C3220",
  paper: "#F3ECD9",
  paperDark: "#DCD0B4",
  sumi: "#2E2A26",
  sky: "#DCE3DE",
  skyWarm: "#EBDCBC",
  mapPaper: "#E7DCC2",
  mapLine: "#A08A62",
  gold: "#B8933E",
  leaf: "#8E9A7E",
  horse: "#8A6A4E",
  horseDark: "#6B5038",
  sea: "#BCCBC8",
};

// ===================================================================
// 床 — 石畳 (目地・小石・ひび・手前の影)
// ===================================================================
export const StoneFloor: React.FC<{ y?: number; k?: number; op?: number }> = ({
  y = 752, k = 0, op = 1,
}) => (
  <g opacity={op}>
    <rect x={0} y={y} width={W} height={H - y} fill={C3.stone} />
    <line x1={0} y1={y} x2={W} y2={y} stroke={C3.ink} strokeWidth={4} opacity={0.7} />
    {[0, 1, 2, 3, 4, 5].map((r) => {
      const yy = y + 16 + r * 20 + r * r * 8;
      if (yy > H - 6) return null;
      const pitch = 110 + r * 32;
      const off = ((r + k) % 2) * pitch * 0.5;
      return (
        <g key={r} stroke={C3.stoneLine} opacity={0.5}>
          <line x1={0} y1={yy} x2={W} y2={yy} strokeWidth={2.6} />
          {Array.from({ length: Math.ceil(W / pitch) + 1 }, (_, c) => (
            <line key={c} x1={off + c * pitch} y1={yy}
              x2={off + c * pitch} y2={Math.min(H, yy + 20 + r * 14)} strokeWidth={2.2} />
          ))}
        </g>
      );
    })}
    {Array.from({ length: 20 }, (_, i) => (
      <ellipse key={i} cx={rnd(i + 3 + k * 7) * W} cy={y + 14 + rnd(i + 51 + k) * (H - y - 24)}
        rx={4 + rnd(i + 90) * 6} ry={3 + rnd(i + 130) * 3.5} fill={C3.stoneLine} opacity={0.55} />
    ))}
    <path d={`M ${200 + k * 90} ${y + 24} l 54 36 l -22 34 l 64 48`}
      fill="none" stroke={C3.stoneLine} strokeWidth={2.4} opacity={0.5} />
    <path d={`M ${1460 - k * 70} ${y + 52} l -46 32 l 28 40`}
      fill="none" stroke={C3.stoneLine} strokeWidth={2.2} opacity={0.45} />
    <rect x={0} y={H - 54} width={W} height={54} fill={C3.stoneLine} opacity={0.2} />
  </g>
);

// ===================================================================
// 瓦の反り屋根
// ===================================================================
export const TiledRoof: React.FC<{
  cx: number; y: number; w: number; h?: number; op?: number;
}> = ({ cx, y, w, h = 74, op = 1 }) => {
  const hw = w / 2;
  const ribs = Math.max(6, Math.round(w / 52));
  return (
    <g opacity={op}>
      <path
        d={`M ${cx - hw} ${y + h} Q ${cx - hw * 0.6} ${y + h - 14} ${cx - hw * 0.42} ${y + 8}
            L ${cx + hw * 0.42} ${y + 8} Q ${cx + hw * 0.6} ${y + h - 14} ${cx + hw} ${y + h}
            L ${cx + hw - 24} ${y + h + 18} L ${cx - hw + 24} ${y + h + 18} Z`}
        fill={C3.tile} stroke={C3.ink} strokeWidth={5} />
      <rect x={cx - hw * 0.46} y={y} width={hw * 0.92} height={16} rx={8}
        fill={C3.tileDark} stroke={C3.ink} strokeWidth={3.5} />
      {Array.from({ length: ribs }, (_, i) => {
        const t = (i + 0.5) / ribs;
        return (
          <line key={i}
            x1={cx - hw * 0.42 + hw * 0.84 * t} y1={y + 12}
            x2={cx - hw + 18 + (w - 36) * t} y2={y + h + 14}
            stroke={C3.tileDark} strokeWidth={2.6} opacity={0.7} />
        );
      })}
      {Array.from({ length: ribs }, (_, i) => (
        <circle key={`c${i}`} cx={cx - hw + 18 + (w - 36) * ((i + 0.5) / ribs)} cy={y + h + 18}
          r={6} fill={C3.tileDark} stroke={C3.ink} strokeWidth={2} />
      ))}
    </g>
  );
};

// ===================================================================
// 城壁 (煉瓦の段。目地まで引く)
// ===================================================================
export const CityWall: React.FC<{
  x: number; y: number; w: number; h: number; op?: number;
}> = ({ x, y, w, h, op = 1 }) => (
  <g opacity={op}>
    <rect x={x} y={y} width={w} height={h} fill={C3.brick} stroke={C3.ink} strokeWidth={5} />
    {Array.from({ length: Math.floor(h / 42) }, (_, r) => (
      <g key={r} stroke={C3.brickDark} opacity={0.65}>
        <line x1={x + 3} y1={y + (r + 1) * 42} x2={x + w - 3} y2={y + (r + 1) * 42} strokeWidth={2.4} />
        {Array.from({ length: Math.ceil(w / 112) + 1 }, (_, c) => {
          const xx = x + (r % 2) * 56 + c * 112;
          if (xx > x + w - 8 || xx < x + 8) return null;
          return <line key={c} x1={xx} y1={y + r * 42} x2={xx} y2={y + (r + 1) * 42} strokeWidth={2} />;
        })}
      </g>
    ))}
    {/* 壁の汚れ */}
    {Array.from({ length: 6 }, (_, i) => (
      <ellipse key={`s${i}`} cx={x + rnd(i + 11) * w} cy={y + rnd(i + 29) * h}
        rx={34 + rnd(i + 44) * 40} ry={14 + rnd(i + 60) * 16} fill={C3.brickDark} opacity={0.22} />
    ))}
  </g>
);

// ===================================================================
// 門扉 (アーチ + 鋲)
// ===================================================================
export const GateDoor: React.FC<{
  cx: number; y: number; w: number; h: number;
}> = ({ cx, y, w, h }) => {
  const hw = w / 2;
  return (
    <g>
      <path d={`M ${cx - hw - 20} ${y + h} L ${cx - hw - 20} ${y + 66} Q ${cx} ${y - 44} ${cx + hw + 20} ${y + 66} L ${cx + hw + 20} ${y + h} Z`}
        fill={C3.brickDark} stroke={C3.ink} strokeWidth={5} />
      <path d={`M ${cx - hw} ${y + h} L ${cx - hw} ${y + 70} Q ${cx} ${y - 26} ${cx + hw} ${y + 70} L ${cx + hw} ${y + h} Z`}
        fill={C3.redDeep} stroke={C3.ink} strokeWidth={5} />
      <line x1={cx} y1={y + 2} x2={cx} y2={y + h} stroke={C3.ink} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => (
          <circle key={`${r}-${c}`}
            cx={cx - hw + (w * (c + 0.5)) / 4}
            cy={y + 116 + (r * (h - 150)) / 5}
            r={8} fill={C3.gold} stroke={C3.ink} strokeWidth={2.5} />
        )))}
    </g>
  );
};

// ===================================================================
// 灯籠 (火がゆれる)
// ===================================================================
export const Lantern: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
}> = ({ x, y, s = 1, f, phase = 0 }) => {
  const flick = 1 + Math.sin((f + phase * 9) / 4) * 0.13;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={48} ry={13} fill={C3.stoneLine} opacity={0.45} />
      <rect x={-34} y={-26} width={68} height={26} fill={C3.stone} stroke={C3.ink} strokeWidth={4} />
      <rect x={-14} y={-120} width={28} height={96} fill={C3.stone} stroke={C3.ink} strokeWidth={4} />
      <rect x={-42} y={-196} width={84} height={78} rx={8} fill={C3.paper} stroke={C3.ink} strokeWidth={4.5} />
      <ellipse cx={0} cy={-156} rx={17 * flick} ry={23 * flick} fill={C3.gold} opacity={0.7} />
      <ellipse cx={0} cy={-158} rx={8 * flick} ry={13 * flick} fill={KRP.yellow} />
      <path d={`M -58 -196 L 0 -234 L 58 -196 Z`} fill={C3.tile} stroke={C3.ink} strokeWidth={4.5} />
      <rect x={-64} y={-200} width={128} height={10} rx={5} fill={C3.tileDark} stroke={C3.ink} strokeWidth={3} />
    </g>
  );
};

// ===================================================================
// 幟 (風に鳴る)
// ===================================================================
export const Nobori: React.FC<{
  x: number; y: number; h?: number; f: number; phase?: number; color?: string;
}> = ({ x, y, h = 300, f, phase = 0, color = C3.red }) => {
  const a = Math.sin((f + phase * 11) / 9) * 14;
  const b = Math.sin((f + phase * 11) / 7 + 1) * 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-5} y={-h} width={10} height={h} fill={C3.wood} stroke={C3.ink} strokeWidth={3.5} />
      <circle cx={0} cy={-h - 6} r={8} fill={C3.gold} stroke={C3.ink} strokeWidth={3} />
      <path d={`M 5 ${-h + 12} Q ${44 + a} ${-h + 70} ${5 + b} ${-h + 128}
                Q ${44 - a} ${-h + 186} ${5} ${-h + 244} L 5 ${-h + 12} Z`}
        fill={color} stroke={C3.ink} strokeWidth={4} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={5 + 18 + (i % 2 ? a : b) * 0.3} cy={-h + 48 + i * 66} r={7}
          fill={KRP.white} opacity={0.75} />
      ))}
    </g>
  );
};

// ===================================================================
// 官人・受験生 (Person に 幞頭 と 長袍 を重ねる。画風は共通部品のまま)
// ===================================================================
export const Kanjin: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  pose?: IPose; pointDir?: 1 | -1; face?: IFace; gaze?: [number, number];
  robe?: string; robeDark?: string; hat?: "futou" | "none"; lean?: number;
  sash?: string;
}> = ({
  x, y, s = 1, f, phase = 0, pose = "stand", pointDir = 1, face = "normal",
  gaze = [0, 0], robe = C3.robe, robeDark = C3.robeDark, hat = "futou", lean = 0,
  sash,
}) => (
  <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s}) rotate(${lean})`}>
    <Person x={0} y={0} s={1} still cloth={robe} clothDark={robeDark} hair="none"
      face={face} gaze={gaze} pose={pose} pointDir={pointDir} f={f} phase={phase} />
    {/* 長袍の裾 (脚を覆う。腕には触らない) */}
    <path d="M -56 -62 L -74 -4 L 74 -4 L 56 -62 Z" fill={robe} stroke={C3.ink} strokeWidth={4.5} />
    <line x1={0} y1={-60} x2={0} y2={-6} stroke={robeDark} strokeWidth={3} opacity={0.8} />
    {/* 帯 */}
    <rect x={-56} y={-78} width={112} height={20} rx={6} fill={sash ?? robeDark}
      stroke={C3.ink} strokeWidth={4} />
    {/* 合わせの襟 */}
    <path d="M -32 -158 L 0 -112 L 32 -158" fill="none" stroke={C3.ink} strokeWidth={4.5} />
    <path d="M -32 -158 L 0 -112 L 32 -158 L 32 -162 L -32 -162 Z" fill={KRP.white} opacity={0.5} />
    {/* 幞頭 */}
    {hat === "futou" && (
      <g>
        <ellipse cx={0} cy={-278} rx={56} ry={36} fill={C3.sumi} stroke={C3.ink} strokeWidth={4.5} />
        <rect x={-60} y={-272} width={120} height={20} rx={9} fill={C3.sumi} stroke={C3.ink} strokeWidth={4} />
        <path d="M -58 -262 Q -92 -246 -84 -220" fill="none" stroke={C3.sumi} strokeWidth={9} strokeLinecap="round" />
        <path d="M 58 -262 Q 92 -246 84 -220" fill="none" stroke={C3.sumi} strokeWidth={9} strokeLinecap="round" />
      </g>
    )}
  </g>
);

// ===================================================================
// 後ろ姿 (Person と同じ寸法・同じ線幅。顔は描かない)
// ===================================================================
export const PersonBack: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  cloth?: string; clothDark?: string; lookUp?: boolean; hat?: boolean;
}> = ({ x, y, s = 1, f, phase = 0, cloth = C3.robeGray, clothDark = C3.robeGrayDark, lookUp = false, hat = true }) => {
  const tilt = lookUp ? -8 : 0;
  return (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={C3.ink} strokeWidth={4.5} />
      <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={C3.ink} strokeWidth={4.5} />
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={C3.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={C3.ink} />
      <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={C3.ink} strokeWidth={4.5} />
      <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={C3.ink} strokeWidth={4.5} />
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={C3.ink} strokeWidth={5} />
      {/* 背中の縫い目と後ろ襟 */}
      <line x1={0} y1={-150} x2={0} y2={-58} stroke={clothDark} strokeWidth={3.5} opacity={0.85} />
      <path d="M -36 -164 Q 0 -142 36 -164" fill="none" stroke={C3.ink} strokeWidth={4.5} />
      {/* 長袍の裾 */}
      <path d="M -56 -62 L -74 -4 L 74 -4 L 56 -62 Z" fill={cloth} stroke={C3.ink} strokeWidth={4.5} />
      <g transform={`rotate(${tilt} 0 -170)`}>
        <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={C3.ink} strokeWidth={5.5} />
        {/* 後頭部の髪 */}
        <path d="M -62 -214 Q -66 -288 0 -292 Q 66 -288 62 -214 Q 0 -196 -62 -214 Z" fill={C3.sumi} />
        {hat && (
          <g>
            <ellipse cx={0} cy={-274} rx={52} ry={32} fill={C3.sumi} stroke={C3.ink} strokeWidth={4.5} />
            <path d="M -54 -258 Q -88 -242 -80 -216" fill="none" stroke={C3.sumi} strokeWidth={9} strokeLinecap="round" />
            <path d="M 54 -258 Q 88 -242 80 -216" fill="none" stroke={C3.sumi} strokeWidth={9} strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};

// ===================================================================
// 名簿の紙 (縦の罫 + 字の刻み)
// ===================================================================
export const MeiboSheet: React.FC<{
  x: number; y: number; w: number; h: number; cols?: number; rows?: number;
  rot?: number; op?: number; curl?: number;
}> = ({ x, y, w, h, cols = 4, rows = 7, rot = 0, op = 1, curl = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
    <rect x={3} y={5} width={w} height={h} fill={C3.plasterShade} opacity={0.5} />
    <rect x={0} y={0} width={w} height={h} fill={C3.paper} stroke={C3.ink} strokeWidth={4} />
    {Array.from({ length: cols - 1 }, (_, i) => (
      <line key={i} x1={(w * (i + 1)) / cols} y1={7} x2={(w * (i + 1)) / cols} y2={h - 7}
        stroke={C3.mapLine} strokeWidth={2} opacity={0.65} />
    ))}
    {Array.from({ length: cols }, (_, c) =>
      Array.from({ length: rows }, (_, r) => (
        <line key={`${c}-${r}`}
          x1={(w * (c + 0.5)) / cols - 7} y1={14 + (r * (h - 28)) / (rows - 1)}
          x2={(w * (c + 0.5)) / cols + 7} y2={14 + (r * (h - 28)) / (rows - 1)}
          stroke={C3.sumi} strokeWidth={4} opacity={0.7} strokeLinecap="round" />
      )))}
    {curl > 0 && (
      <path d={`M ${w} ${h} L ${w - curl} ${h} Q ${w - curl * 0.3} ${h - curl * 0.6} ${w} ${h - curl} Z`}
        fill={C3.paperDark} stroke={C3.ink} strokeWidth={3} />
    )}
  </g>
);

// ===================================================================
// 役所の壁 (漆喰 + 瓦の軒 + 勾欄 + 石畳) — 図の床その①
// ===================================================================
export const YakushoWall: React.FC<{ f: number; k?: number }> = ({ f, k = 0 }) => (
  <g>
    <rect x={0} y={0} width={W} height={260} fill={C3.sky} />
    {/* 遠景の屋根 */}
    <TiledRoof cx={300} y={92} w={700} h={62} op={0.45} />
    <TiledRoof cx={1680} y={104} w={660} h={58} op={0.4} />
    {/* 手前の軒 */}
    <TiledRoof cx={960} y={132} w={2040} h={84} />
    {/* 漆喰の壁 */}
    <rect x={0} y={234} width={W} height={528} fill={C3.plaster} />
    {Array.from({ length: 16 }, (_, i) => (
      <ellipse key={i} cx={rnd(i + 5 + k) * W} cy={260 + rnd(i + 31 + k) * 460}
        rx={64 + rnd(i + 70) * 96} ry={22 + rnd(i + 99) * 30} fill={C3.plasterShade} opacity={0.3} />
    ))}
    <line x1={0} y1={300} x2={W} y2={300} stroke={C3.plasterShade} strokeWidth={5} opacity={0.65} />
    <line x1={0} y1={234} x2={W} y2={234} stroke={C3.ink} strokeWidth={4} opacity={0.5} />
    {/* 柱 */}
    {[120, 1800].map((px) => (
      <g key={px}>
        <rect x={px - 26} y={234} width={52} height={442} fill={C3.wood} stroke={C3.ink} strokeWidth={4.5} />
        <rect x={px - 34} y={234} width={68} height={18} rx={6} fill={C3.woodDark} stroke={C3.ink} strokeWidth={3.5} />
      </g>
    ))}
    {/* 勾欄 */}
    <g>
      <rect x={0} y={668} width={W} height={16} fill={C3.wood} stroke={C3.ink} strokeWidth={4} />
      <rect x={0} y={742} width={W} height={14} fill={C3.wood} stroke={C3.ink} strokeWidth={4} />
      {Array.from({ length: 17 }, (_, i) => (
        <rect key={i} x={44 + i * 116} y={682} width={16} height={62}
          fill={C3.woodDark} stroke={C3.ink} strokeWidth={3} />
      ))}
    </g>
    <StoneFloor y={756} k={k} />
  </g>
);

// ===================================================================
// 机に広げた絵巻 (方眼はここに clip する) — 図の床その②
// ===================================================================
export const ScrollDesk: React.FC<{
  f: number; idk: string; px?: number; py?: number; pw?: number; ph?: number;
  children?: React.ReactNode; grid?: boolean;
}> = ({ f, idk, px = 170, py = 258, pw = 1580, ph = 468, children, grid = true }) => {
  const dy = py + ph;
  return (
    <g>
      {/* 部屋の壁 */}
      <rect x={0} y={0} width={W} height={H} fill={C3.plaster} />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={rnd(i + 17) * W} cy={rnd(i + 41) * 700}
          rx={70 + rnd(i + 63) * 90} ry={24 + rnd(i + 88) * 28} fill={C3.plasterShade} opacity={0.26} />
      ))}
      {/* 奥の棚と巻物 */}
      <g opacity={0.5}>
        <rect x={1380} y={80} width={460} height={150} fill={C3.wood} stroke={C3.ink} strokeWidth={4} />
        <line x1={1380} y1={156} x2={1840} y2={156} stroke={C3.woodDark} strokeWidth={4} />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <circle cx={1404 + i * 44} cy={120} r={16} fill={C3.paperDark} stroke={C3.ink} strokeWidth={3} />
            <circle cx={1404 + i * 44} cy={196} r={16} fill={C3.paperDark} stroke={C3.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      <g opacity={0.42}>
        <rect x={110} y={70} width={210} height={300} fill={C3.paper} stroke={C3.ink} strokeWidth={4} />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={140} y1={110 + i * 36} x2={290} y2={110 + i * 36}
            stroke={C3.mapLine} strokeWidth={3} />
        ))}
      </g>
      {/* 机 */}
      <rect x={40} y={dy - 24} width={W - 80} height={H - dy + 24} fill={C3.wood}
        stroke={C3.ink} strokeWidth={5} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M 60 ${dy + 16 + i * 44} Q ${600 + i * 70} ${dy + 4 + i * 44} ${W - 60} ${dy + 22 + i * 44}`}
          fill="none" stroke={C3.woodDark} strokeWidth={2.6} opacity={0.55} />
      ))}
      {/* 絵巻 (両端が巻いてある) */}
      <rect x={px + 8} y={py + 10} width={pw} height={ph} fill={C3.woodDark} opacity={0.3} />
      <rect x={px} y={py} width={pw} height={ph} fill={C3.mapPaper} stroke={C3.ink} strokeWidth={5} />
      {grid && (
        <>
          <clipPath id={`ib3sd${idk}`}>
            <rect x={px} y={py} width={pw} height={ph} />
          </clipPath>
          <g clipPath={`url(#ib3sd${idk})`}>
            <GridPaper pitch={52} opacity={0.11} tombo={false} />
          </g>
        </>
      )}
      {/* 巻いた軸 */}
      {[px - 2, px + pw + 2].map((rx, i) => (
        <g key={i}>
          <rect x={rx - 26} y={py - 14} width={52} height={ph + 28} rx={24}
            fill={C3.paperDark} stroke={C3.ink} strokeWidth={4.5} />
          <line x1={rx} y1={py - 8} x2={rx} y2={py + ph + 22} stroke={C3.mapLine} strokeWidth={3} opacity={0.7} />
        </g>
      ))}
      {children}
      {/* 文鎮 */}
      {[[px + 120, py + ph + 6], [px + pw - 120, py + ph + 6]].map(([bx, by], i) => (
        <g key={i}>
          <rect x={bx - 70} y={by - 20} width={140} height={28} rx={9}
            fill={C3.tileDark} stroke={C3.ink} strokeWidth={4.5} />
          <rect x={bx - 70} y={by - 20} width={140} height={10} rx={5} fill={KRP.white} opacity={0.22} />
        </g>
      ))}
      {/* 筆 */}
      <g transform={`translate(${px + pw - 300} ${dy + 86}) rotate(-12)`}>
        <rect x={-150} y={-9} width={250} height={18} rx={9} fill={C3.paperDark}
          stroke={C3.ink} strokeWidth={4} />
        <path d="M 100 -9 L 164 0 L 100 9 Z" fill={C3.sumi} stroke={C3.ink} strokeWidth={3.5} />
      </g>
      {/* 硯 */}
      <g transform={`translate(${px + 170} ${dy + 92})`}>
        <ellipse cx={0} cy={0} rx={62} ry={26} fill={C3.tileDark} stroke={C3.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-4} rx={44} ry={16} fill={C3.sumi} />
        <ellipse cx={-8} cy={-6} rx={14} ry={5} fill={KRP.white} opacity={0.18} />
      </g>
      {/* 机の上の光 (f でゆっくり動く) */}
      <ellipse cx={760 + Math.sin(f / 22) * 40} cy={py + ph * 0.4} rx={420} ry={150}
        fill={KRP.white} opacity={0.1} />
    </g>
  );
};

// ===================================================================
// 発表の壁 (phase 1 = まだ白紙 / phase 2 = 名簿が貼られている)
// ===================================================================
const SHEETS: [number, number, number, number, number][] = [
  // x, y, w, h, rot
  [110, 262, 150, 300, -1.5], [282, 254, 140, 320, 1], [440, 268, 156, 288, -0.6],
  [614, 250, 146, 326, 1.6], [778, 264, 152, 300, -1], [948, 256, 142, 316, 0.8],
  [1110, 268, 150, 292, -1.4], [1278, 252, 146, 322, 1.2],
  [110, 586, 160, 86, 0.6], [290, 592, 150, 80, -0.8], [462, 586, 156, 84, 1.1],
  [638, 592, 148, 78, -0.5], [812, 586, 156, 84, 0.9], [988, 592, 150, 80, -1.2],
  [1164, 586, 154, 84, 0.5], [1340, 592, 148, 78, -0.9],
];

export const HoubouWall: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const WX = 60, WY = 212, WW = 1800, WH = 474;
  const grow = (i: number) => Math.min(1, Math.max(0, (f - 2 - i * 1.6) / 8));
  return (
    <g>
      {/* 軒 */}
      <rect x={0} y={0} width={W} height={160} fill={C3.sky} />
      <TiledRoof cx={960} y={62} w={2040} h={88} />
      {/* 木枠 */}
      <rect x={WX - 28} y={WY - 26} width={WW + 56} height={WH + 86} fill={C3.wood}
        stroke={C3.ink} strokeWidth={5} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M ${WX - 20} ${WY + WH + 20 + i * 11} Q 960 ${WY + WH + 12 + i * 11} ${WX + WW + 20} ${WY + WH + 24 + i * 11}`}
          fill="none" stroke={C3.woodDark} strokeWidth={2.4} opacity={0.5} />
      ))}
      {/* 漆喰の面 */}
      <rect x={WX} y={WY} width={WW} height={WH} fill={C3.plaster} stroke={C3.ink} strokeWidth={4} />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={WX + rnd(i + 13) * WW} cy={WY + rnd(i + 37) * WH}
          rx={50 + rnd(i + 61) * 80} ry={20 + rnd(i + 87) * 26} fill={C3.plasterShade} opacity={0.3} />
      ))}
      {/* 古い貼り跡 (前回の放榜のあと) */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`g${i}`} x={WX + 60 + i * 196} y={WY + 36 + rnd(i + 7) * 300}
          width={42 + rnd(i + 23) * 34} height={30 + rnd(i + 51) * 26}
          fill={C3.paperDark} opacity={0.42} />
      ))}
      {/* 鋲 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <circle key={`t${i}`} cx={WX + 40 + i * 192} cy={WY + 16} r={7}
          fill={C3.gold} stroke={C3.ink} strokeWidth={2.5} />
      ))}
      {phase === 2 && (
        <g transform="translate(240 0)">
          {SHEETS.map(([sx, sy, sw, sh, rot], i) => {
            const t = grow(i);
            if (t <= 0) return null;
            return (
              <g key={i} transform={`translate(${sx + sw / 2} ${sy}) scale(${lerp(0.9, 1, t)}) translate(${-sw / 2} 0)`}
                opacity={t}>
                <MeiboSheet x={0} y={0} w={sw} h={sh} cols={sh > 200 ? 4 : 3} rows={sh > 200 ? 8 : 2}
                  rot={rot} curl={i === 3 ? 34 + Math.sin(f / 7) * 10 : 0} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 3点セット (①物差し ②名簿の階段 ③貼り紙の壁)
// phase 1 = 棚に並んで順に灯る / 2 = 矢印でつながる / 3 = 1つに合体
// ===================================================================
export const ToolMeasure: React.FC<{ x: number; y: number; s?: number; lit?: number }> = ({ x, y, s = 1, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.35 + lit * 0.65}>
    <rect x={-150} y={-26} width={300} height={52} rx={8} fill={C3.paperDark}
      stroke={C3.ink} strokeWidth={5} />
    {Array.from({ length: 11 }, (_, i) => (
      <line key={i} x1={-140 + i * 28} y1={-26} x2={-140 + i * 28} y2={i % 5 === 0 ? 4 : -8}
        stroke={C3.ink} strokeWidth={i % 5 === 0 ? 4 : 2.6} />
    ))}
    <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22}
      fill={C3.sumi} opacity={0.8}>1 2 3 4 5</text>
  </g>
);

export const ToolRankSteps: React.FC<{ x: number; y: number; s?: number; lit?: number }> = ({ x, y, s = 1, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.35 + lit * 0.65}>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        {/* ★作者修正 (2026-11-07): 赤は1位の色なので、一番低い段 (i=0 =「4」) ではなく
            一番高い段 (i=3 =「1」) を赤く塗る */}
        <rect x={-150 + i * 76} y={10 - i * 42} width={76} height={42 + i * 42}
          fill={i === 3 ? C3.red : C3.paper} stroke={C3.ink} strokeWidth={4.5} />
        {/* 一番高い段 (i=3) の数字は描かない。真上の赤い札が「1」を受け持つ (二重表示を避ける) */}
        {i < 3 && (
          <text x={-112 + i * 76} y={40 - i * 42} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={26} fill={C3.sumi}>{4 - i}</text>
        )}
      </g>
    ))}
    {/* 一番上に 1 の札。段 (i=3 は x=78..154 で中心 116) と中心をそろえ、段の上端 -116 より完全に上へ */}
    <rect x={81} y={-172} width={70} height={46} rx={6} fill={C3.red} stroke={C3.ink} strokeWidth={4.5} />
    <text x={116} y={-138} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
      fill={KRP.white}>1</text>
  </g>
);

export const ToolPostWall: React.FC<{ x: number; y: number; s?: number; lit?: number; f?: number }> = ({ x, y, s = 1, lit = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.35 + lit * 0.65}>
    <rect x={-140} y={-130} width={280} height={240} fill={C3.plaster} stroke={C3.ink} strokeWidth={5} />
    {Array.from({ length: 5 }, (_, i) => (
      <line key={i} x1={-130} y1={-110 + i * 48} x2={130} y2={-110 + i * 48}
        stroke={C3.plasterShade} strokeWidth={3} opacity={0.6} />
    ))}
    <MeiboSheet x={-98} y={-100} w={90} h={176} cols={3} rows={6} rot={-2} />
    <MeiboSheet x={12} y={-92} w={90} h={168} cols={3} rows={6} rot={2}
      curl={20 + Math.sin(f / 8) * 7} />
    {[-110, -40, 40, 110].map((tx) => (
      <circle key={tx} cx={tx} cy={-118} r={7} fill={C3.gold} stroke={C3.ink} strokeWidth={2.5} />
    ))}
  </g>
);

export const DohyoRing: React.FC<{
  cx: number; cy: number; r: number; color?: string; dash?: boolean; sw?: number; op?: number;
}> = ({ cx, cy, r, color = C3.red, dash = false, sw = 7, op = 1 }) => (
  <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} opacity={op}
    strokeDasharray={dash ? "18 14" : undefined} />
);

export { PersonMini };
