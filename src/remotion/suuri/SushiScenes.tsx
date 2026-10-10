// 37%ルール回 (回転寿司×結婚) の専用シーン集。
// すべて parts.tsx の共通部品 (Frame / Plate / Lane など) の上に描く。
// 和紙背景への反転は Frame が担当するので、ここでは従来どおり黒地用の色で描けばよい。

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../types";
import {
  SP,
  SUURI_FONT,
  SUURI_SERIF,
  W,
  H,
  Frame,
  DiagramTitle,
  Person,
  SmallLabel,
  useAppear,
  appearAt,
  Plate,
  Lane,
  NetaKind,
} from "./parts";

type SceneProps = { scene?: Scene; variant?: number };

// 赤い× (中心基準)
const Cross: React.FC<{ x: number; y: number; size?: number; opacity?: number }> = ({
  x,
  y,
  size = 30,
  opacity = 1,
}) => (
  <g stroke={SP.accent} strokeWidth={8} strokeLinecap="round" opacity={opacity}>
    <line x1={x - size} y1={y - size} x2={x + size} y2={y + size} />
    <line x1={x - size} y1={y + size} x2={x + size} y2={y - size} />
  </g>
);

// 手を伸ばす腕 (右下から皿へ)
const ReachArm: React.FC<{ tipX: number; tipY: number; progress?: number }> = ({
  tipX,
  tipY,
  progress = 1,
}) => {
  const sx = tipX + 420;
  const sy = tipY + 420;
  const x = sx + (tipX - sx) * progress;
  const y = sy + (tipY - sy) * progress;
  return (
    <g stroke={SP.line} strokeWidth={10} strokeLinecap="round" fill="none">
      <line x1={sx} y1={sy} x2={x} y2={y} />
      <circle cx={x} cy={y} r={16} fill={SP.line} stroke="none" />
    </g>
  );
};

// レーン+流れる皿 (共通の舞台装置)
const FlowingPlates: React.FC<{
  y: number;
  kinds?: NetaKind[];
  speed?: number;
  scale?: number;
}> = ({ y, kinds = ["plain", "maguro", "tamago", "chutoro", "plain", "tamago"], speed = 1.2, scale = 1.1 }) => {
  const frame = useCurrentFrame();
  const span = W + 360;
  return (
    <g>
      {kinds.map((kind, i) => {
        const x = ((((i * span) / kinds.length - frame * speed) % span) + span) % span - 180;
        return <Plate key={i} x={x} y={y} kind={kind} scale={scale} />;
      })}
    </g>
  );
};

// ===== 第1章: 一皿しか取れない回転寿司 =====

// 回転寿司のレーン (v0: 店の全景 / v1: 全100皿 / v2: あなたが席に着く)
export const SushiLaneScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const pop = useAppear(12);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={470} />
        <FlowingPlates y={462} />
        {v === 0 && (
          <g opacity={pop}>
            <SmallLabel x={960} y={680} text="ちょっと変わった回転寿司" color={SP.ink} size={46} weight={700} />
            <SmallLabel x={960} y={744} text="1皿ずつ、順番に流れてくる" size={34} />
          </g>
        )}
        {v === 1 && (
          <g opacity={pop}>
            <rect x={760} y={620} width={400} height={130} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <text x={960} y={700} textAnchor="middle" fontSize={64} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
              全 100皿
            </text>
          </g>
        )}
        {v === 2 && (
          <g opacity={pop}>
            <Person x={960} y={640} scale={2.6} color={SP.accent} />
            <SmallLabel x={960} y={660 + 120} text="あなた" color={SP.accent} size={40} weight={800} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ルールの図 (v0: ルールは2つ / v1: 一生に1皿だけ)
export const OnePlateScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const a1 = useAppear(10);
  const a2 = useAppear(26);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <rect x={300} y={330} width={600} height={330} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <SmallLabel x={600} y={420} text="ルール ①" color={SP.accent} size={42} weight={800} />
            <Plate x={600} y={540} scale={1.4} kind="maguro" />
            <SmallLabel x={600} y={620} text="取れるのは 1皿だけ" color={SP.ink} size={36} weight={700} />
          </g>
          <g opacity={a2}>
            <rect x={1020} y={330} width={600} height={330} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <SmallLabel x={1320} y={420} text="ルール ②" color={SP.accent} size={42} weight={800} />
            <Plate x={1250} y={540} scale={1.2} kind="plain" />
            <path d="M 1330 520 q 90 -40 60 -90" fill="none" stroke={SP.faint} strokeWidth={5} strokeDasharray="10 8" />
            <Cross x={1400} y={470} size={24} />
            <SmallLabel x={1320} y={620} text="見送ったら 戻らない" color={SP.ink} size={36} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Plate x={500} y={520} scale={1.1} kind="plain" opacity={0.3} />
        <Plate x={1420} y={520} scale={1.1} kind="tamago" opacity={0.3} />
        <g opacity={a1}>
          <circle cx={960} cy={480} r={170} fill="none" stroke={SP.accent} strokeWidth={6} />
          <Plate x={960} y={520} scale={1.8} kind="maguro" />
        </g>
        <g opacity={a2}>
          <SmallLabel x={960} y={740} text="一生に 1皿 だけ" color={SP.accent} size={52} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 戻れない図 (v0: 皿は戻らない / v1: お断りした人 / v2: 気まずい / v3: 現実は戻れることも)
export const NoReturnScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 4;
  const frame = useCurrentFrame();
  const a1 = useAppear(8);
  const a2 = useAppear(26);
  if (v === 0) {
    const px = 700 + Math.min(frame * 4, 760);
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Lane y={500} />
          <Plate x={px} y={492} scale={1.3} kind="tamago" />
          <g opacity={a2}>
            <path d="M 1500 430 Q 1100 280 700 430" fill="none" stroke={SP.faint} strokeWidth={6} strokeDasharray="14 12" />
            <Cross x={1100} y={330} size={40} />
            <SmallLabel x={1100} y={250} text="二度と 戻ってこない" color={SP.accent} size={44} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  if (v === 1 || v === 3) {
    const dashed = v === 3;
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <Person x={620} y={440} scale={3} />
            <SmallLabel x={620} y={700} text="あなた" size={36} />
            <Person x={1300} y={440} scale={3} color={SP.faint} />
            <SmallLabel x={1300} y={700} text="お断りした人" size={36} />
          </g>
          <g opacity={a2}>
            <line x1={760} y1={500} x2={1160} y2={500} stroke={dashed ? SP.accentSoft : SP.faint} strokeWidth={6} strokeDasharray="14 12" />
            {!dashed && <Cross x={960} y={500} size={38} />}
            <SmallLabel
              x={960}
              y={dashed ? 420 : 330}
              text={dashed ? "やり直せることも ある" : "なかなか 戻れない"}
              color={dashed ? SP.accentSoft : SP.accent}
              size={42}
              weight={800}
            />
          </g>
        </svg>
      </Frame>
    );
  }
  // v2: 気まずい
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <Person x={760} y={460} scale={3} />
          <Person x={1160} y={460} scale={3} color={SP.faint} />
          {/* 汗 */}
          <g fill="none" stroke={SP.accentSoft} strokeWidth={5} strokeLinecap="round">
            <path d="M 700 380 q -10 24 6 34" opacity={a2} />
            <path d="M 1222 380 q 10 24 -6 34" opacity={a2} />
          </g>
        </g>
        <g opacity={a2}>
          <SmallLabel x={960} y={300} text="……。" color={SP.faint} size={56} weight={700} />
          <SmallLabel x={960} y={740} text="だいたい 気まずい" color={SP.accent} size={46} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 大トロ (v0: 目標の大トロ / v1: まだ見ぬ大トロ / v2: 70皿目にいた)
export const OtoroScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const a1 = useAppear(10);
  const a2 = useAppear(28);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <Plate x={960} y={500} scale={2.4} kind="otoro" glow />
          </g>
          <g opacity={a2}>
            <SmallLabel x={960} y={700} text="大トロ" color={SP.accent} size={64} weight={800} />
            <SmallLabel x={960} y={760} text="100皿で いちばんおいしい" color={SP.ink} size={36} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  if (v === 1) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Person x={700} y={500} scale={3.4} />
          <circle cx={880} cy={360} r={10} fill={SP.faint} />
          <circle cx={940} cy={310} r={14} fill={SP.faint} />
          <g opacity={a1}>
            <circle cx={1180} cy={260} r={150} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
            <Plate x={1180} y={300} scale={1.1} kind="otoro" glow />
          </g>
          <g opacity={a2}>
            <SmallLabel x={1180} y={480} text="この後 来るかも…？" color={SP.accentSoft} size={40} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={500} />
        <Plate x={420} y={492} scale={1.1} kind="plain" opacity={0.45} />
        <Plate x={700} y={492} scale={1.1} kind="tamago" opacity={0.45} />
        <g opacity={a1}>
          <Plate x={1060} y={492} scale={1.5} kind="otoro" glow />
        </g>
        <Plate x={1420} y={492} scale={1.1} kind="plain" opacity={0.45} />
        <g opacity={a2}>
          <SmallLabel x={1060} y={700} text="本物は 70皿目" color={SP.accent} size={46} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 1皿目のマグロ (v0: 流れてくる / v1: 取りますか?)
export const MaguroScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = appearAt(frame, fps, 6);
  const a2 = useAppear(30);
  const px = 1700 - slide * 740;
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={500} />
        {v === 0 ? (
          <>
            <Plate x={px} y={492} scale={1.6} kind="maguro" />
            <g opacity={a2}>
              <SmallLabel x={960} y={700} text="1皿目: マグロ" color={SP.ink} size={48} weight={800} />
              <SmallLabel x={960} y={758} text="けっこう おいしそう" size={34} />
            </g>
          </>
        ) : (
          <>
            <Plate x={960} y={492} scale={1.6} kind="maguro" />
            <ReachArm tipX={1030} tipY={470} progress={slide} />
            <g opacity={a2}>
              <circle cx={620} cy={300} r={96} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
              <text x={620} y={336} textAnchor="middle" fontSize={84} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
                ?
              </text>
              <SmallLabel x={620} y={470} text="取る？" color={SP.ink} size={44} weight={800} />
            </g>
          </>
        )}
      </svg>
    </Frame>
  );
};

