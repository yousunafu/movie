// 「なぜ高層ビルは生まれたのか」: 第3章「水は、勝手に上がらない。」前半 (住めない〜ニューヨークの屋根の桶)
// 担当範囲: 台本 docs/koso-script-v7.txt の 114〜124行目 (文#113〜#123・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb3_ で始める。WobbleDefs の seed はこのファイルでは 700〜710 を使う。
// 設計書: docs/koso-ch3-design.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層-7)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。

import React from "react";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  skyDay: "#CFE2F0",
  skyHaze: "#E2EAEF",
  skyDusk: "#F0CBA0",
  water: "#7FB4D8",
  waterDeep: "#4E87B0",
  waterPale: "#BFDCEE",
  wood: "#A77C4E",
  woodDark: "#7E5B36",
  woodWet: "#6B4A2E",
  brick: "#B4704C",
  stone: "#CFC6B4",
  tile: "#DCD6C6",
  plaster: "#E6DFCE",
  glass: "#AFC6D4",
  rust: "#8E5A3C",
  ink2: "#3A4350",
} as const;

// ===================================================================
// ★木の給水桶 (#119 と #123 に出る「同じ物」。形はここで固定する)
//   原点 = 台座の脚の下端・中央。上へ伸びる (y は負)。
//   縦板28枚 / 鋼のたが3本 (合わせ目にターンバックル) / 円錐の屋根 + 通気の突起 /
//   4本脚の木の台座 (筋交い付き) / 側面から下へ給水の立管1本。
// ===================================================================
const TK_PED = 110;              // 台座の高さ
const TK_BODY = 280;             // 胴の高さ
const TK_R = 150;                // 胴の半径
const TK_ROOF = 80;              // 屋根の高さ
const TK_H = TK_PED + TK_BODY + TK_ROOF + 22;   // 全高 492

const WoodenTank: React.FC<{
  x: number; y: number; s?: number; f?: number;
  pipeDown?: number; opacity?: number; rim?: boolean;
}> = ({ x, y, s = 1, f = 0, pipeDown = 54, opacity = 1, rim = false }) => {
  const bot = -TK_PED;                       // 胴の下端
  const top = -(TK_PED + TK_BODY);           // 胴の上端
  const bulge = 26;                          // 胴の底のふくらみ
  const hoops = [bot - 26, bot - TK_BODY / 2, top + 26];
  const staveX = Array.from({ length: 27 }, (_, i) => -TK_R + ((i + 1) * 2 * TK_R) / 28);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {/* --- 4本脚の木の台座 (手前2本・奥2本) + 筋交い --- */}
      <g>
        {[-140, -58, 58, 140].map((lx, i) => (
          <rect key={lx} x={lx - 13} y={bot} width={26} height={TK_PED}
            fill={i === 1 || i === 2 ? C.woodDark : C.wood} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <g stroke={C.woodDark} strokeWidth={10} strokeLinecap="round">
          <line x1={-140} y1={bot + 8} x2={-58} y2={-14} />
          <line x1={-58} y1={bot + 8} x2={-140} y2={-14} />
          <line x1={58} y1={bot + 8} x2={140} y2={-14} />
          <line x1={140} y1={bot + 8} x2={58} y2={-14} />
        </g>
        {/* 脚をつなぐ水平の貫 */}
        <rect x={-150} y={bot + TK_PED * 0.52} width={300} height={13}
          fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 桶の受け梁 */}
        <rect x={-166} y={bot - 4} width={332} height={24} rx={5}
          fill={C.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
        <Rivets x1={-140} y1={bot + 8} x2={140} y2={bot + 8} n={7} r={5} fill={BP.ironDark} />
      </g>

      {/* --- 胴 (縦板を円筒に並べる) --- */}
      <path
        d={`M ${-TK_R} ${top} L ${TK_R} ${top} L ${TK_R} ${bot} Q 0 ${bot + bulge} ${-TK_R} ${bot} Z`}
        fill={C.wood} stroke={KRP.ink} strokeWidth={7}
      />
      {/* 板の間の線 (28枚ぶん) */}
      <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.95}>
        {staveX.map((sx) => (
          <line key={sx} x1={sx} y1={top} x2={sx} y2={bot + bulge * (1 - (sx / TK_R) ** 2)} />
        ))}
      </g>
      {/* 円筒の陰 (左右の端が暗い) */}
      <path d={`M ${-TK_R} ${top} L ${-TK_R + 34} ${top} L ${-TK_R + 34} ${bot + 10} L ${-TK_R} ${bot} Z`}
        fill={C.woodWet} opacity={0.3} />
      <path d={`M ${TK_R} ${top} L ${TK_R - 40} ${top} L ${TK_R - 40} ${bot + 6} L ${TK_R} ${bot} Z`}
        fill={C.woodWet} opacity={0.22} />
      {rim && (
        <rect x={TK_R - 20} y={top + 10} width={13} height={TK_BODY - 30}
          fill={KRP.yellow} opacity={0.45} />
      )}
      {/* 水が染みた下半分 */}
      <path d={`M ${-TK_R} ${bot - 70} L ${TK_R} ${bot - 70} L ${TK_R} ${bot} Q 0 ${bot + bulge} ${-TK_R} ${bot} Z`}
        fill={C.woodWet} opacity={0.2} />

      {/* --- 鋼のたが3本 + ターンバックル --- */}
      {hoops.map((hy, i) => (
        <g key={hy}>
          <rect x={-TK_R - 6} y={hy} width={TK_R * 2 + 12} height={17} rx={3}
            fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-TK_R - 6} y={hy + 3} width={TK_R * 2 + 12} height={4}
            fill={KRP.white} opacity={0.26} />
          {/* 合わせ目のターンバックル (ボルトで締める金具) */}
          <g transform={`translate(${TK_R * (i % 2 === 0 ? 0.5 : -0.5)} ${hy + 8.5})`}>
            <rect x={-13} y={-20} width={26} height={40} rx={6}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
            <HexBolt x={0} y={-13} r={7} fill={BP.steelDark} />
            <HexBolt x={0} y={13} r={7} fill={BP.steelDark} />
          </g>
        </g>
      ))}

      {/* --- 円錐の屋根 + 通気の突起 --- */}
      <polygon points={`${-TK_R - 17},${top + 4} 0,${top - TK_ROOF} ${TK_R + 17},${top + 4}`}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={6.5} />
      <g stroke={C.woodWet} strokeWidth={4} opacity={0.75}>
        {[-0.72, -0.36, 0, 0.36, 0.72].map((k) => (
          <line key={k} x1={0} y1={top - TK_ROOF + 6} x2={(TK_R + 15) * k} y2={top + 2} />
        ))}
      </g>
      <rect x={-TK_R - 20} y={top} width={TK_R * 2 + 40} height={13} rx={4}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-11} y={top - TK_ROOF - 24} width={22} height={28} rx={4}
        fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-20} y={top - TK_ROOF - 32} width={40} height={11} rx={4}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />

      {/* --- 側面から下へ降りる給水の立管 --- */}
      <g>
        <rect x={TK_R - 14} y={bot - 56} width={46} height={17}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={TK_R + 16} y={bot - 56} width={19} height={TK_PED + pipeDown + 56}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
        {[bot + 10, 10].map((cy) => (
          <rect key={cy} x={TK_R + 9} y={cy} width={33} height={14} rx={3}
            fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* 継手のフランジ */}
        <rect x={TK_R + 7} y={bot - 60 + (Math.sin(f / 19) > 9 ? 1 : 0)} width={37} height={13} rx={3}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    </g>
  );
};

