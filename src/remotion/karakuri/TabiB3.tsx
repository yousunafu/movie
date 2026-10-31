// 「旅とお土産の歴史」: ブロック3 = 第5章 + 第6章 + 第7章 (グランドツアー・湯治・トマス・クック)。
// 担当範囲: 台本 docs/tabi-miyage-script-v1.txt の 98〜139行目 (文#97〜#138・42文)。
// motif 名は必ず tb3_ で始める。WobbleDefs の seed はこのファイルでは 600〜699 を使う。
// このファイルを編集してよいのはブロック3担当だけ (共有部品は TabiShared/TabiKits/TabiTravel から import)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, TBadge, ChapterDoor } from "./TabiShared";
import {
  TKP, EuroBg18c, Carriage, NobleSon, FramedPainting, PrintSheet,
  OnsenBg, Rotenburo, YuYado, YukataPerson, OnsenBanzuke, YoujinshuBook,
  BritStationBg, SteamLoco, VictorianGent, TimetableSheet, StationClock, ShillingCoin,
  EdoTraveler, ScallopShell,
} from "./TabiKits";
import {
  GlobeTravel, GrandTourMap, WorldTourGlobe, KoujitsuRoute, SteamShip,
  makeWmap, TABI_SPOT, TabiSpot,
} from "./TabiTravel";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== シーンの共通ガワ: クリーム紙地 + ゆらぎ + バッジ + 質感 (WatashiB1 の Frame と同じ流儀) =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string; capX?: number; capY?: number;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, capX = 960, capY = 170, over, children }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={capX} y={capY} centerX text={caption} />}
    <TBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 小物キット =====
