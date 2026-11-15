// 「人類は、昔から飛ばして観ていた」: 文#126〜#136 (11文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1212〜1222。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  dusk: "#EEDFC6",       // #126 夕暮れの空
  duskSun: "#F2B36B",    // #126 低い夕日
  yakeSky: "#D8CCBA",    // #127 もやの空
  yakeGround: "#5C5143", // #127 焼け土
  yakeFar: "#6E6254",    // #127 遠景の焼けた町
  sumiKuro: "#4A4035",   // #127 炭化した梁
  haiiro: "#9A948A",     // #127 灰
  kabukiWall: "#EDE2CA", // #128 歌舞伎座の壁
  sekiAka: "#8E3A3C",    // #128/#129 客席の椅子の赤
  rokaYuka: "#7E5A50",   // #128 絨毯
  yoru: "#222B3E",       // #131 夜空
  yoruMachi: "#39435C",  // #131 夜のビル
  bulb: "#FFE9A6",       // #131 電飾の球
  gaitoDoro: "#262C3A",  // #131 夜の路面
  butaiYami: "#201B22",  // #132 せり上げの闇
  lobbyWall: "#E7DCC2",  // #133/#134 ロビーの壁紙
  goldDeep: "#B8933A",   // #133/#134 額縁の影の金
  metal: "#6E7680",      // 映写機の鉄
  screenBlue: "#EAF4F8", // #135 スクリーンの光
  asaSora: "#F2C9A0",    // #135 朝の空
  fukeKabe: "#E6D5B2",   // #136 映写室の壁
  kabukiAka: "#B8372E",  // #128/#130 舞台映えする濃い朱の着物
  kabukiKin: "#C08A32",  // #128/#130 帯と格子の金茶
  kumadori: "#C9352B",   // #130 隈取の朱
} as const;
void useCurrentFrame; void Stamp; void QMark; void XMark; void Arrow;
void SaiseiBar; void NenpyoEmaki; void Fuda3; void H;

