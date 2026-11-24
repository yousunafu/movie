// 「なぜ人は、柔らかいものを握りたくなるのか」のサムネ 4パターン (1280×720)。本編とは無関係。
// 本編の部品を流用 (絵のブレ禁止): Squishy / YaHand / 針金の母 / 布の母 / 子ザル / メインキャラ Person
// ★「抱っこ」の文字・絵の答えは出さない (構成案の指定)
//   P1 どアップ・リアクション型 / P2 ビフォーアフター対比型 / P3 ミニマル余白型 / P4 実験の物語+ワイプ型
// 書き出し: npx remotion still src/remotion/index.ts YawaThumbP1 <out.png> --frame=0
// 見比べ:   YawaThumbSheet (大きく2×2) / YawaThumbFeed (おすすめ欄の大きさで並べる)

import React from "react";
import { KRP, KARAKURI_FONT, Person } from "./KarakuriScenes";
import { Squishy } from "./YawaParts";
import { YaHand } from "./YawaA";
import { L3bWireMom } from "./YawaE2";
import { L3dClothMom, L3dMonkeySit } from "./YawaE4";

import { TW, TH, INK, FONT, MINCHO, P, Big, Burst, makeThumb, makeThumbSheet, makeThumbFeed } from "./ThumbKit";
export { TW, TH };

// ===== P1: どアップ・リアクション型 =====
const P1: React.FC = () => (
  <g>
    <Burst cx={430} cy={470} a="#FFD84D" b="#FFC21F" />
    {/* むにゅっと握られるスクイーズ (画面の主役・特大) */}
    <Squishy x={430} y={690} s={1.75} squeeze={0.5} dent={1} face="squish" />
    <YaHand x={520} y={365} s={0.95} rot={-62} sleeve={KRP.blueDeep} open={0.1} />
    <Big x={655} y={505} size={68} text="むにゅ" fill="#F6B4C4" sw={14} rot={12} />
    {/* 名札「スクイーズ」(何を握っているかを文字でも言う) */}
    <g transform="rotate(-6 40 330)">
      <rect x={40} y={318} width={372} height={96} rx={48} fill={KRP.white} stroke={INK} strokeWidth={9} />
      <text x={226} y={386} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#E0607E">スクイーズ</text>
    </g>
    {/* びっくりするメインキャラ (右・胸から上) */}
    <Person x={1075} y={930} s={1.8} face="surprised" gaze={[-3, 0]} still />
    <Big x={1180} y={300} size={120} text="!!" anchor="middle" fill={KRP.red} sw={16} />
    {/* 文字 */}
    <Big x={52} y={118} size={74} text="なぜか、" fill={KRP.red} stroke={KRP.white} sw={14} />
    <Big x={44} y={262} size={150} text="握っちゃう" fill={KRP.white} sw={24} />
  </g>
);

// ===== P2: ビフォーアフター対比型 =====
const P2: React.FC = () => {
  const cut = "640,0 760,0 520,720 400,720";
  return (
    <g>
      {/* 左: 20万年前の洞窟 */}
      <rect width={TW} height={TH} fill="#4A3A2E" />
      <path d="M -40 720 L -40 120 Q 300 -60 700 140 L 560 720 Z" fill="#6B5442" />
      <path d="M 40 720 Q 80 300 330 230 Q 560 180 640 330 L 520 720 Z" fill="#2E241C" opacity={0.6} />
      {/* 草のベッド */}
      <ellipse cx={270} cy={600} rx={230} ry={58} fill="#7E9A4A" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 26 }).map((_, i) => {
        const gx = 70 + i * 16;
        return <path key={i} d={`M ${gx} 610 q ${6 - (i % 3) * 6} -46 ${14 - (i % 4) * 7} -${60 + (i % 5) * 8}`} fill="none" stroke="#5E7A30" strokeWidth={6} strokeLinecap="round" />;
      })}
      {/* 焚き火 */}
      <g transform="translate(470 610)">
        <path d="M -36 0 L 36 0 M -30 -8 L 30 8" stroke={KRP.bronze} strokeWidth={12} strokeLinecap="round" />
        <path d="M 0 -96 Q 34 -40 18 -8 Q 0 4 -18 -8 Q -34 -40 0 -96 Z" fill={KRP.orange} stroke={INK} strokeWidth={5} />
        <path d="M 0 -56 Q 14 -26 6 -10 Q 0 -4 -6 -10 Q -14 -26 0 -56 Z" fill={KRP.yellow} />
      </g>
      {/* 右: いま */}
      <polygon points={`760,0 ${TW},0 ${TW},${TH} 520,${TH}`} fill="#FBD3DC" />
      {Array.from({ length: 9 }).map((_, r) =>
        Array.from({ length: 9 }).map((__, c) => (
          <circle key={`${r}-${c}`} cx={700 + c * 70 + (r % 2) * 35} cy={r * 84} r={9} fill="#FFFFFF" opacity={0.6} />
        )),
      )}
      <polygon points={`760,0 ${TW},0 ${TW},${TH} 520,${TH}`} fill="none" />
      <Squishy x={980} y={640} s={1.5} face="smile" />
      {/* 斜めの境目 */}
      <polygon points={cut} fill={KRP.white} stroke={INK} strokeWidth={6} />
      {/* ラベル */}
      <rect x={34} y={34} width={330} height={92} rx={18} fill={INK} />
      <text x={199} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={KRP.white}>20万年前</text>
      <rect x={1060} y={34} width={186} height={92} rx={18} fill={INK} />
      <text x={1153} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={KRP.white}>いま</text>
      {/* まんなかの問い */}
      <circle cx={600} cy={330} r={150} fill={KRP.yellow} stroke={INK} strokeWidth={10} />
      <Big x={600} y={312} size={92} text="同じ" anchor="middle" fill={INK} stroke={KRP.white} sw={0} />
      <Big x={600} y={418} size={92} text="理由？" anchor="middle" fill={KRP.red} stroke={KRP.white} sw={0} />
    </g>
  );
};

