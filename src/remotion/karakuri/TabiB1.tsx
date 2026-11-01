// 「旅とお土産の歴史」: ブロック1 = 序章 + 第1章 + 第2章。
// 担当範囲: 台本 docs/tabi-miyage-script-v1.txt の 2〜54行目 (文#1〜#53・53文)。
// motif 名は必ず tb1_ で始める。WobbleDefs の seed はこのファイルでは 400〜499 を使う。
// このファイルを編集してよいのはブロック1担当だけ (共有部品は TabiShared/TabiKits/TabiTravel から import)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, TBadge, ChapterDoor } from "./TabiShared";
import {
  TKP,
  GendaiBg, MiyageShelf, KashiBox, ModernTraveler, PaperBag,
  RomaBg, RomanTemple, TogaPerson, WineCup,
  KumanoBg, OjiShrine, HeianPilgrim,
  CaminoBg, EuroPilgrim, ScallopShell, BadgeMold,
  ShinmeiTorii, SteamLoco,
} from "./TabiKits";
import { KoujitsuRoute, GlobeTravel, SailShip, JetPlane } from "./TabiTravel";
import {
  KinkiMapCard, KmapLabel, kmapXY, kmapPointAt,
  kiijiPath, nakahechiPath, KUMANO_ROUTE, KPLACE,
} from "./TabiKinkiMap";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Person と同じゆれ式 (かぶせ物を同期させる)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;
// (cx,cy) に向かってカメラを寄せる transform
const zoomAt = (z: number, cx: number, cy: number) => `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// ===== シーンの共通ガワ: クリーム紙地 + ゆらぎ + バッジ + 質感 (WatashiB1 の Frame と同じ流儀) =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, over, children }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
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

// ふきだし (svg内)
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; tailTo?: [number, number];
  text?: string; size?: number; t?: number; color?: string; children?: React.ReactNode;
}> = ({ x, y, w, h, tailTo, text, size = 38, t = 1, color = KRP.ink, children }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      {tailTo && (
        <polygon points={`-14,${h / 2 - 8} 14,${h / 2 - 8} ${tailTo[0] - x},${tailTo[1] - y}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {tailTo && (
        <polygon points={`-13,${h / 2 - 10} 13,${h / 2 - 10} ${(tailTo[0] - x) * 0.96},${(tailTo[1] - y) * 0.92}`}
          fill={KRP.white} />
      )}
      {text && (
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={size} fill={color}>{text}</text>
      )}
      {children}
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
          const r1 = r * (0.55 + tt * 0.45);
          return (
            <line key={i} x1={Math.cos(a) * r * 0.55} y1={Math.sin(a) * r * 0.55}
              x2={Math.cos(a) * r1} y2={Math.sin(a) * r1}
              stroke={color} strokeWidth={6} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

// 大きな「？」(ゆらゆら)
const QMark: React.FC<{ x: number; y: number; s?: number; f?: number; t?: number; color?: string }> =
  ({ x, y, s = 1, f = 0, t = 1, color = KRP.orange }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc * s}) rotate(${Math.sin(f / 16) * 6})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={120} fill={color} stroke={KRP.ink} strokeWidth={3}>?</text>
      </g>
    );
  };

// 数え上げ用のミニ人 (頭+肩)
const MiniHead: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> =
  ({ x, y, s = 1, t = 1, color = KRP.blueDeep }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc * s})`}>
        <circle cx={0} cy={-34} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -28 10 Q -28 -16 0 -16 Q 28 -16 28 10 Z" fill={color} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };

// 個包装のお菓子 (1個)
const Tsutsumi: React.FC<{ x: number; y: number; s?: number; t?: number; red?: boolean }> =
  ({ x, y, s = 1, t = 1, red = false }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc * s})`}>
        {/* 銘菓の箱とおそろいの赤い包み紙 + 白ドット柄 */}
        <rect x={-24} y={-16} width={48} height={32} rx={6}
          fill={KRP.red} opacity={red ? 1 : 0.82} stroke={red ? KRP.red : KRP.ink} strokeWidth={4} />
        <circle cx={-11} cy={-6} r={3.6} fill={KRP.white} opacity={0.75} />
        <circle cx={2} cy={7} r={3.6} fill={KRP.white} opacity={0.75} />
        <circle cx={14} cy={-5} r={3.6} fill={KRP.white} opacity={0.75} />
        <path d="M -24 4 L -32 -1 L -24 -6 M 24 4 L 32 -1 L 24 -6" fill="none"
          stroke={red ? KRP.red : KRP.ink} strokeWidth={3} opacity={0.7} />
      </g>
    );
  };

// 緑のチェック / 赤のバツ
const CheckMark: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc * s})`}>
      <path d="M -44 0 L -10 36 L 52 -40" fill="none" stroke={KRP.green} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -44 0 L -10 36 L 52 -40" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
    </g>
  );
};
const CrossMark: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc * s})`} stroke={KRP.red} strokeWidth={18} strokeLinecap="round">
      <line x1={-36} y1={-36} x2={36} y2={36} />
      <line x1={36} y1={-36} x2={-36} y2={36} />
    </g>
  );
};

// 歯車 (仕組みの記号)
const Gear: React.FC<{ x: number; y: number; r?: number; rot?: number; color?: string; label?: string }> =
  ({ x, y, r = 90, rot = 0, color = KRP.brass, label }) => (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${rot})`}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * 360;
          return <rect key={i} x={-11} y={-r - 16} width={22} height={24} rx={5}
            fill={color} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${a})`} />;
        })}
        <circle cx={0} cy={0} r={r} fill={color} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={r * 0.42} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {label && (
        <text x={0} y={r + 56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>{label}</text>
      )}
    </g>
  );

// 汗のしずく
const Sweat: React.FC<{ x: number; y: number; f: number; n?: number }> = ({ x, y, f, n = 2 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const dy = ((f * 1.4 + i * 34) % 60);
      return (
        <path key={i} d={`M ${x + i * 26} ${y + dy} q -9 14 0 22 q 9 -8 0 -22`}
          fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={0.9 - dy / 80} />
      );
    })}
  </g>
);

// ===================================================================
// 序章の舞台: 旅行先の売り場 (棚×2 + 箱を手にした「私」)。#1〜#6 で使い回す
// ===================================================================
const UribaStage: React.FC<{ f: number; boxT?: number; face?: "normal" | "worried" | "surprised" | "smile"; children?: React.ReactNode }> =
  ({ f, boxT = 1, face = "worried", children }) => {
    const shelfT = pop(seg(f, 0, 18));
    const shelf2T = pop(seg(f, 8, 26));
    const px = 1040 + (1 - easeOut(seg(f, 4, 38))) * 340;
    const bob = bobOf(f, 1);
    return (
      <g>
        <GendaiBg f={f} plane={false} scenic />
        <g transform={`translate(480 850) scale(${shelfT})`}><MiyageShelf x={0} y={0} /></g>
        <g transform={`translate(1620 850) scale(${shelf2T * 0.86})`}><MiyageShelf x={0} y={0} /></g>
        <ModernTraveler x={px} y={880} f={f} phase={1} face={face} gaze={[-5, 4]} />
        {/* 手もとの箱 (体のゆれと同期) */}
        {boxT > 0 && (
          <g transform={`translate(${px - 88} ${745 + bob}) scale(${pop(clamp01(boxT)) * 0.52})`}>
            <KashiBox x={0} y={0} />
          </g>
        )}
        {children}
      </g>
    );
  };

// ===================================================================
// 序章 #1〜#15
// ===================================================================

// #1 売り場で箱を手に固まっている人
const SceneUribaKatamaru: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={400} caption="旅行先のお土産売り場">
    <UribaStage f={f} boxT={seg(f, 36, 52)}>
      <QMark x={1180} y={420} s={0.8} f={f} t={seg(f, 60, 76)} />
    </UribaStage>
  </Frame>
);

// #2 私です。(カメラが寄る + 矢印)
const SceneWatashiDesu: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.55 * easeOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={401}>
      <g transform={zoomAt(z, 1040, 620)}>
        <UribaStage f={f + 90} boxT={1} />
      </g>
      <Burst x={1040} y={430} r={120} t={seg(f, 36, 56)} n={12} />
    </Frame>
  );
};

// #3 数えているのはお菓子の数ではない (お菓子案に✗)
const SceneOkashiJanai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={402}>
    <GendaiBg f={f} plane={false} scenic />
    <g transform={`translate(760 660) scale(${pop(seg(f, 0, 18)) * 1.5})`}>
      <KashiBox x={0} y={0} />
    </g>
    <ModernTraveler x={1480} y={890} s={1.05} f={f} phase={2} face="normal" gaze={[-6, 2]} />
    {/* 考えごとの泡 → お菓子の数? → ✗ */}
    <circle cx={1330} cy={560} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 20, 30)} />
    <circle cx={1270} cy={490} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 26, 36)} />
    <Bubble x={1060} y={340} w={460} h={190} t={seg(f, 32, 50)}>
      <Tsutsumi x={-120} y={0} s={1.3} />
      <Tsutsumi x={0} y={0} s={1.3} />
      <Tsutsumi x={120} y={0} s={1.3} />
    </Bubble>
    <CrossMark x={1060} y={340} s={1.4} t={seg(f, 58, 72)} />
  </Frame>
);

// #4 数えているのは職場の人数 (思い浮かべた職場。12人が順に現れて数えられていく)
const SceneShokubaNinzu: React.FC<{ f: number }> = ({ f }) => {
  const shown = Array.from({ length: 12 }, (_, i) => seg(f, 6 + i * 4, 18 + i * 4));
  const count = shown.filter((t) => t > 0.4).length;
  // 机の島4つ × 3人 (奥2島は小さめ): [島の中心x, 足元y, 人のs]
  const islands: Array<[number, number, number]> = [
    [480, 640, 0.52], [1440, 640, 0.52],
    [480, 876, 0.64], [1440, 876, 0.64],
  ];
  // スーツ (紺・グレー) とオフィスカジュアル (緑・オレンジ・水色) を混ぜる
  const clothes: Array<[string, string]> = [
    [KRP.blueDeep, "#38598C"], [KRP.green, "#639A5F"], [KRP.gray, KRP.grayDark],
    [KRP.orange, "#C07838"], [KRP.blueDeep, "#38598C"], [KRP.blueSoft, "#8FB2CC"],
    [KRP.gray, KRP.grayDark], [KRP.green, "#639A5F"], [KRP.blueDeep, "#38598C"],
    [KRP.blueSoft, "#8FB2CC"], [KRP.orange, "#C07838"], [KRP.gray, KRP.grayDark],
  ];
  return (
    <Frame f={f} seed={403} caption="思いうかべたのは 職場">
      {/* 壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill={TKP.airport} opacity={0.4} />
      <rect x={-20} y={716} width={W + 40} height={H - 696} fill={KRP.gray} opacity={0.2} />
      <line x1={-20} y1={716} x2={W + 20} y2={716} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={i * 460 - 160} y1={716} x2={i * 460 + 40} y2={H + 20} stroke={KRP.ink} strokeWidth={2.5} opacity={0.12} />
      ))}
      {/* 窓 (外は空) */}
      <rect x={1470} y={230} width={320} height={280} rx={10} fill={KRP.blueSoft} opacity={0.6} stroke={KRP.ink} strokeWidth={5} />
      <g fill={KRP.white} opacity={0.9}>
        <ellipse cx={1560} cy={300} rx={40} ry={20} /><ellipse cx={1610} cy={312} rx={34} ry={18} />
      </g>
      <line x1={1630} y1={230} x2={1630} y2={510} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      <line x1={1470} y1={370} x2={1790} y2={370} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      {/* 壁かけ時計 */}
      <g transform="translate(290 300)">
        <circle cx={0} cy={0} r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={0} y1={0} x2={0} y2={-38} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={0} x2={26} y2={12} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <circle cx={0} cy={0} r={5} fill={KRP.ink} />
      </g>
      {/* ホワイトボード: ここに数えた人数が出る */}
      <g transform="translate(920 352)">
        <rect x={-250} y={-128} width={500} height={256} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-262} y={128} width={524} height={16} rx={6} fill={TKP.iron} stroke={KRP.ink} strokeWidth={4} />
        <text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={KRP.grayDark}>うちの職場…</text>
        <text x={0} y={72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={KRP.blueDeep}>{count}人</text>
      </g>
      {/* 観葉植物 */}
      <g transform="translate(90 690)">
        <ellipse cx={0} cy={-104} rx={46} ry={58} fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={-34} cy={-70} rx={30} ry={40} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={34} cy={-72} rx={30} ry={40} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -34 -14 L 34 -14 L 26 44 L -26 44 Z" fill={TKP.terracotta} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 机の島 (人 → 机 → モニタの順に描き、人が机の奥に立つ) */}
      {islands.map(([cx, fy, s], isl) => {
        const sc = s / 0.64;
        return (
          <g key={isl}>
            {[-1, 0, 1].map((k, j) => {
              const idx = isl * 3 + j;
              const t = pop(clamp01(shown[idx]));
              const px = cx + k * 250 * sc;
              if (t <= 0) return null;
              return (
                <g key={j} transform={`translate(${px} ${fy}) scale(${t}) translate(${-px} ${-fy})`}>
                  <Person x={px} y={fy} s={s} f={f} phase={idx + 2} face={idx % 3 === 1 ? "smile" : "normal"}
                    gaze={[k * -3, 2]} cloth={clothes[idx][0]} clothDark={clothes[idx][1]} />
                </g>
              );
            })}
            {/* 机 + モニタ (モニタは人と人の間に置いて顔を隠さない) */}
            <g transform={`translate(${cx} ${fy})`}>
              <rect x={-395 * sc} y={-96 * sc} width={790 * sc} height={18 * sc} rx={8} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-380 * sc} y={-78 * sc} width={26 * sc} height={78 * sc} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={354 * sc} y={-78 * sc} width={26 * sc} height={78 * sc} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
              {[-1, 1].map((k) => (
                <g key={k} transform={`translate(${k * 125 * sc} ${-96 * sc}) scale(${sc})`}>
                  <rect x={-12} y={-12} width={24} height={12} fill={KRP.ink} opacity={0.75} />
                  <rect x={-50} y={-72} width={100} height={62} rx={6} fill={TKP.iron} stroke={KRP.ink} strokeWidth={4.5} />
                </g>
              ))}
              {/* 書類とマグカップ (机の端) */}
              <g transform={`translate(${-330 * sc} ${-96 * sc}) scale(${sc})`}>
                <rect x={-34} y={-14} width={68} height={10} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                <rect x={-30} y={-24} width={68} height={10} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-4 0 -19)" />
              </g>
              <g transform={`translate(${332 * sc} ${-96 * sc}) scale(${sc})`}>
                <rect x={-16} y={-34} width={32} height={34} rx={5} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={3.5} />
                <path d="M 16 -28 q 16 2 0 16" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
              </g>
            </g>
          </g>
        );
      })}
    </Frame>
  );
};

// #5 12人 vs 18個入り (6個あまる)
const Scene12vs18: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={404}>
    {/* 上段: 12人 */}
    <TagPlate x={390} y={210} text="職場 12人" size={40} t={seg(f, 0, 14)} />
    {Array.from({ length: 12 }, (_, i) => (
      <MiniHead key={i} x={180 + i * 128} y={370} s={1.05} t={seg(f, 6 + i * 2, 16 + i * 2)} />
    ))}
    {/* 下段: 18個入り */}
    <TagPlate x={430} y={530} text="箱は 18個入り" size={40} t={seg(f, 30, 44)} />
    {Array.from({ length: 18 }, (_, i) => {
      const amari = i >= 12;
      const lift = amari ? Math.sin(f / 12 + i) * 5 : 0;
      return (
        <Tsutsumi key={i} x={200 + i * 86} y={680 + lift} s={1.15}
          t={seg(f, 36 + i * 2, 46 + i * 2)} red={amari && f > 86} />
      );
    })}
    {/* 12人ぶんに線を引いて、あまり6個を囲む (枠は13個目〜18個目がちゃんと収まる幅に) */}
    {seg(f, 78, 92) > 0 && (
      <g opacity={seg(f, 78, 92)}>
        <line x1={1190} y1={620} x2={1190} y2={740} stroke={KRP.red} strokeWidth={7} strokeDasharray="14 10" />
        <path d={`M 1198 630 L 1706 630 L 1706 732 L 1198 732 Z`} fill="none" stroke={KRP.red} strokeWidth={6} rx={10} />
      </g>
    )}
    <TagPlate x={1520} y={810} text="6個 あまる…" size={36} t={seg(f, 88, 102)} color={KRP.red} />
  </Frame>
);

// #6 誰に頼まれたわけでもない (うすい同僚たちの「たのむね」の圧に✗)
const SceneTanomareteNai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={405}>
    <GendaiBg f={f} plane={false} scenic />
    <ModernTraveler x={1180} y={890} f={f} phase={4} face="worried" gaze={[-5, 0]} />
    <g transform={`translate(1092 ${745 + bobOf(f, 4)}) scale(0.52)`}><KashiBox x={0} y={0} /></g>
    <Sweat x={1260} y={560} f={f} />
    {/* うすく浮かぶ職場の人たち (実際には誰も頼んでいない) */}
    <g opacity={0.4 * seg(f, 16, 32)}>
      <Person x={640} y={846} s={0.78} f={f} phase={15} face="smile" gaze={[6, 0]} cloth={KRP.gray} clothDark={KRP.grayDark} />
      <Person x={300} y={884} s={0.92} f={f} phase={13} face="smile" gaze={[6, 0]} cloth={KRP.blueDeep} clothDark="#38598C" />
      <Person x={500} y={892} s={0.98} f={f} phase={14} face="smile" gaze={[6, 0]} cloth={KRP.green} clothDark="#639A5F" />
    </g>
    <Bubble x={330} y={350} w={330} h={110} tailTo={[310, 480]} text="たのむね" size={40} t={seg(f, 24, 38)} color={KRP.grayDark} />
    <Bubble x={640} y={470} w={300} h={96} tailTo={[620, 580]} text="おみやげ〜" size={34} t={seg(f, 32, 46)} color={KRP.grayDark} />
    <CrossMark x={470} y={600} s={1.5} t={seg(f, 52, 66)} />
  </Frame>
);

// #7 そして、もうひとつ。(①の隣に②が現れる)
const SceneMouHitotsu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={406}>
    {/* カード①: お土産のなやみ (さっきまでの話) */}
    <g transform={`translate(560 540) scale(${pop(seg(f, 0, 16))}) rotate(-3)`}>
      <rect x={-250} y={-230} width={500} height={460} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={-170} cy={-150} r={44} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
      <text x={-170} y={-132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={KRP.ink}>1</text>
      <g transform="translate(0 40) scale(0.85)"><KashiBox x={0} y={0} /></g>
    </g>
    {/* カード②: ? (次の話の予告) */}
    <g transform={`translate(1360 540) scale(${pop(seg(f, 36, 56))}) rotate(3)`}>
      <rect x={-250} y={-230} width={500} height={460} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={-170} cy={-150} r={44} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
      <text x={-170} y={-132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={KRP.ink}>2</text>
      <QMark x={0} y={90} s={1.6} f={f} t={seg(f, 52, 66)} />
    </g>
    <Burst x={1360} y={300} r={90} t={seg(f, 50, 66)} />
  </Frame>
);

// #8 「疲れたから」と言い訳して来た旅行
const SceneTsukaretaKara: React.FC<{ f: number }> = ({ f }) => {
  const px = 1140 + easeOut(seg(f, 10, 60)) * 160;
  return (
    <Frame f={f} seed={407}>
      {/* 青空 (外に出ている感じ。クリーム地は使わない) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.55} />
      {([[420, 230, 1], [920, 150, 0.8], [1460, 320, 0.7]] as [number, number, number][]).map(([cx, cy, s], i) => (
        <g key={i} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} opacity={0.95}
          transform={`translate(${cx + Math.sin(f / 40 + i * 2) * 8} ${cy}) scale(${s})`}>
          <ellipse cx={-54} cy={10} rx={46} ry={28} />
          <ellipse cx={56} cy={12} rx={50} ry={26} />
          <ellipse cx={0} cy={-10} rx={64} ry={36} />
        </g>
      ))}
      {/* 地面 (草地) */}
      <rect x={-20} y={880} width={W + 40} height={220} fill={KRP.green} opacity={0.22} />
      {/* 左: 職場ビル */}
      <g transform="translate(360 880)">
        <rect x={-200} y={-520} width={400} height={520} rx={10} fill={KRP.gray} opacity={0.75} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-150 + (i % 3) * 110} y={-460 + Math.floor(i / 3) * 130} width={70} height={84}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <rect x={-110} y={-620} width={220} height={74} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={-568} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.ink}>会社</text>
      </g>
      {/* 地面 */}
      <line x1={-20} y1={880} x2={W + 20} y2={880} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
      {/* そそくさと旅へ向かう私 */}
      <ModernTraveler x={px} y={880} f={f} phase={5} face="worried" gaze={[5, 0]} />
      <Sweat x={px + 90} y={560} f={f} />
      <Bubble x={px - 60} y={330} w={470} h={120} tailTo={[px - 20, 500]} text="疲れたから…" size={44} t={seg(f, 28, 44)} />
      {/* 進行方向の太陽とヤシ (旅先) */}
      <circle cx={1760} cy={220} r={62} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    </Frame>
  );
};

// #9 出かける口実 / 帰ってからの言い訳 (対の道しるべ)
const SceneKoujitsuIiwake: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={408}>
    {/* 背景: 空港 (ジェット機は道しるべと被らない右上の窓に) */}
    <GendaiBg f={f} plane={false} />
    <g transform="translate(1550 260) scale(0.72)"><JetPlane x={0} y={0} s={1} f={f} /></g>
    {/* 中央の私 */}
    <ModernTraveler x={960} y={900} f={f} phase={6} face="normal" />
    {/* 道しるべの柱 */}
    <rect x={944} y={360} width={32} height={240} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 左向き矢印板: 口実 (ゆき) */}
    <g transform={`translate(700 420) scale(${pop(seg(f, 10, 26))})`}>
      <path d="M -230 -46 L 190 -46 L 190 46 L -230 46 L -292 0 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
      <text x={-30} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.white}>ゆき: 口実</text>
    </g>
    {/* 右向き矢印板: 言い訳 (かえり) */}
    <g transform={`translate(1220 540) scale(${pop(seg(f, 34, 50))})`}>
      <path d="M 230 -46 L -190 -46 L -190 46 L 230 46 L 292 0 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
      <text x={30} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.white}>かえり: 言い訳</text>
    </g>
    {/* 左右の小さな記号: スーツケースと紙袋 */}
    <g transform={`translate(360 760) scale(${pop(seg(f, 20, 36))})`}>
      <rect x={-60} y={-130} width={120} height={150} rx={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -34 -130 Q -34 -170 0 -170 Q 34 -170 34 -130" fill="none" stroke={KRP.ink} strokeWidth={7} />
    </g>
    <g transform={`translate(1560 780) scale(${pop(seg(f, 44, 60))})`}><PaperBag x={0} y={0} s={1.1} /></g>
  </Frame>
);

