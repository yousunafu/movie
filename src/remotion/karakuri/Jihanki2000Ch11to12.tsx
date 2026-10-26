// 自販機2000年史: 第11章「気づけば自販機大国」(199〜219) + 第12章「いちばん新しい進化」(220〜231) + 結び (232〜238)。
// シード割当: 290〜329 (1シーン1シード)。
// 注意: 第12章は震災の章。ギャグ・赤ハンコ・コミカルな動きは入れない (237のハンコのみエンディングとして可)。

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Coin, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, abs, J2Badge, NightSky, JihankiNight, Globe, globePoint,
  DashArc, MapPin, HolyPot, TempleBG,
} from "./Jihanki2000Scenes";
import { JapanMapCard, jmapXY, JmapLabel } from "./Jihanki2000JapanMap";
import { Heart, GearIcon, HonourBox } from "./Jihanki2000Ch2to4";
import { WindowWall, Cook } from "./Jihanki2000Ch4";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// セピアの回想ウォッシュ (フラッシュバック用の半透明かけ)
const SepiaWash: React.FC<{ op?: number }> = ({ op = 0.28 }) => (
  <rect x={0} y={0} width={W} height={H} fill="#8A7A5E" opacity={op} />
);

// 昼用のシンプル現代自販機 (角と構造で描く。左上原点、s=1で360x620 ≒ Jihanki比率)
const Vend: React.FC<{ x: number; y: number; s?: number; f?: number; body?: string; faceOp?: number }> = ({
  x, y, s = 1, f = 0, body = KRP.red, faceOp = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={0} width={360} height={620} rx={18} fill={body} stroke={KRP.ink} strokeWidth={8} opacity={faceOp} />
    <g opacity={faceOp}>
      {/* 商品窓 */}
      <rect x={30} y={34} width={300} height={210} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${74 + i * 92} 90)`}>
          <rect x={-24} y={0} width={48} height={96} rx={8}
            fill={[KRP.orange, KRP.blue, "#7FA86B"][i]} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-24} y={22} width={48} height={14} fill={KRP.white} opacity={0.65} />
        </g>
      ))}
      {/* 価格帯・コイン口 */}
      <rect x={30} y={266} width={300} height={34} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      <rect x={272} y={330} width={44} height={14} rx={6} fill={KRP.ink} />
      <circle cx={294} cy={392} r={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {/* 取り出し口 */}
      <rect x={46} y={492} width={268} height={76} rx={10} fill="#8C3B2E" stroke={KRP.ink} strokeWidth={6} />
      <rect x={60} y={506} width={240} height={48} rx={8} fill={KRP.ink} opacity={0.8} />
      {/* ロゴ帯 */}
      <rect x={46} y={350} width={200} height={110} rx={10} fill={KRP.white} opacity={0.14} />
    </g>
    {/* 足 */}
    <rect x={24} y={614} width={54} height={16} fill={KRP.ink} opacity={faceOp} />
    <rect x={282} y={614} width={54} height={16} fill={KRP.ink} opacity={faceOp} />
  </g>
);

// 丸頭2頭身のシンプル人物 (足元原点)。まばたき (f+phase*41)%97<5 / 体ゆれ sin((f+phase*17)/13)*3
const SP: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  cloth?: string; clothDark?: string; flip?: boolean; cap?: boolean;
  gaze?: [number, number]; lean?: number; hideArm?: "left" | "right"; silhouette?: boolean;
}> = ({
  x, y, s = 1, f = 0, phase = 0, cloth = "#56688C", clothDark = "#46567A",
  flip = false, cap = false, gaze = [0, 0], lean = 0, hideArm, silhouette = false,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const skin = silhouette ? cloth : "#F2D8B8";
  const sc = silhouette ? cloth : cloth;
  const sd = silhouette ? cloth : clothDark;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s}) rotate(${lean})`}>
      {/* 脚・靴 */}
      <rect x={-30} y={-58} width={24} height={52} fill={sd} stroke={silhouette ? "none" : KRP.ink} strokeWidth={4.5} />
      <rect x={6} y={-58} width={24} height={52} fill={sd} stroke={silhouette ? "none" : KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      {/* 腕 (別描きするときは hideArm で消す: 二重腕防止) */}
      {hideArm !== "left" && (
        <rect x={-76} y={-146} width={22} height={80} rx={11} fill={sc} stroke={silhouette ? "none" : KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={54} y={-146} width={22} height={80} rx={11} fill={sc} stroke={silhouette ? "none" : KRP.ink} strokeWidth={4.5} />
      )}
      {/* 胴 */}
      <rect x={-56} y={-160} width={112} height={108} rx={26} fill={sc} stroke={silhouette ? "none" : KRP.ink} strokeWidth={5.5} />
      {/* 頭 */}
      <circle cx={0} cy={-212} r={52} fill={skin} stroke={silhouette ? "none" : KRP.ink} strokeWidth={5.5} />
      {!silhouette && (
        <g>
          <path d="M -52 -224 Q -40 -262 0 -262 Q 40 -262 52 -224 L 52 -236 Q 36 -268 0 -268 Q -36 -268 -52 -236 Z"
            fill="#6E5B46" stroke={KRP.ink} strokeWidth={4} />
          {cap && (
            <g>
              <path d="M -52 -236 Q 0 -278 52 -236 L 52 -248 Q 0 -288 -52 -248 Z" fill={clothDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-58} y={-242} width={70} height={10} rx={5} fill={clothDark} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          )}
          {blink ? (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
              <line x1={-24 + gx} y1={-212 + gy} x2={-10 + gx} y2={-212 + gy} />
              <line x1={10 + gx} y1={-212 + gy} x2={24 + gx} y2={-212 + gy} />
            </g>
          ) : (
            <g fill={KRP.ink}>
              <circle cx={-17 + gx} cy={-212 + gy} r={5} />
              <circle cx={17 + gx} cy={-212 + gy} r={5} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// 別描きの腕 (肩から回す)。SP の hideArm とセットで使う
const SpArm: React.FC<{ sx: number; sy: number; angle: number; len?: number; cloth?: string; hold?: React.ReactNode }> = ({
  sx, sy, angle, len = 92, cloth = "#56688C", hold,
}) => (
  <g transform={`rotate(${angle} ${sx} ${sy})`}>
    <line x1={sx} y1={sy} x2={sx} y2={sy + len} stroke={cloth} strokeWidth={22} strokeLinecap="round" />
    <circle cx={sx} cy={sy + len} r={13} fill="#F2D8B8" stroke={KRP.ink} strokeWidth={4} />
    {hold && <g transform={`translate(${sx} ${sy + len})`}>{hold}</g>}
  </g>
);

// 夜道 (シーン1の原寸レイアウト)。205/217/235/236/237/238 で使い回す
const NightRoadBG: React.FC<{ f: number }> = ({ f }) => (
  <g>
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
);

// 章扉のタイトル帯 (SceneCh8Doorのレイアウト+半透明白下地)
const DoorTitle: React.FC<{ t: number; chapter: string; title: string }> = ({ t, chapter, title }) => (
  <div style={{
    position: "absolute", left: 1130, top: 680, width: 660,
    opacity: t, transform: `translateY(${(1 - t) * 30}px)`,
    background: "rgba(253,251,247,0.82)", borderRadius: 8, padding: "4px 10px 10px",
  }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>
      {chapter}
    </div>
    <div style={{
      fontFamily: FONT, fontWeight: 900, fontSize: 54, color: KRP.ink, lineHeight: 1.4,
      borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
    }}>
      {title}
    </div>
  </div>
);

// ===== 199. 第11章扉: 日本地図が自販機の灯りで光る =====
const SceneCh11Door: React.FC<{ f: number }> = ({ f }) => {
  const spots: Array<[number, number]> = [
    [141.35, 43.06], [142.37, 43.77], [140.87, 38.27], [141.15, 39.7], [139.04, 37.9],
    [139.7, 35.68], [138.38, 34.98], [136.9, 35.17], [136.65, 36.56], [135.5, 34.69],
    [133.92, 34.66], [132.46, 34.4], [134.05, 34.35], [133.53, 33.56], [130.4, 33.59],
    [130.7, 32.8], [130.56, 31.6],
  ];
  const titleT = easeOut(seg(f, 96, 114));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={290} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {spots.map(([lon, lat], i) => {
              const [x, y] = jmapXY(lon, lat);
              const t = easeOut(seg(f, 8 + i * 4, 20 + i * 4));
              if (t <= 0.01) return null;
              return (
                <g key={i} opacity={t}>
                  {/* 灯りのにじみ */}
                  <circle cx={x} cy={y} r={34} fill="#F5E6B8" opacity={0.5 + 0.18 * Math.sin((f + i * 13) / 11)} />
                  {/* ミニ自販機 (灯った窓) */}
                  <rect x={x - 9} y={y - 17} width={18} height={32} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={x - 6} y={y - 13} width={12} height={10} rx={2} fill="#FFF3C4" />
                </g>
              );
            })}
          </JapanMapCard>
        </g>
      </svg>
      <DoorTitle t={titleT} chapter="第11章" title="気づけば自販機大国" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 200. 391万台カウントアップ (Scene10000Count が手本) =====
const Scene391Count: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.floor(easeOut(seg(f, 8, 70)) * 3910000);
  const don = 1 + 0.1 * pop(seg(f, 68, 80)) - 0.1 * seg(f, 80, 92);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={291} />
        <g filter="url(#wobbleSoft)" opacity={0.3}>
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => (
              <g key={`${r}${c}`} transform={`translate(${150 + c * 272} ${90 + r * 250})`}>
                <rect x={-22} y={-26} width={44} height={76} rx={6} fill="#C9573B" stroke={KRP.ink} strokeWidth={4} />
                <rect x={-14} y={-18} width={28} height={22} rx={3} fill="#EDF6FA" stroke={KRP.ink} strokeWidth={3} />
              </g>
            )),
          )}
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 540) scale(${don}) translate(-960 -540)`}>
            <rect x={420} y={330} width={1080} height={380} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
            <text x={960} y={580} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={132} fill={KRP.red}>
              {`約${n.toLocaleString("en-US")}`}
              <tspan fontSize={72} fill={KRP.ink}>{" 台"}</tspan>
            </text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={230} centerX text="現在、日本の自販機は" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 201. 内訳: 飲み物だけで約220万台 (棒がにゅっと) =====
const SceneDrinkShare: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 12, 52));
  const t2 = easeOut(seg(f, 34, 74));
  const h1 = 460 * t1;
  const h2 = 460 * (220 / 391) * t2;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={292} />
        <g filter="url(#wobbleSoft)">
          <rect x={300} y={140} width={1320} height={720} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          <line x1={400} y1={780} x2={1520} y2={780} stroke={KRP.ink} strokeWidth={6} />
          {/* 全体の棒 */}
          <rect x={560} y={780 - h1} width={220} height={h1} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
          {t1 > 0.95 && (
            <text x={670} y={780 - h1 - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>
              約391万台
            </text>
          )}
          <text x={670} y={850} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={KRP.ink}>
            自販機ぜんぶ
          </text>
          {/* 飲料の棒 */}
          <rect x={1100} y={780 - h2} width={220} height={h2} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
          {t2 > 0.95 && (
            <text x={1210} y={780 - h2 - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.blueDeep}>
              約220万台
            </text>
          )}
          <text x={1210} y={850} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={KRP.ink}>
            飲み物だけ
          </text>
          {/* 対応の点線 */}
          <line x1={780} y1={780 - 460 * (220 / 391)} x2={1100} y2={780 - 460 * (220 / 391)}
            stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 14" opacity={0.4 * t2} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="飲み物の自販機だけで、約220万台" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 202. 国民30人に1台 (人型30人+自販機1台) =====
const Scene30Per1: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={293} />
      <g filter="url(#wobbleSoft)">
        <rect x={120} y={150} width={1100} height={780} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      </g>
      <g filter="url(#wobble)">
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => {
            const i = r * 6 + c;
            const lit = easeOut(seg(f, 6 + i * 2.4, 14 + i * 2.4));
            const x = 240 + c * 175, y = 300 + r * 150;
            return (
              <g key={i}>
                <g opacity={1 - lit}>
                  <circle cx={x} cy={y - 66} r={26} fill="#C8C2B6" stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
                  <rect x={x - 34} y={y - 38} width={68} height={74} rx={24} fill="#C8C2B6" stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
                </g>
                <g opacity={lit}>
                  <circle cx={x} cy={y - 66} r={26} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
                  <rect x={x - 34} y={y - 38} width={68} height={74} rx={24} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
                </g>
              </g>
            );
          }),
        )}
        {/* 対の自販機1台 */}
        <Vend x={1420} y={300} s={0.86} f={f} />
        <text x={1600} y={240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.red}
          opacity={easeOut(seg(f, 80, 96))}>
          1台
        </text>
        <text x={670} y={240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.blueDeep}
          opacity={easeOut(seg(f, 78, 94))}>
          30人
        </text>
      </g>
    </svg>
    <LabelPill x={960} y={966} centerX text="ざっくり、国民30人に1台" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 203. 密度は世界トップクラス (地球儀+日本ピカーン) =====
const SceneSekaiTop: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 520, r = 360;
  const jp = globePoint(cx, cy, r, 137, 36, 137);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={294} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={137} f={f} />
        </g>
        <g filter="url(#wobble)">
          {/* 光の波紋 */}
          {[0, 1, 2].map((i) => {
            const t = ((((f * 2 + i * 44) % 130) + 130) % 130) / 130;
            return (
              <circle key={i} cx={jp.x} cy={jp.y} r={16 + t * 240} fill="none"
                stroke={KRP.yellow} strokeWidth={7} opacity={0.7 * (1 - t)} />
            );
          })}
          {/* きらめき線 */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (-90 + (i - 2.5) * 30 + Math.sin(f / 19) * 4) * (Math.PI / 180);
            return (
              <line key={i} x1={jp.x + Math.cos(a) * 60} y1={jp.y + Math.sin(a) * 60}
                x2={jp.x + Math.cos(a) * 120} y2={jp.y + Math.sin(a) * 120}
                stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round"
                opacity={0.5 + 0.4 * Math.abs(Math.sin((f + i * 9) / 13))} />
            );
          })}
          <MapPin x={jp.x} y={jp.y} t={seg(f, 8, 22)} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="人口あたりの密度は、世界トップクラス" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 204. 本当にすごいのは数ではない (数字がスッと消える) =====
const SceneKazuJanai: React.FC<{ f: number }> = ({ f }) => {
  const fade = (a: number) => 1 - easeOut(seg(f, a, a + 36));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={295} />
        <g filter="url(#wobble)">
          <g opacity={fade(22)}>
            <rect x={560} y={330} width={800} height={200} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <text x={960} y={468} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={KRP.red}>
              3,910,000
            </text>
          </g>
          <g opacity={fade(34)}>
            <rect x={270} y={620} width={430} height={130} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <text x={485} y={712} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.blueDeep}>
              220万台
            </text>
          </g>
          <g opacity={fade(46)}>
            <rect x={1190} y={620} width={480} height={130} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <text x={1430} y={710} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={KRP.ink}>
              世界トップ
            </text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="でも、本当にすごいのは、数ではありません" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 205. 冒頭の夜道、ふたたび (シーン1と同じ構図で円環) =====
const SceneYomichiFutatabi: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#2E3A52" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={296} />
      <g filter="url(#wobbleSoft)">
        <NightRoadBG f={f} />
      </g>
      <g filter="url(#wobble)">
        <JihankiNight x={1150} y={190} s={0.92} f={f} />
      </g>
    </svg>
    <LabelPill x={960} y={966} centerX text="思い出してください。冒頭の、夜道です" />
    <J2Badge />
    <Atmosphere f={f} dark />
  </AbsoluteFill>
);

// ===== 206. 現金と商品を積んだ無人の箱 (透視図がスッと透ける) =====
const SceneMujinToushi: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 30, 62));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={297} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 中身 (透けて見える) */}
          <g opacity={t}>
            <rect x={716} y={196} width={488} height={668} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            {/* 商品コラム */}
            {[0, 1, 2].map((c) =>
              [0, 1, 2].map((r) => (
                <rect key={`${c}${r}`} x={756 + c * 140} y={236 + r * 120} width={68} height={92} rx={9}
                  fill={[KRP.orange, KRP.blue, "#7FA86B"][(c + r) % 3]} stroke={KRP.ink} strokeWidth={4.5} />
              )),
            )}
            <line x1={716} y1={616} x2={1204} y2={616} stroke={KRP.ink} strokeWidth={5} />
            {/* 現金箱 */}
            <rect x={790} y={660} width={340} height={160} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
            <Coin cx={880} cy={700} r={26} text="¥" />
            <Coin cx={960} cy={726} r={26} text="¥" />
            <Coin cx={1040} cy={698} r={26} text="¥" />
            <text x={1300} y={330} fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.ink}>商品</text>
            <line x1={1230} y1={316} x2={1290} y2={316} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" />
            <text x={1300} y={752} fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.red}>現金</text>
            <line x1={1230} y1={738} x2={1290} y2={738} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" />
          </g>
          {/* 外箱 (透けていく) */}
          <Vend x={700} y={180} s={1.42} f={f} faceOp={1 - 0.78 * t} />
          <rect x={700} y={180} width={511} height={880 * 0.715 + 76} rx={24} fill="none" stroke={KRP.ink}
            strokeWidth={8} opacity={0.3 + 0.7 * t} strokeDasharray={t > 0.1 ? "16 12" : "1 0"} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="現金と商品を積んだ無人の箱が、屋外に" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 207. こんな置き方ができる国はほとんどない (地球儀に×) =====
const SceneSekaiBatsu: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 520, r = 360, lon0 = 110;
  const pts: Array<[number, number]> = [
    [37.6, 55.7], [77, 28.6], [116, 40], [100.5, 13.7], [151, -33.8],
  ];
  const jp = globePoint(cx, cy, r, 137, 36, lon0);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={298} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
        </g>
        <g filter="url(#wobble)">
          {pts.map(([lon, lat], i) => {
            const p = globePoint(cx, cy, r, lon, lat, lon0);
            if (!p.visible) return null;
            const t = pop(seg(f, 22 + i * 12, 34 + i * 12));
            return t > 0.02 ? (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${t})`} stroke={KRP.red} strokeWidth={10} strokeLinecap="round">
                <line x1={-20} y1={-20} x2={20} y2={20} />
                <line x1={20} y1={-20} x2={-20} y2={20} />
              </g>
            ) : null;
          })}
          {/* 日本だけ光る */}
          <circle cx={jp.x} cy={jp.y} r={44} fill={KRP.yellow} opacity={0.3 + 0.15 * Math.sin(f / 9)} />
          <MapPin x={jp.x} y={jp.y} t={seg(f, 8, 22)} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="こんな置き方ができる国は、ほとんどない" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 208. 多くの国では壊されるか持ち去られる (控えめな暗示) =====
