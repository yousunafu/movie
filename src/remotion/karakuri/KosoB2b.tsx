// 「なぜ高層ビルは生まれたのか」: 第2章「人を、上げる。」中盤
// 担当範囲: 台本 docs/koso-script-v7.txt の 91〜102行目 (文#90〜#101・12文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は必ず kb2_ で始める。WobbleDefs の seed はこのファイルでは 630〜641 を使う。
// 設計書: docs/koso-ch2-design.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層-7)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, RopeFray, Sheave, GrooveSection, GuideRail, ToothRail,
  Spring, Pawl, Sparks, Car, Counterweight, Shaft, Balance,
  Maru, MaruBatsu, SpeedGraph, FloorScale, ForceArrow, ButtonPanel, Lever, FlowPlates,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。装置の色は BP を使う)
// ===================================================================
const C = {
  skyDay: "#CFE2F0",
  skyHaze: "#E2EAEF",
  skyDusk: "#F0CBA0",
  brick: "#B4704C",
  brickDark: "#8E5438",
  stone: "#CFC6B4",
  wood: "#A77C4E",
  woodDark: "#7E5B36",
  ink2: "#3A4350",
  bamboo: "#A8B870",
  bambooDark: "#7E8E4E",
  water: "#7FB4D8",
  waterDeep: "#4E87B0",
  earth: "#9C8160",
  earthWet: "#6F5A3E",
  tile: "#DCD6C6",
  plaster: "#E6DFCE",
  leather: "#6B4A33",
} as const;

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #90 井戸のつるべと、同じ仕組みです。 =====
// 格: 並
// どこ: 日本の井戸端。前の文まで西洋のビルだったのが、ここで足元の井戸に飛ぶ (呼吸)。
// 演出: 石組みの井戸・竹の櫓と竹の滑車・2つの桶 (片方下がれば片方上がる)・汲む人1人・濡れた土。
// 動き: 滑車が回り、左の桶が上がって右の桶が下がる。水が揺れて滴が落ちる。
const Kb2bIdoNoTsurube: React.FC<{ f: number }> = ({ f }) => {
  const WX = 640;                       // 井戸の中心
  const MY = 644;                       // 井戸の口
  const PX = WX, PY = 268, PR = 108;    // 竹の滑車
  const LX = WX - 86, HX = WX + 86;     // ロープ2本
  const t = easeOut(clamp01(seg(f, 3, 30)));
  const sw = (Math.sin((f - 7) / 16) * 0.5 + 0.5) * t;
  const upY = lerp(690, 408, sw);       // 上がってくる桶 (水あり)
  const dnY = lerp(408, 690, sw);       // 下がる桶 (空)
  const rot = -sw * 58 + f * 0.5;
  // 木の桶 (原点 = 桶の口の中央)
  const Oke: React.FC<{ x: number; y: number; water: number }> = ({ x, y, water }) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -62 0 L 62 0 L 46 96 L -46 96 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.8}>
        <line x1={-30} y1={2} x2={-23} y2={94} />
        <line x1={0} y1={2} x2={0} y2={94} />
        <line x1={30} y1={2} x2={23} y2={94} />
      </g>
      <rect x={-60} y={18} width={120} height={12} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-52} y={70} width={104} height={12} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3.5} />
      {water > 0.1 && (
        <g>
          <path d={`M -56 ${22 + Math.sin(f / 6) * 3} Q 0 ${34 + Math.sin(f / 5) * 5} 56 ${22 - Math.sin(f / 6) * 3} L 50 60 L -50 60 Z`}
            fill={C.water} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          <ellipse cx={-16} cy={28} rx={16} ry={5} fill={KRP.white} opacity={0.4} />
        </g>
      )}
      {/* 弦 (つる) */}
      <path d="M -58 2 Q 0 -66 58 2" fill="none" stroke={BP.steelDark} strokeWidth={8} />
      <circle cx={0} cy={-38} r={9} fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  return (
    <Frame f={f} seed={630} bg={KRP.cream}>
      {/* 空気 (遠景の明るい帯) */}
      <rect x={0} y={0} width={W} height={420} fill={C.skyHaze} opacity={0.6} />
      {/* 竹垣 (背景) */}
      <g>
        <rect x={1000} y={548} width={920} height={168} fill={C.bamboo} opacity={0.45} />
        <g stroke={C.bambooDark} strokeWidth={9} opacity={0.85}>
          {Array.from({ length: 19 }, (_, i) => (
            <line key={i} x1={1014 + i * 48} y1={548} x2={1014 + i * 48} y2={716} />
          ))}
        </g>
        <g stroke={C.woodDark} strokeWidth={11}>
          <line x1={1000} y1={584} x2={1920} y2={584} />
          <line x1={1000} y1={680} x2={1920} y2={680} />
        </g>
      </g>
      {/* 地面と濡れた土 */}
      <rect x={0} y={716} width={W} height={364} fill={C.earth} />
      <rect x={0} y={716} width={W} height={14} fill={C.earthWet} opacity={0.6} />
      <ellipse cx={WX + 40} cy={812} rx={520} ry={76} fill={C.earthWet} opacity={0.5} />
      <ellipse cx={1010} cy={800} rx={74} ry={20} fill={C.water} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
      {/* 櫓の柱 (地面から) */}
      {[360, 920].map((px) => (
        <g key={px}>
          <rect x={px - 24} y={186} width={48} height={610} fill={C.bamboo} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.bambooDark} strokeWidth={5}>
            {[282, 414, 546, 678].map((ny) => <line key={ny} x1={px - 24} y1={ny} x2={px + 24} y2={ny} />)}
          </g>
        </g>
      ))}
      {/* 梁 */}
      <rect x={296} y={150} width={688} height={50} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={340} y1={175} x2={940} y2={175} n={9} r={7} fill={C.woodDark} />
      {/* 筋交い */}
      <g stroke={C.bambooDark} strokeWidth={14} strokeLinecap="round">
        <line x1={372} y1={212} x2={470} y2={288} />
        <line x1={908} y1={212} x2={810} y2={288} />
      </g>
      {/* 井戸の石組み (口の奥 → 石積み) */}
      <ellipse cx={WX} cy={MY} rx={252} ry={66} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={WX} cy={MY + 4} rx={206} ry={48} fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={WX} cy={MY + 22} rx={150} ry={32} fill={C.waterDeep} opacity={0.55} />
      <path d={`M ${WX - 252} ${MY} L ${WX - 234} 820 L ${WX + 234} 820 L ${WX + 252} ${MY} Z`}
        fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      {/* 石のブロック割り */}
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.85}>
        {[700, 756, 812].map((by, r) => (
          <g key={by}>
            <line x1={WX - 246 + r * 4} y1={by} x2={WX + 246 - r * 4} y2={by} />
            {Array.from({ length: 5 }, (_, i) => (
              <line key={i} x1={WX - 200 + i * 100 + (r % 2) * 50} y1={by - 56}
                x2={WX - 200 + i * 100 + (r % 2) * 50} y2={by} />
            ))}
          </g>
        ))}
      </g>
      <ellipse cx={WX} cy={MY} rx={252} ry={66} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.35} />
      {/* ロープ (井戸の中は石組みの手前に) */}
      <Rope x1={LX} y1={PY} x2={LX} y2={upY - 40} w={20} kind="hemp" f={f} />
      <Rope x1={HX} y1={PY} x2={HX} y2={dnY - 40} w={20} kind="hemp" f={f} />
      {/* 竹の滑車 */}
      <g>
        <rect x={PX - 20} y={198} width={40} height={PR * 0.5} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(${PX} ${PY}) rotate(${rot})`}>
          <circle cx={0} cy={0} r={PR} fill={C.bamboo} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={0} cy={0} r={PR * 0.86} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={0} r={PR * 0.76} fill={C.bamboo} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={C.bambooDark} strokeWidth={6} opacity={0.9}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30}
                x2={Math.cos(a) * PR * 0.72} y2={Math.sin(a) * PR * 0.72} />;
            })}
          </g>
          <circle cx={0} cy={0} r={32} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
          <HexBolt x={0} y={0} r={13} />
        </g>
        <circle cx={PX} cy={PY} r={8} fill={KRP.ink} />
      </g>
      {/* 2つの桶 */}
      <Oke x={LX} y={upY} water={1} />
      <Oke x={HX} y={dnY} water={0} />
      {/* 滴 */}
      <g opacity={t}>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={LX - 24 + i * 24}
            cy={upY + 104 + ((f * 7 + i * 34) % 120)} rx={6} ry={11}
            fill={C.water} stroke={KRP.ink} strokeWidth={3} />
        ))}
      </g>
      {/* 水を汲む人 */}
      <Person x={1130} y={798} s={1.0} f={f} cloth="#6B7F58" clothDark="#4E6040"
        face="smile" gaze={[-6, 2]} lean={4} />
      {/* 足元の手桶 */}
      <g transform="translate(1560 786)">
        <path d="M -46 0 L 46 0 L 34 72 L -34 72 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-44} y={14} width={88} height={10} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3} />
        <path d="M -42 2 Q 0 -48 42 2" fill="none" stroke={C.woodDark} strokeWidth={7} />
      </g>
      {/* 力の向き */}
      <ForceArrow x={LX - 112} y={upY + 50} len={190} rot={-90} w={22}
        color={KRP.green} t={seg(f, 14, 32)} label="上がる" labelSize={34} />
      <ForceArrow x={HX + 112} y={dnY - 40} len={190} rot={90} w={22}
        color={KRP.red} t={seg(f, 20, 38)} label="下がる" labelSize={34} />
      <TagPlate x={1520} y={272} text="つるべ" size={56} t={seg(f, 6, 20)} />
      <TagPlate x={190} y={720} text="井戸" size={48} t={seg(f, 12, 26)} />
    </Frame>
  );
};

// ===== #91 おもりが、かごの重さを釣り合わせてくれます。 =====
// 格: 図
// どこ: クリーム地の方眼。てんびん1台だけ。人も背景も置かない。
// 演出: 左の皿にかご、右の皿におもり。竿が水平で止まる = 釣り合い。
// 動き: 竿の傾きが揺れながら 0 に収束する。かごの天井灯が点り、支点に赤い印が出る。
const Kb2bTsuriawaseru: React.FC<{ f: number }> = ({ f }) => {
  const S = 1.0, BX = 960, BY = 200, SPAN = 1000, DROP = 300;
  const settle = easeOut(clamp01(seg(f, 4, 32)));
  const tilt = 13 * (1 - settle) * Math.cos((f - 4) / 4.6);
  const panY = BY + (DROP - 18) * S;      // 皿の上面 (傾き0のとき)
  const halfX = (SPAN / 2 - 56) * S;      // 皿の中心までの距離
  return (
    <Frame f={f} seed={631} bg={KRP.cream}>
      <GridPaper />
      <Balance
        x={BX} y={BY} s={S} f={f} tilt={tilt} span={SPAN} drop={DROP}
        pivotMark={settle > 0.7}
        leftNode={
          <g>
            <Car x={0} y={-4} w={212} h={244} f={f} door={0} sling={false} lamp indicator={undefined} />
          </g>
        }
        rightNode={<Counterweight x={0} y={-4} w={182} h={238} plates={7} shoe={false} />}
      />
      {/* 重さの向き (左右で同じ長さ = 釣り合い) */}
      <ForceArrow x={BX - 700} y={420} len={200} rot={90} w={24}
        color={KRP.red} t={seg(f, 12, 28)} label="重さ" labelSize={36} />
      <ForceArrow x={BX + 700} y={420} len={200} rot={90} w={24}
        color={KRP.red} t={seg(f, 12, 28)} label="重さ" labelSize={36} />
      {/* 水平の目安線 (釣り合ったら赤くなる) */}
      <line x1={120} y1={BY - 35} x2={1800} y2={BY - 35}
        stroke={settle > 0.85 ? KRP.red : KRP.ink} strokeWidth={5}
        strokeDasharray="22 16" opacity={0.5 + settle * 0.4} />
      <TagPlate x={960} y={690} text="つり合い" size={50} t={seg(f, 22, 38)} color={KRP.red} />
      <TagPlate x={BX - halfX} y={648} text="かご" size={48} t={seg(f, 6, 20)} />
      <TagPlate x={BX + halfX} y={648} text="おもり" size={48} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #92 だからモーターは、全部を引き受けずに済みます。 =====
// モーター (原点 = 台座の下端中央)。巻線・軸・端子・冷却フィン・台座のボルトまで描く。
const Kb2bMotor: React.FC<{
  w: number; h: number; f: number; spin: number; strain?: number;
}> = ({ w, h, f, spin, strain = 0 }) => {
  const hw = w / 2;
  const body = h - 30;                  // 胴の高さ
  const cy = -30 - body / 2;            // 胴の中心
  const rr = body / 2;
  const fins = Math.max(5, Math.round(w / 48));
  return (
    <g>
      {/* 台座 */}
      <rect x={-hw - 18} y={-30} width={w + 36} height={30} rx={5}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
      <HexBolt x={-hw - 2} y={-15} r={10} />
      <HexBolt x={hw + 2} y={-15} r={10} />
      {/* 胴 (円筒) */}
      <rect x={-hw} y={-h} width={w} height={body} rx={rr * 0.42}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
      {/* 冷却フィン */}
      <g stroke={BP.steelDark} strokeWidth={6} opacity={0.85}>
        {Array.from({ length: fins }, (_, i) => {
          const px = -hw + ((i + 1) * w) / (fins + 1);
          return <line key={i} x1={px} y1={-h + 16} x2={px} y2={-42} />;
        })}
      </g>
      <rect x={-hw + 8} y={-h + 10} width={w - 16} height={rr * 0.2}
        fill={KRP.white} opacity={0.26} />
      {/* 巻線の覗き窓 (銅線) */}
      <rect x={-hw * 0.42} y={cy - rr * 0.46} width={hw * 0.84} height={rr * 0.92} rx={9}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
      <g strokeLinecap="round">
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={-hw * 0.34} y1={cy - rr * 0.3 + i * (rr * 0.15)}
            x2={hw * 0.34} y2={cy - rr * 0.3 + i * (rr * 0.15)}
            stroke={i % 2 ? KRP.copper : BP.brass} strokeWidth={Math.max(5, rr * 0.1)} />
        ))}
      </g>
      {/* 端子箱と引込線 */}
      <rect x={-hw * 0.78} y={-h - 30} width={hw * 0.62} height={32} rx={5}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${-hw * 0.48} ${-h - 30} Q ${-hw * 0.48 - 40} ${-h - 86} ${-hw * 0.9 - 40} ${-h - 70}`}
        fill="none" stroke={KRP.ink} strokeWidth={8} />
      {/* 軸 (右へ出る) + 綱車 */}
      <rect x={hw - 4} y={cy - 15} width={44} height={30} rx={6}
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
      <Sheave x={hw + 40 + rr * 0.56} y={cy} r={rr * 0.56} rot={spin} spokes={5}
        groove bracket={false} />
      {/* 力んでいる印 (熱) */}
      {strain > 0.01 && (
        <g opacity={strain} stroke={BP.spark} strokeWidth={7} strokeLinecap="round" fill="none">
          {[-1, 0, 1].map((i) => (
            <path key={i}
              d={`M ${i * 76} ${-h - 46} q 18 ${-26 + Math.sin(f / 5 + i) * 7} 0 -52 q -18 -26 0 -52`} />
          ))}
        </g>
      )}
    </g>
  );
};

