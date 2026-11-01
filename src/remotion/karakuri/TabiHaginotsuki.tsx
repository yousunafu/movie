// 仙台銘菓「萩の月」を実物に寄せて描くための部品 (ブロック5 #186 専用)。
// 実物: 直径7cm強・高さ4cmほどの饅頭型。カスタードクリームをカステラ生地で包んだ生菓子。
//  - ★外側は「きつね色」ではなく、淡い黄色〜たまご色 (2026-11-01 作者指摘)。
//    天面だけがほんのり濃い山吹色で、腰から下はほぼクリーム色に抜ける。
//  - 底は紙に接していた面なので、さらに白っぽい黄白色
//  - 中身は白〜淡黄色のカスタードクリーム
//  - 一個ずつ紙の受け皿に乗り、フィルムで個包装される
// 商標・パッケージのロゴは描かない (お菓子そのものを描く方針)。
//
// 座標系: 原点は「菓子が置かれている面」の中心 (y=0 が接地面、上が負)。
// 半径150・高さ160 で設計してあるので、呼び出し側は scale で大きさを決める。
// (実物は直径7cm×高さ4cm = 高さ/半径 ≒ 1.14。旧版の118は平たすぎた)

import React from "react";
import { KRP } from "./KarakuriScenes";

// 焼き色のパレット (KRP に無い中間色。輪郭はすべて KRP.ink)
const HP = {
  crust: "#F2D479",      // 側面のたまご色
  crustDeep: "#E5BC48",  // 天面のほんのり濃い山吹
  crustBase: "#FAEEC2",  // 底(紙に接していた面)の淡い黄白
  crumb: "#D2A33C",      // 焼きむら (茶ではなく濃い黄)
  gloss: "#FDF6DC",      // つや
  custard: "#F7D964",    // カスタードクリーム
  custardLit: "#FEF3C4", // クリームのつや
  sponge: "#FEF8E6",     // 断面のカステラ生地 (焼けていない面なので、外皮よりずっと白い)
  paper: "#FBF5E6",      // 敷き紙
} as const;

// 菓子のシルエット (底は接地で短い直線、上はふっくら丸い饅頭型)
const DOME = "M -150 -6 C -152 -84 -116 -160 0 -160 C 116 -160 152 -84 150 -6 Q 150 0 140 0 L -140 0 Q -150 0 -150 -6 Z";

// 紙の受け皿 (ひだ付きのグラシン紙)
const PaperCup: React.FC = () => (
  <g>
    <ellipse cx={0} cy={2} rx={172} ry={30} fill={HP.paper} stroke={KRP.ink} strokeWidth={5} />
    {[-150, -112, -74, -36, 36, 74, 112, 150].map((px, i) => (
      <line key={i} x1={px * 0.78} y1={2 - Math.sqrt(Math.max(0, 1 - (px * 0.78 / 172) ** 2)) * 30}
        x2={px} y2={2} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
    ))}
  </g>
);

// 丸ごと1個
export const HagiNoTsuki: React.FC = () => (
  <g>
    <PaperCup />
    {/* 本体 (側面のたまご色) */}
    <path d={DOME} fill={HP.crust} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 天面だけ、ほんのり濃い山吹 (ふちはぼかさず面で入れる) */}
    <path d="M -126 -74 C -126 -130 -84 -157 0 -157 C 84 -157 126 -130 126 -74 C 84 -102 -84 -102 -126 -74 Z"
      fill={HP.crustDeep} opacity={0.6} />
    {/* 焼きむら (薄く) */}
    <ellipse cx={-54} cy={-120} rx={30} ry={13} fill={HP.crumb} opacity={0.16} transform="rotate(-14 -54 -120)" />
    <ellipse cx={42} cy={-130} rx={22} ry={10} fill={HP.crumb} opacity={0.14} transform="rotate(10 42 -130)" />
    <ellipse cx={94} cy={-88} rx={18} ry={9} fill={HP.crumb} opacity={0.12} transform="rotate(32 94 -88)" />
    {/* 腰から下はクリーム色に抜ける */}
    <path d="M -149 -4 Q 0 -74 149 -4 Q 0 -44 -149 -4 Z" fill={HP.crustBase} opacity={0.85} />
    {/* 底ぎわ (紙に接していた、いちばん白い面) */}
    <path d="M -148 -2 Q 0 -34 148 -2 Q 0 0 -148 -2 Z" fill={HP.crustBase} />
    {/* つや */}
    <path d="M -96 -104 Q -70 -140 -20 -150" fill="none" stroke={HP.gloss} strokeWidth={13}
      strokeLinecap="round" opacity={0.72} />
    {/* 輪郭を描き直して線をはっきりさせる */}
    <path d={DOME} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

// 半分に切った断面 (カスタードが見える)
export const HagiNoTsukiCut: React.FC = () => (
  <g>
    <PaperCup />
    {/* 断面のカステラ生地 (焼けていない面なので、外皮より白っぽい) */}
    <path d={DOME} fill={HP.sponge} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 外皮だけが たまご色。断面の輪郭に沿って帯で入れる */}
    <path d="M -147 -16 C -149 -86 -114 -154 0 -154 C 114 -154 149 -86 147 -16"
      fill="none" stroke={HP.crust} strokeWidth={17} strokeLinecap="round" />
    <path d="M -110 -130 C -74 -152 74 -152 110 -130"
      fill="none" stroke={HP.crustDeep} strokeWidth={13} opacity={0.55} strokeLinecap="round" />
    {/* カスタードクリーム: 生地に全周くるまれているので、中央に寄せた楕円にする */}
    <path d="M -104 -40 C -104 -116 -70 -132 0 -132 C 70 -132 104 -116 104 -40 C 70 -22 -70 -22 -104 -40 Z"
      fill={HP.custard} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {/* クリームのつや */}
    <ellipse cx={-44} cy={-98} rx={28} ry={13} fill={HP.custardLit} opacity={0.75}
      transform="rotate(-16 -44 -98)" />
    <ellipse cx={46} cy={-76} rx={18} ry={8} fill={HP.custardLit} opacity={0.5}
      transform="rotate(8 46 -76)" />
    {/* 生地の気泡 (断面のきめ) */}
    {([[-128, -34], [-118, -82], [126, -30], [116, -86], [-34, -146], [54, -144], [0, -14], [-62, -12], [66, -12]] as [number, number][])
      .map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={4} fill={HP.crumb} opacity={0.25} />
      ))}
    {/* 輪郭を描き直す */}
    <path d={DOME} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
