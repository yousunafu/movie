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
  ShinmeiTorii,
} from "./TabiKits";
import { KoujitsuRoute, GlobeTravel, SailShip } from "./TabiTravel";

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
        <rect x={-24} y={-16} width={48} height={32} rx={6}
          fill={red ? "#F3C8BE" : KRP.white} stroke={red ? KRP.red : KRP.ink} strokeWidth={4} />
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
        <GendaiBg f={f} plane={false} />
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
      {/* 頭を指す赤矢印 */}
      {seg(f, 26, 40) > 0 && (
        <g transform={`translate(1040 ${300 + Math.sin(f / 10) * 8}) scale(${pop(seg(f, 26, 40))})`}>
          <path d="M 0 90 L -44 10 L -16 10 L -16 -60 L 16 -60 L 16 10 L 44 10 Z"
            fill={KRP.red} stroke={KRP.ink} strokeWidth={5} transform="rotate(180)" />
        </g>
      )}
      <Burst x={1040} y={430} r={120} t={seg(f, 36, 56)} n={12} />
    </Frame>
  );
};

// #3 数えているのはお菓子の数ではない (お菓子案に✗)
const SceneOkashiJanai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={402}>
    <GendaiBg f={f} plane={false} />
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

// #4 数えているのは職場の人数 (頭上に12人が増えていく)
const SceneShokubaNinzu: React.FC<{ f: number }> = ({ f }) => {
  const shown = Array.from({ length: 12 }, (_, i) => seg(f, 12 + i * 5, 24 + i * 5));
  const count = shown.filter((t) => t > 0.4).length;
  return (
    <Frame f={f} seed={403}>
      <GendaiBg f={f} plane={false} />
      <ModernTraveler x={1500} y={890} s={0.95} f={f} phase={3} face="normal" gaze={[-6, -4]} />
      <g transform={`translate(1416 ${742 + bobOf(f, 3)}) scale(0.5)`}><KashiBox x={0} y={0} /></g>
      {/* 大きな考えごと雲 + 12人 */}
      <circle cx={1330} cy={620} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={1240} cy={540} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <g>
        <ellipse cx={740} cy={380} rx={520} ry={250} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {shown.map((t, i) => (
          <MiniHead key={i} x={400 + (i % 6) * 136} y={340 + Math.floor(i / 6) * 130} s={1.15} t={t}
            color={i % 2 ? KRP.blueDeep : KRP.green} />
        ))}
      </g>
      {/* 数えカウンタ */}
      <g transform="translate(740 118)">
        <rect x={-130} y={-44} width={260} height={88} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={KRP.blueDeep}>{count}人</text>
      </g>
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
    {/* 12人ぶんに線を引いて、あまり6個を囲む */}
    {seg(f, 78, 92) > 0 && (
      <g opacity={seg(f, 78, 92)}>
        <line x1={1276} y1={620} x2={1276} y2={740} stroke={KRP.red} strokeWidth={7} strokeDasharray="14 10" />
        <path d={`M 1300 632 L 1744 632 L 1744 730 L 1300 730 Z`} fill="none" stroke={KRP.red} strokeWidth={6} rx={10} />
      </g>
    )}
    <TagPlate x={1520} y={810} text="6個 あまる…" size={36} t={seg(f, 88, 102)} color={KRP.red} />
  </Frame>
);

// #6 誰に頼まれたわけでもない (まぼろしの上司に✗)
const SceneTanomareteNai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={405}>
    <GendaiBg f={f} plane={false} />
    <ModernTraveler x={1100} y={890} f={f} phase={4} face="worried" gaze={[-5, 0]} />
    <g transform={`translate(1012 ${745 + bobOf(f, 4)}) scale(0.52)`}><KashiBox x={0} y={0} /></g>
    <Sweat x={1180} y={560} f={f} />
    {/* 点線のまぼろし上司 (頼んだ人はいない) */}
    <g opacity={0.85 * seg(f, 20, 36)}>
      <g fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="12 12">
        <circle cx={480} cy={560} r={62} />
        <path d="M 424 740 Q 424 630 480 630 Q 536 630 536 740 Z" />
      </g>
      <Bubble x={480} y={360} w={330} h={110} tailTo={[480, 480]} text="たのむね" size={40} t={seg(f, 26, 40)} color={KRP.grayDark} />
    </g>
    <CrossMark x={480} y={560} s={1.5} t={seg(f, 52, 66)} />
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
        <TagPlate x={330} y={760} text="1000年前" size={30} />
        <TagPlate x={1590} y={760} text="いま" size={30} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={330 + i * 158} y1={806} x2={330 + i * 158} y2={834} stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
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
    {/* 手ぶらで帰ってきた私 (左) と同僚 (右) */}
    <ModernTraveler x={560} y={890} f={f} phase={8} face="worried" gaze={[6, 0]} />
    <Sweat x={640} y={560} f={f} />
    <Person x={1400} y={890} f={f} phase={9} face="normal" gaze={[-6, 0]} cloth={KRP.blueDeep} clothDark="#38598C" />
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
    <GendaiBg f={f} plane={false} />
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

// #16 章扉: 時は2000年前、古代ローマ
const SceneCh1Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={415}
    over={
      <>
        <ChapterDoor num={1} title="旅には身分か口実が必要だった" t={seg(f, 18, 46)} />
        {f >= 44 && <Stamp x={150} y={168} text="2000年前" size={52} />}
      </>
    }>
    <RomaBg f={f} />
    <g transform={`translate(0 ${(1 - easeOut(seg(f, 0, 26))) * 60})`} opacity={easeOut(seg(f, 0, 26))}>
      <RomanTemple x={520} y={760} s={1.08} />
    </g>
    <TogaPerson x={880} y={880} s={0.95} f={f} phase={1} face="smile" laurel />
  </Frame>
);

