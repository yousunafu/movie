// 「私は何者?」の回: 占い師キャラのデザイン試作 5案 (人間版)。
// からくり占い機「ウラナイ屋1号」の代わりに置く候補。
//   静止画: npx remotion still src/remotion/index.ts Uranaishi out/u1.png --frame=75
//   案1=0〜149 / 案2=150〜299 / 案3=300〜449 / 案4=450〜599 / 案5=600〜749 / 勢ぞろい=750〜899
// 作法: 黄色 (KRP.yellow / KRP.brass) と、チカチカ光るもの・くるくる回るものは使わない。
//       金属まわりは bronze / copper / silver でまとめる。
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT, WobbleDefs, Atmosphere, LabelPill, Ground,
} from "./KarakuriScenes";

const W = 1920;
const H = 1080;
const FONT = KARAKURI_FONT;
const abs: React.CSSProperties = { position: "absolute", inset: 0 };
const SKIN = "#F6D7B8"; // 肌色は全作品で固定
const PUR = { deep: "#4E4374", mid: "#6B5B8E", glow: "#B9A8E0" };

type P = { x: number; y: number; s?: number; f?: number };

// 共通: 水晶玉 (置き台つき)。中心は (cx, cy)
const CrystalBall: React.FC<{ cx: number; cy: number; r?: number; glow?: number }> = ({
  cx, cy, r = 56, glow = 0.6,
}) => (
  <g>
    <ellipse cx={cx} cy={cy + r * 0.86} rx={r * 0.92} ry={r * 0.34}
      fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={cx} cy={cy} r={r} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
    <circle cx={cx} cy={cy} r={r * 0.62} fill={KRP.white} opacity={0.28 + glow * 0.3} />
    <path d={`M ${cx - r * 0.5} ${cy - r * 0.3} Q ${cx - r * 0.2} ${cy - r * 0.68} ${cx + r * 0.12} ${cy - r * 0.6}`}
      fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" />
  </g>
);

