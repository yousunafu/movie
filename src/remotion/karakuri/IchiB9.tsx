// 「『2位』は、120年前に発明された」: 第9章「なぜ順位はこんなに刺さるのか。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#163〜#187 (25文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで25枚。
// motif 名は必ず ib9_ で始める。WobbleDefs の seed はこのファイルでは 1062〜1086 を使う。
// 設計書: docs/briefs/IchiB9.md (1文ごとの「格」と絵の中身を決めてから描く)
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

// ===================================================================
// このファイルだけで使う色
// ===================================================================
const C = {
  ink: "#3A3A34",
  // 夜の研究室
  labWall: "#3E4650",
  labWallDark: "#333A43",
  labDesk: "#8A6540",
  labDeskDark: "#6E5033",
  lampGlow: "#F6DE9A",
  lampShade: "#C9873A",
  // 紙・ノート
  washi: "#F2EBD8",
  washiDark: "#E2D8BE",
  rule: "#9FB0C0",
  bind: "#8A6A4A",
  // 鶏舎
  coopEarth: "#B49268",
  coopEarthDark: "#99784F",
  straw: "#D9BE78",
  perch: "#8A6A46",
  mesh: "#8E9AA4",
  coopWall: "#6E5A42",
  morning: "#F7E6B8",
  // ニワトリ
  hen: "#EFE6D4",
  henDark: "#D8C9AE",
  comb: "#CC5540",
  beak: "#E0A747",
  // 実験室
  labRoom: "#C9CBBF",
  cageBar: "#9AA3AA",
  cageFloor: "#A89878",
  // 村はずれ
  sky: "#CFE0E6",
  grass: "#8FA868",
  grassDark: "#71884F",
  stone: "#B5AFA2",
  stoneDark: "#948E82",
  water: "#7FA8C4",
  frog: "#7FA55C",
  frogDark: "#5F8441",
  // 校庭
  yardDirt: "#D2B98C",
  yardDirtDark: "#BBA074",
  school: "#CFC7B4",
  schoolDark: "#ADA392",
  tree: "#7FA860",
  evening: "#F0CE9B",
  // しるし
  vermil: "#CC4A2E",
  skin: "#EFD9BE",
  indigo: "#3E5B82",
  steel: "#B6BCC2",
  brass: "#D2A93F",
  brassDark: "#A8832B",
};
const MONKEY = "#9A7F5E";
const MONKEY_DARK = "#7A6245";

void Stamp; void XMark; void zoomAt; void W;

// ===================================================================
// この章で何度も出る舞台の部品
// ===================================================================

// --- 夜の研究室 (観察机・標本棚・ランプ・窓) ---
const NightLab: React.FC<{ f: number; floorY?: number }> = ({ f, floorY = 646 }) => {
  const flick = 0.9 + Math.sin(f / 7) * 0.06;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={floorY} fill={C.labWall} />
      <rect x={0} y={floorY} width={1920} height={1080 - floorY} fill={C.labDesk} />
      <rect x={0} y={floorY - 10} width={1920} height={14} fill={C.labDeskDark} />
      {/* 板目 */}
      <g stroke={C.labDeskDark} strokeWidth={4} opacity={0.5}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={0} y1={floorY + 54 + i * 86} x2={1920} y2={floorY + 48 + i * 86} />
        ))}
      </g>
      {/* 窓 (外は鶏舎の屋根) */}
      <g transform="translate(1486 92)">
        <rect x={0} y={0} width={360} height={286} rx={8} fill="#28313C" stroke={KRP.ink} strokeWidth={8} />
        <g opacity={0.9}>
          {[[52, 58], [128, 96], [246, 64], [300, 140], [180, 44], [92, 176], [268, 206]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 4 : 2.6} fill="#F4EEDC" opacity={0.85} />
          ))}
        </g>
        {/* 鶏舎の屋根 */}
        <path d="M 24 286 L 24 236 L 132 196 L 240 236 L 240 286 Z" fill="#45505C" stroke={KRP.ink} strokeWidth={5} />
        <line x1={0} y1={143} x2={360} y2={143} stroke={KRP.ink} strokeWidth={6} />
        <line x1={180} y1={0} x2={180} y2={286} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 標本棚 */}
      <g transform="translate(70 196)">
        <rect x={0} y={0} width={330} height={450} rx={8} fill={C.labWallDark} stroke={KRP.ink} strokeWidth={8} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <line x1={0} y1={112 + r * 112} x2={330} y2={112 + r * 112} stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={26 + k * 72} y={44 + r * 112} width={48} height={66} rx={5}
                fill={C.washiDark} stroke={KRP.ink} strokeWidth={4} opacity={0.72} />
            ))}
          </g>
        ))}
      </g>
      {/* ランプ */}
      <g transform="translate(372 646)" opacity={flick}>
        <ellipse cx={0} cy={0} rx={62} ry={14} fill={C.labDeskDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-8} y={-128} width={16} height={128} fill={C.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -62 -128 L 62 -128 L 40 -196 L -40 -196 Z" fill={C.lampShade} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-128} rx={52} ry={13} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* ランプの光の輪 */}
      <ellipse cx={372} cy={646} rx={520} ry={150} fill={C.lampGlow} opacity={0.14 * flick} />
      <ellipse cx={372} cy={646} rx={300} ry={92} fill={C.lampGlow} opacity={0.12 * flick} />
    </g>
  );
};

// --- 観察ノートの見開き (紙の罫線。方眼はこの紙にだけ clip) ---
const NoteSpread: React.FC<{
  id: string; x?: number; y?: number; w?: number; h?: number;
  grid?: boolean; rule?: boolean; children?: React.ReactNode;
}> = ({ id, x = 150, y = 172, w = 1620, h = 660, grid = false, rule = true, children }) => (
  <g>
    {/* 机 */}
    <rect x={0} y={0} width={1920} height={1080} fill={C.labDesk} />
    <g stroke={C.labDeskDark} strokeWidth={5} opacity={0.45}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={0} y1={64 + i * 184} x2={1920} y2={56 + i * 184} />
      ))}
    </g>
    <ellipse cx={960} cy={y + h / 2} rx={w * 0.56} ry={h * 0.62} fill={C.lampGlow} opacity={0.1} />
    {/* 紙 */}
    <g>
      <rect x={x + 10} y={y + 14} width={w} height={h} rx={6} fill={KRP.ink} opacity={0.16} />
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={8} />
      <clipPath id={`clip${id}`}>
        <rect x={x} y={y} width={w} height={h} rx={6} />
      </clipPath>
      <g clipPath={`url(#clip${id})`}>
        {grid && <GridPaper tombo={false} pitch={54} opacity={0.14} />}
        {rule && (
          <g stroke={C.rule} strokeWidth={3} opacity={0.5}>
            {Array.from({ length: Math.floor(h / 56) }, (_, i) => (
              <line key={i} x1={x + 34} y1={y + 54 + i * 56} x2={x + w - 34} y2={y + 54 + i * 56} />
            ))}
          </g>
        )}
        {/* とじ目 */}
        <rect x={x + w / 2 - 7} y={y} width={14} height={h} fill={C.washiDark} opacity={0.85} />
        <g stroke={C.bind} strokeWidth={6} opacity={0.8}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={x + w / 2} y1={y + 70 + i * (h - 140) / 3} x2={x + w / 2} y2={y + 112 + i * (h - 140) / 3} />
          ))}
        </g>
        {children}
      </g>
    </g>
  </g>
);

// --- ノートに添える小物 (鉛筆・クリップ・虫めがね) ---
const Pencil: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-13} width={252} height={26} rx={4} fill={C.brass} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 102 -13 L 150 0 L 102 13 Z" fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 136 -4 L 150 0 L 136 4 Z" fill={KRP.ink} />
  </g>
);
const Clip: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill="none" stroke={C.steel} strokeWidth={7}>
    <rect x={-18} y={-34} width={36} height={68} rx={16} stroke={KRP.ink} strokeWidth={5} fill={C.steel} />
    <line x1={0} y1={-18} x2={0} y2={18} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
  </g>
);
const Magnifier: React.FC<{ x: number; y: number; s?: number; rot?: number; tint?: string }> = ({
  x, y, s = 1, rot = -24, tint = "#DDEAF0",
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={54} y={-15} width={168} height={30} rx={14} fill={C.bind} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={0} cy={0} r={86} fill={tint} opacity={0.42} />
    <circle cx={0} cy={0} r={86} fill="none" stroke={C.brassDark} strokeWidth={14} />
    <circle cx={0} cy={0} r={86} fill="none" stroke={KRP.ink} strokeWidth={6} />
    <path d="M -46 -52 A 72 72 0 0 1 10 -74" stroke={KRP.white} strokeWidth={10} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);

// --- ニワトリ ---
const Hen: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1; f?: number; phase?: number;
  peck?: number; body?: string;
}> = ({ x, y, s = 1, dir = 1, f = 0, phase = 0, peck = 0, body = C.hen }) => {
  const bob = Math.sin((f + phase * 13) / 12) * 4;
  const neck = peck * 26;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${dir * s} ${s})`}>
      {/* 足 */}
      <g stroke={C.beak} strokeWidth={9} strokeLinecap="round">
        <line x1={-18} y1={0} x2={-20} y2={36} />
        <line x1={20} y1={0} x2={24} y2={36} />
        <line x1={-20} y1={36} x2={-40} y2={44} />
        <line x1={24} y1={36} x2={44} y2={44} />
      </g>
      {/* 胴 */}
      <ellipse cx={0} cy={-34} rx={74} ry={56} fill={body} stroke={KRP.ink} strokeWidth={6} />
      {/* 尾羽 */}
      <path d="M -62 -58 L -124 -112 L -110 -62 L -132 -48 L -64 -24 Z"
        fill={body} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 翼 */}
      <path d="M -24 -48 A 46 34 0 0 1 48 -40 A 40 30 0 0 1 -18 -22 Z"
        fill={C.henDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 首と頭 */}
      <g transform={`translate(${44 + neck * 0.5} ${-78 + neck})`}>
        <rect x={-16} y={-4} width={32} height={48} rx={14} fill={body} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={4} cy={-22} r={30} fill={body} stroke={KRP.ink} strokeWidth={6} />
        {/* とさか */}
        <path d="M -8 -48 q 10 -20 20 -4 q 10 -18 18 2 q 8 -10 10 6 z"
          fill={C.comb} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* くちばし */}
        <path d="M 30 -22 L 60 -14 L 30 -6 Z" fill={C.beak} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 肉垂 */}
        <path d="M 22 -2 q 8 16 -2 20 q -10 -4 -8 -20 z" fill={C.comb} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={14} cy={-28} r={5.4} fill={KRP.ink} />
      </g>
    </g>
  );
};

// --- 鶏舎 (土間・止まり木・わら・金網・朝の光) ---
const Coop: React.FC<{ f: number; groundY?: number; zoom?: boolean }> = ({ f, groundY = 700, zoom = false }) => {
  const dust = Math.sin(f / 9) * 4;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={groundY} fill={C.coopWall} />
      <rect x={0} y={groundY} width={1920} height={1080 - groundY} fill={C.coopEarth} />
      <rect x={0} y={groundY - 12} width={1920} height={16} fill={C.coopEarthDark} />
      {/* 板壁 */}
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.3}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={0} y1={76 + i * 112} x2={1920} y2={70 + i * 112} />
        ))}
      </g>
      {/* 金網の窓 + 朝の光 */}
      <g transform={`translate(${zoom ? 1240 : 1180} 108)`}>
        <rect x={0} y={0} width={480} height={330} rx={6} fill={C.morning} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={C.mesh} strokeWidth={3.4} opacity={0.75}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`a${i}`} x1={i * 40} y1={0} x2={i * 40 + 80} y2={330} />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`b${i}`} x1={i * 40} y1={330} x2={i * 40 + 80} y2={0} />
          ))}
        </g>
        <rect x={0} y={0} width={480} height={330} rx={6} fill="none" stroke={KRP.ink} strokeWidth={8} />
      </g>
      {/* 差し込む光 */}
      <path d={`M ${zoom ? 1240 : 1180} 438 L ${zoom ? 1720 : 1660} 438 L ${(zoom ? 1720 : 1660) - 420} ${groundY + 230} L ${(zoom ? 1240 : 1180) - 700} ${groundY + 230} Z`}
        fill={C.morning} opacity={0.2} />
      {/* 止まり木 */}
      <g>
        <rect x={110} y={430} width={700} height={26} rx={10} fill={C.perch} stroke={KRP.ink} strokeWidth={7} />
        <rect x={190} y={456} width={22} height={groundY - 456} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <rect x={700} y={456} width={22} height={groundY - 456} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* わら */}
      <g stroke={C.straw} strokeWidth={7} strokeLinecap="round" opacity={0.95}>
        {Array.from({ length: 34 }, (_, i) => {
          const sx = 40 + ((i * 227) % 1840);
          const sy = groundY + 24 + ((i * 97) % 280);
          const a = ((i * 53) % 180) - 90;
          return (
            <line key={i} x1={sx} y1={sy} x2={sx + Math.cos((a * Math.PI) / 180) * 52}
              y2={sy + Math.sin((a * Math.PI) / 180) * 14} />
          );
        })}
      </g>
      {/* 土ぼこり */}
      <g fill={C.coopEarthDark} opacity={0.3}>
        <ellipse cx={520} cy={groundY + 140 + dust} rx={200} ry={26} />
        <ellipse cx={1420} cy={groundY + 210 - dust} rx={240} ry={30} />
      </g>
    </g>
  );
};

// --- 実験室の机 + ケージ ---
const LabBench: React.FC<{ f: number; top?: number }> = ({ f, top = 560 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={top} fill={C.labRoom} />
    <rect x={0} y={top} width={1920} height={1080 - top} fill={C.labDesk} />
    <rect x={0} y={top - 14} width={1920} height={18} fill={C.labDeskDark} />
    <g stroke={C.labDeskDark} strokeWidth={5} opacity={0.4}>
      {[0, 1, 2].map((i) => (
        <line key={i} x1={0} y1={top + 92 + i * 128} x2={1920} y2={top + 84 + i * 128} />
      ))}
    </g>
    {/* 奥の棚 */}
    <g transform="translate(60 150)" opacity={0.92}>
      <rect x={0} y={0} width={300} height={380} rx={6} fill="#B9B9AA" stroke={KRP.ink} strokeWidth={7} />
      {[0, 1].map((r) => (
        <g key={r}>
          <line x1={0} y1={128 + r * 126} x2={300} y2={128 + r * 126} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={28 + k * 86} y={52 + r * 126} width={58} height={72} rx={4}
              fill={C.washiDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
      ))}
    </g>
    {/* 記録板 */}
    <g transform={`translate(1700 230) rotate(${3 + Math.sin(f / 15) * 0.8})`}>
      <rect x={-110} y={-140} width={220} height={282} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-44} y={-160} width={88} height={34} rx={6} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.rule} strokeWidth={3.4} opacity={0.6}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={-82} y1={-96 + i * 40} x2={82} y2={-96 + i * 40} />
        ))}
      </g>
    </g>
  </g>
);

// --- ケージ ---
const Cage: React.FC<{ x: number; y: number; w?: number; h?: number; f?: number; bars?: number }> = ({
  x, y, w = 420, h = 350, f = 0, bars = 9,
}) => {
  void f;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#D8D4C6" opacity={0.34} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={C.cageBar} strokeWidth={6} opacity={0.95}>
        {Array.from({ length: bars }, (_, i) => (
          <line key={i} x1={x + (w / bars) * (i + 0.5)} y1={y + 6} x2={x + (w / bars) * (i + 0.5)} y2={y + h - 6} />
        ))}
        <line x1={x + 6} y1={y + h * 0.34} x2={x + w - 6} y2={y + h * 0.34} />
        <line x1={x + 6} y1={y + h * 0.68} x2={x + w - 6} y2={y + h * 0.68} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <rect x={x - 10} y={y + h - 6} width={w + 20} height={20} rx={6} fill={C.cageFloor} stroke={KRP.ink} strokeWidth={7} />
    </g>
  );
};

// --- オマキザル (戯画化しない。細い尾・小さな頭) ---
const Capuchin: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1; f?: number; phase?: number;
  arm?: number; look?: number; mood?: "calm" | "alert";
}> = ({ x, y, s = 1, dir = 1, f = 0, phase = 0, arm = 0, look = 0, mood = "calm" }) => {
  const bob = Math.sin((f + phase * 11) / 14) * 3;
  const tail = Math.sin((f + phase * 9) / 16) * 8;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${dir * s} ${s})`}>
      {/* 尾 (細い) */}
      <path
        d={`M -34 -58 q -70 ${18 + tail} -58 ${76 + tail} q 6 34 40 28`}
        fill="none" stroke={KRP.ink} strokeWidth={15} strokeLinecap="round"
      />
      <path
        d={`M -34 -58 q -70 ${18 + tail} -58 ${76 + tail} q 6 34 40 28`}
        fill="none" stroke={MONKEY} strokeWidth={8} strokeLinecap="round"
      />
      {/* 脚 */}
      <g>
        <rect x={-30} y={-48} width={26} height={52} rx={12} fill={MONKEY_DARK} stroke={KRP.ink} strokeWidth={5} />
        <rect x={8} y={-48} width={26} height={52} rx={12} fill={MONKEY_DARK} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 胴 (ほっそり) */}
      <ellipse cx={0} cy={-88} rx={44} ry={56} fill={MONKEY} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={4} cy={-84} rx={28} ry={40} fill="#C3AC87" opacity={0.75} />
      {/* 腕 (arm=0 下げ / 1 前へ伸ばす) */}
      <g transform={`rotate(${-18 - arm * 52} 34 -118)`}>
        <rect x={26} y={-124} width={22} height={84} rx={11} fill={MONKEY} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={37} cy={-40} r={15} fill={MONKEY} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform={`rotate(${16 + arm * 14} -34 -118)`}>
        <rect x={-48} y={-124} width={22} height={80} rx={11} fill={MONKEY} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 頭 (小さい) */}
      <g transform={`translate(${look * 10} -162) rotate(${look * 7})`}>
        <circle cx={0} cy={0} r={38} fill={MONKEY} stroke={KRP.ink} strokeWidth={6} />
        {/* 頭頂の黒い冠毛 (オマキザルの特徴) */}
        <path d="M -30 -20 q 14 -28 30 -26 q 18 -2 30 26 q -30 -12 -60 0 z"
          fill={MONKEY_DARK} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 顔盤 */}
        <ellipse cx={2} cy={8} rx={27} ry={25} fill="#E6D6B6" stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={-9} cy={2} r={5.2} fill={KRP.ink} />
        <circle cx={13} cy={2} r={5.2} fill={KRP.ink} />
        <ellipse cx={2} cy={16} rx={7} ry={5} fill={MONKEY_DARK} opacity={0.6} />
        <path d={mood === "alert" ? "M -8 25 q 10 -7 20 0" : "M -8 24 q 10 5 20 0"}
          fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// --- 校庭と校舎 ---
