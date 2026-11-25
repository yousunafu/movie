// 人は、なぜ暇をつぶすのか: 文#116〜#127 (12文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./HimaShared";
import {
  HP, Monosashi, monoSlot, Sousa, Sagyozukue, YoruNoHeya, YoruNoHeyaFront, EkiHome, EkiBenchFront,
  KyukeiBoard, ShockRoom, Sumaho, YasumiCalendar,
} from "./HimaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/HP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 重役室
  wallGreen: "#6F8F6A",
  wallGreenDark: "#58744F",
  wood: "#9A6A43",
  woodDark: "#6E4A2E",
  woodLight: "#C08A5A",
  woodPale: "#D9B07A",
  carpet: "#B4553F",
  carpetDark: "#8E3F2E",
  mapPaper: "#F1E4C0",
  // 窓の外
  sky: "#BFE0F0",
  cloud: "#FDFBF7",
  hill: "#9CC48A",
  hillFar: "#B9D6A8",
  tree: "#5F9A58",
  trunk: "#7A5638",
  smoke: "#E9E6E0",
  // 鉄
  iron: "#5A5F68",
  ironDark: "#3A3D43",
  ironLight: "#8A8F98",
  // 印刷所
  brick: "#C3714F",
  brickDark: "#9E5638",
  apron: "#EDE6D6",
  inkPot: "#2E2A27",
  // 人の服・帽子
  hatBlack: "#2F2B28",
  coatGray: "#4A4E5A",
  coatGrayDark: "#33363F",
  coatBrown: "#7B5A3C",
  coatBrownDark: "#5C4229",
  hairBrown: "#5A3D2B",
  hairGray: "#B9B4AC",
  rose: "#B0637A",
  roseDark: "#8A4A5E",
  plum: "#6A5A7A",
  plumDark: "#4E425C",
  navy: "#3E4B66",
  navyDark: "#2E3850",
  olive: "#7C8A4E",
  oliveDark: "#5E6A38",
  straw: "#E8CC8A",
  ribbon: "#D96A6A",
  // 客車
  velvet: "#A23B3B",
  velvetDark: "#7C2B2B",
  brassRod: "#C9A13A",
  // 黄色い本
  yellowBook: "#F2C431",
  yellowBookDark: "#C99A1A",
  gold: "#E7B93A",
  goldLight: "#FFE48A",
  pine: "#4F8A56",
  page: "#FBF6E8",
  pageLine: "#C9C2B2",
  coin: "#E0B640",
  coinDark: "#A8862A",
  bagCloth: "#B8956A",
  bagDark: "#8C6E48",
  sweat: "#8CC4E8",
  // いまの電車
  modernWall: "#E6EAEE",
  modernWallDark: "#C9D0D8",
  modernSeat: "#5D7FA8",
  modernSeatDark: "#46648A",
  modernFloor: "#A9AFB6",
  building: "#C9CED6",
  buildingDark: "#9AA2AE",
  // 大正の電車
  taishoBody: "#8A4B32",
  taishoDark: "#6A3824",
  taishoCream: "#E9DDBF",
  platform: "#BFB8A8",
  platformDark: "#9C9585",
  gakuran: "#2E3240",
  station: "#34405A",
  kimonoA: "#9B6FA8",
  kimonoADark: "#76508A",
  kimonoB: "#D98A8A",
  obi: "#E6C15A",
  // 本屋
  noren: "#33507A",
  norenDark: "#24395A",
  clothRed: "#8E3B34",
  clothRedDark: "#6A2924",
  bunko: "#EFE6CF",
  bunkoLine: "#B7A882",
} as const;
void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void HP; void Monosashi; void monoSlot; void Sousa; void Sagyozukue; void YoruNoHeya; void YoruNoHeyaFront;
void EkiHome; void EkiBenchFront; void KyukeiBoard; void ShockRoom; void Sumaho; void YasumiCalendar;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const mod = (a: number, n: number) => ((a % n) + n) % n;
void lerp; void easeInOut; void rnd;

/** Person と同じ座標系 (足元原点・scale・lean・体ゆれ) で重ね描きする。帽子・ひげ・着物・後頭部などに使う */
const HmFbOn: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number; children?: React.ReactNode;
}> = ({ x, y, s, f, phase = 0, lean = 0, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

type HmFbHatKind = "top" | "bowler" | "bonnet" | "student" | "boater" | "station" | "bun" | "none";
/** 帽子 (HmFbOn の中で使う。頭の中心 (0,-228) 半径64) */
const HmFbHat: React.FC<{ kind: HmFbHatKind; color?: string; band?: string }> = ({ kind, color, band }) => {
  const k = KRP.ink;
  if (kind === "top") {
    const c = color ?? C.hatBlack;
    return (
      <g stroke={k} strokeWidth={5}>
        <ellipse cx={0} cy={-272} rx={88} ry={16} fill={c} />
        <rect x={-50} y={-396} width={100} height={126} rx={6} fill={c} />
        <rect x={-50} y={-300} width={100} height={18} fill={band ?? C.velvetDark} strokeWidth={3} />
        <path d="M -38 -386 L -38 -312" stroke={KRP.white} strokeWidth={6} opacity={0.25} />
      </g>
    );
  }
  if (kind === "bowler") {
    const c = color ?? C.hatBlack;
    return (
      <g stroke={k} strokeWidth={5}>
        <ellipse cx={0} cy={-266} rx={84} ry={13} fill={c} />
        <path d="M -58 -266 Q -62 -352 0 -354 Q 62 -352 58 -266 Z" fill={c} />
        <path d="M -58 -282 Q 0 -290 58 -282 L 58 -268 Q 0 -276 -58 -268 Z" fill={band ?? C.coatBrownDark} strokeWidth={3} />
        <path d="M -30 -336 Q -18 -346 0 -347" stroke={KRP.white} strokeWidth={6} opacity={0.25} fill="none" />
      </g>
    );
  }
  if (kind === "bonnet") {
    const c = color ?? C.straw;
    return (
      <g stroke={k} strokeWidth={5}>
        <path fillRule="evenodd" fill={c}
          d="M -88 -172 Q -104 -338 0 -340 Q 104 -338 88 -172 Q 76 -160 64 -178 Q 74 -298 0 -300 Q -74 -298 -64 -178 Q -76 -160 -88 -172 Z" />
        <path d="M -95 -244 Q 0 -374 95 -244" fill="none" stroke={band ?? C.ribbon} strokeWidth={10} />
        {/* 顎のリボン */}
        <path d="M -66 -178 Q -50 -150 -24 -156" fill="none" stroke={band ?? C.ribbon} strokeWidth={7} />
        <path d="M 66 -178 Q 50 -150 24 -156" fill="none" stroke={band ?? C.ribbon} strokeWidth={7} />
        <ellipse cx={-14} cy={-152} rx={13} ry={8} fill={band ?? C.ribbon} strokeWidth={3} />
        <ellipse cx={14} cy={-152} rx={13} ry={8} fill={band ?? C.ribbon} strokeWidth={3} />
        {/* 花飾り */}
        <circle cx={58} cy={-300} r={14} fill={KRP.white} strokeWidth={3} />
        <circle cx={58} cy={-300} r={5} fill={KRP.yellow} strokeWidth={2} />
      </g>
    );
  }
  if (kind === "student") {
    const c = color ?? C.gakuran;
    return (
      <g stroke={k} strokeWidth={5}>
        <rect x={-62} y={-330} width={124} height={50} rx={6} fill={c} />
        <path d="M -64 -282 Q 0 -262 64 -282 L 58 -268 Q 0 -250 -58 -268 Z" fill={KRP.ink} />
        <path d="M -60 -292 L 60 -292" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
        <circle cx={0} cy={-308} r={10} fill={KRP.brass} strokeWidth={3} />
      </g>
    );
  }
  if (kind === "boater") {
    return (
      <g stroke={k} strokeWidth={5}>
        <ellipse cx={0} cy={-280} rx={94} ry={15} fill={C.straw} />
        <rect x={-54} y={-324} width={108} height={44} rx={4} fill={C.straw} />
        <rect x={-54} y={-304} width={108} height={16} fill={band ?? C.navy} strokeWidth={3} />
      </g>
    );
  }
  if (kind === "station") {
    const c = color ?? C.station;
    return (
      <g stroke={k} strokeWidth={5}>
        <path d="M -60 -280 L -54 -334 L 54 -334 L 60 -280 Z" fill={c} />
        <rect x={-60} y={-298} width={120} height={14} fill={KRP.brass} strokeWidth={3} />
        <path d="M -66 -282 Q 0 -262 66 -282 L 58 -268 Q 0 -250 -58 -268 Z" fill={KRP.ink} />
        <circle cx={0} cy={-316} r={10} fill={KRP.brass} strokeWidth={3} />
      </g>
    );
  }
  if (kind === "bun") {
    return (
      <g stroke={k} strokeWidth={5}>
        <ellipse cx={0} cy={-306} rx={48} ry={30} fill={KRP.ink} />
        <line x1={-62} y1={-322} x2={64} y2={-296} stroke={C.ribbon} strokeWidth={6} />
        <circle cx={66} cy={-296} r={8} fill={C.ribbon} strokeWidth={3} />
      </g>
    );
  }
  return null;
};

/** 口ひげ (HmFbOn の中) */
const HmFbMustache: React.FC<{ color?: string }> = ({ color = KRP.ink }) => (
  <path d="M -30 -196 Q -15 -212 0 -201 Q 15 -212 30 -196 Q 16 -190 0 -195 Q -16 -190 -30 -196 Z" fill={color} />
);

/** 19世紀の上着の白いシャツと蝶ネクタイ (HmFbOn の中) */
const HmFbShirt: React.FC<{ tie?: string }> = ({ tie = C.velvetDark }) => (
  <g stroke={KRP.ink} strokeWidth={4}>
    <path d="M -24 -160 L 0 -112 L 24 -160 Z" fill={KRP.white} />
    <path d="M -16 -150 L 0 -142 L -16 -134 Z M 16 -150 L 0 -142 L 16 -134 Z" fill={tie} strokeWidth={3} />
  </g>
);

/** すわった女性の長いスカート (HmFbOn の中。pose="sit" の脚の上) */
const HmFbSkirt: React.FC<{ color: string; dark: string }> = ({ color, dark }) => (
  <g stroke={KRP.ink} strokeWidth={4.5}>
    <path d="M -62 -66 Q -78 -26 -50 -2 L 78 -6 Q 92 -40 62 -66 Z" fill={color} />
    <path d="M -20 -60 Q -24 -30 -14 -6 M 24 -60 Q 30 -30 34 -6" stroke={dark} strokeWidth={4} fill="none" />
    <ellipse cx={-34} cy={-2} rx={16} ry={7} fill={KRP.ink} />
    <ellipse cx={64} cy={-4} rx={16} ry={7} fill={KRP.ink} />
  </g>
);

/** 着物のえりと帯 (HmFbOn の中) */
const HmFbKimono: React.FC<{ obi?: string }> = ({ obi = C.obi }) => (
  <g stroke={KRP.ink} strokeWidth={4}>
    <path d="M -30 -160 L 8 -104 L 20 -104 L -14 -160 Z" fill={KRP.white} />
    <path d="M 30 -160 L 4 -122 L -4 -132 L 16 -160 Z" fill={KRP.white} />
    <rect x={-58} y={-110} width={116} height={28} fill={obi} />
    <line x1={-58} y1={-96} x2={58} y2={-96} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
  </g>
);

/** 学生服の金ボタンと詰め襟 (HmFbOn の中) */
const HmFbGakuran: React.FC = () => (
  <g stroke={KRP.ink} strokeWidth={3}>
    <rect x={-30} y={-166} width={60} height={14} rx={4} fill={C.gakuran} strokeWidth={4} />
    {[-140, -118, -96, -74].map((yy) => <circle key={yy} cx={0} cy={yy} r={6} fill={KRP.brass} />)}
  </g>
);

/** 窓の外の景色。左へ流れる。clipPath の id はシーンごとに別の名前にする */
const HmFbScenery: React.FC<{
  id: string; x: number; y: number; w: number; h: number; f: number; speed?: number;
  kind?: "country" | "city"; poly?: string; children?: React.ReactNode;
}> = ({ id, x, y, w, h, f, speed = 4, kind = "country", poly, children }) => {
  const hz = y + h * 0.62;
  return (
    <g>
      <defs>
        <clipPath id={id}>{poly ? <polygon points={poly} /> : <rect x={x} y={y} width={w} height={h} />}</clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill={C.sky} />
        {Array.from({ length: 3 }, (_, i) => {
          const cx = x + mod(i * 260 + 60 - f * speed * 0.12, w + 300) - 150;
          return <ellipse key={`c${i}`} cx={cx} cy={y + h * (0.16 + i * 0.07)} rx={70} ry={20} fill={C.cloud} opacity={0.9} />;
        })}
        {kind === "country" ? (
          <g>
            {Array.from({ length: Math.ceil(w / 320) + 3 }, (_, i) => {
              const cx = x + mod(i * 320 - f * speed * 0.35, w + 640) - 320;
              return <ellipse key={`h${i}`} cx={cx} cy={hz + 24} rx={230} ry={78} fill={C.hillFar} stroke={KRP.ink} strokeWidth={4} />;
            })}
            <rect x={x - 10} y={hz + 20} width={w + 20} height={h} fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: Math.ceil(w / 150) + 3 }, (_, i) => {
              const tx = x + mod(i * 150 + rnd(9, i) * 60 - f * speed, w + 300) - 150;
              const ty = hz + 40 + rnd(11, i) * 30;
              return (
                <g key={`t${i}`}>
                  <rect x={tx - 6} y={ty - 30} width={12} height={36} fill={C.trunk} stroke={KRP.ink} strokeWidth={3} />
                  <circle cx={tx} cy={ty - 50} r={30 + rnd(13, i) * 10} fill={C.tree} stroke={KRP.ink} strokeWidth={4} />
                </g>
              );
            })}
            {Array.from({ length: Math.ceil(w / 400) + 2 }, (_, i) => {
              const px = x + mod(i * 400 - f * speed * 2.2, w + 400) - 200;
              return (
                <g key={`p${i}`}>
                  <rect x={px - 6} y={y + h * 0.18} width={12} height={h} fill={C.trunk} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={px - 24} y={y + h * 0.2} width={48} height={8} fill={C.trunk} stroke={KRP.ink} strokeWidth={3} />
                </g>
              );
            })}
            <line x1={x - 10} y1={y + h * 0.24} x2={x + w + 10} y2={y + h * 0.27} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ) : (
          <g>
            {Array.from({ length: Math.ceil(w / 130) + 3 }, (_, i) => {
              const bx = x + mod(i * 130 - f * speed * 0.6, w + 260) - 130;
              const bh = h * (0.35 + rnd(21, i) * 0.4);
              return (
                <g key={`b${i}`}>
                  <rect x={bx} y={hz + 40 - bh} width={110} height={bh + h} fill={i % 2 ? C.building : C.buildingDark} stroke={KRP.ink} strokeWidth={4} />
                  {Array.from({ length: 6 }, (_, j) => (
                    <rect key={j} x={bx + 14 + (j % 3) * 30} y={hz + 60 - bh + Math.floor(j / 3) * 36} width={18} height={20}
                      fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2} />
                  ))}
                </g>
              );
            })}
            <rect x={x - 10} y={hz + 40} width={w + 20} height={h} fill={C.modernFloor} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: Math.ceil(w / 300) + 2 }, (_, i) => {
              const px = x + mod(i * 300 - f * speed * 2.4, w + 300) - 150;
              return <rect key={`q${i}`} x={px - 7} y={y + h * 0.1} width={14} height={h} fill={C.ironLight} stroke={KRP.ink} strokeWidth={3} />;
            })}
          </g>
        )}
        {children}
      </g>
    </g>
  );
};

