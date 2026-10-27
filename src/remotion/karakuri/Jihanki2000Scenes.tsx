// 自販機2000年史 (karakuri 長編) 専用のシーン集。
// 共通部品 (配色・ゆらぎ・人物・自販機・ホコリ) は KarakuriScenes.tsx から流用し、
// この回だけの絵 (地球儀・神殿・聖水の壺など) をここに足していく。
// 設計書: docs/jihanki2000-motifs.md / 台本: docs/jihanki2000-script-v5.txt

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, KARAKURI_FONT, WobbleDefs, Atmosphere, Badge, LabelPill, Stamp,
  Person, Coin, Jihanki, Ground, clamp01, seg, pop, easeOut,
} from "./KarakuriScenes";

export const W = 1920;
export const H = 1080;
export const FONT = KARAKURI_FONT;
export const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// この回のBadge (番組名は仮。チャンネル確定後に channel.ts へ寄せる)
export const J2Badge: React.FC = () => <Badge text="自販機2000年史" />;

// ===== 夜の背景 (紺の空+月+星。導入と結びで使う) =====
export const NightSky: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={0} width={W} height={720} fill="#2E3A52" />
    <rect x={0} y={0} width={W} height={300} fill="#28334A" />
    {/* 月 */}
    <circle cx={1560} cy={170} r={62} fill="#F5E6B8" stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
    <circle cx={1540} cy={158} r={12} fill="#E8D49A" opacity={0.7} />
    <circle cx={1582} cy={192} r={8} fill="#E8D49A" opacity={0.7} />
    {/* 星 (またたき) */}
    {[[220, 120], [480, 90], [760, 170], [1040, 80], [1280, 150], [340, 260], [900, 280], [1750, 330]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4}
        fill="#F7EFC9" opacity={0.35 + 0.55 * Math.abs(Math.sin((f + i * 29) / 21))} />
    ))}
  </g>
);

// 夜の光る自販機 (本体+窓あかりのにじみ)
export const JihankiNight: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g>
    {/* 地面へのあかりだまり */}
    <ellipse cx={x + 180 * s} cy={y + 650 * s} rx={330 * s} ry={46 * s}
      fill="#F5E6B8" opacity={0.16 + 0.05 * Math.sin(f / 13)} />
    {/* 窓あかりのにじみ */}
    <ellipse cx={x + 150 * s} cy={y + 150 * s} rx={300 * s} ry={210 * s}
      fill="#FFF3C4" opacity={0.2 + 0.06 * Math.sin(f / 9)} />
    <Jihanki x={x} y={y} s={s} f={f} />
  </g>
);

// 蛾 (自販機のあかりのまわりをくるくる)
const Moth: React.FC<{ cx: number; cy: number; f: number }> = ({ cx, cy, f }) => {
  const a = f / 17;
  const x = cx + Math.cos(a) * 110 + Math.sin(f / 7) * 8;
  const y = cy + Math.sin(a * 1.4) * 58;
  const flap = Math.sin(f / 2.2) * 24;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={7} ry={12} fill="#D9CBA8" stroke={KRP.ink} strokeWidth={2.5} />
      <ellipse cx={-10} cy={-4} rx={12} ry={7} fill="#EFE3BC" stroke={KRP.ink} strokeWidth={2.5}
        transform={`rotate(${-20 + flap} 0 0)`} />
      <ellipse cx={10} cy={-4} rx={12} ry={7} fill="#EFE3BC" stroke={KRP.ink} strokeWidth={2.5}
        transform={`rotate(${20 - flap} 0 0)`} />
    </g>
  );
};

// ===== 国旗・紋章 (クラフト風。角丸カード+ゆらぎ線) =====
export type FlagKind = "egypt" | "uk" | "usa" | "japan";
export const FlagCard: React.FC<{ kind: FlagKind; x: number; y: number; s?: number }> = ({ kind, x, y, s = 1 }) => {
  const fw = 220, fh = 150;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 台紙 */}
      <rect x={-fw / 2 - 10} y={-fh / 2 - 10} width={fw + 20} height={fh + 20} rx={14}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <clipPath id={`flagclip-${kind}`}>
        <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} rx={8} />
      </clipPath>
      <g clipPath={`url(#flagclip-${kind})`}>
        {kind === "japan" && (
          <g>
            <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} fill={KRP.white} />
            <circle cx={0} cy={0} r={44} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {kind === "uk" && (
          <g>
            <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} fill={KRP.blueDeep} />
            <g stroke={KRP.white} strokeWidth={30}>
              <line x1={-fw / 2} y1={-fh / 2} x2={fw / 2} y2={fh / 2} />
              <line x1={fw / 2} y1={-fh / 2} x2={-fw / 2} y2={fh / 2} />
            </g>
            <g stroke={KRP.red} strokeWidth={11}>
              <line x1={-fw / 2} y1={-fh / 2} x2={fw / 2} y2={fh / 2} />
              <line x1={fw / 2} y1={-fh / 2} x2={-fw / 2} y2={fh / 2} />
            </g>
            <g stroke={KRP.white} strokeWidth={46}>
              <line x1={0} y1={-fh / 2} x2={0} y2={fh / 2} />
              <line x1={-fw / 2} y1={0} x2={fw / 2} y2={0} />
            </g>
            <g stroke={KRP.red} strokeWidth={24}>
              <line x1={0} y1={-fh / 2} x2={0} y2={fh / 2} />
              <line x1={-fw / 2} y1={0} x2={fw / 2} y2={0} />
            </g>
          </g>
        )}
        {kind === "usa" && (
          <g>
            <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} fill={KRP.white} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-fw / 2} y={-fh / 2 + 21 + i * 42} width={fw} height={21} fill={KRP.red} />
            ))}
            <rect x={-fw / 2} y={-fh / 2} width={96} height={84} fill={KRP.blueDeep} />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <circle key={`${r}-${c}`} cx={-fw / 2 + 20 + c * 29} cy={-fh / 2 + 18 + r * 26} r={5} fill={KRP.white} />
              )),
            )}
          </g>
        )}
        {kind === "egypt" && (
          // エジプト国旗 (赤・白・黒の三色+金の鷲)。v2修正: 一目で国が分かる現代国旗に
          <g>
            <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh / 3} fill={KRP.red} />
            <rect x={-fw / 2} y={-fh / 6} width={fw} height={fh / 3} fill={KRP.white} />
            <rect x={-fw / 2} y={fh / 6} width={fw} height={fh / 3} fill={KRP.ink} />
            {/* 金の鷲 (サラディンの鷲を簡略化) */}
            <g fill="#D9A62E" stroke={KRP.ink} strokeWidth={3}>
              <path d="M -30 12 Q -28 -12 -7 -16 L -7 14 Z" />
              <path d="M 30 12 Q 28 -12 7 -16 L 7 14 Z" />
              <rect x={-9} y={-18} width={18} height={30} rx={7} />
              <circle cx={0} cy={-21} r={7} />
              <path d="M 5 -23 l 7 3 l -7 3 Z" />
            </g>
          </g>
        )}
      </g>
      <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} rx={8} fill="none" stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ===== 地球儀 (正射投影+経度緯度の海岸線データで本物の大陸の形) =====
// 大陸は [経度, 緯度] の座標列。lon0 (正面に来る経度) を動かすと回転する。
type LonLat = [number, number];
const LAND: Array<{ pts: LonLat[]; col: string }> = [
  { // アフリカ
    col: "#D4BC94",
    pts: [[-6,35],[3,37],[10,37],[10,34],[15,32],[20,32],[25,31],[32,31],[34,28],[36,22],[38,18],[43,11],[48,11],[51,12],[46,2],[41,-2],[40,-10],[36,-18],[35,-24],[31,-29],[26,-34],[20,-35],[17,-33],[15,-27],[12,-18],[13,-11],[9,-1],[9,4],[6,4],[-4,5],[-8,5],[-13,9],[-17,15],[-16,20],[-13,27],[-10,31],[-6,35]],
  },
  { // ユーラシア (ヨーロッパ〜シベリア〜中国〜東南アジア〜インド〜アラビア〜地中海)
    col: "#C9B089",
    pts: [[-9,37],[-9,43],[-2,44],[-4,48],[1,50],[3,53],[8,54],[8,58],[5,58],[5,62],[12,66],[16,69],[25,71],[31,70],[40,66],[44,68],[54,69],[68,70],[73,68],[73,73],[80,73],[86,75],[95,76],[105,78],[113,74],[123,73],[135,72],[150,70],[160,70],[170,67],[178,65],[170,62],[162,58],[156,51],[155,57],[150,59],[143,53],[138,47],[132,43],[129,39],[126,35],[122,37],[121,40],[117,39],[120,35],[121,30],[117,23],[110,20],[107,17],[106,10],[103,1],[100,6],[98,13],[94,17],[91,22],[88,21],[82,16],[80,9],[75,14],[70,21],[67,24],[61,25],[57,26],[57,20],[53,17],[45,12],[43,15],[39,20],[35,28],[36,33],[36,36],[30,36],[27,38],[25,40],[23,37],[21,37],[19,40],[19,42],[14,45],[13,44],[14,42],[16,40],[18,40],[16,38],[15,38],[13,41],[11,44],[8,44],[6,43],[3,42],[0,39],[-2,37],[-5,36],[-9,37]],
  },
  { // 日本列島 (弓なりの帯)
    col: "#D4BC94",
    pts: [[130,31],[129,33],[131,34.5],[134,35.5],[136,36.5],[137,37.5],[139,39],[140,41],[140,43],[141.5,45.5],[145,44.5],[146,43.5],[143,42],[141,39],[141,36],[140,35],[137,34.5],[135,33.5],[132,33],[131,31.5],[130,31]],
  },
  { // 北アメリカ (ハドソン湾・フロリダ・メキシコ・アラスカ)
    col: "#C9B089",
    pts: [[-166,62],[-162,67],[-157,71],[-140,70],[-125,71],[-110,73],[-96,72],[-85,70],[-80,65],[-86,63],[-93,60],[-92,57],[-85,55],[-80,55],[-78,52],[-70,47],[-60,47],[-65,45],[-70,42],[-74,40],[-76,35],[-81,31],[-80,25],[-83,29],[-89,30],[-94,29],[-97,26],[-97,22],[-94,18],[-90,16],[-86,16],[-83,10],[-80,9],[-85,12],[-92,15],[-97,17],[-105,20],[-110,23],[-114,30],[-118,33],[-121,35],[-124,40],[-124,47],[-128,51],[-133,56],[-140,59],[-148,60],[-154,58],[-160,56],[-165,55],[-162,59],[-166,62]],
  },
  { // 南アメリカ
    col: "#D4BC94",
    pts: [[-80,9],[-76,8],[-72,12],[-68,11],[-62,10],[-56,6],[-52,5],[-50,0],[-44,-3],[-38,-5],[-35,-8],[-39,-14],[-40,-20],[-42,-23],[-48,-26],[-52,-32],[-56,-35],[-58,-39],[-62,-39],[-65,-41],[-65,-45],[-68,-50],[-69,-53],[-74,-52],[-73,-46],[-74,-40],[-72,-35],[-70,-25],[-70,-18],[-76,-14],[-79,-7],[-81,-4],[-80,0],[-77,4],[-78,8],[-80,9]],
  },
  { // グリーンランド
    col: "#D4BC94",
    pts: [[-45,60],[-48,61],[-53,66],[-54,70],[-58,76],[-68,78],[-60,81],[-45,83],[-32,83],[-22,82],[-18,76],[-22,70],[-28,68],[-32,68],[-38,65],[-42,62],[-45,60]],
  },
  { // オーストラリア (カーペンタリア湾つき)
    col: "#C9B089",
    pts: [[114,-22],[113,-26],[115,-34],[119,-35],[124,-33],[129,-32],[132,-32],[135,-35],[138,-36],[140,-38],[144,-38],[147,-39],[150,-37],[153,-32],[153,-27],[151,-24],[146,-19],[143,-14],[142,-11],[140,-17],[136,-12],[132,-11],[130,-13],[126,-14],[122,-17],[117,-21],[114,-22]],
  },
  { // イギリス
    col: "#C9B089",
    pts: [[-5.5,50],[-4,51],[-3,53],[-5,54],[-5,56],[-6,58],[-4,58],[-2,57],[-2,56],[0,53],[1.5,52.5],[1,51],[-5.5,50]],
  },
  { // アイルランド
    col: "#C9B089",
    pts: [[-10,51.5],[-10,54],[-8,55],[-6,54],[-6,52],[-8,51.5],[-10,51.5]],
  },
  { // アイスランド
    col: "#D4BC94",
    pts: [[-22,64],[-18,66],[-14,65],[-15,64],[-19,63],[-22,64]],
  },
  { // マダガスカル
    col: "#C9B089",
    pts: [[49,-12],[50.5,-16],[49,-20],[47,-25],[44.5,-25],[43.5,-21],[44,-17],[46,-14],[49,-12]],
  },
  { // スマトラ
    col: "#D4BC94",
    pts: [[95,5.5],[98,4],[101,0],[104,-3],[106,-6],[103,-5],[100,-1],[96,3],[95,5.5]],
  },
  { // ボルネオ
    col: "#D4BC94",
    pts: [[109,1.5],[109.5,5],[113,7],[117,7],[119,4],[118,1],[116,-3],[113,-4],[110,-2],[109,1.5]],
  },
  { // フィリピン
    col: "#C9B089",
    pts: [[120,18],[122,17],[124,13],[123,9],[125,7],[122,8],[121,13],[120,18]],
  },
  { // ニューギニア
    col: "#D4BC94",
    pts: [[131,-1],[135,-2.5],[139,-2.5],[143,-4],[147,-6],[150,-10],[147,-9],[143,-8],[139,-8],[135,-5],[132,-3],[131,-1]],
  },
  { // ニュージーランド
    col: "#C9B089",
    pts: [[173,-35],[176,-38],[175,-41],[172,-44],[167,-46],[169,-44],[171,-42],[172,-40],[174,-37],[173,-35]],
  },
];