const SchoolYard: React.FC<{
  f: number; groundY?: number; evening?: boolean; board?: boolean;
}> = ({ f, groundY = 596, evening = false, board = false }) => {
  void board;
  const sway = Math.sin(f / 17) * 3;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={groundY} fill={evening ? C.evening : C.sky} />
      <rect x={0} y={groundY} width={1920} height={1080 - groundY} fill={C.yardDirt} />
      <rect x={0} y={groundY - 8} width={1920} height={12} fill={C.yardDirtDark} opacity={0.8} />
      {/* 校舎 */}
      <g transform={`translate(${evening ? 980 : 170} ${groundY - 320})`}>
        <rect x={0} y={60} width={760} height={262} fill={C.school} stroke={KRP.ink} strokeWidth={8} />
        <path d="M -30 60 L 380 2 L 790 60 Z" fill={C.schoolDark} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
        {[0, 1].map((r) => (
          <g key={r}>
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x={42 + k * 88} y={96 + r * 100} width={62} height={70} rx={4}
                fill="#DCE8EE" stroke={KRP.ink} strokeWidth={5} />
            ))}
          </g>
        ))}
      </g>
      {/* 木 */}
      {[[86, 0], [1830, 1]].map(([tx, i]) => (
        <g key={tx} transform={`translate(${tx} ${groundY + 24})`}>
          <rect x={-13} y={-120} width={26} height={120} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0 + (i ? -sway : sway)} cy={-170} rx={86} ry={74} fill={C.tree} stroke={KRP.ink} strokeWidth={7} />
        </g>
      ))}
      {/* 土の筋 */}
      <g stroke={C.yardDirtDark} strokeWidth={5} opacity={0.4}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={0} y1={groundY + 92 + i * 108} x2={1920} y2={groundY + 80 + i * 108} />
        ))}
      </g>
    </g>
  );
};

// --- 掲示板 (#172 放榜と同じ型) ---
const NoticeBoard: React.FC<{
  x: number; y: number; w?: number; h?: number; f: number; names?: number;
}> = ({ x, y, w = 760, h = 430, f, names = 9 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-20} y={h} width={34} height={170} fill={C.perch} stroke={KRP.ink} strokeWidth={7} />
    <rect x={w - 14} y={h} width={34} height={170} fill={C.perch} stroke={KRP.ink} strokeWidth={7} />
    <rect x={0} y={0} width={w} height={h} rx={6} fill={C.bind} stroke={KRP.ink} strokeWidth={9} />
    <g stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
      {[0, 1, 2].map((i) => (
        <line key={i} x1={0} y1={96 + i * 110} x2={w} y2={92 + i * 110} />
      ))}
    </g>
    {/* 貼り紙 (1位から順に一列) */}
    {Array.from({ length: names }, (_, i) => {
      const flap = i === names - 1 ? Math.sin(f / 8) * 5 : 0;
      return (
        <g key={i} transform={`translate(${44 + i * ((w - 96) / names)} 40) rotate(${flap * 0.4})`}>
          <rect x={0} y={0} width={(w - 96) / names - 14} height={h - 86} rx={4}
            fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={5} opacity={0.42}>
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={14} y1={44 + k * 62} x2={(w - 96) / names - 28} y2={44 + k * 62} />
            ))}
          </g>
          <circle cx={(w - 96) / names / 2 - 7} cy={22} r={9} fill={C.vermil} opacity={0.8} />
        </g>
      );
    })}
    {/* 釘 */}
    <g fill={C.steel} stroke={KRP.ink} strokeWidth={3}>
      {[[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]].map(([nx, ny], i) => (
        <circle key={i} cx={nx} cy={ny} r={8} />
      ))}
    </g>
  </g>
);

// --- 井戸 ---
const Well: React.FC<{
  x: number; y: number; s?: number; f: number; big?: boolean; frogY?: number; rig?: boolean;
}> = ({ x, y, s = 1, f, big = false, frogY, rig = true }) => {
  const r = big ? 230 : 130;
  const shimmer = Math.sin(f / 9) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 石積みの円筒 (正面)。上端の直線は、あとで口の楕円がかぶせて隠す */}
      <path d={`M ${-r} 0 L ${-r} ${r * 0.52} A ${r} ${r * 0.3} 0 0 0 ${r} ${r * 0.52} L ${r} 0 Z`}
        fill={C.stone} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
      {/* 石の目地 (口の楕円より下だけ) */}
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.35}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-r + (i + 1) * (r / 3)} y1={r * 0.38}
            x2={-r + (i + 1) * (r / 3) - 8} y2={r * 0.7} />
        ))}
        <line x1={-r * 0.95} y1={r * 0.54} x2={r * 0.95} y2={r * 0.54} />
      </g>
      {/* 井戸の口 */}
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.36} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={8} />
      {/* 水面 */}
      <ellipse cx={0} cy={frogY !== undefined ? frogY : 4} rx={r * 0.78} ry={r * 0.27} fill={C.water} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={-r * 0.2} cy={(frogY !== undefined ? frogY : 4) - 4 + shimmer} rx={r * 0.3} ry={r * 0.08}
        fill={KRP.white} opacity={0.45} />
      {/* 滑車 (図の対比では外す = rig={false}) */}
      <g opacity={rig ? 1 : 0}>
        <rect x={-r - 16} y={-r * 0.9} width={20} height={r * 0.9} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <rect x={r - 4} y={-r * 0.9} width={20} height={r * 0.9} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-r - 16} y={-r * 0.98} width={r * 2 + 36} height={18} rx={6} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-r * 0.9 + 26} r={20} fill={C.brass} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-r * 0.9 + 44} x2={0} y2={-r * 0.9 + 110} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-26} y={-r * 0.9 + 110} width={52} height={40} rx={5} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
      </g>
    </g>
  );
};

