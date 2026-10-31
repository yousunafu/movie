// 「旅とお土産の歴史」: ブロック5 = 第10章 + 結章 (脱酸素剤のからくり図解・締め)。
// 担当範囲: 台本 docs/tabi-miyage-script-v1.txt の 176〜205行目 (文#175〜#204・30文)。
// motif 名は必ず tb5_ で始める。WobbleDefs の seed はこのファイルでは 800〜899 を使う。
// このファイルを編集してよいのはブロック5担当だけ (共有部品は TabiShared/TabiKits/TabiTravel から import)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, TBadge, ChapterDoor } from "./TabiShared";
import {
  TKP, KashiBox, DatsusansoPack, MiyageShelf, GendaiBg, ModernTraveler, PaperBag, EdoTraveler,
} from "./TabiKits";
import { KoujitsuRoute } from "./TabiTravel";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Person と同じゆれ式 (かぶせ物・持ち物を同期させる)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== シーンの共通ガワ: クリーム紙地 + ゆらぎ + バッジ + 質感 =====
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

// ===== 小物キット (svg内) =====
// 木札風ラベル (中央寄せ)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string; fill?: string; stroke?: string;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white, stroke = KRP.ink }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={stroke} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ふきだし
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; tailTo?: [number, number];
  text?: string; size?: number; t?: number; color?: string;
}> = ({ x, y, w, h, tailTo, text, size = 38, t = 1, color = KRP.ink }) => {
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

// 赤いバツ
const CrossMark: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc * s})`} stroke={KRP.red} strokeWidth={16}
      strokeLinecap="round" opacity={0.9}>
      <line x1={-46} y1={-46} x2={46} y2={46} />
      <line x1={46} y1={-46} x2={-46} y2={46} />
    </g>
  );
};

// 緑のチェック丸
const CheckCircle: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc * s})`}>
      <circle r={30} fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -14 0 L -3 12 L 17 -12" fill="none" stroke={KRP.white} strokeWidth={7}
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// 酸素の粒 (O₂の小さい丸)
const O2Dot: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => {
  if (op <= 0 || s <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle r={24} fill={KRP.blueSoft} stroke={KRP.blueDeep} strokeWidth={4} />
      <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24}
        fill={KRP.blueDeep}>O₂</text>
    </g>
  );
};

// 鉄粉の粒 (rust: 0=鉄色 → 1=サビ色)
const GRAIN_PATH = "M -30 -16 L -8 -30 L 20 -24 L 32 -2 L 22 22 L -6 30 L -28 14 Z";
const IronGrain: React.FC<{ x: number; y: number; s?: number; rust?: number }> = ({ x, y, s = 1, rust = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={GRAIN_PATH} fill="#6E6A64" stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    {rust > 0 && (
      <path d={GRAIN_PATH} fill="#A9542E" opacity={clamp01(rust)} stroke={KRP.ink} strokeWidth={4}
        strokeLinejoin="round" />
    )}
    {rust >= 0.95 && (
      <g stroke={KRP.orange} strokeWidth={4} strokeLinecap="round">
        <line x1={-44} y1={-34} x2={-36} y2={-26} />
        <line x1={40} y1={-30} x2={48} y2={-38} />
      </g>
    )}
  </g>
);

// 酸素メーター (縦ゲージ)
const O2Meter: React.FC<{ x: number; y: number; level: number; h?: number }> = ({ x, y, level, h = 280 }) => {
  const lv = clamp01(level);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-50} y={-58} width={100} height={46} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
        fill={KRP.ink}>酸素</text>
      <rect x={-34} y={0} width={68} height={h} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-26} y={8 + (h - 16) * (1 - lv)} width={52} height={(h - 16) * lv} rx={8} fill={KRP.blueSoft} />
      <text x={0} y={h + 46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32}
        fill={KRP.blueDeep}>{Math.round(lv * 100)}%</text>
    </g>
  );
};

// 生菓子 (萩の月風のドーム菓子)。stale: 0=ふわふわ → 1=傷んだ色
const CakeDome: React.FC<{ x: number; y: number; s?: number; stale?: number }> = ({ x, y, s = 1, stale = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={104} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -74 0 Q -74 -84 0 -84 Q 74 -84 74 0 Z" fill={KRP.yellow} opacity={0.95}
      stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -46 -54 Q -32 -68 -12 -70" fill="none" stroke={KRP.white} strokeWidth={6}
      strokeLinecap="round" opacity={0.85} />
    {stale > 0 && (
      <g opacity={clamp01(stale)}>
        <path d="M -74 0 Q -74 -84 0 -84 Q 74 -84 74 0 Z" fill={KRP.grayDark} opacity={0.5} />
        <circle cx={-26} cy={-40} r={9} fill={TKP.forestDark} opacity={0.85} />
        <circle cx={18} cy={-28} r={7} fill={TKP.forestDark} opacity={0.85} />
        <circle cx={-2} cy={-58} r={6} fill={TKP.forestDark} opacity={0.85} />
      </g>
    )}
  </g>
);

// 時計 (angle=分針の角度deg。短針は1/12で追従)
const Clock: React.FC<{ x: number; y: number; r?: number; angle: number }> = ({ x, y, r = 90, angle }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
    {[0, 1, 2, 3].map((i) => {
      const a = (i * Math.PI) / 2;
      return (
        <line key={i} x1={Math.sin(a) * (r - 18)} y1={-Math.cos(a) * (r - 18)}
          x2={Math.sin(a) * (r - 6)} y2={-Math.cos(a) * (r - 6)} stroke={KRP.ink} strokeWidth={5} />
      );
    })}
    <line x1={0} y1={0} x2={Math.sin((angle * Math.PI) / 180) * (r * 0.62)}
      y2={-Math.cos((angle * Math.PI) / 180) * (r * 0.62)} stroke={KRP.ink} strokeWidth={6.5}
      strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(((angle / 12) * Math.PI) / 180) * (r * 0.4)}
      y2={-Math.cos(((angle / 12) * Math.PI) / 180) * (r * 0.4)} stroke={KRP.ink} strokeWidth={8}
      strokeLinecap="round" />
    <circle r={7} fill={KRP.ink} />
  </g>
);

// ハート
const Heart: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> =
  ({ x, y, s = 1, t = 1, color = KRP.red }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc * s})`}>
        <path d="M 0 14 C -4 4 -22 -8 -22 -20 C -22 -36 -2 -36 0 -22 C 2 -36 22 -36 22 -20 C 22 -8 4 4 0 14 Z"
          fill={color} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    );
  };

// 個包装のお菓子 (キャンディ包み型の小袋)
const MiniPacket: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-24} y={-16} width={48} height={32} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -24 6 L -33 0 L -24 -6 M 24 6 L 33 0 L 24 -6" fill="none" stroke={KRP.ink} strokeWidth={3}
      opacity={0.6} />
    <circle cx={0} cy={0} r={6} fill={KRP.orange} opacity={0.8} />
  </g>
);

// =====================================================================
// 第10章 (#175〜#192): 日持ちの課題 → 脱酸素剤 → 「配れるお土産」の完成
// =====================================================================

// #175 章扉: 箱と小袋のシルエット + 「？」(最後の課題)
const SceneCh10Door: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 2, 18));
  const t2 = pop(seg(f, 18, 34));
  const q = pop(seg(f, 34, 52));
  const bob = bobOf(f, 1);
  return (
    <Frame f={f} seed={800}
      over={<ChapterDoor num={11} title={"「配れるお土産」の完成"} t={seg(f, 8, 30)} />}>
      <g transform={`translate(470 ${610 + bob}) scale(${t1})`}>
        <KashiBox x={0} y={0} s={1.7} />
      </g>
      <g transform={`translate(740 ${740 + bob * 0.6}) scale(${t2})`}>
        <DatsusansoPack x={0} y={0} s={1.05} rot={10} />
      </g>
      {q > 0 && (
        <g transform={`translate(470 ${360 + bobOf(f, 3)}) scale(${q}) rotate(${Math.sin(f / 10) * 4})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130}
            fill={KRP.red}>？</text>
        </g>
      )}
    </Frame>
  );
};

// #176 「日持ち」の大札 + 生菓子 + 時計
const SceneHimochi: React.FC<{ f: number }> = ({ f }) => {
  const plate = pop(seg(f, 12, 28));
  const q = pop(seg(f, 34, 48));
  return (
    <Frame f={f} seed={801}>
      <CakeDome x={600} y={680 + bobOf(f)} s={1.5} />
      <Clock x={600} y={330} angle={f * 3} />
      {plate > 0 && (
        <g transform={`translate(1300 520) scale(${plate})`}>
          <rect x={-260} y={-95} width={520} height={190} rx={18} fill={KRP.white}
            stroke={KRP.red} strokeWidth={10} />
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92}
            fill={KRP.red}>日持ち</text>
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(1300 ${300 + bobOf(f, 5)}) scale(${q}) rotate(${Math.sin(f / 9) * 5})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100}
            fill={KRP.orange}>？</text>
        </g>
      )}
    </Frame>
  );
};