// ===================================================================
// 案1: マダム・ソフィア (年配の女性占い師 / テーブルと水晶玉)
// ===================================================================
export const MadamSophia: React.FC<P> = ({ x, y, s = 1, f = 0 }) => {
  const bob = Math.sin(f / 19) * 2.5;
  const glow = 0.5 + Math.sin(f / 11) * 0.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 人物 (テーブルの後ろ) */}
      <g transform={`translate(0 ${bob})`}>
        {/* 肩と上半身 (ショール) */}
        <path d="M -216 -300 Q -236 -492 -104 -548 L 104 -548 Q 236 -492 216 -300 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ショールの房 */}
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
          <line x1={-150} y1={-430} x2={-120} y2={-320} />
          <line x1={150} y1={-430} x2={120} y2={-320} />
        </g>
        {/* 首 */}
        <rect x={-30} y={-592} width={60} height={64} rx={16} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
        {/* 顔 */}
        <ellipse cx={0} cy={-646} rx={84} ry={88} fill={SKIN} stroke={KRP.ink} strokeWidth={6} />
        {/* 頭のスカーフ */}
        <path d="M -88 -660 Q -84 -762 0 -762 Q 84 -762 88 -660 Q 40 -700 0 -700 Q -40 -700 -88 -660 Z"
          fill={PUR.mid} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -88 -664 Q -140 -640 -132 -566 Q -104 -610 -78 -620 Z"
          fill={PUR.deep} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* スカーフのひも飾り (回らない) */}
        <circle cx={0} cy={-742} r={13} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 目 (たれ目・年配) */}
        <path d="M -52 -660 Q -34 -676 -16 -660" fill="none" stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 16 -660 Q 34 -676 52 -660" fill="none" stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
        <circle cx={-34} cy={-652} r={7} fill={KRP.ink} />
        <circle cx={34} cy={-652} r={7} fill={KRP.ink} />
        {/* ほうれい線 (年配の印) */}
        <path d="M -40 -620 Q -32 -600 -20 -594" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} strokeLinecap="round" />
        <path d="M 40 -620 Q 32 -600 20 -594" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} strokeLinecap="round" />
        {/* 口 */}
        <path d="M -20 -604 Q 0 -588 20 -604" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        {/* 大きな輪のイヤリング */}
        <circle cx={-92} cy={-622} r={22} fill="none" stroke={KRP.bronze} strokeWidth={7} />
        <circle cx={92} cy={-622} r={22} fill="none" stroke={KRP.bronze} strokeWidth={7} />
      </g>
      {/* テーブル (布がけ) */}
      <path d="M -330 -320 L 330 -320 L 300 -8 L -300 -8 Z"
        fill={PUR.deep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={-320} rx={332} ry={34} fill={PUR.mid} stroke={KRP.ink} strokeWidth={6} />
      {/* 布のひだ */}
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
        <line x1={-170} y1={-300} x2={-158} y2={-20} />
        <line x1={170} y1={-300} x2={158} y2={-20} />
      </g>
      {/* 水晶玉 */}
      <CrystalBall cx={0} cy={-392} r={62} glow={glow} />
      {/* 両手 (玉にかざす) */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M ${d * 118} -300 Q ${d * 124} -372 ${d * 96} -404 Q ${d * 78} -424 ${d * 86} -440`}
            fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={d * 94} cy={-412} rx={30} ry={24} transform={`rotate(${d * -24} ${d * 94} -412)`}
            fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
        </g>
      ))}
    </g>
  );
};

// ===================================================================
// 案2: 星読みのアストロ (若い男性 / 星図とローブ)
// ===================================================================
export const StarReader: React.FC<P> = ({ x, y, s = 1, f = 0 }) => {
  const bob = Math.sin(f / 16) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${bob})`}>
        {/* ローブ (すそ広がり) */}
        <path d="M -176 0 Q -162 -330 -92 -452 L 92 -452 Q 162 -330 176 0 Z"
          fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ローブの星模様 */}
        <g fill={KRP.white} opacity={0.85}>
          {[[-96, -120, 15], [-30, -240, 11], [74, -170, 13], [18, -70, 10], [-120, -270, 9], [110, -300, 10]].map(
            ([sx, sy, sr], i) => (
              <path key={i}
                d={`M ${sx} ${sy - sr} L ${sx + sr * 0.3} ${sy - sr * 0.3} L ${sx + sr} ${sy}
                   L ${sx + sr * 0.3} ${sy + sr * 0.3} L ${sx} ${sy + sr}
                   L ${sx - sr * 0.3} ${sy + sr * 0.3} L ${sx - sr} ${sy}
                   L ${sx - sr * 0.3} ${sy - sr * 0.3} Z`} />
            ),
          )}
        </g>
        {/* 襟 */}
        <path d="M -92 -452 L 0 -392 L 92 -452 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* 首 */}
        <rect x={-26} y={-498} width={52} height={58} rx={14} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
        {/* 顔 (若い男性・輪郭すっきり) */}
        <path d="M -70 -582 Q -70 -644 0 -644 Q 70 -644 70 -582 L 70 -548 Q 70 -482 0 -482 Q -70 -482 -70 -548 Z"
          fill={SKIN} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 前髪 */}
        <path d="M -72 -596 Q -62 -654 0 -654 Q 62 -654 72 -596 Q 40 -620 10 -604 Q -24 -628 -72 -596 Z"
          fill="#3C3A44" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 目 (まっすぐ前を見る) */}
        <circle cx={-28} cy={-566} r={9} fill={KRP.ink} />
        <circle cx={28} cy={-566} r={9} fill={KRP.ink} />
        {/* 口 */}
        <path d="M -14 -526 Q 0 -514 14 -526" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        {/* とんがり帽子 */}
        <path d="M -108 -636 L 10 -872 Q 26 -846 96 -660 Z"
          fill={PUR.deep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={-6} cy={-646} rx={122} ry={28} fill={PUR.mid} stroke={KRP.ink} strokeWidth={6} />
        {/* 帽子の星 */}
        <path d="M -8 -760 L 0 -742 L 18 -738 L 4 -724 L 8 -706 L -8 -716 L -24 -706 L -20 -724 L -34 -738 L -16 -742 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      </g>
      {/* 左手: 星図の巻物 */}
      <g transform={`translate(-198 ${-250 + bob})`}>
        <rect x={-96} y={-70} width={192} height={140} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
        <g stroke={KRP.blueDeep} strokeWidth={3.5} opacity={0.85} fill="none">
          <line x1={-62} y1={-34} x2={-16} y2={6} />
          <line x1={-16} y1={6} x2={34} y2={-22} />
          <line x1={34} y1={-22} x2={62} y2={30} />
        </g>
        <g fill={KRP.blueDeep}>
          <circle cx={-62} cy={-34} r={7} /><circle cx={-16} cy={6} r={7} />
          <circle cx={34} cy={-22} r={7} /><circle cx={62} cy={30} r={7} />
        </g>
        <rect x={-110} y={-82} width={22} height={164} rx={11} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <rect x={88} y={-82} width={22} height={164} rx={11} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 巻物を持つ手 */}
      <ellipse cx={-120} cy={-212 + bob} rx={28} ry={23} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 右手: 上を指さす */}
      <g transform={`translate(166 ${-330 + bob})`}>
        <path d="M -24 70 Q -6 10 14 -36" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={18} cy={-44} rx={26} ry={30} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={8} y={-104} width={22} height={54} rx={11} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </g>
  );
};