const SceneKowareruKage: React.FC<{ f: number }> = ({ f }) => {
  const c1 = seg(f, 30, 38), c2 = seg(f, 44, 52), c3 = seg(f, 58, 66);
  return (
    <AbsoluteFill style={{ background: "#413B33" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={299} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={860} width={W} height={220} fill="#332E27" />
          <line x1={0} y1={860} x2={W} y2={860} stroke="#1E1B17" strokeWidth={5} />
          <ellipse cx={760} cy={560} rx={520} ry={420} fill="#FFF3C4" opacity={0.07} />
        </g>
        <g filter="url(#wobble)">
          {/* 自販機のシルエット */}
          <rect x={580} y={260} width={360} height={600} rx={18} fill="#2E2A25" stroke="#1E1B17" strokeWidth={8} />
          <rect x={612} y={300} width={296} height={200} rx={10} fill="#55493C" opacity={0.7} />
          <rect x={626} y={740} width={268} height={70} rx={9} fill="#1E1B17" opacity={0.8} />
          {/* ヒビ (ピシッ、控えめに) */}
          <g stroke="#D9CBA8" strokeWidth={5} strokeLinecap="round" fill="none">
            {c1 > 0 && <path d="M 760 330 L 742 376 L 758 410" opacity={0.85} />}
            {c2 > 0 && <path d="M 758 410 L 730 448 M 758 410 L 788 452" opacity={0.85} />}
            {c3 > 0 && <path d="M 788 452 L 780 492" opacity={0.7} />}
          </g>
          {/* 持ち去る影 (画面の端にうっすら) */}
          <g opacity={0.3}>
            <g transform={`translate(${1430 + easeOut(seg(f, 20, 140)) * 260} 0)`}>
              <SP x={0} y={900} s={1.1} f={f} phase={4} cloth="#241F1A" silhouette hideArm="left" />
              <rect x={-96} y={700} width={110} height={90} rx={8} fill="#241F1A" />
            </g>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="多くの国では、壊されるか持ち去られる" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 209. 海外では壁の中に埋め込み (欧州風+格子ガシャン) =====
const SceneKabeGrille: React.FC<{ f: number }> = ({ f }) => {
  const gt = easeOut(seg(f, 50, 64));
  const clank = f >= 62 && f < 70 ? Math.sin(f * 2.4) * 4 : 0;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={300} />
        <g filter="url(#wobbleSoft)">
          {/* 石壁 */}
          <rect x={0} y={0} width={W} height={880} fill="#CFC5B4" />
          {Array.from({ length: 7 }, (_, r) => (
            <g key={r} stroke={KRP.ink} strokeWidth={3} opacity={0.22}>
              <line x1={0} y1={120 + r * 110} x2={W} y2={120 + r * 110} />
              {Array.from({ length: 8 }, (_, c) => (
                <line key={c} x1={(r % 2) * 120 + c * 250} y1={120 + r * 110} x2={(r % 2) * 120 + c * 250} y2={230 + r * 110} />
              ))}
            </g>
          ))}
          {/* 石畳 */}
          <rect x={0} y={880} width={W} height={200} fill="#B8AD9A" />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M ${i * 200 - 40} 940 q 100 -26 200 0`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
          ))}
          {/* 街灯 (欧州風) */}
          <g stroke={KRP.ink} strokeWidth={6} fill="#4A4438">
            <rect x={240} y={420} width={16} height={460} />
            <path d="M 218 420 L 278 420 L 266 350 L 230 350 Z" fill="#3C3830" />
            <circle cx={248} cy={388} r={22} fill="#F5E6B8" opacity={0.8} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 壁のくぼみ+埋め込み自販機 */}
          <rect x={690} y={250} width={540} height={600} rx={12} fill="#8E8373" stroke={KRP.ink} strokeWidth={8} />
          <rect x={690} y={250} width={540} height={26} fill={KRP.ink} opacity={0.25} />
          <Vend x={740} y={300} s={1.22} f={f} body="#9E4C3A" />
          {/* 格子 (上から下りる) */}
          <g transform={`translate(0 ${-620 * (1 - gt) + clank})`}>
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={716 + i * 92} y={262} width={16} height={580} rx={6}
                fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            ))}
            <rect x={700} y={420} width={520} height={16} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            <rect x={700} y={660} width={520} height={16} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="海外の自販機の多くは、壁の中に" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 210. 第4章「屋内へ」の再演 (セピアの伏線回収。原図の座標をそのまま使用) =====
const SceneOkunaiSepia: React.FC<{ f: number }> = ({ f }) => {
  const pairs: Array<{ from: [number, number]; to: [number, number]; d: number }> = [
    { from: [620, 420], to: [800, 380], d: 0 },
    { from: [1060, 330], to: [1220, 390], d: 12 },
    { from: [880, 620], to: [1020, 500], d: 24 },
    { from: [1340, 520], to: [1210, 395], d: 36 },
    { from: [700, 700], to: [820, 385], d: 48 },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={301} />
        <g filter="url(#wobbleSoft)">
          <rect x={240} y={150} width={1440} height={780} rx={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 430 320 L 1120 308
            Q 1150 340 1195 326 L 1370 338
            L 1405 300 L 1438 318 L 1392 398
            Q 1340 462 1270 508 L 1245 535
            L 1305 628 Q 1312 666 1282 658 L 1212 556
            Q 1105 582 1010 574 L 960 610
            Q 942 664 912 658 Q 890 650 894 610 L 894 570
            L 690 556 L 462 492 Z"
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1140 352 Q 1172 374 1210 360" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        </g>
        <g filter="url(#wobble)">
          {[[800, 380], [1220, 390], [1020, 500]].map(([bx, by], i) => {
            const absorbed = pairs.some((p) => p.to[0] === bx && seg(f, 25 + p.d, 70 + p.d) >= 1);
            const puff = absorbed ? 1 + 0.06 * Math.sin(f / 5) : 1;
            return (
              <g key={i} transform={`translate(${bx} ${by}) scale(${puff})`}>
                <rect x={-44} y={-56} width={88} height={92} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-52} y={-66} width={104} height={14} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
                {[0, 1].map((r2) => [0, 1].map((c2) => (
                  <rect key={`${r2}${c2}`} x={-28 + c2 * 32} y={-42 + r2 * 34} width={22} height={24}
                    fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
                )))}
                <rect x={-12} y={10} width={24} height={26} fill={KRP.ink} />
              </g>
            );
          })}
          {pairs.map((p, i) => {
            const t = easeOut(seg(f, 25 + p.d, 70 + p.d));
            const mx = lerp(p.from[0], p.to[0], t);
            const my = lerp(p.from[1], p.to[1], t);
            const sc = 1 - 0.75 * t;
            const op = 1 - seg(t, 0.75, 1);
            if (op <= 0.01) return null;
            return (
              <g key={i} transform={`translate(${mx} ${my}) scale(${sc})`} opacity={op}>
                <rect x={-30} y={-52} width={60} height={104} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-20} y={-40} width={40} height={30} rx={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
                <rect x={-20} y={4} width={40} height={10} rx={4} fill={KRP.ink} opacity={0.75} />
              </g>
            );
          })}
        </g>
        {/* セピアの回想 */}
        <SepiaWash />
      </svg>
      <LabelPill x={960} y={930} centerX text="アメリカで機械が屋内へ引っ込んだ理由も、同じ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 211. 支える2本の柱「性能」「治安」 =====
const SceneSasaeHashira: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 14, 50));
  const t2 = easeOut(seg(f, 26, 62));
  const Pillar: React.FC<{ x: number; t: number; label: string }> = ({ x, t, label }) => {
    const h = 420 * t;
    return (
      <g>
        <rect x={x - 70} y={900 - h} width={140} height={h} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        <rect x={x - 92} y={900 - h - 26} width={184} height={30} rx={6} fill="#DECBA0" stroke={KRP.ink} strokeWidth={6} opacity={t} />
        {[0, 1].map((c) => (
          <line key={c} x1={x - 28 + c * 56} y1={900 - h + 16} x2={x - 28 + c * 56} y2={892} stroke={KRP.ink} strokeWidth={3} opacity={0.3 * t} />
        ))}
        {t > 0.9 && (
          <g>
            {label.split("").map((ch, i) => (
              <text key={i} x={x} y={620 + i * 92} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={76} fill={KRP.ink}>{ch}</text>
            ))}
          </g>
        )}
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={302} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill={KRP.floor} />
          <line x1={0} y1={900} x2={W} y2={900} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 上に乗る台と自販機 */}
          <rect x={520} y={420} width={880} height={36} rx={10} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
          <Vend x={790} y={60} s={0.58} f={f} />
          <Pillar x={700} t={t1} label="性能" />
          <Pillar x={1220} t={t2} label="治安" />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="支えていたのは、機械の性能と、この国の治安" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 212. 駅前の人波 (置けば売れる土地柄) =====
const SceneEkimaeNami: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={303} />
      <g filter="url(#wobbleSoft)">
        {/* 駅舎 */}
        <rect x={160} y={140} width={1100} height={500} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        <rect x={160} y={140} width={1100} height={70} rx={14} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <rect x={560} y={260} width={300} height={130} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={710} y={352} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.ink}>駅</text>
        {/* 改札口 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={400 + i * 240} y={470} width={140} height={170} fill="#9BA7B5" stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={0} y={640} width={W} height={440} fill={KRP.floor} />
        <line x1={0} y1={640} x2={W} y2={640} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g filter="url(#wobble)">
        {/* 人波 (シルエットが流れる) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const spd = 4.2 + (i % 3) * 1.3;
          const x = ((f * spd + i * 390) % 2500) - 290;
          const y = 820 + (i % 3) * 60;
          const sc = 0.78 + (i % 3) * 0.12;
          return (
            <SP key={i} x={x} y={y} s={sc} f={f} phase={i}
              cloth={["#6E7B8E", "#8A8273", "#5E6E86"][i % 3]} silhouette flip={i % 4 === 3} />
          );
        })}
        {/* 駅前の自販機 */}
        <Vend x={1500} y={300} s={0.95} f={f} />
      </g>
    </svg>
    <LabelPill x={960} y={966} centerX text="人の流れが密で、置けば売れる土地柄も追い風" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 213. 第4章の厨房、セピアで再登場 (原図の座標のまま、カメラは最初から裏側) =====
const SceneChuboSepia: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={304} />
      <g transform="translate(-900 0)">
        <g filter="url(#wobbleSoft)">
          <rect x={-100} y={880} width={2020} height={200} fill={KRP.floor} />
          <line x1={-100} y1={880} x2={1880} y2={880} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1960} y={120} width={960} height={960} fill="#EFE3C8" />
          <rect x={1960} y={880} width={960} height={200} fill="#D9C9A4" />
          <line x1={1960} y1={880} x2={2920} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* 厨房の棚 (パイがずらり) */}
          <rect x={2560} y={240} width={300} height={420} fill="#C9B690" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <line x1={2560} y1={360 + r * 110} x2={2860} y2={360 + r * 110} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2].map((c) => (
                <g key={c} transform={`translate(${2615 + c * 95} ${340 + r * 110})`}>
                  <ellipse cx={0} cy={0} rx={28} ry={14} fill="#E8C87A" stroke={KRP.ink} strokeWidth={3.5} />
                  <ellipse cx={0} cy={-5} rx={22} ry={9} fill="#F2DCA0" stroke={KRP.ink} strokeWidth={2.5} />
                </g>
              ))}
            </g>
          ))}
        </g>
        <g filter="url(#wobble)">
          <WindowWall x0={240} y0={300} cols={9} rows={4} pitchX={180} pitchY={152} s={0.95} />
          {/* 壁の断面 (しきり) */}
          <rect x={1880} y={120} width={80} height={960} fill="#B8A888" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={1884} y1={160 + i * 118} x2={1956} y2={200 + i * 118} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
          ))}
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={1972} y={262 + r * 152} width={74} height={96} rx={6}
              fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* 大なべ+コック */}
          <ellipse cx={2270} cy={790} rx={150} ry={34} fill="#9A938A" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 2130 660 L 2410 660 L 2390 790 L 2150 790 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          {/* 湯気 */}
          {[0, 1, 2].map((i) => {
            const t = ((f * 1.2 + i * 34) % 90) / 90;
            return (
              <ellipse key={i} cx={2270 + Math.sin((f + i * 30) / 15) * 26} cy={640 - t * 120}
                rx={30 + t * 16} ry={16 + t * 6} fill={KRP.white} opacity={0.4 * (1 - t)} />
            );
          })}
          <Cook x={2470} y={900} s={1.05} f={f} phase={1} face="smile" gaze={[-6, -2]} mustache />
          <Cook x={2130} y={905} s={1.0} f={f} phase={3} gaze={[5, -3]} />
        </g>
      </g>
      {/* セピアの回想 */}
      <SepiaWash />
    </svg>
    <LabelPill x={960} y={966} centerX text="オートマットの壁の裏の厨房を、思い出して" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 214. 補充のドライバー (台車で補充・売上金を回収) =====
const SceneHojuDriver: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 90;
  // 腕: 台車の箱 (左下) ⇔ 自販機の中 (右上) を往復
  const sw = fc < 45 ? easeOut(seg(fc, 6, 38)) : 1 - easeOut(seg(fc, 52, 84));
  const armA = lerp(52, -64, sw);
  const cloth = "#56688C";
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={305} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 自販機 (前面オープン) */}
          <rect x={560} y={260} width={400} height={624} rx={18} fill="#8C3B2E" stroke={KRP.ink} strokeWidth={8} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={600 + c * 112} y={300 + r * 150} width={76} height={110} rx={9}
                fill={[KRP.orange, KRP.blue, "#7FA86B"][(r + c) % 3]} stroke={KRP.ink} strokeWidth={4.5} />
            )),
          )}
          <line x1={560} y1={760} x2={960} y2={760} stroke={KRP.ink} strokeWidth={5} />
          {/* 開いた扉 (左のちょうつがいを軸に手前へ開いた板を、細い台形で表現) */}
          <g>
            <polygon points="560,260 560,884 420,928 420,304" fill={KRP.red} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
            <polygon points="540,330 540,540 452,566 452,356" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          </g>
          {/* ドライバー (右腕は別描き) */}
          <SP x={1180} y={905} s={1.15} f={f} phase={2} cloth={cloth} clothDark="#46567A" cap hideArm="left" gaze={[-6, -2]} />
          <SpArm sx={1115} sy={740} angle={armA} len={110} cloth={cloth}
            hold={<rect x={-20} y={-6} width={40} height={64} rx={8} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />} />
          {/* 台車+ケース */}
          <g>
            <rect x={1390} y={620} width={26} height={260} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={1412} cy={892} r={30} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={1404} y={700} width={240} height={86} rx={8} fill="#C9573B" stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={1404} y={792} width={240} height={86} rx={8} fill="#C9573B" stroke={KRP.ink} strokeWidth={5.5} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={1424 + i * 56} y={716} width={36} height={54} rx={6} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
          {/* 売上金の回収箱 */}
          <rect x={300} y={800} width={170} height={84} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          <Coin cx={386} cy={792} r={24} text="¥" />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="日本でも毎日、補充のドライバーたちが" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 215. 裏側の人が支えている (機械のうしろに影がふわり) =====
const SceneUraNoHito: React.FC<{ f: number }> = ({ f }) => {
  const kage = easeOut(seg(f, 28, 76));
  return (
    <AbsoluteFill style={{ background: "#2E3A52" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={306} />
        <g filter="url(#wobbleSoft)">
          <NightSky f={f} />
          <rect x={0} y={760} width={W} height={H - 760} fill="#3A4258" />
          <line x1={0} y1={760} x2={W} y2={760} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* うしろに重なるドライバーの影 (大きく、やわらかく) */}
          <g opacity={0.34 * kage} transform={`translate(0 ${(1 - kage) * 30})`}>
            <SP x={1060} y={620} s={2.4} f={f} phase={5} cloth="#1F2638" silhouette cap />
          </g>
          <JihankiNight x={780} y={220} s={0.92} f={f} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="無人の箱は、いまも裏側の人が支えている" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 216. 神殿の発想、黒板カード再演 (シーン27の再利用。カード扱い=字幕なし) =====
const SceneShindenCard2: React.FC<{ f: number }> = ({ f }) => {
  const text = "人を信じず、仕組みで解決する。";
  const n = Math.floor(seg(f, 10, 66) * text.length + 0.001);
  const sub = easeOut(seg(f, 70, 90));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <WobbleDefs seed={307} />
      <svg width={W} height={H} style={abs}>
        <rect x={150} y={150} width={1620} height={660} rx={22} fill="#3E4A42" stroke={KRP.ink} strokeWidth={10} filter="url(#wobble)" />
        <rect x={180} y={178} width={1560} height={604} rx={16} fill="none" stroke="#D9CBA6" strokeWidth={4} opacity={0.6} filter="url(#wobbleSoft)" />
        <rect x={150} y={810} width={1620} height={18} rx={9} fill="#5A6A60" filter="url(#wobbleSoft)" />
        <rect x={1380} y={792} width={120} height={18} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} filter="url(#wobbleSoft)" />
        {/* かたわらにヘロンの壺 (遺物) */}
        <g filter="url(#wobble)">
          <HolyPot x={300} y={1040} s={0.5} f={f} sepia />
        </g>
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
        — 2000年前の神殿の発想 —
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 217. 仕組み (歯車) と信頼 (ハート) の合わせ技 =====
const SceneGearHeart: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 14, 36));
  const t2 = easeOut(seg(f, 26, 48));
  const beat = 1 + 0.08 * Math.max(0, Math.sin(f / 7));
  return (
    <AbsoluteFill style={{ background: "#2E3A52", fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={308} />
        <g filter="url(#wobbleSoft)">
          <NightRoadBG f={f} />
        </g>
        <g filter="url(#wobble)">
          <JihankiNight x={790} y={210} s={0.9} f={f} />
          {/* 左: 歯車 (仕組み) */}
          <g opacity={t1}>
            <GearIcon cx={400} cy={620} r={120} rot={f * 0.9} />
            <line x1={500} y1={560} x2={780} y2={460} stroke={KRP.cream} strokeWidth={5} strokeDasharray="4 18" opacity={0.7} />
            <rect x={300} y={770} width={200} height={62} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
            <text x={400} y={814} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>仕組み</text>
          </g>
          {/* 右: ハート (信頼) */}
          <g opacity={t2}>
            <g transform={`translate(1520 600) scale(${beat}) translate(-1520 -600)`}>
              <Heart cx={1520} cy={600} s={3.4} />
            </g>
            <line x1={1430} y1={560} x2={1180} y2={460} stroke={KRP.cream} strokeWidth={5} strokeDasharray="4 18" opacity={0.7} />
            <rect x={1420} y={770} width={200} height={62} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
            <text x={1520} y={814} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>信頼</text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="日本の夜道は、仕組みと信頼の合わせ技" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 218. オナーボックス、セピアで再登場 (シーン34のレイアウト+しおりが光る) =====
const SceneHonourSepia: React.FC<{ f: number }> = ({ f }) => {
  const inT = easeOut(seg(f, 10, 34));
  const ribbonT = pop(seg(f, 48, 64));
  return (
    <AbsoluteFill style={{ background: "#CDA87A" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={309} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={700} fill="#CDA87A" />
          {[180, 400, 620].map((yy) => (
            <line key={yy} x1={0} y1={yy} x2={W} y2={yy} stroke={KRP.ink} strokeWidth={3.5} opacity={0.18} />
          ))}
          <ellipse cx={960} cy={420} rx={560} ry={330} fill="#F5E6B8" opacity={0.18 + 0.05 * Math.sin(f / 9)} />
          <rect x={0} y={700} width={W} height={46} rx={0} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={746} width={W} height={H - 746} fill="#7C5B3A" />
          {[300, 760, 1220, 1680].map((lx) => (
            <line key={lx} x1={lx} y1={760} x2={lx} y2={1050} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          ))}
        </g>
        <g filter="url(#wobble)" opacity={inT}>
          <ellipse cx={960} cy={706} rx={240} ry={20} fill={KRP.ink} opacity={0.12} />
          <HonourBox x={960} y={700} s={1.3} />
        </g>
        {/* セピアの回想 */}
        <SepiaWash op={0.26} />
        {/* しおりリボン (伏線マーク) が光る */}
        {ribbonT > 0.01 && (
          <g>
            <circle cx={1660} cy={160} r={90} fill="#F5E6B8" opacity={(0.3 + 0.18 * Math.sin(f / 8)) * ribbonT} />
            <g transform={`translate(1660 112) scale(${ribbonT})`}>
              <path d="M -26 0 L 26 0 L 26 96 L 0 70 L -26 96 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          </g>
        )}
      </svg>
      <LabelPill x={960} y={966} centerX text="17世紀の酒場が、良心にゆだねたもの" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 219. 街ぐるみで引き受けている (夜の街、窓の灯がぽつぽつ) =====
const SceneMachiHikari: React.FC<{ f: number }> = ({ f }) => {
  const builds: Array<[number, number, number, number]> = [
    [0, 420, 300, 460], [320, 540, 260, 340], [700, 470, 280, 410],
    [1060, 560, 240, 320], [1380, 430, 300, 450], [1700, 580, 220, 300],
  ];
  let k = 0;
  return (
    <AbsoluteFill style={{ background: "#2B3047" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={310} />
        <g filter="url(#wobbleSoft)">
          {[[260, 140], [620, 90], [1060, 170], [1500, 110], [1800, 220]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={4} fill={KRP.white} opacity={0.5 + 0.4 * Math.sin(f / 9 + i * 2)} />
          ))}
          <g fill="#20242F" stroke="#171A22" strokeWidth={4}>
            {builds.map(([bx, by, bw, bh], i) => (
              <rect key={i} x={bx} y={by} width={bw} height={bh} />
            ))}
          </g>
          <rect x={0} y={876} width={W} height={204} fill="#232736" />
        </g>
        <g filter="url(#wobble)">
          {/* 窓の灯りがぽつぽつ点く */}
          {builds.map(([bx, by, bw, bh], bi) => {
            const cols = Math.floor(bw / 86);
            const rows = Math.floor(bh / 108);
            return Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const order = (k * 37) % 60;
                k += 1;
                const t = easeOut(seg(f, 8 + order * 1.5, 18 + order * 1.5));
                return t > 0.02 ? (
                  <rect key={`${bi}-${r}-${c}`} x={bx + 28 + c * 86} y={by + 26 + r * 108}
                    width={42} height={54} rx={5} fill="#FFD98E"
                    opacity={t * (0.65 + 0.2 * Math.sin((f + order * 7) / 17))} />
                ) : null;
              }),
            );
          })}
          {[540, 905, 1270].map((mx, i) => (
            <JihankiNight key={i} x={mx - 86} y={580} s={0.48} f={f + i * 9} />
          ))}
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="この国はそれを、街ぐるみで引き受けている" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ========== 第12章 (220〜231): 震災の章。ギャグ・ハンコなし、動きは静かに ==========

// ===== 220. 第12章扉: 日本地図から1台の自販機へ、静かなズーム =====
const SceneCh12Door: React.FC<{ f: number }> = ({ f }) => {
  const [tx, ty] = jmapXY(139.7, 35.68);
  const zs = 1 + 2.2 * easeOut(seg(f, 8, 80));
  const mapOp = 1 - easeOut(seg(f, 55, 82));
  const nightOp = easeOut(seg(f, 55, 85));
  const titleT = easeOut(seg(f, 96, 114));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={311} />
        <g filter="url(#wobbleSoft)" opacity={mapOp}
          transform={`translate(960 540) scale(${zs}) translate(${-tx} ${-ty})`}>
          <JapanMapCard>
            <MapPin x={tx} y={ty} t={1} s={0.8} />
            <JmapLabel lon={139.7} lat={35.68} text="東京" dx={30} dy={-30} />
          </JapanMapCard>
        </g>
        {/* 夜へしずかに転換 */}
        <rect x={0} y={0} width={W} height={H} fill="#2E3A52" opacity={nightOp * 0.96} />
        <g filter="url(#wobble)" opacity={nightOp}>
          <rect x={0} y={840} width={W} height={240} fill="#3A4258" opacity={nightOp} />
          <line x1={0} y1={840} x2={W} y2={840} stroke={KRP.ink} strokeWidth={5} opacity={nightOp} />
          <JihankiNight x={760} y={230} s={0.92} f={f} />
        </g>
      </svg>
      <DoorTitle t={titleT} chapter="第12章" title="いちばん新しい進化" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 221. 進化は売ることだけではなかった (「売る」がふわっと消える) =====
const SceneUruKieru: React.FC<{ f: number }> = ({ f }) => {
  const fade = 1 - easeOut(seg(f, 44, 92));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={312} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <Vend x={560} y={240} s={1.04} f={f} />
          <g opacity={fade} transform={`translate(0 ${-(1 - fade) * 36})`}>
            <text x={1360} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={180} fill={KRP.ink}>
              売る
            </text>
          </g>
          <text x={1360} y={690} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54}
            fill={KRP.grayDark} opacity={easeOut(seg(f, 80, 104))}>
            …だけじゃない？
          </text>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="自販機の進化は、売ることだけではなかった" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 222. 2011年の東日本大震災 (暗い街、信号も消えている。静かに) =====
const Scene2011Yami: React.FC<{ f: number }> = ({ f }) => {
  const dim = easeOut(seg(f, 10, 50));
  return (
    <AbsoluteFill style={{ background: "#1C2130" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={313} />
        <g filter="url(#wobbleSoft)">
          {/* 暗い街並み */}
          <g fill="#141823" stroke="#0F1320" strokeWidth={4}>
            <rect x={0} y={400} width={320} height={480} />
            <rect x={360} y={520} width={280} height={360} />
            <rect x={760} y={450} width={300} height={430} />
            <rect x={1120} y={560} width={250} height={320} />
            <rect x={1440} y={470} width={300} height={410} />
          </g>
          {/* 消えていく窓明かり */}
          {[[80, 480], [200, 600], [440, 580], [840, 540], [1200, 620], [1520, 560], [1620, 680]].map(([wx, wy], i) => (
            <rect key={i} x={wx} y={wy} width={40} height={52} rx={5} fill="#FFD98E"
              opacity={0.5 * (1 - easeOut(seg(f, 14 + i * 5, 26 + i * 5)))} />
          ))}
          <rect x={0} y={880} width={W} height={200} fill="#161A26" />
          <line x1={0} y1={880} x2={W} y2={880} stroke="#0F1320" strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 消えた信号機 */}
          <g>
            <rect x={1780} y={340} width={18} height={540} fill="#2A2F3E" stroke="#0F1320" strokeWidth={4} />
            <rect x={1620} y={300} width={190} height={74} rx={14} fill="#2A2F3E" stroke="#0F1320" strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={1658 + i * 58} cy={337} r={20} fill="#1A1E2A" stroke="#0F1320" strokeWidth={3.5} />
            ))}
          </g>
        </g>
        {/* 画面がぐっと暗く */}
        <rect x={0} y={0} width={W} height={H} fill="#000000" opacity={0.22 * dim} />
      </svg>
      <LabelPill x={960} y={966} centerX text="2011年の、東日本大震災" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 223. 停電の街でぽつんと光る自販機 (人が静かに集まる) =====
const SceneTeidenHikari: React.FC<{ f: number }> = ({ f }) => {
  const x1 = lerp(-160, 560, easeOut(seg(f, 10, 90)));
  const x2 = lerp(2060, 1420, easeOut(seg(f, 24, 104)));
  return (
    <AbsoluteFill style={{ background: "#1C2130" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={314} />
        <g filter="url(#wobbleSoft)">
          <g fill="#141823">
            <rect x={0} y={420} width={300} height={460} />
            <rect x={1500} y={480} width={420} height={400} />
          </g>
          <rect x={0} y={880} width={W} height={200} fill="#161A26" />
          <line x1={0} y1={880} x2={W} y2={880} stroke="#0F1320" strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <JihankiNight x={810} y={270} s={0.9} f={f} />
          {/* 静かに歩み寄る人たち (シルエット) */}
          <SP x={x1} y={905} s={1.05} f={f} phase={1} cloth="#2A3042" silhouette />
          <SP x={x2} y={910} s={0.98} f={f} phase={3} cloth="#262C3E" silhouette flip />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="停電した街で、飲み物を配った自販機が" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 224. 災害救援ベンダー (上品な白タグがそっと付く) =====
const SceneKyuenVendor: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 30, 62));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={315} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <Vend x={620} y={250} s={1.02} f={f} />
          {/* 上品な白タグ (ひも付き) */}
          <g opacity={t} transform={`translate(0 ${(1 - t) * 24})`}>
            <path d="M 1000 320 Q 1090 330 1160 392" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            <g transform={`rotate(${3 + Math.sin(f / 31) * 2} 1160 392)`}>
              <rect x={1140} y={386} width={560} height={118} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={1168} cy={445} r={9} fill="none" stroke={KRP.ink} strokeWidth={4} />
              <text x={1438} y={462} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48}
                fill={KRP.ink} letterSpacing={2}>
                災害救援ベンダー
              </text>
            </g>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="災害救援ベンダー。無料開放できる自販機" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 225. 管理者が専用の鍵を回すと (鍵カチリ→ランプ点灯) =====
const SceneKagiKaiho: React.FC<{ f: number }> = ({ f }) => {
  const rot = 90 * easeOut(seg(f, 32, 56));
  const lampOn = easeOut(seg(f, 58, 70));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={316} />
        <g filter="url(#wobbleSoft)">
          {/* 機体パネルの寄り */}
          <rect x={360} y={140} width={1200} height={740} rx={22} fill="#8C3B2E" stroke={KRP.ink} strokeWidth={9} />
          <rect x={420} y={200} width={1080} height={620} rx={16} fill="#9E4C3A" stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
        </g>
        <g filter="url(#wobble)">
          {/* 鍵穴プレート */}
          <circle cx={880} cy={520} r={84} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
          <g transform={`rotate(${rot} 880 520)`}>
            <rect x={868} y={468} width={24} height={104} rx={10} fill={KRP.ink} />
            {/* 鍵 (持ち手側) */}
            <g>
              <rect x={866} y={386} width={28} height={96} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={880} cy={356} r={44} fill="none" stroke={KRP.brass} strokeWidth={18} />
              <circle cx={880} cy={356} r={44} fill="none" stroke={KRP.ink} strokeWidth={5} />
              <circle cx={880} cy={356} r={26} fill="none" stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
          {/* 手 (そっと添える) */}
          <g transform={`rotate(${rot * 0.9} 880 520)`}>
            <line x1={880} y1={300} x2={880} y2={210} stroke="#56688C" strokeWidth={46} strokeLinecap="round" />
            <circle cx={880} cy={322} r={34} fill="#F2D8B8" stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* ランプ */}
          {lampOn > 0.02 && (
            <circle cx={1280} cy={360} r={46 + 16 * lampOn} fill="#CFE8C2" opacity={0.35 * lampOn} />
          )}
          <circle cx={1280} cy={360} r={34} fill={lampOn > 0.4 ? "#7FB069" : "#6E6256"} stroke={KRP.ink} strokeWidth={6} />
          <text x={1280} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40}
            fill={KRP.white} opacity={lampOn}>
            無料開放
          </text>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="管理者が専用の鍵を使うと、無料で" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 226. 断面: 内蔵バッテリー+手で引くワイヤ (商品が落ちる) =====
const SceneWireBattery: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 120;
  const pull = easeOut(seg(fc, 18, 50));
  const release = 1 - easeOut(seg(fc, 86, 112));
  const hy = 70 * pull * release;
  const dropT = seg(fc, 50, 74);
  const canY = lerp(380, 700, easeOut(dropT));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={317} />
        <g filter="url(#wobbleSoft)">
          <rect x={330} y={130} width={1260} height={800} rx={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {/* 機体の断面 */}
          <rect x={560} y={200} width={560} height={660} rx={16} fill={KRP.cream} stroke={KRP.ink} strokeWidth={8} />
          {/* 商品コラム */}
          {[0, 1].map((r) => (
            <rect key={r} x={640} y={250 + r * 110} width={120} height={92} rx={9}
              fill={[KRP.orange, KRP.blue][r]} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* 落ちる缶 */}
          {dropT > 0 && dropT < 1 && (
            <rect x={640} y={canY} width={120} height={92} rx={9} fill="#7FA86B" stroke={KRP.ink} strokeWidth={4.5} />
          )}
          {dropT >= 1 && release > 0.5 && (
            <rect x={640} y={700} width={120} height={92} rx={9} fill="#7FA86B" stroke={KRP.ink} strokeWidth={4.5} />
          )}
          {/* 取り出しトレイ */}
          <rect x={612} y={796} width={200} height={16} rx={6} fill={KRP.ink} opacity={0.75} />
          {/* バッテリー */}
          <rect x={880} y={660} width={200} height={150} rx={12} fill="#5E6E86" stroke={KRP.ink} strokeWidth={6} />
          <rect x={906} y={640} width={34} height={20} rx={5} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1020} y={640} width={34} height={20} rx={5} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 980 690 L 950 740 L 978 740 L 952 788" fill="none" stroke={KRP.yellow} strokeWidth={9}
            strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(f / 11)} />
          {/* 滑車とワイヤ */}
          <circle cx={1010} cy={280} r={34} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 760 340 Q 980 250 1010 248`} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <line x1={1042} y1={290} x2={1042} y2={420 + hy} stroke={KRP.ink} strokeWidth={5} />
          {/* 取っ手と手 */}
          <rect x={1002} y={420 + hy} width={80} height={30} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
          <circle cx={1042} cy={470 + hy} r={30} fill="#F2D8B8" stroke={KRP.ink} strokeWidth={5} />
          <line x1={1042} y1={498 + hy} x2={1090} y2={600} stroke="#56688C" strokeWidth={40} strokeLinecap="round" />
          {/* 注記 */}
          <text x={1330} y={720} fontFamily={FONT} fontWeight={800} fontSize={40} fill={KRP.ink}>内蔵バッテリー</text>
          <line x1={1086} y1={722} x2={1310} y2={708} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
          <text x={1190} y={372} fontFamily={FONT} fontWeight={800} fontSize={40} fill={KRP.ink}>手で引くワイヤ</text>
          <line x1={1090} y1={400} x2={1180} y2={380} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="内蔵バッテリーや、手でワイヤを引く仕掛けで" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 227. 街角の箱が小さな備蓄倉庫に (棚が透けて見える) =====
const SceneBichikuSoko: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 26, 60));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={318} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* 倉庫の輪郭 (点線で重なる) */}
          <path d="M 480 420 L 960 220 L 1440 420 L 1440 880 L 480 880 Z"
            fill="none" stroke={KRP.ink} strokeWidth={7} strokeDasharray="22 18" opacity={0.55 * t} />
          <line x1={480} y1={420} x2={1440} y2={420} stroke={KRP.ink} strokeWidth={5}
            strokeDasharray="22 18" opacity={0.35 * t} />
        </g>
        <g filter="url(#wobble)">
          {/* 透ける自販機: 中は備えの棚 */}
          <g opacity={t}>
            <rect x={756} y={332} width={408} height={520} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <line x1={756} y1={462 + r * 130} x2={1164} y2={462 + r * 130} stroke={KRP.ink} strokeWidth={5} />
                {[0, 1, 2, 3].map((c) => (
                  <rect key={c} x={780 + c * 96} y={388 + r * 130} width={52} height={68} rx={8}
                    fill={[KRP.blue, KRP.orange, "#7FA86B", KRP.blue][c]} stroke={KRP.ink} strokeWidth={4} />
                ))}
              </g>
            ))}
          </g>
          <Vend x={740} y={300} s={1.22} f={f} faceOp={1 - 0.74 * t} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="街角の箱が、小さな備蓄倉庫になる" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 228. 震災をきっかけに全国へ (印がぽつぽつ増える) =====
