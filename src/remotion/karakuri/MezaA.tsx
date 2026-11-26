// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#1〜#11 (11文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, SHIN, mixColor, Flame,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 体の中
  flesh: "#F2B9B9", fleshDark: "#D98E96", fleshLight: "#FAD8D3", fleshDeep: "#C9798A",
  tube: "#F8D3D6", tubeLine: "#E39AA6",
  liquid: "#F29A4A", liquidLight: "#F8C27E",
  lampGreen: "#6CCB6A", lampGlow: "#C8F5B8", lampOff: "#9FA59C",
  // 寝室
  blanket: "#EFC46A", blanketDark: "#C99A3E",
  wall: "#E9DAC2", wallStripe: "#DCC8AA", wallDot: "#C9B08C",
  curtain: "#C9826C", curtainDark: "#A9614E",
  phone: "#2B2D33", phoneScreen: "#CFE9FF", phoneDark: "#1C2030",
  spot: "#FFF6D0", sun: "#FFF2C4",
  // 人
  hairBrown: "#7A4E2E", hairBrownDark: "#5C3820",
  enji: "#9E2E3A", enjiDark: "#73202B", pink: "#E58AA6", pinkDark: "#C26683", rose: "#C94F5E", roseDark: "#9C3644",
  manBlue: "#3E5C8A", manBlueDark: "#2C4466", manGray: "#6F7782", manGrayDark: "#555C66",
  // 村
  mud: "#B98A5A", mudDark: "#94683E", mudLight: "#D2A878",
  thatch: "#C9A55A", thatchDark: "#9C7C3A",
  savanna: "#8A7344", savannaDark: "#5E4E2E",
  forest: "#2F5A3E", forestDark: "#1F3F2C", forestLight: "#4A7A52",
  ember: "#FF8A3A",
  // 図鑑
  page: "#EFDDB0", pageDark: "#D9C08A", pageEdge: "#C9A96E", sepia: "#7A5A3A", sepiaLight: "#B39272",
  desk: "#8A5A36", deskDark: "#6B4226", deskLight: "#A87048",
  tabby: "#E3A063", tabbyDark: "#B9733A", squirrel: "#B8743F", bird: "#E58A4A",
  // 通路
  tunnel: "#1C1B26", tunnelMid: "#3A3644", tunnelStone: "#6E6A72", tunnelStoneLight: "#8E8990",
  wind: "#CFE3F2",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void TainaiDokei; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky; void NazoBell;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const INK = KRP.ink;
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "hang" | "sit";
// Person と同じ体ゆれ (上に重ねる髪・スカートを体に合わせる)
const personT = (x: number, y: number, s: number, f: number, phase: number, lean = 0) =>
  `translate(${x} ${y + Math.sin((f + phase * 17) / 13) * 3}) scale(${s}) rotate(${lean})`;

// 寝室の暗さ (Shinshitsu の中の計算と同じ)。寝室の上に自分で描いた物にかける
const shinDim = (sky: number) => 0.52 * clamp01(1 - sky / 1.45);

// カメラ: 世界の点 (px,py) を画面の (sx,sy) に置いて k 倍
const cam = (px: number, py: number, sx: number, sy: number, k: number) =>
  `translate(${sx} ${sy}) scale(${k}) translate(${-px} ${-py})`;

// ----- 音の線 「))」 -----
const MzASound: React.FC<{ x: number; y: number; r?: number; f: number; color?: string; w?: number; side?: 0 | 1 | -1 }> = ({ x, y, r = 40, f, color = INK, w = 6, side = 0 }) => {
  const sides = side === 0 ? [-1, 1] : [side];
  const pulse = (Math.floor(f / 3) % 2) * 6;
  return (
    <g>
      {sides.map((sd) => [0, 1, 2].map((k) => {
        const rr = r + k * 22 + pulse;
        const a0 = (-40 * Math.PI) / 180, a1 = (40 * Math.PI) / 180;
        const p0 = [x + sd * Math.cos(a0) * rr, y + Math.sin(a0) * rr];
        const p1 = [x + sd * Math.cos(a1) * rr, y + Math.sin(a1) * rr];
        return <path key={`${sd}${k}`} d={`M ${p0[0]} ${p0[1]} A ${rr} ${rr} 0 0 ${sd === 1 ? 1 : 0} ${p1[0]} ${p1[1]}`}
          stroke={color} strokeWidth={w - k} fill="none" strokeLinecap="round" opacity={1 - k * 0.22} />;
      }))}
    </g>
  );
};

// ----- Zzz -----
const MzAZzz: React.FC<{ f: number; x?: number; y?: number; s?: number }> = ({ f, x = 1000, y = 520, s = 1 }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const t = ((f / 50 + i / 3) % 1);
      return <text key={i} x={x - t * 40 * s + Math.sin(t * 6 + i) * 10} y={y - t * 150 * s} fontFamily={FONT} fontWeight={900}
        fontSize={(30 + t * 26) * s} fill={KRP.white} stroke={INK} strokeWidth={2.5} opacity={Math.sin(t * Math.PI)}>Z</text>;
    })}
  </g>
);

// ----- 時計の文字盤 (12時間) -----
const MzAClockFace: React.FC<{ r: number; minutes: number; f: number; sec?: boolean; face?: string }> = ({ r, minutes, f, sec = true, face = KRP.white }) => {
  const mA = ((minutes % 60) / 60) * 360;
  const hA = (((minutes / 60) % 12) / 12) * 360;
  const sA = (Math.floor(f / 30) * 6) % 360;
  return (
    <g>
      <circle r={r} fill={face} stroke={INK} strokeWidth={Math.max(3, r * 0.05)} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0;
        const r0 = r * (big ? 0.8 : 0.86), r1 = r * 0.92;
        return <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * r1} y2={-Math.cos(a) * r1}
          stroke={INK} strokeWidth={big ? Math.max(2.5, r * 0.03) : Math.max(1.2, r * 0.012)} strokeLinecap="round" />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180, rr = r * 0.66;
        return <text key={i} x={Math.sin(a) * rr} y={-Math.cos(a) * rr + r * 0.075} textAnchor="middle"
          fontFamily={FONT} fontWeight={800} fontSize={r * 0.2} fill={INK}>{i === 0 ? 12 : i}</text>;
      })}
      <line x1={0} y1={r * 0.08} x2={0} y2={-r * 0.48} stroke={INK} strokeWidth={Math.max(4, r * 0.07)} strokeLinecap="round" transform={`rotate(${hA})`} />
      <line x1={0} y1={r * 0.1} x2={0} y2={-r * 0.72} stroke={INK} strokeWidth={Math.max(3, r * 0.045)} strokeLinecap="round" transform={`rotate(${mA})`} />
      {sec && <line x1={0} y1={r * 0.16} x2={0} y2={-r * 0.8} stroke={KRP.red} strokeWidth={Math.max(1.5, r * 0.018)} transform={`rotate(${sA})`} />}
      <circle r={Math.max(4, r * 0.07)} fill={INK} />
      <circle r={Math.max(1.5, r * 0.025)} fill={MP.brass} />
    </g>
  );
};

// ----- 寝ている「あなた」の頭 (Shinshitsu の head と同じ位置・角度。表情を自分で変えるとき) -----
//   mode="back": 寝返りを打って後頭部を向けた姿
const MzASleepHead: React.FC<{
  f: number; mode?: "face" | "back"; mouth?: "o" | "open"; frown?: number; awake?: boolean; dim?: number;
}> = ({ f, mode = "face", mouth = "o", frown = 0, awake = false, dim = 0 }) => {
  const breathe = Math.sin(f / 21) * 5;
  const T = `translate(${SHIN.head[0]} ${SHIN.head[1] + breathe * 0.2}) rotate(80) scale(0.8) translate(0 228)`;
  if (mode === "back") {
    return (
      <g transform={T}>
        <ellipse cx={-62} cy={-222} rx={12} ry={18} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
        <ellipse cx={62} cy={-222} rx={12} ry={18} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
        <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
        <path d="M -64 -206 Q -70 -296 0 -296 Q 70 -296 64 -206 Q 40 -180 0 -178 Q -40 -180 -64 -206 Z" fill={INK} />
        <path d="M 4 -250 q 14 -2 12 12 q -4 12 -18 6" stroke={KRP.grayDark} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d="M -30 -166 Q 0 -150 30 -166" stroke={MP.youDark} strokeWidth={10} fill="none" strokeLinecap="round" />
        {dim > 0 && <g fill={MP.nightDeep} opacity={dim}><circle cx={0} cy={-228} r={67} /><ellipse cx={-62} cy={-222} rx={14} ry={20} /><ellipse cx={62} cy={-222} rx={14} ry={20} /></g>}
      </g>
    );
  }
  const fr = clamp01(frown);
  return (
    <g transform={T}>
      <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
      <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={INK} />
      {awake ? (
        <g>
          <ellipse cx={-24} cy={-222} rx={12} ry={8} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <ellipse cx={24} cy={-222} rx={12} ry={8} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <circle cx={-24} cy={-221} r={5} fill={INK} />
          <circle cx={24} cy={-221} r={5} fill={INK} />
          <path d="M -38 -228 L -10 -228 M 10 -228 L 38 -228" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : fr > 0.5 ? (
        <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
          <path d="M -36 -228 L -16 -220 L -36 -212" />
          <path d="M 36 -228 L 16 -220 L 36 -212" />
        </g>
      ) : (
        <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
          <path d="M -36 -222 Q -24 -212 -12 -222" />
          <path d="M 12 -222 Q 24 -212 36 -222" />
        </g>
      )}
      {/* 眉 (frown で寄る) */}
      <g stroke={INK} strokeWidth={4.5} strokeLinecap="round">
        <line x1={-34} y1={-246 + fr * 2} x2={-14} y2={-247 + fr * 8} />
        <line x1={14} y1={-247 + fr * 8} x2={34} y2={-246 + fr * 2} />
      </g>
      {fr > 0.5 && <path d="M -6 -262 L -2 -252 M 6 -262 L 2 -252" stroke={INK} strokeWidth={3} strokeLinecap="round" />}
      <ellipse cx={-38} cy={-200} rx={11} ry={6} fill="#F2A7A0" opacity={0.6} />
      <ellipse cx={38} cy={-200} rx={11} ry={6} fill="#F2A7A0" opacity={0.6} />
      {mouth === "open" ? (
        <g>
          <ellipse cx={0} cy={-184} rx={15} ry={17 + Math.sin(f / 21) * 2} fill={INK} />
          <ellipse cx={0} cy={-176} rx={9} ry={6} fill="#E06A5A" />
        </g>
      ) : fr > 0.5 ? (
        <path d="M -12 -184 Q 0 -192 12 -184" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <ellipse cx={0} cy={-186} rx={6 + Math.sin(f / 21) * 1.5} ry={7 + Math.sin(f / 21) * 2} fill={INK} />
      )}
      {dim > 0 && <circle cx={0} cy={-228} r={67} fill={MP.nightDeep} opacity={dim} />}
    </g>
  );
};

// ----- 横向きに寝ている「あなた」の体 (#1・#2 共通。v2 で作者「胴体がわかりにくい」→ 作り直し) -----
//   Shinshitsu を sleeper={0} head={false} arm={0} で描いた上に重ねる (平らな布団を、体の形にふくらんだ布団で覆う)。
//   頭は右 (枕の上・MzASleepHead)、足は左。水色パジャマの肩が布団から出る。布団は 肩→腰のくぼみ→腰→ひざ→足先 の起伏。
//   dim: 部屋の暗さ (shinDim)。Shinshitsu の暗幕より上に描くので、色を自分で暗くする。shrug: 0〜1 で肩がもぞっと上がる
const mzaDim = (dim: number) => (c: string) => mixColor(c, MP.nightDeep, dim);
const MzASleeper: React.FC<{ f: number; dim: number; shrug?: number; id: string }> = ({ f, dim, shrug = 0, id }) => {
  const d = mzaDim(dim);
  const ink = d(INK);
  const b = Math.sin(f / 21) * 5 + shrug * 12; // 胸・肩の上下
  const bl = Math.sin(f / 21) * 2;              // 足のほうは少しだけ
  const blanket = `M 244 796 L 244 690 C 246 660 262 ${640 - bl} 284 ${628 - bl} C 304 ${604 - bl} 340 ${596 - bl} 366 ${606 - bl}`
    + ` C 394 ${618 - bl} 440 ${618 - bl} 500 ${612 - bl} C 560 ${606 - bl} 604 ${590 - b * 0.5} 644 ${574 - b * 0.6}`
    + ` C 684 ${558 - b * 0.6} 724 ${556 - b * 0.6} 754 ${568 - b * 0.6} C 792 ${584 - b * 0.8} 822 ${604 - b} 852 ${602 - b}`
    + ` C 884 ${600 - b} 904 ${586 - b} 928 ${578 - b} C 952 ${570 - b} 970 ${586 - b} 984 ${612 - b * 0.6} C 994 632 1002 650 1012 662 L 1012 796 Z`;
  return (
    <g>
      {/* パジャマの体 (肩・胸。下は布団に隠れる) */}
      <path d={`M 1048 600 C 1034 ${570 - b} 1000 ${552 - b} 962 ${552 - b} C 924 ${552 - b} 898 ${566 - b} 884 ${592 - b} L 884 672 L 1048 672 Z`}
        fill={d(MP.you)} stroke={ink} strokeWidth={5.5} strokeLinejoin="round" />
      {/* 襟と前立て */}
      <path d={`M 1046 602 L 1022 ${626 - b * 0.3} L 1030 ${600 - b * 0.5}`} fill={d(KRP.white)} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M 1022 ${626 - b * 0.3} Q 1016 646 1018 668`} stroke={d(MP.youDark)} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* 肩のつや */}
      <path d={`M 936 ${566 - b} Q 964 ${558 - b} 992 ${566 - b}`} stroke={d(KRP.white)} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
      {/* 体の形にふくらんだ掛け布団 */}
      <defs><clipPath id={id}><path d={blanket} /></clipPath></defs>
      <path d={blanket} fill={d(C.blanket)} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <g clipPath={`url(#${id})`}>
        {/* チェックの線 (起伏にそって少し曲がる) */}
        <g stroke={d(C.blanketDark)} strokeWidth={4} opacity={0.5} fill="none">
          {Array.from({ length: 9 }, (_, i) => {
            const x = 300 + i * 80;
            return <path key={i} d={`M ${x} 540 Q ${x - 10} 680 ${x - 4} 800`} />;
          })}
          <path d="M 244 742 Q 620 730 1012 742" />
          <path d="M 244 760 Q 620 748 1012 760" />
        </g>
        {/* 起伏の影: 腰の下・ひざ・足先 */}
        <g fill="none" stroke={d(C.blanketDark)} strokeWidth={7} strokeLinecap="round" opacity={0.7}>
          <path d={`M 700 ${600 - b * 0.6} Q 690 650 712 712`} />
          <path d={`M 862 ${640 - b} Q 840 680 852 730`} />
          <path d={`M 330 ${640 - bl} Q 322 680 336 720`} />
        </g>
        {/* 上側のつや */}
        <path d={`M 646 ${592 - b * 0.6} C 690 ${574 - b * 0.6} 724 ${572 - b * 0.6} 752 ${584 - b * 0.6}`} stroke={d(KRP.white)} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.45} />
        <path d={`M 300 ${636 - bl} C 318 ${618 - bl} 340 ${614 - bl} 358 ${622 - bl}`} stroke={d(KRP.white)} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.45} />
      </g>
      {/* 布団のふち (白い折り返し) */}
      <path d={`M 898 ${594 - b} C 918 ${584 - b} 940 ${576 - b} 958 ${578 - b} C 976 ${584 - b} 990 ${610 - b * 0.6} 1000 636 L 1012 662 L 996 670 C 986 646 976 ${624 - b * 0.4} 962 ${606 - b * 0.7} C 946 ${598 - b} 924 ${602 - b} 902 ${612 - b} Z`}
        fill={d(KRP.white)} stroke={ink} strokeWidth={4.5} strokeLinejoin="round" />
    </g>
  );
};

