// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#53〜#61 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 実在の人物と映画の人物は顔を見せない (後ろ姿・シルエット)

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./NamaeShared";
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  sky: "#CFE2EA", skyHi: "#E8F1F2", cloud: "#FBF8F0",
  tile: "#5A676F", tileDark: "#3C474E", tileLine: "#2E373C",
  verm: "#C8432F", vermDark: "#962F22", vermDeep: "#6E2016",
  teal: "#3F7F7A", tealDark: "#2C5C58",
  stone: "#D6CEBD", stoneDark: "#ADA38F", stoneLine: "#968C78",
  plaque: "#22324A",
  official: "#7A2E2E", officialDark: "#561F1F",
  hat: "#2A2420",
  emperor: "#D9A520", emperorDark: "#A87B12",
  silk: "#5B3A7A", silkDark: "#3F2858",
  wood: "#C99A62", woodDark: "#8A6038", woodPale: "#E3C89A", woodDeep: "#5E3F22",
  wall: "#EFE4C8", wallShade: "#DCCDA8",
  bronze: "#8A6A3A", bronzeDark: "#5E4724",
  smoke: "#ECE7DD", smokeEdge: "#BDB5A6",
  pine: "#4F7A4A", pineDark: "#36583A",
  road: "#CDBF9E", far: "#A9B8C0", farDark: "#8C9CA6",
  camel: "#C9A06A", camelDark: "#9A7444",
  shop: "#5A4030",
  gray1: "#5C6B7A", lordRobe: "#2F5A6B", lordDark: "#1F3F4C", friend1: "#8C6A3F", friend2: "#5E7D6A", friend3: "#7D6A8C",
  beard: "#F4F1EA", hairGray: "#9AA0A6",
  indigo: "#3E4F7A", indigoDark: "#2B3858", slip: "#F6EFDA",
  worker: "#6E7F8C", workerDark: "#4E5E6A", bamboo: "#B8A25A", bambooDark: "#857238", rope: "#B08A55",
  sun: "#F6B04A", dusk1: "#E9A85E", dusk2: "#F3C98A", dusk3: "#F7DDB0", duskGround: "#C9A27A", duskShadow: "#6E4A3A", duskFar: "#9A6A52",
  hiwada: "#7A4E33", hiwadaDark: "#57351F", misu: "#D9C78E", misuLine: "#A88F52", misuEdge: "#3F5E3A",
  sakura: "#F3C6CF", sakuraDark: "#E39AAB", pond: "#8DB8C4", pondDark: "#6A98A6", sand: "#EDE6D2",
  heian: "#A14B6E", heianDark: "#7A3352", edge1: "#E8B04A", edge2: "#6E8F4E", tatami: "#C9C08A", interior: "#4A3A2C",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend;
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
void lerp; void easeInOut; void rnd;

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// 中国式の瓦屋根 (反り上がった軒・瓦の筋・棟と鴟尾)
const NC1Roof: React.FC<{
  x: number; y: number; w: number; h: number; lip?: number; tile?: string; dark?: string; n?: number; ornament?: boolean;
}> = ({ x, y, w, h, lip = 50, tile = C.tile, dark = C.tileDark, n = 18, ornament = true }) => {
  const L = x - w / 2, R = x + w / 2;
  const tl = L + w * 0.16, tr = R - w * 0.16;
  const ey = y + h;
  const bl = L - lip + 14, br = R + lip - 14;
  const d = `M ${tl} ${y} L ${tr} ${y} Q ${R - w * 0.04} ${y + h * 0.72} ${R + lip} ${ey - h * 0.32} L ${br} ${ey} Q ${x} ${ey - h * 0.14} ${bl} ${ey} L ${L - lip} ${ey - h * 0.32} Q ${L + w * 0.04} ${y + h * 0.72} ${tl} ${y} Z`;
  return (
    <g>
      <path d={d} fill={tile} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <g stroke={C.tileLine} strokeWidth={3} opacity={0.55}>
        {Array.from({ length: n - 1 }, (_, i) => {
          const t = (i + 1) / n;
          const by = ey - h * 0.28 * t * (1 - t) - 6;
          return <line key={i} x1={lerp(tl, tr, t)} y1={y + 4} x2={lerp(bl, br, t)} y2={by} />;
        })}
      </g>
      {/* 軒先の瓦当 (丸い列) */}
      <path d={`M ${bl} ${ey} Q ${x} ${ey - h * 0.14} ${br} ${ey}`} fill="none" stroke={dark} strokeWidth={12} />
      <path d={`M ${bl} ${ey} Q ${x} ${ey - h * 0.14} ${br} ${ey}`} fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="4 18" />
      {/* 棟 */}
      <rect x={tl - 12} y={y - 16} width={tr - tl + 24} height={22} rx={5} fill={dark} stroke={KRP.ink} strokeWidth={4.5} />
      {ornament && [1, -1].map((m) => (
        <g key={m} transform={`translate(${m === 1 ? tl - 10 : tr + 10} ${y - 10}) scale(${m * (w / 900 + 0.35)} ${w / 900 + 0.35})`}>
          <path d="M 4 4 Q -14 -40 12 -62 Q 34 -74 36 -48 Q 26 -58 16 -48 Q 8 -36 22 -20 Q 18 -4 4 4 Z"
            fill={C.teal} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={22} cy={-50} r={4} fill={KRP.brass} />
        </g>
      ))}
    </g>
  );
};

// 唐の役人 (Person + 幞頭・帯・丸襟)。bow で頭を下げる (傾ける)。back で後ろ姿
const NC1Official: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; bow?: number; dir?: 1 | -1;
  face?: Face; pose?: Pose; closed?: boolean; cloth?: string; clothDark?: string; gaze?: [number, number];
  back?: boolean; pointDir?: 1 | -1; lean?: number;
}> = ({ x, y, s, f, phase = 0, bow = 0, dir = 1, face = "normal", pose = "hold", closed, cloth = C.official,
  clothDark = C.officialDark, gaze = [0, 0], back, pointDir = 1, lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 2.5;
  const rot = bow * dir * 14 + lean;
  return (
    <g transform={`translate(${x} ${y + bob + bow * 6 * s}) rotate(${rot})`}>
      <Person x={0} y={0} s={s} f={f} phase={phase} still face={face} pose={pose} cloth={cloth}
        clothDark={clothDark} hair="cap" gaze={gaze} pointDir={pointDir} />
      {back && <rect x={14 * s} y={-142 * s} width={34 * s} height={28 * s} fill={cloth} />}
      {back && <line x1={0} y1={-158 * s} x2={0} y2={-60 * s} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />}
      <rect x={-58 * s} y={-100 * s} width={116 * s} height={13 * s} fill={C.hat} stroke={KRP.ink} strokeWidth={3} />
      {[-36, -12, 12, 36].map((bx) => (
        <rect key={bx} x={(bx - 4) * s} y={-98 * s} width={8 * s} height={9 * s} fill={KRP.brass} />
      ))}
      {!back && (
        <path d={`M ${-30 * s} ${-160 * s} Q 0 ${-128 * s} ${30 * s} ${-160 * s}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
      )}
      {closed && !back && (
        <g>
          <ellipse cx={-24 * s} cy={-222 * s} rx={16 * s} ry={21 * s} fill={KRP.white} />
          <ellipse cx={24 * s} cy={-222 * s} rx={16 * s} ry={21 * s} fill={KRP.white} />
          <g fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
            <path d={`M ${-34 * s} ${-222 * s} Q ${-24 * s} ${-213 * s} ${-14 * s} ${-222 * s}`} />
            <path d={`M ${14 * s} ${-222 * s} Q ${24 * s} ${-213 * s} ${34 * s} ${-222 * s}`} />
          </g>
        </g>
      )}
      {back && <circle cx={0} cy={-228 * s} r={66 * s} fill={C.hat} stroke={KRP.ink} strokeWidth={5} />}
      {/* 幞頭 */}
      <path d={`M ${-63 * s} ${-246 * s} Q ${-65 * s} ${-300 * s} 0 ${-302 * s} Q ${65 * s} ${-300 * s} ${63 * s} ${-246 * s} Q 0 ${-262 * s} ${-63 * s} ${-246 * s} Z`}
        fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-304 * s} rx={30 * s} ry={24 * s} fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
      {[1, -1].map((m) => (
        <path key={m} d={`M ${m * 40 * s} ${-282 * s} Q ${m * 96 * s} ${-266 * s} ${m * 86 * s} ${-192 * s}`}
          stroke={C.hat} strokeWidth={11 * s} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

// 香の煙 (3本の筋が f でゆらぐ)
const NC1Smoke: React.FC<{ x: number; y: number; f: number; s?: number; h?: number; phase?: number }> = ({
  x, y, f, s = 1, h = 300, phase = 0,
}) => (
  <g fill="none" strokeLinecap="round">
    {[0, 1, 2].map((i) => {
      const pts = Array.from({ length: 9 }, (_, k) => {
        const yy = y - (k * h) / 8;
        const xx = x + (i - 1) * 8 * s + Math.sin(k * 0.8 + (f + i * 23 + phase) / 13) * (4 + k * 5) * s;
        return `${xx.toFixed(1)} ${yy.toFixed(1)}`;
      });
      const d = `M ${pts.join(" L ")}`;
      return (
        <g key={i} opacity={0.85 - i * 0.15}>
          <path d={d} stroke={C.smokeEdge} strokeWidth={13 * s} />
          <path d={d} stroke={C.smoke} strokeWidth={8 * s} />
        </g>
      );
    })}
  </g>
);

// 赤い提灯 (ゆれる)
const NC1Lantern: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> = ({
  x, y, s = 1, f, phase = 0, color = C.verm,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin((f + phase * 13) / 15) * 4}) scale(${s})`}>
    <line x1={0} y1={-30} x2={0} y2={0} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-14} y={0} width={28} height={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
    <ellipse cx={0} cy={38} rx={30} ry={32} fill={color} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -14 10 Q -24 38 -14 66 M 14 10 Q 24 38 14 66" stroke={KRP.ink} strokeWidth={2.5} fill="none" opacity={0.5} />
    <ellipse cx={-10} cy={28} rx={6} ry={12} fill={KRP.white} opacity={0.35} />
    <rect x={-14} y={66} width={28} height={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
    <line x1={0} y1={75} x2={0} y2={98} stroke={KRP.yellow} strokeWidth={5} />
  </g>
);

// 青銅の香炉 (三本足の鼎)
const NC1Censer: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={70} ry={12} fill={KRP.ink} opacity={0.18} />
    {[-40, 0, 40].map((lx) => (
      <path key={lx} d={`M ${lx - 8} -30 L ${lx * 1.1 - 6} 0 L ${lx * 1.1 + 6} 0 L ${lx + 8} -30 Z`} fill={C.bronzeDark} stroke={KRP.ink} strokeWidth={4} />
    ))}
    <path d="M -62 -92 Q -66 -20 0 -22 Q 66 -20 62 -92 Z" fill={C.bronze} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -50 -70 Q 0 -60 50 -70" stroke={C.bronzeDark} strokeWidth={5} fill="none" />
    <ellipse cx={0} cy={-92} rx={64} ry={12} fill={C.bronzeDark} stroke={KRP.ink} strokeWidth={4.5} />
    {[1, -1].map((m) => (
      <path key={m} d={`M ${m * 40} -98 L ${m * 44} -126 L ${m * 58} -126 L ${m * 54} -98`} fill="none" stroke={KRP.ink} strokeWidth={5} />
    ))}
    <circle cx={0} cy={-56} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 龍の飾り (金の線で1匹)
const NC1Dragon: React.FC<{ x: number; y: number; s?: number; color?: string; rot?: number }> = ({
  x, y, s = 1, color = KRP.brass, rot = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill="none" strokeLinecap="round">
    <path d="M -60 20 C -40 -30, -10 40, 10 0 C 24 -26, 44 -20, 50 -2" stroke={KRP.ink} strokeWidth={16} />
    <path d="M -60 20 C -40 -30, -10 40, 10 0 C 24 -26, 44 -20, 50 -2" stroke={color} strokeWidth={10} />
    <circle cx={54} cy={-2} r={11} fill={color} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 52 -12 L 46 -28 M 60 -10 L 64 -26" stroke={KRP.ink} strokeWidth={4} />
    {[-40, -14, 18].map((px, i) => (
      <path key={i} d={`M ${px} ${i === 1 ? 14 : -4} l -6 12 m 12 -12 l 4 12`} stroke={KRP.ink} strokeWidth={3} />
    ))}
    <circle cx={74} cy={-14} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 歯車
const NC1Gear: React.FC<{ x: number; y: number; r: number; teeth: number; rot: number; fill?: string }> = ({
  x, y, r, teeth, rot, fill = KRP.brass,
}) => {
  const step = (Math.PI * 2) / teeth;
  const r1 = r * 0.84;
  const pts: string[] = [];
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    ([[r1, a], [r, a + step * 0.15], [r, a + step * 0.45], [r1, a + step * 0.6]] as const).forEach(([rr, aa]) =>
      pts.push(`${(Math.cos(aa) * rr).toFixed(1)},${(Math.sin(aa) * rr).toFixed(1)}`));
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle r={r * 0.62} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={0} y1={0} x2={Math.cos(i * Math.PI / 2) * r * 0.62} y2={Math.sin(i * Math.PI / 2) * r * 0.62} stroke={KRP.ink} strokeWidth={6} />
      ))}
      <circle r={r * 0.16} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 役所の看板 (紺地・金の縁・金の字)
const NC1Sign: React.FC<{ x: number; y: number; w: number; h: number; text: string; rot?: number; size?: number }> = ({
  x, y, w, h, text, rot = 0, size = 80,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill={C.plaque} stroke={KRP.ink} strokeWidth={4} />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([mx, my], i) => (
      <circle key={i} cx={mx * (w / 2 + 2)} cy={my * (h / 2 + 2)} r={7} fill={C.verm} stroke={KRP.ink} strokeWidth={3} />
    ))}
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
      fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} paintOrder="stroke" letterSpacing={size * 0.2}>{text}</text>
  </g>
);

// 唐の役所の門 (#59 と #60 で同じ場所)。x=中心, y=地面。看板の位置は y-540*s
const NC1Gate: React.FC<{ x: number; y: number; s: number; dusk?: boolean }> = ({ x, y, s, dusk }) => {
  const pil = dusk ? "#A8462F" : C.verm;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 石の基壇 */}
      <rect x={-560} y={-40} width={1120} height={60} fill={dusk ? "#B79C80" : C.stone} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-560} y1={-12} x2={560} y2={-12} stroke={C.stoneLine} strokeWidth={4} />
      {/* 白壁 */}
      <rect x={-480} y={-560} width={240} height={520} fill={dusk ? "#E8C8A0" : C.wall} stroke={KRP.ink} strokeWidth={5} />
      <rect x={240} y={-560} width={240} height={520} fill={dusk ? "#E8C8A0" : C.wall} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-480} y={-200} width={240} height={160} fill={pil} opacity={0.8} />
      <rect x={240} y={-200} width={240} height={160} fill={pil} opacity={0.8} />
      {/* 奥の暗い入口 */}
      <rect x={-200} y={-560} width={400} height={520} fill={C.vermDeep} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-150} y={-420} width={300} height={380} fill="#2E211A" />
      {[-1, 1].map((m) => (
        <g key={m}>
          <rect x={m === -1 ? -200 : 150} y={-430} width={50} height={390} fill={C.vermDark} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} cx={m * 175} cy={-390 + k * 76} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
        </g>
      ))}
      {/* 柱 */}
      {[-400, -200, 200, 400].map((px) => (
        <g key={px}>
          <rect x={px - 26} y={-580} width={52} height={540} fill={pil} stroke={KRP.ink} strokeWidth={5} />
          <rect x={px - 34} y={-60} width={68} height={22} rx={4} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={px - 10} y1={-560} x2={px - 10} y2={-80} stroke={KRP.white} strokeWidth={5} opacity={0.25} />
        </g>
      ))}
      {/* 梁 (彩色) */}
      <rect x={-520} y={-640} width={1040} height={62} fill={C.teal} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <circle cx={-460 + i * 115} cy={-609} r={18} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-460 + i * 115} cy={-609} r={7} fill={C.verm} />
        </g>
      ))}
      {/* 斗栱 */}
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={-515 + i * 100} y={-668} width={30} height={28} fill={C.tealDark} stroke={KRP.ink} strokeWidth={3} />
      ))}
      <NC1Roof x={0} y={-800} w={1040} h={136} lip={80} n={22} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #53 第2章、本当の名前は、呼んではいけない。
