// のぞき見くんと絵の具のマジック回: つかみ (行1〜21) + 第1章 (行22〜45) の専用シーン。
// 色の弧 (v2): 第1・2章にも「意味のある色」を適宜入れる。
//   鍵・錠前=PC.gold / 机・木箱=PC.wood / 手紙・封筒=PC.paper / 空・地球=PC.sky /
//   禁止・強調=赤 / カード=PC.blue / サーバーLED=PC.green+PC.yellow。
// 無意味な全面カラフル化はしない (彩度控えめ・上品はそのまま)。
// 第3章の「モノクロに戻る」演出は NozokiCh3.tsx 側で維持する (このファイルの色方針とは独立)。
// 行45「絵の具なら。」が全編カラーの開始点なので、それ以前に絵の具チューブの中身カラーを安売りしない。

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
  Person,
  appearAt,
} from "./parts";
import { PC, PaintTube, NozokiKun, easeInOut, clamp01 } from "./NozokiScenes";

type SceneProps = { scene?: Scene; variant?: number };

// シーン進行 0→1 (音声+余白の全体に対する進み)
const useProg = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, progOf: (durationSec?: number) => clamp01(frame / Math.max(((durationSec ?? 6) + 0.35) * fps, 1)) };
};

// ===== 小さな共通部品 (この回のつかみ・第1章用) =====

// 封筒 (ひみつのメモ。紙=PC.paper、折り目は濃いめの紙色で描く)
const PAPER_EDGE = "#8F8468"; // 紙の折り目・ふちの線 (PC.paper を暗くした色)
const Envelope: React.FC<{ x: number; y: number; scale?: number; open?: boolean; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  open = false,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <rect x={-34} y={-22} width={68} height={44} rx={6} fill={PC.paper} stroke={PAPER_EDGE} strokeWidth={4} />
    {open ? (
      <g>
        {/* 開いたフタ */}
        <path d="M -34 -22 L 0 -52 L 34 -22" fill={PC.paper} stroke={PAPER_EDGE} strokeWidth={4} strokeLinejoin="round" />
        {/* 中の紙 */}
        <rect x={-24} y={-38} width={48} height={30} rx={4} fill={SP.ink} />
      </g>
    ) : (
      <path d="M -34 -22 L 0 4 L 34 -22" fill="none" stroke={PAPER_EDGE} strokeWidth={4} strokeLinejoin="round" />
    )}
  </g>
);

// 鍵 (持ち手の輪+軸+歯)
export const KeyIcon: React.FC<{ x: number; y: number; scale?: number; color?: string; rotate?: number; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  color = SP.line,
  rotate = 0,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
    <circle cx={-34} cy={0} r={20} fill="none" stroke={color} strokeWidth={8} />
    <line x1={-14} y1={0} x2={52} y2={0} stroke={color} strokeWidth={8} strokeLinecap="round" />
    <line x1={28} y1={0} x2={28} y2={18} stroke={color} strokeWidth={8} strokeLinecap="round" />
    <line x1={46} y1={0} x2={46} y2={22} stroke={color} strokeWidth={8} strokeLinecap="round" />
  </g>
);

// 錠前 (ツル+胴)
export const LockPad: React.FC<{ x: number; y: number; scale?: number; color?: string; opacity?: number; openShackle?: boolean }> = ({
  x,
  y,
  scale = 1,
  color = SP.line,
  opacity = 1,
  openShackle = false,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <path
      d={openShackle ? "M -20 -18 Q -20 -52 8 -52 Q 34 -52 34 -30" : "M -20 -18 Q -20 -52 0 -52 Q 20 -52 20 -18"}
      fill="none"
      stroke={color}
      strokeWidth={8}
    />
    <rect x={-32} y={-18} width={64} height={52} rx={10} fill={SP.panel} stroke={color} strokeWidth={6} />
    <circle cx={0} cy={4} r={7} fill={color} />
    <line x1={0} y1={8} x2={0} y2={20} stroke={color} strokeWidth={6} strokeLinecap="round" />
  </g>
);

// 箱 (フタつき)
const BoxIcon: React.FC<{ x: number; y: number; scale?: number; lidOpen?: number; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  lidOpen = 0,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {/* 胴 (木箱=PC.wood) */}
    <rect x={-90} y={-40} width={180} height={110} rx={10} fill={PC.wood} stroke={SP.line} strokeWidth={5} />
    {/* 板の継ぎ目 (木箱らしさ) */}
    <line x1={-90} y1={14} x2={90} y2={14} stroke={SP.background} strokeWidth={3} opacity={0.35} />
    {/* フタ (lidOpen 0=閉 1=全開) */}
    <g transform={`translate(-98, -40) rotate(${-lidOpen * 70})`}>
      <rect x={0} y={-26} width={196} height={26} rx={8} fill={PC.wood} stroke={SP.line} strokeWidth={5} />
    </g>
  </g>
);

// サーバー (縦長の機械)
const ServerBox: React.FC<{ x: number; y: number; scale?: number; frame?: number; eye?: boolean; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  frame = 0,
  eye = false,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {/* 筐体 (わずかに青みの鉄色) */}
    <rect x={-40} y={-66} width={80} height={132} rx={10} fill="#171A22" stroke={SP.line} strokeWidth={4.5} />
    <line x1={-26} y1={-34} x2={26} y2={-34} stroke={SP.dim} strokeWidth={5} />
    <line x1={-26} y1={-8} x2={26} y2={-8} stroke={SP.dim} strokeWidth={5} />
    {/* LED: 緑と黄が交互に点滅 */}
    <circle cx={8} cy={34} r={5.5} fill={Math.floor(frame / 14) % 2 === 0 ? PC.green : SP.dim} />
    <circle cx={25} cy={34} r={5.5} fill={Math.floor(frame / 14) % 2 === 0 ? SP.dim : PC.yellow} />
    {eye && (
      <g>
        {/* のぞき見の目玉 (赤) */}
        <path d="M -24 -48 Q 0 -66 24 -48 Q 0 -30 -24 -48 Z" fill={SP.background} stroke={SP.accent} strokeWidth={4} />
        <circle cx={0} cy={-48} r={7} fill={SP.accent} />
      </g>
    )}
  </g>
);

// 教室の机 (座っている頭つき。天板=PC.wood)
const WOOD_LITE = "#B39060"; // 木の明るい色 (ラベルなど、暗背景で読める木系)
const Desk: React.FC<{ x: number; y: number; opacity?: number; you?: boolean; mark?: boolean }> = ({
  x,
  y,
  opacity = 1,
  you = false,
  mark = false,
}) => (
  <g transform={`translate(${x}, ${y})`} opacity={opacity}>
    <circle cx={0} cy={-36} r={13} fill={you ? SP.ink : "none"} stroke={you ? SP.ink : SP.dim} strokeWidth={4} />
    <rect x={-46} y={-18} width={92} height={46} rx={7} fill={PC.wood} stroke={you || mark ? SP.line : SP.dim} strokeWidth={4} />
  </g>
);

// 教室グリッドの座標 (6列×5行)。窓ぎわ=左、ろうか側=右
const deskX = (col: number) => 560 + col * 170;
const deskY = (row: number) => 300 + row * 112;
const YOU_COL = 0;
const YOU_ROW = 2;
const GOAL_COL = 5;
const GOAL_ROW = 0;

// 窓 (左の縦長フレーム2枚。外は空=PC.sky)
const Windows: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g opacity={opacity}>
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={398} y={282 + i * 240} width={56} height={200} rx={6} fill={PC.sky} fillOpacity={0.3} stroke={PC.sky} strokeWidth={4} />
        <line x1={398} y1={382 + i * 240} x2={454} y2={382 + i * 240} stroke={PC.sky} strokeWidth={3} opacity={0.7} />
      </g>
    ))}
    <SmallLabel x={426} y={252} text="窓" color={PC.sky} size={26} />
  </g>
);

// 赤い×
const CrossX: React.FC<{ x: number; y: number; size?: number; color?: string; opacity?: number; sw?: number }> = ({
  x,
  y,
  size = 44,
  color = SP.accent,
  opacity = 1,
  sw = 10,
}) => (
  <g opacity={opacity} stroke={color} strokeWidth={sw} strokeLinecap="round">
    <line x1={x - size} y1={y - size} x2={x + size} y2={y + size} />
    <line x1={x - size} y1={y + size} x2={x + size} y2={y - size} />
  </g>
);

// 背面の薄い地球 (ネット系シーン共通: 「世界中のネットの話」感を出す。前景の邪魔をしない薄さ)
const GlobeBack: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g opacity={opacity * 0.18} stroke={PC.sky} fill="none" strokeWidth={3}>
    <circle cx={960} cy={540} r={430} />
    {/* 緯線 */}
    <line x1={530} y1={540} x2={1390} y2={540} />
    <ellipse cx={960} cy={540} rx={430} ry={160} opacity={0.8} />
    <path d="M 585 310 Q 960 420 1335 310" opacity={0.8} />
    <path d="M 585 770 Q 960 660 1335 770" opacity={0.8} />
    {/* 経線 */}
    <ellipse cx={960} cy={540} rx={160} ry={430} opacity={0.8} />
    <ellipse cx={960} cy={540} rx={310} ry={430} opacity={0.6} />
  </g>
);