// 鳩 (#123)。flap>0 で羽ばたく
const Pigeon: React.FC<{ x: number; y: number; s?: number; f?: number; fly?: boolean }> =
  ({ x, y, s = 1, f = 0, fly = false }) => {
    const w = fly ? Math.sin(f / 3.2) * 34 : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={30} ry={19} fill={C.ink2} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={22} cy={-16} r={12} fill={C.ink2} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="33,-17 48,-13 33,-9" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2.5} />
        <polygon points="-26,-2 -56,-14 -52,4" fill={C.ink2} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M -4 -10 Q 8 ${-10 - w * 1.1} 26 ${-4 - w}`} fill="none"
          stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
        {!fly && (
          <g stroke={KRP.ink} strokeWidth={4}>
            <line x1={-2} y1={18} x2={-2} y2={30} />
            <line x1={12} y1={18} x2={12} y2={30} />
          </g>
        )}
      </g>
    );
  };

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #113 第3章、水は、勝手に上がらない。 =====
// 格: 山
// どこ: 高層階の部屋の洗面所。タイル壁・鏡・石の天板・陶器の洗面台・真鍮の蛇口。右手の窓の外は高い街並み
// 演出: 洗面台に寄る。人は天板の右で横向きに立ち、左手を伸ばして蛇口のハンドルをひねる。水は落ちてこない
// 動き: ハンドルが回る → 蛇口の先に水滴が1つ残って震えるだけ (落ちない)。？が浮き、窓の光に埃が舞う。ゆっくり寄る
const Kb3ShouTobira: React.FC<{ f: number }> = ({ f }) => {
  const turn = easeOut(clamp01(seg(f, 8, 26)));            // ハンドルを回す
  const drop = 1 + Math.sin(f / 5) * 0.12;                 // 水滴が震える (落ちない)
  const z = 1 + 0.052 * easeOut(clamp01(seg(f, 0, 42)));
  const CTR = 486;                                          // 天板の上面
  const FLOOR = 814;
  return (
    <Frame f={f} seed={700} bg={KRP.cream}
      over={<ChapterDoor num={3} title="水は、勝手に上がらない。" t={seg(f, 12, 30)}
        left={1136} top={92} width={716} />}>
      <g transform={zoomAt(z, 560, 470)}>
        {/* --- タイル壁 --- */}
        <rect x={-20} y={-20} width={W + 40} height={FLOOR + 20} fill={C.tile} />
        <g stroke={C.plaster} strokeWidth={4} opacity={0.85}>
          {Array.from({ length: 18 }, (_, i) => (
            <line key={`th${i}`} x1={-20} y1={i * 50} x2={W + 20} y2={i * 50} />
          ))}
          {Array.from({ length: 25 }, (_, i) => (
            <line key={`tv${i}`} x1={i * 80} y1={-20} x2={i * 80} y2={FLOOR} />
          ))}
        </g>
        {/* 腰の見切り */}
        <rect x={-20} y={CTR - 128} width={W + 40} height={11} fill={C.stone}
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.8} />

        {/* --- 窓 (外は高さのある街) --- */}
        <g>
          <rect x={1180} y={300} width={650} height={342} fill={C.skyDay}
            stroke={KRP.ink} strokeWidth={9} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const bx = 1196 + i * 108;
            const bh = 70 + rnd(i * 3 + 1) * 190;
            return (
              <g key={i}>
                <rect x={bx} y={642 - bh} width={88} height={bh} fill={C.glass}
                  stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
                <g fill={KRP.white} opacity={0.5}>
                  {Array.from({ length: Math.floor(bh / 34) }, (_, k) => (
                    <rect key={k} x={bx + 14} y={642 - bh + 14 + k * 34} width={60} height={16} />
                  ))}
                </g>
              </g>
            );
          })}
          {/* 窓枠の桟 */}
          <g stroke={KRP.ink} strokeWidth={8}>
            <line x1={1505} y1={300} x2={1505} y2={642} />
            <line x1={1180} y1={471} x2={1830} y2={471} />
          </g>
          <rect x={1160} y={642} width={690} height={22} fill={C.stone}
            stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 窓から入る光 + 埃 */}
        <polygon points={`1180,300 1830,642 1430,${FLOOR} 700,${FLOOR}`}
          fill={KRP.white} opacity={0.17} />
        <g fill={KRP.white} opacity={0.5}>
          {Array.from({ length: 16 }, (_, i) => {
            const px = 760 + rnd(i + 11) * 900;
            const py = 360 + ((rnd(i + 31) * 420 + f * 1.3) % 420);
            return <circle key={i} cx={px} cy={py} r={2.6 + rnd(i + 51) * 3} />;
          })}
        </g>

        {/* --- 鏡 --- */}
        <g>
          <rect x={170} y={80} width={530} height={318} rx={16} fill={BP.brass}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={188} y={98} width={494} height={282} rx={10} fill={C.glass}
            stroke={KRP.ink} strokeWidth={5} />
          <polygon points="210,380 420,98 520,98 310,380" fill={KRP.white} opacity={0.33} />
          {/* 鏡に映るタイルの目地 */}
          <g stroke={KRP.white} strokeWidth={3} opacity={0.3}>
            {[150, 220, 290, 350].map((y) => <line key={y} x1={190} y1={y} x2={680} y2={y} />)}
          </g>
        </g>

        {/* --- 石の天板 --- */}
        <rect x={-20} y={CTR} width={1100} height={38} fill={C.stone}
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={-20} y={CTR + 38} width={1100} height={16} fill={C.plaster}
          stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <g stroke={KRP.white} strokeWidth={4} opacity={0.4}>
          <line x1={0} y1={CTR + 12} x2={1060} y2={CTR + 12} />
        </g>

        {/* --- 陶器の洗面台 (天板にはめ込み) --- */}
        <g>
          <path d={`M 360 ${CTR} L 800 ${CTR} L 766 ${CTR + 122} Q 580 ${CTR + 158} 394 ${CTR + 122} Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          <ellipse cx={580} cy={CTR + 6} rx={214} ry={26} fill={C.plaster}
            stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={580} cy={CTR + 10} rx={180} ry={18} fill={KRP.white} opacity={0.8} />
          {/* 排水口 */}
          <ellipse cx={580} cy={CTR + 118} rx={34} ry={13} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3}>
            <line x1={552} y1={CTR + 118} x2={608} y2={CTR + 118} />
          </g>
          {/* 乾いた水垢の輪 */}
          <g fill="none" stroke={C.stone} strokeWidth={4} opacity={0.6}>
            <ellipse cx={580} cy={CTR + 86} rx={118} ry={22} />
            <ellipse cx={580} cy={CTR + 62} rx={152} ry={26} />
          </g>
        </g>

        {/* --- 真鍮の蛇口 --- */}
        <g>
          {/* 台座 */}
          <rect x={542} y={CTR - 22} width={76} height={26} rx={7} fill={BP.brassDark}
            stroke={KRP.ink} strokeWidth={5} />
          {/* 立ち上がり */}
          <rect x={560} y={352} width={40} height={136} fill={BP.brass}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={568} y={356} width={11} height={128} fill={BP.brassLight} opacity={0.75} />
          {/* 弧を描く首 */}
          <path d="M 580 356 Q 580 300 526 304 L 526 404" fill="none"
            stroke={KRP.ink} strokeWidth={46} strokeLinecap="round" />
          <path d="M 580 356 Q 580 300 526 304 L 526 404" fill="none"
            stroke={BP.brass} strokeWidth={34} strokeLinecap="round" />
          <path d="M 580 352 Q 578 308 530 312" fill="none"
            stroke={BP.brassLight} strokeWidth={9} opacity={0.8} />
          {/* 吐水口の金具 */}
          <rect x={504} y={398} width={44} height={22} rx={5} fill={BP.brassDark}
            stroke={KRP.ink} strokeWidth={5} />
          {/* ハンドル2つ (右を回している) */}
          {[{ hx: 458, r: 0 }, { hx: 712, r: -74 * turn }].map(({ hx, r }) => (
            <g key={hx} transform={`translate(${hx} ${CTR - 34}) rotate(${r})`}>
              <circle cx={0} cy={0} r={13} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
              <g stroke={KRP.ink} strokeWidth={15} strokeLinecap="round">
                <line x1={-32} y1={0} x2={32} y2={0} />
                <line x1={0} y1={-32} x2={0} y2={32} />
              </g>
              <g stroke={BP.brass} strokeWidth={9} strokeLinecap="round">
                <line x1={-30} y1={0} x2={30} y2={0} />
                <line x1={0} y1={-30} x2={0} y2={30} />
              </g>
              <circle cx={0} cy={0} r={8} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* ★落ちない水滴 1つだけ */}
          <path d={`M 526 ${418} q ${-23 * drop} ${32 * drop} 0 ${54 * drop} q ${23 * drop} ${-22 * drop} 0 ${-54 * drop}`}
            fill={C.water} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={519} cy={442} r={6} fill={KRP.white} opacity={0.85} />
        </g>

        {/* --- 床 --- */}
        <rect x={-20} y={FLOOR} width={W + 40} height={H - FLOOR + 20} fill={C.plaster}
          stroke={KRP.ink} strokeWidth={8} />
        <g stroke={C.stone} strokeWidth={5} opacity={0.9}>
          {[850, 910, 980, 1060].map((y) => <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} />)}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={i * 190 - 60} y1={FLOOR} x2={i * 230 - 180} y2={H} />
          ))}
        </g>

        {/* --- 人 (天板の右。手前の腕を蛇口へ伸ばす) --- */}
        {/* 肩の位置 = 足元から上へ 148*s、中心から左へ 67*s (Person の腕の付け根と同じ) */}
        <Person x={1030} y={FLOOR} s={1.86} f={f} cloth="#48566E" clothDark="#333E54"
          gaze={[-5, 1]} />
        {(() => {
          const PS = 1.86, PXp = 1030;
          const shX = PXp - 62 * PS, shY = FLOOR - 146 * PS;   // 肩 (906, 542)
          const elX = 812, elY = 506;                          // 肘
          const haX = 742, haY = 462;                          // 手首
          const armW = 22 * PS;
          return (
            <g>
              {/* 上腕 → 前腕 (袖) */}
              <path d={`M ${shX} ${shY} L ${elX} ${elY} L ${haX} ${haY}`} fill="none"
                stroke={KRP.ink} strokeWidth={armW + 11} strokeLinecap="round"
                strokeLinejoin="round" />
              <path d={`M ${shX} ${shY} L ${elX} ${elY} L ${haX} ${haY}`} fill="none"
                stroke="#48566E" strokeWidth={armW} strokeLinecap="round"
                strokeLinejoin="round" />
              {/* 肘の折り目 */}
              <path d={`M ${elX + 10} ${elY - 14} q -10 14 -2 28`} fill="none"
                stroke="#333E54" strokeWidth={6} opacity={0.85} />
              {/* 袖口 */}
              <g transform={`rotate(-32 ${haX + 14} ${haY + 8})`}>
                <rect x={haX + 2} y={haY - 14} width={24} height={44} rx={7}
                  fill="#333E54" stroke={KRP.ink} strokeWidth={5} />
              </g>
              {/* 掌 (ハンドルを握る) */}
              <ellipse cx={haX - 18} cy={haY - 6} rx={30} ry={25}
                transform={`rotate(-24 ${haX - 18} ${haY - 6})`}
                fill="#EBCCAA" stroke={KRP.ink} strokeWidth={5} />
              {/* 指4本 + 親指 */}
              <g stroke={KRP.ink} strokeWidth={4}>
                {[0, 1, 2, 3].map((i) => (
                  <path key={i} d={`M ${haX - 30} ${haY - 24 + i * 12} q -18 -2 -26 8`}
                    fill="none" stroke="#EBCCAA" strokeWidth={12} strokeLinecap="round" />
                ))}
                <path d={`M ${haX - 24} ${haY + 14} q -4 16 10 20`} fill="none"
                  stroke="#EBCCAA" strokeWidth={13} strokeLinecap="round" />
              </g>
              <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.75}>
                <path d={`M ${haX - 40} ${haY - 20} q -14 0 -20 8`} />
                <path d={`M ${haX - 42} ${haY - 6} q -14 0 -20 8`} />
              </g>
            </g>
          );
        })()}

        {/* --- 出ないことの印 (乾いた鉢の中) --- */}
        <XMark x={580} y={CTR + 72} s={0.62} t={seg(f, 24, 34)} />
      </g>
      <QMark x={942} y={128} s={0.98} f={f} t={seg(f, 28, 40)} />
      <TagPlate x={1392} y={762} text="出ない" size={50} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #114 骨ができて、人も登れました。 =====
// 格: 図
// どこ: 方眼の図面の上。5本柱の装置だけを置く (背景・人なし)
// 演出: 左の2本「骨」「箱」だけが立ち、右の3本「水」「灯り」「空気」は倒れている。街はまだ少し傾く
// 動き: 立った2本を○が囲みにいく。札が出る。装置がわずかに揺れ、ゆっくり寄る
const Kb3HoneToHito: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.03 * easeOut(clamp01(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={701} bg={KRP.cream}>
      <GridPaper />
      <g transform={zoomAt(z, 960, 600)}>
        <TowerOnPillars
          f={f}
          standing={["hone", "hako"]}
          fallen={{ mizu: 1, akari: 1, kuuki: 1 }}
          labels
          ground
          groundLabel="地価"
          tiltScale={0.22}
        />
        {/* 立った2本を○で囲む */}
        <Maru x={380} y={688} s={1.04} t={seg(f, 12, 28)} />
        <Maru x={670} y={688} s={1.04} t={seg(f, 18, 34)} />
        {/* 倒れた3本の跡 (座だけが残る) */}
        <g opacity={0.5}>
          {[960, 1250, 1540].map((px) => (
            <g key={px}>
              <rect x={px - 70} y={814} width={140} height={14} rx={4}
                fill={BP.slabDark} stroke={KRP.ink} strokeWidth={4} />
              <g stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 10" opacity={0.7}>
                <line x1={px - 62} y1={814} x2={px - 62} y2={560} />
                <line x1={px + 62} y1={814} x2={px + 62} y2={560} />
              </g>
            </g>
          ))}
        </g>
      </g>
      <TagPlate x={525} y={300} text="立った" size={52} t={seg(f, 24, 38)} />
      <TagPlate x={1255} y={300} text="あと3本" size={44} t={seg(f, 30, 42)}
        color={KPP.mizu} />
    </Frame>
  );
};

