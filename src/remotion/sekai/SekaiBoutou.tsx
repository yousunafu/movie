// つながる世界史・冒頭。1945年8月15日 正午、ラジオの前。
// 作風の見本も兼ねる1枚。6点法を1文ずつ満たすこと:
// ①ラジオに寄る ②座敷を置く ③ラジオを作り込んで数カットで使う
// ④引き→寄り ⑤正午に音が鳴り出す ⑥聞き手が頭を下げる
//
// 配色は2通り作って比べる。レイアウト・カメラ・動きは完全に同じにして、
// 違いを「色だけ」に閉じ込める (A/B比較が成立する条件)。
//   mono  = 墨の背景に生成りの線画。強い色は錆朱だけ
//   color = 障子を光源にした逆光の座敷。人は黒い影になり、顔を描かなくて済む

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  SKP,
  SEKAI_SERIF,
  SEKAI_FONT,
  YearTag,
  NotifyCard,
  Cam,
  seg,
  easeOut,
  clamp01,
  W,
  H,
} from "./parts";

export type Pal = {
  bg: string;
  wall: string;
  shojiPaper: string;
  shojiLine: string;
  shojiOp: number;
  wood: string;
  woodDark: string;
  line: string; // 輪郭
  tatami: string;
  tatamiLine: string;
  radioBody: string;
  radioGrille: string;
  radioDial: string;
  radioKnob: string;
  figure: string;
  figureHair: string;
  figureRim: string;
  lit: boolean; // 逆光の光を焚くか
};

const MONO: Pal = {
  bg: SKP.sumi,
  wall: "#2A231D",
  shojiPaper: "#453A30",
  shojiLine: SKP.kinari,
  shojiOp: 0.3,
  wood: "#332A23",
  woodDark: "#2E261F",
  line: SKP.kinari,
  tatami: "#241D18",
  tatamiLine: SKP.kinari,
  radioBody: "#3A2F27",
  radioGrille: "#201914",
  radioDial: "#1A1410",
  radioKnob: "#241C16",
  figure: "#5C554F",
  figureHair: "#3E3A36",
  figureRim: SKP.hai,
  lit: false,
};

// 作者が本番用として承認した配色。他の文の絵もこれを基準にする
export const COLOR: Pal = {
  bg: "#241A12",
  wall: "#4A3524",
  shojiPaper: "#F6E7BC", // 真昼の光が透けた障子紙
  shojiLine: "#4A3321", // 桟の焦茶
  shojiOp: 1,
  wood: "#4E3522",
  woodDark: "#382416",
  line: "#20150E",
  tatami: "#7E7A4E",
  tatamiLine: "#5E5A38",
  radioBody: "#8A5329",
  radioGrille: "#2A1C12",
  radioDial: "#F0E0B4",
  radioKnob: "#3A2415",
  figure: "#1C1410", // 逆光なので人は黒い影
  figureHair: "#120C09",
  figureRim: "#D9A764", // 輪郭だけ金色に光る
  lit: true,
};