// --- 蛙 ---
const Frog: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number }> = ({
  x, y, s = 1, f = 0, phase = 0,
}) => {
  const breathe = 1 + Math.sin((f + phase * 15) / 13) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * breathe})`}>
      <ellipse cx={-34} cy={-10} rx={20} ry={13} fill={C.frogDark} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={34} cy={-10} rx={20} ry={13} fill={C.frogDark} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-30} rx={48} ry={36} fill={C.frog} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={-20} cy={-62} r={17} fill={C.frog} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={20} cy={-62} r={17} fill={C.frog} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={-20} cy={-64} r={6.4} fill={KRP.ink} />
      <circle cx={20} cy={-64} r={6.4} fill={KRP.ink} />
      <path d="M -24 -34 q 24 16 48 0" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
};

// --- 胸の計器 (#186 #187) ---
const HeartMeter: React.FC<{
  x: number; y: number; s?: number; needle: number; f?: number; label?: string;
}> = ({ x, y, s = 1, needle, f = 0, label }) => {
  const jitter = Math.sin(f / 5) * 2;
  const a = -90 + needle * 76 + jitter;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={92} fill={C.washi} stroke={KRP.ink} strokeWidth={9} />
      <circle cx={0} cy={0} r={74} fill="none" stroke={C.rule} strokeWidth={4} opacity={0.6} />
      <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
        {[-80, -54, -27, 0, 27, 54, 80].map((d, i) => (
          <line key={i} x1={0} y1={-74} x2={0} y2={-58} transform={`rotate(${d})`} />
        ))}
      </g>
      <path d="M -68 -30 A 76 76 0 0 1 -34 -66" fill="none" stroke={C.vermil} strokeWidth={8} opacity={0.75} />
      <path d="M 34 -66 A 76 76 0 0 1 68 -30" fill="none" stroke={C.vermil} strokeWidth={8} opacity={0.75} />
      <g transform={`rotate(${a})`}>
        <line x1={0} y1={8} x2={0} y2={-70} stroke={C.vermil} strokeWidth={9} strokeLinecap="round" />
      </g>
      <circle cx={0} cy={0} r={12} fill={KRP.ink} />
      {label && (
        <text x={0} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>
          {label}
        </text>
      )}
    </g>
  );
};

// ------------------------------------------------------------------
// #163 第9章、なぜ順位は、こんなに刺さるのか。
// 格: 山 — 夜の研究室。観察机・ランプ・標本棚・窓の外は鶏舎の屋根。研究者が書き込む
// ------------------------------------------------------------------
const S163: React.FC<{ f: number }> = ({ f }) => {
  const write = Math.sin(f / 6) * 7;
  return (
    <Frame
      f={f}
      seed={1062}
      bg={KRP.cream}
      dark
      over={<ChapterDoor num={9} title="なぜ順位はこんなに刺さるのか。" t={seg(f, 8, 26)} left={928} top={636} width={930} />}
    >
      <NightLab f={f} floorY={646} />
      {/* 観察机 */}
      <rect x={520} y={646} width={880} height={30} rx={8} fill={C.labDeskDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 開いた観察ノート */}
      <g transform="translate(760 630)">
        <rect x={-210} y={-96} width={420} height={96} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        <line x1={0} y1={-96} x2={0} y2={0} stroke={C.bind} strokeWidth={7} />
        <g stroke={C.rule} strokeWidth={3} opacity={0.6}>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-186} y1={-76 + i * 26} x2={-22} y2={-76 + i * 26} />
          ))}
          {[0, 1].map((i) => (
            <line key={i} x1={22} y1={-76 + i * 26} x2={120 - i * 40} y2={-76 + i * 26} />
          ))}
        </g>
      </g>
      {/* 標本の瓶 */}
      <g transform="translate(1210 646)">
        <rect x={-42} y={-104} width={84} height={104} rx={8} fill="#9FB4BC" opacity={0.5} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-50} y={-120} width={100} height={22} rx={6} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -24 -14 q 16 -34 26 -4 q 12 -22 20 4 z" fill={C.hen} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 研究者 (椅子に座って書き込む) */}
      <g transform={`translate(${880} ${0})`}>
        <Person x={0} y={790} s={1.06} cloth={C.indigo} clothDark="#2C4160" glasses face="normal" pose="hold" f={f} />
      </g>
      {/* 机の前板で下半身を隠す */}
      <rect x={520} y={672} width={880} height={200} fill={C.labDesk} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.labDeskDark} strokeWidth={5} opacity={0.5}>
        <line x1={540} y1={740} x2={1380} y2={736} />
      </g>
      {/* 書く手の線 */}
      <g opacity={0.6} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
        <line x1={790 + write} y1={600} x2={830 + write} y2={574} />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #164 ここからは、順位がこれほど心に効く理由を、科学の目で見ていきます。
// 格: 並 — 同じ机の寄り。開いたノートに虫めがね。輪の中だけ明るい
// ------------------------------------------------------------------
const S164: React.FC<{ f: number }> = ({ f }) => {
  const come = easeOut(seg(f, 4, 26));
  const mx = lerp(1340, 1044, come);
  const my = lerp(300, 474, come);
  return (
    <Frame f={f} seed={1063} bg={KRP.cream} dark>
      <rect x={0} y={0} width={1920} height={1080} fill={C.labWall} />
      <rect x={0} y={300} width={1920} height={780} fill={C.labDesk} />
      <rect x={0} y={288} width={1920} height={18} fill={C.labDeskDark} />
      <g stroke={C.labDeskDark} strokeWidth={6} opacity={0.4}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={0} y1={400 + i * 180} x2={1920} y2={392 + i * 180} />
        ))}
      </g>
      {/* ランプの輪 */}
      <ellipse cx={860} cy={560} rx={660} ry={300} fill={C.lampGlow} opacity={0.17} />
      <ellipse cx={860} cy={560} rx={400} ry={190} fill={C.lampGlow} opacity={0.14} />
      {/* ランプの傘 (画面上から) */}
      <g transform="translate(860 110)">
        <line x1={0} y1={-110} x2={0} y2={-6} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -116 0 L 116 0 L 72 -84 L -72 -84 Z" fill={C.lampShade} stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={0} cy={0} rx={104} ry={24} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 開いたノート (寄り) */}
      <g>
        <rect x={330} y={376} width={1120} height={420} rx={6} fill={KRP.ink} opacity={0.18} transform="translate(10 14)" />
        <rect x={330} y={376} width={1120} height={420} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={8} />
        <clipPath id="clipS164">
          <rect x={330} y={376} width={1120} height={420} rx={6} />
        </clipPath>
        <g clipPath="url(#clipS164)">
          <g stroke={C.rule} strokeWidth={3.4} opacity={0.55}>
            {Array.from({ length: 7 }, (_, i) => (
              <line key={i} x1={360} y1={424 + i * 54} x2={1420} y2={424 + i * 54} />
            ))}
          </g>
          <rect x={883} y={376} width={14} height={420} fill={C.washiDark} opacity={0.9} />
          {/* 書き込みの線 */}
          <g stroke={KRP.ink} strokeWidth={5} opacity={0.46} strokeLinecap="round">
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={372} y1={416 + i * 54} x2={372 + 330 - i * 54} y2={416 + i * 54} />
            ))}
            {[0, 1].map((i) => (
              <line key={i} x1={920} y1={416 + i * 54} x2={920 + 260 + i * 60} y2={416 + i * 54} />
            ))}
          </g>
          {/* 虫めがねの中で罫線が拡大される */}
          <g opacity={come}>
            <clipPath id="clipLens164">
              <circle cx={mx} cy={my} r={86} />
            </clipPath>
            <g clipPath="url(#clipLens164)">
              <rect x={mx - 90} y={my - 90} width={180} height={180} fill={C.washi} />
              <g stroke={C.rule} strokeWidth={7} opacity={0.75}>
                {[-2, -1, 0, 1, 2].map((i) => (
                  <line key={i} x1={mx - 90} y1={my + i * 46} x2={mx + 90} y2={my + i * 46} />
                ))}
              </g>
              <g stroke={KRP.ink} strokeWidth={10} opacity={0.5} strokeLinecap="round">
                <line x1={mx - 70} y1={my - 46} x2={mx + 30} y2={my - 46} />
                <line x1={mx - 70} y1={my} x2={mx - 10} y2={my} />
              </g>
            </g>
          </g>
        </g>
      </g>
      {/* 虫めがねを持つ手 */}
      <g opacity={come}>
        <Magnifier x={mx} y={my} s={1} rot={-28} />
      </g>
      <TagPlate x={1560} y={760} text="科学の目" size={40} t={seg(f, 20, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #165 まず、「序列なんて自然界にもあるのでは?」という疑問から。
// 格: 図 — 図鑑のページ。狼・猿・鶏・魚のシルエットが並び、大きな？が浮く
// ------------------------------------------------------------------
// 図鑑のシルエット (4種)
const AnimalSil: React.FC<{ kind: "wolf" | "monkey" | "hen" | "fish"; x: number; y: number; s?: number }> = ({
  kind, x, y, s = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={C.labWall} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round">
    {kind === "wolf" && (
      <g>
        <path d="M -96 0 L -96 -56 Q -96 -94 -56 -94 L 46 -94 Q 74 -94 78 -118 L 96 -150 L 104 -116 L 128 -106 L 96 -84 Q 84 -62 54 -58 L 54 0 L 36 0 L 36 -56 L -24 -56 L -24 0 L -42 0 L -42 -56 L -78 -56 L -78 0 Z" />
        <path d="M 78 -118 L 70 -148 L 92 -136 Z" fill={KRP.ink} />
      </g>
    )}
    {kind === "monkey" && (
      <g>
        <path d="M -40 0 L -40 -46 Q -66 -62 -62 -96 Q -58 -132 -20 -140 Q -4 -170 24 -164 Q 52 -158 52 -128 Q 76 -110 70 -76 Q 64 -44 36 -40 L 36 0 L 16 0 L 16 -36 L -16 -36 L -16 0 Z" />
        <path d="M -58 -100 q -56 10 -48 62 q 6 30 34 22" fill="none" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
      </g>
    )}
    {kind === "hen" && (
      <g>
        <path d="M -10 0 L -14 -36 L -34 -40 Q -78 -50 -78 -92 Q -78 -134 -34 -140 Q -20 -168 6 -166 L 2 -142 L 30 -148 L 14 -128 Q 48 -118 52 -82 L 96 -126 L 80 -74 L 102 -66 L 46 -44 L 30 -38 L 26 0 L 10 0 L 12 -36 L -2 -36 L -2 0 Z" />
      </g>
    )}
    {kind === "fish" && (
      <g>
        <path d="M -104 -64 Q -40 -118 40 -92 L 92 -132 L 82 -86 L 108 -62 L 80 -40 L 88 -4 L 36 -38 Q -40 -14 -104 -64 Z" />
        <circle cx={-56} cy={-66} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
    )}
  </g>
);

const S165: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1064} bg={KRP.cream}>
    <NoteSpread id="s165" x={152} y={150} w={1616} h={682} rule={false}>
      {/* 図鑑らしい枠と見出し罫 */}
      <rect x={190} y={188} width={1540} height={606} rx={6} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
      <g stroke={C.rule} strokeWidth={3.2} opacity={0.45}>
        {[0, 1].map((i) => (
          <line key={i} x1={210} y1={220 + i * 22} x2={700 - i * 180} y2={220 + i * 22} />
        ))}
      </g>
      {/* 4種のシルエット */}
      <AnimalSil kind="wolf" x={420} y={690} s={1.08} />
      <AnimalSil kind="monkey" x={790} y={690} s={1.08} />
      <AnimalSil kind="hen" x={1150} y={690} s={1.08} />
      <AnimalSil kind="fish" x={1512} y={660} s={1.08} />
      {/* 台座の線 */}
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.35}>
        <line x1={300} y1={700} x2={1640} y2={700} />
      </g>
    </NoteSpread>
    {/* 紙の押さえと栞 */}
    <g transform="translate(1808 540) rotate(6)">
      <rect x={-26} y={-180} width={52} height={360} rx={8} fill={C.vermil} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      <path d="M -26 180 L 0 150 L 26 180 Z" fill={C.vermil} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    </g>
    <g transform="translate(140 760) rotate(-8)">
      <rect x={-80} y={-18} width={160} height={36} rx={10} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
    </g>
    <QMark x={960} y={340} s={1.9} f={f} t={seg(f, 10, 26)} color={C.vermil} />
  </Frame>
);

// ------------------------------------------------------------------
// #166 あります。1922年、ノルウェーの研究者が、ニワトリの「つつき順位」を発表しました。
// 格: 山 — 朝の鶏舎。ニワトリ5羽。外から研究者が覗いて記録する。年号の札
// ------------------------------------------------------------------
// 字幕帯 (上端854) に鶏が沈まないよう、足元は y+44*s ≤ 840 に収める
const HENS_166 = [
  { x: 300, y: 782, s: 0.84, dir: 1 as const, ph: 0 },
  { x: 598, y: 796, s: 0.94, dir: 1 as const, ph: 2 },
  { x: 880, y: 758, s: 0.76, dir: -1 as const, ph: 4 },
  { x: 1146, y: 800, s: 0.88, dir: 1 as const, ph: 6 },
  { x: 1286, y: 752, s: 0.72, dir: -1 as const, ph: 8 },
];

const S166: React.FC<{ f: number }> = ({ f }) => {
  const feather = seg(f, 6, 40);
  return (
    <Frame f={f} seed={1065} bg={KRP.cream}>
      <Coop f={f} groundY={700} />
      {/* 止まり木の上の1羽 */}
      <Hen x={420} y={430} s={0.62} dir={1} f={f} phase={11} />
      {/* 土間の5羽 */}
      {HENS_166.map((h, i) => (
        <Hen key={i} x={h.x} y={h.y} s={h.s} dir={h.dir} f={f} phase={h.ph}
          peck={i === 1 ? Math.max(0, Math.sin(f / 7)) : 0} />
      ))}
      {/* 舞う羽 */}
      <g opacity={0.8}>
        {[0, 1, 2, 3].map((i) => {
          const t = ((f + i * 11) % 44) / 44;
          const fx = 640 + i * 180 + Math.sin((f + i * 20) / 9) * 26;
          const fy = 520 + t * 320;
          return (
            <path key={i} d={`M ${fx} ${fy} q 18 -16 34 2 q -16 14 -34 -2 z`}
              fill={C.hen} stroke={KRP.ink} strokeWidth={3.4} opacity={feather * (1 - t) * 0.9} />
          );
        })}
      </g>
      {/* 外から覗いて記録する研究者 (金網の手前 = 画面右) */}
      <g>
        <Person x={1700} y={1032} s={1.12} cloth={C.indigo} clothDark="#2C4160" glasses face="normal"
          pose="hold" f={f} gaze={[-1, 0]} />
      </g>
      {/* 記録板 */}
      <g transform="translate(1544 760) rotate(-7)">
        <rect x={-92} y={-116} width={184} height={236} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-38} y={-134} width={76} height={30} rx={6} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.rule} strokeWidth={3.2} opacity={0.6}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={-68} y1={-76 + i * 38} x2={68} y2={-76 + i * 38} />
          ))}
        </g>
        <g stroke={KRP.ink} strokeWidth={4.4} opacity={0.5}>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-58} y1={-84 + i * 38} x2={-58 + 70 - i * 18} y2={-84 + i * 38} />
          ))}
        </g>
      </g>
      <TagPlate x={300} y={234} text="1922年" size={46} t={seg(f, 6, 18)} />
      <TagPlate x={300} y={340} text="つつき順位" size={42} t={seg(f, 20, 32)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #167 誰が誰をつついてよいか、群れの中に力関係の順序があるという発見です。
// 格: 並 — 鶏舎の寄り。1羽が隣をつつき、つつかれた方がさらに隣をつつく (ドミノ)
// ------------------------------------------------------------------
const S167: React.FC<{ f: number }> = ({ f }) => {
  const k = [seg(f, 2, 14), seg(f, 12, 24), seg(f, 22, 34)];
  const peckOf = (i: number) => Math.sin(Math.min(k[i], 1) * Math.PI) * 1;
  return (
    <Frame f={f} seed={1066} bg={KRP.cream}>
      <Coop f={f} groundY={640} zoom />
      {/* 4羽が一列 (左が強い) */}
      {[0, 1, 2, 3].map((i) => (
        <Hen key={i} x={380 + i * 390} y={786} s={1.04} dir={1} f={f} phase={i * 3}
          peck={i < 3 ? peckOf(i) : 0} />
      ))}
      {/* 矢印3本 (つつく向き)。鶏と鶏のすき間 (x=575+390i) に置き、頭の上を通す */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={Math.min(k[i], 1)}>
          <Arrow x={575 + i * 390} y={598} s={1.1} rot={0} t={1} color={C.vermil} />
        </g>
      ))}
      <TagPlate x={960} y={240} text="誰が誰をつついてよいか" size={42} t={seg(f, 6, 18)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #168 ただし、よく観察すると、面白いことがわかります。
// 格: 図 — 観察ノートの升目表 (つつき表)。1マスだけ合わない所に朱の丸
// ------------------------------------------------------------------
const S168: React.FC<{ f: number }> = ({ f }) => {
  const N = 5;
  const cell = 104;
  const ox = 560;
  const oy = 268;
  const fill = seg(f, 4, 34);
  return (
    <Frame f={f} seed={1067} bg={KRP.cream}>
      <NoteSpread id="s168" x={150} y={172} w={1620} h={660} rule={false}>
        {/* つつき表 */}
        <g>
          {/* 枠 */}
          <rect x={ox} y={oy} width={cell * N} height={cell * N} fill={KRP.white} opacity={0.5} />
          <g stroke={KRP.ink} strokeWidth={5} opacity={0.75}>
            {Array.from({ length: N + 1 }, (_, i) => (
              <line key={`v${i}`} x1={ox + i * cell} y1={oy} x2={ox + i * cell} y2={oy + cell * N} />
            ))}
            {Array.from({ length: N + 1 }, (_, i) => (
              <line key={`h${i}`} x1={ox} y1={oy + i * cell} x2={ox + cell * N} y2={oy + i * cell} />
            ))}
          </g>
          {/* 見出し (A〜E) */}
          {Array.from({ length: N }, (_, i) => (
            <g key={i}>
              <text x={ox + i * cell + cell / 2} y={oy - 24} textAnchor="middle" fontFamily={FONT}
                fontWeight={900} fontSize={44} fill={KRP.ink}>{"ABCDE"[i]}</text>
              <text x={ox - 34} y={oy + i * cell + cell / 2 + 16} textAnchor="middle" fontFamily={FONT}
                fontWeight={900} fontSize={44} fill={KRP.ink}>{"ABCDE"[i]}</text>
            </g>
          ))}
          {/* ○が埋まっていく */}
          {Array.from({ length: N * N }, (_, idx) => {
            const r = Math.floor(idx / N);
            const c = idx % N;
            if (r === c) return null;
            const on = c > r;
            if (!on) return null;
            const t = clamp01((fill * 12 - (r * N + c) * 0.9) / 2);
            if (t <= 0) return null;
            return (
              <circle key={idx} cx={ox + c * cell + cell / 2} cy={oy + r * cell + cell / 2} r={30 * t}
                fill="none" stroke={KRP.ink} strokeWidth={7} />
            );
          })}
          {/* 1マスだけ合わない所 = 朱の丸 */}
          <g opacity={seg(f, 26, 38)}>
            <circle cx={ox + 0 * cell + cell / 2} cy={oy + 2 * cell + cell / 2} r={30}
              fill="none" stroke={KRP.ink} strokeWidth={7} />
            <circle cx={ox + 0 * cell + cell / 2} cy={oy + 2 * cell + cell / 2} r={56}
              fill="none" stroke={C.vermil} strokeWidth={9} />
          </g>
        </g>
      </NoteSpread>
      {/* 鉛筆と消しゴム */}
      <Pencil x={300} y={910} rot={-9} s={0.92} />
      <g transform="translate(690 920) rotate(7)">
        <rect x={-58} y={-26} width={116} height={52} rx={8} fill="#E4D2C4" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-58} y={-26} width={48} height={52} rx={8} fill={C.indigo} stroke={KRP.ink} strokeWidth={6} opacity={0.8} />
      </g>
      {/* 縦に積む札は左端をそろえる (左端 1277 でそろえた) */}
      <TagPlate x={1439} y={290} text="よく観察すると" size={40} t={seg(f, 8, 20)} />
      <TagPlate x={1470} y={396} text="1マスだけ合わない" size={38} t={seg(f, 28, 40)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #169 AはBに強く、BはCに強い。なのに、CがAに強い。
// 格: 図 — ノートの上に A→B→C の矢印が一直線。最後に C→A が逆走して描かれる
// ------------------------------------------------------------------
// ノートの上の鶏アイコン (A/B/C)
const HenIcon: React.FC<{ x: number; y: number; label: string; s?: number; f?: number; phase?: number }> = ({
  x, y, label, s = 1, f = 0, phase = 0,
}) => (
  <g>
    <circle cx={x} cy={y} r={78 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
    <g transform={`translate(${x} ${y + 44 * s}) scale(${0.52 * s})`}>
      <Hen x={0} y={0} s={1} dir={1} f={f} phase={phase} />
    </g>
    <text x={x} y={y - 84 * s} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={54 * s} fill={KRP.ink}>{label}</text>
  </g>
);

const S169: React.FC<{ f: number }> = ({ f }) => {
  const a1 = seg(f, 4, 14);
  const a2 = seg(f, 14, 24);
  const a3 = seg(f, 26, 40);
  const P = [
    { x: 470, y: 486 },
    { x: 960, y: 486 },
    { x: 1450, y: 486 },
  ];
  return (
    <Frame f={f} seed={1068} bg={KRP.cream}>
      <NoteSpread id="s169" x={150} y={200} w={1620} h={608} rule={false}>
        {/* 下敷きの薄い罫 */}
        <g stroke={C.rule} strokeWidth={3} opacity={0.34}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={184} y1={240 + i * 58} x2={1736} y2={240 + i * 58} />
          ))}
        </g>
        {/* A→B→C の一直線 */}
        <g opacity={a1}>
          <line x1={P[0].x + 92} y1={P[0].y} x2={P[1].x - 110} y2={P[1].y}
            stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <polygon points={`${P[1].x - 86},${P[1].y} ${P[1].x - 128},${P[1].y - 24} ${P[1].x - 128},${P[1].y + 24}`} fill={KRP.ink} />
        </g>
        <g opacity={a2}>
          <line x1={P[1].x + 92} y1={P[1].y} x2={P[2].x - 110} y2={P[2].y}
            stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <polygon points={`${P[2].x - 86},${P[2].y} ${P[2].x - 128},${P[2].y - 24} ${P[2].x - 128},${P[2].y + 24}`} fill={KRP.ink} />
        </g>
        {/* C→A が逆走 (下をくぐる) */}
        <g opacity={a3}>
          <path d={`M ${P[2].x} ${P[2].y + 96} Q 960 ${P[2].y + 274} ${P[0].x} ${P[0].y + 96}`}
            fill="none" stroke={C.vermil} strokeWidth={11} strokeLinecap="round" />
          <polygon points={`${P[0].x - 4},${P[0].y + 92} ${P[0].x + 42},${P[0].y + 120} ${P[0].x + 20},${P[0].y + 152}`}
            fill={C.vermil} />
        </g>
        {/* 鶏アイコン3つ */}
        {P.map((p, i) => (
          <HenIcon key={i} x={p.x} y={p.y} label={"ABC"[i]} s={1} f={f} phase={i * 4} />
        ))}
      </NoteSpread>
      <TagPlate x={960} y={796} text="なのに C が A に強い" size={40} t={seg(f, 30, 42)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #170 そんな三すくみが、普通に起きるのです。
// 格: 山 ★知的山場 — 鶏舎の土間で A/B/C が三角に立ち、矢印が輪になって閉じる
// ------------------------------------------------------------------
const S170: React.FC<{ f: number }> = ({ f }) => {
  const close = seg(f, 6, 30);
  const burst = seg(f, 28, 40);
  // 三角の頂点 (土間の上)。下2つは字幕帯 (上端854) を避けて高めに置く
  const V = [
    { x: 960, y: 400 },
    { x: 1398, y: 740 },
    { x: 522, y: 740 },
  ];
  const seglen = [seg(f, 6, 16), seg(f, 14, 24), seg(f, 22, 32)];
  const arc = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const pad = 150;
    const sx = a.x + ux * pad;
    const sy = a.y + uy * pad;
    const ex = a.x + ux * (len - pad);
    const ey = a.y + uy * (len - pad);
    const tx = lerp(sx, ex, clamp01(t));
    const ty = lerp(sy, ey, clamp01(t));
    return { sx, sy, tx, ty, ux, uy };
  };
  return (
    <Frame f={f} seed={1069} bg={KRP.cream}>
      <Coop f={f} groundY={430} />
      {/* 輪の下地 (土の上に引かれた円) */}
      <ellipse cx={960} cy={660} rx={520} ry={200} fill="none" stroke={C.coopEarthDark}
        strokeWidth={8} opacity={0.4 + close * 0.3} />
      {/* 矢印の輪 (A→B→C→A) */}
      {[0, 1, 2].map((i) => {
        const a = arc(V[i], V[(i + 1) % 3], seglen[i]);
        const ang = (Math.atan2(a.uy, a.ux) * 180) / Math.PI;
        return (
          <g key={i} opacity={seglen[i] > 0 ? 1 : 0}>
            <line x1={a.sx} y1={a.sy} x2={a.tx} y2={a.ty}
              stroke={i === 2 ? C.vermil : KRP.ink} strokeWidth={12} strokeLinecap="round" />
            <g transform={`translate(${a.tx} ${a.ty}) rotate(${ang})`} opacity={clamp01(seglen[i] * 3 - 1.4)}>
              <polygon points="0,0 -46,-26 -46,26" fill={i === 2 ? C.vermil : KRP.ink} />
            </g>
          </g>
        );
      })}
      {/* 3羽 */}
      <Hen x={V[0].x} y={V[0].y + 70} s={0.8} dir={1} f={f} phase={0} />
      <Hen x={V[1].x} y={V[1].y + 50} s={1.0} dir={-1} f={f} phase={4} />
      <Hen x={V[2].x} y={V[2].y + 50} s={1.0} dir={1} f={f} phase={8} />
      {/* A/B/C の札 (鶏の頭上・尾羽の外。被らせない) */}
      <TagPlate x={V[0].x} y={290} text="A" size={46} t={seg(f, 2, 12)} />
      <TagPlate x={1620} y={700} text="B" size={46} t={seg(f, 6, 16)} />
      <TagPlate x={300} y={700} text="C" size={46} t={seg(f, 10, 20)} color={C.vermil} />
      {/* 閉じた瞬間の土ぼこり */}
      <g opacity={burst * 0.7}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          const d = 60 + burst * 120;
          return (
            <ellipse key={i} cx={960 + Math.cos(a) * d * 2.1} cy={826 + Math.sin(a) * d * 0.4}
              rx={54 + burst * 30} ry={18} fill={C.coopEarthDark} opacity={0.6 - burst * 0.3} />
          );
        })}
      </g>
      {/* 下の「C」(x=300) と左端をそろえる (左端 255)。A/B/C の三角は動かさない */}
      <TagPlate x={373} y={260} text="三すくみ" size={48} t={seg(f, 30, 42)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #171 つまり動物の序列は「相手ごとの力関係」の集まりで、全員を並べた一覧表ではありません。
// 格: 図 ★対比 — ノートの見開き。左=相手ごとの矢印の束 (網の目)。右=一列の一覧表に×
// ------------------------------------------------------------------
const NET_171 = [
  { x: 300, y: 330 }, { x: 520, y: 290 }, { x: 700, y: 420 },
  { x: 330, y: 560 }, { x: 560, y: 620 }, { x: 740, y: 580 },
];
const NET_EDGE_171: [number, number][] = [
  [0, 1], [1, 2], [2, 5], [5, 4], [4, 3], [3, 0], [0, 2], [1, 4], [3, 5], [2, 4],
];
// 右ページの一覧表の上端。下の札 (y=750) との間を空けるため 262→220 に上げた。
// 表の中心 (220+240=460) が左ページの網の中心 (約455) とそろう。
const TBL_Y_171 = 220;

const S171: React.FC<{ f: number }> = ({ f }) => {
  const net = seg(f, 4, 26);
  const list = seg(f, 14, 30);
  const x = seg(f, 32, 42);
  return (
    <Frame f={f} seed={1070} bg={KRP.cream}>
      <NoteSpread id="s171" x={120} y={170} w={1680} h={664} grid rule={false}>
        {/* 左ページ: 相手ごとの矢印の束 */}
        <g opacity={net}>
          {NET_EDGE_171.map(([a, b], i) => {
            const A = NET_171[a];
            const B = NET_171[b];
            const dx = B.x - A.x;
            const dy = B.y - A.y;
            const L = Math.hypot(dx, dy);
            const ux = dx / L;
            const uy = dy / L;
            const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
            return (
              <g key={i}>
                <line x1={A.x + ux * 36} y1={A.y + uy * 36} x2={B.x - ux * 44} y2={B.y - uy * 44}
                  stroke={KRP.ink} strokeWidth={6} opacity={0.72} strokeLinecap="round" />
                <g transform={`translate(${B.x - ux * 40} ${B.y - uy * 40}) rotate(${ang})`}>
                  <polygon points="0,0 -22,-12 -22,12" fill={KRP.ink} opacity={0.8} />
                </g>
              </g>
            );
          })}
          {NET_171.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={p.x - 10} cy={p.y - 4} r={5} fill={KRP.ink} />
              <circle cx={p.x + 10} cy={p.y - 4} r={5} fill={KRP.ink} />
              <path d={`M ${p.x + 26} ${p.y - 2} l 18 6 l -18 6 z`} fill={C.beak} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 右ページ: 一列の一覧表 */}
        <g opacity={list}>
          <rect x={1080} y={TBL_Y_171} width={560} height={480} rx={6} fill={KRP.white} opacity={0.62}
            stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <line x1={1080} y1={TBL_Y_171 + (i + 1) * 80} x2={1640} y2={TBL_Y_171 + (i + 1) * 80}
                stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
              <text x={1128} y={TBL_Y_171 + i * 80 + 56} fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>
                {i + 1}
              </text>
              <line x1={1200} y1={TBL_Y_171 + i * 80 + 44} x2={1200 + 300 - i * 24} y2={TBL_Y_171 + i * 80 + 44}
                stroke={KRP.ink} strokeWidth={8} opacity={0.4} strokeLinecap="round" />
            </g>
          ))}
          <line x1={1176} y1={TBL_Y_171} x2={1176} y2={TBL_Y_171 + 480} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        </g>
      </NoteSpread>
      {/* 中央に ≠ */}
      <g opacity={seg(f, 24, 34)}>
        <g stroke={KRP.ink} strokeWidth={14} strokeLinecap="round">
          <line x1={898} y1={462} x2={1012} y2={462} />
          <line x1={898} y1={524} x2={1012} y2={524} />
          <line x1={1024} y1={420} x2={886} y2={566} />
        </g>
      </g>
      {/* 一覧表に × */}
      <XMark x={1356} y={456} s={1.9} t={x} color={C.vermil} />
      {/* 左右で見くらべる1対なので y は同じ値。字幕帯 (上端854) まで 63px 空ける */}
      <TagPlate x={520} y={750} text="相手ごとの力関係" size={38} t={seg(f, 18, 30)} />
      <TagPlate x={1360} y={750} text="全員を並べた一覧表" size={38} t={seg(f, 32, 42)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #172 全員を1本の数直線に並べて貼り出すのは、やはり人間の発明なのです。
// 格: 並 — 校庭の掲示板 (第3章の放榜と同じ型)。1位から順に一列。人が1人見上げる
// ------------------------------------------------------------------
const S172: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1071} bg={KRP.cream}>
    <SchoolYard f={f} groundY={620} />
    <NoticeBoard x={560} y={150} w={840} h={450} f={f} names={9} />
    {/* 1位の印 */}
    <g opacity={seg(f, 10, 22)}>
      <circle cx={604} cy={212} r={26} fill={C.vermil} stroke={KRP.ink} strokeWidth={6} />
      <text x={604} y={228} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>1</text>
    </g>
    {/* 見上げる人 */}
    <Person x={1620} y={1040} s={1.2} cloth={C.indigo} clothDark="#2C4160" face="normal"
      pose="stand" f={f} gaze={[-1, -1]} />
    {/* 縦に積む札は左端をそろえる (左端 131) */}
    <TagPlate x={300} y={310} text="一列に貼り出す" size={42} t={seg(f, 14, 26)} />
    <TagPlate x={258} y={424} text="人間の発明" size={42} t={seg(f, 28, 40)} color={C.vermil} />
  </Frame>
);

// ------------------------------------------------------------------
// #173 次に、比べずにいられない心のほうを見てみます。
// 格: 並 — 研究室の机。ノートを閉じて「心」の札の付いた小箱を手元に引き寄せる
// ------------------------------------------------------------------
const S173: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeOut(seg(f, 8, 32));
  const bx = lerp(1400, 1096, pull);
  return (
    <Frame f={f} seed={1072} bg={KRP.cream} dark>
      <NightLab f={f} floorY={600} />
      {/* 机 */}
      <rect x={0} y={600} width={1920} height={28} fill={C.labDeskDark} />
      {/* 閉じたノート */}
      <g transform="translate(560 592) rotate(-3)">
        <rect x={-200} y={-46} width={400} height={46} rx={5} fill={C.washiDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-200} y={-58} width={400} height={20} rx={5} fill={C.bind} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-200} y1={-22} x2={200} y2={-22} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      </g>
      {/* 引き寄せる小箱 */}
      <g transform={`translate(${bx} 596)`}>
        <rect x={-120} y={-134} width={240} height={134} rx={8} fill={C.bind} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-130} y={-156} width={260} height={30} rx={7} fill={C.perch} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={0} cy={-62} r={22} fill={C.brass} stroke={KRP.ink} strokeWidth={6} />
        {/* 「心」の札 (箱に紐で結ばれている) */}
        <line x1={96} y1={-128} x2={132} y2={-188} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 引き寄せる動きの線 */}
      <g opacity={pull * 0.6} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
        <line x1={bx + 150} y1={520} x2={bx + 268} y2={514} />
        <line x1={bx + 150} y1={566} x2={bx + 240} y2={564} />
      </g>
      {/* 研究者 */}
      {/* 机の前板 (y=624) に胸から下が隠れる。顔と肩が出る高さに座らせる */}
      <Person x={1660} y={700} s={1.08} cloth={C.indigo} clothDark="#2C4160" glasses face="normal"
        pose="point" pointDir={-1} f={f} gaze={[-1, 0]} />
      {/* 机の前板 */}
      <rect x={0} y={624} width={1920} height={456} fill={C.labDesk} />
      <g stroke={C.labDeskDark} strokeWidth={6} opacity={0.4}>
        {[0, 1].map((i) => (
          <line key={i} x1={0} y1={716 + i * 150} x2={1920} y2={708 + i * 150} />
        ))}
      </g>
      <TagPlate x={bx + 190} y={434} text="心" size={46} t={seg(f, 24, 36)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #174 オマキザルというサルに、簡単な仕事をさせて、ご褒美を渡す実験があります。
// 格: 山 ★舞台の初登場 — 実験室の机に2つのケージ。実験者の手が石を受け取りご褒美を渡す
// ------------------------------------------------------------------
// 小石 (仕事の道具)
const Pebble: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -24 6 q -8 -22 10 -28 q 20 -10 32 4 q 12 14 -2 24 q -22 12 -40 0 z"
      fill={C.stone} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
// 実験者の手 (袖つき)
const HandIn: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; open?: number }> = ({
  x, y, s = 1, dir = 1, open = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
    {/* 袖 */}
    <rect x={0} y={-40} width={240} height={80} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
    <rect x={0} y={-40} width={56} height={80} rx={10} fill={C.steel} stroke={KRP.ink} strokeWidth={6} opacity={0.8} />
    {/* 指3本 (付け根は手のひらで隠す) */}
    <g fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round">
      <rect x={-96 - open * 14} y={-32} width={62} height={21} rx={10} />
      <rect x={-104 - open * 18} y={-9} width={70} height={21} rx={10} />
      <rect x={-94 - open * 12} y={14} width={60} height={21} rx={10} />
    </g>
    {/* 親指 */}
    <path d={`M -26 -30 q -34 ${-22 - open * 12} -60 ${-8}`} fill="none" stroke={KRP.ink}
      strokeWidth={26} strokeLinecap="round" />
    <path d={`M -26 -30 q -34 ${-22 - open * 12} -60 ${-8}`} fill="none" stroke={C.skin}
      strokeWidth={14} strokeLinecap="round" />
    {/* 手のひら */}
    <path d="M 6 -40 q -50 2 -52 30 q -2 30 52 30 z"
      fill={C.skin} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

const S174: React.FC<{ f: number }> = ({ f }) => {
  const give = easeOut(seg(f, 10, 34));
  return (
    <Frame f={f} seed={1073} bg={KRP.cream}>
      <LabBench f={f} top={560} />
      {/* 2つのケージ */}
      <Cage x={300} y={318} w={480} h={392} f={f} bars={10} />
      <Cage x={1000} y={318} w={480} h={392} f={f} bars={10} />
      {/* 中のオマキザル2匹 */}
      <Capuchin x={540} y={700} s={1.0} dir={1} f={f} phase={0} arm={0} look={0.4} />
      <Capuchin x={1240} y={700} s={1.0} dir={-1} f={f} phase={3} arm={give} look={-0.4} />
      {/* 石を受け取る手 (左の画面外から入る。袖が左端・指先が右) */}
      <g opacity={seg(f, 2, 14)}>
        <HandIn x={200} y={640} s={0.82} dir={-1} open={0.6} />
        <Pebble x={292} y={628} s={1.0} rot={-12} />
      </g>
      {/* ご褒美を差し出す手 (右の画面外から入る。袖が右端・指先が左) */}
      <g opacity={give}>
        <HandIn x={1740} y={640} s={0.82} dir={1} open={0.5} />
        <circle cx={1650} cy={632} r={18} fill={C.frog} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1618} cy={648} r={15} fill={C.frog} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 机の皿 */}
      {[560, 1220].map((px, i) => (
        <g key={px}>
          <ellipse cx={px} cy={796} rx={82} ry={24} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={px} cy={788} rx={62} ry={16} fill={C.washiDark} opacity={0.7} />
          {i === 0 && <ellipse cx={px} cy={784} rx={26} ry={9} fill={C.frog} stroke={KRP.ink} strokeWidth={4} />}
        </g>
      ))}
      <TagPlate x={300} y={176} text="オマキザル" size={44} t={seg(f, 6, 18)} />
      <TagPlate x={1460} y={176} text="簡単な仕事とご褒美" size={38} t={seg(f, 22, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #175 隣のサルは、おいしいブドウ。自分だけ、キュウリ。
// 格: 並 — 2つのケージの寄り。左の皿にブドウ・右の皿にキュウリ。右のサルが隣を見る
// ------------------------------------------------------------------
// ブドウ
const Grapes: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-26, 0], [0, 0], [26, 0], [-13, -24], [13, -24], [0, -46], [-13, 24], [13, 24], [0, 44]].map(([gx, gy], i) => (
      <circle key={i} cx={gx} cy={gy} r={17} fill="#8E6EA8" stroke={KRP.ink} strokeWidth={5} />
    ))}
    <path d="M 0 -60 q 14 -22 34 -22" fill="none" stroke={C.grassDark} strokeWidth={6} strokeLinecap="round" />
    <path d="M 30 -84 q 24 -8 28 10 q -22 10 -28 -10 z" fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
// キュウリ
const Cucumber: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-62} y={-20} width={124} height={40} rx={20} fill={C.grass} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-44} y={-12} width={88} height={10} rx={5} fill="#B4CC8E" opacity={0.75} />
    <g fill={C.grassDark} opacity={0.6}>
      {[-34, -12, 10, 32].map((gx, i) => (
        <circle key={i} cx={gx} cy={6} r={4} />
      ))}
    </g>
  </g>
);

const S175: React.FC<{ f: number }> = ({ f }) => {
  const look = seg(f, 10, 30);
  return (
    <Frame f={f} seed={1074} bg={KRP.cream}>
      <LabBench f={f} top={500} />
      {/* 金網の影が机に落ちる */}
      <g opacity={0.16}>
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={160 + i * 110} y1={700} x2={120 + i * 110} y2={1080}
            stroke={KRP.ink} strokeWidth={10} />
        ))}
      </g>
      <Cage x={180} y={230} w={620} h={500} f={f} bars={11} />
      <Cage x={1120} y={230} w={620} h={500} f={f} bars={11} />
      {/* 左のサル (ブドウ) */}
      <Capuchin x={470} y={720} s={1.3} dir={1} f={f} phase={0} arm={0.3} look={0} />
      {/* 右のサル (キュウリ。隣をじっと見る) */}
      <Capuchin x={1430} y={720} s={1.3} dir={-1} f={f} phase={4} arm={0} look={look} mood="alert" />
      {/* 皿 */}
      <g>
        <ellipse cx={672} cy={812} rx={96} ry={28} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        <Grapes x={672} y={760} s={0.92} />
      </g>
      <g>
        <ellipse cx={1246} cy={812} rx={96} ry={28} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        <Cucumber x={1246} y={780} s={0.92} rot={-8} />
      </g>
      {/* 視線 */}
      <g opacity={look * 0.5} stroke={C.vermil} strokeWidth={6} strokeDasharray="18 16" strokeLinecap="round">
        <line x1={1352} y1={538} x2={776} y2={700} />
      </g>
      <TagPlate x={420} y={158} text="ブドウ" size={44} t={seg(f, 4, 16)} />
      <TagPlate x={1500} y={158} text="キュウリ" size={44} t={seg(f, 16, 28)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #176 すると、キュウリの受け取りを拒否し始めるのです。
// 格: 山 ★事件 — キュウリを金網の外へ投げ返す。皿が倒れ机に音の線
// ------------------------------------------------------------------
const S176: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp01(seg(f, 8, 36));
  // キュウリの弧
  const cx = lerp(1320, 560, t);
  const cy = 620 - Math.sin(t * Math.PI) * 300 + t * 90;
  const crot = -20 - t * 420;
  return (
    <Frame f={f} seed={1075} bg={KRP.cream}>
      <LabBench f={f} top={500} />
      <Cage x={1080} y={230} w={620} h={500} f={f} bars={11} />
      {/* 投げ返すサル */}
      <Capuchin x={1400} y={720} s={1.32} dir={-1} f={f} phase={2} arm={1} look={-0.5} mood="alert" />
      {/* 倒れた皿 */}
      <g transform="translate(1210 802) rotate(-38)">
        <ellipse cx={0} cy={0} rx={92} ry={26} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={-8} rx={62} ry={16} fill={C.washiDark} opacity={0.7} />
      </g>
      {/* 机の音の線 (字幕帯 上端854 より上に収める) */}
      <g opacity={t} stroke={C.vermil} strokeWidth={7} strokeLinecap="round">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1={1090 - i * 10} y1={826 + i * 5} x2={1030 - i * 34} y2={798 - i * 18} />
            <line x1={1330 + i * 10} y1={826 + i * 5} x2={1390 + i * 34} y2={798 - i * 18} />
          </g>
        ))}
      </g>
      {/* 飛ぶキュウリ + 軌跡 */}
      <g opacity={t > 0 ? 1 : 0}>
        <path
          d={`M 1320 620 Q ${lerp(1320, 560, 0.5)} ${620 - 300 - 60} 560 ${620 + 90}`}
          fill="none" stroke={C.vermil} strokeWidth={6} strokeDasharray="20 18" opacity={0.5}
        />
        <Cucumber x={cx} y={cy} s={1.05} rot={crot} />
      </g>
      {/* 止まった実験者の手 */}
      <g>
        <HandIn x={200} y={660} s={0.9} dir={-1} open={0.9} />
        <g opacity={clamp01(t * 2) * 0.6} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
          <line x1={250} y1={566} x2={232} y2={520} />
          <line x1={312} y1={560} x2={316} y2={510} />
        </g>
      </g>
      <TagPlate x={430} y={214} text="受け取りを拒否" size={44} t={seg(f, 24, 38)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #177 さっきまで、喜んで食べていた、同じキュウリをです。
// 格: 図 — ノートに貼った2コマの観察記録。左「さっき=食べる」右「いま=投げる」
// ------------------------------------------------------------------
const S177: React.FC<{ f: number }> = ({ f }) => {
  const a = seg(f, 4, 18);
  const b = seg(f, 18, 32);
  const same = seg(f, 32, 42);
  return (
    <Frame f={f} seed={1076} bg={KRP.cream}>
      <NoteSpread id="s177" x={130} y={160} w={1660} h={680} rule={false}>
        {/* 2コマの枠 */}
        {[{ x: 250, op: a, label: "さっき" }, { x: 1010, op: b, label: "いま" }].map((k, i) => (
          <g key={i} opacity={k.op}>
            <rect x={k.x + 12} y={232} width={660} height={460} rx={6} fill={KRP.ink} opacity={0.12} />
            <rect x={k.x} y={220} width={660} height={460} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <rect x={k.x} y={220} width={660} height={62} fill={C.washiDark} stroke={KRP.ink} strokeWidth={6} />
            <text x={k.x + 330} y={266} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={42} fill={KRP.ink}>{k.label}</text>
            {/* コマの中身 */}
            <g transform={`translate(${k.x + 330} 612) scale(0.82)`}>
              <Capuchin x={0} y={0} s={1} dir={i === 0 ? 1 : -1} f={f} phase={i * 5}
                arm={i === 0 ? 0.65 : 1} look={i === 0 ? 0 : -0.4} mood={i === 0 ? "calm" : "alert"} />
            </g>
          </g>
        ))}
        {/* コマのキュウリ */}
        <g opacity={a}>
          <Cucumber x={660} y={470} s={0.78} rot={-14} />
        </g>
        <g opacity={b}>
          <Cucumber x={1140} y={372} s={0.78} rot={-96} />
          <path d="M 1300 450 Q 1210 356 1130 376" fill="none" stroke={C.vermil}
            strokeWidth={5} strokeDasharray="16 14" opacity={0.6} />
        </g>
        {/* 同じキュウリ = 矢印 */}
        <g opacity={same}>
          <path d="M 680 500 Q 900 584 1128 414" fill="none" stroke={C.vermil} strokeWidth={8} strokeLinecap="round" />
          <polygon points="1128,414 1174,436 1142,462" fill={C.vermil} />
        </g>
      </NoteSpread>
      {/* クリップと日付 */}
      <Clip x={330} y={190} rot={-8} s={1.1} />
      <Clip x={1480} y={190} rot={6} s={1.1} />
      <TagPlate x={960} y={772} text="同じキュウリ" size={42} t={same} color={C.vermil} />
      <TagPlate x={1660} y={772} text="記録 3 日目" size={30} t={seg(f, 10, 22)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #178 ご褒美の量ではなく「隣と比べてどうか」に反応する心は、サルにもありました。
// 格: 図 — ケージの上に小さな天秤。重さは同じなのに「隣」の影が映るだけで傾く
// ------------------------------------------------------------------
const S178: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeOut(seg(f, 16, 36)) * 13;
  const shade = seg(f, 10, 24);
  const cx = 960;
  const cy = 420;
  const armL = 300;
  const rad = (tilt * Math.PI) / 180;
  const lx = cx - Math.cos(rad) * armL;
  const ly = cy - Math.sin(rad) * armL;
  const rx = cx + Math.cos(rad) * armL;
  const ry = cy + Math.sin(rad) * armL;
  return (
    <Frame f={f} seed={1077} bg={KRP.cream}>
      <LabBench f={f} top={620} />
      {/* 奥のケージ (舞台を保つ) */}
      <g opacity={0.55}>
        <Cage x={120} y={416} w={360} h={300} f={f} bars={8} />
        <Cage x={1440} y={416} w={360} h={300} f={f} bars={8} />
        <g transform="translate(300 716) scale(0.62)">
          <Capuchin x={0} y={0} s={1} dir={1} f={f} phase={1} />
        </g>
        <g transform="translate(1620 716) scale(0.62)">
          <Capuchin x={0} y={0} s={1} dir={-1} f={f} phase={6} />
        </g>
      </g>
      {/* 天秤 */}
      <g>
        <path d="M 900 860 L 1020 860 L 990 700 L 930 700 Z" fill={C.brassDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={944} y={430} width={32} height={276} fill={C.brass} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${tilt} ${cx} ${cy})`}>
          <rect x={cx - armL} y={cy - 11} width={armL * 2} height={22} rx={10}
            fill={C.brass} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <circle cx={cx} cy={cy} r={26} fill={C.brass} stroke={KRP.ink} strokeWidth={7} />
        {/* 左右の皿 */}
        {[{ px: lx, py: ly, w: 1 }, { px: rx, py: ry, w: 2 }].map((p, i) => (
          <g key={i}>
            <line x1={p.px} y1={p.py} x2={p.px} y2={p.py + 110} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={p.px} cy={p.py + 118} rx={92} ry={24} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
            {/* 中身は同じ重さ (同じ四角) */}
            <rect x={p.px - 36} y={p.py + 66} width={72} height={52} rx={8}
              fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
            <text x={p.px} y={p.py + 104} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={30} fill={KRP.ink}>1</text>
          </g>
        ))}
        {/* 右の皿にだけ「隣」の影が映る */}
        <g opacity={shade * 0.55}>
          <ellipse cx={rx} cy={ry + 126} rx={100} ry={28} fill={KRP.ink} opacity={0.5} />
          <g transform={`translate(${rx + 4} ${ry + 122}) scale(0.4)`} opacity={0.75}>
            <Capuchin x={0} y={0} s={1} dir={-1} f={0} phase={0} />
          </g>
        </g>
      </g>
      <TagPlate x={420} y={212} text="重さは同じ" size={42} t={seg(f, 6, 18)} />
      <TagPlate x={1470} y={212} text="隣の影が映るだけで傾く" size={34} t={seg(f, 26, 40)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #179 では人間の場合、まわりとの比較はどれくらい効くのでしょうか。
// 格: 並 — 実験室の窓から校庭が見える。手前に1人の生徒の背中。？が小さく浮く
// ------------------------------------------------------------------
const S179: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1078} bg={KRP.cream}>
    {/* 室内 */}
    <rect x={0} y={0} width={1920} height={760} fill={C.labRoom} />
    <rect x={0} y={760} width={1920} height={320} fill={C.labDesk} />
    <rect x={0} y={748} width={1920} height={18} fill={C.labDeskDark} />
    {/* 窓枠 + 外の校庭 */}
    <g>
      <rect x={420} y={96} width={1100} height={600} rx={6} fill={C.sky} stroke={KRP.ink} strokeWidth={10} />
      <clipPath id="clipWin179">
        <rect x={420} y={96} width={1100} height={600} rx={6} />
      </clipPath>
      <g clipPath="url(#clipWin179)">
        {/* 外の校舎と校庭 */}
        <rect x={420} y={420} width={1100} height={276} fill={C.yardDirt} />
        <g transform="translate(560 190) scale(0.62)">
          <rect x={0} y={60} width={760} height={262} fill={C.school} stroke={KRP.ink} strokeWidth={8} />
          <path d="M -30 60 L 380 2 L 790 60 Z" fill={C.schoolDark} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
          {[0, 1].map((r) => (
            <g key={r}>
              {Array.from({ length: 8 }, (_, k) => (
                <rect key={k} x={42 + k * 88} y={96 + r * 100} width={62} height={70} rx={4}
                  fill="#DCE8EE" stroke={KRP.ink} strokeWidth={5} />
              ))}
            </g>
          ))}
        </g>
        {/* 校庭の人かげ */}
        {[520, 640, 760, 1140, 1280, 1420].map((px, i) => (
          <g key={px} transform={`translate(${px} ${560 + (i % 3) * 36}) scale(0.4)`} opacity={0.75}>
            <PersonMini x={0} y={0} s={1} color={i % 2 ? KRP.gray : C.indigo} f={f} phase={i} />
          </g>
        ))}
      </g>
      {/* 桟 */}
      <g stroke={KRP.ink} strokeWidth={9}>
        <line x1={970} y1={96} x2={970} y2={696} />
        <line x1={420} y1={396} x2={1520} y2={396} />
      </g>
      {/* 窓台 */}
      <rect x={392} y={688} width={1156} height={34} rx={6} fill={C.washiDark} stroke={KRP.ink} strokeWidth={8} />
    </g>
    {/* カーテン */}
    {[{ cx: 300, dir: 1 }, { cx: 1620, dir: -1 }].map((k, i) => (
      <g key={i} transform={`translate(${k.cx} 60)`}>
        <path d={`M ${-70 * k.dir} 0 L ${90 * k.dir} 0 L ${110 * k.dir} 620 L ${-50 * k.dir} 620 Z`}
          fill="#CBD8DE" stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
          {[0, 1, 2].map((j) => (
            <line key={j} x1={(-40 + j * 44) * k.dir} y1={10} x2={(-26 + j * 48) * k.dir} y2={612} />
          ))}
        </g>
      </g>
    ))}
    {/* 手前に1人の生徒の背中 */}
    <g>
      <PersonMini x={960} y={1080} s={2.4} color={C.indigo} face="none" f={f} />
    </g>
    <QMark x={1270} y={830} s={0.72} f={f} t={seg(f, 14, 28)} color={C.vermil} />
    <TagPlate x={320} y={790} text="まわりとの比較" size={38} t={seg(f, 24, 38)} />
  </Frame>
);