// 全部見送る (v0: 99皿見送り / v1: 最後の1皿サスペンス)
export const PassAllScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const frame = useCurrentFrame();
  const a2 = useAppear(24);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Lane y={520} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const span = W + 320;
            const x = (((i * span) / 6 - frame * 2) % span + span) % span - 160;
            return (
              <g key={i}>
                <Plate x={x} y={512} scale={1.1} kind={(["plain", "maguro", "tamago"] as NetaKind[])[i % 3]} opacity={0.75} />
                <Cross x={x} y={400} size={22} opacity={0.85} />
              </g>
            );
          })}
          <g opacity={a2}>
            <SmallLabel x={960} y={730} text="「もっといいのが来るはず」…99皿 見送り" color={SP.ink} size={40} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  const slide = Math.min(frame * 3, 740);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={520} speed={0.6} />
        <g stroke={SP.dim} strokeWidth={4} strokeLinecap="round">
          {[-60, -20, 20, 60].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={1700 - slide + Math.cos(rad) * 130}
                y1={440 + Math.sin(rad) * 110}
                x2={1700 - slide + Math.cos(rad) * 180}
                y2={440 + Math.sin(rad) * 150}
              />
            );
          })}
        </g>
        <Plate x={1700 - slide} y={512} scale={1.5} kind="gari" />
        <g opacity={a2}>
          <SmallLabel x={960} y={730} text="最後の 1皿……" color={SP.accent} size={52} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// ガリ (v0: ガリでした / v1: ガリと添い遂げる)
export const GariScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const a1 = useAppear(8);
  const a2 = useAppear(28);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <Plate x={960} y={500} scale={2.6} kind="gari" />
          </g>
          <g opacity={a2}>
            <SmallLabel x={960} y={700} text="ガリでした" color={SP.accent} size={64} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <Person x={700} y={460} scale={3.2} />
          <Plate x={1260} y={520} scale={1.8} kind="gari" />
        </g>
        <g opacity={a2}>
          {/* ハート */}
          <path
            d="M 960 360 c -14 -34 -64 -34 -64 6 c 0 30 40 52 64 72 c 24 -20 64 -42 64 -72 c 0 -40 -50 -40 -64 -6 Z"
            fill="none"
            stroke={SP.accent}
            strokeWidth={6}
          />
          <SmallLabel x={960} y={740} text="一生を 添い遂げる相手" color={SP.ink} size={42} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// 後悔の天秤 (早取りの後悔 vs 待ちすぎの後悔)
export const RegretBalanceScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const a1 = useAppear(8);
  const a2 = useAppear(30);
  const tilt = Math.sin(frame / 22) * 4;
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          {/* 支柱 */}
          <path d="M 920 640 L 960 560 L 1000 640 Z" fill="none" stroke={SP.line} strokeWidth={5} />
          <line x1={760} y1={640} x2={1160} y2={640} stroke={SP.dim} strokeWidth={5} />
          {/* 竿と皿 */}
          <g transform={`rotate(${tilt}, 960, 560)`}>
            <line x1={560} y1={560} x2={1360} y2={560} stroke={SP.line} strokeWidth={6} />
            <g>
              <line x1={560} y1={560} x2={520} y2={640} stroke={SP.faint} strokeWidth={4} />
              <line x1={560} y1={560} x2={600} y2={640} stroke={SP.faint} strokeWidth={4} />
              <path d="M 490 640 q 70 50 140 0" fill="none" stroke={SP.line} strokeWidth={5} />
              <Person x={560} y={650} scale={0.9} color={SP.accentSoft} />
            </g>
            <g>
              <line x1={1360} y1={560} x2={1320} y2={640} stroke={SP.faint} strokeWidth={4} />
              <line x1={1360} y1={560} x2={1400} y2={640} stroke={SP.faint} strokeWidth={4} />
              <path d="M 1290 640 q 70 50 140 0" fill="none" stroke={SP.line} strokeWidth={5} />
              <Person x={1360} y={650} scale={0.9} color={SP.accentSoft} />
            </g>
          </g>
          <SmallLabel x={520} y={380} text="早く取る" color={SP.ink} size={38} weight={700} />
          <SmallLabel x={520} y={432} text="「もっといいのが…」" size={32} />
          <SmallLabel x={1400} y={380} text="待ちすぎる" color={SP.ink} size={38} weight={700} />
          <SmallLabel x={1400} y={432} text="「あのとき取れば…」" size={32} />
        </g>
        <g opacity={a2}>
          <SmallLabel x={960} y={300} text="どちらも 後悔" color={SP.accent} size={50} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 結婚相手選びとそっくり (v0: 皿と人の対応 / v1: 一人ずつ / v2: 同じルール / v3: 迷わず決める)
