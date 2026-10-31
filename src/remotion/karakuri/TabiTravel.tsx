// 「旅とお土産の歴史」: 移動・舞台転換の演出キット (構成案の「移動・舞台転換の演出キット」に対応)。
// 型の出どころ: 精巧な地球儀・平ら地図 = Jihanki2000Scenes / 日本地図ホップ = Jihanki2000JapanMap /
// 路線図メタ演出 = WatashiShared の RouteMap 方式 (口実が駅で増える今回版を新造)。
// 新造: 東海道絵巻横スクロール・帆船・蒸気船・ジェット機。
// 本編シーンはこのファイルの部品を組み合わせて作る (このファイルは章を知らない)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT, WobbleDefs, Atmosphere, LabelPill,
  clamp01, seg, pop, easeOut,
} from "./KarakuriScenes";
import {
  W, H, abs, Globe, globePoint, MapPin, DashArc, LAND,
} from "./Jihanki2000Scenes";
import { JapanMapCard, JapanHop, JmapLabel } from "./Jihanki2000JapanMap";
import { TKP, MatsuTree, Shukuba, ShinmeiTorii, EdoTraveler } from "./TabiKits";

const FONT = KARAKURI_FONT;

// =====================================================================
// 地点表 (実際の経度・緯度)
// =====================================================================

// 地球儀・世界地図用
export const TABI_SPOT = {
  japan: { lon: 136, lat: 35 },
  santiago: { lon: -8.5, lat: 42.9 },   // サンティアゴ・デ・コンポステーラ
  london: { lon: -0.1, lat: 51.5 },
  paris: { lon: 2.35, lat: 48.9 },
  geneva: { lon: 6.15, lat: 46.2 },
  venice: { lon: 12.3, lat: 45.4 },
  florence: { lon: 11.25, lat: 43.8 },
  rome: { lon: 12.5, lat: 41.9 },
  newyork: { lon: -74, lat: 40.7 },
  sanfrancisco: { lon: -122.4, lat: 37.8 },
  yokohama: { lon: 139.6, lat: 35.4 },
  shanghai: { lon: 121.5, lat: 31.2 },
  bombay: { lon: 72.8, lat: 19 },
  suez: { lon: 32.5, lat: 30 },
} as const;
export type TabiSpot = keyof typeof TABI_SPOT;

// 日本地図ホップ用 (jmapXY と組み合わせる)
export const TABI_JMAP = {
  kyoto: [135.76, 35.01] as [number, number],
  kumano: [135.77, 33.73] as [number, number],   // 熊野本宮
  ise: [136.72, 34.49] as [number, number],
  edo: [139.7, 35.68] as [number, number],
  osaka: [135.5, 34.69] as [number, number],
  miyazaki: [131.42, 31.91] as [number, number],
};