// #17 貴族たちは保養地バイアエへ
const SceneBaiae: React.FC<{ f: number }> = ({ f }) => {
  const px = lerp(340, 980, easeOut(seg(f, 6, 66)));
  return (
    <Frame f={f} seed={416}>
      <RomaBg f={f} />
      <RomanTemple x={1480} y={700} s={0.8} />
      {/* 道しるべ: バイアエ */}
      <g transform={`translate(1210 870) scale(${pop(seg(f, 0, 16))})`}>
        <rect x={-14} y={-200} width={28} height={200} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -150 -200 L 120 -200 L 170 -156 L 120 -112 L -150 -112 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={-10} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>バイアエ</text>
      </g>
      {/* 貴族ふたりが向かう */}
      <TogaPerson x={px} y={880} s={0.95} f={f} phase={2} face="smile" laurel />
      <TogaPerson x={px - 230} y={890} s={0.88} f={f} phase={3} face="smile" />
      {/* 進む気分の線 */}
      {[0, 1].map((i) => (
        <path key={i} d={`M ${px - 360 - i * 60} ${800 + i * 36} q -30 6 -60 0`}
          fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.35} />
      ))}
    </Frame>
  );
};

// #18 温泉、宴会、海辺の別荘 (3点セットが順に現れる)
const SceneOnsenUtage: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={417}>
    <RomaBg f={f} />
    {/* 温泉 (大理石の湯船+湯気) */}
    <g transform={`translate(400 760) scale(${pop(seg(f, 4, 20))})`}>
      <path d="M -170 -40 L 170 -40 Q 150 60 0 60 Q -150 60 -170 -40 Z" fill={TKP.marble} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-40} rx={170} ry={26} fill={TKP.seaBlue} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={-40} cy={-74} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -58 -68 Q -40 -56 -22 -68" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${-70 + i * 70} ${-96 - ((f * 1.2 + i * 26) % 50)} q -12 -16 0 -30 q 12 -14 0 -30`}
          fill="none" stroke={TKP.steam} strokeWidth={9} strokeLinecap="round" opacity={0.9 - ((f * 1.2 + i * 26) % 50) / 60} />
      ))}
    </g>
    {/* 宴会 (杯をかかげる) */}
    <g transform={`translate(910 660) scale(${pop(seg(f, 22, 38))})`}>
      <WineCup x={-54} y={0} s={1.2} />
      <WineCup x={54} y={-8} s={1.2} />
      <Burst x={0} y={-70} r={52} n={8} color={KRP.yellow} />
    </g>
    {/* 海辺の別荘 */}
    <g transform={`translate(1480 700) scale(${pop(seg(f, 40, 56))})`}>
      <RomanTemple x={0} y={0} s={0.74} />
      <path d="M -200 24 q 40 -18 80 0 q 40 18 80 0" fill="none" stroke={TKP.seaBlue} strokeWidth={8} strokeLinecap="round" />
    </g>
  </Frame>
);

// #19 「ローマ帝国のラスベガス」歓楽の町 (夜のにぎわい)
const SceneKanrakuMachi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={418}>
    <RomaBg f={f} sea={false} />
    {/* 夕闇 */}
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.32} />
    <circle cx={1680} cy={200} r={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    <RomanTemple x={960} y={740} s={1.0} />
    {/* あかりの列 (ゆらめく) */}
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={i} cx={420 + i * 160} cy={790}
        r={13 + Math.sin(f / 7 + i * 1.4) * 3.5}
        fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} opacity={0.95} />
    ))}
    {/* 杯をかかげる貴族たち */}
    <TogaPerson x={560} y={900} s={0.9} f={f} phase={4} face="smile" />
    <g transform={`translate(640 ${700 + bobOf(f, 4)})`}><WineCup x={0} y={0} s={0.9} /></g>
    <TogaPerson x={1370} y={900} s={0.9} f={f} phase={5} face="smile" laurel />
    <g transform={`translate(1290 ${700 + bobOf(f, 5)})`}><WineCup x={0} y={0} s={0.9} /></g>
    {/* 音楽の記号 */}
    {[0, 1, 2].map((i) => {
      const yy = ((f * 1.5 + i * 50) % 140);
      return (
        <text key={i} x={960 + (i - 1) * 140} y={430 - yy} fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={KRP.orange} opacity={1 - yy / 150} textAnchor="middle">♪</text>
      );
    })}
  </Frame>
);