// ===== #115 それでも、まだ住めません。水が来ないからです。 =====
// 格: 並
// どこ: 上層階のがらんどうの部屋。床板・下地のままの間柱の壁・大きな窓。描くのは「壁から出た配管の口」1つだけ
// 演出: 窓から光の筋が床に落ちる。人は1人、背中を向けて立ちつくす
// 動き: 光の筋がじわりと広がり、埃が舞う。？が浮き、配管の口の札が出る
const Kb3MadaSumenai: React.FC<{ f: number }> = ({ f }) => {
  const FL = 720;
  const beam = easeOut(clamp01(seg(f, 4, 32)));
  return (
    <Frame f={f} seed={702} bg={KRP.cream}>
      {/* 壁の下地 (石膏の塗り残し) */}
      <rect x={-20} y={-20} width={W + 40} height={FL + 20} fill={C.plaster} />
      {/* 間柱 (下地のままの壁) */}
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const sx = 40 + i * 120;
          return (
            <g key={i}>
              <rect x={sx} y={100} width={34} height={FL - 100} fill={C.wood}
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={sx + 6} y={100} width={9} height={FL - 100} fill={C.woodDark} opacity={0.6} />
            </g>
          );
        })}
        {/* 胴縁 */}
        {[300, 520].map((y) => (
          <rect key={y} x={40} y={y} width={1020} height={26} fill={C.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 天井と床の受け */}
        <rect x={-20} y={72} width={1120} height={34} fill={C.woodDark}
          stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* 大きな窓 */}
      <g>
        <rect x={1150} y={150} width={660} height={552} fill={C.skyHaze}
          stroke={KRP.ink} strokeWidth={10} />
        {/* 外の高い街 (遠く・薄く) */}
        <g opacity={0.55}>
          {[0, 1, 2, 3, 4].map((i) => {
            const bx = 1166 + i * 130;
            const bh = 120 + rnd(i * 7 + 3) * 300;
            return <rect key={i} x={bx} y={702 - bh} width={104} height={bh}
              fill={C.glass} stroke={KRP.ink} strokeWidth={4} />;
          })}
        </g>
        <g stroke={KRP.ink} strokeWidth={9}>
          <line x1={1480} y1={150} x2={1480} y2={702} />
          <line x1={1150} y1={426} x2={1810} y2={426} />
        </g>
        <rect x={1130} y={702} width={700} height={20} fill={C.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* 窓から入る光の筋 */}
      <polygon
        points={`1150,150 1810,702 ${1500 - 420 * beam},${H} ${820 - 300 * beam},${H}`}
        fill={KRP.white} opacity={0.1 + 0.14 * beam}
      />
      <g fill={KRP.white} opacity={0.55}>
        {Array.from({ length: 18 }, (_, i) => {
          const px = 740 + rnd(i + 5) * 980;
          const py = 200 + ((rnd(i + 25) * 620 + f * 1.6) % 620);
          return <circle key={i} cx={px} cy={py} r={2.4 + rnd(i + 45) * 3.4} />;
        })}
      </g>

      {/* 床板 */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill={C.wood}
        stroke={KRP.ink} strokeWidth={9} />
      <g stroke={C.woodDark} strokeWidth={5} opacity={0.9}>
        {[772, 840, 920, 1014].map((y) => <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} />)}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 210 - 40} y1={FL} x2={i * 262 - 220} y2={H} />
        ))}
      </g>

      {/* ★主役: 壁から出た配管の口 1つ (継手・フランジ・ボルト・溶接の玉まで)
          「一つを、大きく」。元の作図 (中心 350,540) をそのまま 1.95 倍に引き伸ばす */}
      <g transform="translate(350 540) scale(1.95) translate(-350 -540)">
        {/* 壁の抜き穴 */}
        <rect x={236} y={498} width={128} height={118} rx={8} fill={BP.shaftDeep}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 壁付きのフランジ */}
        <rect x={228} y={520} width={28} height={76} rx={5} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 立ち上がり管 */}
        <rect x={276} y={520} width={50} height={96} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={284} y={524} width={13} height={88} fill={BP.steelLight} opacity={0.6} />
        {/* エルボ (継手) */}
        <path d="M 301 552 q 0 -42 46 -42 l 48 0" fill="none" stroke={KRP.ink} strokeWidth={62}
          strokeLinecap="round" />
        <path d="M 301 552 q 0 -42 46 -42 l 48 0" fill="none" stroke={BP.iron} strokeWidth={50}
          strokeLinecap="round" />
        {/* 溶接の玉 */}
        <g fill={BP.rust} stroke={KRP.ink} strokeWidth={2.5}>
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={322 + i * 5} cy={534 - i * 4.4} r={6} />
          ))}
        </g>
        {/* 先端のフランジ + ボルト + 盲板 (まだ何も繋がっていない) */}
        <rect x={392} y={468} width={24} height={86} rx={5} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={416} y={482} width={18} height={58} rx={4} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={404} y={482} r={11} />
        <HexBolt x={404} y={540} r={11} />
        <HexBolt x={404} y={511} r={11} />
        {/* 吊り金具 */}
        <rect x={262} y={476} width={78} height={14} rx={4} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={4} />
        <Rivets x1={276} y1={483} x2={328} y2={483} n={3} r={5} />
        {/* 乾いている印 */}
        <XMark x={470} y={512} s={0.5} t={seg(f, 22, 34)} />
      </g>

      {/* 人 1人 (背中。立ちつくす) */}
      <Person x={1030} y={796} s={1.72} f={f} cloth="#55606E" clothDark="#3C4552"
        hair="cap" gaze={[0, 0]} />
      <QMark x={866} y={318} s={0.86} f={f} t={seg(f, 26, 40)} />
      <TagPlate x={356} y={776} text="配管の口" size={40} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #116 水は、押されないと登りません。 =====
// 格: 図
// どこ: 方眼の上。縦の鋳鉄管を画面の高さいっぱい (y=50〜1010) に1本だけ立てる
// 演出: 管の中の水位が途中で止まる。下から押す矢印は短く、届かせたい高さには×
// 動き: 水位が上がって止まり、水面が波打つ。押す矢印が伸びきらない。目標の破線が引かれる
const Kb3OsasarenaiTo: React.FC<{ f: number }> = ({ f }) => {
  const PX = 700, PW = 95;                 // 管の中心と内半径
  const TOP = 50, BOT = 1010;
  const rise = easeOut(clamp01(seg(f, 6, 28)));
  const lv = lerp(BOT - 20, 660, rise) + Math.sin(f / 6) * 5 * rise;
  const GOAL = 220;
  // 水面の波
  const wave = (y: number) =>
    `M ${PX - PW + 10} ${y} q ${PW * 0.45} ${-12 + Math.sin(f / 5) * 9} ${PW * 0.9} 0 ` +
    `q ${PW * 0.45} ${12 - Math.sin(f / 5) * 9} ${PW * 0.9} 0`;
  return (
    <Frame f={f} seed={703} bg={KRP.cream}>
      <GridPaper />
      {/* --- 管 --- */}
      <g>
        {/* 管の外壁 */}
        <rect x={PX - PW - 24} y={TOP} width={(PW + 24) * 2} height={BOT - TOP}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={8} />
        {/* 内径 (空) */}
        <rect x={PX - PW} y={TOP} width={PW * 2} height={BOT - TOP}
          fill={C.plaster} stroke={KRP.ink} strokeWidth={5} />
        {/* 外壁のハイライト */}
        <rect x={PX - PW - 18} y={TOP} width={13} height={BOT - TOP}
          fill={BP.steelLight} opacity={0.55} />
        {/* 中の水 */}
        <rect x={PX - PW + 4} y={lv} width={PW * 2 - 8} height={BOT - lv - 4} fill={C.water} />
        <rect x={PX - PW + 4} y={lv} width={26} height={BOT - lv - 4} fill={C.waterPale} opacity={0.6} />
        <path d={wave(lv)} fill="none" stroke={C.waterDeep} strokeWidth={9} strokeLinecap="round" />
        <path d={wave(lv + 26)} fill="none" stroke={C.waterPale} strokeWidth={5} opacity={0.8} />
        {/* 水の中の泡 */}
        <g fill={KRP.white} opacity={0.5}>
          {Array.from({ length: 7 }, (_, i) => {
            const by = BOT - 40 - ((rnd(i + 2) * 300 + f * 3.4) % (BOT - lv - 60));
            return <circle key={i} cx={PX - 60 + rnd(i + 9) * 120} cy={by} r={5 + rnd(i + 19) * 5} />;
          })}
        </g>

        {/* フランジ継手 2か所 (ボルト・溶接の玉まで) */}
        {[300, 620].map((fy) => (
          <g key={fy}>
            <rect x={PX - PW - 70} y={fy} width={(PW + 70) * 2} height={48} rx={6}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={7} />
            <rect x={PX - PW - 70} y={fy + 6} width={(PW + 70) * 2} height={8}
              fill={KRP.white} opacity={0.22} />
            <HexBolt x={PX - PW - 44} y={fy + 24} r={15} />
            <HexBolt x={PX + PW + 44} y={fy + 24} r={15} />
            {/* 合わせ目のガスケット */}
            <line x1={PX - PW - 70} y1={fy + 24} x2={PX + PW + 70} y2={fy + 24}
              stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            {/* 溶接の玉 */}
            <g fill={BP.rust} stroke={KRP.ink} strokeWidth={2.5}>
              {Array.from({ length: 6 }, (_, i) => (
                <circle key={i} cx={PX - PW - 20 + i * 13} cy={fy - 6} r={6} />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <circle key={`r${i}`} cx={PX + PW + 20 - i * 13} cy={fy - 6} r={6} />
              ))}
            </g>
          </g>
        ))}
        {/* 管を壁に留める金具 */}
        {[460, 860].map((cy) => (
          <g key={cy}>
            <rect x={PX - PW - 56} y={cy} width={(PW + 56) * 2} height={26} rx={7}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            <HexBolt x={PX - PW - 38} y={cy + 13} r={10} />
            <HexBolt x={PX + PW + 38} y={cy + 13} r={10} />
          </g>
        ))}
        {/* 管に刻んだ目盛 */}
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.65}>
          {Array.from({ length: 14 }, (_, i) => {
            const y = 150 + i * 60;
            const long = i % 5 === 0;
            return <line key={i} x1={PX + PW + 4} y1={y} x2={PX + PW + (long ? 26 : 15)} y2={y} />;
          })}
        </g>
      </g>

      {/* --- 届かせたい高さ (破線) --- */}
      <g opacity={easeOut(clamp01(seg(f, 16, 34)))}>
        <line x1={430} y1={GOAL} x2={1580} y2={GOAL} stroke={KRP.red} strokeWidth={7}
          strokeDasharray="26 20" />
        <XMark x={PX} y={GOAL + 104} s={1.05} t={seg(f, 24, 38)} />
      </g>

      {/* --- 下から押す力 (短い = 足りない) --- */}
      <ForceArrow x={452} y={980} len={168} rot={-90} w={26} color={KRP.red}
        t={seg(f, 8, 26)} label="押す力" labelSize={38} />
      {/* 足りない分 (灰色の破線) */}
      <g opacity={0.55}>
        <line x1={452} y1={812} x2={452} y2={GOAL + 20} stroke={KRP.grayDark}
          strokeWidth={6} strokeDasharray="18 16" />
      </g>

      <TagPlate x={1080} y={660} text="水位" size={48} t={seg(f, 12, 26)} />
      <TagPlate x={1330} y={220} text="届かない" size={46} t={seg(f, 28, 42)} color={KRP.red} />
      <TagPlate x={1430} y={790} text="鋳鉄の立管" size={36} t={seg(f, 20, 34)} />
    </Frame>
  );
};