// =====================================================================
// 地球儀の旅: 回って目的地が正面に来る → 弧 → ピン (GlobeHopDoor の章扉抜き版)
// 使いどころ: 日本⇔スペインの対比 (#43「地球の反対側」) など
// =====================================================================
export const GlobeTravel: React.FC<{
  f: number;
  to: TabiSpot;
  from?: TabiSpot;      // 省略時は弧なし
  toLabel?: string;
  fromLabel?: string;
  caption?: string;     // 上部の見出し札
}> = ({ f, to, from, toLabel, fromLabel, caption }) => {
  const cx = 960, cy = 490, r = 360;
  const spot = TABI_SPOT[to];
  const spinT = easeOut(seg(f, 0, 55));
  const lon0 = spot.lon + (1 - spinT) * 420;
  const stopped = f >= 55;
  const tp = globePoint(cx, cy, r, spot.lon, spot.lat, lon0);
  const fromSpot = from ? TABI_SPOT[from] : null;
  const fp = fromSpot ? globePoint(cx, cy, r, fromSpot.lon, fromSpot.lat, lon0) : null;
  const arcT = from ? seg(f, 58, 90) : 0;
  const pinT = seg(f, from ? 88 : 58, from ? 102 : 72);
  const labelOn = f >= (from ? 104 : 74);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={141} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          {stopped && fp && <MapPin x={fp.x} y={fp.y} t={1} s={0.8} color={KRP.orange} />}
          {stopped && fp && <DashArc x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} t={arcT} lift={220} />}
          {stopped && <MapPin x={tp.x} y={tp.y} t={pinT} />}
        </g>
      </svg>
      {labelOn && fromLabel && fp && (
        <LabelPill x={fp.x} y={fp.y + 20} text={fromLabel} size={30} centerX />
      )}
      {labelOn && toLabel && (
        <LabelPill x={tp.x} y={tp.y + 20} text={toLabel} color={KRP.red} size={30} centerX />
      )}
      {caption && <LabelPill x={960} y={64} text={caption} color={KRP.red} size={40} centerX />}
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 世界一周の地球儀: カメラ (lon0) が移動点を追いかけて地球が一周する
// 使いどころ: 1872年 添乗員付き世界一周222日 (ロンドン→NY→SF→横浜→上海→ボンベイ→スエズ→ロンドン)
// =====================================================================
// 経度は「西回りに一周」でほどいた値 (lon0 を単調に減らすと地球が一周して見える)
const TOUR_ROUTE: Array<{ lon: number; lat: number; name?: string }> = [
  { lon: -0.1, lat: 51.5, name: "ロンドン" },
  { lon: -74, lat: 40.7, name: "ニューヨーク" },
  { lon: -122.4, lat: 37.8 },
  { lon: -220.4, lat: 35.4, name: "よこはま" },
  { lon: -238.5, lat: 31.2 },
  { lon: -287.2, lat: 19 },
  { lon: -327.5, lat: 30, name: "スエズ" },
  { lon: -360.1, lat: 51.5, name: "ロンドン" },
];

