// 「ゆる落書きノート」作風 (2026-11-16 試作)。デザインの元: docs/キャラ案/メインキャラ派生案.html の B2。
// 青いボールペンの線 + 蛍光ペン + 罫線ノート。からくりの「大きなたて長の目」は受け継ぐ。
// セーブ回では「背景と人物だけ」をこの作風にし、基板・テレビ・ゲーム機・断面などの精巧な部品はそのまま残す。
// 名前回では全部をこの作風で描く (YoruNoteName.tsx)。
import React from "react";
import { NOTE_HAND, rnd } from "./YoruShared";

export const PEN = "#2F4A8A";
export const PEN_RED = "#D3402E";
export const MK = { yellow: "#F7E26B", pink: "#F4A6C0", green: "#A8E6A0", blue: "#9FD3F0", orange: "#F9C08A" } as const;
export const pen = { stroke: PEN, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
export const PAPER = "#FBFAF4";

// 罫線ノートの紙 (カメラと一緒に動くよう、広めに敷く)
export const NotePaper: React.FC<{ x?: number; y?: number; w?: number; h?: number; margin?: number }> = ({
  x = -500, y = -500, w = 2900, h = 2100, margin = 150,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={PAPER} />
    {Array.from({ length: Math.ceil(h / 44) }).map((_, i) => (
      <line key={i} x1={x} y1={y + i * 44} x2={x + w} y2={y + i * 44} stroke="#C4D8EC" strokeWidth={2} />
    ))}
    <line x1={margin} y1={y} x2={margin} y2={y + h} stroke="#EBA9A9" strokeWidth={3} />
  </g>
);

// 手書きの文字
export const Hand: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; rot?: number; anchor?: "start" | "middle" | "end"; opacity?: number }> = ({
  x, y, text, size = 32, color = PEN, rot = 0, anchor = "middle", opacity = 1,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={NOTE_HAND} fontWeight={700} fontSize={size} fill={color} opacity={opacity}
    transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>{text}</text>
);

// 手書きの矢印 (x1,y1 → x2,y2。少し曲がる)
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; bend?: number; color?: string; t?: number }> = ({
  x1, y1, x2, y2, bend = 30, color = PEN, t = 1,
}) => {
  const mx = (x1 + x2) / 2 - ((y2 - y1) / Math.hypot(x2 - x1, y2 - y1)) * bend;
  const my = (y1 + y2) / 2 + ((x2 - x1) / Math.hypot(x2 - x1, y2 - y1)) * bend;
  const a = Math.atan2(y2 - my, x2 - mx);
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.15;
  return (
    <g opacity={t > 0 ? 1 : 0}>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
      {t >= 1 && (
        <path d={`M ${x2 - 22 * Math.cos(a - 0.45)} ${y2 - 22 * Math.sin(a - 0.45)} L ${x2} ${y2} L ${x2 - 22 * Math.cos(a + 0.45)} ${y2 - 22 * Math.sin(a + 0.45)}`}
          stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
};

// ===== 落書きの人 (B2 の形。足元 x,y) =====
export type NHair = "cap" | "bowl" | "chonmage" | "meiji" | "bob" | "hood" | "work";
export type NFaceN = "normal" | "wide" | "smile" | "jito" | "worried";
const SH_Y = -142;
const SH_X = 42;
const ARM_L = 74;
export const noteHand = (x: number, y: number, s: number, side: -1 | 1, ang: number): [number, number] => {
  const r = (ang * Math.PI) / 180;
  return [x + (side * SH_X - ARM_L * Math.sin(r)) * s, y + (SH_Y + ARM_L * Math.cos(r)) * s];
};
export const NoteFolk: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  hair?: NHair; face?: NFaceN; gaze?: [number, number]; armL?: number; armR?: number;
  wear?: string; kimono?: boolean; hideLegs?: boolean; lean?: number; still?: boolean; hideArms?: boolean;
  light?: -1 | 1; // 懐中電灯を持つ手
}> = ({
  x, y, s = 1, f = 0, phase = 0, hair = "cap", face = "normal", gaze = [0, 0], armL = 0, armR = 0,
  wear, kimono = false, hideLegs = false, lean = 0, still = false, hideArms = false, light,
}) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 14) * 2.5;
  const blink = ((f + phase * 41) % 101) < 5 && f > 3 && face !== "smile";
  const [gx, gy] = gaze;
  const arm = (side: -1 | 1, ang: number) => {
    const sx = side * SH_X;
    const r = (ang * Math.PI) / 180;
    const hx = sx - ARM_L * Math.sin(r);
    const hy = SH_Y + ARM_L * Math.cos(r);
    const mx = (sx + hx) / 2 + side * 8;
    const my = (SH_Y + hy) / 2;
    return (
      <g>
        <path d={`M ${sx} ${SH_Y} Q ${mx} ${my} ${hx} ${hy}`} {...pen} />
        <circle cx={hx} cy={hy} r={8} fill={PAPER} stroke={PEN} strokeWidth={4.5} />
        {light === side && (
          <g transform={`translate(${hx} ${hy}) rotate(${ang})`}>
            <rect x={-8} y={0} width={16} height={34} rx={4} fill={PAPER} stroke={PEN} strokeWidth={4} />
            <path d="M -11 34 L 11 34 L 13 44 L -13 44 Z" fill={MK.yellow} stroke={PEN} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
      </g>
    );
  };
  const hy = -232;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* フード (後ろ) */}
      {hair === "hood" && <path d="M -70 -200 Q -86 -316 0 -322 Q 86 -316 70 -200 Q 40 -176 0 -176 Q -40 -176 -70 -200 Z" fill={PAPER} {...{ stroke: PEN, strokeWidth: 5, strokeLinejoin: "round" }} />}
      {/* ボブの後ろ髪 */}
      {hair === "bob" && <path d="M -64 -190 Q -78 -300 0 -304 Q 78 -300 64 -190 Q 54 -182 44 -192 L -44 -192 Q -54 -182 -64 -190 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={5} strokeLinejoin="round" />}
      {/* 脚 */}
      {!hideLegs && (kimono ? (
        <g>
          <path d="M -40 -64 L -46 -8 L 46 -8 L 40 -64" {...pen} fill={PAPER} />
          <path d="M -46 -6 l -14 0 M 46 -6 l 14 0" {...pen} />
        </g>
      ) : (
        <g>
          <path d="M -18 -58 L -20 -10 L -36 -8" {...pen} />
          <path d="M 18 -58 L 22 -10 L 38 -10" {...pen} />
        </g>
      ))}
      {!hideArms && light !== -1 && arm(-1, armL)}
      {!hideArms && light !== 1 && arm(1, armR)}
      {/* 胴 (豆の形) */}
      <path d="M -40 -168 Q -54 -110 -48 -58 Q 0 -48 48 -58 Q 54 -110 40 -168 Z" fill={PAPER} {...{ stroke: PEN, strokeWidth: 5, strokeLinejoin: "round" }} />
      {wear && <path d="M -36 -160 Q -48 -110 -42 -64 Q 0 -56 42 -64 Q 48 -110 36 -160 Z" fill={wear} opacity={0.55} />}
      {kimono && (
        <g>
          <path d="M -24 -166 L 4 -128 M 24 -166 L -14 -110" {...pen} strokeWidth={4} />
          <path d="M -48 -98 Q 0 -90 48 -98 L 48 -84 Q 0 -76 -48 -84 Z" fill={PEN} fillOpacity={0.75} stroke={PEN} strokeWidth={3} />
        </g>
      )}
      {hair === "hood" && (
        <g>
          <path d="M -12 -164 L -14 -132 M 12 -164 L 14 -132" {...pen} strokeWidth={3.5} />
          <circle cx={-14} cy={-128} r={4} fill={PEN} />
          <circle cx={14} cy={-128} r={4} fill={PEN} />
        </g>
      )}
      {!hideArms && light !== undefined && arm(light, light === -1 ? armL : armR)}
      {/* 頭 (少しいびつな卵形) */}
      <path d="M 0 -296 C 44 -296 66 -262 62 -226 C 58 -186 30 -166 -2 -168 C -38 -170 -64 -194 -62 -232 C -60 -270 -40 -296 0 -296 Z" fill={PAPER} {...{ stroke: PEN, strokeWidth: 5 }} />
      {/* 髪 */}
      {(hair === "cap" || hair === "bowl") && (
        <path d="M -60 -242 Q -58 -294 2 -296 Q 62 -292 62 -236 Q 44 -258 22 -254 Q 8 -266 -10 -256 Q -36 -262 -60 -242 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={3} />
      )}
      {hair === "bob" && (
        <path d="M -60 -224 Q -64 -300 0 -300 Q 64 -300 60 -224 Q 52 -214 48 -214 Q 46 -248 36 -258 Q 24 -250 12 -262 Q 0 -250 -12 -262 Q -24 -250 -36 -258 Q -46 -248 -48 -214 Q -52 -214 -60 -224 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={3} />
      )}
      {hair === "chonmage" && (
        <g>
          <path d="M -60 -220 Q -64 -250 -50 -262 Q -44 -244 -48 -216 Z M 60 -220 Q 64 -250 50 -262 Q 44 -244 48 -216 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={3} />
          <path d="M -6 -296 Q -14 -322 6 -330 Q 14 -312 8 -296 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={3} />
          <path d="M -30 -280 Q 0 -292 30 -280" stroke={PEN} strokeWidth={3} fill="none" opacity={0.5} />
        </g>
      )}
      {hair === "meiji" && (
        <path d="M -60 -236 Q -62 -296 2 -296 Q 62 -294 60 -238 Q 48 -262 24 -266 Q 10 -256 -8 -270 Q -38 -264 -60 -236 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={3} />
      )}
      {hair === "hood" && (
        <g>
          <path d="M -46 -262 Q -30 -290 0 -292 Q 30 -290 46 -262 Q 36 -270 24 -262 Q 12 -276 0 -264 Q -12 -276 -24 -262 Q -36 -270 -46 -262 Z" fill={PEN} fillOpacity={0.85} stroke={PEN} strokeWidth={3} />
          <path d="M -64 -246 Q -72 -312 0 -314 Q 72 -312 64 -246" fill="none" stroke={PEN} strokeWidth={5} />
        </g>
      )}
      {hair === "work" && (
        <g>
          <path d="M -58 -246 Q -58 -300 0 -302 Q 58 -300 58 -246 Z" fill={MK.blue} stroke={PEN} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -60 -246 L 80 -246 Q 86 -238 76 -234 L -60 -238 Z" fill={MK.blue} stroke={PEN} strokeWidth={4.5} strokeLinejoin="round" />
        </g>
      )}
      {/* 目 */}
      {blink ? (
        <path d="M -34 -218 l 22 0 M 12 -218 l 22 0" {...pen} strokeWidth={4} />
      ) : face === "smile" ? (
        <path d="M -34 -214 Q -23 -230 -12 -214 M 12 -214 Q 23 -230 34 -214" {...pen} strokeWidth={4} />
      ) : (
        <g>
          {[-22, 24].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={hy + 12} rx={12} ry={17} fill={PAPER} stroke={PEN} strokeWidth={4} />
              <circle cx={cx + 2 + gx} cy={hy + 16 + gy} r={face === "wide" ? 4 : 5.5} fill={PEN} />
              {face === "jito" && <path d={`M ${cx - 13} ${hy + 10} L ${cx + 13} ${hy + 8}`} {...pen} strokeWidth={4.5} />}
              {face === "jito" && <path d={`M ${cx - 12} ${hy + 6} A 12 14 0 0 1 ${cx + 12} ${hy + 4} Z`} fill={PAPER} />}
            </g>
          ))}
        </g>
      )}
      {/* 口 */}
      {face === "wide" ? (
        <ellipse cx={2} cy={-192} rx={7} ry={9} fill={PEN} />
      ) : face === "smile" ? (
        <path d="M -12 -194 Q 2 -180 14 -194" {...pen} strokeWidth={4.5} />
      ) : face === "worried" ? (
        <path d="M -14 -190 Q -7 -197 0 -190 Q 7 -183 14 -190" {...pen} strokeWidth={4.5} />
      ) : (
        <path d="M -8 -192 L 10 -193" {...pen} strokeWidth={4.5} />
      )}
    </g>
  );
};

