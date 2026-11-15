// 「人類は、昔から飛ばして観ていた」: 地図のシーン (監督担当・修正3)
//   #180 1993年、日本初の本格的なシネマコンプレックスが開業します。どこの街でしょうか。
//   #181 答えは、神奈川県の、海老名市です。
//   #185 シネコンは郊外から全国へ広がり、2002年ごろ、スクリーンの数で半分を超えました。
//
// 作者の指摘 (後半リスト):
//   #180 「日本地図が汚すぎ、しっかり書いて」
//   #181 「神奈川県の精巧なイラストから海老名にズームして、今の人々が喜んでるシーンがいい」
//   #185 「左側の地図をもっとちゃんと書くこと」
//
// SaigoIndex の saigoScene で、ここを各章のファイルより先に引く (同じ motif を上書きする)。
// 地図の輪郭データは SaigoNihon.tsx。

import React from "react";
import { KRP, Person, PersonMini, seg, pop, easeOut, clamp01 } from "./KarakuriScenes";
import { W, H, FONT, Frame, TagPlate, QMark, Arrow } from "./SaigoShared";
import { SGP } from "./SaigoParts";
import {
  mkProj, smoothPath, NihonRettou, TOSHI, LL,
  KANAGAWA_D, KANAGAWA_SEA_D, SAGAMIGAWA_D, TAMAGAWA_D, ASHINOKO_D, KANAGAWA_MACHI, TETSUDO_D,
} from "./SaigoNihon";

const C = {
  ink: KRP.ink as string,
  cork: "#C9A779",
  seaPaper: "#D6E7EE",     // 地図の紙の海
  seaLine: "#A9CBDA",      // 海の等深線
  landPaper: "#F3EBD2",    // 地図の紙の陸
  landKana: "#F7D58A",     // 神奈川県 (主役の県)
  landNear: "#E9E2CC",     // まわりの都県
  river: "#8FBCD4",
  mount: "#CFC39C",
  lampWarm: "#F2DCA0",
  cinecon: "#E07B3A",
  meterWood: "#CBA65A",
  kusudamaA: "#E68FA4",
  kusudamaB: "#F2C14E",
  skyNow: "#BFE0F2",
  glass: "#CFE6F0",
  mall: "#EFE8DA",
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// 地図の紙の海: 等深線のゆるい波線
const SeaLines: React.FC<{ x: number; y: number; w: number; h: number; f: number; n?: number }> =
  ({ x, y, w, h, f, n = 7 }) => (
    <g stroke={C.seaLine} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const yy = y + ((i + 0.5) / n) * h;
        const ph = Math.sin(f / 30 + i) * 6;
        return <path key={i} d={`M ${x + 20} ${yy} q ${w / 8} ${-10 + ph} ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0 t ${w / 4 - 40} 0`} />;
      })}
    </g>
  );

// ===================================================================
// #180 どこの街でしょうか (日本全図 + 虫眼鏡 + 1993年の新聞)
// ===================================================================
// 日本全図の写し方 (紙のローカル座標。紙の中心が 0,0)
const P180 = mkProj({ lon0: 138.7, lat0: 37.9, x0: 0, y0: 0, k: 44, latRef: 37 });