// ------------------------------------------------------------------
// #180 「井の中の蛙効果」と呼ばれる現象があります。
// 格: 並 — 村はずれの井戸。石積み・桶・滑車・草。縁に小さな蛙。素直な井戸
// ------------------------------------------------------------------
const S180: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1079} bg={KRP.cream}>
    {/* 空と地面 */}
    <rect x={0} y={0} width={1920} height={560} fill={C.sky} />
    <rect x={0} y={560} width={1920} height={520} fill={C.grass} />
    <path d="M 0 560 Q 480 522 960 556 Q 1440 586 1920 548 L 1920 600 L 0 600 Z" fill={C.grassDark} opacity={0.55} />
    {/* 遠くの村 */}
    <g opacity={0.6}>
      {[[180, 0.8], [330, 0.62], [1700, 0.7]].map(([vx, vs], i) => (
        <g key={i} transform={`translate(${vx} 556) scale(${vs})`}>
          <rect x={-70} y={-120} width={140} height={120} fill={C.schoolDark} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -92 -120 L 0 -186 L 92 -120 Z" fill={C.bind} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        </g>
      ))}
    </g>
    {/* 草 */}
    <g stroke={C.grassDark} strokeWidth={6} strokeLinecap="round" opacity={0.85}>
      {Array.from({ length: 44 }, (_, i) => {
        const gx = 20 + ((i * 193) % 1880);
        const gy = 600 + ((i * 131) % 440);
        const s = 22 + ((i * 37) % 26);
        const w = Math.sin((f + i * 7) / 15) * 5;
        return (
          <g key={i}>
            <line x1={gx} y1={gy} x2={gx - 10 + w} y2={gy - s} />
            <line x1={gx + 10} y1={gy} x2={gx + 20 + w} y2={gy - s * 0.8} />
          </g>
        );
      })}
    </g>
    {/* 井戸 */}
    <Well x={880} y={640} s={1.5} f={f} />
    {/* 桶 */}
    <g transform="translate(1448 790)">
      <path d="M -74 -66 L 74 -66 L 58 50 L -58 50 Z" fill={C.perch} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-78} y={-72} width={156} height={20} rx={6} fill={C.bind} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -74 -40 L 74 -40" stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
      <path d="M -70 -80 A 70 54 0 0 1 70 -80" fill="none" stroke={KRP.ink} strokeWidth={7} />
    </g>
    {/* 縁の蛙 (手前の縁の上に座らせる) */}
    <Frog x={1016} y={690} s={0.62} f={f} />
    <TagPlate x={420} y={226} text="井の中の蛙効果" size={44} t={seg(f, 10, 24)} />
  </Frame>
);