// ===================================================================
// 案3: 辻占の先生 (和風・年配の男性 / 筮竹と行灯)
// ===================================================================
export const TsujiuraSensei: React.FC<P> = ({ x, y, s = 1, f = 0 }) => {
  const bob = Math.sin(f / 21) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 行灯 (右うしろ。光るが点滅はしない) */}
      <g transform="translate(286 0)">
        <rect x={-14} y={-96} width={28} height={96} rx={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-74} y={-338} width={148} height={244} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-74} y={-338} width={148} height={244} rx={10} fill={KRP.orange} opacity={0.3} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.45}>
          <line x1={-74} y1={-258} x2={74} y2={-258} />
          <line x1={-74} y1={-178} x2={74} y2={-178} />
        </g>
        <text x={0} y={-262} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={KRP.ink}>易</text>
        <text x={0} y={-146} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={KRP.ink}>占</text>
        <rect x={-86} y={-356} width={172} height={24} rx={8} fill={KRP.ink} />
      </g>
      {/* 床几 (こしかけ) */}
      <rect x={-250} y={-116} width={320} height={26} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-232} y={-92} width={22} height={92} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <rect x={30} y={-92} width={22} height={92} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`translate(0 ${bob})`}>
        {/* 和服の胴 (すわっている) */}
        <path d="M -186 -110 Q -196 -330 -96 -404 L 96 -404 Q 196 -330 186 -110 Z"
          fill="#4A4F58" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 合わせ (白い内側) */}
        <path d="M -56 -404 L 0 -268 L 56 -404 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* 帯 */}
        <rect x={-180} y={-196} width={360} height={56} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        {/* ひざ (前に出る) */}
        <path d="M -186 -110 Q -250 -108 -256 -46 L -256 -4 L -70 -4 L -70 -110 Z"
          fill="#3E434B" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 首 */}
        <rect x={-26} y={-448} width={52} height={54} rx={14} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
        {/* 顔 (年配の男性) */}
        <ellipse cx={0} cy={-510} rx={78} ry={82} fill={SKIN} stroke={KRP.ink} strokeWidth={6} />
        {/* 白いあごひげ */}
        <path d="M -58 -480 Q -56 -376 0 -364 Q 56 -376 58 -480 Q 30 -440 0 -440 Q -30 -440 -58 -480 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* 白い眉 */}
        <path d="M -62 -544 Q -42 -558 -18 -548" fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" />
        <path d="M 18 -548 Q 42 -558 62 -544" fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" />
        <path d="M -62 -544 Q -42 -558 -18 -548" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        <path d="M 18 -548 Q 42 -558 62 -544" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        {/* 丸眼鏡 */}
        <circle cx={-32} cy={-516} r={28} fill={KRP.white} opacity={0.5} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={32} cy={-516} r={28} fill={KRP.white} opacity={0.5} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-4} y1={-516} x2={4} y2={-516} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-32} cy={-514} r={7} fill={KRP.ink} />
        <circle cx={32} cy={-514} r={7} fill={KRP.ink} />
        {/* 頭 (うすい髪) */}
        <path d="M -76 -530 Q -70 -598 0 -598 Q 70 -598 76 -530 Q 40 -570 0 -568 Q -40 -570 -76 -530 Z"
          fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      </g>
      {/* 筮竹 (ぜいちく) の束を左手で持つ */}
      <g transform={`translate(-196 ${-250 + bob}) rotate(-12)`}>
        {[-30, -18, -6, 6, 18, 30].map((dx, i) => (
          <line key={i} x1={dx} y1={-120} x2={dx * 1.6} y2={92}
            stroke={i % 2 ? KRP.cream : "#E7D9BC"} strokeWidth={9} strokeLinecap="round" />
        ))}
        {[-30, -18, -6, 6, 18, 30].map((dx, i) => (
          <line key={`o${i}`} x1={dx} y1={-120} x2={dx * 1.6} y2={92}
            stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} strokeLinecap="round" />
        ))}
        <ellipse cx={4} cy={30} rx={34} ry={27} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      {/* 右手 (ひざの上) */}
      <ellipse cx={-110} cy={-96 + bob} rx={32} ry={25} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
    </g>
  );
};

