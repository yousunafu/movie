// のぞき見くんと絵の具のマジック回: つかみ (行1〜21) + 第1章 (行22〜45) の専用シーン。
// 色の弧: この区間は「ほぼモノクロ+赤」(暗号の世界は色がない)。
// 例外 = カード (PC.blue 実物カラー)・王冠 (PC.yellow)・magic_tube と paint_reveal のチューブ (カラー予告/開始点)。
// 行45「絵の具なら。」が全編カラーの開始点なので、それ以前に絵の具カラーを安売りしない。

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

// 封筒 (ひみつのメモ)
const Envelope: React.FC<{ x: number; y: number; scale?: number; open?: boolean; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  open = false,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <rect x={-34} y={-22} width={68} height={44} rx={6} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    {open ? (
      <g>
        {/* 開いたフタ */}
        <path d="M -34 -22 L 0 -52 L 34 -22" fill={SP.panel} stroke={SP.line} strokeWidth={4} strokeLinejoin="round" />
        {/* 中の紙 */}
        <rect x={-24} y={-38} width={48} height={30} rx={4} fill={SP.ink} />
      </g>
    ) : (
      <path d="M -34 -22 L 0 4 L 34 -22" fill="none" stroke={SP.line} strokeWidth={4} strokeLinejoin="round" />
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
    {/* 胴 */}
    <rect x={-90} y={-40} width={180} height={110} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
    {/* フタ (lidOpen 0=閉 1=全開) */}
    <g transform={`translate(-98, -40) rotate(${-lidOpen * 70})`}>
      <rect x={0} y={-26} width={196} height={26} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
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
    <rect x={-40} y={-66} width={80} height={132} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={4.5} />
    <line x1={-26} y1={-34} x2={26} y2={-34} stroke={SP.dim} strokeWidth={5} />
    <line x1={-26} y1={-8} x2={26} y2={-8} stroke={SP.dim} strokeWidth={5} />
    <circle cx={18} cy={34} r={6} fill={Math.floor(frame / 16) % 2 === 0 ? SP.ink : SP.dim} />
    {eye && (
      <g>
        {/* のぞき見の目玉 (赤) */}
        <path d="M -24 -48 Q 0 -66 24 -48 Q 0 -30 -24 -48 Z" fill={SP.background} stroke={SP.accent} strokeWidth={4} />
        <circle cx={0} cy={-48} r={7} fill={SP.accent} />
      </g>
    )}
  </g>
);

// 教室の机 (座っている頭つき)
const Desk: React.FC<{ x: number; y: number; opacity?: number; you?: boolean; mark?: boolean }> = ({
  x,
  y,
  opacity = 1,
  you = false,
  mark = false,
}) => (
  <g transform={`translate(${x}, ${y})`} opacity={opacity}>
    <circle cx={0} cy={-36} r={13} fill={you ? SP.ink : "none"} stroke={you ? SP.ink : SP.dim} strokeWidth={4} />
    <rect x={-46} y={-18} width={92} height={46} rx={7} fill={SP.panel} stroke={you || mark ? SP.line : SP.dim} strokeWidth={4} />
  </g>
);

// 教室グリッドの座標 (6列×5行)。窓ぎわ=左、ろうか側=右
const deskX = (col: number) => 560 + col * 170;
const deskY = (row: number) => 300 + row * 112;
const YOU_COL = 0;
const YOU_ROW = 2;
const GOAL_COL = 5;
const GOAL_ROW = 0;

// 窓 (左の縦長フレーム2枚)
const Windows: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g opacity={opacity}>
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={398} y={282 + i * 240} width={56} height={200} rx={6} fill="none" stroke={SP.dim} strokeWidth={4} />
        <line x1={398} y1={382 + i * 240} x2={454} y2={382 + i * 240} stroke={SP.dim} strokeWidth={3} />
      </g>
    ))}
    <SmallLabel x={426} y={252} text="窓" color={SP.faint} size={26} />
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
        <SmallLabel x={1700} y={530} text="ろうか" color={SP.faint} size={26} />
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