// ===== つかみ =====

// 行1-2: 教室俯瞰 → あなたの席が点灯
const ClassroomScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const youA = v === 0 ? 0 : appearAt(frame, fps, 10);
  const pulse = 0.5 + Math.sin(frame / 7) * 0.5;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "想像してください" : "あなたは、窓ぎわの席")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Windows />
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 6 }).map((__, col) => {
            const isYou = col === YOU_COL && row === YOU_ROW;
            return (
              <g key={`${row}-${col}`} opacity={appearAt(frame, fps, 4 + row * 4 + col * 2)}>
                <Desk x={deskX(col)} y={deskY(row)} you={isYou && v === 1} />
              </g>
            );
          }),
        )}
        <SmallLabel x={1700} y={530} text="ろうか" color={WOOD_LITE} size={26} />
        {v === 1 && (
          <g opacity={youA}>
            <rect
              x={deskX(YOU_COL) - 62}
              y={deskY(YOU_ROW) - 66}
              width={124}
              height={104}
              rx={12}
              fill="none"
              stroke={SP.accent}
              strokeWidth={5}
              opacity={0.5 + pulse * 0.5}
            />
            <SmallLabel x={deskX(YOU_COL)} y={deskY(YOU_ROW) + 78} text="あなた" color={SP.ink} size={32} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行3-4: メモ+点線ルート (封筒が机伝いに移動) → 立ち上がった瞬間に禁止マーク
const MemoPlanScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const routeT = easeInOut(clamp01((prog - 0.15) / 0.5));
  // ルート: あなたの席 → 右端まで横断 → いちばん向こうへ
  const x0 = deskX(YOU_COL);
  const y0 = deskY(YOU_ROW) - 60;
  const x1 = deskX(GOAL_COL);
  const y1 = deskY(GOAL_ROW) - 60;
  const routeLen = 1800;
  const a1 = appearAt(frame, fps, 8);
  // 封筒が点線ルート (二次曲線 Q 960 170) の上を机伝いに進む (v0 のみ)
  const et = v === 0 ? routeT : 0;
  const ex = (1 - et) * (1 - et) * x0 + 2 * (1 - et) * et * 960 + et * et * x1;
  const ey = (1 - et) * (1 - et) * y0 + 2 * (1 - et) * et * 170 + et * et * y1;
  // v1: 座った状態から立ち上がる → 立ちきった瞬間に禁止マークがポン
  const totalFrames = ((scene?.durationSec ?? 6) + 0.35) * fps;
  const standT = easeInOut(clamp01((prog - 0.14) / 0.2));
  const banA = appearAt(frame, fps, Math.round(totalFrames * 0.36));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "いちばん向こうの席へ" : "机から立つのは、禁止")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Windows opacity={0.6} />
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 6 }).map((__, col) => (
            <Desk
              key={`${row}-${col}`}
              x={deskX(col)}
              y={deskY(row)}
              opacity={0.55}
              you={col === YOU_COL && row === YOU_ROW}
              mark={col === GOAL_COL && row === GOAL_ROW}
            />
          )),
        )}
        <SmallLabel x={deskX(YOU_COL)} y={deskY(YOU_ROW) + 78} text="あなた" color={SP.ink} size={30} weight={700} />
        <g opacity={a1}>
          <rect x={x1 - 60} y={y1 + 36} width={120} height={66} rx={10} fill="none" stroke={SP.line} strokeWidth={4} />
          <SmallLabel x={x1} y={y1 + 130} text="届けたい席" color={SP.ink} size={30} weight={700} />
        </g>
        {/* 点線ルート (描かれていく) */}
        <path
          d={`M ${x0} ${y0} Q 960 170 ${x1} ${y1}`}
          fill="none"
          stroke={SP.line}
          strokeWidth={5}
          strokeDasharray="14 16"
          strokeDashoffset={routeLen * (1 - routeT)}
          pathLength={routeLen}
          opacity={0.9}
        />
        <Envelope x={ex} y={ey - 10} scale={0.9} opacity={a1} />
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 10)}>
            {/* 座った状態 (standT=0) → 立ち上がる (standT=1) */}
            <Person x={960} y={452 - standT * 104} scale={2.2} color={SP.line} />
            {/* 自分の机 (人の手前。立つと体が机の上に出る) */}
            <rect x={858} y={520} width={204} height={88} rx={10} fill={PC.wood} stroke={SP.line} strokeWidth={5} />
            {/* 立ちきった瞬間、赤い禁止マーク (円+斜線) がポンと出る */}
            <g opacity={banA} transform={`translate(960, 440) scale(${0.5 + Math.min(banA, 1) * 0.5})`}>
              <circle cx={0} cy={0} r={150} fill="none" stroke={PC.red} strokeWidth={12} />
              <line x1={-104} y1={104} x2={104} y2={-104} stroke={PC.red} strokeWidth={12} strokeLinecap="round" />
            </g>
            <SmallLabel x={960} y={700} text="立つの禁止" color={PC.red} size={36} weight={800} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行5: 30人の手から手へ (0.3秒間隔の連打感)
const MemoRelayScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const n = 10; // 画面に出すのは10人 (「…30人」のラベルで補う)
  const xs = Array.from({ length: n }, (_, i) => 300 + i * 148);
  const hop = 9; // 0.3秒間隔
  const idxRaw = frame / hop;
  const idx = Math.min(Math.floor(idxRaw), n - 2);
  const t = clamp01(idxRaw - idx);
  const mx = xs[idx] + (xs[idx + 1] - xs[idx]) * easeInOut(t);
  const my = 420 - Math.sin(t * Math.PI) * 60;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "30人の手から、手へ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {xs.map((x, i) => (
          <g key={i} opacity={appearAt(frame, fps, 2 + i * 2)}>
            {/* 右端=あいて (白塗りで目立たせる) */}
            <Person x={x} y={560} scale={1.5} color={i === 0 || i === n - 1 ? SP.ink : SP.line} fill={i === 0 || i === n - 1} />
            {/* 受け渡しの手 (渡し中の人だけ腕が上がる) */}
            {(i === idx || i === idx + 1) && (
              <path
                d={`M ${x} 600 Q ${x + (i === idx ? 40 : -40)} 530 ${x + (i === idx ? 62 : -62)} 470`}
                fill="none"
                stroke={SP.line}
                strokeWidth={6}
                strokeLinecap="round"
              />
            )}
          </g>
        ))}
        <SmallLabel x={300} y={700} text="あなた" color={SP.ink} size={30} weight={700} />
        <SmallLabel x={xs[n - 1]} y={700} text="あいて" color={SP.ink} size={30} weight={700} />
        {/* 「…30人」は人と被らない下方へ */}
        <SmallLabel x={960} y={780} text="あいだに…30人" color={SP.ink} size={38} weight={800} />
        <Envelope x={mx} y={my} scale={0.95} />
      </svg>
    </Frame>
  );
};

// 行6: 途中の1人がこっそり開く (目線=赤)
const MemoPeekScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const xs = Array.from({ length: 10 }, (_, i) => 300 + i * 148);
  const peekI = 4;
  const a1 = appearAt(frame, fps, 10);
  const a2 = appearAt(frame, fps, 26);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "途中で、こっそり読む人"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {xs.map((x, i) => (
          <Person key={i} x={x} y={560} scale={1.5} color={i === peekI ? SP.ink : SP.dim} fill={i === peekI} />
        ))}
        {/* 開いたメモを頭上にかかげる */}
        <g opacity={a1}>
          <path d={`M ${xs[peekI] - 30} 540 Q ${xs[peekI] - 52} 490 ${xs[peekI] - 40} 440`} fill="none" stroke={SP.ink} strokeWidth={6} strokeLinecap="round" />
          <Envelope x={xs[peekI]} y={412} scale={1.25} open />
        </g>
        {/* まわりの数人ものぞき込む (赤い目線) */}
        <g opacity={a2} stroke={SP.accent} strokeWidth={4} strokeDasharray="8 10">
          <line x1={xs[peekI - 1]} y1={540} x2={xs[peekI] - 24} y2={420} />
          <line x1={xs[peekI + 1]} y1={540} x2={xs[peekI] + 24} y2={420} />
          <line x1={xs[peekI + 2]} y1={544} x2={xs[peekI] + 40} y2={432} />
        </g>
        <SmallLabel x={xs[peekI]} y={330} text="こっそり" color={SP.accent} size={34} weight={800} />
      </svg>
    </Frame>
  );
};