// #177 生菓子が傷む: 新鮮 → 時計が回る → 傷んだ色に
const SceneNamagashiItamu: React.FC<{ f: number }> = ({ f }) => {
  const stale = easeOut(seg(f, 42, 68));
  const arrow = pop(seg(f, 20, 36));
  return (
    <Frame f={f} seed={802}>
      {/* 新鮮なほう (キラキラ) */}
      <CakeDome x={460} y={660 + bobOf(f)} s={1.25} />
      {[[-80, -150], [70, -170], [0, -210]].map(([dx, dy], i) => (
        <g key={i} transform={`translate(${460 + dx} ${660 + dy})`}
          opacity={0.5 + 0.5 * Math.sin(f / 8 + i * 2)}>
          <path d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" fill={KRP.yellow}
            stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      ))}
      {/* 早回しの時計 */}
      <Clock x={940} y={400} r={80} angle={f * 16} />
      {arrow > 0 && (
        <g transform={`translate(940 650) scale(${arrow})`}>
          <line x1={-90} y1={0} x2={60} y2={0} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
          <polygon points="60,-20 100,0 60,20" fill={KRP.ink} />
        </g>
      )}
      {/* 傷んだほう */}
      <CakeDome x={1420} y={660} s={1.25} stale={stale} />
      {stale > 0.6 && (
        <g opacity={(stale - 0.6) * 2.2} stroke={TKP.forestDark} strokeWidth={5} fill="none"
          strokeLinecap="round">
          {[0, 1, 2].map((i) => (
            <path key={i}
              d={`M ${1360 + i * 56} ${540 - ((f * 1.3 + i * 22) % 50)} q 10 -16 0 -32 q -10 -16 0 -32`}
              opacity={0.6} />
          ))}
        </g>
      )}
    </Frame>
  );
};

// #178 遠くの職場まで配れない: 店 → 長い道 → 職場ビル。箱が途中で力尽きる
const SceneTooiShokuba: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 10, 55)) * 0.52; // 途中で止まる
  const bx = lerp(470, 1500, t);
  const by = 700 - Math.sin(t * Math.PI) * 70;
  const cross = pop(seg(f, 50, 64));
  return (
    <Frame f={f} seed={803}>
      {/* 店 (出発点) */}
      <rect x={240} y={580} width={220} height={260} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${244 + i * 54} 580 q 27 -40 54 0 Z`}
          fill={i % 2 === 0 ? KRP.red : KRP.white} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <KashiBox x={350} y={770} s={0.8} />
      {/* 点線の長い道 */}
      <path d="M 470 710 Q 760 600 980 690 Q 1220 780 1450 690" fill="none" stroke={KRP.ink}
        strokeWidth={7} strokeDasharray="22 20" opacity={0.55} />
      {/* 職場ビル */}
      <rect x={1460} y={380} width={280} height={460} rx={8} fill={TKP.stone} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={1492 + (i % 3) * 78} y={416 + Math.floor(i / 3) * 86} width={54} height={56}
          rx={5} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      <TagPlate x={1600} y={320} text="職場" size={36} t={seg(f, 4, 16)} />
      {/* 運ばれる箱 (途中で止まる) */}
      <g transform={`translate(${bx} ${by})`}>
        <KashiBox x={0} y={0} s={0.55} />
        {f > 46 && (
          <path d={`M 40 -60 q 8 ${10 + (f % 14)} 0 18`} fill="none" stroke={KRP.blueDeep}
            strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        )}
      </g>
      <CrossMark x={bx + 10} y={by - 10} t={cross} s={1.2} />
    </Frame>
  );
};

// #179 解決したのは誰? 旅行業界に✗、謎のカードがふるえる
const SceneKaiketsuDare: React.FC<{ f: number }> = ({ f }) => {
  const c1 = pop(seg(f, 8, 22));
  const c2 = pop(seg(f, 20, 34));
  const cross = pop(seg(f, 42, 56));
  return (
    <Frame f={f} seed={804}>
      <g transform={`translate(960 ${380 + bobOf(f, 2)}) rotate(${Math.sin(f / 9) * 5})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={210}
          fill={KRP.orange}>？</text>
      </g>
      {/* 旅行業界カード → ✗ */}
      {c1 > 0 && (
        <g transform={`translate(520 660) scale(${c1}) rotate(-3)`}>
          <rect x={-200} y={-80} width={400} height={160} rx={16} fill={KRP.white} stroke={KRP.ink}
            strokeWidth={6.5} />
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
            fill={KRP.ink}>旅行業界</text>
          <path d="M -60 -34 Q -60 -52 -28 -54 L 40 -54 Q 64 -50 70 -36 Q 62 -26 40 -26 L -28 -26 Q -60 -28 -60 -34 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -8 -40 L -40 -10 L -20 -10 L 8 -36 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      <CrossMark x={520} y={660} t={cross} s={1.5} />
      {/* 謎のカード */}
      {c2 > 0 && (
        <g transform={`translate(1400 660) scale(${c2}) rotate(${2 + Math.sin(f / 7) * 2.5})`}>
          <rect x={-200} y={-80} width={400} height={160} rx={16} fill={KRP.gray} opacity={0.9}
            stroke={KRP.ink} strokeWidth={6.5} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60}
            fill={KRP.ink}>？？？</text>
        </g>
      )}
    </Frame>
  );
};

