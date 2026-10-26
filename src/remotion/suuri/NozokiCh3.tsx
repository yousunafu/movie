// のぞき見くんと絵の具のマジック回: 第3章 (行115〜147・モノクロ+赤回帰) + 第4章 (行148〜157) + 結論 (行163〜172)。
// 第3章は数字の世界なのでモノクロ+赤。第4章の magic_sign (行153-154) から絵の具カラーが回帰する。
// 1画面1赤を守る (赤は最強調の1要素のみ)。

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
  PaintTube,
  YouFigure,
  ShopFigure,
  NozokiKun,
  easeInOut,
  clamp01,
} from "./NozokiScenes";
import { KeyIcon, LockPad } from "./NozokiIntro";

type SceneProps = { scene?: Scene; variant?: number };

const useProg = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return {
    frame,
    fps,
    progOf: (durationSec?: number) =>
      clamp01(frame / Math.max(((durationSec ?? 6) + 0.35) * fps, 1)),
  };
};

// モノクロ用のグレー階調 (第3章のパレット表現)
const GRAYS = ["#E2E2E8", "#BCBCC6", "#9A9AA4", "#7C7C86", "#5E5E68", "#46464E"];

// 砂時計
const Hourglass: React.FC<{ x: number; y: number; scale?: number; color?: string; frame?: number; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  color = SP.line,
  frame = 0,
  opacity = 1,
}) => {
  const sandDrop = (frame % 40) / 40;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      {/* 枠 */}
      <path
        d="M -80 -130 L 80 -130 L 80 -110 L 14 -8 L 14 8 L 80 110 L 80 130 L -80 130 L -80 110 L -14 8 L -14 -8 L -80 -110 Z"
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      {/* 上の砂 */}
      <path d="M -52 -104 L 52 -104 L 10 -22 L -10 -22 Z" fill={color} opacity={0.4} />
      {/* 落ちる砂 */}
      <rect x={-3} y={-10 + sandDrop * 60} width={6} height={34} fill={color} opacity={0.55} />
      {/* 下の砂 */}
      <path d="M -46 112 L 46 112 L 20 72 L -20 72 Z" fill={color} opacity={0.5} />
    </g>
  );
};

// スマホ
const Phone: React.FC<{ x: number; y: number; scale?: number; opacity?: number; children?: React.ReactNode }> = ({
  x,
  y,
  scale = 1,
  opacity = 1,
  children,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <rect x={-110} y={-200} width={220} height={400} rx={28} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
    <rect x={-92} y={-178} width={184} height={356} rx={12} fill={SP.background} stroke={SP.dim} strokeWidth={2} />
    <line x1={-26} y1={-192} x2={26} y2={-192} stroke={SP.dim} strokeWidth={5} strokeLinecap="round" />
    {children}
  </g>
);

// 年表テープ (138億年)
const TimeTape: React.FC<{ x: number; y: number; wdt: number; label?: string; opacity?: number }> = ({
  x,
  y,
  wdt,
  label,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <rect x={x} y={y} width={wdt} height={34} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    {[...Array(Math.max(Math.floor(wdt / 60), 1))].map((_, i) => (
      <line key={i} x1={x + 30 + i * 60} y1={y + 7} x2={x + 30 + i * 60} y2={y + 27} stroke={SP.dim} strokeWidth={2} />
    ))}
    {label && <SmallLabel x={x + wdt / 2} y={y - 16} text={label} color={SP.ink} size={30} weight={700} />}
  </g>
);

// ===== 行116-118: 色の数を増やす (多色パレットの横増殖) =====
const MoreColorsScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const pcColors = [
    PC.yellow,
    PC.red,
    PC.blue,
    PC.orange,
    PC.green,
    PC.brown,
    PC.gold,
    PC.sky,
    PC.wood,
    PC.fakeBrown,
  ];
  // v0: 問いかけ (のぞき見くん+少数) / v1: 増え始める / v2: ズザーッと大量増殖
  const cols = variant === 0 ? 6 : variant === 1 ? 12 : 20;
  const rows = variant === 2 ? 4 : 2;
  const shown = Math.floor(easeInOut(clamp01(prog * 1.6)) * cols * rows);
  const cellW = variant === 2 ? 86 : 110;
  const gridW = cols * cellW;
  const x0 = 960 - gridW / 2 + cellW / 2;
  const y0 = variant === 2 ? 330 : 420;
  const rowGap = variant === 2 ? 118 : 150;
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text={variant === 0 ? "総当たりを倒すには" : "色の数を、増やす"} />
        {[...Array(rows)].map((_, r) =>
          [...Array(cols)].map((_, c) => {
            const idx = r * cols + c;
            if (idx >= shown) return null;
            // 端まで色とりどり (多色。隣どうしが同色にならないよう7飛びで巡回)
            const color = pcColors[(idx * 7 + r * 3) % pcColors.length];
            return (
              <PaintChip
                key={`${r}-${c}`}
                x={x0 + c * cellW}
                y={y0 + r * rowGap}
                color={color}
                scale={variant === 2 ? 0.62 : 0.8}
                opacity={0.95}
              />
            );
          })
        )}
        {variant === 0 && (
          <NozokiKun x={1500} y={700} scale={1.1} pose="arms" frame={frame} />
        )}
        {variant === 1 && <SmallLabel x={960} y={770} text="答えは単純。" color={SP.faint} size={34} />}
        {variant === 2 && (
          <SmallLabel x={960} y={800} text="増やせば増やすほど、総当たりはつらくなる" color={SP.faint} size={32} />
        )}
      </svg>
    </Frame>
  );
};

// ===== 行119: 絵の具→数字のモーフ (カラー→白の境界) =====
const PaintToNumberScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const t = easeInOut(clamp01((prog - 0.25) / 0.4)); // 0→1 で変身
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="絵の具のかわりに、数字" />
        {/* 左: 絵の具チューブ (カラー・フェードアウト) */}
        <PaintTube x={620} y={520} color={PC.orange} scale={1.7} opacity={1 - t * 0.85} />
        <g opacity={1 - t * 0.7}>
          <SmallLabel x={620} y={740} text="絵の具" color={SP.faint} size={34} />
        </g>
        {/* 矢印 */}
        <g opacity={appearAt(frame, fps, 0.4)}>
          <line x1={820} y1={520} x2={1060} y2={520} stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
          <path d="M 1060 520 L 1026 500 L 1026 540 Z" fill={SP.line} />
        </g>
        {/* 右: 数字 391 (白・せり上がる) */}
        <g opacity={t} transform={`translate(1310, ${520 + (1 - t) * 40})`}>
          <text x={0} y={30} textAnchor="middle" fill={SP.ink} fontSize={150} fontWeight={800} fontFamily={SUURI_FONT}>
            391
          </text>
        </g>
        <g opacity={t}>
          <SmallLabel x={1310} y={740} text="数字" color={SP.ink} size={34} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行124-127: 逆向きの問題 (391=?×?) =====
const ReverseProblemScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const trials = ["2", "3", "5", "7", "11", "13"];
  const shownTrials = Math.floor(easeInOut(prog) * (trials.length + 1));
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="逆向きの問題" />
        {variant === 0 && (
          <>
            {/* 行124: 順方向カードがくるっと向きを変える予告 */}
            <g opacity={appearAt(frame, fps, 0.2)}>
              <rect x={460} y={380} width={460} height={160} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
              <text x={690} y={478} textAnchor="middle" fill={SP.ink} fontSize={58} fontWeight={700} fontFamily={SUURI_FONT}>
                17 × 23 = 391
              </text>
              <SmallLabel x={690} y={590} text="いまのは、順方向" color={SP.faint} size={32} />
            </g>
            <g opacity={appearAt(frame, fps, 1.1)}>
              <path d="M 980 460 A 60 60 0 0 1 1100 460" fill="none" stroke={SP.line} strokeWidth={6} />
              <path d="M 1100 460 L 1082 434 L 1118 440 Z" fill={SP.line} />
            </g>
            <g opacity={appearAt(frame, fps, 1.5)}>
              <rect x={1180} y={380} width={460} height={160} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
              <text x={1410} y={478} textAnchor="middle" fill={SP.ink} fontSize={58} fontWeight={700} fontFamily={SUURI_FONT}>
                391 = <tspan fill={SP.accent}>?</tspan> × <tspan fill={SP.accent}>?</tspan>
              </text>
              <SmallLabel x={1410} y={590} text="こんどは、逆向き" color={SP.ink} size={32} />
            </g>
          </>
        )}
        {variant === 1 && (
          <>
            <text x={960} y={520} textAnchor="middle" fill={SP.ink} fontSize={130} fontWeight={800} fontFamily={SUURI_FONT}>
              391 = <tspan fill={SP.accent}>?</tspan> × <tspan fill={SP.accent}>?</tspan>
            </text>
            <SmallLabel x={960} y={680} text="何かける、何？" color={SP.faint} size={36} />
          </>
        )}
        {variant === 2 && (
          <>
            <text x={960} y={480} textAnchor="middle" fill={SP.ink} fontSize={110} fontWeight={800} fontFamily={SUURI_FONT}>
              391 = <tspan fill={SP.accent}>?</tspan> × <tspan fill={SP.accent}>?</tspan>
            </text>
            {/* 汗マーク (急に難しい・水色) */}
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${1360 + i * 56} ${330 + (i % 2) * 24} q 10 18 0 30 q -10 -12 0 -30`}
                fill={PC.sky}
                opacity={0.5 + Math.sin(frame / 7 + i * 2) * 0.3}
              />
            ))}
            <SmallLabel x={960} y={650} text="急に、むずかしい……" color={SP.faint} size={36} />
          </>
        )}
        {variant === 3 && (
          <>
            <text x={960} y={330} textAnchor="middle" fill={SP.ink} fontSize={76} fontWeight={800} fontFamily={SUURI_FONT}>
              391 = ? × ?
            </text>
            {/* 1個ずつ試す連打 */}
            {trials.map((t, i) => {
              if (i >= shownTrials) return null;
              const tx = 420 + (i % 3) * 380;
              const ty = 460 + Math.floor(i / 3) * 150;
              return (
                <g key={i}>
                  <rect x={tx - 150} y={ty - 50} width={300} height={100} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={3} />
                  <text x={tx - 24} y={ty + 16} textAnchor="middle" fill={SP.ink} fontSize={42} fontWeight={700} fontFamily={SUURI_FONT}>
                    {t} で割る
                  </text>
                  <text x={tx + 108} y={ty + 20} textAnchor="middle" fill={SP.accent} fontSize={56} fontWeight={800} fontFamily={SUURI_FONT}>
                    ×
                  </text>
                </g>
              );
            })}
            <SmallLabel x={960} y={790} text="1個ずつ、試すしかない" color={SP.faint} size={32} />
          </>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行128-129: 掛け算はスイスイ一方通行 / 逆もどりは途切れ途切れの大仕事 =====
const OnewayArrowsScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const slide = ((frame * 5) % 150) / 150; // 行きのスイスイ流れ
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="一方通行のかたち" />
        {/* 左: 掛け算 = 太く滑らかな一方通行 (スイスイ) */}
        <g opacity={appearAt(frame, fps, 0.2)}>
          <SmallLabel x={580} y={320} text="掛け算 (順方向)" color={SP.ink} size={36} weight={700} />
          <line x1={320} y1={450} x2={810} y2={450} stroke={SP.ink} strokeWidth={28} strokeLinecap="round" />
          <path d="M 880 450 L 802 406 L 802 494 Z" fill={SP.ink} />
          {/* スイスイの流れ線 (矢印の上を走る) */}
          {[0, 1].map((i) => (
            <line
              key={i}
              x1={330 + slide * 280 + i * 130}
              y1={396 - i * 14}
              x2={404 + slide * 280 + i * 130}
              y2={396 - i * 14}
              stroke={SP.faint}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.75}
            />
          ))}
          <SmallLabel x={580} y={548} text="スイスイ、一瞬" color={SP.faint} size={30} />
        </g>
        {/* 中央仕切り */}
        <line x1={960} y1={300} x2={960} y2={700} stroke={SP.dim} strokeWidth={3} strokeDasharray="10 12" />
        {/* 右: 逆もどり = 細く、途切れ途切れの矢印 (右→左) */}
        <g opacity={appearAt(frame, fps, 0.9)}>
          <SmallLabel x={1340} y={320} text="逆もどり" color={SP.accent} size={36} weight={700} />
          {[
            [1600, 1534],
            [1500, 1444],
            [1410, 1360],
            [1324, 1282],
            [1246, 1212],
            [1178, 1152],
          ].map(([ax, bx], i) => (
            <line
              key={i}
              x1={ax}
              y1={450 + (i % 2 === 0 ? -8 : 8)}
              x2={bx}
              y2={450 + (i % 2 === 0 ? 8 : -8)}
              stroke={SP.faint}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}
          <path d="M 1078 450 L 1124 426 L 1124 474 Z" fill={SP.faint} />
          {/* 行く手をはばむバツ (赤・最強調) */}
          <g stroke={SP.accent} strokeWidth={9} strokeLinecap="round">
            <line x1={1332} y1={416} x2={1396} y2={482} />
            <line x1={1396} y1={416} x2={1332} y2={482} />
          </g>
          {/* ヘトヘトの汗 (水色) */}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${1190 + i * 150} ${356 + (i % 2) * 26} q 10 18 0 30 q -10 -12 0 -30`}
              fill={PC.sky}
              opacity={0.5 + Math.sin(frame / 7 + i * 2) * 0.3}
            />
          ))}
          <SmallLabel x={1340} y={548} text="途切れ途切れの、大仕事" color={SP.faint} size={30} />
        </g>
        {variant === 1 && (
          <g opacity={appearAt(frame, fps, 1.4)}>
            {/* 下: 絵の具の「戻せない」を実色で併記 (黄+赤→オレンジ) */}
            <rect x={560} y={636} width={800} height={134} rx={14} fill={SP.panel} stroke={SP.dim} strokeWidth={3} />
            <PaintChip x={680} y={703} color={PC.yellow} scale={0.55} />
            <text x={760} y={715} textAnchor="middle" fill={SP.faint} fontSize={34} fontWeight={700} fontFamily={SUURI_FONT}>
              +
            </text>
            <PaintChip x={840} y={703} color={PC.red} scale={0.55} />
            <path d="M 920 703 L 980 703 M 980 703 L 962 691 M 980 703 L 962 715" stroke={SP.line} strokeWidth={4} fill="none" />
            <PaintChip x={1050} y={703} color={PC.orange} scale={0.55} />
            <text x={1210} y={715} textAnchor="middle" fill={SP.faint} fontSize={30} fontFamily={SUURI_FONT}>
              戻せない
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行130-133: 0が300個 (帯スクロール) / v2=カラーチップだらけ / v3=帯はみ出し比較 =====
const Digits300Scene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const scroll = easeInOut(prog);
  const zeroCount = Math.min(Math.floor(scroll * 300) + 1, 300);
  const bandY = 470;
  const chipColors = [
    PC.yellow,
    PC.red,
    PC.blue,
    PC.orange,
    PC.green,
    PC.brown,
    PC.gold,
    PC.sky,
    PC.wood,
    PC.fakeBrown,
  ];
  if (variant === 2) {
    // s: 「ひみつの色が10の300乗種類」→ 画面を色とりどりのチップで埋めつくしても、全然足りない
    const cols = 22;
    const rows = 7;
    const shown = Math.floor(easeInOut(clamp01(prog * 1.5)) * cols * rows);
    return (
      <Frame>
        <svg width={W} height={H}>
          <DiagramTitle text="10の300乗種類" />
          {[...Array(rows)].map((_, r) =>
            [...Array(cols)].map((_, c) => {
              const idx = r * cols + c;
              if (idx >= shown) return null;
              return (
                <PaintChip
                  key={`${r}-${c}`}
                  x={100 + c * 82 + (r % 2) * 30}
                  y={232 + r * 86}
                  color={chipColors[(idx * 7 + r * 3) % chipColors.length]}
                  scale={0.52}
                  opacity={0.9}
                />
              );
            })
          )}
          {/* 中央の帯: 埋めつくしても全然足りない (途方もなさ) */}
          <g opacity={appearAt(frame, fps, 1.8)}>
            <rect x={520} y={468} width={880} height={112} rx={16} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
            <text x={960} y={540} textAnchor="middle" fill={SP.accent} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
              画面を埋めつくしても、まだ全然足りない
            </text>
          </g>
        </svg>
      </Frame>
    );
  }
  if (variant === 3) {
    // s: 「この数が、どれだけおかしいか」→ 比較対象 (宇宙の原子) + 帯が画面からはみ出す
    const reach = easeInOut(clamp01(prog * 1.3));
    return (
      <Frame>
        <svg width={W} height={H}>
          <DiagramTitle text="この数の、おかしさ" />
          {/* 比較: 宇宙にある原子ぜんぶ (短い帯で収まる) */}
          <g opacity={appearAt(frame, fps, 0.3)}>
            <SmallLabel x={590} y={296} text="宇宙にある原子、ぜんぶ" color={SP.ink} size={34} weight={700} />
            <rect x={330} y={330} width={520} height={72} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <text x={590} y={380} textAnchor="middle" fill={SP.ink} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
              およそ 10の80乗 個
            </text>
            <SmallLabel x={960} y={370} text="← 画面に収まる" color={SP.faint} size={28} anchor="start" />
          </g>
          {/* ひみつの色の数: 帯が画面右端を突き抜ける */}
          <g opacity={appearAt(frame, fps, 1.0)}>
            <SmallLabel x={590} y={516} text="ひみつの色の数" color={SP.accent} size={34} weight={700} />
            <rect
              x={330}
              y={550}
              width={Math.max(10, (W - 330 + 100) * reach)}
              height={72}
              rx={12}
              fill={SP.panel}
              stroke={SP.accent}
              strokeWidth={5}
            />
            <text x={620} y={600} textAnchor="middle" fill={SP.accent} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
              10の300乗 種類
            </text>
            {reach > 0.9 && (
              <SmallLabel x={1560} y={516} text="画面の外へ、まだ続く…" color={SP.faint} size={28} />
            )}
          </g>
          {/* 帯を見上げて腕組み */}
          <NozokiKun x={420} y={740} scale={1.1} pose="arms" frame={frame} />
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="300桁の数" />
        {/* 「1」固定 */}
        <text x={330} y={bandY + 26} textAnchor="middle" fill={SP.ink} fontSize={96} fontWeight={800} fontFamily={SUURI_FONT}>
          1
        </text>
        {/* 0の帯 (右から左へ流れる) */}
        <g clipPath="url(#bandClip)">
          {[...Array(30)].map((_, i) => {
            const zx = 440 + i * 74 - (scroll * 300 * 74) % 74;
            return (
              <text
                key={i}
                x={zx}
                y={bandY + 26}
                textAnchor="middle"
                fill={SP.ink}
                fontSize={84}
                fontWeight={700}
                fontFamily={SUURI_FONT}
                opacity={0.85}
              >
                0
              </text>
            );
          })}
        </g>
        <defs>
          <clipPath id="bandClip">
            <rect x={420} y={bandY - 70} width={1180} height={140} />
          </clipPath>
        </defs>
        {/* ズラララ…の勢い線 */}
        <line x1={440} y1={bandY + 70} x2={1580} y2={bandY + 70} stroke={SP.dim} strokeWidth={3} />
        {/* 赤カウンタ */}
        <g>
          <rect x={760} y={610} width={400} height={92} rx={14} fill={SP.panel} stroke={SP.accent} strokeWidth={4} />
          <text x={960} y={672} textAnchor="middle" fill={SP.accent} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
            0が {zeroCount} 個
          </text>
        </g>
        {variant === 1 && <SmallLabel x={960} y={780} text="1のあとに、0が300個" color={SP.faint} size={32} />}
      </svg>
    </Frame>
  );
};

// ===== 行134-135: 世界最速コンピュータで1秒1兆色 =====
const SuperComputerScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="1秒に、1兆色" />
        {/* コンピュータ本体 */}
        <g>
          <rect x={360} y={330} width={320} height={400} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={400} y={370 + i * 88} width={240} height={56} rx={8} fill="none" stroke={SP.dim} strokeWidth={3} />
              <circle cx={430} cy={398 + i * 88} r={9} fill={SP.line} opacity={0.4 + ((frame + i * 7) % 14 < 7 ? 0.5 : 0)} />
            </g>
          ))}
          <SmallLabel x={520} y={790} text="世界最速コンピュータ" color={SP.faint} size={30} />
        </g>
        {/* カカカッの勢い線 */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={710}
            y1={420 + i * 80}
            x2={770 + ((frame * 23 + i * 31) % 40)}
            y2={420 + i * 80}
            stroke={SP.line}
            strokeWidth={4}
            opacity={0.5}
          />
        ))}
        {/* ハズレチップの滝 (グレー: モノクロ章) */}
        {[...Array(14)].map((_, i) => {
          const fall = ((frame * (10 + (i % 5) * 3) + i * 97) % 420);
          const cx = 880 + (i % 7) * 100;
          return (
            <g key={i} opacity={clamp01(1.3 - fall / 380)}>
              <PaintChip x={cx} y={330 + fall} color={GRAYS[i % GRAYS.length]} scale={0.5} opacity={0.8} />
              <line x1={cx - 16} y1={314 + fall} x2={cx + 16} y2={346 + fall} stroke={SP.dim} strokeWidth={4} />
              <line x1={cx + 16} y1={314 + fall} x2={cx - 16} y2={346 + fall} stroke={SP.dim} strokeWidth={4} />
            </g>
          );
        })}
        {/* 赤メーター (ハズレカウンタ・少し上に配置) */}
        <g opacity={appearAt(frame, fps, variant === 0 ? 1.2 : 0.3)}>
          <rect x={1180} y={560} width={460} height={110} rx={14} fill={SP.panel} stroke={SP.accent} strokeWidth={4} />
          <text x={1410} y={608} textAnchor="middle" fill={SP.accent} fontSize={38} fontWeight={800} fontFamily={SUURI_FONT}>
            ハズレ {Math.floor(easeInOut(prog) * 9999).toLocaleString()} 兆個
          </text>
          <rect x={1210} y={626} width={400} height={16} rx={8} fill={SP.dim} opacity={0.5} />
          <rect x={1210} y={626} width={400 * easeInOut(prog)} height={16} rx={8} fill={SP.accent} />
        </g>
        {variant === 1 && (
          <SmallLabel x={1410} y={730} text="1秒ごとに、1兆個消える" color={SP.faint} size={30} />
        )}
      </svg>
    </Frame>
  );
};