// 行7-8: 吹き出しが教室中に連鎖拡散 → あなた真っ白
const MemoSpreadScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  // うわさの吹き出し (灰色)。あなたの席から遠い席ほど遅れて出る
  const bubbles: Array<[number, number, number]> = [];
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 6; col++) {
      if (col === YOU_COL && row === YOU_ROW) continue;
      const dist = Math.abs(col - YOU_COL) + Math.abs(row - YOU_ROW);
      bubbles.push([deskX(col), deskY(row), dist]);
    }
  const maxDelay = v === 0 ? 7 : 3;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "昼休みの教室" : "学年中に、知れわたる")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 6 }).map((__, col) => (
            <Desk key={`${row}-${col}`} x={deskX(col)} y={deskY(row)} opacity={0.45} you={col === YOU_COL && row === YOU_ROW} />
          )),
        )}
        {bubbles.map(([x, y, dist], i) => {
          const a = appearAt(frame, fps, 6 + dist * maxDelay + (i % 3) * 2);
          // 「はい、もうおわかりですね。」(v0) は吹き出しの内側を暗めの緑に (点の可読性は保つ)
          const bubbleFill = v === 0 ? "#2E5940" : SP.dim;
          return (
            <g key={i} opacity={a * 0.9}>
              <rect x={x - 34} y={y - 92} width={68} height={40} rx={14} fill={bubbleFill} />
              <path d={`M ${x - 8} ${y - 52} L ${x} ${y - 40} L ${x + 8} ${y - 52} Z`} fill={bubbleFill} />
              {[-14, 0, 14].map((dx) => (
                <circle key={dx} cx={x + dx} cy={y - 72} r={4.5} fill={SP.ink} />
              ))}
            </g>
          );
        })}
        {/* あなた、四つんばいで落ち込む (orz。KirakiraScenes の OrzScene のパスを流用) */}
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 18)}>
            <g transform="translate(370, 790) scale(0.75) translate(-950, -700)">
              {/* 床の影 */}
              <ellipse cx={960} cy={766} rx={260} ry={14} fill={SP.ink} opacity={0.08} />
              <g stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* 頭 (床近くまでうなだれる) */}
                <circle cx={792} cy={694} r={32} />
                {/* 腕 2本 (肩から床へ、手をつく) */}
                <path d="M 824 712 Q 828 736 822 756" />
                <path d="M 798 722 Q 792 742 784 756" />
                {/* 背中 (首から腰まで、丸い一本の弧) */}
                <path d="M 818 680 Q 900 606 990 616 Q 1056 624 1072 672" />
                {/* もも と すね */}
                <path d="M 1072 672 Q 1082 716 1046 752 L 1172 752" />
                <path d="M 1086 692 Q 1096 726 1068 756 L 1186 744" />
              </g>
              {/* どんより (頭上から垂れる縦線) */}
              <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round">
                <line x1={742} y1={586} x2={742} y2={634} />
                <line x1={782} y1={570} x2={782} y2={626} />
                <line x1={822} y1={580} x2={822} y2={630} />
                <line x1={860} y1={598} x2={860} y2={638} />
              </g>
            </g>
            <SmallLabel x={300} y={650} text="はぁ…" color={SP.faint} size={34} />
            <SmallLabel x={370} y={880} text="あなた" color={SP.ink} size={28} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行9: 教室の机がサーバーの図にモーフ
const ClassToNetScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const t = easeInOut(clamp01((prog - 0.22) / 0.42));
  const xs = Array.from({ length: 6 }, (_, i) => 560 + i * 170);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "インターネットも、同じ仕組み"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* ネットの絵に変わるのに合わせて、背面に薄い地球 */}
        <GlobeBack opacity={t} />
        {/* 教室 (消えていく) */}
        <g opacity={1 - t}>
          {Array.from({ length: 3 }).map((_, row) =>
            xs.map((x, col) => <Desk key={`${row}-${col}`} x={x} y={360 + row * 140} />),
          )}
        </g>
        {/* サーバー (現れる) */}
        <g opacity={t}>
          {xs.map((x, i) => (
            <ServerBox key={i} x={x} y={500} frame={frame + i * 6} />
          ))}
          {xs.slice(0, -1).map((x, i) => (
            <line key={i} x1={x + 44} y1={500} x2={xs[i + 1] - 44} y2={500} stroke={SP.dim} strokeWidth={4} />
          ))}
        </g>
        <g opacity={1 - t}>
          <SmallLabel x={960} y={760} text="教室" color={SP.faint} size={34} />
        </g>
        <g opacity={t}>
          <SmallLabel x={960} y={760} text="インターネット" color={SP.ink} size={34} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// サーバーの列 (カードリレー系の共通配置)
const SERVER_XS = Array.from({ length: 8 }, (_, i) => 350 + i * 175);
const SERVER_Y = 520;

// カード (PC.blue の実物カラー)
const BlueCard: React.FC<{ x: number; y: number; scale?: number; lock?: boolean; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  lock = false,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <rect x={-52} y={-34} width={104} height={68} rx={10} fill={PC.blue} stroke={SP.line} strokeWidth={4} />
    <line x1={-52} y1={-14} x2={52} y2={-14} stroke={SP.ink} strokeWidth={8} opacity={0.85} />
    <g fill={SP.ink} opacity={0.9}>
      {[-36, -20, -4, 12].map((dx) => (
        <rect key={dx} x={dx} y={6} width={10} height={6} rx={2} />
      ))}
    </g>
    {lock && (
      <g transform="translate(34, -32)">
        <circle r={20} fill={SP.ink} />
        <path d="M -7 -2 Q -7 -12 0 -12 Q 7 -12 7 -2" fill="none" stroke={SP.background} strokeWidth={4} />
        <rect x={-9} y={-2} width={18} height={14} rx={3} fill={SP.background} />
      </g>
    )}
  </g>
);

// 行10-11: カード番号がサーバーを渡る (+10台以上)
const CardRelayScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const hop = 11;
  const idxRaw = frame / hop;
  const idx = Math.min(Math.floor(idxRaw), SERVER_XS.length - 2);
  const t = clamp01(idxRaw - idx);
  const mx = SERVER_XS[idx] + (SERVER_XS[idx + 1] - SERVER_XS[idx]) * easeInOut(t);
  const my = SERVER_Y - 130 - Math.sin(t * Math.PI) * 44;
  const count = Math.min(idx + 1, SERVER_XS.length);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "カード番号の、バケツリレー" : "その数、10台以上")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <GlobeBack />
        {SERVER_XS.map((x, i) => (
          <g key={i} opacity={appearAt(frame, fps, 2 + i * 2)}>
            <ServerBox x={x} y={SERVER_Y} frame={frame + i * 7} />
          </g>
        ))}
        <SmallLabel x={240} y={420} text="あなた" color={SP.ink} size={30} weight={700} />
        <Person x={240} y={470} scale={1.6} color={SP.ink} fill />
        <SmallLabel x={1690} y={420} text="お店" color={SP.ink} size={30} weight={700} />
        <Person x={1690} y={470} scale={1.6} color={SP.line} />
        <BlueCard x={mx} y={my} />
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 8)}>
            <text x={960} y={282} textAnchor="middle" fill={SP.ink} fontSize={58} fontWeight={800} fontFamily={SUURI_FONT}>
              {count}台目…
            </text>
            <SmallLabel x={960} y={336} text="ときには10台以上" color={SP.faint} size={30} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行12: 途中の機械に目玉 (のぞき見の予感)
const PeekServersScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const eyed = [2, 4, 6];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "のぞくことも、できてしまう"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <GlobeBack />
        {SERVER_XS.map((x, i) => (
          <g key={i}>
            <ServerBox x={x} y={SERVER_Y} frame={frame + i * 7} />
            {eyed.includes(i) && (
              <g opacity={appearAt(frame, fps, 12 + eyed.indexOf(i) * 10)}>
                <path d={`M ${x - 26} ${SERVER_Y - 118} Q ${x} ${SERVER_Y - 140} ${x + 26} ${SERVER_Y - 118} Q ${x} ${SERVER_Y - 96} ${x - 26} ${SERVER_Y - 118} Z`} fill={SP.background} stroke={SP.accent} strokeWidth={4.5} />
                <circle cx={x} cy={SERVER_Y - 118} r={8} fill={SP.accent} />
              </g>
            )}
          </g>
        ))}
        <BlueCard x={960} y={SERVER_Y - 170} scale={0.9} />
        <SmallLabel x={960} y={770} text="途中の機械が、中身をのぞける" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行13-14: 鍵マークつきカードが無事に届く
const CardSafeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const t = v === 0 ? easeInOut(clamp01((prog - 0.1) / 0.75)) : 1;
  const x0 = SERVER_XS[0];
  const x1 = SERVER_XS[SERVER_XS.length - 1] + 160;
  const mx = x0 + (x1 - x0) * t;
  const a1 = appearAt(frame, fps, v === 0 ? 4 : 8);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "なのに、盗まれない" : "ひみつは、無事に届く")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <GlobeBack />
        {SERVER_XS.map((x, i) => (
          <g key={i}>
            <ServerBox x={x} y={SERVER_Y} frame={frame + i * 7} eye={i % 2 === 0} />
          </g>
        ))}
        <BlueCard x={mx} y={SERVER_Y - 170} lock opacity={a1} />
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 16)}>
            <g stroke={SP.ink} strokeWidth={5} strokeLinecap="round">
              <line x1={x1 - 70} y1={SERVER_Y - 250} x2={x1 - 54} y2={SERVER_Y - 234} />
              <line x1={x1 + 70} y1={SERVER_Y - 250} x2={x1 + 54} y2={SERVER_Y - 234} />
              <line x1={x1} y1={SERVER_Y - 272} x2={x1} y2={SERVER_Y - 252} />
            </g>
            <SmallLabel x={x1} y={SERVER_Y - 64} text="無事到着" color={SP.ink} size={34} weight={800} />
          </g>
        )}
        <SmallLabel x={960} y={770} text="のぞかれ放題の道なのに、なぜ？" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行15: シルクハットから絵の具チューブがチラ見え (カラー予告)
const MagicTubeScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const rise = appearAt(frame, fps, 14);
  const bob = Math.sin(frame / 9) * 5;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "タネは、絵の具"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 逆さシルクハット: 開口部の楕円が上、つばが下 */}
        <defs>
          <clipPath id="hatmouth">
            {/* 開口部 (y=470) より上だけ見える */}
            <rect x={700} y={140} width={520} height={330} />
          </clipPath>
        </defs>
        {/* つば (いちばん下) */}
        <ellipse cx={960} cy={700} rx={235} ry={42} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
        {/* 胴 (上が開口部で広く、下すぼまり) */}
        <path d="M 788 470 L 836 688 L 1084 688 L 1132 470" fill={SP.panel} stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
        {/* 帯 (逆さなのでつば寄り) */}
        <rect x={846} y={636} width={228} height={22} fill={SP.dim} />
        {/* 開口部の奥 (暗い穴) */}
        <ellipse cx={960} cy={470} rx={172} ry={38} fill={SP.background} stroke={SP.line} strokeWidth={5} />
        {/* 中から出てくる絵の具チューブ */}
        <g clipPath="url(#hatmouth)">
          <PaintTube x={880} y={600 - rise * 170 + bob} color={PC.yellow} rotate={-10} scale={1.1} />
          <PaintTube x={960} y={580 - rise * 190 - bob} color={PC.red} scale={1.15} />
          <PaintTube x={1040} y={600 - rise * 170 + bob} color={PC.blue} rotate={10} scale={1.1} />
        </g>
        {/* 開口部の手前のふち (チューブの根元をかくす) */}
        <path d="M 788 470 A 172 38 0 0 0 1132 470" fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        <SmallLabel x={960} y={800} text="今日はこのタネを、ぜんぶ見せます" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行16-17: おみやげ箱 (木箱+リボン=PC.yellow)。フタが開いて中身が gold に輝く
const OmiyageBoxScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const by = 560;
  // フタが開く (v0 は中盤から、v1 は最初から開いている)
  const lid = v === 0 ? easeInOut(clamp01((prog - 0.42) / 0.25)) : 1;
  const sparkle = (sx: number, sy: number, s: number, ph: number) => (
    <g
      transform={`translate(${sx}, ${sy}) scale(${s * (0.7 + Math.sin(frame / 7 + ph) * 0.3)})`}
      opacity={lid * (0.55 + Math.sin(frame / 7 + ph) * 0.45)}
      stroke={PC.gold}
      strokeWidth={4}
      strokeLinecap="round"
    >
      <line x1={-14} y1={0} x2={14} y2={0} />
      <line x1={0} y1={-14} x2={0} y2={14} />
    </g>
  );
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "暗号より大きな、おみやげ" : "「考え方」そのもの")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960, ${by}) scale(${0.8 + a1 * 0.2})`} opacity={a1}>
          {/* 開いた口からの gold の放射光 (v0 のみ。v1 は電球側が輝くので文字と被る光は出さない) */}
          {v === 0 && (
            <g opacity={lid}>
              <path d="M -144 -70 L -230 -310 L 230 -310 L 144 -70 Z" fill={PC.gold} opacity={0.14} />
              <g stroke={PC.gold} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
                <line x1={-112} y1={-96} x2={-176} y2={-250} />
                <line x1={-44} y1={-104} x2={-66} y2={-276} />
                <line x1={0} y1={-110} x2={0} y2={-292} />
                <line x1={44} y1={-104} x2={66} y2={-276} />
                <line x1={112} y1={-96} x2={176} y2={-250} />
              </g>
            </g>
          )}
          {/* 箱の胴 (木箱) */}
          <rect x={-150} y={-70} width={300} height={190} rx={10} fill={PC.wood} stroke={SP.line} strokeWidth={6} />
          {/* 胴側のリボン */}
          <rect x={-26} y={-64} width={52} height={184} fill={PC.yellow} />
          {/* フタ (左端を支点に開く)。リボンとちょうむすびはフタと一緒に動く。
              v1 は最初から全開なので、真上 (タイトル・電球と被る) ではなく左横にパタンと倒す */}
          <g transform={`rotate(${v === 1 ? -180 : -lid * 74} -168 -88)`}>
            <rect x={-168} y={-112} width={336} height={48} rx={10} fill={PC.wood} stroke={SP.line} strokeWidth={6} />
            <rect x={-26} y={-112} width={52} height={48} fill={PC.yellow} />
            <rect x={-168} y={-98} width={336} height={22} fill={PC.yellow} />
            {/* ちょうむすび */}
            <path d="M -8 -118 Q -74 -168 -58 -122 Q -50 -104 -8 -112 Z" fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
            <path d="M 8 -118 Q 74 -168 58 -122 Q 50 -104 8 -112 Z" fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
            <circle cx={0} cy={-116} r={14} fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
          </g>
          {/* キラキラ */}
          {sparkle(-200, -230, 1, 0)}
          {sparkle(205, -215, 0.9, 2.2)}
          {sparkle(v === 0 ? 0 : -120, v === 0 ? -330 : -300, 1.15, 4.1)}
        </g>
        <SmallLabel x={960} y={810} text="おみやげ" color={SP.ink} size={34} weight={700} />
        {v === 1 && (
          <g opacity={a2}>
            {/* 電球 (中身=考え方。光の中に浮かぶ) */}
            <g transform="translate(960, 300)">
              <circle r={66} fill={PC.gold} opacity={0.18} />
              <circle r={52} fill="none" stroke={PC.gold} strokeWidth={5} strokeDasharray="10 10" />
              <rect x={-18} y={46} width={36} height={18} rx={5} fill="none" stroke={SP.line} strokeWidth={4} />
              <text x={0} y={16} textAnchor="middle" fill={SP.ink} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
                ?
              </text>
            </g>
            <SmallLabel x={960} y={420} text="行きづまった問題を解く「考え方」" color={SP.faint} size={30} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行21 / 行62: 幕が上がる (v0=開演 / v1=マジック開始)
const MagicCurtainScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const open = easeInOut(clamp01((prog - 0.12) / 0.55));
  const slide = open * 560;
  const folds = [0, 60, 120, 180, 240, 300, 360, 420, 480];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "それでは、開演" : "マジック、開始")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 舞台 */}
        <line x1={240} y1={790} x2={1680} y2={790} stroke={SP.line} strokeWidth={6} />
        <ellipse cx={960} cy={780} rx={330} ry={34} fill={SP.panel} opacity={0.8} />
        {v === 1 && (
          <g opacity={clamp01((open - 0.4) / 0.4)}>
            <Person x={760} y={600} scale={2} color={SP.ink} fill />
            <Person x={1160} y={600} scale={2} color={SP.line} />
            <SmallLabel x={760} y={760} text="あなた" color={SP.faint} size={28} />
            <SmallLabel x={1160} y={760} text="お店" color={SP.faint} size={28} />
          </g>
        )}
        {/* 左右の幕 (赤)。開くほど左右へスライド */}
        {[-1, 1].map((dir) => (
          <g key={dir} transform={`translate(${dir === -1 ? -slide : slide}, 0)`}>
            <rect x={dir === -1 ? 180 : 960} y={200} width={780} height={620} fill={SP.accent} opacity={0.92} />
            {folds.map((f) => (
              <line
                key={f}
                x1={(dir === -1 ? 220 : 1000) + f}
                y1={210}
                x2={(dir === -1 ? 220 : 1000) + f}
                y2={810}
                stroke={SP.background}
                strokeWidth={10}
                opacity={0.25}
              />
            ))}
          </g>
        ))}
        {/* 上の幕 (飾り) */}
        <rect x={180} y={170} width={1560} height={70} rx={14} fill={SP.accent} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M ${180 + i * 223} 240 Q ${291 + i * 223} 320 ${403 + i * 223} 240`} fill={SP.accent} opacity={0.85} />
        ))}
      </svg>
    </Frame>
  );
};

// ===== 第1章 =====

