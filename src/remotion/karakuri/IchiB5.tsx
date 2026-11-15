// 「『2位』は、120年前に発明された」: 第5章「番付はあれど優勝はなし。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#78〜#102 (25文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで25枚。
// motif 名は必ず ib5_ で始める。WobbleDefs の seed はこのファイルでは 977〜1001 を使う。
// 設計書: docs/briefs/IchiB5.md (1文ごとの「格」と絵の中身を決めてから描く)
//
// ★絵の「格」(制作ガイド §7 第3層) ★2026-11-06 改定: 配分は 山3 : 並3 : 図4
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = 図と札が主役。ただし第16条の床を敷く (50〜120行)
//
// ★制作ガイド第16条「作り込みの床の法 (素肌禁止)」2026-11-06 追加
//   素の方眼 (GridPaper) + クリーム地だけの絵は禁止。方眼を使うなら「何かの紙」の上に clip する。
//   地面や壁が素のベタ1色で広く残っていたら未完成。小物・質感を一段敷く。
//   ただし主役の明快さが最優先。背景は彩度低め・線細め・opacity 控えめ。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。
//   seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間を写すため)。
//   札・章扉タイトルに読点「、」は使わない (札の読点の法)。間は半角スペース。
//
// ★連番で同じ物を映すときは絵を複製せず、1つの部品に phase prop を持たせて切り替える。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow,
} from "./IchiShared";
import { lerp, zoomAt, GridPaper } from "./KosoB2Parts";
import { IchiB5WorldMap } from "./IchiB5WorldMap";

// ===================================================================
// このファイルだけで使う色 (江戸の町)
// ===================================================================
const C = {
  ink: "#3A3A34",
  sky: "#CFE0EA",
  skyWarm: "#E6DCC4",
  roof: "#8E949A",
  roofDark: "#6B7176",
  wall: "#D8CDB4",
  wallDark: "#B8AB90",
  wood: "#9A7244",
  woodDark: "#6E4F2C",
  washi: "#F0E7D2",
  washiEdge: "#D9CBAB",
  sumi: "#2E2A25",
  nokon: "#3A4C66",
  beni: "#B8473A",
  koban: "#D9B23C",
  tatami: "#C5BE8A",
  stone: "#B3ADA0",
  soil: "#AD9A79",
  yu: "#9EC5D4",
  night: "#2A2E3E",
  lamp: "#E8B457",
  dohyo: "#C9B88E",
};

void Stamp;
void QMark;
void lerp;

// ===================================================================
// 第16条の「床」その1 — 机に広げた和紙 (図の床)
// ===================================================================
const WashiSheet: React.FC<{
  f: number; id: string; x?: number; y?: number; w?: number; h?: number; grid?: boolean;
}> = ({ f, id, x = 190, y = 150, w = 1540, h = 660, grid = true }) => (
  <g>
    {/* 机の天板 */}
    <rect x={0} y={0} width={W} height={H} fill="#B9A581" />
    <rect x={0} y={0} width={W} height={H} fill="#A8946F" opacity={0.0} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <path
        key={i}
        d={`M -40 ${60 + i * 140} C ${W * 0.3} ${40 + i * 140} ${W * 0.7} ${90 + i * 140} ${W + 40} ${55 + i * 140}`}
        stroke="#8D7A58"
        strokeWidth={2}
        fill="none"
        opacity={0.3}
      />
    ))}
    {/* 和紙 */}
    <g transform={`rotate(${-0.5} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 10} y={y + 14} width={w} height={h} fill="#8D7A58" opacity={0.28} />
      <rect x={x} y={y} width={w} height={h} fill={C.washi} stroke={C.washiEdge} strokeWidth={3} />
      {grid && (
        <g clipPath={`url(#${id})`} opacity={0.75}>
          <GridPaper pitch={48} opacity={0.3} />
        </g>
      )}
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      {/* 和紙の繊維 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M ${x + 20} ${y + 70 + i * 100} C ${x + w * 0.4} ${y + 50 + i * 100} ${x + w * 0.7} ${y + 96 + i * 100} ${x + w - 20} ${y + 66 + i * 100}`}
          stroke={C.washiEdge}
          strokeWidth={2}
          fill="none"
          opacity={0.5}
        />
      ))}
    </g>
    {/* 硯と筆と文鎮 */}
    <g transform="translate(120 880)">
      <ellipse cx={0} cy={6} rx={92} ry={30} fill="#5A5248" />
      <ellipse cx={0} cy={0} rx={88} ry={26} fill="#403A33" />
      <ellipse cx={-14} cy={-2} rx={52} ry={14} fill="#1D1A17" />
      <ellipse cx={-22} cy={-6} rx={18} ry={5} fill="#4D463E" opacity={0.6} />
    </g>
    <g transform={`translate(1700 ${900 + Math.sin(f / 20) * 2}) rotate(-24)`}>
      <rect x={-12} y={-150} width={24} height={150} rx={10} fill={C.woodDark} />
      <path d="M -12 0 L 12 0 L 4 64 L -4 64 Z" fill="#3A3027" />
    </g>
    <g transform={`translate(${x + 60} ${y - 26})`}>
      <rect x={-70} y={-16} width={140} height={32} rx={8} fill="#55504A" />
      <rect x={-70} y={-16} width={140} height={10} rx={5} fill="#6D6760" />
    </g>
    <g transform={`translate(${x + w - 60} ${y + h + 26})`}>
      <rect x={-70} y={-16} width={140} height={32} rx={8} fill="#55504A" />
      <rect x={-70} y={-16} width={140} height={10} rx={5} fill="#6D6760" />
    </g>
  </g>
);

// ===================================================================
// 第16条の「床」その2 — 土壁+板壁+柱 (屋内/軒下の床)
// ===================================================================
const EdoWall: React.FC<{ f: number; tone?: number }> = ({ f, tone = 1 }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={C.wall} opacity={tone} />
    {/* 土壁の斑 */}
    {Array.from({ length: 44 }).map((_, i) => {
      const px = ((i * 139) % 19) * 101 + 30;
      const py = ((i * 71) % 9) * 92 + 40;
      return <ellipse key={i} cx={px} cy={py} rx={26 + (i % 4) * 9} ry={14 + (i % 3) * 6} fill={C.wallDark} opacity={0.17} />;
    })}
    {/* 貫 (横木) */}
    <rect x={0} y={248} width={W} height={26} fill={C.wood} opacity={0.85} />
    <rect x={0} y={248} width={W} height={7} fill="#B38A55" opacity={0.7} />
    {/* 柱 */}
    {[80, 1810].map((px) => (
      <g key={px}>
        <rect x={px - 32} y={0} width={64} height={H} fill={C.wood} />
        <rect x={px - 32} y={0} width={14} height={H} fill="#B08856" opacity={0.6} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M ${px - 26} ${90 + i * 170} C ${px - 4} ${150 + i * 170} ${px + 6} ${40 + i * 170} ${px + 26} ${120 + i * 170}`} stroke={C.woodDark} strokeWidth={2} fill="none" opacity={0.35} />
        ))}
      </g>
    ))}
    {/* 板壁の下部 */}
    <rect x={0} y={700} width={W} height={H - 700} fill={C.wood} opacity={0.5} />
    {Array.from({ length: 13 }).map((_, i) => (
      <line key={i} x1={i * 150} y1={700} x2={i * 150} y2={H} stroke={C.woodDark} strokeWidth={3} opacity={0.4} />
    ))}
    <rect x={0} y={700} width={W} height={10} fill={C.woodDark} opacity={0.5} />
    {/* 軒下の影 */}
    <rect x={0} y={0} width={W} height={120} fill="#6B5F4A" opacity={0.26} />
    {/* 埃 */}
    {Array.from({ length: 16 }).map((_, i) => (
      <circle key={i} cx={((i * 311) % 18) * 106 + 50} cy={((i * 53) % 7) * 120 + 150 + Math.sin((f + i * 9) / 26) * 10} r={3} fill="#FFFDF4" opacity={0.4} />
    ))}
  </g>
);

// ===================================================================
// 第16条の「床」その3 — 瓦屋根の遠景と空 (屋外の床)
// ===================================================================
const EdoSky: React.FC<{ f: number; gid: string; warm?: boolean }> = ({ f, gid, warm }) => (
  <g>
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={warm ? "#E8D6B4" : "#BFD6E4"} />
        <stop offset="100%" stopColor={warm ? "#F4EBD6" : C.skyWarm} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${gid})`} />
    {[
      { x: 260, y: 130, s: 1.1 },
      { x: 980, y: 90, s: 0.8 },
      { x: 1560, y: 170, s: 1.3 },
    ].map((c, i) => (
      <g key={i} transform={`translate(${c.x + Math.sin((f + i * 40) / 34) * 16} ${c.y}) scale(${c.s})`} opacity={0.5}>
        <ellipse cx={0} cy={0} rx={110} ry={34} fill="#FFFDF6" />
        <ellipse cx={-56} cy={10} rx={62} ry={26} fill="#FFFDF6" />
        <ellipse cx={58} cy={8} rx={70} ry={28} fill="#FFFDF6" />
      </g>
    ))}
    {[0, 1, 2].map((i) => {
      const bx = ((f * 1.6 + i * 90) % 320) + 1180;
      return (
        <path key={i} d={`M ${bx} ${176 + i * 26} l 18 -12 l 18 12`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.4} />
      );
    })}
  </g>
);

const Machiya: React.FC<{ x: number; y: number; s?: number; dark?: number }> = ({ x, y, s = 1, dark = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1}>
    {/* 瓦屋根 */}
    <path d="M -180 0 L 180 0 L 136 -80 L -136 -80 Z" fill={C.roof} />
    <path d="M -180 0 L 180 0 L 180 14 L -180 14 Z" fill={C.roofDark} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={-150 + i * 50} y1={0} x2={-120 + i * 40} y2={-78} stroke={C.roofDark} strokeWidth={3} opacity={0.6} />
    ))}
    {/* 板壁 */}
    <rect x={-156} y={14} width={312} height={178} fill={C.wood} opacity={0.55} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line key={i} x1={-156 + i * 62} y1={14} x2={-156 + i * 62} y2={192} stroke={C.woodDark} strokeWidth={3} opacity={0.4} />
    ))}
    {/* 格子窓 */}
    <rect x={-104} y={48} width={120} height={82} fill="#EFE6D0" stroke={C.woodDark} strokeWidth={4} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-104 + (i + 1) * 30} y1={48} x2={-104 + (i + 1) * 30} y2={130} stroke={C.woodDark} strokeWidth={3} />
    ))}
    <line x1={-104} y1={89} x2={16} y2={89} stroke={C.woodDark} strokeWidth={3} />
    {dark > 0 && <rect x={-190} y={-90} width={380} height={290} fill="#7E8A96" opacity={dark} />}
  </g>
);

const EdoRoofs: React.FC<{ f: number; y?: number }> = ({ f, y = 430 }) => (
  <g>
    {[
      { x: 130, s: 0.72, d: 0.4 },
      { x: 470, s: 0.62, d: 0.46 },
      { x: 790, s: 0.8, d: 0.3 },
      { x: 1150, s: 0.66, d: 0.42 },
      { x: 1480, s: 0.76, d: 0.34 },
      { x: 1800, s: 0.6, d: 0.48 },
    ].map((m, i) => (
      <Machiya key={i} x={m.x} y={y - i % 2 * 24} s={m.s} dark={m.d} />
    ))}
    {/* 煙 */}
    {[380, 1290].map((px, i) => (
      <g key={px} opacity={0.3}>
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={px + Math.sin((f + j * 20 + i * 30) / 24) * 14} cy={y - 150 - j * 48} r={20 + j * 8} fill="#FFFDF6" />
        ))}
      </g>
    ))}
  </g>
);

const EdoGround: React.FC<{ f: number; y?: number; stone?: boolean }> = ({ f, y = 760, stone = true }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={stone ? C.stone : C.soil} />
    {stone ? (
      <g>
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 11 }).map((_, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * 180 + (r % 2) * 90 - 60}
              y={y + 14 + r * 48}
              width={168}
              height={38}
              rx={9}
              fill="#C2BCAF"
              stroke="#9D978B"
              strokeWidth={2}
              opacity={0.8}
            />
          )),
        )}
      </g>
    ) : (
      <g>
        {Array.from({ length: 40 }).map((_, i) => (
          <ellipse key={i} cx={((i * 157) % 20) * 96 + 20} cy={y + 24 + ((i * 37) % 6) * 50} rx={22} ry={9} fill="#96866A" opacity={0.3} />
        ))}
      </g>
    )}
    {/* 草と小石 */}
    {Array.from({ length: 9 }).map((_, i) => (
      <g key={i} transform={`translate(${120 + i * 210} ${y + 8})`}>
        <path d={`M 0 0 C ${-6 + Math.sin((f + i * 11) / 18) * 3} -16 -14 -24 -18 -32`} stroke="#8CA86E" strokeWidth={4} fill="none" />
        <path d={`M 0 0 C ${6 + Math.sin((f + i * 7) / 20) * 3} -18 14 -26 20 -30`} stroke="#8CA86E" strokeWidth={4} fill="none" />
      </g>
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse key={i} cx={((i * 211) % 20) * 98 + 50} cy={y + 46 + ((i * 29) % 5) * 54} rx={10} ry={6} fill="#8E8878" opacity={0.5} />
    ))}
    {/* 下駄の跡 */}
    {Array.from({ length: 6 }).map((_, i) => (
      <g key={i} opacity={0.22}>
        <rect x={300 + i * 150} y={y + 110 + (i % 2) * 44} width={34} height={16} rx={4} fill="#7E7869" />
      </g>
    ))}
  </g>
);

// ===================================================================
// 幟・提灯・のれん
// ===================================================================
const Nobori: React.FC<{ x: number; y: number; h?: number; f: number; text?: string; color?: string }> = ({ x, y, h = 300, f, text, color = C.washi }) => {
  const sw = Math.sin(f / 15) * 7;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-5} y={-h} width={10} height={h} fill={C.woodDark} />
      <path
        d={`M 5 ${-h + 10} C ${34 + sw} ${-h + 70} ${20 - sw} ${-h + 150} ${44 + sw} ${-h + 220} L ${5} ${-h + 230} Z`}
        fill={color}
        stroke={C.ink}
        strokeWidth={3}
      />
      {text && (
        <text x={24} y={-h + 92} fill={C.sumi} fontSize={30} fontFamily={FONT} fontWeight={800} textAnchor="middle">
          {text}
        </text>
      )}
    </g>
  );
};