// 木札風ラベル (svg内。中央寄せ)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string; fill?: string;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// びっくり放射線
const Burst: React.FC<{ x: number; y: number; r?: number; color?: string; t?: number; n?: number }> =
  ({ x, y, r = 60, color = KRP.orange, t = 1, n = 10 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g transform={`translate(${x} ${y})`} opacity={tt}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + 0.25;
          return (
            <line key={i} x1={Math.cos(a) * r * 0.62} y1={Math.sin(a) * r * 0.62}
              x2={Math.cos(a) * r * (0.62 + 0.38 * tt)} y2={Math.sin(a) * r * (0.62 + 0.38 * tt)}
              stroke={color} strokeWidth={7} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

// 赤いバツ (だめ! の印)
const Xmark: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 120, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={0.92}>
      <line x1={-r} y1={-r} x2={r} y2={r} stroke={KRP.red} strokeWidth={22} strokeLinecap="round" />
      <line x1={r} y1={-r} x2={-r} y2={r} stroke={KRP.red} strokeWidth={22} strokeLinecap="round" />
    </g>
  );
};

// 任意の点を中心に pop で出す (x,y固定の部品用)
const PopAt: React.FC<{ x: number; y: number; t: number; children: React.ReactNode }> =
  ({ x, y, t, children }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    return <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>{children}</g>;
  };

// カメラ寄り (画面中心を基準に scale)
const Cam: React.FC<{ k: number; cx?: number; cy?: number; children: React.ReactNode }> =
  ({ k, cx = 960, cy = 540, children }) => (
    <g transform={`translate(${cx * (1 - k)} ${cy * (1 - k)}) scale(${k})`}>{children}</g>
  );

// キラッ (4方向の星)
const Spark: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> =
  ({ x, y, s = 1, t = 1, color = KRP.yellow }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * tt)})`} opacity={tt}>
        <path d="M 0 -26 Q 5 -5 26 0 Q 5 5 0 26 Q -5 5 -26 0 Q -5 -5 0 -26 Z"
          fill={color} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  };

// ジョッキ (禁酒運動のお酒マーク)
const BeerMug: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-56} y={-70} width={112} height={140} rx={14} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
    <path d="M 56 -34 Q 104 -30 104 6 Q 104 42 56 44" fill="none" stroke={KRP.ink} strokeWidth={9} />
    <line x1={-34} y1={-56} x2={-34} y2={56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
    <line x1={0} y1={-56} x2={0} y2={56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
    <line x1={34} y1={-56} x2={34} y2={56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
    {/* 泡 */}
    <ellipse cx={0} cy={-72} rx={60} ry={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={-36} cy={-84} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={10} cy={-92} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={46} cy={-82} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 切符 (ミシン目入り・観光という商品の記号)
const Ticket: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -8 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-88} y={-52} width={176} height={104} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
    <line x1={34} y1={-52} x2={34} y2={52} stroke={KRP.ink} strokeWidth={4} strokeDasharray="7 8" />
    <g stroke={KRP.ink} strokeWidth={5} opacity={0.6}>
      <line x1={-64} y1={-14} x2={10} y2={-14} />
      <line x1={-64} y1={10} x2={10} y2={10} />
    </g>
    <circle cx={60} cy={0} r={14} fill="none" stroke={KRP.red} strokeWidth={5} />
  </g>
);

// 金貨 (小さな支払いの記号)
const GoldCoin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 22 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={0} r={r} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={0} r={r * 0.62} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
  </g>
);

// 口実のミニ記号 (鳥居=信仰 / 本=教育 / 湯=療養)。#135 で空へ帰っていく用
const MiniKoujitsu: React.FC<{ kind: "torii" | "book" | "onsen" }> = ({ kind }) => {
  if (kind === "torii") {
    return (
      <g>
        <line x1={-26} y1={28} x2={-22} y2={-24} stroke={TKP.woodLight} strokeWidth={10} strokeLinecap="round" />
        <line x1={26} y1={28} x2={22} y2={-24} stroke={TKP.woodLight} strokeWidth={10} strokeLinecap="round" />
        <rect x={-36} y={-36} width={72} height={10} rx={2} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  }
  if (kind === "book") {
    return (
      <g>
        <path d="M -36 -20 Q -18 -29 0 -20 L 0 22 Q -18 13 -36 22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M 36 -20 Q 18 -29 0 -20 L 0 22 Q 18 13 36 22 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    );
  }
  return (
    <g>
      <path d="M -34 8 Q 0 28 34 8 L 28 26 Q 0 40 -28 26 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      <g fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
        <path d="M -16 0 Q -22 -12 -16 -24" />
        <path d="M 2 2 Q -4 -10 2 -22" />
        <path d="M 18 0 Q 12 -12 18 -24" />
      </g>
    </g>
  );
};

// =====================================================================
// 第5章 グランドツアー (#97〜#110)
// =====================================================================

// #97 一方そのころ、ヨーロッパ。= 地球儀が日本→ロンドンへ + 章扉
const SceneCh5Door: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <GlobeTravel f={f} from="japan" to="london" fromLabel="日本" toLabel="ロンドン" />
    <ChapterDoor num={5} title="口実その2 教育" t={seg(f, 26, 56)} left={90} top={620} width={560} />
    <TBadge />
  </AbsoluteFill>
);

// #98 こちらの口実は、信仰ではありませんでした。= 巡礼の貝にバツ → 「?」
const SceneNotFaith: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={601}>
    <EuroBg18c f={f} />
    <PopAt x={700} y={430} t={seg(f, 2, 22)}>
      <ScallopShell x={700} y={430} s={2.4} />
    </PopAt>
    <TagPlate x={640} y={672} text="巡礼のしるし" size={36} t={seg(f, 16, 32)} />
    <Xmark x={700} y={430} r={160} t={seg(f, 40, 54)} />
    {f >= 62 && (
      <text x={1330} y={560 + bobOf(f) * 2} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={300} fill={KRP.blueDeep} opacity={0.92}
        transform={`rotate(${Math.sin(f / 15) * 5} 1330 460)`}>?</text>
    )}
  </Frame>
);

// #99 17世紀イギリス貴族の「グランドツアー」= 馬車が走り込む + 英語題字
const SceneGtIntro: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={602}
    over={<>{f >= 10 && <Stamp x={110} y={140} text="17世紀" size={50} />}</>}>
    <EuroBg18c f={f} />
    <Carriage x={lerp(-380, 640, easeOut(seg(f, 0, 55)))} y={856} s={0.85} f={f} />
    <NobleSon x={1460} y={856} s={0.95} f={f} face="smile" gaze={[-4, 0]} />
    <g transform="translate(1060 260)">
      {seg(f, 52, 72) > 0 && (
        <g transform={`scale(${pop(seg(f, 52, 72))})`}>
          <rect x={-330} y={-62} width={660} height={124} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64}
            fill={KRP.ink} letterSpacing={3}>Grand Tour</text>
          <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26}
            fill={KRP.grayDark} letterSpacing={2}>— 貴族の卒業旅行 —</text>
        </g>
      )}
    </g>
  </Frame>
);

// グランドツアーの馬車位置 (GrandTourMap と同じ窓・同じタイミングで路線上を進む)
const GT_ROUTE: TabiSpot[] = ["london", "paris", "geneva", "venice", "florence", "rome"];
const gtCarriagePos = (f: number) => {
  const m = makeWmap(-14, 26, 35, 60, 240, 130, 1440, 800);
  const u = easeOut(seg(f, 12, 120)) * (GT_ROUTE.length - 1);
  const i = Math.min(Math.floor(u), GT_ROUTE.length - 2);
  const k = u - i;
  const a = TABI_SPOT[GT_ROUTE[i]], b = TABI_SPOT[GT_ROUTE[i + 1]];
  return { x: m.X(a.lon + (b.lon - a.lon) * k), y: m.Y(a.lat + (b.lat - a.lat) * k) };
};

// #100 息子を仏伊へ数か月〜数年 = 欧州地図を馬車が巡る
const SceneGtMap: React.FC<{ f: number }> = ({ f }) => {
  const p = gtCarriagePos(f);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <GrandTourMap f={f} caption="グランドツアーの道のり" />
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={603} />
        <g filter="url(#wobble)">
          <Carriage x={p.x} y={p.y - 52} s={0.36} f={f} />
        </g>
      </svg>
      <TBadge />
    </AbsoluteFill>
  );
};

// #101 名目は「教育の総仕上げ」= 同じ地図 (完走済み) + 本と月桂冠の紋章がぽん
const SceneGtMapMeimoku: React.FC<{ f: number }> = ({ f }) => {
  const p = gtCarriagePos(f + 130);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <GrandTourMap f={f + 130} />
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={604} />
        <g filter="url(#wobble)">
          {/* 到着済みの馬車はローマのピン右脇に停める (地名ラベルと重ねない) */}
          <Carriage x={p.x + 190} y={p.y - 6} s={0.36} f={f} />
          {/* 「教育」の紋章: 開いた本 + 月桂冠 (名目のきらびやかさ) */}
          {seg(f, 18, 42) > 0 && (
            <g transform={`translate(960 300) scale(${pop(seg(f, 18, 42))})`}>
              <circle cx={0} cy={0} r={118} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <path d="M -96 40 Q -120 -20 -78 -78 M 96 40 Q 120 -20 78 -78"
                fill="none" stroke={KRP.gold} strokeWidth={10} strokeLinecap="round" />
              {[-78, -52, -26].map((a, i) => (
                <g key={i}>
                  <ellipse cx={-100 + i * 9} cy={a + 84} rx={14} ry={7} fill={KRP.gold}
                    transform={`rotate(${-48 + i * 14} ${-100 + i * 9} ${a + 84})`} />
                  <ellipse cx={100 - i * 9} cy={a + 84} rx={14} ry={7} fill={KRP.gold}
                    transform={`rotate(${48 - i * 14} ${100 - i * 9} ${a + 84})`} />
                </g>
              ))}
              <g transform="scale(1.7)">
                <path d="M -42 -14 Q -20 -24 0 -14 L 0 26 Q -20 16 -42 26 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <path d="M 42 -14 Q 20 -24 0 -14 L 0 26 Q 20 16 42 26 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
              </g>
              <Spark x={92} y={-92} t={seg(f, 44, 58)} />
              <Spark x={-96} y={-70} s={0.8} t={seg(f, 52, 66)} />
            </g>
          )}
        </g>
      </svg>
      <TBadge />
    </AbsoluteFill>
  );
};

// #102 実態の多くは観光と買い物 (といわれる) = 息子のまわりに戦利品が増えていく
const SceneGtJittai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={605}>
    <EuroBg18c f={f} />
    <NobleSon x={620} y={860} s={1.0} f={f} face="smile" gaze={[4, 1]} />
    <PopAt x={1130} y={510} t={seg(f, 12, 32)}>
      <FramedPainting x={1130} y={510} s={1.0} />
    </PopAt>
    <PopAt x={1460} y={600} t={seg(f, 30, 50)}>
      <PrintSheet x={1460} y={600} s={0.85} rot={8} />
    </PopAt>
    {/* 包みの箱 */}
    <PopAt x={1230} y={780} t={seg(f, 48, 66)}>
      <g transform="translate(1230 780)">
        <rect x={-85} y={-55} width={170} height={110} rx={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-55} x2={0} y2={55} stroke={KRP.gold} strokeWidth={12} />
        <line x1={-85} y1={0} x2={85} y2={0} stroke={KRP.gold} strokeWidth={12} />
        <circle cx={0} cy={-58} r={16} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </PopAt>
    <Spark x={1010} y={400} t={seg(f, 60, 76)} />
    <Spark x={1580} y={460} s={0.8} t={seg(f, 70, 86)} />
  </Frame>
);

// #103 お目付け役の家庭教師が同行 = 買い物に伸びる息子を、めがねの先生がじっと見る
const SceneGtTutor: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={606}>
    <EuroBg18c f={f} />
    <PrintSheet x={400} y={620} s={0.75} rot={-6} />
    <NobleSon x={800} y={860} s={1.0} f={f} face="smile" gaze={[-5, 0]} />
    {/* 家庭教師: めがね + 渋い色 + 本を小わきに */}
    <Person x={1280} y={860} s={1.05} f={f} phase={2} glasses hair="none"
      cloth={KRP.grayDark} clothDark="#5E5650" face="worried" gaze={[-5, 0]} />
    <g transform={`translate(1190 ${720 + bobOf(f, 2)})`}>
      <rect x={-34} y={-24} width={68} height={48} rx={6} fill={TKP.terracotta} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={-34} y1={-10} x2={34} y2={-10} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
    </g>
    {/* 視線 (点線) */}
    {seg(f, 30, 55) > 0 && (
      <line x1={1218} y1={595} x2={lerp(1218, 880, seg(f, 30, 55))} y2={lerp(595, 620, seg(f, 30, 55))}
        stroke={KRP.red} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={0.8} />
    )}
    {f >= 60 && (
      <text x={1390} y={480} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={120} fill={KRP.red}>!</text>
    )}
  </Frame>
);

// #104 「観光」という言葉そのものが生まれた = 卵が割れて「観光」が誕生
const SceneKankoWord: React.FC<{ f: number }> = ({ f }) => {
  const crack = f >= 45;
  const openT = easeOut(seg(f, 45, 65));
  return (
    <Frame f={f} seed={607}>
      <g opacity={0.45}><EuroBg18c f={f} /></g>
      {/* 卵 (割れる前はぷるぷる) */}
      <g transform={`translate(960 600) rotate(${crack ? 0 : Math.sin(f / 4) * 3})`}>
        {/* 下半分 */}
        <path d="M -150 -20 Q -150 190 0 190 Q 150 190 150 -20 L 118 6 L 76 -22 L 38 8 L 0 -20 L -38 8 L -76 -22 L -118 6 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 上半分 (割れると浮き上がる) */}
        <g transform={`translate(${openT * 40} ${-openT * 230}) rotate(${openT * 24})`}>
          <path d="M -150 -20 Q -150 -230 0 -230 Q 150 -230 150 -20 L 118 6 L 76 -22 L 38 8 L 0 -20 L -38 8 L -76 -22 L -118 6 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* ヒビ (割れる前) */}
        {!crack && f >= 28 && (
          <path d="M -90 -10 L -52 -34 L -20 -6 L 18 -36 L 52 -8 L 92 -30"
            fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={seg(f, 28, 40)} />
        )}
      </g>
      {/* 中から「観光」 */}
      <TagPlate x={960} y={lerp(600, 380, easeOut(seg(f, 48, 70)))} text="観光" size={88}
        t={seg(f, 48, 66)} color={KRP.red} />
      <Burst x={960} y={400} r={230} t={seg(f, 60, 80)} n={14} />
      <Spark x={660} y={300} t={seg(f, 72, 86)} />
      <Spark x={1270} y={330} s={0.8} t={seg(f, 78, 92)} />
    </Frame>
  );
};

// #105 tourist の英語初出 1772年 = 辞書に tourist が書き込まれる
const SceneTourist1772: React.FC<{ f: number }> = ({ f }) => {
  const writeT = easeOut(seg(f, 22, 56));
  return (
    <Frame f={f} seed={608}
      over={<>{f >= 60 && <Stamp x={1230} y={170} text="初出 1772年" size={54} />}</>}>
      <g opacity={0.4}><EuroBg18c f={f} /></g>
      {/* 開いた辞書 */}
      <PopAt x={900} y={560} t={seg(f, 0, 20)}>
        <g transform="translate(900 560)">
          <path d="M -420 -190 Q -210 -240 0 -190 L 0 210 Q -210 160 -420 210 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 420 -190 Q 210 -240 0 -190 L 0 210 Q 210 160 420 210 Z"
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.4}>
            <path d="M -360 -120 Q -210 -160 -60 -120" fill="none" />
            <path d="M -360 -60 Q -210 -100 -60 -60" fill="none" />
            <path d="M -360 0 Q -210 -40 -60 0" fill="none" />
            <path d="M -360 60 Q -210 20 -60 60" fill="none" />
            <path d="M -360 120 Q -210 80 -60 120" fill="none" />
            <path d="M 60 60 Q 210 20 360 60" fill="none" />
            <path d="M 60 120 Q 210 80 360 120" fill="none" />
          </g>
          {/* 右ページに tourist が書かれていく */}
          <g opacity={writeT > 0 ? 1 : 0}>
            <clipPath id="tb3write">
              <rect x={56} y={-160} width={360 * writeT} height={160} />
            </clipPath>
            <g clipPath="url(#tb3write)">
              <text x={70} y={-50} fontFamily={FONT} fontWeight={900} fontSize={82} fill={KRP.ink}
                letterSpacing={2}>tourist</text>
            </g>
            <line x1={66} y1={-24} x2={66 + 330 * writeT} y2={-24} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
          </g>
        </g>
      </PopAt>
      {/* 羽根ペン (書く位置を追いかける) */}
      {f >= 20 && (
        <g transform={`translate(${966 + 330 * writeT} ${500 + Math.sin(f / 3) * (writeT < 1 ? 6 : 0)}) rotate(-28)`}>
          <path d="M 0 0 Q 26 -70 12 -150 Q 46 -92 34 -16 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={0} x2={-10} y2={26} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
    </Frame>
  );
};

// #106 souvenir はフランス語「思い出す」から = 言葉カードから思い出の吹き出し
const SceneSouvenir: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={609}>
    <g opacity={0.4}><EuroBg18c f={f} /></g>
    {/* souvenir カード (トリコロールの耳付き) */}
    <PopAt x={760} y={700} t={seg(f, 0, 20)}>
      <g transform="translate(760 700)">
        <rect x={-270} y={-75} width={540} height={150} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-270} y={-75} width={26} height={150} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-244} y={-75} width={26} height={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-218} y={-75} width={26} height={150} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <text x={30} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74}
          fill={KRP.ink} letterSpacing={2}>souvenir</text>
      </g>
    </PopAt>
    {/* 思い出の吹き出し (まる → まる → 大きな雲) */}
    <PopAt x={1120} y={560} t={seg(f, 26, 38)}>
      <circle cx={1120} cy={560} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    </PopAt>
    <PopAt x={1200} y={470} t={seg(f, 36, 48)}>
      <circle cx={1200} cy={470} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    </PopAt>
    <PopAt x={1330} y={300} t={seg(f, 46, 64)}>
      <g transform={`translate(1330 ${300 + bobOf(f) * 1.5})`}>
        <ellipse cx={0} cy={0} rx={270} ry={160} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 雲の中: 旅の風景 (丘 + 糸杉 + 太陽) */}
        <path d="M -210 70 Q -60 -30 210 60" fill="none" stroke={TKP.tuscany} strokeWidth={46} strokeLinecap="round" />
        <path d="M -60 40 C -78 10 -80 -40 -60 -86 C -40 -40 -42 10 -60 40 Z" fill={TKP.cypress} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 30 48 C 16 24 14 -14 30 -50 C 46 -14 44 24 30 48 Z" fill={TKP.cypress} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={150} cy={-70} r={30} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    </PopAt>
    <Spark x={1620} y={420} s={0.9} t={seg(f, 68, 82)} />
  </Frame>
);

// #107 お土産市場もしっかりあった = 露店に絵と版画がならぶ
const SceneGtMarket: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={610}>
    <EuroBg18c f={f} />
    {/* 露店: しましま屋根 + 台 */}
    <g transform="translate(860 0)">
      <line x1={-330} y1={760} x2={-330} y2={380} stroke={TKP.woodDark} strokeWidth={14} />
      <line x1={330} y1={760} x2={330} y2={380} stroke={TKP.woodDark} strokeWidth={14} />
      <path d="M -380 400 L 380 400 L 340 300 L -340 300 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[-300, -180, -60, 60, 180, 300].map((sx, i) => (
        <path key={i} d={`M ${sx - 36} 398 L ${sx + 4} 302 L ${sx + 44} 302 L ${sx + 4} 398 Z`}
          fill={i % 2 ? KRP.red : KRP.white} opacity={0.9} />
      ))}
      <path d="M -380 400 L 380 400 L 340 300 L -340 300 Z" fill="none" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-360} y={640} width={720} height={120} rx={10} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
    </g>
    {/* 台にならぶ商品 */}
    <PopAt x={700} y={560} t={seg(f, 14, 30)}>
      <FramedPainting x={700} y={560} s={0.72} />
    </PopAt>
    <PopAt x={930} y={566} t={seg(f, 26, 42)}>
      <PrintSheet x={930} y={566} s={0.6} rot={-5} />
    </PopAt>
    <PopAt x={1120} y={580} t={seg(f, 38, 54)}>
      <g transform="translate(1120 580)">
        {/* 小さな胸像 (大理石の土産) */}
        <path d="M -40 60 L 40 60 L 30 24 L -30 24 Z" fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -26 24 Q -30 -18 0 -22 Q 30 -18 26 24 Z" fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-38} r={24} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </PopAt>
    {/* 売り子と客 */}
    <Person x={560} y={700} s={0.66} f={f} phase={1} hair="cap" cloth={TKP.terracotta} clothDark="#A04E30" face="smile" gaze={[4, 0]} />
    <NobleSon x={1400} y={870} s={0.95} f={f} face="smile" gaze={[-5, -1]} />
    {/* 客のコインが台へ */}
    {seg(f, 58, 78) > 0 && (
      <GoldCoin
        x={lerp(1320, 1140, easeOut(seg(f, 58, 78)))}
        y={660 - Math.sin(seg(f, 58, 78) * Math.PI) * 120} />
    )}
  </Frame>
);

// #108 お金持ちはカナレットの風景画・お手頃派はピラネージの版画 = 左右見くらべ + 金貨の数
const SceneCanalettoPiranesi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={611}>
    <g opacity={0.4}><EuroBg18c f={f} /></g>
    <PopAt x={540} y={430} t={seg(f, 4, 24)}>
      <FramedPainting x={540} y={430} s={1.5} />
    </PopAt>
    <PopAt x={1380} y={430} t={seg(f, 18, 38)}>
      <PrintSheet x={1380} y={430} s={1.25} rot={3} />
    </PopAt>
    {/* 値段のちがいは金貨の山で (左=たくさん / 右=1枚) */}
    {[0, 1, 2, 3, 4].map((i) => (
      seg(f, 44 + i * 6, 52 + i * 6) > 0 && (
        <g key={i} opacity={pop(seg(f, 44 + i * 6, 52 + i * 6))}>
          <ellipse cx={540 + (i % 2 ? 14 : -10)} cy={750 - i * 22} rx={52} ry={18}
            fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )
    ))}
    {seg(f, 58, 68) > 0 && (
      <g opacity={pop(seg(f, 58, 68))}>
        <ellipse cx={1380} cy={744} rx={52} ry={18} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
      </g>
    )}
    {/* まんなかの「くらべる」記号 */}
    <TagPlate x={960} y={430} text="くらべ" size={34} t={seg(f, 34, 48)} fill={KRP.yellow} />
  </Frame>
);

// #109 高級土産と絵はがきの関係はこのころから = 上 (当時) から下 (いま) へ矢印
const SceneMiyagePair: React.FC<{ f: number }> = ({ f }) => {
  const Arrow: React.FC<{ x: number; t: number }> = ({ x, t }) => {
    const tt = easeOut(clamp01(t));
    if (tt <= 0) return null;
    return (
      <g opacity={tt}>
        <line x1={x} y1={470} x2={x} y2={470 + 90 * tt} stroke={KRP.orange} strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${x - 26} ${540 + 30 * tt} L ${x} ${574 + 30 * tt} L ${x + 26} ${540 + 30 * tt}`}
          fill="none" stroke={KRP.orange} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <Frame f={f} seed={612}>
      {/* 上段: 当時 */}
      <FramedPainting x={540} y={320} s={0.85} />
      <PrintSheet x={1380} y={320} s={0.72} rot={-3} />
      <Arrow x={540} t={seg(f, 24, 46)} />
      <Arrow x={1380} t={seg(f, 34, 56)} />
      {/* 下段: いまの高級土産 (リボンの箱) と絵はがき */}
      <PopAt x={540} y={760} t={seg(f, 48, 66)}>
        <g transform="translate(540 760)">
          <rect x={-110} y={-70} width={220} height={140} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={-70} x2={0} y2={70} stroke={KRP.gold} strokeWidth={14} />
          <line x1={-110} y1={0} x2={110} y2={0} stroke={KRP.gold} strokeWidth={14} />
          <path d="M 0 -74 Q -40 -110 -14 -120 Q 2 -124 0 -92 Q -2 -124 14 -120 Q 40 -110 0 -74 Z"
            fill={KRP.gold} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </PopAt>
      <PopAt x={1380} y={760} t={seg(f, 58, 76)}>
        <g transform="translate(1380 760) rotate(-4)">
          <rect x={-150} y={-95} width={300} height={190} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {/* 左半分: 風景スケッチ */}
          <path d="M -130 40 L -82 -28 L -44 24 L -12 -12 L 10 40 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-26} cy={-50} r={16} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          {/* 右半分: 切手 + 宛名線 */}
          <rect x={86} y={-78} width={48} height={56} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} strokeDasharray="5 4" />
          <line x1={40} y1={16} x2={132} y2={16} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
          <line x1={40} y1={46} x2={132} y2={46} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
          <line x1={34} y1={-90} x2={34} y2={90} stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
        </g>
      </PopAt>
      <Spark x={960} y={620} t={seg(f, 76, 90)} />
    </Frame>
  );
};