// ===== #117 日本の水道が保証する圧力は、2階か3階まで。 =====
// ★#117 と #118 は「まったく同じ図・同じ座標」で水位だけ違う。
//   見る側が「同じ図だ」とわかるよう、図そのものを1つの部品にして座標を共有する。
const SC_X = 420, SC_TOP = 80, SC_BOT = 830, SC_MAX = 10;
const BLD_L = 620, BLD_R = 1420, RISER = 1310;
const scY = (n: number) => lerp(SC_BOT, SC_TOP, n / SC_MAX);

// #117 と #118 の「どこの国の話か」を示す小旗 (札の左に添える)
const SmallFlag: React.FC<{ x: number; y: number; kind: "jp" | "us"; t?: number }> = ({ x, y, kind, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = 84, h = 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={4.5} />
      {kind === "jp" ? (
        <circle cx={0} cy={0} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
      ) : (
        <g>
          {[0, 2, 4, 6].map((i) => (
            <rect key={i} x={-w / 2} y={-h / 2 + (i * h) / 7} width={w} height={h / 7} fill={KRP.red} />
          ))}
          <rect x={-w / 2} y={-h / 2} width={w * 0.42} height={(h * 4) / 7} fill={KRP.blueDeep} />
          <g fill={KRP.white}>
            {[0, 1, 2].map((cx) =>
              [0, 1].map((cy) => (
                <circle key={`${cx}-${cy}`} r={2.6}
                  cx={-w / 2 + w * 0.42 * (0.22 + cx * 0.28)}
                  cy={-h / 2 + ((h * 4) / 7) * (0.3 + cy * 0.4)} />
              ))
            )}
          </g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none"
            stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
    </g>
  );
};

const FloorsWaterFig: React.FC<{
  f: number; level: number; placeText: string; lvText: string; flag: "jp" | "us";
}> = ({ f, level, placeText, lvText, flag }) => {
  const rise = easeOut(clamp01(seg(f, 6, 30)));
  const lv = level * rise;
  const wy = scY(lv) + Math.sin(f / 7) * 4 * rise;
  const fh = (SC_BOT - SC_TOP) / SC_MAX;              // 1階ぶんの高さ 75
  return (
    <g>
      <GridPaper />
      {/* --- 縦の階数の数直線 (1〜10階) --- */}
      <FloorScale x={SC_X} yTop={SC_TOP} yBot={SC_BOT} max={SC_MAX}
        marks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} t={seg(f, 2, 18)} />

      {/* --- ビルの断面 (図そのものを作り込む) --- */}
      <g>
        {/* 外壁 */}
        <rect x={BLD_L} y={SC_TOP} width={BLD_R - BLD_L} height={SC_BOT - SC_TOP}
          fill={C.plaster} stroke={KRP.ink} strokeWidth={8} />
        {/* 各階のスラブ */}
        {Array.from({ length: SC_MAX + 1 }, (_, n) => (
          <rect key={n} x={BLD_L - 10} y={scY(n) - 7} width={BLD_R - BLD_L + 20} height={15}
            fill={BP.slab} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 屋上のパラペット */}
        <rect x={BLD_L - 16} y={SC_TOP - 22} width={BLD_R - BLD_L + 32} height={24} rx={4}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 各階の窓 (3つずつ) */}
        {Array.from({ length: SC_MAX }, (_, i) => {
          const n = i + 1;
          const wyy = scY(n) + 18;
          return (
            <g key={n}>
              {[680, 860, 1040].map((wx) => (
                <rect key={wx} x={wx} y={wyy} width={66} height={fh - 40} rx={4}
                  fill={C.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
              ))}
            </g>
          );
        })}
        {/* 水に浸かっている階を薄く塗る */}
        <rect x={BLD_L + 8} y={wy} width={BLD_R - BLD_L - 16} height={Math.max(0, SC_BOT - wy - 8)}
          fill={C.waterPale} opacity={0.42} />

        {/* --- 立管 (各階へ枝分かれ) --- */}
        <rect x={RISER - 17} y={SC_TOP} width={34} height={SC_BOT - SC_TOP}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={6} />
        <rect x={RISER - 11} y={SC_TOP} width={9} height={SC_BOT - SC_TOP}
          fill={BP.steelLight} opacity={0.6} />
        {/* 立管の中の水 */}
        <rect x={RISER - 11} y={wy} width={22} height={Math.max(0, SC_BOT - wy - 6)} fill={C.water} />
        {/* 各階の分岐と蛇口 */}
        {Array.from({ length: SC_MAX }, (_, i) => {
          const n = i + 1;
          const by = scY(n) - 30;
          const wet = by > wy;
          return (
            <g key={n}>
              <rect x={1190} y={by - 7} width={128} height={15}
                fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={1176} y={by - 16} width={18} height={33} rx={4}
                fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
              {/* 分岐のティー */}
              <rect x={RISER - 24} y={by - 13} width={48} height={27} rx={4}
                fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
              {wet ? (
                // 水が来ている階: 滴が落ちる
                <g fill={C.water} stroke={KRP.ink} strokeWidth={2.5}>
                  {[0, 1].map((k) => {
                    const dy = by + 14 + ((f * 4 + k * 22 + n * 9) % 42);
                    return <ellipse key={k} cx={1185} cy={dy} rx={6} ry={9} />;
                  })}
                </g>
              ) : (
                // 来ていない階: 乾いて×
                <g stroke={KRP.red} strokeWidth={7} strokeLinecap="round" opacity={0.9}>
                  <line x1={1158} y1={by - 12} x2={1136} y2={by + 12} />
                  <line x1={1136} y1={by - 12} x2={1158} y2={by + 12} />
                </g>
              )}
            </g>
          );
        })}
        {/* 立管の継手フランジ */}
        {[scY(3.5), scY(7.5)].map((fy) => (
          <g key={fy}>
            <rect x={RISER - 28} y={fy} width={56} height={20} rx={4}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4.5} />
            <HexBolt x={RISER - 19} y={fy + 10} r={8} />
            <HexBolt x={RISER + 19} y={fy + 10} r={8} />
          </g>
        ))}
      </g>

      {/* --- 水位線 (ここまでしか上がらない) --- */}
      <g>
        <line x1={SC_X - 60} y1={wy} x2={1760} y2={wy} stroke={C.waterDeep}
          strokeWidth={8} strokeDasharray="30 20" />
        <path
          d={`M ${BLD_L + 8} ${wy} q 100 ${-14 + Math.sin(f / 5) * 10} 200 0 q 100 ${14 - Math.sin(f / 5) * 10} 200 0 q 100 ${-14 + Math.sin(f / 5) * 10} 200 0 q 100 ${14 - Math.sin(f / 5) * 10} 184 0`}
          fill="none" stroke={C.waterDeep} strokeWidth={9} strokeLinecap="round" />
      </g>
      {/* 上は空のまま (届かない範囲を灰色の破線で示す) */}
      <g opacity={0.5}>
        <line x1={1500} y1={wy - 14} x2={1500} y2={SC_TOP + 10} stroke={KRP.grayDark}
          strokeWidth={6} strokeDasharray="18 16" />
      </g>
      {/* 水道の圧力 (下から押し上げている分) */}
      <ForceArrow x={1500} y={SC_BOT - 4} len={Math.max(10, SC_BOT - wy - 10)} rot={-90}
        w={24} color={C.waterDeep} t={seg(f, 8, 30)} label="水道の圧力" labelSize={34} />
      {/* 地面 */}
      <g>
        <rect x={200} y={SC_BOT + 6} width={1560} height={14} fill={KPP.ground}
          stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={210 + i * 65} y1={SC_BOT + 20} x2={192 + i * 65} y2={SC_BOT + 42} />
          ))}
        </g>
      </g>
      <SmallFlag x={1640} y={246} kind={flag} t={seg(f, 2, 18)} />
      <TagPlate x={1640} y={166} text={placeText} size={44} t={seg(f, 4, 20)} />
      <TagPlate x={1640} y={Math.min(786, Math.max(120, wy))} text={lvText} size={46}
        t={seg(f, 24, 40)} color={KRP.red} />
    </g>
  );
};

// 格: 図
// どこ: 方眼の上。縦の階数の数直線 (1〜10階) + 同じ座標のビル断面。背景・人なし
// 演出: 水位線が2〜3階で止まり、その上の階の蛇口はぜんぶ乾いて× (上は空のまま)
// 動き: 水位が0→2.6階へ上がって止まり、水面が波打つ。下の階の蛇口から滴が落ちる
const Kb3Nihon2Kai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={704} bg={KRP.cream}>
    <FloorsWaterFig f={f} level={2.6} placeText="日本の水道" lvText="2〜3階まで" flag="jp" />
  </Frame>
);

// ===== #118 ニューヨークでも、だいたい6階が限界です。 =====
// 格: 図
// どこ: ★#117 と まったく同じ図・まったく同じ座標 (FloorsWaterFig を共有)。違うのは水位と札だけ
// 演出: 水位線が6階まで上がる。7階以上の蛇口はまだ乾いて×
// 動き: 水位が0→6.0階へ上がって止まり、水面が波打つ。6階までの蛇口から滴が落ちる
const Kb3Ny6Kai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={705} bg={KRP.cream}>
    <FloorsWaterFig f={f} level={6.0} placeText="ニューヨーク" lvText="6階まで" flag="us" />
  </Frame>
);