const Chochin: React.FC<{ x: number; y: number; s?: number; f: number; color?: string }> = ({ x, y, s = 1, f, color = "#E8DCBE" }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 19) * 3}) scale(${s})`}>
    <line x1={0} y1={-60} x2={0} y2={-34} stroke={C.ink} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={34} ry={44} fill={color} stroke={C.ink} strokeWidth={3} />
    {[-26, -12, 2, 16, 30].map((yy) => (
      <line key={yy} x1={-33} y1={yy} x2={33} y2={yy} stroke={C.ink} strokeWidth={2} opacity={0.3} />
    ))}
    <rect x={-16} y={-48} width={32} height={10} rx={3} fill={C.woodDark} />
    <rect x={-16} y={38} width={32} height={10} rx={3} fill={C.woodDark} />
  </g>
);

const Noren: React.FC<{ x: number; y: number; w?: number; f: number; color?: string }> = ({ x, y, w = 240, f, color = C.nokon }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 14} y={-10} width={w + 28} height={10} rx={4} fill={C.woodDark} />
    {[0, 1, 2].map((i) => {
      const bw = w / 3 - 6;
      const bx = -w / 2 + i * (w / 3) + 3;
      const sw = Math.sin((f + i * 14) / 17) * 5;
      return (
        <path
          key={i}
          d={`M ${bx} 0 L ${bx + bw} 0 L ${bx + bw + sw} 130 L ${bx + sw} 130 Z`}
          fill={color}
          stroke={C.ink}
          strokeWidth={2}
        />
      );
    })}
  </g>
);

// ===================================================================
// ★第5章専用: 江戸の人物 (EdoPerson / EdoPersonMini)
// ===================================================================
// 共通部品 Person / PersonMini は現代的な人型 (四角い胴+長方形の腕) なので、
// この章だけは上から「着物・帯・髷・履物」を重ねて江戸の町人に見せる。
// ・Person には hair="none" を渡して頭を素にし、髷と手ぬぐいはここで描く
// ・props は Person とほぼ同じ (呼び出し側の書き換えを最小にするため)
// ・kind で職業の小物 (前掛け・半纏・紙束・二本差し)、v で柄・履物・髪を散らす
// ・裾/袖/帯端/髷/房は すべて f で揺れる (静止禁止)
const EDO_OBI = ["#8C4A2F", "#3A4C66", "#5E6B45", "#7A5C84", "#A8863C", "#4A6B6E"];
const EDO_SKIN = "#EADCC0";
const EDO_HAIR = "#2E2823";
const EDO_TENUGUI = "#EDE4CE";

type EdoKind = "chonin" | "shokunin" | "shonin" | "yomiuri" | "onna" | "kodomo" | "samurai";
type EdoFace = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type EdoPose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// ★export している理由: 結び (IchiB11 #214) で江戸の相撲をもう一度出す。
//   からくり憲法 第7条「人物統一の法」= 人物の画風は章をまたいでも流用する。
//   逆に舞台 (EdoWall / Sumobeya) は共有しない。背景は1文ごとに作る (§7 第3層-6)。
export const EdoPerson: React.FC<{
  x: number; y: number; s?: number; f?: number;
  cloth?: string; clothDark?: string;
  face?: EdoFace; gaze?: [number, number]; lean?: number; phase?: number;
  pose?: EdoPose; pointDir?: 1 | -1;
  kind?: EdoKind; v?: number; obi?: string;
}> = ({
  x, y, s = 1, f = 0, cloth = "#3A4C66", clothDark = "#2C3A4E",
  face = "normal", gaze = [0, 0], lean = 0, phase = 0,
  pose = "stand", pointDir = 1, kind = "chonin", v, obi,
}) => {
  const ink = KRP.ink;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  // 柄・髪・履物は v (なければ phase と x) から散らす。同じ見た目を並べない
  const vv = v ?? (phase + Math.round(Math.abs(x) / 97)) % 6;
  const pat = kind === "samurai" ? 0 : vv % 3;            // 0 無地 / 1 縞 / 2 格子
  const hairKind = kind === "onna" ? 3 : kind === "kodomo" ? 4 : kind === "samurai" ? 0 : vv % 3;
  const footKind = kind === "kodomo" ? 2 : (vv + 1) % 4;  // 0 わらじ / 1 下駄 / 2 素足 / 3 脚絆
  const obiC = obi ?? EDO_OBI[(vv * 2 + 1) % EDO_OBI.length];
  // 揺れ
  const hemSway = Math.sin((f + phase * 11) / 17) * 4;
  const obiSway = Math.sin((f + phase * 9) / 12) * 3;
  const hairSway = Math.sin((f + phase * 13) / 21) * 2.4;
  const armSway = f ? Math.sin((f + phase * 17) / 9) * 3 : 0;
  // 裾の下端 (子どもは短い着物)
  const hemY = kind === "kodomo" ? -42 : kind === "onna" ? -18 : -26;
  const obiTop = kind === "onna" ? -108 : kind === "kodomo" ? -112 : -100;
  const obiH = kind === "onna" ? 46 : kind === "kodomo" ? 26 : 34;
  const obiBot = obiTop + obiH;

  // Person と同じ腕の回転 (袖をぴったり重ねるため計算を合わせる)
  const arms: { side: -1 | 1; rot: number; len: number }[] =
    pose === "banzai"
      ? [{ side: -1, rot: 135 + armSway, len: 82 }, { side: 1, rot: -135 - armSway, len: 82 }]
      : pose === "raise"
        ? [{ side: -1, rot: 0, len: 82 }, { side: 1, rot: 180, len: 82 }]
        : pose === "point"
          ? [
            { side: (pointDir === 1 ? -1 : 1) as -1 | 1, rot: 0, len: 82 },
            { side: (pointDir === 1 ? 1 : -1) as -1 | 1, rot: pointDir === 1 ? -90 : 90, len: 86 },
          ]
          : pose === "armsFolded"
            ? [{ side: -1, rot: -32, len: 56 }, { side: 1, rot: 32, len: 56 }]
            : pose === "run"
              ? [{ side: -1, rot: 38, len: 82 }, { side: 1, rot: -118, len: 82 }]
              : pose === "hold"
                ? [{ side: -1, rot: -58, len: 64 }, { side: 1, rot: 58, len: 64 }]
                : [{ side: -1, rot: 0, len: 82 }, { side: 1, rot: 0, len: 82 }];

  return (
    <g>
      {/* 素の人型 (頭は素。髪はこのあと自分で描く) */}
      <Person
        x={x} y={y} s={s} f={f} phase={phase} pose={pose} pointDir={pointDir}
        face={face} gaze={gaze} lean={lean} hair="none"
        cloth={cloth} clothDark={clothDark}
      />
      {/* 以下は Person と同じ原点・同じ上下ゆれに乗せる */}
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* ───── 袖 (筒袖 + 袂)。腕の回転に重ね、袂は世界座標で真下に垂らす ───── */}
        {arms.map((a, i) => {
          const ax = a.side === -1 ? -83 : 51;
          const sl = Math.max(a.len * 0.56, 30);
          const th = (a.rot * Math.PI) / 180;
          // 袖口の中心は肩の真下 sl-2。世界座標に直す
          const L = sl - 2;
          const ex = a.side * 67 - L * Math.sin(th);
          const ey = -148 + L * Math.cos(th);
          const down = Math.cos(th) > 0.45;
          const sw = Math.sin((f + phase * 13 + i * 23) / 14) * 3;
          return (
            <g key={i}>
              <g transform={a.rot === 0 ? undefined : `rotate(${a.rot} ${a.side * 67} -148)`}>
                <rect x={ax} y={-151} width={32} height={sl} rx={8} fill={cloth} stroke={ink} strokeWidth={4.5} />
                <rect x={ax + 2} y={-151 + sl - 9} width={28} height={7} rx={3} fill={clothDark} opacity={0.55} />
                {pat === 1 && (
                  <line x1={ax + 16} y1={-146} x2={ax + 16} y2={-151 + sl - 10} stroke={clothDark} strokeWidth={4} opacity={0.5} />
                )}
              </g>
              {down && kind !== "kodomo" && (
                <path
                  d={`M ${ex - 17} ${ey - 10} L ${ex + 17} ${ey - 10} L ${ex + 15 + sw} ${ey + 24}
                      Q ${ex + sw * 1.4} ${ey + 34} ${ex - 15 + sw} ${ey + 22} Z`}
                  fill={cloth} stroke={ink} strokeWidth={4}
                />
              )}
            </g>
          );
        })}

        {/* ───── 裾 (膝下まで。f で揺れる) ───── */}
        <path
          d={`M -58 -64 L 58 -64 L ${62 + hemSway} ${hemY} L ${-64 + hemSway} ${hemY + 2} Z`}
          fill={cloth} stroke={ink} strokeWidth={5}
        />
        <path
          d={`M ${-62 + hemSway} ${hemY - 1} L ${60 + hemSway} ${hemY - 3} L ${58 + hemSway} ${hemY + 5} L ${-60 + hemSway} ${hemY + 7} Z`}
          fill={clothDark} opacity={0.5}
        />
        {/* ───── すね (素足 / 脚絆) ───── */}
        {[-31, 7].map((lx) => (
          <g key={lx}>
            <rect
              x={lx} y={hemY - 2} width={25} height={Math.abs(hemY) - 5} rx={4}
              fill={footKind === 3 ? "#4B4336" : EDO_SKIN} stroke={ink} strokeWidth={4}
            />
            {footKind === 3 && (
              <line x1={lx + 1} y1={hemY + 14} x2={lx + 24} y2={hemY + 14} stroke="#D9CBAB" strokeWidth={3} />
            )}
          </g>
        ))}
        {/* ───── 履物 ───── */}
        {[-18, 18].map((fx) => (
          <g key={fx}>
            {footKind === 1 ? (
              // 下駄 (二枚歯)
              <g>
                <rect x={fx - 23} y={-14} width={46} height={11} rx={3} fill="#B08856" stroke={ink} strokeWidth={4} />
                <rect x={fx - 18} y={-4} width={9} height={6} fill="#8A6B42" stroke={ink} strokeWidth={3} />
                <rect x={fx + 9} y={-4} width={9} height={6} fill="#8A6B42" stroke={ink} strokeWidth={3} />
                <path d={`M ${fx} -14 l -9 -7 M ${fx} -14 l 9 -7`} stroke="#6E5536" strokeWidth={3} fill="none" />
              </g>
            ) : footKind === 2 ? (
              // 素足
              <ellipse cx={fx} cy={-4} rx={21} ry={9} fill={EDO_SKIN} stroke={ink} strokeWidth={4} />
            ) : (
              // わらじ
              <g>
                <ellipse cx={fx} cy={-3} rx={22} ry={10} fill="#D8C79B" stroke={ink} strokeWidth={4} />
                <path d={`M ${fx - 13} -8 L ${fx + 13} -2 M ${fx} -12 L ${fx} -1`} stroke="#A98F63" strokeWidth={3} fill="none" />
              </g>
            )}
          </g>
        ))}

        {/* ───── 着物の柄 (縞 / 格子 / 無地の折り線) ───── */}
        {pat === 1 && (
          <g stroke={clothDark} strokeWidth={5} opacity={0.5}>
            {[-40, -20, 0, 20, 40].map((px) => (
              <line key={px} x1={px} y1={-156} x2={px} y2={-58} />
            ))}
            {[-40, -20, 0, 20, 40].map((px) => (
              <line key={`h${px}`} x1={px} y1={-62} x2={px + hemSway} y2={hemY + 4} />
            ))}
          </g>
        )}
        {pat === 2 && (
          <g stroke={clothDark} strokeWidth={4} opacity={0.42}>
            {[-36, -12, 12, 36].map((px) => (
              <line key={px} x1={px} y1={-156} x2={px} y2={-58} />
            ))}
            {[-148, -124].map((py) => (
              <line key={py} x1={-52} y1={py} x2={52} y2={py} />
            ))}
            {[-36, -12, 12, 36].map((px) => (
              <line key={`h${px}`} x1={px} y1={-62} x2={px + hemSway} y2={hemY + 4} />
            ))}
          </g>
        )}
        {pat === 0 && (
          <path d="M -56 -130 Q 0 -121 56 -130" stroke={clothDark} strokeWidth={4} fill="none" opacity={0.32} />
        )}

        {/* ───── 襟 (V字の前合わせ。見る側の右の板が上 = 右前) ───── */}
        <path d={`M -50 -161 L -27 -161 L 5 ${obiTop + 2} L -13 ${obiTop + 6} Z`} fill="#EFE7D2" stroke={ink} strokeWidth={4} />
        <path d={`M 50 -161 L 27 -161 L -5 ${obiTop + 2} L 13 ${obiTop + 6} Z`} fill="#F8F2E2" stroke={ink} strokeWidth={4} />

        {/* ───── 帯 (腰に横一本。端が f で揺れる) ───── */}
        <rect x={-59} y={obiTop} width={118} height={obiH} rx={4} fill={obiC} stroke={ink} strokeWidth={4.5} />
        <rect x={-57} y={obiTop + 2} width={114} height={8} rx={4} fill="#FFFFFF" opacity={0.2} />
        <path
          d={`M 42 ${obiBot - 3} q ${7 + obiSway} 20 ${-3 + obiSway * 1.5} 38`}
          stroke={obiC} strokeWidth={11} fill="none" strokeLinecap="round"
        />

        {/* ───── 職業の小物 ───── */}
        {(kind === "shonin" || kind === "yomiuri") && (
          // 前掛け (商人・番付売り)
          <g>
            <path
              d={`M -40 ${obiBot - 6} L 40 ${obiBot - 6} L ${44 + hemSway} ${hemY - 1} L ${-44 + hemSway} ${hemY + 1} Z`}
              fill="#3A4C66" stroke={ink} strokeWidth={4}
            />
            <line x1={-40} y1={obiBot - 4} x2={40} y2={obiBot - 4} stroke="#E8DFC8" strokeWidth={5} />
          </g>
        )}
        {kind === "yomiuri" && (
          // 番付売りの紙束 (肩紐で腰に下げる)
          <g>
            <line x1={-40} y1={-156} x2={-74} y2={-108} stroke="#8A6B42" strokeWidth={6} />
            <g transform={`translate(-82 -94) rotate(${-13 + hemSway * 0.4})`}>
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={-27 + i * 3} y={-8 - i * 10} width={54} height={12} rx={2} fill={C.washi} stroke={ink} strokeWidth={3} />
              ))}
            </g>
          </g>
        )}
        {kind === "shokunin" && (
          // 半纏 (職人)。帯の上にはおる
          <g>
            <path d={`M -62 -163 L -24 -161 L -18 -80 L -60 -78 Z`} fill="#2E3A4E" stroke={ink} strokeWidth={4} />
            <path d={`M 62 -163 L 24 -161 L 18 -80 L 60 -78 Z`} fill="#2E3A4E" stroke={ink} strokeWidth={4} />
            <path d="M -24 -161 L -18 -80" stroke="#E8DFC8" strokeWidth={6} />
            <path d="M 24 -161 L 18 -80" stroke="#E8DFC8" strokeWidth={6} />
          </g>
        )}
        {kind === "samurai" && (
          // 羽織 + 二本差し (町人中心の章なので出番は少ない)
          <g>
            <path d={`M -64 -164 L -26 -161 L -22 -62 L -62 -60 Z`} fill="#3A332B" stroke={ink} strokeWidth={4} opacity={0.92} />
            <path d={`M 64 -164 L 26 -161 L 22 -62 L 62 -60 Z`} fill="#3A332B" stroke={ink} strokeWidth={4} opacity={0.92} />
            <g transform={`translate(-52 ${obiBot - 10}) rotate(${-26 + obiSway * 0.4})`}>
              <rect x={-4} y={-9} width={148} height={16} rx={8} fill="#2A2E38" stroke={ink} strokeWidth={3.5} />
              <rect x={-4} y={2} width={128} height={18} rx={9} fill="#3C4149" stroke={ink} strokeWidth={3.5} />
              <rect x={-18} y={-12} width={20} height={40} rx={5} fill="#8A6B42" stroke={ink} strokeWidth={3} />
            </g>
          </g>
        )}

        {/* ───── 髪 (髷 / 手ぬぐい / ほおかむり / 丸髷 / 子どもの前髪) ───── */}
        {(hairKind === 0 || hairKind === 1) && (
          <g>
            {/* 月代 (頭頂は素) と横の髪 */}
            <path d="M -63 -228 C -69 -274 -40 -294 -4 -296 C -15 -283 -37 -275 -45 -250 C -49 -239 -49 -231 -47 -225 Z" fill={EDO_HAIR} />
            <path d="M 63 -228 C 69 -274 40 -294 4 -296 C 15 -283 37 -275 45 -250 C 49 -239 49 -231 47 -225 Z" fill={EDO_HAIR} />
            <path d="M -42 -287 C -16 -298 16 -298 42 -287 C 16 -291 -16 -291 -42 -287 Z" fill={EDO_HAIR} />
            {/* 髷 (頭頂の棒。体ゆれに追従して少し振れる) */}
            <g transform={`translate(0 -292) rotate(${-8 + hairSway})`}>
              <rect x={-7} y={-16} width={52} height={16} rx={8} fill={EDO_HAIR} stroke={ink} strokeWidth={3} />
              <rect x={5} y={-16} width={8} height={16} fill="#E8DFC8" opacity={0.75} />
              <circle cx={-9} cy={-9} r={11} fill={EDO_HAIR} stroke={ink} strokeWidth={3} />
            </g>
          </g>
        )}
        {hairKind === 1 && (
          // 手ぬぐいの鉢巻 (端が f で鳴る)
          <g>
            <path d="M -57 -258 C -40 -290 40 -290 57 -258 C 40 -264 -40 -264 -57 -258 Z" fill={EDO_TENUGUI} stroke={ink} strokeWidth={4} />
            <path
              d={`M 50 -257 q ${11 + hairSway * 2} 21 ${3 + hairSway * 2.4} 42`}
              stroke={EDO_TENUGUI} strokeWidth={9} fill="none" strokeLinecap="round"
            />
          </g>
        )}
        {hairKind === 2 && (
          // ほおかむり (手ぬぐいを頭からかぶって顎で結ぶ)
          <g>
            <path
              d="M -66 -226 C -72 -288 -34 -301 0 -301 C 34 -301 72 -288 66 -226
                 C 56 -250 44 -260 30 -262 L -30 -262 C -44 -260 -56 -250 -66 -226 Z"
              fill="#E6DCC2" stroke={ink} strokeWidth={4}
            />
            <path d={`M -57 -232 q ${-7 + hairSway} 33 ${5 + hairSway} 54`} stroke="#E6DCC2" strokeWidth={11} fill="none" strokeLinecap="round" />
            <path d={`M 57 -232 q ${7 + hairSway} 33 ${-5 + hairSway} 54`} stroke="#E6DCC2" strokeWidth={11} fill="none" strokeLinecap="round" />
            <ellipse cx={0} cy={-170} rx={15} ry={9} fill="#E6DCC2" stroke={ink} strokeWidth={3} />
          </g>
        )}
        {hairKind === 3 && (
          // 丸髷 + 簪 (女性)
          <g>
            <path d="M -58 -244 C -63 -288 -28 -300 0 -300 C 28 -300 63 -288 58 -244 C 40 -268 -40 -268 -58 -244 Z" fill={EDO_HAIR} />
            <ellipse cx={0} cy={-299} rx={35} ry={18} fill={EDO_HAIR} stroke={ink} strokeWidth={3} />
            <ellipse cx={-2} cy={-302} rx={16} ry={8} fill="#4A4038" />
            <g transform={`rotate(${-18 + hairSway * 0.8} 34 -290)`}>
              <rect x={30} y={-316} width={7} height={46} rx={3} fill="#C9A24A" stroke={ink} strokeWidth={2.5} />
              <circle cx={33} cy={-320} r={9} fill={C.beni} stroke={ink} strokeWidth={2.5} />
            </g>
          </g>
        )}
        {hairKind === 4 && (
          // 子どもの前髪 (まだ月代を剃らない)
          <g>
            <path d="M -62 -244 C -66 -288 -30 -300 0 -300 C 30 -300 66 -288 62 -244 C 40 -262 -40 -262 -62 -244 Z" fill={EDO_HAIR} />
            <g transform={`translate(0 -292) rotate(${-6 + hairSway})`}>
              <circle cx={6} cy={-10} r={13} fill={EDO_HAIR} stroke={ink} strokeWidth={3} />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

// ── 群衆・遠景用の江戸の人 (PersonMini の上に襟・帯・髷・裾を重ねる) ──
// ★IchiB11 #214 の桟敷の客で流用する (第7条)
export const EdoPersonMini: React.FC<{
  x: number; y: number; s?: number; color?: string; f?: number; phase?: number;
  face?: "dot" | "smile" | "none"; arms?: "down" | "up";
  v?: number; kodomo?: boolean; obi?: string;
}> = ({ x, y, s = 1, color = KRP.gray, f = 0, phase = 0, face = "dot", arms = "down", v, kodomo = false, obi }) => {
  const ink = KRP.ink;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const sil = face === "none";                     // シルエット (遠景の観客)
  const vv = v ?? (phase + Math.round(Math.abs(x) / 83)) % 6;
  const hairKind = kodomo ? 3 : vv % 3;            // 0 髷 / 1 手ぬぐい+髷 / 2 丸髷
  const obiC = sil ? color : obi ?? EDO_OBI[(vv * 2 + 3) % EDO_OBI.length];
  const hairC = sil ? color : EDO_HAIR;
  const sw = Math.sin((f + phase * 13) / 16) * 3;
  const hemTop = kodomo ? -62 : -40;
  const obiTop = kodomo ? -92 : -80;
  return (
    <g>
      <PersonMini x={x} y={y} s={s} color={color} f={f} phase={phase} face={face} arms={arms} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 裾の広がり (子どもは短く、下は素足) */}
        <path
          d={`M -40 ${hemTop} L 40 ${hemTop} L ${45 + sw} ${kodomo ? -42 : 0} L ${-45 + sw} ${kodomo ? -40 : 0} Z`}
          fill={color} stroke={ink} strokeWidth={5}
        />
        {kodomo && (
          <g>
            <path d={`M ${-43 + sw} -43 L ${43 + sw} -45 L 25 -2 Q 0 3 -25 -2 Z`} fill={sil ? color : EDO_SKIN} stroke={ink} strokeWidth={4.5} />
            <line x1={0} y1={-38} x2={0} y2={-2} stroke={ink} strokeWidth={4} />
          </g>
        )}
        {!sil && (
          <g>
            {/* 襟 (小さなV字) */}
            <path d={`M -29 -126 L -17 -126 L 3 ${obiTop + 3} L -7 ${obiTop + 5} Z`} fill="#EFE7D2" stroke={ink} strokeWidth={3} />
            <path d={`M 29 -126 L 17 -126 L -3 ${obiTop + 3} L 7 ${obiTop + 5} Z`} fill="#F8F2E2" stroke={ink} strokeWidth={3} />
          </g>
        )}
        {/* 帯 */}
        <rect x={-41} y={obiTop} width={82} height={kodomo ? 18 : 21} rx={3} fill={obiC} stroke={ink} strokeWidth={4} />
        <path
          d={`M 29 ${obiTop + (kodomo ? 17 : 20)} q ${5 + sw} 12 ${-2 + sw} 22`}
          stroke={obiC} strokeWidth={7} fill="none" strokeLinecap="round"
        />
        {/* 髪 */}
        {hairKind !== 2 && (
          <g>
            <path d="M -33 -158 C -36 -186 -20 -196 -2 -197 C -8 -189 -20 -184 -24 -170 C -26 -164 -26 -160 -25 -157 Z" fill={hairC} />
            <path d="M 33 -158 C 36 -186 20 -196 2 -197 C 8 -189 20 -184 24 -170 C 26 -164 26 -160 25 -157 Z" fill={hairC} />
            <g transform={`translate(0 -193) rotate(${-10 + sw * 0.6})`}>
              <rect x={-5} y={-9} width={30} height={10} rx={5} fill={hairC} stroke={ink} strokeWidth={2.5} />
            </g>
          </g>
        )}
        {hairKind === 1 && (
          <path d="M -30 -173 C -20 -190 20 -190 30 -173 C 20 -179 -20 -179 -30 -173 Z" fill={sil ? color : EDO_TENUGUI} stroke={ink} strokeWidth={3} />
        )}
        {hairKind === 2 && (
          <g>
            <path d="M -31 -164 C -34 -189 -15 -197 0 -197 C 15 -197 34 -189 31 -164 C 20 -178 -20 -178 -31 -164 Z" fill={hairC} />
            <ellipse cx={0} cy={-196} rx={19} ry={10} fill={hairC} stroke={ink} strokeWidth={2.5} />
          </g>
        )}
        {/* 履物 (わらじ) */}
        {!kodomo && (
          <g>
            <ellipse cx={-15} cy={-2} rx={15} ry={7} fill={sil ? color : "#D8C79B"} stroke={ink} strokeWidth={3.5} />
            <ellipse cx={15} cy={-2} rx={15} ry={7} fill={sil ? color : "#D8C79B"} stroke={ink} strokeWidth={3.5} />
          </g>
        )}
      </g>
    </g>
  );
};

// ===================================================================
// 番付の中身アイコン (見立番付で差し替える部品)
// ===================================================================
const YuIcon: React.FC<{ s: number; f: number }> = ({ s, f }) => (
  <g transform={`scale(${s})`}>
    <path d="M -34 10 L 34 10 L 28 34 L -28 34 Z" fill={C.yu} stroke={C.sumi} strokeWidth={3} />
    <ellipse cx={0} cy={10} rx={34} ry={8} fill="#C3DEE8" stroke={C.sumi} strokeWidth={2} />
    {[-16, 0, 16].map((px, i) => (
      <path
        key={px}
        d={`M ${px} 2 C ${px + 8 + Math.sin((f + i * 13) / 14) * 4} -12 ${px - 8} -22 ${px + 4} -36`}
        stroke={C.yu}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </g>
);

const FoodIcon: React.FC<{ s: number; kind?: number }> = ({ s, kind = 0 }) => (
  <g transform={`scale(${s})`}>
    {kind === 0 && (
      <g>
        <rect x={-32} y={4} width={64} height={24} rx={11} fill="#F6F1E2" stroke={C.sumi} strokeWidth={3} />
        <path d="M -34 6 C -20 -16 20 -16 34 6 Z" fill={C.beni} stroke={C.sumi} strokeWidth={3} />
      </g>
    )}
    {kind === 1 && (
      <g>
        <ellipse cx={0} cy={16} rx={38} ry={16} fill="#8D6A44" stroke={C.sumi} strokeWidth={3} />
        {[-18, -4, 10].map((px) => (
          <path key={px} d={`M ${px} 12 C ${px + 6} -8 ${px + 18} -14 ${px + 14} -30`} stroke="#E6D9B4" strokeWidth={5} fill="none" />
        ))}
      </g>
    )}
    {kind === 2 && (
      <g>
        <path d="M -8 24 L -8 -22 C -8 -34 10 -34 10 -22 L 10 24 Z" fill="#E2B86A" stroke={C.sumi} strokeWidth={3} />
        <path d="M -20 24 L 22 24 L 18 34 L -16 34 Z" fill="#CFA85C" stroke={C.sumi} strokeWidth={3} />
      </g>
    )}
  </g>
);

const KobanIcon: React.FC<{ s: number }> = ({ s }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={8} rx={34} ry={22} fill={C.koban} stroke={C.sumi} strokeWidth={3} />
    <ellipse cx={0} cy={8} rx={20} ry={11} fill="none" stroke={C.sumi} strokeWidth={2} opacity={0.6} />
    <ellipse cx={-14} cy={-14} rx={30} ry={19} fill="#E7C457" stroke={C.sumi} strokeWidth={3} />
  </g>
);

const Senryobako: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-70} width={160} height={70} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={4} />
    <rect x={-80} y={-84} width={160} height={20} rx={5} fill={C.woodDark} stroke={C.ink} strokeWidth={3} />
    <rect x={-80} y={-48} width={160} height={10} fill="#4F4036" opacity={0.6} />
    <rect x={-14} y={-46} width={28} height={26} rx={4} fill={C.koban} stroke={C.ink} strokeWidth={3} />
  </g>
);

// ===================================================================
// ★主役部品: 番付 (縦一枚)。phase で中身を入れ替える
// ===================================================================
const BZ_W = 430;
const BZ_H = 720;
// ★紙の中の列割り。帯の幅を「空いている幅」から決めるので、fs がいくつでも紙からはみ出さない
//   (旧版は帯の幅を fs*2.3・間隔を fs*2.6+14 で決めていたため、大関の段が右へ 64px あふれていた)
const BZ_PAD = 24;                                              // 紙の左右の余白
const BZ_RANK_X0 = BZ_PAD;                                      // 24  階級名の列 左
const BZ_RANK_X1 = 150;                                         // 150 階級名の列 右
const BZ_NAME_X0 = 166;                                         // 名前帯の左
const BZ_NAME_X1 = BZ_W - BZ_PAD;                               // 406 名前帯の右 (絶対に越えない)
const BZ_GAP = 14;                                              // 帯と帯のあいだ
const BZ_BAND_W = (BZ_NAME_X1 - BZ_NAME_X0 - BZ_GAP) / 2;       // 113 帯1本の上限幅
const BZ_RANK_CX = (BZ_RANK_X0 + BZ_RANK_X1) / 2;               // 87  階級名・アイコンの中心
const BZ_RANK_INNER = BZ_RANK_X1 - BZ_RANK_X0 - 8;              // 118 階級名が使える幅
const BZ_RULE_X = [BZ_RANK_X1, BZ_NAME_X0 + BZ_BAND_W + BZ_GAP / 2]; // 紙の縦罫 150 / 286

const BZ_ROWS = [
  { cy: 150, fs: 60, rank: "大関" },
  { cy: 286, fs: 42, rank: "関脇" },
  { cy: 402, fs: 28, rank: "小結" },
  { cy: 494, fs: 17, rank: "前頭" },
  { cy: 568, fs: 11, rank: "序ノ口" },
];

// 1段ぶんの墨帯 (2本) の位置。右端は 166 + 2*bw + 14 ≦ 406 なので必ず紙の中
const bzBands = (fs: number) => {
  const bw = Math.min(fs * 2.3, BZ_BAND_W);
  return [0, 1].map((k) => ({ x: BZ_NAME_X0 + k * (bw + BZ_GAP), w: bw }));
};

const Banzuke: React.FC<{
  x: number; y: number; s?: number; f: number; t?: number;
  phase?: "sumo" | "onsen" | "ryori" | "kanemochi";
  title?: string;
}> = ({ x, y, s = 1, f, t = 1, phase = "sumo", title = "番付" }) => {
  const sc = s * (0.9 + 0.1 * pop(clamp01(t)));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-BZ_W / 2} ${-BZ_H / 2})`}>
      <rect x={8} y={12} width={BZ_W} height={BZ_H} fill="#8D7A58" opacity={0.22} />
      <rect x={0} y={0} width={BZ_W} height={BZ_H} fill={C.washi} stroke={C.washiEdge} strokeWidth={4} />
      {/* 紙の縦罫 (列の切れ目に合わせる) */}
      {BZ_RULE_X.map((rx) => (
        <line key={rx} x1={rx} y1={16} x2={rx} y2={BZ_H - 16} stroke={C.washiEdge} strokeWidth={2} opacity={0.6} />
      ))}
      {/* 見出し */}
      <rect x={18} y={18} width={BZ_W - 36} height={62} fill={C.sumi} opacity={0.08} />
      <text x={BZ_W / 2} y={62} fill={C.sumi} fontSize={40} fontFamily={FONT} fontWeight={800} textAnchor="middle">
        {title}
      </text>
      {BZ_ROWS.map((r, i) => {
        const appear = clamp01(seg(f, 4 + i * 4, 18 + i * 4));
        const cy = 60 + r.cy;
        // 階級名は列幅 118 に収まるところまで字を落とす (大関 60→59, 序ノ口は 11 のまま)
        const rankFs = Math.min(r.fs, BZ_RANK_INNER / r.rank.length);
        const bands = bzBands(r.fs);
        const bandH = Math.max(r.fs * (phase === "sumo" ? 0.68 : 0.6), 4);
        const bandRx = Math.max(r.fs * (phase === "sumo" ? 0.2 : 0.18), 2);
        const bandFill =
          phase === "sumo" ? C.sumi : phase === "onsen" ? C.nokon : phase === "ryori" ? C.beni : "#9A7B2E";
        const bandOp = phase === "sumo" ? 0.78 : phase === "ryori" ? 0.6 : 0.7;
        return (
          <g key={i} opacity={appear}>
            {/* 段の仕切り */}
            <line x1={BZ_PAD} y1={cy + r.fs * 0.95} x2={BZ_W - BZ_PAD} y2={cy + r.fs * 0.95} stroke={C.washiEdge} strokeWidth={2} />
            {/* 左の列: 相撲は階級名、見立番付はアイコン */}
            {phase === "sumo" ? (
              <text x={BZ_RANK_CX} y={cy + rankFs * 0.36} fill={C.sumi} fontSize={rankFs} fontFamily={FONT} fontWeight={900} textAnchor="middle">
                {r.rank}
              </text>
            ) : (
              <g transform={`translate(${BZ_RANK_CX} ${cy})`}>
                {phase === "onsen" && <YuIcon s={r.fs / 56} f={f} />}
                {phase === "ryori" && <FoodIcon s={r.fs / 56} kind={i % 3} />}
                {phase === "kanemochi" && <KobanIcon s={r.fs / 56} />}
              </g>
            )}
            {/* 右の列: 名前の代わりの墨の帯 (絵に文を書かない) */}
            {bands.map((b, k) => (
              <rect
                key={k}
                x={b.x}
                y={cy - bandH / 2}
                width={b.w}
                height={bandH}
                rx={bandRx}
                fill={bandFill}
                opacity={bandOp}
              />
            ))}
          </g>
        );
      })}
      {/* 下の余白の細かい段 (虫眼鏡サイズ) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} opacity={0.6}>
          <rect x={60} y={660 + i * 7} width={BZ_W - 120} height={3} fill={C.sumi} opacity={0.5} />
        </g>
      ))}
    </g>
  );
};

// ===================================================================
// 虫眼鏡 (中だけ拡大して見せる)
// ===================================================================
const Magnifier: React.FC<{
  x: number; y: number; r?: number; f: number; cid: string; children?: React.ReactNode;
}> = ({ x, y, r = 130, f, cid, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 15) * 2.4})`}>
    <clipPath id={cid}>
      <circle cx={0} cy={0} r={r - 10} />
    </clipPath>
    <circle cx={0} cy={0} r={r - 8} fill="#F8F4E6" />
    <g clipPath={`url(#${cid})`}>{children}</g>
    <circle cx={0} cy={0} r={r - 10} fill="#CFE2EA" opacity={0.26} />
    <path d={`M ${-r * 0.5} ${-r * 0.5} A ${r * 0.72} ${r * 0.72} 0 0 1 ${r * 0.1} ${-r * 0.7}`} stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={0.5} strokeLinecap="round" />
    <circle cx={0} cy={0} r={r} fill="none" stroke="#C09A3E" strokeWidth={16} />
    <circle cx={0} cy={0} r={r} fill="none" stroke={C.ink} strokeWidth={3} />
    <g transform={`rotate(38) translate(${r} 0)`}>
      <rect x={0} y={-16} width={150} height={32} rx={14} fill={C.woodDark} stroke={C.ink} strokeWidth={3} />
      <rect x={4} y={-12} width={60} height={8} rx={4} fill="#B08856" opacity={0.6} />
    </g>
  </g>
);

// ===================================================================
// 力士・行司
// ===================================================================
// ★IchiB11 #214 で流用する (第7条。力士・行司の見た目は章をまたいで同じ)
export const Rikishi: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  pose?: "stand" | "raise" | "banzai" | "armsFolded" | "point" | "hold";
  face?: "normal" | "smile" | "surprised" | "joy" | "worried";
  lean?: number;
}> = ({ x, y, s = 1, f, phase = 0, pose = "stand", face = "normal", lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const hairSway = Math.sin((f + phase * 13) / 20) * 2;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} pose={pose} face={face} cloth="#D9A878" clothDark="#C89763" hair="none" lean={lean} />
      {/* まわし・下がり・素足・大銀杏 (江戸の力士。すべて f で動く) */}
      <g transform={`translate(${x} ${y + bob}) rotate(${lean}) scale(${s})`}>
        {/* 素足 (共通部品の黒い靴を隠す) */}
        {[-18, 18].map((fx) => (
          <ellipse key={fx} cx={fx} cy={-4} rx={22} ry={10} fill="#D9A878" stroke={C.ink} strokeWidth={4} />
        ))}
        {/* まわし (横に巻いた帯 + 前袋 + 巻き線) */}
        <rect x={-62} y={-78} width={124} height={34} rx={7} fill={C.nokon} stroke={C.ink} strokeWidth={3} />
        <line x1={-58} y1={-68} x2={58} y2={-70} stroke="#28364A" strokeWidth={4} opacity={0.7} />
        <line x1={-58} y1={-56} x2={58} y2={-58} stroke="#28364A" strokeWidth={4} opacity={0.7} />
        <rect x={-10} y={-78} width={20} height={56} rx={5} fill={C.nokon} stroke={C.ink} strokeWidth={3} />
        {/* 下がり (前に垂れる房。f で揺れる) */}
        {Array.from({ length: 11 }).map((_, i) => {
          const dx = -50 + i * 10;
          const w = Math.sin((f + i * 11 + phase * 7) / 13) * 2.6;
          return (
            <path
              key={i}
              d={`M ${dx} -44 q ${w} 13 ${w * 1.5} 28`}
              stroke="#E8DFC8" strokeWidth={6} fill="none" strokeLinecap="round"
            />
          );
        })}
        {/* 月代と鬢 */}
        <path d="M -63 -228 C -69 -274 -40 -294 -4 -296 C -15 -283 -37 -275 -45 -250 C -49 -239 -49 -231 -47 -225 Z" fill={EDO_HAIR} />
        <path d="M 63 -228 C 69 -274 40 -294 4 -296 C 15 -283 37 -275 45 -250 C 49 -239 49 -231 47 -225 Z" fill={EDO_HAIR} />
        <path d="M -42 -287 C -16 -298 16 -298 42 -287 C 16 -291 -16 -291 -42 -287 Z" fill={EDO_HAIR} />
        {/* 大銀杏 (折り返した髷の先が銀杏の葉に広がる) */}
        <g transform={`translate(0 -292) rotate(${-6 + hairSway})`}>
          <rect x={-10} y={-15} width={34} height={15} rx={7} fill={EDO_HAIR} stroke={C.ink} strokeWidth={3} />
          <path d="M 20 -20 C 42 -31 58 -17 54 2 C 42 -6 30 -2 20 3 Z" fill="#3A332B" stroke={C.ink} strokeWidth={3} />
          <path d="M 26 -13 C 38 -19 46 -13 46 -5" stroke="#1F1B17" strokeWidth={3} fill="none" opacity={0.6} />
          <circle cx={-12} cy={-8} r={10} fill={EDO_HAIR} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
    </g>
  );
};