// #110 教育という口実と思い出という言い訳のセット = 口実の路線図 (2駅目が開通)
const SceneKoujitsu2: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={613} caption="口実の路線図">
    <KoujitsuRoute x={1060} y={560} s={1.15} f={f} count={2} />
    {/* つづきの気配 (点線 + ?) */}
    {f >= 70 && (
      <g opacity={seg(f, 70, 90)}>
        <line x1={1270} y1={560} x2={1560} y2={560} stroke={KRP.grayDark} strokeWidth={10}
          strokeDasharray="4 26" strokeLinecap="round" />
        <text x={1640} y={585} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={76} fill={KRP.grayDark}>?</text>
      </g>
    )}
  </Frame>
);

// =====================================================================
// 第6章 湯治 (#111〜#122)
// =====================================================================

// #111 口実は、まだあります。= 温泉の里 + 章扉 (口実その3 療養)
const SceneCh6Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={614}
    over={<ChapterDoor num={6} title="口実その3 療養" t={seg(f, 24, 54)} />}>
    <OnsenBg f={f} />
    <Rotenburo x={470} y={790} s={1.05} f={f} />
    {/* 既出の口実2つ + 「まだある?」の札 */}
    <PopAt x={420} y={270} t={seg(f, 2, 20)}>
      <g transform="translate(420 270)">
        <rect x={-230} y={-78} width={460} height={156} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(-130 6) scale(1.2)"><MiniKoujitsu kind="torii" /></g>
        <g transform="translate(0 6) scale(1.2)"><MiniKoujitsu kind="book" /></g>
        {f >= 40 && (
          <text x={128} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={84} fill={KRP.orange} opacity={seg(f, 40, 56)}
            transform={`rotate(${Math.sin(f / 14) * 6} 128 0)`}>?</text>
        )}
      </g>
    </PopAt>
  </Frame>
);