// ===== ③真空管ラジオ。ここだけ作り込んで冒頭の数カットで使い回す =====
export const Radio: React.FC<{
  x: number;
  y: number;
  s?: number;
  f: number;
  P: Pal;
  uid: string;
}> = ({ x, y, s = 1, f, P, uid }) => {
  const K = P.line;
  const needle = 86 + Math.sin(f / 7) * 2.2;
  const glow = 0.45 + Math.sin(f / 5) * 0.16;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 卓に落ちる影。これが無いと筐体が宙に浮いて見える */}
      <ellipse cx={14} cy={146} rx={226} ry={18} fill="#000" opacity={P.lit ? 0.34 : 0.22} />
      {/* 木の筐体。上辺をかまぼこ形にするのが当時の形 */}
      <path
        d="M -200,120 L -200,-70 C -200,-150 -120,-196 0,-196
           C 120,-196 200,-150 200,-70 L 200,120 Z"
        fill={P.lit ? `url(#${uid}-wood)` : P.radioBody}
        stroke={K}
        strokeWidth={4}
      />
      {/* 逆光なので右上から光が回り込む */}
      {P.lit && (
        <path
          d="M -200,120 L -200,-70 C -200,-150 -120,-196 0,-196
             C 120,-196 200,-150 200,-70 L 200,120 Z"
          fill={`url(#${uid}-radiolight)`}
        />
      )}
      {/* 木目 */}
      <g opacity={P.lit ? 0.2 : 0.26}>
        {[-150, -96, -40, 24, 86, 150].map((dx, i) => (
          <path
            key={i}
            d={`M ${dx},112 C ${dx + 10},40 ${dx - 8},-60 ${dx + 4},-180`}
            stroke={P.lit ? "#C98A4C" : K}
            strokeWidth={1.6}
            fill="none"
          />
        ))}
      </g>
      {/* スピーカーの丸い格子 */}
      <circle cx={-92} cy={-56} r={78} fill={P.radioGrille} stroke={K} strokeWidth={3.4} />
      <g clipPath={`url(#${uid}-grille)`} opacity={0.72}>
        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={i}
            x1={-92 - 78 + i * 11}
            y1={-134}
            x2={-92 - 78 + i * 11}
            y2={22}
            stroke={P.lit ? "#8A6A4A" : K}
            strokeWidth={2.6}
          />
        ))}
      </g>
      <clipPath id={`${uid}-grille`}>
        <circle cx={-92} cy={-56} r={75} />
      </clipPath>
      {[26, 48, 70].map((r, i) => (
        <circle
          key={i}
          cx={-92}
          cy={-56}
          r={r}
          fill="none"
          stroke={P.lit ? "#8A6A4A" : K}
          strokeWidth={1.8}
          opacity={0.44}
        />
      ))}
      {/* 周波数の窓。針が小さく揺れている */}
      <rect x={16} y={-120} width={166} height={62} rx={4} fill={P.radioDial} stroke={K} strokeWidth={3} />
      <g opacity={P.lit ? 0.62 : 0.8}>
        {Array.from({ length: 11 }, (_, i) => (
          <line
            key={i}
            x1={26 + i * 14.6}
            y1={-70}
            x2={26 + i * 14.6}
            y2={i % 2 === 0 ? -90 : -80}
            stroke={P.lit ? "#5A3A1E" : P.line}
            strokeWidth={1.6}
          />
        ))}
      </g>
      <line x1={needle} y1={-116} x2={needle} y2={-62} stroke={SKP.sabi} strokeWidth={4} />
      {/* 真空管の灯 */}
      <circle cx={99} cy={-128} r={P.lit ? 15 : 12} fill={SKP.kohaku} opacity={glow} />
      {P.lit && <circle cx={99} cy={-128} r={30} fill={SKP.kohaku} opacity={glow * 0.3} />}
      {/* つまみ2つ */}
      {[
        [48, 30],
        [150, 30],
      ].map(([dx, dy], i) => (
        <g key={i}>
          <circle cx={dx} cy={dy} r={30} fill={P.radioKnob} stroke={K} strokeWidth={3} />
          <circle cx={dx} cy={dy} r={12} fill={P.lit ? "#6B4A2C" : "#4A3A2E"} stroke={K} strokeWidth={2} />
          <line
            x1={dx}
            y1={dy}
            x2={dx + Math.cos(i ? 0.7 : 2.3) * 26}
            y2={dy + Math.sin(i ? 0.7 : 2.3) * 26}
            stroke={P.lit ? "#D9A764" : K}
            strokeWidth={3}
          />
        </g>
      ))}
      {/* 脚 */}
      <rect x={-172} y={120} width={44} height={22} fill={P.woodDark} stroke={K} strokeWidth={3} />
      <rect x={128} y={120} width={44} height={22} fill={P.woodDark} stroke={K} strokeWidth={3} />
    </g>
  );
};

// ⑤正午に音が鳴り出す。錆朱の波紋がラジオの左右へ広がる
const Ripples: React.FC<{ x: number; y: number; f: number; start?: number }> = ({
  x,
  y,
  f,
  start = 26,
}) => {
  const t = Math.max(f - start, 0);
  if (t <= 0) return null;
  return (
    <g>
      {[1, -1].map((dir) =>
        [0, 1, 2, 3].map((i) => {
          const p = (((t / 46 + i * 0.25) % 1) + 1) % 1;
          const ex = x + dir * (120 + p * 230);
          const r = 150 + p * 240;
          const dy = 130 + p * 110;
          return (
            <path
              key={`${dir}-${i}`}
              d={`M ${ex},${y - dy} A ${r},${r} 0 0 ${dir > 0 ? 1 : 0} ${ex},${y + dy}`}
              fill="none"
              stroke={SKP.sabi}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={(1 - p) * 0.6}
            />
          );
        }),
      )}
    </g>
  );
};