// ===================================================================
// 案4: タロットのリサ (若い女性 / カードを扇に広げる)
// ===================================================================
export const TarotLisa: React.FC<P> = ({ x, y, s = 1, f = 0 }) => {
  const bob = Math.sin(f / 17) * 2.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 小さな丸テーブル */}
      <rect x={-22} y={-150} width={44} height={150} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <ellipse cx={0} cy={-14} rx={110} ry={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <ellipse cx={0} cy={-162} rx={228} ry={48} fill={PUR.mid} stroke={KRP.ink} strokeWidth={6} />
      {/* テーブルの上の3枚 */}
      {[-118, 0, 118].map((cx, i) => (
        <g key={i} transform={`translate(${cx} -176) rotate(${(i - 1) * 7})`}>
          <rect x={-46} y={-30} width={92} height={60} rx={7} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={0} r={15} fill={PUR.deep} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <g transform={`translate(0 ${bob})`}>
        {/* 上半身 (テーブルの向こう) */}
        <path d="M -164 -186 Q -176 -368 -86 -428 L 86 -428 Q 176 -368 164 -186 Z"
          fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 襟もと */}
        <path d="M -56 -428 Q 0 -374 56 -428 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* 首 */}
        <rect x={-26} y={-472} width={52} height={54} rx={14} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
        {/* 顔 */}
        <ellipse cx={0} cy={-532} rx={76} ry={80} fill={SKIN} stroke={KRP.ink} strokeWidth={6} />
        {/* ボブの髪 */}
        <path d="M -82 -510 Q -88 -624 0 -624 Q 88 -624 82 -510 L 82 -468 Q 66 -512 54 -544
                 Q 20 -560 -30 -548 Q -62 -534 -82 -468 Z"
          fill="#4A3B38" stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {/* 目 (にっこり) */}
        <path d="M -48 -538 Q -32 -556 -16 -538" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M 16 -538 Q 32 -556 48 -538" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        {/* ほっぺ */}
        <circle cx={-52} cy={-508} r={11} fill="#F0B8A8" opacity={0.8} />
        <circle cx={52} cy={-508} r={11} fill="#F0B8A8" opacity={0.8} />
        {/* 口 */}
        <path d="M -16 -498 Q 0 -482 16 -498" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* 右手: カードを扇に広げる */}
      <g transform={`translate(252 ${-298 + bob})`}>
        {[-34, -17, 0, 17, 34].map((a, i) => (
          <g key={i} transform={`rotate(${a}) translate(0 -96)`}>
            <rect x={-42} y={-66} width={84} height={132} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-30} y={-54} width={60} height={108} rx={5} fill={PUR.deep} opacity={0.9}
              stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={0} r={16} fill={KRP.cream} opacity={0.9} />
          </g>
        ))}
        <ellipse cx={0} cy={18} rx={34} ry={28} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      {/* 右腕 */}
      <path d={`M 140 ${-290 + bob} Q 206 ${-304 + bob} 244 ${-290 + bob}`}
        fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 左手: 1枚を差し出す */}
      <g transform={`translate(-234 ${-236 + bob}) rotate(-16)`}>
        <rect x={-50} y={-78} width={100} height={156} rx={9} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={0} cy={-14} r={30} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -14 -24 Q -2 -36 12 -24" fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
        <text x={0} y={56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>?</text>
        <ellipse cx={-44} cy={60} rx={30} ry={24} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
    </g>
  );
};