// #10 千年かけて作られた「仕組み」(かみ合う歯車)
const SceneSennenShikumi: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 8, 26));
  const t2 = pop(seg(f, 22, 40));
  return (
    <Frame f={f} seed={409}>
      {/* 年表の帯 */}
      <g opacity={easeOut(seg(f, 0, 16))}>
        <line x1={240} y1={820} x2={1680} y2={820} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <TagPlate x={330} y={760} text="2000年前" size={30} />
        <TagPlate x={1590} y={760} text="いま" size={30} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={330 + i * 158} y1={806} x2={330 + i * 158} y2={834} stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* 昔から今までの旅の記憶がワーっとフラッシュバック */}
      {([
        [270, 600, 0.9, <ShinmeiTorii x={0} y={0} s={0.5} />],
        [430, 230, 0.9, <ScallopShell x={0} y={0} s={0.95} metal />],
        [1530, 170, 0.85, <JetPlane x={0} y={0} s={0.5} f={f} />],
        [1680, 430, 0.8, <SailShip x={0} y={0} s={0.5} f={f} />],
        [1520, 648, 0.85, <g transform="scale(0.42)"><SteamLoco x={0} y={0} f={f} run /></g>],
      ] as Array<[number, number, number, React.ReactNode]>).map(([x, y, op, node], i) => {
        const t = seg(f, 36 + i * 6, 48 + i * 6);
        if (t <= 0) return null;
        return (
          <g key={i} opacity={op * t} transform={`translate(${x} ${y + (1 - easeOut(t)) * 36}) scale(${pop(t)})`}>
            {node}
          </g>
        );
      })}
      {/* かみ合う歯車: 口実と言い訳 */}
      <g transform={`scale(${t1})`} style={{ transformOrigin: "760px 420px" }}>
        <Gear x={760} y={420} r={130} rot={f * 0.9} color={KRP.orange} label="口実" />
      </g>
      <g transform={`scale(${t2})`} style={{ transformOrigin: "1130px 500px" }}>
        <Gear x={1130} y={500} r={100} rot={-f * 1.17 + 18} color={KRP.blueDeep} label="言い訳" />
      </g>
      <Burst x={945} y={460} r={70} t={seg(f, 44, 58)} n={8} />
    </Frame>
  );
};

// #11 なぜ休むのに理由が要るのか
const SceneNazeYasumu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={410}>
    {/* ベンチで休もうとする人 */}
    <g transform="translate(560 880)">
      <rect x={-220} y={-110} width={440} height={34} rx={8} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-190} y={-76} width={30} height={76} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={160} y={-76} width={30} height={76} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    <Person x={560} y={800} s={0.95} f={f} phase={7} face="worried" cloth={KRP.green} clothDark="#639A5F" gaze={[4, -4]} />
    {/* 休むために差し出される「理由書」 */}
    <g transform={`translate(1240 500) scale(${pop(seg(f, 16, 34))}) rotate(${Math.sin(f / 18) * 3})`}>
      <rect x={-190} y={-250} width={380} height={500} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>理由書</text>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-130} y1={-90 + i * 70} x2={130} y2={-90 + i * 70} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
      ))}
      <rect x={-130} y={150} width={120} height={56} rx={8} fill="none" stroke={KRP.red} strokeWidth={5} />
      <text x={-70} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.red}>印</text>
    </g>
    <QMark x={1240} y={160} s={1.1} f={f} t={seg(f, 46, 60)} />
  </Frame>
);

// #12 なぜお土産を配らないと気まずいのか
const SceneNazeKimazui: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={411}>
    {/* 曇り空 */}
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.gray} opacity={0.3} />
    {([[360, 190, 1.1], [900, 130, 0.9], [1430, 210, 1], [1760, 120, 0.7]] as [number, number, number][]).map(([cx, cy, s], i) => (
      <g key={i} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3.5} opacity={0.75}
        transform={`translate(${cx + Math.sin(f / 46 + i * 2) * 6} ${cy}) scale(${s})`}>
        <ellipse cx={-58} cy={10} rx={50} ry={28} />
        <ellipse cx={60} cy={12} rx={54} ry={26} />
        <ellipse cx={0} cy={-10} rx={70} ry={38} />
      </g>
    ))}
    <line x1={-20} y1={890} x2={W + 20} y2={890} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
    {/* 手ぶらで帰ってきた私 (左) と、ずらっと待つ職場の人たち (右) */}
    <ModernTraveler x={480} y={890} f={f} phase={8} face="worried" gaze={[6, 0]} />
    <Sweat x={560} y={560} f={f} />
    <Person x={1432} y={846} s={0.76} f={f} phase={16} face="normal" gaze={[-6, 0]} cloth={KRP.gray} clothDark={KRP.grayDark} />
    <Person x={1636} y={850} s={0.78} f={f} phase={17} face="normal" gaze={[-6, 0]} cloth={KRP.blueSoft} clothDark="#8FB2CC" />
    <Person x={1842} y={848} s={0.77} f={f} phase={21} face="normal" gaze={[-6, 0]} cloth={KRP.bronze} clothDark="#9A6239" />
    <Person x={1330} y={890} f={f} phase={9} face="normal" gaze={[-6, 0]} cloth={KRP.blueDeep} clothDark="#38598C" />
    <Person x={1530} y={894} s={0.96} f={f} phase={18} face="normal" gaze={[-6, 0]} cloth={KRP.green} clothDark="#639A5F" />
    <Person x={1730} y={898} s={0.92} f={f} phase={19} face="normal" gaze={[-6, 0]} cloth={KRP.orange} clothDark="#C07838" />
    {/* あるはずだった紙袋 (点線) */}
    <g opacity={seg(f, 18, 34)}>
      <g fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="12 10">
        <path d="M 902 700 L 1018 700 L 1026 840 L 894 840 Z" />
        <path d="M 932 700 Q 932 662 960 662 Q 988 662 988 700" />
      </g>
      <QMark x={960} y={620} s={0.7} f={f} color={KRP.grayDark} />
    </g>
    {/* 気まずい空気のモヤモヤ */}
    {[0, 1, 2].map((i) => (
      <path key={i}
        d={`M ${820 + i * 110} ${330 - i * 20} q 24 ${-18 - Math.sin(f / 14 + i) * 6} 48 0 q 24 18 48 0`}
        fill="none" stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
        opacity={0.6 * seg(f, 40 + i * 8, 54 + i * 8)} />
    ))}
  </Frame>
);

// #13 この20分でぜんぶ一本につながる
const SceneIpponTsunagaru: React.FC<{ f: number }> = ({ f }) => {
  const icons: Array<[number, number, React.ReactNode]> = [
    [330, 300, <g transform="scale(0.62)"><KashiBox x={0} y={0} /></g>],
    [330, 620, <ScallopShell x={0} y={0} s={0.9} metal />],
    [620, 180, <ShinmeiTorii x={0} y={50} s={0.42} />],
    [620, 780, <Gear x={0} y={0} r={52} rot={f} color={KRP.brass} />],
  ];
  const drawT = easeOut(seg(f, 30, 80));
  return (
    <Frame f={f} seed={412}>
      {/* 20分の時計 */}
      <g transform={`translate(1600 240) scale(${pop(seg(f, 0, 16))})`}>
        <circle cx={0} cy={0} r={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M 0 0 L 0 -92 A 92 92 0 0 1 ${92 * Math.sin(Math.PI * 2 / 3)} ${-92 * Math.cos(Math.PI * 2 / 3)} Z`}
          fill={KRP.orange} opacity={0.8} />
        <circle cx={0} cy={0} r={8} fill={KRP.ink} />
        <text x={0} y={166} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>20分</text>
      </g>
      {/* バラバラの素材 */}
      {icons.map(([x, y, node], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${pop(seg(f, 6 + i * 6, 20 + i * 6))})`}>{node}</g>
      ))}
      {/* 一本につながる糸 */}
      {icons.map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} Q ${(x + 1240) / 2} ${(y + 540) / 2 - 60} 1240 540`}
          fill="none" stroke={KRP.red} strokeWidth={7} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawT} opacity={0.9} />
      ))}
      {/* 結び目 → 太い一本線 */}
      <circle cx={1240} cy={540} r={26 * drawT} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1240} y1={540} x2={1240 + 420 * easeOut(seg(f, 74, 100))} y2={540}
        stroke={KRP.red} strokeWidth={14} strokeLinecap="round" />
    </Frame>
  );
};

// #14 数を数える自分が少し好きになる
const SceneKazoeruSuki: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={413}>
    <GendaiBg f={f} plane={false} scenic />
    <g transform={`translate(480 850) scale(${pop(seg(f, 0, 14))})`}><MiyageShelf x={0} y={0} /></g>
    <ModernTraveler x={1060} y={880} f={f} phase={10} face="smile" gaze={[-4, 2]} />
    <g transform={`translate(972 ${745 + bobOf(f, 10)}) scale(0.52)`}><KashiBox x={0} y={0} /></g>
    {/* ハートがぽんぽん */}
    {[0, 1, 2].map((i) => {
      const t = seg(f, 30 + i * 16, 46 + i * 16);
      if (t <= 0) return null;
      return (
        <g key={i} transform={`translate(${1210 + i * 86} ${480 - i * 90 - t * 30}) scale(${pop(t) * (0.8 - i * 0.14)})`}>
          <path d="M 0 36 C -46 -4 -36 -44 0 -24 C 36 -44 46 -4 0 36 Z"
            fill={KRP.red} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
        </g>
      );
    })}
    <Burst x={1060} y={400} r={100} t={seg(f, 24, 40)} color={KRP.yellow} />
  </Frame>
);

// #15 それでは、旅とお土産、千年の歴史のお話です (時をさかのぼる道)
const SceneSennenMichi: React.FC<{ f: number }> = ({ f }) => {
  const d = easeOut(seg(f, 6, 60));
  return (
    <Frame f={f} seed={414}>
      {/* 丘と夕空 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.yellow} opacity={0.1} />
      <circle cx={1500} cy={260} r={86} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
      <path d="M -20 700 Q 480 580 960 660 Q 1440 580 1940 660 L 1940 1100 L -20 1100 Z" fill={TKP.caminoGold} opacity={0.55} />
      {/* いまから過去へ、うねる一本道 */}
      <path d="M 300 980 Q 560 820 900 820 Q 1320 820 1420 620 Q 1500 460 1360 380"
        fill="none" stroke={TKP.roadTan} strokeWidth={90} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      <path d="M 300 980 Q 560 820 900 820 Q 1320 820 1420 620 Q 1500 460 1360 380"
        fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="2 30" opacity={0.4 * d} />
      {/* 現代の私 (出発点) */}
      <ModernTraveler x={300} y={960} s={0.9} f={f} phase={11} face="smile" gaze={[6, -4]} />
      {/* 道ぞいに歴史の道しるべが現れる */}
      <g transform={`translate(830 760) scale(${pop(seg(f, 30, 46)) * 0.8})`}><ScallopShell x={0} y={0} metal /></g>
      <g transform={`translate(1240 700) scale(${pop(seg(f, 44, 60))})`}><ShinmeiTorii x={0} y={60} s={0.6} /></g>
      <g transform={`translate(1360 340) scale(${pop(seg(f, 58, 74)) * 0.75})`}>
        <RomanTemple x={0} y={0} s={0.52} />
      </g>
      <TagPlate x={160} y={860} text="いま" size={30} t={seg(f, 10, 24)} />
      <TagPlate x={1560} y={300} text="千年前へ" size={34} t={seg(f, 70, 84)} color={KRP.red} />
    </Frame>
  );
};

// ===================================================================
// 第1章 #16〜#33 (古代ローマ / travel=travail / 口実第一号=巡礼)
// ===================================================================

// 庶民 (無地の麻の服)。章をまたいで同じ見た目で出す
const Shomin: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number]; lean?: number }> =
  ({ x, y, s = 1, f, phase = 0, face = "worried", gaze, lean }) => (
    <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze} lean={lean}
      hair="cap" cloth={TKP.woodLight} clothDark={TKP.woodDark} />
  );

// ===== 第1章専用のガワ: 背景グラデーションで「色の物語」を語る =====
// (共用 Frame はクリーム地固定なので触らない。第1章だけ空気と光を変える)
const Ch1Frame: React.FC<{
  f: number; seed: number; bg: string; dark?: boolean; caption?: string;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, bg, dark, caption, over, children }) => (
  <AbsoluteFill style={{ background: bg }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
    <TBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// ----- 第1章の情景部品 -----
// 糸杉 (地中海の記号)。風でゆっくりゆれる
const Cypress: React.FC<{ x: number; y: number; s?: number; f?: number; color?: string }> =
  ({ x, y, s = 1, f = 0, color = TKP.cypress }) => (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 46 + x * 0.01) * 1.6})`}>
      <path d="M 0 -300 Q 34 -238 28 -158 Q 40 -88 22 -20 L -22 -20 Q -40 -88 -28 -158 Q -34 -238 0 -300 Z"
        fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-8} y={-22} width={16} height={26} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );

// ローマの別荘 (大理石の壁 + テラコッタ屋根)。lit で夜の窓あかり
const Villa: React.FC<{ x: number; y: number; s?: number; lit?: boolean; f?: number }> =
  ({ x, y, s = 1, lit = false, f = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-110} y={-120} width={220} height={120} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -128 -120 L 0 -186 L 128 -120 Z" fill={TKP.terracotta} stroke={KRP.ink} strokeWidth={5} />
      {[-62, 0, 62].map((wx, i) => (
        <rect key={i} x={wx - 20} y={-96} width={40} height={52} rx={6}
          fill={lit ? KRP.yellow : TKP.seaBlue}
          opacity={lit ? 0.8 + Math.sin(f / 9 + i * 2.1) * 0.2 : 1}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
    </g>
  );

// 海のきらめき (白い短線がゆっくり明滅する)
const SeaGlints: React.FC<{ f: number; pts: Array<[number, number]>; color?: string; w?: number }> =
  ({ f, pts, color = KRP.white, w = 26 }) => (
    <g>
      {pts.map(([x, y], i) => (
        <line key={i} x1={x - w} y1={y} x2={x + w} y2={y} stroke={color} strokeWidth={6}
          strokeLinecap="round" opacity={0.2 + 0.55 * (0.5 + 0.5 * Math.sin(f / 17 + i * 1.7))} />
      ))}
    </g>
  );

// 星空 (またたき)。位置は添字から決める (毎フレーム同じ場所)
const Stars: React.FC<{ f: number; n?: number; yMax?: number; op?: number }> =
  ({ f, n = 26, yMax = 430, op = 1 }) => (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const x = ((i * 733) % 1880) + 20;
        const y = ((i * 397) % yMax) + 16;
        const tw = 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(f / 21 + i * 2.3));
        return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 4 : 2.6} fill={KRP.white} opacity={tw} />;
      })}
    </g>
  );

// 飛ぶ鳥 (羽ばたくVの字)
const BirdV: React.FC<{ x: number; y: number; s?: number; f?: number; color?: string }> =
  ({ x, y, s = 1, f = 0, color = KRP.ink }) => (
    <path d={`M -22 0 Q -11 ${-10 - Math.sin(f / 9) * 5} 0 -2 Q 11 ${-10 - Math.sin(f / 9) * 5} 22 0`}
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
  );

// 遠景のシルエット人物 (影だけ。足元 (x,y) アンカー、高さ約 185*s)
const SilPerson: React.FC<{ x: number; y: number; s?: number; color?: string; stick?: boolean; hat?: boolean; f?: number; phase?: number }> =
  ({ x, y, s = 1, color = "#4A3630", stick = false, hat = false, f = 0, phase = 0 }) => (
    <g transform={`translate(${x} ${y + Math.sin((f + phase * 17) / 13) * 2 * s}) scale(${s})`}>
      <path d={`M -4 -70 L ${-18 + Math.sin(f / 11 + phase) * 9} 0 M 4 -70 L ${18 - Math.sin(f / 11 + phase) * 9} 0`}
        stroke={color} strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d="M 0 -150 Q 32 -120 27 -60 L -27 -60 Q -32 -120 0 -150 Z" fill={color} />
      <circle cx={0} cy={-162} r={21} fill={color} />
      {hat && <path d="M -38 -172 L 38 -172 L 10 -194 L -10 -194 Z" fill={color} />}
      {stick && <line x1={32} y1={-118} x2={44} y2={0} stroke={color} strokeWidth={9} strokeLinecap="round" />}
    </g>
  );