const Sg180: React.FC<{ f: number }> = ({ f }) => {
  // 虫眼鏡は本州の上をなめるように巡回 (紙の座標で)
  const route: LL[] = [[130.6, 33.4], [135.5, 34.8], [139.6, 35.6], [140.9, 38.3], [141.4, 43.0], [136.9, 35.2]];
  const tt = (f / 70) % route.length;
  const k0 = Math.floor(tt), u = easeInOut(tt - k0);
  const a = P180(route[k0]), b = P180(route[(k0 + 1) % route.length]);
  const mgX = 960 + lerp(a[0], b[0], u);
  const mgY = 470 + lerp(a[1], b[1], u);
  // 地図の紙の中身 (レンズの中でもう一度、拡大して描くので部品にしておく)
  const mapPaper = (
    <g transform="translate(960 470) rotate(-1)">
      <rect x={-500} y={-385} width={1000} height={770} fill={C.seaPaper} stroke={KRP.ink} strokeWidth={7} />
      <SeaLines x={-500} y={-385} w={1000} h={770} f={f} n={9} />
      {/* 経緯線 (5度ごと) */}
      <g stroke={KRP.ink} strokeWidth={2} opacity={0.16}>
        {[30, 35, 40, 45].map((lat) => {
          const y = P180([138, lat])[1];
          return <line key={lat} x1={-490} y1={y} x2={490} y2={y} />;
        })}
        {[130, 135, 140, 145].map((lon) => {
          const x = P180([lon, 38])[0];
          return <line key={lon} x1={x} y1={-375} x2={x} y2={375} />;
        })}
      </g>
      <NihonRettou P={P180} land={C.landPaper} sw={4.5}
        okinawa={{ x: 300, y: 190, w: 160, h: 160, k: 110 }} />
    </g>
  );
  return (
    <Frame f={f} seed={1308} bg="#D8CBB4">
      {/* 机の天板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#A9875E" />
      <g stroke="#8A6B45" strokeWidth={4} opacity={0.6}>
        {[120, 400, 760, 1040].map((y, i) => (
          <path key={i} d={`M -20 ${y} Q 600 ${y - 18} 1200 ${y + 10} Q 1600 ${y + 24} 1940 ${y}`} fill="none" />
        ))}
      </g>
      {/* コルク板 (木枠) */}
      <rect x={210} y={40} width={1500} height={870} rx={10} fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
      <rect x={244} y={74} width={1432} height={802} fill={C.cork} stroke={KRP.ink} strokeWidth={5} />
      <g fill={KRP.ink} opacity={0.12}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={260 + rnd(101, i) * 1400} cy={90 + rnd(102, i) * 770} r={2 + rnd(103, i) * 3} />
        ))}
      </g>
      {/* 地図の紙 */}
      {mapPaper}
      <g transform="translate(960 470) rotate(-1)">
        {/* 方位記号 */}
        <g transform="translate(420 -300)">
          <circle r={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -30 L 10 0 L 0 30 L -10 0 Z" fill={KRP.ink} />
          <path d="M 0 -30 L 10 0 L -10 0 Z" fill={KRP.red} />
          <text x={0} y={-44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>N</text>
        </g>
        {/* 画びょう4つ */}
        {[[-472, -358], [472, -358], [-472, 358], [472, 358]].map(([px, py], i) => (
          <g key={i}>
            <circle cx={px + 3} cy={py + 4} r={11} fill={KRP.ink} opacity={0.25} />
            <circle cx={px} cy={py} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 大きな？ (どこの街？) */}
        <QMark x={-210} y={-120} s={2.4} f={f} t={seg(f, 4, 14)} />
      </g>
      {/* 虫眼鏡 (どこだどこだ)。レンズの中は地図を1.8倍に拡大して見せる */}
      <defs>
        <clipPath id="lens180">
          <circle cx={mgX} cy={mgY} r={96} />
        </clipPath>
      </defs>
      <g clipPath="url(#lens180)">
        <g transform={zoomAt(1.8, mgX, mgY)}>{mapPaper}</g>
      </g>
      <g transform={`translate(${mgX} ${mgY}) rotate(24)`}>
        <circle cx={0} cy={0} r={104} fill={KRP.white} opacity={0.12} />
        <circle cx={0} cy={0} r={104} fill="none" stroke={KRP.ink} strokeWidth={12} />
        <circle cx={0} cy={0} r={88} fill="none" stroke={KRP.blueSoft} strokeWidth={6} opacity={0.8} />
        <path d="M -40 -58 A 68 68 0 0 1 18 -74" fill="none" stroke={KRP.white} strokeWidth={8} opacity={0.85} strokeLinecap="round" />
        <rect x={-20} y={98} width={40} height={170} rx={18} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 1993年の新聞の束 (右下の机の上。地図にはかけない) */}
      <g transform="translate(1690 1010) rotate(-3) scale(0.92)">
        {[2, 1, 0].map((i) => (
          <rect key={i} x={-230 + i * 8} y={-60 - i * 34} width={460} height={60}
            fill={i === 0 ? KRP.white : "#E8E2D2"} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <g transform="translate(0 -128)">
          <rect x={-238} y={-100} width={476} height={100} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-218} y={-82} width={120} height={64} fill={KRP.ink} />
          <text x={-158} y={-34} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={KRP.white}>1993</text>
          <line x1={-78} y1={-74} x2={222} y2={-74} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-78} y1={-52} x2={222} y2={-52} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
          <line x1={-78} y1={-32} x2={160} y2={-32} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        </g>
        <line x1={-20} y1={-196} x2={-20} y2={0} stroke={SGP.woodDark} strokeWidth={6} />
      </g>
      {/* 電気スタンド (右上から光) */}
      <g transform="translate(1800 110)">
        <path d="M 0 0 Q -80 50 -120 160" fill="none" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <path d="M -66 -24 L 48 36 L 16 86 L -92 24 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-30} cy={62} r={16 + Math.sin(f / 8) * 2} fill={C.lampWarm} opacity={0.95} />
        <path d="M -40 60 L -360 420 L -120 560 Z" fill={C.lampWarm} opacity={0.14 + Math.sin(f / 13) * 0.02} />
      </g>
    </Frame>
  );
};

// ===================================================================
// #181 答えは、神奈川県の、海老名市です。(111コマ = 3.7秒)
// ===================================================================
// 流れ: 神奈川県の地図 → 海老名にピンがドン (f4-12) → 地図ごと海老名へ寄る (f20-60)
//       → ピンの位置から丸い窓が開き (f40-66)、1993年の開業を喜ぶ海老名の人々の場面へ
const P181 = mkProj({ lon0: 139.42, lat0: 35.39, x0: 960, y0: 560, k: 1250, latRef: 35.4 });
const EBINA = P181(KANAGAWA_MACHI.ebina);

// 山のしるし (丹沢・箱根)
const Yama: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 0 L 0 -40 L 34 0 Z" fill={C.mount} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -10 -28 L 0 -40 L 10 -28 L 4 -24 L -4 -27 Z" fill={KRP.white} opacity={0.8} />
  </g>
);

// 地図の文字ラベル (白いふちどりで地図の線に埋もれない)
const ChizuMoji: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; op?: number }> =
  ({ x, y, text, size = 28, color = KRP.ink, op = 1 }) => (
    <g opacity={op}>
      <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
        stroke={KRP.white} strokeWidth={size * 0.28} strokeLinejoin="round" fill="none">{text}</text>
      <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>{text}</text>
    </g>
  );