// ------------------------------------------------------------------
// #181 同じ学力でも、優秀な集団に入った人のほうが、自分への自信が下がるのです。
// 格: 図 — 井戸が2つ並ぶ対比。同じ身長の蛙が小さい井戸では頭が出て大きい井戸では沈む
// ------------------------------------------------------------------
const S181: React.FC<{ f: number }> = ({ f }) => {
  const sink = easeOut(seg(f, 14, 36));
  return (
    <Frame f={f} seed={1080} bg={KRP.cream}>
      <rect x={0} y={0} width={1920} height={520} fill={C.sky} />
      <rect x={0} y={520} width={1920} height={560} fill={C.grass} />
      <path d="M 0 520 Q 520 492 960 518 Q 1400 544 1920 512 L 1920 560 L 0 560 Z" fill={C.grassDark} opacity={0.5} />
      <g stroke={C.grassDark} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
        {Array.from({ length: 26 }, (_, i) => {
          const gx = 30 + ((i * 311) % 1870);
          const gy = 580 + ((i * 97) % 420);
          return <line key={i} x1={gx} y1={gy} x2={gx - 8} y2={gy - 26} />;
        })}
      </g>
      {/* 小さい井戸 (頭が出る)。滑車は外して蛙を見せる */}
      <g>
        <Well x={520} y={600} s={1.0} f={f} frogY={-8} rig={false} />
        <Frog x={520} y={580} s={0.6} f={f} phase={1} />
      </g>
      {/* 大きい井戸 (沈む) */}
      <g>
        <Well x={1400} y={560} s={1.0} f={f} big frogY={110} rig={false} />
        <clipPath id="clipWell181">
          <rect x={1180} y={0} width={440} height={740} />
        </clipPath>
        <g clipPath="url(#clipWell181)">
          <Frog x={1400} y={lerp(600, 702, sink)} s={0.6} f={f} phase={5} />
          {/* 水面をかぶせて「沈む」を出す */}
          <ellipse cx={1400} cy={670} rx={179} ry={62} fill={C.water} opacity={0.6 * sink} />
          <ellipse cx={1400} cy={670} rx={179} ry={62} fill="none" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 同じ1本の物差し */}
      {[520, 1400].map((px, i) => (
        <g key={px} transform={`translate(${px + (i ? 300 : 210)} 520)`}>
          <rect x={-22} y={-200} width={44} height={320} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.7}>
            {Array.from({ length: 9 }, (_, k) => (
              <line key={k} x1={-22} y1={-180 + k * 36} x2={k % 2 ? -2 : 10} y2={-180 + k * 36} />
            ))}
          </g>
        </g>
      ))}
      {/* 同じ身長の印 */}
      <g opacity={seg(f, 24, 38)} stroke={C.vermil} strokeWidth={6} strokeDasharray="20 16">
        {/* 小さい井戸の蛙の頭の天ぺん (y=533) をかすめる高さ。目にかぶせない */}
        <line x1={300} y1={526} x2={1660} y2={526} />
      </g>
      <TagPlate x={520} y={222} text="小さい井戸" size={40} t={seg(f, 6, 18)} />
      <TagPlate x={1400} y={222} text="大きい井戸" size={40} t={seg(f, 16, 28)} color={C.vermil} />
      <TagPlate x={960} y={790} text="同じ学力" size={40} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #182 これは26カ国の調査で確認されています。