// #180 1977年 化学メーカーが小さな袋を発売 (工場から袋がすべり出る)
const Scene1977Hatsubai: React.FC<{ f: number }> = ({ f }) => {
  const move = easeOut(seg(f, 20, 55));
  const px = lerp(880, 1300, move);
  const ps = lerp(0.8, 1.35, move);
  const q = pop(seg(f, 56, 70));
  return (
    <Frame f={f} seed={805}
      over={<Stamp x={1360} y={150} text="1977年" size={58} />}>
      {/* 工場 (のこぎり屋根 + 煙突) */}
      <rect x={280} y={430} width={540} height={390} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 280 430 L 370 350 L 370 430 L 460 350 L 460 430 L 550 350 L 550 430 Z"
        fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
      <rect x={700} y={300} width={48} height={130} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => {
        const yy = (f * 1.4 + i * 44) % 132;
        return (
          <circle key={i} cx={724 + Math.sin((f + i * 20) / 12) * 10} cy={280 - yy}
            r={16 + i * 4} fill={KRP.white} opacity={0.7 * (1 - yy / 132)} />
        );
      })}
      <rect x={370} y={560} width={360} height={90} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={550} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42}
        fill={KRP.ink}>化学メーカー</text>
      {/* 送り出し口 + すべり出る小袋 */}
      <rect x={810} y={660} width={80} height={70} rx={8} fill={KRP.ink} opacity={0.75} />
      <g transform={`translate(${px} ${700 - Math.sin(move * Math.PI) * 36})`}>
        <DatsusansoPack x={0} y={0} s={ps} rot={lerp(-10, 4, move)} />
        {move > 0.05 && move < 0.95 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
            <line x1={-130} y1={-26} x2={-90} y2={-24} />
            <line x1={-140} y1={6} x2={-96} y2={8} />
          </g>
        )}
      </g>
      {q > 0 && (
        <g transform={`translate(1300 ${440 + bobOf(f, 4)}) scale(${q})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
            fill={KRP.orange}>？</text>
        </g>
      )}
    </Frame>
  );
};

// #181 脱酸素剤「エージレス」: 主役ドーンと寄り + 名前札
const SceneAgeless: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(0.92, 1.1, easeOut(seg(f, 0, 70)));
  const packT = pop(seg(f, 6, 24));
  const plate = pop(seg(f, 26, 42));
  return (
    <Frame f={f} seed={806}>
      <g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
        <Burst x={960} y={560} r={330} t={seg(f, 10, 34)} n={14} />
        <g transform={`translate(960 ${580 + bobOf(f)}) scale(${packT})`}>
          <DatsusansoPack x={0} y={0} s={2.6} />
        </g>
        {[[620, 360], [1320, 400], [1260, 760]].map(([gx, gy], i) => (
          <g key={i} transform={`translate(${gx} ${gy})`}
            opacity={0.4 + 0.6 * Math.max(Math.sin(f / 7 + i * 2.2), 0)}>
            <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={KRP.yellow}
              stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {plate > 0 && (
        <g transform={`translate(960 230) scale(${plate})`}>
          <rect x={-280} y={-70} width={560} height={140} rx={16} fill={KRP.white} stroke={KRP.red}
            strokeWidth={9} />
          <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72}
            fill={KRP.red}>エージレス</text>
        </g>
      )}
    </Frame>
  );
};

// #182 使い捨てカイロとほぼ同じ: 並べて「≒」、どちらも窓の中は鉄の粉
const SceneKairoOnaji: React.FC<{ f: number }> = ({ f }) => {
  const c1 = pop(seg(f, 6, 20));
  const c2 = pop(seg(f, 18, 32));
  const eq = pop(seg(f, 36, 52));
  return (
    <Frame f={f} seed={807}>
      <TagPlate x={520} y={310} text="使い捨てカイロ" size={32} t={seg(f, 6, 18)} />
      <TagPlate x={1400} y={310} text="脱酸素剤" size={32} t={seg(f, 18, 30)} />
      {/* カイロ */}
      {c1 > 0 && (
        <g transform={`translate(520 ${600 + bobOf(f)}) scale(${c1})`}>
          <rect x={-115} y={-80} width={230} height={160} rx={26} fill={KRP.cream} stroke={KRP.ink}
            strokeWidth={6.5} />
          <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38}
            fill={KRP.ink}>カイロ</text>
          <circle cx={0} cy={42} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <IronGrain x={-14} y={30} s={0.42} />
          <IronGrain x={16} y={52} s={0.36} />
          {[0, 1, 2].map((i) => (
            <path key={i}
              d={`M ${-50 + i * 50} ${-110 - ((f * 1.2 + i * 16) % 36)} q 9 -13 0 -26 q -9 -13 0 -26`}
              fill="none" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" opacity={0.65} />
          ))}
        </g>
      )}
      {/* 脱酸素剤 */}
      {c2 > 0 && (
        <g transform={`translate(1400 ${600 + bobOf(f, 2)}) scale(${c2})`}>
          <DatsusansoPack x={0} y={-20} s={1.7} />
          <circle cx={0} cy={94} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <IronGrain x={-14} y={82} s={0.42} />
          <IronGrain x={16} y={104} s={0.36} />
        </g>
      )}
      {eq > 0 && (
        <g transform={`translate(960 600) scale(${eq})`}>
          <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150}
            fill={KRP.orange}>≒</text>
        </g>
      )}
      <TagPlate x={960} y={420} text="中身は鉄の粉" size={34} t={seg(f, 52, 66)} />
    </Frame>
  );
};

// #183 からくり図解①: 虫めがねの中で鉄粉が酸素をパクッと食べてサビ色に (コマ送り)
const SceneTetsuSabi: React.FC<{ f: number }> = ({ f }) => {
  const mag = pop(seg(f, 4, 22));
  const grains = [
    { gx: -120, gy: -70, st: 10 },
    { gx: 100, gy: -115, st: 46 },
    { gx: -15, gy: 115, st: 82 },
  ];
  return (
    <Frame f={f} seed={808}>
      {/* もとの小袋 */}
      <DatsusansoPack x={360} y={700} s={1.3} />
      <TagPlate x={360} y={480} text="袋の中" size={28} t={seg(f, 2, 14)} />
      <line x1={430} y1={650} x2={830} y2={540} stroke={KRP.ink} strokeWidth={5}
        strokeDasharray="14 12" opacity={0.6} />
      {/* 虫めがね */}
      {mag > 0 && (
        <g transform={`translate(1130 520) scale(${mag})`}>
          <circle r={310} fill={KRP.white} stroke={KRP.ink} strokeWidth={14} />
          <clipPath id="tb5magclip"><circle r={296} /></clipPath>
          <g clipPath="url(#tb5magclip)">
            <circle r={296} fill={KRP.cream} />
            {grains.map(({ gx, gy, st }, i) => {
              // コマ送り: 8フレームごとに1歩ずつ近づく → くっつく → サビ色に
              const steps = Math.min(Math.max(Math.floor((f - st) / 8), 0), 5);
              const p = steps / 5;
              const rust = seg(f, st + 40, st + 52);
              const o2x = lerp(gx + 210, gx + 42, p);
              const o2y = lerp(gy + 70, gy + 4, p);
              const paku = pop(seg(f, st + 40, st + 50)) * (1 - seg(f, st + 66, st + 76));
              return (
                <g key={i}>
                  <IronGrain x={gx} y={gy} s={1.7} rust={rust} />
                  <O2Dot x={o2x} y={o2y} s={1.1 - 0.5 * rust} op={1 - seg(f, st + 44, st + 52)} />
                  {paku > 0 && (
                    <text x={gx + 60} y={gy - 54} textAnchor="middle" fontFamily={FONT}
                      fontWeight={900} fontSize={40} fill={KRP.orange} opacity={paku}
                      transform={`scale(${paku}) translate(${(gx + 60) * (1 / paku - 1)} ${(gy - 54) * (1 / paku - 1)})`}>
                      パクッ
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          <line x1={222} y1={222} x2={336} y2={336} stroke={KRP.ink} strokeWidth={30}
            strokeLinecap="round" />
        </g>
      )}
      <TagPlate x={880} y={160} text="鉄の粉" size={30} t={seg(f, 24, 36)} fill="#E4E0D8" />
      <TagPlate x={1400} y={160} text="酸素" size={30} t={seg(f, 32, 44)} color={KRP.blueDeep} />
    </Frame>
  );
};

// #184 からくり図解②: 密封した箱の断面。酸素の粒が小袋に吸い込まれ、メーターが減る
const HAKO_O2: [number, number][] = [
  [640, 500], [780, 470], [920, 520], [1060, 470], [1180, 540], [700, 600], [980, 610],
];
const SceneHakoDanmen: React.FC<{ f: number }> = ({ f }) => {
  const eaten = HAKO_O2.filter((_, i) => f > 16 + i * 12 + 16).length;
  const paku = HAKO_O2.some((_, i) => f >= 16 + i * 12 + 10 && f <= 16 + i * 12 + 22);
  return (
    <Frame f={f} seed={809}>
      {/* 箱の断面 */}
      <rect x={480} y={380} width={960} height={420} rx={14} fill={KRP.yellow} opacity={0.92}
        stroke={KRP.ink} strokeWidth={8} />
      <rect x={520} y={420} width={880} height={340} rx={10} fill={KRP.cream} stroke={KRP.ink}
        strokeWidth={5.5} />
      {/* 密封テープ */}
      <rect x={668} y={362} width={110} height={36} rx={6} fill={KRP.gray} opacity={0.85}
        stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-3 723 380)" />
      <rect x={1150} y={362} width={110} height={36} rx={6} fill={KRP.gray} opacity={0.85}
        stroke={KRP.ink} strokeWidth={3.5} transform="rotate(2 1205 380)" />
      <TagPlate x={960} y={300} text="密封した箱の断面" size={32} t={seg(f, 2, 14)} />
      {/* 中身: 生菓子3つ + 脱酸素剤の小袋 */}
      <CakeDome x={660} y={730} s={0.62} />
      <CakeDome x={860} y={730} s={0.62} />
      <CakeDome x={1060} y={730} s={0.62} />
      <g transform={`translate(0 ${paku ? Math.sin(f * 1.6) * 3 : 0})`}>
        <DatsusansoPack x={1300} y={716} s={0.75} rot={-4} />
      </g>
      {/* 酸素の粒: ふわふわ → 順に小袋へ吸い込まれる */}
      {HAKO_O2.map(([ox, oy], i) => {
        const st = 16 + i * 12;
        const mt = seg(f, st, st + 16);
        if (mt >= 1) return null;
        const x = lerp(ox, 1296, easeOut(mt));
        const y = lerp(oy + Math.sin((f + i * 23) / 11) * 7, 690, easeOut(mt));
        return <O2Dot key={i} x={x} y={y} s={1 - 0.6 * mt} />;
      })}
      {paku && (
        <text x={1250} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38}
          fill={KRP.orange}>パク</text>
      )}
      {/* 酸素メーター */}
      <O2Meter x={1620} y={420} h={260} level={1 - eaten / HAKO_O2.length} />
    </Frame>
  );
};

// #185 酸素がなければカビも菌も育たない: しおれるカビ・菌 + 空のメーター
const SceneKabiSodatanai: React.FC<{ f: number }> = ({ f }) => {
  const droop = easeOut(seg(f, 20, 55));
  const cross = pop(seg(f, 50, 64));
  const shield = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <Frame f={f} seed={810}>
      {/* まもられる生菓子 */}
      <circle cx={960} cy={600} r={215} fill="none" stroke={KRP.green} strokeWidth={9}
        strokeDasharray="30 18" opacity={0.5 + 0.3 * shield} />
      <CakeDome x={960} y={680 + bobOf(f)} s={1.35} />
      <CheckCircle x={1120} y={450} t={seg(f, 58, 70)} />
      {/* カビくん (しおれる) */}
      <TagPlate x={400} y={300} text="カビ" size={30} t={seg(f, 4, 16)} />
      <g transform={`translate(400 560) rotate(${droop * 24})`} opacity={1 - droop * 0.6}>
        <circle r={70} fill={TKP.forest} stroke={KRP.ink} strokeWidth={5.5} />
        {[[-52, -46], [50, -50], [0, -74], [-64, 24], [62, 20]].map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r={22} fill={TKP.forest} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <line x1={-24} y1={-12} x2={-8} y2={-6} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={8} y1={-6} x2={24} y2={-12} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M -14 26 Q 0 16 14 26" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      </g>
      <CrossMark x={400} y={560} t={cross} s={1.3} />
      {/* 菌くん (しおれる) */}
      <TagPlate x={1510} y={300} text="菌" size={30} t={seg(f, 10, 22)} />
      <g transform={`translate(1510 560) rotate(${-droop * 24})`} opacity={1 - droop * 0.6}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line key={i} x1={Math.cos(a) * 58} y1={Math.sin(a) * 58} x2={Math.cos(a) * 86}
              y2={Math.sin(a) * 86} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          );
        })}
        <circle r={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={-26} y1={-14} x2={-10} y2={-8} stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={10} y1={-8} x2={26} y2={-14} stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M -12 24 Q 0 14 12 24" fill="none" stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" />
      </g>
      <CrossMark x={1510} y={560} t={cross} s={1.3} />
      {/* 空っぽの酸素メーター */}
      <O2Meter x={1760} y={430} h={230} level={Math.max(0, 1 - seg(f, 0, 30))} />
    </Frame>
  );
};

// #186 1979年の萩の月がいち早く採用: 小袋が箱に飛び込む
const SceneHaginotsuki: React.FC<{ f: number }> = ({ f }) => {
  const fly = easeOut(seg(f, 18, 48));
  const px = lerp(1450, 880, fly);
  const py = lerp(330, 560, fly) - Math.sin(fly * Math.PI) * 130;
  const glow = seg(f, 48, 62);
  return (
    <Frame f={f} seed={811}
      over={<Stamp x={300} y={140} text="1979年" size={56} />}>
      <TagPlate x={840} y={300} text="仙台銘菓 萩の月" size={46} t={seg(f, 4, 18)} color={KRP.red} />
      {/* 月をしのばせる (仙台銘菓の空気) */}
      <circle cx={1650} cy={690} r={62} fill={KRP.yellow} opacity={0.75} stroke={KRP.ink} strokeWidth={5} />
      <KashiBox x={840} y={660 + bobOf(f)} s={1.6} label="銘菓" />
      {glow > 0 && (
        <circle cx={840} cy={640} r={240} fill="none" stroke={KRP.yellow} strokeWidth={10}
          opacity={glow * (0.5 + 0.4 * Math.sin(f / 5))} />
      )}
      {/* いち早く飛び込む小袋 */}
      {fly < 1 ? (
        <g transform={`translate(${px} ${py}) rotate(${lerp(14, -6, fly)})`}>
          <DatsusansoPack x={0} y={0} s={0.85} />
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
            <line x1={70} y1={-40} x2={120} y2={-58} />
            <line x1={84} y1={-6} x2={136} y2={-16} />
          </g>
        </g>
      ) : (
        <Burst x={880} y={560} r={90} t={seg(f, 48, 60)} />
      )}
      <CheckCircle x={1040} y={480} t={seg(f, 52, 62)} />
    </Frame>
  );
};

// #187 賞味期限 約1日 → 約2週間: カレンダーがビヨーンと伸びる
const SceneCalendarNobiru: React.FC<{ f: number }> = ({ f }) => {
  const sx = lerp(0.085, 1, pop(seg(f, 20, 50)));
  const biyon = seg(f, 20, 55);
  const after = pop(seg(f, 46, 58));
  return (
    <Frame f={f} seed={812}>
      <TagPlate x={430} y={300} text="約1日" size={44} t={seg(f, 4, 16)} />
      <g transform={`translate(810 300) scale(${pop(seg(f, 16, 28))})`}>
        <line x1={-70} y1={0} x2={40} y2={0} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <polygon points="40,-17 74,0 40,17" fill={KRP.ink} />
      </g>
      {after > 0 && (
        <g transform={`translate(1330 300) scale(${after})`}>
          <rect x={-220} y={-62} width={440} height={124} rx={14} fill={KRP.white} stroke={KRP.red}
            strokeWidth={8} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60}
            fill={KRP.red}>約2週間</text>
        </g>
      )}
      {/* 伸びるカレンダー (左端を固定してビヨーン) */}
      <g transform={`translate(390 560) scale(${sx} 1)`}>
        <rect x={0} y={-120} width={1148} height={70} rx={10} fill={KRP.red} opacity={0.85}
          stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i}>
            <rect x={i * 82} y={-50} width={82} height={170} fill={i === 0 ? "#F6D7C8" : KRP.white}
              stroke={KRP.ink} strokeWidth={4.5} />
            <text x={i * 82 + 41} y={48} textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={38} fill={i === 13 ? KRP.red : KRP.ink}>{i + 1}</text>
          </g>
        ))}
      </g>
      {biyon > 0.1 && biyon < 0.95 && (
        <g transform={`translate(960 780) scale(${lerp(0.7, 1.5, biyon)} 1)`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
            fill={KRP.orange}>ビヨーン</text>
        </g>
      )}
      <TagPlate x={1620} y={770} text="※といわれる" size={24} t={seg(f, 52, 64)} color={KRP.grayDark} />
    </Frame>
  );
};

// #188 ふわふわの生菓子が遠くへ: トラックが町まで走る
const SceneFuwafuwaHakobu: React.FC<{ f: number }> = ({ f }) => {
  const tx = lerp(430, 1210, seg(f, 0, 150));
  const wheel = tx * 1.6;
  return (
    <Frame f={f} seed={813}>
      {/* 雲 */}
      {[[380, 220], [900, 160]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx + Math.sin(f / 60 + i) * 14} ${cy})`} opacity={0.8}>
          <ellipse rx={90} ry={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-50} cy={10} rx={46} ry={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 遠くの町 */}
      {[[1580, 180, 90], [1680, 260, 110], [1790, 150, 80]].map(([bx, bh, bw], i) => (
        <g key={i}>
          <rect x={bx} y={820 - bh} width={bw} height={bh} rx={6} fill={TKP.stone} stroke={KRP.ink}
            strokeWidth={5} />
          {[0, 1, 2].map((wi) => (
            <rect key={wi} x={bx + 14} y={836 - bh + wi * 44} width={bw - 28} height={22} rx={4}
              fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
        </g>
      ))}
      {/* 道路 */}
      <line x1={0} y1={820} x2={1920} y2={820} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={((i * 240 - f * 4) % 2160 + 2160) % 2160 - 120} y1={846}
          x2={((i * 240 - f * 4) % 2160 + 2160) % 2160 - 30} y2={846} stroke={KRP.ink} strokeWidth={5}
          opacity={0.4} />
      ))}
      {/* トラック (荷台に銘菓箱) */}
      <g transform={`translate(${tx} ${784 + Math.sin(f / 5) * 2})`}>
        <rect x={-190} y={-150} width={260} height={120} rx={10} fill={KRP.white} stroke={KRP.ink}
          strokeWidth={6.5} />
        <KashiBox x={-60} y={-86} s={0.62} />
        <path d="M 70 -30 L 70 -120 L 150 -120 L 196 -62 L 196 -30 Z" fill={KRP.blueSoft}
          stroke={KRP.ink} strokeWidth={6.5} />
        <rect x={92} y={-106} width={54} height={44} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[-120, 130].map((wx, i) => (
          <g key={i} transform={`translate(${wx} 0)`}>
            <circle r={34} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
            <line x1={0} y1={0} x2={Math.cos((wheel * Math.PI) / 180) * 22}
              y2={Math.sin((wheel * Math.PI) / 180) * 22} stroke={KRP.white} strokeWidth={5} />
          </g>
        ))}
        {/* ふわふわの湯気マーク */}
        {[0, 1].map((i) => (
          <path key={i}
            d={`M ${-110 + i * 90} ${-176 - ((f * 0.9 + i * 18) % 30)} q 9 -12 0 -24 q -9 -12 0 -24`}
            fill="none" stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        ))}
        <text x={-60} y={-196} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
          fill={KRP.orange}>ふわふわ</text>
      </g>
    </Frame>
  );
};

