// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#48〜#59 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, Flame, mixColor,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 鶏
  roost: "#FBF8F0",
  roostShade: "#DED6C6",
  comb: "#D9392C",
  combDark: "#9E2A20",
  beak: "#F0B42E",
  beakDark: "#B9861C",
  // 鶏小屋
  plank: "#6B4A33",
  plankDark: "#4E3424",
  plankLight: "#83603F",
  straw: "#D9BF7E",
  strawDark: "#A88B4A",
  wire: "#A7B0BA",
  egg: "#F3E6CF",
  // 農場
  barn: "#8E3B2C",
  barnDark: "#62281E",
  grass: "#2C4436",
  grassLight: "#3D5A47",
  cow: "#F3EEE6",
  cowSpot: "#3A3433",
  cowNose: "#E7A6A0",
  // 修道院の小物
  rope: "#C9A877",
  ropeDark: "#94774B",
  blanket: "#8F8A86",
  blanketDark: "#6E6A66",
  sandal: "#9A6A3E",
  breath: "#EEF3FA",
  parch: "#EFE0BC",
  parchDark: "#D2BC8A",
  leather: "#7A3F24",
  leatherDark: "#552A17",
  inkBrown: "#7A4B26",
  gold: "#E7C45A",
  // 冬の夜の外
  snow: "#F4F6FB",
  snowShade: "#C9D1E4",
  nightSky: "#0F1430",
  hill: "#39426A",
  slate: "#454B5E",
  // 古代中国の宮殿と鶏人
  verm: "#C23B2A",
  vermDark: "#8E2A1E",
  palaceRoof: "#3E4A55",
  keijin: "#C8352B",
  keijinDark: "#8F241D",
  // わら布団の男
  tunic: "#A88760",
  tunicDark: "#7D6343",
  sweat: "#9FD0F0",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const INK = KRP.ink;
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
// カメラ: (cx,cy) を画面の真ん中に、k 倍
const cam = (cx: number, cy: number, k: number) => `translate(960 540) scale(${k}) translate(${-cx} ${-cy})`;
const useCid = (p: string) => p + React.useId().replace(/[^a-zA-Z0-9]/g, "");

// ===== 音の線 (「))」。rot で向きを変える) =====
const MzCSound: React.FC<{ x: number; y: number; r?: number; amt: number; f: number; side?: 1 | -1 | 0; color?: string; w?: number; rot?: number }> = ({
  x, y, r = 40, amt, f, side = 0, color = INK, w = 7, rot = 0,
}) => {
  if (amt <= 0.02) return null;
  const sides = side === 0 ? [-1, 1] : [side];
  const pulse = (Math.floor(f / 3) % 2) * 7;
  return (
    <g opacity={clamp01(amt * 1.4)} transform={`rotate(${rot} ${x} ${y})`}>
      {sides.map((sd) => [0, 1, 2].map((k) => {
        const rr = r + k * 26 + pulse;
        const a = (40 * Math.PI) / 180;
        const p0 = [x + sd * Math.cos(a) * rr, y - Math.sin(a) * rr];
        const p1 = [x + sd * Math.cos(a) * rr, y + Math.sin(a) * rr];
        return <path key={`${sd}${k}`} d={`M ${p0[0]} ${p0[1]} A ${rr} ${rr} 0 0 ${sd === 1 ? 1 : 0} ${p1[0]} ${p1[1]}`}
          stroke={color} strokeWidth={w - k * 1.2} fill="none" strokeLinecap="round" opacity={1 - k * 0.22} />;
      }))}
    </g>
  );
};

