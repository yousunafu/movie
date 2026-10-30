// 「私は何者?」4000年史の回: 新キャラクター候補 A〜D (デザイン試作)。
// 静止画: npx remotion still src/remotion/index.ts WatashiChars out/char-a.png --frame=75
//   案A=frame 0〜149 / 案B=150〜299 / 案C=300〜449 / 案D=450〜599 (各150fの真ん中あたりが見頃)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT, WobbleDefs, Atmosphere, LabelPill, Ground, seg,
} from "./KarakuriScenes";

const W = 1920;
const H = 1080;
const FONT = KARAKURI_FONT;
const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// この回だけの追加色 (紫の怪しい照明まわり)
const PUR = {
  deep: "#4E4374", // 幕の影
  mid: "#6B5B8E", // 幕
  glow: "#B9A8E0", // 紫のあかり
};

// ===================================================================
// 案A: からくり占い機「ウラナイ屋1号」(Zoltar式の占い自販機)
// ===================================================================
// デザインのきまりごと (作者の指示で作り直した版):
//  - 黄色 (KRP.yellow / KRP.brass) はこの機械にいっさい使わない。
//    もとは「電飾がチカチカ」「側面のゼンマイがくるくる」していて、黄色が回って見えるのが目ざわりだった。
//    今は光りものも回るものも一切ない。
//  - 上はアーチ型。窓を大きく、人形と水晶玉を大きく。下は取り出し口だけのすっきりした面。
//  - 診断書 (下から出てくる紙) は既定では描かない。「診断書」の札と取り出し口だけ残す。
//    紙を見せたい場面だけ、呼び出し側で ShindanSho を別に置く (例: #235 タネ明かし)。
//  - 水晶玉の中心は必ず (0, -352)。導入のシーンがこの位置を基準に寄り引きしているので動かさない。
const WOOD = "#A66A3E";
const WOOD_D = "#8A5531";
const WOOD_DD = "#6F4A26";
export const UranaiMachine: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({
  x, y, s = 1, f = 0,
}) => {
  const blink = (f % 97) < 5 && f > 2;
  const bob = Math.sin(f / 13) * 2.5;
  const glowPulse = 0.55 + Math.sin(f / 10) * 0.2; // 水晶玉の明滅 (回らずその場でふくらむだけ)
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 脚 */}
      <rect x={-224} y={-32} width={54} height={32} rx={8} fill={WOOD_DD} stroke={KRP.ink} strokeWidth={5} />
      <rect x={170} y={-32} width={54} height={32} rx={8} fill={WOOD_DD} stroke={KRP.ink} strokeWidth={5} />
      {/* 本体: 上がアーチの木のキャビネット */}
      <path d="M -262 -30 L -262 -606 Q -262 -820 0 -820 Q 262 -820 262 -606 L 262 -30 Z"
        fill={WOOD} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      {/* 木目 (さりげなく) */}
      <g stroke={WOOD_D} strokeWidth={3.5} opacity={0.45} fill="none">
        <path d="M -232 -560 Q -212 -500 -234 -440" />
        <path d="M 228 -400 Q 212 -350 230 -300" />
        <path d="M -230 -200 Q -214 -150 -232 -100" />
      </g>
      {/* アーチのふち飾り (青銅の線。光らない・回らない) */}
      <path d="M -238 -606 Q -238 -796 0 -796 Q 238 -796 238 -606"
        fill="none" stroke={KRP.bronze} strokeWidth={7} opacity={0.85} />
      {/* 看板 */}
      <g>
        <rect x={-196} y={-762} width={392} height={76} rx={12}
          fill={WOOD_DD} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-706} fontFamily={FONT} fontWeight={900} fontSize={46}
          fill={KRP.cream} textAnchor="middle">ウラナイ屋1号</text>
      </g>
      {/* ガラス窓 (上がアーチ。中は紫) */}
      <path d="M -212 -306 L -212 -560 Q -212 -672 0 -672 Q 212 -672 212 -560 L 212 -306 Z"
        fill={PUR.deep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 幕のドレープ (窓の上の左右) */}
      <g fill={PUR.mid} stroke={KRP.ink} strokeWidth={4}>
        <path d="M -212 -560 Q -212 -672 0 -672 Q -96 -636 -128 -512 Q -170 -500 -186 -452 Q -212 -500 -212 -560 Z" opacity={0.95} />
        <path d="M 212 -560 Q 212 -672 0 -672 Q 96 -636 128 -512 Q 170 -500 186 -452 Q 212 -500 212 -560 Z" opacity={0.95} />
      </g>
      {/* 紫のあかり (人形の後光) */}
      <ellipse cx={0} cy={-500} rx={168} ry={152} fill={PUR.glow} opacity={0.32} />
      {/* からくり人形 (上半身) */}
      <g transform={`translate(0 ${bob})`}>
        {/* 胴体 (ローブ) */}
        <path d="M -104 -308 L -88 -452 Q 0 -484 88 -452 L 104 -308 Z"
          fill={PUR.mid} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 襟 (白銅。黄色は使わない) */}
        <path d="M -88 -452 Q 0 -484 88 -452 L 78 -416 Q 0 -446 -78 -416 Z"
          fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 腕: 水晶玉に両手をかざす */}
        <rect x={-118} y={-448} width={24} height={92} rx={12} fill={PUR.mid} stroke={KRP.ink} strokeWidth={4.5}
          transform="rotate(30 -106 -448)" />
        <rect x={94} y={-448} width={24} height={92} rx={12} fill={PUR.mid} stroke={KRP.ink} strokeWidth={4.5}
          transform="rotate(-30 106 -448)" />
        <circle cx={-122} cy={-364} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={122} cy={-364} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 頭 */}
        <circle cx={0} cy={-520} r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        {/* ターバン (生成り + 青銅の帯 + 青い宝石) */}
        <path d="M -58 -538 Q -56 -600 0 -602 Q 56 -600 58 -538 Q 29 -560 0 -560 Q -29 -560 -58 -538 Z"
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -58 -538 Q 0 -520 58 -538 L 58 -524 Q 0 -506 -58 -524 Z"
          fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={-572} r={13} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
        {/* 顔のつなぎ目 (からくり人形らしさ: あごの分割線) */}
        <path d="M -33 -488 Q 0 -477 33 -488" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        {/* 目 */}
        {blink ? (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-33} y1={-522} x2={-13} y2={-522} />
            <line x1={13} y1={-522} x2={33} y2={-522} />
          </g>
        ) : (
          <g>
            <ellipse cx={-23} cy={-524} rx={12} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <ellipse cx={23} cy={-524} rx={12} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={-23} cy={-522} r={5.5} fill={KRP.ink} />
            <circle cx={23} cy={-522} r={5.5} fill={KRP.ink} />
          </g>
        )}
        {/* 眉と口 */}
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" fill="none">
          <line x1={-33} y1={-548} x2={-13} y2={-550} />
          <line x1={13} y1={-550} x2={33} y2={-548} />
          <path d="M -11 -494 Q 0 -487 11 -494" />
        </g>
      </g>
      {/* 水晶玉 (窓の中・いちばん手前)。中心 (0,-352) は動かさない */}
      <g>
        <ellipse cx={0} cy={-306} rx={66} ry={18} fill={WOOD_DD} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={0} cy={-352} r={52} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
        <circle cx={0} cy={-352} r={52} fill={PUR.glow} opacity={glowPulse * 0.45} />
        <path d="M -26 -376 Q -10 -390 12 -384" fill="none" stroke={KRP.white} strokeWidth={6}
          strokeLinecap="round" opacity={0.9} />
      </g>
      {/* 窓ガラスの反射 */}
      <g stroke={KRP.white} strokeWidth={9} opacity={0.22} strokeLinecap="round">
        <line x1={-152} y1={-612} x2={-62} y2={-346} />
        <line x1={-116} y1={-620} x2={-40} y2={-400} />
      </g>
      {/* 下の面 */}
      <rect x={-228} y={-278} width={456} height={222} rx={14}
        fill={WOOD_D} stroke={KRP.ink} strokeWidth={5.5} />
      {/* コイン投入口 (白銅) */}
      <g>
        <rect x={132} y={-250} width={78} height={58} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={163} y={-238} width={12} height={34} rx={5} fill={KRP.ink} />
      </g>
      {/* 「診断書」の札 + 取り出し口。
          ※出てくる紙は既定では描かない (作者の指示)。
            紙が必要な場面では、呼び出し側で ShindanSho などを別に置くこと。 */}
      <g>
        <rect x={-206} y={-254} width={160} height={46} rx={8}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        <text x={-126} y={-220} fontFamily={FONT} fontWeight={900} fontSize={30}
          fill={KRP.ink} textAnchor="middle">診断書</text>
        <rect x={-206} y={-182} width={300} height={82} rx={10} fill={KRP.ink} opacity={0.85} />
      </g>
    </g>
  );
};