const KanagawaChizu: React.FC<{ f: number }> = ({ f }) => {
  const P = P181;
  const machi: Array<[string, string]> = [
    ["yokohama", "横浜"], ["kawasaki", "川崎"], ["sagamihara", "相模原"], ["odawara", "小田原"],
    ["yokosuka", "横須賀"], ["kamakura", "鎌倉"], ["hiratsuka", "平塚"],
  ];
  return (
    <g>
      {/* まわりの陸 (東京・山梨・静岡・千葉) */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.landNear} />
      {/* 陸の地紋 (うすい点) */}
      <g fill={KRP.ink} opacity={0.07}>
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={rnd(181, i) * W} cy={rnd(182, i) * H} r={3} />
        ))}
      </g>
      {/* 海 (相模湾・駿河湾・東京湾・太平洋) */}
      <path d={smoothPath(KANAGAWA_SEA_D, P, true, 0.35)} fill={C.seaPaper} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <defs>
        <clipPath id="umi181"><path d={smoothPath(KANAGAWA_SEA_D, P, true, 0.35)} /></clipPath>
      </defs>
      <g clipPath="url(#umi181)" stroke={C.seaLine} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round">
        {Array.from({ length: 9 }, (_, i) => {
          const y = 640 + i * 52;
          const ph = Math.sin(f / 14 + i) * 10;
          return <path key={i} d={`M -40 ${y} q 120 ${-14 + ph} 240 0 t 240 0 t 240 0 t 240 0 t 240 0 t 240 0 t 240 0 t 240 0 t 240 0`} />;
        })}
      </g>
      {/* 神奈川県 (主役) */}
      <path d={smoothPath(KANAGAWA_D, P, true, 0.3)} fill={C.landKana} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
      {/* 県境 (陸の上の境は点線を重ねる) */}
      <path d={smoothPath(KANAGAWA_D.slice(0, 30), P, false, 0.3)} fill="none" stroke={KRP.ink} strokeWidth={4}
        strokeDasharray="14 10" opacity={0.55} />
      {/* 鉄道 (地図記号の白黒の線)。3本が海老名で交わる */}
      {Object.values(TETSUDO_D).map((pts, i) => {
        const d = smoothPath(pts, P, false, 0.4);
        return (
          <g key={`rail${i}`}>
            <path d={d} fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
            <path d={d} fill="none" stroke={KRP.white} strokeWidth={5} strokeDasharray="16 16" />
          </g>
        );
      })}
      {/* 川と湖 */}
      <path d={smoothPath(TAMAGAWA_D, P, false)} fill="none" stroke={C.river} strokeWidth={9} strokeLinecap="round" />
      <path d={smoothPath(SAGAMIGAWA_D, P, false)} fill="none" stroke={C.river} strokeWidth={10} strokeLinecap="round" />
      <path d={smoothPath(ASHINOKO_D, P)} fill={C.seaPaper} stroke={KRP.ink} strokeWidth={4} />
      {/* 丹沢と箱根の山 */}
      {([[139.08, 35.49, 1.1], [139.16, 35.46, 1.3], [139.24, 35.48, 1.0], [139.12, 35.42, 0.9],
        [139.0, 35.53, 0.9], [139.05, 35.26, 1.0], [138.98, 35.27, 0.8]] as Array<[number, number, number]>).map(([lo, la, s], i) => {
        const [x, y] = P([lo, la]);
        return <Yama key={i} x={x} y={y} s={s} />;
      })}
      {/* 経緯線 */}
      <g stroke={KRP.ink} strokeWidth={2} opacity={0.12}>
        {[35.0, 35.2, 35.4, 35.6].map((la) => {
          const y = P([139, la])[1];
          return <line key={la} x1={-40} y1={y} x2={W + 40} y2={y} />;
        })}
        {[138.6, 138.8, 139.0, 139.2, 139.4, 139.6, 139.8, 140.0, 140.2].map((lo) => {
          const x = P([lo, 35.4])[0];
          return <line key={lo} x1={x} y1={-40} x2={x} y2={H + 40} />;
        })}
      </g>
      {/* 町の点と名前 */}
      {machi.map(([k, name], i) => {
        const [x, y] = P(KANAGAWA_MACHI[k]);
        const dy = k === "yokosuka" || k === "kamakura" ? 44 : -22;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ChizuMoji x={x} y={y + dy} text={name} size={30} />
          </g>
        );
      })}
      {/* まわりの都県・海の名前 */}
      <ChizuMoji x={P([139.58, 35.69])[0]} y={P([139.58, 35.69])[1]} text="東京都" size={34} color={KRP.grayDark} />
      <ChizuMoji x={P([138.78, 35.56])[0]} y={P([138.78, 35.56])[1]} text="山梨県" size={34} color={KRP.grayDark} />
      <ChizuMoji x={P([138.66, 35.27])[0]} y={P([138.66, 35.27])[1]} text="静岡県" size={34} color={KRP.grayDark} />
      <ChizuMoji x={P([140.17, 35.47])[0]} y={P([140.17, 35.47])[1]} text="千葉県" size={34} color={KRP.grayDark} />
      <ChizuMoji x={P([139.33, 35.2])[0]} y={P([139.33, 35.2])[1]} text="相模湾" size={32} color="#4F7E96" />
      <ChizuMoji x={P([139.84, 35.47])[0]} y={P([139.84, 35.47])[1]} text="東京湾" size={30} color="#4F7E96" />
      <ChizuMoji x={P([139.1, 35.36])[0]} y={P([139.1, 35.36])[1]} text="神奈川県" size={64} />
    </g>
  );
};