// 格: 図
// どこ: クリーム地の方眼。○×の対比台1つだけ。
// 演出: 左に大きいモーター (×)、右に小さいモーター (○)。おもりがあるから小さくて足りる。
// 動き: 両方の綱車が回る (大は遅く・熱を上げ、小は軽く速く)。○×がポンと出る。
const Kb2bMotorSukunaku: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 8, 24);
  const strain = easeOut(clamp01(seg(f, 4, 22)));
  return (
    <Frame f={f} seed={632} bg={KRP.cream}>
      <GridPaper />
      {/* ○× は自前で横に置く (部品の既定位置だと装置を大きくできない) */}
      <MaruBatsu
        x={960} y={694} s={1.1} t={t} gap={880} labelSize={36}
        leftMark="none" rightMark="none"
        leftText="全部を引く" rightText="差だけ引く"
        leftNode={<Kb2bMotor w={420} h={262} f={f} spin={f * 2.2} strain={strain} />}
        rightNode={<Kb2bMotor w={250} h={172} f={f} spin={f * 9} />}
      />
      <XMark x={520} y={278} s={2.2} t={t} />
      <Maru x={1400} y={336} s={1.5} t={t} />
      {/* 大きい方は唸っている (振動の線) */}
      <g opacity={strain * 0.9} stroke={KRP.red} strokeWidth={6} strokeLinecap="round">
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <line x1={520 + sg * 250} y1={560 + Math.sin(f / 4) * 4} x2={520 + sg * 306} y2={560} />
            <line x1={520 + sg * 250} y1={630 - Math.sin(f / 4) * 4} x2={520 + sg * 306} y2={630} />
          </g>
        ))}
      </g>
      <TagPlate x={960} y={116} text="モーターの仕事" size={50} t={seg(f, 2, 16)} />
      <TagPlate x={1400} y={176} text="小さくて足りる" size={38} t={seg(f, 20, 36)} color={KRP.green} />
    </Frame>
  );
};

