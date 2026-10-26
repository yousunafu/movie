import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP } from "../karakuri/KarakuriScenes";

// 人物デザイン試作 A〜E (お手本の丸頭+縦長楕円白目から離れた、オリジナル候補)
// 共通: 焦げ茶輪郭・2頭身・クラフト紙。頭の形と目でアイデンティティを変える

const FONT = '"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
const INK = KRP.ink;
const SW = 5;

// ===== A. たまご頭+点目+ほっぺ (絵本風) =====
const PersonA: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚・靴 */}
    <rect x={-30} y={-58} width={24} height={52} fill="#5A6E52" stroke={INK} strokeWidth={4.5} />
    <rect x={6} y={-58} width={24} height={52} fill="#5A6E52" stroke={INK} strokeWidth={4.5} />
    <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={INK} />
    <ellipse cx={18} cy={-4} rx={20} ry={9} fill={INK} />
    {/* 腕・胴 (丸みのあるワンピース型) */}
    <rect x={-76} y={-146} width={22} height={80} rx={11} fill="#7FA06A" stroke={INK} strokeWidth={4.5} />
    <rect x={54} y={-146} width={22} height={80} rx={11} fill="#7FA06A" stroke={INK} strokeWidth={4.5} />
    <path d="M -52 -160 Q 0 -174 52 -160 L 62 -54 L -62 -54 Z" fill="#7FA06A" stroke={INK} strokeWidth={5} />
    {/* 頭 (たまご型) */}
    <ellipse cx={0} cy={-230} rx={54} ry={68} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
    {/* 前髪 (3つの山) */}
    <path
      d="M -52 -252 Q -54 -296 0 -298 Q 54 -296 52 -252 Q 42 -266 28 -256 Q 18 -270 0 -268 Q -18 -270 -28 -256 Q -42 -266 -52 -252 Z"
      fill="#8A6A4F" stroke={INK} strokeWidth={4}
    />
    {/* 点目 */}
    <circle cx={-22} cy={-224} r={6.5} fill={INK} />
    <circle cx={22} cy={-224} r={6.5} fill={INK} />
    {/* ほっぺ */}
    <circle cx={-40} cy={-202} r={10} fill="#EBA794" opacity={0.85} />
    <circle cx={40} cy={-202} r={10} fill="#EBA794" opacity={0.85} />
    {/* 眉・口 */}
    <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
      <path d="M -30 -246 Q -22 -250 -14 -246" />
      <path d="M 14 -246 Q 22 -250 30 -246" />
      <path d="M -12 -192 Q 0 -182 12 -192" />
    </g>
  </g>
);

// ===== B. 角丸四角頭+ボタン目+ハンチング帽 (図鑑の調査員) =====
const PersonB: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-58} width={24} height={52} fill="#4A4038" stroke={INK} strokeWidth={4.5} />
    <rect x={6} y={-58} width={24} height={52} fill="#4A4038" stroke={INK} strokeWidth={4.5} />
    <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={INK} />
    <ellipse cx={18} cy={-4} rx={20} ry={9} fill={INK} />
    <rect x={-78} y={-148} width={22} height={82} rx={11} fill="#C4883E" stroke={INK} strokeWidth={4.5} />
    <rect x={56} y={-148} width={22} height={82} rx={11} fill="#C4883E" stroke={INK} strokeWidth={4.5} />
    {/* 胴 (ベスト風の重ね) */}
    <rect x={-58} y={-160} width={116} height={108} rx={16} fill="#C4883E" stroke={INK} strokeWidth={5} />
    <path d="M -20 -160 L 0 -128 L 20 -160 Z" fill={KRP.cream} stroke={INK} strokeWidth={4} />
    {/* 頭 (角丸の四角) */}
    <rect x={-58} y={-292} width={116} height={116} rx={30} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
    {/* ハンチング帽 */}
    <path d="M -62 -276 Q -60 -312 0 -314 Q 60 -312 62 -276 Q 30 -288 0 -288 Q -30 -288 -62 -276 Z"
      fill="#5A7268" stroke={INK} strokeWidth={4.5} />
    <path d="M 40 -284 Q 70 -284 84 -272 Q 60 -266 36 -272 Z" fill="#5A7268" stroke={INK} strokeWidth={4} />
    {/* ボタン目 (黒丸+ハイライト) */}
    <circle cx={-24} cy={-232} r={12} fill={INK} />
    <circle cx={24} cy={-232} r={12} fill={INK} />
    <circle cx={-20} cy={-236} r={4} fill={KRP.white} />
    <circle cx={28} cy={-236} r={4} fill={KRP.white} />
    {/* 眉・口 */}
    <g stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none">
      <line x1={-34} y1={-256} x2={-14} y2={-258} />
      <line x1={14} y1={-258} x2={34} y2={-256} />
      <path d="M -10 -196 Q 0 -190 10 -196" />
    </g>
  </g>
);

