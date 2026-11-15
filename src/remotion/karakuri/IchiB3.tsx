// 「『2位』は、120年前に発明された」: 第3章「1300年前の全国模試。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#48〜#62 (15文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで15枚。
// motif 名は必ず ib3_ で始める。WobbleDefs の seed はこのファイルでは 947〜961 を使う。
// 設計書: docs/briefs/IchiB3.md (1文ごとの「格」と絵の中身を決めてから描く)
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
import { lerp, zoomAt, rnd } from "./KosoB2Parts";
import {
  C3, StoneFloor, TiledRoof, CityWall, GateDoor, Lantern, Nobori,
  Kanjin, PersonBack, MeiboSheet, YakushoWall, ScrollDesk, HoubouWall,
  ToolMeasure, ToolRankSteps, ToolPostWall, DohyoRing,
} from "./IchiB3Parts";

// ------------------------------------------------------------------
// #48 第3章、1300年前の、全国模試。
// 格: 山 — 章扉。宮城の門前・巨大な掲示の壁・受験生の行列
// ------------------------------------------------------------------
const S48: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.07, 1.0, easeOut(seg(f, 0, 34)));
  const walk = easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={947} bg={C3.skyWarm}
      over={<ChapterDoor num={3} title="1300年前の全国模試。" t={seg(f, 10, 28)} left={1030} top={146} />}>
      <g transform={zoomAt(z, 740, 640)}>
        {/* 空と遠景の山 */}
        <rect x={0} y={0} width={W} height={640} fill={C3.skyWarm} />
        <path d="M -60 480 L 240 296 L 470 480 Z" fill={C3.leaf} opacity={0.3} />
        <path d="M 1340 486 L 1650 306 L 1960 486 Z" fill={C3.leaf} opacity={0.24} />
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse key={i} cx={180 + i * 420} cy={150 + rnd(i + 3) * 90}
            rx={130 + rnd(i + 9) * 70} ry={26} fill={KRP.white} opacity={0.3} />
        ))}
        {/* 城壁 */}
        <CityWall x={-20} y={432} w={420} h={330} />
        <CityWall x={1086} y={432} w={880} h={330} />
        {/* 門楼 */}
        <CityWall x={382} y={404} w={716} h={358} />
        <TiledRoof cx={740} y={190} w={900} h={98} />
        <rect x={404} y={288} width={672} height={122} fill={C3.plaster} stroke={C3.ink} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={452 + i * 160} y={312} width={76} height={74} rx={6}
            fill={C3.tileDark} stroke={C3.ink} strokeWidth={4} />
        ))}
        <TiledRoof cx={740} y={376} w={780} h={58} />
        <GateDoor cx={740} y={474} w={300} h={288} />
        {/* 門の脇の巨大な掲示の壁 */}
        <g>
          <rect x={1150} y={418} width={424} height={334} fill={C3.wood} stroke={C3.ink} strokeWidth={5} />
          <rect x={1176} y={444} width={372} height={284} fill={C3.plaster} stroke={C3.ink} strokeWidth={4} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={1194 + i * 72} y={462} width={56} height={248}
              fill={C3.paperDark} opacity={0.48} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={`t${i}`} cx={1200 + i * 124} cy={434} r={7}
              fill={C3.gold} stroke={C3.ink} strokeWidth={2.5} />
          ))}
        </g>
        <StoneFloor y={752} />
        {/* 幟 */}
        <Nobori x={1070} y={790} h={330} f={f} phase={0} />
        <Nobori x={1660} y={812} h={300} f={f} phase={2} color={C3.robe} />
        <Nobori x={300} y={806} h={280} f={f} phase={4} color={C3.gold} />
        {/* 灯籠 */}
        <Lantern x={214} y={884} s={1.05} f={f} />
        <Lantern x={1836} y={908} s={1.1} f={f} phase={3} />
        {/* 受験生の行列 (門へ向かう) */}
        {Array.from({ length: 9 }, (_, i) => {
          const base = 1560 - i * 86;
          return (
            <PersonMini key={i} x={base - walk * 70} y={806 + (i % 2) * 8} s={0.4 + (i % 3) * 0.03}
              color={i % 2 ? C3.robeGray : C3.robe} f={f} phase={i * 3} face="dot" arms="down" />
          );
        })}
        {Array.from({ length: 6 }, (_, i) => (
          <PersonMini key={`b${i}`} x={1180 - i * 74 - walk * 46} y={772} s={0.3}
            color={C3.robeGrayDark} f={f} phase={i * 5 + 1} face="none" arms="down" />
        ))}
        {/* 門の下をくぐる1人 */}
        <Kanjin x={740 - 30 + walk * 20} y={828} s={0.62} f={f} phase={6} face="normal" />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #49 舞台は中国です。隋の時代に始まったとされる、役人の採用試験「科挙」。
// 格: 並 — 門をくぐる官人1人。背景は城壁・門扉の鋲・軒の瓦・石畳の4要素
// ------------------------------------------------------------------
const S49: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={948} bg={C3.sky}>
      <g transform={zoomAt(lerp(1.0, 1.06, k), 790, 620)}>
        <rect x={0} y={0} width={W} height={320} fill={C3.sky} />
        <TiledRoof cx={960} y={64} w={2060} h={96} />
        <CityWall x={-20} y={236} w={1960} h={522} />
        <GateDoor cx={790} y={316} w={420} h={442} />
        <StoneFloor y={752} k={1} />
        <Lantern x={1470} y={836} s={0.95} f={f} />
        <Lantern x={212} y={856} s={1.0} f={f} phase={2} />
        {/* 軒から下がる札 (標識) */}
        <g transform="translate(1300 300)">
          <rect x={-40} y={0} width={80} height={190} rx={8} fill={C3.redDeep}
            stroke={C3.ink} strokeWidth={4.5} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={0} cy={40 + i * 56} r={13} fill={C3.gold} opacity={0.8} />
          ))}
        </g>
        <Kanjin x={lerp(560, 800, k)} y={lerp(828, 844, k)} s={lerp(0.86, 0.95, k)}
          f={f} pose="stand" face="normal" gaze={[3, -1]} />
        <TagPlate x={1480} y={300} text="科挙" size={62} t={seg(f, 14, 30)} />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #50 家柄ではなく、試験の成績で役人を選ぶ仕組みです。
