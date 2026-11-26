// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#181〜#192 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // #181 書斎と辞書
  deskWood: "#7A4E2E", deskWoodDark: "#5A361D",
  page: "#F1E3BE", pageShade: "#DCC797",
  sepia: "#8C6A44", sepiaLight: "#D9C39A", engrave: "#EADBB8",
  chair: "#B38A5C", vest: "#8A6440", trouser: "#5E4630", newsprint: "#F4ECD6",
  cat: "#E59A4C", catDark: "#B96F2C", cushion: "#7E9C6A", cushionDark: "#5E7A4E",
  // #182 表彰式
  velvet: "#9E2230", velvetDark: "#6E1520", velvetLight: "#C23A46", gold: "#E0B848", goldDark: "#A8862A",
  stageWood: "#8A5A36", tux: "#26262C", tuxDark: "#18181C", seatShadow: "#2A1A20",
  // #184 #185 現代の部屋・研究室
  wallWhite: "#F3F1EC", floorWood: "#D9B98F", floorWoodDark: "#B8936A", plant: "#5E9E5A", plantDark: "#3F7A40", pot: "#C7764A",
  sheet: "#FDFBF7", quilt: "#F2D7A6", quiltDark: "#D9B47A", ghost: "#BFE6F5", brain: "#F2A7B8", heart: "#E0505A",
  phone: "#33363D", screen: "#DDEFF7", snoozeBtn: "#F09A3A",
  labWall: "#E9EEF0", labFloor: "#C9D2D6", labCoat: "#F6F8F9", labCoatDark: "#C9D0D4", monitor: "#2B3440", monScreen: "#F7FBFC",
  lineYes: "#F09A3A", lineNo: "#4A78B8", pajamaGray: "#9AA1AA", pajamaGrayDark: "#6E757E", skirtRed: "#C8433A",
  // #186 宇宙
  space: "#10163A", sea: "#4E8FC9", seaDeep: "#2F6AA8", land: "#7FBF7A", landDark: "#5E9E5A",
  // #187 学生寮
  dormWall: "#E8DCC6", dormFloor: "#B99872", tshirt: "#8E949C", tshirtDark: "#5E646C", blanketBlue: "#6F8FBF", blanketBlueDark: "#4E6E9E",
  // #188 #189 工作室
  shopWall: "#5E6A70", cork: "#C69A64", corkDark: "#A57A48", bench: "#B88A58", benchDark: "#8A6238", cardigan: "#C8433A", cardiganDark: "#9A2E28",
  lamp: "#3E4A52", nightWin: "#1E2850",
  // #190〜#192 一人暮らしの寝室
  roomFloor: "#C9A57A", roomFloorDark: "#A8845A", rug: "#C9705A", rugLight: "#E8A08A", curtain: "#7FA6C9", curtainDark: "#5C84A8",
  shelf: "#8A6238", basket: "#D8B878", sock: "#E06A5A", underBed: "#3A3036", town: "#B9C7D3", townDark: "#8C9BAA",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void MP; void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky; void NazoBell;
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

type Pt = [number, number];
type MzFace = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type MzPose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "hang" | "sit";
const INK = KRP.ink;

// 小さな字の代わりの波線 (辞書・課題の紙)
const mzHbWavy = (x: number, y: number, w: number, amp = 3, step = 14) => {
  let d = `M ${x} ${y}`;
  for (let i = 0; i < Math.floor(w / step); i++) d += ` q ${step / 2} ${i % 2 ? amp : -amp} ${step} 0`;
  return d;
};

// 腕 (肩→ひじ→手)。Person の局所座標 (足元が原点・s=1 の単位) で点を渡す
const MzHbLimb: React.FC<{ pts: Pt[]; cloth: string; hand?: boolean; w?: number }> = ({ pts, cloth, hand = true, w = 22 }) => {
  const d = "M " + pts.map((p) => `${p[0]} ${p[1]}`).join(" L ");
  const h = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 9} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={cloth} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {hand && <circle cx={h[0]} cy={h[1]} r={Math.max(11, w * 0.5)} fill={KRP.white} stroke={INK} strokeWidth={4.5} />}
    </g>
  );
};

// 閉じた目 (Person の局所座標で、目の上に重ねる)。which: 閉じる目
const MzHbClosedEyes: React.FC<{ which?: "both" | "left" | "right" }> = ({ which = "both" }) => (
  <g>
    {(which === "both" || which === "left") && (
      <g>
        <ellipse cx={-24} cy={-222} rx={17} ry={22} fill={KRP.white} />
        <path d="M -37 -220 Q -24 -209 -11 -220" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g>
    )}
    {(which === "both" || which === "right") && (
      <g>
        <ellipse cx={24} cy={-222} rx={17} ry={22} fill={KRP.white} />
        <path d="M 11 -220 Q 24 -209 37 -220" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g>
    )}
  </g>
);

type MzHair = "cap" | "long" | "tail" | "white" | "back" | "backTail" | "messy" | "none";
const HAIR_BROWN = "#8A5634";
const HAIR_BROWN_DARK = "#64391F";
const CAP_PATH = "M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z";

// 人物 (Person の上に髪・スカート・閉じた目・自分で描く腕を重ねる)
//   arms を渡すと Person の腕は胴の板で隠し、渡した2本だけを描く (腕は必ず2本)
const MzHbFig: React.FC<{
  x: number; y: number; s?: number; f: number; face?: MzFace; pose?: MzPose;
  cloth: string; clothDark: string; hair?: MzHair; hairColor?: string; gaze?: [number, number]; phase?: number;
  arms?: { l: Pt[]; r: Pt[]; lBehind?: boolean; rBehind?: boolean; lCloth?: string; rCloth?: string };
  skirt?: string; closed?: "both" | "left" | "right"; mustache?: string; coat?: string; front?: React.ReactNode; back?: React.ReactNode;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", cloth, clothDark, hair = "cap", hairColor, gaze, phase = 0, arms, skirt, closed, mustache, coat, front, back }) => {
  const hc = hairColor ?? (hair === "long" || hair === "tail" ? HAIR_BROWN : hair === "white" ? "#F1F1EE" : INK);
  const tr = `translate(${x} ${y}) scale(${s})`;
  const sway = Math.sin((f + phase * 9) / 14) * 3;
  return (
    <g>
      <g transform={tr}>
        {back}
        {hair === "long" && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 56} -262 Q ${sd * 88} -214 ${sd * (82 + sway * 0.3)} -136 Q ${sd * 66} -126 ${sd * 50} -138 Q ${sd * 58} -196 ${sd * 38} -252 Z`}
            fill={hc} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        ))}
        {hair === "tail" && (
          <path d={`M 50 -232 Q ${92 + sway} -206 ${80 + sway} -150 Q 66 -170 46 -200 Z`} fill={hc} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        )}
        {arms?.lBehind && <MzHbLimb pts={arms.l} cloth={arms.lCloth ?? cloth} />}
        {arms?.rBehind && <MzHbLimb pts={arms.r} cloth={arms.rCloth ?? cloth} />}
      </g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={arms ? "hold" : pose} cloth={cloth} clothDark={clothDark}
        hair={hair === "cap" || hair === "messy" ? "cap" : "none"} gaze={gaze} phase={phase} still />
      <g transform={tr}>
        {skirt && <path d="M -60 -66 L 60 -66 L 86 -14 Q 0 -4 -86 -14 Z" fill={skirt} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
        {coat && <path d="M -60 -66 L 60 -66 L 70 -20 Q 0 -12 -70 -20 Z" fill={coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
        {arms && <rect x={-60} y={-162} width={120} height={112} rx={17} fill={cloth} stroke={INK} strokeWidth={5} />}
        {arms && !arms.lBehind && <MzHbLimb pts={arms.l} cloth={arms.lCloth ?? cloth} />}
        {arms && !arms.rBehind && <MzHbLimb pts={arms.r} cloth={arms.rCloth ?? cloth} />}
        {closed && <MzHbClosedEyes which={closed} />}
        {mustache && (
          <path d="M -30 -195 Q -15 -211 0 -199 Q 15 -211 30 -195 Q 16 -186 0 -194 Q -16 -186 -30 -195 Z" fill={mustache} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        )}
        {(hair === "long" || hair === "tail") && (
          <g>
            <path d={CAP_PATH} fill={hc} stroke={INK} strokeWidth={3} />
            <path d="M -40 -262 Q -30 -246 -14 -258 M 4 -264 Q 16 -248 30 -260" stroke={HAIR_BROWN_DARK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {hair === "white" && (
          <g>
            {[-1, 1].map((sd) => (
              <path key={sd} d={`M ${sd * 62} -262 Q ${sd * 84} -232 ${sd * 64} -200 Q ${sd * 56} -226 ${sd * 50} -252 Z`} fill={hc} stroke={INK} strokeWidth={3.5} />
            ))}
            <path d="M -30 -286 Q 0 -298 30 -286" stroke={hc} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        )}
        {hair === "messy" && (
          <path d="M -50 -276 l -18 -26 l 30 12 l 4 -30 l 18 26 l 16 -32 l 8 32 l 26 -20 l -6 30 l 28 -6 l -20 24 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        )}
        {(hair === "back" || hair === "backTail") && (
          <g>
            <circle cx={0} cy={-228} r={66} fill={hc} stroke={INK} strokeWidth={5.5} />
            <path d="M -40 -262 Q -20 -232 -24 -196 M 0 -288 Q 4 -240 0 -200 M 40 -262 Q 20 -232 24 -196" stroke="#55504E" strokeWidth={3.5} fill="none" opacity={0.6} />
            {hair === "backTail" && (
              <g>
                <path d={`M -10 -206 Q ${-16 + sway} -168 ${-4 + sway * 1.4} -128 Q 14 -168 12 -206 Z`} fill={hc} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
                <ellipse cx={0} cy={-206} rx={20} ry={11} fill={KRP.red} stroke={INK} strokeWidth={4} />
              </g>
            )}
          </g>
        )}
        {front}
      </g>
    </g>
  );
};

// 布団から顔を出して枕に頭を乗せた人 (正面向きの頭・目は横に2つ並ぶ)。
//   cx, cy = 頭の中心。首から下は切り取り、その上に布団をかぶせて使う
const MzHbBedHead: React.FC<{
  id: string; cx: number; cy: number; s: number; f: number; cloth: string; clothDark: string;
  face?: MzFace; gaze?: [number, number]; closed?: "both" | "left" | "right"; tilt?: number;
}> = ({ id, cx, cy, s, f, cloth, clothDark, face = "normal", gaze, closed, tilt = 0 }) => {
  const py = cy + 228 * s;
  return (
    <g transform={`rotate(${tilt} ${cx} ${cy + 64 * s})`}>
      <clipPath id={id}><rect x={cx - 220 * s} y={cy - 160 * s} width={440 * s} height={270 * s} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <Person x={cx} y={py} s={s} f={f} face={face} pose="stand" cloth={cloth} clothDark={clothDark} hair="cap" gaze={gaze} still />
        {closed && (
          <g transform={`translate(${cx} ${py}) scale(${s})`}>
            <MzHbClosedEyes which={closed} />
          </g>
        )}
      </g>
    </g>
  );
};

// 「ジリリ」の音の線 (鳴っている物のまわりに)
const MzHbRing: React.FC<{ x: number; y: number; r: number; f: number; amt?: number; color?: string; w?: number }> = ({ x, y, r, f, amt = 1, color = INK, w = 6 }) => {
  if (amt <= 0.02) return null;
  const p = (Math.floor(f / 3) % 2) * 0.12;
  return (
    <g opacity={amt}>
      {[-1, 1].map((sd) => [0, 1].map((k) => {
        const rr = r * (1 + k * 0.28 + p);
        const a0 = sd === 1 ? -60 : -120, a1 = sd === 1 ? -20 : -160;
        const P = (a: number) => [x + Math.cos((a * Math.PI) / 180) * rr, y + Math.sin((a * Math.PI) / 180) * rr];
        const [x0, y0] = P(a0), [x1, y1] = P(a1);
        return <path key={`${sd}${k}`} d={`M ${x0} ${y0} A ${rr} ${rr} 0 0 ${sd === 1 ? 1 : 0} ${x1} ${y1}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />;
      }))}
    </g>
  );
};

// 汗のしずく
const MzHbSweat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} d="M 0 -18 Q 12 0 0 8 Q -12 0 0 -18 Z" fill="#9FD0EE" stroke={INK} strokeWidth={3.5} />
);