export const WorldTourGlobe: React.FC<{ f: number; t0?: number; t1?: number; caption?: string }> = ({
  f, t0 = 12, t1 = 132, caption,
}) => {
  const cx = 960, cy = 490, r = 360;
  const u = easeOut(seg(f, t0, t1)) * (TOUR_ROUTE.length - 1);
  const i = Math.min(Math.floor(u), TOUR_ROUTE.length - 2);
  const k = u - i;
  const cur = {
    lon: TOUR_ROUTE[i].lon + (TOUR_ROUTE[i + 1].lon - TOUR_ROUTE[i].lon) * k,
    lat: TOUR_ROUTE[i].lat + (TOUR_ROUTE[i + 1].lat - TOUR_ROUTE[i].lat) * k,
  };
  const lon0 = cur.lon; // カメラが移動点を追う
  // 通過済みの航跡 (細かく刻んで点々で)
  const trail: Array<{ x: number; y: number }> = [];
  const steps = Math.floor(u * 9);
  for (let s = 0; s <= steps; s++) {
    const uu = Math.min(s / 9, u);
    const ii = Math.min(Math.floor(uu), TOUR_ROUTE.length - 2);
    const kk = uu - ii;
    const p = globePoint(
      cx, cy, r,
      TOUR_ROUTE[ii].lon + (TOUR_ROUTE[ii + 1].lon - TOUR_ROUTE[ii].lon) * kk,
      TOUR_ROUTE[ii].lat + (TOUR_ROUTE[ii + 1].lat - TOUR_ROUTE[ii].lat) * kk,
      lon0,
    );
    if (p.visible) trail.push({ x: p.x, y: p.y });
  }
  const cp = globePoint(cx, cy, r, cur.lon, cur.lat, lon0);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={142} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          {/* 航跡 */}
          {trail.map((p, j) => (
            <circle key={j} cx={p.x} cy={p.y} r={7} fill={KRP.red} opacity={0.75} />
          ))}
          {/* 経由地のピン (正面に来ているものだけ) */}
          {TOUR_ROUTE.slice(0, Math.floor(u) + 1).map((st, j) => {
            const p = globePoint(cx, cy, r, st.lon, st.lat, lon0);
            if (!p.visible) return null;
            return <MapPin key={j} x={p.x} y={p.y} t={1} s={0.66} color={KRP.orange} />;
          })}
          {/* 現在地 (赤い大きな点) */}
          <circle cx={cp.x} cy={cp.y} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </svg>
      {/* 正面に来ている経由地の名前札 */}
      {TOUR_ROUTE.slice(0, Math.floor(u) + 1).map((st, j) => {
        if (!st.name) return null;
        const p = globePoint(cx, cy, r, st.lon, st.lat, lon0);
        if (!p.visible) return null;
        return <LabelPill key={j} x={p.x} y={p.y + 16} text={st.name} size={26} centerX />;
      })}
      {caption && <LabelPill x={960} y={64} text={caption} color={KRP.red} size={40} centerX />}
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 平らな世界地図カード (正距円筒投影・地球儀と同じ海岸線データ)
// 範囲を lon/lat で指定できる (欧州だけ拡大、など)
// =====================================================================
export const makeWmap = (
  lonMin: number, lonMax: number, latMin: number, latMax: number,
  x = 120, y = 120, w = 1680, h = 760,
) => ({
  X: (lon: number) => x + ((lon - lonMin) / (lonMax - lonMin)) * w,
  Y: (lat: number) => y + ((latMax - lat) / (latMax - latMin)) * h,
  x, y, w, h,
});

export const WorldMapCard: React.FC<{
  lonMin?: number; lonMax?: number; latMin?: number; latMax?: number;
  x?: number; y?: number; w?: number; h?: number;
  clipId?: string;      // 同一画面に2枚置くときは変える
  children?: React.ReactNode;
}> = ({
  lonMin = -215, lonMax = 155, latMin = -60, latMax = 80,
  x = 120, y = 120, w = 1680, h = 760, clipId = "tabiwmap", children,
}) => {
  const m = makeWmap(lonMin, lonMax, latMin, latMax, x, y, w, h);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
      <clipPath id={clipId}>
        <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={20} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {LAND.map((land, i) => (
          <path key={i}
            d={land.pts.map(([lon, lat], j) =>
              `${j === 0 ? "M" : "L"} ${m.X(lon).toFixed(1)} ${m.Y(lat).toFixed(1)}`).join(" ") + " Z"}
            fill={land.col} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        ))}
        {children}
      </g>
    </g>
  );
};

// =====================================================================
// グランドツアーの周遊路 (5章): 欧州拡大地図に ロンドン→パリ→ジュネーヴ→ヴェネツィア→フィレンツェ→ローマ
// =====================================================================
const GT_STOPS: Array<{ spot: TabiSpot; name?: string }> = [
  { spot: "london", name: "ロンドン" },
  { spot: "paris", name: "パリ" },
  { spot: "geneva" },
  { spot: "venice", name: "ヴェネツィア" },
  { spot: "florence" },
  { spot: "rome", name: "ローマ" },
];

