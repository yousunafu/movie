// 「『2位』は、120年前に発明された」: 第4章「首席は英雄 ビリには木のスプーン。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#63〜#77 (15文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで15枚。
// motif 名は必ず ib4_ で始める。WobbleDefs の seed はこのファイルでは 962〜976 を使う。
// 設計書: docs/briefs/IchiB4.md (1文ごとの「格」と絵の中身を決めてから描く)
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
  C4, CobbleGround, StoneWall, GothicWindow, Ivy, Gakusei, Shudoshi,
  NoticeBoard, RankList, WoodenSpoon, Newspaper, PlankRoom, PlankFloor,
  WoodDesk, RuleBook, RotaryPress, DohyoRing, MapDesk,
} from "./IchiB4Parts";

// ------------------------------------------------------------------
// #63 第4章、首席は英雄、ビリには木のスプーン。
// 格: 山 — 章扉。石造学寮の中庭。切石の壁・尖頭窓・蔦・石畳。掲示板へ向かう学生
// ------------------------------------------------------------------
const S63: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.08, 1.0, easeOut(seg(f, 0, 34)));
  const walk = easeOut(seg(f, 2, 40));
  return (
    <Frame
      f={f}
      seed={962}
      bg={KRP.cream}
      over={
        <ChapterDoor
          num={4}
          title="首席は英雄 ビリには木のスプーン。"
          t={seg(f, 10, 28)}
          left={880}
          top={146}
          width={1000}
        />
      }
    >
      <g transform={zoomAt(z, 700, 640)}>
        {/* 空 */}
        <rect x={0} y={0} width={W} height={520} fill={C4.sky} />
        <rect x={0} y={400} width={W} height={120} fill={C4.skyWarm} opacity={0.4} />
        {[...Array(4)].map((_, i) => (
          <ellipse
            key={`cl${i}`}
            cx={180 + i * 480 + Math.sin((f + i * 30) / 44) * 14}
            cy={100 + rnd(i * 7 + 3) * 110}
            rx={130 + rnd(i * 3) * 60}
            ry={32 + rnd(i * 5) * 12}
            fill={KRP.white}
            opacity={0.5}
          />
        ))}

        {/* 遠景の鐘塔 */}
        <g opacity={0.9}>
          <StoneWall x={150} y={96} w={190} h={330} op={0.85} courseH={56} />
          <polygon points="140,96 245,8 350,96" fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4.5} />
          <rect x={236} y={-16} width={18} height={30} fill={C4.ink} />
          <GothicWindow cx={245} y={150} w={78} h={120} op={0.9} />
          {/* 鐘 */}
          <path d="M 222 212 q 23 -34 46 0 L 268 236 L 222 236 Z" fill={C4.gold} stroke={C4.ink} strokeWidth={3.4} opacity={0.8} />
        </g>

        {/* 左の学寮の壁 */}
        <StoneWall x={0} y={330} w={620} h={424} />
        <GothicWindow cx={140} y={400} w={140} h={230} lit />
        <GothicWindow cx={360} y={400} w={140} h={230} />
        <GothicWindow cx={570} y={400} w={140} h={230} lit />
        <Ivy x={260} y={470} h={282} k={1} f={f} />
        {/* 軒 */}
        <rect x={-10} y={312} width={650} height={30} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4.5} />

        {/* 奥の棟 */}
        <StoneWall x={620} y={398} w={700} h={356} op={0.94} />
        <GothicWindow cx={760} y={456} w={120} h={190} />
        <GothicWindow cx={960} y={456} w={120} h={190} lit />
        <GothicWindow cx={1160} y={456} w={120} h={190} />
        <rect x={610} y={380} width={720} height={28} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4.5} />
        {/* 奥の入口 */}
        <path d="M 940 754 L 940 640 Q 970 596 1000 640 L 1000 754 Z" fill={C4.sumi} stroke={C4.ink} strokeWidth={5} opacity={0.85} />

        {/* 右の壁と掲示板 */}
        <StoneWall x={1320} y={300} w={620} h={454} />
        <GothicWindow cx={1850} y={366} w={130} h={200} lit />
        <Ivy x={1390} y={470} h={284} k={4} f={f} />
        <rect x={1310} y={282} width={640} height={30} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4.5} />
        <NoticeBoard x={1452} y={398} w={372} h={290} />

        {/* 石畳 */}
        <CobbleGround y={754} k={1} />

        {/* 掲示板へ向かう学生 (PersonMini の列) */}
        {[
          [1210, 800, 0.5, 2], [1060, 830, 0.56, 5], [900, 860, 0.62, 8],
          [740, 890, 0.66, 11], [560, 920, 0.72, 14], [360, 950, 0.78, 17],
        ].map(([px, py, s, ph], i) => (
          <PersonMini
            key={`pm${i}`}
            x={Number(px) + walk * 70}
            y={Number(py)}
            s={Number(s)}
            color={i % 2 ? C4.gown : C4.gownAlt}
            f={f}
            phase={Number(ph)}
            face="dot"
          />
        ))}
        {/* 掲示板の前に集まる学生 */}
        {[[1500, 790, 0.48, 1], [1600, 796, 0.5, 4], [1700, 790, 0.46, 7]].map(
          ([px, py, s, ph], i) => (
            <PersonMini
              key={`pb${i}`}
              x={Number(px)}
              y={Number(py)}
              s={Number(s)}
              color={C4.gown}
              f={f}
              phase={Number(ph)}
              face="none"
              arms="up"
            />
          ),
        )}

        {/* 手前のガウンの学生 (1人大きく) */}
        <Gakusei x={420} y={1010} s={0.9} f={f} phase={3} face="smile" gaze={[3, -1]} />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #64 1599年、イエズス会という修道会が、学校の規則集を作りました。
