// 「『2位』は、120年前に発明された」: 第6章「2位が発明された日。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#103〜#122 (20文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで20枚。
// motif 名は必ず ib6_ で始める。WobbleDefs の seed はこのファイルでは 1002〜1021 を使う。
// 設計書: docs/briefs/IchiB6.md (1文ごとの「格」と絵の中身を決めてから描く)
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
// このファイルだけで使う色 (競技場・博物館・図面・式典会場)
// ===================================================================
const C = {
  ink: "#3A3A34",
  sky: "#CFE0E6",
  skyDeep: "#AEC7D1",
  cloud: "#F2F4F2",
  hill: "#9FA98C",
  marble: "#E4DDCC",
  marbleDark: "#C8BFA8",
  marbleLine: "#A89E89",
  soil: "#B99C6E",
  soilDark: "#9A7C50",
  track: "#C08B5C",
  trackDark: "#A06F45",
  gold: "#D9A93E",
  goldDark: "#A87E22",
  silver: "#AEB4BC",
  silverDark: "#848C96",
  bronze: "#A9744B",
  bronzeDark: "#835733",
  ribbon: "#5A6E8C",
  ribbonDark: "#3C4D66",
  museumWall: "#B9B9A4",
  museumWallDark: "#9B9B86",
  pedestal: "#8E8775",
  pedestalDark: "#6D6757",
  museumFloor: "#7E7869",
  paper: "#EAE7D6",
  paperEdge: "#CFC8AE",
  desk: "#6E5436",
  deskDark: "#53402A",
  curtain: "#A8333A",
  curtainDark: "#7A2027",
  carpet: "#7B4A4E",
  carpetDark: "#593337",
  night: "#2B2932",
  nightDeep: "#1A1920",
  wood: "#B98A50",
  woodDark: "#8A6436",
  snow: "#EDF1F4",
  snowShade: "#D1DBE2",
  olive: "#7E9459",
  oliveDark: "#5C7340",
  stone: "#B7AF9C",
  stoneDark: "#948C79",
  red: "#B4473F",
  lamp: "#E8C068",
};

void Stamp;

// 帯 (すり鉢状の段) を描くための共通の形。中央がたれ下がる
const band = (y: number, h: number, sag: number) =>
  `M -20 ${y} Q 960 ${y + sag} 1940 ${y} L 1940 ${y + h} Q 960 ${y + sag + h} -20 ${y + h} Z`;
const arc = (y: number, sag: number) => `M -20 ${y} Q 960 ${y + sag} 1940 ${y}`;

// ===================================================================
// 第16条の「床」その1 — 大理石の競技場 (1896 / 1904 / 1930 で色味だけ変える)
// ===================================================================
const Stadium: React.FC<{
  f: number; year?: "1896" | "1904" | "1930" | "ancient"; flags?: boolean;
}> = ({ f, year = "1896", flags = false }) => {
  const t =
    year === "1930" ? { sky: "#BFD0DA", seat: "#CEC7B5", track: "#B07C4A", soil: "#AD9068" }
      : year === "1904" ? { sky: "#D4E1DE", seat: "#DCD4C0", track: "#BE8A5A", soil: "#B99C6E" }
        : year === "ancient" ? { sky: "#DCDCC6", seat: "#C3B994", track: "#B49565", soil: "#A98D5F" }
          : { sky: C.sky, seat: C.marble, track: C.track, soil: C.soil };
  const rows = [0, 1, 2, 3, 4, 5, 6];
  return (
    <g>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={340} fill={t.sky} />
      <rect x={0} y={0} width={W} height={120} fill={C.skyDeep} opacity={0.3} />
      {[[300, 120, 150], [900, 86, 110], [1520, 134, 170]].map(([cx, cy, rx], i) => (
        <g key={i} opacity={0.75}>
          <ellipse cx={cx + Math.sin((f + i * 40) / 90) * 14} cy={cy} rx={rx} ry={rx * 0.42} fill={C.cloud} />
          <ellipse cx={cx + 70 + Math.sin((f + i * 40) / 90) * 14} cy={cy + 14} rx={rx * 0.6} ry={rx * 0.3} fill={C.cloud} />
        </g>
      ))}
      {/* 遠くの丘 */}
      <path d="M -20 330 Q 360 236 760 312 Q 1180 230 1560 304 Q 1760 330 1940 300 L 1940 360 L -20 360 Z" fill={C.hill} opacity={0.5} />
      {/* すり鉢状の観客席 (大理石の段) */}
      {rows.map((r) => {
        const y = 288 + r * 36;
        return (
          <g key={r}>
            <path d={band(y, 36, 34 - r * 2)} fill={r % 2 ? t.seat : C.marbleDark} opacity={r % 2 ? 1 : 0.55} />
            <path d={arc(y, 34 - r * 2)} stroke={C.marbleLine} strokeWidth={2.5} fill="none" opacity={0.6} />
          </g>
        );
      })}
      {/* 通路 (段を縦に切る階段) */}
      {[200, 620, 1300, 1720].map((px) => (
        <g key={px} opacity={0.4}>
          <path d={`M ${px} 288 L ${px + 14} 544`} stroke={C.marbleLine} strokeWidth={9} fill="none" />
        </g>
      ))}
      {/* 手すり壁 */}
      <path d={band(540, 36, 22)} fill={C.marbleDark} />
      <path d={arc(540, 22)} stroke={C.marbleLine} strokeWidth={4} fill="none" opacity={0.7} />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1={i * 82} y1={544} x2={i * 82} y2={574} stroke={C.marbleLine} strokeWidth={2} opacity={0.45} />
      ))}
      {/* 土のフィールド */}
      <path d={band(574, 126, 20)} fill={t.soil} />
      {Array.from({ length: 26 }).map((_, i) => (
        <ellipse key={i} cx={((i * 157) % 20) * 98 + 24} cy={600 + ((i * 61) % 4) * 30} rx={30} ry={8} fill={C.soilDark} opacity={0.17} />
      ))}
      {/* トラック */}
      <path d={`M -20 696 Q 960 716 1940 696 L 1940 1100 L -20 1100 Z`} fill={t.track} />
      <path d={arc(698, 20)} stroke="#F4F1E6" strokeWidth={8} fill="none" opacity={0.85} />
      {[772, 844, 922, 1006].map((ly, i) => (
        <path key={ly} d={arc(ly, 18 - i * 3)} stroke="#F4F1E6" strokeWidth={6} fill="none" opacity={0.6} />
      ))}
      {Array.from({ length: 34 }).map((_, i) => (
        <ellipse key={i} cx={((i * 211) % 20) * 99 + 18} cy={730 + ((i * 47) % 7) * 48} rx={22 + (i % 3) * 8} ry={6} fill={C.trackDark} opacity={0.2} />
      ))}
      {/* 万国旗 */}
      {flags && (
        <g>
          {[0, 1].map((k) => {
            const y0 = 34 + k * 56;
            return (
              <g key={k}>
                <path d={`M -10 ${y0} Q 960 ${y0 + 76} 1930 ${y0}`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.7} />
                {Array.from({ length: 16 }).map((_, i) => {
                  const u = (i + 0.5) / 16;
                  const fx = -10 + u * 1940;
                  const fy = y0 + 4 * 76 * u * (1 - u) * 0.98;
                  const col = ["#B4473F", "#D9A93E", "#5A6E8C", "#7E9459", "#CFC9B4"][(i + k * 2) % 5];
                  return (
                    <g key={i} transform={`translate(${fx} ${fy}) rotate(${Math.sin((f + i * 13) / 17) * 7})`}>
                      <path d="M 0 0 L 26 4 L 26 44 L 0 38 Z" fill={col} stroke={C.ink} strokeWidth={2.5} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 第16条の「床」その2 — 博物館の展示壁 (メダルを置く床)
// ===================================================================
const VitrineWall: React.FC<{ f: number; spots?: number[] }> = ({ f, spots = [620, 1320] }) => (
  <g>
    <rect x={0} y={0} width={W} height={986} fill={C.museumWall} />
    {/* 壁パネルの継ぎ目 */}
    {[0, 480, 960, 1440, 1920].map((px) => (
      <line key={px} x1={px} y1={0} x2={px} y2={986} stroke={C.museumWallDark} strokeWidth={3} opacity={0.5} />
    ))}
    <rect x={0} y={0} width={W} height={126} fill={C.museumWallDark} opacity={0.45} />
    <rect x={0} y={126} width={W} height={12} fill={C.museumWallDark} opacity={0.8} />
    <rect x={0} y={900} width={W} height={86} fill={C.museumWallDark} opacity={0.4} />
    <rect x={0} y={900} width={W} height={10} fill={C.museumWallDark} opacity={0.8} />
    {/* 壁の斑 */}
    {Array.from({ length: 30 }).map((_, i) => (
      <ellipse key={i} cx={((i * 173) % 19) * 101 + 40} cy={180 + ((i * 59) % 7) * 102} rx={34} ry={18} fill={C.museumWallDark} opacity={0.12} />
    ))}
    {/* スポットライトの光 */}
    {spots.map((sx, i) => (
      <g key={sx} opacity={0.5}>
        <polygon points={`${sx - 34},130 ${sx + 34},130 ${sx + 250},986 ${sx - 250},986`} fill="#FFF8E0" opacity={0.24} />
        <ellipse cx={sx} cy={132} rx={40} ry={16} fill={C.lamp} opacity={0.5 + Math.sin((f + i * 20) / 40) * 0.05} />
      </g>
    ))}
    {/* 床 */}
    <rect x={0} y={986} width={W} height={H - 986} fill={C.museumFloor} />
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={i} x1={i * 240 - 40} y1={986} x2={i * 240 - 120} y2={H} stroke="#6A6456" strokeWidth={3} opacity={0.5} />
    ))}
    {/* 埃 */}
    {Array.from({ length: 14 }).map((_, i) => (
      <circle key={i} cx={((i * 311) % 18) * 106 + 60} cy={240 + ((i * 53) % 6) * 110 + Math.sin((f + i * 11) / 28) * 9} r={3} fill="#FFFDF4" opacity={0.42} />
    ))}
  </g>
);

// 展示台 (メダルを置く台) + キャプション板
const Pedestal: React.FC<{
  x: number; y: number; w?: number; label?: string;
}> = ({ x, y, w = 420, label }) => (
  <g>
    <polygon points={`${x - w / 2},${y} ${x + w / 2},${y} ${x + w / 2 + 30},${y - 24} ${x - w / 2 + 30},${y - 24}`} fill={C.pedestal} stroke={C.ink} strokeWidth={4} />
    <rect x={x - w / 2} y={y} width={w} height={H - y} fill={C.pedestalDark} stroke={C.ink} strokeWidth={4} />
    <polygon points={`${x + w / 2},${y} ${x + w / 2 + 30},${y - 24} ${x + w / 2 + 30},${H} ${x + w / 2},${H}`} fill="#5A5547" stroke={C.ink} strokeWidth={4} />
    {label && (
      <g>
        <rect
          x={x - (label.length * 32 + 44) / 2}
          y={y + 28}
          width={label.length * 32 + 44}
          height={56}
          rx={8}
          fill="#E8E2CE"
          stroke={C.ink}
          strokeWidth={4}
        />
        <text x={x} y={y + 67} fontSize={32} fontFamily={FONT} fill={C.ink} textAnchor="middle">{label}</text>
      </g>
    )}
  </g>
);

// ===================================================================
// 第16条の「床」その3 — 机に広げた図面紙 (方眼はこの紙に clip する)
// ===================================================================
const DeskPaper: React.FC<{
  f: number; id: string; x?: number; y?: number; w?: number; h?: number; grid?: boolean;
  room?: number; behind?: React.ReactNode;
}> = ({ f, id, x = 170, y = 136, w = 1580, h = 680, grid = true, room = 0, behind }) => (
  <g>
    {/* 奥の部屋 (room を指定したときだけ) */}
    {room > 0 && (
      <g>
        <rect x={0} y={0} width={W} height={room} fill="#C3B79B" />
        {Array.from({ length: 22 }).map((_, i) => (
          <ellipse key={i} cx={((i * 173) % 19) * 101 + 40} cy={40 + ((i * 59) % 3) * 96} rx={38} ry={18} fill="#A89A7C" opacity={0.2} />
        ))}
        <rect x={0} y={0} width={W} height={70} fill="#8B7F66" opacity={0.3} />
        {/* 奥の棚と巻いた図面 */}
        <rect x={660} y={226} width={420} height={20} fill={C.deskDark} opacity={0.75} />
        {[700, 770, 840, 910].map((rx, i) => (
          <g key={rx}>
            <rect x={rx} y={226 - 92 - i * 4} width={34} height={92 + i * 4} rx={16} fill="#E2DAC2" stroke={C.ink} strokeWidth={3.5} />
            <line x1={rx + 17} y1={226 - 88 - i * 4} x2={rx + 17} y2={222} stroke="#BFB393" strokeWidth={3} />
          </g>
        ))}
        <rect x={1380} y={56} width={380} height={230} rx={8} fill="#DCD4BA" stroke={C.ink} strokeWidth={4.5} />
        <rect x={1380} y={56} width={380} height={28} rx={8} fill="#BDB294" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1404} y1={120 + i * 42} x2={1736} y2={120 + i * 42} stroke="#A99D7F" strokeWidth={3} opacity={0.7} />
        ))}
      </g>
    )}
    {behind}
    {/* 机 */}
    <rect x={0} y={room} width={W} height={H - room} fill={C.desk} />
    {Array.from({ length: 8 }).map((_, i) => (
      <path key={i} d={`M -40 ${room + 56 + i * 142} C ${W * 0.3} ${room + 34 + i * 142} ${W * 0.7} ${room + 86 + i * 142} ${W + 40} ${room + 50 + i * 142}`} stroke={C.deskDark} strokeWidth={2.5} fill="none" opacity={0.42} />
    ))}
    <rect x={0} y={room} width={W} height={90} fill="#000" opacity={0.14} />
    {room > 0 && <rect x={0} y={room} width={W} height={14} fill={C.deskDark} />}
    {/* 図面紙 */}
    <g transform={`rotate(-0.5 ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 12} y={y + 16} width={w} height={h} fill="#000" opacity={0.2} />
      <rect x={x} y={y} width={w} height={h} fill={C.paper} stroke={C.paperEdge} strokeWidth={3} />
      {grid && (
        <g clipPath={`url(#${id})`} opacity={0.8}>
          <GridPaper pitch={52} opacity={0.26} />
        </g>
      )}
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      {/* 紙の折り目 */}
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={C.paperEdge} strokeWidth={2} opacity={0.6} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.3} />
    </g>
    {/* 定規・鉛筆・コンパス */}
    <g transform={`translate(260 ${930 + Math.sin(f / 26) * 2}) rotate(-3)`}>
      <rect x={-220} y={-20} width={440} height={40} rx={6} fill="#E2D7B4" stroke={C.ink} strokeWidth={3.5} />
      {Array.from({ length: 15 }).map((_, i) => (
        <line key={i} x1={-206 + i * 29} y1={-20} x2={-206 + i * 29} y2={i % 5 === 0 ? -2 : -9} stroke={C.ink} strokeWidth={2.5} opacity={0.75} />
      ))}
    </g>
    <g transform={`translate(1000 ${952 + Math.sin((f + 9) / 24) * 2}) rotate(6)`}>
      <rect x={-150} y={-13} width={260} height={26} rx={4} fill="#D8B23C" stroke={C.ink} strokeWidth={3.5} />
      <path d="M 110 -13 L 160 0 L 110 13 Z" fill="#E3D3B2" stroke={C.ink} strokeWidth={3} />
      <path d="M 146 -3.5 L 160 0 L 146 3.5 Z" fill={C.ink} />
    </g>
    <g transform={`translate(1660 ${912 + Math.sin((f + 17) / 22) * 2})`}>
      <circle cx={0} cy={-62} r={13} fill="#9AA0A6" stroke={C.ink} strokeWidth={3.5} />
      <path d="M 0 -56 L -52 70" stroke="#9AA0A6" strokeWidth={13} strokeLinecap="round" />
      <path d="M 0 -56 L 54 70" stroke="#9AA0A6" strokeWidth={13} strokeLinecap="round" />
      <path d="M 0 -56 L -52 70" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
      <circle cx={-52} cy={76} r={6} fill={C.ink} />
    </g>
  </g>
);

// ===================================================================
// 第16条の「床」その4 — 式典会場 (緞帳・絨毯)。#113/#114 の頂点はここ
// ===================================================================
const NightHall: React.FC<{
  f: number; dim?: number; spot?: number; spotX?: number;
}> = ({ f, dim = 0, spot = 1, spotX = 960 }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={C.night} />
    {/* 緞帳 */}
    <rect x={0} y={0} width={W} height={60} fill={C.curtainDark} />
    {Array.from({ length: 21 }).map((_, i) => {
      const px = i * 96;
      return (
        <g key={i}>
          <path d={`M ${px} 56 Q ${px + 30} 420 ${px + 10} 840 L ${px + 96} 840 Q ${px + 76} 420 ${px + 96} 56 Z`} fill={i % 2 ? C.curtain : C.curtainDark} opacity={0.96} />
          <path d={`M ${px + 48} 56 Q ${px + 70} 430 ${px + 52} 840`} stroke="#5E161C" strokeWidth={5} fill="none" opacity={0.42} />
        </g>
      );
    })}
    {/* 緞帳の房飾り */}
    {Array.from({ length: 21 }).map((_, i) => (
      <circle key={i} cx={i * 96 + 48} cy={44} r={15} fill="#C9A24C" stroke={C.ink} strokeWidth={3} opacity={0.85} />
    ))}
    {/* 絨毯 */}
    <rect x={0} y={820} width={W} height={H - 820} fill={C.carpet} />
    <rect x={0} y={820} width={W} height={16} fill={C.carpetDark} />
    {Array.from({ length: 120 }).map((_, i) => (
      <line key={i} x1={(i * 16) % W} y1={846 + ((i * 37) % 9) * 24} x2={(i * 16) % W + 9} y2={852 + ((i * 37) % 9) * 24} stroke={C.carpetDark} strokeWidth={3} opacity={0.4} />
    ))}
    {/* スポットライト1本 */}
    {spot > 0 && (
      <g opacity={spot}>
        <polygon points={`${spotX - 50},40 ${spotX + 50},40 ${spotX + 330},880 ${spotX - 330},880`} fill="#FFF6DC" opacity={0.2} />
        <ellipse cx={spotX} cy={884} rx={320} ry={62} fill="#FFF6DC" opacity={0.18} />
      </g>
    )}
    {/* 暗転 */}
    {dim > 0 && <rect x={0} y={0} width={W} height={H} fill={C.nightDeep} opacity={dim * 0.82} />}
    {/* 空気の粒 */}
    {Array.from({ length: 16 }).map((_, i) => (
      <circle key={i} cx={((i * 271) % 18) * 106 + 70} cy={200 + ((i * 67) % 6) * 112 + Math.sin((f + i * 13) / 30) * 11} r={3} fill="#FFF8E0" opacity={0.4} />
    ))}
  </g>
);

// ===================================================================
// 使い回す部品 — メダル (phase で金/銀/銅/金張りの断面を切り替える)
// ===================================================================
const MEDAL_TONE = {
  gold: { face: C.gold, dark: C.goldDark, edge: "#F0D27E" },
  silver: { face: C.silver, dark: C.silverDark, edge: "#DCE1E6" },
  bronze: { face: C.bronze, dark: C.bronzeDark, edge: "#D09C70" },
};

const Medal: React.FC<{
  x: number; y: number; s?: number; f?: number; t?: number;
  phase: "gold" | "silver" | "bronze" | "plated";
  ribbon?: boolean; rot?: number;
}> = ({ x, y, s = 1, f = 0, t = 1, phase, ribbon = false, rot = 0 }) => {
  const sw = Math.sin((f + x / 7) / 34) * 1.6;
  if (phase === "plated") {
    // 断面図: 外の薄い金の層 + 中の銀の芯。純金の塊には描かない
    return (
      <g transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.3 * t)}) rotate(${rot})`} opacity={t}>
        <rect x={-172} y={-42} width={344} height={84} rx={42} fill={C.gold} stroke={C.ink} strokeWidth={5} />
        <rect x={-172} y={-42} width={344} height={28} rx={14} fill="#F0D27E" opacity={0.6} />
        <rect x={-158} y={-28} width={316} height={56} rx={28} fill={C.silver} stroke={C.ink} strokeWidth={4} />
        {/* 銀の芯のハッチング */}
        <clipPath id={`ib6core${Math.round(x)}`}>
          <rect x={-158} y={-28} width={316} height={56} rx={28} />
        </clipPath>
        <g clipPath={`url(#ib6core${Math.round(x)})`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1={-170 + i * 24} y1={32} x2={-134 + i * 24} y2={-32} stroke={C.silverDark} strokeWidth={3} opacity={0.5} />
          ))}
        </g>
      </g>
    );
  }
  const tn = MEDAL_TONE[phase];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + sw}) scale(${s * (0.72 + 0.28 * pop(t))})`} opacity={clamp01(t * 3)}>
      {ribbon && (
        <g>
          <path d="M -26 -78 L -96 -300 L -46 -312 L 2 -82 Z" fill={C.ribbon} stroke={C.ink} strokeWidth={4.5} />
          <path d="M 26 -78 L 96 -300 L 46 -312 L -2 -82 Z" fill={C.ribbonDark} stroke={C.ink} strokeWidth={4.5} />
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={-88 + i * 4} y1={-284 + i * 30} x2={-34 + i * 5} y2={-290 + i * 30} stroke="#8296B0" strokeWidth={2.5} opacity={0.55} />
          ))}
        </g>
      )}
      {/* 縁のギザ */}
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return <rect key={i} x={-5} y={-98} width={10} height={16} fill={tn.dark} transform={`rotate(${(a * 180) / Math.PI})`} />;
      })}
      <circle cx={0} cy={0} r={88} fill={tn.face} stroke={C.ink} strokeWidth={5.5} />
      <circle cx={0} cy={0} r={70} fill="none" stroke={tn.dark} strokeWidth={4} opacity={0.75} />
      <path d="M -62 -46 A 86 86 0 0 1 24 -82" stroke={tn.edge} strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* 中の浮き彫り (月桂の輪) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <ellipse key={i} cx={Math.cos(a) * 46} cy={Math.sin(a) * 46} rx={15} ry={7}
            fill={tn.dark} opacity={0.45} transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 46} ${Math.sin(a) * 46})`} />
        );
      })}
      <circle cx={0} cy={0} r={18} fill={tn.dark} opacity={0.4} />
    </g>
  );
};