// ローマ風オレンジ帯 (テラコッタ + 白い波飾り)。古代ローマの4シーン (#16〜#19) の署名。
// 夜景でも色は変えない (章のしるしなので)
const RomanBand: React.FC = () => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={96} fill={TKP.terracotta} opacity={0.9} />
    <line x1={-20} y1={78} x2={W + 20} y2={78} stroke={TKP.marble} strokeWidth={6} />
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M ${40 + i * 124} 44 q 26 -34 52 0 q -20 -12 -30 6`}
        fill="none" stroke={TKP.marble} strokeWidth={5} strokeLinecap="round" />
    ))}
  </g>
);

// #16 章扉: 時は2000年前、古代ローマ (暖色のクリーム→テラコッタ。地中海と神殿)
const SceneCh1Door: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={415} bg="linear-gradient(180deg,#F5E6C4 0%,#EDCB9A 55%,#DCA87E 100%)"
    over={
      <>
        <ChapterDoor num={1} title="旅には身分か口実が必要だった" t={seg(f, 18, 46)} />
        {f >= 44 && <Stamp x={150} y={168} text="2000年前" size={52} />}
      </>
    }>
    {/* 遠くの地中海 */}
    <path d="M -20 560 L 1940 560 L 1940 700 Q 1400 672 900 690 Q 400 708 -20 686 Z" fill="#7FA8C8" opacity={0.9} />
    <SeaGlints f={f} pts={[[300, 610], [620, 646], [980, 600], [1300, 640], [1660, 606], [800, 666]]} />
    {/* 手前の乾いた地面 */}
    <path d="M -20 672 Q 480 640 960 672 Q 1440 704 1940 680 L 1940 1100 L -20 1100 Z" fill="#E6C694" />
    <path d="M -20 672 Q 480 640 960 672 Q 1440 704 1940 680" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.25} />
    {/* 神殿と糸杉 */}
    <g transform={`translate(0 ${(1 - easeOut(seg(f, 0, 26))) * 60})`} opacity={easeOut(seg(f, 0, 26))}>
      <RomanTemple x={470} y={740} s={1.05} />
    </g>
    <Cypress x={140} y={762} s={1.12} f={f} />
    <Cypress x={806} y={748} s={0.8} f={f + 30} />
    <TogaPerson x={660} y={900} s={0.95} f={f} phase={1} face="smile" laurel />
    {/* 空に鳥 */}
    <BirdV x={1480} y={310} s={1.1} f={f} />
    <BirdV x={1610} y={258} s={0.75} f={f + 14} />
    <RomanBand />
  </Ch1Frame>
);

// #17 貴族たちは保養地バイアエへ (昼の地中海ブルー。湾を見下ろすパノラマ)
const SceneBaiae: React.FC<{ f: number }> = ({ f }) => {
  const px = lerp(340, 980, easeOut(seg(f, 6, 66)));
  return (
    <Ch1Frame f={f} seed={416} bg="linear-gradient(180deg,#A8CCE4 0%,#CFE3EE 52%,#EADFC4 100%)">
      {/* 太陽 */}
      <circle cx={320} cy={170} r={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
      <circle cx={320} cy={170} r={100} fill={KRP.yellow} opacity={0.18} />
      {/* 大きな湾 (奥へ広がる海) */}
      <path d="M -20 470 L 1940 430 L 1940 950 Q 1300 980 760 920 Q 320 870 -20 900 Z" fill="#7FA8C8" />
      <path d="M -20 470 L 1940 430 L 1940 520 Q 1200 548 -20 520 Z" fill="#A4C6DC" opacity={0.8} />
      <SeaGlints f={f} pts={[[420, 540], [760, 590], [1120, 520], [1480, 580], [1700, 500], [980, 660], [600, 700], [1340, 680], [860, 480]]} />
      {/* 帆かけ舟がゆれる */}
      <g transform={`translate(1430 ${560 + Math.sin(f / 26) * 6}) rotate(${Math.sin(f / 26) * 2})`}>
        <path d="M -70 0 Q 0 26 70 0 L 52 20 Q 0 40 -52 20 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={0} y1={0} x2={0} y2={-96} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 4 -92 Q 62 -58 8 -12 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 左手前の丘: 段々の別荘地 */}
      <path d="M -20 560 Q 280 470 560 580 Q 700 640 790 760 L 790 1100 L -20 1100 Z" fill={TKP.tuscany} />
      <path d="M -20 560 Q 280 470 560 580 Q 700 640 790 760" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
      <path d="M -20 700 Q 300 640 700 730 M -20 840 Q 320 780 790 880" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.18} />
      <Villa x={170} y={620} s={0.62} />
      <Villa x={400} y={580} s={0.52} />
      <Villa x={330} y={770} s={0.82} />
      <Cypress x={82} y={700} s={0.62} f={f} />
      <Cypress x={520} y={636} s={0.5} f={f + 20} />
      <Cypress x={560} y={820} s={0.74} f={f + 40} />
      {/* 海沿いの道 */}
      <path d="M 560 1100 Q 700 950 980 910 Q 1400 840 1940 880 L 1940 1100 Z" fill="#E3C9A0" />
      <path d="M 560 1100 Q 700 950 980 910 Q 1400 840 1940 880" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.25} />
      {/* 道しるべ: バイアエ */}
      <g transform={`translate(1600 880) scale(${pop(seg(f, 0, 16)) * 0.92})`}>
        <rect x={-14} y={-200} width={28} height={200} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -150 -200 L 120 -200 L 170 -156 L 120 -112 L -150 -112 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={-10} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>バイアエ</text>
      </g>
      {/* 貴族ふたりが湾沿いを行く */}
      <TogaPerson x={px} y={920} s={0.92} f={f} phase={2} face="smile" laurel />
      <TogaPerson x={px - 220} y={930} s={0.85} f={f} phase={3} face="smile" />
      {/* カモメ */}
      <BirdV x={1180} y={300} s={1.0} f={f} />
      <BirdV x={1320} y={250} s={0.7} f={f + 12} />
      <BirdV x={1060} y={236} s={0.6} f={f + 24} />
      <RomanBand />
    </Ch1Frame>
  );
};

// #18 温泉、宴会、海辺の別荘 (夕暮れの金色。枠で並べず1つの情景に共存させる)
const SceneOnsenUtage: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={417} bg="linear-gradient(180deg,#F2CE9C 0%,#EDB387 55%,#D9906C 100%)">
    {/* 沈む夕陽と海 */}
    <circle cx={1240} cy={538} r={92} fill="#F6C27A" stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
    <circle cx={1240} cy={538} r={150} fill="#F6C27A" opacity={0.22} />
    <path d="M -20 560 L 1940 560 L 1940 870 Q 1200 900 600 860 Q 200 830 -20 850 Z" fill="#5E7490" />
    {/* 夕陽の光の道 (海面の反射) */}
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={1240 - 60 - i * 14} y1={612 + i * 52} x2={1240 + 60 + i * 14} y2={612 + i * 52}
        stroke="#F6C888" strokeWidth={12} strokeLinecap="round"
        opacity={0.8 - i * 0.12 + Math.sin(f / 13 + i) * 0.12} />
    ))}
    <SeaGlints f={f} pts={[[420, 640], [700, 700], [1660, 640], [900, 620]]} color="#EAC8A0" />
    {/* 右の岬: 海辺の別荘 */}
    <path d="M 1430 880 Q 1444 680 1570 616 Q 1700 552 1940 566 L 1940 880 Z" fill="#8A6A58" opacity={0.95} />
    <path d="M 1430 880 Q 1444 680 1570 616 Q 1700 552 1940 566" fill="none" stroke="#5E4638" strokeWidth={5} opacity={0.6} />
    <g opacity={easeOut(seg(f, 40, 56))}>
      <Villa x={1700} y={592} s={0.78} />
      <Cypress x={1540} y={660} s={0.56} f={f} />
      <Cypress x={1866} y={600} s={0.48} f={f + 22} />
    </g>
    {/* 手前のテラス (大理石) */}
    <path d="M -20 820 Q 500 790 1100 830 Q 1560 860 1940 850 L 1940 1100 L -20 1100 Z" fill="#E8D4B0" />
    <path d="M -20 820 Q 500 790 1100 830 Q 1560 860 1940 850" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {/* 左: 大理石の湯船につかるふたり + 湯気 */}
    <g transform={`translate(390 800) scale(${pop(seg(f, 4, 20))})`}>
      <ellipse cx={0} cy={96} rx={215} ry={22} fill={KRP.ink} opacity={0.12} />
      <path d="M -130 60 L 130 60 L 158 96 L -158 96 Z" fill="#CBB890" stroke={KRP.ink} strokeWidth={5} />
      <path d="M -190 -44 L 190 -44 Q 168 66 0 66 Q -168 66 -190 -44 Z" fill={TKP.marble} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-44} rx={190} ry={28} fill={TKP.seaBlue} stroke={KRP.ink} strokeWidth={5} />
      {[-62, 48].map((hx, i) => (
        <g key={i}>
          <circle cx={hx} cy={-82 + Math.sin(f / 20 + i * 2) * 3} r={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${hx - 15} ${-76 + Math.sin(f / 20 + i * 2) * 3} Q ${hx} ${-64 + Math.sin(f / 20 + i * 2) * 3} ${hx + 15} ${-76 + Math.sin(f / 20 + i * 2) * 3}`}
            fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          <circle cx={hx - 12} cy={-88 + Math.sin(f / 20 + i * 2) * 3} r={3.2} fill={KRP.ink} />
          <circle cx={hx + 12} cy={-88 + Math.sin(f / 20 + i * 2) * 3} r={3.2} fill={KRP.ink} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${-80 + i * 76} ${-110 - ((f * 1.2 + i * 26) % 60)} q -12 -16 0 -30 q 12 -14 0 -30`}
          fill="none" stroke={TKP.steam} strokeWidth={9} strokeLinecap="round" opacity={0.85 - ((f * 1.2 + i * 26) % 60) / 70} />
      ))}
    </g>
    {/* 中央: 杯をかかげる貴族 (宴会) */}
    <TogaPerson x={880} y={930} s={0.95} f={f} phase={4} face="smile" laurel />
    <g transform={`translate(980 ${726 + bobOf(f, 4)}) scale(${pop(seg(f, 22, 38))})`}>
      <WineCup x={0} y={0} s={1.1} />
      <Burst x={0} y={-66} r={44} n={8} color={KRP.yellow} t={seg(f, 30, 44)} />
    </g>
    <BirdV x={520} y={330} s={0.9} f={f} color="#7E5A48" />
    <RomanBand />
  </Ch1Frame>
);

// #19 「ローマ帝国のラスベガス」歓楽の町 (夜の紺。灯りが海面にゆれる)
const SceneKanrakuMachi: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={418} dark bg="linear-gradient(180deg,#1C2740 0%,#2C3A58 60%,#3E4A66 100%)">
    <Stars f={f} n={30} yMax={380} />
    {/* 月 */}
    <circle cx={1660} cy={180} r={56} fill="#EFE6C8" stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
    <circle cx={1660} cy={180} r={92} fill="#EFE6C8" opacity={0.12} />
    {/* 水ぎわの町のシルエット (窓あかりがちらつく) */}
    <g>
      {([[120, 520, 120], [280, 480, 150], [1380, 500, 140], [1580, 540, 110], [1740, 490, 160]] as const).map(([bx, by, bw], i) => (
        <g key={i}>
          <rect x={bx} y={by} width={bw} height={660 - by + 40} fill="#141A2C" />
          {[0, 1, 2, 3].map((wi) => (
            <rect key={wi} x={bx + 18 + (wi % 2) * (bw / 2)} y={by + 24 + Math.floor(wi / 2) * 60}
              width={24} height={32} rx={4} fill={KRP.yellow}
              opacity={0.55 + 0.4 * (0.5 + 0.5 * Math.sin(f / 11 + i * 2.7 + wi * 1.9))} />
          ))}
        </g>
      ))}
      {/* 中央の神殿シルエット (柱のあいだに暖かい光) */}
      <g transform="translate(900 660)">
        <rect x={-250} y={-36} width={500} height={36} fill="#141A2C" />
        <path d="M -280 -236 L 0 -320 L 280 -236 Z" fill="#141A2C" />
        <rect x={-260} y={-236} width={520} height={28} fill="#141A2C" />
        {[-200, -100, 0, 100, 200].map((cxp) => (
          <rect key={cxp} x={cxp - 24} y={-208} width={48} height={172} fill="#141A2C" />
        ))}
        {[-150, -50, 50, 150].map((gxp, i) => (
          <rect key={gxp} x={gxp - 22} y={-200} width={44} height={164} fill="#E8A85C"
            opacity={0.5 + 0.3 * (0.5 + 0.5 * Math.sin(f / 9 + i * 1.3))} />
        ))}
      </g>
    </g>
    {/* 夜の海と、灯りの金の反射 (縦ゆらぎ) */}
    <path d="M -20 660 L 1940 660 L 1940 880 Q 1200 900 600 870 Q 200 850 -20 866 Z" fill="#16203A" />
    {[300, 560, 820, 1080, 1440, 1700].map((rx, i) => (
      <path key={i} d={`M ${rx + Math.sin(f / 15 + i) * 6} 672 q ${8 * Math.sin(f / 10 + i * 2)} 50 0 100 q ${-8 * Math.sin(f / 10 + i)} 40 0 80`}
        fill="none" stroke={i % 2 ? "#F2CE4C" : "#E8C06A"} strokeWidth={10} strokeLinecap="round"
        opacity={0.5 + 0.25 * (0.5 + 0.5 * Math.sin(f / 13 + i * 1.8))} />
    ))}
    {/* 手前の波止場 */}
    <path d="M -20 856 Q 500 830 1100 866 Q 1560 890 1940 876 L 1940 1100 L -20 1100 Z" fill="#2A3248" />
    <path d="M -20 856 Q 500 830 1100 866 Q 1560 890 1940 876" fill="none" stroke="#0E1424" strokeWidth={5} opacity={0.8} />
    {/* 提灯ロープ */}
    <path d={`M -20 300 Q 480 ${392 + Math.sin(f / 30) * 8} 960 350 Q 1400 ${314 + Math.sin(f / 26) * 8} 1940 380`}
      fill="none" stroke="#0E1424" strokeWidth={5} opacity={0.9} />
    {Array.from({ length: 7 }, (_, i) => {
      const lx = 120 + i * 280;
      const ly = 330 + Math.sin((lx / 500) + 1.8) * 46 + Math.sin(f / 24 + i) * 5;
      return (
        <g key={i} transform={`translate(${lx} ${ly}) rotate(${Math.sin(f / 22 + i * 1.5) * 7})`}>
          <line x1={0} y1={-14} x2={0} y2={0} stroke="#0E1424" strokeWidth={4} />
          <ellipse cx={0} cy={22} rx={17} ry={24} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5}
            opacity={0.75 + 0.25 * (0.5 + 0.5 * Math.sin(f / 7 + i * 1.4))} />
        </g>
      );
    })}
    {/* 杯をかかげる貴族たちと足元の灯りだまり */}
    <ellipse cx={560} cy={928} rx={190} ry={36} fill={KRP.yellow} opacity={0.24} />
    <ellipse cx={1370} cy={928} rx={190} ry={36} fill={KRP.yellow} opacity={0.24} />
    <TogaPerson x={560} y={930} s={0.9} f={f} phase={4} face="smile" />
    <g transform={`translate(640 ${730 + bobOf(f, 4)})`}><WineCup x={0} y={0} s={0.9} /></g>
    <TogaPerson x={1370} y={930} s={0.9} f={f} phase={5} face="smile" laurel />
    <g transform={`translate(1290 ${730 + bobOf(f, 5)})`}><WineCup x={0} y={0} s={0.9} /></g>
    {/* 音楽の記号 */}
    {[0, 1, 2].map((i) => {
      const yy = ((f * 1.5 + i * 50) % 140);
      return (
        <text key={i} x={960 + (i - 1) * 150} y={560 - yy} fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={KRP.orange} opacity={1 - yy / 150} textAnchor="middle">♪</text>
      );
    })}
    <RomanBand />
  </Ch1Frame>
);

// #20 楽しむための旅は大昔からあった (明るい朝の色で章の前半を締める)
const SceneMukashiKara: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={419} bg="linear-gradient(180deg,#BFD9EA 0%,#E8EEE4 55%,#F2E8CC 100%)">
    {/* やわらかい朝の光 */}
    <circle cx={960} cy={120} r={210} fill={KRP.yellow} opacity={0.14} />
    <SeaGlints f={f} pts={[[300, 180], [1620, 220], [760, 120], [1260, 150]]} color={KRP.yellow} w={16} />
    {/* 年表 */}
    <g opacity={easeOut(seg(f, 0, 14))}>
      <line x1={240} y1={700} x2={1680} y2={700} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M 1680 700 l -34 -20 v 40 Z" fill={KRP.ink} />
      <TagPlate x={360} y={770} text="2000年前" size={30} />
      <TagPlate x={1560} y={770} text="いま" size={30} />
    </g>
    {/* 左: 大昔の楽しむ旅 (ローマの石畳の島) */}
    <ellipse cx={370} cy={636} rx={210} ry={44} fill="#D8CBAE" stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
    <path d="M 260 652 h 70 M 350 664 h 80 M 430 648 h 60" stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
    <Cypress x={222} y={636} s={0.44} f={f} />
    <TogaPerson x={380} y={626} s={0.8} f={f} phase={6} face="smile" laurel />
    <g transform={`translate(475 ${474 + bobOf(f, 6)})`}><WineCup x={0} y={0} s={0.8} /></g>
    {/* 右: いまの楽しむ旅 (草地の島) */}
    <ellipse cx={1500} cy={636} rx={210} ry={44} fill="#CFE0D2" stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
    <ModernTraveler x={1500} y={626} s={0.8} f={f} phase={7} face="smile" />
    {/* 大きな暖色のアーチでつながる = ずっとあった */}
    <path d="M 480 430 Q 960 260 1380 430" fill="none" stroke={KRP.orange} strokeWidth={10}
      strokeDasharray="22 16" pathLength={1} strokeDashoffset={1 - easeOut(seg(f, 24, 56))}
      style={{ strokeDasharray: 1 } as React.CSSProperties}
      opacity={0.9} strokeLinecap="round" />
    <CheckMark x={960} y={300} s={1.2} t={seg(f, 48, 62)} />
    <BirdV x={1700} y={160} s={0.8} f={f} />
  </Ch1Frame>
);

// #21 ただし楽しめたのは身分のある人だけ (リニューアル前の形に全戻し)
const SceneMibunDake: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={420}>
    <RomaBg f={f} sea={false} />
    {/* 左: 台座の上の貴族 (○) */}
    <g>
      <rect x={220} y={690} width={440} height={60} rx={10} fill={TKP.marble} stroke={KRP.ink} strokeWidth={6} />
      <rect x={270} y={640} width={340} height={50} rx={8} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5} />
      <TogaPerson x={440} y={645} s={0.95} f={f} phase={8} face="smile" laurel />
      <g transform={`translate(440 260) scale(${pop(seg(f, 20, 36))})`}>
        <circle cx={0} cy={0} r={58} fill="none" stroke={KRP.green} strokeWidth={16} />
      </g>
    </g>
    {/* 右: ロープの向こうの庶民 (✗) */}
    <g>
      <Shomin x={1430} y={900} s={0.95} f={f} phase={9} face="worried" gaze={[-6, 0]} />
      {/* ロープ柵 */}
      <g opacity={easeOut(seg(f, 10, 26))}>
        <rect x={1090} y={640} width={22} height={260} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={1090} y={340} width={22} height={240} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0} />
        <path d={`M 1101 660 Q 1240 ${700 + Math.sin(f / 18) * 8} 1380 668`} fill="none" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
        <rect x={1370} y={640} width={22} height={260} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <CrossMark x={1430} y={300} s={1.3} t={seg(f, 40, 56)} />
    </g>
  </Frame>
);

// #22 庶民の移動 = 仕事か、逃亡か、戦争 (クリーム地を縦3分割。白顔の庶民が3つの役を演じる)
const SceneShominIdou: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={421}>
    {/* 3コマの下地 (うっすら色ちがい) */}
    <rect x={-20} y={-20} width={660} height={H + 40} fill={KRP.yellow} opacity={0.1} />
    <rect x={1280} y={-20} width={660} height={H + 40} fill={KRP.red} opacity={0.07} />
    {/* コマの区切り線 */}
    {[640, 1280].map((dx) => (
      <line key={dx} x1={dx} y1={120} x2={dx} y2={900} stroke={KRP.ink} strokeWidth={5}
        opacity={0.3} strokeDasharray="16 14" />
    ))}
    {/* 各コマの地面線 */}
    <path d="M 60 880 Q 320 868 580 880 M 700 880 Q 960 868 1220 880 M 1340 880 Q 1600 868 1860 880"
      fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {/* 左: 仕事 — 道具をかついで歩く */}
    <g opacity={easeOut(seg(f, 4, 18))}>
      <TagPlate x={320} y={240} text="仕事" size={40} t={seg(f, 6, 20)} />
      <Shomin x={300} y={876} s={0.95} f={f} phase={10} face="normal" gaze={[5, 0]} lean={2} />
      {/* 肩にかついだ金づち (顔に被らないよう外側へ倒す) */}
      <g transform={`translate(380 ${726 + bobOf(f, 10)}) rotate(42)`}>
        <line x1={-16} y1={64} x2={0} y2={-66} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
        <rect x={-36} y={-108} width={72} height={46} rx={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </g>
    {/* 中央: 逃亡 — 荷をかかえて汗だくで走る */}
    <g opacity={easeOut(seg(f, 24, 38))}>
      <TagPlate x={960} y={240} text="逃亡" size={40} t={seg(f, 26, 40)} />
      {/* 背中の荷物 (人物より先に描いて背中側に。顔に被らない) */}
      <g transform={`translate(1096 ${736 + bobOf(f, 11)}) rotate(14)`}>
        <ellipse cx={0} cy={0} rx={56} ry={42} fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -36 -20 Q 0 -46 36 -20" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      </g>
      <Shomin x={980} y={876} s={0.95} f={f} phase={11} face="worried" gaze={[6, 0]} lean={10} />
      <Sweat x={1046} y={566} f={f} />
      {/* 走りのスピード線 */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={742 - i * 18 + ((f * 4) % 26)} y1={620 + i * 66} x2={836 - i * 18 + ((f * 4) % 26)} y2={620 + i * 66}
          stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
      ))}
    </g>
    {/* 右: 戦争 — 槍と盾を持たされて歩く兵隊 */}
    <g opacity={easeOut(seg(f, 44, 58))}>
      <TagPlate x={1600} y={240} text="戦争" size={40} t={seg(f, 46, 60)} />
      <Person x={1580} y={876} s={0.95} f={f} phase={12} face="worried" gaze={[4, 0]} lean={2}
        hair="none" cloth={TKP.woodLight} clothDark={TKP.woodDark} />
      {/* ローマ兵のかぶと (銀の鉢がね + 赤い毛飾り)。共用の白ヘルメットは現代風なので使わない */}
      <g transform={`translate(1588 ${646 + bobOf(f, 12)}) rotate(2)`}>
        <path d="M -46 -62 Q 0 -110 46 -62 Q 0 -82 -46 -62 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -62 -18 Q -64 -70 0 -72 Q 64 -70 62 -18 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-68} y={-22} width={136} height={13} rx={6.5} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 右手の槍 */}
      <g transform={`translate(1672 ${876 + bobOf(f, 12)})`}>
        <line x1={0} y1={0} x2={0} y2={-356} stroke={TKP.woodDark} strokeWidth={10} strokeLinecap="round" />
        <path d="M 0 -356 l -15 -16 L 0 -408 l 15 36 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 左手の盾 */}
      <g transform={`translate(1500 ${706 + bobOf(f, 12)})`}>
        <ellipse cx={0} cy={0} rx={52} ry={66} fill={TKP.terracotta} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  </Frame>
);

// #23 travel = travail (とされる)。v1の比較カードに、意味を演じるふたりを足した
const SceneTravelTravail: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={422}>
    {/* 左: travel */}
    <g transform={`translate(520 420) scale(${pop(seg(f, 0, 16))})`}>
      <rect x={-250} y={-150} width={500} height={300} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.blueDeep}>travel</text>
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>旅</text>
    </g>
    {/* travel の下: うきうき歩く人 */}
    <g opacity={easeOut(seg(f, 8, 22))}>
      <path d="M 320 926 Q 520 914 720 926" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
      <Shomin x={500} y={922} s={0.8} f={f} phase={13} face="smile" gaze={[5, -2]} lean={2} />
      {/* 鼻歌の音符 */}
      <text x={610} y={640 - ((f * 0.8) % 36)} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={40} fill={KRP.blueDeep} opacity={0.8 - ((f * 0.8) % 36) / 50}>♪</text>
    </g>
    {/* 右: travail */}
    <g transform={`translate(1400 420) scale(${pop(seg(f, 20, 36))})`}>
      <rect x={-250} y={-150} width={500} height={300} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.red}>travail</text>
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>苦役</text>
    </g>
    {/* travail の下: 重い荷に耐える人 */}
    <g opacity={easeOut(seg(f, 28, 42))}>
      <path d="M 1200 926 Q 1400 914 1600 926" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
      {/* 背中の大荷物 (人物より先に描いて背中側に。顔に被らない) */}
      <g transform={`translate(1462 ${776 + bobOf(f, 14)}) rotate(12)`}>
        <ellipse cx={0} cy={0} rx={66} ry={50} fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -44 -26 Q 0 -52 44 -26" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      </g>
      <Shomin x={1380} y={926} s={0.8} f={f} phase={14} face="worried" gaze={[-3, 3]} lean={7} />
      <Sweat x={1300} y={660} f={f} />
    </g>
    {/* = 記号 */}
    <g transform={`translate(960 420) scale(${pop(seg(f, 40, 54))})`} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round">
      <line x1={-54} y1={-22} x2={54} y2={-22} />
      <line x1={-54} y1={22} x2={54} y2={22} />
    </g>
    {/* 断定しない注記 */}
    <TagPlate x={960} y={700} text="※ もとは同じ言葉 — とされる" size={30} t={seg(f, 48, 62)} color={KRP.grayDark} />
  </Frame>
);

// #24 さかのぼると拷問の道具に行き着くという説 (章の最暗部。蝋燭あかりと杭の影)
const SceneGoumonSetsu: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.85 + 0.15 * Math.sin(f / 4.6) * Math.sin(f / 7.3);
  return (
    <Ch1Frame f={f} seed={423} dark bg="linear-gradient(180deg,#241F1C 0%,#3A322C 60%,#4E4238 100%)">
      <defs>
        <radialGradient id="g24glow">
          <stop offset="0" stopColor="#E8A85C" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#E8A85C" stopOpacity="0.16" />
          <stop offset="1" stopColor="#E8A85C" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 石の床 */}
      <path d="M -20 870 L 1940 870 L 1940 1100 L -20 1100 Z" fill="#2E2824" />
      <path d="M 120 904 h 150 M 420 926 h 170 M 820 910 h 150 M 1300 922 h 160 M 1660 902 h 140"
        stroke="#17120E" strokeWidth={5} opacity={0.8} />
      {/* 蝋燭の光 */}
      <circle cx={320} cy={760} r={560} fill="url(#g24glow)" opacity={flick} />
      <g transform="translate(320 870)">
        <rect x={-30} y={-130} width={60} height={130} rx={9} fill="#E8DCC0" stroke="#17120E" strokeWidth={5} />
        <path d="M -30 -130 q 16 14 30 0 q 16 12 30 0" fill="none" stroke="#C9B88E" strokeWidth={5} />
        <line x1={0} y1={-130} x2={0} y2={-148} stroke="#17120E" strokeWidth={4} />
        <g transform={`translate(0 -176) scale(${0.9 + Math.sin(f / 4.6) * 0.12} ${1 + Math.sin(f / 3.8) * 0.14}) rotate(${Math.sin(f / 5.4) * 6})`}>
          <path d="M 0 28 Q -20 6 -10 -16 Q 0 -34 0 -34 Q 0 -34 10 -16 Q 20 6 0 28 Z" fill={KRP.yellow} />
          <path d="M 0 22 Q -9 8 -4 -6 Q 0 -14 0 -14 Q 0 -14 4 -6 Q 9 8 0 22 Z" fill={KRP.orange} />
        </g>
        {/* 燭台の皿 */}
        <ellipse cx={0} cy={0} rx={56} ry={13} fill="#17120E" />
      </g>
      {/* tripalium: 三本の杭のシルエット (蝋燭側にリムライト) */}
      <g opacity={easeOut(seg(f, 18, 38))}>
        {([[-90, -24], [0, 0], [92, 26]] as const).map(([dx, tilt], i) => (
          <g key={i} transform={`translate(${830 + dx} 876) rotate(${tilt / 4})`}>
            <rect x={-20} y={-440} width={40} height={440} fill="#120E0C" />
            <path d="M -20 -440 L 20 -440 L 0 -482 Z" fill="#120E0C" />
            <line x1={-17} y1={-430} x2={-17} y2={-20} stroke="#E8A85C" strokeWidth={5} opacity={0.5 * flick} />
          </g>
        ))}
        {/* 横木と縄 */}
        <rect x={660} y={656} width={340} height={26} rx={6} fill="#120E0C" transform="rotate(3 830 668)" />
        <path d="M 742 650 q 10 26 -4 46 M 918 668 q 10 26 -4 46" fill="none" stroke="#E8A85C" strokeWidth={4} opacity={0.4 * flick} />
        <text x={830} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
          fill="#EADFC2" opacity={0.9 * easeOut(seg(f, 30, 44))}>tripalium</text>
      </g>
      {/* 右上: 前のシーンのことばの残像から、さかのぼる */}
      <text x={1520} y={270} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66}
        fill="#C9B088" opacity={0.55}>travail</text>
      <g opacity={easeOut(seg(f, 8, 26))}>
        <path d="M 1430 320 Q 1230 420 1040 480" fill="none" stroke="#C9B088" strokeWidth={9}
          strokeLinecap="round" strokeDasharray="22 18" opacity={0.6} />
        <path d="M 1040 480 l 44 -32 l -8 50 Z" fill="#C9B088" opacity={0.6} />
        <text x={1340} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34}
          fill="#C9B088" opacity={0.85}>さかのぼると…</text>
      </g>
      {/* 断定しない注記 */}
      <TagPlate x={1430} y={700} text="※ 拷問の道具 — という説まで" size={30} t={seg(f, 46, 60)} color={KRP.grayDark} fill="#EADFC2" />
    </Ch1Frame>
  );
};

// #25 道は危険、宿は少なく、山賊も出る (薄暮の森。道が暗がりへ消えていく)
const SceneMichiKiken: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={424} dark bg="linear-gradient(180deg,#70808C 0%,#7E8878 55%,#46503E 100%)">
    {/* 遠い霧の木立 */}
    <path d="M -20 520 Q 200 470 420 510 Q 660 460 900 508 Q 1200 462 1500 506 Q 1740 470 1940 510 L 1940 640 L -20 640 Z"
      fill="#5E6A58" opacity={0.55} />
    {/* 曲がりくねる道 (奥の暗い森へ吸い込まれる) */}
    <path d="M 340 1100 Q 240 920 520 840 Q 860 750 700 672 Q 580 614 900 560 Q 1080 530 1150 492"
      fill="none" stroke="#C2AA80" strokeWidth={86} strokeLinecap="round" opacity={0.9} />
    <path d="M 340 1100 Q 240 920 520 840 Q 860 750 700 672 Q 580 614 900 560 Q 1080 530 1150 492"
      fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="3 30" opacity={0.4} />
    {/* 遠くにぽつんと一軒の宿 (窓にひとつだけ灯り) */}
    <g transform="translate(300 470)" opacity={easeOut(seg(f, 8, 24))}>
      <rect x={-80} y={-70} width={160} height={70} fill="#5A5248" stroke={KRP.ink} strokeWidth={5} />
      <path d="M -96 -70 L 0 -130 L 96 -70 Z" fill="#3E382E" stroke={KRP.ink} strokeWidth={5} />
      <rect x={14} y={-52} width={34} height={34} rx={5} fill={KRP.yellow} opacity={0.75 + Math.sin(f / 9) * 0.2} stroke={KRP.ink} strokeWidth={4} />
      <TagPlate x={0} y={66} text="宿はまばら" size={26} fill="#E8E0C8" />
    </g>
    {/* 奥の暗い森のかたまり */}
    <g opacity={0.96}>
      {([[1190, 560, 1.35], [1420, 600, 1.7], [1700, 580, 1.5], [1300, 680, 1.9], [1600, 720, 2.1], [1060, 640, 1.2]] as const).map(([tx, ty, ts], i) => (
        <g key={i} transform={`translate(${tx} ${ty}) scale(${ts})`}>
          <path d="M 0 -170 Q 52 -128 36 -78 Q 64 -42 28 -16 L -28 -16 Q -64 -42 -36 -78 Q -52 -128 0 -170 Z"
            fill="#2E3428" stroke="#1C221A" strokeWidth={4} />
          <rect x={-10} y={-18} width={20} height={32} fill="#1C221A" />
        </g>
      ))}
    </g>
    {/* 森の暗がりに山賊の気配 (白い目と刃のきらり) */}
    <g opacity={easeOut(seg(f, 34, 48))}>
      <path d="M 1310 840 Q 1290 700 1360 640 Q 1440 600 1470 700 Q 1490 790 1440 840 Z" fill="#1C221A" />
      <circle cx={1372} cy={700} r={7} fill={KRP.white} opacity={0.9} />
      <circle cx={1414} cy={704} r={7} fill={KRP.white} opacity={0.9} />
      <line x1={1310} y1={760} x2={1258} y2={700} stroke={KRP.silver} strokeWidth={9} strokeLinecap="round"
        opacity={0.4 + 0.5 * (0.5 + 0.5 * Math.sin(f / 8))} />
    </g>
    <Burst x={1360} y={560} r={60} t={seg(f, 46, 60)} color={KRP.red} n={8} />
    {/* 手前の地面と、振り返る旅人 */}
    <path d="M -20 920 Q 480 880 960 916 Q 1440 950 1940 920 L 1940 1100 L -20 1100 Z" fill="#3A4232" />
    <Shomin x={740} y={900} s={0.95} f={f} phase={11} face="surprised" gaze={[6, -2]} />
    {/* 立ちこめる霧 */}
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((i * 700 + f * 0.4) % 2100) - 80} cy={600 + i * 110}
        rx={300} ry={30} fill={KRP.white} opacity={0.08} />
    ))}
    <BirdV x={1180} y={300} s={0.9} f={f} color="#2A2E26" />
  </Ch1Frame>
);

// #26 歩くしかない時代、旅は命がけ (巨大な夕暮れの山並みに、旅人は小さい)
const SceneInochigake: React.FC<{ f: number }> = ({ f }) => {
  const sunY = 400 + seg(f, 0, 90) * 14;
  return (
    <Ch1Frame f={f} seed={425} bg="linear-gradient(180deg,#E0A878 0%,#C08A78 40%,#705E6E 72%,#4A4458 100%)">
      {/* 稜線に沈む大きな太陽 */}
      <circle cx={520} cy={sunY} r={210} fill="#F6C888" opacity={0.2} />
      <circle cx={520} cy={sunY} r={130} fill="#F6C888" opacity={0.95} />
      {/* 山の重なり (遠→近) */}
      <path d="M -20 500 Q 240 420 500 486 Q 780 400 1060 476 Q 1380 396 1660 470 Q 1820 440 1940 466 L 1940 1100 L -20 1100 Z" fill="#6E5A68" opacity={0.85} />
      <path d="M -20 620 Q 300 520 640 600 Q 1000 500 1340 596 Q 1660 520 1940 590 L 1940 1100 L -20 1100 Z" fill="#584A58" />
      <path d="M -20 760 Q 360 660 760 730 Q 1200 640 1560 724 Q 1780 680 1940 716 L 1940 1100 L -20 1100 Z" fill="#403A48" />
      {/* 稜線を縫うつづら折りの細道 */}
      <path d="M 1800 712 L 1500 724 Q 1380 716 1430 690 L 1180 700 Q 1080 696 1130 668 L 920 676 Q 840 672 880 648 L 700 652"
        fill="none" stroke="#D9B088" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} strokeDasharray="16 12" />
      {/* 小さな旅人 (杖をついて、ひとり)。遠くても白顔の標準キャラで */}
      <g transform={`translate(0 ${bobOf(f, 13) * 0.4})`}>
        <line x1={1232} y1={656} x2={1218} y2={714} stroke={TKP.woodDark} strokeWidth={6} strokeLinecap="round" />
      </g>
      <Shomin x={1280} y={712} s={0.5} f={f} phase={13} face="normal" gaze={[-5, 0]} lean={-3} />
      {/* 手前の暗い地面 */}
      <path d="M -20 880 Q 480 840 1000 876 Q 1480 908 1940 878 L 1940 1100 L -20 1100 Z" fill="#2E2A38" />
      {/* 夕空の鳥 */}
      <BirdV x={880} y={260} s={1.0} f={f} color="#4A3A44" />
      <BirdV x={1010} y={220} s={0.7} f={f + 16} color="#4A3A44" />
    </Ch1Frame>
  );
};

// #27 身分のない人が遠くへ行きたくなったら? (夜明け前の静けさ。地平だけが明るい)
const SceneDouSuru: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={426} dark bg="linear-gradient(180deg,#202A46 0%,#32405E 45%,#6E6278 75%,#D9A078 100%)">
    {/* 消え残りの星と、明けの明星 */}
    <Stars f={f} n={18} yMax={320} op={0.7} />
    <g transform="translate(1240 220)">
      <circle cx={0} cy={0} r={8} fill={KRP.white} />
      <path d="M 0 -26 L 0 26 M -26 0 L 26 0" stroke={KRP.white} strokeWidth={4} strokeLinecap="round"
        opacity={0.5 + 0.4 * (0.5 + 0.5 * Math.sin(f / 15))} />
    </g>
    {/* 地平の光 */}
    <ellipse cx={1100} cy={820} rx={900} ry={240} fill="#F2C088" opacity={0.3} />
    {/* 遠い丘と、小さな聖地のシルエット */}
    <path d="M 900 800 Q 1400 660 1940 760 L 1940 1100 L 900 1100 Z" fill="#332C40" />
    <g transform="translate(1600 712)" opacity={easeOut(seg(f, 20, 40))}>
      <circle cx={0} cy={-70} r={120} fill={KRP.yellow} opacity={0.14} />
      <path d="M -110 0 L -110 -16 L 110 -16 L 110 0 Z M -118 -82 L 0 -118 L 118 -82 L 118 -70 L -118 -70 Z" fill="#241E30" />
      {[-84, -42, 0, 42, 84].map((cxp) => (
        <rect key={cxp} x={cxp - 9} y={-70} width={18} height={54} fill="#241E30" />
      ))}
    </g>
    {/* 地平へ続く細い道 (まだ誰も歩いていない) */}
    <path d="M 480 840 Q 900 850 1300 790 Q 1480 762 1580 724" fill="none" stroke="#D9A078"
      strokeWidth={7} strokeLinecap="round" strokeDasharray="4 26" opacity={0.5} />
    {/* 手前の暗い丘で、遠くを見る庶民 */}
    <path d="M -20 800 Q 320 710 700 810 Q 1100 900 1940 850 L 1940 1100 L -20 1100 Z" fill="#241E30" />
    <Shomin x={400} y={800} s={1.05} f={f} phase={14} face="worried" gaze={[7, -4]} />
    <QMark x={560} y={360} s={1.15} f={f} t={seg(f, 36, 52)} color="#E8B46A" />
  </Ch1Frame>
);

// #28 堂々と使える口実が、たったひとつだけ (闇に一筋、天からの光の帯)
const SceneTattaHitotsu: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 16, 44));
  const beam = seg(f, 4, 20);
  return (
    <Ch1Frame f={f} seed={427} dark bg="linear-gradient(180deg,#232A4A 0%,#3A3A5E 60%,#5E5064 100%)">
      <defs>
        <linearGradient id="g28beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6DE9C" stopOpacity="0.6" />
          <stop offset="0.75" stopColor="#F6DE9C" stopOpacity="0.2" />
          <stop offset="1" stopColor="#F6DE9C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <Stars f={f} n={22} yMax={360} op={0.55} />
      {/* 暗い地面 */}
      <path d="M -20 900 Q 500 870 1000 898 Q 1460 922 1940 900 L 1940 1100 L -20 1100 Z" fill="#2A2440" />
      {/* 天からの光の帯 (外側の広い帯 + 内側の濃い帯) */}
      <path d="M 700 -20 L 1220 -20 L 1380 900 L 540 900 Z" fill="url(#g28beam)" opacity={0.7 * beam} />
      <path d="M 830 -20 L 1090 -20 L 1180 900 L 740 900 Z" fill="url(#g28beam)" opacity={beam} />
      {/* 床の光だまり */}
      <ellipse cx={960} cy={896} rx={400} ry={54} fill="#F6DE9C" opacity={0.2 * beam} />
      {/* 帯の中を舞う光の粒 */}
      {Array.from({ length: 8 }, (_, i) => {
        const yy = ((i * 173 + f * (1.1 + (i % 3) * 0.4)) % 840) + 40;
        const xx = 960 + Math.sin(f / 30 + i * 2.2) * (60 + i * 14);
        return <circle key={i} cx={xx} cy={yy} r={i % 3 === 0 ? 5 : 3.4} fill="#F6DE9C" opacity={0.5 * beam} />;
      })}
      {/* 降りてくる「口実」の札 (背後に金の光輪) */}
      <circle cx={960} cy={lerp(-160, 480, drop)} r={250} fill="#F6DE9C" opacity={0.16 * drop} />
      <g transform={`translate(960 ${lerp(-160, 480, drop)}) rotate(${Math.sin(f / 20) * 3})`}>
        <rect x={-230} y={-130} width={460} height={260} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} fill={KRP.ink}>口実</text>
        <circle cx={-170} cy={-70} r={34} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <text x={-170} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.white}>1</text>
      </g>
      <Burst x={960} y={480} r={160} t={seg(f, 44, 62)} color={KRP.yellow} n={12} />
      {/* 光を見上げる庶民 */}
      <Shomin x={500} y={930} s={0.9} f={f} phase={15} face="surprised" gaze={[6, -6]} />
    </Ch1Frame>
  );
};

// #29 「神様に、会いに行ってきます」 (暁のグラデーション。好評の光の帯は維持)
const SceneKamisamaAini: React.FC<{ f: number }> = ({ f }) => (
  <Ch1Frame f={f} seed={428} bg="linear-gradient(180deg,#3A4668 0%,#7A6E88 40%,#E8AE7C 75%,#F2CE9C 100%)">
    {/* 空の名残りの星 */}
    <Stars f={f} n={12} yMax={220} op={0.4} />
    {/* 漂う暁の雲 */}
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((200 + i * 620 + f * 0.3) % 2100) - 80} cy={300 + i * 90}
        rx={240} ry={32} fill="#F2C4A8" opacity={0.5} />
    ))}
    {/* 空からの光 */}
    <g opacity={easeOut(seg(f, 24, 48))}>
      <path d="M 1420 -20 L 700 900 L 1060 900 Z" fill={KRP.yellow} opacity={0.3} />
      <circle cx={1500} cy={170} r={96} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + f / 70;
        return <line key={i} x1={1500 + Math.cos(a) * 120} y1={170 + Math.sin(a) * 120}
          x2={1500 + Math.cos(a) * 156} y2={170 + Math.sin(a) * 156}
          stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" />;
      })}
    </g>
    {/* 地平の暗い丘 */}
    <path d="M -20 880 Q 480 820 960 870 Q 1440 912 1940 860 L 1940 1100 L -20 1100 Z" fill="#5E4A58" />
    {/* 両手を合わせて宣言する庶民 */}
    <Shomin x={700} y={900} s={1.05} f={f} phase={16} face="smile" gaze={[5, -5]} />
    <g transform={`translate(700 ${798 + bobOf(f, 16)})`}>
      {/* 両脇から胸の前へ曲げた腕 (これがないと合掌の手が胸のマークに見える) */}
      <line x1={-52} y1={30} x2={-8} y2={6} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
      <line x1={52} y1={30} x2={8} y2={6} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
      <line x1={-52} y1={30} x2={-8} y2={6} stroke={TKP.woodLight} strokeWidth={13} strokeLinecap="round" />
      <line x1={52} y1={30} x2={8} y2={6} stroke={TKP.woodLight} strokeWidth={13} strokeLinecap="round" />
      <ellipse cx={-9} cy={-4} rx={13} ry={31} transform="rotate(-14 -9 -4)" fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={9} cy={-4} rx={13} ry={31} transform="rotate(14 9 -4)" fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    {/* ふきだし: 神様マーク (ことばは字幕にまかせる) */}
    <Bubble x={420} y={380} w={320} h={220} tailTo={[600, 620]} t={seg(f, 10, 26)}>
      <circle cx={0} cy={-10} r={52} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 66} y1={-10 + Math.sin(a) * 66}
          x2={Math.cos(a) * 84} y2={-10 + Math.sin(a) * 84} stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" />;
      })}
      <text x={0} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>会いに行く</text>
    </Bubble>
  </Ch1Frame>
);

// #30 信仰の旅――巡礼です (朝焼けの道を、杖を持つ巡礼者の列が行く)
const SceneJunreiTabi: React.FC<{ f: number }> = ({ f }) => {
  const px = lerp(440, 600, easeOut(seg(f, 0, 80)));
  return (
    <Ch1Frame f={f} seed={429} bg="linear-gradient(180deg,#E89A64 0%,#F0B878 40%,#E0A070 70%,#C97E5E 100%)">
      {/* 大きな朝日 */}
      <circle cx={1250} cy={540} r={190} fill="#F6D088" opacity={0.25} />
      <circle cx={1250} cy={540} r={112} fill="#F6D088" stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
      {/* 地面 */}
      <path d="M -20 600 L 1940 600 L 1940 1100 L -20 1100 Z" fill="#B8785A" />
      <path d="M -20 600 Q 480 586 960 598 Q 1440 610 1940 596" fill="none" stroke="#8A4636" strokeWidth={5} opacity={0.5} />
      {/* 地平の右はしに、目的地の大聖堂 (灰色の石造り) */}
      <g transform="translate(1760 600) scale(0.55)" opacity={0.88 * easeOut(seg(f, 10, 28))}>
        <rect x={-120} y={-120} width={240} height={120} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
        {[-86, 86].map((tx) => (
          <g key={tx}>
            <rect x={tx - 26} y={-212} width={52} height={92} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
            <path d={`M ${tx - 32} -212 L ${tx} -258 L ${tx + 32} -212 Z`} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={tx} y1={-258} x2={tx} y2={-278} stroke={KRP.ink} strokeWidth={4} />
            <line x1={tx - 8} y1={-270} x2={tx + 8} y2={-270} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <circle cx={0} cy={-70} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 0 L -30 -36 Q 0 -58 30 -36 L 30 0 Z" fill={KRP.ink} opacity={0.5} />
      </g>
      {/* 朝日へ続く一本道 (遠近法) */}
      <path d="M 1214 604 L 1286 604 L 1700 1100 L 440 1100 Z" fill="#E0AC7E" />
      <path d="M 1214 604 L 1286 604 L 1700 1100 L 440 1100 Z" fill="none" stroke="#8A4636" strokeWidth={5} opacity={0.6} />
      {[0, 1, 2, 3].map((i) => {
        const t0 = i / 4; const t1 = (i + 0.45) / 4;
        const yA = 620 + t0 * t0 * 460; const yB = 620 + t1 * t1 * 460;
        const xA = 1250 - (yA - 604) * 0.52; const xB = 1250 - (yB - 604) * 0.52;
        return <line key={i} x1={xA} y1={yA} x2={xB} y2={yB} stroke="#F2CE9C" strokeWidth={6 + i * 4} strokeLinecap="round" opacity={0.6} />;
      })}
      {/* 道をゆく巡礼者の列 (遠いほど小さい) */}
      <SilPerson x={1190} y={700} s={0.42} color="#4A3630" stick hat f={f} phase={24} />
      <SilPerson x={1105} y={790} s={0.6} color="#4A3630" stick hat f={f} phase={25} />
      <SilPerson x={990} y={910} s={0.82} color="#3A2A28" stick hat f={f} phase={26} />
      {/* 手前の実体ある巡礼者と、朝日が作る長い影 */}
      <ellipse cx={px - 150} cy={924} rx={200} ry={24} fill="#3A2A28" opacity={0.3} />
      <EuroPilgrim x={px} y={910} s={1.0} f={f} phase={17} face="smile" />
      {/* ことばの大札 */}
      <g transform={`translate(1430 300) scale(${pop(seg(f, 40, 58))}) rotate(-4)`}>
        <rect x={-250} y={-110} width={500} height={220} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <text x={30} y={32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={KRP.red}>巡礼</text>
        <g transform="translate(-170 0) scale(0.76)"><ScallopShell x={0} y={0} /></g>
      </g>
      <Burst x={1430} y={300} r={150} t={seg(f, 54, 70)} n={12} />
      <BirdV x={520} y={260} s={1.0} f={f} color="#8A5A40" />
      <BirdV x={660} y={210} s={0.7} f={f + 12} color="#8A5A40" />
    </Ch1Frame>
  );
};

// #31 誰にも止められません (朝の光の中、門が道を開ける)
const SceneTomerarenai: React.FC<{ f: number }> = ({ f }) => {
  const barUp = easeOut(seg(f, 14, 40));
  const px = lerp(430, 1000, easeOut(seg(f, 30, 62)));
  return (
    <Ch1Frame f={f} seed={430} bg="linear-gradient(180deg,#A8C4DC 0%,#D9E0D4 60%,#E8D9AE 100%)">
      {/* 右上からの朝の光条 */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${1400 + i * 200} -20 L ${900 + i * 240} 760 L ${1060 + i * 240} 760 Z`}
          fill={KRP.yellow} opacity={0.1} />
      ))}
      {/* 地面 */}
      <path d="M -20 880 Q 500 850 1000 880 Q 1460 906 1940 884 L 1940 1100 L -20 1100 Z" fill="#D9C49A" />
      <path d="M -20 880 Q 500 850 1000 880 Q 1460 906 1940 884" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
      {/* 石垣 (門のところだけ開いている) */}
      {([[-20, 800], [1120, 840]] as const).map(([wx, ww], wi) => (
        <g key={wi}>
          <rect x={wx} y={660} width={ww} height={224} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((r) => (
            <path key={r} d={`M ${wx} ${716 + r * 56} h ${ww}`} stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((c) => (
            <line key={c} x1={wx + 70 + c * 130 + (c % 2) * 40} y1={660 + (c % 3) * 56} x2={wx + 70 + c * 130 + (c % 2) * 40} y2={716 + (c % 3) * 56}
              stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
          ))}
        </g>
      ))}
      {/* 開いた門から差しこむ光 */}
      <path d="M 820 650 L 1100 650 L 1400 1100 L 560 1100 Z" fill={KRP.yellow} opacity={0.2 * barUp} />
      {/* 関門 (柱は石垣の切れ目のわき。棒は通路の上へ大きく開き、人と重ならない) */}
      <g transform="translate(750 900)">
        <rect x={-26} y={-320} width={52} height={320} fill={TKP.stone} stroke={KRP.ink} strokeWidth={6} />
        {/* 門柱の旗 (石垣側へなびかせて棒とぶつけない) */}
        <line x1={0} y1={-320} x2={0} y2={-392} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M -2 -390 q ${-36 - Math.sin(f / 12) * 8} 10 ${-72 - Math.sin(f / 12) * 10} 0 l 0 34 q 36 10 ${72 + Math.sin(f / 12) * 8} 0 Z`}
          fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${-70 * barUp} 0 -250)`}>
          <rect x={0} y={-272} width={560} height={44} rx={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          {[80, 200, 320, 440].map((x) => (
            <rect key={x} x={x} y={-272} width={60} height={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
      </g>
      {/* 門番はわきへ下がり、道を譲る */}
      <Person x={1230 + barUp * 40} y={916} s={0.9} f={f} phase={18} face="normal" helmet
        cloth={KRP.grayDark} clothDark={KRP.grayDark} gaze={[-5, 0]} lean={3} />
      {/* 巡礼者が開いた門を通りすぎる */}
      <EuroPilgrim x={px} y={916} s={0.95} f={f} phase={19} face="smile" />
      <CheckMark x={480} y={280} s={1.3} t={seg(f, 44, 60)} />
      <BirdV x={320} y={200} s={0.9} f={f} />
    </Ch1Frame>
  );
};

// #32 なにしろ相手は神様です (画面のほとんどが空。大きな後光の神々しさ)
const SceneAiteKamisama: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.12 * easeOut(seg(f, 0, 60));
  return (
    <Ch1Frame f={f} seed={431} bg="linear-gradient(180deg,#7FA8D0 0%,#A8C8E0 45%,#DCE8EE 75%,#F2E3C2 100%)">
      <g transform={zoomAt(z, 960, 300)}>
        {/* 流れる雲 */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${((i * 560 + f * (0.4 + (i % 2) * 0.25)) % 2200) - 130} ${460 - i * 90})`}>
            <ellipse cx={0} cy={0} rx={190} ry={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
            <ellipse cx={110} cy={-24} rx={90} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
          </g>
        ))}
        {/* 巨大な後光 */}
        <g transform="translate(960 280)">
          <circle cx={0} cy={0} r={330} fill="none" stroke={KRP.yellow} strokeWidth={10} opacity={0.3} />
          <circle cx={0} cy={0} r={260} fill={KRP.yellow} opacity={0.14} />
          <circle cx={0} cy={0} r={170} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
          <circle cx={0} cy={0} r={225} fill="none" stroke={KRP.orange} strokeWidth={8} opacity={0.6} />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2 + f / 90;
            return <line key={i} x1={Math.cos(a) * 248} y1={Math.sin(a) * 248}
              x2={Math.cos(a) * (304 + Math.sin(f / 12 + i) * 12)} y2={Math.sin(a) * (304 + Math.sin(f / 12 + i) * 12)}
              stroke={KRP.orange} strokeWidth={11} strokeLinecap="round" />;
          })}
        </g>
        {/* 後光から地上へ落ちる光のシャフト */}
        {[-1, 0, 1].map((i) => (
          <path key={i} d={`M ${960 + i * 120 - 46} 430 L ${960 + i * 330 - 120} 940 L ${960 + i * 330 + 120} 940 L ${960 + i * 120 + 46} 430 Z`}
            fill="#F6DE9C" opacity={0.13} />
        ))}
        {/* 地上は細い帯だけ。小さなふたりが見上げる */}
        <path d="M -20 940 Q 500 920 1000 938 Q 1460 952 1940 936 L 1940 1100 L -20 1100 Z" fill="#D9C49A" opacity={0.95} />
        <EuroPilgrim x={620} y={1010} s={0.62} f={f} phase={20} face="surprised" />
        <Person x={1300} y={1010} s={0.62} f={f} phase={21} face="surprised" helmet cloth={KRP.grayDark} clothDark={KRP.grayDark} gaze={[-3, -7]} />
        {/* 高い空の鳥 */}
        <BirdV x={360} y={180} s={0.8} f={f} />
        <BirdV x={1660} y={140} s={0.6} f={f + 18} />
      </g>
    </Ch1Frame>
  );
};

// #33 旅の口実の第一号 (リニューアル前の形に全戻し)
const SceneKoujitsuRoute1: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={432} caption="旅の口実 路線図">
    <KoujitsuRoute x={960} y={580} s={1.1} f={f} count={1} ride={false} />
    <Burst x={420} y={580} r={120} t={seg(f, 30, 48)} color={KRP.orange} n={12} />
  </Frame>
);

// ===== 第2章 (#34〜#53): 口実その1 信仰 =====

// 第2章だけで使うローカル色 (TabiKits の TKP は共有なので触らない)
const L2 = {
  sunsetHi: "#F4BE78",      // 夕空の上
  sunsetMid: "#E68C58",     // 夕空の中
  sunsetLow: "#C2614C",     // 地平ぎわ
  duskLand: "#8A6356",      // 夕暮れの地面
  plazaSky: "#C4DCEA",      // スペインの空
  granite: "#D6CFC1",       // 花崗岩 (サンティアゴの石)
  graniteDark: "#B2A996",
  graniteShade: "#9B917E",
  cobble: "#C3BAA8",        // 石畳
  cobbleDark: "#A79D8B",
  street: "#B2A281",        // 門前町の石畳 (空・建物とはっきり色を変える)
  streetJoint: "#8B7D5F",   // 石畳の目地
  streetHaze: "#CCC1A7",    // 地平ぎわのかすみ
  ember: "#E8702A",         // 炉の火
  emberHot: "#F6C14A",
  hood: "#8F3B36",          // シャプロン頭巾の臙脂
  hoodDark: "#6E2B28",
  tunic: "#6C7C53",         // 中世のチュニック (くすんだ緑)
  tunicDark: "#53603F",
  apron: "#E3D7B8",         // 麻のエプロン
  leather: "#8A5E36",       // 革帯・巾着
  flagRed: "#C8362B",       // スペイン国旗の赤
  flagGold: "#F0C33C",      // スペイン国旗の黄
  rootBrown: "#6B5338",     // むき出しの根
  mossyFar: "#8FA27C",      // 遠くの稜線 (かすんだ苔色)
  mossyMid: "#6F8560",      // 中景の稜線
} as const;

// -------------------------------------------------------------------
// 人物: 後白河法皇 (出家した上皇。紫の袈裟+金の縁取り+袈裟環+数珠+剃髪)
// -------------------------------------------------------------------
const HououPerson: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal" }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      {/* 白い小袖 (下に着るもの)。hair="none" で剃髪 */}
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={KRP.white} clothDark={KRP.white} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 小袖の広袖 */}
        <path d="M -58 -152 L -102 -70 L -58 -60 L -40 -142 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 58 -152 L 102 -70 L 58 -60 L 40 -142 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 襟合わせ */}
        <path d="M -22 -162 L 6 -124 L 30 -162" fill="none" stroke={KRP.ink} strokeWidth={4} />
        {/* 紫の袈裟: 左肩から斜めに掛け、下は横帯 */}
        <path d="M -64 -168 L -8 -168 L 76 -58 L 76 -34 L -76 -34 L -76 -94 Z"
          fill={TKP.purple} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 金の縁取り */}
        <path d="M -62 -164 L -12 -164 L 70 -58" fill="none" stroke={KRP.brass} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -72 -42 L 72 -42" stroke={KRP.brass} strokeWidth={6} />
        <path d="M -74 -88 L 46 -88" stroke={TKP.purpleDark} strokeWidth={4} opacity={0.85} />
        {/* 袈裟の田相 (縦の継ぎ目) */}
        {[-44, -8, 28].map((gx, i) => (
          <line key={i} x1={gx} y1={-86} x2={gx} y2={-40} stroke={KRP.brass} strokeWidth={3} opacity={0.7} />
        ))}
        {/* 袈裟環 (左肩の金具) */}
        <circle cx={-48} cy={-158} r={15} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-48} cy={-158} r={7} fill={TKP.purple} stroke={KRP.ink} strokeWidth={3} />
        {/* 数珠 (右手に掛ける) */}
        {Array.from({ length: 13 }, (_, i) => {
          const a = Math.PI * (0.08 + (i / 12) * 1.55);
          return <circle key={i} cx={70 + Math.cos(a) * 24} cy={-94 + Math.sin(a) * 36} r={5.6}
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={2.8} />;
        })}
        {/* 剃髪のつや */}
        <path d="M -42 -262 Q 0 -290 42 -262" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
        <ellipse cx={-20} cy={-270} rx={17} ry={7} fill={KRP.white} opacity={0.95}
          transform="rotate(-18 -20 -270)" />
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// 人物: 熊野の行者 (白装束+頭襟+結袈裟)。gassho で合掌、kneel で座る
// -------------------------------------------------------------------
const Gyouja: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
  gassho?: boolean; kneel?: boolean; lean?: number;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gassho = false, kneel = false, lean = 0 }) => {
  const bob = kneel ? 0 : bobOf(f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} lean={lean} still={kneel}
        cloth={KRP.white} clothDark={KRP.white} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 白装束の広袖 */}
        <path d="M -58 -150 L -96 -74 L -56 -66 L -40 -140 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 58 -150 L 96 -74 L 56 -66 L 40 -140 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 結袈裟 (梵天つき) */}
        <path d="M -44 -162 L 34 -66" stroke={TKP.purple} strokeWidth={15} strokeLinecap="round" opacity={0.95} />
        <path d="M -44 -162 L 34 -66" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        <circle cx={-40} cy={-158} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={30} cy={-70} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        {/* 頭襟 (ときん。修験の小さな黒い冠) */}
        <path d="M -17 -282 L 17 -282 L 13 -306 L -13 -306 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
        <path d="M -30 -278 L 30 -278" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        {/* 座るときは法衣のすそで脚を覆う */}
        {kneel && (
          <path d="M -112 8 Q -76 -124 0 -124 Q 76 -124 112 8 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        )}
        {/* 合掌 */}
        {gassho && (
          <g>
            <path d="M -18 -98 L 0 -176 L 18 -98 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <line x1={0} y1={-170} x2={0} y2={-104} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          </g>
        )}
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// 背景: 那智のような岩場と大滝 (#37 建前=厳しい修行)
// -------------------------------------------------------------------
const NachiTakiBg: React.FC<{ f: number }> = ({ f }) => {
  const fallW = 92, fallX = 960, fallTop = 150, fallBottom = 858;
  return (
    <g>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.mist} />
      {/* 奥の杉の稜線 */}
      <path d="M -20 300 Q 260 180 520 260 Q 760 170 1020 250 Q 1300 160 1560 250 Q 1760 200 1940 270 L 1940 520 L -20 520 Z"
        fill={TKP.forestDark} opacity={0.45} />
      {/* 滝の裏の岩壁 (中央) */}
      <path d="M 700 1080 L 700 320 L 790 190 L 900 130 L 1030 128 L 1140 196 L 1220 330 L 1220 1080 Z"
        fill={TKP.rockDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${720 + (i % 2) * 60} ${300 + i * 130} L ${1200 - (i % 2) * 50} ${270 + i * 130}`}
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} fill="none" />
      ))}
      {/* 左の岩場 (段々になった巨岩) */}
      <path d="M -20 1080 L -20 240 L 150 160 L 300 250 L 410 220 L 520 340 L 620 430 L 660 620 L 700 760 L 700 1080 Z"
        fill={TKP.rock} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <path d="M -20 470 L 200 430 L 360 500 L 520 480" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
      <path d="M 60 700 L 300 660 L 470 720 L 640 690" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.32} />
      {/* 左の岩棚 (座禅用) */}
      <path d="M 330 740 L 640 724 L 660 790 L 320 804 Z" fill={TKP.rockDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 右の岩場 */}
      <path d="M 1940 1080 L 1940 210 L 1790 150 L 1650 250 L 1520 230 L 1400 350 L 1300 450 L 1250 640 L 1220 780 L 1220 1080 Z"
        fill={TKP.rock} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <path d="M 1940 450 L 1740 420 L 1560 490 L 1410 470" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
      <path d="M 1860 690 L 1630 650 L 1450 710 L 1300 686" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.32} />
      {/* 右の岩棚 */}
      <path d="M 1290 730 L 1600 716 L 1618 780 L 1278 794 Z" fill={TKP.rockDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 岩に生える小さな杉 */}
      {[[200, 230, 0.7], [1760, 220, 0.75], [470, 310, 0.5], [1500, 300, 0.55]].map(([tx, ty, ts], i) => (
        <g key={i} transform={`translate(${tx} ${ty}) scale(${ts})`}>
          <path d="M 0 -190 L 32 -108 L 15 -108 L 44 -34 L -44 -34 L -15 -108 L -32 -108 Z"
            fill={TKP.forestDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-7} y={-34} width={14} height={34} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      {/* === 大滝 (高く細い直瀑) === */}
      <g>
        <rect x={fallX - fallW / 2} y={fallTop} width={fallW} height={fallBottom - fallTop}
          fill={TKP.water} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
        {/* 落ち口 */}
        <path d={`M ${fallX - fallW / 2 - 26} ${fallTop} Q ${fallX} ${fallTop - 26} ${fallX + fallW / 2 + 26} ${fallTop}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 流れ落ちる白い筋 */}
        {Array.from({ length: 9 }, (_, i) => {
          const span = fallBottom - fallTop;
          const yy = fallTop + ((f * 13 + i * 97) % span);
          return (
            <line key={i} x1={fallX - 32 + (i % 5) * 16} y1={yy}
              x2={fallX - 32 + (i % 5) * 16} y2={Math.min(yy + 120, fallBottom)}
              stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
          );
        })}
        <line x1={fallX - 30} y1={fallTop + 20} x2={fallX - 30} y2={fallBottom} stroke={KRP.white} strokeWidth={5} opacity={0.5} />
        <line x1={fallX + 30} y1={fallTop + 20} x2={fallX + 30} y2={fallBottom} stroke={KRP.white} strokeWidth={5} opacity={0.5} />
      </g>
      {/* 滝つぼ */}
      <ellipse cx={fallX} cy={880} rx={300} ry={58} fill={TKP.water} stroke={KRP.ink} strokeWidth={5} />
      {/* 波紋 (広がって消える) */}
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 30) % 90) / 90;
        return <ellipse key={i} cx={fallX} cy={880} rx={60 + t * 230} ry={12 + t * 44}
          fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.75 * (1 - t)} />;
      })}
      {/* 飛沫 */}
      {Array.from({ length: 14 }, (_, i) => {
        const t = ((f * 1.7 + i * 19) % 46) / 46;
        const dir = i % 2 === 0 ? -1 : 1;
        return <circle key={i} cx={fallX + dir * (40 + t * 180) + (i % 5) * 9}
          cy={866 - Math.sin(t * Math.PI) * 120}
          r={4 + (i % 3) * 2.5} fill={KRP.white} opacity={0.85 * (1 - t)} />;
      })}
      {/* 手前の岩 */}
      <path d="M -20 1080 L 120 920 L 330 970 L 470 900 L 620 960 L 620 1080 Z" fill={TKP.rockDark} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 1940 1080 L 1800 910 L 1600 965 L 1440 900 L 1300 960 L 1300 1080 Z" fill={TKP.rockDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// -------------------------------------------------------------------
// 背景: 険しい森の急な山道 (#40 歩きながら愚痴)。横にゆっくり流れる
// -------------------------------------------------------------------
const KewashiiMichiBg: React.FC<{ f: number }> = ({ f }) => {
  const sc = (f * 1.25) % 420;
  return (
    <g>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.forestDark} opacity={0.22} />
      {/* 奥の尾根 (切り立っている) */}
      <path d="M -20 520 L 180 300 L 360 420 L 560 230 L 820 400 L 1060 210 L 1300 390 L 1540 250 L 1760 400 L 1940 300 L 1940 700 L -20 700 Z"
        fill={TKP.forest} opacity={0.5} />
      <path d="M -20 640 L 240 470 L 520 600 L 800 450 L 1080 590 L 1380 440 L 1660 580 L 1940 470 L 1940 820 L -20 820 Z"
        fill={TKP.forestDark} opacity={0.72} />
      {/* 急な山道 (左下から右上へ。ごろごろ石) */}
      <path d="M -40 1080 L 420 880 L 900 790 L 1420 742 L 1940 716 L 1940 840 L 1300 880 L 760 950 L 320 1080 Z"
        fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
      {/* 道にはみ出した根と段差 (流れる) */}
      {Array.from({ length: 8 }, (_, i) => {
        const bx = -200 + i * 300 - sc * 0.9;
        const by = 980 - i * 34;
        return (
          <g key={i} transform={`translate(${bx} ${by})`} opacity={0.85}>
            <path d="M -90 0 q 46 -22 96 -4 q 48 18 96 -6" fill="none" stroke={L2.rootBrown} strokeWidth={13} strokeLinecap="round" />
            <path d="M -90 0 q 46 -22 96 -4 q 48 18 96 -6" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
          </g>
        );
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const bx = -150 + i * 250 - sc * 1.15;
        const by = 1010 - i * 28;
        return <ellipse key={i} cx={bx} cy={by} rx={26 + (i % 3) * 9} ry={15 + (i % 3) * 5}
          fill={TKP.rock} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />;
      })}
      {/* 中景の杉 (流れる) */}
      {Array.from({ length: 7 }, (_, i) => {
        const tx = -240 + i * 340 - sc * 0.78;
        return (
          <g key={i} transform={`translate(${tx} ${760 - (i % 3) * 40}) scale(${0.9 + (i % 3) * 0.2})`} opacity={0.95}>
            <path d="M 0 -260 L 40 -148 L 20 -148 L 54 -48 L -54 -48 L -20 -148 L -40 -148 Z"
              fill={TKP.forestDark} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={-9} y={-48} width={18} height={48} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      {/* 手前の大きな幹 (速く流れる = 歩いている感じ)。
          中央は人物がいるので、近づいたら消して重なりを避ける */}
      {Array.from({ length: 4 }, (_, i) => {
        const tx = -300 + i * 620 - sc * 1.9;
        const d = Math.abs(tx - 960);
        const op = d <= 330 ? 0 : Math.min(0.92, ((d - 330) / 230) * 0.92);
        if (op <= 0.02) return null;
        return (
          <g key={i} opacity={op}>
            <path d={`M ${tx - 40} 1080 L ${tx - 30} 180 L ${tx + 34} 180 L ${tx + 46} 1080 Z`}
              fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${tx - 20} 420 L ${tx - 18} 900`} stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
            <path d={`M ${tx + 30} 330 q 70 -40 120 -22`} fill="none" stroke={TKP.woodDark} strokeWidth={16} strokeLinecap="round" />
          </g>
        );
      })}
      {/* 谷の霧 */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={320 + i * 620 + Math.sin(f / 42 + i * 2) * 30} cy={560 + i * 44}
          rx={280} ry={38} fill={TKP.mist} opacity={0.42} />
      ))}
    </g>
  );
};

