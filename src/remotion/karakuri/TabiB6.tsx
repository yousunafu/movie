// 「旅とお土産の歴史」: ブロック6 = 第10章「発明された『伝統』」(交通革命・帰省・藪入り・GW)。
// ※ 再生順では B4 と B5 の「間」に入る挿入章 (TabiIndex.tsx 参照)。番号は「6番目に作ったファイル」の意味。
// 担当範囲: 台本 docs/tabi-miyage-script-v1.txt の 176〜195行目 (文#175〜#194・20文)。
// motif 名は必ず tb6_ で始める。WobbleDefs の seed はこのファイルでは 900〜999 を使う。
// このファイルを編集してよいのはブロック6担当だけ (共有部品は TabiShared/TabiKits/TabiTravel から import)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, WobbleDefs, Atmosphere, Stamp, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, TBadge, ChapterDoor } from "./TabiShared";
import { TKP, Shukuba, EdoTraveler, Ekiben, PaperBag } from "./TabiKits";
import { JetPlane, makeWmap, TABI_JMAP, WorldMapCard } from "./TabiTravel";
import { MapPin, DashArc } from "./Jihanki2000Scenes";

// ===== 小ヘルパー =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== 画面の額縁 (TabiB4 と同じ流儀) =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string; capX?: number; capY?: number;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, capX = 960, capY = 170, over, children }) => (
  <AbsoluteFill style={{ background: KRP.cream, fontFamily: FONT }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={capX} y={capY} text={caption} centerX size={36} />}
    <TBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 白札 (ポンと出る名札。TabiB4 と同じ流儀) =====
const TagPlate: React.FC<{
  x: number; y: number; text: string; t?: number; size?: number; color?: string;
}> = ({ x, y, text, t = 1, size = 34, color = KRP.ink }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  const w = text.length * size + 44;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <rect x={-w / 2} y={-size * 0.8 - 14} width={w} height={size * 1.6 + 16} rx={10}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={0} y={size * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ===== 放射バースト (登場の気合い) =====
const Burst: React.FC<{ x: number; y: number; t: number; r?: number; color?: string }> = ({
  x, y, t, r = 170, color = KRP.orange,
}) => {
  if (t <= 0 || t >= 1) return null;
  const e = easeOut(clamp01(t));
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - e}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r1 = r * (0.45 + e * 0.55);
        const r2 = r1 + r * 0.3 * (1 - e);
        return (
          <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
            stroke={color} strokeWidth={8} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

// ===== キラキラ (4角星) =====
const SparkleS: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({
  x, y, s = 1, opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M 0 -26 Q 5 -5 26 0 Q 5 5 0 26 Q -5 5 -26 0 Q -5 -5 0 -26 Z"
      fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// ===== 右向き矢印 (伸びて三角で止まる) =====
const ArrowR: React.FC<{ x1: number; x2: number; y: number; t?: number; color?: string; w?: number }> = ({
  x1, x2, y, t = 1, color = KRP.ink, w = 10,
}) => {
  if (t <= 0) return null;
  const e = easeOut(clamp01(t));
  const xe = lerp(x1, x2, e);
  return (
    <g>
      <line x1={x1} y1={y} x2={xe} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${xe + 28} ${y} L ${xe - 4} ${y - 22} L ${xe - 4} ${y + 22} Z`} fill={color} />
    </g>
  );
};

// =====================================================================
// 新造部品 (この章の主役たち)
// =====================================================================

// ===== 0系新幹線 (団子鼻・青帯)。原点=レール上面・先頭は右向き。cars=後続車両の数 =====
const Shinkansen0: React.FC<{
  x: number; y: number; s?: number; f?: number; cars?: number; run?: boolean;
}> = ({ x, y, s = 1, f = 0, cars = 1, run = true }) => {
  const wheel = run ? (f * 10) % 360 : 0;
  const wheelAt = (cx: number, key: string) => (
    <g key={key} transform={`translate(${cx} -14)`}>
      <circle r={14} fill={KRP.ink} />
      <circle r={6} fill={KRP.silver} />
      <line x1={-5} y1={0} x2={5} y2={0} transform={`rotate(${wheel})`} stroke={KRP.ink} strokeWidth={2.5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 後続車両 */}
      {Array.from({ length: cars }, (_, i) => {
        const x0 = -80 - (i + 1) * 462;
        return (
          <g key={i}>
            <rect x={x0} y={-150} width={450} height={126} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {/* パンタグラフ (最初の後続車両のみ) */}
            {i === 0 && (
              <g stroke={KRP.ink} fill="none">
                <path d={`M ${x0 + 170} -150 L ${x0 + 218} -188 L ${x0 + 266} -150`} strokeWidth={5} />
                <line x1={x0 + 192} y1={-190} x2={x0 + 244} y2={-190} strokeWidth={7} />
              </g>
            )}
            <rect x={x0 + 14} y={-118} width={422} height={30} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3.5} />
            {Array.from({ length: 7 }, (_, wn) => (
              <rect key={wn} x={x0 + 40 + wn * 56} y={-112} width={30} height={18} rx={5}
                fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
            <rect x={x0} y={-38} width={450} height={14} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
            {wheelAt(x0 + 66, `a${i}`)}{wheelAt(x0 + 106, `b${i}`)}
            {wheelAt(x0 + 344, `c${i}`)}{wheelAt(x0 + 384, `d${i}`)}
          </g>
        );
      })}
      {/* 先頭車: 丸みのある流線形 */}
      <path d="M -68 -24 Q -80 -24 -80 -38 L -80 -136 Q -80 -150 -66 -150 L 290 -150 Q 418 -146 486 -102 Q 528 -74 536 -48 Q 540 -30 518 -26 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
      {/* 運転席の窓 */}
      <path d="M 352 -144 Q 420 -138 462 -106 Q 436 -96 398 -102 L 352 -108 Z"
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      {/* 青帯 (窓まわり) + 客窓 */}
      <rect x={-70} y={-118} width={372} height={30} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3.5} />
      {Array.from({ length: 6 }, (_, wn) => (
        <rect key={wn} x={-44 + wn * 56} y={-112} width={30} height={18} rx={5}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} />
      ))}
      {/* 青帯 (鼻先へ流れる) */}
      <path d="M 302 -118 Q 420 -110 498 -56 L 486 -40 Q 414 -88 302 -88 Z"
        fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
      {/* スカート */}
      <path d="M -80 -38 L 500 -38 Q 522 -34 512 -22 L -80 -24 Z"
        fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
      {/* 団子鼻 (丸いライトカバー) */}
      <circle cx={512} cy={-62} r={21} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={512} cy={-62} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      {wheelAt(-28, "e")}{wheelAt(12, "g")}{wheelAt(360, "h")}{wheelAt(400, "i")}
    </g>
  );
};

// ===== マイカー (横向きセダン・右向き)。原点=地面中央。t でポンと登場 =====
const FamilyCar: React.FC<{
  x: number; y: number; s?: number; f?: number; color?: string; t?: number;
}> = ({ x, y, s = 1, f = 0, color = KRP.red, t = 1 }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  const wheel = (f * 9) % 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p})`}>
      {/* キャビン */}
      <path d="M -88 -72 L -60 -122 L 60 -122 L 94 -72 Z" fill={color} stroke={KRP.ink} strokeWidth={5.5} />
      {/* ボディ */}
      <rect x={-152} y={-78} width={304} height={58} rx={16} fill={color} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 窓 */}
      <path d="M -54 -82 L -38 -112 L -6 -112 L -6 -82 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 8 -82 L 8 -112 L 42 -112 L 66 -82 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      {/* ライト */}
      <rect x={140} y={-68} width={14} height={18} rx={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-154} y={-66} width={12} height={14} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      <line x1={-150} y1={-34} x2={150} y2={-34} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      {/* 車輪 */}
      {[-94, 94].map((cx, i) => (
        <g key={i} transform={`translate(${cx} -18)`}>
          <circle r={24} fill={KRP.ink} />
          <circle r={11} fill={KRP.silver} />
          <line x1={-9} y1={0} x2={9} y2={0} transform={`rotate(${wheel})`} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
    </g>
  );
};

// ===== ボストンバッグ (帰省の相棒)。原点=中央 =====
const BostonBag: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({
  x, y, s = 1, color = KRP.orange,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-52} y={-34} width={104} height={64} rx={26} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -20 -34 Q -20 -58 0 -58 Q 20 -58 20 -34" fill="none" stroke={KRP.ink} strokeWidth={5} />
    <line x1={-50} y1={-4} x2={50} y2={-4} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
  </g>
);

// ===== 江戸の奉公人 (着物 + ちょんまげ)。Person着せ替え方式 =====
const EdoBoy: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number]; cloth?: string;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile", gaze, cloth = TKP.yukata }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze}
        cloth={cloth} clothDark={KRP.white} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 着物の襟 + 帯 */}
        <path d="M -24 -160 L 10 -112 L 34 -160" fill="none" stroke={KRP.white} strokeWidth={7} />
        <rect x={-58} y={-104} width={116} height={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {/* 髷 (ちょんまげ) */}
        <path d="M -56 -252 Q 0 -278 56 -252 Q 28 -266 0 -266 Q -28 -266 -56 -252 Z" fill={KRP.ink} />
        <rect x={-7} y={-300} width={14} height={34} rx={7} fill={KRP.ink} transform="rotate(-18 0 -284)" />
      </g>
    </g>
  );
};

// ===== 商家の主人 (羽織 + ちょんまげ)。御師とは色違いの茶羽織 =====
const MasterPerson: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number];
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile", gaze }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze}
        cloth="#7A5C50" clothDark={KRP.gray} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 羽織 (肩線 + 前が開いて中の着物が見える) */}
        <path d="M -58 -156 L -70 -64 L -46 -60 L -30 -150 Z" fill="#7A5C50" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 58 -156 L 70 -64 L 46 -60 L 30 -150 Z" fill="#7A5C50" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -22 -158 L 4 -108 L 28 -158" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -10 -132 Q 4 -124 18 -132" fill="none" stroke={KRP.white} strokeWidth={4.5} />
        {/* 髷 (ちょんまげ) */}
        <path d="M -56 -252 Q 0 -278 56 -252 Q 28 -266 0 -266 Q -28 -266 -56 -252 Z" fill={KRP.ink} />
        <rect x={-7} y={-300} width={14} height={34} rx={7} fill={KRP.ink} transform="rotate(-18 0 -284)" />
      </g>
    </g>
  );
};