export const MarriageMathScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 4;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a1 = useAppear(8);
  const a2 = useAppear(30);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[0, 1, 2, 3].map((i) => {
            const x = 480 + i * 320;
            const s = appearAt(frame, fps, 6 + i * 5);
            return (
              <g key={i} opacity={s}>
                <Plate x={x} y={330} scale={1.1} kind={(["plain", "maguro", "tamago", "chutoro"] as NetaKind[])[i]} />
                <line x1={x} y1={390} x2={x} y2={520} stroke={SP.faint} strokeWidth={4} strokeDasharray="10 8" />
                <Person x={x} y={540} scale={1.6} />
              </g>
            );
          })}
          <g opacity={a2}>
            <SmallLabel x={960} y={760} text="この形、結婚相手選びと そっくり" color={SP.accent} size={44} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  if (v === 1) {
    const idx = Math.min(Math.floor(frame / 24), 3);
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 420 + i * 270;
            const active = i === idx;
            return (
              <g key={i}>
                <Person x={x} y={460} scale={2} color={active ? SP.accent : SP.faint} fill={active} />
                {i < idx && <Cross x={x} y={400} size={22} opacity={0.8} />}
              </g>
            );
          })}
          <g opacity={a2}>
            <SmallLabel x={960} y={740} text="お付き合いは 一人ずつ" color={SP.ink} size={44} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  if (v === 2) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <rect x={360} y={300} width={1200} height={150} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <Plate x={480} y={385} scale={0.9} kind="maguro" />
            <SmallLabel x={1020} y={392} text="100皿 → 最初の37皿は 見るだけ" color={SP.ink} size={38} weight={700} />
          </g>
          <g opacity={a2}>
            <rect x={360} y={500} width={1200} height={150} rx={14} fill={SP.panel} stroke={SP.accent} strokeWidth={4} />
            <Person x={480} y={548} scale={1.4} />
            <SmallLabel x={1020} y={592} text="結婚にも 同じルールが使える？" color={SP.accent} size={38} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Person x={800} y={440} scale={3} />
        <Person x={1120} y={440} scale={3} color={SP.accent} fill />
        <g opacity={a2}>
          <path d="M 880 640 l 50 60 l 110 -120" fill="none" stroke={SP.accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <SmallLabel x={960} y={300} text="「今までで一番」なら 迷わない" color={SP.ink} size={42} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// 見るだけタイム (v0: 絶対に取らない / v1: 見るだけタイム / v2: 味を覚える)
export const LookOnlyScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const a1 = useAppear(8);
  const a2 = useAppear(28);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={520} />
        <FlowingPlates y={512} speed={1} scale={1} />
        {/* 目 (見るだけの象徴) */}
        <g opacity={a1}>
          <path d="M 760 300 q 200 -130 400 0 q -200 130 -400 0 Z" fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <circle cx={960} cy={300} r={46} fill="none" stroke={v === 0 ? SP.line : SP.accent} strokeWidth={6} />
          <circle cx={960} cy={300} r={16} fill={v === 0 ? SP.line : SP.accent} />
        </g>
        <g opacity={a2}>
          {v === 0 && (
            <>
              <line x1={700} y1={690} x2={1220} y2={690} stroke={SP.accent} strokeWidth={6} />
              <SmallLabel x={960} y={668} text="絶対に 取らない" color={SP.accent} size={48} weight={800} />
            </>
          )}
          {v === 1 && <SmallLabel x={960} y={690} text="見るだけタイム" color={SP.accent} size={52} weight={800} />}
          {v === 2 && <SmallLabel x={960} y={690} text="味だけ しっかり覚える" color={SP.ink} size={44} weight={700} />}
        </g>
      </svg>
    </Frame>
  );
};

// ものさし (v0: 作る / v1: この店はこれくらい / v2: 10皿では甘い / v3: 70皿なら完璧 / v4: もう伸びない)
export const MonosashiScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 5;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = appearAt(frame, fps, 8);
  const a2 = useAppear(30);
  const len = v === 0 ? 560 * grow : v === 1 ? 760 : v === 2 ? 320 : 1180;
  const x0 = 370;
  const y = 520;
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* ものさし本体 */}
        <rect x={x0} y={y - 40} width={Math.max(len, 2)} height={80} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        {Array.from({ length: Math.max(Math.floor(len / 80), 0) }, (_, i) => (
          <line key={i} x1={x0 + 80 + i * 80} y1={y - 40} x2={x0 + 80 + i * 80} y2={i % 2 ? y - 12 : y} stroke={SP.faint} strokeWidth={4} />
        ))}
        <SmallLabel x={x0} y={y + 110} text="0" size={30} anchor="middle" />
        {v === 0 && (
          <g opacity={a2}>
            <SmallLabel x={960} y={300} text="この店の「だいたい」を知る 時間" color={SP.ink} size={42} weight={700} />
            <SmallLabel x={960} y={700} text="ものさしを 作る" color={SP.accent} size={48} weight={800} />
          </g>
        )}
        {v === 1 && (
          <g opacity={a2}>
            <line x1={x0 + 760} y1={y - 120} x2={x0 + 760} y2={y + 60} stroke={SP.accent} strokeWidth={5} strokeDasharray="10 8" />
            <SmallLabel x={x0 + 760} y={y - 150} text="この店は これくらい" color={SP.accent} size={38} weight={800} />
          </g>
        )}
        {v === 2 && (
          <g opacity={a2}>
            <Cross x={x0 + 460} y={y} size={44} />
            <SmallLabel x={960} y={700} text="10皿では ものさしが甘い" color={SP.accent} size={44} weight={800} />
          </g>
        )}
        {v === 3 && (
          <g opacity={a2}>
            <path d="M 1450 420 l 40 50 l 80 -90" fill="none" stroke={SP.accent} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            <SmallLabel x={960} y={700} text="70皿も見れば ものさしは完璧" color={SP.ink} size={42} weight={700} />
          </g>
        )}
        {v === 4 && (
          <g opacity={a2}>
            <line x1={x0 + 1180} y1={y} x2={x0 + 1320} y2={y} stroke={SP.faint} strokeWidth={6} strokeDasharray="8 10" />
            <Cross x={x0 + 1260} y={y} size={30} />
            <SmallLabel x={960} y={700} text="もう それ以上 伸びない" color={SP.accent} size={44} weight={800} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 過去最高が来た瞬間に取る (v0: 超えた皿 / v1: 即、取る / v2: 作戦のまとめ)
export const GrabBestScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a1 = useAppear(8);
  const reach = appearAt(frame, fps, 26);
  const heights = [120, 180, 150, 90];
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 過去最高ライン */}
        <g opacity={a1}>
          <line x1={300} y1={420} x2={1620} y2={420} stroke={SP.accent} strokeWidth={5} strokeDasharray="16 12" />
          <SmallLabel x={330} y={386} text="今までの 過去最高" color={SP.accentSoft} size={32} anchor="start" />
        </g>
        {/* 見てきた皿 (ラインの下) */}
        {heights.map((h, i) => (
          <Plate key={i} x={430 + i * 250} y={420 + h} scale={0.95} kind={(["plain", "tamago", "chutoro", "plain"] as NetaKind[])[i]} opacity={0.5} />
        ))}
        {/* ラインを超えた皿 */}
        <g opacity={a1}>
          <Plate x={1430} y={360} scale={1.4} kind="otoro" glow={v !== 2} />
        </g>
        {v !== 2 && <ReachArm tipX={1480} tipY={340} progress={reach} />}
        <g opacity={reach}>
          {v === 0 && <SmallLabel x={960} y={730} text="過去最高を 超えた瞬間" color={SP.ink} size={44} weight={700} />}
          {v === 1 && <SmallLabel x={960} y={730} text="即、取る！" color={SP.accent} size={58} weight={800} />}
          {v === 2 && (
            <>
              <path d="M 880 640 l 46 56 l 100 -110" fill="none" stroke={SP.accent} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              <SmallLabel x={960} y={760} text="作戦は これだけ" color={SP.ink} size={40} weight={700} />
            </>
          )}
        </g>
      </svg>
    </Frame>
  );
};