const SceneKyuenHirogaru: React.FC<{ f: number }> = ({ f }) => {
  const marks: Array<[number, number]> = [
    [140.87, 38.27], [139.7, 35.68], [141.15, 39.7], [139.04, 37.9], [136.9, 35.17],
    [135.5, 34.69], [141.35, 43.06], [132.46, 34.4], [130.4, 33.59], [133.53, 33.56],
    [136.65, 36.56], [138.38, 34.98],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={319} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {marks.map(([lon, lat], i) => {
              const [x, y] = jmapXY(lon, lat);
              const t = easeOut(seg(f, 10 + i * 7, 24 + i * 7));
              return t > 0.02 ? (
                <g key={i} transform={`translate(${x} ${y}) scale(${t})`}>
                  <rect x={-22} y={-22} width={44} height={44} rx={10} fill={KRP.white} stroke={KRP.blueDeep} strokeWidth={5} />
                  {/* しずくマーク (飲み水の備え) */}
                  <path d="M 0 -12 C 8 -2 12 4 12 9 A 12 12 0 1 1 -12 9 C -12 4 -8 -2 0 -12 Z"
                    fill={KRP.blueDeep} />
                </g>
              ) : null;
            })}
          </JapanMapCard>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="震災をきっかけに、全国へ広がりました" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 229. AED搭載機や防犯カメラ機まで (静かにポン、カメラはゆっくり) =====
const SceneAedCamera: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 22, 46));
  const t2 = easeOut(seg(f, 44, 68));
  const look = Math.sin(f / 37) * 16;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={320} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <Vend x={700} y={260} s={1.0} f={f} />
          {/* AEDボックス */}
          <g opacity={t1} transform={`translate(0 ${(1 - t1) * 20})`}>
            <rect x={470} y={430} width={210} height={230} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <Heart cx={575} cy={520} s={1.5} />
            <text x={575} y={624} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.red}>
              AED
            </text>
            <line x1={680} y1={540} x2={706} y2={540} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 防犯カメラ */}
          <g opacity={t2}>
            <rect x={858} y={190} width={16} height={74} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            <g transform={`rotate(${look} 884 176)`}>
              <rect x={826} y={146} width={120} height={60} rx={12} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={930} cy={176} r={18} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={936} cy={170} r={5} fill={KRP.white} opacity={0.8} />
            </g>
          </g>
          <text x={1340} y={450} fontFamily={FONT} fontWeight={800} fontSize={44} fill={KRP.ink} opacity={t1}>
            AEDを載せた機種
          </text>
          <text x={1340} y={560} fontFamily={FONT} fontWeight={800} fontSize={44} fill={KRP.ink} opacity={t2}>
            防犯カメラの機種
          </text>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="AEDを載せた機種や、防犯カメラの機種まで" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 230. 売る箱から、街を支える箱へ (街がそっと乗る) =====