// ===== セーブ1 の背景 (6畳の部屋の落書き)。座標は YoruSaveA と同じ世界座標 =====
export const NoteRoomA: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <NotePaper />
    <g {...pen}>
      {/* 床の線と畳 */}
      <path d="M -200 712 Q 900 704 2120 714" />
      {[300, 980, 1660].map((x, i) => <path key={i} d={`M ${x} 716 L ${x + (x - 960) * 0.4} 1100`} strokeWidth={3.5} />)}
      <path d="M -200 900 Q 900 894 2120 902" strokeWidth={3.5} />
      {/* 柱と長押 */}
      <path d="M 200 -100 L 202 712 M 1444 -100 L 1446 712 M -200 160 Q 900 154 2120 162" strokeWidth={4} />
      {/* 窓・月・星 */}
      <rect x={1490} y={190} width={330} height={360} rx={4} />
      <path d="M 1655 192 L 1657 548 M 1492 310 L 1818 312 M 1492 430 L 1818 430" strokeWidth={4} />
      <path d="M 1748 240 A 34 34 0 1 1 1712 300 A 26 26 0 1 0 1748 240 Z" fill={MK.yellow} />
      {[[1540, 240], [1610, 380], [1760, 470]].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y - 12} L ${x} ${y + 12} M ${x - 12} ${y} L ${x + 12} ${y}`} strokeWidth={3.5} />
      ))}
      {/* 夜なので窓に斜線 */}
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M ${1500 + i * 36} 540 L ${1540 + i * 36} 470`} strokeWidth={2.5} opacity={0.45} />
      ))}
      {/* カーテン */}
      <path d="M 1470 180 Q 1500 360 1478 560 M 1548 180 Q 1572 360 1556 560 M 1478 560 L 1556 560" strokeWidth={4} />
      <path d="M 1840 180 Q 1810 360 1832 560 M 1780 180 Q 1752 360 1770 560 M 1770 560 L 1832 560" strokeWidth={4} />
      {/* 掛け時計 */}
      <circle cx={1290} cy={330} r={52} fill={PAPER} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M ${1290 + Math.sin(a) * 40} ${330 - Math.cos(a) * 40} l ${Math.sin(a) * 6} ${-Math.cos(a) * 6}`} strokeWidth={3} />;
      })}
      <path d={`M 1290 330 L ${1290 + Math.sin((11.7 / 12) * Math.PI * 2) * 24} ${330 - Math.cos((11.7 / 12) * Math.PI * 2) * 24}`} strokeWidth={6} />
      <path d={`M 1290 330 L ${1290 + Math.sin(((40 + f / 30) / 60) * Math.PI * 2) * 36} ${330 - Math.cos(((40 + f / 30) / 60) * Math.PI * 2) * 36}`} strokeWidth={4} />
      {/* カレンダー */}
      <rect x={910} y={262} width={160} height={200} rx={3} fill={PAPER} />
      <path d="M 990 242 L 990 262" strokeWidth={3} />
      {Array.from({ length: 4 }).map((_, r) => (
        <path key={r} d={`M 928 ${350 + r * 26} Q 990 ${346 + r * 26} 1052 ${350 + r * 26}`} strokeWidth={2.5} strokeDasharray="8 10" />
      ))}
      {/* カラーボックス */}
      <rect x={1540} y={560} width={250} height={134} />
      <path d="M 1540 626 L 1790 626" />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={1550 + i * 18} y={572} width={14} height={50} strokeWidth={3} />)}
      {[0, 1, 2].map((i) => <rect key={i} x={1556 + i * 64} y={640} width={52} height={44} strokeWidth={3.5} />)}
      {/* テレビ台 */}
      <rect x={222} y={606} width={556} height={120} />
      <path d="M 500 626 L 500 722" strokeWidth={4} />
      <circle cx={480} cy={676} r={6} /><circle cx={520} cy={676} r={6} />
    </g>
    <Hand x={990} y={322} text="1986" size={46} />
    <Hand x={1290} y={420} text="夜11:40" size={28} rot={-4} />
    {/* 蛍光ペン: カレンダーと窓 */}
    <path d="M 930 300 L 1050 296" stroke={MK.pink} strokeWidth={30} strokeLinecap="round" opacity={0.45} />
  </g>
);

// セーブ1 の子ども + ちゃぶ台 + 書く手。ノート (精巧な部品) は呼び出し側で間に挟む
export const NoteKidA: React.FC<{ f: number; shock: boolean }> = ({ f, shock }) => (
  <NoteFolk x={1262} y={800} s={1.12} f={f} phase={2} hair="bowl" face={shock ? "wide" : "normal"}
    gaze={shock ? [-3, 5] : [-6, -1]} wear={MK.blue} hideLegs hideArms still />
);
export const NoteTableA: React.FC = () => (
  <g {...pen}>
    <ellipse cx={1180} cy={790} rx={330} ry={78} fill={PAPER} />
    <path d="M 850 792 L 850 820 Q 1180 900 1510 820 L 1510 792" />
    <path d="M 910 840 L 910 900 M 1450 840 L 1450 900" />
    <path d="M 870 800 Q 1180 860 1490 800" stroke={MK.orange} strokeWidth={22} opacity={0.4} />
    {/* 麦茶 */}
    <path d="M 1408 718 L 1452 718 L 1448 778 L 1412 778 Z" fill={MK.orange} fillOpacity={0.45} strokeWidth={4} />
  </g>
);
export const NoteArmsA: React.FC<{ f: number; shock: boolean }> = ({ f, shock }) => {
  const w = shock ? 0 : Math.sin(f / 3) * 4;
  return (
    <g>
      <path d={`M 1215 641 Q 1170 ${700 + w} 1100 743`} {...pen} />
      <circle cx={1100} cy={743} r={9} fill={PAPER} stroke={PEN} strokeWidth={4.5} />
      <g transform="translate(1094 748) rotate(-38)">
        <rect x={-4} y={-50} width={9} height={54} fill={MK.yellow} stroke={PEN} strokeWidth={3} />
        <path d="M -4 4 L 5 4 L 0.5 16 Z" fill={PAPER} stroke={PEN} strokeWidth={3} />
      </g>
      <path d="M 1309 641 Q 1360 680 1390 720" {...pen} />
      <circle cx={1390} cy={720} r={9} fill={PAPER} stroke={PEN} strokeWidth={4.5} />
      {shock && (
        <g>
          <path d="M 1340 500 q -9 14 0 20 q 9 -6 0 -20 Z" fill={MK.blue} stroke={PEN} strokeWidth={3} />
          <path d="M 1160 470 l -16 -26 M 1196 460 l 0 -30 M 1232 470 l 16 -26" {...pen} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// ===== セーブ2 の背景 (作業台の落書き) =====
export const NoteBenchB: React.FC = () => (
  <g>
    <NotePaper />
    <g {...pen}>
      {/* 壁の道具 */}
      <g transform="translate(250 150) rotate(8)">
        <path d="M -10 0 L -4 120 L 4 120 L 10 0 Z" />
        <path d="M -6 120 Q -30 200 -24 260 M 6 120 Q 30 200 24 260" strokeWidth={12} stroke={PEN} opacity={0.85} />
      </g>
      <circle cx={1720} cy={170} r={58} /><circle cx={1720} cy={170} r={44} /><circle cx={1720} cy={170} r={14} fill={PEN} />
      {/* 電気スタンド */}
      <path d="M -40 140 L 210 40 L 330 170" strokeWidth={9} />
      <circle cx={210} cy={40} r={14} fill={PAPER} />
      <path d="M 290 140 L 420 140 L 470 250 L 240 250 Z" fill={MK.green} fillOpacity={0.5} transform="rotate(-18 355 195)" />
      {/* 作業台 */}
      <path d="M -300 902 Q 900 896 2300 904" strokeWidth={6} />
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={i} d={`M ${-200 + i * 420} ${950 + (i % 2) * 30} q 80 -12 160 0`} strokeWidth={3} opacity={0.6} />
      ))}
    </g>
    {/* スタンドの光 (蛍光ペン) */}
    <polygon points="286,270 466,214 1500,560 700,1000" fill={MK.yellow} opacity={0.22} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${340 + i * 60} ${280 - i * 14} l ${30 + i * 8} ${36 - i * 4}`} stroke={PEN} strokeWidth={4} strokeLinecap="round" />
    ))}
  </g>
);