// ===================================================================
// 使い回す部品 — 順位のバッジ (n = 1/2/3)
// ===================================================================
const RANK_TONE = [C.gold, C.silver, C.bronze];
const RankBadge: React.FC<{
  x: number; y: number; n: 1 | 2 | 3; s?: number; t?: number; color?: string; f?: number;
}> = ({ x, y, n, s = 1, t = 1, color, f = 0 }) => {
  const col = color ?? RANK_TONE[n - 1];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * pop(t))})`} opacity={clamp01(t * 3)}>
      <path d={`M -34 ${56} L -52 ${132} L -12 ${112} Z`} fill={C.ribbonDark} stroke={C.ink} strokeWidth={4} />
      <path d={`M 34 ${56} L 52 ${132} L 12 ${112} Z`} fill={C.ribbon} stroke={C.ink} strokeWidth={4} />
      <circle cx={0} cy={0} r={76} fill={col} stroke={C.ink} strokeWidth={6} />
      <circle cx={0} cy={0} r={60} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.45} />
      <path d={`M -52 -34 A 74 74 0 0 1 20 -70`} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.3 + Math.sin((f + n * 11) / 30) * 0.08} />
      <text x={0} y={34} fontSize={96} fontFamily={FONT} fill={C.ink} textAnchor="middle">{n}</text>
    </g>
  );
};

// ===================================================================
// 使い回す部品 — 3段の表彰台 (序#18 と同じ形)。lift で組み上がる
// ===================================================================
const PGY = 824;
const P_STEPS: { x: number; w: number; h: number; n: string; d: number }[] = [
  { x: 560, w: 380, h: 240, n: "2", d: 1 },
  { x: 1360, w: 380, h: 160, n: "3", d: 2 },
  { x: 960, w: 400, h: 360, n: "1", d: 0 },
];
const Podium: React.FC<{ f: number; lift?: number; snow?: boolean; nums?: boolean; gy?: number }> =
  ({ f, lift = 1, snow = false, nums = true, gy = PGY }) => (
    <g>
      {P_STEPS.map((st) => {
        const k = easeOut(clamp01((lift - st.d * 0.2) / 0.55));
        if (k <= 0.001) return null;
        const h = st.h * k;
        const top = gy - h;
        const L = st.x - st.w / 2;
        const R = st.x + st.w / 2;
        return (
          <g key={st.n}>
            {/* 天板 */}
            <polygon points={`${L},${top} ${R},${top} ${R + 32},${top - 26} ${L + 32},${top - 26}`} fill="#CFA063" stroke={C.ink} strokeWidth={5} />
            {/* 前面 */}
            <rect x={L} y={top} width={st.w} height={h} fill={C.wood} stroke={C.ink} strokeWidth={5} />
            {/* 側面 */}
            <polygon points={`${R},${top} ${R + 32},${top - 26} ${R + 32},${gy - 26} ${R},${gy}`} fill={C.woodDark} stroke={C.ink} strokeWidth={5} />
            {/* 木目 */}
            {Array.from({ length: 4 }).map((_, i) => (
              <path key={i} d={`M ${L + 18} ${top + 34 + i * 58} C ${L + st.w * 0.4} ${top + 14 + i * 58} ${L + st.w * 0.7} ${top + 54 + i * 58} ${R - 18} ${top + 28 + i * 58}`}
                stroke={C.woodDark} strokeWidth={2.5} fill="none" opacity={0.42} />
            ))}
            {/* 留め具 */}
            {[L + 22, R - 22].map((bx) => (
              <circle key={bx} cx={bx} cy={top + 26} r={7} fill="#8C8C86" stroke={C.ink} strokeWidth={2.5} />
            ))}
            {nums && h > 70 && (
              <text x={st.x} y={top + Math.min(h - 22, 118)} fontSize={104} fontFamily={FONT} fill={C.ink} textAnchor="middle" opacity={0.78}>{st.n}</text>
            )}
            {snow && (
              <g>
                <path d={`M ${L - 6} ${top + 4} Q ${st.x} ${top - 20} ${R + 6} ${top + 4} L ${R + 38} ${top - 22} Q ${st.x + 32} ${top - 44} ${L + 26} ${top - 22} Z`} fill={C.snow} stroke={C.snowShade} strokeWidth={3} />
                <path d={`M ${L} ${top + 6} Q ${st.x} ${top + 28} ${R} ${top + 6}`} stroke={C.snow} strokeWidth={10} fill="none" opacity={0.7} />
              </g>
            )}
          </g>
        );
      })}
      {/* 影 */}
      <ellipse cx={960} cy={gy + 18} rx={820} ry={26} fill="#000" opacity={0.16 * clamp01(lift * 2)} />
      {/* 槌の音の線 (組み上がっている間だけ) */}
      {lift < 0.99 && lift > 0.1 && (
        <g opacity={clamp01((1 - lift) * 2) * 0.8}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${1560 + i * 22} ${300 - i * 26} l 44 -30`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6 + Math.sin((f + i * 7) / 6) * 0.3} />
          ))}
        </g>
      )}
    </g>
  );

