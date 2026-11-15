// 「『2位』は、120年前に発明された」: 第7章「毎年日本一は新聞がつくった。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#123〜#142 (20文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで20枚。
// motif 名は必ず ib7_ で始める。WobbleDefs の seed はこのファイルでは 1022〜1041 を使う。
// 設計書: docs/briefs/IchiB7.md (1文ごとの「格」と絵の中身を決めてから描く)
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
  news: "#EFE9D8",      // 新聞紙
  newsDark: "#DBD2BB",
  wall: "#E7DFCD",      // 工場の壁
  steel: "#949186",     // 鉄骨
  steelDark: "#6E6A61",
  roller: "#CFC8BC",
  floor: "#CBBFA6",     // 工場の土間
  desk: "#B2905F",      // 編集机
  deskDark: "#8C6E4A",
  paper: "#FBF7EA",     // 校正紙
  kokugi: "#E2D7BF",    // 国技館の壁
  tatami: "#C9B88E",
  roof: "#8A929A",      // 瓦
  brick: "#B06A4E",     // 煉瓦
  sky: "#D7E4EC",
  dirt: "#C4B393",      // 土の道
  red: "#D3402E",
  gold: "#D2AE52",
  goldDark: "#A98833",
  cloth: "#5E7B96",
  green: "#7FBF7A",
  ball: "#F4EFE2",
};

// ===================================================================
// 第16条の床 (4種類だけに絞って使い回す)
// ===================================================================

// 1. 新聞社の工場。鉄骨の梁・高窓・吊りランプ・紙ロール・インクの染みた土間
const PressHall: React.FC<{ f: number; lamps?: number }> = ({ f, lamps = 2 }) => (
  <g>
    <rect x={0} y={0} width={W} height={640} fill={C.wall} />
    {/* 高窓 */}
    {[220, 760, 1300].map((wx, i) => (
      <g key={i} opacity={0.9}>
        <rect x={wx} y={150} width={400} height={190} rx={6} fill={KRP.paperCool} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((k) => (
          <line key={k} x1={wx + 100 + k * 100} y1={152} x2={wx + 100 + k * 100} y2={338} stroke={C.ink} strokeWidth={3} opacity={0.55} />
        ))}
        <line x1={wx + 2} y1={245} x2={wx + 398} y2={245} stroke={C.ink} strokeWidth={3} opacity={0.55} />
      </g>
    ))}
    {/* 鉄骨の梁 (上下の弦材と斜めのブレース) */}
    <g>
      <rect x={0} y={60} width={W} height={16} fill={C.steel} stroke={C.ink} strokeWidth={4} />
      <rect x={0} y={122} width={W} height={16} fill={C.steel} stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={i} x1={i * 160} y1={76} x2={i * 160 + 160} y2={122} stroke={C.steelDark} strokeWidth={5} />
      ))}
    </g>
    {/* 柱 */}
    {[60, 1832].map((cx, i) => (
      <g key={i}>
        <rect x={cx} y={138} width={28} height={500} fill={C.steel} stroke={C.ink} strokeWidth={4.5} />
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={cx + 14} cy={200 + k * 120} r={5} fill={C.steelDark} />
        ))}
      </g>
    ))}
    {/* 吊りランプ */}
    {Array.from({ length: lamps }).map((_, i) => {
      const lx = 480 + i * 960;
      const sw = Math.sin((f + i * 9) / 16) * 5;
      return (
        <g key={i} transform={`translate(${lx} 138) rotate(${sw} 0 0)`}>
          <line x1={0} y1={0} x2={0} y2={92} stroke={C.ink} strokeWidth={4} />
          <path d="M -54 92 L 54 92 L 30 142 L -30 142 Z" fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={148} r={17} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={148} r={46} fill={KRP.yellow} opacity={0.16} />
        </g>
      );
    })}
    {/* 土間 */}
    <rect x={0} y={636} width={W} height={H - 636} fill={C.floor} />
    {[700, 780, 862, 950, 1040].map((gy, i) => (
      <line key={i} x1={0} y1={gy} x2={W} y2={gy} stroke={C.ink} strokeWidth={2.5} opacity={0.2} />
    ))}
    {[[180, 712, 54, 16], [1420, 760, 70, 20], [860, 900, 60, 18], [1660, 980, 48, 14]].map(
      ([ex, ey, rx, ry], i) => (
        <ellipse key={i} cx={ex} cy={ey} rx={rx} ry={ry} fill={C.ink} opacity={0.17} />
      ),
    )}
    {/* 紙ロール */}
    {[[108, 760, 1], [252, 790, 0.82]].map(([rx, ry, rs], i) => (
      <g key={i} transform={`translate(${rx} ${ry}) scale(${rs})`}>
        <rect x={-74} y={-54} width={148} height={108} fill={C.news} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={-74} cy={0} rx={22} ry={54} fill={C.newsDark} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={-74} cy={0} rx={8} ry={20} fill={C.ink} opacity={0.3} />
      </g>
    ))}
  </g>
);

// 2. 国技館の内部。格天井・吊り屋根・幟・桟敷
const Kokugikan: React.FC<{ f: number; nobori?: boolean; roof?: boolean }> = ({
  f, nobori = true, roof = true,
}) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={C.kokugi} />
    {/* 格天井 */}
    <g opacity={0.8}>
      <rect x={0} y={0} width={W} height={168} fill="#D6C9AC" />
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={i} x1={i * 160} y1={0} x2={i * 160} y2={168} stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
      ))}
      {[56, 112].map((ly, i) => (
        <line key={i} x1={0} y1={ly} x2={W} y2={ly} stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
      ))}
      <line x1={0} y1={168} x2={W} y2={168} stroke={C.ink} strokeWidth={6} />
    </g>
    {/* 吊り屋根 (房つき) */}
    <g opacity={roof ? 1 : 0}>
      <path d="M 430 176 L 1490 176 L 1330 286 L 590 286 Z" fill="#8E6B46" stroke={C.ink} strokeWidth={6} />
      <path d="M 430 176 L 1490 176 L 1472 206 L 448 206 Z" fill="#A98157" opacity={0.85} />
      {[600, 1320].map((tx, i) => (
        <g key={i} transform={`translate(${tx} 286) rotate(${Math.sin((f + i * 11) / 18) * 3})`}>
          <rect x={-16} y={0} width={32} height={70} fill={i === 0 ? C.red : "#4F7A4A"} stroke={C.ink} strokeWidth={4} />
          <path d="M -16 70 L 16 70 L 8 104 L -8 104 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
    </g>
    {/* 幟 */}
    {nobori &&
      [[120, C.red], [1760, "#4F7A4A"]].map(([nx, col], i) => (
        <g key={i} transform={`translate(${nx} 300) rotate(${Math.sin((f + i * 13) / 20) * 1.6})`}>
          <line x1={0} y1={-120} x2={0} y2={520} stroke={C.deskDark} strokeWidth={9} />
          <rect x={-46} y={-92} width={92} height={430} fill={col as string} stroke={C.ink} strokeWidth={5} />
          <rect x={-46} y={-92} width={92} height={30} fill={KRP.white} opacity={0.7} />
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={-22} y={-20 + k * 74} width={44} height={44} rx={5} fill={KRP.white} opacity={0.78} />
          ))}
        </g>
      ))}
    {/* 桟敷 (ひな壇の客席) */}
    <g>
      <rect x={0} y={666} width={W} height={H - 666} fill={C.tatami} />
      {[666, 760, 862, 968].map((sy, i) => (
        <g key={i}>
          <line x1={0} y1={sy} x2={W} y2={sy} stroke={C.ink} strokeWidth={5} opacity={0.6} />
          {Array.from({ length: 9 }).map((_, k) => (
            <line key={k} x1={k * 240 + (i % 2) * 120} y1={sy} x2={k * 240 + (i % 2) * 120} y2={sy + 96} stroke={C.ink} strokeWidth={3} opacity={0.32} />
          ))}
        </g>
      ))}
    </g>
  </g>
);

// 3. 編集机に広げた校正紙。方眼はこの紙に clip する。活字ケース・インク壺・ペン
const EditorDesk: React.FC<{ cid: string }> = ({ cid }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={C.desk} />
    {[70, 300, 560, 820, 1010].map((wy, i) => (
      <path key={i} d={`M 0 ${wy} Q 480 ${wy - 16} 960 ${wy} T 1920 ${wy}`} stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.4} />
    ))}
    {/* 校正紙 */}
    <rect x={212} y={150} width={1500} height={706} rx={4} fill={C.ink} opacity={0.18} transform="translate(12 14)" />
    <rect x={200} y={140} width={1500} height={706} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={5} />
    <rect x={222} y={162} width={1456} height={662} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.3} />
    <clipPath id={cid}>
      <rect x={200} y={140} width={1500} height={706} />
    </clipPath>
    <g clipPath={`url(#${cid})`} opacity={0.55}>
      <GridPaper tombo={false} />
    </g>
    {/* 活字ケース (左の余白) */}
    <g>
      <rect x={14} y={430} width={172} height={420} rx={6} fill={C.deskDark} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={26 + (i % 2) * 82} y={444 + Math.floor(i / 2) * 80} width={74} height={70} rx={3}
          fill={i % 3 === 0 ? C.steelDark : "#776F63"} stroke={C.ink} strokeWidth={3.5} />
      ))}
    </g>
    {/* インク壺とペン (右の余白) */}
    <g>
      <ellipse cx={1812} cy={812} rx={70} ry={20} fill={C.ink} opacity={0.2} />
      <path d="M 1760 712 L 1864 712 L 1854 802 L 1770 802 Z" fill="#3E4A5A" stroke={C.ink} strokeWidth={5} />
      <ellipse cx={1812} cy={712} rx={52} ry={16} fill="#1E2630" stroke={C.ink} strokeWidth={4.5} />
      <line x1={1788} y1={700} x2={1876} y2={556} stroke="#E2DBC9" strokeWidth={11} strokeLinecap="round" />
      <line x1={1788} y1={700} x2={1800} y2={678} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    </g>
  </g>
);

// 4. 明治の街。煉瓦の建物・瓦屋根・電信柱・看板・土の道
const MeijiStreet: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={0} width={W} height={620} fill={C.sky} />
    {[[260, 120, 0.5], [900, 86, 0.4], [1520, 150, 0.45]].map(([cx, cy, op], i) => (
      <g key={i} opacity={op as number}>
        <ellipse cx={cx as number} cy={cy as number} rx={150} ry={44} fill={KRP.white} />
        <ellipse cx={(cx as number) + 90} cy={(cy as number) - 20} rx={96} ry={36} fill={KRP.white} />
      </g>
    ))}
    {/* 左: 瓦屋根の町家 */}
    <g>
      <rect x={0} y={400} width={620} height={300} fill="#DCD2BE" stroke={C.ink} strokeWidth={5} />
      <path d="M -20 404 L 300 286 L 640 404 Z" fill={C.roof} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={20 + i * 90} y1={390} x2={300 - (300 - (20 + i * 90)) * 0.1} y2={292} stroke={C.ink} strokeWidth={3} opacity={0.4} />
      ))}
      {[70, 250, 430].map((dx, i) => (
        <rect key={i} x={dx} y={470} width={130} height={160} fill="#C7BBA2" stroke={C.ink} strokeWidth={4.5} />
      ))}
    </g>
    {/* 右: 煉瓦の建物 */}
    <g>
      <rect x={1300} y={240} width={620} height={470} fill={C.brick} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={1300} y1={262 + i * 38} x2={1920} y2={262 + i * 38} stroke={C.ink} strokeWidth={2} opacity={0.22} />
      ))}
      {[1360, 1540, 1720].map((bx, i) => (
        <g key={i}>
          <rect x={bx} y={320} width={120} height={160} rx={58} fill={KRP.paperCool} stroke={C.ink} strokeWidth={5} />
          <line x1={bx + 60} y1={322} x2={bx + 60} y2={478} stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
      ))}
      <rect x={1300} y={222} width={620} height={26} fill="#8E5339" stroke={C.ink} strokeWidth={5} />
    </g>
    {/* 看板 */}
    <g transform={`rotate(${-2 + Math.sin(f / 19) * 1.2} 700 434)`}>
      <rect x={660} y={434} width={240} height={74} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={690 + i * 70} y={454} width={46} height={34} rx={4} fill={C.ink} opacity={0.5} />
      ))}
    </g>
    {/* 電信柱 */}
    {[[960, 1], [1180, 0.74]].map(([px, ps], i) => (
      <g key={i} transform={`translate(${px} 0) scale(${ps})`}>
        <rect x={-13} y={150} width={26} height={600} fill={C.deskDark} stroke={C.ink} strokeWidth={4.5} />
        {[210, 280].map((ay, k) => (
          <g key={k}>
            <rect x={-82} y={ay} width={164} height={13} fill={C.deskDark} stroke={C.ink} strokeWidth={4} />
            {[-64, 64].map((ix, m) => (
              <circle key={m} cx={ix} cy={ay - 12} r={9} fill={KRP.paperCool} stroke={C.ink} strokeWidth={3.5} />
            ))}
          </g>
        ))}
      </g>
    ))}
    <path d="M 878 198 Q 1060 236 1142 212" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.6} />
    <path d="M 878 268 Q 1060 306 1142 274" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.6} />
    {/* 土の道 */}
    <rect x={0} y={700} width={W} height={H - 700} fill={C.dirt} />
    <path d="M 0 700 Q 480 716 960 702 T 1920 710" stroke={C.ink} strokeWidth={5} fill="none" opacity={0.5} />
    {Array.from({ length: 16 }).map((_, i) => (
      <ellipse key={i} cx={60 + ((i * 271) % 1820)} cy={740 + ((i * 97) % 300)} rx={22 + (i % 4) * 9} ry={7 + (i % 3) * 3}
        fill={C.ink} opacity={0.11} />
    ))}
    <g opacity={0.5}>
      {[[300, 940], [1500, 900]].map(([sx, sy], i) => (
        <path key={i} d={`M ${sx} ${sy} l 46 -10 l 6 22 l -46 10 Z`} fill={C.ink} opacity={0.5} />
      ))}
    </g>
  </g>
);

// 八分音符。#139 の壁を飾るのに使う。旗つき (単音) と連桁つき (2つ) を1つの部品で出し分ける
const MusicNote: React.FC<{ x: number; y: number; s?: number; op?: number; beam?: boolean }> = ({
  x, y, s = 1, op = 0.45, beam = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={20} ry={15} fill={C.ink} transform="rotate(-20)" />
    <rect x={15} y={-76} width={7} height={78} fill={C.ink} />
    {beam ? (
      <g>
        <ellipse cx={74} cy={12} rx={20} ry={15} fill={C.ink} transform="rotate(-20 74 12)" />
        <rect x={89} y={-64} width={7} height={78} fill={C.ink} />
        <path d="M 15 -76 L 96 -64 L 96 -42 L 15 -54 Z" fill={C.ink} />
      </g>
    ) : (
      <path d="M 22 -76 q 38 18 26 56 q 4 -32 -26 -40 Z" fill={C.ink} />
    )}
  </g>
);

// 5. 音楽の部屋 (#139 専用の床)。★2026-11-08 作者指示「背景を音楽っぽい感じに」
//   直す前は編集机 (EditorDesk) の校正紙の上にチャート盤を2枚並べただけで、
//   音楽の物がレコード1枚しかなく「音楽の話」に見えなかった。
//   壁に五線譜と音符を流し、床は板張り。そのうえで左右に国と時代の目印を置く:
//     左 = 1940年のアメリカ → ジュークボックス (アーチ屋根・光る管・回るレコード)
//     右 = 1968年の日本     → 家具調ステレオ (脚つきの木箱・布目のスピーカー・ターンテーブル)
//   チャート盤は x=608 と x=1176 に立つので、左は x<400・右は x>1430 に収めて重ねない。
const MusicRoom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 壁 */}
    <rect x={0} y={0} width={W} height={708} fill="#E9DCC2" />
    {[96, 262, 424, 586].map((wy, i) => (
      <line key={i} x1={0} y1={wy} x2={W} y2={wy} stroke={C.deskDark} strokeWidth={3} opacity={0.11} />
    ))}
    {/* 五線譜が壁を2段よこぎる。これだけで「音楽の部屋」と1秒で分かる */}
    {[158, 468].map((sy, si) => (
      <g key={si} opacity={0.28}>
        {[0, 1, 2, 3, 4].map((k) => (
          <line key={k} x1={0} y1={sy + k * 19} x2={W} y2={sy + k * 19} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 小節線 */}
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <line key={k} x1={140 + k * 290} y1={sy} x2={140 + k * 290} y2={sy + 76} stroke={C.ink} strokeWidth={4} opacity={0.8} />
        ))}
      </g>
    ))}
    {/* 音符。五線の上でゆっくり上下する (止め絵でも空気が動く) */}
    {([
      [118, 206, 0.9, false], [268, 240, 0.72, true], [862, 196, 0.8, true],
      [1424, 212, 0.85, false], [1726, 248, 0.68, true], [1858, 190, 0.6, false],
      [160, 520, 0.72, true], [900, 536, 0.76, false], [1880, 516, 0.6, true],
    ] as [number, number, number, boolean][]).map(([nx, ny, ns, nb], i) => (
      <MusicNote key={i} x={nx} y={ny + Math.sin((f + i * 13) / 15) * 7} s={ns} beam={nb} op={0.4} />
    ))}
    {/* 幅木と板張りの床 */}
    <rect x={0} y={700} width={W} height={18} fill={C.deskDark} stroke={C.ink} strokeWidth={4} opacity={0.9} />
    <rect x={0} y={716} width={W} height={H - 716} fill="#BE8C53" />
    {[790, 876, 974, 1062].map((fy, i) => (
      <line key={i} x1={0} y1={fy} x2={W} y2={fy} stroke={C.deskDark} strokeWidth={4} opacity={0.4} />
    ))}
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={i} x1={120 + i * 180} y1={716} x2={60 + i * 212} y2={H}
        stroke={C.deskDark} strokeWidth={3} opacity={0.22} />
    ))}
    {/* 左: 1940年のアメリカ = ジュークボックス */}
    <g>
      <ellipse cx={214} cy={812} rx={168} ry={26} fill={C.ink} opacity={0.18} />
      {/* アーチ屋根 (本体より先に描いて下半分を本体で隠す) */}
      <path d="M 66 520 Q 214 300 362 520 Z" fill="#A9763F" stroke={C.ink} strokeWidth={6} />
      {/* 光る管。左右で色を変え、f でゆっくり明滅させる */}
      {([[108, C.red, 0], [320, "#7FBF7A", 1]] as [number, string, number][]).map(([tx, col, k]) => (
        <path key={k} d={`M ${tx} 516 Q ${tx + (k ? -40 : 40)} 388 214 346`}
          stroke={col} strokeWidth={13} fill="none" strokeLinecap="round"
          opacity={0.6 + 0.3 * Math.sin((f + k * 11) / 9)} />
      ))}
      {/* 本体 */}
      <rect x={66} y={486} width={296} height={322} rx={10} fill="#8E6B46" stroke={C.ink} strokeWidth={6} />
      <rect x={66} y={486} width={296} height={14} fill={KRP.white} opacity={0.16} />
      {/* レコードの見える窓 */}
      <rect x={110} y={510} width={208} height={128} rx={8} fill={KRP.paperCool} stroke={C.ink} strokeWidth={5} />
      <g transform={`rotate(${f * 3.2} 214 574)`}>
        <circle cx={214} cy={574} r={50} fill="#2E2A26" stroke={C.ink} strokeWidth={4} />
        {[22, 34, 44].map((rr, i) => (
          <circle key={i} cx={214} cy={574} r={rr} fill="none" stroke={KRP.gray} strokeWidth={2} opacity={0.45} />
        ))}
        <circle cx={214} cy={574} r={13} fill={C.red} stroke={C.ink} strokeWidth={3} />
      </g>
      {/* 選曲ボタンの列 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={114 + i * 34} y={656} width={26} height={26} rx={4}
          fill={i % 2 ? C.paper : C.newsDark} stroke={C.ink} strokeWidth={4} />
      ))}
      {/* スピーカーの格子 */}
      <rect x={110} y={700} width={208} height={84} rx={6} fill="#6E5537" stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={118 + i * 24} y1={702} x2={94 + i * 24} y2={782} stroke={C.ink} strokeWidth={3} opacity={0.35} />
      ))}
    </g>
    {/* 中央の空き: レコードのジャケットが床に立てかけてある */}
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${832 + i * 26} ${806 - i * 6}) rotate(${-7 + i * 3})`}>
          <rect x={-66} y={-132} width={132} height={132} rx={4}
            fill={[C.cloth, C.red, "#6D5A8C"][i]} stroke={C.ink} strokeWidth={5} opacity={0.92} />
          <circle cx={0} cy={-66} r={38} fill="#2E2A26" stroke={C.ink} strokeWidth={4} opacity={0.75} />
          <circle cx={0} cy={-66} r={10} fill={C.paper} />
        </g>
      ))}
    </g>
    {/* 右: 1968年の日本 = 家具調ステレオ */}
    <g>
      <ellipse cx={1686} cy={818} rx={212} ry={24} fill={C.ink} opacity={0.18} />
      {/* 細い脚 (この時代の家具の形) */}
      {([[1530, -7], [1842, 7]] as [number, number][]).map(([lx, rot], i) => (
        <rect key={i} x={lx - 10} y={714} width={20} height={96} rx={5}
          fill={C.deskDark} stroke={C.ink} strokeWidth={4} transform={`rotate(${rot} ${lx} 762)`} />
      ))}
      {/* 箱 */}
      <rect x={1484} y={568} width={404} height={152} rx={8} fill="#A9763F" stroke={C.ink} strokeWidth={6} />
      <rect x={1484} y={568} width={404} height={14} fill={KRP.white} opacity={0.18} />
      {/* 布目のスピーカーネット 2枚 */}
      {[1504, 1736].map((sx, i) => (
        <g key={i}>
          <rect x={sx} y={592} width={148} height={106} rx={6} fill="#C9B894" stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 7 }).map((_, k) => (
            <line key={k} x1={sx + 6 + k * 23} y1={594} x2={sx + 6 + k * 23} y2={696}
              stroke={C.ink} strokeWidth={2.5} opacity={0.22} />
          ))}
          {Array.from({ length: 5 }).map((_, k) => (
            <line key={k} x1={sx + 2} y1={600 + k * 23} x2={sx + 146} y2={600 + k * 23}
              stroke={C.ink} strokeWidth={2.5} opacity={0.22} />
          ))}
        </g>
      ))}
      {/* つまみ3つ */}
      {[612, 648, 684].map((ky, i) => (
        <g key={i}>
          <circle cx={1694} cy={ky} r={14} fill={C.gold} stroke={C.ink} strokeWidth={4} />
          <line x1={1694} y1={ky} x2={1694 + 9} y2={ky - 8} stroke={C.ink} strokeWidth={3} />
        </g>
      ))}
      {/* 上板のターンテーブル。盤が回り、トーンアームが溝に乗っている */}
      <g>
        <ellipse cx={1672} cy={560} rx={128} ry={36} fill="#8E6B46" stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${f * 4} 1672 558)`}>
          <ellipse cx={1672} cy={558} rx={104} ry={29} fill="#2E2A26" stroke={C.ink} strokeWidth={4} />
          {[36, 58, 80].map((rr, i) => (
            <ellipse key={i} cx={1672} cy={558} rx={rr} ry={rr * 0.28} fill="none"
              stroke={KRP.gray} strokeWidth={2} opacity={0.45} />
          ))}
          <ellipse cx={1672} cy={558} rx={24} ry={7} fill={C.red} stroke={C.ink} strokeWidth={3} />
        </g>
        <circle cx={1812} cy={520} r={13} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
        <line x1={1812} y1={520} x2={1722} y2={552} stroke={C.steelDark} strokeWidth={9} strokeLinecap="round" />
      </g>
    </g>
  </g>
);