// #20 楽しむための旅は大昔からあった (年表に✓)
const SceneMukashiKara: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={419}>
    {/* 年表 */}
    <g opacity={easeOut(seg(f, 0, 14))}>
      <line x1={240} y1={700} x2={1680} y2={700} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
      <path d="M 1680 700 l -34 -20 v 40 Z" fill={KRP.ink} />
      <TagPlate x={360} y={770} text="2000年前" size={30} />
      <TagPlate x={1560} y={770} text="いま" size={30} />
    </g>
    {/* 左: 大昔の楽しむ旅 (貴族+杯) */}
    <TogaPerson x={360} y={620} s={0.8} f={f} phase={6} face="smile" laurel />
    <g transform={`translate(455 ${468 + bobOf(f, 6)})`}><WineCup x={0} y={0} s={0.8} /></g>
    {/* 右: いまの楽しむ旅 (私) */}
    <ModernTraveler x={1500} y={620} s={0.8} f={f} phase={7} face="smile" />
    {/* 点線でつながる = ずっとあった */}
    <path d="M 480 430 Q 960 300 1380 430" fill="none" stroke={KRP.green} strokeWidth={8}
      strokeDasharray="20 16" pathLength={1} strokeDashoffset={1 - easeOut(seg(f, 24, 64))}
      style={{ strokeDasharray: 1 } as React.CSSProperties}
      opacity={0.9} />
    <CheckMark x={960} y={320} s={1.2} t={seg(f, 60, 76)} />
  </Frame>
);

// #21 ただし楽しめたのは身分のある人だけ
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

// #22 庶民の移動 = 仕事か、逃亡か、戦争
const SceneShominIdou: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={421}>
    {/* 重い荷を背負って歩く庶民 */}
    <Shomin x={960} y={900} s={1.0} f={f} phase={10} face="worried" lean={4} />
    <g transform={`translate(1040 ${660 + bobOf(f, 10)}) rotate(10)`}>
      <ellipse cx={0} cy={0} rx={86} ry={64} fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -60 -34 Q 0 -70 60 -34" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    </g>
    <Sweat x={1050} y={520} f={f} />
    {/* 3枚の札: 仕事 / 逃亡 / 戦争 */}
    {([
      [430, "仕事", 8, <path d="M -26 22 L 26 -26 M 14 -38 L 38 -14" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" fill="none" />],
      [960, "逃亡", 26, <g><path d="M -34 0 h 24 M -34 16 h 18 M -34 -16 h 18" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={18} cy={-16} r={13} fill={KRP.ink} /><path d="M 10 -4 L 30 18" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" /></g>],
      [1490, "戦争", 44, <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round">
        <line x1={-28} y1={24} x2={24} y2={-28} /><line x1={-24} y1={-28} x2={28} y2={24} />
        <circle cx={0} cy={0} r={16} fill={KRP.red} strokeWidth={5} /></g>],
    ] as Array<[number, string, number, React.ReactNode]>).map(([x, label, t0, icon], i) => {
      const t = pop(seg(f, t0, t0 + 16));
      if (t <= 0) return null;
      return (
        <g key={i} transform={`translate(${x} 300) scale(${t})`}>
          <rect x={-130} y={-120} width={260} height={240} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
          <g transform="translate(0 -30)">{icon}</g>
          <text x={0} y={76} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>{label}</text>
        </g>
      );
    })}
  </Frame>
);

// #23 travel = travail (とされる)
const SceneTravelTravail: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={422}>
    {/* 左: travel */}
    <g transform={`translate(520 480) scale(${pop(seg(f, 0, 16))})`}>
      <rect x={-250} y={-150} width={500} height={300} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.blueDeep}>travel</text>
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>旅</text>
    </g>
    {/* 右: travail */}
    <g transform={`translate(1400 480) scale(${pop(seg(f, 20, 36))})`}>
      <rect x={-250} y={-150} width={500} height={300} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.red}>travail</text>
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>苦役</text>
    </g>
    {/* = 記号 */}
    <g transform={`translate(960 480) scale(${pop(seg(f, 40, 54))})`} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round">
      <line x1={-54} y1={-22} x2={54} y2={-22} />
      <line x1={-54} y1={22} x2={54} y2={22} />
    </g>
    {/* 断定しない注記 */}
    <TagPlate x={960} y={740} text="※ もとは同じ言葉 — とされる" size={30} t={seg(f, 56, 70)} color={KRP.grayDark} />
  </Frame>
);