// ===== セーブ3 の背景 =====
export const NoteDeskC: React.FC = () => (
  <g>
    <NotePaper />
    <ellipse cx={960} cy={540} rx={420} ry={290} fill={MK.yellow} opacity={0.28} />
    {Array.from({ length: 6 }).map((_, i) => (
      <path key={i} d={`M ${200 + rnd(i) * 1300} ${150 + i * 150} q 90 -14 180 0`} {...pen} strokeWidth={3} opacity={0.4} />
    ))}
  </g>
);
// 奥に並ぶ「同じ部屋」の落書き
export const NoteCellsC: React.FC = () => (
  <g {...pen} strokeWidth={3} opacity={0.5}>
    {Array.from({ length: 11 }).map((_, i) => {
      const x = -120 + i * 220;
      return (
        <g key={i} transform={`translate(${x} 300) scale(0.62)`}>
          <path d="M -120 0 L -120 -60 L -90 -60 L -90 0 M 90 0 L 90 -60 L 120 -60 L 120 0" />
          <rect x={-80} y={-150} width={160} height={36} />
          <rect x={-74} y={-100} width={148} height={40} />
          {rnd(i * 7 + 3) > 0.4 && [0, 1, 2].map((j) => <circle key={j} cx={-40 + j * 40} cy={-80} r={8} fill={MK.blue} />)}
        </g>
      );
    })}
  </g>
);