// ★IchiB11 #214 で流用する (第7条)
export const Gyoji: React.FC<{ x: number; y: number; s?: number; f: number; gunbaiRot?: number }> = ({ x, y, s = 1, f, gunbaiRot = 0 }) => {
  const bob = Math.sin(f / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} pose="hold" face="normal" cloth={C.beni} clothDark="#9C3A30" hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 草履と足袋 (共通部品の黒い靴を隠す) */}
        {[-18, 18].map((fx) => (
          <g key={fx}>
            <rect x={fx - 13} y={-26} width={26} height={22} rx={5} fill="#F4EEDC" stroke={C.ink} strokeWidth={3.5} />
            <ellipse cx={fx} cy={-3} rx={22} ry={10} fill="#D8C79B" stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 袴 (裾が f で揺れる) */}
        <path
          d={`M -60 -92 L 60 -92 L ${66 + Math.sin(f / 18) * 4} -26 L ${-66 + Math.sin(f / 18) * 4} -24 Z`}
          fill="#5A3038" stroke={C.ink} strokeWidth={5}
        />
        <line x1={0} y1={-90} x2={0} y2={-26} stroke="#3E2026" strokeWidth={4} opacity={0.7} />
        {/* 直垂の広袖 (両腕の外へ袂を垂らす) */}
        {[-1, 1].map((sd) => (
          <path
            key={sd}
            d={`M ${sd * 56} -150 L ${sd * 98} -146 L ${sd * (104 + Math.sin((f + sd * 20) / 15) * 4)} -72
                Q ${sd * 76} -58 ${sd * 52} -74 Z`}
            fill={C.beni} stroke={C.ink} strokeWidth={4.5}
          />
        ))}
        {/* 襟 (V字) と胸紐 */}
        <path d="M -50 -161 L -27 -161 L 5 -104 L -13 -100 Z" fill="#EFE7D2" stroke={C.ink} strokeWidth={4} />
        <path d="M 50 -161 L 27 -161 L -5 -104 L 13 -100 Z" fill="#F8F2E2" stroke={C.ink} strokeWidth={4} />
        <rect x={-50} y={-100} width={100} height={12} rx={6} fill={C.koban} stroke={C.ink} strokeWidth={3.5} />
        {/* 立烏帽子 + 顎紐 */}
        <path d="M -38 -278 L 38 -278 L 29 -346 L -27 -342 Z" fill="#2E2823" stroke={C.ink} strokeWidth={3.5} />
        <path d="M -34 -300 L 34 -300" stroke="#4A423A" strokeWidth={3} opacity={0.8} />
        <path
          d={`M -36 -276 q ${-5 + Math.sin(f / 17) * 3} 34 ${4 + Math.sin(f / 17) * 3} 56`}
          stroke="#2E2823" strokeWidth={5} fill="none" strokeLinecap="round"
        />
        <path
          d={`M 36 -276 q ${5 + Math.sin(f / 17) * 3} 34 ${-4 + Math.sin(f / 17) * 3} 56`}
          stroke="#2E2823" strokeWidth={5} fill="none" strokeLinecap="round"
        />
        {/* 軍配 (胸の高さで水平に。どちらにも上げない) */}
        <g transform={`translate(66 -232) rotate(${gunbaiRot})`}>
          <rect x={0} y={-9} width={96} height={18} rx={8} fill={C.woodDark} stroke={C.ink} strokeWidth={3} />
          <ellipse cx={152} cy={0} rx={62} ry={52} fill={C.koban} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={152} cy={0} rx={36} ry={28} fill="#E7C457" opacity={0.85} />
          <ellipse cx={152} cy={0} rx={36} ry={28} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
          {/* 房 (f で揺れる) */}
          {[0, 1, 2].map((i) => {
            const w = Math.sin((f + i * 13) / 14) * 4;
            return (
              <path
                key={i}
                d={`M ${146 + i * 6} 50 q ${w} 20 ${w * 1.4} 40`}
                stroke="#B8473A" strokeWidth={6} fill="none" strokeLinecap="round"
              />
            );
          })}
        </g>
      </g>
    </g>
  );
};