// #24 さかのぼると拷問の道具に行き着くという説
const SceneGoumonSetsu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={423}>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.2} />
    {/* 右: travail (前のシーンから引き継ぎ) */}
    <g transform="translate(1430 480) scale(0.86)">
      <rect x={-250} y={-150} width={500} height={300} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.red}>travail</text>
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>苦役</text>
    </g>
    {/* さかのぼる矢印 */}
    <g opacity={easeOut(seg(f, 10, 30))}>
      <path d="M 1150 480 L 850 480" fill="none" stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" strokeDasharray="26 18" />
      <path d="M 850 480 l 40 -24 v 48 Z" fill={KRP.ink} />
      <TagPlate x={1000} y={390} text="さかのぼると…" size={28} t={seg(f, 14, 28)} />
    </g>
    {/* 左: tripalium (三本杭) */}
    <g transform={`translate(460 500) scale(${pop(seg(f, 30, 48))})`}>
      <rect x={-270} y={-200} width={540} height={400} rx={18} fill={KRP.ink} opacity={0.92} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.white} strokeWidth={11} strokeLinecap="round">
        <line x1={-80} y1={110} x2={-28} y2={-110} />
        <line x1={0} y1={110} x2={0} y2={-120} />
        <line x1={80} y1={110} x2={28} y2={-110} />
        <line x1={-70} y1={-30} x2={70} y2={-30} opacity={0.7} />
      </g>
      <text x={0} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.white}>tripalium</text>
    </g>
    <TagPlate x={460} y={790} text="拷問の道具 — という説まで" size={30} t={seg(f, 52, 66)} color={KRP.grayDark} />
  </Frame>
);

// #25 道は危険、宿は少なく、山賊も出る
const SceneMichiKiken: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={424}>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.22} />
    {/* 荒れた道 */}
    <path d="M -20 900 Q 480 840 960 880 Q 1440 920 1940 860 L 1940 1100 L -20 1100 Z"
      fill={TKP.roadTan} opacity={0.8} />
    {[300, 700, 1200, 1600].map((x, i) => (
      <path key={i} d={`M ${x} ${880 + (i % 2) * 14} l 36 10 l 30 -16`} fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={0.5} />
    ))}
    {/* 暗い木立 */}
    {[180, 420, 1500, 1740].map((x, i) => (
      <g key={i} transform={`translate(${x} ${820 - (i % 2) * 40}) scale(${1 + (i % 2) * 0.3})`}>
        <path d="M 0 -260 Q 70 -200 44 -120 Q 90 -70 40 -30 L -40 -30 Q -90 -70 -44 -120 Q -70 -200 0 -260 Z"
          fill={TKP.forestDark} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <rect x={-13} y={-34} width={26} height={44} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {/* おびえる旅人 */}
    <Shomin x={860} y={900} s={0.95} f={f} phase={11} face="surprised" gaze={[6, -2]} />
    {/* 木陰から山賊 */}
    <g transform={`translate(${1500 - pop(seg(f, 34, 50)) * 110} 880)`} opacity={seg(f, 34, 44)}>
      <Person x={0} y={0} s={0.9} f={f} phase={12} face="normal" hair="cap" cloth={KRP.ink} clothDark={KRP.ink} gaze={[-6, 0]} />
      {/* 覆面 */}
      <rect x={-50} y={-232 + bobOf(f, 12)} width={100} height={34} rx={8} fill={KRP.red} opacity={0.92} stroke={KRP.ink} strokeWidth={4} />
      {/* 短刀 */}
      <g transform={`translate(-86 ${-160 + bobOf(f, 12)}) rotate(-30)`}>
        <rect x={-8} y={-54} width={16} height={54} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-16} y={0} width={32} height={14} rx={5} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
    <Burst x={1388} y={560} r={70} t={seg(f, 46, 60)} color={KRP.red} n={8} />
    {/* 遠くにぽつんと一軒の宿 */}
    <g transform="translate(360 500)" opacity={easeOut(seg(f, 8, 24))}>
      <rect x={-80} y={-70} width={160} height={70} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -96 -70 L 0 -130 L 96 -70 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={-44} width={40} height={44} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      <TagPlate x={0} y={60} text="宿はまばら" size={26} />
    </g>
  </Frame>
);

// #26 歩くしかない時代、旅は命がけ
const SceneInochigake: React.FC<{ f: number }> = ({ f }) => {
  const px = lerp(420, 760, easeOut(seg(f, 0, 80)));
  return (
    <Frame f={f} seed={425}>
      {/* 果てしない上り道 */}
      <path d="M -20 980 Q 600 920 1100 740 Q 1500 600 1860 420"
        fill="none" stroke={TKP.roadTan} strokeWidth={100} strokeLinecap="round" />
      <path d="M -20 980 Q 600 920 1100 740 Q 1500 600 1860 420"
        fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="2 30" opacity={0.4} />
      {/* 照りつける太陽 */}
      <g transform="translate(1660 220)">
        <circle cx={0} cy={0} r={70} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + f / 60;
          return <line key={i} x1={Math.cos(a) * 92} y1={Math.sin(a) * 92}
            x2={Math.cos(a) * 118} y2={Math.sin(a) * 118} stroke={KRP.orange} strokeWidth={8} strokeLinecap="round" />;
        })}
      </g>
      {/* 杖をついて進む旅人 */}
      <Shomin x={px} y={930} s={1.0} f={f} phase={13} face="worried" lean={6} />
      <line x1={px + 96} y1={760 + bobOf(f, 13)} x2={px + 116} y2={930} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
      <Sweat x={px + 70} y={580} f={f} n={3} />
      {/* 足あと */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={px - 150 - i * 90} cy={955 + (i % 2) * 10} rx={16} ry={9}
          fill={KRP.ink} opacity={0.3 - i * 0.06} />
      ))}
    </Frame>
  );
};