/** 蒸気機関車 (横から。右向きに走る)。y はレールの上面 */
const HmFbLoco: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const a = f * 15;
  const wheel = (cx: number, r: number) => (
    <g transform={`translate(${cx} ${-r - 2})`}>
      <circle r={r} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`rotate(${a})`} stroke={KRP.ink} strokeWidth={4}>
        <line x1={-r + 4} y1={0} x2={r - 4} y2={0} />
        <line x1={0} y1={-r + 4} x2={0} y2={r - 4} />
      </g>
      <circle r={6} fill={KRP.ink} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={34 - i * 60 - (f % 12) * 2} cy={-190 - i * 18} r={22 + i * 9}
          fill={C.smoke} stroke={KRP.ink} strokeWidth={4} opacity={0.95 - i * 0.14} />
      ))}
      {/* 客車 */}
      <rect x={-420} y={-130} width={300} height={96} rx={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-404 + i * 72} y={-116} width={50} height={40} rx={4} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />)}
      <rect x={-124} y={-70} width={40} height={10} fill={KRP.ink} />
      {wheel(-370, 18)}{wheel(-170, 18)}
      {/* 本体 */}
      <rect x={-90} y={-152} width={84} height={104} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-98} y={-162} width={100} height={14} rx={4} fill={KRP.ink} />
      <rect x={-74} y={-138} width={42} height={36} rx={4} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-10} y={-122} width={176} height={66} rx={30} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
      <rect x={110} y={-176} width={28} height={58} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={102} y={-186} width={44} height={14} rx={3} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={50} cy={-124} rx={18} ry={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-100} y={-58} width={282} height={16} fill={KRP.ink} />
      <path d="M 166 -42 L 196 -6 L 160 -6 Z" fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
      {wheel(-52, 30)}{wheel(40, 30)}{wheel(130, 20)}
    </g>
  );
};

/** 閉じた本 (表紙を正面から)。x,y は中心 */
const HmFbBookFace: React.FC<{
  x: number; y: number; w: number; h: number; color: string; dark: string; rot?: number; plainTo?: number;
}> = ({ x, y, w, h, color, dark, rot = 0, plainTo = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={4} fill={C.page} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={color} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-w / 2} y={-h / 2} width={w * 0.12} height={h} fill={dark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-w / 2 + w * 0.24} y={-h / 2 + h * 0.14} width={w * 0.6} height={h * 0.72} rx={3} fill="none"
      stroke={dark} strokeWidth={3} opacity={0.7 * (1 - plainTo)} />
  </g>
);

/** 顔の前に立てて開いた本を、向かいの席から見た姿 (表紙の背中側が見える)。x,y は背の中心 */
const HmFbBookOpenBack: React.FC<{
  x: number; y: number; w: number; h: number; open: number; color: string; dark: string; rot?: number; flip?: number;
}> = ({ x, y, w, h, open, color, dark, rot = 0, flip = 0 }) => {
  const half = (w / 2) * (0.35 + 0.65 * open);
  const fl = flip > 0 && flip < 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* 上から覗く紙の束 */}
      <path d={`M ${-half + 8} ${-h / 2 + 2} Q 0 ${-h / 2 - 16 * open} ${half - 8} ${-h / 2 + 2} L ${half - 8} ${-h / 2 + 14} L ${-half + 8} ${-h / 2 + 14} Z`}
        fill={C.page} stroke={KRP.ink} strokeWidth={4} />
      {fl && (
        <path d={`M 0 ${-h / 2 + 4} Q ${(half * 0.9) * Math.cos(Math.PI * flip)} ${-h / 2 - 60 * Math.sin(Math.PI * flip)} ${half * 0.95 * Math.cos(Math.PI * flip)} ${-h / 2 + 6}`}
          fill={C.page} stroke={KRP.ink} strokeWidth={4} />
      )}
      <path d={`M ${-half} ${-h / 2 + 8 * open} L 0 ${-h / 2} L 0 ${h / 2} L ${-half} ${h / 2 - 8 * open} Z`} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${half} ${-h / 2 + 8 * open} L 0 ${-h / 2} L 0 ${h / 2} L ${half} ${h / 2 - 8 * open} Z`} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-w * 0.05} y={-h / 2} width={w * 0.1} height={h} fill={dark} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${-half * 0.75} ${-h * 0.3} L ${-half * 0.2} ${-h * 0.33} L ${-half * 0.2} ${h * 0.33} L ${-half * 0.75} ${h * 0.3} Z`}
        fill="none" stroke={dark} strokeWidth={3} opacity={0.7} />
      <path d={`M ${half * 0.75} ${-h * 0.3} L ${half * 0.2} ${-h * 0.33} L ${half * 0.2} ${h * 0.33} L ${half * 0.75} ${h * 0.3} Z`}
        fill="none" stroke={dark} strokeWidth={3} opacity={0.7} />
    </g>
  );
};

/** 正面から見た客車の座席 (ビロード張り・ボタン留め)。seatY が座面 */
const HmFbBench: React.FC<{ x1: number; x2: number; seatY: number; s: number; color?: string; dark?: string }> = ({
  x1, x2, seatY, s, color = C.velvet, dark = C.velvetDark,
}) => {
  const bh = 170 * s;
  const n = Math.max(2, Math.round((x2 - x1) / (70 * s)));
  return (
    <g stroke={KRP.ink}>
      <rect x={x1 - 14 * s} y={seatY - bh - 16 * s} width={x2 - x1 + 28 * s} height={20 * s} rx={6 * s} fill={C.woodDark} strokeWidth={5} />
      <rect x={x1} y={seatY - bh} width={x2 - x1} height={bh} rx={14 * s} fill={color} strokeWidth={5} />
      {Array.from({ length: n - 1 }, (_, i) =>
        [0.33, 0.66].map((v) => (
          <circle key={`${i}-${v}`} cx={x1 + ((i + 1) * (x2 - x1)) / n} cy={seatY - bh * v} r={5 * s} fill={dark} strokeWidth={2} />
        )),
      )}
      <rect x={x1 - 10 * s} y={seatY - 14 * s} width={x2 - x1 + 20 * s} height={40 * s} rx={10 * s} fill={dark} strokeWidth={5} />
      <rect x={x1} y={seatY + 26 * s} width={x2 - x1} height={44 * s} fill={C.woodDark} strokeWidth={5} />
    </g>
  );
};

/** 本の山 (斜め上から)。yellow 0→1 で表紙が白→黄色 */
const HmFbStack: React.FC<{ x: number; base: number; n: number; w: number; th: number; yellow?: number; seed: number }> = ({
  x, base, n, w, th, yellow = 0, seed,
}) => {
  const top = base - n * th;
  const ox = (k: number) => (rnd(seed, k) - 0.5) * 10;
  return (
    <g stroke={KRP.ink}>
      {Array.from({ length: n }, (_, k) => {
        const yy = base - (k + 1) * th;
        const dx = ox(k);
        return (
          <g key={k}>
            <rect x={x - w / 2 + dx} y={yy} width={w} height={th} fill={C.page} strokeWidth={3.5} />
            <rect x={x - w / 2 + dx} y={yy} width={w} height={6} fill={KRP.white} strokeWidth={0} />
            <rect x={x - w / 2 + dx} y={yy + th - 6} width={w} height={6} fill={KRP.white} strokeWidth={0} />
            <rect x={x - w / 2 + dx} y={yy} width={w} height={6} fill={C.yellowBook} opacity={yellow} strokeWidth={0} />
            <rect x={x - w / 2 + dx} y={yy + th - 6} width={w} height={6} fill={C.yellowBook} opacity={yellow} strokeWidth={0} />
            <rect x={x + w / 2 + dx - 14} y={yy} width={14} height={th} fill={C.yellowBook} opacity={yellow} stroke={KRP.ink} strokeWidth={2} />
            <line x1={x - w / 2 + dx + 8} y1={yy + th * 0.55} x2={x + w / 2 + dx - 8} y2={yy + th * 0.55} stroke={C.pageLine} strokeWidth={2} />
          </g>
        );
      })}
      {n > 0 && (
        <g>
          <polygon points={`${x - w / 2 + ox(n - 1)},${top} ${x + w / 2 + ox(n - 1)},${top} ${x + w / 2 + 20 + ox(n - 1)},${top - 26} ${x - w / 2 + 20 + ox(n - 1)},${top - 26}`}
            fill={KRP.white} strokeWidth={4} />
          <polygon points={`${x - w / 2 + ox(n - 1)},${top} ${x + w / 2 + ox(n - 1)},${top} ${x + w / 2 + 20 + ox(n - 1)},${top - 26} ${x - w / 2 + 20 + ox(n - 1)},${top - 26}`}
            fill={C.yellowBook} opacity={yellow} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

/** 腕 (そで)。肩→手。手の丸つき */
const HmFbArm: React.FC<{ x1: number; y1: number; x2: number; y2: number; w: number; cloth: string }> = ({ x1, y1, x2, y2, w, cloth }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={w + 9} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={w} strokeLinecap="round" />
    <circle cx={x2} cy={y2} r={w * 0.55} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

/** 汗のしずく */
const HmFbSweat: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) =>
  o <= 0 ? null : (
    <path transform={`translate(${x} ${y}) scale(${s})`} opacity={o}
      d="M 0 -26 Q 16 -2 12 8 Q 6 20 -6 16 Q -16 10 -12 -2 Q -8 -12 0 -26 Z" fill={C.sweat} stroke={KRP.ink} strokeWidth={4} />
  );

/** きらきら (四つ角の星) */
const HmFbSpark: React.FC<{ x: number; y: number; r: number; color?: string; o?: number }> = ({ x, y, r, color = C.goldLight, o = 1 }) =>
  o <= 0 || r <= 0 ? null : (
    <path opacity={o} transform={`translate(${x} ${y})`}
      d={`M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`}
      fill={color} stroke={KRP.ink} strokeWidth={3.5} />
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #116 新聞屋のスミスが、鉄道会社から、駅で売る権利を買ったのです。
// 格: 山 / seed 5116
// 絵: どこ: 鉄道会社の重役室 (重い机・地図・窓から機関車)。演出: **スミスは顔を見せない** (後ろ姿・帳簿を持つ手)。机越しに、鉄道会社の重役 (一般人) が大きな鍵 (売る権利の比喩) を差し出し、スミスが金貨の袋を渡す。鍵には駅舎のマーク。札「売る権利」。動き: 鍵と袋の受け渡し / 金貨がちゃりん / 窓の外の汽車
// どこ: 鉄道会社の重役室。緑の壁紙・腰板・英国の路線地図・機関車の版画・ガス灯・窓の外を汽車が走る。重い机
// 演出: 机の向こうの重役 (口ひげ・めがね) が駅舎マークの大きな鍵を掲げて差し出す。手前のスミスは後ろ姿 (後頭部+シルクハット+ケープ)、
//       脇に帳簿、右手で金貨の袋を机に置く → 袋から金貨がちゃりんと跳ねる。重役は大喜び。鍵に札「売る権利」
// 動き: 鍵がスミスの方へ (f4-20) / 袋が机へ (f8-22) / 金貨が跳ねる (f22-36) / 汽車が窓を横切る / ゆっくり寄る
const HMFB_GB: [number, number][] = [
  [0.45, 0], [0.62, 0.03], [0.55, 0.12], [0.63, 0.2], [0.55, 0.28], [0.6, 0.38], [0.68, 0.5], [0.76, 0.62],
  [0.92, 0.7], [0.86, 0.8], [0.94, 0.88], [0.72, 0.92], [0.5, 0.93], [0.3, 0.97], [0.12, 1], [0.28, 0.88],
  [0.31, 0.8], [0.2, 0.72], [0.33, 0.62], [0.41, 0.55], [0.38, 0.42], [0.3, 0.36], [0.22, 0.25], [0.31, 0.15], [0.26, 0.05],
];
const HMFB_IE: [number, number][] = [[-0.35, 0.42], [-0.18, 0.38], [-0.1, 0.5], [-0.15, 0.64], [-0.35, 0.69], [-0.46, 0.55]];
const hmfbPoly = (pts: [number, number][], mx: number, my: number, sx: number, sy: number) =>
  pts.map((p, i) => `${i ? "L" : "M"} ${mx + p[0] * sx} ${my + p[1] * sy}`).join(" ") + " Z";

const Hm116: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const kE = easeInOut(seg(f, 4, 20));
  const keyX = lerp(1010, 900, kE);
  const keyY = 455 + Math.sin(f / 8) * 3;
  const bagE = easeInOut(seg(f, 8, 22));
  const bagX = lerp(820, 930, bagE);
  const bagY = lerp(720, 600, bagE) - Math.sin(bagE * Math.PI) * 50;
  const rel = seg(f, 24, 32);
  const handX = bagX - 20 - rel * 30;
  const handY = bagY - 44 + rel * 26;
  const coinT = seg(f, 22, 36);
  const flame = 0.85 + Math.sin(f / 3) * 0.1;
  const mx = 300, my = 132, msx = 230, msy = 280;
  const P = (p: [number, number]) => [mx + p[0] * msx, my + p[1] * msy];
  const london = P([0.8, 0.86]);
  const railPts = ([[0.8, 0.86], [0.56, 0.62], [0.43, 0.5], [0.5, 0.33], [0.5, 0.15]] as [number, number][]).map(P);
  const railW = ([[0.8, 0.86], [0.5, 0.84], [0.3, 0.86]] as [number, number][]).map(P);
  return (
    <Frame f={f} seed={5116} bg={C.wallGreen}>
      <g transform={`translate(960 560) scale(${z}) translate(-960 -560)`}>
        {/* 壁紙 (縦じま) と腰板 */}
        <rect x={-40} y={-40} width={2000} height={760} fill={C.wallGreen} />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={-20 + i * 78} y={-40} width={22} height={520} fill={C.wallGreenDark} opacity={0.45} />
        ))}
        <rect x={-40} y={470} width={2000} height={18} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={488} width={2000} height={240} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={20 + i * 220} y={512} width={180} height={150} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 床のじゅうたん */}
        <rect x={-40} y={720} width={2000} height={400} fill={C.carpet} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${i * 150 - 20} 990 l 40 -30 l 40 30 l -40 30 Z`} fill={C.carpetDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 路線地図 (イギリスの形) */}
        <rect x={110} y={100} width={500} height={350} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={130} y={120} width={460} height={310} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={4} />
        <rect x={130} y={120} width={460} height={310} fill={KRP.blueSoft} opacity={0.55} />
        <path d={hmfbPoly(HMFB_GB, mx, my, msx, msy)} fill={C.hillFar} stroke={KRP.ink} strokeWidth={4} />
        <path d={hmfbPoly(HMFB_IE, mx, my, msx, msy)} fill={C.hillFar} stroke={KRP.ink} strokeWidth={4} />
        <polyline points={railPts.map((p) => p.join(",")).join(" ")} fill="none" stroke={KRP.red} strokeWidth={5} strokeLinejoin="round" />
        <polyline points={railW.map((p) => p.join(",")).join(" ")} fill="none" stroke={KRP.red} strokeWidth={5} strokeLinejoin="round" />
        {[...railPts, ...railW].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
        <circle cx={london[0]} cy={london[1]} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <rect x={london[0] - 124} y={london[1] + 12} width={108} height={32} rx={6} fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={2} />
        <text x={london[0] - 118} y={london[1] + 36} fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>ロンドン</text>
        {/* 機関車の版画 */}
        <rect x={760} y={110} width={300} height={190} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={778} y={128} width={264} height={154} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={3} />
        <line x1={790} y1={262} x2={1030} y2={262} stroke={KRP.ink} strokeWidth={3} />
        <HmFbLoco x={930} y={262} s={0.42} f={0} />
        {/* ガス灯 */}
        {[690, 1130].map((lx, i) => (
          <g key={i}>
            <circle cx={lx} cy={240} r={46 * flame} fill={KRP.yellow} opacity={0.25} />
            <path d={`M ${lx} 300 L ${lx} 270`} stroke={KRP.brass} strokeWidth={8} />
            <rect x={lx - 22} y={292} width={44} height={14} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={lx} cy={240} rx={24} ry={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            <ellipse cx={lx} cy={246} rx={7} ry={12 * flame} fill={KRP.orange} />
          </g>
        ))}
        {/* 窓と、外を走る汽車 */}
        <HmFbScenery id="hmfb116win" x={1330} y={120} w={440} h={340} f={f} speed={3}>
          <line x1={1300} y1={428} x2={1800} y2={428} stroke={KRP.ink} strokeWidth={5} />
          <HmFbLoco x={1180 + f * 7} y={426} s={0.62} f={f} />
        </HmFbScenery>
        <rect x={1320} y={110} width={460} height={360} fill="none" stroke={C.woodDark} strokeWidth={18} />
        <line x1={1550} y1={110} x2={1550} y2={470} stroke={C.woodDark} strokeWidth={10} />
        <line x1={1320} y1={290} x2={1780} y2={290} stroke={C.woodDark} strokeWidth={10} />
        <rect x={1300} y={466} width={500} height={20} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1770 90 Q 1830 280 1790 486 L 1880 486 L 1880 90 Z" fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1290} y={80} width={600} height={34} rx={6} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={5} />

        {/* 重役 (机の向こう。一般人) */}
        <Person x={1230} y={800} s={1.35} f={f} phase={1} face={coinT > 0.4 ? "joy" : "smile"} glasses hair="none"
          cloth={C.coatGray} clothDark={C.coatGrayDark} />
        <HmFbOn x={1230} y={800} s={1.35} f={f} phase={1}>
          <ellipse cx={-62} cy={-238} rx={14} ry={26} fill={C.hairGray} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={62} cy={-238} rx={14} ry={26} fill={C.hairGray} stroke={KRP.ink} strokeWidth={4} />
          <HmFbMustache color={C.hairGray} />
          <HmFbShirt />
        </HmFbOn>
        {/* 重役の腕 (鍵を掲げる) */}
        <HmFbArm x1={1150} y1={612} x2={keyX + 196} y2={keyY + 6} w={26} cloth={C.coatGray} />

        {/* 重い机 */}
        <rect x={260} y={612} width={1400} height={42} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={280} y={654} width={1360} height={330} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {[340, 810, 1280].map((px) => (
          <g key={px}>
            <rect x={px} y={690} width={300} height={190} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={px + 150} cy={720} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 机の上: 緑のランプ・書類・インク壺と羽ペン */}
        <rect x={380} y={590} width={60} height={24} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={404} y={520} width={12} height={70} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 340 530 Q 410 490 480 530 L 470 548 L 350 548 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={410} cy={575} rx={70} ry={14} fill={KRP.yellow} opacity={0.3 * flame} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1400 + i * 4} y={584 - i * 9} width={150} height={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${i * 2 - 2} 1475 590)`} />
        ))}
        <rect x={1580} y={580} width={44} height={34} rx={6} fill={C.inkPot} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1604 582 Q 1640 520 1660 470 Q 1650 540 1612 584 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />

        {/* 売る権利の鍵 (駅舎マーク) と札 */}
        <g transform={`translate(${keyX} ${keyY}) scale(${0.85 + 0.15 * pop(seg(f, 0, 10))})`}>
          <line x1={-20} y1={-10} x2={0} y2={-58} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-140} y={-12} width={200} height={24} rx={8} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -140 10 L -140 54 L -118 54 L -118 34 L -100 34 L -100 54 L -82 54 L -82 10 Z" fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={50} y={-20} width={22} height={40} rx={5} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={130} cy={0} r={64} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={130} cy={0} r={46} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={4} />
          <rect x={104} y={-4} width={52} height={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 98 -4 L 130 -30 L 162 -4 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={130} cy={-12} r={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
          <rect x={124} y={8} width={12} height={16} fill={C.woodDark} />
          <path d="M -120 -6 L 40 -6" stroke={KRP.white} strokeWidth={4} opacity={0.5} />
        </g>
        <TagPlate x={900} y={370} text="売る権利" size={44} t={seg(f, 6, 14)} />

        {/* 金貨の袋 */}
        <g transform={`translate(${bagX} ${bagY})`}>
          <path d="M -52 0 Q -68 -50 -26 -78 L 26 -78 Q 68 -50 52 0 Z" fill={C.bagCloth} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -26 -78 Q -36 -98 -20 -100 L 20 -100 Q 36 -98 26 -78" fill={C.bagCloth} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-98} rx={6 + 16 * coinT} ry={5} fill={C.coin} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -28 -80 Q 0 -72 28 -80" fill="none" stroke={C.bagDark} strokeWidth={6} />
          <circle cx={0} cy={-36} r={16} fill={C.coin} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-36} r={8} fill="none" stroke={C.coinDark} strokeWidth={3} />
        </g>
        {/* ちゃりん: 金貨が跳ねて机に落ちる */}
        {coinT > 0 && [-1.6, -0.6, 0.5, 1.5].map((d, i) => {
          const cx = 930 + d * 48 * coinT;
          const cy = lerp(510, 604, coinT) - Math.sin(coinT * Math.PI) * (60 + i * 14);
          const ry = coinT >= 1 ? 7 : 7 + 8 * Math.abs(Math.sin(coinT * Math.PI * 3 + i));
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={16} ry={ry} fill={C.coin} stroke={KRP.ink} strokeWidth={4} />
              {coinT > 0.7 && (
                <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 2 + i)}>
                  <line x1={cx - 22} y1={cy - 20} x2={cx - 32} y2={cy - 34} />
                  <line x1={cx} y1={cy - 24} x2={cx} y2={cy - 40} />
                  <line x1={cx + 22} y1={cy - 20} x2={cx + 32} y2={cy - 34} />
                </g>
              )}
            </g>
          );
        })}
        {coinT > 0.6 && <HmFbSpark x={1000} y={540} r={18 + 6 * Math.sin(f / 3)} />}

        {/* スミス (実在の人物: 後ろ姿だけ。顔は見せない) */}
        <Person x={590} y={1010} s={1.5} f={f} phase={2} hair="none" cloth={C.coatBrown} clothDark={C.coatBrownDark} />
        <HmFbOn x={590} y={1010} s={1.5} f={f} phase={2}>
          {/* 帳簿 (左わき) */}
          <rect x={-122} y={-118} width={56} height={84} rx={4} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8 -94 -76)" />
          <rect x={-116} y={-112} width={8} height={72} fill={C.page} transform="rotate(-8 -94 -76)" />
          {/* ケープ (腕まで覆う) */}
          <path d="M -40 -166 Q -96 -120 -98 -60 Q 0 -44 98 -60 Q 96 -120 40 -166 Z" fill={C.coatBrown} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 0 -160 L 0 -56" stroke={C.coatBrownDark} strokeWidth={4} />
          {/* 後頭部 */}
          <ellipse cx={-64} cy={-222} rx={11} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={64} cy={-222} rx={11} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-228} r={66} fill={C.hairBrown} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -40 -168 Q 0 -150 40 -168 L 36 -156 Q 0 -140 -36 -156 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <HmFbHat kind="top" />
        </HmFbOn>
        {/* スミスの右腕 (袋を置く) */}
        <HmFbArm x1={670} y1={786} x2={handX} y2={handY} w={30} cloth={C.coatBrown} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #117 1840年代の終わりには、汽車で読むための、安い本のシリーズまで登場します。