export const GrandTourMap: React.FC<{ f: number; caption?: string }> = ({ f, caption }) => {
  // 欧州の窓 (英国〜イタリアが収まる範囲)
  const m = makeWmap(-14, 26, 35, 60, 240, 130, 1440, 800);
  const t = easeOut(seg(f, 12, 120));
  const n = GT_STOPS.length - 1; // 区間数
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={143} />
        <g filter="url(#wobbleSoft)">
          <WorldMapCard lonMin={-14} lonMax={26} latMin={35} latMax={60}
            x={240} y={130} w={1440} h={800} clipId="gtmap">
            {/* 道のり (区間ごとに順番に) */}
            {GT_STOPS.slice(0, -1).map((st, i) => {
              const a = TABI_SPOT[st.spot], b = TABI_SPOT[GT_STOPS[i + 1].spot];
              const segT = clamp01(t * n - i);
              return <DashArc key={i} x1={m.X(a.lon)} y1={m.Y(a.lat)}
                x2={m.X(b.lon)} y2={m.Y(b.lat)} t={segT} lift={70} color={KRP.red} />;
            })}
            {/* 経由地ピン */}
            {GT_STOPS.map((st, i) => {
              const p = TABI_SPOT[st.spot];
              return <MapPin key={i} x={m.X(p.lon)} y={m.Y(p.lat)}
                t={clamp01(t * n - i + 0.3)} s={0.72}
                color={i === GT_STOPS.length - 1 ? KRP.red : KRP.orange} />;
            })}
          </WorldMapCard>
        </g>
      </svg>
      {GT_STOPS.map((st, i) => {
        if (!st.name || clamp01(t * n - i + 0.3) < 1) return null;
        const p = TABI_SPOT[st.spot];
        return <LabelPill key={i} x={m.X(p.lon)} y={m.Y(p.lat) + 18} text={st.name} size={28} centerX />;
      })}
      {caption && <LabelPill x={960} y={64} text={caption} color={KRP.red} size={40} centerX />}
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 乗り物 (時代の記号)。徒歩=EdoTraveler / 馬車=TabiKits.Carriage / 汽車=TabiKits.SteamLoco
// ここでは水上と空: 帆船 (中世巡礼・航路) / 蒸気船 (世界一周) / ジェット機 (1964渡航自由化)
// =====================================================================

// 帆船: x,y=喫水線の中央。s=1 で高さ約300
export const SailShip: React.FC<{ x: number; y: number; s?: number; f?: number; flip?: boolean }> = ({
  x, y, s = 1, f = 0, flip = false,
}) => {
  const bob = Math.sin(f / 14) * 5;
  const sway = Math.sin(f / 19) * 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
      {/* 船体 */}
      <path d="M -150 -40 L 150 -40 Q 128 28 72 34 L -92 34 Q -142 20 -150 -40 Z"
        fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-144} y1={-16} x2={140} y2={-16} stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
      {/* マスト */}
      <line x1={0} y1={-40} x2={0} y2={-268} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
      <line x1={0} y1={-40} x2={0} y2={-268} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      {/* 横帆 (風をはらむ) */}
      <path d="M -96 -244 L 96 -244 Q 74 -170 96 -96 L -96 -96 Q -74 -170 -96 -244 Z"
        fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -96 -244 L 96 -244 M -96 -96 L 96 -96" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      {/* 旗 */}
      <path d="M 0 -268 L 58 -252 L 0 -238 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      {/* 波 */}
      <g fill="none" stroke={KRP.blueDeep} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
        <path d={`M -190 42 Q -160 ${30 + Math.sin(f / 9) * 5} -130 42`} />
        <path d={`M 130 44 Q 162 ${32 + Math.sin(f / 9 + 2) * 5} 194 44`} />
      </g>
    </g>
  );
};