// ===== 行136-137: 何年かかる？ (1万年/1億年カード) =====
const YearsQuizScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="ぜんぶ試すのに、何年？" />
        <text x={960} y={420} textAnchor="middle" fill={SP.ink} fontSize={88} fontWeight={800} fontFamily={SUURI_FONT}>
          かかる時間 = <tspan fill={SP.accent}>?</tspan> 年
        </text>
        {variant === 1 && (
          <>
            <g opacity={appearAt(frame, fps, 0.3)}>
              <rect x={480} y={520} width={400} height={180} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              <text x={680} y={630} textAnchor="middle" fill={SP.ink} fontSize={62} fontWeight={800} fontFamily={SUURI_FONT}>
                1万年？
              </text>
            </g>
            <g opacity={appearAt(frame, fps, 0.9)}>
              <rect x={1040} y={520} width={400} height={180} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              <text x={1240} y={630} textAnchor="middle" fill={SP.ink} fontSize={62} fontWeight={800} fontFamily={SUURI_FONT}>
                1億年？
              </text>
            </g>
          </>
        )}
        {variant === 0 && (
          <SmallLabel x={960} y={640} text="1秒に1兆色ペースで、ぜんぶ試すと──" color={SP.faint} size={34} />
        )}
      </svg>
    </Frame>
  );
};