// 格: 山 / seed 5117
// 絵: どこ: 19世紀の印刷所 (大きな印刷機・紙の山・インク)。年代札「1840年代の終わり」。演出: 印刷機から、同じ大きさの小さな本が次々と刷り出されて積み上がる。本の表紙はまだ白。横の値札に硬貨1枚のマーク (安い)。職人が汗をふく。動き: 印刷機のローラー / 本が積み上がる / 紙が舞う
// どこ: 19世紀の印刷所。レンガの壁・天井の動力軸とベルト・乾かし中の刷り紙のひも・活字ケース・明かり取りの窓
// 演出: 中央の大きな印刷機 (回る胴・インクローラー) から白い表紙の小さな本が次々に滑り出て、右に4つの山が育つ。
//       山に硬貨1枚の値札。左で職人が額の汗をふく (タオル・汗が飛ぶ)。年代札「1840年代の終わり」
// 動き: 胴とローラーが回る・ベルトが流れる / 本がトレイを滑る・山が積み上がる / 刷り紙が舞う / 汗 / 少しパン
const Hm117: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const rot = f * 6;
  const total = Math.floor(lerp(10, 38, seg(f, 0, 40)));
  const caps = [10, 8, 11, 9];
  let rest = total;
  const counts = caps.map((c) => { const n = Math.min(c, Math.max(0, rest)); rest -= n; return n; });
  const sweatCycle = (f % 14) / 14;
  return (
    <Frame f={f} seed={5117} bg={C.brick}>
      <g transform={`translate(${960 - 24 * pan} 560) scale(${1 + 0.03 * pan}) translate(-960 -560)`}>
        {/* レンガの壁 */}
        <rect x={-60} y={-40} width={2040} height={820} fill={C.brick} />
        <g stroke={C.brickDark} strokeWidth={4}>
          {Array.from({ length: 18 }, (_, r) => (
            <g key={r}>
              <line x1={-60} y1={r * 46} x2={1980} y2={r * 46} />
              {Array.from({ length: 23 }, (_, c) => (
                <line key={c} x1={c * 92 + (r % 2) * 46 - 40} y1={r * 46} x2={c * 92 + (r % 2) * 46 - 40} y2={r * 46 + 46} />
              ))}
            </g>
          ))}
        </g>
        {/* 天井の梁と動力軸 */}
        <rect x={-60} y={-40} width={2040} height={90} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-60} y1={80} x2={1980} y2={80} stroke={C.ironDark} strokeWidth={14} />
        <g transform={`translate(820 80) rotate(${rot})`}>
          <circle r={44} fill={C.ironLight} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-40} y1={0} x2={40} y2={0} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-40} x2={0} y2={40} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g strokeDasharray="22 14" strokeDashoffset={-f * 8}>
          <line x1={778} y1={84} x2={680} y2={560} stroke={C.coatBrownDark} strokeWidth={14} />
          <line x1={862} y1={84} x2={760} y2={560} stroke={C.coatBrownDark} strokeWidth={14} />
        </g>
        {/* 明かり取りの窓と光 */}
        <rect x={1440} y={120} width={360} height={250} fill={KRP.blueSoft} stroke={C.woodDark} strokeWidth={14} />
        <line x1={1620} y1={120} x2={1620} y2={370} stroke={C.woodDark} strokeWidth={10} />
        <line x1={1440} y1={245} x2={1800} y2={245} stroke={C.woodDark} strokeWidth={10} />
        <polygon points="1440,370 1800,370 1640,860 1120,860" fill={KRP.white} opacity={0.14} />
        {/* 活字ケース (左の壁) */}
        <rect x={70} y={170} width={250} height={300} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={84 + (i % 4) * 58} y={184 + Math.floor(i / 4) * 46} width={48} height={36} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 乾かし中の刷り紙 */}
        <path d="M 420 190 Q 860 240 1380 190" fill="none" stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => {
          const px = 480 + i * 150;
          const py = 190 + Math.sin(((px - 420) / 960) * Math.PI) * 38;
          const sw = Math.sin(f / 10 + i) * 4;
          return (
            <g key={i} transform={`rotate(${sw} ${px} ${py})`}>
              <rect x={px - 50} y={py} width={100} height={120} fill={C.page} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2, 3, 4].map((j) => <line key={j} x1={px - 36} y1={py + 22 + j * 18} x2={px + 36} y2={py + 22 + j * 18} stroke={C.pageLine} strokeWidth={4} />)}
              <rect x={px - 10} y={py - 10} width={20} height={22} fill={C.woodLight} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 床 */}
        <rect x={-60} y={780} width={2040} height={340} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 50} x2={1980} y2={820 + i * 50} stroke={C.wood} strokeWidth={4} />)}
        <ellipse cx={820} cy={830} rx={340} ry={30} fill={KRP.ink} opacity={0.18} />

        {/* 印刷機 */}
        <polygon points="560,820 610,300 1030,300 1080,820" fill={C.ironDark} stroke={KRP.ink} strokeWidth={7} />
        <polygon points="620,800 650,360 990,360 1020,800" fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(820 560) rotate(${rot})`}>
          <circle r={150} fill={C.ironLight} stroke={KRP.ink} strokeWidth={7} />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={0} y1={-138} x2={0} y2={138} stroke={KRP.ink} strokeWidth={8} transform={`rotate(${a})`} />
          ))}
          <circle r={30} fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {[[660, 380], [980, 380]].map(([rx, ry], i) => (
          <g key={i} transform={`translate(${rx} ${ry}) rotate(${-rot * 2})`}>
            <circle r={50} fill={C.inkPot} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-32} r={8} fill={KRP.white} opacity={0.5} />
          </g>
        ))}
        {/* 給紙台と白い紙 */}
        <polygon points="560,300 900,240 920,262 580,322" fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="640,280 840,246 852,262 652,296" fill={C.page} stroke={KRP.ink} strokeWidth={3} />
        {/* 出口のトレイと、滑り出る本 */}
        <polygon points="1000,630 1320,700 1320,724 1000,654" fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((k) => {
          const u = mod(f * 6 + k * 107, 320) / 320;
          const bx = 1010 + u * 290;
          const by = 618 + u * 64;
          return (
            <g key={k} transform={`translate(${bx} ${by}) rotate(12)`}>
              <rect x={-36} y={-22} width={72} height={22} fill={C.page} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={-36} y={-22} width={72} height={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
            </g>
          );
        })}

        {/* 本の山 (表紙はまだ白) */}
        {counts.map((n, j) => (
          <HmFbStack key={j} x={1420 + j * 128} base={840} n={n} w={112} th={20} seed={5117 + j} />
        ))}
        {/* 硬貨1枚の値札 (2つ目の山に挿す) */}
        <line x1={1560} y1={840 - counts[1] * 20 - 14} x2={1560} y2={520} stroke={C.woodDark} strokeWidth={6} />
        <g transform={`rotate(${Math.sin(f / 9) * 3} 1560 520)`}>
          <rect x={1494} y={436} width={132} height={92} rx={8} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1560} cy={482} r={30} fill={C.coin} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1560} cy={482} r={17} fill="none" stroke={C.coinDark} strokeWidth={4} />
          <HmFbSpark x={1600} y={452} r={12 + 4 * Math.sin(f / 3)} />
        </g>

        {/* 職人 (額の汗をふく) */}
        <Person x={330} y={900} s={1.4} f={f} phase={4} pose="raise" face="smile" cloth={C.navy} clothDark={C.navyDark} />
        <HmFbOn x={330} y={900} s={1.4} f={f} phase={4}>
          <path d="M -52 -150 L 52 -150 L 56 -40 L -56 -40 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-20} cy={-100} r={7} fill={C.inkPot} opacity={0.6} />
          <circle cx={18} cy={-72} r={5} fill={C.inkPot} opacity={0.6} />
          {/* 額のタオル */}
          <path d={`M 56 ${-246 + Math.sin(f / 4) * 4} Q 20 -262 -10 -262 L -6 -246 Q 24 -244 50 -226 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 70 -236 Q 82 -200 70 -170 L 56 -176 Q 66 -204 58 -230 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 飛ぶ汗 */}
          <HmFbSweat x={-80 - sweatCycle * 40} y={-270 + sweatCycle * 30} s={0.9} o={1 - sweatCycle} />
          <HmFbSweat x={-70 - mod(sweatCycle + 0.5, 1) * 40} y={-210 + mod(sweatCycle + 0.5, 1) * 26} s={0.7} o={1 - mod(sweatCycle + 0.5, 1)} />
        </HmFbOn>

        {/* 舞う紙 */}
        {Array.from({ length: 4 }, (_, i) => {
          const px = mod(300 + i * 480 + f * 6, 2100) - 100;
          const py = 300 + i * 40 + Math.sin(f / 7 + i) * 24;
          return (
            <rect key={i} x={px - 30} y={py - 20} width={60} height={40} fill={C.page} stroke={KRP.ink} strokeWidth={3.5}
              transform={`rotate(${Math.sin(f / 6 + i * 2) * 40} ${px} ${py})`} />
          );
        })}
      </g>
      <TagPlate x={400} y={168} text="1840年代の終わり" size={40} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #118 表紙が黄色いので、呼び名は「黄色い本」。そのままです。