// 区切り線はどこ? (v0: ? / v1: 短すぎ× / v2: 長すぎ× / v3: ちょうどいいは?)
export const CutoffLineScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 4;
  const a1 = useAppear(8);
  const a2 = useAppear(26);
  const bx = 300;
  const bw = 1320;
  const by = 500;
  const pos = v === 1 ? 0.1 : v === 2 ? 0.7 : v === 0 ? 0.37 : 0.37;
  const cx = bx + bw * pos;
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <rect x={bx} y={by} width={bw} height={80} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={bx + ((i + 1) * bw) / 10} y1={by} x2={bx + ((i + 1) * bw) / 10} y2={by + 18} stroke={SP.dim} strokeWidth={3} />
          ))}
          <SmallLabel x={bx} y={by + 140} text="1皿目" size={30} />
          <SmallLabel x={bx + bw} y={by + 140} text="100皿目" size={30} />
        </g>
        <g opacity={a2}>
          <line x1={cx} y1={by - 90} x2={cx} y2={by + 110} stroke={SP.accent} strokeWidth={7} />
          {/* 区間が狭い時 (短すぎ×の回) は文字を小さくして赤線や×と重ねない */}
          <SmallLabel x={(bx + cx) / 2} y={by - 44} text="見るだけ" color={SP.faint} size={cx - bx < 220 ? 24 : 32} />
          <SmallLabel x={(cx + bx + bw) / 2} y={by - 50} text="過去最高なら 取る" color={SP.ink} size={32} />
          {v === 0 && (
            <>
              <circle cx={cx} cy={by - 160} r={64} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
              <text x={cx} y={by - 134} textAnchor="middle" fontSize={64} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
                ?
              </text>
            </>
          )}
          {v === 1 && (
            <>
              <Cross x={cx} y={by - 150} size={36} />
              <SmallLabel x={960} y={740} text="短すぎると ものさしが甘い" color={SP.accent} size={42} weight={800} />
            </>
          )}
          {v === 2 && (
            <>
              <Cross x={cx} y={by - 150} size={36} />
              <SmallLabel x={960} y={740} text="長すぎると 取るものがなくなる" color={SP.accent} size={42} weight={800} />
            </>
          )}
          {v === 3 && (
            <>
              <Cross x={bx + bw * 0.1} y={by - 150} size={28} opacity={0.6} />
              <Cross x={bx + bw * 0.7} y={by - 150} size={28} opacity={0.6} />
              <SmallLabel x={960} y={740} text="ちょうどいい長さは どこ？" color={SP.accent} size={46} weight={800} />
            </>
          )}
        </g>
      </svg>
    </Frame>
  );
};

// ニセモノの中トロ (v0: 飛びついてしまう / v1: かみしめながら大トロを見送る)
export const ChutoroTrapScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a1 = useAppear(8);
  const reach = appearAt(frame, fps, 22);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Lane y={500} />
          <g opacity={a1}>
            <Plate x={900} y={492} scale={1.5} kind="chutoro" />
            <SmallLabel x={520} y={640} text="11皿目: そこそこの中トロ" size={34} />
          </g>
          <ReachArm tipX={960} tipY={470} progress={reach} />
          <g opacity={reach}>
            {/* 吹き出し */}
            <g transform="translate(560, 280)">
              <rect x={-230} y={-70} width={460} height={140} rx={18} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
              <text x={0} y={18} textAnchor="middle" fontSize={52} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
                過去最高だ！
              </text>
            </g>
          </g>
        </svg>
      </Frame>
    );
  }
  const slide = Math.min(frame * 5, 1500);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={440} />
        {/* 目の前を流れていく大トロ */}
        <Plate x={1800 - slide} y={432} scale={1.4} kind="otoro" glow />
        {/* 中トロを手にしたあなた */}
        <g opacity={a1}>
          <Person x={620} y={620} scale={2.6} />
          <Plate x={830} y={700} scale={1.1} kind="chutoro" />
          <SmallLabel x={620} y={560 - 240} text="中トロを かみしめる…" color={SP.faint} size={34} />
        </g>
        <g opacity={reach}>
          <SmallLabel x={1240} y={320} text="本物の大トロは 70皿目" color={SP.accent} size={42} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 大トロを見送る危険 (v0: 最初の70皿に70% / v1: 空のレーン)
export const OtoroLostScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const a1 = useAppear(8);
  const a2 = useAppear(28);
  if (v === 0) {
    const bx = 300;
    const bw = 1320;
    const by = 480;
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <rect x={bx} y={by} width={bw} height={90} rx={10} fill="none" stroke={SP.line} strokeWidth={5} />
            <rect x={bx} y={by} width={bw * 0.7} height={90} rx={10} fill={SP.accent} opacity={0.35} />
            <line x1={bx + bw * 0.7} y1={by - 40} x2={bx + bw * 0.7} y2={by + 130} stroke={SP.accent} strokeWidth={6} />
            <SmallLabel x={bx + bw * 0.35} y={by + 58} text="見るだけ 70皿" color={SP.ink} size={36} weight={700} />
            <Plate x={bx + bw * 0.45} y={by - 70} scale={0.9} kind="otoro" />
          </g>
          <g opacity={a2}>
            <SmallLabel x={960} y={730} text="大トロが この中にいる確率 70%" color={SP.accent} size={46} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Lane y={460} speed={0.8} />
        {/* 皿が無い。完璧なものさしだけ持っている */}
        <g opacity={a1}>
          <Person x={960} y={620} scale={2.6} />
          <rect x={760} y={716} width={400} height={44} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={840 + i * 80} y1={716} x2={840 + i * 80} y2={738} stroke={SP.faint} strokeWidth={3} />
          ))}
        </g>
        <g opacity={a2}>
          <SmallLabel x={960} y={300} text="完璧なものさし。でも 取るものがない" color={SP.accent} size={44} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== 第3章: なぜ37なのか =====