// #189 お土産の中心が食べ物へ: 天秤が「たべもの」側へ傾く
const SceneTabemonoChushin: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeOut(seg(f, 30, 72)) * -9;
  const t1 = pop(seg(f, 4, 18));
  return (
    <Frame f={f} seed={814} over={<Stamp x={1560} y={150} text="1970年代" size={40} />}>
      {/* 支柱 */}
      <rect x={940} y={620} width={40} height={260} rx={10} fill="#8A6A48" stroke={KRP.ink} strokeWidth={6} />
      <path d="M 860 880 L 1060 880 L 1030 840 L 890 840 Z" fill="#8A6A48" stroke={KRP.ink} strokeWidth={6} />
      {/* 腕 + 皿 (傾く) */}
      <g transform={`rotate(${tilt} 960 620)`}>
        <rect x={420} y={604} width={1080} height={28} rx={14} fill="#B08A5E" stroke={KRP.ink} strokeWidth={6} />
        {/* 左皿: おきもの (上がる) */}
        <g transform="translate(520 618)">
          <line x1={-80} y1={0} x2={-30} y2={120} stroke={KRP.ink} strokeWidth={5} />
          <line x1={80} y1={0} x2={30} y2={120} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -110 120 Q 0 176 110 120 Z" fill="#D8CBB6" stroke={KRP.ink} strokeWidth={6} />
          {t1 > 0 && (
            <g transform={`scale(${t1})`}>
              {/* こけし */}
              <g transform="translate(-44 118)">
                <rect x={-24} y={-96} width={48} height={96} rx={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={0} cy={-114} r={26} fill="#F6E3C9" stroke={KRP.ink} strokeWidth={5} />
                <circle cx={-8} cy={-118} r={3} fill={KRP.ink} />
                <circle cx={8} cy={-118} r={3} fill={KRP.ink} />
              </g>
              {/* ペナント */}
              <g transform="translate(52 118)">
                <line x1={-6} y1={0} x2={-6} y2={-120} stroke={KRP.ink} strokeWidth={5} />
                <path d="M -6 -120 L 86 -96 L -6 -68 Z" fill="#9FBEDC" stroke={KRP.ink} strokeWidth={5} />
              </g>
            </g>
          )}
        </g>
        {/* 右皿: たべもの (下がる) */}
        <g transform="translate(1400 618)">
          <line x1={-80} y1={0} x2={-30} y2={120} stroke={KRP.ink} strokeWidth={5} />
          <line x1={80} y1={0} x2={30} y2={120} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -110 120 Q 0 176 110 120 Z" fill="#D8CBB6" stroke={KRP.ink} strokeWidth={6} />
          {t1 > 0 && (
            <g transform={`scale(${t1})`}>
              <KashiBox x={-50} y={118} s={0.52} />
              <KashiBox x={56} y={118} s={0.52} />
              {/* まんじゅう */}
              <ellipse cx={4} cy={6} rx={34} ry={24} fill="#C89B6A" stroke={KRP.ink} strokeWidth={5} />
            </g>
          )}
        </g>
      </g>
      <TagPlate x={430} y={330} text="おきもの" size={32} t={seg(f, 14, 26)} />
      <TagPlate x={1490} y={330} text="たべもの" size={36} t={seg(f, 26, 38)} stroke={KRP.red} color={KRP.red} />
    </Frame>
  );
};