// -------------------------------------------------------------------
// 背景: オブラドイロ広場 (#43 大聖堂をセンターに置くための舞台)
// -------------------------------------------------------------------
const PlazaBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={L2.plazaSky} />
    <rect x={-20} y={-20} width={W + 40} height={420} fill={KRP.blueSoft} opacity={0.55} />
    {/* 雲 */}
    {[[280, 180, 1.1], [1620, 230, 0.9], [760, 120, 0.7]].map(([cx, cy, cs], i) => (
      <g key={i} transform={`translate(${Number(cx) + Math.sin(f / 60 + i) * 16} ${cy}) scale(${cs})`} opacity={0.8}>
        <ellipse cx={-54} cy={8} rx={60} ry={30} fill={KRP.white} />
        <ellipse cx={20} cy={-6} rx={74} ry={40} fill={KRP.white} />
        <ellipse cx={82} cy={12} rx={54} ry={26} fill={KRP.white} />
      </g>
    ))}
    {/* 両脇の街並み (花崗岩の建物) */}
    {[[-20, 560, 420], [1680, 540, 260]].map(([bx, by, bw], i) => (
      <g key={i}>
        <rect x={Number(bx)} y={Number(by)} width={Number(bw)} height={400} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, k) => (
          <rect key={k} x={Number(bx) + 40 + (k % 3) * 110} y={Number(by) + 50 + Math.floor(k / 3) * 130}
            width={62} height={86} rx={6} fill={L2.granite} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
    ))}
    {/* 広場の石畳 (奥行き) */}
    <rect x={-20} y={838} width={W + 40} height={H - 818} fill={L2.cobble} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 5 }, (_, i) => (
      <line key={i} x1={-20} y1={868 + i * 48} x2={W + 20} y2={868 + i * 48} stroke={L2.cobbleDark} strokeWidth={4} opacity={0.8} />
    ))}
    {Array.from({ length: 11 }, (_, i) => (
      <line key={i} x1={960 + (i - 5) * 70} y1={838} x2={960 + (i - 5) * 220} y2={H + 20}
        stroke={L2.cobbleDark} strokeWidth={4} opacity={0.65} />
    ))}
  </g>
);