// 1993年、海老名。郊外のショッピングセンターに映画館がひらき、人々が喜ぶ
const EbinaIwai: React.FC<{ f: number }> = ({ f }) => {
  const openT = easeOut(seg(f, 64, 78)); // くす玉が割れる (丸い窓が開ききるころ)
  return (
    <g>
      {/* 空と、遠くの丹沢の山なみ (海老名から西に見える。三角の大山がいちばん目立つ) */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.skyNow} />
      <circle cx={1660} cy={150} r={60} fill="#FFF1B8" />
      <path d="M -40 330 L 40 300 L 110 312 L 170 236 L 210 250 L 250 300 L 330 290 L 400 320 L 480 300 L 560 330 L 560 400 L -40 400 Z"
        fill="#B7CBD6" stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" opacity={0.9} />
      <path d="M 150 262 L 170 236 L 192 256 L 180 262 L 170 254 L 160 264 Z" fill={KRP.white} opacity={0.6} />
      {/* 遠くの町並み (低い家とビル) */}
      <g fill="#D7DDE0" stroke={KRP.ink} strokeWidth={3.5} opacity={0.9}>
        {Array.from({ length: 9 }, (_, i) => {
          const hh = 40 + rnd(55, i) * 70;
          return <rect key={i} x={-30 + i * 38} y={400 - hh} width={34} height={hh} />;
        })}
      </g>
      {[[240, 120, 1], [1240, 90, 0.8]].map(([cx, cy, s], i) => (
        <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy}) scale(${s})`}>
          <path d="M -80 20 Q -80 -16 -40 -16 Q -26 -50 12 -40 Q 44 -60 66 -24 Q 100 -20 96 20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* ショッピングセンター本体 */}
      <rect x={300} y={300} width={1320} height={470} fill={C.mall} stroke={KRP.ink} strokeWidth={8} />
      <rect x={300} y={300} width={1320} height={70} fill="#D9CDB4" stroke={KRP.ink} strokeWidth={6} />
      {/* 2階の窓の帯 */}
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={340 + i * 126} y={400} width={96} height={86} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 映画館の棟 (右側に一段高く) */}
      <rect x={1180} y={210} width={440} height={170} fill="#E7D9F0" stroke={KRP.ink} strokeWidth={7} />
      <rect x={1214} y={236} width={372} height={70} rx={10} fill="#3B3F5C" stroke={KRP.ink} strokeWidth={5} />
      <text x={1400} y={286} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={KRP.yellow}
        letterSpacing={6}>CINEMA</text>
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={1228 + i * 31} cy={326} r={7}
          fill={(Math.floor(f / 4) + i) % 3 === 0 ? KRP.yellow : "#F7EBB0"} stroke={KRP.ink} strokeWidth={2.5} />
      ))}
      {/* 上映ポスター3枚 (絵だけ) */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${1310 + i * 120} 520)`}>
          <rect x={-46} y={-64} width={92} height={128} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-36} y={-54} width={72} height={78} fill={[KRP.blueSoft, "#F5C9A8", "#CFE3C0"][i]} />
          {i === 0 && <path d="M -36 24 L -10 -16 L 8 6 L 22 -8 L 36 24 Z" fill={KRP.blueDeep} opacity={0.6} />}
          {i === 1 && <circle cx={0} cy={-16} r={18} fill={KRP.red} opacity={0.6} />}
          {i === 2 && <path d="M -20 20 Q 0 -40 20 20 Z" fill={KRP.green} opacity={0.7} />}
          <line x1={-30} y1={40} x2={30} y2={40} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        </g>
      ))}
      {/* 入口 (ガラスの自動ドア) */}
      <rect x={760} y={560} width={400} height={210} fill="#9FC7D9" stroke={KRP.ink} strokeWidth={7} />
      <line x1={960} y1={560} x2={960} y2={770} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 790 590 L 840 590 L 800 660 Z M 990 590 L 1040 590 L 1000 660 Z" fill={KRP.white} opacity={0.5} />
      <rect x={720} y={520} width={480} height={44} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
      {/* 左の売り場の窓 */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={360 + i * 130} y={560} width={110} height={150} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* 屋上の旗 */}
      {[420, 640, 860, 1080].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={300} x2={x} y2={220} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${x} 222 q 30 ${-6 + Math.sin(f / 5 + i) * 6} 56 6 l -56 18 Z`}
            fill={[KRP.red, KRP.yellow, KRP.blue, KRP.green][i]} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      {/* 祝 開業 の垂れ幕 (入口の左右) */}
      {([[690, ["祝"]], [1205, ["開", "業"]]] as Array<[number, string[]]>).map(([x, chars], i) => (
        <g key={i} transform={`translate(${x} ${380 + Math.sin(f / 9 + i) * 3})`}>
          <rect x={-40} y={0} width={80} height={170} fill={KRP.white} stroke={KRP.red} strokeWidth={7} />
          {chars.map((ch, j) => (
            <text key={j} x={0} y={chars.length === 1 ? 108 : 72 + j * 64} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={chars.length === 1 ? 66 : 54} fill={KRP.red}>{ch}</text>
          ))}
        </g>
      ))}
      {/* くす玉 (入口の上で割れる) */}
      <g transform="translate(960 470)">
        <line x1={0} y1={-170} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${-openT * 70})`}>
          <path d="M 0 -44 A 44 44 0 0 0 -44 0 L 0 0 Z" fill={C.kusudamaA} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g transform={`rotate(${openT * 70})`}>
          <path d="M 0 -44 A 44 44 0 0 1 44 0 L 0 0 Z" fill={C.kusudamaB} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <path d="M -44 0 A 44 44 0 0 0 44 0 Z" fill={C.kusudamaA} stroke={KRP.ink} strokeWidth={5} />
        {openT > 0.05 && [-20, 0, 20].map((rx, i) => (
          <path key={i} d={`M ${rx} 30 q ${Math.sin(f / 6 + i) * 10} ${40 + openT * 30} ${rx * 0.4} ${70 + openT * 30}`}
            fill="none" stroke={i === 1 ? KRP.red : KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={openT} />
        ))}
      </g>
      {/* 地面 (駐車場の広場) */}
      <rect x={-40} y={770} width={W + 80} height={360} fill="#D9D2C2" />
      <line x1={-40} y1={770} x2={W + 40} y2={770} stroke={KRP.ink} strokeWidth={7} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={-60 + i * 280} y1={1100} x2={60 + i * 280} y2={780} stroke={KRP.white} strokeWidth={6} opacity={0.6} />
      ))}
      {/* 奥の人だかり (腕を上げて跳ねる) */}
      {Array.from({ length: 14 }, (_, i) => {
        const hop = Math.abs(Math.sin(f / 6 + i * 1.7)) * 14;
        const cols = [KRP.red, KRP.blueDeep, KRP.green, KRP.orange, "#B9A2CF", KRP.bronze, "#7FA8C9"];
        return (
          <PersonMini key={i} x={110 + i * 132 + rnd(7, i) * 30} y={850 - hop} s={0.62}
            color={cols[i % cols.length]} f={f} phase={i} face="smile" arms={i % 3 === 1 ? "down" : "up"} />
        );
      })}
      {/* 手前の主役たち (Person) */}
      <Person x={470} y={1060} s={0.95} cloth={KRP.red} clothDark="#A03226" pose="banzai" face="joy" f={f} phase={1} />
      <Person x={760} y={1080} s={0.7} cloth={KRP.yellow} clothDark="#C9A93A" pose="banzai" face="joy" f={f} phase={3} />
      <Person x={1180} y={1060} s={0.95} cloth={KRP.blueDeep} clothDark="#2F5590" pose="raise" face="smile" f={f} phase={5} />
      <Person x={1480} y={1070} s={0.9} cloth={KRP.green} clothDark="#5E8E5A" pose="banzai" face="joy" f={f} phase={7} />
      {/* 紙吹雪 */}
      {Array.from({ length: 34 }, (_, i) => {
        const cx0 = rnd(1309, i) * 1880 + 20;
        const spd = 5 + rnd(1309, i + 40) * 6;
        const cy = ((rnd(1309, i + 80) * 900 + f * spd) % 940) - 60;
        const cols = [KRP.red, KRP.yellow, KRP.green, C.kusudamaA, "#7FA8C9"];
        return (
          <rect key={i} x={cx0} y={cy} width={16} height={10} fill={cols[i % 5]} opacity={0.9}
            transform={`rotate(${rnd(1309, i + 120) * 360 + f * 7} ${cx0 + 8} ${cy + 5})`} />
        );
      })}
    </g>
  );
};