// ===== 田舎の実家 (茅葺き屋根の古民家)。原点=地面中央 =====
const KominkaHouse: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 壁 */}
    <rect x={-210} y={-170} width={420} height={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 茅葺き屋根 */}
    <path d="M -256 -166 L -172 -300 Q 0 -332 172 -300 L 256 -166 Z"
      fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={6} />
    {[-140, -70, 0, 70, 140].map((lx) => (
      <line key={lx} x1={lx * 0.72} y1={-294} x2={lx} y2={-174}
        stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
    ))}
    {/* 棟 (屋根のてっぺん) */}
    <rect x={-66} y={-334} width={132} height={18} rx={9} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 障子窓 */}
    <rect x={-172} y={-132} width={150} height={100} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
    <line x1={-97} y1={-132} x2={-97} y2={-32} stroke={KRP.ink} strokeWidth={3.5} />
    <line x1={-172} y1={-82} x2={-22} y2={-82} stroke={KRP.ink} strokeWidth={3.5} />
    {/* 引き戸 */}
    <rect x={44} y={-132} width={128} height={132} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    <line x1={108} y1={-132} x2={108} y2={0} stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
  </g>
);

// ===== 巾着 (小遣い袋)。原点=中央 =====
const Kinchaku: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p})`}>
      <path d="M -40 14 Q -50 -28 -18 -44 Q -26 -58 0 -58 Q 26 -58 18 -44 Q 50 -28 40 14 Q 22 32 0 32 Q -22 32 -40 14 Z"
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -18 -44 Q 0 -36 18 -44" fill="none" stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-44} r={7} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      <text x={0} y={4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>銭</text>
    </g>
  );
};

// ===== 風呂敷包み (手土産)。原点=中央 =====
const Furoshiki: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p})`}>
      <path d="M -58 26 L -46 -26 Q 0 -44 46 -26 L 58 26 Z" fill={TKP.noren} stroke={KRP.ink} strokeWidth={5} />
      {/* 結び目 (両耳 + 中心) */}
      <path d="M -26 -34 Q -34 -56 -12 -52 L -4 -40 Z" fill={TKP.noren} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 26 -34 Q 34 -56 12 -52 L 4 -40 Z" fill={TKP.noren} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-36} r={10} fill={TKP.noren} stroke={KRP.ink} strokeWidth={4} />
      <line x1={-40} y1={6} x2={40} y2={6} stroke={KRP.white} strokeWidth={3.5} opacity={0.5} />
    </g>
  );
};

// ===== 日本地図の窓 (#182用)。TabiB4 と同じ写像 =====
const JM6 = makeWmap(127.5, 145.8, 30, 42, 460, 120, 1000, 800);
const JP = (k: keyof typeof TABI_JMAP): [number, number] =>
  [JM6.X(TABI_JMAP[k][0]), JM6.Y(TABI_JMAP[k][1])];
// 地図上の地名 (白フチ文字)
const MapName: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 36 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
    fill={KRP.ink} stroke={KRP.white} strokeWidth={8} paintOrder="stroke">{text}</text>
);