// ===== #119 そこで、屋根の上に桶を置きました。 =====
// 格: 山
// どこ: 煉瓦の街の屋根並み。手前の建物の平屋根 (y=720)。奥に3棟、左に低い屋根、右手に煙突と洗濯紐
// 演出: 木の桶が綱で吊られて下りてくる、据えられる瞬間。桶が初登場なので大きく (高さ 514px)
// 動き: 桶が580→720へ下りて着地し、わずかに沈んで止まる。綱が撚りを送り、洗濯物が揺れ、左下の2人が見上げる。ゆっくり引く
const Kb3YaneNiOke: React.FC<{ f: number }> = ({ f }) => {
  const ROOF = 720, LOW = 812;
  const S = 1.05;
  const land = easeOut(clamp01(seg(f, 4, 32)));
  const settle = Math.sin(Math.max(0, f - 32) / 2.2) * 5 * (1 - clamp01(seg(f, 32, 42)));
  const baseY = lerp(580, ROOF, land) + settle;
  const apexY = baseY - TK_H * S;
  const blockY = apexY - 104;
  const z = 1.055 - 0.055 * easeOut(clamp01(seg(f, 0, 40)));
  return (
    <Frame f={f} seed={706} bg={C.skyDay}>
      <g transform={zoomAt(z, 780, 520)}>
        {/* --- 空 --- */}
        <rect x={-20} y={-20} width={W + 40} height={ROOF + 40} fill={C.skyDay} />
        <rect x={-20} y={300} width={W + 40} height={ROOF - 260} fill={C.skyHaze} opacity={0.75} />
        <g fill={KRP.white} opacity={0.55}>
          <ellipse cx={420} cy={200} rx={190} ry={54} />
          <ellipse cx={560} cy={172} rx={120} ry={44} />
          <ellipse cx={1500} cy={250} rx={210} ry={48} />
        </g>

        {/* --- 奥の建物 (煉瓦。薄く・小さく) --- */}
        {[
          { x: 420, w: 340, top: 470, op: 0.72 },
          { x: 820, w: 320, top: 384, op: 0.8 },
          { x: 1560, w: 360, top: 540, op: 0.85 },
          { x: 0, w: 300, top: 610, op: 0.78 },
        ].map((b, bi) => (
          <g key={bi} opacity={b.op}>
            <rect x={b.x} y={b.top} width={b.w} height={H - b.top} fill={C.brick}
              stroke={KRP.ink} strokeWidth={7} />
            <rect x={b.x - 12} y={b.top - 20} width={b.w + 24} height={24} rx={4}
              fill={C.rust} stroke={KRP.ink} strokeWidth={6} />
            {/* 煉瓦の目地 */}
            <g stroke={C.rust} strokeWidth={3} opacity={0.6}>
              {Array.from({ length: 16 }, (_, i) => (
                <line key={i} x1={b.x} y1={b.top + 26 + i * 34} x2={b.x + b.w} y2={b.top + 26 + i * 34} />
              ))}
            </g>
            {/* 窓 */}
            {Array.from({ length: 3 }, (_, r) =>
              Array.from({ length: 3 }, (_, c) => (
                <rect key={`${r}-${c}`} x={b.x + 30 + c * (b.w / 3)} y={b.top + 44 + r * 112}
                  width={b.w / 5} height={64} rx={4} fill={C.glass}
                  stroke={KRP.ink} strokeWidth={4} />
              )))}
          </g>
        ))}

        {/* --- 左の低い屋根 (見上げる人が立つ) --- */}
        <g>
          <rect x={-20} y={LOW} width={380} height={H - LOW + 20} fill={C.brick}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={-20} y={LOW - 24} width={380} height={28} rx={4} fill={C.rust}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={-20} y={LOW} width={380} height={16} fill={C.woodWet} opacity={0.5} />
        </g>

        {/* --- 手前の建物の平屋根 --- */}
        <g>
          {/* 屋根の面 */}
          <rect x={380} y={ROOF} width={1130} height={H - ROOF + 20} fill={C.woodWet}
            stroke={KRP.ink} strokeWidth={9} />
          {/* アスファルトの継ぎ目 */}
          <g stroke={C.ink2} strokeWidth={5} opacity={0.5}>
            {[760, 812, 880, 962, 1056].map((y) => (
              <line key={y} x1={380} y1={y} x2={1510} y2={y} />
            ))}
            {[560, 820, 1120, 1380].map((x) => (
              <line key={x} x1={x} y1={ROOF} x2={x - 60} y2={H} />
            ))}
          </g>
          {/* 奥のパラペット */}
          <rect x={372} y={ROOF - 30} width={1146} height={34} rx={4} fill={C.rust}
            stroke={KRP.ink} strokeWidth={7} />
          <Rivets x1={420} y1={ROOF - 13} x2={1470} y2={ROOF - 13} n={16} r={6} fill={C.brick} />
          {/* 屋根の水たまり */}
          <ellipse cx={1180} cy={880} rx={130} ry={34} fill={C.water} opacity={0.6} />
          <ellipse cx={1150} cy={872} rx={54} ry={13} fill={KRP.white} opacity={0.45} />
          {/* 通気の立ち上がり */}
          <g>
            <rect x={1040} y={640} width={34} height={86} fill={BP.iron}
              stroke={KRP.ink} strokeWidth={5} />
            <rect x={1024} y={626} width={66} height={18} rx={4} fill={BP.ironDark}
              stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        </g>

        {/* --- 煙突 --- */}
        <g>
          <rect x={1300} y={548} width={122} height={176} fill={C.brick}
            stroke={KRP.ink} strokeWidth={8} />
          <g stroke={C.rust} strokeWidth={4} opacity={0.7}>
            {Array.from({ length: 5 }, (_, i) => (
              <line key={i} x1={1300} y1={574 + i * 34} x2={1422} y2={574 + i * 34} />
            ))}
          </g>
          <rect x={1286} y={528} width={150} height={26} rx={4} fill={C.stone}
            stroke={KRP.ink} strokeWidth={6} />
          {[1314, 1352, 1390].map((px) => (
            <rect key={px} x={px} y={496} width={24} height={34} rx={4} fill={C.rust}
              stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* 煙 */}
          <g fill={KRP.white} opacity={0.4}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={1352 + Math.sin((f + i * 14) / 11) * 26}
                cy={470 - i * 52 - (f % 40) * 0.9} r={20 + i * 9} />
            ))}
          </g>
        </g>

        {/* --- 洗濯紐 (煙突 ← 支柱) --- */}
        <g>
          <rect x={1008} y={616} width={16} height={110} fill={C.wood}
            stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1016 622 Q 1160 672 1300 606" fill="none" stroke={KRP.ink}
            strokeWidth={6} />
          {[{ cx: 1070, w: 76, h: 118 }, { cx: 1160, w: 64, h: 96 }, { cx: 1246, w: 72, h: 110 }].map((c, i) => {
            const sw = bobOf(f, i + 1) * 1.6;
            const ty = 640 + (i === 1 ? 14 : i === 2 ? 4 : 0);
            return (
              <g key={i} transform={`rotate(${sw} ${c.cx} ${ty})`}>
                <path d={`M ${c.cx - c.w / 2} ${ty} L ${c.cx + c.w / 2} ${ty} L ${c.cx + c.w / 2 - 6} ${ty + c.h} L ${c.cx - c.w / 2 + 8} ${ty + c.h} Z`}
                  fill={i === 1 ? C.skyHaze : KRP.white} stroke={KRP.ink} strokeWidth={5} />
                <line x1={c.cx} y1={ty} x2={c.cx - 2} y2={ty + c.h} stroke={C.stone}
                  strokeWidth={3.5} opacity={0.8} />
              </g>
            );
          })}
        </g>

        {/* --- 吊り綱と滑車ブロック --- */}
        <Rope x1={780} y1={-20} x2={780} y2={blockY} w={26} kind="hemp" f={f} />
        <g>
          {/* ブロック (鉄板 + フック) */}
          <rect x={726} y={blockY} width={108} height={48} rx={8} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={6} />
          <Rivets x1={744} y1={blockY + 24} x2={816} y2={blockY + 24} n={4} r={6} />
          <path d={`M 780 ${blockY + 48} q 0 34 -22 40`} fill="none" stroke={KRP.ink}
            strokeWidth={14} strokeLinecap="round" />
          <path d={`M 780 ${blockY + 48} q 0 34 -22 40`} fill="none" stroke={BP.steel}
            strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 2本の吊り索 (桶の屋根の軒へ) */}
        <Rope x1={780} y1={blockY + 40} x2={780 - 150} y2={apexY + 92} w={14} kind="hemp" f={f} />
        <Rope x1={780} y1={blockY + 40} x2={780 + 150} y2={apexY + 92} w={14} kind="hemp" f={f} />

        {/* --- ★木の桶 (大きく) --- */}
        <WoodenTank x={780} y={baseY} s={S} f={f} pipeDown={44} />
        {/* 据える位置の印 (屋根に引いた墨) */}
        <g opacity={0.7}>
          <rect x={780 - 176} y={ROOF - 4} width={352} height={10} rx={3}
            fill={KRP.ink} opacity={0.35} />
        </g>
        {/* 下ろす矢印 */}
        <ForceArrow x={1058} y={apexY + 50} len={180} rot={90} w={24} color={KRP.red}
          t={seg(f, 8, 26)} label="下ろす" labelSize={36} />

        {/* --- 見上げる人 2人 (左の低い屋根) --- */}
        <Person x={128} y={LOW + 6} s={0.66} f={f} phase={0} cloth="#5C4A3A" clothDark="#42342A"
          gaze={[3, -4]} lean={4} />
        <Person x={252} y={LOW + 6} s={0.62} f={f} phase={2} cloth="#3E5160" clothDark="#2C3B47"
          gaze={[3, -4]} lean={5} />
      </g>
      <TagPlate x={1428} y={300} text="木の桶" size={56} t={seg(f, 20, 34)} />
      <TagPlate x={1428} y={420} text="屋根の上" size={44} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #120 ポンプで一度、いちばん上まで押し上げる。 =====