// -------------------------------------------------------------------
// サンティアゴ大聖堂 オブラドイロ・ファサード (正面・精巧版)
// (960, 840) を足もと中央として描く。塔の十字架の先で y≈180
// -------------------------------------------------------------------
const SantiagoCathedral: React.FC<{ x?: number; y?: number; s?: number; f?: number }> = ({
  x = 960, y = 840, s = 1, f = 0,
}) => {
  const Tower: React.FC<{ tx: number }> = ({ tx }) => (
    <g transform={`translate(${tx} 0)`}>
      {/* 1層目 (基部) */}
      <rect x={-85} y={-300} width={170} height={228} fill={L2.granite} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-46} y={-250} width={92} height={130} rx={46} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={-85} y1={-300} x2={85} y2={-300} stroke={KRP.ink} strokeWidth={5} />
      {/* 2層目 */}
      <rect x={-75} y={-430} width={150} height={130} fill={L2.granite} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-40} y={-406} width={80} height={94} rx={40} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={4.5} />
      {[-62, 62].map((px, i) => (
        <rect key={i} x={px - 7} y={-444} width={14} height={30} fill={L2.granite} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 3層目 */}
      <rect x={-64} y={-530} width={128} height={100} fill={L2.granite} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-32} y={-510} width={64} height={70} rx={32} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 鐘の小塔 (いちばん上) */}
      <rect x={-48} y={-600} width={96} height={70} fill={L2.granite} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-22} y={-586} width={44} height={50} rx={22} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={4} />
      {/* 鐘 (ゆれる) */}
      <g transform={`translate(0 -578) rotate(${Math.sin(f / 7) * 9})`}>
        <path d="M -15 26 Q -15 -8 0 -8 Q 15 -8 15 26 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={0} cy={30} r={4.5} fill={KRP.ink} />
      </g>
      {/* ドームと十字架 */}
      <path d="M -52 -600 Q 0 -642 52 -600 Z" fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={-636} x2={0} y2={-664} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={-13} y1={-654} x2={13} y2={-654} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 各層の角の小尖塔 */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M ${d * 74} -430 l ${-d * 9} 0 l ${d * 9} -30 l ${d * 9} 30 Z`} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={3.5} />
          <path d={`M ${d * 58} -530 l ${-d * 8} 0 l ${d * 8} -26 l ${d * 8} 26 Z`} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* --- 両脇の翼部 --- */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <rect x={d > 0 ? 356 : -600} y={-330} width={244} height={258} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={5.5} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={(d > 0 ? 386 : -570) + k * 72} y={-280} width={44} height={96} rx={22}
              fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 手すり (バラストレード) */}
          <rect x={d > 0 ? 350 : -606} y={-352} width={256} height={22} fill={L2.granite} stroke={KRP.ink} strokeWidth={4.5} />
          {Array.from({ length: 7 }, (_, k) => (
            <rect key={k} x={(d > 0 ? 366 : -590) + k * 36} y={-378} width={12} height={26}
              fill={L2.granite} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      ))}
      {/* --- 中央部 (本体) --- */}
      <rect x={-172} y={-470} width={344} height={398} fill={L2.granite} stroke={KRP.ink} strokeWidth={6} />
      {/* 切妻 (ペディメント) + 聖ヤコブ像の壁龕 */}
      <path d="M -176 -470 L 0 -566 L 176 -470 Z" fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-52} y={-462} width={104} height={126} rx={52} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={5} />
      {/* 聖ヤコブ像 (巡礼姿: つば広帽・杖・貝) */}
      <g transform="translate(0 -350)">
        <path d="M -26 0 Q -24 -62 0 -66 Q 24 -62 26 0 Z" fill={L2.granite} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={-76} r={17} fill={L2.granite} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={0} cy={-88} rx={27} ry={6} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={24} y1={-96} x2={30} y2={-4} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <g transform="translate(0 -36) scale(0.3)"><ScallopShell x={0} y={0} /></g>
      </g>
      {/* 大きな窓 (オブラドイロの大窓) */}
      <g transform="translate(0 -176)">
        <rect x={-88} y={-150} width={176} height={150} rx={6} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -88 -150 Q 0 -232 88 -150 Z" fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-72} y={-140} width={144} height={132} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -72 -140 Q 0 -214 72 -140 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        {[-36, 0, 36].map((wx, i) => (
          <line key={i} x1={wx} y1={-196} x2={wx} y2={-8} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        ))}
        {[-96, -52].map((wy, i) => (
          <line key={i} x1={-72} y1={wy} x2={72} y2={wy} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        ))}
      </g>
      {/* 中央部の左右を縁取る付け柱 */}
      {[-146, 146].map((px, i) => (
        <g key={i}>
          <rect x={px - 13} y={-452} width={26} height={380} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={px - 13} y1={-420 + k * 94} x2={px + 13} y2={-420 + k * 94} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          ))}
        </g>
      ))}
      {/* --- 3連アーチの入口 --- */}
      <rect x={-200} y={-96} width={400} height={24} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={5} />
      {[-104, 0, 104].map((ax, i) => (
        <g key={i}>
          <path d={`M ${ax - 42} -72 L ${ax - 42} -140 Q ${ax} -196 ${ax + 42} -140 L ${ax + 42} -72 Z`}
            fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M ${ax - 30} -72 L ${ax - 30} -136 Q ${ax} -180 ${ax + 30} -136 L ${ax + 30} -72 Z`}
            fill={KRP.ink} opacity={0.62} />
        </g>
      ))}
      {/* --- 手前の大階段 --- */}
      <path d="M -470 0 L 470 0 L 320 -72 L -320 -72 Z" fill={L2.granite} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {[1, 2, 3, 4, 5].map((i) => {
        const t = i / 6;
        const hw = lerp(470, 320, t);
        return <line key={i} x1={-hw} y1={-72 * t} x2={hw} y2={-72 * t} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />;
      })}
      {/* 階段の手すり */}
      {[-1, 1].map((d) => (
        <path key={d} d={`M ${d * 478} 2 L ${d * 326} -74 L ${d * 300} -74 L ${d * 452} 2 Z`}
          fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      ))}
      {/* --- 双塔 --- */}
      <Tower tx={-272} />
      <Tower tx={272} />
    </g>
  );
};

