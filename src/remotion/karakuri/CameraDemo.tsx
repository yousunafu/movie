// カメラ演出のデモ (karakuri 作風の「技もりもり」実験)。本編パイプラインとは独立。
// お手本 (最高の老後) で確認した7つの技を1本に詰める:
// ①寄り ②画中変化 ③書き込み ④虫めがね ⑤アングル切替 ⑥横移動(パン) ⑦章扉の重ね
// ナレーションは public/audio/camerademo/ に合成済み。尺は camerademo-lines.json の実測から計算。

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT,
  WobbleDefs, Atmosphere, Badge, LabelPill, Stamp,
  Person, Coin, Jihanki, EveningSky, Ground, EndingCard,
  seg, pop, easeOut,
} from "./KarakuriScenes";
import LINES from "./camerademo-lines.json";

const W = 1920;
const H = 1080;
const FPS = 30;
const FONT = KARAKURI_FONT;
const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// 各行の後に足す「間」(秒)。演出が動く行は長めに取る
const PADS = [0.8, 0.8, 0.5, 1.2, 0.5, 1.6, 0.5, 1.6, 0.5, 1.5, 0.5, 1.5, 0.5, 2.0, 1.4, 1.6, 2.6];

// 行ごとの開始フレーム (累積)
const S: number[] = [];
let acc = 0;
LINES.forEach((l, i) => {
  S.push(acc);
  acc += Math.ceil((l.sec + (PADS[i] ?? 0.6)) * FPS);
});
export const DEMO_TOTAL_FRAMES = acc;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// ===== カメラ (世界座標 cx,cy を画面中央に、s 倍で寄る) =====
const Camera: React.FC<{ s: number; cx: number; cy: number; children: React.ReactNode }> = ({
  s, cx, cy, children,
}) => (
  <AbsoluteFill
    style={{
      transform: `translate(${960 - cx}px, ${540 - cy}px) scale(${s})`,
      transformOrigin: `${cx}px ${cy}px`,
    }}
  >
    {children}
  </AbsoluteFill>
);

// ===== 黒帯字幕 (karakuri 標準) =====
const DemoSubtitle: React.FC<{ text: string; opacity: number }> = ({ text, opacity }) => (
  <div
    style={{
      position: "absolute", bottom: 56, left: "50%", width: "max-content",
      transform: "translateX(-50%)", maxWidth: "86%", textAlign: "center", opacity,
    }}
  >
    <span
      style={{
        display: "inline", fontFamily: FONT, fontSize: 50, fontWeight: 800,
        color: "#FFFFFF", lineHeight: 1.6,
        backgroundColor: KRP.captionBg,
        boxShadow: `0 0 0 16px ${KRP.captionBg}`,
        boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone",
        borderRadius: 14,
      }}
    >
      {text}
    </span>
  </div>
);