// ----- 頭が沈んだ枕のふくらみ (頭の下側に重ねる) -----
const MzAPillowPuff: React.FC<{ dim: number }> = ({ dim }) => {
  const d = mzaDim(dim);
  return (
    <g>
      <path d="M 1026 664 Q 1036 634 1066 636 Q 1100 642 1128 632 Q 1158 622 1178 642 Q 1176 664 1150 669 L 1040 670 Z" fill={d(KRP.white)} />
      <path d="M 1028 660 Q 1036 634 1066 636 Q 1100 642 1128 632 Q 1158 622 1178 642" stroke={d(INK)} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 1062 650 Q 1094 656 1124 646" stroke={d("#CFC6B8")} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ----- 布団の上に出した腕 (水色の袖)。a=0 は胸の前で曲げて休む / a=1 で手がスマホへ (#2) -----
const mzaArmPath = (a: number, b = 0) => {
  const ak = easeOut(clamp01(a));
  const hx = lerp(988, SHIN.phone[0] - 18, ak), hy = lerp(650, SHIN.phone[1] + 8, ak);
  const ex = lerp(866, 1180, ak), ey = lerp(668, 470, ak);
  return { d: `M 952 ${584 - b} Q ${ex} ${ey} ${hx} ${hy}`, hx, hy };
};
const MzASleepArm: React.FC<{ f: number; a: number; dim: number }> = ({ f, a, dim }) => {
  const d = mzaDim(dim);
  const p = mzaArmPath(a, Math.sin(f / 21) * 5);
  return (
    <g>
      <path d={p.d} stroke={d(INK)} strokeWidth={33} fill="none" strokeLinecap="round" />
      <path d={p.d} stroke={d(MP.you)} strokeWidth={23} fill="none" strokeLinecap="round" />
      <circle cx={p.hx} cy={p.hy} r={15} fill={d(KRP.white)} stroke={d(INK)} strokeWidth={4.5} />
    </g>
  );
};

// ----- 棒に付けた小旗 (#6 の札の横)。(x,y) = 棒の先。旗は棒の右へ、f ではためく。t=0〜1 で棒ごと立ち上がる -----
//   tz = タンザニア (左下→右上の黒い斜め帯・両側に細い黄の縁・左上が緑・右下が青) / bo = ボリビア (横3段 赤・黄・緑。国章なし)
const MzAFlag: React.FC<{ x: number; y: number; kind: "tz" | "bo"; f: number; t: number; id: string; w?: number; h?: number }> = ({ x, y, kind, f, t, id, w = 84, h = 56 }) => {
  if (t <= 0) return null;
  const k = easeOut(clamp01(t));
  const n = 14;
  const wave = (i: number) => {
    const u = i / n;
    return Math.sin(f / 7 - u * 4.2) * 4.5 * u;
  };
  const top = Array.from({ length: n + 1 }, (_, i) => `${(i / n) * w} ${wave(i)}`);
  const bot = Array.from({ length: n + 1 }, (_, i) => `${((n - i) / n) * w} ${h + wave(n - i)}`);
  const outline = `M ${top.join(" L ")} L ${bot.join(" L ")} Z`;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) scale(${k})`}>
      {/* 棒 */}
      <line x1={-2} y1={-6} x2={-2} y2={h + 28} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={-2} y1={-6} x2={-2} y2={h + 28} stroke={MP.woodLight} strokeWidth={4} strokeLinecap="round" />
      <circle cx={-2} cy={-10} r={7} fill={MP.brass} stroke={INK} strokeWidth={3} />
      <g transform="translate(2 0)">
        <defs><clipPath id={id}><path d={outline} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          {kind === "tz" ? (
            <g>
              <rect x={-4} y={-10} width={w + 8} height={h + 20} fill="#00A3DD" />
              <path d={`M -4 -10 L ${w + 4} -10 L -4 ${h + 6} Z`} fill="#1EB53A" />
              <line x1={-6} y1={h + 8} x2={w + 6} y2={-8} stroke="#FCD116" strokeWidth={h * 0.46} />
              <line x1={-6} y1={h + 8} x2={w + 6} y2={-8} stroke="#111111" strokeWidth={h * 0.3} />
            </g>
          ) : (
            <g>
              <rect x={-4} y={-10} width={w + 8} height={h / 3 + 10} fill="#D52B1E" />
              <rect x={-4} y={h / 3} width={w + 8} height={h / 3} fill="#F9E300" />
              <rect x={-4} y={(h * 2) / 3} width={w + 8} height={h / 3 + 10} fill="#007934" />
            </g>
          )}
          {/* はためきの陰 (波と一緒に流れる) */}
          {Array.from({ length: 3 }, (_, i) => {
            const sx = ((f * 1.4 + i * (w / 3)) % (w + 20)) - 10;
            return <rect key={i} x={sx} y={-10} width={10} height={h + 20} fill={INK} opacity={0.1} />;
          })}
        </g>
        <path d={outline} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
  );
};

// ----- 頭までかぶった掛け布団のこんもり (head の上を覆う)。t=0〜1 で右へかぶさっていく -----
const MzAHump: React.FC<{ f: number; t?: number; id: string }> = ({ f, t = 1, id }) => {
  const b = Math.sin(f / 21) * 4;
  const edge = lerp(960, 1196, clamp01(t));
  return (
    <g>
      <defs><clipPath id={id}><rect x={880} y={380} width={edge - 880} height={300} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <path d={`M 900 ${600 - b} C 930 ${520 - b} 1010 ${506 - b} 1080 ${522 - b} C 1150 ${536 - b} 1190 ${590 - b} 1186 650 L 960 660 Z`}
          fill={C.blanket} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={C.blanketDark} strokeWidth={4} opacity={0.55}>
          {[960, 1040, 1120].map((lx) => <line key={lx} x1={lx} y1={540 - b} x2={lx - 4} y2={650} />)}
          <path d={`M 916 ${596 - b} Q 1040 ${566 - b} 1178 ${606 - b}`} fill="none" />
        </g>
        <path d={`M 1150 ${560 - b} Q 1176 ${580 - b} 1184 ${640}`} stroke={KRP.white} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
      {/* 布団のふちをつかむ手 */}
      {t > 0.02 && t < 0.98 && <circle cx={edge - 6} cy={600 - b} r={14} fill={KRP.white} stroke={INK} strokeWidth={4.5} />}
    </g>
  );
};

// ----- スマホを台から消す (壁紙と立て台を描き直す) -----
const MzANoPhone: React.FC = () => (
  <g>
    <rect x={1294} y={552} width={72} height={92} fill={C.wall} />
    <rect x={1294} y={552} width={8} height={92} fill={C.wallStripe} opacity={0.7} />
    <rect x={1350} y={552} width={12} height={92} fill={C.wallStripe} opacity={0.7} />
    <circle cx={1326} cy={560} r={3} fill={C.wallDot} opacity={0.6} />
    <path d="M 1306 646 L 1318 628 L 1352 628 L 1356 646 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={3.5} />
    <rect x={1262} y={644} width={216} height={22} rx={5} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
    <ellipse cx={1430} cy={644} rx={30} ry={8} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
    <path d="M 1386 644 L 1382 598 L 1410 598 L 1406 644 Z" fill="#DCEFF8" stroke={INK} strokeWidth={3.5} opacity={0.95} />
    <path d="M 1384 616 L 1408 616 L 1406 644 L 1386 644 Z" fill="#A9D2EA" opacity={0.7} />
  </g>
);

// ----- 小さなスマホ (寝室の物と同じ見た目) -----
const MzAPhone: React.FC<{ x: number; y: number; rot?: number; ring?: boolean; f: number; s?: number }> = ({ x, y, rot = 0, ring = false, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-24} y={-42} width={48} height={84} rx={9} fill={C.phone} stroke={INK} strokeWidth={4.5} />
    <rect x={-19} y={-35} width={38} height={68} rx={5} fill={ring ? C.phoneScreen : C.phoneDark} />
    {ring && [0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-15} y={-30 + i * 12} width={30} height={8} rx={3}
        fill={Math.floor(f / 5 + i) % 2 ? "#FFC1B6" : "#FFD9D2"} stroke={MP.bell} strokeWidth={1.5} />
    ))}
  </g>
);

// ----- 女性 (肩までの茶色の髪 / 後ろで結んだ房 + スカート) -----
const MzAWoman: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; face?: Face; pose?: Pose; lean?: number;
  cloth?: string; clothDark?: string; hairStyle?: "long" | "tied"; gaze?: [number, number]; pointDir?: 1 | -1;
}> = ({ x, y, s = 1, f, phase = 0, face = "normal", pose = "stand", lean = 0, cloth = C.rose, clothDark = C.roseDark, hairStyle = "long", gaze = [0, 0], pointDir = 1 }) => {
  const T = personT(x, y, s, f, phase, lean);
  return (
    <g>
      <g transform={T}>
        {hairStyle === "long" ? (
          <g fill={C.hairBrown} stroke={INK} strokeWidth={4.5}>
            <path d="M -70 -252 Q -86 -190 -80 -140 L -48 -146 Q -52 -200 -44 -246 Z" />
            <path d="M 70 -252 Q 86 -190 80 -140 L 48 -146 Q 52 -200 44 -246 Z" />
          </g>
        ) : (
          <g>
            <path d="M 52 -262 Q 104 -258 100 -206 Q 96 -176 84 -168 Q 80 -200 50 -232 Z" fill={C.hairBrown} stroke={INK} strokeWidth={4.5} />
            <circle cx={58} cy={-262} r={9} fill={C.enji} stroke={INK} strokeWidth={3} />
          </g>
        )}
      </g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} pose={pose} lean={lean} gaze={gaze} pointDir={pointDir}
        cloth={cloth} clothDark={clothDark} hair="none" />
      <g transform={T}>
        <path d="M -64 -236 Q -66 -298 0 -298 Q 66 -298 64 -236 Q 44 -270 0 -268 Q -44 -270 -64 -236 Z" fill={C.hairBrown} stroke={INK} strokeWidth={4} />
        <path d="M -30 -282 Q -10 -290 10 -286" stroke={C.hairBrownDark} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* スカート (腰から膝下まで広がる台形) */}
        <path d="M -60 -74 L 60 -74 L 84 -16 L -84 -16 Z" fill={cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -30 -70 L -40 -20 M 0 -70 L 0 -20 M 30 -70 L 40 -20" stroke={clothDark} strokeWidth={4} opacity={0.6} />
      </g>
    </g>
  );
};

// ----- 子ども (小さな体 + 大きめの頭。眠そう) -----
const MzAChild: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; pose?: Pose; cloth?: string; clothDark?: string; sleepy?: boolean; yawn?: boolean;
}> = ({ x, y, s = 0.55, f, phase = 0, pose = "stand", cloth = C.manGray, clothDark = C.manGrayDark, sleepy = true, yawn = false }) => {
  const T = personT(x, y, s, f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} pose={pose} cloth={cloth} clothDark={clothDark} hair="none" />
      <g transform={T}>
        <circle cx={0} cy={-236} r={80} fill={KRP.white} stroke={INK} strokeWidth={6} />
        <path d="M -78 -250 Q -80 -318 0 -320 Q 80 -318 78 -250 Q 40 -278 0 -276 Q -40 -278 -78 -250 Z" fill={INK} />
        {sleepy ? (
          <g fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round">
            <path d="M -42 -228 Q -28 -220 -14 -228" />
            <path d="M 14 -228 Q 28 -220 42 -228" />
          </g>
        ) : (
          <g fill={INK}><circle cx={-28} cy={-228} r={7} /><circle cx={28} cy={-228} r={7} /></g>
        )}
        <ellipse cx={-48} cy={-204} rx={12} ry={7} fill="#F2A7A0" opacity={0.7} />
        <ellipse cx={48} cy={-204} rx={12} ry={7} fill="#F2A7A0" opacity={0.7} />
        {yawn ? <ellipse cx={0} cy={-190} rx={13} ry={17} fill={INK} /> : <path d="M -10 -192 Q 0 -184 10 -192" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
};

// ----- 体の中の柔らかいピンクの壁 (天井に管が通る工場のような世界) -----
const MzABodyWall: React.FC<{ f: number; top?: number; seed?: number }> = ({ f, top = 0, seed = 1 }) => (
  <g>
    <rect x={-40} y={top - 20} width={2000} height={1160 - top} fill={C.flesh} />
    {/* やわらかいひだ */}
    <g stroke={C.fleshDark} strokeWidth={6} fill="none" opacity={0.35} strokeLinecap="round">
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={`M ${-20 + i * 160} ${top + 200} q ${30 + rnd(seed, i) * 20} 200 ${-10} 420 q -20 120 10 260`} />
      ))}
    </g>
    <g fill={C.fleshLight} opacity={0.65}>
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={i} cx={rnd(seed + 3, i) * 1920} cy={top + 230 + rnd(seed + 5, i) * (600 - top * 0.5)} rx={30 + rnd(seed + 7, i) * 50} ry={18 + rnd(seed + 9, i) * 26} />
      ))}
    </g>
    {/* 床 (やわらかい波) */}
    <path d="M -40 868 Q 200 846 480 866 T 960 862 T 1440 866 T 1960 858 L 1960 1120 L -40 1120 Z" fill={C.fleshDeep} stroke={INK} strokeWidth={6} />
    <path d="M -40 890 Q 200 872 480 888 T 960 884 T 1440 888 T 1960 880" stroke={C.fleshDark} strokeWidth={5} fill="none" opacity={0.6} />
    {/* 天井の管 (中を泡がゆっくり流れる) */}
    {[0, 1, 2].map((k) => {
      const ty = top + 60 + k * 62;
      const d = `M -40 ${ty} Q 480 ${ty + 26 - k * 14} 960 ${ty} T 1960 ${ty + 6}`;
      return (
        <g key={k}>
          <path d={d} stroke={INK} strokeWidth={42 - k * 6} fill="none" />
          <path d={d} stroke={k === 1 ? C.tubeLine : C.tube} strokeWidth={30 - k * 6} fill="none" />
          <path d={d} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.55} transform="translate(0 -7)" />
          {Array.from({ length: 6 }, (_, i) => {
            const bx = ((f * (1.6 + k * 0.5) + i * 360 + k * 120) % 2100) - 90;
            const by = ty + Math.sin((bx / 1920) * Math.PI * 2) * 6 + (bx < 960 ? 10 - k * 5 : 0);
            return <circle key={i} cx={bx} cy={by} r={7 - k} fill={KRP.white} stroke={C.tubeLine} strokeWidth={2} opacity={0.85} />;
          })}
          {/* 継ぎ目のバンド */}
          {[300, 900, 1500].map((jx) => <rect key={jx} x={jx + k * 70} y={ty - 22 + k * 3} width={16} height={44 - k * 6} rx={4} fill={MP.brass} stroke={INK} strokeWidth={3.5} />)}
        </g>
      );
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #1 目覚まし、何個かけていますか。
// 格: 山 / seed 6001 / 尺 約94
// どこ: 夜明け前 (5:50) の寝室 Shinshitsu (sky=0)。窓に紺の夜空と星、ナイトテーブルにスマホとコップの水。
// 演出: 寝息を立てる「あなた」。カメラが枕元のスマホへ寄ると、画面がアラーム一覧 (SumahoAlarm) に開き、
//       灰色に切れていた5つのスイッチが上から ぽん・ぽん とひとりでにオンへ (緑)。点くたびに小さな光の粒。
//       5個目が点いた瞬間、寝ている「あなた」の肩がもぞっと上がる (寝顔のまま)。最後に「?」。
//       v2: 「あなた」は横向きに寝る姿 (こちら向きの寝顔・水色パジャマの肩と腕・体の形にふくらんだ布団) = MzASleeper
// 動き: f0-20 全景→スマホへ寄る (1→1.9) / f14-22 一覧が開く / f20,25,30,35,40 スイッチがオン / f41-54 もぞっ /
//       秒針はずっと進む / Zzz・寝息 / f52〜 ? がゆれる
const Mz001: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 20));
  const k = lerp(1, 1.9, z);
  const sx = lerp(1330, 1500, z), sy = lerp(606, 560, z);
  const lt = seg(f, 14, 22);
  const ls = lerp(0.12, 0.92, easeOut(lt)) * (lt > 0 ? 1 : 0);
  const lx = lerp(1500, 1520, lt), ly = lerp(560, 470, lt);
  const onAt = (i: number) => 20 + i * 5;
  const off = [0, 1, 2, 3, 4].filter((i) => f < onAt(i));
  // 5個目が点くと、寝顔のまま肩がもぞっと上がる (v2: 後ろ向きの寝返りは「体が分からない」のでやめた)
  const roll = seg(f, 41, 54);
  const shrug = Math.sin(roll * Math.PI);
  const dim = shinDim(0);
  return (
    <Frame f={f} seed={6001} dark>
      <g transform={cam(1330, 606, sx, sy, k)}>
        <Shinshitsu f={f} sky={0} sleeper={0} alarms={0} head={false} time={5 * 60 + 50} />
        {/* 横向きに寝ている「あなた」: 体と布団 → 寝顔 → 頭が沈む枕 → 胸の前の腕 */}
        <MzASleeper f={f} dim={dim} shrug={shrug} id="mz001bl" />
        <MzASleepHead f={f} dim={dim} />
        <MzAPillowPuff dim={dim} />
        <MzASleepArm f={f} a={0} dim={dim} />
        {/* もぞっ の線 */}
        {roll > 0 && roll < 1 && (
          <g stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9 * (1 - roll)}>
            <path d="M 896 536 q 14 -12 28 0 q 14 12 28 0" />
            <path d="M 936 512 q 12 -10 24 0 q 12 10 24 0" />
          </g>
        )}
        <MzAZzz f={f} x={1000} y={520} />
        {/* 夜のスマホのほのかな光 (一覧が開くと強まる) */}
        <circle cx={1330} cy={606} r={60 + lt * 30} fill={C.phoneScreen} opacity={0.12 + lt * 0.2} />
      </g>
      {/* 部屋の暗さの上に、ひらいた一覧 */}
      {lt > 0 && (
        <g>
          <circle cx={lx} cy={ly} r={360 * ls} fill={C.phoneScreen} opacity={0.18} />
          <SumahoAlarm x={lx} y={ly} s={ls} f={f} off={off} />
          {/* スイッチが点く瞬間の光の粒 */}
          {[0, 1, 2, 3, 4].map((i) => {
            const t = seg(f, onAt(i), onAt(i) + 8);
            if (t <= 0 || t >= 1) return null;
            const cx = lx + 98 * ls, cy = ly + (-132 + i * 86) * ls;
            return (
              <g key={i} opacity={1 - t}>
                {Array.from({ length: 8 }, (_, j) => {
                  const a = (j / 8) * Math.PI * 2;
                  return <line key={j} x1={cx + Math.cos(a) * (24 + t * 20)} y1={cy + Math.sin(a) * (24 + t * 20)}
                    x2={cx + Math.cos(a) * (36 + t * 40)} y2={cy + Math.sin(a) * (36 + t * 40)} stroke={C.lampGreen} strokeWidth={5} strokeLinecap="round" />;
                })}
              </g>
            );
          })}
        </g>
      )}
      <QMark x={1760} y={250} s={0.8} f={f} t={seg(f, 50, 60)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #2 5分おきに、5個。止めた記憶は、ありません。
// 格: 山 / seed 6002 / 尺 約122
// どこ: 夜明けの寝室 Shinshitsu (sky=1) の枕元に寄ったまま。窓の外が橙に。壁の時計が 6:00→6:20 と5分ずつ跳ぶ。
// 演出: ★笑いどころ。アラームが鳴る → 布団から右腕だけがにゅっと出て正確にタップ → すっと戻る、を5回。
//       回を追うごとに速くなり、4回目から速さの線、5回目は残像が出る早業。本人は鼻ちょうちんで爆睡のまま (寝顔は変えない)。
//       右の一覧 (SumahoAlarm) は鳴っている行が赤く点滅し、止めるたびに灰色に。最後に5個とも灰色、鼻ちょうちんがぷくっと大きく。
// 動き: 1回目 f0-32 / 2回目 f32-54 (f45 でちょうど止める) / f54-72 / f72-86 / f86-96 / f96〜 カメラが少し引く・鼻ちょうちんがふくらむ
const MZ2_ST = [0, 32, 54, 72, 86];
const MZ2_DU = [32, 22, 18, 14, 10];
const Mz002: React.FC<{ f: number }> = ({ f }) => {
  const done = f >= 96;
  let c = 0;
  MZ2_ST.forEach((st, i) => { if (f >= st) c = i; });
  const t = done ? 1 : (f - MZ2_ST[c]) / MZ2_DU[c];
  const ringing = !done && t < 0.55;
  const arm = done ? 0 : t < 0.35 ? 0 : t < 0.55 ? easeInOut((t - 0.35) / 0.2) : t < 0.65 ? 1 : 1 - easeInOut((t - 0.65) / 0.35);
  const off = done ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4].filter((i) => i < c || (i === c && t >= 0.55));
  const time = 6 * 60 + c * 5;
  const pb = easeInOut(seg(f, 96, 116));
  const k = lerp(1.6, 1.3, pb);
  const sx = lerp(720, 780, pb), sy = lerp(700, 640, pb);
  const tapT = done ? 0 : seg(t, 0.55, 0.75);
  const bub = done ? lerp(22, 52, easeOut(seg(f, 96, 110))) + Math.sin(f / 6) * 3 : 26 + Math.sin(f / 9) * 6;
  const dim = shinDim(1);
  return (
    <Frame f={f} seed={6002}>
      <g transform={cam(1062, 600, sx, sy, k)}>
        <Shinshitsu f={f} sky={1} sleeper={0} alarms={ringing ? c + 1 : 0} arm={0} head={false} time={time} />
        {/* 横向きに寝ている「あなた」(#1 と同じ体)。腕は胸の前から伸びてスマホへ */}
        <MzASleeper f={f} dim={dim} id="mz002bl" />
        <MzASleepHead f={f} dim={dim} />
        <MzAPillowPuff dim={dim} />
        {/* 速さの線と残像 (4回目・5回目) */}
        {!done && c >= 3 && arm > 0.05 && (
          <g>
            {c === 4 && [0.3, 0.55].map((d, i) => {
              const p = mzaArmPath(arm - d, Math.sin(f / 21) * 5);
              return <path key={i} d={p.d} stroke={MP.you} strokeWidth={23} fill="none" strokeLinecap="round" opacity={0.3 - i * 0.1} />;
            })}
            <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
              {[0, 1, 2].map((i) => <line key={i} x1={1060 + i * 40} y1={480 + i * 18} x2={1120 + i * 40} y2={500 + i * 18} />)}
            </g>
          </g>
        )}
        <MzASleepArm f={f} a={arm} dim={dim} />
        {/* タップの「ピッ」 (光の輪) */}
        {tapT > 0 && tapT < 1 && (
          <g opacity={1 - tapT}>
            <circle cx={SHIN.phone[0]} cy={SHIN.phone[1]} r={30 + tapT * 50} fill="none" stroke={C.lampGreen} strokeWidth={7} />
            <circle cx={SHIN.phone[0]} cy={SHIN.phone[1]} r={14 + tapT * 26} fill="none" stroke={KRP.white} strokeWidth={5} />
          </g>
        )}
        {/* 鼻ちょうちん */}
        <g>
          <circle cx={1012 - bub * 0.7} cy={590 - bub * 0.25} r={bub} fill="#DDF1FB" stroke={INK} strokeWidth={4} opacity={0.9} />
          <path d={`M ${1012 - bub * 1.2} ${590 - bub * 0.75} q ${bub * 0.3} ${-bub * 0.25} ${bub * 0.6} ${-bub * 0.2}`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        <MzAZzz f={f} x={1000} y={510} s={0.9} />
      </g>
      {/* 右の一覧 */}
      <SumahoAlarm x={1600} y={500} s={0.85} f={f} on={ringing ? c : undefined} off={off} />
      {/* 止めた数のチェック (一覧の左に1つずつ増える) */}
      {off.map((i) => (
        <path key={i} d={`M ${1452} ${500 + (-132 + i * 86) * 0.85} l 12 12 l 22 -26`} stroke={C.lampGreen} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #3 でも実は、あなたの体は、起きる時刻を、ちゃんと知っています。
// 格: 山 / seed 6003 / 尺 約153
// どこ: 前の晩の暗い寝室 Shinshitsu (sky=0) → 寝顔の額を通り抜けて「あなた」の体の中。
//       体の中は柔らかいピンクの壁・天井に管 (泡が流れる)・やわらかい床の、工場のような世界。
// 演出: 壁に貼った紙の時刻表 (数字は「6:00」の行だけ。ほかの行は字にしない線)。脚立に乗った Kobito が赤ペンで 6:00 に赤丸、
//       満足げにうなずく。2人目はクリップボードに✓、3人目は親指を立てる。右上のモニターには外の「あなた」の寝顔 (Zzz)。
//       = 本人は寝ていて知らないのに、体の中ではちゃんと知っている。
// 動き: f0-18 寝顔へぐーっと寄る / f12-30 白い光で転換 / f24-36 赤丸を描く / f34-40 ✓ / f38 親指 / f36〜 うなずき /
//       管の泡がゆっくり流れる / 中のカメラがゆっくり寄る
const Mz003: React.FC<{ f: number }> = ({ f }) => {
  const zt = seg(f, 0, 18);
  const zk = lerp(1, 5.2, zt * zt);
  const flash = f < 22 ? seg(f, 10, 18) : 1 - seg(f, 22, 32);
  const inside = f >= 18;
  const circ = easeOut(seg(f, 24, 36));
  const check = seg(f, 34, 40);
  const thumb = f >= 38;
  const nod = f > 36 ? Math.sin((f - 36) / 3.2) * 4 * Math.max(0, 1 - (f - 36) / 60) : 0;
  const ck = lerp(1, 1.05, seg(f, 18, 153));
  return (
    <Frame f={f} seed={6003} dark={!inside}>
      {!inside && (
        <g transform={cam(1062, 600, lerp(1062, 960, zt), lerp(600, 540, zt), zk)}>
          <Shinshitsu f={f} sky={0} sleeper={1} alarms={0} head={false} time={23 * 60} />
          <MzASleepHead f={f} dim={shinDim(0)} />
          <MzAZzz f={f} />
        </g>
      )}
      {inside && (
        <g transform={cam(960, 540, 960, 540, ck)}>
          <MzABodyWall f={f} seed={3} />
          {/* モニター (外の寝顔が映る) */}
          <g>
            <path d="M 1500 250 L 1500 196 M 1640 250 L 1640 186" stroke={INK} strokeWidth={8} />
            <path d="M 1500 250 L 1500 196 M 1640 250 L 1640 186" stroke={C.tubeLine} strokeWidth={4} />
            <rect x={1360} y={250} width={400} height={250} rx={22} fill={MP.ironLight} stroke={INK} strokeWidth={7} />
            <rect x={1380} y={268} width={360} height={200} rx={10} fill={MP.nightDeep} stroke={INK} strokeWidth={4} />
            <defs><clipPath id="mzA3mon"><rect x={1380} y={268} width={360} height={200} rx={10} /></clipPath></defs>
            <g clipPath="url(#mzA3mon)">
              <g transform="translate(1560 400) scale(0.9) translate(-1062 -600)">
                <ellipse cx={1075} cy={628} rx={108} ry={42} fill="#C9CEDD" stroke={INK} strokeWidth={6} />
                <MzASleepHead f={f} />
                <path d="M 900 700 Q 960 600 1010 640 L 1010 760 L 900 760 Z" fill={mixColor(C.blanket, MP.nightDeep, 0.3)} stroke={INK} strokeWidth={6} />
                <MzAZzz f={f} x={990} y={560} s={0.8} />
              </g>
              {/* 走査線 */}
              {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1380} y={268 + i * 20 + (f % 20)} width={360} height={3} fill={KRP.white} opacity={0.06} />)}
            </g>
            <circle cx={1730} cy={484} r={6} fill={f % 30 < 15 ? KRP.red : "#7A2A22"} />
            <rect x={1520} y={500} width={80} height={30} fill={MP.iron} stroke={INK} strokeWidth={4} />
          </g>
          {/* 紙の時刻表 (画鋲どめ) */}
          <g transform="rotate(-2 810 500)">
            <rect x={566} y={236} width={500} height={540} rx={6} fill={INK} opacity={0.18} />
            <rect x={556} y={226} width={500} height={540} rx={6} fill="#FFFDF4" stroke={INK} strokeWidth={6} />
            <rect x={556} y={226} width={500} height={60} rx={6} fill={KRP.blueSoft} stroke={INK} strokeWidth={4} />
            <path d="M 600 256 L 760 256" stroke={INK} strokeWidth={10} strokeLinecap="round" opacity={0.55} />
            <circle cx={806} cy={230} r={13} fill={KRP.red} stroke={INK} strokeWidth={4} />
            {[340, 420, 580, 660].map((ry, i) => (
              <g key={ry} opacity={0.5}>
                <rect x={600} y={ry - 18} width={120 + rnd(31, i) * 40} height={22} rx={11} fill={KRP.gray} />
                <rect x={780} y={ry - 18} width={160 + rnd(37, i) * 60} height={22} rx={11} fill={KRP.gray} opacity={0.7} />
                <line x1={590} y1={ry + 22} x2={1022} y2={ry + 22} stroke={KRP.gray} strokeWidth={2.5} />
              </g>
            ))}
            <text x={810} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={INK}>6:00</text>
            {/* 赤丸 */}
            <ellipse cx={810} cy={494} rx={170} ry={82} fill="none" stroke={KRP.red} strokeWidth={11} strokeLinecap="round"
              strokeDasharray={830} strokeDashoffset={830 * (1 - circ)} transform="rotate(-4 810 494)" />
            {circ >= 1 && f < 52 && Array.from({ length: 6 }, (_, j) => {
              const a = (j / 6) * Math.PI * 2 + 0.3, tt = seg(f, 36, 50);
              return <line key={j} x1={810 + Math.cos(a) * (190 + tt * 30)} y1={494 + Math.sin(a) * (100 + tt * 20)}
                x2={810 + Math.cos(a) * (214 + tt * 40)} y2={494 + Math.sin(a) * (116 + tt * 26)} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={1 - tt} />;
            })}
          </g>
          {/* 脚立 */}
          <g stroke={INK} strokeWidth={6} strokeLinecap="round">
            <line x1={1096} y1={872} x2={1144} y2={624} stroke={MP.woodDark} strokeWidth={16} />
            <line x1={1096} y1={872} x2={1144} y2={624} />
            <line x1={1228} y1={872} x2={1184} y2={624} stroke={MP.woodDark} strokeWidth={16} />
            <line x1={1228} y1={872} x2={1184} y2={624} />
            {[700, 780].map((ry) => <line key={ry} x1={1112 + (872 - ry) * 0} x2={1212} y1={ry} y2={ry} stroke={MP.wood} strokeWidth={10} />)}
          </g>
          <rect x={1126} y={616} width={78} height={16} rx={4} fill={MP.woodLight} stroke={INK} strokeWidth={5} />
          {/* 1人目: 赤ペンで丸 → うなずく */}
          <g>
            <Kobito x={1165} y={618} s={0.62} f={f} pose="point" pointDir={-1} face={circ >= 1 ? "smile" : "normal"} lean={nod} gaze={[-4, 0]} />
            <g transform={`rotate(${-12 + Math.sin(f / 2) * (circ > 0 && circ < 1 ? 6 : 0)} 1070 526)`}>
              <rect x={968} y={518} width={110} height={18} rx={8} fill={KRP.red} stroke={INK} strokeWidth={4} />
              <path d="M 968 520 L 950 527 L 968 534 Z" fill={INK} />
              <rect x={1050} y={516} width={30} height={22} rx={5} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            </g>
          </g>
          {/* 2人目: クリップボードに ✓ */}
          <g>
            <Kobito x={1390} y={862} s={0.62} f={f} phase={1} pose="hold" face={check >= 1 ? "smile" : "normal"} gaze={[0, 4]} />
            <g transform="rotate(-6 1390 800) translate(0 62) scale(0.8) translate(347.5 190)">
              <rect x={1342} y={702} width={96} height={118} rx={8} fill={MP.woodLight} stroke={INK} strokeWidth={5} />
              <rect x={1354} y={720} width={72} height={90} fill={KRP.white} stroke={INK} strokeWidth={3} />
              <rect x={1372} y={694} width={36} height={16} rx={4} fill={KRP.grayDark} stroke={INK} strokeWidth={3.5} />
              {[740, 762, 784].map((ly) => <line key={ly} x1={1362} y1={ly} x2={1396} y2={ly} stroke={KRP.gray} strokeWidth={4} strokeLinecap="round" />)}
              <path d="M 1398 752 l 10 12 l 18 -26" stroke={KRP.red} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={60} strokeDashoffset={60 * (1 - check)} />
            </g>
          </g>
          {/* 3人目: 親指を立てる */}
          <g>
            <Kobito x={1600} y={862} s={0.62} f={f} phase={2} pose={thumb ? "raise" : "stand"} face={thumb ? "joy" : "normal"} />
            {thumb && (
              <g transform={`translate(${1600 + 67 * 0.62} ${862 - 232 * 0.62}) scale(${pop(seg(f, 38, 44))})`}>
                <circle r={15} fill={KRP.white} stroke={INK} strokeWidth={4} />
                <rect x={-6} y={-34} width={12} height={24} rx={6} fill={KRP.white} stroke={INK} strokeWidth={4} />
                {[0, 1, 2].map((j) => <line key={j} x1={22} y1={-20 - j * 10} x2={34} y2={-26 - j * 12} stroke={MP.kobitoHelmet} strokeWidth={5} strokeLinecap="round" />)}
              </g>
            )}
          </g>
        </g>
      )}
      {/* 白い光の転換 */}
      {flash > 0 && <rect x={-20} y={-20} width={1960} height={1120} fill={KRP.white} opacity={clamp01(flash)} />}
    </Frame>
  );
};
// -------------------------------------------------------------------
// #4 「6時に起きる」と思って眠ると、体は約1時間前から、起きる準備を始める、という研究があります。
// 格: 山 / seed 6004 / 尺 約233
// どこ: 2段の断面図。上の帯 = 寝室 Shinshitsu (sky=0) の枕元。下 = 体の中のピンクの機械室
//       (大きなハンドルの輪・歯車・ガラスの目盛り管・寝室と同じ形の小さな木の壁時計)。間はやわらかい肉の層で、ガラスの管が上下をつなぐ。
// 演出: 寝る前の「あなた」(目を開けている) の頭上に「6:00」の考えごとの吹き出し。眠りに落ちる (目が閉じて Zzz) と、
//       吹き出しは小さくなって管に吸いこまれ、機械室へ落ちる。下の Kobito が両手で受け取る。
//       壁の時計の針がぐるぐる回って 5:00 で止まり (5〜6時の間を橙の弧で示す)、「約1時間前」の札。
//       もう1人の Kobito が大きなハンドルを回しはじめ、歯車が回り、橙の「準備の水」が目盛り管をじわじわ上がる (名前の札は付けない)。
// 動き: f0-10 吹き出し / f10 眠る / f12-28 吹き出しが落ちる / f28-34 受け取る / f18-32 時計が 5:00 へ / f34-42 札 /
//       f32〜 ハンドル・歯車・水位 / カメラは上から下へゆっくりパン
const Mz004: React.FC<{ f: number }> = ({ f }) => {
  const awake = f < 10;
  const bIn = pop(seg(f, 0, 8));
  const fall = seg(f, 12, 28);
  // 吹き出しの通り道: 頭上 (760,80) → 管の口 (820,236) → 管の中を下へ → 受け取る手 (690,780)
  const bx = fall < 0.25 ? lerp(900, 820, fall / 0.25) : fall < 0.8 ? 820 : lerp(820, 700, (fall - 0.8) / 0.2);
  const by = fall < 0.25 ? lerp(84, 236, fall / 0.25) : fall < 0.8 ? lerp(236, 640, (fall - 0.25) / 0.55) : lerp(640, 760, (fall - 0.8) / 0.2);
  const bs = fall <= 0 ? bIn : lerp(1, 0.42, seg(fall, 0, 0.25));
  const caught = f >= 28;
  const tm = lerp(23 * 60, 29 * 60, easeInOut(seg(f, 18, 32)));
  const hit = seg(f, 32, 40);
  const cranking = f >= 32;
  const ang = cranking ? (f - 32) * 5 : 0;
  const lv = cranking ? 0.04 + 0.92 * (1 - Math.pow(1 - seg(f, 32, 232), 2)) : 0.04;
  const panY = lerp(0, -24, seg(f, 0, 233));
  const GX = 1560, GT = 470, GB = 820;
  const gy = GB - (GB - GT) * lv;
  const kx = Math.cos((ang * Math.PI) / 180), ky = Math.sin((ang * Math.PI) / 180);
  const WX = 1160, WY = 640;
  return (
    <Frame f={f} seed={6004}>
      <g transform={`translate(0 ${panY})`}>
        {/* ===== 下: 体の中の機械室 ===== */}
        <defs><clipPath id="mzA4low"><rect x={-40} y={420} width={2000} height={720} /></clipPath>
          <clipPath id="mzA4top"><rect x={-40} y={-40} width={2000} height={440} /></clipPath></defs>
        <g clipPath="url(#mzA4low)">
          <MzABodyWall f={f} top={410} seed={4} />
          {/* 小さな木の壁時計 (寝室と同じ形) */}
          <g transform="translate(360 620)">
            <line x1={0} y1={-96} x2={0} y2={-130} stroke={INK} strokeWidth={3} />
            <circle cx={0} cy={-132} r={6} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
            {hit > 0 && hit < 1 && <circle r={110 + hit * 50} fill="none" stroke={MP.dawn} strokeWidth={8} opacity={1 - hit} />}
            <circle r={96} fill={MP.wood} stroke={INK} strokeWidth={7} />
            <MzAClockFace r={80} minutes={tm} f={f} />
            {f >= 32 && (
              <path d={`M ${Math.sin(Math.PI * 5 / 6) * 88} ${-Math.cos(Math.PI * 5 / 6) * 88} A 88 88 0 0 1 0 88`}
                stroke={MP.dawn} strokeWidth={12} fill="none" strokeLinecap="round" opacity={seg(f, 32, 38)} />
            )}
          </g>
          <TagPlate x={360} y={780} text="約1時間前" size={40} t={seg(f, 34, 42)} />
          {/* 歯車 (ハンドルと目盛り管をつなぐ) */}
          {[[1330, 560, 46, 1], [1420, 620, 34, -1.35]].map(([gx0, gy0, gr, dir], i) => (
            <g key={i} transform={`translate(${gx0} ${gy0}) rotate(${ang * dir})`}>
              {Array.from({ length: 10 }, (_, j) => <rect key={j} x={-8} y={-gr - 12} width={16} height={18} fill={MP.brass} stroke={INK} strokeWidth={3.5} transform={`rotate(${j * 36})`} />)}
              <circle r={gr} fill={MP.brass} stroke={INK} strokeWidth={5} />
              <circle r={gr * 0.35} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
            </g>
          ))}
          {/* 管: 歯車箱 → 目盛り管の底 */}
          <path d={`M 1420 660 L 1420 840 L ${GX} 840`} stroke={INK} strokeWidth={30} fill="none" strokeLinejoin="round" />
          <path d={`M 1420 660 L 1420 840 L ${GX} 840`} stroke={C.liquid} strokeWidth={18} fill="none" strokeLinejoin="round" opacity={cranking ? 1 : 0.4} />
          {/* ガラスの目盛り管 */}
          <g>
            <rect x={GX - 62} y={GT - 34} width={124} height={22} rx={6} fill={MP.ironLight} stroke={INK} strokeWidth={5} />
            <rect x={GX - 50} y={GT - 14} width={100} height={GB - GT + 30} rx={44} fill="#E6F3F8" stroke={INK} strokeWidth={6} />
            <defs><clipPath id="mzA4g"><rect x={GX - 46} y={GT - 10} width={92} height={GB - GT + 22} rx={40} /></clipPath></defs>
            <g clipPath="url(#mzA4g)">
              <rect x={GX - 50} y={gy} width={100} height={GB - gy + 40} fill={C.liquid} />
              <path d={`M ${GX - 50} ${gy} q 25 ${-6 + Math.sin(f / 5) * 4} 50 0 t 50 0`} fill={C.liquidLight} />
              {Array.from({ length: 5 }, (_, i) => {
                const yy = GB + 10 - (((f * 2 + i * 70) % 400));
                return yy > gy + 8 ? <circle key={i} cx={GX - 20 + (i % 3) * 18} cy={yy} r={6} fill={C.liquidLight} /> : null;
              })}
            </g>
            {Array.from({ length: 7 }, (_, i) => {
              const yy = GB - ((GB - GT) / 7) * (i + 0.5);
              return <line key={i} x1={GX - 40} y1={yy} x2={GX + 20} y2={yy} stroke={INK} strokeWidth={3.5} strokeDasharray="6 6" opacity={0.6} />;
            })}
            <rect x={GX - 34} y={GT} width={10} height={GB - GT - 20} rx={5} fill={KRP.white} opacity={0.6} />
            <rect x={GX - 62} y={GB + 6} width={124} height={26} rx={6} fill={MP.ironLight} stroke={INK} strokeWidth={5} />
          </g>
          {/* 大きなハンドルの輪 */}
          <g transform={`translate(${WX} ${WY})`}>
            <circle r={128} fill="none" stroke={INK} strokeWidth={26} />
            <circle r={128} fill="none" stroke={KRP.red} strokeWidth={14} />
            {[0, 60, 120].map((a) => <line key={a} x1={-122} y1={0} x2={122} y2={0} stroke={INK} strokeWidth={10} transform={`rotate(${a + ang})`} />)}
            <circle r={26} fill={MP.brass} stroke={INK} strokeWidth={6} />
            <rect x={-14} y={0} width={28} height={220} fill={MP.ironLight} stroke={INK} strokeWidth={5} />
          </g>
          {/* 回す棒 (輪のふち → Kobito の両手) */}
          <line x1={WX + kx * 128} y1={WY + ky * 128} x2={980 + kx * 10} y2={772 + ky * 6} stroke={INK} strokeWidth={16} strokeLinecap="round" />
          <line x1={WX + kx * 128} y1={WY + ky * 128} x2={980 + kx * 10} y2={772 + ky * 6} stroke={MP.woodLight} strokeWidth={8} strokeLinecap="round" />
          <circle cx={WX + kx * 128} cy={WY + ky * 128} r={14} fill={MP.brass} stroke={INK} strokeWidth={5} />
          <Kobito x={980 + kx * 10} y={846 + ky * 6} s={0.6} f={f} phase={1} pose="hold" lean={cranking ? kx * 6 : 0}
            face={cranking ? "joy" : "normal"} />
          {cranking && [0, 1].map((j) => (
            <path key={j} d={`M ${920 - j * 16} ${700 - j * 30} q -10 -14 0 -26`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
          ))}
          {/* 受け取る Kobito */}
          <Kobito x={690} y={846} s={0.6} f={f} pose="hold" face={caught ? "smile" : "surprised"} gaze={caught ? [-5, 0] : [3, -6]} />
          {/* 管 (上の帯から下りてくる) */}
          <rect x={790} y={410} width={60} height={260} fill="#E6F3F8" opacity={0.75} stroke={INK} strokeWidth={5} />
          <path d="M 784 670 L 856 670 L 840 700 L 800 700 Z" fill={MP.ironLight} stroke={INK} strokeWidth={5} />
        </g>
        {/* ===== 間の肉の層 ===== */}
        <path d="M -40 392 Q 480 412 960 396 T 1960 400 L 1960 438 Q 1440 450 960 436 T -40 432 Z" fill={C.fleshDark} stroke={INK} strokeWidth={6} />
        {/* ===== 上: 寝室の枕元 ===== */}
        <g clipPath="url(#mzA4top)">
          <g transform="translate(19.6 -426) scale(0.98)">
            <Shinshitsu f={f} sky={0} sleeper={1} alarms={0} head={false} time={23 * 60} />
            <MzASleepHead f={f} awake={awake} dim={shinDim(0)} />
            {!awake && <MzAZzz f={f} />}
          </g>
          <rect x={-40} y={384} width={2000} height={20} fill={C.fleshDark} />
        </g>
        {/* 上下をつなぐガラス管 (寝室の中の部分) */}
        <path d="M 790 236 L 790 420 M 850 236 L 850 420" stroke={INK} strokeWidth={5} />
        <rect x={792} y={236} width={56} height={184} fill="#E6F3F8" opacity={0.45} />
        <path d="M 770 222 L 870 222 L 850 240 L 790 240 Z" fill={MP.ironLight} stroke={INK} strokeWidth={5} />
        {/* 考えごとの吹き出し「6:00」 */}
        {bs > 0.01 && (
          <g transform={`translate(${caught ? 690 : bx} ${caught ? 770 + Math.sin(f / 8) * 2 : by}) scale(${caught ? 0.42 : bs})`}>
            {fall <= 0 && <g fill={KRP.white} stroke={INK} strokeWidth={4}><circle cx={90} cy={70} r={10} /><circle cx={120} cy={92} r={7} /></g>}
            <path d="M -110 0 Q -120 -50 -60 -56 Q -30 -86 20 -70 Q 70 -90 100 -50 Q 140 -30 116 10 Q 120 52 60 54 Q 20 76 -30 58 Q -100 62 -110 0 Z"
              fill={KRP.white} stroke={INK} strokeWidth={6} />
            <text x={4} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={INK}>6:00</text>
          </g>
        )}
      </g>
    </Frame>
  );
};
// -------------------------------------------------------------------
// #5 体のほうは、もう準備万端です。
// 格: 山 / seed 6005 / 尺 約89
// どこ: #4 の体の中の機械室の続き (目盛り管は満タン・壁のランプは全部緑) → 外の寝室 Shinshitsu (sky=1)。
// 演出: ★笑いどころ。リュックを背負った Kobito 6人が駆けこんで一列に整列し、手を挙げて敬礼。先頭は緑の旗をぴっと振る (旗に字は無し)。
//       ところがカメラがすーっと引くと、機械室は寝顔の上の丸い「のぞき窓」に縮み、外の「あなた」は口を開けてよだれを垂らし、
//       夢の中のおにぎりにほほえむ幸せな熟睡。のぞき窓の中の Kobito 全員が上を見上げて汗を1滴。
// 動き: f0-16 駆けこむ / f16〜 敬礼・旗ふり / f42-58 カメラが引く (機械室が丸窓に縮む) / f58〜 よだれ・寝言の泡 / f66〜 小人が見上げて汗
const MzA5Inside: React.FC<{ f: number }> = ({ f }) => {
  const worried = f >= 66;
  return (
    <g>
      <rect x={-1200} y={-800} width={4400} height={2800} fill={C.flesh} />
      <rect x={-1200} y={860} width={4400} height={1200} fill={C.fleshDeep} />
      <MzABodyWall f={f} seed={4} />
      {/* 壁のランプ (全部緑) */}
      <rect x={300} y={268} width={1000} height={84} rx={20} fill={MP.ironLight} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => {
        const on = f >= 4 + i * 2;
        return (
          <g key={i}>
            {on && <circle cx={380 + i * 168} cy={310} r={44 + Math.sin(f / 4 + i) * 3} fill={C.lampGlow} opacity={0.6} />}
            <circle cx={380 + i * 168} cy={310} r={28} fill={on ? C.lampGreen : C.lampOff} stroke={INK} strokeWidth={5} />
            <circle cx={372 + i * 168} cy={302} r={8} fill={KRP.white} opacity={0.6} />
          </g>
        );
      })}
      {/* 満タンの目盛り管 */}
      <g>
        <rect x={1498} y={386} width={124} height={22} rx={6} fill={MP.ironLight} stroke={INK} strokeWidth={5} />
        <rect x={1510} y={406} width={100} height={420} rx={44} fill={C.liquid} stroke={INK} strokeWidth={6} />
        <path d={`M 1514 430 q 23 ${-6 + Math.sin(f / 4) * 4} 46 0 t 46 0`} stroke={C.liquidLight} strokeWidth={8} fill="none" />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={1520} y1={800 - i * 52} x2={1580} y2={800 - i * 52} stroke={INK} strokeWidth={3.5} strokeDasharray="6 6" opacity={0.5} />)}
        <rect x={1524} y={430} width={10} height={370} rx={5} fill={KRP.white} opacity={0.5} />
        <rect x={1498} y={822} width={124} height={26} rx={6} fill={MP.ironLight} stroke={INK} strokeWidth={5} />
        {/* あふれそうな泡 */}
        {[0, 1, 2].map((i) => <circle key={i} cx={1534 + i * 26} cy={392 - ((f * 1.5 + i * 20) % 40)} r={8} fill={C.liquidLight} stroke={INK} strokeWidth={2.5} opacity={0.9} />)}
      </g>
      {/* 6人の整列 */}
      {Array.from({ length: 6 }, (_, i) => {
        const x0 = 380 + i * 180;
        const arrive = easeOut(seg(f, i * 1.6, 10 + i * 1.6));
        const x = lerp(x0 - 700, x0, arrive);
        const y = 852;
        const s = 0.58;
        const lead = i === 0;
        const pose: Pose = arrive < 1 ? "run" : f >= 16 ? "raise" : "stand";
        const face: Face = worried ? "worried" : f >= 16 ? "joy" : "smile";
        return (
          <g key={i}>
            {/* リュック (背中から左右にはみ出す) */}
            <g transform={personT(x, y, s, f, i)}>
              <rect x={-74} y={-170} width={148} height={130} rx={24} fill={i % 2 ? KRP.orange : KRP.green} stroke={INK} strokeWidth={6} />
              <rect x={-36} y={-196} width={72} height={34} rx={14} fill={i % 2 ? "#C9762A" : "#5E9E5A"} stroke={INK} strokeWidth={5} />
            </g>
            <Kobito x={x} y={y} s={s} f={f} phase={i} pose={pose} face={face} gaze={worried ? [0, -8] : [0, 0]} />
            {/* 肩ひも */}
            <g transform={personT(x, y, s, f, i)} stroke={INK} strokeWidth={4}>
              <rect x={-44} y={-160} width={16} height={100} rx={6} fill={i % 2 ? "#C9762A" : "#5E9E5A"} />
              <rect x={28} y={-160} width={16} height={100} rx={6} fill={i % 2 ? "#C9762A" : "#5E9E5A"} />
            </g>
            {/* 先頭の緑の旗 */}
            {lead && f >= 16 && (() => {
              const hx = x + 67 * s, hy = y - 230 * s + Math.sin((f + i * 17) / 13) * 3;
              const wv = Math.sin(f / 3) * 14;
              return (
                <g>
                  <line x1={hx} y1={hy + 20} x2={hx} y2={hy - 150} stroke={INK} strokeWidth={9} strokeLinecap="round" />
                  <line x1={hx} y1={hy + 20} x2={hx} y2={hy - 150} stroke={MP.woodLight} strokeWidth={4} strokeLinecap="round" />
                  <path d={`M ${hx} ${hy - 148} Q ${hx + 50} ${hy - 160 + wv} ${hx + 100} ${hy - 140 + wv * 0.5} L ${hx + 96} ${hy - 86 + wv * 0.5} Q ${hx + 50} ${hy - 104 + wv} ${hx} ${hy - 92} Z`}
                    fill={C.lampGreen} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                </g>
              );
            })()}
            {/* 汗 */}
            {worried && (
              <path d={`M ${x + 34} ${y - 290 * s} q -9 14 0 20 q 9 -6 0 -20 Z`} fill={KRP.blue} stroke={INK} strokeWidth={2.5} opacity={seg(f, 66, 70)} />
            )}
          </g>
        );
      })}
    </g>
  );
};
const Mz005: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 42, 58));
  const R = lerp(1300, 300, k);
  const cx = lerp(960, 1480, k), cy = lerp(540, 330, k);
  const ins = lerp(1, 0.45, k);
  const drool = seg(f, 58, 80);
  return (
    <Frame f={f} seed={6005}>
      {/* 外: 寝室 (引いたあとに見える) */}
      {k > 0 && (
        <g transform={cam(1062, 600, 800, 640, 1.45)}>
          <Shinshitsu f={f} sky={1} sleeper={1} alarms={0} head={false} time={5 * 60 + 58} />
          <MzASleepHead f={f} mouth="open" dim={shinDim(1)} />
          {/* よだれ (口の端から枕へ) */}
          <path d={`M 1024 616 Q 1020 ${620 + drool * 24} 1026 ${624 + drool * 34}`} stroke="#BFE3F5" strokeWidth={7} fill="none" strokeLinecap="round" opacity={drool > 0 ? 1 : 0} />
          <circle cx={1026} cy={630 + drool * 34} r={6 * drool + 1} fill="#BFE3F5" stroke={INK} strokeWidth={2} opacity={drool > 0 ? 1 : 0} />
          <ellipse cx={1030} cy={662} rx={22 * drool} ry={6 * drool} fill="#BFE3F5" opacity={0.7} />
          {/* 寝言の泡: おにぎりの夢 */}
          <g transform={`translate(930 470) scale(${pop(seg(f, 60, 68))})`}>
            <circle cx={64} cy={64} r={9} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            <circle cx={40} cy={40} r={13} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            <ellipse cx={0} cy={-10} rx={56} ry={44} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
            <path d="M -26 14 Q -30 -4 -10 -30 Q 0 -42 10 -30 Q 30 -4 26 14 Q 0 22 -26 14 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
            <rect x={-14} y={-6} width={28} height={20} fill={INK} />
            <path d="M -4 -24 q 4 -4 8 0" stroke={INK} strokeWidth={3} fill="none" />
          </g>
          <MzAZzz f={f} x={990} y={540} s={0.8} />
        </g>
      )}
      {/* 中: 機械室 (丸い窓へ縮む) */}
      <defs><clipPath id="mzA5win"><circle cx={cx} cy={cy} r={R} /></clipPath></defs>
      {k > 0 && (
        <g>
          {[0, 1, 2].map((i) => {
            const t = (i + 1) / 4;
            return <circle key={i} cx={lerp(830, cx - R * 0.8, t)} cy={lerp(560, cy + R * 0.6, t)} r={(8 + i * 8) * k} fill={KRP.white} stroke={INK} strokeWidth={4} opacity={k} />;
          })}
          <circle cx={cx} cy={cy} r={R + 14} fill={KRP.white} stroke={INK} strokeWidth={7} />
        </g>
      )}
      <g clipPath="url(#mzA5win)">
        <g transform={cam(960, 560, cx, cy + 20 * k, ins)}>
          <MzA5Inside f={f} />
        </g>
      </g>
      {k > 0.95 && <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={6} />}
      {/* 窓の中の汗 (縮んでも見えるよう大きめに重ねる) */}
      {f >= 66 && k > 0.95 && [0, 1, 2].map((i) => (
        <path key={i} d={`M ${cx - 200 + i * 200} ${cy - 120} q -12 18 0 26 q 12 -8 0 -26 Z`} fill={KRP.blue} stroke={INK} strokeWidth={3} opacity={seg(f, 66 + i * 2, 72 + i * 2)} />
      ))}
    </Frame>
  );
};
// -------------------------------------------------------------------
// #6 いまも電気のない暮らしをしている、タンザニアやボリビアの人たちは、目覚ましなしで、日の出の約1時間前に起きます。
// 格: 山 / seed 6006 / 尺 約249
// どこ: 電気のない暮らしの村の夜明け前。左 = サバンナの草ぶきの丸い小屋2つとアカシアの木・たき火の残り火。
//       右 = 森の中の高床の木の家とはしご。2つの土地を地平線と朝もやでつないで1枚に。空はまだ紺で星が残り、地平線だけうっすら明るい。
//       札は地名「タンザニア」「ボリビア」と、地平線の下の太陽の位置 (点線の丸) に「−1時間」。時計はどこにも描かない。
//       v2: 地名の札の左に、棒に付けた小さな国旗 (タンザニア・ボリビア) がはためく (MzAFlag)。
// 演出: 小屋の戸口から女性 (後ろで結んだ茶色の髪・えんじの服・スカート) が出てきて大きく伸び、子どもが目をこすりながら続く。
//       男性 (短い黒髪・紺の服) はたき火の残り火に枝をくべる。右の高床の家では男性が戸口から出て伸び、
//       はしごの下で女性 (肩までの茶色の髪・ピンクの服・スカート) がかごを抱える。アカシアから鳥が1羽飛び立つ。
// 動き: カメラが左から右へゆっくりパン / f8-16 右の男性が出る / f20-34 女性が出て伸び / f30-40 子ども / f10〜 枝をくべる・火の粉・煙 /
//       f40〜 鳥が飛び立つ / 空が少しずつ白む / 星がまたたく
const Mz006: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 0, 249);
  const px = lerp(50, -50, easeInOut(t));
  const top = mixColor("#121833", "#1E2750", t * 0.6);
  const mid = mixColor("#2E3566", "#3E4478", t);
  const hor = mixColor("#5A5488", "#8A729A", t);
  const night = 0.42 - t * 0.12;
  const sav = mixColor(C.savanna, MP.nightDeep, night);
  const savD = mixColor(C.savannaDark, MP.nightDeep, night);
  const fo = mixColor(C.forest, MP.nightDeep, night);
  const foD = mixColor(C.forestDark, MP.nightDeep, night);
  const mudC = mixColor(C.mud, MP.nightDeep, night);
  const mudD = mixColor(C.mudDark, MP.nightDeep, night);
  const th = mixColor(C.thatch, MP.nightDeep, night);
  const thD = mixColor(C.thatchDark, MP.nightDeep, night);
  const wd = mixColor(MP.wood, MP.nightDeep, night);
  const wdD = mixColor(MP.woodDark, MP.nightDeep, night);
  const wOut = easeOut(seg(f, 20, 34));
  const cOut = easeOut(seg(f, 30, 40));
  const mOut = easeOut(seg(f, 8, 16));
  const branch = seg(f, 10, 30);
  const bf = Math.max(0, f - 40);
  const birdX = 236 + bf * 6.5, birdY = 512 - bf * 2.6 + Math.sin(bf / 5) * 6;
  const flap = Math.sin(f / 2) * (bf > 0 ? 1 : 0);
  return (
    <Frame f={f} seed={6006} dark bg={top}>
      <g transform={`translate(${960 + px} 540) scale(1.06) translate(-960 -540)`}>
        {/* 空 */}
        {Array.from({ length: 14 }, (_, i) => {
          const k = i / 13;
          const c = k < 0.6 ? mixColor(top, mid, k / 0.6) : mixColor(mid, hor, (k - 0.6) / 0.4);
          return <rect key={i} x={-120} y={-60 + i * 50} width={2160} height={52} fill={c} />;
        })}
        <ellipse cx={1000} cy={650} rx={900} ry={70} fill="#E3A77A" opacity={0.18 + 0.25 * t} />
        <ellipse cx={1000} cy={648} rx={420} ry={30} fill="#F6C99A" opacity={0.15 + 0.3 * t} />
        {Array.from({ length: 44 }, (_, i) => {
          const sx = rnd(61, i) * 2100 - 90, sy = rnd(67, i) * 520 - 40;
          return <circle key={i} cx={sx} cy={sy} r={i % 4 === 0 ? 3.4 : 2.2} fill="#FFF6D8"
            opacity={(1 - t * 0.55) * (1 - sy / 700) * (0.55 + 0.45 * Math.sin(f / 9 + i * 1.7))} />;
        })}
        {/* 遠い丘 */}
        <path d="M -120 650 Q 120 610 360 636 Q 600 600 860 640 Q 1100 620 1300 600 Q 1560 576 1800 620 L 2040 610 L 2040 660 L -120 660 Z" fill={mixColor("#3A3A5C", "#5A5272", t)} />
        {/* 地面: 左はサバンナ、右は森の地面。間に朝もや */}
        <path d="M -120 640 L 1240 640 Q 1180 760 1230 1140 L -120 1140 Z" fill={sav} />
        <path d="M 1180 640 L 2040 640 L 2040 1140 L 1150 1140 Q 1120 780 1180 640 Z" fill={fo} />
        <g stroke={savD} strokeWidth={4} strokeLinecap="round">
          {Array.from({ length: 40 }, (_, i) => {
            const gx = rnd(71, i) * 1180 - 100, gy = 660 + rnd(73, i) * 300;
            return <path key={i} d={`M ${gx} ${gy} l -6 -18 M ${gx} ${gy} l 2 -22 M ${gx} ${gy} l 9 -16`} />;
          })}
        </g>
        <path d="M 1100 640 Q 1210 720 1150 1140" stroke={MP.mist} strokeWidth={60} fill="none" opacity={0.08} />
        <rect x={-120} y={628} width={2160} height={40} fill={MP.mist} opacity={0.12 + 0.08 * Math.sin(f / 30)} />
        {/* ===== 左: サバンナ ===== */}
        {/* アカシア */}
        <path d="M 196 660 Q 200 600 186 560 M 192 600 Q 230 560 264 540 M 190 590 Q 150 560 124 546" stroke={wdD} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M 196 660 Q 200 600 186 560" stroke={INK} strokeWidth={4} fill="none" />
        <path d="M 60 548 Q 80 500 180 506 Q 260 486 340 516 Q 380 530 360 550 Q 240 566 60 560 Z" fill={foD} stroke={INK} strokeWidth={5} />
        <path d="M 100 540 Q 200 520 320 534" stroke={fo} strokeWidth={6} fill="none" />
        {/* 鳥 */}
        <g transform={`translate(${birdX} ${birdY})`}>
          <path d={`M -22 0 Q -12 ${-14 * flap - 6} 0 0 Q 12 ${-14 * flap - 6} 22 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={2} rx={9} ry={6} fill={C.bird} stroke={INK} strokeWidth={3} />
        </g>
        {/* 小さい小屋 */}
        <g>
          <rect x={196} y={668} width={150} height={104} fill={mudC} stroke={INK} strokeWidth={5} />
          <path d="M 246 772 L 246 712 Q 271 690 296 712 L 296 772 Z" fill="#2A1E18" stroke={INK} strokeWidth={4} />
          <path d="M 170 676 L 271 576 L 372 676 Z" fill={th} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={271} y1={584} x2={186 + i * 28} y2={672} stroke={thD} strokeWidth={3} />)}
        </g>
        {/* 大きい小屋 */}
        <g>
          <rect x={420} y={640} width={290} height={150} fill={mudC} stroke={INK} strokeWidth={6} />
          <ellipse cx={565} cy={790} rx={145} ry={12} fill={mudD} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${440 + i * 34} ${670 + (i % 3) * 30} q 10 4 20 0`} stroke={mudD} strokeWidth={4} fill="none" />)}
          <path d="M 520 790 L 520 708 Q 565 676 610 708 L 610 790 Z" fill="#2A1E18" stroke={INK} strokeWidth={5} />
          <path d="M 384 650 L 565 492 L 746 650 Q 565 668 384 650 Z" fill={th} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={565} y1={502} x2={400 + i * 33} y2={652} stroke={thD} strokeWidth={3.5} />)}
          <path d="M 392 650 Q 565 676 738 650" stroke={thD} strokeWidth={8} fill="none" />
          <path d="M 552 496 L 565 470 L 578 496" stroke={thD} strokeWidth={6} fill="none" />
        </g>
        {/* たき火の残り火 */}
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return <ellipse key={i} cx={770 + Math.cos(a) * 46} cy={800 + Math.sin(a) * 14} rx={16} ry={10} fill={mixColor(KRP.grayDark, MP.nightDeep, 0.3)} stroke={INK} strokeWidth={3.5} />;
          })}
          <ellipse cx={770} cy={798} rx={56} ry={40} fill={C.ember} opacity={0.16 + 0.05 * Math.sin(f / 5)} />
          <path d="M 740 800 L 800 790 M 748 790 L 796 804" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={752 + i * 12} cy={796 + (i % 2) * 4} r={5 + Math.sin(f / 3 + i) * 1.5} fill={C.ember} />)}
          <Flame x={770} y={792} s={0.45 + 0.25 * branch} f={f} />
          {[0, 1, 2].map((i) => {
            const sy = ((f * 0.8 + i * 40) % 120);
            return <circle key={i} cx={770 + Math.sin((f + i * 30) / 14) * 16} cy={770 - sy} r={12 + sy * 0.2} fill={MP.mist} opacity={0.25 * (1 - sy / 120)} />;
          })}
          {f >= 22 && [0, 1, 2].map((i) => {
            const sp = ((f - 22) * 2 + i * 18) % 60;
            return <circle key={`s${i}`} cx={770 + (i - 1) * 14 + Math.sin(sp / 6) * 6} cy={780 - sp * 1.6} r={3} fill={MP.flame} opacity={1 - sp / 60} />;
          })}
        </g>
        {/* 男性: 枝をくべる */}
        <Person x={850} y={806} s={0.72} f={f} pose="hold" face="normal" gaze={[-5, 4]} lean={-6} cloth={C.manBlue} clothDark={C.manBlueDark} hair="cap" />
        <line x1={lerp(842, 834, branch)} y1={720} x2={lerp(800, 780, branch)} y2={lerp(770, 790, branch)} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <line x1={lerp(842, 834, branch)} y1={720} x2={lerp(800, 780, branch)} y2={lerp(770, 790, branch)} stroke={MP.woodLight} strokeWidth={4} strokeLinecap="round" />
        {/* 子ども */}
        {cOut > 0 && <MzAChild x={lerp(560, 470, cOut)} y={804} s={0.46} f={f} phase={3} yawn={f > 44 && f < 90} cloth={C.manGray} clothDark={C.manGrayDark} />}
        {/* 女性: 戸口から出て伸び */}
        {wOut > 0 && (
          <MzAWoman x={lerp(565, 670, wOut)} y={808} s={0.72} f={f} phase={1} hairStyle="tied" cloth={C.enji} clothDark={C.enjiDark}
            pose={f >= 34 ? "banzai" : "stand"} face={f >= 34 ? "joy" : "normal"} />
        )}
        {/* ===== 右: 森と高床の家 ===== */}
        {Array.from({ length: 7 }, (_, i) => {
          const tx = 1230 + i * 120 + (i % 2) * 30, tr = 70 + (i % 3) * 18;
          return (
            <g key={i}>
              <rect x={tx - 10} y={460 - (i % 3) * 30} width={20} height={190} fill={wdD} stroke={INK} strokeWidth={4} />
              <circle cx={tx} cy={440 - (i % 3) * 30} r={tr} fill={i % 2 ? foD : fo} stroke={INK} strokeWidth={5} />
              <circle cx={tx - tr * 0.3} cy={420 - (i % 3) * 30} r={tr * 0.45} fill={mixColor(C.forestLight, MP.nightDeep, night)} opacity={0.6} />
            </g>
          );
        })}
        <g>
          {[1376, 1450, 1550, 1626].map((sx) => <rect key={sx} x={sx - 9} y={584} width={18} height={214} fill={wd} stroke={INK} strokeWidth={4} />)}
          <rect x={1336} y={566} width={330} height={24} fill={wd} stroke={INK} strokeWidth={5} />
          <rect x={1368} y={446} width={266} height={122} fill={mixColor(MP.woodLight, MP.nightDeep, night)} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={1368 + i * 44} y1={448} x2={1368 + i * 44} y2={566} stroke={wdD} strokeWidth={3} />)}
          <rect x={1462} y={474} width={72} height={94} fill="#2A1E18" stroke={INK} strokeWidth={4} />
          <path d="M 1330 456 L 1501 360 L 1672 456 Z" fill={th} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={1501} y1={368} x2={1346 + i * 36} y2={454} stroke={thD} strokeWidth={3.5} />)}
          {/* はしご */}
          <line x1={1662} y1={590} x2={1712} y2={806} stroke={INK} strokeWidth={8} />
          <line x1={1702} y1={590} x2={1752} y2={806} stroke={INK} strokeWidth={8} />
          {[630, 680, 730, 780].map((ry) => <line key={ry} x1={1662 + (ry - 590) * 0.23} y1={ry} x2={1702 + (ry - 590) * 0.23} y2={ry} stroke={wd} strokeWidth={8} />)}
        </g>
        {/* 右の男性: 戸口から出て伸び */}
        <Person x={lerp(1498, 1590, mOut)} y={568} s={0.6} f={f} phase={4} pose={f >= 16 ? "banzai" : "stand"} face={f >= 16 ? "joy" : "normal"}
          cloth={C.manGray} clothDark={C.manGrayDark} hair="cap" />
        {/* 右の女性: はしごの下でかごを抱える */}
        <MzAWoman x={1290} y={810} s={0.7} f={f} phase={5} hairStyle="long" cloth={C.pink} clothDark={C.pinkDark} pose="hold" face="smile" gaze={[-4, -3]} />
        <path d="M 1252 744 L 1328 744 L 1318 784 L 1262 784 Z" fill={mixColor(C.thatch, MP.nightDeep, 0.2)} stroke={INK} strokeWidth={4} />
        <path d="M 1260 758 L 1320 758 M 1264 770 L 1316 770" stroke={C.thatchDark} strokeWidth={3} />
        {/* 地平線の下の太陽 */}
        <g>
          <circle cx={1000} cy={690} r={44} fill={MP.dawn} opacity={0.18} />
          <circle cx={1000} cy={690} r={44} fill="none" stroke={MP.dawn} strokeWidth={6} strokeDasharray="10 9" />
          <line x1={1000} y1={642} x2={1000} y2={600} stroke={MP.dawn} strokeWidth={5} strokeDasharray="8 8" opacity={0.8} />
          <path d="M 986 614 L 1000 598 L 1014 614" stroke={MP.dawn} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        <TagPlate x={1000} y={772} text="−1時間" size={36} t={seg(f, 6, 16)} />
        <TagPlate x={430} y={390} text="タンザニア" size={40} t={seg(f, 2, 12)} />
        <TagPlate x={1500} y={292} text="ボリビア" size={40} t={seg(f, 4, 14)} />
        {/* v2: 札の左に国旗 (棒に付けた小旗・はためく) */}
        <MzAFlag x={212} y={362} kind="tz" f={f} t={seg(f, 4, 14)} id="mz006tz" />
        <MzAFlag x={1296} y={262} kind="bo" f={f} t={seg(f, 6, 16)} id="mz006bo" />
      </g>
    </Frame>
  );
};
// -------------------------------------------------------------------
// #7 しかも、毎日です。
// 格: 並 / seed 6007 / 尺 約59
// どこ: #6 のサバンナの大きい小屋の戸口に寄った一場面。土壁・草ぶきの軒・戸口の太い木の柱。右に外の空と地平線 (アカシア)。
// 演出: 同じ女性 (後ろで結んだ茶色の髪・えんじの服・スカート) が毎日の夜明け前を早回しで迎える。
//       1日ごとに空が 紺→白み→昼→夕→夜 と呼吸し、毎回 太陽が出る前の同じ暗さで伸びをして、柱に小刀で線を刻む。
//       v2: 作者「チカチカするからもっと遅くていい」→ 1日=約15コマ×3日に減らし、空の色は ease でなめらかに。
//       刻む線は1日に2本ずつ増えて 6本、3日目の最後に7本目の束ねる斜め線。3日目は戸口から子どもも眠そうに出てきて、まねをして伸び。
//       時計はどこにもない。右上に早回しの印 (▶▶。点滅させず、ゆっくり明るさがゆれる)。
// 動き: f0-44 を約15コマずつ3日の早回し (伸び → 刻む・刻む) / 刻むたびに木くず / f44〜 空が夜明け前へなめらかに戻って止まり、
//       カメラが柱へ寄る / 子どもの伸び
const MZ7_SKY: [number, string][] = [[0, "#1B2346"], [0.18, "#6A6496"], [0.32, "#9CC7E6"], [0.6, "#9CC7E6"], [0.74, "#E9925A"], [0.86, "#2A2F58"], [1, "#1B2346"]];
const smooth = (t: number) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
const mz7Sky = (p: number) => {
  for (let i = 0; i < MZ7_SKY.length - 1; i++) {
    const [a, ca] = MZ7_SKY[i], [b, cb] = MZ7_SKY[i + 1];
    if (p <= b) return mixColor(ca, cb, smooth((p - a) / (b - a)));
  }
  return MZ7_SKY[0][1];
};
const MZ7_DAYS = 3;
const MZ7_DAY = 44 / MZ7_DAYS; // 1日 ≈ 14.7コマ
// 刻む瞬間 (コマ)。1日に2本、最後の日は3つ目に束ねる斜め線 = ぜんぶで7
const MZ7_CUTS: number[] = Array.from({ length: MZ7_DAYS }, (_, d) => {
  const ps = d === MZ7_DAYS - 1 ? [0.22, 0.36, 0.5] : [0.22, 0.4];
  return ps.map((q) => (d + q) * MZ7_DAY);
}).flat();
const Mz007: React.FC<{ f: number }> = ({ f }) => {
  const ff = f < 44;
  const d = ff ? Math.floor(f / MZ7_DAY) : MZ7_DAYS - 1;
  // 早回しのあとは、次の夜明け前 (p=0.16) へなめらかに進んで止まる
  const p = ff ? (f - d * MZ7_DAY) / MZ7_DAY : 0.16 * smooth(seg(f, 44, 52));
  const sky = mz7Sky(p);
  const darkA = p < 0.25 ? lerp(0.45, 0.2, smooth(p / 0.25)) : p < 0.6 ? lerp(0.2, 0, smooth((p - 0.25) / 0.1)) : p < 0.8 ? lerp(0, 0.2, smooth((p - 0.6) / 0.2)) : lerp(0.2, 0.45, smooth((p - 0.8) / 0.2));
  const carving = !ff || p >= 0.18;
  const cut = MZ7_CUTS.filter((c) => f >= c).length;
  const marks = cut;
  const lastCut = MZ7_CUTS.filter((c) => f >= c).pop();
  const chipT = lastCut === undefined ? 0 : (f - lastCut) / 9;
  const zt = easeInOut(seg(f, 44, 59));
  const k = lerp(1, 1.3, zt);
  const sx = lerp(760, 860, zt);
  const childOut = easeOut(seg(f, 32, 40));
  return (
    <Frame f={f} seed={6007}>
      <g transform={cam(760, 600, sx, 600 - (k - 1) * 40, k)}>
        {/* 外の空と地平線 */}
        <rect x={1200} y={-40} width={800} height={760} fill={sky} />
        {p > 0.3 && p < 0.72 && (() => {
          const q = (p - 0.3) / 0.42;
          return <circle cx={lerp(1300, 1880, q)} cy={640 - Math.sin(q * Math.PI) * 460} r={44} fill="#FFE27A" stroke={INK} strokeWidth={4} />;
        })()}
        <path d="M 1200 700 Q 1500 680 1960 694 L 1960 1120 L 1200 1120 Z" fill={mixColor(C.savanna, MP.nightDeep, darkA)} />
        <path d="M 1640 700 Q 1650 640 1640 600 M 1560 590 Q 1660 560 1780 590 Q 1740 610 1580 606 Z" stroke={INK} strokeWidth={6} fill={mixColor(C.forestDark, MP.nightDeep, darkA)} />
        {/* 土壁 */}
        <rect x={-40} y={120} width={1260} height={1000} fill={C.mud} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M ${rnd(81, i) * 1180} ${200 + rnd(83, i) * 640} q 16 6 34 0`} stroke={C.mudDark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        ))}
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={rnd(85, i) * 1180} cy={220 + rnd(87, i) * 600} r={5 + rnd(89, i) * 5} fill={C.mudLight} opacity={0.6} />)}
        {/* 戸口 */}
        <path d="M 250 880 L 250 420 Q 420 300 600 420 L 600 880 Z" fill="#2A1E18" stroke={INK} strokeWidth={7} />
        <path d="M 280 880 L 280 440 Q 420 340 570 440" stroke="#3E2C22" strokeWidth={6} fill="none" />
        {/* 柱 */}
        <rect x={636} y={200} width={168} height={700} fill={MP.wood} stroke={INK} strokeWidth={7} />
        {[0.25, 0.5, 0.75].map((k2) => <path key={k2} d={`M ${636 + 168 * k2} 210 q ${(k2 - 0.5) * 20} 300 0 680`} stroke={MP.woodDark} strokeWidth={3} fill="none" opacity={0.5} />)}
        <ellipse cx={690} cy={420} rx={12} ry={20} fill="none" stroke={MP.woodDark} strokeWidth={3.5} />
        {/* 刻んだ線 */}
        {Array.from({ length: Math.min(marks, 6) }, (_, i) => (
          <g key={i}>
            <line x1={664 + i * 22} y1={636} x2={664 + i * 22} y2={744} stroke={MP.woodDark} strokeWidth={9} strokeLinecap="round" />
            <line x1={667 + i * 22} y1={638} x2={667 + i * 22} y2={742} stroke={MP.woodLight} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
        {marks >= 7 && <line x1={650} y1={734} x2={790} y2={646} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />}
        {chipT > 0 && chipT < 1 && Array.from({ length: 5 }, (_, j) => (
          <rect key={j} x={780 + j * 10 + chipT * 40} y={680 - j * 8 + chipT * chipT * 80} width={9} height={5} fill={MP.woodLight} stroke={INK} strokeWidth={1.5}
            transform={`rotate(${j * 40 + chipT * 200} ${784 + j * 10} ${680})`} opacity={1 - chipT} />
        ))}
        {/* 軒の草ぶき */}
        <path d="M -40 -40 L 1300 -40 L 1300 150 Q 640 230 -40 170 Z" fill={C.thatch} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1={-30 + i * 34} y1={0} x2={-36 + i * 34 + (i % 3) * 4} y2={172 + Math.sin(i) * 10 + (i > 18 && i < 28 ? 30 : 0)} stroke={C.thatchDark} strokeWidth={4} />
        ))}
        {/* 女性 */}
        <MzAWoman x={1000} y={882} s={1.15} f={f} hairStyle="tied" cloth={C.enji} clothDark={C.enjiDark}
          pose={carving ? "point" : "banzai"} pointDir={-1} face={carving ? "smile" : "joy"} gaze={carving ? [-6, 4] : [0, 0]} />
        {carving && (
          <g>
            <rect x={808} y={700} width={26} height={14} rx={4} fill={MP.woodDark} stroke={INK} strokeWidth={3.5} />
            <path d="M 810 700 L 772 704 L 810 712 Z" fill={KRP.silver} stroke={INK} strokeWidth={3} />
          </g>
        )}
        {/* 子ども (7日目) */}
        {childOut > 0 && (
          <MzAChild x={lerp(420, 470, childOut)} y={882} s={0.62} f={f} phase={3} pose={f >= 44 ? "banzai" : "stand"} yawn={f >= 44} />
        )}
        {/* 暗さ (夜・夜明け前) */}
        <rect x={-60} y={-60} width={2100} height={1200} fill={MP.nightDeep} opacity={darkA} />
      </g>
      {/* 早回しの印 */}
      {f < 50 && (
        <g transform="translate(1740 150)" opacity={(0.8 + 0.2 * Math.sin(f / 5)) * (1 - seg(f, 44, 50))}>
          <rect x={-90} y={-46} width={180} height={92} rx={18} fill={INK} opacity={0.7} />
          <path d="M -52 -28 L -4 0 L -52 28 Z M 4 -28 L 52 0 L 4 28 Z" fill={KRP.white} />
        </g>
      )}
    </Frame>
  );
};
// -------------------------------------------------------------------
// #8 人間は、本当は、自力で起きられる生き物なんです。
// 格: 図 / seed 6008 / 尺 約132
// どこ: 木の机の上に開いた古い生き物図鑑の見開き (黄ばんだ紙・セピアの手描き挿絵・端の虫食い・字にならない本文の線)。横にルーペと鉛筆。
// 演出: 4つの挿絵の枠。左上 = 夜明け前の枝で鳴く小鳥、左下 = 伸びをする猫、右上 = 巣穴から顔を出すリス、右下 = 「ヒト」。
//       カメラが上から下へページを送ると、ヒトの挿絵 (#6 の村の人と同じ素朴な服の男性) は寝ころんでいたのが、紙の中でむくっと起き上がり伸び。
//       上から木のゴム印がドンと落ちて、ヒトの欄に大きな赤い ◎ (紙が少しへこむ)。猫が座りなおして前足で拍手。札は「ヒト」だけ。
// 動き: f0-20 ページを上から下へ送る (寄り→引き) / f20-32 ヒトが起き上がる / f32〜 伸び / f34-40 ハンコがドン / f40-48 ハンコが上がる / f42〜 猫の拍手 / 小鳥の音符
const MzAPanel: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#F4E6C0" stroke={C.sepia} strokeWidth={5} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="none" stroke={C.sepiaLight} strokeWidth={2.5} />
    {children}
  </g>
);
const Mz008: React.FC<{ f: number }> = ({ f }) => {
  const sc = easeInOut(seg(f, 0, 20));
  const k = lerp(1.35, 1, sc);
  const fy = lerp(330, 540, sc);
  const rise = easeInOut(seg(f, 20, 32));
  const stretched = f >= 32;
  const drop = seg(f, 34, 40);
  const lift = seg(f, 40, 48);
  const stamped = f >= 40;
  const dent = stamped ? 1 - seg(f, 40, 50) : 0;
  const clap = f >= 42;
  const cl = Math.abs(Math.sin(f / 2.2));
  const SX = 1470, SY = 676;
  return (
    <Frame f={f} seed={6008}>
      <g transform={cam(960, fy, 960, 540, k)}>
        {/* 机 */}
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M -200 ${-60 + i * 150} q 560 ${rnd(91, i) * 40 - 20} 1160 0 q 580 ${rnd(93, i) * 40 - 20} 1160 0`} fill="none" />)}
        </g>
        {/* 見開き */}
        <g transform="rotate(-1.2 960 560)">
          <path d="M 150 150 L 960 130 L 1770 150 L 1790 980 L 960 1000 L 130 980 Z" fill={INK} opacity={0.25} transform="translate(14 16)" />
          <path d="M 150 140 Q 560 120 960 150 L 960 990 Q 560 960 150 980 Z" fill={C.page} stroke={INK} strokeWidth={6} />
          <path d="M 960 150 Q 1360 120 1770 140 L 1770 980 Q 1360 960 960 990 Z" fill={C.page} stroke={INK} strokeWidth={6} />
          <rect x={900} y={150} width={120} height={840} fill={C.pageDark} opacity={0.45} />
          <line x1={960} y1={150} x2={960} y2={990} stroke={INK} strokeWidth={4} />
          {/* 紙のしみと虫食い */}
          {[[230, 900, 40], [1650, 210, 30], [1180, 940, 26], [700, 180, 22]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill={C.pageEdge} opacity={0.35} />)}
          {[[156, 420], [160, 700], [1764, 560], [1766, 820], [600, 984]].map(([x, y], i) => (
            <path key={i} d={`M ${x - 10} ${y} q 6 -12 14 -4 q 10 -6 8 8 q 4 10 -10 8 q -10 4 -12 -12 Z`} fill={C.desk} stroke={C.sepia} strokeWidth={2} />
          ))}
          {/* 字にならない本文の線 */}
          {[[230, 880], [1030, 1690]].map(([x0, x1], j) => [0, 1, 2].map((i) => (
            <line key={`${j}${i}`} x1={x0} y1={850 + i * 30} x2={x1 - (i === 2 ? 220 : 0)} y2={850 + i * 30} stroke={C.sepiaLight} strokeWidth={6} strokeLinecap="round" strokeDasharray="60 14 90 14" opacity={0.7} />
          )))}
          {/* 左上: 夜明け前に鳴く小鳥 */}
          <MzAPanel x={220} y={200} w={680} h={290}>
            <rect x={232} y={212} width={656} height={266} fill="#C9C3D8" opacity={0.55} />
            <path d="M 232 440 Q 560 410 888 446" stroke={C.sepiaLight} strokeWidth={4} fill="none" />
            <path d="M 300 380 Q 520 350 760 374" stroke={C.sepia} strokeWidth={12} fill="none" strokeLinecap="round" />
            <path d="M 560 362 l 30 -26 M 650 366 l 24 18" stroke={C.sepia} strokeWidth={6} strokeLinecap="round" />
            <g transform={`translate(540 340) rotate(${Math.sin(f / 5) * 4})`}>
              <ellipse cx={0} cy={0} rx={44} ry={34} fill="#C9A27A" stroke={C.sepia} strokeWidth={5} />
              <ellipse cx={14} cy={10} rx={24} ry={18} fill={C.bird} opacity={0.8} />
              <circle cx={34} cy={-26} r={22} fill="#C9A27A" stroke={C.sepia} strokeWidth={5} />
              <circle cx={40} cy={-30} r={4} fill={C.sepia} />
              <path d={`M 54 -28 L 76 ${-34 - Math.abs(Math.sin(f / 3)) * 6} M 54 -24 L 76 -20`} stroke={C.sepia} strokeWidth={5} strokeLinecap="round" />
              <path d="M -44 0 L -76 14 L -50 18 Z" fill="#B08A64" stroke={C.sepia} strokeWidth={4} />
            </g>
            {[0, 1, 2].map((i) => {
              const tt = ((f / 30 + i / 3) % 1);
              return <text key={i} x={640 + tt * 120} y={300 - tt * 60 + i * 10} fontSize={40} fill={C.sepia} opacity={Math.sin(tt * Math.PI)} fontFamily={FONT}>♪</text>;
            })}
            <circle cx={820} cy={260} r={6} fill="#FFF6D8" /><circle cx={760} cy={236} r={4} fill="#FFF6D8" />
          </MzAPanel>
          {/* 左下: 猫 (伸び → 拍手) */}
          <MzAPanel x={220} y={520} w={680} h={290}>
            <path d="M 240 770 L 880 770" stroke={C.sepiaLight} strokeWidth={4} />
            {!clap ? (
              <g>
                <path d="M 380 768 Q 380 720 420 716 L 520 700 Q 600 640 660 660 Q 700 676 700 710 L 690 768" fill={C.tabby} stroke={C.sepia} strokeWidth={5} strokeLinejoin="round" />
                <path d="M 380 768 L 330 770 M 420 740 L 350 766" stroke={C.sepia} strokeWidth={14} strokeLinecap="round" />
                <path d="M 700 680 Q 760 600 740 560" stroke={C.tabby} strokeWidth={16} fill="none" strokeLinecap="round" />
                <path d="M 700 680 Q 760 600 740 560" stroke={C.sepia} strokeWidth={3} fill="none" />
                <circle cx={380} cy={720} r={40} fill={C.tabby} stroke={C.sepia} strokeWidth={5} />
                <path d="M 350 690 L 352 660 L 372 684 M 392 684 L 408 660 L 412 692" fill={C.tabby} stroke={C.sepia} strokeWidth={4} strokeLinejoin="round" />
                <path d="M 360 720 q 8 6 16 0 M 388 720 q 8 6 16 0" stroke={C.sepia} strokeWidth={4} fill="none" />
                {[560, 600, 640].map((x) => <path key={x} d={`M ${x} ${660 + (x - 560) * 0.1} q 6 20 -2 34`} stroke={C.tabbyDark} strokeWidth={6} fill="none" />)}
              </g>
            ) : (
              <g>
                <path d="M 470 768 Q 450 640 540 620 Q 630 640 610 768 Z" fill={C.tabby} stroke={C.sepia} strokeWidth={5} />
                <path d="M 600 760 Q 690 760 700 700" stroke={C.tabby} strokeWidth={16} fill="none" strokeLinecap="round" />
                <circle cx={540} cy={580} r={48} fill={C.tabby} stroke={C.sepia} strokeWidth={5} />
                <path d="M 502 548 L 500 510 L 528 538 M 552 538 L 580 510 L 578 548" fill={C.tabby} stroke={C.sepia} strokeWidth={4} strokeLinejoin="round" />
                <path d="M 516 576 q 8 -8 16 0 M 548 576 q 8 -8 16 0" stroke={C.sepia} strokeWidth={4} fill="none" />
                <path d="M 532 600 q 8 8 16 0" stroke={C.sepia} strokeWidth={4} fill="none" />
                {/* 拍手する前足 */}
                <ellipse cx={540 - 10 - cl * 26} cy={660} rx={14} ry={22} fill={C.tabby} stroke={C.sepia} strokeWidth={4} transform={`rotate(20 ${540 - 10 - cl * 26} 660)`} />
                <ellipse cx={540 + 10 + cl * 26} cy={660} rx={14} ry={22} fill={C.tabby} stroke={C.sepia} strokeWidth={4} transform={`rotate(-20 ${540 + 10 + cl * 26} 660)`} />
                {cl < 0.3 && <g stroke={C.sepia} strokeWidth={4} strokeLinecap="round"><line x1={510} y1={626} x2={500} y2={612} /><line x1={540} y1={620} x2={540} y2={604} /><line x1={570} y1={626} x2={580} y2={612} /></g>}
              </g>
            )}
          </MzAPanel>
          {/* 右上: 巣穴から顔を出すリス */}
          <MzAPanel x={1020} y={200} w={680} h={290}>
            <path d="M 1040 470 Q 1360 330 1680 470 Z" fill="#C9A87A" stroke={C.sepia} strokeWidth={5} />
            <ellipse cx={1360} cy={430} rx={80} ry={40} fill="#5A4430" stroke={C.sepia} strokeWidth={5} />
            <g transform={`translate(1360 ${414 - Math.abs(Math.sin(f / 14)) * 10})`}>
              <path d="M -60 10 Q -60 -60 0 -64 Q 60 -60 60 10 Z" fill={C.squirrel} stroke={C.sepia} strokeWidth={5} />
              <path d="M -40 -50 L -46 -84 L -20 -60 M 40 -50 L 46 -84 L 20 -60" fill={C.squirrel} stroke={C.sepia} strokeWidth={4} strokeLinejoin="round" />
              <circle cx={-20} cy={-26} r={6} fill={C.sepia} /><circle cx={20} cy={-26} r={6} fill={C.sepia} />
              <ellipse cx={0} cy={-6} rx={22} ry={14} fill="#E9C79A" />
              <circle cx={0} cy={-12} r={5} fill={C.sepia} />
              <path d="M -30 10 q 6 -16 14 0 M 16 10 q 6 -16 14 0" fill={C.squirrel} stroke={C.sepia} strokeWidth={4} />
            </g>
            <path d="M 1450 440 Q 1560 380 1520 300 Q 1500 260 1540 250" stroke={C.squirrel} strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.9} />
          </MzAPanel>
          {/* 右下: ヒト */}
          <MzAPanel x={1020} y={520} w={680} h={290}>
            <path d="M 1040 772 L 1680 772" stroke={C.sepiaLight} strokeWidth={4} />
            <rect x={1080} y={758} width={300} height={16} rx={6} fill="#C9A87A" stroke={C.sepia} strokeWidth={3} />
            {stamped && dent > 0 && <circle cx={SX} cy={SY} r={130} fill={C.pageDark} opacity={0.35 * dent} />}
            <g transform={`translate(0 ${-46 * (1 - rise)}) rotate(${lerp(-90, 0, rise)} 1230 770)`}>
              <Person x={1230} y={772} s={0.8} f={f} pose={stretched ? "banzai" : "stand"} face={stretched ? "joy" : rise > 0 ? "normal" : "normal"}
                cloth="#8C9DB2" clothDark="#6B7B90" hair="cap" still={rise < 1} />
            </g>
            {rise > 0 && rise < 1 && <g stroke={C.sepia} strokeWidth={5} strokeLinecap="round"><path d="M 1100 640 q -20 30 0 60" fill="none" /><path d="M 1080 620 q -30 50 0 100" fill="none" /></g>}
            {/* ◎ */}
            {stamped && (
              <g transform={`translate(${SX} ${SY}) rotate(-8)`} filter="url(#stampRough)" opacity={0.9}>
                <circle r={100} fill="none" stroke={KRP.red} strokeWidth={16} />
                <circle r={58} fill="none" stroke={KRP.red} strokeWidth={14} />
              </g>
            )}
          </MzAPanel>
          <TagPlate x={1590} y={570} text="ヒト" size={36} />
        </g>
        {/* ゴム印 (落ちる → 上がる) */}
        {f >= 30 && lift < 1 && (() => {
          const yy = stamped ? lerp(SY, -300, easeInOut(lift)) : lerp(-300, SY, drop * drop);
          return (
            <g transform={`translate(${SX} ${yy})`}>
              <ellipse cx={0} cy={0} rx={130} ry={24} fill={KRP.red} stroke={INK} strokeWidth={5} />
              <rect x={-120} y={-60} width={240} height={60} rx={10} fill={MP.woodLight} stroke={INK} strokeWidth={6} />
              <rect x={-34} y={-180} width={68} height={122} rx={14} fill={MP.wood} stroke={INK} strokeWidth={6} />
              <circle cx={0} cy={-196} r={46} fill={MP.wood} stroke={INK} strokeWidth={6} />
              <path d="M -24 -212 q 14 -14 30 -8" stroke={MP.woodLight} strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          );
        })()}
        {stamped && lift < 0.6 && (
          <g stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={1 - lift / 0.6}>
            {[-1, 1].map((sd) => [0, 1, 2].map((i) => <line key={`${sd}${i}`} x1={SX + sd * (150 + i * 10)} y1={SY - 30 + i * 30} x2={SX + sd * (190 + i * 14)} y2={SY - 40 + i * 34} />))}
          </g>
        )}
        {/* 机の上のルーペと鉛筆 */}
        <g transform="translate(1830 900) rotate(-30)">
          <rect x={-14} y={70} width={28} height={140} rx={10} fill={INK} />
          <circle r={86} fill="#DCEFF8" opacity={0.55} stroke={INK} strokeWidth={10} />
          <circle r={86} fill="none" stroke={MP.brass} strokeWidth={5} />
          <path d="M -50 -30 Q -30 -60 6 -64" stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
        <g transform="translate(80 1000) rotate(-14)">
          <rect x={0} y={-12} width={260} height={24} fill={KRP.yellow} stroke={INK} strokeWidth={4} />
          <path d="M 260 -12 L 300 0 L 260 12 Z" fill="#E9C79A" stroke={INK} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};
// -------------------------------------------------------------------
// #9 なのに、起きられない。
// 格: 山 / seed 6009 / 尺 約60
// どこ: すっかり朝の寝室 Shinshitsu (sky=2)。カーテンのすき間から白い朝日、壁の時計は 7:40。
// 演出: スマホは5つ同時に鳴りっぱなし (右上の吹き出し = SumahoAlarm 5行とも赤)。ぶるぶる震えてナイトテーブルの端へずり寄る。
//       朝日の帯が床→布団→顔へ移り、顔に届くと「あなた」は寝たまま眉をしかめ、掛け布団を頭までかぶる (寝ぐせだけ出る)。
//       スマホはとうとう端から落ちて床にぽすん、それでも鳴り続ける。窓ガラスに #8 の ◎ の残像が一瞬映って消える。
// 動き: f0-14 カメラが窓から布団へパン / f8-28 朝日の帯が顔へ / f26 しかめ顔 / f28-36 布団をかぶる / f0-30 スマホがずり寄る /
//       f32-40 落ちる / f40-46 ぽすん / f44-56 ◎ の残像 / 音の線がずっと出る
const Mz009: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 14));
  const fx = lerp(760, 1150, pan), fyy = lerp(330, 620, pan), k = lerp(1.35, 1.25, pan);
  const beam = easeInOut(seg(f, 8, 28));
  const tx = lerp(640, 1050, beam), ty = lerp(810, 598, beam);
  const frown = seg(f, 24, 28);
  const cover = easeOut(seg(f, 28, 36));
  const slide = seg(f, 0, 32);
  const fall = seg(f, 32, 40);
  const jit = Math.sin(f * 2.7) * 4;
  const phx = fall > 0 ? lerp(1466, 1540, fall) : lerp(1330, 1466, slide) + jit;
  const phy = fall > 0 ? lerp(610, 818, fall * fall) : 606;
  const phr = fall > 0 ? lerp(-10, 84, fall) : -10 + Math.sin(f * 2.3) * 3;
  const puff = seg(f, 40, 50);
  const ghost = f >= 44 && f < 58 ? Math.sin(seg(f, 44, 58) * Math.PI) : 0;
  return (
    <Frame f={f} seed={6009}>
      <g transform={cam(fx, fyy, 960, 520, k)}>
        <Shinshitsu f={f} sky={2} sleeper={1} alarms={0} head={false} time={7 * 60 + 40} />
        <MzANoPhone />
        {cover < 1 && <MzASleepHead f={f} frown={frown} />}
        {cover > 0 && <MzAHump f={f} t={cover} id="mzA9hump" />}
        {cover < 1 && f < 26 && <MzAZzz f={f} />}
        {frown > 0.5 && cover < 0.5 && <g stroke={INK} strokeWidth={4} strokeLinecap="round"><path d="M 1100 520 l 10 -16 M 1120 530 l 16 -10" /></g>}
        {/* 朝日の帯 */}
        <polygon points={`560,486 940,486 ${tx + 90},${ty} ${tx - 90},${ty}`} fill={C.sun} opacity={0.42} />
        <ellipse cx={tx} cy={ty} rx={110} ry={34} fill={C.sun} opacity={0.55} />
        {/* ◎ の残像 (窓ガラス) */}
        {ghost > 0 && (
          <g transform="translate(870 390)" opacity={ghost * 0.6}>
            <circle r={60} fill="none" stroke={KRP.red} strokeWidth={10} />
            <circle r={34} fill="none" stroke={KRP.red} strokeWidth={9} />
          </g>
        )}
        {/* スマホ (ずり寄って落ちる) */}
        <circle cx={phx} cy={phy} r={84 + Math.sin(f / 2) * 8} fill={C.phoneScreen} opacity={0.3} />
        <MzAPhone x={phx} y={phy} rot={phr} ring f={f} />
        <MzASound x={phx} y={phy} r={56} f={f} color={MP.bell} w={7} />
        <g transform={`translate(${phx + 36} ${phy - 58}) scale(${0.9 + 0.1 * Math.sin(f / 3)})`}>
          <circle r={22} fill={MP.bell} stroke={INK} strokeWidth={4} />
          <text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>5</text>
        </g>
        {slide > 0 && fall <= 0 && <g stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.7}><line x1={phx - 44} y1={640} x2={phx - 70} y2={640} /><line x1={phx - 40} y1={628} x2={phx - 60} y2={628} /></g>}
        {puff > 0 && puff < 1 && (
          <g opacity={1 - puff}>
            {[-2, -1, 0, 1, 2].map((i) => <circle key={i} cx={1540 + i * 26 * (0.5 + puff)} cy={830 - Math.abs(i) * 4 - puff * 12} r={10 + puff * 14} fill={KRP.white} stroke={INK} strokeWidth={3} />)}
          </g>
        )}
      </g>
      {/* 吹き出し: 5つとも鳴っている画面 */}
      <g>
        <path d="M 1620 520 L 1560 600 L 1660 530 Z" fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <SumahoAlarm x={1690} y={320} s={0.5} f={f} on={[0, 1, 2, 3, 4]} />
      </g>
    </Frame>
  );
};
// -------------------------------------------------------------------
// #10 犯人は、あなたの体ではありません。
// 格: 並 / seed 6010 / 尺 約95
// どこ: #9 の続きの朝の寝室 Shinshitsu (sky=2)。頭までかぶった布団のこんもりと、床に落ちて静かになったスマホ。
// 演出: 部屋が暗くなり、天井から探偵のスポットライトの丸い光がぐるぐると部屋を探って、布団のこんもりの上でぴたっと止まる。
//       布団のすき間から Kobito が3人ぞろぞろ顔を出し、光をまぶしそうに手でさえぎり、そろって首をぶんぶん横に振る (×)。
//       そして3人同時に壁の時計をびしっと指さし、スポットライトがつられて時計へ移る。
// 動き: f0-20 スポットライトが探る / f20 布団で止まる / f20-24 布団がもぞもぞ / f24-30 小人が出てまぶしがる /
//       f30-40 首を振る / f40〜 時計を指さす / f44-58 光が時計へ / カメラは少し寄る
const MZ10_PATH: [number, number][] = [[400, 300], [1400, 720], [620, 820], [1100, 260], [786, 640]];
const Mz010: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.4, 1.5, seg(f, 0, 95));
  const toW = (wx: number, wy: number): [number, number] => [960 + (wx - 1180) * k, 520 + (wy - 470) * k];
  const hump = toW(1060, 560);
  const clk = toW(1360, 250);
  let sx: number, sy: number;
  if (f < 20) {
    const q = (f / 20) * (MZ10_PATH.length - 1);
    const i = Math.min(Math.floor(q), MZ10_PATH.length - 2), r = easeInOut(q - i);
    const a = MZ10_PATH[i], b = i + 1 === MZ10_PATH.length - 1 ? hump : MZ10_PATH[i + 1];
    sx = lerp(a[0], b[0], r); sy = lerp(a[1], b[1], r);
  } else {
    const m = easeInOut(seg(f, 44, 58));
    sx = lerp(hump[0], clk[0], m); sy = lerp(hump[1], clk[1], m);
  }
  const R = 190 + (f >= 44 && f < 58 ? 0 : Math.sin(f / 6) * 4);
  const wig = f >= 20 && f < 24 ? Math.sin(f * 2) * 6 : 0;
  const pops = [0, 1, 2].map((i) => pop(seg(f, 24 + i * 1.5, 30 + i * 1.5)));
  const shake = f >= 30 && f < 40;
  const pointing = f >= 40;
  return (
    <Frame f={f} seed={6010} dark>
      <g transform={cam(1180, 470, 960, 520, k)}>
        <Shinshitsu f={f} sky={2} sleeper={1} alarms={0} head={false} time={7 * 60 + 42} />
        <MzANoPhone />
        <g transform={`translate(0 ${wig})`}>
          <MzAHump f={f} t={1} id="mzA10hump" />
        </g>
        {/* 床のスマホ (静か) */}
        <MzAPhone x={1540} y={818} rot={84} f={f} />
        {/* 3人の小人 */}
        {[[968, 568], [1065, 530], [1160, 566]].map(([x, y], i) => {
          const sc = pops[i];
          if (sc <= 0) return null;
          const lean = shake ? Math.sin(f * 1.7 + i) * 10 : pointing ? -10 : 0;
          const pose: Pose = pointing ? "point" : shake ? "stand" : "raise";
          const face: Face = pointing ? "worried" : shake ? "worried" : "surprised";
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
              <Kobito x={x} y={y} s={0.38} f={f} phase={i} pose={pose} face={face} lean={lean} gaze={pointing ? [5, -5] : [0, 0]} />
              {shake && <g stroke={INK} strokeWidth={3.5} strokeLinecap="round"><path d={`M ${x - 36} ${y - 90} q -8 6 0 12 M ${x + 36} ${y - 90} q 8 6 0 12`} fill="none" /></g>}
            </g>
          );
        })}
        <XMark x={1062} y={410} s={0.55} t={f >= 31 && f < 44 ? seg(f, 31, 35) : 0} />
      </g>
      {/* 暗い部屋 + スポットライトの丸 */}
      <defs>
        <mask id="mzA10spot">
          <rect x={-20} y={-20} width={1960} height={1120} fill={KRP.white} />
          <circle cx={sx} cy={sy} r={R} fill="#000" />
        </mask>
      </defs>
      <rect x={-20} y={-20} width={1960} height={1120} fill={MP.nightDeep} opacity={0.62} mask="url(#mzA10spot)" />
      <polygon points={`${900},-20 ${1020},-20 ${sx + R * 0.9},${sy} ${sx - R * 0.9},${sy}`} fill={C.spot} opacity={0.12} />
      <circle cx={sx} cy={sy} r={R} fill={C.spot} opacity={0.14} />
      <circle cx={sx} cy={sy} r={R} fill="none" stroke={C.spot} strokeWidth={6} opacity={0.5} />
      {/* 天井のライト */}
      <g transform="translate(960 30)">
        <rect x={-60} y={-40} width={120} height={40} rx={10} fill={MP.iron} stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={4} rx={50} ry={12} fill={C.spot} stroke={INK} strokeWidth={4} />
      </g>
    </Frame>
  );
};
// -------------------------------------------------------------------
// #11 犯人は、時計の向こう側にいます。
// 格: 山 / seed 6011 / 尺 約91
// どこ: 朝の寝室 Shinshitsu の壁の時計 → その大写し (丸い文字盤・数字12個・秒針・木の縁・壁紙)。
// 演出: カメラが時計にぐんぐん寄ると、文字盤が左のちょうつがいを軸に扉のようにぎいっと内側へ開く。
//       向こうには、暗く長い石の通路 (アーチが奥へ連なる)。床には奥から順に、いろいろな時代の足跡が浮かぶ
//       (いちばん奥 = 木のサンダル → わらじ → 革靴 → 手前 = 長靴)。人影は描かない。
//       奥から冷たい風が吹き出して、左のカーテンがばたばた。右手前には時計をのぞく「あなた」の後ろ姿 (後頭部と肩)、
//       その肩に乗った Kobito が風に飛ばされそうなヘルメットを両手で押さえ、通路の奥を見つめてごくり。
// 動き: f0-16 寝室から時計へ寄る / f12-16 大写しへ切り替え / f16-30 文字盤が開く / f26-40 足跡が奥から順に浮かぶ /
//       f28〜 風・カーテン・ヘルメット / f42〜 カメラが通路の奥へ少し進む
const MzAPrint: React.FC<{ kind: number; s: number; flip: boolean; o: number }> = ({ kind, s, flip, o }) => {
  const fill = "#2A2832", hi = C.tunnelStoneLight;
  return (
    <g transform={`scale(${s * (flip ? -1 : 1)} ${s * 0.45})`} opacity={o}>
      {kind === 0 && (/* 木のサンダル */ <g><rect x={-22} y={-50} width={44} height={100} rx={8} fill={fill} stroke={hi} strokeWidth={3} /><line x1={-22} y1={-14} x2={22} y2={-14} stroke={hi} strokeWidth={4} /><line x1={-22} y1={18} x2={22} y2={18} stroke={hi} strokeWidth={4} /></g>)}
      {kind === 1 && (/* わらじ */ <g><ellipse cx={0} cy={0} rx={24} ry={52} fill={fill} stroke={hi} strokeWidth={3} />{[-30, -10, 10, 30].map((yy) => <line key={yy} x1={-20} y1={yy} x2={20} y2={yy + 4} stroke={hi} strokeWidth={2.5} />)}<line x1={0} y1={-48} x2={0} y2={48} stroke={hi} strokeWidth={2.5} /></g>)}
      {kind === 2 && (/* 革靴 */ <g><path d="M -20 -10 Q -24 -54 0 -56 Q 24 -54 20 -10 Q 14 6 10 10 L -10 10 Q -14 6 -20 -10 Z" fill={fill} stroke={hi} strokeWidth={3} /><rect x={-14} y={22} width={28} height={30} rx={8} fill={fill} stroke={hi} strokeWidth={3} /></g>)}
      {kind === 3 && (/* 長靴 */ <g><path d="M -26 -10 Q -30 -60 0 -62 Q 30 -60 26 -10 L 24 56 L -24 56 Z" fill={fill} stroke={hi} strokeWidth={3} />{[-40, -20, 0, 20, 40].map((yy) => <path key={yy} d={`M -20 ${yy} l 10 -6 l 10 6 l 10 -6 l 10 6`} stroke={hi} strokeWidth={2.5} fill="none" />)}</g>)}
    </g>
  );
};
const Mz011: React.FC<{ f: number }> = ({ f }) => {
  const zt = easeInOut(seg(f, 0, 16));
  const wk = lerp(1.4, 3.0, zt);
  const xf = seg(f, 12, 16);
  const open = easeInOut(seg(f, 16, 30));
  const wind = seg(f, 26, 32);
  const kk = lerp(1, 1.12, easeInOut(seg(f, 42, 91)));
  const CX = 1150, CY = 450, RR = 276, FR = 230;
  const V = -30;
  const arch = (s: number) => {
    const w = 270 * s, b = V + 330 * s, tp = V - 150 * s, cr = V - 270 * s;
    return `M ${-w} ${b} L ${-w} ${tp} Q ${-w} ${cr} 0 ${cr} Q ${w} ${cr} ${w} ${tp} L ${w} ${b} Z`;
  };
  const flap = Math.sin(f / 2.2) * 50 * wind, flap2 = Math.sin(f / 1.7 + 1) * 30 * wind;
  return (
    <Frame f={f} seed={6011}>
      {/* 寝室から寄る */}
      {xf < 1 && (
        <g transform={cam(1360, 250, lerp(1200, CX, zt), lerp(380, CY, zt), wk)}>
          <Shinshitsu f={f} sky={2} sleeper={1} alarms={0} head={false} time={7 * 60 + 43} />
          <MzANoPhone />
          <MzAHump f={f} t={1} id="mzA11hump" />
        </g>
      )}
      {/* 大写し */}
      {xf > 0 && (
        <g opacity={xf} transform={cam(CX, CY, CX, CY, kk)}>
          <rect x={-40} y={-40} width={2000} height={1160} fill={C.wall} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 180} y={-40} width={36} height={1160} fill={C.wallStripe} opacity={0.7} />)}
          {Array.from({ length: 12 }, (_, i) => [0, 1, 2, 3].map((j) => <circle key={`${i}${j}`} cx={18 + i * 180} cy={60 + j * 300 + (i % 2) * 150} r={9} fill={C.wallDot} opacity={0.6} />))}
          {/* 吊りひもと釘 */}
          <line x1={CX} y1={CY - RR} x2={CX} y2={CY - RR - 110} stroke={INK} strokeWidth={8} />
          <circle cx={CX} cy={CY - RR - 116} r={16} fill={MP.brass} stroke={INK} strokeWidth={6} />
          {/* 木の縁 */}
          <circle cx={CX} cy={CY} r={RR} fill={MP.wood} stroke={INK} strokeWidth={12} />
          <circle cx={CX} cy={CY} r={RR - 18} fill="none" stroke={MP.woodLight} strokeWidth={8} opacity={0.6} />
          {[0.2, 0.45, 0.7].map((a) => <path key={a} d={`M ${CX + Math.cos(a * 6.28) * (RR - 10)} ${CY + Math.sin(a * 6.28) * (RR - 10)} q 10 10 24 6`} stroke={MP.woodDark} strokeWidth={4} fill="none" />)}
          {/* 文字盤の向こう: 石の通路 */}
          <defs><clipPath id="mzA11hole"><circle cx={CX} cy={CY} r={FR} /></clipPath></defs>
          <g clipPath="url(#mzA11hole)">
            <g transform={`translate(${CX} ${CY}) scale(${FR / 300})`}>
              <rect x={-320} y={-320} width={640} height={640} fill={C.tunnel} />
              {Array.from({ length: 8 }, (_, j) => {
                const dj = j / 8, s = 1 - dj * 0.88;
                return (
                  <g key={j}>
                    <path d={arch(s)} fill={mixColor(C.tunnelStone, C.tunnel, dj * 0.9)} stroke={INK} strokeWidth={4} />
                    <path d={arch(s * 0.92)} fill={mixColor(C.tunnelMid, C.tunnel, dj)} />
                    {j < 3 && [-0.8, -0.4, 0.4, 0.8].map((q) => <line key={q} x1={270 * s * q} y1={V - 240 * s} x2={270 * s * q * 1.06} y2={V - 260 * s} stroke={INK} strokeWidth={3} opacity={0.5} />)}
                  </g>
                );
              })}
              <circle cx={0} cy={V} r={14} fill="#3E4A66" opacity={0.6 + 0.2 * Math.sin(f / 7)} />
              {/* 床 */}
              <polygon points={`-300,320 300,320 32,${V + 330 * 0.12} -32,${V + 330 * 0.12}`} fill={mixColor(C.tunnelStone, C.tunnel, 0.35)} stroke={INK} strokeWidth={4} />
              {[-0.6, -0.2, 0.2, 0.6].map((q) => <line key={q} x1={300 * q} y1={320} x2={32 * q} y2={V + 40} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}
              {[0.15, 0.35, 0.6].map((q) => { const s = 1 - q * 0.88; return <line key={q} x1={-270 * s} y1={V + 330 * s} x2={270 * s} y2={V + 330 * s} stroke={INK} strokeWidth={2.5} opacity={0.4} />; })}
              {/* 足跡 (奥から順に浮かぶ) */}
              {Array.from({ length: 8 }, (_, i) => {
                const t = 0.1 + i * 0.105;
                const s = 1 - t * 0.88;
                const kind = i < 2 ? 3 : i < 4 ? 2 : i < 6 ? 1 : 0;
                const left = i % 2 === 0;
                const o = seg(f, 26 + (7 - i) * 1.8, 30 + (7 - i) * 1.8);
                const glow = f > 42 ? 0.85 + 0.15 * Math.sin(f / 6 + i) : 1;
                return (
                  <g key={i} transform={`translate(${(left ? -1 : 1) * 60 * s} ${V + 330 * s - 34 * s})`}>
                    <MzAPrint kind={kind} s={s * 0.95} flip={!left} o={o * glow} />
                  </g>
                );
              })}
              {/* 奥からの冷たい風 */}
              {wind > 0 && Array.from({ length: 6 }, (_, n) => {
                const ph = ((f * 0.05 + n / 6) % 1);
                const a = -0.9 + n * 0.36;
                const r0 = 20 + ph * 300;
                return <line key={n} x1={Math.cos(a + Math.PI) * r0 * 0.9} y1={V + Math.sin(a) * r0 * 0.5} x2={Math.cos(a + Math.PI) * (r0 + 60)} y2={V + Math.sin(a) * (r0 + 60) * 0.5}
                  stroke={C.wind} strokeWidth={5} strokeLinecap="round" opacity={wind * Math.sin(ph * Math.PI) * 0.8} />;
              })}
            </g>
          </g>
          {/* 文字盤の扉 (左のちょうつがい) */}
          <g transform={`translate(${CX - FR} ${CY}) scale(${Math.max(0.12, Math.cos(open * 1.38))} 1) translate(${FR} 0)`}>
            <MzAClockFace r={FR} minutes={7 * 60 + 43} f={f} face={mixColor(KRP.white, "#9AA0AE", open * 0.7)} />
            {open > 0 && <circle r={FR} fill={INK} opacity={open * 0.25} />}
          </g>
          {[-0.5, 0.5].map((q) => <rect key={q} x={CX - FR - 14} y={CY + q * FR * 0.9 - 22} width={28} height={44} rx={5} fill={MP.brass} stroke={INK} strokeWidth={5} />)}
          {open > 0.05 && open < 1 && <g stroke={INK} strokeWidth={6} strokeLinecap="round"><path d={`M ${CX + FR + 30} ${CY - 60} q 20 60 0 120`} fill="none" /><path d={`M ${CX + FR + 54} ${CY - 80} q 26 80 0 160`} fill="none" /></g>}
          {/* 通路から部屋へ吹き出す風 */}
          {wind > 0 && Array.from({ length: 9 }, (_, n) => {
            const ph = ((f * 0.035 + n / 9) % 1);
            const yy = CY - 200 + n * 50 + Math.sin(f / 5 + n) * 10;
            const x0 = CX - 100 - ph * 1100;
            return <path key={n} d={`M ${x0} ${yy} q -60 ${-14 + (n % 2) * 28} -130 0`} stroke={C.wind} strokeWidth={7} fill="none" strokeLinecap="round" opacity={wind * Math.sin(ph * Math.PI)} />;
          })}
          {/* 左のカーテン (ばたばた) */}
          <path d={`M -40 -40 L ${150 + flap} -40 C ${170 + flap2} 260 ${120 + flap} 560 ${200 + flap2 * 1.4} 1120 L -40 1120 Z`} fill={C.curtain} stroke={INK} strokeWidth={8} />
          {[40, 100].map((lx, i) => <path key={lx} d={`M ${lx} -20 Q ${lx + flap * (0.4 + i * 0.3)} 400 ${lx + flap2 * (0.6 + i * 0.4) + 20} 1100`} stroke={C.curtainDark} strokeWidth={8} fill="none" />)}
          {/* 「あなた」の後ろ姿 (肩と後頭部) */}
          <path d="M 1440 1120 L 1470 900 Q 1500 852 1600 846 L 1820 846 Q 1920 852 1950 900 L 1990 1120 Z" fill={MP.you} stroke={INK} strokeWidth={8} />
          <path d="M 1640 846 Q 1710 880 1780 846" stroke={MP.youDark} strokeWidth={12} fill="none" />
          <path d="M 1710 880 L 1710 1100" stroke={MP.youDark} strokeWidth={5} opacity={0.5} />
          <ellipse cx={1586} cy={720} rx={20} ry={30} fill={KRP.white} stroke={INK} strokeWidth={6} />
          <ellipse cx={1834} cy={720} rx={20} ry={30} fill={KRP.white} stroke={INK} strokeWidth={6} />
          <rect x={1670} y={790} width={80} height={64} fill={KRP.white} stroke={INK} strokeWidth={7} />
          <circle cx={1710} cy={700} r={124} fill={INK} stroke={INK} strokeWidth={8} />
          <path d="M 1700 640 q 22 -4 20 18 q -6 18 -28 10" stroke={KRP.grayDark} strokeWidth={5} fill="none" strokeLinecap="round" />
          {wind > 0 && [0, 1, 2].map((i) => <path key={i} d={`M ${1600 + i * 30} ${600 + i * 4} q ${-20 - Math.sin(f / 2 + i) * 14} -10 -40 ${-18 + i * 6}`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />)}
          {/* 肩の Kobito */}
          <Kobito x={1530} y={858} s={0.55} f={f} pose={wind > 0 ? "hang" : "stand"} face="surprised" gaze={[-5, -4]} lean={wind > 0 ? -6 + Math.sin(f / 2) * 2 : 0} />
          {wind > 0 && (
            <g>
              <g stroke={C.wind} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
                <path d={`M 1470 ${700 + Math.sin(f / 2) * 4} q 20 -6 40 0`} fill="none" />
                <path d={`M 1464 ${724 + Math.sin(f / 2.5) * 4} q 20 -6 40 0`} fill="none" />
              </g>
              <path d="M 1566 712 q -9 14 0 20 q 9 -6 0 -20 Z" fill={KRP.blue} stroke={INK} strokeWidth={2.5} opacity={seg(f, 34, 38)} />
              <g stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={f % 20 < 10 && f > 36 ? 1 : 0}>
                <path d="M 1510 790 q 10 6 20 0" fill="none" /><path d="M 1512 802 q 8 5 16 0" fill="none" />
              </g>
            </g>
          )}
        </g>
      )}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_001: (f) => <Mz001 f={f} />,
  mz_002: (f) => <Mz002 f={f} />,
  mz_003: (f) => <Mz003 f={f} />,
  mz_004: (f) => <Mz004 f={f} />,
  mz_005: (f) => <Mz005 f={f} />,
  mz_006: (f) => <Mz006 f={f} />,
  mz_007: (f) => <Mz007 f={f} />,
  mz_008: (f) => <Mz008 f={f} />,
  mz_009: (f) => <Mz009 f={f} />,
  mz_010: (f) => <Mz010 f={f} />,
  mz_011: (f) => <Mz011 f={f} />,
};

export const MZ_A_MOTIFS: string[] = [
  "mz_001", // #1
  "mz_002", // #2
  "mz_003", // #3
  "mz_004", // #4
  "mz_005", // #5
  "mz_006", // #6
  "mz_007", // #7
  "mz_008", // #8
  "mz_009", // #9
  "mz_010", // #10
  "mz_011", // #11
];

export const mezaAScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