// ===================================================================
// 「天下一」の看板 (drop 0=掲げてある 1=下ろされた)
// ===================================================================
const Kanban: React.FC<{
  x: number; y: number; s?: number; f: number; drop?: number; hookOnly?: boolean; label?: string;
}> = ({ x, y, s = 1, f, drop = 0, hookOnly = false, label = "天下一" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 掛け金具 */}
    {[-56, 56].map((px) => (
      <g key={px}>
        <rect x={px - 7} y={-20} width={14} height={26} rx={5} fill="#7E7568" stroke={C.ink} strokeWidth={3} />
        <circle cx={px} cy={10} r={11} fill="none" stroke="#7E7568" strokeWidth={6} />
      </g>
    ))}
    {hookOnly ? (
      // 日焼けの跡だけ残る (看板があった場所が焼けずに残る)
      <g>
        <rect x={-96} y={20} width={192} height={120} fill="#CFC0A0" opacity={0.95} />
        <rect x={-96} y={20} width={192} height={120} fill="none" stroke="#A8977A" strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
      </g>
    ) : (
      <g transform={`translate(0 ${drop * 170}) rotate(${drop * 11 + Math.sin(f / 17) * 1.6})`}>
        {[-56, 56].map((px) => (
          <line key={px} x1={px} y1={10 - drop * 170} x2={px} y2={20} stroke={C.ink} strokeWidth={3} opacity={1 - drop} />
        ))}
        <rect x={-96} y={20} width={192} height={120} rx={8} fill={C.wood} stroke={C.ink} strokeWidth={5} />
        <rect x={-88} y={28} width={176} height={104} rx={5} fill="#B18A58" opacity={0.6} />
        <text x={0} y={96} fill={C.sumi} fontSize={54} fontFamily={FONT} fontWeight={900} textAnchor="middle">
          {label}
        </text>
      </g>
    )}
  </g>
);

// ===================================================================
// 天秤 (phase 1 = 傾く / phase 2 = 水平で止まる)
// ===================================================================
const Tenbin: React.FC<{ x: number; y: number; s?: number; f: number; phase?: 1 | 2 }> = ({ x, y, s = 1, f, phase = 1 }) => {
  const tilt = phase === 1 ? lerpAngle(f) : Math.sin(f / 22) * 0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 支柱 */}
      <path d="M -70 0 L 70 0 L 40 -30 L -40 -30 Z" fill="#8E8878" stroke={C.ink} strokeWidth={4} />
      <rect x={-13} y={-330} width={26} height={302} fill="#9A9183" stroke={C.ink} strokeWidth={4} />
      <g transform={`rotate(${tilt})`}>
        <rect x={-330} y={-346} width={660} height={16} rx={8} fill="#8E8878" stroke={C.ink} strokeWidth={4} />
        {[-300, 300].map((px) => (
          <g key={px}>
            <line x1={px} y1={-338} x2={px} y2={-250} stroke={C.ink} strokeWidth={3} />
            <path d={`M ${px - 86} -250 L ${px + 86} -250 L ${px + 64} -206 L ${px - 64} -206 Z`} fill={C.washi} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 左皿: 番付の束 */}
        <g transform="translate(-300 -266)">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-52 + i * 5} y={-16 - i * 13} width={104} height={16} rx={3} fill={C.washi} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 右皿: 王冠1つ */}
        <g transform="translate(300 -258)">
          <path d="M -44 0 L -44 -40 L -22 -20 L 0 -48 L 22 -20 L 44 -40 L 44 0 Z" fill={C.koban} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
      <circle cx={0} cy={-330} r={16} fill="#6E675C" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
const lerpAngle = (f: number) => -14 + easeOut(clamp01(seg(f, 4, 34))) * 3 + Math.sin(f / 16) * 1.2;

// ===================================================================
// 絵巻の床 (年表用)
// ===================================================================
const Emaki: React.FC<{ f: number; y?: number; h?: number; id: string }> = ({ f, y = 300, h = 400, id }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#C3B291" />
    {Array.from({ length: 10 }).map((_, i) => (
      <path key={`g${i}`} d={`M -40 ${50 + i * 112} C ${W * 0.4} ${28 + i * 112} ${W * 0.7} ${76 + i * 112} ${W + 40} ${44 + i * 112}`} stroke="#A4906C" strokeWidth={2} fill="none" opacity={0.3} />
    ))}
    {/* 巻いた両端 */}
    {[70, W - 70].map((px, i) => (
      <g key={px}>
        <rect x={px - 40} y={y - 30} width={80} height={h + 60} rx={30} fill="#9A7244" stroke={C.ink} strokeWidth={4} />
        <rect x={px - 40} y={y - 30} width={26} height={h + 60} rx={13} fill="#B08856" opacity={0.6} />
        <circle cx={px} cy={y - 42 + i * 0} r={14} fill="#6E4F2C" />
      </g>
    ))}
    {/* 紙 */}
    <rect x={110} y={y} width={W - 220} height={h} fill={C.washi} stroke={C.washiEdge} strokeWidth={3} />
    <g clipPath={`url(#${id})`} opacity={0.6}>
      <GridPaper pitch={44} opacity={0.22} />
    </g>
    <clipPath id={id}>
      <rect x={110} y={y} width={W - 220} height={h} />
    </clipPath>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M 130 ${y + 50 + i * (h / 4)} C ${W * 0.4} ${y + 30 + i * (h / 4)} ${W * 0.7} ${y + 74 + i * (h / 4)} ${W - 130} ${y + 44 + i * (h / 4)}`} stroke={C.washiEdge} strokeWidth={2} fill="none" opacity={0.6} />
    ))}
    {/* 文鎮 */}
    <g transform={`translate(260 ${y + h + 40 + Math.sin(f / 24) * 1})`}>
      <rect x={-70} y={-16} width={140} height={32} rx={8} fill="#55504A" />
      <rect x={-70} y={-16} width={140} height={10} rx={5} fill="#6D6760" />
    </g>
  </g>
);

// ===================================================================
// ★#80 の舞台 — 相撲部屋の稽古場
// 第16条の「床」: ①板壁 ②土間 ③稽古土俵 の三層を敷いてから物を置く。
// 壁に番付と化粧まわし、上は神棚、右は上がり座敷、窓から斜めの光。
// ===================================================================
const KeshoMawashi: React.FC<{
  x: number; y: number; s?: number; f: number; color?: string; phase?: number;
}> = ({ x, y, s = 1, f, color = "#8C2F3A", phase = 0 }) => {
  const sw = Math.sin((f + phase * 19) / 21) * 2.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 掛け竿 */}
      <rect x={-68} y={-16} width={136} height={14} rx={7} fill={C.woodDark} stroke={C.ink} strokeWidth={3} />
      <g transform={`rotate(${sw * 0.5})`}>
        {/* 前垂れ本体 */}
        <path d="M -52 0 L 52 0 L 44 196 L -44 196 Z" fill={color} stroke={C.ink} strokeWidth={4} />
        <path d="M -50 8 L 50 8 L 48 28 L -48 28 Z" fill={C.koban} opacity={0.85} />
        <path d="M -45 168 L 45 168 L 44 190 L -44 190 Z" fill={C.koban} opacity={0.85} />
        <circle cx={0} cy={98} r={29} fill="none" stroke={C.koban} strokeWidth={6} opacity={0.9} />
        <circle cx={0} cy={98} r={12} fill={C.koban} opacity={0.8} />
        {/* 房 (f で揺れる) */}
        {Array.from({ length: 9 }).map((_, i) => {
          const fx = -40 + i * 10;
          const fs = Math.sin((f + i * 9 + phase * 13) / 15) * 4;
          return (
            <path
              key={i}
              d={`M ${fx} 192 q ${fs} 26 ${fs * 1.5} 52`}
              stroke={C.koban} strokeWidth={6} fill="none" strokeLinecap="round"
            />
          );
        })}
      </g>
    </g>
  );
};

const Sumobeya: React.FC<{ f: number }> = ({ f }) => {
  const shimmer = 0.1 + Math.sin(f / 23) * 0.025;
  return (
    <g>
      {/* ───── ①板壁 (稽古場の壁) ───── */}
      <rect x={0} y={0} width={W} height={706} fill="#C7B693" />
      {Array.from({ length: 17 }).map((_, i) => (
        <g key={i}>
          <rect x={i * 115} y={0} width={115} height={706} fill={i % 2 ? "#C1AF8B" : "#CBBA97"} />
          <line x1={i * 115} y1={0} x2={i * 115} y2={706} stroke={C.woodDark} strokeWidth={3} opacity={0.35} />
          <path
            d={`M ${i * 115 + 22} 60 C ${i * 115 + 66} ${180 + (i % 3) * 40} ${i * 115 + 34} ${380 + (i % 4) * 30} ${i * 115 + 80} 650`}
            stroke="#A38F68" strokeWidth={2} fill="none" opacity={0.3}
          />
        </g>
      ))}
      {/* 梁 (上と中段) */}
      <rect x={0} y={54} width={W} height={46} fill={C.wood} />
      <rect x={0} y={54} width={W} height={11} fill="#B9915C" opacity={0.75} />
      <rect x={0} y={96} width={W} height={8} fill={C.woodDark} opacity={0.55} />
      <rect x={0} y={648} width={W} height={24} fill={C.wood} opacity={0.9} />
      {/* 柱 */}
      {[96, 760, 1468, 1848].map((px) => (
        <g key={px}>
          <rect x={px - 30} y={54} width={60} height={652} fill={C.wood} />
          <rect x={px - 30} y={54} width={13} height={652} fill="#B9915C" opacity={0.6} />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M ${px - 24} ${140 + i * 150} C ${px - 4} ${200 + i * 150} ${px + 6} ${96 + i * 150} ${px + 24} ${176 + i * 150}`}
              stroke={C.woodDark} strokeWidth={2} fill="none" opacity={0.33}
            />
          ))}
        </g>
      ))}
      {/* 軒下の影 */}
      <rect x={0} y={0} width={W} height={56} fill="#6B5F4A" opacity={0.34} />

      {/* ───── 神棚 (幣が f で揺れる) ───── */}
      <g transform="translate(1300 200)">
        <rect x={-96} y={0} width={192} height={16} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={4} />
        <rect x={-80} y={16} width={10} height={26} fill={C.woodDark} />
        <rect x={70} y={16} width={10} height={26} fill={C.woodDark} />
        <path d="M -44 0 L 44 0 L 30 -40 L -30 -40 Z" fill="#E9DFC4" stroke={C.ink} strokeWidth={4} />
        <path d="M -56 -40 L 56 -40 L 34 -74 L -34 -74 Z" fill={C.roof} stroke={C.ink} strokeWidth={4} />
        <rect x={-9} y={-34} width={18} height={34} fill={C.woodDark} opacity={0.7} />
        {[-70, 70].map((sx, i) => (
          <g key={sx} transform={`translate(${sx} -2) rotate(${Math.sin((f + i * 24) / 19) * 4})`}>
            <rect x={-5} y={-34} width={10} height={34} fill="#7C8C5A" />
            <path d="M 0 -34 C -20 -52 -10 -70 2 -78 C 12 -66 20 -50 0 -34 Z" fill="#6E8C52" stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
        {[-26, 26].map((sx, i) => (
          <path
            key={sx}
            d={`M ${sx} -36 q ${Math.sin((f + i * 17) / 14) * 5} 16 ${Math.sin((f + i * 17) / 14) * 7} 30`}
            stroke="#FBF6E6" strokeWidth={7} fill="none" strokeLinecap="round"
          />
        ))}
      </g>

      {/* ───── 窓 (格子) と斜めの光 ───── */}
      <g transform="translate(1646 316)">
        <rect x={-126} y={-116} width={252} height={232} fill="#F6EED8" stroke={C.woodDark} strokeWidth={8} />
        <rect x={-126} y={-116} width={252} height={232} fill="#FFFBEA" opacity={0.6} />
        {[-63, 0, 63].map((gx) => (
          <line key={gx} x1={gx} y1={-116} x2={gx} y2={116} stroke={C.woodDark} strokeWidth={6} />
        ))}
        {[-39, 39].map((gy) => (
          <line key={gy} x1={-126} y1={gy} x2={126} y2={gy} stroke={C.woodDark} strokeWidth={6} />
        ))}
        <rect x={-134} y={-124} width={268} height={248} fill="none" stroke={C.ink} strokeWidth={5} />
      </g>
      <path
        d="M 1520 440 L 1772 440 L 1210 1080 L 690 1080 Z"
        fill="#FFF6D8" opacity={shimmer}
      />

      {/* ───── 壁の化粧まわし ───── */}
      <KeshoMawashi x={166} y={188} s={0.62} f={f} color="#8C2F3A" phase={0} />
      <KeshoMawashi x={312} y={214} s={0.56} f={f} color="#2F4A6E" phase={2} />
      <KeshoMawashi x={1404} y={430} s={0.5} f={f} color="#4A6B46" phase={4} />

      {/* ───── 壁に貼られた番付 (小さく2枚) ───── */}
      <g transform={`rotate(${-1.4 + Math.sin(f / 26) * 0.5} 250 556)`}>
        <Banzuke x={250} y={556} s={0.26} f={f} t={1} phase="sumo" />
      </g>
      <g transform={`rotate(${1.6 + Math.sin((f + 30) / 24) * 0.5} 1186 560)`}>
        <Banzuke x={1186} y={560} s={0.24} f={f} t={1} phase="sumo" />
      </g>

      {/* ───── ②土間 ───── */}
      <rect x={0} y={700} width={W} height={H - 700} fill={C.soil} />
      <rect x={0} y={700} width={W} height={12} fill="#8E7A54" opacity={0.6} />
      {Array.from({ length: 46 }).map((_, i) => (
        <ellipse
          key={i}
          cx={((i * 157) % 20) * 98 + 24}
          cy={716 + ((i * 41) % 8) * 46}
          rx={26 + (i % 4) * 8}
          ry={11 + (i % 3) * 4}
          fill="#968360"
          opacity={0.32}
        />
      ))}

      {/* ───── ③稽古土俵 (俵の輪) ───── */}
      <ellipse cx={920} cy={910} rx={534} ry={158} fill="#8E7A54" opacity={0.3} />
      <ellipse cx={920} cy={904} rx={520} ry={146} fill={C.dohyo} stroke="#A68F63" strokeWidth={5} />
      <ellipse cx={920} cy={898} rx={470} ry={122} fill="#D4C49A" opacity={0.6} />
      {/* 仕切り線 */}
      {[-96, 96].map((dx) => (
        <rect key={dx} x={920 + dx - 13} y={884} width={26} height={78} rx={5} fill="#F6F0DE" opacity={0.85} />
      ))}
      {/* 俵 */}
      {Array.from({ length: 26 }).map((_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const bx = 920 + Math.cos(a) * 520;
        const by = 904 + Math.sin(a) * 146;
        const rot = (Math.atan2(146 * Math.cos(a), -520 * Math.sin(a)) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${bx} ${by}) rotate(${rot})`}>
            <rect x={-34} y={-13} width={68} height={26} rx={12} fill="#D9C48E" stroke={C.ink} strokeWidth={4} />
            {[-16, 0, 16].map((lx) => (
              <line key={lx} x1={lx} y1={-11} x2={lx} y2={11} stroke="#A98F63" strokeWidth={3} />
            ))}
          </g>
        );
      })}

      {/* ───── 力水の桶・柄杓・塩かご ───── */}
      <g transform="translate(204 956)">
        <path d="M -52 -58 L 52 -58 L 42 24 L -42 24 Z" fill="#B08856" stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-58} rx={52} ry={15} fill="#9DC2CE" stroke={C.ink} strokeWidth={4} />
        <ellipse cx={0} cy={-60 + Math.sin(f / 15) * 1.6} rx={43} ry={11} fill="#C3DEE8" opacity={0.9} />
        <rect x={-54} y={-32} width={108} height={10} rx={5} fill="#8A6B42" opacity={0.8} />
        {/* 柄杓 */}
        <g transform={`translate(34 -66) rotate(${-24 + Math.sin(f / 21) * 2.5})`}>
          <rect x={-5} y={-104} width={10} height={104} rx={5} fill={C.wood} stroke={C.ink} strokeWidth={3} />
          <path d="M -20 -2 L 20 -2 L 15 26 L -15 26 Z" fill="#C9B68F" stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
      <g transform="translate(336 1006)">
        <path d="M -46 -36 L 46 -36 L 36 22 L -36 22 Z" fill="#D8C79B" stroke={C.ink} strokeWidth={5} />
        {[-24, 0, 24].map((lx) => (
          <line key={lx} x1={lx} y1={-34} x2={lx * 0.8} y2={20} stroke="#A98F63" strokeWidth={3} />
        ))}
        <ellipse cx={0} cy={-36} rx={46} ry={13} fill="#F6F0DE" stroke={C.ink} strokeWidth={4} />
      </g>

      {/* ───── 上がり座敷 (右の板の間) ───── */}
      <g>
        <rect x={1476} y={744} width={W - 1476} height={H - 744} fill="#B08856" />
        <rect x={1476} y={744} width={W - 1476} height={20} fill="#C7A169" />
        <rect x={1476} y={744} width={22} height={H - 744} fill="#8A6B42" opacity={0.7} />
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={i} x1={1500 + i * 86} y1={764} x2={1500 + i * 86} y2={H} stroke="#8A6B42" strokeWidth={4} opacity={0.5} />
        ))}
        {/* 框の影 */}
        <rect x={1476} y={764} width={W - 1476} height={14} fill="#6E5536" opacity={0.3} />
        {/* 座布団 */}
        <g transform="translate(1636 846)">
          <rect x={-74} y={-22} width={148} height={44} rx={13} fill="#7A4A52" stroke={C.ink} strokeWidth={5} />
          <rect x={-66} y={-16} width={132} height={12} rx={6} fill="#96606A" opacity={0.8} />
        </g>
        {/* たたんだ稽古まわし */}
        <g transform="translate(1800 962)">
          <rect x={-70} y={-26} width={140} height={26} rx={9} fill="#3A4C66" stroke={C.ink} strokeWidth={5} />
          <rect x={-62} y={-48} width={124} height={24} rx={9} fill="#46597A" stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 竹ぼうき (柱に立てかける) */}
      <g transform={`translate(1430 1016) rotate(${7 + Math.sin(f / 28) * 1.2})`}>
        <rect x={-6} y={-330} width={12} height={330} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={3} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M 0 -12 C ${-30 + i * 8} 22 ${-38 + i * 10} 44 ${-34 + i * 9} 62`}
            stroke="#B6A074" strokeWidth={4} fill="none"
          />
        ))}
        <rect x={-10} y={-24} width={20} height={16} rx={5} fill="#6E5536" />
      </g>

      {/* ───── 稽古の砂埃 (f で昇る) ───── */}
      {Array.from({ length: 16 }).map((_, i) => {
        const pr = (f * 0.9 + i * 41) % 170;
        return (
          <circle
            key={i}
            cx={430 + ((i * 113) % 1000) + Math.sin((f + i * 13) / 18) * 12}
            cy={1000 - pr}
            r={5 + (i % 3) * 3}
            fill="#F2E7CC"
            opacity={0.34 * (1 - pr / 170)}
          />
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------
// #78 第5章、番付はあれど、優勝はなし。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S78: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 0, 20);
  return (
    <Frame
      f={f}
      seed={977}
      bg={C.skyWarm}
      over={<ChapterDoor num={5} title="番付はあれど 優勝はなし。" t={seg(f, 8, 26)} left={1070} top={600} width={790} />}
    >
      <EdoSky f={f} gid="ib5sky78" warm />
      <EdoRoofs f={f} y={420} />
      <EdoGround f={f} y={740} />
      {/* 太鼓櫓 */}
      <g transform="translate(320 740)">
        <path d="M -96 0 L -62 -300 L 62 -300 L 96 0 Z" fill={C.wood} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-88 + i * 8} y1={-60 - i * 60} x2={88 - i * 8} y2={-60 - i * 60} stroke={C.woodDark} strokeWidth={6} />
        ))}
        <line x1={-92} y1={-20} x2={88} y2={-280} stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
        <line x1={92} y1={-20} x2={-88} y2={-280} stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
        <path d="M -116 -300 L 116 -300 L 84 -364 L -84 -364 Z" fill={C.roof} stroke={C.ink} strokeWidth={5} />
        {/* 太鼓 */}
        <g transform={`translate(0 -330) scale(${1 + Math.sin(f / 9) * 0.03})`}>
          <ellipse cx={0} cy={0} rx={34} ry={30} fill={C.beni} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={20} ry={18} fill="#E6DCC4" stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
      <Nobori x={168} y={740} h={330} f={f} text="相撲" color={C.washi} />
      <Nobori x={470} y={742} h={290} f={f} color="#DCCBA8" />
      {/* 章扉 (右下) と重ならないよう、のれん・提灯は軒の高さへ */}
      <Noren x={1480} y={420} w={250} f={f} />
      <Chochin x={1180} y={400} f={f} s={1.1} />
      <Chochin x={1740} y={392} f={f} s={0.9} color="#E4C9A6" />
      {/* 番付売り: 縦一枚をかかげる */}
      <g transform={`translate(0 ${(1 - easeOut(t)) * 40})`}>
        <EdoPerson x={760} y={830} s={0.92} f={f} pose="banzai" face="joy" cloth={C.nokon} clothDark="#2C3A4E" kind="yomiuri" v={1} />
        <Banzuke x={760} y={430} s={0.56} f={f} t={seg(f, 4, 22)} phase="sumo" />
      </g>
      {/* 群がる町人5人 */}
      <EdoPersonMini x={560} y={846} s={0.8} color={C.beni} f={f} phase={0} face="smile" arms="up" v={0} />
      <EdoPersonMini x={640} y={860} s={0.72} color="#7E868E" f={f} phase={2} face="dot" arms="up" v={1} />
      <EdoPersonMini x={900} y={858} s={0.76} color="#6E8C62" f={f} phase={4} face="smile" arms="up" v={2} />
      <EdoPersonMini x={980} y={844} s={0.82} color="#8D6A44" f={f} phase={1} face="dot" arms="down" v={4} />
      <EdoPersonMini x={470} y={866} s={0.68} color={C.nokon} f={f} phase={3} face="smile" arms="down" v={5} kodomo />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #79 江戸時代の日本は、実はランキングが大好きでした。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S79: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={978} bg={C.wall}>
    <EdoWall f={f} />
    <EdoGround f={f} y={820} />
    {/* 町角の掲示板 */}
    <g transform="translate(900 120)">
      <rect x={-640} y={0} width={1280} height={560} rx={10} fill={C.wood} stroke={C.ink} strokeWidth={6} />
      <rect x={-616} y={24} width={1232} height={512} fill="#E7DCC2" stroke={C.woodDark} strokeWidth={3} />
      <path d="M -672 0 L 672 0 L 600 -78 L -600 -78 Z" fill={C.roof} stroke={C.ink} strokeWidth={5} />
      {/* 番付10枚 */}
      {Array.from({ length: 10 }).map((_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const sw = Math.sin((f + i * 13) / 16) * 2.4;
        const ap = clamp01(seg(f, 2 + i * 2, 14 + i * 2));
        return (
          <g key={i} transform={`translate(${-500 + col * 250} ${80 + row * 250}) rotate(${sw + (i % 3) - 1})`} opacity={ap}>
            <rect x={-82} y={-6} width={164} height={222} fill="#8D7A58" opacity={0.18} />
            <rect x={-88} y={-12} width={164} height={222} fill={C.washi} stroke={C.washiEdge} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <rect key={r} x={-72} y={8 + r * 32} width={132 - r * 16} height={14 - r * 1.6} rx={4} fill={C.sumi} opacity={0.6} />
            ))}
          </g>
        );
      })}
    </g>
    {/* 覗き込む3人 */}
    <EdoPersonMini x={520} y={880} s={1.0} color={C.beni} f={f} phase={0} face="dot" arms="up" v={0} />
    <EdoPersonMini x={680} y={892} s={0.9} color={C.nokon} f={f} phase={2} face="smile" arms="down" v={2} />
    <EdoPersonMini x={1300} y={884} s={0.95} color="#6E8C62" f={f} phase={4} face="dot" arms="up" v={1} />
    <TagPlate x={1560} y={760} text="番付大好き" size={48} t={seg(f, 18, 34)} />
  </Frame>
);