// ===================================================================
// 案B: フクロウ博士「ホーレン先生」
// ===================================================================
export const OwlDoctor: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({
  x, y, s = 1, f = 0,
}) => {
  const headTilt = Math.sin(f / 22) * 5; // 首だけくるっと傾く
  const blink = (f % 97) < 5 && f > 2;
  const bob = Math.sin(f / 13) * 2.5;
  const BODY = "#9FB3C8";
  const BODY_D = "#7E95AE";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 本の台 (3冊) */}
      <g>
        <rect x={-150} y={-44} width={300} height={44} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-136} y={-86} width={272} height={44} rx={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-122} y={-126} width={244} height={42} rx={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
        <g stroke={KRP.white} strokeWidth={3.5} opacity={0.75}>
          <line x1={-110} y1={-22} x2={110} y2={-22} />
          <line x1={-98} y1={-64} x2={98} y2={-64} />
        </g>
        <text x={0} y={-94} fontFamily={FONT} fontWeight={800} fontSize={26} fill={KRP.ink} textAnchor="middle">
          心理学
        </text>
      </g>
      <g transform={`translate(0 ${bob})`}>
        {/* 足 (本をつかむ) */}
        <g stroke={KRP.ink} strokeWidth={4.5} fill={KRP.orange}>
          <path d="M -46 -126 L -58 -108 L -46 -112 L -40 -104 L -34 -112 L -24 -108 L -34 -126 Z" />
          <path d="M 46 -126 L 34 -108 L 44 -112 L 50 -104 L 56 -112 L 66 -108 L 56 -126 Z" />
        </g>
        {/* しっぽ羽 */}
        <path d="M -30 -150 L 0 -108 L 30 -150 Z" fill={BODY_D} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 胴体 */}
        <ellipse cx={0} cy={-250} rx={120} ry={132} fill={BODY} stroke={KRP.ink} strokeWidth={6} />
        {/* おなかの白 + うろこ羽 */}
        <ellipse cx={0} cy={-236} rx={82} ry={100} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <g fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.8}>
          {[0, 1, 2].map((row) => (
            <g key={row}>
              {[-1, 0, 1].map((col) => (
                <path key={col}
                  d={`M ${col * 44 - 18} ${-282 + row * 42} Q ${col * 44} ${-262 + row * 42} ${col * 44 + 18} ${-282 + row * 42}`} />
              ))}
            </g>
          ))}
        </g>
        {/* 翼 (左右) */}
        <path d="M -116 -300 Q -168 -250 -148 -168 Q -120 -186 -104 -220 Z" fill={BODY_D} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 116 -300 Q 168 -250 148 -168 Q 120 -186 104 -220 Z" fill={BODY_D} stroke={KRP.ink} strokeWidth={5} />
        {/* 蝶ネクタイ */}
        <g transform="translate(0 -338)">
          <path d="M -34 -16 L 0 0 L -34 16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 34 -16 L 0 0 L 34 16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={0} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 頭 (首だけ傾く) */}
        <g transform={`translate(0 -430) rotate(${headTilt})`}>
          <circle cx={0} cy={0} r={104} fill={BODY} stroke={KRP.ink} strokeWidth={6} />
          {/* 耳の羽 */}
          <path d="M -86 -56 L -112 -118 L -48 -86 Z" fill={BODY_D} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 86 -56 L 112 -118 L 48 -86 Z" fill={BODY_D} stroke={KRP.ink} strokeWidth={5} />
          {/* 顔の白いハート面 */}
          <path d="M 0 76 Q -92 54 -74 -34 Q -58 -78 0 -62 Q 58 -78 74 -34 Q 92 54 0 76 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {/* 目 */}
          {blink ? (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <line x1={-52} y1={-10} x2={-20} y2={-10} />
              <line x1={20} y1={-10} x2={52} y2={-10} />
            </g>
          ) : (
            <g>
              <circle cx={-36} cy={-10} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={36} cy={-10} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={-36} cy={-10} r={17} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={36} cy={-10} r={17} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={-36} cy={-10} r={8} fill={KRP.ink} />
              <circle cx={36} cy={-10} r={8} fill={KRP.ink} />
            </g>
          )}
          {/* 単眼鏡 (右目) */}
          <circle cx={36} cy={-10} r={32} fill="none" stroke={KRP.brass} strokeWidth={6} />
          <circle cx={36} cy={-10} r={32} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} />
          <path d="M 62 14 Q 84 54 76 96" fill="none" stroke={KRP.brass} strokeWidth={4.5} />
          {/* くちばし */}
          <path d="M -12 16 L 12 16 L 0 44 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </g>
    </g>
  );
};