const SceneMachiSasaeru: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 18, 70));
  const plateY = lerp(80, 300, t);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={321} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill={KRP.floor} />
          <line x1={0} y1={900} x2={W} y2={900} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 柱になる自販機 */}
          <Vend x={790} y={400} s={0.82} f={f} />
          {/* 街の台 (そっと乗る) */}
          <g transform={`translate(0 ${plateY - 300})`}>
            <rect x={420} y={300} width={1080} height={38} rx={12} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
            {/* ミニ街並み */}
            <g>
              <rect x={520} y={190} width={130} height={110} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
              <rect x={700} y={150} width={110} height={150} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
              <path d="M 700 150 L 755 110 L 810 150 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
              <rect x={860} y={210} width={150} height={90} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
              <rect x={1060} y={160} width={120} height={140} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
              <rect x={1230} y={200} width={160} height={100} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
              {/* 木 */}
              <circle cx={1450} cy={230} r={44} fill="#7FA86B" stroke={KRP.ink} strokeWidth={5} />
              <rect x={1442} y={262} width={16} height={38} fill="#8F6B44" stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="売る箱から、街を支える箱へ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 231. 黒板カード「売らないこと」 (カード扱い=字幕なし) =====
const SceneUranaiCard: React.FC<{ f: number }> = ({ f }) => {
  const text = "売らないこと。";
  const n = Math.floor(seg(f, 10, 54) * text.length + 0.001);
  const sub = easeOut(seg(f, 64, 86));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <WobbleDefs seed={322} />
      <svg width={W} height={H} style={abs}>
        <rect x={150} y={150} width={1620} height={660} rx={22} fill="#3E4A42" stroke={KRP.ink} strokeWidth={10} filter="url(#wobble)" />
        <rect x={180} y={178} width={1560} height={604} rx={16} fill="none" stroke="#D9CBA6" strokeWidth={4} opacity={0.6} filter="url(#wobbleSoft)" />
        <rect x={150} y={810} width={1620} height={18} rx={9} fill="#5A6A60" filter="url(#wobbleSoft)" />
        <rect x={1380} y={792} width={120} height={18} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} filter="url(#wobbleSoft)" />
      </svg>
      <div style={{
        position: "absolute", top: 380, left: 0, right: 0, textAlign: "center",
        fontSize: 96, fontWeight: 900, color: "#F5EFDC", letterSpacing: 6,
      }}>
        {text.slice(0, n)}
        <span style={{ opacity: Math.sin(f / 4) > 0 ? 0.9 : 0 }}>|</span>
      </div>
      <div style={{
        position: "absolute", top: 640, left: 0, right: 0, textAlign: "center",
        fontSize: 44, fontWeight: 800, color: "#C9D4C2", opacity: sub,
      }}>
        — いちばん新しい仕事 —
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ========== 結び (232〜238) ==========