// 行23-25: 箱+錠前 (v0 道具立て / v1 鍵をかける / v2 途中の人は開けられない)
const BoxLockScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 3;
  const prog = progOf(scene?.durationSec);
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 30);
  if (v === 2) {
    // 途中の人が開けようとして開けられない
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "途中の人は、開けられない"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <Person x={700} y={420} scale={2.4} color={SP.line} />
          {/* 引っぱる腕 */}
          <path d={`M 740 540 Q 820 560 ${880 + Math.sin(frame / 4) * 6} 580`} fill="none" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
          <g transform={`translate(${Math.sin(frame / 4) * 5}, 0)`}>
            <BoxIcon x={1060} y={560} scale={1.1} />
            <LockPad x={1060} y={520} scale={1.05} color={PC.gold} />
          </g>
          <g opacity={a2}>
            <g stroke={SP.ink} strokeWidth={9} strokeLinecap="round">
              <line x1={1240} y1={360} x2={1340} y2={460} />
              <line x1={1240} y1={460} x2={1340} y2={360} />
            </g>
            <SmallLabel x={1290} y={530} text="開けられない" color={SP.ink} size={32} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  const lidT = v === 1 ? 1 - easeInOut(clamp01((prog - 0.25) / 0.3)) : 0;
  const envY = v === 1 ? 300 + easeInOut(clamp01(prog / 0.28)) * 190 : 300;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "大昔からの、守り方" : "箱に入れて、鍵をかける")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {v === 1 && <Envelope x={960} y={envY} scale={1.1} opacity={1 - clamp01((prog - 0.26) / 0.08)} />}
        <g opacity={a1}>
          <BoxIcon x={960} y={560} scale={1.5} lidOpen={v === 1 ? lidT : 0} />
        </g>
        <LockPad x={960} y={506} scale={1.3} color={PC.gold} opacity={v === 0 ? a2 : appearAt(frame, fps, Math.round(0.62 * ((scene?.durationSec ?? 6) + 0.35) * fps))} />
        <SmallLabel x={960} y={790} text={v === 0 ? "箱と、錠前" : "ガチャリ"} color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行26-27: めでたしの飾り+紙吹雪 → 赤スタンプ「とは、いきません」(v0) / 受け取った人も開けられない (v1)
const BoxStuckScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const pulse = 1 + Math.sin(frame / 8) * 0.06;
  if (v === 0) {
    // 前半: お祝いムード全開 → セリフ後半で赤いスタンプが斜めにドン (先に見えるとネタバレなので必ず後半)
    const totalFrames = ((scene?.durationSec ?? 6) + 0.35) * fps;
    const stampA = appearAt(frame, fps, Math.round(totalFrames * 0.58));
    const confColors = [PC.yellow, PC.green, PC.blue, PC.orange, PC.paper];
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "めでたし……とは、いかない"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {/* 紙吹雪 (控えめ多色・ゆっくり舞う) */}
          {Array.from({ length: 18 }).map((_, i) => {
            const cx0 = 340 + ((i * 173) % 1240);
            const t = ((frame * 1.1 + i * 41) % 140) / 140;
            const cy = 180 + t * 630;
            const sway = Math.sin(frame / 12 + i) * 24;
            return (
              <rect
                key={i}
                x={cx0 + sway}
                y={cy}
                width={15}
                height={9}
                rx={2}
                fill={confColors[i % confColors.length]}
                opacity={0.5}
                transform={`rotate(${frame * 3 + i * 40} ${cx0 + sway + 7} ${cy + 4})`}
              />
            );
          })}
          {/* 飾り文字「めでたし めでたし」 */}
          <g opacity={a1}>
            <text x={960} y={420} textAnchor="middle" fill={SP.ink} fontSize={92} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={8}>
              めでたし めでたし
            </text>
            <path d="M 520 470 Q 960 530 1400 470" fill="none" stroke={PC.gold} strokeWidth={5} />
            <circle cx={520} cy={470} r={8} fill={PC.gold} />
            <circle cx={1400} cy={470} r={8} fill={PC.gold} />
          </g>
          {/* めでたく届いた箱 */}
          <g opacity={a1}>
            <BoxIcon x={960} y={660} scale={0.9} />
            <LockPad x={960} y={626} scale={0.85} color={PC.gold} />
          </g>
          {/* 後半: 赤いスタンプが斜めにドン */}
          <g opacity={Math.min(stampA, 1)} transform={`translate(960, 530) rotate(-10) scale(${1.6 - Math.min(stampA, 1) * 0.6})`}>
            <rect x={-420} y={-100} width={840} height={200} rx={24} fill={SP.background} opacity={0.75} />
            <rect x={-420} y={-100} width={840} height={200} rx={24} fill="none" stroke={PC.red} strokeWidth={13} />
            <text x={0} y={32} textAnchor="middle" fill={PC.red} fontSize={88} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={4}>
              とは、いきません
            </text>
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "受け取った人も、開けられない"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a1}>
          <BoxIcon x={860} y={580} scale={1.25} />
          <LockPad x={860} y={534} scale={1.15} color={PC.gold} />
        </g>
        <Person x={1230} y={440} scale={2.4} color={SP.line} />
        {/* 頭をかく腕 */}
        <path d="M 1270 560 Q 1330 500 1300 420" fill="none" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
        <g opacity={a2} transform={`translate(1230, 300) scale(${pulse * 1.25})`}>
          <text x={0} y={0} textAnchor="middle" fill={SP.accent} fontSize={96} fontWeight={800} fontFamily={SUURI_FONT}>
            ?
          </text>
        </g>
        <SmallLabel x={1230} y={700} text="受け取った人" color={SP.ink} size={30} weight={700} />
        <SmallLabel x={960} y={790} text="鍵がないと、開かない" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行28-29: 鍵 (gold) も結局、知らない人の手から手へバケツリレーするしかない
const KeyOnRelayScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const xs = Array.from({ length: 8 }, (_, i) => 350 + i * 175);
  // 手から手へホップ (MemoRelay と同じ流儀)
  const hop = 11;
  const idxRaw = frame / hop;
  const idx = Math.min(Math.floor(idxRaw), xs.length - 2);
  const t = clamp01(idxRaw - idx);
  const mx = xs[idx] + (xs[idx + 1] - xs[idx]) * easeInOut(t);
  const my = 520 - Math.sin(t * Math.PI) * 56;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "鍵も、送らないといけない" : "鍵も、バケツリレーするしかない")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <GlobeBack />
        <line x1={300} y1={600} x2={1620} y2={600} stroke={SP.line} strokeWidth={4} />
        {xs.map((x, i) => (
          <g key={i}>
            <Person
              x={x}
              y={660}
              scale={1.4}
              color={i === 0 || i === xs.length - 1 ? SP.ink : SP.dim}
              fill={i === 0 || i === xs.length - 1}
            />
            {/* 受け渡しの手 (渡し中の人だけ腕が上がる) */}
            {(i === idx || i === idx + 1) && (
              <path
                d={`M ${x} 700 Q ${x + (i === idx ? 38 : -38)} 626 ${x + (i === idx ? 58 : -58)} 566`}
                fill="none"
                stroke={SP.line}
                strokeWidth={6}
                strokeLinecap="round"
              />
            )}
          </g>
        ))}
        {/* gold の鍵が、知らない人の手から手へ */}
        <g>
          {v === 1 && (
            <g opacity={0.5 + Math.sin(frame / 5) * 0.5} stroke={SP.accent} strokeWidth={4} strokeLinecap="round">
              <line x1={mx - 80} y1={my - 60} x2={mx - 104} y2={my - 84} />
              <line x1={mx + 80} y1={my - 60} x2={mx + 104} y2={my - 84} />
              <line x1={mx} y1={my - 92} x2={mx} y2={my - 120} />
            </g>
          )}
          <KeyIcon x={mx} y={my} scale={1.3} color={PC.gold} rotate={Math.sin(frame / 6) * 6} />
        </g>
        <SmallLabel x={350} y={790} text="あなた" color={SP.ink} size={28} weight={700} />
        <SmallLabel x={xs[xs.length - 1]} y={790} text="あいて" color={SP.ink} size={28} weight={700} />
        <SmallLabel x={960} y={790} text={v === 0 ? "開けてほしいなら、鍵も届ける？" : "鍵も、丸見えの道を行くしかない"} color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行30-31: 二分割 (途中で開けられる / 合鍵を作られる)。