// #190 職場でひと箱を配る: デスクの同僚へ個包装が飛んでいく
const SceneShokubaKubari: React.FC<{ f: number }> = ({ f }) => {
  const give = pop(seg(f, 4, 18));
  return (
    <Frame f={f} seed={815}>
      {/* 壁 + 窓 */}
      <rect x={0} y={0} width={W} height={760} fill="#F3EBDD" />
      {[260, 760, 1260].map((wx, i) => (
        <rect key={i} x={wx} y={140} width={300} height={200} rx={10} fill="#DCE9F2"
          stroke={KRP.ink} strokeWidth={6} />
      ))}
      <rect x={0} y={760} width={W} height={320} fill={KRP.floor} />
      {/* デスク */}
      <rect x={1000} y={720} width={800} height={44} rx={10} fill="#B08A5E" stroke={KRP.ink} strokeWidth={6} />
      {[1090, 1370, 1650].map((dx, i) => (
        <g key={i} transform={`translate(${dx} 720)`}>
          <path d="M -52 0 L -40 -46 L 40 -46 L 52 0 Z" fill="#8E9AA6" stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 同僚3人 */}
      <Person x={1100} y={860} s={0.8} f={f} phase={1} face="smile" gaze={[-6, 0]} cloth="#7FA3C4" />
      <Person x={1380} y={860} s={0.8} f={f} phase={2} face="smile" gaze={[-6, 0]} cloth="#C4927F" />
      <Person x={1660} y={860} s={0.8} f={f} phase={3} face="normal" gaze={[-6, 0]} cloth="#8FAE8A" />
      {/* 配る人 + 開いた箱 */}
      <Person x={560} y={870} s={1.0} f={f} phase={0} face="smile" gaze={[6, 0]} lean={4} />
      {give > 0 && (
        <g transform={`translate(720 700) scale(${give})`}>
          <KashiBox x={0} y={40} s={0.8} open />
        </g>
      )}
      {/* 個包装が飛ぶ (同僚の頭の少し上へ届く) */}
      {[0, 1, 2].map((i) => {
        const t = seg(f, 26 + i * 14, 62 + i * 14);
        if (t <= 0) return null;
        const tx = lerp(770, 1090 + i * 280, t);
        const ty = lerp(650, 560, t) - Math.sin(t * Math.PI) * 170;
        return <MiniPacket key={i} x={tx} y={ty} s={0.9} rot={t * 300} />;
      })}
      <TagPlate x={1400} y={250} text="職場" size={36} t={seg(f, 8, 20)} />
    </Frame>
  );
};

// #191 職場配りは意外と最近: 年表の右端に旗が立つ
const SceneIgaiToSaikin: React.FC<{ f: number }> = ({ f }) => {
  const line = easeOut(seg(f, 6, 40));
  const flag = pop(seg(f, 40, 56));
  const cross = pop(seg(f, 50, 62));
  return (
    <Frame f={f} seed={816}>
      {/* 年表の線 */}
      <line x1={260} y1={620} x2={260 + 1400 * line} y2={620} stroke={KRP.ink} strokeWidth={9}
        strokeLinecap="round" />
      {line > 0.98 && (
        <path d="M 1660 620 L 1616 598 L 1616 642 Z" fill={KRP.ink} />
      )}
      {[
        { x: 380, label: "千年前" },
        { x: 900, label: "江戸" },
        { x: 1430, label: "1970年代" },
      ].map(({ x, label }, i) => {
        const t = seg(f, 10 + i * 10, 24 + i * 10);
        if (t <= 0) return null;
        return (
          <g key={i} opacity={t}>
            <circle cx={x} cy={620} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <TagPlate x={x} y={700} text={label} size={28} t={t} />
          </g>
        );
      })}
      {/* 旗: 職場配り */}
      {flag > 0 && (
        <g transform={`translate(1500 620) scale(${flag})`}>
          <line x1={0} y1={0} x2={0} y2={-190} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 0 -200 L 210 -160 L 0 -112 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <text x={76} y={-148} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28}
            fill={KRP.white}>職場配り</text>
          <Burst x={0} y={-200} r={120} t={seg(f, 44, 60)} />
        </g>
      )}
      {/* 古来の伝統？ → ✗ */}
      <TagPlate x={480} y={330} text="古来の伝統？" size={36} t={seg(f, 24, 36)} />
      {cross > 0 && <CrossMark x={480} y={330} s={1.1} t={cross} />}
      <TagPlate x={1280} y={330} text="※とされる" size={24} t={seg(f, 46, 58)} fill="#EDE6D8" />
    </Frame>
  );
};

// #192 箱＋脱酸素剤＝「配れるお土産」の完成 (紙吹雪)
const SceneKansei: React.FC<{ f: number }> = ({ f }) => {
  const a = pop(seg(f, 4, 18));
  const b = pop(seg(f, 18, 32));
  const c = pop(seg(f, 36, 52));
  const conf = seg(f, 50, 150);
  return (
    <Frame f={f} seed={817} over={<Stamp x={1620} y={160} text="完成" size={52} />}>
      {a > 0 && (
        <g transform={`translate(400 ${640 + bobOf(f)}) scale(${a})`}>
          <KashiBox x={0} y={0} s={1.0} open />
          <MiniPacket x={-60} y={-160} s={1.0} rot={-14} />
          <MiniPacket x={40} y={-176} s={1.0} rot={10} />
        </g>
      )}
      <text x={660} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
        fill={KRP.ink} opacity={seg(f, 14, 24)}>＋</text>
      {b > 0 && (
        <g transform={`translate(880 ${590 + bobOf(f, 2)}) scale(${b})`}>
          <DatsusansoPack x={0} y={0} s={1.5} />
        </g>
      )}
      <text x={1120} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
        fill={KRP.ink} opacity={seg(f, 30, 40)}>＝</text>
      {c > 0 && (
        <g transform={`translate(1480 590) scale(${c})`}>
          <Burst x={0} y={0} r={300} t={seg(f, 40, 58)} />
          <rect x={-230} y={-75} width={460} height={150} rx={18} fill={KRP.white} stroke={KRP.red}
            strokeWidth={9} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56}
            fill={KRP.red}>配れるお土産</text>
        </g>
      )}
      {/* 紙吹雪 */}
      {conf > 0 && [...Array(10)].map((_, i) => {
        const cx = 300 + (i * 149) % 1320;
        const cy = ((f * (2.2 + (i % 3) * 0.8) + i * 97) % 500) + 120;
        const col = [KRP.red, KRP.orange, "#7FA3C4", "#8FAE8A"][i % 4];
        return (
          <rect key={i} x={cx} y={cy} width={20} height={13} rx={3} fill={col} opacity={0.8 * conf}
            transform={`rotate(${f * 6 + i * 40} ${cx + 10} ${cy + 6})`} />
        );
      })}
    </Frame>
  );
};