// ===== 232. 2000年前の壺、セピアで (シーン8のレイアウト+しずくポチャン) =====
const ScenePotSepia: React.FC<{ f: number }> = ({ f }) => {
  const T = 80;
  const t = (f % T) / T;
  const dropT = seg(t, 0.1, 0.45);
  const dy = 692 + 56 * dropT * dropT;
  const rippleT = seg(t, 0.45, 0.95);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={323} />
        <g filter="url(#wobbleSoft)">
          <TempleBG y={790} mist={0.4} f={f} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const a = -90 + (i - 3) * 22 + Math.sin(f / 23) * 3;
            return (
              <line key={i}
                x1={960 + Math.cos((a * Math.PI) / 180) * 250} y1={430 + Math.sin((a * Math.PI) / 180) * 250}
                x2={960 + Math.cos((a * Math.PI) / 180) * 380} y2={430 + Math.sin((a * Math.PI) / 180) * 380}
                stroke={KRP.yellow} strokeWidth={10} strokeLinecap="round" opacity={0.45} />
            );
          })}
        </g>
        <g filter="url(#wobble)">
          <HolyPot x={960} y={790} s={0.95} f={f} sepia />
          <ellipse cx={1086} cy={764} rx={120} ry={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          {dropT > 0 && dropT < 1 && (
            <path d={`M 1086 ${dy} q -10 14 0 24 q 10 -10 0 -24`} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
          )}
          {rippleT > 0 && (
            <g fill="none" stroke={KRP.blueDeep} opacity={1 - rippleT}>
              <ellipse cx={1086} cy={764} rx={30 + 80 * rippleT} ry={6 + 15 * rippleT} strokeWidth={5} />
              <ellipse cx={1086} cy={764} rx={16 + 54 * rippleT} ry={4 + 10 * rippleT} strokeWidth={4} />
            </g>
          )}
        </g>
        {/* セピアの回想 */}
        <SepiaWash op={0.24} />
      </svg>
      <LabelPill x={960} y={966} centerX text="2000年前、神様の水を売っていた箱は" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 233. 壺→災害ベンダーへ画中変化 (円環の完成。水を手渡す) =====
const ScenePotToMizu: React.FC<{ f: number }> = ({ f }) => {
  const xf = easeOut(seg(f, 38, 86));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={324} />
        {/* 前半: セピアの壺 */}
        <g opacity={1 - xf}>
          <g filter="url(#wobbleSoft)">
            <TempleBG y={790} mist={0.3} f={f} />
          </g>
          <g filter="url(#wobble)">
            <HolyPot x={960} y={790} s={0.95} f={f} sepia />
          </g>
          <SepiaWash op={0.24} />
        </g>
        {/* 後半: 災害の日の自販機 (水を手渡す) */}
        <rect x={0} y={0} width={W} height={H} fill="#1C2130" opacity={xf * 0.96} />
        <g opacity={xf}>
          <g filter="url(#wobbleSoft)">
            <rect x={0} y={880} width={W} height={200} fill="#161A26" />
            <line x1={0} y1={880} x2={W} y2={880} stroke="#0F1320" strokeWidth={5} />
          </g>
          <g filter="url(#wobble)">
            <JihankiNight x={700} y={260} s={0.88} f={f} />
            {/* 手渡す人 (右腕は別描き) と受け取る人 */}
            <SP x={1230} y={905} s={1.1} f={f} phase={1} cloth="#56688C" clothDark="#46567A" cap hideArm="right" gaze={[6, -2]} />
            <SpArm sx={1292} sy={742} angle={-96} len={100} cloth="#56688C"
              hold={<rect x={-16} y={-30} width={32} height={58} rx={9} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />} />
            <SP x={1560} y={910} s={1.04} f={f} phase={3} cloth="#6E6256" clothDark="#5A5248" flip hideArm="right" gaze={[-6, -2]} />
            <SpArm sx={1498} sy={746} angle={92} len={96} cloth="#6E6256" />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="2000年後、災害の日に、ただで水を配る箱に" />
      <J2Badge />
      <Atmosphere f={f} dark={xf > 0.5} />
    </AbsoluteFill>
  );
};