// ===== C. 横長まんじゅう頭+小粒目+大きい丸鼻 (ゆる職人) =====
const PersonC: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-58} width={24} height={52} fill="#35485E" stroke={INK} strokeWidth={4.5} />
    <rect x={6} y={-58} width={24} height={52} fill="#35485E" stroke={INK} strokeWidth={4.5} />
    <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={INK} />
    <ellipse cx={18} cy={-4} rx={20} ry={9} fill={INK} />
    <rect x={-78} y={-148} width={22} height={82} rx={11} fill="#4A78B8" stroke={INK} strokeWidth={4.5} />
    <rect x={56} y={-148} width={22} height={82} rx={11} fill="#4A78B8" stroke={INK} strokeWidth={4.5} />
    {/* 胴 (前かけ) */}
    <rect x={-58} y={-160} width={116} height={108} rx={16} fill="#4A78B8" stroke={INK} strokeWidth={5} />
    <rect x={-34} y={-128} width={68} height={70} rx={8} fill={KRP.cream} stroke={INK} strokeWidth={4} />
    {/* 頭 (横長まんじゅう) */}
    <ellipse cx={0} cy={-218} rx={74} ry={56} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
    {/* 耳 */}
    <circle cx={-74} cy={-218} r={12} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
    <circle cx={74} cy={-218} r={12} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
    {/* ねじりはちまき */}
    <path d="M -70 -244 Q 0 -262 70 -244 L 70 -232 Q 0 -250 -70 -232 Z" fill={KRP.yellow} stroke={INK} strokeWidth={4} />
    <g stroke={INK} strokeWidth={3} opacity={0.6}>
      <line x1={-44} y1={-252} x2={-40} y2={-238} />
      <line x1={-14} y1={-256} x2={-12} y2={-242} />
      <line x1={16} y1={-256} x2={18} y2={-242} />
      <line x1={44} y1={-252} x2={48} y2={-238} />
    </g>
    {/* 小粒の離れ目 */}
    <circle cx={-34} cy={-218} r={5} fill={INK} />
    <circle cx={34} cy={-218} r={5} fill={INK} />
    {/* 大きい丸鼻 */}
    <circle cx={0} cy={-206} r={13} fill="#EBA794" stroke={INK} strokeWidth={4} />
    {/* 眉・口 */}
    <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
      <line x1={-42} y1={-234} x2={-26} y2={-236} />
      <line x1={26} y1={-236} x2={42} y2={-234} />
      <path d="M -10 -184 Q 0 -178 10 -184" />
    </g>
  </g>
);

// ===== D. 大きな丸白目 (黒目大きめ)+ベレー帽 (ものしり博士) =====
const PersonD: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-58} width={24} height={52} fill="#6E4A3C" stroke={INK} strokeWidth={4.5} />
    <rect x={6} y={-58} width={24} height={52} fill="#6E4A3C" stroke={INK} strokeWidth={4.5} />
    <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={INK} />
    <ellipse cx={18} cy={-4} rx={20} ry={9} fill={INK} />
    <rect x={-78} y={-148} width={22} height={82} rx={11} fill="#8F4E3E" stroke={INK} strokeWidth={4.5} />
    <rect x={56} y={-148} width={22} height={82} rx={11} fill="#8F4E3E" stroke={INK} strokeWidth={4.5} />
    {/* 胴 (ジャケット+ボタン) */}
    <rect x={-58} y={-160} width={116} height={108} rx={16} fill="#8F4E3E" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-128} r={5} fill={INK} />
    <circle cx={0} cy={-100} r={5} fill={INK} />
    {/* 頭 (下ぶくれの丸) */}
    <path d="M -56 -244 Q -62 -168 0 -166 Q 62 -168 56 -244 Q 50 -294 0 -296 Q -50 -294 -56 -244 Z"
      fill={KRP.white} stroke={INK} strokeWidth={5.5} />
    {/* ベレー帽 (かたむき) */}
    <g transform="rotate(-8 0 -284)">
      <ellipse cx={0} cy={-284} rx={64} ry={24} fill="#B86A4A" stroke={INK} strokeWidth={4.5} />
      <line x1={0} y1={-308} x2={0} y2={-296} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </g>
    {/* 大きな丸白目+大きな黒目 */}
    <circle cx={-26} cy={-226} r={19} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
    <circle cx={26} cy={-226} r={19} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
    <circle cx={-24} cy={-224} r={10} fill={INK} />
    <circle cx={28} cy={-224} r={10} fill={INK} />
    {/* 眉 (太め)・口 */}
    <g stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none">
      <line x1={-38} y1={-254} x2={-14} y2={-256} />
      <line x1={14} y1={-256} x2={38} y2={-254} />
    </g>
    <path d="M -10 -188 Q 0 -180 10 -188" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
  </g>
);