// ===================================================================
// 使い回す部品 (絵を複製しない。phase / 数値だけ変える)
// ===================================================================

// #137 の縦3分割の仕切り。明治の通りの上に立てた板のつもり (三幅対の中縁)
const PanelRule: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x + 9} y={0} width={14} height={H} fill={C.ink} opacity={0.17} />
    <rect x={x - 9} y={0} width={18} height={H} fill={C.deskDark} stroke={C.ink} strokeWidth={5} />
    <rect x={x - 4} y={0} width={5} height={H} fill={KRP.white} opacity={0.22} />
  </g>
);

// 工場の棚 (PressHall の壁の上に置く。#133 #135 #136 で同じ棚を使い回す)
const ShelfRack: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={C.wall} />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={0} y1={120 + i * 250} x2={W} y2={120 + i * 250} stroke={C.ink} strokeWidth={2} opacity={0.12} />
    ))}
    {/* 支柱 */}
    {[56, 606, 1256, 1834].map((px, i) => (
      <rect key={i} x={px} y={150} width={30} height={852} fill={C.deskDark} stroke={C.ink} strokeWidth={4.5} />
    ))}
    {/* 棚板 */}
    {[318, 572, 826].map((sy, i) => (
      <g key={i}>
        <rect x={40} y={sy} width={1840} height={20} fill={C.desk} stroke={C.ink} strokeWidth={5} />
        <rect x={40} y={sy + 20} width={1840} height={12} fill={C.ink} opacity={0.17} />
      </g>
    ))}
    {/* 棚の荷物 (紙束・缶・瓶) */}
    {[
      { x: 130, y: 318, n: 5 }, { x: 330, y: 318, n: 3 },
      { x: 1360, y: 572, n: 4 }, { x: 1620, y: 572, n: 6 },
      { x: 150, y: 826, n: 4 }, { x: 1700, y: 826, n: 3 },
    ].map((b, i) => (
      <g key={i}>
        {Array.from({ length: b.n }).map((_, k) => (
          <rect key={k} x={b.x + (k % 2) * 10} y={b.y - 22 - k * 22} width={146} height={22} rx={3}
            fill={k % 2 ? C.newsDark : C.news} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>
    ))}
    {[[430, 572], [1420, 318], [330, 826]].map(([cx, cy], i) => (
      <g key={i}>
        <rect x={cx} y={cy - 92} width={76} height={92} rx={5} fill={C.steelDark} stroke={C.ink} strokeWidth={4.5} />
        <rect x={cx + 10} y={cy - 74} width={56} height={26} rx={3} fill={KRP.white} opacity={0.7} />
      </g>
    ))}
    {/* 土間 */}
    <rect x={0} y={1000} width={W} height={H - 1000} fill={C.floor} />
    <ellipse cx={1120} cy={1046} rx={76} ry={18} fill={C.ink} opacity={0.15} />
    <g opacity={0.5 + Math.sin(f / 21) * 0.08}>
      <circle cx={1792} cy={214} r={15} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
      <circle cx={1792} cy={214} r={44} fill={KRP.yellow} opacity={0.14} />
      <line x1={1792} y1={150} x2={1792} y2={198} stroke={C.ink} strokeWidth={4} />
    </g>
  </g>
);

// 輪転機。run = 回転量 (0 で止まる)
const RotaryPress: React.FC<{ x: number; y: number; s?: number; f: number; run?: number }> = ({
  x, y, s = 1, f, run = 1,
}) => {
  const a = f * 6 * run;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={86} rx={252} ry={26} fill={C.ink} opacity={0.2} />
      {/* 台座 */}
      <rect x={-232} y={16} width={464} height={74} rx={6} fill={C.steelDark} stroke={C.ink} strokeWidth={6} />
      {/* 本体 */}
      <rect x={-212} y={-316} width={424} height={338} rx={14} fill={C.steel} stroke={C.ink} strokeWidth={6} />
      <rect x={-212} y={-316} width={424} height={34} rx={14} fill={KRP.white} opacity={0.18} />
      {[-190, 190].map((rx2, i) => (
        <g key={i}>
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={rx2} cy={-274 + k * 92} r={6} fill={C.ink} opacity={0.45} />
          ))}
        </g>
      ))}
      {/* 大ローラー */}
      <g transform={`rotate(${a} -86 -168)`}>
        <circle cx={-86} cy={-168} r={104} fill={C.roller} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <line key={k} x1={-86} y1={-168} x2={-86 + Math.cos((k * Math.PI) / 3) * 98} y2={-168 + Math.sin((k * Math.PI) / 3) * 98}
            stroke={C.ink} strokeWidth={5} opacity={0.5} />
        ))}
      </g>
      <circle cx={-86} cy={-168} r={18} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
      {/* 小ローラー */}
      <g transform={`rotate(${-a * 1.7} 112 -124)`}>
        <circle cx={112} cy={-124} r={62} fill={C.roller} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => (
          <line key={k} x1={112 - Math.cos((k * Math.PI) / 3) * 56} y1={-124 - Math.sin((k * Math.PI) / 3) * 56}
            x2={112 + Math.cos((k * Math.PI) / 3) * 56} y2={-124 + Math.sin((k * Math.PI) / 3) * 56}
            stroke={C.ink} strokeWidth={5} opacity={0.5} />
        ))}
      </g>
      {/* 歯車 */}
      <g transform={`rotate(${-a * 1.3} 158 -24)`}>
        <circle cx={158} cy={-24} r={46} fill={C.goldDark} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 10 }).map((_, k) => (
          <rect key={k} x={154} y={-94} width={9} height={20} fill={C.goldDark} stroke={C.ink} strokeWidth={3}
            transform={`rotate(${k * 36} 158 -24)`} />
        ))}
        <circle cx={158} cy={-24} r={13} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// 新聞。phase で紙面の中身だけ変わる (同じ新聞の形)
type NewsPhase = "ad" | "koshien" | "hakone" | "toshi" | "rank";
const NewsSheet: React.FC<{
  x: number; y: number; s?: number; f: number; phase: NewsPhase; org?: string; year?: string; rot?: number;
}> = ({ x, y, s = 1, f, phase, org, year, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-252} y={-348} width={520} height={716} rx={4} fill={C.ink} opacity={0.18} />
    <rect x={-260} y={-360} width={520} height={716} rx={4} fill={C.news} stroke={C.ink} strokeWidth={6} />
    {/* 題字 */}
    <rect x={-236} y={-336} width={472} height={86} fill={C.newsDark} stroke={C.ink} strokeWidth={4.5} />
    {org && (
      <text x={-212} y={-274} fontSize={54} fontFamily={FONT} fill={C.ink} textAnchor="start">{org}</text>
    )}
    {year && (
      <text x={212} y={-278} fontSize={38} fontFamily={FONT} fill={C.ink} textAnchor="end" opacity={0.85}>{year}</text>
    )}
    {/* 本文の段 */}
    {[0, 1, 2, 3].map((col) => (
      <g key={col}>
        <line x1={-236 + col * 118} y1={-226} x2={-236 + col * 118} y2={330} stroke={C.ink} strokeWidth={2.5} opacity={0.28} />
        {Array.from({ length: 11 }).map((_, k) => (
          <line key={k} x1={-224 + col * 118} y1={236 - k * 18} x2={-136 + col * 118} y2={236 - k * 18}
            stroke={C.ink} strokeWidth={4} opacity={0.3} />
        ))}
      </g>
    ))}
    {/* 紙面の小絵 */}
    <rect x={-224} y={-212} width={448} height={300} rx={5} fill={C.paper} stroke={C.ink} strokeWidth={5} />
    <g>
      {phase === "ad" && (
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-184} y={-176 + i * 92} width={368 - i * 70} height={54} rx={6}
              fill={i === 0 ? C.red : C.newsDark} stroke={C.ink} strokeWidth={4.5} opacity={i === 0 ? 0.9 : 1} />
          ))}
        </g>
      )}
      {phase === "koshien" && (
        <g>
          <circle cx={-78} cy={-56} r={62} fill={C.ball} stroke={C.ink} strokeWidth={6} />
          <path d="M -124 -96 Q -90 -56 -124 -16" stroke={C.red} strokeWidth={5} fill="none" />
          <path d="M -32 -96 Q -66 -56 -32 -16" stroke={C.red} strokeWidth={5} fill="none" />
          <g transform="translate(110 -46) rotate(34)">
            <rect x={-18} y={-116} width={36} height={176} rx={16} fill="#C89A5E" stroke={C.ink} strokeWidth={6} />
            <rect x={-13} y={60} width={26} height={54} rx={10} fill="#9A7442" stroke={C.ink} strokeWidth={5} />
          </g>
          <path d="M -196 46 L 196 46" stroke={C.ink} strokeWidth={4} opacity={0.35} />
        </g>
      )}
      {phase === "hakone" && (
        <g>
          {/* 山道 */}
          <path d="M -214 72 L -90 -84 L 10 10 L 110 -130 L 214 72 Z" fill="#9FB9A2" stroke={C.ink} strokeWidth={5} opacity={0.75} />
          <path d="M -200 66 Q -60 40 20 -6 T 206 54" stroke={C.paper} strokeWidth={13} fill="none" />
          <path d="M -200 66 Q -60 40 20 -6 T 206 54" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.45} strokeDasharray="12 14" />
          {/* 襷 */}
          <g transform="translate(-6 -126) rotate(-18)">
            <rect x={-96} y={-18} width={192} height={38} rx={8} fill={C.red} stroke={C.ink} strokeWidth={5} />
            <rect x={-96} y={-18} width={192} height={12} rx={8} fill={KRP.white} opacity={0.42} />
          </g>
        </g>
      )}
      {phase === "toshi" && (
        <g>
          {/* 都市の旗 */}
          {[-130, 0, 130].map((fx, i) => (
            <g key={i} transform={`translate(${fx} -70)`}>
              <line x1={0} y1={-96} x2={0} y2={92} stroke={C.ink} strokeWidth={6} />
              <path d={`M 0 -92 L ${72 + Math.sin((f + i * 10) / 12) * 8} -70 L 0 -40 Z`}
                fill={[C.cloth, C.red, C.green][i]} stroke={C.ink} strokeWidth={5} />
            </g>
          ))}
          <circle cx={120} cy={40} r={40} fill={C.ball} stroke={C.ink} strokeWidth={6} />
          <path d="M 86 16 Q 112 40 86 64" stroke={C.red} strokeWidth={4} fill="none" />
          <path d="M -200 66 L 200 66" stroke={C.ink} strokeWidth={4} opacity={0.3} />
        </g>
      )}
      {phase === "rank" && (
        <g>
          {[1, 2, 3].map((n, i) => (
            <g key={n}>
              <text x={-192} y={-116 + i * 88} fontSize={56} fontFamily={FONT} fill={C.ink} textAnchor="start">{n}</text>
              <rect x={-124} y={-152 + i * 88} width={300 - i * 60} height={44} rx={6} fill={C.newsDark} stroke={C.ink} strokeWidth={4.5} />
              <text x={-108} y={-118 + i * 88} fontSize={38} fontFamily={FONT} fill={C.ink} opacity={0.7}>—</text>
            </g>
          ))}
        </g>
      )}
    </g>
  </g>
);

// 優勝額。empty = 空の額 / portrait = 力士の肖像 / official = 角印が押される
const YushoGaku: React.FC<{
  x: number; y: number; s?: number; f: number; phase: "empty" | "portrait" | "official"; stampT?: number;
}> = ({ x, y, s = 1, f, phase, stampT = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 金縁 */}
    <rect x={-268} y={-196} width={536} height={392} rx={8} fill={C.gold} stroke={C.ink} strokeWidth={7} />
    <rect x={-244} y={-172} width={488} height={344} rx={5} fill={C.goldDark} stroke={C.ink} strokeWidth={5} />
    <rect x={-226} y={-154} width={452} height={308} rx={3} fill={C.paper} stroke={C.ink} strokeWidth={5} />
    {/* 縁の飾り */}
    {[[-268, -196], [268, -196], [-268, 196], [268, 196]].map(([kx, ky], i) => (
      <circle key={i} cx={kx} cy={ky} r={13} fill={C.gold} stroke={C.ink} strokeWidth={5} />
    ))}
    {phase === "empty" && (
      <g opacity={0.4}>
        <line x1={-226} y1={-154} x2={226} y2={154} stroke={C.ink} strokeWidth={3} />
        <line x1={226} y1={-154} x2={-226} y2={154} stroke={C.ink} strokeWidth={3} />
      </g>
    )}
    {(phase === "portrait" || phase === "official") && (
      <g>
        {/* 力士の肖像 (堂々と。茶化さない) */}
        <rect x={-226} y={-154} width={452} height={308} fill="#E6DAC2" />
        <path d="M -176 154 Q -146 24 0 24 Q 146 24 176 154 Z" fill="#C98F5E" stroke={C.ink} strokeWidth={6} />
        <path d="M -78 60 L 78 60 L 62 154 L -62 154 Z" fill="#6D4F8C" stroke={C.ink} strokeWidth={5} opacity={0.9} />
        <circle cx={0} cy={-52} r={78} fill="#D9A373" stroke={C.ink} strokeWidth={6} />
        {/* 大銀杏 */}
        <path d="M -78 -78 Q 0 -168 78 -78 Q 40 -112 0 -108 Q -40 -112 -78 -78 Z" fill="#2E2A26" stroke={C.ink} strokeWidth={5} />
        <path d="M -16 -128 Q 0 -152 16 -128 Q 40 -116 0 -112 Q -40 -116 -16 -128 Z" fill="#2E2A26" stroke={C.ink} strokeWidth={4} />
        {/* 落ち着いた顔 */}
        <path d="M -40 -62 q 14 -12 28 0" stroke={C.ink} strokeWidth={5} fill="none" />
        <path d="M 12 -62 q 14 -12 28 0" stroke={C.ink} strokeWidth={5} fill="none" />
        <path d="M -20 -16 q 20 10 40 0" stroke={C.ink} strokeWidth={5} fill="none" />
        <rect x={-226} y={-154} width={452} height={308} fill="none" stroke={C.ink} strokeWidth={5} />
      </g>
    )}
    {phase === "official" && (
      <g opacity={stampT} transform={`translate(0 ${(1 - stampT) * -40}) rotate(-8 152 96)`}>
        <rect x={92} y={36} width={120} height={120} rx={6} fill="none" stroke={C.red} strokeWidth={9} opacity={0.9} />
        <text x={152} y={118} fontSize={62} fontFamily={FONT} fill={C.red} textAnchor="middle" opacity={0.9}>印</text>
      </g>
    )}
    {/* 吊りひも */}
    <line x1={-200} y1={-196} x2={0} y2={-300} stroke={C.ink} strokeWidth={5} />
    <line x1={200} y1={-196} x2={0} y2={-300} stroke={C.ink} strokeWidth={5} />
    <circle cx={0} cy={-300 + Math.sin(f / 22) * 2} r={11} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
  </g>
);

// 番付。段ごとに字が小さくなる。mark = 赤丸を打つ段 / xRows = X を落とす段
const B7_ROWS: Array<{ lab: string; size: number; dy: number }> = [
  { lab: "横綱", size: 76, dy: -250 },
  { lab: "大関", size: 60, dy: -134 },
  { lab: "関脇", size: 48, dy: -34 },
  { lab: "小結", size: 38, dy: 52 },
  { lab: "平幕", size: 28, dy: 128 },
];
const BanzukeSheet: React.FC<{
  x: number; y: number; s?: number; f: number; mark?: number; xRows?: number[];
}> = ({ x, y, s = 1, f, mark, xRows = [] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-240} y={-348} width={480} height={716} rx={4} fill={C.ink} opacity={0.16} transform="translate(12 14)" />
    <rect x={-240} y={-348} width={480} height={716} rx={4} fill="#F2EBD6" stroke={C.ink} strokeWidth={6} />
    <rect x={-212} y={-320} width={424} height={660} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
    {B7_ROWS.map((r, i) => (
      <g key={i}>
        <text x={0} y={r.dy} fontSize={r.size} fontFamily={FONT} fill={C.ink} textAnchor="middle"
          fontWeight={i === 0 ? 900 : 700}>{r.lab}</text>
        {Array.from({ length: 2 }).map((_, k) => (
          <rect key={k} x={-150 + k * 196} y={r.dy - r.size * 0.62} width={104} height={r.size * 0.8} rx={3}
            fill={C.ink} opacity={0.16 + (4 - i) * 0.02} />
        ))}
        <line x1={-212} y1={r.dy + r.size * 0.62} x2={212} y2={r.dy + r.size * 0.62} stroke={C.ink} strokeWidth={2.5} opacity={0.25} />
        {mark === i && (
          <g>
            <ellipse cx={0} cy={r.dy - r.size * 0.3} rx={128 * pop(seg(f, 14, 28))} ry={44 * pop(seg(f, 14, 28))}
              fill="none" stroke={C.red} strokeWidth={10} />
          </g>
        )}
        {xRows.includes(i) && (
          /* 段の名 (中央) にはかぶせず、右の空き (143..217) に落とす */
          <XMark x={180} y={r.dy - r.size * 0.3} s={0.6} t={seg(f, 6 + i * 5, 20 + i * 5)} />
        )}
      </g>
    ))}
  </g>
);

