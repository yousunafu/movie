// 「『2位』は、120年前に発明された」: 第11章「順位は作り変えられる。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#200〜#219 (20文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで20枚。
// motif 名は必ず ib11_ で始める。WobbleDefs の seed はこのファイルでは 1099〜1118 を使う。
// 設計書: docs/briefs/IchiB11.md (1文ごとの「格」と絵の中身を決めてから描く)
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
// ★#214 の江戸の人物は第5章の部品をそのまま流用する (からくり憲法 第7条 人物統一の法)。
//   人物の画風を章ごとに作り直すと、作者がすぐ見抜く「絵のブレ」になる。
//   逆に舞台 (第5章の EdoWall / Sumobeya) は共有しない。境内・土俵・幟は
//   この文のために #214 の中で新しく描く (制作ガイド §7 第3層-6「背景は共有しない」)。
import { EdoPerson, EdoPersonMini, Rikishi, Gyoji } from "./IchiB5";

// ===================================================================
// このファイルだけで使う色
// ===================================================================
const C = {
  ink: "#3A3A34",
  marble: "#E8E2D4",
  marbleDark: "#B8AE99",
  aegean: "#4A7A96",
  laurel: "#6E8F5A",
  laurelDark: "#4E6C3E",
  terracotta: "#B9674A",
  nightInk: "#3A4250",
  riceGold: "#C9A84C",
  soil: "#A08A62",
  gold: "#D9A93E",
  silver: "#AEB4BC",
  bronze: "#A9744B",
  dohyo: "#C9B88E",
  wood: "#B98A50",
  woodDark: "#8A6436",
  curtain: "#A8333A",
  curtainDark: "#7A2229",
  venueWall: "#CFC4AC",
  venueWallDark: "#A99D83",
  washi: "#F4ECD8",
  washiDark: "#D8CCAC",
  cork: "#C9A878",
  stone: "#B8AE99",
  stoneDark: "#8E8673",
  turf: "#86A861",
  turfDark: "#5E7C44",
  track: "#C0714E",
  dawn1: "#F2C98A",
  dawn2: "#E8A26A",
  dawn3: "#9FB8CE",
  flame: "#E8923A",
  flameIn: "#F2CE4C",
  red: "#C0392B",
  iron: "#8E949C",
  ironDark: "#5E646C",
  brassLike: "#C9A24C",
  blueSoftLike: "#C9DCEC",
};

// ===================================================================
// ローカル部品 (この章のあいだ使い回す)
// ===================================================================

/** 表彰式会場: 壁・木床・床板の継ぎ目・スポットの光芒と光だまり */
const VenueStage: React.FC<{
  f: number; beams?: Array<[number, number]>; floorY?: number; dim?: number;
}> = ({ f, beams = [[960, 900]], floorY = 980, dim = 0 }) => (
  <g>
    <rect x={0} y={0} width={W} height={floorY} fill={C.venueWall} />
    <g stroke={C.venueWallDark} strokeWidth={4} opacity={0.45}>
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`vw${i}`} x1={0} y1={110 + i * 150} x2={W} y2={110 + i * 150} />
      ))}
      <line x1={330} y1={0} x2={330} y2={floorY} />
      <line x1={1590} y1={0} x2={1590} y2={floorY} />
    </g>
    <rect x={0} y={floorY - 70} width={W} height={26} fill={C.woodDark} opacity={0.5} />
    {/* 木床 */}
    <rect x={0} y={floorY} width={W} height={H - floorY} fill={C.wood} />
    <g stroke={C.woodDark} strokeWidth={4} opacity={0.6}>
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`fj${i}`} x1={i * 190 - 80} y1={floorY} x2={i * 240 - 300} y2={H} />
      ))}
      <path d={`M0,${floorY + 54} Q960,${floorY + 42} 1920,${floorY + 58}`} fill="none" />
    </g>
    <line x1={0} y1={floorY} x2={W} y2={floorY} stroke={KRP.ink} strokeWidth={6} />
    {dim > 0 && <rect x={0} y={0} width={W} height={H} fill="#1C2130" opacity={dim} />}
    {beams.map(([bx, by], i) => (
      <g key={`bm${i}`} opacity={0.36 + 0.08 * Math.abs(Math.sin((f + i * 17) / 16))}>
        <polygon points={`${bx - 90},0 ${bx + 90},0 ${bx + 230},${by} ${bx - 230},${by}`}
          fill="#F7EFD0" opacity={0.42} />
        <ellipse cx={bx} cy={by} rx={240} ry={56} fill="#F7EFD0" opacity={0.6} />
      </g>
    ))}
  </g>
);

/** 緞帳 (上辺の赤幕 + 房。f で揺れる) */
const CurtainTop: React.FC<{ f: number; h?: number }> = ({ f, h = 180 }) => (
  <g>
    <rect x={0} y={0} width={W} height={h} fill={C.curtain}
      stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.curtainDark} strokeWidth={7} opacity={0.65}>
      {Array.from({ length: 17 }, (_, i) => (
        <line key={`cd${i}`} x1={i * 118} y1={0} x2={i * 118 + 18} y2={h} />
      ))}
    </g>
    <path
      d={`M0,${h} ` + Array.from({ length: 8 }, (_, i) =>
        `Q${i * 240 + 120},${h + 44 + Math.sin((f + i * 11) / 15) * 6} ${i * 240 + 240},${h + 6}`
      ).join(" ") + ` L1920,0 L0,0 Z`}
      fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
    {[200, 760, 1320, 1780].map((tx, i) => (
      <g key={`ts${i}`} transform={`translate(${tx} ${h + 10}) rotate(${Math.sin((f + i * 13) / 17) * 3})`}>
        <circle cx={0} cy={0} r={17} fill={C.riceGold} stroke={KRP.ink} strokeWidth={4} />
        <path d="M-12,13 L-9,52 M0,17 L0,58 M12,13 L9,52"
          stroke={C.riceGold} strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
    ))}
  </g>
);

/** 3段の表彰台 (天板・側面の影・木目・番号)。lift で高さを変える */
const Podium: React.FC<{
  cx?: number; gy?: number; lift?: number; opacity?: number; nums?: boolean;
}> = ({ cx = 960, gy = 880, lift = 1, opacity = 1, nums = true }) => {
  const steps: Array<{ dx: number; w: number; h: number; n: string }> = [
    { dx: -400, w: 380, h: 220, n: "2" },
    { dx: 400, w: 380, h: 150, n: "3" },
    { dx: 0, w: 400, h: 330, n: "1" },
  ];
  return (
    <g opacity={opacity}>
      {steps.map((s, i) => {
        const h = s.h * lift;
        const x0 = cx + s.dx - s.w / 2;
        return (
          <g key={`pd${i}`}>
            <rect x={x0} y={gy - h} width={s.w} height={h}
              fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
            <rect x={x0} y={gy - h} width={s.w} height={h}
              fill={C.woodDark} opacity={0.2} />
            <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.5}>
              {Array.from({ length: 4 }, (_, k) => (
                <path key={`wg${k}`}
                  d={`M${x0 + 16},${gy - h + 40 + k * (h / 4.6)} Q${x0 + s.w / 2},${gy - h + 24 + k * (h / 4.6)} ${x0 + s.w - 16},${gy - h + 44 + k * (h / 4.6)}`}
                  fill="none" />
              ))}
            </g>
            <rect x={x0 - 16} y={gy - h - 26} width={s.w + 32} height={30} rx={6}
              fill="#D3A96A" stroke={KRP.ink} strokeWidth={6} />
            {nums && (
              <g>
                <circle cx={cx + s.dx} cy={gy - Math.min(h / 2, 90)} r={50}
                  fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
                <text x={cx + s.dx} y={gy - Math.min(h / 2, 90) + 22} textAnchor="middle"
                  fontFamily={FONT} fontWeight={900} fontSize={62} fill={C.ink}>{s.n}</text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** 競技場 (空・雲・観客席の帯・観客の点・芝・トラックの白線) */
const Stadium: React.FC<{ f: number; horizon?: number }> = ({ f, horizon = 420 }) => (
  <g>
    <defs>
      <linearGradient id="stsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8C8DE" />
        <stop offset="100%" stopColor="#DCE8EC" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={horizon} fill="url(#stsky)" />
    <g fill={KRP.white} opacity={0.7}>
      {([[240, 80, 1], [860, 50, 0.8], [1540, 96, 1.1]] as Array<[number, number, number]>)
        .map(([cxx, cyy, s], i) => (
          <g key={`cl${i}`} transform={`translate(${cxx} ${cyy}) scale(${s})`}>
            <ellipse cx={0} cy={0} rx={96} ry={36} />
            <ellipse cx={-60} cy={12} rx={62} ry={28} />
            <ellipse cx={62} cy={14} rx={56} ry={24} />
          </g>
        ))}
    </g>
    {/* 観客席の帯 */}
    <rect x={0} y={horizon - 150} width={W} height={150} fill="#7A8396"
      stroke={KRP.ink} strokeWidth={5} />
    <g>
      {Array.from({ length: 150 }, (_, i) => (
        <circle key={`au${i}`} cx={(i % 50) * 40 + 12 + (Math.floor(i / 50) % 2) * 20}
          cy={horizon - 124 + Math.floor(i / 50) * 44} r={11}
          fill={["#D8CDB4", "#C08A6A", "#8FA8C0", "#B7A0C2", "#9FB882"][i % 5]}
          opacity={0.6 + 0.3 * Math.abs(Math.sin((f + i * 7) / 19))} />
      ))}
    </g>
    <rect x={0} y={horizon - 10} width={W} height={20} fill="#5E6678"
      stroke={KRP.ink} strokeWidth={4} />
    <rect x={0} y={horizon} width={W} height={180} fill={C.track} />
    <g stroke={KRP.white} strokeWidth={5} opacity={0.8}>
      {[0, 1, 2, 3].map((i) => (
        <line key={`tl${i}`} x1={0} y1={horizon + 36 + i * 44} x2={W} y2={horizon + 40 + i * 44} />
      ))}
    </g>
    <rect x={0} y={horizon + 180} width={W} height={H - horizon - 180} fill={C.turf} />
    <g stroke={C.turfDark} strokeWidth={34} opacity={0.2}>
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`tf${i}`} x1={-100} y1={horizon + 230 + i * 120}
          x2={W + 100} y2={horizon + 240 + i * 120} />
      ))}
    </g>
    <line x1={0} y1={horizon + 180} x2={W} y2={horizon + 180}
      stroke={KRP.white} strokeWidth={6} opacity={0.7} />
  </g>
);

/** 寄りのカメラ。world の点 (px,py) を screen の点 (qx,qy) に置いたまま z 倍する。
 *  `zoomAt` は中心が動かないので「寄りながら主役を画面の真ん中へ寄せる」ができない。
 *  z=1 のとき (qx,qy)=(px,py) を渡せば何も動かないので、lerp で素直につなげられる。 */
const camTo = (z: number, px: number, py: number, qx: number, qy: number) =>
  `translate(${qx - px * z} ${qy - py * z}) scale(${z})`;

/** 夕暮れの競技場 (#203 専用の舞台)。
 *  昼の `Stadium` (#209 が使う) と色の印象をはっきり変えるため、
 *  空は藍→紫→橙のグラデ、観客席は影へ沈め、照明塔の灯りとフラッシュだけを光らせる。
 *  からくり憲法 第7条が揃えるのは「人物」で、背景・構図・カメラは1枚ごとに変えてよい。 */
const DuskStadium: React.FC<{ f: number; id: string; horizon?: number }> = ({
  f, id, horizon = 430,
}) => {
  const steel = "#2E3648";
  // 照明塔 (dir = 光芒が倒れる向き)
  const tower = (tx: number, dir: number, k: number) => (
    <g>
      <path
        d={`M${tx - 40},${horizon + 60} L${tx - 16},${horizon - 300} L${tx + 16},${horizon - 300} L${tx + 40},${horizon + 60} Z`}
        fill={steel} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={steel} strokeWidth={5}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`tb${k}${i}`}
            x1={tx - 36 + i * 3} y1={horizon + 30 - i * 56}
            x2={tx + 36 - i * 3} y2={horizon + 2 - i * 56} />
        ))}
      </g>
      <rect x={tx - 98} y={horizon - 392} width={196} height={96} rx={8}
        fill={steel} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={`lp${k}${i}`}
          cx={tx - 72 + (i % 4) * 48} cy={horizon - 366 + Math.floor(i / 4) * 46} r={17}
          fill="#FFF3C4" stroke={KRP.ink} strokeWidth={4}
          opacity={0.72 + 0.24 * Math.abs(Math.sin((f + i * 9 + k * 31) / 15))} />
      ))}
      {/* 光芒 */}
      <polygon
        points={`${tx - 98},${horizon - 292} ${tx + 98},${horizon - 292} ${tx + dir * 760},${horizon + 420} ${tx + dir * 300},${horizon + 420}`}
        fill="#FFF3C4" opacity={0.15} />
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id={`dsky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#36405E" />
          <stop offset="42%" stopColor="#7C6487" />
          <stop offset="76%" stopColor={C.dawn2} />
          <stop offset="100%" stopColor={C.dawn1} />
        </linearGradient>
        <radialGradient id={`dpool${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3C4" stopOpacity={0.72} />
          <stop offset="100%" stopColor="#FFF3C4" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 空 */}
      <rect x={-220} y={-220} width={W + 440} height={horizon + 220} fill={`url(#dsky${id})`} />
      {/* 低くたなびく夕雲 (橙の帯) */}
      <g>
        {([[260, 112, 300, 0.5], [1020, 74, 400, 0.4], [1660, 140, 260, 0.45]] as Array<[number, number, number, number]>)
          .map(([cxx, cyy, rx, op], i) => (
            <g key={`dc${i}`} opacity={op}>
              <ellipse cx={cxx} cy={cyy} rx={rx} ry={20} fill={C.dawn1} />
              <ellipse cx={cxx - rx * 0.4} cy={cyy + 26} rx={rx * 0.5} ry={13} fill={C.dawn1} />
            </g>
          ))}
      </g>
      {/* 一番星 */}
      {([[460, 70], [1480, 48], [1790, 104]] as Array<[number, number]>).map(([sx, sy], i) => (
        <g key={`st${i}`} opacity={0.5 + 0.4 * Math.abs(Math.sin((f + i * 23) / 21))}>
          <path d={`M${sx - 13},${sy} L${sx + 13},${sy} M${sx},${sy - 13} L${sx},${sy + 13}`}
            stroke={KRP.white} strokeWidth={4} />
        </g>
      ))}
      {tower(210, -1, 0)}
      {tower(1720, 1, 1)}
      {/* 観客席の帯 (影に沈める) */}
      <rect x={-220} y={horizon - 168} width={W + 440} height={168} fill="#3F4656"
        stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 160 }, (_, i) => (
        <circle key={`au${i}`}
          cx={(i % 40) * 50 + 16 + (Math.floor(i / 40) % 2) * 25}
          cy={horizon - 142 + Math.floor(i / 40) * 40} r={11}
          fill="#8A8EA0" opacity={0.3 + 0.2 * Math.abs(Math.sin((f + i * 7) / 23))} />
      ))}
      {/* カメラのフラッシュ (暗い客席の中でだけ強く光る) */}
      {Array.from({ length: 22 }, (_, i) => {
        const on = Math.sin((f + i * 13) / 5) > 0.58;
        return (
          <circle key={`fl${i}`}
            cx={(i * 173) % (W + 120) - 60} cy={horizon - 150 + ((i * 59) % 130)}
            r={on ? 24 : 7} fill="#FFF8DC" opacity={on ? 0.95 : 0.1} />
        );
      })}
      {/* 手すり */}
      <rect x={-220} y={horizon - 12} width={W + 440} height={22} fill="#20283A"
        stroke={KRP.ink} strokeWidth={4} />
      {/* トラック (夕日で温かく沈む) */}
      <rect x={-220} y={horizon} width={W + 440} height={190} fill="#9E5A42" />
      <g stroke="#E8D7B4" strokeWidth={5} opacity={0.55}>
        {[0, 1, 2, 3].map((i) => (
          <line key={`tl${i}`} x1={-220} y1={horizon + 40 + i * 46} x2={W + 220} y2={horizon + 44 + i * 46} />
        ))}
      </g>
      {/* 芝 (夜寄りの深い緑) */}
      <rect x={-220} y={horizon + 190} width={W + 440} height={H - horizon - 190 + 440} fill="#4E6B40" />
      <g stroke="#3A5230" strokeWidth={36} opacity={0.3}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`tf${i}`} x1={-220} y1={horizon + 246 + i * 118} x2={W + 220} y2={horizon + 256 + i * 118} />
        ))}
      </g>
      <line x1={-220} y1={horizon + 190} x2={W + 220} y2={horizon + 190}
        stroke="#E8D7B4" strokeWidth={6} opacity={0.5} />
    </g>
  );
};

/** ギリシャの柱 (序#3 の呼び戻し用) */
const GreekColumn: React.FC<{
  x: number; y: number; h?: number; w?: number; opacity?: number;
}> = ({ x, y, h = 700, w = 120, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x - w / 2 - 18} y={y - 26} width={w + 36} height={30} rx={5}
      fill={C.marbleDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={x - w / 2} y={y - h} width={w} height={h - 24}
      fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
    <g stroke={C.marbleDark} strokeWidth={4} opacity={0.75}>
      {[-0.3, -0.1, 0.1, 0.3].map((k, i) => (
        <line key={`fl${i}`} x1={x + w * k} y1={y - h + 30} x2={x + w * k} y2={y - 34} />
      ))}
    </g>
    <rect x={x - w / 2 - 22} y={y - h - 34} width={w + 44} height={38} rx={6}
      fill={C.marbleDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={x - w / 2 - 30} y={y - h - 58} width={w + 60} height={26} rx={5}
      fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

/** まっさらの記録の石碑 (欠け・ノミ跡つき) */
const Sekihi: React.FC<{
  x: number; y: number; w?: number; h?: number; f?: number;
}> = ({ x, y, w = 720, h = 820, f = 0 }) => (
  <g>
    <ellipse cx={x} cy={y + 8} rx={w * 0.62} ry={28} fill={C.marbleDark} opacity={0.5} />
    <rect x={x - w / 2 - 40} y={y - 56} width={w + 80} height={58} rx={8}
      fill={C.marbleDark} stroke={KRP.ink} strokeWidth={6} />
    <path d={`M${x - w / 2},${y - 46} L${x - w / 2},${y - h + 70} Q${x - w / 2 + 12},${y - h} ${x - w / 2 + 90},${y - h + 6} L${x + w / 2 - 60},${y - h + 18} Q${x + w / 2},${y - h + 40} ${x + w / 2},${y - h + 110} L${x + w / 2},${y - 46} Z`}
      fill={C.marble} stroke={KRP.ink} strokeWidth={6} />
    {/* ノミ跡 */}
    <g stroke={C.marbleDark} strokeWidth={3.5} opacity={0.6}>
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`ch${i}`} x1={x - w / 2 + 24} y1={y - h + 110 + i * ((h - 180) / 16)}
          x2={x - w / 2 + 24 + 40 + (i % 3) * 18}
          y2={y - h + 112 + i * ((h - 180) / 16)} />
      ))}
      <line x1={x + w / 2 - 40} y1={y - h + 160} x2={x + w / 2 - 40} y2={y - 90} />
    </g>
    {/* 欠け */}
    <path d={`M${x + w / 2},${y - h + 180} L${x + w / 2 - 44},${y - h + 230} L${x + w / 2},${y - h + 270} Z`}
      fill={C.marbleDark} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
    <g opacity={0.14 + 0.05 * Math.abs(Math.sin(f / 18))}>
      <rect x={x - w / 2 + 16} y={y - h + 90} width={w * 0.3} height={h - 190}
        fill={KRP.white} />
    </g>
  </g>
);

/** 木の机 + 広げた和紙 (文鎮・筆)。図の「床」 */
const DeskBack: React.FC<{
  f: number; id: string; px?: number; py?: number; pw?: number; ph?: number;
  bunchin?: boolean; fude?: boolean;
}> = ({ f, id, px = 230, py = 90, pw = 1460, ph = 600, bunchin = true, fude = true }) => (
  <g>
    {/* 奥の壁 */}
    <rect x={0} y={0} width={W} height={300} fill="#D8CDB2" />
    <g stroke={C.venueWallDark} strokeWidth={4} opacity={0.4}>
      <line x1={0} y1={120} x2={W} y2={120} />
      <line x1={0} y1={250} x2={W} y2={250} />
    </g>
    <rect x={0} y={282} width={W} height={24} fill={C.woodDark} opacity={0.5} />
    {/* 机 */}
    <rect x={0} y={300} width={W} height={H - 300} fill={C.wood} />
    <g stroke={C.woodDark} strokeWidth={4} opacity={0.5}>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`dg${i}`} d={`M0,${330 + i * 100} Q960,${314 + i * 100} 1920,${338 + i * 100}`} fill="none" />
      ))}
    </g>
    <line x1={0} y1={300} x2={W} y2={300} stroke={KRP.ink} strokeWidth={6} />
    {/* 和紙 */}
    <rect x={px + 12} y={py + 14} width={pw} height={ph} rx={4}
      fill={C.woodDark} opacity={0.4} />
    <rect x={px} y={py} width={pw} height={ph} rx={4}
      fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
    <clipPath id={`wp${id}`}>
      <rect x={px} y={py} width={pw} height={ph} rx={4} />
    </clipPath>
    <g clipPath={`url(#wp${id})`} opacity={0.5}>
      <GridPaper tombo={false} pitch={62} />
    </g>
    {/* 紙の繊維 */}
    <g clipPath={`url(#wp${id})`} stroke={C.washiDark} strokeWidth={2.5} opacity={0.5}>
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`fb${i}`} x1={px} y1={py + 40 + i * (ph / 10)}
          x2={px + pw} y2={py + 46 + i * (ph / 10)} />
      ))}
    </g>
    {bunchin && (
      <g>
        {[px + 70, px + pw - 70].map((bx, i) => (
          <g key={`bc${i}`}>
            <rect x={bx - 70} y={py + ph - 44} width={140} height={28} rx={8}
              fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={bx - 22} y={py + ph - 60} width={44} height={18} rx={8}
              fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    )}
    {fude && (
      <g transform={`translate(${px + pw - 180} ${py + ph + 90}) rotate(-14)`}>
        <rect x={-130} y={-12} width={220} height={24} rx={10}
          fill="#7A5A38" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M90,-12 Q150,-4 176,0 Q150,4 90,12 Z"
          fill={C.ink} stroke={KRP.ink} strokeWidth={4} />
        <rect x={70} y={-14} width={26} height={28} rx={6}
          fill={C.riceGold} stroke={KRP.ink} strokeWidth={4} />
      </g>
    )}
  </g>
);

/** 比べる先の図。phase 1=2位が上の金を見る / 2=3位が下の4位を見る */
const KurabeZu: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const t = easeOut(seg(f, 6, 26));
  const GY = 600;
  const blocks: Array<[number, number, string]> = [
    [700, 140, "2"], [960, 210, "1"], [1220, 90, "3"],
  ];
  return (
    <g>
      {/* 壁 + 画鋲でとめた画用紙 */}
      <rect x={0} y={0} width={W} height={H} fill="#DED4BC" />
      <g stroke="#BCAF92" strokeWidth={4} opacity={0.45}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`wl${i}`} x1={0} y1={90 + i * 160} x2={W} y2={90 + i * 160} />
        ))}
      </g>
      <rect x={0} y={930} width={W} height={26} fill={C.woodDark} opacity={0.5} />
      <rect x={312} y={92} width={1300} height={700} rx={4}
        fill={C.woodDark} opacity={0.3} />
      <rect x={300} y={80} width={1300} height={700} rx={4}
        fill="#F6F1E2" stroke={KRP.ink} strokeWidth={5} />
      <clipPath id={`kz${phase}`}>
        <rect x={300} y={80} width={1300} height={700} rx={4} />
      </clipPath>
      <g clipPath={`url(#kz${phase})`} opacity={0.45}>
        <GridPaper tombo={false} pitch={58} />
      </g>
      {([[330, 110], [1570, 110], [330, 750], [1570, 750]] as Array<[number, number]>)
        .map(([pxx, pyy], i) => (
          <g key={`pn${i}`}>
            <circle cx={pxx} cy={pyy} r={13} fill={KRP.red}
              stroke={KRP.ink} strokeWidth={4} />
            <circle cx={pxx - 4} cy={pyy - 4} r={4} fill={KRP.white} opacity={0.8} />
          </g>
        ))}
      {/* 表彰台の簡略図 */}
      {blocks.map(([bx, bh, n], i) => (
        <g key={`bk${i}`}>
          <rect x={bx - 110} y={GY - bh} width={220} height={bh}
            fill={i === 0 ? C.silver : i === 1 ? C.gold : C.bronze}
            stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <text x={bx} y={GY - bh / 2 + 18} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={52} fill={C.ink}>{n}</text>
          <PersonMini x={bx} y={GY - bh - 6} s={0.42}
            color={i === 0 ? "#8E96A0" : i === 1 ? "#C9A84C" : "#A9744B"}
            f={f} phase={i} face="dot" />
        </g>
      ))}
      <line x1={420} y1={GY} x2={1500} y2={GY} stroke={KRP.ink} strokeWidth={6} />
      {phase === 1 ? (
        <g>
          {/* 2位 → 上の金 */}
          <line x1={700} y1={398} x2={700} y2={300} stroke={KRP.red} strokeWidth={14} />
          <line x1={700} y1={300} x2={852} y2={300} stroke={KRP.red} strokeWidth={14} />
          <Arrow x={930} y={300} s={1.2} t={seg(f, 10, 22)} />
          {/* ありえた自分 (点線) */}
          <g opacity={t}>
            <rect x={850} y={236} width={220} height={210} rx={4} fill="none"
              stroke={C.ink} strokeWidth={5} strokeDasharray="16 12" opacity={0.8} />
            <PersonMini x={960} y={230} s={0.42} color="#C9A84C" f={f} phase={4} face="smile" />
            <circle cx={1066} cy={196} r={30} fill={C.gold}
              stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          </g>
        </g>
      ) : (
        <g>
          {/* 3位 → 下の台の外 */}
          <line x1={1220} y1={520} x2={1220} y2={596} stroke={KRP.red} strokeWidth={14} />
          <line x1={1220} y1={596} x2={1372} y2={596} stroke={KRP.red} strokeWidth={14} />
          <Arrow x={1450} y={596} s={1.2} t={seg(f, 10, 22)} />
          <g opacity={t}>
            <rect x={1470} y={520} width={150} height={82} rx={4} fill="none"
              stroke={C.ink} strokeWidth={5} strokeDasharray="16 12" opacity={0.8} />
            <text x={1545} y={582} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={52} fill={C.ink} opacity={0.6}>4</text>
          </g>
          {/* 汗のしずく */}
          <ellipse cx={1282} cy={448 + Math.sin(f / 8) * 4} rx={11} ry={16}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} opacity={t} />
        </g>
      )}
    </g>
  );
};

// ★2026-11-08 削除: Koubou (板壁・道具棚・作業台の工房背景)。
//   この部品を使っていたのは #217 だけで、その #217 が直前の #210 #211 (どちらも工房) と
//   同じ板壁・同じ木の色を三枚続けていたため、作者の指摘どおり
//   「同じ背景・同じ色使いで淡々と続く」絵になっていた (からくり憲法 第13条 1文1演出の法)。
//   #217 は朝の川原に描き直したので、この背景部品は使い手がいなくなった。