// ----- 走馬灯用のミニ機たち (足元原点。各章の代表機の色・形に合わせた簡略画) -----
const MiniStampMachine: React.FC = () => (
  <g>
    <rect x={-55} y={-230} width={110} height={230} rx={10} fill="#4E6E58" stroke={KRP.ink} strokeWidth={5} />
    <rect x={-38} y={-200} width={76} height={56} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-20} y={-128} width={40} height={10} rx={4} fill={KRP.ink} />
    <rect x={-30} y={-66} width={60} height={26} rx={5} fill={KRP.ink} opacity={0.75} />
    <circle cx={0} cy={-244} r={12} fill="#4E6E58" stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const MiniWoodMachine: React.FC = () => (
  <g>
    <rect x={-70} y={-210} width={140} height={210} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    {[-40, 0, 40].map((lx) => (
      <line key={lx} x1={lx} y1={-200} x2={lx} y2={-10} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
    ))}
    <rect x={-52} y={-186} width={104} height={44} rx={5} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-44 + i * 32} y={-122} width={24} height={8} rx={3} fill={KRP.ink} />
    ))}
    <rect x={-34} y={-70} width={68} height={28} rx={5} fill={KRP.ink} opacity={0.7} />
  </g>
);
const MiniGlicoMachine: React.FC = () => (
  <g>
    <rect x={-60} y={-240} width={120} height={240} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
    {/* 小さな映画スクリーン */}
    <rect x={-42} y={-220} width={84} height={58} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-34} y={-212} width={68} height={42} fill={KRP.blueSoft} opacity={0.7} />
    <rect x={-18} y={-140} width={36} height={9} rx={4} fill={KRP.ink} />
    <rect x={-40} y={-100} width={80} height={40} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const MiniFountainMachine: React.FC = () => (
  <g>
    <path d="M -60 0 L 60 0 L 44 -120 L -44 -120 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-70} y={-140} width={140} height={22} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
    {/* ガラスドームの噴水 */}
    <path d="M -56 -140 A 56 62 0 0 1 56 -140 Z" fill={KRP.blueSoft} opacity={0.6} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -28 -146 Q 0 -196 28 -146" fill="none" stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" />
    <path d="M -14 -146 Q 0 -180 14 -146" fill="none" stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
  </g>
);
const MiniCanMachine: React.FC = () => (
  <g>
    <rect x={-65} y={-215} width={130} height={215} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-48} y={-192} width={96} height={86} rx={7} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1].map((r) =>
      [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={-40 + c * 28} y={-184 + r * 40} width={20} height={32} rx={4}
          fill={[KRP.orange, KRP.blue, "#7FA86B"][c]} stroke={KRP.ink} strokeWidth={2.5} />
      )),
    )}
    <rect x={30} y={-92} width={22} height={8} rx={3} fill={KRP.ink} />
    <rect x={-44} y={-62} width={88} height={30} rx={6} fill={KRP.ink} opacity={0.7} />
  </g>
);
const MiniHotMachine: React.FC = () => (
  <g>
    <rect x={-62} y={-220} width={124} height={220} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-46} y={-196} width={92} height={72} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    {/* あたたかい/つめたいの帯 */}
    <rect x={-46} y={-112} width={46} height={18} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    <rect x={0} y={-112} width={46} height={18} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-40} y={-66} width={80} height={28} rx={5} fill={KRP.ink} opacity={0.7} />
  </g>
);
const MiniGachaMachine: React.FC = () => (
  <g>
    <rect x={-46} y={-116} width={92} height={116} rx={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={-80} r={16} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-5} y={-92} width={10} height={24} rx={4} fill={KRP.ink} />
    <circle cx={0} cy={-168} r={56} fill="#EDF6FA" opacity={0.85} stroke={KRP.ink} strokeWidth={4.5} />
    {[[-20, -180, KRP.orange], [16, -164, KRP.blue], [-6, -148, "#7FA86B"], [22, -192, KRP.yellow]].map(([cx, cy, col], i) => (
      <circle key={i} cx={cx as number} cy={cy as number} r={13} fill={col as string} stroke={KRP.ink} strokeWidth={3} />
    ))}
  </g>
);
const MiniModernMachine: React.FC = () => (
  <g>
    <rect x={-62} y={-230} width={124} height={230} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-46} y={-206} width={92} height={92} rx={7} fill="#FFF3C4" stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-38 + i * 28} y={-192} width={20} height={38} rx={4}
        fill={[KRP.orange, KRP.blue, "#7FA86B"][i]} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    <rect x={30} y={-98} width={22} height={8} rx={3} fill={KRP.ink} />
    <rect x={-44} y={-64} width={88} height={30} rx={6} fill={KRP.ink} opacity={0.7} />
  </g>
);