const Sg181: React.FC<{ f: number }> = ({ f }) => {
  // ナレーション「答えは、神奈川県の、海老名市です」に合わせ、地図を f50 ごろまで見せる
  const pinT = pop(seg(f, 4, 12));
  const zT = easeInOut(clamp01((f - 22) / 34));
  const z = 1 + zT * 1.4;
  const irisT = easeInOut(clamp01((f - 50) / 24));
  const irisR = irisT * 1500;
  const [ex, ey] = EBINA;
  // 寄るとき、海老名が画面の中央へ来るように平行移動も混ぜる
  const cx = ex;
  const tx = lerp(0, 960 - ex, zT);
  const ty = lerp(0, 560 - ey, zT);
  // いまの画面上での海老名の位置 (丸い窓はここから開く)
  const sx = ex + tx, sy = ey + ty;
  return (
    <Frame f={f} seed={1309} bg={C.landNear}>
      <g transform={`translate(${tx} ${ty})`}>
        <g transform={zoomAt(z, cx, ey)}>
          <KanagawaChizu f={f} />
          {/* 衝撃の輪 */}
          {[[10, 22], [14, 28]].map(([a, b], i) => {
            const t = easeOut(seg(f, a, b));
            return t > 0 && t < 1 ? (
              <circle key={i} cx={ex} cy={ey} r={30 + t * (120 + i * 60)} fill="none" stroke={KRP.red}
                strokeWidth={(7 - i * 2) / Math.max(1, z * 0.6)} opacity={(1 - t) * 0.85} />
            ) : null;
          })}
          {/* 海老名のピン (上から落ちてドン)。寄っても大きくなりすぎないよう 1/z で打ち消す */}
          <g transform={`translate(${ex} ${ey - (1 - pinT) * 500}) scale(${1 / (1 + zT * 1.6)})`} opacity={pinT > 0.02 ? 1 : 0}>
            <ellipse cx={0} cy={4} rx={20} ry={7} fill={KRP.ink} opacity={0.25} />
            <path d="M 0 0 L -13 -50 L 13 -50 Z" fill={KRP.ink} />
            <circle cx={0} cy={-92} r={48} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={-15} cy={-108} r={13} fill="#FFFFFF" opacity={0.7} />
          </g>
        </g>
      </g>
      {/* 丸い窓が開いて、1993年の海老名の開業の日へ */}
      {irisR > 1 && (
        <g>
          <defs>
            <clipPath id="iris181"><circle cx={sx} cy={sy} r={irisR} /></clipPath>
          </defs>
          <g clipPath="url(#iris181)"><EbinaIwai f={f} /></g>
          <circle cx={sx} cy={sy} r={irisR} fill="none" stroke={KRP.ink} strokeWidth={10} />
        </g>
      )}
      {/* 札 (地図でも開業の場面でも左上に残す) */}
      <TagPlate x={180} y={150} text="1993" size={46} t={seg(f, 2, 10)} rot={-3} fill={KRP.yellow} />
      <TagPlate x={420} y={150} text="海老名" size={54} t={seg(f, 10, 18)} rot={-2} />
      {irisT < 0.05 && <Arrow x={sx - 30} y={sy - 130} rot={60} t={seg(f, 14, 22)} />}
    </Frame>
  );
};

