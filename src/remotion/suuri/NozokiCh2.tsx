// のぞき見くんと絵の具のマジック回: 第2章 (行46〜114) の交換ボード以外の専用シーン。
// この区間は絵の具フルカラー。混ざり色の整合 (オレンジ=黄+赤 / 緑=黄+青 / 茶=黄+赤+青) を守る。
// 絵の具シーンでは PC.red が強調赤を兼ねる (1画面1赤)。

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../types";
import {
  SP,
  SUURI_FONT,
  W,
  H,
  Frame,
  DiagramTitle,
  SmallLabel,
  appearAt,
} from "./parts";
import {
  PC,
  PaintChip,
  MixBowl,
  PaintTube,
  YouFigure,
  ShopFigure,
  NozokiKun,
  Bubble,
  easeInOut,
  clamp01,
} from "./NozokiScenes";
import { KeyIcon, LockPad } from "./NozokiIntro";

type SceneProps = { scene?: Scene; variant?: number };

const useProg = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, progOf: (durationSec?: number) => clamp01(frame / Math.max(((durationSec ?? 6) + 0.35) * fps, 1)) };
};

// 作戦リボン (左上の見出し)
const PlanRibbon: React.FC<{ text: string; opacity?: number }> = ({ text, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={300} y={200} width={330} height={74} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    <text x={465} y={250} textAnchor="middle" fill={SP.ink} fontSize={36} fontWeight={800} fontFamily={SUURI_FONT}>
      {text}
    </text>
  </g>
);

// 内訳タグ (チップの小さな並び)
const IngredientRow: React.FC<{ x: number; y: number; colors: string[]; opacity?: number; scale?: number }> = ({
  x,
  y,
  colors,
  opacity = 1,
  scale = 0.75,
}) => (
  <g opacity={opacity}>
    {colors.map((c, i) => (
      <g key={i}>
        <PaintChip x={x + i * 86 * scale * 1.5} y={y} color={c} scale={scale} />
        {i < colors.length - 1 && (
          <text
            x={x + (i + 0.5) * 86 * scale * 1.5}
            y={y + 12}
            textAnchor="middle"
            fill={SP.faint}
            fontSize={34}
            fontWeight={700}
            fontFamily={SUURI_FONT}
          >
            +
          </text>
        )}
      </g>
    ))}
  </g>
);

// ===== 行47-48: 役者は3人 =====
const ThreeActorsScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 22);
  const a3 = appearAt(frame, fps, v === 1 ? 20 : 999);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "役者は、3人" : "途中で必ず、のぞいてくる")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 舞台の床 */}
        <line x1={280} y1={740} x2={1640} y2={740} stroke={SP.line} strokeWidth={5} />
        <g opacity={a1}>
          <ellipse cx={560} cy={736} rx={170} ry={22} fill={SP.panel} opacity={0.8} />
          <YouFigure x={560} y={430} scale={2.1} />
          <SmallLabel x={560} y={660} text="あなた" color={SP.ink} size={34} weight={700} />
        </g>
        <g opacity={a2}>
          <ellipse cx={1360} cy={736} rx={170} ry={22} fill={SP.panel} opacity={0.8} />
          <ShopFigure x={1360} y={430} scale={2.1} />
        </g>
        {v === 1 && (
          <g opacity={a3}>
            <ellipse cx={960} cy={736} rx={150} ry={20} fill={SP.panel} opacity={0.8} />
            <NozokiKun x={960} y={560} scale={1.6} pose="binocular" frame={frame} />
            <SmallLabel x={960} y={700} text="のぞき見くん" color={SP.ink} size={32} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行49-51: 目標 = ふたりで同じ「ひみつの茶色」 =====
const GoalBrownScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 24);
  const a3 = appearAt(frame, fps, 40);
  return (
    <Frame>
      <DiagramTitle
        text={scene?.title ?? (v === 0 ? "目標: 同じ「ひみつの色」" : v === 1 ? "なぜ、同じ色が欲しい？" : "同じ色 = 合言葉")}
      />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <YouFigure x={480} y={520} scale={2} />
        <SmallLabel x={480} y={740} text="あなた" color={SP.ink} size={32} weight={700} />
        <ShopFigure x={1440} y={520} scale={2} sign={false} />
        <SmallLabel x={1440} y={740} text="お店" color={SP.ink} size={32} weight={700} />
        {/* 頭上の同じ茶色 */}
        <g opacity={a1}>
          <PaintChip x={480} y={310} color={PC.brown} scale={1.25} />
          <PaintChip x={1440} y={310} color={PC.brown} scale={1.25} />
        </g>
        <g opacity={a2}>
          <text x={960} y={332} textAnchor="middle" fill={SP.ink} fontSize={86} fontWeight={800} fontFamily={SUURI_FONT}>
            ＝
          </text>
          <SmallLabel x={960} y={420} text="ふたりだけの、同じ色" color={SP.faint} size={30} />
        </g>
        {v >= 1 && (
          <g opacity={v === 1 ? a3 : 1}>
            {/* 合言葉でカードに鍵をかけるイメージ */}
            <rect x={790} y={520} width={340} height={150} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
            <rect x={830} y={556} width={120} height={78} rx={8} fill={PC.blue} stroke={SP.line} strokeWidth={4} />
            <LockPad x={1050} y={586} scale={0.95} color={SP.line} />
            <rect x={1032} y={576} width={36} height={28} rx={6} fill={PC.brown} />
            <SmallLabel x={960} y={722} text="カード番号に、鍵をかけられる" color={SP.faint} size={28} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行52-53: 茶色で施錠、茶色で開錠。のぞき見くんは開けられない =====
const BrownLockScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 6);
  const a2 = appearAt(frame, fps, 24);
  const a3 = appearAt(frame, fps, 42);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "茶色で閉めて、茶色で開ける" : "茶色を知らないと、開けられない")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 左: あなたが茶色で施錠 */}
        <g opacity={a1}>
          <YouFigure x={420} y={330} scale={1.6} />
          <rect x={330} y={520} width={190} height={120} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <LockPad x={425} y={508} scale={0.95} />
          <rect x={407} y={498} width={36} height={28} rx={6} fill={PC.brown} />
          <SmallLabel x={425} y={700} text="茶色で、カチャ" color={SP.faint} size={28} />
        </g>
        <g opacity={a2}>
          <line x1={580} y1={560} x2={1280} y2={560} stroke={SP.line} strokeWidth={5} markerEnd="url(#bl-arrow)" />
          <defs>
            <marker id="bl-arrow" markerWidth={10} markerHeight={10} refX={7} refY={5} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={SP.line} />
            </marker>
          </defs>
        </g>
        {/* 右: お店が茶色で開錠 */}
        <g opacity={a2}>
          <ShopFigure x={1560} y={330} scale={1.6} />
          <rect x={1400} y={520} width={190} height={120} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <LockPad x={1495} y={508} scale={0.95} openShackle />
          <rect x={1477} y={498} width={36} height={28} rx={6} fill={PC.brown} />
          <SmallLabel x={1495} y={700} text="同じ茶色で、パカ" color={SP.faint} size={28} />
        </g>
        {/* のぞき見くんは開けられない */}
        {v === 1 && (
          <g opacity={a3}>
            <NozokiKun x={940} y={640} scale={1.25} pose="puzzled" frame={frame} />
            <g stroke={PC.red} strokeWidth={9} strokeLinecap="round">
              <line x1={880} y1={330} x2={1000} y2={450} />
              <line x1={880} y1={450} x2={1000} y2={330} />
            </g>
            <SmallLabel x={940} y={290} text="茶色を知らない" color={SP.faint} size={28} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行54: 茶色チップが鍵に変身 (モーフ) =====
const ColorIsKeyScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const t = easeInOut(clamp01((prog - 0.3) / 0.35));
  const spin = t * 360;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "同じ色こそが、「鍵」"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960, 500) rotate(${spin}) translate(-960, -500)`}>
          <g opacity={1 - t}>
            <PaintChip x={960} y={500} color={PC.brown} scale={2.4} />
          </g>
          <g opacity={t}>
            <KeyIcon x={960} y={500} scale={2.6} color={PC.brown} />
          </g>
        </g>
        {t > 0.9 && (
          <g stroke={SP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
            <line x1={760} y1={370} x2={784} y2={394} />
            <line x1={1160} y1={370} x2={1136} y2={394} />
            <line x1={960} y1={330} x2={960} y2={358} />
          </g>
        )}
        <SmallLabel x={960} y={760} text="ずっと探していた「鍵」の正体" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// ===== 行55-57: ルール2か条ボード =====
const RuleBoardScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const a1 = appearAt(frame, fps, 6);
  const hi1 = v === 1;
  const hi2 = v === 2;
  const pulse = 0.55 + Math.sin(frame / 7) * 0.45;
  const row = (y: number, num: string, text: string, hi: boolean, icon: React.ReactNode) => (
    <g opacity={v === 0 ? a1 : hi ? 1 : 0.45}>
      {hi && <rect x={430} y={y - 64} width={1060} height={132} rx={16} fill="none" stroke={PC.red} strokeWidth={5} opacity={pulse} />}
      <circle cx={520} cy={y} r={34} fill={hi ? PC.red : SP.panel} stroke={SP.line} strokeWidth={4} />
      <text x={520} y={y + 14} textAnchor="middle" fill={SP.ink} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
        {num}
      </text>
      <text x={600} y={y + 14} fill={SP.ink} fontSize={42} fontWeight={700} fontFamily={SUURI_FONT}>
        {text}
      </text>
      {icon}
    </g>
  );
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ルールは、2つだけ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <rect x={390} y={240} width={1140} height={520} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} opacity={0.6} />
        {row(
          400,
          "1",
          "送ったものは、ぜんぶ見られる",
          hi1,
          <g>
            <line x1={620} y1={470} x2={1000} y2={470} stroke={SP.line} strokeWidth={4} />
            <path d="M 1316 452 Q 1346 430 1376 452 Q 1346 474 1316 452 Z" fill="none" stroke={SP.faint} strokeWidth={4} />
            <circle cx={1346} cy={452} r={6} fill={SP.faint} />
          </g>,
        )}
        {row(
          620,
          "2",
          "ポケットの中は、見えない",
          hi2,
          <g>
            <rect x={1330} y={590} width={60} height={54} rx={8} fill={SP.background} stroke={SP.line} strokeWidth={4} />
            <text x={1360} y={632} textAnchor="middle" fill={SP.faint} fontSize={34} fontWeight={700} fontFamily={SUURI_FONT}>
              ?
            </text>
          </g>,
        )}
      </svg>
    </Frame>
  );
};

// ===== 行63/72/80: ステップカード (その1/その2/その3) =====
const StepCardScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const a1 = appearAt(frame, fps, 6);
  const captions = ["スタートを、そろえる", "ひみつを、まぜる", "最後の、仕上げ"];
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960, 500) scale(${0.7 + a1 * 0.3}) translate(-960, -500)`} opacity={a1}>
          <rect x={560} y={280} width={800} height={440} rx={26} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <text x={960} y={520} textAnchor="middle" fill={SP.ink} fontSize={150} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={6}>
            その{v + 1}
          </text>
          <rect x={760} y={568} width={400} height={6} rx={3} fill={SP.accent} />
          <text x={960} y={656} textAnchor="middle" fill={SP.faint} fontSize={38} fontWeight={700} fontFamily={SUURI_FONT}>
            {captions[v]}
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行64-65: 同じスタート地点が必要 =====
const SameStartScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "同じスタート地点から"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <YouFigure x={520} y={400} scale={1.9} />
          <ShopFigure x={1400} y={400} scale={1.9} />
          <g opacity={a1}>
            {/* 同じスタート台 (同じ黄) */}
            <rect x={420} y={660} width={200} height={26} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <rect x={1300} y={660} width={200} height={26} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <PaintChip x={520} y={614} color={PC.yellow} />
            <PaintChip x={1400} y={614} color={PC.yellow} />
          </g>
          <g opacity={a2}>
            <text x={960} y={640} textAnchor="middle" fill={SP.ink} fontSize={72} fontWeight={800} fontFamily={SUURI_FONT}>
              ＝
            </text>
            <SmallLabel x={960} y={770} text="出発の色を、そろえる" color={SP.faint} size={32} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "バラバラだと、たどり着けない"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <line x1={960} y1={240} x2={960} y2={760} stroke={SP.dim} strokeWidth={4} strokeDasharray="12 14" />
        {/* 左: そろえる○ */}
        <g opacity={a1}>
          <PaintChip x={440} y={420} color={PC.yellow} />
          <PaintChip x={700} y={420} color={PC.yellow} />
          <circle cx={570} cy={580} r={52} fill="none" stroke={SP.ink} strokeWidth={8} />
          <SmallLabel x={570} y={720} text="同じ出発" color={SP.ink} size={30} weight={700} />
        </g>
        {/* 右: バラバラ× */}
        <g opacity={a2}>
          <PaintChip x={1220} y={420} color={PC.yellow} />
          <PaintChip x={1480} y={420} color={PC.blue} />
          <g stroke={PC.red} strokeWidth={9} strokeLinecap="round">
            <line x1={1300} y1={532} x2={1400} y2={628} />
            <line x1={1300} y1={628} x2={1400} y2={532} />
          </g>
          <SmallLabel x={1350} y={720} text="バラバラの出発" color={SP.faint} size={30} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行69-71: スタートは公開OK / 混ぜる色はひみつ =====
const StartVsSecretScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, v === 0 ? 999 : 20);
  const pulse = 0.55 + Math.sin(frame / 7) * 0.45;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 1 ? "ひみつは、混ぜる色のほう" : "知られていいもの、だめなもの")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 左パネル: スタートの色 = 公開OK */}
        <g opacity={a1}>
          <rect x={330} y={260} width={580} height={460} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} opacity={0.7} />
          <SmallLabel x={620} y={330} text="スタートの色" color={SP.ink} size={34} weight={700} />
          <PaintChip x={620} y={470} color={PC.yellow} scale={1.4} />
          {/* スピーカー (公開) */}
          <g transform="translate(508, 600)">
            <path d="M 0 -14 L 26 -28 L 26 28 L 0 14 Z" fill={SP.line} />
            <rect x={-16} y={-14} width={16} height={28} rx={4} fill={SP.line} />
            <path d="M 36 -16 q 12 16 0 32 M 48 -26 q 20 26 0 52" fill="none" stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
          </g>
          <SmallLabel x={680} y={612} text="公開OK" color={SP.ink} size={34} weight={700} />
        </g>
        {/* 右パネル: 混ぜる色 = ひみつ */}
        <g opacity={a2}>
          <rect x={1010} y={260} width={580} height={460} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} opacity={0.7} />
          <SmallLabel x={1300} y={330} text="あとで混ぜる色" color={SP.ink} size={34} weight={700} />
          {/* ポケットの中 (見えない) */}
          <rect x={1240} y={408} width={120} height={104} rx={12} fill={SP.background} stroke={SP.line} strokeWidth={5} />
          <text x={1300} y={480} textAnchor="middle" fill={SP.faint} fontSize={52} fontWeight={800} fontFamily={SUURI_FONT}>
            ?
          </text>
          <SmallLabel x={1300} y={612} text="ひみつ" color={PC.red} size={36} weight={800} />
          {v === 1 && (
            <rect x={1030} y={280} width={540} height={420} rx={16} fill="none" stroke={PC.red} strokeWidth={6} opacity={pulse} />
          )}
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行78-79: のぞき見くんのメモ帳 (オレンジと緑) =====
const NozokiMemoScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, v === 0 ? 30 : 12);
  const a3 = appearAt(frame, fps, v === 0 ? 999 : 26);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "のぞき見くんに、丸見え" : "メモまで、取っている")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <NozokiKun x={600} y={450} scale={2.3} pose="memo" frame={frame} />
        <SmallLabel x={600} y={760} text="のぞき見くん" color={SP.faint} size={30} />
        {/* 大きなメモ帳 */}
        <g opacity={a1}>
          <rect x={1030} y={250} width={520} height={500} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <line x1={1030} y1={330} x2={1550} y2={330} stroke={SP.dim} strokeWidth={4} />
          {[0, 1].map((i) => (
            <circle key={i} cx={1200 + i * 180} cy={290} r={10} fill="none" stroke={SP.dim} strokeWidth={4} />
          ))}
          <SmallLabel x={1290} y={308} text="みた色" color={SP.faint} size={26} />
        </g>
        <g opacity={a2}>
          <PaintChip x={1180} y={430} color={PC.orange} scale={1.05} />
          <SmallLabel x={1340} y={442} text="オレンジ" color={SP.ink} size={30} anchor="start" />
        </g>
        <g opacity={v === 0 ? a2 : 1}>
          <PaintChip x={1180} y={580} color={PC.green} scale={1.05} />
          <SmallLabel x={1340} y={592} text="みどり" color={SP.ink} size={30} anchor="start" />
        </g>
        {v === 1 && (
          <g opacity={a3}>
            <PaintChip x={1180} y={690} color={PC.yellow} scale={0.8} />
            <SmallLabel x={1320} y={700} text="黄 (スタート)" color={SP.faint} size={26} anchor="start" />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行86-88: 内訳を照合 (順番がちがうだけ) =====
const SameIngredientsScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const a1 = appearAt(frame, fps, 6);
  const a2 = appearAt(frame, fps, 24);
  const a3 = appearAt(frame, fps, 44);
  // あなた: (黄+青の緑) + 赤 → 黄・青・赤 / お店: (黄+赤のオレンジ) + 青 → 黄・赤・青
  const youCol = [PC.yellow, PC.blue, PC.red];
  const shopCol = [PC.yellow, PC.red, PC.blue];
  const ys = [340, 480, 620];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 2 ? "順番が、ちがうだけ" : "入っている色は、同じ")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <SmallLabel x={660} y={270} text="あなたの茶色" color={SP.ink} size={32} weight={700} />
        <SmallLabel x={1260} y={270} text="お店の茶色" color={SP.ink} size={32} weight={700} />
        {ys.map((y, i) => (
          <g key={i}>
            <g opacity={appearAt(frame, fps, 10 + i * 10)}>
              <PaintChip x={660} y={y} color={youCol[i]} scale={1.1} />
            </g>
            <g opacity={appearAt(frame, fps, 16 + i * 10)}>
              <PaintChip x={1260} y={y} color={shopCol[i]} scale={1.1} />
            </g>
          </g>
        ))}
        {/* 照合線 (同じ色同士を結ぶ) */}
        {v >= 1 && (
          <g opacity={v === 1 ? a2 : 1} stroke={SP.faint} strokeWidth={4} strokeDasharray="10 10">
            <line x1={730} y1={340} x2={1190} y2={340} />
            <line x1={730} y1={480} x2={1190} y2={620} />
            <line x1={730} y1={620} x2={1190} y2={480} />
          </g>
        )}
        {v === 2 && (
          <g opacity={a3}>
            {/* 入れ替え矢印 */}
            <path d="M 1430 480 Q 1500 550 1430 620" fill="none" stroke={SP.ink} strokeWidth={5} markerEnd="url(#si-arrow)" />
            <defs>
              <marker id="si-arrow" markerWidth={10} markerHeight={10} refX={7} refY={5} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={SP.ink} />
              </marker>
            </defs>
            <SmallLabel x={960} y={770} text="黄と赤と青。混ぜた順番だけ、ちがう" color={SP.faint} size={32} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行89: カレーは、どの順番でも同じカレー =====
const CurryScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const drop = (delay: number) => {
    const a = appearAt(frame, fps, delay);
    return { y: -180 + a * 180, o: a };
  };
  const d1 = drop(10);
  const d2 = drop(22);
  const d3 = drop(34);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "カレーと、同じ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 湯気 */}
        <g stroke={SP.faint} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6}>
          <path d={`M 880 ${350 + Math.sin(frame / 9) * 8} q 20 -40 0 -80`} />
          <path d={`M 1040 ${350 + Math.sin(frame / 9 + 2) * 8} q -20 -40 0 -80`} />
        </g>
        {/* 具材が落ちる (にんじん・じゃがいも・肉) */}
        <g opacity={d1.o}>
          <path d={`M 850 ${430 + d1.y} L 880 ${398 + d1.y} L 896 ${440 + d1.y} Z`} fill={PC.orange} stroke={SP.line} strokeWidth={3.5} />
        </g>
        <g opacity={d2.o}>
          <circle cx={960} cy={420 + d2.y} r={24} fill={PC.yellow} stroke={SP.line} strokeWidth={3.5} />
        </g>
        <g opacity={d3.o}>
          <rect x={1030} y={400 + d3.y} width={48} height={36} rx={8} fill={PC.brown} stroke={SP.line} strokeWidth={3.5} />
        </g>
        {/* 鍋 */}
        <path d="M 700 480 Q 706 680 960 680 Q 1214 680 1220 480" fill={SP.panel} stroke={SP.line} strokeWidth={6} />
        <ellipse cx={960} cy={480} rx={260} ry={54} fill="#B06A2E" stroke={SP.line} strokeWidth={6} />
        <line x1={660} y1={470} x2={704} y2={478} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
        <line x1={1260} y1={470} x2={1216} y2={478} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
        <SmallLabel x={960} y={780} text="どの順番で入れても、同じカレー" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// ===== 行96-98: のぞき見くんの机 (集めた色と、欲しい茶色) =====
const NozokiHandsScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const a3 = appearAt(frame, fps, v === 2 ? 16 : 999);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "のぞき見くんの、手元" : v === 1 ? "集めたのは、3色" : "欲しいのは、茶色")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <NozokiKun x={960} y={330} scale={1.7} pose="arms" frame={frame} />
        {/* 机 */}
        <rect x={420} y={580} width={1080} height={26} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        <line x1={500} y1={606} x2={480} y2={740} stroke={SP.line} strokeWidth={6} />
        <line x1={1420} y1={606} x2={1440} y2={740} stroke={SP.line} strokeWidth={6} />
        {/* 集めた色 */}
        {[
          { x: 640, c: PC.yellow, t: "黄", d: 8 },
          { x: 820, c: PC.orange, t: "オレンジ", d: v === 1 ? 20 : 8 },
          { x: 1000, c: PC.green, t: "みどり", d: v === 1 ? 32 : 8 },
        ].map(({ x, c, t, d }) => (
          <g key={t} opacity={appearAt(frame, fps, d)}>
            <PaintChip x={x} y={528} color={c} />
            <SmallLabel x={x} y={660} text={t} color={SP.faint} size={26} />
          </g>
        ))}
        {/* 欲しい茶色 (点線+?) */}
        <g opacity={a3}>
          <rect x={1220} y={498} width={60} height={60} rx={14} fill="none" stroke={PC.brown} strokeWidth={5} strokeDasharray="10 10" />
          <text x={1250} y={476} textAnchor="middle" fill={PC.red} fontSize={48} fontWeight={800} fontFamily={SUURI_FONT}>
            ?
          </text>
          <SmallLabel x={1250} y={660} text="茶色" color={SP.ink} size={26} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行99-100: 作戦1 オレンジから赤を取り出す → 戻せない =====
const AttackUnmixScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, v === 0 ? 999 : 16);
  const tug = Math.sin(frame / 4) * 5;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "オレンジから、赤だけ取り出す" : "できません。戻せないので")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <PlanRibbon text="作戦その1" opacity={a1} />
        <PaintChip x={880} y={520} color={PC.orange} scale={2.2} />
        {/* ピンセット */}
        <g transform={`translate(${1100 + tug}, ${400 - tug}) rotate(38)`} opacity={a1}>
          <path d="M 0 0 L 26 150 M 0 0 L -26 150" stroke={SP.line} strokeWidth={9} strokeLinecap="round" fill="none" />
          <circle cx={0} cy={-6} r={10} fill={SP.line} />
        </g>
        {v === 1 && (
          <g opacity={a2}>
            <g stroke={PC.red} strokeWidth={12} strokeLinecap="round">
              <line x1={760} y1={400} x2={1000} y2={640} />
              <line x1={760} y1={640} x2={1000} y2={400} />
            </g>
            <SmallLabel x={1320} y={540} text="絵の具は、戻せない" color={SP.ink} size={36} weight={700} anchor="start" />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行101-104: 作戦2 ぜんぶ混ぜる → 黄が2倍のニセ茶 =====
const AttackMixallScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 3;
  const prog = progOf(scene?.durationSec);
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 28);
  if (v === 0) {
    // 行101+102 (結合): 作戦2の足し算 → 混ぜるアニメ → ひらめきポーズまで1シーンで見せる
    const mixT = easeInOut(clamp01((prog - 0.25) / 0.45));
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "オレンジと緑を、混ぜてしまえ"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <PlanRibbon text="作戦その2" opacity={a1} />
          <g opacity={a1}>
            <PaintChip x={620} y={400} color={PC.orange} scale={1.3} />
            <text x={790} y={416} textAnchor="middle" fill={SP.ink} fontSize={56} fontWeight={700} fontFamily={SUURI_FONT}>
              +
            </text>
            <PaintChip x={960} y={400} color={PC.green} scale={1.3} />
          </g>
          <g opacity={a2}>
            <path d="M 1080 420 Q 1180 460 1240 520" fill="none" stroke={SP.line} strokeWidth={5} markerEnd="url(#am-arrow)" />
            <defs>
              <marker id="am-arrow" markerWidth={10} markerHeight={10} refX={7} refY={5} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={SP.line} />
              </marker>
            </defs>
          </g>
          <MixBowl x={960} y={640} scale={1.3} colorA={PC.orange} colorB={PC.green} result={PC.fakeBrown} mix={mixT} frame={frame} opacity={a2} />
          <NozokiKun x={1500} y={430} scale={1.4} pose={prog > 0.55 ? "idea" : "arms"} frame={frame} />
        </svg>
      </Frame>
    );
  }
  if (v === 1) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "できた色の、中身"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <PaintChip x={960} y={360} color={PC.fakeBrown} scale={1.8} opacity={a1} />
          <g opacity={a2}>
            <IngredientRow x={700} y={580} colors={[PC.yellow, PC.red, PC.yellow, PC.blue]} scale={0.85} />
            {/* 2つの黄をつなぐ下線 */}
            <path d="M 700 650 Q 810 700 918 650" fill="none" stroke={PC.red} strokeWidth={5} strokeDasharray="10 10" />
            <SmallLabel x={810} y={744} text="黄色が、2回" color={PC.red} size={32} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  // v2: 本物の茶色と並べて、ちょっとちがう
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ちょっとちがう、茶色"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a1}>
          <PaintChip x={660} y={450} color={PC.brown} scale={2} />
          <SmallLabel x={660} y={640} text="本物の茶色" color={SP.ink} size={32} weight={700} />
          <IngredientRow x={560} y={710} colors={[PC.yellow, PC.red, PC.blue]} scale={0.55} />
        </g>
        <text x={960} y={470} textAnchor="middle" fill={SP.faint} fontSize={64} fontWeight={800} fontFamily={SUURI_FONT} opacity={a2}>
          ≠
        </text>
        <g opacity={a2}>
          <PaintChip x={1260} y={450} color={PC.fakeBrown} scale={2} />
          <SmallLabel x={1260} y={640} text="黄が2倍の茶色" color={SP.faint} size={32} />
          <IngredientRow x={1120} y={710} colors={[PC.yellow, PC.red, PC.yellow, PC.blue]} scale={0.55} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行105-106: 惜しい。実に惜しい =====
const NozokiOshiiScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "惜しい" : "実に、惜しい")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <NozokiKun x={960} y={430} scale={2.4} pose="gakkuri" frame={frame} />
        {/* ころがったニセ茶 */}
        <g opacity={a1} transform={`rotate(${22 + v * 10}, 1240, 680)`}>
          <PaintChip x={1240} y={680} color={PC.fakeBrown} scale={1.1} />
        </g>
        <line x1={420} y1={724} x2={1500} y2={724} stroke={SP.dim} strokeWidth={5} />
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 18)}>
            {/* 汗 */}
            <path d="M 700 380 q -10 24 8 26 q 16 0 6 -26 q -6 -14 -14 0 Z" fill={SP.faint} opacity={0.8} />
            <SmallLabel x={620} y={330} text="あと一歩…" color={SP.faint} size={30} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行107-108: 最強の作戦をひらめく =====
const AttackBruteIdeaScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 10);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "最強の作戦、ひらめく" : "片っ端から、試す")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <NozokiKun x={760} y={520} scale={2.2} pose="idea" frame={frame} />
        {v === 1 && (
          <g opacity={a1}>
            <Bubble x={1300} y={260} w={520} h={190} tailTo={[900, 500]}>
              <text x={1300} y={336} textAnchor="middle" fill={SP.ink} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
                ひみつの色なんて、
              </text>
              <text x={1300} y={398} textAnchor="middle" fill={SP.ink} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
                片っ端から試せばいい
              </text>
            </Bubble>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 12色パレット (総当たり用)
const PALETTE = [
  PC.red,
  PC.blue,
  PC.green,
  PC.orange,
  PC.yellow,
  PC.brown,
  "#8A8A94",
  "#B9B9C2",
  "#5A5A64",
  "#D0C9B5",
  "#6E7E8A",
  "#4A4A52",
];

// ===== 行109-111: 総当たり (12色を1色ずつ試す) =====
const BruteForceScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const tried = v === 0 ? Math.min(Math.floor(frame / 26), 2) : v === 1 ? Math.min(2 + Math.floor(frame / 11), 8) : Math.min(5 + Math.floor(frame / 9), 11);
  const current = Math.min(tried, PALETTE.length - 1);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "黄色に混ぜて、見比べる" : v === 1 ? "ちがったら、次の色" : "当たるまで、ぜんぶ試す")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* パレット 4×3 */}
        {PALETTE.map((c, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 430 + col * 130;
          const y = 330 + row * 130;
          const done = i < tried;
          return (
            <g key={i}>
              <PaintChip x={x} y={y} color={c} scale={0.85} opacity={done ? 0.45 : 1} />
              {done && (
                <g stroke={PC.red} strokeWidth={7} strokeLinecap="round">
                  <line x1={x - 26} y1={y - 26} x2={x + 26} y2={y + 26} />
                  <line x1={x - 26} y1={y + 26} x2={x + 26} y2={y - 26} />
                </g>
              )}
              {i === current && !done && (
                <rect x={x - 40} y={y - 40} width={80} height={80} rx={16} fill="none" stroke={SP.ink} strokeWidth={4} />
              )}
            </g>
          );
        })}
        <SmallLabel x={625} y={720} text="ひみつの色の、候補" color={SP.faint} size={28} />
        {/* 中央: 黄+候補を混ぜる */}
        <g>
          <PaintChip x={1000} y={360} color={PC.yellow} scale={0.9} />
          <text x={1090} y={374} textAnchor="middle" fill={SP.ink} fontSize={44} fontWeight={700} fontFamily={SUURI_FONT}>
            +
          </text>
          <PaintChip x={1180} y={360} color={PALETTE[current]} scale={0.9} />
          <MixBowl x={1090} y={560} colorA={PC.yellow} colorB={PALETTE[current]} result={PC.orange} mix={(frame % 26) / 26} frame={frame} scale={1.05} />
        </g>
        {/* 右: 見比べるお手本 */}
        <g>
          <SmallLabel x={1520} y={320} text="見比べる" color={SP.faint} size={28} />
          <PaintChip x={1520} y={420} color={PC.orange} scale={1.1} />
          <SmallLabel x={1520} y={520} text="本物のオレンジ" color={SP.faint} size={24} />
        </g>
        <SmallLabel x={1090} y={740} text={`ためした数: ${tried}`} color={SP.ink} size={32} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== 行112-113: 実は大正解 (赤ハンコ) → 12回で破れる =====
const CorrectStampScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  if (v === 0) {
    // 「大正解」発声に合わせてハンコがドン (tailReveal: prog 0.55 まで出さない)
    const durFrames = Math.max(((scene?.durationSec ?? 6) + 0.35) * fps, 1);
    const stampA = appearAt(frame, fps, Math.round(durFrames * 0.55));
    const s = 2.2 - stampA * 1.2;
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "のぞき見くんの作戦は──"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {/* 背景: 総当たりの紙 */}
          <rect x={560} y={280} width={800} height={440} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} opacity={0.7} />
          <g opacity={0.6}>
            {PALETTE.slice(0, 6).map((c, i) => (
              <PaintChip key={i} x={680 + i * 112} y={400} color={c} scale={0.6} />
            ))}
          </g>
          <SmallLabel x={960} y={520} text="片っ端から、試す作戦" color={SP.faint} size={30} />
          {stampA > 0.01 && (
            <g transform={`translate(960, 560) rotate(-12) scale(${s})`} opacity={stampA}>
              <rect x={-220} y={-80} width={440} height={160} rx={20} fill="none" stroke={PC.red} strokeWidth={12} />
              <text x={0} y={28} textAnchor="middle" fill={PC.red} fontSize={88} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={6}>
                大正解
              </text>
            </g>
          )}
        </svg>
      </Frame>
    );
  }
  // v1: 12色なら12回で必ず破れる
  const count = Math.min(1 + Math.floor(frame / 8), 12);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "12色なら、12回で破れる"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {PALETTE.map((c, i) => {
          const x = 420 + i * 100;
          const done = i < count;
          return (
            <g key={i}>
              <PaintChip x={x} y={420} color={c} scale={0.68} opacity={done && i < count - 1 ? 0.45 : 1} />
              {done && i < 11 && (
                <g stroke={PC.red} strokeWidth={6} strokeLinecap="round" opacity={0.9}>
                  <line x1={x - 20} y1={400} x2={x + 20} y2={440} />
                  <line x1={x - 20} y1={440} x2={x + 20} y2={400} />
                </g>
              )}
              {done && i === 11 && (
                <circle cx={x} cy={420} r={38} fill="none" stroke={SP.ink} strokeWidth={6} />
              )}
            </g>
          );
        })}
        <text x={960} y={620} textAnchor="middle" fill={SP.ink} fontSize={72} fontWeight={800} fontFamily={SUURI_FONT}>
          {count} 回目
        </text>
        <SmallLabel x={960} y={720} text={count >= 12 ? "必ず、当たってしまう" : "1色ずつ、つぶしていく"} color={SP.faint} size={32} />
        {clamp01(prog) > 0.9 && null}
      </svg>
    </Frame>
  );
};