// 格: 図 — 役所の壁の前の大きな天秤。右 (答案) へぐっと傾く
// ------------------------------------------------------------------
const S50: React.FC<{ f: number }> = ({ f }) => {
  const tilt = lerp(0, 15, easeOut(seg(f, 8, 34))) + Math.sin(f / 11) * 0.5;
  const rad = (tilt * Math.PI) / 180;
  const BL = 330;
  const lx = 960 - BL * Math.cos(rad), ly = 360 - BL * Math.sin(rad);
  const rx = 960 + BL * Math.cos(rad), ry = 360 + BL * Math.sin(rad);
  const pan = (px: number, py: number, inner: React.ReactNode) => (
    <g>
      <line x1={px} y1={py} x2={px - 66} y2={py + 110} stroke={C3.ink} strokeWidth={3.5} />
      <line x1={px} y1={py} x2={px + 66} y2={py + 110} stroke={C3.ink} strokeWidth={3.5} />
      <path d={`M ${px - 86} ${py + 108} Q ${px} ${py + 158} ${px + 86} ${py + 108} Z`}
        fill={C3.paperDark} stroke={C3.ink} strokeWidth={5} />
      {inner}
    </g>
  );
  return (
    <Frame f={f} seed={949} bg={C3.plaster}>
      <YakushoWall f={f} k={1} />
      {/* 天秤の台 */}
      <path d="M 870 756 L 1050 756 L 1006 430 L 914 430 Z" fill={C3.wood} stroke={C3.ink} strokeWidth={5} />
      <rect x={946} y={366} width={28} height={76} fill={C3.woodDark} stroke={C3.ink} strokeWidth={4} />
      {/* 竿 */}
      <g transform={`rotate(${tilt} 960 360)`}>
        <rect x={960 - BL} y={348} width={BL * 2} height={24} rx={12}
          fill={C3.tileDark} stroke={C3.ink} strokeWidth={5} />
      </g>
      <circle cx={960} cy={360} r={20} fill={C3.gold} stroke={C3.ink} strokeWidth={5} />
      {/* 左皿: 家柄の家系図札 */}
      {pan(lx, ly, (
        <g transform={`translate(${lx} ${ly + 36})`}>
          <rect x={-66} y={-78} width={132} height={110} rx={8} fill={C3.paper}
            stroke={C3.ink} strokeWidth={4.5} />
          <circle cx={0} cy={-58} r={13} fill={C3.plasterShade} stroke={C3.ink} strokeWidth={3} />
          <line x1={0} y1={-45} x2={0} y2={-30} stroke={C3.ink} strokeWidth={3} />
          <line x1={-34} y1={-30} x2={34} y2={-30} stroke={C3.ink} strokeWidth={3} />
          {[-34, 0, 34].map((cx) => (
            <g key={cx}>
              <line x1={cx} y1={-30} x2={cx} y2={-16} stroke={C3.ink} strokeWidth={3} />
              <circle cx={cx} cy={-4} r={11} fill={C3.plasterShade} stroke={C3.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
      ))}
      {/* 右皿: 答案の束 */}
      {pan(rx, ry, (
        <g transform={`translate(${rx} ${ry + 30})`}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${(i % 2 ? 6 : -6)} ${-i * 22})`}>
              <MeiboSheet x={-74} y={-28} w={148} h={34} cols={6} rows={2} rot={i % 2 ? 1.5 : -1.5} />
            </g>
          ))}
        </g>
      ))}
      <TagPlate x={960} y={212} text="えらぶ物差し" size={50} t={seg(f, 4, 18)} />
      <TagPlate x={470} y={690} text="家柄" size={48} t={seg(f, 18, 30)} rot={-2} />
      <TagPlate x={1495} y={690} text="成績" size={48} t={seg(f, 24, 38)} color={C3.red} rot={2} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #51 世界最初の実力主義の制度とされています。
// 格: 図 — 机に広げた絵巻の年表。方眼は絵巻に clip
// ------------------------------------------------------------------
const S51: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 6, 36));
  const X0 = 300, X1 = 1620, LY = 574;
  return (
    <Frame f={f} seed={950} bg={C3.plaster}>
      <ScrollDesk f={f} idk="51">
        {/* 年表の線 */}
        <line x1={X0} y1={LY} x2={lerp(X0, X1, grow)} y2={LY}
          stroke={C3.sumi} strokeWidth={8} strokeLinecap="round" />
        {Array.from({ length: 12 }, (_, i) => {
          const tx = X0 + ((X1 - X0) * i) / 11;
          if (tx > lerp(X0, X1, grow)) return null;
          return <line key={i} x1={tx} y1={LY - 14} x2={tx} y2={LY + 14}
            stroke={C3.mapLine} strokeWidth={4} />;
        })}
        {/* 左端: 隋の印 */}
        <g transform={`translate(${X0} ${LY - 92})`}>
          <rect x={-52} y={-52} width={104} height={104} rx={8} fill="none"
            stroke={C3.red} strokeWidth={8} opacity={0.9} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={62} fill={C3.red} opacity={0.92}>隋</text>
        </g>
        <circle cx={X0} cy={LY} r={17} fill={C3.red} stroke={C3.ink} strokeWidth={5} />
        {/* 右端: ヨーロッパの校舎の小さな影 */}
        <g opacity={0.45 * grow} transform={`translate(${X1} ${LY - 20})`}>
          <rect x={-78} y={-132} width={156} height={132} fill={C3.robeGrayDark}
            stroke={C3.ink} strokeWidth={4} />
          <path d="M -90 -132 L 0 -184 L 90 -132 Z" fill={C3.robeGrayDark} stroke={C3.ink} strokeWidth={4} />
          <rect x={-14} y={-236} width={28} height={56} fill={C3.robeGrayDark} stroke={C3.ink} strokeWidth={3.5} />
          <path d="M -24 -236 L 0 -276 L 24 -236 Z" fill={C3.robeGrayDark} stroke={C3.ink} strokeWidth={3.5} />
          {[-46, 0, 46].map((wx) => (
            <rect key={wx} x={wx - 16} y={-104} width={32} height={46} rx={14}
              fill={C3.paper} stroke={C3.ink} strokeWidth={3} />
          ))}
        </g>
        <circle cx={X1} cy={LY} r={13} fill={C3.paper} stroke={C3.ink} strokeWidth={5}
          opacity={grow} />
        {/* 間の長さを示す細い矢羽 */}
        <g opacity={0.6 * grow}>
          <line x1={X0 + 40} y1={LY + 62} x2={X1 - 40} y2={LY + 62}
            stroke={C3.mapLine} strokeWidth={4} strokeDasharray="16 12" />
        </g>
      </ScrollDesk>
      <TagPlate x={690} y={338} text="最初とされる" size={46} t={seg(f, 20, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #52 全国から受験生が集まり、約1300年ものあいだ続きました。
// 格: 山 — 帝国の大絵図。四方の町から都へ道が集まる。下に1300年の帯
// ------------------------------------------------------------------
const S52: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 36));
  const band = easeOut(seg(f, 14, 40));
  const GX = 960, GY = 462;
  const roads: [number, number][] = [[-240, 1120], [560, 1180], [1420, 1180], [2180, 1100]];
  // 年表は空に渡す (道と受験生に重ならない高さ)。帯の上端は字幕帯からうんと上
  const TLX = 200, TLY = 120, TLW = 1520;
  // 受験生の歩み。f でずっと進み、門に着いたら消えて、また遠くの町から現れる
  const mod1 = (v: number) => ((v % 1) + 1) % 1;
  const march = f / 58;
  return (
    <Frame f={f} seed={951} bg={C3.skyWarm}>
      <g transform={zoomAt(lerp(1.05, 1.0, k), 960, 520)}>
        {/* 空・遠景 */}
        <rect x={0} y={0} width={W} height={430} fill={C3.skyWarm} />
        <path d="M -60 420 L 300 250 L 640 420 Z" fill={C3.leaf} opacity={0.26} />
        <path d="M 1180 424 L 1560 244 L 1960 424 Z" fill={C3.leaf} opacity={0.22} />
        {/* 大地 */}
        <rect x={0} y={420} width={W} height={H - 420} fill={C3.mapPaper} />
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx={rnd(i + 2) * W} cy={440 + rnd(i + 44) * 380}
            rx={30 + rnd(i + 71) * 40} ry={9 + rnd(i + 95) * 8} fill={C3.leaf} opacity={0.2} />
        ))}
        {/* 都の城壁と門 */}
        <CityWall x={560} y={378} w={800} h={110} op={0.95} />
        <TiledRoof cx={960} y={300} w={540} h={64} />
        <GateDoor cx={960} y={396} w={130} h={92} />
        {/* 四方から集まる道 */}
        {roads.map(([bx, by], i) => (
          <g key={i}>
            <path d={`M ${bx - 110} ${by} L ${bx + 110} ${by} L ${GX + 36} ${GY + 30} L ${GX - 36} ${GY + 30} Z`}
              fill={C3.stone} stroke={C3.stoneLine} strokeWidth={3} opacity={0.95} />
            {Array.from({ length: 7 }, (_, j) => {
              const t = (j + 0.4) / 7;
              const px = lerp((bx - 110 + bx + 110) / 2, GX, 1 - t);
              const py = lerp(by, GY + 30, 1 - t);
              return <ellipse key={j} cx={px} cy={py} rx={16 * t + 4} ry={5 * t + 2}
                fill={C3.stoneLine} opacity={0.35} />;
            })}
          </g>
        ))}
        {/* 道を行く受験生の列 (t=1 遠くの町 → t=0 都の門。f で実際に門へ近づく) */}
        {roads.map(([bx, by], i) =>
          Array.from({ length: 5 }, (_, j) => {
            const t = mod1((j + 0.55) / 5 - march + i * 0.07);
            // 門の手前で消えて、遠くの町からまた現れる (飛びを見せない)
            const fade = clamp01(t / 0.13) * clamp01((1 - t) / 0.1);
            if (fade <= 0.02) return null;
            const px = lerp(bx, GX, 1 - t) + (j % 2 ? 26 : -26) * t;
            const py = lerp(by - 40, GY + 20, 1 - t);
            const s = 0.13 + t * 0.4;               // 近いほど大きい (遠近)
            const sway = Math.sin((f + (i * 5 + j) * 11) / 6) * 5 * s;
            return (
              <g key={`${i}-${j}`} opacity={fade}>
                {/* 足もとの影 (近いほど濃く大きく) */}
                <ellipse cx={px} cy={py + 4} rx={54 * s} ry={13 * s}
                  fill={C3.stoneLine} opacity={0.2 + s * 0.5} />
                <g transform={`translate(0 ${sway})`}>
                  <PersonMini x={px} y={py} s={s} color={j % 2 ? C3.robeGray : C3.robe}
                    f={f} phase={i * 4 + j} face="none" arms="down" />
                  {/* 笠と荷 */}
                  <ellipse cx={px} cy={py - 168 * s} rx={46 * s} ry={15 * s}
                    fill={C3.paperDark} stroke={C3.ink} strokeWidth={3 * s} />
                  <rect x={px + 32 * s} y={py - 110 * s} width={38 * s} height={38 * s} rx={5 * s}
                    fill={C3.wood} stroke={C3.ink} strokeWidth={3 * s} />
                </g>
              </g>
            );
          }))}
        {/* 道ばたの里程標 */}
        {[[556, 690], [1480, 660], [760, 900]].map(([mx, my], i) => (
          <g key={i} transform={`translate(${mx} ${my})`}>
            <rect x={-13} y={-78} width={26} height={78} fill={C3.stone} stroke={C3.ink} strokeWidth={4} />
            <rect x={-26} y={-96} width={52} height={22} rx={5} fill={C3.paper} stroke={C3.ink} strokeWidth={4} />
            <line x1={-16} y1={-85} x2={16} y2={-85} stroke={C3.sumi} strokeWidth={4} />
          </g>
        ))}
        {/* 1300年の年表 (空に渡す。左端が始まり・右端が終わり) */}
        <g>
          {/* まだ伸びていないぶんの溝 */}
          <rect x={TLX} y={TLY} width={TLW} height={28} rx={14}
            fill={C3.paper} stroke={C3.ink} strokeWidth={4.5} opacity={0.75} />
          <rect x={TLX} y={TLY} width={lerp(0, TLW, band)} height={28} rx={14}
            fill={C3.red} stroke={C3.ink} strokeWidth={4.5} opacity={0.9} />
          {Array.from({ length: 14 }, (_, i) => {
            const tx = TLX + ((i + 0.5) * TLW) / 14;
            if (tx > TLX + TLW * band) return null;
            return <line key={i} x1={tx} y1={TLY} x2={tx} y2={TLY + 28} stroke={KRP.white}
              strokeWidth={3} opacity={0.55} />;
          })}
          {/* 両端の杭 (終わりの杭は帯が届いてから濃くなる) */}
          <line x1={TLX} y1={TLY - 18} x2={TLX} y2={TLY + 46}
            stroke={C3.ink} strokeWidth={5} opacity={0.35 + 0.65 * clamp01(seg(f, 12, 20))} />
          <line x1={TLX + TLW} y1={TLY - 18} x2={TLX + TLW} y2={TLY + 46}
            stroke={C3.ink} strokeWidth={5} opacity={0.25 + 0.75 * band} />
          {/* 始まりと終わりの年 (ラベルだけ) */}
          <text x={TLX - 4} y={TLY + 86} textAnchor="start" fontFamily={FONT} fontWeight={900}
            fontSize={34} fill={C3.sumi} opacity={0.9 * clamp01(seg(f, 14, 24))}>598年</text>
          <text x={TLX + TLW + 4} y={TLY + 86} textAnchor="end" fontFamily={FONT} fontWeight={900}
            fontSize={34} fill={C3.sumi} opacity={0.9 * clamp01(seg(f, 32, 42))}>1905年</text>
        </g>
      </g>
      <TagPlate x={960} y={204} text="1300年" size={50} t={seg(f, 24, 38)} color={C3.red} />
      <TagPlate x={1590} y={250} text="全国から" size={48} t={seg(f, 6, 20)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #53 この試験のすごさは、合格発表にあります。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
const S53: React.FC<{ f: number }> = ({ f }) => {
  const look = easeOut(seg(f, 6, 30));
  return (
    <Frame f={f} seed={952} bg={C3.plaster}>
      <g transform={zoomAt(lerp(1.0, 1.05, look), 860, 700)}>
        <HoubouWall f={f} phase={1} />
        <StoneFloor y={752} k={2} />
        <Lantern x={180} y={880} s={1.0} f={f} />
        <Lantern x={1760} y={900} s={1.05} f={f} phase={3} />
        {/* 勾欄 (壁の前の手すり) */}
        <g opacity={0.9}>
          <rect x={0} y={700} width={W} height={14} fill={C3.wood} stroke={C3.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={70 + i * 224} y={712} width={15} height={48}
              fill={C3.woodDark} stroke={C3.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 落ちた影 */}
        <ellipse cx={830} cy={856} rx={92} ry={18} fill={C3.stoneLine} opacity={0.4} />
        {/* 見上げる受験生ひとり (後ろ姿) */}
        <PersonBack x={830} y={850} s={0.96} f={f} phase={1} lookUp />
      </g>
      <TagPlate x={1500} y={320} text="はっぴょう" size={50} t={seg(f, 18, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #54 その名も「放榜」。合格者の名前を書いた紙を、壁に貼り出すのです。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
const S54: React.FC<{ f: number }> = ({ f }) => {
  const zin = easeOut(seg(f, 10, 40));
  const brush = Math.sin(f / 5) * 9;
  return (
    <Frame f={f} seed={953} bg={C3.plaster}>
      <g transform={zoomAt(lerp(0.98, 1.06, zin), 900, 660)}>
        <HoubouWall f={f} phase={2} />
        <StoneFloor y={752} k={3} />
        {/* 糊刷毛の役人が脚立で貼る (左) */}
        <g>
          {/* 脚立 */}
          <g stroke={C3.ink} strokeWidth={6} fill="none">
            <line x1={262} y1={790} x2={330} y2={566} />
            <line x1={398} y1={790} x2={336} y2={566} />
            <line x1={286} y1={712} x2={374} y2={712} stroke={C3.wood} strokeWidth={13} />
            <line x1={302} y1={648} x2={360} y2={648} stroke={C3.wood} strokeWidth={13} />
          </g>
          <Kanjin x={352} y={574} s={0.62} f={f} phase={5} pose="raise" face="normal"
            robe={C3.robeGray} robeDark={C3.robeGrayDark} />
          {/* 糊刷毛 */}
          <g transform={`translate(372 ${392}) rotate(${brush})`}>
            <rect x={-7} y={0} width={14} height={86} rx={6} fill={C3.wood} stroke={C3.ink} strokeWidth={3.5} />
            <rect x={-26} y={-26} width={52} height={30} rx={5} fill={C3.sumi} stroke={C3.ink} strokeWidth={3.5} />
          </g>
          {/* 貼りかけの紙 */}
          <MeiboSheet x={198} y={300} w={140} h={210} cols={3} rows={6} rot={-6}
            curl={26 + Math.sin(f / 6) * 9} />
        </g>
        {/* 群がる人々 (奥の列) */}
        {Array.from({ length: 11 }, (_, i) => (
          <PersonMini key={`b${i}`} x={470 + i * 100} y={772} s={0.32}
            color={i % 3 === 0 ? C3.robe : C3.robeGrayDark} f={f} phase={i * 4}
            face="none" arms={i % 3 === 1 ? "up" : "down"} />
        ))}
        {/* 群がる人々 (手前の列) */}
        {Array.from({ length: 8 }, (_, i) => (
          <PersonMini key={`a${i}`} x={516 + i * 132} y={806} s={0.44}
            color={i % 2 ? C3.robeGray : C3.robe} f={f} phase={i * 7 + 2}
            face="dot" arms={i % 2 ? "up" : "down"} />
        ))}
        {/* 手前の2人: 歓喜と落胆の対比 */}
        <ellipse cx={700} cy={856} rx={76} ry={16} fill={C3.stoneLine} opacity={0.35} />
        <ellipse cx={1046} cy={856} rx={76} ry={16} fill={C3.stoneLine} opacity={0.35} />
        <Kanjin x={700} y={850} s={0.72} f={f} phase={2} pose="banzai" face="joy"
          robe={C3.robe} robeDark={C3.robeDark} />
        <Kanjin x={1046} y={850} s={0.72} f={f} phase={9} pose="stand" face="sad"
          robe={C3.robeGray} robeDark={C3.robeGrayDark} lean={4} gaze={[0, 4]} />
        {/* 名前を探す指 */}
        <Kanjin x={1396} y={848} s={0.64} f={f} phase={4} pose="point" pointDir={-1}
          face="surprised" robe={C3.robeGrayDark} robeDark={C3.sumi} />
        {/* 風にめくれる紙片 */}
        {Array.from({ length: 5 }, (_, i) => (
          <g key={`p${i}`} transform={`translate(${1540 + i * 64} ${300 + i * 86 + Math.sin((f + i * 9) / 7) * 10}) rotate(${-18 + i * 12})`}>
            <rect x={0} y={0} width={34} height={46} fill={C3.paper} stroke={C3.ink}
              strokeWidth={3} opacity={0.85} />
          </g>
        ))}
      </g>
      {/* 字幕に読みがな「（ほうぼう）」を足して2行になったので、札を上げて黒帯のすきまを 30px→72px に
          (真上の紙片は i=3 の下端 604 までなので当たらない) */}
      <TagPlate x={1700} y={720} text="放榜" size={60} t={seg(f, 4, 18)} color={C3.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #55 そして全国1位には、「状元」という特別な称号が与えられました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
/** 馬 (この章だけの部品。蹄が原点) */
const Horse: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const g = Math.sin(f / 6) * 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={10} cy={6} rx={170} ry={20} fill={C3.stoneLine} opacity={0.35} />
      <g transform={`rotate(${-g} -90 -150)`}>
        <rect x={-104} y={-150} width={28} height={150} rx={13} fill={C3.horseDark}
          stroke={C3.ink} strokeWidth={4.5} />
      </g>
      <g transform={`rotate(${g} 90 -150)`}>
        <rect x={76} y={-150} width={28} height={150} rx={13} fill={C3.horseDark}
          stroke={C3.ink} strokeWidth={4.5} />
      </g>
      <rect x={-120} y={-250} width={272} height={118} rx={54} fill={C3.horse}
        stroke={C3.ink} strokeWidth={5} />
      <g transform={`rotate(${g} -58 -150)`}>
        <rect x={-72} y={-150} width={26} height={150} rx={12} fill={C3.horse}
          stroke={C3.ink} strokeWidth={4.5} />
      </g>
      <g transform={`rotate(${-g} 120 -150)`}>
        <rect x={107} y={-150} width={26} height={150} rx={12} fill={C3.horse}
          stroke={C3.ink} strokeWidth={4.5} />
      </g>
      {/* 首と頭 */}
      <path d="M 118 -246 L 192 -352 L 248 -334 L 178 -194 Z" fill={C3.horse}
        stroke={C3.ink} strokeWidth={5} />
      <path d="M 188 -368 Q 254 -386 274 -342 L 248 -316 L 192 -330 Z" fill={C3.horse}
        stroke={C3.ink} strokeWidth={5} />
      <circle cx={222} cy={-350} r={7} fill={C3.ink} />
      <path d="M 206 -374 L 213 -400 L 226 -376 Z" fill={C3.horse} stroke={C3.ink} strokeWidth={3.5} />
      <path d="M 148 -298 Q 180 -348 204 -366" fill="none" stroke={C3.sumi}
        strokeWidth={13} strokeLinecap="round" />
      <path d={`M -118 -232 Q ${-188 + g} -194 ${-170 + g} -104`} fill="none" stroke={C3.sumi}
        strokeWidth={17} strokeLinecap="round" />
      {/* 鞍 */}
      <path d="M -14 -256 L 72 -256 L 78 -204 L -20 -204 Z" fill={C3.redDeep}
        stroke={C3.ink} strokeWidth={4.5} />
      <rect x={-24} y={-212} width={108} height={16} rx={7} fill={C3.gold}
        stroke={C3.ink} strokeWidth={3.5} />
    </g>
  );
};

// ------------------------------------------------------------------
// #55 そして全国1位には、「状元」という特別な称号が与えられました。
// 格: 並 — 馬に乗る状元。沿道に花びら。茶化さない
// ------------------------------------------------------------------
const S55: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 40));
  const hx = lerp(640, 820, k);
  return (
    <Frame f={f} seed={954} bg={C3.sky}>
      <rect x={0} y={0} width={W} height={320} fill={C3.sky} />
      <TiledRoof cx={960} y={54} w={2060} h={92} op={0.92} />
      <CityWall x={-20} y={248} w={1960} h={506} />
      <GateDoor cx={1500} y={344} w={300} h={410} />
      <StoneFloor y={752} k={4} />
      {/* 赤い大札 (立て看) */}
      <g transform="translate(300 780)">
        <rect x={-14} y={-300} width={28} height={300} fill={C3.wood} stroke={C3.ink} strokeWidth={4} />
        <rect x={-84} y={-440} width={168} height={160} rx={10} fill={C3.redDeep}
          stroke={C3.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={0} cy={-412 + i * 48} r={15} fill={C3.gold} opacity={0.82} />
        ))}
      </g>
      <Nobori x={1760} y={812} h={300} f={f} phase={1} />
      {/* 馬と状元 */}
      <Horse x={hx} y={846} s={0.98} f={f} />
      <g>
        <Kanjin x={hx + 32} y={846 - 196} s={0.66} f={f} phase={3} face="smile"
          robe={C3.robe} robeDark={C3.robeDark} gaze={[3, 0]} />
        {/* 紅い襷 */}
        <g transform={`translate(${hx + 32} ${846 - 196}) scale(0.66)`}>
          <polygon points="-58,-162 -28,-162 58,-74 58,-52 42,-52"
            fill={C3.red} stroke={C3.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 舞う花びら */}
      {Array.from({ length: 22 }, (_, i) => {
        const px = rnd(i + 5) * W;
        const py = ((rnd(i + 31) * 900 + f * (6 + rnd(i + 9) * 7)) % 820) + 60;
        return (
          <ellipse key={i} cx={px + Math.sin((f + i * 11) / 9) * 16} cy={py}
            rx={11} ry={6} fill={C3.red} opacity={0.5}
            transform={`rotate(${i * 31} ${px} ${py})`} />
        );
      })}
      {/* 沿道の庶民 */}
      {Array.from({ length: 4 }, (_, i) => (
        <PersonMini key={i} x={1180 + i * 92} y={790} s={0.34} color={C3.robeGrayDark}
          f={f} phase={i * 6} face="dot" arms="up" />
      ))}
      <TagPlate x={1400} y={250} text="状元 = 全国1位" size={44} t={seg(f, 16, 30)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #56 ここで、そろいました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
/** 役所の壁の棚 (3点セットを載せる台。#56〜#58 で共有) */
const ToolShelf: React.FC<{ y?: number }> = ({ y = 600 }) => (
  <g>
    <rect x={200} y={y} width={1520} height={22} rx={6} fill={C3.wood}
      stroke={C3.ink} strokeWidth={5} />
    {[300, 960, 1620].map((bx) => (
      <g key={bx}>
        <path d={`M ${bx - 46} ${y + 22} L ${bx + 46} ${y + 22} L ${bx + 26} ${y + 74} L ${bx - 26} ${y + 74} Z`}
          fill={C3.woodDark} stroke={C3.ink} strokeWidth={4.5} />
      </g>
    ))}
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1={210} y1={y + 6 + i * 1.6} x2={1710} y2={y + 8 + i * 1.6}
        stroke={C3.woodDark} strokeWidth={1.6} opacity={0.4} />
    ))}
  </g>
);

// ------------------------------------------------------------------
// #56 ここで、そろいました。
// 格: 図 — 役所の壁の棚に3つの道具が左から順に灯る
// ------------------------------------------------------------------
const S56: React.FC<{ f: number }> = ({ f }) => {
  const lit = [seg(f, 4, 14), seg(f, 14, 24), seg(f, 24, 36)].map((t) => easeOut(t));
  return (
    <Frame f={f} seed={955} bg={C3.plaster}>
      <YakushoWall f={f} k={2} />
      <ToolShelf y={584} />
      {/* 灯る順に光の輪 */}
      {[[430, 540], [960, 490], [1490, 466]].map(([gx, gy], i) => (
        <ellipse key={i} cx={gx} cy={gy} rx={196} ry={166}
          fill={C3.gold} opacity={0.14 * (lit[i] ?? 0)} />
      ))}
      <ToolMeasure x={430} y={556} lit={lit[0]} />
      <ToolRankSteps x={960} y={532} lit={lit[1]} />
      <ToolPostWall x={1490} y={474} lit={lit[2]} f={f} />
      <TagPlate x={960} y={240} text="3つ" size={54} t={seg(f, 28, 40)} color={C3.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #57 測って、並べて、貼り出す。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
const S57: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={956} bg={C3.plaster}>
    <YakushoWall f={f} k={2} />
    <ToolShelf y={584} />
    <ToolMeasure x={430} y={556} lit={1} />
    <ToolRankSteps x={960} y={532} lit={1} />
    <ToolPostWall x={1490} y={474} lit={1} f={f} />
    {/* 3つが1本の流れにつながる */}
    <Arrow x={745} y={520} s={1.15} t={seg(f, 6, 18)} color={C3.red} />
    <Arrow x={1300} y={500} s={1.15} t={seg(f, 18, 30)} color={C3.red} />
    <TagPlate x={430} y={735} text="測る" size={44} t={seg(f, 2, 12)} />
    <TagPlate x={960} y={735} text="並べる" size={44} t={seg(f, 12, 22)} />
    <TagPlate x={1490} y={735} text="貼り出す" size={44} t={seg(f, 24, 36)} />
  </Frame>
);

// ------------------------------------------------------------------
// #58 順位という仕組みに必要な3点セットが、帝国の規模で完成したのです。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
const S58: React.FC<{ f: number }> = ({ f }) => {
  const m = easeOut(seg(f, 4, 30));
  const spin = f * 3.4;
  // 道具が中央に寄り終わったころからカメラが中央へ寄る (寄せたあとも息をする)
  const ZCX = 960, ZCY = 420;
  const zcam = lerp(1, 1.26, easeOut(seg(f, 20, 42))) * (1 + Math.sin(f / 30) * 0.008);
  return (
    <Frame f={f} seed={957} bg={C3.plaster}>
      <g transform={zoomAt(zcam, ZCX, ZCY)}>
        <YakushoWall f={f} k={2} />
        {/* 背後に立ち上がる帝国の輪郭 */}
        <g opacity={0.3 * m}>
          <path d="M 360 600 L 420 420 L 560 350 L 760 318 L 960 300 L 1180 318 L 1370 356 L 1500 426 L 1560 600 Z"
            fill={C3.robe} opacity={0.4} />
          <path d="M 360 600 L 420 420 L 560 350 L 760 318 L 960 300 L 1180 318 L 1370 356 L 1500 426 L 1560 600"
            fill="none" stroke={C3.ink} strokeWidth={5} />
          {[520, 700, 900, 1100, 1300].map((tx, i) => (
            <g key={tx}>
              <rect x={tx - 26} y={430 + (i % 2) * 30} width={52} height={170}
                fill={C3.plasterShade} stroke={C3.ink} strokeWidth={3.5} />
              <path d={`M ${tx - 38} ${430 + (i % 2) * 30} L ${tx} ${398 + (i % 2) * 30} L ${tx + 38} ${430 + (i % 2) * 30} Z`}
                fill={C3.tile} stroke={C3.ink} strokeWidth={3.5} />
            </g>
          ))}
        </g>
        <ToolShelf y={584} />
        {/* 3つが中央へ寄って1つの装置に合体 */}
        <ToolMeasure x={lerp(430, 806, m)} y={lerp(556, 568, m)} s={lerp(1, 0.78, m)} lit={1} />
        <ToolRankSteps x={lerp(960, 960, m)} y={lerp(532, 520, m)} s={lerp(1, 0.8, m)} lit={1} />
        <ToolPostWall x={lerp(1490, 1138, m)} y={lerp(474, 466, m)} s={lerp(1, 0.78, m)} lit={1} f={f} />
        {/* かみ合う歯車 */}
        {[[820, 352], [960, 320], [1100, 352]].map(([gx, gy], i) => (
          <g key={i} opacity={m} transform={`translate(${gx} ${gy}) rotate(${i % 2 ? -spin : spin})`}>
            <circle cx={0} cy={0} r={38} fill={C3.tileDark} stroke={C3.ink} strokeWidth={5} />
            {Array.from({ length: 8 }, (_, j) => (
              <rect key={j} x={-7} y={-52} width={14} height={16} fill={C3.tileDark}
                stroke={C3.ink} strokeWidth={3} transform={`rotate(${j * 45})`} />
            ))}
            <circle cx={0} cy={0} r={13} fill={C3.gold} stroke={C3.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 装置をくるむ枠 */}
        <rect x={lerp(960, 730, m)} y={lerp(540, 300, m)} width={lerp(0, 460, m)} height={lerp(0, 330, m)}
          rx={16} fill="none" stroke={C3.red} strokeWidth={6} opacity={0.75 * m} />
        {/* 札もカメラに乗せる。ズーム1.26・中心(960,420)でも上端 y≈140・左右 746〜1174 で切れない */}
        <TagPlate x={960} y={240} text="帝国の規模で" size={50} t={seg(f, 26, 40)} color={C3.red} />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #59 戦場ひとつだった土俵は、一気に国の大きさになりました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
const S59: React.FC<{ f: number }> = ({ f }) => {
  const CX = 830, CY = 500;
  const grow = easeOut(seg(f, 6, 34));
  const R2 = lerp(96, 236, grow);
  const breathe = 1 + Math.sin(f / 9) * 0.025;
  return (
    <Frame f={f} seed={958} bg={C3.plaster}>
      <g transform={zoomAt(lerp(1.12, 1.0, easeOut(seg(f, 0, 30))), CX, CY)}>
        <ScrollDesk f={f} idk="59" px={150} py={196} pw={1620} ph={568}>
          {/* 絵図の山と川 (薄く) */}
          <g opacity={0.3}>
            {[[320, 300], [520, 262], [1340, 290], [1560, 252]].map(([mx, my], i) => (
              <path key={i} d={`M ${mx - 70} ${my + 54} L ${mx} ${my} L ${mx + 70} ${my + 54} Z`}
                fill={C3.leaf} stroke={C3.mapLine} strokeWidth={3} />
            ))}
            <path d="M 180 700 Q 520 630 820 690 Q 1140 750 1740 672" fill="none"
              stroke={C3.mapLine} strokeWidth={9} />
          </g>
          {/* 第2章#47 の赤い小円 (R=88・正円・破線で残る) */}
          <g transform={`translate(${CX} ${CY}) scale(${breathe}) translate(${-CX} ${-CY})`}>
            <DohyoRing cx={CX} cy={CY} r={88} color={KRP.red} sw={7} dash op={0.95} />
          </g>
          {/* その外へ1段広がる帝国の輪 */}
          <DohyoRing cx={CX} cy={CY} r={R2} color={C3.redDeep} sw={8} op={0.9} />
          <DohyoRing cx={CX} cy={CY} r={lerp(96, 168, grow)} color={C3.mapLine} sw={5} op={0.5} dash />
          {/* 広がった波紋 */}
          <DohyoRing cx={CX} cy={CY} r={R2 + 34 + Math.sin(f / 8) * 8} color={C3.redDeep}
            sw={3} op={0.28 * grow} />
          {/* 輪の上にいる人々 (帝国の受験生) */}
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            return (
              <PersonMini key={i} x={CX + Math.cos(a) * R2} y={CY + Math.sin(a) * R2 + 26}
                s={0.17} color={C3.robeGrayDark} f={f} phase={i * 3} face="none" arms="down" />
            );
          })}
          {/* 中心の小さな人 */}
          <PersonMini x={CX} y={CY + 42} s={0.3} color={C3.robe} f={f} phase={1}
            face="dot" arms="down" />
          {/* 引き出し線 */}
          <line x1={CX + 88} y1={CY + 56} x2={1366} y2={650} stroke={C3.ink}
            strokeWidth={3} opacity={0.6} strokeDasharray="10 8" />
          <line x1={CX + R2 * 0.72} y1={CY - R2 * 0.68} x2={1346} y2={420} stroke={C3.ink}
            strokeWidth={3} opacity={0.6} strokeDasharray="10 8" />
        </ScrollDesk>
      </g>
      {/* 縦に積む札は左端をそろえる (TagPlate の x は中心なので字数で x をずらす)。
          幅 = 字数×size+44 → 「戦場ひとつ」264 / 「ぐっと広がる」308。左端をどちらも 1368 に。 */}
      <TagPlate x={1500} y={650} text="戦場ひとつ" size={44} t={seg(f, 2, 14)} />
      <TagPlate x={1522} y={420} text="ぐっと広がる" size={44} t={seg(f, 24, 38)} color={C3.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #60 ただし、この土俵に乗れるのは、試験を受けるほんの一部の人だけ。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB3.md に合わせる
// ------------------------------------------------------------------
const S60: React.FC<{ f: number }> = ({ f }) => {
  const step = easeOut(seg(f, 4, 40));
  const GX = 960;
  return (
    <Frame f={f} seed={959} bg={C3.sky}>
      <rect x={0} y={0} width={W} height={400} fill={C3.sky} />
      {/* 塀の瓦 */}
      <TiledRoof cx={960} y={300} w={2060} h={62} />
      {/* 塀 */}
      <rect x={0} y={362} width={W} height={392} fill={C3.plaster} stroke={C3.ink} strokeWidth={4} />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={rnd(i + 21) * W} cy={380 + rnd(i + 47) * 350}
          rx={60 + rnd(i + 66) * 80} ry={22 + rnd(i + 91) * 24} fill={C3.plasterShade} opacity={0.3} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`p${i}`} x={60 + i * 216} y={362} width={22} height={392}
          fill={C3.wood} stroke={C3.ink} strokeWidth={3.5} opacity={0.55} />
      ))}
      {/* たった1つの門 */}
      <g>
        <rect x={GX - 110} y={410} width={220} height={344} fill={C3.brickDark}
          stroke={C3.ink} strokeWidth={5} />
        <path d={`M ${GX - 76} 754 L ${GX - 76} 492 Q ${GX} 420 ${GX + 76} 492 L ${GX + 76} 754 Z`}
          fill={C3.sumi} stroke={C3.ink} strokeWidth={5} />
        <TiledRoof cx={GX} y={356} w={300} h={58} />
      </g>
      <StoneFloor y={752} k={5} />
      {/* 門をくぐる細い列 */}
      {Array.from({ length: 4 }, (_, i) => {
        const t = i / 3;
        return (
          <PersonMini key={`in${i}`} x={GX + (i % 2 ? 16 : -16) * (1 - t)}
            y={812 - t * 90 - step * 14} s={0.4 - t * 0.14}
            color={C3.robe} f={f} phase={i * 5} face="none" arms="down" />
        );
      })}
      {/* 塀の外に残る大勢 */}
      {Array.from({ length: 8 }, (_, i) => (
        <PersonMini key={`l${i}`} x={140 + i * 86} y={800 + (i % 2) * 22} s={0.42}
          color={i % 2 ? C3.robeGray : C3.robeGrayDark} f={f} phase={i * 4} face="dot" arms="down" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <PersonMini key={`r${i}`} x={1200 + i * 86} y={806 + (i % 2) * 20} s={0.42}
          color={i % 2 ? C3.robeGrayDark : C3.robeGray} f={f} phase={i * 6 + 3} face="dot" arms="down" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <PersonMini key={`m${i}`} x={110 + i * 74} y={772} s={0.3}
          color={C3.robeGrayDark} f={f} phase={i * 3} face="none" arms="down" />
      ))}
      {/* 通れる人の数を点で数える (赤い4つだけが門を通る) */}
      <g>
        {Array.from({ length: 36 }, (_, i) => {
          const dx = 250 + i * 40;
          const on = i >= 16 && i <= 19;
          const t = Math.min(1, Math.max(0, (f - 6 - i * 0.6) / 7));
          return (
            <circle key={i} cx={dx} cy={214} r={on ? 11 : 7}
              fill={on ? C3.red : C3.plasterShade} stroke={C3.ink}
              strokeWidth={on ? 3.5 : 2} opacity={t * (on ? 1 : 0.65)} />
          );
        })}
        <line x1={GX} y1={232} x2={GX} y2={340} stroke={C3.red} strokeWidth={4}
          opacity={0.6} strokeDasharray="10 8" />
      </g>
      <TagPlate x={1480} y={124} text="ほんの一部" size={50} t={seg(f, 26, 40)} color={C3.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #61 用のローカル部品: 庶民 (士大夫の長袍ではなく、短い上衣・帯・脚絆・わらじ・頭巾)
//   足もとを y=0 に置く。立ち姿の総高は約 240 なので s=1 で塀の前の中景にちょうど合う。
//   腕は armL / armR の角度で、仕事ごとに付け替える。
// ------------------------------------------------------------------
const SHO_ARM_PIVOT = -156;

const Shomin: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  cloth?: string; clothDark?: string; sash?: string; kerchief?: string;
  armL?: number; armR?: number; lean?: number;
  face?: "dot" | "smile" | "none"; head?: "kerchief" | "topknot";
}> = ({
  x, y, s = 1, f, phase = 0,
  cloth = C3.robeGray, clothDark = C3.robeGrayDark, sash = C3.woodDark,
  kerchief = C3.paperDark, armL = 0, armR = 0, lean = 0,
  face = "dot", head = "kerchief",
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 2.4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <ellipse cx={0} cy={2} rx={48} ry={11} fill={C3.stoneLine} opacity={0.42} />
      {/* わらじ */}
      {[-17, 17].map((fx) => (
        <g key={fx}>
          <ellipse cx={fx} cy={-6} rx={21} ry={9} fill={C3.paperDark}
            stroke={C3.ink} strokeWidth={3.5} />
          {[-9, 0, 9].map((sx) => (
            <line key={sx} x1={fx + sx} y1={-12} x2={fx + sx} y2={-2}
              stroke={C3.woodDark} strokeWidth={2} opacity={0.8} />
          ))}
        </g>
      ))}
      {/* 脚絆 (すねに巻いた布) */}
      {[-17, 17].map((lx) => (
        <g key={lx}>
          <rect x={lx - 11} y={-88} width={22} height={78} rx={6}
            fill={clothDark} stroke={C3.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={lx - 11} y1={-74 + i * 20} x2={lx + 11} y2={-70 + i * 20}
              stroke={C3.ink} strokeWidth={2.4} opacity={0.55} />
          ))}
        </g>
      ))}
      {/* 腕 (胴の後ろ) */}
      <rect x={-50} y={-162} width={19} height={76} rx={9.5} fill={cloth}
        stroke={C3.ink} strokeWidth={4.5} transform={`rotate(${armL} -40 ${SHO_ARM_PIVOT})`} />
      <rect x={31} y={-162} width={19} height={76} rx={9.5} fill={cloth}
        stroke={C3.ink} strokeWidth={4.5} transform={`rotate(${armR} 40 ${SHO_ARM_PIVOT})`} />
      {/* 短い上衣 (腿までの丈。長袍ではない) */}
      <path d="M -40 -170 L 40 -170 L 47 -80 L -47 -80 Z" fill={cloth}
        stroke={C3.ink} strokeWidth={5} />
      <path d="M -40 -168 Q 0 -150 40 -168" fill="none" stroke={clothDark}
        strokeWidth={3} opacity={0.55} />
      <path d="M -22 -172 L 0 -132 L 22 -172" fill="none" stroke={C3.ink} strokeWidth={4.5} />
      {/* 帯と結び目 */}
      <rect x={-46} y={-118} width={92} height={18} rx={5} fill={sash}
        stroke={C3.ink} strokeWidth={4} />
      <rect x={21} y={-116} width={19} height={32} rx={5} fill={sash}
        stroke={C3.ink} strokeWidth={3.5} />
      {/* 頭 */}
      <circle cx={0} cy={-200} r={30} fill={KRP.white} stroke={C3.ink} strokeWidth={5} />
      {face !== "none" && (
        <g>
          <circle cx={-10} cy={-204} r={4.2} fill={C3.ink} />
          <circle cx={10} cy={-204} r={4.2} fill={C3.ink} />
          {face === "smile" && (
            <path d="M -9 -190 Q 0 -182 9 -190" fill="none" stroke={C3.ink}
              strokeWidth={4} strokeLinecap="round" />
          )}
        </g>
      )}
      {head === "kerchief" ? (
        /* 頭に巻いた布 (巾) */
        <g>
          <path d="M -31 -210 Q -29 -242 0 -242 Q 29 -242 31 -210 Q 0 -224 -31 -210 Z"
            fill={kerchief} stroke={C3.ink} strokeWidth={4} />
          <path d="M 27 -217 Q 48 -211 43 -190" fill="none" stroke={kerchief}
            strokeWidth={9} strokeLinecap="round" />
          <path d="M 27 -217 Q 48 -211 43 -190" fill="none" stroke={C3.ink}
            strokeWidth={2.2} opacity={0.45} />
        </g>
      ) : (
        /* 子どもの髷 */
        <g>
          <path d="M -30 -212 Q -24 -238 0 -238 Q 24 -238 30 -212 Q 0 -226 -30 -212 Z" fill={C3.sumi} />
          <circle cx={0} cy={-242} r={11} fill={C3.sumi} stroke={C3.ink} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// 庶民の手に持たせる小道具。Shomin とまったく同じ変換を重ねるので、腕を振っても手から離れない。
//   子要素は「肩のつけ根が原点・腕にそって +y」の座標で描く (手は (0,66) の位置)。
const ShominHand: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  side: "L" | "R"; arm: number; lean?: number; children?: React.ReactNode;
}> = ({ x, y, s = 1, f, phase = 0, side, arm, lean = 0, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 2.4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean}) `
      + `translate(${side === "L" ? -40 : 40} ${SHO_ARM_PIVOT}) rotate(${arm})`}>
      {children}
    </g>
  );
};

// 点を deg 度まわす (SVG と同じ向き)。腕の先がどこに来るかを計算するのに使う
const rotPt = (px: number, py: number, deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180;
  return [px * Math.cos(r) - py * Math.sin(r), px * Math.sin(r) + py * Math.cos(r)];
};

// 床几に腰かけた庶民 (y は腰の高さ = 床几の座面)。団扇をあおぐ
const ShominSit: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  cloth?: string; clothDark?: string;
}> = ({ x, y, s = 1, f, phase = 0, cloth = C3.robeGray, clothDark = C3.robeGrayDark }) => {
  const sway = Math.sin((f + phase * 13) / 16) * 2.2;
  const fan = Math.sin(f / 5) * 16;
  return (
    <g transform={`translate(${x} ${y + sway}) scale(${s})`}>
      {/* すね + わらじ */}
      {[[-58, 0], [-40, 3]].map(([lx, dy], i) => (
        <g key={i}>
          <rect x={lx - 10} y={0 + dy} width={21} height={58} rx={6}
            fill={clothDark} stroke={C3.ink} strokeWidth={4} />
          {[0, 1].map((r) => (
            <line key={r} x1={lx - 10} y1={16 + dy + r * 20} x2={lx + 11} y2={20 + dy + r * 20}
              stroke={C3.ink} strokeWidth={2.4} opacity={0.55} />
          ))}
          <ellipse cx={lx} cy={60 + dy} rx={20} ry={9} fill={C3.paperDark}
            stroke={C3.ink} strokeWidth={3.5} />
        </g>
      ))}
      {/* 腿 (座面の上) */}
      <path d="M 8 -24 L -62 -20 L -66 4 L 10 6 Z" fill={clothDark}
        stroke={C3.ink} strokeWidth={4.5} />
      {/* うしろ手 */}
      <rect x={8} y={-86} width={18} height={62} rx={9} fill={cloth}
        stroke={C3.ink} strokeWidth={4.5} transform="rotate(16 16 -84)" />
      {/* 胴 (前かがみ) */}
      <path d="M -33 -102 L 33 -102 L 40 -14 L -38 -16 Z" fill={cloth}
        stroke={C3.ink} strokeWidth={5} />
      <path d="M -18 -104 L 0 -68 L 18 -104" fill="none" stroke={C3.ink} strokeWidth={4.5} />
      <rect x={-38} y={-50} width={78} height={16} rx={5} fill={C3.woodDark}
        stroke={C3.ink} strokeWidth={4} />
      {/* 団扇をあおぐ腕 */}
      <g transform={`rotate(${fan} -28 -92)`}>
        <rect x={-46} y={-96} width={18} height={56} rx={9} fill={cloth}
          stroke={C3.ink} strokeWidth={4.5} />
        <line x1={-37} y1={-96} x2={-37} y2={-126} stroke={C3.woodDark} strokeWidth={6} />
        <ellipse cx={-37} cy={-146} rx={26} ry={22} fill={C3.paper}
          stroke={C3.ink} strokeWidth={4} />
        {[-14, 0, 14].map((rx) => (
          <line key={rx} x1={-37} y1={-126} x2={-37 + rx} y2={-164}
            stroke={C3.mapLine} strokeWidth={2.4} opacity={0.7} />
        ))}
      </g>
      {/* 頭 + 巾 */}
      <circle cx={0} cy={-132} r={29} fill={KRP.white} stroke={C3.ink} strokeWidth={5} />
      <circle cx={-10} cy={-136} r={4.2} fill={C3.ink} />
      <circle cx={10} cy={-136} r={4.2} fill={C3.ink} />
      <path d="M -30 -142 Q -28 -173 0 -173 Q 28 -173 30 -142 Q 0 -156 -30 -142 Z"
        fill={C3.paperDark} stroke={C3.ink} strokeWidth={4} />
    </g>
  );
};

// 天秤棒の行商 (棒がしなり、両端の籠が揺れる)
const TenbinUri: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({
  x, y, s = 1, f, phase = 0,
}) => {
  const rock = Math.sin((f + phase * 9) / 11) * 3.4;
  return (
    <g>
      <Shomin x={x} y={y} s={s} f={f} phase={phase} cloth={C3.robeGrayDark}
        clothDark={C3.robeGray} sash={C3.red} armL={-14} armR={-62} face="dot" />
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rock})`}>
        {/* 肩の天秤棒 */}
        <rect x={-116} y={-196} width={232} height={13} rx={6.5} fill={C3.wood}
          stroke={C3.ink} strokeWidth={4} />
        {[-104, 104].map((bx, i) => (
          <g key={bx} transform={`rotate(${-rock * 1.6} ${bx} -190)`}>
            {/* 吊り縄 */}
            <line x1={bx - 26} y1={-188} x2={bx} y2={-124} stroke={C3.woodDark} strokeWidth={3.2} />
            <line x1={bx + 26} y1={-188} x2={bx} y2={-124} stroke={C3.woodDark} strokeWidth={3.2} />
            {/* 籠 */}
            <path d={`M ${bx - 40} -120 L ${bx - 31} -62 L ${bx + 31} -62 L ${bx + 40} -120 Z`}
              fill={C3.paperDark} stroke={C3.ink} strokeWidth={4.5} />
            {[-26, 0, 26].map((lx) => (
              <line key={lx} x1={bx + lx * 0.84} y1={-118} x2={bx + lx * 0.66} y2={-64}
                stroke={C3.woodDark} strokeWidth={2.8} />
            ))}
            <ellipse cx={bx} cy={-120} rx={34} ry={10}
              fill={i ? C3.gold : C3.leaf} stroke={C3.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------
// #61 庶民はまだ、観客席にいます。
// 格: 山 — 塀の外の町。水売り・籠の行商・天秤棒・店主・床几の客・子ども
// ------------------------------------------------------------------
const S61: React.FC<{ f: number }> = ({ f }) => {
  const flap = Math.sin(f / 10) * 7;
  // 水売り。dip 0 = 柄杓を立てる / 1 = 椀に注ぐ
  const dip = (Math.sin(f / 9) + 1) / 2;
  const armA = 84 + dip * 6;                        // 柄杓を持つ腕の角度
  const ladleT = -6 - dip * 30;                     // 手のところで柄杓が傾く
  // 柄杓の口の世界座標 (腕 → 柄杓 の回転をたどる。手は腕のつけ根から 66)
  const [lqx, lqy] = rotPt(0, 170 - 66, ladleT);
  const [spx, spy] = rotPt(lqx, 66 + lqy, armA);
  const SPX = 408 - 40 + spx;
  const SPY = 758 + Math.sin(f / 13) * 2.4 + SHO_ARM_PIVOT + spy;
  // 子どもの椀の世界座標 (同じたどり方。子どもは s=0.76 phase=3)
  const childArm = -50 + Math.sin(f / 11) * 4;
  const [bwx, bwy] = rotPt(0, 74, childArm);
  const BWX = 160 + (40 + bwx) * 0.76;
  const BWY = 790 + Math.sin((f + 51) / 13) * 2.4 + (SHO_ARM_PIVOT + bwy) * 0.76;
  const shopArm = -148 + Math.sin(f / 8) * 8;       // 店主が品をかかげる腕
  const pedArm = 44 + Math.sin(f / 10) * 9;         // 籠の行商が菜を見せる腕
  return (
    <Frame f={f} seed={960} bg={C3.sky}>
      <rect x={0} y={0} width={W} height={330} fill={C3.sky} />
      {/* 塀の向こう (奥の役所の屋根) */}
      <TiledRoof cx={700} y={140} w={760} h={64} op={0.5} />
      <TiledRoof cx={1520} y={158} w={620} h={58} op={0.42} />
      {/* 塀 */}
      <TiledRoof cx={960} y={286} w={2060} h={56} />
      <rect x={0} y={342} width={W} height={236} fill={C3.plaster} stroke={C3.ink} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={rnd(i + 8) * W} cy={360 + rnd(i + 55) * 200}
          rx={56 + rnd(i + 72) * 70} ry={18 + rnd(i + 96) * 20} fill={C3.plasterShade} opacity={0.3} />
      ))}
      <StoneFloor y={578} k={6} />
      {/* 露店 (布の屋根)。店主 → 台 の順に描いて、腰から下を台で隠す */}
      <g>
        <rect x={1176} y={430} width={14} height={300} fill={C3.wood} stroke={C3.ink} strokeWidth={3.5} />
        <rect x={1664} y={430} width={14} height={300} fill={C3.wood} stroke={C3.ink} strokeWidth={3.5} />
        <path d={`M 1150 440 Q 1430 ${404 + flap} 1704 440 L 1704 476 Q 1430 ${440 + flap} 1150 476 Z`}
          fill={C3.red} stroke={C3.ink} strokeWidth={4.5} opacity={0.9} />
        {/* 店主 (台のうしろで品をかかげる)。腰から下は台で隠れる */}
        <Shomin x={1432} y={726} s={0.82} f={f} phase={2} cloth={C3.robeGray}
          clothDark={C3.robeGrayDark} sash={C3.redDeep} kerchief={C3.sea}
          armL={10} armR={shopArm} face="smile" />
        <rect x={1180} y={596} width={496} height={28} fill={C3.wood} stroke={C3.ink} strokeWidth={4.5} />
        <rect x={1200} y={624} width={20} height={106} fill={C3.woodDark} stroke={C3.ink} strokeWidth={3.5} />
        <rect x={1636} y={624} width={20} height={106} fill={C3.woodDark} stroke={C3.ink} strokeWidth={3.5} />
        {/* 台の上の品。店主の頭 (x 1407〜1457) とかかげた品の通り道をあけて左右に寄せる */}
        {[1216, 1294, 1372, 1566, 1644].map((bx, i) => (
          <ellipse key={bx} cx={bx} cy={580} rx={30} ry={18} fill={i % 2 ? C3.leaf : C3.gold}
            stroke={C3.ink} strokeWidth={3.5} />
        ))}
        {/* かかげた瓜。品より後に描くので手前に出る */}
        <ShominHand x={1432} y={726} s={0.82} f={f} phase={2} side="R" arm={shopArm}>
          <ellipse cx={0} cy={72} rx={30} ry={26} fill={C3.leaf} stroke={C3.ink} strokeWidth={5} />
          <path d="M -14 60 Q 0 50 14 60" fill="none" stroke={C3.ink} strokeWidth={3} opacity={0.5} />
          <line x1={0} y1={46} x2={0} y2={30} stroke={C3.woodDark} strokeWidth={6} />
        </ShominHand>
      </g>
      {/* 天秤棒の行商 (塀ぞいを行く) */}
      <TenbinUri x={1016} y={768} s={1.04} f={f} phase={5} />
      {/* 水売りの甕 */}
      <g transform="translate(318 756)">
        <path d="M -74 0 Q -94 -98 -48 -140 L 48 -140 Q 94 -98 74 0 Z" fill={C3.tileDark}
          stroke={C3.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-140} rx={50} ry={16} fill={C3.sumi} stroke={C3.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-142} rx={34} ry={9} fill={C3.sea} opacity={0.7} />
        <path d="M -78 -66 Q -104 -62 -100 -34" fill="none" stroke={C3.ink} strokeWidth={6} />
      </g>
      {/* 水売り (甕の横に立ち、柄杓を傾けて子どもの椀に注ぐ) */}
      <Shomin x={408} y={758} s={1} f={f} phase={0} cloth={C3.sea} clothDark={C3.tileDark}
        sash={C3.woodDark} kerchief={C3.robeGray} armL={armA} armR={14} face="dot" />
      {/* 柄杓。手 (0 66) のところで傾くので、腕を振っても手から離れない */}
      <ShominHand x={408} y={758} s={1} f={f} phase={0} side="L" arm={armA}>
        <g transform={`rotate(${ladleT} 0 66)`}>
          <rect x={-6} y={24} width={12} height={112} rx={6} fill={C3.wood}
            stroke={C3.ink} strokeWidth={3.5} />
          <path d="M -24 136 L -19 174 L 19 174 L 24 136 Z" fill={C3.paperDark}
            stroke={C3.ink} strokeWidth={4} />
          <ellipse cx={0} cy={140} rx={22} ry={7} fill={C3.sea} opacity={0.75} />
        </g>
      </ShominHand>
      {/* 注がれる水の筋 (柄杓の口 → 椀。どちらも腕をたどって出した座標) */}
      <path d={`M ${SPX} ${SPY} Q ${SPX + 5} ${(SPY + BWY) / 2} ${BWX} ${BWY - 8}`} fill="none"
        stroke={C3.sea} strokeWidth={6} strokeLinecap="round"
        opacity={0.6 * clamp01((dip - 0.42) / 0.3)} />
      {/* 椀を差し出す子ども (髷・短い上衣。脚絆は巻かない年ごろ) */}
      <Shomin x={160} y={790} s={0.76} f={f} phase={3} cloth={C3.gold}
        clothDark={C3.woodDark} sash={C3.red} armL={12} armR={childArm}
        face="smile" head="topknot" />
      <ShominHand x={160} y={790} s={0.76} f={f} phase={3} side="R" arm={childArm}>
        <ellipse cx={0} cy={74} rx={33} ry={13} fill={C3.paper}
          stroke={C3.ink} strokeWidth={5} />
        <ellipse cx={0} cy={71} rx={21} ry={6} fill={C3.sea} opacity={0.6} />
      </ShominHand>
      {/* 籠 */}
      <g transform="translate(470 756)">
        <path d="M -52 0 L -40 -72 L 40 -72 L 52 0 Z" fill={C3.paperDark}
          stroke={C3.ink} strokeWidth={4.5} />
        {[-50, -26, 0, 26, 50].map((lx) => (
          <line key={lx} x1={lx * 0.82} y1={-70} x2={lx} y2={-2} stroke={C3.woodDark} strokeWidth={3} />
        ))}
        <ellipse cx={0} cy={-72} rx={42} ry={12} fill={C3.leaf} stroke={C3.ink} strokeWidth={4} />
      </g>
      {/* 籠の行商 (菜をひと束つかんで客に見せる) */}
      <Shomin x={584} y={762} s={1.02} f={f} phase={4} cloth={C3.brick}
        clothDark={C3.brickDark} sash={C3.sumi} kerchief={C3.woodDark}
        armL={pedArm} armR={-16} face="dot" />
      {/* 菜の束。手のところで -44 戻すので、世界では立ったまま腕のゆれぶんだけ揺れる */}
      <ShominHand x={584} y={762} s={1.02} f={f} phase={4} side="L" arm={pedArm}>
        <g transform="rotate(-44 0 66)">
          <line x1={0} y1={66} x2={0} y2={20} stroke={C3.woodDark} strokeWidth={5} />
          {[-26, -8, 10, 28].map((lx, i) => (
            <path key={lx} d={`M 0 26 Q ${lx} ${-i * 5} ${lx * 1.25} ${26 - i * 7}`}
              fill="none" stroke={C3.leaf} strokeWidth={9} strokeLinecap="round" />
          ))}
        </g>
      </ShominHand>
      {/* 床几 (腰掛け) */}
      <g transform="translate(790 752)">
        <rect x={-96} y={-56} width={192} height={20} rx={6} fill={C3.wood}
          stroke={C3.ink} strokeWidth={4.5} />
        <line x1={-72} y1={-36} x2={-56} y2={0} stroke={C3.woodDark} strokeWidth={9} />
        <line x1={72} y1={-36} x2={56} y2={0} stroke={C3.woodDark} strokeWidth={9} />
      </g>
      {/* 床几で一息いれる人 (団扇をあおぐ) */}
      <ShominSit x={830} y={694} s={0.98} f={f} phase={1} />
      <TagPlate x={1500} y={300} text="観客席" size={54} t={seg(f, 20, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #62 次の舞台はヨーロッパ。順位が「学校」と出会います。
// 格: 並 — 港。舫をとく帆船が西へ出る。水平線に西洋の校舎と尖塔の影。手前に海図と羅針
// ------------------------------------------------------------------
const S62: React.FC<{ f: number }> = ({ f }) => {
  const sail = easeOut(seg(f, 4, 40));          // 船が西 (左) へ出る
  const sx = lerp(1180, 760, sail);
  const sy = 470 + Math.sin(f / 13) * 5;        // うねり
  const roll = Math.sin(f / 15) * 1.8;
  const needle = -32 + Math.sin(f / 9) * 3;     // 羅針の針
  const HZ = 452;                               // 水平線
  return (
    <Frame f={f} seed={961} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={HZ} fill={C3.sky} />
      <rect x={0} y={HZ - 92} width={W} height={92} fill={C3.skyWarm} opacity={0.45} />
      {[...Array(5)].map((_, i) => {
        const cx = 200 + i * 400 + Math.sin((f + i * 30) / 40) * 14;
        return (
          <ellipse
            key={`cl${i}`}
            cx={cx}
            cy={150 + rnd(i * 7 + 2) * 90}
            rx={120 + rnd(i * 3) * 70}
            ry={30 + rnd(i * 5) * 14}
            fill={KRP.white}
            opacity={0.5}
          />
        );
      })}

      {/* 水平線の向こう: 西洋の校舎と尖塔のシルエット (薄く) */}
      <g opacity={0.26}>
        {/* 尖塔 */}
        <polygon points="1520,206 1554,272 1486,272" fill={C3.ink} />
        <rect x={1492} y={272} width={56} height={176} fill={C3.ink} />
        <rect x={1504} y={312} width={14} height={34} fill={C3.sky} opacity={0.6} />
        <rect x={1526} y={312} width={14} height={34} fill={C3.sky} opacity={0.6} />
        {/* 校舎本体 */}
        <rect x={1252} y={330} width={232} height={118} fill={C3.ink} />
        <polygon points="1252,330 1368,284 1484,330" fill={C3.ink} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={`w${i}`} x={1276 + i * 54} y={364} width={22} height={44} fill={C3.sky} opacity={0.55} />
        ))}
        {/* 右端の小塔 */}
        <rect x={1584} y={364} width={74} height={84} fill={C3.ink} />
        <polygon points="1584,364 1621,320 1658,364" fill={C3.ink} />
      </g>

      {/* 海 */}
      <rect x={0} y={HZ} width={W} height={H - HZ} fill={C3.sea} />
      {[...Array(13)].map((_, i) => {
        const y = HZ + 16 + i * 32;
        const ph = (f + i * 11) / 15;
        return (
          <path
            key={`wv${i}`}
            d={`M ${-40 + Math.sin(ph) * 18} ${y} q 90 ${i % 2 ? -8 : 8} 180 0 q 90 ${i % 2 ? 8 : -8} 180 0 q 90 ${i % 2 ? -8 : 8} 180 0 q 90 ${i % 2 ? 8 : -8} 180 0 q 90 ${i % 2 ? -8 : 8} 180 0 q 90 ${i % 2 ? 8 : -8} 180 0 q 90 ${i % 2 ? -8 : 8} 180 0`}
            stroke={C3.ink}
            strokeWidth={2.2}
            fill="none"
            opacity={0.13 + i * 0.012}
          />
        );
      })}
      {/* きらめき */}
      {[...Array(16)].map((_, i) => (
        <ellipse
          key={`gl${i}`}
          cx={60 + rnd(i * 13 + 1) * 1800}
          cy={HZ + 20 + rnd(i * 9 + 4) * 300}
          rx={14 + rnd(i * 5) * 12}
          ry={2.6}
          fill={KRP.white}
          opacity={0.3 + Math.abs(Math.sin((f + i * 17) / 12)) * 0.3}
        />
      ))}

      {/* 帆船 (西へ) */}
      <g transform={`translate(${sx} ${sy}) rotate(${roll})`}>
        {/* 水面の影 */}
        <ellipse cx={0} cy={118} rx={210} ry={20} fill={C3.ink} opacity={0.14} />
        {/* 帆柱 */}
        <rect x={-8} y={-312} width={16} height={330} fill={C3.woodDark} stroke={C3.ink} strokeWidth={3} />
        <rect x={-150} y={-176} width={14} height={198} fill={C3.woodDark} stroke={C3.ink} strokeWidth={3} />
        {/* 帆 (風をはらんで左へ) */}
        <path
          d={`M 0 -296 q ${-128 - sail * 26} 44 ${-106 - sail * 20} 150 L 0 -146 Z`}
          fill={C3.paper}
          stroke={C3.ink}
          strokeWidth={4.5}
        />
        <path
          d={`M 0 -130 q ${-146 - sail * 24} 40 ${-118 - sail * 18} 118 L 0 -12 Z`}
          fill={C3.paper}
          stroke={C3.ink}
          strokeWidth={4.5}
        />
        <path
          d={`M -142 -168 q -84 30 -66 92 L -142 -42 Z`}
          fill={C3.paperDark}
          stroke={C3.ink}
          strokeWidth={4}
        />
        {/* 帆の継ぎ目 */}
        {[0, 1, 2].map((i) => (
          <path
            key={`sm${i}`}
            d={`M -14 ${-262 + i * 36} q -56 10 -78 26`}
            stroke={C3.ink}
            strokeWidth={2}
            fill="none"
            opacity={0.3}
          />
        ))}
        {/* 索 */}
        <line x1={0} y1={-306} x2={128} y2={-10} stroke={C3.ink} strokeWidth={2.4} opacity={0.55} />
        <line x1={0} y1={-306} x2={-152} y2={-172} stroke={C3.ink} strokeWidth={2.4} opacity={0.55} />
        {/* 船体 */}
        <path
          d="M -188 -4 L 192 -4 L 150 86 L -142 86 Z"
          fill={C3.wood}
          stroke={C3.ink}
          strokeWidth={5}
        />
        <path d="M -188 22 L 186 22" stroke={C3.woodDark} strokeWidth={6} opacity={0.6} />
        <path d="M -176 52 L 170 52" stroke={C3.woodDark} strokeWidth={4} opacity={0.45} />
        {/* 舷窓 */}
        {[0, 1, 2, 3].map((i) => (
          <circle key={`pt${i}`} cx={-108 + i * 72} cy={36} r={11} fill={C3.sumi} stroke={C3.ink} strokeWidth={2.6} opacity={0.8} />
        ))}
        {/* 船首の反り */}
        <path d="M -188 -4 q -26 -18 -14 -44" stroke={C3.ink} strokeWidth={5} fill="none" />
        {/* 乗り手 */}
        <PersonMini x={72} y={-16} s={0.3} color={C3.robe} f={f} phase={3} face="dot" />
        <PersonMini x={-56} y={-16} s={0.28} color={C3.robeGray} f={f} phase={6} face="dot" arms="up" />
      </g>

      {/* 船の航跡 */}
      <path
        d={`M ${sx + 200} ${sy + 110} q 160 10 ${300 + sail * 120} -4`}
        stroke={KRP.white}
        strokeWidth={9}
        fill="none"
        opacity={0.4}
      />

      {/* 手前の岸壁 */}
      <path d="M 0 742 L 2020 742 L 2020 1080 L 0 1080 Z" fill={C3.stone} />
      <StoneFloor y={742} k={7} />
      {/* 岸壁の縁 */}
      <rect x={0} y={736} width={W} height={14} fill={C3.stoneLine} stroke={C3.ink} strokeWidth={3.4} />

      {/* 係船柱と、とけた舫 */}
      <g>
        <rect x={262} y={660} width={52} height={82} rx={10} fill={C3.stoneLine} stroke={C3.ink} strokeWidth={4} />
        <ellipse cx={288} cy={660} rx={34} ry={14} fill={C3.stone} stroke={C3.ink} strokeWidth={4} />
        {/* ほどけた綱 */}
        <path
          d={`M 288 ${652} q 70 ${26 + sail * 14} 150 ${34 + sail * 26} q 90 ${12} 180 ${-6}`}
          stroke={C3.paperDark}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 288 ${652} q 70 ${26 + sail * 14} 150 ${34 + sail * 26} q 90 ${12} 180 ${-6}`}
          stroke={C3.ink}
          strokeWidth={2.4}
          fill="none"
          opacity={0.45}
        />
        {/* 綱の巻き */}
        {[0, 1, 2].map((i) => (
          <ellipse key={`cr${i}`} cx={288} cy={690 + i * 16} rx={32} ry={9} fill="none" stroke={C3.paperDark} strokeWidth={7} />
        ))}
      </g>

      {/* 手前: 海図と羅針 */}
      <g transform="translate(1260 854) rotate(-3)">
        {/* 海図 */}
        <rect x={-300} y={-150} width={620} height={280} rx={8} fill={C3.mapPaper} stroke={C3.ink} strokeWidth={4.5} />
        <rect x={-300} y={-150} width={620} height={280} rx={8} fill={C3.wood} opacity={0.07} />
        {/* 海岸線 */}
        <path
          d="M -258 -96 q 90 36 76 94 q -12 56 70 76"
          stroke={C3.mapLine}
          strokeWidth={4}
          fill="none"
        />
        <path
          d="M 50 -110 q 70 46 50 110 q -16 50 56 74"
          stroke={C3.mapLine}
          strokeWidth={4}
          fill="none"
        />
        {/* 経緯線 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`gx${i}`} x1={-250 + i * 128} y1={-140} x2={-250 + i * 128} y2={120} stroke={C3.mapLine} strokeWidth={1.6} opacity={0.4} />
        ))}
        {[0, 1, 2].map((i) => (
          <line key={`gy${i}`} x1={-294} y1={-80 + i * 76} x2={314} y2={-80 + i * 76} stroke={C3.mapLine} strokeWidth={1.6} opacity={0.4} />
        ))}
        {/* 西を指す矢印 */}
        <path d="M 180 40 L -150 40" stroke={C3.red} strokeWidth={5} opacity={0.85} />
        <polygon points="-150,40 -118,24 -118,56" fill={C3.red} opacity={0.85} />
      </g>

      {/* 羅針 */}
      <g transform="translate(560 862) rotate(4)">
        <ellipse cx={6} cy={70} rx={88} ry={16} fill={C3.ink} opacity={0.16} />
        <circle cx={0} cy={0} r={82} fill={C3.gold} stroke={C3.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={64} fill={C3.paper} stroke={C3.ink} strokeWidth={3.6} />
        {[...Array(8)].map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={`cp${i}`}
              x1={Math.cos(a) * 44}
              y1={Math.sin(a) * 44}
              x2={Math.cos(a) * 60}
              y2={Math.sin(a) * 60}
              stroke={C3.ink}
              strokeWidth={i % 2 ? 2 : 3.6}
              opacity={0.7}
            />
          );
        })}
        <g transform={`rotate(${needle})`}>
          <polygon points="0,-52 11,0 0,10 -11,0" fill={C3.red} stroke={C3.ink} strokeWidth={2.6} />
          <polygon points="0,52 11,0 0,-10 -11,0" fill={KRP.white} stroke={C3.ink} strokeWidth={2.6} />
        </g>
        <circle cx={0} cy={0} r={7} fill={C3.sumi} />
      </g>

      <TagPlate x={400} y={250} text="つぎはヨーロッパ" size={46} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib3_s048:                  (f) => <S48 f={f} />,
  ib3_s049:                  (f) => <S49 f={f} />,
  ib3_s050:                  (f) => <S50 f={f} />,
  ib3_s051:                  (f) => <S51 f={f} />,
  ib3_s052:                  (f) => <S52 f={f} />,
  ib3_s053:                  (f) => <S53 f={f} />,
  ib3_s054:                  (f) => <S54 f={f} />,
  ib3_s055:                  (f) => <S55 f={f} />,
  ib3_s056:                  (f) => <S56 f={f} />,
  ib3_s057:                  (f) => <S57 f={f} />,
  ib3_s058:                  (f) => <S58 f={f} />,
  ib3_s059:                  (f) => <S59 f={f} />,
  ib3_s060:                  (f) => <S60 f={f} />,
  ib3_s061:                  (f) => <S61 f={f} />,
  ib3_s062:                  (f) => <S62 f={f} />,
};