// 格: 並
// どこ: 地下のポンプ室。天井スラブ・漆喰の壁・床・裸電球。描くのは「鋳鉄のポンプ」1つだけ。人は置かない
// 演出: 機械に寄る。渦巻のケーシング・ボルト環・銘板・圧力計・太い立管が天井へ消える・床の水たまり
// 動き: 継手の円盤と羽根が回る。圧力計の針が振れる。立管の中を水が上がる。電球が揺れ、水たまりが波打つ
const Kb3PumpDeAgeru: React.FC<{ f: number }> = ({ f }) => {
  const CX = 700, CY = 560, CR = 176;
  const FL = 790;
  const spin = f * 7.5;
  const gauge = -124 + 96 * easeOut(clamp01(seg(f, 4, 28))) + Math.sin(f / 3.4) * 5;
  const z = 1 + 0.045 * easeOut(clamp01(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={707} bg={KRP.cream} dark>
      <g transform={zoomAt(z, CX, CY)}>
        {/* --- 壁 (漆喰) と天井スラブ --- */}
        <rect x={-20} y={-20} width={W + 40} height={FL + 40} fill={BP.shaft} />
        <g fill={BP.shaftDark} opacity={0.35}>
          <ellipse cx={320} cy={300} rx={160} ry={90} />
          <ellipse cx={1500} cy={470} rx={210} ry={120} />
          <ellipse cx={980} cy={700} rx={180} ry={70} />
        </g>
        <rect x={-20} y={60} width={W + 40} height={66} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={8} />
        <g stroke={BP.slabDark} strokeWidth={7}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={i * 230} y1={126} x2={i * 230} y2={60} />
          ))}
        </g>
        {/* 床 */}
        <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill={BP.slabDark}
          stroke={KRP.ink} strokeWidth={9} />
        <g stroke={BP.shaftDeep} strokeWidth={5} opacity={0.5}>
          {[852, 930, 1026].map((y) => <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} />)}
        </g>

        {/* --- 太い立管 (天井へ消える) --- */}
        <g>
          <rect x={CX - 62} y={118} width={124} height={CY - 240} fill={BP.iron}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={CX - 50} y={120} width={22} height={CY - 244} fill={BP.steelLight} opacity={0.55} />
          {/* 中を上がる水 */}
          <g opacity={0.85}>
            {Array.from({ length: 5 }, (_, i) => {
              const py = 440 - ((f * 6 + i * 64) % 320);
              return <ellipse key={i} cx={CX - 8} cy={py} rx={16} ry={26} fill={C.water} opacity={0.7} />;
            })}
          </g>
          {/* 継手フランジ */}
          {[240, 380].map((fy) => (
            <g key={fy}>
              <rect x={CX - 90} y={fy} width={180} height={34} rx={5} fill={BP.ironDark}
                stroke={KRP.ink} strokeWidth={6} />
              <HexBolt x={CX - 72} y={fy + 17} r={12} />
              <HexBolt x={CX + 72} y={fy + 17} r={12} />
            </g>
          ))}
          {/* 天井の貫通部 */}
          <rect x={CX - 96} y={108} width={192} height={24} rx={4} fill={BP.slabDark}
            stroke={KRP.ink} strokeWidth={6} />
          {/* 吐出のエルボ */}
          <path d={`M ${CX} ${CY - 60} L ${CX} ${CY - 220}`} fill="none" stroke={KRP.ink}
            strokeWidth={132} strokeLinecap="butt" />
          <path d={`M ${CX} ${CY - 60} L ${CX} ${CY - 220}`} fill="none" stroke={BP.iron}
            strokeWidth={118} strokeLinecap="butt" />
        </g>

        {/* --- 吸込み管 (左の壁から) --- */}
        <g>
          <rect x={60} y={CY - 56} width={480} height={112} fill={BP.iron}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={62} y={CY - 44} width={476} height={20} fill={BP.steelLight} opacity={0.5} />
          {[180, 400].map((fx) => (
            <g key={fx}>
              <rect x={fx} y={CY - 80} width={30} height={160} rx={5} fill={BP.ironDark}
                stroke={KRP.ink} strokeWidth={6} />
              <HexBolt x={fx + 15} y={CY - 62} r={11} />
              <HexBolt x={fx + 15} y={CY + 62} r={11} />
            </g>
          ))}
        </g>

        {/* --- ★鋳鉄のポンプ (渦巻ケーシング) --- */}
        <g>
          {/* 据付の台 (コンクリート) + アンカーボルト */}
          <rect x={CX - 250} y={FL - 56} width={500} height={60} fill={C.stone}
            stroke={KRP.ink} strokeWidth={8} />
          <g stroke={BP.steelDark} strokeWidth={13}>
            <line x1={CX - 170} y1={FL - 56} x2={CX - 170} y2={CY + CR - 26} />
            <line x1={CX + 170} y1={FL - 56} x2={CX + 170} y2={CY + CR - 26} />
          </g>
          <HexBolt x={CX - 170} y={CY + CR - 20} r={18} />
          <HexBolt x={CX + 170} y={CY + CR - 20} r={18} />
          {/* ケーシング */}
          <circle cx={CX} cy={CY} r={CR} fill={BP.iron} stroke={KRP.ink} strokeWidth={9} />
          <path d={`M ${CX + CR - 10} ${CY} A ${CR - 10} ${CR - 10} 0 1 0 ${CX} ${CY - CR + 60}`}
            fill="none" stroke={BP.ironDark} strokeWidth={16} opacity={0.75} />
          <circle cx={CX} cy={CY} r={CR - 34} fill="none" stroke={KRP.ink} strokeWidth={5}
            opacity={0.6} />
          {/* ボルト環 12本 */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <HexBolt key={i} x={CX + Math.cos(a) * (CR - 20)} y={CY + Math.sin(a) * (CR - 20)}
              r={13} rot={i * 30} />;
          })}
          {/* 羽根 (回る) */}
          <g transform={`rotate(${spin} ${CX} ${CY})`} opacity={0.9}>
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} transform={`rotate(${i * 60} ${CX} ${CY})`}
                d={`M ${CX} ${CY - 20} Q ${CX + 70} ${CY - 60} ${CX + 108} ${CY - 6}`}
                fill="none" stroke={BP.steelDark} strokeWidth={13} strokeLinecap="round" />
            ))}
          </g>
          {/* 軸の受け (ハブ) */}
          <circle cx={CX} cy={CY} r={52} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={CX} cy={CY} r={24} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* 銘板 */}
          <g>
            <rect x={CX - 80} y={CY + 60} width={160} height={52} rx={6} fill={BP.brass}
              stroke={KRP.ink} strokeWidth={5} />
            <Rivets x1={CX - 64} y1={CY + 72} x2={CX + 64} y2={CY + 72} n={2} r={5} fill={BP.brassDark} />
            <text x={CX} y={CY + 102} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={30} fill={KRP.ink}>№7</text>
          </g>
        </g>

        {/* --- 原動機と継手 (回る) --- */}
        <g>
          <rect x={1030} y={474} width={280} height={172} rx={12} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={8} />
          <g stroke={BP.ironDark} strokeWidth={7}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={1052 + i * 32} y1={480} x2={1052 + i * 32} y2={640} />
            ))}
          </g>
          <rect x={1010} y={646} width={320} height={32} rx={5} fill={BP.iron}
            stroke={KRP.ink} strokeWidth={6} />
          <g stroke={BP.steelDark} strokeWidth={14}>
            <line x1={1030} y1={678} x2={1030} y2={FL - 56} />
            <line x1={1300} y1={678} x2={1300} y2={FL - 56} />
          </g>
          {/* 軸 + 継手の円盤 */}
          <rect x={940} y={548} width={92} height={26} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${-spin} 952 561)`}>
            <circle cx={952} cy={561} r={48} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
            {Array.from({ length: 4 }, (_, i) => {
              const a = (i * 90 * Math.PI) / 180;
              return <HexBolt key={i} x={952 + Math.cos(a) * 30} y={561 + Math.sin(a) * 30} r={9} />;
            })}
          </g>
          <Bolt x={1366} y={416} s={1.5} opacity={0.3 + 0.55 * Math.abs(Math.sin(f / 6))} />
        </g>

        {/* --- 圧力計 (針が振れる) --- */}
        <g>
          <rect x={1168} y={388} width={22} height={90} fill={BP.iron}
            stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1179} cy={312} r={78} fill={BP.brass} stroke={KRP.ink} strokeWidth={8} />
          <circle cx={1179} cy={312} r={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={4}>
            {Array.from({ length: 9 }, (_, i) => {
              const a = ((-210 + i * 30) * Math.PI) / 180;
              return <line key={i} x1={1179 + Math.cos(a) * 46} y1={312 + Math.sin(a) * 46}
                x2={1179 + Math.cos(a) * 58} y2={312 + Math.sin(a) * 58} />;
            })}
          </g>
          <g transform={`rotate(${gauge} 1179 312)`}>
            <line x1={1179} y1={312} x2={1179 + 50} y2={312} stroke={KRP.red}
              strokeWidth={8} strokeLinecap="round" />
          </g>
          <circle cx={1179} cy={312} r={11} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 赤い限界の帯 */}
          <path d="M 1216 268 A 56 56 0 0 1 1232 316" fill="none" stroke={KRP.red}
            strokeWidth={9} opacity={0.75} />
        </g>

        {/* --- 床の水たまり --- */}
        <g>
          <ellipse cx={420} cy={846} rx={198} ry={38} fill={C.water} opacity={0.72} />
          <ellipse cx={372} cy={836} rx={64} ry={13} fill={KRP.white} opacity={0.5} />
          <g fill="none" stroke={C.waterPale} strokeWidth={4} opacity={0.8}>
            {[0, 1].map((i) => {
              const r = 20 + ((f * 2.2 + i * 30) % 60);
              return <ellipse key={i} cx={430} cy={846} rx={r} ry={r * 0.2} />;
            })}
          </g>
        </g>

        {/* --- 裸電球 --- */}
        <g transform={`rotate(${Math.sin(f / 15) * 2.2} 1700 70)`}>
          <line x1={1700} y1={126} x2={1700} y2={254} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1682} y={250} width={36} height={32} rx={5} fill={BP.brassDark}
            stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1700} cy={322} r={38} fill={BP.lamp} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1700} cy={322} r={120} fill={BP.lampGlow}
            opacity={0.18 + 0.08 * Math.sin(f / 5)} />
          <line x1={1692} y1={316} x2={1708} y2={330} stroke={KRP.orange} strokeWidth={4} />
        </g>

        {/* --- 押し上げる力 --- */}
        <ForceArrow x={CX - 240} y={520} len={300} rot={-90} w={28} color={KRP.red}
          t={seg(f, 10, 30)} label="押し上げる" labelSize={38} />
      </g>
      <TagPlate x={300} y={716} text="ポンプ" size={54} t={seg(f, 14, 28)} />
      <TagPlate x={1452} y={222} text="圧力計" size={42} t={seg(f, 22, 36)} />
      <TagPlate x={878} y={192} text="立管" size={46} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #121 あとは、重力に任せて下へ配ります。 =====
// 格: 図
// どこ: 方眼の上。ビルの断面 (屋上 y=340 〜 地面 y=840) と屋上の木の桶。背景・人なし
// 演出: 桶から降りる1本の主管が各階へ枝分かれ。下向きの矢印だけ。動力の印は「ポンプ×」で無いことを見せる
// 動き: 水の粒が主管を下り、枝へ分かれて蛇口から落ちる。下向き矢印が順に伸びる
const Kb3JuuryokuDeKubaru: React.FC<{ f: number }> = ({ f }) => {
  const ROOF = 340, GND = 840, BL = 500, BR = 1420, MAIN = 970;
  const FLOORS = 6;
  const fy = (i: number) => GND - (i * (GND - ROOF)) / FLOORS;
  return (
    <Frame f={f} seed={708} bg={KRP.cream}>
      <GridPaper />
      {/* --- ビルの断面 --- */}
      <g>
        <rect x={BL} y={ROOF} width={BR - BL} height={GND - ROOF} fill={C.plaster}
          stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: FLOORS + 1 }, (_, i) => (
          <rect key={i} x={BL - 10} y={fy(i) - 7} width={BR - BL + 20} height={15}
            fill={BP.slab} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={BL - 18} y={ROOF - 26} width={BR - BL + 36} height={28} rx={4}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 各階の窓 */}
        {Array.from({ length: FLOORS }, (_, i) => (
          <g key={i}>
            {[540, 660, 780].map((wx) => (
              <rect key={wx} x={wx} y={fy(i + 1) + 16} width={56} height={44} rx={4}
                fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
      </g>

      {/* --- 屋上の木の桶 --- */}
      <WoodenTank x={700} y={ROOF - 2} s={0.45} f={f} pipeDown={0} />
      {/* 桶から主管へ */}
      <g>
        <rect x={776} y={ROOF - 62} width={200} height={19} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={MAIN - 15} y={ROOF - 62} width={30} height={GND - ROOF + 50}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={6} />
        <rect x={MAIN - 9} y={ROOF - 58} width={9} height={GND - ROOF + 40}
          fill={BP.steelLight} opacity={0.6} />
      </g>

      {/* --- 各階へ枝分かれ --- */}
      {Array.from({ length: FLOORS }, (_, i) => {
        const by = fy(i + 1) - 34;
        const t = clamp01(seg(f, 6 + i * 3, 20 + i * 3));
        return (
          <g key={i} opacity={t}>
            {/* 左へ */}
            <rect x={840} y={by - 8} width={MAIN - 840} height={17} fill={BP.iron}
              stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={824} y={by - 18} width={20} height={37} rx={4} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={4} />
            {/* 右へ */}
            <rect x={MAIN} y={by - 8} width={320} height={17} fill={BP.iron}
              stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={1320} y={by - 18} width={20} height={37} rx={4} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={4} />
            {/* 分岐のティー */}
            <rect x={MAIN - 22} y={by - 15} width={44} height={31} rx={4} fill={BP.ironDark}
              stroke={KRP.ink} strokeWidth={4} />
            {/* 蛇口から落ちる水 */}
            <g fill={C.water} stroke={KRP.ink} strokeWidth={2.5}>
              {[0, 1].map((k) => {
                const dy = by + 18 + ((f * 4.5 + k * 24 + i * 11) % 46);
                return (
                  <g key={k}>
                    <ellipse cx={833} cy={dy} rx={6} ry={9} />
                    <ellipse cx={1330} cy={dy} rx={6} ry={9} />
                  </g>
                );
              })}
            </g>
          </g>
        );
      })}

      {/* --- 主管を下る水の粒 --- */}
      <g fill={C.waterDeep} opacity={0.85}>
        {Array.from({ length: 8 }, (_, i) => {
          const py = ROOF - 50 + ((f * 9 + i * 68) % (GND - ROOF + 40));
          return <ellipse key={i} cx={MAIN} cy={py} rx={9} ry={17} />;
        })}
      </g>

      {/* --- 下向きの矢印だけ (動力の印はない) --- */}
      {[420, 560, 700].map((ay, i) => (
        <ForceArrow key={ay} x={1100} y={ay} len={118} rot={90} w={24} color={C.waterDeep}
          t={seg(f, 12 + i * 6, 28 + i * 6)} />
      ))}

      {/* --- 動力は無い (ポンプに×) --- */}
      <g opacity={easeOut(clamp01(seg(f, 22, 38)))}>
        <circle cx={250} cy={690} r={56} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={250} cy={690} r={20} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={160} y={674} width={40} height={32} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
        <rect x={234} y={600} width={32} height={40} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
        <XMark x={250} y={690} s={0.95} t={seg(f, 28, 40)} />
      </g>

      <TagPlate x={250} y={450} text="重力" size={58} t={seg(f, 8, 24)} />
      <TagPlate x={250} y={776} text="動力なし" size={40} t={seg(f, 32, 42)} color={KRP.red} />
      <TagPlate x={1660} y={520} text="各階へ" size={46} t={seg(f, 18, 32)} />
      <TagPlate x={1660} y={300} text="屋上の桶" size={40} t={seg(f, 4, 18)} />
    </Frame>
  );
};

// ===== #122 上げるのは機械、配るのは重力です。 =====
// 格: 図
// どこ: 方眼の上。○×の対比台を1つ。背景・人なし
// 演出: 左に鋳鉄のポンプ+○「機械」、右に落ちる水+○「重力」。どちらも○で、役割の分担だけを言う
// 動き: ポンプの羽根が回り、右は水滴が落ちて桶で跳ねる。上の「上げる→配る」の札が順に出る
const Kb3AgeruToKubaru: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 10, 30);
  const spin = f * 8;
  // 左: 機械 (ポンプ)
  const pumpNode = (
    <g>
      <rect x={-104} y={-34} width={208} height={34} rx={5} fill={C.stone}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 吸込み */}
      <rect x={-162} y={-134} width={62} height={38} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={5} />
      {/* ケーシング */}
      <circle cx={0} cy={-116} r={86} fill={BP.iron} stroke={KRP.ink} strokeWidth={8} />
      <path d="M 76 -116 A 76 76 0 1 0 0 -192" fill="none" stroke={BP.ironDark}
        strokeWidth={13} opacity={0.7} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return <HexBolt key={i} x={Math.cos(a) * 66} y={-116 + Math.sin(a) * 66} r={9} rot={i * 45} />;
      })}
      <g transform={`rotate(${spin} 0 -116)`}>
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} transform={`rotate(${i * 60} 0 -116)`}
            d="M 0 -130 Q 34 -152 54 -120" fill="none" stroke={BP.steelDark}
            strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
      <circle cx={0} cy={-116} r={26} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-116} r={12} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      {/* 吐出のエルボ (上へ) */}
      <rect x={-23} y={-230} width={46} height={110} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-36} y={-242} width={72} height={20} rx={4} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 動力の印 */}
      <Bolt x={86} y={-178} s={1.3} opacity={0.4 + 0.55 * Math.abs(Math.sin(f / 5))} />
      <ForceArrow x={126} y={-150} len={96} rot={-90} w={20} color={KRP.red} t={t} />
    </g>
  );
  // 右: 重力 (落ちる水)
  const fallNode = (
    <g>
      {/* 上の管口 + フランジ */}
      <rect x={-34} y={-230} width={68} height={48} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-50} y={-192} width={100} height={19} rx={4} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={5} />
      <HexBolt x={-40} y={-183} r={8} />
      <HexBolt x={40} y={-183} r={8} />
      {/* 落ちる水 */}
      <g fill={C.water} stroke={KRP.ink} strokeWidth={3}>
        {Array.from({ length: 5 }, (_, i) => {
          const dy = -168 + ((f * 9 + i * 24) % 112);
          return <ellipse key={i} cx={0} cy={dy} rx={13} ry={23} />;
        })}
      </g>
      {/* 受けの木桶 */}
      <path d="M -116 -62 L 116 -62 L 96 0 L -96 0 Z" fill={C.wood}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.woodDark} strokeWidth={3.5}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={-100 + i * 20} y1={-62} x2={-84 + i * 17} y2={0} />
        ))}
      </g>
      <rect x={-112} y={-46} width={224} height={13} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-58} rx={108} ry={16} fill={C.water}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 跳ねる水 */}
      <g fill="none" stroke={C.waterPale} strokeWidth={5} opacity={0.9}>
        {[0, 1].map((i) => {
          const r = 16 + ((f * 2.4 + i * 26) % 52);
          return <ellipse key={i} cx={0} cy={-58} rx={r} ry={r * 0.22} />;
        })}
      </g>
      <ForceArrow x={148} y={-212} len={170} rot={90} w={20} color={C.waterDeep} t={t} />
    </g>
  );
  return (
    <Frame f={f} seed={709} bg={KRP.cream}>
      <GridPaper />
      <FlowPlates x={960} y={146} items={["上げる", "配る"]} size={46}
        t={seg(f, 4, 32)} f={f} />
      {/* ○は MaruBatsu 内蔵 (局所 y=-320) だと物に食い込むので none にして自前で上に置く */}
      <MaruBatsu
        x={960} y={668} s={1.12} gap={760} labelSize={52} t={t}
        leftMark="none" rightMark="none"
        leftText="機械" rightText="重力"
        leftNode={pumpNode} rightNode={fallNode}
      />
      <Maru x={960 - 425} y={295} s={1} t={t} />
      <Maru x={960 + 425} y={295} s={1} t={t} />
    </Frame>
  );
};

// ===== #123 ニューヨークの屋根の、あの木の桶がこれです。 =====
// 格: 山
// どこ: ニューヨークの屋上群。夕方。手前の屋根 (y=760) に大きな木桶、奥の3棟の屋上にも高さを変えて木桶
// 演出: 遠景に摩天楼のシルエット (薄く・小さく)。左の煉瓦の外壁に非常階段の鉄骨。屋上の物干し。鳩が数羽
// 動き: 鳩2羽が羽ばたいて横切り、2羽は手すりで首を振る。物干しが揺れ、夕日がにじむ。手前の桶へゆっくり寄る
const Kb3NyNoKioke: React.FC<{ f: number }> = ({ f }) => {
  const ROOF = 760;
  const z = 1 + 0.06 * easeOut(clamp01(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={710} bg={C.skyDusk}>
      <defs>
        <linearGradient id="kb3_dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.skyHaze} />
          <stop offset="55%" stopColor={C.skyDusk} />
          <stop offset="100%" stopColor={KRP.orange} />
        </linearGradient>
      </defs>
      <g transform={zoomAt(z, 1250, 520)}>
        {/* --- 夕方の空 --- */}
        <rect x={-20} y={-20} width={W + 40} height={ROOF + 60} fill="url(#kb3_dusk)" />
        {/* 低い夕日 */}
        <circle cx={1700} cy={330} r={210} fill={KRP.yellow}
          opacity={0.14 + 0.04 * Math.sin(f / 13)} />
        <circle cx={1700} cy={330} r={96} fill={KRP.yellow} opacity={0.6} />
        {/* 横に流れる雲 */}
        <g fill={KRP.white} opacity={0.3}>
          {[{ y: 180, r: 230 }, { y: 268, r: 160 }].map((c, i) => (
            <ellipse key={i} cx={620 + i * 460 + ((f * 0.5) % 60)} cy={c.y} rx={c.r} ry={30} />
          ))}
        </g>

        {/* --- 遠景の摩天楼 (薄く・小さく) --- */}
        <g opacity={0.3}>
          {Array.from({ length: 16 }, (_, i) => {
            const bx = -20 + i * 124;
            const bh = 60 + rnd(i * 5 + 2) * 190;
            return (
              <g key={i}>
                <rect x={bx} y={570 - bh} width={104} height={bh + 20} fill={C.ink2} />
                {rnd(i + 40) > 0.55 && (
                  <rect x={bx + 38} y={570 - bh - 46} width={28} height={48} fill={C.ink2} />
                )}
              </g>
            );
          })}
        </g>
        {/* もう一列、さらに薄く */}
        <g opacity={0.16}>
          {Array.from({ length: 11 }, (_, i) => {
            const bx = 40 + i * 178;
            const bh = 120 + rnd(i * 9 + 7) * 300;
            return <rect key={i} x={bx} y={560 - bh} width={132} height={bh + 20} fill={C.ink2} />;
          })}
        </g>

        {/* --- 奥の3棟 + 屋上の木桶 (高さを変えて林立) --- */}
        {[
          { x: 110, w: 450, top: 560, tx: 330, ts: 0.5 },
          { x: 590, w: 410, top: 622, tx: 795, ts: 0.42 },
          { x: 1500, w: 390, top: 500, tx: 1700, ts: 0.46 },
        ].map((b, bi) => (
          <g key={bi}>
            <rect x={b.x} y={b.top} width={b.w} height={H - b.top} fill={C.brick}
              stroke={KRP.ink} strokeWidth={8} />
            <rect x={b.x - 14} y={b.top - 26} width={b.w + 28} height={30} rx={4}
              fill={C.rust} stroke={KRP.ink} strokeWidth={6} />
            {/* 煉瓦の目地 */}
            <g stroke={C.rust} strokeWidth={3} opacity={0.55}>
              {Array.from({ length: 14 }, (_, i) => (
                <line key={i} x1={b.x} y1={b.top + 30 + i * 36} x2={b.x + b.w} y2={b.top + 30 + i * 36} />
              ))}
            </g>
            {/* 窓 */}
            {Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 3 }, (_, c) => (
                <g key={`${r}-${c}`}>
                  <rect x={b.x + 34 + c * (b.w / 3)} y={b.top + 52 + r * 118}
                    width={b.w / 5.4} height={72} rx={4}
                    fill={r + c === 2 ? KRP.yellow : C.glass}
                    stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
                  <rect x={b.x + 28 + c * (b.w / 3)} y={b.top + 44 + r * 118}
                    width={b.w / 4.6} height={11} rx={3} fill={C.stone}
                    stroke={KRP.ink} strokeWidth={3} />
                </g>
              )))}
            {/* 外壁を降りる給水の竪管 */}
            <rect x={b.x + b.w - 54} y={b.top} width={17} height={H - b.top}
              fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
            {/* 屋上の木桶 */}
            <WoodenTank x={b.tx} y={b.top - 2} s={b.ts} f={f} pipeDown={36} rim />
          </g>
        ))}

        {/* --- 左の非常階段の鉄骨 --- */}
        <g>
          {/* 縦の柱 */}
          {[150, 496].map((px) => (
            <rect key={px} x={px} y={596} width={15} height={H - 596} fill={BP.ironDark}
              stroke={KRP.ink} strokeWidth={4} />
          ))}
          {[0, 1, 2].map((i) => {
            const ly = 640 + i * 128;
            return (
              <g key={i}>
                {/* 踊り場 */}
                <rect x={150} y={ly} width={361} height={13} fill={BP.ironDark}
                  stroke={KRP.ink} strokeWidth={4} />
                {/* 格子の床 */}
                <g stroke={BP.iron} strokeWidth={3} opacity={0.9}>
                  {Array.from({ length: 11 }, (_, k) => (
                    <line key={k} x1={158 + k * 34} y1={ly} x2={158 + k * 34} y2={ly + 13} />
                  ))}
                </g>
                {/* 手すり */}
                <rect x={150} y={ly - 72} width={361} height={9} fill={BP.ironDark}
                  stroke={KRP.ink} strokeWidth={3.5} />
                <g stroke={BP.ironDark} strokeWidth={5}>
                  {Array.from({ length: 7 }, (_, k) => (
                    <line key={k} x1={166 + k * 56} y1={ly - 63} x2={166 + k * 56} y2={ly} />
                  ))}
                </g>
                {/* 斜めの階段 */}
                <g stroke={BP.ironDark} strokeWidth={10}>
                  <line x1={462} y1={ly + 13} x2={200} y2={ly + 128} />
                </g>
                <g stroke={BP.iron} strokeWidth={5}>
                  {Array.from({ length: 8 }, (_, k) => (
                    <line key={k} x1={452 - k * 32} y1={ly + 18 + k * 14}
                      x2={452 - k * 32} y2={ly + 36 + k * 14} />
                  ))}
                </g>
                {/* 壁への取り付け金物 */}
                <HexBolt x={158} y={ly + 6} r={8} fill={BP.steelDark} />
                <HexBolt x={503} y={ly + 6} r={8} fill={BP.steelDark} />
              </g>
            );
          })}
        </g>

        {/* --- 手前の建物の屋上 --- */}
        <g>
          <rect x={1020} y={ROOF} width={W - 1000} height={H - ROOF + 20} fill={C.woodWet}
            stroke={KRP.ink} strokeWidth={9} />
          <g stroke={C.ink2} strokeWidth={5} opacity={0.45}>
            {[812, 880, 962, 1052].map((y) => <line key={y} x1={1020} y1={y} x2={W + 20} y2={y} />)}
            {[1240, 1520, 1800].map((x) => <line key={x} x1={x} y1={ROOF} x2={x - 70} y2={H} />)}
          </g>
          {/* パラペット */}
          <rect x={1012} y={ROOF - 32} width={W - 992} height={36} rx={4} fill={C.rust}
            stroke={KRP.ink} strokeWidth={7} />
          <Rivets x1={1060} y1={ROOF - 14} x2={1880} y2={ROOF - 14} n={13} r={6} fill={C.brick} />
        </g>

        {/* --- 屋上の物干し --- */}
        <g>
          {[{ px: 1486, h: 128 }, { px: 1878, h: 108 }].map((p) => (
            <rect key={p.px} x={p.px} y={ROOF - p.h} width={15} height={p.h} fill={C.wood}
              stroke={KRP.ink} strokeWidth={5} />
          ))}
          <path d={`M 1493 ${ROOF - 124} Q 1690 ${ROOF - 70} 1885 ${ROOF - 104}`}
            fill="none" stroke={KRP.ink} strokeWidth={5} />
          {[{ cx: 1570, w: 66, h: 96 }, { cx: 1665, w: 58, h: 82 }, { cx: 1760, w: 70, h: 100 }].map((c, i) => {
            const sw = bobOf(f, i + 2) * 1.8;
            const ty = ROOF - 104 + i * 6;
            return (
              <g key={i} transform={`rotate(${sw} ${c.cx} ${ty})`}>
                <path d={`M ${c.cx - c.w / 2} ${ty} L ${c.cx + c.w / 2} ${ty} L ${c.cx + c.w / 2 - 6} ${ty + c.h} L ${c.cx - c.w / 2 + 7} ${ty + c.h} Z`}
                  fill={i === 1 ? C.skyHaze : KRP.white} stroke={KRP.ink} strokeWidth={5} />
              </g>
            );
          })}
        </g>

        {/* --- ★手前の大きな木桶 --- */}
        <WoodenTank x={1250} y={ROOF} s={0.95} f={f} pipeDown={120} rim />

        {/* --- 鳩 --- */}
        <Pigeon x={1252} y={ROOF - TK_H * 0.95 - 30} s={0.5} f={f} />
        <Pigeon x={1618} y={ROOF - 36} s={0.62} f={f} />
        <Pigeon x={1716} y={ROOF - 36} s={0.58} f={f} />
        <Pigeon x={300 + f * 2.4} y={248 + Math.sin(f / 6) * 20} s={0.72} f={f} fly />
        <Pigeon x={470 + f * 3.1} y={190 + Math.sin(f / 5 + 1) * 24} s={0.56} f={f} fly />

        {/* --- 夕方の光をのせる --- */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.orange} opacity={0.1} />
        <polygon points={`1920,160 1920,760 1180,760 1620,160`} fill={KRP.yellow} opacity={0.1} />
      </g>
      <TagPlate x={420} y={476} text="ニューヨーク" size={48} t={seg(f, 8, 24)} />
      <TagPlate x={760} y={300} text="木の桶" size={56} t={seg(f, 24, 38)} />
      <Arrow x={1028} y={300} s={1.05} rot={0} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb3_shou_tobira: (f) => <Kb3ShouTobira f={f} />,
  kb3_hone_to_hito: (f) => <Kb3HoneToHito f={f} />,
  kb3_mada_sumenai: (f) => <Kb3MadaSumenai f={f} />,
  kb3_osasarenai_to: (f) => <Kb3OsasarenaiTo f={f} />,
  kb3_nihon_2kai: (f) => <Kb3Nihon2Kai f={f} />,
  kb3_ny_6kai: (f) => <Kb3Ny6Kai f={f} />,
  kb3_yane_ni_oke: (f) => <Kb3YaneNiOke f={f} />,
  kb3_pump_de_ageru: (f) => <Kb3PumpDeAgeru f={f} />,
  kb3_juuryoku_de_kubaru: (f) => <Kb3JuuryokuDeKubaru f={f} />,
  kb3_ageru_to_kubaru: (f) => <Kb3AgeruToKubaru f={f} />,
  kb3_ny_no_kioke: (f) => <Kb3NyNoKioke f={f} />,
};

export const K_B3A_MOTIFS: string[] = [
  "kb3_shou_tobira",         // #113 第3章、水は、勝手に上がらない。
  "kb3_hone_to_hito",        // #114 骨ができて、人も登れました。
  "kb3_mada_sumenai",        // #115 それでも、まだ住めません。水が来ないからです。
  "kb3_osasarenai_to",       // #116 水は、押されないと登りません。
  "kb3_nihon_2kai",          // #117 日本の水道が保証する圧力は、2階か3階まで。
  "kb3_ny_6kai",             // #118 ニューヨークでも、だいたい6階が限界です。
  "kb3_yane_ni_oke",         // #119 そこで、屋根の上に桶を置きました。
  "kb3_pump_de_ageru",       // #120 ポンプで一度、いちばん上まで押し上げる。
  "kb3_juuryoku_de_kubaru",  // #121 あとは、重力に任せて下へ配ります。
  "kb3_ageru_to_kubaru",     // #122 上げるのは機械、配るのは重力です。
  "kb3_ny_no_kioke",         // #123 ニューヨークの屋根の、あの木の桶がこれです。
];

export const kosoB3aScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