// 格: 山 / seed 5118
// 絵: どこ: #117 の印刷所 (続き)。演出: 白い表紙に、職人が刷毛で黄色をべたっと塗ると、本の山が**一斉に黄色**になる。札「黄色い本」。隣で同僚が「そのまんまじゃん」と言いたげに肩をすくめる (face="surprised" 気味・ゆるい顔)。黄色い本の山がきらきら。動き: 刷毛で塗る / 色が広がる / 肩をすくめる
// どこ: #117 と同じ印刷所 (レンガの壁・刷り紙のひも・窓)。作業台に寄ったカメラ
// 演出: 左の職人が刷毛で手前の山の白い表紙に黄色をべたっ → 黄色が波のように隣の山へ広がり、全部の山が一斉に黄色に。
//       右の同僚は「そのまんまじゃん」と目を丸くして肩をすくめる (両手のひらを上に)。黄色い山がきらきら。札「黄色い本」
// 動き: 刷毛が往復 (f4-18) / 黄色が左→右へ伝わる (f12-32) / 肩をすくめる (f28-38) / きらきら / 寄りから引き
const Hm118: React.FC<{ f: number }> = ({ f }) => {
  const zz = lerp(1.12, 1.0, easeInOut(seg(f, 0, 30)));
  const cx = lerp(700, 960, easeInOut(seg(f, 0, 30)));
  const cy = lerp(520, 540, easeInOut(seg(f, 0, 30)));
  const front = [[610, 9], [790, 11], [970, 8], [1150, 10], [1330, 9]] as const;
  const back = [[700, 7], [880, 9], [1060, 6], [1240, 8]] as const;
  const tF = (j: number) => (j === 0 ? easeOut(seg(f, 4, 18)) : easeOut(seg(f, 12 + j * 2.5, 18 + j * 2.5)));
  const tB = (j: number) => easeOut(seg(f, 16 + j * 2.5, 22 + j * 2.5));
  const painting = 1 - seg(f, 18, 24);
  const bx = lerp(600, 620 + Math.sin(f / 2.5) * 40, painting);
  const by = lerp(420, 486, painting);
  const shrug = easeOut(seg(f, 28, 38));
  const sh = Math.sin(f / 4) * 3 * shrug;
  return (
    <Frame f={f} seed={5118} bg={C.brick}>
      <g transform={`translate(960 540) scale(${zz}) translate(${-cx} ${-cy})`}>
        {/* レンガの壁 (#117 と同じ) */}
        <rect x={-60} y={-40} width={2040} height={820} fill={C.brick} />
        <g stroke={C.brickDark} strokeWidth={4}>
          {Array.from({ length: 18 }, (_, r) => (
            <g key={r}>
              <line x1={-60} y1={r * 46} x2={1980} y2={r * 46} />
              {Array.from({ length: 23 }, (_, c) => (
                <line key={c} x1={c * 92 + (r % 2) * 46 - 40} y1={r * 46} x2={c * 92 + (r % 2) * 46 - 40} y2={r * 46 + 46} />
              ))}
            </g>
          ))}
        </g>
        <rect x={-60} y={-40} width={2040} height={90} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1440} y={120} width={360} height={250} fill={KRP.blueSoft} stroke={C.woodDark} strokeWidth={14} />
        <line x1={1620} y1={120} x2={1620} y2={370} stroke={C.woodDark} strokeWidth={10} />
        <line x1={1440} y1={245} x2={1800} y2={245} stroke={C.woodDark} strokeWidth={10} />
        <path d="M 120 150 Q 700 200 1380 150" fill="none" stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => {
          const px = 200 + i * 200;
          const py = 150 + Math.sin(((px - 120) / 1260) * Math.PI) * 40;
          return (
            <g key={i} transform={`rotate(${Math.sin(f / 10 + i) * 4} ${px} ${py})`}>
              <rect x={px - 48} y={py} width={96} height={116} fill={C.page} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2, 3].map((j) => <line key={j} x1={px - 34} y1={py + 24 + j * 20} x2={px + 34} y2={py + 24 + j * 20} stroke={C.pageLine} strokeWidth={4} />)}
              <rect x={px - 10} y={py - 10} width={20} height={22} fill={C.woodLight} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 左端に印刷機の胴 (続きの目印) */}
        <g transform={`translate(-20 560) rotate(${f * 6})`}>
          <circle r={170} fill={C.ironLight} stroke={KRP.ink} strokeWidth={7} />
          {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-156} x2={0} y2={156} stroke={KRP.ink} strokeWidth={8} transform={`rotate(${a})`} />)}
        </g>
        <rect x={-60} y={780} width={2040} height={340} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 50} x2={1980} y2={820 + i * 50} stroke={C.wood} strokeWidth={4} />)}

        {/* 作業台 */}
        <polygon points="420,700 1460,700 1430,620 450,620" fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={420} y={700} width={1040} height={60} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={450} y={760} width={40} height={130} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1390} y={760} width={40} height={130} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 本の山: 奥の列 → 手前の列 */}
        {back.map(([x, n], j) => <HmFbStack key={`b${j}`} x={x} base={650} n={n} w={140} th={22} yellow={tB(j)} seed={5180 + j} />)}
        {front.map(([x, n], j) => <HmFbStack key={`f${j}`} x={x} base={700} n={n} w={150} th={22} yellow={tF(j)} seed={5190 + j} />)}
        {/* 黄色が届いた瞬間の、べたっのしぶき */}
        {front.map(([x, n], j) => {
          const t = j === 0 ? seg(f, 10, 18) : seg(f, 14 + j * 2.5, 22 + j * 2.5);
          if (t <= 0 || t >= 1) return null;
          const ty = 700 - n * 22 - 14;
          return (
            <g key={`s${j}`} opacity={1 - t}>
              {[-1, -0.4, 0.4, 1].map((d, k) => (
                <circle key={k} cx={x + 10 + d * 90 * t} cy={ty - Math.sin(t * Math.PI) * 40 - k * 4} r={9} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
          );
        })}
        {/* きらきら */}
        {f > 30 && Array.from({ length: 8 }, (_, i) => (
          <HmFbSpark key={i} x={560 + i * 120 + rnd(5118, i) * 40} y={400 + rnd(5119, i) * 140}
            r={(14 + 8 * Math.sin(f / 3 + i * 1.7)) * pop(seg(f, 30 + (i % 4), 36 + (i % 4)))} />
        ))}

        {/* 黄色のペンキ缶 */}
        <rect x={470} y={800} width={90} height={80} rx={6} fill={C.ironLight} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={515} cy={800} rx={45} ry={12} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 470 812 Q 476 840 466 856" fill="none" stroke={C.yellowBook} strokeWidth={8} />

        {/* 塗る職人 */}
        <Person x={300} y={900} s={1.4} f={f} phase={4} pose="point" face={f > 22 ? "joy" : "smile"} cloth={C.navy} clothDark={C.navyDark} />
        <HmFbOn x={300} y={900} s={1.4} f={f} phase={4}>
          <path d="M -52 -150 L 52 -150 L 56 -40 L -56 -40 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-14} cy={-110} r={8} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={2} />
          <circle cx={22} cy={-80} r={6} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={2} />
        </HmFbOn>
        {/* 刷毛 */}
        <line x1={514} y1={693} x2={bx} y2={by + 6} stroke={C.woodDark} strokeWidth={14} strokeLinecap="round" />
        <line x1={514} y1={693} x2={bx} y2={by + 6} stroke={C.woodLight} strokeWidth={7} strokeLinecap="round" />
        <g transform={`translate(${bx} ${by}) rotate(${Math.atan2(by - 693, bx - 514) * 57.3 + 90})`}>
          <rect x={-34} y={-30} width={68} height={22} rx={4} fill={C.ironLight} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -34 -8 L 34 -8 L 30 22 L -30 22 Z" fill={C.yellowBook} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={514} cy={693} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />

        {/* 肩をすくめる同僚 */}
        <Person x={1640} y={900 - 6 * shrug} s={1.4} f={f} phase={7} face="surprised" gaze={[-5, 0]} cloth={C.olive} clothDark={C.oliveDark} />
        <HmFbOn x={1640} y={900 - 6 * shrug} s={1.4} f={f} phase={7}>
          <path d="M -52 -150 L 52 -150 L 56 -40 L -56 -40 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={4.5} />
          {[-1, 1].map((sd) => {
            const ex = sd * 67, ey = -70;
            const hx = sd * (70 + 64 * shrug), hy = -70 - (54 * shrug + sh);
            return (
              <g key={sd}>
                <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" />
                <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={C.olive} strokeWidth={22} strokeLinecap="round" />
                <ellipse cx={hx + sd * 6} cy={hy - 6} rx={15} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          })}
          <HmFbSweat x={84} y={-286} s={1} o={shrug} />
        </HmFbOn>
      </g>
      <TagPlate x={960} y={196} text="黄色い本" size={56} t={seg(f, 30, 38)} fill={C.goldLight} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #119 では、なぜ汽車で、本だったのでしょうか。
// 格: 並 / seed 5119
// 絵: どこ: 19世紀の汽車の客車の通路 (木の座席・荷物棚・窓)。演出: 座席に黄色い本が1冊置かれていて、その上に大きな「?」。捜索係ではなく、一般の乗客が首をかしげながら本を手に取る。窓の外を景色が流れる。動き: 「?」が揺れる / 景色の流れ / 本を手に取る
// どこ: 19世紀の汽車の客車の通路。板張りの壁・窓2つ (景色が流れる)・真鍮の荷物棚 (帽子箱・旅行かばん)・ランプ・ビロードの座席・通路のじゅうたん
// 演出: 座席に黄色い本が1冊。山高帽の乗客 (一般人) が首をかしげて本を拾い上げ、目の前にかざして眺める。本の上に大きな「？」
// 動き: 「？」が揺れる / 窓の外が流れる / 本を手に取る (f10-24) / 首をかしげる / 少し寄る
const Hm119: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const lean = -6 + Math.sin(f / 10) * 2;
  const s = 1.38, px = 1480, py = 900;
  const th = (lean * Math.PI) / 180;
  const bob = Math.sin((f + 3 * 17) / 13) * 3;
  const hx = px + s * (-153 * Math.cos(th) - -148 * Math.sin(th));
  const hy = py + bob + s * (-153 * Math.sin(th) + -148 * Math.cos(th));
  const e = easeInOut(seg(f, 10, 24));
  const bkX = lerp(1120, hx - 6, e);
  const bkY = lerp(628, hy - 40, e);
  const bkRot = lerp(-70, -8, e);
  const sway = Math.sin(f / 6) * 2;
  return (
    <Frame f={f} seed={5119} bg={C.woodPale}>
      <g transform={`translate(1200 600) scale(${z}) translate(-1200 ${-600 + sway})`}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={2000} height={840} fill={C.woodPale} />
        <rect x={-40} y={-40} width={2000} height={110} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 92} y1={70} x2={i * 92} y2={800} stroke={C.woodLight} strokeWidth={4} />)}
        {/* 窓 x2 */}
        <HmFbScenery id="hmfb119a" x={370} y={200} w={380} h={260} f={f} speed={5} />
        <HmFbScenery id="hmfb119b" x={850} y={200} w={380} h={260} f={f + 24} speed={5} />
        {[360, 840].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={190} width={400} height={280} rx={18} fill="none" stroke={C.woodDark} strokeWidth={20} />
            <rect x={wx - 20} y={466} width={440} height={18} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${wx - 10} 180 Q ${wx + 20} 330 ${wx - 4} 470 L ${wx - 40} 470 L ${wx - 40} 180 Z`} fill={C.velvet} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 荷物棚と荷物 */}
        <line x1={320} y1={150} x2={1280} y2={150} stroke={C.brassRod} strokeWidth={8} />
        <line x1={320} y1={120} x2={1280} y2={120} stroke={C.brassRod} strokeWidth={8} />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={330 + i * 78} y1={120} x2={340 + i * 78} y2={150} stroke={C.brassRod} strokeWidth={3} />)}
        <rect x={430} y={56} width={110} height={64} rx={10} fill={C.rose} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={485} cy={58} rx={55} ry={12} fill={C.roseDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 930 120 L 940 64 Q 1010 44 1080 64 L 1090 120 Z" fill={C.carpet} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 980 64 Q 1010 30 1040 64" fill="none" stroke={KRP.ink} strokeWidth={6} />
        {/* 隣の区画への扉 */}
        <rect x={1340} y={130} width={330} height={640} rx={10} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1380} y={170} width={250} height={220} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1380} y={430} width={250} height={290} rx={8} fill="none" stroke={C.woodDark} strokeWidth={5} />
        <circle cx={1366} cy={470} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* ランプ */}
        <rect x={1270} y={240} width={16} height={60} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={1278} cy={230} rx={22} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1278} cy={236} rx={6} ry={11 + Math.sin(f / 3) * 2} fill={KRP.orange} />
        {/* 床とじゅうたん */}
        <rect x={-40} y={760} width={2000} height={360} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={830} width={2000} height={200} fill={C.carpet} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${i * 170} 930 l 30 -24 l 30 24 l -30 24 Z`} fill={C.carpetDark} />)}
        {/* 座席 */}
        <HmFbBench x1={340} x2={1260} seatY={650} s={1.15} />
        {/* 座席の上 → 手の中へ: 黄色い本 */}
        <g transform={`translate(${bkX} ${bkY}) rotate(${bkRot}) scale(${lerp(0.85, 1, e)})`}>
          <HmFbBookFace x={0} y={0} w={96} h={136} color={C.yellowBook} dark={C.yellowBookDark} />
        </g>
        {e > 0.5 && <circle cx={hx} cy={hy} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />}
        <QMark x={bkX} y={bkY - 110} s={1.5} f={f} t={seg(f, 2, 10)} />

        {/* 首をかしげる乗客 (一般の人) */}
        <Person x={px} y={py} s={s} f={f} phase={3} pose="point" pointDir={-1} lean={lean} face="worried" gaze={[-6, 3]}
          cloth={C.plum} clothDark={C.plumDark} />
        <HmFbOn x={px} y={py} s={s} f={f} phase={3} lean={lean}>
          <HmFbShirt tie={C.navy} />
          <HmFbMustache />
          <HmFbHat kind="bowler" />
        </HmFbOn>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #120 ある歴史家によると、馬車はせまくて、乗り合わせた人とおしゃべりするのが、ふつうでした。