// スペイン国旗 (赤・黄・赤。中央の黄が広い。紋章+王冠を簡略化)
const SpainFlag: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const wv = (k: number) => Math.sin(f / 8 + k) * 9;
  const band = (y0: number, h: number, fill: string, k: number) =>
    `M 0 ${y0 + wv(k)} C 70 ${y0 - 12 + wv(k + 1)} 140 ${y0 + 14 + wv(k + 2)} 210 ${y0 + wv(k + 3)} ` +
    `L 210 ${y0 + h + wv(k + 3)} C 140 ${y0 + h + 14 + wv(k + 2)} 70 ${y0 + h - 12 + wv(k + 1)} 0 ${y0 + h + wv(k)} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 旗竿 */}
      <line x1={0} y1={0} x2={0} y2={-430} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-430} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      <circle cx={0} cy={-436} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={2} rx={34} ry={11} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 旗 (赤1 : 黄2 : 赤1) */}
      <g transform="translate(4 -418)">
        <path d={band(0, 34, L2.flagRed, 0)} fill={L2.flagRed} />
        <path d={band(34, 68, L2.flagGold, 0)} fill={L2.flagGold} />
        <path d={band(102, 34, L2.flagRed, 0)} fill={L2.flagRed} />
        <path d={band(0, 136, "none", 0)} fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        {/* 紋章 (盾+王冠を簡略化) */}
        <g transform={`translate(70 ${68 + wv(1)})`}>
          <path d="M -20 -20 L 20 -20 L 20 8 Q 0 28 -20 8 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <line x1={0} y1={-20} x2={0} y2={18} stroke={KRP.ink} strokeWidth={2.6} />
          <line x1={-20} y1={-6} x2={20} y2={-6} stroke={KRP.ink} strokeWidth={2.6} />
          <path d="M -22 -26 L -14 -36 L -6 -28 L 0 -38 L 6 -28 L 14 -36 L 22 -26 Z"
            fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
          {/* ヘラクレスの柱 */}
          <rect x={-32} y={-18} width={7} height={30} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.4} />
          <rect x={25} y={-18} width={7} height={30} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.4} />
        </g>
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// 背景: 中世スペインの門前町 (#45 #46 露店のある石畳の通り)
// 地平線 y=700 / 消失点 x=960。地面を必ず先に敷き、建物も人も屋台も
// 「地面の上に立っている」ことが分かるよう足もとに影を入れる。
// 主役 (屋台) を中央に置くため、家並みは左右2軒ずつ・小さく・淡くして奥に下げる。
// -------------------------------------------------------------------
const MZ_HOR = 700;   // 地平線 (地面のはじまり)
const MZ_VPX = 960;   // 消失点x

// 地面の落ち影 (薄い楕円)。接地感はこれで出す
const GroundShadow: React.FC<{ x: number; y: number; rx: number; ry?: number; o?: number }> =
  ({ x, y, rx, ry, o = 0.17 }) => (
    <ellipse cx={x} cy={y} rx={rx} ry={ry ?? Math.max(10, rx * 0.26)} fill={KRP.ink} opacity={o} />
  );

const MonzenMachiBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 空 */}
    <rect x={-20} y={-20} width={W + 40} height={MZ_HOR + 20} fill={L2.plazaSky} />
    <rect x={-20} y={-20} width={W + 40} height={300} fill={KRP.blueSoft} opacity={0.45} />
    {/* 通りの突き当たりの大聖堂 (淡く。屋台の開口からファサードが見える大きさにする) */}
    <g transform={`translate(${MZ_VPX} ${MZ_HOR}) scale(0.8)`} opacity={0.3}>
      <rect x={-120} y={-150} width={240} height={150} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={6} />
      {[-82, 82].map((tx) => (
        <g key={tx}>
          <rect x={tx - 30} y={-300} width={60} height={150} fill={L2.granite} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${tx - 36} -300 L ${tx} -348 L ${tx + 36} -300 Z`} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={6} />
          <line x1={tx} y1={-348} x2={tx} y2={-376} stroke={KRP.ink} strokeWidth={6} />
          <line x1={tx - 11} y1={-366} x2={tx + 11} y2={-366} stroke={KRP.ink} strokeWidth={6} />
        </g>
      ))}
      <rect x={-34} y={-116} width={68} height={116} rx={34} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={5} />
    </g>

    {/* ===== 地面 (石畳の通り)。空・建物とはっきり色を変える ===== */}
    <rect x={-20} y={MZ_HOR} width={W + 40} height={H - MZ_HOR + 20} fill={L2.street} />
    {/* 地平ぎわのかすみ + 地平線 */}
    <rect x={-20} y={MZ_HOR} width={W + 40} height={46} fill={L2.streetHaze} opacity={0.75} />
    <line x1={-20} y1={MZ_HOR} x2={W + 20} y2={MZ_HOR} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
    {/* 石畳の横目地 (手前ほど間隔が広い) */}
    {Array.from({ length: 8 }, (_, i) => {
      const yy = MZ_HOR + (H - MZ_HOR) * Math.pow((i + 1) / 8, 1.9);
      return <line key={`h${i}`} x1={-20} y1={yy} x2={W + 20} y2={yy}
        stroke={L2.streetJoint} strokeWidth={5} opacity={0.6} />;
    })}
    {/* 石畳の縦目地 (消失点へ収束) */}
    {Array.from({ length: 15 }, (_, i) => {
      const k = i - 7;
      return <line key={`v${i}`} x1={MZ_VPX + k * 20} y1={MZ_HOR} x2={MZ_VPX + k * 310} y2={H + 20}
        stroke={L2.streetJoint} strokeWidth={5} opacity={0.5} />;
    })}

    {/* ===== 家並み (左右2軒ずつ。小さく・淡く・奥へ) ===== */}
    {([
      // [左端x, 幅, 高さ, 足もとy]
      [150, 230, 300, 726],
      [-40, 250, 392, 790],
      [1540, 230, 300, 726],
      [1730, 250, 392, 790],
    ] as const).map(([bx, bw, bh, by], i) => (
      <g key={i} opacity={0.62}>
        {/* 建物が立っている地面のライン (足もとの影) */}
        <ellipse cx={bx + bw / 2} cy={by} rx={bw / 2 + 14} ry={16} fill={KRP.ink} opacity={0.17} />
        <rect x={bx} y={by - bh} width={bw} height={bh} fill={i % 2 ? L2.granite : L2.graniteDark}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 瓦屋根 */}
        <path d={`M ${bx - 16} ${by - bh} L ${bx + bw / 2} ${by - bh - 52} L ${bx + bw + 16} ${by - bh} Z`}
          fill={TKP.brickDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        {/* 窓 (2段) */}
        {[0, 1].map((r) => (
          <rect key={r} x={bx + bw * 0.3} y={by - bh + 56 + r * (bh * 0.38)}
            width={bw * 0.4} height={bh * 0.2} rx={7}
            fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        ))}
        {/* 足もとの石積み (地面との境) */}
        <rect x={bx} y={by - 30} width={bw} height={30} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      </g>
    ))}

    {/* 通りをまたぐ旗飾りは1本だけ。屋台 (上端y=360) にかからない高さに張る */}
    <path d={`M 150 232 q 810 ${74 + Math.sin(f / 22) * 8} 1620 0`}
      fill="none" stroke={TKP.woodDark} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
    {Array.from({ length: 9 }, (_, i) => {
      const u = (i + 0.5) / 9;
      const fx = lerp(150, 1770, u);
      const fy = 232 + 4 * (37 + Math.sin(f / 22) * 4) * u * (1 - u);
      return (
        <path key={i} d={`M ${fx - 19} ${fy} L ${fx + 19} ${fy} L ${fx} ${fy + 42} Z`}
          fill={i % 2 ? KRP.red : TKP.noren} stroke={KRP.ink} strokeWidth={4} opacity={0.78} />
      );
    })}
  </g>
);

// 中世の露店 (木組みの柱と梁・縞のひさし・吊るしたホタテ貝バッジ・陳列台)。
// (x, y) は「屋台が地面に接する点」。足もとに落ち影を敷くので宙に浮かない。
// behind = 陳列台より後ろ (店員) / children = 陳列台より前 に描くもの。
const MonzenStall: React.FC<{
  x: number; y: number; s?: number; f?: number;
  behind?: React.ReactNode; children?: React.ReactNode;
}> = ({ x, y, s = 1, f = 0, behind, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 地面への落ち影 (接地感の要) */}
    <GroundShadow x={0} y={-6} rx={400} ry={32} o={0.16} />
    <GroundShadow x={-340} y={0} rx={52} ry={15} o={0.28} />
    <GroundShadow x={340} y={0} rx={52} ry={15} o={0.28} />

    {/* 木組みの柱 (地面まで届かせる) */}
    {[-340, 340].map((px, i) => (
      <g key={i}>
        <rect x={px - 15} y={-510} width={30} height={510} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={px} y1={-480} x2={px} y2={-30} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      </g>
    ))}
    {/* 梁と筋かい */}
    <rect x={-366} y={-540} width={732} height={34} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -325 -506 L -258 -506 L -325 -440 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M 325 -506 L 258 -506 L 325 -440 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 縞のひさし (波打つ) */}
    <path d={`M -358 -506 L 358 -506 L 320 -390 Q 0 ${-366 + Math.sin(f / 16) * 6} -320 -390 Z`}
      fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
    {[-300, -210, -120, -30, 60, 150, 240].map((sx, i) => (
      <path key={i} d={`M ${sx} -506 L ${sx + 40} -506 L ${sx + 33} -392 L ${sx - 7} -392 Z`} fill={KRP.white} opacity={0.8} />
    ))}
    <path d="M -320 -390 Q 0 -366 320 -390" fill="none" stroke={KRP.ink} strokeWidth={5} />

    {/* 商品の吊るし: 横木にホタテ貝のバッジをずらりと下げる (何の店かひと目で分かる) */}
    <rect x={-310} y={-358} width={520} height={12} rx={5} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    {[-280, -185, -90, 90, 185].map((bx, i) => (
      <g key={i} transform={`rotate(${Math.sin(f / 15 + i * 1.3) * 2.4} ${bx} -352)`}>
        <line x1={bx} y1={-352} x2={bx} y2={-322} stroke={KRP.ink} strokeWidth={3.5} />
        <ScallopShell x={bx} y={-286} s={0.6} metal />
      </g>
    ))}

    {/* 看板 (貝の絵つき。左の柱から張り出してゆれる) */}
    <line x1={-340} y1={-466} x2={-462} y2={-466} stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
    <g transform={`translate(-468 -440) rotate(${Math.sin(f / 19) * 3})`}>
      <line x1={0} y1={0} x2={0} y2={18} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-62} y={18} width={124} height={104} rx={8} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
      <g transform="translate(0 84) scale(0.66)"><ScallopShell x={0} y={0} /></g>
    </g>
    {/* ランタン (右の柱から張り出す。ゆらぐ灯り) */}
    <line x1={340} y1={-466} x2={428} y2={-466} stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
    <g transform={`translate(430 -430) rotate(${Math.sin(f / 13) * 4})`}>
      <line x1={0} y1={-6} x2={0} y2={10} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-27} y={2} width={54} height={12} rx={4} fill={TKP.iron} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -24 14 L 24 14 L 20 72 L -20 72 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5}
        opacity={0.75 + Math.sin(f / 7) * 0.2} />
      <rect x={-23} y={72} width={46} height={11} rx={4} fill={TKP.iron} stroke={KRP.ink} strokeWidth={4} />
    </g>

    {/* 店員などは陳列台の「後ろ」に */}
    {behind}

    {/* 陳列台 (天板 + 前掛け布)。布の下から地面と柱が見える = 浮かない */}
    <rect x={-360} y={-170} width={720} height={32} rx={6} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -344 -138 L 344 -138 L 320 -28 L -320 -28 Z" fill={TKP.noren} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
    {[-230, -115, 0, 115, 230].map((lx, i) => (
      <line key={i} x1={lx} y1={-138} x2={lx - lx * 0.07} y2={-28} stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
    ))}

    {/* 道ばたの樽 (右)。これも足もとに影 */}
    <GroundShadow x={470} y={-2} rx={56} ry={16} o={0.2} />
    <g transform="translate(470 -4)">
      <path d="M -44 0 Q -56 -56 -44 -112 L 44 -112 Q 56 -56 44 0 Z" fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -50 -84 L 50 -84 M -52 -34 L 52 -34" stroke={TKP.iron} strokeWidth={8} />
      <ellipse cx={0} cy={-112} rx={44} ry={12} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    </g>

    {children}
  </g>
);

// 中世の店員 (シャプロン頭巾+チュニック+エプロン+革帯+腰の巾着+まくった袖)
const MedievalVendor: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile" }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={L2.tunic} clothDark={L2.tunicDark} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* まくった袖 (前腕は素肌) */}
        <rect x={-80} y={-150} width={26} height={48} rx={12} fill={L2.tunicDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={54} y={-150} width={26} height={48} rx={12} fill={L2.tunicDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-78} y={-104} width={22} height={38} rx={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={56} y={-104} width={22} height={38} rx={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 麻のエプロン */}
        <path d="M -44 -126 L 44 -126 L 52 -34 L -52 -34 Z" fill={L2.apron} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <line x1={-44} y1={-126} x2={-26} y2={-150} stroke={KRP.ink} strokeWidth={4} />
        <line x1={44} y1={-126} x2={26} y2={-150} stroke={KRP.ink} strokeWidth={4} />
        {/* 革帯 */}
        <rect x={-60} y={-110} width={120} height={18} fill={L2.leather} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-10} y={-112} width={20} height={22} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 腰の巾着 */}
        <g transform="translate(60 -86)">
          <path d="M -20 -8 Q -24 32 0 34 Q 24 32 20 -8 Z" fill={L2.leather} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -20 -8 Q 0 -20 20 -8" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-16} x2={0} y2={-4} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* シャプロン頭巾 (頭の上部 + 左右の垂れ + 肩の尾)。顔は隠さない */}
        <path d="M -62 -254 Q -66 -306 0 -308 Q 66 -306 62 -254 Q 30 -272 0 -272 Q -30 -272 -62 -254 Z"
          fill={L2.hood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -62 -256 Q -78 -232 -70 -196 Q -56 -206 -50 -238 Z" fill={L2.hoodDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M 62 -256 Q 78 -232 70 -196 Q 56 -206 50 -238 Z" fill={L2.hoodDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        {/* 頭巾の尾 (リリパイプ) */}
        <path d={`M 52 -280 q ${46 + Math.sin(f / 14) * 7} 16 ${54} ${64}`} fill="none"
          stroke={L2.hood} strokeWidth={17} strokeLinecap="round" />
        <path d={`M 52 -280 q ${46 + Math.sin(f / 14) * 7} 16 ${54} ${64}`} fill="none"
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// 背景: バッジ職人の工房 (#47 鋳型で量産)
// -------------------------------------------------------------------
const KoubouBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={L2.graniteDark} />
    {/* 石積みの壁 */}
    {Array.from({ length: 7 }, (_, r) =>
      Array.from({ length: 13 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-40 + c * 156 + (r % 2) * 78} y={60 + r * 104}
          width={150} height={98} rx={8} fill={L2.granite} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      ))
    )}
    {/* 天井の梁 */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-20} y={40 + i * 0} width={W + 40} height={0} fill="none" />
    ))}
    <rect x={-20} y={-20} width={W + 40} height={96} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    {[220, 700, 1220, 1700].map((bx, i) => (
      <rect key={i} x={bx - 26} y={66} width={52} height={120} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    ))}
    {/* 窓 (外の光) */}
    <g transform="translate(1480 330)">
      <rect x={-110} y={-130} width={220} height={260} rx={10} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
      <line x1={0} y1={-130} x2={0} y2={130} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-110} y1={0} x2={110} y2={0} stroke={KRP.ink} strokeWidth={5} />
    </g>
    {/* 炉 (ゆらぐ火) */}
    <g transform="translate(300 700)">
      <path d="M -170 160 L -170 -40 Q 0 -120 170 -40 L 170 160 Z" fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -110 160 L -110 30 Q 0 -20 110 30 L 110 160 Z" fill={KRP.ink} opacity={0.65} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${-66 + i * 44} 150 q ${-8} ${-40 - Math.sin(f / 6 + i) * 22} ${10} ${-70 - Math.sin(f / 6 + i) * 24} q ${16} ${28} ${6} ${70} Z`}
          fill={i % 2 ? L2.emberHot : L2.ember} stroke={KRP.ink} strokeWidth={3} opacity={0.92} />
      ))}
      <ellipse cx={0} cy={158} rx={126} ry={22} fill={L2.ember} opacity={0.5} />
    </g>
    {/* 壁に掛けた道具 */}
    {[840, 940, 1040].map((tx, i) => (
      <g key={i} transform={`translate(${tx} 300)`}>
        <line x1={0} y1={-70} x2={0} y2={40} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
        <rect x={-22} y={34} width={44} height={34} rx={6} fill={TKP.iron} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    ))}
    {/* 作業台 */}
    <rect x={-20} y={880} width={W + 40} height={34} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-20} y={914} width={W + 40} height={H} fill={TKP.woodLight} opacity={0.65} />
  </g>
);