export const I_B3_MOTIFS: string[] = [
  "ib3_s048",                  // #48 第3章、1300年前の、全国模試。
  "ib3_s049",                  // #49 舞台は中国です。隋の時代に始まったとされる、役人の採用試験「科挙」。
  "ib3_s050",                  // #50 家柄ではなく、試験の成績で役人を選ぶ仕組みです。
  "ib3_s051",                  // #51 世界最初の実力主義の制度とされています。
  "ib3_s052",                  // #52 全国から受験生が集まり、約1300年ものあいだ続きました。
  "ib3_s053",                  // #53 この試験のすごさは、合格発表にあります。
  "ib3_s054",                  // #54 その名も「放榜」。合格者の名前を書いた紙を、壁に貼り出すのです。
  "ib3_s055",                  // #55 そして全国1位には、「状元」という特別な称号が与えられました。
  "ib3_s056",                  // #56 ここで、そろいました。
  "ib3_s057",                  // #57 測って、並べて、貼り出す。
  "ib3_s058",                  // #58 順位という仕組みに必要な3点セットが、帝国の規模で完成したのです。
  "ib3_s059",                  // #59 戦場ひとつだった土俵は、一気に国の大きさになりました。
  "ib3_s060",                  // #60 ただし、この土俵に乗れるのは、試験を受けるほんの一部の人だけ。
  "ib3_s061",                  // #61 庶民はまだ、観客席にいます。
  "ib3_s062",                  // #62 次の舞台はヨーロッパ。順位が「学校」と出会います。
];

export const ichiB3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B3_PREVIEW_FRAMES = Math.max(I_B3_MOTIFS.length, 1);
export const IchiB3Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B3_MOTIFS.length - 1);
  return <>{ichiB3Scene(I_B3_MOTIFS[i] ?? "", 45)}</>;
};