// ===== #93 このおもり式では、ロープを巻き取りません。 =====
// 格: 図
// どこ: クリーム地の方眼。真ん中に点線の仕切り。左右に1つずつ。
// 演出: 左 = 巻き取るドラム (ロープが巻かれて太る) に ×。右 = 綱車 (溝を通り過ぎるだけ) に ○。
// 動き: ドラムが回って巻き数が増える。綱車は回り、ロープの印が右を下り左を上る。
const Kb2bMakitoranai: React.FC<{ f: number }> = ({ f }) => {
  const DX = 520, DY = 450, DR = 150, DW = 164;   // ドラム (横向き円筒)
  const SX = 1400, SY = 470, SR = 190;            // 綱車
  const grow = easeOut(clamp01(seg(f, 4, 34)));
  const coils = 3 + Math.round(grow * 6);
  const slide = (f * 2.4) % 26;
  const feed = (f * 9) % 330;                     // ロープの印の送り
  return (
    <Frame f={f} seed={633} bg={KRP.cream}>
      <GridPaper />
      {/* 仕切り */}
      <line x1={960} y1={118} x2={960} y2={792} stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="20 16" opacity={0.55} />

      {/* ===== 左: 巻き取るドラム ===== */}
      {/* 架台 */}
      {[360, 680].map((px) => (
        <g key={px}>
          <rect x={px - 40} y={DY} width={80} height={330} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={px - 62} y={760} width={124} height={30} rx={5} fill={BP.iron} stroke={KRP.ink} strokeWidth={6} />
          <HexBolt x={px - 36} y={775} r={10} />
          <HexBolt x={px + 36} y={775} r={10} />
        </g>
      ))}
      {/* 胴 */}
      <rect x={DX - DW} y={DY - DR} width={DW * 2} height={DR * 2} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
      {/* 巻かれたロープ (下の層) */}
      <g>
        {Array.from({ length: coils }, (_, i) => {
          const px = DX - DW + 24 + i * 26 + slide * 0;
          return (
            <ellipse key={i} cx={px} cy={DY} rx={13} ry={DR - 4}
              fill={BP.hemp} stroke={KRP.ink} strokeWidth={4} />
          );
        })}
      </g>
      {/* 二層目 = 太ってきた印 */}
      <g opacity={clamp01((grow - 0.45) / 0.55)}>
        {Array.from({ length: Math.max(0, coils - 4) }, (_, i) => {
          const px = DX - DW + 48 + i * 26;
          return (
            <ellipse key={i} cx={px} cy={DY} rx={13} ry={DR + 20}
              fill={BP.hempDark} stroke={KRP.ink} strokeWidth={4} />
          );
        })}
      </g>
      {/* 鍔 (フランジ) と軸 */}
      {[-1, 1].map((sg) => (
        <g key={sg}>
          <ellipse cx={DX + sg * DW} cy={DY} rx={26} ry={DR + 26}
            fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
          <g transform={`translate(${DX + sg * DW} ${DY}) rotate(${f * 3.4})`}>
            <circle cx={0} cy={0} r={46} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 4 }, (_, i) => (
              <HexBolt key={i} x={Math.cos((i * 90 * Math.PI) / 180) * 30}
                y={Math.sin((i * 90 * Math.PI) / 180) * 30} r={9} />
            ))}
          </g>
          <rect x={DX + sg * DW + (sg > 0 ? 24 : -70)} y={DY - 15} width={46} height={30} rx={6}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* ドラムから下へ出るロープ */}
      <Rope x1={DX + 130} y1={DY + DR - 10} x2={DX + 130} y2={800} w={22} kind="hemp" f={f} />
      <XMark x={168} y={474} s={1.9} t={seg(f, 10, 24)} />

      {/* ===== 右: 綱車 ===== */}
      <rect x={1004} y={168} width={916} height={58} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={1050} y1={197} x2={1880} y2={197} n={10} r={8} fill={BP.woodDark} />
      <Rope x1={SX - SR * 0.82} y1={SY} x2={SX - SR * 0.82} y2={800} w={22} kind="hemp" f={f} />
      <Rope x1={SX + SR * 0.82} y1={SY} x2={SX + SR * 0.82} y2={800} w={22} kind="hemp" f={f} />
      <Sheave x={SX} y={SY} r={SR} rot={f * 2.8} spokes={7} groove bracket />
      {/* ロープに付けた印 = 通り過ぎているだけ */}
      <g>
        {[0, 110, 220].map((o) => {
          const d = (feed + o) % 330;
          return (
            <g key={o}>
              <rect x={SX + SR * 0.82 - 17} y={SY + 60 + d} width={34} height={14} rx={5}
                fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={SX - SR * 0.82 - 17} y={SY + 390 - d} width={34} height={14} rx={5}
                fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          );
        })}
      </g>
      <Maru x={1800} y={474} s={1.3} t={seg(f, 14, 28)} />

      <TagPlate x={240} y={250} text="巻き取る" size={46} t={seg(f, 6, 20)} />
      <TagPlate x={205} y={700} text="太っていく" size={38} t={seg(f, 24, 40)} color={KRP.red} />
      <TagPlate x={1740} y={250} text="通り過ぎる" size={40} t={seg(f, 12, 26)} />
      <TagPlate x={1740} y={700} text="太らない" size={38} t={seg(f, 28, 42)} color={KRP.green} />
    </Frame>
  );
};

// ===== #94 滑車の溝との摩擦で、送られているだけです。 =====
// 格: 図
// どこ: クリーム地の方眼。溝とロープの断面だけを画面いっぱいに寄る。
// 演出: 溝の肉のハッチング・面取り・6×7 撚りの素線。両側から挟む赤い摩擦の矢印。
// 動き: 断面がわずかに上下し、素線のハイライトが回り、送りの矢印が流れる。
const Kb2bMizoNoMasatsu: React.FC<{ f: number }> = ({ f }) => {
  const SS = 1.45, CX = 880, CY = 372;
  const bob = Math.sin(f / 9) * 5;
  const ropeY = CY + 6 * SS + bob;      // ロープ断面の中心
  const spin = f * 3.2;
  return (
    <Frame f={f} seed={634} bg={KRP.cream}>
      <GridPaper />
      {/* 断面の切断線 (紙の上の指示線) */}
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.4} strokeDasharray="26 18">
        <line x1={120} y1={CY + 60 * SS} x2={1860} y2={CY + 60 * SS} />
      </g>
      <g transform={`translate(0 ${bob})`}>
        <GrooveSection x={CX} y={CY} s={SS} f={f} showFriction t={seg(f, 10, 26)} />
      </g>
      {/* 素線が回っている印 (ロープが送られている) */}
      <g opacity={easeOut(clamp01(seg(f, 6, 22)))}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = ((spin + i * 60) * Math.PI) / 180;
          return (
            <circle key={i} cx={CX + Math.cos(a) * 58 * SS} cy={ropeY + Math.sin(a) * 58 * SS}
              r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          );
        })}
      </g>
      {/* 擦れている印 (溝の縁の小さな線) */}
      <g stroke={BP.spark} strokeWidth={6} strokeLinecap="round" opacity={0.75 + 0.2 * Math.sin(f / 5)}>
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <line x1={CX + sg * 96 * SS} y1={ropeY - 46 * SS} x2={CX + sg * 118 * SS} y2={ropeY - 58 * SS} />
            <line x1={CX + sg * 100 * SS} y1={ropeY - 8 * SS} x2={CX + sg * 122 * SS} y2={ropeY - 16 * SS} />
          </g>
        ))}
      </g>
      {/* 送られている向き (溝の真上) */}
      <ForceArrow x={CX - 20} y={ropeY - 152 * SS} len={236} rot={0} w={24}
        color={KRP.green} t={seg(f, 18, 34)} label="送られる" labelSize={36} />
      {/* 左上に滑車の全体図を置いて「どこの拡大か」を示す */}
      <g opacity={easeOut(clamp01(seg(f, 0, 14)))}>
        <Sheave x={252} y={252} r={118} rot={f * 2.4} bracket={false} />
        <circle cx={252} cy={252 - 118} r={54} fill="none"
          stroke={KRP.red} strokeWidth={7} strokeDasharray="16 12" />
        <g stroke={KRP.ink} strokeWidth={4} strokeDasharray="14 12" opacity={0.6}>
          <line x1={300} y1={116} x2={CX - 300 * SS} y2={CY - 30 * SS} />
          <line x1={212} y1={188} x2={CX - 300 * SS} y2={CY + 300 * SS} />
        </g>
        <TagPlate x={252} y={452} text="滑車" size={44} t={seg(f, 2, 14)} />
      </g>
      <TagPlate x={1660} y={214} text="溝" size={52} t={seg(f, 4, 18)} />
      <TagPlate x={1660} y={352} text="ロープの断面" size={38} t={seg(f, 12, 26)} />
      <TagPlate x={1660} y={492} text="摩擦で挟む" size={40} t={seg(f, 22, 38)} color={KRP.red} />
    </Frame>
  );
};