// 寝息の Z
const MzHbZzz: React.FC<{ x: number; y: number; f: number; s?: number; color?: string }> = ({ x, y, f, s = 1, color = KRP.white }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = (f / 48 + i / 3) % 1;
      return (
        <text key={i} x={x + t * 50 * s} y={y - t * 130 * s} fontFamily={FONT} fontWeight={900} fontSize={(26 + t * 22) * s}
          fill={color} stroke={INK} strokeWidth={2.5} paintOrder="stroke" opacity={Math.sin(t * Math.PI)}>Z</text>
      );
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #181 スヌーズとは、英語で、うたた寝のことです。
// 格: 図 / seed 6181
// 絵: どこ: 古い木の書斎机の上に開いた、分厚い英語の辞書 (黄ばんだ紙・2段組みの小さな字は波線・ページの角が折れている・しおりのリボン)。演出: 辞書の見出し語「snooze」(この1語だけ英字で書く) の横の挿絵の枠の中で、ひじ掛け椅子に座った男性 (チョッキ・白髪・口ひげ) が新聞を顔に乗せてうとうとしている。挿絵の中で、新聞がいびきに合わせてふわっと浮いては落ちる。男性の頭がこっくり・こっくりと前に傾き、ついにがくっと落ちかけて自分でびくっと目を開け、またすぐうとうと。机の横の椅子の上では本物の猫もうとうとしている。動き: f0-30 カメラが辞書のページの上から挿絵の枠へ寄る / f30-140 新聞がふわふわ・頭がこっくり (3回) / f100 がくっ→びくっ / 猫のしっぽがゆっくり揺れる
// どこ: 夜の書斎の木の机。分厚い英語の辞書が見開き (黄ばんだ紙・2段組みの波線・角の折れ・赤いしおり)。机の右の椅子に本物の猫
// 演出: 見出し語「snooze」の挿絵 (セピアの銅版画風) の中で、ひじ掛け椅子の老紳士が新聞を顔に乗せてうとうと。
//       いびきで新聞がふわっ。頭がこっくり2回→3回目でがくっ→びくっと目を開け新聞が跳ぶ→またうとうと。猫もしっぽだけ揺らして寝ている
// 動き: f0-30 カメラが挿絵へ寄る / f14-60 こっくり2回 / f62-82 3回目 (戻らない) / f82-88 がくっ / f88 びくっ / f96- またうとうと
const Mz181: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 30));
  const k = lerp(1, 1.32, z), cx = lerp(960, 1250, z), cy = lerp(540, 530, z);
  const nod = (a: number, b: number, amp: number) => {
    const t = seg(f, a, b);
    if (t <= 0 || t >= 1) return 0;
    return (t < 0.75 ? easeInOut(t / 0.75) : 1 - easeOut((t - 0.75) / 0.25)) * amp;
  };
  let ang = nod(14, 36, 7) + nod(38, 60, 9);
  let dy = 0;
  if (f >= 62 && f < 82) ang = 10 * easeInOut(seg(f, 62, 78));
  if (f >= 82 && f < 88) { const t = seg(f, 82, 88); ang = 10 + 9 * t * t; dy = 18 * t; }
  if (f >= 88 && f < 92) { const t = easeOut(seg(f, 88, 92)); ang = lerp(19, -4, t); dy = lerp(18, -14, t); }
  if (f >= 92) { const t = easeInOut(seg(f, 94, 107)); ang = lerp(-4, 5, t); dy = lerp(-14, 0, t); }
  const startled = f >= 88 && f < 100;
  const snore = 0.5 - 0.5 * Math.cos((f / 24) * Math.PI * 2);
  const fly = f >= 88 ? (f < 98 ? easeOut(seg(f, 88, 94)) : 1 - easeInOut(seg(f, 98, 106))) : 0;
  const SEP = C.sepia, SEPL = C.sepiaLight;
  // 挿絵の枠
  const FX = 940, FY = 320, FW = 620, FH = 450;
  const mx = 1250, my = 728, ms = 0.82; // 老紳士の足元
  const tail = Math.sin(f / 22) * 10;
  return (
    <Frame f={f} seed={6181} bg={C.deskWood}>
      <g transform={`translate(960 540) scale(${k}) translate(${-cx} ${-cy})`}>
        {/* 机 (木目) */}
        <rect x={-300} y={-300} width={2520} height={1680} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M -300 ${-40 + i * 150} q 600 ${rnd(3, i) * 40 - 20} 1260 0 q 640 ${rnd(4, i) * 40 - 20} 1260 0`} />
          ))}
        </g>
        {/* ランプの光だまり */}
        <ellipse cx={1000} cy={480} rx={900} ry={560} fill={MP.glow} opacity={0.16} />
        {/* 右: 椅子の座面と、丸まって寝る猫 (真上から) */}
        <g>
          <rect x={1650} y={400} width={300} height={320} rx={40} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
          <rect x={1668} y={418} width={264} height={284} rx={34} fill={C.cushion} stroke={INK} strokeWidth={5} />
          <g stroke={C.cushionDark} strokeWidth={6} opacity={0.6}>
            {[0, 1, 2, 3].map((i) => <line key={i} x1={1690 + i * 64} y1={424} x2={1690 + i * 64} y2={696} />)}
            {[0, 1, 2, 3].map((i) => <line key={`h${i}`} x1={1674} y1={450 + i * 70} x2={1926} y2={450 + i * 70} />)}
          </g>
          <ellipse cx={1800} cy={566} rx={104} ry={82} fill={C.cat} stroke={INK} strokeWidth={6} />
          {[-40, -6, 28].map((sx, i) => <path key={i} d={`M ${1790 + sx} 500 q 10 30 0 60`} stroke={C.catDark} strokeWidth={9} fill="none" strokeLinecap="round" />)}
          {/* しっぽ (ゆっくり揺れる) */}
          <path d={`M 1890 600 Q 1900 ${672 + tail * 0.3} ${1820 + tail} 668 Q 1740 662 1716 630`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
          <path d={`M 1890 600 Q 1900 ${672 + tail * 0.3} ${1820 + tail} 668 Q 1740 662 1716 630`} stroke={C.cat} strokeWidth={20} fill="none" strokeLinecap="round" />
          <circle cx={1716} cy={560} r={48} fill={C.cat} stroke={INK} strokeWidth={6} />
          <path d="M 1684 530 L 1678 492 L 1708 516 Z M 1738 516 L 1756 488 L 1756 528 Z" fill={C.cat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 1694 562 q 8 7 16 0 M 1724 562 q 8 7 16 0" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle cx={1717} cy={578} r={4} fill="#D9776A" />
          <MzHbZzz x={1660} y={500} f={f + 20} s={0.8} />
        </g>
        {/* 辞書 (見開き)。下に紙の束の厚み */}
        <g transform="rotate(-1.5 900 500)">
          <path d="M 130 130 L 900 150 L 1670 130 L 1690 900 L 900 926 L 110 900 Z" fill={C.pageShade} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 3} ${884 + i * 5} L 900 ${908 + i * 5} L ${1680 - i * 3} ${884 + i * 5}`} stroke={C.sepia} strokeWidth={2.5} fill="none" opacity={0.6} />)}
          <path d="M 150 116 Q 520 100 900 140 L 900 900 Q 520 870 140 886 Z" fill={C.page} stroke={INK} strokeWidth={6} />
          <path d="M 900 140 Q 1280 100 1650 116 L 1660 886 Q 1280 870 900 900 Z" fill={C.page} stroke={INK} strokeWidth={6} />
          <path d="M 860 140 L 900 140 L 900 900 L 860 896 Z" fill={C.pageShade} opacity={0.6} />
          <path d="M 900 140 L 940 140 L 940 896 L 900 900 Z" fill={C.pageShade} opacity={0.5} />
          {/* 左のページ: 2段組みの小さな字 (波線) と太い見出し語 */}
          {[200, 520].map((colX) => Array.from({ length: 22 }, (_, i) => {
            const yy = 200 + i * 30;
            const head = i % 5 === 0;
            return head ? <rect key={`${colX}${i}`} x={colX} y={yy - 9} width={70 + rnd(9, i + colX) * 60} height={16} rx={3} fill={C.ink} opacity={0.75} />
              : <path key={`${colX}${i}`} d={mzHbWavy(colX + 10, yy, 250 - rnd(5, i + colX) * 40)} stroke={C.sepia} strokeWidth={3} fill="none" />;
          }))}
          {/* 右のページ: 見出し語 snooze と説明の波線 */}
          <text x={970} y={232} fontFamily="Georgia, 'Times New Roman', serif" fontWeight={700} fontSize={66} fill={INK}>snooze</text>
          <path d={mzHbWavy(1210, 214, 160, 2.5, 12)} stroke={C.sepia} strokeWidth={3} fill="none" />
          <path d={mzHbWavy(970, 268, 560)} stroke={C.sepia} strokeWidth={3} fill="none" />
          <path d={mzHbWavy(970, 296, 420)} stroke={C.sepia} strokeWidth={3} fill="none" />
          {[0, 1, 2].map((i) => <path key={i} d={mzHbWavy(970, 808 + i * 28, 600 - i * 90)} stroke={C.sepia} strokeWidth={3} fill="none" />)}
          {/* 折れた角 */}
          <path d="M 1560 118 L 1650 116 L 1652 200 Z" fill={C.pageShade} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {/* ===== 挿絵 (セピアの銅版画風) ===== */}
          <rect x={FX} y={FY} width={FW} height={FH} fill={C.engrave} stroke={INK} strokeWidth={6} />
          <rect x={FX + 10} y={FY + 10} width={FW - 20} height={FH - 20} fill="none" stroke={SEP} strokeWidth={3} />
          {/* 壁紙のしま・床・じゅうたん */}
          <g stroke={SEPL} strokeWidth={6}>
            {Array.from({ length: 14 }, (_, i) => <line key={i} x1={FX + 30 + i * 42} y1={FY + 14} x2={FX + 30 + i * 42} y2={FY + 380} />)}
          </g>
          <rect x={FX + 12} y={FY + 380} width={FW - 24} height={FH - 392} fill={SEPL} />
          <line x1={FX + 12} y1={FY + 380} x2={FX + FW - 12} y2={FY + 380} stroke={SEP} strokeWidth={4} />
          <ellipse cx={mx} cy={my + 6} rx={200} ry={26} fill={C.engrave} stroke={SEP} strokeWidth={4} />
          {/* 額縁 (壁) */}
          <rect x={FX + 400} y={FY + 50} width={90} height={110} fill={C.engrave} stroke={SEP} strokeWidth={5} />
          <path d={`M ${FX + 412} ${FY + 140} q 30 -60 66 0`} stroke={SEP} strokeWidth={4} fill="none" />
          {/* 小さなテーブル・ランプ・紅茶 */}
          <rect x={FX + 40} y={FY + 300} width={110} height={14} fill={SEPL} stroke={SEP} strokeWidth={4} />
          <line x1={FX + 95} y1={FY + 314} x2={FX + 95} y2={FY + 400} stroke={SEP} strokeWidth={6} />
          <line x1={FX + 70} y1={FY + 400} x2={FX + 120} y2={FY + 400} stroke={SEP} strokeWidth={6} />
          <path d={`M ${FX + 70} ${FY + 210} L ${FX + 120} ${FY + 210} L ${FX + 134} ${FY + 260} L ${FX + 56} ${FY + 260} Z`} fill={C.engrave} stroke={SEP} strokeWidth={4} />
          <line x1={FX + 95} y1={FY + 260} x2={FX + 95} y2={FY + 300} stroke={SEP} strokeWidth={5} />
          <path d={`M ${FX + 120} ${FY + 284} h 24 v 14 q -12 6 -24 0 Z`} fill={C.engrave} stroke={SEP} strokeWidth={3} />
          <path d={`M ${FX + 126} ${FY + 276} q 4 -${8 + Math.sin(f / 8) * 3} 0 -16 M ${FX + 136} ${FY + 276} q 4 -${8 + Math.cos(f / 8) * 3} 0 -16`} stroke={SEP} strokeWidth={2.5} fill="none" opacity={0.7} />
          {/* ひじ掛け椅子 (背もたれの耳つき) */}
          <path d={`M ${mx - 120} ${my - 50} L ${mx - 128} ${my - 290} Q ${mx - 130} ${my - 330} ${mx - 90} ${my - 334} L ${mx + 90} ${my - 334} Q ${mx + 130} ${my - 330} ${mx + 128} ${my - 290} L ${mx + 120} ${my - 50} Z`}
            fill={C.chair} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={mx - 75 + i * 50} cy={my - 290} r={5} fill={SEP} />)}
          <rect x={mx - 130} y={my - 60} width={260} height={36} rx={10} fill={C.chair} stroke={INK} strokeWidth={5} />
          <line x1={mx - 110} y1={my - 24} x2={mx - 116} y2={my + 2} stroke={INK} strokeWidth={8} />
          <line x1={mx + 110} y1={my - 24} x2={mx + 116} y2={my + 2} stroke={INK} strokeWidth={8} />
          {/* 老紳士 (チョッキ・白髪・口ひげ)。腰を中心にこっくり */}
          <g transform={`translate(0 ${dy}) rotate(${ang} ${mx} ${my - 48})`}>
            <MzHbFig x={mx} y={my} s={ms} f={f} pose="sit" face={startled ? "surprised" : "normal"} cloth={C.vest} clothDark={C.trouser}
              hair="white" mustache="#F4F4F0" closed={startled ? undefined : "both"}
              front={
                <g>
                  {/* シャツの襟とチョッキのボタン */}
                  <path d="M -26 -160 L 0 -126 L 26 -160 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
                  {[-112, -90, -68].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />)}
                  {/* 新聞 (いびきでふわっ・びくっで跳ぶ) */}
                  <g transform={`translate(${fly * 60} ${-snore * 16 * (1 - fly) - fly * 190}) rotate(${-6 + snore * 4 + fly * 34} 0 -246)`}>
                    <path d="M -86 -284 L 86 -280 L 82 -208 L -82 -212 Z" fill={C.newsprint} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                    <line x1={0} y1={-282} x2={0} y2={-210} stroke={INK} strokeWidth={3} />
                    {[0, 1, 2, 3].map((i) => <path key={i} d={mzHbWavy(-74, -266 + i * 14, 62, 2, 10)} stroke={SEP} strokeWidth={2.5} fill="none" />)}
                    {[0, 1, 2, 3].map((i) => <path key={`r${i}`} d={mzHbWavy(10, -262 + i * 14, 62, 2, 10)} stroke={SEP} strokeWidth={2.5} fill="none" />)}
                    <rect x={-74} y={-282} width={60} height={10} fill={SEP} opacity={0.7} />
                  </g>
                  {!startled && <ellipse cx={0} cy={-183} rx={7 + snore * 3} ry={6 + snore * 3} fill={INK} />}
                </g>
              }
            />
          </g>
          {/* びくっの線 */}
          {startled && [-50, -20, 20, 50].map((a) => (
            <line key={a} x1={mx} y1={my - 200} x2={mx} y2={my - 300} stroke={INK} strokeWidth={6} strokeLinecap="round"
              transform={`rotate(${a} ${mx} ${my - 190})`} strokeDasharray="0 50 40 200" />
          ))}
          {!startled && <MzHbZzz x={mx + 70} y={my - 230} f={f} s={0.9} color={C.engrave} />}
          {/* しおりのリボン */}
          <path d={`M 896 140 L 912 140 Q ${930 + Math.sin(f / 30) * 6} 600 ${880 + Math.sin(f / 30) * 8} 1000 L ${860 + Math.sin(f / 30) * 8} 990 Q ${905} 600 896 140 Z`} fill={KRP.red} stroke={INK} strokeWidth={4} />
        </g>
        {/* 机の上の小物: 老眼鏡と鉛筆 */}
        <g transform="rotate(-12 300 960)">
          <circle cx={250} cy={960} r={46} fill="none" stroke={INK} strokeWidth={7} />
          <circle cx={360} cy={960} r={46} fill="none" stroke={INK} strokeWidth={7} />
          <path d="M 296 952 Q 305 940 314 952" stroke={INK} strokeWidth={6} fill="none" />
        </g>
        <g transform="rotate(8 600 980)">
          <rect x={460} y={968} width={300} height={22} fill={KRP.yellow} stroke={INK} strokeWidth={4} />
          <path d="M 760 968 L 800 979 L 760 990 Z" fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #182 機械はついに、二度寝を、正式な機能にしました。