// ===================================================================
// 案C: 黒猫の占い師「ミヨ」
// ===================================================================
export const FortuneCat: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({
  x, y, s = 1, f = 0,
}) => {
  const blink = (f % 97) < 5 && f > 2;
  const bob = Math.sin(f / 13) * 2.5;
  const tailSwing = Math.sin(f / 16) * 14; // しっぽゆらゆら
  const glowPulse = 0.5 + Math.sin(f / 10) * 0.22;
  const CAT = "#4C443C";
  const CAT_D = "#3B332C";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 紫の後光 */}
      <ellipse cx={0} cy={-260} rx={300} ry={260} fill={PUR.glow} opacity={0.22} />
      {/* 座布団 */}
      <ellipse cx={0} cy={-16} rx={230} ry={46} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      <ellipse cx={0} cy={-30} rx={230} ry={46} fill="#E05A48" stroke={KRP.ink} strokeWidth={5.5} />
      {[-214, 214].map((tx, i) => (
        <circle key={i} cx={tx} cy={-28} r={13} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* しっぽ (根元から揺れる) */}
      <g transform={`translate(150 -70) rotate(${tailSwing})`}>
        <path d="M 0 0 Q 90 -40 74 -140 Q 66 -190 20 -196"
          fill="none" stroke={CAT} strokeWidth={30} strokeLinecap="round" />
        <path d="M 0 0 Q 90 -40 74 -140 Q 66 -190 20 -196"
          fill="none" stroke={KRP.ink} strokeWidth={36} strokeLinecap="round" opacity={0.25} />
        <circle cx={20} cy={-196} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <g transform={`translate(0 ${bob})`}>
        {/* 胴体 (おすわり) */}
        <path d="M -118 -40 Q -128 -220 0 -228 Q 128 -220 118 -40 Q 60 -22 0 -22 Q -60 -22 -118 -40 Z"
          fill={CAT} stroke={KRP.ink} strokeWidth={6} />
        {/* 胸の白い三日月 */}
        <path d="M -40 -160 Q 0 -186 40 -160 Q 24 -128 0 -126 Q -24 -128 -40 -160 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
        {/* 前足 (そろえ) */}
        <rect x={-62} y={-96} width={34} height={78} rx={16} fill={CAT} stroke={KRP.ink} strokeWidth={5} />
        {/* 右前足: 水晶玉にかざす */}
        <g transform={`rotate(${-18 + Math.sin(f / 12) * 4} 60 -150)`}>
          <rect x={44} y={-166} width={34} height={96} rx={16} fill={CAT} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={61} cy={-70} r={20} fill={CAT_D} stroke={KRP.ink} strokeWidth={4.5} />
          <g stroke={KRP.white} strokeWidth={2.5} opacity={0.8}>
            <line x1={52} y1={-62} x2={52} y2={-76} />
            <line x1={61} y1={-58} x2={61} y2={-74} />
            <line x1={70} y1={-62} x2={70} y2={-76} />
          </g>
        </g>
        {/* 頭 */}
        <g transform="translate(0 -298)">
          {/* 耳 */}
          <path d="M -76 -28 L -98 -102 L -28 -64 Z" fill={CAT} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M 76 -28 L 98 -102 L 28 -64 Z" fill={CAT} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -70 -44 L -82 -84 L -44 -62 Z" fill="#D88FA0" stroke="none" />
          <path d="M 70 -44 L 82 -84 L 44 -62 Z" fill="#D88FA0" stroke="none" />
          <circle cx={0} cy={0} r={92} fill={CAT} stroke={KRP.ink} strokeWidth={6} />
          {/* ミニターバン */}
          <path d="M -58 -62 Q 0 -112 58 -62 Q 30 -78 0 -78 Q -30 -78 -58 -62 Z"
            fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={-84} r={11} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          {/* 目 (黄色) */}
          {blink ? (
            <g stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round">
              <line x1={-52} y1={-4} x2={-22} y2={-4} />
              <line x1={22} y1={-4} x2={52} y2={-4} />
            </g>
          ) : (
            <g>
              <ellipse cx={-36} cy={-6} rx={20} ry={24} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <ellipse cx={36} cy={-6} rx={20} ry={24} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <ellipse cx={-36} cy={-4} rx={6} ry={15} fill={KRP.ink} />
              <ellipse cx={36} cy={-4} rx={6} ry={15} fill={KRP.ink} />
            </g>
          )}
          {/* 鼻・口 */}
      <path d="M -8 30 L 8 30 L 0 40 Z" fill="#D88FA0" stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M 0 40 Q -12 54 -24 46 M 0 40 Q 12 54 24 46" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
          {/* ひげ */}
          <g stroke={KRP.white} strokeWidth={3.5} strokeLinecap="round" opacity={0.9}>
            <line x1={-66} y1={22} x2={-116} y2={14} />
            <line x1={-66} y1={36} x2={-114} y2={38} />
            <line x1={66} y1={22} x2={116} y2={14} />
            <line x1={66} y1={36} x2={114} y2={38} />
          </g>
        </g>
      </g>
      {/* 水晶玉 (手前・台つき) */}
      <g transform="translate(206 -56)">
        <path d="M -52 36 L 52 36 L 38 10 L -38 10 Z" fill="#7E5429" stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={0} cy={-38} r={52} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-38} r={52} fill={PUR.glow} opacity={glowPulse * 0.5} />
        <path d="M -26 -64 Q -10 -78 12 -70" fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
        {/* キラッ */}
        <g stroke={KRP.yellow} strokeWidth={4} strokeLinecap="round" opacity={0.5 + glowPulse * 0.5}>
          <line x1={-72} y1={-92} x2={-58} y2={-78} />
          <line x1={-58} y1={-92} x2={-72} y2={-78} />
        </g>
      </g>
    </g>
  );
};