// ===================================================================
// オリーブの枝
// ===================================================================
const OliveBranch: React.FC<{ x: number; y: number; s?: number; rot?: number; f?: number }> =
  ({ x, y, s = 1, rot = 0, f = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot + Math.sin(f / 40) * 1.2}) scale(${s})`}>
      <path d="M -210 40 C -90 10 60 -20 215 -58" stroke={C.oliveDark} strokeWidth={9} fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => {
        const u = i / 8;
        const px = -210 + u * 425;
        const py = 40 - u * 98 + Math.sin(u * 3) * 4;
        const up = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${up ? -52 : 46})`}>
            <ellipse cx={0} cy={-34} rx={16} ry={38} fill={C.olive} stroke={C.oliveDark} strokeWidth={3.5} />
            <line x1={0} y1={-4} x2={0} y2={-64} stroke={C.oliveDark} strokeWidth={2.5} opacity={0.7} />
          </g>
        );
      })}
      {[[-96, 30], [96, -16]].map(([ox, oy], i) => (
        <circle key={i} cx={ox} cy={oy + 24} r={15} fill="#4E6A3C" stroke={C.ink} strokeWidth={3} />
      ))}
    </g>
  );

// ===================================================================
// ストップウォッチ (#118)
// ===================================================================
const Stopwatch: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-26} y={-268} width={52} height={46} rx={10} fill="#9AA0A6" stroke={C.ink} strokeWidth={5} />
    <rect x={-56} y={-296} width={112} height={34} rx={14} fill="#B6BCC2" stroke={C.ink} strokeWidth={5} />
    <circle cx={0} cy={0} r={222} fill="#B6BCC2" stroke={C.ink} strokeWidth={6} />
    <circle cx={0} cy={0} r={196} fill="#F4F1E4" stroke={C.ink} strokeWidth={5} />
    {Array.from({ length: 60 }).map((_, i) => {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const big = i % 5 === 0;
      return (
        <line key={i}
          x1={Math.cos(a) * (big ? 158 : 172)} y1={Math.sin(a) * (big ? 158 : 172)}
          x2={Math.cos(a) * 186} y2={Math.sin(a) * 186}
          stroke={C.ink} strokeWidth={big ? 5 : 2.5} opacity={big ? 0.9 : 0.6} />
      );
    })}
    {[["60", 0], ["15", 90], ["30", 180], ["45", 270]].map(([lab, deg]) => {
      const a = ((deg as number) / 180) * Math.PI - Math.PI / 2;
      return (
        <text key={lab as string} x={Math.cos(a) * 124} y={Math.sin(a) * 124 + 16} fontSize={44} fontFamily={FONT} fill={C.ink} textAnchor="middle">{lab as string}</text>
      );
    })}
    {/* 細かく刻む針 */}
    <g transform={`rotate(${Math.floor(f * 1.6) * 6})`}>
      <line x1={0} y1={26} x2={0} y2={-178} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
    </g>
    {/* 短い黒針は「分」を数える針。まだ1分も経っていないので真上 (0分) のまま、
        秒針に合わせてごくわずかだけ進む。
        ※以前は -54度 から始めていたため、赤針が 10.6秒 を指しているのに
          黒針が 51秒 あたりを指す、読めない文字盤になっていた */}
    <g transform={`rotate(${f * 0.1})`}>
      <line x1={0} y1={14} x2={0} y2={-104} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    </g>
    <circle cx={0} cy={0} r={15} fill={C.ink} />
  </g>
);

// ------------------------------------------------------------------
// #103 第6章、2位が、発明された日。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
// 観客席の段 r の、x における座面の高さ (Stadium の帯と同じ式)
const seatY = (r: number, x: number) => {
  const u = (x + 20) / 1960;
  return 288 + r * 36 + 34 + 2 * u * (1 - u) * (34 - r * 2);
};
const CROWD_COL = ["#6E7C8C", "#8C7A62", "#7C8468", "#8E6C6C", "#6C7E7C", "#86806A"];

const S103: React.FC<{ f: number }> = ({ f }) => {
  const crowd: [number, number][] = [
    [120, 0], [262, 1], [404, 0], [534, 2], [690, 1], [806, 3],
    [930, 0], [1052, 2], [1180, 1], [1302, 4], [1432, 2], [1562, 0],
    [1690, 3], [1812, 1], [182, 4], [606, 5], [1120, 5], [1646, 5],
  ];
  return (
    <Frame
      f={f}
      seed={1002}
      bg={C.sky}
      over={<ChapterDoor num={6} title="2位が 発明された日。" t={seg(f, 8, 26)} left={1070} top={596} width={790} />}
    >
      <Stadium f={f} year="1896" flags />
      {/* 観客席の人 (18人) */}
      {crowd.map(([cx, r], i) => (
        <PersonMini
          key={i}
          x={cx}
          y={seatY(r, cx)}
          s={0.44 + (i % 3) * 0.035}
          color={CROWD_COL[i % CROWD_COL.length]}
          f={f}
          phase={i}
          face="dot"
        />
      ))}
      {/* 中央のゴールテープ */}
      {[212, 1012].map((px) => (
        <g key={px}>
          <rect x={px - 10} y={722} width={20} height={186} fill="#E6E2D4" stroke={C.ink} strokeWidth={4.5} />
          <ellipse cx={px} cy={910} rx={34} ry={11} fill={C.trackDark} opacity={0.45} />
        </g>
      ))}
      <path
        d={`M 212 760 Q 612 ${778 + Math.sin(f / 15) * 5} 1012 760`}
        stroke="#FBF7EA"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <path d={`M 212 760 Q 612 ${778 + Math.sin(f / 15) * 5} 1012 760`} stroke={C.ink} strokeWidth={2} fill="none" opacity={0.35} />
      {/* 大理石の柱 (入場門) */}
      {[64, 1856].map((px) => (
        <g key={px}>
          <rect x={px - 34} y={300} width={68} height={420} fill={C.marble} stroke={C.ink} strokeWidth={4.5} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={px - 20 + i * 13} y1={312} x2={px - 20 + i * 13} y2={708} stroke={C.marbleLine} strokeWidth={3} opacity={0.6} />
          ))}
          <rect x={px - 48} y={276} width={96} height={30} rx={6} fill={C.marbleDark} stroke={C.ink} strokeWidth={4.5} />
        </g>
      ))}
    </Frame>
  );
};