// 格: 図 — ノートに貼った世界地図。26本のピンが順に刺さり「26」まで数え上がる
// ------------------------------------------------------------------
const PINS_182 = Array.from({ length: 26 }, (_, i) => ({
  x: 340 + ((i * 457) % 1240),
  y: 300 + ((i * 269) % 340),
}));

const S182: React.FC<{ f: number }> = ({ f }) => {
  const prog = clamp01(seg(f, 4, 36));
  const n = Math.round(prog * 26);
  return (
    <Frame f={f} seed={1081} bg={KRP.cream}>
      <NoteSpread id="s182" x={140} y={170} w={1640} h={660} rule={false}>
        {/* 貼った世界地図 */}
        <g>
          <rect x={272} y={224} width={1380} height={440} rx={6} fill="#DCE8E2" stroke={KRP.ink} strokeWidth={7} />
          {/* 陸のかたち (抽象) */}
          <g fill={C.grass} stroke={KRP.ink} strokeWidth={5} opacity={0.9} strokeLinejoin="round">
            <path d="M 330 400 Q 400 310 510 330 Q 600 346 600 420 Q 596 500 500 520 Q 390 532 346 470 Z" />
            <path d="M 560 560 Q 600 520 664 548 Q 700 600 666 668 Q 620 710 584 660 Z" />
            <path d="M 800 320 Q 920 272 1040 318 Q 1110 350 1070 420 Q 980 470 870 430 Q 790 400 800 320 Z" />
            <path d="M 880 470 Q 960 456 1000 510 Q 1020 600 950 650 Q 886 646 870 570 Z" />
            <path d="M 1120 350 Q 1300 300 1440 356 Q 1540 400 1480 470 Q 1320 520 1180 462 Q 1100 420 1120 350 Z" />
            <path d="M 1400 580 Q 1480 552 1540 596 Q 1560 650 1490 672 Q 1420 660 1400 580 Z" />
          </g>
          {/* 経緯線 */}
          <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.22}>
            {[0, 1, 2, 3].map((i) => (
              <line key={`h${i}`} x1={272} y1={300 + i * 96} x2={1652} y2={300 + i * 96} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`v${i}`} x1={372 + i * 160} y1={224} x2={372 + i * 160} y2={664} />
            ))}
          </g>
          {/* 26本のピン */}
          {PINS_182.slice(0, n).map((p, i) => (
            <g key={i}>
              <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 40} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={p.x} cy={p.y - 48} r={13} fill={C.vermil} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
        </g>
      </NoteSpread>
      {/* 虫めがねと押しピン入れ */}
      <Magnifier x={252} y={918} s={0.68} rot={-34} />
      <g transform="translate(1736 926)">
        <rect x={-74} y={-54} width={148} height={108} rx={10} fill={C.steel} stroke={KRP.ink} strokeWidth={7} />
        <g fill={C.vermil} stroke={KRP.ink} strokeWidth={4}>
          {[[-40, -20], [-6, -26], [28, -16], [44, 10], [-24, 14], [8, 18]].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={11} />
          ))}
        </g>
      </g>
      {/* 数え上がる数 (地図の下。ピンに被らせない) */}
      <g>
        <rect x={810} y={690} width={300} height={124} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <text x={960} y={730} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>
          カ国
        </text>
        <text x={960} y={800} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={C.vermil}>
          {n}
        </text>
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #183 さらに、イギリスの約200万人を追いかけた研究があります。
// 格: 山 ★この章でいちばん重い事実 — 校庭いっぱいの子どもの大群が地平線まで続く
// ------------------------------------------------------------------
const S183: React.FC<{ f: number }> = ({ f }) => {
  const reveal = seg(f, 2, 34);
  // 近景の列 (PersonMini) と遠景の点の海
  // 字幕帯 (上端854) に手前の列が丸ごと沈まないよう、足元は 848 までに収める
  const rows = [
    { y: 848, s: 0.52, n: 15, c: C.indigo },
    { y: 800, s: 0.42, n: 18, c: KRP.gray },
    { y: 764, s: 0.34, n: 22, c: C.indigo },
    { y: 734, s: 0.28, n: 27, c: KRP.gray },
    { y: 710, s: 0.23, n: 32, c: C.indigo },
  ];
  return (
    <Frame f={f} seed={1082} bg={KRP.cream}>
      <SchoolYard f={f} groundY={560} />
      {/* 点の海 (地平線まで) */}
      <g opacity={0.72 * reveal}>
        {Array.from({ length: 460 }, (_, i) => {
          const row = Math.floor(i / 46);
          const col = i % 46;
          const yy = 570 + row * 12 + ((col * 7) % 5);
          const xx = 16 + col * 42 + ((row % 2) * 20) + ((i * 13) % 11);
          const r = 3 + row * 0.5;
          return <circle key={i} cx={xx} cy={yy} r={r} fill={row % 2 ? C.indigo : KRP.grayDark} opacity={0.55 + row * 0.04} />;
        })}
      </g>
      {/* 手前の列 */}
      {rows.map((r, ri) => (
        <g key={ri} opacity={clamp01(reveal * 2 - ri * 0.18)}>
          {Array.from({ length: r.n }, (_, i) => (
            <PersonMini key={i} x={40 + i * (1860 / r.n)} y={r.y} s={r.s}
              color={(i + ri) % 3 === 0 ? KRP.gray : r.c} f={f} phase={i * 3 + ri} />
          ))}
        </g>
      ))}
      {/* 手前の記録係の机 (観察者の態度) */}
      <g>
        <rect x={1366} y={792} width={520} height={34} rx={8} fill={C.labDeskDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1392} y={826} width={30} height={254} fill={C.labDesk} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1830} y={826} width={30} height={254} fill={C.labDesk} stroke={KRP.ink} strokeWidth={7} />
        {/* 台帳 */}
        <g transform="translate(1520 792) rotate(-3)">
          <rect x={-110} y={-24} width={220} height={24} rx={4} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.rule} strokeWidth={3} opacity={0.6}>
            <line x1={-92} y1={-14} x2={92} y2={-14} />
          </g>
        </g>
        <Pencil x={1760} y={782} rot={-8} s={0.32} />
      </g>
      {/* 縦に積む札は左端をそろえる (左端 254) */}
      <TagPlate x={364} y={214} text="イギリス" size={44} t={seg(f, 6, 18)} />
      <TagPlate x={420} y={330} text="約200万人" size={48} t={seg(f, 20, 34)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #184 学力が同じでも、小学校のクラス内で順位が高かった子は、のちの自信や進路まで違っていました。
// 格: 図 — ノートの上の分岐図。同じ点数の2人から道が2本に分かれ、先の高さが違う
// ------------------------------------------------------------------
const S184: React.FC<{ f: number }> = ({ f }) => {
  const go = easeOut(seg(f, 10, 38));
  const upEnd = { x: lerp(680, 1600, go), y: lerp(560, 318, go) };
  const dnEnd = { x: lerp(680, 1600, go), y: lerp(560, 672, go) };
  return (
    <Frame f={f} seed={1083} bg={KRP.cream}>
      <NoteSpread id="s184" x={130} y={160} w={1660} h={680} grid rule={false}>
        {/* 出発点: 同じ点数の2人 */}
        <g>
          <rect x={320} y={482} width={240} height={156} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <text x={440} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>同じ点数</text>
          <text x={440} y={608} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.vermil}>72</text>
        </g>
        <g transform="translate(248 640) scale(0.42)">
          <PersonMini x={0} y={0} s={1} color={C.indigo} f={f} phase={1} />
        </g>
        <g transform="translate(634 640) scale(0.42)">
          <PersonMini x={0} y={0} s={1} color={KRP.gray} f={f} phase={5} />
        </g>
        {/* 2本の道 */}
        <g fill="none" strokeWidth={13} strokeLinecap="round">
          <path d={`M 580 540 Q 1060 ${lerp(540, 330, go)} ${upEnd.x} ${upEnd.y}`} stroke={C.vermil} opacity={0.92} />
          <path d={`M 580 586 Q 1060 ${lerp(586, 664, go)} ${dnEnd.x} ${dnEnd.y}`} stroke={KRP.grayDark} opacity={0.9} />
        </g>
        {/* 道の先 */}
        <g opacity={clamp01(go * 2 - 0.9)}>
          <g transform={`translate(${upEnd.x + 60} ${upEnd.y + 50}) scale(0.52)`}>
            <PersonMini x={0} y={0} s={1} color={C.indigo} f={f} phase={2} arms="up" />
          </g>
          <g transform={`translate(${dnEnd.x + 60} ${dnEnd.y + 50}) scale(0.52)`}>
            <PersonMini x={0} y={0} s={1} color={KRP.gray} f={f} phase={8} />
          </g>
        </g>
        {/* 高さの差を示す縦線 */}
        <g opacity={clamp01(go * 2 - 1.1)} stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 12">
          <line x1={1596} y1={upEnd.y} x2={1596} y2={dnEnd.y} />
        </g>
        {/* クラス内の順位の札だけが違う */}
        <g opacity={clamp01(go * 1.6)}>
          <g transform="translate(830 404)">
            <rect x={-104} y={-42} width={208} height={84} rx={10} fill={KRP.white} stroke={C.vermil} strokeWidth={7} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.vermil}>3位</text>
          </g>
          <g transform="translate(830 710)">
            <rect x={-104} y={-42} width={208} height={84} rx={10} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={7} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.grayDark}>28位</text>
          </g>
        </g>
      </NoteSpread>
      {/* 字幕帯 (上端854) まで 65px 空ける。上げると右下の人と重なるので左へ逃がした */}
      <TagPlate x={1450} y={752} text="のちの自信や進路" size={34} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #185 テストの点そのものではなく、順位が、人生に影響していたのです。