// 格: 山 / seed 5120
// 絵: どこ: 乗合馬車の車内 (#108 とは別の明るい昼の馬車・向かい合わせ・ひざがくっつくほどせまい)。演出: 乗り合わせた4人が、身を乗り出しておしゃべりで盛り上がっている (face="joy")。吹き出しは字ではなく、音符・笑いのマーク・お茶のマーク。札「〜という説」(小さく)。動き: 吹き出しがぽんぽん / 笑って揺れる / 馬車の揺れ
// どこ: 昼の乗合馬車の車内 (明るい板張り・丸い天井・つり革・窓の外に木と丘)。左右の短いベンチが向かい合わせ、まん中はひざがくっつくほどせまい
// 演出: 4人 (シルクハットの紳士・ボンネットの婦人・年配の婦人・山高帽の青年) が身を乗り出しておしゃべりで大笑い。
//       上に吹き出し (音符・笑い顔・湯気の立つお茶・きらきら) がぽんぽん。足もとにお茶のバスケット。小さく札「〜という説」
// 動き: 吹き出しが順にぽん (f6-30) / 笑って体が揺れる / 馬車がごとごと揺れる
const HmFbChatter: React.FC<{ cx: number; cy: number; t: number; f: number; kind: number }> = ({ cx, cy, t, f, kind }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const bob = Math.sin(f / 5 + kind) * 5;
  return (
    <g transform={`translate(${cx} ${cy + bob}) scale(${sc})`}>
      <ellipse cx={0} cy={0} rx={66} ry={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <path d={kind % 2 ? "M 20 44 L 40 80 L -4 50 Z" : "M -20 44 L -40 80 L 4 50 Z"} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={kind % 2 ? "M 14 40 L 6 50" : "M -14 40 L -6 50"} stroke={KRP.white} strokeWidth={8} />
      {kind === 0 && (
        <g fill={KRP.ink}>
          <ellipse cx={-18} cy={20} rx={13} ry={10} />
          <rect x={-8} y={-30} width={6} height={50} />
          <path d="M -2 -30 Q 22 -22 24 -4 Q 14 -14 -2 -16 Z" />
          <ellipse cx={20} cy={14} rx={11} ry={8} fill={KRP.red} />
          <rect x={28} y={-24} width={5} height={38} fill={KRP.red} />
        </g>
      )}
      {kind === 1 && (
        <g>
          <circle r={34} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -18 -6 Q -11 -16 -4 -6 M 4 -6 Q 11 -16 18 -6" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M -16 6 Q 0 28 16 6 Z" fill={KRP.ink} />
        </g>
      )}
      {kind === 2 && (
        <g stroke={KRP.ink} strokeWidth={4}>
          <path d="M -30 -6 L 24 -6 L 18 26 Q -3 36 -24 26 Z" fill={KRP.white} />
          <path d="M 24 0 Q 42 4 22 18" fill="none" />
          <ellipse cx={-3} cy={32} rx={38} ry={7} fill={KRP.blueSoft} />
          <path d={`M -12 -14 Q ${-20 + Math.sin(f / 3) * 4} -26 -10 -38 M 6 -14 Q ${-2 + Math.sin(f / 3 + 1) * 4} -26 8 -38`} fill="none" strokeLinecap="round" />
        </g>
      )}
      {kind === 3 && (
        <g>
          <HmFbSpark x={-14} y={-4} r={26} color={KRP.yellow} />
          <HmFbSpark x={22} y={18} r={14} color={KRP.orange} />
        </g>
      )}
    </g>
  );
};

const Hm120: React.FC<{ f: number }> = ({ f }) => {
  const shakeY = Math.sin(f / 3) * 3;
  const shakeR = Math.sin(f / 5) * 0.4;
  const s = 1.22, seatY = 700, py = seatY + 58 * s;
  const jig = (i: number) => Math.abs(Math.sin(f / 2.4 + i * 1.3)) * -6;
  type Seat = { x: number; hat: HmFbHatKind; cloth: string; dark: string; skirt?: boolean; face: "joy" | "smile"; ph: number; must?: boolean; hb?: string };
  const left: Seat[] = [
    { x: 470, hat: "top", cloth: C.navy, dark: C.navyDark, face: "joy", ph: 1, must: true },
    { x: 700, hat: "bonnet", cloth: C.rose, dark: C.roseDark, skirt: true, face: "joy", ph: 2 },
  ];
  // 右の2人は左右反転して描く (反転の中で x = 1920 - 画面上の x)
  const right: Seat[] = [
    { x: 1920 - 1220, hat: "bonnet", cloth: C.plum, dark: C.plumDark, skirt: true, face: "joy", ph: 3, hb: C.navy },
    { x: 1920 - 1450, hat: "bowler", cloth: C.olive, dark: C.oliveDark, face: "smile", ph: 4 },
  ];
  const drawSeat = (p: Seat, i: number) => (
    <g key={i} transform={`translate(0 ${jig(i)})`}>
      <Person x={p.x} y={py} s={s} f={f} phase={p.ph} pose="sit" lean={9} face={p.face} gaze={[5, 0]} cloth={p.cloth} clothDark={p.dark} />
      <HmFbOn x={p.x} y={py} s={s} f={f} phase={p.ph} lean={9}>
        {p.skirt ? <HmFbSkirt color={p.cloth} dark={p.dark} /> : <HmFbShirt />}
        {p.must && <HmFbMustache />}
        <HmFbHat kind={p.hat} band={p.hb} />
      </HmFbOn>
    </g>
  );
  return (
    <Frame f={f} seed={5120} bg={C.woodPale}>
      <g transform={`translate(0 ${shakeY}) rotate(${shakeR} 960 540)`}>
        {/* 壁と窓 */}
        <rect x={-40} y={-40} width={2000} height={860} fill={C.woodPale} />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 92} y1={120} x2={i * 92} y2={800} stroke={C.woodLight} strokeWidth={4} />)}
        <HmFbScenery id="hmfb120a" x={300} y={170} w={520} h={260} f={f} speed={2.5} />
        <HmFbScenery id="hmfb120b" x={1100} y={170} w={520} h={260} f={f + 40} speed={2.5} />
        {[300, 1100].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={170} width={520} height={260} rx={40} fill="none" stroke={C.wood} strokeWidth={22} />
            <line x1={wx + 260} y1={170} x2={wx + 260} y2={430} stroke={C.wood} strokeWidth={10} />
          </g>
        ))}
        {/* まん中の柱と小さな鏡 */}
        <rect x={880} y={150} width={160} height={600} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={960} cy={260} rx={50} ry={62} fill={KRP.blueSoft} stroke={C.brassRod} strokeWidth={8} />
        <path d="M 936 236 L 956 216" stroke={KRP.white} strokeWidth={6} opacity={0.7} />
        {/* 丸い天井とつり革 */}
        <path d="M -40 -40 L 1960 -40 L 1960 140 Q 960 60 -40 140 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {[380, 640, 1280, 1540].map((sx, i) => {
          const sw = Math.sin(f / 4 + i) * 6;
          return (
            <g key={sx} transform={`rotate(${sw} ${sx} 110)`}>
              <line x1={sx} y1={110} x2={sx} y2={170} stroke={C.coatBrownDark} strokeWidth={8} />
              <ellipse cx={sx} cy={186} rx={16} ry={20} fill="none" stroke={C.coatBrownDark} strokeWidth={8} />
            </g>
          );
        })}
        {/* 床 */}
        <rect x={-40} y={790} width={2000} height={330} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40} y1={830 + i * 50} x2={1960} y2={830 + i * 50} stroke={C.wood} strokeWidth={4} />)}
        {/* 向かい合わせのベンチ (横から: 背もたれは外側) */}
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(1920 0) scale(-1 1)" : undefined}>
            <rect x={250} y={440} width={70} height={300} rx={18} fill={C.carpet} stroke={KRP.ink} strokeWidth={6} />
            <rect x={300} y={seatY - 16} width={520} height={44} rx={12} fill={C.carpet} stroke={KRP.ink} strokeWidth={6} />
            <rect x={310} y={seatY + 28} width={500} height={70} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 足もとのお茶のバスケット */}
        <g transform="translate(960 800)">
          <path d="M -70 0 L -60 -70 L 60 -70 L 70 0 Z" fill={C.straw} stroke={KRP.ink} strokeWidth={5} />
          {[-40, -10, 20, 50].map((xx) => <line key={xx} x1={xx} y1={-66} x2={xx - 4} y2={-4} stroke={C.bagDark} strokeWidth={3} />)}
          <path d="M -50 -70 Q 0 -140 50 -70" fill="none" stroke={KRP.ink} strokeWidth={7} />
          <rect x={10} y={-110} width={22} height={44} rx={6} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 4人 */}
        {left.map(drawSeat)}
        <g transform="translate(1920 0) scale(-1 1)">{right.map((p, i) => drawSeat(p, i + 2))}</g>
        {/* 吹き出し */}
        <HmFbChatter cx={770} cy={290} t={seg(f, 6, 13)} f={f} kind={0} />
        <HmFbChatter cx={960} cy={420} t={seg(f, 12, 19)} f={f} kind={1} />
        <HmFbChatter cx={1150} cy={290} t={seg(f, 18, 25)} f={f} kind={2} />
        <HmFbChatter cx={1640} cy={330} t={seg(f, 24, 31)} f={f} kind={3} />
      </g>
      <TagPlate x={1690} y={170} text="〜という説" size={30} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #121 ところが汽車には、知らない人が、たくさん乗っています。