// ===== #95 高さの代金が、ここで一気に安くなりました。 =====
// 格: 山 (★この章で軸に触る1枚)
// どこ: 5本柱の装置の前。空と雲、地面、見上げる人2人。右に「高さの代金」の目盛り板。
// 演出: 2本目の柱「箱」が座に入って立ち上がる。同時に代金の指針が一気に下まで落ちる。
// 動き: 柱が差し込まれ街が据わる → 指針が落ちる → 赤い残像が伸びる → 人が見上げる。
const Kb2bDaikinYasuku: React.FC<{ f: number }> = ({ f }) => {
  const push = easeOut(clamp01(seg(f, 2, 24)));          // 柱が入っていく
  const drop = easeOut(clamp01(seg(f, 12, 36)));         // 代金が落ちる
  const GX = 1580, GT = 190, GB = 720;                   // 目盛り板
  const pos = lerp(GT + 46, GB - 48, drop);
  return (
    <Frame f={f} seed={635} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={700} fill={C.skyDay} opacity={0.72} />
      <rect x={0} y={0} width={W} height={260} fill={C.skyHaze} opacity={0.5} />
      {/* 雲 */}
      {[[250, 150, 1.0], [1180, 104, 0.76]].map(([cx, cy, cs], i) => (
        <g key={i} transform={`translate(${(cx as number) + Math.sin(f / 46 + i) * 10} ${cy}) scale(${cs})`}
          opacity={0.9}>
          <ellipse cx={0} cy={0} rx={116} ry={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={-72} cy={14} rx={62} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={74} cy={16} rx={70} ry={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 5本柱の装置 (箱の柱が立ち上がる) */}
      <g transform="translate(-112 14) scale(0.76)">
        <TowerOnPillars
          f={f}
          pulled={{ hako: (1 - push) * 0.94 }}
          dimmed={["mizu", "akari", "kuuki"]}
          standing={push > 0.82 ? ["hako"] : []}
          labels tiltScale={0} ground lit={1}
        />
      </g>
      {/* 箱の柱が入った印 */}
      <ForceArrow x={395} y={726} len={180} rot={-90} w={22}
        color={KPP.hako} t={seg(f, 6, 22)} label="箱" labelSize={40} />

      {/* ===== 高さの代金の目盛り板 ===== */}
      <g>
        <rect x={GX - 98} y={GT - 32} width={196} height={GB - GT + 64} rx={10}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={BP.woodDark} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={GX - 92} y1={GT - 10 + i * 140} x2={GX + 92} y2={GT - 4 + i * 140} />
          ))}
        </g>
        <HexBolt x={GX - 76} y={GT - 12} r={10} />
        <HexBolt x={GX + 76} y={GT - 12} r={10} />
        <HexBolt x={GX - 76} y={GB + 12} r={10} />
        <HexBolt x={GX + 76} y={GB + 12} r={10} />
        {/* 真鍮の目盛り */}
        <rect x={GX - 34} y={GT} width={20} height={GB - GT} rx={6}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 11 }, (_, i) => {
            const ty = GT + ((GB - GT) / 10) * i;
            const lng = i % 2 === 0;
            return (
              <g key={i}>
                <line x1={GX - 14} y1={ty} x2={GX + (lng ? 44 : 24)} y2={ty} strokeWidth={lng ? 6 : 4} />
                {lng && (
                  <text x={GX + 56} y={ty + 12} fontFamily={FONT} fontWeight={800}
                    fontSize={30} fill={KRP.ink}>{10 - i}</text>
                )}
              </g>
            );
          })}
        </g>
        {/* 落ちた跡 (赤い残像) */}
        <rect x={GX - 30} y={GT + 46} width={12} height={Math.max(0, pos - GT - 46)}
          fill={KRP.red} opacity={0.4} />
        {/* 指針 */}
        <g transform={`translate(0 ${pos})`}>
          <rect x={GX - 92} y={-13} width={120} height={26} rx={6}
            fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
          <polygon points={`${GX + 34},0 ${GX - 6},-24 ${GX - 6},24`}
            fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <text x={GX + 56} y={GT + 2} fontFamily={FONT} fontWeight={900} fontSize={34}
          fill={KRP.ink}>高</text>
        <text x={GX + 56} y={GB + 42} fontFamily={FONT} fontWeight={900} fontSize={34}
          fill={KRP.red}>安</text>
        {/* 一気に下がる矢印 */}
        <ForceArrow x={GX - 128} y={GT + 50} len={Math.max(10, pos - GT - 40)} rot={90} w={26}
          color={KRP.red} t={seg(f, 14, 30)} />
      </g>

      {/* 見上げる人 (手前) */}
      <Person x={238} y={812} s={0.74} f={f} phase={0} cloth="#4A5A74" clothDark="#36445C"
        face="surprised" gaze={[2, -7]} />
      <Person x={386} y={800} s={0.68} f={f} phase={2} cloth="#8A5A44" clothDark="#6B4433"
        face="smile" gaze={[3, -7]} />

      <TagPlate x={GX} y={92} text="代金" size={50} t={seg(f, 4, 18)} />
      <TagPlate x={GX} y={790} text="一気に安く" size={40} t={seg(f, 28, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #96 ただし、電気で動いても、全自動ではありません。 =====
// 格: 並
// どこ: かごの前 (階のホール)。漆喰の壁・腰壁・床タイル・壁の照明。
// 演出: 閉じた真鍮の扉。扉の上に階数の針。横に呼びボタン。待つ人1人。
//       壁に掛けた「自動」の札に赤い×。
// 動き: 針が揺れる (まだ誰かが運んでいる)、呼びボタンが光る、×がポンと出る。
const Kb2bZenjidouDeNai: React.FC<{ f: number }> = ({ f }) => {
  const DL = 548, DR = 1172, DT = 196, DB = 790;   // 扉の開口
  const DCX = (DL + DR) / 2;
  // 階数メーターの針。文字盤 (半径 ND_R・上側の弧) の目盛りの内側だけを動く
  const ND_R = 142;                                 // 文字盤の半径
  const ND_A0 = Math.PI + (1 / 6) * Math.PI;        // 目盛り「2」の角度
  const ND_A1 = Math.PI + (5 / 6) * Math.PI;        // 目盛り「6」の角度
  const ND_LEN = ND_R * 0.70;                       // 針の長さ (半径の0.7倍)
  const ND_PIV = -12;                               // 軸を文字盤の内側へ少し上げる
  const nd = lerp(ND_A0, ND_A1, clamp01(0.5 + 0.5 * Math.sin(f / 17)));
  const lit = 0.55 + 0.45 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={636} bg={KRP.cream}>
      {/* 壁 */}
      <rect x={0} y={0} width={W} height={790} fill={C.plaster} />
      <rect x={0} y={0} width={W} height={56} fill={BP.slabDark} opacity={0.5} />
      {/* 腰壁 */}
      <rect x={0} y={596} width={W} height={194} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={0} y={578} width={W} height={22} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={C.woodDark} strokeWidth={5} opacity={0.8}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={60 + i * 150} y1={608} x2={60 + i * 150} y2={782} />
        ))}
      </g>
      {/* 床タイル (遠近) */}
      <rect x={0} y={790} width={W} height={290} fill={C.tile} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.slabDark} strokeWidth={4} opacity={0.65}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={960 + (i - 4) * 150} y1={790} x2={960 + (i - 4) * 420} y2={1080} />
        ))}
        <line x1={0} y1={884} x2={W} y2={884} />
        <line x1={0} y1={1000} x2={W} y2={1000} />
      </g>
      {/* 壁の照明 */}
      <g transform="translate(1712 226)">
        <rect x={-10} y={-66} width={20} height={66} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -54 0 L 54 0 L 36 70 L -36 70 Z" fill={BP.lamp} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={70} rx={56} ry={16} fill={BP.lampGlow} opacity={0.5} />
      </g>

      {/* 開口の枠 (真鍮) */}
      <rect x={DL - 34} y={DT - 34} width={DR - DL + 68} height={DB - DT + 34}
        fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      <rect x={DL} y={DT} width={DR - DL} height={DB - DT} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 扉2枚 (閉じたまま) */}
      {[-1, 1].map((sg) => {
        const lx = sg === -1 ? DL + 6 : DCX + 2;
        return (
          <g key={sg}>
            <rect x={lx} y={DT + 6} width={(DR - DL) / 2 - 8} height={DB - DT - 12}
              fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
            <rect x={lx + 26} y={DT + 36} width={(DR - DL) / 2 - 60} height={252} rx={8}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
            <rect x={lx + 26} y={DT + 330} width={(DR - DL) / 2 - 60} height={280} rx={8}
              fill="none" stroke={BP.brassDark} strokeWidth={6} />
            <rect x={sg === -1 ? DCX - 26 : DCX + 14} y={470} width={12} height={74} rx={6}
              fill={BP.brassLight} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      <line x1={DCX} y1={DT + 6} x2={DCX} y2={DB - 6} stroke={KRP.ink} strokeWidth={5} />
      {/* 敷居 */}
      <rect x={DL - 34} y={DB} width={DR - DL + 68} height={24} rx={4}
        fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
      {/* 扉の上の階数の針 */}
      <g transform={`translate(${DCX} ${DT - 44})`}>
        <path d="M -142 0 A 142 142 0 0 1 142 0 Z" fill={BP.paper} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI + (i / 6) * Math.PI;
            return (
              <g key={i}>
                <line x1={Math.cos(a) * 124} y1={Math.sin(a) * 124}
                  x2={Math.cos(a) * 100} y2={Math.sin(a) * 100} />
                <text x={Math.cos(a) * 80} y={Math.sin(a) * 80 + 12} textAnchor="middle"
                  fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.ink}>{i + 1}</text>
              </g>
            );
          })}
        </g>
        <g transform={`translate(0 ${ND_PIV})`}>
          <line x1={0} y1={0} x2={Math.cos(nd) * ND_LEN} y2={Math.sin(nd) * ND_LEN}
            stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={0} r={13} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={0} r={5} fill={KRP.ink} />
        </g>
      </g>

      {/* 呼びボタン */}
      <g transform="translate(1286 436)">
        <rect x={-56} y={-92} width={112} height={184} rx={10}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
        <HexBolt x={-34} y={-70} r={9} />
        <HexBolt x={34} y={-70} r={9} />
        <HexBolt x={-34} y={70} r={9} />
        <HexBolt x={34} y={70} r={9} />
        <circle cx={0} cy={6} r={38} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={6} r={29} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={6} r={50} fill={KRP.yellow} opacity={0.22 * lit} />
        <text x={0} y={-44} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={30} fill={KRP.ink}>呼</text>
      </g>

      {/* 待つ人 */}
      <Person x={1538} y={790} s={1.04} f={f} cloth="#55607A" clothDark="#3E4760"
        face="normal" gaze={[-7, 0]} lean={-2} />

      {/* 壁に掛けた「自動」の札 + × */}
      <g>
        <line x1={272} y1={212} x2={272} y2={250} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={272} cy={208} r={9} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={272} y={312} text="自動" size={66} t={seg(f, 4, 18)} />
      <XMark x={272} y={312} s={2.0} t={seg(f, 20, 34)} />
      <TagPlate x={1286} y={612} text="呼びボタン" size={36} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #97 かごの中には、係員が立っていました。 =====