// 地軸の傾き (少し見下ろす角度)
const TILT = (14 * Math.PI) / 180;
const SIN_T = Math.sin(TILT);
const COS_T = Math.cos(TILT);

// 正射投影: 経度lon/緯度lat → 単位球上の (x, y)。c > 0 なら手前側 (見える)
const ortho = (lon: number, lat: number, lon0: number) => {
  const L = ((lon - lon0) * Math.PI) / 180;
  const P = (lat * Math.PI) / 180;
  const cosP = Math.cos(P);
  const sinP = Math.sin(P);
  return {
    x: cosP * Math.sin(L),
    y: COS_T * sinP - SIN_T * cosP * Math.cos(L),
    c: SIN_T * sinP + COS_T * cosP * Math.cos(L),
  };
};

// 地球儀上の地点の画面座標。裏側なら縁に寄せて visible=false
export const globePoint = (
  cx: number, cy: number, r: number, lon: number, lat: number, lon0: number,
) => {
  const p = ortho(lon, lat, lon0);
  let px = p.x, py = p.y;
  const visible = p.c > 0.03;
  if (!visible) {
    const len = Math.hypot(px, py) || 1e-6;
    px = (px / len) * 0.92;
    py = (py / len) * 0.92;
  }
  return { x: cx + px * r, y: cy - py * r, visible };
};

export const Globe: React.FC<{ cx: number; cy: number; r: number; lon0: number; f: number }> = ({
  cx, cy, r, lon0,
}) => {
  const k = r / 320;
  return (
    <g>
      {/* 台座 */}
      <path d={`M ${cx - r * 0.42} ${cy + r + 70 * k} L ${cx + r * 0.42} ${cy + r + 70 * k} L ${cx + r * 0.3} ${cy + r + 18 * k} L ${cx - r * 0.3} ${cy + r + 18 * k} Z`}
        fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
      <line x1={cx} y1={cy - r - 40 * k} x2={cx} y2={cy + r + 20 * k}
        stroke={KRP.ink} strokeWidth={8} transform={`rotate(12 ${cx} ${cy})`} opacity={0.85} />
      {/* 海 */}
      <circle cx={cx} cy={cy} r={r} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
      <clipPath id="globeclip">
        <circle cx={cx} cy={cy} r={r - 5} />
      </clipPath>
      <g clipPath="url(#globeclip)">
        {/* 大陸 (正射投影。裏側の点は球の縁に沿わせる) */}
        {LAND.map((land, i) => {
          const proj = land.pts.map(([lon, lat]) => ortho(lon, lat, lon0));
          if (!proj.some((p) => p.c > 0)) return null; // 全部裏側なら描かない
          const d = proj.map((p, j) => {
            let px = p.x, py = p.y;
            if (p.c <= 0) {
              const len = Math.hypot(px, py) || 1e-6;
              px /= len; py /= len;
            }
            return `${j === 0 ? "M" : "L"} ${(cx + px * r).toFixed(1)} ${(cy - py * r).toFixed(1)}`;
          }).join(" ") + " Z";
          return <path key={i} d={d} fill={land.col} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />;
        })}
        {/* 緯線 (正射投影では楕円になる) */}
        {[-45, -15, 15, 45].map((lat) => {
          const P = (lat * Math.PI) / 180;
          return (
            <ellipse key={lat} cx={cx} cy={cy - r * Math.sin(P) * COS_T}
              rx={r * Math.cos(P)} ry={r * Math.cos(P) * SIN_T}
              fill="none" stroke={KRP.ink} strokeWidth={2.2} opacity={0.16} />
          );
        })}
        {/* 経線 (見えている側だけ折れ線で) */}
        {[-150, -90, -30, 30, 90, 150].map((ml) => {
          let d = "";
          let pen = false;
          for (let la = -84; la <= 84; la += 7) {
            const p = ortho(ml, la, lon0);
            if (p.c > 0.02) {
              d += `${pen ? "L" : "M"} ${(cx + p.x * r).toFixed(1)} ${(cy - p.y * r).toFixed(1)} `;
              pen = true;
            } else pen = false;
          }
          return d ? <path key={ml} d={d} fill="none" stroke={KRP.ink} strokeWidth={2.2} opacity={0.16} /> : null;
        })}
        {/* 球のハイライト */}
        <ellipse cx={cx - r * 0.38} cy={cy - r * 0.42} rx={r * 0.34} ry={r * 0.2}
          fill="#FFFFFF" opacity={0.35} transform={`rotate(-28 ${cx - r * 0.38} ${cy - r * 0.42})`} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={KRP.ink} strokeWidth={8} />
    </g>
  );
};