// ②座敷を置く。障子・柱・畳
export const Zashiki: React.FC<{ f: number; P: Pal; uid: string }> = ({ f, P, uid }) => {
  const open = easeOut(seg(f, 0, 30));
  return (
    <g opacity={open}>
      <rect x={0} y={0} width={W} height={740} fill={P.wall} />
      {/* 障子4枚。色付けでは「光源」になる */}
      <g opacity={P.shojiOp}>
        {[0, 1, 2, 3].map((p) => {
          const x0 = 250 + p * 360;
          return (
            <g key={p}>
              <rect
                x={x0}
                y={120}
                width={330}
                height={560}
                fill={P.lit ? `url(#${uid}-shoji)` : P.shojiPaper}
                stroke={P.shojiLine}
                strokeWidth={3}
              />
              {/* 組子は紙の部分だけ。桟を細く密に入れると障子に見える。
                  粗い格子を全面に引くと方眼紙になってしまう (第16条) */}
              {Array.from({ length: 10 }, (_, r) => (
                <line
                  key={r}
                  x1={x0 + 4}
                  y1={150 + r * 39}
                  x2={x0 + 326}
                  y2={150 + r * 39}
                  stroke={P.shojiLine}
                  strokeWidth={P.lit ? 2.6 : 1.2}
                  opacity={0.9}
                />
              ))}
              {Array.from({ length: 5 }, (_, c) => (
                <line
                  key={c}
                  x1={x0 + 55 + c * 55}
                  y1={124}
                  x2={x0 + 55 + c * 55}
                  y2={540}
                  stroke={P.shojiLine}
                  strokeWidth={P.lit ? 2.6 : 1.2}
                  opacity={0.9}
                />
              ))}
              {/* 腰板。ここで格子が切れるので障子だと分かる */}
              <rect
                x={x0}
                y={540}
                width={330}
                height={140}
                fill={P.wood}
                stroke={P.shojiLine}
                strokeWidth={3}
              />
              <line
                x1={x0}
                y1={540}
                x2={x0 + 330}
                y2={540}
                stroke={P.woodDark}
                strokeWidth={7}
              />
              {/* 引手 */}
              <rect
                x={x0 + (p % 2 === 0 ? 292 : 20)}
                y={400}
                width={18}
                height={54}
                rx={9}
                fill={P.woodDark}
                stroke={P.shojiLine}
                strokeWidth={2}
              />
            </g>
          );
        })}
      </g>
      {/* 柱・鴨居 */}
      <rect x={176} y={60} width={46} height={700} fill={P.wood} stroke={P.line} strokeWidth={3} opacity={P.lit ? 1 : 0.6} />
      <rect x={1698} y={60} width={46} height={700} fill={P.wood} stroke={P.line} strokeWidth={3} opacity={P.lit ? 1 : 0.6} />
      <rect x={176} y={60} width={1568} height={46} fill={P.woodDark} stroke={P.line} strokeWidth={3} opacity={P.lit ? 1 : 0.6} />
      {/* 畳 */}
      <rect x={0} y={740} width={W} height={H - 740} fill={P.tatami} />
      {P.lit && <rect x={0} y={740} width={W} height={H - 740} fill={`url(#${uid}-floor)`} />}
      <line x1={0} y1={740} x2={W} y2={740} stroke={P.line} strokeWidth={3.4} opacity={P.lit ? 0.8 : 0.7} />
      <g opacity={P.lit ? 0.4 : 0.17}>
        {[812, 908, 1016].map((y, i) => (
          <line key={i} x1={0} y1={y} x2={W} y2={y} stroke={P.tatamiLine} strokeWidth={P.lit ? 5 : 2} />
        ))}
        {[560, 1360].map((x, i) => (
          <line key={i} x1={x} y1={740} x2={x} y2={H} stroke={P.tatamiLine} strokeWidth={P.lit ? 5 : 2} />
        ))}
      </g>
    </g>
  );
};