// ===== このファイルの中だけの小道具 =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// --- #126: 退場していく弁当/徳利/音符 (脚つきで行進する) ---
const ExItem: React.FC<{ kind: 0 | 1 | 2; x: number; y: number; f: number; i: number; o: number }> =
  ({ kind, x, y, f, i, o }) => {
    const hop = -Math.abs(Math.sin(f / 4 + i * 1.1)) * 7;
    const sw = Math.sin(f / 4 + i * 1.1) * 5;
    return (
      <g transform={`translate(${x} ${y + hop})`} opacity={o}>
        <ellipse cx={0} cy={2 - hop} rx={26} ry={6} fill={KRP.ink} opacity={0.14} />
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
          <line x1={-8} y1={-13} x2={-8 - sw} y2={0} />
          <line x1={8} y1={-13} x2={8 + sw} y2={0} />
        </g>
        {kind === 0 && ( /* 弁当箱 */
          <g>
            <rect x={-26} y={-36} width={52} height={24} rx={4} fill={SGP.wood} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={-26} y1={-27} x2={26} y2={-27} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={12} cy={-40} r={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {kind === 1 && ( /* 徳利 */
          <g>
            <path d="M -14 -12 Q -18 -34 -8 -42 L -8 -52 Q -8 -58 0 -58 Q 8 -58 8 -52 L 8 -42 Q 18 -34 14 -12 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -8 -32 Q 0 -36 8 -32" fill="none" stroke={KRP.blueDeep} strokeWidth={3.5} />
          </g>
        )}
        {kind === 2 && ( /* 音符 */
          <g transform="translate(0 -18)">
            <ellipse cx={-6} cy={0} rx={10} ry={7.5} fill={KRP.ink} transform="rotate(-18 -6 0)" />
            <path d="M 3 -2 L 3 -34 Q 13 -32 17 -24" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

// --- #132/#135 で使い回す映写機 (レンズは左向き。リールが f で回る) ---
const EishaKi: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 三脚 */}
    <path d="M -42 0 L -14 -62 M 42 0 L 14 -62 M 0 0 L 0 -62"
      fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={-26} y1={-26} x2={26} y2={-26} stroke={KRP.ink} strokeWidth={5} />
    {/* 本体 */}
    <rect x={-66} y={-138} width={132} height={78} rx={10} fill={C.metal} stroke={KRP.ink} strokeWidth={6} />
    <line x1={-50} y1={-92} x2={44} y2={-92} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
    <circle cx={44} cy={-116} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
    {/* レンズ筒 (左へ) */}
    <rect x={-110} y={-124} width={48} height={34} rx={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={-112} cy={-107} r={13} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
    {/* リール2つ (回る) */}
    <g transform={`translate(-30 -196) rotate(${f * 6})`}>
      <circle r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <circle r={30} fill={KRP.ink} opacity={0.82} />
      {[0, 120, 240].map((a) => (
        <line key={a} x1={0} y1={0} x2={44 * Math.cos((a * Math.PI) / 180)} y2={44 * Math.sin((a * Math.PI) / 180)}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
      <circle r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
    <g transform={`translate(38 -200) rotate(${f * 8 + 40})`}>
      <circle r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <circle r={20} fill={KRP.ink} opacity={0.82} />
      {[0, 120, 240].map((a) => (
        <line key={a} x1={0} y1={0} x2={34 * Math.cos((a * Math.PI) / 180)} y2={34 * Math.sin((a * Math.PI) / 180)}
          stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      <circle r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
    {/* フィルムの垂れ */}
    <path d="M -30 -152 Q -10 -146 6 -150 M 38 -166 Q 20 -152 6 -150 L 6 -138"
      fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
  </g>
);

// ===================================================================
// 歌舞伎役者の扮装キット (#130)
// ★Person とまったく同じ変換をかけた入れ物。中は「頭の丸 (cx=0 cy=-228 r=64)」基準の
//   人物ローカル座標。f/phase/still/lean は人物と同じ値を渡すこと (座標のごまかし禁止)
// -------------------------------------------------------------------
const AtamaNo: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; children?: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// 袖の広い着物・帯・隈取・髷の高い鬘。pose="point" pointDir=1 (右腕を横へ伸ばす) の人物に重ねる。
// 伸ばした腕の手首は (153,-148)。袖は腕を覆い、手だけ上から描き直す
const KabukiIsho: React.FC<{ f: number; phase?: number }> = ({ f, phase = 0 }) => {
  const sw = Math.sin((f + phase * 17) / 11) * 1.8; // 袖のそよぎ
  return (
    <g>
      {/* 着物の身 (裾が広がる) */}
      <path d="M -64 -166 L 64 -166 L 76 -96 Q 100 -56 104 -14 L -104 -14 Q -100 -56 -76 -96 Z"
        fill={C.kabukiAka} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 大きな格子の模様 (ひとつだけ) */}
      <g stroke={C.kabukiKin} strokeWidth={7} opacity={0.85} fill="none">
        <path d="M -34 -164 Q -40 -90 -52 -18 M 34 -164 Q 40 -90 52 -18" />
        <path d="M -70 -128 Q 0 -138 70 -128 M -88 -62 Q 0 -74 88 -62" />
      </g>
      {/* 白い襟 */}
      <path d="M -34 -168 L 0 -128 L 34 -168 L 18 -172 L 0 -148 L -18 -172 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 帯 (金茶。結び目は右腰) */}
      <rect x={-68} y={-110} width={136} height={34} rx={6}
        fill={C.kabukiKin} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-58} y1={-94} x2={58} y2={-94} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
      <path d="M 54 -112 L 92 -124 L 100 -96 L 60 -82 Z"
        fill={C.kabukiKin} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 袖 (下げた左腕を包む大きな袖) */}
      <path d={`M -56 -166 Q -116 ${-148 + sw} -122 -62 Q -96 -42 -58 -54 Z`}
        fill={C.kabukiAka} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -112 -70 Q -92 -54 -62 -62" fill="none" stroke={C.kabukiKin} strokeWidth={6} />
      <circle cx={-72} cy={-48} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* 袖 (横へ伸ばした右腕を包む大きな袖) */}
      <path d={`M 56 -168 L 152 -162 Q 160 ${-88 + sw} 136 -66 Q 88 -58 60 -98 Z`}
        fill={C.kabukiAka} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 70 -92 Q 108 -70 134 -78" fill="none" stroke={C.kabukiKin} strokeWidth={6} />
      {/* 伸ばした手 (袖の上に描き直す) */}
      <circle cx={153} cy={-148} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 隈取 (朱の筋。怖い顔にはしない) */}
      <g fill="none" stroke={C.kumadori} strokeWidth={5} strokeLinecap="round">
        <path d="M -52 -246 Q -60 -210 -40 -186" />
        <path d="M 52 -246 Q 60 -210 40 -186" />
        <path d="M -42 -262 Q -26 -270 -10 -264" />
        <path d="M 42 -262 Q 26 -270 10 -264" />
      </g>
      {/* 鬘 (髷が高く結われた黒髪。前髪の生え際をはっきり) */}
      <path d="M -66 -232 Q -74 -304 0 -306 Q 74 -304 66 -232 Q 34 -252 0 -252 Q -34 -252 -66 -232 Z"
        fill={KRP.ink} />
      <path d="M -58 -238 Q 0 -258 58 -238" fill="none" stroke="#6A6472" strokeWidth={4} opacity={0.8} />
      <path d="M -70 -238 Q -78 -220 -70 -200 L -58 -214 Z" fill={KRP.ink} />
      <path d="M 70 -238 Q 78 -220 70 -200 L 58 -214 Z" fill={KRP.ink} />
      {/* 髷。舞台の上の赤い水引幕 (y=270) に食い込まない高さに収める */}
      <rect x={-13} y={-296} width={26} height={28} rx={8} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-292 + sw * 0.6} rx={44} ry={14}
        fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -38 -298 Q 0 -306 38 -298" fill="none" stroke="#6A6472" strokeWidth={4} opacity={0.7} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #126 弁当と、酒と、おしゃべりが、劇場から順番に退場していきます。
// 格: 山 / seed 1212
// 絵: **`Danmen` 状態C。リキャップ③**。日本側のランプも消え、残りは1灯。弁当・徳利・音符が一列になって退場口から出ていく行列
// どこ: 夕暮れの空の下に劇場の断面図 (リキャップ③の定点)
// 演出: Danmen 状態C (残り1灯)。弁当・徳利・音符が脚を生やして一列で退場口へ行進
// 動き: 行列が右の戸口へ歩き続けて消える。断面図が描き上がる。札「ふりかえり③」
const Sg126: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 0, 12);
  return (
    <Frame f={f} seed={1212}>
      {/* 夕暮れの背景 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.dusk} />
      <circle cx={262} cy={208} r={92} fill={C.duskSun} opacity={0.35} />
      <circle cx={262} cy={208} r={56} fill={C.duskSun} opacity={0.7} />
      {/* ちぎれ雲 2つ (ゆっくり流れる) */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${(i === 0 ? 1180 : 620) + Math.sin(f / 60 + i * 2) * 30 + f * 0.3} ${i === 0 ? 120 : 176})`}
          opacity={0.85}>
          <path d="M -110 18 q 10 -38 52 -32 q 12 -34 62 -28 q 34 -20 56 10 q 40 -6 42 28 q 20 6 14 22 l -226 0 z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      ))}
      {/* 渡り鳥 */}
      <g stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.7}>
        <path d={`M ${1500 - f * 1.6} ${150 + Math.sin(f / 14) * 6} q 11 -10 22 0 q 11 -10 22 0`} />
        <path d={`M ${1420 - f * 1.4} ${188 + Math.sin(f / 12 + 2) * 6} q 9 -8 18 0 q 9 -8 18 0`} />
      </g>
      {/* 地面 (建物の足元の土) */}
      <rect x={-20} y={816} width={W + 40} height={290} fill={KRP.floor} />
      <line x1={-20} y1={816} x2={W + 20} y2={816} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.25} strokeLinecap="round">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={80 + rnd(1, i) * 1760} y1={856 + rnd(2, i) * 180}
            x2={80 + rnd(1, i) * 1760 + 46} y2={856 + rnd(2, i) * 180} />
        ))}
      </g>
      {/* 劇場の断面図 (状態C: 日本側も消えて残り1灯) */}
      <Danmen f={f} state="C" x={960} y={540} s={0.92} t={t} />
      {/* 退場の行列 (建物の手前を右の戸口へ。戸口の先で消える) */}
      {Array.from({ length: 7 }, (_, i) => {
        const span = 660;
        const xr = (i * 96 + f * 5.2) % span;
        const fadeIn = clamp01(xr / 70);
        const fadeOut = 1 - clamp01((xr - (span - 90)) / 90);
        return (
          <ExItem key={i} kind={(i % 3) as 0 | 1 | 2} x={1100 + xr}
            y={lerp(788, 802, xr / span)} f={f} i={i} o={Math.min(fadeIn, fadeOut) * t} />
        );
      })}
      <TagPlate x={1560} y={132} text="ふりかえり③" size={40} t={seg(f, 6, 18)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #127 ちなみに、生き残りもあります。
// 格: 図 / seed 1213
// 絵: 余談札「ちなみに」。焼け野原の隅に光が差し、草がひと群れ生き残っている
// どこ: 震災のあとの焼け野原 (引き。直接の被害描写はしない)
// 演出: 焼け野原の引きから、シーン全体をかけてカメラが草へ寄っていく (z 1 → 3.2)。
//       寄った先で草が主役として耐えるよう、草だけは寄ったときの見え方で線の太さを決めてある
//       (背景の輪郭は non-scaling-stroke で太らせない)
// 動き: カメラがゆっくり草へ寄る / 草が伸びて揺れる / 朝露がきらめく / 煙と灰が漂う
const SG127_LEN = 84; // このシーンの実際のコマ数 (scenes-data.json の durationSec から)
const easeInOut127 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// 生き残った草のひと群れ。原点 = 根元。線は寄ったとき (約3倍) に 6〜8px になる太さで描く
const IkinokoriKusa: React.FC<{ f: number }> = ({ f }) => {
  const grow = (a: number, b: number) => 0.25 + 0.75 * easeOut(seg(f, a, b));
  const ink = KRP.ink;
  const sw = 2.2;
  // 細長い葉 (根元 0,0 から上へ)。bend で先が左右へしなる
  const blade = (i: number, dx: number, h: number, bend: number, w: number, fill: string, g: number, drop?: number) => {
    const sway = Math.sin(f / 13 + i * 1.3) * 3;
    return (
      <g key={i} transform={`translate(${dx} 0) rotate(${sway}) scale(${g})`}>
        <path d={`M ${-w / 2} 0 Q ${bend * 0.35 - w * 0.6} ${-h * 0.55} ${bend} ${-h} Q ${bend * 0.35 + w * 0.6} ${-h * 0.55} ${w / 2} 0 Z`}
          fill={fill} stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M 0 -2 Q ${bend * 0.3} ${-h * 0.5} ${bend * 0.92} ${-h * 0.94}`}
          fill="none" stroke="#3E7A44" strokeWidth={1.1} opacity={0.7} />
        {drop !== undefined && dewAt(bend * 0.62, -h * 0.66, drop)}
      </g>
    );
  };
  // 朝露 (きらめき付き)。葉の中に置いて葉と一緒に揺らす
  const dewO = seg(f, 16, 28);
  const dewAt = (x: number, y: number, i: number) => (dewO > 0 ? <g opacity={dewO}>{dew(x, y, 3.4, i)}</g> : null);
  const dew = (x: number, y: number, r: number, i: number) => {
    const tw = 0.5 + 0.5 * Math.sin(f / 5 + i * 2.1);
    return (
      <g key={`d${i}`} transform={`translate(${x} ${y})`}>
        <circle r={r} fill="#DDF0F4" opacity={0.85} stroke={ink} strokeWidth={1.1} />
        <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.32} fill={KRP.white} />
        <circle r={r * 1.9} fill={KRP.white} opacity={0.18 * tw} />
      </g>
    );
  };
  return (
    <g>
      {/* 根元の土の盛り上がり・炭のかけら・小石 */}
      <ellipse cx={0} cy={4} rx={70} ry={14} fill="#3A3128" stroke={ink} strokeWidth={1.6} />
      <path d="M -50 2 Q -20 -8 6 -2 Q 30 -9 54 2" fill="none" stroke="#6E604E" strokeWidth={1.6} opacity={0.8} />
      <path d="M -28 10 l 10 -4 l 6 6 M 22 12 l 8 -5 l 9 3" fill="none" stroke={ink} strokeWidth={1.2} opacity={0.6} />
      {[[-56, 2, 7, "#9A948A"], [-38, 12, 5, "#B5AC9C"], [40, 8, 8, "#8A8378"], [60, 0, 5, "#B5AC9C"], [-12, 14, 4, "#9A948A"], [20, 15, 5, C.sumiKuro]].map(([px, py, pr, col], i) => (
        <path key={i}
          d={`M ${(px as number) - (pr as number)} ${py} Q ${(px as number) - (pr as number)} ${(py as number) - (pr as number) * 0.9} ${px} ${(py as number) - (pr as number)} Q ${(px as number) + (pr as number) * 1.1} ${(py as number) - (pr as number) * 0.8} ${(px as number) + (pr as number)} ${py} Q ${px} ${(py as number) + (pr as number) * 0.5} ${(px as number) - (pr as number)} ${py} Z`}
          fill={col as string} stroke={ink} strokeWidth={1.3} />
      ))}
      {/* 奥の葉 (濃い緑) */}
      {blade(0, -16, 100, -62, 14, "#5E9A5A", grow(2, 18))}
      {blade(1, 14, 108, 66, 13, "#5E9A5A", grow(4, 20), 1)}
      {blade(2, -30, 70, -48, 11, "#6FAE66", grow(6, 22))}
      {/* 真ん中: 細い茎と双葉 */}
      <g transform={`rotate(${Math.sin(f / 11) * 2.5}) scale(${grow(3, 20)})`}>
        <path d="M 0 0 C 2 -30 -4 -62 1 -96" fill="none" stroke="#4E8A4A" strokeWidth={4.2} strokeLinecap="round" />
        <path d="M 0 0 C 2 -30 -4 -62 1 -96" fill="none" stroke={KRP.green} strokeWidth={2.2} strokeLinecap="round" />
        <g transform={`translate(0 -92) rotate(${-24 + Math.sin(f / 9) * 4})`}>
          <path d="M 0 0 Q -14 -26 -44 -26 Q -50 -6 -30 4 Q -14 8 0 0 Z" fill={KRP.green} stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M -2 -2 Q -20 -12 -38 -16" fill="none" stroke="#3E7A44" strokeWidth={1.2} />
          {dewAt(-28, -8, 0)}
        </g>
        <g transform={`translate(1 -94) rotate(${20 + Math.sin(f / 9 + 1) * 4})`}>
          <path d="M 0 0 Q 14 -28 46 -24 Q 50 -4 30 6 Q 14 8 0 0 Z" fill="#8FCB84" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M 2 -2 Q 20 -12 40 -14" fill="none" stroke="#3E7A44" strokeWidth={1.2} />
        </g>
      </g>
      {/* 手前の葉 (明るい緑) */}
      {blade(3, 26, 82, 52, 12, "#7FBF7A", grow(8, 24), 3)}
      {blade(4, -6, 58, -18, 10, "#8FCB84", grow(10, 26))}
      {blade(5, 38, 50, 64, 9, "#6FAE66", grow(12, 28))}
    </g>
  );
};

const Sg127: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut127(clamp01(f / SG127_LEN));
  const z = 1 + e * 2.2;
  const P = { x: 1282, y: 788 };                      // 草の根元 (世界座標)
  const S = { x: lerp(P.x, 960, e), y: lerp(P.y, 740, e) }; // 草の根元が画面のどこに来るか
  const cam = `translate(${S.x - z * P.x} ${S.y - z * P.y}) scale(${z})`;
  const ns = "non-scaling-stroke" as const;
  return (
    <Frame f={f} seed={1213}>
      <defs>
        <linearGradient id="sg127near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4E4438" stopOpacity={0} />
          <stop offset="0.35" stopColor="#4E4438" stopOpacity={0.85} />
          <stop offset="1" stopColor="#4E4438" stopOpacity={1} />
        </linearGradient>
        <radialGradient id="sg127glow">
          <stop offset="0" stopColor={KRP.yellow} stopOpacity={0.32} />
          <stop offset="0.6" stopColor={KRP.yellow} stopOpacity={0.12} />
          <stop offset="1" stopColor={KRP.yellow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam}>
        {/* もやの空とにじんだ太陽 */}
        <rect x={-20} y={-20} width={W + 40} height={560} fill={C.yakeSky} />
        <circle cx={1480} cy={210} r={74} fill="#E8D9B0" opacity={0.75} />
        <circle cx={1480} cy={210} r={110} fill="#E8D9B0" opacity={0.3} />
        {/* 遠景: 焼け残った低い町 (凸凹の影) */}
        <g opacity={0.5}>
          {Array.from({ length: 22 }, (_, i) => {
            const w = 50 + rnd(3, i) * 70;
            const h = 16 + rnd(4, i) * 56;
            return <rect key={i} x={(i / 22) * (W + 160) - 80} y={520 - h} width={w} height={h}
              fill={C.yakeFar} stroke={KRP.ink} strokeWidth={3} vectorEffect={ns} />;
          })}
        </g>
        {/* 傾いた焼け柱 2本 (遠景) */}
        <line x1={420} y1={524} x2={452} y2={386} stroke={C.sumiKuro} strokeWidth={10} strokeLinecap="round" />
        <line x1={1140} y1={524} x2={1104} y2={410} stroke={C.sumiKuro} strokeWidth={9} strokeLinecap="round" />
        {/* 立ちのぼる細い煙 3すじ */}
        {[300, 860, 1620].map((sx, i) => (
          <path key={sx}
            d={`M ${sx} 520 C ${sx + 14 + Math.sin(f / 26 + i) * 10} 440 ${sx - 12 + Math.sin(f / 31 + i * 2) * 10} 340 ${sx + 10} 220`}
            fill="none" stroke={KRP.grayDark} strokeWidth={5} opacity={0.3} strokeLinecap="round" />
        ))}
        {/* 地面 (焼け土) */}
        <rect x={-20} y={520} width={W + 40} height={580} fill={C.yakeGround} />
        <line x1={-20} y1={520} x2={W + 20} y2={520} stroke={KRP.ink} strokeWidth={5} opacity={0.6} vectorEffect={ns} />
        <rect x={-20} y={760} width={W + 40} height={340} fill="url(#sg127near)" />
        {/* 地面の細かな凹凸 (寄ったときの土の手触り) */}
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx={1040 + rnd(21, i) * 520} cy={700 + rnd(22, i) * 190} rx={6 + rnd(23, i) * 14} ry={2 + rnd(24, i) * 3}
            fill={i % 3 === 0 ? "#6E604E" : "#3E352C"} opacity={0.55} />
        ))}
        {/* 灰の山と炭の梁 */}
        {[[260, 660, 130], [700, 740, 170], [1560, 640, 110]].map(([ax, ay, ar], i) => (
          <g key={i}>
            <ellipse cx={ax} cy={ay} rx={ar} ry={ar * 0.3} fill={C.haiiro} stroke={KRP.ink} strokeWidth={4} opacity={0.85} vectorEffect={ns} />
            <ellipse cx={ax - ar * 0.3} cy={ay - ar * 0.14} rx={ar * 0.4} ry={ar * 0.12} fill={KRP.white} opacity={0.2} />
          </g>
        ))}
        <g stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
          <rect x={330} y={690} width={300} height={30} rx={6} fill={C.sumiKuro} transform="rotate(-8 480 705)" vectorEffect={ns} />
          <rect x={470} y={746} width={230} height={26} rx={6} fill={C.sumiKuro} transform="rotate(5 585 760)" vectorEffect={ns} />
          <rect x={1370} y={700} width={280} height={28} rx={6} fill={C.sumiKuro} transform="rotate(7 1510 714)" vectorEffect={ns} />
          <rect x={940} y={850} width={250} height={28} rx={6} fill={C.sumiKuro} transform="rotate(-4 1065 864)" vectorEffect={ns} />
        </g>
        {/* 漂う灰 */}
        {Array.from({ length: 9 }, (_, i) => {
          const yy = ((rnd(6, i) * 700 - f * (0.5 + rnd(7, i))) % 700 + 700) % 700;
          return <circle key={i} cx={120 + rnd(5, i) * 1680 + Math.sin(f / 30 + i) * 16}
            cy={200 + yy * 0.9} r={2.5 + rnd(8, i) * 2.5} fill={C.haiiro} opacity={0.5} />;
        })}
        {/* 右手前へ差す光 */}
        <polygon points="1540,-40 1900,-40 1330,1100 970,1100" fill="#FFF6D8" opacity={0.14} />
        {/* 生き残った草 (主役) */}
        <g transform={`translate(${P.x} ${P.y})`}>
          <circle cx={0} cy={-50} r={150 * (0.9 + 0.1 * Math.sin(f / 9))} fill="url(#sg127glow)" />
          <IkinokoriKusa f={f} />
          {/* きらめき */}
          {[[-86, -120], [84, -96], [-20, -150]].map(([kx, ky], i) => {
            const tw = clamp01(seg(f, 20, 36) * 3 - i) * (0.6 + 0.4 * Math.sin(f / 5 + i * 2));
            return (
              <g key={i} stroke={KRP.yellow} strokeWidth={2.4} strokeLinecap="round" opacity={tw}>
                <line x1={kx - 8} y1={ky} x2={kx + 8} y2={ky} />
                <line x1={kx} y1={ky - 8} x2={kx} y2={ky + 8} />
              </g>
            );
          })}
        </g>
      </g>
      <TagPlate x={292} y={236} text="ちなみに" size={42} rot={-5} t={seg(f, 2, 12)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #128 歌舞伎座にはいまも「一幕見席」という、好きな一幕だけを観られる席があります。
// 格: 並 / seed 1214
// 絵: 現代の歌舞伎座の一幕見席。切符「一幕」。身軽な客がすっと座る
// どこ: 現代の歌舞伎座・4階の一幕見席 (左下の吹き抜けの先に舞台が小さく光る)
// 演出: 戸口の標識「一幕見席」。大きな切符「一幕」。身軽な客が入ってきて前列にすっと座る
// 動き: 客が歩いて座る (pop)。舞台あかりが揺れ、切符がふわり浮く
const MakumiIsu: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-54} y={-150} width={108} height={100} rx={14} fill={C.sekiAka} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -40 -138 Q 0 -146 40 -138" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
    <rect x={-60} y={-62} width={120} height={34} rx={10} fill="#A8544F" stroke={KRP.ink} strokeWidth={5} />
    <rect x={-66} y={-92} width={14} height={60} rx={7} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={52} y={-92} width={14} height={60} rx={7} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <line x1={-44} y1={-28} x2={-44} y2={0} stroke={KRP.ink} strokeWidth={5} />
    <line x1={44} y1={-28} x2={44} y2={0} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const Sg128: React.FC<{ f: number }> = ({ f }) => {
  const walkT = easeOut(seg(f, 4, 24));
  const sitT = pop(seg(f, 26, 34));
  const px = lerp(1620, 1240, walkT);
  const glow = 0.8 + 0.2 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={1214}>
      {/* 壁と欄間の朱帯 */}
      <rect x={-20} y={-20} width={W + 40} height={700} fill={C.kabukiWall} />
      <rect x={-20} y={96} width={W + 40} height={44} fill={SGP.curtain} opacity={0.9} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={60 + i * 160} y={110} width={16} height={16} fill={KRP.white}
          transform={`rotate(45 ${68 + i * 160} 118)`} opacity={0.8} />
      ))}
      {/* 天井のダウンライト */}
      {[260, 1000, 1430].map((lx) => (
        <g key={lx}>
          <rect x={lx - 20} y={140} width={40} height={14} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points={`${lx - 16},154 ${lx + 16},154 ${lx + 68},560 ${lx - 68},560`} fill={KRP.yellow} opacity={0.08} />
        </g>
      ))}
      {/* 提灯ひとつ */}
      <g transform={`translate(830 190) rotate(${Math.sin(f / 11) * 2})`}>
        <line x1={0} y1={-56} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={0} cy={6} rx={34} ry={42} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -32 -8 Q 0 -14 32 -8 M -34 8 Q 0 2 34 8 M -30 24 Q 0 18 30 24" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} />
        <rect x={-14} y={-36} width={28} height={10} fill={KRP.ink} />
        <rect x={-14} y={42} width={28} height={9} fill={KRP.ink} />
      </g>
      {/* 左下: 吹き抜けの先の舞台 (4階から見下ろす遠さ) */}
      <rect x={-20} y={560} width={680} height={540} fill="#3A3230" />
      <g opacity={glow}>
        <rect x={60} y={760} width={480} height={250} fill="#F4E2B4" stroke={KRP.ink} strokeWidth={5} />
        <rect x={60} y={760} width={480} height={26} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={4} />
        <rect x={60} y={960} width={480} height={22} fill={SGP.stage} stroke={KRP.ink} strokeWidth={4} />
        {/* 豆粒の役者 (見得)。4階からの遠さなので朱の着物と髷だけで役者に見せる */}
        <g transform={`translate(300 952) rotate(${Math.sin(f / 10) * 2})`} stroke={KRP.ink} strokeWidth={4}>
          <path d="M -19 0 L -10 -36 L 10 -36 L 19 0 Z" fill={C.kabukiAka} />
          <path d="M -10 -32 L -29 -16 L -21 -8 L -7 -20 Z" fill={C.kabukiAka} />
          <line x1={-14} y1={-20} x2={-16} y2={0} strokeWidth={3} stroke={C.kabukiKin} />
          <line x1={6} y1={-30} x2={9} y2={0} strokeWidth={3} stroke={C.kabukiKin} />
          {/* 広げた袖 (見得)。黒い棒に見えないよう朱で塗る */}
          <path d="M -8 -34 L -31 -51 L -25 -59 L -3 -43 Z" fill={C.kabukiAka} strokeWidth={3} />
          <circle cx={-30} cy={-56} r={4} fill={KRP.white} strokeWidth={2.5} />
          <circle cx={0} cy={-45} r={8} fill={KRP.white} />
          <path d="M -8 -49 Q 0 -56 8 -49 Z" fill={KRP.ink} strokeWidth={2.5} />
          {/* 髷 (頭の後ろへ小さく) */}
          <ellipse cx={1} cy={-57} rx={5.5} ry={3} fill={KRP.ink} strokeWidth={2.5} />
        </g>
        <circle cx={300} cy={900} r={90} fill={KRP.yellow} opacity={0.14} />
      </g>
      {/* 階下の客席の頭 (点々) */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={80 + rnd(9, i) * 440} cy={1020 + rnd(10, i) * 56} r={9}
          fill="#5C524A" stroke={KRP.ink} strokeWidth={2.5} />
      ))}
      {/* 手すり */}
      <g>
        {[40, 170, 300, 430, 560].map((bx) => (
          <rect key={bx} x={bx} y={600} width={16} height={120} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <rect x={-20} y={580} width={680} height={28} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-20} y={708} width={680} height={18} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 一幕見席の床 */}
      <rect x={600} y={640} width={1340} height={460} fill={C.rokaYuka} />
      <line x1={600} y1={640} x2={1940} y2={640} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.22}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={700 + i * 420} y1={1100} x2={880 + i * 360} y2={640} />
        ))}
      </g>
      {/* 戸口と標識 */}
      <g>
        <rect x={1620} y={380} width={200} height={380} fill="#55443C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1602} y={362} width={236} height={20} rx={6} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1600} y={380} width={18} height={380} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1822} y={380} width={18} height={380} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1660} y1={420} x2={1660} y2={740} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        <rect x={1596} y={292} width={248} height={58} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={1720} y={333} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={1.5} paintOrder="stroke" letterSpacing={3}>一幕見席</text>
      </g>
      {/* 後列の椅子 */}
      {[760, 1000, 1240, 1480].map((cx) => <MakumiIsu key={cx} x={cx} y={716} s={0.82} />)}
      {/* 身軽な客 (歩いてきて前列にすっと) */}
      <ellipse cx={px} cy={800 + sitT * 14} rx={64} ry={14} fill={KRP.ink} opacity={0.16} />
      <Person x={px} y={796 + sitT * 16} s={0.98 - sitT * 0.04} cloth="#4A6B6E" clothDark="#35514F"
        face="smile" gaze={[-0.5, 0.2]} f={f} pose={walkT < 1 ? "run" : "stand"} hair="cap" />
      {/* 前列の椅子 (客の脚を隠して「座った」に見せる) */}
      {[880, 1240, 1600].map((cx) => <MakumiIsu key={cx} x={cx} y={828} s={0.95} />)}
      {/* 大きな切符「一幕」 */}
      <g transform={`translate(520 ${316 + Math.sin(f / 10) * 5}) rotate(-6) scale(${pop(seg(f, 14, 26))})`}>
        <rect x={-160} y={-76} width={320} height={152} rx={10} fill={SGP.paper} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-146} y={-62} width={292} height={124} rx={6} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
        <line x1={88} y1={-76} x2={88} y2={76} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 9" />
        <text x={-32} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66}
          fill={KRP.ink} letterSpacing={6}>一幕</text>
        <circle cx={124} cy={0} r={13} fill={C.kabukiWall} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -140 -40 Q -120 -44 -104 -40" fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.7} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #129 江戸の「つまみ食い観劇」は、ここに小さく残りました。