// ===== 世界A: 夕方の街角 (正面の自販機) =====
// 自販機は translate(1060,204)。投入口の世界座標 ≈ (1377,282)、ランプ ≈ (1378,534)
const StreetWorld: React.FC<{ f: number; recap?: boolean }> = ({ f, recap }) => {
  const E5 = S[5]; // 画中変化イベント
  const E7 = S[7]; // 書き込みイベント
  // 硬貨の飛行 (手元 → 投入口)
  const fly = seg(f, E5, E5 + 18);
  const flyX = lerp(1120, 1377, easeOut(fly));
  const flyY = lerp(500, 282, easeOut(fly)) - Math.sin(fly * Math.PI) * 70;
  // 自販機の「ガコン」ゆれ
  const shakeOn = f >= E5 + 16 && f < E5 + 30 && !recap;
  const shake = shakeOn ? Math.sin(f * 2.2) * 4 : 0;
  // 赤い書き込み (じわっと描かれる)
  const draw = seg(f, E7, E7 + 28);
  const notePop = pop(seg(f, E7 + 24, E7 + 34));
  const checkPop = pop(seg(f, E7 + 34, E7 + 44));
  const inEvent = !recap && f >= S[3];
  return (
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={21} />
      <g filter="url(#wobble)">
        <EveningSky f={f} />
        <Ground y={840} />
        {/* 街灯 */}
        <line x1={300} y1={840} x2={300} y2={400} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        <circle cx={300} cy={380} r={36} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6}
          opacity={0.8 + 0.2 * Math.sin(f / 11)} />
        {/* 自販機 (画中変化のときだけ小さくゆれる) */}
        <g transform={`translate(${shake} 0)`}>
          <Jihanki x={1060} y={204} f={f} />
        </g>
        {/* 人物と手元の硬貨 */}
        <Person x={850} y={836} f={f} face="smile" gaze={[6, -2]} cloth="#4A6A8C" clothDark="#37506B" />
        {!recap && f < E5 && (
          <Coin cx={950} cy={560 + Math.sin(f / 14) * 8} r={26} text="500" textSize={18} />
        )}
        {/* 技② 画中変化: 硬貨が投入口へ飛ぶ → 投入口が光る → ガコン */}
        {inEvent && fly > 0 && fly < 1 && (
          <Coin cx={flyX} cy={flyY} r={24} text="500" textSize={16} rotate={fly * 540} />
        )}
        {!recap && f >= E5 + 16 && f < E5 + 34 && (
          <rect x={1358} y={252} width={40} height={64} rx={10} fill={KRP.yellow}
            opacity={0.5 + 0.4 * Math.sin(f * 1.6)} />
        )}
        {shakeOn && (
          <text x={1250} y={430} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}
            textAnchor="middle" opacity={0.9}>ガコン</text>
        )}
        {/* ランプの光 (画中変化後ずっと) */}
        {!recap && f >= E5 + 30 && (
          <circle cx={1378} cy={534} r={22} fill={KRP.green}
            opacity={0.25 + 0.3 * Math.max(Math.sin(f / 7), 0)} />
        )}
        {/* 技③ 書き込み: 投入口に赤い楕円がじわっと描かれる */}
        {!recap && f >= E7 && (
          <ellipse cx={1377} cy={284} rx={58} ry={74} fill="none" stroke={KRP.red} strokeWidth={7}
            pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - easeOut(draw))}
            transform="rotate(-8 1377 284)" />
        )}
        {!recap && notePop > 0 && (
          <g transform={`translate(1200 350) scale(${notePop}) translate(-1200 -350)`}>
            <rect x={1072} y={326} width={256} height={48} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <text x={1200} y={360} fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.red}
              textAnchor="middle">ここを見ている</text>
          </g>
        )}
        {!recap && checkPop > 0 && (
          <g transform={`translate(1460 250) scale(${checkPop}) translate(-1460 -250)`}>
            <circle cx={1460} cy={250} r={27} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 1447 250 L 1457 261 L 1475 239" fill="none" stroke={KRP.white} strokeWidth={6}
              strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  );
};

// ===== 技④ 虫めがね (画面座標のまる窓。中はふちのギザギザ拡大図) =====
const Magnifier: React.FC<{ f: number }> = ({ f }) => {
  // アングル切替のカット (S[11]) の直前にスッと消える
  if (f >= S[11] - 2) return null;
  const sc = pop(seg(f, S[8] + 8, S[8] + 22)) * (1 - seg(f, S[11] - 10, S[11] - 2));
  if (sc <= 0) return null;
  // ギザギザの目盛り (巨大コインの上端のふち)
  const ticks: React.ReactNode[] = [];
  for (let a = -24; a <= 24; a += 3) {
    const rad = (a * Math.PI) / 180;
    const x1 = 612 * Math.sin(rad), y1 = 560 - 612 * Math.cos(rad);
    const x2 = 650 * Math.sin(rad), y2 = 560 - 650 * Math.cos(rad);
    ticks.push(<line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={7} />);
  }
  return (
    <>
      <svg width={W} height={H} style={{ ...abs, pointerEvents: "none" }}>
        <line x1={955} y1={280} x2={1215} y2={360} stroke={KRP.ink} strokeWidth={5}
          strokeDasharray="14 12" opacity={0.75 * sc} />
        <g transform={`translate(1440 400) scale(${sc})`}>
          <circle r={246} fill={KRP.white} stroke={KRP.ink} strokeWidth={13} />
          <clipPath id="magclip"><circle r={233} /></clipPath>
          <g clipPath="url(#magclip)">
            <circle cx={0} cy={560} r={640} fill={KRP.gold} stroke={KRP.ink} strokeWidth={13} />
            <circle cx={0} cy={560} r={560} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
            {ticks}
            <text x={0} y={120} fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}
              textAnchor="middle" opacity={0.75}>500</text>
          </g>
          <line x1={176} y1={176} x2={300} y2={300} stroke={KRP.ink} strokeWidth={28} strokeLinecap="round" />
        </g>
      </svg>
      {sc > 0.9 && f >= S[9] && f < S[11] - 10 && (
        <LabelPill x={1440} y={672} text="ふちのギザギザまで見える" size={30} centerX />
      )}
    </>
  );
};