// #112 3つめの口実「療養」= 信仰・教育の札に続いて3枚目がぽん
const SceneRyoyoPlate: React.FC<{ f: number }> = ({ f }) => {
  const Card: React.FC<{ x: number; kind: "torii" | "book" | "onsen"; label: string; isNew?: boolean; t?: number; ph?: number }> =
    ({ x, kind, label, isNew = false, t = 1, ph = 0 }) => {
      const sc = pop(clamp01(t));
      if (sc <= 0) return null;
      return (
        <g transform={`translate(${x} ${540 + bobOf(f, ph)}) scale(${sc})`}>
          <rect x={-135} y={-185} width={270} height={370} rx={18}
            fill={isNew ? KRP.white : KRP.cream} stroke={isNew ? KRP.orange : KRP.ink}
            strokeWidth={isNew ? 9 : 6} />
          <g transform="translate(0 -60) scale(1.9)"><MiniKoujitsu kind={kind} /></g>
          <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={52} fill={isNew ? KRP.red : KRP.ink}>{label}</text>
        </g>
      );
    };
  return (
    <Frame f={f} seed={615}
      over={<>{f >= 8 && <Stamp x={130} y={140} text="その3" size={48} />}</>}>
      <Card x={520} kind="torii" label="信仰" ph={0} />
      <Card x={960} kind="book" label="教育" ph={1} />
      <Card x={1400} kind="onsen" label="療養" isNew t={seg(f, 30, 54)} ph={2} />
      <Burst x={1400} y={340} r={90} t={seg(f, 50, 66)} />
    </Frame>
  );
};

// #113 江戸の庶民に公認の旅=湯治 = 湯宿へ歩み入る旅人
const SceneToujiIntro: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={616}>
    <OnsenBg f={f} />
    <YuYado x={1300} y={944} s={1.15} />
    <EdoTraveler x={lerp(-180, 760, easeOut(seg(f, 0, 60)))} y={944} s={1.0} f={f} face="smile" />
    <TagPlate x={430} y={280} text="湯治" size={52} t={seg(f, 54, 72)} />
  </Frame>
);

// #114 温泉に入って治す旅 = 露天風呂につかる人 + 疲れが消えてキラッ
const SceneRotenburoHeal: React.FC<{ f: number }> = ({ f }) => {
  const fade = 1 - seg(f, 34, 64);
  return (
    <Frame f={f} seed={617}>
      <OnsenBg f={f} />
      {/* 人を先に描き、湯船で下半身を隠す (つかっている図) */}
      <YukataPerson x={960} y={770} s={0.92} f={f} face="smile" />
      <Rotenburo x={960} y={706} s={1.35} f={f} />
      {/* 頭上の「疲れ」ぐるぐるが消えていく */}
      {fade > 0 && (
        <g opacity={fade} transform="translate(960 360)">
          <path d="M -40 0 Q -52 -34 -18 -36 Q -4 -58 22 -44 Q 52 -46 46 -14 Q 60 10 30 16 Q 8 34 -14 18 Q -46 24 -40 0 Z"
            fill="none" stroke={KRP.grayDark} strokeWidth={7} />
          <path d="M -14 -10 Q 2 -22 14 -8 M -8 4 Q 4 -4 12 6" fill="none" stroke={KRP.grayDark} strokeWidth={5} />
        </g>
      )}
      <Spark x={790} y={430} t={seg(f, 62, 76)} />
      <Spark x={1130} y={390} s={0.8} t={seg(f, 70, 84)} />
      <Spark x={980} y={320} s={0.65} t={seg(f, 78, 92)} />
    </Frame>
  );
};

// #115 滞在の単位は一廻り=7日 = こよみに7つの判がぽんぽん押される
const SceneHitomeguri: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={618}
    over={<>{f >= 74 && <Stamp x={1560} y={300} text="7日" size={72} />}</>}>
    <g transform={`translate(960 ${560 + bobOf(f)})`}>
      <rect x={-430} y={-220} width={860} height={440} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-430} y={-220} width={860} height={92} rx={20} fill={KRP.blueDeep} opacity={0.9} />
      <text x={0} y={-156} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48}
        fill={KRP.white} letterSpacing={6}>一廻り</text>
      {Array.from({ length: 7 }, (_, i) => {
        const cx = -360 + i * 120;
        const t = seg(f, 10 + i * 8, 24 + i * 8);
        return (
          <g key={i}>
            <rect x={cx - 48} y={-60} width={96} height={170} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={cx} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
              fill={KRP.grayDark}>{i + 1}</text>
            {t > 0 && (
              <circle cx={cx} cy={52} r={30 * pop(t)} fill="none" stroke={KRP.red} strokeWidth={7} opacity={0.9} />
            )}
          </g>
        );
      })}
    </g>
  </Frame>
);