// -------------------------------------------------------------------
// 背景: 夕暮れの帰り道 (#48 証拠を胸につけて帰る)
// -------------------------------------------------------------------
const YuugureKaeriBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={L2.sunsetHi} />
    <rect x={-20} y={240} width={W + 40} height={240} fill={L2.sunsetMid} opacity={0.75} />
    <rect x={-20} y={440} width={W + 40} height={220} fill={L2.sunsetLow} opacity={0.7} />
    {/* 夕日 */}
    <circle cx={330} cy={590} r={104} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + f / 90;
      return <line key={i} x1={330 + Math.cos(a) * 118} y1={590 + Math.sin(a) * 118}
        x2={330 + Math.cos(a) * 150} y2={590 + Math.sin(a) * 150}
        stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={0.6} />;
    })}
    {/* 帰る鳥 */}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${1200 + i * 150 + Math.sin(f / 26 + i) * 16} ${230 + i * 54} q 20 -20 40 0 q 20 -20 40 0`}
        fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.65} />
    ))}
    {/* 遠い稜線 */}
    <path d="M -20 660 Q 340 596 760 650 Q 1180 586 1560 646 Q 1780 614 1940 644 L 1940 1100 L -20 1100 Z"
      fill={L2.duskLand} opacity={0.55} />
    <path d="M -20 750 Q 500 690 1080 744 Q 1520 700 1940 740 L 1940 1100 L -20 1100 Z"
      fill={L2.duskLand} opacity={0.85} />
    {/* 来た道 (左奥へ細く消える) */}
    <path d="M 1940 1080 L 920 1080 L 560 762 L 700 756 L 1500 1000 L 1940 980 Z"
      fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
    {/* 道ばたの石積みと十字の道標 */}
    <g transform="translate(1560 830)">
      <path d="M -54 30 L -40 -40 L 40 -40 L 54 30 Z" fill={TKP.stone} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={0} y1={-40} x2={0} y2={-154} stroke={TKP.stone} strokeWidth={18} />
      <line x1={0} y1={-40} x2={0} y2={-154} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      <line x1={-44} y1={-116} x2={44} y2={-116} stroke={TKP.stone} strokeWidth={18} />
      <line x1={-44} y1={-116} x2={44} y2={-116} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
    </g>
    {/* 遠ざかる大聖堂 (左奥の丘の上) */}
    <g transform="translate(540 700) scale(0.46)" opacity={0.78}>
      <rect x={-130} y={-150} width={260} height={150} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={6} />
      {[-88, 88].map((tx) => (
        <g key={tx}>
          <rect x={tx - 32} y={-330} width={64} height={180} fill={L2.graniteDark} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${tx - 40} -330 L ${tx} -382 L ${tx + 40} -330 Z`} fill={L2.graniteShade} stroke={KRP.ink} strokeWidth={6} />
          <line x1={tx} y1={-382} x2={tx} y2={-414} stroke={KRP.ink} strokeWidth={6} />
          <line x1={tx - 13} y1={-404} x2={tx + 13} y2={-404} stroke={KRP.ink} strokeWidth={6} />
        </g>
      ))}
    </g>
  </g>
);

// -------------------------------------------------------------------
// 背景: 峠の上 (#50 #51 行きと帰りを見わたす場所)
// -------------------------------------------------------------------
const TougeBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.72} />
    <rect x={-20} y={-20} width={W + 40} height={300} fill={KRP.blue} opacity={0.3} />
    {/* 雲 */}
    {[[420, 200, 1.0], [1480, 170, 0.8]].map(([cx, cy, cs], i) => (
      <g key={i} transform={`translate(${Number(cx) + Math.sin(f / 70 + i) * 20} ${cy}) scale(${cs})`} opacity={0.85}>
        <ellipse cx={-56} cy={8} rx={62} ry={28} fill={KRP.white} />
        <ellipse cx={22} cy={-8} rx={78} ry={40} fill={KRP.white} />
        <ellipse cx={88} cy={12} rx={56} ry={26} fill={KRP.white} />
      </g>
    ))}
    {/* 幾重にも重なる尾根 (遠→近) */}
    <path d="M -20 620 Q 300 520 640 600 Q 980 500 1340 590 Q 1660 520 1940 596 L 1940 760 L -20 760 Z"
      fill={TKP.mist} opacity={0.85} />
    <path d="M -20 700 Q 360 600 760 684 Q 1160 586 1560 676 Q 1760 636 1940 684 L 1940 820 L -20 820 Z"
      fill={L2.mossyFar} stroke={KRP.ink} strokeWidth={4.5} opacity={0.85} />
    <path d="M -20 790 Q 420 690 900 776 Q 1340 696 1940 770 L 1940 900 L -20 900 Z"
      fill={L2.mossyMid} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
    {/* 峠の足もと (岩の棚) */}
    <path d="M -20 1100 L -20 900 Q 300 846 700 880 Q 1200 912 1500 862 Q 1740 826 1940 884 L 1940 1100 Z"
      fill={TKP.rock} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 60 950 Q 420 918 820 944 M 1080 952 Q 1440 918 1820 946"
      fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {/* 峠の道しるべ (積み石) */}
    <g transform="translate(180 880)">
      {[[0, 0, 56, 26], [2, -46, 44, 22], [-4, -84, 32, 18]].map(([sx, sy, rx, ry], i) => (
        <ellipse key={i} cx={Number(sx)} cy={Number(sy)} rx={Number(rx)} ry={Number(ry)}
          fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
      ))}
    </g>
    {/* 風 */}
    {[0, 1, 2].map((i) => {
      const t = ((f * 2.2 + i * 60) % 320) / 320;
      return <path key={i} d={`M ${lerp(-120, 2040, t)} ${430 + i * 70} q 60 -14 120 0`}
        fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.55 * (1 - Math.abs(t - 0.5) * 1.4)} />;
    })}
  </g>
);

// #34 章扉: 日本にも、神様に会いに行った人たち
const SceneCh2Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={433}
    over={<ChapterDoor num={2} title="口実その1 信仰" left={1020} top={600} width={760} t={seg(f, 18, 46)} />}>
    <KumanoBg f={f} />
    <g transform={`translate(0 ${(1 - easeOut(seg(f, 0, 26))) * 60})`} opacity={easeOut(seg(f, 0, 26))}>
      <OjiShrine x={520} y={860} s={1.25} />
    </g>
    <HeianPilgrim x={840} y={930} s={0.95} f={f} phase={2} face="normal" />
  </Frame>
);

// #35 平安末、都で大ブームの熊野詣 (列をなして歩く)
const SceneKumanoBoom: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 4, 80));
  return (
    <Frame f={f} seed={434} caption="熊野詣 大ブーム"
      over={f >= 40 ? <Stamp x={1560} y={210} text="平安末" size={50} /> : undefined}>
      <KumanoBg f={f} />
      <OjiShrine x={1600} y={850} s={0.9} />
      {/* 3人の参詣者が道をぞろぞろ */}
      {[0, 1, 2].map((i) => (
        <HeianPilgrim key={i}
          x={lerp(260 - i * 240, 820 - i * 230, walk)}
          y={960 + (i % 2) * 22} s={0.82 - i * 0.04} f={f} phase={3 + i}
          face={i === 1 ? "smile" : "normal"} />
      ))}
    </Frame>
  );
};

// #36 後白河法皇、生涯34回 (とされる) — 正の字で数え上げ
const SceneGoshirakawa34: React.FC<{ f: number }> = ({ f }) => {
  const nTally = Math.round(lerp(0, 34, easeOut(seg(f, 14, 70))));
  return (
    <Frame f={f} seed={435}>
      <KumanoBg f={f} />
      <HououPerson x={620} y={930} s={1.08} f={f} phase={4} face="normal" />
      <TagPlate x={620} y={548} text="後白河法皇" size={38} t={seg(f, 0, 14)} />
      {/* 回数カード */}
      <g transform={`translate(1330 520) scale(${pop(seg(f, 8, 26))})`}>
        <rect x={-340} y={-190} width={680} height={380} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.grayDark}>熊野へ 生涯</text>
        <text x={0} y={76} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160} fill={KRP.red}>{nTally}回</text>
        <text x={0} y={152} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.grayDark}>— とされる</text>
      </g>
    </Frame>
  );
};

// #37 京都から険しい山道、往復およそ1か月
const SceneOufuku1kagetsu: React.FC<{ f: number }> = ({ f }) => {
  const tKii = easeOut(seg(f, 10, 56));      // 紀伊路が引かれる
  const tNaka = easeOut(seg(f, 50, 84));     // 中辺路が引かれる
  const tWalk = easeOut(seg(f, 10, 84));     // 歩く点
  const [wx, wy] = kmapPointAt(KUMANO_ROUTE, tWalk);
  return (
    <Frame f={f} seed={436} caption="往復 約1か月">
      <rect x={0} y={0} width={W} height={H} fill={KRP.cream} />
      <KinkiMapCard>
        {/* 紀伊路 (京都→渡辺津→田辺): 海沿いを南下 */}
        <path d={kiijiPath} fill="none" stroke={KRP.red} strokeWidth={8}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.9}
          pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - tKii }} />
        {/* 中辺路 (田辺→熊野本宮): 山に分け入る */}
        <path d={nakahechiPath} fill="none" stroke={TKP.purpleDark} strokeWidth={8}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.95}
          pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - tNaka }} />
        {/* 歩く点 (参詣者の現在地) */}
        <circle cx={wx} cy={wy} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={wx} cy={wy} r={6.5} fill={KRP.red} />
      </KinkiMapCard>
      {/* 地名 */}
      <KmapLabel lon={KPLACE.kyoto[0]} lat={KPLACE.kyoto[1]} text="京都" dx={118} dy={-58} t={seg(f, 0, 12)} />
      <KmapLabel lon={KPLACE.watanabe[0]} lat={KPLACE.watanabe[1]} text="渡辺津 (大阪)" dx={-200} dy={-26} t={seg(f, 8, 22)} />
      <KmapLabel lon={KPLACE.tanabe[0]} lat={KPLACE.tanabe[1]} text="田辺" dx={-152} dy={28} t={seg(f, 36, 50)} />
      <KmapLabel lon={KPLACE.hongu[0]} lat={KPLACE.hongu[1]} text="熊野本宮" dx={150} dy={44} t={seg(f, 62, 78)} accent />
      {/* 凡例 */}
      <g transform={`translate(176 330) scale(${pop(seg(f, 2, 18))})`}>
        <rect x={-140} y={-96} width={280} height={192} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.ink}>熊野参詣道</text>
        <line x1={-112} y1={2} x2={-48} y2={2} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
        <text x={-34} y={14} fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>紀伊路</text>
        <line x1={-112} y1={58} x2={-48} y2={58} stroke={TKP.purpleDark} strokeWidth={8} strokeLinecap="round" />
        <text x={-34} y={70} fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>中辺路</text>
      </g>
      {/* 暦 (30マスが埋まっていく) */}
      <g transform={`translate(1562 300) scale(${pop(seg(f, 4, 20))})`}>
        <rect x={-210} y={-96} width={420} height={210} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>ひと月の暦</text>
        {Array.from({ length: 30 }, (_, i) => {
          const filled = i < Math.round(tWalk * 30);
          return <rect key={i} x={-180 + (i % 10) * 37} y={-30 + Math.floor(i / 10) * 42}
            width={28} height={32} rx={5}
            fill={filled ? KRP.orange : KRP.cream} stroke={KRP.ink} strokeWidth={3} opacity={filled ? 0.95 : 0.6} />;
        })}
      </g>
    </Frame>
  );
};

// #38 建前は、厳しい修行 (社前で祈る)
const SceneTatemaeShugyou: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={437}>
    <NachiTakiBg f={f} />
    {/* 滝行 (滝つぼの中で打たれる2人) */}
    <Gyouja x={898} y={904} s={0.62} f={f} phase={5} face="worried" gassho />
    <Gyouja x={1026} y={916} s={0.66} f={f} phase={6} face="normal" gassho />
    {/* 岩棚で座禅 (左右の段) */}
    <Gyouja x={430} y={780} s={0.56} f={f} phase={7} face="normal" kneel />
    <Gyouja x={1452} y={772} s={0.56} f={f} phase={8} face="normal" kneel />
    {/* 手前で合掌して立つ行者 */}
    <Gyouja x={330} y={958} s={0.84} f={f} phase={9} face="normal" gassho />
    {/* 岩をよじ登る2人 */}
    <Gyouja x={620} y={716} s={0.44} f={f} phase={10} face="worried" lean={-14} />
    <Gyouja x={1340} y={640} s={0.4} f={f} phase={11} face="worried" lean={12} />
    <TagPlate x={330} y={296} text="建前は 修行" size={40} t={seg(f, 20, 36)} />
  </Frame>
);

// #39 ところが道中の宿では歌会 (夜・あたたかい灯り・短冊と♪)
const SceneYadoUtakai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={438} caption="道中の宿では…">
    <KumanoBg f={f} />
    {/* 夜のとばり */}
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.42} />
    <circle cx={300} cy={190} r={54} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
    {/* 宿 (窓があたたかく光る) */}
    <g transform="translate(960 760)">
      <rect x={-330} y={-220} width={660} height={220} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -370 -220 L 0 -330 L 370 -220 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {[-220, -40, 140].map((wx, i) => (
        <rect key={i} x={wx} y={-170} width={90} height={110} rx={8}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5}
          opacity={0.75 + Math.sin(f / 9 + i * 2) * 0.2} />
      ))}
    </g>
    {/* 中のふたり: 短冊を掲げてうたう */}
    <HeianPilgrim x={790} y={742} s={0.5} f={f} phase={6} face="smile" />
    <HeianPilgrim x={975} y={742} s={0.5} f={f} phase={7} face="smile" />
    {/* 短冊 */}
    <g transform={`translate(880 560) rotate(${Math.sin(f / 15) * 5}) scale(${pop(seg(f, 16, 32))})`}>
      <rect x={-26} y={-78} width={52} height={156} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={0} y1={-54} x2={0} y2={54} stroke={KRP.ink} strokeWidth={4} strokeDasharray="6 12" opacity={0.6} />
    </g>
    {/* のぼる♪ */}
    {[0, 1, 2].map((i) => {
      const yy = ((f * 1.3 + i * 44) % 130);
      return <text key={i} x={1180 + i * 60} y={600 - yy} fontFamily={FONT} fontWeight={900}
        fontSize={52} fill={KRP.orange} opacity={1 - yy / 130}>♪</text>;
    })}
  </Frame>
);

// #40 同行した歌人・藤原定家の日記 (巻物に筆を走らせる)
const SceneTeikaNikki: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeOut(seg(f, 10, 70));
  return (
    <Frame f={f} seed={439}>
      <KumanoBg f={f} />
      {/* 文机と巻物 */}
      <g transform="translate(1060 870)">
        <rect x={-260} y={-30} width={520} height={26} rx={8} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-240} y={-4} width={30} height={60} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={210} y={-4} width={30} height={60} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 巻物がするすると開く */}
        <rect x={-200} y={-94} width={lerp(60, 400, roll)} height={58} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={lerp(-140, 200, roll)} cy={-66} r={36} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {/* 書かれた行 */}
        {Array.from({ length: 6 }, (_, i) => {
          const show = roll > (i + 1) / 7;
          return show ? <line key={i} x1={-178 + i * 56} y1={-84} x2={-178 + i * 56} y2={-48}
            stroke={KRP.ink} strokeWidth={5} opacity={0.75} /> : null;
        })}
      </g>
      {/* 書き手 (筆を持つ歌人) */}
      <HeianPilgrim x={640} y={930} s={0.95} f={f} phase={8} face="normal" />
      <g transform={`translate(${770} ${770 + bobOf(f, 8)}) rotate(${18 + Math.sin(f / 7) * 7})`}>
        <line x1={0} y1={0} x2={0} y2={-70} stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
        <path d="M -6 0 L 0 18 L 6 0 Z" fill={KRP.ink} />
      </g>
      <TagPlate x={640} y={560} text="歌人 藤原定家" size={36} t={seg(f, 0, 14)} />
      <TagPlate x={1240} y={700} text="日記が残る" size={32} t={seg(f, 40, 56)} fill={KRP.cream} />
    </Frame>
  );
};

// #41 中身は愚痴たっぷり (巻物アップ + にじむ墨)
const SceneGuchiNijimu: React.FC<{ f: number }> = ({ f }) => {
  const t1 = seg(f, 10, 26), t2 = seg(f, 36, 52);
  // 歩いている感じ: 上下に弾みながら、ほんの少し前へ進む
  const bob1 = Math.sin(f / 7) * 7, bob2 = Math.sin(f / 7 + 1.9) * 6;
  const adv = lerp(0, 56, easeOut(seg(f, 0, 110)));
  return (
    <Frame f={f} seed={440} caption="日記の中身は…">
      <KewashiiMichiBg f={f} />
      {/* 歩きながら愚痴る定家一行 */}
      <HeianPilgrim x={760 + adv} y={962 + bob1} s={1.0} f={f} phase={9} face="worried" />
      <HeianPilgrim x={1186 + adv * 0.7} y={928 + bob2} s={0.84} f={f} phase={12} face="worried" />
      <Sweat x={846 + adv} y={700} f={f} n={2} />
      {/* 愚痴の吹き出し */}
      <Bubble x={470} y={420} w={600} h={126} t={t1} size={50}
        text="道が けわしい…" tailTo={[720 + adv, 700]} />
      <Bubble x={1430} y={556} w={540} h={120} t={t2} size={48}
        text="体が つらい…" tailTo={[1216 + adv * 0.7, 700]} />
    </Frame>
  );
};