// =====================================================================
// 結章 (#193〜#204): 千年のからくり → 現代 → お土産＝報告書 → 締め
// =====================================================================

// #193 結章扉: 口実ルートの地図 + 題字「千年のからくり」
const SceneKesshoDoor: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={818}
    over={<ChapterDoor num={0} title="千年のからくり" t={seg(f, 8, 30)} left={1080} top={600} width={760} />}>
    <KoujitsuRoute x={560} y={400} s={0.72} f={f} count={4} />
  </Frame>
);

// #194 ほんとうは遊びに行きたい: まんなかの人の本音ふきだし + 横目の視線
const SceneAsobitai: React.FC<{ f: number }> = ({ f }) => {
  const b = seg(f, 20, 36);
  return (
    <Frame f={f} seed={819}>
      <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      <Person x={520} y={880} s={0.95} f={f} phase={1} face="normal" gaze={[6, 0]} cloth="#8FAE8A" />
      <Person x={1400} y={880} s={0.95} f={f} phase={2} face="normal" gaze={[-6, 0]} cloth="#C4927F" />
      <Person x={900} y={880} s={1.15} f={f} phase={0} face="worried" gaze={[-6, 0]} />
      <Bubble x={900} y={330} w={560} h={170} tailTo={[900, 560]} text="遊びたい…" size={62} t={b} />
      {/* 汗 + チラッ */}
      {seg(f, 44, 56) > 0 && (
        <g opacity={seg(f, 44, 56)}>
          <path d="M 986 600 q 12 18 0 32 q -12 14 -22 2" fill="none" stroke={KRP.blueDeep}
            strokeWidth={5} strokeLinecap="round" />
          <text x={1120} y={660} fontFamily={FONT} fontWeight={900} fontSize={34}
            fill={KRP.grayDark}>チラッ</text>
        </g>
      )}
    </Frame>
  );
};

// ループ図 (3つの札を回る矢印)。#195/#196で使う
const LoopDiagram: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const R = 270;
  const nodes = [
    { a: -90, text: "遊びたい", fill: KRP.yellow },
    { a: 30, text: "口実を発明", fill: KRP.blueSoft },
    { a: 150, text: "お土産＝言い訳", fill: "#F2B8C6" },
  ];
  const pt = (deg: number, r = R) => {
    const rad = (deg * Math.PI) / 180;
    return [Math.cos(rad) * r, Math.sin(rad) * r] as const;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 回る矢印 (時計回り・破線が行進) */}
      {nodes.map((n, i) => {
        const a1 = n.a + 28;
        const a2 = nodes[(i + 1) % 3].a - 28;
        const [x1, y1] = pt(a1);
        const [x2, y2] = pt(a2);
        const t = seg(f, 30 + i * 8, 46 + i * 8);
        if (t <= 0) return null;
        const [hx, hy] = pt(a2 + 4);
        return (
          <g key={i} opacity={t}>
            <path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke={KRP.orange}
              strokeWidth={10} strokeLinecap="round" strokeDasharray="26 20"
              strokeDashoffset={-f * 2.4} />
            <path d={`M ${x2} ${y2} L ${hx - 30} ${hy - 18} L ${hx - 8} ${hy + 26} Z`}
              fill={KRP.orange} transform={`rotate(${a2 + 100} ${x2} ${y2})`} />
          </g>
        );
      })}
      {/* 札 */}
      {nodes.map((n, i) => {
        const [nx, ny] = pt(n.a);
        const t = pop(seg(f, 6 + i * 10, 20 + i * 10));
        if (t <= 0) return null;
        const w = n.text.length * 40 + 56;
        return (
          <g key={i} transform={`translate(${nx} ${ny + bobOf(f, i)}) scale(${t})`}>
            <rect x={-w / 2} y={-44} width={w} height={88} rx={14} fill={n.fill}
              stroke={KRP.ink} strokeWidth={6} />
            <text x={0} y={15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
              fill={KRP.ink}>{n.text}</text>
          </g>
        );
      })}
    </g>
  );
};

// #195 遊びたい→口実→お土産のループ図
const SceneKoujitsuLoop: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={820}>
    <LoopDiagram x={960} y={560} f={f} />
  </Frame>
);

// #196 そのからくりは今も続く: ループ図 → 矢印 → 現代の旅行者
const SceneImaMoTsuzuku: React.FC<{ f: number }> = ({ f }) => {
  const ar = easeOut(seg(f, 36, 60));
  return (
    <Frame f={f} seed={821}>
      <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      <LoopDiagram x={480} y={560} s={0.62} f={Math.min(f, 200)} />
      {ar > 0 && (
        <g opacity={ar}>
          <line x1={810} y1={620} x2={810 + 290 * ar} y2={660} stroke={KRP.ink} strokeWidth={9}
            strokeDasharray="22 16" strokeLinecap="round" />
          {ar > 0.95 && <path d="M 1120 668 L 1072 640 L 1082 688 Z" fill={KRP.ink} />}
        </g>
      )}
      <ModernTraveler x={1330} y={870} s={1.0} f={f} phase={1} face="smile" gaze={[-6, 0]} />
      <TagPlate x={1330} y={280} text="現代" size={36} t={seg(f, 50, 62)} />
    </Frame>
  );
};