// ⑥聞き手は棒立ちさせない。正午の少しあとに頭を下げる。
// 顔は描かない (背中を向けた影) ので、動きだけで反応を出す。
const Listener: React.FC<{
  x: number;
  s: number;
  f: number;
  bowAt: number;
  flip?: boolean;
  P: Pal;
}> = ({ x, s, f, bowAt, flip, P }) => {
  const bow = easeOut(clamp01((f - bowAt) / 34));
  // 腰から下は字幕帯に食われる。肩が帯の上に出る高さに置かないと「頭だけの玉」になる
  return (
    <g transform={`translate(${x} ${H + 10}) scale(${flip ? -s : s} ${s})`}>
      <g transform={`rotate(${bow * 7} 0 -60)`}>
        {/* 正座して背を向けている。裾が床に広がり、肩が張り、腕が脇に落ちる。
            丸いかたまりにすると「人」ではなく「玉」に見えるので、
            裾・肩・腕・襟の4つは必ず出す */}
        <path
          d="M -168,0 C -176,-62 -140,-96 -112,-118
             C -118,-180 -86,-236 0,-236
             C 86,-236 118,-180 112,-118
             C 140,-96 176,-62 168,0 Z"
          fill={P.figure}
          stroke={P.figureRim}
          strokeWidth={P.lit ? 4 : 3}
        />
        {/* 腕。胴の輪郭の内側に線を1本落とすだけで肩が立つ */}
        {[-1, 1].map((d) => (
          <path
            key={d}
            d={`M ${d * 86},-196 C ${d * 126},-150 ${d * 136},-78 ${d * 128},-6`}
            fill="none"
            stroke={P.figureRim}
            strokeWidth={P.lit ? 3.4 : 2.4}
            opacity={0.66}
          />
        ))}
        {/* 背の縫い目 */}
        <path d="M 0,-222 L 0,-20" stroke={P.figureRim} strokeWidth={2.2} opacity={0.34} />
        {/* 襟。後ろ襟はV字に抜ける */}
        <path
          d="M -58,-228 C -34,-192 34,-192 58,-228"
          fill="none"
          stroke={P.figureRim}
          strokeWidth={5}
          opacity={0.8}
        />
        <g transform={`translate(0 ${-236}) rotate(${bow * 13})`}>
          {/* うなじ */}
          <path d="M -24,-6 L -20,-40 L 20,-40 L 24,-6 Z" fill={P.figureHair} />
          <ellipse cx={0} cy={-62} rx={66} ry={72} fill={P.figure} stroke={P.figureRim} strokeWidth={P.lit ? 4 : 3} />
          {/* 髪。影の中でも頭の形が分かるように一段暗く置く */}
          <path d="M -66,-62 C -54,-128 54,-128 66,-62 C 38,-92 -38,-92 -66,-62 Z" fill={P.figureHair} />
        </g>
      </g>
    </g>
  );
};