// #116 しっかり治すなら三廻り=21日 = 7日のこよみが3枚そろって合計21日
const SceneMimeguri: React.FC<{ f: number }> = ({ f }) => {
  const MiniCal: React.FC<{ x: number; t: number; ph: number }> = ({ x, t, ph }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${430 + bobOf(f, ph)}) scale(${sc})`}>
        <rect x={-190} y={-130} width={380} height={260} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-190} y={-130} width={380} height={58} rx={16} fill={KRP.blueDeep} opacity={0.9} />
        <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32}
          fill={KRP.white} letterSpacing={4}>一廻り 7日</text>
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={-156 + i * 52} cy={40} r={20} fill="none" stroke={KRP.red} strokeWidth={5} />
        ))}
      </g>
    );
  };
  return (
    <Frame f={f} seed={619}>
      <MiniCal x={500} t={seg(f, 4, 22)} ph={0} />
      <MiniCal x={960} t={seg(f, 20, 38)} ph={1} />
      <MiniCal x={1420} t={seg(f, 36, 54)} ph={2} />
      {[730, 1190].map((x, i) => (
        seg(f, 20 + i * 16, 36 + i * 16) > 0 ? (
          <text key={i} x={x} y={452} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={72} fill={KRP.ink} opacity={seg(f, 20 + i * 16, 36 + i * 16)}>+</text>
        ) : null
      ))}
      {/* まとめの帯 → 21日のどん */}
      {seg(f, 58, 74) > 0 && (
        <g opacity={seg(f, 58, 74)}>
          <path d="M 320 600 L 320 640 L 1600 640 L 1600 600" fill="none" stroke={KRP.ink} strokeWidth={7} />
          <line x1={960} y1={640} x2={960} y2={672} stroke={KRP.ink} strokeWidth={7} />
        </g>
      )}
      {seg(f, 70, 90) > 0 && (
        <g transform={`translate(960 760) scale(${pop(seg(f, 70, 90))}) rotate(-4)`}>
          <rect x={-240} y={-66} width={480} height={132} rx={14} fill="none" stroke={KRP.red} strokeWidth={10} />
          <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72}
            fill={KRP.red}>三廻り 21日</text>
        </g>
      )}
    </Frame>
  );
};

// #117 温泉の番付表まで作られた = 温泉街に番付がどん + 見上げる人々
const SceneBanzuke: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={620}>
    <OnsenBg f={f} />
    <PopAt x={960} y={470} t={seg(f, 10, 34)}>
      <OnsenBanzuke x={960} y={470} s={1.8} />
    </PopAt>
    <Burst x={960} y={180} r={80} t={seg(f, 30, 46)} />
    <Person x={520} y={1020} s={0.88} f={f} phase={0} face="surprised" gaze={[4, -5]} cloth={TKP.noren} clothDark={KRP.white} hair="none" />
    <Person x={1400} y={1020} s={0.88} f={f} phase={1} face="smile" gaze={[-4, -5]} cloth={KRP.green} clothDark={KRP.white} hair="none" />
  </Frame>
);

// #118 相撲の番付そっくりに東西の名湯 = 番付へぐっと寄って 草津/有馬
const SceneBanzukeZoom: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.22, easeOut(seg(f, 0, 46)));
  return (
    <Frame f={f} seed={621}
      over={<>
        {f >= 40 && <LabelPill x={330} y={386} centerX text="東の大関 草津" size={34} />}
        {f >= 56 && <LabelPill x={1590} y={386} centerX text="西の大関 有馬" size={34} />}
      </>}>
      <Cam k={k}>
        <OnsenBanzuke x={960} y={540} s={2.2} />
      </Cam>
      {/* 引き出し線 (札 → 番付の東西の筆頭行) */}
      {f >= 44 && (
        <line x1={480} y1={420} x2={852 + (960 - 852) * (1 - k)} y2={460} stroke={KRP.red} strokeWidth={6} opacity={0.85} />
      )}
      {f >= 60 && (
        <line x1={1440} y1={420} x2={1068 + (960 - 1068) * (1 - k)} y2={460} stroke={KRP.red} strokeWidth={6} opacity={0.85} />
      )}
      <Spark x={620} y={250} t={seg(f, 66, 80)} s={0.8} />
      <Spark x={1320} y={230} t={seg(f, 74, 88)} s={0.7} />
    </Frame>
  );
};

// #119 旅人のカバンには頼れる一冊 = 風呂敷包みから本がせり上がる
const SceneKabanBook: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 28, 66));
  return (
    <Frame f={f} seed={622}>
      <EdoTraveler x={640} y={960} s={1.1} f={f} face="surprised" />
      {/* 本 (包みの後ろからせり上がる) */}
      <g opacity={seg(f, 28, 42)}>
        <YoujinshuBook x={1240} y={lerp(830, 540, rise)} s={1.15} rot={Math.sin(f / 16) * 4} />
      </g>
      {/* 風呂敷包み (大きな結び目つき) */}
      <g transform="translate(1240 830)">
        <path d="M -200 90 Q -210 -40 0 -64 Q 210 -40 200 90 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -34 -64 Q -50 -112 -12 -104 Q 0 -124 14 -104 Q 52 -112 34 -64 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -120 -20 Q 0 6 120 -20" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
      </g>
      {/* 旅人の視線 (点線) */}
      {f >= 48 && (
        <line x1={760} y1={700} x2={1090} y2={560} stroke={KRP.red} strokeWidth={5}
          strokeDasharray="4 16" strokeLinecap="round" opacity={seg(f, 48, 62)} />
      )}
      <Spark x={1420} y={420} t={seg(f, 64, 80)} />
    </Frame>
  );
};

// #120 『旅行用心集』1810年 = 本がどんと正面 + 年号の判
const SceneYoujinshu1810: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={623}
    over={<>{f >= 46 && <Stamp x={1480} y={250} text="1810年" size={58} />}</>}>
    {/* 集中線 (主役を立てる) */}
    <g opacity={0.3}>
      <Burst x={960} y={560} r={430} color={KRP.grayDark} t={seg(f, 8, 30)} n={14} />
    </g>
    <PopAt x={960} y={560} t={seg(f, 6, 30)}>
      <YoujinshuBook x={960} y={560} s={2.1} rot={Math.sin(f / 18) * 2} />
    </PopAt>
    <Spark x={700} y={320} t={seg(f, 34, 48)} />
    <Spark x={1230} y={760} s={0.8} t={seg(f, 42, 56)} />
  </Frame>
);

// #121 道のり・料金・効能・心得61か条 = 開いた本から中身が順にぽん
const SceneYoujinshuNakami: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={624}
    over={<>{f >= 70 && <Stamp x={1560} y={270} text="61か条" size={50} />}</>}>
    {/* 開いた和本 */}
    <g transform={`translate(960 ${620 + bobOf(f)})`}>
      <path d="M -520 -180 Q -260 -236 0 -180 L 0 190 Q -260 134 -520 190 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 520 -180 Q 260 -236 0 -180 L 0 190 Q 260 134 520 190 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
      <line x1={0} y1={-180} x2={0} y2={190} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      {/* ① 道のり: くねくね道 + 旗 */}
      <PopAt x={-360} y={-20} t={seg(f, 14, 30)}>
        <g transform="translate(-360 -20)">
          <path d="M -80 70 Q -30 20 10 50 Q 60 80 86 10 Q 100 -30 70 -62" fill="none"
            stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" strokeDasharray="22 14" />
          <line x1={70} y1={-62} x2={70} y2={-112} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 70 -112 L 116 -98 L 70 -84 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </PopAt>
      {/* ② 料金: 小判がちゃりん */}
      <PopAt x={-150} y={10} t={seg(f, 30, 46)}>
        <g transform="translate(-150 10)">
          <GoldCoin x={-20} y={30} r={30} />
          <GoldCoin x={16} y={6} r={30} />
          <GoldCoin x={-8} y={-22} r={30} />
        </g>
      </PopAt>
      {/* ③ 温泉の効能: 湯けむりマーク */}
      <PopAt x={170} y={0} t={seg(f, 46, 62)}>
        <g transform="translate(170 0) scale(1.7)"><MiniKoujitsu kind="onsen" /></g>
      </PopAt>
      {/* ④ 心得: 巻物 (61か条は判で) */}
      <PopAt x={380} y={0} t={seg(f, 62, 78)}>
        <g transform="translate(380 0)">
          <rect x={-78} y={-66} width={156} height={132} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <circle cx={-78} cy={0} r={16} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={78} cy={0} r={16} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {[-36, -12, 12, 36].map((ly, i) => (
            <line key={i} x1={-50} y1={ly} x2={50} y2={ly} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
          ))}
        </g>
      </PopAt>
    </g>
  </Frame>
);

// #122 「信仰」「教育」「療養」出そろった = 口実の路線図 (3駅目が開通)
const SceneKoujitsu3: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={625} caption="口実の路線図">
    <KoujitsuRoute x={960} y={560} s={1.15} f={f} count={3} />
    {f >= 70 && (
      <g opacity={seg(f, 70, 90)}>
        <line x1={1420} y1={560} x2={1680} y2={560} stroke={KRP.grayDark} strokeWidth={10}
          strokeDasharray="4 26" strokeLinecap="round" />
        <text x={1760} y={585} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={76} fill={KRP.grayDark}>?</text>
      </g>
    )}
  </Frame>
);

// =====================================================================
// 第7章 鉄道と観光の誕生 (#123〜#138)
// =====================================================================

// #123 19世紀、旅を一変させる発明 = 英国駅舎へ機関車が走り込む + 章扉
const SceneCh7Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={626}
    over={<>
      {f >= 8 && <Stamp x={120} y={140} text="19世紀" size={50} />}
      <ChapterDoor num={7} title="旅が商品になる" t={seg(f, 30, 60)} />
    </>}>
    <BritStationBg f={f} />
    <SteamLoco x={lerp(-520, 580, easeOut(seg(f, 0, 58)))} y={880} s={1.05} f={f} />
  </Frame>
);

// #124 蒸気機関車、鉄道です = 走る機関車にぐっと寄る (流れる電柱 + スピード線)
const SceneLocoDebut: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.14, easeOut(seg(f, 20, 80)));
  return (
    <Frame f={f} seed={627}>
      <Cam k={k} cy={640}>
        {/* 流れる景色 (電柱が右→左へ) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((i * 480 - f * 14) % 2400 + 2400) % 2400 - 240;
          return (
            <g key={i} opacity={0.5}>
              <line x1={x} y1={940} x2={x} y2={430} stroke={TKP.woodDark} strokeWidth={13} />
              <line x1={x - 56} y1={480} x2={x + 56} y2={480} stroke={TKP.woodDark} strokeWidth={9} />
            </g>
          );
        })}
        {/* 線路 */}
        <line x1={-20} y1={944} x2={1940} y2={944} stroke={KRP.ink} strokeWidth={10} />
        {Array.from({ length: 13 }, (_, i) => {
          const x = ((i * 160 - f * 14) % 2080 + 2080) % 2080 - 80;
          return <line key={i} x1={x} y1={944} x2={x + 80} y2={958} stroke={KRP.ink} strokeWidth={6} opacity={0.5} />;
        })}
        <SteamLoco x={880} y={880} s={1.5} f={f} />
        {/* スピード線 */}
        {[520, 640, 760].map((y, i) => (
          <line key={i} x1={1560 + i * 40} y1={y} x2={1860 + i * 30} y2={y}
            stroke={KRP.grayDark} strokeWidth={9} strokeLinecap="round"
            opacity={0.35 + 0.3 * Math.abs(Math.sin((f + i * 9) / 7))} />
        ))}
      </Cam>
    </Frame>
  );
};

// #125 1841年7月5日、イギリスで事件 = 日めくりがどん + びっくり
const Scene1841: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={628} caption="ところは イギリス">
    <BritStationBg f={f} />
    <PopAt x={960} y={560} t={seg(f, 10, 34)}>
      <g transform={`translate(960 ${560 + bobOf(f)})`}>
        <rect x={-270} y={-260} width={540} height={520} rx={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-270} y={-260} width={540} height={120} rx={22} fill={KRP.red} opacity={0.92} />
        <circle cx={-110} cy={-258} r={16} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={110} cy={-258} r={16} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={-172} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62}
          fill={KRP.white} letterSpacing={4}>1841年</text>
        <text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150}
          fill={KRP.ink}>7/5</text>
        <text x={0} y={196} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40}
          fill={KRP.grayDark}>月曜日</text>
      </g>
    </PopAt>
    <Burst x={960} y={250} r={110} t={seg(f, 32, 48)} />
    {f >= 50 && (
      <text x={1430} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={200}
        fill={KRP.red} opacity={seg(f, 50, 64)} transform={`rotate(${8 + Math.sin(f / 11) * 3} 1430 360)`}>!</text>
    )}
  </Frame>
);

// #126 トマス・クックが約500人を列車に = 乗り込む行列 + 人数の判
const SceneCook500: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={629}
    over={<>{f >= 60 && <Stamp x={1560} y={260} text="約500人" size={54} />}</>}>
    <BritStationBg f={f} />
    <SteamLoco x={400} y={880} s={0.95} f={f} run={false} />
    {/* 行列 (右からぞろぞろ乗り込む) */}
    {[0, 1, 2, 3, 4].map((i) => {
      const t = easeOut(seg(f, 4 + i * 7, 58 + i * 7));
      const x = lerp(1250 + i * 170, 700 + i * 120, t);
      const cloths = [KRP.green, TKP.noren, KRP.orange, KRP.blueDeep, KRP.gray];
      return (
        <Person key={i} x={x} y={1000} s={0.78} f={f} phase={i} face="smile"
          gaze={[-4, 0]} cloth={cloths[i]} clothDark={KRP.white} hair="none" />
      );
    })}
    {/* クック氏 (シルクハットで案内) */}
    <VictorianGent x={1700} y={1010} s={0.95} f={f} face="smile" gaze={[-5, 0]} />
  </Frame>
);

// #127 目的は禁酒運動の集会 = 「禁酒のつどい」の垂れ幕 + ジョッキにバツ
const SceneKinshu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={630}>
    <BritStationBg f={f} />
    {/* 垂れ幕 (上から降りてくる) */}
    <g transform={`translate(960 ${lerp(-200, 300, easeOut(seg(f, 4, 30)))})`}>
      <line x1={-430} y1={-160} x2={-430} y2={-64} stroke={KRP.ink} strokeWidth={6} />
      <line x1={430} y1={-160} x2={430} y2={-64} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-470} y={-64} width={940} height={128} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66}
        fill={KRP.ink} letterSpacing={10}>禁酒のつどい</text>
    </g>
    <PopAt x={700} y={660} t={seg(f, 26, 44)}>
      <BeerMug x={700} y={660} s={1.15} />
    </PopAt>
    <Xmark x={700} y={650} r={150} t={seg(f, 48, 62)} />
    <Burst x={700} y={650} r={190} t={seg(f, 58, 72)} />
    {/* 聴衆 (うなずく人々) */}
    <Person x={1240} y={1020} s={0.8} f={f} phase={0} face="normal" gaze={[-4, -3]} cloth={KRP.grayDark} clothDark={KRP.white} hair="none" />
    <Person x={1480} y={1030} s={0.8} f={f} phase={1} face="smile" gaze={[-5, -3]} cloth={TKP.iron} clothDark={KRP.white} hair="none" />
    <Person x={1700} y={1020} s={0.8} f={f} phase={2} face="normal" gaze={[-5, -3]} cloth={KRP.green} clothDark={KRP.white} hair="none" />
  </Frame>
);

// #128 料金はひとり1シリング = 硬貨と切符の等式
const SceneShilling: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={631}>
    <PopAt x={760} y={520} t={seg(f, 6, 28)}>
      <g transform={`translate(0 ${bobOf(f)})`}><ShillingCoin x={760} y={520} s={2.3} /></g>
    </PopAt>
    {f >= 34 && (
      <text x={1070} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}
        fill={KRP.ink} opacity={seg(f, 34, 48)}>=</text>
    )}
    <PopAt x={1400} y={520} t={seg(f, 46, 66)}>
      <g transform={`translate(0 ${bobOf(f, 1)})`}><Ticket x={1400} y={520} s={1.5} /></g>
    </PopAt>
    <Spark x={1560} y={380} t={seg(f, 66, 80)} />
    {/* 団体のなかまたち (下にちいさく並ぶ) */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} opacity={seg(f, 60 + i * 5, 72 + i * 5)}>
        <circle cx={700 + i * 130} cy={790} r={34} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${660 + i * 130} 862 Q ${700 + i * 130} 816 ${740 + i * 130} 862`}
          fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
  </Frame>
);