// チャート盤。billboard / oricon
const ChartBoard: React.FC<{
  x: number; y: number; s?: number; f: number; phase: "billboard" | "oricon"; year: string; name: string; t?: number;
}> = ({ x, y, s = 1, f, phase, year, name, t = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={t}>
    <rect x={-222} y={-262} width={444} height={524} rx={8} fill={C.ink} opacity={0.17} transform="translate(10 12)" />
    <rect x={-230} y={-270} width={444} height={524} rx={8}
      fill={phase === "billboard" ? "#E7EEF4" : "#F4EDDD"} stroke={C.ink} strokeWidth={6} />
    <rect x={-206} y={-246} width={396} height={76} rx={6}
      fill={phase === "billboard" ? C.cloth : C.red} stroke={C.ink} strokeWidth={5} />
    <text x={-8} y={-190} fontSize={44} fontFamily={FONT} fill={KRP.white} textAnchor="middle">{name}</text>
    <text x={-8} y={-110} fontSize={48} fontFamily={FONT} fill={C.ink} textAnchor="middle">{year}</text>
    {[1, 2, 3].map((n, i) => (
      <g key={n} opacity={seg(f, 8 + i * 5, 22 + i * 5)}>
        <text x={-186} y={-16 + i * 86} fontSize={52} fontFamily={FONT} fill={C.ink}>{n}</text>
        <rect x={-116} y={-54 + i * 86} width={(292 - i * 62) * easeOut(seg(f, 8 + i * 5, 24 + i * 5))} height={48} rx={6}
          fill={phase === "billboard" ? C.cloth : C.red} stroke={C.ink} strokeWidth={4.5} opacity={0.82} />
        <text x={-100} y={-18 + i * 86} fontSize={40} fontFamily={FONT} fill={KRP.white}>—</text>
      </g>
    ))}
    <line x1={-206} y1={222} x2={190} y2={222} stroke={C.ink} strokeWidth={3} opacity={0.3} />
  </g>
);

// 土俵の輪。stage 0=戦場ひとつ 1=帝国 2=江戸の町 3=国全体 (序#15・第2章#47 と同じ意匠)
//
// ★2026-11-08 引数を2つ足した (憲法第15条「部品還元の法」= 上から描き足さずに部品へ戻す)。
//   既定値のままなら、いままでとまったく同じ正円が出る。
//   persp = 縦のつぶし率。1 = 真上から見た正円 / 0.3 前後 = 斜めから見た楕円。
//     #141 の陳列台・#142 の平野では「地面やテーブルに置いてある物」なので遠近をつける。
//   tawara = 俵 (土のうを並べた縁) の数。輪を大きく映すときだけ出す。
const DohyoRing: React.FC<{
  cx: number; cy: number; r: number; f: number; t?: number; spin?: number; dim?: number;
  persp?: number; tawara?: number;
}> = ({ cx, cy, r, f, t = 1, spin = 0, dim = 1, persp = 1, tawara = 0 }) => {
  const a = r + 14;
  const b = (r + 14) * persp;
  // 楕円の周長 (ラマヌジャンの近似)。persp=1 のときは 2πr にぴたりと戻るので従来と同じ描き出しになる
  const CIRC = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  const rt = easeOut(clamp01(t));
  return (
    <g opacity={dim} transform={`rotate(${spin * f} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * persp} fill={C.tatami} opacity={0.42 * rt} />
      <ellipse cx={cx} cy={cy} rx={a} ry={b} fill="none" stroke={C.ink} strokeWidth={10}
        strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - rt)}
        /* 正円のときだけ従来どおり真上から描き出す。楕円で回すと軸が入れ替わってしまう */
        transform={persp === 1 ? `rotate(-90 ${cx} ${cy})` : undefined} />
      <ellipse cx={cx} cy={cy} rx={r - 10} ry={(r - 10) * persp} fill="none"
        stroke={KRP.white} strokeWidth={6} opacity={rt * 0.9} />
      {/* 俵。楕円の接線 (-a sinθ, b cosθ) に沿わせて寝かせ、手前ほど大きくする */}
      {tawara > 0 && (
        <g opacity={rt}>
          {Array.from({ length: tawara }).map((_, i) => {
            const th = (i / tawara) * Math.PI * 2;
            const deg = (Math.atan2(b * Math.cos(th), -a * Math.sin(th)) * 180) / Math.PI;
            const near = (Math.sin(th) + 1) / 2;
            return (
              <g key={i}
                transform={`translate(${cx + Math.cos(th) * a} ${cy + Math.sin(th) * b}) rotate(${deg}) scale(${0.62 + 0.38 * near})`}>
                <rect x={-28} y={-14} width={56} height={28} rx={14} fill={C.gold} stroke={C.ink} strokeWidth={4} />
                <line x1={-20} y1={0} x2={20} y2={0} stroke={C.ink} strokeWidth={2.5} opacity={0.4} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------
// #123 第7章、毎年日本一は、新聞がつくった。
// 格: 山 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S123: React.FC<{ f: number }> = ({ f }) => (
  <Frame
    f={f}
    seed={1022}
    bg={KRP.cream}
    over={<ChapterDoor num={7} title="毎年日本一は 新聞がつくった。" t={seg(f, 10, 26)} left={1046} top={186} width={820} />}
  >
    <PressHall f={f} />
    {/* 大きな輪転機 */}
    <RotaryPress x={624} y={700} s={1} f={f} run={1} />
    {/* 刷り上がった紙が滝のように流れる */}
    {Array.from({ length: 10 }).map((_, i) => {
      const u = ((f * 1.1 + i * 4.5) % 45) / 45;
      const px = 844 + u * 206 + Math.sin(u * 6.2) * 20;
      const py = 388 + u * u * 428;
      return (
        <g key={i} transform={`translate(${px} ${py}) rotate(${-24 + u * 130})`}>
          <rect x={-46} y={-31} width={92} height={62} rx={3} fill={C.news} stroke={C.ink} strokeWidth={4} />
          <line x1={-33} y1={-13} x2={33} y2={-13} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          <line x1={-33} y1={5} x2={19} y2={5} stroke={C.ink} strokeWidth={3} opacity={0.4} />
        </g>
      );
    })}
    {/* 積み上がった束 */}
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={976 + (i % 2) * 14} y={812 - i * 26} width={168} height={26} rx={3}
          fill={i % 2 ? C.newsDark : C.news} stroke={C.ink} strokeWidth={4.5} />
      ))}
    </g>
    {/* 束を抱える職人 (束は顔にかぶせない。頭の下端 758 → 束の上端 764) */}
    <Person x={1296} y={896} s={0.84} cloth="#6D7C8C" face="smile" pose="hold" f={f} />
    <g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1222} y={764 + i * 22} width={148} height={22} rx={3}
          fill={i % 2 ? C.newsDark : C.news} stroke={C.ink} strokeWidth={4.5} />
      ))}
    </g>
    {/* 走る4人 */}
    {[[1500, 0.5, 3], [1612, 0.56, 7], [1736, 0.52, 11], [1856, 0.46, 15]].map(([mx, ms, ph], i) => (
      <PersonMini key={i} x={mx as number} y={1004} s={ms as number} color={["#A8623C", "#4F7A4A", "#8C6E4A", "#5E7B96"][i]}
        f={f} phase={ph as number} face="smile" arms="up" />
    ))}
  </Frame>
);

// ------------------------------------------------------------------
// #124 舞台は、ふたたび日本。明治の終わり、新聞社は激しい部数競争のまっただ中にいました。
// 格: 山 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S124: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1023} bg={KRP.cream}>
    <PressHall f={f} lamps={2} />
    {/* 輪転機が3台並んで同時に回る */}
    {[292, 700, 1108].map((px, i) => (
      <RotaryPress key={i} x={px} y={656} s={0.5} f={f} run={1 + i * 0.25} />
    ))}
    {/* 作業台 */}
    <g>
      <rect x={1282} y={826} width={596} height={28} rx={5} fill={C.deskDark} stroke={C.ink} strokeWidth={5} />
      <rect x={1286} y={829} width={588} height={10} fill="#A98157" opacity={0.8} />
    </g>
    {/* 部数が高さを競う3本の柱 (伏字は甲乙丙) */}
    {[
      { x: 1368, h: 300, lab: "甲" },
      { x: 1570, h: 232, lab: "乙" },
      { x: 1772, h: 162, lab: "丙" },
    ].map((p, i) => {
      const gh = p.h * easeOut(seg(f, 4 + i * 6, 24 + i * 6));
      const n = Math.max(1, Math.round(gh / 26));
      return (
        <g key={i}>
          {Array.from({ length: n }).map((_, k) => (
            <rect key={k} x={p.x - 76 + (k % 2) * 12} y={822 - k * 26} width={152} height={26} rx={3}
              fill={k % 2 ? C.newsDark : C.news} stroke={C.ink} strokeWidth={4.5} />
          ))}
          <circle cx={p.x} cy={800 - p.h} r={34} fill={C.paper} stroke={C.ink} strokeWidth={5} opacity={seg(f, 18, 32)} />
          <text x={p.x} y={814 - p.h} fontSize={40} fontFamily={FONT} fill={C.ink} textAnchor="middle"
            opacity={seg(f, 18, 32)}>{p.lab}</text>
        </g>
      );
    })}
    {/* 号外売りが飛び出す */}
    <g transform={`translate(${lerp(-40, 0, easeOut(seg(f, 6, 24)))} 0)`}>
      <Person x={932} y={940} s={0.84} cloth="#A8623C" face="joy" pose="run" f={f} />
      {/* 号外は走る手 (1049, 783) に収める。頭 (x 878..986) にかぶせない */}
      <g transform="translate(1062 760) rotate(16)">
        <rect x={-66} y={-46} width={132} height={92} rx={3} fill={C.news} stroke={C.ink} strokeWidth={5} />
        <rect x={-54} y={-34} width={108} height={22} rx={3} fill={C.red} stroke={C.ink} strokeWidth={4} />
        <line x1={-54} y1={6} x2={54} y2={6} stroke={C.ink} strokeWidth={3} opacity={0.4} />
        <line x1={-54} y1={24} x2={28} y2={24} stroke={C.ink} strokeWidth={3} opacity={0.4} />
      </g>
    </g>
    <TagPlate x={560} y={762} text="部数競争" size={48} t={seg(f, 14, 30)} />
  </Frame>
);

// ------------------------------------------------------------------
// #125 そこで生まれたのが、「毎年、日本一を決める」という企画です。
// 格: 並 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S125: React.FC<{ f: number }> = ({ f }) => {
  const wr = easeOut(seg(f, 6, 30));
  return (
    <Frame f={f} seed={1024} bg={KRP.cream}>
      <EditorDesk cid="ib7s125paper" />
      {/* 白紙に大きく「日本一」と書き込まれる */}
      <g>
        <clipPath id="ib7s125write">
          <rect x={330} y={300} width={760 * wr} height={320} />
        </clipPath>
        <g clipPath="url(#ib7s125write)">
          <text x={356} y={566} fontSize={236} fontFamily={FONT} fill={C.ink} fontWeight={900}>日本一</text>
        </g>
        {/* 筆の先 (書き終わりで止まる) */}
        <g opacity={1 - seg(f, 28, 36)} transform={`translate(${330 + 760 * wr} 300)`}>
          <line x1={0} y1={260} x2={116} y2={64} stroke="#E2DBC9" strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={260} x2={16} y2={232} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
        </g>
      </g>
      {/* 書き終えた筆を硯に置く */}
      <g opacity={seg(f, 28, 38)}>
        <rect x={760} y={690} width={300} height={58} rx={14} fill="#4A4A48" stroke={C.ink} strokeWidth={5} />
        <ellipse cx={910} cy={706} rx={112} ry={18} fill="#1E2630" opacity={0.85} />
        <line x1={744} y1={672} x2={1120} y2={636} stroke="#E2DBC9" strokeWidth={13} strokeLinecap="round" />
        <line x1={744} y1={672} x2={772} y2={670} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
      </g>
      {/* ペンを止めてにやりとする 1人 */}
      <Person x={1452} y={820} s={0.86} cloth="#6D5A8C" face="smile" pose="armsFolded" f={f} />
      <TagPlate x={1366} y={246} text="毎年 日本一" size={48} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #126 1909年、時事新報という新聞が、相撲の「優勝額」を始めました。
// 格: 山 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S126: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 4, 32)); // 額が吊り上がる
  return (
    <Frame f={f} seed={1025} bg={KRP.cream}>
      <Kokugikan f={f} />
      {/* 足場 */}
      <g>
        {[438, 972].map((px, i) => (
          <g key={i}>
            <rect x={px} y={300} width={22} height={400} fill={C.deskDark} stroke={C.ink} strokeWidth={4.5} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={px + 11} cy={360 + k * 130} r={5} fill={C.ink} opacity={0.4} />
            ))}
          </g>
        ))}
        {[318, 528].map((by, i) => (
          <rect key={i} x={420} y={by} width={574} height={18} fill={C.deskDark} stroke={C.ink} strokeWidth={4.5} />
        ))}
        {/* 滑車 */}
        <circle cx={706} cy={302} r={26} fill={C.steel} stroke={C.ink} strokeWidth={5} />
        <circle cx={706} cy={302} r={8} fill={C.ink} opacity={0.5} />
      </g>
      {/* 吊り上げられる空の額 */}
      <g transform={`translate(0 ${lerp(140, 0, up)})`}>
        <line x1={706} y1={302} x2={706} y2={304} stroke={C.ink} strokeWidth={5} />
        <YushoGaku x={706} y={520} s={0.72} f={f} phase="empty" />
      </g>
      {/* 大工 */}
      <Person x={1098} y={768} s={0.68} cloth="#4F7A4A" face="normal" pose="raise" f={f} />
      {/* 記者 (時事新報を持つ) */}
      <Person x={1512} y={816} s={0.58} cloth="#6D7C8C" glasses face="smile" pose="hold" f={f} />
      {/* 新聞は手 (y 747.6) の高さに。顔 (下端 721) にかぶせない */}
      <g transform="translate(1512 776) rotate(-4) scale(0.68)">
        <rect x={-114} y={-72} width={228} height={144} rx={3} fill={C.news} stroke={C.ink} strokeWidth={5} />
        <rect x={-100} y={-58} width={200} height={44} fill={C.newsDark} stroke={C.ink} strokeWidth={4} />
        <text x={0} y={-24} fontSize={34} fontFamily={FONT} fill={C.ink} textAnchor="middle">時事新報</text>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-100} y1={6 + i * 20} x2={i === 2 ? 40 : 100} y2={6 + i * 20}
            stroke={C.ink} strokeWidth={3} opacity={0.4} />
        ))}
      </g>
      {/* 見上げる観客8人 */}
      {[
        [176, 744, 0.46, 2], [300, 744, 0.5, 6], [1676, 744, 0.48, 10], [1808, 744, 0.44, 14],
        [240, 846, 0.54, 4], [1196, 846, 0.54, 8], [1320, 846, 0.5, 12], [376, 846, 0.5, 16],
      ].map(([mx, my, ms, ph], i) => (
        <PersonMini key={i} x={mx} y={my} s={ms} color={["#A8623C", "#4F7A4A", "#8C6E4A", "#5E7B96", "#6D5A8C", "#A8623C", "#4F7A4A", "#8C6E4A"][i]}
          f={f} phase={ph} face="smile" arms="up" />
      ))}
      <TagPlate x={1438} y={302} text="1909年 時事新報" size={40} t={seg(f, 16, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #127 場所でいちばん成績の良かった力士の肖像を、国技館に掲げる企画です。
// 格: 並 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S127: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1026} bg={KRP.cream}>
    <Kokugikan f={f} roof={false} />
    {/* 同じ額に寄る (肖像が入る) */}
    <g transform={zoomAt(lerp(1, 1.1, easeOut(seg(f, 4, 34))), 856, 470)}>
      <YushoGaku x={856} y={470} s={1.2} f={f} phase="portrait" />
    </g>
    {/* 見上げる人1人 */}
    <Person x={1536} y={1004} s={0.92} cloth="#A8623C" face="surprised" pose="raise" f={f} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={1452 - i * 34} cy={700 - i * 30} r={7 - i} fill={C.ink} opacity={0.3} />
    ))}
    <TagPlate x={1470} y={248} text="国技館に掲げる" size={46} t={seg(f, 16, 32)} />
  </Frame>
);

// ------------------------------------------------------------------
// #128 実はこれ、相撲協会の公式制度ではなく、新聞社のイベントでした。
// 格: 図 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S128: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1027} bg={KRP.cream}>
    <Kokugikan f={f} roof={false} nobori={false} />
    {/* 小さな優勝額 (出どころ) */}
    <YushoGaku x={960} y={254} s={0.33} f={f} phase="portrait" />
    {/* 2枚の札の対比 */}
    <g opacity={seg(f, 4, 18)}>
      <rect x={172} y={442} width={620} height={162} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={6} />
      <text x={532} y={548} fontSize={58} fontFamily={FONT} fill={C.ink} textAnchor="middle">協会の公式制度</text>
    </g>
    {/* X は文字 (329..735) にかぶせず札の左肩へ */}
    <XMark x={256} y={522} s={0.84} t={seg(f, 20, 36)} />
    <g opacity={seg(f, 8, 22)}>
      <rect x={1118} y={442} width={682} height={162} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={6} />
      <text x={1459} y={548} fontSize={58} fontFamily={FONT} fill={C.ink} textAnchor="middle">新聞社のイベント</text>
    </g>
    <ellipse cx={1459} cy={522} rx={382 * pop(seg(f, 22, 38))} ry={118 * pop(seg(f, 22, 38))}
      fill="none" stroke={C.red} strokeWidth={11} />
    {/* 額から新聞社の旗へ引き出し線 */}
    <g opacity={seg(f, 14, 28)}>
      {/* 2枚の札のあいだ (x 792..1118) を通して降りる。赤丸にも札にも当てない */}
      <path d="M 1012 318 Q 1000 480 968 648" stroke={C.ink} strokeWidth={4} fill="none" strokeDasharray="14 12" />
      <circle cx={1012} cy={318} r={9} fill={C.ink} />
    </g>
    {/* 新聞社の旗 */}
    <g opacity={seg(f, 16, 30)}>
      <line x1={968} y1={648} x2={968} y2={828} stroke={C.deskDark} strokeWidth={10} />
      <path d={`M 972 652 L ${1098 + Math.sin(f / 13) * 8} 676 L 972 744 Z`} fill={C.cloth} stroke={C.ink} strokeWidth={5} />
      <rect x={996} y={678} width={82} height={30} rx={4} fill={KRP.white} opacity={0.82} />
    </g>
    {/* ★2026-11-08 作者修正「シーンテロップいらない」= 白い札 (TagPlate) を削除した。
        右の札そのものに「新聞社のイベント」と書いてあるので、札を消しても情報は1つも減らない */}
  </Frame>
);

// ------------------------------------------------------------------
// #129 しかも記念すべき第1号の「優勝者」は、横綱でも大関でもなく、平幕の高見山。
// 格: 山 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S129: React.FC<{ f: number }> = ({ f }) => {
  const at = easeOut(seg(f, 26, 42)); // 下から上へ一気に
  return (
    <Frame f={f} seed={1028} bg={KRP.cream}>
      <Kokugikan f={f} roof={false} />
      {/* 大きく掲げられた番付 (横綱・大関に X / 平幕に赤丸) */}
      <BanzukeSheet x={620} y={480} s={0.78} f={f} mark={4} xRows={[0, 1]} />
      {/* 上の額 */}
      <YushoGaku x={1340} y={330} s={0.5} f={f} phase="portrait" />
      {/* 平幕の段から額へ一気に上がる矢印 */}
      <g opacity={seg(f, 24, 32)}>
        <path
          d={`M 826 574 Q ${lerp(826, 1060, at)} ${lerp(574, 520, at)} ${lerp(826, 1176, at)} ${lerp(574, 372, at)}`}
          stroke={C.red} strokeWidth={13} fill="none" strokeLinecap="round"
        />
        <g opacity={at} transform={`translate(${lerp(826, 1176, at)} ${lerp(574, 372, at)}) rotate(-26)`}>
          <path d="M 0 0 L -42 -26 L -42 26 Z" fill={C.red} transform="rotate(0)" />
        </g>
      </g>
      {/* どよめく観客 */}
      {[
        [140, 846, 0.56, 2], [286, 846, 0.52, 7], [968, 846, 0.56, 11], [1104, 846, 0.5, 15],
        [1560, 846, 0.54, 5], [1700, 744, 0.48, 9], [1838, 744, 0.44, 13],
      ].map(([mx, my, ms, ph], i) => (
        <PersonMini key={i} x={mx} y={my} s={ms} color={["#A8623C", "#4F7A4A", "#8C6E4A", "#5E7B96", "#6D5A8C", "#A8623C", "#4F7A4A"][i]}
          f={f} phase={ph} face="smile" arms="up" />
      ))}
      {/* どよめきの線 */}
      {[[200, 700], [1030, 700], [1640, 700]].map(([dx, dy], i) => (
        <g key={i} opacity={0.4 + Math.sin((f + i * 9) / 8) * 0.22}>
          {[0, 1].map((k) => (
            <path key={k} d={`M ${dx + k * 34} ${dy} q 18 -22 36 0`} stroke={C.ink} strokeWidth={4} fill="none" />
          ))}
        </g>
      ))}
      <TagPlate x={1540} y={620} text="第1号は平幕" size={48} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #130 日本の「優勝」の歴史は、平幕力士から始まったのです。
// 格: 並 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S130: React.FC<{ f: number }> = ({ f }) => {
  const ln = easeOut(seg(f, 12, 40));
  return (
    <Frame f={f} seed={1029} bg={KRP.cream}>
      <Kokugikan f={f} roof={false} nobori={false} />
      {/* 番付の下段へ寄る */}
      <BanzukeSheet x={520} y={273} s={1.15} f={f} mark={4} />
      {/* 静かに立つ力士 (堂々と) */}
      <g>
        <ellipse cx={1248} cy={946} rx={148} ry={26} fill={C.ink} opacity={0.18} />
        {/* 脚 */}
        {[-62, 62].map((lx, i) => (
          <path key={i} d={`M ${1248 + lx - 44} 760 L ${1248 + lx + 44} 760 L ${1248 + lx + 36} 942 L ${1248 + lx - 36} 942 Z`}
            fill="#C98F5E" stroke={C.ink} strokeWidth={6} />
        ))}
        {/* まわし */}
        <path d="M 1150 706 L 1346 706 L 1332 800 L 1164 800 Z" fill="#6D4F8C" stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1174 + i * 50} y1={708} x2={1172 + i * 50} y2={798} stroke={C.ink} strokeWidth={3} opacity={0.35} />
        ))}
        {/* 胴 */}
        <path d="M 1134 560 Q 1248 522 1362 560 Q 1376 672 1346 712 L 1150 712 Q 1120 672 1134 560 Z"
          fill="#C98F5E" stroke={C.ink} strokeWidth={6} />
        {/* 腕 */}
        <path d="M 1134 572 Q 1080 630 1092 740" stroke={C.ink} strokeWidth={6} fill="none" />
        <path d="M 1362 572 Q 1416 630 1404 740" stroke={C.ink} strokeWidth={6} fill="none" />
        <path d="M 1134 572 Q 1080 630 1092 740 l 44 0 Q 1126 644 1172 584 Z" fill="#C98F5E" stroke={C.ink} strokeWidth={6} />
        <path d="M 1362 572 Q 1416 630 1404 740 l -44 0 Q 1370 644 1324 584 Z" fill="#C98F5E" stroke={C.ink} strokeWidth={6} />
        {/* 頭と大銀杏 */}
        <circle cx={1248} cy={482} r={76} fill="#D9A373" stroke={C.ink} strokeWidth={6} />
        <path d="M 1172 456 Q 1248 368 1324 456 Q 1286 420 1248 418 Q 1210 420 1172 456 Z" fill="#2E2A26" stroke={C.ink} strokeWidth={5} />
        <path d="M 1232 406 Q 1248 382 1264 406 Q 1288 418 1248 420 Q 1208 418 1232 406 Z" fill="#2E2A26" stroke={C.ink} strokeWidth={4} />
        <path d="M 1208 474 q 14 -12 28 0" stroke={C.ink} strokeWidth={5} fill="none" />
        <path d="M 1260 474 q 14 -12 28 0" stroke={C.ink} strokeWidth={5} fill="none" />
        <path d="M 1230 520 q 18 8 36 0" stroke={C.ink} strokeWidth={5} fill="none" />
      </g>
      {/* 足元から上へ伸びる1本の線 */}
      <g>
        <line x1={1286} y1={944} x2={1470} y2={944} stroke={C.red} strokeWidth={8} opacity={0.72} />
        <line x1={1470} y1={944} x2={1470} y2={lerp(944, 200, ln)} stroke={C.red} strokeWidth={8} opacity={0.72} />
        <g opacity={seg(f, 34, 42)} transform={`translate(1470 ${lerp(944, 200, ln)})`}>
          <path d="M 0 -8 L -24 32 L 24 32 Z" fill={C.red} opacity={0.82} />
        </g>
        <circle cx={1286} cy={944} r={12} fill={C.red} />
      </g>
      <TagPlate x={680} y={768} text="ここから始まった" size={46} t={seg(f, 24, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #131 協会が優勝を正式な制度にしたのは、17年後の1926年のことでした。
// 格: 図 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S131: React.FC<{ f: number }> = ({ f }) => {
  const band = easeOut(seg(f, 10, 32));
  const X1 = 338;
  const X2 = 1136;
  return (
    <Frame f={f} seed={1030} bg={KRP.cream}>
      <EditorDesk cid="ib7s131paper" />
      {/* 1909 → 1926 の年表 */}
      <g>
        <line x1={278} y1={560} x2={1196} y2={560} stroke={C.ink} strokeWidth={7} />
        {[[X1, "1909"], [X2, "1926"]].map(([tx, lab], i) => (
          <g key={i}>
            <line x1={tx as number} y1={508} x2={tx as number} y2={612} stroke={C.ink} strokeWidth={6} />
            <text x={tx as number} y={672} fontSize={52} fontFamily={FONT} fill={C.ink} textAnchor="middle">{lab as string}</text>
          </g>
        ))}
        {/* その区間だけ「17年」の帯 */}
        <rect x={X1} y={442} width={(X2 - X1) * band} height={54} rx={8} fill={C.red} stroke={C.ink} strokeWidth={5} opacity={0.82} />
        <g opacity={seg(f, 26, 40)}>
          <rect x={620} y={330} width={234} height={84} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={5} />
          <text x={737} y={392} fontSize={56} fontFamily={FONT} fill={C.ink} textAnchor="middle">17年</text>
          <line x1={737} y1={414} x2={737} y2={442} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 右端で角印が押される */}
      <YushoGaku x={1424} y={434} s={0.52} f={f} phase="official" stampT={easeOut(seg(f, 26, 40))} />
      <g opacity={seg(f, 22, 32)}>
        <path d="M 1196 560 L 1272 520" stroke={C.ink} strokeWidth={5} fill="none" />
        <path d="M 1272 520 l -34 2 l 14 22 Z" fill={C.ink} transform="rotate(150 1272 520)" />
      </g>
      <TagPlate x={700} y={752} text="17年後 1926年" size={42} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #132 新聞社は、この成功の型を量産していきます。
// 格: 並 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S132: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1031} bg={KRP.cream}>
    <PressHall f={f} lamps={1} />
    {/* 1台の輪転機 */}
    <RotaryPress x={496} y={700} s={0.82} f={f} run={1} />
    {/* 同じ形の企画書が3枚、4枚とコピーされて出てくる */}
    {[0, 1, 2, 3].map((i) => {
      const t = easeOut(seg(f, 6 + i * 7, 22 + i * 7));
      return (
        <g key={i} opacity={t} transform={`translate(${lerp(760, 884 + i * 146, t)} 600) rotate(${-5 + i * 3})`}>
          <rect x={-62} y={-86} width={124} height={172} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={5} />
          <rect x={-48} y={-70} width={96} height={30} rx={4} fill={C.red} stroke={C.ink} strokeWidth={4} opacity={0.85} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={-48} y1={-18 + k * 24} x2={k === 3 ? 8 : 48} y2={-18 + k * 24}
              stroke={C.ink} strokeWidth={4} opacity={0.38} />
          ))}
          <path d="M -22 56 l 10 -22 l 12 14 l 12 -14 l 10 22 Z" fill={C.gold} stroke={C.ink} strokeWidth={3.5} />
        </g>
      );
    })}
    {/* 受け取る職人1人。手には何も無いので「指す」で企画書の列につなげる */}
    <Person x={1584} y={952} s={0.88} cloth="#4F7A4A" face="smile" pose="point" pointDir={-1} f={f} />
    <TagPlate x={996} y={768} text="型を量産" size={48} t={seg(f, 26, 42)} />
  </Frame>
);

// ===================================================================
// #133 (野球) と #135 (駅伝) のための「横向きの選手」素体 — このファイル専用
//
// なぜ新しく作るか:
//   共通部品 KarakuriScenes の Person / PersonMini は正面の立ち姿しか持たないので、
//   打つ・投げる・走るが描けない。共通部品は他の章も使うので改造しない (憲法第15条)。
// なぜ寸法をそろえるか:
//   第6章の TrackRunner と同じ寸法 (肌 #E6C49E・腿26x60・脛20x52・上腕18x46・
//   前腕16x40・手 r11・頭 r31・線5px) にしてある。章をまたいでも人の画風がブレない。
// 角度の約束:
//   rot が正 = 手足が後ろ (-x) へ / 負 = 前 (+x) へ。add = 膝・肘で足す角度。
//   図は右向きで描き、左向きは dir=-1 (scale(-1,1)) で反す。
// ===================================================================
const SKIN = "#E6C49E";

// 野球と駅伝だけで使う色。作者の指示で #133 は意図的に彩度を上げている
const BB = {
  skyTop: "#AFD0E4",
  skyLow: "#E6F0F3",
  hill: "#93A97E",
  hillDark: "#6E8762",
  grass: "#7FA85C",
  grassDark: "#5C8142",
  soil: "#C28A55",
  soilDark: "#9A663A",
  soilLight: "#DBAE7D",
  wood: "#BE8C53",
  woodDark: "#8D6436",
  zinc: "#8E9AA2",
  chalk: "#FAF6EA",
  navy: "#34506E",
  crimson: "#C23B2E",
  mustard: "#DFA62B",
  moss: "#4F7A4A",
  mitt: "#A2683A",
  mittDark: "#7B4A23",
  bat: "#D09B58",
  // 駅伝 (冬の色。#133 とわざと寒暖を分けて、連続する2枚が似ないようにする)
  winterSky: "#CFDCE4",
  winterLow: "#EDEFE6",
  fuji: "#B9C7D4",
  ridge: "#8C9484",
  ridgeDark: "#6B7466",
  cedar: "#3E5A42",
  cedarDark: "#2C4230",
  dryGrass: "#BAAF87",
  roadGray: "#AFA794",
  roadLight: "#C9C1AC",
};

/** 腿 → 脛 → 靴。脛だけストッキング色にして膝下まくりのユニフォームに見せる */
const AthLeg: React.FC<{
  rot: number; add: number; pants: string; sock: string; shoe: string; back?: boolean;
}> = ({ rot, add, pants, sock, shoe, back }) => (
  <g transform={`rotate(${rot})`} opacity={back ? 0.84 : 1}>
    <rect x={-13} y={-6} width={26} height={62} rx={13} fill={pants} stroke={C.ink} strokeWidth={5} />
    <g transform={`translate(0 56) rotate(${add})`}>
      <rect x={-10} y={-4} width={20} height={54} rx={10} fill={sock} stroke={C.ink} strokeWidth={5} />
      <path d="M -10 44 q -14 2 -16 12 q -1 8 9 8 l 26 0 q 7 -10 1 -20 Z" fill={shoe} stroke={C.ink} strokeWidth={4.5} />
    </g>
  </g>
);

/** 上腕 → 前腕 → 手。children は手に持つ物 (バット・グラブ・ミット) */
const AthArm: React.FC<{
  rot: number; add: number; sleeve: string; back?: boolean; children?: React.ReactNode;
}> = ({ rot, add, sleeve, back, children }) => (
  <g transform={`rotate(${rot})`} opacity={back ? 0.86 : 1}>
    <rect x={-9} y={-6} width={18} height={50} rx={9} fill={sleeve} stroke={C.ink} strokeWidth={5} />
    <g transform={`translate(0 44) rotate(${add})`}>
      <rect x={-8} y={-4} width={16} height={44} rx={8} fill={SKIN} stroke={C.ink} strokeWidth={5} />
      <g transform="translate(0 44)">
        <circle cx={0} cy={0} r={11} fill={SKIN} stroke={C.ink} strokeWidth={4.5} />
        {children}
      </g>
    </g>
  </g>
);

type AthCap = "gakubo" | "toriuchi" | "mask" | "hachimaki" | "bare";

/** 頭。かぶり物で「1915年の中等学校」「審判の背広」「冬の駅伝」を描き分ける */
const AthHead: React.FC<{ cap: AthCap; capColor: string; hair?: string; grit?: boolean }> = ({
  cap, capColor, hair = "#3A322B", grit,
}) => (
  <g transform="translate(6 -140)">
    <circle cx={0} cy={0} r={31} fill={SKIN} stroke={C.ink} strokeWidth={5} />
    <path d="M -31 -6 q -1 -29 22 -29 q 21 0 27 17 q -23 -8 -49 12 Z" fill={hair} stroke={C.ink} strokeWidth={3.5} />
    <circle cx={15} cy={-2} r={5} fill={C.ink} />
    {grit
      ? <rect x={7} y={12} width={18} height={7} rx={3} fill={C.ink} />
      : <path d="M 8 12 q 8 7 16 0" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />}
    {cap === "gakubo" && (
      <g>
        <path d="M -30 -13 q 5 -27 31 -27 q 26 0 31 27 Z" fill={capColor} stroke={C.ink} strokeWidth={5} />
        <path d="M 0 -13 l 40 3 q 6 7 -2 11 l -38 -6 Z" fill={capColor} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={10} cy={-30} r={5} fill={C.gold} stroke={C.ink} strokeWidth={3} />
      </g>
    )}
    {cap === "toriuchi" && (
      <g>
        <path d="M -31 -11 q 3 -29 30 -29 q 28 0 32 25 q -29 8 -62 4 Z" fill={capColor} stroke={C.ink} strokeWidth={5} />
        <path d="M 22 -15 l 25 6 q 4 8 -6 10 l -23 -6 Z" fill={capColor} stroke={C.ink} strokeWidth={4.5} />
      </g>
    )}
    {cap === "hachimaki" && (
      <g>
        <rect x={-32} y={-25} width={65} height={13} rx={4} fill={capColor} stroke={C.ink} strokeWidth={4} />
        <path d="M -29 -21 q -23 7 -31 23 q 15 -2 25 -11 Z" fill={capColor} stroke={C.ink} strokeWidth={3.5} />
      </g>
    )}
    {cap === "mask" && (
      <g>
        {/* 捕手の面。帽子を後ろ向きにかぶり、顔の前に鉄の格子 */}
        <path d="M -31 -14 q 5 -26 31 -26 q 25 0 28 22 Z" fill={capColor} stroke={C.ink} strokeWidth={5} />
        <path d="M 2 -30 q 33 7 31 34 q -2 24 -29 26" fill="none" stroke={C.ink} strokeWidth={5.5} />
        {[-20, -6, 8, 20].map((gy) => (
          <path key={gy} d={`M 4 ${gy} q 26 3 25 ${gy + 6}`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.7} />
        ))}
        {[12, 24].map((gx) => (
          <path key={gx} d={`M ${gx} -26 q 7 27 -1 48`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.7} />
        ))}
      </g>
    )}
  </g>
);

type AthHand = "bat" | "glove" | "mitt" | "ball" | "none";

/** 手に持つ物。手 (r11) の中心を原点に描く */
const athHold = (kind: AthHand) => {
  if (kind === "bat") {
    // バットは前腕の子にしてあるので、腕を振るとバットも一緒に回る
    return (
      <g transform="rotate(34)">
        <path d="M -7 -8 L 7 -8 Q 12 68 15 126 Q 15 150 0 150 Q -15 150 -15 126 Q -12 68 -7 -8 Z"
          fill={BB.bat} stroke={C.ink} strokeWidth={5} />
        <path d="M -12 100 q 12 6 24 0" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.45} />
        {[2, 14, 26].map((gy) => (
          <path key={gy} d={`M -8 ${gy} q 8 4 16 0`} stroke={BB.woodDark} strokeWidth={3.5} fill="none" />
        ))}
      </g>
    );
  }
  if (kind === "glove") {
    return (
      <g>
        <circle cx={5} cy={11} r={21} fill={BB.mitt} stroke={C.ink} strokeWidth={5} />
        <path d="M -8 4 q 13 -13 27 -1" stroke={BB.mittDark} strokeWidth={4} fill="none" />
      </g>
    );
  }
  if (kind === "mitt") {
    // 捕手のミットは丸く大きい。1915年の物は指の割れがない
    return (
      <g>
        <circle cx={9} cy={5} r={30} fill={BB.mitt} stroke={C.ink} strokeWidth={5.5} />
        <circle cx={9} cy={5} r={16} fill={BB.mittDark} opacity={0.45} />
      </g>
    );
  }
  if (kind === "ball") {
    return (
      <g>
        <circle cx={0} cy={-13} r={11} fill={C.ball} stroke={C.ink} strokeWidth={4} />
        <path d="M -6 -20 q 6 7 0 14" stroke={C.red} strokeWidth={2.5} fill="none" />
      </g>
    );
  }
  return null;
};

type AthPose = "bat" | "pitch" | "catch" | "field" | "umpire" | "run" | "arrive" | "start";

/**
 * 横向きの選手ひとり。pose で手足の角度表を切り替える。
 * t = 0..1 はその動作の進み具合 (振り・投げ)。f は呼吸と走りの周期に使う。
 */
const SidePlayer: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1; f: number; phase?: number; t?: number;
  pose: AthPose;
  shirt?: string; pants?: string; sock?: string; shoe?: string;
  cap?: AthCap; capColor?: string; stripe?: boolean; tasuki?: string;
  handF?: AthHand; handB?: AthHand;
  chest?: boolean; breath?: boolean; dust?: boolean; grit?: boolean; shadow?: boolean;
}> = ({
  x, y, s = 1, dir = 1, f, phase = 0, t = 1, pose,
  shirt = "#F6F1E2", pants = "#F6F1E2", sock = BB.navy, shoe = "#4A423A",
  cap = "gakubo", capColor = BB.navy, stripe, tasuki,
  handF = "none", handB = "none", chest, breath, dust, grit, shadow = true,
}) => {
  const tt = clamp01(t);
  const ph = f * 0.5 + phase;
  const sp = Math.sin(ph);
  // 止め絵は禁止 (憲法第13条) なので、立っているだけの人も呼吸ぶんは上下させる
  const bob = pose === "run" || pose === "start" ? Math.abs(Math.cos(ph)) * 7 : Math.sin(f / 12) * 2;

  let lean = 10;
  let legF = { rot: -16, add: 24 };
  let legB = { rot: 16, add: 24 };
  let armF = { rot: -24, add: -30 };
  let armB = { rot: 20, add: -30 };

  if (pose === "run") {
    lean = 14;
    legF = { rot: 34 * sp - 2, add: 42 + 26 * sp };
    legB = { rot: -34 * sp - 2, add: 42 - 26 * sp };
    armF = { rot: -34 * sp + 4, add: -62 - 14 * sp };
    armB = { rot: 34 * sp + 4, add: -62 + 14 * sp };
  } else if (pose === "bat") {
    // 構え (バットを後ろに立てる) → 振り抜き。両手は重ねて握る
    lean = 6;
    legF = { rot: -34, add: 16 };
    legB = { rot: 28, add: 40 };
    const a = lerp(140, -86, tt);
    const d = lerp(40, -18, tt);
    armF = { rot: a, add: d };
    armB = { rot: a + 12, add: d - 6 };
  } else if (pose === "pitch") {
    lean = 10;
    legF = { rot: lerp(-10, -44, tt), add: lerp(34, 22, tt) };
    legB = { rot: lerp(18, 36, tt), add: lerp(40, 56, tt) };
    armF = { rot: lerp(150, -70, tt), add: lerp(58, -6, tt) };
    armB = { rot: lerp(-70, 30, tt), add: -30 };
  } else if (pose === "catch") {
    // しゃがみ。腿を前へ出し脛を立てると腰が落ちて見える
    lean = 14;
    legF = { rot: -60, add: 44 };
    legB = { rot: 4, add: 72 };
    armF = { rot: -96, add: 16 };
    armB = { rot: 18, add: -40 };
  } else if (pose === "umpire") {
    lean = 20;
    legF = { rot: -12, add: 18 };
    legB = { rot: 14, add: 18 };
    armF = { rot: 44, add: 54 };
    armB = { rot: 38, add: 58 };
  } else if (pose === "arrive") {
    lean = 4;
    legF = { rot: -30, add: 20 };
    legB = { rot: 22, add: 56 };
    armF = { rot: -96, add: 6 };
    armB = { rot: 30, add: -52 };
  } else if (pose === "start") {
    lean = 22;
    legF = { rot: -46, add: 30 };
    legB = { rot: 40, add: 66 };
    armF = { rot: -60, add: -68 };
    armB = { rot: 86, add: 10 };
  } else {
    const sw = Math.sin(f / 9) * 3;
    legF = { rot: -16 + sw, add: 26 };
    legB = { rot: 16 - sw, add: 26 };
    armF = { rot: -30 + sw, add: -34 };
    armB = { rot: -18 - sw, add: -28 };
  }

  return (
    <g transform={`translate(${x} ${y - bob})`}>
      {shadow && <ellipse cx={0} cy={112 * s} rx={56 * s} ry={13 * s} fill={C.ink} opacity={0.16} />}
      {dust && (
        <g opacity={0.5}>
          <ellipse cx={-46 * s} cy={104 * s} rx={38 * s} ry={13 * s} fill={BB.soilDark} />
          <ellipse cx={-80 * s} cy={94 * s} rx={24 * s} ry={10 * s} fill={BB.soilLight} />
        </g>
      )}
      <g transform={`scale(${s * dir} ${s})`}>
        <g transform={`rotate(${lean})`}>
          {/* 奥の脚 → 奥の腕 → 胴 → 手前の脚 → 手前の腕 の順で前後が決まる */}
          <g transform="translate(-8 0)">
            <AthLeg {...legB} pants={pants} sock={sock} shoe={shoe} back />
          </g>
          <g transform="translate(6 -92)">
            <AthArm {...armB} sleeve={shirt} back>{athHold(handB)}</AthArm>
          </g>
          <path d="M -26 -98 Q -30 -20 -24 4 L 24 4 Q 30 -22 24 -98 Q 0 -112 -26 -98 Z"
            fill={shirt} stroke={C.ink} strokeWidth={5} />
          {stripe && [-14, 0, 14].map((lx) => (
            <line key={lx} x1={lx} y1={-94} x2={lx} y2={2} stroke="#9FB4C9" strokeWidth={4} opacity={0.8} />
          ))}
          {tasuki && (
            <g>
              <path d="M -23 -96 L -5 -96 L 25 4 L 7 4 Z" fill={tasuki} stroke={C.ink} strokeWidth={4} />
              <path d="M -16 -70 L 10 -8" stroke={KRP.white} strokeWidth={3} opacity={0.5} />
            </g>
          )}
          {chest && (
            <g>
              {/* 捕手の胸当て */}
              <path d="M -24 -92 Q 26 -98 26 -62 Q 28 -14 0 6 Q -26 -14 -24 -92 Z"
                fill={BB.woodDark} stroke={C.ink} strokeWidth={5} opacity={0.95} />
              {[-70, -44, -18].map((cy) => (
                <path key={cy} d={`M -20 ${cy} q 24 6 44 -2`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
              ))}
            </g>
          )}
          <rect x={-8} y={-118} width={22} height={22} fill={SKIN} stroke={C.ink} strokeWidth={4.5} />
          <AthHead cap={cap} capColor={capColor} grit={grit} />
          {breath && (
            <g opacity={0.3 + 0.35 * Math.abs(Math.sin(f / 9))}>
              <ellipse cx={54} cy={-146} rx={22} ry={11} fill={KRP.white} />
              <ellipse cx={84} cy={-154} rx={13} ry={8} fill={KRP.white} />
            </g>
          )}
          <g transform="translate(8 0)">
            <AthLeg {...legF} pants={pants} sock={sock} shoe={shoe} />
          </g>
          <g transform="translate(6 -92)">
            <AthArm {...armF} sleeve={shirt}>{athHold(handF)}</AthArm>
          </g>
        </g>
      </g>
    </g>
  );
};

/**
 * #133 の床 = 1915年の豊中グラウンド。
 * 空 → 遠くの山 → 木造スタンド (亜鉛屋根) → 観客 → 幟 → 板塀と横断幕 → 芝 → 土の内野。
 * 第16条。地面はベタ1色にせず、土の斑・ならし跡・踏み跡を一段敷く。
 * cheer = 0..1 で観客が立ち上がり帽子が舞う (⑥人が反応する)。
 */
const ToyonakaField: React.FC<{ f: number; cheer: number }> = ({ f, cheer }) => (
  <g>
    <rect x={0} y={0} width={W} height={300} fill={BB.skyTop} />
    <rect x={0} y={170} width={W} height={150} fill={BB.skyLow} opacity={0.9} />
    {[[280, 96, 1], [1180, 72, 0.9], [1660, 120, 0.8]].map(([cx, cy, o], i) => (
      <g key={i} opacity={0.55 * (o as number)}>
        <ellipse cx={cx as number} cy={cy as number} rx={150} ry={46} fill={KRP.white} />
        <ellipse cx={(cx as number) + 96} cy={(cy as number) - 26} rx={98} ry={38} fill={KRP.white} />
        <ellipse cx={(cx as number) - 88} cy={(cy as number) - 14} rx={72} ry={30} fill={KRP.white} />
      </g>
    ))}
    {/* 遠くの山 (郊外の原っぱに作られた球場なので山が見える) */}
    <path d="M -40 300 q 230 -150 450 -44 q 160 -92 360 24 L 820 300 Z" fill={BB.hillDark} opacity={0.5} />
    <path d="M 680 300 q 250 -126 490 -32 q 210 -84 800 42 L 1960 300 Z" fill={BB.hill} opacity={0.45} />
    {/* 木造スタンドの屋根 */}
    <g>
      <path d="M 92 304 L 1828 292 L 1842 326 L 102 338 Z" fill={BB.zinc} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={150 + i * 230} y1={302} x2={146 + i * 230} y2={336} stroke={C.ink} strokeWidth={3} opacity={0.3} />
      ))}
      {/* 屋根を支える柱 */}
      {[180, 640, 1100, 1560].map((px) => (
        <rect key={px} x={px} y={330} width={16} height={116} fill={BB.woodDark} stroke={C.ink} strokeWidth={4} />
      ))}
    </g>
    {/* 段になった客席 */}
    <g>
      <path d="M 108 336 L 1836 324 L 1824 452 L 118 460 Z" fill={BB.wood} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M 112 ${364 + i * 26} L 1832 ${352 + i * 26}`} stroke={BB.woodDark} strokeWidth={4} opacity={0.6} />
      ))}
    </g>
    {/* 観客。満員に見せたいので2段ぶん並べる */}
    {Array.from({ length: 26 }).map((_, i) => (
      <PersonMini key={`a${i}`} x={140 + i * 66} y={392 - i} s={0.15}
        color={["#A8623C", BB.moss, "#5E7B96", "#6D5A8C", BB.crimson][i % 5]}
        f={f} phase={i * 4} face="none" arms={cheer > 0.4 && i % 2 === 0 ? "up" : "down"} />
    ))}
    {Array.from({ length: 24 }).map((_, i) => (
      <PersonMini key={`b${i}`} x={176 + i * 70} y={436 - i} s={0.17}
        color={["#4F6E8C", "#8C6A4A", BB.mustard, "#55705A"][i % 4]}
        f={f} phase={i * 7 + 3} face="none" arms={cheer > 0.6 && i % 3 === 0 ? "up" : "down"} />
    ))}
    {/* 歓声で舞う帽子 */}
    {[[420, 0], [940, 1], [1480, 2]].map(([hx, k], i) => (
      <g key={i} opacity={cheer} transform={`translate(${hx} ${372 - cheer * (54 + (k as number) * 12)}) rotate(${-24 + (k as number) * 22})`}>
        <path d="M -16 0 q 4 -16 17 -16 q 13 0 16 16 Z" fill={BB.navy} stroke={C.ink} strokeWidth={3.5} />
        <ellipse cx={1} cy={1} rx={20} ry={5} fill={BB.navy} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    {/* 幟 = 主催者の社名。屋根の上に2本立てる (社名は大阪朝日。設計書の炎上回避) */}
    {[256, 1612].map((nx, i) => (
      <g key={i}>
        <line x1={nx} y1={168} x2={nx} y2={338} stroke={BB.woodDark} strokeWidth={8} />
        <rect x={nx + 4} y={172} width={54} height={160} rx={3} fill={BB.chalk} stroke={C.ink} strokeWidth={4.5} />
        <rect x={nx + 4} y={172} width={54} height={9} fill={BB.crimson} opacity={0.85} />
        {"大阪朝日".split("").map((ch, k) => (
          <text key={k} x={nx + 31} y={214 + k * 34} fontSize={30} fontFamily={FONT} fontWeight={700}
            fill={C.ink} textAnchor="middle">{ch}</text>
        ))}
      </g>
    ))}
    {/* 板塀と横断幕 */}
    <g>
      <rect x={0} y={448} width={W} height={46} fill={BB.woodDark} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1={40 + i * 80} y1={450} x2={40 + i * 80} y2={492} stroke={C.ink} strokeWidth={3} opacity={0.28} />
      ))}
      <rect x={636} y={440} width={648} height={60} rx={5} fill={BB.chalk} stroke={C.ink} strokeWidth={5} />
      <text x={960} y={485} fontSize={42} fontFamily={FONT} fontWeight={700} fill={C.ink} textAnchor="middle">
        中等學校優勝野球
      </text>
    </g>
    {/* 外野の芝 */}
    <path d="M 0 494 L 1920 494 L 1920 606 L 0 622 Z" fill={BB.grass} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: 16 }).map((_, i) => (
      <path key={i} d={`M ${30 + i * 122} 500 q 10 34 -4 ${110 + (i % 3) * 6}`}
        stroke={BB.grassDark} strokeWidth={5} fill="none" opacity={0.35} />
    ))}
    {/* 土の内野。斑とならし跡を敷いて素のベタ1色にしない (第16条) */}
    <rect x={0} y={612} width={W} height={H - 612} fill={BB.soil} />
    {Array.from({ length: 26 }).map((_, i) => (
      <ellipse key={i} cx={30 + ((i * 331) % 1870)} cy={634 + ((i * 173) % 420)}
        rx={26 + (i % 4) * 14} ry={8 + (i % 3) * 4}
        fill={i % 2 ? BB.soilDark : BB.soilLight} opacity={0.3} />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M -20 ${660 + i * 44} q 500 ${26 - i * 4} 1960 ${6 + i * 10}`}
        stroke={BB.soilDark} strokeWidth={4} fill="none" opacity={0.22} />
    ))}
  </g>
);

// ------------------------------------------------------------------
// #133 1915年、大阪朝日新聞が、中等学校の野球日本一を決める大会を始めました。
// 格: 山 (★2026-11-08 作者修正「野球をしているシーンを精巧に 色使いも豊かに書いて」)
//   直す前は棚に挟んだ新聞紙だけの図で、野球をしている絵になっていなかった。
//   描き直した中身 = 1915年の第1回大会 (豊中グラウンド)。
//   投手が投げ、打者が振り、捕手と審判がのぞき込み、内野手が構え、スタンドがどよめく。
//   ユニフォームは当時の形 (膝下まくりのニッカボッカ風・縞・学帽/鳥打帽・丸いミット)。
//   社名は幟に「大阪朝日」。横断幕は大会名だけ。実在の校名・選手名は出さない。
//   色: この回はふだん彩度を落とすが、作者の指示でこの1枚だけ意図的に上げている。
//   足元は 830 より上に収める (下 250px は字幕の黒帯に隠れるため)。
// ------------------------------------------------------------------
const S133: React.FC<{ f: number }> = ({ f }) => {
  const throwT = seg(f, 0, 18);   // 投球の腕の送り
  const fly = seg(f, 6, 30);      // 球が打点まで届く
  const swing = seg(f, 10, 34);   // 打者の振り
  const hit = seg(f, 30, 42);     // 当たった瞬間 (火花・土けむり・歓声)
  const push = lerp(1, 1.04, seg(f, 0, 42)); // ④カメラがゆっくり本塁へ寄る
  // 球は投手の手から打点へ。山なりに見せたいので途中だけ持ち上げる
  const bx = lerp(1063, 762, fly);
  const by = lerp(515, 636, fly) - Math.sin(fly * Math.PI) * 46;
  return (
    <Frame f={f} seed={1032} bg={KRP.cream}>
      <g transform={zoomAt(push, 700, 660)}>
        <ToyonakaField f={f} cheer={hit} />

        {/* 白線と塁。本塁は手前左、一塁側が右へ開く */}
        <g>
          <path d="M 470 826 L 706 528" stroke={BB.chalk} strokeWidth={15} strokeLinecap="round" />
          <path d="M 470 826 L 1880 700" stroke={BB.chalk} strokeWidth={15} strokeLinecap="round" />
          <path d="M 470 826 L 706 528" stroke={C.ink} strokeWidth={3} opacity={0.2} />
          <path d="M 470 826 L 1880 700" stroke={C.ink} strokeWidth={3} opacity={0.2} />
          {[[700, 528], [1420, 536], [1600, 744]].map(([bxx, byy], i) => (
            <rect key={i} x={(bxx as number) - 23} y={(byy as number) - 13} width={46} height={26} rx={3}
              fill={BB.chalk} stroke={C.ink} strokeWidth={4} />
          ))}
          {/* 本塁の五角形 */}
          <path d="M 440 812 L 500 812 L 506 828 L 470 842 L 434 828 Z"
            fill={BB.chalk} stroke={C.ink} strokeWidth={4.5} />
          {/* 打者が立つ四角 */}
          <rect x={520} y={776} width={132} height={56} fill="none" stroke={BB.chalk} strokeWidth={7} opacity={0.75} />
        </g>

        {/* 投手の山 */}
        <g>
          <ellipse cx={1124} cy={672} rx={126} ry={32} fill={BB.soilLight} stroke={C.ink} strokeWidth={4} opacity={0.9} />
          <rect x={1096} y={660} width={56} height={14} rx={3} fill={BB.chalk} stroke={C.ink} strokeWidth={3.5} />
        </g>

        {/* 奥の野手。小さいので縞は省く */}
        <SidePlayer x={1760} y={520} s={0.3} dir={-1} f={f} phase={2} pose="field"
          handB="glove" capColor="#4F6E8C" sock="#4F6E8C" />
        <SidePlayer x={1000} y={556} s={0.44} dir={-1} f={f} phase={5} pose="field"
          handB="glove" capColor={BB.navy} />
        <SidePlayer x={1540} y={600} s={0.46} dir={-1} f={f} phase={9} pose="field"
          handB="glove" capColor={BB.navy} />
        <SidePlayer x={1712} y={706} s={0.54} dir={-1} f={f} phase={13} pose="field"
          handB="glove" capColor={BB.navy} stripe />

        {/* ⑤事件: 投手が投げる */}
        <SidePlayer x={1124} y={560} s={0.74} dir={-1} f={f} t={throwT} pose="pitch"
          handB="glove" capColor={BB.navy} sock={BB.crimson} stripe grit />

        {/* 飛んでいる球。残像と速度線をつけて静止写真に見せない */}
        <g>
          {[0.14, 0.26, 0.38].map((d, i) => {
            const t2 = clamp01(fly - d);
            return (
              <circle key={i} cx={lerp(1063, 762, t2)} cy={lerp(515, 636, t2) - Math.sin(t2 * Math.PI) * 46}
                r={13 - i * 2.5} fill={C.ball} opacity={0.3 - i * 0.08} />
            );
          })}
          <line x1={bx + 44} y1={by - 12} x2={bx + 116} y2={by - 26} stroke={C.ink} strokeWidth={4} opacity={0.35} />
          <line x1={bx + 40} y1={by + 10} x2={bx + 104} y2={by + 6} stroke={C.ink} strokeWidth={4} opacity={0.25} />
          <circle cx={bx} cy={by} r={16} fill={C.ball} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${bx - 10} ${by - 12} q 9 12 0 24`} stroke={C.red} strokeWidth={3} fill="none" />
          <path d={`M ${bx + 10} ${by - 12} q -9 12 0 24`} stroke={C.red} strokeWidth={3} fill="none" />
        </g>

        {/* 振りの残像。構えのバット先 (592 382) から打点 (812 652) までの弧をなぞる。
            太く描くと背景の横断幕を切ってしまうので、細く薄くして空気だけ残す */}
        <g opacity={0.24 * seg(f, 12, 32)}>
          <path d="M 592 382 Q 838 432 812 652" stroke={KRP.white} strokeWidth={12} fill="none" strokeLinecap="round" />
        </g>

        {/* 本塁の3人。審判 → 捕手 → 打者 の順に重ねる */}
        <SidePlayer x={132} y={700} s={0.94} f={f} pose="umpire"
          shirt="#4A4F57" pants="#3E434A" sock="#3E434A" cap="toriuchi" capColor="#3E434A" shadow={false} />
        <SidePlayer x={306} y={742} s={0.96} f={f} pose="catch"
          handF="mitt" cap="mask" capColor={BB.navy} sock={BB.navy} chest stripe />
        <SidePlayer x={560} y={690} s={1.1} f={f} t={swing} pose="bat"
          handF="bat" cap="gakubo" capColor={BB.crimson} sock={BB.crimson} stripe grit
          dust={hit > 0.2} />

        {/* 当たった瞬間の火花。シーンは8秒あり seg は f=42 で止まるので、
            止まったあと貼り紙のように固まらないよう、ちらつきだけ残す */}
        <g opacity={hit * (0.82 + 0.18 * Math.sin(f / 5))}
          transform={`translate(762 636) scale(${0.6 + hit * 0.6})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1={0} y1={0}
              x2={Math.cos((a * Math.PI) / 180) * 56} y2={Math.sin((a * Math.PI) / 180) * 56}
              stroke={BB.mustard} strokeWidth={7} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={0} r={22} fill={KRP.white} opacity={0.7} />
        </g>
      </g>
      <TagPlate x={1300} y={780} text="第1回 豊中グラウンド" size={44} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #134 いまの甲子園です。
// 格: 並 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S134: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1033} bg={KRP.cream}>
    {/* 夏の空 */}
    <rect x={0} y={0} width={W} height={430} fill={C.sky} />
    {[[300, 130], [1420, 100]].map(([cx, cy], i) => (
      <g key={i} opacity={0.5}>
        <ellipse cx={cx} cy={cy} rx={170} ry={52} fill={KRP.white} />
        <ellipse cx={cx + 110} cy={cy - 28} rx={110} ry={42} fill={KRP.white} />
      </g>
    ))}
    {/* アルプス席 */}
    <g>
      <path d="M 0 430 L 1920 430 L 1920 272 L 0 330 Z" fill="#C9CFD4" stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M 0 ${336 + i * 19} L 1920 ${278 + i * 19}`} stroke={C.ink} strokeWidth={3} opacity={0.3} />
      ))}
      <rect x={0} y={426} width={W} height={18} fill="#9AA3AB" stroke={C.ink} strokeWidth={4} />
    </g>
    {/* 小さな応援 */}
    {Array.from({ length: 14 }).map((_, i) => {
      const px = 70 + i * 134;
      return (
        <PersonMini key={i} x={px} y={344 - i * 4} s={0.2} color={["#A8623C", "#4F7A4A", "#5E7B96", "#6D5A8C"][i % 4]}
          f={f} phase={i * 3} face="none" arms={i % 2 ? "up" : "down"} />
      );
    })}
    {/* 土のグラウンド */}
    <rect x={0} y={444} width={W} height={H - 444} fill={C.dirt} />
    {Array.from({ length: 22 }).map((_, i) => (
      <ellipse key={i} cx={40 + ((i * 311) % 1860)} cy={470 + ((i * 137) % 560)} rx={20 + (i % 4) * 11} ry={6 + (i % 3) * 3}
        fill={C.ink} opacity={0.1} />
    ))}
    {/* 白線 */}
    <g>
      <path d="M 240 820 L 900 500" stroke={KRP.white} strokeWidth={16} strokeLinecap="round" />
      <path d="M 1680 820 L 1020 500" stroke={KRP.white} strokeWidth={16} strokeLinecap="round" />
      <path d="M 240 820 L 900 500" stroke={C.ink} strokeWidth={3} opacity={0.22} />
      <path d="M 1680 820 L 1020 500" stroke={C.ink} strokeWidth={3} opacity={0.22} />
      <rect x={918} y={476} width={84} height={34} rx={5} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    </g>
    {/* 主役は1個のボール */}
    <g transform={`translate(0 ${Math.sin(f / 14) * 6})`}>
      <ellipse cx={690} cy={830} rx={126} ry={26} fill={C.ink} opacity={0.2} />
      <circle cx={690} cy={678} r={134} fill={C.ball} stroke={C.ink} strokeWidth={8} />
      <path d="M 594 586 Q 650 678 594 770" stroke={C.red} strokeWidth={7} fill="none" />
      <path d="M 786 586 Q 730 678 786 770" stroke={C.red} strokeWidth={7} fill="none" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={600} y1={614 + i * 32} x2={628} y2={606 + i * 32} stroke={C.red} strokeWidth={5} />
          <line x1={780} y1={614 + i * 32} x2={752} y2={606 + i * 32} stroke={C.red} strokeWidth={5} />
        </g>
      ))}
      <circle cx={648} cy={632} r={30} fill={KRP.white} opacity={0.5} />
    </g>
    <TagPlate x={1476} y={768} text="いまの甲子園" size={48} t={seg(f, 16, 32)} />
  </Frame>
);