// #42 苦行のはずが人間らしい旅 (建前とホンネの天びん)
const SceneNingenRashii: React.FC<{ f: number }> = ({ f }) => {
  const tilt = lerp(0, 9, easeOut(seg(f, 30, 60)));
  return (
    <Frame f={f} seed={441}>
      <KumanoBg f={f} />
      {/* 天びん */}
      <g transform="translate(960 620)">
        <rect x={-18} y={-20} width={36} height={300} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -120 280 L 120 280 L 80 236 L -80 236 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${tilt})`}>
          <line x1={-380} y1={-20} x2={380} y2={-20} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
          {/* 左皿: 建前 (軽い) */}
          <g transform="translate(-380 -20)">
            <line x1={0} y1={0} x2={0} y2={70} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -110 70 Q 0 150 110 70 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            <TagPlate x={0} y={36} text="建前: 修行" size={30} t={seg(f, 6, 20)} />
          </g>
          {/* 右皿: ホンネ (重くて下がる) */}
          <g transform="translate(380 -20)">
            <line x1={0} y1={0} x2={0} y2={70} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -110 70 Q 0 150 110 70 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            <TagPlate x={0} y={36} text="ホンネ: 愚痴と歌" size={30} t={seg(f, 16, 30)} color={KRP.red} />
          </g>
        </g>
      </g>
      <HeianPilgrim x={320} y={950} s={0.85} f={f} phase={10} face="smile" />
      <TagPlate x={1560} y={300} text="人間らしい旅" size={34} t={seg(f, 56, 72)} fill={KRP.cream} />
    </Frame>
  );
};

// #43 同じころ、地球の反対側 (地球儀: 日本→サンティアゴ)
const SceneGlobeHantai: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <GlobeTravel f={f} from="japan" to="santiago" fromLabel="日本" toLabel="サンティアゴ" />
    <TBadge />
  </AbsoluteFill>
);

// #44 スペインの聖地サンティアゴ・デ・コンポステーラ (大聖堂へ寄る)
const SceneSantiago: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 6, 30));
  return (
    <Frame f={f} seed={442} caption="スペインの聖地">
      <PlazaBg f={f} />
      {/* オブラドイロ広場の正面 (中央・大きく) */}
      <g opacity={clamp01(seg(f, 4, 20))}>
        <SantiagoCathedral x={960} y={840} s={1} f={f} />
      </g>
      {/* 鐘の音の弧 (左右の鐘楼から) */}
      {[0, 1].map((i) => (
        <g key={i}>
          <path d={`M ${640 - i * 36} ${290 - i * 30} q -60 -56 -158 -28`}
            fill="none" stroke={KRP.orange} strokeWidth={7} strokeLinecap="round"
            opacity={0.35 + Math.sin(f / 10 + i * 2) * 0.3} />
          <path d={`M ${1280 + i * 36} ${290 - i * 30} q 60 -56 158 -28`}
            fill="none" stroke={KRP.orange} strokeWidth={7} strokeLinecap="round"
            opacity={0.35 + Math.sin(f / 10 + i * 2) * 0.3} />
        </g>
      ))}
      {/* スペイン国旗 (左手前の広場に立つ) */}
      <g opacity={clamp01(t)}><SpainFlag x={210} y={836} s={0.92} f={f} /></g>
      <TagPlate x={1672} y={282} text="サンティアゴ・デ・コンポステーラ" size={24} t={seg(f, 36, 52)} />
    </Frame>
  );
};

// #45 ヨーロッパ中から巡礼者が歩いて集まる
const SceneJunreishaAtsumaru: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 76));
  return (
    <Frame f={f} seed={443} caption="欧州中から徒歩で">
      <CaminoBg f={f} />
      {/* 左右から収束する巡礼者たち */}
      <EuroPilgrim x={lerp(140, 760, t)} y={940} s={0.85} f={f} phase={11} face="normal" />
      <EuroPilgrim x={lerp(420, 930, t)} y={980} s={0.95} f={f} phase={12} face="smile" />
      {/* 右から来る人は左右反転 (x=cx を軸に鏡像) */}
      <g transform={`translate(${2 * lerp(1880, 1300, t)} 0) scale(-1 1)`}>
        <EuroPilgrim x={lerp(1880, 1300, t)} y={950} s={0.85} f={f} phase={13} face="normal" />
      </g>
      <EuroPilgrim x={lerp(1700, 1120, t)} y={1000} s={0.9} f={f} phase={14} face="smile" />
    </Frame>
  );
};

// #46 聖地のそばで、あるものが売られていた (門前町の露店)
// 画づくり: 主役の屋台と商品 (ホタテ貝のバッジ) を画面センター x=960 に大きく据える。
// 店員は陳列台の後ろ、巡礼者 (客) は陳列台の前。地面 (石畳) と落ち影で全員を接地させる。
const SceneAruMono: React.FC<{ f: number }> = ({ f }) => {
  // 客が商品に手をのばして1枚とる (肩 → ひじ → 手 の2節。肩はマントの右縁 x=670 のすぐ外)
  const reach = easeOut(seg(f, 10, 46));
  const pbob = bobOf(f, 16);
  const shx = 672, shy = 788 + pbob;                     // 肩
  // 手にした貝は「吊るした貝の列 (y 578〜636)」とも「左のトレイ (x 650〜808)」とも
  // かぶらない位置 (x 834〜898 / y 646〜706) に収める
  // さらに、吊るした貝 (x 773 / 872) の真下に重ならないよう、その中間に置く
  const hx = lerp(690, 816, reach);                      // 手
  const hy = lerp(856, 716, reach) + pbob * 0.5;
  const ex = lerp(698, 756, reach);                      // ひじ
  const ey = lerp(822, 800, reach) + pbob * 0.7;
  const armD = `M ${shx} ${shy} L ${ex} ${ey} L ${hx} ${hy}`;
  const hold = pop(clamp01(seg(f, 42, 60)));
  return (
    <Frame f={f} seed={444} caption="聖地のそばの売店">
      <MonzenMachiBg f={f} />

      {/* 主役の露店 (地面 y=900 に接地。中心は画面センター x=960) */}
      {/* behind / children は屋台のローカル座標 (原点 = 画面の 960,900。s=1なのでそのまま足せる) */}
      <MonzenStall
        x={960} y={900} s={1} f={f}
        behind={
          /* 店員: 陳列台 (天板の上面 local -170) のちょうど後ろに立ち、腰から上が見える */
          <MedievalVendor x={255} y={-128} s={0.8} f={f} phase={15} face="smile" />
        }
      >
        {/* --- 陳列台の上の商品 (すべてホタテ貝のバッジ) --- */}
        {/* 左: 木のトレイに2枚 */}
        <ScallopShell x={-265} y={-195} s={0.52} metal />
        <ScallopShell x={-205} y={-195} s={0.52} metal />
        <rect x={-310} y={-186} width={158} height={16} rx={4} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 中央: 主役の1枚 (いちばん大きく) */}
        <g transform={`translate(0 ${Math.sin(f / 15) * 2})`}>
          <ScallopShell x={0} y={-211} s={1.15} metal />
        </g>
        {/* 右: 2枚 (店員の体にかぶりすぎない位置に) */}
        <ScallopShell x={112} y={-195} s={0.7} metal />
        <ScallopShell x={190} y={-195} s={0.7} metal />
        {/* 右端にたたんだ赤い布 (#47 で飛んでいく布) */}
        <path d="M 282 -170 L 356 -170 L 350 -196 Q 318 -208 288 -194 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      </MonzenStall>

      {/* 客の巡礼者 (陳列台の前。足もとに落ち影) */}
      <GroundShadow x={600} y={922} rx={90} ry={22} o={0.22} />
      <EuroPilgrim x={600} y={920} s={1} f={f} phase={16} face="smile" />
      {/* 商品に手をのばす腕 (輪郭線 → 袖 の順に重ねる) */}
      <path d={armD} fill="none" stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" strokeLinejoin="round" />
      <path d={armD} fill="none" stroke={TKP.woodDark} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {hold > 0 && (
        <g transform={`translate(${hx + 6} ${hy - 32}) scale(${hold})`}>
          <ScallopShell x={0} y={0} s={0.62} metal />
        </g>
      )}
    </Frame>
  );
};

// #47 ホタテ貝の形をした金属のバッジ (布が飛んで正体あらわる)
const SceneHotateReveal: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 14, 34));
  return (
    <Frame f={f} seed={445} caption="金属のバッジ">
      <MonzenMachiBg f={f} />
      {/* 飛んでいく布 */}
      {t < 1 && (
        <g transform={`translate(${lerp(860, 1560, t)} ${lerp(700, 260, t)}) rotate(${t * 160})`} opacity={1 - t * 0.6}>
          <path d="M -110 0 Q -90 -70 0 -80 Q 90 -70 110 0 Q 40 24 0 10 Q -40 24 -110 0 Z"
            fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {/* 主役のホタテバッジ (ドン) */}
      <g transform={`translate(860 600) scale(${pop(seg(f, 16, 34)) * 2.6})`}>
        <ScallopShell x={0} y={0} metal />
      </g>
      <Burst x={860} y={600} r={240} t={seg(f, 20, 40)} n={14} />
      {/* きらり */}
      {[[-150, -130], [160, -90], [0, 150]].map(([kx, ky], i) => (
        <g key={i} transform={`translate(${860 + kx} ${600 + ky}) scale(${0.5 + Math.sin(f / 8 + i * 2.2) * 0.3})`} opacity={0.85}>
          <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {/* #45 と同じ地面を使うので、落ち影が無いとここだけ浮いて見える (2026-11-01 追加) */}
      {/* 足元 y=950 だと落ち影が字幕帯に隠れて浮いて見えるので、#45 と同じ y=920 に上げる */}
      <GroundShadow x={1430} y={922} rx={82} ry={20} o={0.22} />
      <EuroPilgrim x={1430} y={920} s={0.9} f={f} phase={17} face="surprised" />
    </Frame>
  );
};

// #48 鋳型でジャンジャン量産、巡礼者はこぞって買った
const SceneIgataRyousan: React.FC<{ f: number }> = ({ f }) => {
  const nOut = Math.floor(seg(f, 10, 80) * 6);
  return (
    <Frame f={f} seed={446} caption="鋳型で量産">
      <KoubouBg f={f} />
      <BadgeMold x={560} y={560} s={1.3} open={seg(f, 4, 18)} />
      {/* 鋳型から弧を描いて飛び出すバッジ → 山になる */}
      {Array.from({ length: 6 }, (_, i) => {
        const tt = clamp01(seg(f, 14 + i * 11, 40 + i * 11));
        if (tt <= 0) return null;
        const bx = lerp(560, 1060 + (i % 3) * 70, tt);
        const by = lerp(540, 820 - Math.floor(i / 3) * 40, tt) - Math.sin(tt * Math.PI) * 180;
        return <ScallopShell key={i} x={bx} y={by} s={0.55} metal />;
      })}
      {/* 積み上がった山の台 */}
      <ellipse cx={1130} cy={870} rx={190} ry={30} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {/* 買いに並ぶ巡礼者 (コイン) */}
      <EuroPilgrim x={1480} y={960} s={0.85} f={f} phase={18} face="smile" />
      <EuroPilgrim x={1720} y={990} s={0.8} f={f} phase={19} face="normal" />
      <g transform={`translate(1390 640) scale(${pop(seg(f, 46, 62))})`}>
        <circle cx={0} cy={0} r={30} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>$</text>
      </g>
      {nOut >= 5 && <Burst x={1130} y={760} r={120} t={seg(f, 70, 86)} n={10} />}
    </Frame>
  );
};

// #49 「聖地に行ってきた証拠」を胸につけて帰る
const SceneMuneNoShouko: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.5 + Math.sin(f / 9) * 0.3;
  // 聖地に背を向けて、夕日のほうへ歩いて帰る
  const walk = easeOut(seg(f, 0, 120));
  const px = lerp(1180, 900, walk);
  const bob = Math.sin(f / 7) * 7;
  return (
    <Frame f={f} seed={447} caption="行ってきた証拠">
      <YuugureKaeriBg f={f} />
      {/* 大きめの巡礼者 (帰路・歩いている) */}
      <EuroPilgrim x={px} y={958 + bob} s={1.25} f={f} phase={20} face="smile" />
      {/* 胸のバッジ (光る) */}
      <g transform={`translate(${px} ${786 + bob})`}>
        <circle cx={0} cy={0} r={64} fill={KRP.yellow} opacity={glow * 0.45} />
        <g transform={`scale(${pop(seg(f, 10, 26)) * 0.52})`}>
          <ScallopShell x={0} y={0} metal />
        </g>
      </g>
      {/* 矢印で胸もとに注目 */}
      <g transform={`translate(${px + 250 + Math.sin(f / 10) * 10} 756) rotate(200)`} opacity={clamp01(seg(f, 18, 30))}>
        <path d="M 0 0 L 74 0 M 52 -18 L 74 0 L 52 18" fill="none" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <TagPlate x={420} y={400} text="故郷へ" size={34} t={seg(f, 34, 48)} />
    </Frame>
  );
};

// #50 歴史上はじめて量産された観光土産 (台座 + 認定スタンプ)
const SceneRyousanMiyage: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={448}
    over={f >= 50 ? <Stamp x={1210} y={220} text="観光みやげ 第1号" size={46} /> : undefined}>
    <CaminoBg f={f} />
    {/* 展示台座 */}
    <g transform="translate(830 700)">
      <rect x={-190} y={60} width={380} height={56} rx={10} fill={TKP.stone} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-140} y={-30} width={280} height={90} rx={10} fill={TKP.stone} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
      {/* 主役 */}
      <g transform={`translate(0 ${-150 + Math.sin(f / 13) * 6}) scale(${pop(seg(f, 6, 24)) * 1.9})`}>
        <ScallopShell x={0} y={0} metal />
      </g>
      {/* 光の輪 */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + f / 40;
        return <line key={i} x1={Math.cos(a) * 190} y1={-150 + Math.sin(a) * 190}
          x2={Math.cos(a) * 225} y2={-150 + Math.sin(a) * 225}
          stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" opacity={0.8} />;
      })}
    </g>
    <EuroPilgrim x={1540} y={960} s={0.9} f={f} phase={21} face="smile" />
  </Frame>
);

// #51 行くための口実と、行ってきた証拠 (対のカード)
const SceneKoujitsuShouko: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={449}>
    <TougeBg f={f} />
    {/* 左: 口実 (行き) */}
    <g transform={`translate(560 540) scale(${pop(seg(f, 4, 20))})`}>
      <rect x={-230} y={-160} width={460} height={320} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.orange}>口実</text>
      <path d="M -120 10 L 90 10 M 64 -14 L 90 10 L 64 34" fill="none" stroke={KRP.orange} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <text x={0} y={116} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>行くとき</text>
    </g>
    {/* 右: 証拠 (帰り) */}
    <g transform={`translate(1360 540) scale(${pop(seg(f, 18, 34))})`}>
      <rect x={-230} y={-160} width={460} height={320} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.blueDeep}>証拠</text>
      <path d="M 120 10 L -90 10 M -64 -14 L -90 10 L -64 34" fill="none" stroke={KRP.blueDeep} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <text x={0} y={116} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>帰るとき</text>
    </g>
    {/* 下でそれぞれの象徴 */}
    <ScallopShell x={1360} y={880} s={0.9} metal />
    <g transform="translate(560 880)"><QMark x={0} y={20} s={0.7} f={f} color={KRP.orange} /></g>
  </Frame>
);

// #52 旅とお土産は、もうこのころからセット (2枚が寄ってリボン)
// 団体ツアー (先頭の三角旗 + ぞろぞろついていく人)。「旅」カードの中身。
// v2修正: もとは意味のない波線 (〜)。旗1本だけだと国旗に見えたので、
//         旗のうしろに人を並べて「ツアー」と分かる絵にした (2026-11-01 作者指摘)
const TourFlag: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const w = Math.sin(f / 9) * 4; // はためき
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 旗竿 */}
      <line x1={-96} y1={6} x2={-96} y2={-116} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={-96} cy={-122} r={9} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 三角旗 (添乗員が掲げるペナント)。人の頭にかからない高さに上げてある */}
      <path d={`M -92 -112 L 16 ${-86 + w} L -92 -58 Z`} fill={KRP.red} stroke={KRP.ink}
        strokeWidth={5.5} strokeLinejoin="round" />
      {/* ついていく人 (3人。色ちがいで団体に見せる) */}
      {[
        { dx: -28, c: KRP.blueDeep },
        { dx: 24, c: KRP.green },
        { dx: 76, c: KRP.orange },
      ].map((p, i) => {
        const bob = Math.sin((f + i * 19) / 12) * 2.5;
        return (
          <g key={i} transform={`translate(${p.dx} ${bob})`}>
            {/* 胴 */}
            <path d="M -19 0 Q -21 -42 0 -44 Q 21 -42 19 0 Z" fill={p.c} stroke={KRP.ink} strokeWidth={4.5} />
            {/* 頭 */}
            <circle cx={0} cy={-58} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        );
      })}
    </g>
  );
};

const SceneTabiMiyageSet: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 8, 44));
  const tie = seg(f, 46, 64);
  return (
    <Frame f={f} seed={450} caption="旅とお土産はセット">
      <TougeBg f={f} />
      {/* 2枚のカードが真ん中へ */}
      <g transform={`translate(${lerp(360, 760, t)} 560) rotate(${lerp(-8, -3, t)})`}>
        <rect x={-180} y={-130} width={360} height={260} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>旅</text>
        <TourFlag x={8} y={102} s={0.84} f={f} />
      </g>
      <g transform={`translate(${lerp(1560, 1160, t)} 560) rotate(${lerp(8, 3, t)})`}>
        <rect x={-180} y={-130} width={360} height={260} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>お土産</text>
        <ScallopShell x={0} y={44} s={0.62} metal />
      </g>
      {/* 結びのリボン */}
      {tie > 0 && (
        <g transform={`translate(960 400) scale(${pop(tie)})`}>
          <path d="M 0 0 L -64 -40 Q -96 -18 -64 10 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 0 0 L 64 -40 Q 96 -18 64 10 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-8} r={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      <Burst x={960} y={400} r={150} t={seg(f, 56, 74)} n={12} />
    </Frame>
  );
};

// #53 では、このセットを極限まで磨いた国の話へ (海のむこうの日本)
const SceneTsugiNoKuni: React.FC<{ f: number }> = ({ f }) => {
  const sx = lerp(360, 1120, easeOut(seg(f, 6, 80)));
  return (
    <Frame f={f} seed={451} caption="次はどこの国?">
      {/* 海 */}
      <rect x={-20} y={560} width={W + 40} height={560} fill={KRP.blue} opacity={0.4} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M -40 ${660 + i * 110} q 60 ${-18 + Math.sin(f / 16 + i) * 8} 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}
          fill="none" stroke={KRP.blue} strokeWidth={6} opacity={0.65} />
      ))}
      {/* 帆船が右へ */}
      <SailShip x={sx} y={700} s={1.1} f={f} />
      {/* 行き先の島 + 鳥居 */}
      <g transform={`translate(1620 640) scale(${pop(seg(f, 40, 58))})`}>
        <path d="M -200 60 Q -120 -50 0 -46 Q 130 -50 210 60 Z" fill={TKP.forest} stroke={KRP.ink} strokeWidth={6} />
        <ShinmeiTorii x={0} y={-40} s={0.52} />
      </g>
      <QMark x={1620} y={420} f={f} t={seg(f, 56, 70)} />
      {/* 太陽 */}
      <circle cx={280} cy={240} r={62} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
    </Frame>
  );
};

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  // 序章 (#1〜#15)
  tb1_uriba_katamaru: (f) => <SceneUribaKatamaru f={f} />,
  tb1_watashi_desu: (f) => <SceneWatashiDesu f={f} />,
  tb1_okashi_janai: (f) => <SceneOkashiJanai f={f} />,
  tb1_shokuba_ninzu: (f) => <SceneShokubaNinzu f={f} />,
  tb1_12vs18: (f) => <Scene12vs18 f={f} />,
  tb1_tanomarete_nai: (f) => <SceneTanomareteNai f={f} />,
  tb1_mou_hitotsu: (f) => <SceneMouHitotsu f={f} />,
  tb1_tsukareta_kara: (f) => <SceneTsukaretaKara f={f} />,
  tb1_koujitsu_iiwake: (f) => <SceneKoujitsuIiwake f={f} />,
  tb1_sennen_shikumi: (f) => <SceneSennenShikumi f={f} />,
  tb1_naze_yasumu: (f) => <SceneNazeYasumu f={f} />,
  tb1_naze_kimazui: (f) => <SceneNazeKimazui f={f} />,
  tb1_ippon_tsunagaru: (f) => <SceneIpponTsunagaru f={f} />,
  tb1_kazoeru_suki: (f) => <SceneKazoeruSuki f={f} />,
  tb1_sennen_michi: (f) => <SceneSennenMichi f={f} />,
  // 第1章 (#16〜#33)
  tb1_ch1_door: (f) => <SceneCh1Door f={f} />,
  tb1_baiae: (f) => <SceneBaiae f={f} />,
  tb1_onsen_utage: (f) => <SceneOnsenUtage f={f} />,
  tb1_kanraku_machi: (f) => <SceneKanrakuMachi f={f} />,
  tb1_mukashi_kara: (f) => <SceneMukashiKara f={f} />,
  tb1_mibun_dake: (f) => <SceneMibunDake f={f} />,
  tb1_shomin_idou: (f) => <SceneShominIdou f={f} />,
  tb1_travel_travail: (f) => <SceneTravelTravail f={f} />,
  tb1_goumon_setsu: (f) => <SceneGoumonSetsu f={f} />,
  tb1_michi_kiken: (f) => <SceneMichiKiken f={f} />,
  tb1_inochigake: (f) => <SceneInochigake f={f} />,
  tb1_dou_suru: (f) => <SceneDouSuru f={f} />,
  tb1_tatta_hitotsu: (f) => <SceneTattaHitotsu f={f} />,
  tb1_kamisama_aini: (f) => <SceneKamisamaAini f={f} />,
  tb1_junrei_tabi: (f) => <SceneJunreiTabi f={f} />,
  tb1_tomerarenai: (f) => <SceneTomerarenai f={f} />,
  tb1_aite_kamisama: (f) => <SceneAiteKamisama f={f} />,
  tb1_koujitsu_route1: (f) => <SceneKoujitsuRoute1 f={f} />,
  // 第2章 (#34〜#53)
  tb1_ch2_door: (f) => <SceneCh2Door f={f} />,
  tb1_kumano_boom: (f) => <SceneKumanoBoom f={f} />,
  tb1_goshirakawa_34: (f) => <SceneGoshirakawa34 f={f} />,
  tb1_oufuku_1kagetsu: (f) => <SceneOufuku1kagetsu f={f} />,
  tb1_tatemae_shugyou: (f) => <SceneTatemaeShugyou f={f} />,
  tb1_yado_utakai: (f) => <SceneYadoUtakai f={f} />,
  tb1_teika_nikki: (f) => <SceneTeikaNikki f={f} />,
  tb1_guchi_nijimu: (f) => <SceneGuchiNijimu f={f} />,
  tb1_ningen_rashii: (f) => <SceneNingenRashii f={f} />,
  tb1_globe_hantai: (f) => <SceneGlobeHantai f={f} />,
  tb1_santiago: (f) => <SceneSantiago f={f} />,
  tb1_junreisha_atsumaru: (f) => <SceneJunreishaAtsumaru f={f} />,
  tb1_aru_mono: (f) => <SceneAruMono f={f} />,
  tb1_hotate_reveal: (f) => <SceneHotateReveal f={f} />,
  tb1_igata_ryousan: (f) => <SceneIgataRyousan f={f} />,
  tb1_mune_no_shouko: (f) => <SceneMuneNoShouko f={f} />,
  tb1_ryousan_miyage: (f) => <SceneRyousanMiyage f={f} />,
  tb1_koujitsu_shouko: (f) => <SceneKoujitsuShouko f={f} />,
  tb1_tabi_miyage_set: (f) => <SceneTabiMiyageSet f={f} />,
  tb1_tsugi_no_kuni: (f) => <SceneTsugiNoKuni f={f} />,
};

export const tabiB1Scene = (motif: string, f: number): React.ReactElement | null => {
  const S = SCENES[motif];
  return S ? S(f) : null;
};

// 文#1〜#53 に1対1で対応する motif 名の列 (長さは必ず53。再利用は同じ名前を繰り返す)
export const T_B1_MOTIFS: string[] = [
  // 序章 (#1〜#15)
  "tb1_uriba_katamaru",   // #1 売り場で箱を手に固まる人
  "tb1_watashi_desu",     // #2 私です (カメラ寄り+矢印)
  "tb1_okashi_janai",     // #3 数えているのはお菓子の数ではない
  "tb1_shokuba_ninzu",    // #4 職場の人数です (頭上で12人数える)
  "tb1_12vs18",           // #5 12人だと足りない・18個入りは多すぎ
  "tb1_tanomarete_nai",   // #6 誰に頼まれたわけでもない
  "tb1_mou_hitotsu",      // #7 そして、もうひとつ
  "tb1_tsukareta_kara",   // #8 「疲れたから」と言い訳して来た
  "tb1_koujitsu_iiwake",  // #9 出かける口実と帰ってからの言い訳
  "tb1_sennen_shikumi",   // #10 千年かけて作った「仕組み」
  "tb1_naze_yasumu",      // #11 なぜ休むのに理由が要るのか
  "tb1_naze_kimazui",     // #12 なぜ配らないと気まずいのか
  "tb1_ippon_tsunagaru",  // #13 20分でぜんぶ一本につながる
  "tb1_kazoeru_suki",     // #14 数える自分が少し好きになる
  "tb1_sennen_michi",     // #15 旅とお土産、千年の歴史のお話
  // 第1章 (#16〜#33)
  "tb1_ch1_door",         // #16 章扉: 時は2000年前、古代ローマ
  "tb1_baiae",            // #17 貴族は保養地バイアエへ
  "tb1_onsen_utage",      // #18 温泉、宴会、海辺の別荘
  "tb1_kanraku_machi",    // #19 ローマ帝国のラスベガス
  "tb1_mukashi_kara",     // #20 楽しむ旅は大昔からあった
  "tb1_mibun_dake",       // #21 楽しめたのは身分のある人だけ
  "tb1_shomin_idou",      // #22 庶民の移動=仕事か逃亡か戦争
  "tb1_travel_travail",   // #23 travel=travailとされる
  "tb1_goumon_setsu",     // #24 さかのぼると拷問の道具という説
  "tb1_michi_kiken",      // #25 道は危険、宿は少なく、山賊も
  "tb1_inochigake",       // #26 歩くしかない時代、旅は命がけ
  "tb1_dou_suru",         // #27 身分のない人はどうするか
  "tb1_tatta_hitotsu",    // #28 堂々と使える口実がひとつだけ
  "tb1_kamisama_aini",    // #29 「神様に、会いに行ってきます」
  "tb1_junrei_tabi",      // #30 信仰の旅――巡礼です
  "tb1_tomerarenai",      // #31 誰にも止められません
  "tb1_aite_kamisama",    // #32 会いに行く相手は神様
  "tb1_koujitsu_route1",  // #33 旅の口実の第一号 (路線図 count=1)
  // 第2章 (#34〜#53)
  "tb1_ch2_door",         // #34 章扉: 日本にも神様に会いに行った人たち
  "tb1_kumano_boom",      // #35 平安末、都で大ブームの熊野詣
  "tb1_goshirakawa_34",   // #36 後白河法皇は34回とされる
  "tb1_oufuku_1kagetsu",  // #37 京都から往復およそ1か月
  "tb1_tatemae_shugyou",  // #38 建前は、厳しい修行
  "tb1_yado_utakai",      // #39 道中の宿では歌会
  "tb1_teika_nikki",      // #40 藤原定家の日記が残る
  "tb1_guchi_nijimu",     // #41 中身は愚痴がたっぷり
  "tb1_ningen_rashii",    // #42 苦行のはずが人間らしい旅
  "tb1_globe_hantai",     // #43 同じころ地球の反対側でも (地球儀移動)
  "tb1_santiago",         // #44 スペインの聖地サンティアゴ
  "tb1_junreisha_atsumaru", // #45 ヨーロッパ中から巡礼者が集まる
  "tb1_aru_mono",         // #46 聖地のそばで売られていたあるもの
  "tb1_hotate_reveal",    // #47 ホタテ貝の形の金属バッジ
  "tb1_igata_ryousan",    // #48 鋳型でジャンジャン量産
  "tb1_mune_no_shouko",   // #49 証拠を胸につけて帰る
  "tb1_ryousan_miyage",   // #50 史上初の量産観光土産
  "tb1_koujitsu_shouko",  // #51 行く口実と行ってきた証拠
  "tb1_tabi_miyage_set",  // #52 旅とお土産はこのころからセット
  "tb1_tsugi_no_kuni",    // #53 このセットを磨き上げた国へ (予告)
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const T_B1_PREVIEW_FRAMES = Math.max(T_B1_MOTIFS.length, 1);
export const TabiB1Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(T_B1_MOTIFS.length - 1, 0));
  const motif = T_B1_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {tabiB1Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 1} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