// #129 禁酒運動が旅行業の原点に = ジョッキ(バツ) → 矢印 → 切符が輝く
const SceneGenten: React.FC<{ f: number }> = ({ f }) => {
  const aw = easeOut(seg(f, 24, 48));
  return (
    <Frame f={f} seed={632}>
      <BeerMug x={470} y={560} s={1.1} />
      <Xmark x={470} y={550} r={140} t={1} />
      {aw > 0 && (
        <g opacity={Math.min(1, aw * 2)}>
          <line x1={680} y1={550} x2={680 + 330 * aw} y2={550} stroke={KRP.orange} strokeWidth={22} strokeLinecap="round" />
          <path d={`M ${680 + 330 * aw} 550 l -44 -34 M ${680 + 330 * aw} 550 l -44 34`}
            fill="none" stroke={KRP.orange} strokeWidth={22} strokeLinecap="round" />
        </g>
      )}
      <PopAt x={1400} y={540} t={seg(f, 50, 70)}>
        <g transform={`translate(0 ${bobOf(f)})`}><Ticket x={1400} y={540} s={1.7} /></g>
      </PopAt>
      <Burst x={1400} y={540} r={220} t={seg(f, 64, 80)} />
      <Spark x={1620} y={380} t={seg(f, 74, 88)} />
      <Spark x={1200} y={330} s={0.8} t={seg(f, 80, 94)} />
    </Frame>
  );
};

// #130 クックはこれを商売に育てる = クック氏が切符の木を育てる
const SceneSodateru: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 10, 70));
  return (
    <Frame f={f} seed={633}>
      {/* 地面 */}
      <rect x={-20} y={960} width={W + 40} height={140} fill={KRP.floor} opacity={0.9} />
      <line x1={-20} y1={960} x2={W + 20} y2={960} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
      <VictorianGent x={540} y={960} s={1.05} f={f} face="smile" gaze={[5, -3]} />
      {/* じょうろ */}
      <g transform={`translate(760 ${640 + bobOf(f)}) rotate(${22 + Math.sin(f / 9) * 5})`}>
        <rect x={-66} y={-44} width={132} height={88} rx={16} fill={TKP.iron} stroke={KRP.ink} strokeWidth={6} />
        <line x1={66} y1={-20} x2={126} y2={-56} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
        <circle cx={132} cy={-60} r={15} fill={TKP.iron} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={930 + i * 14} cy={700 + ((f * 7 + i * 44) % 160)} r={7}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
      ))}
      {/* 切符の木 (茎が伸びて切符の葉がぽんぽん) */}
      <g transform="translate(1180 960)">
        <path d={`M 0 0 C -24 ${-140 * grow} 26 ${-260 * grow} -6 ${-420 * grow}`}
          fill="none" stroke={KRP.green} strokeWidth={16} strokeLinecap="round" />
        {grow > 0.3 && <g opacity={pop(seg(f, 30, 48))}><Ticket x={-80} y={-190} s={0.55} rot={-24} /></g>}
        {grow > 0.55 && <g opacity={pop(seg(f, 44, 62))}><Ticket x={86} y={-296} s={0.7} rot={14} /></g>}
        {grow > 0.85 && <g opacity={pop(seg(f, 60, 80))}><Ticket x={-10} y={-470} s={0.95} rot={-6} /></g>}
        {f >= 76 && <GoldCoin x={96} y={-420} r={24} />}
        {f >= 82 && <GoldCoin x={-150} y={-350} r={20} />}
      </g>
      <Spark x={1380} y={420} t={seg(f, 80, 94)} />
    </Frame>
  );
};