// 格: 図 — ノートの上に2枚の札。「点数」は薄く「順位」だけが濃く人生の線につながる
// ------------------------------------------------------------------
const S185: React.FC<{ f: number }> = ({ f }) => {
  const fade = easeOut(seg(f, 8, 28));
  const line = easeOut(seg(f, 20, 40));
  return (
    <Frame f={f} seed={1084} bg={KRP.cream}>
      <NoteSpread id="s185" x={140} y={170} w={1640} h={664} rule>
        {/* 人生の線 (右へ伸びる太い線) */}
        <g>
          <path d="M 1000 560 Q 1280 560 1420 470 Q 1560 380 1700 388"
            fill="none" stroke={KRP.ink} strokeWidth={14} strokeLinecap="round"
            strokeDasharray={1100} strokeDashoffset={1100 * (1 - line)} opacity={0.85} />
          <g opacity={clamp01(line * 2 - 1.3)}>
            <circle cx={1700} cy={388} r={20} fill={C.vermil} stroke={KRP.ink} strokeWidth={6} />
          </g>
        </g>
        {/* 「点数」の札 (薄い。線につながらない) */}
        <g opacity={1 - fade * 0.72}>
          <g transform="translate(540 346) rotate(-4)">
            <rect x={-150} y={-62} width={300} height={124} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>点数</text>
          </g>
          <line x1={690} y1={372} x2={860} y2={444} stroke={KRP.ink} strokeWidth={8}
            strokeDasharray="16 14" opacity={0.5} />
        </g>
        {/* 「順位」の札 (濃い。線につながる) */}
        <g>
          <g transform="translate(540 640) rotate(3)">
            <rect x={-158} y={-66} width={316} height={132} rx={12} fill={KRP.white} stroke={C.vermil} strokeWidth={9} />
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={C.vermil}>順位</text>
          </g>
          <path d="M 706 630 Q 860 600 1000 562" fill="none" stroke={C.vermil} strokeWidth={12} strokeLinecap="round"
            opacity={clamp01(line * 2.2)} />
        </g>
        {/* 朱の丸 */}
        <g opacity={clamp01(line * 2 - 1)}>
          <circle cx={540} cy={640} r={198} fill="none" stroke={C.vermil} strokeWidth={8} opacity={0.6} />
        </g>
      </NoteSpread>
      <Clip x={1150} y={196} rot={5} s={1.1} />
      <TagPlate x={1500} y={272} text="人生に影響" size={40} t={seg(f, 30, 42)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #186 私たちの心は、絶対の量よりも、まわりとの差に強く反応するようにできている。
// 格: 山 ★この回の結論に直結する一文。画面いっぱいに作り込む
//
// ■なぜこの絵にしたか (前の版は「同じ量の皿が2つ+心の針」だった。差し替えた理由)
//  ・言いたいのは「中身が同じでも、まわり次第で感じ方が変わる」。
//    ところが同じ皿を2つ並べても、見た目は本当に同じなので何も起きない。
//    針が振れる理由を札で足すことになり、絵ではなく文字が説明していた。
//  ・だから、見る人の目が実際にだまされる見くらべを主役にした。
//    同じ大きさの円が、大きな円に囲まれると小さく、小さな円に囲まれると大きく見える。
//    画面を見た瞬間に、自分の心がまわりとの差に反応していることが自分で分かる。
//    = 絵そのものが説明になっている状態。
//  ・「本当に同じなのか」を絵の中で証明する。中心の円の半径は左右とも同じ定数 CORE_R から
//    描き、その上端と下端の高さにチョークの補助線を盤面の端から端まで1本ずつ渡した。
//    2本の線に両方の円がぴったり収まるので、言葉を足さなくても同じ大きさだと分かる。
//  ・朱の破線は「心が感じた大きさ」。実物 (白ふちの円) とのズレが、そのまま胸の針になる。
//    #187 でこの針に「全員一列の数直線」がつながるので、計器はここで出しておく。
//
// ■なぜ教室 (黒板) にしたか
//  ・前が #185 ノートの見開き (机の上)・次が #187 校庭の夕方。舞台を3枚続けないため。
//    設計書の持ち場は「校庭と校舎」なので、校舎の中である教室は章の外に出ていない。
//  ・見くらべは正面から平らに見せないと効かない。かといって図を宙に浮かせると
//    ワークシートの挿絵になる (第16条)。そこで「この世界の中にある平らな面」=
//    先生が黒板に描いた図、という形にした。木枠・チョーク受け・消し残り・前の授業の跡で
//    盤面の素のベタ地をつぶしてある。
//  ・#187 は人が左・装置が右。かぶらないよう、こちらは図が左・人が右の逆配置にした。
// ------------------------------------------------------------------

// 教室の色 (#186 専用)
const CLS = {
  board: "#2F4039",
  boardDeep: "#25332D",
  chalk: "#F4F1E4",
  dado: "#B99A6E",
  floor: "#C8A77C",
  floorDark: "#A98659",
  desk: "#D9C095",
};

// 中心の円の半径。★左右で同じ値を使うことがこの絵の主張そのものなので、
// 定数を1つだけ置いて両方に渡す (片方の数字を書き換えると絵が嘘になる)。
const CORE_R = 56;

// --- 黒板 (木枠・チョーク受け・チョーク・消し残り・前の授業の跡・留め具) ---
const ChalkBoard: React.FC<{
  f: number; x: number; y: number; w: number; h: number; children?: React.ReactNode;
}> = ({ f, x, y, w, h, children }) => {
  const FR = 24; // 木枠の太さ
  const drift = Math.sin(f / 11) * 3;
  return (
    <g>
      {/* 木枠 */}
      <rect x={x - FR} y={y - FR} width={w + FR * 2} height={h + FR * 2} rx={10}
        fill={C.bind} stroke={KRP.ink} strokeWidth={9} />
      <rect x={x - FR / 2} y={y - FR / 2} width={w + FR} height={h + FR} rx={6}
        fill="none" stroke={C.labDeskDark} strokeWidth={5} opacity={0.55} />
      {/* 盤面 */}
      <rect x={x} y={y} width={w} height={h} fill={CLS.board} stroke={KRP.ink} strokeWidth={7} />
      <clipPath id="clipBoard186">
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath="url(#clipBoard186)">
        {/* 盤面の質感 (まんなかは擦れて明るく、下は濃い) */}
        <ellipse cx={x + w * 0.5} cy={y + h * 0.44} rx={w * 0.46} ry={h * 0.42}
          fill={CLS.chalk} opacity={0.05} />
        <rect x={x} y={y + h * 0.74} width={w} height={h * 0.26} fill={CLS.boardDeep} opacity={0.5} />
        {/* 黒板消しの消し残り (弧) */}
        <g fill="none" stroke={CLS.chalk} strokeWidth={34} opacity={0.06} strokeLinecap="round">
          <path d={`M ${x + 70} ${y + h - 86} q 190 -74 370 -4`} />
          <path d={`M ${x + w - 440} ${y + h - 60} q 210 -86 410 -12`} />
          <path d={`M ${x + 110} ${y + 128} q 150 -62 300 8`} />
        </g>
        {/* 前の授業の字の跡 (右上に薄く残る) */}
        <g stroke={CLS.chalk} strokeWidth={6} opacity={0.11} strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={x + w - 240} y1={y + 42 + i * 26}
              x2={x + w - 240 + 160 - i * 36} y2={y + 40 + i * 26} />
          ))}
        </g>
        {children}
      </g>
      {/* チョーク受け (チョーク3本と黒板消し) */}
      <g>
        <rect x={x - FR} y={y + h + FR} width={w + FR * 2} height={30} rx={6}
          fill={C.perch} stroke={KRP.ink} strokeWidth={8} />
        <rect x={x - FR} y={y + h + FR} width={w + FR * 2} height={9} fill={C.labDeskDark} opacity={0.5} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={x + 34 + i * 30} y={y + h + FR + 7} width={22} height={13} rx={5}
            fill={CLS.chalk} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <g transform={`translate(${x + 156} ${y + h + FR + 3})`}>
          <rect x={0} y={0} width={96} height={13} rx={4} fill={C.bind} stroke={KRP.ink} strokeWidth={5} />
          <rect x={4} y={11} width={88} height={13} rx={3} fill={CLS.chalk} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        </g>
        {/* 受けにたまったチョークの粉 (わずかに舞う) */}
        <g fill={CLS.chalk} opacity={0.45}>
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={x + 48 + i * 42} r={2.4 + (i % 3) * 0.8}
              cy={y + h + FR + 42 + ((i * 7) % 8) + (i % 2 ? drift : -drift)} />
          ))}
        </g>
      </g>
      {/* 四隅の留め具 */}
      <g fill={C.steel} stroke={KRP.ink} strokeWidth={4}>
        {[[x - FR / 2, y - FR / 2], [x + w + FR / 2, y - FR / 2],
          [x - FR / 2, y + h + FR / 2], [x + w + FR / 2, y + h + FR / 2]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={9} />
        ))}
      </g>
    </g>
  );
};

// --- 黒板に描いた「まわりに囲まれた円」1組 (#186 の主役) ---
// 左右で変えるのは囲みの大きさだけ。中心の円は CORE_R で固定なので、
// 左右の中心が同じ大きさであることはコードの上でも保証されている。
const ChalkRing: React.FC<{
  cx: number; cy: number;
  ringR: number;     // 囲む円が並ぶ半径
  dotR: number;      // 囲む円の半径 (左は大きく・右は小さく)
  n: number;         // 囲む円の数
  draw: number;      // 囲む円が1つずつ描かれていく進み
  feel: number;      // 「感じた大きさ」が出てくる進み
  feelScale: number; // 実物の何倍に感じるか (1より小=小さく感じる)
  f: number;
}> = ({ cx, cy, ringR, dotR, n, draw, feel, feelScale, f }) => {
  const ft = easeOut(clamp01(feel));
  const fr = CORE_R * (1 + (feelScale - 1) * ft); // 実物 → 感じた大きさ へ伸び縮み
  const grow = feelScale > 1;
  const breathe = Math.sin(f / 13) * 1.6; // 感じ方は一定ではないので、わずかに息をさせる
  return (
    <g>
      {/* 囲む円 (塗らない。塗ってしまうと中心が主役でなくなる) */}
      {Array.from({ length: n }, (_, i) => {
        const t = pop(clamp01(draw * n - i));
        if (t <= 0) return null;
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={i} transform={`translate(${cx + Math.cos(a) * ringR} ${cy + Math.sin(a) * ringR}) scale(${t})`}>
            <circle cx={0} cy={0} r={dotR} fill={CLS.chalk} opacity={0.09} />
            <circle cx={0} cy={0} r={dotR} fill="none" stroke={CLS.chalk} strokeWidth={9} opacity={0.9} />
            {/* チョークのかすれ (内側にもう1本ずらして重ねる) */}
            <circle cx={1.5} cy={-2} r={dotR - 4} fill="none" stroke={CLS.chalk} strokeWidth={3.5}
              opacity={0.3} strokeDasharray="26 18" />
          </g>
        );
      })}
      {/* 中心の円 = 中身 (★左右で同じ半径) */}
      <circle cx={cx} cy={cy} r={CORE_R} fill={C.lampGlow} stroke={CLS.chalk} strokeWidth={9} />
      <circle cx={cx} cy={cy} r={CORE_R - 14} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.4} />
      {/* 心が感じた大きさ (朱の破線) と、実物からのズレの向き */}
      <g opacity={clamp01(feel * 1.8)}>
        <circle cx={cx} cy={cy} r={fr + breathe} fill="none" stroke={C.vermil} strokeWidth={8}
          strokeDasharray="22 16" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2;
          const ux = Math.cos(a);
          const uy = Math.sin(a);
          // 矢は必ず「実物のふち」から「感じた大きさ」へ向かう。囲む円には届かせない
          const d0 = grow ? CORE_R - 6 : CORE_R + 12;
          const d1 = grow ? Math.min(fr + 18, ringR - dotR - 10) : fr - 12;
          const deg = (Math.atan2(uy, ux) * 180) / Math.PI + (grow ? 0 : 180);
          return (
            <g key={i}>
              <line x1={cx + ux * d0} y1={cy + uy * d0} x2={cx + ux * d1} y2={cy + uy * d1}
                stroke={C.vermil} strokeWidth={7} strokeLinecap="round" />
              <polygon points="0,0 -20,-11 -20,11" fill={C.vermil}
                transform={`translate(${cx + ux * d1} ${cy + uy * d1}) rotate(${deg})`} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// --- 教室 (壁・腰壁・窓・外の木・床・差し込む光)。#186 専用 ---
const Classroom: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 19) * 4;
  const FLOOR = 790;
  return (
    <g>
      {/* 壁 */}
      <rect x={0} y={0} width={1920} height={FLOOR} fill={C.school} />
      <g stroke={C.schoolDark} strokeWidth={4} opacity={0.32}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={0} y1={152 + i * 232} x2={1920} y2={146 + i * 232} />
        ))}
      </g>
      {/* 腰壁 (黒板の右側だけ見える。板の継ぎ目を入れて素のベタ地にしない) */}
      <rect x={1340} y={616} width={580} height={FLOOR - 616} fill={CLS.dado} />
      <g stroke={C.labDeskDark} opacity={0.4}>
        <line x1={1340} y1={620} x2={1920} y2={620} strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1420 + i * 156} y1={624} x2={1420 + i * 156} y2={FLOOR} strokeWidth={5} />
        ))}
      </g>
      {/* 窓 + 外の木と校舎の棟 */}
      <g transform="translate(1434 126)">
        <rect x={-14} y={-14} width={428} height={316} rx={8} fill={C.bind} stroke={KRP.ink} strokeWidth={9} />
        <rect x={0} y={0} width={400} height={288} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />
        <rect x={196} y={198} width={186} height={90} fill={C.school} opacity={0.7} />
        <rect x={92 + sway * 0.2} y={150} width={22} height={138} fill={C.perch} opacity={0.8} />
        <ellipse cx={104 + sway} cy={140} rx={86} ry={64} fill={C.tree} opacity={0.72} />
        <ellipse cx={288 - sway} cy={172} rx={66} ry={50} fill={C.tree} opacity={0.55} />
        <rect x={0} y={0} width={400} height={288} fill={KRP.white} opacity={0.13} />
        <g stroke={KRP.ink} strokeWidth={7}>
          <line x1={200} y1={0} x2={200} y2={288} />
          <line x1={0} y1={144} x2={400} y2={144} />
        </g>
        <rect x={0} y={0} width={400} height={288} fill="none" stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 床 */}
      <rect x={0} y={FLOOR} width={1920} height={1080 - FLOOR} fill={CLS.floor} />
      <rect x={0} y={FLOOR - 10} width={1920} height={14} fill={CLS.floorDark} />
      <g stroke={CLS.floorDark} opacity={0.42}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={0} y1={FLOOR + 42 + i * 94} x2={1920} y2={FLOOR + 32 + i * 94} strokeWidth={5} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={`v${i}`} x1={140 + i * 338} y1={FLOOR} x2={80 + i * 380} y2={1080} strokeWidth={3} />
        ))}
      </g>
      {/* 窓から差し込む光 (壁と床をまたいで落ちる) */}
      <path d="M 1420 428 L 1848 428 L 1614 904 L 1096 904 Z" fill={C.lampGlow} opacity={0.15} />
    </g>
  );
};