// ===== 234. 走馬灯: 各章の代表機が点線の旅路で一列に (横移動カメラ) =====
const SceneSomatoTabi: React.FC<{ f: number }> = ({ f }) => {
  const tx = -3400 * easeOut(seg(f, 10, 132));
  const stops = [
    { x: 300, el: <HolyPot x={0} y={0} s={0.52} f={f} /> },
    { x: 820, el: <HonourBox x={0} y={0} s={0.62} /> },
    { x: 1340, el: <MiniStampMachine /> },
    { x: 1860, el: <MiniWoodMachine /> },
    { x: 2380, el: <MiniGlicoMachine /> },
    { x: 2900, el: <MiniFountainMachine /> },
    { x: 3420, el: <MiniCanMachine /> },
    { x: 3940, el: <MiniHotMachine /> },
    { x: 4460, el: <MiniGachaMachine /> },
    { x: 4980, el: <MiniModernMachine /> },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={325} />
        <g transform={`translate(${tx} 0)`}>
          <g filter="url(#wobbleSoft)">
            <rect x={-100} y={760} width={5500} height={320} fill={KRP.floor} />
            <line x1={-100} y1={760} x2={5400} y2={760} stroke={KRP.ink} strokeWidth={5} />
            {/* 点線の旅路 */}
            <path d={stops.map((s2, i) => `${i === 0 ? "M" : "L"} ${s2.x} 640`).join(" ")}
              fill="none" stroke={KRP.red} strokeWidth={7} strokeDasharray="2 24" strokeLinecap="round" />
          </g>
          <g filter="url(#wobble)">
            {stops.map((s2, i) => (
              <g key={i} transform={`translate(${s2.x} 740)`}>
                <ellipse cx={0} cy={6} rx={110} ry={16} fill={KRP.ink} opacity={0.1} />
                {s2.el}
                <circle cx={0} cy={-330} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4}
                  opacity={0.5 + 0.4 * Math.sin((f + i * 17) / 13)} />
              </g>
            ))}
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="神殿のシーソーから…そして夜道へ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 235. 2000年ぶんの発明を抱えて (夜道+中に歴代部品が透ける) =====
const SceneHatsumeiToushi: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 28, 66));
  return (
    <AbsoluteFill style={{ background: "#2E3A52" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={326} />
        <g filter="url(#wobbleSoft)">
          <NightRoadBG f={f} />
        </g>
        <g filter="url(#wobble)">
          <JihankiNight x={1150} y={190} s={0.92} f={f} />
          {/* 中にうっすら透ける歴代の仕掛け */}
          <g opacity={0.3 * t} stroke="#F7EFC9" fill="none">
            <GearIcon cx={1250} cy={560} r={52} rot={f * 0.6} fill="none" />
            {/* コインレール */}
            <path d="M 1230 420 L 1330 470 L 1420 450" strokeWidth={5} strokeDasharray="8 10" />
            <circle cx={1260} cy={428} r={18} strokeWidth={4} />
            {/* ワイヤとシーソー */}
            <line x1={1380} y1={520} x2={1380} y2={680} strokeWidth={4} strokeDasharray="8 10" />
            <line x1={1310} y1={700} x2={1440} y2={672} strokeWidth={5} />
            {/* コイル (電気の目) */}
            <path d="M 1240 640 q 12 -18 24 0 q 12 18 24 0 q 12 -18 24 0" strokeWidth={4} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="コイン1枚で動く箱は、2000年ぶんの発明を抱えて" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 236. ふと足を止める (walkerが立ち止まり、見上げる) =====
const SceneTachidomaru: React.FC<{ f: number }> = ({ f }) => {
  const walkT = easeOut(seg(f, 0, 58));
  const wx = lerp(260, 900, walkT);
  const lookUp = easeOut(seg(f, 72, 92));
  return (
    <AbsoluteFill style={{ background: "#2E3A52" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={327} />
        <g filter="url(#wobbleSoft)">
          <NightRoadBG f={f} />
        </g>
        <g filter="url(#wobble)">
          <JihankiNight x={1150} y={190} s={0.92} f={f} />
          <SP x={wx} y={880} s={1.12} f={f} phase={2} cloth="#55618A" clothDark="#424C6E"
            gaze={[6, -2 - 4 * lookUp]} lean={-4 * lookUp} />
        </g>
      </svg>
      <LabelPill x={960} y={966} centerX text="明日、自販機の前を通ったら、立ち止まって" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 237. 最古の発明の子孫 (赤ハンコ「2000年もの」ドン) =====
const Scene2000MonoStamp: React.FC<{ f: number }> = ({ f }) => {
  const st = f >= 40;
  const shake = f >= 40 && f < 48 ? Math.sin(f * 3) * 5 : 0;
  return (
    <AbsoluteFill style={{ background: "#2E3A52" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={328} />
        <g filter="url(#wobbleSoft)">
          <NightRoadBG f={f} />
        </g>
        <g filter="url(#wobble)" transform={`translate(${shake} 0)`}>
          <JihankiNight x={1150} y={190} s={0.92} f={f} />
        </g>
      </svg>
      {st && <Stamp x={520} y={300} text="2000年もの" size={64} />}
      <LabelPill x={960} y={966} centerX text="いまも現役で働いている、最古の発明の子孫" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 238. ありがとう (夜道の引き+月。光がゆっくり明滅) =====
const SceneArigatoYomichi: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#2E3A52" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={329} />
      <g filter="url(#wobbleSoft)">
        <NightRoadBG f={f} />
        {/* 月のまわりの淡い暈 */}
        <circle cx={1560} cy={170} r={110} fill="#F5E6B8" opacity={0.1 + 0.04 * Math.sin(f / 31)} />
      </g>
      <g filter="url(#wobble)">
        <JihankiNight x={1150} y={190} s={0.92} f={f} />
        {/* 窓あかりのゆっくりした明滅 (余韻) */}
        <ellipse cx={1288} cy={328} rx={276} ry={193} fill="#FFF3C4"
          opacity={0.1 + 0.1 * Math.sin(f / 26)} />
      </g>
    </svg>
    <LabelPill x={960} y={966} centerX text="最後までご覧いただき、ありがとうございました" />
    <J2Badge />
    <Atmosphere f={f} dark />
  </AbsoluteFill>
);

export const j2Ch11to12Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    case "j2_ch11_door": return <SceneCh11Door f={f} />;
    case "j2_391_count": return <Scene391Count f={f} />;
    case "j2_drink_share": return <SceneDrinkShare f={f} />;
    case "j2_30nin_1dai": return <Scene30Per1 f={f} />;
    case "j2_sekai_top": return <SceneSekaiTop f={f} />;
    case "j2_kazu_janai": return <SceneKazuJanai f={f} />;
    case "j2_yomichi_futatabi": return <SceneYomichiFutatabi f={f} />;
    case "j2_mujin_toushi": return <SceneMujinToushi f={f} />;
    case "j2_sekai_batsu": return <SceneSekaiBatsu f={f} />;
    case "j2_kowareru_kage": return <SceneKowareruKage f={f} />;
    case "j2_kabe_grille": return <SceneKabeGrille f={f} />;
    case "j2_okunai_sepia": return <SceneOkunaiSepia f={f} />;
    case "j2_sasae_hashira": return <SceneSasaeHashira f={f} />;
    case "j2_ekimae_nami": return <SceneEkimaeNami f={f} />;
    case "j2_chubo_sepia": return <SceneChuboSepia f={f} />;
    case "j2_hoju_driver": return <SceneHojuDriver f={f} />;
    case "j2_ura_no_hito": return <SceneUraNoHito f={f} />;
    case "j2_shinden_card2": return <SceneShindenCard2 f={f} />;
    case "j2_gear_heart": return <SceneGearHeart f={f} />;
    case "j2_honour_sepia": return <SceneHonourSepia f={f} />;
    case "j2_machi_hikari": return <SceneMachiHikari f={f} />;
    case "j2_ch12_door": return <SceneCh12Door f={f} />;
    case "j2_uru_kieru": return <SceneUruKieru f={f} />;
    case "j2_2011_yami": return <Scene2011Yami f={f} />;
    case "j2_teiden_hikari": return <SceneTeidenHikari f={f} />;
    case "j2_kyuen_vendor": return <SceneKyuenVendor f={f} />;
    case "j2_kagi_kaiho": return <SceneKagiKaiho f={f} />;
    case "j2_wire_battery": return <SceneWireBattery f={f} />;
    case "j2_bichiku_soko": return <SceneBichikuSoko f={f} />;
    case "j2_kyuen_hirogaru": return <SceneKyuenHirogaru f={f} />;
    case "j2_aed_camera": return <SceneAedCamera f={f} />;
    case "j2_machi_sasaeru": return <SceneMachiSasaeru f={f} />;
    case "j2_uranai_card": return <SceneUranaiCard f={f} />;
    case "j2_pot_sepia": return <ScenePotSepia f={f} />;
    case "j2_pot_to_mizu": return <ScenePotToMizu f={f} />;
    case "j2_somato_tabi": return <SceneSomatoTabi f={f} />;
    case "j2_hatsumei_toushi": return <SceneHatsumeiToushi f={f} />;
    case "j2_tachidomaru": return <SceneTachidomaru f={f} />;
    case "j2_2000mono_stamp": return <Scene2000MonoStamp f={f} />;
    case "j2_arigato_yomichi": return <SceneArigatoYomichi f={f} />;
    default: return null;
  }
};

export const J2_CH11TO12_MOTIFS: string[] = [
  "j2_ch11_door",        // 199
  "j2_391_count",        // 200
  "j2_drink_share",      // 201
  "j2_30nin_1dai",       // 202
  "j2_sekai_top",        // 203
  "j2_kazu_janai",       // 204
  "j2_yomichi_futatabi", // 205
  "j2_mujin_toushi",     // 206
  "j2_sekai_batsu",      // 207
  "j2_kowareru_kage",    // 208
  "j2_kabe_grille",      // 209
  "j2_okunai_sepia",     // 210
  "j2_sasae_hashira",    // 211
  "j2_ekimae_nami",      // 212
  "j2_chubo_sepia",      // 213
  "j2_hoju_driver",      // 214
  "j2_ura_no_hito",      // 215
  "j2_shinden_card2",    // 216
  "j2_gear_heart",       // 217
  "j2_honour_sepia",     // 218
  "j2_machi_hikari",     // 219
  "j2_ch12_door",        // 220
  "j2_uru_kieru",        // 221
  "j2_2011_yami",        // 222
  "j2_teiden_hikari",    // 223
  "j2_kyuen_vendor",     // 224
  "j2_kagi_kaiho",       // 225
  "j2_wire_battery",     // 226
  "j2_bichiku_soko",     // 227
  "j2_kyuen_hirogaru",   // 228
  "j2_aed_camera",       // 229
  "j2_machi_sasaeru",    // 230
  "j2_uranai_card",      // 231
  "j2_pot_sepia",        // 232
  "j2_pot_to_mizu",      // 233
  "j2_somato_tabi",      // 234
  "j2_hatsumei_toushi",  // 235
  "j2_tachidomaru",      // 236
  "j2_2000mono_stamp",   // 237
  "j2_arigato_yomichi",  // 238
];