// 1枚ぶんの絵だけ (SVGの中身)。他の文のファイルからも引けるように分けてある。
// 文#20 は障子の光を背景に使うので Zashiki を、文#5 は Radio を直接引く。
export const SekaiBoutouArt: React.FC<{ f: number; color?: boolean }> = ({
  f,
  color = true,
}) => {
  const P = color ? COLOR : MONO;
  const uid = color ? "c" : "m";
  return (
    <>
      <rect x={0} y={0} width={W} height={H} fill={P.bg} />
      <defs>
          {/* 障子紙。中央がいちばん明るい */}
          <linearGradient id={`${uid}-shoji`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF6DC" />
            <stop offset="62%" stopColor={P.shojiPaper} />
            <stop offset="100%" stopColor="#D9C089" />
          </linearGradient>
          <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0D79A" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#1A120B" stopOpacity={0.62} />
          </linearGradient>
          {/* 筐体の木。上が明るく下が沈むと、平らな板ではなく箱に見える */}
          <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#A66634" />
            <stop offset="46%" stopColor="#8A5329" />
            <stop offset="100%" stopColor="#4A2A13" />
          </linearGradient>
          <linearGradient id={`${uid}-radiolight`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD79A" stopOpacity={0.34} />
            <stop offset="70%" stopColor="#FFD79A" stopOpacity={0} />
          </linearGradient>
          <radialGradient id={`${uid}-vig`} cx="50%" cy="42%" r="74%">
            <stop offset="52%" stopColor="#120D08" stopOpacity={0} />
            <stop offset="100%" stopColor="#120D08" stopOpacity={color ? 0.8 : 0.88} />
          </radialGradient>
        </defs>

        {/* ④引き→寄り。ラジオへ少しずつ寄る */}
        <Cam f={f} from={[0, 0, 1]} to={[0, -26, 1.13]} start={0} end={170}>
          <Zashiki f={f} P={P} uid={uid} />
          {/* 卓。天板を厚くして脚を太くしないと、ラジオの重さを支えて見えない */}
          <g>
            <rect x={470} y={766} width={980} height={14} rx={3} fill={P.woodDark} opacity={0.9} />
            <rect x={482} y={728} width={956} height={40} rx={6} fill={P.wood} stroke={P.line} strokeWidth={3.4} />
            <rect x={540} y={768} width={44} height={128} fill={P.woodDark} stroke={P.line} strokeWidth={3} />
            <rect x={1336} y={768} width={44} height={128} fill={P.woodDark} stroke={P.line} strokeWidth={3} />
            <rect x={584} y={792} width={752} height={16} fill={P.woodDark} stroke={P.line} strokeWidth={2.6} opacity={0.8} />
          </g>
          <Ripples x={960} y={470} f={f} />
          {/* ①寄る。ラジオは主役なので画面短辺の半分以上 (580px) を取る */}
          <Radio x={960} y={522} s={1.45} f={f} P={P} uid={uid} />
          {/* 障子から差し込む光の帯と、そこに舞う埃 */}
          {color && (
            <g opacity={easeOut(seg(f, 6, 46))}>
              <path d="M 300,120 L 760,120 L 430,1080 L -220,1080 Z" fill="#FFE6AE" opacity={0.17} />
              <path d="M 1180,120 L 1620,120 L 2180,1080 L 1520,1080 Z" fill="#FFE6AE" opacity={0.15} />
              <path d="M 700,120 L 900,120 L 760,1080 L 480,1080 Z" fill="#FFF0C6" opacity={0.1} />
              {Array.from({ length: 34 }, (_, i) => {
                const px = 200 + ((i * 251) % 1520);
                const py = 180 + ((i * 437 + f * 0.7) % 820);
                return (
                  <circle key={i} cx={px} cy={py} r={i % 3 === 0 ? 3.2 : 2} fill="#FFE9BC" opacity={0.42} />
                );
              })}
            </g>
          )}
          <Listener x={300} s={1.5} f={f} bowAt={64} P={P} />
          <Listener x={1624} s={1.62} f={f} bowAt={76} flip P={P} />
        </Cam>

        <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-vig)`} />
        <YearTag year="一九四五年八月" place="日本" f={f} />
        <g opacity={easeOut(seg(f, 10, 30))}>
          <rect x={72} y={62} width={154} height={76} rx={4} fill={SKP.sumiDeep} opacity={0.72} />
          <text x={96} y={118} fontFamily={SEKAI_SERIF} fontSize={40} fill={SKP.kinari} letterSpacing={6}>
            正午
          </text>
          <line x1={96} y1={132} x2={204} y2={132} stroke={SKP.sabi} strokeWidth={4} />
        </g>
    </>
  );
};

export const SekaiBoutouScene: React.FC<{ reaction?: string; color?: boolean }> = ({
  reaction,
  color,
}) => {
  const f = useCurrentFrame();
  const P = color ? COLOR : MONO;
  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <SekaiBoutouArt f={f} color={color} />
      </svg>
      {reaction && <NotifyCard text={reaction} f={f - 30} expr="surprise" />}
    </AbsoluteFill>
  );
};

const Band: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      backgroundColor: "rgba(21, 17, 14, 0.93)",
      borderTop: `3px solid ${SKP.sabi}`,
      padding: "22px 0 26px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        margin: "0 auto",
        width: "88%",
        fontFamily: SEKAI_FONT,
        fontSize: 46,
        fontWeight: 600,
        color: SKP.kinari,
        lineHeight: 1.5,
        letterSpacing: 1,
      }}
    >
      {text}
    </div>
  </div>
);

// 作風の見本。前半=地の文 (字幕帯) / 後半=反応 (通知カード)
export const SEKAI_BOUTOU_FRAMES = 300;

export const SekaiBoutouPreview: React.FC<{ color?: boolean }> = ({ color }) => {
  const f = useCurrentFrame();
  const phase2 = f >= 150;
  return (
    <AbsoluteFill>
      <SekaiBoutouScene
        color={color}
        reaction={phase2 ? "一番強気だった人が、最後に負けを引き受けてる……" : undefined}
      />
      {!phase2 && <Band text="多くの日本人にとって、初めて聞く天皇の声でした。" />}
    </AbsoluteFill>
  );
};