// ===== P3: ミニマル余白型 (暗い・静か) =====
const P3: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="spot" cx="50%" cy="78%" r="55%">
        <stop offset="0%" stopColor="#3A4560" />
        <stop offset="100%" stopColor="#10141F" />
      </radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF4D8" stopOpacity={0.0} />
        <stop offset="100%" stopColor="#FFF4D8" stopOpacity={0.16} />
      </linearGradient>
    </defs>
    <rect width={TW} height={TH} fill="url(#spot)" />
    <polygon points="880,0 1000,0 1180,640 700,640" fill="url(#beam)" />
    <ellipse cx={940} cy={640} rx={250} ry={34} fill="#FFF4D8" opacity={0.1} />
    <Squishy x={940} y={640} s={1.15} squeeze={0.25} dent={0.7} face="smile" />
    <text x={96} y={318} fontFamily={MINCHO} fontWeight={600} fontSize={96} fill="#F4EEDF" letterSpacing={6}>なぜ、</text>
    <text x={96} y={446} fontFamily={MINCHO} fontWeight={600} fontSize={96} fill="#F4EEDF" letterSpacing={6}>握るのか。</text>
    <line x1={100} y1={500} x2={420} y2={500} stroke={KRP.brass} strokeWidth={3} />
    <text x={100} y={552} fontFamily={MINCHO} fontSize={36} fill={KRP.brass} letterSpacing={4}>20万年ぶんの、手ざわり</text>
  </g>
);

// ===== P4: 実験の物語+ワイプ型 =====
const P4: React.FC = () => (
  <g>
    <rect width={TW} height={TH} fill="#DCE5EC" />
    <rect y={590} width={TW} height={130} fill="#B9C6D0" />
    <line x1={0} y1={590} x2={TW} y2={590} stroke={INK} strokeWidth={5} />
    {/* 左: 針金のお母さん (ミルクつき)・少しくすませる */}
    <g transform="translate(250 620)" opacity={0.72}>
      <L3bWireMom s={1.2} />
    </g>
    <Big x={250} y={690} size={52} text="ミルクあり" anchor="middle" fill={KRP.white} sw={12} />
    {/* 右: 布のお母さんと、しがみつく子ザル */}
    <circle cx={740} cy={380} r={250} fill="#FFE9A8" opacity={0.55} />
    <g transform="translate(760 620)"><L3dClothMom s={1.2} f={0} bulb={false} blushOn={0.6} /></g>
    <g transform="translate(640 622)"><L3dMonkeySit s={1.05} f={0} look={1} closed mouth="smile" /></g>
    {/* 矢印 */}
    <path d="M 470 160 Q 560 120 610 200" fill="none" stroke={KRP.red} strokeWidth={16} strokeLinecap="round" />
    <path d="M 588 214 L 622 210 L 616 176" fill="none" stroke={KRP.red} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
    {/* 文字 */}
    <Big x={40} y={128} size={98} text="なぜ、こっち？" fill={KRP.yellow} sw={20} />
    {/* ワイプ (右下の丸窓でメインキャラが驚く) */}
    <defs><clipPath id="wipe"><circle cx={1110} cy={540} r={150} /></clipPath></defs>
    <circle cx={1110} cy={540} r={158} fill={KRP.white} stroke={INK} strokeWidth={8} />
    <g clipPath="url(#wipe)">
      <rect x={950} y={380} width={320} height={320} fill="#FFD84D" />
      <Person x={1110} y={1000} s={1.85} face="surprised" gaze={[-3, -1]} still />
    </g>
    <circle cx={1110} cy={540} r={150} fill="none" stroke={INK} strokeWidth={8} />
  </g>
);

export const ThumbArt: React.FC<{ p: P }> = ({ p }) =>
  p === 1 ? <P1 /> : p === 2 ? <P2 /> : p === 3 ? <P3 /> : <P4 />;

export const YawaThumbP1 = makeThumb(ThumbArt, 1);
export const YawaThumbP2 = makeThumb(ThumbArt, 2);
export const YawaThumbP3 = makeThumb(ThumbArt, 3);
export const YawaThumbP4 = makeThumb(ThumbArt, 4);
export const YawaThumbSheet = makeThumbSheet(ThumbArt, "yw");
export const YawaThumbFeed = makeThumbFeed(ThumbArt, "yw", ["なぜ人は、柔らかいものを", "握りたくなるのか"]);