// ===================================================================
// 案5: フードの占い師 (性別も歳もわからない / 顔は影、目だけ見える)
// ===================================================================
export const HoodedSeer: React.FC<P> = ({ x, y, s = 1, f = 0 }) => {
  const bob = Math.sin(f / 23) * 3;
  const float = Math.sin(f / 13) * 7;
  const eye = 0.62 + Math.sin(f / 15) * 0.16;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${bob})`}>
        {/* ローブ (床までひきずる) */}
        <path d="M -230 0 Q -200 -340 -100 -470 L 100 -470 Q 200 -340 230 0 Z"
          fill={PUR.deep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ローブのひだ */}
        <g stroke={KRP.ink} strokeWidth={4.5} opacity={0.35} fill="none">
          <path d="M -104 -420 Q -116 -220 -138 -10" />
          <path d="M 104 -420 Q 116 -220 138 -10" />
          <path d="M 0 -400 L 0 -10" />
        </g>
        {/* すそのギザギザ */}
        <path d="M -230 0 L -184 -30 L -138 0 L -92 -30 L -46 0 L 0 -30 L 46 0 L 92 -30 L 138 0 L 184 -30 L 230 0 Z"
          fill={PUR.mid} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 肩まわり (マント) */}
        <path d="M -176 -376 Q -120 -470 0 -470 Q 120 -470 176 -376 Q 90 -430 0 -430 Q -90 -430 -176 -376 Z"
          fill={PUR.mid} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* フード (大きく深い) */}
        <path d="M -126 -452 Q -142 -700 0 -700 Q 142 -700 126 -452 Q 64 -500 0 -500 Q -64 -500 -126 -452 Z"
          fill={PUR.mid} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
        {/* フードの中の影 */}
        <path d="M -98 -474 Q -110 -664 0 -664 Q 110 -664 98 -474 Q 50 -512 0 -512 Q -50 -512 -98 -474 Z"
          fill="#231E33" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 目 (2つの光) */}
        <g opacity={eye}>
          <ellipse cx={-36} cy={-574} rx={22} ry={11} fill={PUR.glow} />
          <ellipse cx={36} cy={-574} rx={22} ry={11} fill={PUR.glow} />
          <ellipse cx={-36} cy={-574} rx={11} ry={6} fill={KRP.white} />
          <ellipse cx={36} cy={-574} rx={11} ry={6} fill={KRP.white} />
        </g>
        {/* 胸もとの留め具 */}
        <circle cx={0} cy={-412} r={22} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={0} cy={-412} r={9} fill={PUR.deep} />
      </g>
      {/* 両手 (前にかざす) */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M ${d * 150} ${-370 + bob} Q ${d * 176} ${-300 + bob} ${d * 132} ${-258 + bob}`}
            fill="none" stroke={PUR.mid} strokeWidth={34} strokeLinecap="round" />
          <path d={`M ${d * 150} ${-370 + bob} Q ${d * 176} ${-300 + bob} ${d * 132} ${-258 + bob}`}
            fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.25} />
          <ellipse cx={d * 120} cy={-244 + bob} rx={32} ry={26} transform={`rotate(${d * 30} ${d * 120} ${-244 + bob})`}
            fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
        </g>
      ))}
      {/* 手のあいだに浮かぶ玉 */}
      <g transform={`translate(0 ${float})`}>
        <circle cx={0} cy={-268} r={58} fill={PUR.glow} opacity={0.3} />
        <CrystalBall cx={0} cy={-268} r={46} glow={0.7} />
      </g>
    </g>
  );
};