// #27 身分のない人が遠くへ行きたくなったら?
const SceneDouSuru: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={426}>
    {/* 手前の丘と遠くの聖地 */}
    <path d="M -20 760 Q 300 660 620 760 L 620 1100 L -20 1100 Z" fill={TKP.caminoGold} opacity={0.7} />
    <path d="M 1300 820 Q 1600 640 1940 740 L 1940 1100 L 1300 1100 Z" fill={TKP.forest} opacity={0.5} />
    {/* 遠い目的地 (丘の上の神殿がほのかに光る) */}
    <g transform="translate(1640 660)" opacity={easeOut(seg(f, 20, 40))}>
      <circle cx={0} cy={-120} r={130} fill={KRP.yellow} opacity={0.26} />
      <RomanTemple x={0} y={0} s={0.52} />
    </g>
    {/* あいだの谷 */}
    <path d="M 620 760 Q 960 980 1300 820" fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.3} strokeDasharray="14 14" />
    {/* 丘の上で考えこむ庶民 */}
    <Shomin x={330} y={740} s={1.05} f={f} phase={14} face="worried" gaze={[7, -4]} />
    <QMark x={480} y={300} s={1.3} f={f} t={seg(f, 36, 52)} />
  </Frame>
);

// #28 堂々と使える口実が、たったひとつだけ
const SceneTattaHitotsu: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 16, 44));
  return (
    <Frame f={f} seed={427}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.38} />
      {/* スポットライト */}
      <path d={`M 960 -20 L ${960 - 340} 900 L ${960 + 340} 900 Z`} fill={KRP.yellow} opacity={0.22 * seg(f, 6, 20)} />
      {/* 天から降りてくる1枚の札 */}
      <g transform={`translate(960 ${lerp(-160, 480, drop)}) rotate(${Math.sin(f / 20) * 3})`}>
        <rect x={-230} y={-130} width={460} height={260} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} fill={KRP.ink}>口実</text>
        <circle cx={-170} cy={-70} r={34} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <text x={-170} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.white}>1</text>
      </g>
      <Burst x={960} y={480} r={160} t={seg(f, 44, 62)} color={KRP.yellow} n={12} />
      {/* 見上げる庶民 */}
      <Shomin x={460} y={930} s={0.9} f={f} phase={15} face="surprised" gaze={[6, -6]} />
    </Frame>
  );
};

// #29 「神様に、会いに行ってきます」
const SceneKamisamaAini: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={428}>
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
    {/* 両手を合わせて宣言する庶民 */}
    <Shomin x={700} y={900} s={1.05} f={f} phase={16} face="smile" gaze={[5, -5]} />
    <g transform={`translate(700 ${740 + bobOf(f, 16)})`}>
      <path d="M -14 -24 L 0 -58 L 14 -24 L 14 20 L -14 20 Z" fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
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
  </Frame>
);