// ------------------------------------------------------------------
// #80 まず、相撲の番付。いまに続く縦一枚の形は、1757年からです。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S80: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 6, 30);
  return (
    <Frame f={f} seed={979} bg={C.wall}>
      {/* ★舞台を相撲部屋の稽古場へ (板壁・土間・稽古土俵・神棚・上がり座敷) */}
      <Sumobeya f={f} />
      {/* 稽古土俵の脇で稽古する力士ふたり */}
      <Rikishi x={560} y={930} s={0.9} f={f} phase={3} pose="armsFolded" face="normal" lean={6} />
      <Rikishi x={1296} y={936} s={0.88} f={f} phase={5} pose="armsFolded" face="normal" lean={-6} />
      {/* 半纏の呼出が、刷り上がった縦一枚を両手で広げる */}
      <EdoPerson x={980} y={980} s={1.05} f={f} pose="banzai" face="smile" cloth="#6E8C62" clothDark="#55704C" kind="shokunin" v={2} />
      <g transform={`translate(0 ${(1 - easeOut(t)) * 26})`} opacity={clamp01(t * 1.4)}>
        <Banzuke x={980} y={420} s={0.62} f={f} t={t} phase="sumo" />
      </g>
      <TagPlate x={420} y={300} text="1757年から" size={54} t={seg(f, 20, 36)} color={C.beni} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #81 強い力士ほど上に、太く大きな文字で書かれます。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S81: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + easeOut(clamp01(seg(f, 0, 32))) * 0.78;
  return (
    <Frame f={f} seed={980} bg={C.wall}>
      <EdoWall f={f} />
      {/* 壁にかかった番付 (上段へ寄る) */}
      <g transform={zoomAt(z, 760, 330)}>
        {[-6, 6].map((d) => (
          <line key={d} x1={760 + d * 30} y1={110} x2={760 + d * 30} y2={150} stroke={C.ink} strokeWidth={3} />
        ))}
        <Banzuke x={760} y={500} s={0.95} f={f} t={seg(f, 2, 18)} phase="sumo" />
      </g>
      {/* 見上げる力士 */}
      <Rikishi x={1560} y={900} s={1.08} f={f} pose="raise" face="surprised" />
      <Arrow x={1300} y={300} s={1.1} rot={-90} t={seg(f, 18, 32)} color={C.beni} />
      <TagPlate x={1430} y={470} text="上は太く大きい" size={46} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #82 下にいくほど文字は小さくなり、いちばん下は虫眼鏡がほしいサイズ。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S82: React.FC<{ f: number }> = ({ f }) => {
  // #81 の続き。カメラが上段→下段へ降りる
  const d = easeOut(clamp01(seg(f, 0, 30)));
  const cy = lerp(330, 760, d);
  const z = 1.78;
  return (
    <Frame f={f} seed={981} bg={C.wall}>
      <EdoWall f={f} />
      <g transform={zoomAt(z, 700, cy)}>
        <Banzuke x={700} y={500} s={0.95} f={f} t={1} phase="sumo" />
      </g>
      {/* 虫眼鏡: レンズの中だけ字が拡大 */}
      <g opacity={clamp01(seg(f, 14, 28))}>
        <Magnifier x={1310} y={560} r={150} f={f} cid="ib5mag82">
          {/* レンズの中だけ、最下段 (前頭・序ノ口の段) を 2.0倍で見せる。
              Magnifier の中は translate 済みなので原点 (0,0) がレンズの中心。
              紙の (137, 592) をレンズの中心に置く → x = -2.0*(137-215) = 156 /
              y = -2.0*(592-360) = -464。レンズ半径 140 なので紙の x 67〜207 /
              y 522〜662 が見える = 前頭・序ノ口の階級名 (中心 x=87) と
              名前帯の1本目 (x=166 から) がちゃんと枠に入る */}
          <Banzuke x={156} y={-464} s={2.0} f={f} t={1} phase="sumo" />
        </Magnifier>
      </g>
      <TagPlate x={1430} y={300} text="虫眼鏡がほしい" size={46} t={seg(f, 24, 38)} color={C.beni} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #83 字の大きさで序列を見せる、恐ろしく直感的なデザインです。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S83: React.FC<{ f: number }> = ({ f }) => {
  const bars = [
    { fs: 72, w: 760 },
    { fs: 54, w: 600 },
    { fs: 38, w: 450 },
    { fs: 24, w: 320 },
    { fs: 14, w: 210 },
  ];
  return (
    <Frame f={f} seed={982} bg="#B9A581">
      <WashiSheet f={f} id="ib5w83" x={200} y={140} w={1400} h={660} />
      {/* 段ごとの字の大きさを帯で並べる */}
      {bars.map((b, i) => {
        const t = clamp01(seg(f, 2 + i * 5, 18 + i * 5));
        const y = 230 + i * 125;
        return (
          <g key={i} opacity={t}>
            <rect x={300} y={y - b.fs * 0.6} width={b.w * easeOut(t)} height={b.fs * 1.2} rx={8} fill={C.sumi} opacity={0.82} />
            <text x={300 + b.w + 26} y={y + b.fs * 0.38} fill={C.sumi} fontSize={Math.max(b.fs, 22)} fontFamily={FONT} fontWeight={900}>
              {i + 1}
            </text>
          </g>
        );
      })}
      {/* 下向きの矢印 */}
      <g opacity={clamp01(seg(f, 22, 34))}>
        <Arrow x={1480} y={250} s={1.5} rot={90} t={seg(f, 22, 34)} color={C.beni} />
      </g>
      <TagPlate x={1130} y={760} text="字の大きさ＝序列" size={50} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #84 そして江戸の人々は、これを相撲だけにしておきませんでした。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S84: React.FC<{ f: number }> = ({ f }) => {
  const brush = easeOut(clamp01(seg(f, 6, 34)));
  return (
    <Frame f={f} seed={983} bg={C.wall}>
      <EdoWall f={f} />
      {/* 長屋の縁側 (板の間) */}
      <g>
        <rect x={0} y={640} width={W} height={H - 640} fill="#B08856" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={0} y1={640 + i * 58} x2={W} y2={640 + i * 58} stroke={C.woodDark} strokeWidth={3} opacity={0.45} />
        ))}
        <rect x={0} y={640} width={W} height={12} fill="#C9A570" />
      </g>
      {/* 脇に置いた相撲の番付 */}
      <g transform="rotate(-8 400 560)">
        <Banzuke x={400} y={520} s={0.42} f={f} t={1} phase="sumo" />
      </g>
      {/* 白紙に筆を走らせる町人 (紙は縁側の板の上) */}
      <g>
        <rect x={880} y={690} width={520} height={290} rx={6} fill={C.washi} stroke={C.washiEdge} strokeWidth={4} transform="rotate(-2 1140 835)" />
        <path
          d={`M 950 ${760} C ${950 + 380 * brush} ${760 + 20 * brush} ${950 + 120 * brush} ${860} ${950 + 400 * brush} ${880}`}
          stroke={C.sumi}
          strokeWidth={9}
          fill="none"
          opacity={0.75}
          strokeLinecap="round"
        />
      </g>
      <EdoPerson x={1620} y={1000} s={1.02} f={f} pose="point" pointDir={-1} face="smile" cloth="#8D6A44" clothDark="#6E4F2C" kind="chonin" v={0} />
      {/* 墨と猪口 */}
      <g transform="translate(760 940)">
        <ellipse cx={0} cy={0} rx={46} ry={17} fill="#403A33" stroke={C.ink} strokeWidth={3} />
        <ellipse cx={0} cy={-5} rx={32} ry={10} fill="#1D1A17" />
      </g>
      <g transform="translate(640 936)">
        <path d="M -30 -34 L 30 -34 L 22 6 L -22 6 Z" fill="#F0E9D6" stroke={C.ink} strokeWidth={3} />
        <ellipse cx={0} cy={-32} rx={29} ry={8} fill="#E8DCBE" stroke={C.ink} strokeWidth={2} />
      </g>
      <TagPlate x={330} y={250} text="相撲だけでは" size={48} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #85 「見立番付」といって、何でも番付にしたのです。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S85: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={984} bg={C.wall}>
    <EdoWall f={f} />
    {/* 絵草紙屋の店先: 壁一面に見立番付 */}
    {Array.from({ length: 12 }).map((_, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const ap = clamp01(seg(f, 1 + i * 2, 12 + i * 2));
      const sw = Math.sin((f + i * 11) / 17) * 2;
      const tint = [C.washi, "#EDE2C8", "#F2EBD6"][i % 3];
      return (
        <g key={i} transform={`translate(${190 + col * 290} ${160 + row * 250}) rotate(${sw + ((i * 7) % 5) - 2})`} opacity={ap}>
          <rect x={-86} y={-6} width={172} height={212} fill="#8D7A58" opacity={0.18} />
          <rect x={-92} y={-12} width={172} height={212} fill={tint} stroke={C.washiEdge} strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((r) => (
            <rect key={r} x={-76} y={14 + r * 36} width={138 - r * 20} height={15 - r * 1.8} rx={4} fill={C.sumi} opacity={0.55} />
          ))}
        </g>
      );
    })}
    {/* のれん・積み本・天秤棒 */}
    <Noren x={1680} y={150} w={300} f={f} color={C.beni} />
    <g transform="translate(0 0)">
      <rect x={0} y={700} width={W} height={H - 700} fill="#B08856" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={0} y1={700 + i * 48} x2={W} y2={700 + i * 48} stroke={C.woodDark} strokeWidth={3} opacity={0.4} />
      ))}
    </g>
    <g transform="translate(180 700)">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-74 + (i % 2) * 7} y={-26 - i * 24} width={148} height={24} rx={4} fill={i % 2 ? "#E3D6B4" : C.washi} stroke={C.ink} strokeWidth={3} />
      ))}
    </g>
    <g transform={`translate(1760 ${700 + Math.sin(f / 21) * 2}) rotate(-72)`}>
      <rect x={-7} y={-300} width={14} height={300} rx={6} fill={C.woodDark} />
    </g>
    {/* 指差して笑う町人4人 */}
    <EdoPerson x={720} y={900} s={0.9} f={f} pose="point" pointDir={-1} face="joy" cloth={C.nokon} clothDark="#2C3A4E" kind="shonin" v={4} />
    <EdoPersonMini x={900} y={906} s={0.92} color={C.beni} f={f} phase={1} face="smile" arms="up" v={0} />
    <EdoPersonMini x={1070} y={918} s={0.84} color="#6E8C62" f={f} phase={3} face="smile" arms="up" v={2} />
    <EdoPersonMini x={1230} y={900} s={0.9} color="#8D6A44" f={f} phase={5} face="dot" arms="down" v={1} />
    <TagPlate x={1500} y={620} text="見立番付" size={56} t={seg(f, 22, 38)} color={C.beni} />
  </Frame>
);