// 格: 山 / seed 5121
// 絵: どこ: 19世紀の汽車の大きな客車 (座席がずらり・通路)。演出: カメラが引いていくと、知らない人がどんどん増えて、座席がぎっしり埋まる。誰も話していない。それぞれが違う方向を見ている。動き: カメラが引く / 人が増える / 窓の外の景色
// どこ: 19世紀の汽車の大きな客車を、前から奥へ見通す。左右の壁に窓 (景色が流れる)・天井のランプ・まん中の通路のじゅうたん・座席が4列
// 演出: 最初は手前の2人だけのアップ。カメラが引くと、知らない人がぽんぽん増えて16席がぎっしり。誰も話さず、みんなばらばらの方向を見ている
// 動き: カメラが引く (f0-36) / 人が順に現れる (f6-30) / 窓の外が流れる / ランプが揺れる
const Hm121: React.FC<{ f: number }> = ({ f }) => {
  const ce = easeInOut(seg(f, 0, 36));
  const z = lerp(2.0, 1.0, ce);
  const fx = lerp(760, 960, ce);
  const fy = lerp(560, 540, ce);
  const rows = [
    { s: 0.42, seatY: 520 },
    { s: 0.55, seatY: 585 },
    { s: 0.72, seatY: 670 },
    { s: 0.95, seatY: 790 },
  ];
  const offs = [-400, -200, 200, 400];
  const hats: HmFbHatKind[] = ["top", "bonnet", "bowler", "none", "bonnet", "top", "none", "bowler"];
  const cloths: [string, string][] = [
    [C.navy, C.navyDark], [C.rose, C.roseDark], [C.olive, C.oliveDark], [C.plum, C.plumDark],
    [C.coatBrown, C.coatBrownDark], [C.coatGray, C.coatGrayDark],
  ];
  const gazes: [number, number][] = [[6, -5], [-7, 2], [0, -7], [7, 4], [-6, -5], [3, 7], [-7, 0], [5, -6]];
  const topW = (x: number) => 150 + (300 - 150) * (x / 700);
  const botW = (x: number) => 600 + (500 - 600) * (x / 700);
  const winPoly = (a: number, b: number, mirror: boolean) => {
    const m = (x: number) => (mirror ? 1920 - x : x);
    return `${m(a)},${topW(a)} ${m(b)},${topW(b)} ${m(b)},${botW(b)} ${m(a)},${botW(a)}`;
  };
  const lampSw = Math.sin(f / 7) * 4;
  return (
    <Frame f={f} seed={5121} bg={C.woodPale}>
      <g transform={`translate(960 540) scale(${z}) translate(${-fx} ${-fy})`}>
        {/* 奥の壁と扉 */}
        <rect x={700} y={260} width={520} height={300} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={880} y={300} width={160} height={260} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={900} y={320} width={120} height={90} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
        {/* 左右の壁 */}
        <polygon points="-200,-100 700,260 700,560 -200,1180" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="2120,-100 1220,260 1220,560 2120,1180" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        {[[30, 260], [380, 560]].map(([a, b], i) => (
          <g key={i}>
            <HmFbScenery id={`hmfb121l${i}`} x={a} y={120} w={b - a} h={460} f={f + i * 30} speed={6} poly={winPoly(a, b, false)} />
            <polygon points={winPoly(a, b, false)} fill="none" stroke={C.wood} strokeWidth={14} />
            <HmFbScenery id={`hmfb121r${i}`} x={1920 - b} y={120} w={b - a} h={460} f={f + i * 30 + 60} speed={6} poly={winPoly(a, b, true)} />
            <polygon points={winPoly(a, b, true)} fill="none" stroke={C.wood} strokeWidth={14} />
          </g>
        ))}
        {/* 天井 */}
        <polygon points="-200,-100 2120,-100 1220,260 700,260" fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <line x1={960} y1={-100} x2={960} y2={260} stroke={C.woodDark} strokeWidth={6} />
        {[[960, 150, 1], [960, 250, 0.55]].map(([lx, ly, ls], i) => (
          <g key={i} transform={`rotate(${lampSw} ${lx} ${ly - 60 * ls})`}>
            <line x1={lx} y1={ly - 60 * ls} x2={lx} y2={ly - 24 * ls} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={ly} r={50 * ls} fill={KRP.yellow} opacity={0.25} />
            <ellipse cx={lx} cy={ly} rx={22 * ls} ry={28 * ls} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={lx} cy={ly + 4 * ls} rx={6 * ls} ry={10 * ls} fill={KRP.orange} />
          </g>
        ))}
        {/* 床と通路 */}
        <polygon points="700,560 1220,560 2120,1180 -200,1180" fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="910,560 1010,560 1200,1180 720,1180" fill={C.carpet} stroke={KRP.ink} strokeWidth={4} />
        {/* 座席と乗客 (奥の列から) */}
        {rows.map((r, k) => {
          const xs = offs.map((o) => 960 + o * (r.s / 0.95));
          const py = r.seatY + 58 * r.s;
          return (
            <g key={k}>
              <HmFbBench x1={xs[0] - 110 * r.s} x2={xs[1] + 110 * r.s} seatY={r.seatY} s={r.s} />
              <HmFbBench x1={xs[2] - 110 * r.s} x2={xs[3] + 110 * r.s} seatY={r.seatY} s={r.s} />
              {xs.map((x, j) => {
                const idx = k * 4 + j;
                const t = k === 3 && j <= 1 ? 1 : seg(f, 6 + (15 - idx) * 1.4, 10 + (15 - idx) * 1.4);
                if (t <= 0) return null;
                const sc = pop(t);
                const hat = hats[(idx * 3) % hats.length];
                const [cl, cd] = cloths[idx % cloths.length];
                const woman = hat === "bonnet";
                return (
                  <g key={j} transform={`translate(${x} ${py}) scale(${sc}) translate(${-x} ${-py})`}>
                    <Person x={x} y={py} s={r.s} f={f} phase={idx} pose="sit" face={idx % 3 === 0 ? "worried" : "normal"}
                      gaze={gazes[idx % gazes.length]} cloth={cl} clothDark={cd} />
                    <HmFbOn x={x} y={py} s={r.s} f={f} phase={idx}>
                      {woman ? <HmFbSkirt color={cl} dark={cd} /> : <HmFbShirt />}
                      {!woman && idx % 2 === 1 && <HmFbMustache />}
                      <HmFbHat kind={hat} />
                    </HmFbOn>
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #122 目のやり場に、困る。
// 格: 山 / seed 5122
// 絵: どこ: 客車の向かい合わせの席 (アップ)。演出: 向かい合った知らない2人の**目線がぶつかり**、あわてて2人とも天井・窓・足元へ目をそらす (目だけがきょろきょろ動く)。間の空気に、緊張の小さな汗のしずくと「…」の吹き出し。動き: 目が合う (f10) / そらす (f14-30) / 汗
// どこ: 客車の向かい合わせの席のアップ。2人のあいだの奥に窓 (景色が流れる)・カーテン・荷物棚。#123 も同じ席
// 演出: シルクハットの紳士と、ボンネットの婦人 (どちらも知らない同士)。ふと目線がぶつかって火花 → あわてて紳士は天井→床→天井、
//       婦人は床→窓→床へと目だけきょろきょろ。2人の頭に汗、あいだに「…」の吹き出しと、ぴりぴりした緊張のギザギザ
// 動き: 目が合う (f8-13) / そらす (f14-30) / 汗 / 「…」が出る / ゆっくり寄る
const HMFB_L = { x: 600, y: 886, s: 2.0 };
const HMFB_R = { x: 1320, y: 886, s: 2.0 };
/** #122・#123 の向かい合わせの席 (背景) */
const HmFbCompartment: React.FC<{ f: number; id: string }> = ({ f, id }) => (
  <g>
    <rect x={-60} y={-60} width={2040} height={900} fill={C.woodPale} />
    {Array.from({ length: 23 }, (_, i) => <line key={i} x1={i * 92} y1={110} x2={i * 92} y2={840} stroke={C.woodLight} strokeWidth={4} />)}
    <HmFbScenery id={id} x={770} y={170} w={380} h={330} f={f} speed={5} />
    <rect x={760} y={160} width={400} height={350} rx={22} fill="none" stroke={C.woodDark} strokeWidth={20} />
    <path d="M 770 150 Q 800 330 780 520 L 730 520 L 730 150 Z" fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 1150 150 Q 1120 330 1140 520 L 1190 520 L 1190 150 Z" fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
    <rect x={700} y={130} width={520} height={30} rx={6} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-60} y={-60} width={2040} height={130} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-60} y1={100} x2={1980} y2={100} stroke={C.brassRod} strokeWidth={8} />
    <rect x={-60} y={840} width={2040} height={300} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
    <HmFbBench x1={360} x2={840} seatY={770} s={1.7} />
    <HmFbBench x1={1080} x2={1560} seatY={770} s={1.7} />
  </g>
);
/** 紳士 (左) */
const HmFbGent: React.FC<{ f: number; gaze: [number, number]; face: "normal" | "worried" | "surprised" | "smile" }> = ({ f, gaze, face }) => (
  <g>
    <Person x={HMFB_L.x} y={HMFB_L.y} s={HMFB_L.s} f={f} phase={5} pose="sit" face={face} gaze={gaze} cloth={C.navy} clothDark={C.navyDark} />
    <HmFbOn x={HMFB_L.x} y={HMFB_L.y} s={HMFB_L.s} f={f} phase={5}>
      <HmFbShirt />
      <HmFbMustache />
      <HmFbHat kind="top" />
    </HmFbOn>
  </g>
);
/** 婦人 (右)。左右反転で描くので gaze の x は反対にして渡す */
const HmFbLady: React.FC<{ f: number; gaze: [number, number]; face: "normal" | "worried" | "surprised" | "smile" }> = ({ f, gaze, face }) => (
  <g transform="translate(2640 0) scale(-1 1)">
    <Person x={HMFB_R.x} y={HMFB_R.y} s={HMFB_R.s} f={f} phase={8} pose="sit" face={face} gaze={[-gaze[0], gaze[1]]} cloth={C.rose} clothDark={C.roseDark} />
    <HmFbOn x={HMFB_R.x} y={HMFB_R.y} s={HMFB_R.s} f={f} phase={8}>
      <HmFbSkirt color={C.rose} dark={C.roseDark} />
      <HmFbHat kind="bonnet" />
    </HmFbOn>
  </g>
);

const Hm122: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const meet = f >= 8 && f < 14;
  const gL: [number, number] =
    f < 8 ? [-3, -6] : f < 14 ? [7, 0] : f < 22 ? [1, -8] : f < 30 ? [-4, 8] : [-6, -6];
  const gR: [number, number] =
    f < 8 ? [3, 7] : f < 14 ? [-7, 0] : f < 22 ? [2, 8] : f < 30 ? [7, -3] : [5, 7];
  const spark = seg(f, 8, 13);
  const sw = seg(f, 14, 20);
  const drip = (f % 20) / 20;
  const eyeY = HMFB_L.y - 222 * HMFB_L.s;
  return (
    <Frame f={f} seed={5122} bg={C.woodPale}>
      <g transform={`translate(960 520) scale(${z}) translate(-960 -520)`}>
        <HmFbCompartment f={f} id="hmfb122win" />
        <HmFbGent f={f} gaze={gL} face={f < 8 ? "normal" : f < 14 ? "surprised" : "worried"} />
        <HmFbLady f={f} gaze={gR} face={f < 8 ? "normal" : f < 14 ? "surprised" : "worried"} />
        {/* 目線がぶつかる */}
        {meet && (
          <g>
            <line x1={HMFB_L.x + 60} y1={eyeY} x2={940} y2={eyeY} stroke={KRP.red} strokeWidth={6} strokeDasharray="18 12" />
            <line x1={HMFB_R.x - 60} y1={eyeY} x2={980} y2={eyeY} stroke={KRP.red} strokeWidth={6} strokeDasharray="18 12" />
          </g>
        )}
        {spark > 0 && f < 18 && (
          <g transform={`translate(960 ${eyeY}) scale(${pop(spark) * (f < 14 ? 1 : 1 - seg(f, 14, 18))})`}>
            <path d="M 0 -60 L 14 -18 L 58 -24 L 22 6 L 40 50 L 0 22 L -40 50 L -22 6 L -58 -24 L -14 -18 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
        {/* 汗 */}
        <HmFbSweat x={HMFB_L.x + 130} y={330 + drip * 30} s={1.6} o={sw * (1 - drip * 0.5)} />
        <HmFbSweat x={HMFB_L.x + 150} y={420} s={1.1} o={sw} />
        <HmFbSweat x={HMFB_R.x - 150} y={360 + mod(drip + 0.5, 1) * 30} s={1.6} o={sw * (1 - mod(drip + 0.5, 1) * 0.5)} />
        {/* 緊張のギザギザ */}
        {f >= 14 && (
          <g stroke={KRP.red} strokeWidth={6} fill="none" strokeLinejoin="round" opacity={0.6 + 0.4 * Math.sin(f * 1.3)}>
            {[580, 660].map((yy, i) => (
              <path key={i} d={`M 900 ${yy} l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14`}
                transform={`translate(${Math.sin(f + i) * 4} 0)`} />
            ))}
          </g>
        )}
        {/* 「…」の吹き出し */}
        {f >= 18 && (
          <g transform={`translate(960 270) scale(${pop(seg(f, 18, 26))})`}>
            <ellipse cx={0} cy={0} rx={110} ry={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -10 58 L 0 96 L 20 56" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -14 54 L 16 54" stroke={KRP.white} strokeWidth={8} />
            {[-40, 0, 40].map((dx, i) => (f >= 22 + i * 3 ? <circle key={dx} cx={dx} cy={6} r={11} fill={KRP.ink} /> : null))}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #123 その気まずい沈黙を、本で埋めるようになった、というのです。
// 格: 山 / seed 5123
// 絵: どこ: #122 の向かい合わせの席 (続き)。演出: 片方がさっと黄色い本を開いて顔の前に立てる → もう片方も慌てて本を開く。2人とも本で顔が隠れて、気まずさの汗が消え、落ち着いた空気に (緊張の線がほどける)。札「〜という説」(小さく)。動き: 本がぱっと開く / 汗が消える / ページがめくれる
// どこ: #122 と同じ向かい合わせの席 (続き)
// 演出: 紳士がさっと黄色い本を開いて顔の前に立てる → 婦人も慌てて (本がぐらぐら) 本を開いて立てる。2人とも顔が本の陰に。
//       汗と「…」と緊張のギザギザが消え、ゆるい波線とほっとした湯気に変わる。ページがめくれる。小さく札「〜という説」
// 動き: 紳士の本がぱっと開く (f4-12) / 婦人の本 (f14-22・ぐらぐら) / 汗が消える (f24-32) / ページがめくれる (f32-42)
const Hm123: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.05 - 0.03 * easeInOut(seg(f, 0, 42));
  const e1 = easeOut(seg(f, 4, 12));
  const e2 = easeOut(seg(f, 14, 22));
  const wob = (1 - seg(f, 22, 30)) * (e2 > 0 ? Math.sin(f * 1.6) * 10 : 0);
  const b1y = lerp(700, 450, e1);
  const b2y = lerp(700, 455, e2);
  const tense = 1 - seg(f, 20, 30);
  const calm = seg(f, 28, 36);
  const sweatO = 1 - seg(f, 24, 32);
  const handsL = (by: number, open: number) => {
    const half = 150 * (0.35 + 0.65 * open);
    return [HMFB_L.x - half + 10, by + 70, HMFB_L.x + half - 10, by + 70];
  };
  const [l1x, l1y, l2x, l2y] = handsL(b1y, e1);
  const half2 = 150 * (0.35 + 0.65 * e2);
  const eyeY = HMFB_L.y - 222 * HMFB_L.s;
  return (
    <Frame f={f} seed={5123} bg={C.woodPale}>
      <g transform={`translate(960 520) scale(${z}) translate(-960 -520)`}>
        <HmFbCompartment f={f} id="hmfb123win" />
        <HmFbGent f={f} gaze={[1, -8]} face="worried" />
        <HmFbLady f={f} gaze={[5, 7]} face="worried" />
        {/* 紳士の腕と本 */}
        <HmFbArm x1={HMFB_L.x - 196} y1={742} x2={l1x} y2={l1y} w={40} cloth={C.navy} />
        <HmFbArm x1={HMFB_L.x + 196} y1={742} x2={l2x} y2={l2y} w={40} cloth={C.navy} />
        <HmFbBookOpenBack x={HMFB_L.x} y={b1y} w={300} h={250} open={e1} color={C.yellowBook} dark={C.yellowBookDark} flip={seg(f, 32, 40)} />
        <circle cx={l1x} cy={l1y - 40} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={l2x} cy={l2y - 40} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 婦人の腕と本 (ぐらぐら) */}
        <HmFbArm x1={HMFB_R.x - 196} y1={742} x2={HMFB_R.x - half2 + 10} y2={b2y + 70} w={40} cloth={C.rose} />
        <HmFbArm x1={HMFB_R.x + 196} y1={742} x2={HMFB_R.x + half2 - 10} y2={b2y + 70} w={40} cloth={C.rose} />
        <HmFbBookOpenBack x={HMFB_R.x} y={b2y} w={300} h={250} open={e2} color={C.yellowBook} dark={C.yellowBookDark} rot={wob} flip={seg(f, 36, 42)} />
        <circle cx={HMFB_R.x - half2 + 10} cy={b2y + 30} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={HMFB_R.x + half2 - 10} cy={b2y + 30} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 婦人の慌てた動きの線 */}
        {e2 > 0 && wob !== 0 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
            <path d={`M ${HMFB_R.x + 190} ${b2y - 80} q 20 10 10 30`} fill="none" />
            <path d={`M ${HMFB_R.x + 200} ${b2y + 10} q 20 10 10 30`} fill="none" />
            <path d={`M ${HMFB_R.x - 190} ${b2y - 80} q -20 10 -10 30`} fill="none" />
          </g>
        )}
        {/* 消えていく汗 */}
        <HmFbSweat x={HMFB_L.x + 150} y={330} s={1.6} o={sweatO} />
        <HmFbSweat x={HMFB_R.x - 150} y={360} s={1.6} o={sweatO} />
        {/* 緊張のギザギザ → ゆるい波線 */}
        {tense > 0 && (
          <g stroke={KRP.red} strokeWidth={6} fill="none" strokeLinejoin="round" opacity={tense * 0.9}>
            {[580, 660].map((yy, i) => (
              <path key={i} d={`M 900 ${yy} l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14`}
                transform={`translate(${Math.sin(f + i) * 4} 0)`} />
            ))}
          </g>
        )}
        {calm > 0 && (
          <g stroke={KRP.green} strokeWidth={7} fill="none" strokeLinecap="round" opacity={calm}>
            {[580, 660].map((yy, i) => (
              <path key={i} d={`M 890 ${yy} q 20 ${-14 + Math.sin(f / 5 + i) * 4} 45 0 q 25 ${14 - Math.sin(f / 5 + i) * 4} 45 0 q 25 -14 45 0`} />
            ))}
          </g>
        )}
        {/* 「…」が消える */}
        {tense > 0 && (
          <g transform={`translate(960 270) scale(${tense})`} opacity={tense}>
            <ellipse cx={0} cy={0} rx={110} ry={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -10 58 L 0 96 L 20 56" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -14 54 L 16 54" stroke={KRP.white} strokeWidth={8} />
            {[-40, 0, 40].map((dx) => <circle key={dx} cx={dx} cy={6} r={11} fill={KRP.ink} />)}
          </g>
        )}
        {/* ほっとした湯気 */}
        {calm > 0 && [HMFB_L.x + 170, HMFB_R.x - 170].map((hx, i) => {
          const u = mod(f / 14 + i * 0.5, 1);
          return (
            <g key={i} opacity={calm * (1 - u)}>
              <circle cx={hx + (i ? -1 : 1) * u * 30} cy={eyeY - 40 - u * 60} r={18 + u * 14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={hx + (i ? -1 : 1) * (u * 30 + 26)} cy={eyeY - 70 - u * 60} r={11 + u * 8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      <TagPlate x={1690} y={180} text="〜という説" size={30} t={seg(f, 30, 38)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #124 暇つぶしは、知らない人とのあいだの、ついたてにもなりました。
// 格: 山 / seed 5124
// 絵: どこ: 客車の全景 (上から見下ろす)。演出: 乗客全員が本を顔の前に立てていて、上から見ると、**本が小さなついたて (屏風)** のように並んで、席と席を区切っている。本がそのまま屏風の絵柄に変わる比喩 (一瞬だけ屏風の金色に光る)。動き: 本が並んで立つ / 屏風の光 / 汽車の揺れ
// どこ: 走る客車を真上から見下ろす (屋根を外した断面)。外は草地と線路の枕木 (流れて走っているのが分かる)。床板・通路・向かい合わせの座席6列
// 演出: 24人の乗客 (上から見た帽子と肩) が、顔の前に開いた黄色い本を立てる。上から見ると本は「く」の字の小さなついたて。
//       それがつながって、席と席のあいだに金色の屏風 (松の模様) がぱっと立ち並ぶ
// 動き: 本が順に立つ (f4-24) / 屏風の金色が光る (f26-36) / 地面が流れる / 汽車の揺れ / カメラがゆっくり回り込む
type HmFbTopP = { x: number; y: number; dir: 1 | -1; hat: HmFbHatKind; cloth: string; i: number };
const HmFbTopPassenger: React.FC<{ p: HmFbTopP; f: number }> = ({ p, f }) => {
  const { x, y, dir, hat, cloth } = p;
  const nod = Math.sin(f / 9 + p.i) * 1.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-dir * 6} cy={0} rx={30} ry={42} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      {[-1, 1].map((sd) => (
        <line key={sd} x1={0} y1={sd * 30} x2={dir * 44} y2={sd * 22} stroke={cloth} strokeWidth={14} strokeLinecap="round" />
      ))}
      {[-1, 1].map((sd) => <circle key={`h${sd}`} cx={dir * 46} cy={sd * 22} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
      <g transform={`translate(${dir * (4 + nod)} 0)`}>
        {hat === "top" || hat === "bowler" ? (
          <g>
            <circle r={hat === "top" ? 32 : 30} fill={C.hatBlack} stroke={KRP.ink} strokeWidth={4} />
            <circle r={20} fill={C.hatBlack} stroke={KRP.white} strokeWidth={2} opacity={0.9} />
          </g>
        ) : hat === "bonnet" ? (
          <g>
            <ellipse rx={27} ry={30} fill={C.straw} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -16 -20 Q 0 -32 16 -20" stroke={C.ribbon} strokeWidth={6} fill="none" />
          </g>
        ) : (
          <circle r={24} fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4} />
        )}
      </g>
    </g>
  );
};

const Hm124: React.FC<{ f: number }> = ({ f }) => {
  const rot = lerp(0, -3, easeInOut(seg(f, 0, 42)));
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const sway = Math.sin(f / 4) * 3;
  const flow = f * 14;
  const gold = seg(f, 26, 34) - 0.3 * clamp01((f - 40) / 20);
  const hats: HmFbHatKind[] = ["top", "bonnet", "bowler", "none", "bonnet", "top"];
  const cloths = [C.navy, C.rose, C.olive, C.plum, C.coatBrown, C.coatGray];
  const ps: HmFbTopP[] = [];
  for (let c = 0; c < 6; c++) {
    const xc = 330 + c * 252;
    const dir: 1 | -1 = c % 2 === 0 ? 1 : -1;
    [385, 465, 615, 695].forEach((yy, k) => {
      const i = c * 4 + k;
      ps.push({ x: xc, y: yy, dir, hat: hats[(i * 5) % hats.length], cloth: cloths[(i * 7) % cloths.length], i });
    });
  }
  return (
    <Frame f={f} seed={5124} bg={C.hill}>
      <g transform={`translate(960 540) rotate(${rot}) scale(${z}) translate(-960 -540)`}>
        {/* 草地 (流れる) */}
        <rect x={-300} y={-300} width={2520} height={1680} fill={C.hill} />
        {Array.from({ length: 40 }, (_, i) => {
          const gx = mod(i * 173 - flow, 2600) - 340;
          const gy = (i * 97) % 1300 - 120;
          return <path key={i} d={`M ${gx} ${gy} l 8 -18 l 8 18 l 8 -14`} stroke={C.tree} strokeWidth={4} fill="none" />;
        })}
        {/* 線路と枕木 */}
        {Array.from({ length: 34 }, (_, i) => (
          <rect key={i} x={mod(i * 80 - flow, 2720) - 400} y={300} width={30} height={480} fill={C.trunk} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <rect x={-300} y={350} width={2520} height={14} fill={C.ironLight} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-300} y={716} width={2520} height={14} fill={C.ironLight} stroke={KRP.ink} strokeWidth={3} />
        {/* 客車 (屋根なし) */}
        <g transform={`translate(0 ${sway})`}>
          <rect x={150} y={290} width={1620} height={500} rx={20} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={176} y={316} width={1568} height={448} fill={C.woodPale} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={176} y1={316 + i * 41} x2={1744} y2={316 + i * 41} stroke={C.woodLight} strokeWidth={3} />)}
          <rect x={176} y={520} width={1568} height={40} fill={C.carpet} stroke={KRP.ink} strokeWidth={3} />
          {/* 窓 (壁の切れ目) */}
          {Array.from({ length: 6 }, (_, c) => (
            <g key={c}>
              <rect x={290 + c * 252} y={290} width={80} height={26} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
              <rect x={290 + c * 252} y={764} width={80} height={26} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 座席 (背もたれ) */}
          {Array.from({ length: 6 }, (_, c) => {
            const xc = 330 + c * 252;
            const dir = c % 2 === 0 ? 1 : -1;
            return (
              <g key={c}>
                <rect x={xc - dir * 60 - 18} y={330} width={36} height={180} rx={8} fill={C.velvet} stroke={KRP.ink} strokeWidth={4} />
                <rect x={xc - dir * 60 - 18} y={570} width={36} height={180} rx={8} fill={C.velvet} stroke={KRP.ink} strokeWidth={4} />
                <rect x={xc - 40} y={336} width={80} height={168} rx={8} fill={C.velvetDark} opacity={0.5} />
                <rect x={xc - 40} y={576} width={80} height={168} rx={8} fill={C.velvetDark} opacity={0.5} />
              </g>
            );
          })}
          {/* 金色の屏風 (向かい合う席のあいだ) */}
          {gold > 0 && [0, 2, 4].map((c) => {
            const mx = 330 + c * 252 + 126;
            return [[335, 505], [575, 745]].map(([y1, y2], k) => {
              const pts = [0, 1, 2, 3, 4].map((j) => `${mx + (j % 2 ? 14 : -14)},${y1 + ((y2 - y1) * j) / 4}`).join(" ");
              return (
                <g key={`${c}-${k}`} opacity={gold}>
                  <polyline points={pts} fill="none" stroke={KRP.ink} strokeWidth={22} strokeLinejoin="round" />
                  <polyline points={pts} fill="none" stroke={C.gold} strokeWidth={14} strokeLinejoin="round" />
                  {[1, 3].map((j) => <circle key={j} cx={mx} cy={y1 + ((y2 - y1) * (j + 0.5)) / 4} r={7} fill={C.pine} />)}
                  <ellipse cx={mx} cy={(y1 + y2) / 2} rx={60} ry={100} fill={C.goldLight} opacity={0.25 * (1 + Math.sin(f / 3))} />
                </g>
              );
            });
          })}
          {/* 乗客と本 */}
          {ps.map((p) => {
            const t = easeOut(seg(f, 4 + (p.i % 12) * 1.5, 9 + (p.i % 12) * 1.5));
            const bx = p.x + p.dir * 70;
            const tip = bx - p.dir * 28 * t;
            const col = gold > 0.5 ? C.gold : C.yellowBook;
            return (
              <g key={p.i}>
                <HmFbTopPassenger p={p} f={f} />
                {t > 0 && (
                  <g>
                    <polyline points={`${tip},${p.y - 34 * t} ${bx},${p.y} ${tip},${p.y + 34 * t}`} fill="none" stroke={KRP.ink} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" />
                    <polyline points={`${tip},${p.y - 34 * t} ${bx},${p.y} ${tip},${p.y + 34 * t}`} fill="none" stroke={col} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
          {gold > 0.3 && Array.from({ length: 6 }, (_, i) => (
            <HmFbSpark key={i} x={456 + (i % 3) * 504} y={i < 3 ? 420 : 660} r={16 + 8 * Math.sin(f / 2.5 + i)} o={gold} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #125 いまの電車で、みんながスマホを見ているのと、ちょっと似ています。
// 格: 山 / seed 5125
// 絵: どこ: 画面を左右に割る。左は19世紀の客車 (乗客が本を顔の前に)、右は現代の電車 (乗客が Sumaho を顔の前に)。演出: 左右の乗客が**まったく同じ姿勢**でうつむいている。左の本の黄色と、右のスマホの光が同時に光る。真ん中に「=」ではなく、小さな「≒」の札。動き: 左右の乗客が同時にページをめくる・スワイプする / 光
// どこ: 画面を左右に割る。左=19世紀の客車 (板張り・ビロードの座席・田園の窓)、右=いまの電車 (白い壁・青い座席・つり革・ビルの窓)
// 演出: 左右2人ずつ、まったく同じ姿勢 (ひじを張って手元を見下ろす)。左は黄色い本、右は Sumaho。本の黄色とスマホの光が同時にふわっと光る。
//       札「19世紀」「いま」(同じ高さ) と、まん中に小さく「≒」
// 動き: 左がページをめくる瞬間と右がスワイプする瞬間がそろう (f20-28・f34-42) / 光の明滅がそろう / 窓の外が流れる
const Hm125: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.03 * easeInOut(seg(f, 0, 42));
  const s = 1.25, seatY = 760, py = seatY + 58 * s;
  const glow = 0.55 + 0.45 * Math.sin(f / 5);
  const fl1 = seg(f, 20, 28), fl2 = seg(f, 34, 42);
  const flip = fl1 > 0 && fl1 < 1 ? fl1 : fl2;
  const swipe = fl1 > 0 && fl1 < 1 ? fl1 : fl2 > 0 && fl2 < 1 ? fl2 : 0;
  const itemY = py - 148 * s;
  const elbows = (x: number) => [x - 98 * s, py - 72 * s, x + 98 * s, py - 72 * s];
  const person = (x: number, ph: number, cloth: string, dark: string, hat: HmFbHatKind, skirt: boolean, armCloth: string, item: "book" | "phone") => {
    const [ex1, ey1, ex2, ey2] = elbows(x);
    return (
      <g key={x}>
        <Person x={x} y={py} s={s} f={f} phase={ph} pose="sit" face="normal" gaze={[0, 8]} cloth={cloth} clothDark={dark} />
        <HmFbOn x={x} y={py} s={s} f={f} phase={ph}>
          {skirt ? <HmFbSkirt color={cloth} dark={dark} /> : item === "book" ? <HmFbShirt /> : null}
          <HmFbHat kind={hat} />
        </HmFbOn>
        {item === "book" ? (
          <g>
            <ellipse cx={x} cy={itemY + 30} rx={110} ry={70} fill={C.yellowBook} opacity={0.35 * glow} />
            <HmFbArm x1={ex1} y1={ey1} x2={x - 62} y2={itemY + 56} w={26} cloth={armCloth} />
            <HmFbArm x1={ex2} y1={ey2} x2={x + 62} y2={itemY + 56} w={26} cloth={armCloth} />
            {/* 開いた本を上から見下ろす */}
            <g transform={`translate(${x} ${itemY + 30})`}>
              <path d="M -78 -40 L 0 -34 L 78 -40 L 78 40 L 0 46 L -78 40 Z" fill={C.yellowBook} stroke={KRP.ink} strokeWidth={4.5} />
              <path d="M -70 -34 L 0 -28 L 70 -34 L 70 34 L 0 40 L -70 34 Z" fill={C.page} stroke={KRP.ink} strokeWidth={3} />
              <line x1={0} y1={-28} x2={0} y2={40} stroke={KRP.ink} strokeWidth={3} />
              {[-50, -30, 30, 50].map((lx) => <line key={lx} x1={lx} y1={-20} x2={lx} y2={28} stroke={C.pageLine} strokeWidth={3} />)}
              {flip > 0 && flip < 1 && (
                <path d={`M 0 -28 L ${70 * Math.cos(Math.PI * flip)} ${-34 - 16 * Math.sin(Math.PI * flip)} L ${70 * Math.cos(Math.PI * flip)} ${34 - 16 * Math.sin(Math.PI * flip)} L 0 40 Z`}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              )}
            </g>
          </g>
        ) : (
          <g>
            <HmFbArm x1={ex1} y1={ey1} x2={x - 40} y2={itemY + 80} w={26} cloth={armCloth} />
            <Sumaho x={x} y={itemY + 46} s={0.36} f={f} screen="feed" glow={glow} />
            <HmFbArm x1={ex2} y1={ey2} x2={x + 26} y2={itemY + 76 - 60 * swipe} w={26} cloth={armCloth} />
          </g>
        )}
      </g>
    );
  };
  return (
    <Frame f={f} seed={5125} bg={C.woodPale}>
      <defs>
        <clipPath id="hmfb125L"><polygon points="-40,-40 968,-40 948,240 972,520 950,820 966,1120 -40,1120" /></clipPath>
        <clipPath id="hmfb125R"><polygon points="968,-40 1960,-40 1960,1120 966,1120 950,820 972,520 948,240" /></clipPath>
      </defs>
      <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
        {/* 左: 19世紀の客車 */}
        <g clipPath="url(#hmfb125L)">
          <rect x={-40} y={-40} width={1040} height={1160} fill={C.woodPale} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 92} y1={80} x2={i * 92} y2={840} stroke={C.woodLight} strokeWidth={4} />)}
          <rect x={-40} y={-40} width={1040} height={110} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <HmFbScenery id="hmfb125wl" x={140} y={250} w={680} h={230} f={f} speed={4} />
          <rect x={130} y={240} width={700} height={250} rx={20} fill="none" stroke={C.woodDark} strokeWidth={18} />
          <line x1={480} y1={240} x2={480} y2={490} stroke={C.woodDark} strokeWidth={10} />
          <rect x={-40} y={890} width={1040} height={240} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <HmFbBench x1={110} x2={850} seatY={seatY} s={1.25} />
          {person(300, 2, C.navy, C.navyDark, "top", false, C.navy, "book")}
          {person(660, 5, C.rose, C.roseDark, "bonnet", true, C.rose, "book")}
        </g>
        {/* 右: いまの電車 */}
        <g clipPath="url(#hmfb125R)">
          <rect x={920} y={-40} width={1040} height={1160} fill={C.modernWall} />
          <rect x={920} y={-40} width={1040} height={110} fill={C.modernWallDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={920} y1={100} x2={1960} y2={100} stroke={C.ironLight} strokeWidth={10} />
          {[1060, 1230, 1660, 1830].map((hx, i) => (
            <g key={hx} transform={`rotate(${Math.sin(f / 5 + i) * 5} ${hx} 100)`}>
              <line x1={hx} y1={100} x2={hx} y2={168} stroke={C.ironLight} strokeWidth={6} />
              <path d={`M ${hx - 22} 168 L ${hx + 22} 168 L ${hx + 18} 210 Q ${hx} 222 ${hx - 18} 210 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          <HmFbScenery id="hmfb125wr" x={1100} y={250} w={680} h={230} f={f} speed={4} kind="city" />
          <rect x={1090} y={240} width={700} height={250} rx={14} fill="none" stroke={C.ironLight} strokeWidth={16} />
          <rect x={1090} y={240} width={700} height={250} rx={14} fill="none" stroke={KRP.ink} strokeWidth={4} />
          <rect x={920} y={890} width={1040} height={240} fill={C.modernFloor} stroke={KRP.ink} strokeWidth={5} />
          <HmFbBench x1={1070} x2={1810} seatY={seatY} s={1.25} color={C.modernSeat} dark={C.modernSeatDark} />
          {person(1260, 3, C.coatGray, C.coatGrayDark, "none", false, C.coatGray, "phone")}
          {person(1620, 4, KRP.green, C.oliveDark, "none", false, KRP.green, "phone")}
        </g>
        {/* 割れ目 */}
        <polyline points="968,-40 948,240 972,520 950,820 966,1120" fill="none" stroke={KRP.ink} strokeWidth={10} strokeLinejoin="round" />
      </g>
      <TagPlate x={480} y={180} text="19世紀" size={40} t={seg(f, 2, 10)} />
      <TagPlate x={1440} y={180} text="いま" size={40} t={seg(f, 2, 10)} />
      <TagPlate x={960} y={560} text="≒" size={64} t={seg(f, 10, 18)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #126 日本でも、大正のころには、東京にもう満員電車が走っていました。
// 格: 山 / seed 5126
// 絵: どこ: 大正の東京の電車 (木の車体・パンタグラフ・窓)。年代札「大正」、地名札「東京」。演出: 電車のドアから乗客 (学生服・着物・帽子) がはみ出しそうなほどぎゅうぎゅう。駅員が後ろから押しこむ。帽子が1つ飛ぶ。動き: ぎゅうぎゅうに揺れる / 押しこむ / 帽子が飛ぶ
// どこ: 大正の東京の駅のホーム。茶色い木の車体の電車 (クリームの帯・パンタグラフ・架線)・奥にレンガの建物・石のホーム
// 演出: まん中のドアから乗客 (かんかん帽の会社員・着物の婦人・学生服の学生) がはみ出しそうにぎゅうぎゅう。窓の中も顔でいっぱい。
//       右から駅員が学生の背中をぐいっと押しこむ。押された拍子に、かんかん帽が1つ空へ飛んでいく。札「大正」「東京」
// 動き: 乗客のかたまりがぎゅうぎゅう伸び縮み / 駅員が押しこむ (前後にぐっ) / 帽子が回りながら飛ぶ (f12-38) / パンタグラフの火花
const Hm126: React.FC<{ f: number }> = ({ f }) => {
  const sq = Math.sin(f / 2.6);
  const push = Math.max(0, Math.sin(f / 5)) * 12;
  const he = easeOut(seg(f, 12, 38));
  const drift = Math.max(0, f - 38);
  const hx = lerp(900, 560, he) - drift * 5;
  const hy = lerp(528, 250, he) - Math.sin(he * Math.PI) * 110 + Math.sin(f / 4) * 6 * seg(f, 30, 40) - drift * 2;
  const shake = Math.sin(f * 1.7) * 2;
  type Cr = { x: number; y: number; s: number; lean: number; face: "surprised" | "worried" | "normal" | "smile"; gaze: [number, number]; cloth: string; dark: string; hat: HmFbHatKind; kind: "suit" | "kimono" | "gakuran"; ph: number };
  const backRow: Cr[] = [
    { x: 860, y: 790, s: 0.86, lean: -4, face: "worried", gaze: [-4, -4], cloth: C.coatGray, dark: C.coatGrayDark, hat: "bowler", kind: "suit", ph: 1 },
    { x: 965, y: 790, s: 0.84, lean: 3, face: "surprised", gaze: [2, -6], cloth: C.kimonoB, dark: C.roseDark, hat: "bun", kind: "kimono", ph: 2 },
    { x: 1065, y: 790, s: 0.86, lean: 5, face: "worried", gaze: [5, 2], cloth: C.gakuran, dark: KRP.ink, hat: "student", kind: "gakuran", ph: 3 },
  ];
  const frontRow: Cr[] = [
    { x: 900, y: 806, s: 0.95, lean: -8, face: "surprised", gaze: [-6, -7], cloth: C.navy, dark: C.navyDark, hat: "none", kind: "suit", ph: 4 },
    { x: 1010, y: 806, s: 0.93, lean: 2, face: "worried", gaze: [-3, 5], cloth: C.kimonoA, dark: C.kimonoADark, hat: "bun", kind: "kimono", ph: 5 },
    { x: 1100, y: 802, s: 0.92, lean: 9, face: "worried", gaze: [6, -3], cloth: C.gakuran, dark: KRP.ink, hat: "student", kind: "gakuran", ph: 6 },
  ];
  const drawCr = (c: Cr) => (
    <g key={c.x}>
      <Person x={c.x} y={c.y} s={c.s} f={f} phase={c.ph} lean={c.lean} face={c.face} gaze={c.gaze} cloth={c.cloth} clothDark={c.dark} pose="armsFolded" />
      <HmFbOn x={c.x} y={c.y} s={c.s} f={f} phase={c.ph} lean={c.lean}>
        {c.kind === "kimono" && <HmFbKimono />}
        {c.kind === "gakuran" && <HmFbGakuran />}
        {c.kind === "suit" && <HmFbShirt tie={C.navyDark} />}
        <HmFbHat kind={c.hat} />
      </HmFbOn>
    </g>
  );
  const windows = [200, 340, 480, 640, 1180, 1340, 1480, 1620];
  return (
    <Frame f={f} seed={5126} bg={KRP.blueSoft}>
      <g transform={`translate(${shake} 0)`}>
        {/* 空とレンガの町並み */}
        <rect x={-40} y={-40} width={2000} height={900} fill={KRP.blueSoft} />
        {Array.from({ length: 9 }, (_, i) => {
          const bx = -40 + i * 230;
          const bh = 150 + rnd(5126, i) * 110;
          return (
            <g key={i}>
              <rect x={bx} y={320 - bh} width={200} height={bh + 20} fill={i % 2 ? C.brick : C.brickDark} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2].map((j) => <rect key={j} x={bx + 24 + j * 58} y={340 - bh} width={30} height={40} fill={C.taishoCream} stroke={KRP.ink} strokeWidth={3} />)}
              <rect x={bx - 6} y={320 - bh} width={212} height={14} fill={C.taishoCream} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 架線と柱 */}
        {[60, 1860].map((px) => (
          <g key={px}>
            <rect x={px - 12} y={30} width={24} height={780} fill={C.trunk} stroke={KRP.ink} strokeWidth={4} />
            <rect x={px - 70} y={60} width={140} height={14} fill={C.trunk} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <path d="M -40 96 Q 960 120 1960 96" fill="none" stroke={KRP.ink} strokeWidth={4} />
        <line x1={-40} y1={146} x2={1960} y2={146} stroke={KRP.ink} strokeWidth={5} />
        {[300, 700, 1220, 1620].map((dx) => <line key={dx} x1={dx} y1={106} x2={dx} y2={146} stroke={KRP.ink} strokeWidth={2} />)}
        {/* パンタグラフ */}
        <g stroke={KRP.ink} strokeWidth={6} fill="none">
          <polyline points="900,270 960,206 1020,270" />
          <polyline points="900,270 960,150 1020,270" stroke={C.ironDark} />
          <line x1={900} y1={152} x2={1020} y2={152} strokeWidth={9} />
        </g>
        <rect x={880} y={264} width={160} height={16} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
        {f % 9 < 3 && <HmFbSpark x={960 + (f % 5) * 6} y={146} r={14} color={HP.spark} />}
        {/* 車体 */}
        <path d="M 130 320 Q 960 250 1790 320 L 1790 340 L 130 340 Z" fill={C.taishoDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={140} y={330} width={1640} height={470} rx={12} fill={C.taishoBody} stroke={KRP.ink} strokeWidth={7} />
        <rect x={140} y={580} width={1640} height={26} fill={C.taishoCream} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={160 + i * 56} y1={610} x2={160 + i * 56} y2={790} stroke={C.taishoDark} strokeWidth={3} />)}
        {/* 窓 (中も満員) */}
        {windows.map((wx, i) => (
          <g key={wx}>
            <defs><clipPath id={`hmfb126w${i}`}><rect x={wx} y={390} width={110} height={160} rx={8} /></clipPath></defs>
            <rect x={wx} y={390} width={110} height={160} rx={8} fill={C.taishoCream} />
            <g clipPath={`url(#hmfb126w${i})`}>
              {[0, 1].map((k) => (
                <PersonMini key={k} x={wx + 30 + k * 52} y={590 + ((i + k) % 2) * 14} s={0.72} f={f} phase={i * 2 + k}
                  color={[C.gakuran, C.kimonoA, C.coatGray, C.kimonoB][(i + k) % 4]} />
              ))}
            </g>
            <rect x={wx} y={390} width={110} height={160} rx={8} fill="none" stroke={KRP.ink} strokeWidth={6} />
            <line x1={wx} y1={470} x2={wx + 110} y2={470} stroke={C.taishoDark} strokeWidth={5} />
          </g>
        ))}
        {/* ドア (奥は暗い) */}
        <rect x={810} y={360} width={300} height={440} fill={C.taishoDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={826} y={376} width={268} height={424} fill={KRP.ink} opacity={0.75} />
        {/* ホーム */}
        <rect x={-40} y={796} width={2000} height={320} fill={C.platform} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={796} width={2000} height={24} fill={C.platformDark} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={820} x2={i * 150 - 60} y2={1080} stroke={C.platformDark} strokeWidth={3} />)}
        {/* ぎゅうぎゅうの乗客 */}
        <g transform={`translate(960 800) scale(${1 + 0.03 * sq} ${1 - 0.02 * sq}) translate(-960 -800)`}>
          <defs><clipPath id="hmfb126door"><rect x={826} y={300} width={268} height={500} /></clipPath></defs>
          <g clipPath="url(#hmfb126door)">{backRow.map(drawCr)}</g>
          {frontRow.map(drawCr)}
        </g>
        {/* ぎゅうぎゅうの線 */}
        <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(sq)}>
          <line x1={780} y1={460} x2={750} y2={440} />
          <line x1={776} y1={540} x2={740} y2={540} />
          <line x1={780} y1={620} x2={750} y2={640} />
        </g>
        {/* 押しこむ駅員 */}
        <Person x={1320 - push} y={860} s={1.15} f={f} phase={7} lean={-16} pose="point" pointDir={-1} face="worried" gaze={[-6, 0]}
          cloth={C.station} clothDark={C.navyDark} />
        <HmFbOn x={1320 - push} y={860} s={1.15} f={f} phase={7} lean={-16}>
          <HmFbGakuran />
          <HmFbHat kind="station" />
        </HmFbOn>
        <HmFbSweat x={1330 - push} y={560} s={1.1} o={1} />
        {/* 飛んでいく帽子 */}
        <g transform={`translate(${hx} ${hy}) rotate(${-260 * he - drift * 8}) scale(0.95) translate(0 300)`}>
          <HmFbHat kind="boater" />
        </g>
        {he > 0 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            <line x1={hx + 60} y1={hy + 30} x2={hx + 110} y2={hy + 60} />
            <line x1={hx + 70} y1={hy - 10} x2={hx + 120} y2={hy + 10} />
          </g>
        )}
      </g>
      <TagPlate x={300} y={176} text="大正" size={44} t={seg(f, 2, 10)} />
      <TagPlate x={300} y={268} text="東京" size={44} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #127 1927年には、岩波文庫が生まれます。手のひらにのる、小さな本です。
// 格: 山 / seed 5127
// 絵: どこ: 昭和はじめの本屋の店先 (木の棚・平台・のれん)。年代札「1927年」。演出: 大きな手のひらのアップ。その上に、小さな文庫本がちょこんと乗る。隣に比較用の大きな分厚い本 (重そう)。札「文庫」。手のひらの本がぱらっと開く。動き: 本が手に乗る / ぱらっと開く / 店先ののれん
// どこ: 昭和はじめの本屋の店先。上に藍ののれん (文字なし・波の丸紋)、奥に本がぎっしりの木の棚、手前に平台
// 演出: 大きな手のひらのアップ。上から小さな文庫本がぽとんと乗り、ぱらっと開く (縦書きの行が見える)。
//       右の平台には比較用の大きな分厚い本がどっしり立ち、重さで台がたわんでほこりが立つ。札「文庫」「1927年」
// 動き: 本が手に乗る (f4-14・着地のほこり) / ぱらっと開く (f22-32) / ページがめくれる (f34-42) / のれんが揺れる / 少し寄る
const Hm127: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const land = seg(f, 4, 14);
  const dropY = -300 * (1 - easeOut(land)) + (land >= 1 ? -Math.max(0, Math.sin(seg(f, 14, 20) * Math.PI)) * 10 : 0);
  const puff = seg(f, 13, 22);
  const o = easeInOut(seg(f, 22, 32));
  const spine = lerp(685, 800, o);
  const bw = 230, bh = 320, by = 600 + dropY;
  const cw = bw * Math.cos(Math.PI * o);
  const flip = seg(f, 34, 42);
  const vlines = (x0: number) => Array.from({ length: 8 }, (_, i) => (
    <line key={i} x1={x0 + 30 + i * 24} y1={by - bh / 2 + 40} x2={x0 + 30 + i * 24} y2={by + bh / 2 - 40 - (i % 3) * 30}
      stroke={C.pageLine} strokeWidth={4} strokeLinecap="round" />
  ));
  const spineCols = [C.clothRed, C.noren, C.olive, C.coatBrown, C.bunko, C.plum, C.taishoBody];
  return (
    <Frame f={f} seed={5127} bg={C.woodDark}>
      <g transform={`translate(800 560) scale(${z}) translate(-800 -560)`}>
        {/* 奥の棚 */}
        <rect x={-60} y={-60} width={2040} height={860} fill={C.woodDark} />
        {[0, 1, 2].map((r) => {
          const top = 180 + r * 230;
          return (
            <g key={r}>
              {Array.from({ length: 44 }, (_, i) => {
                const w = 30 + rnd(5127 + r, i) * 18;
                const h = 150 + rnd(5130 + r, i) * 50;
                const x = -40 + i * 46;
                return (
                  <g key={i}>
                    <rect x={x} y={top + 200 - h} width={w} height={h} fill={spineCols[(i * 3 + r) % spineCols.length]} stroke={KRP.ink} strokeWidth={3} />
                    <line x1={x + 4} y1={top + 220 - h} x2={x + w - 4} y2={top + 220 - h} stroke={KRP.brass} strokeWidth={3} opacity={0.7} />
                  </g>
                );
              })}
              <rect x={-60} y={top + 200} width={2040} height={26} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
            </g>
          );
        })}
        {/* のれん */}
        <rect x={-60} y={10} width={2040} height={24} rx={8} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, i) => {
          const x0 = 20 + i * 475;
          const sw = Math.sin(f / 12 + i * 0.9) * 14;
          return (
            <g key={i}>
              <path d={`M ${x0} 30 L ${x0 + 460} 30 L ${x0 + 460 + sw} 216 L ${x0 + sw} 216 Z`} fill={C.noren} stroke={KRP.ink} strokeWidth={5} />
              <line x1={x0 + 6} y1={190} x2={x0 + 454 + sw} y2={190} stroke={C.norenDark} strokeWidth={6} />
              {i === 1 || i === 2 ? (
                <g transform={`translate(${x0 + 230 + sw / 2} 118)`}>
                  <circle r={52} fill="none" stroke={KRP.white} strokeWidth={8} />
                  <path d="M -38 6 Q -19 -16 0 6 Q 19 28 38 6" fill="none" stroke={KRP.white} strokeWidth={8} />
                </g>
              ) : null}
            </g>
          );
        })}
        {/* 平台 */}
        <polygon points="-60,740 1980,740 1980,700 -60,700" fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={740} width={2040} height={380} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 平台の左: 平積みの本 */}
        {[0, 1, 2].map((k) => (
          <g key={k}>
            {Array.from({ length: 4 + k }, (_, j) => (
              <rect key={j} x={110 + k * 140 + (j % 2) * 6} y={690 - j * 22} width={120} height={22} fill={[C.bunko, C.clothRed, C.olive][(j + k) % 3]} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 右: 比較用の大きな分厚い本 (重い) */}
        <path d="M 1240 712 Q 1490 742 1740 712" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <polygon points="1610,300 1710,262 1710,690 1610,720" fill={C.page} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={1626 + i * 14} y1={300 - i * 5} x2={1626 + i * 14} y2={716 - i * 5} stroke={C.pageLine} strokeWidth={3} />)}
        <polygon points="1270,300 1370,262 1710,262 1610,300" fill={C.clothRedDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1270} y={300} width={340} height={420} rx={6} fill={C.clothRed} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1300} y={330} width={280} height={360} rx={4} fill="none" stroke={C.gold} strokeWidth={5} />
        <rect x={1320} y={350} width={240} height={320} rx={4} fill="none" stroke={C.gold} strokeWidth={3} />
        <circle cx={1440} cy={510} r={40} fill="none" stroke={C.gold} strokeWidth={5} />
        {/* たわみとほこり */}
        {[0, 1, 2].map((k) => {
          const u = mod(f / 18 + k / 3, 1);
          return <circle key={k} cx={1250 + k * 230 + u * (k - 1) * 30} cy={718 - u * 40} r={10 + u * 12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={0.8 * (1 - u)} />;
        })}
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={1240} y1={290} x2={1210} y2={270} />
          <line x1={1232} y1={340} x2={1196} y2={336} />
        </g>

        {/* 手 (手のひらを上に) と、そで */}
        <g transform="translate(800 650) rotate(28)">
          <rect x={-170} y={150} width={340} height={420} rx={30} fill={C.navy} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-150} y={140} width={300} height={50} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[-100, -35, 30, 95].map((fx, i) => (
            <rect key={fx} x={fx - 30} y={[-300, -330, -320, -268][i]} width={60} height={220} rx={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          ))}
          <rect x={-140} y={-130} width={280} height={290} rx={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-60} y={-46} width={180} height={30} rx={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
            transform="rotate(-40 -60 -30) translate(-170 40)" />
          <path d="M -80 40 Q -20 70 60 20" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        </g>
        {/* 本の影 */}
        <ellipse cx={800} cy={700} rx={130 * (0.6 + 0.4 * land)} ry={28} fill={KRP.ink} opacity={0.18 * land} />

        {/* 文庫本 */}
        <g transform={`rotate(-6 800 ${by})`}>
          {/* 厚み */}
          <polygon points={`${spine},${by + bh / 2} ${spine + bw},${by + bh / 2} ${spine + bw + 10},${by + bh / 2 + 14} ${spine + 10},${by + bh / 2 + 14}`}
            fill={C.page} stroke={KRP.ink} strokeWidth={4} />
          {/* 右のページ */}
          <rect x={spine} y={by - bh / 2} width={bw} height={bh} fill={C.page} stroke={KRP.ink} strokeWidth={5} />
          {o > 0 && vlines(spine)}
          {/* 左のページ (開いたら見える) */}
          {o >= 0.5 && (
            <g>
              <rect x={spine + cw} y={by - bh / 2} width={-cw} height={bh} fill={C.page} stroke={KRP.ink} strokeWidth={5} />
              {o > 0.9 && vlines(spine - bw)}
            </g>
          )}
          {/* めくれるページ */}
          {flip > 0 && flip < 1 && (
            <path d={`M ${spine} ${by - bh / 2} L ${spine + bw * Math.cos(Math.PI * flip)} ${by - bh / 2 - 24 * Math.sin(Math.PI * flip)} L ${spine + bw * Math.cos(Math.PI * flip)} ${by + bh / 2 - 24 * Math.sin(Math.PI * flip)} L ${spine} ${by + bh / 2} Z`}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          )}
          {/* 表紙 (閉じているあいだ) */}
          {o < 0.5 && (
            <g>
              <rect x={spine} y={by - bh / 2} width={cw} height={bh} rx={4} fill={C.bunko} stroke={KRP.ink} strokeWidth={6} />
              <rect x={spine + cw * 0.1} y={by - bh / 2 + 24} width={cw * 0.8} height={bh - 48} fill="none" stroke={C.bunkoLine} strokeWidth={4} />
              <rect x={spine + cw * 0.16} y={by - bh / 2 + 34} width={cw * 0.68} height={bh - 68} fill="none" stroke={C.bunkoLine} strokeWidth={2} />
              <path d={`M ${spine + cw * 0.2} ${by - bh / 2 + 10} L ${spine + cw * 0.5} ${by - bh / 2 + 10}`} stroke={KRP.white} strokeWidth={6} opacity={0.6} />
            </g>
          )}
          <line x1={spine} y1={by - bh / 2} x2={spine} y2={by + bh / 2} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 親指 (本の上にかかる) */}
        <g transform="translate(650 770) rotate(-38)">
          <rect x={-32} y={-150} width={64} height={160} rx={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -16 -128 Q 0 -138 16 -128" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        </g>
        {/* 着地のほこり */}
        {puff > 0 && puff < 1 && [-1, 1].map((sd) => (
          <g key={sd} opacity={1 - puff}>
            <circle cx={800 + sd * (140 + puff * 60)} cy={740 - puff * 20} r={14 + puff * 14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={800 + sd * (100 + puff * 40)} cy={760 - puff * 10} r={10 + puff * 10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {o > 0.6 && <HmFbSpark x={980} y={420} r={(16 + 6 * Math.sin(f / 3)) * pop(seg(f, 30, 36))} />}
      </g>
      <TagPlate x={500} y={360} text="文庫" size={50} t={seg(f, 14, 22)} />
      <TagPlate x={1490} y={196} text="1927年" size={44} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_116: (f) => <Hm116 f={f} />,
  hm_117: (f) => <Hm117 f={f} />,
  hm_118: (f) => <Hm118 f={f} />,
  hm_119: (f) => <Hm119 f={f} />,
  hm_120: (f) => <Hm120 f={f} />,
  hm_121: (f) => <Hm121 f={f} />,
  hm_122: (f) => <Hm122 f={f} />,
  hm_123: (f) => <Hm123 f={f} />,
  hm_124: (f) => <Hm124 f={f} />,
  hm_125: (f) => <Hm125 f={f} />,
  hm_126: (f) => <Hm126 f={f} />,
  hm_127: (f) => <Hm127 f={f} />,
};

export const HM_FB_MOTIFS: string[] = [
  "hm_116", // #116
  "hm_117", // #117
  "hm_118", // #118
  "hm_119", // #119
  "hm_120", // #120
  "hm_121", // #121
  "hm_122", // #122
  "hm_123", // #123
  "hm_124", // #124
  "hm_125", // #125
  "hm_126", // #126
  "hm_127", // #127
];

export const himaFbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