// #30 信仰の旅――巡礼です (ことばの札が立つ)
const SceneJunreiTabi: React.FC<{ f: number }> = ({ f }) => {
  const px = lerp(500, 820, easeOut(seg(f, 0, 80)));
  return (
    <Frame f={f} seed={429}>
      <CaminoBg f={f} />
      <EuroPilgrim x={px} y={900} s={1.0} f={f} phase={17} face="smile" />
      {/* ことばの大札 */}
      <g transform={`translate(1270 330) scale(${pop(seg(f, 40, 58))}) rotate(-4)`}>
        <rect x={-250} y={-110} width={500} height={220} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <text x={30} y={32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={KRP.red}>巡礼</text>
        <g transform="translate(-170 0) scale(0.76)"><ScallopShell x={0} y={0} /></g>
      </g>
      <Burst x={1270} y={330} r={150} t={seg(f, 54, 70)} n={12} />
    </Frame>
  );
};

// #31 誰にも止められません (関門の棒が上がる)
const SceneTomerarenai: React.FC<{ f: number }> = ({ f }) => {
  const barUp = easeOut(seg(f, 26, 52));
  const px = lerp(430, 1270, easeOut(seg(f, 48, 96)));
  return (
    <Frame f={f} seed={430}>
      <CaminoBg f={f} />
      {/* 関門 */}
      <g transform="translate(900 900)">
        <rect x={-26} y={-300} width={52} height={300} fill={TKP.stone} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`rotate(${-64 * barUp} 0 -250)`}>
          <rect x={0} y={-272} width={560} height={44} rx={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          {[80, 200, 320, 440].map((x) => (
            <rect key={x} x={x} y={-272} width={60} height={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
      </g>
      {/* 門番はわきへ (とがめない) */}
      <Person x={1180} y={910} s={0.9} f={f} phase={18} face="normal" helmet cloth={KRP.grayDark} clothDark={KRP.grayDark} gaze={[-5, 0]} />
      {/* 巡礼者が通りすぎる */}
      <EuroPilgrim x={px} y={910} s={0.95} f={f} phase={19} face="smile" />
      <CheckMark x={900} y={280} s={1.3} t={seg(f, 70, 86)} />
    </Frame>
  );
};

// #32 なにしろ相手は神様です (見上げる空に大きな後光)
const SceneAiteKamisama: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.12 * easeOut(seg(f, 0, 60));
  return (
    <Frame f={f} seed={431}>
      <g transform={zoomAt(z, 960, 300)}>
        {/* 大空 + 雲 */}
        <rect x={-20} y={-20} width={W + 40} height={720} fill={KRP.blueSoft} opacity={0.45} />
        {[0, 1].map((i) => (
          <ellipse key={i} cx={360 + i * 1140 + Math.sin(f / 40 + i * 2) * 16} cy={520 - i * 60}
            rx={190} ry={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        ))}
        {/* 巨大な後光 */}
        <g transform="translate(960 260)">
          <circle cx={0} cy={0} r={150} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
          <circle cx={0} cy={0} r={200} fill="none" stroke={KRP.orange} strokeWidth={8} opacity={0.6} />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2 + f / 90;
            return <line key={i} x1={Math.cos(a) * 225} y1={Math.sin(a) * 225}
              x2={Math.cos(a) * (270 + Math.sin(f / 12 + i) * 10)} y2={Math.sin(a) * (270 + Math.sin(f / 12 + i) * 10)}
              stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" />;
          })}
        </g>
        {/* 地上で見上げるふたり (巡礼者と門番) */}
        <path d="M -20 920 L 1940 920 L 1940 1100 L -20 1100 Z" fill={TKP.caminoGold} opacity={0.6} />
        <EuroPilgrim x={620} y={930} s={0.85} f={f} phase={20} face="surprised" />
        <Person x={1300} y={930} s={0.85} f={f} phase={21} face="surprised" helmet cloth={KRP.grayDark} clothDark={KRP.grayDark} gaze={[-3, -7]} />
      </g>
    </Frame>
  );
};

// #33 旅の口実の第一号 (口実路線図 count=1)
const SceneKoujitsuRoute1: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={432} caption="旅の口実 路線図">
    <KoujitsuRoute x={960} y={580} s={1.1} f={f} count={1} ride={false} />
    <Burst x={420} y={580} r={120} t={seg(f, 30, 48)} color={KRP.orange} n={12} />
  </Frame>
);

// ===== 第2章 (#34〜#53): 口実その1 信仰 =====

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
      <HeianPilgrim x={430} y={920} s={1.05} f={f} phase={4} face="normal" />
      <TagPlate x={430} y={560} text="後白河法皇" size={38} t={seg(f, 0, 14)} />
      {/* 回数カード */}
      <g transform={`translate(1240 500) scale(${pop(seg(f, 8, 26))})`}>
        <rect x={-310} y={-170} width={620} height={340} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.grayDark}>熊野へ 生涯</text>
        <text x={0} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill={KRP.red}>{nTally}回</text>
        <text x={0} y={136} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.grayDark}>— とされる</text>
      </g>
      {/* 数え棒がパラパラ増える */}
      <g transform="translate(940 760)">
        {Array.from({ length: Math.min(nTally, 34) }, (_, i) => (
          <line key={i} x1={(i % 17) * 36 - 290} y1={Math.floor(i / 17) * 56 - 20}
            x2={(i % 17) * 36 - 290} y2={Math.floor(i / 17) * 56 + 16}
            stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
        ))}
      </g>
    </Frame>
  );
};