// ------------------------------------------------------------------
// #86 温泉の番付。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
// ★#86/#87/#88 は同じ絵。phase prop で中身だけ入れ替える (絵を複製しない)
const MitateScene: React.FC<{ f: number; phase: "onsen" | "ryori" | "kanemochi" }> = ({ f, phase }) => {
  const label = phase === "onsen" ? "温泉" : phase === "ryori" ? "名物料理" : "お金持ち";
  const tag = phase === "onsen" ? "温泉" : phase === "ryori" ? "名物料理" : "お金持ち";
  return (
    <g>
      <EdoWall f={f} tone={1} />
      {/* 壁に残る他の見立番付 (薄く) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i} opacity={0.45} transform={`translate(${1250 + (i % 3) * 230} ${180 + Math.floor(i / 3) * 260}) rotate(${((i * 5) % 7) - 3})`}>
          <rect x={-78} y={-10} width={156} height={200} fill={C.washi} stroke={C.washiEdge} strokeWidth={3} />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={-62} y={14 + r * 42} width={120 - r * 22} height={13 - r * 2} rx={4} fill={C.sumi} opacity={0.4} />
          ))}
        </g>
      ))}
      <g transform="translate(0 0)">
        <rect x={0} y={760} width={W} height={H - 760} fill="#B08856" />
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={0} y1={760 + i * 48} x2={W} y2={760 + i * 48} stroke={C.woodDark} strokeWidth={3} opacity={0.4} />
        ))}
      </g>
      {/* 主役: 同じ番付の形に中身だけ変わる */}
      <Banzuke x={620} y={450} s={1.0} f={f} t={seg(f, 0, 16)} phase={phase} title={label} />
      {/* phase ごとの小物 */}
      {phase === "onsen" && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M ${1220 + i * 80} 700 C ${1240 + i * 80 + Math.sin((f + i * 18) / 15) * 22} 600 ${1200 + i * 80} 520 ${1248 + i * 80} 410`}
              stroke="#CFE2EA"
              strokeWidth={18}
              fill="none"
              strokeLinecap="round"
              opacity={0.75}
            />
          ))}
          <g transform="translate(1400 780)">
            <path d="M -110 -70 L 110 -70 L 86 20 L -86 20 Z" fill={C.wood} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={0} cy={-70} rx={110} ry={26} fill={C.yu} stroke={C.ink} strokeWidth={4} />
            <ellipse cx={-26} cy={-74} rx={46} ry={11} fill="#C3DEE8" opacity={0.8} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={-92 + i * 46} y1={-62} x2={-76 + i * 40} y2={16} stroke={C.woodDark} strokeWidth={3} opacity={0.5} />
            ))}
          </g>
        </g>
      )}
      {phase === "ryori" && (
        <g>
          <g transform="translate(1300 560)">
            <circle cx={0} cy={0} r={96} fill="#F2EBD6" stroke={C.ink} strokeWidth={5} />
            <g transform="scale(2.0)">
              <FoodIcon s={1} kind={0} />
            </g>
          </g>
          <g transform="translate(1540 740)">
            <circle cx={0} cy={0} r={86} fill="#F2EBD6" stroke={C.ink} strokeWidth={5} />
            <g transform="scale(1.8)">
              <FoodIcon s={1} kind={1} />
            </g>
          </g>
          <g transform="translate(1180 790)">
            <circle cx={0} cy={0} r={80} fill="#F2EBD6" stroke={C.ink} strokeWidth={5} />
            <g transform="scale(1.7)">
              <FoodIcon s={1} kind={2} />
            </g>
          </g>
        </g>
      )}
      {phase === "kanemochi" && (
        <g>
          <Senryobako x={1470} y={820} s={1.15} />
          {Array.from({ length: 11 }).map((_, i) => {
            const row = Math.floor(i / 4);
            return (
              <g key={i} transform={`translate(${1210 + (i % 4) * 66 + row * 30} ${806 - row * 42}) scale(1.4)`}>
                <KobanIcon s={1} />
              </g>
            );
          })}
        </g>
      )}
      <TagPlate x={1430} y={250} text={tag} size={58} t={seg(f, 14, 30)} color={C.beni} />
    </g>
  );
};

const S86: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={985} bg={C.wall}>
    <MitateScene f={f} phase="onsen" />
  </Frame>
);

// ------------------------------------------------------------------
// #87 名物料理の番付。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S87: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={986} bg={C.wall}>
    <MitateScene f={f} phase="ryori" />
  </Frame>
);

// ------------------------------------------------------------------
// #88 お金持ちの番付まであります。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S88: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={987} bg={C.wall}>
    <MitateScene f={f} phase="kanemochi" />
  </Frame>
);

// ------------------------------------------------------------------
// #89 ランキングを「娯楽」として楽しむ発明は、江戸で完成していました。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S89: React.FC<{ f: number }> = ({ f }) => {
  const draw = easeOut(clamp01(seg(f, 10, 38)));
  return (
    <Frame f={f} seed={988} bg={C.skyWarm}>
      <EdoSky f={f} gid="ib5sky89" warm />
      {/* 長屋の路地: 両側の壁 */}
      <g>
        <path d="M 0 0 L 420 170 L 420 760 L 0 920 Z" fill={C.wall} />
        <path d="M 0 0 L 420 170 L 420 760 L 0 920 Z" fill={C.wallDark} opacity={0.25} />
        <path d="M 1920 0 L 1480 170 L 1480 760 L 1920 920 Z" fill={C.wall} />
        <path d="M 1920 0 L 1480 170 L 1480 760 L 1920 920 Z" fill={C.wallDark} opacity={0.25} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={100 + i * 100} y1={40 + i * 42} x2={100 + i * 100} y2={880 - i * 40} stroke={C.woodDark} strokeWidth={5} opacity={0.3} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={`r${i}`} x1={1820 - i * 100} y1={40 + i * 42} x2={1820 - i * 100} y2={880 - i * 40} stroke={C.woodDark} strokeWidth={5} opacity={0.3} />
        ))}
      </g>
      {/* 奥の町並み */}
      <Machiya x={960} y={360} s={0.6} dark={0.35} />
      <EdoGround f={f} y={700} stone={false} />
      {/* 物干し */}
      <g>
        <line x1={420} y1={200} x2={1480} y2={200} stroke={C.ink} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={560 + i * 240} y={200} width={120} height={160} fill={i % 2 ? "#DCCBA8" : "#CFE2EA"} stroke={C.ink} strokeWidth={3} transform={`rotate(${Math.sin((f + i * 20) / 18) * 2} ${620 + i * 240} 200)`} />
        ))}
      </g>
      {/* 井戸 */}
      <g transform="translate(290 820)">
        <ellipse cx={0} cy={0} rx={96} ry={34} fill={C.stone} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-8} rx={70} ry={22} fill="#5E6B70" />
        <rect x={-86} y={-150} width={14} height={150} fill={C.woodDark} />
        <rect x={72} y={-150} width={14} height={150} fill={C.woodDark} />
        <rect x={-100} y={-166} width={200} height={18} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 猫 */}
      <g transform="translate(1660 856)">
        <ellipse cx={0} cy={0} rx={52} ry={24} fill="#E2D6BC" stroke={C.ink} strokeWidth={4} />
        <circle cx={-44} cy={-20} r={22} fill="#E2D6BC" stroke={C.ink} strokeWidth={4} />
        <path d="M -58 -34 l 6 -18 l 12 12 Z" fill="#E2D6BC" stroke={C.ink} strokeWidth={3} />
        <path d="M -34 -36 l 8 -16 l 10 14 Z" fill="#E2D6BC" stroke={C.ink} strokeWidth={3} />
        <path d={`M 48 -6 C ${72 + Math.sin(f / 11) * 10} -30 ${60} -50 ${44} -56`} stroke={C.ink} strokeWidth={6} fill="none" />
      </g>
      {/* 番付を回し読みする町人7人 */}
      <EdoPersonMini x={690} y={880} s={0.82} color={C.beni} f={f} phase={0} face="smile" arms="up" v={0} />
      <EdoPersonMini x={790} y={896} s={0.76} color={C.nokon} f={f} phase={2} face="smile" arms="down" v={1} />
      <EdoPersonMini x={900} y={886} s={0.8} color="#6E8C62" f={f} phase={4} face="smile" arms="up" v={2} />
      <EdoPersonMini x={1010} y={900} s={0.74} color="#8D6A44" f={f} phase={1} face="dot" arms="down" v={3} />
      <EdoPersonMini x={1120} y={888} s={0.78} color="#B0783A" f={f} phase={3} face="smile" arms="up" v={4} />
      <EdoPersonMini x={1290} y={898} s={0.72} color="#7E868E" f={f} phase={5} face="smile" arms="down" v={5} />
      <EdoPersonMini x={1400} y={884} s={0.76} color={C.beni} f={f} phase={6} face="dot" arms="up" v={1} />
      {/* 手に持って回し読み (人より手前に描く) */}
      <g transform={`rotate(${-5 + Math.sin(f / 21) * 1.5} 840 790)`}>
        <Banzuke x={840} y={790} s={0.26} f={f} t={1} phase="sumo" />
      </g>
      <g transform={`rotate(${6 + Math.sin(f / 17) * 1.5} 1220 800)`}>
        <Banzuke x={1220} y={800} s={0.23} f={f} t={1} phase="onsen" title="見立" />
      </g>
      {/* 子どもが地面に番付を描く */}
      <g transform="translate(530 940)">
        <EdoPersonMini x={0} y={0} s={0.5} color="#C9752F" f={f} phase={7} face="smile" arms="down" kodomo />
        <g opacity={0.6}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={70} y={-14 + i * 22} width={(150 - i * 34) * draw} height={9} rx={3} fill="#7E7869" />
          ))}
        </g>
      </g>
      <TagPlate x={1560} y={420} text="娯楽の発明" size={52} t={seg(f, 24, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #90 ところが、です。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S90: React.FC<{ f: number }> = ({ f }) => {
  // 賑わいが止まる。色が一段おちる・大きな間 (札なし)
  const stop = easeOut(clamp01(seg(f, 4, 26)));
  const sway = Math.sin(f / 16) * 4 * (1 - stop);
  return (
    <Frame f={f} seed={989} bg={C.wall}>
      <EdoWall f={f} />
      <g transform="translate(0 0)">
        <rect x={0} y={760} width={W} height={H - 760} fill="#B08856" />
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={0} y1={760 + i * 48} x2={W} y2={760 + i * 48} stroke={C.woodDark} strokeWidth={3} opacity={0.4} />
        ))}
      </g>
      {/* はためいていた番付。1枚だけ風に止まる */}
      {Array.from({ length: 6 }).map((_, i) => {
        const px = 230 + i * 250;
        const own = i === 2;
        const r = own ? sway * 0.2 : Math.sin((f + i * 23) / 14) * 3.6;
        return (
          <g key={i} transform={`translate(${px} 190) rotate(${r})`} opacity={own ? 1 : 0.72}>
            <rect x={-82} y={-6} width={164} height={300} fill="#8D7A58" opacity={0.16} />
            <rect x={-88} y={-12} width={164} height={300} fill={C.washi} stroke={C.washiEdge} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5].map((rr) => (
              <rect key={rr} x={-72} y={18 + rr * 44} width={132 - rr * 18} height={15 - rr * 1.8} rx={4} fill={C.sumi} opacity={0.5} />
            ))}
          </g>
        );
      })}
      {/* 振り向く町人 */}
      <EdoPerson x={960} y={930} s={1.06} f={f} pose="stand" face="surprised" cloth={C.nokon} clothDark="#2C3A4E" gaze={[-3, -2]} lean={-4} kind="chonin" v={1} />
      <EdoPersonMini x={1300} y={930} s={0.84} color="#7E868E" f={f} phase={2} face="dot" arms="down" v={2} />
      {/* 色が一段おちる */}
      <rect x={0} y={0} width={W} height={H} fill="#5E6B70" opacity={0.2 * stop} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #91 その江戸の相撲に、「今場所の優勝者」という概念はありませんでした。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S91: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={990} bg={C.wall}>
    <EdoWall f={f} />
    {/* 相撲小屋の内部: 板の間と梁 */}
    <g>
      <rect x={0} y={0} width={W} height={120} fill={C.woodDark} opacity={0.5} />
      <rect x={0} y={96} width={W} height={26} fill={C.wood} />
      <rect x={0} y={720} width={W} height={H - 720} fill="#B08856" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={0} y1={720 + i * 46} x2={W} y2={720 + i * 46} stroke={C.woodDark} strokeWidth={3} opacity={0.4} />
      ))}
      {/* 観客のシルエット (遠景) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <EdoPersonMini key={i} x={70 + i * 138} y={716} s={0.4} color="#9AA0A6" f={f} phase={i} face="none" arms="down" v={i % 6} />
      ))}
    </g>
    {/* 左右に賑やかな番付 */}
    <Banzuke x={300} y={420} s={0.6} f={f} t={seg(f, 0, 14)} phase="sumo" />
    <Banzuke x={1660} y={430} s={0.56} f={f} t={seg(f, 2, 16)} phase="sumo" />
    <Nobori x={520} y={720} h={260} f={f} color="#DCCBA8" />
    <Nobori x={1420} y={722} h={240} f={f} color={C.washi} />
    {/* 正面の額縁だけが空っぽ */}
    <g transform="translate(960 330)">
      <rect x={-262} y={-172} width={524} height={344} rx={8} fill={C.koban} stroke={C.ink} strokeWidth={7} />
      <rect x={-240} y={-150} width={480} height={300} rx={5} fill="#E7C457" opacity={0.35} />
      <rect x={-216} y={-128} width={432} height={256} fill="#7E7568" opacity={0.35} />
      <rect x={-216} y={-128} width={432} height={256} fill="none" stroke={C.ink} strokeWidth={4} />
      {/* 内側の影 */}
      <rect x={-216} y={-128} width={432} height={26} fill={C.ink} opacity={0.2} />
      <XMark x={0} y={0} s={1.5} t={seg(f, 16, 32)} color={C.beni} />
    </g>
    {/* 優勝杯の台座も空 */}
    <g transform="translate(960 790)">
      <rect x={-130} y={-54} width={260} height={54} rx={8} fill="#9A9183" stroke={C.ink} strokeWidth={5} />
      <rect x={-104} y={-82} width={208} height={30} rx={6} fill="#AFA695" stroke={C.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-82} rx={76} ry={16} fill="#8E8878" stroke={C.ink} strokeWidth={3} />
      <ellipse cx={0} cy={-84} rx={54} ry={10} fill="#6E675C" opacity={0.5} />
    </g>
    <TagPlate x={1240} y={700} text="優勝者の席" size={48} t={seg(f, 24, 38)} color={C.beni} />
  </Frame>
);

// ------------------------------------------------------------------
// #92 あるのは番付の上がり下がりと、日々の勝ち星だけ。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S92: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={991} bg="#B9A581">
    <WashiSheet f={f} id="ib5w92" x={200} y={150} w={1480} h={640} />
    {/* 星取表 (○●) */}
    <g>
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 9 }).map((_, col) => {
          const i = row * 9 + col;
          const t = clamp01(seg(f, 1 + i * 1.1, 10 + i * 1.1));
          const win = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1][i] === 1;
          const cx = 330 + col * 124;
          const cy = 290 + row * 150;
          return (
            <g key={i} opacity={t} transform={`translate(${cx} ${cy}) scale(${pop(t)})`}>
              {win ? (
                <circle cx={0} cy={0} r={38} fill="none" stroke={C.sumi} strokeWidth={10} />
              ) : (
                <circle cx={0} cy={0} r={38} fill={C.sumi} opacity={0.85} />
              )}
            </g>
          );
        }),
      )}
    </g>
    {/* 番付の上下動を示す上下の矢印 */}
    <g opacity={clamp01(seg(f, 22, 36))}>
      <Arrow x={1510} y={300} s={1.4} rot={-90} t={seg(f, 22, 34)} color={C.beni} />
      <Arrow x={1620} y={520} s={1.4} rot={90} t={seg(f, 26, 38)} color={C.nokon} />
    </g>
    <TagPlate x={940} y={760} text="上がり下がりと勝ち星" size={44} t={seg(f, 28, 40)} />
  </Frame>
);

// ------------------------------------------------------------------
// #93 しかも取組には、引き分けや預かりといった、白黒つけない結末が普通にあったとされます。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S93: React.FC<{ f: number }> = ({ f }) => {
  // 軍配をどちらにも上げず、水平に止める
  const hold = easeOut(clamp01(seg(f, 6, 30)));
  return (
    <Frame f={f} seed={992} bg={C.wall}>
      <EdoWall f={f} />
      {/* 観客 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <EdoPersonMini key={i} x={90 + i * 160} y={600} s={0.46} color={i % 3 === 0 ? "#9AA0A6" : "#A8A49C"} f={f} phase={i} face="dot" arms="down" v={i % 6} />
      ))}
      {/* 土俵 */}
      <g>
        <rect x={0} y={600} width={W} height={H - 600} fill={C.soil} />
        {Array.from({ length: 36 }).map((_, i) => (
          <ellipse key={i} cx={((i * 157) % 20) * 98 + 20} cy={620 + ((i * 37) % 8) * 54} rx={24} ry={9} fill="#96866A" opacity={0.26} />
        ))}
        <ellipse cx={960} cy={830} rx={620} ry={190} fill={C.dohyo} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={822} rx={520} ry={152} fill="none" stroke="#EFE6D0" strokeWidth={12} />
        <ellipse cx={960} cy={818} rx={520} ry={152} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.4} />
      </g>
      {/* 組み合った力士2人 */}
      <Rikishi x={820} y={830} s={1.0} f={f} phase={0} pose="raise" face="normal" lean={10} />
      <Rikishi x={1240} y={830} s={1.0} f={f} phase={3} pose="raise" face="normal" lean={-10} />
      {/* 行司が間に入り、軍配を水平に止める (手前・大きめ) */}
      <Gyoji x={880} y={1010} s={1.05} f={f} gunbaiRot={lerp(-42, 0, hold)} />
      {/* 「どちらにも上げない」水平の目安線 */}
      <g opacity={0.3 * hold}>
        <line x1={700} y1={766} x2={1300} y2={766} stroke={C.ink} strokeWidth={4} strokeDasharray="16 14" />
      </g>
      {/* きょとんとする観客 */}
      <EdoPersonMini x={300} y={1010} s={0.7} color={C.nokon} f={f} phase={1} face="dot" arms="down" v={0} />
      <EdoPersonMini x={430} y={1016} s={0.66} color="#7E868E" f={f} phase={4} face="dot" arms="down" v={1} />
      <EdoPersonMini x={1620} y={1012} s={0.68} color={C.beni} f={f} phase={2} face="dot" arms="down" v={2} />
      <QMark x={360} y={790} s={0.7} f={f} t={seg(f, 20, 34)} />
      <QMark x={1570} y={800} s={0.62} f={f} t={seg(f, 24, 38)} />
      <TagPlate x={1560} y={300} text="白黒つけない" size={50} t={seg(f, 26, 40)} color={C.beni} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #94 さらにさかのぼると、こんな決まりもありました。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S94: React.FC<{ f: number }> = ({ f }) => {
  // 年表が右から左へ巻き戻り、1682 の目印で止まる
  const back = easeOut(clamp01(seg(f, 2, 32)));
  const shift = lerp(-520, 0, back);
  return (
    <Frame f={f} seed={993} bg="#C3B291">
      <Emaki f={f} y={300} h={420} id="ib5em94" />
      <g transform={`translate(${shift} 0)`}>
        {/* 年表の軸 */}
        <line x1={170} y1={520} x2={1900} y2={520} stroke={C.sumi} strokeWidth={8} />
        {[
          { x: 420, y: "1682" },
          { x: 820, y: "1757" },
          { x: 1240, y: "1800" },
          { x: 1660, y: "1850" },
        ].map((m, i) => (
          <g key={i}>
            <line x1={m.x} y1={500} x2={m.x} y2={560} stroke={C.sumi} strokeWidth={6} />
            <text x={m.x} y={612} fill={C.sumi} fontSize={i === 0 ? 50 : 34} fontFamily={FONT} fontWeight={i === 0 ? 900 : 700} textAnchor="middle">
              {m.y}
            </text>
          </g>
        ))}
        {/* 1682 の目印 */}
        <g opacity={clamp01(seg(f, 20, 34))}>
          <circle cx={420} cy={520} r={44} fill="none" stroke={C.beni} strokeWidth={10} />
          <circle cx={420} cy={520} r={16} fill={C.beni} />
        </g>
      </g>
      {/* 逆回転の矢印 */}
      <g opacity={clamp01(seg(f, 6, 22))}>
        <path
          d="M 1180 380 C 1000 300 720 300 540 380"
          stroke={C.nokon}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <Arrow x={520} y={382} s={0.9} rot={168} t={seg(f, 10, 24)} color={C.nokon} />
      </g>
      <TagPlate x={1430} y={760} text="1682年へ" size={52} t={seg(f, 26, 40)} color={C.beni} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #95 1682年、江戸幕府は「天下一」を名乗ることを禁止します。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
// ★#95/#96/#97 で使い回す「職人町の軒先」の床
const Nokisaki: React.FC<{ f: number; gid: string }> = ({ f, gid }) => (
  <g>
    <EdoSky f={f} gid={gid} warm />
    {/* 軒 (庇) */}
    <path d="M 0 120 L 1920 60 L 1920 200 L 0 260 Z" fill={C.roof} stroke={C.ink} strokeWidth={5} />
    {Array.from({ length: 14 }).map((_, i) => (
      <line key={i} x1={i * 140} y1={122 - i * 4} x2={i * 140} y2={258 - i * 4} stroke={C.roofDark} strokeWidth={4} opacity={0.5} />
    ))}
    <path d="M 0 236 L 1920 176 L 1920 206 L 0 266 Z" fill={C.roofDark} />
    {/* 土壁 */}
    <rect x={0} y={250} width={W} height={510} fill={C.wall} />
    {Array.from({ length: 34 }).map((_, i) => (
      <ellipse key={i} cx={((i * 139) % 19) * 101 + 30} cy={296 + ((i * 71) % 5) * 94} rx={28} ry={14} fill={C.wallDark} opacity={0.15} />
    ))}
    {/* 貫 (横木) */}
    <rect x={0} y={556} width={W} height={18} fill={C.woodDark} opacity={0.35} />
    {/* 柱 */}
    {[120, 700, 1280, 1850].map((px) => (
      <g key={px}>
        <rect x={px - 26} y={180} width={52} height={620} fill={C.wood} stroke={C.ink} strokeWidth={4} />
        <rect x={px - 26} y={180} width={12} height={620} fill="#B08856" opacity={0.6} />
      </g>
    ))}
    {/* 軒下の影 */}
    <rect x={0} y={250} width={W} height={110} fill="#6B5F4A" opacity={0.22} />
    {/* 板の縁側と地面 */}
    <rect x={0} y={760} width={W} height={42} fill={C.wood} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: 13 }).map((_, i) => (
      <line key={i} x1={i * 150} y1={762} x2={i * 150} y2={800} stroke={C.woodDark} strokeWidth={3} opacity={0.45} />
    ))}
    <EdoGround f={f} y={800} stone={false} />
  </g>
);

const S95: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(clamp01(seg(f, 10, 38)));
  return (
    <Frame f={f} seed={994} bg={C.skyWarm}>
      <Nokisaki f={f} gid="ib5sky95" />
      {/* 高札場に御触書 (事実のみ。動機は描かない) */}
      <g transform="translate(330 810)">
        <rect x={-14} y={-320} width={28} height={320} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <rect x={-150} y={-540} width={300} height={230} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={6} />
        <path d="M -176 -540 L 176 -540 L 140 -600 L -140 -600 Z" fill={C.roof} stroke={C.ink} strokeWidth={5} />
        <rect x={-126} y={-516} width={252} height={182} fill={C.washi} stroke={C.washiEdge} strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-108} y={-496 + i * 28} width={216 - (i % 2) * 48} height={9} rx={3} fill={C.sumi} opacity={0.55} />
        ))}
      </g>
      {/* 縄 (看板 → 軒の金具 → 職人の手) */}
      <g stroke={C.woodDark} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d={`M 1055 ${311 + drop * 186} L 1058 311`} />
        <path d={`M 1176 ${311 + drop * 209} L 1182 311`} />
        <path d={`M 1182 311 Q 1300 ${330 + drop * 60} 1441 566`} />
      </g>
      {/* 職人が「天下一」の看板を縄で下ろす */}
      <Kanban x={1120} y={300} s={1.1} f={f} drop={drop} />
      <EdoPerson x={1370} y={812} s={1.06} f={f} pose="raise" face="normal" cloth="#6E8C62" clothDark="#55704C" gaze={[-3, -2]} kind="shokunin" v={1} />
      {/* 見上げる町人 */}
      <EdoPerson x={700} y={1000} s={1.04} f={f} pose="stand" face="surprised" cloth={C.nokon} clothDark="#2C3A4E" gaze={[2, -3]} kind="chonin" v={2} />
      <EdoPersonMini x={1700} y={1000} s={0.84} color={C.beni} f={f} phase={2} face="dot" arms="down" v={3} />
      <TagPlate x={1640} y={500} text="1682年" size={54} t={seg(f, 24, 38)} color={C.beni} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #96 それまで優れた職人は「天下一」の看板を掲げられたのですが、名乗る人が増えすぎたのです。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S96: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={995} bg={C.skyWarm}>
    <Nokisaki f={f} gid="ib5sky96" />
    {/* 同じ軒先を引きで。「天下一」看板が軒に7枚も並ぶ。どれも同じ字 */}
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i} opacity={clamp01(seg(f, 2 + i * 4, 14 + i * 4))}>
        <Kanban x={170 + i * 266} y={296} s={0.66} f={f} drop={0} />
      </g>
    ))}
    <EdoPerson x={960} y={1004} s={1.04} f={f} pose="armsFolded" face="worried" cloth="#8D6A44" clothDark="#6E4F2C" gaze={[0, -3]} kind="shokunin" v={4} />
    <TagPlate x={1560} y={660} text="ふえすぎた" size={50} t={seg(f, 30, 42)} color={C.beni} />
  </Frame>
);

// ------------------------------------------------------------------
// #97 以後の江戸で、「天下一」の看板は掲げられなくなりました。
// 格: 並 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S97: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={996} bg={C.skyWarm}>
    <Nokisaki f={f} gid="ib5sky97" />
    {/* 看板が外れ、掛け金具と日焼けの跡だけ */}
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i}>
        <Kanban x={170 + i * 266} y={296} s={0.66} f={f} hookOnly />
      </g>
    ))}
    {/* 空の金具に残った縄の切れ端が風に鳴る */}
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={`r${i}`}>
        {[-37, 37].map((px) => {
          const cx = 170 + i * 266 + px;
          return (
            <g key={px} transform={`rotate(${Math.sin((f + i * 9) / 11) * 9} ${cx} 302)`}>
              <path d={`M ${cx} 302 q 5 24 -4 44`} stroke="#9A8A6C" strokeWidth={5} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </g>
    ))}
    {/* 風の線 */}
    {[0, 1, 2].map((i) => {
      const px = ((f * 7 + i * 220) % 2200) - 180;
      return <path key={i} d={`M ${px} ${420 + i * 60} q 80 -16 160 0`} stroke="#9AA0A6" strokeWidth={4} fill="none" opacity={0.35} />;
    })}
    <EdoPersonMini x={1680} y={1000} s={0.86} color="#7E868E" f={f} phase={3} face="dot" arms="down" v={5} />
    <TagPlate x={990} y={482} text="金具だけ残る" size={48} t={seg(f, 20, 36)} />
  </Frame>
);

// ------------------------------------------------------------------
// #98 序列は、とことん楽しむ。でも「ただ一人の1位」は決めない。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S98: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={997} bg={C.wall}>
    <EdoWall f={f} />
    <EdoGround f={f} y={880} />
    <Tenbin x={960} y={880} s={1.0} f={f} phase={1} />
    <XMark x={1450} y={450} s={1.0} t={seg(f, 20, 34)} color={C.beni} />
    <TagPlate x={400} y={700} text="楽しむ" size={52} t={seg(f, 16, 30)} />
    <TagPlate x={1520} y={700} text="決めない" size={52} t={seg(f, 24, 38)} color={C.beni} />
  </Frame>
);

// ------------------------------------------------------------------
// #99 江戸の順位文化は、そういう絶妙なバランスの上にありました。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S99: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={998} bg={C.wall}>
    <EdoWall f={f} />
    <EdoGround f={f} y={880} />
    {/* #98 の続き。皿が水平で止まる */}
    <Tenbin x={960} y={880} s={1.0} f={f} phase={2} />
    {/* 支点に「絶妙」の印 */}
    <g opacity={clamp01(seg(f, 14, 30))} transform="translate(960 550)">
      <circle cx={0} cy={0} r={46} fill="none" stroke={C.beni} strokeWidth={9} />
      <circle cx={0} cy={0} r={46} fill={C.beni} opacity={0.12} />
    </g>
    {/* ゆらぎが収まる線 */}
    <g opacity={clamp01(seg(f, 8, 26))}>
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M ${520 + i * 740} ${470} q 60 ${-18 + i * 36} 120 0`}
          stroke="#9AA0A6"
          strokeWidth={4}
          fill="none"
          opacity={0.4 * (1 - clamp01(seg(f, 20, 36)))}
        />
      ))}
    </g>
    <TagPlate x={1440} y={760} text="絶妙なバランス" size={50} t={seg(f, 24, 40)} />
  </Frame>
);