// 見るだけを1皿延ばすと? (v0: +1の皿 / v1: 払うもの1% / v2: もらえるもの)
export const PlusOneScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const a1 = useAppear(8);
  const a2 = useAppear(28);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {v === 0 && (
          <>
            {[0, 1, 2].map((i) => (
              <Plate key={i} x={480 + i * 260} y={480} scale={1.1} kind="plain" opacity={0.55} />
            ))}
            <g opacity={a1}>
              <circle cx={1300} cy={450} r={120} fill="none" stroke={SP.accent} strokeWidth={6} strokeDasharray="14 10" />
              <Plate x={1300} y={480} scale={1.2} kind="tamago" />
              <SmallLabel x={1300} y={280} text="+1皿" color={SP.accent} size={56} weight={800} />
            </g>
            <g opacity={a2}>
              <SmallLabel x={960} y={720} text="見るだけタイムを 1皿だけ延ばすと？" color={SP.ink} size={42} weight={700} />
            </g>
          </>
        )}
        {v === 1 && (
          <>
            <g opacity={a1}>
              <rect x={560} y={320} width={800} height={200} rx={16} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
              <SmallLabel x={960} y={410} text="払うもの" color={SP.faint} size={34} />
              <text x={960} y={488} textAnchor="middle" fontSize={56} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
                見送る危険 +1%
              </text>
            </g>
            <g opacity={a2}>
              <Plate x={760} y={660} scale={1} kind="otoro" />
              <Cross x={860} y={630} size={26} />
              <SmallLabel x={1120} y={648} text="何皿目でも 1皿 = 1%" color={SP.ink} size={36} weight={700} anchor="middle" />
            </g>
          </>
        )}
        {v === 2 && (
          <>
            <g opacity={a1}>
              <rect x={560} y={320} width={800} height={200} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              <SmallLabel x={960} y={410} text="もらえるもの" color={SP.faint} size={34} />
              <text x={960} y={488} textAnchor="middle" fontSize={52} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
                ものさしの精度 UP
              </text>
            </g>
            <g opacity={a2}>
              <rect x={660} y={640} width={420} height={40} rx={8} fill="none" stroke={SP.line} strokeWidth={4} />
              <rect x={660} y={640} width={300} height={40} rx={8} fill={SP.accent} opacity={0.5} />
              <path d="M 1120 660 l 60 0 m -18 -16 l 18 16 l -18 16" fill="none" stroke={SP.accent} strokeWidth={6} strokeLinecap="round" />
              <SmallLabel x={1300} y={672} text="育つ" color={SP.accent} size={36} weight={800} anchor="middle" />
            </g>
          </>
        )}
      </svg>
    </Frame>
  );
};

// 効き目がだんだん減る (v0: 曲線全体 / v1: 10→20はぐんぐん / v2: 60→70はほぼ横ばい)
export const GainFadeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const a1 = useAppear(10);
  const a2 = useAppear(30);
  // 飽和曲線: x 0..100 → y
  const px = (t: number) => 360 + t * 12;
  const py = (t: number) => 720 - 400 * (1 - Math.exp(-t / 28));
  const path = Array.from({ length: 51 }, (_, i) => {
    const t = i * 2;
    return `${i === 0 ? "M" : "L"} ${px(t)} ${py(t)}`;
  }).join(" ");
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <line x1={360} y1={720} x2={1620} y2={720} stroke={SP.faint} strokeWidth={4} />
          <line x1={360} y1={720} x2={360} y2={260} stroke={SP.faint} strokeWidth={4} />
          <SmallLabel x={1500} y={762} text="見た皿の数" size={28} />
          <SmallLabel x={400} y={250} text="ものさしの良さ" size={28} anchor="start" />
          <path d={path} fill="none" stroke={SP.line} strokeWidth={6} />
        </g>
        <g opacity={a2}>
          {v === 0 && (
            <>
              <SmallLabel x={700} y={400} text="最初は ぐんぐん" color={SP.accent} size={38} weight={800} />
              <SmallLabel x={1360} y={300} text="だんだん 効かなくなる" color={SP.faint} size={34} />
            </>
          )}
          {v === 1 && (
            <>
              <line x1={px(10)} y1={py(10)} x2={px(10)} y2={720} stroke={SP.accent} strokeWidth={4} strokeDasharray="8 8" />
              <line x1={px(20)} y1={py(20)} x2={px(20)} y2={720} stroke={SP.accent} strokeWidth={4} strokeDasharray="8 8" />
              <path d={`M ${px(22)} ${py(20)} L ${px(22)} ${py(10)}`} stroke={SP.accent} strokeWidth={8} strokeLinecap="round" />
              <SmallLabel x={px(15)} y={762} text="10→20皿" color={SP.accent} size={30} weight={700} />
              <SmallLabel x={px(30) + 60} y={(py(10) + py(20)) / 2} text="大きく育つ" color={SP.accent} size={36} weight={800} anchor="start" />
            </>
          )}
          {v === 2 && (
            <>
              <line x1={px(60)} y1={py(60)} x2={px(60)} y2={720} stroke={SP.accent} strokeWidth={4} strokeDasharray="8 8" />
              <line x1={px(70)} y1={py(70)} x2={px(70)} y2={720} stroke={SP.accent} strokeWidth={4} strokeDasharray="8 8" />
              <SmallLabel x={px(65)} y={762} text="60→70皿" color={SP.accent} size={30} weight={700} />
              <SmallLabel x={px(65)} y={py(65) - 60} text="ほとんど 変わらない" color={SP.accent} size={36} weight={800} />
            </>
          )}
        </g>
      </svg>
    </Frame>
  );
};