// 格: 山
// どこ: かごの中。真鍮の羽目板・天井の乳白ガラス灯・真鍮の手すり・寄木の床。
// 演出: 左に運転台と制服の係員 (丸帽・金ボタン・白手袋)、右に乗客3人。
//       奥の壁の上に階数を指す半円の針。
// 動き: 針が上がっていく。天井灯がゆらぐ。係員がレバーに手を添え、乗客がゆれる。
const Kb2bKakariin: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(clamp01(seg(f, 4, 38)));
  const needle = Math.PI + (0.18 + rise * 0.62) * Math.PI;
  const kx = 470, ky = 818, ks = 1.08;              // 係員 (足元)
  const kb = bobOf(f, 0);
  // カメラ: 左の係員にゆっくり寄る (寄り切ったところで かごの内装が画面いっぱいになる)
  const ZCX = 530, ZCY = 400;
  const z = lerp(1, 1.40, easeOut(seg(f, 6, 38)));
  return (
    <Frame f={f} seed={637} bg={KRP.cream}>
      <g transform={zoomAt(z, ZCX, ZCY)}>
      {/* 天井 */}
      <polygon points="40,86 1880,86 1700,160 220,160" fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 左右の側壁 (遠近) */}
      <polygon points="40,86 220,160 220,726 40,900" fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      <polygon points="1880,86 1700,160 1700,726 1880,900" fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 奥の壁 */}
      <rect x={220} y={160} width={1480} height={566} fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
      {/* 羽目板 (浮き彫りの枠) */}
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={278 + i * 362} y={230} width={300} height={430} rx={10}
              fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
            <rect x={302 + i * 362} y={256} width={252} height={378} rx={8}
              fill={BP.brass} stroke={BP.brassDark} strokeWidth={5} />
          </g>
        ))}
      </g>
      {/* 真鍮の腰帯と手すり */}
      <rect x={220} y={598} width={1480} height={20} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={268} y={566} width={1384} height={22} rx={11} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={6} />
      {[330, 960, 1590].map((bx) => (
        <rect key={bx} x={bx - 12} y={578} width={24} height={34} rx={6}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 寄木の床 */}
      <polygon points="220,726 1700,726 1880,900 40,900" fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.75}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={300 + i * 130} y1={726} x2={250 + i * 152} y2={900} />
        ))}
        <line x1={190} y1={802} x2={1740} y2={802} />
      </g>
      {/* 天井の乳白ガラス灯 */}
      <g>
        <ellipse cx={960} cy={126} rx={176} ry={52} fill={BP.lamp} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={960} cy={120} rx={176} ry={56} fill={BP.lampGlow}
          opacity={0.42 + 0.12 * Math.sin(f / 9)} />
        <ellipse cx={-70 + 960} cy={112} rx={44} ry={16} fill={KRP.white} opacity={0.5} />
        <Rivets x1={820} y1={150} x2={1100} y2={150} n={6} r={7} fill={BP.brassDark} />
      </g>
      {/* 階数を指す半円の針 */}
      <g transform="translate(960 388)">
        <path d="M -186 0 A 186 186 0 0 1 186 0 Z" fill={BP.paper} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -206 0 A 206 206 0 0 1 206 0 L 186 0 A 186 186 0 0 0 -186 0 Z"
          fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = Math.PI + (i / 7) * Math.PI;
            return (
              <g key={i}>
                <line x1={Math.cos(a) * 166} y1={Math.sin(a) * 166}
                  x2={Math.cos(a) * 138} y2={Math.sin(a) * 138} strokeWidth={6} />
                <text x={Math.cos(a) * 112} y={Math.sin(a) * 112 + 13} textAnchor="middle"
                  fontFamily={FONT} fontWeight={800} fontSize={32} fill={KRP.ink}>{i + 1}</text>
              </g>
            );
          })}
        </g>
        <line x1={0} y1={0} x2={Math.cos(needle) * 148} y2={Math.sin(needle) * 148}
          stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
        <circle cx={0} cy={0} r={15} fill={KRP.ink} />
        <HexBolt x={-196} y={-14} r={10} fill={BP.brassDark} />
        <HexBolt x={196} y={-14} r={10} fill={BP.brassDark} />
      </g>

      {/* 運転台 + レバー */}
      <g>
        <rect x={168} y={660} width={224} height={166} rx={10}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={190} y={682} width={180} height={34} rx={6}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={196} y={806} r={10} />
        <HexBolt x={364} y={806} r={10} />
      </g>
      <Lever x={280} y={668} s={0.64} angle={-14 + Math.sin(f / 15) * 7} f={f} />

      {/* 乗客3人 */}
      <Person x={860} y={812} s={1.0} f={f} phase={1} cloth="#4A5A74" clothDark="#36445C"
        face="normal" gaze={[3, -2]} />
      <Person x={1150} y={826} s={1.04} f={f} phase={3} cloth="#7A4F4A" clothDark="#5C3A36"
        face="smile" gaze={[-4, 0]} glasses />
      <Person x={1440} y={806} s={0.96} f={f} phase={5} cloth="#5C6B52" clothDark="#45523D"
        face="normal" gaze={[-6, -3]} />

      {/* 係員 (制服) */}
      <Person x={kx} y={ky} s={ks} f={f} phase={0} cloth="#2F3A56" clothDark="#222B41"
        hair="none" face="smile" gaze={[5, 0]} />
      <g transform={`translate(${kx} ${ky + kb}) scale(${ks})`}>
        {/* 丸帽 (紺の冠 + 黒い庇 + 真鍮のバッジ) */}
        <path d="M -62 -268 Q -62 -312 0 -314 Q 62 -312 62 -268 Z"
          fill="#2F3A56" stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-66} y={-272} width={132} height={16} rx={8}
          fill="#222B41" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -70 -258 Q 0 -238 70 -258 L 70 -266 L -70 -266 Z"
          fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={-288} r={13} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 襟の金ライン */}
        <path d="M -40 -160 L 0 -134 L 40 -160" fill="none" stroke={BP.brass} strokeWidth={7} />
        {/* 金ボタン (2列) */}
        {[-16, 16].map((bx) => (
          <g key={bx}>
            {[-128, -104, -80, -58].map((by) => (
              <circle key={by} cx={bx} cy={by} r={7.5} fill={BP.brass} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 白手袋 (両手) */}
        <ellipse cx={-67} cy={-62} rx={19} ry={23} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={67} cy={-62} rx={19} ry={23} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 袖の白線 */}
        <rect x={-80} y={-92} width={26} height={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={54} y={-92} width={26} height={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      </g>
      </g>

      {/* 札はズームの外 (寄っても大きさと位置が変わらない) */}
      <Arrow x={212} y={648} s={0.8} rot={180} t={seg(f, 18, 32)} />
      <TagPlate x={132} y={648} text="係員" size={48} t={seg(f, 12, 26)} />
      <TagPlate x={1636} y={300} text="階数の針" size={38} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #98 レバーで動かし、レバーで止める。 =====
// 格: 並
// どこ: 運転台の寄り。背景はかごの真鍮の羽目板と腰帯と床だけ。
// 演出: 真鍮の台座・扇形の目盛り板とノッチ・レバー1本。握る手に寄る (人は置かない)。
// 動き: レバーが前に倒れ、後ろに戻る。手が一緒に振れ、ノッチが光る。
const Kb2bLever: React.FC<{ f: number }> = ({ f }) => {
  const LX = 760, LY = 800, LS = 2.2;
  const t = easeOut(clamp01(seg(f, 2, 16)));
  const ang = 27 * Math.sin((f - 6) / 9) * t;
  const rad = (ang * Math.PI) / 180;
  const knobR = 252 * LS;
  const hx = LX + Math.sin(rad) * knobR;
  const hy = LY - Math.cos(rad) * knobR;
  return (
    <Frame f={f} seed={638} bg={KRP.cream}>
      {/* かごの壁 (背景) */}
      <rect x={0} y={0} width={W} height={700} fill={BP.brass} />
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={70 + i * 382} y={92} width={310} height={420} rx={10}
            fill={BP.brassLight} stroke={BP.brassDark} strokeWidth={6} opacity={0.75} />
        ))}
      </g>
      <rect x={0} y={556} width={W} height={24} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 床 */}
      <rect x={0} y={700} width={W} height={380} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.75}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={i * 260} y1={700} x2={i * 300 - 120} y2={1080} />
        ))}
      </g>

      {/* 扇形の目盛り板 (ノッチ付き) */}
      <g>
        <path d={`M ${LX - 340} ${LY - 300} A 340 340 0 0 1 ${LX + 340} ${LY - 300} L ${LX + 250} ${LY - 240} A 250 250 0 0 0 ${LX - 250} ${LY - 240} Z`}
          transform={`translate(0 ${-26})`}
          fill={BP.paper} stroke={KRP.ink} strokeWidth={7} />
        <g>
          {[-27, -14, 0, 14, 27].map((a, i) => {
            const r = (a * Math.PI) / 180;
            const on = Math.abs(ang - a) < 7;
            return (
              <g key={a}>
                <rect x={LX + Math.sin(r) * 296 - 13} y={LY - Math.cos(r) * 296 - 40}
                  width={26} height={52} rx={7}
                  transform={`rotate(${a} ${LX + Math.sin(r) * 296} ${LY - Math.cos(r) * 296 - 14})`}
                  fill={on ? KRP.yellow : BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
                <text x={LX + Math.sin(r) * 372} y={LY - Math.cos(r) * 372 - 4}
                  textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
                  fill={KRP.ink}>{["下", "", "停", "", "上"][i]}</text>
              </g>
            );
          })}
        </g>
      </g>
      {/* いまの位置の目安 (倒す/戻すの軌跡) */}
      <g stroke={KRP.red} strokeWidth={6} strokeDasharray="20 16" opacity={0.6}>
        <line x1={LX} y1={LY} x2={LX + Math.sin((27 * Math.PI) / 180) * knobR} y2={LY - Math.cos((27 * Math.PI) / 180) * knobR} />
        <line x1={LX} y1={LY} x2={LX - Math.sin((27 * Math.PI) / 180) * knobR} y2={LY - Math.cos((27 * Math.PI) / 180) * knobR} />
      </g>
      {/* レバー本体 */}
      <Lever x={LX} y={LY} s={LS} angle={ang} f={f} />

      {/* 握る手 (人は置かない。手だけ) */}
      <g transform={`translate(${hx} ${hy}) rotate(${ang})`}>
        {/* 袖 (右下から伸びる) */}
        <path d="M 30 48 L 214 304 L 282 256 L 86 -8 Z" fill="#2F3A56" stroke={KRP.ink} strokeWidth={7} />
        <rect x={186} y={272} width={74} height={20} rx={8}
          transform="rotate(54 186 272)" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 掌 */}
        <ellipse cx={14} cy={10} rx={78} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {/* 親指 */}
        <path d="M -52 -10 Q -84 -46 -40 -62 Q -4 -70 2 -38" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 指4本 (握りに巻きつく) */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i}
            d={`M ${-46 + i * 30} 44 q ${-30} ${26} ${4} ${44} q ${26} ${12} ${40} ${-14}`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 握りの皺 */}
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
          <line x1={-18} y1={-14} x2={36} y2={-24} />
          <line x1={-14} y1={6} x2={44} y2={-2} />
        </g>
      </g>

      <TagPlate x={1470} y={300} text="レバー" size={56} t={seg(f, 6, 20)} />
      <TagPlate x={1470} y={438} text="倒せば進む" size={40} t={seg(f, 16, 30)} />
      <TagPlate x={1470} y={568} text="戻せば止まる" size={40} t={seg(f, 26, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #99 床をぴたりと合わせるのが、腕の見せどころでした。 =====
// 格: 並
// どこ: 足元の寄り。左が階の床 (タイル)、右がかごの床 (寄木)、間が縦穴の闇。
// 演出: 真鍮の敷居2本。靴1足が敷居をまたぐ。段差が縮んでゼロになる。
// 動き: かご側の床が上がって面がそろう。段差の寸法線が縮み、合った瞬間に光る。
const Kb2bYukaPitari: React.FC<{ f: number }> = ({ f }) => {
  const FY = 600;                                  // 階の床の高さ
  const close = easeOut(clamp01(seg(f, 4, 30)));
  const step = 52 * (1 - close);                   // 段差
  const flush = clamp01(seg(f, 28, 34));
  const CY = FY + step;                            // かごの床
  return (
    <Frame f={f} seed={639} bg={KRP.cream}>
      {/* 上: 壁 (左=漆喰 / 右=かごの真鍮) と扉の下端 */}
      <rect x={0} y={0} width={880} height={FY} fill={C.plaster} />
      <rect x={1040} y={0} width={880} height={FY} fill={BP.brass} />
      <rect x={880} y={0} width={160} height={FY} fill={BP.shaftDeep} />
      <rect x={0} y={0} width={880} height={96} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1040} y={0} width={880} height={96} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.5}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={1100 + i * 190} y1={110} x2={1100 + i * 190} y2={FY} />
        ))}
      </g>
      <g stroke={BP.slabDark} strokeWidth={4} opacity={0.5}>
        {Array.from({ length: 4 }, (_, i) => (
          <line key={i} x1={0} y1={180 + i * 108} x2={880} y2={180 + i * 108} />
        ))}
      </g>

      {/* 階の床 */}
      <rect x={0} y={FY} width={900} height={300} fill={C.tile} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.slabDark} strokeWidth={5} opacity={0.7}>
        <line x1={0} y1={FY + 86} x2={900} y2={FY + 86} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={120 + i * 170} y1={FY} x2={120 + i * 170} y2={900} />
        ))}
      </g>
      <rect x={852} y={FY - 10} width={48} height={34} rx={5}
        fill={BP.brassLight} stroke={KRP.ink} strokeWidth={6} />
      {/* 縦穴の闇 */}
      <rect x={896} y={FY - 10} width={128} height={480} fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.4}>
        <line x1={930} y1={FY + 20} x2={930} y2={1000} />
        <line x1={990} y1={FY + 20} x2={990} y2={1000} />
      </g>
      {/* かごの床 (上がってくる) */}
      <g transform={`translate(0 ${step})`}>
        <rect x={1020} y={FY} width={900} height={300} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={BP.woodDark} strokeWidth={5} opacity={0.75}>
          <line x1={1020} y1={FY + 86} x2={1920} y2={FY + 86} />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={1120 + i * 170} y1={FY} x2={1120 + i * 170} y2={900} />
          ))}
        </g>
        <rect x={1020} y={FY - 10} width={48} height={34} rx={5}
          fill={BP.brassLight} stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* 靴1足 (敷居をまたぐ) */}
      {/* 左足 = 階の床の上 */}
      <g transform={`translate(640 ${FY}) scale(1.7)`}>
        <rect x={-46} y={-186} width={96} height={152} rx={16} fill="#3F4A62" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-48} y={-54} width={100} height={26} rx={8} fill="#303A4E" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -62 -34 Q -66 -4 -30 -2 L 128 -2 Q 150 -6 140 -30 Q 120 -42 56 -38 Z"
          fill={C.leather} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-66} y={-10} width={216} height={14} rx={6} fill={KRP.ink} />
        <g stroke={KRP.ink} strokeWidth={4}>
          <line x1={28} y1={-34} x2={44} y2={-20} />
          <line x1={48} y1={-34} x2={64} y2={-20} />
        </g>
      </g>
      {/* 右足 = かごの床の上 (床と一緒に上がる) */}
      <g transform={`translate(1310 ${CY}) scale(1.7)`}>
        <rect x={-50} y={-186} width={96} height={152} rx={16} fill="#3F4A62" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-52} y={-54} width={100} height={26} rx={8} fill="#303A4E" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -130 -32 Q -152 -6 -124 -2 L 54 -2 Q 76 -6 66 -30 Q 32 -42 -74 -38 Z"
          fill={C.leather} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-136} y={-10} width={212} height={14} rx={6} fill={KRP.ink} />
        <g stroke={KRP.ink} strokeWidth={4}>
          <line x1={-54} y1={-34} x2={-38} y2={-20} />
          <line x1={-34} y1={-34} x2={-18} y2={-20} />
        </g>
      </g>

      {/* 水平の基準線と段差の寸法 */}
      <line x1={0} y1={FY} x2={1920} y2={FY} stroke={KRP.red} strokeWidth={5}
        strokeDasharray="24 18" opacity={0.75} />
      {step > 2 && (
        <g>
          <line x1={1700} y1={FY} x2={1700} y2={CY} stroke={KRP.red} strokeWidth={7} />
          <polygon points={`1700,${FY} 1686,${FY + 22} 1714,${FY + 22}`} fill={KRP.red} />
          <polygon points={`1700,${CY} 1686,${CY - 22} 1714,${CY - 22}`} fill={KRP.red} />
          <text x={1744} y={FY + step / 2 + 14} fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={KRP.red}>段差</text>
        </g>
      )}
      {/* 合った瞬間の光 */}
      {flush > 0 && (
        <g opacity={flush}>
          <Sparks x={1046} y={FY} f={f} n={8} s={0.8} t={flush} />
          <line x1={1020} y1={FY} x2={1920} y2={FY} stroke={KRP.yellow} strokeWidth={9} opacity={0.8} />
        </g>
      )}

      <TagPlate x={330} y={766} text="階の床" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={1520} y={766} text="かごの床" size={44} t={seg(f, 10, 24)} />
      <TagPlate x={1560} y={200} text="段差ゼロ" size={52} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #100 やがて、ボタンで行き先を選ぶだけになります。 =====