// 行3-4: メモ+点線ルート → 立つの禁止×
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
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "いちばん向こうの席へ" : "席を立つのは、禁止")} />
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
        <Envelope x={x0} y={y0 - 10} scale={0.9} opacity={a1} />
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 14)}>
            {/* 立ち上がる人に禁止マーク */}
            <Person x={960} y={470} scale={2.2} color={SP.line} />
            <circle cx={960} cy={530} r={120} fill="none" stroke={SP.accent} strokeWidth={10} />
            <line x1={876} y1={616} x2={1044} y2={444} stroke={SP.accent} strokeWidth={10} strokeLinecap="round" />
            <SmallLabel x={960} y={710} text="立つの禁止" color={SP.accent} size={36} weight={800} />
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
            <Person x={x} y={560} scale={1.5} color={i === 0 ? SP.ink : SP.line} fill={i === 0} />
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
        <SmallLabel x={1700} y={580} text="…30人" color={SP.ink} size={38} weight={800} />
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
          return (
            <g key={i} opacity={a * 0.9}>
              <rect x={x - 34} y={y - 92} width={68} height={40} rx={14} fill={SP.dim} />
              <path d={`M ${x - 8} ${y - 52} L ${x} ${y - 40} L ${x + 8} ${y - 52} Z`} fill={SP.dim} />
              {[-14, 0, 14].map((dx) => (
                <circle key={dx} cx={x + dx} cy={y - 72} r={4.5} fill={SP.background} />
              ))}
            </g>
          );
        })}
        {/* あなた真っ白 (ショックの縦線) */}
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 20)}>
            <g stroke={SP.ink} strokeWidth={4} strokeLinecap="round">
              <line x1={deskX(YOU_COL) - 26} y1={deskY(YOU_ROW) - 86} x2={deskX(YOU_COL) - 26} y2={deskY(YOU_ROW) - 66} />
              <line x1={deskX(YOU_COL)} y1={deskY(YOU_ROW) - 94} x2={deskX(YOU_COL)} y2={deskY(YOU_ROW) - 70} />
              <line x1={deskX(YOU_COL) + 26} y1={deskY(YOU_ROW) - 86} x2={deskX(YOU_COL) + 26} y2={deskY(YOU_ROW) - 66} />
            </g>
            <SmallLabel x={deskX(YOU_COL)} y={deskY(YOU_ROW) + 78} text="あなた、真っ白" color={SP.ink} size={30} weight={700} />
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
        {/* ハットの中身をかくすクリップ (口より上だけ見える) */}
        <defs>
          <clipPath id="hatmouth">
            <rect x={760} y={120} width={400} height={400} />
          </clipPath>
        </defs>
        <g clipPath="url(#hatmouth)">
          <PaintTube x={880} y={610 - rise * 110 + bob} color={PC.yellow} rotate={-10} scale={1.1} />
          <PaintTube x={960} y={590 - rise * 130 - bob} color={PC.red} scale={1.15} />
          <PaintTube x={1040} y={610 - rise * 110 + bob} color={PC.blue} rotate={10} scale={1.1} />
        </g>
        {/* シルクハット (チューブの根元をかくす) */}
        <g>
          <ellipse cx={960} cy={540} rx={210} ry={44} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <path d="M 830 536 L 830 712 Q 960 752 1090 712 L 1090 536" fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <ellipse cx={960} cy={524} rx={128} ry={26} fill={SP.background} stroke={SP.line} strokeWidth={5} />
          <rect x={830} y={640} width={260} height={22} fill={SP.dim} />
        </g>
        <SmallLabel x={960} y={800} text="今日はこのタネを、ぜんぶ見せます" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行16-17: おみやげ箱 (リボン=PC.yellow) → 考え方の電球シルエット
const OmiyageBoxScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const by = 560;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "暗号より大きな、おみやげ" : "「考え方」そのもの")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960, ${by}) scale(${0.8 + a1 * 0.2})`} opacity={a1}>
          {/* 箱 */}
          <rect x={-150} y={-70} width={300} height={190} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <rect x={-168} y={-112} width={336} height={48} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {/* リボン (PC.yellow) */}
          <rect x={-26} y={-112} width={52} height={232} fill={PC.yellow} />
          <rect x={-168} y={-98} width={336} height={22} fill={PC.yellow} />
          {/* ちょうむすび */}
          <path d="M -8 -118 Q -74 -168 -58 -122 Q -50 -104 -8 -112 Z" fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
          <path d="M 8 -118 Q 74 -168 58 -122 Q 50 -104 8 -112 Z" fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
          <circle cx={0} cy={-116} r={14} fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
        </g>
        <SmallLabel x={960} y={810} text="おみやげ" color={SP.ink} size={34} weight={700} />
        {v === 1 && (
          <g opacity={a2}>
            {/* 電球のシルエット (中身の予感) */}
            <g transform="translate(960, 300)">
              <circle r={52} fill="none" stroke={SP.line} strokeWidth={5} strokeDasharray="10 10" />
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
            <LockPad x={1060} y={520} scale={1.05} />
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
        <LockPad x={960} y={506} scale={1.3} opacity={v === 0 ? a2 : appearAt(frame, fps, Math.round(0.62 * ((scene?.durationSec ?? 6) + 0.35) * fps))} />
        <SmallLabel x={960} y={790} text={v === 0 ? "箱と、錠前" : "ガチャリ"} color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行26-27: 受け取った人も開けられない (?=赤)
const BoxStuckScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const pulse = 1 + Math.sin(frame / 8) * 0.06;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "めでたし……とは、いかない" : "受け取った人も、開けられない")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a1}>
          <BoxIcon x={860} y={580} scale={1.25} />
          <LockPad x={860} y={534} scale={1.15} />
        </g>
        <Person x={1230} y={440} scale={2.4} color={SP.line} />
        {/* 頭をかく腕 */}
        <path d="M 1270 560 Q 1330 500 1300 420" fill="none" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
        <g opacity={v === 0 ? a2 : 1} transform={`translate(1230, 300) scale(${v === 1 ? pulse * 1.25 : 1})`}>
          <text x={0} y={0} textAnchor="middle" fill={SP.accent} fontSize={96} fontWeight={800} fontFamily={SUURI_FONT}>
            ?
          </text>
        </g>
        <SmallLabel x={1230} y={700} text="受け取った人" color={SP.ink} size={30} weight={700} />
        {v === 1 && <SmallLabel x={960} y={790} text="鍵がないと、開かない" color={SP.faint} size={32} />}
      </svg>
    </Frame>
  );
};

// 行28-29: 鍵そのものがバケツリレーに乗る (鍵=赤)
const KeyOnRelayScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const v = variant % 2;
  const prog = progOf(scene?.durationSec);
  const xs = Array.from({ length: 8 }, (_, i) => 350 + i * 175);
  const t = easeInOut(clamp01((prog - 0.12) / 0.7));
  const mx = xs[0] + (xs[xs.length - 1] - xs[0]) * t;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "鍵も、送らないといけない" : "鍵が、バケツリレーに乗る")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <line x1={300} y1={600} x2={1620} y2={600} stroke={SP.line} strokeWidth={4} />
        {xs.map((x, i) => (
          <Person key={i} x={x} y={660} scale={1.4} color={SP.dim} />
        ))}
        {/* 危険の赤い鍵が渡っていく */}
        <g>
          {v === 1 && (
            <g opacity={0.5 + Math.sin(frame / 5) * 0.5} stroke={SP.accent} strokeWidth={4} strokeLinecap="round">
              <line x1={mx - 80} y1={470} x2={mx - 104} y2={446} />
              <line x1={mx + 80} y1={470} x2={mx + 104} y2={446} />
              <line x1={mx} y1={440} x2={mx} y2={412} />
            </g>
          )}
          <KeyIcon x={mx} y={540} scale={1.3} color={SP.accent} rotate={Math.sin(frame / 6) * 6} />
        </g>
        <SmallLabel x={960} y={790} text={v === 0 ? "開けてほしいなら、鍵も届ける？" : "鍵そのものが、丸見えの道へ"} color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行30-31: 二分割 (途中で開けられる / 合鍵を作られる)
const KeyStolenScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const a3 = appearAt(frame, fps, 46);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "鍵を送ると、どうなるか" : "どちらにしても、おしまい")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <line x1={960} y1={250} x2={960} y2={760} stroke={SP.dim} strokeWidth={4} strokeDasharray="12 14" />
        {/* 左: 途中で開けられる */}
        <g opacity={a1}>
          <Person x={420} y={400} scale={2} color={SP.line} />
          <BoxIcon x={600} y={560} scale={0.9} lidOpen={0.6} />
          <KeyIcon x={470} y={530} scale={0.95} color={SP.line} rotate={-20} />
          <SmallLabel x={540} y={740} text="途中で、開けられる" color={SP.ink} size={32} weight={700} />
        </g>
        {/* 右: 合鍵を作られる */}
        <g opacity={a2}>
          <KeyIcon x={1280} y={480} scale={1.1} color={SP.line} />
          <g opacity={0.9}>
            <path d="M 1270 540 L 1270 580 M 1252 560 L 1288 560" stroke={SP.faint} strokeWidth={5} strokeLinecap="round" />
          </g>
          <KeyIcon x={1280} y={640} scale={1.1} color={SP.accent} />
          <SmallLabel x={1390} y={745} text="合鍵を、作られる" color={SP.accent} size={32} weight={700} />
        </g>
        {v === 1 && (
          <g opacity={a3}>
            <rect x={660} y={300} width={600} height={104} rx={16} fill={SP.background} stroke={SP.line} strokeWidth={5} />
            <text x={960} y={368} textAnchor="middle" fill={SP.ink} fontSize={46} fontWeight={800} fontFamily={SUURI_FONT}>
              どちらにしても、おしまい
            </text>
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
                  fill="none"
                  stroke={SP.line}
                  strokeWidth={5}
                />
                <LockPad x={960 + 330 * s} y={540 - 220 * s} scale={0.75 * s + 0.25} />
              </g>
            );
          })}
          <KeyIcon x={960} y={540} scale={0.7} color={SP.line} opacity={appearAt(frame, fps, 8 + levels * 14)} />
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
      </svg>
    </Frame>
  );
};

// 行36: 王様・忍者・スパイが頭を抱える
const KingNinjaSpyScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps } = useProg();
  const figs: Array<{ x: number; label: string }> = [
    { x: 600, label: "王様" },
    { x: 960, label: "忍者" },
    { x: 1320, label: "スパイ" },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "みんな、ここで悩んだ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {figs.map(({ x, label }, i) => (
          <g key={label} opacity={appearAt(frame, fps, 8 + i * 12)}>
            <Person x={x} y={470} scale={2.6} color={SP.line} />
            {/* 頭を抱える腕 */}
            <path d={`M ${x - 54} 580 Q ${x - 78} 480 ${x - 30} 442`} fill="none" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${x + 54} 580 Q ${x + 78} 480 ${x + 30} 442`} fill="none" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            {/* もやもや */}
            <path d={`M ${x - 20} 384 q 10 -18 28 -10`} fill="none" stroke={SP.faint} strokeWidth={4} strokeLinecap="round" opacity={0.6 + Math.sin(frame / 8 + i) * 0.3} />
            {i === 0 && (
              // 王冠 (PC.yellow)
              <path d={`M ${x - 36} 420 L ${x - 36} 396 L ${x - 18} 410 L ${x} 390 L ${x + 18} 410 L ${x + 36} 396 L ${x + 36} 420 Z`} fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
            )}
            {i === 1 && (
              // 忍者の頭巾 (目だけ出る)
              <g>
                <path d={`M ${x - 22} 456 Q ${x - 24} 418 ${x} 418 Q ${x + 24} 418 ${x + 22} 456 Q ${x} 470 ${x - 22} 456 Z`} fill={SP.ink} opacity={0.9} />
                <rect x={x - 16} y={442} width={32} height={9} rx={4} fill={SP.background} />
              </g>
            )}
            {i === 2 && (
              // スパイの帽子+サングラス
              <g>
                <rect x={x - 30} y={414} width={60} height={10} rx={5} fill={SP.ink} />
                <rect x={x - 20} y={392} width={40} height={24} rx={6} fill={SP.ink} />
                <rect x={x - 20} y={444} width={16} height={9} rx={4} fill={SP.ink} />
                <rect x={x + 4} y={444} width={16} height={9} rx={4} fill={SP.ink} />
              </g>
            )}
            <SmallLabel x={x} y={720} text={label} color={SP.ink} size={32} weight={700} />
          </g>
        ))}
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
          <LockPad x={700} y={418} scale={0.7} />
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
          <KeyIcon x={1180} y={470} scale={1.2} color={SP.line} />
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
const MathematiciansScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  const a2 = appearAt(frame, fps, 28);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "約50年前、数学者たち" : "信じられない答え")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 黒板 */}
        <rect x={430} y={220} width={1060} height={380} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
        <g stroke={SP.faint} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9}>
          <path d="M 500 300 q 60 -30 120 0 t 120 0" />
          <path d="M 520 380 h 240 M 520 420 h 180" />
          <path d="M 900 300 q 40 40 80 0 M 900 360 h 160" />
          <circle cx={1240} cy={330} r={46} />
          <path d="M 1200 440 h 200 M 1230 480 h 140" />
        </g>
        <SmallLabel x={1420} y={278} text="1976" color={SP.ink} size={30} weight={700} />
        {/* 数学者たち (複数人) */}
        {[700, 960, 1220].map((x, i) => (
          <g key={x} opacity={appearAt(frame, fps, 8 + i * 8)}>
            <Person x={x} y={660} scale={1.9} color={i === 1 ? SP.ink : SP.line} fill={i === 1} />
          </g>
        ))}
        {v === 1 && (
          <g opacity={a2}>
            {/* まんなかの人が答えを指す */}
            <path d="M 1000 700 Q 1080 620 1120 560" fill="none" stroke={SP.ink} strokeWidth={7} strokeLinecap="round" />
            <text x={960} y={560} textAnchor="middle" fill={SP.ink} fontSize={56} fontWeight={800} fontFamily={SUURI_FONT}>
              ！
            </text>
          </g>
        )}
        <SmallLabel x={960} y={856} text="数学者たち" color={SP.faint} size={30} />
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
            <g opacity={a1}>
              <text x={960} y={470} textAnchor="middle" fill={SP.ink} fontSize={92} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={4}>
                鍵は、
              </text>
            </g>
            <g opacity={a2}>
              <text x={960} y={610} textAnchor="middle" fill={SP.accent} fontSize={100} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={4}>
                送らなければいい
              </text>
            </g>
            <KeyIcon x={960} y={300} scale={1.1} color={SP.line} opacity={a1} />
          </g>
        ) : (
          <g>
            <g opacity={a1}>
              <text x={960} y={420} textAnchor="middle" fill={SP.ink} fontSize={76} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={3}>
                見られながら、その場で、
              </text>
            </g>
            <g opacity={a2}>
              <text x={960} y={580} textAnchor="middle" fill={SP.accent} fontSize={88} fontWeight={800} fontFamily={SUURI_FONT} letterSpacing={3}>
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
              <circle cx={x + Math.cos(Math.atan2(cy - y, cx - x)) * 6} cy={y + Math.sin(Math.atan2(cy - y, cx - x)) * 5} r={7} fill={SP.faint} />
            </g>
          );
        })}
        {/* 中央のふたり */}
        <Person x={880} y={470} scale={2} color={SP.ink} fill />
        <Person x={1040} y={470} scale={2} color={SP.line} />
        {v === 1 && (
          <g opacity={appearAt(frame, fps, 20)}>
            <circle cx={960} cy={560} r={34} fill="none" stroke={SP.ink} strokeWidth={5} />
            <g stroke={SP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
              <line x1={960} y1={500} x2={960} y2={478} />
              <line x1={912} y1={522} x2={896} y2={506} />
              <line x1={1008} y1={522} x2={1024} y2={506} />
            </g>
          </g>
        )}
        <SmallLabel x={960} y={790} text={v === 0 ? "そんなこと、できるの？" : "できるんです"} color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// 行44-45: 「?」の箱で引っぱり → 絵の具チューブがドン (全編カラーの開始点)
const PaintRevealScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const v = variant % 2;
  if (v === 0) {
    const wob = Math.sin(frame / 5) * 3;
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "できるんです"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${960 + wob}, 540) rotate(${wob * 0.5})`}>
            <rect x={-170} y={-150} width={340} height={300} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
            <text x={0} y={52} textAnchor="middle" fill={SP.ink} fontSize={150} fontWeight={800} fontFamily={SUURI_FONT}>
              ?
            </text>
          </g>
          <SmallLabel x={960} y={800} text="その道具とは──" color={SP.faint} size={32} />
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
              <LockPad x={560} y={490} scale={1.6} />
              <KeyIcon x={720} y={520} scale={1.3} rotate={24} />
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
            <KeyIcon x={1300} y={520} scale={0.9} />
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