// 「順位」という発明品の装置 (歯車 + 数直線のレール + 1〜5 の目盛り板)
// ★この装置は #210 → #211 と続けて出る「同じ物」なので、見た目は1つに固定し、
//   組み上がり具合だけを引数で変える (からくり憲法 第15条 部品還元の法 / 第7条 同じ物の見た目)。
//   plates   = レールに立っている目盛り板の番号。抜けている番号は「空のねじ穴」で描く
//   gears    = 軸に付いている歯車の数 (外した歯車は呼ぶ側のシーンで好きな場所に置く)
//   spin     = 歯車の回る速さ (0 で止まる = 動力が外れている)
//   screw    = ねじの締まり。half は頭が浮いたまま / turning は回っている最中
//   blankPlate = まだ何も書かれていない新しい板がはまりかけている位置
// 既定値は「ぜんぶ組み上がった状態」なので、引数を何も書かなければ従来の絵が出る。
const JuniSochi: React.FC<{
  f: number; cx?: number; gy?: number;
  plates?: number[]; gears?: 0 | 1 | 2 | 3; spin?: number;
  screw?: "tight" | "half" | "turning"; blankPlate?: number | null;
}> = ({
  f, cx = 960, gy = 700, plates = [1, 2, 3, 4, 5], gears = 3,
  spin = 0.55, screw = "tight", blankPlate = null,
}) => {
  const rot = f * spin;
  const slotX = (n: number) => cx - 272 + (n - 1) * 136;
  const gear = (gx: number, gyy: number, r: number, teeth: number, dir: number, col: string) => (
    <g transform={`rotate(${rot * dir} ${gx} ${gyy})`}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <rect key={i} x={gx - 9} y={gyy - r - 16} width={18} height={20}
            fill={col} stroke={C.ink} strokeWidth={4}
            transform={`rotate(${(a * 180) / Math.PI} ${gx} ${gyy})`} />
        );
      })}
      <circle cx={gx} cy={gyy} r={r} fill={col} stroke={C.ink} strokeWidth={6} />
      <circle cx={gx} cy={gyy} r={r * 0.34} fill={C.washi} stroke={C.ink} strokeWidth={5} />
      <line x1={gx} y1={gyy - r * 0.8} x2={gx} y2={gyy - r * 0.34}
        stroke={C.ink} strokeWidth={4} opacity={0.5} />
    </g>
  );
  return (
    <g>
      {/* 土台 */}
      <rect x={cx - 400} y={gy - 54} width={800} height={54} fill={C.woodDark}
        stroke={C.ink} strokeWidth={6} />
      <rect x={cx - 400} y={gy - 54} width={800} height={14} fill={C.wood} opacity={0.7} />
      {/* 数直線のレール */}
      <rect x={cx - 330} y={gy - 118} width={660} height={26} fill={C.iron}
        stroke={C.ink} strokeWidth={6} />
      {/* 目盛り板の台座 (1〜5 ぶんのねじ穴。板が無い番号は穴だけ残る = 未完成の合図) */}
      {[1, 2, 3, 4, 5].map((n) => {
        const px = slotX(n);
        const on = plates.includes(n);
        return (
          <g key={`slot${n}`}>
            {on ? (
              <line x1={px} y1={gy - 118} x2={px} y2={gy - 150}
                stroke={C.ink} strokeWidth={5} />
            ) : (
              <g>
                {/* 空のねじ穴 + 折れた支柱の根元 */}
                <circle cx={px} cy={gy - 105} r={11} fill={C.ironDark}
                  stroke={C.ink} strokeWidth={4} />
                <circle cx={px} cy={gy - 105} r={4} fill={C.ink} opacity={0.6} />
                <line x1={px} y1={gy - 118} x2={px} y2={gy - 128}
                  stroke={C.ink} strokeWidth={5} opacity={0.5} />
              </g>
            )}
          </g>
        );
      })}
      {/* 立っている目盛り板 */}
      {plates.map((n) => {
        const px = slotX(n);
        return (
          <g key={`plate${n}`}>
            <rect x={px - 32} y={gy - 212} width={64} height={62} fill={C.washi}
              stroke={C.ink} strokeWidth={5} />
            <text x={px} y={gy - 166} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={42} fill={C.ink}>{n}</text>
          </g>
        );
      })}
      {/* まだ何も書かれていない新しい板 (はまりかけなので少し傾ける) */}
      {blankPlate !== null && (
        <g transform={`rotate(-9 ${slotX(blankPlate)} ${gy - 140})`}>
          <rect x={slotX(blankPlate) - 32} y={gy - 200} width={64} height={62}
            fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {/* まっさら = 鉛筆の下書き線だけ */}
          <line x1={slotX(blankPlate) - 18} y1={gy - 176} x2={slotX(blankPlate) + 18} y2={gy - 176}
            stroke={C.ink} strokeWidth={3} opacity={0.3} />
          <line x1={slotX(blankPlate) - 18} y1={gy - 158} x2={slotX(blankPlate) + 18} y2={gy - 158}
            stroke={C.ink} strokeWidth={3} opacity={0.3} />
        </g>
      )}
      {/* 支柱 */}
      <rect x={cx - 24} y={gy - 300} width={48} height={190} fill={C.ironDark}
        stroke={C.ink} strokeWidth={6} />
      {/* 歯車 (gears の数だけ軸に付いている。外した歯車は呼ぶ側で置く) */}
      {gears >= 1 && gear(cx - 170, gy - 300, 78, 14, 1, C.brassLike)}
      {gears >= 2 && gear(cx + 10, gy - 334, 54, 11, -1, C.iron)}
      {gears >= 3 && gear(cx + 162, gy - 282, 44, 10, 1, C.brassLike)}
      {/* 歯車が欠けている場所は空の軸受けを見せる (組み途中だと分かるように) */}
      {gears < 2 && (
        <g>
          <circle cx={cx + 10} cy={gy - 334} r={17} fill={C.ironDark}
            stroke={C.ink} strokeWidth={5} />
          <circle cx={cx + 10} cy={gy - 334} r={5} fill={C.ink} opacity={0.6} />
        </g>
      )}
      {/* ねじ。tight=締まりきり / half=頭が浮いて影が出る / turning=回っている */}
      <g transform={`rotate(${screw === "turning" ? rot * 2 : 0} ${cx - 300} ${gy - 240})`}>
        {screw === "half" && (
          <ellipse cx={cx - 300} cy={gy - 222} rx={28} ry={10}
            fill={C.ink} opacity={0.22} />
        )}
        <circle cx={cx - 300} cy={gy - 240 - (screw === "half" ? 14 : 0)} r={26} fill={C.iron}
          stroke={C.ink} strokeWidth={6} />
        <line
          x1={cx - 318} y1={gy - 240 - (screw === "half" ? 14 : 0)}
          x2={cx - 282} y2={gy - 240 - (screw === "half" ? 14 : 0)}
          stroke={C.ink} strokeWidth={6} />
        {screw === "half" && (
          /* 浮いた分の軸が見える = まだ締まっていない */
          <rect x={cx - 306} y={gy - 240} width={12} height={16}
            fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        )}
      </g>
    </g>
  );
};

// ★2026-11-08 削除: YametaBoard (コルクの掲示板の紙を phase で差し替える部品)。
//   #212 #213 #214 の3枚がこの1部品を使い回していたため、作者の指摘どおり
//   「同じ背景・同じ色使いで同じことを淡々と続ける」絵になっていた。
//   からくり憲法 第13条「1文1演出の法」= 同じ背景で道具だけ差し替える作りは禁止。
//   3枚はそれぞれ別の舞台 (冬のカレッジ中庭 / 2002年の教室 / 江戸の境内) に描き直した。

// 育つ土俵マップ (序#15・第2章#47 と同じ意匠の二重縁の同心円)
const RING_COL = ["#B9674A", "#C9A84C", "#6E8F5A", "#4A7A96", "#8E7AA8", "#C07A96", "#4E8E8E"];
const RING_LABEL = ["戦場ひとつ", "帝国", "町", "国", "世界", "同学年", "地球全員"];
const DohyoRings: React.FC<{
  f: number; n: number; cx?: number; cy?: number; step?: number; r0?: number;
  grow?: boolean; sx?: number;
}> = ({ f, n, cx = 760, cy = 500, step = 62, r0 = 72, grow = true, sx = 1 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${sx} 1) translate(${-cx} ${-cy})`}>
    {/* 外から内へ描く (内側が前に来る) */}
    {Array.from({ length: n }).map((_, idx) => {
      const i = n - 1 - idx;
      const r = r0 + i * step;
      const t = grow ? clamp01(seg(f, 3 + i * 3, 17 + i * 3)) : 1;
      const rr = r * easeOut(t);
      return (
        <g key={i} opacity={t}>
          {/* 二重縁 */}
          <circle cx={cx} cy={cy} r={rr} fill={RING_COL[i]} opacity={0.1} />
          <circle cx={cx} cy={cy} r={rr} fill="none"
            stroke={RING_COL[i]} strokeWidth={9} />
          <circle cx={cx} cy={cy} r={rr - 13} fill="none"
            stroke={RING_COL[i]} strokeWidth={4} opacity={0.6} />
        </g>
      );
    })}
    {/* 最外の輪に地球の点々 */}
    {n >= 7 && Array.from({ length: 26 }).map((_, i) => {
      const a = (i / 26) * Math.PI * 2;
      const r = r0 + 6 * step;
      const t = clamp01(seg(f, 26, 40));
      return (
        <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r}
          r={7} fill={RING_COL[6]} opacity={t * 0.85} />
      );
    })}
    {/* 中心の小さな人 */}
    <g opacity={clamp01(seg(f, 2, 12))}>
      <circle cx={cx} cy={cy - 20} r={17} fill={KRP.white}
        stroke={C.ink} strokeWidth={5} />
      <circle cx={cx - 6} cy={cy - 23} r={2.6} fill={C.ink} />
      <circle cx={cx + 6} cy={cy - 23} r={2.6} fill={C.ink} />
      <path d={`M ${cx - 15} ${cy + 26} q 15 -28 30 0 z`}
        fill={C.terracotta} stroke={C.ink} strokeWidth={5} />
    </g>
  </g>
);

// 実物の木の輪っか
const WoodRing: React.FC<{
  cx: number; cy: number; r: number; tiltY?: number; broken?: boolean; rot?: number;
}> = ({ cx, cy, r, tiltY = 1, broken = false, rot = 0 }) => {
  const th = r * 0.19;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {broken ? (
        <g>
          {/* 割れた輪: 2つの弧 */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r * tiltY} 0 0 1 ${cx + r * 0.3} ${cy - r * tiltY * 0.95}`}
            fill="none" stroke={C.wood} strokeWidth={th} strokeLinecap="round" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r * tiltY} 0 0 1 ${cx + r * 0.3} ${cy - r * tiltY * 0.95}`}
            fill="none" stroke={C.ink} strokeWidth={th + 10} strokeLinecap="round" opacity={0.0} />
          <path d={`M ${cx + r * 0.62} ${cy + r * tiltY * 0.78} A ${r} ${r * tiltY} 0 0 1 ${cx - r * 0.5} ${cy + r * tiltY * 0.86}`}
            fill="none" stroke={C.wood} strokeWidth={th} strokeLinecap="round" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r * tiltY} 0 0 1 ${cx + r * 0.3} ${cy - r * tiltY * 0.95}`}
            fill="none" stroke={C.woodDark} strokeWidth={th * 0.3} opacity={0.5} />
        </g>
      ) : (
        <g>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * tiltY}
            fill="none" stroke={C.ink} strokeWidth={th + 12} />
          <ellipse cx={cx} cy={cy} rx={r} ry={r * tiltY}
            fill="none" stroke={C.wood} strokeWidth={th} />
          <ellipse cx={cx} cy={cy} rx={r - th * 0.34} ry={(r - th * 0.34) * tiltY}
            fill="none" stroke={C.woodDark} strokeWidth={th * 0.22} opacity={0.55} />
          {/* 木目 */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + 0.4;
            return (
              <line key={i}
                x1={cx + Math.cos(a) * (r - th * 0.42)} y1={cy + Math.sin(a) * (r - th * 0.42) * tiltY}
                x2={cx + Math.cos(a) * (r + th * 0.42)} y2={cy + Math.sin(a) * (r + th * 0.42) * tiltY}
                stroke={C.woodDark} strokeWidth={4} opacity={0.4} />
            );
          })}
        </g>
      )}
    </g>
  );
};

// 勝ちたい気持ちの炎
const FlameIcon: React.FC<{ cx: number; cy: number; s?: number; f: number }> = ({
  cx, cy, s = 1, f,
}) => {
  const w = 1 + Math.sin(f / 6) * 0.07;
  const sway = Math.sin(f / 9) * 4;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s * w} ${s}) rotate(${sway})`}>
      {/* 外炎 */}
      <path d="M 0 -108 C 46 -62 60 -24 58 6 C 56 50 30 76 0 76 C -30 76 -56 50 -58 6 C -60 -24 -46 -62 0 -108 Z"
        fill={C.flame} stroke={C.ink} strokeWidth={7} />
      {/* 内炎 */}
      <path d="M 0 -56 C 26 -28 32 -8 31 10 C 30 38 17 54 0 54 C -17 54 -30 38 -31 10 C -32 -8 -26 -28 0 -56 Z"
        fill={C.flameIn} stroke={C.ink} strokeWidth={5} />
      {/* 火の粉 */}
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 14) % 42) / 42;
        return (
          <circle key={i} cx={-24 + i * 24} cy={-110 - t * 70}
            r={6 - i} fill={C.flame} opacity={(1 - t) * 0.9} />
        );
      })}
    </g>
  );
};

// ★2026-11-08 削除: DawnSky (夜明けの丘の背景部品)。
//   この部品を使っていたのは #218 と #219 の二枚だけで、その二枚が結びの連続した
//   二文なのに同じ空・同じ丘・同じ朝日を繰り返していた
//   (からくり憲法 第13条 1文1演出の法 = 同じ背景で道具だけ差し替える作りは禁止)。
//   #218 は薄明の畦道、#219 は真昼のすすき野にそれぞれ描き直したので、
//   この背景部品は使い手がいなくなった。

// ------------------------------------------------------------------
// #200 結びです。最後に、この動画の隠れた主人公の話をさせてください。
// 格: 並
// ------------------------------------------------------------------
const S200: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp01(seg(f, 10, 34));
  return (
    <Frame f={f} seed={1099} bg={KRP.cream}>
      {/* 暗い会場 + 手前の床だけを照らすスポット */}
      <VenueStage f={f} beams={[[700, 1010]]} floorY={960} dim={0.4} />
      <CurtainTop f={f} h={170} />
      {/* 脇幕 (左右) */}
      <g>
        <path d={`M0,160 Q130,420 70,960 L0,960 Z`} fill={C.curtain}
          stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
        <path d={`M1920,160 Q1790,420 1850,960 L1920,960 Z`} fill={C.curtain}
          stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
      </g>
      {/* 誰も乗らない表彰台 */}
      <g opacity={0.82}>
        <Podium cx={1230} gy={940} lift={0.9} />
      </g>
      {/* 緞帳の陰に立つ人影 (1つだけ・正体は見せない) */}
      <g opacity={t}>
        <ellipse cx={420} cy={956} rx={120} ry={26} fill="#161A26" opacity={0.4} />
        <path d="M420,520 q-34,8 -44,56 l-20,210 q-6,34 16,36 l10,0 l10,124 l56,0 l10,-124 l10,0 q22,-2 16,-36 l-20,-210 q-10,-48 -44,-56 Z"
          fill="#1E2432" stroke="#11151F" strokeWidth={5} />
        <circle cx={420} cy={486} r={52} fill="#1E2432" stroke="#11151F" strokeWidth={5} />
        <path d="M368,476 q52,-44 104,0 q-8,-54 -52,-54 q-44,0 -52,54 Z" fill="#11151F" />
        {/* 肩から下がる腕 */}
        <path d="M376,566 q-24,70 -16,154" fill="none" stroke="#11151F" strokeWidth={6} opacity={0.6} />
        <path d="M464,566 q24,70 16,154" fill="none" stroke="#11151F" strokeWidth={6} opacity={0.6} />
      </g>
      {/* 影のふち光 */}
      <g opacity={0.3}>
        <path d="M470,524 q26,34 26,120" fill="none" stroke="#F7EFD0" strokeWidth={7} />
      </g>
      <QMark x={660} y={430} s={1.2} f={f} t={seg(f, 20, 34)} />
      <TagPlate x={1180} y={420} text="かくれた しゅじんこう" size={40} t={seg(f, 4, 18)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #201 オリンピックの表彰台で、メダリストたちの表情を分析した研究があります。
// 格: 並
// ------------------------------------------------------------------
const S201: React.FC<{ f: number }> = ({ f }) => {
  const panels: Array<[number, string, string, "smile" | "sad" | "joy"]> = [
    [560, C.gold, "1", "smile"],
    [960, C.silver, "2", "sad"],
    [1360, C.bronze, "3", "joy"],
  ];
  return (
    <Frame f={f} seed={1100} bg={KRP.cream}>
      <VenueStage f={f} beams={[[960, 980]]} floorY={930} dim={0.1} />
      <CurtainTop f={f} h={150} />
      {/* 脇幕 */}
      <path d="M0,140 Q120,400 64,930 L0,930 Z" fill={C.curtain}
        stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      <path d="M1920,140 Q1800,400 1856,930 L1920,930 Z" fill={C.curtain}
        stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {/* 3枚の白縁の写真パネル */}
      {panels.map(([pxx, col, n, fc], i) => {
        const ring = clamp01(seg(f, 8 + i * 8, 22 + i * 8));
        return (
          <g key={i}>
            <rect x={pxx - 170} y={260} width={340} height={400} rx={4}
              fill={C.ink} opacity={0.18} transform="translate(12 14)" />
            <rect x={pxx - 170} y={260} width={340} height={400} rx={4}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <rect x={pxx - 142} y={288} width={284} height={310}
              fill={col} opacity={0.26} stroke={KRP.ink} strokeWidth={4} />
            {/* 表彰台の顔 */}
            <g>
              <circle cx={pxx} cy={416} r={74} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={6} />
              {/* 目 */}
              {fc === "sad" ? (
                <g>
                  <path d={`M${pxx - 40},${404} q14,12 28,0`} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                  <path d={`M${pxx + 12},${404} q14,12 28,0`} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                  <path d={`M${pxx - 22},${462} q22,-16 44,0`} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                </g>
              ) : (
                <g>
                  <path d={`M${pxx - 40},${410} q14,-14 28,0`} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                  <path d={`M${pxx + 12},${410} q14,-14 28,0`} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                  <path d={`M${pxx - 26},${448} q26,${fc === "joy" ? 34 : 22} 52,0`} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                </g>
              )}
            </g>
            {/* メダルの帯 */}
            <path d={`M${pxx - 34},${498} L${pxx},${540} L${pxx + 34},${498}`} fill="none"
              stroke={col} strokeWidth={14} />
            <circle cx={pxx} cy={562} r={28} fill={col} stroke={KRP.ink} strokeWidth={5} />
            <text x={pxx} y={578} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={32} fill={C.ink}>{n}</text>
            {/* 順に付く丸い囲み */}
            <circle cx={pxx} cy={416} r={96} fill="none" stroke={C.red}
              strokeWidth={7} strokeDasharray="18 13" opacity={ring * 0.85} />
          </g>
        );
      })}
      {/* 虫眼鏡を向ける研究者 */}
      <Person x={240} y={1016} s={1.1} pose="point" pointDir={1}
        face="normal" cloth="#8FA8C0" glasses f={f} />
      <g transform={`translate(${452} ${660}) rotate(-24)`}>
        <circle cx={0} cy={0} r={74} fill="#DCEAF2" opacity={0.45}
          stroke={KRP.ink} strokeWidth={8} />
        <circle cx={-22} cy={-22} r={22} fill={KRP.white} opacity={0.5} />
        <rect x={-16} y={70} width={32} height={110} rx={12}
          fill="#7A5A38" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <TagPlate x={960} y={776} text="ひょうじょうを しらべた" size={44} t={seg(f, 4, 18)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #202 1995年の研究で、のちの追試でも2回、同じ結果が確認されました。
// 格: 図
// ------------------------------------------------------------------
const S202: React.FC<{ f: number }> = ({ f }) => {
  const cards: Array<[number, number, number, string]> = [
    [470, 200, -7, "1995"],
    [810, 236, -2, "ついし 1"],
    [1160, 214, 5, "ついし 2"],
  ];
  return (
    <Frame f={f} seed={1101} bg={KRP.cream}>
      <DeskBack f={f} id="s202" px={300} py={120} pw={1320} ph={620} bunchin fude={false} />
      {/* 研究カード 3枚 (ずらして重なる) */}
      {cards.map(([cx0, cy0, rot, label], i) => {
        const st = clamp01(seg(f, 12 + i * 8, 24 + i * 8));
        return (
          <g key={i} transform={`translate(${cx0} ${cy0}) rotate(${rot})`}>
            <rect x={10} y={12} width={340} height={420} rx={5}
              fill={C.ink} opacity={0.16} />
            <rect x={0} y={0} width={340} height={420} rx={5}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {/* 見出しの帯 */}
            <rect x={0} y={0} width={340} height={78} fill={C.blueSoftLike} opacity={0.7} />
            <line x1={0} y1={78} x2={340} y2={78} stroke={KRP.ink} strokeWidth={5} />
            <text x={170} y={56} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={44} fill={C.ink}>{label}</text>
            {/* 本文の行 */}
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <rect key={k} x={30} y={112 + k * 42} width={280 - ((k * 61) % 120)} height={18}
                fill={C.stoneDark} opacity={0.3} />
            ))}
            {/* 小さな表彰台の挿絵 */}
            <g opacity={0.6}>
              <rect x={102} y={352} width={44} height={36} fill={C.silver}
                stroke={KRP.ink} strokeWidth={4} />
              <rect x={148} y={330} width={44} height={58} fill={C.gold}
                stroke={KRP.ink} strokeWidth={4} />
              <rect x={194} y={364} width={44} height={24} fill={C.bronze}
                stroke={KRP.ink} strokeWidth={4} />
            </g>
            {/* ✓ の判子 */}
            <g opacity={st} transform={`translate(258 330) rotate(-12) scale(${pop(st)})`}>
              <circle cx={0} cy={0} r={52} fill="none" stroke={C.red} strokeWidth={8} opacity={0.9} />
              <path d="M-26,2 L-6,26 L30,-24" fill="none" stroke={C.red}
                strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        );
      })}
      {/* 机の小物: 眼鏡・鉛筆・紙の束 */}
      <g transform="translate(160 880) rotate(-8)">
        <circle cx={-52} cy={0} r={38} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={52} cy={0} r={38} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <path d="M-14,-6 q14,-12 28,0" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <path d="M-90,-10 q-32,-6 -48,16" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <path d="M90,-10 q32,-6 48,16" fill="none" stroke={KRP.ink} strokeWidth={6} />
      </g>
      <g transform="translate(1700 870) rotate(72)">
        <rect x={-150} y={-13} width={250} height={26} fill={C.riceGold}
          stroke={KRP.ink} strokeWidth={5} />
        <path d="M100,-13 L148,0 L100,13 Z" fill="#E8D8C0" stroke={KRP.ink} strokeWidth={4} />
        <path d="M134,-4 L148,0 L134,4 Z" fill={C.ink} />
      </g>
      <g transform="translate(1540 962)">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-130 + i * 5} y={-i * 11} width={260} height={16} rx={3}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      <TagPlate x={740} y={786} text="どれも おなじ けっか" size={36} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #203 幸せそうに見えるのは、銀メダリストではなく、銅メダリストのほうだったのです。
// 格: 山 ★全編の着地点のひとつ
// ------------------------------------------------------------------
const S203: React.FC<{ f: number }> = ({ f }) => {
  const GY = 840;            // 表彰台の接地線 (寄せたとき台の番号が沈みすぎないよう #209 より高く置く)
  const LIFT = 0.9;
  // 銅メダリストへ寄っていくカメラ。銀と銅の顔の中間を掴んで、
  // 1.0倍 → 1.42倍。寄りきったとき顔の半径が約114pxになるので、表情の差が読める。
  const t = easeOut(clamp01(seg(f, 2, 40)));
  const z = lerp(1, 1.42, t);
  const PX = 1060, PY = 388;    // 掴む点 (銀と銅の顔の中間)
  const qx = lerp(PX, 960, t);  // 寄りきった先で画面のどこに置くか
  const qy = lerp(PY, 510, t);
  // 3人の立ち位置 (表彰台の段の天板にそのまま立たせる)
  const YS = GY - 220 * LIFT;   // 銀 = 2段目
  const YG = GY - 330 * LIFT;   // 金 = 1段目
  const YB = GY - 150 * LIFT;   // 銅 = 3段目
  // 首から下げたメダル (リボンのV字 + 円盤)
  const medal = (mx: number, fy: number, col: string, n: string) => (
    <g>
      <path d={`M${mx - 32},${fy - 205} L${mx},${fy - 160} L${mx + 32},${fy - 205}`}
        fill="none" stroke={col} strokeWidth={14} />
      <circle cx={mx} cy={fy - 133} r={31} fill={col} stroke={KRP.ink} strokeWidth={6} />
      <text x={mx} y={fy - 121} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={34} fill={C.ink}>{n}</text>
    </g>
  );
  // 頭の上の幸せ度アイコン。寄りの中に置くので、ズームすると一緒に大きくなる。
  // ★画面左上 (x60..370 / y54..118) はバッジ「順位のからくり」の定位置なので、
  //   札も凡例もそこへは置かない。
  const face = (hx: number, hy: number, kind: "smile" | "sad" | "joy", tt: number) => (
    <g opacity={tt} transform={`translate(${hx} ${hy}) scale(${pop(tt)})`}>
      <ellipse cx={0} cy={8} rx={46} ry={12} fill={KRP.ink} opacity={0.14} />
      <circle cx={0} cy={0} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {kind === "sad" ? (
        <g>
          <path d="M-24,-10 q9,9 18,0" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d="M6,-10 q9,9 18,0" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d="M-14,24 q14,-11 28,0" fill="none" stroke={KRP.ink} strokeWidth={5} />
        </g>
      ) : (
        <g>
          <path d="M-24,-6 q9,-10 18,0" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d="M6,-6 q9,-10 18,0" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d={`M-17,12 q17,${kind === "joy" ? 24 : 15} 34,0`} fill="none"
            stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
    </g>
  );
  return (
    <Frame f={f} seed={1102} bg={KRP.cream}>
      <g transform={camTo(z, PX, PY, qx, qy)}>
        <DuskStadium f={f} id="203" horizon={430} />
        {/* 照明が表彰台のまわりに落とす光だまり */}
        <ellipse cx={1060} cy={GY + 10} rx={660} ry={120} fill={`url(#dpool203)`} />
        {/* 表彰台の落ち影 (夕方なので長く横に伸ばす) */}
        <ellipse cx={1180} cy={GY + 18} rx={520} ry={40} fill="#2A3A28" opacity={0.35} />
        <Podium cx={1060} gy={GY} lift={LIFT} />
        {/* 銀 (左・うつむく。切なさで描く。笑い者にする記号は付けない) */}
        <Person x={660} y={YS} s={1.25} pose="stand" face="sad"
          cloth="#8FA8C0" clothDark="#6E8296" lean={0} gaze={[0, 7]} f={f} />
        {medal(660, YS, C.silver, "2")}
        {/* 金 (中央・腕を上げる) */}
        <Person x={1060} y={YG} s={1.25} pose="raise" face="smile"
          cloth={C.gold} clothDark="#A8822C" f={f} />
        {medal(1060, YG, C.gold, "1")}
        {/* 銅 (右・ズームの着地点。素直によろこぶ) */}
        <Person x={1460} y={YB} s={1.25} pose="banzai" face="joy"
          cloth={C.bronze} clothDark="#8A5A36" f={f} />
        {medal(1460, YB, C.bronze, "3")}
        {/* 銅だけに差す追い光 (どこへ寄っているかを光でも示す) */}
        <g opacity={0.3 + 0.07 * Math.abs(Math.sin(f / 13))}>
          <polygon points={`1720,-220 1900,-220 1560,${YB + 20} 1360,${YB + 20}`} fill="#FFF3C4" />
        </g>
        {/* 花束を抱えた係の人 (表彰式の空気。小さく後景に) */}
        <PersonMini x={290} y={GY + 20} s={0.82} color="#6E8F5A" f={f} face="smile" arms="up" />
        <PersonMini x={1830} y={GY + 30} s={0.78} color="#B9674A" f={f} face="dot" arms="down" />

        {/* 頭の上の幸せ度。金 → 銀 → 銅 の順に出して、最後に銅だけ丸で囲む */}
        {face(1060, YG - 285 - 150, "smile", clamp01(seg(f, 10, 22)))}
        {face(660, YS - 285 - 150, "sad", clamp01(seg(f, 16, 28)))}
        {face(1460, YB - 285 - 150, "joy", clamp01(seg(f, 22, 34)))}
        {/* ★この1枚の事件: いちばん下の段の銅が、いちばん良い顔をしている */}
        <g opacity={clamp01(seg(f, 28, 42))}>
          <ellipse cx={1460} cy={YB - 435} rx={68} ry={64} fill="none"
            stroke={C.terracotta} strokeWidth={8} />
        </g>
      </g>
      <TagPlate x={560} y={120} text="しあわせ度" size={36} t={seg(f, 8, 20)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #204 2位は「あと一歩で金だったのに」と、ありえた自分と比べてしまう。
// 格: 図
// ------------------------------------------------------------------
const S204: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1103} bg={KRP.cream}>
    <KurabeZu f={f} phase={1} />
    <TagPlate x={960} y={786} text="ありえた じぶん" size={40} t={seg(f, 22, 36)} />
  </Frame>
);