// #37 京都から険しい山道、往復およそ1か月
const SceneOufuku1kagetsu: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 10, 80));
  // つづら折りの道 (京都→熊野)
  const px = lerp(360, 1480, t);
  const py = 420 + Math.sin(t * Math.PI * 3) * 60 + t * 260;
  return (
    <Frame f={f} seed={436} caption="往復 約1か月">
      <KumanoBg f={f} />
      {/* 行程のジグザグ線 */}
      <path d="M 360 420 L 640 560 L 500 660 L 900 760 L 1180 620 L 1480 740"
        fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="4 22" opacity={0.85}
        pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - t }} />
      <TagPlate x={360} y={350} text="京都" size={36} t={seg(f, 0, 12)} />
      <TagPlate x={1480} y={820} text="熊野" size={36} t={seg(f, 8, 20)} />
      {/* 歩く点 (参詣者の現在地) */}
      <circle cx={px} cy={py} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={px} cy={py} r={8} fill={KRP.red} />
      {/* 暦 (30マスが埋まっていく) */}
      <g transform={`translate(1430 300) scale(${pop(seg(f, 4, 20))})`}>
        <rect x={-210} y={-96} width={420} height={210} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>ひと月の暦</text>
        {Array.from({ length: 30 }, (_, i) => {
          const filled = i < Math.round(t * 30);
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
    <KumanoBg f={f} />
    {/* 滝 (修行の象徴) */}
    <g opacity={0.9}>
      <rect x={1480} y={300} width={64} height={560} fill={KRP.blue} opacity={0.5} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={1496 + i * 16} y1={300 + ((f * 7 + i * 120) % 560)}
          x2={1496 + i * 16} y2={340 + ((f * 7 + i * 120) % 560)}
          stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      ))}
      <ellipse cx={1512} cy={872} rx={90} ry={22} fill={KRP.blue} opacity={0.5} />
    </g>
    <OjiShrine x={760} y={840} s={1.2} />
    {/* 深く礼をする参詣者 (lean で前傾) */}
    <HeianPilgrim x={1080} y={930} s={0.95} f={f} phase={5} face="worried" />
    <TagPlate x={760} y={520} text="建前は 修行" size={40} t={seg(f, 20, 36)} />
    <Sweat x={1150} y={660} f={f} n={2} />
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
  const t1 = seg(f, 10, 26), t2 = seg(f, 34, 50);
  return (
    <Frame f={f} seed={440} caption="日記の中身は…">
      <KumanoBg f={f} />
      {/* 大きく開いた巻物 */}
      <g transform="translate(960 560)">
        <rect x={-560} y={-170} width={1120} height={340} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={-590} cy={0} r={56} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={590} cy={0} r={56} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        {/* 愚痴の文字 */}
        <g opacity={clamp01(t1)}>
          <text x={-280} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={KRP.ink}
            transform={`rotate(${-2})`}>道が けわしい…</text>
        </g>
        <g opacity={clamp01(t2)}>
          <text x={240} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={KRP.ink}
            transform={`rotate(${2})`}>体が つらい…</text>
        </g>
        {/* にじむ墨 (じわっと育つ) */}
        {[[-480, 100], [60, -90], [470, -40]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={lerp(0, 18 + i * 7, easeOut(seg(f, 20 + i * 16, 56 + i * 16)))}
            fill={KRP.ink} opacity={0.3} />
        ))}
      </g>
      {/* 脇でぐったりの書き手 */}
      <HeianPilgrim x={340} y={950} s={0.85} f={f} phase={9} face="worried" />
      <Sweat x={400} y={700} f={f} n={2} />
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
  const z = 1 + 0.5 * easeOut(seg(f, 8, 60));
  return (
    <Frame f={f} seed={442} caption="スペインの聖地">
      <g transform={zoomAt(z, 1520, 520)}>
        <CaminoBg f={f} />
        {/* 鐘の音の弧 */}
        {[0, 1].map((i) => (
          <path key={i} d={`M ${1400 - i * 40} ${360 - i * 36} q 60 -60 160 -30`}
            fill="none" stroke={KRP.orange} strokeWidth={7} strokeLinecap="round"
            opacity={0.4 + Math.sin(f / 10 + i * 2) * 0.35} />
        ))}
      </g>
      <TagPlate x={760} y={810} text="サンティアゴ・デ・コンポステーラ" size={30} t={seg(f, 36, 52)} />
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
      <g transform={`translate(${lerp(1880, 1260, t)} 0) scale(-1 1) translate(${-2 * lerp(1880, 1260, t)} 0)`}>
        <EuroPilgrim x={lerp(1880, 1260, t)} y={950} s={0.85} f={f} phase={13} face="normal" />
      </g>
      <EuroPilgrim x={lerp(1700, 1120, t)} y={1000} s={0.9} f={f} phase={14} face="smile" />
      {/* 収束の矢印 */}
      <path d={`M 300 760 Q 700 700 900 720`} fill="none" stroke={KRP.red} strokeWidth={8}
        strokeDasharray="4 20" opacity={0.7} pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - t }} />
      <path d={`M 1740 760 Q 1300 700 1140 720`} fill="none" stroke={KRP.red} strokeWidth={8}
        strokeDasharray="4 20" opacity={0.7} pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - t }} />
    </Frame>
  );
};