// ===================================================================
// プレビュー: 1案150フレーム + 最後に勢ぞろい
// ===================================================================
const NAMES = [
  { label: "案1: マダム・ソフィア", sub: "年配の女性。テーブルの水晶玉に手をかざす" },
  { label: "案2: 星読みのアストロ", sub: "若い男性。星柄のローブと星図" },
  { label: "案3: 辻占の先生", sub: "和風・年配の男性。筮竹と「易」の行灯" },
  { label: "案4: タロットのリサ", sub: "若い女性。カードを扇に広げる" },
  { label: "案5: フードの占い師", sub: "男女も歳も不明。顔は影、目だけ光る" },
];

export const URANAISHI_FRAMES = 150 * 6;

export const Uranaishi: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(Math.floor(frame / 150), 5);
  const f = frame - idx * 150;
  const all = idx === 5;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={41 + idx} />
        <Ground y={all ? 880 : 940} />
        <g filter="url(#wobble)">
          {idx === 0 && <MadamSophia x={960} y={940} s={1.0} f={f} />}
          {idx === 1 && <StarReader x={960} y={940} s={0.92} f={f} />}
          {idx === 2 && <TsujiuraSensei x={930} y={940} s={0.98} f={f} />}
          {idx === 3 && <TarotLisa x={930} y={940} s={1.0} f={f} />}
          {idx === 4 && <HoodedSeer x={960} y={940} s={0.95} f={f} />}
          {all && (
            <g>
              <MadamSophia x={250} y={860} s={0.40} f={f} />
              <StarReader x={600} y={860} s={0.38} f={f} />
              <TsujiuraSensei x={950} y={860} s={0.40} f={f} />
              <TarotLisa x={1300} y={860} s={0.40} f={f} />
              <HoodedSeer x={1670} y={860} s={0.39} f={f} />
            </g>
          )}
        </g>
      </svg>
      {all ? (
        <>
          <LabelPill x={960} y={80} text="占い師デザイン 5案 (勢ぞろい)" size={48} centerX />
          {[[250, "案1 マダム"], [600, "案2 アストロ"], [950, "案3 辻占の先生"],
          [1300, "案4 リサ"], [1670, "案5 フード"]].map(([lx, lt], i) => (
            <LabelPill key={i} x={lx as number} y={916} text={lt as string} size={32} centerX />
          ))}
        </>
      ) : (
        <>
          <LabelPill x={960} y={80} text={NAMES[idx].label} size={50} centerX />
          <LabelPill x={960} y={988} text={NAMES[idx].sub} size={34} centerX />
        </>
      )}
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};