// 格: 並
// どこ: かごの中の壁の寄り。背景は真鍮の羽目板・腰帯・床・行き先表示だけ。
// 演出: ボタン盤を大きく。右から伸びる手の人差し指が7のボタンを押す。押されたボタンが光る。
// 動き: 指が押し込まれ、光の輪が広がり、上の行き先表示に数字が出る。
const Kb2bButtonErabu: React.FC<{ f: number }> = ({ f }) => {
  const PX = 700, PY = 420, PS = 1.4;
  const LIT = 3;                                   // 光るボタン (番号は7)
  const bx = PX + 48 * PS, by = PY - 96 * PS;      // 押されたボタンの位置
  const press = easeOut(clamp01(seg(f, 8, 20)));
  const ring = clamp01(seg(f, 16, 40));
  const dx = 26 * (1 - press);                     // 指の押し込み (腕の向きに引く)
  // 手: 人差し指を伸ばしたこぶし。指先がちょうど7のボタンに触れる位置に置く。
  //     HX,HY = 人差し指の付け根。HROT = 腕の傾き (指は左上=ボタンの方へ伸びる)。
  const HX = 967, HY = 409, HROT = 34.8;
  const HC = Math.cos((HROT * Math.PI) / 180), HS = Math.sin((HROT * Math.PI) / 180);
  return (
    <Frame f={f} seed={640} bg={KRP.cream}>
      {/* かごの壁 */}
      <rect x={0} y={0} width={W} height={812} fill={BP.brass} />
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={1060 + ((i % 3) * 300)} y={120 + Math.floor(i / 3) * 400}
            width={250} height={340} rx={10}
            fill={BP.brassLight} stroke={BP.brassDark} strokeWidth={6} opacity={0.6} />
        ))}
      </g>
      <rect x={0} y={660} width={W} height={22} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={0} y={812} width={W} height={268} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      {/* 上の行き先表示 */}
      <g transform="translate(700 96)">
        <rect x={-186} y={-62} width={372} height={124} rx={12}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-164} y={-42} width={328} height={84} rx={8}
          fill={BP.board} stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={72} fill={KRP.yellow} opacity={0.35 + 0.6 * ring}>7</text>
        <HexBolt x={-162} y={-40} r={10} fill={BP.brassDark} />
        <HexBolt x={162} y={-40} r={10} fill={BP.brassDark} />
      </g>

      {/* ボタン盤 */}
      <ButtonPanel x={PX} y={PY} s={PS} rows={5} cols={2} lit={LIT} f={f} />
      {/* 押された輪 */}
      {ring > 0 && (
        <g opacity={(1 - ((f % 24) / 24)) * 0.8 * ring}>
          <circle cx={bx} cy={by} r={56 + (f % 24) * 3.4} fill="none"
            stroke={KRP.yellow} strokeWidth={8} />
        </g>
      )}

      {/* 右下から伸びる手 (人差し指でボタンを押す) */}
      <g transform={`translate(${dx * HC} ${dx * HS})`}>
        <g transform={`translate(${HX} ${HY}) rotate(${HROT})`}>
          {/* 手の輪郭。人差し指・こぶし・親指をひと続きの線で描く (部品を浮かせない) */}
          <path
            d={"M -178 -27 L 30 -35 Q 76 -54 120 -47 L 214 -40 L 220 132"
              + " Q 182 170 128 172 Q 70 174 24 158 Q -2 148 -22 134"
              + " Q -44 126 -62 104 A 26 26 0 1 1 -62 56"
              + " Q -48 44 -36 40 Q -24 36 -40 26"
              + " L -178 27 A 27 27 0 0 1 -178 -27 Z"}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          {/* 親指の付け根・指の関節・握った指先 (線だけなのでバラけない) */}
          <g fill="none" stroke={KRP.ink} strokeLinecap="round">
            <path d="M -24 48 Q 10 86 -20 132" strokeWidth={5.5} />
            <path d="M -36 -31 Q -24 -2 -36 26" strokeWidth={4.5} opacity={0.75} />
            <path d="M -148 -23 Q -164 0 -148 23" strokeWidth={4} opacity={0.55} />
            <path d="M 28 -33 Q 18 -2 26 28" strokeWidth={4.5} opacity={0.75} />
            <path d="M 36 160 Q 62 136 56 106" strokeWidth={4.5} opacity={0.6} />
            <path d="M 90 170 Q 116 146 110 116" strokeWidth={4.5} opacity={0.6} />
            <path d="M 48 -40 q 22 -12 44 -4 q 22 8 44 -1" strokeWidth={4} opacity={0.45} />
            <path d="M 76 18 L 170 26" strokeWidth={4} opacity={0.38} />
            <path d="M 70 56 L 164 64" strokeWidth={4} opacity={0.38} />
          </g>
          {/* 袖 (手首から右下へ。手の付け根を覆う) */}
          <path d="M 200 -56 L 1500 -56 L 1500 152 L 200 152 Z"
            fill="#4A5A74" stroke={KRP.ink} strokeWidth={7} />
          {/* 袖口 (手と袖のすきまを埋める) */}
          <rect x={184} y={-70} width={52} height={236} rx={12}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 指先がボタンに触れた合図 */}
      <g opacity={0.9 * clamp01(seg(f, 12, 22))}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = ((-168 + i * 34) * Math.PI) / 180;
          const d = 60 + 28 * (((f * 0.8 + i * 4) % 20) / 20);
          return (
            <circle key={i} cx={bx + Math.cos(a) * d} cy={by + Math.sin(a) * d}
              r={8 - i * 0.8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          );
        })}
      </g>

      <TagPlate x={1560} y={242} text="ボタン" size={56} t={seg(f, 4, 18)} />
      <TagPlate x={1560} y={380} text="行き先を選ぶ" size={40} t={seg(f, 20, 34)} />
      <TagPlate x={330} y={776} text="押すだけ" size={44} t={seg(f, 28, 42)} color={KRP.green} />
    </Frame>
  );
};