// 蒸気船: x,y=喫水線の中央。s=1 で高さ約260
export const SteamShip: React.FC<{ x: number; y: number; s?: number; f?: number; flip?: boolean }> = ({
  x, y, s = 1, f = 0, flip = false,
}) => {
  const bob = Math.sin(f / 15) * 4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`}>
      {/* 船体 */}
      <path d="M -190 -46 L 190 -46 Q 170 24 100 32 L -120 32 Q -176 18 -190 -46 Z"
        fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-182} y1={-24} x2={182} y2={-24} stroke={KRP.white} strokeWidth={5} opacity={0.55} />
      {/* 上部構造 */}
      <rect x={-96} y={-108} width={192} height={62} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {[-66, -22, 22, 66].map((wx) => (
        <circle key={wx} cx={wx} cy={-78} r={11} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 煙突 */}
      <rect x={-20} y={-196} width={40} height={92} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-20} y={-196} width={40} height={20} fill={KRP.ink} />
      {/* 煙 (雲形・2重fillで内側の線を消す) */}
      {[0, 1, 2].map((i) => {
        const drift = ((f * 1.3 + i * 46) % 140);
        const op = 0.8 * (1 - drift / 140);
        return (
          <g key={i} transform={`translate(${6 + drift * 0.7} ${-210 - drift})`} opacity={op}>
            <g stroke={KRP.ink} strokeWidth={4} fill={TKP.steam}>
              <circle cx={-18} cy={6} r={17 + i * 2} />
              <circle cx={14} cy={0} r={20 + i * 2} />
              <circle cx={-2} cy={-12} r={15 + i * 2} />
            </g>
            <g fill={TKP.steam}>
              <circle cx={-18} cy={6} r={14 + i * 2} />
              <circle cx={14} cy={0} r={17 + i * 2} />
              <circle cx={-2} cy={-12} r={12 + i * 2} />
            </g>
          </g>
        );
      })}
      {/* マスト (前後) */}
      <line x1={-150} y1={-46} x2={-150} y2={-160} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
      <line x1={150} y1={-46} x2={150} y2={-150} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 波 */}
      <g fill="none" stroke={KRP.blueDeep} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
        <path d={`M -240 40 Q -210 ${28 + Math.sin(f / 9) * 5} -180 40`} />
        <path d={`M 180 42 Q 212 ${30 + Math.sin(f / 9 + 2) * 5} 244 42`} />
      </g>
    </g>
  );
};

// ジェット機: x,y=機体の中心。s=1 で全長約420。右向きに飛ぶ
export const JetPlane: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({
  x, y, s = 1, f = 0,
}) => {
  const bob = Math.sin(f / 16) * 6;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(-6)`}>
      {/* 主翼 (奥) */}
      <path d="M -30 -8 L -130 76 L -66 80 L 30 6 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 胴体 */}
      <path d="M -210 0 Q -206 -30 -170 -30 L 130 -30 Q 196 -26 212 0 Q 196 26 130 30 L -170 30 Q -206 30 -210 0 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {/* コックピット窓 + 窓列 */}
      <path d="M 158 -22 Q 190 -18 202 -2 L 158 -2 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      {[-150, -116, -82, -48, -14, 20, 54, 88, 122].map((wx) => (
        <circle key={wx} cx={wx} cy={-10} r={7} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 尾翼 */}
      <path d="M -206 -4 L -252 -88 L -196 -84 L -158 -14 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 主翼 (手前) */}
      <path d="M -10 4 L -98 100 L -28 100 L 66 10 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
      {/* エンジン */}
      <ellipse cx={-48} cy={64} rx={34} ry={17} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 飛行機雲 */}
      <g stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.8}>
        <line x1={-236} y1={8} x2={-330 - (f % 10)} y2={14} />
      </g>
      <g stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.25}>
        <line x1={-236} y1={8} x2={-330 - (f % 10)} y2={14} />
      </g>
    </g>
  );
};