// ------------------------------------------------------------------
// #100 この国に「優勝」が生まれるには、黒船よりあとの、ある発明を待つ必要があります。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
const S100: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(clamp01(seg(f, 2, 30)));
  return (
    <Frame f={f} seed={999} bg="#C3B291">
      <Emaki f={f} y={300} h={420} id="ib5em100" />
      {/* 江戸の区間が長く伸びる */}
      <line x1={170} y1={520} x2={1900} y2={520} stroke={C.sumi} strokeWidth={8} />
      <rect x={210} y={494} width={1020 * grow} height={52} rx={10} fill={C.nokon} opacity={0.42} />
      <text x={220} y={448} fill={C.sumi} fontSize={44} fontFamily={FONT} fontWeight={900}>
        江戸
      </text>
      {[210, 1230].map((px) => (
        <line key={px} x1={px} y1={474} x2={px} y2={566} stroke={C.sumi} strokeWidth={6} />
      ))}
      {/* 右端に黒船のシルエット */}
      <g opacity={clamp01(seg(f, 18, 34))} transform="translate(1420 520)">
        <path d="M -130 0 L 130 0 L 100 56 L -100 56 Z" fill="#4A4F57" stroke={C.ink} strokeWidth={4} />
        <rect x={-18} y={-110} width={36} height={110} fill="#3C4149" stroke={C.ink} strokeWidth={3} />
        <rect x={-94} y={-56} width={40} height={56} fill="#565C65" stroke={C.ink} strokeWidth={3} />
        <rect x={50} y={-70} width={34} height={70} fill="#565C65" stroke={C.ink} strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-20 + i * 24} cy={-124 - i * 20} r={13 + i * 5} fill="#7E868E" opacity={0.5} />
        ))}
      </g>
      {/* その先に伏せた札 (中身は見せない) */}
      <g opacity={clamp01(seg(f, 26, 40))} transform={`translate(1710 540) rotate(${-7 + Math.sin(f / 20) * 1.4})`}>
        <rect x={-74} y={-54} width={148} height={108} rx={8} fill="#8D7A58" opacity={0.25} />
        <rect x={-80} y={-60} width={148} height={108} rx={8} fill={C.washiEdge} stroke={C.ink} strokeWidth={5} />
        <rect x={-66} y={-46} width={120} height={80} rx={5} fill="#C8B994" />
      </g>
      <TagPlate x={740} y={740} text="黒船よりあと" size={50} t={seg(f, 30, 42)} color={C.beni} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #101 その前に、世界のほうで大事件が起きます。
// 格: 図 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
// ★地図は IchiB5WorldMap.tsx (海岸線を緯度経度から起こした世界地図) に出した。
//   切り取り範囲は 経度20°W〜150°E / 緯度72°N〜12°S。ヨーロッパが左3分の1に大きく載り、
//   右端に日本が来る。南北アメリカはこの話に出てこないので切ってある。
//   「どこからどこへ」= 江戸 (紺の旗) → アテネ (紅の旗・星)。弧が f で伸びる。
const S101: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1000} bg="#B9A581">
    <IchiB5WorldMap f={f} />
    <TagPlate x={1070} y={768} text="世界のほうで大事件" size={46} t={seg(f, 28, 42)} color={C.beni} />
  </Frame>
);