// ===================================================================
// 案D: ぜんまい小人「コグ」(案内役)
// ===================================================================
export const CogDwarf: React.FC<{ x: number; y: number; s?: number; f?: number; point?: boolean }> = ({
  x, y, s = 1, f = 0, point = true,
}) => {
  const blink = (f % 97) < 5 && f > 2;
  const bob = Math.sin(f / 13) * 3;
  const gearRot = f * 1.8; // 帽子の歯車が回る
  const keyRot = f * 1.2; // 背中のゼンマイ
  const gearTooth = (r: number) =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return `M ${Math.cos(a) * r} ${Math.sin(a) * r} L ${Math.cos(a + 0.18) * (r + 13)} ${Math.sin(a + 0.18) * (r + 13)} L ${Math.cos(a + 0.42) * (r + 13)} ${Math.sin(a + 0.42) * (r + 13)} L ${Math.cos(a + 0.6) * r} ${Math.sin(a + 0.6) * r}`;
    }).join(" ");
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 背中のゼンマイ (左にのぞく) */}
      <g transform={`translate(-104 -170) rotate(${keyRot})`}>
        <rect x={-9} y={-7} width={18} height={14} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -38 -46 A 60 60 0 0 1 38 -46 L 28 -32 A 42 42 0 0 0 -28 -32 Z"
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} transform="rotate(90)" />
        <circle cx={0} cy={0} r={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 脚 (短め) */}
      <rect x={-26} y={-44} width={22} height={40} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={4} y={-44} width={22} height={40} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-16} cy={-3} rx={18} ry={8} fill={KRP.ink} />
      <ellipse cx={16} cy={-3} rx={18} ry={8} fill={KRP.ink} />
      {/* 胴体 (オーバーオール) */}
      <rect x={-52} y={-134} width={104} height={94} rx={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-52} y={-134} width={104} height={30} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-34} y={-140} width={14} height={38} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
      <rect x={20} y={-140} width={14} height={38} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
      {/* 胸ポケットに小さい歯車マーク */}
      <circle cx={0} cy={-84} r={13} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
      <circle cx={0} cy={-84} r={4} fill={KRP.ink} opacity={0.6} />
      {/* 腕 */}
      {point ? (
        <g>
          {/* 左腕: 下ろす */}
          <rect x={-66} y={-128} width={18} height={62} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {/* 右腕: ななめ上を指差す */}
          <g transform="rotate(-38 56 -120)">
            <rect x={48} y={-128} width={18} height={70} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={57} cy={-134} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={52} y={-156} width={10} height={24} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        </g>
      ) : (
        <g>
          <rect x={-66} y={-128} width={18} height={62} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={48} y={-128} width={18} height={62} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {/* 頭 (大きめ = 子ども比率) */}
      <circle cx={0} cy={-212} r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 帽子 (キャスケット) */}
      <path d="M -72 -232 Q -74 -294 0 -296 Q 74 -294 72 -232 Q 36 -252 0 -252 Q -36 -252 -72 -232 Z"
        fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-78} y={-238} width={156} height={14} rx={7} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 帽子の上の歯車 (回る) */}
      <g transform={`translate(0 -316) rotate(${gearRot})`}>
        <circle cx={0} cy={0} r={26} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={gearTooth(26)} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={0} r={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-36} y1={-206} x2={-14} y2={-206} />
          <line x1={14} y1={-206} x2={36} y2={-206} />
        </g>
      ) : (
        <g>
          <ellipse cx={-25} cy={-208} rx={13} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={25} cy={-208} rx={13} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-25} cy={-206} r={6} fill={KRP.ink} />
          <circle cx={25} cy={-206} r={6} fill={KRP.ink} />
        </g>
      )}
      {/* ほっぺ */}
      <circle cx={-48} cy={-186} r={9} fill="#F0B8A8" opacity={0.8} />
      <circle cx={48} cy={-186} r={9} fill="#F0B8A8" opacity={0.8} />
      {/* 口 (にこっ) */}
      <path d="M -12 -176 Q 0 -162 12 -176" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
};