// ===== 行138-139: 満天の星 → 一斉消灯 (tailReveal) =====
// 実際の恒星っぽい色 (彩度控えめ: 青白・白・黄・オレンジ・赤)。白〜青白を多めに
const STAR_COLORS = ["#A9BFE0", "#E9E9ED", "#E3D49A", "#D9A06B", "#C9736A"];
const starColorOf = (i: number) => STAR_COLORS[[1, 0, 1, 2, 1, 0, 3, 1, 2, 0, 1, 4][i % 12]];
const STAR_SEEDS = [...Array(90)].map((_, i) => ({
  x: ((i * 487 + 131) % 1700) + 110,
  y: ((i * 263 + 97) % 560) + 180,
  r: 2 + ((i * 7) % 4),
  tw: (i * 13) % 20,
}));

const UniverseEndScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  // v1: 「尽きます」の発声タイミング (シーン60%) で一斉にフッと消える。先に消さない。
  const lightsOut = variant === 1 ? easeInOut(clamp01((prog - 0.6) / 0.12)) : 0;
  return (
    <Frame>
      <svg width={W} height={H}>
        {/* 夜空パネル */}
        <rect x={140} y={150} width={1640} height={640} rx={20} fill="#050507" stroke={SP.dim} strokeWidth={3} />
        {STAR_SEEDS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={starColorOf(i)}
            opacity={(0.45 + Math.sin((frame + s.tw * 4) / 14) * 0.35) * (1 - lightsOut)}
          />
        ))}
        {/* ひときわ明るい星たち (青白・黄・オレンジ・白) */}
        {[300, 700, 1200, 1550].map((sx, i) => {
          const bc = [STAR_COLORS[0], STAR_COLORS[2], STAR_COLORS[3], STAR_COLORS[1]][i];
          return (
            <g key={i} opacity={(0.9 - i * 0.1) * (1 - lightsOut)}>
              <circle cx={sx} cy={240 + i * 110} r={5} fill={bc} />
              <line x1={sx - 14} y1={240 + i * 110} x2={sx + 14} y2={240 + i * 110} stroke={bc} strokeWidth={2} opacity={0.6} />
              <line x1={sx} y1={226 + i * 110} x2={sx} y2={254 + i * 110} stroke={bc} strokeWidth={2} opacity={0.6} />
            </g>
          );
        })}
        {variant === 0 && (
          <SmallLabel x={960} y={760} text="ぜんぶ試し終わるより、先に──" color={SP.faint} size={34} />
        )}
        {variant === 1 && lightsOut > 0.85 && (
          <SmallLabel x={960} y={480} text="……" color={SP.dim} size={60} />
        )}
      </svg>
    </Frame>
  );
};

// ===== 行140-143: 138億年×1兆×1兆でも終わらない (絵が育つ) =====
// テープのまわりに散らす色とりどりの星 (テープと被らない余白に配置)
const REPEAT_STARS: Array<[number, number, number]> = [
  // [x, y, 色index]
  [260, 215, 0],
  [520, 236, 1],
  [780, 206, 2],
  [1040, 232, 1],
  [1300, 210, 3],
  [1560, 238, 0],
  [1720, 212, 1],
  [230, 380, 1],
  [300, 520, 4],
  [240, 650, 0],
  [1750, 330, 2],
  [1810, 560, 1],
  [1760, 700, 3],
  [350, 760, 1],
];

const UniverseRepeatScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="138億年を、くり返しても" />
        {/* 宇宙の星 (色とりどり・控えめに瞬く) */}
        {REPEAT_STARS.map(([sx, sy, ci], i) => (
          <circle
            key={i}
            cx={sx}
            cy={sy}
            r={3 + (i % 3)}
            fill={STAR_COLORS[ci]}
            opacity={0.35 + Math.sin((frame + i * 9) / 13) * 0.2}
          />
        ))}
        {/* 1本目のテープ: 宇宙の歴史 */}
        <TimeTape x={420} y={300} wdt={1080} label="宇宙の歴史 138億年" />
        {variant >= 1 && (
          <g opacity={variant === 1 ? appearAt(frame, fps, 0.4) : 1}>
            {/* 束 (重なったテープ) */}
            {[0, 1, 2, 3].map((i) => (
              <TimeTape key={i} x={470 + i * 10} y={420 + i * 14} wdt={980} opacity={0.9 - i * 0.15} />
            ))}
            {/* ×1兆 ループ矢印 (赤) */}
            <g>
              <path d="M 1530 440 A 46 46 0 1 1 1512 410" fill="none" stroke={SP.accent} strokeWidth={6} />
              <path d="M 1512 410 L 1534 398 L 1530 424 Z" fill={SP.accent} />
              <text x={1620} y={462} textAnchor="middle" fill={SP.accent} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
                ×1兆
              </text>
            </g>
          </g>
        )}
        {variant >= 2 && (
          <g opacity={variant === 2 ? appearAt(frame, fps, 0.4) : 1}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TimeTape key={i} x={500 + i * 8} y={560 + i * 10} wdt={900} opacity={0.85 - i * 0.12} />
            ))}
            <text x={1570} y={620} textAnchor="middle" fill={SP.ink} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
              さらに ×1兆
            </text>
          </g>
        )}
        {variant === 3 && (
          <g opacity={appearAt(frame, fps, 0.3)}>
            {/* 進捗バー: まだ途中 */}
            <rect x={460} y={710} width={1000} height={38} rx={19} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <rect x={466} y={716} width={Math.max(30, 70 * easeInOut(prog))} height={26} rx={13} fill={SP.accent} />
            <SmallLabel x={1600} y={735} text="まだ、途中" color={SP.accent} size={34} weight={700} anchor="middle" />
          </g>
        )}
        {variant === 0 && (
          <SmallLabel x={960} y={700} text="宇宙が生まれてから、今日まで" color={SP.faint} size={32} />
        )}
      </svg>
    </Frame>
  );
};