// ------------------------------------------------------------------
// #205 3位は「危うく表彰台を逃すところだった」と、ほっとしている。
// 格: 図
// ------------------------------------------------------------------
const S205: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1104} bg={KRP.cream}>
    <KurabeZu f={f} phase={2} />
    <TagPlate x={960} y={786} text="ひょうしょうだいの そと" size={36} t={seg(f, 22, 36)} />
  </Frame>
);

// ------------------------------------------------------------------
// #206 順位そのものではなく、何と比べるかが、気持ちを決めていました。
// 格: 図
// ------------------------------------------------------------------
const S206: React.FC<{ f: number }> = ({ f }) => {
  const CH = "#F2EFE4";
  // チョークで描いた「2位」の人形 (dir: -1=上を見て沈む / +1=下を見てほどける)
  const chalkFig = (bx: number, by: number, dir: -1 | 1, t: number) => (
    <g opacity={t} stroke={CH} strokeWidth={7} fill="none" strokeLinecap="round">
      {/* 台 */}
      <rect x={bx - 96} y={by} width={192} height={96} />
      <text x={bx} y={by + 70} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={60} fill={CH} stroke="none">2</text>
      {/* 人形 */}
      <circle cx={bx} cy={by - 118} r={44} />
      <line x1={bx} y1={by - 74} x2={bx} y2={by - 12} />
      <line x1={bx} y1={by - 56} x2={bx - 54} y2={dir < 0 ? by - 20 : by - 86} />
      <line x1={bx} y1={by - 56} x2={bx + 54} y2={dir < 0 ? by - 20 : by - 86} />
      {/* 顔 */}
      {dir < 0 ? (
        <g>
          <path d={`M${bx - 24},${by - 130} q9,9 18,0`} />
          <path d={`M${bx + 6},${by - 130} q9,9 18,0`} />
          <path d={`M${bx - 16},${by - 94} q16,-13 32,0`} />
        </g>
      ) : (
        <g>
          <path d={`M${bx - 24},${by - 126} q9,-10 18,0`} />
          <path d={`M${bx + 6},${by - 126} q9,-10 18,0`} />
          <path d={`M${bx - 18},${by - 104} q18,22 36,0`} />
        </g>
      )}
      {/* 比べる先の矢印 */}
      <g stroke={dir < 0 ? "#E8928A" : "#A8D0A0"} strokeWidth={11}>
        <line x1={bx + 104} y1={by - 110} x2={bx + 104} y2={by - 110 + dir * 150} />
        <path d={dir < 0
          ? `M${bx + 76},${by - 240} L${bx + 104},${by - 278} L${bx + 132},${by - 240}`
          : `M${bx + 76},${by + 2} L${bx + 104},${by + 40} L${bx + 132},${by + 2}`}
          fill="none" />
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={1105} bg={KRP.cream}>
      {/* 教室の壁 */}
      <rect x={0} y={0} width={W} height={H} fill="#DED4BC" />
      <g stroke="#BCAF92" strokeWidth={4} opacity={0.4}>
        <line x1={0} y1={100} x2={W} y2={100} />
        <line x1={0} y1={900} x2={W} y2={900} />
      </g>
      <rect x={0} y={900} width={W} height={34} fill={C.woodDark} opacity={0.5} />
      {/* 黒板 */}
      <rect x={96} y={76} width={1730} height={700} rx={6}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
      <rect x={120} y={100} width={1682} height={652}
        fill="#3C5248" stroke={KRP.ink} strokeWidth={5} />
      {/* 黒板の拭き跡 */}
      <g opacity={0.1} fill={CH}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={300 + i * 420} cy={180 + ((i * 97) % 440)} rx={210} ry={66} />
        ))}
      </g>
      {/* チョーク受け */}
      <rect x={96} y={776} width={1730} height={34} rx={6}
        fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={300} y={762} width={110} height={18} rx={8}
        fill={CH} stroke={KRP.ink} strokeWidth={4} />
      <rect x={430} y={764} width={80} height={16} rx={8}
        fill="#E8928A" stroke={KRP.ink} strokeWidth={4} />
      {/* 黒板消し */}
      <g transform="translate(1600 756)">
        <rect x={-72} y={-16} width={144} height={34} rx={5}
          fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-72} y={4} width={144} height={16} rx={4}
          fill="#E2DCCC" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 2つの「2位」 */}
      {chalkFig(520, 620, -1, clamp01(seg(f, 6, 20)))}
      {chalkFig(1140, 620, 1, clamp01(seg(f, 16, 30)))}
      {/* 中央の仕切り */}
      <line x1={848} y1={190} x2={848} y2={720} stroke={CH} strokeWidth={5}
        strokeDasharray="20 16" opacity={0.45} />
      {/* 板書の見出し 2枚 */}
      <TagPlate x={420} y={200} text="じゅんい ×" size={44} t={seg(f, 24, 38)} />
      <TagPlate x={1310} y={200} text="くらべる先 ○" size={44} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #207 思い出してください。古代オリンピックに、2位の記録はありませんでした。
// 格: 山 ★序#3 の呼び戻し
// ------------------------------------------------------------------
const S207: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(clamp01(seg(f, 4, 30)));
  return (
    <Frame f={f} seed={1106} bg={KRP.cream}
      over={<div style={{ position: "absolute", left: 0, top: 0, width: W, height: H,
        opacity: clamp01(seg(f, 30, 42)) }}>
        <Stamp x={786} y={430} text="0人" size={120} />
      </div>}>
      {/* 同じ会場・同じ壁 */}
      <rect x={0} y={0} width={W} height={H} fill={C.marble} />
      <g stroke={C.marbleDark} strokeWidth={4} opacity={0.4}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={0} y1={120 + i * 160} x2={W} y2={120 + i * 160} />
        ))}
      </g>
      {/* 同じ緞帳 */}
      <CurtainTop f={f} h={140} />
      {/* 壁のオリーブ飾り */}
      <g opacity={0.6}>
        <path d="M120,300 Q420,236 720,300" fill="none" stroke={C.laurelDark} strokeWidth={8} />
        <path d="M1200,300 Q1500,236 1800,300" fill="none" stroke={C.laurelDark} strokeWidth={8} />
        {Array.from({ length: 22 }, (_, i) => {
          const side = i < 11 ? 0 : 1;
          const k = i % 11;
          const ox = (side ? 1200 : 120) + k * 60;
          const oy = 300 - Math.sin((k / 10) * Math.PI) * 58;
          return (
            <ellipse key={i} cx={ox} cy={oy - 16} rx={22} ry={11}
              fill={C.laurel} stroke={KRP.ink} strokeWidth={3.5}
              transform={`rotate(${-34 + k * 7} ${ox} ${oy - 16})`} />
          );
        })}
      </g>
      {/* 同じ柱 */}
      <GreekColumn x={170} y={1010} h={720} w={140} />
      <GreekColumn x={1750} y={1010} h={720} w={140} />
      <GreekColumn x={400} y={980} h={640} w={104} opacity={0.5} />
      <GreekColumn x={1520} y={980} h={640} w={104} opacity={0.5} />
      {/* 床 */}
      <rect x={0} y={1010} width={W} height={H - 1010} fill={C.marbleDark} opacity={0.7} />
      <line x1={0} y1={1010} x2={W} y2={1010} stroke={KRP.ink} strokeWidth={6} />
      {/* まっさらの石碑が大きくせり上がる */}
      <g transform={`translate(0 ${(1 - rise) * 260})`}>
        <Sekihi x={960} y={1004} w={760} h={830} f={f} />
      </g>
      {/* 手前の観客シルエット (同じ意匠) */}
      <g>
        {([[150, 1.35], [330, 1.15], [1610, 1.3], [1790, 1.1]] as Array<[number, number]>)
          .map(([sx, ss], i) => (
            <g key={i} opacity={0.55}>
              <path d={`M${sx},${1080} l0,${-150 * ss} q0,${-70 * ss} ${54 * ss},${-70 * ss} q${54 * ss},0 ${54 * ss},${70 * ss} l0,${150 * ss} Z`}
                fill={C.nightInk} />
              <circle cx={sx + 54 * ss} cy={1080 - 236 * ss} r={46 * ss} fill={C.nightInk} />
            </g>
          ))}
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #208 2位は、わずか120年前に発明された、人類史でも新顔のポジションです。
// 格: 図
// ------------------------------------------------------------------
const S208: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 360;
  const X1 = 1560;
  const BY = 440;
  const BH = 86;
  const redW = 72; // 120年ぶんの赤帯
  const t = easeOut(clamp01(seg(f, 8, 30)));
  return (
    <Frame f={f} seed={1107} bg={KRP.cream}>
      <DeskBack f={f} id="s208" px={290} py={150} pw={1340} ph={560} bunchin fude />
      {/* 長い年表の帯 */}
      <rect x={X0} y={BY} width={X1 - X0} height={BH}
        fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
      {/* 帯の中の時代の区切り */}
      <g stroke={C.stoneDark} strokeWidth={4} opacity={0.5}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1={X0 + 120 + i * 140} y1={BY} x2={X0 + 120 + i * 140} y2={BY + BH} />
        ))}
      </g>
      {/* 右端のごく短い赤帯 */}
      <rect x={X1 - redW} y={BY} width={redW * t} height={BH}
        fill={C.red} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      {/* 両端のラベル */}
      <text x={X0} y={BY - 26} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={42} fill={C.ink}>大昔</text>
      <text x={X1} y={BY - 26} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={42} fill={C.ink}>いま</text>
      <line x1={X0} y1={BY - 14} x2={X0} y2={BY} stroke={KRP.ink} strokeWidth={5} />
      <line x1={X1} y1={BY - 14} x2={X1} y2={BY} stroke={KRP.ink} strokeWidth={5} />
      {/* 「2位」の札を赤帯の上に立てる */}
      <g opacity={t}>
        <line x1={X1 - redW} y1={BY} x2={X1 - redW} y2={BY - 108}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={X1 - redW - 78} y={BY - 186} width={156} height={82} rx={5}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={X1 - redW} y={BY - 126} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={52} fill={C.red}>2位</text>
      </g>
      {/* 120年の寸法線 */}
      <g opacity={clamp01(seg(f, 20, 34))}>
        <line x1={X1 - redW} y1={BY + BH + 20} x2={X1 - redW} y2={BY + BH + 100}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={X1} y1={BY + BH + 20} x2={X1} y2={BY + BH + 100}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={X1 - redW} y1={BY + BH + 62} x2={X1} y2={BY + BH + 62}
          stroke={C.red} strokeWidth={6} />
        {/* 両矢じり */}
        <path d={`M${X1 - redW + 20},${BY + BH + 52} L${X1 - redW},${BY + BH + 62} L${X1 - redW + 20},${BY + BH + 72} Z`}
          fill={C.red} />
        <path d={`M${X1 - 20},${BY + BH + 52} L${X1},${BY + BH + 62} L${X1 - 20},${BY + BH + 72} Z`}
          fill={C.red} />
        {/* 引き出し線 + 寸法の文字 */}
        <line x1={X1 - redW / 2} y1={BY + BH + 100} x2={X1 - 140} y2={BY + BH + 160}
          stroke={KRP.ink} strokeWidth={5} />
        <text x={X1 - 290} y={BY + BH + 180} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={50} fill={C.red}>120年</text>
      </g>
      {/* 灰色の長さを示す補助 */}
      <g opacity={0.5}>
        <line x1={X0} y1={BY + BH + 62} x2={X1 - redW - 40} y2={BY + BH + 62}
          stroke={C.stoneDark} strokeWidth={5} strokeDasharray="18 14" />
      </g>
      <TagPlate x={720} y={690} text="ほとんどが 2位なし" size={40} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #209 その新顔がいま、表彰台の上で、いちばん苦しそうにしています。