// 払うもの vs もらえるもの (v0: 2本の線 / v1: 分かれ目 / v2: 37%地点 / v3: 釣り合い)
export const CostVsGainScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 4;
  const a1 = useAppear(10);
  const a2 = useAppear(32);
  const px = (t: number) => 360 + t * 12;
  // もらえるもの: 減っていく曲線 / 払うもの: 一定の線
  const gainY = (t: number) => 330 + 340 * (1 - Math.exp(-t / 38.5)); // t=37 でちょうど costY と交わる
  const costY = 540;
  const gain = Array.from({ length: 51 }, (_, i) => {
    const t = i * 2;
    return `${i === 0 ? "M" : "L"} ${px(t)} ${gainY(t)}`;
  }).join(" ");
  // 交点 ≈ gainY(t)=costY → t ≈ 37
  const cxT = 37;
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <line x1={360} y1={720} x2={1620} y2={720} stroke={SP.faint} strokeWidth={4} />
          <SmallLabel x={1500} y={762} text="見るだけの長さ" size={28} />
          {/* 払うもの: 一定 */}
          <line x1={360} y1={costY} x2={1620} y2={costY} stroke={SP.accent} strokeWidth={6} />
          {/* 白い曲線が左側を横切るので、ラベルは曲線が下がりきった右端に置く */}
          <SmallLabel x={1620} y={costY - 28} text="払うもの (1皿 = 1%)" color={SP.accentSoft} size={32} anchor="end" />
          {/* もらえるもの: 減る */}
          <path d={gain} fill="none" stroke={SP.line} strokeWidth={6} />
          <SmallLabel x={520} y={330} text="もらえるもの (どんどん減る)" color={SP.ink} size={32} anchor="start" />
        </g>
        <g opacity={a2}>
          {v >= 1 && (
            <>
              <circle cx={px(cxT)} cy={costY} r={20} fill="none" stroke={SP.accent} strokeWidth={6} />
              <SmallLabel x={px(cxT)} y={costY - 60} text="ここで やめる" color={SP.accent} size={38} weight={800} />
            </>
          )}
          {v >= 2 && (
            <>
              <line x1={px(cxT)} y1={costY} x2={px(cxT)} y2={720} stroke={SP.accent} strokeWidth={5} strokeDasharray="10 8" />
              <SmallLabel x={px(cxT)} y={770} text="全体の 37%地点" color={SP.accent} size={34} weight={800} />
            </>
          )}
          {v === 3 && (
            <SmallLabel x={1240} y={420} text="危険と成長が ちょうど釣り合う" color={SP.ink} size={36} weight={700} />
          )}
        </g>
      </svg>
    </Frame>
  );
};

// 成功率の山 (v0〜v5 で棒が増えて山になる)
export const SuccessMountainScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 6;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars: { t: number; pct: number }[] = [
    { t: 10, pct: 23 },
    { t: 30, pct: 36.5 },
    { t: 37, pct: 37.1 },
    { t: 50, pct: 35 },
    { t: 70, pct: 25 },
    { t: 90, pct: 9 },
  ];
  const shown = v === 0 ? 1 : v === 1 ? 2 : v <= 3 ? 3 : 6;
  const px = (t: number) => 360 + t * 12.6;
  const barH = (pct: number) => pct * 11;
  const baseY = 720;
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <line x1={320} y1={baseY} x2={1660} y2={baseY} stroke={SP.faint} strokeWidth={4} />
        {/* 90皿の目盛りラベルと重ならないよう、軸ラベルは一段下に置く */}
        <SmallLabel x={1520} y={808} text="見るだけの皿数" size={28} />
        {bars.slice(0, shown).map((b, i) => {
          const grow = appearAt(frame, fps, 6 + i * 6);
          const red = b.t === 37;
          return (
            <g key={b.t}>
              <rect
                x={px(b.t) - 42}
                y={baseY - barH(b.pct) * grow}
                width={84}
                height={barH(b.pct) * grow}
                fill={red ? SP.accent : "none"}
                stroke={red ? SP.accent : SP.line}
                strokeWidth={5}
                opacity={red || b.t < 37 ? 1 : 0.65}
              />
              <SmallLabel x={px(b.t)} y={762} text={`${b.t}皿`} size={28} color={red ? SP.accent : SP.faint} weight={red ? 800 : 400} />
              {/* 37皿の赤ラベルは隣の36.5%と重なるため、一段高く掲げる */}
              <SmallLabel
                x={px(b.t)}
                y={baseY - barH(b.pct) * grow - (red ? 64 : 24)}
                text={`${b.pct}%`}
                size={red ? 40 : 32}
                color={red ? SP.accent : SP.ink}
                weight={red ? 800 : 700}
              />
            </g>
          );
        })}
        {v === 3 && (
          <g opacity={appearAt(frame, fps, 24)}>
            {/* 上に置くとタイトルと重なるので、棒の右横から左向き矢印で指す */}
            <path d={`M ${px(37) + 56} ${baseY - barH(37.1) + 16} l 44 -26 v 52 Z`} fill={SP.accent} />
            <SmallLabel x={px(37) + 120} y={baseY - barH(37.1) + 30} text="ここが 頂上" color={SP.accent} size={40} weight={800} anchor="start" />
          </g>
        )}
        {v === 5 && (
          <g opacity={appearAt(frame, fps, 20)}>
            <path
              d={`M ${px(5)} ${baseY - barH(14)} Q ${px(37)} ${baseY - barH(37.1) - 60} ${px(37)} ${baseY - barH(37.1)} Q ${px(40)} ${baseY - barH(37.1) - 55} ${px(95)} ${baseY - barH(5)}`}
              fill="none"
              stroke={SP.faint}
              strokeWidth={4}
              strokeDasharray="10 10"
            />
            <circle cx={px(37)} cy={baseY - barH(37.1)} r={16} fill={SP.accent} />
            {/* 37.1%の赤ラベルやタイトルと重ならない右上に置く */}
            <SmallLabel x={px(37) + 240} y={baseY - barH(37.1) - 82} text="てっぺんは 37皿" color={SP.accent} size={38} weight={800} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 数学の有名人 e (v0: 2.718… / v1: 利息と細菌 / v2: 名前はe / v3: 1÷e / v4: 両方一致 / v5: レーンの裏)
export const EulerEScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 6;
  const a1 = useAppear(10);
  const a2 = useAppear(30);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {v === 0 && (
          <>
            <g opacity={a1}>
              <text x={960} y={520} textAnchor="middle" fontSize={150} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
                2.718…
              </text>
            </g>
            <g opacity={a2}>
              <SmallLabel x={960} y={660} text="この数、聞いたことありますか？" size={38} />
            </g>
          </>
        )}
        {v === 1 && (
          <>
            <g opacity={a1}>
              {/* 利息: 積み上がるコイン */}
              <g transform="translate(560, 0)">
                {[0, 1, 2, 3].map((i) => (
                  <ellipse key={i} cx={0} cy={560 - i * 34} rx={90} ry={22} fill="none" stroke={SP.line} strokeWidth={5} transform="translate(0, 0)" />
                ))}
                <path d="M 120 540 q 60 -80 20 -150 m 0 0 l -26 10 m 26 -10 l 8 28" fill="none" stroke={SP.accent} strokeWidth={5} />
                <SmallLabel x={0} y={680} text="銀行の利息" size={34} />
              </g>
              {/* 細菌: 分裂する点 */}
              <g transform="translate(1340, 0)">
                <circle cx={0} cy={380} r={22} fill={SP.line} />
                <circle cx={-70} cy={470} r={18} fill={SP.line} />
                <circle cx={70} cy={470} r={18} fill={SP.line} />
                {[-110, -36, 36, 110].map((dx) => (
                  <circle key={dx} cx={dx} cy={552} r={14} fill={SP.faint} />
                ))}
                <SmallLabel x={0} y={680} text="細菌の増え方" size={34} />
              </g>
            </g>
            <g opacity={a2}>
              <SmallLabel x={960} y={300} text="「だんだん変わる増え方」に 必ず顔を出す" color={SP.ink} size={38} weight={700} />
              <text x={960} y={540} textAnchor="middle" fontSize={84} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
                2.718…
              </text>
            </g>
          </>
        )}
        {v === 2 && (
          <>
            <g opacity={a1}>
              <text x={960} y={620} textAnchor="middle" fontSize={420} fontWeight={700} fill={SP.accent} fontFamily={SUURI_SERIF} fontStyle="italic">
                e
              </text>
            </g>
            <g opacity={a2}>
              <SmallLabel x={960} y={730} text="名前は、e。数学の有名人" color={SP.ink} size={42} weight={700} />
            </g>
          </>
        )}
        {v === 3 && (
          <g opacity={a1}>
            <text x={960} y={500} textAnchor="middle" fontSize={120} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
              1 ÷ <tspan fill={SP.accent} fontFamily={SUURI_SERIF} fontStyle="italic">e</tspan> = 0.368
            </text>
            <g opacity={a2}>
              <SmallLabel x={960} y={640} text="= およそ 37%" color={SP.accent} size={56} weight={800} />
            </g>
          </g>
        )}
        {v === 4 && (
          <>
            <g opacity={a1}>
              <rect x={320} y={360} width={580} height={220} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
              <SmallLabel x={610} y={440} text="見るだけタイムの長さ" size={34} />
              <SmallLabel x={610} y={520} text="37%" color={SP.accent} size={60} weight={800} />
            </g>
            <g opacity={a2}>
              <rect x={1020} y={360} width={580} height={220} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
              <SmallLabel x={1310} y={440} text="成功率" size={34} />
              <SmallLabel x={1310} y={520} text="37%" color={SP.accent} size={60} weight={800} />
              <text x={960} y={495} textAnchor="middle" fontSize={64} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
                =
              </text>
              <SmallLabel x={960} y={700} text="どちらも 1÷e に ぴったり一致" color={SP.ink} size={40} weight={700} />
            </g>
          </>
        )}
        {v === 5 && (
          <>
            <text x={960} y={560} textAnchor="middle" fontSize={520} fontWeight={700} fill={SP.dim} fontFamily={SUURI_SERIF} fontStyle="italic" opacity={0.8}>
              e
            </text>
            <Lane y={520} />
            <FlowingPlates y={512} speed={1} scale={1} />
            <g opacity={a2}>
              <SmallLabel x={960} y={720} text="レーンの裏に 数学の大スター" color={SP.accent} size={46} weight={800} />
            </g>
          </>
        )}
      </svg>
    </Frame>
  );
};