// ===================================================================
// プレビュー: 各キャラ150フレームずつ
// ===================================================================
const NAMES = [
  { label: "案A: からくり占い機「ウラナイ屋1号」", sub: "ゼンマイが回り、診断書を吐き出す" },
  { label: "案B: フクロウ博士「ホーレン先生」", sub: "首がくるっと傾く観察者" },
  { label: "案C: 黒猫の占い師「ミヨ」", sub: "しっぽゆらゆら、水晶玉が光る" },
  { label: "案D: ぜんまい小人「コグ」", sub: "帽子の歯車と背中のゼンマイが回る案内役" },
];

export const WATASHI_CHARS_FRAMES = 150 * 4;

export const WatashiCharacters: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(Math.floor(frame / 150), 3);
  const f = frame - idx * 150;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={31 + idx} />
        <Ground y={880} />
        <g filter="url(#wobble)">
          {idx === 0 && <UranaiMachine x={960} y={880} s={0.85} f={f} />}
          {idx === 1 && <OwlDoctor x={960} y={880} s={1.15} f={f} />}
          {idx === 2 && <FortuneCat x={960} y={880} s={1.25} f={f} />}
          {idx === 3 && <CogDwarf x={960} y={880} s={1.9} f={f} />}
        </g>
      </svg>
      <LabelPill x={960} y={96} text={NAMES[idx].label} size={46} centerX />
      <LabelPill x={960} y={1000} text={NAMES[idx].sub} size={34} centerX />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};