// ===== 石積み (修道院の壁の延長・写本室) =====
const MzCStones: React.FC<{ x: number; y: number; w: number; h: number; sh?: number; seed?: number }> = ({ x, y, w, h, sh = 66, seed = 7 }) => {
  const rows = Math.ceil(h / sh);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={MP.stoneDark} />
      {Array.from({ length: rows }, (_, r) => {
        const out: React.ReactNode[] = [];
        let cx = x - ((r * 37 + seed * 11) % 60);
        let c = 0;
        while (cx < x + w) {
          const bw = 90 + ((r * 31 + c * 17 + seed * 5) % 70);
          const v = (r * 5 + c * 3 + seed) % 7;
          const fill = v === 0 ? MP.stoneLight : v === 3 ? mixColor(MP.stone, MP.stoneDark, 0.35) : MP.stone;
          const x0 = Math.max(cx + 3, x), x1 = Math.min(cx + bw - 3, x + w);
          const y0 = y + r * sh + 3, y1 = Math.min(y + (r + 1) * sh - 3, y + h);
          if (x1 - x0 > 6 && y1 - y0 > 6) {
            out.push(<rect key={`${r}-${c}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={7} fill={fill} />);
            if (v === 5) out.push(<path key={`k${r}-${c}`} d={`M ${x0 + 12} ${y0 + 14} l 18 8 l 10 -4`} stroke={MP.stoneDark} strokeWidth={2} fill="none" opacity={0.6} />);
          }
          cx += bw;
          c++;
        }
        return <g key={r}>{out}</g>;
      })}
    </g>
  );
};

// ===== 修道士 (Person + 修道服・首の後ろに下ろした頭巾・縄の帯) =====
//   ★頭巾は頭にかぶせない (顔を黒布で丸く囲むと修道女に見える)。首の後ろの U 字のえりとして描く
//   x,y = 足元。rot = 腰 (y−58s) まわりの回転 (−82 で寝る。頭が左)
//   age: young=短い黒髪+トンスラ+太い眉 / mid=黒髪に白まじり+トンスラ+短い灰色のあごひげ / old=はげ頭 (耳の上に白髪)・白いひげ・少し太め
//   hood: 0〜1 で下ろした頭巾が跳ね上がって頭にかぶさる (ずれるギャグ用)。sleepy: まぶたが半分
//   lying: 寝ている。頭だけを正面寄りに起こして枕の上に描き直す (横倒しの顔は読めない)
const MZC_HEAD_Y = -228; // Person の頭の中心 (足元から)
const MZC_HEAD_R = 66;
type MzCAge = "young" | "mid" | "old";

// 頭の飾り (髪・トンスラ・はげ頭・ひげ)。頭の中心が (0,0)
const MzCHeadDeco: React.FC<{ age: MzCAge; front?: boolean; brows?: boolean }> = ({ age, brows = true }) => (
  <g>
    {age !== "old" && (
      <g>
        {/* トンスラ (頭のてっぺんの丸く剃ったところ) */}
        <ellipse cx={0} cy={-MZC_HEAD_R + 9} rx={23} ry={10} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
        {/* 白まじり (中年) */}
        {age === "mid" && <path d="M -50 -40 q 10 -10 18 -12 M 50 -40 q -10 -10 -18 -12" stroke="#A9A4A0" strokeWidth={4} fill="none" strokeLinecap="round" />}
        {/* 太めの眉 */}
        {brows && <path d="M -38 -34 q 14 -8 28 -2 M 38 -34 q -14 -8 -28 -2" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />}
      </g>
    )}
    {age === "old" && (
      <g>
        {/* はげ頭のつや */}
        <path d="M -30 -50 q 16 -12 34 -10" stroke={MP.stoneLight} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* 耳の上に少し残った白髪 */}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 56} -26 q ${sd * 22} -6 ${sd * 18} 14 q ${sd * 12} 8 ${sd * 2} 22 q ${sd * -6} 4 ${sd * -10} -2 Z`}
            fill={KRP.white} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        ))}
        {/* 大きな白ひげと口ひげ */}
        <path d="M -48 20 Q -54 78 0 100 Q 54 78 48 20 Q 28 38 0 36 Q -28 38 -48 20 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
        <path d="M -22 50 q 4 18 0 32 M 0 52 q 3 22 0 40 M 22 50 q -4 18 0 32" stroke={MP.stoneLight} strokeWidth={3} fill="none" />
        <path d="M -2 30 Q -22 20 -38 36 Q -18 34 -2 39 Z M 2 30 Q 22 20 38 36 Q 18 34 2 39 Z" fill={KRP.white} stroke={INK} strokeWidth={3} />
      </g>
    )}
    {age === "mid" && (
      <path d="M -50 20 Q -52 76 0 84 Q 52 76 50 20 Q 30 46 0 46 Q -30 46 -50 20 Z" fill="#A8A39C" stroke={INK} strokeWidth={3.5} />
    )}
  </g>
);

// 寝ている頭 (正面寄り・枕の上)。中心 (0,0)・半径 MZC_HEAD_R
const MzCSleepHead: React.FC<{ age: MzCAge; face: Face; asleep: boolean; sleepy: boolean; f: number; phase: number }> = ({ age, face, asleep, sleepy, f, phase }) => {
  const R = MZC_HEAD_R + 4;
  const blink = Math.sin((f + phase * 11) / 9) * 1.5;
  return (
    <g>
      <circle cx={0} cy={0} r={R} fill={KRP.white} stroke={INK} strokeWidth={5} />
      {/* 短い黒髪 (若い・中年) */}
      {age !== "old" && (
        <path d={`M ${-R + 1} -6 Q ${-R - 2} ${-R - 6} 0 ${-R - 2} Q ${R + 2} ${-R - 6} ${R - 1} -6 Q ${R - 10} -34 ${R - 26} -38 Q 0 -48 ${-R + 26} -38 Q ${-R + 10} -34 ${-R + 1} -6 Z`}
          fill={age === "mid" ? "#3E3A3C" : INK} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      )}
      {/* 目 */}
      {asleep ? (
        [-24, 24].map((ex) => (
          <path key={ex} d={`M ${ex - 14} 4 Q ${ex} 16 ${ex + 14} 4`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))
      ) : (
        [-24, 24].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={4} rx={13} ry={16} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            <circle cx={ex} cy={8 + blink} r={6} fill={INK} />
            {sleepy && <path d={`M ${ex - 14} 4 A 14 16 0 0 1 ${ex + 14} 4 Z`} fill={KRP.white} stroke={INK} strokeWidth={3.5} />}
          </g>
        ))
      )}
      {/* 口 */}
      {asleep ? (
        <ellipse cx={0} cy={36} rx={6} ry={5} fill={INK} />
      ) : face === "worried" ? (
        <path d="M -14 38 q 7 -6 14 0 q 7 6 14 0" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M -10 36 h 20" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      )}
      {face === "worried" && !asleep && age !== "old" && (
        <path d="M -38 -22 l 26 -8 M 38 -22 l -26 -8" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      )}
      <MzCHeadDeco age={age} brows={!(face === "worried" && !asleep)} />
    </g>
  );
};

const MzCMonk: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  age?: MzCAge; face?: Face; pose?: Pose; gaze?: [number, number];
  pointDir?: 1 | -1; rot?: number; lean?: number; hood?: number; cross?: boolean;
  breath?: number; strings?: boolean; shiver?: number; still?: boolean; sleepy?: boolean; cloth?: string; asleep?: boolean; lying?: boolean; hideBody?: boolean;
}> = ({
  x, y, s = 1, f, phase = 0, age = "young", face = "normal", pose = "stand", gaze = [0, 0],
  pointDir = 1, rot = 0, lean = 0, hood = 0, cross = false, breath = 0, shiver = 0, still = false, sleepy = false,
  cloth = MP.habit, asleep = false, lying = false, hideBody = false,
}) => {
  const fat = age === "old" ? 1.1 : 1;
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  const jit = shiver ? Math.sin(f * 2.3 + phase) * 4 * shiver : 0;
  const hd = clamp01(hood);
  const th = rot + lean;
  const thr = (th * Math.PI) / 180;
  // 寝ているときの頭の位置 (腰まわりの回転を計算で追う)
  const arm = (-MZC_HEAD_Y - 58) * s;
  const hx = x + jit + arm * Math.sin(thr);
  const hy = y + bob - 58 * s - arm * Math.cos(thr);
  return (
    <g>
      {/* 体 (毛布の下で横になっているときは描かない。肩が毛布から黒くはみ出すため) */}
      {!(lying && hideBody) && <g transform={`translate(${x + jit} ${y + bob}) rotate(${th} 0 ${-58 * s}) scale(${s * fat} ${s})`}>
        {/* 首の後ろに下ろした頭巾 (肩の上に布のたまりがのぞく) */}
        {!lying && (
          <path d="M -92 -136 Q -98 -186 -60 -184 Q -30 -170 0 -172 Q 30 -170 60 -184 Q 98 -186 92 -136 Z"
            fill={cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        )}
        <Person x={0} y={0} s={1} f={f} phase={phase} still cloth={cloth} clothDark={cloth}
          hair={age === "old" ? "none" : "cap"} face={face} pose={pose} gaze={gaze} pointDir={pointDir} />
        {/* 長い修道服のすそ (脚をかくす) */}
        <path d="M -60 -68 L -76 -8 Q 0 2 76 -8 L 60 -68 Z" fill={cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -30 -60 L -38 -12 M 24 -60 L 30 -12" stroke={MP.habitMid} strokeWidth={4} strokeLinecap="round" />
        {/* サンダルのつま先 */}
        <ellipse cx={-30} cy={-3} rx={18} ry={7} fill={C.sandal} stroke={INK} strokeWidth={3.5} />
        <ellipse cx={30} cy={-3} rx={18} ry={7} fill={C.sandal} stroke={INK} strokeWidth={3.5} />
        {/* 縄の帯 (結び目と垂れたひも) */}
        <rect x={-60} y={-86} width={120} height={11} rx={5} fill={C.rope} stroke={INK} strokeWidth={3.5} />
        <path d="M 22 -76 q 5 22 -2 40 M 28 -76 q 9 20 7 36" stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M 22 -76 q 5 22 -2 40 M 28 -76 q 9 20 7 36" stroke={C.ropeDark} strokeWidth={1.6} fill="none" />
        <circle cx={24} cy={-80} r={8} fill={C.rope} stroke={INK} strokeWidth={3} />
        {/* 下ろした頭巾の前のえり (首まわりの U 字の布) */}
        <path d="M -70 -160 Q -66 -116 0 -110 Q 66 -116 70 -160 Q 40 -138 0 -138 Q -40 -138 -70 -160 Z"
          fill={cloth} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -48 -136 Q 0 -120 48 -136" stroke={MP.habitMid} strokeWidth={4} fill="none" strokeLinecap="round" />
        {!lying && (
          <g transform={`translate(0 ${MZC_HEAD_Y})`}>
            {/* 眠っている目 (とじ目) */}
            {asleep && [-24, 24].map((ex) => (
              <g key={ex}>
                <ellipse cx={ex} cy={6} rx={17} ry={22} fill={KRP.white} />
                <path d={`M ${ex - 13} 8 Q ${ex} 18 ${ex + 13} 8`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
              </g>
            ))}
            {/* 半分閉じたまぶた */}
            {sleepy && [-24, 24].map((ex) => (
              <path key={ex} d={`M ${ex - 15} 8 A 15 19 0 0 1 ${ex + 15} 8 Z`} fill={KRP.white} stroke={INK} strokeWidth={4} />
            ))}
            <MzCHeadDeco age={age} brows={face !== "worried" && face !== "surprised"} />
            {/* 跳ね上がって頭にかぶさった頭巾 (ずれるギャグ) */}
            {hd > 0.02 && (
              <g>
                <path d={`M -76 ${-60 + hd * 84} Q -84 -96 0 -98 Q 84 -96 76 ${-60 + hd * 84} Q 0 ${-44 + hd * 76} -76 ${-60 + hd * 84} Z`}
                  fill={cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                <path d={`M -50 ${-56 + hd * 86} Q 0 ${-40 + hd * 94} 50 ${-56 + hd * 86}`} stroke={MP.habitMid} strokeWidth={4} fill="none" />
              </g>
            )}
          </g>
        )}
        {/* 首から下げた木の十字架 (修道院長) */}
        {cross && (
          <g>
            <path d="M -34 -146 Q 0 -112 34 -146" stroke={C.ropeDark} strokeWidth={3.5} fill="none" />
            <rect x={-6} y={-128} width={12} height={44} rx={2} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
            <rect x={-18} y={-117} width={36} height={10} rx={2} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
          </g>
        )}
        {/* 白い息 */}
        {!lying && breath > 0.02 && [0, 1, 2].map((k) => {
          const tt = ((f + phase * 13 + k * 9) % 27) / 27;
          return <circle key={k} cx={80 + tt * 70} cy={-196 - tt * 30} r={10 + tt * 16} fill={C.breath} opacity={breath * (0.75 - tt * 0.7)} />;
        })}
        {/* ぶるぶるの線 */}
        {shiver > 0.05 && (
          <g stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={shiver * 0.85}>
            <path d="M -104 -250 q -10 14 0 28 M -118 -244 q -10 12 0 24 M 104 -250 q 10 14 0 28 M 118 -244 q 10 12 0 24" />
          </g>
        )}
      </g>}
      {/* 寝ている頭: 横倒しにせず、正面寄りにして枕の上へ */}
      {lying && (
        <g transform={`translate(${hx} ${hy}) rotate(${th * 0.22}) scale(${s})`}>
          {/* 枕の上に下ろした頭巾 (首の下の布のたまり) */}
          <path d="M -84 34 Q -96 92 0 96 Q 96 92 84 34 Q 44 64 0 64 Q -44 64 -84 34 Z" fill={cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -56 70 Q 0 86 56 70" stroke={MP.habitMid} strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* 毛布へ続く肩 (修道服) */}
          {hideBody && <ellipse cx={96} cy={58} rx={86} ry={44} fill={cloth} stroke={INK} strokeWidth={5} />}
          <MzCSleepHead age={age} face={face} asleep={asleep} sleepy={sleepy} f={f} phase={phase} />
          {breath > 0.02 && [0, 1, 2].map((k) => {
            const tt = ((f + phase * 13 + k * 9) % 27) / 27;
            return <circle key={k} cx={70 + tt * 70} cy={20 - tt * 30} r={10 + tt * 16} fill={C.breath} opacity={breath * (0.75 - tt * 0.7)} />;
          })}
          {hideBody && shiver > 0.05 && (
            <g stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={shiver * 0.85}>
              <path d="M -86 -22 q -10 14 0 28 M -100 -16 q -10 12 0 24 M 86 -52 q 10 14 0 28 M 100 -46 q 10 12 0 24" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ===== ベッドで寝る/起き上がる修道士 (正面から。Shudouin のベッド bx に合わせる) =====
//   rise: 0=寝ている (頭は左の枕) → 1=上半身を起こす。rise<0.35 のあいだは頭を正面寄りで描き直す
const bedMonkPos = (bx: number, s: number) => ({ hipX: bx + 60, hipY: 744 - 50 * s });
const MzCBedMonk: React.FC<{
  bx: number; rise: number; f: number; s?: number; phase?: number; age?: MzCAge;
  face?: Face; pose?: Pose; gaze?: [number, number]; shiver?: number; breath?: number; sleepy?: boolean; strings?: boolean; hood?: number; asleep?: boolean;
}> = ({ bx, rise, f, s = 0.95, asleep, ...m }) => {
  const { hipX, hipY } = bedMonkPos(bx, s);
  const rot = lerp(-76, 0, easeOut(clamp01(rise)));
  return <MzCMonk x={hipX} y={hipY + 58 * s} s={s} f={f} rot={rot} still={rise < 0.5} asleep={asleep ?? rise < 0.3} lying={rise < 0.35} hideBody={rise < 0.02} {...m} />;
};

// ===== ベッドの毛布 (正面から)。rise で腰まで下がる / lift でめくれて浮く / cover で顔まで =====
const MzCBlanket: React.FC<{ bx: number; f: number; rise?: number; lift?: number; cover?: number; phase?: number }> = ({
  bx, f, rise = 0, lift = 0, cover = 0, phase = 0,
}) => {
  const br = rise > 0.02 ? 0 : Math.sin((f + phase * 23) / 14) * 3;
  let L = lerp(bx - 70, bx - 30, rise);
  let top = lerp(640, 704, rise) + br;
  L = lerp(L, bx - 172, cover);
  top = lerp(top, 618, cover);
  const ly = -lift * 120;
  const rot = lift * -12;
  return (
    <g transform={`translate(0 ${ly}) rotate(${rot} ${bx} 700)`}>
      <path d={`M ${L} 770 Q ${L - 8} ${top + 14} ${L + 40} ${top} Q ${bx + 60} ${top - 16} ${bx + 170} ${top + 20} L ${bx + 176} 772 Q ${bx + 40} 784 ${L} 770 Z`}
        fill={C.blanket} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${L + 20} ${top + 18} Q ${bx + 40} ${top + 4} ${bx + 160} ${top + 30}`} stroke={MP.stoneLight} strokeWidth={6} fill="none" opacity={0.6} />
      <path d={`M ${bx + 10} ${top + 26} q 10 30 0 60 M ${bx + 100} ${top + 30} q -8 26 2 54`} stroke={C.blanketDark} strokeWidth={3} fill="none" />
      {/* つぎあて (縫い目つき) */}
      <rect x={bx + 70} y={top + 40} width={46} height={34} rx={3} fill={C.blanketDark} stroke={INK} strokeWidth={3} transform={`rotate(-6 ${bx + 93} ${top + 57})`} />
      <path d={`M ${bx + 74} ${top + 44} l 38 -4`} stroke={MP.stoneLight} strokeWidth={2} strokeDasharray="5 5" />
    </g>
  );
};

// ===== 手に持つろうそく (x,y = 手もと) =====
const MzCHandCandle: React.FC<{ x: number; y: number; s?: number; f: number; lit?: number; phase?: number }> = ({ x, y, s = 1, f, lit = 1, phase = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 0 Q 0 12 30 0 L 24 8 Q 0 18 -24 8 Z" fill={MP.iron} stroke={INK} strokeWidth={3.5} />
    <path d="M 26 2 q 22 -4 20 14 q -2 10 -14 6" stroke={MP.iron} strokeWidth={5} fill="none" />
    <rect x={-11} y={-62} width={22} height={62} rx={4} fill="#F4ECD4" stroke={INK} strokeWidth={3.5} />
    <path d="M 4 -60 Q 6 -30 9 -26 Q 12 -32 11 -60 Z" fill="#FBF6E6" stroke={INK} strokeWidth={2} />
    {lit > 0.02 && <g transform={`translate(0 -64) scale(${pop(clamp01(lit))}) translate(0 64)`}><Flame x={0} y={-64} f={f} phase={phase} /></g>}
  </g>
);

// ===== 手で振る鈴 (x,y = にぎる所。下に鈴がぶら下がる) =====
const MzCHandBell: React.FC<{ x: number; y: number; s?: number; swing?: number }> = ({ x, y, s = 1, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${swing})`}>
    <rect x={-7} y={-26} width={14} height={40} rx={6} fill={MP.wood} stroke={INK} strokeWidth={3.5} />
    <circle cx={0} cy={-28} r={7} fill={MP.wood} stroke={INK} strokeWidth={3} />
    <path d="M -30 66 Q -30 18 0 12 Q 30 18 30 66 L 38 76 L -38 76 Z" fill={MP.brass} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -18 62 Q -18 30 -4 22" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cx={-swing * 0.3} cy={82} r={8} fill={MP.iron} stroke={INK} strokeWidth={3} />
  </g>
);

// ===== 寝室の左の入口 (Shudouin の左に続く石の壁とアーチの出入口。カメラを引いたときの上下も埋める) =====
//   door: 礼拝堂への木の扉 (−1=描かない / 0=閉 / 1=少し開いて光がもれる)
const MzCHallExt: React.FC<{ f: number; dark?: number; door?: number }> = ({ f, dark = 1, door = -1 }) => {
  const dk = 0.58 * clamp01(dark);
  const ox = -300;
  return (
    <g>
      {/* 上下と右の延長 */}
      <rect x={-1400} y={-700} width={4400} height={662} fill={MP.stoneDark} />
      <g stroke={INK} strokeWidth={4} opacity={0.3} fill="none">
        {[-500, -300, -120].map((yy) => <line key={yy} x1={-1400} y1={yy} x2={3000} y2={yy} />)}
      </g>
      <MzCStones x={1958} y={-40} w={1100} h={862} seed={12} />
      <MzCStones x={-1400} y={-40} w={1362} h={862} seed={9} />
      <rect x={-1400} y={820} width={1362} height={300} fill={MP.stoneDark} />
      <rect x={1958} y={820} width={1100} height={300} fill={MP.stoneDark} />
      <rect x={-1400} y={1118} width={4400} height={600} fill={MP.stoneDark} />
      <g stroke={INK} strokeWidth={3} opacity={0.45}>
        <line x1={-1400} y1={820} x2={-40} y2={820} />
        <line x1={1958} y1={820} x2={3000} y2={820} />
        {[880, 960, 1060, 1180, 1320].map((ly) => <line key={ly} x1={-1400} y1={ly} x2={3000} y2={ly} />)}
      </g>
      {/* アーチの出入口 */}
      <path d={`M ${ox - 150} 820 L ${ox - 150} 520 A 150 150 0 0 1 ${ox + 150} 520 L ${ox + 150} 820 Z`} fill="#141A30" />
      {/* 奥へのびる廊下の床と、遠くの細い窓 */}
      <polygon points={`${ox - 150},820 ${ox + 150},820 ${ox + 60},700 ${ox - 60},700`} fill="#262C45" />
      <rect x={ox - 10} y={520} width={20} height={70} rx={10} fill="#2F3A66" stroke={INK} strokeWidth={3} />
      <path d={`M ${ox - 150} 520 A 150 150 0 0 1 ${ox + 150} 520`} stroke={MP.stoneLight} strokeWidth={44} fill="none" />
      <path d={`M ${ox - 172} 520 A 172 172 0 0 1 ${ox + 172} 520 M ${ox - 128} 520 A 128 128 0 0 1 ${ox + 128} 520`} stroke={INK} strokeWidth={5} fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI - (i + 0.5) * (Math.PI / 9);
        return <line key={i} x1={ox + Math.cos(a) * 128} y1={520 - Math.sin(a) * 128} x2={ox + Math.cos(a) * 172} y2={520 - Math.sin(a) * 172} stroke={INK} strokeWidth={3} opacity={0.7} />;
      })}
      <rect x={ox - 176} y={520} width={30} height={300} fill={MP.stone} stroke={INK} strokeWidth={5} />
      <rect x={ox + 146} y={520} width={30} height={300} fill={MP.stone} stroke={INK} strokeWidth={5} />
      {/* 礼拝堂への扉 */}
      {door >= 0 && (
        <g>
          {door > 0.02 && <rect x={ox - 130} y={460} width={260} height={360} fill={MP.glow} opacity={0.55 * door} />}
          <g transform={`translate(${ox - 128} 0) scale(${1 - 0.35 * door} 1) translate(${-(ox - 128)} 0)`}>
            <path d={`M ${ox - 128} 820 L ${ox - 128} 520 A 128 128 0 0 1 ${ox + 128} 520 L ${ox + 128} 820 Z`} fill={MP.wood} stroke={INK} strokeWidth={5} />
            {[-64, 0, 64].map((px) => <line key={px} x1={ox + px} y1={400} x2={ox + px} y2={820} stroke={MP.woodDark} strokeWidth={4} />)}
            {[560, 740].map((by) => (
              <g key={by}>
                <rect x={ox - 128} y={by} width={256} height={18} fill={MP.iron} stroke={INK} strokeWidth={3} />
                {[-100, -40, 20, 80].map((nx) => <circle key={nx} cx={ox + nx + 10} cy={by + 9} r={4} fill={MP.ironLight} />)}
              </g>
            ))}
            <circle cx={ox + 90} cy={660} r={16} fill="none" stroke={MP.iron} strokeWidth={6} />
          </g>
        </g>
      )}
      {/* 暗さ (Shudouin とそろえる) */}
      {dk > 0 && (
        <g fill={MP.nightDeep} opacity={dk}>
          <rect x={-1400} y={-700} width={1360} height={2500} />
          <rect x={1960} y={-700} width={1100} height={2500} />
          <rect x={-40} y={-700} width={2000} height={660} />
          <rect x={-40} y={1120} width={2000} height={700} />
        </g>
      )}
      {/* 入口の横の壁のろうそく (いつも灯っている) */}
      <rect x={ox - 290} y={600} width={70} height={14} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
      <circle cx={ox - 255} cy={560} r={140} fill={MP.glow} opacity={0.12} />
      <MzCHandCandle x={ox - 255} y={600} f={f} phase={5} />
    </g>
  );
};

// ===== 雄鶏 (横向き。x,y = 止まり木をつかむ足もと。右向き / flip で左向き) =====
type REye = "sleep" | "open" | "back" | "fwd" | "wide";
const MzCRooster: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; comb?: number;
  eye?: REye; crow?: number; clench?: number; sweat?: number; flip?: boolean;
  peck?: number; droop?: number; jump?: number; ruffle?: number; tilt?: number; combTilt?: number;
}> = ({ x, y, s = 1, f, phase = 0, comb = 1, eye = "open", crow = 0, clench = 0, sweat = 0, flip = false, peck = 0, droop = 0, jump = 0, ruffle = 0, tilt = 0, combTilt = 0 }) => {
  const br = Math.sin((f + phase * 19) / 14) * 2.5;
  const cr = clamp01(crow);
  const bo = cr * (0.75 + 0.25 * Math.sin(f / 2.2));
  const hx = 62 + cr * 12 + peck * 118 - droop * 12;
  const hy = -205 - cr * 48 + droop * 54 + peck * 26;
  const hrot = -cr * 20 + droop * 20 + peck * 12;
  const ws = 0.6 + 0.4 * comb;
  const sd = ((f + phase * 7) % 24) / 24;
  return (
    <g transform={`translate(${x} ${y - jump}) scale(${flip ? -s : s} ${s}) rotate(${tilt} 0 -60)`}>
      {/* 尾羽 */}
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M -58 -128 Q ${-120 - k * 8} ${-252 + k * 28} ${-180 + k * 6} ${-172 + k * 34} Q -128 ${-150 + k * 16} -66 -102 Z`}
          fill={k % 2 ? C.roostShade : C.roost} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      ))}
      {/* 脚 (止まり木をつかむ) */}
      <path d="M -14 -50 L -14 -4 l -20 8 M -14 -4 l 14 10 M 18 -50 L 18 -4 l -16 10 M 18 -4 l 20 8" stroke={C.beakDark} strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M -14 -50 L -14 -4 l -20 8 M -14 -4 l 14 10 M 18 -50 L 18 -4 l -16 10 M 18 -4 l 20 8" stroke={C.beak} strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* 体 */}
      <ellipse cx={0} cy={-108} rx={94 + ruffle * 12} ry={66 + br + ruffle * 10} fill={C.roost} stroke={INK} strokeWidth={5} />
      <path d="M -60 -66 Q 0 -44 70 -80" stroke={C.roostShade} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* つばさ */}
      <path d="M -52 -122 Q 4 -156 54 -116 Q 36 -72 -24 -76 Q -62 -88 -52 -122 Z" fill={C.roostShade} stroke={INK} strokeWidth={4} />
      <path d="M -32 -96 Q 0 -88 30 -100 M -38 -110 Q 0 -104 42 -112" stroke={INK} strokeWidth={2.5} fill="none" opacity={0.5} />
      {/* 首 */}
      <path d={`M 18 -160 C ${hx - 40} ${hy + 40} ${hx - 34} ${hy + 10} ${hx - 24} ${hy - 10} L ${hx + 22} ${hy + 20} C ${hx + 30} ${hy + 60} 84 -150 80 -124 Z`}
        fill={C.roost} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${hx - 16} ${hy + 30} l 8 14 M ${hx - 4} ${hy + 40} l 8 14 M ${(hx + 40) / 2} ${(hy - 140) / 2 + 10} l 8 14`} stroke={C.roostShade} strokeWidth={4} strokeLinecap="round" />
      {/* 頭 */}
      <g transform={`rotate(${hrot} ${hx} ${hy})`}>
        <g transform={`translate(${hx - 4} ${hy - 28}) rotate(${combTilt}) scale(${comb})`}>
          <path d="M -32 8 Q -36 -16 -24 -22 Q -22 -46 -8 -32 Q -2 -58 10 -34 Q 22 -54 28 -28 Q 44 -32 36 -6 Q 32 8 20 10 Z"
            fill={C.comb} stroke={INK} strokeWidth={4 / comb} strokeLinejoin="round" />
        </g>
        <circle cx={hx} cy={hy} r={34} fill={C.roost} stroke={INK} strokeWidth={5} />
        <ellipse cx={hx + 12} cy={hy + 4} rx={16} ry={15} fill={C.comb} opacity={0.85} />
        <ellipse cx={hx + 24} cy={hy + 32 + bo * 6} rx={9 * ws} ry={15 * ws} fill={C.comb} stroke={INK} strokeWidth={3.5} />
        {bo > 0.05 ? (
          <g strokeLinejoin="round">
            <polygon points={`${hx + 30},${hy - 1} ${hx + 58},${hy - 6 - 10 * bo} ${hx + 56},${hy + 6 + 12 * bo}`} fill={C.combDark} />
            <polygon points={`${hx + 28},${hy - 10} ${hx + 62},${hy - 8 - 12 * bo} ${hx + 30},${hy - 1}`} fill={C.beak} stroke={INK} strokeWidth={3.5} />
            <polygon points={`${hx + 30},${hy + 2} ${hx + 56},${hy + 8 + 14 * bo} ${hx + 28},${hy + 10}`} fill={C.beak} stroke={INK} strokeWidth={3.5} />
          </g>
        ) : (
          <g>
            <polygon points={`${hx + 28},${hy - 10} ${hx + 60},${hy + 1} ${hx + 28},${hy + 10}`} fill={C.beak} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <line x1={hx + 30} y1={hy} x2={hx + 54} y2={hy + 1} stroke={INK} strokeWidth={clench > 0.3 ? 3.5 : 2} />
            {clench > 0.3 && <path d={`M ${hx + 22} ${hy - 18} l 6 6 M ${hx + 22} ${hy + 18} l 6 -6`} stroke={INK} strokeWidth={3} strokeLinecap="round" />}
          </g>
        )}
        {eye === "sleep" ? (
          <path d={`M ${hx} ${hy - 8} Q ${hx + 8} ${hy - 1} ${hx + 16} ${hy - 8}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        ) : eye === "wide" ? (
          <g>
            <circle cx={hx + 8} cy={hy - 8} r={11} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <circle cx={hx + 8} cy={hy - 8} r={3} fill={INK} />
          </g>
        ) : (
          <g>
            <circle cx={hx + 8} cy={hy - 8} r={8.5} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <circle cx={hx + 8 + (eye === "back" ? -4 : eye === "fwd" ? 4 : 0)} cy={hy - 7} r={4.5} fill={INK} />
            {(eye === "back" || eye === "fwd") && <path d={`M ${hx - 1} ${hy - 9} Q ${hx + 8} ${hy - 19} ${hx + 17} ${hy - 9} Z`} fill={C.roost} stroke={INK} strokeWidth={3} />}
          </g>
        )}
        {sweat > 0.02 && (
          <path d={`M ${hx - 34} ${hy - 30 + sd * 22} q -8 12 0 16 q 8 -4 0 -16 Z`} fill={C.sweat} stroke={INK} strokeWidth={2.5} opacity={sweat * (1 - sd * 0.6)} />
        )}
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== 鶏小屋の中 (#48・#49 で同じ小屋)。x1 = 板壁の右の端 =====
const PERCH_Y = 650;
// [x, s, とさかの大きさ]  左がボス。とさかの大きい順
const ROOST: [number, number, number][] = [[330, 1.22, 1], [690, 1.0, 0.8], [1010, 0.96, 0.62], [1300, 0.92, 0.48], [1590, 0.86, 0.34]];
const MzCCoop: React.FC<{ f: number; id: string; x1?: number }> = ({ f, id, x1 = 2200 }) => {
  const n = Math.ceil((x1 + 400) / 92);
  return (
    <g>
      {/* 板壁 */}
      <rect x={-400} y={-300} width={x1 + 400} height={1130} fill={C.plank} />
      {Array.from({ length: n }, (_, i) => {
        const px = -400 + i * 92;
        const w = Math.min(90, x1 - px);
        if (w <= 4) return null;
        return (
          <g key={i}>
            <rect x={px} y={-300} width={w} height={1130} fill={i % 3 === 0 ? C.plankLight : i % 3 === 1 ? C.plank : C.plankDark} stroke={INK} strokeWidth={4} />
            <circle cx={px + 20} cy={198} r={4} fill={INK} />
            <circle cx={px + 20} cy={760} r={4} fill={INK} />
            {rnd(48, i) > 0.62 && <ellipse cx={px + 46} cy={300 + rnd(49, i) * 360} rx={9} ry={14} fill="none" stroke={C.plankDark} strokeWidth={3} />}
          </g>
        );
      })}
      <rect x={-400} y={180} width={x1 + 400} height={34} fill={C.plankDark} stroke={INK} strokeWidth={4} />
      {/* 金網の窓 (外は夜明け前の紺) */}
      <defs><clipPath id={id}><rect x={760} y={110} width={420} height={270} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={760} y={110 + i * 30} width={420} height={31} fill={mixColor(MP.nightDeep, MP.night, i / 8)} />
        ))}
        <rect x={760} y={350} width={420} height={30} fill={mixColor(MP.night, MP.dawn, 0.25)} />
        {[[800, 150], [880, 200], [990, 140], [1060, 230], [1130, 170], [930, 290]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={i % 2 ? 2.5 : 3.5} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 8 + i * 1.9)} />
        ))}
        <path d="M 760 380 L 840 330 L 930 350 L 1040 310 L 1180 345 L 1180 380 Z" fill="#141A30" />
        <g stroke={C.wire} strokeWidth={2.5} opacity={0.85}>
          {Array.from({ length: 18 }, (_, i) => <line key={`a${i}`} x1={700 + i * 36} y1={100} x2={700 + i * 36 + 300} y2={400} />)}
          {Array.from({ length: 18 }, (_, i) => <line key={`b${i}`} x1={1240 - i * 36} y1={100} x2={1240 - i * 36 - 300} y2={400} />)}
        </g>
      </g>
      <rect x={748} y={98} width={444} height={294} fill="none" stroke={MP.woodDark} strokeWidth={22} />
      <rect x={736} y={86} width={468} height={318} fill="none" stroke={INK} strokeWidth={5} />
      {/* 月あかりの筋 */}
      <polygon points="760,380 1180,380 1460,830 880,830" fill="#9FB4E0" opacity={0.1} />
      {/* 産卵箱 (わらと卵) */}
      {[140, 380, 1780].map((bx, i) => (
        <g key={bx}>
          <rect x={bx} y={700} width={200} height={120} fill={MP.wood} stroke={INK} strokeWidth={5} />
          <path d={`M ${bx + 10} 726 Q ${bx + 100} 700 ${bx + 190} 726`} stroke={C.straw} strokeWidth={14} fill="none" />
          <ellipse cx={bx + 80 + i * 20} cy={722} rx={20} ry={15} fill={C.egg} stroke={INK} strokeWidth={3.5} />
          <line x1={bx} y1={760} x2={bx + 200} y2={760} stroke={MP.woodDark} strokeWidth={3} />
        </g>
      ))}
      {/* 止まり木 (支柱と横木) */}
      {[90, 1820].map((px) => <rect key={px} x={px - 16} y={PERCH_Y - 10} width={32} height={200} fill={MP.woodDark} stroke={INK} strokeWidth={5} />)}
      <rect x={40} y={PERCH_Y} width={1840} height={30} rx={15} fill={MP.wood} stroke={INK} strokeWidth={5} />
      <path d={`M 80 ${PERCH_Y + 10} q 300 -6 600 0 q 300 6 600 -2 q 300 -6 580 2`} stroke={MP.woodLight} strokeWidth={4} fill="none" />
      {/* わらの床 */}
      <rect x={-400} y={820} width={x1 + 400} height={600} fill={C.straw} />
      <line x1={-400} y1={822} x2={x1} y2={822} stroke={INK} strokeWidth={5} />
      <g stroke={C.strawDark} strokeWidth={3.5} strokeLinecap="round">
        {Array.from({ length: Math.ceil((x1 + 400) / 40) }, (_, i) => {
          const sx = -400 + i * 40 + rnd(50, i) * 30;
          const sy = 850 + rnd(51, i) * 200;
          const a = (rnd(52, i) - 0.5) * 1.6;
          return <line key={i} x1={sx} y1={sy} x2={sx + Math.cos(a) * 34} y2={sy + Math.sin(a) * 34} />;
        })}
      </g>
      {/* 暗さ */}
      <rect x={-400} y={-300} width={x1 + 400} height={1720} fill={MP.nightDeep} opacity={0.4} />
    </g>
  );
};

// 雄鶏のくちばしの先 (音の線の出どころ)
const beakTip = (i: number, crow: number, flip = false) => {
  const [rx, rs] = ROOST[i];
  const lx = 62 + crow * 12 + 62, ly = -205 - crow * 48 - 6;
  return [rx + (flip ? -1 : 1) * lx * rs, PERCH_Y + ly * rs] as const;
};

// 点線の「?」(B判定のしるし)
const MzCDotQ: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 10) * 5}) scale(${sc})`}>
      <circle cx={0} cy={-40} r={66} fill={KRP.white} opacity={0.12} />
      <circle cx={0} cy={-40} r={66} fill="none" stroke={KRP.white} strokeWidth={4} strokeDasharray="8 9" />
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
        fill="none" stroke={KRP.white} strokeWidth={5} strokeDasharray="9 8">?</text>
    </g>
  );
};

// -------------------------------------------------------------------
// #48 しかも、群れでいちばん強いオスが、最初に鳴く、とされています。
// 格: 並 / seed 6048
// どこ: 夜明け前の鶏小屋。板壁・金網の窓 (外は紺の空と星)・月あかりの筋・産卵箱の卵・わらの床。長い止まり木に雄鶏が5羽。
// 演出: 左のボスはとさかも体もいちばん大きく、右へ行くほどとさかが小さい。ボスが目を開けて首を伸ばし、真っ先に鳴く (白い音の線)。
//       ほかの4羽は目を開けるが、くちばしをぎゅっと閉じ、半目の横目でボスをうかがって冷や汗。ボスの頭の後ろに点線の「?」(〜とされている)。
// 動き: f0-34 カメラが左 (ボス) の寄りから右へなめて全体へ引く / f10 ボスの目が開く / f16-22 首を伸ばして鳴く (f100まで) /
//       f24-30 4羽の横目・くちばしぎゅっ / f28- 冷や汗 / f34-42 点線の「?」 / f46- ボスへ少しずつ寄る
const Mz048: React.FC<{ f: number }> = ({ f }) => {
  const id = useCid("mzc48");
  const pan = easeInOut(seg(f, 0, 34));
  const k = lerp(1.2, 1.0, pan) + seg(f, 46, 150) * 0.07;
  const cx = lerp(620, 960, pan) - seg(f, 46, 150) * 60;
  const cy = lerp(480, 540, pan) - seg(f, 46, 150) * 20;
  const bossCrow = seg(f, 16, 22) * (1 - seg(f, 100, 110));
  const glance = seg(f, 24, 30);
  const sweat = seg(f, 28, 36);
  const [bx, by] = beakTip(0, bossCrow);
  return (
    <Frame f={f} seed={6048} bg={C.plankDark} dark>
      <g transform={cam(cx, cy, k)}>
        <MzCCoop f={f} id={id} />
        {ROOST.map(([rx, rs, cb], i) => i === 0 ? (
          <MzCRooster key={i} x={rx} y={PERCH_Y} s={rs} f={f} comb={cb} phase={i}
            eye={f < 10 ? "sleep" : "open"} crow={bossCrow} ruffle={bossCrow * 0.4} />
        ) : (
          <MzCRooster key={i} x={rx} y={PERCH_Y} s={rs} f={f} comb={cb} phase={i} flip={i === 4}
            eye={f < 24 ? "sleep" : glance > 0.3 ? (i === 4 ? "fwd" : "back") : "open"}
            clench={glance} sweat={sweat} tilt={-glance * 5} ruffle={-glance * 0.25} />
        ))}
        <MzCSound x={bx + 10} y={by} r={46} amt={bossCrow} f={f} side={1} color={KRP.white} w={9} rot={-24} />
        <MzCDotQ x={215} y={300} t={seg(f, 34, 42)} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #49 鶏の世界にも、起こす順番があったのです。
// 格: 山 / seed 6049
// どこ: #48 と同じ鶏小屋の止まり木 → 右の戸口の外の農場 (柵・赤い納屋・干し草・まだ暗い空・屋根の風見鶏)。
// 演出: とさかの大きい順に、ボス→2番→3番→4番と鳴き声がリレーされ、鳴いた鶏の上に番号の札 (1〜4) が出る。
//       5番目の若い雄鶏 (とさか最小・左向き) は寝たまま。4番目が首を伸ばして頭をこつん → 飛び上がって裏返った声で鳴き、羽毛が散る (札5)。
//       カメラは右へパンして小屋の外の納屋へ。納屋の牛が眠そうに片目だけ開ける。
// 動き: f0-26 リレー (7fずつ) / f28-33 こつん / f31-42 飛び上がって鳴く・羽毛 / f46-88 カメラが右の納屋へパン / f88-100 牛の片目
const RELAY = [-4, 4, 11, 18];
const Mz049: React.FC<{ f: number }> = ({ f }) => {
  const id = useCid("mzc49");
  const pan = easeInOut(seg(f, 46, 88));
  const cx = lerp(930, 2560, pan);
  const k = lerp(1.0, 1.04, pan);
  const crowOf = (i: number) => seg(f, RELAY[i], RELAY[i] + 3) * (1 - seg(f, RELAY[i] + 9, RELAY[i] + 13));
  const peck = seg(f, 27, 30) * (1 - seg(f, 33, 38));
  const wake = seg(f, 31, 33);
  const jumpT = seg(f, 31, 43);
  const youngCrow = seg(f, 32, 34) * (1 - seg(f, 62, 70));
  const feath = seg(f, 31, 60);
  const cowEye = seg(f, 90, 98);
  const [yx, yy] = beakTip(4, youngCrow, true);
  return (
    <Frame f={f} seed={6049} bg={C.plankDark} dark>
      <g transform={cam(cx, 540, k)}>
        {/* 小屋の外 (戸口の向こうの農場) */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={1980} y={-300 + i * 112} width={1800} height={113} fill={mixColor(C.nightSky, mixColor(MP.night, MP.dawn, 0.35), Math.pow(i / 9, 1.4))} />
        ))}
        {[[2150, 80], [2400, 160], [2720, 60], [3050, 140], [3350, 90], [2900, 230]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={3} fill="#FFF6D8" opacity={0.4 + 0.4 * Math.sin(f / 9 + i)} />
        ))}
        <path d="M 1980 640 Q 2300 560 2600 610 Q 3000 540 3400 620 L 3800 600 L 3800 830 L 1980 830 Z" fill="#1E2A3A" />
        {/* 赤い納屋 */}
        <g>
          <polygon points="2620,400 2780,300 3060,300 3220,400 3220,830 2620,830" fill={C.barn} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <polygon points="2600,404 2780,286 3060,286 3240,404 3220,412 3060,312 2780,312 2620,412" fill={C.barnDark} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={2660 + i * 48} y1={420} x2={2660 + i * 48} y2={830} stroke={C.barnDark} strokeWidth={3} />)}
          {/* 上の干し草の扉 */}
          <rect x={2850} y={340} width={140} height={110} fill="#2A1A14" stroke={INK} strokeWidth={5} />
          <path d="M 2860 440 Q 2920 400 2980 440 Z" fill={C.straw} stroke={INK} strokeWidth={3} />
          {/* 下の半扉 (中に牛) */}
          <rect x={2760} y={560} width={320} height={270} fill="#1D1411" stroke={INK} strokeWidth={6} />
          {/* 牛の顔 */}
          <g transform="translate(2920 640)">
            <path d="M -86 -40 Q -130 -60 -126 -30 Q -110 -14 -78 -22 Z M 86 -40 Q 130 -60 126 -30 Q 110 -14 78 -22 Z" fill={C.cow} stroke={INK} strokeWidth={4} />
            <path d="M -50 -70 Q -60 -104 -36 -110 M 50 -70 Q 60 -104 36 -110" stroke={C.egg} strokeWidth={12} fill="none" strokeLinecap="round" />
            <path d="M -50 -70 Q -60 -104 -36 -110 M 50 -70 Q 60 -104 36 -110" stroke={INK} strokeWidth={3} fill="none" />
            <ellipse cx={0} cy={0} rx={86} ry={92} fill={C.cow} stroke={INK} strokeWidth={5} />
            <path d="M -70 -50 Q -30 -70 -20 -30 Q -50 0 -76 -10 Z" fill={C.cowSpot} />
            <ellipse cx={0} cy={58} rx={70} ry={42} fill={C.cowNose} stroke={INK} strokeWidth={4} />
            <ellipse cx={-24} cy={58} rx={9} ry={12} fill={INK} />
            <ellipse cx={24} cy={58} rx={9} ry={12} fill={INK} />
            {/* 左目はとじたまま、右目だけ眠そうに開く */}
            <path d="M -44 -14 Q -32 -4 -20 -14" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            {cowEye > 0.1 ? (
              <g>
                <ellipse cx={32} cy={-14} rx={13} ry={13 * cowEye} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                <circle cx={32} cy={-12} r={5 * cowEye} fill={INK} />
                <path d="M 17 -18 Q 32 -26 47 -18" stroke={INK} strokeWidth={4} fill="none" />
              </g>
            ) : (
              <path d="M 20 -14 Q 32 -4 44 -14" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
            {/* Zzz */}
            <text x={110} y={-90 - (f % 40)} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white} opacity={(1 - cowEye) * 0.8}>z</text>
          </g>
          <rect x={2760} y={690} width={320} height={140} fill={C.barn} stroke={INK} strokeWidth={6} />
          <path d="M 2760 690 L 3080 830 M 3080 690 L 2760 830" stroke={C.egg} strokeWidth={12} />
          {/* 屋根の風見鶏 */}
          <line x1={2920} y1={286} x2={2920} y2={200} stroke={MP.iron} strokeWidth={6} />
          <path d={`M 2890 200 Q 2900 170 2930 176 L 2944 160 L 2948 182 Q 2960 196 2940 204 Z`} fill={MP.iron} stroke={INK} strokeWidth={3}
            transform={`rotate(${Math.sin(f / 16) * 8} 2920 200)`} />
        </g>
        {/* 干し草 */}
        <rect x={3300} y={700} width={220} height={130} rx={20} fill={C.straw} stroke={INK} strokeWidth={5} />
        <path d="M 3320 740 h 180 M 3320 780 h 180" stroke={C.strawDark} strokeWidth={4} />
        {/* 地面と柵 */}
        <rect x={1980} y={820} width={1800} height={600} fill={C.grass} />
        <path d="M 1980 822 L 3780 822" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect x={2080 + i * 150} y={660} width={20} height={200} fill={MP.wood} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        <rect x={2060} y={690} width={1700} height={16} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <rect x={2060} y={760} width={1700} height={16} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <rect x={1980} y={-300} width={1800} height={1720} fill={MP.nightDeep} opacity={0.3} />
        {/* 小屋の中 (#48 と同じ) と右の戸口の柱 */}
        <MzCCoop f={f} id={id} x1={1990} />
        <rect x={1960} y={-300} width={60} height={1130} fill={C.plankDark} stroke={INK} strokeWidth={5} />
        {/* 雄鶏5羽 */}
        {ROOST.map(([rx, rs, cb], i) => {
          if (i < 4) {
            const c = crowOf(i);
            return <MzCRooster key={i} x={rx} y={PERCH_Y} s={rs} f={f} comb={cb} phase={i}
              eye={f < RELAY[i] - 2 ? "sleep" : i === 3 && peck > 0.2 ? "fwd" : "open"} crow={c} ruffle={c * 0.3}
              peck={i === 3 ? peck : 0} />;
          }
          return <MzCRooster key={i} x={rx} y={PERCH_Y} s={rs} f={f} comb={cb} phase={i} flip
            eye={wake > 0.5 ? "wide" : "sleep"} droop={1 - wake} crow={youngCrow} ruffle={wake * 0.6 * (1 - seg(f, 50, 70))}
            jump={Math.sin(Math.PI * jumpT) * 70} combTilt={wake * 22} sweat={wake * (1 - seg(f, 70, 90))} />;
        })}
        {/* 鳴き声のリレー (左から右へ) と番号の札 */}
        {[0, 1, 2, 3].map((i) => {
          const c = crowOf(i);
          const [tx, ty] = beakTip(i, c);
          const [rx, rs] = ROOST[i];
          const shown = seg(f, RELAY[i], RELAY[i] + 4);
          return (
            <g key={i}>
              <MzCSound x={tx + 8} y={ty} r={40 * rs} amt={c} f={f} side={1} color={KRP.white} w={8} rot={-24} />
              {shown > 0 && (
                <g transform={`translate(${rx - 40 * rs} ${PERCH_Y - 330 * rs}) scale(${pop(shown)})`}>
                  <circle r={30} fill={KRP.white} stroke={INK} strokeWidth={5} />
                  <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>{i + 1}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* 4→5 のリレーの矢印 (順番が来たのに寝ている) */}
        {f > 22 && f < 31 && <path d="M 1380 360 Q 1460 300 1530 370" stroke={KRP.white} strokeWidth={6} fill="none" strokeDasharray="12 10" opacity={0.8} />}
        {/* こつん */}
        {peck > 0.6 && (
          <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
            {[0, 1, 2, 3, 4].map((k2) => {
              const a = -Math.PI / 2 + (k2 - 2) * 0.5;
              return <line key={k2} x1={1520 + Math.cos(a) * 30} y1={470 + Math.sin(a) * 30} x2={1520 + Math.cos(a) * 60} y2={470 + Math.sin(a) * 60} />;
            })}
          </g>
        )}
        {/* 5番目の裏返った声 (ギザギザ) と番号5 */}
        {youngCrow > 0.05 && (
          <g stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={youngCrow}>
            {[0, 1, 2].map((k2) => (
              <path key={k2} d={`M ${yx - 30 - k2 * 6} ${yy - 30 - k2 * 34} l -28 -14 l 10 -18 l -30 -10 l 12 -18`} transform={`rotate(${-20 + k2 * 25} ${yx} ${yy})`} />
            ))}
          </g>
        )}
        {f >= 33 && (
          <g transform={`translate(${ROOST[4][0] + 40} ${PERCH_Y - 340 - Math.sin(Math.PI * jumpT) * 70}) scale(${pop(seg(f, 33, 37))})`}>
            <circle r={30} fill={KRP.white} stroke={INK} strokeWidth={5} />
            <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={INK}>5</text>
          </g>
        )}
        {/* 散る羽毛 */}
        {feath > 0 && feath < 1 && Array.from({ length: 9 }, (_, i) => {
          const a = rnd(491, i) * Math.PI * 2;
          const dist = 60 + feath * (120 + rnd(492, i) * 120);
          const px = 1560 + Math.cos(a) * dist;
          const py = 520 + Math.sin(a) * dist * 0.7 + feath * feath * 160;
          return <ellipse key={i} cx={px} cy={py} rx={16} ry={7} fill={C.roost} stroke={INK} strokeWidth={2.5} opacity={1 - feath * 0.6}
            transform={`rotate(${(f * 9 + i * 40) % 360} ${px} ${py})`} />;
        })}
      </g>
    </Frame>
  );
};

// 修道院の寝室の窓の形 (Shudouin と同じ)。雪を窓の中だけに降らせるのに使う
const SD_BAYS = [430, 960, 1490];
const sdWin = (cx: number) => `M ${cx - 42} 540 L ${cx - 42} 250 A 42 42 0 0 1 ${cx + 42} 250 L ${cx + 42} 540 Z`;
const MzCWinSnow: React.FC<{ f: number; id: string; wind?: number }> = ({ f, id, wind = 1 }) => (
  <g>
    <defs><clipPath id={id}>{SD_BAYS.map((cx) => <path key={cx} d={sdWin(cx)} />)}</clipPath></defs>
    <g clipPath={`url(#${id})`}>
      {SD_BAYS.map((cx, b) => Array.from({ length: 12 }, (_, i) => {
        const t = ((f * (1.2 + wind) + i * 23 + b * 7) % 60) / 60;
        const sx = cx - 60 + ((i * 37) % 120) + t * 70 * wind;
        const sy = 200 + t * 360;
        return <circle key={`${b}-${i}`} cx={sx} cy={sy} r={i % 3 ? 3 : 4.5} fill={C.snow} opacity={0.9} />;
      }))}
    </g>
  </g>
);

// -------------------------------------------------------------------
// #50 もっと厳しかったのが、ヨーロッパの修道院です。
// 格: 山 / seed 6050
// どこ: 冬の夜。雪の丘の上の石造りの修道院 (細い月・星・鐘の塔・十字架・雪の屋根・1つだけ灯る細長い窓) → その窓から中へ → Shudouin の寝室 (dark=1, candle=1)。札「6世紀」「ヨーロッパ」。
// 演出: 吹雪が斜めに流れ、窓をたたく。寝室では4台のベッドに修道士 (年上=白ひげ白髪・少し太め / 若い=黒髪) が眠る。
//       3台目の年上が寒さでぶるぶる震え、布団からはみ出た足をしゅっと引っ込める。ろうそくの炎は風で横へなびく。
// 動き: f0-32 外観から灯る窓へ寄る / f26-36 窓を抜けて寝室へ (重ねて入れ替え) / f30- 震え / f36-42 足を引っ込める / f44-111 室内を右へパン
const Mz050: React.FC<{ f: number }> = ({ f }) => {
  const id = useCid("mzc50");
  const zt = seg(f, 0, 32);
  const kOut = 1 + 7 * Math.pow(zt, 2.4);
  const inT = seg(f, 26, 36);
  const kIn = lerp(1.35, 1.06, easeOut(seg(f, 26, 44)));
  const pcx = lerp(900, 1060, easeInOut(seg(f, 44, 111)));
  const shiver = seg(f, 30, 34);
  const pull = seg(f, 36, 42);
  const beds: ["old" | "young", number][] = [["old", 0], ["young", 1], ["old", 2], ["young", 3]];
  return (
    <Frame f={f} seed={6050} bg={C.nightSky} dark>
      {/* ---- 中: 修道院の寝室 ---- */}
      {inT > 0 && (
        <g opacity={inT} transform={cam(pcx, 560, kIn)}>
          <MzCHallExt f={f} dark={1} />
          <Shudouin f={f} dark={1} candle={1} bell={0} />
          <MzCWinSnow f={f} id={id + "w"} wind={1.6} />
          {/* 窓からの風の線 */}
          {SD_BAYS.map((cx, b) => (
            <g key={cx} stroke={C.snow} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55}>
              {[0, 1].map((k2) => {
                const t = ((f + b * 9 + k2 * 14) % 28) / 28;
                return <path key={k2} d={`M ${cx + 40 + t * 120} ${360 + k2 * 60} q 50 -20 100 0 q 40 16 80 0`} opacity={1 - t} />;
              })}
            </g>
          ))}
          {/* 左の柱のろうそくの炎をあおる風 */}
          <path d={`M 200 470 q 30 -14 60 0 q 30 14 60 0`} stroke={C.snow} strokeWidth={4} fill="none" opacity={0.4 + 0.3 * Math.sin(f / 3)} />
          {beds.map(([age, i]) => {
            const bx = [300, 740, 1180, 1620][i];
            return (
              <g key={i}>
                <MzCBedMonk bx={bx} rise={0} f={f} age={age} phase={i} face={i === 2 && shiver > 0.5 ? "worried" : "normal"}
                  shiver={i === 2 ? shiver : 0} />
                <MzCBlanket bx={bx} f={f} phase={i} />
                {/* 3台目: はみ出た足 → 引っ込める */}
                {i === 2 && pull < 1 && (
                  <g opacity={1 - pull} transform={`translate(${-pull * 40} 0)`}>
                    <ellipse cx={bx + 186} cy={716} rx={16} ry={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                    <ellipse cx={bx + 190} cy={740} rx={16} ry={11} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
                  </g>
                )}
                {i === 2 && pull > 0 && pull < 1 && (
                  <path d={`M ${bx + 230} 712 h 40 M ${bx + 236} 732 h 50 M ${bx + 230} 752 h 40`} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={1 - pull} />
                )}
              </g>
            );
          })}
          {/* Zzz */}
          {[740, 1620].map((bx, i) => (
            <text key={bx} x={bx - 70 + i * 10} y={570 - ((f + i * 20) % 50)} fontFamily={FONT} fontWeight={900} fontSize={42}
              fill={KRP.white} opacity={0.7 * (1 - ((f + i * 20) % 50) / 50)}>z</text>
          ))}
        </g>
      )}
      {/* ---- 外: 冬の夜の丘の上の修道院 ---- */}
      {inT < 1 && (
        <g opacity={1 - inT} transform={`translate(1210 470) scale(${kOut}) translate(-1210 -470)`}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={-40} y={-40 + i * 116} width={2000} height={117} fill={mixColor(C.nightSky, MP.night, i / 9)} />
          ))}
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={rnd(501, i) * 1900} cy={rnd(502, i) * 420} r={i % 4 ? 2.5 : 4} fill="#FFF6D8" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 10 + i))} />
          ))}
          {/* 細い月 */}
          <path d="M 400 120 A 70 70 0 1 0 470 250 A 56 56 0 1 1 400 120 Z" fill="#FFF3C4" stroke={INK} strokeWidth={4} />
          {/* 遠い山 */}
          <path d="M -40 720 L 220 520 L 400 640 L 620 470 L 820 620 L 1100 560 L 1380 640 L 1640 480 L 1960 640 L 1960 1120 L -40 1120 Z" fill={C.hill} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 180 552 L 220 520 L 262 552 L 240 548 L 222 560 Z M 580 500 L 620 470 L 664 502 L 636 498 L 616 512 Z M 1600 510 L 1640 480 L 1684 512 L 1656 506 L 1636 520 Z" fill={C.snow} />
          {/* 雪の丘 */}
          <path d="M -40 1120 L -40 880 Q 300 820 600 700 Q 800 640 1400 650 Q 1700 680 1960 860 L 1960 1120 Z" fill={C.snow} stroke={INK} strokeWidth={6} />
          <path d="M 200 900 Q 500 830 700 760 M 1500 720 Q 1700 760 1880 880" stroke={C.snowShade} strokeWidth={10} fill="none" strokeLinecap="round" />
          {/* 修道院の建物 */}
          <rect x={760} y={420} width={660} height={250} fill={MP.stone} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 6 }, (_, r) => <line key={r} x1={760} y1={460 + r * 36} x2={1420} y2={460 + r * 36} stroke={MP.stoneDark} strokeWidth={3} />)}
          <polygon points="740,424 840,340 1340,340 1440,424" fill={C.slate} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 752 418 L 842 346 L 1338 346 L 1428 418 Q 1300 400 1090 410 Q 900 404 752 418 Z" fill={C.snow} stroke={INK} strokeWidth={3} />
          {/* 鐘の塔 */}
          <rect x={1450} y={250} width={130} height={420} fill={MP.stone} stroke={INK} strokeWidth={6} />
          <path d="M 1484 340 L 1484 300 A 31 31 0 0 1 1546 300 L 1546 340 Z" fill="#141A30" stroke={INK} strokeWidth={4} />
          <path d="M 1500 330 Q 1500 304 1515 302 Q 1530 304 1530 330 Z" fill={MP.brass} stroke={INK} strokeWidth={3} />
          <polygon points="1436,254 1515,130 1594,254" fill={C.slate} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 1446 246 L 1515 140 L 1530 166 L 1500 200 L 1470 240 Z" fill={C.snow} />
          <path d="M 1515 130 L 1515 80 M 1497 98 L 1533 98" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          {/* 細長い窓 (右から2つ目だけ灯る) */}
          {[830, 930, 1030, 1130, 1210, 1330].map((wx) => {
            const lit = wx === 1210;
            return (
              <g key={wx}>
                {lit && <circle cx={wx} cy={480} r={50} fill={MP.glow} opacity={0.35 + 0.1 * Math.sin(f / 4)} />}
                <path d={`M ${wx - 14} 520 L ${wx - 14} 452 A 14 14 0 0 1 ${wx + 14} 452 L ${wx + 14} 520 Z`} fill={lit ? MP.flame : "#141A30"} stroke={INK} strokeWidth={4} />
              </g>
            );
          })}
          <path d="M 1060 670 L 1060 600 A 30 30 0 0 1 1120 600 L 1120 670 Z" fill={MP.woodDark} stroke={INK} strokeWidth={5} />
          {/* 吹雪 */}
          {Array.from({ length: 46 }, (_, i) => {
            const t = ((f * 1.6 + i * 31) % 90) / 90;
            const sx = -100 + rnd(503, i) * 2000 + t * 300;
            const sy = -40 + t * 1160;
            return <circle key={i} cx={sx} cy={sy} r={i % 3 ? 4 : 6} fill={C.snow} opacity={0.85} />;
          })}
          {[0, 1, 2].map((k2) => {
            const t = ((f + k2 * 20) % 40) / 40;
            return <path key={k2} d={`M ${200 + t * 900} ${300 + k2 * 220} q 120 -40 240 0 q 100 34 200 0`} stroke={C.snow} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6 * (1 - t)} />;
          })}
        </g>
      )}
      <TagPlate x={1370} y={160} text="6世紀" size={44} t={seg(f, 4, 14)} />
      <TagPlate x={1650} y={160} text="ヨーロッパ" size={44} t={seg(f, 8, 18)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #51 約1500年前に書かれた、修道院の決まりが、残っています。
// 格: 並 / seed 6051
// どこ: 修道院の写本室。石の壁と石のアーチの細長い窓 (夜)・棚の巻物と本・木の書見台・羽ペンとインク壺・ろうそく。札「約1500年前」。
// 演出: 書見台の上に、角に金具のついた革表紙の分厚い本。黒い袖の修道士の両手 (2本) が表紙のほこりを払うと、ほこりが金色に光って舞う。
//       本が開くと、右のページの余白に決まりの飾り絵が4つ (三日月とベッド / 修道服 / 鈴 / 3つ並んだベッド)。左のページは装飾頭文字と字の列 (読めない線)。
//       カメラがページへ寄り、1つめの飾り絵の月がゆっくり傾く。
// 動き: f0-12 右手が表紙をなでてほこりを払う / f2-40 金色のほこり / f12-26 表紙が開く / f26-42 ページへ寄る (1→1.3) / f42-154 さらに寄る (→1.75)・月が傾く
const Mz051: React.FC<{ f: number }> = ({ f }) => {
  const open = easeInOut(seg(f, 12, 26));
  const z1 = easeInOut(seg(f, 26, 42));
  const z2 = easeInOut(seg(f, 42, 154));
  const k = 1 + 0.3 * z1 + 0.45 * z2;
  const cx = lerp(960, 1230, z1) + 30 * z2;
  const cy = lerp(540, 470, z1) - 20 * z2;
  const moonRot = -seg(f, 30, 154) * 28;
  const sweep = seg(f, 0, 12);
  // 右手: 表紙をなでる → 表紙のふちをつまんでめくる → ページの右下を押さえる
  const rh: [number, number] = f < 12 ? [lerp(1440, 1040, sweep), 500 + Math.sin(sweep * Math.PI) * -20]
    : f < 26 ? [960 + 520 * Math.cos(open * Math.PI), 560 - Math.sin(open * Math.PI) * 120]
    : [lerp(440, 1480, easeInOut(seg(f, 26, 36))), lerp(560, 760, easeInOut(seg(f, 26, 36))) - Math.sin(Math.PI * seg(f, 26, 36)) * 80];
  const rhx = rh[0];
  const rhy = rh[1] + (f > 40 ? Math.sin(f / 15) * 3 : 0);
  const lh: [number, number] = [lerp(400, 450, seg(f, 22, 32)), 770 + Math.sin(f / 17) * 3];
  const coverScale = 1 - 2 * open;
  return (
    <Frame f={f} seed={6051} bg={MP.stoneDark}>
      <g transform={cam(cx, cy, k)}>
        <MzCStones x={-200} y={-200} w={2320} h={1500} seed={21} />
        {/* アーチの窓 (夜) */}
        <path d="M 260 520 L 260 230 A 60 60 0 0 1 380 230 L 380 520 Z" fill="#1E2540" stroke={INK} strokeWidth={7} />
        <path d="M 236 540 L 236 230 A 84 84 0 0 1 404 230 L 404 540" stroke={MP.stoneLight} strokeWidth={18} fill="none" />
        <circle cx={300} cy={280} r={3} fill="#FFF6D8" /><circle cx={340} cy={360} r={2.5} fill="#FFF6D8" />
        <path d="M 320 200 L 320 520 M 260 360 L 380 360" stroke={MP.iron} strokeWidth={6} />
        {/* 棚 (巻物と本) */}
        <rect x={1600} y={180} width={420} height={560} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
        {[300, 440, 580].map((sy, r) => (
          <g key={sy}>
            <rect x={1600} y={sy} width={420} height={16} fill={MP.wood} stroke={INK} strokeWidth={4} />
            {Array.from({ length: 6 }, (_, i) => r === 1 ? (
              <g key={i}>
                <rect x={1626 + i * 60} y={sy - 40} width={44} height={40} rx={20} fill={C.parch} stroke={INK} strokeWidth={3.5} />
                <circle cx={1626 + i * 60 + 22} cy={sy - 20} r={8} fill={C.parchDark} stroke={INK} strokeWidth={2.5} />
              </g>
            ) : (
              <rect key={i} x={1620 + i * 62} y={sy - 96 + (i % 3) * 8} width={46} height={96 - (i % 3) * 8} rx={4}
                fill={[C.leather, MP.bellDark, C.leatherDark, MP.habitMid][(i + r) % 4]} stroke={INK} strokeWidth={3.5} />
            ))}
          </g>
        ))}
        {/* 書見台 */}
        <polygon points="300,800 1620,800 1560,880 360,880" fill={MP.woodDark} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <polygon points="330,250 1590,250 1640,800 280,800" fill={MP.wood} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={860} y={880} width={200} height={300} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
        {/* インク壺と羽ペン */}
        <g>
          <path d="M 1660 820 Q 1650 760 1690 756 L 1730 756 Q 1770 760 1760 820 Z" fill={INK} />
          <rect x={1680} y={740} width={60} height={20} rx={6} fill="#3A3A44" stroke={INK} strokeWidth={3} />
          <path d={`M 1714 744 Q 1760 600 1850 ${500 + Math.sin(f / 18) * 6} Q 1790 620 1724 746 Z`} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
          <path d="M 1724 740 Q 1770 640 1840 520" stroke={MP.stoneDark} strokeWidth={2.5} fill="none" />
        </g>
        {/* ろうそく */}
        <circle cx={220} cy={640} r={180} fill={MP.glow} opacity={0.16} />
        <MzCHandCandle x={220} y={790} s={1.3} f={f} />
        {/* 本: 左ページ (開いてから) */}
        {open > 0.5 && (
          <g>
            <rect x={420} y={262} width={548} height={516} rx={10} fill={C.leather} stroke={INK} strokeWidth={6} />
            <path d="M 440 280 Q 700 262 958 286 L 958 770 Q 700 750 440 768 Z" fill={C.parch} stroke={INK} strokeWidth={5} />
            {/* 装飾の頭文字 */}
            <rect x={490} y={320} width={110} height={110} fill={MP.bell} stroke={INK} strokeWidth={4} />
            <path d="M 516 410 L 545 336 L 574 410 M 528 384 L 562 384" stroke={C.gold} strokeWidth={9} fill="none" strokeLinecap="round" />
            {Array.from({ length: 11 }, (_, i) => (
              <path key={i} d={`M ${i < 3 ? 620 : 490} ${340 + i * 36} q 40 -6 80 0 t 80 0 t 80 0 t ${i < 3 ? 40 : 100} 0`} stroke={C.inkBrown} strokeWidth={4} fill="none" opacity={0.8} />
            ))}
          </g>
        )}
        {/* 右ページ */}
        <g>
          <rect x={952} y={262} width={548} height={516} rx={10} fill={C.leather} stroke={INK} strokeWidth={6} />
          <path d="M 962 286 Q 1220 262 1480 280 L 1480 768 Q 1220 750 962 770 Z" fill={C.parch} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M 990 ${330 + i * 38} q 30 -6 60 0 t 60 0 t 60 0`} stroke={C.inkBrown} strokeWidth={4} fill="none" opacity={0.75} />
          ))}
          {/* 余白の飾り絵4つ (上から台本の順) */}
          {[0, 1, 2, 3].map((i) => {
            const vy = 330 + i * 106;
            return (
              <g key={i}>
                <rect x={1218} y={vy - 44} width={236} height={92} rx={8} fill={C.parch} stroke={C.inkBrown} strokeWidth={4} />
                <path d={`M 1226 ${vy - 36} h 220 v 76 h -220 Z`} fill="none" stroke={C.gold} strokeWidth={2.5} />
              </g>
            );
          })}
          {/* 1: 三日月とベッド */}
          <g>
            <rect x={1270} y={330} width={120} height={22} rx={4} fill={MP.wood} stroke={INK} strokeWidth={3} />
            <ellipse cx={1290} cy={326} rx={18} ry={8} fill={C.egg} stroke={INK} strokeWidth={2.5} />
            <g transform={`rotate(${moonRot} 1412 314)`}>
              <path d="M 1404 292 A 22 22 0 1 0 1426 330 A 17 17 0 1 1 1404 292 Z" fill={C.gold} stroke={INK} strokeWidth={3} />
            </g>
            <circle cx={1250} cy={304} r={3} fill={C.inkBrown} /><circle cx={1440} cy={350} r={2.5} fill={C.inkBrown} />
          </g>
          {/* 2: 修道服 */}
          <g transform="translate(1336 436)">
            <path d="M -24 -36 Q 0 -48 24 -36 L 34 34 L -34 34 Z" fill={MP.habit} stroke={INK} strokeWidth={3} />
            <path d="M -24 -36 L -52 4 L -40 10 L -20 -16 M 24 -36 L 52 4 L 40 10 L 20 -16" fill={MP.habit} stroke={INK} strokeWidth={3} />
            <rect x={-28} y={0} width={56} height={6} fill={C.rope} />
            <path d="M -16 -38 Q 0 -60 16 -38" fill={MP.habit} stroke={INK} strokeWidth={3} />
          </g>
          {/* 3: 鈴 */}
          <g transform="translate(1336 536)">
            <MzCHandBell x={0} y={-30} s={0.62} swing={Math.sin(f / 7) * 8} />
          </g>
          {/* 4: 3つ並んだベッド (真ん中だけ黒髪) */}
          <g transform="translate(1336 648)">
            {[-60, 0, 60].map((bx2, i) => (
              <g key={bx2}>
                <rect x={bx2 - 24} y={-30} width={48} height={64} rx={4} fill={MP.wood} stroke={INK} strokeWidth={3} />
                <circle cx={bx2} cy={-14} r={11} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
                <path d={`M ${bx2 - 11} -16 Q ${bx2} -32 ${bx2 + 11} -16 Z`} fill={i === 1 ? INK : KRP.white} stroke={INK} strokeWidth={2} />
                <rect x={bx2 - 22} y={2} width={44} height={30} rx={3} fill={C.blanket} stroke={INK} strokeWidth={2.5} />
              </g>
            ))}
          </g>
        </g>
        {/* 表紙 (右ページの上に乗っていて、背を軸にめくれる) */}
        {open < 1 && (
          <g transform={`translate(960 0) scale(${coverScale} 1) translate(-960 0)`}>
            <rect x={956} y={256} width={552} height={528} rx={12} fill={coverScale > 0 ? C.leather : C.leatherDark} stroke={INK} strokeWidth={6} />
            {coverScale > 0 && (
              <g>
                <rect x={1010} y={310} width={444} height={420} rx={8} fill="none" stroke={C.gold} strokeWidth={5} />
                <path d="M 1232 400 L 1232 640 M 1162 480 L 1302 480" stroke={C.gold} strokeWidth={14} strokeLinecap="round" />
                {[[956, 256], [1508, 256], [956, 784], [1508, 784]].map(([qx, qy], i) => (
                  <path key={i} d={`M ${qx} ${qy} l ${qx > 1000 ? -60 : 60} 0 l ${qx > 1000 ? 60 : -60} ${qy > 500 ? -60 : 60} Z`} fill={MP.brass} stroke={INK} strokeWidth={4} />
                ))}
                <rect x={1490} y={480} width={40} height={80} rx={6} fill={MP.brass} stroke={INK} strokeWidth={4} />
                {/* 積もったほこり (払うと消える) */}
                <rect x={1000 + sweep * 460} y={300} width={Math.max(0, 470 - sweep * 460)} height={440} fill={MP.stoneLight} opacity={0.4} />
              </g>
            )}
          </g>
        )}
        {/* 背の丸み */}
        <rect x={944} y={250} width={32} height={540} rx={14} fill={C.leatherDark} stroke={INK} strokeWidth={5} />
        {/* 金色に舞うほこり */}
        {Array.from({ length: 22 }, (_, i) => {
          const t = clamp01((f - 2 - rnd(511, i) * 10) / 38);
          if (t <= 0 || t >= 1) return null;
          const px = 1040 + rnd(512, i) * 440 + t * 120;
          const py = 520 - rnd(513, i) * 200 - t * 220;
          return <circle key={i} cx={px} cy={py} r={4 + rnd(514, i) * 5} fill={C.gold} opacity={(1 - t) * 0.95} />;
        })}
        {/* 修道士の両手 (黒い袖。2本) */}
        <g>
          <path d={`M 300 1200 Q ${lh[0] - 140} ${lh[1] + 160} ${lh[0] - 20} ${lh[1] + 20}`} stroke={INK} strokeWidth={84} fill="none" strokeLinecap="round" />
          <path d={`M 300 1200 Q ${lh[0] - 140} ${lh[1] + 160} ${lh[0] - 20} ${lh[1] + 20}`} stroke={MP.habit} strokeWidth={74} fill="none" strokeLinecap="round" />
          <ellipse cx={lh[0]} cy={lh[1]} rx={34} ry={28} fill={KRP.white} stroke={INK} strokeWidth={5} />
          <path d={`M 1700 1200 Q ${rhx + 160} ${rhy + 200} ${rhx + 20} ${rhy + 24}`} stroke={INK} strokeWidth={84} fill="none" strokeLinecap="round" />
          <path d={`M 1700 1200 Q ${rhx + 160} ${rhy + 200} ${rhx + 20} ${rhy + 24}`} stroke={MP.habit} strokeWidth={74} fill="none" strokeLinecap="round" />
          <ellipse cx={rhx} cy={rhy} rx={34} ry={28} fill={KRP.white} stroke={INK} strokeWidth={5} />
        </g>
      </g>
      <TagPlate x={1620} y={170} text="約1500年前" size={44} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #52 冬は、まだ真っ暗な夜中に起きて、お祈りをすること。
// 格: 山 / seed 6052
// どこ: Shudouin (dark=1, candle 0→3) の冬の真夜中。窓の外は真っ暗で雪と星。左の入口の奥に礼拝堂への木の扉 (少し開いて光がもれる)。札「冬」「夜中」。
// 演出: 4人の修道士 (年上・若い・年上・若い) が次々に起き上がり、白い息を吐く。ベッドを出て立つと、1人目のろうそくに火がつき、
//       火の粉が隣のろうそくへ順に飛んで分けられ、部屋も柱のろうそくで明るくなる。全員が寒さに肩をすくめて一列で左の扉へ。
//       最後尾の若い修道士はまぶたが半分閉じたまま早足で追いつき、前の人の背中にぽふっとぶつかって跳ね返る。
// 動き: f0-12 起き上がる / f12-22 ベッドから出て立つ / f18-40 火が分けられる (6fずつ) / f50- 一列で左へ歩く (カメラも左へパン) / 追いつくとぽふっ
const STAND52 = [380, 820, 1260, 1700];
const walk52 = (f: number) => {
  const xs = [...STAND52];
  let bump = -1;
  for (let t = 50; t <= f; t++) {
    xs[0] -= 4.2;
    for (let i = 1; i < 4; i++) {
      const want = i === 3 ? 96 : 165;
      const v = 4.2 + i * 4.5;
      xs[i] = Math.max(xs[i] - v, xs[i - 1] + want);
      if (i === 3 && bump < 0 && xs[3] - xs[2] <= want + 0.5) bump = t;
    }
  }
  return { xs, bump };
};
const Mz052: React.FC<{ f: number }> = ({ f }) => {
  const id = useCid("mzc52");
  const ages: ("old" | "young")[] = ["old", "young", "old", "young"];
  const beds = [300, 740, 1180, 1620];
  const litAt = [18, 24, 30, 36];
  const lit = litAt.map((a) => seg(f, a, a + 4));
  const nLit = lit.filter((v) => v > 0.5).length;
  const { xs, bump } = walk52(f);
  const bt = bump >= 0 ? clamp01((f - bump) / 12) : 0;
  const bumpOff = bump >= 0 ? Math.sin(Math.PI * bt) * 46 : 0;
  const pcx = lerp(960, 420, easeInOut(seg(f, 50, 133)));
  const shrug = 0.5 + 0.5 * Math.sin(f / 6);
  return (
    <Frame f={f} seed={6052} bg={MP.nightDeep} dark>
      <g transform={cam(pcx, 560, 1.0)}>
        <MzCHallExt f={f} dark={1} door={seg(f, 40, 80) * 0.6} />
        <Shudouin f={f} dark={1} candle={Math.min(3, nLit)} bell={0} />
        <MzCWinSnow f={f} id={id} wind={0.4} />
        {beds.map((bx, i) => {
          const r = seg(f, i * 3, i * 3 + 9);
          const out = seg(f, 12 + i * 2, 20 + i * 2);
          return (
            <g key={bx}>
              {out < 0.02 && <MzCBedMonk bx={bx} rise={r} f={f} age={ages[i]} phase={i} breath={r} face={r > 0.6 ? "worried" : "normal"} sleepy={i === 3} />}
              <MzCBlanket bx={bx} f={f} rise={r} phase={i} />
            </g>
          );
        })}
        {/* 立った修道士たち (ろうそくを両手で持つ) */}
        {[0, 1, 2, 3].map((i) => {
          const out = seg(f, 12 + i * 2, 20 + i * 2);
          if (out < 0.02) return null;
          const { hipX, hipY } = bedMonkPos(beds[i], 0.95);
          const s = lerp(0.95, 0.85, out);
          const x = lerp(hipX, xs[i], easeOut(out)) + (i === 3 ? bumpOff : 0);
          const y = lerp(hipY + 58 * 0.95, 905, easeOut(out)) - Math.sin(Math.PI * out) * 40;
          const walking = f > 50;
          const step = walking ? Math.abs(Math.sin((f + i * 5) / 4)) * 8 : 0;
          const fat = ages[i] === "old" ? 1.1 : 1;
          return (
            <g key={i}>
              <MzCMonk x={x} y={y - step} s={s} f={f} age={ages[i]} phase={i} pose="hold" breath={1}
                face={i === 3 && bt > 0 && bt < 1 ? "surprised" : "worried"} sleepy={i === 3 && !(bt > 0 && bt < 1)}
                lean={walking ? -4 : 0} shiver={0.25 * shrug} />
              <MzCHandCandle x={x - 4 * s} y={y - step - 112 * s} s={0.8 * s / 0.85} f={f} lit={lit[i]} phase={i} />
              {void fat}
            </g>
          );
        })}
        {/* 火が隣へ分けられる (火の粉の弧) */}
        {[1, 2, 3].map((i) => {
          const t = seg(f, litAt[i] - 6, litAt[i]);
          if (t <= 0 || t >= 1) return null;
          const x0 = xs[i - 1], x1 = xs[i];
          const px = lerp(x0, x1, t), py = 735 - Math.sin(Math.PI * t) * 90;
          return (
            <g key={i}>
              <path d={`M ${x0} 735 Q ${(x0 + x1) / 2} 600 ${px} ${py}`} stroke={MP.flame} strokeWidth={4} fill="none" strokeDasharray="6 10" />
              <circle cx={px} cy={py} r={12} fill={MP.flameCore} stroke={MP.flame} strokeWidth={4} />
            </g>
          );
        })}
        {/* ぽふっ */}
        {bump >= 0 && bt < 1 && (
          <g opacity={1 - bt}>
            {[0, 1, 2, 3, 4].map((k2) => {
              const a = (k2 / 5) * Math.PI * 2;
              const cxp = xs[2] + 50, cyp = 760;
              return <circle key={k2} cx={cxp + Math.cos(a) * (20 + bt * 40)} cy={cyp + Math.sin(a) * (20 + bt * 30)} r={14 + bt * 10} fill={C.breath} stroke={INK} strokeWidth={3} />;
            })}
          </g>
        )}
      </g>
      <TagPlate x={1460} y={160} text="冬" size={46} t={seg(f, 2, 12)} />
      <TagPlate x={1650} y={160} text="夜中" size={46} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #53 すぐ起きられるように、服を着たまま寝ること。
// 格: 並 / seed 6053
// どこ: Shudouin (dark=1, candle=1) の3台目のベッドに寄った大写し。右の壁に木のくぎの服掛け (何も掛かっていない・くもの巣)。足もとの床にサンダルがそろえてある。頭の横の腰掛けにろうそく。
// 演出: 年上の修道士 (白ひげ白髪・少し太め) が黒い頭巾つきの修道服も縄の帯もそのままで、すやすや眠る。毛布は胸まで、布団の外に修道服の袖と手がのぞき、
//       帯の結び目のひもも布団の端から垂れている。カメラは空の服掛けから寝姿へパン。寝たまま片手で頭巾のあごひもをきゅっと直す。
// 動き: f0-36 空の服掛け (寄り) → 寝姿へパンして引く / f44-74 手が頭巾のひもを直す / 寝息の Zzz / ろうそくの炎
const Mz053: React.FC<{ f: number }> = ({ f }) => {
  const bx = 1180;
  const pan = easeInOut(seg(f, 0, 36));
  const k = lerp(2.1, 1.55, pan) + seg(f, 40, 104) * 0.05;
  const cx = lerp(1350, 1185, pan);
  const cy = lerp(600, 680, pan);
  const fix = seg(f, 44, 56) * (1 - seg(f, 66, 76));
  const tug = fix > 0.9 ? Math.sin(f * 1.4) * 4 : 0;
  // 布団の上の手: 胸 → あごひも
  const hx = lerp(bx - 10, bx - 70, fix), hy = lerp(668, 624, fix) + tug;
  return (
    <Frame f={f} seed={6053} bg={MP.nightDeep} dark>
      <g transform={cam(cx, cy, k)}>
        <Shudouin f={f} dark={1} candle={1} bell={0} />
        {/* 壁の服掛け (木のくぎ3本・何も掛かっていない) */}
        <g>
          <rect x={1290} y={590} width={150} height={26} rx={4} fill={MP.wood} stroke={INK} strokeWidth={4} />
          {[1310, 1365, 1420].map((px) => (
            <g key={px}>
              <rect x={px - 6} y={566} width={12} height={28} rx={4} fill={MP.woodDark} stroke={INK} strokeWidth={3} transform={`rotate(-20 ${px} 594)`} />
            </g>
          ))}
          <path d="M 1426 616 L 1446 650 M 1426 616 L 1452 626 M 1436 632 Q 1444 628 1446 638" stroke={KRP.white} strokeWidth={1.6} fill="none" opacity={0.7} />
          <path d={`M 1440 622 q 6 ${8 + Math.sin(f / 12) * 3} 0 16`} stroke={KRP.white} strokeWidth={1.4} fill="none" opacity={0.6} />
        </g>
        {/* 頭の横の腰掛けとろうそく */}
        <rect x={880} y={760} width={100} height={18} fill={MP.wood} stroke={INK} strokeWidth={4} />
        <path d="M 890 778 L 884 840 M 970 778 L 976 840" stroke={MP.woodDark} strokeWidth={10} />
        <circle cx={930} cy={690} r={110} fill={MP.glow} opacity={0.14} />
        <MzCHandCandle x={930} y={760} s={0.9} f={f} />
        {/* 年上の修道士 (服のまま) */}
        <MzCBedMonk bx={bx} rise={0} f={f} age="old" phase={2} strings face="normal" />
        <MzCBlanket bx={bx} f={f} phase={2} />
        {/* 布団の端から垂れる縄の帯のひも */}
        <path d={`M ${bx + 40} 770 q 4 30 -6 ${56 + Math.sin(f / 20) * 2} M ${bx + 52} 770 q 10 26 6 50`} stroke={C.rope} strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={bx + 34} cy={828} r={7} fill={C.rope} stroke={INK} strokeWidth={2.5} />
        {/* 布団の外の袖と手 (もう片方の腕は布団の中) */}
        <path d={`M ${bx + 60} 650 Q ${(bx + 60 + hx) / 2} ${hy + 20} ${hx + 12} ${hy + 4}`} stroke={INK} strokeWidth={32} fill="none" strokeLinecap="round" />
        <path d={`M ${bx + 60} 650 Q ${(bx + 60 + hx) / 2} ${hy + 20} ${hx + 12} ${hy + 4}`} stroke={MP.habit} strokeWidth={24} fill="none" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={12} fill={KRP.white} stroke={INK} strokeWidth={4} />
        {/* サンダル (足もとの床にそろえて) */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${bx + 210 + i * 46} 846)`}>
            <ellipse cx={0} cy={0} rx={18} ry={34} fill={C.sandal} stroke={INK} strokeWidth={4} transform="rotate(80)" />
            <path d="M -14 -6 Q 0 -16 14 -6" stroke={MP.woodDark} strokeWidth={5} fill="none" />
          </g>
        ))}
        {/* Zzz */}
        {[0, 1].map((i) => {
          const t = ((f + i * 25) % 50) / 50;
          return <text key={i} x={bx - 120 + t * 40} y={600 - t * 80} fontFamily={FONT} fontWeight={900} fontSize={34 + i * 8} fill={KRP.white} opacity={0.8 * (1 - t)}>z</text>;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #54 合図があったら、ただちに起きること。
// 格: 山 / seed 6054
// どこ: Shudouin (dark=1, candle=1, bell 0→1) と、左の入口のアーチの下。
// 演出: 修道院長 (白いひげ・首から木の十字架) が右手の鈴をチリンチリン。音の線が寝室じゅうに広がった瞬間、4台のベッドの修道士が
//       トースターのパンのように同時にぴょーんと跳ね起き、毛布が宙に舞い、全員が床に立つ。#53 の年上 (3台目) はそのままサンダルに足を入れて立つ。
//       2台目の若い修道士は勢いあまって頭巾が顔までずり落ち、両手をばたばた。院長は満足げにうなずく。
// 動き: f0-10 院長が鈴を構える / f10- チリン (音の線) / f12-24 全員が同時に跳ね上がって着地 / f0-40 院長の寄りから寝室全体へ引く / f28-36 頭巾ずり落ち・ばたばた / 院長うなずき
const Mz054: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeInOut(seg(f, 0, 40));
  const k = lerp(1.45, 0.82, pull);
  const cx = lerp(-160, 720, pull);
  const cy = lerp(520, 560, pull);
  const ring = seg(f, 8, 12);
  const pop1 = seg(f, 12, 24);
  const beds = [300, 740, 1180, 1620];
  const ages: ("old" | "young")[] = ["young", "young", "old", "old"];
  const ax = -260, ay = 905, as = 1.05;
  const grip: [number, number] = [ax + 153 * as * 1.1, ay - 148 * as];
  const nod = f > 30 ? Math.sin(f / 5) * 3 : 0;
  const hoodSlip = seg(f, 28, 34);
  return (
    <Frame f={f} seed={6054} bg={MP.nightDeep} dark>
      <g transform={cam(cx, cy, k)}>
        <MzCHallExt f={f} dark={1} />
        <Shudouin f={f} dark={1} candle={1} bell={ring} />
        {beds.map((bx, i) => (
          <g key={bx}>
            {pop1 < 0.02 && <MzCBedMonk bx={bx} rise={0} f={f} age={ages[i]} phase={i} />}
            <MzCBlanket bx={bx} f={f} rise={pop1 > 0 ? 0.5 : 0} lift={Math.sin(Math.PI * pop1) * 1.1} phase={i} />
          </g>
        ))}
        {/* 跳ね起きた修道士たち */}
        {pop1 > 0.02 && beds.map((bx, i) => {
          const { hipX, hipY } = bedMonkPos(bx, 0.95);
          const t = pop1;
          const x = lerp(hipX, bx + 110, t);
          const yBase = lerp(hipY + 55, 905, t);
          const y = yBase - Math.sin(Math.PI * t) * 260;
          const rot = lerp(-82, 0, clamp01(t * 2.2));
          const s = lerp(0.95, 0.88, t);
          const flail = i === 1 && hoodSlip > 0.3;
          return (
            <g key={i}>
              <MzCMonk x={x} y={y} s={s} f={f} age={ages[i]} phase={i} rot={rot}
                pose={flail ? (Math.floor(f / 4) % 2 ? "banzai" : "raise") : t < 1 ? "banzai" : "stand"}
                face={flail ? "worried" : "surprised"} hood={i === 1 ? hoodSlip : 0}
                shiver={flail ? 0.6 : 0} />
              {/* 跳ね上がりの線 */}
              {t > 0.05 && t < 0.7 && (
                <path d={`M ${x - 40} ${y + 40} l 0 70 M ${x} ${y + 50} l 0 90 M ${x + 40} ${y + 40} l 0 70`} stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
              )}
            </g>
          );
        })}
        {/* 3台目の年上: サンダル (足もと) */}
        {[0, 1].map((j) => (
          <ellipse key={j} cx={1290 + (j - 0.5) * 60 + (pop1 >= 1 ? 0 : 30)} cy={908} rx={22} ry={9} fill={C.sandal} stroke={INK} strokeWidth={3.5} />
        ))}
        {/* ばたばたの線 */}
        {hoodSlip > 0.3 && (
          <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d="M 740 560 q -20 -14 -30 -40 M 920 560 q 20 -14 30 -40 M 700 620 l -30 -6 M 960 620 l 30 -6" />
          </g>
        )}
        {/* 修道院長 */}
        <MzCMonk x={ax} y={ay} s={as} f={f} age="old" cross pose="point" pointDir={1} face="smile" phase={7} lean={nod} />
        <MzCHandBell x={grip[0]} y={grip[1]} s={1.1} swing={Math.sin(f * 1.4) * 30 * ring} />
        <MzCSound x={grip[0]} y={grip[1] + 50} r={70} amt={ring} f={f} side={1} color={MP.glow} w={9} />
        <MzCSound x={grip[0]} y={grip[1] + 50} r={70} amt={ring} f={f} side={-1} color={MP.glow} w={9} />
        {/* 寝室に広がる音の輪 */}
        {ring > 0 && [0, 1, 2].map((k2) => {
          const t = ((f - 10 + k2 * 10) % 30) / 30;
          return <circle key={k2} cx={grip[0]} cy={grip[1] + 50} r={100 + t * 1400} fill="none" stroke={MP.glow} strokeWidth={8 - t * 6} opacity={(1 - t) * 0.5 * ring} />;
        })}
      </g>
    </Frame>
  );
};

// ===== 真上から見た石の床と木のベッド (#55・#57) =====
const MzCTopFloor: React.FC<{ seed: number; tile?: number }> = ({ seed, tile = 180 }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1880} fill={MP.stoneDark} />
    {Array.from({ length: Math.ceil(1880 / tile) }, (_, r) => Array.from({ length: Math.ceil(2720 / tile) + 1 }, (_, c) => {
      const off = r % 2 ? tile / 2 : 0;
      const v = (r * 7 + c * 3 + seed) % 6;
      return <rect key={`${r}-${c}`} x={-400 + c * tile - off + 4} y={-400 + r * tile + 4} width={tile - 8} height={tile - 8} rx={10}
        fill={v === 0 ? MP.stoneLight : v === 3 ? mixColor(MP.stone, MP.stoneDark, 0.3) : MP.stone} />;
    }))}
  </g>
);
const MzCTopBed: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x - w / 2 + 10} y={y + 14} width={w} height={h} rx={10} fill={INK} opacity={0.25} />
    <rect x={x - w / 2} y={y} width={w} height={h} rx={10} fill={MP.wood} stroke={INK} strokeWidth={5} />
    <rect x={x - w / 2 + w * 0.08} y={y + h * 0.03} width={w * 0.84} height={h * 0.94} rx={14} fill={C.straw} stroke={INK} strokeWidth={4} />
    {Array.from({ length: 8 }, (_, i) => (
      <line key={i} x1={x - w * 0.3 + (i % 4) * w * 0.18} y1={y + h * (0.1 + i * 0.11)} x2={x - w * 0.22 + (i % 4) * w * 0.18} y2={y + h * (0.13 + i * 0.11)} stroke={C.strawDark} strokeWidth={3} />
    ))}
    <rect x={x - w * 0.36} y={y + h * 0.05} width={w * 0.72} height={h * 0.15} rx={w * 0.12} fill={C.egg} stroke={INK} strokeWidth={4} />
    <path d={`M ${x - w * 0.26} ${y + h * 0.17} q ${w * 0.26} ${-h * 0.03} ${w * 0.52} 0`} stroke={C.parchDark} strokeWidth={3} fill="none" />
  </g>
);
// 真上から見た毛布 (y0 から下)
const MzCTopBlanket: React.FC<{ x: number; y0: number; y1: number; w: number; f: number; phase?: number; back?: number }> = ({ x, y0, y1, w, f, phase = 0, back = 0 }) => {
  const b = Math.sin((f + phase * 21) / 14) * 3;
  const top = lerp(y0, y1 - (y1 - y0) * 0.45, back) + b;
  return (
    <g>
      <path d={`M ${x - w / 2} ${top + 10} Q ${x} ${top - 14} ${x + w / 2} ${top + 10} L ${x + w / 2 + 4} ${y1} L ${x - w / 2 - 4} ${y1} Z`} fill={C.blanket} stroke={INK} strokeWidth={4.5} />
      <path d={`M ${x - w / 2} ${top + 10} Q ${x} ${top - 14} ${x + w / 2} ${top + 10} L ${x + w / 2} ${top + 34} Q ${x} ${top + 12} ${x - w / 2} ${top + 34} Z`} fill={MP.stoneLight} stroke={INK} strokeWidth={3.5} />
      <path d={`M ${x - w * 0.2} ${top + 60} q 8 ${(y1 - top) * 0.3} 0 ${(y1 - top) * 0.6} M ${x + w * 0.22} ${top + 70} q -8 ${(y1 - top) * 0.25} 0 ${(y1 - top) * 0.5}`} stroke={C.blanketDark} strokeWidth={3} fill="none" />
    </g>
  );
};