// ===== 行114: 絵の具たちが大ピンチ =====
const PaintPinchScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame } = useProg();
  const sh = (p: number) => Math.sin(frame / 2.6 + p) * 6;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "マジック、大ピンチ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${sh(0)}, 0)`}>
          <PaintTube x={700} y={540} color={PC.yellow} rotate={-10 + sh(1)} scale={1.5} />
        </g>
        <g transform={`translate(${sh(2)}, 0)`}>
          <PaintTube x={960} y={520} color={PC.red} rotate={sh(0) * 0.8} scale={1.6} />
        </g>
        <g transform={`translate(${sh(4)}, 0)`}>
          <PaintTube x={1220} y={540} color={PC.blue} rotate={10 + sh(3)} scale={1.5} />
        </g>
        {/* 汗 */}
        {[
          [640, 380],
          [1020, 360],
          [1290, 390],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M ${x} ${y} q -12 28 10 30 q 20 0 8 -30 q -8 -18 -18 0 Z`}
            fill={SP.faint}
            opacity={0.5 + Math.sin(frame / 6 + i * 2) * 0.3}
          />
        ))}
        <SmallLabel x={960} y={770} text="総当たりには、勝てないの…？" color={SP.faint} size={34} />
      </svg>
    </Frame>
  );
};

// ===== ディスパッチ =====

const MOTIF_MAP: Record<string, React.FC<SceneProps>> = {
  nozoki_three_actors: ThreeActorsScene,
  nozoki_goal_brown: GoalBrownScene,
  nozoki_brown_lock: BrownLockScene,
  nozoki_color_is_key: ColorIsKeyScene,
  nozoki_rule_board: RuleBoardScene,
  nozoki_step_card: StepCardScene,
  nozoki_same_start: SameStartScene,
  nozoki_start_vs_secret: StartVsSecretScene,
  nozoki_memo: NozokiMemoScene,
  nozoki_same_ingredients: SameIngredientsScene,
  nozoki_curry: CurryScene,
  nozoki_hands: NozokiHandsScene,
  nozoki_attack_unmix: AttackUnmixScene,
  nozoki_attack_mixall: AttackMixallScene,
  nozoki_oshii: NozokiOshiiScene,
  nozoki_attack_brute_idea: AttackBruteIdeaScene,
  nozoki_brute_force: BruteForceScene,
  nozoki_correct_stamp: CorrectStampScene,
  nozoki_paint_pinch: PaintPinchScene,
};

export const NOZOKI_CH2_MOTIFS = Object.keys(MOTIF_MAP);

export const NozokiCh2Scene: React.FC<SceneProps & { motif: string }> = ({ scene, variant = 0, motif }) => {
  const C = MOTIF_MAP[motif];
  if (!C) return null;
  return <C scene={scene} variant={variant} />;
};