// ヤマ勘 vs 作戦 (v0: 1% vs 37% / v1: ×37)
export const YamakanScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const a1 = useAppear(8);
  const a2 = useAppear(30);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            {/* 100個の点、1つだけ赤 */}
            {Array.from({ length: 100 }, (_, i) => {
              const gx = 420 + (i % 10) * 44;
              const gy = 300 + Math.floor(i / 10) * 42;
              const hit = i === 37;
              return <circle key={i} cx={gx} cy={gy} r={hit ? 13 : 9} fill={hit ? SP.accent : SP.dim} />;
            })}
            <SmallLabel x={620} y={780} text="ヤマ勘: 当たり 1%" size={36} color={SP.faint} weight={700} />
          </g>
          <g opacity={a2}>
            <rect x={1120} y={320} width={160} height={400} fill="none" stroke={SP.line} strokeWidth={5} />
            <rect x={1120} y={320 + 400 * 0.63} width={160} height={400 * 0.37} fill={SP.accent} opacity={0.85} />
            <SmallLabel x={1200} y={780} text="作戦あり: 37%" color={SP.accent} size={36} weight={800} />
            <SmallLabel x={1480} y={530} text="37倍！" color={SP.accent} size={56} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <SmallLabel x={560} y={500} text="1%" color={SP.faint} size={80} weight={700} />
          <path d="M 700 480 l 180 0 m -40 -30 l 40 30 l -40 30" fill="none" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          <SmallLabel x={1120} y={510} text="37%" color={SP.accent} size={110} weight={800} />
        </g>
        <g opacity={a2}>
          <SmallLabel x={960} y={700} text="作戦ひとつで ×37" color={SP.ink} size={48} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== 第4章: でも、人は寿司ではない =====

// 年齢の軸 (v0: 27歳に赤い印 / v1: ゾーン分け)
export const AgeTimelineScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const a1 = useAppear(8);
  const a2 = useAppear(28);
  const x0 = 360;
  const x1 = 1560;
  const y = 520;
  const ageX = (age: number) => x0 + ((age - 20) / 20) * (x1 - x0);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <line x1={x0} y1={y} x2={x1} y2={y} stroke={SP.line} strokeWidth={6} />
          {[20, 25, 30, 35, 40].map((age) => (
            <g key={age}>
              <line x1={ageX(age)} y1={y - 16} x2={ageX(age)} y2={y + 16} stroke={SP.line} strokeWidth={4} />
              <SmallLabel x={ageX(age)} y={y + 70} text={`${age}歳`} size={32} />
            </g>
          ))}
        </g>
        <g opacity={a2}>
          {v === 0 ? (
            <>
              <line x1={ageX(27.4)} y1={y - 110} x2={ageX(27.4)} y2={y + 20} stroke={SP.accent} strokeWidth={7} />
              <SmallLabel x={ageX(27.4)} y={y - 140} text="37%地点 ≒ 27歳" color={SP.accent} size={44} weight={800} />
            </>
          ) : (
            <>
              <rect x={x0} y={y - 90} width={ageX(27.4) - x0} height={70} fill={SP.panel} stroke={SP.faint} strokeWidth={3} />
              <SmallLabel x={(x0 + ageX(27.4)) / 2} y={y - 44} text="いろいろな人を知る" size={30} />
              <rect x={ageX(27.4)} y={y - 90} width={x1 - ageX(27.4)} height={70} fill="none" stroke={SP.accent} strokeWidth={4} />
              <SmallLabel x={(ageX(27.4) + x1) / 2} y={y - 44} text="「今までで一番」なら 決める" color={SP.accent} size={30} weight={700} />
            </>
          )}
          <SmallLabel x={960} y={740} text="…と、数学は言うのですが" color={SP.faint} size={36} />
        </g>
      </svg>
    </Frame>
  );
};

// 人は寿司ではない (v0: ≠ / v1: 数字で並べられない)
export const HumanNotSushiScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 2;
  const a1 = useAppear(8);
  const a2 = useAppear(28);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <Plate x={600} y={500} scale={1.8} kind="maguro" />
            <Person x={1320} y={420} scale={3.2} />
          </g>
          <g opacity={a2}>
            <g stroke={SP.accent} strokeWidth={10} strokeLinecap="round">
              <line x1={900} y1={400} x2={1020} y2={400} />
              <line x1={900} y1={470} x2={1020} y2={470} />
              <line x1={1010} y1={350} x2={910} y2={520} />
            </g>
            <SmallLabel x={960} y={720} text="人は、寿司では ありません" color={SP.accent} size={48} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          {/* 上段: 寿司は数字で並ぶ */}
          {[60, 70, 80, 90].map((score, i) => (
            <g key={score}>
              <Plate x={480 + i * 320} y={330} scale={1} kind={(["plain", "tamago", "chutoro", "otoro"] as NetaKind[])[i]} />
              <SmallLabel x={480 + i * 320} y={410} text={`${score}点`} size={30} />
            </g>
          ))}
          <path d="M 400 460 l 1140 0 m -36 -22 l 36 22 l -36 22" fill="none" stroke={SP.faint} strokeWidth={4} />
        </g>
        <g opacity={a2}>
          {/* 下段: 人は? */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <Person x={480 + i * 320} y={560} scale={1.8} />
              <SmallLabel x={480 + i * 320} y={720} text="？点" color={SP.accent} size={34} weight={700} />
            </g>
          ))}
        </g>
      </svg>
    </Frame>
  );
};

