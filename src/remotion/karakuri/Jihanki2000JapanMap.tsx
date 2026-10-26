// 自販機2000年史: 日本地図の共用部品 (第5〜8章)。
// 緯度経度→地図カード上のxy変換 (jmapXY) と、ピンのホップ移動 (JapanHop) を提供する。
// 章ファイルはこのファイルを import して使う (このファイルは章を知らない)。

import React from "react";
import { KRP, seg, easeOut } from "./KarakuriScenes";
import { MapPin, DashArc, FONT } from "./Jihanki2000Scenes";

// 経度128°E→x340 (52px/度)、緯度46°N→y140 (48px/度)
export const jmapXY = (lon: number, lat: number): [number, number] => [
  340 + (lon - 128) * 52,
  140 + (46 - lat) * 48,
];

// 主要地点 [経度, 緯度]
export const JMAP = {
  shimonoseki: [130.95, 33.95] as [number, number],
  tokyo: [139.7, 35.68] as [number, number],
  nagoya: [136.9, 35.17] as [number, number],
};

// 海岸線 (簡略化した折れ線)。lon/lat のまま持ち、描画時に jmapXY で変換する
const HONSHU: Array<[number, number]> = [
  [130.9, 34.1], [131.9, 34.7], [132.9, 35.1], [134.5, 35.6], [135.9, 35.95],
  [136.8, 36.3], [136.75, 37.35], [137.35, 37.5], [138.5, 37.9], [139.4, 38.4],
  [139.9, 39.9], [140.3, 41.2], [140.9, 40.9], [141.3, 41.3], [141.5, 40.4],
  [141.7, 39.3], [141.0, 38.3], [140.9, 37.0], [140.95, 35.75], [139.9, 35.4],
  [139.1, 34.65], [138.2, 34.75], [137.0, 34.65], [136.9, 34.25], [136.3, 33.5],
  [135.2, 33.55], [135.1, 34.3], [134.0, 34.55], [132.5, 34.35], [131.4, 33.95],
];
const KYUSHU: Array<[number, number]> = [
  [130.9, 33.9], [130.3, 33.6], [129.8, 33.3], [129.6, 32.6], [130.2, 32.0],
  [130.3, 31.3], [130.7, 31.0], [131.1, 31.4], [131.5, 31.9], [131.9, 32.8],
  [131.5, 33.6],
];
const SHIKOKU: Array<[number, number]> = [
  [132.0, 33.4], [132.8, 34.1], [134.1, 34.35], [134.7, 34.2], [134.6, 33.5],
  [133.9, 33.45], [133.2, 33.35], [132.6, 32.9],
];
const HOKKAIDO: Array<[number, number]> = [
  [140.3, 42.3], [139.8, 43.2], [140.5, 43.7], [141.3, 43.7], [141.6, 45.4],
  [142.6, 44.9], [144.3, 44.1], [145.3, 44.3], [145.6, 43.6], [144.4, 43.0],
  [143.3, 42.0], [142.0, 42.6], [141.0, 41.9],
];

const poly = (pts: Array<[number, number]>): string =>
  "M " + pts.map(([lon, lat]) => jmapXY(lon, lat).join(" ")).join(" L ") + " Z";

// 日本地図カード (海+4島)。children は地図の上に重ねる (ピンなど)
export const JapanMapCard: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={240} y={120} width={1440} height={840} rx={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
    {[HOKKAIDO, HONSHU, SHIKOKU, KYUSHU].map((p, i) => (
      <path key={i} d={poly(p)} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    ))}
    {children}
  </g>
);

// ピンのホップ移動: from に立っているピンから点線が伸びて to にピンがポトン。
// t0=点線スタートのフレーム。所要: 点線60f→ピン14f。年ラベルは章側で LabelPill を重ねる
export const JapanHop: React.FC<{
  f: number; from: [number, number]; to: [number, number]; t0?: number; lift?: number;
}> = ({ f, from, to, t0 = 20, lift = 150 }) => {
  const [x1, y1] = jmapXY(from[0], from[1]);
  const [x2, y2] = jmapXY(to[0], to[1]);
  const arcT = easeOut(seg(f, t0, t0 + 60));
  return (
    <g>
      <MapPin x={x1} y={y1} t={1} s={0.85} />
      <DashArc x1={x1} y1={y1} x2={x2} y2={y2} t={arcT} lift={lift} />
      <MapPin x={x2} y={y2} t={seg(f, t0 + 56, t0 + 70)} />
    </g>
  );
};

// 地名の小ラベル (地図上用の控えめな白札)
export const JmapLabel: React.FC<{ lon: number; lat: number; text: string; dx?: number; dy?: number }> = ({
  lon, lat, text, dx = 26, dy = -26,
}) => {
  const [x, y] = jmapXY(lon, lat);
  const w = text.length * 30 + 28;
  return (
    <g transform={`translate(${x + dx} ${y + dy})`}>
      <rect x={0} y={-24} width={w} height={46} rx={10} fill="#FFFFFF" stroke={KRP.ink} strokeWidth={3.5} opacity={0.95} />
      <text x={w / 2} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={KRP.ink}>{text}</text>
    </g>
  );
};