// ------------------------------------------------------------------
// #104 1896年、アテネで、近代オリンピックの第1回大会が開かれました。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S104: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.42, easeOut(seg(f, 0, 36))); // トラックへ寄る
  const cut = seg(f, 20, 34); // テープが切れる
  return (
    <Frame f={f} seed={1003} bg={C.sky}>
      <g transform={zoomAt(z, 760, 800)}>
        <Stadium f={f} year="1896" flags />
        {/* 立ち上がる観客 */}
        {[[150, 4], [300, 5], [470, 3], [640, 5], [880, 4], [1080, 3], [1260, 5], [1480, 4], [1700, 3], [1840, 5]].map(
          ([cx, r], i) => (
            <PersonMini
              key={i}
              x={cx}
              y={seatY(r, cx) - 16 * easeOut(seg(f, 18 + i, 34 + i))}
              s={0.46 + (i % 3) * 0.03}
              color={CROWD_COL[i % CROWD_COL.length]}
              f={f}
              phase={i}
              face="dot"
              arms={seg(f, 20 + i, 32 + i) > 0.4 ? "up" : "down"}
            />
          ),
        )}
        {/* ゴールの支柱 */}
        {[212, 1312].map((px) => (
          <g key={px}>
            <rect x={px - 10} y={700} width={20} height={214} fill="#E6E2D4" stroke={C.ink} strokeWidth={4.5} />
            <ellipse cx={px} cy={916} rx={34} ry={11} fill={C.trackDark} opacity={0.45} />
          </g>
        ))}
        {/* テープ: 切れる前は1本、切れたあとは左右に分かれてはためく */}
        {cut < 0.5 ? (
          <path
            d={`M 212 744 Q 762 ${764 + Math.sin(f / 13) * 5} 1312 744`}
            stroke="#FBF7EA"
            strokeWidth={11}
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <g>
            <path
              d={`M 212 744 Q 450 ${760 + Math.sin(f / 9) * 9} 690 ${730 - cut * 46 + Math.sin(f / 7) * 8}`}
              stroke="#FBF7EA"
              strokeWidth={11}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M 1312 744 Q 1090 ${760 + Math.sin((f + 5) / 9) * 9} 860 ${726 - cut * 52 + Math.sin((f + 4) / 7) * 8}`}
              stroke="#FBF7EA"
              strokeWidth={11}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
        {/* 走り込む選手3人 */}
        {[
          { x: 780, y: 866, cl: "#C8C2B0", cd: "#A49E8C", ph: 0 },
          { x: 610, y: 912, cl: "#8E9AAE", cd: "#6C788C", ph: 3 },
          { x: 440, y: 956, cl: "#B0785E", cd: "#8C5A44", ph: 6 },
        ].map((r, i) => (
          <Person
            key={i}
            x={r.x + cut * 62}
            y={r.y}
            s={1.0 - i * 0.04}
            f={f}
            phase={r.ph}
            pose="run"
            lean={-7}
            face={i === 0 ? "joy" : "normal"}
            cloth={r.cl}
            clothDark={r.cd}
            hair="cap"
          />
        ))}
        {/* 土けむり */}
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse
            key={i}
            cx={250 + i * 66}
            cy={1012 - (i % 3) * 22}
            rx={34 + (i % 3) * 12}
            ry={11}
            fill="#D8C7A6"
            opacity={0.35 * (1 - i / 9)}
          />
        ))}
      </g>
      <TagPlate x={1500} y={700} text="1896年 アテネ" size={52} t={seg(f, 6, 22)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #105 さて、この大会の優勝者は、金メダルを首にかけたでしょうか。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S105: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1004} bg={C.museumWall}>
    <VitrineWall f={f} spots={[660, 1400]} />
    <Pedestal x={660} y={790} w={420} label="第1回の授与品" />
    {/* 展示用の首 (胸像の台) — リボンはかかっているのに、先に何もない */}
    <g>
      <path d="M 560 790 Q 560 666 660 650 Q 760 666 760 790 Z" fill={C.stone} stroke={C.ink} strokeWidth={5} />
      <rect x={632} y={566} width={56} height={92} rx={14} fill={C.stone} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={660} cy={566} rx={30} ry={13} fill={C.stoneDark} stroke={C.ink} strokeWidth={4} />
      <path d="M 596 712 Q 660 686 724 712" stroke={C.stoneDark} strokeWidth={4} fill="none" opacity={0.6} />
    </g>
    {/* 空っぽのリボン (首から下がっているが、下端に何も無い) */}
    <g>
      <path d="M 646 584 L 582 736 L 616 748 L 664 600 Z" fill={C.ribbon} stroke={C.ink} strokeWidth={4.5} />
      <path d="M 674 584 L 738 736 L 704 748 L 656 600 Z" fill={C.ribbonDark} stroke={C.ink} strokeWidth={4.5} />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={592 + i * 6} y1={722 - i * 24} x2={626 + i * 7} y2={728 - i * 24} stroke="#8296B0" strokeWidth={2.5} opacity={0.5} />
      ))}
      {/* 下端は空 (点線の輪で「ここに無い」を示す) */}
      <circle cx={660} cy={770} r={54} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="12 12" opacity={0.5} />
    </g>
    <QMark x={660} y={744} s={1.05} f={f} t={seg(f, 10, 26)} />
    {/* 右: 金色の「?」付きメダルの影 */}
    <g opacity={0.6 * seg(f, 16, 32)}>
      <circle cx={1400} cy={560} r={118} fill={C.gold} opacity={0.3} />
      <circle cx={1400} cy={560} r={118} fill="none" stroke={C.goldDark} strokeWidth={6} strokeDasharray="16 14" />
      <circle cx={1400} cy={560} r={92} fill="none" stroke={C.goldDark} strokeWidth={3} opacity={0.6} />
      <text x={1400} y={608} fontSize={150} fontFamily={FONT} fill={C.goldDark} textAnchor="middle" opacity={0.85}>?</text>
      <path d="M 1374 452 L 1330 292 L 1366 282 L 1402 444 Z" fill={C.ribbon} opacity={0.35} stroke={C.goldDark} strokeWidth={3} strokeDasharray="10 8" />
      <path d="M 1426 452 L 1470 292 L 1434 282 L 1398 444 Z" fill={C.ribbonDark} opacity={0.35} stroke={C.goldDark} strokeWidth={3} strokeDasharray="10 8" />
    </g>
    <TagPlate x={1016} y={246} text="金メダルをかけた?" size={46} t={seg(f, 8, 24)} />
  </Frame>
);

// ------------------------------------------------------------------
// #106 かけていません。第1回の近代オリンピックに、金メダルは無かったのです。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S106: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 14, 30)); // X が落ちる
  return (
    <Frame f={f} seed={1005} bg={C.sky}>
      <Stadium f={f} year="1896" />
      {/* どよめく観客 9人 */}
      {[[130, 1], [310, 3], [490, 0], [660, 4], [840, 2], [990, 5], [1520, 1], [1690, 4], [1850, 2]].map(
        ([cx, r], i) => (
          <PersonMini
            key={i}
            x={cx}
            y={seatY(r, cx)}
            s={0.47 + (i % 3) * 0.03}
            color={CROWD_COL[i % CROWD_COL.length]}
            f={f}
            phase={i * 3}
            face="dot"
            arms={i % 3 === 0 ? "up" : "down"}
          />
        ),
      )}
      {/* ざわめきの線 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d={`M ${180 + i * 220} ${248 - (i % 3) * 16} q 24 -22 48 0`}
          stroke={C.ink}
          strokeWidth={4}
          fill="none"
          opacity={(0.25 + Math.sin((f + i * 9) / 11) * 0.18) * drop}
        />
      ))}
      {/* 授与者と、空っぽの盆 */}
      <Person x={520} y={1010} s={1.05} f={f} phase={2} pose="hold" face="worried" cloth="#8E9AAE" clothDark="#6C788C" gaze={[3, -2]} />
      <g transform="translate(520 886)">
        <ellipse cx={0} cy={10} rx={128} ry={34} fill={C.woodDark} />
        <ellipse cx={0} cy={0} rx={126} ry={32} fill={C.wood} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={-10} cy={-4} rx={96} ry={20} fill="#C9A164" opacity={0.7} />
        {/* 盆の上は空 */}
        <ellipse cx={-6} cy={-4} rx={62} ry={15} fill="none" stroke={C.ink} strokeWidth={3.5} strokeDasharray="12 10" opacity={0.55} />
      </g>
      {/* 金メダルのシルエットに X が落ちる */}
      <g opacity={1 - drop * 0.45}>
        <Medal x={1240} y={566} s={1.3} f={f} phase="gold" ribbon t={seg(f, 4, 18)} />
      </g>
      <XMark x={1240} y={566} s={2.6} t={drop} color={C.red} />
      <TagPlate x={1240} y={762} text="金は無かった" size={58} t={seg(f, 24, 40)} color={C.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #107 1位がもらったのは、銀メダルと、オリーブの枝でした。
// 格: 並 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S107: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1006} bg={C.museumWall}>
    <VitrineWall f={f} spots={[700]} />
    <Pedestal x={700} y={760} w={660} label="1位がもらった物" />
    <Medal x={520} y={644} s={1.12} f={f} phase="silver" ribbon t={seg(f, 6, 22)} />
    <g opacity={seg(f, 14, 30)}>
      <OliveBranch x={806} y={712} s={0.70} rot={-4} f={f} />
    </g>
    {/* 受け取った1位の選手 (ちょっと不思議そうな顔) */}
    <Person x={1480} y={1012} s={1.08} f={f} phase={1} pose="hold" face="worried" cloth="#C8C2B0" clothDark="#A49E8C" gaze={[-4, 0]} />
    <g transform="translate(1480 884)">
      <circle cx={0} cy={0} r={46} fill={C.silver} stroke={C.ink} strokeWidth={5} />
      <circle cx={0} cy={0} r={34} fill="none" stroke={C.silverDark} strokeWidth={3.5} />
    </g>
    {/* 頭の上の小さな「?」 */}
    <g opacity={0.8}>
      <text x={1590} y={690} fontSize={88} fontFamily={FONT} fill={C.ink} textAnchor="middle" opacity={0.55}>?</text>
    </g>
    <TagPlate x={700} y={272} text="銀とオリーブ" size={54} t={seg(f, 10, 26)} />
  </Frame>
);

// ------------------------------------------------------------------
// #108 金・銀・銅が1位・2位・3位にそろって贈られた最初の大会は、1904年のセントルイス大会。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
//
// ★作者修正 (2026-11-07)「年表いらない」: 画面下部にあった 1896/1904/1912/1920 の
//   年表の帯を削除した (直後の #109 が 1904→2026 の年表の絵なので役目が重なっていた)。
//   空いた下部は低く広い展示台でうめ、主役 (メダル3つ + 1/2/3 の番号札) を
//   大きく (1.0 → 1.30) 低く (y 556 → 657) して、吊り鉤の横棒へ
//   金 → 銀 → 銅 の順に掛かってひと揺れして止まる動きに組み替えた。
//   部品 (VitrineWall / Pedestal / Medal / RankBadge) の定義は変えていない。
// ------------------------------------------------------------------
const S108: React.FC<{ f: number }> = ({ f }) => {
  const RAIL_Y = 250; // 吊り鉤の横棒。メダルのリボンの上端がこの棒に隠れる
  const MY = 657; // 掛かりきったメダルの中心
  const MS = 1.3; // メダルの大きさ
  const PED_Y = 790; // 展示台の天面。前面が字幕帯の上まで見える高さ
  const set: { x: number; ph: "gold" | "silver" | "bronze"; n: 1 | 2 | 3; d: number }[] = [
    { x: 420, ph: "gold", n: 1, d: 0 },
    { x: 960, ph: "silver", n: 2, d: 6 },
    { x: 1500, ph: "bronze", n: 3, d: 12 },
  ];
  return (
    <Frame f={f} seed={1007} bg={C.museumWall}>
      <VitrineWall f={f} spots={[420, 960, 1500]} />

      {/* スポットが1つずつ強まって、壁に光だまりができる */}
      {set.map((m) => {
        const lit = easeOut(seg(f, 4 + m.d, 22 + m.d));
        return (
          <g key={`glow-${m.ph}`} opacity={lit}>
            {[286, 212, 148].map((r, k) => (
              <ellipse key={r} cx={m.x} cy={MY - 26} rx={r} ry={r * 0.94} fill="#FFF8E0" opacity={0.045 + k * 0.035} />
            ))}
          </g>
        );
      })}

      {/* 展示台 3つ。年表を消して空いた下部を、低く広い台で見せる */}
      {set.map((m) => (
        <Pedestal key={`ped-${m.ph}`} x={m.x} y={PED_Y} w={500} />
      ))}

      {/* 台の作り込み — 天面のつや・前面の彫り線・天面の下の影 */}
      {set.map((m) => {
        const lit = easeOut(seg(f, 4 + m.d, 22 + m.d));
        return (
          <g key={`pedlit-${m.ph}`}>
            <rect x={m.x - 250} y={PED_Y + 2} width={500} height={24} fill="#000" opacity={0.13} />
            <ellipse cx={m.x + 16} cy={PED_Y - 11} rx={228} ry={26} fill="#FFF8E0" opacity={0.26 * lit} />
            <line x1={m.x - 250} y1={PED_Y + 34} x2={m.x + 250} y2={PED_Y + 34} stroke="#56513F" strokeWidth={5} opacity={0.45} />
            <rect x={m.x - 206} y={PED_Y + 56} width={412} height={180} rx={6} fill="none" stroke="#56513F" strokeWidth={4} opacity={0.36} />
          </g>
        );
      })}

      {/* 吊り鉤の横棒 (メダルがここに掛かる)。真鍮の照りが f で左右に流れる */}
      {set.map((m) => (
        <g key={`rail-${m.ph}`}>
          {[m.x - 198, m.x + 198].map((bx) => (
            <circle key={bx} cx={bx} cy={RAIL_Y} r={21} fill="#8C8376" stroke={C.ink} strokeWidth={4.5} />
          ))}
          <rect x={m.x - 198} y={RAIL_Y - 18} width={396} height={36} rx={18} fill="#A79A80" stroke={C.ink} strokeWidth={4.5} />
          <rect
            x={m.x - 180 + Math.sin((f + m.d * 7) / 38) * 86}
            y={RAIL_Y - 11}
            width={116}
            height={10}
            rx={5}
            fill="#E4DABE"
            opacity={0.75}
          />
        </g>
      ))}

      {/* 金 → 銀 → 銅 の順に掛かって、鉤を軸にひと揺れして止まる */}
      {set.map((m) => {
        const hang = seg(f, 3 + m.d, 17 + m.d);
        const swing = (1 - easeOut(hang)) * 10 * Math.cos((f - 3 - m.d) / 3.4);
        return (
          <g key={`medal-${m.ph}`} transform={`rotate(${swing} ${m.x} ${RAIL_Y})`}>
            {/* 壁に落ちる影 */}
            <circle cx={m.x + 34} cy={MY + 30} r={104} fill="#6E6E5C" opacity={0.2 * clamp01(hang * 3)} />
            <Medal x={m.x} y={MY} s={MS} f={f} phase={m.ph} ribbon t={hang} />
          </g>
        );
      })}

      {/* 1 / 2 / 3 の番号札。メダルが止まってから横に立つ */}
      {set.map((m) => (
        <RankBadge key={`badge-${m.ph}`} x={m.x + 206} y={690} n={m.n} s={0.76} t={seg(f, 18 + m.d, 30 + m.d)} f={f} />
      ))}

      <TagPlate x={960} y={174} text="1904年 セントルイス" size={46} t={seg(f, 8, 24)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #109 いまから、たった120年ほど前です。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S109: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 300;
  const X1 = 1620;
  const grow = easeOut(seg(f, 8, 32));
  // 1904 → 2026 の帯。目盛りは 1900 から 20年ごと
  const ticks = [1900, 1920, 1940, 1960, 1980, 2000, 2020];
  const px = (yr: number) => X0 + ((yr - 1900) / 126) * (X1 - X0);
  return (
    <Frame f={f} seed={1008} bg={C.paper}>
      <DeskPaper f={f} id="ib6dp109" y={200} h={560} />
      {/* 年表の軸 */}
      <line x1={X0 - 70} y1={520} x2={X1 + 70} y2={520} stroke={C.ink} strokeWidth={7} />
      {ticks.map((yr) => (
        <g key={yr}>
          <line x1={px(yr)} y1={496} x2={px(yr)} y2={544} stroke={C.ink} strokeWidth={4} opacity={0.75} />
          <text x={px(yr)} y={592} fontSize={30} fontFamily={FONT} fill={C.ink} textAnchor="middle" opacity={0.7}>
            {yr}
          </text>
        </g>
      ))}
      {/* その区間だけ赤で塗る */}
      <rect
        x={px(1904)}
        y={468}
        width={(px(2026) - px(1904)) * grow}
        height={52}
        fill={C.red}
        opacity={0.78}
        stroke={C.ink}
        strokeWidth={4}
      />
      {/* 両端の年 */}
      {[[1904, px(1904)], [2026, px(2026)]].map(([yr, lx]) => (
        <g key={yr as number}>
          <line x1={lx as number} y1={404} x2={lx as number} y2={566} stroke={C.red} strokeWidth={5} />
          <rect x={(lx as number) - 86} y={332} width={172} height={62} rx={10} fill="#FBF7EA" stroke={C.ink} strokeWidth={5} />
          <text x={lx as number} y={378} fontSize={44} fontFamily={FONT} fill={C.ink} textAnchor="middle">
            {yr as number}
          </text>
        </g>
      ))}
      {/* 区間の矢印 */}
      <g opacity={grow}>
        <line x1={px(1904) + 20} y1={672} x2={px(2026) - 20} y2={672} stroke={C.ink} strokeWidth={5} />
        <path d={`M ${px(1904) + 20} 672 l 34 -16 l 0 32 Z`} fill={C.ink} />
        <path d={`M ${px(2026) - 20} 672 l -34 -16 l 0 32 Z`} fill={C.ink} />
      </g>
      <TagPlate x={960} y={714} text="たった120年" size={56} t={seg(f, 20, 36)} color={C.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #110 しかも小ネタですが、この年の「金」は、純金ではなく金張りの銀でした。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S110: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1009} bg={C.museumWall}>
    <VitrineWall f={f} spots={[900]} />
    <Pedestal x={900} y={760} w={760} label="1904年の「金」の断面" />
    {/* 金張りの銀 = 断面図。純金の塊には描かない */}
    <Medal x={900} y={560} s={1.5} f={f} phase="plated" t={seg(f, 4, 22)} />
    {/* 引き出し線で2つの層を指す */}
    <g opacity={seg(f, 16, 32)}>
      {/* 外の薄い金の層 */}
      <path d="M 900 492 L 820 356 L 470 356" stroke={C.ink} strokeWidth={4} fill="none" />
      <circle cx={900} cy={492} r={9} fill={C.ink} />
      <rect x={176} y={312} width={300} height={88} rx={10} fill={C.gold} stroke={C.ink} strokeWidth={5} />
      <text x={326} y={370} fontSize={46} fontFamily={FONT} fill={C.ink} textAnchor="middle">金の層</text>
      <text x={326} y={444} fontSize={30} fontFamily={FONT} fill={C.ink} textAnchor="middle" opacity={0.75}>うすい</text>
      {/* 中の銀の芯 */}
      <path d="M 900 592 L 1056 704 L 1420 704" stroke={C.ink} strokeWidth={4} fill="none" />
      <circle cx={900} cy={592} r={9} fill={C.ink} />
      <rect x={1424} y={660} width={320} height={88} rx={10} fill={C.silver} stroke={C.ink} strokeWidth={5} />
      <text x={1584} y={718} fontSize={46} fontFamily={FONT} fill={C.ink} textAnchor="middle">銀の芯</text>
    </g>
    {/* 「純金ではない」の印 */}
    <g opacity={seg(f, 26, 40)}>
      <rect x={1368} y={302} width={372} height={104} rx={12} fill="#FBF7EA" stroke={C.ink} strokeWidth={5} />
      <text x={1472} y={372} fontSize={46} fontFamily={FONT} fill={C.ink} textAnchor="middle">純金</text>
      <XMark x={1646} y={354} s={0.98} t={seg(f, 32, 42)} color={C.red} />
    </g>
    <TagPlate x={560} y={210} text="金張り" size={62} t={seg(f, 10, 26)} color={C.goldDark} />
  </Frame>
);

// ------------------------------------------------------------------
// #111 ここで、ちょっと考えてみてください。
// 格: 並 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S111: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeOut(seg(f, 6, 30)); // 鉛筆が転がる
  return (
    <Frame f={f} seed={1010} bg={C.paper}>
      <DeskPaper
        f={f}
        id="ib6dp111"
        y={480}
        h={368}
        x={300}
        w={1320}
        room={430}
        behind={
          <Person
            x={1160}
            y={560}
            s={1.14}
            f={f}
            phase={0}
            still
            pose="armsFolded"
            face="normal"
            gaze={[-4, 3]}
            cloth="#6E7C8C"
            clothDark="#53616F"
          />
        }
      />
      {/* 描きかけの図 (3段の台の下書き。まだ線が足りない) */}
      <g opacity={0.8}>
        {[[470, 250, 150], [760, 290, 230], [1070, 250, 110]].map(([lx, lw, lh], i) => (
          <g key={i}>
            <rect x={lx as number} y={800 - (lh as number)} width={lw as number} height={lh as number}
              fill="none" stroke="#6E6558" strokeWidth={5} strokeDasharray={i === 2 ? "22 16" : undefined} />
            {i !== 2 && (
              <line x1={lx as number} y1={800 - (lh as number)} x2={(lx as number) + 26} y2={800 - (lh as number) - 22} stroke="#6E6558" strokeWidth={4} />
            )}
          </g>
        ))}
        <line x1={430} y1={800} x2={1400} y2={800} stroke="#6E6558" strokeWidth={5} />
        {/* 消しかけの線 */}
        <line x1={1180} y1={700} x2={1370} y2={700} stroke="#8E8678" strokeWidth={4} strokeDasharray="8 14" opacity={0.6} />
      </g>
      {/* 転がる鉛筆 */}
      <g transform={`translate(${620 + roll * 330} ${536}) rotate(${-6 + roll * 420})`}>
        <rect x={-130} y={-12} width={226} height={24} rx={4} fill="#C8A23A" stroke={C.ink} strokeWidth={3.5} />
        <path d="M 96 -12 L 142 0 L 96 12 Z" fill="#E3D3B2" stroke={C.ink} strokeWidth={3} />
        <path d="M 130 -3 L 142 0 L 130 3 Z" fill={C.ink} />
      </g>
      <QMark x={1320} y={250} s={0.78} f={f} t={seg(f, 16, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #112 1位は、大昔からいました。古代オリンピアにも、勝者はいました。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S112: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1011} bg="#DCDCC6">
    <Stadium f={f} year="ancient" />
    {/* 石柱 (神域の列柱) */}
    {[96, 268, 1700, 1864].map((px, i) => (
      <g key={px}>
        <rect x={px - 44} y={244} width={88} height={470} fill={C.stone} stroke={C.ink} strokeWidth={4.5} />
        {[0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={px - 30 + k * 15} y1={256} x2={px - 30 + k * 15} y2={702} stroke={C.stoneDark} strokeWidth={3} opacity={0.6} />
        ))}
        <rect x={px - 60} y={214} width={120} height={34} rx={5} fill={C.stoneDark} stroke={C.ink} strokeWidth={4.5} />
        {i < 2 && <rect x={px - 52} y={700} width={104} height={26} rx={4} fill={C.stoneDark} stroke={C.ink} strokeWidth={4.5} />}
      </g>
    ))}
    {/* オリーブの木 */}
    <g>
      <path d="M 1476 740 C 1468 650 1462 600 1472 540" stroke="#6E5A3C" strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M 1470 630 C 1430 600 1410 586 1392 556" stroke="#6E5A3C" strokeWidth={14} fill="none" strokeLinecap="round" />
      {[[1472, 490, 140], [1380, 540, 96], [1560, 538, 104], [1436, 432, 86]].map(([cx, cy, r], i) => (
        <g key={i}>
          <ellipse cx={cx as number} cy={cy as number} rx={r as number} ry={(r as number) * 0.76} fill={C.olive} stroke={C.oliveDark} strokeWidth={4.5} />
          <ellipse cx={(cx as number) - 24} cy={(cy as number) - 18} rx={(r as number) * 0.5} ry={(r as number) * 0.34} fill="#92A86A" opacity={0.6} />
        </g>
      ))}
    </g>
    {/* 月桂冠の群衆 */}
    {[[300, 980], [430, 1004], [900, 1000], [1420, 976], [1320, 1010], [640, 1016], [1680, 992]].map(([cx, cy], i) => {
      const sc = 0.78 + (i % 3) * 0.04;
      const headTop = cy - 190 * sc; // 頭のてっぺん (PersonMini: 頭 cy=-160s r=34s)
      return (
        <g key={i}>
          <PersonMini x={cx} y={cy} s={sc} color={CROWD_COL[(i + 2) % CROWD_COL.length]} f={f} phase={i * 4} face="dot" arms={i % 2 ? "up" : "down"} />
          {/* 月桂冠: 頭に載せる (浮かせない) */}
          <g opacity={0.9}>
            <path d={`M ${cx - 32 * sc} ${headTop + 16 * sc} q ${32 * sc} ${-24 * sc} ${64 * sc} 0`} stroke={C.oliveDark} strokeWidth={6 * sc} fill="none" />
            {[-21, 0, 21].map((ox) => (
              <ellipse key={ox} cx={cx + ox * sc} cy={headTop + 4 * sc} rx={10 * sc} ry={5.5 * sc} fill={C.olive} stroke={C.oliveDark} strokeWidth={2.5} />
            ))}
          </g>
        </g>
      );
    })}
    {/* 勝者1人 (腕を上げる) */}
    <Person x={760} y={1022} s={1.3} f={f} phase={0} pose="raise" face="joy" cloth="#E6DFC8" clothDark="#C2BBA2" hair="cap" />
    <g>
      <path d="M 700 714 q 60 -44 120 0" stroke={C.oliveDark} strokeWidth={9} fill="none" />
      {[-42, -14, 14, 42].map((ox) => (
        <ellipse key={ox} cx={760 + ox} cy={700} rx={15} ry={8} fill={C.olive} stroke={C.oliveDark} strokeWidth={3} />
      ))}
    </g>
    {/* 2位の居場所はどこにもない (空白の台座) */}
    <g opacity={seg(f, 14, 32)}>
      <polygon points="1000,742 1240,742 1258,722 1018,722" fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="16 14" opacity={0.6} />
      <rect x={1000} y={742} width={240} height={110} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="16 14" opacity={0.6} />
      <XMark x={1120} y={790} s={1.2} t={seg(f, 24, 40)} color={C.red} />
    </g>
    <TagPlate x={1240} y={300} text="1位は大昔から" size={54} t={seg(f, 8, 24)} />
  </Frame>
);

// ------------------------------------------------------------------
// #113 1904年に発明されたのは、1位ではありません。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ★ #113 → #114 が全編の頂点。ここは「溜め」の1枚。1 が退いていく
// ------------------------------------------------------------------
const S113: React.FC<{ f: number }> = ({ f }) => {
  const dim = easeOut(seg(f, 10, 42)); // 暗転が進む
  const back = easeOut(seg(f, 22, 42)); // 1 が退く
  return (
    <Frame f={f} seed={1012} bg={C.night} dark>
      <NightHall f={f} dim={dim * 0.78} spot={1} spotX={960} />
      {/* 中央のスポットに「1」。X が重なって退いていく */}
      <g transform={`translate(0 ${back * 54})`} opacity={1 - back * 0.62}>
        <RankBadge x={960} y={470} n={1} s={2.25 - back * 0.5} t={seg(f, 2, 18)} f={f} />
      </g>
      <XMark x={960} y={470} s={3.1} t={easeOut(seg(f, 18, 34))} color={C.red} />
      {/* 退いたあとに残る空白の輪 */}
      <g opacity={back * 0.5}>
        <circle cx={960} cy={470} r={190} fill="none" stroke="#E8E2CE" strokeWidth={5} strokeDasharray="20 18" />
      </g>
      <TagPlate x={960} y={752} text="1位ではない" size={56} t={seg(f, 28, 42)} color={C.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #114 2位です。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ★★ 全編の頂点。暗転した中にスポット1本。「2」が画面いっぱいに立ち上がる。
//    他に何も置かない (足元に銀メダル1枚だけ)。
// ------------------------------------------------------------------
const S114: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 2, 26)); // 「2」が立ち上がる
  const tremble = Math.sin(f / 3.2) * 2.2; // 輪郭が震える
  return (
    <Frame f={f} seed={1013} bg={C.nightDeep} dark>
      <NightHall f={f} dim={0.62} spot={1} spotX={960} />
      {/* 画面いっぱいの「2」(銀色)。下端 y=844 を基準に立ち上がる */}
      <g transform={`translate(960 844) scale(1 ${0.08 + 0.92 * rise})`}>
        {/* 震える輪郭 */}
        {[-1, 1].map((d) => (
          <text
            key={d}
            x={tremble * d}
            y={0}
            fontSize={760}
            fontFamily={FONT}
            fontWeight={900}
            fill="none"
            stroke={C.silverDark}
            strokeWidth={9}
            textAnchor="middle"
            opacity={0.5}
          >
            2
          </text>
        ))}
        <text x={0} y={0} fontSize={760} fontFamily={FONT} fontWeight={900} fill={C.silver} stroke={C.ink} strokeWidth={10} textAnchor="middle">
          2
        </text>
        <text x={0} y={0} fontSize={760} fontFamily={FONT} fontWeight={900} fill="#DCE1E6" textAnchor="middle" opacity={0.26} clipPath="url(#ib6two)">
          2
        </text>
        <clipPath id="ib6two">
          <rect x={-420} y={-760} width={300} height={760} />
        </clipPath>
      </g>
      {/* 足元に銀メダル1枚 */}
      <Medal x={1360} y={802} s={0.6} f={f} phase="silver" t={seg(f, 22, 38)} />
      <TagPlate x={1612} y={700} text="2位" size={66} t={seg(f, 30, 42)} color={C.silverDark} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #115 2位と3位に、名前と、メダルの色が与えられた。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S115: React.FC<{ f: number }> = ({ f }) => {
  const give = seg(f, 12, 30); // 名札と色の帯が付く瞬間
  const two = { x: 650, ph: "silver" as const, n: 2 as const, col: C.silver, lab: "2位" };
  const three = { x: 1330, ph: "bronze" as const, n: 3 as const, col: C.bronze, lab: "3位" };
  return (
    <Frame f={f} seed={1014} bg={C.museumWall}>
      <VitrineWall f={f} spots={[650, 1330]} />
      {[two, three].map((m, i) => (
        <g key={m.lab}>
          <Pedestal x={m.x} y={660} w={400} />
          <Medal x={m.x} y={496} s={1.0} f={f} phase={m.ph} ribbon t={seg(f, 2 + i * 4, 18 + i * 4)} />
          {/* 名札が付く */}
          <g opacity={give} transform={`translate(0 ${(1 - give) * -26})`}>
            <rect x={m.x - 104} y={696} width={208} height={76} rx={10} fill="#FBF7EA" stroke={C.ink} strokeWidth={5} />
            <text x={m.x} y={752} fontSize={54} fontFamily={FONT} fill={C.ink} textAnchor="middle">{m.lab}</text>
            {/* 名札をとめる紐 */}
            <line x1={m.x} y1={660} x2={m.x} y2={696} stroke={C.ink} strokeWidth={4} />
          </g>
          {/* 色の帯が付く */}
          <g opacity={give}>
            <rect x={m.x - 190} y={792} width={380 * give} height={54} rx={8} fill={m.col} stroke={C.ink} strokeWidth={5} />
            <rect x={m.x - 190} y={792} width={380 * give} height={16} rx={8} fill="#FFFFFF" opacity={0.3} />
          </g>
        </g>
      ))}
      {/* 引き出し線で「名前」「色」を指す */}
      <g opacity={seg(f, 26, 40)}>
        <path d="M 754 734 L 960 734 L 992 622" stroke={C.ink} strokeWidth={4} fill="none" />
        <circle cx={754} cy={734} r={9} fill={C.ink} />
        <rect x={880} y={540} width={232} height={82} rx={10} fill="#FBF7EA" stroke={C.ink} strokeWidth={5} />
        <text x={996} y={598} fontSize={48} fontFamily={FONT} fill={C.ink} textAnchor="middle">名前</text>
        <path d="M 1140 819 L 1010 819 L 986 782" stroke={C.ink} strokeWidth={4} fill="none" />
        <circle cx={1140} cy={819} r={9} fill={C.ink} />
        <rect x={874} y={700} width={226} height={82} rx={10} fill="#FBF7EA" stroke={C.ink} strokeWidth={5} />
        <text x={987} y={758} fontSize={48} fontFamily={FONT} fill={C.ink} textAnchor="middle">色</text>
      </g>
      <RankBadge x={494} y={586} n={2} s={0.5} t={seg(f, 18, 34)} f={f} />
      <RankBadge x={1174} y={586} n={3} s={0.5} t={seg(f, 22, 38)} f={f} />
      <TagPlate x={990} y={216} text="名前と色" size={56} t={seg(f, 8, 24)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #116 「惜しかった人」が、歴史に残る存在になった瞬間です。
// 格: 並 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ※「惜しかった人」は静かに描く (泣き顔にしない)
// ------------------------------------------------------------------
const S116: React.FC<{ f: number }> = ({ f }) => {
  const lit = easeOut(seg(f, 10, 32)); // 記録係の光が当たる
  const write = seg(f, 22, 42); // 名簿に名前が書き込まれる
  return (
    <Frame f={f} seed={1015} bg={C.sky}>
      <Stadium f={f} year="1904" />
      {/* ゴールの支柱2本とテープ (片側で終わらせない) */}
      <g>
        <rect x={290} y={694} width={20} height={226} fill="#E6E2D4" stroke={C.ink} strokeWidth={4.5} />
        <rect x={744} y={700} width={18} height={214} fill="#E6E2D4" stroke={C.ink} strokeWidth={4.5} />
        <path d="M 300 740 Q 530 762 753 746" stroke="#FBF7EA" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
      </g>
      {/* 1位は少し前に (顔は見せず後ろ姿で) */}
      <PersonMini x={520} y={1004} s={1.0} color="#B0785E" f={f} phase={5} face="none" arms="up" />
      {/* 記録係のランプの光 */}
      <g opacity={lit}>
        <polygon points="1596,352 1700,352 1086,1042 846,1042" fill="#FFF3D2" opacity={0.3} />
        <g transform="translate(1648 330)">
          <rect x={-46} y={-18} width={92} height={34} rx={8} fill="#8C8C86" stroke={C.ink} strokeWidth={4.5} />
          <path d="M -70 16 L 70 16 L 44 108 L -44 108 Z" fill="#A8A89E" stroke={C.ink} strokeWidth={5} />
          <ellipse cx={0} cy={108} rx={44} ry={14} fill={C.lamp} opacity={0.9} />
          <ellipse cx={0} cy={104} rx={26} ry={9} fill="#FFF6DC" />
        </g>
      </g>
      {/* うつむいていた選手1人 (静かに) */}
      <Person
        x={950}
        y={1026}
        s={1.16}
        f={f}
        phase={2}
        lean={6}
        pose="stand"
        face="normal"
        gaze={[0, 5]}
        cloth="#8E9AAE"
        clothDark="#6C788C"
      />
      {/* 記録席の机 (名簿を浮かせない) */}
      <g>
        <rect x={1148} y={812} width={560} height={26} rx={6} fill="#A8865E" stroke={C.ink} strokeWidth={5} />
        <rect x={1152} y={815} width={552} height={9} fill="#C09C70" opacity={0.8} />
        <rect x={1196} y={838} width={26} height={130} fill="#8C6E4A" stroke={C.ink} strokeWidth={4.5} />
        <rect x={1634} y={838} width={26} height={130} fill="#8C6E4A" stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 名簿に名前が書き込まれる */}
      <g transform="translate(1416 680) rotate(-8)">
        <rect x={-186} y={-130} width={372} height={260} rx={8} fill="#F4EEDC" stroke={C.ink} strokeWidth={5} />
        <line x1={0} y1={-130} x2={0} y2={130} stroke={C.paperEdge} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-162} y1={-78 + i * 54} x2={-22} y2={-78 + i * 54} stroke="#A99D7F" strokeWidth={3.5} />
        ))}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={24} y1={-78 + i * 54} x2={162} y2={-78 + i * 54} stroke="#A99D7F" strokeWidth={3.5} />
        ))}
        {/* 1行目はすでに埋まっている (1位)。2行目にいま書き込まれる */}
        <line x1={-156} y1={-86} x2={-52} y2={-86} stroke={C.ink} strokeWidth={6} opacity={0.75} />
        <line x1={-156} y1={-32} x2={-156 + 104 * write} y2={-32} stroke={C.red} strokeWidth={6} />
        {/* ペン */}
        <g transform={`translate(${-150 + 104 * write} -42) rotate(32)`}>
          <rect x={-9} y={-120} width={18} height={120} rx={5} fill="#3F4A5A" stroke={C.ink} strokeWidth={3.5} />
          <path d="M -9 0 L 9 0 L 2 28 L -2 28 Z" fill="#B9BDC2" stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
      <TagPlate x={1316} y={290} text="惜しかった人" size={54} t={seg(f, 16, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #117 発明は続きます。1912年に国際陸上競技連盟が生まれ、「世界記録」の公認が始まりました。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ※ 具体的な記録の数字は出さない (伏字「--.--」だけ)
// ------------------------------------------------------------------
const S117: React.FC<{ f: number }> = ({ f }) => {
  const press = easeOut(seg(f, 14, 30)); // 角印が押される
  return (
    <Frame f={f} seed={1016} bg={C.paper}>
      <DeskPaper f={f} id="ib6dp117" x={240} y={150} w={1440} h={660} />
      {/* 記録票 */}
      <g transform="translate(830 490) rotate(-1.5)">
        <rect x={-440} y={-300} width={880} height={600} rx={8} fill="#FBF7EA" stroke={C.ink} strokeWidth={6} />
        <rect x={-440} y={-300} width={880} height={76} fill={C.museumWallDark} opacity={0.35} />
        <text x={-400} y={-248} fontSize={48} fontFamily={FONT} fill={C.ink}>記録票</text>
        <text x={396} y={-248} fontSize={44} fontFamily={FONT} fill={C.ink} textAnchor="end">1912</text>
        {/* 伏字の記録 */}
        <text x={-400} y={-116} fontSize={38} fontFamily={FONT} fill={C.ink} opacity={0.8}>記録</text>
        <rect x={-180} y={-176} width={420} height={86} rx={8} fill="#EFE8D2" stroke={C.ink} strokeWidth={4} />
        <text x={30} y={-114} fontSize={62} fontFamily={FONT} fill={C.ink} textAnchor="middle">--.--</text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <text x={-400} y={-18 + i * 74} fontSize={34} fontFamily={FONT} fill={C.ink} opacity={0.65}>
              {["種目", "場所", "日付", "計測"][i]}
            </text>
            <line x1={-180} y1={-10 + i * 74} x2={240} y2={-10 + i * 74} stroke="#A99D7F" strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 「公認」の角印が押される */}
      <g transform={`translate(1120 646) rotate(${-9 + (1 - press) * 16}) scale(${1.9 - press * 0.75})`} opacity={clamp01(press * 1.6)}>
        <rect x={-110} y={-110} width={220} height={220} rx={8} fill="none" stroke={C.red} strokeWidth={13} />
        <text x={0} y={-4} fontSize={92} fontFamily={FONT} fontWeight={900} fill={C.red} textAnchor="middle">公</text>
        <text x={0} y={88} fontSize={92} fontFamily={FONT} fontWeight={900} fill={C.red} textAnchor="middle">認</text>
      </g>
      {/* 印の勢いの線 */}
      {press > 0.08 && press < 0.96 && (
        <g opacity={0.5}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={1120 + Math.cos((i / 4) * 6.28) * 170} y1={646 + Math.sin((i / 4) * 6.28) * 170}
              x2={1120 + Math.cos((i / 4) * 6.28) * 240} y2={646 + Math.sin((i / 4) * 6.28) * 240}
              stroke={C.ink} strokeWidth={5} />
          ))}
        </g>
      )}
      {/* 朱肉 */}
      <g transform="translate(1340 902)">
        <ellipse cx={0} cy={8} rx={82} ry={28} fill="#4A443C" />
        <ellipse cx={0} cy={0} rx={78} ry={25} fill="#5E564B" stroke={C.ink} strokeWidth={4} />
        <ellipse cx={0} cy={-4} rx={56} ry={16} fill="#8C2A28" />
      </g>
      <TagPlate x={820} y={92} text="1912年 世界記録の公認" size={44} t={seg(f, 8, 24)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #118 専用の「走る人」(側面・右向き)。共通部品の PersonMini は立ち姿しか
// 持たないので、このシーンのためだけに新設する (共通部品は改造しない)。
// 腕と脚は f だけで振る。脚が後ろへ行くほど かかとが跳ね上がる。
// ------------------------------------------------------------------
const TrackRunner: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  cloth?: string; clothDark?: string; bib?: string; lean?: number; dust?: boolean;
  cyc?: number; // 足の刻みの位相 (ゴール後はゆっくりになるので外から渡す)
  amp?: number; // 1 = 全力、0 に近いほど流している
}> = ({
  x, y, s = 1, f, phase = 0, cloth = "#B4473F", clothDark = "#8A322C",
  bib, lean = 13, dust = true, cyc, amp = 1,
}) => {
  const ph = (cyc ?? f) * 0.52 + phase;
  const skin = "#E6C49E";
  const bob = Math.abs(Math.cos(ph)) * 7 * amp; // 一歩ごとに体が浮く
  // 脚 (p=0 が手前、p=π が奥)
  const Leg = (p: number, back: boolean) => {
    const sp = Math.sin(ph + p);
    const hip = -32 * sp * amp - 4; // マイナス = 前へ振り出す
    const knee = 14 + 76 * Math.max(0, -sp) * amp; // 後ろ脚はたたむ
    return (
      <g transform={`rotate(${hip})`} opacity={back ? 0.9 : 1}>
        <rect x={-13} y={-8} width={26} height={60} rx={13} fill={back ? clothDark : cloth} stroke={C.ink} strokeWidth={5} />
        <g transform={`translate(0 52) rotate(${knee})`}>
          <rect x={-10} y={0} width={20} height={52} rx={10} fill={back ? "#CBA87F" : skin} stroke={C.ink} strokeWidth={5} />
          <path d="M -12 48 L 28 50 L 32 64 L -12 64 Z" fill="#4A4540" stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
    );
  };
  // 腕 (脚と逆に振る)
  const Arm = (p: number, back: boolean) => {
    const sa = Math.sin(ph + p);
    return (
      <g transform={`translate(6 -92) rotate(${-48 * sa * amp + 8})`} opacity={back ? 0.9 : 1}>
        <rect x={-9} y={-6} width={18} height={46} rx={9} fill={back ? "#CBA87F" : skin} stroke={C.ink} strokeWidth={5} />
        <g transform="translate(0 40) rotate(-68)">
          <rect x={-8} y={0} width={16} height={40} rx={8} fill={back ? "#CBA87F" : skin} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={44} r={11} fill={back ? "#CBA87F" : skin} stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s})`}>
      {/* 走りの線 (後ろへ引きずる) */}
      <g opacity={0.3 * amp}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-62 - i * 10} y1={-150 + i * 46} x2={-132 - i * 26} y2={-150 + i * 46}
            stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.4 + Math.sin((f + i * 9) / 6) * 0.3} />
        ))}
      </g>
      {/* 土けむり */}
      {dust && (
        <g opacity={0.45 * amp}>
          {[0, 1, 2].map((i) => {
            const u = ((f + i * 9) % 18) / 18;
            return (
              <ellipse key={i} cx={-34 - u * 72} cy={2 - u * 20} rx={18 + u * 26} ry={7 + u * 11}
                fill={C.soilDark} opacity={0.5 * (1 - u)} />
            );
          })}
        </g>
      )}
      <g transform="translate(0 -104)">
        {Arm(Math.PI, true)}
        {Leg(Math.PI, true)}
        {/* 胴 (前へ傾ける。流しているときは起きてくる) */}
        <g transform={`rotate(${lean * (0.45 + 0.55 * amp)})`}>
          <rect x={-28} y={-16} width={56} height={34} rx={12} fill={clothDark} stroke={C.ink} strokeWidth={5} />
          <path d="M -26 -98 Q -30 -20 -24 4 L 24 4 Q 30 -22 24 -98 Q 0 -112 -26 -98 Z" fill={cloth} stroke={C.ink} strokeWidth={5.5} />
          {bib && (
            <g>
              <rect x={-19} y={-78} width={38} height={44} rx={5} fill="#F6F2E4" stroke={C.ink} strokeWidth={4} />
              <text x={0} y={-44} fontSize={34} fontFamily={FONT} fontWeight={900} fill={C.ink} textAnchor="middle">{bib}</text>
            </g>
          )}
          {/* 首と頭 */}
          <rect x={-6} y={-114} width={20} height={24} fill={skin} stroke={C.ink} strokeWidth={4.5} />
          <circle cx={6} cy={-140} r={31} fill={skin} stroke={C.ink} strokeWidth={5.5} />
          <path d="M -24 -148 Q -6 -180 24 -160 Q 10 -166 -24 -148 Z" fill="#4A4038" stroke={C.ink} strokeWidth={4} />
          <circle cx={18} cy={-144} r={5} fill={C.ink} />
          {/* 歯を食いしばった口 */}
          <ellipse cx={22} cy={-124} rx={9} ry={6} fill="#8C4A44" stroke={C.ink} strokeWidth={3.5} />
        </g>
        {Leg(0, false)}
        {Arm(0, false)}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------