// 格: 山 ★この動画でいちばん切ない1枚
// ------------------------------------------------------------------
const S209: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.42 * easeOut(clamp01(seg(f, 2, 34)));
  const flash = (i: number) => (Math.sin((f + i * 11) / 5) > 0.5 ? 1 : 0);
  return (
    <Frame f={f} seed={1108} bg={KRP.cream}>
      <g transform={zoomAt(z, 700, 640)}>
        <Stadium f={f} horizon={400} />
        {/* フラッシュ */}
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={90 + i * 136} cy={300 + ((i * 61) % 68)}
            r={15 + flash(i) * 11} fill="#FFF8DC" opacity={flash(i) ? 0.95 : 0.1} />
        ))}
        {/* 金と銅は薄くなって後景へ引く */}
        <g opacity={0.3}>
          <Podium cx={1340} gy={880} lift={0.72} />
          <Person x={1340} y={880 - 238} s={0.92} pose="raise" face="smile"
            cloth="#D9A93E" clothDark="#A8822C" f={f} still />
          <Person x={1628} y={880 - 108} s={0.9} pose="banzai" face="joy"
            cloth="#A9744B" clothDark="#8A5A36" f={f} still />
        </g>
        {/* 2位だけ大きく */}
        <g>
          {/* 2位の台 */}
          <rect x={430} y={700} width={540} height={300}
            fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
          <rect x={430} y={700} width={540} height={300} fill={C.woodDark} opacity={0.2} />
          <g stroke={C.woodDark} strokeWidth={4} opacity={0.5}>
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M446,${756 + i * 64} Q700,${740 + i * 64} 954,${762 + i * 64}`}
                fill="none" />
            ))}
          </g>
          <rect x={410} y={670} width={580} height={36} rx={7}
            fill="#D3A96A" stroke={KRP.ink} strokeWidth={7} />
          <circle cx={700} cy={846} r={62} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
          <text x={700} y={872} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={78} fill={C.ink}>2</text>
          {/* 俯く2位 */}
          <Person x={700} y={670} s={1.55} pose="stand" face="sad"
            cloth="#8FA8C0" clothDark="#6E8296" gaze={[0, 7]} lean={0} f={f} />
          {/* 銀メダル */}
          <path d="M660,392 L700,448 L740,392" fill="none"
            stroke={C.silver} strokeWidth={16} />
          <circle cx={700} cy={478} r={36} fill={C.silver} stroke={KRP.ink} strokeWidth={6} />
          <text x={700} y={494} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={36} fill={C.ink}>2</text>
        </g>
        {/* フラッシュは当たっているのに顔は俯く */}
        <g opacity={0.3}>
          <polygon points="300,0 480,0 760,340 540,340" fill="#FFF8DC" />
          <polygon points="1060,0 1240,0 860,340 660,340" fill="#FFF8DC" />
        </g>
      </g>
      <TagPlate x={1440} y={176} text="120年前の しんがお" size={44} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #210 順位という発明品は、まだ調整の途中なのかもしれません。
// 格: 山 ★「夜の工房・光源は吊りランプ1灯・人は1人・手は止まっている」。
//     次の #211 (昼・3人・動く) と、地の色から構図から全部反対にする。
// ------------------------------------------------------------------
const S210: React.FC<{ f: number }> = ({ f }) => {
  // 静かに寄る。装置のねじのあたりを掴んで 1.0 → 1.16 倍。
  const t = easeOut(clamp01(seg(f, 2, 38)));
  const z = lerp(1, 1.16, t);
  const qx = lerp(900, 860, t);
  const qy = lerp(560, 540, t);
  const DY = 760;                       // 作業台の天板
  const lampSwing = Math.sin(f / 23) * 1.6;
  return (
    <Frame f={f} seed={1109} bg={KRP.cream}>
      <g transform={camTo(z, 900, 560, qx, qy)}>
        <defs>
          <radialGradient id="k210pool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.85} />
            <stop offset="60%" stopColor="#FFE9A8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#FFE9A8" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* ── 夜の板壁 (深い藍。昼の `Koubou` とは地の色から変える) ── */}
        <rect x={-220} y={-220} width={W + 440} height={H + 440} fill={C.nightInk} />
        <g stroke="#2A313D" strokeWidth={5} opacity={0.8}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`np${i}`} x1={-220} y1={-120 + i * 84} x2={W + 220} y2={-120 + i * 84} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`nv${i}`} x1={-60 + i * 430} y1={-220} x2={-60 + i * 430} y2={DY} />
          ))}
        </g>
        {/* 天井の梁 */}
        <rect x={-220} y={-60} width={W + 440} height={54} fill="#2A313D"
          stroke={KRP.ink} strokeWidth={5} />
        {/* ── 夜の窓と月 (外が夜だと一目で分かる) ── */}
        <g>
          <rect x={1006} y={74} width={242} height={186} fill="#1E2634"
            stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1086} cy={138} r={34} fill="#F2EBCE" opacity={0.9} />
          <circle cx={1102} cy={127} r={28} fill="#1E2634" />
          {([[1180, 110], [1210, 198], [1152, 222]] as Array<[number, number]>).map(([sx, sy], i) => (
            <circle key={`ws${i}`} cx={sx} cy={sy} r={4}
              fill={KRP.white} opacity={0.5 + 0.4 * Math.abs(Math.sin((f + i * 19) / 17))} />
          ))}
          <line x1={1127} y1={74} x2={1127} y2={260} stroke={KRP.ink} strokeWidth={5} />
          <line x1={1006} y1={167} x2={1248} y2={167} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ── 壁の設計図 (薄明かりの中、鉛筆の線だけ。まだ赤は入っていない) ── */}
        <g opacity={0.5}>
          <rect x={1300} y={110} width={420} height={240} fill={C.washi}
            stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <line key={`bg${i}`} x1={1300} y1={172 + i * 62} x2={1720} y2={172 + i * 62}
              stroke={C.stoneDark} strokeWidth={3} opacity={0.35} />
          ))}
          <circle cx={1400} cy={208} r={44} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
          <circle cx={1400} cy={208} r={17} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
          <line x1={1452} y1={208} x2={1690} y2={208} stroke={C.ink} strokeWidth={4} opacity={0.55} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`bt${i}`} x1={1470 + i * 54} y1={192} x2={1470 + i * 54} y2={224}
              stroke={C.ink} strokeWidth={3} opacity={0.45} />
          ))}
          <rect x={1340} y={276} width={340} height={56} fill="none" stroke={C.ink}
            strokeWidth={4} opacity={0.4} strokeDasharray="12 9" />
          <circle cx={1510} cy={102} r={10} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 左の壁に掛かった道具 (灯りの外なので影のまま) ──
            寄り (1.16倍) で画面左が切れるので、x=170 より右だけに掛ける。
            右は x=500 まで。そこから先は装置の大歯車 (cx-170=530) と重なるため置かない。 */}
        <g opacity={0.6}>
          <line x1={170} y1={430} x2={500} y2={430} stroke="#1E2634" strokeWidth={9} />
          <g transform="translate(226 436)">
            <path d="M0,0 L0,180 L26,180 L26,0 Z" fill="#1E2634" stroke={KRP.ink} strokeWidth={4} />
            <path d={"M26,20 " + Array.from({ length: 10 }, () => "l12,8 l-12,8").join(" ")}
              fill="none" stroke="#4A5260" strokeWidth={4} />
          </g>
          <path d="M326,436 L326,604 L448,604 L448,566 L364,566 L364,436 Z"
            fill="#1E2634" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 吊りランプ 1灯。この絵のただ一つの光源 ── */}
        <g transform={`rotate(${lampSwing} 700 -40)`}>
          <line x1={700} y1={-80} x2={700} y2={150} stroke="#1E2634" strokeWidth={7} />
          <path d="M604,180 L796,180 L748,122 L652,122 Z" fill={C.iron}
            stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={700} cy={182} rx={96} ry={16} fill="#FFE9A8" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={700} cy={206} r={26} fill="#FFF3C4" stroke={KRP.ink} strokeWidth={5} />
          {/* 光の円錐 */}
          <polygon points={`608,196 792,196 1104,${DY} 296,${DY}`} fill="#FFE9A8" opacity={0.17} />
          <polygon points={`638,196 762,196 936,${DY} 464,${DY}`} fill="#FFE9A8" opacity={0.13} />
        </g>
        {/* 天板に落ちた光だまり */}
        <ellipse cx={700} cy={DY} rx={420} ry={90} fill="url(#k210pool)" />
        {/* 光の中のほこり */}
        {Array.from({ length: 14 }, (_, i) => {
          const tt = ((f + i * 11) % 60) / 60;
          return (
            <circle key={`dm${i}`}
              cx={420 + ((i * 137) % 560) + Math.sin((f + i * 7) / 15) * 9}
              cy={240 + tt * 460} r={3 + (i % 2)}
              fill="#FFF3C4" opacity={(1 - tt) * 0.65} />
          );
        })}
        {/* ── 作業台 ── */}
        <rect x={-220} y={DY} width={1520} height={62} fill="#7C5B33"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={-220} y={DY} width={1520} height={16} fill="#9A7544" opacity={0.8} />
        <g stroke="#5E4426" strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`dw${i}`} x1={-180 + i * 170} y1={DY + 8} x2={-156 + i * 170} y2={DY + 56} />
          ))}
        </g>
        <rect x={-220} y={DY + 62} width={1520} height={22} fill="#4E3A20" opacity={0.8} />
        <rect x={300} y={DY + 84} width={54} height={196} fill="#5E4426"
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={1200} y={DY + 84} width={54} height={196} fill="#5E4426"
          stroke={KRP.ink} strokeWidth={5} />
        {/* ── 土間と木屑 ── */}
        <rect x={-220} y={980} width={W + 440} height={H - 980 + 320} fill="#2A2A2E" />
        <line x1={-220} y1={980} x2={W + 220} y2={980} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        {Array.from({ length: 14 }, (_, i) => {
          const kx = 60 + ((i * 211) % 1740);
          const ky = 996 + ((i * 97) % 64);
          return (
            <path key={`kz${i}`} d={`M${kx} ${ky} q 14 ${-9 - (i % 3) * 4} 28 0`}
              fill="none" stroke="#5E4426" strokeWidth={5}
              transform={`rotate(${Math.sin(i * 1.7) * 30} ${kx + 14} ${ky})`} opacity={0.8} />
          );
        })}

        {/* ── 主役: まだ組み上がっていない「順位」の装置 ──
            目盛り板は 1〜3 だけ。4 と 5 は空のねじ穴のまま。歯車は1枚、
            ねじの頭も浮いている = どこを見ても「作りかけ」。 */}
        <JuniSochi f={f} cx={700} gy={DY} plates={[1, 2, 3]} gears={1}
          spin={0.18} screw="half" />
        {/* 外した歯車が天板に寝ている */}
        <g transform="translate(1012 712) rotate(-14)">
          <ellipse cx={0} cy={16} rx={56} ry={16} fill={KRP.ink} opacity={0.3} />
          <circle cx={0} cy={0} r={46} fill={C.brassLike} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={`og${i}`} x={-8} y={-62} width={16} height={18}
              fill={C.brassLike} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(${i * 36})`} />
          ))}
          <circle cx={0} cy={0} r={16} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* まだ入れていない目盛り板「4」「5」が横に積んである */}
        {([[1120, "4", -7], [1196, "5", 6]] as Array<[number, string, number]>).map(([px, n, rr], i) => (
          <g key={`sp${i}`} transform={`translate(${px} ${DY - 34}) rotate(${rr})`}>
            <rect x={-30} y={-58} width={60} height={58} fill={C.washi}
              stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={-16} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={38} fill={C.ink}>{n}</text>
          </g>
        ))}
        {/* ノギス (すきまを測ったまま置かれている) */}
        <g transform="translate(372 726) rotate(5)">
          <rect x={-120} y={-9} width={240} height={18} rx={6}
            fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-116} y={-44} width={20} height={40} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          <rect x={14} y={-44} width={20} height={40} fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`nk${i}`} x1={-80 + i * 24} y1={-9} x2={-80 + i * 24} y2={-2} />
            ))}
          </g>
        </g>
        {/* レンチは置いたまま = まだ手をつけていない (#211 との決定的な差) */}
        <g transform={`translate(190 ${DY - 18}) rotate(-8)`}>
          <rect x={-104} y={-11} width={186} height={22} rx={9}
            fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M82,-22 q44,10 44,22 q0,12 -44,22 l0,-18 l-16,0 l0,-8 l16,0 Z"
            fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-118} y={-15} width={32} height={30} rx={8}
            fill={C.terracotta} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 湯呑み (夜なべの空気) */}
        <g transform={`translate(560 ${DY - 16})`}>
          <path d="M-26,-44 L-20,0 L20,0 L26,-44 Z" fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-44} rx={26} ry={8} fill="#8A6436" stroke={KRP.ink} strokeWidth={4} />
          <path d={`M-8,-62 q${6 + Math.sin(f / 11) * 4},-18 0,-34`}
            fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.4} />
        </g>

        {/* ── 人は1人。腕を組んで装置を見ている (手は動いていない) ── */}
        <Person x={1480} y={1010} s={1.5} pose="armsFolded" face="worried"
          cloth="#5E7C8E" clothDark="#42596A" gaze={[-8, 2]} f={f} still />
      </g>

      {/* 浮いたねじの頭を指す引き出し線。この1枚の事件は「まだ締まっていない」こと。
          札は画面に固定・ねじは寄るカメラの中なので、ねじの画面上の位置を
          カメラと同じ式で計算して先端を合わせる (ずれると歯車を指して見える)。 */}
      <g opacity={clamp01(seg(f, 16, 30))}>
        <path d={`M300 266 L300 ${qy + (520 - 560) * z - 56} L${qx + (400 - 900) * z} ${qy + (520 - 560) * z}`}
          fill="none" stroke={C.terracotta} strokeWidth={6} strokeDasharray="14 10" />
        <circle cx={qx + (400 - 900) * z} cy={qy + (520 - 560) * z} r={13}
          fill={C.terracotta} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={300} y={230} text="ねじは まだ半分" size={38} t={seg(f, 8, 22)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #211 そして実際、人類はもう、作り変えを始めています。
// 格: 山 ★#210 が「夜・1人・止まっている」なら、こちらは「昼・3人・動いている」。
//     地の色 (藍 → 生成り)・光 (ランプ1灯 → 開いた大扉の外光)・カメラ (寄る → 引く)・
//     流れ (静止 → 左から右へ) を全部ひっくり返して、同じ絵の連続に見えないようにする。
// ------------------------------------------------------------------
const S211: React.FC<{ f: number }> = ({ f }) => {
  // #210 は寄る、こちらは引く。1.12倍から等倍へ戻して作業の広がりを見せる。
  const t = easeOut(clamp01(seg(f, 0, 34)));
  const z = lerp(1.12, 1, t);
  const DY = 820;                   // 作業台の天板
  const bolt = f * 3.6;             // 回っているボルト
  const roll = (f % 90) / 90;       // 床を転がっていく外した歯車
  return (
    <Frame f={f} seed={1110} bg={KRP.cream}>
      <g transform={zoomAt(z, 1000, 560)}>
        <defs>
          <linearGradient id="k211sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFE4EE" />
            <stop offset="100%" stopColor="#EFF4E6" />
          </linearGradient>
        </defs>
        {/* ── 昼の漆喰壁 (明るい生成り。#210 の藍とは真逆) ── */}
        <rect x={-220} y={-220} width={W + 440} height={H + 440} fill="#EDE6D4" />
        <g stroke="#CFC4A8" strokeWidth={4} opacity={0.7}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`pw${i}`} x1={-220} y1={-40 + i * 128} x2={W + 220} y2={-40 + i * 128} />
          ))}
        </g>
        {/* 腰板 */}
        <rect x={-220} y={700} width={W + 440} height={126} fill={C.wood} opacity={0.5} />
        <line x1={-220} y1={700} x2={W + 220} y2={700} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
        {/* 天井の母屋 + 梁3本 */}
        <rect x={-220} y={-40} width={W + 440} height={46} fill={C.woodDark} opacity={0.85}
          stroke={KRP.ink} strokeWidth={5} />
        {[340, 1000, 1660].map((bx, i) => (
          <rect key={`bm${i}`} x={bx - 26} y={6} width={52} height={120}
            fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* ── 開いた大扉。外は昼の空と丘 (もう外とつながっている) ── */}
        <g>
          <rect x={104} y={150} width={470} height={790} fill="#8A6436"
            stroke={KRP.ink} strokeWidth={7} />
          <rect x={136} y={182} width={406} height={726} fill="url(#k211sky)"
            stroke={KRP.ink} strokeWidth={5} />
          <path d="M136,760 Q250,690 350,742 Q450,790 542,724 L542,908 L136,908 Z"
            fill="#8FAE68" stroke={KRP.ink} strokeWidth={4} />
          <g fill={KRP.white} opacity={0.85}>
            <ellipse cx={250} cy={300} rx={78} ry={30} />
            <ellipse cx={202} cy={318} rx={48} ry={21} />
            <ellipse cx={420} cy={252} rx={58} ry={23} />
          </g>
          {/* 遠くに浮く小さな輪 (#219 への伏線。目立たせない) */}
          <g fill="none" stroke={C.ink} strokeWidth={4} opacity={0.28}>
            <ellipse cx={330} cy={664} rx={42} ry={14} />
            <ellipse cx={462} cy={692} rx={30} ry={10} />
          </g>
          {/* 床に落ちる外光 */}
          <polygon points="150,940 560,940 820,1080 60,1080" fill="#FFF8DC" opacity={0.4} />
        </g>
        {/* ── 壁の道具かけ ── */}
        <g>
          <line x1={700} y1={168} x2={1140} y2={168} stroke={C.woodDark} strokeWidth={9} />
          <g transform="translate(748 174)">
            <rect x={-10} y={0} width={20} height={120} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-40} y={-6} width={80} height={46} rx={7} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <path d="M880,174 L880,322 L1002,322 L1002,288 L916,288 L916,174 Z"
            fill={C.brassLike} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
          <g transform="translate(1092 176)">
            <rect x={-12} y={0} width={24} height={150} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
            <path d={"M12,16 " + Array.from({ length: 8 }, () => "l12,8 l-12,8").join(" ")}
              fill="none" stroke={C.iron} strokeWidth={4} />
          </g>
        </g>
        {/* ── 滑車と縄 (工房が動いている合図。輪が回る) ── */}
        <g>
          <line x1={1240} y1={126} x2={1240} y2={196} stroke={C.ironDark} strokeWidth={7} />
          <circle cx={1240} cy={222} r={34} fill={C.iron} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`rotate(${-f * 2.4} 1240 222)`}>
            <line x1={1216} y1={198} x2={1264} y2={246} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <line x1={1264} y1={198} x2={1216} y2={246} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
          </g>
          <line x1={1206} y1={222} x2={1206} y2={430} stroke="#C2A878" strokeWidth={6} />
          <line x1={1274} y1={222} x2={1274} y2={370} stroke="#C2A878" strokeWidth={6} />
          <path d="M1274,370 q16,28 -8,46" fill="none" stroke="#C2A878" strokeWidth={6} />
        </g>
        {/* ── 壁の設計図に赤の訂正線が入る (作り変えの指示) ── */}
        <g>
          <rect x={1448} y={120} width={430} height={300} fill={C.washi}
            stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => (
            <line key={`zg${i}`} x1={1448} y1={182 + i * 62} x2={1878} y2={182 + i * 62}
              stroke={C.stoneDark} strokeWidth={3} opacity={0.3} />
          ))}
          <circle cx={1552} cy={240} r={50} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.55} />
          <line x1={1610} y1={240} x2={1848} y2={240} stroke={C.ink} strokeWidth={4} opacity={0.5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`zt${i}`} x1={1628 + i * 54} y1={224} x2={1628 + i * 54} y2={256}
              stroke={C.ink} strokeWidth={3} opacity={0.4} />
          ))}
          <g opacity={clamp01(seg(f, 8, 26))}>
            <line x1={1476} y1={320} x2={1852} y2={212} stroke={C.red} strokeWidth={7} />
            <line x1={1512} y1={366} x2={1826} y2={398} stroke={C.red} strokeWidth={7} />
            <circle cx={1552} cy={240} r={68} fill="none" stroke={C.red} strokeWidth={6} />
          </g>
          <circle cx={1663} cy={112} r={11} fill={C.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 作業台 (右半分に長く) ── */}
        <rect x={560} y={DY} width={W + 220 - 560} height={60} fill={C.wood}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={560} y={DY} width={W + 220 - 560} height={15} fill="#D1A463" opacity={0.8} />
        <g stroke={C.woodDark} strokeWidth={4} opacity={0.55}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`tw${i}`} x1={620 + i * 180} y1={DY + 6} x2={644 + i * 180} y2={DY + 54} />
          ))}
        </g>
        <rect x={560} y={DY + 60} width={W + 220 - 560} height={22} fill={C.woodDark} opacity={0.7} />
        <rect x={1046} y={DY + 82} width={54} height={120} fill={C.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 床 */}
        <rect x={-220} y={940} width={W + 440} height={H - 940 + 320} fill="#C2A878" />
        <g stroke="#9E8558" strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`fo${i}`} x1={-220} y1={966 + i * 34} x2={W + 220} y2={972 + i * 34} />
          ))}
        </g>
        <line x1={-220} y1={940} x2={W + 220} y2={940} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />

        {/* ── 主役: 作り変えの最中の装置 ──
            1・2 は残り、3 の位置には「まっさらの新しい板」がはまりかけ。
            歯車は速く回り、ねじは回転中。4・5 は外して運び出されている。 */}
        <JuniSochi f={f} cx={1280} gy={DY} plates={[1, 2]} blankPlate={3}
          gears={1} spin={0.95} screw="turning" />
        {/* 回しているボルト (台の左の角) */}
        <g transform={`rotate(${bolt} 952 ${DY - 24})`}>
          <circle cx={952} cy={DY - 24} r={24} fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={934} y1={DY - 24} x2={970} y2={DY - 24} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 回転の向きを示す弧 */}
        <g opacity={clamp01(seg(f, 10, 24))}>
          <path d={`M900,${DY - 86} a 58 58 0 0 1 104 10`} fill="none"
            stroke={C.terracotta} strokeWidth={7} />
          <path d={`M1004,${DY - 76} l -6,-30 l 30,16 Z`} fill={C.terracotta}
            stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 外した歯車が床を転がっていく */}
        <g transform={`translate(${1500 + roll * 300} 1006) rotate(${roll * 420})`}>
          <circle cx={0} cy={0} r={40} fill={C.iron} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={`rg${i}`} x={-8} y={-54} width={16} height={16}
              fill={C.iron} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(${i * 40})`} />
          ))}
          <circle cx={0} cy={0} r={14} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 舞う木屑 (止まっていない絵にする) */}
        {Array.from({ length: 8 }, (_, i) => {
          const tt = ((f + i * 11) % 44) / 44;
          const px = 1000 + i * 62;
          const py = DY - 40 - tt * 210;
          return (
            <path key={`cp${i}`} d={`M${px} ${py} q 13 -9 26 0`}
              fill="none" stroke={C.woodDark} strokeWidth={4}
              transform={`rotate(${tt * 180} ${px + 13} ${py})`}
              opacity={(1 - tt) * 0.85} />
          );
        })}

        {/* ── 人は3人。左から右へ「運び入れる → 回す → 運び出す」の流れを作る ── */}
        {/* 1. 大扉から、まだ何も書かれていない新しい板を運び入れる人 */}
        <Person x={340} y={952} s={1.3} pose="hold" face="normal"
          cloth={C.laurel} clothDark={C.laurelDark} f={f} />
        <g transform="translate(340 886) rotate(-5)">
          <rect x={-38} y={-34} width={76} height={70} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          <line x1={-22} y1={-10} x2={22} y2={-10} stroke={C.ink} strokeWidth={3} opacity={0.3} />
          <line x1={-22} y1={10} x2={22} y2={10} stroke={C.ink} strokeWidth={3} opacity={0.3} />
        </g>
        {/* 2. ねじを回す職人 */}
        <Person x={760} y={1052} s={1.42} pose="point" pointDir={1}
          face="normal" cloth={C.terracotta} clothDark="#8E4A32" f={f} />
        {/* レンチ (手 → ボルト) */}
        <g transform={`translate(834 ${DY + 46}) rotate(${-38 + Math.sin(f / 6) * 5})`}>
          <rect x={-34} y={-14} width={150} height={28} rx={10}
            fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          <path d="M116,-28 q42,14 42,28 q0,14 -42,28 l0,-19 l-18,0 l0,-18 l18,0 Z"
            fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-54} y={-18} width={32} height={36} rx={9}
            fill={C.laurel} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 3. 外した目盛り板を抱えて運び出す人 */}
        <Person x={1790} y={1052} s={1.2} pose="hold" face="smile"
          cloth="#5E7C8E" clothDark="#42596A" gaze={[-6, 0]} f={f} />
        {([[-26, "4", -8], [26, "5", 9]] as Array<[number, string, number]>).map(([dx, n, rr], i) => (
          <g key={`cr${i}`} transform={`translate(${1790 + dx} 912) rotate(${rr})`}>
            <rect x={-28} y={-30} width={56} height={58} fill={C.washi}
              stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={34} fill={C.ink}>{n}</text>
          </g>
        ))}
      </g>
      {/* 札は装置に被らない漆喰壁のあき (大扉の右・道具かけの下) に置く。
          中央に置くと目盛り板「1」が隠れて、作り変え中だと読めなくなる。 */}
      <TagPlate x={860} y={430} text="このあと 3つの実例" size={36} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #212 ケンブリッジ大学は、1909年に成績順位の公表をやめました。
// 格: 山 (★2026-11-08 図→山。作者指摘「同じ背景・同じ色使いで淡々と続く」の作り直し)
//
// ★舞台: 1909年の霜のおりた冬の朝・カレッジの中庭 (屋外)。
//   #210 夜の工房 (藍)・#211 昼の工房 (生成り) と地の色をぶつけないため、
//   ここは「冷えた白とグレーの石」だけで作り、金 (真鍮) と赤 (ピン) だけを差す。
// ★第4章 #67/#68 のケンブリッジとの作り分け (使い回しに見せない):
//   #68 は「正面向きの石壁 + 画面からはみ出す巨大な順位表」。
//   こちらは斜めの中庭・建物を右へ寄せ・窓は尖頭窓ではなく新古典の上下窓にし、
//   主役は「空になった掲示ケース」= 紙が無いことそのもの。
// ★事件: ガラス戸が閉まる。紙の跡 (日焼けの四角) と4本の真鍮ピンだけが残る。
// ------------------------------------------------------------------
const S212: React.FC<{ f: number }> = ({ f }) => {
  // 冬の朝の色。石・霜・ラシャ (掲示ケースの内張り)・真鍮
  const G = {
    stone: "#A9A79E", stoneLit: "#C2C0B6", stoneDark: "#807E76",
    frost: "#BCC9B6", pave: "#B2B0A8", baize: "#4E6B52",
    brass: "#C9A24C", coat: "#2E3A4E", coatDark: "#222C3C",
  };
  // 掲示ケースへ、ゆっくり寄る。世界点(1330,520)を画面点(1240,540)に置いたまま拡大
  const k = easeOut(clamp01(seg(f, 0, 38)));
  const z = lerp(1, 1.12, k);
  const qx = lerp(1330, 1240, k);
  const qy = lerp(520, 540, k);
  // 世界座標 → 画面座標 (札とひき出し線はカメラの外に置くので変換が必要)
  const sx = (wx: number) => qx + (wx - 1330) * z;
  const sy = (wy: number) => qy + (wy - 520) * z;
  const door = easeOut(clamp01(seg(f, 6, 32)));   // ガラス戸が閉まる
  const ghost = clamp01(seg(f, 14, 40));          // 紙の跡が浮かび上がる
  return (
    <Frame f={f} seed={1111} bg={KRP.cream}>
      <g transform={camTo(z, 1330, 520, qx, qy)}>
        <defs>
          <linearGradient id="k212sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DEE4E4" />
            <stop offset="100%" stopColor="#F0EEE7" />
          </linearGradient>
          <linearGradient id="k212glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.38" />
          </linearGradient>
        </defs>
        {/* ── 冬の白い空 ── */}
        <rect x={-320} y={-320} width={W + 640} height={H + 640} fill="url(#k212sky)" />
        {/* 遠くのカレッジの屋根と煙突。煙は f でなびく */}
        <g>
          {/* いちばん奥の棟をもう一段うすく重ねる (ベタ1色の板に見せない。第16条) */}
          <polygon points="-320,392 20,296 360,392" fill={G.stoneDark} opacity={0.28} />
          <polygon points="-120,352 150,250 420,352" fill={G.stoneDark} opacity={0.5} />
          <rect x={-120} y={352} width={540} height={110} fill={G.stone} opacity={0.5} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.2}>
            {[1, 2, 3, 4].map((i) => (
              <line key={`rt${i}`} x1={150 - i * 54} y1={250 + i * 25}
                x2={150 + i * 54} y2={250 + i * 25} />
            ))}
          </g>
          {[-60, 96, 252].map((wx, i) => (
            <rect key={`fw${i}`} x={wx} y={378} width={44} height={60}
              fill="#8A96A0" opacity={0.45} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {[60, 262].map((cxx, i) => (
            <g key={`ch${i}`}>
              <rect x={cxx} y={262} width={34} height={70} fill={G.stoneDark}
                opacity={0.6} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M${cxx + 17},258 q${12 + Math.sin((f + i * 9) / 14) * 9},-44 -6,-82`}
                fill="none" stroke={KRP.white} strokeWidth={13} opacity={0.5} strokeLinecap="round" />
            </g>
          ))}
        </g>
        {/* 冬枯れの木 (葉がない。季節を1本で言う) */}
        <g stroke={G.stoneDark} fill="none" strokeLinecap="round" opacity={0.85}>
          <path d="M460,790 L452,470" strokeWidth={20} />
          <path d="M454,560 q-72,-56 -108,-124 M456,620 q74,-48 112,-116 M452,510 q-46,-46 -62,-96 M454,540 q52,-40 86,-96"
            strokeWidth={9} />
        </g>
        {/* ── 霜の芝 + 低い鉄柵 ── */}
        <path d="M-320,742 L860,742 L900,880 L-320,880 Z" fill={G.frost} />
        <g stroke={KRP.white} strokeWidth={4} opacity={0.75}>
          {Array.from({ length: 26 }, (_, i) => (
            <line key={`fr${i}`} x1={-300 + i * 48} y1={760 + (i % 4) * 26}
              x2={-288 + i * 48} y2={752 + (i % 4) * 26} />
          ))}
        </g>
        {/* 霜のきらめき (f で点滅。止まった絵にしない) */}
        <g fill={KRP.white}>
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={`sp${i}`} cx={-240 + i * 82} cy={768 + (i * 37) % 96} r={5}
              opacity={0.3 + 0.6 * Math.abs(Math.sin((f + i * 11) / 9))} />
          ))}
        </g>
        <g stroke={KRP.ink} strokeWidth={5} opacity={0.6}>
          <line x1={-320} y1={736} x2={880} y2={736} />
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`rl${i}`} x1={-300 + i * 76} y1={690} x2={-300 + i * 76} y2={742} strokeWidth={4} />
          ))}
        </g>
        {/* ── 濡れた石畳 (手前。第16条の床) ── */}
        <rect x={-320} y={880} width={W + 640} height={H} fill={G.pave} />
        <g stroke={G.stoneDark} strokeWidth={4} opacity={0.6}>
          {[916, 968, 1030, 1104].map((ly, i) => (
            <line key={`pv${i}`} x1={-320} y1={ly} x2={W + 320} y2={ly} />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`pw${i}`} x1={-180 + i * 180} y1={880} x2={-240 + i * 206} y2={1080} />
          ))}
        </g>
        {/* 縁石 + 濡れた水たまり + 落ち葉。素のベタ床を残さない (第16条) */}
        <rect x={-320} y={866} width={W + 640} height={22} fill={G.stoneLit}
          stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <g>
          <ellipse cx={250} cy={1010} rx={196} ry={48} fill="#9EA8AC" opacity={0.75} />
          <ellipse cx={250} cy={1004} rx={150} ry={32} fill="#CFD8DA" opacity={0.6} />
          <ellipse cx={1520} cy={972} rx={118} ry={30} fill="#9EA8AC" opacity={0.6} />
        </g>
        <g fill="#8E7A58" opacity={0.75}>
          {[[150, 930, 20], [430, 1012, -35], [1180, 950, 14], [1680, 1024, -22]].map(
            ([lx, ly, lr], i) => (
              <ellipse key={`lv${i}`} cx={lx} cy={ly} rx={21} ry={11}
                transform={`rotate(${lr} ${lx} ${ly})`} />
            ))}
        </g>
        {/* 鳩1羽 (事件のそばに生き物を置く) */}
        <g transform={`translate(640 ${902 + Math.sin(f / 11) * 3})`}>
          <ellipse cx={0} cy={0} rx={30} ry={19} fill="#8E9299" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={24} cy={-16} r={12} fill="#8E9299" stroke={KRP.ink} strokeWidth={4} />
          <path d="M34,-18 l12,5 l-12,5" fill={G.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* ── 建物は右へ寄せる。隅石と上下窓 (第4章の尖頭窓を避ける) ── */}
        <g>
          <polygon points="880,214 2240,150 2240,1000 880,940" fill={G.stone}
            stroke={KRP.ink} strokeWidth={7} />
          {/* 隅石 */}
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={`qo${i}`} x={880} y={226 + i * 82} width={62} height={60}
              fill={i % 2 ? G.stoneLit : G.stoneDark} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          ))}
          {/* 石ごとの明暗を先に敷いてから目地を引く (目地が隠れないように) */}
          <g fill={G.stoneLit} opacity={0.5}>
            {[[1092, 326], [1420, 244], [1748, 408], [1256, 572], [2076, 326],
              [1584, 736], [1912, 654], [1092, 818]].map(([bx, by], i) => (
              <rect key={`bl${i}`} x={bx} y={by} width={164} height={82} />
            ))}
          </g>
          {/* 石の目地 (横 + 千鳥の縦。素のベタ壁にしない。第16条) */}
          <g stroke={G.stoneDark} strokeWidth={4} opacity={0.55}>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`ms${i}`} x1={944} y1={244 + i * 82} x2={2240} y2={236 + i * 82} />
            ))}
            {Array.from({ length: 9 }, (_, i) =>
              Array.from({ length: 8 }, (_, j) => {
                const vx = 1010 + j * 164 + (i % 2) * 82;
                return (
                  <line key={`mv${i}_${j}`} x1={vx} y1={244 + i * 82}
                    x2={vx} y2={244 + (i + 1) * 82} />
                );
              }))}
          </g>
          {/* 新古典の上下窓 (四角・格子・まぐさ石) */}
          {[1760, 2010].map((wx, i) => (
            <g key={`wd${i}`}>
              <rect x={wx} y={250} width={168} height={280} fill="#8A96A0"
                stroke={KRP.ink} strokeWidth={6} />
              <rect x={wx - 12} y={232} width={192} height={26} fill={G.stoneLit}
                stroke={KRP.ink} strokeWidth={5} />
              <g stroke={KRP.white} strokeWidth={5} opacity={0.8}>
                <line x1={wx} y1={390} x2={wx + 168} y2={390} />
                <line x1={wx + 84} y1={250} x2={wx + 84} y2={530} />
              </g>
            </g>
          ))}
          {/* 木の扉 */}
          <rect x={1700} y={640} width={200} height={300} fill="#6E4F2C"
            stroke={KRP.ink} strokeWidth={7} />
          <circle cx={1860} cy={800} r={13} fill={G.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 主役: 空になったガラス戸の掲示ケース ── */}
        <g>
          {/* 枠 */}
          <rect x={1072} y={296} width={576} height={508} rx={10} fill="#6E4F2C"
            stroke={KRP.ink} strokeWidth={8} />
          {/* 内張りのラシャ (緑) */}
          <rect x={1104} y={328} width={512} height={444} fill={G.baize}
            stroke={KRP.ink} strokeWidth={5} />
          {/* 紙が貼ってあった跡 (日焼けの四角と点線。「無い」ことを描く) */}
          <rect x={1182} y={382} width={356} height={318} fill="#7B9078"
            opacity={0.55 * ghost} />
          <rect x={1182} y={382} width={356} height={318} fill="none"
            stroke={KRP.white} strokeWidth={5} strokeDasharray="16 14" opacity={0.85 * ghost} />
          {/* 残った4本の真鍮ピン */}
          {[[1182, 382], [1538, 382], [1182, 700], [1538, 700]].map(([pxx, pyy], i) => (
            <circle key={`pn${i}`} cx={pxx} cy={pyy} r={12}
              fill={G.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 真鍮の銘板 (正式名称を絵の中に1つだけ入れる) */}
          <rect x={1216} y={728} width={288} height={34} rx={5} fill={G.brass}
            stroke={KRP.ink} strokeWidth={4} />
          <text x={1360} y={754} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={23} fill="#4A3A16">ORDER OF MERIT</text>
          {/* ガラス戸。左から右へ閉まっていく (= 公表の終わり) */}
          <g>
            <rect x={1104} y={328} width={512 * door} height={444}
              fill="url(#k212glass)" stroke="none" />
            <line x1={1104 + 512 * door} y1={328} x2={1104 + 512 * door} y2={772}
              stroke="#E8ECEC" strokeWidth={10} opacity={0.9} />
            <line x1={1104 + 512 * door} y1={328} x2={1104 + 512 * door} y2={772}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 小さな錠 */}
          <rect x={1636} y={520} width={26} height={44} rx={6} fill={G.brass}
            stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 人の反応: 守衛が順位表を巻いて持ち帰る ── */}
        <g>
          <Person x={820} y={930} s={1.45} f={f} pose="hold" face="normal"
            cloth={G.coat} clothDark={G.coatDark} hair="none" gaze={[7, -3]} />
          {/* 山高帽 (手描き。つば + 山) */}
          <g transform="translate(820 530)">
            <ellipse cx={0} cy={22} rx={112} ry={22} fill="#20242C"
              stroke={KRP.ink} strokeWidth={5} />
            <path d="M-72,24 q0,-82 72,-82 q72,0 72,82 Z" fill="#2A2F38"
              stroke={KRP.ink} strokeWidth={5} />
            <rect x={-72} y={6} width={144} height={18} fill="#171B21" opacity={0.8} />
          </g>
          {/* 巻いた順位表 (hold の手の高さに合わせる) */}
          <g transform="translate(840 759) rotate(-16)">
            <rect x={-96} y={-20} width={192} height={40} rx={20} fill={C.washi}
              stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={-96} cy={0} rx={10} ry={20} fill={C.washiDark}
              stroke={KRP.ink} strokeWidth={5} />
            <line x1={-60} y1={-14} x2={-60} y2={14} stroke={C.washiDark} strokeWidth={4} />
            <path d="M24,-24 q24,24 0,48" fill="none" stroke={C.terracotta} strokeWidth={7} />
          </g>
          {/* 白い息 (寒さと「今まさに」を出す) */}
          {[0, 1, 2].map((i) => {
            const bt = ((f + i * 13) % 42) / 42;
            return (
              <ellipse key={`br${i}`} cx={884 + bt * 74} cy={508 - bt * 40}
                rx={14 + bt * 26} ry={9 + bt * 17} fill={KRP.white}
                opacity={0.55 * (1 - bt)} />
            );
          })}
        </g>
        {/* 風に転がる紙きれ1枚 (剥がされた名残) */}
        <g transform={`translate(${400 + (f % 42) * 11} ${906 - Math.sin(f / 7) * 14}) rotate(${f * 6})`}>
          <rect x={-22} y={-15} width={44} height={30} fill={C.washi}
            stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        </g>
        {/* 空へ抜ける鳥3羽 */}
        <g stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.45}>
          {[[560, 220], [660, 178], [742, 236]].map(([bx, by], i) => (
            <path key={`bd${i}`}
              d={`M${bx},${by} q14,${-10 - Math.sin((f + i * 8) / 8) * 6} 28,0 q14,${-10 - Math.sin((f + i * 8) / 8) * 6} 28,0`} />
          ))}
        </g>
      </g>
      {/* 札は画面座標。字幕1行 (帯の上端 y≈931) なので下端 800 までに収める。
          字幕の写しにならないよう「どの試験の順位か」を足す (札の言い換えの法)。
          ひき出し線の先は「紙が無くなったケースの中」。守衛の顔を横切らない位置を選ぶ */}
      <line x1={1240} y1={238} x2={sx(1182) + 14} y2={sy(382) - 4}
        stroke={C.terracotta} strokeWidth={5} strokeDasharray="14 10"
        opacity={clamp01(seg(f, 10, 24)) * 0.9} />
      <TagPlate x={1240} y={196} text="数学の卒業試験" size={38} t={seg(f, 6, 20)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #213 日本の通知表は、2002年度に「クラスの中で何%か」で決めるのをやめました。
// 格: 山 (★2026-11-08 図→山)
//
// ★舞台: 2002年の日本・放課後の教室 (屋内だが #210/#211 の工房とは別世界)。
//   地は白い壁とアルミサッシと蛍光灯、床はリノリウム。色は白・銀・赤 (ランドセル)。
//   #212 が「冷えた石のグレー」なので、ここは「明るい白と銀に赤1点」で切り替える。
//   空は窓の細い帯だけ。#214 の青空とぶつけないため大きくは出さない。
// ★カメラ: #212 が寄るので、ここは等倍のまま右から左へ流す (横パン)。
// ★事件: 左の「相対評価の分布表」に赤× / 右の通知表の ◎ が順に埋まる。
//   炎上回避: 良い悪いを描かない。ゆとり教育論争・知能検査には触れない。
// ------------------------------------------------------------------
const S213: React.FC<{ f: number }> = ({ f }) => {
  const M = {
    wall: "#F2F1EC", wallLine: "#DCDAD2", ceil: "#FBFAF6",
    board: "#3E5C48", lino: "#C7CAC5", linoLine: "#AEB2AD",
    steel: "#B6BCC0", steelDark: "#8C9298", desk: "#EFEFE9",
    red: "#C0392B", earth: "#BE9A6A", fence: "#6E8F5A",
  };
  const k = easeOut(clamp01(seg(f, 0, 40)));
  const z = 1.08;                       // 寄らない。横に流す
  const qx = lerp(1060, 960, k);
  const sx = (wx: number) => qx + (wx - 960) * z;
  const sy = (wy: number) => 560 + (wy - 560) * z;
  const cross = clamp01(seg(f, 12, 30));          // 分布表に赤×
  const fill5 = clamp01(seg(f, 16, 40));          // ◎ が順に入る
  const flick = 0.82 + 0.18 * Math.abs(Math.sin(f / 3.1));  // 蛍光灯のちらつき
  return (
    <Frame f={f} seed={1112} bg={KRP.cream}>
      <g transform={camTo(z, 960, 560, qx, 560)}>
        {/* ── 白い壁と天井 ── */}
        <rect x={-320} y={-320} width={W + 640} height={H + 640} fill={M.wall} />
        <rect x={-320} y={-320} width={W + 640} height={420} fill={M.ceil} />
        <line x1={-320} y1={196} x2={W + 320} y2={196} stroke={M.wallLine} strokeWidth={5} />
        {/* 蛍光灯2本 (吊り。ちらつかせて「放課後の教室」を出す)。
            z=1.08 で上が切れるので、画面に入る y に下げてある */}
        {[620, 1420].map((lx, i) => (
          <g key={`fl${i}`}>
            <line x1={lx - 70} y1={30} x2={lx - 70} y2={98} stroke={M.steelDark} strokeWidth={5} />
            <line x1={lx + 70} y1={30} x2={lx + 70} y2={98} stroke={M.steelDark} strokeWidth={5} />
            <rect x={lx - 160} y={98} width={320} height={34} rx={8} fill="#FFFDE8"
              stroke={KRP.ink} strokeWidth={5} opacity={flick} />
            <ellipse cx={lx} cy={176} rx={240} ry={58} fill="#FFFBE0" opacity={0.3 * flick} />
          </g>
        ))}
        {/* 壁の掲示物 (素のベタ壁を残さない。第16条) */}
        <g>
          <rect x={1700} y={200} width={190} height={250} fill={C.washi}
            stroke={KRP.ink} strokeWidth={5} />
          <g stroke={M.wallLine} strokeWidth={5}>
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`pl${i}`} x1={1722} y1={236 + i * 28} x2={1868} y2={236 + i * 28} />
            ))}
          </g>
          <rect x={1700} y={200} width={190} height={34} fill={M.fence} opacity={0.6} />
        </g>
        {/* ── 黒板 (緑)。白チョークで ◎ ○ △ ── */}
        <g>
          <rect x={620} y={250} width={940} height={250} fill={M.board}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={600} y={490} width={980} height={26} rx={6} fill="#A0763E"
            stroke={KRP.ink} strokeWidth={5} />
          <g opacity={clamp01(seg(f, 4, 22))}>
            <circle cx={790} cy={370} r={54} fill="none" stroke={KRP.white} strokeWidth={9} />
            <circle cx={790} cy={370} r={30} fill="none" stroke={KRP.white} strokeWidth={9} />
            <circle cx={1060} cy={370} r={54} fill="none" stroke={KRP.white} strokeWidth={9} />
            <path d="M1330,418 L1388,318 L1446,418 Z" fill="none" stroke={KRP.white} strokeWidth={9} />
          </g>
          {/* チョークと黒板消し */}
          <rect x={1480} y={478} width={64} height={28} rx={5} fill="#5A6B72"
            stroke={KRP.ink} strokeWidth={4} />
          <rect x={660} y={484} width={52} height={16} rx={7} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 左: アルミサッシの窓。外は校庭 (時代と場所を1枚で言う) ── */}
        <g>
          <rect x={70} y={170} width={470} height={530} fill="#C3DCE4"
            stroke={KRP.ink} strokeWidth={8} />
          {/* 空の帯は細く (#214 の青空と差をつける) */}
          <rect x={78} y={178} width={454} height={96} fill="#CFE2EA" />
          {/* 校庭の土 + 緑のフェンス */}
          <rect x={78} y={420} width={454} height={272} fill={M.earth} />
          <rect x={78} y={274} width={454} height={146} fill="#C4D6B4" />
          <g stroke={M.fence} strokeWidth={4} opacity={0.9}>
            {Array.from({ length: 18 }, (_, i) => (
              <line key={`fa${i}`} x1={78 + i * 27} y1={300} x2={78 + i * 27 + 54} y2={420} />
            ))}
            {Array.from({ length: 18 }, (_, i) => (
              <line key={`fb${i}`} x1={78 + i * 27} y1={420} x2={78 + i * 27 + 54} y2={300} />
            ))}
            <line x1={78} y1={296} x2={532} y2={296} strokeWidth={7} />
          </g>
          {/* 桜の枝と散る葉 */}
          <path d="M470,178 q-60,70 -24,140" fill="none" stroke="#7A5A3E" strokeWidth={11} />
          {[0, 1, 2].map((i) => {
            const lt = ((f + i * 15) % 44) / 44;
            return (
              <ellipse key={`lf${i}`} cx={430 - lt * 60 + Math.sin((f + i * 9) / 6) * 14}
                cy={250 + lt * 380} rx={13} ry={7} fill="#C98A5A"
                transform={`rotate(${f * 5 + i * 60} ${430 - lt * 60} ${250 + lt * 380})`} />
            );
          })}
          {/* サッシの中桟 + 白いカーテン (f で膨らむ) */}
          <line x1={300} y1={170} x2={300} y2={700} stroke={M.steel} strokeWidth={10}
            strokeLinecap="round" />
          <line x1={78} y1={430} x2={532} y2={430} stroke={M.steel} strokeWidth={8} />
          <path d={`M312,176 q${90 + Math.sin(f / 13) * 40},180 ${30 + Math.sin(f / 11) * 26},520 L540,696 L540,176 Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.88} />
        </g>
        {/* ── 後ろの机の列 (スチール脚。教室だと分かる反復) ── */}
        {[[660, 700], [900, 700], [1140, 700], [1380, 700]].map(([dx, dy], i) => (
          <g key={`bd${i}`}>
            <polygon points={`${dx - 86},${dy} ${dx + 86},${dy} ${dx + 100},${dy + 34} ${dx - 100},${dy + 34}`}
              fill={M.desk} stroke={KRP.ink} strokeWidth={5} />
            <line x1={dx - 80} y1={dy + 34} x2={dx - 86} y2={dy + 120} stroke={M.steelDark} strokeWidth={7} />
            <line x1={dx + 80} y1={dy + 34} x2={dx + 86} y2={dy + 120} stroke={M.steelDark} strokeWidth={7} />
          </g>
        ))}
        {/* ── リノリウムの床 ── */}
        <rect x={-320} y={820} width={W + 640} height={H} fill={M.lino} />
        <g stroke={M.linoLine} strokeWidth={4} opacity={0.8}>
          {[860, 930, 1010].map((ly, i) => (
            <line key={`ln${i}`} x1={-320} y1={ly} x2={W + 320} y2={ly} />
          ))}
        </g>
        {/* ── 手前の机 (第16条の床。ここが舞台) ── */}
        <polygon points="330,520 1740,520 1830,900 240,900" fill={M.desk}
          stroke={KRP.ink} strokeWidth={8} />
        <polygon points="240,900 1830,900 1838,928 232,928" fill={M.steel}
          stroke={KRP.ink} strokeWidth={6} />
        {/* ── 左: やめた方 = 相対評価の分布表 ── */}
        <g transform="translate(0 0)">
          <rect x={372} y={556} width={496} height={320} fill={C.washi}
            stroke={KRP.ink} strokeWidth={6} />
          {/* 5本の柱で割合を見せる。高さ = %。数字は柱の上、評定は基準線の下に離して置く
              (横に並べた数字どうしが重なって読めなくなるのを避ける) */}
          {[[7, 402], [24, 488], [38, 574], [24, 660], [7, 746]].map(([pct, bxx], i) => {
            const hgt = Number(pct) * 5.2;   // 紙いっぱいに伸ばす (小さいと数字が読めない)
            return (
              <g key={`bn${i}`}>
                <rect x={Number(bxx)} y={818 - hgt} width={70} height={hgt}
                  fill={i === 2 ? "#BBD2E0" : i % 4 === 0 ? "#9FB8CE" : "#A9C4D6"}
                  stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
                <text x={Number(bxx) + 35} y={812 - hgt} textAnchor="middle" fontFamily={FONT}
                  fontWeight={900} fontSize={24} fill={KRP.ink}>{Number(pct)}%</text>
                <text x={Number(bxx) + 35} y={856} textAnchor="middle" fontFamily={FONT}
                  fontWeight={900} fontSize={28} fill={KRP.ink}>{5 - i}</text>
              </g>
            );
          })}
          {/* 釣鐘の曲線 (柱の頭をなぞる) */}
          <path d="M392,806 Q418,798 437,782 Q482,700 523,693 Q562,626 609,620 Q656,626 695,693 Q736,700 781,782 Q800,798 826,806"
            fill="none" stroke={KRP.ink} strokeWidth={6} strokeDasharray="12 9" opacity={0.7} />
          <line x1={388} y1={818} x2={852} y2={818} stroke={KRP.ink} strokeWidth={6} />
          {/* 赤× (やめた印) */}
          <g stroke={M.red} strokeWidth={16} strokeLinecap="round" opacity={cross}>
            <line x1={420} y1={588} x2={820} y2={848} />
            <line x1={820} y1={588} x2={420} y2={848} />
          </g>
        </g>
        {/* ── 右: 主役 = 開いた通知表 ── */}
        <g>
          {/* 二つ折りの台紙 */}
          <polygon points="952,548 1636,548 1660,812 976,812" fill="#D9CFB4"
            stroke={KRP.ink} strokeWidth={7} />
          <polygon points="968,560 1620,560 1642,800 990,800" fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          <line x1={1296} y1={556} x2={1314} y2={804} stroke={C.washiDark} strokeWidth={5} />
          <text x={1092} y={606} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={34} fill={KRP.ink}>つうちひょう</text>
          <line x1={996} y1={620} x2={1200} y2={620} stroke={KRP.ink} strokeWidth={5} />
          {/* 評価の行。◎ が順に入っていく (事件) */}
          {[0, 1, 2, 3].map((i) => {
            const ry = 660 + i * 36;
            const on = clamp01(fill5 * 4 - i);
            return (
              <g key={`rw${i}`}>
                <line x1={996} y1={ry + 14} x2={1272} y2={ry + 14}
                  stroke={C.washiDark} strokeWidth={4} />
                <rect x={1004} y={ry - 12} width={120} height={26} fill="#E8E4D4"
                  stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
                <g opacity={on}>
                  <circle cx={1206} cy={ry} r={15} fill="none" stroke={M.red} strokeWidth={6} />
                  <circle cx={1206} cy={ry} r={7} fill="none" stroke={M.red} strokeWidth={6} />
                </g>
              </g>
            );
          })}
          {/* 右面は所見欄 */}
          <g stroke={C.washiDark} strokeWidth={4}>
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`cm${i}`} x1={1336} y1={610 + i * 32} x2={1608} y2={610 + i * 32} />
            ))}
          </g>
          <rect x={1538} y={726} width={62} height={62} fill="none"
            stroke={M.red} strokeWidth={5} opacity={0.9} />
        </g>
        {/* 机の小物 (鉛筆・赤ペン・消しゴム) */}
        <g>
          <g transform="translate(1700 860) rotate(-12)">
            <rect x={-96} y={-9} width={168} height={18} fill="#E8C24A"
              stroke={KRP.ink} strokeWidth={4} />
            <polygon points="72,-9 104,0 72,9" fill="#D9BE92" stroke={KRP.ink} strokeWidth={4} />
          </g>
          <g transform="translate(1636 884) rotate(6)">
            <rect x={-80} y={-9} width={150} height={18} rx={9} fill={M.red}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
          <rect x={880} y={884} width={66} height={30} rx={5} fill="#E8E8E0"
            stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ── 人の反応: 先生が右を指し、子どもが驚く ── */}
        <Person x={270} y={1000} s={1.3} f={f} pose="point" pointDir={1}
          face="smile" glasses cloth="#5E6E7E" clothDark="#46545F" hair="none" gaze={[8, 0]} />
        <g>
          <Person x={1760} y={1010} s={1.26} f={f} phase={3} face="surprised"
            cloth="#4A6B8A" clothDark="#3A5570" hair="none" gaze={[-9, 0]} />
          {/* 赤いランドセルの肩ベルト + 黄色い帽子 (2002年の小学生) */}
          <g>
            {[-34, 34].map((bx) => (
              <path key={bx} d={`M${1760 + bx},${770} q${bx * 0.3},62 ${bx * 0.1},128`}
                fill="none" stroke={M.red} strokeWidth={22} strokeLinecap="round" />
            ))}
            <rect x={1800} y={790} width={58} height={120} rx={10} fill={M.red}
              stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={1760} cy={722} rx={88} ry={18} fill="#E8C24A"
              stroke={KRP.ink} strokeWidth={5} />
            <path d="M1700,724 q0,-66 60,-66 q60,0 60,66 Z" fill="#E8C24A"
              stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
      </g>
      {/* 札は2枚1組。字幕2行 (帯の上端 y≈854) なので高さを揃えて上に置く
          (検査4「両思い」判定)。字幕の写しを避け、片方は数値・片方は仕組みを足す */}
      <g opacity={clamp01(seg(f, 10, 26)) * 0.9}>
        <line x1={560} y1={238} x2={sx(620) - 10} y2={sy(700) - 10}
          stroke={C.terracotta} strokeWidth={5} strokeDasharray="14 10" />
        <line x1={1460} y1={238} x2={sx(1522)} y2={sy(646) - 10}
          stroke={C.terracotta} strokeWidth={5} strokeDasharray="14 10" />
      </g>
      <TagPlate x={560} y={190} text="上位 7%" size={40} t={seg(f, 6, 20)} />
      <TagPlate x={1460} y={190} text="◎は 何人でも" size={40} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #214 江戸の相撲のように、そもそも白黒をつけない文化も、ちゃんと実在しました。
// 格: 山 (★2026-11-08 図→山)
//
// ★舞台: 晴れた屋外・寺社の境内の勧進相撲。青空 + 朱の幟 + 濃い緑の松 + 砂。
//   #212 の冷えたグレー・#213 の白と銀とは地の色が真逆になる。
// ★第5章 #93 (引き分け・預かりの文) との作り分け:
//   #93 は「ローアングル (rx620 ry190) + 手前の大きな行司 + 軍配を上げる動き +
//   札『白黒つけない』」。こちらは俯瞰 (rx500 ry300) で土俵を丸く見せ、
//   行司は軍配を水平に保ったまま小さく揺らすだけ。札も別の言葉にする。
// ★人物は第5章の Rikishi / Gyoji / EdoPerson(Mini) をそのまま流用 (第7条)。
//   舞台 (EdoWall / Sumobeya) は共有せず、境内・幟・櫓・桟敷はここで新しく描く。
// ★事件: 「引分」「預り」の木札が、星取りの板に下がる。
// ------------------------------------------------------------------
const S214: React.FC<{ f: number }> = ({ f }) => {
  const E = {
    pine: "#4C6B47", pineDark: "#38512F", beni: "#B8473A",
    nokon: "#3A4C66", sand: "#B9A07A", sandDark: "#9A8260",
    dohyo: "#C9B88E", tawara: "#D8C79B",
    wood: "#9A7244", woodDark: "#6E4F2C", washi: "#F0E7D2",
  };
  // #212 が寄る・#213 が横パンなので、ここは引く (三者でカメラの型も変える)
  const k = easeOut(clamp01(seg(f, 0, 36)));
  const z = lerp(1.18, 1, k);
  const drop = easeOut(clamp01(seg(f, 10, 34)));   // 木札が下がる
  return (
    <Frame f={f} seed={1113} bg={KRP.cream}>
      <g transform={zoomAt(z, 960, 620)}>
        <defs>
          <linearGradient id="k214sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8FB8D8" />
            <stop offset="100%" stopColor="#D6E8F2" />
          </linearGradient>
        </defs>
        {/* ── 晴れた空 ── */}
        <rect x={-320} y={-320} width={W + 640} height={H + 640} fill="url(#k214sky)" />
        <g fill={KRP.white} opacity={0.8}>
          <ellipse cx={1240} cy={140} rx={110} ry={38} />
          <ellipse cx={1150} cy={162} rx={66} ry={26} />
          <ellipse cx={520} cy={108} rx={88} ry={30} />
        </g>
        {/* ── 遠景: 瓦塀と寺の屋根と松 ── */}
        <g>
          <polygon points="620,352 960,232 1300,352" fill={E.woodDark}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={660} y={352} width={600} height={74} fill={E.wood}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={-320} y={392} width={W + 640} height={86} fill="#C6BFAC"
            stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
            {Array.from({ length: 22 }, (_, i) => (
              <line key={`kw${i}`} x1={-300 + i * 92} y1={392} x2={-300 + i * 92} y2={478} />
            ))}
          </g>
          {/* 松 (濃い緑。江戸の屋外を1発で出す) */}
          {[[200, 400, 1], [1760, 392, 0.9]].map(([mx, my, ms], i) => (
            <g key={`pi${i}`} transform={`translate(${mx} ${my}) scale(${ms})`}>
              <path d="M0,0 L-10,-150" stroke="#6E4F2C" strokeWidth={18} fill="none" />
              {[[-70, -150], [60, -176], [-16, -214]].map(([bx, by], j) => (
                <g key={`pb${j}`}>
                  <ellipse cx={bx} cy={by} rx={82} ry={38} fill={E.pine}
                    stroke={KRP.ink} strokeWidth={5} />
                  <ellipse cx={bx + 20} cy={by - 14} rx={48} ry={22} fill={E.pineDark} opacity={0.6} />
                </g>
              ))}
            </g>
          ))}
        </g>
        {/* ── 櫓 (太鼓やぐら)。小さな人が太鼓を打つ ── */}
        <g>
          <path d="M380,470 L404,214 M560,470 L536,214" stroke={E.woodDark}
            strokeWidth={13} fill="none" />
          <path d="M392,340 L548,340 M386,410 L554,410" stroke={E.wood}
            strokeWidth={9} fill="none" />
          <rect x={386} y={190} width={168} height={26} fill={E.wood}
            stroke={KRP.ink} strokeWidth={5} />
          <polygon points="366,190 574,190 470,132" fill={E.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
          <circle cx={470} cy={238} r={34} fill={E.washi} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={470} cy={238} r={21} fill={E.beni} opacity={0.3} />
          <EdoPersonMini x={520} y={214} s={0.34} f={f} phase={2}
            color="#6E7A8A" face="dot" arms="up" />
        </g>
        {/* ── 幟 (朱。左右3本ずつ。f でなびく) ── */}
        {[120, 300, 480, 1460, 1640, 1800].map((nx, i) => {
          const sway = Math.sin((f + i * 11) / 15) * 16;
          return (
            <g key={`nb${i}`}>
              <line x1={nx} y1={470} x2={nx} y2={150} stroke={E.woodDark} strokeWidth={9} />
              <path d={`M${nx},160 L${nx + 54},${160 + sway * 0.3} L${nx + 54 + sway},470 L${nx + sway * 0.6},468 Z`}
                fill={i % 2 ? E.beni : "#C86A4A"} stroke={KRP.ink} strokeWidth={5} />
              <line x1={nx + 10} y1={210} x2={nx + 46 + sway * 0.2} y2={212}
                stroke={E.washi} strokeWidth={6} opacity={0.85} />
              <line x1={nx + 10} y1={290} x2={nx + 46 + sway * 0.4} y2={294}
                stroke={E.washi} strokeWidth={6} opacity={0.85} />
            </g>
          );
        })}
        {/* ── 掃いた砂の地面 (第16条の床) ── */}
        <rect x={-320} y={470} width={W + 640} height={H} fill={E.sand} />
        <g stroke={E.sandDark} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={`sw${i}`} d={`M-320,${520 + i * 66} Q960,${500 + i * 66} ${W + 320},${524 + i * 66}`} fill="none" />
          ))}
        </g>
        <g fill={E.sandDark} opacity={0.4}>
          {Array.from({ length: 34 }, (_, i) => (
            <ellipse key={`sg${i}`} cx={-200 + (i * 137) % 2300} cy={500 + (i * 83) % 560} rx={7} ry={4} />
          ))}
        </g>
        {/* ── 四本柱の奥2本 + 水引幕 (手前2本はカメラの前として省く) ── */}
        {[[520, E.nokon], [1400, E.beni]].map(([px2, col], i) => (
          <g key={`pl${i}`}>
            <rect x={Number(px2) - 17} y={200} width={34} height={420}
              fill={String(col)} stroke={KRP.ink} strokeWidth={5} />
            <g stroke={E.washi} strokeWidth={6} opacity={0.8}>
              {[300, 400, 500].map((hy) => (
                <line key={hy} x1={Number(px2) - 17} y1={hy} x2={Number(px2) + 17} y2={hy} />
              ))}
            </g>
          </g>
        ))}
        <rect x={470} y={150} width={980} height={52} fill="#6E4C82"
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={470} y={190} width={980} height={16} fill={E.washi} opacity={0.9} />
        {/* ── 向こう正面の客は土俵より先に描く。土俵の縁が足元を隠して
               「輪の向こう側に居る」と読めるようにする (浮いて見えるのを防ぐ) ── */}
        <g>
          <rect x={600} y={462} width={1300} height={30} fill={E.wood}
            stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          {Array.from({ length: 11 }, (_, i) => (
            <EdoPersonMini key={`sl${i}`} x={648 + i * 116} y={470} s={0.44}
              f={f} phase={i} color="#8A8F96" face="none" arms="down" />
          ))}
        </g>
        {/* ── 俯瞰の土俵 (丸く見せる。#93 の低い角度と変える) ── */}
        <g>
          <ellipse cx={960} cy={700} rx={560} ry={340} fill={E.dohyo}
            stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={960} cy={690} rx={500} ry={300} fill="none"
            stroke={E.tawara} strokeWidth={26} />
          <ellipse cx={960} cy={690} rx={500} ry={300} fill="none"
            stroke={KRP.ink} strokeWidth={6} />
          {/* 俵の1つずつの区切り */}
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.6}>
            {Array.from({ length: 20 }, (_, i) => {
              const a = (i / 20) * Math.PI * 2;
              return (
                <line key={`tw${i}`}
                  x1={960 + Math.cos(a) * 487} y1={690 + Math.sin(a) * 288}
                  x2={960 + Math.cos(a) * 513} y2={690 + Math.sin(a) * 312} />
              );
            })}
          </g>
          {/* 蛇の目 (白い砂の輪) + 仕切り線2本 */}
          <ellipse cx={960} cy={690} rx={470} ry={282} fill="none"
            stroke={KRP.white} strokeWidth={9} opacity={0.75} />
          <g stroke={KRP.white} strokeWidth={13} opacity={0.9}>
            <line x1={858} y1={742} x2={858} y2={812} />
            <line x1={1062} y1={742} x2={1062} y2={812} />
          </g>
          {/* 土間の掃き目と踏み跡。中が素のベタ一色で広く残らないようにする (第16条) */}
          <g stroke="#B5A478" strokeWidth={4} opacity={0.6} fill="none">
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={`bk${i}`} cx={960} cy={690} rx={120 + i * 92} ry={70 + i * 56} />
            ))}
          </g>
          <g fill="#AE9B6E" opacity={0.42}>
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2 + 0.3;
              return (
                <ellipse key={`ft${i}`}
                  cx={960 + Math.cos(a) * (170 + (i % 3) * 94)}
                  cy={700 + Math.sin(a) * (104 + (i % 3) * 58)}
                  rx={22} ry={11} transform={`rotate(${i * 23} 960 700)`} />
              );
            })}
          </g>
          {/* 力士の影 (俯瞰なので足元に落とすと輪の上に乗っているのが分かる) */}
          <ellipse cx={848} cy={730} rx={70} ry={23} fill={E.sandDark} opacity={0.3} />
          <ellipse cx={1082} cy={730} rx={70} ry={23} fill={E.sandDark} opacity={0.3} />
        </g>
        {/* ── 組み合ったままの2人の力士 (第5章の部品を流用) ── */}
        <g>
          {/* 組み合ったまま。重なりすぎると頭が2つの塊に見えるので左右に離す */}
          <Rikishi x={848} y={730} s={0.94} f={f} phase={1} pose="hold" lean={11} face="normal" />
          <Rikishi x={1082} y={730} s={0.94} f={f} phase={4} pose="hold" lean={-11} face="normal" />
          {/* 四つに組んだ腕 (2人の間をつなぐ。別々に立っているように見せない) */}
          <g stroke={KRP.ink} strokeWidth={5} fill="#D9A878">
            <rect x={898} y={612} width={134} height={26} rx={13} />
            <rect x={898} y={650} width={134} height={26} rx={13} />
          </g>
          {/* 足元の砂ぼこり (勝負が続いていることを出す) */}
          <g fill={E.sandDark} opacity={0.42}>
            {[0, 1, 2, 3].map((i) => {
              const dt = ((f + i * 10) % 40) / 40;
              return (
                <ellipse key={`du${i}`} cx={830 + i * 86 - dt * 24} cy={736 - dt * 16}
                  rx={18 + dt * 22} ry={8 + dt * 9} opacity={0.5 * (1 - dt)} />
              );
            })}
          </g>
        </g>
        {/* ── 行司。軍配は水平のまま小さく揺れるだけ (#93 の上げる動きを繰り返さない)。
               軍配は部品の中で右へ約200px 伸びるので、星取り板 (x≧1420) に
               隠れない位置へ置く ── */}
        <Gyoji x={1180} y={940} s={0.9} f={f} gunbaiRot={Math.sin(f / 19) * 2} />
        {/* ── 桟敷 (左手前の大きな枡席)。弁当・徳利・煙草盆まで描く ── */}
        <g>
          <polygon points="60,804 560,804 600,1010 20,1010" fill={E.wood}
            stroke={KRP.ink} strokeWidth={7} />
          <polygon points="84,820 540,820 572,994 48,994" fill="#D8C79B"
            stroke={KRP.ink} strokeWidth={5} />
          <g stroke={E.woodDark} strokeWidth={6} opacity={0.8}>
            <line x1={300} y1={820} x2={310} y2={994} />
            <line x1={70} y1={900} x2={584} y2={900} />
          </g>
          {/* 弁当・徳利・煙草盆 */}
          <rect x={120} y={930} width={96} height={48} rx={6} fill="#C08A4A"
            stroke={KRP.ink} strokeWidth={5} />
          <line x1={168} y1={930} x2={168} y2={978} stroke={E.woodDark} strokeWidth={4} />
          <g transform="translate(400 946)">
            <ellipse cx={0} cy={26} rx={28} ry={12} fill={E.washi} stroke={KRP.ink} strokeWidth={5} />
            <path d="M-20,26 L-14,-16 L14,-16 L20,26 Z" fill={E.washi}
              stroke={KRP.ink} strokeWidth={5} />
          </g>
          <rect x={470} y={936} width={74} height={42} rx={5} fill={E.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
          <path d={`M506,936 q${Math.sin(f / 9) * 10},-32 -4,-58`} fill="none"
            stroke={KRP.white} strokeWidth={7} opacity={0.5} />
          {/* 客3人。1人は扇子をあおぐ */}
          <EdoPersonMini x={190} y={900} s={0.62} f={f} phase={1} face="smile" arms="down" />
          <EdoPersonMini x={330} y={900} s={0.6} f={f} phase={5} face="dot" arms="up" />
          <EdoPersonMini x={470} y={898} s={0.58} f={f} phase={3} face="dot" arms="down" />
          <g transform={`translate(358 838) rotate(${Math.sin(f / 7) * 14})`}>
            <path d="M0,0 L34,-30 L46,-14 Z" fill={E.washi} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* ── 事件: 星取りの板に「引分」「預り」の木札が下がる ── */}
        <g>
          <rect x={1420} y={470} width={470} height={300} fill={E.washi}
            stroke={KRP.ink} strokeWidth={7} />
          <rect x={1420} y={470} width={470} height={46} fill={E.woodDark} opacity={0.85} />
          {/* ○● の星の列 */}
          {[0, 1, 2].map((r) => (
            <g key={`st${r}`}>
              {[0, 1, 2, 3].map((c) => (
                c % 2 === 0
                  ? <circle key={`o${c}`} cx={1468 + c * 62} cy={558 + r * 46} r={18}
                    fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                  : <circle key={`b${c}`} cx={1468 + c * 62} cy={558 + r * 46} r={18} fill={KRP.ink} />
              ))}
            </g>
          ))}
          {/* 掛け金2つ + 落ちてくる木札 */}
          {[["引分", 1740], ["預り", 1836]].map(([tx, hx], i) => (
            <g key={`fd${i}`}>
              <circle cx={Number(hx)} cy={536} r={9} fill={E.woodDark}
                stroke={KRP.ink} strokeWidth={4} />
              <g transform={`translate(${Number(hx)} ${536 + drop * 92}) rotate(${(1 - drop) * (i ? 13 : -13)})`}
                opacity={clamp01(drop * 3)}>
                <line x1={0} y1={0} x2={0} y2={18} stroke={KRP.ink} strokeWidth={4} />
                <rect x={-34} y={18} width={68} height={126} rx={7} fill={E.wood}
                  stroke={KRP.ink} strokeWidth={5} />
                <text x={0} y={70} textAnchor="middle" fontFamily={FONT}
                  fontWeight={900} fontSize={42} fill={KRP.ink}>{String(tx)[0]}</text>
                <text x={0} y={120} textAnchor="middle" fontFamily={FONT}
                  fontWeight={900} fontSize={42} fill={KRP.ink}>{String(tx)[1]}</text>
              </g>
            </g>
          ))}
        </g>
        {/* 板のそばで読み上げる呼出 (人が反応する) */}
        <EdoPerson x={1620} y={930} s={0.92} f={f} phase={2} pose="raise"
          kind="shokunin" face="normal" gaze={[6, -6]} />
      </g>
      {/* 札は字幕2行 (帯の上端 y≈854) の上。第5章 #93 の札「白黒つけない」とも
          字幕の文言とも重ならない言い方にする (札の言い換えの法) */}
      <TagPlate x={960} y={250} text="軍配は上げない" size={40} t={seg(f, 8, 22)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #215 最後に、この旅の地図を広げましょう。戦場ひとつ、帝国、町、国、世界、同学年、地球全員。
// 格: 山 ★★抽象軸の最終形・最大の山
// ★2026-11-08 作り直し: 前は #202 #208 と同じ DeskBack (木の机 + 和紙) に輪を置くだけで、
//   作者の言う「同じ背景・同じ色使い」そのものだった。舞台を土蔵の「絵図の間」に移し、
//   地の色を藍と金に変え、軸で左右にほどける藍染めの布地図そのものを事件にした。
//   カメラは引き (z 1.22 → 1.0)。七段が開ききった全景に着地する。
// ------------------------------------------------------------------
const S215: React.FC<{ f: number }> = ({ f }) => {
  // 土蔵の色: 藍の布 + 金の金具 + 黒漆の台。#203(夕暮れ) #210(夜の藍) とは別の暗さにする
  const D = {
    kabe: "#7A6E5A", kabeLit: "#95896F", kabeDark: "#5E5445",
    hari: "#2E2A24", urushi: "#231F1A", urushiLit: "#3A332A",
    ai: "#243C62", aiLit: "#33527D", aiDeep: "#182A47",
    kin: "#C9A24C", kinLit: "#E4C77E",
    hikari: "#F7EDCB", take: "#C8B172",
  };
  // カメラ: 世界の (760,540) を画面の (qx,qy) に置いて z 倍。k=1 で等倍に戻る
  const k = easeOut(clamp01(seg(f, 0, 40)));
  const z = lerp(1.22, 1.0, k);
  const px = 760;
  const py = 540;
  const qx = lerp(960, 760, k);
  const qy = lerp(566, 540, k);
  // 布が左右にほどける量 (軸の位置)
  const open = easeOut(clamp01(seg(f, 2, 30)));
  const lrx = lerp(566, 150, open);
  const rrx = lerp(954, 1860, open);
  const cl = lrx + 17;
  const cr = rrx - 17;
  return (
    <Frame f={f} seed={1114} bg={D.urushi} dark>
      <defs>
        <linearGradient id="s215ai" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={D.aiLit} />
          <stop offset="55%" stopColor={D.ai} />
          <stop offset="100%" stopColor={D.aiDeep} />
        </linearGradient>
        <clipPath id="s215cloth">
          <rect x={cl} y={320} width={Math.max(0, cr - cl)} height={510} />
        </clipPath>
      </defs>
      <g transform={`translate(${qx - px * z} ${qy - py * z}) scale(${z})`}>
        {/* ===== 土蔵の奥壁 (荒い土壁) ===== */}
        <rect x={-320} y={-260} width={2560} height={560} fill={D.kabe} />
        <rect x={-320} y={236} width={2560} height={64} fill={D.kabeDark} opacity={0.55} />
        {/* 土壁の藁すじ */}
        {Array.from({ length: 56 }, (_, i) => {
          const ax = -300 + ((i * 229) % 2520);
          const ay = 104 + ((i * 73) % 128);
          return (
            <line key={i} x1={ax} y1={ay} x2={ax + 20 + (i % 3) * 10}
              y2={ay + 4 - (i % 2) * 9}
              stroke={D.kabeLit} strokeWidth={3} opacity={0.45} />
          );
        })}
        {/* 壁のひび */}
        <path d="M 330 300 q -22 -74 10 -126 q 26 -44 -6 -86" fill="none"
          stroke={D.kabeDark} strokeWidth={4} opacity={0.5} />
        <path d="M 1160 300 q 18 -60 -12 -108" fill="none"
          stroke={D.kabeDark} strokeWidth={4} opacity={0.4} />
        {/* ===== 梁 ===== */}
        <rect x={-320} y={10} width={2560} height={70} fill={D.hari} />
        <rect x={-320} y={66} width={2560} height={14} fill="#15120E" opacity={0.7} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={-200 + i * 320} y1={14} x2={-186 + i * 320} y2={62}
            stroke="#15120E" strokeWidth={4} opacity={0.4} />
        ))}
        {/* ===== 高窓 (格子) と差し込む光 ===== */}
        <g>
          <rect x={1382} y={104} width={238} height={148} fill={D.hikari} opacity={0.9} />
          <rect x={1382} y={104} width={238} height={148} fill="none"
            stroke={D.hari} strokeWidth={10} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={1382 + 60 + i * 59} y1={104} x2={1382 + 60 + i * 59} y2={252}
              stroke={D.hari} strokeWidth={7} />
          ))}
          <line x1={1382} y1={178} x2={1620} y2={178} stroke={D.hari} strokeWidth={7} />
        </g>
        {/* 光の帯 (窓から左下へ) */}
        <path d={`M 1382 252 L 1620 252 L 1178 ${830} L 806 ${830} Z`}
          fill={D.hikari} opacity={0.085} />
        {/* 光の中に舞う塵 */}
        {Array.from({ length: 22 }, (_, i) => {
          const t = ((f + i * 7) % 60) / 60;
          const dx = 1540 - t * 360 + (i % 5) * 46;
          const dy = 262 + t * 540;
          return (
            <circle key={i} cx={dx} cy={dy} r={2.6 + (i % 3)} fill={D.hikari}
              opacity={0.5 * (1 - Math.abs(t - 0.5) * 1.3)} />
          );
        })}
        {/* ===== 奥壁の前に置かれた旅の荷 ===== */}
        {/* 行李 (積み重ね) */}
        <g>
          <rect x={1672} y={196} width={212} height={104} fill={D.take}
            stroke={D.hari} strokeWidth={6} />
          <rect x={1696} y={120} width={168} height={82} fill={D.take} opacity={0.9}
            stroke={D.hari} strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={1672} y1={210 + i * 16} x2={1884} y2={210 + i * 16}
              stroke="#9E8A52" strokeWidth={3} opacity={0.6} />
          ))}
          <rect x={1744} y={120} width={30} height={180} fill={D.kin} opacity={0.65}
            stroke={D.hari} strokeWidth={5} />
        </g>
        {/* 笠と杖 */}
        <g>
          <path d="M 236 206 q 76 -96 152 0 z" fill={D.take}
            stroke={D.hari} strokeWidth={6} />
          <path d="M 268 206 q 44 -50 88 0" fill="none" stroke="#9E8A52" strokeWidth={4} />
          <line x1={436} y1={300} x2={472} y2={112} stroke="#8A6436" strokeWidth={11} />
          <line x1={436} y1={300} x2={472} y2={112} stroke={D.hari} strokeWidth={4} opacity={0.4} />
        </g>
        {/* ===== 黒漆の低い台 (床) ===== */}
        <rect x={-320} y={300} width={2560} height={1100} fill={D.urushi} />
        <rect x={-320} y={300} width={2560} height={16} fill={D.urushiLit} opacity={0.8} />
        {/* 漆の映り込み */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-200 + i * 430} y={880 + (i % 2) * 54} width={260} height={9}
            fill={D.kinLit} opacity={0.08} />
        ))}
        {/* ===== 主役: 軸で左右にほどける藍染めの布地図 ===== */}
        {/* 布の影 */}
        <rect x={cl} y={836} width={Math.max(0, cr - cl)} height={26}
          fill="#000" opacity={0.35} />
        {/* 布地 */}
        <rect x={cl} y={320} width={Math.max(0, cr - cl)} height={510}
          fill="url(#s215ai)" />
        <g clipPath="url(#s215cloth)">
          {/* 布目 (横の織り) */}
          {Array.from({ length: 26 }, (_, i) => (
            <line key={i} x1={cl} y1={328 + i * 20} x2={cr} y2={328 + i * 20}
              stroke={D.aiLit} strokeWidth={2} opacity={0.3} />
          ))}
          {/* 染め抜きの白い粒 */}
          {Array.from({ length: 70 }, (_, i) => (
            <circle key={i} cx={cl + ((i * 197) % 1700)} cy={330 + ((i * 101) % 496)}
              r={1.8 + (i % 2)} fill="#DCE6F0" opacity={0.3} />
          ))}
          {/* 折り目 (たたまれていた跡) */}
          {[0, 1, 2].map((i) => (
            <line key={i} x1={cl + 300 + i * 440} y1={320} x2={cl + 300 + i * 440} y2={830}
              stroke={D.aiDeep} strokeWidth={6} opacity={0.4} />
          ))}
          {/* 金の縁取り */}
          <rect x={cl + 14} y={334} width={Math.max(0, cr - cl - 28)} height={482}
            fill="none" stroke={D.kin} strokeWidth={5} opacity={0.75} />
          {/* ===== 七段の輪 (横に伸ばして地図らしく) ===== */}
          <DohyoRings f={f} n={7} cx={760} cy={575} r0={42} step={33} sx={1.45} grow />
          {/* ===== 右の凡例 (段の番号 + 色見本 + 名前) ===== */}
          {RING_LABEL.map((lb, i) => {
            const ly = 352 + i * 72;
            const t = clamp01(seg(f, 10 + i * 3, 24 + i * 3));
            return (
              <g key={i} opacity={t}>
                {/* 輪へ伸びる細い引き線 */}
                <line x1={1226} y1={ly} x2={760 + (42 + i * 33) * 1.45} y2={575}
                  stroke={RING_COL[i]} strokeWidth={3} opacity={0.35} />
                {/* 段の番号 (字幕にない情報) */}
                <text x={1142} y={ly + 15} textAnchor="end" fontFamily={FONT}
                  fontWeight={900} fontSize={38} fill={D.kinLit} opacity={0.85}>{i + 1}</text>
                {/* 色見本 */}
                <rect x={1160} y={ly - 24} width={48} height={48} rx={5}
                  fill={RING_COL[i]} stroke={D.kin} strokeWidth={4} />
                {/* 名前 (布に縫い付けた白い札) */}
                <rect x={1232} y={ly - 30} width={392} height={60} rx={6}
                  fill="#F2EADA" stroke={D.hari} strokeWidth={5} />
                <text x={1254} y={ly + 15} fontFamily={FONT}
                  fontWeight={900} fontSize={40} fill={C.ink}>{lb}</text>
              </g>
            );
          })}
        </g>
        {/* ===== 左右の軸 (木軸 + 金の冠金具) ===== */}
        {[lrx, rrx].map((rx, i) => (
          <g key={i}>
            <rect x={rx - 17} y={296} width={34} height={558} rx={10}
              fill="#8A6436" stroke={D.hari} strokeWidth={6} />
            <rect x={rx - 6} y={300} width={9} height={550} fill={D.kinLit} opacity={0.35} />
            <ellipse cx={rx} cy={296} rx={28} ry={13} fill={D.kin}
              stroke={D.hari} strokeWidth={5} />
            <ellipse cx={rx} cy={858} rx={28} ry={13} fill={D.kin}
              stroke={D.hari} strokeWidth={5} />
          </g>
        ))}
        {/* 四隅の文鎮 (真鍮の重し) */}
        {[[cl + 54, 342], [cr - 54, 342], [cl + 54, 812], [cr - 54, 812]].map((p, i) => (
          <g key={i} opacity={open}>
            <rect x={p[0] - 44} y={p[1] - 11} width={88} height={22} rx={8}
              fill={D.kin} stroke={D.hari} strokeWidth={5} />
            <rect x={p[0] - 44} y={p[1] - 11} width={88} height={7} fill={D.kinLit} opacity={0.7} />
          </g>
        ))}
        {/* ===== 人: 指示棒で七段を指す ===== */}
        <Person x={250} y={1012} s={1.06} pose="point" pointDir={1} face="smile"
          cloth="#B9674A" clothDark="#8E4D34" gaze={[8, -6]} lean={3} f={f} />
        {/* 竹の指示棒 (手から輪のきわへ) */}
        <g opacity={clamp01(seg(f, 12, 24))}>
          <line x1={406} y1={862} x2={704} y2={638 + Math.sin(f / 9) * 8}
            stroke={D.take} strokeWidth={10} strokeLinecap="round" />
          <line x1={406} y1={862} x2={704} y2={638 + Math.sin(f / 9) * 8}
            stroke={D.hari} strokeWidth={3} opacity={0.4} />
          <circle cx={704} cy={638 + Math.sin(f / 9) * 8} r={9}
            fill={D.kinLit} stroke={D.hari} strokeWidth={4} />
        </g>
      </g>
      {/* 札は字幕2行 (帯の上端 y≈854) のはるか上。段の「数」を足す (札の言い換えの法) */}
      <TagPlate x={980} y={168} text="ぜんぶで 七段" size={44} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #216 土俵はここまで広がりましたが、どれも人間が作った輪にすぎません。
// 格: 山 ★2026-11-08 に 並 → 山 へ引き上げ
// ★2026-11-08 二度目の作り直し: 一度目は鍛冶場にしたが、
//   (1) 直前の #215 が暗い屋内なので、暗い屋内が二枚つづいてしまう
//   (2) #210 #211 がすでに工房なので、工房はこれで三度目になる
//   という二重の重なりがあった。言いたいこと「輪は人の手が曲げて結んだ物」は残したまま、
//   舞台を「真昼の畳の間」へ移した。地の色は障子の白 + い草の黄緑 + 栗色の木で、
//   暗い屋内 (#215) にも 明るい屋外 (#217) にも見えない三つめの明るさにしてある。
//   火も鉄も空も出さないので、#203 の夕暮れ・#214 の青空・#217 の翠の川とも別系統。
//   カメラは寄り (z 1.0 → 1.14)。輪の継ぎ目に寄っていく。
// ------------------------------------------------------------------
const S216: React.FC<{ f: number }> = ({ f }) => {
  // 畳の間の色。白・黄緑・栗色の三色で、この章のどの絵とも重ならない
  const T = {
    ink: "#3A3A34",
    shoji: "#F6F1E0", shojiLit: "#FFFCF2", shojiShade: "#E2DAC4",
    sash: "#C9A878", sashDark: "#9E7C4E",
    post: "#8A6A46", postDark: "#654A2E",
    plaster: "#E9E0C8", plasterDark: "#C8BB99",
    tatami: "#C4C782", tatamiLit: "#D6D898", tatamiDark: "#9DA25C",
    heri: "#3E5E52", heriLit: "#6E8E7E",
    bamboo: "#CBB96C", bambooLit: "#E8DBA2", bambooDark: "#9A8840",
  };
  const k = easeOut(clamp01(seg(f, 0, 40)));
  const z = lerp(1, 1.14, k);
  const px = 960;
  const py = 600;
  const qx = lerp(960, 944, k);
  const qy = lerp(600, 584, k);
  const sx = (wx: number) => qx + (wx - px) * z;
  const sy = (wy: number) => qy + (wy - py) * z;
  // 障子ごしの枝のゆれ (影だけが動く)
  const brz = Math.sin(f / 17) * 14;
  // 畳の遠近。消失点 (960, 620) から手前へ広がる
  const vpx = 960;
  const vpy = 620;
  const seamX = (bx: number, y: number) => vpx + (bx - vpx) * ((y - vpy) / (1160 - vpy));

  // 竹を曲げて作った輪。継ぎ目の縄だけは必ず見せる (= 人の手が作った証拠)
  // ※この文だけで使う内側の部品。背景の使い回しではない (からくり憲法 第13条)
  const bamboo = (
    i: number, cx: number, cy: number, r: number, tilt: number, rot: number,
    seamA: number, t: number,
  ) => {
    const th = Math.max(10, r * 0.15);
    const spx = cx + Math.cos(seamA) * r;
    const spy = cy + Math.sin(seamA) * r * tilt;
    const tang = (Math.atan2(tilt * Math.cos(seamA), -Math.sin(seamA)) * 180) / Math.PI;
    return (
      <g key={`br${i}`} opacity={t}>
        {/* 畳に落ちる影 (光は障子の側=奥から来るので手前に落ちる) */}
        <ellipse cx={cx + 20} cy={cy + r * tilt + 14} rx={r * 0.92} ry={r * 0.17}
          fill={T.ink} opacity={0.13} />
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * tilt} fill="none"
            stroke={T.ink} strokeWidth={th + 11} />
          <ellipse cx={cx} cy={cy} rx={r} ry={r * tilt} fill="none"
            stroke={T.bamboo} strokeWidth={th} />
          <ellipse cx={cx} cy={cy} rx={r - th * 0.3} ry={(r - th * 0.3) * tilt} fill="none"
            stroke={T.bambooLit} strokeWidth={th * 0.26} opacity={0.75} />
          <ellipse cx={cx} cy={cy} rx={r + th * 0.3} ry={(r + th * 0.3) * tilt} fill="none"
            stroke={T.bambooDark} strokeWidth={th * 0.2} opacity={0.5} />
          {/* 竹の節 */}
          {Array.from({ length: 8 }, (_, j) => {
            const a = seamA + 0.78 + (j / 8) * Math.PI * 2;
            const nx = Math.cos(a) * r;
            const ny = Math.sin(a) * r * tilt;
            const na = (Math.atan2(tilt * Math.cos(a), -Math.sin(a)) * 180) / Math.PI;
            return (
              <g key={j} transform={`translate(${cx + nx} ${cy + ny}) rotate(${na})`}>
                <line x1={0} y1={-th * 0.52} x2={0} y2={th * 0.52}
                  stroke={T.bambooDark} strokeWidth={4} opacity={0.75} />
              </g>
            );
          })}
          {/* 継ぎ目を縄で巻いたところ。縄の色は #215 の七段の色をそのまま使う */}
          <g transform={`translate(${spx} ${spy}) rotate(${tang})`}>
            <rect x={-th * 1.2} y={-th * 0.68} width={th * 2.4} height={th * 1.36} rx={5}
              fill={RING_COL[i]} stroke={T.ink} strokeWidth={4.5} />
            {[-0.66, -0.22, 0.22, 0.66].map((u, j) => (
              <line key={j} x1={u * th * 2.2} y1={-th * 0.68} x2={u * th * 2.2} y2={th * 0.68}
                stroke={T.ink} strokeWidth={3} opacity={0.45} />
            ))}
            {/* 結んだ余りの紐 */}
            <path d={`M ${th * 1.1} ${th * 0.2} q ${th * 0.8} ${th * 0.7} ${th * 1.9} ${th * 0.4}`}
              fill="none" stroke={RING_COL[i]} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      </g>
    );
  };

  return (
    <Frame f={f} seed={1115} bg={T.shoji}>
      <defs>
        <linearGradient id="s216sho" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.shojiShade} />
          <stop offset="0.42" stopColor={T.shojiLit} />
          <stop offset="1" stopColor={T.shoji} />
        </linearGradient>
        <linearGradient id="s216ray" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFFBEA" stopOpacity={0.5} />
          <stop offset="1" stopColor="#FFFBEA" stopOpacity={0.04} />
        </linearGradient>
        <linearGradient id="s216tat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.tatamiDark} />
          <stop offset="0.3" stopColor={T.tatami} />
          <stop offset="1" stopColor={T.tatamiLit} />
        </linearGradient>
      </defs>
      <g transform={`translate(${qx - px * z} ${qy - py * z}) scale(${z})`}>
        {/* ===== 小壁と長押 (障子の上) ===== */}
        <rect x={-300} y={-260} width={2520} height={1620} fill={T.plaster} />
        {Array.from({ length: 24 }, (_, i) => (
          <path key={`ps${i}`} d={`M ${-260 + i * 106} -40 q 18 70 2 160`}
            fill="none" stroke={T.plasterDark} strokeWidth={9} opacity={0.22} />
        ))}
        <rect x={-300} y={168} width={2520} height={52} fill={T.post}
          stroke={T.postDark} strokeWidth={6} />
        <rect x={-300} y={168} width={2520} height={13} fill="#A88A64" opacity={0.7} />
        <rect x={-300} y={126} width={2520} height={42} fill={T.plasterDark} opacity={0.3} />
        {/* ===== 障子 (逆光でいちばん明るい面) ===== */}
        <rect x={190} y={220} width={1540} height={478} fill="url(#s216sho)" />
        {[0, 1, 2, 3, 4].map((p) => {
          const x0 = 210 + p * 300;
          return (
            <g key={`sj${p}`}>
              <rect x={x0} y={226} width={286} height={466} fill="url(#s216sho)"
                stroke={T.sash} strokeWidth={11} />
              {[1, 2].map((m) => (
                <line key={`m${m}`} x1={x0 + m * 95} y1={226} x2={x0 + m * 95} y2={692}
                  stroke={T.sash} strokeWidth={6} />
              ))}
              {Array.from({ length: 6 }, (_, h) => (
                <line key={`h${h}`} x1={x0} y1={226 + (h + 1) * 66} x2={x0 + 286} y2={226 + (h + 1) * 66}
                  stroke={T.sash} strokeWidth={6} />
              ))}
              <rect x={x0} y={226} width={286} height={466} fill="none"
                stroke={T.sashDark} strokeWidth={4} opacity={0.5} />
            </g>
          );
        })}
        {/* 障子にうつる枝の影 (外の木。ゆれるので画がとまらない) */}
        <g opacity={0.17} stroke={T.postDark} fill="none" strokeLinecap="round">
          <path d={`M 1736 250 q -180 ${70 + brz} -330 ${150 + brz * 1.4} q -140 ${78 + brz} -244 ${232}`}
            strokeWidth={13} />
          {([[1570, 330], [1430, 414], [1310, 500], [1232, 590]] as Array<[number, number]>)
            .map(([lx, ly], i) => (
              <g key={`lf${i}`}>
                <path d={`M ${lx} ${ly} q ${34 + brz} -34 ${74 + brz} -16`} strokeWidth={9} />
                <path d={`M ${lx} ${ly} q ${-26 - brz} 36 ${-70 - brz} 24`} strokeWidth={9} />
              </g>
            ))}
        </g>
        {/* ===== 柱と敷居 ===== */}
        <rect x={150} y={168} width={58} height={540} fill={T.post}
          stroke={T.postDark} strokeWidth={6} />
        <rect x={150} y={168} width={16} height={540} fill="#A88A64" opacity={0.6} />
        <rect x={1712} y={168} width={58} height={540} fill={T.post}
          stroke={T.postDark} strokeWidth={6} />
        <rect x={1712} y={168} width={16} height={540} fill="#A88A64" opacity={0.6} />
        <rect x={-300} y={692} width={2520} height={32} fill={T.post}
          stroke={T.postDark} strokeWidth={6} />
        {/* ===== 畳 ===== */}
        <rect x={-300} y={720} width={2520} height={640} fill="url(#s216tat)" />
        {/* い草の目 */}
        {Array.from({ length: 34 }, (_, i) => (
          <line key={`ig${i}`} x1={-300} y1={728 + i * 13} x2={2220} y2={728 + i * 13}
            stroke={T.tatamiDark} strokeWidth={2.5} opacity={0.3} />
        ))}
        {/* 奥へ走る畳縁 (遠近) */}
        {[-480, 40, 560, 1080, 1600, 2120].map((bx, i) => {
          const xa = seamX(bx, 722);
          const xb = seamX(bx, 1160);
          return (
            <polygon key={`sm${i}`}
              points={`${xa - 4},722 ${xa + 4},722 ${xb + 18},1160 ${xb - 18},1160`}
              fill={T.heri} opacity={0.85} />
          );
        })}
        {/* 横に走る畳縁 (手前ほど太い) */}
        {([[722, 12], [800, 15], [906, 19], [1052, 26]] as Array<[number, number]>).map(
          ([hy, hh], i) => (
            <g key={`hb${i}`}>
              <rect x={-300} y={hy} width={2520} height={hh} fill={T.heri} />
              <rect x={-300} y={hy} width={2520} height={hh * 0.3} fill={T.heriLit} opacity={0.6} />
              {Array.from({ length: 46 }, (_, j) => (
                <line key={j} x1={-280 + j * 56} y1={hy} x2={-280 + j * 56} y2={hy + hh}
                  stroke={T.heriLit} strokeWidth={3} opacity={0.35} />
              ))}
            </g>
          )
        )}
        {/* ===== 障子からの光の帯 + 埃 ===== */}
        {([[262, 548, 700], [862, 1148, 1340], [1420, 1706, 1960]] as
          Array<[number, number, number]>).map(([ax, bx2, cx2], i) => (
            <polygon key={`ry${i}`}
              points={`${ax},700 ${bx2},700 ${cx2 + 120},1160 ${cx2 - 280},1160`}
              fill="url(#s216ray)" opacity={0.9 - i * 0.12} />
          ))}
        {Array.from({ length: 26 }, (_, i) => {
          const dx = 240 + ((i * 163) % 1540);
          const dy = 740 + (((i * 97) % 300) + Math.sin((f + i * 11) / 15) * 16);
          return (
            <circle key={`ds${i}`} cx={dx} cy={dy} r={2.6 + (i % 3)}
              fill="#FFFBEA" opacity={0.55} />
          );
        })}
        {/* ===== 大小七つの竹の輪 (#215 の七段を、人が作った物として並べ直した) ===== */}
        {bamboo(6, 392, 700, 200, 1, -4, 0.62, clamp01(seg(f, 2, 16)))}
        {bamboo(5, 730, 744, 160, 1, 5, 0.26, clamp01(seg(f, 5, 19)))}
        {bamboo(4, 218, 880, 112, 0.3, 0, -0.5, clamp01(seg(f, 8, 22)))}
        {bamboo(3, 470, 900, 88, 0.3, 0, -1.9, clamp01(seg(f, 11, 25)))}
        {bamboo(2, 648, 912, 66, 0.3, 0, -0.9, clamp01(seg(f, 14, 28)))}
        {bamboo(1, 880, 918, 48, 0.3, 0, -2.4, clamp01(seg(f, 17, 31)))}
        {/* ===== 作り手 (継ぎ目を指さす) ===== */}
        <Person x={1060} y={950} s={1.1} pose="point" pointDir={-1} face="normal"
          cloth={C.terracotta} clothDark="#8E4D34" gaze={[-9, 1]} lean={-3} f={f} />
        {/* 指さした先の継ぎ目に、見てほしい丸 */}
        <g opacity={clamp01(seg(f, 20, 32))}>
          <circle cx={884} cy={786} r={46 + Math.sin(f / 8) * 4} fill="none"
            stroke={C.red} strokeWidth={6} opacity={0.75} />
        </g>
        {/* ===== 弟子 (いちばん小さい輪を光にかざす = 事件) ===== */}
        <Person x={1500} y={964} s={1.12} pose="raise" face="smile"
          cloth={C.laurel} clothDark={C.laurelDark} gaze={[2, -8]} f={f} phase={2} />
        {bamboo(0, 1575, 664, 46, 0.95, 12, 1.1, clamp01(seg(f, 12, 26)))}
        {/* かざした輪を光が抜ける */}
        <g opacity={clamp01(seg(f, 18, 34)) * 0.5}>
          <polygon points="1535,620 1618,620 1700,1000 1452,1000" fill="#FFFBEA" />
        </g>
        {/* 弟子の足もとに、まだ巻いていない縄と小刀 */}
        <g>
          <path d={`M 1300 946 q 62 ${-26 + Math.sin(f / 12) * 4} 128 6 q 56 26 118 -8`}
            fill="none" stroke="#C9A878" strokeWidth={11} strokeLinecap="round" />
          <path d={`M 1300 946 q 62 ${-26 + Math.sin(f / 12) * 4} 128 6 q 56 26 118 -8`}
            fill="none" stroke="#9E7C4E" strokeWidth={4} opacity={0.6} strokeDasharray="12 10" />
          <g transform="rotate(-14 1232 924)">
            <rect x={1182} y={916} width={62} height={15} rx={4} fill="#6A4E31"
              stroke={T.ink} strokeWidth={4.5} />
            <polygon points="1244,909 1304,918 1244,931" fill="#C9CBCF"
              stroke={T.ink} strokeWidth={4.5} />
          </g>
        </g>
      </g>
      {/* 引き出し線 (画面座標)。左は輪の山へ、右はかざした輪へ */}
      <g opacity={clamp01(seg(f, 22, 34))} stroke={T.postDark} strokeWidth={3}
        strokeDasharray="10 8" fill="none">
        <path d={`M 350 336 L ${sx(392)} ${sy(506)}`} />
        <path d={`M 1570 336 L ${sx(1575)} ${sy(620)}`} />
      </g>
      {/* 札は字幕にない「いくつ・どう作ったか」を足す (札の言い換えの法)。
          左右1対なので高さと大きさをそろえる (検査4) */}
      <TagPlate x={350} y={300} text="大小 七つ" size={40} t={seg(f, 20, 34)} />
      <TagPlate x={1570} y={300} text="竹を曲げて 結んだ" size={40} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #217 人間が作った輪なら、選ぶことも、降りることも、作り直すこともできます。
// 格: 山
// ★2026-11-08 作り直し: 前は削除した Koubou (板壁の工房) を使っていて、#210 #211 と
//   三枚つづけて同じ板壁・同じ木の色だった。結びの一文なので、屋内の暗さから出て
//   朝の川原へ。地の色は翠の流れと灰白の石で、ここまでの橙・藍・朱とは完全に別系統。
//   カメラは下へのティルト (空から河原へ)。選ぶ・降りる・作り直すを三人の手で見せる。
// ------------------------------------------------------------------
const S217: React.FC<{ f: number }> = ({ f }) => {
  const R = {
    sky: "#C6DCE4", skyLow: "#E8EFEA", cloud: "#F4F8F6",
    cedar: "#4E6A62", cedarDark: "#3A5048",
    reed: "#A8B86A", reedDark: "#778A4C",
    water: "#4E8E8E", waterLit: "#7FB4AE", waterDeep: "#2F6A6A", foam: "#EDF5F2",
    shingle: "#C8C6BC", shingleLit: "#DEDCD2", shingleDark: "#9C9A90",
    sand: "#CFC6AC",
  };
  const k = easeOut(clamp01(seg(f, 0, 40)));
  const z = 1.04;
  const px = 960;
  const py = 540;
  const qx = 960;
  const qy = lerp(500, 548, k);
  // 三つの出来事の進み
  const t1 = easeOut(clamp01(seg(f, 6, 22)));
  const t2 = easeOut(clamp01(seg(f, 14, 32)));
  const t3 = easeOut(clamp01(seg(f, 22, 40)));
  return (
    <Frame f={f} seed={1116} bg={R.skyLow}>
      <defs>
        <linearGradient id="s217sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={R.sky} />
          <stop offset="100%" stopColor={R.skyLow} />
        </linearGradient>
        <linearGradient id="s217riv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={R.waterDeep} />
          <stop offset="55%" stopColor={R.water} />
          <stop offset="100%" stopColor={R.waterLit} />
        </linearGradient>
      </defs>
      <g transform={`translate(${qx - px * z} ${qy - py * z}) scale(${z})`}>
        {/* ===== 朝の空 ===== */}
        <rect x={-200} y={-200} width={2320} height={400} fill="url(#s217sky)" />
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={0.75}>
            <ellipse cx={320 + i * 620} cy={62 + (i % 2) * 44} rx={196} ry={20} fill={R.cloud} />
            <ellipse cx={420 + i * 620} cy={84 + (i % 2) * 36} rx={132} ry={14} fill={R.cloud} />
          </g>
        ))}
        {/* ===== 対岸の杉並木 ===== */}
        {Array.from({ length: 24 }, (_, i) => {
          const tx = -120 + i * 92;
          const th = 86 + ((i * 37) % 54);
          return (
            <path key={i} d={`M ${tx} 224 L ${tx + 30} ${224 - th} L ${tx + 60} 224 Z`}
              fill={i % 3 === 0 ? R.cedarDark : R.cedar} opacity={0.85} />
          );
        })}
        <rect x={-200} y={214} width={2320} height={22} fill={R.cedarDark} opacity={0.6} />
        {/* ===== 対岸の葦 (風で揺れる) ===== */}
        {Array.from({ length: 46 }, (_, i) => {
          const ax = -140 + i * 48;
          const sw = Math.sin((f + i * 13) / 11) * 11;
          return (
            <g key={i}>
              <path d={`M ${ax} 300 q ${sw} -46 ${sw * 1.6 + 6} -96`} fill="none"
                stroke={i % 2 ? R.reed : R.reedDark} strokeWidth={5} />
              <ellipse cx={ax + sw * 1.6 + 6} cy={200} rx={5} ry={14}
                fill={R.reedDark} opacity={0.8}
                transform={`rotate(${sw} ${ax + sw * 1.6 + 6} 200)`} />
            </g>
          );
        })}
        {/* ===== 中州の砂 ===== */}
        <rect x={-200} y={292} width={2320} height={40} fill={R.sand} />
        <rect x={-200} y={292} width={2320} height={10} fill={R.shingleLit} opacity={0.6} />
        {/* ===== 川 ===== */}
        <rect x={-200} y={326} width={2320} height={130} fill="url(#s217riv)" />
        {/* 流れの筋 */}
        {Array.from({ length: 9 }, (_, i) => {
          const wy = 338 + i * 14;
          const sh = ((f * 2.2 + i * 40) % 180) - 90;
          return (
            <path key={i}
              d={`M -200 ${wy} q 90 ${-7 + (i % 2) * 14} 180 0 q 90 ${7 - (i % 2) * 14} 180 0 q 90 ${-7 + (i % 2) * 14} 180 0 q 90 ${7 - (i % 2) * 14} 180 0 q 90 ${-7 + (i % 2) * 14} 180 0 q 90 ${7 - (i % 2) * 14} 180 0 q 90 ${-7 + (i % 2) * 14} 180 0 q 90 ${7 - (i % 2) * 14} 180 0 q 90 ${-7 + (i % 2) * 14} 180 0 q 90 ${7 - (i % 2) * 14} 180 0 q 90 ${-7 + (i % 2) * 14} 180 0 q 90 ${7 - (i % 2) * 14} 180 0 q 90 ${-7 + (i % 2) * 14} 180 0`}
              fill="none" stroke={i % 2 ? R.waterLit : R.waterDeep} strokeWidth={4}
              opacity={0.45} transform={`translate(${sh} 0)`} />
          );
        })}
        {/* きらめき */}
        {Array.from({ length: 30 }, (_, i) => {
          const gx = -140 + ((i * 233) % 2240);
          const gy = 334 + ((i * 47) % 112);
          const a = 0.3 + 0.7 * Math.abs(Math.sin((f + i * 9) / 6));
          return <ellipse key={i} cx={gx} cy={gy} rx={13} ry={3} fill={R.foam} opacity={a * 0.75} />;
        })}
        {/* 飛び石 (川の中) */}
        {[[620, 392, 40], [704, 420, 36], [788, 444, 32]].map((s, i) => (
          <g key={i}>
            <ellipse cx={s[0]} cy={s[1] + 8} rx={s[2] + 16} ry={9} fill={R.foam} opacity={0.65} />
            <ellipse cx={s[0]} cy={s[1]} rx={s[2]} ry={s[2] * 0.42}
              fill={R.shingle} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={s[0] - 6} cy={s[1] - 5} rx={s[2] * 0.6} ry={s[2] * 0.2}
              fill={R.shingleLit} opacity={0.8} />
          </g>
        ))}
        {/* 半分沈んだ流木 */}
        <g>
          <path d="M 1180 418 q 170 -26 330 6 l -6 30 q -166 -28 -326 0 Z"
            fill="#8A6436" stroke={C.ink} strokeWidth={6} />
          <ellipse cx={1346} cy={452} rx={176} ry={14} fill={R.foam} opacity={0.5} />
        </g>
        {/* ===== 水際 ===== */}
        <rect x={-200} y={450} width={2320} height={56} fill={R.shingleDark} opacity={0.55} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${-150 + i * 140} 458 q 48 ${12 + (i % 3) * 5} 100 0`}
            fill="none" stroke={R.foam} strokeWidth={6} opacity={0.75} />
        ))}
        {/* ===== 河原の玉石 ===== */}
        <rect x={-200} y={498} width={2320} height={700} fill={R.shingle} />
        {Array.from({ length: 170 }, (_, i) => {
          const gx = -160 + ((i * 331) % 2260);
          const gy = 504 + ((i * 97) % 580);
          const rr = 8 + ((i * 13) % 30);
          const col = i % 3 === 0 ? R.shingleDark : i % 3 === 1 ? R.shingleLit : R.sand;
          return (
            <ellipse key={i} cx={gx} cy={gy} rx={rr} ry={rr * 0.62} fill={col}
              stroke={C.ink} strokeWidth={i % 4 === 0 ? 3 : 0} opacity={0.8} />
          );
        })}
        {/* ===== 左: 三つのうち一つを選び取る ===== */}
        <g>
          {/* 平たい石の台 */}
          <ellipse cx={540} cy={828} rx={176} ry={46} fill={R.shingleDark}
            stroke={C.ink} strokeWidth={6} />
          <ellipse cx={540} cy={818} rx={170} ry={40} fill={R.shingleLit} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${430 + i * 86} 800 q 34 ${8 + i * 4} 66 ${-4 - i * 3}`}
              fill="none" stroke={R.shingleDark} strokeWidth={4} opacity={0.55} />
          ))}
          {/* 立てかけた三つの輪 (選ばれなかったほう) */}
          <g opacity={0.95}>
            <WoodRing cx={444} cy={756} r={58} tiltY={1} rot={-9} />
            <WoodRing cx={548} cy={762} r={54} tiltY={1} rot={6} />
            <WoodRing cx={648} cy={766} r={50} tiltY={1} rot={-4} />
          </g>
          {/* 選び取られて持ち上がる輪 */}
          <g transform={`translate(0 ${-t1 * 70})`}>
            <WoodRing cx={318} cy={780} r={66} tiltY={0.95} rot={10 + (1 - t1) * 12} />
          </g>
          {/* 人 (手を挙げて輪を掲げる) */}
          <Person x={250} y={1012} s={1.04} pose="raise" face="smile"
            cloth="#B9674A" clothDark="#8E4D34" gaze={[6, -8]} f={f} />
        </g>
        {/* ===== 中: 輪の外へ足を踏み出す ===== */}
        <g>
          {/* 地面に置かれた輪 */}
          <ellipse cx={900} cy={862} rx={188} ry={58} fill={C.ink} opacity={0.12} />
          <WoodRing cx={900} cy={850} r={180} tiltY={0.3} />
          {/* 輪の内側の砂 (踏み慣らされた跡) */}
          <ellipse cx={900} cy={850} rx={156} ry={44} fill={R.sand} opacity={0.5} />
          {/* 外へ出ていく足跡 */}
          {[[966, 872, 0.3], [1040, 882, 0.6], [1112, 890, 1]].map((p, i) => (
            <ellipse key={i} cx={p[0]} cy={p[1]} rx={31 - i * 2} ry={13}
              fill={R.shingleDark} stroke={C.ink} strokeWidth={4}
              opacity={t2 * p[2] * 0.85} />
          ))}
          {/* 人 (輪の縁から外へ) */}
          <g transform={`translate(${t2 * 232} 0)`}>
            <Person x={880} y={884} s={0.96} pose="stand" face="smile"
              cloth="#C9A84C" clothDark="#9A7E34" gaze={[10, 0]} lean={5} f={f} phase={1} />
          </g>
        </g>
        {/* ===== 右: 割れた輪を組み直す ===== */}
        <g>
          {/* 作業の石 */}
          <ellipse cx={1596} cy={846} rx={210} ry={52} fill={R.shingleDark}
            stroke={C.ink} strokeWidth={6} />
          <ellipse cx={1596} cy={836} rx={204} ry={46} fill={R.shingleLit} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${1430 + i * 92} 818 q 36 ${10 - i * 4} 70 ${-6 + i * 3}`}
              fill="none" stroke={R.shingleDark} strokeWidth={4} opacity={0.5} />
          ))}
          {/* 削った木屑のたまり */}
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={`c${i}`} d={`M ${1452 + i * 26} ${858 + (i % 2) * 10} q 14 -9 28 0`}
              fill="none" stroke={C.woodDark} strokeWidth={4} opacity={0.7} />
          ))}
          {/* 割れた輪 (broken は輪郭線を描かないので、下に黒を敷いて縁取りにする) */}
          <g transform="rotate(-8 1596 742)" fill="none" stroke={C.ink}
            strokeLinecap="round" strokeWidth={94 * 0.19 + 11}>
            <path d={`M ${1596 - 94} 742 A 94 94 0 0 1 ${1596 + 94 * 0.3} ${742 - 94 * 0.95}`} />
            <path d={`M ${1596 + 94 * 0.62} ${742 + 94 * 0.78} A 94 94 0 0 1 ${1596 - 94 * 0.5} ${742 + 94 * 0.86}`} />
          </g>
          <WoodRing cx={1596} cy={742} r={94} tiltY={1} broken rot={-8} />
          {/* 欠けていた弧が、振り戻って元の位置へはまる */}
          <g opacity={clamp01(t3 * 1.4)}
            transform={`rotate(${-8 + (1 - t3) * 54} 1596 742)`}>
            <path d={`M ${1596 + 94 * 0.3} ${742 - 94 * 0.95} A 94 94 0 0 1 ${1596 + 94 * 0.62} ${742 + 94 * 0.78}`}
              fill="none" stroke={C.ink} strokeWidth={94 * 0.19 + 11} strokeLinecap="round" />
            <path d={`M ${1596 + 94 * 0.3} ${742 - 94 * 0.95} A 94 94 0 0 1 ${1596 + 94 * 0.62} ${742 + 94 * 0.78}`}
              fill="none" stroke={C.wood} strokeWidth={94 * 0.19} strokeLinecap="round" />
          </g>
          {/* 飛ぶ木屑 */}
          {Array.from({ length: 5 }, (_, i) => {
            const tt = ((f + i * 8) % 30) / 30;
            return (
              <path key={i}
                d={`M ${1520 + i * 34 - tt * 40} ${790 - tt * 90} q 13 -9 26 0`}
                fill="none" stroke={C.woodDark} strokeWidth={4} opacity={(1 - tt) * 0.8} />
            );
          })}
          {/* 人 (木槌を構える) */}
          <Person x={1744} y={972} s={0.98} pose="hold" face="normal"
            cloth="#4A7A96" clothDark="#355E76" gaze={[-12, -4]} f={f} phase={3} />
          <g transform={`translate(1744 858) rotate(${-124 + Math.sin(f / 5) * 18})`}>
            <rect x={0} y={-8} width={118} height={16} rx={7} fill="#7A5A38"
              stroke={C.ink} strokeWidth={5} />
            <rect x={116} y={-30} width={62} height={60} rx={9} fill={C.wood}
              stroke={C.ink} strokeWidth={6} />
            <line x1={116} y1={-2} x2={178} y2={-2} stroke={C.woodDark}
              strokeWidth={4} opacity={0.5} />
          </g>
        </g>
      </g>
      {/* 引き出し線 (三本とも同じ高さから下へ) */}
      <g opacity={clamp01(seg(f, 16, 30)) * 0.5} stroke={C.ink} strokeWidth={3}
        strokeDasharray="9 8" fill="none">
        <path d="M 330 586 L 330 690" />
        <path d="M 950 586 L 924 780" />
        <path d="M 1580 586 L 1592 670" />
      </g>
      {/* 三つの札は同じ高さ・同じ大きさ。字幕の「選ぶ/降りる/作り直す」の言い換えで、
          数・位置・理由を足す (札の言い換えの法。読点は使わず半角あき) */}
      <TagPlate x={330} y={560} text="三つから ひとつ" size={40} t={seg(f, 12, 26)} />
      <TagPlate x={950} y={560} text="外にも 地面" size={40} t={seg(f, 20, 34)} />
      <TagPlate x={1580} y={560} text="割れても 直せる" size={40} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #218 勝ちたい気持ちは、あなたのものです。