// #46 聖地のそばで、あるものが売られていた (布をかぶせた謎の台)
const SceneAruMono: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={444} caption="聖地のそばの売店">
    <CaminoBg f={f} />
    {/* 露店 */}
    <g transform="translate(860 760)">
      <rect x={-250} y={-40} width={500} height={150} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -290 -160 L 290 -160 L 250 -60 L -250 -60 Z" fill={TKP.brickDark} stroke={KRP.ink} strokeWidth={6} />
      {/* ひさしの縞 */}
      {[-230, -130, -30, 70, 170].map((sx, i) => (
        <path key={i} d={`M ${sx} -160 L ${sx + 36} -160 L ${sx + 30} -60 L ${sx - 6} -60 Z`} fill={KRP.white} opacity={0.75} />
      ))}
      {/* 布をかぶせた謎のふくらみ (もぞもぞ揺れる) */}
      <g transform={`translate(0 ${-40 + Math.sin(f / 11) * 3}) rotate(${Math.sin(f / 17) * 2})`}>
        <path d="M -120 0 Q -110 -96 0 -104 Q 110 -96 120 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} opacity={0.92} />
        <path d="M -120 0 Q -60 -22 0 -10 Q 60 -22 120 0" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      </g>
    </g>
    {/* 売り子 */}
    <Person x={620} y={880} s={0.85} f={f} phase={15} face="smile" hair="cap" cloth={TKP.caminoGold} clothDark={TKP.woodDark} />
    {/* のぞきこむ巡礼者 */}
    <EuroPilgrim x={1300} y={950} s={0.95} f={f} phase={16} face="surprised" />
    <QMark x={1130} y={520} f={f} t={seg(f, 30, 44)} />
  </Frame>
);

// #47 ホタテ貝の形をした金属のバッジ (布が飛んで正体あらわる)
const SceneHotateReveal: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 14, 34));
  return (
    <Frame f={f} seed={445} caption="金属のバッジ">
      <CaminoBg f={f} />
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
      <EuroPilgrim x={1430} y={950} s={0.9} f={f} phase={17} face="surprised" />
    </Frame>
  );
};

// #48 鋳型でジャンジャン量産、巡礼者はこぞって買った
const SceneIgataRyousan: React.FC<{ f: number }> = ({ f }) => {
  const nOut = Math.floor(seg(f, 10, 80) * 6);
  return (
    <Frame f={f} seed={446} caption="鋳型で量産">
      <CaminoBg f={f} />
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
  return (
    <Frame f={f} seed={447} caption="行ってきた証拠">
      <CaminoBg f={f} />
      {/* 大きめの巡礼者 (帰路) */}
      <EuroPilgrim x={760} y={960} s={1.25} f={f} phase={20} face="smile" />
      {/* 胸のバッジ (光る) */}
      <g transform={`translate(${760} ${790 + bobOf(f, 20)})`}>
        <circle cx={0} cy={0} r={64} fill={KRP.yellow} opacity={glow * 0.45} />
        <g transform={`scale(${pop(seg(f, 10, 26)) * 0.52})`}>
          <ScallopShell x={0} y={0} metal />
        </g>
      </g>
      {/* 矢印で注目 */}
      <g transform={`translate(${1010 + Math.sin(f / 10) * 10} 760) rotate(200)`} opacity={clamp01(seg(f, 18, 30))}>
        <path d="M 0 0 L 74 0 M 52 -18 L 74 0 L 52 18" fill="none" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* 帰る先の家 (遠景) */}
      <g transform="translate(1600 700)" opacity={0.9}>
        <rect x={-90} y={-70} width={180} height={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -110 -70 L 0 -140 L 110 -70 Z" fill={TKP.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <TagPlate x={0} y={66} text="故郷へ" size={28} t={seg(f, 34, 48)} />
      </g>
      <path d="M 900 820 Q 1250 650 1540 700" fill="none" stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="4 22" opacity={0.55} pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - easeOut(seg(f, 30, 70)) }} />
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
    <CaminoBg f={f} />
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
const SceneTabiMiyageSet: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 8, 44));
  const tie = seg(f, 46, 64);
  return (
    <Frame f={f} seed={450} caption="旅とお土産はセット">
      <CaminoBg f={f} />
      {/* 2枚のカードが真ん中へ */}
      <g transform={`translate(${lerp(360, 760, t)} 560) rotate(${lerp(-8, -3, t)})`}>
        <rect x={-180} y={-130} width={360} height={260} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>旅</text>
        <path d="M -70 30 q 35 -40 70 0 q 35 40 70 0" fill="none" stroke={KRP.blue} strokeWidth={8} strokeLinecap="round" />
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