// #118 時計の精度が上がり、世界共通の物差しで測れるようになったからだとされています。
// 格: 山 (もとは図。作者の指示で競技場の走りに作り替えた)
// 走り → ゴールテープが切れる → 手前のストップウォッチの針が止まる、の流れ。
// 「世界共通の物差し」はトラックの白線・100mの標識・文字盤の細かい目盛りで言う。
// ------------------------------------------------------------------
// ゴールの白線 (手前ほど右へ寄る) の、走路 y における x。1位の足もと (798) が基準
const finishX = (y: number) => 1463 + (y - 798) * 0.42;

const S118: React.FC<{ f: number }> = ({ f }) => {
  const run = easeOut(seg(f, 0, 21)); // 走者が走り込んでくる
  const brk = seg(f, 21, 27); // テープが切れる
  // 針はゴールの瞬間 (f=25) で止まる。0.26 倍しているのは、止まった針が
  // 文字盤の「10秒すこし」を指して、読み取る記録 (10.6秒) と合うようにするため
  const swF = Math.min(f, 25) * 0.26;
  const press = seg(f, 22, 27); // 竜頭を押し込む指
  const flash = seg(f, 26, 33); // 止めた瞬間の衝撃
  const read = seg(f, 28, 40); // 読み取った記録が出る
  const z = 1 + 0.07 * easeOut(seg(f, 0, 34)); // ゴールへゆっくり寄る
  // ゴール後 (f>21) は全員そろって失速し、流しながら前へ少しだけ進む。
  // coast は 1 に漸近するので、何秒まわしても走者は画面から出ていかない
  const coast = 1 - Math.exp(-Math.max(0, f - 21) / 20);
  const amp = 1 - 0.62 * coast; // 脚の振りの大きさ
  // 足の刻みの位相。f=21 までは等速、その後はだんだんゆっくりになる (上の rate の積分)
  const stride = f <= 21 ? f : 21 + 0.4 * (f - 21) + 12 * coast;
  // 走者。手前 (y が大きい) ほど大きい。x1 の差がそのまま着順になる。
  // 足もとは 716〜882 に収める (下は字幕の黒帯が上端 854 で隠すため)
  const runners = [
    { y: 716, s: 0.50, x0: 150, x1: 900, cloth: "#7C8468", dk: "#5A6149", bib: "6", ph: 2.1 },
    { y: 752, s: 0.57, x0: 300, x1: 1200, cloth: "#D9A93E", dk: "#A87E22", bib: "3", ph: 0.8 },
    { y: 798, s: 0.65, x0: 430, x1: 1493, cloth: "#B4473F", dk: "#8A322C", bib: "1", ph: 0 },
    { y: 834, s: 0.72, x0: 330, x1: 1340, cloth: "#5A6E8C", dk: "#3C4D66", bib: "2", ph: 1.5 },
    { y: 882, s: 0.80, x0: 180, x1: 1052, cloth: "#8C7A62", dk: "#6B5B42", bib: "4", ph: 3.0 },
  ];
  // ゴールテープ。奥の走路の胸の高さ → 手前の走路の胸の高さへ張る
  const TA: [number, number] = [1424, 626];
  const TB: [number, number] = [1506, 768];
  const TP: [number, number] = [1463, 694]; // 切れる点 (1位の胸)
  const flap = Math.sin(f / 4) * 9;
  const e1: [number, number] = [TP[0] - 36 * brk, TP[1] - 48 * brk + flap];
  const e2: [number, number] = [TP[0] + 32 * brk, TP[1] + 42 * brk - flap];
  return (
    <Frame f={f} seed={1017} bg="#BFD0DA">
      <g transform={zoomAt(z, 1474, 820)}>
        <Stadium f={f} year="1930" flags />
        {/* 観客。ゴールが決まると腕が上がる */}
        {([[150, 1], [330, 3], [540, 0], [760, 4], [980, 2], [1180, 5], [1330, 0], [1500, 3], [1680, 1], [1840, 4]] as [number, number][]).map(
          ([cx, r], i) => (
            <PersonMini
              key={i}
              x={cx}
              y={seatY(r, cx)}
              s={0.44 + (i % 3) * 0.035}
              color={CROWD_COL[i % CROWD_COL.length]}
              f={f}
              phase={i * 4}
              face="dot"
              arms={brk > 0.6 && cx > 900 ? "up" : "down"}
            />
          ),
        )}
        {/* 100m の標識 (世界のどこでも同じ長さ) */}
        <g>
          <line x1={1266} y1={694} x2={1266} y2={578} stroke={C.ink} strokeWidth={7} />
          <rect x={1184} y={514} width={164} height={64} rx={8} fill="#F4F1E4" stroke={C.ink} strokeWidth={5} />
          <text x={1266} y={560} fontSize={40} fontFamily={FONT} fontWeight={900} fill={C.ink} textAnchor="middle">100m</text>
        </g>
        {/* ゴールの白線 (走路を横切る) */}
        <g>
          <line x1={finishX(700)} y1={700} x2={finishX(1080)} y2={1080} stroke="#FBF7EA" strokeWidth={14} strokeLinecap="round" />
          <line x1={finishX(700)} y1={700} x2={finishX(1080)} y2={1080} stroke={C.ink} strokeWidth={2.5} opacity={0.3} />
          {[772, 844, 922, 1006].map((ly) => (
            <line key={ly} x1={finishX(ly) - 26} y1={ly} x2={finishX(ly) + 26} y2={ly} stroke="#FBF7EA" strokeWidth={7} opacity={0.8} />
          ))}
        </g>
        {/* テープの支柱 */}
        <g>
          <line x1={TA[0]} y1={700} x2={TA[0]} y2={TA[1]} stroke={C.ink} strokeWidth={6} />
          <line x1={TB[0]} y1={1012} x2={TB[0]} y2={TB[1]} stroke={C.ink} strokeWidth={8} />
          <circle cx={TA[0]} cy={TA[1]} r={8} fill={C.ink} />
          <circle cx={TB[0]} cy={TB[1]} r={10} fill={C.ink} />
        </g>
        {/* 走者 (奥から先に描いて、手前が重なるように) */}
        {runners.map((r, i) => (
          <TrackRunner
            key={r.bib}
            x={r.x0 + (r.x1 - r.x0) * run + 84 * coast}
            y={r.y}
            s={r.s}
            f={f}
            cyc={stride}
            amp={amp}
            phase={r.ph}
            cloth={r.cloth}
            clothDark={r.dk}
            bib={r.bib}
            lean={i === 2 ? 17 : 13}
          />
        ))}
        {/* ゴールテープ。切れる前は1本、切れたら左右に分かれてはためく */}
        {brk <= 0 ? (
          <g>
            <path d={`M ${TA[0]} ${TA[1]} Q ${(TA[0] + TB[0]) / 2 + 12} ${(TA[1] + TB[1]) / 2 + 10 + Math.sin(f / 13) * 6} ${TB[0]} ${TB[1]}`}
              stroke={C.ink} strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.22} transform="translate(3 6)" />
            <path d={`M ${TA[0]} ${TA[1]} Q ${(TA[0] + TB[0]) / 2 + 12} ${(TA[1] + TB[1]) / 2 + 10 + Math.sin(f / 13) * 6} ${TB[0]} ${TB[1]}`}
              stroke="#FBF7EA" strokeWidth={15} fill="none" strokeLinecap="round" />
            <path d={`M ${TA[0]} ${TA[1]} Q ${(TA[0] + TB[0]) / 2 + 12} ${(TA[1] + TB[1]) / 2 + 10 + Math.sin(f / 13) * 6} ${TB[0]} ${TB[1]}`}
              stroke={C.ink} strokeWidth={2.5} fill="none" opacity={0.35} />
          </g>
        ) : (
          <g>
            {([[TA, e1, -1], [TB, e2, 1]] as [[number, number], [number, number], number][]).map(([a, e, dir], k) => {
              const d = `M ${a[0]} ${a[1]} Q ${(a[0] + e[0]) / 2 + dir * 22} ${(a[1] + e[1]) / 2 + dir * 16} ${e[0]} ${e[1]}`;
              return (
                <g key={k}>
                  <path d={d} stroke={C.ink} strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.22} transform="translate(3 6)" />
                  <path d={d} stroke="#FBF7EA" strokeWidth={15} fill="none" strokeLinecap="round" />
                  <path d={d} stroke={C.ink} strokeWidth={2.5} fill="none" opacity={0.35} />
                </g>
              );
            })}
            {/* 切れた瞬間の弾け */}
            {brk < 0.9 && (
              <g opacity={0.6}>
                {[0, 1, 2, 3].map((i) => (
                  <line key={i}
                    x1={TP[0] + Math.cos((i / 4) * 6.28 + 0.6) * 40} y1={TP[1] + Math.sin((i / 4) * 6.28 + 0.6) * 40}
                    x2={TP[0] + Math.cos((i / 4) * 6.28 + 0.6) * 86} y2={TP[1] + Math.sin((i / 4) * 6.28 + 0.6) * 86}
                    stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
                ))}
              </g>
            )}
          </g>
        )}
      </g>

      {/* ---- 手前 (カメラの寄りに乗せない) ---- */}
      {/* 計時員の手が握る大きなストップウォッチ。針はゴールで止まる */}
      <Stopwatch x={306} y={612} s={0.86} f={swF} />
      {/* 文字盤の細かさを言う光 (1目盛り = 1/10秒) */}
      <g opacity={0.5}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${474 + i * 22} ${446 - i * 24} q 22 -17 44 0`} stroke={C.ink} strokeWidth={4} fill="none"
            opacity={0.25 + Math.sin((f + i * 8) / 7) * 0.22} />
        ))}
      </g>
      {/* 止めた瞬間の衝撃 (竜頭のあたり) */}
      {flash > 0 && flash < 1 && (
        <g opacity={1 - flash}>
          <circle cx={306} cy={612} r={196 + flash * 70} fill="none" stroke={C.ink} strokeWidth={6} opacity={0.5} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={306 - 34 + i * 34} y1={338 - flash * 14} x2={306 - 48 + i * 48} y2={300 - flash * 30}
              stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
      )}
      {/* 下から握る手。指は左下のふち (ベゼル) だけを押さえ、文字盤はふさがない */}
      <g>
        <path d="M 74 1080 L 136 866 Q 210 806 300 846 L 352 1080 Z" fill="#8C7A5E" stroke={C.ink} strokeWidth={6} />
        <path d="M 128 884 Q 206 818 306 858 L 300 906 Q 208 866 150 920 Z" fill="#7A6A50" stroke={C.ink} strokeWidth={5} opacity={0.9} />
        <path d="M 142 872 Q 212 806 304 846 L 312 902 Q 214 862 160 926 Z" fill="#E6C49E" stroke={C.ink} strokeWidth={5.5} />
        {([[158, 704, -46], [180, 758, -28], [216, 798, -12], [266, 822, 6]] as [number, number, number][]).map(
          ([fx, fy, rot], i) => (
            <g key={i} transform={`translate(${fx} ${fy}) rotate(${rot})`}>
              <rect x={-18} y={-34} width={36} height={94} rx={18} fill="#E6C49E" stroke={C.ink} strokeWidth={5} />
              <path d="M -12 -2 q 12 10 24 0" stroke={C.ink} strokeWidth={3.5} fill="none" opacity={0.45} />
            </g>
          ),
        )}
      </g>
      {/* 竜頭を押す指 (左から)。ゴールで押し込まれ、そのまま止まっている */}
      <g transform={`translate(0 ${press * 13})`}>
        <path d="M -20 168 L 164 198 L 200 320 L -20 288 Z" fill="#8C7A5E" stroke={C.ink} strokeWidth={6} />
        <path d="M -16 196 L 152 224" stroke={C.ink} strokeWidth={4} opacity={0.3} />
        <ellipse cx={222} cy={266} rx={60} ry={54} fill="#E6C49E" stroke={C.ink} strokeWidth={5.5} transform="rotate(-24 222 266)" />
        <g transform="translate(272 300) rotate(-34)">
          <rect x={-16} y={-18} width={32} height={78} rx={16} fill="#E6C49E" stroke={C.ink} strokeWidth={5.5} />
          <path d="M -10 30 q 10 9 20 0" stroke={C.ink} strokeWidth={3.5} fill="none" opacity={0.45} />
        </g>
      </g>
      {/* 読み取った記録 (1/10秒まで読める = 精度) */}
      {read > 0 && (
        <g transform={`translate(612 652) scale(${pop(read)})`}>
          <rect x={-104} y={-46} width={208} height={88} rx={12} fill="#F4F1E4" stroke={C.ink} strokeWidth={5.5} />
          <text x={-14} y={22} fontSize={58} fontFamily={FONT} fontWeight={900} fill={C.ink} textAnchor="middle">10.6</text>
          <text x={62} y={20} fontSize={32} fontFamily={FONT} fill={C.ink} textAnchor="middle">秒</text>
        </g>
      )}
      <TagPlate x={1584} y={496} text="同じ物差し" size={50} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #119 極めつけは1930年。カナダの大会で、3段の表彰台が初めて使われました。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S119: React.FC<{ f: number }> = ({ f }) => {
  const lift = seg(f, 4, 40); // 1位→2位→3位の順に組み上がる
  return (
    <Frame f={f} seed={1018} bg="#BFD0DA">
      <Stadium f={f} year="1930" />
      {/* 観客 */}
      {[[150, 1], [340, 3], [560, 0], [790, 4], [1010, 2], [1230, 5], [1450, 5], [1670, 0], [1850, 3]].map(
        ([cx, r], i) => (
          <PersonMini
            key={i}
            x={cx}
            y={seatY(r, cx)}
            s={0.46 + (i % 3) * 0.03}
            color={CROWD_COL[(i + 1) % CROWD_COL.length]}
            f={f}
            phase={i * 5}
            face="dot"
            arms={i % 4 === 0 ? "up" : "down"}
          />
        ),
      )}
      <Podium f={f} lift={lift} />
      {/* 大工と槌 */}
      <Person x={1730} y={1016} s={1.02} f={f} phase={4} pose="hold" face="normal" cloth="#8C7A5E" clothDark="#6B5B42" gaze={[-5, 0]} />
      <g transform={`translate(1730 894) rotate(${-46 + Math.sin(f / 5) * 30})`}>
        <rect x={-11} y={-180} width={22} height={192} rx={8} fill={C.wood} stroke={C.ink} strokeWidth={4} />
        <rect x={-46} y={-224} width={92} height={56} rx={8} fill="#8C8C86" stroke={C.ink} strokeWidth={5} />
        <rect x={-46} y={-224} width={92} height={18} rx={6} fill="#A8A8A0" />
      </g>
      {/* 槌の音の線 */}
      {lift < 0.99 && (
        <g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${1636 - i * 24} ${636 - i * 30} q -28 -22 -56 0`}
              stroke={C.ink}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              opacity={0.3 + Math.sin((f + i * 6) / 5) * 0.28}
            />
          ))}
        </g>
      )}
      {/* 木くず */}
      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={i}
          d={`M ${1240 + i * 42} ${880 - (i % 3) * 18} q 14 -14 28 0`}
          stroke={C.woodDark}
          strokeWidth={4}
          fill="none"
          opacity={0.45}
        />
      ))}
      <TagPlate x={1360} y={316} text="1930年 3段の台" size={48} t={seg(f, 10, 26)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #120 オリンピックに登場するのは、1932年の冬季大会からです。
// 格: 並 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S120: React.FC<{ f: number }> = ({ f }) => {
  const pile = easeOut(seg(f, 8, 36)); // 雪が積もる
  return (
    <Frame f={f} seed={1019} bg="#D8E4EC">
      {/* 雪の競技場 */}
      <rect x={0} y={0} width={W} height={430} fill="#CBDAE4" />
      <rect x={0} y={0} width={W} height={150} fill="#B4C8D6" opacity={0.5} />
      {/* 遠くの雪山 */}
      <path d="M -20 430 L 300 180 L 520 330 L 760 150 L 1040 360 L 1300 210 L 1560 380 L 1940 250 L 1940 470 L -20 470 Z" fill="#E4ECF2" stroke="#BCCBD6" strokeWidth={5} />
      {[310, 770, 1310].map((px, i) => (
        <path key={px} d={`M ${px - 60} ${[238, 208, 268][i]} L ${px} ${[180, 150, 210][i]} L ${px + 60} ${[238, 208, 268][i]} Z`} fill="#FBFDFF" />
      ))}
      {/* 雪原 */}
      <path d="M -20 452 Q 960 418 1940 452 L 1940 1100 L -20 1100 Z" fill={C.snow} />
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M -20 ${560 + i * 56} Q 960 ${528 + i * 56} 1940 ${566 + i * 56}`} stroke={C.snowShade} strokeWidth={3} fill="none" opacity={0.5} />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <ellipse key={i} cx={((i * 157) % 20) * 98 + 30} cy={620 + ((i * 61) % 7) * 56} rx={44} ry={13} fill={C.snowShade} opacity={0.4} />
      ))}
      {/* 旗が1本 */}
      <g>
        <rect x={286} y={312} width={16} height={530} fill="#8C8C86" stroke={C.ink} strokeWidth={4} />
        <path d={`M 302 324 Q 400 ${352 + Math.sin(f / 11) * 10} 492 332 L 492 436 Q 400 ${456 + Math.sin(f / 11) * 10} 302 428 Z`} fill={C.red} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={294} cy={846} rx={46} ry={14} fill={C.snowShade} opacity={0.6} />
      </g>
      {/* 同じ3段の台が、雪の上に置かれる */}
      <Podium f={f} lift={1} snow gy={880} />
      {/* 降る雪 */}
      {Array.from({ length: 34 }).map((_, i) => (
        <circle
          key={i}
          cx={((i * 271) % 24) * 80 + ((f + i * 13) % 60) - 20}
          cy={((f * 1.5 + i * 97) % 1120) - 20}
          r={4 + (i % 3) * 2}
          fill="#FFFFFF"
          opacity={0.75}
        />
      ))}
      {/* 積もった雪 (手前) */}
      <path d={`M -20 ${1000 - pile * 10} Q 480 ${958 - pile * 20} 960 ${996 - pile * 14} Q 1460 ${1030 - pile * 24} 1940 ${986 - pile * 16} L 1940 1100 L -20 1100 Z`} fill="#FBFDFF" />
      <TagPlate x={1400} y={286} text="1932年 冬季から" size={48} t={seg(f, 12, 28)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #121 あの3段の台は、まだ96歳なのです。
// 格: 図 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ------------------------------------------------------------------
const S121: React.FC<{ f: number }> = ({ f }) => {
  const GTOP = 240;
  const GBOT = 800;
  const grow = easeOut(seg(f, 8, 34));
  const yAt = (yr: number) => GBOT - ((yr - 1930) / 96) * (GBOT - GTOP);
  return (
    <Frame f={f} seed={1020} bg={C.paper}>
      <DeskPaper f={f} id="ib6dp121" x={180} y={150} w={1560} h={690} />
      {/* 身長計のような年齢の目盛り */}
      <g>
        <rect x={1150} y={GTOP - 30} width={64} height={GBOT - GTOP + 60} rx={8} fill="#E2D7B4" stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 13 }).map((_, i) => {
          const yr = 1930 + i * 8;
          const gy = yAt(yr);
          const big = i % 2 === 0;
          return (
            <g key={yr}>
              <line x1={big ? 1142 : 1150} y1={gy} x2={big ? 1214 : 1190} y2={gy} stroke={C.ink} strokeWidth={big ? 4.5 : 2.5} opacity={0.8} />
              {big && (
                <text x={1132} y={gy + 11} fontSize={28} fontFamily={FONT} fill={C.ink} textAnchor="end" opacity={0.72}>{yr}</text>
              )}
            </g>
          );
        })}
        {/* 1930 → 2026 の帯が「96」でとまる */}
        <rect
          x={1164}
          y={yAt(2026)}
          width={36}
          height={(GBOT - yAt(2026)) * grow}
          fill={C.red}
          opacity={0.8}
          transform={`translate(0 ${(1 - grow) * (GBOT - yAt(2026))})`}
        />
        {/* 止まった高さの指し棒 */}
        <g opacity={grow}>
          <line x1={1164} y1={yAt(2026)} x2={1420} y2={yAt(2026)} stroke={C.ink} strokeWidth={5} />
          <rect x={1300} y={yAt(2026) + 14} width={226} height={74} rx={10} fill="#FBF7EA" stroke={C.ink} strokeWidth={5} />
          <text x={1413} y={yAt(2026) + 66} fontSize={48} fontFamily={FONT} fill={C.ink} textAnchor="middle">96歳</text>
        </g>
      </g>
      {/* 横に並べた 3段の台 (小さく・紙の上に乗せる) */}
      <g transform="translate(110 286) scale(0.56)">
        <Podium f={f} lift={1} nums gy={900} />
      </g>
      <TagPlate x={560} y={290} text="まだ96歳" size={58} t={seg(f, 18, 34)} color={C.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #122 1位の栄光と2位の悔しさを、全人類が同じ形で眺める装置が、そろいました。
// 格: 山 — 設計書 docs/briefs/IchiB6.md の表のとおり
// ※ 2位の人の顔だけ「dot」で伏せる (茶化さない)
// ------------------------------------------------------------------
const S122: React.FC<{ f: number }> = ({ f }) => {
  const look = seg(f, 10, 34);
  return (
    <Frame f={f} seed={1021} bg="#C3D3DC">
      <Stadium f={f} year="1930" flags />
      {/* 満員の観客席 (24人) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const cx = 70 + (i % 12) * 162 + (i >= 12 ? 54 : 0);
        const r = i < 12 ? (i % 3) : 3 + (i % 3);
        return (
          <PersonMini
            key={i}
            x={cx}
            y={seatY(r, cx)}
            s={0.42 + (i % 3) * 0.03}
            color={CROWD_COL[i % CROWD_COL.length]}
            f={f}
            phase={i * 2}
            face="dot"
            arms={i % 3 === 0 ? "up" : "down"}
          />
        );
      })}
      {/* 完成した3段の台と、乗った3人 */}
      <Podium f={f} lift={1} />
      <PersonMini x={960} y={474} s={1.42} color={C.gold} f={f} phase={0} face="smile" arms="up" />
      {/* 2位の人の顔だけ「dot」で伏せる (1位・3位は笑顔) */}
      <PersonMini x={560} y={590} s={1.3} color={C.silver} f={f} phase={2} face="dot" />
      <PersonMini x={1360} y={670} s={1.22} color={C.bronze} f={f} phase={4} face="smile" />
      {/* 四方から向くカメラ (黒い箱) */}
      {[
        { x: 120, y: 820, r: 14 },
        { x: 330, y: 780, r: 6 },
        { x: 1620, y: 790, r: -8 },
        { x: 1840, y: 826, r: -16 },
      ].map((cm, i) => (
        <g key={i} transform={`translate(${cm.x} ${cm.y}) rotate(${cm.r})`} opacity={look}>
          <rect x={-78} y={-62} width={156} height={112} rx={8} fill="#2E2E2E" stroke={C.ink} strokeWidth={5} />
          <rect x={-60} y={-86} width={60} height={26} rx={6} fill="#3C3C3C" stroke={C.ink} strokeWidth={4} />
          <circle cx={74} cy={-6} r={34} fill="#1C1C1C" stroke={C.ink} strokeWidth={5} />
          <circle cx={74} cy={-6} r={18} fill="#4A5A66" />
          <circle cx={66} cy={-14} r={7} fill="#D8E4EC" opacity={0.8} />
          <rect x={-10} y={50} width={20} height={70} fill="#3C3C3C" stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 視線の弧 (四方から台へ) */}
      <g opacity={look * 0.35}>
        {[[194, 814], [404, 774], [1694, 784], [1914, 820]].map(([sx, sy], i) => (
          <path key={i} d={`M ${sx} ${sy} Q ${(sx + 960) / 2} ${(sy as number) - 220} 960 620`} stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray="14 12" />
        ))}
      </g>
      <TagPlate x={1388} y={236} text="同じ形で眺める装置" size={48} t={seg(f, 16, 32)} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib6_s103:                  (f) => <S103 f={f} />,
  ib6_s104:                  (f) => <S104 f={f} />,
  ib6_s105:                  (f) => <S105 f={f} />,
  ib6_s106:                  (f) => <S106 f={f} />,
  ib6_s107:                  (f) => <S107 f={f} />,
  ib6_s108:                  (f) => <S108 f={f} />,
  ib6_s109:                  (f) => <S109 f={f} />,
  ib6_s110:                  (f) => <S110 f={f} />,
  ib6_s111:                  (f) => <S111 f={f} />,
  ib6_s112:                  (f) => <S112 f={f} />,
  ib6_s113:                  (f) => <S113 f={f} />,
  ib6_s114:                  (f) => <S114 f={f} />,
  ib6_s115:                  (f) => <S115 f={f} />,
  ib6_s116:                  (f) => <S116 f={f} />,
  ib6_s117:                  (f) => <S117 f={f} />,
  ib6_s118:                  (f) => <S118 f={f} />,
  ib6_s119:                  (f) => <S119 f={f} />,
  ib6_s120:                  (f) => <S120 f={f} />,
  ib6_s121:                  (f) => <S121 f={f} />,
  ib6_s122:                  (f) => <S122 f={f} />,
};

export const I_B6_MOTIFS: string[] = [
  "ib6_s103",                  // #103 第6章、2位が、発明された日。
  "ib6_s104",                  // #104 1896年、アテネで、近代オリンピックの第1回大会が開かれました。
  "ib6_s105",                  // #105 さて、この大会の優勝者は、金メダルを首にかけたでしょうか。
  "ib6_s106",                  // #106 かけていません。第1回の近代オリンピックに、金メダルは無かったのです。
  "ib6_s107",                  // #107 1位がもらったのは、銀メダルと、オリーブの枝でした。
  "ib6_s108",                  // #108 金・銀・銅が1位・2位・3位にそろって贈られた最初の大会は、1904年のセントルイス大会。
  "ib6_s109",                  // #109 いまから、たった120年ほど前です。
  "ib6_s110",                  // #110 しかも小ネタですが、この年の「金」は、純金ではなく金張りの銀でした。
  "ib6_s111",                  // #111 ここで、ちょっと考えてみてください。
  "ib6_s112",                  // #112 1位は、大昔からいました。古代オリンピアにも、勝者はいました。
  "ib6_s113",                  // #113 1904年に発明されたのは、1位ではありません。
  "ib6_s114",                  // #114 2位です。
  "ib6_s115",                  // #115 2位と3位に、名前と、メダルの色が与えられた。
  "ib6_s116",                  // #116 「惜しかった人」が、歴史に残る存在になった瞬間です。
  "ib6_s117",                  // #117 発明は続きます。1912年に国際陸上競技連盟が生まれ、「世界記録」の公認が始まりました。
  "ib6_s118",                  // #118 時計の精度が上がり、世界共通の物差しで測れるようになったからだとされています。
  "ib6_s119",                  // #119 極めつけは1930年。カナダの大会で、3段の表彰台が初めて使われました。
  "ib6_s120",                  // #120 オリンピックに登場するのは、1932年の冬季大会からです。
  "ib6_s121",                  // #121 あの3段の台は、まだ96歳なのです。
  "ib6_s122",                  // #122 1位の栄光と2位の悔しさを、全人類が同じ形で眺める装置が、そろいました。
];

export const ichiB6Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B6_PREVIEW_FRAMES = Math.max(I_B6_MOTIFS.length, 1);
export const IchiB6Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B6_MOTIFS.length - 1);
  return <>{ichiB6Scene(I_B6_MOTIFS[i] ?? "", 45)}</>;
};