// #197 現代の口実3枚: ご褒美 / リフレッシュ / 推し活
const SceneGendaiFuda3: React.FC<{ f: number }> = ({ f }) => {
  const cards = [
    { x: 440, rot: -3, fill: KRP.yellow, text: "自分へのご褒美", st: 10 },
    { x: 960, rot: 2, fill: KRP.blueSoft, text: "リフレッシュ", st: 25 },
    { x: 1480, rot: -2, fill: "#F2B8C6", text: "推し活", st: 40 },
  ];
  return (
    <Frame f={f} seed={822}>
      {cards.map((c, i) => {
        const t = pop(seg(f, c.st, c.st + 14));
        if (t <= 0) return null;
        const sway = Math.sin((f + i * 23) / 15) * 1.6;
        return (
          <g key={i} transform={`translate(${c.x} ${560 + bobOf(f, i)}) rotate(${c.rot + sway}) scale(${t})`}>
            <rect x={-220} y={-75} width={440} height={150} rx={18} fill={c.fill}
              stroke={KRP.ink} strokeWidth={7} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={c.text.length > 6 ? 44 : 50} fill={KRP.ink}>{c.text}</text>
          </g>
        );
      })}
      {/* アイコン: プレゼント / 湯気カップ / ペンライト */}
      {pop(seg(f, 18, 32)) > 0 && (
        <g transform={`translate(440 ${380 + bobOf(f, 1)}) scale(${pop(seg(f, 18, 32))})`}>
          <rect x={-44} y={-36} width={88} height={72} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-10} y={-36} width={20} height={72} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -36 q -26 -30 -40 -10 q -8 14 18 12 M 0 -36 q 26 -30 40 -10 q 8 14 -18 12"
            fill="none" stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {pop(seg(f, 33, 47)) > 0 && (
        <g transform={`translate(960 ${390 + bobOf(f, 2)}) scale(${pop(seg(f, 33, 47))})`}>
          <path d="M -42 -20 L -34 36 L 34 36 L 42 -20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M 42 -10 q 26 6 0 26" fill="none" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((j) => (
            <path key={j} d={`M ${-14 + j * 28} ${-34 - ((f * 1.4 + j * 14) % 22)} q 8 -10 0 -20`}
              fill="none" stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      )}
      {pop(seg(f, 48, 62)) > 0 && (
        <g transform={`translate(1480 ${385 + bobOf(f, 3)}) scale(${pop(seg(f, 48, 62))}) rotate(${Math.sin(f / 9) * 14})`}>
          <rect x={-13} y={-6} width={26} height={54} rx={8} fill={KRP.ink} />
          <rect x={-17} y={-66} width={34} height={64} rx={14} fill={KRP.orange} opacity={0.9}
            stroke={KRP.ink} strokeWidth={4.5} />
          <Heart x={44} y={-58} s={0.9} t={seg(f, 56, 66)} />
        </g>
      )}
    </Frame>
  );
};

// #198 でも出かける理由になる: 現代の街 + ひらめき電球
const SceneDekakeruRiyu: React.FC<{ f: number }> = ({ f }) => {
  const bulb = pop(seg(f, 30, 46));
  return (
    <Frame f={f} seed={823}>
      <GendaiBg f={f} />
      <ModernTraveler x={820} y={860} s={1.05} f={f} phase={0} face="smile" gaze={[6, 0]} />
      {bulb > 0 && (
        <g transform={`translate(820 340) scale(${bulb})`}>
          <Burst x={0} y={0} r={110} t={seg(f, 36, 52)} color={KRP.yellow} />
          <circle r={50} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-16} y={44} width={32} height={22} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -12 10 q 12 -22 24 0" fill="none" stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      <TagPlate x={1430} y={300} text="出かける理由" size={36} t={seg(f, 50, 62)} />
    </Frame>
  );
};

// #199 ご先祖さまと同じ: むかし/いま を並べて大きな「＝」
const SceneGosenzoOnaji: React.FC<{ f: number }> = ({ f }) => {
  const eq = pop(seg(f, 44, 60));
  return (
    <Frame f={f} seed={824}>
      <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      <line x1={960} y1={210} x2={960} y2={860} stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="20 18" opacity={0.5} />
      <TagPlate x={520} y={260} text="むかし" size={36} t={seg(f, 4, 16)} />
      <TagPlate x={1400} y={260} text="いま" size={36} t={seg(f, 12, 24)} />
      <EdoTraveler x={520} y={880} s={1.0} f={f} phase={0} face="smile" />
      <ModernTraveler x={1400} y={880} s={1.0} f={f} phase={2} face="smile" gaze={[-6, 0]} />
      <PaperBag x={1270} y={830} s={0.65} />
      {eq > 0 && (
        <g transform={`translate(960 560) scale(${eq})`}>
          <Burst x={0} y={0} r={190} t={seg(f, 52, 68)} />
          <text x={0} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170}
            fill={KRP.red}>＝</text>
        </g>
      )}
    </Frame>
  );
};

// #200 お土産＝おいしい報告書: 箱と書類を「＝」でつなぐ
const SceneHoukokusho: React.FC<{ f: number }> = ({ f }) => {
  const a = pop(seg(f, 4, 18));
  const b = pop(seg(f, 22, 38));
  const stampT = seg(f, 55, 68);
  const thump = stampT > 0 ? lerp(1.8, 1, easeOut(stampT)) : 0;
  return (
    <Frame f={f} seed={825}>
      {a > 0 && (
        <g transform={`translate(540 ${640 + bobOf(f)}) rotate(${Math.sin(f / 11) * 2.5}) scale(${a})`}>
          <KashiBox x={0} y={0} s={1.4} />
        </g>
      )}
      <text x={930} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}
        fill={KRP.ink} opacity={seg(f, 16, 26)}>＝</text>
      {/* 報告書 */}
      {b > 0 && (
        <g transform={`translate(1310 560) scale(${b})`}>
          <rect x={-170} y={-230} width={340} height={460} rx={12} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={7} />
          <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52}
            fill={KRP.ink}>報告書</text>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={-120} y1={-80 + i * 52} x2={i === 4 ? 10 : 120} y2={-80 + i * 52}
              stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" opacity={0.55} />
          ))}
          {thump > 0 && (
            <g transform={`translate(92 150) scale(${thump}) rotate(-10)`}>
              <circle r={52} fill="none" stroke={KRP.red} strokeWidth={7} opacity={0.9} />
              <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52}
                fill={KRP.red} opacity={0.9}>旅</text>
            </g>
          )}
        </g>
      )}
    </Frame>
  );
};

// #201 おいしい報告を受けとる: 箱がすべって相手に届き、ハート
const SceneOishiiHoukoku: React.FC<{ f: number }> = ({ f }) => {
  const slide = easeOut(seg(f, 20, 55));
  const bx = lerp(800, 1180, slide);
  const by = 680 - Math.sin(slide * Math.PI) * 70;
  return (
    <Frame f={f} seed={826}>
      <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      {/* 窓 (受けとる側の背景) */}
      <rect x={1180} y={200} width={330} height={230} rx={12} fill="#DCE9F2"
        stroke={KRP.ink} strokeWidth={6} />
      <line x1={1345} y1={200} x2={1345} y2={430} stroke={KRP.ink} strokeWidth={5} />
      <Person x={640} y={880} s={1.0} f={f} phase={0} face="smile" gaze={[6, 0]} lean={5} />
      <Person x={1360} y={880} s={1.0} f={f} phase={2} face="smile" gaze={[-6, 0]} cloth="#C4927F" />
      <KashiBox x={bx} y={by} s={0.9} />
      <Heart x={1250} y={520 + bobOf(f, 1)} s={1.3} t={seg(f, 46, 56)} />
      <Heart x={1500} y={540 + bobOf(f, 3)} s={1.0} t={seg(f, 52, 62)} />
    </Frame>
  );
};

// #202/#203 売り場で頭数をかぞえる (proud: 今度は胸を張って)
const SceneUriba: React.FC<{ f: number; proud?: boolean }> = ({ f, proud }) => {
  const step = proud ? 7 : 10;
  const n = Math.min(Math.max(Math.floor((f - 12) / step), 0), 6);
  const cloudT = pop(seg(f, 6, 20));
  return (
    <Frame f={f} seed={proud ? 828 : 827}>
      <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      <MiyageShelf x={520} y={790} s={1.15} />
      <Person x={1180} y={880} s={1.05} f={f} phase={1} face={proud ? "smile" : "normal"}
        gaze={[-6, 0]} lean={proud ? -6 : 0} />
      <KashiBox x={1180} y={700} s={0.7} />
      {/* 考えごとの雲 + 頭数 */}
      {cloudT > 0 && (
        <g transform={`translate(1460 330) scale(${cloudT})`}>
          <circle cx={-210} cy={210} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-170} cy={160} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={0} rx={300} ry={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[...Array(6)].map((_, i) => {
            const vis = i < n;
            if (!vis) return null;
            const hx = -190 + (i % 3) * 140;
            const hy = -50 + Math.floor(i / 3) * 110;
            const p = pop(seg(f, 12 + i * step, 12 + i * step + 8));
            return (
              <g key={i} transform={`translate(${hx} ${hy}) scale(${p})`}>
                <circle r={30} fill="#F6E3C9" stroke={KRP.ink} strokeWidth={4.5} />
                <path d="M -30 -8 a 30 30 0 0 1 60 0 l 0 -14 a 30 22 0 0 0 -60 0 Z"
                  fill="#5A4632" stroke={KRP.ink} strokeWidth={3} />
                <circle cx={-10} cy={2} r={3} fill={KRP.ink} />
                <circle cx={10} cy={2} r={3} fill={KRP.ink} />
              </g>
            );
          })}
          <text x={200} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
            fill={KRP.orange}>{n}人</text>
        </g>
      )}
      {proud && n >= 6 && (
        <>
          <CheckCircle x={1720} y={580} s={1.3} t={seg(f, 48, 58)} />
          <Burst x={1180} y={560} r={180} t={seg(f, 50, 64)} />
        </>
      )}
      {!proud && <TagPlate x={430} y={300} text="伝統行事" size={36} t={seg(f, 40, 52)} stroke={KRP.red} color={KRP.red} />}
    </Frame>
  );
};