// ------------------------------------------------------------------
// #102 「2位」が、発明されるのです。
// 格: 山 — 設計書 docs/briefs/IchiB5.md の表のとおり
// ------------------------------------------------------------------
// ★作り直し方針: 3案のうち「『1』しかなかった台の隣に『2』の段が新しく付け足される」を採った。
//   この動画の本題そのもの (1位は昔からいた/発明されたのは2位) を1枚で言い切れるのはこれだけ。
//   そこへ「発明品の図面」案の寸法線・刻印を重ねて "作られた物" だと分かるようにしてある。
//   章の締めなので明るい昼の工房にして、暗がりの演出と全面の覆いはやめた。
const S102: React.FC<{ f: number }> = ({ f }) => {
  // カメラがゆっくり寄る (台座の継ぎ目あたりが中心)
  const cam = 1.06 - 0.06 * easeOut(clamp01(seg(f, 0, 30)));
  // 新しい「2」の段が吊り下ろされて、はまる
  const drop = easeOut(clamp01(seg(f, 5, 28)));
  const dy = -520 * (1 - drop);
  const landed = clamp01(seg(f, 28, 34)); // はまった
  const shake = f > 28 ? Math.sin((f - 28) * 1.5) * 7 * (1 - clamp01(seg(f, 28, 40))) : 0;
  const dust = clamp01(seg(f, 28, 42));
  const rope = 1 - clamp01(seg(f, 28, 38)); // 縄はゆるんで外れる
  const dim = clamp01(seg(f, 31, 42)); // 寸法線が入る
  const seal = clamp01(seg(f, 34, 42)); // 刻印が押される

  const FLOOR = 862;
  const B1 = { x: 660, w: 350, top: 440 }; // もとからある「1」の段
  const B2 = { x: 1010, w: 350, top: 600 }; // 新しく付け足す「2」の段

  return (
    <Frame f={f} seed={1001} bg={C.skyWarm}>
      <g transform={`translate(${W / 2 * (1 - cam)} ${700 * (1 - cam)}) scale(${cam})`}>
        {/* ── 工房の壁 (第16条の床) ── */}
        <rect x={0} y={0} width={W} height={H} fill="#E3D8BE" />
        {/* 漆喰のむら */}
        {Array.from({ length: 22 }).map((_, i) => (
          <ellipse key={i} cx={((i * 157) % 19) * 101 + 40} cy={70 + ((i * 83) % 8) * 98}
            rx={78} ry={30} fill="#D5C8A8" opacity={0.45} />
        ))}
        {/* 貫・柱 */}
        <rect x={0} y={232} width={W} height={26} fill={C.wood} opacity={0.75} />
        {[96, 1824].map((px) => (
          <rect key={px} x={px - 34} y={0} width={68} height={H} fill={C.wood} opacity={0.9} />
        ))}
        {/* 高窓から昼の光が差す */}
        <g>
          <rect x={150} y={120} width={330} height={250} fill="#EAF2F2" stroke={C.woodDark} strokeWidth={8} />
          {[0, 1].map((i) => (
            <line key={i} x1={150 + 110 * (i + 1)} y1={120} x2={150 + 110 * (i + 1)} y2={370}
              stroke={C.woodDark} strokeWidth={7} />
          ))}
          <line x1={150} y1={245} x2={480} y2={245} stroke={C.woodDark} strokeWidth={7} />
          {/* 光の帯 */}
          <path d="M 180 370 L 470 370 L 1010 862 L 430 862 Z" fill="#FFF6D8" opacity={0.3} />
        </g>
        {/* 道具の棚 (部品の作り込み) */}
        <g transform="translate(1540 300)">
          <rect x={-170} y={0} width={340} height={16} fill={C.wood} stroke={C.woodDark} strokeWidth={4} />
          {/* 鋸 */}
          <g transform="translate(-110 -96)">
            <rect x={-10} y={40} width={20} height={56} rx={6} fill={C.woodDark} />
            <path d="M -8 40 L -8 -52 L 46 -52 L 46 40 Z" fill="#CFD6DC" stroke={C.ink} strokeWidth={3.5} />
            {Array.from({ length: 9 }).map((_, i) => (
              <path key={i} d={`M 46 ${-50 + i * 10} l 8 5 l -8 5`} fill="#CFD6DC" stroke={C.ink} strokeWidth={2.5} />
            ))}
          </g>
          {/* 曲尺 */}
          <g transform="translate(20 -70)">
            <path d="M 0 70 L 0 -60 L 16 -60 L 16 54 L 110 54 L 110 70 Z"
              fill="#D9B23C" stroke={C.ink} strokeWidth={3.5} />
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={i} x1={2} y1={-48 + i * 16} x2={12} y2={-48 + i * 16} stroke={C.ink} strokeWidth={2} />
            ))}
          </g>
        </g>
        {/* ── 板の床 ── */}
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#BE9A66" />
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={0} y1={FLOOR + 6 + i * 40} x2={W} y2={FLOOR + 6 + i * 40}
            stroke={C.woodDark} strokeWidth={4} opacity={0.45} />
        ))}
        {/* 削り屑 (新しく何かを作った跡)。字幕帯にかからない床の上寄りに置く */}
        <g stroke={C.woodDark} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round">
          {[[250, 884], [400, 906], [1500, 882], [1650, 908], [520, 924]].map(([px, py], i) => (
            <path key={i} d={`M ${px} ${py} q 22 -16 44 0 q 22 16 44 0`} />
          ))}
        </g>

        {/* ── 台座 ── */}
        <g transform={`translate(${shake} 0)`}>
          {/* 土台 */}
          <rect x={590} y={FLOOR} width={850} height={52} rx={6}
            fill={C.wood} stroke={C.ink} strokeWidth={6} />
          <rect x={590} y={FLOOR} width={850} height={14} fill="#C9A570" />

          {/* もとからある「1」の段 (古びた石。昔からここにあった) */}
          <g>
            <rect x={B1.x} y={B1.top} width={B1.w} height={FLOOR - B1.top}
              fill="#CFC6B2" stroke={C.ink} strokeWidth={7} />
            {/* 天板の面 */}
            <path d={`M ${B1.x} ${B1.top} L ${B1.x + 38} ${B1.top - 26} L ${B1.x + B1.w + 38} ${B1.top - 26} L ${B1.x + B1.w} ${B1.top} Z`}
              fill="#E0D8C6" stroke={C.ink} strokeWidth={6} />
            {/* 古い石の継ぎ目と欠け */}
            <g stroke={C.ink} strokeWidth={3} opacity={0.3} fill="none">
              <line x1={B1.x} y1={B1.top + 130} x2={B1.x + B1.w} y2={B1.top + 126} />
              <line x1={B1.x} y1={B1.top + 268} x2={B1.x + B1.w} y2={B1.top + 272} />
              <path d={`M ${B1.x + 120} ${B1.top + 130} L ${B1.x + 116} ${B1.top + 268}`} />
              <path d={`M ${B1.x + 240} ${B1.top + 130} L ${B1.x + 248} ${B1.top + 268}`} />
            </g>
            <text x={B1.x + B1.w / 2} y={B1.top + 262} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={300} fill={C.sumi} opacity={0.82}>1</text>
          </g>

          {/* 新しく付け足される「2」の段 (白木。まだ削りたて) */}
          <g transform={`translate(0 ${dy})`}>
            <rect x={B2.x} y={B2.top} width={B2.w} height={FLOOR - B2.top + 40}
              fill="#EBD9AE" stroke={C.ink} strokeWidth={7} />
            <path d={`M ${B2.x} ${B2.top} L ${B2.x + 38} ${B2.top - 26} L ${B2.x + B2.w + 38} ${B2.top - 26} L ${B2.x + B2.w} ${B2.top} Z`}
              fill="#F6EACB" stroke={C.ink} strokeWidth={6} />
            {/* 白木の木目 */}
            <g stroke="#C9A570" strokeWidth={3} fill="none" opacity={0.65}>
              {[0, 1, 2, 3].map((i) => (
                <path key={i}
                  d={`M ${B2.x + 8} ${B2.top + 42 + i * 56} C ${B2.x + 120} ${B2.top + 30 + i * 56} ${B2.x + 240} ${B2.top + 56 + i * 56} ${B2.x + B2.w - 8} ${B2.top + 40 + i * 56}`} />
              ))}
            </g>
            {/* 木釘 (組み立てた物だと分かる) */}
            <g fill={C.woodDark} opacity={0.8}>
              {[[B2.x + 26, B2.top + 26], [B2.x + B2.w - 26, B2.top + 26],
                [B2.x + 26, FLOOR - 26], [B2.x + B2.w - 26, FLOOR - 26]].map(([px, py], i) => (
                <circle key={i} cx={px} cy={py} r={9} />
              ))}
            </g>
            <text x={B2.x + B2.w / 2} y={B2.top + 196} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={230} fill={C.beni}>2</text>
            {/* 吊り縄と鉤 */}
            <g opacity={rope} stroke={C.woodDark} strokeWidth={7} fill="none" strokeLinecap="round">
              <path d={`M ${B2.x + 60} ${B2.top - 20} L ${B2.x + 84} ${-240 - dy}`} />
              <path d={`M ${B2.x + B2.w - 20} ${B2.top - 24} L ${B2.x + B2.w - 50} ${-240 - dy}`} />
            </g>
            {/* 刻印 (発明品に押される印) */}
            <g opacity={seal} transform={`translate(${B2.x + 56} ${B2.top + 58}) scale(${pop(seal)})`}>
              <circle cx={0} cy={0} r={40} fill="none" stroke={C.beni} strokeWidth={8} opacity={0.9} />
              <text x={0} y={17} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={46} fill={C.beni} opacity={0.9}>2</text>
            </g>
          </g>

          {/* 継ぎ目が合った衝撃 (事件) */}
          <g opacity={landed}>
            {/* 土煙 */}
            <g fill="#D8C8A6" opacity={(1 - dust) * 0.8}>
              {[0, 1, 2, 3, 4].map((i) => {
                const sp = 1 + dust * 2.2;
                return (
                  <circle key={i}
                    cx={B2.x + 40 + i * 70 + (i - 2) * dust * 46}
                    cy={FLOOR - 10 - dust * (30 + i * 9)}
                    r={(16 + i * 5) * sp} />
                );
              })}
            </g>
            {/* 衝撃線 */}
            <g stroke={C.beni} strokeWidth={6} strokeLinecap="round" opacity={(1 - dust) * 0.9}>
              {[-52, -24, 24, 52].map((a, i) => (
                <line key={i}
                  x1={B2.x + B2.w / 2 + a * 1.4} y1={B2.top - 46}
                  x2={B2.x + B2.w / 2 + a * 2.4} y2={B2.top - 46 - 54 - dust * 30} />
              ))}
            </g>
          </g>

          {/* 寸法線 (発明品の図面として測られる) */}
          <g opacity={dim} stroke={C.nokon} strokeWidth={4} fill="none">
            {/* 高さ */}
            <line x1={B2.x + B2.w + 56} y1={B2.top} x2={B2.x + B2.w + 56} y2={FLOOR} />
            <path d={`M ${B2.x + B2.w + 56} ${B2.top} l -11 20 l 22 0 Z`} fill={C.nokon} />
            <path d={`M ${B2.x + B2.w + 56} ${FLOOR} l -11 -20 l 22 0 Z`} fill={C.nokon} />
            <line x1={B2.x + B2.w + 10} y1={B2.top} x2={B2.x + B2.w + 86} y2={B2.top} strokeWidth={3} />
            <line x1={B2.x + B2.w + 10} y1={FLOOR} x2={B2.x + B2.w + 86} y2={FLOOR} strokeWidth={3} />
            {/* 幅 */}
            <line x1={B2.x} y1={B2.top - 76} x2={B2.x + B2.w} y2={B2.top - 76} />
            <path d={`M ${B2.x} ${B2.top - 76} l 20 -11 l 0 22 Z`} fill={C.nokon} />
            <path d={`M ${B2.x + B2.w} ${B2.top - 76} l -20 -11 l 0 22 Z`} fill={C.nokon} />
            <line x1={B2.x} y1={B2.top - 100} x2={B2.x} y2={B2.top - 52} strokeWidth={3} />
            <line x1={B2.x + B2.w} y1={B2.top - 100} x2={B2.x + B2.w} y2={B2.top - 52} strokeWidth={3} />
            {/* 「1」との段差 (ここが新しい) */}
            <g strokeDasharray="14 10" opacity={0.85}>
              <line x1={B1.x} y1={B1.top} x2={B2.x + B2.w + 96} y2={B1.top} />
            </g>
          </g>
        </g>

        {/* 設計図 (今度は表を向けて壁に貼ってある。窓の光が当たる位置) */}
        <g transform={`translate(420 620) rotate(${-3 + Math.sin(f / 24) * 0.7})`}>
          <rect x={-162} y={-56} width={336} height={124} rx={6} fill="#8D7A58" opacity={0.22} />
          <rect x={-168} y={-62} width={336} height={124} rx={6} fill={C.washi}
            stroke={C.washiEdge} strokeWidth={5} />
          {/* 図面の中の「1」と「2」の段 (この絵の設計図そのもの) */}
          <g stroke={C.nokon} strokeWidth={5} fill="none">
            <path d="M -116 36 L -116 -30 L -16 -30 L -16 2 L 94 2 L 94 36 Z" />
            <g strokeDasharray="8 7" strokeWidth={3} opacity={0.8}>
              <line x1={-16} y1={-30} x2={116} y2={-30} />
              <line x1={-140} y1={36} x2={124} y2={36} />
            </g>
          </g>
          {/* 画鋲 */}
          <g fill={C.beni}>
            <circle cx={-150} cy={-44} r={8} />
            <circle cx={156} cy={-44} r={8} />
          </g>
        </g>

        {/* ── 人が反応する ── */}
        {/* 組み付けた職人が、できた段を指す */}
        <Person x={1640} y={952} s={1.2} f={f} pose="point" pointDir={-1} face="joy"
          cloth="#6E8C62" clothDark="#4E6945" tasuki="#E8DCBE" />
        {/* 見上げている弟子 */}
        <PersonMini x={300} y={930} s={1.15} color={C.nokon} f={f} phase={3} face="dot" arms="up" />
      </g>
      <TagPlate x={1560} y={462} text="新しい段" size={50} t={seg(f, 30, 42)} color={C.beni} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib5_s078:                  (f) => <S78 f={f} />,
  ib5_s079:                  (f) => <S79 f={f} />,
  ib5_s080:                  (f) => <S80 f={f} />,
  ib5_s081:                  (f) => <S81 f={f} />,
  ib5_s082:                  (f) => <S82 f={f} />,
  ib5_s083:                  (f) => <S83 f={f} />,
  ib5_s084:                  (f) => <S84 f={f} />,
  ib5_s085:                  (f) => <S85 f={f} />,
  ib5_s086:                  (f) => <S86 f={f} />,
  ib5_s087:                  (f) => <S87 f={f} />,
  ib5_s088:                  (f) => <S88 f={f} />,
  ib5_s089:                  (f) => <S89 f={f} />,
  ib5_s090:                  (f) => <S90 f={f} />,
  ib5_s091:                  (f) => <S91 f={f} />,
  ib5_s092:                  (f) => <S92 f={f} />,
  ib5_s093:                  (f) => <S93 f={f} />,
  ib5_s094:                  (f) => <S94 f={f} />,
  ib5_s095:                  (f) => <S95 f={f} />,
  ib5_s096:                  (f) => <S96 f={f} />,
  ib5_s097:                  (f) => <S97 f={f} />,
  ib5_s098:                  (f) => <S98 f={f} />,
  ib5_s099:                  (f) => <S99 f={f} />,
  ib5_s100:                  (f) => <S100 f={f} />,
  ib5_s101:                  (f) => <S101 f={f} />,
  ib5_s102:                  (f) => <S102 f={f} />,
};

export const I_B5_MOTIFS: string[] = [
  "ib5_s078",                  // #78 第5章、番付はあれど、優勝はなし。
  "ib5_s079",                  // #79 江戸時代の日本は、実はランキングが大好きでした。
  "ib5_s080",                  // #80 まず、相撲の番付。いまに続く縦一枚の形は、1757年からです。
  "ib5_s081",                  // #81 強い力士ほど上に、太く大きな文字で書かれます。
  "ib5_s082",                  // #82 下にいくほど文字は小さくなり、いちばん下は虫眼鏡がほしいサイズ。
  "ib5_s083",                  // #83 字の大きさで序列を見せる、恐ろしく直感的なデザインです。
  "ib5_s084",                  // #84 そして江戸の人々は、これを相撲だけにしておきませんでした。
  "ib5_s085",                  // #85 「見立番付」といって、何でも番付にしたのです。
  "ib5_s086",                  // #86 温泉の番付。
  "ib5_s087",                  // #87 名物料理の番付。
  "ib5_s088",                  // #88 お金持ちの番付まであります。
  "ib5_s089",                  // #89 ランキングを「娯楽」として楽しむ発明は、江戸で完成していました。
  "ib5_s090",                  // #90 ところが、です。
  "ib5_s091",                  // #91 その江戸の相撲に、「今場所の優勝者」という概念はありませんでした。
  "ib5_s092",                  // #92 あるのは番付の上がり下がりと、日々の勝ち星だけ。
  "ib5_s093",                  // #93 しかも取組には、引き分けや預かりといった、白黒つけない結末が普通にあったとされます。
  "ib5_s094",                  // #94 さらにさかのぼると、こんな決まりもありました。
  "ib5_s095",                  // #95 1682年、江戸幕府は「天下一」を名乗ることを禁止します。
  "ib5_s096",                  // #96 それまで優れた職人は「天下一」の看板を掲げられたのですが、名乗る人が増えすぎたのです。
  "ib5_s097",                  // #97 以後の江戸で、「天下一」の看板は掲げられなくなりました。
  "ib5_s098",                  // #98 序列は、とことん楽しむ。でも「ただ一人の1位」は決めない。
  "ib5_s099",                  // #99 江戸の順位文化は、そういう絶妙なバランスの上にありました。
  "ib5_s100",                  // #100 この国に「優勝」が生まれるには、黒船よりあとの、ある発明を待つ必要があります。
  "ib5_s101",                  // #101 その前に、世界のほうで大事件が起きます。
  "ib5_s102",                  // #102 「2位」が、発明されるのです。
];

export const ichiB5Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B5_PREVIEW_FRAMES = Math.max(I_B5_MOTIFS.length, 1);
export const IchiB5Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B5_MOTIFS.length - 1);
  return <>{ichiB5Scene(I_B5_MOTIFS[i] ?? "", 45)}</>;
};