// ===== E. からくりロボ助手 (マスコット番外) =====
const PersonE: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚 (短い円柱)・足 */}
    <rect x={-32} y={-52} width={22} height={46} rx={8} fill={KRP.grayDark} stroke={INK} strokeWidth={4.5} />
    <rect x={10} y={-52} width={22} height={46} rx={8} fill={KRP.grayDark} stroke={INK} strokeWidth={4.5} />
    <ellipse cx={-20} cy={-4} rx={20} ry={9} fill={INK} />
    <ellipse cx={20} cy={-4} rx={20} ry={9} fill={INK} />
    {/* 腕 */}
    <rect x={-80} y={-140} width={20} height={74} rx={10} fill={KRP.silver} stroke={INK} strokeWidth={4.5} />
    <rect x={60} y={-140} width={20} height={74} rx={10} fill={KRP.silver} stroke={INK} strokeWidth={4.5} />
    {/* 胴 (メーター付き) */}
    <rect x={-60} y={-156} width={120} height={110} rx={18} fill={KRP.silver} stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-104} r={20} fill={KRP.white} stroke={INK} strokeWidth={4} />
    <line x1={0} y1={-104} x2={10} y2={-116} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
    {/* 頭 (丸角の箱+リベット) */}
    <rect x={-56} y={-280} width={112} height={104} rx={20} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
    <circle cx={-44} cy={-268} r={4} fill={INK} opacity={0.5} />
    <circle cx={44} cy={-268} r={4} fill={INK} opacity={0.5} />
    {/* アンテナ (ぜんまい) */}
    <line x1={0} y1={-296} x2={0} y2={-280} stroke={INK} strokeWidth={4} />
    <path d="M 0 -296 Q 16 -306 8 -318 Q -2 -328 -12 -318 Q -18 -308 -8 -302"
      fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {/* 目 (黄色く光る丸) */}
    <circle cx={-24} cy={-232} r={13} fill={KRP.yellow} stroke={INK} strokeWidth={4.5} />
    <circle cx={24} cy={-232} r={13} fill={KRP.yellow} stroke={INK} strokeWidth={4.5} />
    <circle cx={-24} cy={-232} r={5} fill={INK} />
    <circle cx={24} cy={-232} r={5} fill={INK} />
    {/* 口 (スリット) */}
    <g stroke={INK} strokeWidth={4} strokeLinecap="round">
      <line x1={-14} y1={-196} x2={14} y2={-196} />
      <line x1={-8} y1={-188} x2={8} y2={-188} />
    </g>
  </g>
);

const Label: React.FC<{ x: number; text: string; sub: string }> = ({ x, text, sub }) => (
  <div style={{ position: "absolute", left: x, top: 880, transform: "translateX(-50%)", textAlign: "center" }}>
    <div
      style={{
        display: "inline-block", background: KRP.white, color: INK,
        border: `3px solid ${INK}`, borderRadius: 8,
        fontFamily: FONT, fontWeight: 800, fontSize: 34, padding: "6px 20px",
        boxShadow: "3px 4px 0 rgba(59,51,44,0.25)", whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
    <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: INK, opacity: 0.75, whiteSpace: "nowrap" }}>
      {sub}
    </div>
  </div>
);

export const PersonVariants: React.FC = () => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <div
      style={{
        position: "absolute", top: 54, left: 60,
        background: INK, color: KRP.white,
        fontFamily: FONT, fontWeight: 800, fontSize: 34,
        padding: "8px 26px", borderRadius: 999, letterSpacing: 2,
      }}
    >
      人物デザイン試作 A〜E
    </div>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <PersonA x={250} y={820} s={1.15} />
      <PersonB x={610} y={820} s={1.15} />
      <PersonC x={960} y={820} s={1.15} />
      <PersonD x={1310} y={820} s={1.15} />
      <PersonE x={1670} y={820} s={1.15} />
    </svg>
    <Label x={250} text="A たまご" sub="点目+ほっぺ・絵本風" />
    <Label x={610} text="B しかく" sub="ボタン目+ハンチング・調査員" />
    <Label x={960} text="C まんじゅう" sub="小粒目+丸鼻+はちまき・職人" />
    <Label x={1310} text="D はかせ" sub="大きな黒目+ベレー帽" />
    <Label x={1670} text="E ロボ助手" sub="ぜんまい+メーター・マスコット" />
  </AbsoluteFill>
);