// #131 1851年ロンドン万博に約15万人といわれる = 水晶宮 + 人波
const SceneBanpaku: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={634}
    over={<>
      {f >= 8 && <Stamp x={140} y={140} text="1851年" size={52} />}
      {f >= 66 && <LabelPill x={1500} y={300} centerX text="約15万人といわれる" size={32} />}
    </>}>
    {/* 水晶宮 (ガラスと鉄の大温室) */}
    <g transform="translate(960 0)">
      {/* 中央のかまぼこ屋根 */}
      <path d="M -260 900 L -260 560 Q 0 380 260 560 L 260 900 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} opacity={0.95} />
      {/* 左右の翼 */}
      <rect x={-760} y={660} width={500} height={240} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      <rect x={260} y={660} width={500} height={240} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      {/* ガラスの格子 */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
        {[-640, -520, -400, 400, 520, 640].map((x) => <line key={x} x1={x} y1={660} x2={x} y2={900} />)}
        {[-160, -80, 0, 80, 160].map((x) => <line key={`c${x}`} x1={x} y1={470} x2={x} y2={900} />)}
        <line x1={-760} y1={740} x2={760} y2={740} />
        <line x1={-760} y1={820} x2={760} y2={820} />
      </g>
      {/* 旗 */}
      <line x1={0} y1={444} x2={0} y2={350} stroke={KRP.ink} strokeWidth={6} />
      <path d={`M 0 350 q 40 ${6 + Math.sin(f / 9) * 8} 80 0 l 0 36 q -40 ${-6 - Math.sin(f / 9) * 8} -80 0 Z`}
        fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      {/* 入口 */}
      <rect x={-70} y={760} width={140} height={140} fill={KRP.ink} opacity={0.45} />
    </g>
    {/* 押し寄せる人波 (左右から入口へ) */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const fromLeft = i % 2 === 0;
      const t = easeOut(seg(f, 6 + i * 6, 64 + i * 6));
      const x = fromLeft ? lerp(-80 - i * 40, 870 - i * 36, t) : lerp(2000 + i * 40, 1050 + i * 36, t);
      const cloths = [KRP.green, TKP.noren, KRP.orange, KRP.grayDark];
      return (
        <Person key={i} x={x} y={1016} s={0.62} f={f} phase={i} face="smile"
          gaze={[fromLeft ? 4 : -4, 0]} cloth={cloths[i % 4]} clothDark={KRP.white} hair="none" />
      );
    })}
  </Frame>
);

// #132 1855年、海を越えて欧州周遊ツアー = 蒸気船がドーバーを渡る
const SceneEuroShuyu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={635}
    over={<>{f >= 8 && <Stamp x={140} y={140} text="1855年" size={52} />}</>}>
    {/* 白い崖 (英国側) */}
    <path d="M -20 980 L -20 420 L 120 460 L 190 400 L 300 500 L 360 470 L 420 980 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -20 420 L 120 460 L 190 400 L 300 500 L 360 470 L 420 540 L -20 520 Z"
      fill={KRP.green} opacity={0.65} stroke={KRP.ink} strokeWidth={4} />
    {/* 対岸 (欧州側) */}
    <path d="M 1940 980 L 1940 560 L 1800 600 L 1700 560 L 1620 640 L 1560 980 Z"
      fill={TKP.stone} stroke={KRP.ink} strokeWidth={6} />
    {/* 海 */}
    <rect x={-20} y={700} width={W + 40} height={400} fill={KRP.blueSoft} opacity={0.75} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i}
        d={`M ${-40 + i * 420 + Math.sin((f + i * 20) / 17) * 24} ${760 + i * 56} q 70 -22 140 0 q 70 22 140 0`}
        fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
    ))}
    <SteamShip x={lerp(360, 1430, easeOut(seg(f, 6, 84)))} y={700} s={1.15} f={f} />
  </Frame>
);

// #133 1872年、添乗員つき世界一周ツアー = 地球をぐるり (追いかけ地球儀)
const SceneWorldTour: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <WorldTourGlobe f={f} caption="世界一周ツアー" />
    {f >= 8 && <Stamp x={160} y={160} text="1872年" size={56} />}
    <TBadge />
  </AbsoluteFill>
);

// #134 所要222日、『八十日間世界一周』と同じ年 = 一周完走の地球儀 + 本
const SceneWorldTour222: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <WorldTourGlobe f={f + 130} />
    {f >= 6 && <Stamp x={170} y={160} text="所要222日" size={52} />}
    {/* 同年刊行の小説 (洋書) */}
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={637} />
      <g filter="url(#wobble)">
        <PopAt x={1640} y={620} t={seg(f, 28, 50)}>
          <g transform={`translate(1640 ${620 + bobOf(f)}) rotate(4)`}>
            <rect x={-105} y={-170} width={210} height={340} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
            <rect x={-105} y={-170} width={26} height={340} rx={10} fill={KRP.ink} opacity={0.8} />
            <rect x={-56} y={-130} width={132} height={260} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={10} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={27}
              fill={KRP.ink} style={{ writingMode: "vertical-rl" as const }}>八十日間世界一周</text>
          </g>
        </PopAt>
        <Spark x={1800} y={420} t={seg(f, 52, 66)} />
      </g>
    </svg>
    <TBadge />
  </AbsoluteFill>
);

// #135 旅は口実なしで買える = きっぷ売り場 (お金→切符) + 口実たちが空へ
const SceneTicketKaeru: React.FC<{ f: number }> = ({ f }) => {
  const coinT = easeOut(seg(f, 8, 36));
  const outT = easeOut(seg(f, 44, 72));
  const flyT = easeOut(seg(f, 50, 96));
  return (
    <Frame f={f} seed={638}>
      {/* 売り場の小屋 */}
      <g transform="translate(960 560)">
        <path d="M -300 -240 L 0 -320 L 300 -240 L 300 -200 L -300 -200 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-260} y={-200} width={520} height={440} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-150} y={-140} width={300} height={190} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {[-50, 50].map((gx, i) => (
          <line key={i} x1={gx} y1={-140} x2={gx} y2={50} stroke={KRP.ink} strokeWidth={4.5} opacity={0.6} />
        ))}
        {/* 窓口の受け皿 */}
        <rect x={-180} y={70} width={360} height={26} rx={10} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 看板 (絵看板: 切符マーク) */}
        <g transform="translate(0 -266) scale(0.8)"><Ticket x={0} y={0} s={0.9} rot={-6} /></g>
      </g>
      {/* お金が入る → 切符が出る */}
      {coinT > 0 && coinT < 1 && <GoldCoin x={lerp(520, 905, coinT)} y={610 - Math.sin(coinT * Math.PI) * 130} r={30} />}
      {f >= 36 && f < 48 && <Burst x={960} y={600} r={70} t={seg(f, 36, 48)} />}
      {outT > 0 && (
        <g opacity={Math.min(1, outT * 3)}>
          <Ticket x={lerp(1010, 1450, outT)} y={620 - Math.sin(outT * Math.PI) * 110} s={1.2}
            rot={lerp(-30, -4, outT)} />
        </g>
      )}
      <Spark x={1540} y={500} t={seg(f, 72, 86)} />
      {/* 役目を終えた口実たちが空へ帰っていく */}
      {flyT > 0 && (
        <g opacity={1 - flyT * 0.8}>
          <g transform={`translate(${660 - flyT * 160} ${430 - flyT * 330}) scale(${1 - flyT * 0.4}) rotate(${-flyT * 20})`}>
            <MiniKoujitsu kind="torii" />
          </g>
          <g transform={`translate(${960 + flyT * 30} ${380 - flyT * 330}) scale(${1 - flyT * 0.4}) rotate(${flyT * 14})`}>
            <MiniKoujitsu kind="book" />
          </g>
          <g transform={`translate(${1280 + flyT * 170} ${430 - flyT * 300}) scale(${1 - flyT * 0.4}) rotate(${flyT * 22})`}>
            <MiniKoujitsu kind="onsen" />
          </g>
        </g>
      )}
    </Frame>
  );
};

// #136 身分も、信仰も、いりません = 冠と鳥居の札にバツ
const SceneMibunFunyou: React.FC<{ f: number }> = ({ f }) => {
  const Card: React.FC<{ x: number; t: number; ph: number; children: React.ReactNode }> =
    ({ x, t, ph, children }) => {
      const sc = pop(clamp01(t));
      if (sc <= 0) return null;
      return (
        <g transform={`translate(${x} ${500 + bobOf(f, ph)}) scale(${sc})`}>
          <rect x={-180} y={-200} width={360} height={400} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {children}
        </g>
      );
    };
  return (
    <Frame f={f} seed={639}>
      <Card x={600} t={seg(f, 4, 22)} ph={0}>
        {/* 冠 (身分のしるし) */}
        <g transform="translate(0 -20)">
          <path d="M -110 60 L -110 -40 L -56 10 L 0 -70 L 56 10 L 110 -40 L 110 60 Z"
            fill={KRP.gold} stroke={KRP.ink} strokeWidth={6.5} />
          <circle cx={-110} cy={-48} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={-78} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={110} cy={-48} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-110} y={60} width={220} height={26} rx={8} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </Card>
      <Card x={1320} t={seg(f, 16, 34)} ph={1}>
        <g transform="translate(0 0) scale(2.4)"><MiniKoujitsu kind="torii" /></g>
      </Card>
      <Xmark x={600} y={500} r={170} t={seg(f, 40, 54)} />
      <Xmark x={1320} y={500} r={170} t={seg(f, 54, 68)} />
      <Burst x={960} y={290} r={90} t={seg(f, 66, 82)} />
    </Frame>
  );
};

// #137 お金さえ払えば誰でも楽しみの旅へ = 切符を手にホームへ歩く人々
const SceneDaredemoTabi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={640}>
    <BritStationBg f={f} />
    <SteamLoco x={1580} y={880} s={0.92} f={f} run={false} />
    {[0, 1, 2].map((i) => {
      const t = easeOut(seg(f, 4 + i * 10, 64 + i * 10));
      const x = lerp(-140 - i * 230, 560 + i * 250, t);
      const cloths = [KRP.orange, KRP.green, TKP.noren];
      return (
        <g key={i}>
          <Person x={x} y={1010} s={0.85} f={f} phase={i} face="smile"
            gaze={[5, 0]} cloth={cloths[i]} clothDark={KRP.white} hair="none" />
          {/* 手もとの切符 */}
          <Ticket x={x + 92} y={880 + bobOf(f, i)} s={0.5} rot={-12} />
        </g>
      );
    })}
    <Spark x={1340} y={420} t={seg(f, 70, 84)} />
  </Frame>
);