// ===== 世界B: 横からの断面 (幅3400の長い世界。カメラが横移動する) =====
const railY = (x: number) => 520 + (220 * (x - 640)) / 2120;
const CutawayWorld: React.FC<{ f: number }> = ({ f }) => {
  // 硬貨: 落下 (S11) → 転がり (S12〜S13) → OK箱へ
  const drop = easeOut(seg(f, S[11] + 10, S[11] + 26));
  const rollT = easeInOut(seg(f, S[12], S[14] - 10));
  const coinX = lerp(690, 2620, rollT);
  const coinY = f < S[12] ? lerp(250, railY(690) - 56, drop) : railY(coinX) - 56;
  const nearGate = Math.abs(coinX - 1700) < 140;
  const arrived = f >= S[14] - 10;
  return (
    <svg width={3400} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
      <WobbleDefs seed={33} />
      <rect x={0} y={0} width={3400} height={H} fill={KRP.paperCool} />
      <g filter="url(#wobble)">
        <rect x={0} y={870} width={3400} height={210} fill={KRP.floor} />
        <line x1={0} y1={870} x2={3400} y2={870} stroke={KRP.ink} strokeWidth={5} />
        {/* 自販機の側面 (断面) */}
        <rect x={240} y={150} width={520} height={700} rx={18} fill="#D3402E" stroke={KRP.ink} strokeWidth={9} />
        <rect x={286} y={196} width={428} height={608} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={316 + i * 130} y={222} width={100} height={130} rx={10}
            fill={[KRP.blue, KRP.orange, KRP.green][i]} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <line x1={296} y1={370} x2={704} y2={370} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
        {/* 投入の漏斗 */}
        <path d="M 630 210 L 740 210 L 706 300 L 664 300 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        {/* レール (機械の外まで続く長い道) */}
        <line x1={640} y1={520} x2={2760} y2={740} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={640} y1={542} x2={2760} y2={762} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
        {[1000, 1360, 2080, 2440].map((x) => (
          <line key={x} x1={x} y1={railY(x)} x2={x} y2={870} stroke={KRP.ink} strokeWidth={6} opacity={0.45} />
        ))}
        {/* センサーの門 */}
        <rect x={1640} y={330} width={120} height={360} rx={16} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} opacity={0.35} />
        <rect x={1640} y={330} width={120} height={64} rx={16} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1700} cy={310} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3}
          opacity={0.35 + 0.6 * Math.max(Math.sin(f / 6), 0)} />
        {nearGate && (
          <g opacity={0.5 + 0.4 * Math.sin(f / 3)}>
            <rect x={1668} y={394} width={64} height={300} fill={KRP.blue} />
            <circle cx={coinX} cy={coinY} r={78} fill="none" stroke={KRP.yellow} strokeWidth={10} />
          </g>
        )}
        {/* OK箱 */}
        <rect x={2720} y={690} width={170} height={110} rx={14} fill={KRP.green} stroke={KRP.ink} strokeWidth={7} opacity={0.9} />
        <text x={2805} y={760} fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink} textAnchor="middle">OK</text>
        {/* 硬貨 */}
        {!arrived ? (
          <g transform={`rotate(${(coinX - 690) * 1.1} ${coinX} ${coinY})`}>
            <Coin cx={coinX} cy={coinY} r={56} text="500" textSize={38} />
            <circle cx={coinX + 30} cy={coinY - 22} r={7} fill={KRP.ink} opacity={0.5} />
          </g>
        ) : (
          <g transform={`translate(0 ${Math.min((f - (S[14] - 10)) * 6, 60)})`} opacity={clamp(1 - (f - (S[14] - 10)) / 18, 0, 1)}>
            <Coin cx={2700} cy={railY(2700) - 56} r={56} text="500" textSize={38} />
          </g>
        )}
        {/* 動きの線 */}
        {rollT > 0.02 && rollT < 0.98 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.45}>
            <line x1={coinX - 130} y1={coinY - 24} x2={coinX - 90} y2={coinY - 20} />
            <line x1={coinX - 140} y1={coinY + 12} x2={coinX - 96} y2={coinY + 15} />
          </g>
        )}
      </g>
    </svg>
  );
};