const S186: React.FC<{ f: number }> = ({ f }) => {
  // 盤面の内側の寸法
  const BX = 78;
  const BY = 72;
  const BW = 1268;
  const BH = 628;
  const CY = 330;  // 見くらべの高さ (下に札を置く余白を残して盤面の中央より上)
  const LX = 430;  // まわりが大きい側
  const RX = 1040; // まわりが小さい側
  // 補助線は盤面の端から端まで。中心の円の上端と下端の高さにぴったり渡す
  const GL = BX + 22;
  const GR = BX + BW - 22;

  const core = easeOut(seg(f, 2, 12)); // ①同じ大きさの円2つと補助線を先に見せる
  const drawL = seg(f, 12, 22);        // ②左の囲みを描く
  const drawR = seg(f, 20, 30);        // ③右の囲みを描く
  const feel = seg(f, 28, 40);         // ④囲み終わった瞬間に、感じ方がズレる = 事件
  const needle = easeOut(seg(f, 26, 40));
  // ⑤カメラ: 見くらべの図だけ、ほんのり寄っていく (札は図の外なので位置を動かさない)
  const camS = lerp(0.93, 1, easeOut(seg(f, 2, 28)));
  const camX = 735 * (1 - camS);
  const camY = CY * (1 - camS);

  return (
    <Frame f={f} seed={1085} bg={KRP.cream}>
      <Classroom f={f} />
      <ChalkBoard f={f} x={BX} y={BY} w={BW} h={BH}>
        <g transform={`translate(${camX} ${camY}) scale(${camS})`}>
          {/* 同じ大きさだと証明する補助線2本 (中心の円の上端・下端の高さ) */}
          <g stroke={CLS.chalk} strokeWidth={4} opacity={0.55} strokeDasharray="20 16">
            <line x1={GL} y1={CY - CORE_R} x2={lerp(GL, GR, core)} y2={CY - CORE_R} />
            <line x1={GL} y1={CY + CORE_R} x2={lerp(GL, GR, core)} y2={CY + CORE_R} />
          </g>
          {/* 左: まわりが大きい → 中心が小さく感じる */}
          <ChalkRing cx={LX} cy={CY} ringR={170} dotR={64} n={6}
            draw={drawL} feel={feel} feelScale={0.74} f={f} />
          {/* 右: まわりが小さい → 中心が大きく感じる */}
          <ChalkRing cx={RX} cy={CY} ringR={124} dotR={23} n={8}
            draw={drawR} feel={feel} feelScale={1.34} f={f} />
          {/* 2つのあいだの「=」(中身は等しい) */}
          <g opacity={core} fill={CLS.chalk} stroke={KRP.ink} strokeWidth={3}>
            <rect x={740} y={CY - 26} width={76} height={15} rx={5} />
            <rect x={740} y={CY + 11} width={76} height={15} rx={5} />
          </g>
          {/* 先生の書き込み (黒板の中の文字なので札にはしない) */}
          <text x={778} y={448} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={36} fill={CLS.chalk} opacity={0.82 * core}
            transform="rotate(-1.5 778 448)">実際は同じ</text>
        </g>
      </ChalkBoard>
      {/* 見ている生徒 (図の反対側に置く)。胸の計器を字幕帯の上に出すため足元は 910・頭の下端は 697 */}
      <Person x={1640} y={910} s={1.3} cloth={C.indigo} clothDark="#2C4160" face="surprised"
        pose="point" pointDir={-1} f={f} gaze={[-3, 0]} />
      {/* 胸の計器 (頭の下端 697 より下・字幕帯 854 より上)。ズレの大きさがそのまま針になる */}
      <HeartMeter x={1640} y={772} s={0.62} needle={0.1 + needle * 0.88} f={f} />
      {/* 手前の机と椅子 (字幕帯より上に見える帯だけに置いて、教室だと一目で分かるようにする) */}
      <g>
        <rect x={20} y={800} width={600} height={34} rx={8} fill={CLS.desk} stroke={KRP.ink} strokeWidth={8} />
        <rect x={20} y={830} width={600} height={11} fill={C.labDeskDark} opacity={0.45} />
        <rect x={78} y={838} width={26} height={160} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <rect x={540} y={838} width={26} height={160} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1120} y={766} width={210} height={30} rx={12} fill={C.perch} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1130} y={794} width={22} height={200} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1298} y={794} width={22} height={200} fill={C.perch} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 左右で見くらべる1対の札なので高さは同じ (y=628)。字幕にない「感じ方」だけを足す */}
      <TagPlate x={LX} y={628} text="小さく感じる" size={38} t={seg(f, 32, 42)} color={C.vermil} />
      <TagPlate x={RX} y={628} text="大きく感じる" size={38} t={seg(f, 34, 42)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #187 その心に、人類は「全員一列の数直線」という装置をつないでしまいました。
// 格: 山 ★章の締め = 次章への橋 — 胸の計器に「全員一列の数直線」の装置が接続される
// ------------------------------------------------------------------
const S187: React.FC<{ f: number }> = ({ f }) => {
  const plug = easeOut(seg(f, 8, 28));
  const over = easeOut(seg(f, 28, 40));
  const spin = f * 3.6;
  return (
    <Frame f={f} seed={1086} bg={KRP.cream}>
      <SchoolYard f={f} groundY={600} evening />
      {/* 夕方の光 */}
      <ellipse cx={1500} cy={300} rx={420} ry={300} fill={C.lampGlow} opacity={0.26} />
      {/* 人 (左) */}
      {/* 胸の計器を字幕帯の上に出すため、足元は 912。頭の下端は 692 */}
      <Person x={470} y={912} s={1.34} cloth={C.indigo} clothDark="#2C4160" face="surprised"
        pose="stand" f={f} gaze={[1, 0]} />
      {/* 装置 (右: 歯車 + 目盛りの機械) */}
      <g transform="translate(1340 640)">
        <rect x={-300} y={-220} width={600} height={400} rx={18} fill={C.bind} stroke={KRP.ink} strokeWidth={10} />
        <rect x={-266} y={-186} width={532} height={332} rx={12} fill={C.perch} stroke={KRP.ink} strokeWidth={7} />
        {/* 歯車 */}
        {[{ cx: -150, cy: -70, r: 78, n: 11, d: 1 }, { cx: 10, cy: 10, r: 58, n: 9, d: -1 }, { cx: 160, cy: -80, r: 66, n: 10, d: 1 }].map((g, gi) => (
          <g key={gi} transform={`translate(${g.cx} ${g.cy}) rotate(${spin * g.d})`}>
            {Array.from({ length: g.n }, (_, i) => {
              const a = (i / g.n) * Math.PI * 2;
              return (
                <rect key={i} x={-14} y={-14} width={28} height={28} rx={5} fill={C.brass} stroke={KRP.ink} strokeWidth={5}
                  transform={`translate(${Math.cos(a) * g.r} ${Math.sin(a) * g.r}) rotate(${(a * 180) / Math.PI})`} />
              );
            })}
            <circle cx={0} cy={0} r={g.r - 10} fill={C.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={0} r={g.r * 0.3} fill={C.brassDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 目盛り (全員一列の数直線) */}
        <g transform="translate(0 110)">
          <line x1={-240} y1={0} x2={240} y2={0} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          <g stroke={KRP.ink} strokeWidth={5}>
            {Array.from({ length: 13 }, (_, i) => (
              <line key={i} x1={-240 + i * 40} y1={-4} x2={-240 + i * 40} y2={i % 4 === 0 ? -30 : -18} />
            ))}
          </g>
          {Array.from({ length: 11 }, (_, i) => (
            <circle key={i} cx={-220 + i * 44} cy={20} r={9} fill={C.indigo} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
      </g>
      {/* コード (装置 → 胸) */}
      <g>
        <path
          d={`M 1040 660 Q ${lerp(900, 820, plug)} ${lerp(880, 820, plug)} ${lerp(860, 548, plug)} ${lerp(830, 778, plug)}`}
          fill="none" stroke={KRP.ink} strokeWidth={14} strokeLinecap="round"
        />
        <circle cx={lerp(860, 548, plug)} cy={lerp(830, 778, plug)} r={18} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 胸の計器 (針が振り切れる)。顔にかぶせない (頭の下端 692 より下・字幕帯 854 より上) */}
      <HeartMeter x={470} y={772} s={0.64} needle={0.3 + over * 1.3} f={f} />
      {/* 振り切れの線 (計器の右上。頭の円 r=86 の外を通す) */}
      <g opacity={over * 0.8} stroke={C.vermil} strokeWidth={7} strokeLinecap="round">
        {[0, 1, 2].map((i) => (
          <line key={i} x1={538 + i * 10} y1={712 - i * 20} x2={578 + i * 16} y2={684 - i * 28} />
        ))}
      </g>
      {/* 左の「心」と右の「全員一列の数直線」は見くらべる札なので高さをそろえる (y=286) */}
      <TagPlate x={1340} y={286} text="全員一列の数直線" size={40} t={seg(f, 18, 30)} color={C.vermil} />
      <TagPlate x={470} y={286} text="心" size={46} t={seg(f, 6, 18)} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib9_s163:                  (f) => <S163 f={f} />,
  ib9_s164:                  (f) => <S164 f={f} />,
  ib9_s165:                  (f) => <S165 f={f} />,
  ib9_s166:                  (f) => <S166 f={f} />,
  ib9_s167:                  (f) => <S167 f={f} />,
  ib9_s168:                  (f) => <S168 f={f} />,
  ib9_s169:                  (f) => <S169 f={f} />,
  ib9_s170:                  (f) => <S170 f={f} />,
  ib9_s171:                  (f) => <S171 f={f} />,
  ib9_s172:                  (f) => <S172 f={f} />,
  ib9_s173:                  (f) => <S173 f={f} />,
  ib9_s174:                  (f) => <S174 f={f} />,
  ib9_s175:                  (f) => <S175 f={f} />,
  ib9_s176:                  (f) => <S176 f={f} />,
  ib9_s177:                  (f) => <S177 f={f} />,
  ib9_s178:                  (f) => <S178 f={f} />,
  ib9_s179:                  (f) => <S179 f={f} />,
  ib9_s180:                  (f) => <S180 f={f} />,
  ib9_s181:                  (f) => <S181 f={f} />,
  ib9_s182:                  (f) => <S182 f={f} />,
  ib9_s183:                  (f) => <S183 f={f} />,
  ib9_s184:                  (f) => <S184 f={f} />,
  ib9_s185:                  (f) => <S185 f={f} />,
  ib9_s186:                  (f) => <S186 f={f} />,
  ib9_s187:                  (f) => <S187 f={f} />,
};

export const I_B9_MOTIFS: string[] = [
  "ib9_s163",                  // #163 第9章、なぜ順位は、こんなに刺さるのか。
  "ib9_s164",                  // #164 ここからは、順位がこれほど心に効く理由を、科学の目で見ていきます。
  "ib9_s165",                  // #165 まず、「序列なんて自然界にもあるのでは?」という疑問から。
  "ib9_s166",                  // #166 あります。1922年、ノルウェーの研究者が、ニワトリの「つつき順位」を発表しました。
  "ib9_s167",                  // #167 誰が誰をつついてよいか、群れの中に力関係の順序があるという発見です。
  "ib9_s168",                  // #168 ただし、よく観察すると、面白いことがわかります。
  "ib9_s169",                  // #169 AはBに強く、BはCに強い。なのに、CがAに強い。
  "ib9_s170",                  // #170 そんな三すくみが、普通に起きるのです。
  "ib9_s171",                  // #171 つまり動物の序列は「相手ごとの力関係」の集まりで、全員を並べた一覧表ではありません。
  "ib9_s172",                  // #172 全員を1本の数直線に並べて貼り出すのは、やはり人間の発明なのです。
  "ib9_s173",                  // #173 次に、比べずにいられない心のほうを見てみます。
  "ib9_s174",                  // #174 オマキザルというサルに、簡単な仕事をさせて、ご褒美を渡す実験があります。
  "ib9_s175",                  // #175 隣のサルは、おいしいブドウ。自分だけ、キュウリ。
  "ib9_s176",                  // #176 すると、キュウリの受け取りを拒否し始めるのです。
  "ib9_s177",                  // #177 さっきまで、喜んで食べていた、同じキュウリをです。
  "ib9_s178",                  // #178 ご褒美の量ではなく「隣と比べてどうか」に反応する心は、サルにもありました。
  "ib9_s179",                  // #179 では人間の場合、まわりとの比較はどれくらい効くのでしょうか。
  "ib9_s180",                  // #180 「井の中の蛙効果」と呼ばれる現象があります。
  "ib9_s181",                  // #181 同じ学力でも、優秀な集団に入った人のほうが、自分への自信が下がるのです。
  "ib9_s182",                  // #182 これは26カ国の調査で確認されています。
  "ib9_s183",                  // #183 さらに、イギリスの約200万人を追いかけた研究があります。
  "ib9_s184",                  // #184 学力が同じでも、小学校のクラス内で順位が高かった子は、のちの自信や進路まで違っていました。
  "ib9_s185",                  // #185 テストの点そのものではなく、順位が、人生に影響していたのです。
  "ib9_s186",                  // #186 私たちの心は、絶対の量よりも、まわりとの差に強く反応するようにできている。
  "ib9_s187",                  // #187 その心に、人類は「全員一列の数直線」という装置をつないでしまいました。
];

export const ichiB9Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B9_PREVIEW_FRAMES = Math.max(I_B9_MOTIFS.length, 1);
export const IchiB9Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B9_MOTIFS.length - 1);
  return <>{ichiB9Scene(I_B9_MOTIFS[i] ?? "", 45)}</>;
};