// ===================================================================
// #185 シネコンは郊外から全国へ広がり、2002年ごろ、スクリーンの数で半分を超えました。
// ===================================================================
// 右のメーター・係員は元の絵のまま。左の地図を本物の日本列島に描き直し、点を実際の都市に置く
const P185 = mkProj({ lon0: 138.7, lat0: 37.9, x0: 790, y0: 600, k: 41, latRef: 37 });
// シネコン (郊外): 海老名 (1993) から関東・中京・関西 → 全国へ
const CINECON_ORDER = [
  "ebina", "utsunomiya", "maebashi", "mito", "chiba", "hamamatsu", "nagoya", "gifu", "kobe", "nara",
  "wakayama", "okayama", "sendai", "niigata", "hiroshima", "fukuoka", "sapporo", "kumamoto", "kanazawa",
  "nagano", "takamatsu", "matsuyama", "kagoshima", "morioka", "oita", "asahikawa",
];
// 従来館 (街なかの映画館)
const OLD_THEATERS = [
  "tokyo", "osaka", "kyoto", "yokohama", "kitakyushu", "sapporo", "fukuoka", "hiroshima", "sendai",
  "shizuoka", "kumamoto", "kagoshima", "hakodate", "toyama", "fukui", "kochi", "aomori", "akita",
];