// 地図ピン (easeOutBack でポトン)
export const MapPin: React.FC<{ x: number; y: number; t: number; color?: string; s?: number }> = ({
  x, y, t, color = KRP.red, s = 1,
}) => {
  if (t <= 0) return null;
  const drop = pop(clamp01(t));
  const yy = y - (1 - drop) * 160;
  return (
    <g transform={`translate(${x} ${yy}) scale(${s})`} opacity={clamp01(t * 3)}>
      <path d="M 0 0 C -30 -42 -34 -60 -34 -76 A 34 34 0 1 1 34 -76 C 34 -60 30 -42 0 0 Z"
        fill={color} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={-76} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 点線の弧 (fromX,fromY → toX,toY を山なりに。t=0→1 で伸びる)
export const DashArc: React.FC<{
  x1: number; y1: number; x2: number; y2: number; t: number; lift?: number; color?: string;
}> = ({ x1, y1, x2, y2, t, lift = 160, color = KRP.red }) => {
  if (t <= 0) return null;
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - lift;
  const n = 26;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * clamp01(t);
    const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    pts.push([a * x1 + b * mx + c * x2, a * y1 + b * my + c * y2]);
  }
  return (
    <g>
      <path d={pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")}
        fill="none" stroke={color} strokeWidth={7} strokeDasharray="2 22" strokeLinecap="round" />
      {/* 先端の飛行点 */}
      {t < 1 && <circle cx={pts[n][0]} cy={pts[n][1]} r={11} fill={color} stroke={KRP.ink} strokeWidth={4} />}
    </g>
  );
};

// ===== GlobeHop: 章扉 (地球儀が回る→弧→ピン→国旗+赤ハンコ→章タイトル) =====
// 地点の実際の経度・緯度
const GLOBE_SPOT: Record<string, { lon: number; lat: number }> = {
  egypt: { lon: 30, lat: 31 },     // アレクサンドリア
  uk: { lon: -0.1, lat: 51.5 },    // ロンドン
  usa: { lon: -74, lat: 40.7 },    // ニューヨーク
  japan: { lon: 137, lat: 36 },    // 日本
};

export const GlobeHopDoor: React.FC<{
  f: number;
  chapter: string;      // 「第1章」など
  title: string;        // 章タイトル
  stampText: string;    // 「紀元1世紀 エジプト」など
  to: FlagKind;         // 目的地
  from?: FlagKind;      // 前の地点 (弧の出発点)。省略時は弧なし
}> = ({ f, chapter, title, stampText, to, from }) => {
  const cx = 710, cy = 470, r = 330;
  // 回転: はじめ勢いよく→easeOutで目的地の経度が正面に来て止まる (0〜55f)
  const spot = GLOBE_SPOT[to];
  const spinT = easeOut(seg(f, 0, 55));
  const lon0 = spot.lon + (1 - spinT) * 420; // 1周ちょい西向きに回って到着
  const stopped = f >= 55;
  // 目的地の画面座標 (正射投影)
  const tp = globePoint(cx, cy, r, spot.lon, spot.lat, lon0);
  const tx = tp.x, ty = tp.y;
  // 弧 (前の地点→目的地)。前の地点が裏側なら球の縁に寄る
  const fromSpot = from ? GLOBE_SPOT[from] : null;
  let fx = cx - r * 0.7, fy = cy - r * 0.3;
  if (fromSpot) {
    const fp = globePoint(cx, cy, r, fromSpot.lon, fromSpot.lat, lon0);
    fx = fp.x; fy = fp.y;
  }
  const arcT = from ? seg(f, 58, 86) : 0;
  const pinT = seg(f, from ? 86 : 58, from ? 100 : 72);
  const flagT = pop(seg(f, from ? 102 : 76, from ? 116 : 90));
  const stampOn = f >= (from ? 118 : 92);
  const titleT = easeOut(seg(f, from ? 112 : 86, from ? 130 : 104));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={71} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          {stopped && from && <DashArc x1={fx} y1={fy} x2={tx} y2={ty} t={arcT} lift={200} />}
          {stopped && <MapPin x={tx} y={ty} t={pinT} />}
        </g>
      </svg>
      {/* 国旗 (ポン) */}
      {flagT > 0.01 && (
        <svg width={W} height={H} style={abs}>
          <WobbleDefs seed={72} />
          <g filter="url(#wobbleSoft)" transform={`translate(1430 330) scale(${flagT}) translate(-1430 -330)`}>
            <FlagCard kind={to} x={1430} y={330} s={1.35} />
          </g>
        </svg>
      )}
      {/* 赤ハンコ (年号+地名) */}
      {stampOn && <Stamp x={1230} y={470} text={stampText} size={46} />}
      {/* 章タイトル */}
      <div style={{
        position: "absolute", left: 1130, top: 620, width: 640,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6,
        }}>{chapter}</div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 64, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
        }}>{title}</div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 古代パート共通部品 =====

// 聖水の壺型マシン (外観)。x,y=底の中央。s=1 で高さ約420
export const HolyPot: React.FC<{
  x: number; y: number; s?: number; f?: number;
  pouring?: boolean;  // 注ぎ口から水
  sepia?: boolean;    // セピア (回想・遺物)
}> = ({ x, y, s = 1, f = 0, pouring = false, sepia = false }) => {
  const body = sepia ? "#C4A878" : KRP.bronze;
  const lid = sepia ? "#B29868" : "#A66A3E";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 台座 */}
      <rect x={-130} y={-24} width={260} height={24} rx={6} fill="#B5A684" stroke={KRP.ink} strokeWidth={5} />
      {/* 胴体 (アンフォラ型) */}
      <path d="M -78 -380 L 78 -380 L 58 -330 Q 118 -250 96 -120 Q 80 -24 0 -24 Q -80 -24 -96 -120 Q -118 -250 -58 -330 Z"
        fill={body} stroke={KRP.ink} strokeWidth={7} />
      {/* 胴の飾り線 */}
      <path d="M -92 -180 Q 0 -150 92 -180" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
      <path d="M -98 -220 Q 0 -192 98 -220" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
      {/* ふた */}
      <rect x={-84} y={-402} width={168} height={26} rx={9} fill={lid} stroke={KRP.ink} strokeWidth={6} />
      {/* コイン投入口 */}
      <rect x={-26} y={-396} width={52} height={13} rx={5} fill={KRP.ink} />
      {/* 取っ手 */}
      <path d="M -58 -330 Q -128 -324 -96 -240" fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <path d="M 58 -330 Q 128 -324 96 -240" fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      {/* 注ぎ口 */}
      <path d="M 88 -140 L 136 -128 L 136 -106 L 92 -112 Z" fill={lid} stroke={KRP.ink} strokeWidth={5} />
      {/* 水 */}
      {pouring && (
        <g>
          <path d={`M 130 -110 Q 136 -60 132 -8`} fill="none" stroke={KRP.blueDeep} strokeWidth={10} strokeLinecap="round" opacity={0.9} />
          {[0, 1].map((i) => (
            <circle key={i} cx={128 + Math.sin((f + i * 20) / 5) * 4} cy={-70 + ((f * 4 + i * 40) % 70)} r={5}
              fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />
          ))}
        </g>
      )}
    </g>
  );
};

// 神殿の柱列 (背景)。y=床のライン
export const TempleBG: React.FC<{ y?: number; mist?: number; f?: number }> = ({ y = 760, mist = 0, f = 0 }) => (
  <g>
    <rect x={0} y={0} width={W} height={y} fill="#EFE4CB" />
    {/* 奥の砂丘 */}
    <path d={`M 0 ${y - 210} Q 480 ${y - 290} 960 ${y - 220} Q 1440 ${y - 160} 1920 ${y - 240} L 1920 ${y} L 0 ${y} Z`}
      fill="#E3D2AC" opacity={0.8} />
    {/* 柱 */}
    {[160, 560, 960, 1360, 1760].map((x, i) => (
      <g key={i}>
        <rect x={x - 46} y={120} width={92} height={y - 140} fill="#E8DCC0" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((c) => (
          <line key={c} x1={x - 24 + c * 24} y1={140} x2={x - 24 + c * 24} y2={y - 30} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />
        ))}
        <rect x={x - 60} y={96} width={120} height={30} rx={6} fill="#DECBA0" stroke={KRP.ink} strokeWidth={6} />
        <rect x={x - 54} y={y - 44} width={108} height={26} rx={5} fill="#DECBA0" stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
    {/* 梁 */}
    <rect x={0} y={52} width={W} height={52} fill="#D9C498" stroke={KRP.ink} strokeWidth={6} />
    {/* 霧 */}
    {mist > 0 && [0, 1, 2].map((i) => {
      const mx = ((i * 820 + f * 0.8) % (W + 600)) - 300;
      return (
        <ellipse key={i} cx={mx} cy={y - 90 - i * 70} rx={320} ry={44} fill="#FFFFFF" opacity={0.22 * mist} />
      );
    })}
    {/* 床 */}
    <rect x={0} y={y} width={W} height={H - y} fill="#DACBA9" />
    <line x1={0} y1={y} x2={W} y2={y} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 古代の人 (丸頭2頭身をローブ姿に)。Person と同じ3層動き (まばたき+体ゆれ)
export type AncientRole = "priest" | "pilgrim" | "heron" | "silhouette";
export const AncientPerson: React.FC<{
  x: number; y: number; s?: number; role: AncientRole; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile";
  gaze?: [number, number]; lean?: number;
  armsCrossed?: boolean;
  hideArm?: "left" | "right"; // 腕を別描きするとき、体側の腕を消す (二重腕防止)
}> = ({ x, y, s = 1, role, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0, armsCrossed = false, hideArm }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const robe = role === "priest" ? KRP.white : role === "pilgrim" ? "#D8B46A" : "#D9D2C4";
  const robeDark = role === "priest" ? "#E4DCCB" : role === "pilgrim" ? "#C29A4E" : "#C2BAA8";
  const sil = role === "silhouette";
  const inkOr = sil ? KRP.grayDark : KRP.ink;
  const fillOr = (c: string) => (sil ? KRP.gray : c);
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* ローブ (すそ広がり) */}
      <path d="M -52 -160 L 52 -160 L 74 -6 L -74 -6 Z" fill={fillOr(robe)} stroke={inkOr} strokeWidth={5.5} />
      {/* 縦縞 (神官) */}
      {role === "priest" && !sil && (
        <g stroke={KRP.blueDeep} strokeWidth={4} opacity={0.55}>
          <line x1={-26} y1={-152} x2={-36} y2={-10} />
          <line x1={26} y1={-152} x2={36} y2={-10} />
        </g>
      )}
      {/* 帯 */}
      <rect x={-56} y={-100} width={112} height={16} rx={6} fill={fillOr(robeDark)} stroke={inkOr} strokeWidth={4} />
      {/* 腕 */}
      {armsCrossed ? (
        <g>
          <rect x={-54} y={-128} width={104} height={22} rx={11} fill={fillOr(robeDark)} stroke={inkOr} strokeWidth={4.5}
            transform="rotate(8 0 -118)" />
          <rect x={-50} y={-120} width={104} height={22} rx={11} fill={fillOr(robe)} stroke={inkOr} strokeWidth={4.5}
            transform="rotate(-8 0 -110)" />
        </g>
      ) : (
        <g>
          {hideArm !== "left" && (
            <rect x={-74} y={-150} width={21} height={78} rx={10} fill={fillOr(robeDark)} stroke={inkOr} strokeWidth={4.5} />
          )}
          {hideArm !== "right" && (
            <rect x={53} y={-150} width={21} height={78} rx={10} fill={fillOr(robeDark)} stroke={inkOr} strokeWidth={4.5} />
          )}
        </g>
      )}
      {/* 足先 */}
      <ellipse cx={-26} cy={-3} rx={17} ry={7} fill={inkOr} />
      <ellipse cx={26} cy={-3} rx={17} ry={7} fill={inkOr} />
      {/* 頭 */}
      <circle cx={0} cy={-224} r={62} fill={sil ? KRP.gray : KRP.white} stroke={inkOr} strokeWidth={5.5} />
      {/* 髪・頭巾・ひげ */}
      {role === "priest" && !sil && (
        <g>
          {/* 白い頭巾 */}
          <path d="M -64 -238 Q -66 -292 0 -294 Q 66 -292 64 -238 L 64 -196 L 48 -200 L 48 -238 Q 24 -258 0 -258 Q -24 -258 -48 -238 L -48 -200 L -64 -196 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-48} y1={-252} x2={48} y2={-252} stroke={KRP.blueDeep} strokeWidth={5} opacity={0.6} />
        </g>
      )}
      {role === "pilgrim" && !sil && (
        <path d="M -60 -238 Q -62 -288 0 -290 Q 62 -288 60 -238 Q 28 -256 0 -256 Q -28 -256 -60 -238 Z" fill={KRP.ink} />
      )}
      {role === "heron" && !sil && (
        <g>
          {/* 後ろ髪+白ひげ */}
          <path d="M -62 -236 Q -64 -282 -20 -288 Q -58 -268 -54 -228 Z" fill="#D8D2C4" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 62 -236 Q 64 -282 20 -288 Q 58 -268 54 -228 Z" fill="#D8D2C4" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -34 -186 Q -36 -140 0 -132 Q 36 -140 34 -186 Q 16 -174 0 -174 Q -16 -174 -34 -186 Z"
            fill="#EFEAE0" stroke={KRP.ink} strokeWidth={4.5} />
          {/* 頭頂はつるり */}
          <path d="M -40 -270 Q 0 -288 40 -270" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        </g>
      )}
      {/* 目 */}
      {sil ? null : blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={-218} x2={-14} y2={-218} />
          <line x1={14} y1={-218} x2={32} y2={-218} />
        </g>
      ) : (
        <g>
          <circle cx={-22 + gx} cy={-218 + gy} r={6} fill={KRP.ink} />
          <circle cx={22 + gx} cy={-218 + gy} r={6} fill={KRP.ink} />
        </g>
      )}
      {/* 眉・口 */}
      {!sil && (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
          {face === "worried" ? (
            <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
              <line x1={-32} y1={-246} x2={-12} y2={-240} />
              <line x1={12} y1={-240} x2={32} y2={-246} />
            </g>
          ) : face === "surprised" ? (
            <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
              <line x1={-32} y1={-250} x2={-12} y2={-250} />
              <line x1={12} y1={-250} x2={32} y2={-250} />
            </g>
          ) : (
            <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
              <line x1={-32} y1={-244} x2={-12} y2={-246} />
              <line x1={12} y1={-246} x2={32} y2={-244} />
            </g>
          )}
          {face === "surprised" ? (
            <ellipse cx={0} cy={-184} rx={9} ry={12} fill={KRP.ink} />
          ) : face === "smile" ? (
            <path d="M -13 -190 Q 0 -177 13 -190" />
          ) : face === "worried" ? (
            <path d="M -11 -182 Q 0 -190 11 -182" />
          ) : (
            <line x1={-9} y1={-184} x2={9} y2={-184} />
          )}
        </g>
      )}
    </g>
  );
};