// 格: 山 ★2026-11-08 に 並 → 山 へ引き上げ
// ★作り直し: 前は DawnSky (夜明けの丘) の上に人と炎を置くだけで、#219 と同じ背景部品を
//   二枚つづけて使っていた (からくり憲法 第13条 1文1演出の法にふれる)。
//   舞台を「夜明け前の畦道」に描き直し、空を藤色→薄桃にした。
//   #203 の夕暮れ (藍→橙) とは色の系統がちがい、空が藤色なので夕方には見えない。
//   直前の #217 が明るい昼の川原、次の #219 が真昼の野なので、ここだけ薄明にして
//   明るさの波を作る。事件は「突風。草は全部ねるが、炎は傾くだけで消えない」。
//   カメラは寄り (z 1.0 → 1.12)。
// ------------------------------------------------------------------
const S218: React.FC<{ f: number }> = ({ f }) => {
  // 薄明の色。藤色と薄桃で、この章のどの絵とも重ならない
  const D = {
    ink: "#3A3A34",
    sky1: "#6F62A0", sky2: "#8E7FB4", sky3: "#B899BE", sky4: "#E6B6BE", sky5: "#F2D2BE",
    star: "#F6F0DC",
    town: "#55487A", townLit: "#6E5F94", lamp: "#F2C860",
    mist: "#D8CCDE",
    water: "#9A8FB8", waterLit: "#D8BCC2", waterDark: "#6F6794",
    bund: "#6E6150", bundLit: "#93826A", bundDark: "#4E4438",
    grass: "#4A4452", grassLit: "#6E6878",
  };
  const k = easeOut(clamp01(seg(f, 0, 40)));
  const z = lerp(1, 1.12, k);
  const px = 960;
  const py = 720;
  const qx = 960;
  const qy = lerp(720, 700, k);
  const sx = (wx: number) => qx + (wx - px) * z;
  const sy = (wy: number) => qy + (wy - py) * z;
  // 突風。f=45 では吹き抜けている最中
  const gust = 0.5 + 0.5 * Math.sin(f / 6);
  const bend = 14 + gust * 16;
  const tilt = -(9 + gust * 9);
  return (
    <Frame f={f} seed={1117} bg={D.sky2}>
      <defs>
        <linearGradient id="s218sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={D.sky1} />
          <stop offset="0.34" stopColor={D.sky2} />
          <stop offset="0.66" stopColor={D.sky3} />
          <stop offset="0.88" stopColor={D.sky4} />
          <stop offset="1" stopColor={D.sky5} />
        </linearGradient>
        <linearGradient id="s218wat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={D.waterLit} />
          <stop offset="1" stopColor={D.waterDark} />
        </linearGradient>
      </defs>
      <g transform={`translate(${qx - px * z} ${qy - py * z}) scale(${z})`}>
        {/* ===== 空 ===== */}
        <rect x={-300} y={-200} width={2520} height={790} fill="url(#s218sky)" />
        {/* 消え残りの星 (上ほど濃い) */}
        {Array.from({ length: 22 }, (_, i) => {
          const sxs = -200 + ((i * 331) % 2320);
          const sys = -140 + ((i * 97) % 380);
          const tw = 0.35 + 0.3 * Math.abs(Math.sin((f + i * 13) / 11));
          return (
            <circle key={`st${i}`} cx={sxs} cy={sys} r={i % 4 === 0 ? 5 : 3}
              fill={D.star} opacity={tw * (1 - sys / 560)} />
          );
        })}
        {/* 薄い横雲 */}
        {([[420, 330, 1.1], [1260, 262, 0.85], [1720, 400, 1.0]] as Array<[number, number, number]>)
          .map(([ccx, ccy, cs], i) => (
            <g key={`cl${i}`} opacity={0.3}>
              <ellipse cx={ccx} cy={ccy} rx={230 * cs} ry={17 * cs} fill={D.sky5} />
              <ellipse cx={ccx - 120 * cs} cy={ccy + 22 * cs} rx={150 * cs} ry={12 * cs} fill={D.sky5} />
            </g>
          ))}
        {/* ===== 遠い町 (ちいさな灯りがまだ点いている) ===== */}
        <g>
          {Array.from({ length: 22 }, (_, i) => {
            const bw = 56 + ((i * 53) % 54);
            const bh = 26 + ((i * 89) % 44);
            const bx = -180 + i * 108;
            return (
              <g key={`tw${i}`}>
                <rect x={bx} y={566 - bh} width={bw} height={bh} fill={D.town} />
                <polygon points={`${bx - 12},${566 - bh} ${bx + bw / 2},${546 - bh} ${bx + bw + 12},${566 - bh}`}
                  fill={D.townLit} />
                {i % 3 === 0 && (
                  <rect x={bx + bw * 0.3} y={566 - bh * 0.6} width={13} height={13}
                    fill={D.lamp} opacity={0.5 + 0.3 * Math.abs(Math.sin((f + i * 9) / 13))} />
                )}
              </g>
            );
          })}
          <line x1={-300} y1={566} x2={2220} y2={566} stroke={D.town} strokeWidth={6} />
        </g>
        {/* 低く這う靄 */}
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={`ms${i}`} cx={-120 + i * 268 + Math.sin((f + i * 17) / 19) * 22}
            cy={582 + (i % 3) * 16} rx={280} ry={26} fill={D.mist} opacity={0.34} />
        ))}
        {/* ===== 水をはった田 (薄桃の空をうつす) ===== */}
        <rect x={-300} y={592} width={2520} height={300} fill="url(#s218wat)" />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`rf${i}`} x1={-300} y1={606 + i * 18} x2={2220} y2={606 + i * 18}
            stroke={D.waterLit} strokeWidth={4 + (i % 3)} opacity={0.3 - i * 0.012} />
        ))}
        {/* 風が水面を渡ったさざ波 */}
        {Array.from({ length: 13 }, (_, i) => {
          const wx = -200 + ((i * 227 + f * 9) % 2320);
          return (
            <path key={`wv${i}`} d={`M ${wx} ${634 + (i % 5) * 42} q 46 -7 92 0 q 46 7 92 0`}
              fill="none" stroke={D.water} strokeWidth={4} opacity={0.4} />
          );
        })}
        {/* 田の中の稲株 (風でそろって倒れる) */}
        {Array.from({ length: 44 }, (_, i) => {
          const ix = -200 + ((i * 211) % 2320);
          const iy = 628 + ((i * 73) % 230);
          if (ix > 790 && ix < 1130 && iy > 760) return null;
          const sc = 0.5 + (iy - 620) / 400;
          return (
            <path key={`in${i}`}
              d={`M ${ix} ${iy} q ${-bend * sc * 0.5} ${-18 * sc} ${-bend * sc} ${-32 * sc}`}
              fill="none" stroke={D.grass} strokeWidth={4 * sc} opacity={0.6} />
          );
        })}
        {/* ===== 畦 (田を区切る土の線) ===== */}
        {([[664, 10], [742, 14], [854, 20]] as Array<[number, number]>).map(([by, bh], i) => (
          <g key={`bd${i}`}>
            <path d={`M -300 ${by + 8} Q 700 ${by - 12} 1180 ${by + 6} T 2220 ${by - 4}`}
              fill="none" stroke={D.bund} strokeWidth={bh} />
            <path d={`M -300 ${by + 3} Q 700 ${by - 17} 1180 ${by + 1} T 2220 ${by - 9}`}
              fill="none" stroke={D.bundLit} strokeWidth={bh * 0.34} opacity={0.7} />
          </g>
        ))}
        {/* ===== 手前の畦道 (奥へ細くなる) ===== */}
        <polygon points="700,1180 1230,1180 1016,636 926,636" fill={D.bund} />
        <polygon points="700,1180 1230,1180 1016,636 926,636" fill={D.bundLit} opacity={0.3} />
        {/* わだち */}
        {[-1, 1].map((u) => (
          <path key={`rt${u}`} d={`M ${960 + u * 196} 1180 Q ${960 + u * 120} 900 ${960 + u * 30} 644`}
            fill="none" stroke={D.bundDark} strokeWidth={13} opacity={0.5} />
        ))}
        {/* 道の小石 */}
        {Array.from({ length: 20 }, (_, i) => {
          const u = ((i * 61) % 100) / 100;
          const ry2 = 680 + u * 470;
          const half = 46 + (ry2 - 636) * 0.48;
          const rx2 = 970 + (((i * 173) % 200) / 100 - 1) * half;
          return (
            <ellipse key={`pb${i}`} cx={rx2} cy={ry2} rx={5 + (i % 3) * 3.5} ry={3 + (i % 3) * 2}
              fill={D.bundDark} opacity={0.4} />
          );
        })}
        {/* 道ばたの草 (全部おなじ向きに倒れる = 突風) */}
        {Array.from({ length: 40 }, (_, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const u = ((i * 37) % 100) / 100;
          const gy2 = 660 + u * 500;
          const half = 46 + (gy2 - 636) * 0.48;
          const gx2 = 970 + side * (half + 12 + ((i * 53) % 120));
          const sc = 0.45 + (gy2 - 640) / 430;
          return (
            <g key={`gr${i}`}>
              <path d={`M ${gx2} ${gy2} q ${-bend * sc * 0.6} ${-26 * sc} ${-bend * sc * 1.5} ${-46 * sc}`}
                fill="none" stroke={D.grass} strokeWidth={5 * sc} strokeLinecap="round" />
              <path d={`M ${gx2 + 9} ${gy2} q ${-bend * sc * 0.5} ${-20 * sc} ${-bend * sc * 1.2} ${-36 * sc}`}
                fill="none" stroke={D.grassLit} strokeWidth={4 * sc} strokeLinecap="round" opacity={0.7} />
              {/* 穂先の露が灯りを拾う */}
              {i % 5 === 0 && (
                <circle cx={gx2 - bend * sc * 1.5} cy={gy2 - 46 * sc} r={3.4 * sc}
                  fill={D.lamp} opacity={0.75} />
              )}
            </g>
          );
        })}
        {/* ===== 左の杭と垂れた縄 ===== */}
        {([[232, 980, 1], [392, 916, 0.84], [524, 872, 0.72]] as Array<[number, number, number]>)
          .map(([kx, ky, ks], i) => (
            <g key={`pk${i}`}>
              <rect x={kx - 11 * ks} y={ky - 150 * ks} width={22 * ks} height={150 * ks}
                fill={D.bund} stroke={D.ink} strokeWidth={5 * ks} />
              <polygon points={`${kx - 11 * ks},${ky - 150 * ks} ${kx},${ky - 168 * ks} ${kx + 11 * ks},${ky - 150 * ks}`}
                fill={D.bundLit} stroke={D.ink} strokeWidth={4 * ks} />
            </g>
          ))}
        <path d={`M 232 846 q 80 ${56 - bend} 160 ${-14}`} fill="none"
          stroke="#8E7E60" strokeWidth={8} />
        <path d={`M 392 832 q 66 ${48 - bend} 132 ${-20}`} fill="none"
          stroke="#8E7E60" strokeWidth={7} />
        {/* ===== 人 (炎を胸の前で抱える) ===== */}
        <Person x={960} y={970} s={1.4} pose="hold" face="smile"
          cloth="#4A5A7A" clothDark="#35435E" gaze={[0, -3]} f={f} />
        {/* 炎。風で傾くが消えない */}
        <g transform={`rotate(${tilt} 960 900)`}>
          <FlameIcon cx={960} cy={840} s={0.8} f={f} />
        </g>
        {/* 炎が顔と胸をやわらかく照らす */}
        <g opacity={0.22 + 0.08 * Math.abs(Math.sin(f / 7))}>
          <ellipse cx={960} cy={716} rx={128} ry={104} fill={C.flameIn} />
        </g>
        {/* 風に流される火の粉 (横に長くたなびく = 風の強さ) */}
        {Array.from({ length: 15 }, (_, i) => {
          const t = ((f + i * 5) % 40) / 40;
          return (
            <circle key={`sp${i}`} cx={942 - t * (200 + i * 14)} cy={800 - t * 110 + ((i * 29) % 34)}
              r={4.4 - t * 2.4} fill={i % 2 ? C.flameIn : C.flame} opacity={(1 - t) * 0.9} />
          );
        })}
        {/* 風の線 */}
        {Array.from({ length: 7 }, (_, i) => {
          const wy2 = 620 + i * 62;
          const wx2 = 1900 - ((f * 26 + i * 237) % 2200);
          return (
            <path key={`wd${i}`} d={`M ${wx2} ${wy2} q 110 -14 220 2 q 60 9 112 -8`}
              fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.2 + gust * 0.14} />
          );
        })}
      </g>
      {/* 引き出し線 (画面座標) */}
      <g opacity={clamp01(seg(f, 18, 30))} stroke={D.star} strokeWidth={3}
        strokeDasharray="10 8" fill="none">
        <path d={`M 1480 368 L ${sx(1026)} ${sy(812)}`} />
      </g>
      {/* 札: 字幕にない「どういう炎なのか (理由)」を足す (札の言い換えの法) */}
      <TagPlate x={1480} y={330} text="風でも 消えない" size={44} t={seg(f, 16, 30)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #219 でも、どの土俵で誰と比べるかは、選べます。★最後の1枚
// 格: 山
// ★2026-11-08 作り直し: 前は #218 と同じ DawnSky (夜明けの丘) を二枚つづけて使い、
//   輪は空に浮かぶ楕円だけだった (からくり憲法 第13条 1文1演出の法にふれる)。
//   舞台を「真昼の秋のすすき野の尾根道」に移し、地の色を金茶 + 青灰の遠山にした。
//   #214 の江戸の境内 (青空・朱の幟・濃緑の松・砂) とは朱も松もない点で、
//   #217 の曇りの川原 (灰白と翠) とは晴天と金茶である点で別物。
//   輪は空に浮かべず、野の上に置いた実物にして、ひとつずつ中に人を立たせた。
//   = 「どの輪で誰と比べるか」を目で数えられるようにする。
//   ★炎上回避: 「競争から降りよう」には見せない。主人公は輪を手に持ち、
//   道の先の輪を見ている (= これから選んで入る)。輪を捨てる・背を向ける絵にはしない。
//   カメラは引き (z 1.16 → 1.0)。最後の一枚なので、寄りではなく世界を広げて終わる。
// ------------------------------------------------------------------
const S219: React.FC<{ f: number }> = ({ f }) => {
  // 秋の野の色。金茶 + 青灰で、この章のどの絵とも重ならない
  const A = {
    ink: "#3A3A34",
    sky: "#A9D0E2", skyHi: "#86B8D4", cloud: "#F6FAFB",
    farMt: "#7B95B0", midMt: "#9FB6C8",
    field: "#C9A86A", fieldLit: "#E0C68E", fieldDark: "#9B7C44",
    stalk: "#B8964E", plume: "#F2E8CC", plumeDark: "#D9C79A",
    path: "#D8CBAB", pathDark: "#B2A07E",
    dragon: "#C0392B",
  };
  const k = easeOut(clamp01(seg(f, 0, 40)));
  const z = lerp(1.16, 1, k);
  const px = 960;
  const py = 700;
  const qx = 960;
  const qy = 700;
  // 野をわたる風 (すすきの穂がそろってゆれる)
  const wind = (i: number) => Math.sin((f + i * 9) / 13) * 7;

  // 野に置かれた輪。中に立っている人が「比べる相手」
  const dohyo = (
    i: number, cx: number, cy: number, r: number,
    people: Array<[number, number, number, string]>, t: number,
  ) => (
    <g key={`dh${i}`} opacity={t}>
      {/* 輪が野に落とす影 */}
      <ellipse cx={cx + 16} cy={cy + 14} rx={r * 0.98} ry={r * 0.3} fill={A.ink} opacity={0.12} />
      {/* 輪の中だけ草がふみならされている */}
      <ellipse cx={cx} cy={cy} rx={r - 10} ry={(r - 10) * 0.3} fill={A.fieldLit} opacity={0.8} />
      <ellipse cx={cx} cy={cy} rx={r - 10} ry={(r - 10) * 0.3} fill={A.pathDark} opacity={0.22} />
      <WoodRing cx={cx} cy={cy} r={r} tiltY={0.3} rot={i % 2 ? 3 : -3} />
      {/* 輪のふちにむすんだ色の布 (#215 の七段の色) */}
      <g transform={`translate(${cx - r * 0.72} ${cy + r * 0.3 * 0.7})`}>
        <rect x={-13} y={-11} width={26} height={22} rx={5}
          fill={RING_COL[i]} stroke={A.ink} strokeWidth={4} />
        <path d={`M 11 4 q 16 ${10 + wind(i)} 34 ${2 + wind(i)}`} fill="none"
          stroke={RING_COL[i]} strokeWidth={5} strokeLinecap="round" />
      </g>
      {people.map(([dx, dy, ps, col], j) => (
        <PersonMini key={j} x={cx + dx} y={cy + dy} s={ps} color={col}
          f={f} phase={i * 3 + j} face="dot" />
      ))}
    </g>
  );

  return (
    <Frame f={f} seed={1118} bg={A.sky}>
      <defs>
        <linearGradient id="s219sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.skyHi} />
          <stop offset="1" stopColor={A.sky} />
        </linearGradient>
        <linearGradient id="s219fld" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.fieldDark} />
          <stop offset="0.28" stopColor={A.field} />
          <stop offset="1" stopColor={A.fieldLit} />
        </linearGradient>
      </defs>
      <g transform={`translate(${qx - px * z} ${qy - py * z}) scale(${z})`}>
        {/* ===== 空 ===== */}
        <rect x={-300} y={-220} width={2520} height={800} fill="url(#s219sky)" />
        {/* 高いところの筋雲 */}
        {Array.from({ length: 9 }, (_, i) => (
          <path key={`ct${i}`} d={`M ${-240 + i * 266} ${70 + (i % 4) * 46} q 130 -16 266 -4`}
            fill="none" stroke={A.cloud} strokeWidth={9} opacity={0.55} />
        ))}
        {/* 平たい雲 */}
        {([[380, 262, 1.15], [1120, 196, 0.9], [1680, 300, 1.05]] as Array<[number, number, number]>)
          .map(([ccx, ccy, cs], i) => (
            <g key={`cl${i}`} opacity={0.92}>
              <ellipse cx={ccx} cy={ccy} rx={190 * cs} ry={34 * cs} fill={A.cloud} />
              <ellipse cx={ccx - 96 * cs} cy={ccy + 14 * cs} rx={116 * cs} ry={26 * cs} fill={A.cloud} />
              <ellipse cx={ccx + 108 * cs} cy={ccy + 10 * cs} rx={98 * cs} ry={23 * cs} fill={A.cloud} />
              <ellipse cx={ccx + 20 * cs} cy={ccy - 24 * cs} rx={84 * cs} ry={26 * cs} fill={A.cloud} />
            </g>
          ))}
        {/* ===== 遠い山 二重 ===== */}
        <path d="M -300 560 L 20 440 L 230 512 L 470 400 L 700 500 L 940 432 L 1210 520
                 L 1430 428 L 1690 508 L 1930 446 L 2220 530 L 2220 700 L -300 700 Z"
          fill={A.farMt} opacity={0.75} />
        <path d="M -300 596 L 160 512 L 420 566 L 690 500 L 980 574 L 1280 516
                 L 1560 582 L 1860 520 L 2220 584 L 2220 720 L -300 720 Z"
          fill={A.midMt} opacity={0.85} />
        {/* 尾根の線 */}
        <path d="M -300 596 L 160 512 L 420 566 L 690 500 L 980 574 L 1280 516
                 L 1560 582 L 1860 520 L 2220 584"
          fill="none" stroke={A.ink} strokeWidth={5} opacity={0.3} />
        {/* ===== すすき野 ===== */}
        <path d="M -300 578 Q 400 540 980 582 Q 1560 622 2220 566 L 2220 1200 L -300 1200 Z"
          fill="url(#s219fld)" />
        {/* 野の起伏 */}
        {([[690, 0.2], [810, 0.16], [960, 0.13]] as Array<[number, number]>).map(([hy, ho], i) => (
          <path key={`sw${i}`} d={`M -300 ${hy} Q 560 ${hy - 40} 1180 ${hy + 14} T 2220 ${hy - 20} L 2220 1200 L -300 1200 Z`}
            fill={A.fieldDark} opacity={ho} />
        ))}
        {/* ===== 尾根道 (手前から奥の輪へつづく) ===== */}
        <path d="M 540 1200 C 690 1010 1020 876 1386 706 L 1440 716
                 C 1086 892 826 1026 684 1200 Z"
          fill={A.path} />
        <path d="M 540 1200 C 690 1010 1020 876 1386 706" fill="none"
          stroke={A.pathDark} strokeWidth={5} opacity={0.6} />
        <path d="M 684 1200 C 826 1026 1086 892 1440 716" fill="none"
          stroke={A.pathDark} strokeWidth={5} opacity={0.6} />
        {/* 道の小石とわだち */}
        {Array.from({ length: 24 }, (_, i) => {
          const u = ((i * 43) % 100) / 100;
          const ry2 = 730 + u * 450;
          const cxp = 1380 - (ry2 - 706) * 1.56;
          const half = 28 + (ry2 - 706) * 0.16;
          return (
            <ellipse key={`st${i}`}
              cx={cxp + (((i * 151) % 200) / 100 - 1) * half} cy={ry2}
              rx={5 + (i % 3) * 4} ry={3 + (i % 3) * 2.4}
              fill={A.pathDark} opacity={0.5} />
          );
        })}
        {/* 道に残る足あと (主人公が歩いてきた跡 = 降りたのではなく進んでいる) */}
        {Array.from({ length: 7 }, (_, i) => {
          const u = i / 7;
          const fy = 1150 - u * 210;
          const fx = 640 + u * 210 + (i % 2) * 34;
          return (
            <ellipse key={`fp${i}`} cx={fx} cy={fy} rx={17} ry={9}
              fill={A.pathDark} opacity={0.4} transform={`rotate(-26 ${fx} ${fy})`} />
          );
        })}
        {/* ===== 野に置かれた四つの輪 (中の人が「比べる相手」) ===== */}
        {dohyo(6, 350, 726, 112, [
          [-52, 6, 0.34, "#B9674A"], [0, 12, 0.36, "#4A7A96"], [54, 4, 0.33, "#6E8F5A"],
        ], clamp01(seg(f, 4, 18)))}
        {dohyo(5, 1452, 706, 96, [
          [-46, 4, 0.32, "#8E7AA8"], [4, 10, 0.34, "#C9A84C"], [48, 2, 0.31, "#C07A96"],
        ], clamp01(seg(f, 8, 22)))}
        {dohyo(4, 640, 878, 170, [
          [-92, 8, 0.44, "#C9A84C"], [-14, 16, 0.47, "#B9674A"],
          [66, 6, 0.45, "#4E8E8E"], [28, -8, 0.42, "#8E7AA8"],
        ], clamp01(seg(f, 12, 26)))}
        {dohyo(3, 1680, 872, 132, [
          [-56, 6, 0.4, "#6E8F5A"], [36, 14, 0.43, "#4A7A96"],
        ], clamp01(seg(f, 16, 30)))}
        {/* ===== すすきの株 (穂が風でそろってゆれる) ===== */}
        {Array.from({ length: 86 }, (_, i) => {
          const u = ((i * 67) % 100) / 100;
          const gy = 594 + u * u * 600;
          const gx = -260 + ((i * 197) % 2440);
          // 輪の中と主人公の立ち位置には生やさない
          if (gy > 640 && gy < 800 && gx > 230 && gx < 470) return null;
          if (gy > 620 && gy < 790 && gx > 1350 && gx < 1560) return null;
          if (gy > 790 && gy < 960 && gx > 460 && gx < 820) return null;
          if (gy > 790 && gy < 950 && gx > 1540 && gx < 1820) return null;
          if (gy > 700 && gx > 880 && gx < 1110) return null;
          const sc = 0.3 + (gy - 580) / 420;
          const w = wind(i) * sc;
          return (
            <g key={`sk${i}`}>
              <path d={`M ${gx} ${gy} q ${w * 0.6} ${-52 * sc} ${w * 1.8} ${-96 * sc}`}
                fill="none" stroke={A.stalk} strokeWidth={4.4 * sc} strokeLinecap="round" />
              <path d={`M ${gx + 7 * sc} ${gy} q ${w * 0.5} ${-40 * sc} ${w * 1.4} ${-74 * sc}`}
                fill="none" stroke={A.fieldDark} strokeWidth={3.6 * sc} strokeLinecap="round"
                opacity={0.7} />
              {/* 穂 */}
              <g transform={`translate(${gx + w * 1.8} ${gy - 96 * sc}) rotate(${w * 1.5})`}>
                <ellipse cx={0} cy={-20 * sc} rx={11 * sc} ry={30 * sc} fill={A.plume} />
                <ellipse cx={0} cy={-20 * sc} rx={11 * sc} ry={30 * sc} fill={A.plumeDark} opacity={0.4} />
                {[-1, 0, 1].map((v) => (
                  <path key={v} d={`M 0 ${-6 * sc} q ${v * 16 * sc} ${-22 * sc} ${v * 22 * sc} ${-46 * sc}`}
                    fill="none" stroke={A.plume} strokeWidth={4.6 * sc} strokeLinecap="round" />
                ))}
              </g>
            </g>
          );
        })}
        {/* 飛ばされた穂わた */}
        {Array.from({ length: 14 }, (_, i) => {
          const t = ((f + i * 7) % 42) / 42;
          return (
            <circle key={`fl${i}`} cx={-80 + ((i * 251) % 2200) + t * 150}
              cy={700 - t * 180 + ((i * 37) % 120)} r={4 - t * 1.6}
              fill={A.plume} opacity={(1 - t) * 0.8} />
          );
        })}
        {/* 赤とんぼ */}
        {([[300, 440, 1], [1560, 392, 0.85], [1180, 486, 0.9], [760, 406, 0.78]] as
          Array<[number, number, number]>).map(([dx, dy, ds], i) => {
            const bb = Math.sin((f + i * 21) / 9) * 9;
            return (
              <g key={`dg${i}`} transform={`translate(${dx} ${dy + bb}) scale(${ds})`}>
                {/* 羽は胴から斜めに出す。小さく映るので4枚をハの字に開いて
                    「棒」ではなく虫の形に見えるようにする */}
                <ellipse cx={10} cy={-14} rx={28} ry={6} fill={A.cloud}
                  stroke={A.ink} strokeWidth={3} opacity={0.95}
                  transform="rotate(-17 10 -14)" />
                <ellipse cx={10} cy={14} rx={28} ry={6} fill={A.cloud}
                  stroke={A.ink} strokeWidth={3} opacity={0.95}
                  transform="rotate(17 10 14)" />
                <ellipse cx={-2} cy={-11} rx={18} ry={5} fill={A.cloud}
                  stroke={A.ink} strokeWidth={2.5} opacity={0.9}
                  transform="rotate(-30 -2 -11)" />
                <ellipse cx={-2} cy={11} rx={18} ry={5} fill={A.cloud}
                  stroke={A.ink} strokeWidth={2.5} opacity={0.9}
                  transform="rotate(30 -2 11)" />
                <rect x={-4} y={-4} width={54} height={8} rx={4} fill={A.dragon}
                  stroke={A.ink} strokeWidth={3.5} />
                <circle cx={-12} cy={0} r={11} fill={A.dragon} stroke={A.ink} strokeWidth={3.5} />
                <circle cx={-16} cy={-4} r={3} fill={A.ink} />
              </g>
            );
          })}
        {/* ===== 主人公 (輪を手に持ち、道の先の輪を見ている) ===== */}
        {/* ★2026-11-08 pose="hold" は両手が胸の前にそろうので、輪が胴にかぶって
            「船の丸窓」に見えていた。pose="point" にして右手を横に伸ばし、
            その手から輪を下げる形にした (手 = 輪の上のふち) */}
        <Person x={975} y={950} s={1.3} pose="point" pointDir={1} face="smile"
          cloth="#4A5A7A" clothDark="#35435E" gaze={[8, -3]} f={f} />
        <g transform={`translate(0 ${Math.sin(f / 13) * 4})`}>
          <WoodRing cx={1174} cy={835} r={86} tiltY={0.9} rot={-12} />
        </g>
        {/* 手に持った輪が足もとに落とす影 */}
        <ellipse cx={1184} cy={962} rx={86} ry={18} fill={A.ink} opacity={0.12} />
        {/* 主人公の視線の先 (いちばん遠い輪へ) */}
        <g opacity={clamp01(seg(f, 26, 40)) * 0.5}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={1120 + i * 110} cy={742 - i * 12} r={6 - i * 1.2}
              fill={A.ink} opacity={0.6 - i * 0.14} />
          ))}
        </g>
      </g>
      {/* 引き出し線 (画面座標。引きのカメラなので f=45 では等倍) */}
      <g opacity={clamp01(seg(f, 24, 36))} stroke={A.ink} strokeWidth={3}
        strokeDasharray="10 8" fill="none">
        <path d="M 330 296 L 352 676" />
      </g>
      {/* 札: 字幕にない「相手の数」を足す (札の言い換えの法)。
          絵の中の小さい人は四つの輪にぜんぶで十二人 */}
      <TagPlate x={330} y={250} text="相手は 十二人" size={48} t={seg(f, 22, 36)} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib11_s200:                 (f) => <S200 f={f} />,
  ib11_s201:                 (f) => <S201 f={f} />,
  ib11_s202:                 (f) => <S202 f={f} />,
  ib11_s203:                 (f) => <S203 f={f} />,
  ib11_s204:                 (f) => <S204 f={f} />,
  ib11_s205:                 (f) => <S205 f={f} />,
  ib11_s206:                 (f) => <S206 f={f} />,
  ib11_s207:                 (f) => <S207 f={f} />,
  ib11_s208:                 (f) => <S208 f={f} />,
  ib11_s209:                 (f) => <S209 f={f} />,
  ib11_s210:                 (f) => <S210 f={f} />,
  ib11_s211:                 (f) => <S211 f={f} />,
  ib11_s212:                 (f) => <S212 f={f} />,
  ib11_s213:                 (f) => <S213 f={f} />,
  ib11_s214:                 (f) => <S214 f={f} />,
  ib11_s215:                 (f) => <S215 f={f} />,
  ib11_s216:                 (f) => <S216 f={f} />,
  ib11_s217:                 (f) => <S217 f={f} />,
  ib11_s218:                 (f) => <S218 f={f} />,
  ib11_s219:                 (f) => <S219 f={f} />,
};