// 格: 山 / seed 6182
// 絵: どこ: 1950年代の豪華な表彰式の舞台 (赤いビロードの幕・金のふち・スポットライト・下に観客の頭の影が並ぶ)。演出: 舞台の真ん中の台の上に BellClock (snooze=true) が胸を張るように置かれ、表彰する役の男性 (燕尾服・短い黒髪・名前は書かない) が、そのスヌーズボタンに大きな勲章のリボン (赤と金のロゼット) をうやうやしく付ける (腕は2本 pose で描く)。リボンが付いたとたん、ボタンが誇らしげにぽこっと一度沈む。観客席の人たち (男女を混ぜる) が拍手…しながら、半分は気持ちよさそうに居眠りしている (二度寝の公認)。舞台の端には「二度寝」の札ではなく、枕とナイトキャップが記念品として飾られる。動き: f0-30 カメラが観客席の後ろから舞台へ寄る / f30-80 リボンを付ける / f80-100 ボタンがぽこっ・紙吹雪 / f100-150 拍手と居眠りがまざる・スポットライトがゆれる
// どこ: 1950年代の豪華な表彰式の舞台。赤いビロードの幕・金のふち・スポットライト2本・手前に観客の頭の影の列
// 演出: 台の上の BellClock (snooze) に、燕尾服の男性がスヌーズボタンへ赤と金の勲章のロゼットをうやうやしく付ける (右手で付け、左手は胸)。
//       付いたとたんボタンがぽこっと沈み、紙吹雪。観客は拍手…の半分が居眠り (Zzz・頭が傾く)。舞台の右に記念品の枕とナイトキャップ
// 動き: f0-30 カメラが観客席の後ろから寄る / f18-38 ロゼットを運んで付ける / f40-50 ぽこっ・紙吹雪 / 以後 拍手と居眠り・スポットライトがゆれる
const Mz182: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 30));
  const k = lerp(1, 1.1, z);
  const CX = 980, CY = 520, CS = 0.95; // 時計
  const BX = CX, BY = CY - 128 * CS; // スヌーズボタンの上
  const carry = easeInOut(seg(f, 16, 38));
  const press = f < 40 ? 0 : f < 44 ? seg(f, 40, 44) : 1 - easeOut(seg(f, 44, 52)) * 0.85;
  const PX = 760, PY = 700, PS = 1.2;
  // 右手 (局所座標): 胸の前 → ボタンの左
  const tgt: Pt = [(BX - 34 - PX) / PS, (BY - 6 - PY) / PS];
  const handR: Pt = [lerp(70, tgt[0], carry), lerp(-128, tgt[1], carry)];
  const elbowR: Pt = [lerp(96, 124, carry), lerp(-112, -176, carry)];
  const rosAttached = f >= 38;
  const rosScreen: Pt = rosAttached ? [BX, BY + press * 8 * CS] : [PX + handR[0] * PS + 22, PY + handR[1] * PS - 6];
  const sway = Math.sin(f / 26) * (f > 60 ? 6 : 2.5);
  const conf = seg(f, 40, 123);
  const Rosette = ({ x, y, s: rs }: { x: number; y: number; s: number }) => (
    <g transform={`translate(${x} ${y}) scale(${rs})`}>
      <path d="M -10 10 L -30 74 L -16 66 L -6 80 L 4 18 Z" fill={KRP.red} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 10 10 L 30 74 L 16 66 L 6 80 L -4 18 Z" fill={C.gold} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-26} rx={11} ry={18} fill={i % 2 ? C.gold : C.goldDark} stroke={INK} strokeWidth={3} transform={`rotate(${i * 30})`} />
      ))}
      <circle r={26} fill={KRP.red} stroke={INK} strokeWidth={4} />
      <circle r={14} fill={C.gold} stroke={INK} strokeWidth={3} />
      <path d="M -6 -6 L 0 -12 L 6 -6" stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.7} />
    </g>
  );
  // 観客 (後ろ姿の頭の影)。kind: m=短髪 / w=長い髪 / wb=結い上げ / h=帽子。doze: 居眠り
  const crowd: { x: number; y: number; kind: "m" | "w" | "wb" | "h"; doze: boolean }[] = [
    { x: 90, y: 900, kind: "w", doze: false }, { x: 300, y: 920, kind: "m", doze: true }, { x: 500, y: 895, kind: "wb", doze: true },
    { x: 700, y: 925, kind: "h", doze: false }, { x: 900, y: 900, kind: "w", doze: true }, { x: 1100, y: 920, kind: "m", doze: false },
    { x: 1300, y: 898, kind: "wb", doze: false }, { x: 1500, y: 922, kind: "m", doze: true }, { x: 1700, y: 900, kind: "w", doze: false },
    { x: 1880, y: 925, kind: "h", doze: true },
  ];
  return (
    <Frame f={f} seed={6182} bg={C.velvetDark}>
      <g transform={`translate(960 560) scale(${k}) translate(-960 -560)`}>
        {/* 奥の幕と金の額縁のアーチ */}
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.velvetDark} />
        <g stroke={C.velvet} strokeWidth={30} opacity={0.6}>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={i * 96} y1={0} x2={i * 96 + 6} y2={720} />)}
        </g>
        <path d="M 300 720 L 300 260 Q 960 60 1620 260 L 1620 720" fill="none" stroke={C.gold} strokeWidth={22} />
        <path d="M 300 720 L 300 260 Q 960 60 1620 260 L 1620 720" fill="none" stroke={INK} strokeWidth={4} />
        {/* 舞台の床 */}
        <rect x={-100} y={700} width={2120} height={60} fill={C.stageWood} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130} y1={702} x2={i * 130 - 30} y2={758} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
        <rect x={-100} y={758} width={2120} height={30} fill={C.goldDark} stroke={INK} strokeWidth={5} />
        <rect x={-100} y={788} width={2120} height={300} fill={C.seatShadow} />
        {/* スポットライト (上から2本、ゆれる) */}
        {[[260, -40, -1], [1660, -40, 1]].map(([lx, ly, sd], i) => {
          const tx = CX + sway * sd * 8;
          return <path key={i} d={`M ${lx - 30} ${ly} L ${lx + 30} ${ly} L ${tx + 210} 700 L ${tx - 210} 700 Z`} fill={MP.glow} opacity={0.2} />;
        })}
        <ellipse cx={CX + sway * 2} cy={704} rx={250} ry={30} fill={MP.glow} opacity={0.5} />
        {/* 台 (金のふちのビロード) */}
        <rect x={CX - 150} y={CY + 140} width={300} height={42} rx={8} fill={C.velvetLight} stroke={INK} strokeWidth={5} />
        <path d={`M ${CX - 140} ${CY + 182} L ${CX + 140} ${CY + 182} L ${CX + 126} 700 L ${CX - 126} 700 Z`} fill={C.velvet} stroke={INK} strokeWidth={5} />
        <path d={`M ${CX - 150} ${CY + 180} L ${CX + 150} ${CY + 180}`} stroke={C.gold} strokeWidth={8} />
        {/* 時計 (胸を張る) */}
        <BellClock x={CX} y={CY + Math.sin(f / 18) * 2} s={CS} f={f} snooze snoozePress={press} />
        {press > 0.6 && f < 54 && [-60, -30, 0, 30, 60].map((a) => (
          <line key={a} x1={BX} y1={BY - 30} x2={BX} y2={BY - 70} stroke={C.gold} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a} ${BX} ${BY})`} />
        ))}
        {rosAttached && <Rosette x={rosScreen[0]} y={rosScreen[1] - 4} s={0.85} />}
        {/* 表彰する男性 (燕尾服・短い黒髪。右手でロゼット、左手は胸) */}
        <MzHbFig x={PX} y={PY} s={PS} f={f} face={f > 44 ? "joy" : "smile"} cloth={C.tux} clothDark={C.tuxDark} gaze={[5, -4]}
          arms={{ l: [[-67, -148], [-70, -96], [-12, -118]], r: [[67, -148], elbowR, handR] }}
          back={<g>
            <path d="M -50 -70 L -64 -8 L -30 -20 Z M 50 -70 L 64 -8 L 30 -20 Z" fill={C.tux} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>}
          front={<g>
            <path d="M -24 -160 L 0 -96 L 24 -160 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
            <path d="M -18 -158 L 0 -150 L 18 -158 L 18 -142 L 0 -150 L -18 -142 Z" fill={INK} />
            <circle cx={0} cy={-124} r={3.5} fill={INK} />
            <circle cx={0} cy={-108} r={3.5} fill={INK} />
            <path d="M 30 -150 l 14 -2 l -2 12 Z" fill={KRP.red} />
          </g>}
        />
        {!rosAttached && <Rosette x={rosScreen[0]} y={rosScreen[1]} s={0.85} />}
        {/* 古いマイク */}
        <line x1={470} y1={700} x2={470} y2={440} stroke={INK} strokeWidth={14} />
        <line x1={470} y1={700} x2={470} y2={440} stroke={KRP.silver} strokeWidth={7} />
        <ellipse cx={470} cy={700} rx={50} ry={10} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <rect x={444} y={390} width={52} height={64} rx={18} fill={KRP.silver} stroke={INK} strokeWidth={5} />
        {[404, 418, 432].map((my) => <line key={my} x1={450} y1={my} x2={490} y2={my} stroke={INK} strokeWidth={2.5} opacity={0.6} />)}
        {/* 記念品: 枕とナイトキャップ (金のふちの小さな台の上) */}
        <rect x={1340} y={600} width={220} height={20} fill={C.gold} stroke={INK} strokeWidth={5} />
        <path d="M 1360 620 L 1540 620 L 1520 700 L 1380 700 Z" fill={C.velvet} stroke={INK} strokeWidth={5} />
        <path d="M 1360 598 Q 1350 556 1384 548 Q 1450 534 1516 548 Q 1552 556 1540 598 Q 1450 610 1360 598 Z" fill={KRP.white} stroke={INK} strokeWidth={5} />
        <path d="M 1400 560 Q 1450 572 1500 560" stroke={KRP.gray} strokeWidth={3} fill="none" />
        <path d="M 1410 548 Q 1420 494 1470 488 Q 1520 486 1546 512 L 1556 520 Q 1500 508 1500 548 Z" fill="#6E8FC0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M 1430 520 Q 1470 512 1500 500" stroke={KRP.white} strokeWidth={5} fill="none" />
        <circle cx={1556} cy={522} r={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
        {/* 左右の幕 (ひだ) と上の飾り幕 (金のふさ) */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={sd === 1 ? "translate(1920 0) scale(-1 1)" : undefined}>
            <path d={`M -40 -40 L 250 -40 Q 200 300 ${236 + sway} 790 L -40 790 Z`} fill={C.velvet} stroke={INK} strokeWidth={6} />
            {[40, 110, 180].map((fx) => <path key={fx} d={`M ${fx} 0 Q ${fx - 20} 400 ${fx + sway * 0.6} 790`} stroke={C.velvetDark} strokeWidth={14} fill="none" opacity={0.7} />)}
            <path d={`M 236 380 Q 150 420 120 470`} stroke={C.gold} strokeWidth={12} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <path d="M -40 -40 L 1960 -40 L 1960 90 Q 1440 150 960 100 Q 480 150 -40 90 Z" fill={C.velvetLight} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 40 }, (_, i) => {
          const fx = i * 50;
          const fy = 92 + Math.sin((fx / 1920) * Math.PI * 2) * 28 * -1 + 10;
          return <line key={i} x1={fx} y1={fy - 6} x2={fx + Math.sin(f / 10 + i) * 2} y2={fy + 26} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />;
        })}
        {/* 紙吹雪 */}
        {conf > 0 && Array.from({ length: 34 }, (_, i) => {
          const sx = 420 + rnd(21, i) * 1100;
          const t = (conf * (1.4 + rnd(22, i)) + rnd(23, i) * 0.2) % 1.2;
          const yy = 120 + t * 640;
          return <rect key={i} x={sx + Math.sin(f / 7 + i) * 26} y={yy} width={16} height={9} fill={[KRP.red, C.gold, KRP.blue, KRP.green, KRP.white][i % 5]}
            stroke={INK} strokeWidth={2} transform={`rotate(${f * 9 + i * 40} ${sx} ${yy})`} />;
        })}
        {/* 観客の頭の影 (拍手と居眠り) */}
        {crowd.map((p, i) => {
          const tilt = p.doze ? 14 + Math.sin(f / 20 + i) * 6 : Math.sin(f / 8 + i) * 2;
          const clap = !p.doze && f > 42 ? Math.abs(Math.sin(f / 3.2 + i)) : 0;
          const col = ["#3A2C34", "#2E3040", "#3E3028"][i % 3];
          return (
            <g key={i}>
              <g transform={`rotate(${tilt} ${p.x} ${p.y + 60})`}>
                {p.kind === "w" && <path d={`M ${p.x - 66} ${p.y - 10} Q ${p.x - 72} ${p.y + 90} ${p.x - 50} ${p.y + 120} L ${p.x + 50} ${p.y + 120} Q ${p.x + 72} ${p.y + 90} ${p.x + 66} ${p.y - 10} Z`} fill="#5A3826" stroke={INK} strokeWidth={4} />}
                <rect x={p.x - 80} y={p.y + 50} width={160} height={140} rx={40} fill={col} stroke={INK} strokeWidth={4} />
                <circle cx={p.x} cy={p.y} r={62} fill={p.kind === "w" || p.kind === "wb" ? "#5A3826" : "#1E1A1C"} stroke={INK} strokeWidth={4} />
                {p.kind === "wb" && <circle cx={p.x} cy={p.y - 62} r={28} fill="#5A3826" stroke={INK} strokeWidth={4} />}
                {p.kind === "h" && (<g><ellipse cx={p.x} cy={p.y - 34} rx={86} ry={14} fill="#26222A" stroke={INK} strokeWidth={4} />
                  <path d={`M ${p.x - 50} ${p.y - 36} Q ${p.x - 50} ${p.y - 96} ${p.x} ${p.y - 98} Q ${p.x + 50} ${p.y - 96} ${p.x + 50} ${p.y - 36} Z`} fill="#26222A" stroke={INK} strokeWidth={4} /></g>)}
              </g>
              {clap > 0 && (
                <g>
                  {[-1, 1].map((sd) => {
                    const hx = p.x + sd * (14 + 40 * clap), hy = p.y - 96;
                    const d = `M ${p.x + sd * 70} ${p.y + 80} L ${p.x + sd * 96} ${p.y + 10} L ${hx} ${hy}`;
                    return (
                      <g key={sd}>
                        <path d={d} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={d} stroke={["#3A2C34", "#2E3040", "#3E3028"][i % 3]} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <ellipse cx={hx} cy={hy} rx={11} ry={17} fill={KRP.white} stroke={INK} strokeWidth={4} />
                      </g>
                    );
                  })}
                  {clap < 0.35 && <path d={`M ${p.x - 30} ${p.y - 104} l -10 -14 M ${p.x} ${p.y - 110} l 0 -18 M ${p.x + 30} ${p.y - 104} l 10 -14`} stroke={C.gold} strokeWidth={5} strokeLinecap="round" />}
                </g>
              )}
              {p.doze && <MzHbZzz x={p.x + 40} y={p.y - 60} f={f + i * 17} s={0.9} />}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #183 ノッカー・アップが、窓の外で必死に防いでいたものを、ボタンひとつで、許したのです。
// 格: 山 / seed 6183
// 絵: どこ: MachiNami (sky=夜明け前の紺、windows=1つだけ消えたまま) の2階の窓を、外の石畳から見上げる構図。窓ガラスの中は寝室。演出: 窓の外で KnockerUp (pose="knock", face="worried") が汗を飛ばしながら長い棒で窓を必死にコンコンコン (棒の先の針金の房がしなる)。窓の中で寝ている男性 (短い黒髪・灰色の寝間着) は、枕元の BellClock (snooze=true, ring=1) のスヌーズボタンを、目をつぶったまま手だけでぽんと押し、ほっとした顔で寝返りを打つ。時計は止まり、男性はすやすや。窓の外のノッカー・アップは、棒をかまえたまま固まり、窓ガラスに顔を近づけて、勲章のリボンの付いたスヌーズボタンをぽかんと見つめる (face="surprised")。棒の先がへなっと下がる。動き: f0-50 必死のノック (速い) / f50-70 ボタンをぽん / f70-100 寝返り・時計が止まる / f100-150 ノッカー・アップが固まり、棒がへなっと垂れる・ガス灯がまたたく
// どこ: MachiNami (夜明け前・4軒目の2階の窓だけ暗い) を石畳から見上げる。カメラは暗い窓に大きく寄り、窓ガラスの中に寝室が見える
// 演出: 手前の KnockerUp が汗を飛ばして長い棒で窓をコンコンコン。窓の中の男性 (短い黒髪・灰色の寝間着) は目をつぶったまま
//       枕元の BellClock (勲章のロゼット付きのスヌーズボタン) をぽんと押し、ほっとした顔で寝返り。時計は止まり、すやすや。
//       ノッカー・アップは棒をかまえたまま固まり、ぽかんとボタンを見つめ、棒の先がへなっと下がる。ガス灯がまたたく
// 動き: f0-38 必死のノック・時計が鳴る / f30-44 手が出てボタンをぽん / f56-70 寝返り / f74 固まる / f80-120 棒がへなっ / f100- ガス灯がまたたく (v2: 黒い円の点滅をやめ、炎が小さく・暗く・光の輪が弱まってゆらっと戻る。38コマ周期)
const Mz183: React.FC<{ f: number }> = ({ f }) => {
  const K = 2.8 + 0.08 * seg(f, 0, 186);
  const world = `translate(${1180 - seg(f, 0, 186) * 20} 320) scale(${K}) translate(-1125 -360)`;
  // 窓の中 (ワールド座標)
  const x0 = 1172, y0 = 418, ps = 0.22;
  const ckX = 1096, ckY = 408, ckS = 0.08;
  const reach = f < 28 ? 0 : f < 38 ? easeInOut(seg(f, 28, 38)) : f < 50 ? 1 : 1 - easeInOut(seg(f, 50, 58));
  const press = seg(f, 38, 42) * (1 - seg(f, 46, 52) * 0.8);
  const ringing = f < 41 ? 1 : 0;
  const roll = easeInOut(seg(f, 56, 70));
  const rollC = Math.cos(Math.PI * roll);
  const sy = Math.sign(rollC || 1) * Math.max(0.3, Math.abs(rollC));
  const relieved = f >= 44;
  // 腕 (寝ている人の局所座標)。肩 → ひじ → ボタン
  const btnL: Pt = [(y0 - (ckY - 128 * ckS - 2)) / ps, (ckX - x0) / ps];
  const handL: Pt = [lerp(40, btnL[0], reach), lerp(-150, btnL[1], reach)];
  const elbowL: Pt = [lerp(50, 132, reach), lerp(-110, -250, reach)];
  // ノッカー・アップ (画面座標)
  const frozen = f >= 74;
  const fK = frozen ? 74 : f;
  const droop = easeInOut(seg(f, 82, 120));
  const tip: Pt = [lerp(1036, 900, droop), lerp(206, 540, droop) + (droop > 0 ? Math.sin(f / 5) * 4 * droop : 0)];
  // ガス灯のまたたき (v2: 黒い円の点滅をやめ、炎が小さくなり・明るさと光の輪が弱まって、ゆらっと戻る)
  // MachiNami のガス灯 (x=990, ガラス 420〜500, 炎 488) を同じ形で描き直し、d=0 で元と同じ見た目になる
  const lampFl = 0.85 + 0.15 * Math.sin(f / 2.3) * Math.sin(f / 5.1);
  const lampWave = 0.5 - 0.5 * Math.cos(((f - 100) * Math.PI * 2) / 38);
  const lampD = f < 100 ? 0 : clamp01(seg(f, 100, 112) * lampWave * (0.88 + 0.12 * Math.sin(f / 3.3)));
  const lampDim = 0.5 * clamp01(1 - 0.3 / 1.5); // MachiNami の暗さ (sky=0.3)
  const GLASS = "M 950 420 L 1030 420 L 1018 500 L 962 500 Z";
  return (
    <Frame f={f} seed={6183} bg={MP.night}>
      <defs>
        <clipPath id="mzhb183win"><rect x={1062} y={277} width={126} height={166} /></clipPath>
        <clipPath id="mzhb183glass"><path d="M 950 420 L 1030 420 L 1018 500 L 962 500 Z" /></clipPath>
        <radialGradient id="mzhb183veil">
          <stop offset="0%" stopColor={MP.nightDeep} stopOpacity={0.24} />
          <stop offset="40%" stopColor={MP.nightDeep} stopOpacity={0.13} />
          <stop offset="100%" stopColor={MP.nightDeep} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={world}>
        <MachiNami f={f} sky={0.3} windows={[1, 1, 1, 0, 1, 1]} />
        {/* 窓の中の寝室 */}
        <g clipPath="url(#mzhb183win)">
          <rect x={1060} y={275} width={130} height={170} fill="#3A4466" />
          <rect x={1060} y={275} width={130} height={170} fill={MP.glow} opacity={0.08} />
          <rect x={1140} y={300} width={26} height={30} fill="#4E5A80" stroke={INK} strokeWidth={1.5} />
          <path d="M 1144 324 q 9 -16 18 0" stroke="#7C8AB0" strokeWidth={1.5} fill="none" />
          {/* ベッド */}
          <rect x={1098} y={428} width={96} height={20} fill={MP.woodDark} stroke={INK} strokeWidth={1.8} />
          <rect x={1100} y={422} width={92} height={10} rx={3} fill="#E8E4DA" stroke={INK} strokeWidth={1.5} />
          <ellipse cx={1120} cy={424} rx={16} ry={6} fill={KRP.white} stroke={INK} strokeWidth={1.5} />
          {/* ナイトテーブルと時計 */}
          <rect x={1082} y={420} width={24} height={30} fill={MP.wood} stroke={INK} strokeWidth={1.8} />
          <BellClock x={ckX} y={ckY} s={ckS} f={f} ring={ringing} snooze snoozePress={press} />
          {/* 勲章のロゼット (ボタンに付いている) */}
          <g transform={`translate(${ckX} ${ckY - 128 * ckS + press * 0.6}) scale(0.11)`}>
            <path d="M -10 10 L -26 64 L -6 54 L 4 18 Z M 10 10 L 26 64 L 6 54 L -4 18 Z" fill={KRP.red} stroke={INK} strokeWidth={6} />
            {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={0} cy={-22} rx={10} ry={16} fill={i % 2 ? C.gold : C.goldDark} stroke={INK} strokeWidth={4} transform={`rotate(${i * 36})`} />)}
            <circle r={18} fill={KRP.red} stroke={INK} strokeWidth={5} />
          </g>
          {frozen && <path d={`M ${ckX + 6} ${ckY - 18} l 4 -4 M ${ckX + 9} ${ckY - 12} l 6 -1`} stroke={MP.glow} strokeWidth={1.4} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 3)} />}
          {/* 寝ている男性 (頭が左)。寝返りで体がくるっと返る */}
          <g transform={`translate(0 ${y0}) scale(1 ${sy}) translate(0 ${-y0})`}>
            <g transform={`rotate(-90 ${x0} ${y0})`}>
              <MzHbFig x={x0} y={y0} s={ps} f={f} face={relieved ? "smile" : "worried"} cloth={C.pajamaGray} clothDark={C.pajamaGrayDark} closed="both"
                arms={reach > 0 ? { l: [[67, -148], elbowL, handL], r: [[-67, -148], [-70, -100], [-66, -60]] } : undefined} />
            </g>
            {/* 掛け布団 */}
            <path d={`M 1136 ${y0 - 22} Q 1160 ${y0 - 30} 1196 ${y0 - 22} L 1196 ${y0 + 20} L 1132 ${y0 + 20} Q 1128 ${y0} 1136 ${y0 - 22} Z`} fill={C.quilt} stroke={INK} strokeWidth={1.8} />
            <path d={`M 1150 ${y0 - 24} L 1150 ${y0 + 18} M 1170 ${y0 - 26} L 1170 ${y0 + 18}`} stroke={C.quiltDark} strokeWidth={1.5} />
          </g>
          {relieved && <MzHbZzz x={1128} y={392} f={f} s={0.18} />}
          {/* カーテン (開いている) と窓枠の桟 */}
          <path d="M 1062 277 L 1080 277 Q 1072 360 1078 443 L 1062 443 Z" fill="#6F4F5E" stroke={INK} strokeWidth={1.5} />
          <path d="M 1188 277 L 1172 277 Q 1180 360 1174 443 L 1188 443 Z" fill="#6F4F5E" stroke={INK} strokeWidth={1.5} />
          <line x1={1062} y1={360} x2={1188} y2={360} stroke={INK} strokeWidth={3.5} />
          <line x1={1125} y1={277} x2={1125} y2={360} stroke={INK} strokeWidth={2} />
          {/* ガラスの映りこみ */}
          <path d="M 1070 300 L 1092 285 M 1072 316 L 1104 292" stroke={KRP.white} strokeWidth={2} opacity={0.35} strokeLinecap="round" />
        </g>
        <rect x={1060} y={275} width={130} height={170} fill="none" stroke={INK} strokeWidth={4} />
        {/* ガス灯がまたたく (炎が小さく・暗く・光の輪が弱まる) */}
        {lampD > 0.001 && (
          <g>
            {/* 光の輪を弱める (ふちの無いやわらかな影) */}
            <circle cx={990} cy={460} r={230} fill="url(#mzhb183veil)" opacity={lampD} />
            {/* ガラスを描き直して元の炎を隠し、弱めた明かりと炎をのせる */}
            <path d={GLASS} fill="#F6E7B6" />
            <path d={GLASS} fill={MP.nightDeep} opacity={lampDim + 0.22 * lampD} />
            <g clipPath="url(#mzhb183glass)">
              <circle cx={990} cy={460} r={220} fill={MP.glow} opacity={0.12 * lampFl * (0.4 + lampDim * 1.6) * (1 - 0.7 * lampD)} />
              <circle cx={990} cy={460} r={90} fill={MP.glow} opacity={0.2 * lampFl * (1 - 0.7 * lampD)} />
            </g>
            <path d={GLASS} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 975 420 L 970 500 M 1005 420 L 1010 500" stroke={INK} strokeWidth={3} />
            <g transform={`translate(990 488) scale(${(0.95 + 0.08 * lampFl) * (1 - 0.5 * lampD)})`} opacity={1 - 0.35 * lampD}>
              <path d={`M -12 0 Q -16 -24 ${Math.sin(f / 3) * 3} -44 Q 16 -24 12 0 Z`} fill={MP.flame} stroke="#D9822C" strokeWidth={2} />
              <path d={`M -6 0 Q -8 -14 ${Math.sin(f / 3) * 2} -26 Q 8 -14 6 0 Z`} fill={MP.flameCore} />
              <ellipse cx={0} cy={2} rx={10} ry={4} fill="#7FB2E6" opacity={0.9} />
            </g>
          </g>
        )}
      </g>
      {/* 手前のノッカー・アップ (下から見上げる) */}
      <KnockerUp x={520} y={1120} s={1.5} f={fK} pose="knock" face={frozen ? "surprised" : "worried"} tip={tip} />
      {!frozen && [0, 1, 2].map((i) => {
        const t = ((f / 14 + i / 3) % 1);
        return <MzHbSweat key={i} x={520 + (i - 1) * 90 + (i - 1) * t * 40} y={690 - t * 40 + (i === 1 ? -60 : 0)} s={1.3} rot={(i - 1) * 30} />;
      })}
      {frozen && (
        <g opacity={seg(f, 76, 84)}>
          <path d="M 470 610 q 10 -30 30 -10 M 560 600 q 10 -30 30 -10" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <text x={640} y={620} fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.white} stroke={INK} strokeWidth={5} paintOrder="stroke">…</text>
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #184 ちなみに、スヌーズは体に悪いのか。
// 格: 並 / seed 6184
// 絵: どこ: 現代の寝室の朝 (Shinshitsu ではない別の部屋。白い壁・小さな観葉植物・窓のブラインドから朝の光の筋)。演出: ベッドで寝ているあなた (水色のパジャマ・短い黒髪) の体の上に、半透明の体の中の絵 (心臓・脳の輪郭を簡単に) が重なって浮かぶ。枕元のスマホのスヌーズボタンを押すたびに、体の中の脳の輪郭のまわりに小さな「?」がひとつずつ増える。あなたは寝ぼけまなこで片目を開けて、自分の体の上に浮かぶ「?」を見て首をかしげる (face="worried")。「?」の色は黄色 (よいとも悪いとも決めない色)。動き: f0-30 カメラが寝室の引きからベッドへ寄る / f30-90 スヌーズを押す (2回)・「?」が増える / f90-120 片目を開けて首をかしげる
// どこ: 現代の別の寝室の朝 (白い壁・ブラインドから朝の光の筋・観葉植物・額)。ベッドに寝ているあなた (水色のパジャマ)
// 演出: あなたの体の真上に、半透明の「体の中の絵」(脳と心臓) がふわっと浮かぶ。毛布から出た手が枕元のスマホのスヌーズを押すたび、
//       脳のまわりに黄色い「?」がひとつずつ増える。あなたは片目だけ開けて、浮かぶ「?」を見上げて首をかしげる
// 動き: f0-28 カメラがベッドへ寄る / f12-20 1回目のスヌーズ→? / f28-36 2回目→? / f38-44 片目を開けて見上げる→3つ目の? / 以後 ?がゆれ、心臓が打つ
const Mz184: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 28));
  const k = lerp(1, 1.22, z), cx = lerp(960, 1100, z), cy = lerp(540, 520, z);
  const x0 = 840, y0 = 560, ps = 1.9;
  const pressAt = (a: number) => (f < a - 6 ? 0 : f < a ? easeInOut(seg(f, a - 6, a)) : 1 - easeInOut(seg(f, a + 3, a + 9)));
  const reach = Math.max(pressAt(18), pressAt(34));
  const pushed = (f >= 18 && f < 22) || (f >= 34 && f < 38);
  const ringing = f < 17 || (f > 24 && f < 33);
  // 布団から出る手 (肩口 → スヌーズボタン)
  const HCX = 1205, HCY = 566, HS = 1.4;
  const hx = lerp(1250, 1352, reach), hy = lerp(690, 728, reach);
  const awake = f >= 38;
  const tilt = -6 * easeInOut(seg(f, 40, 50));
  const ghostT = easeOut(seg(f, 2, 14));
  const qs: [number, number, number][] = [[1170, 220, 20], [1400, 200, 36], [1290, 120, 43], [1480, 330, 70]];
  const beat = 1 + 0.12 * Math.max(0, Math.sin(f / 4));
  return (
    <Frame f={f} seed={6184} bg={C.wallWhite}>
      <g transform={`translate(960 540) scale(${k}) translate(${-cx} ${-cy})`}>
        {/* 壁と床 */}
        <rect x={-200} y={-200} width={2320} height={1030} fill={C.wallWhite} />
        <rect x={-200} y={820} width={2320} height={400} fill={C.floorWood} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-200} y1={850 + i * 40} x2={2120} y2={850 + i * 40} stroke={C.floorWoodDark} strokeWidth={4} />)}
        <rect x={-200} y={806} width={2320} height={18} fill={KRP.white} stroke={INK} strokeWidth={4} />
        {/* 窓とブラインド */}
        <rect x={150} y={120} width={380} height={420} fill={MP.morning} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={156} y={128 + i * 25.5} width={368} height={15} fill={KRP.white} stroke={INK} strokeWidth={2.5} />)}
        <line x1={500} y1={120} x2={500} y2={560} stroke={INK} strokeWidth={3} />
        {/* 朝の光の筋 (ブラインドのすきまから斜めに) */}
        <g opacity={0.3 + 0.04 * Math.sin(f / 10)}>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M 530 ${150 + i * 55} L 1500 ${470 + i * 55} L 1500 ${484 + i * 55} L 530 ${164 + i * 55} Z`} fill={MP.glow} />
          ))}
        </g>
        {/* 額と観葉植物 */}
        <rect x={1560} y={200} width={170} height={140} fill={MP.dawnSoft} stroke={INK} strokeWidth={6} />
        <path d="M 1574 326 L 1630 260 L 1670 300 L 1700 274 L 1716 326 Z" fill={KRP.green} stroke={INK} strokeWidth={3.5} />
        <circle cx={1690} cy={236} r={14} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
        <path d="M 1620 830 L 1780 830 L 1760 700 L 1640 700 Z" fill={C.pot} stroke={INK} strokeWidth={6} />
        {[[-50, -150, -30], [0, -200, 0], [50, -160, 30], [-80, -90, -60], [80, -100, 60]].map(([dx, dy, r], i) => (
          <g key={i} transform={`rotate(${r + Math.sin(f / 20 + i) * 3} 1700 700)`}>
            <path d={`M 1700 700 Q ${1700 + dx * 0.3} ${700 + dy * 0.5} ${1700 + dx * 0.2} ${700 + dy}`} stroke={C.plantDark} strokeWidth={6} fill="none" />
            <ellipse cx={1700 + dx * 0.2} cy={700 + dy} rx={34} ry={56} fill={C.plant} stroke={INK} strokeWidth={5} />
            <line x1={1700 + dx * 0.2} y1={700 + dy - 44} x2={1700 + dx * 0.2} y2={700 + dy + 44} stroke={C.plantDark} strokeWidth={3} />
          </g>
        ))}
        {/* ベッド (ヘッドボードは右) */}
        <rect x={1390} y={330} width={44} height={480} rx={10} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <rect x={610} y={560} width={40} height={250} rx={10} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <rect x={640} y={722} width={760} height={66} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={644} y={646} width={752} height={84} rx={14} fill={C.sheet} stroke={INK} strokeWidth={6} />
        <ellipse cx={1215} cy={640} rx={130} ry={42} fill={KRP.white} stroke={INK} strokeWidth={6} />
        <path d="M 1110 640 Q 1215 616 1320 640" stroke={KRP.gray} strokeWidth={4} fill="none" opacity={0.6} />
        {/* あなた (枕に頭を乗せて布団から顔を出す。目は横に2つ並ぶ) */}
        <MzHbBedHead id="mzhb184head" cx={HCX} cy={HCY} s={HS} f={f} face={awake ? "worried" : "normal"} cloth={MP.you} clothDark={MP.youDark}
          closed={awake ? "left" : "both"} gaze={awake ? [5, -9] : undefined} tilt={tilt} />
        {/* 掛け布団 (足は左へのびる。あごの下まで) */}
        <path d="M 640 560 Q 760 512 900 520 Q 1040 528 1100 600 Q 1120 640 1128 652 Q 1230 646 1350 654 L 1352 770 L 640 770 Q 624 660 640 560 Z" fill={C.quilt} stroke={INK} strokeWidth={6} />
        <path d="M 1118 646 Q 1234 636 1352 648 L 1352 684 Q 1234 674 1122 684 Z" fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {[780, 900, 1020].map((qx) => <path key={qx} d={`M ${qx} ${qx < 1000 ? 528 : 560} Q ${qx + 10} 650 ${qx} 766`} stroke={C.quiltDark} strokeWidth={4} fill="none" />)}
        {!awake && <MzHbZzz x={1290} y={450} f={f} s={1.1} />}
        {/* 手前のナイトテーブルとスマホ (スヌーズの大きなボタン) */}
        <rect x={1270} y={768} width={180} height={150} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <rect x={1290} y={800} width={140} height={50} rx={6} fill="none" stroke={INK} strokeWidth={4} />
        <circle cx={1360} cy={825} r={7} fill={MP.brass} stroke={INK} strokeWidth={3} />
        <g transform={`translate(${ringing ? Math.sin(f * 2.2) * 3 : 0} 0)`}>
          <rect x={1308} y={624} width={88} height={146} rx={14} fill={C.phone} stroke={INK} strokeWidth={6} />
          <rect x={1316} y={636} width={72} height={118} rx={6} fill={C.screen} />
          <path d="M 1340 682 q 0 -18 12 -18 q 12 0 12 18 l 4 8 h -32 Z" fill={MP.bell} stroke={INK} strokeWidth={3} />
          <rect x={1322} y={716} width={60} height={26} rx={13} fill={pushed ? "#C9742A" : C.snoozeBtn} stroke={INK} strokeWidth={3.5}
            transform={pushed ? "translate(0 2)" : undefined} />
          <path d="M 1340 724 h 8 l -8 10 h 8 M 1356 724 h 8 l -8 10 h 8" stroke={KRP.white} strokeWidth={3} fill="none" />
        </g>
        <MzHbRing x={1352} y={700} r={66} f={f} amt={ringing ? 1 : 0} />
        {/* 布団から出てスヌーズを押す手 (水色のパジャマの袖) */}
        {reach > 0.02 && (
          <g>
            <path d={`M 1250 690 L ${hx} ${hy}`} stroke={INK} strokeWidth={32} strokeLinecap="round" />
            <path d={`M 1250 690 L ${hx} ${hy}`} stroke={MP.you} strokeWidth={23} strokeLinecap="round" />
            <circle cx={hx} cy={hy} r={16} fill={KRP.white} stroke={INK} strokeWidth={5} />
          </g>
        )}
        {/* 体の中の絵 (半透明で上に浮かぶ) */}
        <g opacity={ghostT} transform={`translate(0 ${-220 + Math.sin(f / 16) * 6})`}>
          <g transform={`rotate(90 ${x0} ${y0})`} opacity={0.55}>
            <g transform={`translate(${x0} ${y0}) scale(${ps})`}>
              <circle cx={0} cy={-228} r={64} fill={C.ghost} stroke={KRP.blueDeep} strokeWidth={4} strokeDasharray="12 9" />
              <rect x={-58} y={-160} width={116} height={108} rx={16} fill={C.ghost} stroke={KRP.blueDeep} strokeWidth={4} strokeDasharray="12 9" />
              <rect x={-30} y={-58} width={60} height={52} rx={10} fill={C.ghost} stroke={KRP.blueDeep} strokeWidth={4} strokeDasharray="12 9" />
            </g>
          </g>
          {/* 脳 */}
          <g transform={`translate(${1296} ${560})`}>
            <path d="M -70 30 Q -86 -20 -50 -44 Q -20 -70 20 -56 Q 70 -54 76 -10 Q 86 30 50 46 Q 0 62 -40 50 Q -66 46 -70 30 Z" fill={C.brain} stroke={INK} strokeWidth={5} />
            <path d="M -50 0 q 16 -20 30 0 q 14 20 30 0 q 14 -20 30 0 M -40 30 q 14 -14 28 0 M 10 -30 q 10 16 26 6" stroke="#C9788C" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
          {/* 心臓 (どきどき) */}
          <g transform={`translate(1060 ${y0 + 10}) scale(${beat})`}>
            <path d="M 0 30 C -50 0 -46 -40 -20 -40 C -6 -40 0 -28 0 -20 C 0 -28 6 -40 20 -40 C 46 -40 50 0 0 30 Z" fill={C.heart} stroke={INK} strokeWidth={5} />
            <path d="M -22 -24 q -8 6 -6 16" stroke={KRP.white} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
        </g>
        {/* 黄色い「?」 (押すたびに増える) */}
        {qs.map(([qx, qy, at], i) => <QMark key={i} x={qx} y={qy} s={0.62} f={f + i * 20} t={seg(f, at, at + 6)} color={KRP.yellow} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #185 2023年の研究では、30分ほどのスヌーズなら、はっきりした悪い影響は、見つかりませんでした。
// 格: 図 / seed 6185
// 絵: どこ: 2023年の大学の睡眠の研究室 (白い壁・ベッドが2台・頭に電極のコードをつけて寝る人・壁のモニター・コーヒーの紙コップ・窓の外は朝)。年代札「2023年」と小札「31人」「30分」。演出: 白衣の研究者の女性 (肩まで届く茶色の長い髪・白衣の下に赤いスカート) と男性 (短い黒髪・白衣にズボン) がモニターの前に並ぶ。モニターには2本の線グラフ (スヌーズあり / なし) が描かれていき、2本はほとんど重なって進む。研究者の女性が拡大鏡のアイコンでグラフを拡大しても、差の印は出てこず「×(見つからない)」ではなく、小さな「—」の横棒のしるしだけ (よいとも決めつけない)。2人が顔を見合わせて肩をすくめる。奥のベッドの人は30分のスヌーズの間ずっと気持ちよさそう。動き: f0-30 カメラが研究室の入口からモニターへ寄る / f30-100 線グラフが左から描かれる (2本が重なる) / f100-130 拡大しても差が出ない / f130-150 2人が肩をすくめる
// どこ: 2023年の大学の睡眠の研究室 (白い壁・壁の大きなモニター・ベッド2台・頭に電極のコードで寝る人・脳波の機械・コーヒーの紙コップ・朝の窓)
// 演出: 白衣の女性 (茶色の長い髪・赤いスカート) と男性 (短い黒髪・ズボン) がモニターの前。モニターに「スヌーズあり/なし」の線が2本、
//       ほぼ重なって伸びる。拡大鏡のアイコンで寄せても重なったまま、出てくるのは小さな「—」のしるしだけ。2人は顔を見合わせて肩をすくめる。
//       奥のベッドの人はずっと気持ちよさそう
// 動き: f0-24 カメラがモニターへ寄る / f6-40 線グラフが左から描かれる / f48-100 拡大鏡が線をなぞる / f100 「—」 / f120-150 肩をすくめる
const Mz185: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 24));
  const k = lerp(1, 1.15, z), cx = lerp(960, 900, z), cy = lerp(540, 430, z);
  const GX0 = 560, GX1 = 1180, GY0 = 170, GY1 = 420;
  const prog = easeInOut(seg(f, 6, 40));
  const lineY = (x: number, off: number) => 300 - 70 * Math.sin((x - GX0) / 110) + 18 * Math.sin((x - GX0) / 37) + off * Math.sin((x - GX0) / 23);
  const pts = (off: number, x1: number) => {
    const a: string[] = [];
    for (let x = GX0; x <= x1; x += 8) a.push(`${x} ${lineY(x, off).toFixed(1)}`);
    return a.length ? "M " + a.join(" L ") : "";
  };
  const xEnd = GX0 + (GX1 - GX0) * prog;
  const lensT = seg(f, 48, 100);
  const lensX = lerp(660, 1100, easeInOut(lensT));
  const lensY = lineY(lensX, 0);
  const lensOn = f >= 46 && f < 112 ? Math.min(seg(f, 46, 52), 1 - seg(f, 106, 112)) : 0;
  const dash = pop(seg(f, 100, 108));
  const shrug = seg(f, 120, 130) * (1 - seg(f, 170, 180) * 0.3);
  const sh = shrug > 0.5;
  const wArms = sh
    ? { l: [[-67, -148], [-118, -124], [-136, -172]] as Pt[], r: [[67, -148], [118, -124], [136, -172]] as Pt[] }
    : { l: [[-67, -148], [-84, -100], [-30, -118]] as Pt[], r: [[67, -148], [112, -206], [146, -268]] as Pt[] };
  const mArms = sh
    ? { l: [[-67, -148], [-118, -124], [-136, -172]] as Pt[], r: [[67, -148], [118, -124], [136, -172]] as Pt[] }
    : { l: [[-67, -148], [-72, -100], [-22, -112]] as Pt[], r: [[67, -148], [72, -100], [22, -112]] as Pt[] };
  const shrugLines = sh ? (
    <path d="M -96 -176 q 10 -12 20 0 M 76 -176 q 10 -12 20 0" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  ) : null;
  return (
    <Frame f={f} seed={6185} bg={C.labWall}>
      <defs>
        <clipPath id="mzhb185lens"><circle cx={lensX} cy={lensY} r={70} /></clipPath>
      </defs>
      <g transform={`translate(960 540) scale(${k}) translate(${-cx} ${-cy})`}>
        <rect x={-200} y={-200} width={2320} height={960} fill={C.labWall} />
        <rect x={-200} y={760} width={2320} height={500} fill={C.labFloor} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-200 + i * 180} y1={760} x2={-320 + i * 200} y2={1100} stroke={KRP.grayDark} strokeWidth={3} opacity={0.4} />)}
        <line x1={-200} y1={760} x2={2120} y2={760} stroke={INK} strokeWidth={5} />
        {/* 朝の窓 */}
        <rect x={1400} y={90} width={420} height={300} fill={MP.morning} stroke={INK} strokeWidth={7} />
        <circle cx={1730} cy={180} r={40} fill={KRP.yellow} stroke={INK} strokeWidth={4} />
        <path d="M 1404 330 L 1480 290 L 1560 320 L 1660 280 L 1816 320 L 1816 386 L 1404 386 Z" fill={KRP.green} stroke={INK} strokeWidth={4} />
        <line x1={1610} y1={90} x2={1610} y2={390} stroke={INK} strokeWidth={6} />
        {/* 奥のベッド (空・たたんだ毛布) */}
        <rect x={1560} y={560} width={300} height={40} fill={KRP.silver} stroke={INK} strokeWidth={5} />
        <rect x={1564} y={530} width={292} height={34} rx={8} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <rect x={1700} y={512} width={120} height={26} rx={6} fill={KRP.blueSoft} stroke={INK} strokeWidth={4} />
        <line x1={1580} y1={600} x2={1580} y2={700} stroke={INK} strokeWidth={8} />
        <line x1={1840} y1={600} x2={1840} y2={700} stroke={INK} strokeWidth={8} />
        {/* 手前のベッドと、電極をつけて気持ちよく寝る人 */}
        <rect x={1280} y={640} width={420} height={50} fill={KRP.silver} stroke={INK} strokeWidth={5} />
        <rect x={1284} y={604} width={412} height={40} rx={10} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <ellipse cx={1340} cy={604} rx={60} ry={20} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <g transform={`rotate(-90 1520 590)`}>
          <MzHbFig x={1520} y={590} s={0.75} f={f} face="smile" cloth={KRP.blueSoft} clothDark={KRP.blue} closed="both" />
        </g>
        <path d="M 1450 520 Q 1560 520 1700 520 L 1700 640 L 1440 640 Q 1430 580 1450 520 Z" fill={KRP.blue} stroke={INK} strokeWidth={5} />
        {/* 電極のコード → 脳波の機械 */}
        {[[1340, 520], [1366, 530], [1316, 534]].map(([ex, ey], i) => (
          <g key={i}>
            <path d={`M ${ex} ${ey} Q ${ex + 40} ${420 - i * 10} ${1880} ${470 + i * 8}`} stroke={[KRP.red, KRP.blueDeep, KRP.yellow][i]} strokeWidth={4} fill="none" />
            <circle cx={ex} cy={ey} r={7} fill={KRP.silver} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <rect x={1860} y={420} width={140} height={200} rx={10} fill={KRP.gray} stroke={INK} strokeWidth={5} />
        <rect x={1872} y={436} width={116} height={70} fill="#1E2A30" />
        <path d={mzHbWavy(1876, 470 + Math.sin(f / 5) * 3, 108, 9, 10)} stroke="#8FF0C8" strokeWidth={3} fill="none" />
        <MzHbZzz x={1370} y={470} f={f} s={0.9} />
        {/* 左の机: キーボード・紙・コーヒーの紙コップ */}
        <rect x={40} y={620} width={380} height={24} fill={KRP.gray} stroke={INK} strokeWidth={5} />
        <line x1={70} y1={644} x2={70} y2={760} stroke={INK} strokeWidth={10} />
        <line x1={390} y1={644} x2={390} y2={760} stroke={INK} strokeWidth={10} />
        <rect x={90} y={600} width={170} height={22} rx={4} fill={KRP.white} stroke={INK} strokeWidth={4} />
        <path d="M 290 620 L 300 556 L 344 556 L 352 620 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
        <rect x={296} y={566} width={52} height={20} fill={MP.wood} />
        <path d="M 210 600 L 216 548 L 252 548 L 258 600 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
        <rect x={213} y={558} width={42} height={16} fill={MP.wood} />
        {[0, 1].map((i) => <path key={i} d={`M ${316 + i * 14} 548 q ${Math.sin(f / 9 + i) * 8} -14 0 -28 q ${-Math.sin(f / 9 + i) * 8} -14 0 -28`} stroke={KRP.grayDark} strokeWidth={4} fill="none" opacity={0.6} />)}
        {/* 壁のモニター */}
        <rect x={480} y={100} width={760} height={372} rx={16} fill={C.monitor} stroke={INK} strokeWidth={7} />
        <rect x={500} y={120} width={720} height={332} fill={C.monScreen} />
        <line x1={GX0} y1={GY0 - 20} x2={GX0} y2={GY1} stroke={INK} strokeWidth={4} />
        <line x1={GX0} y1={GY1} x2={GX1 + 20} y2={GY1} stroke={INK} strokeWidth={4} />
        {[220, 280, 340].map((gy) => <line key={gy} x1={GX0} y1={gy} x2={GX1} y2={gy} stroke={KRP.gray} strokeWidth={2} strokeDasharray="8 8" />)}
        {prog > 0 && <path d={pts(0, xEnd)} stroke={C.lineNo} strokeWidth={7} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
        {prog > 0 && <path d={pts(5, xEnd)} stroke={C.lineYes} strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="20 10" />}
        {prog > 0 && prog < 1 && <circle cx={xEnd} cy={lineY(xEnd, 0)} r={9} fill={C.lineYes} stroke={INK} strokeWidth={3} />}
        {/* 凡例 */}
        <line x1={900} y1={146} x2={940} y2={146} stroke={C.lineYes} strokeWidth={7} strokeDasharray="14 6" />
        <text x={948} y={154} fontFamily={FONT} fontWeight={800} fontSize={22} fill={INK}>スヌーズあり</text>
        <line x1={1090} y1={146} x2={1130} y2={146} stroke={C.lineNo} strokeWidth={7} />
        <text x={1138} y={154} fontFamily={FONT} fontWeight={800} fontSize={22} fill={INK}>なし</text>
        {/* 拡大鏡 (アイコン) */}
        {lensOn > 0 && (
          <g opacity={lensOn}>
            <circle cx={lensX} cy={lensY} r={70} fill={KRP.white} />
            <g clipPath="url(#mzhb185lens)">
              <g transform={`translate(${lensX} ${lensY}) scale(2.2) translate(${-lensX} ${-lensY})`}>
                <path d={pts(0, GX1)} stroke={C.lineNo} strokeWidth={4} fill="none" />
                <path d={pts(5, GX1)} stroke={C.lineYes} strokeWidth={3.5} fill="none" strokeDasharray="10 5" />
              </g>
            </g>
            <circle cx={lensX} cy={lensY} r={70} fill="none" stroke={INK} strokeWidth={8} />
            <line x1={lensX + 50} y1={lensY + 50} x2={lensX + 104} y2={lensY + 104} stroke={INK} strokeWidth={18} strokeLinecap="round" />
          </g>
        )}
        {dash > 0 && (
          <g transform={`translate(1150 ${GY0 + 10}) scale(${dash})`}>
            <circle r={38} fill={KRP.white} stroke={INK} strokeWidth={5} />
            <rect x={-20} y={-6} width={40} height={12} rx={6} fill={KRP.grayDark} />
          </g>
        )}
        {/* 研究者2人 (女性: 長い茶色の髪・赤いスカート / 男性: 短い黒髪・ズボン) */}
        <MzHbFig x={640} y={830} s={1} f={f} phase={1} face={sh ? "smile" : f > 90 ? "worried" : "normal"} cloth={C.labCoat} clothDark="#5A4A48"
          hair="long" skirt={C.skirtRed} coat={C.labCoat} gaze={sh ? [8, 0] : [5, -7]} arms={wArms}
          front={<g>
            <path d="M -22 -160 L 0 -128 L 22 -160 Z" fill={C.skirtRed} stroke={INK} strokeWidth={3.5} />
            {!sh && <rect x={-56} y={-150} width={44} height={60} rx={6} fill={MP.iron} stroke={INK} strokeWidth={4} transform="rotate(-20 -34 -120)" />}
            {shrugLines}
          </g>} />
        <MzHbFig x={1120} y={830} s={1} f={f} phase={2} face={sh ? "smile" : f > 90 ? "worried" : "normal"} cloth={C.labCoat} clothDark={KRP.blueDeep}
          hair="cap" coat={C.labCoat} gaze={sh ? [-8, 0] : [-5, -7]} arms={mArms}
          front={<g>
            <path d="M -22 -160 L 0 -128 L 22 -160 Z" fill={KRP.blue} stroke={INK} strokeWidth={3.5} />
            {!sh && (<g><rect x={-42} y={-150} width={84} height={100} rx={6} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
              <rect x={-34} y={-138} width={68} height={82} fill={KRP.white} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={mzHbWavy(-28, -122 + i * 18, 56, 2, 8)} stroke={KRP.grayDark} strokeWidth={2.5} fill="none" />)}
              <rect x={-14} y={-156} width={28} height={12} rx={3} fill={KRP.silver} stroke={INK} strokeWidth={3} /></g>)}
            {shrugLines}
          </g>} />
      </g>
      <TagPlate x={300} y={176} text="2023年" size={44} t={seg(f, 2, 10)} />
      <TagPlate x={1480} y={150} text="31人" size={36} t={seg(f, 8, 16)} />
      <TagPlate x={1680} y={176} text="30分" size={36} t={seg(f, 12, 20)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #186 人類、ひと安心です。
// 格: 山 / seed 6186
// 絵: どこ: 夜明けの地球を宇宙から見た1枚 (画面の短辺の3/4の大きさの地球・夜と朝の境目の線・星)。地球の表面に、各地のベッドで寝ている人たちが小さく、でもひと目で分かる大きさで並ぶ (男女を混ぜる: 女性は長い髪がまくらに広がる、男性は短い黒髪。子どもと老人も)。演出: 全員の枕元でいっせいに小さなスヌーズボタンがぽちっと押され、全員がほっとした顔で同時にごろんと寝返りを打つ (地球ごとちょっと回るように見える)。地球全体から「ふう」という大きなため息の白い息がふわっと宇宙へ上がる。そのため息で、そばを通っていた人工衛星がくるくるっとよろめく。動き: f0-30 カメラが宇宙から地球へゆっくり寄る / f30-60 いっせいにぽちっ / f60-100 全員が寝返り・地球がわずかに回る / f100-140 ため息が上がる・人工衛星がよろめく
// どこ: 宇宙から見た夜明けの地球 (直径810。右が朝・左が夜で街の灯・境目に夜明けの橙の線・星・人工衛星)
// 演出: 地球の表面のあちこちのベッドで寝ている人たち (男女・子ども・老人)。枕元の小さなスヌーズボタンがいっせいにぽちっと押され、
//       全員がほっとした顔で同時にごろんと寝返り (地球もちょっと回る)。地球全体から「ふう」の白い息がもくもく上がり、人工衛星がくるくるよろめく
// 動き: f0-24 カメラがゆっくり寄る / f14-22 いっせいにぽちっ / f22-36 寝返り・地球が回る / f28-56 ため息が上がる / f40-71 人工衛星がよろめく
const Mz186: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(0.92, 1.0, easeInOut(seg(f, 0, 24)));
  const GX = 960, GY = 600, R = 405;
  const press = seg(f, 14, 18) * (1 - seg(f, 22, 26));
  const pressed = f >= 16;
  const roll = easeInOut(seg(f, 22, 36));
  const spin = -f * 0.35 - 26 * roll;
  const sigh = seg(f, 28, 56);
  const satSpin = easeOut(seg(f, 40, 66)) * 600;
  const satX = 1560 + seg(f, 40, 71) * 90 + Math.sin(f / 4) * 6 * seg(f, 40, 50);
  const satY = 220 - seg(f, 40, 71) * 50;
  type Kind = "m" | "w" | "kid" | "old";
  const beds: { x: number; y: number; kind: Kind; r: number; flip?: boolean }[] = [
    { x: 700, y: 330, kind: "w", r: -14 }, { x: 960, y: 290, kind: "m", r: 0 }, { x: 1220, y: 340, kind: "old", r: 14 },
    { x: 600, y: 520, kind: "kid", r: -8 }, { x: 860, y: 480, kind: "w", r: -2 }, { x: 1110, y: 500, kind: "m", r: 4 },
    { x: 1330, y: 560, kind: "w", r: 12 }, { x: 760, y: 680, kind: "m", r: -6 }, { x: 1040, y: 690, kind: "old", r: 2 },
  ];
  const sky = (i: number) => [rnd(31, i) * 1920, rnd(32, i) * 1080] as Pt;
  // 大陸 (地球の中心が原点・半径405。おおまかなアフリカ・ヨーロッパ・アジア・日本)
  const lands = [
    "M -190 10 L -120 -20 L -40 -14 L 30 0 L 60 50 L 100 80 L 72 112 L 52 180 L 14 250 L -16 280 L -46 250 L -66 180 L -86 120 L -136 100 L -194 70 Z",
    "M -170 -40 L -186 -84 L -150 -96 L -120 -126 L -90 -140 L -100 -200 L -70 -240 L -30 -230 L -20 -170 L 20 -160 L 50 -120 L 30 -80 L -10 -60 L -60 -56 L -110 -40 Z",
    "M 40 -150 L 120 -200 L 240 -220 L 340 -190 L 390 -130 L 370 -70 L 310 -30 L 270 20 L 230 50 L 190 40 L 170 110 L 140 50 L 110 20 L 104 70 L 70 40 L 60 -20 L 50 -90 Z",
    "M 344 -70 Q 360 -60 356 -40 Q 350 -20 336 -14 Q 346 -40 344 -70 Z",
    "M 240 170 L 330 150 L 370 200 L 340 260 L 260 250 Z",
  ];
  const sleeperCloth = (kind: Kind, i: number) => (kind === "w" ? ["#D9708A", "#C8433A", "#B84A6A"][i % 3] : kind === "kid" ? KRP.yellow : kind === "old" ? "#8C8F96" : [KRP.blueDeep, "#3E4B66"][i % 2]);
  return (
    <Frame f={f} seed={6186} bg={C.space} dark>
      <rect x={0} y={0} width={1920} height={1080} fill={C.space} />
      {Array.from({ length: 70 }, (_, i) => {
        const [sx, sy] = sky(i);
        return <circle key={i} cx={sx} cy={sy} r={i % 5 === 0 ? 3.5 : 2} fill="#FFF6D8" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />;
      })}
      <defs>
        <clipPath id="mzhb186globe"><circle cx={GX} cy={GY} r={R} /></clipPath>
      </defs>
      <g transform={`translate(${GX} ${GY}) scale(${k}) translate(${-GX} ${-GY})`}>
        {/* 朝日の光輪 (右) */}
        <circle cx={GX + 30} cy={GY} r={R + 40} fill={MP.dawnSoft} opacity={0.18} />
        <circle cx={GX} cy={GY} r={R + 14} fill={KRP.blueSoft} opacity={0.35} />
        {/* 地球 */}
        <circle cx={GX} cy={GY} r={R} fill={C.sea} stroke={INK} strokeWidth={8} />
        <g clipPath="url(#mzhb186globe)">
          <g transform={`translate(${GX + spin} ${GY})`}>
            {lands.map((d, i) => <path key={i} d={d} fill={C.land} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
            {lands.map((d, i) => <path key={`s${i}`} d={d} fill={C.land} stroke={INK} strokeWidth={5} transform="translate(-820 0)" />)}
          </g>
          {/* 夜の側 (左) と街の灯 */}
          <path d={`M ${GX - 60} ${GY - 420} Q ${GX + 90} ${GY} ${GX - 60} ${GY + 420} L ${GX - 430} ${GY + 420} L ${GX - 430} ${GY - 420} Z`} fill={MP.nightDeep} opacity={0.55} />
          <path d={`M ${GX - 60} ${GY - 420} Q ${GX + 90} ${GY} ${GX - 60} ${GY + 420}`} stroke={MP.dawn} strokeWidth={22} fill="none" opacity={0.55} />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={GX - 380 + rnd(41, i) * 360} cy={GY - 300 + rnd(42, i) * 600} r={3.5} fill={MP.flame} opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} />
          ))}
          <ellipse cx={GX - 120} cy={GY - 170} rx={240} ry={120} fill={KRP.white} opacity={0.12} />
          <path d={`M ${GX + 180} ${GY - 300} A 400 400 0 0 1 ${GX + 380} ${GY - 40}`} stroke={KRP.white} strokeWidth={16} fill="none" opacity={0.3} strokeLinecap="round" />
        </g>
        {/* ベッドの人たち */}
        {beds.map((b, i) => {
          const ps = b.kind === "kid" ? 0.3 : 0.4;
          const cl = sleeperCloth(b.kind, i);
          const rollC = Math.cos(Math.PI * roll);
          const sy = Math.sign(rollC || 1) * Math.max(0.3, Math.abs(rollC));
          return (
            <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r + Math.sin(roll * Math.PI) * 6})`}>
              {/* ベッド */}
              <rect x={-96} y={2} width={176} height={22} rx={4} fill={MP.wood} stroke={INK} strokeWidth={4} />
              <rect x={-92} y={-10} width={168} height={16} rx={6} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
              <ellipse cx={54} cy={-12} rx={30} ry={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
              {b.kind === "w" && <path d="M 40 -40 Q 92 -40 92 -8 Q 70 -4 50 -10 Z" fill={HAIR_BROWN} stroke={INK} strokeWidth={3} />}
              <g transform={`translate(0 -22) scale(1 ${sy}) translate(0 22)`}>
                <g transform={`translate(${-40} ${-22}) rotate(90)`}>
                  <MzHbFig x={0} y={0} s={ps} f={f} phase={i} face={pressed ? "smile" : "worried"} cloth={cl} clothDark={cl}
                    hair={b.kind === "w" ? "long" : b.kind === "old" ? "white" : "cap"} mustache={b.kind === "old" ? "#F4F4F0" : undefined} closed="both" />
                </g>
                <path d="M -100 -44 Q -40 -54 20 -42 Q 26 -14 20 8 L -100 8 Q -106 -20 -100 -44 Z" fill={[C.quilt, KRP.blueSoft, "#F2C6CF", "#CDE6C3"][i % 4]} stroke={INK} strokeWidth={4} />
              </g>
              {/* 枕元の小さなスヌーズボタン */}
              <rect x={86} y={-4} width={26} height={28} fill={MP.woodLight} stroke={INK} strokeWidth={3} />
              <ellipse cx={99} cy={-6 + press * 4} rx={13} ry={6} fill={pressed ? "#C9742A" : C.snoozeBtn} stroke={INK} strokeWidth={3} />
              {!pressed && <MzHbRing x={99} y={-8} r={18} f={f + i} w={3.5} color={KRP.white} />}
              {press > 0.3 && <path d="M 99 -24 l 0 -14 M 86 -20 l -8 -10 M 112 -20 l 8 -10" stroke={MP.glow} strokeWidth={4} strokeLinecap="round" />}
            </g>
          );
        })}
        {/* 「ふう」のため息 (白い息がもくもく上がる) */}
        {sigh > 0 && (
          <g opacity={Math.min(1, sigh * 3) * (1 - seg(f, 62, 71) * 0.6)}>
            {Array.from({ length: 9 }, (_, i) => {
              const t = clamp01(sigh * 1.3 - i * 0.04);
              const px = GX - 260 + i * 65 + t * (120 + i * 30);
              const py = GY - R + 40 - t * (200 + (i % 3) * 30);
              return <circle key={i} cx={px} cy={py} r={30 + t * 50} fill={KRP.white} stroke={INK} strokeWidth={4} opacity={0.9} />;
            })}
            {[0, 1, 2].map((i) => <path key={i} d={`M ${GX + 200 + i * 40} ${GY - R - 40 - sigh * 120} q 60 -30 120 ${-10 - i * 10}`} stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round" />)}
          </g>
        )}
      </g>
      {/* 人工衛星 (よろめいて回る) */}
      <g transform={`translate(${satX} ${satY}) rotate(${-20 + satSpin})`}>
        <rect x={-130} y={-24} width={90} height={48} fill={KRP.blueDeep} stroke={INK} strokeWidth={5} />
        <rect x={40} y={-24} width={90} height={48} fill={KRP.blueDeep} stroke={INK} strokeWidth={5} />
        {[-100, -70, 70, 100].map((lx) => <line key={lx} x1={lx} y1={-24} x2={lx} y2={24} stroke={KRP.blueSoft} strokeWidth={3} />)}
        <line x1={-40} y1={0} x2={40} y2={0} stroke={INK} strokeWidth={6} />
        <rect x={-30} y={-34} width={60} height={68} rx={8} fill={MP.brassLight} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-46} r={12} fill={KRP.silver} stroke={INK} strokeWidth={4} />
      </g>
      {f >= 42 && [0, 1, 2].map((i) => (
        <path key={i} d={`M ${satX - 160 + i * 20} ${satY + 60 + i * 30} q 40 ${-20} 80 0`} stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #187 でも、止められる目覚ましでは、起きられない人もいます。
// 格: 並 / seed 6187
// 絵: どこ: 2000年代はじめの大学の学生寮の部屋 (散らかった机・壁のポスター (字なし)・洗濯物・床の教科書の山・窓の外に朝日)。演出: ベッドの男子学生 (短い黒髪・灰色のTシャツ) が、目覚まし時計 (BellClock snooze=true) を毛布の中に抱え込んで寝ている。時計が鳴る (ring=1) たびに、毛布の中から手だけがにゅっと出てスヌーズを押す (押した回数が、壁のカレンダーの横に正の字のような線で1本ずつ増える。字は書かない線だけ)。線が増えていって7本目、時計のハンマーが疲れてぐったり垂れ、ベルの上に汗のしずく。窓の外の太陽はもうずいぶん高い。動き: f0-120 鳴る→押す を4回 (だんだん速く) / 線が増える / f120-150 時計がぐったり・太陽が上がる / 学生はいびき
// どこ: 2000年代はじめの大学の学生寮 (散らかった机とブラウン管・字のないポスター・窓の洗濯物・床の教科書の山・壁のカレンダー)
// 演出: ベッドの男子学生 (短い黒髪・灰色のTシャツ) が BellClock (snooze) を毛布の中に抱えて寝ている。鳴るたび毛布から手だけにゅっと出て
//       スヌーズを押す。壁のカレンダーの横の線が1本ずつ増えて7本。最後に時計はぐったり傾き、ベルに汗。窓の太陽はどんどん高くなる。学生はいびき
// 動き: f0-43 鳴る→押す を4回 (だんだん速く・線が4→7本) / f48-70 時計がぐったり / 全体 太陽が昇る・いびき
const Mz187: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.08, easeInOut(seg(f, 0, 124)));
  const presses = [10, 23, 34, 43];
  const rings: [number, number][] = [[0, 9], [14, 22], [27, 33], [37, 42]];
  const ring = rings.some(([a, b]) => f >= a && f < b) ? 1 : 0;
  const reachOf = (p: number) => (f < p - 4 ? 0 : f < p ? easeOut(seg(f, p - 4, p)) : 1 - easeInOut(seg(f, p + 1, p + 5)));
  const reach = Math.max(...presses.map(reachOf));
  const pressNow = presses.some((p) => f >= p - 1 && f < p + 2);
  const count = 3 + presses.filter((p) => f >= p).length;
  const tired = easeInOut(seg(f, 48, 66));
  const sunY = lerp(380, 120, easeInOut(seg(f, 0, 124)));
  const CKX = 1090, CKY = 520, CKS = 0.42;
  const btnY = CKY - 128 * CKS;
  const hx = lerp(1150, CKX + 6, reach), hy = lerp(600, btnY + 4, reach);
  return (
    <Frame f={f} seed={6187} bg={C.dormWall}>
      <g transform={`translate(960 540) scale(${k}) translate(-1000 -520)`}>
        <rect x={-200} y={-200} width={2320} height={1000} fill={C.dormWall} />
        <rect x={-200} y={800} width={2320} height={400} fill={C.dormFloor} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-200 + i * 200} y1={800} x2={-260 + i * 220} y2={1100} stroke={MP.woodDark} strokeWidth={3} opacity={0.4} />)}
        <line x1={-200} y1={800} x2={2120} y2={800} stroke={INK} strokeWidth={5} />
        {/* 窓・太陽・洗濯物 */}
        <rect x={560} y={90} width={420} height={340} fill={MP.morning} stroke={INK} strokeWidth={7} />
        <g>
          <circle cx={860} cy={sunY} r={50} fill={KRP.yellow} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={860} y1={sunY - 64} x2={860} y2={sunY - 84} stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45 + f} 860 ${sunY})`} />)}
        </g>
        <path d="M 564 360 L 640 330 L 720 350 L 800 320 L 976 350 L 976 426 L 564 426 Z" fill="#9FB3C8" stroke={INK} strokeWidth={4} />
        <line x1={770} y1={90} x2={770} y2={430} stroke={INK} strokeWidth={6} />
        <line x1={540} y1={130} x2={1000} y2={140} stroke={INK} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 14) * 3} 640 132)`}>
          <path d="M 590 132 L 690 132 L 712 160 L 690 172 L 686 240 L 594 240 L 590 172 L 568 160 Z" fill={C.blanketBlue} stroke={INK} strokeWidth={4} />
        </g>
        <path d={`M 880 136 L 904 136 L 904 196 Q 904 210 890 210 L 870 210 Q 860 198 874 194 L 880 194 Z`} fill={KRP.white} stroke={INK} strokeWidth={4} transform={`rotate(${Math.sin(f / 12 + 1) * 4} 892 136)`} />
        {/* ポスター (字なし: 惑星と星) */}
        <rect x={1080} y={110} width={220} height={280} fill="#2E3558" stroke={INK} strokeWidth={6} />
        <circle cx={1190} cy={260} r={60} fill={KRP.orange} stroke={INK} strokeWidth={4} />
        <ellipse cx={1190} cy={260} rx={96} ry={20} fill="none" stroke={KRP.yellow} strokeWidth={6} />
        {[[1110, 150], [1270, 170], [1120, 360], [1260, 350], [1230, 140]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={4} fill={KRP.white} />)}
        {[1086, 1294].map((tx) => <rect key={tx} x={tx - 10} y={104} width={20} height={14} fill={KRP.yellow} opacity={0.8} />)}
        {/* カレンダーと正の字のような線 */}
        <rect x={1420} y={130} width={180} height={200} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <rect x={1420} y={130} width={180} height={36} fill={KRP.red} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => <rect key={`${r}${c}`} x={1430 + c * 33} y={178 + r * 36} width={28} height={30} fill="none" stroke={KRP.gray} strokeWidth={2.5} />))}
        <g stroke={INK} strokeWidth={7} strokeLinecap="round">
          {Array.from({ length: Math.min(count, 4) }, (_, i) => <line key={i} x1={1640 + i * 22} y1={170} x2={1640 + i * 22} y2={260} />)}
          {count >= 5 && <line x1={1626} y1={250} x2={1720} y2={180} />}
          {Array.from({ length: Math.max(0, count - 5) }, (_, i) => <line key={`b${i}`} x1={1750 + i * 22} y1={170} x2={1750 + i * 22} y2={260} />)}
        </g>
        {presses.map((p, i) => f >= p && f < p + 8 && (
          <circle key={i} cx={i < 2 ? 1640 + (i + 3) * 22 : 1750 + (i - 2) * 22} cy={215} r={30 * (1 - seg(f, p, p + 8)) + 10} fill="none" stroke={KRP.red} strokeWidth={4} opacity={1 - seg(f, p, p + 8)} />
        ))}
        {/* 散らかった机とブラウン管 */}
        <rect x={20} y={560} width={460} height={26} fill={MP.woodLight} stroke={INK} strokeWidth={5} />
        <rect x={40} y={586} width={22} height={214} fill={MP.wood} stroke={INK} strokeWidth={4} />
        <rect x={438} y={586} width={22} height={214} fill={MP.wood} stroke={INK} strokeWidth={4} />
        <rect x={80} y={380} width={220} height={180} rx={14} fill="#D8D0BE" stroke={INK} strokeWidth={6} />
        <rect x={104} y={402} width={172} height={124} rx={10} fill="#3A4A50" stroke={INK} strokeWidth={4} />
        <path d="M 120 420 Q 150 412 170 420" stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.4} />
        <rect x={150} y={540} width={80} height={20} fill="#C9C0AC" stroke={INK} strokeWidth={4} />
        <path d="M 320 560 L 330 500 L 380 500 L 390 560 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
        <rect x={326} y={510} width={58} height={16} fill={KRP.red} />
        {[0, 1, 2].map((i) => <rect key={i} x={300 + i * 8} y={540 - i * 16} width={150} height={16} fill={[KRP.blue, KRP.green, KRP.orange][i]} stroke={INK} strokeWidth={3.5} transform={`rotate(${-8 + i * 7} 380 ${548 - i * 16})`} />)}
        <path d="M 60 560 L 120 548 L 150 560 Z" fill={KRP.white} stroke={INK} strokeWidth={3} />
        {/* 床の教科書の山 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={440 + (i % 2) * 14 - i * 4} y={784 - i * 30} width={170} height={30} fill={[KRP.blueDeep, KRP.red, KRP.green, KRP.yellow, KRP.orange][i]} stroke={INK} strokeWidth={4} transform={`rotate(${(i % 2 ? 4 : -3)} 520 ${800 - i * 30})`} />
        ))}
        {/* ベッド */}
        <rect x={620} y={620} width={36} height={190} rx={8} fill={MP.wood} stroke={INK} strokeWidth={5} />
        <rect x={640} y={712} width={900} height={70} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={644} y={636} width={892} height={84} rx={12} fill={KRP.white} stroke={INK} strokeWidth={6} />
        <ellipse cx={790} cy={632} rx={120} ry={38} fill={KRP.white} stroke={INK} strokeWidth={6} />
        <path d="M 690 632 Q 790 610 890 632" stroke={KRP.gray} strokeWidth={4} fill="none" opacity={0.6} />
        {/* 学生 (枕に頭を乗せて布団から顔を出す。目は横に2つ並んで閉じている) */}
        <MzHbBedHead id="mzhb187head" cx={790} cy={560} s={1.3} f={f} cloth={C.tshirt} clothDark={C.tshirtDark} closed="both"
          tilt={Math.sin(f / 16) * 2} />
        {/* 抱えている時計 (鳴る→押す→最後はぐったり) */}
        <g transform={`rotate(${tired * 24} ${CKX} ${CKY + 60}) translate(0 ${tired * 10})`}>
          <BellClock x={CKX} y={CKY} s={CKS} f={f} ring={ring} snooze snoozePress={pressNow ? 1 : 0} />
          {tired > 0.3 && (
            <g opacity={tired}>
              <MzHbSweat x={CKX - 40} y={CKY - 76} s={1.1} rot={-20} />
              <MzHbSweat x={CKX + 44} y={CKY - 70} s={1.0} rot={20} />
              <path d={`M ${CKX - 70} ${CKY - 110} q 10 -10 20 0 t 20 0 M ${CKX + 30} ${CKY - 116} q 10 -10 20 0 t 20 0`} stroke={KRP.blueDeep} strokeWidth={4} fill="none" />
            </g>
          )}
        </g>
        {/* 毛布 */}
        <path d="M 700 646 Q 800 636 900 640 Q 980 620 1050 590 Q 1100 578 1120 576 Q 1160 520 1220 470 Q 1360 440 1540 466 L 1546 780 L 696 780 Q 686 700 700 646 Z" fill={C.blanketBlue} stroke={INK} strokeWidth={6} />
        <path d="M 698 640 Q 800 630 902 634 L 904 668 Q 800 664 700 674 Z" fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {[1180, 1320, 1440].map((qx) => <path key={qx} d={`M ${qx} 480 Q ${qx + 12} 620 ${qx} 776`} stroke={C.blanketBlueDark} strokeWidth={5} fill="none" />)}
        {/* 毛布からにゅっと出る手 */}
        {reach > 0.02 && (
          <g>
            <path d={`M 1150 610 L ${hx} ${hy}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
            <path d={`M 1150 610 L ${hx} ${hy}`} stroke={C.tshirt} strokeWidth={21} strokeLinecap="round" />
            <circle cx={hx} cy={hy} r={16} fill={KRP.white} stroke={INK} strokeWidth={5} />
            <path d="M 1130 600 Q 1150 586 1176 600" stroke={INK} strokeWidth={5} fill={C.blanketBlue} />
          </g>
        )}
        {pressNow && <path d={`M ${CKX - 40} ${btnY - 20} l -12 -12 M ${CKX} ${btnY - 26} l 0 -16 M ${CKX + 40} ${btnY - 20} l 12 -12`} stroke={INK} strokeWidth={5} strokeLinecap="round" />}
        {/* いびき */}
        <MzHbZzz x={880} y={460} f={f} s={1.3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #188 2005年、アメリカのMITの大学院生が、授業の課題で、ある目覚まし時計を作りました。
// 格: 山 / seed 6188
// 絵: どこ: 2005年の大学の工作室 (作業机・はんだごて・ドライバー・ばらした小さなモーター・車輪の部品・配線のコード・方眼の設計メモがピンで留めてあるコルクボード・窓の外は夜)。年代札「2005年」。演出: 実在の人物なので顔は描かない。作業机に向かう女性の後ろ姿 (**長い黒髪を後ろで結んだ髪の房・赤いカーディガン・肩の線が細い**、背中と手元だけ)。手元で、丸い時計の左右に大きな車輪を2つ取り付けている (腕は2本 pose で描く。片手で時計を押さえ、片手でドライバーを回す)。机の上の課題の紙 (字は波線、学校のマークは描かない)。最後のねじが締まった瞬間、時計 (Clocky, run=0, face="smile") がぱちっと目を開ける。机のスタンドの光。動き: f0-40 カメラが部屋の引きから手元へ寄る / f40-100 ドライバーを回す・車輪がはまる / f100 目がぱちっ / f100-140 車輪がちょっとだけ空回りする
// どこ: 2005年の大学の工作室・夜 (作業机・はんだごて・ばらしたモーター・予備の車輪・配線・方眼の設計メモのコルクボード・夜の窓・机のスタンド)
// 演出: 実在の人なので後ろ姿だけ: 長い黒髪を後ろで結んだ女性・赤いカーディガン。左手で丸い時計を押さえ、右手のドライバーで車輪のねじを締める。
//       最後のねじが締まった瞬間、Clocky がぱちっと目を開ける。そのあと車輪がちょっとだけ空回り
// 動き: f0-36 カメラが部屋の引きから手元へ寄る / f20-40 ドライバーを回す / f42 ぱちっ / f110-170 車輪がちょっと空回り
const Mz188: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 36));
  const k = lerp(1, 1.18, z), cx = lerp(960, 1040, z), cy = lerp(540, 500, z);
  const CX = 1130, CY = 470, CS = 0.8;
  const hub: Pt = [CX + 96 * CS, CY + 6 * CS];
  const twist = f < 42 ? Math.sin(f * 0.9) : 0;
  const awake = f >= 42;
  const blink = awake && f < 50;
  const spinRun = f > 110 && f < 170 ? 0.14 * Math.sin(seg(f, 110, 170) * Math.PI) : 0;
  const WX = 900, WY = 877, WS = 1.6;
  const L = (X: number, Y: number): Pt => [(X - WX) / WS, (Y - WY) / WS];
  const handR = L(hub[0] + 36, hub[1] + 6 + twist * 2);
  const handL = L(CX - 78, CY - 66);
  return (
    <Frame f={f} seed={6188} bg={C.shopWall}>
      <g transform={`translate(960 540) scale(${k}) translate(${-cx} ${-cy})`}>
        <rect x={-200} y={-200} width={2320} height={600} fill={C.shopWall} />
        {/* 夜の窓 */}
        <rect x={100} y={70} width={380} height={270} fill={C.nightWin} stroke={INK} strokeWidth={7} />
        <circle cx={400} cy={130} r={30} fill={MP.brassLight} stroke={INK} strokeWidth={4} />
        <circle cx={388} cy={124} r={26} fill={C.nightWin} />
        {[[150, 120], [220, 200], [300, 110], [180, 280], [430, 250]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3.5} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 8 + i)} />)}
        <path d="M 104 300 L 160 270 L 160 336 Z M 200 336 L 200 250 L 260 250 L 260 336 Z M 300 336 L 300 280 L 360 280 L 360 336 Z" fill="#141A38" />
        <line x1={290} y1={70} x2={290} y2={340} stroke={INK} strokeWidth={6} />
        {/* コルクボードと方眼の設計メモ */}
        <rect x={560} y={60} width={380} height={280} fill={C.cork} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={570 + rnd(51, i) * 360} cy={70 + rnd(52, i) * 260} r={2.5} fill={C.corkDark} />)}
        {[[590, 84, -4], [760, 96, 5]].map(([px, py, r], i) => (
          <g key={i} transform={`rotate(${r} ${px + 70} ${py + 90})`}>
            <rect x={px} y={py} width={150} height={190} fill={KRP.white} stroke={INK} strokeWidth={4} />
            {Array.from({ length: 9 }, (_, j) => <line key={j} x1={px + 4} y1={py + 12 + j * 20} x2={px + 146} y2={py + 12 + j * 20} stroke={KRP.blueSoft} strokeWidth={2} />)}
            {Array.from({ length: 7 }, (_, j) => <line key={`v${j}`} x1={px + 12 + j * 20} y1={py + 4} x2={px + 12 + j * 20} y2={py + 186} stroke={KRP.blueSoft} strokeWidth={2} />)}
            {i === 0 ? (
              <g stroke={KRP.grayDark} strokeWidth={4} fill="none">
                <rect x={px + 50} y={py + 60} width={50} height={44} rx={16} />
                <circle cx={px + 44} cy={py + 100} r={24} />
                <circle cx={px + 106} cy={py + 100} r={24} />
                <path d={`M ${px + 20} ${py + 150} L ${px + 130} ${py + 150}`} strokeDasharray="8 6" />
              </g>
            ) : (
              <g stroke={KRP.grayDark} strokeWidth={4} fill="none">
                <path d={`M ${px + 20} ${py + 150} Q ${px + 50} ${py + 40} ${px + 80} ${py + 120} T ${px + 130} ${py + 60}`} />
                <circle cx={px + 30} cy={py + 40} r={10} />
              </g>
            )}
            <circle cx={px + 75} cy={py + 6} r={8} fill={KRP.red} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 机 */}
        <rect x={-200} y={380} width={2320} height={250} fill={C.bench} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-200} y1={400 + i * 40} x2={2120} y2={404 + i * 40} stroke={C.benchDark} strokeWidth={3} opacity={0.5} />)}
        <line x1={-200} y1={380} x2={2120} y2={380} stroke={INK} strokeWidth={6} />
        <rect x={-200} y={624} width={2320} height={60} fill={C.benchDark} stroke={INK} strokeWidth={6} />
        <rect x={-200} y={684} width={2320} height={500} fill="#3E464C" />
        {/* スタンドの光 */}
        <path d={`M 1290 190 L 1360 190 L ${CX + 260} 560 L ${CX - 200} 560 Z`} fill={MP.glow} opacity={0.22} />
        <ellipse cx={CX + 20} cy={545} rx={260} ry={46} fill={MP.glow} opacity={0.35} />
        <line x1={1470} y1={470} x2={1430} y2={260} stroke={INK} strokeWidth={14} />
        <line x1={1470} y1={470} x2={1430} y2={260} stroke={C.lamp} strokeWidth={7} />
        <line x1={1430} y1={260} x2={1340} y2={170} stroke={INK} strokeWidth={14} />
        <line x1={1430} y1={260} x2={1340} y2={170} stroke={C.lamp} strokeWidth={7} />
        <ellipse cx={1470} cy={476} rx={60} ry={16} fill={C.lamp} stroke={INK} strokeWidth={5} />
        <path d="M 1270 196 L 1300 140 L 1380 150 L 1390 210 Z" fill={C.lamp} stroke={INK} strokeWidth={5} />
        <ellipse cx={1330} cy={203} rx={60} ry={12} fill={MP.glow} stroke={INK} strokeWidth={4} />
        {/* 机の上の道具: はんだごて・モーター・予備の車輪・配線・課題の紙 */}
        <g transform="rotate(-6 640 470)">
          <rect x={520} y={480} width={250} height={150} fill={KRP.white} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={mzHbWavy(540, 510 + i * 22, 200 - (i % 2) * 40, 2.5, 12)} stroke={KRP.grayDark} strokeWidth={3} fill="none" />)}
        </g>
        <path d="M 400 520 L 470 450" stroke={INK} strokeWidth={8} />
        <rect x={380} y={510} width={60} height={20} rx={6} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <g transform="rotate(-40 520 420)">
          <rect x={450} y={410} width={110} height={24} rx={10} fill={KRP.blueDeep} stroke={INK} strokeWidth={4} />
          <rect x={560} y={416} width={60} height={12} fill={KRP.silver} stroke={INK} strokeWidth={3} />
        </g>
        <path d={`M 590 380 q 6 -${10 + Math.sin(f / 7) * 4} 0 -24`} stroke={KRP.gray} strokeWidth={3} fill="none" opacity={0.6} />
        <rect x={820} y={430} width={70} height={46} rx={8} fill={KRP.silver} stroke={INK} strokeWidth={5} />
        <rect x={890} y={446} width={18} height={14} fill={MP.brass} stroke={INK} strokeWidth={3} />
        <path d="M 836 440 q 10 10 0 20 q 10 10 0 20 M 856 440 q 10 10 0 20" stroke={KRP.copper} strokeWidth={3} fill="none" />
        <path d="M 780 560 C 860 600 900 520 980 590 S 1100 610 1160 600" stroke={KRP.red} strokeWidth={6} fill="none" />
        <path d="M 790 575 C 860 620 920 540 990 606" stroke={KRP.blueDeep} strokeWidth={6} fill="none" />
        {[[1520, 540], [1610, 520]].map(([wx, wy], i) => (
          <g key={i}>
            <circle cx={wx} cy={wy} r={44} fill="#3C3A3E" stroke={INK} strokeWidth={5} />
            <circle cx={wx} cy={wy} r={28} fill="#F0A63A" stroke={INK} strokeWidth={4} />
            <circle cx={wx} cy={wy} r={8} fill={MP.iron} />
          </g>
        ))}
        {[[1440, 560], [1462, 572], [1430, 580]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5} fill={KRP.silver} stroke={INK} strokeWidth={2} />)}
        {/* 主役: 組み上がる時計 */}
        <Clocky x={CX} y={CY} s={CS} f={f} run={spinRun} face={awake ? "normal" : "sleep"} />
        {blink && (
          <g>
            {[-70, -40, 40, 70].map((a) => <line key={a} x1={CX} y1={CY - 100} x2={CX} y2={CY - 140} stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" transform={`rotate(${a} ${CX} ${CY - 10})`} />)}
          </g>
        )}
        {f >= 38 && f < 48 && (
          <g transform={`translate(${hub[0]} ${hub[1]}) scale(${pop(seg(f, 38, 44))})`}>
            <path d="M 0 -34 L 8 -8 L 34 0 L 8 8 L 0 34 L -8 8 L -34 0 L -8 -8 Z" fill={KRP.yellow} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {/* ドライバー (右手。f<42 で回す) */}
        <g transform={`rotate(${twist * 10} ${hub[0] + 36} ${hub[1] + 6})`}>
          <line x1={hub[0]} y1={hub[1]} x2={hub[0] + 36} y2={hub[1] + 6} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <line x1={hub[0]} y1={hub[1]} x2={hub[0] + 36} y2={hub[1] + 6} stroke={KRP.silver} strokeWidth={5} strokeLinecap="round" />
          <rect x={hub[0] + 36} y={hub[1] - 8} width={70} height={28} rx={12} fill={KRP.yellow} stroke={INK} strokeWidth={5} />
          {[0, 1, 2].map((i) => <line key={i} x1={hub[0] + 50 + i * 16 + twist * 5} y1={hub[1] - 6} x2={hub[0] + 50 + i * 16 + twist * 5} y2={hub[1] + 18} stroke={KRP.orange} strokeWidth={4} />)}
        </g>
        {/* 作業する女性の後ろ姿 (実在の人なので顔は描かない) */}
        <MzHbFig x={WX} y={WY} s={WS} f={f} cloth={C.cardigan} clothDark={C.cardiganDark} hair="backTail" hairColor="#1E1A1C"
          arms={{ l: [[-67, -148], [-20, -250], handL], r: [[67, -148], [150, -150], handR], lBehind: true }}
          front={<g>
            {[-100, -80].map((by) => <line key={by} x1={-56} y1={by} x2={56} y2={by} stroke={C.cardiganDark} strokeWidth={4} opacity={0.6} />)}
            <path d="M 0 -160 L 0 -52" stroke={C.cardiganDark} strokeWidth={4} opacity={0.5} />
          </g>} />
        {/* 椅子の背もたれ */}
        <path d="M 730 770 Q 900 744 1070 770 L 1060 1100 L 740 1100 Z" fill={MP.wood} stroke={INK} strokeWidth={6} />
        <path d="M 770 800 Q 900 782 1030 800" stroke={MP.woodDark} strokeWidth={6} fill="none" />
        {[840, 960].map((sx) => <circle key={sx} cx={sx} cy={850} r={8} fill={MP.woodDark} stroke={INK} strokeWidth={3} />)}
      </g>
      <TagPlate x={330} y={200} text="2005年" size={44} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #189 名前は、クロッキー。
// 格: 並 / seed 6189
// 絵: どこ: #188 と同じ工作室の作業机 (続き)。演出: Clocky (run=0, face="smile", s 大きめ。画面の短辺の1/2以上) が机の上で車輪をきゅっきゅっと左右に動かして、得意げに自己紹介するように胸 (文字盤) を張る。その首から、手書きの名札「クロッキー」がひもでぶら下がる (この名札の字はよい)。後ろでは作業者の女性の後ろ姿の手元 (赤いカーディガンの袖) が、名札のひもを結び終えて離れていく (腕は2本 pose で描く)。スタンドの光がスポットライトのように Clocky を照らす。動き: f0-30 カメラが Clocky に寄る / f30-60 名札がぶら下がる・ひもが揺れる / f60-120 車輪で左右に小さく揺れておじぎ / 文字盤の秒針が動く
// どこ: #188 と同じ工作室の作業机 (続き・夜・スタンドの光)。机の上に Clocky が大きく
// 演出: 作業者の手元 (赤いカーディガンの袖の両手) が、Clocky の首に手書きの名札「クロッキー」のひもを結び終えて画面の外へ離れていく。
//       Clocky は車輪をきゅっきゅっと左右に動かして胸 (画面) を張り、ぺこりとおじぎ。スタンドの光がスポットライトのように照らす
// 動き: f0-30 カメラが寄る / f8-22 名札がぶら下がる・ひもが揺れる / f16-40 手が離れていく / f44-62 左右に揺れておじぎ
const Mz189: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 30));
  const k = lerp(1, 1.12, z);
  const CX = 960, CY = 500, CS = 1.7;
  const wig = f < 44 ? Math.sin(f / 3) * 8 * seg(f, 26, 34) : 0;
  const bow = Math.sin(seg(f, 44, 62) * Math.PI) * 12;
  const proud = 1 + 0.03 * easeOut(seg(f, 26, 36));
  const tagT = seg(f, 8, 18);
  const tagSw = Math.sin(f / 7) * 6 * (1 - seg(f, 20, 62) * 0.6);
  const away = easeInOut(seg(f, 16, 40));
  const knot: Pt = [CX, CY - 92 * CS + 6];
  const tagX = CX + tagSw * 2, tagY = 640;
  return (
    <Frame f={f} seed={6189} bg={C.shopWall}>
      <g transform={`translate(960 540) scale(${k}) translate(-960 -520)`}>
        <rect x={-200} y={-200} width={2320} height={560} fill={C.shopWall} />
        {/* 奥のコルクボード (ぼんやり) と夜の窓 */}
        <rect x={80} y={40} width={420} height={260} fill={C.cork} stroke={INK} strokeWidth={6} opacity={0.8} />
        {[[110, 70], [290, 80]].map(([px, py], i) => <rect key={i} x={px} y={py} width={150} height={190} fill={KRP.white} stroke={INK} strokeWidth={4} opacity={0.8} transform={`rotate(${i ? 5 : -4} ${px + 75} ${py + 95})`} />)}
        <rect x={1480} y={50} width={360} height={240} fill={C.nightWin} stroke={INK} strokeWidth={6} />
        {[[1530, 100], [1640, 180], [1780, 120]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={4} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 7 + i)} />)}
        {/* 机 */}
        <rect x={-200} y={360} width={2320} height={330} fill={C.bench} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-200} y1={380 + i * 44} x2={2120} y2={386 + i * 44} stroke={C.benchDark} strokeWidth={3} opacity={0.5} />)}
        <line x1={-200} y1={360} x2={2120} y2={360} stroke={INK} strokeWidth={6} />
        <rect x={-200} y={690} width={2320} height={500} fill={C.benchDark} stroke={INK} strokeWidth={6} />
        {/* スポットライトのようなスタンドの光 */}
        <path d={`M 1380 -40 L 1500 -40 L ${CX + 380} 690 L ${CX - 380} 690 Z`} fill={MP.glow} opacity={0.2} />
        <ellipse cx={CX} cy={668} rx={400} ry={50} fill={MP.glow} opacity={0.4} />
        {/* 机の小物 (左右) */}
        <g transform="rotate(-30 260 600)">
          <rect x={160} y={590} width={160} height={30} rx={12} fill={KRP.yellow} stroke={INK} strokeWidth={5} />
          <rect x={320} y={598} width={110} height={14} fill={KRP.silver} stroke={INK} strokeWidth={4} />
        </g>
        {[[1560, 600], [1680, 620]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={9} fill={KRP.silver} stroke={INK} strokeWidth={3} />)}
        <path d="M 1500 660 C 1580 600 1640 700 1760 640" stroke={KRP.red} strokeWidth={7} fill="none" />
        {/* 主役: Clocky (左右にきゅっきゅっ・おじぎ) */}
        <g transform={`translate(${wig} 0) rotate(${bow} ${CX + 120} ${CY + 92 * CS}) translate(${CX} ${CY}) scale(${proud}) translate(${-CX} ${-CY})`}>
          {/* 名札のひも */}
          {tagT > 0 && (
            <g opacity={tagT}>
              <path d={`M ${knot[0] - 40} ${knot[1]} Q ${CX - 130} ${CY} ${tagX - 90} ${tagY - 30}`} stroke={KRP.white} strokeWidth={5} fill="none" />
              <path d={`M ${knot[0] + 40} ${knot[1]} Q ${CX + 130} ${CY} ${tagX + 90} ${tagY - 30}`} stroke={KRP.white} strokeWidth={5} fill="none" />
              <path d={`M ${knot[0] - 40} ${knot[1]} Q ${knot[0]} ${knot[1] - 30} ${knot[0] + 40} ${knot[1]}`} stroke={KRP.white} strokeWidth={6} fill="none" />
              <circle cx={knot[0]} cy={knot[1] - 14} r={9} fill={KRP.white} stroke={INK} strokeWidth={3} />
            </g>
          )}
          <Clocky x={CX} y={CY} s={CS} f={f} run={0} face={f > 44 && f < 62 ? "smirk" : "normal"} />
          <TagPlate x={tagX} y={tagY} text="クロッキー" size={40} t={tagT} fill="#F4E3C0" rot={tagSw * 0.6} />
        </g>
        {/* 作業者の両手 (赤いカーディガンの袖)。結び終えて画面の外へ */}
        {away < 1 && (
          <g>
            <MzHbLimb pts={[[260, 1200], [540, 760], [lerp(knot[0] - 36, 380, away), lerp(knot[1] + 6, 1000, away)]]} cloth={C.cardigan} w={40} />
            <MzHbLimb pts={[[620, 1260], [820, 790], [lerp(knot[0] + 30, 640, away), lerp(knot[1] + 10, 1040, away)]]} cloth={C.cardigan} w={40} />
          </g>
        )}
        {f >= 44 && f < 62 && [0, 1].map((i) => (
          <path key={i} d={`M ${CX + 300 + i * 30} ${CY - 120 + i * 30} q 20 -10 30 6`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #190 鳴りだすと、台から飛び降りて、車輪で部屋を走り回り、隠れます。
// 格: 山 / seed 6190
// 絵: どこ: 現代のあなたの寝室ではない、どこかの一人暮らしの寝室 (ベッド・ナイトテーブル・カーテン・本棚・洗濯かご・床のラグ)。部屋の真上から見下ろす俯瞰。演出: ナイトテーブルの上の Clocky (run=0→1, face="smile") がジリリと鳴りだすと同時に、台からぴょんと飛び降り (着地の衝撃のしるし)、車輪で床を走り回る。走った跡を点線で描き、ラグの上をぐるぐる・本棚の前でターン・洗濯かごにぶつかって靴下を跳ね飛ばし、最後にカーテンの裏 (またはベッドの下) にすべり込んで隠れる。隠れたあとも、カーテンのすそから音の線だけがジリリと出続け、すそがぴくぴく動く。ベッドの人 (男性・短い黒髪) が布団から顔だけ出して目で追う (face="surprised")。動き: f0-20 鳴りだす / f20-35 飛び降りる / f35-120 走り回る (点線の跡が伸びる・カメラも少しパンして追う) / f120-150 カーテンの裏に隠れる・すそがぴくぴく
// どこ: 一人暮らしの寝室を真上から見下ろす俯瞰 (ベッド・ナイトテーブル・ラグ・本棚・洗濯かご・窓とカーテン・木の床)
// 演出: ナイトテーブルの上の Clocky がジリリと鳴りだし、ぴょんと床へ飛び降り (着地のしるし)、車輪で走り回る。走った跡は点線。
//       ラグの上をぐるぐる・本棚の前でターン・洗濯かごにぶつかって靴下が跳ぶ・最後にカーテンの裏へすべり込む。隠れたあともすそがぴくぴく、音だけジリリ。
//       ベッドの男性 (短い黒髪) は布団から顔だけ出して、目で追う
// 動き: f0-14 鳴りだす / f14-24 飛び降りる / f24-118 走り回る (点線が伸びる・カメラも少しパン) / f118- カーテンの裏・すそがぴくぴく
const MZHB190_PATH: Pt[] = [
  [800, 430], [900, 380], [1060, 390], [1160, 470], [1180, 580], [1110, 690], [990, 730], [870, 680], [830, 570], [880, 470], [1000, 430],
  [1150, 440], [1380, 470], [1600, 500], [1690, 560], [1650, 650], [1570, 700], [1460, 690], [1400, 560], [1420, 380], [1470, 250], [1500, 150],
];
const Mz190: React.FC<{ f: number }> = ({ f }) => {
  const P = MZHB190_PATH;
  const cum: number[] = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const total = cum[cum.length - 1];
  const at = (d: number): { p: Pt; dx: number; i: number } => {
    let i = 1;
    while (i < P.length - 1 && cum[i] < d) i++;
    const t = clamp01((d - cum[i - 1]) / Math.max(1, cum[i] - cum[i - 1]));
    return { p: [lerp(P[i - 1][0], P[i][0], t), lerp(P[i - 1][1], P[i][1], t)], dx: P[i][0] - P[i - 1][0], i };
  };
  const runT = seg(f, 24, 118);
  const dist = total * runT;
  const jumpT = seg(f, 14, 24);
  const ST: Pt = [710, 225];
  let pos: Pt, dir: 1 | -1 = 1, sc = 0.55;
  if (f < 14) pos = ST;
  else if (f < 24) { pos = [lerp(ST[0], P[0][0], jumpT), lerp(ST[1], P[0][1], jumpT)]; sc = 0.55 * (1 + 0.4 * Math.sin(jumpT * Math.PI)); }
  else { const a = at(dist); pos = a.p; dir = a.dx >= 0 ? 1 : -1; }
  const hidden = f >= 118;
  const ringOnly = f < 14;
  const bumpD = cum[16];
  const bumpF = 24 + (bumpD / total) * 94;
  const sockT = seg(f, bumpF, bumpF + 22);
  const pan = hidden ? -(1500 - 960) * 0.06 : -(pos[0] - 960) * 0.06;
  // 点線の跡
  const trail: Pt[] = [];
  if (f >= 24) {
    trail.push(ST, P[0]);
    for (let i = 1; i < P.length && cum[i] < dist; i++) trail.push(P[i]);
    trail.push(pos);
  }
  const head: Pt = [360, 262];
  const gv = [pos[0] - head[0], pos[1] - head[1]];
  const gl = Math.max(1, Math.hypot(gv[0], gv[1]));
  const twitch = hidden ? Math.sin(f * 1.3) * 10 : 0;
  return (
    <Frame f={f} seed={6190} bg={C.roomFloor}>
      <g transform={`translate(${pan} 0)`}>
        {/* 床 (板張り) と壁 */}
        <rect x={-200} y={-100} width={2320} height={1300} fill={C.roomFloor} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-200} y1={60 + i * 70} x2={2120} y2={60 + i * 70} stroke={C.roomFloorDark} strokeWidth={4} />)}
        {Array.from({ length: 40 }, (_, i) => <line key={`v${i}`} x1={-200 + ((i * 397) % 2300)} y1={60 + (i % 15) * 70} x2={-200 + ((i * 397) % 2300)} y2={130 + (i % 15) * 70} stroke={C.roomFloorDark} strokeWidth={3} />)}
        <rect x={-200} y={-100} width={2320} height={160} fill={C.dormWall} stroke={INK} strokeWidth={6} />
        <rect x={-200} y={-100} width={260} height={1300} fill={C.dormWall} stroke={INK} strokeWidth={6} />
        {/* 窓 (上の壁) */}
        <rect x={1240} y={10} width={560} height={40} fill={MP.morning} stroke={INK} strokeWidth={5} />
        {/* ラグ */}
        <ellipse cx={1000} cy={560} rx={260} ry={215} fill={C.rug} stroke={INK} strokeWidth={6} />
        <ellipse cx={1000} cy={560} rx={200} ry={160} fill="none" stroke={C.rugLight} strokeWidth={14} />
        <ellipse cx={1000} cy={560} rx={110} ry={86} fill={C.rugLight} stroke={INK} strokeWidth={4} />
        {/* 本棚 (右の壁ぎわ・上から見た本の背の頭) */}
        <rect x={1770} y={290} width={140} height={480} fill={C.shelf} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 13 }, (_, i) => <rect key={i} x={1784} y={300 + i * 36} width={100 - (i % 3) * 14} height={30} fill={[KRP.blueDeep, KRP.red, KRP.green, KRP.yellow, KRP.orange][i % 5]} stroke={INK} strokeWidth={3} />)}
        {/* 洗濯かご */}
        <circle cx={1560} cy={770} r={78} fill={C.basket} stroke={INK} strokeWidth={6} />
        <circle cx={1560} cy={770} r={58} fill="#B89A5E" stroke={INK} strokeWidth={4} />
        <path d="M 1520 750 Q 1560 730 1600 760 Q 1570 800 1530 790 Z" fill={KRP.blueSoft} stroke={INK} strokeWidth={3} />
        {/* 跳ね飛ぶ靴下 */}
        {sockT > 0 && [0, 1].map((i) => {
          const sx = 1560 + (i ? 1 : -1) * (40 + sockT * 160), sy = 760 - Math.sin(sockT * Math.PI) * 140 - sockT * 60;
          return <path key={i} transform={`translate(${sx} ${sy}) rotate(${sockT * 400 * (i ? 1 : -1)})`} d="M -10 -30 L 10 -30 L 10 8 Q 10 20 24 22 L 26 34 L -4 34 Q -10 30 -10 18 Z" fill={C.sock} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
        })}
        {sockT <= 0 && [0, 1].map((i) => <path key={i} transform={`translate(${1530 + i * 50} 770) rotate(${i ? 30 : -20})`} d="M -10 -30 L 10 -30 L 10 8 Q 10 20 24 22 L 26 34 L -4 34 Q -10 30 -10 18 Z" fill={C.sock} stroke={INK} strokeWidth={4} />)}
        {/* ベッド (上から) と、顔だけ出した男性 */}
        <rect x={110} y={110} width={500} height={740} rx={16} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={130} y={130} width={460} height={700} rx={12} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <rect x={210} y={150} width={300} height={130} rx={40} fill={KRP.white} stroke={INK} strokeWidth={5} />
        <MzHbFig x={360} y={head[1] + 228 * 0.85} s={0.85} f={f} face="surprised" cloth={C.pajamaGray} clothDark={C.pajamaGrayDark}
          gaze={[(gv[0] / gl) * 8, (gv[1] / gl) * 8]} />
        <path d="M 124 330 Q 360 306 596 330 L 596 840 L 124 840 Z" fill={C.quilt} stroke={INK} strokeWidth={6} />
        <path d="M 124 330 Q 360 306 596 330 L 596 380 Q 360 358 124 380 Z" fill={KRP.white} stroke={INK} strokeWidth={5} />
        {[250, 400].map((qx) => <line key={qx} x1={qx} y1={390} x2={qx + 10} y2={830} stroke={C.quiltDark} strokeWidth={5} />)}
        {[0, 1].map((i) => <path key={i} d={`M ${300 + i * 120} 320 q -20 -20 0 -40`} stroke={INK} strokeWidth={5} fill="none" opacity={f > 20 ? 0.8 : 0} strokeLinecap="round" />)}
        {/* ナイトテーブル */}
        <rect x={630} y={140} width={170} height={170} rx={8} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
        <circle cx={770} cy={170} r={22} fill={MP.glow} stroke={INK} strokeWidth={4} />
        {/* 点線の跡 */}
        {trail.length > 1 && <path d={"M " + trail.map((p) => `${p[0]} ${p[1]}`).join(" L ")} stroke={INK} strokeWidth={6} fill="none" strokeDasharray="4 18" strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />}
        {/* 着地のしるし */}
        {f >= 24 && f < 34 && (
          <g transform={`translate(${P[0][0]} ${P[0][1] + 30}) scale(${0.6 + seg(f, 24, 34) * 0.8})`} opacity={1 - seg(f, 24, 34)}>
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={-50} x2={0} y2={-80} stroke={INK} strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 45})`} />)}
          </g>
        )}
        {/* 主役: Clocky */}
        {!hidden && (
          <g>
            <ellipse cx={pos[0]} cy={pos[1] + 50} rx={90 * (sc / 0.55)} ry={18} fill={INK} opacity={0.2} />
            <Clocky x={pos[0]} y={pos[1] - (f >= 14 && f < 24 ? Math.sin(jumpT * Math.PI) * 30 : 0)} s={sc} f={f} run={f >= 24 ? 1 : 0} dir={dir} face="normal" />
            {ringOnly && <MzHbRing x={pos[0]} y={pos[1] - 20} r={70} f={f} />}
          </g>
        )}
        {/* カーテン (上の壁ぎわ・上から見たひだ)。隠れたあとはすそがぴくぴく */}
        <path d={`M 1230 50 L 1810 50 L 1810 120 ${Array.from({ length: 12 }, (_, i) => {
          const x = 1810 - (i + 1) * 48.3;
          const bulge = hidden && Math.abs(x - 1500) < 80 ? 26 + twitch : 0;
          return `Q ${x + 24} ${150 + bulge} ${x} ${120 + bulge * 0.6}`;
        }).join(" ")} Z`} fill={C.curtain} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={1262 + i * 48} y1={56} x2={1262 + i * 48} y2={118} stroke={C.curtainDark} strokeWidth={4} />)}
        {hidden && <MzHbRing x={1500} y={190} r={60} f={f} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #191 止めたければ、起きて、探すしかありません。
// 格: 山 / seed 6191
// 絵: どこ: #190 と同じ寝室を、今度は床すれすれの低い位置から見る (ベッドの下の暗がり・ラグの毛・ベッドの脚)。演出: ベッドから男性 (短い黒髪・灰色の寝間着) がずり落ちて、四つんばいでベッドの下をのぞき込み (腕は2本 pose で描く)、懐中電灯で照らす。そこにはいない。振り返ると、カーテンの裏から Clocky (run=0, face="smile") がのぞいていて、目が合った瞬間にまた走って逃げる (run=1)。男性はぼさぼさの頭で立ち上がり、完全に目が覚めた顔 (目がぱっちり、face="surprised")。窓の外の朝日が差し込む。動き: f0-40 ずり落ちてベッドの下をのぞく / f40-70 振り返る・目が合う / f70-110 Clocky がまた逃げる・男性が追いかけて立ち上がる / f110-150 目がぱっちり・朝日
// どこ: #190 と同じ寝室を床すれすれの低い位置から (左にベッドの下の暗がり・ベッドの脚・ラグ、右に窓とカーテン・朝日)
// 演出: ベッドからずり落ちた男性 (短い黒髪・灰色の寝間着) が四つんばいで懐中電灯を照らし、ベッドの下をのぞく。いるのはほこりと片方の靴下だけ。
//       くるっと振り返ると、懐中電灯の光の先、カーテンの裏から Clocky がにやりとのぞいている。目が合った瞬間また走って逃げる。
//       男性はぼさぼさ頭で立ち上がり、目がぱっちり。朝日が差しこむ
// 動き: f0-28 ベッドの下をのぞく / f30 振り返る / f30-46 目が合う / f46-70 Clocky が逃げる / f58- 立ち上がって追う・目がぱっちり・朝日
const Mz191: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.06, easeInOut(seg(f, 0, 105)));
  const turned = f >= 30;
  const standing = f >= 60;
  const HX = 980, HY = 700; // 腰
  const R = (deg: number) => (deg * Math.PI) / 180;
  const toLocal = (X: number, Y: number): Pt => {
    const dx = X - HX, dy = Y - HY, a = R(70);
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a) - 58];
  };
  const ckX = f < 46 ? 1470 : lerp(1470, 2150, easeInOut(seg(f, 46, 72)));
  const ckRun = f < 46 ? 0 : 1;
  const sun = 0.25 + 0.3 * seg(f, 60, 100);
  const rise = seg(f, 56, 62);
  const manX = standing ? lerp(1030, 1300, easeInOut(seg(f, 70, 105))) : 1240;
  const beamTo: Pt[] = turned ? [[1500, 600], [1500, 790]] : [[300, 640], [300, 770]];
  const lampP: Pt = turned ? [1250, 700] : [710, 700];
  return (
    <Frame f={f} seed={6191} bg={C.dormWall}>
      <g transform={`translate(960 540) scale(${k}) translate(-960 -540)`}>
        <rect x={-200} y={-200} width={2320} height={960} fill={C.dormWall} />
        {/* 窓・朝の町と朝日 */}
        <rect x={1560} y={60} width={340} height={480} fill={MP.morning} stroke={INK} strokeWidth={7} />
        <circle cx={1820} cy={140} r={46} fill={KRP.yellow} stroke={INK} strokeWidth={4} />
        <path d="M 1564 420 L 1600 420 L 1600 340 L 1660 340 L 1660 400 L 1720 400 L 1720 300 L 1790 300 L 1790 380 L 1896 380 L 1896 536 L 1564 536 Z" fill={C.town} stroke={INK} strokeWidth={4} />
        <line x1={1730} y1={60} x2={1730} y2={540} stroke={INK} strokeWidth={6} />
        {/* 床 (低い視点) とラグの毛 */}
        <rect x={-200} y={760} width={2320} height={440} fill={C.roomFloor} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-200} y1={790 + i * i * 14} x2={2120} y2={790 + i * i * 14} stroke={C.roomFloorDark} strokeWidth={4} />)}
        <line x1={-200} y1={760} x2={2120} y2={760} stroke={INK} strokeWidth={5} />
        <path d="M 820 770 L 1500 770 L 1700 1100 L 640 1100 Z" fill={C.rug} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={830 + i * 17} y1={768} x2={826 + i * 17} y2={758 - (i % 3) * 4} stroke={C.rug} strokeWidth={4} />)}
        {/* 朝日の光 */}
        <path d="M 1560 100 L 1560 540 L 900 1100 L 300 1100 Z" fill={MP.glow} opacity={sun} />
        {/* ベッド (左): 下の暗がり・脚・垂れた布団 */}
        <rect x={-200} y={630} width={980} height={130} fill={C.underBed} />
        <ellipse cx={420} cy={745} rx={40} ry={16} fill={KRP.gray} opacity={0.8} />
        <path d="M 200 750 L 214 720 L 232 724 L 230 746 Q 240 752 252 752 L 252 760 L 204 760 Z" fill={C.sock} stroke={INK} strokeWidth={3} />
        <rect x={20} y={600} width={30} height={160} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={730} y={600} width={30} height={160} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={-200} y={590} width={980} height={42} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <rect x={-200} y={470} width={970} height={124} rx={10} fill={KRP.white} stroke={INK} strokeWidth={6} />
        <path d="M -200 430 Q 300 410 790 450 Q 820 560 790 660 Q 700 640 640 664 Q 560 640 480 662 L -200 660 Z" fill={C.quilt} stroke={INK} strokeWidth={6} />
        {[200, 420, 620].map((qx) => <path key={qx} d={`M ${qx} 440 Q ${qx + 10} 560 ${qx} 660`} stroke={C.quiltDark} strokeWidth={5} fill="none" />)}
        {/* 懐中電灯の光 */}
        {!standing && <path d={`M ${lampP[0]} ${lampP[1]} L ${beamTo[0][0]} ${beamTo[0][1]} L ${beamTo[1][0]} ${beamTo[1][1]} Z`} fill={MP.glow} opacity={0.45} />}
        {/* Clocky (カーテンの裏からのぞく → 逃げる) */}
        <Clocky x={ckX} y={700} s={0.6} f={f} run={ckRun} dir={f < 46 ? -1 : 1} face={f < 46 ? "smirk" : "normal"} />
        {/* カーテン (左のパネルが Clocky を半分かくす) */}
        <path d={`M 1530 40 L 1660 40 Q 1650 400 ${1660 + (f >= 46 && f < 60 ? Math.sin(f) * 14 : 0)} 760 L 1520 760 Q 1540 400 1530 40 Z`} fill={C.curtain} stroke={INK} strokeWidth={6} />
        {[1560, 1600, 1630].map((cx2) => <path key={cx2} d={`M ${cx2} 50 Q ${cx2 - 6} 400 ${cx2} 750`} stroke={C.curtainDark} strokeWidth={5} fill="none" />)}
        <path d="M 1840 40 L 1930 40 L 1930 760 L 1830 760 Q 1850 400 1840 40 Z" fill={C.curtain} stroke={INK} strokeWidth={6} />
        <rect x={1500} y={28} width={440} height={16} rx={8} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
        {/* 男性 */}
        {!standing ? (
          <g transform={turned ? `translate(${2 * HX} 0) scale(-1 1)` : undefined}>
            <g transform={`rotate(-70 ${HX} ${HY})`}>
              <MzHbFig x={HX} y={HY + 58} s={1} f={f} face={turned ? "surprised" : "worried"} cloth={C.pajamaGray} clothDark={C.pajamaGrayDark} hair="messy"
                gaze={turned ? [-6, 0] : [0, 6]}
                arms={{ l: [[-67, -148], toLocal(870, 740), toLocal(830, 754)], r: [[67, -148], toLocal(850, 690), toLocal(790, 704)] }} />
            </g>
            {/* 懐中電灯 */}
            <rect x={720} y={692} width={80} height={24} rx={8} fill={KRP.red} stroke={INK} strokeWidth={4} transform="rotate(4 790 704)" />
            <rect x={708} y={688} width={22} height={32} rx={4} fill={KRP.silver} stroke={INK} strokeWidth={4} />
          </g>
        ) : (
          <g>
            {rise < 1 && <circle cx={1030} cy={740} r={40 + rise * 60} fill="none" stroke={KRP.grayDark} strokeWidth={6} opacity={1 - rise} />}
            <MzHbFig x={manX} y={790} s={1.1} f={f} face="surprised" pose={f > 70 ? "run" : "banzai"} cloth={C.pajamaGray} clothDark={C.pajamaGrayDark} hair="messy" gaze={[7, -2]} />
            {[-1, 1].map((sd) => <line key={sd} x1={manX + sd * 40} y1={790 - 330} x2={manX + sd * 56} y2={790 - 370} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
          </g>
        )}
        {turned && f < 36 && [0, 1, 2].map((i) => <path key={i} d={`M ${870 + i * 40} ${560 - i * 10} q 40 -30 80 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        {turned && f < 50 && (
          <g opacity={seg(f, 32, 38)}>
            <line x1={1180} y1={640} x2={1420} y2={680} stroke={KRP.red} strokeWidth={5} strokeDasharray="10 10" />
            <text x={1300} y={610} fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.yellow} stroke={INK} strokeWidth={5} paintOrder="stroke">!</text>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #192 止められない目覚まし、ふたたびです。
// 格: 山 / seed 6192
// 絵: どこ: #191 と同じ寝室の続き。窓の外はイギリスの夜明け前の石畳ではなく現代の朝の町。演出: 床を走って逃げる Clocky (run=1, face="smile") の横に、半透明の青白い光で KnockerUp (pose="walk", face="smile") の幻がすーっと並んで現れ、黒い山高帽を少し持ち上げて「にやり」と笑い、Clocky と同じ速さで並走する (幻の長い棒の先が Clocky の頭をちょんと叩いて「後輩よ」と言うように)。Clocky も幻のほうを見て、にやりと同じ顔をする。追いかける男性は、幻に気づかずに Clocky だけを追う。幻の足もとに、5章の石畳が一瞬だけ透けて見える。動き: f0-30 Clocky が走る / f30-60 幻がすーっと現れる / f60-100 並走・帽子を持ち上げてにやり・棒でちょん / f100-140 幻がふっと消えて、Clocky だけが残る
// どこ: #191 と同じ寝室の床すれすれの続き (窓の外は現代の朝の町)。カメラは走る Clocky を横に追う
// 演出: 床を走って逃げる Clocky の横に、青白く透けた KnockerUp の幻がすーっと現れて並走。にやりと笑い、長い棒の先で Clocky の頭をちょん (「後輩よ」)。
//       Clocky も幻を見て、にやりと同じ顔。追いかける男性は幻に気づかず Clocky だけを追う。幻の足もとに一瞬だけ5章の石畳が透ける
// 動き: f0-20 Clocky が走る / f18-32 幻が現れる / f32-64 並走・棒でちょん・にやり / f68-84 幻がふっと消える
const Mz192: React.FC<{ f: number }> = ({ f }) => {
  const ckX = lerp(560, 1500, f / 87);
  const ckY = 706;
  const cam = -(ckX - 900) * 0.75;
  const gA = seg(f, 18, 32) * (1 - seg(f, 68, 84));
  const knock = f >= 32 && f < 64;
  const gX = ckX - 150;
  const stone = seg(f, 28, 36) * (1 - seg(f, 54, 64));
  const manX = ckX - 560;
  return (
    <Frame f={f} seed={6192} bg={C.dormWall}>
      <g transform={`translate(${cam} 0)`}>
        <rect x={-600} y={-200} width={3400} height={960} fill={C.dormWall} />
        {/* ベッドの端 (左) */}
        <rect x={-600} y={630} width={980} height={130} fill={C.underBed} />
        <rect x={330} y={600} width={30} height={160} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
        <rect x={-600} y={590} width={980} height={42} fill={MP.wood} stroke={INK} strokeWidth={6} />
        <path d="M -600 430 Q 0 410 390 450 Q 420 560 390 660 L -600 660 Z" fill={C.quilt} stroke={INK} strokeWidth={6} />
        {/* 窓・現代の朝の町 */}
        <rect x={1160} y={60} width={700} height={480} fill={MP.morning} stroke={INK} strokeWidth={7} />
        <circle cx={1760} cy={140} r={46} fill={KRP.yellow} stroke={INK} strokeWidth={4} />
        {[[1170, 300, 120], [1300, 220, 90], [1400, 330, 140], [1550, 260, 110], [1670, 340, 180]].map(([bx, by, bw], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={540 - by} fill={i % 2 ? C.town : C.townDark} stroke={INK} strokeWidth={4} />
            {Array.from({ length: Math.floor((540 - by) / 50) }, (_, r) => Array.from({ length: Math.floor(bw / 40) }, (_, c) => (
              <rect key={`${r}${c}`} x={bx + 10 + c * 40} y={by + 14 + r * 50} width={22} height={26} fill={KRP.white} opacity={0.7} />
            )))}
          </g>
        ))}
        <line x1={1510} y1={60} x2={1510} y2={540} stroke={INK} strokeWidth={6} />
        <path d="M 1130 40 L 1230 40 Q 1220 400 1230 760 L 1120 760 Q 1140 400 1130 40 Z" fill={C.curtain} stroke={INK} strokeWidth={6} />
        <path d="M 1800 40 L 1900 40 L 1900 760 L 1790 760 Q 1810 400 1800 40 Z" fill={C.curtain} stroke={INK} strokeWidth={6} />
        <rect x={1100} y={28} width={820} height={16} rx={8} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
        {/* 床 */}
        <rect x={-600} y={760} width={3400} height={440} fill={C.roomFloor} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-600} y1={790 + i * i * 14} x2={2800} y2={790 + i * i * 14} stroke={C.roomFloorDark} strokeWidth={4} />)}
        <line x1={-600} y1={760} x2={2800} y2={760} stroke={INK} strokeWidth={5} />
        <path d="M 820 770 L 1500 770 L 1700 1100 L 640 1100 Z" fill={C.rug} stroke={INK} strokeWidth={5} />
        <path d="M 1100 100 L 1100 540 L 700 1100 L 200 1100 Z" fill={MP.glow} opacity={0.3} />
        {/* 幻の足もとに透ける石畳 */}
        {stone > 0 && (
          <g opacity={stone * 0.75}>
            <ellipse cx={gX} cy={790} rx={300} ry={60} fill="#857B73" />
            {Array.from({ length: 3 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
              <rect key={`${r}${c}`} x={gX - 270 + c * 68 + (r % 2) * 30} y={760 + r * 22} width={58} height={18} rx={8} fill="#A0948A" stroke={INK} strokeWidth={2.5} />
            )))}
          </g>
        )}
        {/* 幻のノッカー・アップ (青白く透ける) */}
        {gA > 0 && (
          <g opacity={gA * 0.7}>
            <ellipse cx={gX} cy={600} rx={190} ry={260} fill="#CFE8FF" opacity={0.6} />
            <KnockerUp x={gX} y={770} s={0.85} f={f} pose={knock ? "knock" : "walk"} face="smile" tip={knock ? [ckX - 10, ckY - 92 * 0.55 - 4] : undefined} />
            <ellipse cx={gX} cy={600} rx={170} ry={240} fill="#9FD0FF" opacity={0.25} />
            {knock && (
              <g transform={`translate(${gX - 60} ${770 - 300}) scale(${0.6 + 0.4 * Math.abs(Math.sin(f / 4))})`}>
                <path d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill={KRP.white} stroke={INK} strokeWidth={3} />
              </g>
            )}
          </g>
        )}
        {/* 主役: 逃げる Clocky */}
        <Clocky x={ckX} y={ckY} s={0.55} f={f} run={1} dir={1} face={f >= 34 && f < 70 ? "smirk" : "normal"} />
        {f >= 36 && f < 62 && Math.floor(f / 6) % 2 === 0 && (
          <path d={`M ${ckX - 20} ${ckY - 90} l -10 -16 M ${ckX + 4} ${ckY - 96} l 0 -18 M ${ckX + 26} ${ckY - 90} l 10 -16`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        )}
        {/* 追いかける男性 (幻には気づかない) */}
        <MzHbFig x={manX} y={800} s={1.05} f={f} face="surprised" pose="run" cloth={C.pajamaGray} clothDark={C.pajamaGrayDark} hair="messy" gaze={[8, 4]} />
        {[0, 1, 2].map((i) => <line key={i} x1={manX - 120 - i * 10} y1={560 + i * 50} x2={manX - 200 - i * 10} y2={560 + i * 50} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.6} />)}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_181: (f) => <Mz181 f={f} />,
  mz_182: (f) => <Mz182 f={f} />,
  mz_183: (f) => <Mz183 f={f} />,
  mz_184: (f) => <Mz184 f={f} />,
  mz_185: (f) => <Mz185 f={f} />,
  mz_186: (f) => <Mz186 f={f} />,
  mz_187: (f) => <Mz187 f={f} />,
  mz_188: (f) => <Mz188 f={f} />,
  mz_189: (f) => <Mz189 f={f} />,
  mz_190: (f) => <Mz190 f={f} />,
  mz_191: (f) => <Mz191 f={f} />,
  mz_192: (f) => <Mz192 f={f} />,
};

export const MZ_HB_MOTIFS: string[] = [
  "mz_181", // #181
  "mz_182", // #182
  "mz_183", // #183
  "mz_184", // #184
  "mz_185", // #185
  "mz_186", // #186
  "mz_187", // #187
  "mz_188", // #188
  "mz_189", // #189
  "mz_190", // #190
  "mz_191", // #191
  "mz_192", // #192
];

export const mezaHbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