// ===== 導入 (シーン1〜10) =====

// 1: 夜道にぽつんと光る自販機 / 2: 同じ絵に寄り+walker通過
const SceneNightRoad: React.FC<{ f: number; close?: boolean }> = ({ f, close }) => {
  const zoom = close ? 1.28 + 0.0012 * f : 1;
  const walkerX = close ? 300 + f * 3.2 : -500;
  const camera = `translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})`;
  return (
    <AbsoluteFill style={{ background: "#2E3A52" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={81} />
        <g transform={camera}>
          <g filter="url(#wobbleSoft)">
            <NightSky f={f} />
            {/* 家並みのシルエット */}
            <path d="M 0 720 L 0 560 L 150 560 L 150 480 L 320 480 L 320 600 L 520 600 L 520 520 L 700 520 L 700 720 Z"
              fill="#222B3E" />
            <path d="M 1700 720 L 1700 540 L 1850 540 L 1850 620 L 1920 620 L 1920 720 Z" fill="#222B3E" />
            {/* 電柱 */}
            <rect x={760} y={240} width={20} height={480} fill="#222B3E" />
            <line x1={660} y1={290} x2={880} y2={290} stroke="#222B3E" strokeWidth={10} />
            {/* 道 */}
            <rect x={0} y={720} width={W} height={H - 720} fill="#3A4258" />
            <line x1={0} y1={720} x2={W} y2={720} stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={880} x2={W} y2={880} stroke="#F2CE4C" strokeWidth={5} strokeDasharray="60 50" opacity={0.5} />
          </g>
          <g filter="url(#wobble)">
            <JihankiNight x={1150} y={190} s={0.92} f={f} />
            <Moth cx={1340} cy={260} f={f} />
            {/* 通行人 (寄りのときだけ通過) */}
            {close && walkerX < 2200 && (
              <Person x={walkerX} y={860} s={1.1} cloth="#55618A" clothDark="#424C6E" f={f} phase={2} gaze={[6, -2]} />
            )}
          </g>
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// 2: 「そう、自動販売機です」— 暗転の中、スポットライトで自販機がお披露目。左右からクラッカー (v2修正)
const SceneSpotlight: React.FC<{ f: number }> = ({ f }) => {
  const lightT = easeOut(seg(f, 2, 10)); // スポットライトが点く
  const popT = Math.max(0, f - 10); // クラッカーが鳴った後の経過フレーム
  const popped = f >= 10;
  // 紙吹雪 (左右のクラッカーから放物線で飛び散る)
  const colors = [KRP.red, KRP.blue, KRP.yellow, KRP.green, KRP.orange];
  const confetti: React.ReactNode[] = [];
  if (popped) {
    for (const dir of [1, -1]) {
      const ox = dir === 1 ? 190 : 1730;
      for (let i = 0; i < 13; i++) {
        const r1 = ((i * 37 + (dir === 1 ? 11 : 23)) % 97) / 97; // 擬似乱数
        const r2 = ((i * 53 + 7) % 89) / 89;
        const vx = dir * (7 + r1 * 15);
        const vy = -(16 + r2 * 10);
        const px = ox + vx * popT;
        const py = 730 + vy * popT + 0.42 * popT * popT;
        if (py > H + 40) continue;
        const rot = popT * (8 + r1 * 16) * (i % 2 === 0 ? 1 : -1);
        confetti.push(
          <rect key={`${dir}-${i}`} x={-14} y={-9} width={28} height={18} rx={3}
            fill={colors[i % colors.length]} stroke={KRP.ink} strokeWidth={3}
            transform={`translate(${px} ${py}) rotate(${rot})`} opacity={0.95} />,
        );
      }
    }
  }
  return (
    <AbsoluteFill style={{ background: "#171821" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={118} />
        {/* スポットライトの光の帯 (上から円すい形に) */}
        <polygon points={`870,-40 1050,-40 1420,900 500,900`} fill="#FFF3C4" opacity={0.17 * lightT} />
        <polygon points={`905,-40 1015,-40 1310,900 610,900`} fill="#FFF3C4" opacity={0.14 * lightT} />
        {/* 床のあかりだまり */}
        <ellipse cx={960} cy={880} rx={470} ry={60} fill="#FFF3C4" opacity={0.3 * lightT} />
        <g filter="url(#wobble)" opacity={lightT}>
          <Jihanki x={780} y={240} s={1.0} f={f} />
          {/* 接地の影 */}
          <ellipse cx={960} cy={872} rx={260} ry={26} fill={KRP.ink} opacity={0.3} />
        </g>
        <g filter="url(#wobble)">
          {/* クラッカー (左右の下から中央へ向けて) */}
          {[1, -1].map((dir) => (
            <g key={dir} transform={`translate(${dir === 1 ? 175 : 1745} 770) rotate(${dir === 1 ? 42 : -42})`}>
              {/* 円すいの本体 (しましま)。広い口が自販機側の斜め上、とがった持ち手が下 */}
              <polygon points="-52,0 52,0 0,150" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
              <polygon points="-34,50 -17,100 17,100 34,50" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
              {/* パンッの破裂線 (鳴った直後だけ) */}
              {popped && popT < 10 && (
                <g stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={1 - popT / 10}>
                  <line x1={0} y1={-18} x2={0} y2={-58} />
                  <line x1={-34} y1={-8} x2={-62} y2={-38} />
                  <line x1={34} y1={-8} x2={62} y2={-38} />
                </g>
              )}
            </g>
          ))}
          {confetti}
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// 3: 地球儀初登場・日本にピン / 4: 日本から点線が西へ逆走
const SceneGlobeIntro: React.FC<{ f: number; back?: boolean }> = ({ f, back }) => {
  // #4 (back): 舞台のスポットライトが「日本代表の自販機」から外れて、主役は別にいると示す (v2採用案)
  if (back) {
    const lightX = 1240 + (520 - 1240) * easeOut(seg(f, 40, 68));
    const off = easeOut(seg(f, 40, 62)); // 日本が暗がりへ
    const qT = pop(seg(f, 64, 78));
    return (
      <AbsoluteFill style={{ background: "#241F2B" }}>
        <svg width={W} height={H} style={abs}>
          <WobbleDefs seed={82} />
          <g filter="url(#wobbleSoft)">
            <rect x={0} y={820} width={W} height={H - 820} fill="#6E5940" />
            <line x1={0} y1={820} x2={W} y2={820} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <g filter="url(#wobble)">
            {/* 日本代表: 自販機 (ライトが外れると暗がりに) */}
            <g opacity={1 - off * 0.74}>
              <Jihanki x={1060} y={200} s={1.0} f={f} />
            </g>
            {/* スポットライト (横へスーッと移動) */}
            <polygon points={`${lightX - 90},-40 ${lightX + 90},-40 ${lightX + 310},850 ${lightX - 310},850`}
              fill="#FFF3C4" opacity={0.15} />
            <ellipse cx={lightX} cy={845} rx={310} ry={26} fill="#FFF3C4" opacity={0.2} />
            {/* ほんとうの主役は…？ */}
            {qT > 0.01 && (
              <g transform={`translate(520 660) scale(${qT})`}>
                <text y={120} fontFamily={FONT} fontWeight={900} fontSize={360} fill={KRP.red}
                  textAnchor="middle">？</text>
              </g>
            )}
          </g>
        </svg>
        {f <= 52 && <LabelPill x={1240} y={150} text="日本" size={38} centerX />}
        {f > 80 && <LabelPill x={520} y={260} text="今日の主役" color={KRP.red} size={38} centerX />}
        <J2Badge />
        <Atmosphere f={f} dark />
      </AbsoluteFill>
    );
  }
  // #3: 地球儀が回って日本にピン
  const cx = 960, cy = 470, r = 340;
  const spot = GLOBE_SPOT.japan;
  const spinT = easeOut(seg(f, 0, 45));
  const lon0 = spot.lon + (1 - spinT) * 300;
  const tp = globePoint(cx, cy, r, spot.lon, spot.lat, lon0);
  const tx = tp.x, ty = tp.y;
  const pinT = seg(f, 48, 62);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={82} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          <MapPin x={tx} y={ty} t={pinT} />
        </g>
      </svg>
      {pinT >= 1 && <LabelPill x={tx + 40} y={ty - 180} text="日本" size={38} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 5: 現代自販機のシルエットがセピアの壺へ画中変化
const SceneMorphPot: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 25, 70));
  // v2修正: 変わる瞬間に煙がぶわっと出る (0→1で広がりながら薄くなる)
  const smoke = seg(f, 25, 62);
  // v2修正: 逆回転する時計 (時間を巻き戻すサイン)。針がぐるぐる逆回し
  const backSpin = -f * 10;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={83} />
        <Ground y={820} />
        <g filter="url(#wobble)">
          {/* 自販機 (シルエット化しながら消える) */}
          <g opacity={1 - t} transform={`translate(760 230) scale(${1 - t * 0.12})`}>
            <g opacity={0.35}><Jihanki x={0} y={0} s={1.0} f={f} /></g>
            <rect x={0} y={0} width={360} height={620} rx={16} fill={KRP.grayDark} opacity={0.55} />
          </g>
          {/* 壺 (浮かび上がる) */}
          <g opacity={t}>
            <HolyPot x={960} y={820} s={1.1} f={f} sepia />
          </g>
          {/* 変身の煙 (もくもくした雲が外へ広がって消える) */}
          {smoke > 0.01 && smoke < 0.99 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2 + 0.35;
            const dist = 210 + smoke * 190 + (i % 3) * 26;
            const px = 960 + Math.cos(a) * dist;
            const py = 560 + Math.sin(a) * dist * 0.62;
            const r = (46 + (i % 3) * 14) * (0.6 + smoke * 0.7);
            return (
              <g key={i} opacity={0.9 * (1 - smoke)}>
                {/* 3つの円を重ねて雲の形に。背景より濃いグレーで塗る */}
                <circle cx={px - r * 0.55} cy={py + r * 0.15} r={r * 0.68} fill="#D5CCB4" stroke={KRP.ink} strokeWidth={5} />
                <circle cx={px + r * 0.55} cy={py + r * 0.2} r={r * 0.62} fill="#D5CCB4" stroke={KRP.ink} strokeWidth={5} />
                <circle cx={px} cy={py - r * 0.2} r={r * 0.8} fill="#D5CCB4" stroke={KRP.ink} strokeWidth={5} />
                {/* 内側の線を隠して1つの雲に見せる */}
                <circle cx={px - r * 0.55} cy={py + r * 0.15} r={r * 0.56} fill="#D5CCB4" />
                <circle cx={px + r * 0.55} cy={py + r * 0.2} r={r * 0.5} fill="#D5CCB4" />
                <circle cx={px} cy={py - r * 0.2} r={r * 0.68} fill="#D5CCB4" />
              </g>
            );
          })}
          {/* 逆回転する時計 (左側)。まわりの矢印も反時計回り */}
          <g transform="translate(330 430)">
            <circle r={115} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
            {[...Array(12)].map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 96} y1={Math.sin(a) * 96}
                x2={Math.cos(a) * 108} y2={Math.sin(a) * 108} stroke={KRP.ink} strokeWidth={5} />;
            })}
            <g transform={`rotate(${backSpin})`}>
              <line x1={0} y1={0} x2={0} y2={-82} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            </g>
            <g transform={`rotate(${backSpin / 12})`}>
              <line x1={0} y1={0} x2={0} y2={-54} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
            </g>
            <circle r={10} fill={KRP.ink} />
            {/* 反時計回りの矢印 (巻き戻し感) */}
            <path d="M -148 -58 A 160 160 0 0 0 -148 58" fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
            <path d="M -148 -58 l -26 2 l 16 24 Z" fill={KRP.red} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={130} text="いちばん最初のご先祖さま" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 6: 壺+「約2000年前」カウントで遡る
const ScenePot2000: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.round(2000 * easeOut(seg(f, 8, 70)));
  const done = f >= 70;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={84} />
        <Ground y={820} />
        <g filter="url(#wobble)">
          <HolyPot x={760} y={820} s={1.15} f={f} sepia />
        </g>
      </svg>
      <div style={{
        position: "absolute", left: 1060, top: 360, fontFamily: FONT,
        fontWeight: 900, color: KRP.ink,
      }}>
        <span style={{ fontSize: 56 }}>およそ </span>
        <span style={{ fontSize: 150, color: done ? KRP.red : KRP.ink }}>{n}</span>
        <span style={{ fontSize: 56 }}> 年前</span>
      </div>
      {done && <Stamp x={1150} y={560} text="記録に残る最古" size={44} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 7: 石柱の神殿外観 (霧)
const SceneTemple: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={85} />
      <g filter="url(#wobbleSoft)">
        <TempleBG mist={1} f={f} />
      </g>
    </svg>
    <LabelPill x={960} y={140} text="神殿" size={44} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 8: 聖水 (壺から水がひとしずく、上に後光、波紋ループ)
const SceneHolyWater: React.FC<{ f: number }> = ({ f }) => {
  const T = 80;
  const t = (f % T) / T;
  const dropT = seg(t, 0.1, 0.45);
  const dy = 692 + 56 * dropT * dropT;
  const rippleT = seg(t, 0.45, 0.95);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={86} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={790} mist={0.4} f={f} />
          {/* 後光 */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const a = -90 + (i - 3) * 22 + Math.sin(f / 23) * 3;
            return (
              <line key={i}
                x1={960 + Math.cos((a * Math.PI) / 180) * 250} y1={430 + Math.sin((a * Math.PI) / 180) * 250}
                x2={960 + Math.cos((a * Math.PI) / 180) * 380} y2={430 + Math.sin((a * Math.PI) / 180) * 380}
                stroke={KRP.yellow} strokeWidth={10} strokeLinecap="round" opacity={0.75} />
            );
          })}
        </g>
        <g filter="url(#wobble)">
          <HolyPot x={960} y={790} s={0.95} f={f} />
          {/* 受けの水盤 */}
          <ellipse cx={1086} cy={764} rx={120} ry={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          {/* しずく */}
          {dropT > 0 && dropT < 1 && (
            <path d={`M 1086 ${dy} q -10 14 0 24 q 10 -10 0 -24`} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
          )}
          {/* 波紋 */}
          {rippleT > 0 && (
            <g fill="none" stroke={KRP.blueDeep} opacity={1 - rippleT}>
              <ellipse cx={1086} cy={764} rx={30 + 80 * rippleT} ry={6 + 15 * rippleT} strokeWidth={5} />
              <ellipse cx={1086} cy={764} rx={16 + 54 * rippleT} ry={4 + 10 * rippleT} strokeWidth={4} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={380} y={200} text="聖水 = 神様の水" color={KRP.blueDeep} size={42} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 9: 壺→自販機への点線の旅路全体図 (平らな地図風)
const SceneJourney: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 10, 85));
  // 平らな世界地図 (正距円筒投影)。経度 -215〜155 / 緯度 -60〜80 をカードに収める
  const mapX = (lon: number) => 120 + ((lon + 215) / 370) * 1680;
  const mapY = (lat: number) => 120 + ((80 - lat) / 140) * 760;
  // 経由地: 神殿(エジプト)→ロンドン→NY→日本 (実際の経度緯度から配置)
  const stops: Array<[number, number, string]> = [
    [mapX(30), mapY(31), "神殿"],
    [mapX(-0.1), mapY(51.5), "ロンドン"],
    [mapX(-74), mapY(40.7), "ニューヨーク"],
    [mapX(137), mapY(36), "日本"],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={87} />
        <g filter="url(#wobbleSoft)">
          {/* 地図カード */}
          <rect x={120} y={120} width={1680} height={760} rx={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
          {/* 本物の形の大陸 (地球儀と同じ海岸線データ) */}
          <clipPath id="jmapclip">
            <rect x={126} y={126} width={1668} height={748} rx={20} />
          </clipPath>
          <g clipPath="url(#jmapclip)">
            {LAND.map((land, i) => (
              <path key={i}
                d={land.pts.map(([lon, lat], j) =>
                  `${j === 0 ? "M" : "L"} ${mapX(lon).toFixed(1)} ${mapY(lat).toFixed(1)}`).join(" ") + " Z"}
                fill={land.col} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            ))}
          </g>
          {/* 点線の旅路 (3区間を順に) */}
          {stops.slice(0, -1).map(([x1, y1], i) => {
            const [x2, y2] = stops[i + 1];
            const segT = clamp01(t * 3 - i);
            return <DashArc key={i} x1={x1} y1={y1} x2={x2} y2={y2} t={segT} lift={120} />;
          })}
          {/* 経由地ピン */}
          {stops.map(([x, y], i) => (
            <MapPin key={i} x={x} y={y} t={clamp01(t * 3 - i + 0.3)} s={0.8}
              color={i === stops.length - 1 ? KRP.red : KRP.orange} />
          ))}
        </g>
        {/* 出発点の壺と到着点のミニ自販機 */}
        <g filter="url(#wobble)">
          <HolyPot x={300} y={760} s={0.42} f={f} sepia />
          {t > 0.95 && <Jihanki x={1620} y={620} s={0.32} f={f} />}
        </g>
      </svg>
      {stops.map(([x, y, name], i) => (
        clamp01(t * 3 - i + 0.3) >= 1 && <LabelPill key={i} x={x} y={y + 24} text={name} size={28} centerX />
      ))}
      <LabelPill x={960} y={60} text="2000年の旅" color={KRP.red} size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 10: 自販機の透視図、コインが吸い込まれてキラン
const SceneJihankiXray: React.FC<{ f: number }> = ({ f }) => {
  const T = 85;
  const t = (f % T) / T;
  // v2修正: 人物の手元からコインが飛んで、ちゃんと投入口 (x≈1033, y≈282) に入る
  const inT = seg(t, 0.08, 0.4);
  const coinX = 1245 - 212 * easeOut(inT);
  const coinY = 660 - 378 * inT - 70 * Math.sin(inT * Math.PI);
  // 投入後: 透視の窓の中をコインが落ちて金庫へ
  const dropT = seg(t, 0.44, 0.6);
  const spark = t >= 0.64 && t < 0.86;
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={88} />
        <Ground y={860} />
        <g filter="url(#wobble)">
          <Jihanki x={700} y={200} s={1.05} f={f} />
          {/* 透視の窓 (中の金庫が見える) */}
          <rect x={726} y={560} width={220} height={180} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} opacity={0.94} />
          <rect x={760} y={600} width={150} height={110} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={835} cy={655} r={22} fill="none" stroke={KRP.yellow} strokeWidth={6} />
          {/* コインを入れる人 (v2修正で追加) */}
          <Person x={1330} y={860} s={1.15} cloth="#4E6E58" clothDark="#3C5644" f={f} phase={5} gaze={[-7, -3]} />
          {/* 飛ぶコイン: 手元→投入口 */}
          {t >= 0.08 && t < 0.4 && <Coin cx={coinX} cy={coinY} r={26} text="100" textSize={18} rotate={inT * 540} />}
          {/* 窓の中を落ちるコイン: 投入口→金庫 */}
          {t >= 0.44 && t < 0.62 && <Coin cx={835} cy={575 + 73 * dropT} r={22} text="100" textSize={15} rotate={dropT * 180} />}
          {/* キラン */}
          {spark && (
            <g transform={`translate(835 655) scale(${pop(seg(t, 0.64, 0.78))})`}>
              <path d="M 0 -34 L 8 -8 L 34 0 L 8 8 L 0 34 L -8 8 L -34 0 L -8 -8 Z"
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={120} text="2000年ぶんの発明が詰まっている" color={KRP.red} size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 第1章 神殿のコイン仕掛け (シーン12〜28) =====

// 12: アレクサンドリアの港町+大灯台
const SceneAlexandria: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={91} />
      <g filter="url(#wobbleSoft)">
        {/* 空 */}
        <rect x={0} y={0} width={W} height={620} fill="#F3E3C2" />
        <circle cx={340} cy={170} r={66} fill="#F5C96E" />
        {/* 海 */}
        <rect x={0} y={620} width={W} height={220} fill={KRP.blueSoft} />
        <line x1={0} y1={620} x2={W} y2={620} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {/* 波 (ゆれる) */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i}
            d={`M ${((i * 520 + f * 1.1) % (W + 400)) - 200} ${672 + i * 38} q 42 ${-14 + Math.sin(f / 11 + i) * 4} 84 0 q 42 14 84 0`}
            fill="none" stroke={KRP.blueDeep} strokeWidth={5} opacity={0.5} strokeLinecap="round" />
        ))}
        {/* 鳥 */}
        {[0, 1].map((i) => {
          const bx = ((i * 700 + f * 2.4) % (W + 500)) - 250;
          const by = 180 + i * 90 + Math.sin(f / 9 + i * 2) * 10;
          return (
            <path key={i} d={`M ${bx - 26} ${by} q 13 ${-16 + Math.sin(f / 4) * 5} 26 0 q 13 ${-16 + Math.sin(f / 4) * 5} 26 0`}
              fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          );
        })}
        {/* 街並み (v2修正: 窓・列柱神殿・オベリスク・ヤシの木で精巧に) */}
        <path d="M 0 620 L 0 520 L 130 520 L 130 470 L 260 470 L 260 560 L 430 560 L 430 500 L 560 500 L 560 620 Z"
          fill="#E2CFA4" stroke={KRP.ink} strokeWidth={5} />
        {/* 建物の窓と入口 */}
        {[[40, 545], [86, 545], [160, 498], [212, 498], [300, 582], [352, 582], [456, 528], [504, 528]].map(([wx, wy], i) => (
          <rect key={`w${i}`} x={wx} y={wy} width={26} height={34} rx={4} fill="#8A7146" stroke={KRP.ink} strokeWidth={3} />
        ))}
        <path d="M 62 620 L 62 586 Q 78 574 94 586 L 94 620 Z" fill="#6E5836" stroke={KRP.ink} strokeWidth={3.5} />
        {/* ヘレニズム都市らしい列柱神殿 (三角屋根+円柱) */}
        <g>
          <polygon points="600,540 750,484 900,540" fill="#EBDDBE" stroke={KRP.ink} strokeWidth={5} />
          <rect x={608} y={540} width={284} height={16} fill="#E2D2AE" stroke={KRP.ink} strokeWidth={4} />
          {[632, 688, 744, 800, 856].map((cx2, i) => (
            <rect key={`c${i}`} x={cx2 - 11} y={556} width={22} height={60} fill="#EFE5C8" stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={602} y={614} width={296} height={10} fill="#D9C498" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* オベリスク (先端が金色) */}
        <g>
          <polygon points="936,620 950,412 964,620" fill="#E8D7B0" stroke={KRP.ink} strokeWidth={4.5} />
          <polygon points="945,432 950,398 955,432" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* ヤシの木 */}
        {[[1090, 1], [1340, -1]].map(([px, flip], i) => (
          <g key={`p${i}`} transform={`translate(${px} 620) scale(${flip} 1)`}>
            <path d="M 0 0 Q -10 -70 8 -132" stroke="#8A6B42" strokeWidth={13} fill="none" strokeLinecap="round" />
            {[-72, -36, 0, 36, 72].map((a, j) => (
              <path key={j} d="M 8 -132 q 44 -20 86 -2 q -42 14 -86 2 Z"
                fill="#7BA05B" stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${a} 8 -132)`} />
            ))}
            <circle cx={14} cy={-126} r={7} fill="#A66A3E" stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 船 */}
        <g transform={`translate(${520 + Math.sin(f / 17) * 10} ${700 + Math.sin(f / 13) * 5}) rotate(${Math.sin(f / 15) * 2})`}>
          <path d="M -90 0 L 90 0 L 60 36 L -60 36 Z" fill="#A66A3E" stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={0} x2={0} y2={-90} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 0 -88 Q 60 -58 0 -18 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 大灯台 (ファロス) */}
        <g>
          <rect x={1420} y={420} width={200} height={200} fill="#EBDDBE" stroke={KRP.ink} strokeWidth={7} />
          <rect x={1455} y={280} width={130} height={140} fill="#E2D2AE" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1483} y={180} width={74} height={100} fill="#D9C498" stroke={KRP.ink} strokeWidth={6} />
          {/* 火 */}
          <path d={`M 1520 128 q 20 18 8 42 q -8 14 -28 12 q -18 -4 -16 -26 q 2 -16 16 -28 q -2 12 10 16 q 8 -6 10 -16`}
            fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} opacity={0.8 + 0.2 * Math.sin(f / 5)} />
          {/* 光のすじ */}
          <line x1={1560} y1={160} x2={1760} y2={110} stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round"
            opacity={0.5 + 0.3 * Math.sin(f / 8)} />
        </g>
      </g>
      <g filter="url(#wobble)">
        <rect x={0} y={840} width={W} height={H - 840} fill={KRP.floor} />
        <line x1={0} y1={840} x2={W} y2={840} stroke={KRP.ink} strokeWidth={5} />
        {/* エジプト国旗 (v2修正: どこの国か一目で分かるように。太陽に被らない小さめサイズ) */}
        <FlagCard kind="egypt" x={240} y={360} s={0.8} />
      </g>
    </svg>
    <LabelPill x={960} y={120} text="エジプト アレクサンドリア" size={42} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 13: 神殿前、priestが聖水で手を清める
const ScenePurify: React.FC<{ f: number }> = ({ f }) => {
  const wash = Math.sin(f / 10) * 8;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={92} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={800} f={f} />
        </g>
        <g filter="url(#wobble)">
          {/* 水盤 (床置きの石の台+皿) */}
          <path d="M 820 700 L 1100 700 L 1070 796 L 850 796 Z" fill="#CDB184" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 835 796 L 1085 796 L 1095 820 L 825 820 Z" fill="#B99D72" stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={960} cy={700} rx={160} ry={30} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          {/* きらめき */}
          {[0, 1, 2].map((i) => {
            const tw = Math.abs(Math.sin((f + i * 23) / 12));
            return (
              <g key={i} transform={`translate(${880 + i * 80} ${688 + (i % 2) * 8}) scale(${0.4 + tw * 0.5})`} opacity={tw}>
                <path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.white} stroke={KRP.blueDeep} strokeWidth={2} />
              </g>
            );
          })}
          {/* priest (肩から水盤へ腕を伸ばして手を往復。体側の右腕は消す) */}
          <AncientPerson x={700} y={940} s={1.35} role="priest" f={f} gaze={[6, 2]} hideArm="right" />
          <g transform={`translate(760 724) rotate(${-13 + wash * 0.9})`}>
            <rect x={-6} y={-13} width={122} height={26} rx={13} fill="#E4DCCB" stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={126} cy={0} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={430} text="お参りの前に身を清める" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 14: priestが腕組みで「むむ」(頭上に「…」)
const ScenePriestMumu: React.FC<{ f: number }> = ({ f }) => {
  const nDots = Math.min(3, Math.floor(seg(f, 10, 55) * 4));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={93} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={820} f={f} />
        </g>
        <g filter="url(#wobble)">
          {/* 寄りなので大きめ */}
          <AncientPerson x={860} y={1030} s={2.1} role="priest" f={f} face="worried" armsCrossed gaze={[0, 2]} />
          {/* 「…」の吹き出し */}
          <g transform="translate(1250 320)">
            <ellipse cx={0} cy={0} rx={150} ry={95} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={-125} cy={95} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-160} cy={135} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-50 + i * 50} cy={0} r={13} fill={KRP.ink} opacity={i < nDots ? 1 : 0.12} />
            ))}
          </g>
        </g>
      </svg>
      <LabelPill x={1250} y={500} text="聖水に、悩みが…" color={KRP.red} size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 15: pilgrimが大壺にドバドバ、priestが遠くでガーン
const SceneGreedy: React.FC<{ f: number }> = ({ f }) => {
  const level = 0.25 + 0.65 * ((f % 110) / 110);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={94} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={820} f={f} />
        </g>
        {/* v2修正: 神官〜注ぐ動作まで全員が画面中央に集まるよう全体を右へ寄せる */}
        <g filter="url(#wobble)" transform="translate(170 0)">
          {/* 水盤 (床置きの石の台) */}
          <path d="M 480 710 L 840 710 L 800 800 L 520 800 Z" fill="#CDB184" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 505 800 L 815 800 L 825 822 L 495 822 Z" fill="#B99D72" stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={660} cy={710} rx={180} ry={34} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          {/* 持ち帰り用の大壺 (床置き、中の水位が上がる) */}
          <g transform="translate(900 755) scale(0.85)">
            <path d="M -80 -170 L 80 -170 L 64 -130 Q 104 -40 76 30 Q 56 74 0 74 Q -56 74 -76 30 Q -104 -40 -64 -130 Z"
              fill="#D8B46A" stroke={KRP.ink} strokeWidth={7} />
            <clipPath id="bigpotclip">
              <path d="M -78 -168 L 78 -168 L 62 -130 Q 102 -40 74 28 Q 54 72 0 72 Q -54 72 -74 28 Q -102 -40 -62 -130 Z" />
            </clipPath>
            <g clipPath="url(#bigpotclip)">
              <rect x={-110} y={72 - 240 * level} width={220} height={260} fill={KRP.blue} opacity={0.7} />
              <path d={`M -110 ${72 - 240 * level} q 30 ${Math.sin(f / 7) * 8} 60 0 q 30 ${-Math.sin(f / 7) * 8} 60 0 q 30 ${Math.sin(f / 7) * 8} 60 0`}
                fill="none" stroke={KRP.blueDeep} strokeWidth={5} />
            </g>
          </g>
          {/* pilgrim (壺の右に立ち、腕を伸ばしてひしゃくで注ぐ。体側の左腕は消す) */}
          <AncientPerson x={1150} y={960} s={1.45} role="pilgrim" f={f} face="smile" gaze={[-7, 0]} lean={-4} hideArm="left" />
          {/* 左肩からの腕+手+ひしゃく */}
          <g transform={`translate(1095 728) rotate(${26 + Math.sin(f / 12) * 4})`}>
            <rect x={-178} y={-13} width={186} height={26} rx={13} fill="#C9A96E" stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={-184} cy={0} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            {/* ひしゃく (手に握られて傾く) */}
            <g transform="translate(-184 -6) rotate(-58)">
              <line x1={0} y1={0} x2={0} y2={-70} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
              <path d="M -24 -86 Q -30 -58 0 -56 Q 24 -60 20 -84 Z" fill="#C9A96E" stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
          {/* ひしゃくから壺の口へ落ちる水 */}
          <path d="M 890 600 Q 886 620 882 640" fill="none" stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" opacity={0.9} />
          {/* 遠くの priest (ガーン) */}
          <AncientPerson x={360} y={880} s={1.05} role="priest" f={f} face="surprised" gaze={[8, 0]} />
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
            <line x1={300} y1={560} x2={286} y2={530} />
            <line x1={330} y1={550} x2={326} y2={516} />
            <line x1={360} y1={556} x2={372} y2={526} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={380} text="多めに持っていく人が…" color={KRP.red} size={38} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 16: 壺型マシン登場 (easeOutBackでドン、「？」がゆれる)
const ScenePotArrive: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(seg(f, 6, 26));
  const q = Math.sin(f / 10) * 10;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={95} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={820} f={f} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 820) scale(${p}) translate(-960 -820)`}>
            <HolyPot x={960} y={820} s={1.2} f={f} />
          </g>
          {/* 着地の土ぼこり */}
          {f > 20 && f < 46 && (
            <g opacity={1 - seg(f, 20, 46)}>
              <ellipse cx={790} cy={822} rx={40 + f - 20} ry={12} fill="#D8C49A" />
              <ellipse cx={1130} cy={822} rx={40 + f - 20} ry={12} fill="#D8C49A" />
            </g>
          )}
          {/* ？マーク */}
          {f > 26 && (
            <text x={1210} y={360} fontFamily={FONT} fontWeight={900} fontSize={140} fill={KRP.red}
              transform={`rotate(${q} 1210 330)`}>？</text>
          )}
          {/* 見つめる priest */}
          <AncientPerson x={500} y={930} s={1.3} role="priest" f={f} face="surprised" gaze={[7, 0]} />
        </g>
      </svg>
      <LabelPill x={960} y={150} text="謎の壺型マシン" color={KRP.red} size={44} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 17: 外観ループ: コイン投入→注ぎ口から水→止まる
const ScenePotFlow: React.FC<{ f: number }> = ({ f }) => {
  const T = 95;
  const t = (f % T) / T;
  const inT = seg(t, 0.05, 0.3);
  const coinX = 700 + (940 - 700) * inT;
  const coinY = 520 - (520 - 365) * inT - Math.sin(inT * Math.PI) * 110;
  const pouring = t >= 0.34 && t < 0.72;
  const stopped = t >= 0.74;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={96} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={820} f={f} />
        </g>
        <g filter="url(#wobble)">
          <HolyPot x={960} y={820} s={1.2} f={f} pouring={pouring} />
          {/* 受けの器 */}
          <path d="M 1050 790 L 1190 790 L 1172 830 L 1068 830 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {/* 投げ込まれるコイン */}
          {inT > 0 && inT < 1 && <Coin cx={coinX} cy={coinY} r={24} fill={KRP.copper} rotate={inT * 540} />}
          {/* 参拝客 */}
          <AncientPerson x={560} y={940} s={1.3} role="pilgrim" f={f} gaze={[7, -2]}
            face={stopped ? "smile" : "normal"} />
          {/* ピタッと止まるマーク */}
          {stopped && (
            <g transform={`translate(1240 560) scale(${pop(seg(t, 0.74, 0.84))})`}>
              <circle r={46} fill={KRP.white} stroke={KRP.red} strokeWidth={8} />
              <rect x={-16} y={-20} width={12} height={40} fill={KRP.red} />
              <rect x={6} y={-20} width={12} height={40} fill={KRP.red} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={150} text="1杯ぶんで、勝手に止まる" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 18: 「店員」「電気」が×で消える (×スタンプ2連打)
const SceneNoStaff: React.FC<{ f: number }> = ({ f }) => {
  const x1 = pop(seg(f, 20, 34));
  const x2 = pop(seg(f, 44, 58));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={97} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={820} f={f} />
        </g>
        <g filter="url(#wobble)">
          <HolyPot x={960} y={820} s={1.1} f={f} />
          {/* 左: 店員アイコン */}
          <g transform="translate(430 480)">
            <circle r={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={0} cy={-38} r={38} fill="none" stroke={KRP.ink} strokeWidth={7} />
            <path d="M -62 76 Q 0 10 62 76" fill="none" stroke={KRP.ink} strokeWidth={7} />
            {x1 > 0.02 && (
              <g opacity={0.92} transform={`scale(${x1})`} stroke={KRP.red} strokeWidth={22} strokeLinecap="round">
                <line x1={-95} y1={-95} x2={95} y2={95} />
                <line x1={95} y1={-95} x2={-95} y2={95} />
              </g>
            )}
          </g>
          {/* 右: 電気アイコン */}
          <g transform="translate(1490 480)">
            <circle r={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <polygon points="10,-80 -34,10 -2,10 -14,78 36,-16 2,-16" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            {x2 > 0.02 && (
              <g opacity={0.92} transform={`scale(${x2})`} stroke={KRP.red} strokeWidth={22} strokeLinecap="round">
                <line x1={-95} y1={-95} x2={95} y2={95} />
                <line x1={95} y1={-95} x2={-95} y2={95} />
              </g>
            )}
          </g>
        </g>
      </svg>
      <LabelPill x={430} y={650} text="店員なし" size={36} centerX />
      <LabelPill x={1490} y={650} text="電気なし" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 19〜23: 壺の断面図 (シーソー機構)。mode で見せ方を変える
//  open=パカッと断面公開 / rod=てんびん棒ハイライト / tilt=コイン落下→傾き→水 /
//  cycle=1サイクル完結ループ / label=ループ+「動力=コインの重さ」
type CutawayMode = "open" | "rod" | "tilt" | "cycle" | "label";
const ScenePotCutaway: React.FC<{ f: number; mode: CutawayMode }> = ({ f, mode }) => {
  // 断面の開き (openモードだけアニメ、他は開きっぱなし)
  const openT = mode === "open" ? easeOut(seg(f, 10, 40)) : 1;
  // 機構のサイクル (tilt は前半で止める、cycle/label はループ)
  const T = 110;
  const raw = mode === "tilt" ? Math.min((f % T) / T, 0.52) : (f % T) / T;
  const cyc = mode === "open" || mode === "rod" ? 0 : raw;
  // コイン落下 (0.05-0.2) → 棒が傾く (0.2-0.32) → 水 (0.26-0.52) → コイン滑落 (0.52-0.66) → 戻る (0.66-0.8)
  const drop = seg(cyc, 0.05, 0.2);
  const tilt = seg(cyc, 0.2, 0.32) - seg(cyc, 0.66, 0.8);
  const water = cyc >= 0.26 && cyc < 0.56;
  const slide = seg(cyc, 0.52, 0.66);
  const angle = -14 * clamp01(tilt);
  // てんびん棒: 支点 (960, 520)。左端=受け皿(760,520) 右端=栓(1150,520)
  const px = 960, py = 530;
  const coinOnTray = cyc >= 0.2 && cyc < 0.66;
  const highlight = mode === "rod" ? 0.5 + 0.5 * Math.sin(f / 8) : 0;
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={98} />
        <Ground y={880} />
        {/* 寄りの図解なので wobbleSoft */}
        <g filter="url(#wobbleSoft)">
          {/* 壺の輪郭 (大きく断面) */}
          <g transform={`translate(960 880)`}>
            <path d="M -300 -660 L 300 -660 L 240 -560 Q 360 -380 320 -140 Q 280 0 0 0 Q -280 0 -320 -140 Q -360 -380 -240 -560 Z"
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={9} />
            {/* 断面の内側 (openTで広がって見える) */}
            <g opacity={openT}>
              <path d="M -270 -640 L 270 -640 L 215 -550 Q 325 -380 290 -150 Q 252 -24 0 -24 Q -252 -24 -290 -150 Q -325 -380 -215 -550 Z"
                fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
            </g>
            {/* ふた+投入口 */}
            <rect x={-310} y={-700} width={620} height={44} rx={12} fill="#A66A3E" stroke={KRP.ink} strokeWidth={7} />
            <rect x={-40} y={-692} width={80} height={20} rx={7} fill={KRP.ink} />
          </g>
          {/* ===== 内部機構 (openT で出現) ===== */}
          <g opacity={openT}>
            {/* 上段: 水タンク */}
            <path d="M 720 320 L 1200 320 L 1180 420 L 740 420 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M 740 348 q 40 ${Math.sin(f / 9) * 6} 80 0 q 40 ${-Math.sin(f / 9) * 6} 80 0 q 40 ${Math.sin(f / 9) * 6} 80 0 q 40 ${-Math.sin(f / 9) * 6} 80 0 q 40 ${Math.sin(f / 9) * 6} 80 0`}
              fill="none" stroke={KRP.blueDeep} strokeWidth={4.5} opacity={0.7} />
            {/* コインの落下経路 (投入口→受け皿) */}
            <path d="M 960 210 L 870 330 L 790 440" fill="none" stroke={KRP.ink} strokeWidth={4}
              strokeDasharray="3 16" opacity={0.5} />
            {/* 支点の柱 */}
            <path d={`M ${px - 26} 700 L ${px + 26} 700 L ${px + 12} ${py} L ${px - 12} ${py} Z`}
              fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
            {/* てんびん棒 (傾く) */}
            <g transform={`rotate(${angle} ${px} ${py})`}>
              <rect x={px - 220} y={py - 13} width={440} height={26} rx={10}
                fill={highlight > 0 ? KRP.yellow : "#C9A96E"} stroke={KRP.ink} strokeWidth={6}
                opacity={1} />
              {highlight > 0 && (
                <rect x={px - 232} y={py - 25} width={464} height={50} rx={16} fill="none"
                  stroke={KRP.yellow} strokeWidth={8} opacity={highlight} />
              )}
              {/* 左端: 受け皿 */}
              <path d={`M ${px - 250} ${py - 12} L ${px - 150} ${py - 12} L ${px - 170} ${py + 26} L ${px - 230} ${py + 26} Z`}
                fill="#D9C498" stroke={KRP.ink} strokeWidth={5.5} />
              {/* 皿のコイン */}
              {coinOnTray && (
                <Coin cx={px - 200 + slide * -90} cy={py - 36 + slide * 90} r={30} fill={KRP.copper} rotate={slide * 220} />
              )}
              {/* 右端: 栓 (上に伸びる棒+玉) */}
              <line x1={px + 200} y1={py} x2={px + 200} y2={py - 86} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
              <circle cx={px + 200} cy={py - 96} r={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            </g>
            {/* 支点ピン */}
            <circle cx={px} cy={py} r={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            {/* 栓の受け口 (タンク底の穴) */}
            <rect x={1126} y={416} width={48} height={16} rx={6} fill={KRP.ink} opacity={0.75} />
            {/* 水の流れ (栓が開いたら) */}
            {water && (
              <g>
                <path d="M 1150 432 Q 1160 560 1172 700" fill="none" stroke={KRP.blueDeep} strokeWidth={12} strokeLinecap="round" opacity={0.9} />
                <circle cx={1168 + Math.sin(f / 4) * 4} cy={700} r={8} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
              </g>
            )}
            {/* 注ぎ口と器 */}
            <path d="M 1120 700 L 1216 700 L 1202 742 L 1136 742 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {/* 落ちてくるコイン */}
            {drop > 0 && drop < 1 && (
              <Coin cx={960 - 170 * drop} cy={210 + 230 * drop * drop} r={30} fill={KRP.copper} rotate={drop * 420} />
            )}
            {/* 滑り落ちたコインの受け箱 */}
            <rect x={692} y={660} width={150} height={60} rx={10} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
            {slide >= 1 && <Coin cx={767} cy={672} r={28} fill={KRP.copper} />}
          </g>
        </g>
      </svg>
      {/* モードごとの注釈 */}
      {mode === "open" && openT > 0.9 && <LabelPill x={960} y={120} text="断面図" color={KRP.red} size={42} centerX />}
      {mode === "rod" && <LabelPill x={960} y={120} text="てんびんのような棒" color={KRP.red} size={42} centerX />}
      {mode === "tilt" && (
        <>
          <LabelPill x={620} y={200} text="① コインが皿に落ちる" size={32} />
          <LabelPill x={1230} y={200} text="② 棒がかたむき 栓が開く" size={32} />
        </>
      )}
      {mode === "cycle" && <LabelPill x={960} y={120} text="コインが滑り落ちると 栓が閉まる" size={36} centerX />}
      {mode === "label" && (
        <>
          <LabelPill x={960} y={120} text="動力 = コインの重さ" color={KRP.red} size={44} centerX />
          <Stamp x={1380} y={180} text="電気いらず" size={40} />
        </>
      )}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 24: heron が巻物 (図面) をするする開く
const SceneHeron: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 12, 50));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={99} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={840} f={f} />
        </g>
        <g filter="url(#wobble)">
          <AncientPerson x={560} y={980} s={1.6} role="heron" f={f} face="smile" gaze={[6, 2]} />
          {/* 巻物 */}
          <g transform="translate(1130 520)">
            {/* 広がる紙 */}
            <rect x={-30} y={-180} width={60 + 520 * open} height={360} rx={10}
              fill="#F7F0DC" stroke={KRP.ink} strokeWidth={6} />
            {/* 紙の中の図面 (壺+てんびん) */}
            {open > 0.6 && (
              <g opacity={seg(open, 0.6, 1)} stroke={KRP.ink} fill="none">
                <path d="M 100 -120 L 300 -120 L 280 -70 Q 330 20 300 90 Q 280 130 200 130 Q 120 130 100 90 Q 70 20 120 -70 Z" strokeWidth={4.5} />
                <line x1={130} y1={20} x2={270} y2={20} strokeWidth={4} />
                <circle cx={200} cy={20} r={6} fill={KRP.ink} />
                <circle cx={140} cy={8} r={13} strokeWidth={3.5} />
                <line x1={266} y1={20} x2={266} y2={-16} strokeWidth={4} />
                {/* 寸法線ふう */}
                <line x1={100} y1={160} x2={300} y2={160} strokeWidth={2.5} opacity={0.5} />
                <line x1={350} y1={-120} x2={350} y2={130} strokeWidth={2.5} opacity={0.5} />
              </g>
            )}
            {/* 軸棒 */}
            <rect x={-44} y={-200} width={32} height={400} rx={14} fill="#A66A3E" stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={16 + 520 * open} y={-200} width={32} height={400} rx={14} fill="#A66A3E" stroke={KRP.ink} strokeWidth={5.5} />
          </g>
        </g>
      </svg>
      <LabelPill x={560} y={330} text="学者 ヘロン" size={40} centerX />
      {open >= 1 && <Stamp x={1310} y={760} text="図面つき" size={40} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 25: heronの周りに蒸気球 (アイオロスの球) と自動ドア
const SceneHeronInventions: React.FC<{ f: number }> = ({ f }) => {
  const doorT = 0.5 + 0.5 * Math.sin(f / 26);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={100} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={840} f={f} />
        </g>
        <g filter="url(#wobble)">
          <AncientPerson x={960} y={990} s={1.5} role="heron" f={f} face="smile" />
          {/* 左: アイオロスの球 (くるくる回る) */}
          <g transform="translate(420 440)">
            <rect x={-130} y={150} width={260 } height={26} rx={9} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
            {/* 釜 */}
            <path d="M -110 150 Q -110 60 0 60 Q 110 60 110 150 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
            {/* 支柱 */}
            <line x1={-60} y1={70} x2={-60} y2={-30} stroke={KRP.ink} strokeWidth={8} />
            <line x1={60} y1={70} x2={60} y2={-30} stroke={KRP.ink} strokeWidth={8} />
            {/* 回る球 */}
            <g transform={`rotate(${f * 4} 0 -60)`}>
              <circle cx={0} cy={-60} r={62} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
              <path d="M 0 -122 L -26 -148 L -4 -140 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 0 2 L 26 28 L 4 20 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            </g>
            {/* 蒸気 */}
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-20 + i * 20 + Math.sin((f + i * 15) / 7) * 8}
                cy={-150 - ((f * 1.6 + i * 30) % 80)} r={10 - i * 2}
                fill={KRP.white} opacity={0.8 - ((f * 1.6 + i * 30) % 80) / 110} />
            ))}
          </g>
          {/* 右: 神殿の自動ドア (開閉) */}
          <g transform="translate(1500 420)">
            <rect x={-180} y={-180} width={360} height={360} rx={10} fill="#E8DCC0" stroke={KRP.ink} strokeWidth={7} />
            <rect x={-150} y={-150} width={300} height={300} fill="#5A4A38" stroke={KRP.ink} strokeWidth={5} />
            {/* 扉2枚 */}
            <rect x={-150} y={-150} width={150 - doorT * 110} height={300} fill="#C9A96E" stroke={KRP.ink} strokeWidth={5} />
            <rect x={doorT * 110} y={-150} width={150 - doorT * 110} height={300} fill="#C9A96E" stroke={KRP.ink} strokeWidth={5} />
            {/* 祭壇の火 */}
            <path d={`M 0 230 q 16 14 6 34 q -6 12 -22 10 q -14 -4 -12 -22 q 2 -12 12 -22 q 0 10 8 12 q 6 -4 8 -12`}
              fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} opacity={0.85 + 0.15 * Math.sin(f / 5)}
              transform="translate(0 -36)" />
          </g>
        </g>
      </svg>
      <LabelPill x={420} y={680} text="蒸気で回る球" size={34} centerX />
      <LabelPill x={1500} y={680} text="神殿の自動ドア" size={34} centerX />
      <LabelPill x={960} y={130} text="風変わりな発明家" color={KRP.red} size={42} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 26: heronと師匠のシルエットに「？」(交互に点滅)
const SceneHeronQuestion: React.FC<{ f: number }> = ({ f }) => {
  const q1 = Math.sin(f / 14) > 0;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={101} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={860} f={f} />
        </g>
        <g filter="url(#wobble)">
          <AncientPerson x={620} y={960} s={1.5} role="heron" f={f} gaze={[5, 0]} />
          <AncientPerson x={1300} y={960} s={1.5} role="silhouette" f={f} phase={3} />
          <text x={620} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}
            fill={KRP.red} opacity={q1 ? 1 : 0.15}>？</text>
          <text x={1300} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}
            fill={KRP.red} opacity={q1 ? 0.15 : 1}>？</text>
        </g>
      </svg>
      <LabelPill x={620} y={700} text="ヘロン本人?" size={34} centerX />
      <LabelPill x={1300} y={700} text="師匠ゆずり?" size={34} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 27: 黒板風カード「人を信じず、仕組みで解決」(文字が書き込まれる)
const SceneCreedCard: React.FC<{ f: number }> = ({ f }) => {
  const text = "人を信じず、仕組みで解決する。";
  const n = Math.floor(seg(f, 10, 66) * text.length + 0.001);
  const sub = easeOut(seg(f, 70, 90));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <WobbleDefs seed={102} />
      <svg width={W} height={H} style={abs}>
        <rect x={150} y={150} width={1620} height={660} rx={22} fill="#3E4A42" stroke={KRP.ink} strokeWidth={10} filter="url(#wobble)" />
        <rect x={180} y={178} width={1560} height={604} rx={16} fill="none" stroke="#D9CBA6" strokeWidth={4} opacity={0.6} filter="url(#wobbleSoft)" />
        {/* チョークの粉 */}
        <rect x={150} y={810} width={1620} height={18} rx={9} fill="#5A6A60" filter="url(#wobbleSoft)" />
        <rect x={1380} y={792} width={120} height={18} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} filter="url(#wobbleSoft)" />
      </svg>
      <div style={{
        position: "absolute", top: 380, left: 0, right: 0, textAlign: "center",
        fontSize: 86, fontWeight: 900, color: "#F5EFDC", letterSpacing: 4,
      }}>
        {text.slice(0, n)}
        <span style={{ opacity: Math.sin(f / 4) > 0 ? 0.9 : 0 }}>|</span>
      </div>
      <div style={{
        position: "absolute", top: 640, left: 0, right: 0, textAlign: "center",
        fontSize: 44, fontWeight: 800, color: "#C9D4C2", opacity: sub,
      }}>
        — 2000年前の発想 —
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 28: 壺に赤ハンコ「ご先祖さま」
const ScenePotStamp: React.FC<{ f: number }> = ({ f }) => {
  const st = f >= 26;
  const shake = f >= 26 && f < 34 ? Math.sin(f * 3) * 5 : 0;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={103} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={820} f={f} />
        </g>
        <g filter="url(#wobble)" transform={`translate(${shake} 0)`}>
          <HolyPot x={860} y={820} s={1.25} f={f} />
          {/* 誇らしげな priest */}
          <AncientPerson x={1420} y={950} s={1.35} role="priest" f={f} face="smile" gaze={[-6, 0]} />
        </g>
      </svg>
      {st && <Stamp x={620} y={330} text="自販機のご先祖さま" size={54} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 出口: モチーフ名→シーン (導入+第1章ぶん。以降の章は追って追加) =====
export const Jihanki2000SceneView: React.FC<{ motif: string; f: number }> = ({ motif, f }) => {
  switch (motif) {
    // 導入
    case "j2_night": return <SceneNightRoad f={f} />;
    case "j2_night_close": return <SceneNightRoad f={f} close />;
    case "j2_night_center": return <SceneSpotlight f={f} />;
    case "j2_globe_japan": return <SceneGlobeIntro f={f} />;
    case "j2_globe_back": return <SceneGlobeIntro f={f} back />;
    case "j2_morph_pot": return <SceneMorphPot f={f} />;
    case "j2_pot_2000": return <ScenePot2000 f={f} />;
    case "j2_temple": return <SceneTemple f={f} />;
    case "j2_holy_water": return <SceneHolyWater f={f} />;
    case "j2_journey": return <SceneJourney f={f} />;
    case "j2_xray": return <SceneJihankiXray f={f} />;
    // 第1章
    case "j2_ch1_door":
      return <GlobeHopDoor f={f} chapter="第1章" title="神殿のコイン仕掛け" stampText="紀元1世紀 エジプト" to="egypt" />;
    case "j2_alexandria": return <SceneAlexandria f={f} />;
    case "j2_purify": return <ScenePurify f={f} />;
    case "j2_priest_mumu": return <ScenePriestMumu f={f} />;
    case "j2_greedy": return <SceneGreedy f={f} />;
    case "j2_pot_arrive": return <ScenePotArrive f={f} />;
    case "j2_pot_flow": return <ScenePotFlow f={f} />;
    case "j2_no_staff": return <SceneNoStaff f={f} />;
    case "j2_cut_open": return <ScenePotCutaway f={f} mode="open" />;
    case "j2_cut_rod": return <ScenePotCutaway f={f} mode="rod" />;
    case "j2_cut_tilt": return <ScenePotCutaway f={f} mode="tilt" />;
    case "j2_cut_cycle": return <ScenePotCutaway f={f} mode="cycle" />;
    case "j2_cut_label": return <ScenePotCutaway f={f} mode="label" />;
    case "j2_heron": return <SceneHeron f={f} />;
    case "j2_heron_inv": return <SceneHeronInventions f={f} />;
    case "j2_heron_q": return <SceneHeronQuestion f={f} />;
    case "j2_creed_card": return <SceneCreedCard f={f} />;
    case "j2_pot_stamp": return <ScenePotStamp f={f} />;
    default: return null;
  }
};

// プレビュー用のモチーフ一覧 (台本の文1〜28に対応)
export const J2_PREVIEW_MOTIFS: string[] = [
  "j2_night", "j2_night_close", "j2_globe_japan", "j2_globe_back", "j2_morph_pot",
  "j2_pot_2000", "j2_temple", "j2_holy_water", "j2_journey", "j2_xray",
  "j2_ch1_door", "j2_alexandria", "j2_purify", "j2_priest_mumu", "j2_greedy",
  "j2_pot_arrive", "j2_pot_flow", "j2_no_staff", "j2_cut_open", "j2_cut_rod",
  "j2_cut_tilt", "j2_cut_cycle", "j2_cut_label", "j2_heron", "j2_heron_inv",
  "j2_heron_q", "j2_creed_card", "j2_pot_stamp",
];