export const I_B11_MOTIFS: string[] = [
  "ib11_s200",                 // #200 結びです。最後に、この動画の隠れた主人公の話をさせてください。
  "ib11_s201",                 // #201 オリンピックの表彰台で、メダリストたちの表情を分析した研究があります。
  "ib11_s202",                 // #202 1995年の研究で、のちの追試でも2回、同じ結果が確認されました。
  "ib11_s203",                 // #203 幸せそうに見えるのは、銀メダリストではなく、銅メダリストのほうだったのです。
  "ib11_s204",                 // #204 2位は「あと一歩で金だったのに」と、ありえた自分と比べてしまう。
  "ib11_s205",                 // #205 3位は「危うく表彰台を逃すところだった」と、ほっとしている。
  "ib11_s206",                 // #206 順位そのものではなく、何と比べるかが、気持ちを決めていました。
  "ib11_s207",                 // #207 思い出してください。古代オリンピックに、2位の記録はありませんでした。
  "ib11_s208",                 // #208 2位は、わずか120年前に発明された、人類史でも新顔のポジションです。
  "ib11_s209",                 // #209 その新顔がいま、表彰台の上で、いちばん苦しそうにしています。
  "ib11_s210",                 // #210 順位という発明品は、まだ調整の途中なのかもしれません。
  "ib11_s211",                 // #211 そして実際、人類はもう、作り変えを始めています。
  "ib11_s212",                 // #212 ケンブリッジ大学は、1909年に成績順位の公表をやめました。
  "ib11_s213",                 // #213 日本の通知表は、2002年度に「クラスの中で何%か」で決めるのをやめました。
  "ib11_s214",                 // #214 江戸の相撲のように、そもそも白黒をつけない文化も、ちゃんと実在しました。
  "ib11_s215",                 // #215 最後に、この旅の地図を広げましょう。戦場ひとつ、帝国、町、国、世界、同学年、地球全員。
  "ib11_s216",                 // #216 土俵はここまで広がりましたが、どれも人間が作った輪にすぎません。
  "ib11_s217",                 // #217 人間が作った輪なら、選ぶことも、降りることも、作り直すこともできます。
  "ib11_s218",                 // #218 勝ちたい気持ちは、あなたのものです。
  "ib11_s219",                 // #219 でも、どの土俵で誰と比べるかは、選べます。
];

export const ichiB11Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B11_PREVIEW_FRAMES = Math.max(I_B11_MOTIFS.length, 1);
export const IchiB11Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B11_MOTIFS.length - 1);
  return <>{ichiB11Scene(I_B11_MOTIFS[i] ?? "", 45)}</>;
};