// #138 「観光」という商品の誕生 = 口実の路線図が全線開通 + 紙ふぶき
const SceneKankoTanjo: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={641} caption="口実の路線図 全線開通">
    <KoujitsuRoute x={960} y={560} s={1.15} f={f} count={4} />
    <Burst x={1583} y={560} r={120} t={seg(f, 78, 94)} />
    <Spark x={1583} y={380} t={seg(f, 84, 98)} />
    <Spark x={340} y={330} s={0.8} t={seg(f, 90, 104)} />
    {/* 紙ふぶき (開通のお祝い) */}
    {f >= 68 && Array.from({ length: 16 }, (_, i) => {
      const colors = [KRP.red, KRP.gold, KRP.green, KRP.blueDeep, KRP.orange];
      const x = 140 + ((i * 331) % 1640) + Math.sin((f + i * 23) / 11) * 30;
      const y = (((f - 68) * (4 + (i % 3)) + i * 97) % 760) - 60;
      return (
        <rect key={i} x={x} y={y} width={26} height={16} rx={3}
          fill={colors[i % 5]} stroke={KRP.ink} strokeWidth={2.5}
          transform={`rotate(${(f * 4 + i * 47) % 360} ${x + 13} ${y + 8})`}
          opacity={0.9} />
      );
    })}
  </Frame>
);

export const tabiB3Scene = (motif: string, f: number): React.ReactElement | null => {
  const S = SCENES[motif];
  return S ? S(f) : null;
};

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  tb3_ch5_door: (f) => <SceneCh5Door f={f} />,
  tb3_not_faith: (f) => <SceneNotFaith f={f} />,
  tb3_grandtour_intro: (f) => <SceneGtIntro f={f} />,
  tb3_gt_map: (f) => <SceneGtMap f={f} />,
  tb3_gt_map_meimoku: (f) => <SceneGtMapMeimoku f={f} />,
  tb3_gt_jittai: (f) => <SceneGtJittai f={f} />,
  tb3_gt_tutor: (f) => <SceneGtTutor f={f} />,
  tb3_kanko_word: (f) => <SceneKankoWord f={f} />,
  tb3_tourist_1772: (f) => <SceneTourist1772 f={f} />,
  tb3_souvenir: (f) => <SceneSouvenir f={f} />,
  tb3_gt_market: (f) => <SceneGtMarket f={f} />,
  tb3_canaletto_piranesi: (f) => <SceneCanalettoPiranesi f={f} />,
  tb3_miyage_pair: (f) => <SceneMiyagePair f={f} />,
  tb3_koujitsu2: (f) => <SceneKoujitsu2 f={f} />,
  tb3_ch6_door: (f) => <SceneCh6Door f={f} />,
  tb3_ryoyo_plate: (f) => <SceneRyoyoPlate f={f} />,
  tb3_touji_intro: (f) => <SceneToujiIntro f={f} />,
  tb3_rotenburo_heal: (f) => <SceneRotenburoHeal f={f} />,
  tb3_hitomeguri: (f) => <SceneHitomeguri f={f} />,
  tb3_mimeguri: (f) => <SceneMimeguri f={f} />,
  tb3_banzuke: (f) => <SceneBanzuke f={f} />,
  tb3_banzuke_zoom: (f) => <SceneBanzukeZoom f={f} />,
  tb3_kaban_book: (f) => <SceneKabanBook f={f} />,
  tb3_youjinshu_1810: (f) => <SceneYoujinshu1810 f={f} />,
  tb3_youjinshu_nakami: (f) => <SceneYoujinshuNakami f={f} />,
  tb3_koujitsu3: (f) => <SceneKoujitsu3 f={f} />,
  tb3_ch7_door: (f) => <SceneCh7Door f={f} />,
  tb3_loco_debut: (f) => <SceneLocoDebut f={f} />,
  tb3_1841_jiken: (f) => <Scene1841 f={f} />,
  tb3_cook_500: (f) => <SceneCook500 f={f} />,
  tb3_kinshu_taikai: (f) => <SceneKinshu f={f} />,
  tb3_one_shilling: (f) => <SceneShilling f={f} />,
  tb3_ryokogyo_genten: (f) => <SceneGenten f={f} />,
  tb3_cook_sodateru: (f) => <SceneSodateru f={f} />,
  tb3_banpaku_1851: (f) => <SceneBanpaku f={f} />,
  tb3_euro_shuyu_1855: (f) => <SceneEuroShuyu f={f} />,
  tb3_world_tour: (f) => <SceneWorldTour f={f} />,
  tb3_world_tour_222: (f) => <SceneWorldTour222 f={f} />,
  tb3_ticket_kaeru: (f) => <SceneTicketKaeru f={f} />,
  tb3_mibun_funyou: (f) => <SceneMibunFunyou f={f} />,
  tb3_daredemo_tabi: (f) => <SceneDaredemoTabi f={f} />,
  tb3_kanko_tanjo: (f) => <SceneKankoTanjo f={f} />,
};

// 文#97〜#138 に1対1で対応する motif 名の列 (長さは必ず42。再利用は同じ名前を繰り返す)
export const T_B3_MOTIFS: string[] = [
  // 第5章 グランドツアー (#97〜#110)
  "tb3_ch5_door", // #97 一方そのころ、ヨーロッパ
  "tb3_not_faith", // #98 こちらの口実は信仰ではない
  "tb3_grandtour_intro", // #99 17世紀イギリス貴族のグランドツアー
  "tb3_gt_map", // #100 息子を仏伊へ数か月〜数年
  "tb3_gt_map_meimoku", // #101 名目は「教育の総仕上げ」
  "tb3_gt_jittai", // #102 実態の多くは観光と買い物 (といわれる)
  "tb3_gt_tutor", // #103 お目付け役の家庭教師が同行
  "tb3_kanko_word", // #104 「観光」という言葉が生まれる
  "tb3_tourist_1772", // #105 tourist の英語初出は1772年
  "tb3_souvenir", // #106 souvenir は仏語「思い出す」から
  "tb3_gt_market", // #107 お土産市場もしっかりあった
  "tb3_canaletto_piranesi", // #108 お金持ちは風景画・お手頃派は版画
  "tb3_miyage_pair", // #109 高級土産と絵はがきの関係はこのころから
  "tb3_koujitsu2", // #110 教育という口実と思い出という言い訳のセット
  // 第6章 湯治 (#111〜#122)
  "tb3_ch6_door", // #111 口実は、まだあります (章扉)
  "tb3_ryoyo_plate", // #112 3つめの口実「療養」
  "tb3_touji_intro", // #113 江戸の庶民に公認のもうひとつの旅=湯治
  "tb3_rotenburo_heal", // #114 温泉に入って病気や疲れを治す旅
  "tb3_hitomeguri", // #115 滞在の単位は「一廻り」=7日間
  "tb3_mimeguri", // #116 しっかり治すなら三廻り21日の長期休暇
  "tb3_banzuke", // #117 温泉の番付表まで作られていた
  "tb3_banzuke_zoom", // #118 相撲の番付そっくりに東西の名湯
  "tb3_kaban_book", // #119 旅人のカバンには頼れる一冊
  "tb3_youjinshu_1810", // #120 『旅行用心集』1810年のガイドブック
  "tb3_youjinshu_nakami", // #121 道のり・料金・効能・心得61か条
  "tb3_koujitsu3", // #122 「信仰」「教育」「療養」出そろった
  // 第7章 鉄道と観光の誕生 (#123〜#138)
  "tb3_ch7_door", // #123 19世紀、旅を一変させる発明 (章扉)
  "tb3_loco_debut", // #124 蒸気機関車、鉄道です
  "tb3_1841_jiken", // #125 1841年7月5日イギリスで事件
  "tb3_cook_500", // #126 トマス・クックが約500人を列車に
  "tb3_kinshu_taikai", // #127 目的は禁酒運動の集会への送り込み
  "tb3_one_shilling", // #128 料金はひとり1シリング団体割引つき
  "tb3_ryokogyo_genten", // #129 禁酒運動が旅行業の原点に
  "tb3_cook_sodateru", // #130 クックはこれを商売に育てる
  "tb3_banpaku_1851", // #131 1851年ロンドン万博に約15万人といわれる
  "tb3_euro_shuyu_1855", // #132 1855年には海を越えて欧州周遊ツアー
  "tb3_world_tour", // #133 1872年添乗員つき世界一周ツアー
  "tb3_world_tour_222", // #134 所要222日『八十日間世界一周』と同じ年
  "tb3_ticket_kaeru", // #135 旅はもう口実がなくても買える
  "tb3_mibun_funyou", // #136 身分も信仰もいりません
  "tb3_daredemo_tabi", // #137 お金さえ払えば誰でも楽しみの旅へ
  "tb3_kanko_tanjo", // #138 「観光」という商品の誕生
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const T_B3_PREVIEW_FRAMES = Math.max(T_B3_MOTIFS.length, 1);
export const TabiB3Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(T_B3_MOTIFS.length - 1, 0));
  const motif = T_B3_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {tabiB3Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 97} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