// =====================================================================
// 東海道絵巻横スクロール (新造): 街道が右から左へ流れ、旅人はその場で歩く
// 周期 3840px に 松4本 + 宿場1軒 + 鳥居1基。speed=1フレームに進むpx
// =====================================================================
export const KaidoScroll: React.FC<{ f: number; speed?: number; caption?: string }> = ({
  f, speed = 7, caption,
}) => {
  const P = 3840;
  const off = -((f * speed) % P);
  const hillOff = -((f * speed * 0.3) % 1920); // 遠景はゆっくり (奥行き)
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={144} />
        <g filter="url(#wobbleSoft)">
          {/* 空の富士 (動かない=はるか遠く) */}
          <g transform="translate(1480 470)" opacity={0.8}>
            <path d="M -240 0 L -64 -220 Q 0 -246 64 -220 L 240 0 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -72 -212 Q 0 -236 72 -212 L 42 -166 Q 22 -180 8 -162 Q -8 -180 -24 -164 Q -36 -178 -42 -166 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 雲 (ゆっくり左へ) */}
          {[0, 1, 2].map((i) => {
            const cxp = ((i * 760 + 300 - f * 0.6) % (W + 400) + W + 400) % (W + 400) - 200;
            return (
              <g key={i} transform={`translate(${cxp} ${150 + i * 54})`} opacity={0.85}>
                <ellipse cx={0} cy={0} rx={104} ry={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <ellipse cx={66} cy={-14} rx={56} ry={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          })}
          {/* 遠い丘 (ゆっくり流れる) */}
          {[0, 1].map((i) => (
            <path key={i} transform={`translate(${hillOff + i * 1920} 0)`}
              d="M 0 640 Q 360 560 820 620 Q 1300 560 1920 636 L 1920 760 L 0 760 Z"
              fill={TKP.pine} opacity={0.18} />
          ))}
          {/* 街道 (水平の土の帯) */}
          <rect x={-20} y={760} width={W + 40} height={H - 740} fill={TKP.roadTan} opacity={0.95} />
          <line x1={-20} y1={760} x2={W + 20} y2={760} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          {/* 道の轍 (流れて動きを出す) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const rx = ((i * 520 + off * 1.0) % P + P) % P - 200;
            return <line key={i} x1={rx} y1={905} x2={rx + 150} y2={898}
              stroke={KRP.ink} strokeWidth={4} opacity={0.22} />;
          })}
          {/* 周期タイル (松・宿場・鳥居・一里塚) */}
          {[0, 1].map((tile) => (
            <g key={tile} transform={`translate(${off + tile * P} 0)`}>
              <MatsuTree x={240} y={800} s={1.0} />
              <MatsuTree x={1180} y={792} s={0.88} flip />
              <MatsuTree x={2020} y={804} s={1.06} />
              <MatsuTree x={3350} y={796} s={0.92} flip />
              <Shukuba x={2760} y={790} s={0.94} sign="旅籠" />
              <ShinmeiTorii x={1660} y={786} s={0.8} />
              {/* 一里塚 (土まんじゅう+木) */}
              <g transform="translate(620 800)">
                <path d="M -70 0 Q 0 -54 70 0 Z" fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={5} />
                <line x1={0} y1={-48} x2={0} y2={-110} stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
                <circle cx={0} cy={-134} r={34} fill={TKP.pine} stroke={KRP.ink} strokeWidth={4.5} />
              </g>
            </g>
          ))}
          {/* 旅人 (その場で歩く) */}
          <EdoTraveler x={620} y={930} s={1.04} f={f} />
          <EdoTraveler x={790} y={944} s={0.96} f={f} phase={3} cloth={KRP.green} face="normal" />
        </g>
      </svg>
      {caption && <LabelPill x={960} y={64} text={caption} color={KRP.red} size={40} centerX />}
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 口実の路線図 (章の進行メタ演出): 口実が「信仰→教育→療養→商品」と駅で増えていく
// WatashiShared の RouteMap 方式 (駅がぽん→線路が伸びる→電車がすべる) の今回版
// =====================================================================
const KOUJITSU_STATIONS = [
  { name: "しんこう", icon: "torii" },
  { name: "きょういく", icon: "book" },
  { name: "りょうよう", icon: "onsen" },
  { name: "しょうひん", icon: "ticket" },
] as const;

const KoujitsuIcon: React.FC<{ kind: string }> = ({ kind }) => {
  if (kind === "torii") {
    return (
      <g>
        <line x1={-30} y1={30} x2={-26} y2={-28} stroke={TKP.woodLight} strokeWidth={12} strokeLinecap="round" />
        <line x1={30} y1={30} x2={26} y2={-28} stroke={TKP.woodLight} strokeWidth={12} strokeLinecap="round" />
        <rect x={-33} y={-16} width={66} height={9} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-42} y={-40} width={84} height={12} rx={2} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    );
  }
  if (kind === "book") {
    return (
      <g>
        <path d="M -42 -24 Q -20 -34 0 -24 L 0 26 Q -20 16 -42 26 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 42 -24 Q 20 -34 0 -24 L 0 26 Q 20 16 42 26 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.5}>
          <line x1={-32} y1={-12} x2={-10} y2={-16} /><line x1={-32} y1={0} x2={-10} y2={-4} />
          <line x1={10} y1={-16} x2={32} y2={-12} /><line x1={10} y1={-4} x2={32} y2={0} />
        </g>
      </g>
    );
  }
  if (kind === "onsen") {
    return (
      <g>
        <path d="M -40 10 Q 0 34 40 10 L 34 30 Q 0 46 -34 30 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <g fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
          <path d="M -20 -2 Q -28 -16 -20 -30 Q -12 -40 -18 -50" />
          <path d="M 0 2 Q -8 -14 0 -28 Q 8 -38 2 -48" />
          <path d="M 20 -2 Q 12 -16 20 -30 Q 28 -40 22 -50" />
        </g>
      </g>
    );
  }
  // ticket: 切符 (ミシン目入り)
  return (
    <g transform="rotate(-8)">
      <rect x={-44} y={-26} width={88} height={52} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={16} y1={-26} x2={16} y2={26} stroke={KRP.ink} strokeWidth={3} strokeDasharray="5 6" />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
        <line x1={-32} y1={-8} x2={4} y2={-8} /><line x1={-32} y1={4} x2={4} y2={4} />
      </g>
      <circle cx={30} cy={0} r={8} fill="none" stroke={KRP.red} strokeWidth={3.5} />
    </g>
  );
};

export const KoujitsuRoute: React.FC<{
  x: number; y: number; s?: number; f?: number;
  count: number;        // 見えている駅の数 (1〜4)
  ride?: boolean;       // 電車が前の駅から新しい駅へすべる (省略時true)
}> = ({ x, y, s = 1, f = 0, count, ride = true }) => {
  const n = Math.max(1, Math.min(4, Math.round(count)));
  const sx = (i: number) => -540 + i * 360;
  const grow = easeOut(seg(f, 0, 28));
  const popT = pop(seg(f, 14, 38));
  const slide = ride ? easeOut(seg(f, 34, 80)) : 1;
  const trainX = n === 1 ? sx(0) : sx(n - 2) + (sx(n - 1) - sx(n - 2)) * slide;
  const trainBob = Math.sin(f / 6) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {n >= 2 && (
        <g>
          <line x1={sx(0)} y1={0} x2={sx(n - 2)} y2={0} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
          <line x1={sx(0)} y1={0} x2={sx(n - 2)} y2={0} stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" />
          <line x1={sx(n - 2)} y1={0} x2={sx(n - 2) + (sx(n - 1) - sx(n - 2)) * grow} y2={0}
            stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
          <line x1={sx(n - 2)} y1={0} x2={sx(n - 2) + (sx(n - 1) - sx(n - 2)) * grow} y2={0}
            stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" />
        </g>
      )}
      {KOUJITSU_STATIONS.slice(0, n).map((st, i) => {
        const isNew = i === n - 1;
        const sc = isNew ? popT : 1;
        if (sc <= 0) return null;
        return (
          <g key={st.name} transform={`translate(${sx(i)} 0) scale(${sc})`}>
            <g transform="translate(0 -122)"><KoujitsuIcon kind={st.icon} /></g>
            <circle cx={0} cy={0} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={0} cy={0} r={15} fill={isNew ? KRP.orange : KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <g transform="translate(0 78)">
              <rect x={-st.name.length * 24 - 18} y={-30} width={st.name.length * 48 + 36} height={60}
                rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <text x={0} y={15} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={42} fill={KRP.ink}>{st.name}</text>
            </g>
          </g>
        );
      })}
      {/* 小さな汽車 (今回は電車でなく蒸気機関車風) */}
      <g transform={`translate(${trainX} ${-46 + trainBob})`}>
        <rect x={-62} y={-34} width={110} height={54} rx={12} fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={20} y={-14} width={44} height={34} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-48} y={-58} width={18} height={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-34} cy={24} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={10} cy={24} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={44} cy={24} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// =====================================================================
// プレビュー合成 (150フレームずつ巡回・左下ラベル)
// =====================================================================
const TravelLabel: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: "absolute", left: 40, bottom: 36,
    background: KRP.ink, color: KRP.white, fontFamily: FONT, fontWeight: 800,
    fontSize: 36, padding: "10px 26px", borderRadius: 14, letterSpacing: 2,
  }}>{text}</div>
);

const TRAVEL_SCENES = 7;
export const TABITRAVEL_PREVIEW_FRAMES = TRAVEL_SCENES * 150;

export const TabiTravelPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const kit = Math.min(Math.floor(frame / 150), TRAVEL_SCENES - 1);
  const f = frame - kit * 150;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      {kit === 0 && (
        <>
          <GlobeTravel f={f} from="japan" to="santiago"
            fromLabel="にほん" toLabel="サンティアゴ" caption="地球の反対側へ" />
          <TravelLabel text="① 地球儀の旅 (日本→スペイン)" />
        </>
      )}
      {kit === 1 && (
        <>
          <WorldTourGlobe f={f} caption="世界一周 222日" />
          <TravelLabel text="② 世界一周の地球儀" />
        </>
      )}
      {kit === 2 && (
        <>
          <GrandTourMap f={f} caption="グランドツアーの道のり" />
          <TravelLabel text="③ 欧州拡大地図 (グランドツアー)" />
        </>
      )}
      {kit === 3 && (
        <>
          <AbsoluteFill style={{ background: KRP.paper }}>
            <svg width={W} height={H} style={abs}>
              <WobbleDefs seed={145} />
              <g filter="url(#wobbleSoft)">
                <JapanMapCard>
                  <JapanHop f={f} from={TABI_JMAP.kyoto} to={TABI_JMAP.kumano} t0={16} lift={120} />
                  <JmapLabel lon={TABI_JMAP.kyoto[0]} lat={TABI_JMAP.kyoto[1]} text="京" dx={-70} dy={-30} />
                  {f >= 90 && <JmapLabel lon={TABI_JMAP.kumano[0]} lat={TABI_JMAP.kumano[1]} text="くまの" dx={26} dy={20} />}
                </JapanMapCard>
              </g>
            </svg>
            <Atmosphere f={f} />
          </AbsoluteFill>
          <TravelLabel text="④ 日本地図ホップ (京→熊野)" />
        </>
      )}
      {kit === 4 && (
        <>
          <KaidoScroll f={f} caption="東海道 絵巻スクロール" />
          <TravelLabel text="⑤ 街道の横スクロール" />
        </>
      )}
      {kit === 5 && (
        <>
          <AbsoluteFill style={{ background: KRP.paper }}>
            <svg width={W} height={H} style={abs}>
              <WobbleDefs seed={146} />
              <g filter="url(#wobbleSoft)">
                <KoujitsuRoute x={960} y={560} s={1.15} f={Math.max(0, f - 20)}
                  count={Math.min(4, 1 + Math.floor(f / 36))} />
              </g>
            </svg>
            <Atmosphere f={f} />
          </AbsoluteFill>
          <TravelLabel text="⑥ 口実の路線図 (駅が増える)" />
        </>
      )}
      {kit === 6 && (
        <>
          <AbsoluteFill style={{ background: KRP.paper }}>
            <svg width={W} height={H} style={abs}>
              <WobbleDefs seed={147} />
              {/* 海の帯 */}
              <rect x={-20} y={700} width={W + 40} height={H - 680} fill={KRP.blueSoft} opacity={0.5} />
              <g filter="url(#wobbleSoft)">
                <SailShip x={400} y={700} s={0.95} f={f} />
                <SteamShip x={1060} y={706} s={0.95} f={f} />
                <JetPlane x={1540} y={300} s={0.9} f={f} />
              </g>
            </svg>
            <Atmosphere f={f} />
          </AbsoluteFill>
          <TravelLabel text="⑦ 乗り物 (帆船・蒸気船・ジェット機)" />
        </>
      )}
    </AbsoluteFill>
  );
};