// 格: 山 / seed 4053
// 絵: 章扉。古代中国の宮殿の大きな朱塗りの門 (瓦屋根・龍の飾り・石の階段)。門の前で、えんじの官服の役人たちが一斉に口を閉じて頭を下げている。門の上の扁額は**無地** (字を書かない)。`ChapterDoor` (num=2)。題字の後ろにクリームの帯
// どこ: 唐の宮殿の正門の前の石畳の広場。門は画面の左半分 (題字が右)
// 演出: 二重屋根・鴟尾・彩色の梁・金鋲の扉・龍の御路。無地の扁額。役人6人が中央の石段に向かって並ぶ
// 動き: 役人が左右から波のように一斉に頭を下げ目を閉じる (f10〜30)。扁額に光が走る。鶴が空を横切る。カメラがゆっくり寄る
const Nm053: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = 1 + 0.035 * Math.min(f, 120) / 120;
  const glint = seg(f, 26, 40);
  const crane = f * 3.2;
  const offs: [number, number, number, 1 | -1][] = [
    [190, 945, 0.66, 1], [300, 892, 0.6, 1], [402, 848, 0.54, 1],
    [718, 848, 0.54, -1], [820, 892, 0.6, -1], [930, 945, 0.66, -1],
  ];
  return (
    <Frame f={f} seed={4053} bg={C.sky}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={2} title="本当の名前は、呼んではいけない" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(560 600) scale(${cam}) translate(-560 -600)`}>
        {/* 空と雲 */}
        <rect x={-40} y={-40} width={W + 80} height={700} fill={C.sky} />
        <rect x={-40} y={420} width={W + 80} height={240} fill={C.skyHi} opacity={0.7} />
        {([[1180, 150, 1], [1560, 250, 0.8], [1320, 380, 0.6]] as const).map(([cx, cy, cs], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 12} ${cy}) scale(${cs})`}>
            <path d="M -150 20 Q -150 -20 -100 -18 Q -80 -60 -20 -46 Q 20 -80 80 -40 Q 150 -44 150 20 Z" fill={C.cloud} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -110 4 Q -40 -8 40 2" stroke={C.far} strokeWidth={4} fill="none" />
          </g>
        ))}
        {/* 鶴 (空を横切る) */}
        <g transform={`translate(${1900 - crane} ${200 + Math.sin(f / 10) * 8})`}>
          <path d={`M -40 0 Q 0 ${-24 + Math.sin(f / 4) * 18} 40 -4`} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -36 0 Q 0 ${-20 + Math.sin(f / 4) * 18} 36 -4`} fill="none" stroke={KRP.white} strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={22} ry={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <line x1={-22} y1={0} x2={-56} y2={-6} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-58} cy={-7} r={5} fill={KRP.red} />
          <line x1={22} y1={2} x2={56} y2={8} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 遠くの宮殿の屋根並み (右奥) */}
        <g opacity={0.9}>
          <rect x={980} y={470} width={960} height={150} fill={C.verm} stroke={KRP.ink} strokeWidth={5} />
          <rect x={980} y={456} width={960} height={20} fill={C.tile} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={1010 + i * 110} y1={490} x2={1010 + i * 110} y2={610} stroke={C.vermDark} strokeWidth={4} />
          ))}
          <NC1Roof x={1380} y={330} w={420} h={60} lip={30} n={12} />
          <rect x={1240} y={390} width={280} height={66} fill={C.vermDark} stroke={KRP.ink} strokeWidth={4} />
          <NC1Roof x={1760} y={360} w={300} h={50} lip={26} n={10} />
          <rect x={1660} y={410} width={200} height={46} fill={C.vermDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 石畳の広場 */}
        <rect x={-40} y={620} width={W + 80} height={500} fill={C.stone} />
        <g stroke={C.stoneLine} strokeWidth={3} opacity={0.6}>
          {[660, 712, 776, 852, 940, 1040].map((yy) => <line key={yy} x1={-40} y1={yy} x2={W + 40} y2={yy} />)}
          {Array.from({ length: 17 }, (_, i) => <line key={i} x1={560 + (i - 8) * 70} y1={620} x2={560 + (i - 8) * 260} y2={1080} />)}
        </g>
        {/* 松 (右端) */}
        <g>
          <path d="M 1790 980 Q 1770 820 1810 700 Q 1840 600 1800 520" stroke={C.woodDeep} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M 1790 980 Q 1770 820 1810 700 Q 1840 600 1800 520" stroke={C.woodDark} strokeWidth={22} fill="none" strokeLinecap="round" />
          {([[1730, 520, 1], [1850, 460, 0.8], [1700, 640, 0.75], [1880, 600, 0.7]] as const).map(([px, py, ps], i) => (
            <g key={i} transform={`translate(${px} ${py + Math.sin(f / 18 + i) * 3}) scale(${ps})`}>
              <ellipse rx={110} ry={40} fill={C.pine} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -80 0 Q -40 -18 0 -4 Q 40 -20 84 2" stroke={C.pineDark} strokeWidth={5} fill="none" />
            </g>
          ))}
        </g>
        {/* 香炉 (題字の下) */}
        <NC1Censer x={1300} y={930} s={0.9} />
        <NC1Smoke x={1300} y={830} f={f} s={0.9} h={200} />

        {/* ===== 正門 ===== */}
        {/* 城台 (朱の壁) */}
        <rect x={100} y={420} width={920} height={350} fill={C.verm} stroke={KRP.ink} strokeWidth={7} />
        <rect x={86} y={404} width={948} height={24} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={104 + i * 72} y={388} width={14} height={20} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <line x1={104} y1={398} x2={1016} y2={398} stroke={KRP.ink} strokeWidth={4} />
        {/* アーチの門 3つ */}
        {([[300, 120, 610], [560, 180, 550], [820, 120, 610]] as const).map(([ax, aw, at], i) => (
          <g key={i}>
            <path d={`M ${ax - aw / 2} 770 L ${ax - aw / 2} ${at + aw / 2} A ${aw / 2} ${aw / 2} 0 0 1 ${ax + aw / 2} ${at + aw / 2} L ${ax + aw / 2} 770 Z`}
              fill={C.vermDeep} stroke={KRP.ink} strokeWidth={6} />
            {[-1, 1].map((m) => (
              <g key={m}>
                {Array.from({ length: 5 }, (_, r) => Array.from({ length: 2 }, (_, c) => (
                  <circle key={`${r}-${c}`} cx={ax + m * (aw * 0.14 + c * aw * 0.2)} cy={at + aw * 0.55 + r * ((770 - at - aw * 0.6) / 5)}
                    r={aw * 0.04} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
                )))}
              </g>
            ))}
            <line x1={ax} y1={at + aw * 0.2} x2={ax} y2={770} stroke={KRP.ink} strokeWidth={4} />
            {i === 1 && [-1, 1].map((m) => (
              <circle key={m} cx={ax + m * 22} cy={680} r={14} fill="none" stroke={KRP.brass} strokeWidth={6} />
            ))}
          </g>
        ))}
        {/* 楼閣 */}
        <rect x={200} y={300} width={720} height={92} fill={C.vermDark} stroke={KRP.ink} strokeWidth={6} />
        {[220, 340, 460, 660, 780, 900].map((px) => (
          <rect key={px} x={px - 10} y={300} width={20} height={92} fill={C.verm} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {[280, 400, 720, 840].map((px) => (
          <g key={px} stroke={C.woodDeep} strokeWidth={3}>
            {[0, 1, 2, 3].map((k) => <line key={k} x1={px - 40 + k * 26} y1={312} x2={px - 40 + k * 26} y2={382} />)}
            <line x1={px - 50} y1={346} x2={px + 50} y2={346} />
          </g>
        ))}
        <rect x={180} y={284} width={760} height={22} fill={C.teal} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={210 + i * 54} cy={295} r={6} fill={KRP.brass} />
        ))}
        <NC1Roof x={560} y={222} w={860} h={64} lip={64} n={26} />
        <rect x={300} y={160} width={520} height={66} fill={C.vermDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={290} y={152} width={540} height={14} fill={C.teal} stroke={KRP.ink} strokeWidth={3} />
        <NC1Roof x={560} y={46} w={720} h={110} lip={70} n={24} />
        {/* 無地の扁額 (字を書かない) + 光が走る */}
        <g>
          <rect x={478} y={168} width={164} height={112} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={492} y={182} width={136} height={84} fill={C.plaque} stroke={KRP.ink} strokeWidth={3} />
          <clipPath id="nc1-plaque"><rect x={492} y={182} width={136} height={84} /></clipPath>
          <g clipPath="url(#nc1-plaque)">
            <polygon points={`${440 + glint * 260},180 ${470 + glint * 260},180 ${430 + glint * 260},270 ${400 + glint * 260},270`} fill={KRP.white} opacity={0.55 * Math.sin(glint * Math.PI)} />
          </g>
          {[-1, 1].map((m) => <line key={m} x1={560 + m * 50} y1={152} x2={560 + m * 60} y2={168} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {/* 石段と龍の御路 */}
        <polygon points="460,770 660,770 730,960 390,960" fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => {
          const yy = 770 + i * 27;
          const k = (yy - 770) / 190;
          return <line key={i} x1={460 - 70 * k} y1={yy} x2={660 + 70 * k} y2={yy} stroke={C.stoneLine} strokeWidth={4} />;
        })}
        <polygon points="530,770 590,770 610,960 510,960" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        <NC1Dragon x={560} y={860} s={0.45} rot={-80} color={KRP.white} />
        {[-1, 1].map((m) => (
          <g key={m}>
            <line x1={560 + m * 100} y1={760} x2={560 + m * 170} y2={950} stroke={KRP.ink} strokeWidth={14} />
            <line x1={560 + m * 100} y1={760} x2={560 + m * 170} y2={950} stroke={KRP.white} strokeWidth={8} />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={560 + m * (100 + k * 23) - 7} y={742 + k * 62} width={14} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 役人たち (中央の石段に向かって一斉に頭を下げる) */}
        {offs.map(([ox, oy, os, dir], i) => {
          const order = dir === 1 ? 2 - i : i - 3;
          const b = easeOut(seg(f, 10 + order * 3, 24 + order * 3));
          return (
            <g key={i}>
              <ellipse cx={ox} cy={oy + 4} rx={60 * os} ry={10 * os} fill={KRP.ink} opacity={0.16} />
              <NC1Official x={ox} y={oy} s={os} f={f} phase={i} bow={b} dir={dir} closed={b > 0.55} pose="hold" />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #54 古代の中国では、人は、名前を2つ持っていました。
// 格: 山 / seed 4054
// 絵: 唐の都の通り (朱の柱の店・瓦屋根・提灯・行き交う人)。手前の役人 (Person) の頭の上に**2枚の札が浮かぶ**: 1枚は金の縁の札 (中身は布で隠されている)、もう1枚はふつうの木札。f で2枚が交互にきらりと光る
// どこ: 唐の都・長安の大通り。左右に朱の柱の店、奥に城門と塔。提灯・幟・らくだの隊商・行き交う人
// 演出: 手前中央の役人の頭上に2枚の札。左=金の縁の札 (紫の布で中身が隠れている)、右=ふつうの木札
// 動き: 札がぽんと出る (f6〜22)。その後2枚が交互にきらりと光り、役人の目が光る方を追う。人とらくだが通りを歩く。カメラが少し下りる
const NC1ShopRow: React.FC<{ f: number; wall: string; banner: string; goods: string[]; phase: number }> = ({ f, wall, banner, goods, phase }) => {
  const VX = 960, VY = 430;
  const roofY = (x: number) => 150 + ((VY - 150) * x) / VX;
  const gndY = (x: number) => 930 - ((930 - VY) * x) / VX;
  const k = (x: number) => 1 - (x / VX) * 0.8;
  const pillars = [30, 300, 500, 640, 740];
  return (
    <g>
      <polygon points={`0,${roofY(0)} 760,${roofY(760)} 760,${gndY(760)} 0,${gndY(0)}`} fill={wall} stroke={KRP.ink} strokeWidth={5} />
      {/* 店の口 (中に品物) */}
      {pillars.slice(0, -1).map((p0, i) => {
        const p1 = pillars[i + 1];
        const a = p0 + 24 * k(p0), b = p1 - 24 * k(p1);
        const top = (x: number) => roofY(x) + (gndY(x) - roofY(x)) * 0.26;
        const bot = (x: number) => gndY(x) - (gndY(x) - roofY(x)) * 0.16;
        return (
          <g key={i}>
            <polygon points={`${a},${top(a)} ${b},${top(b)} ${b},${bot(b)} ${a},${bot(a)}`} fill={C.shop} stroke={KRP.ink} strokeWidth={4} />
            <polygon points={`${a},${bot(a) - 40 * k(a)} ${b},${bot(b) - 40 * k(b)} ${b},${bot(b)} ${a},${bot(a)}`} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
            {[0.2, 0.45, 0.7].map((t, j) => {
              const gx = lerp(a, b, t);
              const gy = bot(gx) - 40 * k(gx);
              const gs = k(gx);
              return j === 1 ? (
                <rect key={j} x={gx - 22 * gs} y={gy - 50 * gs} width={44 * gs} height={50 * gs} rx={6 * gs} fill={goods[(i + j) % goods.length]} stroke={KRP.ink} strokeWidth={3} />
              ) : (
                <g key={j}>
                  <ellipse cx={gx} cy={gy - 26 * gs} rx={22 * gs} ry={26 * gs} fill={goods[(i + j) % goods.length]} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={gx - 10 * gs} y={gy - 58 * gs} width={20 * gs} height={10 * gs} fill={goods[(i + j + 1) % goods.length]} stroke={KRP.ink} strokeWidth={2.5} />
                </g>
              );
            })}
          </g>
        );
      })}
      {/* 朱の柱 */}
      {pillars.map((px) => (
        <rect key={px} x={px - 20 * k(px)} y={roofY(px)} width={40 * k(px)} height={gndY(px) - roofY(px)} fill={C.verm} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 瓦の庇 */}
      <polygon points={`-20,${roofY(0) - 120} 780,${roofY(760) - 46} 800,${roofY(760) + 10} -20,${roofY(0) + 30}`} fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={C.tileLine} strokeWidth={3} opacity={0.55}>
        {Array.from({ length: 16 }, (_, i) => {
          const x = i * 50;
          return <line key={i} x1={x} y1={roofY(x) - 120 + (74 * x) / 780} x2={x + 6} y2={roofY(x) + 26 - (20 * x) / 780} />;
        })}
      </g>
      <line x1={-20} y1={roofY(0) + 30} x2={800} y2={roofY(760) + 10} stroke={C.tileDark} strokeWidth={10} />
      {/* 提灯 */}
      {[165, 400, 570, 690].map((lx, i) => (
        <NC1Lantern key={lx} x={lx} y={roofY(lx) + 52 * k(lx)} s={k(lx) * 1.2} f={f} phase={i + phase} />
      ))}
      {/* 幟 (字のない布) */}
      <g transform={`translate(240 ${roofY(240) + 40}) rotate(${Math.sin((f + phase * 10) / 16) * 2})`}>
        <line x1={0} y1={0} x2={0} y2={300} stroke={C.woodDeep} strokeWidth={6} />
        <rect x={4} y={10} width={58} height={250} fill={banner} stroke={KRP.ink} strokeWidth={4} />
        <rect x={4} y={10} width={58} height={22} fill={KRP.white} opacity={0.5} />
        <path d="M 4 260 L 18 280 L 33 260 L 48 280 L 62 260" fill={banner} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </g>
  );
};

const NC1Camel: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const sw = Math.sin(f / 5) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {([[-50, sw], [-30, -sw], [40, -sw], [60, sw]] as const).map(([lx, r], i) => (
        <rect key={i} x={lx - 7} y={-70} width={14} height={70} rx={6} fill={C.camelDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${r} ${lx} -70)`} />
      ))}
      <ellipse cx={0} cy={-100} rx={90} ry={42} fill={C.camel} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -50 -130 Q -30 -190 -6 -134 Q 16 -190 40 -132 Z" fill={C.camel} stroke={KRP.ink} strokeWidth={5} />
      {/* 荷 */}
      <rect x={-44} y={-156} width={80} height={36} rx={8} fill={C.verm} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-30} y={-178} width={52} height={26} rx={6} fill={C.teal} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -80 -110 Q -120 -140 -118 -190" stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d="M -80 -110 Q -120 -140 -118 -190" stroke={C.camel} strokeWidth={22} fill="none" strokeLinecap="round" />
      <ellipse cx={-132} cy={-196} rx={30} ry={16} fill={C.camel} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-136} cy={-200} r={3.5} fill={KRP.ink} />
      <path d="M 88 -110 q 16 20 4 46" stroke={KRP.ink} strokeWidth={5} fill="none" />
    </g>
  );
};