// ===== 技⑦ 章扉の重ね =====
const ChapterOverlay: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, S[14] + 6, S[14] + 20);
  const sc = pop(seg(f, S[14] + 10, S[14] + 26));
  if (t <= 0) return null;
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(24, 19, 14, ${0.55 * t})` }} />
      <div
        style={{
          position: "absolute", left: "50%", top: 400,
          transform: `translateX(-50%) scale(${sc})`,
          background: "rgba(34,30,27,0.94)", border: `4px solid ${KRP.white}`,
          borderRadius: 18, padding: "34px 90px", textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 32, color: KRP.orange, letterSpacing: 6 }}>
          おまけの章
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, color: KRP.white, letterSpacing: 4, marginTop: 10 }}>
          カメラは自由に動ける
        </div>
      </div>
    </>
  );
};

// ===== まとめのピル (技7つが順に飛び出す) =====
const RECAP = ["① 寄り", "② 画中変化", "③ 書き込み", "④ 虫めがね", "⑤ アングル切替", "⑥ 横移動", "⑦ 章扉の重ね"];
const RecapPills: React.FC<{ f: number }> = ({ f }) => (
  <>
    {RECAP.map((t, i) => {
      const sc = pop(seg(f, S[15] + 22 + i * 5, S[15] + 34 + i * 5));
      if (sc <= 0) return null;
      const col = i < 4 ? 0 : 1;
      const x = col === 0 ? 120 : 470;
      const y = col === 0 ? 170 + i * 95 : 215 + (i - 4) * 95;
      return (
        <div key={i} style={{ transform: `scale(${sc})`, transformOrigin: `${x + 60}px ${y + 28}px`, position: "absolute", inset: 0 }}>
          <LabelPill x={x} y={y} text={t} size={32} color={i === 6 ? KRP.red : KRP.ink} />
        </div>
      );
    })}
  </>
);

// ===== 技の名前チップ (右上) =====
const TECH_AT: [number, string][] = [
  [2, "技① 寄り"], [4, "技② 画中変化"], [6, "技③ 書き込み"], [8, "技④ 虫めがね"],
  [10, "技⑤ アングル切替"], [12, "技⑥ 横移動"], [14, "技⑦ 章扉の重ね"],
];
const TechChip: React.FC<{ f: number }> = ({ f }) => {
  let label: string | null = null;
  for (const [idx, name] of TECH_AT) if (f >= S[idx]) label = name;
  if (!label || f >= S[15]) return null;
  return (
    <div
      style={{
        position: "absolute", top: 58, right: 60,
        background: KRP.white, color: KRP.ink, border: `3px solid ${KRP.ink}`,
        borderRadius: 8, fontFamily: FONT, fontWeight: 800, fontSize: 32,
        padding: "6px 20px", boxShadow: "3px 4px 0 rgba(59,51,44,0.25)",
      }}
    >
      {label}
    </div>
  );
};

// ===== 本体 =====
export const CameraDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ending = f >= S[16];
  const recap = !ending && f >= S[15];
  const cutaway = !ending && !recap && f >= S[11];

  // --- カメラ計算 ---
  let cam = { s: 1, cx: 960, cy: 540 };
  if (!ending) {
    if (recap) {
      // 技のまとめ: 寄った状態から引き (ズームアウト)
      const t = easeOut(seg(f, S[15], S[15] + 30));
      cam = { s: lerp(1.9, 1, t), cx: lerp(1240, 960, t), cy: lerp(500, 540, t) };
    } else if (cutaway) {
      // 横移動: 硬貨を追いかける
      const rollT = easeInOut(seg(f, S[12], S[14] - 10));
      const coinX = lerp(690, 2620, rollT);
      cam = { s: 1, cx: clamp(coinX + 160, 960, 3400 - 960), cy: 540 };
    } else if (f >= S[4]) {
      // 投入口にホールド (手持ちカメラ風のゆらぎ)
      cam = { s: 3, cx: 1380 + Math.sin(f / 37) * 5, cy: 380 + Math.cos(f / 29) * 4 };
    } else if (f >= S[3]) {
      // 技① 寄り: 全体 → 投入口
      const t = easeInOut(seg(f, S[3], S[4] - 8));
      cam = { s: lerp(1.06, 3, t), cx: lerp(970, 1380, t), cy: lerp(525, 380, t) };
    } else {
      // 冒頭: ゆっくり押し寄り
      const t = seg(f, 0, S[3]);
      cam = { s: lerp(1, 1.06, t), cx: lerp(960, 970, t), cy: lerp(540, 525, t) };
    }
  }

  // --- カット時の白フラッシュ ---
  const flash = Math.max(
    clamp(0.9 * (1 - Math.abs(f - S[11]) / 5), 0, 1),
    clamp(0.9 * (1 - Math.abs(f - S[15]) / 5), 0, 1),
  );

  // --- 字幕 ---
  let li = 0;
  for (let i = 0; i < S.length; i++) if (f >= S[i]) li = i;
  const next = li + 1 < S.length ? S[li + 1] : DEMO_TOTAL_FRAMES;
  const subOpacity = Math.min(seg(f, S[li], S[li] + 6), seg(next - f + S[li], S[li], S[li] + 6));

  // --- BGM ---
  const bgmVolume = (fr: number) => {
    const t1 = seg(fr, 0, 2 * FPS);
    const t2 = seg(DEMO_TOTAL_FRAMES - fr, 0, 3 * FPS);
    return 0.07 * Math.min(t1, t2);
  };

  return (
    <AbsoluteFill style={{ background: KRP.paper, overflow: "hidden" }}>
      {!ending && (
        <Camera s={cam.s} cx={cam.cx} cy={cam.cy}>
          {cutaway ? <CutawayWorld f={f} /> : <StreetWorld f={f} recap={recap} />}
        </Camera>
      )}
      {/* 画面に固定の層 (カメラの影響を受けない) */}
      {!ending && <Magnifier f={f} />}
      {cutaway && <ChapterOverlay f={f} />}
      {recap && <RecapPills f={f} />}
      {recap && <Stamp x={1430} y={140} text="ぜんぶ入り" size={44} />}
      {ending && <EndingCard f={f - S[16]} />}
      {!ending && <Badge text="カメラ演出のデモ" />}
      {!ending && <TechChip f={f} />}
      {!ending && <Atmosphere f={f} />}
      {flash > 0 && <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash }} />}
      <DemoSubtitle text={LINES[li].text} opacity={subOpacity} />
      {/* 音声 */}
      {LINES.map((l, i) => (
        <Sequence key={i} from={S[i]} durationInFrames={Math.ceil(l.sec * FPS) + 10}>
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
      <Audio loop src={staticFile("bgm/sigmamusicart-no-copyright-music-537751.mp3")} volume={bgmVolume} />
    </AbsoluteFill>
  );
};