// 格: 並 — 修道院の写字机。分厚い規則集を押さえて開く修道士。石壁・尖頭窓・蝋燭・書棚
// ------------------------------------------------------------------
const S64: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 6, 34));
  const flame = Math.sin(f / 4) * 3;
  return (
    <Frame f={f} seed={963} bg={KRP.cream}>
      {/* 石壁 */}
      <StoneWall x={-10} y={-10} w={1940} h={790} courseH={72} />
      {/* 尖頭窓 (奥) */}
      <GothicWindow cx={1520} y={100} w={210} h={330} lit />
      {/* 窓からの光 */}
      <polygon points="1420,430 1630,430 1300,920 820,920" fill={C4.skyWarm} opacity={0.17} />

      {/* 書棚 */}
      <g>
        <rect x={120} y={120} width={370} height={480} fill={C4.woodDark} stroke={C4.ink} strokeWidth={5} />
        {[0, 1, 2].map((r) => (
          <g key={`sh${r}`}>
            <rect x={134} y={136 + r * 156} width={342} height={140} fill={C4.wood} opacity={0.45} />
            <rect x={130} y={272 + r * 156} width={350} height={12} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3} />
            {[...Array(8)].map((_, i) => (
              <rect
                key={`bk${r}_${i}`}
                x={146 + i * 41}
                y={160 + r * 156 + rnd(i * 7 + r * 3) * 16}
                width={30}
                height={110 - rnd(i * 5 + r) * 26}
                fill={i % 3 === 0 ? C4.redDeep : i % 3 === 1 ? C4.leafDark : C4.sumi}
                stroke={C4.ink}
                strokeWidth={2.8}
              />
            ))}
          </g>
        ))}
      </g>

      {/* 蝋燭 */}
      <g transform="translate(1180 540)">
        <ellipse cx={0} cy={96} rx={46} ry={13} fill={C4.ink} opacity={0.15} />
        <path d="M -40 96 L -14 24 L 14 24 L 40 96 Z" fill={C4.gold} stroke={C4.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={24} rx={28} ry={9} fill={C4.gold} stroke={C4.ink} strokeWidth={3.4} />
        <rect x={-11} y={-62} width={22} height={86} fill={KRP.white} stroke={C4.ink} strokeWidth={4} />
        <path d={`M ${flame * 0.3} -62 q ${8 + flame} -22 ${flame * 0.5} -44 q ${-8 + flame} 22 ${flame * 0.3} 44 Z`} fill={C4.red} stroke={C4.ink} strokeWidth={2.8} />
        <ellipse cx={0} cy={-72} rx={66} ry={60} fill={C4.skyWarm} opacity={0.2} />
      </g>

      {/* 板床 */}
      <PlankFloor y={780} k={2} />

      {/* 写字机 (斜めの天板) */}
      <g>
        <ellipse cx={880} cy={1000} rx={420} ry={26} fill={C4.ink} opacity={0.15} />
        {/* 脚 */}
        <rect x={580} y={830} width={32} height={170} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
        <rect x={1148} y={830} width={32} height={170} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
        <rect x={600} y={956} width={560} height={16} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4} />
        {/* 天板 */}
        <rect x={540} y={796} width={680} height={38} rx={8} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5.5} />
        {[0, 1, 2].map((i) => (
          <line key={`dg${i}`} x1={556} y1={806 + i * 10} x2={1204} y2={806 + i * 10} stroke={C4.woodDark} strokeWidth={2.2} opacity={0.35} />
        ))}
        {/* 書見台のあおり */}
        <path d="M 1220 796 L 1252 766 L 1252 804 Z" fill={C4.woodDark} stroke={C4.ink} strokeWidth={4} />
      </g>

      {/* 規則集 (分厚い本) */}
      <RuleBook cx={880} cy={690} w={580} h={210} idk="64" f={f} grid={false}>
        {/* 条文の罫 (字は刻みだけ) */}
        {[0, 1].map((col) =>
          [...Array(6)].map((_, i) => (
            <rect
              key={`ln${col}_${i}`}
              x={620 + col * 290}
              y={620 + i * 26}
              width={(200) * (0.5 + rnd(i * 7 + col * 3) * 0.5) * open}
              height={7}
              fill={C4.sumi}
              opacity={0.45}
            />
          )),
        )}
        {/* 飾り頭文字 */}
        <rect x={620} y={596} width={30} height={30} fill={C4.redDeep} opacity={0.75} />
      </RuleBook>

      {/* 本を押さえて開く修道士 */}
      <Shudoshi x={420} y={1020} s={0.92} f={f} phase={4} pose="hold" face="normal" gaze={[3, 2]} lean={5} />

      <TagPlate x={1500} y={690} text="学校の規則集" size={46} t={seg(f, 18, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #65 試験と競争で生徒に順位をつける手続きを、公式に定めた最古級の記録です。
// 格: 図 — 開いた規則集の両頁。左頁に「試験」右頁に「順位」の条文の罫。方眼は頁に clip
// ------------------------------------------------------------------
const S65: React.FC<{ f: number }> = ({ f }) => {
  const left = easeOut(seg(f, 4, 22));
  const right = easeOut(seg(f, 18, 38));
  const CX = 900;
  const CY = 540;
  return (
    <Frame f={f} seed={964} bg={KRP.cream}>
      {/* 石壁 */}
      <StoneWall x={-10} y={-10} w={1940} h={700} courseH={76} op={0.95} />
      <GothicWindow cx={1680} y={70} w={180} h={270} lit />
      <polygon points="1600,340 1770,340 1500,760 1140,760" fill={C4.skyWarm} opacity={0.14} />
      {/* 板床と机 */}
      <PlankFloor y={690} k={3} />
      <g>
        <ellipse cx={940} cy={1012} rx={700} ry={28} fill={C4.ink} opacity={0.14} />
        <rect x={160} y={724} width={1600} height={40} rx={8} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5.5} />
        {[0, 1, 2].map((i) => (
          <line key={`dk${i}`} x1={180} y1={734 + i * 11} x2={1740} y2={734 + i * 11} stroke={C4.woodDark} strokeWidth={2.2} opacity={0.3} />
        ))}
        <rect x={240} y={764} width={34} height={240} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
        <rect x={1646} y={764} width={34} height={240} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
      </g>

      {/* 開いた規則集 (方眼を頁に clip) */}
      <RuleBook cx={CX} cy={CY} w={1180} h={400} idk="65" f={f}>
        {/* 左頁: 試験の条文 */}
        <rect x={CX - 540} y={CY - 168} width={180} height={34} fill={C4.redDeep} opacity={0.26} />
        {[...Array(8)].map((_, i) => (
          <rect
            key={`lf${i}`}
            x={CX - 540}
            y={CY - 112 + i * 32}
            width={450 * (0.46 + rnd(i * 7 + 1) * 0.54) * left}
            height={10}
            fill={C4.sumi}
            opacity={0.42}
          />
        ))}
        {/* 左頁の飾り頭文字 */}
        <rect x={CX - 540} y={CY - 168} width={34} height={34} fill={C4.redDeep} opacity={0.8} />

        {/* 右頁: 順位の条文 (番号の列つき) */}
        <rect x={CX + 70} y={CY - 168} width={180} height={34} fill={C4.gold} opacity={0.3} />
        <rect x={CX + 70} y={CY - 168} width={34} height={34} fill={C4.gold} opacity={0.85} />
        {[...Array(8)].map((_, i) => (
          <g key={`rt${i}`} opacity={right}>
            {/* 順位の刻み */}
            <rect x={CX + 70} y={CY - 112 + i * 32} width={28} height={10} fill={C4.redDeep} opacity={0.8} />
            <rect
              x={CX + 118}
              y={CY - 112 + i * 32}
              width={400 * (0.4 + rnd(i * 5 + 3) * 0.6)}
              height={10}
              fill={C4.sumi}
              opacity={0.42}
            />
          </g>
        ))}
        {/* 右頁の縦の罫 (順位の列) */}
        <line x1={CX + 108} y1={CY - 126} x2={CX + 108} y2={CY + 162} stroke={C4.paperShade} strokeWidth={4} />
      </RuleBook>

      {/* 羽ペンとインク壺 (机の上・右) */}
      <g>
        <ellipse cx={1570} cy={742} rx={34} ry={11} fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
        <path d="M 1536 742 L 1544 700 L 1596 700 L 1604 742 Z" fill={C4.glass} stroke={C4.ink} strokeWidth={4.5} />
        <ellipse cx={1570} cy={700} rx={26} ry={9} fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
        <g transform="translate(1570 700) rotate(26)">
          <path d="M 0 0 L 10 -140" stroke={C4.ink} strokeWidth={4.5} />
          <path d="M 10 -140 Q 54 -110 20 -52 Q 8 -76 0 -40 Z" fill={KRP.white} stroke={C4.ink} strokeWidth={3.6} />
        </g>
      </g>
      {/* 蝋燭の小皿 (左) */}
      <g transform="translate(290 700)">
        <ellipse cx={0} cy={38} rx={44} ry={13} fill={C4.gold} stroke={C4.ink} strokeWidth={4} />
        <rect x={-10} y={-38} width={20} height={76} fill={KRP.white} stroke={C4.ink} strokeWidth={4} />
        <path d={`M 0 -38 q ${7 + Math.sin(f / 4) * 3} -20 0 -38 q ${-7 + Math.sin(f / 4) * 3} 18 0 38 Z`} fill={C4.red} stroke={C4.ink} strokeWidth={2.6} />
      </g>

      <TagPlate x={430} y={252} text="試験" size={54} t={seg(f, 8, 20)} />
      <TagPlate x={1390} y={252} text="順位" size={54} t={seg(f, 22, 34)} color={C4.red} />
      <TagPlate x={910} y={170} text="最古級とされる" size={44} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #66 学校と順位の長い付き合いは、ここから始まります。
// 格: 図 — 教室の板床に机が縦一列。机の上に1〜4の番号札、矢印が奥へ伸びる
// ------------------------------------------------------------------
const S66: React.FC<{ f: number }> = ({ f }) => {
  // 手前 → 奥 の机 (遠近で小さくなる)
  const DESKS: [number, number, number][] = [
    [660, 946, 1.0],
    [760, 836, 0.76],
    [838, 756, 0.58],
    [898, 696, 0.44],
  ];
  const grow = easeOut(seg(f, 6, 36));
  return (
    <Frame f={f} seed={965} bg={KRP.cream}>
      <PlankRoom f={f} k={4} />

      {/* 奥へ伸びる矢印 (床に描いた導線) */}
      <path
        d={`M 560 1000 L ${lerp(560, 950, grow)} ${lerp(1000, 672, grow)}`}
        stroke={C4.red}
        strokeWidth={9}
        opacity={0.5}
        strokeDasharray="22 16"
      />
      {grow > 0.5 && (
        <polygon
          points={`${lerp(560, 950, grow)},${lerp(1000, 672, grow)} ${lerp(560, 950, grow) - 30},${lerp(1000, 672, grow) + 10} ${lerp(560, 950, grow) - 6},${lerp(1000, 672, grow) + 34}`}
          fill={C4.red}
          opacity={0.6}
        />
      )}

      {/* 机の列 (奥から描いて重なりを正しくする) */}
      {[...DESKS].reverse().map(([dx, dy, s], ri) => {
        const i = DESKS.length - 1 - ri;
        return (
          <g key={`dk${i}`} transform={`translate(${dx} ${dy}) scale(${s})`}>
            <WoodDesk x={-230} y={0} w={460} h={150} ink={i === 0} quill={i === 0} />
            {/* 答案の紙 */}
            <rect x={-150} y={-24} width={190} height={28} rx={4} fill={C4.paper} stroke={C4.ink} strokeWidth={4} transform="rotate(-2)" />
            {/* 番号札 (1〜4) */}
            <g opacity={easeOut(seg(f, 8 + i * 5, 22 + i * 5))}>
              <rect x={78} y={-96} width={82} height={82} rx={8} fill={C4.paper} stroke={C4.ink} strokeWidth={5} />
              <rect x={78} y={-96} width={82} height={18} fill={C4.redDeep} opacity={0.6} />
              {/* 番号は「刻み」で表す (1本=1) */}
              {[...Array(i + 1)].map((_, j) => (
                <rect key={`tk${j}`} x={92 + (j % 2) * 34} y={-62 + Math.floor(j / 2) * 26} width={26} height={16} fill={C4.sumi} opacity={0.8} />
              ))}
            </g>
            {/* 腰掛け */}
            <rect x={-200} y={118} width={400} height={18} rx={6} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
          </g>
        );
      })}

      <TagPlate x={1420} y={638} text="学校と順位" size={48} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #67 この文化が思いきり花開いたのが、イギリスのケンブリッジ大学でした。
// 格: 並 — 学寮の門。ガウンの学生1人が門をくぐる。切石の壁・尖頭窓・芝・石畳。遠景に鐘塔と川
// ------------------------------------------------------------------
const S67: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 4, 38));
  return (
    <Frame f={f} seed={966} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={560} fill={C4.sky} />
      <rect x={0} y={430} width={W} height={130} fill={C4.skyWarm} opacity={0.4} />
      {[...Array(4)].map((_, i) => (
        <ellipse
          key={`cl${i}`}
          cx={240 + i * 500 + Math.sin((f + i * 40) / 48) * 12}
          cy={90 + rnd(i * 5 + 7) * 100}
          rx={140 + rnd(i * 3) * 50}
          ry={30 + rnd(i * 7) * 12}
          fill={KRP.white}
          opacity={0.46}
        />
      ))}

      {/* 遠景の鐘塔と川 (左奥) */}
      <g opacity={0.3}>
        <rect x={120} y={300} width={96} height={240} fill={C4.ink} />
        <polygon points="110,300 168,236 226,300" fill={C4.ink} />
        <rect x={280} y={400} width={160} height={140} fill={C4.ink} />
        <polygon points="280,400 360,360 440,400" fill={C4.ink} />
      </g>
      {/* 川 */}
      <g>
        <rect x={0} y={540} width={520} height={100} fill={C4.glass} />
        {[...Array(4)].map((_, i) => (
          <path
            key={`rv${i}`}
            d={`M ${-20 + Math.sin((f + i * 13) / 16) * 12} ${556 + i * 22} q 110 ${i % 2 ? -6 : 6} 220 0 q 110 ${i % 2 ? 6 : -6} 220 0 q 60 0 120 0`}
            stroke={C4.ink}
            strokeWidth={2.2}
            fill="none"
            opacity={0.2}
          />
        ))}
        {/* 対岸の縁 */}
        <line x1={0} y1={540} x2={520} y2={540} stroke={C4.ink} strokeWidth={3} opacity={0.4} />
      </g>

      {/* 門のある壁 (右半分を主役にする) */}
      <StoneWall x={500} y={236} w={1440} h={520} />
      {/* 胸壁 (銃眼のような凹凸) */}
      {[...Array(13)].map((_, i) => (
        <rect key={`cr${i}`} x={510 + i * 110} y={204} width={66} height={36} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4} />
      ))}
      {/* 門塔の2本の柱 */}
      <StoneWall x={720} y={168} w={150} h={588} courseH={58} />
      <StoneWall x={1300} y={168} w={150} h={588} courseH={58} />
      {/* 尖頭窓 */}
      <GothicWindow cx={620} y={330} w={120} h={190} />
      <GothicWindow cx={795} y={256} w={88} h={120} lit />
      <GothicWindow cx={1375} y={256} w={88} h={120} />
      <GothicWindow cx={1580} y={330} w={130} h={200} lit />
      <GothicWindow cx={1810} y={330} w={130} h={200} />
      {/* 蔦 */}
      <Ivy x={1500} y={470} h={286} k={2} f={f} />
      <Ivy x={560} y={520} h={236} k={5} f={f} />

      {/* 門 (アーチ) */}
      <g>
        <path
          d="M 880 756 L 880 500 Q 1085 348 1290 500 L 1290 756 Z"
          fill={C4.stoneShade}
          stroke={C4.ink}
          strokeWidth={5.5}
        />
        <path
          d="M 916 756 L 916 512 Q 1085 384 1254 512 L 1254 756 Z"
          fill={C4.sumi}
          stroke={C4.ink}
          strokeWidth={5}
          opacity={0.9}
        />
        {/* 門の向こうの明かり */}
        <ellipse cx={1085} cy={680} rx={130} ry={110} fill={C4.skyWarm} opacity={0.3} />
        {/* アーチの迫石 */}
        {[...Array(9)].map((_, i) => {
          const a = Math.PI * (0.08 + (i / 8) * 0.84);
          const r = 182;
          return (
            <line
              key={`vs${i}`}
              x1={1085 - Math.cos(a) * r}
              y1={500 - Math.sin(a) * r * 0.78}
              x2={1085 - Math.cos(a) * (r + 36)}
              y2={500 - Math.sin(a) * (r + 36) * 0.78}
              stroke={C4.stoneLine}
              strokeWidth={4}
              opacity={0.85}
            />
          );
        })}
        {/* 門扉 (開いている・左右) */}
        <rect x={916} y={544} width={64} height={212} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
        <rect x={1190} y={544} width={64} height={212} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
      </g>

      {/* 芝 */}
      <rect x={0} y={640} width={520} height={120} fill={C4.grass} stroke={C4.ink} strokeWidth={3.4} />
      {[...Array(22)].map((_, i) => (
        <path
          key={`gt${i}`}
          d={`M ${12 + rnd(i * 13 + 1) * 490} ${652 + rnd(i * 7 + 3) * 98} l -5 -16 M ${12 + rnd(i * 13 + 1) * 490} ${652 + rnd(i * 7 + 3) * 98} l 5 -18`}
          stroke={C4.leafDark}
          strokeWidth={2.6}
          opacity={0.6}
        />
      ))}

      {/* 石畳 */}
      <CobbleGround y={756} k={2} />

      {/* 門をくぐる学生1人 */}
      <Gakusei
        x={lerp(1085, 1010, k)}
        y={lerp(900, 952, k)}
        s={lerp(0.74, 0.92, k)}
        f={f}
        phase={2}
        face="normal"
        gaze={[-2, 0]}
      />

      <TagPlate x={300} y={178} text="ケンブリッジ" size={50} t={seg(f, 18, 34)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #68 名物は数学の卒業試験。成績の順位が、1位から最後まで公表されました。
// 格: 図 — 掲示板の木枠に貼られた長い順位表。1位から最下位まで罫が一本、下端が枠からはみ出す
// ------------------------------------------------------------------
const S68: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 4, 34));
  return (
    <Frame f={f} seed={967} bg={KRP.cream}>
      {/* 切石の壁 */}
      <StoneWall x={-10} y={-10} w={1940} h={780} courseH={70} />
      <GothicWindow cx={210} y={120} w={150} h={240} lit />
      <GothicWindow cx={1740} y={120} w={150} h={240} />
      <Ivy x={400} y={300} h={456} k={3} f={f} />
      <Ivy x={1858} y={430} h={326} k={6} f={f} />
      {/* 石畳 */}
      <CobbleGround y={756} k={3} />

      {/* 掲示板 (中央) */}
      <NoticeBoard x={600} y={110} w={740} h={620} />

      {/* 長い順位表 (枠の中から下へはみ出して垂れる) */}
      <g>
        {/* 枠内の部分 */}
        <RankList x={660} y={150} w={620} h={540} rows={16} f={f} />
        {/* 下端が枠からはみ出して垂れる */}
        <g transform={`translate(0 ${lerp(-120, 0, drop)})`} opacity={drop}>
          <path
            d={`M 660 690 L 1280 690 L ${1280 + Math.sin(f / 13) * 10} 980 L ${660 + Math.sin(f / 13) * 10} 980 Z`}
            fill={C4.paper}
            stroke={C4.ink}
            strokeWidth={4.5}
          />
          {/* はみ出した部分の行 */}
          {[...Array(8)].map((_, i) => {
            const ly = 700 + i * 34;
            const last = i === 7;
            return (
              <g key={`ov${i}`}>
                <line x1={668} y1={ly + 26} x2={1272} y2={ly + 26} stroke={C4.paperShade} strokeWidth={2.4} />
                <rect x={680} y={ly + 6} width={30} height={13} fill={last ? C4.red : C4.sumi} opacity={last ? 0.95 : 0.65} />
                <rect
                  x={740}
                  y={ly + 6}
                  width={320 * (0.42 + rnd(i * 7 + 5) * 0.58)}
                  height={11}
                  fill={last ? C4.redDeep : C4.sumi}
                  opacity={last ? 0.9 : 0.5}
                />
              </g>
            );
          })}
          {/* 垂れた紙の影 */}
          <rect x={660} y={690} width={620} height={16} fill={C4.ink} opacity={0.12} />
          {/* 下端のめくれ */}
          <path d="M 1280 944 L 1280 980 L 1240 980 Z" fill={C4.paperDark} stroke={C4.ink} strokeWidth={3} />
        </g>
        {/* 順位が「一本につながる」ことを示す縦の線 */}
        <line
          x1={640}
          y1={170}
          x2={640}
          y2={lerp(690, 964, drop)}
          stroke={C4.red}
          strokeWidth={7}
          opacity={0.6}
        />
        <circle cx={640} cy={170} r={13} fill={C4.red} opacity={0.85} />
        <circle cx={640} cy={lerp(690, 964, drop)} r={13} fill={C4.red} opacity={0.85} />
      </g>

      <TagPlate x={1600} y={620} text="1位から最後まで" size={44} t={seg(f, 24, 38)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #69 首席は「シニア・ラングラー」と呼ばれる、国民的スターです。
// 格: 山 — この章の事件①。胴上げされる首席。帽子を投げる学生の群れ。紙吹雪
// ------------------------------------------------------------------
const S69: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 2, 20));
  const bounce = Math.sin(f / 5) * 26;
  const heroY = lerp(760, 540, up) + bounce;
  const z = lerp(1.0, 1.05, easeOut(seg(f, 0, 36)));
  return (
    <Frame f={f} seed={968} bg={KRP.cream}>
      <g transform={zoomAt(z, 940, 600)}>
        {/* 空 */}
        <rect x={0} y={0} width={W} height={300} fill={C4.sky} />
        <rect x={0} y={200} width={W} height={100} fill={C4.skyWarm} opacity={0.4} />
        {/* 学寮の壁 (中庭の三方) */}
        <StoneWall x={-10} y={270} w={1940} h={486} courseH={66} />
        <GothicWindow cx={160} y={330} w={140} h={230} lit />
        <GothicWindow cx={400} y={330} w={140} h={230} />
        <GothicWindow cx={1520} y={330} w={140} h={230} />
        <GothicWindow cx={1780} y={330} w={140} h={230} lit />
        <rect x={-10} y={252} width={1940} height={28} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4.5} />
        <Ivy x={600} y={420} h={336} k={7} f={f} />
        <Ivy x={1120} y={450} h={306} k={9} f={f} />
        {/* 奥の入口 */}
        <path d="M 900 756 L 900 600 Q 960 548 1020 600 L 1020 756 Z" fill={C4.sumi} stroke={C4.ink} strokeWidth={5} opacity={0.8} />

        {/* 石畳 */}
        <CobbleGround y={756} k={4} />

        {/* 紙吹雪 */}
        {[...Array(34)].map((_, i) => {
          const t = ((f * 1.6 + i * 11) % 60) / 60;
          const cx = 140 + rnd(i * 13 + 1) * 1660;
          const cy = -40 + t * 980;
          return (
            <rect
              key={`cf${i}`}
              x={cx}
              y={cy}
              width={13}
              height={19}
              fill={i % 4 === 0 ? C4.red : i % 4 === 1 ? C4.gold : i % 4 === 2 ? KRP.white : C4.leaf}
              opacity={0.85}
              transform={`rotate(${(f * 5 + i * 40) % 360} ${cx + 6} ${cy + 9})`}
            />
          );
        })}

        {/* 投げられた帽子 */}
        {[
          [330, 280, -22], [700, 210, 14], [1120, 236, -10], [1500, 300, 20], [930, 160, 6],
        ].map(([hx, hy, rot], i) => {
          const fly = Math.sin((f + i * 9) / 11) * 30;
          return (
            <g key={`hat${i}`} transform={`translate(${hx} ${Number(hy) - fly}) rotate(${Number(rot) + Math.sin((f + i * 7) / 9) * 14}) scale(0.62)`}>
              <polygon points="-74,0 74,0 60,18 -60,18" fill={C4.sumi} stroke={C4.ink} strokeWidth={4.5} />
              <path d="M -40 18 L -34 -6 L 34 -6 L 40 18 Z" fill={C4.gownDark} stroke={C4.ink} strokeWidth={4} />
              <line x1={62} y1={2} x2={82} y2={34} stroke={C4.gold} strokeWidth={3.4} />
              <ellipse cx={84} cy={41} rx={7} ry={11} fill={C4.gold} stroke={C4.ink} strokeWidth={2.4} />
            </g>
          );
        })}

        {/* 奥の群れ (帽子を投げる学生) */}
        {[
          [160, 840, 0.5, 1], [300, 848, 0.54, 4], [440, 840, 0.5, 7],
          [1480, 844, 0.52, 10], [1620, 850, 0.56, 13], [1760, 842, 0.5, 16],
          [600, 820, 0.46, 2], [1340, 824, 0.46, 5],
        ].map(([px, py, s, ph], i) => (
          <PersonMini
            key={`bg${i}`}
            x={Number(px)}
            y={Number(py)}
            s={Number(s)}
            color={i % 2 ? C4.gown : C4.gownAlt}
            f={f}
            phase={Number(ph)}
            face="smile"
            arms="up"
          />
        ))}

        {/* 胴上げの輪 (手前の学生たち。腕を上げる) */}
        {[
          [660, 1010, 0.76, 3], [820, 1024, 0.8, 6], [1060, 1024, 0.8, 9], [1220, 1010, 0.76, 12],
          [520, 992, 0.7, 15], [1360, 992, 0.7, 18],
        ].map(([px, py, s, ph], i) => (
          <PersonMini
            key={`fg${i}`}
            x={Number(px)}
            y={Number(py)}
            s={Number(s)}
            color={i % 2 ? C4.gownAlt : C4.gown}
            f={f}
            phase={Number(ph)}
            face="smile"
            arms="up"
          />
        ))}

        {/* 持ち上げる手 (胴の下に並ぶ) */}
        {[...Array(8)].map((_, i) => (
          <g key={`hd${i}`}>
            <rect
              x={720 + i * 62}
              y={heroY + 60}
              width={22}
              height={70}
              rx={11}
              fill={KRP.white}
              stroke={C4.ink}
              strokeWidth={4.5}
            />
            <ellipse cx={731 + i * 62} cy={heroY + 58} rx={16} ry={13} fill={KRP.white} stroke={C4.ink} strokeWidth={4.5} />
          </g>
        ))}

        {/* 胴上げされる首席 (横向きに浮く) */}
        <g transform={`translate(950 ${heroY}) rotate(${-6 + Math.sin(f / 7) * 3})`}>
          <Gakusei x={0} y={0} s={0.96} f={f} phase={0} pose="banzai" face="joy" cap={false} sash />
          {/* 外れかけた角帽 (頭の上を浮く) */}
          <g transform={`translate(${Math.sin(f / 8) * 14} ${-300 - Math.abs(Math.sin(f / 6)) * 34}) rotate(${Math.sin(f / 6) * 20}) scale(0.72)`}>
            <polygon points="-74,0 74,0 60,18 -60,18" fill={C4.sumi} stroke={C4.ink} strokeWidth={4.5} />
            <path d="M -40 0 L -34 -24 L 34 -24 L 40 0 Z" fill={C4.gownDark} stroke={C4.ink} strokeWidth={4} />
            <line x1={62} y1={2} x2={82} y2={34} stroke={C4.gold} strokeWidth={3.4} />
            <ellipse cx={84} cy={41} rx={7} ry={11} fill={C4.gold} stroke={C4.ink} strokeWidth={2.4} />
          </g>
          {/* 歓喜の線 */}
          {[...Array(6)].map((_, i) => {
            const a = (-150 + i * 24) * (Math.PI / 180);
            const r0 = 190 + Math.sin(f / 6) * 8;
            return (
              <line
                key={`jy${i}`}
                x1={Math.cos(a) * r0}
                y1={-220 + Math.sin(a) * r0 * 0.6}
                x2={Math.cos(a) * (r0 + 40)}
                y2={-220 + Math.sin(a) * (r0 + 40) * 0.6}
                stroke={C4.gold}
                strokeWidth={6}
                opacity={0.7}
              />
            );
          })}
        </g>

      </g>
      <TagPlate x={1520} y={690} text="シニア・ラングラー = 首席" size={38} t={seg(f, 20, 36)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #70 新聞に名前が載り、出身の町の誇りになりました。
// 格: 並 — 町の通り。新聞を広げて見せ合う町の人。煉瓦の家並み・街灯・舗石・干し物
// ------------------------------------------------------------------
const S70: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 6, 30));
  const sway = Math.sin(f / 15) * 3;
  return (
    <Frame f={f} seed={969} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={420} fill={C4.sky} />
      <rect x={0} y={320} width={W} height={100} fill={C4.skyWarm} opacity={0.42} />

      {/* 煉瓦の家並み */}
      {[
        [-40, 200, 430], [380, 150, 400], [760, 230, 380], [1120, 170, 420], [1520, 220, 440],
      ].map(([bx, by, bw], i) => (
        <g key={`bl${i}`}>
          <rect x={Number(bx)} y={Number(by)} width={Number(bw)} height={760 - Number(by)} fill={C4.brick} stroke={C4.ink} strokeWidth={5} />
          {/* 煉瓦の目地 */}
          {[...Array(16)].map((_, r) => {
            const ly = Number(by) + 26 + r * 34;
            if (ly > 756) return null;
            return (
              <line key={`br${i}_${r}`} x1={Number(bx)} y1={ly} x2={Number(bx) + Number(bw)} y2={ly} stroke={C4.brickDark} strokeWidth={2.4} opacity={0.5} />
            );
          })}
          {/* 切妻屋根 */}
          <polygon
            points={`${Number(bx) - 14},${Number(by)} ${Number(bx) + Number(bw) / 2},${Number(by) - 76} ${Number(bx) + Number(bw) + 14},${Number(by)}`}
            fill={C4.brickDark}
            stroke={C4.ink}
            strokeWidth={5}
          />
          {/* 煙突 */}
          <rect x={Number(bx) + Number(bw) * 0.72} y={Number(by) - 110} width={40} height={64} fill={C4.brickDark} stroke={C4.ink} strokeWidth={4.5} />
          {/* 窓 */}
          {[0, 1].map((r) =>
            [0, 1, 2].map((c) => (
              <g key={`wn${i}_${r}_${c}`}>
                <rect
                  x={Number(bx) + 50 + c * (Number(bw) - 160) / 2}
                  y={Number(by) + 50 + r * 180}
                  width={78}
                  height={120}
                  fill={(i + r + c) % 3 === 0 ? C4.skyWarm : C4.glass}
                  stroke={C4.ink}
                  strokeWidth={4.5}
                />
                <line
                  x1={Number(bx) + 89 + c * (Number(bw) - 160) / 2}
                  y1={Number(by) + 50 + r * 180}
                  x2={Number(bx) + 89 + c * (Number(bw) - 160) / 2}
                  y2={Number(by) + 170 + r * 180}
                  stroke={C4.ink}
                  strokeWidth={3}
                />
                <line
                  x1={Number(bx) + 50 + c * (Number(bw) - 160) / 2}
                  y1={Number(by) + 110 + r * 180}
                  x2={Number(bx) + 128 + c * (Number(bw) - 160) / 2}
                  y2={Number(by) + 110 + r * 180}
                  stroke={C4.ink}
                  strokeWidth={3}
                />
              </g>
            )),
          )}
          {/* 1階の扉 */}
          <rect x={Number(bx) + Number(bw) / 2 - 46} y={620} width={92} height={136} fill={C4.woodDark} stroke={C4.ink} strokeWidth={5} />
          <circle cx={Number(bx) + Number(bw) / 2 + 28} cy={688} r={7} fill={C4.gold} stroke={C4.ink} strokeWidth={2.6} />
        </g>
      ))}

      {/* 干し物 (家のあいだに渡した綱) */}
      <g>
        <path d={`M 330 400 q 420 ${56 + sway * 2} 840 ${-30}`} stroke={C4.ink} strokeWidth={3.4} fill="none" opacity={0.7} />
        {[...Array(7)].map((_, i) => {
          const t = (i + 1) / 8;
          const lx = 330 + t * 840;
          const ly = 400 + 56 * (4 * t * (1 - t)) * 0.9 - 30 * t + sway;
          return (
            <g key={`cw${i}`} transform={`rotate(${Math.sin((f + i * 11) / 17) * 4} ${lx} ${ly})`}>
              <rect
                x={lx - 28}
                y={ly}
                width={56}
                height={74 + rnd(i * 7) * 34}
                fill={i % 2 ? KRP.white : C4.paperDark}
                stroke={C4.ink}
                strokeWidth={3.6}
              />
            </g>
          );
        })}
      </g>

      {/* 街灯 */}
      <g>
        <rect x={1700} y={420} width={20} height={336} fill={C4.ironDark} stroke={C4.ink} strokeWidth={4.5} />
        <path d="M 1676 420 L 1710 362 L 1744 420 Z" fill={C4.iron} stroke={C4.ink} strokeWidth={4.5} />
        <rect x={1678} y={420} width={64} height={70} fill={C4.skyWarm} stroke={C4.ink} strokeWidth={4.5} />
        <line x1={1710} y1={420} x2={1710} y2={490} stroke={C4.ink} strokeWidth={3} />
        <ellipse cx={1710} cy={456} rx={96} ry={88} fill={C4.skyWarm} opacity={0.2} />
        <rect x={1690} y={742} width={40} height={16} rx={5} fill={C4.ironDark} stroke={C4.ink} strokeWidth={4} />
      </g>

      {/* 舗石 */}
      <CobbleGround y={756} k={5} />

      {/* 新聞を広げて見せ合う町の人 */}
      <Person x={700} y={1010} s={0.94} f={f} phase={2} still={false} pose="hold" face="joy" cloth={C4.brickDark} clothDark="#6E4733" hair="cap" gaze={[2, 1]} />
      {/* 広げた新聞 (両手の前) */}
      <g transform={`translate(840 ${816 + Math.sin(f / 13) * 3}) rotate(${-4 + open * 2})`}>
        <Newspaper x={-150} y={-120} w={300} h={240} />
      </g>
      {/* のぞき込む町の人 2人 */}
      <PersonMini x={1100} y={1000} s={0.72} color={C4.leafDark} f={f} phase={5} face="smile" />
      <PersonMini x={1270} y={968} s={0.62} color={C4.gownAlt} f={f} phase={9} face="smile" arms="up" />
      {/* 奥に1人 */}
      <PersonMini x={1480} y={886} s={0.46} color={C4.iron} f={f} phase={13} face="dot" />

      <TagPlate x={380} y={770} text="町の誇り" size={50} t={seg(f, 22, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #71 では、最下位の学生はどうなったでしょう。
// 格: 図 — #68 と同じ順位表の下端に寄る (phase 違い)。最下位の行だけ QMark で囲む
// ------------------------------------------------------------------
const S71: React.FC<{ f: number }> = ({ f }) => {
  // #68 の順位表の「下端」に寄った絵。木枠の鋲・めくれた紙の影・石畳を敷く
  const z = lerp(1.0, 1.06, easeOut(seg(f, 0, 30)));
  return (
    <Frame f={f} seed={970} bg={KRP.cream}>
      <g transform={zoomAt(z, 900, 560)}>
        {/* 切石の壁 (寄っているので目地を大きく) */}
        <StoneWall x={-10} y={-10} w={1940} h={790} courseH={108} />
        <Ivy x={200} y={180} h={400} k={8} f={f} />
        <CobbleGround y={756} k={6} />

        {/* 掲示板の木枠の「下の辺」だけが見えている */}
        <g>
          <rect x={430} y={-10} width={1060} height={700} rx={6} fill={C4.paperShade} stroke={C4.ink} strokeWidth={5} />
          {/* 木枠の下辺 */}
          <rect x={400} y={636} width={1120} height={64} rx={6} fill={C4.woodDark} stroke={C4.ink} strokeWidth={5.5} />
          {[0, 1, 2].map((i) => (
            <line key={`wg${i}`} x1={414} y1={650 + i * 14} x2={1506} y2={650 + i * 14} stroke={C4.wood} strokeWidth={2.4} opacity={0.4} />
          ))}
          {/* 鋲 */}
          {[460, 700, 960, 1220, 1460].map((cx, i) => (
            <g key={`rv${i}`}>
              <circle cx={cx} cy={668} r={13} fill={C4.gold} stroke={C4.ink} strokeWidth={4} />
              <circle cx={cx - 4} cy={664} r={4} fill={KRP.white} opacity={0.7} />
            </g>
          ))}
          {/* 古い貼り跡 */}
          {[...Array(6)].map((_, i) => (
            <rect
              key={`pm${i}`}
              x={460 + rnd(i * 17 + 1) * 940}
              y={40 + rnd(i * 7 + 5) * 520}
              width={70 + rnd(i * 5) * 90}
              height={50 + rnd(i * 11) * 60}
              fill={C4.paperDark}
              opacity={0.35}
            />
          ))}
        </g>

        {/* 順位表の下端 (行が大きい) */}
        <g>
          <rect x={500} y={-10} width={920} height={660} fill={C4.paper} stroke={C4.ink} strokeWidth={5} />
          <line x1={606} y1={-10} x2={606} y2={650} stroke={C4.paperShade} strokeWidth={4} />
          {[...Array(7)].map((_, i) => {
            const ly = 40 + i * 86;
            const last = i === 6;
            return (
              <g key={`rw${i}`}>
                <line x1={512} y1={ly + 66} x2={1408} y2={ly + 66} stroke={C4.paperShade} strokeWidth={3} />
                {/* 順位の刻み */}
                <rect x={530} y={ly + 22} width={56} height={24} fill={last ? C4.red : C4.sumi} opacity={last ? 0.95 : 0.6} />
                {/* 名前の刻み */}
                <rect
                  x={636}
                  y={ly + 22}
                  width={600 * (0.4 + rnd(i * 7 + 2) * 0.6)}
                  height={22}
                  fill={last ? C4.redDeep : C4.sumi}
                  opacity={last ? 0.9 : 0.46}
                />
              </g>
            );
          })}
          {/* 最下位の行を強調する下線 */}
          <line x1={512} y1={622} x2={1408} y2={622} stroke={C4.red} strokeWidth={6} opacity={0.75} />
          {/* 紙のめくれた影 */}
          <path d="M 1420 596 L 1420 650 L 1362 650 Z" fill={C4.paperDark} stroke={C4.ink} strokeWidth={3.4} />
          <path d={`M 500 650 q 460 ${Math.sin(f / 11) * 6} 920 0`} stroke={C4.ink} strokeWidth={3} fill="none" opacity={0.3} />
        </g>

        {/* 最下位の行を QMark で囲む */}
        <g opacity={easeOut(seg(f, 10, 28))}>
          <rect
            x={494}
            y={540}
            width={932}
            height={96}
            rx={10}
            fill="none"
            stroke={C4.red}
            strokeWidth={7}
            strokeDasharray="20 14"
          />
        </g>
        <QMark x={1660} y={420} s={1.5} t={seg(f, 18, 34)} f={f} />
      </g>
      <TagPlate x={300} y={772} text="最下位は" size={50} t={seg(f, 24, 38)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #72 木のスプーンが、贈られました。
// 格: 山 (笑いの山) — 学寮の講堂。大真面目な授与式の形式のまま、梁からロープで吊られた
//   巨大な木のスプーン (全長 608px = 受け取る学生 277px の 2.2倍) が降りてきて渡される。
//   史実のウッデン・スプーン授与式 (卒業式で天井から吊り下げて渡す) の形をとる。
//   ★侮辱・茶化しに見える描き方は禁止。受け取る側はどこか誇らしげ
//
// ★2026-11-07 直し「木のスプーンが見当たらない」の原因と対策
//   原因1 匙を切石の壁の前に置いていた。木の明るい色 (woodLight #C4A273) と壁の影の色
//         (stoneShade #BEB39A) は明るさがほぼ同じで、輪郭線しか見えていなかった
//   原因2 匙の下半分が板床 (wood #A8824F = 匙の柄とまったく同じ色) に重なり、
//         さらに柄の先が受け取る学生の体の後ろに隠れていた
//   原因3 画面中央にかけた暖色の光 (opacity 0.12) が匙の上にかぶって白けていた
//   原因4 匙の動きが hand (f=30 で飽和) だけで、検品が見る f=45 では止まっていた
//   対策  (1) 床まで届く濃い赤 (redDeep #8C3220) の垂れ幕を匙の真後ろに敷いて明暗差を作る
//         (2) 匙は画面中央右に単独で置き、人も床も壁も重ねない
//         (3) 壺を下に向けて学生の頭の高さまで下ろし、左手が壺の縁に触る位置に学生を立てる
//         (4) 吊りロープごと振り子で揺らす (sin なので f が進んでも止まらない)
//         (5) 幕に落ちる影を匙と一緒に揺らして、壁から浮いていることを見せる
//         (6) WoodenSpoon に hero を足して木目・節・壺のくぼみ・縁の照りを描き込む
// ------------------------------------------------------------------
const S72: React.FC<{ f: number }> = ({ f }) => {
  const hand = easeOut(seg(f, 6, 30));            // 匙が降りてきて学生の手に届くまで
  const z = lerp(1.12, 1.0, easeOut(seg(f, 0, 36)));
  const SP = 0.95;                                 // 匙の倍率 (全長 640*0.95 = 608px)
  const PX = 1250;                                 // 吊り元 (梁の輪) の x
  const PY = 36;                                   // 吊り元の y
  const rope = lerp(26, 88, hand);                 // ロープの長さ = 降りてくる量
  const swing = lerp(-12, 0, hand) + Math.sin(f / 15) * (5 - 3.2 * hand);
  return (
    <Frame f={f} seed={971} bg={KRP.cream}>
      <g transform={zoomAt(z, 1190, 540)}>
        {/* 講堂の壁 */}
        <StoneWall x={-10} y={-10} w={1940} h={760} courseH={90} />
        {/* 高い尖頭窓 (左右) */}
        <GothicWindow cx={180} y={70} w={190} h={330} lit />
        <GothicWindow cx={1770} y={70} w={190} h={330} lit />
        {/* 板床 */}
        <PlankFloor y={700} k={7} />
        {/* 左の窓から差す光 (壁から床へ。匙の上にはかけない) */}
        <polygon points="108,404 274,404 520,880 40,880" fill={C4.skyWarm} opacity={0.16} />
        {/* 柱 (紋章の盾を掛ける) */}
        {[400, 1600].map((cx, i) => (
          <g key={`pl${i}`}>
            <rect x={cx - 42} y={40} width={84} height={700} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={5} />
            {[0, 1, 2].map((j) => (
              <line key={`fl${i}_${j}`} x1={cx - 24 + j * 24} y1={60} x2={cx - 24 + j * 24} y2={730} stroke={C4.stoneLine} strokeWidth={3} opacity={0.7} />
            ))}
            {/* 柱頭 */}
            <rect x={cx - 56} y={14} width={112} height={32} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={4.5} />
            {/* 紋章 (盾) */}
            <g>
              <path
                d={`M ${cx - 46} 180 L ${cx + 46} 180 L ${cx + 46} 240 Q ${cx} 282 ${cx - 46} 240 Z`}
                fill={C4.gold}
                stroke={C4.ink}
                strokeWidth={5}
              />
              <path d={`M ${cx} 180 L ${cx} 268`} stroke={C4.redDeep} strokeWidth={5} />
              <path d={`M ${cx - 46} 208 L ${cx + 46} 208`} stroke={C4.redDeep} strokeWidth={5} />
            </g>
          </g>
        ))}
        {/* ★匙の真後ろに敷く濃い赤の垂れ幕 (床まで届く長さ)。これが明暗差をつくる */}
        <g>
          <rect x={960} y={20} width={520} height={732} fill={C4.redDeep} stroke={C4.ink} strokeWidth={5.5} />
          {/* 布のひだ (縦の明暗) */}
          {[...Array(7)].map((_, i) => (
            <rect
              key={`fd${i}`}
              x={984 + i * 72}
              y={24}
              width={26}
              height={724}
              fill={C4.red}
              opacity={0.16 + rnd(i * 7) * 0.16}
            />
          ))}
          {/* 金の縁取りと鋲 */}
          <rect x={990} y={56} width={460} height={666} fill="none" stroke={C4.gold} strokeWidth={7} />
          {[...Array(8)].map((_, i) => (
            <g key={`st${i}`}>
              <circle cx={990} cy={116 + i * 84} r={8} fill={C4.gold} stroke={C4.ink} strokeWidth={3} />
              <circle cx={1450} cy={116 + i * 84} r={8} fill={C4.gold} stroke={C4.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 幕の上端の房 (f でゆれる) */}
          {[...Array(11)].map((_, i) => (
            <polygon
              key={`ts${i}`}
              points={`${972 + i * 48},62 ${1000 + i * 48},62 ${986 + i * 48},${102 + Math.sin((f + i * 9) / 14) * 5}`}
              fill={C4.gold}
              stroke={C4.ink}
              strokeWidth={3}
            />
          ))}
        </g>

        {/* 幕と匙を吊る梁 (幕より前) */}
        <g>
          <rect x={920} y={-10} width={600} height={56} rx={6} fill={C4.woodDark} stroke={C4.ink} strokeWidth={5.5} />
          {[0, 1, 2].map((i) => (
            <line key={`bg${i}`} x1={936} y1={6 + i * 12} x2={1504} y2={6 + i * 12} stroke={C4.wood} strokeWidth={2.6} opacity={0.45} />
          ))}
        </g>

        {/* 式台 (段のある壇) */}
        <g>
          <rect x={300} y={790} width={1320} height={30} rx={6} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5.5} />
          <rect x={300} y={820} width={1320} height={52} fill={C4.woodDark} stroke={C4.ink} strokeWidth={5} />
          <rect x={380} y={740} width={1160} height={30} rx={6} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5.5} />
          <rect x={380} y={770} width={1160} height={26} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
          {[...Array(9)].map((_, i) => (
            <line key={`sg${i}`} x1={400 + i * 140} y1={740} x2={400 + i * 140} y2={770} stroke={C4.wood} strokeWidth={2.4} opacity={0.5} />
          ))}
          {/* 赤い敷物 */}
          <rect x={620} y={732} width={700} height={16} fill={C4.red} stroke={C4.ink} strokeWidth={4} opacity={0.9} />
        </g>

        {/* 列席者 (壇の後ろ・大真面目に並ぶ。幕の前には立たせない) */}
        {[
          [520, 722, 0.44, 1], [616, 726, 0.46, 4], [712, 722, 0.44, 7], [822, 726, 0.42, 10],
          [1548, 722, 0.44, 13], [1704, 726, 0.46, 16],
        ].map(([px, py, s, ph], i) => (
          <PersonMini
            key={`at${i}`}
            x={Number(px)}
            y={Number(py)}
            s={Number(s)}
            color={i % 2 ? C4.gown : C4.gownAlt}
            f={f}
            phase={Number(ph)}
            face="dot"
          />
        ))}

        {/* 授与する側 (式服の年長者。左。片手を上げて匙を示す) */}
        <Gakusei x={800} y={752} s={0.9} f={f} phase={6} pose="raise" face="normal" gaze={[4, -1]} alt cap />

        {/* ★主役: 梁から吊られた巨大な木のスプーン。ロープごと振り子で揺れる */}
        <g transform={`translate(${PX} ${PY}) rotate(${swing})`}>
          {/* 梁の吊り輪 */}
          <circle cx={0} cy={2} r={13} fill="none" stroke={C4.ink} strokeWidth={6} />
          {/* ロープ (2本撚り) */}
          <line x1={-7} y1={6} x2={-5} y2={rope} stroke={C4.paperShade} strokeWidth={10} strokeLinecap="round" />
          <line x1={7} y1={6} x2={5} y2={rope} stroke={C4.paperDark} strokeWidth={10} strokeLinecap="round" />
          <line x1={-7} y1={6} x2={-5} y2={rope} stroke={C4.ink} strokeWidth={2.4} opacity={0.4} />
          {/* 柄の先を縛る結び目 */}
          <ellipse cx={0} cy={rope} rx={22} ry={14} fill={C4.paperDark} stroke={C4.ink} strokeWidth={4.5} />
          {/* 匙 (壺を下に向けるので 180度まわして吊る) */}
          <g transform={`translate(0 ${rope}) rotate(180)`}>
            {/* 幕に落ちる影 (匙と一緒に揺れる = 壁から浮いて見える) */}
            <g transform={`translate(${-24 * SP} ${-20 * SP})`} opacity={0.3}>
              <rect
                x={-22 * SP}
                y={-430 * SP}
                width={44 * SP}
                height={420 * SP}
                rx={20 * SP}
                fill={C4.sumi}
              />
              <ellipse cx={0} cy={-518 * SP} rx={96 * SP} ry={122 * SP} fill={C4.sumi} />
            </g>
            <WoodenSpoon x={0} y={-390 * SP} s={SP} hero />
          </g>
        </g>

        {/* 受け取る学生 (両腕を上げて受ける・どこか誇らしげ)。左手が壺の縁に触る高さ */}
        <Gakusei x={1455} y={756} s={0.95} f={f} phase={0} pose="banzai" face="smile" gaze={[-3, -2]} sash cap />

        {/* 手前の列席者 (拍手。頭と肩だけ画面に入る) */}
        {[[250, 1000, 0.8, 2], [1760, 1004, 0.8, 5]].map(([px, py, s, ph], i) => (
          <PersonMini
            key={`af${i}`}
            x={Number(px)}
            y={Number(py)}
            s={Number(s)}
            color={C4.gownAlt}
            f={f}
            phase={Number(ph)}
            face="smile"
            arms="up"
          />
        ))}
        {/* 式場に舞う埃 (f で上下する) */}
        {[...Array(9)].map((_, i) => (
          <circle
            key={`dt${i}`}
            cx={620 + rnd(i * 13 + 1) * 1180}
            cy={160 + rnd(i * 7 + 5) * 420 + Math.sin((f + i * 19) / 21) * 9}
            r={3 + rnd(i * 5) * 4}
            fill={KRP.white}
            opacity={0.38}
          />
        ))}
      </g>
      {/* 札は匙の左の空いた壁へ (匙そのものには重ねない)。
          幅 = 6字*46 + 44 = 320 → 左端 540 / 右端 860。下端 = 250 + 46*0.95 + 5 = 299 */}
      <TagPlate x={700} y={250} text="木のスプーン" size={46} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #73 なぜスプーンなのかは謎ですが、1793年から100年以上も続いた伝統です。
// 格: 図 — 壁の棚に歴代の木のスプーンが並ぶ。左端に QMark、右へ「100年以上」の長い帯
//   ★年号は絵に書かない。長さは帯の長さで見せる
// ------------------------------------------------------------------
const S73: React.FC<{ f: number }> = ({ f }) => {
  const band = easeOut(seg(f, 10, 40));
  const SPOONS = 9;
  return (
    <Frame f={f} seed={972} bg={KRP.cream}>
      {/* 石壁 */}
      <StoneWall x={-10} y={-10} w={1940} h={790} courseH={82} />
      {/* 埃っぽい光 */}
      <GothicWindow cx={1800} y={60} w={160} h={250} lit />
      <polygon points="1740,310 1870,310 1620,760 1280,760" fill={C4.skyWarm} opacity={0.13} />
      {[...Array(16)].map((_, i) => (
        <circle
          key={`ds${i}`}
          cx={1300 + rnd(i * 13 + 1) * 540}
          cy={340 + rnd(i * 7 + 5) * 380 + Math.sin((f + i * 17) / 24) * 8}
          r={3 + rnd(i * 5) * 4}
          fill={KRP.white}
          opacity={0.4}
        />
      ))}

      {/* 棚板 (2段) */}
      {[400, 640].map((sy, r) => (
        <g key={`sb${r}`}>
          <rect x={120} y={sy} width={1540} height={22} rx={5} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5} />
          <rect x={130} y={sy + 22} width={1520} height={14} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3.6} />
          {/* 持ち送り */}
          {[220, 880, 1540].map((bx, i) => (
            <polygon
              key={`bk${r}_${i}`}
              points={`${bx - 26},${sy + 36} ${bx + 26},${sy + 36} ${bx + 26},${sy + 84}`}
              fill={C4.woodDark}
              stroke={C4.ink}
              strokeWidth={4}
            />
          ))}
          {/* 板の木目 */}
          {[0, 1].map((i) => (
            <line key={`gr${r}_${i}`} x1={136} y1={sy + 7 + i * 8} x2={1644} y2={sy + 7 + i * 8} stroke={C4.woodDark} strokeWidth={2} opacity={0.35} />
          ))}
        </g>
      ))}

      {/* 歴代の木のスプーン (上段に立てて並ぶ。だんだん新しくなる) */}
      {[...Array(SPOONS)].map((_, i) => {
        const sx = 230 + i * 165;
        const s = 0.3 + i * 0.012;
        const tilt = -6 + rnd(i * 7) * 12;
        return (
          <g key={`sp${i}`} opacity={0.55 + i * 0.05}>
            {/* 棚に落ちる影 */}
            <ellipse cx={sx + 6} cy={396} rx={34} ry={9} fill={C4.ink} opacity={0.18} />
            <g transform={`translate(${sx} ${308}) rotate(${tilt})`}>
              <WoodenSpoon x={0} y={0} s={s} />
            </g>
            {/* 掛け札 (無地。字は書かない) */}
            <rect x={sx - 28} y={412} width={56} height={26} rx={5} fill={C4.paperDark} stroke={C4.ink} strokeWidth={3.4} />
            <line x1={sx - 16} y1={425} x2={sx + 16} y2={425} stroke={C4.sumi} strokeWidth={3} opacity={0.5} />
          </g>
        );
      })}

      {/* 下段: いちばん大きい最後のスプーンを横に寝かせる */}
      <g>
        <ellipse cx={900} cy={648} rx={340} ry={14} fill={C4.ink} opacity={0.16} />
        <g transform="translate(680 594) rotate(84)">
          <WoodenSpoon x={0} y={0} s={0.52} />
        </g>
        {/* 埃 */}
        {[...Array(7)].map((_, i) => (
          <ellipse key={`dd${i}`} cx={620 + i * 108} cy={638} rx={22} ry={6} fill={C4.paperShade} opacity={0.4} />
        ))}
      </g>

      {/* 左端に QMark (なぜスプーンかは謎) */}
      <QMark x={190} y={600} s={1.7} t={seg(f, 4, 18)} f={f} />

      {/* 右へ伸びる「100年以上」の長い帯 */}
      <g>
        <rect x={300} y={716} width={1400} height={30} rx={8} fill={C4.paperDark} stroke={C4.ink} strokeWidth={4} opacity={0.8} />
        <rect x={300} y={716} width={1400 * band} height={30} rx={8} fill={C4.red} stroke={C4.ink} strokeWidth={4} />
        {/* 帯の目盛 */}
        {[...Array(11)].map((_, i) => (
          <line key={`tk${i}`} x1={300 + i * 140} y1={708} x2={300 + i * 140} y2={754} stroke={C4.ink} strokeWidth={3} opacity={0.55} />
        ))}
        {/* 帯の右端の矢 */}
        {band > 0.9 && (
          <polygon points="1700,700 1756,731 1700,762" fill={C4.red} stroke={C4.ink} strokeWidth={4} />
        )}
      </g>

      {/* 床 */}
      <PlankFloor y={790} k={8} />

      <TagPlate x={1140} y={530} text="100年以上" size={46} t={seg(f, 28, 40)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #74 笑い話に見えますが、注目してほしいのは、新聞のほうです。
// 格: 図 — 机の上に並ぶ2つ: 木のスプーン (opacity を落とす) と新聞 (前へ出る)。札は1枚
// ------------------------------------------------------------------
const S74: React.FC<{ f: number }> = ({ f }) => {
  const shift = easeOut(seg(f, 6, 34));
  const dim = 1 - shift * 0.62;
  return (
    <Frame f={f} seed={973} bg={KRP.cream}>
      {/* 壁 */}
      <StoneWall x={-10} y={-10} w={1940} h={660} courseH={90} />
      <GothicWindow cx={330} y={80} w={200} h={320} lit />
      {/* 窓の光 */}
      <polygon points="240,400 440,400 700,900 180,900" fill={C4.skyWarm} opacity={0.16} />
      {/* 腰板 */}
      <rect x={-10} y={560} width={1940} height={110} fill={C4.wood} stroke={C4.ink} strokeWidth={4} />
      {[...Array(11)].map((_, i) => (
        <line key={`wp${i}`} x1={i * 180} y1={560} x2={i * 180} y2={670} stroke={C4.woodDark} strokeWidth={3} opacity={0.45} />
      ))}
      {/* 板床 */}
      <PlankFloor y={670} k={9} />

      {/* 机 (画面を横切る) */}
      <g>
        <ellipse cx={960} cy={1016} rx={840} ry={28} fill={C4.ink} opacity={0.14} />
        <rect x={60} y={716} width={1800} height={44} rx={8} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5.5} />
        {[0, 1, 2].map((i) => (
          <line key={`dg${i}`} x1={80} y1={728 + i * 12} x2={1840} y2={728 + i * 12} stroke={C4.woodDark} strokeWidth={2.4} opacity={0.3} />
        ))}
        <rect x={160} y={760} width={38} height={250} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
        <rect x={1722} y={760} width={38} height={250} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
      </g>

      {/* インク壺 (机の小物) */}
      <g opacity={0.9}>
        <ellipse cx={1620} cy={712} rx={32} ry={11} fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
        <path d="M 1588 712 L 1596 672 L 1644 672 L 1652 712 Z" fill={C4.glass} stroke={C4.ink} strokeWidth={4.5} />
        <ellipse cx={1620} cy={672} rx={24} ry={9} fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
      </g>

      {/* 左: 木のスプーン (opacity を落として後ろへ下がる) */}
      <g opacity={dim} transform={`translate(${lerp(500, 460, shift)} ${lerp(400, 420, shift)}) scale(${lerp(1, 0.9, shift)})`}>
        <g transform="rotate(-10)">
          <WoodenSpoon x={0} y={0} s={0.74} />
        </g>
      </g>

      {/* 右: 新聞 (前へ出る・大きくなる) */}
      <g transform={`translate(${lerp(1240, 1210, shift)} ${lerp(430, 410, shift)}) scale(${lerp(1, 1.1, shift)}) rotate(${lerp(-5, -2, shift)})`}>
        {/* 影 */}
        <ellipse cx={0} cy={300} rx={290} ry={26} fill={C4.ink} opacity={0.18} />
        <Newspaper x={-270} y={-250} w={540} h={530} />
      </g>

      {/* 矢印が新聞を指す */}
      <Arrow x={900} y={420} s={1.6} t={seg(f, 18, 34)} color={C4.red} />

      <TagPlate x={780} y={660} text="こっち" size={52} t={seg(f, 26, 40)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #75 順位が紙に刷られて、国じゅうに配られるようになりました。
// 格: 山 — 新しい物の初登場。輪転機が回り、刷られた新聞が束で出る。運ぶ人・自転車の配達
// ------------------------------------------------------------------
const S75: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.04, easeOut(seg(f, 0, 36)));
  const go = easeOut(seg(f, 10, 40));
  const wheel = f * 7;
  return (
    <Frame f={f} seed={974} bg={KRP.cream}>
      <g transform={zoomAt(z, 760, 600)}>
        {/* 工場の壁 */}
        <rect x={0} y={0} width={W} height={720} fill={C4.stoneShade} />
        {/* 煉瓦 */}
        {[...Array(13)].map((_, r) => (
          <line key={`br${r}`} x1={0} y1={30 + r * 54} x2={W} y2={30 + r * 54} stroke={C4.stoneLine} strokeWidth={2.4} opacity={0.45} />
        ))}
        {/* 鉄骨の梁 */}
        <rect x={-10} y={64} width={1940} height={28} fill={C4.ironDark} stroke={C4.ink} strokeWidth={4.5} />
        {[...Array(7)].map((_, i) => (
          <polygon
            key={`tr${i}`}
            points={`${100 + i * 290},92 ${180 + i * 290},92 ${140 + i * 290},168`}
            fill="none"
            stroke={C4.ironDark}
            strokeWidth={6}
            opacity={0.8}
          />
        ))}
        {/* 高窓 */}
        {[260, 700, 1140, 1580].map((cx, i) => (
          <g key={`hw${i}`}>
            <rect x={cx - 80} y={196} width={160} height={150} fill={C4.glass} stroke={C4.ink} strokeWidth={4.5} />
            <line x1={cx} y1={196} x2={cx} y2={346} stroke={C4.ink} strokeWidth={3} />
            <line x1={cx - 80} y1={270} x2={cx + 80} y2={270} stroke={C4.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 煤 */}
        {[...Array(12)].map((_, i) => (
          <ellipse
            key={`st${i}`}
            cx={rnd(i * 13 + 3) * 1900}
            cy={100 + rnd(i * 7 + 1) * 560}
            rx={50 + rnd(i * 5) * 70}
            ry={24 + rnd(i * 11) * 30}
            fill={C4.oil}
            opacity={0.14}
          />
        ))}
        {/* 天井から下がるベルト軸 */}
        <rect x={-10} y={370} width={1940} height={16} fill={C4.ironDark} opacity={0.85} />
        {[...Array(9)].map((_, i) => (
          <circle key={`pu${i}`} cx={120 + i * 220} cy={378} r={26} fill={C4.iron} stroke={C4.ink} strokeWidth={4} opacity={0.85} />
        ))}

        {/* 工場の板床 */}
        <PlankFloor y={720} k={10} />
        {/* 油染み */}
        {[...Array(8)].map((_, i) => (
          <ellipse
            key={`ol${i}`}
            cx={rnd(i * 17 + 5) * 1880}
            cy={760 + rnd(i * 7 + 3) * 280}
            rx={40 + rnd(i * 5) * 50}
            ry={14 + rnd(i * 3) * 14}
            fill={C4.oil}
            opacity={0.22}
          />
        ))}

        {/* 輪転機 */}
        <RotaryPress x={520} y={620} s={1.02} f={f} />
        {/* 輪転機から天井へのベルト */}
        <path d="M 408 460 L 400 386 M 630 450 L 640 386" stroke={C4.oil} strokeWidth={9} opacity={0.8} />

        {/* 刷り上がった新聞の束 */}
        <g>
          {[0, 1, 2].map((i) => (
            <g key={`bd${i}`} transform={`translate(${920 + i * 24} ${886 - i * 54})`}>
              <rect x={-74} y={-44} width={148} height={56} fill={C4.paper} stroke={C4.ink} strokeWidth={4.5} />
              {[...Array(5)].map((_, j) => (
                <line key={`bl${i}_${j}`} x1={-74} y1={-36 + j * 11} x2={74} y2={-36 + j * 11} stroke={C4.paperShade} strokeWidth={2.4} />
              ))}
              {/* 結束の紐 */}
              <rect x={-14} y={-46} width={12} height={60} fill={C4.woodDark} opacity={0.75} />
            </g>
          ))}
        </g>

        {/* 束を運ぶ人 */}
        <g transform={`translate(${lerp(1140, 1210, go)} 0)`}>
          <Person x={0} y={1000} s={0.8} f={f} phase={4} pose="hold" face="normal" cloth={C4.iron} clothDark={C4.ironDark} hair="cap" gaze={[2, 1]} />
          {/* 抱えた束 */}
          <g transform="translate(96 828)">
            <rect x={-70} y={-40} width={140} height={78} fill={C4.paper} stroke={C4.ink} strokeWidth={4.5} />
            {[...Array(6)].map((_, j) => (
              <line key={`cl${j}`} x1={-70} y1={-30 + j * 13} x2={70} y2={-30 + j * 13} stroke={C4.paperShade} strokeWidth={2.4} />
            ))}
          </g>
        </g>

        {/* 自転車の配達 (右へ走る) */}
        <g transform={`translate(${lerp(1300, 1500, go)} 950) scale(0.86)`}>
          {/* 影 */}
          <ellipse cx={0} cy={56} rx={150} ry={16} fill={C4.ink} opacity={0.16} />
          {/* 車輪 */}
          {[-96, 96].map((wx, i) => (
            <g key={`wl${i}`} transform={`translate(${wx} 0) rotate(${wheel * (i ? 1 : 1)})`}>
              <circle cx={0} cy={0} r={56} fill="none" stroke={C4.ink} strokeWidth={7} />
              {[...Array(6)].map((_, j) => {
                const a = (j * Math.PI) / 3;
                return <line key={`sk${j}`} x1={0} y1={0} x2={Math.cos(a) * 50} y2={Math.sin(a) * 50} stroke={C4.ink} strokeWidth={3} opacity={0.7} />;
              })}
              <circle cx={0} cy={0} r={9} fill={C4.iron} stroke={C4.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 車体 */}
          <path d="M -96 0 L -16 -56 L 60 -56 L 96 0 M -16 -56 L 20 0 L -96 0 M 60 -56 L 96 0" stroke={C4.ink} strokeWidth={7} fill="none" />
          {/* ハンドル */}
          <path d="M 60 -56 L 70 -104 L 110 -104" stroke={C4.ink} strokeWidth={6} fill="none" />
          {/* サドル */}
          <ellipse cx={-16} cy={-66} rx={28} ry={10} fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
          {/* 新聞の籠 */}
          <g transform="translate(-72 -56)">
            <rect x={-44} y={-54} width={88} height={56} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
            {[...Array(4)].map((_, j) => (
              <rect key={`bn${j}`} x={-36 + j * 20} y={-72} width={16} height={26} fill={C4.paper} stroke={C4.ink} strokeWidth={3} />
            ))}
          </g>
          {/* 配達の人 */}
          <PersonMini x={-14} y={-74} s={0.46} color={C4.brickDark} f={f} phase={2} face="smile" />
        </g>

        {/* 四方へ散る矢印 */}
        {[[-34, 1750, 620], [0, 1820, 760], [30, 1790, 900]].map(([rot, ax, ay], i) => (
          <Arrow
            key={`ar${i}`}
            x={Number(ax)}
            y={Number(ay)}
            s={1.1}
            rot={Number(rot)}
            t={seg(f, 20 + i * 4, 34 + i * 4)}
            color={C4.red}
          />
        ))}

        {/* 奥に灯る家々の窓 */}
        {[...Array(10)].map((_, i) => (
          <rect
            key={`hs${i}`}
            x={1300 + (i % 5) * 120}
            y={430 + Math.floor(i / 5) * 76}
            width={44}
            height={52}
            fill={C4.skyWarm}
            stroke={C4.ink}
            strokeWidth={3.4}
            opacity={easeOut(seg(f, 22 + i * 1.4, 36 + i * 1.4)) * 0.85}
          />
        ))}
      </g>
      <TagPlate x={926} y={258} text="国じゅうへ" size={40} t={seg(f, 26, 40)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #76 戦場ひとつ、帝国の試験ときて、輪はついに「国」の大きさです。
// 格: 山 — 土俵マップ③。序#15 / 第2章#47 (R=88 赤) / 第3章#59 (帝国) の輪を破線で残し、
//   その外へ「国」の輪が1段広がる。輪が広がる以外は変えない
// ------------------------------------------------------------------
const S76: React.FC<{ f: number }> = ({ f }) => {
  const CX = 830;
  const CY = 500;
  const grow = easeOut(seg(f, 8, 38));
  const R3 = lerp(248, 352, grow);           // 「国」の輪 (3段目)
  const breathe = 1 + Math.sin(f / 9) * 0.022;
  const z = lerp(1.14, 1.0, easeOut(seg(f, 0, 32)));
  return (
    <Frame f={f} seed={975} bg={KRP.cream}>
      <g transform={zoomAt(z, CX, CY)}>
        <MapDesk f={f} idk="76" px={120} py={120} pw={1680} ph={636}>
          {/* 地図の中身: 低い山と川と町 */}
          {[...Array(5)].map((_, i) => {
            const mx = 200 + i * 240;
            return (
              <path
                key={`mt${i}`}
                d={`M ${mx - 90} 700 L ${mx} ${560 + rnd(i * 7) * 70} L ${mx + 90} 700 Z`}
                fill="none"
                stroke={C4.stoneLine}
                strokeWidth={3}
                opacity={0.4}
              />
            );
          })}
          <path
            d="M 150 320 q 260 70 480 20 q 250 -56 500 40 q 220 84 540 10"
            stroke={C4.glass}
            strokeWidth={10}
            fill="none"
            opacity={0.7}
          />
          {/* 町の印 */}
          {[...Array(12)].map((_, i) => (
            <circle
              key={`tw${i}`}
              cx={200 + rnd(i * 13 + 1) * 1480}
              cy={200 + rnd(i * 7 + 5) * 480}
              r={7}
              fill={C4.stoneLine}
              opacity={0.55}
            />
          ))}

          <g transform={`translate(${CX} ${CY}) scale(${breathe}) translate(${-CX} ${-CY})`}>
            {/* 1段目: 第2章#47 の赤い小円 (R=88・正円・KRP.red・strokeWidth 7) を破線で残す */}
            <DohyoRing cx={CX} cy={CY} r={88} color={KRP.red} sw={7} dash op={0.95} />
            {/* 2段目: 第3章#59 の帝国の輪を破線で残す */}
            <DohyoRing cx={CX} cy={CY} r={236} color={C4.redDeep} sw={8} dash op={0.7} />
            {/* 3段目: 新しく広がる「国」の輪 */}
            <DohyoRing cx={CX} cy={CY} r={R3} color={C4.red} sw={9} op={0.95} />
            {/* 広がりの波紋 */}
            <DohyoRing
              cx={CX}
              cy={CY}
              r={R3 + 30 + Math.sin(f / 8) * 12}
              color={C4.red}
              sw={4}
              dash
              op={0.3}
            />
          </g>

          {/* 中心の小さな人 */}
          <PersonMini x={CX} y={CY + 44} s={0.3} color={C4.gown} f={f} phase={0} face="dot" />

          {/* 2段目の輪の上に並ぶ人 (帝国) */}
          {[...Array(8)].map((_, i) => {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            return (
              <PersonMini
                key={`p2${i}`}
                x={CX + Math.cos(a) * 236}
                y={CY + Math.sin(a) * 236 * 0.72 + 14}
                s={0.16}
                color={C4.gownAlt}
                f={f}
                phase={i * 2}
                face="none"
              />
            );
          })}
          {/* 3段目の輪の上に並ぶ人 (国) */}
          {[...Array(12)].map((_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            return (
              <PersonMini
                key={`p3${i}`}
                x={CX + Math.cos(a) * R3}
                y={CY + Math.sin(a) * R3 * 0.72 + 14}
                s={0.15}
                color={C4.brickDark}
                f={f}
                phase={i * 3}
                face="none"
              />
            );
          })}

          {/* 引き出し線 (2本の破線) */}
          <line x1={CX + 92} y1={CY - 42} x2={1270} y2={CY - 170} stroke={C4.ink} strokeWidth={3} strokeDasharray="12 10" opacity={0.5} />
          <line x1={CX + R3 - 10} y1={CY - 140} x2={1270} y2={CY + 170} stroke={C4.ink} strokeWidth={3} strokeDasharray="12 10" opacity={0.5} />
        </MapDesk>
      </g>
      {/* 縦に積む2枚は左端をそろえる (x は中心なので字数ぶんずらす)。
          札の幅 = 字数*size + 44。
            「戦場ひとつ」      5字*44+44 = 264 → 左端 = x - 132
            「ついに国の大きさ」8字*42+44 = 380 → 左端 = x - 190
          どちらも左端を 1310 (引き出し線の先 x=1270 の 40px 右) にそろえる */}
      <TagPlate x={1442} y={300} text="戦場ひとつ" size={44} t={seg(f, 14, 28)} />
      <TagPlate x={1500} y={660} text="ついに国の大きさ" size={42} t={seg(f, 28, 40)} color={C4.red} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #77 そのころの日本はどうだったか。これが、なかなか面白いのです。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB4.md に合わせる
// ------------------------------------------------------------------
const S77: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.7 + Math.sin(f / 12) * 0.12;
  const ripple = f / 17;
  return (
    <Frame f={f} seed={976} bg={KRP.cream}>
      {/* 空 (夕暮れ) */}
      <rect x={0} y={0} width={W} height={620} fill={C4.skyWarm} />
      <rect x={0} y={0} width={W} height={300} fill={C4.sky} opacity={0.55} />
      {[...Array(4)].map((_, i) => (
        <ellipse
          key={`cl${i}`}
          cx={260 + i * 470 + Math.sin((f + i * 40) / 52) * 10}
          cy={110 + rnd(i * 7 + 3) * 90}
          rx={170 + rnd(i * 3) * 60}
          ry={26 + rnd(i * 5) * 10}
          fill={KRP.white}
          opacity={0.36}
        />
      ))}
      {/* 月 */}
      <circle cx={1660} cy={170} r={56} fill={KRP.white} opacity={0.8} />

      {/* 瓦屋根の町のシルエット (2層) */}
      {/* 奥の層 */}
      <g opacity={0.28}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const bx = -60 + i * 350;
          return (
            <g key={`fr${i}`}>
              <rect x={bx} y={470} width={300} height={160} fill={C4.ink} />
              <path d={`M ${bx - 26} 470 Q ${bx + 150} ${404 - rnd(i * 7) * 24} ${bx + 326} 470 Z`} fill={C4.ink} />
            </g>
          );
        })}
      </g>
      {/* 手前の層 */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const bx = -40 + i * 420;
          const top = 530 + rnd(i * 11) * 40;
          return (
            <g key={`nr${i}`}>
              <rect x={bx} y={top} width={360} height={700 - top} fill={C4.sumi} />
              {/* 反りのある瓦屋根 */}
              <path
                d={`M ${bx - 34} ${top} Q ${bx + 180} ${top - 74} ${bx + 394} ${top} Z`}
                fill={C4.sumi}
              />
              <path
                d={`M ${bx - 34} ${top} Q ${bx + 180} ${top - 74} ${bx + 394} ${top}`}
                stroke={C4.stoneShade}
                strokeWidth={5}
                fill="none"
                opacity={0.55}
              />
              {/* 瓦の筋 */}
              {[...Array(7)].map((_, j) => (
                <line
                  key={`kw${i}_${j}`}
                  x1={bx + 20 + j * 54}
                  y1={top - 54 + Math.abs(j - 3) * 10}
                  x2={bx + 20 + j * 54}
                  y2={top}
                  stroke={C4.stoneShade}
                  strokeWidth={2.6}
                  opacity={0.26}
                />
              ))}
              {/* 格子窓の灯り */}
              <rect x={bx + 110} y={top + 48} width={110} height={70} fill={C4.skyWarm} opacity={glow} />
              {[0, 1, 2].map((j) => (
                <line key={`kg${i}_${j}`} x1={bx + 110 + j * 37} y1={top + 48} x2={bx + 110 + j * 37} y2={top + 118} stroke={C4.sumi} strokeWidth={4} />
              ))}
            </g>
          );
        })}
      </g>

      {/* 火の見櫓 */}
      <g>
        <path d="M 1300 700 L 1348 330 M 1480 700 L 1432 330" stroke={C4.sumi} strokeWidth={10} />
        {[0, 1, 2, 3].map((i) => (
          <line key={`tw${i}`} x1={1310 + i * 10} y1={660 - i * 82} x2={1470 - i * 10} y2={660 - i * 82} stroke={C4.sumi} strokeWidth={7} />
        ))}
        {/* 筋交い */}
        {[0, 1, 2].map((i) => (
          <line key={`bc${i}`} x1={1312 + i * 10} y1={660 - i * 82} x2={1468 - (i + 1) * 10} y2={578 - i * 82} stroke={C4.sumi} strokeWidth={4} opacity={0.7} />
        ))}
        {/* やぐらの床と屋根 */}
        <rect x={1296} y={318} width={188} height={16} fill={C4.sumi} />
        <path d="M 1282 318 Q 1390 258 1498 318 Z" fill={C4.sumi} />
        {/* 半鐘 */}
        <path d="M 1368 286 q 22 -30 44 0 L 1412 306 L 1368 306 Z" fill={C4.gold} stroke={C4.ink} strokeWidth={3.4} opacity={0.85} />
      </g>

      {/* 提灯 (手前に3つ) */}
      {[[250, 430], [700, 400], [1120, 426]].map(([lx, ly], i) => (
        <g key={`ln${i}`} transform={`translate(${lx} ${Number(ly) + Math.sin((f + i * 13) / 16) * 5}) rotate(${Math.sin((f + i * 9) / 18) * 4})`}>
          <line x1={0} y1={-70} x2={0} y2={-34} stroke={C4.ink} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={34} ry={44} fill={C4.skyWarm} stroke={C4.ink} strokeWidth={4.5} opacity={0.95} />
          {[-26, -12, 2, 16, 30].map((ry2, j) => (
            <line key={`lr${i}_${j}`} x1={-32} y1={ry2} x2={32} y2={ry2} stroke={C4.ink} strokeWidth={2.2} opacity={0.4} />
          ))}
          <rect x={-14} y={-50} width={28} height={10} fill={C4.redDeep} stroke={C4.ink} strokeWidth={3} />
          <rect x={-14} y={40} width={28} height={10} fill={C4.redDeep} stroke={C4.ink} strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={70} ry={78} fill={C4.skyWarm} opacity={0.17} />
        </g>
      ))}

      {/* 堀の水面 */}
      <rect x={0} y={700} width={W} height={380} fill={C4.glass} />
      {[...Array(9)].map((_, i) => (
        <path
          key={`wv${i}`}
          d={`M ${-30 + Math.sin(ripple + i * 0.7) * 16} ${716 + i * 36} q 120 ${i % 2 ? -7 : 7} 240 0 q 120 ${i % 2 ? 7 : -7} 240 0 q 120 ${i % 2 ? -7 : 7} 240 0 q 120 ${i % 2 ? 7 : -7} 240 0 q 120 ${i % 2 ? -7 : 7} 240 0 q 120 ${i % 2 ? 7 : -7} 240 0 q 120 0 240 0`}
          stroke={C4.ink}
          strokeWidth={2.4}
          fill="none"
          opacity={0.14 + i * 0.012}
        />
      ))}
      {/* 灯りの映り込み */}
      {[250, 700, 1120].map((lx, i) => (
        <rect
          key={`rf${i}`}
          x={lx - 14}
          y={704}
          width={28}
          height={170 + Math.sin((f + i * 11) / 13) * 14}
          fill={C4.skyWarm}
          opacity={0.3}
        />
      ))}

      {/* 柳 (右手前) */}
      <g>
        <path d="M 1800 1040 Q 1770 820 1790 640" stroke={C4.woodDark} strokeWidth={14} fill="none" />
        {[...Array(9)].map((_, i) => {
          const bx = 1700 + i * 26;
          const sw = Math.sin((f + i * 15) / 20) * 12;
          return (
            <path
              key={`wl${i}`}
              d={`M 1790 ${652 + i * 10} Q ${bx + sw} ${760 + i * 16} ${bx - 20 + sw * 1.6} ${880 + i * 18}`}
              stroke={C4.leafDark}
              strokeWidth={4.5}
              fill="none"
              opacity={0.75}
            />
          );
        })}
      </g>

      {/* 手前: 番付らしき紙を丸めて持つ影 (まだ見せない) */}
      <g opacity={0.92}>
        <ellipse cx={520} cy={1046} rx={150} ry={22} fill={C4.ink} opacity={0.2} />
        {/* 影の人 (真っ黒のシルエット) */}
        <g transform="translate(520 1030) scale(1.08)">
          {/* 脚 */}
          <rect x={-40} y={-60} width={30} height={60} fill={C4.sumi} />
          <rect x={10} y={-60} width={30} height={60} fill={C4.sumi} />
          {/* 胴 (着物の形) */}
          <path d="M -70 -170 L -84 -56 L 84 -56 L 70 -170 Z" fill={C4.sumi} />
          {/* 腕 */}
          <rect x={-96} y={-176} width={30} height={96} rx={14} fill={C4.sumi} />
          <rect x={66} y={-176} width={30} height={96} rx={14} fill={C4.sumi} />
          {/* 肩と襟 */}
          <path d="M -70 -170 Q 0 -196 70 -170 L 70 -158 Q 0 -182 -70 -158 Z" fill={C4.sumi} />
          {/* 頭 (髷つき) */}
          <circle cx={0} cy={-236} r={56} fill={C4.sumi} />
          <path d="M -16 -290 q 16 -22 32 -4 q 10 12 -4 18 Z" fill={C4.sumi} />
          {/* 丸めた紙 (手に握る) */}
          <g transform="translate(96 -150) rotate(-24)">
            <rect x={-14} y={-96} width={28} height={192} rx={13} fill={C4.paperDark} stroke={C4.ink} strokeWidth={4} />
            <ellipse cx={0} cy={-96} rx={14} ry={7} fill={C4.paper} stroke={C4.ink} strokeWidth={3.4} />
            <line x1={-8} y1={-70} x2={-8} y2={80} stroke={C4.paperShade} strokeWidth={3} />
          </g>
        </g>
      </g>

      <TagPlate x={330} y={250} text="つぎは日本" size={48} t={seg(f, 22, 38)} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib4_s063:                  (f) => <S63 f={f} />,
  ib4_s064:                  (f) => <S64 f={f} />,
  ib4_s065:                  (f) => <S65 f={f} />,
  ib4_s066:                  (f) => <S66 f={f} />,
  ib4_s067:                  (f) => <S67 f={f} />,
  ib4_s068:                  (f) => <S68 f={f} />,
  ib4_s069:                  (f) => <S69 f={f} />,
  ib4_s070:                  (f) => <S70 f={f} />,
  ib4_s071:                  (f) => <S71 f={f} />,
  ib4_s072:                  (f) => <S72 f={f} />,
  ib4_s073:                  (f) => <S73 f={f} />,
  ib4_s074:                  (f) => <S74 f={f} />,
  ib4_s075:                  (f) => <S75 f={f} />,
  ib4_s076:                  (f) => <S76 f={f} />,
  ib4_s077:                  (f) => <S77 f={f} />,
};

export const I_B4_MOTIFS: string[] = [
  "ib4_s063",                  // #63 第4章、首席は英雄、ビリには木のスプーン。
  "ib4_s064",                  // #64 1599年、イエズス会という修道会が、学校の規則集を作りました。
  "ib4_s065",                  // #65 試験と競争で生徒に順位をつける手続きを、公式に定めた最古級の記録です。
  "ib4_s066",                  // #66 学校と順位の長い付き合いは、ここから始まります。
  "ib4_s067",                  // #67 この文化が思いきり花開いたのが、イギリスのケンブリッジ大学でした。
  "ib4_s068",                  // #68 名物は数学の卒業試験。成績の順位が、1位から最後まで公表されました。
  "ib4_s069",                  // #69 首席は「シニア・ラングラー」と呼ばれる、国民的スターです。
  "ib4_s070",                  // #70 新聞に名前が載り、出身の町の誇りになりました。
  "ib4_s071",                  // #71 では、最下位の学生はどうなったでしょう。
  "ib4_s072",                  // #72 木のスプーンが、贈られました。
  "ib4_s073",                  // #73 なぜスプーンなのかは謎ですが、1793年から100年以上も続いた伝統です。
  "ib4_s074",                  // #74 笑い話に見えますが、注目してほしいのは、新聞のほうです。
  "ib4_s075",                  // #75 順位が紙に刷られて、国じゅうに配られるようになりました。
  "ib4_s076",                  // #76 戦場ひとつ、帝国の試験ときて、輪はついに「国」の大きさです。
  "ib4_s077",                  // #77 そのころの日本はどうだったか。これが、なかなか面白いのです。
];

export const ichiB4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B4_PREVIEW_FRAMES = Math.max(I_B4_MOTIFS.length, 1);
export const IchiB4Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B4_MOTIFS.length - 1);
  return <>{ichiB4Scene(I_B4_MOTIFS[i] ?? "", 45)}</>;
};