// v1「どちらにしても、おしまいです。」は後半で劇場の赤い幕が左右から閉じて「おしまい」
const KeyStolenScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  // 幕はセリフ後半で閉じる (先に閉じるとネタバレ)
  const closeT = v === 1 ? easeInOut(clamp01((prog - 0.5) / 0.32)) : 0;
  const folds = [40, 110, 180, 250, 320, 390, 460, 530, 600, 670, 740, 810, 880];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "鍵を送ると、どうなるか" : "どちらにしても、おしまい")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <GlobeBack />
        <line x1={960} y1={250} x2={960} y2={760} stroke={SP.dim} strokeWidth={4} strokeDasharray="12 14" />
        {/* 左: 途中で開けられる */}
        <g opacity={a1}>
          <Person x={420} y={400} scale={2} color={SP.line} />
          <BoxIcon x={600} y={560} scale={0.9} lidOpen={0.6} />
          <KeyIcon x={470} y={530} scale={0.95} color={PC.gold} rotate={-20} />
          <SmallLabel x={540} y={740} text="途中で、開けられる" color={SP.ink} size={32} weight={700} />
        </g>
        {/* 右: 合鍵を作られる */}
        <g opacity={a2}>
          <KeyIcon x={1280} y={480} scale={1.1} color={PC.gold} />
          <g opacity={0.9}>
            <path d="M 1270 540 L 1270 580 M 1252 560 L 1288 560" stroke={SP.faint} strokeWidth={5} strokeLinecap="round" />
          </g>
          <KeyIcon x={1280} y={640} scale={1.1} color={SP.accent} />
          <SmallLabel x={1390} y={745} text="合鍵を、作られる" color={SP.accent} size={32} weight={700} />
        </g>
        {/* v1 後半: 劇場の赤い幕が左右から閉じる → 「おしまい」 */}
        {v === 1 && closeT > 0.001 && (
          <g>
            {[-1, 1].map((dir) => (
              <g key={dir} transform={`translate(${dir * (1 - closeT) * 980}, 0)`}>
                <rect x={dir === -1 ? -20 : 960} y={170} width={980} height={700} fill={SP.accent} opacity={0.95} />
                {folds.map((f) => (
                  <line
                    key={f}
                    x1={(dir === -1 ? -20 : 960) + f}
                    y1={180}
                    x2={(dir === -1 ? -20 : 960) + f}
                    y2={860}
                    stroke={SP.background}
                    strokeWidth={10}
                    opacity={0.25}
                  />
                ))}
              </g>
            ))}
            {/* 上の飾り幕 */}
            <rect x={180} y={170} width={1560} height={60} rx={14} fill={SP.accent} opacity={closeT} />
            <g opacity={clamp01((closeT - 0.8) / 0.2)}>
              <text x={960} y={560} textAnchor="middle" fill={SP.ink} fontSize={120} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={14}>
                おしまい
              </text>
            </g>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行32-34: 箱の中に箱… 無限ループ (渦=赤)
const InfiniteBoxScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 3;
  const levels = v === 0 ? 2 : v === 1 ? 3 : 5;
  // ズームで箱が増えつづける (v2)
  const zoom = v === 2 ? 1 + ((frame * 0.5) % 40) / 100 : 1;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "鍵を、箱に入れて送る？" : v === 1 ? "その箱の鍵は、どうやって？" : "はい、無限ループ")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960, 540) scale(${zoom}) translate(-960, -540)`}>
          {Array.from({ length: levels }).map((_, i) => {
            const s = Math.pow(0.68, i);
            return (
              <g key={i} opacity={appearAt(frame, fps, 8 + i * 14)}>
                <rect
                  x={960 - 330 * s}
                  y={540 - 220 * s}
                  width={660 * s}
                  height={440 * s}
                  rx={16 * s}
                  fill={PC.wood}
                  fillOpacity={0.16}
                  stroke={SP.line}
                  strokeWidth={5}
                />
                <LockPad x={960 + 330 * s} y={540 - 220 * s} scale={0.75 * s + 0.25} color={PC.gold} />
              </g>
            );
          })}
          <KeyIcon x={960} y={540} scale={0.7} color={PC.gold} opacity={appearAt(frame, fps, 8 + levels * 14)} />
        </g>
        {v === 2 && (
          <g opacity={appearAt(frame, fps, 24)}>
            {/* ぐるぐる渦 (赤) */}
            <g transform={`translate(1500, 310) rotate(${frame * 2})`}>
              <path
                d="M 0 0 m 8 0 a 8 8 0 1 1 -16 0 a 16 16 0 1 1 32 0 a 24 24 0 1 1 -48 0 a 32 32 0 1 1 64 0"
                fill="none"
                stroke={SP.accent}
                strokeWidth={6}
                strokeLinecap="round"
              />
            </g>
            <SmallLabel x={1500} y={420} text="無限ループ" color={SP.accent} size={34} weight={800} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行35: 2000年のあいだ、誰にも解けなかった
const Year2000Scene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const xs = [380, 560, 740, 920, 1100, 1280, 1460];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "2000年、解けなかった問題"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 年表の帯 */}
        <line x1={300} y1={620} x2={1660} y2={620} stroke={SP.line} strokeWidth={6} />
        {[300, 980, 1660].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={606} x2={x} y2={634} stroke={SP.line} strokeWidth={5} />
            <SmallLabel x={x} y={684} text={["紀元前", "1000年", "2000年"][i]} color={SP.faint} size={28} />
          </g>
        ))}
        {/* 悩む人影がずらり */}
        {xs.map((x, i) => (
          <g key={x} opacity={appearAt(frame, fps, 6 + i * 5)}>
            <Person x={x} y={500} scale={1.5} color={SP.dim} />
            <path d={`M ${x - 26} 530 Q ${x - 40} 486 ${x - 14} 472`} fill="none" stroke={SP.dim} strokeWidth={5} strokeLinecap="round" />
            <path d={`M ${x + 26} 530 Q ${x + 40} 486 ${x + 14} 472`} fill="none" stroke={SP.dim} strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        <SmallLabel x={960} y={330} text="「鍵を、どう届けるか」" color={SP.ink} size={40} weight={800} />
        <SmallLabel x={960} y={388} text="ずっと未解決" color={SP.accent} size={32} weight={700} />
        {/* 問題の主役 = gold の鍵 */}
        <KeyIcon x={1400} y={322} scale={0.9} color={PC.gold} rotate={18} />
      </svg>
    </Frame>
  );
};

// 行36: 王様 (gold冠+赤マント)・忍者 (dim覆面)・スパイ (帽子+コート) が頭を抱え、
// セリフ後半で「ダメだー」と傾いて倒れる (目がバツ)
const KingNinjaSpyScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const totalFrames = ((scene?.durationSec ?? 6) + 0.35) * fps;
  // 後半: 傾いて倒れる
  const fallT = easeInOut(clamp01((prog - 0.55) / 0.28));
  const dameA = appearAt(frame, fps, Math.round(totalFrames * 0.6));
  const figs: Array<{ x: number; label: string }> = [
    { x: 600, label: "王様" },
    { x: 960, label: "忍者" },
    { x: 1320, label: "スパイ" },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "みんな、ここで悩んだ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {figs.map(({ x, label }, i) => {
          const lean = fallT * (16 + i * 5) * (i === 1 ? -1 : 1);
          return (
            <g key={label} opacity={appearAt(frame, fps, 8 + i * 12)}>
              <g transform={`rotate(${lean} ${x} 650)`}>
                {i === 0 && (
                  // 王様のマント (赤。体の後ろに広がる)
                  <path
                    d={`M ${x - 42} 500 Q ${x - 96} 570 ${x - 84} 648 L ${x + 84} 648 Q ${x + 96} 570 ${x + 42} 500 Z`}
                    fill={PC.red}
                    fillOpacity={0.55}
                    stroke={SP.line}
                    strokeWidth={4}
                    strokeLinejoin="round"
                  />
                )}
                <Person x={x} y={470} scale={2.6} color={SP.line} />
                {/* 頭を抱える腕 */}
                <path d={`M ${x - 54} 580 Q ${x - 78} 480 ${x - 30} 442`} fill="none" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
                <path d={`M ${x + 54} 580 Q ${x + 78} 480 ${x + 30} 442`} fill="none" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
                {i === 0 && (
                  // 王冠 (gold)
                  <path d={`M ${x - 36} 420 L ${x - 36} 396 L ${x - 18} 410 L ${x} 390 L ${x + 18} 410 L ${x + 36} 396 L ${x + 36} 420 Z`} fill={PC.gold} stroke={SP.line} strokeWidth={4} />
                )}
                {i === 1 && (
                  // 忍者の覆面 (dim。目だけ出る)
                  <g>
                    <path d={`M ${x - 24} 460 Q ${x - 26} 414 ${x} 414 Q ${x + 26} 414 ${x + 24} 460 Q ${x} 476 ${x - 24} 460 Z`} fill={SP.dim} stroke={SP.line} strokeWidth={3} />
                    <rect x={x - 16} y={440} width={32} height={10} rx={4} fill={SP.background} />
                    {/* 覆面の結びの垂れ */}
                    <path d={`M ${x + 22} 428 q 26 -6 36 10 M ${x + 22} 434 q 24 4 30 20`} fill="none" stroke={SP.dim} strokeWidth={4} strokeLinecap="round" />
                  </g>
                )}
                {i === 2 && (
                  // スパイの帽子+サングラス+コート
                  <g>
                    <rect x={x - 32} y={412} width={64} height={10} rx={5} fill={SP.ink} />
                    <rect x={x - 21} y={390} width={42} height={24} rx={6} fill={SP.ink} />
                    <rect x={x - 20} y={444} width={16} height={9} rx={4} fill={SP.ink} />
                    <rect x={x + 4} y={444} width={16} height={9} rx={4} fill={SP.ink} />
                    {/* コートのえり */}
                    <path d={`M ${x - 14} 512 L ${x - 32} 616 M ${x + 14} 512 L ${x + 32} 616`} fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
                    <circle cx={x} cy={560} r={4} fill={SP.line} />
                    <circle cx={x} cy={594} r={4} fill={SP.line} />
                  </g>
                )}
                {/* もやもや (倒れたら消える) */}
                <path d={`M ${x - 20} 384 q 10 -18 28 -10`} fill="none" stroke={SP.faint} strokeWidth={4} strokeLinecap="round" opacity={(0.6 + Math.sin(frame / 8 + i) * 0.3) * (1 - fallT)} />
                {/* 倒れると目がバツに */}
                {fallT > 0.02 && (
                  <g opacity={clamp01(fallT * 2)} stroke={PC.red} strokeWidth={5} strokeLinecap="round">
                    <line x1={x - 22} y1={i === 1 ? 438 : 452} x2={x - 8} y2={i === 1 ? 452 : 466} />
                    <line x1={x - 8} y1={i === 1 ? 438 : 452} x2={x - 22} y2={i === 1 ? 452 : 466} />
                    <line x1={x + 8} y1={i === 1 ? 438 : 452} x2={x + 22} y2={i === 1 ? 452 : 466} />
                    <line x1={x + 22} y1={i === 1 ? 438 : 452} x2={x + 8} y2={i === 1 ? 452 : 466} />
                  </g>
                )}
              </g>
              <SmallLabel x={x} y={720} text={label} color={SP.ink} size={32} weight={700} />
            </g>
          );
        })}
        {/* ダメだー (倒れはじめに出る) */}
        <g opacity={dameA}>
          <SmallLabel x={960} y={300} text="ダメだー" color={PC.red} size={48} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 行37: 「鍵の受け渡し」がいちばん危ない
const KeyHandoverScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const a1 = appearAt(frame, fps, 6);
  const a2 = appearAt(frame, fps, 26);
  const pulse = 0.55 + Math.sin(frame / 7) * 0.45;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "いちばん危ないのは、ここ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a1}>
          {/* ひみつ本体の道 (箱入り=安全) */}
          <Envelope x={430} y={430} scale={1.1} />
          <SmallLabel x={430} y={520} text="ひみつ本体" color={SP.faint} size={28} />
          <BoxIcon x={700} y={450} scale={0.7} />
          <LockPad x={700} y={418} scale={0.7} color={PC.gold} />
          <line x1={500} y1={430} x2={590} y2={430} stroke={SP.line} strokeWidth={5} markerEnd="url(#han-arrow)" />
          <defs>
            <marker id="han-arrow" markerWidth={10} markerHeight={10} refX={7} refY={5} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={SP.line} />
            </marker>
          </defs>
          <SmallLabel x={700} y={560} text="箱に入れれば、安全" color={SP.faint} size={28} />
        </g>
        {/* 鍵の受け渡し (危険ゾーン) */}
        <g opacity={a2}>
          <rect x={990} y={330} width={620} height={300} rx={20} fill="none" stroke={SP.accent} strokeWidth={6} opacity={pulse} />
          <KeyIcon x={1180} y={470} scale={1.2} color={PC.gold} />
          <line x1={1280} y1={470} x2={1440} y2={470} stroke={SP.line} strokeWidth={5} markerEnd="url(#han-arrow)" />
          <Person x={1510} y={430} scale={1.6} color={SP.line} />
          {/* 危険の! */}
          <g transform="translate(1300, 272)">
            <path d="M 0 -36 L 32 24 L -32 24 Z" fill={SP.accent} />
            <line x1={0} y1={-12} x2={0} y2={8} stroke={SP.background} strokeWidth={6} strokeLinecap="round" />
            <circle cx={0} cy={17} r={3.5} fill={SP.background} />
          </g>
          <SmallLabel x={1300} y={700} text="「鍵の受け渡し」が、いちばん危ない" color={SP.accent} size={34} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 行38-39: 数学者たちが黒板の前 (v1 でひらめき)
const BOARD_GREEN = "#2E4A3C";
const CHALK = "#DDE8E0";
const MathematiciansScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const a2 = appearAt(frame, fps, 28);
  // v0: 2026 → 1976 へ年号カウントダウン (「50年前」を体感させる)
  const countT = easeInOut(clamp01((prog - 0.18) / 0.5));
  const year = Math.round(2026 - 50 * countT);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "約50年前、数学者たち" : "信じられない答え")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 黒板 (木枠 + 深緑の板面 + チョーク置き) */}
        <rect x={414} y={204} width={1092} height={412} rx={16} fill={PC.wood} stroke={SP.line} strokeWidth={5} />
        <rect x={444} y={232} width={1032} height={356} rx={8} fill={BOARD_GREEN} stroke="none" />
        <rect x={700} y={616} width={520} height={18} rx={8} fill={PC.wood} stroke={SP.line} strokeWidth={3} />
        <rect x={760} y={608} width={70} height={10} rx={5} fill={CHALK} />
        {/* チョークの走り書き (四隅に寄せて中央を空ける) */}
        <g stroke={CHALK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55}>
          <path d="M 490 300 q 60 -30 120 0 t 120 0" />
          <path d="M 500 536 h 220 M 500 566 h 160" />
          <circle cx={1372} cy={312} r={44} />
          <path d="M 1230 536 h 200 M 1260 566 h 140" />
        </g>
        {v === 0 ? (
          <g>
            {/* 年号カウントダウン: 2026 → 1976 */}
            <text x={960} y={452} textAnchor="middle" fill={CHALK} fontSize={150} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={6}>
              {year}
            </text>
            <g opacity={clamp01((countT - 0.9) / 0.1)}>
              <path d="M 790 496 Q 960 528 1130 496" fill="none" stroke={CHALK} strokeWidth={5} strokeLinecap="round" />
              <text x={960} y={566} textAnchor="middle" fill={CHALK} fontSize={40} fontWeight={700} fontFamily={SUURI_FONT}>
                約50年前
              </text>
            </g>
          </g>
        ) : (
          <g opacity={a2}>
            {/* 信じられない答えにたどりつく「！」 */}
            <text x={960} y={478} textAnchor="middle" fill={PC.red} fontSize={190} fontWeight={800} fontFamily={SUURI_FONT}>
              ！
            </text>
            <text x={830} y={576} textAnchor="middle" fill={CHALK} fontSize={38} fontWeight={700} fontFamily={SUURI_FONT}>
              1976年
            </text>
            {/* まんなかの数学者が答えを指す */}
            <path d="M 1000 724 Q 1060 640 1046 540" fill="none" stroke={SP.ink} strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {/* 数学者たち (角帽 + めがね + ガウン) */}
        {[700, 960, 1220].map((x, i) => {
          const mid = i === 1;
          const stroke = mid ? SP.ink : SP.line;
          const face = mid ? SP.background : "none";
          return (
            <g key={x} opacity={appearAt(frame, fps, 8 + i * 8)}>
              {/* ガウン (肩に羽織る) */}
              <path
                d={`M ${x - 36} 716 Q ${x - 44} 770 ${x - 38} 790 M ${x + 36} 716 Q ${x + 44} 770 ${x + 38} 790`}
                fill="none"
                stroke={stroke}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <Person x={x} y={660} scale={1.9} color={stroke} fill={mid} />
              {/* 角帽 */}
              <path d={`M ${x - 48} 634 L ${x} 614 L ${x + 48} 634 L ${x} 652 Z`} fill={SP.panel} stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
              <line x1={x + 42} y1={638} x2={x + 52} y2={668} stroke={PC.gold} strokeWidth={4} strokeLinecap="round" />
              <circle cx={x + 52} cy={672} r={5} fill={PC.gold} />
              {/* めがね */}
              <g stroke={face === "none" ? stroke : SP.background} strokeWidth={3.5} fill="none">
                <circle cx={x - 12} cy={672} r={9} />
                <circle cx={x + 12} cy={672} r={9} />
                <line x1={x - 3} y1={672} x2={x + 3} y2={672} />
              </g>
            </g>
          );
        })}
        <SmallLabel x={960} y={870} text="数学者たち" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// 行40-41: 決めゼリフ (字幕を消して中央に大きくフェード)
const KeyNotSendScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 14);
  const a2 = appearAt(frame, fps, 34);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {v === 0 ? (
          <g>
            <KeyIcon x={960} y={272} scale={1.1} color={PC.gold} opacity={a1} />
            <g opacity={a1}>
              <text x={960} y={478} textAnchor="middle" fill={PC.gold} fontSize={92} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={4}>
                鍵は、
              </text>
            </g>
            <g opacity={a2}>
              <text x={960} y={664} textAnchor="middle" fill={SP.accent} fontSize={100} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={4}>
                送らなければいい
              </text>
            </g>
          </g>
        ) : (
          <g>
            <g opacity={a1}>
              <text x={960} y={410} textAnchor="middle" fill={SP.ink} fontSize={76} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={3}>
                見られながら、その場で、
              </text>
            </g>
            <g opacity={a2}>
              <text x={960} y={616} textAnchor="middle" fill={SP.accent} fontSize={88} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={3}>
                いっしょに作ればいい
              </text>
            </g>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 行42-43: 大勢の目に囲まれて、ふたりで作る
const EyesAroundScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const n = v === 0 ? 10 : 14;
  const cx = 960;
  const cy = 500;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "全員に、のぞかれながら" : "ふたりだけの、ひみつ")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* まわりの目 */}
        {Array.from({ length: n }).map((_, i) => {
          const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
          const r = 330 + (i % 2) * 48;
          const x = cx + Math.cos(ang) * r * 1.35;
          const y = cy + Math.sin(ang) * r * 0.78;
          if (y > 810 || y < 210) return null;
          const blink = Math.sin(frame / 10 + i * 1.7) > -0.8 ? 1 : 0.15;
          return (
            <g key={i} opacity={appearAt(frame, fps, 4 + i * 2) * blink}>
              <path d={`M ${x - 30} ${y} Q ${x} ${y - 22} ${x + 30} ${y} Q ${x} ${y + 22} ${x - 30} ${y} Z`} fill="none" stroke={SP.faint} strokeWidth={4} />
              <circle cx={x + Math.cos(Math.atan2(cy - y, cx - x)) * 6} cy={y + Math.sin(Math.atan2(cy - y, cx - x)) * 5} r={7} fill={PC.blue} />
            </g>
          );
        })}
        {v === 0 ? (
          <g>
            {/* 中央のふたり */}
            <Person x={880} y={470} scale={2} color={SP.ink} fill />
            <Person x={1040} y={470} scale={2} color={SP.line} />
            <g opacity={appearAt(frame, fps, 20)}>
              <circle cx={960} cy={560} r={34} fill="none" stroke={SP.ink} strokeWidth={5} />
              <g stroke={SP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
                <line x1={960} y1={500} x2={960} y2={478} />
                <line x1={912} y1={522} x2={896} y2={506} />
                <line x1={1008} y1={522} x2={1024} y2={506} />
              </g>
            </g>
          </g>
        ) : (
          <g>
            {/* 首をかしげる人 + 大きな「？」 */}
            <g transform="rotate(-12 940 470)">
              <Person x={940} y={440} scale={2.2} color={SP.ink} fill />
            </g>
            <text
              x={1120}
              y={470}
              textAnchor="middle"
              fill={SP.accent}
              fontSize={150}
              fontWeight={800}
              fontFamily={SUURI_FONT}
              opacity={appearAt(frame, fps, 18)}
            >
              ?
            </text>
          </g>
        )}
        <SmallLabel x={960} y={790} text={v === 0 ? "みんなの前で、ひみつを作る" : "そんなこと、できるの？"} color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行44-45: 「?」の箱で引っぱり → 絵の具チューブがドン (全編カラーの開始点)
const PaintRevealScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  if (v === 0) {
    // 「できるんです。」自信の断言。道具 (チューブ) は光るシルエットで予告 (色は行45まで隠す)
    const slamIn = appearAt(frame, fps, 6);
    const pulse = 1 + Math.sin(frame / 7) * 0.05;
    const textA = appearAt(frame, fps, 18);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "できるんです"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {/* 後光 (白いにじみ + 放射線) */}
          <g transform={`translate(960, 430) scale(${pulse})`} opacity={Math.min(slamIn, 1)}>
            <circle r={190} fill={SP.ink} opacity={0.08} />
            <circle r={130} fill={SP.ink} opacity={0.08} />
            <g stroke={SP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7}>
              {Array.from({ length: 12 }).map((_, i) => {
                const ang = (i / 12) * Math.PI * 2 + Math.PI / 12;
                return (
                  <line
                    key={i}
                    x1={Math.cos(ang) * 215}
                    y1={Math.sin(ang) * 185}
                    x2={Math.cos(ang) * 265}
                    y2={Math.sin(ang) * 230}
                  />
                );
              })}
            </g>
          </g>
          {/* 光るチューブのシルエット (色はまだ見せない) */}
          <g transform={`translate(960, 430) scale(${Math.min(slamIn, 1)}) translate(-960, -430)`} opacity={slamIn}>
            <PaintTube x={960} y={430} color={SP.panel} scale={1.6} />
          </g>
          <g opacity={textA}>
            <text x={960} y={790} textAnchor="middle" fill={SP.ink} fontSize={104} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={6}>
              できるんです
            </text>
          </g>
        </svg>
      </Frame>
    );
  }
  // 行45「絵の具なら。」: チューブ3本がドン
  const slam = appearAt(frame, fps, 4);
  const burst = clamp01((frame - 4) / 14);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "絵の具なら"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 放射のバースト */}
        {burst > 0 && burst < 1 && (
          <g stroke={SP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - burst}>
            {Array.from({ length: 12 }).map((_, i) => {
              const ang = (i / 12) * Math.PI * 2;
              const r0 = 240 + burst * 180;
              const r1 = r0 + 70;
              return (
                <line
                  key={i}
                  x1={960 + Math.cos(ang) * r0}
                  y1={520 + Math.sin(ang) * r0 * 0.8}
                  x2={960 + Math.cos(ang) * r1}
                  y2={520 + Math.sin(ang) * r1 * 0.8}
                />
              );
            })}
          </g>
        )}
        <g transform={`translate(960, 540) scale(${0.4 + slam * 0.6}) translate(-960, -540)`} opacity={slam}>
          <PaintTube x={760} y={560} color={PC.yellow} rotate={-14} scale={1.7} />
          <PaintTube x={960} y={530} color={PC.red} scale={1.85} />
          <PaintTube x={1160} y={560} color={PC.blue} rotate={14} scale={1.7} />
        </g>
        <SmallLabel x={960} y={810} text="ここからは、色の世界" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== 行19-20: 章の予告 (2分割パネル。roadmapの3連続を避ける) =====
// v0 = 第1章+第2章の予告 / v1 = 第3章+第4章の予告。モノクロ+赤の掟を守る (1画面1赤)。
const NozokiPreviewScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const panel = (x: number, badge: string, label: string, opacity: number, children: React.ReactNode) => (
    <g opacity={opacity}>
      <rect x={x} y={250} width={600} height={500} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} opacity={0.7} />
      <rect x={x + 30} y={282} width={150} height={56} rx={10} fill="none" stroke={SP.line} strokeWidth={4} />
      <text x={x + 105} y={322} textAnchor="middle" fill={SP.ink} fontSize={32} fontWeight={800} fontFamily={SUURI_FONT}>
        {badge}
      </text>
      {children}
      <SmallLabel x={x + 300} y={706} text={label} color={SP.ink} size={32} weight={700} />
    </g>
  );
  if (v === 0) {
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "今日の流れ・前半"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {panel(320, "第1章", "ひみつの届け方は、むずかしい", a1, (
            <g>
              <LockPad x={560} y={490} scale={1.6} color={PC.gold} />
              <KeyIcon x={720} y={520} scale={1.3} color={PC.gold} rotate={24} />
              <text x={640} y={430} textAnchor="middle" fill={SP.faint} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
                ?
              </text>
            </g>
          ))}
          {panel(1000, "第2章", "絵の具のマジック", a2, (
            <g>
              {/* カラー予告はチューブ1本だけ (行45より前なので安売りしない)。これが画面唯一の赤 */}
              <PaintTube x={1300} y={500} color={PC.red} scale={1.5} />
            </g>
          ))}
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の流れ・後半"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {panel(320, "第3章", "最強の作戦が、なぜ負けるか", a1, (
          <g>
            <NozokiKun x={560} y={470} scale={1.5} pose="arms" frame={frame} />
            {/* 赤の× = ハズレ (画面唯一の赤) */}
            <g stroke={SP.accent} strokeWidth={9} strokeLinecap="round" opacity={a2}>
              <line x1={700} y1={440} x2={790} y2={530} />
              <line x1={790} y1={440} x2={700} y2={530} />
            </g>
          </g>
        ))}
        {panel(1000, "第4章", "あなたの生活の、どこで動くか", a2, (
          <g>
            {/* スマホ+鍵マーク */}
            <rect x={1220} y={380} width={160} height={250} rx={20} fill={SP.background} stroke={SP.line} strokeWidth={5} />
            <line x1={1270} y1={410} x2={1330} y2={410} stroke={SP.dim} strokeWidth={4} />
            <KeyIcon x={1300} y={520} scale={0.9} color={PC.gold} />
          </g>
        ))}
      </svg>
    </Frame>
  );
};

// ===== ディスパッチ =====

const MOTIF_MAP: Record<string, React.FC<SceneProps>> = {
  nozoki_classroom: ClassroomScene,
  nozoki_preview: NozokiPreviewScene,
  nozoki_memo_plan: MemoPlanScene,
  nozoki_memo_relay: MemoRelayScene,
  nozoki_memo_peek: MemoPeekScene,
  nozoki_memo_spread: MemoSpreadScene,
  nozoki_class_to_net: ClassToNetScene,
  nozoki_card_relay: CardRelayScene,
  nozoki_peek_servers: PeekServersScene,
  nozoki_card_safe: CardSafeScene,
  nozoki_magic_tube: MagicTubeScene,
  nozoki_omiyage_box: OmiyageBoxScene,
  nozoki_magic_curtain: MagicCurtainScene,
  nozoki_box_lock: BoxLockScene,
  nozoki_box_stuck: BoxStuckScene,
  nozoki_key_on_relay: KeyOnRelayScene,
  nozoki_key_stolen: KeyStolenScene,
  nozoki_infinite_box: InfiniteBoxScene,
  nozoki_year2000: Year2000Scene,
  nozoki_king_ninja_spy: KingNinjaSpyScene,
  nozoki_key_handover: KeyHandoverScene,
  nozoki_mathematicians: MathematiciansScene,
  nozoki_key_not_send: KeyNotSendScene,
  nozoki_eyes_around: EyesAroundScene,
  nozoki_paint_reveal: PaintRevealScene,
};

export const NOZOKI_INTRO_MOTIFS = Object.keys(MOTIF_MAP);

export const NozokiIntroScene: React.FC<SceneProps & { motif: string }> = ({ scene, variant = 0, motif }) => {
  const C = MOTIF_MAP[motif];
  if (!C) return null;
  return <C scene={scene} variant={variant} />;
};