// ===== #101 押せば、自動でその階に止まる。 =====
// 格: 図
// どこ: クリーム地の方眼。左に押しボタン盤、右に縦穴の断面図だけ。人も背景も置かない。
// 演出: 押した3のボタンから赤い線が引かれ、縦穴の3階のスラブでかごが止まる。
// 動き: かごが下から3階まで上がって止まる。綱車が回る。赤い線が引かれて止の印が出る。
const Kb2bOsebaTomaru: React.FC<{ f: number }> = ({ f }) => {
  const SX = 820, SY = 350, SW = 760, SH = 460;
  const topInner = SY + 36, botInner = SY + SH - 28;
  const cW = 240, cH = 150;
  const carCx = SX + SW * 0.34;
  const stopT = 0.805;                                  // 3Fのスラブに床が合う位置
  const go = easeOut(clamp01(seg(f, 6, 32)));
  const carT = lerp(0.06, stopT, go);
  const stopY = lerp(botInner, topInner + cH, stopT);
  const BPX = 290, BPY = 480;                           // ボタン盤
  const line = clamp01(seg(f, 18, 38));
  return (
    <Frame f={f} seed={641} bg={KRP.cream}>
      <GridPaper />
      {/* 縦穴 (ぜんぶ) */}
      <Shaft x={SX} y={SY} w={SW} h={SH} f={f} carT={carT} floors={5}
        carW={cW} carH={cH}
        showCw showRail showMachine floorLabels dim={1} door={go > 0.95 ? 0.8 : 0} />
      {/* 押しボタン盤 (1列) */}
      <ButtonPanel x={BPX} y={BPY} s={1.15} rows={5} cols={1} lit={2} f={f} />
      {/* 押した階 → 止まる階 の線 */}
      <g opacity={line}>
        <path d={`M ${BPX + 88} ${BPY} L 640 ${BPY} L 640 ${stopY} L ${carCx - 176} ${stopY}`}
          fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round"
          strokeDasharray="26 18" strokeDashoffset={-f * 1.6} />
        <polygon points={`${carCx - 150},${stopY} ${carCx - 196},${stopY - 22} ${carCx - 196},${stopY + 22}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 止まった印 (床の高さに赤い線) */}
      <g opacity={clamp01(seg(f, 30, 40))}>
        <line x1={SX - 30} y1={stopY} x2={SX + SW + 30} y2={stopY}
          stroke={KRP.red} strokeWidth={6} strokeDasharray="20 14" opacity={0.8} />
        <text x={SX + SW + 44} y={stopY + 14} fontFamily={FONT} fontWeight={900}
          fontSize={42} fill={KRP.red}>止</text>
      </g>
      <TagPlate x={560} y={250} text="押した階" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={580} y={700} text="自動で止まる" size={42} t={seg(f, 24, 40)} color={KRP.red} />
      <TagPlate x={1700} y={470} text="縦穴" size={48} t={seg(f, 2, 16)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb2_ido_no_tsurube: (f) => <Kb2bIdoNoTsurube f={f} />,
  kb2_tsuriawaseru: (f) => <Kb2bTsuriawaseru f={f} />,
  kb2_motor_sukunaku: (f) => <Kb2bMotorSukunaku f={f} />,
  kb2_makitoranai: (f) => <Kb2bMakitoranai f={f} />,
  kb2_mizo_no_masatsu: (f) => <Kb2bMizoNoMasatsu f={f} />,
  kb2_daikin_yasuku: (f) => <Kb2bDaikinYasuku f={f} />,
  kb2_zenjidou_de_nai: (f) => <Kb2bZenjidouDeNai f={f} />,
  kb2_kakariin: (f) => <Kb2bKakariin f={f} />,
  kb2_lever: (f) => <Kb2bLever f={f} />,
  kb2_yuka_pitari: (f) => <Kb2bYukaPitari f={f} />,
  kb2_button_erabu: (f) => <Kb2bButtonErabu f={f} />,
  kb2_oseba_tomaru: (f) => <Kb2bOsebaTomaru f={f} />,
};

export const K_B2B_MOTIFS: string[] = [
  "kb2_ido_no_tsurube",   // #90 井戸のつるべと、同じ仕組みです。
  "kb2_tsuriawaseru",     // #91 おもりが、かごの重さを釣り合わせてくれます。
  "kb2_motor_sukunaku",   // #92 だからモーターは、全部を引き受けずに済みます。
  "kb2_makitoranai",      // #93 このおもり式では、ロープを巻き取りません。
  "kb2_mizo_no_masatsu",  // #94 滑車の溝との摩擦で、送られているだけです。
  "kb2_daikin_yasuku",    // #95 高さの代金が、ここで一気に安くなりました。
  "kb2_zenjidou_de_nai",  // #96 ただし、電気で動いても、全自動ではありません。
  "kb2_kakariin",         // #97 かごの中には、係員が立っていました。
  "kb2_lever",            // #98 レバーで動かし、レバーで止める。
  "kb2_yuka_pitari",      // #99 床をぴたりと合わせるのが、腕の見せどころでした。
  "kb2_button_erabu",     // #100 やがて、ボタンで行き先を選ぶだけになります。
  "kb2_oseba_tomaru",     // #101 押せば、自動でその階に止まる。
];

export const kosoB2bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