// ===== 行144-145: 正しい。でも間に合わない (2枚看板) =====
const CorrectButLateScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="正しい。でも、間に合わない" />
        {/* 左看板: 作戦ボード (木のピン) + 正しい○ (緑) */}
        <g opacity={appearAt(frame, fps, 0.2)}>
          <rect x={400} y={300} width={500} height={420} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          {/* ボードのピン (木の色) */}
          <circle cx={440} cy={336} r={10} fill={PC.wood} stroke={SP.line} strokeWidth={3} />
          <circle cx={860} cy={336} r={10} fill={PC.wood} stroke={SP.line} strokeWidth={3} />
          <circle cx={650} cy={460} r={90} fill="none" stroke={PC.green} strokeWidth={14} />
          <text x={650} y={650} textAnchor="middle" fill={SP.ink} fontSize={52} fontWeight={800} fontFamily={SUURI_FONT}>
            作戦は、正しい
          </text>
        </g>
        {/* 右看板: 間に合わない時計 (赤) */}
        <g opacity={variant === 0 ? appearAt(frame, fps, 1.4) * 0.45 : appearAt(frame, fps, 0.6)}>
          <rect x={1020} y={300} width={500} height={420} rx={20} fill={SP.panel} stroke={variant === 1 ? SP.accent : SP.line} strokeWidth={5} />
          <circle cx={1270} cy={460} r={90} fill="none" stroke={variant === 1 ? SP.accent : SP.line} strokeWidth={10} />
          {/* 針 (ぐるぐる回る) */}
          <line
            x1={1270}
            y1={460}
            x2={1270 + Math.cos((frame / 6) % (Math.PI * 2)) * 62}
            y2={460 + Math.sin((frame / 6) % (Math.PI * 2)) * 62}
            stroke={variant === 1 ? SP.accent : SP.line}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <line x1={1270} y1={460} x2={1270} y2={412} stroke={variant === 1 ? SP.accent : SP.line} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          <text
            x={1270}
            y={650}
            textAnchor="middle"
            fill={variant === 1 ? SP.accent : SP.ink}
            fontSize={52}
            fontWeight={800}
            fontFamily={SUURI_FONT}
          >
            間に合わない
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== 行146-147: 時間の壁 (巨大砂時計の中の鍵) =====
const TimeWallScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="「時間」で守る" />
        {variant === 0 && (
          <>
            {/* 巨大砂時計 (赤) + 中に鍵 (金) */}
            <Hourglass x={960} y={500} scale={2.1} color={SP.accent} frame={frame} />
            <KeyIcon x={960} y={505} scale={1.1} color={PC.gold} />
            <SmallLabel x={960} y={820} text="破るのにかかる時間が、守りになる" color={SP.faint} size={32} />
          </>
        )}
        {variant === 1 && (
          <>
            {/* 左: 頑丈なレンガの壁 (茶系・×) */}
            <g opacity={appearAt(frame, fps, 0.2)}>
              {[0, 1, 2, 3].map((r) =>
                [0, 1, 2].map((c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={420 + c * 120 + (r % 2) * 60 - 30}
                    y={360 + r * 80}
                    width={116}
                    height={76}
                    fill={PC.wood}
                    fillOpacity={0.55 + ((r * 3 + c) % 3) * 0.12}
                    stroke={SP.dim}
                    strokeWidth={3}
                  />
                ))
              )}
              <line x1={420} y1={360} x2={790} y2={680} stroke={SP.faint} strokeWidth={10} strokeLinecap="round" />
              <line x1={790} y1={360} x2={420} y2={680} stroke={SP.faint} strokeWidth={10} strokeLinecap="round" />
              <SmallLabel x={600} y={760} text="頑丈な壁……ではなく" color={SP.faint} size={32} />
            </g>
            {/* 右: 砂時計 (赤) */}
            <g opacity={appearAt(frame, fps, 0.9)}>
              <Hourglass x={1310} y={510} scale={1.5} color={SP.accent} frame={frame} />
              <KeyIcon x={1310} y={514} scale={0.8} color={PC.gold} />
              <SmallLabel x={1310} y={760} text="「時間」で守る" color={SP.ink} size={34} weight={700} />
            </g>
          </>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行149-152: あなたのスマホ (ズームイン参加型) =====
const YourPhoneScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  return (
    <Frame>
      <svg width={W} height={H}>
        {variant <= 1 && (
          <>
            <DiagramTitle text={variant === 0 ? "遠い世界の話？" : "スマホで見ている、あなた"} />
            <Phone x={960} y={500} scale={variant === 0 ? 0.9 : 1.1}>
              {/* 画面の中: 動画再生イメージ (再生ボタン=赤・シークバー=水色) */}
              <rect x={-70} y={-60} width={140} height={90} rx={8} fill={SP.panel} stroke={SP.dim} strokeWidth={2} />
              <path d="M -14 -30 L 18 -15 L -14 0 Z" fill={PC.red} />
              {/* ミニアドレスバー (鍵=金) */}
              <rect x={-70} y={-110} width={140} height={28} rx={14} fill={SP.background} stroke={SP.dim} strokeWidth={2} />
              <circle cx={-52} cy={-96} r={6} fill={PC.gold} />
              <rect x={-38} y={-100} width={86} height={8} rx={4} fill={SP.dim} />
              <line x1={-70} y1={60} x2={70} y2={60} stroke={PC.sky} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
              <line x1={-70} y1={95} x2={30} y2={95} stroke={SP.dim} strokeWidth={4} />
            </Phone>
            {variant === 1 && (
              <SmallLabel x={960} y={810} text="この動画を見ている、その画面" color={SP.faint} size={32} />
            )}
          </>
        )}
        {variant === 2 && (
          <>
            <DiagramTitle text="画面のいちばん上" />
            {/* ズームイン途中: スマホ上部を拡大 */}
            <g transform={`translate(960, 520) scale(${1.6 + easeInOut(prog) * 0.9})`}>
              <rect x={-310} y={-150} width={620} height={300} rx={30} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              {/* アドレスバー (鍵マーク=金) */}
              <rect x={-260} y={-60} width={520} height={74} rx={37} fill="#0A0A0C" stroke={SP.line} strokeWidth={3} />
              <LockPad x={-210} y={-23} scale={0.42} color={PC.gold} />
              <rect x={-160} y={-36} width={90} height={10} rx={5} fill={PC.sky} opacity={0.75} />
              <rect x={-58} y={-36} width={218} height={10} rx={5} fill={SP.dim} />
              <rect x={-160} y={-14} width={210} height={10} rx={5} fill={SP.dim} opacity={0.6} />
            </g>
            <SmallLabel x={960} y={830} text="アドレスの、横" color={SP.faint} size={34} />
          </>
        )}
        {variant === 3 && (
          <>
            <DiagramTitle text="小さな、鍵マーク" />
            {/* 拡大済みアドレスバー + 鍵マーク (金) に赤マル */}
            <rect x={400} y={380} width={1120} height={150} rx={75} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
            <LockPad x={520} y={455} scale={0.85} color={PC.gold} />
            <rect x={620} y={430} width={640} height={18} rx={9} fill={SP.dim} />
            <rect x={620} y={472} width={420} height={18} rx={9} fill={SP.dim} opacity={0.6} />
            {/* 赤マル (じわっと描かれる) */}
            <circle
              cx={520}
              cy={452}
              r={92}
              fill="none"
              stroke={SP.accent}
              strokeWidth={8}
              strokeDasharray={Math.PI * 2 * 92}
              strokeDashoffset={Math.PI * 2 * 92 * (1 - easeInOut(clamp01(prog * 1.8)))}
              transform="rotate(-90 520 452)"
            />
            <SmallLabel x={960} y={660} text="ありませんか？" color={SP.faint} size={36} />
          </>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行153-154: 鍵マークから色が漏れる「ただいま作動中」 (カラー回帰点) =====
const MagicSignScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const leak = variant === 0 ? easeInOut(clamp01((prog - 0.35) / 0.4)) : 1;
  const wisps = [
    { color: PC.yellow, dx: -70, rot: -24 },
    { color: PC.red, dx: 0, rot: 0 },
    { color: PC.blue, dx: 70, rot: 24 },
  ];
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="ただいま、作動中" />
        {/* 鍵マーク本体 (金) */}
        <LockPad x={960} y={490} scale={2.0} color={PC.gold} />
        {/* 漏れる絵の具の色 (カラー回帰) */}
        {wisps.map((wi, i) => {
          const rise = leak * (60 + i * 14);
          return (
            <g key={i} opacity={leak * (0.85 - i * 0.08)} transform={`rotate(${wi.rot} ${960 + wi.dx} ${370})`}>
              <path
                d={`M ${960 + wi.dx} ${382 - rise} q 14 -26 0 -52 q -14 26 0 52`}
                fill={wi.color}
              />
              <circle cx={960 + wi.dx} cy={360 - rise - Math.sin(frame / 9 + i * 2) * 6} r={7 + i} fill={wi.color} opacity={0.7} />
            </g>
          );
        })}
        {variant === 1 && (
          <g opacity={appearAt(frame, fps, 0.5)}>
            <rect x={620} y={680} width={680} height={100} rx={16} fill={SP.panel} stroke={PC.yellow} strokeWidth={4} />
            <circle cx={690} cy={730} r={14} fill={PC.yellow} opacity={0.6 + Math.sin(frame / 8) * 0.4} />
            <text x={990} y={746} textAnchor="middle" fill={SP.ink} fontSize={40} fontWeight={800} fontFamily={SUURI_FONT}>
              絵の具のマジック、作動中
            </text>
          </g>
        )}
        {variant === 0 && <SmallLabel x={960} y={730} text="そのサインです" color={SP.faint} size={34} />}
      </svg>
    </Frame>
  );
};

// ===== 行155-156: 世界中で1秒に何百万回 (地図に鍵が連打点灯) =====
const WORLD_KEYS = [...Array(26)].map((_, i) => ({
  x: ((i * 311 + 173) % 1480) + 240,
  y: ((i * 199 + 251) % 420) + 260,
  at: (i * 37) % 100,
}));

const WorldHandshakeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const litCount = variant === 0 ? Math.floor(easeInOut(prog) * 10) : Math.floor(easeInOut(prog * 1.3) * WORLD_KEYS.length);
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="世界中で、1秒に何百万回" />
        {/* 世界 (抽象地図: 大陸っぽいかたまり) */}
        <rect x={180} y={210} width={1560} height={540} rx={22} fill={SP.panel} stroke={SP.dim} strokeWidth={3} opacity={0.7} />
        <ellipse cx={520} cy={400} rx={190} ry={110} fill={SP.dim} opacity={0.35} />
        <ellipse cx={660} cy={580} rx={110} ry={90} fill={SP.dim} opacity={0.35} />
        <ellipse cx={1010} cy={360} rx={150} ry={85} fill={SP.dim} opacity={0.35} />
        <ellipse cx={1080} cy={540} rx={100} ry={100} fill={SP.dim} opacity={0.35} />
        <ellipse cx={1420} cy={420} rx={210} ry={120} fill={SP.dim} opacity={0.35} />
        <ellipse cx={1530} cy={620} rx={90} ry={55} fill={SP.dim} opacity={0.35} />
        {/* 鍵マーク連打点灯 (金) */}
        {WORLD_KEYS.slice(0, Math.max(litCount, variant === 0 ? 2 : 0)).map((k, i) => (
          <g key={i} opacity={0.9}>
            <circle cx={k.x} cy={k.y} r={22} fill={PC.gold} opacity={0.14 + Math.sin((frame + k.at) / 10) * 0.08} />
            <KeyIcon x={k.x} y={k.y} scale={0.42} color={PC.gold} />
          </g>
        ))}
        {variant === 0 && (
          <SmallLabel x={960} y={810} text="サイトを開くたび、1秒もかけずに交換完了" color={SP.faint} size={32} />
        )}
        {variant === 1 && (
          <g opacity={appearAt(frame, fps, 0.4)}>
            <rect x={1310} y={690} width={400} height={86} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <text x={1510} y={746} textAnchor="middle" fill={SP.ink} fontSize={36} fontWeight={800} fontFamily={SUURI_FONT}>
              毎秒 何百万回
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行157: 世界中ののぞき見くんが空ぶりでヘトヘト =====
const KaraburiScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame } = useProg();
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="宇宙規模の、空ぶり" />
        {/* 地平線 */}
        <line x1={160} y1={620} x2={1760} y2={620} stroke={SP.dim} strokeWidth={3} />
        {/* 奥へ並ぶのぞき見くんたち (小さく) */}
        {[0.5, 0.42, 0.36, 0.3, 0.26].map((s, i) => (
          <NozokiKun
            key={`far-${i}`}
            x={700 + i * 180}
            y={600 - i * 22}
            scale={s}
            pose="gakkuri"
            frame={frame + i * 11}
            opacity={0.75 - i * 0.11}
          />
        ))}
        {/* 手前の2人 (大きめ・ガックリ) */}
        <NozokiKun x={480} y={700} scale={1.05} pose="gakkuri" frame={frame} />
        <NozokiKun x={1380} y={690} scale={0.88} pose="gakkuri" frame={frame + 17} opacity={0.9} />
        {/* ヘトヘトの汗 (水色) */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M ${560 + i * 300} ${430 + (i % 2) * 40} q 11 20 0 34 q -11 -14 0 -34`}
            fill={PC.sky}
            opacity={0.45 + Math.sin(frame / 8 + i * 1.7) * 0.25}
          />
        ))}
        <SmallLabel x={960} y={800} text="今日も、世界中でヘトヘト" color={SP.faint} size={34} />
      </svg>
    </Frame>
  );
};

// ===== 行163-165: ポチッの裏側 0.1秒のミニ交換 =====
const PochiBackstageScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const press = variant === 0 ? clamp01(Math.sin(Math.min(prog * 3, 1) * Math.PI)) : 0;
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text={variant === 2 ? "安心して、お買い物を" : "ポチッの、0.1秒裏側"} />
        {variant === 0 && (
          <>
            {/* スマホ + 購入ボタンを押す指 */}
            <Phone x={760} y={490} scale={1.15}>
              <rect x={-70} y={40} width={140} height={54} rx={27} fill={SP.panel} stroke={SP.ink} strokeWidth={4} />
              <text x={0} y={76} textAnchor="middle" fill={SP.ink} fontSize={30} fontWeight={800} fontFamily={SUURI_FONT}>
                購入
              </text>
            </Phone>
            {/* 指 */}
            <g transform={`translate(${920}, ${600 - press * 28}) rotate(-30)`}>
              <rect x={-18} y={0} width={36} height={150} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              <circle cx={0} cy={0} r={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
            </g>
            {/* ポチッ */}
            <g opacity={press}>
              <text x={1180} y={480} textAnchor="middle" fill={SP.accent} fontSize={60} fontWeight={800} fontFamily={SUURI_FONT}>
                ポチッ
              </text>
              {[0, 1, 2].map((i) => (
                <line
                  key={i}
                  x1={1100 + i * 60}
                  y1={530}
                  x2={1120 + i * 60}
                  y2={560}
                  stroke={SP.accent}
                  strokeWidth={4}
                  opacity={0.6}
                />
              ))}
            </g>
          </>
        )}
        {variant === 1 && (
          <>
            {/* 舞台裏: ミニ絵の具交換が0.1秒で完了 */}
            <rect x={330} y={300} width={1260} height={420} rx={20} fill={SP.panel} stroke={SP.dim} strokeWidth={3} opacity={0.6} />
            <SmallLabel x={960} y={270} text="指の下の、舞台裏" color={SP.faint} size={30} />
            <YouFigure x={560} y={470} scale={1.3} pocketColor={PC.red} />
            <ShopFigure x={1360} y={470} scale={1.3} />
            {/* レーンを渡る色 (高速) */}
            <line x1={660} y1={520} x2={1260} y2={520} stroke={SP.dim} strokeWidth={3} strokeDasharray="8 10" />
            <PaintChip
              x={660 + ((frame * 36) % 600)}
              y={490}
              color={PC.orange}
              scale={0.6}
              opacity={0.95}
            />
            <PaintChip
              x={1260 - ((frame * 36 + 300) % 600)}
              y={550}
              color={PC.green}
              scale={0.6}
              opacity={0.95}
            />
            {/* できあがる宇宙規模の鍵 */}
            <g opacity={appearAt(frame, fps, 1.2)}>
              <circle cx={960} cy={660} r={44} fill={PC.brown} opacity={0.25} />
              <KeyIcon x={960} y={660} scale={0.9} color={PC.brown} />
              <SmallLabel x={960} y={740} text="0.1秒で、宇宙規模の鍵" color={SP.ink} size={32} weight={700} />
            </g>
          </>
        )}
        {variant === 2 && (
          <>
            <Phone x={960} y={480} scale={1.15}>
              {/* 完了画面 */}
              <circle cx={0} cy={-40} r={52} fill="none" stroke={PC.green} strokeWidth={7} />
              <path d="M -24 -42 L -6 -22 L 30 -66" fill="none" stroke={PC.green} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              <rect x={-70} y={50} width={140} height={12} rx={6} fill={SP.dim} />
              <rect x={-70} y={80} width={96} height={12} rx={6} fill={SP.dim} opacity={0.6} />
            </Phone>
            <LockPad x={1330} y={450} scale={0.9} color={PC.gold} />
            <SmallLabel x={1330} y={560} text="守られています" color={SP.faint} size={30} />
          </>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行166: レシートびろーん (使いすぎは守れません) =====
const ReceiptJokeScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const len = easeInOut(clamp01(prog * 1.5));
  const receiptH = 160 + len * 420;
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="ただし……" />
        {/* レシート本体 (びろーんと伸びる) */}
        <g>
          <rect x={720} y={230} width={480} height={receiptH} fill="#1C1C22" stroke={SP.line} strokeWidth={4} />
          {/* ギザギザの下端 */}
          <path
            d={`M 720 ${230 + receiptH} ${[...Array(12)].map((_, i) => `L ${740 + i * 40} ${230 + receiptH + (i % 2 === 0 ? 14 : 0)}`).join(" ")} L 1200 ${230 + receiptH}`}
            fill="#1C1C22"
            stroke={SP.line}
            strokeWidth={4}
          />
          <text x={960} y={290} textAnchor="middle" fill={SP.ink} fontSize={34} fontWeight={800} fontFamily={SUURI_FONT}>
            ご利用明細
          </text>
          {/* 明細行 (伸びるほど増える) */}
          {[...Array(Math.floor(len * 7))].map((_, i) => (
            <g key={i}>
              <rect x={770} y={330 + i * 52} width={200 + ((i * 53) % 120)} height={12} rx={6} fill={SP.dim} />
              <rect x={1060} y={330 + i * 52} width={90} height={12} rx={6} fill={SP.dim} opacity={0.7} />
            </g>
          ))}
          {/* 合計 (赤) */}
          <g opacity={appearAt(frame, fps, 1.6)}>
            <line x1={760} y1={230 + receiptH - 90} x2={1160} y2={230 + receiptH - 90} stroke={SP.line} strokeWidth={3} />
            <text x={960} y={230 + receiptH - 36} textAnchor="middle" fill={SP.accent} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
              合計 ￥たくさん
            </text>
          </g>
        </g>
        <SmallLabel x={1430} y={520} text="使いすぎは、" color={SP.faint} size={34} />
        <SmallLabel x={1430} y={570} text="どんな暗号も守れません" color={SP.faint} size={34} />
      </svg>
    </Frame>
  );
};

// ===== 行167-168: つかみのおみやげ箱が開く (回収) =====
const OmiyageOpenScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const open = variant === 1 ? easeInOut(clamp01((prog - 0.2) / 0.4)) : 0;
  const shake = variant === 0 ? Math.sin(frame / 4) * clamp01(Math.sin(prog * Math.PI)) * 4 : 0;
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="今日いちばんの、おみやげ" />
        <g transform={`translate(${960 + shake}, 520)`}>
          {/* 開く光 */}
          {variant === 1 && (
            <g opacity={open}>
              {[...Array(7)].map((_, i) => {
                const ang = -90 + (i - 3) * 24;
                return (
                  <line
                    key={i}
                    x1={0}
                    y1={-90}
                    x2={Math.cos((ang * Math.PI) / 180) * (180 + open * 80)}
                    y2={-90 + Math.sin((ang * Math.PI) / 180) * (180 + open * 80)}
                    stroke={PC.yellow}
                    strokeWidth={6}
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                );
              })}
              <text
                x={0}
                y={-210 - open * 40}
                textAnchor="middle"
                fill={SP.ink}
                fontSize={54}
                fontWeight={800}
                fontFamily={SUURI_FONT}
                opacity={appearAt(frame, fps, 1.4)}
              >
                「考え方」
              </text>
            </g>
          )}
          {/* 箱本体 */}
          <rect x={-170} y={-80} width={340} height={230} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {/* フタ (開く) */}
          <g transform={`rotate(${-open * 110} -170 -80)`}>
            <rect x={-186} y={-124} width={372} height={48} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
            <rect x={-30} y={-124} width={60} height={48} fill={PC.yellow} opacity={0.9} />
          </g>
          {/* リボン (縦) */}
          <rect x={-30} y={-76} width={60} height={226} fill={PC.yellow} opacity={0.9} />
          {variant === 0 && (
            /* リボンの結び目 */
            <g>
              <path d="M -10 -96 q -46 -34 -66 -6 q 20 24 66 6 Z" fill={PC.yellow} opacity={0.9} />
              <path d="M 10 -96 q 46 -34 66 -6 q -20 24 -66 6 Z" fill={PC.yellow} opacity={0.9} />
            </g>
          )}
        </g>
        {variant === 0 && <SmallLabel x={960} y={820} text="最初に預かった、あの箱" color={SP.faint} size={32} />}
        {variant === 1 && (
          <SmallLabel x={960} y={820} text="新しい機械でも、天才の計算でもなく" color={SP.faint} size={32} />
        )}
      </svg>
    </Frame>
  );
};

// ===== 行169-171: 問いのカードが裏返る (オチ図解) =====
const QuestionFlipScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  // v2 で 180度フリップ。scaleX 1→-1、中間で面を差し替え
  const flipT = variant === 2 ? easeInOut(clamp01((prog - 0.15) / 0.45)) : variant === 1 ? easeInOut(clamp01((prog - 0.6) / 0.8)) * 0.12 : 0;
  const sx = Math.cos(flipT * Math.PI);
  const showBack = flipT > 0.5;
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="問いを、裏返す" />
        {/* カード */}
        <g transform={`translate(960, 470) scale(${sx}, 1)`}>
          <rect
            x={-500}
            y={-170}
            width={1000}
            height={340}
            rx={22}
            fill={SP.panel}
            stroke={showBack ? SP.accent : SP.line}
            strokeWidth={6}
          />
          {!showBack ? (
            <g>
              {/* 2000年の大問題らしく、大きく重く掲げる */}
              <text x={0} y={-28} textAnchor="middle" fill={SP.ink} fontSize={74} fontWeight={900} fontFamily={SUURI_FONT} letterSpacing={2}>
                どうやって鍵を
                <tspan x={0} dy={96}>
                  安全に送るか？
                </tspan>
              </text>
              <rect x={-272} y={92} width={544} height={10} rx={5} fill={SP.accent} />
            </g>
          ) : (
            /* 裏面は scaleX が負なので、文字をもう一度反転して正しく読ませる */
            <g transform="scale(-1, 1)">
              <text x={0} y={-28} textAnchor="middle" fill={SP.accent} fontSize={74} fontWeight={900} fontFamily={SUURI_FONT} letterSpacing={2}>
                そもそも、
                <tspan x={0} dy={96}>
                  送らなくていいのでは？
                </tspan>
              </text>
            </g>
          )}
        </g>
        {variant === 0 && <SmallLabel x={960} y={760} text="2000年間の、問い" color={SP.faint} size={34} />}
        {variant === 1 && (
          <g opacity={appearAt(frame, fps, 0.5)}>
            {/* 全人類が考え続けた年月 */}
            {[...Array(12)].map((_, i) => (
              <g key={i} opacity={0.5}>
                <circle cx={420 + i * 100} cy={730} r={16} fill="none" stroke={SP.faint} strokeWidth={3} />
                <line x1={420 + i * 100} y1={746} x2={420 + i * 100} y2={790} stroke={SP.faint} strokeWidth={3} />
              </g>
            ))}
            <SmallLabel x={960} y={830} text="全人類が、2000年" color={SP.faint} size={30} />
          </g>
        )}
        {variant === 2 && showBack && (
          <g opacity={appearAt(frame, fps, 0.2)}>
            <SmallLabel x={960} y={760} text="くるん。" color={SP.faint} size={34} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== 行172: あなたの問題も裏返せる =====
const FlipYourProblemScene: React.FC<SceneProps> = ({ scene }) => {
  const { frame, fps, progOf } = useProg();
  const prog = progOf(scene?.durationSec);
  const tilt = easeInOut(clamp01((prog - 0.3) / 0.5)) * 22;
  return (
    <Frame>
      <svg width={W} height={H}>
        <DiagramTitle text="疑うのは、問いの立て方" />
        {/* あなたの問題カード (端が持ち上がりはじめる) */}
        <g transform={`translate(960, 480) rotate(${-tilt})`}>
          <rect x={-440} y={-150} width={880} height={300} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <text x={0} y={-16} textAnchor="middle" fill={SP.ink} fontSize={52} fontWeight={800} fontFamily={SUURI_FONT}>
            あなたの
            <tspan x={0} dy={72}>
              解けない問題
            </tspan>
          </text>
          {/* めくれかけの裏面チラ見せ (赤) */}
          <path
            d={`M 440 -150 L ${440 - tilt * 6} ${-150 + tilt * 5} L 440 ${-150 + tilt * 8} Z`}
            fill={SP.accent}
            opacity={clamp01(tilt / 14)}
          />
        </g>
        {/* ひっくり返す手 */}
        <g opacity={appearAt(frame, fps, 0.7)} transform={`translate(${1440 - tilt * 2}, ${330 - tilt * 3}) rotate(${-20 - tilt})`}>
          <rect x={-16} y={0} width={32} height={130} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <circle cx={0} cy={0} r={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        </g>
        <SmallLabel x={960} y={780} text="努力の量より、問いの立て方" color={SP.faint} size={34} />
      </svg>
    </Frame>
  );
};

// ===== 行158-162: 今日のまとめ (1行ずつ点灯・本編とそろえた色付きアイコン) =====
const NozokiMatomeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const { frame, fps } = useProg();
  const a = appearAt(frame, fps, 8);
  const lines = [
    { text: "鍵は、送ったらのぞかれる", color: SP.ink },
    { text: "絵の具方式: 見られながら、その場で作る", color: SP.accent },
    { text: "総当たりは、正しい作戦", color: SP.ink },
    { text: "10の300乗種類なら、宇宙が終わるまで間に合わない", color: SP.ink },
  ];
  const lit = Math.max(0, Math.min(4, variant)); // 0=見出しのみ, 1..4=点灯数
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日のまとめ"} />
      <svg width={W} height={H}>
        {lines.map((l, i) => {
          const on = i < lit;
          const isNew = i === lit - 1;
          const pop = isNew ? appearAt(frame, fps, 14) : 1;
          const y = 272 + i * 150;
          const cy = y + 59;
          return (
            <g key={i} opacity={on ? pop * a : a * 0.35}>
              <rect
                x={300}
                y={y}
                width={1320}
                height={118}
                rx={16}
                fill={on ? SP.panel : "none"}
                stroke={on ? (l.color === SP.accent ? SP.accent : SP.line) : SP.dim}
                strokeWidth={on ? 6 : 4}
                strokeDasharray={on ? "none" : "12 10"}
              />
              <circle cx={380} cy={cy} r={22} fill="none" stroke={on ? SP.accent : SP.dim} strokeWidth={5} />
              <text x={380} y={cy + 12} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fontWeight={700} fill={on ? SP.accent : SP.dim}>
                {i + 1}
              </text>
              <text x={450} y={cy + 13} fontFamily={SUURI_FONT} fontSize={36} fontWeight={on ? 700 : 400} fill={on ? l.color : SP.dim}>
                {l.text}
              </text>
              {/* 行ごとのアイコン (点灯時のみ色が立つ) */}
              {i === 0 && (
                <g opacity={on ? 1 : 0.4}>
                  {/* 金の鍵 + のぞく目 */}
                  <KeyIcon x={1435} y={cy} scale={0.6} color={on ? PC.gold : SP.dim} />
                  <ellipse cx={1550} cy={cy} rx={30} ry={18} fill="none" stroke={on ? SP.line : SP.dim} strokeWidth={4} />
                  <circle cx={1550} cy={cy} r={9} fill={on ? PC.sky : SP.dim} />
                  <circle cx={1550} cy={cy} r={4} fill={SP.ink} />
                </g>
              )}
              {i === 1 && (
                <g opacity={on ? 1 : 0.4}>
                  {/* 黄 + 赤 → オレンジ */}
                  <PaintChip x={1398} y={cy} color={on ? PC.yellow : SP.dim} scale={0.38} />
                  <text x={1442} y={cy + 10} textAnchor="middle" fill={on ? SP.ink : SP.dim} fontSize={28} fontWeight={700} fontFamily={SUURI_FONT}>
                    +
                  </text>
                  <PaintChip x={1486} y={cy} color={on ? PC.red : SP.dim} scale={0.38} />
                  <path
                    d={`M 1518 ${cy} L 1548 ${cy} M 1548 ${cy} L 1536 ${cy - 8} M 1548 ${cy} L 1536 ${cy + 8}`}
                    stroke={on ? SP.line : SP.dim}
                    strokeWidth={3}
                    fill="none"
                  />
                  <PaintChip x={1584} y={cy} color={on ? PC.orange : SP.dim} scale={0.38} />
                </g>
              )}
              {i === 2 && (
                /* 正しい作戦の丸印 (緑) */
                <circle cx={1500} cy={cy} r={28} fill="none" stroke={on ? PC.green : SP.dim} strokeWidth={7} opacity={on ? 1 : 0.4} />
              )}
              {i === 3 && (
                <g opacity={on ? 1 : 0.4}>
                  {/* 多色チップ + 色とりどりの星 */}
                  <PaintChip x={1398} y={cy} color={on ? PC.yellow : SP.dim} scale={0.3} />
                  <PaintChip x={1440} y={cy} color={on ? PC.blue : SP.dim} scale={0.3} />
                  <PaintChip x={1482} y={cy} color={on ? PC.green : SP.dim} scale={0.3} />
                  <circle cx={1538} cy={cy - 12} r={5} fill={on ? STAR_COLORS[0] : SP.dim} />
                  <circle cx={1566} cy={cy + 10} r={4} fill={on ? STAR_COLORS[2] : SP.dim} />
                  <circle cx={1592} cy={cy - 6} r={4} fill={on ? STAR_COLORS[3] : SP.dim} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// ===== ディスパッチ =====

const MOTIF_MAP: Record<string, React.FC<SceneProps>> = {
  nozoki_matome: NozokiMatomeScene,
  nozoki_more_colors: MoreColorsScene,
  nozoki_paint_to_number: PaintToNumberScene,
  nozoki_reverse_problem: ReverseProblemScene,
  nozoki_oneway_arrows: OnewayArrowsScene,
  nozoki_digits300: Digits300Scene,
  nozoki_super_computer: SuperComputerScene,
  nozoki_years_quiz: YearsQuizScene,
  nozoki_universe_end: UniverseEndScene,
  nozoki_universe_repeat: UniverseRepeatScene,
  nozoki_correct_but_late: CorrectButLateScene,
  nozoki_time_wall: TimeWallScene,
  nozoki_your_phone: YourPhoneScene,
  nozoki_magic_sign: MagicSignScene,
  nozoki_world_handshake: WorldHandshakeScene,
  nozoki_karaburi: KaraburiScene,
  nozoki_pochi_backstage: PochiBackstageScene,
  nozoki_receipt_joke: ReceiptJokeScene,
  nozoki_omiyage_open: OmiyageOpenScene,
  nozoki_question_flip: QuestionFlipScene,
  nozoki_flip_your_problem: FlipYourProblemScene,
};

export const NOZOKI_CH3_MOTIFS = Object.keys(MOTIF_MAP);

export const NozokiCh3Scene: React.FC<SceneProps & { motif: string }> = ({ scene, variant = 0, motif }) => {
  const C = MOTIF_MAP[motif];
  if (!C) return null;
  return <C scene={scene} variant={variant} />;
};