// -------------------------------------------------------------------
// #55 さらに、若い修道士は、年上の修道士のあいだに寝かせること。
// 格: 図 / seed 6055
// どこ: Shudouin の寝室を真上から見下ろす。石の床の敷石・ろうそく。床の上に、写本の挿絵のような茶色いインクの飾り枠と矢印が重なる。
// 演出: ベッドが3台ずつ3列。各列の左右に年上 (白ひげ白髪・少し太め) が寝ていて、真ん中だけ空き (インクの点線のパズルの穴)。
//       下からインクの矢印が伸び、若い修道士 (黒髪) がパズルのピースのように毛布ごと1人ずつすぽっとはまる。はまった若者は左右の年上を交互に見て、ごくり (冷や汗)。
// 動き: f0-6 全景 / f6-16・f16-26・f26-36 3人が順にはまる / f36- きょろきょろ・ごくり / f40-157 真ん中の列へ少し寄る
const CL55 = [440, 960, 1480];
const Mz055: React.FC<{ f: number }> = ({ f }) => {
  const zoom = easeInOut(seg(f, 40, 157));
  const k = 1 + 0.22 * zoom;
  const BW = 148, BY = 300, BH = 360, S = 0.6;
  const look = f > 36 ? (Math.floor((f - 36) / 9) % 2 ? 9 : -9) : 0;
  return (
    <Frame f={f} seed={6055} bg={MP.stoneDark}>
      <g transform={cam(960, lerp(500, 480, zoom), k)}>
        <MzCTopFloor seed={55} />
        <rect x={-400} y={-400} width={2720} height={1880} fill={MP.nightDeep} opacity={0.22} />
        {/* インクの飾り枠 (写本の余白の飾りが床に広がった) */}
        <rect x={140} y={200} width={1640} height={570} rx={16} fill="none" stroke={C.inkBrown} strokeWidth={7} />
        <rect x={160} y={220} width={1600} height={530} rx={10} fill="none" stroke={C.inkBrown} strokeWidth={3} strokeDasharray="14 10" />
        {[[140, 200], [1780, 200], [140, 770], [1780, 770]].map(([qx, qy], i) => (
          <g key={i} stroke={C.inkBrown} strokeWidth={5} fill="none" strokeLinecap="round">
            <path d={`M ${qx} ${qy} q ${qx < 900 ? 40 : -40} ${qy < 500 ? -50 : 50} ${qx < 900 ? 90 : -90} ${qy < 500 ? -20 : 20}`} />
            <circle cx={qx + (qx < 900 ? 96 : -96)} cy={qy + (qy < 500 ? -22 : 22)} r={9} fill={C.gold} />
            <path d={`M ${qx} ${qy} q ${qx < 900 ? -50 : 50} ${qy < 500 ? 40 : -40} ${qx < 900 ? -20 : 20} ${qy < 500 ? 90 : -90}`} />
          </g>
        ))}
        {/* 床のろうそく (列のあいだ) */}
        {[700, 1220].map((px, i) => (
          <g key={px}>
            <circle cx={px} cy={720} r={70} fill={MP.glow} opacity={0.22 + 0.06 * Math.sin(f / 4 + i)} />
            <circle cx={px} cy={720} r={20} fill={MP.iron} stroke={INK} strokeWidth={3} />
            <circle cx={px} cy={720} r={11} fill="#F4ECD4" stroke={INK} strokeWidth={2.5} />
            <circle cx={px + Math.sin(f / 3 + i) * 1.5} cy={720} r={5} fill={MP.flame} />
          </g>
        ))}
        {CL55.map((cx, ci) => {
          const ins = easeOut(seg(f, 6 + ci * 10, 16 + ci * 10));
          const snap = seg(f, 15 + ci * 10, 19 + ci * 10);
          const dy = (1 - ins) * 560;
          return (
            <g key={cx}>
              {[-1, 0, 1].map((j) => <MzCTopBed key={j} x={cx + j * 162} y={BY} w={BW} h={BH} />)}
              {/* 左右の年上 */}
              {[-1, 1].map((j) => (
                <g key={j}>
                  <MzCMonk x={cx + j * 162} y={520} s={S} f={f} age="old" phase={ci * 3 + j + 4} gaze={[j * -6, 0]}
                    face="normal" still asleep />
                  <MzCTopBlanket x={cx + j * 162} y0={440} y1={650} w={130} f={f} phase={ci + j} />
                </g>
              ))}
              {/* 真ん中の空き (パズルの穴) */}
              {ins < 1 && (
                <path d={`M ${cx - 66} 310 h 46 a 20 20 0 0 0 40 0 h 46 v 150 a 20 20 0 0 1 0 40 v 150 h -132 v -150 a 20 20 0 0 0 0 -40 Z`}
                  fill="none" stroke={C.inkBrown} strokeWidth={5} strokeDasharray="12 9" opacity={1 - ins} />
              )}
              {/* インクの矢印 */}
              {f > ci * 10 && (
                <g opacity={1 - seg(f, 18 + ci * 10, 30 + ci * 10) * 0.6}>
                  <path d={`M ${cx - 120} 1000 Q ${cx - 140} 800 ${cx} ${lerp(980, 700, seg(f, ci * 10, 8 + ci * 10))}`} stroke={C.inkBrown} strokeWidth={8} fill="none" strokeLinecap="round" />
                  <path d={`M ${cx - 22} ${lerp(980, 700, seg(f, ci * 10, 8 + ci * 10)) + 26} L ${cx} ${lerp(980, 700, seg(f, ci * 10, 8 + ci * 10))} L ${cx + 22} ${lerp(980, 700, seg(f, ci * 10, 8 + ci * 10)) + 26}`} stroke={C.inkBrown} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
              {/* はめこまれる若い修道士 (毛布ごと1枚のピース) */}
              {ins > 0 && (
                <g transform={`translate(0 ${dy}) rotate(${(1 - ins) * 8} ${cx} 480) translate(${cx} 480) scale(${1 + Math.sin(Math.PI * snap) * 0.08}) translate(${-cx} -480)`}>
                  <MzCMonk x={cx} y={520} s={S * 0.92} f={f} age="young" phase={ci + 11} gaze={[look, 0]}
                    face={f > 36 ? "worried" : "surprised"} still />
                  <MzCTopBlanket x={cx} y0={440} y1={650} w={122} f={f} phase={ci + 5} />
                  {/* ごくり (のどの線) と冷や汗 */}
                  {f > 38 && (
                    <g>
                      <path d={`M ${cx - 10} ${520 - 104 * S + Math.sin(f / 3) * 3} q 10 6 20 0`} stroke={INK} strokeWidth={3} fill="none" />
                      <path d={`M ${cx + 38} ${380 + ((f * 2) % 30)} q -7 10 0 14 q 7 -4 0 -14 Z`} fill={C.sweat} stroke={INK} strokeWidth={2} />
                    </g>
                  )}
                </g>
              )}
              {/* すぽっ (はまった瞬間の光) */}
              {snap > 0 && snap < 1 && [0, 1, 2, 3, 4, 5].map((k2) => {
                const a = (k2 / 6) * Math.PI * 2;
                return <line key={k2} x1={cx + Math.cos(a) * 90} y1={480 + Math.sin(a) * 200} x2={cx + Math.cos(a) * (110 + snap * 40)} y2={480 + Math.sin(a) * (220 + snap * 40)} stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={1 - snap} />;
              })}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #56 理由は、寝坊の言い訳を、させないためです。
// 格: 並 / seed 6056
// どこ: Shudouin (dark=1, candle=2, bell 1→0) の鈴が鳴り終わった直後。左から3台のベッドに寄る。
// 演出: 左右の年上 (白ひげ白髪・少し太め) はもう上半身を起こして腕組み。真ん中の若い修道士だけ毛布の中で、寝ぼけまなこで「言い訳」の吹き出しをぷうっとふくらませる
//       (中身は絵: ×の付いた耳=鈴が聞こえなかった / 閉じた目)。左右の2人が同時に眉をくいっと上げてじーっと見つめると、吹き出しはしゅるしゅるとしぼみ、ぷすっと消える。
//       若者は観念して毛布を顔まで引き上げる。
// 動き: f0-12 吹き出しがふくらむ / f12-18 2人の眉が上がる・じーっの線 / f22-46 しぼむ / f46-52 ぷすっ / f56-76 毛布を引き上げる / カメラは3人の顔へゆっくり寄る
const Mz056: React.FC<{ f: number }> = ({ f }) => {
  const k = 1.3 + 0.15 * seg(f, 20, 111);
  const inflate = easeOut(seg(f, 0, 12));
  const stare = seg(f, 12, 18);
  const defl = seg(f, 22, 62);
  const gone = f >= 64;
  const pst = seg(f, 62, 70);
  const cover = easeInOut(seg(f, 72, 92));
  const br = 125 * inflate * (1 - 0.7 * defl);
  const bcx = 760, bcy = 440 + defl * 40;
  const wob = defl * 7;
  const bubble = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const rr = br + Math.sin(i * 2.7 + f / 2) * wob;
    return `${i ? "L" : "M"} ${bcx + Math.cos(a) * rr * 1.25} ${bcy + Math.sin(a) * rr}`;
  }).join(" ") + " Z";
  return (
    <Frame f={f} seed={6056} bg={MP.nightDeep} dark>
      <g transform={cam(740, 600, k)}>
        <Shudouin f={f} dark={1} candle={2} bell={1 - seg(f, 0, 10)} />
        {[300, 1180].map((bx, i) => (
          <g key={bx}>
            <MzCBedMonk bx={bx} rise={1} f={f} age="old" phase={i * 2} pose="armsFolded"
              face={stare > 0.5 ? "surprised" : "normal"} gaze={[i === 0 ? 8 : -8, 0]} />
            <MzCBlanket bx={bx} f={f} rise={1} phase={i} />
          </g>
        ))}
        {/* じーっ (視線の点線) */}
        {stare > 0 && !gone && [[360, 500], [1240, 500]].map(([ex, ey], i) => (
          <path key={i} d={`M ${ex + (i ? -60 : 60)} ${ey} L ${i ? 860 : 620} ${bcy + 10}`} stroke={KRP.white} strokeWidth={4} strokeDasharray="10 10" opacity={0.7 * stare} />
        ))}
        {/* 真ん中の若い修道士 */}
        <MzCBedMonk bx={740} rise={0} f={f} age="young" phase={5} asleep={false} sleepy={!gone} face={gone ? "worried" : "normal"} />
        <MzCBlanket bx={740} f={f} phase={5} cover={cover} />
        {cover > 0.5 && (
          <g>
            {/* 毛布のふちをつかむ手 */}
            <circle cx={lerp(680, 600, cover)} cy={lerp(660, 630, cover)} r={11} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <circle cx={lerp(700, 630, cover)} cy={lerp(664, 634, cover)} r={11} fill={KRP.white} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {/* 言い訳の吹き出し */}
        {!gone && inflate > 0 && (
          <g>
            <circle cx={660} cy={600} r={10 * inflate} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <circle cx={690} cy={560} r={16 * inflate} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <path d={bubble} fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <g transform={`translate(${bcx} ${bcy}) scale(${br / 125})`}>
              {/* ×の付いた耳 */}
              <path d="M -70 -50 Q -20 -56 -22 0 Q -24 30 -48 40 Q -60 46 -62 30" fill={KRP.white} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <path d="M -54 -22 Q -36 -24 -40 0" stroke={INK} strokeWidth={4} fill="none" />
              <path d="M -84 -50 L -10 34 M -10 -50 L -84 34" stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
              {/* 閉じた目 */}
              <path d="M 22 0 Q 56 26 90 0" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
              <path d="M 30 10 l -8 14 M 56 18 l 0 16 M 82 10 l 8 14" stroke={INK} strokeWidth={5} strokeLinecap="round" />
            </g>
            {/* しゅるしゅる (空気がぬける) */}
            {defl > 0.05 && [0, 1].map((k2) => {
              const t = ((f + k2 * 8) % 16) / 16;
              return <path key={k2} d={`M ${bcx + br * 1.2 + t * 60} ${bcy - 20 + k2 * 30} q 14 -14 0 -24 q -14 -10 0 -24`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={1 - t} />;
            })}
          </g>
        )}
        {/* ぷすっ */}
        {pst > 0 && pst < 1 && (
          <g opacity={1 - pst}>
            {[0, 1, 2, 3, 4].map((k2) => {
              const a = (k2 / 5) * Math.PI * 2;
              return <circle key={k2} cx={bcx + Math.cos(a) * (10 + pst * 50)} cy={bcy + Math.sin(a) * (10 + pst * 40)} r={10} fill={MP.stoneLight} stroke={INK} strokeWidth={3} />;
            })}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #57 両側から、起こされます。
// 格: 山 / seed 6057
// どこ: 修道院の寝室の寝床を真上から大写し (Shudouin と同じ石の床・木のベッド・わら)。3台がくっついて並び、左上のろうそくの光で影が揺れる。
// 演出: 真ん中の若い修道士 (黒髪・頭巾の修道服・縄の帯) が服のまま爆睡。院長の鈴 (右上から音の線) が鳴った瞬間、左右の年上 (白ひげ白髪・少し太め) が
//       同時に起き上がって身を乗り出し、人さし指で若者の両ほおを同時にぷにっ。若者は目をむき、やがて跳ね起きて頭巾がずれる。年上2人は「よし」とうなずく。
// 動き: f0-10 鈴の音の線 / f8-15 左右同時につつく (ほおがへこむ) / f15- 若者がびっくり / f10-42 若者の顔へぐっと寄る / f50-60 跳ね起きる / f54- うなずき
const Mz057: React.FC<{ f: number }> = ({ f }) => {
  const k = 1 + 0.32 * easeInOut(seg(f, 10, 42)) + 0.05 * seg(f, 42, 69);
  const cy = lerp(540, 420, easeInOut(seg(f, 10, 42)));
  const BXS = [530, 960, 1390], BW = 430;
  const S = 1.1;
  const yHead = 380;
  const rise = easeOut(seg(f, 6, 12));
  const touch = seg(f, 12, 15);
  const jump = seg(f, 50, 60);
  const nod = f > 54 ? Math.sin((f - 54) / 3) * 5 : 0;
  const sO = lerp(S, 1.18, rise);
  // 指先 = 若者のほお
  const cheekL: [number, number] = [960 - 60 * S, yHead + 22], cheekR: [number, number] = [960 + 60 * S, yHead + 22];
  const reach = 153 * sO * 1.1;
  const oldPos = (side: -1 | 1) => {
    const [tx, ty] = side === -1 ? cheekL : cheekR;
    const back = (1 - touch) * 50;
    const fx = tx + side * (reach + back), fy = ty + 148 * sO;
    return [lerp(BXS[side === -1 ? 0 : 2], fx, rise), lerp(yHead + 228 * S, fy, rise)] as const;
  };
  const yS = 1 + jump * 0.12;
  return (
    <Frame f={f} seed={6057} bg={MP.stoneDark}>
      <g transform={cam(960, cy, k)}>
        <MzCTopFloor seed={57} tile={240} />
        {BXS.map((bx) => <MzCTopBed key={bx} x={bx} y={90} w={BW} h={1060} />)}
        {/* ろうそくの光と揺れる影 */}
        <circle cx={60} cy={60} r={420} fill={MP.glow} opacity={0.14 + 0.03 * Math.sin(f / 3)} />
        <rect x={-400} y={-400} width={2720} height={1880} fill={MP.nightDeep} opacity={0.3} />
        {/* 真ん中の若者 */}
        <g transform={`translate(960 ${yHead}) scale(${yS}) translate(-960 ${-yHead})`}>
          {jump > 0 && <ellipse cx={960} cy={yHead + 160} rx={130 * (1 - jump * 0.3)} ry={60} fill={INK} opacity={0.15} />}
          <MzCMonk x={960} y={yHead + 228 * S - jump * 30} s={S} f={f} age="young" phase={3}
            face={touch > 0.5 ? "surprised" : "normal"} hood={jump * 0.35} still asleep={touch < 0.5} />
          <MzCTopBlanket x={960} y0={yHead + 120} y1={1150} w={360} f={f} phase={3} back={jump} />
          {/* 爆睡のよだれ と Zzz */}
          {touch < 0.5 && <path d={`M ${960 + 12} ${yHead + 46} q 4 14 0 20`} stroke={C.sweat} strokeWidth={5} fill="none" strokeLinecap="round" />}
          {touch < 0.5 && <text x={1060} y={yHead - 120 - (f % 20) * 2} fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.white} opacity={0.8}>Z</text>}
        </g>
        {/* 左右の年上 (起き上がってつつく) */}
        {([-1, 1] as const).map((side) => {
          const [ox, oy] = oldPos(side);
          return (
            <g key={side}>
              <MzCTopBlanket x={BXS[side === -1 ? 0 : 2]} y0={yHead + 120} y1={1150} w={360} f={f} phase={side + 4} back={rise} />
              <MzCMonk x={ox} y={oy} s={sO} f={f} age="old" phase={side + 6} pose={rise > 0.3 ? "point" : "stand"} pointDir={side === -1 ? 1 : -1}
                face={f > 54 ? "smile" : "normal"} gaze={[side * -8, 4]} lean={nod * (side === -1 ? 1 : -1)} still />
            </g>
          );
        })}
        {/* ぷにっ (ほおのへこみ) */}
        {touch > 0.5 && jump < 0.3 && [cheekL, cheekR].map(([px, py], i) => (
          <g key={i}>
            <path d={`M ${px + (i ? -14 : 14)} ${py - 18} Q ${px + (i ? -26 : 26)} ${py} ${px + (i ? -14 : 14)} ${py + 18}`} stroke={INK} strokeWidth={4} fill="none" />
            {[0, 1, 2].map((k2) => (
              <line key={k2} x1={px + (i ? 30 : -30)} y1={py - 40 + k2 * 40} x2={px + (i ? 52 : -52)} y2={py - 56 + k2 * 56}
                stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 15, 30) * 0.5} />
            ))}
          </g>
        ))}
        {/* 目をむく線 */}
        {touch > 0.5 && (
          <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round">
            <line x1={960} y1={yHead - 90 * S} x2={960} y2={yHead - 130 * S} />
            <line x1={900} y1={yHead - 80 * S} x2={880} y2={yHead - 116 * S} />
            <line x1={1020} y1={yHead - 80 * S} x2={1040} y2={yHead - 116 * S} />
          </g>
        )}
      </g>
      {/* 院長の鈴 (画面の右上の外から) */}
      <MzCSound x={1900} y={110} r={60} amt={1 - seg(f, 12, 24)} f={f} side={-1} color={MP.glow} w={10} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #58 そして、合図を出して、みんなの起きる時刻を決めたのは、修道院長か、院長が任せた修道士でした。
// 格: 山 / seed 6058
// どこ: Shudouin (dark=0.8, candle=2, bell=1) と左の入口のアーチの下。窓の外はまだ真っ暗。
// 演出: 修道院長 (白ひげ・木の十字架。右手に鈴を掲げ、左手にろうそく立て) が鈴を振ると、奥 (右) のベッドから順に修道士がむくむく起き上がる (ドミノ)。
//       院長の右には、鈴を任される中年の修道士 (黒髪に白まじり・短い灰色のひげ) が手を差し出して小さく立つ。院長の頭の右上の暗がりに NazoBell の「?」がぽっと浮かぶ
//       (この院長は、誰が起こしたのか)。鈴は院長の手から係の手へ渡る。カメラは院長から寝床の列の奥へ横にパン。
// 動き: f0-10 鈴を振る / f6-38 奥から順に起き上がる (8fずつ) / f34-42 NazoBell / f50-72 鈴が係の手へ / f60-220 カメラが奥へパン
const Mz058: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 60, 220));
  const k = lerp(0.8, 1.05, pan) + seg(f, 0, 45) * 0.03;
  const cx = lerp(650, 1330, pan);
  const cy = lerp(560, 600, pan);
  const beds = [300, 740, 1180, 1620];
  const ages: ("young" | "old")[] = ["young", "old", "young", "old"];
  const ax = -270, ay = 905, as = 1.05;
  const grip: [number, number] = [ax + 153 * as * 1.1, ay - 148 * as];
  const dx = 110, ds = 0.86;
  const dGrip: [number, number] = [dx - 153 * ds + 10, ay - 148 * ds];
  const hand = easeInOut(seg(f, 50, 72));
  const reachP = seg(f, 36, 46);
  const bellPos: [number, number] = [lerp(grip[0], dGrip[0], hand), lerp(grip[1], dGrip[1], hand) - Math.sin(Math.PI * hand) * 50];
  const ringAmt = 1 - seg(f, 46, 56) + seg(f, 76, 84);
  const sw = Math.sin(f * 1.4) * 28 * clamp01(ringAmt);
  return (
    <Frame f={f} seed={6058} bg={MP.nightDeep} dark>
      <g transform={cam(cx, cy, k)}>
        <MzCHallExt f={f} dark={0.8} />
        <Shudouin f={f} dark={0.8} candle={2} bell={1} />
        {beds.map((bx, i) => {
          const st = 6 + (3 - i) * 8;
          const r = easeOut(seg(f, st, st + 10));
          return (
            <g key={bx}>
              <MzCBedMonk bx={bx} rise={r} f={f} age={ages[i]} phase={i} face={r > 0.8 ? (i % 2 ? "normal" : "worried") : "normal"}
                gaze={r > 0.8 ? [-8, 0] : [0, 0]} breath={r * 0.6} />
              <MzCBlanket bx={bx} f={f} rise={r} phase={i} />
              {r > 0 && r < 1 && <path d={`M ${bx + 130} 560 q 20 -30 0 -60 M ${bx + 160} 580 q 20 -30 0 -60`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - r} />}
            </g>
          );
        })}
        {/* 修道院長 */}
        <MzCMonk x={ax} y={ay} s={as} f={f} age="old" cross pose="point" pointDir={1} face="smile" phase={7} />
        <MzCHandCandle x={ax - 67 * as * 1.1} y={ay - 66 * as} s={1} f={f} phase={3} />
        {/* 任された中年の修道士 (手を差し出す) */}
        <MzCMonk x={dx} y={ay} s={ds} f={f} age="mid" phase={9} pose={reachP > 0.5 ? "point" : "stand"} pointDir={-1}
          face={hand > 0.9 ? "smile" : "surprised"} gaze={[-8, -4]} />
        {/* 鈴 (院長の手 → 係の手) */}
        <MzCHandBell x={bellPos[0]} y={bellPos[1]} s={1.05} swing={sw} />
        <MzCSound x={bellPos[0]} y={bellPos[1] + 50} r={66} amt={clamp01(ringAmt)} f={f} side={1} color={MP.glow} w={9} />
        <MzCSound x={bellPos[0]} y={bellPos[1] + 50} r={66} amt={clamp01(ringAmt)} f={f} side={-1} color={MP.glow} w={9} />
        {hand > 0 && hand < 1 && <path d={`M ${grip[0]} ${grip[1] - 20} Q ${(grip[0] + dGrip[0]) / 2} ${grip[1] - 110} ${dGrip[0]} ${dGrip[1] - 20}`} stroke={MP.glow} strokeWidth={4} strokeDasharray="10 10" fill="none" opacity={0.7} />}
        {/* ナゾベル: この院長は、誰が起こしたのか */}
        <g transform={`translate(${ax + 170} ${ay - 380}) scale(${pop(seg(f, 34, 42))}) translate(${-(ax + 170)} ${-(ay - 380)})`}>
          <circle cx={ax + 170} cy={ay - 380} r={70} fill={MP.glow} opacity={0.18} />
          <NazoBell x={ax + 170} y={ay - 380 + Math.sin(f / 12) * 6} s={0.62} f={f} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #59 鶏人も、修道院も。起きる時刻を決めていたのは、自分の体ではなく、他人です。
// 格: 山 / seed 6059
// どこ: 画面を斜めの線で左右に割った2つの夜明け前。左=古代中国の宮殿 (朱塗りの柱・金の帯・反った瓦屋根・石段・ちょうちん)、右=Shudouin (dark=0.8, candle=1, bell=1)。札「鶏人」「修道院長」。
// 演出: 左で鶏人 (赤い頭巾・とさかの赤い冠・長い袖・男性) が口を大きく開けて叫び、右で修道院長が鈴を振る。2人の音のギザギザ線が真ん中へ伸び、
//       境目の上のわら布団で寝ている素朴な服の男に左右から突き刺さる。男は飛び起き、自分の胸に手を当てて「?」、左右の2人を交互に見て、肩をすくめる。
// 動き: f0-14 左右の声と鈴・線が伸びる / f14-20 飛び起きる / f20-32 胸に手 + ? / f32-44 左右を見る / f44- 肩をすくめる / f40-120 真ん中の男へ寄る
const Mz059: React.FC<{ f: number }> = ({ f }) => {
  const id = useCid("mzc59");
  const zoom = easeInOut(seg(f, 40, 120));
  const k = 1 + 0.28 * zoom;
  const cy = lerp(540, 600, zoom);
  const shoot = seg(f, 2, 14);
  const up = easeOut(seg(f, 14, 20));
  const hit = seg(f, 12, 16);
  const mx = 960, my = 870;
  const look = f < 32 ? 0 : f < 44 ? (Math.floor((f - 32) / 6) % 2 ? 9 : -9) : 0;
  const shrug = f >= 44;
  const lineTo = (x0: number, y0: number, t: number) => {
    const n = 7;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * t;
      const px = lerp(x0, mx, u), py = lerp(y0, my - 250, u) + (i % 2 ? -22 : 22) * (i > 0 && i < n ? 1 : 0);
      pts.push(`${i ? "L" : "M"} ${px} ${py}`);
    }
    return pts.join(" ");
  };
  const kx = 330, ky = 860, ks = 1.1;
  const ax = 1610, ay = 870, as = 1.08;
  const grip: [number, number] = [ax - 153 * as * 1.1, ay - 148 * as];
  return (
    <Frame f={f} seed={6059} bg={MP.nightDeep} dark>
      <g transform={cam(960, cy, k)}>
        <defs>
          <clipPath id={id + "L"}><polygon points="-400,-400 1160,-400 760,1500 -400,1500" /></clipPath>
          <clipPath id={id + "R"}><polygon points="1160,-400 2400,-400 2400,1500 760,1500" /></clipPath>
        </defs>
        {/* 左: 古代中国の宮殿の夜明け前 */}
        <g clipPath={`url(#${id}L)`}>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={-400} y={-400 + i * 130} width={1600} height={131} fill={mixColor(C.nightSky, mixColor(MP.night, MP.dawn, 0.5), Math.pow(i / 9, 1.5))} />
          ))}
          {/* 反った瓦屋根 */}
          <path d="M -400 160 Q 200 120 900 130 Q 1060 120 1140 60 L 1160 110 Q 1060 200 900 210 L -400 230 Z" fill={C.palaceRoof} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-360 + i * 90} y1={150 - i * 1.5} x2={-350 + i * 90} y2={222 - i * 1.5} stroke={INK} strokeWidth={3} opacity={0.5} />)}
          <rect x={-400} y={226} width={1560} height={26} fill={C.vermDark} stroke={INK} strokeWidth={4} />
          {/* 朱塗りの柱 */}
          {[60, 560, 960].map((px) => (
            <g key={px}>
              <rect x={px - 46} y={250} width={92} height={560} fill={C.verm} stroke={INK} strokeWidth={6} />
              <rect x={px - 46} y={290} width={92} height={22} fill={C.gold} stroke={INK} strokeWidth={4} />
              <rect x={px - 30} y={260} width={14} height={540} fill={KRP.white} opacity={0.18} />
              <rect x={px - 60} y={800} width={120} height={30} fill={MP.stone} stroke={INK} strokeWidth={4} />
            </g>
          ))}
          {/* ちょうちん */}
          <g transform={`rotate(${Math.sin(f / 15) * 4} 800 252)`}>
            <line x1={800} y1={252} x2={800} y2={300} stroke={INK} strokeWidth={4} />
            <ellipse cx={800} cy={350} rx={42} ry={54} fill={C.verm} stroke={INK} strokeWidth={5} />
            <ellipse cx={800} cy={350} rx={24} ry={40} fill={MP.flame} opacity={0.6} />
            <rect x={780} y={296} width={40} height={10} fill={C.gold} stroke={INK} strokeWidth={3} />
          </g>
          {/* 石段 */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-400} y={830 + i * 60} width={1600} height={62} fill={i % 2 ? MP.stone : MP.stoneLight} stroke={INK} strokeWidth={4} />
          ))}
          <rect x={-400} y={-400} width={1600} height={1900} fill={MP.nightDeep} opacity={0.25} />
          {/* 鶏人 (赤い頭巾・とさかの冠・長い袖) */}
          <g>
            <circle cx={kx} cy={ky - 228 * ks} r={84 * ks} fill={C.keijin} stroke={INK} strokeWidth={5} />
            <Person x={kx} y={ky} s={ks} f={f} phase={4} cloth={C.keijin} clothDark={C.keijinDark} hair="none" face="joy" pose="hold" lean={-4} />
            <path d={`M ${kx - 60 * ks} ${ky - 68 * ks} L ${kx - 78 * ks} ${ky - 6 * ks} Q ${kx} ${ky + 4 * ks} ${kx + 78 * ks} ${ky - 6 * ks} L ${kx + 60 * ks} ${ky - 68 * ks} Z`} fill={C.keijin} stroke={INK} strokeWidth={5} />
            {/* 長い袖 */}
            {[-1, 1].map((sd) => (
              <path key={sd} d={`M ${kx + sd * 8 * ks} ${ky - 126 * ks} L ${kx + sd * 46 * ks} ${ky - 126 * ks} L ${kx + sd * 52 * ks} ${ky - 40 * ks} Q ${kx + sd * 30 * ks} ${ky - 30 * ks} ${kx + sd * 14 * ks} ${ky - 50 * ks} Z`} fill={C.keijinDark} stroke={INK} strokeWidth={4} />
            ))}
            {/* 頭巾のふち */}
            <path d={`M ${kx - 72 * ks} ${ky - 230 * ks} Q ${kx - 76 * ks} ${ky - 314 * ks} ${kx} ${ky - 316 * ks} Q ${kx + 76 * ks} ${ky - 314 * ks} ${kx + 72 * ks} ${ky - 230 * ks} Q ${kx + 62 * ks} ${ky - 268 * ks} ${kx} ${ky - 272 * ks} Q ${kx - 62 * ks} ${ky - 268 * ks} ${kx - 72 * ks} ${ky - 230 * ks} Z`} fill={C.keijin} stroke={INK} strokeWidth={5} />
            {/* とさかの冠 */}
            <g transform={`translate(${kx} ${ky - 312 * ks}) scale(${ks * 1.5})`}>
              <path d="M -32 8 Q -36 -16 -24 -22 Q -22 -46 -8 -32 Q -2 -58 10 -34 Q 22 -54 28 -28 Q 44 -32 36 -6 Q 32 8 20 10 Z" fill={C.comb} stroke={INK} strokeWidth={3} />
            </g>
            <MzCSound x={kx + 80 * ks} y={ky - 190 * ks} r={40} amt={1} f={f} side={1} color={KRP.white} w={8} />
          </g>
        </g>
        {/* 右: 修道院の寝室 */}
        <g clipPath={`url(#${id}R)`}>
          <g transform="translate(200 0)">
            <Shudouin f={f} dark={0.8} candle={1} bell={1} />
          </g>
          <MzCMonk x={ax} y={ay} s={as} f={f} age="old" cross pose="point" pointDir={-1} face="smile" phase={7} />
          <MzCHandBell x={grip[0]} y={grip[1]} s={1.1} swing={Math.sin(f * 1.4) * 28} />
          <MzCSound x={grip[0]} y={grip[1] + 50} r={66} amt={1} f={f} side={-1} color={MP.glow} w={9} />
        </g>
        {/* 境目の線 */}
        <line x1={1160} y1={-400} x2={760} y2={1500} stroke={INK} strokeWidth={12} />
        <line x1={1160} y1={-400} x2={760} y2={1500} stroke={KRP.white} strokeWidth={4} />
        {/* 音のギザギザ線 (左右から真ん中の男へ) */}
        <path d={lineTo(kx + 150, ky - 220, shoot)} stroke={KRP.white} strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={lineTo(kx + 150, ky - 220, shoot)} stroke={C.keijin} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={lineTo(grip[0] - 60, grip[1] + 40, shoot)} stroke={KRP.white} strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={lineTo(grip[0] - 60, grip[1] + 40, shoot)} stroke={MP.brass} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* わら布団と男 */}
        <rect x={mx - 230} y={my - 20} width={460} height={54} rx={22} fill={C.straw} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={mx - 200 + i * 42} y1={my - 8} x2={mx - 186 + i * 42} y2={my + 22} stroke={C.strawDark} strokeWidth={3} />)}
        <g transform={`translate(${mx + lerp(80, 0, up)} ${my - lerp(20, 0, up) - Math.sin(Math.PI * up) * 60}) rotate(${lerp(-82, 0, up)} 0 ${-58})`}>
          <Person x={0} y={0} s={1} f={f} phase={2} cloth={C.tunic} clothDark={C.tunicDark} hair="cap"
            face={up < 0.5 ? "normal" : shrug ? "worried" : "surprised"} gaze={[look, 0]}
            pose={up < 1 ? "stand" : shrug ? "banzai" : "hold"} still={up < 1} />
          <rect x={-60} y={-88} width={120} height={10} rx={5} fill={C.tunicDark} stroke={INK} strokeWidth={3} />
          {up < 0.3 && (
            <g>
              <ellipse cx={-24} cy={-222} rx={17} ry={22} fill={KRP.white} />
              <ellipse cx={24} cy={-222} rx={17} ry={22} fill={KRP.white} />
              <path d="M -37 -220 Q -24 -210 -11 -220 M 11 -220 Q 24 -210 37 -220" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>
        {/* 刺さった衝撃 */}
        {hit > 0 && hit < 1 && [0, 1, 2, 3, 4, 5].map((k2) => {
          const a = (k2 / 6) * Math.PI * 2;
          return <line key={k2} x1={mx + Math.cos(a) * 80} y1={my - 250 + Math.sin(a) * 80} x2={mx + Math.cos(a) * (120 + hit * 30)} y2={my - 250 + Math.sin(a) * (120 + hit * 30)} stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={1 - hit} />;
        })}
        <QMark x={mx + 120} y={my - 300} s={0.9} f={f} t={seg(f, 22, 30)} />
        {shrug && <path d={`M ${mx - 150} ${my - 300} q -10 -20 0 -40 M ${mx + 150} ${my - 300} q 10 -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" />}
      </g>
      <TagPlate x={330} y={180} text="鶏人" size={44} t={seg(f, 2, 12)} />
      <TagPlate x={1610} y={180} text="修道院長" size={44} t={seg(f, 4, 14)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_048: (f) => <Mz048 f={f} />,
  mz_049: (f) => <Mz049 f={f} />,
  mz_050: (f) => <Mz050 f={f} />,
  mz_051: (f) => <Mz051 f={f} />,
  mz_052: (f) => <Mz052 f={f} />,
  mz_053: (f) => <Mz053 f={f} />,
  mz_054: (f) => <Mz054 f={f} />,
  mz_055: (f) => <Mz055 f={f} />,
  mz_056: (f) => <Mz056 f={f} />,
  mz_057: (f) => <Mz057 f={f} />,
  mz_058: (f) => <Mz058 f={f} />,
  mz_059: (f) => <Mz059 f={f} />,
};

export const MZ_C_MOTIFS: string[] = [
  "mz_048", // #48
  "mz_049", // #49
  "mz_050", // #50
  "mz_051", // #51
  "mz_052", // #52
  "mz_053", // #53
  "mz_054", // #54
  "mz_055", // #55
  "mz_056", // #56
  "mz_057", // #57
  "mz_058", // #58
  "mz_059", // #59
];

export const mezaCScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