// #204 良い旅を: 夕空へ歩いていく後ろ姿 (余韻・文字なし)
const BackTraveler: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const leg = Math.sin(f / 7) * 14;
  const swing = Math.sin(f / 7 + 1.2) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 脚 (交互) */}
      <line x1={-14} y1={-86} x2={-14 + leg * 0.6} y2={0} stroke={KRP.ink} strokeWidth={13}
        strokeLinecap="round" />
      <line x1={14} y1={-86} x2={14 - leg * 0.6} y2={0} stroke={KRP.ink} strokeWidth={13}
        strokeLinecap="round" />
      {/* 胴 (後ろ姿) */}
      <path d="M -44 -90 Q -48 -196 0 -200 Q 48 -196 44 -90 Z" fill="#8FAE8A"
        stroke={KRP.ink} strokeWidth={6} />
      {/* 頭 (髪の後ろ) */}
      <circle cx={0} cy={-226} r={34} fill="#5A4632" stroke={KRP.ink} strokeWidth={5.5} />
      {/* 紙袋 (手に下げる) */}
      <g transform={`translate(96 ${-96 + swing * 0.4}) rotate(${swing})`}>
        <PaperBag x={0} y={60} s={0.62} />
      </g>
      <line x1={44} y1={-120} x2={88} y2={-78} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
    </g>
  );
};
const SceneYoiTabi: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 180));
  const s = lerp(1.15, 0.92, walk);
  const y = lerp(870, 812, walk);
  const sunPulse = 1 + Math.sin(f / 20) * 0.02;
  return (
    <Frame f={f} seed={829}>
      {/* 夕空 */}
      <rect x={0} y={0} width={W} height={800} fill="#F6D9A8" />
      <circle cx={430} cy={560} r={110 * sunPulse} fill={KRP.orange} opacity={0.9}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 地面 + 道 */}
      <rect x={0} y={780} width={W} height={300} fill={KRP.floor} />
      <path d="M 760 1080 L 1160 1080 L 1000 790 L 920 790 Z" fill="#CBB68E"
        stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {/* 小さな飛行機 + 航跡 */}
      <g transform={`translate(${1500 + f * 0.5} 170)`} opacity={0.85}>
        <path d="M 0 0 L -40 10 L -40 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <line x1={-46} y1={0} x2={-150} y2={6} stroke={KRP.white} strokeWidth={6}
          strokeLinecap="round" opacity={0.7} />
      </g>
      {/* 鳥 */}
      {[0, 1].map((i) => (
        <path key={i}
          d={`M ${1150 + i * 130} ${300 + i * 40 + bobOf(f, i) * 2} q 16 ${-12 - Math.sin(f / 6 + i) * 8} 32 0 q 16 ${-12 - Math.sin(f / 6 + i) * 8} 32 0`}
          fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.75} />
      ))}
      <BackTraveler x={960} y={y} s={s} f={f} />
    </Frame>
  );
};

// ===== motif名 → 絵 の対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  tb5_ch10_door: (f) => <SceneCh10Door f={f} />,
  tb5_himochi_kadai: (f) => <SceneHimochi f={f} />,
  tb5_namagashi_itamu: (f) => <SceneNamagashiItamu f={f} />,
  tb5_tooi_shokuba: (f) => <SceneTooiShokuba f={f} />,
  tb5_kaiketsu_dare: (f) => <SceneKaiketsuDare f={f} />,
  tb5_1977_hatsubai: (f) => <Scene1977Hatsubai f={f} />,
  tb5_ageless_toujou: (f) => <SceneAgeless f={f} />,
  tb5_kairo_onaji: (f) => <SceneKairoOnaji f={f} />,
  tb5_tetsu_sabi: (f) => <SceneTetsuSabi f={f} />,
  tb5_hako_danmen: (f) => <SceneHakoDanmen f={f} />,
  tb5_kabi_sodatanai: (f) => <SceneKabiSodatanai f={f} />,
  tb5_haginotsuki: (f) => <SceneHaginotsuki f={f} />,
  tb5_calendar_nobiru: (f) => <SceneCalendarNobiru f={f} />,
  tb5_fuwafuwa_hakobu: (f) => <SceneFuwafuwaHakobu f={f} />,
  tb5_tabemono_chushin: (f) => <SceneTabemonoChushin f={f} />,
  tb5_shokuba_kubari: (f) => <SceneShokubaKubari f={f} />,
  tb5_igai_to_saikin: (f) => <SceneIgaiToSaikin f={f} />,
  tb5_kansei: (f) => <SceneKansei f={f} />,
  tb5_kessho_door: (f) => <SceneKesshoDoor f={f} />,
  tb5_asobitai: (f) => <SceneAsobitai f={f} />,
  tb5_koujitsu_loop: (f) => <SceneKoujitsuLoop f={f} />,
  tb5_ima_mo_tsuzuku: (f) => <SceneImaMoTsuzuku f={f} />,
  tb5_gendai_fuda3: (f) => <SceneGendaiFuda3 f={f} />,
  tb5_dekakeru_riyu: (f) => <SceneDekakeruRiyu f={f} />,
  tb5_gosenzo_onaji: (f) => <SceneGosenzoOnaji f={f} />,
  tb5_houkokusho: (f) => <SceneHoukokusho f={f} />,
  tb5_oishii_houkoku: (f) => <SceneOishiiHoukoku f={f} />,
  tb5_uriba_kazoeru: (f) => <SceneUriba f={f} />,
  tb5_mune_hatte: (f) => <SceneUriba f={f} proud />,
  tb5_yoi_tabi: (f) => <SceneYoiTabi f={f} />,
};

export const tabiB5Scene = (motif: string, f: number): React.ReactElement | null => {
  const scene = SCENES[motif];
  return scene ? scene(f) : null;
};

// 文#175〜#204 に1対1で対応する motif 名の列 (長さは必ず30。再利用は同じ名前を繰り返す)
export const T_B5_MOTIFS: string[] = [
  "tb5_ch10_door",        // #175 第10章: ところが、最後にひとつ、大きな課題が残っていました
  "tb5_himochi_kadai",    // #176 それは「日持ち」です
  "tb5_namagashi_itamu",  // #177 おいしい生菓子は、すぐに傷んでしまう
  "tb5_tooi_shokuba",     // #178 遠くの職場までは持って帰れない
  "tb5_kaiketsu_dare",    // #179 この課題を解決したのは、誰だったと思いますか？
  "tb5_1977_hatsubai",    // #180 1977年、ある化学メーカーが、小さな袋を発売します
  "tb5_ageless_toujou",   // #181 脱酸素剤「エージレス」です
  "tb5_kairo_onaji",      // #182 仕組みは使い捨てカイロとほぼ同じで、中身は鉄の粉
  "tb5_tetsu_sabi",       // #183 鉄がサビるときに、まわりの酸素を食べてくれる
  "tb5_hako_danmen",      // #184 これをお菓子の箱に入れると、箱の中の酸素がなくなる
  "tb5_kabi_sodatanai",   // #185 酸素がなければ、カビも菌も育たない
  "tb5_haginotsuki",      // #186 1979年発売の仙台銘菓「萩の月」が、これをいち早く採用
  "tb5_calendar_nobiru",  // #187 賞味期限が約1日から約2週間に延びたといわれます
  "tb5_fuwafuwa_hakobu",  // #188 ふわふわの生菓子を、遠くまで運べるようになった
  "tb5_tabemono_chushin", // #189 1970年代、お土産の中心は置物から食べ物へ
  "tb5_shokuba_kubari",   // #190 ひと箱買えば、職場のみんなに配れる
  "tb5_igai_to_saikin",   // #191 職場へのお土産配りが定着したのは、意外と最近のこととされます
  "tb5_kansei",           // #192 こうして「配れるお土産」が完成しました
  "tb5_kessho_door",      // #193 結章: 千年のからくり
  "tb5_asobitai",         // #194 ほんとうは、遊びに行きたい
  "tb5_koujitsu_loop",    // #195 でもそのままでは言いにくいから、口実を発明する
  "tb5_ima_mo_tsuzuku",   // #196 そのからくりは、今も続いています
  "tb5_gendai_fuda3",     // #197 自分へのご褒美、リフレッシュ、推し活
  "tb5_dekakeru_riyu",    // #198 呼び方は変わっても、出かける理由であることは同じ
  "tb5_gosenzo_onaji",    // #199 私たちは、ご先祖さまと同じことをしている
  "tb5_houkokusho",       // #200 お土産は、旅のおいしい報告書
  "tb5_oishii_houkoku",   // #201 もらった人は、おいしい報告を受けとる
  "tb5_uriba_kazoeru",    // #202 売り場で頭数をかぞえるのは、千年続いた知恵
  "tb5_mune_hatte",       // #203 今度は胸を張ってかぞえてください
  "tb5_yoi_tabi",         // #204 良い旅を (余韻・締め)
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const T_B5_PREVIEW_FRAMES = Math.max(T_B5_MOTIFS.length, 1);
export const TabiB5Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(T_B5_MOTIFS.length - 1, 0));
  const motif = T_B5_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {tabiB5Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 175} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