/**
 * #135 の床 = 箱根の坂道。
 * ★#133 と構図をわざと変える (作者がいちばん嫌うのは同じ構図の連続)。
 *   #133 = 横に広い球場を正面から / #135 = 坂道が奥 (左上) から手前 (右下) へ降りてくる
 *   くさび形。沿道からの視点にして、奥へ行くほど人が小さくなる遠近で坂を見せる。
 * 冬の色 (寒色・低彩度) にして、直前の #133 の夏の色と寒暖で分ける。
 * 道の縁の式: 左 x = 470 + (y-470)*0.4754 / 右 x = 528 + (y-466)*3.207
 */
const HakoneSlope: React.FC<{ f: number }> = ({ f }) => {
  // 杉並木。1本ずつ描くと長いので関数にする
  const Cedar = ({ cx, by, h, s }: { cx: number; by: number; h: number; s: number }) => (
    <g>
      <rect x={cx - 7 * s} y={by - h * 0.3} width={14 * s} height={h * 0.3} fill={BB.cedarDark}
        stroke={C.ink} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i}
          d={`M ${cx} ${by - h + i * h * 0.21} l ${-46 * s - i * 9 * s} ${h * 0.3} l ${92 * s + i * 18 * s} 0 Z`}
          fill={i % 2 ? BB.cedar : BB.cedarDark} stroke={C.ink} strokeWidth={4.5} />
      ))}
    </g>
  );
  return (
    <g>
      {/* 冬の空。低いところを白っぽくして寒い空気にする */}
      <rect x={0} y={0} width={W} height={330} fill={BB.winterSky} />
      <rect x={0} y={190} width={W} height={170} fill={BB.winterLow} opacity={0.85} />
      {/* 正月の低い日 */}
      <g opacity={0.5}>
        <circle cx={1430} cy={178} r={92} fill="#F2D9A8" />
        <circle cx={1430} cy={178} r={54} fill="#F7E9C8" />
      </g>
      {/* 富士山 (箱根の坂から見える) */}
      <path d="M 350 372 Q 600 128 648 128 Q 700 128 950 372 Z" fill={BB.fuji} stroke={C.ink} strokeWidth={5} />
      <path d="M 556 212 q 32 22 58 -6 q 26 26 54 2 q 24 20 42 -4 l 38 48 q -116 34 -238 -2 Z"
        fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      {/* 箱根の尾根 */}
      <path d="M -40 380 q 260 -112 470 -30 q 190 -74 440 18 L 960 400 L -40 400 Z" fill={BB.ridgeDark} opacity={0.6} />
      <path d="M 820 392 q 280 -104 520 -22 q 230 -70 620 40 L 1960 430 L 820 430 Z" fill={BB.ridge} opacity={0.55} />
      {/* 枯れ草の路肩 */}
      <rect x={0} y={400} width={W} height={H - 400} fill={BB.dryGrass} />
      {Array.from({ length: 30 }).map((_, i) => (
        <path key={i} d={`M ${20 + ((i * 271) % 1880)} ${440 + ((i * 197) % 600)} q 8 -22 -2 -40`}
          stroke={BB.ridgeDark} strokeWidth={4} fill="none" opacity={0.22} />
      ))}
      {/* 霜 (冬の路肩) */}
      {Array.from({ length: 22 }).map((_, i) => (
        <ellipse key={i} cx={40 + ((i * 419) % 1860)} cy={470 + ((i * 233) % 560)}
          rx={22 + (i % 3) * 10} ry={6} fill={KRP.white} opacity={0.22} />
      ))}
      {/* 坂道 (くさび形)。奥が細く手前が広い */}
      <path d="M 470 470 L 528 466 L 1920 900 L 1920 1080 L 760 1080 Z"
        fill={BB.roadGray} stroke={C.ink} strokeWidth={5} />
      {/* 道の真ん中だけ土が出て明るい。奥行きが出る */}
      <path d="M 492 468 L 514 467 L 1760 1080 L 1300 1080 Z" fill={BB.roadLight} opacity={0.6} />
      {/* 砂利。手前ほど大きく描いて遠近をつける */}
      {Array.from({ length: 34 }).map((_, i) => {
        const ry = 500 + ((i * 167) % 560);
        const lx = 470 + (ry - 470) * 0.4754;
        const rx2 = 528 + (ry - 466) * 3.207;
        const gx = lx + ((i * 311) % Math.max(60, rx2 - lx));
        const gs = 4 + (ry - 470) / 90;
        return <ellipse key={i} cx={gx} cy={ry} rx={gs} ry={gs * 0.5} fill={BB.ridgeDark} opacity={0.3} />;
      })}
      {/* 轍 (わだち) 2本 */}
      <path d="M 486 468 L 1180 1080" stroke={BB.ridgeDark} strokeWidth={5} fill="none" opacity={0.25} />
      <path d="M 518 467 L 1700 1080" stroke={BB.ridgeDark} strokeWidth={5} fill="none" opacity={0.22} />
      {/* 杉並木。左は手前へ、右は奥に1本 */}
      <Cedar cx={104} by={880} h={470} s={1.15} />
      <Cedar cx={266} by={706} h={356} s={0.9} />
      <Cedar cx={392} by={596} h={252} s={0.66} />
      <Cedar cx={1718} by={612} h={268} s={0.7} />
      <Cedar cx={1884} by={700} h={360} s={0.92} />
      {/* 報知新聞の幟 (主催者。読売と書かない。設計書の炎上回避) */}
      <g>
        <line x1={196} y1={404} x2={196} y2={700} stroke={BB.woodDark} strokeWidth={9} />
        <rect x={200} y={410} width={58} height={176} rx={3} fill={BB.chalk} stroke={C.ink} strokeWidth={4.5} />
        <rect x={200} y={410} width={58} height={10} fill={BB.crimson} opacity={0.85} />
        {"報知新聞".split("").map((ch, k) => (
          <text key={k} x={229} y={454 + k * 36} fontSize={32} fontFamily={FONT} fontWeight={700}
            fill={C.ink} textAnchor="middle">{ch}</text>
        ))}
      </g>
      {/* 中継所の標識 + 門松 (お正月) */}
      <g>
        <rect x={1772} y={566} width={16} height={258} fill={BB.woodDark} stroke={C.ink} strokeWidth={4} />
        <rect x={1640} y={556} width={176} height={62} rx={5} fill={BB.chalk} stroke={C.ink} strokeWidth={5} />
        <text x={1728} y={600} fontSize={38} fontFamily={FONT} fontWeight={700} fill={C.ink} textAnchor="middle">
          中継所
        </text>
        {[1716, 1846].map((kx, i) => (
          <g key={i}>
            <rect x={kx - 30} y={786} width={60} height={62} rx={5} fill="#6B5336" stroke={C.ink} strokeWidth={5} />
            <rect x={kx - 30} y={786} width={60} height={12} fill={BB.moss} opacity={0.5} />
            {[-14, 0, 14].map((bx2, k) => (
              <g key={k}>
                <rect x={kx + bx2 - 6} y={752 - k * 10} width={12} height={40} fill="#A8BF7A"
                  stroke={C.ink} strokeWidth={3.5} />
                <ellipse cx={kx + bx2} cy={752 - k * 10} rx={6} ry={4} fill="#D6E3B4" stroke={C.ink} strokeWidth={2.5} />
              </g>
            ))}
            <rect x={kx - 34} y={810} width={68} height={11} rx={4} fill={C.red} stroke={C.ink} strokeWidth={3.5} />
          </g>
        ))}
      </g>
      {/* 沿道の見物人。小旗を f で振らせる (⑥人が反応する) */}
      {([
        [430, 762, 0.42, 0], [330, 822, 0.46, 3], [252, 700, 0.34, 6], [470, 626, 0.26, 9],
        [1486, 706, 0.3, 2], [1620, 660, 0.26, 11],
      ] as [number, number, number, number][]).map(([sx, sy, ss, sp], i) => (
        <g key={i}>
          <PersonMini x={sx} y={sy} s={ss} color={["#8C6A4A", "#4F6E8C", BB.moss, "#6D5A8C"][i % 4]}
            f={f} phase={sp} face="dot" arms={i % 2 ? "up" : "down"} />
          <g transform={`translate(${sx + 46 * ss} ${sy - 150 * ss}) rotate(${-16 + Math.sin(f / 7 + i) * 14})`}>
            <line x1={0} y1={0} x2={0} y2={-56 * ss} stroke={BB.woodDark} strokeWidth={4} />
            <rect x={0} y={-56 * ss} width={46 * ss} height={32 * ss} fill={BB.chalk} stroke={C.ink} strokeWidth={3.5} />
            <circle cx={23 * ss} cy={-40 * ss} r={10 * ss} fill={C.red} />
          </g>
        </g>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------
// #135 1920年には、報知新聞がお正月の箱根駅伝をスタートさせました。
// 格: 山 (★2026-11-08 作者修正「同じ展開だから駅伝をしている様子を書いて」)
//   直す前は棚に挟んだ新聞紙 + 門松で、走っている絵になっていなかった。
//   描き直した中身 = 箱根の坂道で襷をつなぐ瞬間。
//   ①手前の2人に寄る ②坂道・杉並木・富士・沿道 ③襷と小旗と門松 ④カメラが中継所へ寄る
//   ⑤襷が渡る ⑥沿道が旗を振る。
//   ★#133 と構図を変えてある: #133 = 横に広い球場を正面から / これ = 坂道が奥から手前へ。
//   冬の空気 (白い息・霜・枯れ草) を入れてお正月とわかるようにする。
//   社名は幟に「報知新聞」(読売と書かない)。選手名・記録の数字は出さない。
// ------------------------------------------------------------------
const S135: React.FC<{ f: number }> = ({ f }) => {
  const pass = seg(f, 8, 30);   // 襷が前の走者から次の走者へ渡る
  const go = seg(f, 20, 40);    // 受け取った走者が飛び出す
  const up = seg(f, 0, 42);     // 奥の走者が坂を登っていく
  const push = lerp(1, 1.05, up); // ④カメラが襷のところへ寄る
  // 襷の両端。素体の肩 (6 -92) → 上腕44 → 前腕44 → 手 を角度どおりに回して出した実座標。
  // 目分量で置くと手から襷が離れて浮いて見えるので、ここだけは計算で合わせる。
  //   渡す側 (arrive / rot -96 / 傾き4度 / s1.05) → 手は体の前 105px・上 94px
  //   受ける側 (start / rot 86 / 傾き22度 / s1.0)  → 手は体の後ろ 41px・上 117px
  const hx1 = 1364 - 105, hy1 = 690 - 94;
  const hx2 = 1030 - 46 * go + 41, hy2 = 672 - 10 * go - 117;
  // 渡したては張り、渡し終えるとたるむ
  const sag = (hy1 + hy2) / 2 + 62 - 36 * pass;
  return (
    <Frame f={f} seed={1034} bg={KRP.cream}>
      <g transform={zoomAt(push, 1180, 650)}>
        <HakoneSlope f={f} />

        {/* 奥の走者。坂を登るほど小さく、f で少しずつ奥へ進む */}
        <SidePlayer x={560 - 14 * up} y={486 - 8 * up} s={0.22} dir={-1} f={f} phase={5} pose="run"
          cap="bare" tasuki="#4F6E8C" sock="#4F6E8C" shoe="#5A5048" shadow={false} />
        <SidePlayer x={690 - 22 * up} y={520 - 12 * up} s={0.42} dir={-1} f={f} phase={2} pose="run"
          cap="hachimaki" capColor={BB.mustard} tasuki={BB.mustard} sock="#6B6252" shoe="#5A5048" />
        <SidePlayer x={822 - 30 * up} y={580 - 16 * up} s={0.62} dir={-1} f={f} phase={9} pose="run"
          cap="bare" tasuki="#4F6E8C" sock="#6B6252" shoe="#5A5048" breath />

        {/* ⑤事件: 襷が渡る。受け取った走者が前へ飛び出す */}
        <SidePlayer x={1030 - 46 * go} y={672 - 10 * go} s={1.0} dir={-1} f={f} pose="start"
          cap="hachimaki" capColor={BB.crimson} shirt="#F2EEE0" pants="#EDE7D6"
          sock="#6B6252" shoe="#5A5048" grit breath dust={go > 0.3} />

        {/* 渡っていく襷。前の走者の手から次の走者の手へ、たるんだ帯で描く */}
        <g>
          <path d={`M ${hx1} ${hy1} Q ${(hx1 + hx2) / 2} ${sag} ${hx2} ${hy2}`}
            stroke={BB.crimson} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={`M ${hx1} ${hy1} Q ${(hx1 + hx2) / 2} ${sag} ${hx2} ${hy2}`}
            stroke={C.ink} strokeWidth={4} fill="none" opacity={0.4} />
          <path d={`M ${hx1} ${hy1 + 7} Q ${(hx1 + hx2) / 2} ${sag + 7} ${hx2} ${hy2 + 7}`}
            stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.3} />
        </g>

        {/* 走り終えた走者。息を切らして前の手で襷を差し出す */}
        <SidePlayer x={1364} y={690} s={1.05} dir={-1} f={f} pose="arrive"
          cap="bare" shirt="#F2EEE0" pants="#EDE7D6" sock="#6B6252" shoe="#5A5048"
          grit breath dust />

        {/* 坂を駆け下りてきた勢い。手前の走者の後ろに速度線 */}
        <g opacity={0.3}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${1496 + i * 54} ${610 + i * 42} q 120 ${10 + i * 6} 236 ${-6 + i * 4}`}
              stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
        </g>
      </g>
      <TagPlate x={520} y={780} text="襷をつないで走る" size={44} t={seg(f, 24, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #136 1927年の都市対抗野球は、東京日日新聞。いまの毎日新聞です。
// 格: 図 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S136: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1035} bg={KRP.cream}>
    <ShelfRack f={f} />
    <NewsSheet x={828} y={474} s={0.8} f={f} phase="toshi" org="東京日日" year="1927" rot={-2} />
    {/* 右に「→ いまの毎日」 */}
    <g opacity={seg(f, 20, 36)}>
      <line x1={1062} y1={468} x2={1198} y2={468} stroke={C.ink} strokeWidth={9} />
      <path d="M 1210 468 L 1170 446 L 1170 490 Z" fill={C.ink} />
      <rect x={1232} y={410} width={430} height={116} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={6} />
      <text x={1447} y={490} fontSize={58} fontFamily={FONT} fill={C.ink} textAnchor="middle">いまの毎日</text>
    </g>
    <TagPlate x={360} y={430} text="1927年 東京日日" size={40} t={seg(f, 14, 30)} />
  </Frame>
);

// ------------------------------------------------------------------
// #137 新聞が主催し、新聞が速報し、新聞が順位を刷って配る。
// 格: 山 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const Maru: React.FC<{ x: number; y: number; n: number; t?: number }> = ({ x, y, n, t = 1 }) => (
  <g opacity={t}>
    <circle cx={x} cy={y} r={38} fill={C.paper} stroke={C.ink} strokeWidth={6} />
    <text x={x} y={y + 18} fontSize={50} fontFamily={FONT} fill={C.ink} textAnchor="middle" fontWeight={900}>{n}</text>
  </g>
);

// ★2026-11-08 作者修正「今の演出は活かしたい。画面3分割にして、
//   『主催』『速報』『刷って配る』をナレーションに合わせて順に出す」
//   → 直す前の配置 (左=主催の幟 / 中=号外を振る売り子 / 右=輪転機と町の人) をそのまま
//      縦3分割の3枠に割り当て、枠ごとに出る時間をずらした。
//      まだ出ていない枠はクリーム色の薄幕をかぶせて沈め、仕切り板で枠を区切る。
//      札は「主催 速報 配る」の1枚をやめ、枠ごとの見出し3枚 (①主催 ②速報 ③刷って配る) に分けた。
//      プレビューは f=45 の1枚なので、3枠の出現は全部 f=42 までに終わらせる。
const S137: React.FC<{ f: number }> = ({ f }) => {
  const rv = [seg(f, 2, 15), seg(f, 15, 28), seg(f, 28, 38)];
  // 電信線 (MeijiStreet が引いている 2次ベジエ) 上の点。モールス信号を走らせるのに使う
  const wire = (t: number): [number, number] => [
    (1 - t) * (1 - t) * 878 + 2 * (1 - t) * t * 1060 + t * t * 1142,
    (1 - t) * (1 - t) * 198 + 2 * (1 - t) * t * 236 + t * t * 212,
  ];
  return (
    <Frame f={f} seed={1036} bg={KRP.cream}>
      <MeijiStreet f={f} />

      {/* ===== ① 主催 (左の枠 0..640) = 大会の幟が2本立ち、人が入っていく ===== */}
      <g opacity={rv[0]}>
        <g transform={`rotate(${Math.sin(f / 23) * 1.4} 236 300)`}>
          <line x1={236} y1={250} x2={236} y2={880} stroke={C.deskDark} strokeWidth={11} />
          <rect x={180} y={300} width={112} height={430} fill={C.red} stroke={C.ink} strokeWidth={6} />
          <rect x={180} y={300} width={112} height={34} fill={KRP.white} opacity={0.72} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={208} y={364 + i * 72} width={56} height={52} rx={5} fill={KRP.white} opacity={0.8} />
          ))}
        </g>
        {/* 2本目の幟。1本だと「旗」だが2本並ぶと「大会の入口」に見える */}
        <g transform={`rotate(${-1.1 + Math.sin(f / 19 + 1) * 1.2} 462 400)`}>
          <line x1={462} y1={372} x2={462} y2={880} stroke={C.deskDark} strokeWidth={9} />
          <rect x={414} y={418} width={96} height={330} fill={C.cloth} stroke={C.ink} strokeWidth={6} />
          <rect x={414} y={418} width={96} height={28} fill={KRP.white} opacity={0.7} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={438} y={468 + i * 66} width={48} height={44} rx={5} fill={KRP.white} opacity={0.78} />
          ))}
        </g>
        {/* 幟をくぐって入っていく人 */}
        {([[106, 0.5, 3, "#5E7B96"], [600, 0.44, 15, "#4F7A4A"]] as [number, number, number, string][]).map(
          ([mx, ms, ph, col], i) => (
            <PersonMini key={i} x={mx} y={1008} s={ms} color={col} f={f} phase={ph} face="dot" arms="down" />
          ),
        )}
      </g>

      {/* ===== ② 速報 (中の枠 640..1280) = 電信が走り、号外を振る売り子 ===== */}
      <g opacity={rv[1]}>
        {/* 電線のところで光がはじける = 報せが届いた合図。
            見出しの札 (y 139..221) とぶつからないよう、腕木より下の y=330 に置く */}
        <g opacity={0.5 + 0.4 * Math.abs(Math.sin(f / 7))}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={960} y1={330}
              x2={960 + Math.cos((i / 6) * Math.PI * 2 - Math.PI / 2) * 72}
              y2={330 + Math.sin((i / 6) * Math.PI * 2 - Math.PI / 2) * 72}
              stroke={C.red} strokeWidth={7} strokeLinecap="round" />
          ))}
        </g>
        {/* 電信線の上をモールス信号 (点と線) が左から右へ流れる */}
        {[0, 1, 2, 3, 4].map((i) => {
          const t = (f * 0.016 + i * 0.2) % 1;
          const [wx, wy] = wire(t);
          return i % 2 === 0 ? (
            <circle key={i} cx={wx} cy={wy - 9} r={7} fill={C.red} />
          ) : (
            <rect key={i} x={wx - 14} y={wy - 13} width={28} height={8} rx={4} fill={C.red} />
          );
        })}
        <Person x={800} y={1012} s={0.94} cloth="#A8623C" face="joy" pose="raise" f={f} />
        <g transform={`translate(884 ${704 + Math.sin(f / 5) * 10}) rotate(${-14 + Math.sin(f / 5) * 12})`}>
          <rect x={-72} y={-50} width={144} height={100} rx={3} fill={C.news} stroke={C.ink} strokeWidth={5} />
          <rect x={-58} y={-36} width={116} height={26} rx={3} fill={C.red} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-58} y1={6 + i * 18} x2={i === 2 ? 10 : 58} y2={6 + i * 18} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          ))}
        </g>
        {/* 声が飛ぶ線 (号外売りの口から外へ) */}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={728 - i * 6} y1={772 + i * 26} x2={660 - i * 26} y2={760 + i * 34}
            stroke={C.ink} strokeWidth={4} opacity={0.42} strokeLinecap="round" />
        ))}
      </g>

      {/* ===== ③ 刷って配る (右の枠 1280..1920) = 輪転機から順位表が町の人へ ===== */}
      <g opacity={rv[2]}>
        <RotaryPress x={1452} y={668} s={0.33} f={f} run={1.4} />
        {Array.from({ length: 5 }).map((_, i) => {
          const u = ((f * 1.3 + i * 9) % 45) / 45;
          return (
            <g key={i} transform={`translate(${1520 + u * 150} ${608 + u * u * 170}) rotate(${u * 90})`}>
              <rect x={-30} y={-21} width={60} height={42} rx={2} fill={C.news} stroke={C.ink} strokeWidth={4} />
              <line x1={-20} y1={-6} x2={20} y2={-6} stroke={C.ink} strokeWidth={3} opacity={0.4} />
            </g>
          );
        })}
        {/* 先頭の1人は仕切り板 (x=1280) に食い込まないよう 1316 から並べる */}
        {[[1316, 0.46, 2], [1432, 0.5, 6], [1550, 0.46, 10], [1666, 0.5, 14], [1778, 0.44, 18], [1878, 0.4, 22]].map(
          ([mx, ms, ph], i) => (
            <g key={i}>
              <PersonMini x={mx as number} y={1008} s={ms as number} color={["#4F7A4A", "#5E7B96", "#8C6E4A", "#6D5A8C", "#A8623C", "#4F7A4A"][i]}
                f={f} phase={ph as number} face="smile" arms="up" />
              {/* 渡される順位表。白紙にせず 1・2・3 の行を刷っておく (下端 828) */}
              <g opacity={seg(f, 28 + i * 2, 38 + i * 2)}>
                <rect x={(mx as number) - 34} y={782} width={68} height={46} rx={3} fill={C.news} stroke={C.ink} strokeWidth={4} />
                <rect x={(mx as number) - 24} y={790} width={48} height={9} rx={2} fill={C.red} opacity={0.72} />
                {[0, 1, 2].map((k) => (
                  <g key={k}>
                    <circle cx={(mx as number) - 18} cy={807 + k * 7} r={2.6} fill={C.ink} />
                    <line x1={(mx as number) - 11} y1={807 + k * 7} x2={(mx as number) + 10 - k * 6} y2={807 + k * 7}
                      stroke={C.ink} strokeWidth={2.6} opacity={0.55} />
                  </g>
                ))}
              </g>
            </g>
          ),
        )}
      </g>

      {/* まだ出ていない枠にかぶせる薄幕。中身を描き終えたあとに重ねる */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={i * 640} y={0} width={640} height={H} fill={KRP.cream} opacity={0.8 * (1 - rv[i])} />
      ))}
      {/* 枠の仕切り板 (三幅対の中縁のつもり) */}
      <PanelRule x={640} />
      <PanelRule x={1280} />

      {/* 枠ごとの見出し。帯 (x60..384 y54..111) を避けて y=180 に揃える */}
      <g opacity={rv[0]}>
        <Maru x={212} y={180} n={1} />
        <TagPlate x={330} y={180} text="主催" size={48} t={1} />
      </g>
      <g opacity={rv[1]}>
        <Maru x={842} y={180} n={2} />
        <TagPlate x={960} y={180} text="速報" size={48} t={1} />
      </g>
      <g opacity={rv[2]}>
        <Maru x={1400} y={180} n={3} />
        <TagPlate x={1590} y={180} text="刷って配る" size={48} t={1} />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #138 「毎年1位を決めて盛り上がる」という文化は、部数競争から生まれた発明でした。
// 格: 図 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
const S138: React.FC<{ f: number }> = ({ f }) => {
  const ar = easeOut(seg(f, 14, 34));
  return (
    <Frame f={f} seed={1037} bg={KRP.cream}>
      <PressHall f={f} lamps={1} />
      {/* 左: 部数競争の積み上がった新聞の山 */}
      <g>
        {Array.from({ length: 13 }).map((_, i) => (
          /* 札 (490..910) を避けて山を左へ 70 ずらす */
          <rect key={i} x={126 + (i % 2) * 18 + i * 6} y={774 - i * 25} width={340 - i * 14} height={25} rx={3}
            fill={i % 2 ? C.newsDark : C.news} stroke={C.ink} strokeWidth={4.5} />
        ))}
        <rect x={182} y={374} width={272} height={82} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={6} />
        <text x={318} y={434} fontSize={54} fontFamily={FONT} fill={C.ink} textAnchor="middle">部数競争</text>
      </g>
      {/* 間に太い矢印 */}
      <g>
        <rect x={686} y={608} width={(434) * ar} height={60} rx={6} fill={C.red} stroke={C.ink} strokeWidth={6} opacity={0.85} />
        <g opacity={ar} transform={`translate(${686 + 434 * ar} 638)`}>
          <path d="M 0 0 L -8 -72 L 96 0 L -8 72 Z" fill={C.red} stroke={C.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 右: 毎年1位の王冠 */}
      <g opacity={seg(f, 24, 40)}>
        <ellipse cx={1512} cy={784} rx={168} ry={30} fill={C.ink} opacity={0.2} />
        <path d="M 1368 740 L 1340 584 L 1416 654 L 1512 556 L 1608 654 L 1684 584 L 1656 740 Z"
          fill={C.gold} stroke={C.ink} strokeWidth={7} />
        <rect x={1368} y={732} width={288} height={44} rx={8} fill={C.goldDark} stroke={C.ink} strokeWidth={6} />
        {[1416, 1512, 1608].map((gx, i) => (
          <circle key={i} cx={gx} cy={694} r={20} fill={C.red} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={1376} y={374} width={272} height={82} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={6} />
        <text x={1512} y={434} fontSize={54} fontFamily={FONT} fill={C.ink} textAnchor="middle">毎年1位</text>
      </g>
      {/* 発明の刻印 */}
      <g opacity={seg(f, 30, 42)} transform="rotate(-8 1038 776)">
        <ellipse cx={1038} cy={776} rx={112} ry={54} fill="none" stroke={C.red} strokeWidth={9} />
        <text x={1038} y={796} fontSize={54} fontFamily={FONT} fill={C.red} textAnchor="middle">発明</text>
      </g>
      {/* 札は 2行字幕でも沈まないよう y=750 (黒帯のすきま 63px)。左右は新聞の山(〜476)と当たらない */}
      <TagPlate x={700} y={750} text="部数競争から生まれた" size={38} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #139 この型は、音楽にも広がります。1940年にビルボード、1968年にはオリコンのチャートが誕生。
// 格: 図 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
// ★2026-11-08 作者修正「背景を音楽っぽい感じに」
//   床を EditorDesk (編集机の校正紙) から MusicRoom に差し替えた。
//   左のジュークボックス = 1940年のアメリカ / 右の家具調ステレオ = 1968年の日本 で、
//   左右のチャート盤がどちらの国の話かを背景の物だけで言い分ける。
//   札は「1940 と 1968」をやめた。年はチャート盤の紙面に刷ってあるので言い換えにならない。
//   代わりに字幕が言っていない「どの国か」を左右おなじ高さの2枚で出す (検品の両思い対応)。
const S139: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1038} bg={KRP.cream}>
    <MusicRoom f={f} />
    <ChartBoard x={608} y={430} s={0.78} f={f} phase="billboard" year="1940" name="ビルボード" t={seg(f, 2, 14)} />
    <ChartBoard x={1176} y={430} s={0.78} f={f} phase="oricon" year="1968" name="オリコン" t={seg(f, 10, 24)} />
    <TagPlate x={608} y={700} text="アメリカ" size={40} t={seg(f, 26, 40)} />
    <TagPlate x={1176} y={700} text="日本" size={40} t={seg(f, 30, 42)} />
  </Frame>
);

// ------------------------------------------------------------------
// #140 今週の1位、今年の1位が、次々と生産されるようになりました。
// 格: 並 — 設計書 docs/briefs/IchiB7.md の表のとおり
// ------------------------------------------------------------------
// ★2026-11-08 作者修正「ベルトコンベアが進んで行ってないから、左から右に行くように調整」
//   直す前はベルトの目の線だけが動き、チャート盤は translate(数px) で小刻みに揺れるだけだった
//   (0.3〜1.1px × 56 の剰余) ので「流れている」ように見えなかった。作り直しではなく動きの修正:
//     1. 盤ごとに 0→1 でループする流れ位置 u を持たせ、u から x と大きさを決める
//        → 奥 (左・小さい) から手前 (右・大きい) へ本当に移動していく
//     2. ベルトの目を右向きの「く」の字にして、止め絵でも進む向きが分かるようにした
//     3. ローラーを回し、盤の左うしろに速度線を引いた (f=45 の1枚でも左→右と読める)
const S140: React.FC<{ f: number }> = ({ f }) => {
  const slide = (f * 2.6) % 72; // ベルトの目の送り
  const roll = f * 5; // ローラーの回転
  // 5枚の盤。u はループする流れ位置。u が大きいほど手前 (右・大きい・濃い)
  const boards = Array.from({ length: 5 }).map((_, i) => {
    const u = (f / 112 + i / 5) % 1;
    return {
      i,
      u,
      x: lerp(-180, 2120, u),
      s: lerp(0.22, 0.56, u),
      // 奥 (u小) は薄く、右端から出ていくときだけ消す。左端は画面外なので湧き出しは見えない
      op: lerp(0.45, 1, u) * clamp01((1 - u) / 0.08),
      name: i % 2 === 0 ? "今週" : "今年",
    };
  });
  // 手前のものを後に描く (奥→手前の重なり順)
  const sorted = [...boards].sort((a, b) => a.u - b.u);
  // 「今週」の札は0番の盤に付けて一緒に流れる。真ん中あたりにいる間だけ見せる
  const tag = boards[0];
  const tagOp = tag.op * clamp01((tag.u - 0.1) / 0.1) * clamp01((0.86 - tag.u) / 0.1);
  return (
    <Frame f={f} seed={1039} bg={KRP.cream}>
      <PressHall f={f} lamps={1} />
      {/* ベルトコンベア */}
      <g>
        <rect x={0} y={700} width={W} height={82} fill={C.steelDark} stroke={C.ink} strokeWidth={6} />
        <rect x={0} y={700} width={W} height={18} fill={KRP.white} opacity={0.16} />
        {/* 目を右向きの「く」の字にする。これだけで止め絵でも送りの向きが決まる */}
        {Array.from({ length: 30 }).map((_, i) => {
          const bx = ((i * 72 + slide) % 2064) - 72;
          return (
            <path key={i} d={`M ${bx} 704 L ${bx + 26} 741 L ${bx} 778`}
              stroke={C.ink} strokeWidth={5} fill="none" opacity={0.32} strokeLinecap="round" />
          );
        })}
        {/* ローラーは回す (輻を入れないと回転が見えない) */}
        {[80, 500, 920, 1340, 1760].map((rx, i) => (
          <g key={i}>
            <circle cx={rx} cy={812} r={34} fill={C.roller} stroke={C.ink} strokeWidth={5} />
            <g transform={`rotate(${roll + i * 24} ${rx} 812)`}>
              {[0, 1, 2].map((k) => (
                <line key={k} x1={rx} y1={812} x2={rx + Math.cos((k / 3) * Math.PI * 2) * 30}
                  y2={812 + Math.sin((k / 3) * Math.PI * 2) * 30} stroke={C.ink} strokeWidth={4} opacity={0.45} />
              ))}
            </g>
          </g>
        ))}
      </g>
      {/* ベルトに乗って左から右へ流れていくチャート盤 */}
      {sorted.map((b) => (
        <g key={b.i} opacity={b.op}>
          {/* 速度線。盤の左うしろに引く = 右へ進んでいる印 */}
          {[0, 1, 2].map((k) => (
            <line key={k}
              x1={b.x - 230 * b.s - 26 - k * 16} y1={700 - 254 * b.s * (0.45 + k * 0.45)}
              x2={b.x - 230 * b.s - 110 - k * 44} y2={700 - 254 * b.s * (0.45 + k * 0.45)}
              stroke={C.ink} strokeWidth={4} opacity={0.26} strokeLinecap="round" />
          ))}
          <ChartBoard x={b.x} y={700 - 254 * b.s} s={b.s} f={f} phase="oricon" year="—" name={b.name} t={1} />
        </g>
      ))}
      {/* 流れていく1枚に「今週」の札がつき、日付の角がめくれる。
          札も盤と同じ倍率で大きくする (大きさが合っていないと浮いて見える) */}
      <g opacity={tagOp}
        transform={`translate(${tag.x} ${700 - 524 * tag.s - 62 * (tag.s / 0.45)}) scale(${tag.s / 0.45})`}>
        <rect x={-104} y={-42} width={208} height={84} rx={8} fill={C.paper} stroke={C.ink} strokeWidth={6} />
        <text x={0} y={22} fontSize={54} fontFamily={FONT} fill={C.ink} textAnchor="middle">今週</text>
        {/* めくれる角 */}
        <path d={`M 104 -42 L ${104 - 56 * (0.4 + 0.6 * Math.abs(Math.sin(f / 11)))} -42 L 104 ${-42 + 56 * (0.4 + 0.6 * Math.abs(Math.sin(f / 11)))} Z`}
          fill={C.newsDark} stroke={C.ink} strokeWidth={5} />
      </g>
      <TagPlate x={300} y={496} text="次々と" size={48} t={seg(f, 18, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #141 戦場ひとつから、帝国へ、江戸の町へ、そして国全体へ。
// 格: 山 — ★2026-11-08 作者修正で 図 → 山 に格上げ (設計書 docs/briefs/IchiB7.md も直した)
//
// 作者の指摘「同じ背景だしつまらない」。直す前は #141 も #142 も
// 「机に広げた紙の上に同心円を描いた平面図」で、第4章#76 ともまったく同じ型だった。
// そこで同心円の平面図をやめ、この文 (章のまとめ = リキャップ③前半) を
// 「明治の博物館の陳列室に、土俵が4つ 大きさ順に台に載って並ぶ回顧展」に建て替えた。
// 左から右へ歩いて見ていける形にすると、「戦場ひとつから…国全体へ」の
// 読み上げの順番がそのまま絵の順番になる。
// #142 は屋外・夜明け・暖色にしたので、2枚つづきでも舞台と色がぶつからない。
// ------------------------------------------------------------------

// 陳列室の色。#142 (夜明けの平野・暖色) と真逆の「屋内・夜・藍色」でそろえる
const MUS = {
  wall: "#2F3C56", wallLit: "#3C4D6C", panel: "#27334A",
  cornice: "#4C3B29", dado: "#46382A", dadoLit: "#5A4833",
  floor: "#4B3A27", floorLit: "#5D4830", floorJoint: "#33271A",
  brass: "#C9A24A", brassDark: "#8A6C2E", glow: "#FFE7A6",
  stone: "#8B7F66", stoneTop: "#A69879", stoneDark: "#6D624D",
  cloth: "#3D4857", // 台の天板に張った紺の布。砂色の土俵をここで浮き上がらせる
};

// 陳列台4つ。右へ行くほど台が高く・輪が大きくなる = 階段に見える。
// 円柱の台にして、天板を楕円で描く。こうしないと輪が台のへりに半分隠れてしまう。
// name は各時代の「正式名称」を入れる。字幕の語 (戦場ひとつ/帝国/江戸の町/国全体) を
// そのまま札にすると憲法第2条「札の言い換えの法」に反するので、名前の方で言い換える。
const MUS_CASES = [
  { cx: 300,  hw: 150, top: 660, r: 86,  name: "一番槍",     sub: "軍忠状で数える" },
  { cx: 700,  hw: 185, top: 600, r: 116, name: "科挙",       sub: "放榜で貼り出す" },
  { cx: 1130, hw: 215, top: 532, r: 146, name: "見立番付",   sub: "1757年の江戸" },
  { cx: 1590, hw: 245, top: 452, r: 180, name: "毎年日本一", sub: "1909年の優勝額" },
];
const MUS_PERSP = 0.34; // 台に「寝て載っている」輪に見せる縦のつぶし率
const MUS_BASE = 872;   // 台の下端 (床に着く高さ)

// 輪の中に置く、その時代のミニ模型。輪の大きさ r に合わせて縮める。
// 中身を作り込まないと「ただの大小の円」に戻ってしまうので、ここが山の心臓
const MusDiorama: React.FC<{ cx: number; cy: number; r: number; kind: number; f: number }> = ({
  cx, cy, r, kind, f,
}) => {
  // 輪の大きさに素直に比例させると、いちばん小さい「一番槍」が潰れて読めなくなる。
  // 下駄をはかせて 0.76〜1.05 の範囲に収め、小さい方も中身が分かるようにする
  const s = 0.5 + (0.55 * r) / 180;
  const flap = Math.sin(f / 9) * 7; // 幟や旗のはためき
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* 0 = 戦場ひとつ: 交差した槍2本・旗・巻いた軍忠状 */}
      {kind === 0 && (
        <g>
          <ellipse cx={0} cy={6} rx={116} ry={24} fill={C.dirt} opacity={0.55} />
          {[1, -1].map((d) => (
            <g key={d}>
              <line x1={d * 86} y1={10} x2={-d * 40} y2={-146} stroke="#6E5433" strokeWidth={10} strokeLinecap="round" />
              <path d={`M ${-d * 40} -146 L ${-d * 30} -186 L ${-d * 50} -176 Z`} fill={C.steel} stroke={C.ink} strokeWidth={5} />
            </g>
          ))}
          {/* 一番槍の旗 */}
          <line x1={-104} y1={12} x2={-104} y2={-132} stroke={C.deskDark} strokeWidth={9} />
          <path d={`M -100 -128 L ${-24 + flap} -108 L -100 -62 Z`} fill={C.red} stroke={C.ink} strokeWidth={5} />
          {/* 巻いた軍忠状 */}
          <g transform="translate(74 -4) rotate(-8)">
            <rect x={-44} y={-16} width={88} height={32} rx={16} fill={C.paper} stroke={C.ink} strokeWidth={5} />
            <line x1={-30} y1={-16} x2={-30} y2={16} stroke={C.ink} strokeWidth={3} opacity={0.4} />
            <line x1={4} y1={-16} x2={4} y2={16} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          </g>
        </g>
      )}
      {/* 1 = 帝国: 合格者を貼り出す壁 (放榜)・筆・硯 */}
      {kind === 1 && (
        <g>
          <ellipse cx={0} cy={6} rx={124} ry={26} fill={C.dirt} opacity={0.5} />
          <rect x={-104} y={-158} width={196} height={154} rx={5} fill={C.wall} stroke={C.ink} strokeWidth={6} />
          <rect x={-104} y={-176} width={196} height={24} rx={4} fill={C.roof} stroke={C.ink} strokeWidth={5} />
          {/* 貼り出された名前の紙3枚。1枚だけ赤い丸 = 状元 */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={-86 + i * 60} y={-140} width={46} height={122} rx={3} fill={C.paper} stroke={C.ink} strokeWidth={4} />
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={-74 + i * 60} y1={-118 + k * 26} x2={-52 + i * 60} y2={-118 + k * 26}
                  stroke={C.ink} strokeWidth={4} opacity={0.35} />
              ))}
            </g>
          ))}
          <circle cx={-63} cy={-80} r={20} fill="none" stroke={C.red} strokeWidth={6} />
          {/* 筆と硯 */}
          <g transform="translate(112 -6) rotate(20)">
            <rect x={-7} y={-116} width={14} height={104} rx={6} fill="#A68453" stroke={C.ink} strokeWidth={4} />
            <path d="M -8 -14 L 8 -14 L 0 22 Z" fill={C.ink} />
          </g>
          <ellipse cx={74} cy={4} rx={34} ry={13} fill="#39424E" stroke={C.ink} strokeWidth={4.5} />
        </g>
      )}
      {/* 2 = 江戸の町: 瓦屋根が3軒・立てた見立番付 */}
      {kind === 2 && (
        <g>
          <ellipse cx={0} cy={8} rx={128} ry={26} fill={C.dirt} opacity={0.5} />
          {/* 番付の紙 (段ごとに字の大きさが変わるのが見立番付の見分け) */}
          <g transform="translate(6 -98)">
            <rect x={-62} y={-80} width={124} height={164} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={6} />
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={-46} y1={-56 + k * 26} x2={46} y2={-56 + k * 26}
                stroke={C.ink} strokeWidth={10 - k * 1.2} opacity={0.42} />
            ))}
            <line x1={0} y1={-72} x2={0} y2={76} stroke={C.ink} strokeWidth={3} opacity={0.3} />
          </g>
          {/* 瓦屋根。棟と瓦の筋まで入れる */}
          {[{ x: -96, w: 72 }, { x: 78, w: 64 }, { x: -20, w: 56 }].map((h, i) => (
            <g key={i} transform={`translate(${h.x} ${2 - i * 4})`}>
              <rect x={-h.w / 2} y={-26} width={h.w} height={30} fill={C.wall} stroke={C.ink} strokeWidth={4.5} />
              <path d={`M ${-h.w / 2 - 12} -26 L 0 -56 L ${h.w / 2 + 12} -26 Z`} fill={C.roof} stroke={C.ink} strokeWidth={5} />
              {[-1, 0, 1].map((k) => (
                <line key={k} x1={k * (h.w / 4)} y1={-30 - Math.abs(k) * 4} x2={k * (h.w / 2.4)} y2={-26}
                  stroke={C.ink} strokeWidth={3} opacity={0.3} />
              ))}
            </g>
          ))}
        </g>
      )}
      {/* 3 = 国全体: 全国に屋根が広がり、輪転機が順位表を刷って配る */}
      {kind === 3 && (
        <g>
          <ellipse cx={0} cy={10} rx={132} ry={28} fill={C.dirt} opacity={0.45} />
          {/* 奥に並ぶ屋根 = 全国 */}
          {[-118, -86, -54, 54, 86, 118].map((hx, i) => (
            <g key={i} transform={`translate(${hx} ${-6 - (i % 3) * 5}) scale(${0.52 + (i % 2) * 0.12})`}>
              <rect x={-24} y={-26} width={48} height={30} fill={C.wall} stroke={C.ink} strokeWidth={5} />
              <path d="M -36 -26 L 0 -56 L 36 -26 Z" fill={C.roof} stroke={C.ink} strokeWidth={5} />
            </g>
          ))}
          {/* 幟2本 */}
          {[-134, 134].map((px, i) => (
            <g key={i}>
              <line x1={px} y1={6} x2={px} y2={-130} stroke={C.deskDark} strokeWidth={8} />
              <path d={`M ${px + (i ? -4 : 4)} -126 L ${px + (i ? -1 : 1) * (56 + flap)} -112 L ${px + (i ? -4 : 4)} -58 Z`}
                fill={C.cloth} stroke={C.ink} strokeWidth={4.5} />
            </g>
          ))}
          {/* 輪転機 (ローラーが回る) と刷り上がった順位表 */}
          <g transform="translate(-54 -32)">
            <rect x={-46} y={-50} width={92} height={78} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={6} />
            <circle cx={0} cy={-10} r={26} fill={C.roller} stroke={C.ink} strokeWidth={5} />
            <g transform={`rotate(${f * 7})`}>
              {[0, 1, 2].map((k) => (
                <line key={k} x1={0} y1={-10} x2={Math.cos((k / 3) * Math.PI * 2) * 22}
                  y2={-10 + Math.sin((k / 3) * Math.PI * 2) * 22} stroke={C.ink} strokeWidth={4} opacity={0.5} />
              ))}
            </g>
          </g>
          {/* 刷り上がった順位表 (1・2・3 の棒だけ。実在の名前は出さない) */}
          <g transform="translate(58 -84)">
            <rect x={-44} y={-54} width={88} height={112} rx={4} fill={C.news} stroke={C.ink} strokeWidth={6} />
            <rect x={-34} y={-44} width={68} height={16} fill={C.red} opacity={0.85} />
            {[0, 1, 2].map((k) => (
              <line key={k} x1={-32} y1={-14 + k * 24} x2={-32 + 60 - k * 16} y2={-14 + k * 24}
                stroke={C.ink} strokeWidth={9} opacity={0.4} />
            ))}
          </g>
        </g>
      )}
    </g>
  );
};

const S141: React.FC<{ f: number }> = ({ f }) => {
  // ④カメラが動く: いちばん大きな「毎年日本一」の台から、部屋ぜんたいへゆっくり引く。
  //   f=40 で倍率1に戻るので、検品する f=45 では札の座標が素のままになる
  const cam = zoomAt(lerp(1.1, 1, easeOut(seg(f, 0, 40))), 1420, 540);
  const LAMPS = [240, 600, 960, 1320, 1680];
  return (
    <Frame f={f} seed={1040} bg={MUS.wall} dark>
      <g transform={cam}>
        {/* ---------- 壁 (蛇腹・羽目板・長押・腰板) ---------- */}
        <rect x={0} y={0} width={W} height={790} fill={MUS.wall} />
        {/* ランプが上にある部屋なので、天井ちかくだけ明るい */}
        <rect x={0} y={98} width={W} height={300} fill={MUS.wallLit} opacity={0.55} />
        <rect x={0} y={0} width={W} height={60} fill={MUS.panel} />
        <rect x={0} y={60} width={W} height={34} fill={MUS.cornice} />
        <rect x={0} y={92} width={W} height={8} fill={MUS.brassDark} />
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={i} x1={i * 120} y1={100} x2={i * 120} y2={690} stroke={MUS.panel} strokeWidth={5} opacity={0.7} />
        ))}
        {/* 長押 (額を掛ける高さをそろえる横木) */}
        <rect x={0} y={434} width={W} height={13} fill={MUS.cornice} opacity={0.9} />
        <rect x={0} y={447} width={W} height={5} fill={MUS.brassDark} opacity={0.65} />
        {/* 腰板 */}
        <rect x={0} y={690} width={W} height={12} fill={MUS.cornice} />
        <rect x={0} y={702} width={W} height={88} fill={MUS.dado} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={28 + i * 242} y={716} width={196} height={58} rx={4}
            fill={MUS.dadoLit} stroke={MUS.panel} strokeWidth={4} opacity={0.8} />
        ))}

        {/* ---------- 寄木の床 (ベタ1色にしない = 第16条) ---------- */}
        <rect x={0} y={790} width={W} height={H - 790} fill={MUS.floor} />
        {/* 板の帯。奥ほど細く、手前ほど太い = 遠近 */}
        {[790, 820, 858, 906, 968, 1046].map((fy, i) => (
          <g key={i}>
            <rect x={0} y={fy} width={W} height={2 + i} fill={MUS.floorJoint} opacity={0.55} />
            {/* 板の短手の継ぎ目。1段ごとに半分ずらす = 寄木 */}
            {Array.from({ length: 10 }).map((_, k) => (
              <line key={k} x1={(i % 2 ? 96 : 0) + k * 192} y1={fy}
                x2={(i % 2 ? 96 : 0) + k * 192} y2={[820, 858, 906, 968, 1046, H][i]}
                stroke={MUS.floorJoint} strokeWidth={2.5} opacity={0.35} />
            ))}
          </g>
        ))}
        <rect x={0} y={790} width={W} height={46} fill={MUS.floorLit} opacity={0.35} />

        {/* ---------- 吊りランプ。左から右へ順に点く (⑤事件) ---------- */}
        <rect x={0} y={100} width={W} height={10} fill={MUS.brassDark} opacity={0.8} />
        {LAMPS.map((lx, i) => {
          const on = seg(f, 2 + i * 6, 10 + i * 6);
          return (
            <g key={i}>
              {/* 光のかさ (床まで広がる円すい) */}
              <path d={`M ${lx - 46} 196 L ${lx + 46} 196 L ${lx + 300} ${H} L ${lx - 300} ${H} Z`}
                fill={MUS.glow} opacity={0.11 * on} />
              <line x1={lx} y1={110} x2={lx} y2={150} stroke={MUS.brassDark} strokeWidth={7} />
              <path d={`M ${lx - 52} 196 Q ${lx} 136 ${lx + 52} 196 Z`} fill={MUS.brass} stroke={C.ink} strokeWidth={5} />
              <ellipse cx={lx} cy={196} rx={52} ry={13} fill={MUS.brassDark} stroke={C.ink} strokeWidth={4} />
              <circle cx={lx} cy={204} r={15} fill={MUS.glow} opacity={0.35 + 0.65 * on} />
            </g>
          );
        })}

        {/* ---------- 陳列台4つ。右 (高い) から左 (低い) へ描いて階段に重ねる ---------- */}
        {[...MUS_CASES].reverse().map((c) => {
          const i = MUS_CASES.indexOf(c);
          const t = seg(f, 4 + i * 8, 16 + i * 8);
          const ry = c.hw * MUS_PERSP;   // 天板の楕円の縦半径
          const hwB = c.hw * 0.94;       // 足もとは少しすぼめる
          const plateY = c.top + ry + 58;
          return (
            <g key={i}>
              {/* 床の影 */}
              <ellipse cx={c.cx} cy={MUS_BASE + 12} rx={c.hw * 1.04} ry={20} fill={C.ink} opacity={0.3} />
              {/* 円柱の胴。先に下の楕円を敷いてから胴でその上半分を隠すと、底が丸く見える */}
              <ellipse cx={c.cx} cy={MUS_BASE} rx={hwB} ry={hwB * MUS_PERSP} fill={MUS.stoneDark} stroke={C.ink} strokeWidth={6} />
              <path d={`M ${c.cx - c.hw} ${c.top} L ${c.cx + c.hw} ${c.top} L ${c.cx + hwB} ${MUS_BASE} L ${c.cx - hwB} ${MUS_BASE} Z`}
                fill={MUS.stone} stroke={C.ink} strokeWidth={6} />
              {/* 石の継ぎ目と、ランプを受けた左肩の明かり */}
              <path d={`M ${c.cx - c.hw} ${c.top} L ${c.cx - c.hw * 0.42} ${c.top} L ${c.cx - hwB * 0.42} ${MUS_BASE} L ${c.cx - hwB} ${MUS_BASE} Z`}
                fill={MUS.stoneTop} opacity={0.3} />
              <line x1={c.cx - c.hw * 0.42} y1={c.top + ry} x2={c.cx - hwB * 0.42} y2={MUS_BASE}
                stroke={MUS.stoneDark} strokeWidth={4} opacity={0.5} />
              <line x1={c.cx + c.hw * 0.46} y1={c.top + ry} x2={c.cx + hwB * 0.46} y2={MUS_BASE}
                stroke={MUS.stoneDark} strokeWidth={4} opacity={0.5} />
              <line x1={c.cx - hwB} y1={MUS_BASE - 30} x2={c.cx + hwB} y2={MUS_BASE - 30}
                stroke={MUS.stoneDark} strokeWidth={5} opacity={0.45} />
              {/* 天板。紺の布を張った面にして、砂色の土俵を浮かせる */}
              <ellipse cx={c.cx} cy={c.top} rx={c.hw} ry={ry} fill={MUS.cloth} stroke={C.ink} strokeWidth={6} />
              <ellipse cx={c.cx} cy={c.top} rx={c.hw - 14} ry={ry - 5} fill="none" stroke={MUS.brassDark} strokeWidth={3} opacity={0.7} />
              {/* 土俵の輪。斜め上から見ているので persp で寝かせ、俵も出す */}
              <DohyoRing cx={c.cx} cy={c.top} r={c.r} f={f} t={t} persp={MUS_PERSP} tawara={Math.round(c.r / 10)} />
              {/* 輪の中のミニ模型。ここを作り込まないと「ただの大小の円」に戻る */}
              <g opacity={seg(f, 10 + i * 8, 22 + i * 8)}>
                <MusDiorama cx={c.cx} cy={c.top} r={c.r} kind={i} f={f} />
              </g>
              {/* 真鍮の説明板 (正式名称 + 小さな手がかり) */}
              <g opacity={t}>
                <rect x={c.cx - 146} y={plateY - 44} width={292} height={88} rx={6}
                  fill={MUS.brass} stroke={C.ink} strokeWidth={5} />
                <rect x={c.cx - 136} y={plateY - 36} width={272} height={72} rx={4}
                  fill="none" stroke={MUS.brassDark} strokeWidth={3} />
                <text x={c.cx} y={plateY} fontSize={38} fontFamily={FONT} fill={C.ink} textAnchor="middle">{c.name}</text>
                <text x={c.cx} y={plateY + 30} fontSize={23} fontFamily={FONT} fill={C.ink} textAnchor="middle" opacity={0.78}>{c.sub}</text>
              </g>
            </g>
          );
        })}

        {/* ---------- ⑥人が反応する: 見にきた客 ---------- */}
        <Person x={876} y={1004} s={0.9} cloth="#5E7B96" clothDark="#46607A" face="surprised"
          pose="point" pointDir={1} f={f} />
        <PersonMini x={452} y={948} s={0.36} color="#A8623C" f={f} phase={5} face="dot" arms="down" />
        <PersonMini x={1304} y={938} s={0.33} color="#4F7A4A" f={f} phase={13} face="dot" arms="up" />
      </g>
      {/* 札はカメラの外。f=45 では倍率1なので、書いた座標のまま出る */}
      <TagPlate x={420} y={300} text="土俵が4段 広がる" size={44} t={seg(f, 24, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #142 土俵は国のサイズになり、しかも毎年、毎週、更新され続けるのです。
// 格: 山 — リキャップ③後半
//
// ★2026-11-08 作者修正「もっとこの文章にふさわしいイラストを作って。
//   同じ背景だしつまらない」。直す前は #141 と同じ「机の紙の上の同心円」だった。
//   この文は「土俵が国のサイズになった」と言っているので、紙の上の図ではなく
//   夜明けの平野そのものを土俵にした。地平線いっぱいの輪を1つだけ低い角度から見て、
//   輪の中には田・川・鉄道・町がまるごと入っている = これが「国のサイズ」。
//   「更新され続ける」は、俵の上を日付の板がぐるぐる回り続ける仕掛けで出す
//   (止まる瞬間がないので、見ていて終わらない)。
//   #141 が屋内・夜・藍色なので、こちらは屋外・夜明け・暖色にして色も重ねない。
//   ※結びのオチ (銅>銀) はここでは絶対に出さない。「国のサイズ」で止める。
// ------------------------------------------------------------------
const DAWN = {
  sky0: "#3B4870", sky1: "#5A5786", sky2: "#8B6D8B", sky3: "#C28F71", sky4: "#EFC58C",
  sun: "#FFD79A", sunCore: "#FFF0CC",
  mtFar: "#6D6794", mtNear: "#4D4A72",
  ground: "#B6A47C", groundDark: "#9A8861", groundLit: "#CDBB90",
  paddy: "#8FA876", paddyDark: "#6F8A58", river: "#9EB9C8",
  rail: "#6E5F48", roofT: "#8C6E4A",
};
const S142_CX = 960;
const S142_CY = 700;
const S142_R = 760;
const S142_PERSP = 0.3;
const S142_HORIZON = 472;

const S142: React.FC<{ f: number }> = ({ f }) => {
  // 輪のふち (楕円) の半径。板はこの上を回る
  const ea = S142_R + 14;
  const eb = ea * S142_PERSP;
  // ⑤事件: 日付の板が俵の上をぐるぐる回り続ける。止まる瞬間がない
  const boards = Array.from({ length: 12 })
    .map((_, i) => {
      const th = f * 0.055 + (i * Math.PI * 2) / 12;
      const near = (Math.sin(th) + 1) / 2;          // 1 = 手前 / 0 = 奥
      return {
        i,
        px: S142_CX + Math.cos(th) * ea,
        py: S142_CY + Math.sin(th) * eb,
        near,
        s: 0.36 + 0.68 * near,                       // 手前ほど大きい (差を強くつける)
      };
    })
    .sort((a, b) => a.near - b.near);                // 奥から描く
  // ④カメラ: ほんの少しだけ引く (f=36 で倍率1に戻る)
  const cam = zoomAt(lerp(1.06, 1, easeOut(seg(f, 0, 36))), S142_CX, S142_CY);
  return (
    <Frame f={f} seed={1041} bg={DAWN.sky2}>
      <g transform={cam}>
        {/* ---------- 夜明けの空 (上は藍・地平線は橙) ---------- */}
        {[
          [0, 128, DAWN.sky0], [112, 130, DAWN.sky1], [226, 110, DAWN.sky2],
          [322, 96, DAWN.sky3], [404, 76, DAWN.sky4],
        ].map(([sy, sh, col], i) => (
          <rect key={i} x={0} y={sy as number} width={W} height={sh as number} fill={col as string} opacity={0.92} />
        ))}
        {/* 朝日。山の端にかかる */}
        <circle cx={288} cy={430} r={168} fill={DAWN.sun} opacity={0.16} />
        <circle cx={288} cy={430} r={116} fill={DAWN.sun} opacity={0.22} />
        <circle cx={288} cy={430} r={74} fill={DAWN.sunCore} stroke={C.ink} strokeWidth={5} />
        {/* 朝の雲。線が目立つと空がうるさくなるので、薄く2本だけ */}
        {[[120, 214, 420], [1150, 168, 520]].map(([clx, cly, clw], i) => (
          <g key={i} opacity={0.26}>
            <rect x={clx as number} y={cly as number} width={clw as number} height={20} rx={10} fill={DAWN.sky4} />
            <rect x={(clx as number) + 90} y={(cly as number) + 32} width={(clw as number) * 0.55} height={14} rx={7} fill={DAWN.sky4} opacity={0.7} />
          </g>
        ))}
        {/* 遠くの山なみ2枚 */}
        <path d={`M 0 ${S142_HORIZON} L 0 408 L 170 300 L 300 388 L 470 274 L 650 384 L 820 332 L 980 404 L 1180 300 L 1360 392 L 1560 316 L 1760 398 L ${W} 350 L ${W} ${S142_HORIZON} Z`}
          fill={DAWN.mtFar} stroke={C.ink} strokeWidth={5} opacity={0.92} />
        <path d={`M 0 ${S142_HORIZON} L 0 440 L 240 376 L 420 436 L 700 388 L 940 442 L 1240 384 L 1520 440 L 1780 396 L ${W} 432 L ${W} ${S142_HORIZON} Z`}
          fill={DAWN.mtNear} stroke={C.ink} strokeWidth={5} />
        {/* 地平線ぎわの町 (小さな屋根の帯) */}
        {Array.from({ length: 26 }).map((_, i) => (
          <g key={i} opacity={0.65}>
            <rect x={700 + i * 44} y={S142_HORIZON - 16} width={26} height={16} fill={DAWN.mtNear} />
            <path d={`M ${694 + i * 44} ${S142_HORIZON - 16} L ${713 + i * 44} ${S142_HORIZON - 30} L ${732 + i * 44} ${S142_HORIZON - 16} Z`}
              fill={DAWN.mtNear} />
          </g>
        ))}

        {/* ---------- 平野 (ベタ1色にしない) ---------- */}
        <rect x={0} y={S142_HORIZON} width={W} height={H - S142_HORIZON} fill={DAWN.groundDark} />
        <rect x={0} y={S142_HORIZON} width={W} height={70} fill={DAWN.groundLit} opacity={0.45} />
        {/* 畦道。1点に集まる線で奥行きを出す */}
        {Array.from({ length: 19 }).map((_, i) => (
          <line key={i} x1={960 + (i - 9) * 28} y1={S142_HORIZON} x2={960 + (i - 9) * 300} y2={H}
            stroke={DAWN.ground} strokeWidth={4} opacity={0.3} />
        ))}
        {[500, 560, 650, 790, 980].map((gy, i) => (
          <line key={i} x1={0} y1={gy} x2={W} y2={gy} stroke={DAWN.ground} strokeWidth={3 + i} opacity={0.22} />
        ))}

        {/* ---------- 国のサイズの土俵。輪は1つだけ ---------- */}
        <DohyoRing cx={S142_CX} cy={S142_CY} r={S142_R} f={f} t={1}
          persp={S142_PERSP} tawara={48} dim={0.98} />

        {/* ---------- 輪の中身 = 国まるごと (楕円で切り抜く) ---------- */}
        <clipPath id="ib7s142land">
          <ellipse cx={S142_CX} cy={S142_CY} rx={S142_R - 12} ry={(S142_R - 12) * S142_PERSP} />
        </clipPath>
        <g clipPath="url(#ib7s142land)">
          <rect x={0} y={S142_HORIZON} width={W} height={H - S142_HORIZON} fill={DAWN.ground} opacity={0.6} />
          {/* 田んぼ。奥 (上) ほど薄く小さく */}
          {Array.from({ length: 44 }).map((_, i) => {
            const row = Math.floor(i / 11);
            const v = row / 3;                       // 0 = 奥
            const py = 516 + v * 330 + (i % 2) * 10;
            const pw = 92 + v * 150;
            const px = 170 + (i % 11) * (130 + v * 120) - v * 360;
            return (
              <g key={i}>
                <rect x={px} y={py} width={pw} height={28 + v * 30} rx={4}
                  fill={i % 3 === 0 ? DAWN.paddyDark : DAWN.paddy} stroke={C.ink} strokeWidth={2.5} opacity={0.62 + v * 0.2} />
                {/* 稲の筋 */}
                {Array.from({ length: 3 }).map((_, k) => (
                  <line key={k} x1={px + 8} y1={py + 9 + k * (9 + v * 9)} x2={px + pw - 8} y2={py + 9 + k * (9 + v * 9)}
                    stroke={DAWN.paddyDark} strokeWidth={2} opacity={0.5} />
                ))}
              </g>
            );
          })}
          {/* 川。朝日を映す */}
          <path d="M 240 512 Q 560 580 700 672 T 1060 896 Q 1180 960 1420 1000"
            stroke={DAWN.river} strokeWidth={30} fill="none" opacity={0.85} strokeLinecap="round" />
          <path d="M 240 512 Q 560 580 700 672 T 1060 896 Q 1180 960 1420 1000"
            stroke={DAWN.sunCore} strokeWidth={8} fill="none" opacity={0.4} strokeDasharray="22 30" />
          {/* 鉄道と、走る汽車 (小さく煙も) */}
          <line x1={300} y1={596} x2={1700} y2={568} stroke={DAWN.rail} strokeWidth={7} opacity={0.8} />
          {Array.from({ length: 36 }).map((_, i) => (
            <line key={i} x1={310 + i * 39} y1={588} x2={310 + i * 39} y2={606} stroke={DAWN.rail} strokeWidth={3} opacity={0.55} />
          ))}
          <g transform={`translate(${340 + ((f * 9) % 1400)} 578)`}>
            <rect x={-30} y={-26} width={60} height={26} rx={4} fill={C.steelDark} stroke={C.ink} strokeWidth={3.5} />
            <rect x={30} y={-20} width={44} height={20} rx={3} fill={C.deskDark} stroke={C.ink} strokeWidth={3} />
            <circle cx={-14} cy={2} r={7} fill={C.ink} />
            <circle cx={16} cy={2} r={7} fill={C.ink} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={-34 - k * 20} cy={-38 - k * 12} r={7 + k * 3} fill={KRP.white} opacity={0.42 - k * 0.1} />
            ))}
          </g>
          {/* 町のかたまり2つ (瓦屋根) */}
          {[{ bx: 520, by: 790, n: 7, sc: 1 }, { bx: 1300, by: 700, n: 6, sc: 0.78 }].map((t, ti) => (
            <g key={ti}>
              {Array.from({ length: t.n }).map((_, i) => (
                <g key={i} transform={`translate(${t.bx + i * 62 * t.sc} ${t.by - (i % 2) * 18 * t.sc}) scale(${t.sc})`}>
                  <rect x={-22} y={-30} width={44} height={32} fill={C.wall} stroke={C.ink} strokeWidth={3.5} />
                  <path d="M -32 -30 L 0 -58 L 32 -30 Z" fill={DAWN.roofT} stroke={C.ink} strokeWidth={4} />
                </g>
              ))}
            </g>
          ))}
          {/* ⑥人が反応する: 土俵の中にいる12人。手前ほど大きい */}
          {[
            [430, 628, 0.22], [660, 650, 0.25], [880, 618, 0.21], [1120, 646, 0.24],
            [1420, 664, 0.26], [330, 742, 0.3], [600, 766, 0.33], [860, 742, 0.31],
            [1170, 780, 0.35], [1500, 752, 0.32], [720, 878, 0.4], [1240, 884, 0.42],
          ].map(([mx, my, ms], i) => (
            <PersonMini key={i} x={mx} y={my} s={ms}
              color={["#A8623C", "#4F7A4A", "#5E7B96", "#6D5A8C"][i % 4]}
              f={f} phase={i * 3} face="smile" arms={i % 3 === 0 ? "up" : "down"} />
          ))}
        </g>

        {/* ---------- 輪の外。左右のすき間が空っぽだと平野に見えないので、
             明治の電信柱と草むらを置いて手前・奥の差をつける ---------- */}
        {[{ px: 84, top: 548, s: 1 }, { px: 1848, top: 584, s: 0.92 }].map((p, i) => (
          <g key={i}>
            <line x1={p.px} y1={960} x2={p.px} y2={p.top} stroke={C.deskDark} strokeWidth={14 * p.s} />
            {[0, 1].map((k) => (
              <g key={k}>
                <line x1={p.px - 52 * p.s} y1={p.top + 24 + k * 46} x2={p.px + 52 * p.s} y2={p.top + 24 + k * 46}
                  stroke={C.deskDark} strokeWidth={7 * p.s} />
                {[-1, 1].map((d) => (
                  <circle key={d} cx={p.px + d * 40 * p.s} cy={p.top + 18 + k * 46} r={6 * p.s} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
                ))}
              </g>
            ))}
            {/* 電線は画面の外へ抜けていく */}
            <path d={`M ${p.px} ${p.top + 18} Q ${p.px + (i ? -240 : 240)} ${p.top + 70} ${p.px + (i ? -480 : 480)} ${p.top + 40}`}
              stroke={C.ink} strokeWidth={3} fill="none" opacity={0.35} />
          </g>
        ))}
        {[[60, 918], [150, 962], [1790, 946], [1876, 902], [1700, 996], [240, 1004]].map(([gx, gy], i) => (
          <g key={i} opacity={0.7}>
            {[-1, 0, 1].map((d) => (
              <path key={d} d={`M ${gx} ${gy} Q ${(gx as number) + d * 16} ${(gy as number) - 24} ${(gx as number) + d * 26} ${(gy as number) - 42}`}
                stroke={DAWN.paddyDark} strokeWidth={5} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ))}

        {/* ---------- 回り続ける日付の板 (更新され続ける) ---------- */}
        {boards.map((b) => {
          const h = 170 * b.s;
          const bw = 86 * b.s;
          const bh = 56 * b.s;
          const ty = b.py - h;
          return (
            <g key={b.i} opacity={0.5 + 0.5 * b.near}>
              {/* 速度線。手前の板は左へ進むので、右うしろに引く */}
              {b.near > 0.55 && [0, 1].map((k) => (
                <line key={k} x1={b.px + bw + 10 + k * 16} y1={ty - 10 + k * 22}
                  x2={b.px + bw + 54 + k * 40} y2={ty - 10 + k * 22}
                  stroke={C.ink} strokeWidth={3.5} opacity={0.22} strokeLinecap="round" />
              ))}
              {/* 柱 */}
              <line x1={b.px} y1={b.py} x2={b.px} y2={ty + bh} stroke={C.deskDark} strokeWidth={7 * b.s + 2} />
              {/* 板。1・2・3 の棒だけ (実在の名前は出さない) */}
              <rect x={b.px - bw} y={ty - bh} width={bw * 2} height={bh * 2} rx={5}
                fill={C.paper} stroke={C.ink} strokeWidth={4 * b.s + 2} />
              {[0, 1, 2].map((k) => (
                <line key={k} x1={b.px - bw * 0.72} y1={ty - bh * 0.3 + k * bh * 0.52}
                  x2={b.px - bw * 0.72 + bw * (1.1 - k * 0.3)} y2={ty - bh * 0.3 + k * bh * 0.52}
                  stroke={C.ink} strokeWidth={6 * b.s + 1} opacity={0.34} />
              ))}
              {/* 日めくりの1枚がめくれる = 毎週書き換わっている印 */}
              <g transform={`translate(${b.px} ${ty - bh}) scale(1 ${Math.abs(Math.cos((f + b.i * 7) / 9))})`}>
                <rect x={-bw} y={-bh * 0.62} width={bw * 2} height={bh * 0.62} rx={4}
                  fill={C.newsDark} stroke={C.ink} strokeWidth={4 * b.s + 1.5} />
              </g>
              {/* いちばん手前にきた板だけ、日付が読める (伏字)。
                  ここをゆるめると同じ日付が3枚も並んで、回っている感じが消える */}
              {b.near > 0.97 && (
                <text x={b.px} y={ty + bh * 0.3} fontSize={38 * b.s} fontFamily={FONT} fill={C.ink} textAnchor="middle">
                  —月—日
                </text>
              )}
            </g>
          );
        })}

        {/* ---------- 回っている向きを見せる矢印 (左は上へ・右は下へ) ---------- */}
        <g opacity={0.6}>
          <path d={`M ${S142_CX - ea - 34} ${S142_CY + 110} Q ${S142_CX - ea - 58} ${S142_CY} ${S142_CX - ea - 34} ${S142_CY - 110}`}
            stroke={C.ink} strokeWidth={5} fill="none" strokeDasharray="18 14" />
          <Arrow x={168} y={556} s={0.66} rot={-80} t={seg(f, 10, 26)} />
          <path d={`M ${S142_CX + ea + 34} ${S142_CY - 110} Q ${S142_CX + ea + 58} ${S142_CY} ${S142_CX + ea + 34} ${S142_CY + 110}`}
            stroke={C.ink} strokeWidth={5} fill="none" strokeDasharray="18 14" />
          <Arrow x={1752} y={844} s={0.66} rot={80} t={seg(f, 10, 26)} />
        </g>

        {/* ---------- 外から見上げている人 ---------- */}
        <Person x={252} y={1010} s={0.92} cloth="#A8623C" clothDark="#8A4B2C" face="joy"
          pose="raise" f={f} />
      </g>
      {/* 「毎週」を数に言い換えた札 (憲法第2条)。カメラの外に出して座標を素のままにする */}
      <TagPlate x={1536} y={214} text="1年に52枚" size={46} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib7_s123:                  (f) => <S123 f={f} />,
  ib7_s124:                  (f) => <S124 f={f} />,
  ib7_s125:                  (f) => <S125 f={f} />,
  ib7_s126:                  (f) => <S126 f={f} />,
  ib7_s127:                  (f) => <S127 f={f} />,
  ib7_s128:                  (f) => <S128 f={f} />,
  ib7_s129:                  (f) => <S129 f={f} />,
  ib7_s130:                  (f) => <S130 f={f} />,
  ib7_s131:                  (f) => <S131 f={f} />,
  ib7_s132:                  (f) => <S132 f={f} />,
  ib7_s133:                  (f) => <S133 f={f} />,
  ib7_s134:                  (f) => <S134 f={f} />,
  ib7_s135:                  (f) => <S135 f={f} />,
  ib7_s136:                  (f) => <S136 f={f} />,
  ib7_s137:                  (f) => <S137 f={f} />,
  ib7_s138:                  (f) => <S138 f={f} />,
  ib7_s139:                  (f) => <S139 f={f} />,
  ib7_s140:                  (f) => <S140 f={f} />,
  ib7_s141:                  (f) => <S141 f={f} />,
  ib7_s142:                  (f) => <S142 f={f} />,
};

export const I_B7_MOTIFS: string[] = [
  "ib7_s123",                  // #123 第7章、毎年日本一は、新聞がつくった。
  "ib7_s124",                  // #124 舞台は、ふたたび日本。明治の終わり、新聞社は激しい部数競争のまっただ中にいました。
  "ib7_s125",                  // #125 そこで生まれたのが、「毎年、日本一を決める」という企画です。
  "ib7_s126",                  // #126 1909年、時事新報という新聞が、相撲の「優勝額」を始めました。
  "ib7_s127",                  // #127 場所でいちばん成績の良かった力士の肖像を、国技館に掲げる企画です。
  "ib7_s128",                  // #128 実はこれ、相撲協会の公式制度ではなく、新聞社のイベントでした。
  "ib7_s129",                  // #129 しかも記念すべき第1号の「優勝者」は、横綱でも大関でもなく、平幕の高見山。
  "ib7_s130",                  // #130 日本の「優勝」の歴史は、平幕力士から始まったのです。
  "ib7_s131",                  // #131 協会が優勝を正式な制度にしたのは、17年後の1926年のことでした。
  "ib7_s132",                  // #132 新聞社は、この成功の型を量産していきます。
  "ib7_s133",                  // #133 1915年、大阪朝日新聞が、中等学校の野球日本一を決める大会を始めました。
  "ib7_s134",                  // #134 いまの甲子園です。
  "ib7_s135",                  // #135 1920年には、報知新聞がお正月の箱根駅伝をスタートさせました。
  "ib7_s136",                  // #136 1927年の都市対抗野球は、東京日日新聞。いまの毎日新聞です。
  "ib7_s137",                  // #137 新聞が主催し、新聞が速報し、新聞が順位を刷って配る。
  "ib7_s138",                  // #138 「毎年1位を決めて盛り上がる」という文化は、部数競争から生まれた発明でした。
  "ib7_s139",                  // #139 この型は、音楽にも広がります。1940年にビルボード、1968年にはオリコンのチャートが誕生。
  "ib7_s140",                  // #140 今週の1位、今年の1位が、次々と生産されるようになりました。
  "ib7_s141",                  // #141 戦場ひとつから、帝国へ、江戸の町へ、そして国全体へ。
  "ib7_s142",                  // #142 土俵は国のサイズになり、しかも毎年、毎週、更新され続けるのです。
];

export const ichiB7Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B7_PREVIEW_FRAMES = Math.max(I_B7_MOTIFS.length, 1);
export const IchiB7Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B7_MOTIFS.length - 1);
  return <>{ichiB7Scene(I_B7_MOTIFS[i] ?? "", 45)}</>;
};