// 格: 並 / seed 1215
// 絵: 一幕見席の座席の下に、1巻#43の江戸の木戸のミニ絵がほんのり灯る。時代を貫く小さな火
// どこ: #128の一幕見席に寄った足元 (薄暗い床と椅子の影。カメラは低く)
// 演出: 座席の下の暗がりに、江戸の芝居小屋の木戸のミニ絵が丸く灯る。時代を貫く小さな火
// 動き: メダリオンが pop でともり、光が脈打つ。火の粉がゆっくり昇る。札「江戸」
const Sg129: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 6, 18));
  const pulse = 0.78 + 0.22 * Math.sin(f / 8);
  return (
    <Frame f={f} seed={1215} bg="#3A3028" dark>
      {/* 薄暗い壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={660} fill="#46392F" />
      <rect x={-20} y={620} width={W + 40} height={480} fill="#55463A" />
      <line x1={-20} y1={620} x2={W + 20} y2={620} stroke={KRP.ink} strokeWidth={6} opacity={0.7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={lerp(240, -340, i / 3)} y1={1100} x2={lerp(700, 1130, i / 3)} y2={620} />
        ))}
      </g>
      {/* 左奥: 隣の椅子の影 (遠景) */}
      <g opacity={0.55}>
        <MakumiIsu x={250} y={610} s={0.62} />
        <MakumiIsu x={470} y={610} s={0.62} />
      </g>
      <polygon points="-20,620 660,620 520,1100 -20,1100" fill={KRP.ink} opacity={0.18} />
      {/* 主役の座席 (大写し。背もたれは画面上へ切れる) */}
      <g>
        <rect x={1660} y={-20} width={190} height={420} rx={18} fill={C.sekiAka} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 1690 20 Q 1755 14 1820 22" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        <rect x={880} y={280} width={940} height={110} rx={22} fill={C.sekiAka} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 920 316 Q 1340 300 1780 318" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        <rect x={880} y={372} width={940} height={26} rx={10} fill="#A8544F" stroke={KRP.ink} strokeWidth={6} />
        {/* 脚 */}
        <rect x={930} y={398} width={34} height={240} rx={8} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1700} y={398} width={34} height={240} rx={8} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <line x1={947} y1={560} x2={1717} y2={560} stroke={SGP.woodDark} strokeWidth={10} />
        <line x1={947} y1={560} x2={1717} y2={560} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        {/* 座席の下の影だまり */}
        <ellipse cx={1330} cy={636} rx={430} ry={42} fill={KRP.ink} opacity={0.28} />
      </g>
      {/* 座席の下にともる江戸のミニ絵 (メダリオン) */}
      <g transform={`translate(1330 580)`}>
        {/* 外側のにじむ光 */}
        <circle r={300 * pulse} fill={SGP.lampGold} opacity={0.1} />
        <circle r={230 * pulse} fill={SGP.lampGold} opacity={0.12} />
        <ellipse cx={0} cy={210} rx={360} ry={54} fill={SGP.lampGold} opacity={0.12 * pulse} />
        <g transform={`scale(${t})`}>
          <defs>
            <clipPath id="sg129md"><circle r={178} /></clipPath>
          </defs>
          <circle r={190} fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={7} />
          <g clipPath="url(#sg129md)">
            {/* 江戸の夜: 芝居小屋の木戸 */}
            <rect x={-180} y={-180} width={360} height={266} fill={SGP.nightInk} />
            <rect x={-180} y={86} width={360} height={100} fill="#4A4438" />
            <circle cx={110} cy={-110} r={26} fill={SGP.paper} opacity={0.85} />
            {/* 木戸: 柱2本+貫+半開きの戸と柵 */}
            <rect x={-104} y={-96} width={22} height={186} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
            <rect x={66} y={-96} width={22} height={186} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-116} y={-112} width={216} height={24} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-82} y={-66} width={74} height={156} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            {[-64, -46, -28].map((bx) => (
              <line key={bx} x1={bx} y1={-60} x2={bx} y2={84} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
            ))}
            {[-160, -138].map((bx) => (
              <rect key={bx} x={bx} y={-40} width={13} height={130} fill={SGP.wood} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
            {[104, 128, 152].map((bx) => (
              <rect key={bx} x={bx} y={-40} width={13} height={130} fill={SGP.wood} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
            {/* 軒提灯 */}
            <g transform={`translate(26 -72) rotate(${Math.sin(f / 9) * 3})`}>
              <line x1={0} y1={-18} x2={0} y2={-6} stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={0} cy={12} rx={15} ry={19} fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3.5} />
              <path d="M -13 4 Q 0 1 13 4 M -13 18 Q 0 15 13 18" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.6} />
            </g>
            {/* 戸のすき間へするりと入る客 */}
            <g transform={`translate(${14 - seg(f, 10, 40) * 40} 86)`}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round">
              <path d="M -7 0 L 7 0 L 12 30 L 4 30 L 0 10 L -5 30 L -13 30 Z" transform="translate(0 -30)" />
              <circle cx={0} cy={-40} r={9} />
              <circle cx={-3} cy={-41} r={1.6} fill={KRP.ink} stroke="none" />
            </g>
            {/* 地面の提灯あかり */}
            <ellipse cx={26} cy={92} rx={70} ry={16} fill={SGP.lampGold} opacity={0.3 * pulse} />
          </g>
          {/* 縁の金環 */}
          <circle r={190} fill="none" stroke={SGP.lampGold} strokeWidth={5} opacity={0.9} />
          <circle r={204} fill="none" stroke={SGP.lampGold} strokeWidth={3} opacity={0.5 * pulse} />
        </g>
      </g>
      {/* 立ちのぼる火の粉 */}
      {Array.from({ length: 6 }, (_, i) => {
        const yy = ((f * (1.1 + rnd(13, i)) + rnd(14, i) * 420) % 420);
        return <circle key={i} cx={1180 + rnd(15, i) * 320 + Math.sin(f / 16 + i * 2) * 20}
          cy={700 - yy} r={3 + rnd(16, i) * 3} fill={SGP.lampGold}
          opacity={0.75 * (1 - yy / 420) * t} />;
      })}
      <TagPlate x={430} y={330} text="江戸" size={36} t={seg(f, 20, 30)} fill={SGP.paperOld} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #130 こうして、日本の客席からも、明かりが消えました。
// 格: 山 / seed 1216
// 絵: 章結び。日本の劇場の客席灯がすっと落ち、舞台だけ明るい。手配書④演劇改良会に御用印
// どこ: 明治の劇場を客席のうしろから。左2/3=額縁舞台、右の壁に手配書④
// 演出: 章結び。客席ランプがすっと消えて客席が沈み、舞台だけ明るい。手配書④演劇改良会に御用印
// 動き: ランプの火が f で消える→暗がりが降りる→「御用」がドン
const Sg130: React.FC<{ f: number }> = ({ f }) => {
  const off = seg(f, 10, 22);        // ランプが消える
  const dim = easeOut(seg(f, 14, 28)); // 客席に降りる暗さ
  return (
    <Frame f={f} seed={1216} bg="#2A2420" dark>
      {/* 壁 (板張り) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#3E342C" />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.25}>
        {[1340, 1420, 1860].map((bx) => <line key={bx} x1={bx} y1={-20} x2={bx} y2={760} />)}
      </g>
      {/* 額縁舞台 (左2/3) */}
      <g>
        {/* 舞台の中の明かり */}
        <rect x={120} y={210} width={1090} height={450} fill="#F6E3B2" />
        <circle cx={620} cy={480} r={260} fill={KRP.yellow} opacity={0.22} />
        <rect x={120} y={210} width={1090} height={60} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 150 270 Q 190 330 160 400 M 1180 270 Q 1140 330 1172 400" fill="none" stroke={SGP.curtain} strokeWidth={26} strokeLinecap="round" />
        {/* 奥の書割り (松) */}
        <g opacity={0.5} stroke={KRP.ink} strokeWidth={4} fill={KRP.green}>
          <rect x={940} y={420} width={26} height={180} fill={SGP.woodDark} />
          <ellipse cx={952} cy={400} rx={110} ry={50} />
          <ellipse cx={1010} cy={330} rx={70} ry={34} />
        </g>
        {/* 舞台の床と前框 */}
        <rect x={100} y={620} width={1130} height={40} fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} />
        {[260, 420, 580, 740, 900, 1060].map((jx) => (
          <line key={jx} x1={jx} y1={624} x2={jx} y2={656} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        ))}
        <rect x={100} y={660} width={1130} height={70} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* プロセニアム */}
        <rect x={60} y={140} width={1170} height={56} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={60} y={140} width={56} height={590} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1174} y={140} width={56} height={590} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 130 196 Q 645 232 1160 196" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {[88, 1202].map((nx) => <circle key={nx} cx={nx} cy={168} r={4} fill={KRP.ink} />)}
        {/* 役者 (歌舞伎の扮装。袖の広い着物・隈取・高い髷。敬意をもってまっすぐ立つ) */}
        <ellipse cx={620} cy={628} rx={110} ry={22} fill={KRP.ink} opacity={0.18} />
        <Person x={620} y={622} s={1.12} cloth={C.kabukiAka} clothDark="#8E2A24" face="normal"
          gaze={[0, 0.3]} f={f} pose="point" pointDir={1} hair="cap" />
        <AtamaNo x={620} y={622} s={1.12} f={f}>
          <KabukiIsho f={f} />
        </AtamaNo>
        {/* フットライト */}
        {[300, 460, 620, 780, 940].map((fx, i) => (
          <g key={fx} transform={`translate(${fx} 660)`}>
            <path d="M -10 0 A 10 10 0 0 1 10 0 Z" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-9 + Math.sin(f / 6 + i) * 1.5} r={5} fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
      </g>
      {/* 客席ランプ 3灯 (火がすっと消える) */}
      {[320, 680, 1040].map((lx, i) => {
        const lampOff = clamp01(off * 3.2 - i);
        return (
          <g key={lx}>
            <line x1={lx} y1={-20} x2={lx} y2={78} stroke={KRP.ink} strokeWidth={4.5} />
            {lampOff < 1 && <circle cx={lx} cy={120} r={44} fill={SGP.lampGold} opacity={0.3 * (1 - lampOff)} />}
            <path d="M -24 24 L 24 24 L 13 6 L -13 6 Z" transform={`translate(${lx} 72)`}
              fill={lampOff >= 1 ? SGP.lampOff : SGP.wood} stroke={KRP.ink} strokeWidth={5} />
            {lampOff < 1 ? (
              <path d={`M 0 ${46 + Math.sin(f / 5 + i) * 2} C -8 38 -6 28 0 24 C 6 28 8 38 0 ${46 + Math.sin(f / 5 + i) * 2} Z`}
                transform={`translate(${lx} 72) scale(${1 - lampOff})`}
                fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3} />
            ) : (
              <path d={`M ${lx + 2} 88 C ${lx + 10 + Math.sin(f / 7 + i) * 4} 64 ${lx - 6 + Math.sin(f / 9 + i) * 4} 44 ${lx + 4} 20`}
                fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.7 * clamp01(2 - off * 1.2)} strokeLinecap="round" />
            )}
          </g>
        );
      })}
      {/* 客席 (こちらに背を向けた観客。暗がりに沈む) */}
      <rect x={-20} y={760} width={1360} height={340} fill="#2E2823" />
      <line x1={-20} y1={760} x2={1340} y2={760} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
      {Array.from({ length: 7 }, (_, i) => (
        <PersonMini key={i} x={120 + i * 190 + (rnd(17, i) - 0.5) * 36} y={918}
          s={0.6} color={["#4A4238", "#3E4248", "#514438"][i % 3]} f={f} phase={i} face="none" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <PersonMini key={i} x={210 + i * 200 + (rnd(18, i) - 0.5) * 36} y={1052}
          s={0.72} color={["#3E3A40", "#4E4034", "#44483E"][i % 3]} f={f} phase={i + 9} face="none" />
      ))}
      {/* 降りてくる暗さ (舞台は明るいまま) */}
      <rect x={-20} y={740} width={1360} height={360} fill={SGP.nightInk} opacity={0.5 * dim} />
      <rect x={-20} y={-20} width={1360} height={160} fill={SGP.nightInk} opacity={0.4 * dim} />
      {/* 右の壁の手配書④ 演劇改良会 → 御用 */}
      <Tehaisho f={f} who={4} x={1600} y={390} s={0.95} t={seg(f, 0, 8)} goyoT={seg(f, 26, 36)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #131 第7章、映画館の、意外な抵抗。
// 格: 山 / seed 1217
// 絵: 章扉。1930年代アメリカ。夜の街に映画館の電飾看板が煌々。並ぶ車、ポップコーンの香りの湯気
// どこ: 1930年代アメリカ・夜の大通り。中央左に映画館の電飾ファサード
// 演出: 章扉。CINEMAの縦看板とひさしの電球が煌々。並ぶ車・行列・ポップコーン屋台の湯気
// 動き: 電球がチカチカ追いかける。湯気が昇る。章の題字は右下 (絵と被らない)
const Sg131: React.FC<{ f: number }> = ({ f }) => {
  const chase = Math.floor(f / 5);
  return (
    <Frame f={f} seed={1217} bg={C.yoru} dark
      over={<ChapterDoor num={7} title="映画館の意外な抵抗" t={seg(f, 10, 22)} />}>
      {/* 夜空と星 */}
      <rect x={-20} y={-20} width={W + 40} height={880} fill={C.yoru} />
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={rnd(21, i) * 1960 - 20} cy={rnd(22, i) * 330}
          r={1.6 + rnd(23, i) * 2} fill={KRP.white}
          opacity={0.3 + 0.5 * Math.sin(f / 11 + i * 1.3)} />
      ))}
      {/* 両脇のビル (左は窓あかり・右は暗め) */}
      <g>
        <rect x={-20} y={170} width={360} height={690} fill={C.yoruMachi} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={30 + (i % 3) * 100} y={230 + Math.floor(i / 3) * 140} width={52} height={70}
            fill={rnd(24, i) < 0.6 ? C.bulb : "#2A3246"} stroke={KRP.ink} strokeWidth={3.5}
            opacity={0.9} />
        ))}
        <rect x={-20} y={150} width={370} height={26} fill={KRP.ink} opacity={0.6} />
        <rect x={1560} y={250} width={380} height={610} fill={C.yoruMachi} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={1610 + (i % 2) * 150} y={300 + Math.floor(i / 2) * 110} width={56} height={62}
            fill={rnd(25, i) < 0.3 ? C.bulb : "#2A3246"} stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
        ))}
      </g>
      {/* 映画館のファサード */}
      <g>
        <rect x={430} y={200} width={740} height={660} fill="#E9DBBE" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 470 240 Q 800 226 1130 240" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.35} />
        <rect x={430} y={200} width={740} height={34} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
        {/* 縦のCINEMA看板 (電球つき) */}
        <g transform="translate(508 160)">
          <rect x={-56} y={0} width={112} height={442} rx={10} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6.5} />
          {"CINEMA".split("").map((ch, i) => (
            <text key={i} x={0} y={58 + i * 60} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={50} fill={C.bulb} stroke={KRP.ink} strokeWidth={1.5} paintOrder="stroke">{ch}</text>
          ))}
          {Array.from({ length: 14 }, (_, i) => {
            const on = (i + chase) % 3 === 0;
            return <circle key={i} cx={i % 2 === 0 ? -46 : 46} cy={26 + Math.floor(i / 2) * 60}
              r={on ? 7 : 4.5} fill={on ? C.bulb : KRP.grayDark} />;
          })}
        </g>
        {/* ひさし (マーキー) と電球のチカチカ */}
        <g>
          <rect x={400} y={530} width={800} height={96} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={400} y={530} width={800} height={26} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={4.5} />
          {Array.from({ length: 22 }, (_, i) => {
            const on = (i + chase) % 3 === 0;
            return <circle key={i} cx={420 + i * 36.5} cy={612} r={on ? 8 : 5}
              fill={on ? C.bulb : KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />;
          })}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={430 + i * 185} cy={543} r={(i + chase) % 2 === 0 ? 7 : 4.5}
              fill={(i + chase) % 2 === 0 ? C.bulb : KRP.grayDark} />
          ))}
          <circle cx={800} cy={578} r={190} fill={C.bulb} opacity={0.1 + 0.03 * Math.sin(f / 4)} />
        </g>
        {/* 入口 (3枚扉+切符売場) */}
        {[600, 760, 980].map((dx) => (
          <g key={dx}>
            <rect x={dx} y={660} width={120} height={200} fill="#8A5A30" stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={dx + 14} y={680} width={92} height={90} fill={C.bulb} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
            <line x1={dx + 60} y1={660} x2={dx + 60} y2={860} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <g>
          <rect x={860} y={690} width={90} height={170} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={874} y={708} width={62} height={56} fill={C.bulb} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 874 790 L 936 790" stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 路面 */}
      <rect x={-20} y={856} width={W + 40} height={260} fill={C.gaitoDoro} />
      <line x1={-20} y1={856} x2={W + 20} y2={856} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
      <polygon points="560,860 1180,860 1330,1100 420,1100" fill={C.bulb} opacity={0.1} />
      <g stroke={C.bulb} strokeWidth={6} opacity={0.35} strokeLinecap="round">
        <line x1={700} y1={920} x2={690} y2={1010} />
        <line x1={900} y1={930} x2={905} y2={1040} />
        <line x1={1080} y1={920} x2={1095} y2={1000} />
      </g>
      {/* 開場を待つ行列 */}
      {Array.from({ length: 5 }, (_, i) => (
        <PersonMini key={i} x={1250 + i * 86} y={880 + i * 4} s={0.5}
          color={["#6E5A4A", "#4A5A6E", "#5E4A5E", "#566048", "#6E4A42"][i]}
          f={f} phase={i} face="dot" />
      ))}
      {/* 駐まる車 (1930年代の丸いやつ) */}
      <g transform="translate(260 980)">
        <ellipse cx={0} cy={8} rx={160} ry={18} fill={KRP.ink} opacity={0.35} />
        <path d="M -160 0 L -160 -36 Q -158 -58 -126 -60 L -74 -62 Q -56 -100 -12 -102 L 50 -102 Q 88 -100 96 -64 L 134 -58 Q 160 -52 160 -30 L 160 0 Z"
          fill="#6E3A3A" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -60 -64 Q -46 -92 -10 -94 L 42 -94 Q 74 -92 82 -66 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={12} y1={-94} x2={12} y2={-64} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-96} cy={0} r={32} fill={KRP.ink} />
        <circle cx={-96} cy={0} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={96} cy={0} r={32} fill={KRP.ink} />
        <circle cx={96} cy={0} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={152} cy={-42} r={9} fill={C.bulb} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <g transform="translate(1700 1020) scale(0.92)">
        <ellipse cx={0} cy={8} rx={160} ry={18} fill={KRP.ink} opacity={0.35} />
        <path d="M -160 0 L -160 -36 Q -158 -58 -126 -60 L -74 -62 Q -56 -100 -12 -102 L 50 -102 Q 88 -100 96 -64 L 134 -58 Q 160 -52 160 -30 L 160 0 Z"
          fill="#3A4A5E" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -60 -64 Q -46 -92 -10 -94 L 42 -94 Q 74 -92 82 -66 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={-96} cy={0} r={32} fill={KRP.ink} />
        <circle cx={-96} cy={0} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={96} cy={0} r={32} fill={KRP.ink} />
        <circle cx={96} cy={0} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* ポップコーン屋台 (湯気が香る) */}
      <g transform="translate(460 992)">
        <circle cx={-62} cy={0} r={26} fill={KRP.ink} />
        <circle cx={-62} cy={0} r={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={62} cy={0} r={26} fill={KRP.ink} />
        <circle cx={62} cy={0} r={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-100} y={-120} width={200} height={100} rx={8} fill="#8A3A3A" stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-84} y={-196} width={168} height={80} rx={6} fill={C.bulb} opacity={0.9} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={-66 + (i % 4) * 44} cy={-160 + Math.floor(i / 4) * 26 + Math.sin(f / 7 + i) * 2}
            r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
        {/* 縞のひさし */}
        <g transform="translate(0 -212)">
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${-96 + i * 32} 0 L ${-80 + i * 32} -26 L ${-64 + i * 32} -26 L ${-64 + i * 32} 0 Z`}
              fill={i % 2 === 0 ? SGP.curtain : KRP.white} stroke={KRP.ink} strokeWidth={3} />
          ))}
          <line x1={-96} y1={0} x2={96} y2={0} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 湯気 */}
        {[0, 1].map((i) => (
          <path key={i}
            d={`M ${-20 + i * 46} -200 C ${-34 + i * 46 + Math.sin(f / 9 + i * 2) * 8} -236 ${-6 + i * 46 + Math.sin(f / 11 + i) * 8} -262 ${-16 + i * 46} -300`}
            fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round"
            opacity={0.5 + 0.2 * Math.sin(f / 8 + i * 3)} />
        ))}
        <PersonMini x={-150} y={16} s={0.52} color="#6E5A3A" f={f} phase={3} face="smile" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #132 さて、ここで意外な登場人物が現れます。映画館です。
// 格: 並 / seed 1218
// 絵: 紹介の口上。暗がりからスポットライトでせり上がる映写機。じゃーん、の構え
// どこ: 真っ暗な舞台。赤い袖幕と板張りの床
// 演出: 床のせり穴からリフトで映写機がせり上がる。スポットライトが当たる
// 動き: リフト上昇 → じゃーんの放射線 → 塵が光の中を漂う
const Sg132: React.FC<{ f: number }> = ({ f }) => {
  const up = pop(seg(f, 6, 26));
  const yPlat = lerp(1010, 650, up);
  const sway = Math.sin(f / 16) * 14;
  const burst = pop(seg(f, 26, 34));
  return (
    <Frame f={f} seed={1218} bg={C.butaiYami} dark>
      {/* 奥の暗がり (うっすら板壁) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.butaiYami} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={180 + i * 260} y1={-20} x2={180 + i * 260} y2={720}
          stroke={KRP.ink} strokeWidth={3} opacity={0.14} />
      ))}
      {/* 舞台の床板 */}
      <rect x={-20} y={720} width={W + 40} height={380} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={-20} y1={760 + i * 42} x2={W + 20} y2={760 + i * 42}
          stroke={KRP.ink} strokeWidth={2.5} opacity={0.22} />
      ))}
      {/* 床のせり穴 */}
      <rect x={760} y={742} width={400} height={30} rx={6} fill={KRP.ink} opacity={0.85} />
      {/* スポットライトの光の帯 (ゆっくり揺れる) */}
      <polygon
        points={`${960 + sway * 0.3},-40 ${700 + sway},860 ${1220 + sway},860`}
        fill={C.bulb} opacity={0.16 + up * 0.1} />
      <polygon
        points={`${960 + sway * 0.3},-40 ${790 + sway},860 ${1130 + sway},860`}
        fill={C.bulb} opacity={0.14 + up * 0.12} />
      <ellipse cx={960 + sway} cy={790} rx={300} ry={48} fill={C.bulb} opacity={0.2 + up * 0.14} />
      {/* 光の中の塵 */}
      {Array.from({ length: 14 }).map((_, i) => {
        const dx = 760 + rnd(1218, i) * 400;
        const dy = 120 + ((rnd(1218, i + 40) * 640 + f * (3 + rnd(1218, i + 80) * 4)) % 640);
        return <circle key={i} cx={dx + Math.sin(f / 10 + i) * 8} cy={dy} r={2.6 + rnd(1218, i + 20) * 2}
          fill={C.bulb} opacity={0.4} />;
      })}
      {/* 赤い袖幕 (左右) */}
      <path d={`M -20 -20 L 330 -20 Q 290 300 322 620 Q 300 780 250 900 L -20 900 Z`}
        fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 120 -20 Q 150 320 110 640 M 220 -20 Q 250 300 226 660"
        fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
      <path d={`M ${W + 20} -20 L 1590 -20 Q 1630 300 1598 620 Q 1620 780 1670 900 L ${W + 20} 900 Z`}
        fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 1800 -20 Q 1770 320 1810 640 M 1700 -20 Q 1672 300 1694 660"
        fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
      {/* せりのリフト台 (映写機を載せて上がる) */}
      <g>
        <rect x={792} y={yPlat + 4} width={336} height={26} rx={6}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* リフトの柱 (床下から伸びる) */}
        <line x1={830} y1={yPlat + 30} x2={830} y2={1010} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1090} y1={yPlat + 30} x2={1090} y2={1010} stroke={KRP.ink} strokeWidth={7} />
        <line x1={830} y1={lerp(yPlat + 60, 900, 0.4)} x2={1090} y2={lerp(yPlat + 100, 940, 0.4)}
          stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <EishaKi x={988} y={yPlat + 4} s={1.3} f={f} />
      </g>
      {/* じゃーん の放射線 */}
      {burst > 0.01 && (
        <g opacity={burst} stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round">
          {[-150, -115, -80, -45, -10, 25, 60].map((a) => {
            const r1 = 260 + burst * 40, r2 = 340 + burst * 60;
            const rad = (a * Math.PI) / 180;
            return <line key={a}
              x1={960 + r1 * Math.cos(rad)} y1={430 + r1 * Math.sin(rad)}
              x2={960 + r2 * Math.cos(rad)} y2={430 + r2 * Math.sin(rad)} />;
          })}
        </g>
      )}
      <TagPlate x={540} y={140} text="意外な登場" size={42} rot={-4} fill={KRP.yellow} t={seg(f, 12, 24)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #133 映画館こそ「最初から最後まで」の本家だと、思いますよね。
// 格: 図 / seed 1219
// 絵: 額縁に入った「本家」の賞状。もっともらしい金の飾り
// --- #133/#134 で使い回すロビーの壁 (絵を複製しない) ---
const LobbyWall: React.FC<{ dim?: number }> = ({ dim = 0 }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.lobbyWall} />
    {/* 壁紙のダマスク風の模様 */}
    {Array.from({ length: 24 }).map((_, i) => {
      const gx = 120 + (i % 6) * 340, gy = 60 + Math.floor(i / 6) * 200 + (i % 2) * 40;
      return (
        <g key={i} opacity={0.1} transform={`translate(${gx} ${gy})`}>
          <path d="M 0 -26 Q 20 -8 0 16 Q -20 -8 0 -26 Z" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-4} r={5} fill={KRP.ink} />
        </g>
      );
    })}
    {/* 腰板と床 */}
    <rect x={-20} y={760} width={W + 40} height={120} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={100 + i * 300} y1={760} x2={100 + i * 300} y2={880}
        stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
    ))}
    <rect x={-20} y={874} width={W + 40} height={220} fill={C.rokaYuka} stroke={KRP.ink} strokeWidth={6} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-20} y1={930 + i * 56} x2={W + 20} y2={930 + i * 56}
        stroke={KRP.ink} strokeWidth={2.5} opacity={0.25} />
    ))}
    {/* 壁の燭台ランプ 2つ */}
    {[300, 1620].map((lx) => (
      <g key={lx} transform={`translate(${lx} 300)`}>
        <path d="M 0 60 L 0 26" stroke={KRP.ink} strokeWidth={6} />
        <path d="M -26 26 Q 0 -6 26 26 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={16} fill={C.bulb} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={0} r={34} fill={C.bulb} opacity={0.25} />
      </g>
    ))}
    {/* 鉢植えのシダ */}
    <g transform="translate(236 892)">
      <path d="M -52 0 L 52 0 L 38 -74 L -38 -74 Z" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      {[-60, -30, 0, 30, 60].map((a) => (
        <path key={a} d={`M 0 -74 Q ${a} -150 ${a * 1.5} -186`}
          fill="none" stroke={KRP.green} strokeWidth={6} strokeLinecap="round" />
      ))}
    </g>
    {/* ビロードのロープ柵 */}
    {[1380, 1760].map((px) => (
      <g key={px} transform={`translate(${px} 900)`}>
        <ellipse cx={0} cy={0} rx={34} ry={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={0} y1={-6} x2={0} y2={-120} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={0} cy={-128} r={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    <path d="M 1380 788 Q 1570 850 1760 788" fill="none" stroke={SGP.curtain} strokeWidth={10} strokeLinecap="round" />
    {/* 暗さ */}
    {dim > 0 && <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.butaiYami} opacity={dim} />}
  </g>
);

// --- #133/#134 の「本家」の額縁 (flipT 0=表 → 1=裏) ---
const HonkeGaku: React.FC<{ x: number; y: number; s?: number; flipT?: number; f: number }> =
  ({ x, y, s = 1, flipT = 0, f }) => {
    const sx = Math.cos(Math.PI * clamp01(flipT));
    const front = clamp01(flipT) < 0.5;
    return (
      <g transform={`translate(${x} ${y}) scale(${sx * s} ${s})`}>
        {/* 金の額縁 (外→内) */}
        <rect x={-300} y={-220} width={600} height={440} rx={18}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-272} y={-192} width={544} height={384} rx={10}
          fill={C.goldDeep} stroke={KRP.ink} strokeWidth={4} />
        {/* 四隅の飾り */}
        {[[-300, -220], [300, -220], [-300, 220], [300, 220]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <circle r={26} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle r={10} fill={C.goldDeep} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        {/* 上の飾りリボン */}
        <path d="M -70 -220 Q 0 -286 70 -220 Q 30 -252 0 -250 Q -30 -252 -70 -220 Z"
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        {front ? (
          <g>
            {/* 表: 賞状 */}
            <rect x={-240} y={-160} width={480} height={320} fill={SGP.paper} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-224} y={-144} width={448} height={288} fill="none" stroke={C.goldDeep} strokeWidth={4} />
            <text x={0} y={-42} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={104} fill={KRP.ink}>本家</text>
            {/* もっともらしい飾り行 */}
            {[20, 52, 84].map((ly, i) => (
              <line key={ly} x1={-150 + i * 20} y1={ly} x2={150 - i * 20} y2={ly}
                stroke={KRP.ink} strokeWidth={5} opacity={0.4} strokeLinecap="round" />
            ))}
            {/* 金の封蝋 */}
            <circle cx={158} cy={92} r={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={158} cy={92} r={14} fill="none" stroke={SGP.paper} strokeWidth={3} />
            {/* きらん */}
            <g opacity={0.5 + 0.5 * Math.sin(f / 7)} stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round">
              <line x1={-196} y1={-116} x2={-156} y2={-76} />
              <line x1={-196} y1={-76} x2={-156} y2={-116} />
            </g>
          </g>
        ) : (
          <g transform="scale(-1 1)">
            {/* 裏: 木の板と留め具 */}
            <rect x={-240} y={-160} width={480} height={320} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            {[-80, 0, 80].map((ly) => (
              <line key={ly} x1={-240} y1={ly} x2={240} y2={ly} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
            ))}
            {[[-210, -130], [210, -130], [-210, 130], [210, 130]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
            {/* 貼り紙「正反対」 */}
            <g transform="rotate(-4)">
              <rect x={-190} y={-78} width={380} height={156} fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={5} />
              <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={92} fill={KRP.red}>正反対</text>
            </g>
          </g>
        )}
      </g>
    );
  };

// どこ: 映画館のロビーの壁。腰板と絨毯 ビロードのロープ柵
// 演出: 金ぴかの額縁に入った「本家」の賞状が正面に掛かる。客がしげしげ眺める
// 動き: 額がぽんと掛かり きらんと光る。客の首が傾く
const Sg133: React.FC<{ f: number }> = ({ f }) => {
  const hang = pop(seg(f, 4, 16));
  return (
    <Frame f={f} seed={1219}>
      <LobbyWall />
      {/* 額縁 (ぽんと掛かる) */}
      <g transform={`translate(0 ${(1 - hang) * -60})`} opacity={0.2 + hang * 0.8}>
        <line x1={960} y1={96} x2={960} y2={180} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        <HonkeGaku x={960} y={430} s={1.06} flipT={0} f={f} />
      </g>
      {/* 眺める客 (腕組みで首をかしげる) */}
      <g transform={`rotate(${Math.sin(f / 14) * 2.5} 520 960)`}>
        <Person x={520} y={960} s={1.05} f={f} pose="armsFolded" cloth={KRP.blueDeep} gaze={[3, -2]} />
      </g>
      <PersonMini x={1660} y={968} s={1.3} color={KRP.green} f={f} phase={1} face="smile" arms="down" />
      <TagPlate x={1510} y={150} text="最初から最後までの本家?" size={38} rot={3} t={seg(f, 14, 26)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #134 ところが、映画館の歴史の大半は、正反対でした。
// 格: 図 / seed 1220
// 絵: その額縁がくるっと裏返る (連番)。裏面に「正反対」。埃がぱっと舞う
// どこ: #133と同じロビーの壁 (連番)。ただしカメラは額に寄り 照明が落ちる
// 演出: 「本家」の額縁がくるっと裏返り 裏の貼り紙「正反対」。埃がぱっと舞う
// 動き: flipT 0→1 で額が回転。回りきった瞬間に埃の粒が飛び散る
const Sg134: React.FC<{ f: number }> = ({ f }) => {
  const flipT = seg(f, 8, 24);
  const dust = seg(f, 20, 38);
  return (
    <Frame f={f} seed={1220}>
      <g transform={zoomAt(1.4, 960, 470)}>
        <LobbyWall dim={0.3} />
        <line x1={960} y1={96} x2={960} y2={180} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        <HonkeGaku x={960} y={430} s={1.06} flipT={flipT} f={f} />
        {/* 埃がぱっと舞う */}
        {dust > 0.01 && Array.from({ length: 16 }).map((_, i) => {
          const a = rnd(1220, i) * Math.PI * 2;
          const sp = 160 + rnd(1220, i + 30) * 240;
          const dx = 960 + Math.cos(a) * sp * easeOut(dust);
          const dy = 430 + Math.sin(a) * sp * 0.7 * easeOut(dust) - 40 * dust;
          return <circle key={i} cx={dx} cy={dy} r={4 + rnd(1220, i + 60) * 5}
            fill={C.haiiro} opacity={(1 - dust) * 0.9} />;
        })}
        {/* 回転の勢いの線 */}
        {flipT > 0.05 && flipT < 0.95 && (
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.5} fill="none">
            <path d="M 600 300 Q 560 430 606 560" />
            <path d="M 1320 300 Q 1360 430 1314 560" />
          </g>
        )}
      </g>
      <TagPlate x={286} y={150} text="ところが" size={44} rot={-4} fill={KRP.yellow} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #135 20世紀前半のアメリカの映画館は、朝から夜中まで、上映しっぱなし。
// 格: 山 / seed 1221
// 絵: 場内の断面。朝→昼→夜と壁の時計が回っても、映写機の光は出っぱなし。客の入れ替わりだけが変わる
// どこ: アメリカの映画館の断面 (壁を取った見取り図)。外に空 屋根の上を太陽と月が渡る
// 演出: 空が朝→夜に変わり 時計が回っても 映写機の光の帯は出っぱなし。客だけ入れ替わる
// 動き: 太陽が沈み月が昇る。時計の針が回る。客席の客が入れ替わり 通路を歩く客
const Sg135: React.FC<{ f: number }> = ({ f }) => {
  const timeT = clamp01(f / 42); // 0=朝 → 1=夜
  const night = easeOut(clamp01((timeT - 0.55) / 0.45));
  const flick = 0.85 + 0.15 * Math.sin(f / 2.3);
  // 太陽と月の弧
  const sunA = Math.PI * (0.15 + 0.75 * timeT);
  const sunX = 960 - Math.cos(sunA) * 760;
  const sunY = 190 - Math.sin(sunA) * 150 + timeT * 90;
  const moonT = clamp01((timeT - 0.62) / 0.38);
  return (
    <Frame f={f} seed={1221}>
      {/* 空 (朝→夜) */}
      <rect x={-20} y={-20} width={W + 40} height={360} fill={C.asaSora} />
      <rect x={-20} y={-20} width={W + 40} height={360} fill={C.yoru} opacity={night} />
      {/* 太陽 */}
      <g opacity={1 - night}>
        <circle cx={sunX} cy={sunY} r={46} fill={C.duskSun} stroke={KRP.ink} strokeWidth={5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1={sunX + 60 * Math.cos((a * Math.PI) / 180)} y1={sunY + 60 * Math.sin((a * Math.PI) / 180)}
            x2={sunX + 76 * Math.cos((a * Math.PI) / 180)} y2={sunY + 76 * Math.sin((a * Math.PI) / 180)}
            stroke={C.duskSun} strokeWidth={5} strokeLinecap="round" />
        ))}
      </g>
      {/* 月と星 (夜に出る) */}
      {moonT > 0.01 && (
        <g opacity={moonT}>
          <path d="M 1560 110 A 46 46 0 1 0 1606 170 A 36 36 0 1 1 1560 110 Z"
            fill={C.bulb} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 10 }).map((_, i) => (
            <circle key={i} cx={140 + rnd(1221, i) * 1500} cy={30 + rnd(1221, i + 20) * 180}
              r={2.5 + rnd(1221, i + 40) * 2} fill={KRP.white}
              opacity={0.5 + 0.5 * Math.sin(f / 6 + i * 2)} />
          ))}
        </g>
      )}
      {/* 建物の外形 (断面) */}
      <rect x={110} y={282} width={1700} height={700} fill={C.fukeKabe} stroke={KRP.ink} strokeWidth={8} />
      <rect x={80} y={236} width={1760} height={56} rx={8} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 屋根の上の看板 */}
      <rect x={760} y={120} width={400} height={96} rx={12} fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6} />
      <text x={960} y={184} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
        fill={KRP.white}>CINEMA</text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={790 + i * 68} cy={132} r={7}
          fill={(i + Math.floor(f / 5)) % 3 === 0 ? C.bulb : KRP.white}
          stroke={KRP.ink} strokeWidth={3} opacity={0.5 + night * 0.5} />
      ))}
      {/* 場内の闇 */}
      <rect x={128} y={300} width={1664} height={664} fill={C.butaiYami} />
      {/* スクリーン (左の壁) */}
      <rect x={160} y={340} width={54} height={520} fill={C.screenBlue} stroke={KRP.ink} strokeWidth={6}
        opacity={0.65 + 0.35 * flick} />
      {/* 映写室 (右上) と映写機 */}
      <rect x={1560} y={316} width={232} height={200} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1560} y={316} width={232} height={200} fill={KRP.ink} opacity={0.35} />
      <EishaKi x={1710} y={508} s={0.62} f={f} />
      {/* 光の帯 (出っぱなし。ちらちら) */}
      <polygon points="1612,420 1618,452 214,560 214,380" fill={C.bulb} opacity={0.3 * flick} />
      <polygon points="1612,426 1616,446 214,530 214,410" fill={KRP.white} opacity={0.26 * flick} />
      {/* 壁の時計 (針がぐるぐる回る) */}
      <g transform="translate(1000 400)">
        <circle r={74} fill={SGP.paper} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <line key={i} x1={60 * Math.cos((i * Math.PI) / 6)} y1={60 * Math.sin((i * Math.PI) / 6)}
            x2={68 * Math.cos((i * Math.PI) / 6)} y2={68 * Math.sin((i * Math.PI) / 6)}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        <line x1={0} y1={0} x2={38 * Math.cos((f * 10 - 90) * Math.PI / 180)}
          y2={38 * Math.sin((f * 10 - 90) * Math.PI / 180)} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={0} y1={0} x2={56 * Math.cos((f * 42 - 90) * Math.PI / 180)}
          y2={56 * Math.sin((f * 42 - 90) * Math.PI / 180)} stroke={KRP.red} strokeWidth={4.5} strokeLinecap="round" />
        <circle r={7} fill={KRP.ink} />
      </g>
      {/* 傾斜した客席 (3列) と入れ替わる客 */}
      {[0, 1, 2].map((row) => {
        const ry = 700 + row * 86;
        return (
          <g key={row}>
            <line x1={300} y1={ry + 44} x2={1520} y2={ry + 30 + row * 8} stroke={SGP.wood} strokeWidth={10} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const sx = 380 + i * 170 + row * 34;
              const inA = Math.sin(f / 7 + rnd(1221, row * 10 + i) * 6.28) > -0.55;
              const colA = [KRP.blueDeep, KRP.green, SGP.curtain, KRP.grayDark][(row + i) % 4];
              const colB = [KRP.grayDark, SGP.curtain, KRP.blueDeep, KRP.green][(row + i) % 4];
              return (
                <g key={i}>
                  <rect x={sx - 26} y={ry - 10} width={52} height={52} rx={8}
                    fill={C.sekiAka} stroke={KRP.ink} strokeWidth={4.5} />
                  <PersonMini x={sx} y={ry + 36} s={1.04} color={inA ? colA : colB}
                    f={f} phase={row * 7 + i} face="dot" arms="down" />
                </g>
              );
            })}
          </g>
        );
      })}
      {/* 通路を歩いて入ってくる客 */}
      <PersonMini x={1620 - (f * 9) % 420} y={944} s={1.15} color={KRP.yellow} f={f} phase={3} face="smile" arms="down" />
      {/* 入口の戸 (右下) */}
      <rect x={1690} y={830} width={102} height={134} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={1708} cy={900} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      <TagPlate x={380} y={200} text="上映しっぱなし" size={40} rot={-3} fill={KRP.yellow} t={seg(f, 10, 22)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #136 ニュース映画、漫画、短編、予告、本編。これを、ぐるぐる繰り返します。
// 格: 並 / seed 1222
// 絵: フィルム缶5つ (ニュース・漫画・短編・予告・本編) がメリーゴーランドのように回る。回転の矢印
// どこ: 映写室の中。棚のフィルム缶 裸電球 小窓から光の帯
// 演出: 5つのフィルム缶 (ニュース 漫画 短編 予告 本編) がメリーゴーランドの屋根の下をぐるぐる回る
// 動き: 回転木馬が回り続ける。奥の缶は小さく薄く。回転の矢印。電球が揺れる
const Sg136: React.FC<{ f: number }> = ({ f }) => {
  const names = ["ニュース", "漫画", "短編", "予告", "本編"];
  const spin = f * 2.6 + 10; // 回転角 (度)
  const appear = pop(seg(f, 4, 16));
  const bulbSway = Math.sin(f / 13) * 7;
  return (
    <Frame f={f} seed={1222}>
      {/* 映写室の壁と板目 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.fukeKabe} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={i * 260 - 40} y1={-20} x2={i * 260 - 40} y2={800}
          stroke={KRP.ink} strokeWidth={3} opacity={0.12} />
      ))}
      {/* 左の棚 (予備のフィルム缶が積んである) */}
      <g>
        <rect x={40} y={210} width={300} height={560} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((s) => (
          <g key={s}>
            <line x1={40} y1={390 + s * 180} x2={340} y2={390 + s * 180} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((j) => (
              <ellipse key={j} cx={110 + j * 86} cy={372 + s * 180 - j * 2} rx={40} ry={14}
                fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
      </g>
      {/* 右の小窓と光の帯 */}
      <g>
        <rect x={1664} y={300} width={180} height={150} rx={10} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1684} y={320} width={140} height={110} rx={6} fill={C.screenBlue} opacity={0.8 + 0.2 * Math.sin(f / 3)} />
        <polygon points="1684,330 1684,420 1560,460 1560,306" fill={C.bulb} opacity={0.25} />
      </g>
      {/* 床 */}
      <rect x={-20} y={800} width={W + 40} height={300} fill={C.rokaYuka} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={i * 340 - 60} y1={800} x2={i * 340 + 60} y2={1100}
          stroke={KRP.ink} strokeWidth={2.5} opacity={0.2} />
      ))}
      {/* 揺れる裸電球 */}
      <g transform={`rotate(${bulbSway} 1480 -20)`}>
        <line x1={1480} y1={-20} x2={1480} y2={168} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={1480} cy={190} r={24} fill={C.bulb} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1480} cy={190} r={46} fill={C.bulb} opacity={0.25} />
      </g>
      {/* ===== フィルム缶のメリーゴーランド ===== */}
      <g transform={`translate(0 ${(1 - appear) * 80})`} opacity={0.15 + appear * 0.85}>
        {/* 中心柱と縞のとんがり屋根 */}
        <line x1={960} y1={250} x2={960} y2={760} stroke={KRP.ink} strokeWidth={10} />
        <path d="M 960 142 L 430 330 Q 960 404 1490 330 Z"
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
        {[-2, -1, 0, 1, 2].map((i) => (
          <line key={i} x1={960} y1={152} x2={960 + i * 215} y2={344 + (4 - Math.abs(i) * 1.5) * 8}
            stroke={KRP.white} strokeWidth={11} opacity={0.7} />
        ))}
        {/* てっぺんの旗 (はためく) */}
        <g transform={`translate(960 142)`}>
          <line x1={0} y1={0} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 0 -56 Q ${36 + Math.sin(f / 5) * 8} ${-48 + Math.sin(f / 4) * 5} ${64 + Math.sin(f / 5) * 10} -40 L 0 -28 Z`}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 台座 */}
        <ellipse cx={960} cy={760} rx={530} ry={96} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={960} cy={742} rx={530} ry={96} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 回る5つのフィルム缶 (奥は小さく薄く) */}
        {names.map((nm, i) => {
          const a = ((spin + i * 72) * Math.PI) / 180;
          const px = 960 + Math.sin(a) * 440;
          const py = 600 + Math.cos(a) * 92;
          const depth = (Math.cos(a) + 1) / 2; // 1=手前
          const sc = 0.72 + depth * 0.5;
          return (
            <g key={nm} transform={`translate(${px} ${py}) scale(${sc})`} opacity={0.45 + depth * 0.55}>
              {/* 吊り棒 */}
              <line x1={0} y1={-330 + (1 - depth) * 60} x2={0} y2={-108} stroke={KRP.ink} strokeWidth={5} />
              {/* 缶 (丸い円盤) */}
              <circle cx={0} cy={0} r={104} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
              <circle cx={0} cy={0} r={78} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
              <circle cx={0} cy={0} r={16} fill={KRP.ink} opacity={0.75} />
              {/* ラベル */}
              <rect x={-86} y={24} width={172} height={54} rx={9}
                fill={SGP.paper} stroke={KRP.ink} strokeWidth={4.5} />
              <text x={0} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={nm.length > 2 ? 34 : 40} fill={KRP.ink}>{nm}</text>
            </g>
          );
        })}
        {/* 回転の矢印 (台座のふちに沿って) */}
        <g stroke={KRP.red} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.95}>
          <path d="M 1530 700 Q 1610 760 1530 818" />
          <path d="M 410 818 Q 330 760 410 700" />
        </g>
        <polygon points="1512,804 1562,814 1522,848" fill={KRP.red} />
        <polygon points="428,714 378,704 418,670" fill={KRP.red} />
      </g>
      <TagPlate x={286} y={140} text="ぐるぐる" size={42} rot={-4} t={seg(f, 18, 30)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_126: (f) => <Sg126 f={f} />,
  sg_127: (f) => <Sg127 f={f} />,
  sg_128: (f) => <Sg128 f={f} />,
  sg_129: (f) => <Sg129 f={f} />,
  sg_130: (f) => <Sg130 f={f} />,
  sg_131: (f) => <Sg131 f={f} />,
  sg_132: (f) => <Sg132 f={f} />,
  sg_133: (f) => <Sg133 f={f} />,
  sg_134: (f) => <Sg134 f={f} />,
  sg_135: (f) => <Sg135 f={f} />,
  sg_136: (f) => <Sg136 f={f} />,
};

export const S_B6B_MOTIFS: string[] = [
  "sg_126", // #126
  "sg_127", // #127
  "sg_128", // #128
  "sg_129", // #129
  "sg_130", // #130
  "sg_131", // #131
  "sg_132", // #132
  "sg_133", // #133
  "sg_134", // #134
  "sg_135", // #135
  "sg_136", // #136
];

export const saigoB6bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