// =====================================================================
// シーン本体 (1 motif = 1 関数)。アクションは f=0〜60 で決める → あとは待機ゆれ
// =====================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  // #175 章扉: 第10章 発明された「伝統」。追い風の中を0系が走り込む
  tb6_ch10_door: (f) => {
    const trainX = lerp(-1300, 560, easeOut(seg(f, 0, 46)));
    return (
      <Frame f={f} seed={900}
        over={<ChapterDoor num={10} title={"発明された「伝統」"} t={seg(f, 8, 30)} />}>
        {/* 風の線 (左上をびゅんびゅん流れる) */}
        {[[150, 300, 560], [90, 372, 640], [210, 444, 500]].map(([x0, yy, len], i) => (
          <line key={i} x1={x0} y1={yy} x2={x0 + len} y2={yy}
            stroke={KRP.grayDark} strokeWidth={7} strokeLinecap="round"
            strokeDasharray="90 70" strokeDashoffset={-f * 16 - i * 40} opacity={0.5} />
        ))}
        {/* 線路 */}
        <line x1={-20} y1={906} x2={W + 20} y2={906} stroke={TKP.iron} strokeWidth={9} />
        <line x1={-20} y1={926} x2={W + 20} y2={926} stroke={TKP.iron} strokeWidth={9} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={-10 + i * 158} y={910} width={66} height={12} rx={4}
            fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        ))}
        <Shinkansen0 x={trainX} y={902} s={0.72} f={f} cars={1} />
      </Frame>
    );
  },

  // #176 「交通の革命」大札: 新幹線・マイカー・飛行機の3役が順にポン
  tb6_kotsu_kakumei: (f) => (
    <Frame f={f} seed={901}>
      <Burst x={960} y={380} t={seg(f, 4, 30)} r={280} color={KRP.red} />
      <TagPlate x={960} y={380} text="交通の革命" t={seg(f, 6, 24)} size={80} color={KRP.red} />
      {/* 3つの乗り物 (影 + 本体 + 名札) */}
      {seg(f, 26, 38) > 0 && (
        <g transform={`translate(600 740) scale(${pop(seg(f, 26, 38))})`}>
          <ellipse cx={0} cy={6} rx={210} ry={16} fill={KRP.ink} opacity={0.12} />
          <Shinkansen0 x={-180} y={0} s={0.34} f={f} cars={1} />
        </g>
      )}
      <FamilyCar x={990} y={736} s={0.92} f={f} color={KRP.blueDeep} t={seg(f, 36, 48)} />
      {seg(f, 36, 48) > 0 && <ellipse cx={990} cy={742} rx={150} ry={14} fill={KRP.ink} opacity={0.12} />}
      {seg(f, 46, 58) > 0 && (
        <g transform={`translate(1420 660) scale(${pop(seg(f, 46, 58))})`}>
          <JetPlane x={0} y={0} s={0.52} f={f} />
        </g>
      )}
      <TagPlate x={600} y={830} text="新幹線" t={seg(f, 32, 44)} size={28} />
      <TagPlate x={990} y={830} text="マイカー" t={seg(f, 42, 54)} size={28} />
      <TagPlate x={1420} y={830} text="飛行機" t={seg(f, 52, 64)} size={28} />
    </Frame>
  ),

  // #177 0系新幹線が走り抜ける (6時間半→3時間10分)。★この章の主役カット
  tb6_shinkansen_run: (f) => {
    const trainX = lerp(-1700, 940, easeOut(seg(f, 0, 38)));
    return (
      <Frame f={f} seed={902} caption="1964年 新幹線開業" capX={380}>
        {/* 遠景の富士山 */}
        <g transform="translate(1500 740)" opacity={0.9}>
          <path d="M -300 0 Q -150 -50 -84 -176 Q -42 -248 0 -248 Q 42 -248 84 -176 Q 150 -50 300 0 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -84 -176 Q -42 -248 0 -248 Q 42 -248 84 -176 Q 58 -158 38 -176 Q 18 -150 0 -168 Q -18 -150 -38 -176 Q -58 -158 -84 -176 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
        {/* 流れる雲 (左へ=列車は右へ走り続ける) */}
        {[0, 1].map((i) => {
          const cx = ((i * 1100 + 2400 - f * 7) % 2400) - 200;
          const cy = 420 + i * 90;
          return (
            <g key={i} opacity={0.85}>
              <ellipse cx={cx} cy={cy} rx={88} ry={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={cx - 62} cy={cy + 12} rx={52} ry={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={cx + 66} cy={cy + 12} rx={46} ry={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 流れる架線柱 */}
        {Array.from({ length: 7 }, (_, i) => {
          const mx = ((i * 460 + 5520 - f * 15) % 3220) - 300;
          return (
            <g key={i} stroke={KRP.grayDark} strokeWidth={8} opacity={0.5}>
              <line x1={mx} y1={884} x2={mx} y2={600} />
              <line x1={mx} y1={616} x2={mx + 90} y2={616} />
            </g>
          );
        })}
        {/* 線路 */}
        <line x1={-20} y1={890} x2={W + 20} y2={890} stroke={TKP.iron} strokeWidth={10} />
        <line x1={-20} y1={912} x2={W + 20} y2={912} stroke={TKP.iron} strokeWidth={10} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={-10 + i * 158} y={894} width={70} height={14} rx={4}
            fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        ))}
        {/* スピード線 (車体のうしろ) */}
        {f > 26 && [756, 800, 844].map((yy, i) => (
          <line key={i} x1={40} y1={yy} x2={440} y2={yy}
            stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round"
            strokeDasharray="70 50" strokeDashoffset={-f * 22 - i * 36} opacity={0.55} />
        ))}
        <Shinkansen0 x={trainX} y={886} s={1.05} f={f} cars={2} />
        {/* 東京〜大阪: 6時間半 → 3時間10分 */}
        <TagPlate x={960} y={258} text="東京 〜 大阪" t={seg(f, 6, 18)} size={28} color={KRP.grayDark} />
        <TagPlate x={660} y={350} text="6時間半" t={seg(f, 12, 26)} size={44} color={KRP.grayDark} />
        {seg(f, 38, 48) > 0 && (
          <line x1={lerp(556, 764, easeOut(seg(f, 38, 48)))} y1={lerp(372, 326, easeOut(seg(f, 38, 48)))}
            x2={556} y2={372} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
        )}
        <ArrowR x1={800} x2={960} y={350} t={seg(f, 28, 38)} w={9} />
        <Burst x={1230} y={350} t={seg(f, 38, 60)} r={200} color={KRP.red} />
        <TagPlate x={1230} y={350} text="3時間10分" t={seg(f, 40, 54)} size={56} color={KRP.red} />
      </Frame>
    );
  },

  // #178 利用者10年で5倍 (棒グラフせり上がり)
  tb6_riyosha_5bai: (f) => {
    const base = 820;
    const bars: Array<[number, number, string, string]> = [
      [600, 96, "1964", KRP.blueSoft],
      [860, 190, "1967", KRP.blue],
      [1120, 300, "1970", KRP.blue],
      [1380, 460, "1974", KRP.orange],
    ];
    return (
      <Frame f={f} seed={903} caption="新幹線の利用者数">
        {/* 軸 */}
        <line x1={490} y1={base} x2={1600} y2={base} stroke={KRP.ink} strokeWidth={7} />
        <line x1={490} y1={base} x2={490} y2={300} stroke={KRP.ink} strokeWidth={7} />
        {bars.map(([bx, h, label, color], i) => {
          const hh = h * easeOut(seg(f, 8 + i * 10, 34 + i * 10));
          return (
            <g key={i}>
              <rect x={bx - 75} y={base - hh} width={150} height={hh}
                fill={color} stroke={KRP.ink} strokeWidth={5.5} />
              <text x={bx} y={base + 40} textAnchor="middle" fontFamily={FONT} fontWeight={800}
                fontSize={28} fill={KRP.ink}>{label}</text>
            </g>
          );
        })}
        {/* 右肩上がりの点線矢印 */}
        <DashArc x1={600} y1={700} x2={1380} y2={380} t={seg(f, 40, 56)} lift={-40} color={KRP.red} />
        <Burst x={1380} y={330} t={seg(f, 44, 66)} r={190} color={KRP.red} />
        <TagPlate x={1190} y={290} text="10年で5倍!" t={seg(f, 46, 58)} size={54} color={KRP.red} />
      </Frame>
    );
  },

  // #179 マイカー 218万台→1700万台超: 1台が画面いっぱいに増殖
  tb6_mycar_bakuhatsu: (f) => {
    const backRow: Array<[number, string]> = [
      [300, KRP.green], [620, KRP.yellow], [960, KRP.gray], [1300, KRP.blueDeep], [1620, KRP.red],
    ];
    const frontRow: Array<[number, string]> = [
      [280, KRP.blueDeep], [680, KRP.orange], [1240, KRP.green], [1640, KRP.yellow],
    ];
    return (
      <Frame f={f} seed={904} caption="マイカー保有台数">
        <TagPlate x={620} y={310} text="218万台" t={seg(f, 6, 18)} size={40} color={KRP.grayDark} />
        <ArrowR x1={780} x2={960} y={310} t={seg(f, 18, 28)} w={9} />
        <Burst x={1290} y={310} t={seg(f, 28, 50)} r={210} color={KRP.red} />
        <TagPlate x={1290} y={310} text="1700万台超" t={seg(f, 30, 44)} size={54} color={KRP.red} />
        {/* まず1台 → 増殖 */}
        {backRow.map(([bx, c], i) => (
          <FamilyCar key={i} x={bx as number} y={546} s={0.55} f={f + i * 7} color={c as string}
            t={seg(f, 36 + i * 3, 46 + i * 3)} />
        ))}
        <FamilyCar x={470} y={696} s={0.82} f={f + 3} color={KRP.gray} t={seg(f, 26, 36)} />
        <FamilyCar x={960} y={700} s={0.92} f={f} color={KRP.red} t={seg(f, 4, 16)} />
        <FamilyCar x={1460} y={696} s={0.82} f={f + 5} color={KRP.green} t={seg(f, 30, 40)} />
        {frontRow.map(([bx, c], i) => (
          <FamilyCar key={i} x={bx as number} y={852} s={1.0} f={f + i * 5} color={c as string}
            t={seg(f, 44 + i * 3, 54 + i * 3)} />
        ))}
      </Frame>
    );
  },

  // #180 名神高速そのものが観光名所: 高架を走る車を見物+カメラ
  tb6_meishin_meisho: (f) => {
    const flash = (f % 80) < 8;
    return (
      <Frame f={f} seed={905} caption="名神高速道路 1963〜">
        {/* 高架の橋脚 */}
        {[240, 1200, 1680].map((px) => (
          <rect key={px} x={px - 28} y={470} width={56} height={392}
            fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 高架の道路 */}
        <rect x={-20} y={400} width={W + 40} height={70} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-20} y1={436} x2={W + 20} y2={436} stroke={KRP.white} strokeWidth={5}
          strokeDasharray="46 40" strokeDashoffset={-f * 10} opacity={0.9} />
        {/* ガードレール */}
        <line x1={-20} y1={382} x2={W + 20} y2={382} stroke={KRP.silver} strokeWidth={7} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={20 + i * 158} y1={382} x2={20 + i * 158} y2={400} stroke={KRP.silver} strokeWidth={6} />
        ))}
        {/* 走る車たち */}
        {[[0, KRP.red], [730, KRP.blueDeep], [1460, KRP.green]].map(([off, c], i) => (
          <FamilyCar key={i} x={(((off as number) + f * 11) % 2330) - 170} y={402}
            s={0.62} f={f} color={c as string} />
        ))}
        {/* 見物の人たち (見上げる) */}
        <Person x={560} y={854} s={1} f={f} phase={0} face="surprised" gaze={[2, -7]} />
        <Person x={740} y={854} s={1} f={f} phase={1} face="smile" gaze={[0, -7]} cloth="#8A5A64" clothDark="#6E4650" />
        <Person x={920} y={854} s={1} f={f} phase={2} face="smile" gaze={[-2, -7]} cloth={KRP.green} clothDark="#639A5F" />
        {/* 真ん中の人はカメラを構える */}
        <g transform={`translate(740 ${854 + bobOf(f, 1)})`}>
          <rect x={18} y={-252} width={52} height={36} rx={6} fill={KRP.ink} />
          <circle cx={44} cy={-234} r={11} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {flash && <SparkleS x={808} y={628} s={1.4} />}
        <TagPlate x={1430} y={640} text="観光名所に!" t={seg(f, 34, 46)} size={38} color={KRP.red} />
        <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      </Frame>
    );
  },

  // #181 路肩に車を止めて弁当を広げる家族 (〜いたそうです、の逸話トーン)
  tb6_rokata_bento: (f) => (
    <Frame f={f} seed={906} caption="路肩でお弁当">
      {/* ガードレール (ここは高速道路のはし) */}
      <line x1={-20} y1={742} x2={W + 20} y2={742} stroke={KRP.silver} strokeWidth={8} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={60 + i * 190} y1={742} x2={60 + i * 190} y2={790} stroke={KRP.silver} strokeWidth={7} />
      ))}
      {/* 路面 (路肩の白線つき) */}
      <rect x={-20} y={860} width={W + 40} height={80} fill={KRP.grayDark} opacity={0.4} />
      <line x1={-20} y1={872} x2={W + 20} y2={872} stroke={KRP.white} strokeWidth={6} opacity={0.9} />
      {/* 止めた車 */}
      <FamilyCar x={1430} y={858} s={1.1} f={0} color={KRP.blueDeep} />
      {/* 家族 (シートの上に座っているように、脚をシートで隠す) */}
      <Person x={620} y={872} s={0.95} f={f} phase={0} face="smile" gaze={[4, 4]} cloth="#8A5A64" clothDark="#6E4650" />
      <Person x={900} y={872} s={0.95} f={f} phase={1} face="smile" gaze={[-4, 4]} />
      <Person x={762} y={866} s={0.62} f={f} phase={2} face="surprised" gaze={[0, 5]} cloth={KRP.yellow} clothDark={KRP.orange} />
      <ellipse cx={766} cy={866} rx={280} ry={40} fill="#D7E3EE" stroke={KRP.ink} strokeWidth={5} />
      <Ekiben x={766} y={838} s={1.4} open />
      <SparkleS x={980} y={700} s={0.8} opacity={0.5 + Math.sin(f / 7) * 0.4} />
      <TagPlate x={1130} y={620} text="※いたそうです" t={seg(f, 44, 56)} size={24} color={KRP.grayDark} />
    </Frame>
  ),

  // #182 誰もがどこへでも行ける時代 (日本地図を乗り物が行き交う)
  tb6_dokodemo_jidai: (f) => {
    const [ex, ey] = JP("edo");
    const [ox, oy] = JP("osaka");
    const [mx, my] = JP("miyazaki");
    const [ix, iy] = JP("ise");
    // 弧に沿う点 (DashArc と同じ2次ベジエ)
    const arcPos = (x1: number, y1: number, x2: number, y2: number, lift: number, u: number): [number, number] => {
      const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - lift;
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      return [a * x1 + b * cx + c * x2, a * y1 + b * cy + c * y2];
    };
    const uT = ((f * 1.3 + 72) % 100) / 100;
    const uP = ((f * 1.0) % 110) / 110;
    const [px, py] = arcPos(ex, ey, mx, my, 230, uP);
    const uC = ((f * 1.2 + 63) % 90) / 90;
    return (
      <Frame f={f} seed={907} caption="誰もが、どこへでも">
        <WorldMapCard lonMin={127.5} lonMax={145.8} latMin={30} latMax={42}
          x={460} y={120} w={1000} h={800} clipId="tb6dokodemo">
          <DashArc x1={ox} y1={oy} x2={ex} y2={ey} t={seg(f, 10, 28)} lift={110} color={KRP.blueDeep} />
          <DashArc x1={ex} y1={ey} x2={mx} y2={my} t={seg(f, 18, 36)} lift={230} color={KRP.red} />
          <DashArc x1={ox} y1={oy} x2={ix} y2={iy} t={seg(f, 26, 42)} lift={70} color={KRP.green} />
          <MapPin x={ex} y={ey} t={seg(f, 6, 18)} />
          <MapPin x={ox} y={oy} t={seg(f, 12, 24)} color={KRP.blueDeep} />
          <MapPin x={ix} y={iy} t={seg(f, 18, 30)} color={KRP.green} />
          <MapPin x={mx} y={my} t={seg(f, 24, 36)} color={KRP.orange} />
          {/* 乗り物たち (弧が引けたら走り出す)。ピンの後に描いて隠れないようにする */}
          {f > 30 && <Shinkansen0 x={lerp(ox, ex, uT)} y={lerp(oy, ey, uT) - Math.sin(uT * Math.PI) * 100} s={0.17} f={f} cars={0} />}
          {f > 44 && <FamilyCar x={lerp(ox, ix, uC)} y={lerp(oy, iy, uC) - Math.sin(uC * Math.PI) * 30} s={0.36} f={f} />}
          {f > 38 && <JetPlane x={px} y={py} s={0.3} f={f} />}
          <MapName x={ex + 64} y={ey - 32} text="東京" />
          <MapName x={ox - 66} y={oy + 52} text="大阪" />
          <MapName x={ix + 56} y={iy + 48} text="伊勢" />
          <MapName x={mx - 30} y={my + 60} text="宮崎" />
        </WorldMapCard>
      </Frame>
    );
  },

  // #183 新しい「口実」が生まれる (？の大札)
  tb6_atarashii_kojitsu: (f) => (
    <Frame f={f} seed={908}>
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      <Person x={520} y={850} s={1.1} f={f} phase={0} face="normal" gaze={[5, -4]} />
      {/* 考え事の点々 */}
      {[[640, 700, 9], [710, 620, 13], [790, 540, 17]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={(r as number) * pop(seg(f, 6 + i * 5, 16 + i * 5))}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <TagPlate x={1120} y={250} text="新しい口実" t={seg(f, 6, 20)} size={48} />
      <Burst x={1120} y={480} t={seg(f, 14, 40)} r={260} color={KRP.orange} />
      {/* ？の大札 (中身は次のシーンで明かされる) */}
      {seg(f, 16, 32) > 0 && (
        <g transform={`translate(1120 480) scale(${pop(seg(f, 16, 32))})`}>
          <rect x={-250} y={-105} width={500} height={210} rx={16}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={140} fill={KRP.red}>？</text>
        </g>
      )}
      {/* ふわふわ漂う小さな？ */}
      {[[830, 360], [1430, 330], [1500, 640]].map(([qx, qy], i) => (
        <text key={i} x={qx} y={(qy as number) + Math.sin((f + i * 20) / 11) * 8}
          textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
          fill={KRP.grayDark} opacity={pop(seg(f, 30 + i * 8, 44 + i * 8)) * 0.8}>？</text>
      ))}
    </Frame>
  ),

  // #184 「実家に帰る」大札 + 田舎の実家
  tb6_jikka_ni_kaeru: (f) => {
    const houseT = easeOut(seg(f, 24, 40));
    return (
      <Frame f={f} seed={909}>
        <Burst x={960} y={330} t={seg(f, 4, 30)} r={290} color={KRP.red} />
        <TagPlate x={960} y={330} text="実家に帰る" t={seg(f, 6, 24)} size={84} color={KRP.red} />
        {/* 田舎の実家 (ふわっと現れる) */}
        <g opacity={houseT} transform={`translate(0 ${(1 - houseT) * 24})`}>
          <KominkaHouse x={700} y={852} s={1} />
          {/* 囲炉裏の煙 */}
          {[0, 1].map((i) => {
            const t = ((f / 2 + i * 26) % 52) / 52;
            return (
              <circle key={i} cx={740 + Math.sin((f + i * 30) / 14) * 10} cy={500 - t * 110}
                r={14 + t * 18} fill={TKP.steam} stroke={KRP.ink} strokeWidth={3.5}
                opacity={(0.8 - t * 0.6) * houseT} />
            );
          })}
          {/* 田んぼ (横のさざ波線) */}
          {[796, 824, 850].map((yy, i) => (
            <path key={i} d={`M 1120 ${yy} q 60 -12 120 0 q 60 12 120 0 q 60 -12 120 0 q 60 12 120 0`}
              fill="none" stroke={TKP.pine} strokeWidth={5} opacity={0.7} />
          ))}
          <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        </g>
      </Frame>
    );
  },

  // #185 盆と正月の帰省ラッシュ: ホームをボストンバッグの人波が流れる
  tb6_kisei_rush: (f) => {
    const walkers: Array<[number, number, number, string, string]> = [
      [100, 6.5, 1.0, "#3E4B66", KRP.orange],
      [430, 5.6, 0.92, KRP.green, KRP.blueDeep],
      [760, 7.2, 1.05, "#8A5A64", KRP.yellow],
      [1100, 6.0, 0.95, TKP.noren, KRP.red],
      [1440, 6.8, 1.0, "#7A5C50", KRP.green],
      [1760, 5.2, 0.9, KRP.grayDark, KRP.orange],
    ];
    return (
      <Frame f={f} seed={910} caption="盆と正月の帰省ラッシュ">
        {/* 停車中の列車 (ホームの向こう側) */}
        <rect x={-40} y={418} width={2000} height={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={430} width={2000} height={190} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={20 + i * 160} y={468} width={96} height={64} rx={10}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {[340, 980, 1620].map((dx) => (
          <g key={dx}>
            <rect x={dx} y={462} width={110} height={152} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
            <line x1={dx + 55} y1={462} x2={dx + 55} y2={614} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <rect x={-40} y={560} width={2000} height={22} fill={KRP.orange} opacity={0.85} />
        {/* ホームの縁 + 白線 */}
        <rect x={-40} y={640} width={2000} height={26} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-20} y1={690} x2={W + 20} y2={690} stroke={KRP.white} strokeWidth={8}
          strokeDasharray="60 36" opacity={0.9} />
        {/* 奥の人影 (シルエットの人波) */}
        {[0, 420, 900, 1380].map((x0, i) => {
          const sx = ((x0 + f * 3.4) % 2100) - 100;
          return (
            <g key={i} transform={`translate(${sx} 780) scale(0.62)`} opacity={0.4}>
              <circle cx={0} cy={-228} r={64} fill={KRP.grayDark} />
              <rect x={-58} y={-168} width={116} height={168} rx={18} fill={KRP.grayDark} />
            </g>
          );
        })}
        {/* 手前の帰省客 (ボストンバッグ持って右へ急ぐ) */}
        {walkers.map(([x0, sp, s, cloth, bag], i) => {
          const x = ((x0 + f * sp) % 2200) - 150;
          return (
            <g key={i}>
              <Person x={x} y={852} s={s} f={f} phase={i} face={i % 3 === 0 ? "smile" : "normal"}
                gaze={[5, 0]} lean={4} cloth={cloth} clothDark={KRP.grayDark} />
              <BostonBag x={x + 84 * s} y={852 - 52 * s + bobOf(f, i)} s={s * 0.95} color={bag} />
            </g>
          );
        })}
      </Frame>
    );
  },

  // #186 集団就職が生んだ新風習: 田舎→都会へ若者が歩く
  tb6_shudan_shushoku: (f) => (
    <Frame f={f} seed={911}>
      <TagPlate x={960} y={280} text="集団就職" t={seg(f, 4, 18)} size={54} />
      <TagPlate x={960} y={384} text="1960年代〜" t={seg(f, 14, 26)} size={32} color={KRP.grayDark} />
      {/* 左: 田舎 */}
      <KominkaHouse x={250} y={850} s={0.72} />
      {/* 右: 都会のビル群 */}
      <g>
        <rect x={1440} y={534} width={110} height={316} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1570} y={460} width={124} height={390} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1714} y={564} width={100} height={286} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={1588 + (i % 3) * 34} y={492 + Math.floor(i / 3) * 56} width={20} height={26}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={1458 + (i % 2) * 44} y={566 + Math.floor(i / 2) * 64} width={22} height={28}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
      </g>
      {/* 田舎→都会の大矢印 */}
      <ArrowR x1={520} x2={1310} y={470} t={seg(f, 8, 26)} color={KRP.orange} w={18} />
      {/* 歩いていく若者たち */}
      {[[0, "#3E4B66", KRP.orange], [1, KRP.green, KRP.red], [2, TKP.yukata, KRP.blueDeep]].map(([i, cloth, bag]) => {
        const idx = i as number;
        const x = lerp(500, 1270, easeOut(seg(f, 10 + idx * 9, 50 + idx * 9))) - idx * 150;
        return (
          <g key={idx}>
            <Person x={x} y={850} s={0.82} f={f} phase={idx} face="normal" gaze={[5, -1]} lean={3}
              cloth={cloth as string} clothDark={KRP.grayDark} />
            <BostonBag x={x + 68} y={850 - 44 + bobOf(f, idx)} s={0.78} color={bag as string} />
          </g>
        );
      })}
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
    </Frame>
  ),

  // #187 江戸にそっくりな先行例: カレンダーの頁が逆向きに飛んで時代をさかのぼる
  tb6_edo_senkourei: (f) => {
    const edoT = easeOut(seg(f, 44, 58));
    return (
      <Frame f={f} seed={912}>
        <TagPlate x={520} y={250} text="時間をさかのぼると…" t={seg(f, 4, 16)} size={34} />
        {/* カレンダー台紙 */}
        <g transform="translate(1340 460)">
          <rect x={-190} y={-220} width={380} height={440} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-190} y={-220} width={380} height={86} rx={14} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={6} />
          {[-110, 0, 110].map((rx, i) => (
            <circle key={i} cx={rx} cy={-220} r={14} fill="none" stroke={KRP.ink} strokeWidth={6} />
          ))}
          <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
            fill={KRP.ink} opacity={pop(seg(f, 46, 62))}>江戸</text>
        </g>
        {/* 左へ飛んでいく頁 (現代 → 明治) */}
        {["現代", "明治"].map((era, i) => {
          const t = seg(f, 8 + i * 16, 40 + i * 16);
          if (t >= 1) return null;
          const e = easeOut(t);
          const x = 1340 - e * 680;
          const y = 460 - Math.sin(e * Math.PI) * 240 - e * 120;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${-e * 42})`} opacity={1 - e * 0.8}>
              <rect x={-170} y={-200} width={340} height={400} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={KRP.grayDark}>{era}</text>
            </g>
          );
        })}
        {/* 江戸の町なみがふわっと現れる */}
        <g opacity={edoT}>
          <Shukuba x={430} y={850} s={0.85} />
          <EdoTraveler x={760} y={850} s={0.88} f={f} phase={1} face="smile" />
          <line x1={-20} y1={862} x2={1120} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        </g>
        <SparkleS x={820} y={300} s={0.8} opacity={0.5 + Math.sin(f / 7) * 0.4} />
        <SparkleS x={300} y={560} s={0.6} opacity={0.5 + Math.sin((f + 10) / 8) * 0.4} />
      </Frame>
    );
  },

  // #188 「藪入り」大札 + 江戸の商家
  tb6_yabuiri_fuda: (f) => (
    <Frame f={f} seed={913}>
      <TagPlate x={250} y={240} text="江戸時代" t={seg(f, 4, 14)} size={30} color={KRP.grayDark} />
      <Burst x={960} y={330} t={seg(f, 4, 32)} r={300} color={KRP.red} />
      <TagPlate x={960} y={330} text="藪入り" t={seg(f, 8, 26)} size={92} color={KRP.red} />
      <TagPlate x={960} y={444} text="やぶいり" t={seg(f, 20, 32)} size={26} color={KRP.grayDark} />
      <Shukuba x={960} y={855} s={1.15} sign="商家" />
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
    </Frame>
  ),

  // #189 奉公人は年2回だけ実家へ (正月と盆に印のついた1年カレンダー)
  tb6_yabuiri_nen2kai: (f) => {
    const cw = 1100 / 12;
    const cellX = (m: number) => 600 + (m + 0.5) * cw;
    return (
      <Frame f={f} seed={914} caption="奉公人が実家に帰れる日">
        <EdoBoy x={360} y={850} s={1.05} f={f} phase={0} face="smile" gaze={[6, -4]} />
        {/* 1年のカレンダー帯 */}
        <rect x={600} y={430} width={1100} height={220} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={600 + (i + 1) * cw} y1={430} x2={600 + (i + 1) * cw} y2={650}
            stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        ))}
        {Array.from({ length: 12 }, (_, m) => (
          <text key={m} x={cellX(m)} y={552} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={26} fill={KRP.ink}>{m + 1}月</text>
        ))}
        {/* 正月 (1月) と盆 (7月) に赤丸 */}
        {[[0, 26, 38, "正月"], [6, 36, 48, "お盆"]].map(([m, a, b, label], i) => {
          const t = seg(f, a as number, b as number);
          return (
            <g key={i}>
              {t > 0 && (
                <circle cx={cellX(m as number)} cy={544} r={40 * pop(t)}
                  fill="none" stroke={KRP.red} strokeWidth={7} />
              )}
              <TagPlate x={cellX(m as number)} y={730} text={label as string}
                t={seg(f, (a as number) + 6, (b as number) + 6)} size={30} color={KRP.red} />
            </g>
          );
        })}
        <Burst x={1150} y={310} t={seg(f, 42, 62)} r={180} color={KRP.red} />
        <TagPlate x={1150} y={310} text="年に2回だけ" t={seg(f, 44, 56)} size={48} color={KRP.red} />
        <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      </Frame>
    );
  },

  // #190 主人が小遣いと手土産を持たせて送り出す
  tb6_shujin_miyage: (f) => (
    <Frame f={f} seed={915} caption="小遣いと手土産を持たせて">
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      <MasterPerson x={640} y={850} s={1.1} f={f} phase={0} face="smile" gaze={[6, -3]} />
      <EdoBoy x={1300} y={850} s={0.95} f={f} phase={1} face="smile" gaze={[-6, -3]} />
      {/* 手渡される小遣いと手土産 */}
      <Burst x={1010} y={600} t={seg(f, 10, 30)} r={150} color={KRP.yellow} />
      <Kinchaku x={930} y={590 + Math.sin(f / 12) * 5} s={1.05} t={seg(f, 14, 28)} />
      <TagPlate x={930} y={708} text="小遣い" t={seg(f, 20, 32)} size={28} />
      <Furoshiki x={1100} y={600 + Math.sin((f + 8) / 12) * 5} s={1.1} t={seg(f, 28, 42)} />
      <TagPlate x={1100} y={708} text="手土産" t={seg(f, 34, 46)} size={28} />
      <SparkleS x={1020} y={470} s={0.9} opacity={0.5 + Math.sin(f / 7) * 0.4} />
      <SparkleS x={860} y={500} s={0.6} opacity={0.5 + Math.sin((f + 12) / 8) * 0.4} />
    </Frame>
  ),

  // #191 口実と言い訳の完全なセット (この動画の芯。丁寧に)
  tb6_kanzen_set: (f) => {
    const slide = easeOut(seg(f, 6, 30));
    const boxT = pop(seg(f, 42, 54));
    return (
      <Frame f={f} seed={916}>
        {/* 左右からスライドして出会う2枚の札 */}
        <TagPlate x={lerp(-320, 700, slide)} y={505} text="帰る口実" size={54} color={KRP.blueDeep} />
        <TagPlate x={lerp(2240, 1240, slide)} y={505} text="帰れる言い訳" size={54} color={KRP.green} />
        <Burst x={955} y={505} t={seg(f, 28, 44)} r={130} color={KRP.yellow} />
        {seg(f, 30, 40) > 0 && (
          <text x={955} y={528} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={66} fill={KRP.ink} opacity={pop(seg(f, 30, 40))}>＋</text>
        )}
        {/* 2枚をまとめて囲む赤枠 */}
        {boxT > 0 && (
          <g transform={`translate(970 505) scale(${boxT})`}>
            <rect x={-490} y={-110} width={980} height={220} rx={26}
              fill="none" stroke={KRP.red} strokeWidth={9} />
          </g>
        )}
        <Burst x={970} y={272} t={seg(f, 44, 66)} r={240} color={KRP.red} />
        <TagPlate x={970} y={272} text="完全セット" t={seg(f, 46, 58)} size={62} color={KRP.red} />
        {f > 54 && (
          <g>
            <SparkleS x={520} y={340} s={0.9} opacity={0.5 + Math.sin(f / 7) * 0.4} />
            <SparkleS x={1430} y={360} s={0.7} opacity={0.5 + Math.sin((f + 9) / 8) * 0.4} />
            <SparkleS x={970} y={700} s={0.8} opacity={0.5 + Math.sin((f + 17) / 9) * 0.4} />
          </g>
        )}
      </Frame>
    );
  },

  // #192 ご先祖様はやっぱり同じ (江戸の奉公人 ⇔ 現代の帰省客)
  tb6_gosenzo_onaji: (f) => (
    <Frame f={f} seed={917} caption="やっぱり、同じ">
      {/* 中央の区切り線 */}
      <line x1={960} y1={250} x2={960} y2={850} stroke={KRP.ink} strokeWidth={5}
        strokeDasharray="18 16" opacity={0.45} />
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      {/* 左: 江戸の奉公人 (風呂敷包み) */}
      <TagPlate x={480} y={300} text="江戸の奉公人" t={seg(f, 8, 20)} size={36} />
      <EdoBoy x={480} y={850} s={1.05} f={f} phase={0} face="smile" gaze={[6, -3]} />
      <Furoshiki x={616} y={796 + bobOf(f, 0)} s={0.85} t={seg(f, 14, 26)} />
      {/* 右: 現代の帰省客 (紙袋) */}
      <TagPlate x={1440} y={300} text="現代の帰省" t={seg(f, 14, 26)} size={36} />
      <Person x={1440} y={850} s={1.05} f={f} phase={1} face="smile" gaze={[-6, -3]}
        cloth={KRP.green} clothDark="#639A5F" />
      {seg(f, 20, 32) > 0 && (
        <g transform={`translate(1576 ${780 + bobOf(f, 1)}) scale(${pop(seg(f, 20, 32))})`}>
          <PaperBag x={0} y={0} s={0.9} />
        </g>
      )}
      {/* まんなかの「＝」 */}
      {seg(f, 36, 50) > 0 && (
        <g transform={`translate(960 540) scale(${pop(seg(f, 36, 50))})`}>
          <rect x={-60} y={-34} width={120} height={20} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={14} width={120} height={20} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      <Burst x={960} y={540} t={seg(f, 36, 58)} r={160} color={KRP.red} />
    </Frame>
  ),

  // #193 GWの名は1951年ごろの映画宣伝「とされます」
  tb6_gw_eiga_setsu: (f) => {
    const beam = easeOut(seg(f, 14, 26));
    const reel = (f * 5) % 360;
    return (
      <Frame f={f} seed={918} caption="名前の生みの親は映画?"
        over={f >= 34 ? <Stamp x={1480} y={170} text="1951年ごろ" size={44} /> : undefined}>
        {/* 映写機の光 */}
        {beam > 0 && (
          <polygon points="1640,790 1438,310 1438,668" fill={KRP.yellow} opacity={0.18 * beam} />
        )}
        {/* スクリーン + 幕 */}
        <rect x={480} y={270} width={960} height={410} rx={10} fill="#EFEAD9" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 452 258 Q 486 400 460 540 Q 492 620 470 692 L 540 692 Q 520 560 544 430 Q 524 330 548 258 Z"
          fill={KRP.red} opacity={0.88} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1468 258 Q 1434 400 1460 540 Q 1428 620 1450 692 L 1380 692 Q 1400 560 1376 430 Q 1396 330 1372 258 Z"
          fill={KRP.red} opacity={0.88} stroke={KRP.ink} strokeWidth={5} />
        {/* スクリーンに映るタイトル */}
        {seg(f, 26, 42) > 0 && (
          <g transform={`translate(960 492) scale(${pop(seg(f, 26, 42))})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={82} fill={KRP.blueDeep}>ゴールデン</text>
            <text x={0} y={108} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={82} fill={KRP.blueDeep}>ウィーク</text>
          </g>
        )}
        <Burst x={960} y={480} t={seg(f, 26, 50)} r={260} color={KRP.yellow} />
        {/* 映写機 (リールが回る) */}
        <g transform="translate(1690 822)">
          <rect x={-70} y={-56} width={140} height={72} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-74} y={-30} width={18} height={26} rx={5} fill={KRP.ink} />
          {[-34, 34].map((cx, i) => (
            <g key={i} transform={`translate(${cx} -84)`}>
              <circle r={32} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
              <g transform={`rotate(${reel})`}>
                <line x1={-24} y1={0} x2={24} y2={0} stroke={KRP.ink} strokeWidth={4} />
                <line x1={0} y1={-24} x2={0} y2={24} stroke={KRP.ink} strokeWidth={4} />
              </g>
              <circle r={7} fill={KRP.ink} />
            </g>
          ))}
        </g>
        {/* フィルムの帯 */}
        {seg(f, 20, 32) > 0 && (
          <g transform={`translate(300 770) rotate(-8) scale(${pop(seg(f, 20, 32))})`}>
            <rect x={-170} y={-40} width={340} height={80} rx={10} fill={KRP.ink} />
            {Array.from({ length: 4 }, (_, i) => (
              <rect key={i} x={-152 + i * 82} y={-18} width={64} height={36} rx={4} fill={KRP.white} opacity={0.9} />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <rect x={-158 + i * 37} y={-34} width={12} height={9} rx={2} fill={KRP.white} opacity={0.8} />
                <rect x={-158 + i * 37} y={25} width={12} height={9} rx={2} fill={KRP.white} opacity={0.8} />
              </g>
            ))}
          </g>
        )}
        {/* 言い切らない注釈 (※とされる) */}
        <TagPlate x={1150} y={742} text="※宣伝文句から広まったとされる" t={seg(f, 46, 58)}
          size={24} color={KRP.grayDark} />
      </Frame>
    );
  },

  // #194 伝統は意外と最近発明された (「伝統」にNEW!シールと製造タグ)
  tb6_dento_hatsumei: (f) => {
    const tagT = pop(seg(f, 44, 56));
    return (
      <Frame f={f} seed={919} caption="発明された「伝統」">
        <TagPlate x={880} y={480} text="伝統" t={seg(f, 6, 22)} size={116} />
        {/* NEW! の星形シール */}
        <Burst x={1120} y={352} t={seg(f, 28, 48)} r={170} color={KRP.red} />
        {seg(f, 30, 44) > 0 && (
          <g transform={`translate(1120 352) rotate(${-10 + Math.sin(f / 15) * 2}) scale(${pop(seg(f, 30, 44))})`}>
            <path d={Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
              const r = i % 2 === 0 ? 88 : 66;
              return `${i === 0 ? "M" : "L"} ${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
            }).join(" ") + " Z"}
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={44} fill={KRP.red}>NEW!</text>
          </g>
        )}
        {/* ぶら下がる製造タグ */}
        {tagT > 0 && (
          <g transform={`translate(1010 580) rotate(${8 + Math.sin(f / 9) * 4}) scale(${tagT})`}>
            <line x1={0} y1={0} x2={70} y2={64} stroke={KRP.ink} strokeWidth={4} />
            <g transform="translate(70 64)">
              <rect x={-20} y={-6} width={288} height={76} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={0} cy={32} r={7} fill="none" stroke={KRP.ink} strokeWidth={4} />
              <text x={134} y={44} textAnchor="middle" fontFamily={FONT} fontWeight={800}
                fontSize={28} fill={KRP.ink}>製造: 意外と最近</text>
            </g>
          </g>
        )}
        {/* 左下: 休日に赤丸のついたカレンダー / 右下: 帰省の紙袋 */}
        <g opacity={easeOut(seg(f, 36, 50))}>
          <g transform="translate(350 720)">
            <rect x={-100} y={-110} width={200} height={220} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={-100} y={-110} width={200} height={44} rx={12} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={i} cx={-66 + (i % 4) * 44} cy={-24 + Math.floor(i / 4) * 44} r={8}
                fill={i === 1 || i === 6 ? "none" : KRP.gray}
                stroke={i === 1 || i === 6 ? KRP.red : "none"} strokeWidth={5} />
            ))}
          </g>
          <PaperBag x={1580} y={760} s={0.9} />
          <Furoshiki x={1440} y={800} s={0.62} />
        </g>
        <SparkleS x={600} y={320} s={0.8} opacity={0.5 + Math.sin(f / 7) * 0.4} />
        <SparkleS x={1500} y={520} s={0.6} opacity={0.5 + Math.sin((f + 11) / 8) * 0.4} />
      </Frame>
    );
  },
};

export const tabiB6Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif] ? SCENES[motif](f) : null;

// 文#175〜#194 に1対1で対応する motif 名の列 (長さは必ず20。再利用は同じ名前を繰り返す)
export const T_B6_MOTIFS: string[] = [
  "tb6_ch10_door",         // #175 第10章扉: 発明された「伝統」
  "tb6_kotsu_kakumei",     // #176 交通の革命
  "tb6_shinkansen_run",    // #177 1964年 新幹線 6時間半→3時間10分
  "tb6_riyosha_5bai",      // #178 利用者10年で5倍
  "tb6_mycar_bakuhatsu",   // #179 マイカー218万→1700万台超
  "tb6_meishin_meisho",    // #180 名神高速が観光名所
  "tb6_rokata_bento",      // #181 路肩で弁当を広げる家族
  "tb6_dokodemo_jidai",    // #182 誰もがどこへでも
  "tb6_atarashii_kojitsu", // #183 新しい口実が生まれる
  "tb6_jikka_ni_kaeru",    // #184 「実家に帰る」
  "tb6_kisei_rush",        // #185 帰省ラッシュ
  "tb6_shudan_shushoku",   // #186 集団就職の新風習
  "tb6_edo_senkourei",     // #187 江戸の先行例
  "tb6_yabuiri_fuda",      // #188 「藪入り」
  "tb6_yabuiri_nen2kai",   // #189 年2回だけ実家へ
  "tb6_shujin_miyage",     // #190 主人が土産を持たせる
  "tb6_kanzen_set",        // #191 完全なセット
  "tb6_gosenzo_onaji",     // #192 ご先祖様も同じ
  "tb6_gw_eiga_setsu",     // #193 GW=映画宣伝とされる
  "tb6_dento_hatsumei",    // #194 発明された伝統
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const T_B6_PREVIEW_FRAMES = Math.max(T_B6_MOTIFS.length, 1);
export const TabiB6Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(T_B6_MOTIFS.length - 1, 0));
  const motif = T_B6_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {tabiB6Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 175} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