const Nm054: React.FC<{ f: number }> = ({ f }) => {
  const tA = seg(f, 6, 18);
  const tB = seg(f, 10, 22);
  const cyc = f % 24;
  const gA = f >= 16 && cyc < 12 ? Math.sin((Math.PI * cyc) / 12) : 0;
  const gB = f >= 20 && cyc >= 12 ? Math.sin((Math.PI * (cyc - 12)) / 12) : 0;
  const camY = 18 * (1 - easeOut(seg(f, 0, 40)));
  const gazeX = gA > gB ? -7 : gB > 0 ? 7 : 0;
  const ax = 760, bx = 1160, ty = 450;
  const glow = (gx: number, gy: number, g: number) => g > 0 && (
    <g opacity={g}>
      <circle cx={gx} cy={gy} r={150} fill={KRP.yellow} opacity={0.22} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 + f / 30;
        return <line key={i} x1={gx + Math.cos(a) * 130} y1={gy + Math.sin(a) * 110} x2={gx + Math.cos(a) * 175} y2={gy + Math.sin(a) * 150} stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" />;
      })}
      <path d={`M ${gx + 100} ${gy - 100} l 10 26 l 26 10 l -26 10 l -10 26 l -10 -26 l -26 -10 l 26 -10 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
  return (
    <Frame f={f} seed={4054} bg={C.sky}>
      <g transform={`translate(0 ${camY - 10}) translate(960 540) scale(1.04) translate(-960 -540)`}>
        <rect x={-40} y={-60} width={W + 80} height={520} fill={C.sky} />
        {/* 奥: 城門と塔 */}
        <g>
          <rect x={700} y={300} width={520} height={136} fill={C.far} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 920 436 L 920 380 A 40 40 0 0 1 1000 380 L 1000 436 Z" fill={C.farDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={860} y={258} width={200} height={44} fill={C.farDark} stroke={KRP.ink} strokeWidth={4} />
          <NC1Roof x={960} y={218} w={240} h={40} lip={22} n={10} tile={C.farDark} dark={C.tileDark} ornament={false} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <rect x={1300 - (6 - i) * 6} y={140 + i * 50} width={60 + (6 - i) * 12} height={50} fill={C.far} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={1290 - (6 - i) * 6} y={136 + i * 50} width={80 + (6 - i) * 12} height={8} fill={C.farDark} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          ))}
          <line x1={1336} y1={100} x2={1336} y2={140} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 道 */}
        <rect x={-40} y={430} width={W + 80} height={700} fill={C.road} />
        <g stroke={C.stoneLine} strokeWidth={3} opacity={0.45}>
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={960} y1={430} x2={-1200 + i * 360} y2={1120} />)}
          {[0.05, 0.13, 0.25, 0.42, 0.65, 0.95].map((t) => <line key={t} x1={-40} y1={430 + 690 * t} x2={W + 40} y2={430 + 690 * t} />)}
        </g>
        {/* 通りの人とらくだ (奥) */}
        <NC1Camel x={560 + f * 1.2} y={575} s={0.55} f={f} />
        <PersonMini x={640 + f * 1.2} y={585} s={0.42} color={C.friend1} f={f} phase={1} />
        <PersonMini x={1320 - f * 1.5} y={600} s={0.46} color={C.teal} f={f} phase={2} />
        <PersonMini x={1390 - f * 1.5} y={606} s={0.44} color={C.sakuraDark} f={f} phase={3} />
        <PersonMini x={1060 - f * 0.6} y={520} s={0.3} color={C.friend3} f={f} phase={4} />
        <PersonMini x={820 + f * 0.7} y={510} s={0.28} color={C.verm} f={f} phase={5} />
        {/* 左右の店並び */}
        <NC1ShopRow f={f} wall={C.wall} banner={C.indigo} goods={[KRP.bronze, C.teal, KRP.yellow, C.verm]} phase={0} />
        <g transform="translate(1920 0) scale(-1 1)">
          <NC1ShopRow f={f} wall={C.woodPale} banner={C.verm} goods={[C.sakura, C.indigo, C.edge1, C.edge2]} phase={3} />
        </g>
        {/* 手前の役人 */}
        <ellipse cx={960} cy={995} rx={90} ry={16} fill={KRP.ink} opacity={0.18} />
        <NC1Official x={960} y={990} s={1.1} f={f} phase={2} pose="hold" face={f > 22 ? "smile" : "normal"} gaze={[gazeX, -6]} />
        {/* 頭から札へ点線 */}
        <g stroke={KRP.ink} strokeWidth={4} strokeDasharray="6 10" fill="none" opacity={0.7}>
          {tA > 0 && <path d={`M 940 640 Q 880 580 ${ax} ${ty + 92}`} />}
          {tB > 0 && <path d={`M 980 640 Q 1040 580 ${bx} ${ty + 92}`} />}
        </g>
        {glow(ax, ty, gA)}
        {glow(bx, ty, gB)}
        {/* 金の縁の札 (紫の布で中身が見えない) */}
        <g transform={`translate(${ax} ${ty + Math.sin(f / 12) * 6}) rotate(-6) scale(${pop(tA)})`}>
          <rect x={-130} y={-88} width={260} height={176} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-112} y={-70} width={224} height={140} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[[-118, -76], [118, -76], [-118, 76], [118, 76]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={9} fill={C.verm} stroke={KRP.ink} strokeWidth={3} />
          ))}
          <path d="M -104 -66 Q 0 -80 104 -66 L 106 50 Q 90 74 98 104 Q 56 88 20 106 Q -26 90 -64 108 Q -90 88 -106 96 Z"
            fill={C.silk} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -70 -62 Q -62 10 -76 90 M -16 -68 Q -4 20 -24 96 M 50 -68 Q 58 20 40 92" stroke={C.silkDark} strokeWidth={5} fill="none" />
          <path d="M -60 -66 Q 0 -54 60 -68" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.3} />
          <circle cx={0} cy={-68} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -56 L -10 -16 M 0 -56 L 10 -16" stroke={KRP.yellow} strokeWidth={6} />
        </g>
        {/* ふつうの木札 */}
        <g transform={`translate(${bx} ${ty + Math.sin(f / 12 + 2) * 6}) rotate(6) scale(${pop(tB)})`}>
          <path d="M -110 -60 L -80 -90 L 80 -90 L 110 -60 L 110 88 L -110 88 Z" fill={C.woodPale} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.wood} strokeWidth={4} fill="none">
            <path d="M -96 -40 Q 0 -30 96 -44" /><path d="M -96 10 Q 0 22 96 6" /><path d="M -96 56 Q 0 48 96 60" />
          </g>
          <circle cx={0} cy={-62} r={12} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -74 Q -20 -110 -6 -130" stroke={KRP.red} strokeWidth={5} fill="none" />
        </g>
        <TagPlate x={1640} y={120} text="唐の都・長安" size={38} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #55 本当の名前の「諱」と、ふだん呼ばれるための名前の「字」です。
// 格: 図 / seed 4055
// 絵: ★名前の2階建ての図。からくりの棚の上に**2段の箱**: 上の段は金の箱 (錠前つき)・札「諱 (本当の名前)」、下の段は木の箱 (扉が開いている)・札「字 (呼ぶための名前)」。f で下の段の扉から呼び名の札が出入りし、上の段は開かない
// どこ: からくり工房の板壁の前。床は板張り。壁に歯車
// 演出: 2段のからくり棚。上=金の箱 (鎖と大きな錠前)、下=木の箱 (扉が開いている)。下の箱から伸び縮みする腕が「呼び名の札」を外へ出し入れする
// 動き: 歯車が回る。腕が f で伸びて札を外に出し (声の輪が広がる)、引っ込める。上の箱はふたが少し持ち上がっては錠前に止められてガタン
const Nm055: React.FC<{ f: number }> = ({ f }) => {
  const ext = 0.5 + 0.5 * Math.cos((2 * Math.PI * (f - 45)) / 40);
  const rattle = f > 14 ? Math.max(0, Math.sin(((f - 14) * Math.PI) / 9)) * (Math.floor((f - 14) / 9) % 3 === 0 ? 1 : 0) : 0;
  const tA = seg(f, 4, 16);
  const tB = seg(f, 8, 20);
  const armX = 1080 + 420 * ext;
  return (
    <Frame f={f} seed={4055} bg={C.woodPale}>
      {/* 板壁 */}
      <rect x={-20} y={-20} width={W + 40} height={880} fill={C.woodPale} />
      <g stroke={C.wood} strokeWidth={4} opacity={0.7}>
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 160} y1={-20} x2={i * 160} y2={850} />)}
      </g>
      <g stroke={C.wood} strokeWidth={3} opacity={0.4} fill="none">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${i * 160 + 30} ${100 + rnd(55, i) * 500} q 20 ${30 + rnd(56, i) * 30} 0 ${70}`} />
        ))}
      </g>
      {/* 床 */}
      <rect x={-20} y={840} width={W + 40} height={260} fill={C.woodDark} />
      <g stroke={C.woodDeep} strokeWidth={4}>
        {[880, 940, 1020].map((yy) => <line key={yy} x1={-20} y1={yy} x2={W + 20} y2={yy} />)}
      </g>
      {/* 壁の歯車 (棚を動かす仕掛け) */}
      <NC1Gear x={250} y={300} r={110} teeth={14} rot={f * 1.4} />
      <NC1Gear x={402} y={438} r={64} teeth={9} rot={-f * 2.4 + 10} fill={KRP.copper} />
      <line x1={402} y1={438} x2={560} y2={640} stroke={KRP.ink} strokeWidth={10} />
      <line x1={402} y1={438} x2={560} y2={640} stroke={KRP.grayDark} strokeWidth={5} />
      {/* 棚の影 */}
      <ellipse cx={930} cy={846} rx={460} ry={22} fill={KRP.ink} opacity={0.22} />
      {/* からくり棚 */}
      <rect x={540} y={110} width={780} height={730} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
      <rect x={516} y={86} width={828} height={40} rx={8} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
      <rect x={570} y={146} width={720} height={320} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
      <rect x={570} y={496} width={720} height={320} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
      <rect x={540} y={466} width={780} height={30} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
      {[575, 1285].map((px) => <circle key={px} cx={px} cy={481} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />)}
      {/* 上の段: 金の箱 (錠前つき・開かない) */}
      <g>
        <rect x={640} y={250} width={580} height={196} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={660} y={270} width={540} height={156} rx={4} fill="none" stroke={C.emperorDark} strokeWidth={5} />
        <NC1Dragon x={760} y={360} s={0.7} color={C.emperorDark} />
        <NC1Dragon x={1100} y={360} s={0.7} color={C.emperorDark} rot={180} />
        <g transform={`rotate(${-rattle * 2.2} 640 250)`}>
          <rect x={626} y={190} width={608} height={66} rx={10} fill={C.emperor} stroke={KRP.ink} strokeWidth={6} />
          <rect x={646} y={204} width={568} height={10} fill={KRP.white} opacity={0.35} />
        </g>
        {[[640, 250], [1220, 250], [640, 446], [1220, 446]].map(([cx, cy], i) => (
          <rect key={i} x={cx - 18} y={cy - 18} width={36} height={36} fill={C.emperorDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 鎖 (X) */}
        {[0, 1].map((m) => (
          <g key={m}>
            {Array.from({ length: 11 }, (_, k) => {
              const t = k / 10;
              const cx = m === 0 ? lerp(660, 1200, t) : lerp(1200, 660, t);
              const cy = lerp(206, 440, t);
              return <ellipse key={k} cx={cx} cy={cy} rx={20} ry={11} fill="none" stroke={KRP.ink} strokeWidth={9}
                transform={`rotate(${m === 0 ? 24 : -24} ${cx} ${cy})`} />;
            })}
            {Array.from({ length: 11 }, (_, k) => {
              const t = k / 10;
              const cx = m === 0 ? lerp(660, 1200, t) : lerp(1200, 660, t);
              const cy = lerp(206, 440, t);
              return <ellipse key={k} cx={cx} cy={cy} rx={20} ry={11} fill="none" stroke={KRP.silver} strokeWidth={4}
                transform={`rotate(${m === 0 ? 24 : -24} ${cx} ${cy})`} />;
            })}
          </g>
        ))}
        {/* 大きな錠前 */}
        <g transform={`translate(930 ${300 + rattle * 4})`}>
          <path d="M -40 0 L -40 -46 A 40 40 0 0 1 40 -46 L 40 0" fill="none" stroke={KRP.ink} strokeWidth={22} />
          <path d="M -40 0 L -40 -46 A 40 40 0 0 1 40 -46 L 40 0" fill="none" stroke={KRP.silver} strokeWidth={13} />
          <rect x={-70} y={-6} width={140} height={112} rx={14} fill={C.bronze} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={38} r={14} fill={KRP.ink} />
          <polygon points="-8,44 8,44 12,80 -12,80" fill={KRP.ink} />
          <rect x={-58} y={4} width={116} height={10} fill={KRP.white} opacity={0.25} />
        </g>
        {rattle > 0.3 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={rattle}>
            <line x1={1010} y1={258} x2={1050} y2={236} /><line x1={1016} y1={290} x2={1062} y2={290} /><line x1={850} y1={258} x2={810} y2={236} />
          </g>
        )}
      </g>
      {/* 下の段: 木の箱 (扉が開いている) */}
      <g>
        <rect x={680} y={560} width={500} height={240} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={706} y={584} width={448} height={196} fill={C.interior} stroke={KRP.ink} strokeWidth={4} />
        {/* 開いた扉 */}
        <polygon points="680,560 610,530 610,830 680,800" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="1180,560 1250,530 1250,830 1180,800" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={626} cy={680} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={1234} cy={680} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        {/* 伸び縮みする腕 (ひし形の連なり) */}
        {(() => {
          const n = 5;
          const x0 = 760;
          const seg_ = (armX - x0) / n;
          const hgt = Math.max(26, 92 - seg_ * 0.5);
          const pts = Array.from({ length: n + 1 }, (_, i) => x0 + i * seg_);
          return (
            <g>
              {pts.slice(0, -1).map((px, i) => (
                <g key={i}>
                  <line x1={px} y1={690 - hgt / 2} x2={px + seg_} y2={690 + hgt / 2} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
                  <line x1={px} y1={690 + hgt / 2} x2={px + seg_} y2={690 - hgt / 2} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
                  <line x1={px} y1={690 - hgt / 2} x2={px + seg_} y2={690 + hgt / 2} stroke={KRP.brass} strokeWidth={6} strokeLinecap="round" />
                  <line x1={px} y1={690 + hgt / 2} x2={px + seg_} y2={690 - hgt / 2} stroke={KRP.brass} strokeWidth={6} strokeLinecap="round" />
                  <circle cx={px + seg_ / 2} cy={690} r={6} fill={KRP.ink} />
                </g>
              ))}
            </g>
          );
        })()}
        {/* 呼び名の札 */}
        <g transform={`translate(${armX + 60} 690) rotate(${Math.sin(f / 6) * 3})`}>
          <path d="M -60 -50 L -40 -70 L 40 -70 L 60 -50 L 60 70 L -60 70 Z" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-48} r={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <g stroke={C.wood} strokeWidth={4} fill="none"><path d="M -48 0 Q 0 8 48 -4" /><path d="M -48 36 Q 0 28 48 40" /></g>
          {ext > 0.55 && [1, 2, 3].map((k) => (
            <path key={k} d={`M ${70 + k * 24} -40 Q ${90 + k * 30} 0 ${70 + k * 24} 40`} fill="none" stroke={KRP.red}
              strokeWidth={6} strokeLinecap="round" opacity={(ext - 0.55) * 2.2 * (1 - k * 0.2)} />
          ))}
        </g>
      </g>
      <TagPlate x={1620} y={320} text="諱 (本当の名前)" size={40} t={tA} fill={C.slip} />
      <TagPlate x={270} y={690} text="字 (呼ぶための名前)" size={38} t={tB} />
      <Arrow x={600} y={690} s={0.6} t={tB} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #56 諱は、親や主君でもなければ、口にしてはいけないものでした。
// 格: 山 / seed 4056
// 絵: 屋敷の広間。上座の老父と主君 (Person) だけが巻物を見ながら口を開ける (小さな札が口から出る)。下座の友人たちは口を手でおさえている。障子・掛け軸 (絵のみ)・香炉の煙
// どこ: 古代中国の屋敷の広間。左に一段高い上座 (屏風の前)、右に下座の長机。奥に格子窓と山水の掛け軸、中央に香炉
// 演出: 上座の老父と主君が巻物を広げて読み、口を開けると小さな札がふわっと出る。下座の友人3人は両手で口をおさえる
// 動き: f10から札が口から浮いて昇る。f20〜28で友人がびくっと身を引き、口をおさえる。香の煙がゆらぐ。カメラが左から右へ少しパン
const NC1Friend: React.FC<{ x: number; y: number; s: number; f: number; phase: number; cloth: string; jolt: number }> = ({
  x, y, s, f, phase, cloth, jolt,
}) => {
  const up = easeOut(jolt);
  const dy = -Math.sin(jolt * Math.PI) * 14;
  const sx = (m: number) => m * 60 * s;
  const sy = -140 * s;
  const hx = (m: number) => lerp(m * 60, m * 12, up) * s;
  const hy = lerp(-120, -186, up) * s;
  return (
    <g transform={`translate(0 ${dy})`}>
      <Person x={x} y={y} s={s} f={f} phase={phase} face="worried" cloth={cloth} gaze={[-6, 0]} still />
      <g transform={`translate(${x} ${y})`}>
        {[-1, 1].map((m) => (
          <g key={m}>
            <line x1={sx(m)} y1={sy} x2={hx(m)} y2={hy} stroke={KRP.ink} strokeWidth={31 * s} strokeLinecap="round" />
            <line x1={sx(m)} y1={sy} x2={hx(m)} y2={hy} stroke={cloth} strokeWidth={22 * s} strokeLinecap="round" />
            <circle cx={hx(m) * 0.9} cy={hy} r={15 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {jolt > 0.3 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={Math.min(1, jolt * 1.5)}>
            <line x1={-80 * s} y1={-290 * s} x2={-100 * s} y2={-320 * s} />
            <line x1={0} y1={-310 * s} x2={0} y2={-346 * s} />
            <line x1={80 * s} y1={-290 * s} x2={100 * s} y2={-320 * s} />
          </g>
        )}
        <path d={`M ${56 * s} ${-250 * s} q 8 14 0 22 q -8 -8 0 -22 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
    </g>
  );
};

const Nm056: React.FC<{ f: number }> = ({ f }) => {
  const pan = 24 * Math.sin(Math.min(f, 90) / 90 * Math.PI / 2);
  const jolt = seg(f, 20, 30);
  const words = (mx: number, my: number, start: number, dir: number) =>
    [0, 1].map((k) => {
      const p = (f - start - k * 14) / 30;
      if (p < 0) return null;
      const q = p % 1;
      const tx = mx + dir * (96 + q * 80);
      const ty = my - 70 - q * 130;
      return (
        <g key={k} transform={`translate(${tx} ${ty}) rotate(${dir * (8 - q * 14)}) scale(${0.6 + 0.4 * Math.min(1, q * 4)})`} opacity={1 - q * 0.6}>
          <rect x={-34} y={-22} width={68} height={44} rx={6} fill={C.woodPale} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-18} y1={-6} x2={18} y2={-6} stroke={C.woodDark} strokeWidth={5} />
          <line x1={-18} y1={8} x2={10} y2={8} stroke={C.woodDark} strokeWidth={5} />
          <path d={`M ${-dir * 34} 0 q ${-dir * 14} 8 ${-dir * 26} 20`} stroke={KRP.ink} strokeWidth={3} fill="none" />
        </g>
      );
    });
  return (
    <Frame f={f} seed={4056} bg={C.wall}>
      <g transform={`translate(${12 - pan} 0) translate(960 540) scale(1.04) translate(-960 -540)`}>
        {/* 奥の壁と天井の梁 */}
        <rect x={-60} y={-40} width={W + 120} height={700} fill={C.wall} />
        <rect x={-60} y={-40} width={W + 120} height={110} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-40 + i * 170} y={50} width={34} height={36} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {[40, 1880].map((px) => (
          <rect key={px} x={px - 36} y={70} width={72} height={600} fill={C.vermDark} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 格子窓 (光) */}
        <g>
          <rect x={1440} y={140} width={360} height={330} fill={KRP.yellow} opacity={0.35} />
          <rect x={1440} y={140} width={360} height={330} fill="none" stroke={C.woodDeep} strokeWidth={12} />
          <g stroke={C.woodDeep} strokeWidth={6}>
            {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={1440 + (i + 1) * 45} y1={140} x2={1440 + (i + 1) * 45} y2={470} />)}
            {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1={1440} y1={140 + (i + 1) * 47} x2={1800} y2={140 + (i + 1) * 47} />)}
          </g>
          <polygon points="1440,470 1800,470 1700,660 1300,660" fill={KRP.yellow} opacity={0.16} />
        </g>
        {/* 山水の掛け軸 (絵だけ) */}
        <g transform={`rotate(${Math.sin(f / 30) * 0.6} 960 90)`}>
          <line x1={960} y1={70} x2={960} y2={96} stroke={KRP.ink} strokeWidth={4} />
          <rect x={830} y={96} width={260} height={400} fill={C.teal} stroke={KRP.ink} strokeWidth={5} />
          <rect x={856} y={130} width={208} height={330} fill={C.slip} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 860 330 L 910 210 L 950 290 L 1000 170 L 1060 330 Z" fill={C.far} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 870 380 L 930 300 L 980 380 Z" fill={C.farDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 860 400 Q 960 390 1060 410" stroke={C.pond} strokeWidth={6} fill="none" />
          <path d="M 970 418 l 40 0 l -8 10 l -26 0 z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={1030} cy={170} r={14} fill={C.verm} opacity={0.7} />
          <rect x={820} y={490} width={280} height={16} rx={8} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 床 */}
        <rect x={-60} y={660} width={W + 120} height={460} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.woodDark} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 15 }, (_, i) => <line key={i} x1={960 + (i - 7) * 150} y1={660} x2={960 + (i - 7) * 330} y2={1100} />)}
        </g>
        <polygon points="760,700 1160,700 1260,1000 660,1000" fill={C.verm} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="790,716 1130,716 1220,980 700,980" fill="none" stroke={KRP.brass} strokeWidth={6} />
        {/* 上座: 屏風と一段高い台 */}
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <polygon points={`${150 + i * 160},${i % 2 ? 250 : 240} ${310 + i * 160},${i % 2 ? 240 : 250} ${310 + i * 160},600 ${150 + i * 160},600`}
                fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
              <rect x={150 + i * 160} y={i % 2 ? 240 : 240} width={160} height={14} fill={C.woodDeep} />
            </g>
          ))}
          <path d="M 190 520 Q 300 440 420 500 Q 520 420 660 470 Q 720 440 770 480" stroke={C.far} strokeWidth={10} fill="none" />
          <g transform="translate(250 330)">
            <ellipse rx={34} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 20 -6 Q 40 -30 54 -36" stroke={KRP.ink} strokeWidth={4} fill="none" />
            <circle cx={56} cy={-38} r={6} fill={KRP.red} />
            <path d="M -30 0 Q -60 -24 -40 -30 Q -30 -14 -10 -10" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <circle cx={700} cy={320} r={26} fill={C.verm} opacity={0.6} />
          <rect x={110} y={600} width={720} height={44} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
          <rect x={110} y={644} width={720} height={60} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {[180, 470, 760].map((px) => <rect key={px} x={px - 30} y={656} width={60} height={36} rx={6} fill="none" stroke={KRP.brass} strokeWidth={4} />)}
        </g>
        {/* 老父 */}
        <g>
          <Person x={330} y={630} s={0.85} f={f} phase={1} face="surprised" pose="hold" cloth={C.gray1} clothDark="#43505C" hair="none" gaze={[6, 5]} />
          <circle cx={330} cy={630 - 288 * 0.85} r={22} fill={C.hairGray} stroke={KRP.ink} strokeWidth={4} />
          <rect x={322} y={630 - 304 * 0.85} width={16} height={22} rx={4} fill={C.woodDeep} />
          <path d={`M ${330 - 44} ${630 - 180 * 0.85} Q ${330} ${630 - 108 * 0.85} ${330 + 44} ${630 - 180 * 0.85} Q ${330 + 14} ${630 - 168 * 0.85} ${330} ${630 - 172 * 0.85} Q ${330 - 14} ${630 - 168 * 0.85} ${330 - 44} ${630 - 180 * 0.85} Z`}
            fill={C.beard} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={C.hairGray} strokeWidth={6} strokeLinecap="round">
            <line x1={330 - 46} y1={630 - 254 * 0.85} x2={330 - 18} y2={630 - 250 * 0.85} />
            <line x1={330 + 18} y1={630 - 250 * 0.85} x2={330 + 46} y2={630 - 254 * 0.85} />
          </g>
        </g>
        {/* 主君 */}
        <g>
          <Person x={620} y={630} s={0.9} f={f} phase={3} face="surprised" pose="hold" cloth={C.lordRobe} clothDark={C.lordDark} hair="cap" gaze={[-6, 5]} />
          <rect x={620 - 34} y={630 - 330 * 0.9} width={68} height={50} rx={8} fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
          <line x1={620 - 60} y1={630 - 306 * 0.9} x2={620 + 60} y2={630 - 306 * 0.9} stroke={KRP.brass} strokeWidth={7} strokeLinecap="round" />
          <rect x={620 - 52} y={630 - 98 * 0.9} width={104} height={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 二人で広げる巻物 */}
        <g>
          <path d={`M 344 528 Q 470 ${514 + Math.sin(f / 12) * 4} 604 522 L 604 556 Q 470 ${548 + Math.sin(f / 12) * 4} 344 562 Z`} fill={C.slip} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={372 + i * 26} y1={530} x2={372 + i * 26} y2={552} />)}
          </g>
          <rect x={334} y={518} width={16} height={52} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
          <rect x={598} y={512} width={16} height={52} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {words(330, 630 - 186 * 0.85, 10, -1)}
        {words(620, 630 - 186 * 0.9, 14, 1)}
        {/* 中央の香炉 */}
        <NC1Censer x={960} y={790} s={1} />
        <NC1Smoke x={960} y={680} f={f} h={330} />
        {/* 下座: 長机と友人たち */}
        {([[1250, C.friend1, 0], [1470, C.friend2, 1], [1690, C.friend3, 2]] as const).map(([px, cl, i]) => (
          <NC1Friend key={i} x={px} y={930} s={0.82} f={f} phase={i + 4} cloth={cl} jolt={seg(f, 20 + i * 2, 30 + i * 2)} />
        ))}
        <rect x={1100} y={826} width={760} height={30} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1120} y={856} width={720} height={90} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <g>
          <rect x={1210} y={806} width={60} height={22} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={1600} cy={818} rx={30} ry={10} fill={C.teal} stroke={KRP.ink} strokeWidth={3} />
          <rect x={1580} y={790} width={40} height={28} rx={8} fill={C.teal} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <TagPlate x={330} y={330} text="親" size={36} t={seg(f, 2, 12)} />
        <TagPlate x={620} y={300} text="主君" size={36} t={seg(f, 4, 14)} />
        <TagPlate x={1470} y={610} text="友人" size={36} t={seg(f, 8, 18)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #57 とくに、皇帝の諱は特別です。
// 格: 山 / seed 4057
// 絵: 宮殿の玉座の間。黄色い龍の袍の皇帝の**後ろ姿** (顔は見せない) が玉座に座り、玉座の背の上に、金の札が布に包まれて浮かぶ。左右に役人がずらりと頭を下げる。赤い柱・金の装飾・香の煙。カメラがゆっくり玉座に寄る
// どこ: 宮殿の玉座の間。カメラは玉座のすぐ後ろ。奥へ赤い柱の列と開いた大扉 (光)
// 演出: 手前に龍を彫った朱の玉座の背と、黄色い龍の袍の皇帝の後ろ姿。頭上に布で包まれた金の札が光を放って浮かぶ。左右に役人がずらりと頭を下げる
// 動き: 金の札がぽんと現れ光の筋が回る (f8〜20)。役人が奥から手前へ順に頭を下げる (f14〜38)。香の煙。カメラがゆっくり玉座に寄る
const Nm057: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.12 * easeInOut(clamp01(f / 90));
  const tTag = seg(f, 8, 20);
  const rows: [number, number, number][] = [
    [770, 600, 0.26], [720, 640, 0.32], [650, 696, 0.4], [545, 776, 0.48], [395, 880, 0.56],
  ];
  const VX = 960, VY = 380;
  return (
    <Frame f={f} seed={4057} bg={C.vermDeep}>
      <g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
        {/* 奥の壁と大扉の光 */}
        <rect x={-60} y={-60} width={W + 120} height={680} fill={C.vermDark} />
        <rect x={790} y={240} width={340} height={340} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <rect x={790} y={470} width={340} height={110} fill={C.stone} />
        <NC1Roof x={960} y={400} w={240} h={40} lip={16} n={10} ornament={false} tile={C.far} />
        <polygon points="790,580 1130,580 1360,1080 560,1080" fill={KRP.cream} opacity={0.18} />
        {[-1, 1].map((m) => (
          <rect key={m} x={m === -1 ? 740 : 1130} y={240} width={50} height={340} fill={C.verm} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 天井の格天井 */}
        <rect x={-60} y={-60} width={W + 120} height={200} fill={C.tealDark} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60 + i * 150} y1={-60} x2={-60 + i * 150} y2={140} />)}
          {[20, 80].map((yy) => <line key={yy} x1={-60} y1={yy} x2={W + 60} y2={yy} />)}
        </g>
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <circle cx={15 + i * 150} cy={50} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={15 + i * 150} cy={110} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={-60} y={140} width={W + 120} height={40} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 床 (金の石) */}
        <rect x={-60} y={580} width={W + 120} height={560} fill={C.stoneDark} />
        <g stroke={C.stoneLine} strokeWidth={4} opacity={0.7}>
          {Array.from({ length: 15 }, (_, i) => { const bx = -1400 + i * 340; return <line key={i} x1={VX + (bx - VX) * (200 / 760)} y1={580} x2={bx} y2={1140} />; })}
          {[600, 632, 680, 750, 850, 990].map((yy) => <line key={yy} x1={-60} y1={yy} x2={W + 60} y2={yy} />)}
        </g>
        <polygon points="880,580 1040,580 1240,1140 680,1140" fill={C.verm} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
        {/* 赤い柱の列 (奥→手前) */}
        {([[640, 180, 600, 46], [470, 180, 700, 74], [170, 180, 900, 120]] as const).map(([px, top, bot, w], i) => (
          [px, 1920 - px].map((qx, j) => (
            <g key={`${i}-${j}`}>
              <rect x={qx - w / 2} y={top} width={w} height={bot - top} fill={C.verm} stroke={KRP.ink} strokeWidth={5} />
              <rect x={qx - w / 2 - 4} y={top + 30} width={w + 8} height={w * 0.6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
              <line x1={qx - w * 0.2} y1={top + 40 + w * 0.6} x2={qx - w * 0.2} y2={bot - 10} stroke={KRP.white} strokeWidth={w * 0.08} opacity={0.3} />
              <rect x={qx - w / 2 - 8} y={bot - 16} width={w + 16} height={20} rx={4} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
              {i === 2 && <NC1Dragon x={qx} y={top + 260} s={0.9} rot={-70 + j * 140} />}
            </g>
          ))
        ))}
        {/* 左右の役人の列 */}
        {rows.map(([px, py, ps], i) => (
          [1, -1].map((dir) => {
            const b = easeOut(seg(f, 14 + i * 4, 26 + i * 4));
            const x = dir === 1 ? px : 1920 - px;
            return (
              <g key={`${i}${dir}`}>
                <ellipse cx={x} cy={py + 3} rx={60 * ps} ry={10 * ps} fill={KRP.ink} opacity={0.2} />
                <NC1Official x={x} y={py} s={ps} f={f} phase={i + (dir === 1 ? 0 : 5)} bow={b} dir={dir as 1 | -1} closed={b > 0.5} pose="hold" />
              </g>
            );
          })
        ))}
        {/* 香炉 */}
        <NC1Censer x={600} y={960} s={0.9} />
        <NC1Censer x={1320} y={960} s={0.9} />
        <NC1Smoke x={600} y={860} f={f} h={300} s={0.9} />
        <NC1Smoke x={1320} y={860} f={f} h={300} s={0.9} phase={30} />
        {/* 金の札 (布に包まれて浮かぶ) */}
        <g transform={`translate(960 ${410 + Math.sin(f / 12) * 6})`}>
          <g opacity={tTag}>
            <circle r={150} fill={KRP.yellow} opacity={0.25} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI) / 6 + f / 40;
              return <line key={i} x1={Math.cos(a) * 120} y1={Math.sin(a) * 110} x2={Math.cos(a) * 190} y2={Math.sin(a) * 170}
                stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
          <g transform={`scale(${pop(tTag)})`}>
            <rect x={-96} y={-66} width={192} height={132} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -104 -70 Q 0 -90 104 -70 L 108 40 Q 70 76 84 96 Q 30 74 0 98 Q -30 74 -84 96 Q -70 76 -108 40 Z" fill={C.emperor} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -60 -66 Q -50 20 -64 86 M 60 -66 Q 50 20 64 86" stroke={C.emperorDark} strokeWidth={5} fill="none" />
            <path d="M -104 -6 Q 0 10 104 -6" stroke={KRP.red} strokeWidth={10} fill="none" />
            <circle cx={0} cy={2} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -6 16 L -16 56 M 6 16 L 16 56" stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
            <path d="M -70 -60 Q 0 -74 70 -62" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.4} />
          </g>
        </g>
        {/* 皇帝の後ろ姿 (顔は見せない) */}
        <g>
          <NC1Official x={960} y={880} s={1.2} f={f} phase={0} back pose="stand" cloth={C.emperor} clothDark={C.emperorDark} />
          <rect x={960 - 72} y={880 - 300 * 1.2} width={144} height={12} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={960} cy={742} r={40} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={960} cy={742} r={31} fill={C.emperorDark} />
          <NC1Dragon x={954} y={742} s={0.38} color={KRP.yellow} />
          {[-1, 1].map((m) => (
            <path key={m} d={`M ${960 + m * 66} 712 Q ${960 + m * 150} 740 ${960 + m * 176} 850 L ${960 + m * 112} 860 Q ${960 + m * 96} 790 ${960 + m * 62} 770 Z`}
              fill={C.emperor} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        {/* 玉座の背 (手前) */}
        <g>
          <path d="M 690 1100 L 690 860 Q 690 820 740 826 Q 800 800 850 820 Q 905 780 960 790 Q 1015 780 1070 820 Q 1120 800 1180 826 Q 1230 820 1230 860 L 1230 1100 Z"
            fill={C.verm} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 720 1100 L 720 870 Q 960 820 1200 870 L 1200 1100" fill="none" stroke={KRP.brass} strokeWidth={10} />
          <NC1Dragon x={900} y={930} s={1.2} />
          <NC1Dragon x={1050} y={960} s={0.9} rot={180} />
          {[-1, 1].map((m) => (
            <g key={m}>
              <rect x={m === -1 ? 640 : 1230} y={880} width={50} height={220} fill={C.vermDark} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={m === -1 ? 665 : 1255} cy={874} r={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #58 唐の皇帝、李世民が亡くなったあと、「民」の字を使うことが避けられました。
// 格: 山 / seed 4058
// 絵: 唐の役所の書庫。役人たちが大きな紙の帳簿から「民」の字を探して、上から紙を貼って隠していく (f で紙が次々貼られる)。壁の大きな書の掛け物の「民」の字も布で覆われる。札「唐」。※字幕と重ならない位置に「民」を大きく1つ
// どこ: 唐の役所の書庫。右に巻物と綴じ本の棚、左の壁に「民」の大きな書の掛け物
// 演出: 大机の上の大きな帳簿。奥の役人が「民」の字の上に紙を貼っていく。右の役人が次の「民」を指さして見つける。左の役人が綱を引いて掛け物に布を下ろす
// 動き: f8/18/28 で帳簿の「民」に紙が1枚ずつ貼られる。f20〜40 で掛け物の上から藍の布が下りてきて「民」に届く。カメラが帳簿の上を少しパン
const Nm058: React.FC<{ f: number }> = ({ f }) => {
  const spots: [number, number, number][] = [[620, 622, 8], [800, 664, 18], [1130, 616, 28], [1330, 660, 999]];
  const cloth = 92 + 140 * easeOut(seg(f, 20, 40));
  const pan = -14 * Math.sin(Math.min(f, 80) / 80 * Math.PI / 2);
  // 次に貼る場所 (奥の役人の手の紙)
  const next = spots.find(([, , st]) => f < st + 4) ?? spots[3];
  const handX = lerp(960, next[0], 0.6);
  const handY = lerp(560, next[1] - 46, 0.5);
  return (
    <Frame f={f} seed={4058} bg={C.woodPale}>
      <g transform={`translate(${pan} 0) translate(960 540) scale(1.03) translate(-960 -540)`}>
        {/* 壁 */}
        <rect x={-60} y={-40} width={W + 120} height={720} fill={C.wallShade} />
        <g stroke={C.wood} strokeWidth={3} opacity={0.5}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-40 + i * 150} y1={-40} x2={-40 + i * 150} y2={680} />)}
        </g>
        <rect x={-60} y={-40} width={W + 120} height={60} fill={C.woodDeep} />
        {/* 右の棚: 巻物と綴じ本 */}
        <g>
          <rect x={1180} y={30} width={780} height={640} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={1180} y={30 + r * 160} width={780} height={16} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 11 }, (_, c) => {
                const bx = 1210 + c * 64;
                const by = 60 + r * 160;
                const kind = (r + c) % 3;
                return kind === 0 ? (
                  <g key={c}>
                    {[0, 1, 2].map((k) => (
                      <rect key={k} x={bx} y={by + 70 - k * 34} width={54} height={30} rx={3} fill={[C.indigo, C.teal, C.indigoDark][k]} stroke={KRP.ink} strokeWidth={3} />
                    ))}
                  </g>
                ) : (
                  <g key={c}>
                    {[0, 1].map((k) => (
                      <g key={k}>
                        <circle cx={bx + 14 + k * 26} cy={by + 90} r={14} fill={C.slip} stroke={KRP.ink} strokeWidth={3} />
                        <circle cx={bx + 14 + k * 26} cy={by + 90} r={5} fill={C.woodDark} />
                        <circle cx={bx + 27} cy={by + 60 - k * 10} r={13} fill={C.slip} stroke={KRP.ink} strokeWidth={3} />
                      </g>
                    ))}
                    <rect x={bx + 20} y={by + 100} width={10} height={20} fill={kind === 1 ? C.verm : C.edge1} stroke={KRP.ink} strokeWidth={2} />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
        {/* 左の壁: 「民」の書の掛け物と下りてくる布 */}
        <g>
          <line x1={570} y1={20} x2={570} y2={60} stroke={KRP.ink} strokeWidth={5} />
          <rect x={410} y={60} width={320} height={480} fill={C.teal} stroke={KRP.ink} strokeWidth={6} />
          <rect x={436} y={100} width={268} height={400} fill={C.slip} stroke={KRP.ink} strokeWidth={4} />
          <text x={570} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={230} fill={KRP.ink}>民</text>
          <rect x={656} y={450} width={30} height={30} fill={KRP.red} opacity={0.85} />
          <rect x={400} y={536} width={340} height={18} rx={9} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
          {/* 布 */}
          <path d={`M 392 72 L 748 72 L 748 ${cloth} Q 700 ${cloth + 18} 660 ${cloth + 4} Q 610 ${cloth + 22} 570 ${cloth + 6} Q 520 ${cloth + 22} 480 ${cloth + 4} Q 430 ${cloth + 20} 392 ${cloth} Z`}
            fill={C.indigo} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.indigoDark} strokeWidth={5} fill="none">
            <path d={`M 470 80 Q 480 ${(cloth + 80) / 2} 470 ${cloth}`} /><path d={`M 660 80 Q 650 ${(cloth + 80) / 2} 660 ${cloth}`} />
          </g>
          <rect x={384} y={60} width={372} height={24} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 滑車と綱 */}
          <circle cx={360} cy={60} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <line x1={384} y1={68} x2={360} y2={60} stroke={C.rope} strokeWidth={6} />
          <line x1={342} y1={66} x2={268} y2={676} stroke={C.rope} strokeWidth={6} />
        </g>
        {/* 床 */}
        <rect x={-60} y={680} width={W + 120} height={440} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.woodDeep} strokeWidth={4} opacity={0.6}>
          {[740, 820, 930, 1060].map((yy) => <line key={yy} x1={-60} y1={yy} x2={W + 60} y2={yy} />)}
        </g>
        {/* 奥の役人 (机の向こうで紙を貼る) */}
        <NC1Official x={960} y={640} s={0.78} f={f} phase={1} pose="hold" face="normal" gaze={[(next[0] - 960) / 60, 6]} />
        {/* 大机 */}
        <polygon points="360,560 1560,560 1640,720 280,720" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={280} y={720} width={1360} height={100} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {[320, 1600].map((px) => <rect key={px} x={px - 20} y={820} width={40} height={110} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 帳簿 (見開き) */}
        <g>
          <polygon points="470,578 1450,578 1500,706 420,706" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={960} y1={578} x2={960} y2={706} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={0.75}>
            {Array.from({ length: 24 }, (_, c) => {
              const t = c / 23;
              const xt = lerp(500, 1420, t), xb = lerp(455, 1465, t);
              if (Math.abs(xt - 960) < 18) return null;
              return Array.from({ length: 5 }, (_, r) => {
                const u = (r + 0.5) / 5;
                const y1 = lerp(588, 696, u);
                const x1 = lerp(xt, xb, u);
                return rnd(58, c * 7 + r) > 0.2 ? <line key={`${c}-${r}`} x1={x1} y1={y1} x2={x1 + 1} y2={y1 + 12} /> : null;
              });
            })}
          </g>
          {spots.map(([sx, sy, st], i) => {
            const p = seg(f, st, st + 4);
            return (
              <g key={i}>
                <circle cx={sx} cy={sy} r={24} fill="none" stroke={KRP.red} strokeWidth={5} />
                <text x={sx} y={sy + 11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>民</text>
                {p > 0 && (
                  <g transform={`translate(${sx} ${sy}) rotate(${(i % 2 ? 6 : -5)}) scale(${pop(p)})`}>
                    <rect x={-28} y={-30} width={56} height={60} rx={3} fill={C.slip} stroke={KRP.ink} strokeWidth={4} />
                    <path d="M -20 -18 L 20 -18" stroke={C.woodPale} strokeWidth={5} />
                  </g>
                )}
              </g>
            );
          })}
        </g>
        {/* 奥の役人の手の紙と糊刷毛 */}
        {(
          <g transform={`translate(${handX} ${handY + Math.sin(f / 3) * 3})`}>
            <rect x={-26} y={-30} width={52} height={56} rx={3} fill={C.slip} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        <g transform={`translate(1000 ${548 + Math.sin(f / 4) * 4}) rotate(30)`}>
          <rect x={-5} y={-50} width={10} height={50} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={2.5} />
          <rect x={-12} y={0} width={24} height={18} rx={3} fill={C.slip} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="translate(1520 598)">
          <path d="M -30 0 L 30 0 L 24 30 L -24 30 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={30} ry={8} fill={C.slip} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 左の役人: 綱を引いて布を下ろす */}
        <NC1Official x={210} y={880} s={0.88} f={f} phase={3} pose="raise" face="worried" lean={-4} gaze={[4, -6]} />
        {/* 右の役人: 次の「民」を見つけて指さす */}
        <NC1Official x={1720} y={880} s={0.88} f={f} phase={5} pose="point" pointDir={-1} face="surprised" gaze={[-7, 3]} />
        <TagPlate x={1800} y={110} text="唐" size={48} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #59 その結果、国の役所「民部」の名前まで、「戸部」に変えられてしまいます。
// 格: 山 / seed 4059
// 絵: ★役所の門の前。職人が足場に登って、門の上の看板「民部」を外し、「戸部」の看板を吊り上げる (滑車とロープ・f で看板が入れ替わる)。下で役人たちが見上げる。札は看板の文字そのもの (「民部」→「戸部」)
// どこ: 唐の都の役所の門の前 (昼)。門の左に竹の足場、梁に滑車
// 演出: 足場の上の職人が外した「民部」の看板を綱で下ろす。右の職人が綱をたぐって「戸部」の看板を梁へ吊り上げる。下で役人3人が見上げる
// 動き: f2〜16 で「民部」が外れて左下へ。f12〜38 で「戸部」が上がってカチッとはまる (光と土ぼこり)。カメラが少し上へ振る
const NC1Worker: React.FC<{ x: number; y: number; s: number; f: number; phase: number; pose: Pose; face: Face; lean?: number; gaze?: [number, number] }> = ({
  x, y, s, f, phase, pose, face, lean = 0, gaze = [0, -6],
}) => (
  <g>
    <Person x={x} y={y} s={s} f={f} phase={phase} pose={pose} face={face} lean={lean} gaze={gaze} cloth={C.worker} clothDark={C.workerDark} />
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      <rect x={-64} y={-262} width={128} height={16} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 60 -258 l 24 -8 l -4 20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-58} y={-96} width={116} height={10} fill={C.rope} />
    </g>
  </g>
);

const Nm059: React.FC<{ f: number }> = ({ f }) => {
  const e1 = easeOut(seg(f, 2, 16));
  const e2 = easeOut(seg(f, 12, 38));
  const click = seg(f, 36, 42);
  const oldX = lerp(1040, 640, e1), oldY = lerp(340, 560, e1), oldR = lerp(0, -10, e1);
  const newY = lerp(640, 340, e2);
  const camY = -16 * easeInOut(clamp01(f / 60));
  return (
    <Frame f={f} seed={4059} bg={C.sky}>
      <g transform={`translate(0 ${12 + camY}) translate(960 540) scale(1.03) translate(-960 -540)`}>
        <rect x={-60} y={-60} width={W + 120} height={960} fill={C.sky} />
        {([[220, 120], [1780, 200]] as const).map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy})`}>
            <path d="M -120 20 Q -120 -16 -80 -14 Q -60 -50 -10 -38 Q 30 -64 70 -30 Q 120 -34 120 20 Z" fill={C.cloud} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 遠くの都の塀 */}
        <rect x={-60} y={620} width={W + 120} height={120} fill={C.far} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-60} y={606} width={W + 120} height={18} fill={C.farDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 広場 */}
        <rect x={-60} y={830} width={W + 120} height={300} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={C.stoneLine} strokeWidth={3} opacity={0.5}>
          {[870, 930, 1010].map((yy) => <line key={yy} x1={-60} y1={yy} x2={W + 60} y2={yy} />)}
        </g>
        <NC1Gate x={1040} y={840} s={1} />
        {/* 梁の滑車 */}
        <g>
          <rect x={1028} y={196} width={24} height={30} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={1040} cy={240} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1040} cy={240} r={6} fill={KRP.ink} />
          <circle cx={1040} cy={240} r={14} fill="none" stroke={KRP.ink} strokeWidth={2} strokeDasharray="4 4" transform={`rotate(${f * 8 * (f < 38 ? 1 : 0)} 1040 240)`} />
        </g>
        {/* 竹の足場 */}
        <g>
          {[460, 770].map((px) => (
            <g key={px}>
              <line x1={px} y1={190} x2={px} y2={850} stroke={KRP.ink} strokeWidth={20} />
              <line x1={px} y1={190} x2={px} y2={850} stroke={C.bamboo} strokeWidth={12} />
              {[300, 480, 660].map((ny) => <line key={ny} x1={px - 10} y1={ny} x2={px + 10} y2={ny} stroke={C.bambooDark} strokeWidth={4} />)}
            </g>
          ))}
          {[640].map((yy) => (
            <g key={yy}>
              <line x1={440} y1={yy} x2={790} y2={yy} stroke={KRP.ink} strokeWidth={18} />
              <line x1={440} y1={yy} x2={790} y2={yy} stroke={C.bamboo} strokeWidth={10} />
            </g>
          ))}
          <line x1={460} y1={640} x2={770} y2={840} stroke={C.bambooDark} strokeWidth={10} />
          <line x1={460} y1={436} x2={770} y2={630} stroke={C.bambooDark} strokeWidth={10} />
          {/* 足場の板 */}
          <rect x={440} y={420} width={360} height={18} fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
          {[460, 770].map((px) => [420, 640].map((ny) => (
            <path key={`${px}-${ny}`} d={`M ${px - 12} ${ny - 6} l 24 18 M ${px + 12} ${ny - 6} l -24 18`} stroke={C.rope} strokeWidth={5} />
          )))}
          {/* 梁へ渡した横木 */}
          <line x1={460} y1={210} x2={1060} y2={210} stroke={KRP.ink} strokeWidth={16} />
          <line x1={460} y1={210} x2={1060} y2={210} stroke={C.bamboo} strokeWidth={9} />
        </g>
        {/* 上の職人 (足場の上で「民部」を下ろす) */}
        <NC1Worker x={590} y={422} s={0.62} f={f} phase={1} pose="hold" face="worried" lean={4} gaze={[4, 6]} />
        {/* 「民部」 (外されて下ろされる) */}
        <line x1={600} y1={350} x2={oldX - 90} y2={oldY - 70} stroke={C.rope} strokeWidth={6} />
        <line x1={600} y1={350} x2={oldX + 90} y2={oldY - 70} stroke={C.rope} strokeWidth={6} />
        <NC1Sign x={oldX} y={oldY} w={300} h={110} text="民部" rot={oldR} size={78} />
        {/* 「戸部」 (吊り上げられる) */}
        <line x1={1040} y1={258} x2={1040} y2={newY - 70} stroke={C.rope} strokeWidth={7} />
        <path d={`M ${1040 - 100} ${newY - 64} L 1040 ${newY - 70} L ${1040 + 100} ${newY - 64}`} stroke={C.rope} strokeWidth={6} fill="none" />
        <line x1={1060} y1={240} x2={1712} y2={716} stroke={C.rope} strokeWidth={7} />
        {click > 0 && (
          <g opacity={Math.sin(click * Math.PI) * 0.9 + 0.1}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={i} x1={1040 + Math.cos(a) * 200} y1={340 + Math.sin(a) * 90} x2={1040 + Math.cos(a) * 240} y2={340 + Math.sin(a) * 110} stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        <NC1Sign x={1040} y={newY} w={300} h={110} text="戸部" rot={Math.sin(f / 5) * 2.5 * (1 - e2)} size={78} />
        {e2 > 0 && e2 < 1 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            {[-120, 0, 120].map((dx) => <line key={dx} x1={1040 + dx} y1={newY + 90} x2={1040 + dx} y2={newY + 130} />)}
          </g>
        )}
        {/* 右の職人 (綱をたぐる) */}
        <ellipse cx={1660} cy={884} rx={70} ry={12} fill={KRP.ink} opacity={0.18} />
        <NC1Worker x={1660} y={880} s={0.7} f={f} phase={2} pose="raise" face={f > 38 ? "smile" : "worried"} lean={8} gaze={[-6, -6]} />
        <g transform="translate(1760 880)">
          {[0, 1, 2].map((k) => <ellipse key={k} cx={0} cy={-8 - k * 10} rx={44 - k * 6} ry={10} fill="none" stroke={C.rope} strokeWidth={7} />)}
        </g>
        {/* 見上げる役人たち */}
        {([[860, "surprised", "hold", 0], [1040, "surprised", "raise", 1], [1220, "worried", "armsFolded", 2]] as const).map(([px, fc, ps, i]) => (
          <g key={i}>
            <ellipse cx={px} cy={904} rx={56} ry={10} fill={KRP.ink} opacity={0.18} />
            <NC1Official x={px} y={900} s={0.6} f={f} phase={i + 3} face={fc} pose={ps} gaze={[0, -9]} lean={i === 1 ? 0 : (i === 0 ? -3 : 3)} />
          </g>
        ))}
        <TagPlate x={1820} y={110} text="唐" size={48} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #60 ひとりの名前のために、役所の看板が書きかえられたのです。
// 格: 並 / seed 4060
// 絵: #59 の続きを引きで。新しい「戸部」の看板の前で、役人がひとり、ため息をついて肩を落とす (おおげさすぎない)。足元に外された「民部」の看板。夕日。看板の影が長く伸びる
// どこ: #59 と同じ役所の門を引きで。夕方。夕日が左に沈み、影が右へ長く伸びる
// 演出: 新しい「戸部」の看板の前に役人がひとり。足元に外された「民部」の看板が石に立てかけてある。足場は片づき、はしごと綱が残る。カラスが帰る
// 動き: f16〜30 で役人がふうっとため息 (白い息がゆっくり流れる)・肩が少し落ちてうつむく。カラスが空を横切る。カメラがゆっくり引く
const Nm060: React.FC<{ f: number }> = ({ f }) => {
  const sc = 1.08 - 0.08 * clamp01(f / 70);
  const sigh = seg(f, 16, 30);
  const droop = easeOut(sigh);
  const puff = seg(f, 18, 40);
  return (
    <Frame f={f} seed={4060} bg={C.dusk2}>
      <g transform={`translate(900 600) scale(${sc}) translate(-900 -600)`}>
        {/* 夕焼けの空 (帯) */}
        <rect x={-80} y={-80} width={W + 160} height={300} fill={C.dusk1} />
        <rect x={-80} y={200} width={W + 160} height={200} fill={C.dusk2} />
        <rect x={-80} y={400} width={W + 160} height={260} fill={C.dusk3} />
        <circle cx={300} cy={580} r={110} fill={C.sun} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={300} cy={580} r={160} fill={C.sun} opacity={0.25} />
        {([[700, 160], [1500, 260]] as const).map(([cx, cy], i) => (
          <path key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy})`} d="M -160 14 Q -100 -18 -20 -6 Q 60 -26 160 10 Q 60 20 -160 14 Z" fill={C.dusk3} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        ))}
        {/* カラス */}
        {[0, 1, 2].map((i) => {
          const cx = 1900 - f * (3 + i * 0.6) - i * 140;
          const cy = 230 + i * 40 + Math.sin(f / 8 + i) * 6;
          const w = Math.sin(f / 3 + i) * 10;
          return <path key={i} d={`M ${cx - 26} ${cy - 6 + w} Q ${cx - 12} ${cy - 14} ${cx} ${cy} Q ${cx + 12} ${cy - 14} ${cx + 26} ${cy - 6 + w}`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />;
        })}
        {/* 遠い都の塀 (影色) */}
        <rect x={-80} y={600} width={W + 160} height={110} fill={C.duskFar} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-80} y={588} width={W + 160} height={16} fill={C.duskShadow} />
        <g transform="translate(140 600)">
          <rect x={-60} y={-80} width={120} height={80} fill={C.duskShadow} />
          <path d="M -90 -80 Q 0 -120 90 -80 Z" fill={C.duskShadow} />
        </g>
        {/* 地面 */}
        <rect x={-80} y={700} width={W + 160} height={460} fill={C.duskGround} stroke={KRP.ink} strokeWidth={4} />
        {/* 長い影 (右へ) */}
        <g fill={C.duskShadow} opacity={0.38}>
          <polygon points="830,860 990,860 1500,960 1260,980" />
          <polygon points="1150,800 1420,800 1900,880 1700,900" />
          <polygon points="760,752 1560,752 1980,820 1100,820" />
        </g>
        <NC1Gate x={1160} y={760} s={0.66} dusk />
        <NC1Sign x={1160} y={760 - 500 * 0.66} w={300 * 0.66} h={110 * 0.66} text="戸部" size={52} />
        <rect x={1160 - 100} y={760 - 500 * 0.66 + 40} width={200} height={14} fill={C.duskShadow} opacity={0.4} />
        {/* はしごと綱の残り */}
        <g transform="rotate(10 1560 770)">
          {[1530, 1590].map((px) => <line key={px} x1={px} y1={430} x2={px} y2={770} stroke={C.woodDeep} strokeWidth={12} />)}
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={1530} y1={460 + i * 46} x2={1590} y2={460 + i * 46} stroke={C.woodDeep} strokeWidth={8} />)}
        </g>
        <g transform="translate(1680 806)">
          {[0, 1, 2].map((k) => <ellipse key={k} cx={0} cy={-6 - k * 9} rx={40 - k * 6} ry={9} fill="none" stroke={C.rope} strokeWidth={7} />)}
        </g>
        {/* 外された「民部」 (石に立てかけ) */}
        <ellipse cx={1250} cy={826} rx={170} ry={14} fill={KRP.ink} opacity={0.25} />
        <path d="M 1350 830 Q 1360 770 1400 776 Q 1430 790 1420 830 Z" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        <NC1Sign x={1250} y={758} w={240} h={88} text="民部" rot={-14} size={62} />
        {/* ため息の役人 */}
        <ellipse cx={980} cy={868} rx={80} ry={12} fill={KRP.ink} opacity={0.28} />
        <NC1Official x={900} y={860} s={0.95} f={f} phase={2} pose="stand" face="worried" lean={droop * 5} gaze={[3, 4 + droop * 4]} closed={sigh > 0.4 && sigh < 0.95} />
        {puff > 0 && (
          <g transform={`translate(${940 + puff * 90} ${670 - puff * 40})`} opacity={1 - puff * 0.55}>
            <path d="M -30 0 Q -34 -26 -8 -24 Q 4 -44 26 -28 Q 50 -30 46 -6 Q 52 16 24 14 Q 6 28 -12 14 Q -36 18 -30 0 Z"
              transform={`scale(${0.6 + puff * 0.8})`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #61 日本の平安時代の女性も、本名で呼ばれることは、ほとんどありませんでした。
// 格: 山 / seed 4061
// 絵: 平安京の寝殿造 (檜皮葺の屋根・簀子縁・庭の池と反り橋・御簾)。御簾の向こうに袿の女性の**後ろ姿**。名札が御簾の内側に掛けてあるが、御簾に隠れて字が見えない。季節は春 (桜)
// どこ: 平安京の寝殿造。右に檜皮葺の寝殿と簀子縁・高欄・御簾、左に庭の池と朱の反り橋。春 (満開の桜)
// 演出: 真ん中の間の御簾の向こうに、袿の女性の後ろ姿 (長い黒髪)。御簾の内側の柱に名札が掛かっているが、簾に隠れて字が読めない
// 動き: 春風で御簾がふくらみ、すそがゆれる (それでも名札の字は見えない)。桜の花びらが舞い落ち、池に波紋。カメラが右の御簾へゆっくりパン
const Nm061: React.FC<{ f: number }> = ({ f }) => {
  const pan = -36 * Math.sin(Math.min(f, 90) / 90 * Math.PI / 2);
  const wind = Math.sin(f / 14) * 0.5 + 0.5;
  const bays = [760, 1100, 1440, 1780];
  return (
    <Frame f={f} seed={4061} bg={C.sky}>
      <g transform={`translate(${12 + pan} 0) translate(960 540) scale(1.05) translate(-960 -540)`}>
        {/* 空と山 */}
        <rect x={-80} y={-60} width={W + 160} height={640} fill={C.sky} />
        <path d="M -80 470 Q 120 330 330 420 Q 520 320 760 440 L 760 600 L -80 600 Z" fill={C.edge2} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
        {/* 白砂の庭 */}
        <rect x={-80} y={560} width={W + 160} height={580} fill={C.sand} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={C.stoneDark} strokeWidth={3} opacity={0.5} fill="none">
          {[620, 700, 960, 1030].map((yy) => <path key={yy} d={`M -80 ${yy} Q 400 ${yy - 14} 900 ${yy} T 1900 ${yy}`} />)}
        </g>
        {/* 池 */}
        <ellipse cx={330} cy={790} rx={330} ry={120} fill={C.pond} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={330} cy={800} rx={290} ry={96} fill="none" stroke={C.pondDark} strokeWidth={4} opacity={0.6} />
        {[0, 1].map((i) => {
          const r = ((f * 1.2 + i * 30) % 60) / 60;
          return <ellipse key={i} cx={200 + i * 260} cy={820 - i * 30} rx={10 + r * 70} ry={4 + r * 20} fill="none" stroke={KRP.white} strokeWidth={4} opacity={1 - r} />;
        })}
        {[[150, 870], [470, 860]].map(([sx, sy], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx={40} ry={18} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 朱の反り橋 */}
        <g>
          <path d="M 110 790 Q 330 640 560 790 L 560 806 Q 330 662 110 806 Z" fill={C.verm} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 110 790 Q 330 640 560 790" fill="none" stroke={C.vermDark} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => {
            const t = (i + 0.5) / 7;
            const bx = lerp(120, 550, t);
            const by = (1 - t) * (1 - t) * 790 + 2 * t * (1 - t) * 640 + t * t * 790;
            return <line key={i} x1={bx} y1={by} x2={bx} y2={by - 44} stroke={C.verm} strokeWidth={8} />;
          })}
          <path d="M 110 746 Q 330 596 560 746" fill="none" stroke={KRP.ink} strokeWidth={14} />
          <path d="M 110 746 Q 330 596 560 746" fill="none" stroke={C.verm} strokeWidth={8} />
          <path d="M 140 806 Q 330 690 530 806" fill="none" stroke={C.pondDark} strokeWidth={5} opacity={0.6} />
        </g>
        {/* 寝殿の床下 */}
        <rect x={660} y={676} width={1400} height={110} fill={C.interior} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={690 + i * 150} y={676} width={22} height={110} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 室内 (御簾の奥) */}
        <rect x={760} y={240} width={1300} height={400} fill={C.interior} stroke={KRP.ink} strokeWidth={5} />
        <rect x={760} y={590} width={1300} height={50} fill={C.tatami} stroke={KRP.ink} strokeWidth={4} />
        <rect x={760} y={590} width={1300} height={10} fill={C.edge2} />
        {/* 几帳 (奥の布の衝立) */}
        <g>
          <line x1={1520} y1={330} x2={1700} y2={330} stroke={C.woodDeep} strokeWidth={8} />
          <rect x={1530} y={334} width={160} height={250} fill={C.heian} opacity={0.75} />
          {[1570, 1650].map((px) => <line key={px} x1={px} y1={334} x2={px} y2={584} stroke={C.edge1} strokeWidth={6} />)}
        </g>
        {/* 袿の女性の後ろ姿 (御簾の下から袿のすそと黒髪がのぞく) */}
        <g transform="translate(1250 604) scale(1.12) translate(-1250 -630)">
          <Person x={1250} y={630} s={0.8} f={f} phase={2} cloth={C.heian} clothDark={C.heianDark} hair="none" />
          {/* 重ねの袿 (すそが床に広がる) */}
          <path d="M 1110 630 Q 1130 520 1196 488 L 1304 488 Q 1370 520 1390 630 Z" fill={C.edge2} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1122 622 Q 1140 520 1200 486 L 1300 486 Q 1360 520 1378 622 Z" fill={C.edge1} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1136 614 Q 1152 518 1204 484 L 1296 484 Q 1348 518 1364 614 Z" fill={C.heian} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1160 600 Q 1190 540 1180 500 M 1340 600 Q 1310 540 1320 500" stroke={C.heianDark} strokeWidth={5} fill="none" />
          {/* 後頭部と長い黒髪 */}
          <circle cx={1250} cy={448} r={54} fill={C.hat} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 1206 470 Q 1196 540 1210 ${614 + Math.sin(f / 16) * 3} L 1290 ${614 + Math.sin(f / 16) * 3} Q 1304 540 1294 470 Z`} fill={C.hat} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1236 480 Q 1230 550 1240 606 M 1264 480 Q 1270 550 1260 606" stroke="#4A4038" strokeWidth={3} fill="none" />
          <rect x={1232} y={520} width={36} height={10} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        {/* 名札 (御簾の内側の柱に) */}
        <g transform={`rotate(${Math.sin(f / 13) * 2} 1400 250)`}>
          <line x1={1400} y1={250} x2={1400} y2={296} stroke={KRP.red} strokeWidth={4} />
          <rect x={1362} y={296} width={76} height={128} rx={6} fill={C.woodPale} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" opacity={0.55}>
            <line x1={1400} y1={318} x2={1400} y2={344} /><line x1={1386} y1={360} x2={1412} y2={366} /><line x1={1400} y1={384} x2={1400} y2={410} />
          </g>
        </g>
        {/* 柱と長押 */}
        {bays.map((px) => <rect key={px} x={px - 18} y={230} width={36} height={420} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={700} y={216} width={1360} height={30} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 御簾 (3間。風でふくらむ) */}
        {bays.slice(0, -1).map((x0, i) => {
          const x1 = bays[i + 1];
          const sway = (wind * 12 + (i === 1 ? 8 : 0)) * (i === 1 ? 1.4 : 1);
          const bot = i === 1 ? 462 - wind * 16 : 560 - wind * 6;
          const lx = x0 + 20, rx = x1 - 20;
          return (
            <g key={i}>
              <path d={`M ${lx} 280 L ${rx} 280 L ${rx + sway * 0.4} ${bot} Q ${(lx + rx) / 2 + sway} ${bot + 14} ${lx + sway * 0.4} ${bot} Z`}
                fill={C.misu} opacity={0.5} stroke={KRP.ink} strokeWidth={4} />
              <g stroke={C.misuLine} strokeWidth={4}>
                {Array.from({ length: Math.floor((bot - 290) / 10) }, (_, k) => {
                  const yy = 290 + k * 10;
                  const d = ((yy - 280) / (bot - 280)) * sway * 0.4;
                  return <line key={k} x1={lx + d} y1={yy} x2={rx + d} y2={yy} />;
                })}
              </g>
              <g stroke={C.misuEdge} strokeWidth={4} opacity={0.8}>
                {[0.33, 0.66].map((t) => <line key={t} x1={lerp(lx, rx, t)} y1={280} x2={lerp(lx, rx, t) + sway * 0.4} y2={bot} />)}
              </g>
              {/* 帽額 */}
              <rect x={x0 + 14} y={246} width={x1 - x0 - 28} height={38} fill={C.misuEdge} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 5 }, (_, k) => (
                <circle key={k} cx={lerp(x0 + 50, x1 - 50, k / 4)} cy={265} r={9} fill="none" stroke={KRP.white} strokeWidth={3} />
              ))}
              {/* 総角の飾り紐 */}
              {[lx + 60, rx - 60].map((tx, k) => (
                <g key={k} transform={`rotate(${Math.sin(f / 10 + i + k) * 5} ${tx} 284)`}>
                  <line x1={tx} y1={284} x2={tx} y2={380} stroke={KRP.red} strokeWidth={5} />
                  <path d={`M ${tx} 380 l -16 14 l 16 14 l 16 -14 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                  <path d={`M ${tx - 6} 408 L ${tx - 10} 470 M ${tx + 6} 408 L ${tx + 10} 470`} stroke={KRP.red} strokeWidth={5} />
                </g>
              ))}
            </g>
          );
        })}
        {/* 簀子縁と高欄 */}
        <rect x={660} y={636} width={1400} height={44} fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={680 + i * 100} y1={640} x2={680 + i * 100} y2={676} stroke={C.wood} strokeWidth={4} />)}
        <rect x={660} y={580} width={1400} height={14} fill={C.verm} stroke={KRP.ink} strokeWidth={4} />
        <rect x={660} y={612} width={1400} height={10} fill={C.verm} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 17 }, (_, i) => <rect key={i} x={668 + i * 85} y={572} width={14} height={66} fill={C.verm} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 檜皮葺の屋根 */}
        <path d="M 560 222 Q 620 120 760 40 L 2060 40 L 2060 222 Z" fill={C.hiwada} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 560 222 L 2060 222 L 2060 196 L 576 196 Z" fill={C.hiwadaDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.hiwadaDark} strokeWidth={4} opacity={0.7} fill="none">
          {[70, 110, 150].map((yy, i) => <path key={yy} d={`M ${720 - i * 50} ${yy} L 2060 ${yy}`} />)}
        </g>
        <path d="M 560 222 Q 600 210 640 204" stroke={KRP.white} strokeWidth={4} opacity={0.4} fill="none" />
        {/* 桜の木 */}
        <g>
          <path d="M 560 840 Q 540 700 580 560 Q 600 460 560 360" stroke={KRP.ink} strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d="M 560 840 Q 540 700 580 560 Q 600 460 560 360" stroke={C.woodDeep} strokeWidth={34} fill="none" strokeLinecap="round" />
          {["M 570 470 Q 430 380 300 330", "M 566 400 Q 650 280 780 240", "M 566 380 Q 500 240 420 150"].map((d, i) => (
            <g key={i}>
              <path d={d} stroke={KRP.ink} strokeWidth={24} fill="none" strokeLinecap="round" />
              <path d={d} stroke={C.woodDeep} strokeWidth={14} fill="none" strokeLinecap="round" />
            </g>
          ))}
          {([[300, 320, 90], [420, 160, 100], [560, 300, 110], [760, 240, 90], [200, 230, 70], [640, 150, 80], [430, 400, 70]] as const).map(([cx, cy, r], i) => (
            <g key={i} transform={`translate(${cx + Math.sin(f / 20 + i) * 3} ${cy})`}>
              <circle r={r} fill={C.sakura} stroke={KRP.ink} strokeWidth={5} />
              {Array.from({ length: 6 }, (_, k) => (
                <circle key={k} cx={Math.cos(k + i) * r * 0.55} cy={Math.sin(k * 1.7 + i) * r * 0.5} r={r * 0.18} fill={C.sakuraDark} opacity={0.7} />
              ))}
            </g>
          ))}
        </g>
        {/* 舞う花びら */}
        {Array.from({ length: 22 }, (_, i) => {
          const x0 = rnd(61, i) * 1900;
          const yy = ((rnd(62, i) * 1100 + f * (2 + rnd(63, i) * 1.5)) % 1120) - 40;
          const xx = x0 + Math.sin(f / 12 + i) * 30 + f * 0.8;
          return (
            <ellipse key={i} cx={xx} cy={yy} rx={9} ry={5} fill={C.sakura} stroke={C.sakuraDark} strokeWidth={2}
              transform={`rotate(${f * 4 + i * 30} ${xx} ${yy})`} />
          );
        })}
      </g>
      <TagPlate x={1660} y={110} text="平安時代" size={40} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_053: (f) => <Nm053 f={f} />,
  nm_054: (f) => <Nm054 f={f} />,
  nm_055: (f) => <Nm055 f={f} />,
  nm_056: (f) => <Nm056 f={f} />,
  nm_057: (f) => <Nm057 f={f} />,
  nm_058: (f) => <Nm058 f={f} />,
  nm_059: (f) => <Nm059 f={f} />,
  nm_060: (f) => <Nm060 f={f} />,
  nm_061: (f) => <Nm061 f={f} />,
};

export const NM_C1_MOTIFS: string[] = [
  "nm_053", // #53
  "nm_054", // #54
  "nm_055", // #55
  "nm_056", // #56
  "nm_057", // #57
  "nm_058", // #58
  "nm_059", // #59
  "nm_060", // #60
  "nm_061", // #61
];

export const namaeC1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