const Sg185: React.FC<{ f: number }> = ({ f }) => {
  const mT = seg(f, 4, 40);
  const share = lerp(0.3, 0.58, easeOut(mT));
  const crossed = share >= 0.5;
  const burst = crossed ? clamp01(1 - (share - 0.5) / 0.06) : 0;
  const dotN = Math.floor(seg(f, 4, 38) * CINECON_ORDER.length);
  // 沖縄の囲み (地図の紙の右下)
  const oki = { x: 950, y: 770, w: 150, h: 150, k: 100 };
  const PO = mkProj({ lon0: 127.97, lat0: 26.47, x0: oki.x + oki.w / 2, y0: oki.y + oki.h / 2, k: oki.k, latRef: 26.5 });
  const naha = PO(TOSHI.naha);
  return (
    <Frame f={f} seed={1313}>
      {/* 作戦室: 緑がかった壁 + 大机の天板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#DCE2D2" />
      <rect x={-20} y={-20} width={W + 40} height={200} fill="#C3CDB8" />
      <line x1={-20} y1={180} x2={1940} y2={180} stroke={C.ink} strokeWidth={5} opacity={0.5} />
      <rect x={-20} y={210} width={W + 40} height={900} fill={SGP.wood} />
      <path d="M -20 300 Q 500 292 980 302 M 200 700 Q 900 692 1800 704 M -20 980 Q 700 972 1940 984"
        fill="none" stroke={SGP.woodDark} strokeWidth={4} opacity={0.6} />
      <line x1={-20} y1={214} x2={1940} y2={214} stroke={C.ink} strokeWidth={7} />

      {/* ===== 左: 日本地図の紙 ===== */}
      <g transform={`rotate(-1.2 700 600)`}>
        <rect x={150} y={250} width={1120} height={690} rx={8} fill={C.seaPaper} stroke={C.ink} strokeWidth={7} />
        <SeaLines x={150} y={250} w={1120} h={690} f={f} n={8} />
        <path d="M 150 250 L 186 286 M 1270 940 L 1234 904" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
        <NihonRettou P={P185} land={C.landPaper} sw={4} okinawa={oki} />
        {/* 従来館の点 (灰色の丸。シネコンが増えるほど薄くなる) */}
        {OLD_THEATERS.map((k, i) => {
          const [x, y] = P185(TOSHI[k]);
          return (
            <circle key={i} cx={x} cy={y} r={8} fill={KRP.gray} stroke={C.ink} strokeWidth={3}
              opacity={lerp(0.95, 0.4, mT)} />
          );
        })}
        {/* シネコンの点 (橙の四角。郊外から ぽん ぽん と増える) */}
        {CINECON_ORDER.slice(0, dotN).map((k, i) => {
          const [x, y] = P185(TOSHI[k]);
          const t = clamp01((dotN - i) / 2);
          return (
            <g key={i} transform={`translate(${x + 7} ${y + 5}) scale(${pop(t)})`}>
              <rect x={-10} y={-10} width={20} height={20} rx={4} fill={C.cinecon} stroke={C.ink} strokeWidth={3.5} />
              <rect x={-5} y={-5} width={10} height={6} fill={KRP.white} opacity={0.75} />
            </g>
          );
        })}
        {/* 那覇 (沖縄の囲みの中) */}
        {dotN >= CINECON_ORDER.length - 2 && (
          <g transform={`translate(${naha[0] + 6} ${naha[1]}) scale(${pop(seg(f, 34, 40))})`}>
            <rect x={-10} y={-10} width={20} height={20} rx={4} fill={C.cinecon} stroke={C.ink} strokeWidth={3.5} />
          </g>
        )}
        {/* 1993 海老名の一番星 */}
        {(() => {
          const [x, y] = P185(TOSHI.ebina);
          return (
            <g opacity={seg(f, 2, 8)}>
              <circle cx={x + 7} cy={y + 5} r={22 + Math.sin(f / 5) * 3} fill="none" stroke={C.cinecon} strokeWidth={4} />
              <ChizuMoji x={x + 70} y={y + 52} text="1993 海老名" size={24} />
            </g>
          );
        })()}
        {/* 凡例 (地図の左上の海の上) */}
        <g transform="translate(250 312)">
          <rect x={-66} y={-40} width={330} height={104} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={-40} y={-20} width={24} height={24} rx={5} fill={C.cinecon} stroke={C.ink} strokeWidth={3.5} />
          <text x={0} y={2} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink}>シネコン</text>
          <circle cx={-28} cy={36} r={11} fill={KRP.gray} stroke={C.ink} strokeWidth={3.5} />
          <text x={0} y={46} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink}>従来館</text>
        </g>
      </g>

      {/* ===== 右: シェアのメーター (真鍮の縦計器) ===== */}
      <g transform="translate(1570 590)">
        <rect x={-130} y={-348} width={260} height={700} rx={18} fill={C.meterWood} stroke={C.ink} strokeWidth={8} />
        <path d="M -106 -320 Q 0 -330 106 -320 M -106 320 Q 0 330 106 320" fill="none" stroke="#9A7C3E" strokeWidth={3.5} />
        <rect x={-54} y={-296} width={108} height={600} rx={12} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <rect x={-42} y={292 - 576 * share} width={84} height={576 * share} rx={8}
          fill={C.cinecon} stroke={C.ink} strokeWidth={4.5} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={54} y1={292 - 57.6 * i} x2={i === 5 ? 92 : 76} y2={292 - 57.6 * i}
            stroke={C.ink} strokeWidth={i === 5 ? 6 : 3.5} />
        ))}
        <line x1={-66} y1={4} x2={66} y2={4} stroke={KRP.red} strokeWidth={8} />
        <g transform="translate(0 -392)">
          <rect x={-96} y={-34} width={192} height={68} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.red}>50%</text>
        </g>
        <line x1={110} y1={4} x2={160} y2={4} stroke={KRP.red} strokeWidth={6} opacity={0.9} />
        {burst > 0 && (
          <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={burst}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a}
                x1={Math.cos((a * Math.PI) / 180) * 70} y1={4 + Math.sin((a * Math.PI) / 180) * 70}
                x2={Math.cos((a * Math.PI) / 180) * (110 + burst * 30)}
                y2={4 + Math.sin((a * Math.PI) / 180) * (110 + burst * 30)} />
            ))}
          </g>
        )}
        <g transform={`translate(78 ${292 - 576 * share})`}>
          <polygon points="0,0 34,-16 34,16" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 驚いて見上げる係員 */}
      <Person x={1300} y={1030} s={0.95} cloth={KRP.blueDeep} clothDark="#2F5590"
        face="surprised" gaze={[0.6, -0.5]} pose="point" pointDir={1} f={f} />
      <TagPlate x={1700} y={92} text="2002ごろ" size={44} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// ===================================================================
// 登録
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_180: (f) => <Sg180 f={f} />,
  sg_181: (f) => <Sg181 f={f} />,
  sg_185: (f) => <Sg185 f={f} />,
};
export const saigoChizuScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif] ? SCENES[motif](f) : null;

void Person; void PersonMini; void pop; void easeOut; void clamp01; void TagPlate; void Arrow; void H;
void KANAGAWA_D; void KANAGAWA_SEA_D; void SAGAMIGAWA_D; void TAMAGAWA_D; void ASHINOKO_D; void KANAGAWA_MACHI;
void TOSHI; void smoothPath; void zoomAt;