// 人の魅力は多面的 (v0: 優しい/朝弱い / v1: 頼れる/歌いすぎ / v2: どちらが上?)
export const ManySidesScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const a1 = useAppear(8);
  const a2 = useAppear(26);
  const tags =
    v === 0
      ? { good: "優しい", weak: "朝に とても弱い" }
      : { good: "頼りになる", weak: "カラオケで 歌いすぎ" };
  if (v !== 2) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={a1}>
            <Person x={960} y={420} scale={3.2} />
          </g>
          <g opacity={a1}>
            <rect x={320} y={340} width={380} height={110} rx={14} fill={SP.panel} stroke={SP.accent} strokeWidth={4} />
            <SmallLabel x={510} y={410} text={tags.good} color={SP.accent} size={40} weight={800} />
            <line x1={700} y1={395} x2={860} y2={420} stroke={SP.faint} strokeWidth={4} />
          </g>
          <g opacity={a2}>
            <rect x={1220} y={340} width={380} height={110} rx={14} fill={SP.panel} stroke={SP.faint} strokeWidth={4} />
            <SmallLabel x={1410} y={410} text={tags.weak} color={SP.faint} size={36} weight={700} />
            <line x1={1220} y1={395} x2={1060} y2={420} stroke={SP.faint} strokeWidth={4} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <Person x={660} y={440} scale={3} />
          <Person x={1260} y={440} scale={3} />
          <circle cx={960} cy={340} r={80} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
          <text x={960} y={372} textAnchor="middle" fontSize={72} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            ?
          </text>
        </g>
        <g opacity={a2}>
          <SmallLabel x={960} y={740} text="どちらが「上」かは 数学には決められない" color={SP.ink} size={40} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// 寿司は逃げないが、人は逃げる
export const PersonFleesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const a1 = useAppear(8);
  const a2 = useAppear(26);
  const run = Math.min(frame * 4, 420);
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={a1}>
          <Lane y={500} x0={200} x1={900} speed={0} />
          <Plate x={550} y={492} scale={1.4} kind="maguro" />
          <SmallLabel x={550} y={700} text="寿司は 逃げない" size={36} color={SP.faint} />
        </g>
        <g opacity={a2}>
          <g transform={`translate(${1250 + run * 0.4}, 0) rotate(8, 1350, 460)`}>
            <Person x={1350} y={430} scale={2.8} color={SP.accent} />
          </g>
          {/* スピード線 */}
          <g stroke={SP.accentSoft} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
            <line x1={1130} y1={420} x2={1230} y2={420} />
            <line x1={1110} y1={480} x2={1220} y2={480} />
            <line x1={1140} y1={540} x2={1240} y2={540} />
          </g>
          <SmallLabel x={1400} y={700} text="人は 逃げる" color={SP.accent} size={42} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 結婚以外にも使える (v0: 4つの場面 / v1: 家探し / v2: 戻れない選択の連続)
export const ApplyAnywhereScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const v = variant % 3;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a2 = useAppear(30);
  if (v === 0) {
    const items: { label: string; draw: React.ReactNode }[] = [
      {
        label: "家探し",
        draw: (
          <path d="M -70 20 L 0 -50 L 70 20 M -50 10 V 70 H 50 V 10" fill="none" stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
        ),
      },
      {
        label: "就職活動",
        draw: (
          <g fill="none" stroke={SP.line} strokeWidth={6}>
            <rect x={-60} y={-30} width={120} height={85} rx={10} />
            <path d="M -24 -30 v -16 h 48 v 16" />
          </g>
        ),
      },
      {
        label: "中古車選び",
        draw: (
          <g fill="none" stroke={SP.line} strokeWidth={6}>
            <path d="M -80 30 h 160 l -20 -45 h -55 l -25 -25 h -35 l -15 45 Z" strokeLinejoin="round" />
            <circle cx={-42} cy={42} r={16} />
            <circle cx={46} cy={42} r={16} />
          </g>
        ),
      },
      {
        label: "旅先のレストラン",
        draw: (
          <g fill="none" stroke={SP.line} strokeWidth={6}>
            <circle cx={0} cy={10} r={48} />
            <path d="M -78 -40 v 60 M -90 -40 v 24 q 0 14 12 14 q 12 0 12 -14 v -24" />
            <path d="M 78 -40 v 100 M 78 -40 q -20 10 -20 40 l 20 10" />
          </g>
        ),
      },
    ];
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {items.map((it, i) => {
            const s = appearAt(frame, fps, 8 + i * 7);
            const x = 420 + (i % 2) * 1080;
            const y = 330 + Math.floor(i / 2) * 290;
            return (
              <g key={it.label} opacity={s}>
                <g transform={`translate(${x}, ${y})`}>{it.draw}</g>
                <SmallLabel x={x + 260} y={y + 20} text={it.label} color={SP.ink} size={40} weight={700} anchor="start" />
              </g>
            );
          })}
        </svg>
      </Frame>
    );
  }
  if (v === 1) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[0, 1, 2, 3, 4].map((i) => {
            const s = appearAt(frame, fps, 8 + i * 6);
            const x = 420 + i * 280;
            const lookOnly = i < 2;
            return (
              <g key={i} opacity={s}>
                <path
                  d={`M ${x - 70} 480 L ${x} 410 L ${x + 70} 480 M ${x - 50} 470 V 540 H ${x + 50} V 470`}
                  fill="none"
                  stroke={lookOnly ? SP.faint : SP.line}
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
                {lookOnly ? (
                  <SmallLabel x={x} y={620} text="見るだけ" size={30} />
                ) : i === 4 ? (
                  <g>
                    <path d={`M ${x - 34} 600 l 22 26 l 48 -52`} fill="none" stroke={SP.accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                ) : null}
              </g>
            );
          })}
          <g opacity={a2}>
            <SmallLabel x={960} y={740} text="最初の何軒かは 見るだけに" color={SP.ink} size={42} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0, 1, 2, 3].map((i) => {
          const s = appearAt(frame, fps, 8 + i * 7);
          const x = 420 + i * 330;
          return (
            <g key={i} opacity={s}>
              <circle cx={x} cy={480} r={26} fill="none" stroke={SP.line} strokeWidth={5} />
              {i < 3 && (
                <path d={`M ${x + 50} 480 l 220 0 m -36 -24 l 36 24 l -36 24`} fill="none" stroke={SP.accent} strokeWidth={6} strokeLinecap="round" />
              )}
              {i > 0 && <Cross x={x - 160} y={560} size={18} opacity={0.6} />}
            </g>
          );
        })}
        <g opacity={a2}>
          <SmallLabel x={960} y={700} text="人生は「戻れない選択」の連続" color={SP.accent} size={46} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

