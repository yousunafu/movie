// 「なぜ高層ビルは生まれたのか」: 第2章「人を、上げる。」終盤
// 担当範囲: 台本 docs/koso-script-v7.txt の 103〜113行目 (文#102〜#112・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb2_ で始める。WobbleDefs の seed はこのファイルでは 642〜652 を使う。
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
  skin: "#E8C39E",      // 手の肌 (#104 の寄り)
  skinDark: "#C89C72",
  cityFar: "#9FB0BE",   // 窓の外の遠い街
  asphalt: "#9A978E",
} as const;

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #102 ここで、箱から人が消えました。 =====
// 格: 山
// どこ: 自動運転になったかごの内側。一点透視で箱の中に立っている。扉は開いたまま。
// 演出: 静かな事件。係員が立っていた席だけが空き、畳んだ制服と丸帽が隅に残っている。
//       真鍮の内装・木の羽目板はそのまま。床に開口からの光だけが落ちている。
// 動き: 扉がさらに引き分かれ、床の光が広がる。開口を埃が舞い上がる。
//       止まった階数針が微かに震え、天井の埋込灯がゆらぐ。空席に×が出る。
const Kb2cHitoGaKieta: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(clamp01(seg(f, 0, 26)));
  const OL = 640, OR = 1280, OT = 230, FY = 742; // 開口と奥の床線
  const dW = (OR - OL) / 2;                       // 片扉の幅
  const ldx = 960 - dW - open * dW;               // 左扉の左端
  const rdx = 960 + open * dW;                    // 右扉の左端
  const beam = 0.5 + 0.5 * open;                  // 床の光の広がり
  const needle = Math.sin(f / 23) * 2.5;
  const lampP = 0.34 + 0.12 * Math.sin(f / 9);
  return (
    <Frame f={f} seed={642} bg={KRP.cream}>
      {/* ===== 箱の内側 (一点透視の箱) ===== */}
      {/* 天井 (真鍮の格間) */}
      <polygon points="0,0 1920,0 1620,110 300,110" fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.brass} strokeWidth={4} opacity={0.65}>
        {[0.16, 0.34, 0.5, 0.66, 0.84].map((u, i) => (
          <line key={i} x1={1920 * u} y1={0} x2={300 + 1320 * u} y2={110} />
        ))}
      </g>
      {/* 天井の埋込灯 2つ */}
      {[660, 1260].map((lx) => (
        <g key={lx}>
          <ellipse cx={lx} cy={62} rx={118} ry={26} fill={BP.lamp} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={lx} cy={62} rx={150} ry={40} fill={BP.lampGlow} opacity={lampP} />
        </g>
      ))}
      {/* 左右の壁 (木の羽目板 + 真鍮の手すり) */}
      <polygon points="0,0 300,110 300,742 0,1080" fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <polygon points="1920,0 1620,110 1620,742 1920,1080" fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.8}>
        {[0.33, 0.66].map((u, i) => (
          <g key={i}>
            <line x1={300 * u} y1={110 * u} x2={300 * u} y2={1080 - 338 * u} />
            <line x1={1920 - 300 * u} y1={110 * u} x2={1920 - 300 * u} y2={1080 - 338 * u} />
          </g>
        ))}
      </g>
      <g stroke={KRP.ink} strokeWidth={5}>
        <line x1={0} y1={596} x2={300} y2={522} stroke={BP.brass} strokeWidth={18} />
        <line x1={1920} y1={596} x2={1620} y2={522} stroke={BP.brass} strokeWidth={18} />
        <line x1={0} y1={596} x2={300} y2={522} strokeWidth={4} opacity={0.5} />
        <line x1={1920} y1={596} x2={1620} y2={522} strokeWidth={4} opacity={0.5} />
      </g>
      {/* 奥の壁 (扉のある面) */}
      <rect x={300} y={110} width={1320} height={632} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <rect x={300} y={148} width={1320} height={560} fill={BP.woodLight} stroke={BP.woodDark} strokeWidth={4} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.75}>
        {[360, 430, 500, 570, 1340, 1410, 1480, 1550].map((px) => (
          <line key={px} x1={px} y1={150} x2={px} y2={706} />
        ))}
      </g>
      {/* 真鍮の蛇腹 (上) と腰帯 */}
      <rect x={300} y={110} width={1320} height={38} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <Rivets x1={330} y1={129} x2={1590} y2={129} n={22} r={7} fill={BP.brassDark} />
      <rect x={300} y={512} width={340} height={20} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      <rect x={1280} y={512} width={340} height={20} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      {/* ===== 開口の向こう (明るい乗り場。誰もいない) ===== */}
      <rect x={OL} y={OT} width={OR - OL} height={FY - OT} fill={BP.lampGlow} stroke={KRP.ink} strokeWidth={5} />
      <rect x={OL} y={OT} width={OR - OL} height={40} fill={BP.shaftDark} opacity={0.45} />
      <line x1={OL} y1={690} x2={OR} y2={690} stroke={BP.slabDark} strokeWidth={10} />
      <rect x={OL} y={690} width={OR - OL} height={52} fill={BP.slab} opacity={0.6} />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.35}>
        <line x1={678} y1={OT + 40} x2={678} y2={690} />
        <line x1={1242} y1={OT + 40} x2={1242} y2={690} />
      </g>
      {/* 乗り場の奥の窓 (外の街が見える) */}
      <g>
        <rect x={722} y={326} width={476} height={268} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <g fill={C.cityFar} stroke={KRP.ink} strokeWidth={4} opacity={0.85}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const bw = 52 + rnd(i * 7 + 2) * 34;
            const bh = 70 + rnd(i * 13 + 5) * 92;
            const bx = 736 + i * 78;
            return <rect key={i} x={bx} y={594 - bh} width={bw} height={bh} />;
          })}
        </g>
        <g stroke={KRP.ink} strokeWidth={5} opacity={0.8}>
          <line x1={880} y1={326} x2={880} y2={594} />
          <line x1={1040} y1={326} x2={1040} y2={594} />
          <line x1={722} y1={460} x2={1198} y2={460} />
        </g>
        <rect x={708} y={594} width={504} height={18} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 乗り場の壁付け灯 */}
      {[690, 1232].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 9} y={300} width={18} height={54} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${lx - 34} 300 L ${lx + 34} 300 L ${lx + 22} 258 L ${lx - 22} 258 Z`}
            fill={BP.lamp} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 扉枠の影が乗り場の床に伸びる */}
      <g fill={BP.shaftDark} opacity={0.22}>
        <polygon points={`${OL},690 ${OL + 70},690 ${OL + 150},742 ${OL},742`} />
        <polygon points={`${OR - 70},690 ${OR},690 ${OR},742 ${OR - 150},742`} />
      </g>
      {/* 開口の真鍮枠 */}
      <g fill={BP.brass} stroke={KRP.ink} strokeWidth={5.5}>
        <rect x={OL - 22} y={OT - 22} width={OR - OL + 44} height={24} />
        <rect x={OL - 22} y={OT} width={22} height={FY - OT} />
        <rect x={OR} y={OT} width={22} height={FY - OT} />
      </g>
      {/* ===== 床 ===== */}
      <polygon points={`300,${FY} 1620,${FY} 1920,1080 0,1080`} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4}>
        {[0.12, 0.28, 0.44, 0.56, 0.72, 0.88].map((u, i) => (
          <line key={i} x1={300 + 1320 * u} y1={FY} x2={1920 * u} y2={1080} />
        ))}
      </g>
      {/* 開口から落ちる光 */}
      <polygon
        points={`${OL + 26},${FY} ${OR - 26},${FY} ${OR - 26 + beam * 300},1080 ${OL + 26 - beam * 300},1080`}
        fill={BP.lampGlow} opacity={0.55} />
      <g stroke={KRP.white} strokeWidth={6} opacity={0.5}>
        <line x1={OL + 26} y1={FY} x2={OL + 26 - beam * 300} y2={1080} />
        <line x1={OR - 26} y1={FY} x2={OR - 26 + beam * 300} y2={1080} />
      </g>
      {/* 光の中を舞う埃 */}
      <g fill={KRP.white}>
        {Array.from({ length: 12 }, (_, i) => {
          const ph = (f * 2.1 + i * 53) % 430;
          const py = FY + 20 - ph;
          const px = OL + 60 + rnd(i + 2) * (OR - OL - 120) + Math.sin((f + i * 11) / 17) * 16;
          return <circle key={i} cx={px} cy={py} r={3 + rnd(i + 7) * 4} opacity={0.3 + 0.45 * (1 - ph / 430)} />;
        })}
      </g>
      {/* ===== 階数の針 (開口の上。止まっている) ===== */}
      <g>
        <path d="M 888 220 A 72 72 0 0 1 1032 220 Z" fill={BP.paper} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI + (i / 6) * Math.PI;
            return (
              <line key={i} x1={960 + Math.cos(a) * 60} y1={220 + Math.sin(a) * 60}
                x2={960 + Math.cos(a) * 46} y2={220 + Math.sin(a) * 46} />
            );
          })}
        </g>
        <line x1={960} y1={220}
          x2={960 + Math.cos(Math.PI + (0.62 + needle / 200) * Math.PI) * 54}
          y2={220 + Math.sin(Math.PI + (0.62 + needle / 200) * Math.PI) * 54}
          stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
        <circle cx={960} cy={220} r={9} fill={KRP.ink} />
      </g>
      {/* ===== 扉 (左右に引き分いたまま) ===== */}
      {[ldx, rdx].map((dx, i) => (
        <g key={i}>
          <rect x={dx} y={OT} width={dW} height={FY - OT} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={BP.brassDark} strokeWidth={4} opacity={0.8}>
            {[0.22, 0.44, 0.66, 0.88].map((u, j) => (
              <line key={j} x1={dx + dW * u} y1={OT + 10} x2={dx + dW * u} y2={FY - 10} />
            ))}
          </g>
          <rect x={dx + 42} y={OT + 40} width={dW - 84} height={150} rx={10}
            fill={BP.glass} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
          <rect x={i === 0 ? dx + dW - 34 : dx + 22} y={430} width={14} height={78} rx={7}
            fill={BP.brassLight} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* ===== 係員のいた場所 ===== */}
      {/* 擦り切れた床 */}
      <ellipse cx={420} cy={806} rx={118} ry={30} fill={BP.grease} opacity={0.35} />
      {/* 空いた丸椅子 */}
      <g>
        <ellipse cx={420} cy={672} rx={82} ry={26} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={420} cy={664} rx={82} ry={26} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={360} y1={684} x2={330} y2={800} />
          <line x1={480} y1={684} x2={510} y2={800} />
          <line x1={420} y1={690} x2={420} y2={812} />
          <line x1={352} y1={752} x2={492} y2={752} strokeWidth={5} />
        </g>
      </g>
      {/* 運転レバー (左の壁。誰も握っていない) */}
      <Lever x={178} y={818} s={0.58} angle={2 + Math.sin(f / 31) * 1.2} f={f} />
      {/* ===== 隅に残った制服と丸帽 ===== */}
      <g>
        <rect x={1392} y={766} width={330} height={22} rx={6} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={1420} y1={786} x2={1412} y2={852} />
          <line x1={1694} y1={786} x2={1702} y2={852} />
        </g>
        {/* 畳んだ制服 */}
        <rect x={1414} y={728} width={168} height={20} rx={5} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1410} y={746} width={176} height={20} rx={5} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1418} y={708} width={160} height={22} rx={5} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1498} cy={719} r={7} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={3} />
        {/* 丸帽 */}
        <ellipse cx={1652} cy={756} rx={62} ry={14} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1604 752 A 48 42 0 0 1 1700 752 Z" fill={C.ink2} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1612} y={740} width={80} height={14} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1652} cy={728} r={9} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={470} y={330} text="係員の席" size={40} t={seg(f, 6, 20)} />
      <XMark x={440} y={566} s={0.95} t={seg(f, 22, 38)} />
      <TagPlate x={1450} y={330} text="自動" size={44} t={seg(f, 14, 28)} fill={BP.brassLight} />
    </Frame>
  );
};

// ===== #103 さらに、モーターの速度が細かく調整されます。 =====
// 格: 図
// どこ: クリーム地の方眼紙。速さのグラフだけ。
// 演出: 角ばった台形 (昔) を薄い点線で残し、なめらかなS字 (いま) を赤で重ねる。
//       グラフは画面の端まで使う。下に「加速/一定/減速」の区間札。
// 動き: 走る点がカーブを辿り、走査線が左から右へ動く。赤いS字と札が順に出る。
const Kb2cSokudoChousei: React.FC<{ f: number }> = ({ f }) => {
  const GX = 250, GY = 740, GW = 1340, GH = 520;
  const sweep = GX + ((f * 26) % (GW + 1)); // 左から右へ走る走査線
  return (
    <Frame f={f} seed={643} bg={KRP.cream}>
      <GridPaper />
      {/* 区間の仕切り (加速 / 一定 / 減速) */}
      <g stroke={KRP.ink} strokeWidth={5} strokeDasharray="16 14" opacity={0.45}>
        <line x1={GX + GW * 0.3} y1={GY} x2={GX + GW * 0.3} y2={GY - GH} />
        <line x1={GX + GW * 0.7} y1={GY} x2={GX + GW * 0.7} y2={GY - GH} />
      </g>
      {/* 走査線 */}
      <line x1={sweep} y1={GY + 10} x2={sweep} y2={GY - GH - 20}
        stroke={KRP.yellow} strokeWidth={9} opacity={0.5} strokeLinecap="round" />
      {/* 本体 */}
      <SpeedGraph x={GX} y={GY} w={GW} h={GH} f={f} mode="both" t={seg(f, 4, 24)} />
      {/* 目盛りの数値 (縦軸 = 速さの割合) */}
      <g fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink} opacity={0.8}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <text key={i} x={GX - 22} y={GY - (GH / 5) * i + 11} textAnchor="end">{i * 2}</text>
        ))}
      </g>
      {/* 角の立った昔の折れ目を指す */}
      <ForceArrow x={GX + GW * 0.3 + 40} y={GY - GH - 46} len={150} rot={150} w={18}
        color={BP.steelDark} t={seg(f, 18, 32)} />
      {/* 札 */}
      <TagPlate x={GX + GW * 0.15} y={690} text="加速" size={38} t={seg(f, 10, 24)} />
      <TagPlate x={GX + GW * 0.5} y={690} text="一定" size={38} t={seg(f, 14, 28)} />
      <TagPlate x={GX + GW * 0.85} y={690} text="減速" size={38} t={seg(f, 18, 32)} />
      <TagPlate x={1766} y={300} text="いま" size={48} t={seg(f, 6, 20)} color={KRP.red} />
      <line x1={1690} y1={364} x2={1842} y2={364} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
      <TagPlate x={1766} y={470} text="昔" size={48} t={seg(f, 22, 36)} color={BP.steelDark} />
      <line x1={1690} y1={534} x2={1842} y2={534} stroke={BP.steelDark} strokeWidth={10}
        strokeDasharray="20 14" opacity={0.6} />
      <Maru x={1766} y={672} s={0.8} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #104 発進も停止も、なめらかになりました。 =====
// 格: 並
// どこ: 走っているかごの中。手に持ったカップへの寄り。背景は真鍮の壁と階数の針だけ。
// 演出: 描くのは「ゆれない水面」ひとつ。水面はほぼ平らで、細い波紋だけが残る。
// 動き: 水面の波紋がごく小さく息をする。階数の針がなめらかに動く。手がわずかに上下。
const Kb2cNamerakani: React.FC<{ f: number }> = ({ f }) => {
  const CX = 840, TOPY = 330, BOTY = 690;     // カップの上端・底
  const WY = 430;                              // 水面
  const rip = Math.sin(f / 6) * 0.1 + Math.sin(f / 13) * 0.06; // ごく小さい揺れ
  const hb = Math.sin(f / 15) * 4;             // 手のわずかな上下
  const dial = 0.28 + 0.4 * easeOut(clamp01(seg(f, 2, 40)));
  const ang = Math.PI + dial * Math.PI;
  return (
    <Frame f={f} seed={644} bg={KRP.cream}>
      {/* ===== 背景: かごの真鍮の壁 ===== */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 240} y={0} width={240} height={1080}
          fill={i % 2 ? BP.brass : BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
      ))}
      <rect x={0} y={236} width={W} height={56} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={40} y1={264} x2={1880} y2={264} n={24} r={9} fill={BP.ironDark} />
      {/* 真鍮の手すり */}
      <g>
        <rect x={-20} y={620} width={450} height={26} rx={13} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={100} y={646} width={30} height={74} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={115} y={716} r={13} fill={BP.brassDark} />
      </g>
      {/* ===== 階数の針 (右上) ===== */}
      <g>
        <path d="M 1430 336 A 150 150 0 0 1 1730 336 Z" fill={BP.paper} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={5}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI + (i / 8) * Math.PI;
            return (
              <line key={i} x1={1580 + Math.cos(a) * 128} y1={336 + Math.sin(a) * 128}
                x2={1580 + Math.cos(a) * 104} y2={336 + Math.sin(a) * 104} />
            );
          })}
        </g>
        <text x={1448} y={316} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>1</text>
        <text x={1686} y={316} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>9</text>
        <line x1={1580} y1={336} x2={1580 + Math.cos(ang) * 116} y2={336 + Math.sin(ang) * 116}
          stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
        <circle cx={1580} cy={336} r={14} fill={KRP.ink} />
        <circle cx={1580} cy={336} r={6} fill={BP.brassLight} />
      </g>
      {/* ===== 腕と掌 (カップの後ろ) ===== 全体を (840,700) 中心に1.2倍して大きく見せる */}
      <g transform="translate(-168 -140) scale(1.2)">
      <g transform={`translate(610 ${790 + hb}) rotate(28)`}>
        <rect x={-88} y={46} width={176} height={340} rx={22} fill={C.ink2} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={BP.steelDark} strokeWidth={5} opacity={0.55}>
          <line x1={-50} y1={70} x2={-50} y2={370} />
          <line x1={40} y1={70} x2={40} y2={370} />
        </g>
        <rect x={-94} y={20} width={188} height={38} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={70} cy={39} r={9} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={-78} y={-16} width={156} height={44} fill={C.skin} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <ellipse cx={700} cy={640 + hb} rx={118} ry={100} fill={C.skin} stroke={KRP.ink} strokeWidth={7} />
      {/* ===== カップと水 ===== */}
      <g transform={`translate(0 ${hb})`}>
        <path d={`M 690 ${TOPY} L 990 ${TOPY} L 952 ${BOTY} L 728 ${BOTY} Z`}
          fill={BP.glass} stroke={KRP.ink} strokeWidth={8} opacity={0.72} />
        {/* 水 */}
        <path d={`M 701 ${WY} L 979 ${WY} L 952 ${BOTY} L 728 ${BOTY} Z`}
          fill={KRP.blueSoft} stroke="none" />
        <ellipse cx={CX} cy={WY} rx={139} ry={32 * (1 + rip)} fill={KRP.blue}
          stroke={KRP.ink} strokeWidth={6} />
        {/* わずかな波紋 */}
        <g fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.65}>
          <ellipse cx={CX} cy={WY} rx={88} ry={20 * (1 + rip * 2.2)} />
          <ellipse cx={CX} cy={WY} rx={46} ry={11 * (1 - rip * 2.2)} />
        </g>
        {/* 水平の目安線 (水面はこの線から動かない) */}
        <line x1={620} y1={WY} x2={1120} y2={WY} stroke={KRP.red} strokeWidth={4}
          strokeDasharray="18 14" opacity={0.75} />
        {/* カップの口 */}
        <ellipse cx={CX} cy={TOPY} rx={150} ry={34} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={CX} cy={TOPY} rx={150} ry={34} fill={BP.glass} opacity={0.25} />
        <rect x={706} y={TOPY + 36} width={26} height={300} rx={13} fill={KRP.white} opacity={0.4} />
        {/* ===== 指 (カップの前) ===== */}
        <g fill={C.skin} stroke={KRP.ink} strokeWidth={6}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`rotate(${(i - 1.5) * 3.2} 700 ${520 + i * 54})`}>
              <rect x={690} y={496 + i * 54} width={212 - i * 14} height={48} rx={24} />
              <line x1={790} y1={500 + i * 54} x2={790} y2={540 + i * 54}
                stroke={C.skinDark} strokeWidth={4} opacity={0.8} />
            </g>
          ))}
        </g>
        {/* 親指 (掌の左下から生えて、指の左端に重なる) */}
        <g transform={`translate(676 684) rotate(10)`}>
          <rect x={-36} y={-214} width={72} height={228} rx={36} fill={C.skin} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-20} y1={-120} x2={20} y2={-120} stroke={C.skinDark} strokeWidth={5} opacity={0.8} />
          <rect x={-22} y={-198} width={44} height={52} rx={18} fill={C.skinDark} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        </g>
      </g>
      </g>
      {/* ===== 札 ===== */}
      <Arrow x={1188} y={376} s={1.05} rot={180} t={seg(f, 10, 24)} />
      <TagPlate x={1392} y={376} text="水面" size={38} t={seg(f, 14, 28)} />
      <Maru x={1500} y={578} s={0.84} t={seg(f, 24, 38)} />
      <TagPlate x={1500} y={714} text="ゆれない" size={46} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #105 いまは、何台もまとめて制御されています。 =====
// 格: 並
// どこ: 現代のビルの断面。外形の輪郭だけ空に抜き、中に縦穴が6本。
// 演出: 描くのは「6本の縦穴」ひとつ。かごの高さがばらばらなことで「何台も」を見せる。
// 動き: 6台がそれぞれ別の速さで上下し、各穴の綱車が回る。上の指令バスが脈打つ。
const Kb2cNandaiMatomete: React.FC<{ f: number }> = ({ f }) => {
  const SY = 300, SH = 530;                      // 縦穴の上端・高さ
  const pos = [0.18, 0.74, 0.46, 0.9, 0.08, 0.6];
  const spd = [1, -1, 1, -1, 1, -1];
  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(f / 11));
  return (
    <Frame f={f} seed={645} bg={KRP.cream}>
      {/* 空と遠景 */}
      <rect x={0} y={0} width={W} height={900} fill={C.skyHaze} />
      <g fill={C.cityFar} opacity={0.5}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={-40 + i * 270} y={700 - rnd(i + 3) * 170} width={190}
            height={260 + rnd(i + 9) * 170} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      <rect x={0} y={880} width={W} height={200} fill={C.asphalt} stroke={KRP.ink} strokeWidth={6} />
      {/* ビルの外形 (断面) */}
      <rect x={200} y={230} width={1520} height={660} fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={8} />
      <rect x={200} y={190} width={1520} height={44} rx={8} fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
      <rect x={1720} y={236} width={60} height={654} fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
      {/* 指令のバス (6本の穴の上をつなぐ) */}
      <rect x={250} y={250} width={1420} height={22} rx={8} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <g>
        {Array.from({ length: 6 }, (_, i) => {
          const cx = 320 + i * 252;
          return (
            <g key={i}>
              <line x1={cx} y1={272} x2={cx} y2={SY - 6} stroke={KRP.orange}
                strokeWidth={8} opacity={pulse} strokeLinecap="round" />
              <circle cx={cx} cy={272} r={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* 縦穴 6本 */}
      {Array.from({ length: 6 }, (_, i) => {
        const cx = 320 + i * 252;
        const t = clamp01(pos[i] + Math.sin((f + i * 23) / 34) * 0.12 * spd[i]);
        const carY = lerp(SY + SH - 40, SY + 130, t);
        return (
          <g key={i}>
            {/* 穴 */}
            <rect x={cx - 92} y={SY} width={184} height={SH} fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={6} />
            <rect x={cx - 82} y={SY + 10} width={164} height={SH - 20} fill={BP.shaft} opacity={0.2} />
            {/* 階の床 */}
            <g>
              {Array.from({ length: 7 }, (_, j) => {
                const fy = lerp(SY + SH - 24, SY + 36, (j + 1) / 8);
                return (
                  <rect key={j} x={cx - 96} y={fy} width={192} height={12}
                    fill={BP.slab} stroke={KRP.ink} strokeWidth={3.5} />
                );
              })}
            </g>
            {/* 案内レール */}
            <GuideRail x={cx - 70} y1={SY + 24} y2={SY + SH - 18} w={14} opacity={0.9} />
            <GuideRail x={cx + 70} y1={SY + 24} y2={SY + SH - 18} w={14} opacity={0.9} />
            {/* 綱車とロープ */}
            <Sheave x={cx} y={SY + 4} r={42} rot={f * (2.4 * spd[i])} spokes={5} bracket={false} />
            <Rope x1={cx - 34} y1={SY + 6} x2={cx - 34} y2={carY - 142} w={9} kind="wire" f={f} />
            {/* かご */}
            <Car x={cx} y={carY} w={132} h={142} f={f} door={0} sling lamp />
            {/* 号機の番号 */}
            <text x={cx} y={SY + SH + 44} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={38} fill={KRP.ink}>{i + 1}</text>
          </g>
        );
      })}
      {/* 札 */}
      <TagPlate x={128} y={430} text="6台" size={52} t={seg(f, 6, 20)} />
      <TagPlate x={128} y={560} text="同じ指令" size={30} t={seg(f, 16, 30)} color={KRP.orange} />
      <TagPlate x={1838} y={430} text="高さは" size={28} t={seg(f, 22, 36)} />
      <TagPlate x={1824} y={530} text="ばらばら" size={28} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ===== #106 どのかごを行かせれば、待ち時間が短いか。 =====
// 格: 図
// どこ: クリーム地の方眼紙。6本の縦穴を線だけで描いた図。
// 演出: 待っている階を赤い印で示し、選ばれた1本だけ実線 + ○。他は点線で沈める。
// 動き: 点線が流れ、赤い印が点滅し、選ばれたかごが待っている階へ寄っていく。○が出る。
const Kb2cDonoKago: React.FC<{ f: number }> = ({ f }) => {
  const Y1 = 180, Y2 = 740, FLOORS = 8, PICK = 2;
  const yOf = (n: number) => lerp(Y2, Y1, n / (FLOORS - 1)); // n=0 が最下階
  const WAIT = 5;                                            // 待っている階
  const start = [1, 6, 2, 7, 0, 4];
  const go = easeOut(clamp01(seg(f, 14, 40)));
  const blink = 0.45 + 0.55 * Math.abs(Math.sin(f / 7));
  return (
    <Frame f={f} seed={646} bg={KRP.cream}>
      <GridPaper />
      {/* 階の横線 (6本をまたぐ梯子) */}
      <g>
        {Array.from({ length: FLOORS }, (_, n) => (
          <g key={n}>
            <line x1={190} y1={yOf(n)} x2={1760} y2={yOf(n)}
              stroke={KRP.ink} strokeWidth={n === WAIT ? 7 : 4} opacity={n === WAIT ? 1 : 0.3} />
            <text x={168} y={yOf(n) + 13} textAnchor="end" fontFamily={FONT} fontWeight={800}
              fontSize={34} fill={n === WAIT ? KRP.red : KRP.ink}
              opacity={n === WAIT ? 1 : 0.55}>{n + 1}</text>
          </g>
        ))}
      </g>
      {/* 待っている階の赤い印 (▶ + 人の点) */}
      <g opacity={blink}>
        <polygon points={`150,${yOf(WAIT) - 30} 206,${yOf(WAIT)} 150,${yOf(WAIT) + 30}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={96} cy={yOf(WAIT) - 10} r={26} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 縦穴 6本 */}
      {Array.from({ length: 6 }, (_, i) => {
        const cx = 320 + i * 252;
        const sel = i === PICK;
        const n = sel ? lerp(start[i], WAIT, go) : start[i];
        const cy = yOf(n);
        return (
          <g key={i} opacity={sel ? 1 : 0.42}>
            <rect x={cx - 76} y={Y1} width={152} height={Y2 - Y1} fill="none"
              stroke={KRP.ink} strokeWidth={sel ? 8 : 5}
              strokeDasharray={sel ? undefined : "22 16"}
              strokeDashoffset={sel ? undefined : -f * 2.2} />
            {/* 吊りロープと綱車 */}
            <circle cx={cx} cy={Y1 - 34} r={30} fill={sel ? BP.steel : KRP.white}
              stroke={KRP.ink} strokeWidth={6} />
            <circle cx={cx} cy={Y1 - 34} r={11} fill={KRP.ink} />
            <line x1={cx} y1={Y1 - 34} x2={cx} y2={cy - 44} stroke={KRP.ink}
              strokeWidth={sel ? 7 : 4} strokeDasharray={sel ? undefined : "14 12"} />
            {/* かご */}
            <rect x={cx - 52} y={cy - 44} width={104} height={88} rx={8}
              fill={sel ? BP.brass : KRP.white} stroke={KRP.ink} strokeWidth={sel ? 8 : 5} />
            <line x1={cx} y1={cy - 38} x2={cx} y2={cy + 38} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            <text x={cx} y={Y1 - 76} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={40} fill={KRP.ink}>{i + 1}</text>
          </g>
        );
      })}
      {/* 選ばれた1本に○ と 行き先の矢印 */}
      <Maru x={320 + PICK * 252} y={yOf(lerp(start[PICK], WAIT, go))} s={1.0} t={seg(f, 24, 40)} />
      <ForceArrow x={320 + PICK * 252 + 110} y={yOf(start[PICK]) - 20} len={200} rot={-90} w={22}
        color={KRP.red} t={seg(f, 10, 28)} label="行く" labelSize={36} />
      {/* 札 */}
      <TagPlate x={300} y={790} text="待っている階" size={32} t={seg(f, 4, 18)} color={KRP.red} />
      <TagPlate x={880} y={778} text="この1台" size={40} t={seg(f, 20, 34)} />
      <TagPlate x={1560} y={790} text="他は動かさない" size={30} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #107 朝の混雑を、どう捌けば大勢を運べるか。 =====
// 格: 山
// どこ: 朝のオフィスビルのロビー。左に回転扉、奥にエレベーターの3門、壁に時計。
// 演出: 賑やかさで見せる。出勤の人が8人、服装も姿勢もばらばら。磨かれた床が映す。
//       1門だけ扉が開いて灯りがこぼれ、そこへ行列が吸い込まれていく。警備員が右に立つ。
// 動き: 回転扉の羽が回る。時計の秒針が進む。人が前後にじわり詰める。
//       開いた門の針が動き、満員の札と？が出る。
const Kb2cAsaNoKonzatsu: React.FC<{ f: number }> = ({ f }) => {
  const shuffle = Math.sin(f / 19) * 7;
  const rev = f * 1.9;                                  // 回転扉
  const sec = (f / 60) * 6;                             // 秒針
  const doorOpen = easeOut(clamp01(seg(f, 4, 26)));
  // 行列の人 (足元x, 足元y, 大きさ, 服, 位相)
  const queue: [number, number, number, string, string, number][] = [
    [1010, 706, 0.46, "#4A5A74", "#36445C", 0],
    [1180, 700, 0.44, "#7A5240", "#5C3C2E", 1],
    [1330, 712, 0.48, "#56707A", "#3E555E", 2],
    [980, 762, 0.56, "#2F3B52", "#222C3F", 3],
    [1160, 770, 0.58, "#6E4E6A", "#523850", 4],
    [1356, 764, 0.56, "#4C6350", "#36493A", 5],
    [1540, 756, 0.52, "#705E3C", "#53452A", 6],
  ];
  return (
    <Frame f={f} seed={647} bg={KRP.cream}>
      {/* ===== 奥の壁 ===== */}
      <rect x={0} y={0} width={W} height={648} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.4}>
        {[150, 320, 490].map((gy) => (<line key={gy} x1={0} y1={gy} x2={W} y2={gy} />))}
        {[240, 620, 1020, 1420, 1820].map((gx) => (<line key={gx} x1={gx} y1={0} x2={gx} y2={648} />))}
      </g>
      {/* 天井の照明帯 */}
      <rect x={0} y={0} width={W} height={76} fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      <g>
        {[300, 700, 1100, 1500, 1850].map((lx) => (
          <ellipse key={lx} cx={lx} cy={40} rx={110} ry={22} fill={BP.lamp}
            stroke={KRP.ink} strokeWidth={4} opacity={0.85 + 0.12 * Math.sin((f + lx) / 13)} />
        ))}
      </g>
      {/* ===== 左: 大窓と回転扉 ===== */}
      <rect x={40} y={118} width={470} height={296} fill={C.skyDay} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={6}>
        <line x1={196} y1={118} x2={196} y2={414} />
        <line x1={352} y1={118} x2={352} y2={414} />
        <line x1={40} y1={266} x2={510} y2={266} />
      </g>
      <g fill={C.cityFar} opacity={0.55} stroke={KRP.ink} strokeWidth={3}>
        <rect x={60} y={286} width={90} height={128} />
        <rect x={210} y={254} width={110} height={160} />
        <rect x={370} y={300} width={100} height={114} />
      </g>
      {/* 回転扉 (窓の手前・床に立つ) */}
      <g>
        <ellipse cx={300} cy={700} rx={210} ry={56} fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 90 700 A 210 210 0 0 1 510 700 Z" fill={BP.glass} opacity={0.45}
          stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${rev} 300 700)`} stroke={KRP.ink} strokeWidth={8}>
          <line x1={300} y1={700} x2={300} y2={496} stroke={BP.brass} strokeWidth={16} />
          <line x1={300} y1={700} x2={498} y2={742} stroke={BP.brass} strokeWidth={16} />
          <line x1={300} y1={700} x2={102} y2={742} stroke={BP.brass} strokeWidth={16} />
        </g>
        <rect x={286} y={430} width={28} height={280} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 86 486 A 214 214 0 0 1 514 486" fill="none" stroke={KRP.ink} strokeWidth={9} />
        <rect x={76} y={452} width={448} height={34} rx={10} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* ===== 壁の時計 ===== */}
      <g>
        <circle cx={706} cy={200} r={82} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
        <circle cx={706} cy={200} r={68} fill={BP.paper} stroke={BP.shaftDark} strokeWidth={4} />
        <g stroke={KRP.ink} strokeWidth={5}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line key={i} x1={706 + Math.sin(a) * 60} y1={200 - Math.cos(a) * 60}
                x2={706 + Math.sin(a) * 50} y2={200 - Math.cos(a) * 50} />
            );
          })}
        </g>
        {/* 8時50分 */}
        <line x1={706} y1={200} x2={706 + Math.sin(2.33) * 36} y2={200 - Math.cos(2.33) * 36}
          stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={706} y1={200} x2={706 + Math.sin(5.24) * 54} y2={200 - Math.cos(5.24) * 54}
          stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={706} y1={200} x2={706 + Math.sin((sec / 60) * 6.283) * 58}
          y2={200 - Math.cos((sec / 60) * 6.283) * 58}
          stroke={KRP.red} strokeWidth={4.5} strokeLinecap="round" />
        <circle cx={706} cy={200} r={9} fill={KRP.ink} />
      </g>
      {/* ===== 奥: エレベーターの3門 ===== */}
      {[900, 1230, 1560].map((dx, i) => {
        const op = i === 1 ? doorOpen : 0;
        const hw = 108;
        return (
          <g key={dx}>
            {/* 門の真鍮枠 */}
            <rect x={dx - hw - 26} y={226} width={(hw + 26) * 2} height={424}
              fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
            {/* 中 (開いていれば灯りが見える) */}
            <rect x={dx - hw} y={252} width={hw * 2} height={398}
              fill={i === 1 ? BP.lampGlow : BP.shaftDeep} stroke={KRP.ink} strokeWidth={5} />
            {i === 1 && (
              <g>
                <rect x={dx - hw + 14} y={266} width={hw * 2 - 28} height={370}
                  fill={BP.woodLight} stroke={BP.woodDark} strokeWidth={4} />
                <rect x={dx - hw + 14} y={452} width={hw * 2 - 28} height={14} fill={BP.brass} />
              </g>
            )}
            {/* 扉 (引き分け) */}
            {[-1, 1].map((sg) => (
              <rect key={sg} x={sg === -1 ? dx - hw - op * hw : dx + op * hw}
                y={252} width={hw} height={398}
                fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
            ))}
            {/* 階数の針 */}
            <path d={`M ${dx - 60} 214 A 60 60 0 0 1 ${dx + 60} 214 Z`}
              fill={BP.paper} stroke={KRP.ink} strokeWidth={5} />
            <line x1={dx} y1={214}
              x2={dx + Math.cos(Math.PI + (0.2 + i * 0.3 + Math.sin(f / 17) * 0.08) * Math.PI) * 44}
              y2={214 + Math.sin(Math.PI + (0.2 + i * 0.3 + Math.sin(f / 17) * 0.08) * Math.PI) * 44}
              stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
            <circle cx={dx} cy={214} r={8} fill={KRP.ink} />
          </g>
        );
      })}
      {/* ===== 床 (磨かれた石。映り込み) ===== */}
      <rect x={0} y={648} width={W} height={432} fill={BP.slab} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.white} strokeWidth={5} opacity={0.35}>
        {[700, 760, 830, 910, 1000].map((ly) => (<line key={ly} x1={0} y1={ly} x2={W} y2={ly} />))}
      </g>
      <g opacity={0.22}>
        {[900, 1230, 1560].map((dx) => (
          <polygon key={dx} points={`${dx - 108},656 ${dx + 108},656 ${dx + 150},1080 ${dx - 150},1080`}
            fill={dx === 1230 ? BP.lampGlow : BP.shaftDark} />
        ))}
      </g>
      {/* ===== 人 (奥から順に) ===== */}
      {/* 回転扉から入ってくる人 */}
      <ellipse cx={430} cy={812} rx={56} ry={14} fill={KRP.ink} opacity={0.22} />
      <Person x={430} y={812} s={0.62} cloth="#3E4B66" clothDark="#2E3850"
        hair="cap" lean={-3} f={f} phase={9} />
      <rect x={462} y={700} width={46} height={62} rx={6} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 行列 */}
      {queue.map(([px, py, s, cl, cd, ph], i) => {
        const dx = shuffle * (0.3 + 0.12 * i);
        return (
          <g key={i}>
            <ellipse cx={px + dx} cy={py + 6} rx={58 * s} ry={14 * s} fill={KRP.ink} opacity={0.22} />
            <Person x={px + dx} y={py} s={s} cloth={cl} clothDark={cd}
              glasses={i === 2 || i === 5} hair="cap" lean={(i % 3) - 1}
              f={f} phase={ph} />
            {/* 持ち物 (鞄・書類) */}
            {i % 3 === 0 && (
              <rect x={px + dx + 42 * s} y={py - 86 * s} width={52 * s} height={64 * s} rx={5}
                fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
            )}
            {i % 3 === 1 && (
              <rect x={px + dx - 86 * s} y={py - 102 * s} width={44 * s} height={56 * s} rx={3}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform={`rotate(-12 ${px + dx} ${py})`} />
            )}
          </g>
        );
      })}
      {/* 警備員 (右の壁際) */}
      <ellipse cx={1772} cy={796} rx={40} ry={12} fill={KRP.ink} opacity={0.22} />
      <Person x={1772} y={792} s={0.6} cloth="#2B3040" clothDark="#1E222E"
        helmet hair="cap" lean={0} f={f} phase={13} still />
      {/* ===== 札 ===== */}
      <TagPlate x={706} y={360} text="8:50" size={44} t={seg(f, 4, 18)} />
      <QMark x={1760} y={430} s={1.5} f={f} t={seg(f, 20, 36)} />
      <TagPlate x={1230} y={560} text="満員" size={40} t={seg(f, 26, 40)} color={KRP.red} />
      <TagPlate x={300} y={300} text="出勤" size={40} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #108 そこまで考えて、動いています。 =====
// 格: 図
// どこ: クリーム地の方眼紙。制御盤の箱と、そこから5台へ分かれる指令の図だけ。
// 演出: 中央の箱は継電器の棚・ルーバー・銘板・ボルトまで描く。白地だから粗が見える。
// 動き: 矢印が上から順に伸び、指令の光点が矢印を走る。継電器が小刻みに動き、表示灯が点滅。
const Kb2cSokoMadeKangaete: React.FC<{ f: number }> = ({ f }) => {
  const BX = 170, BY = 250, BW = 460, BH = 520;  // 制御盤
  const rows = [240, 352, 464, 576, 688];        // 5台の高さ
  const AX = BX + BW + 40;
  const ALEN = 820;
  return (
    <Frame f={f} seed={648} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 制御盤 ===== */}
      <g>
        <rect x={BX - 14} y={BY - 14} width={BW + 28} height={BH + 28} rx={12}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={BX} y={BY} width={BW} height={BH} rx={8}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        {/* ルーバー (放熱の羽) */}
        <g stroke={BP.ironDark} strokeWidth={7} opacity={0.75}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={BX + 34} y1={BY + 36 + i * 22} x2={BX + BW - 34} y2={BY + 36 + i * 22} />
          ))}
        </g>
        {/* 継電器の棚 3段 */}
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x={BX + 26} y={BY + 192 + r * 108} width={BW - 52} height={86} rx={6}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, i) => {
              const on = (Math.floor(f / 4) + r * 2 + i) % 5 < 2;
              return (
                <g key={i}>
                  <rect x={BX + 40 + i * 62} y={BY + 202 + r * 108} width={44} height={66} rx={4}
                    fill={BP.paper} stroke={KRP.ink} strokeWidth={4} />
                  {/* 接点が小刻みに動く */}
                  <line x1={BX + 48 + i * 62} y1={BY + 216 + r * 108 + (on ? 0 : 6)}
                    x2={BX + 76 + i * 62} y2={BY + 232 + r * 108 - (on ? 6 : 0)}
                    stroke={on ? KRP.red : BP.steelDark} strokeWidth={5} strokeLinecap="round" />
                  <circle cx={BX + 62 + i * 62} cy={BY + 254 + r * 108} r={7}
                    fill={on ? KRP.yellow : BP.steelLight} stroke={KRP.ink} strokeWidth={3} />
                </g>
              );
            })}
          </g>
        ))}
        {/* 銘板と表示灯 */}
        <rect x={BX + 26} y={BY + 142} width={168} height={38} rx={5}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={BX + BW - 72} cy={BY + 161} r={22}
          fill={Math.floor(f / 6) % 2 ? KRP.green : BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={BX + BW - 132} cy={BY + 161} r={22} fill={KRP.red}
          opacity={0.45 + 0.45 * Math.abs(Math.sin(f / 9))} stroke={KRP.ink} strokeWidth={5} />
        {/* 蝶番とボルト */}
        <HexBolt x={BX + 18} y={BY + 18} r={12} />
        <HexBolt x={BX + BW - 18} y={BY + 18} r={12} />
        <HexBolt x={BX + 18} y={BY + BH - 18} r={12} />
        <HexBolt x={BX + BW - 18} y={BY + BH - 18} r={12} />
      </g>
      {/* ===== 指令の矢印 5本 ===== */}
      {rows.map((ry, i) => {
        const t = seg(f, 6 + i * 5, 24 + i * 5);
        const dot = (f * 14 + i * 60) % ALEN;
        const rot = ((ry - (BY + BH / 2)) / ALEN) * 42;
        return (
          <g key={i}>
            <ForceArrow x={AX} y={BY + BH / 2} len={ALEN} rot={rot} w={20}
              color={KRP.orange} t={t} />
            {/* 走る指令の光点 */}
            <circle
              cx={AX + Math.cos((rot * Math.PI) / 180) * dot}
              cy={BY + BH / 2 + Math.sin((rot * Math.PI) / 180) * dot}
              r={13} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4}
              opacity={clamp01(t) * 0.95} />
          </g>
        );
      })}
      {/* ===== 5台のかご (略図) ===== */}
      {rows.map((ry, i) => (
        <g key={i}>
          <line x1={1530} y1={ry - 92} x2={1530} y2={ry - 44} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1530} cy={ry - 104} r={22} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1466} y={ry - 44} width={128} height={94} rx={8}
            fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
          <line x1={1530} y1={ry - 38} x2={1530} y2={ry + 44} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
          <rect x={1480} y={ry - 32} width={44} height={30} rx={4} fill={BP.glass}
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.8} />
          <TagPlate x={1758} y={ry + 2} text={`${i + 1}号機`} size={30} t={seg(f, 10 + i * 5, 26 + i * 5)} />
        </g>
      ))}
      {/* 札 */}
      <TagPlate x={400} y={784} text="制御" size={34} t={seg(f, 4, 18)} />
      <TagPlate x={980} y={196} text="どの階へ・どの順で" size={28} t={seg(f, 24, 40)} color={KRP.orange} />
    </Frame>
  );
};

// ===== #109 速いものは、1秒で10メートル以上登ります。 =====
// 格: 並
// どこ: 高層ビルの外観。昼の空、足元に遠い街並み。描くのは「1秒で進む距離」ひとつ。
// 演出: ビルの高さに沿って赤い目盛りが伸びる。1mごとの刻みを10本、両端に止め。
//       かごの位置を外壁の明るい窓で示し、始まりの位置を薄く残す。
// 動き: かごの印が目盛りを登り、赤い矢印が伸びる。流線が走る。雲が流れ、頂の灯が点滅。
const Kb2c1byou10m: React.FC<{ f: number }> = ({ f }) => {
  const Y0 = 762, Y1 = 302;                 // 1秒ぶんの下端・上端
  const p = easeOut(clamp01(seg(f, 6, 40)));
  const carY = lerp(Y0, Y1, p);
  const blink = Math.floor(f / 9) % 2 === 0;
  return (
    <Frame f={f} seed={649} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={900} fill={C.skyDay} />
      {/* 雲 */}
      <g fill={KRP.white} opacity={0.75}>
        {[0, 1, 2].map((i) => {
          const cx = ((f * 0.5 + i * 760) % 2300) - 190;
          const cy = 180 + i * 190;
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={150} ry={46} />
              <ellipse cx={cx + 90} cy={cy - 26} rx={100} ry={40} />
              <ellipse cx={cx - 94} cy={cy - 12} rx={84} ry={32} />
            </g>
          );
        })}
      </g>
      {/* 遠い街並み */}
      <g fill={C.cityFar} stroke={KRP.ink} strokeWidth={4} opacity={0.6}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={-60 + i * 300} y={760 - rnd(i + 5) * 110} width={230}
            height={240 + rnd(i + 2) * 110} />
        ))}
      </g>
      <rect x={0} y={880} width={W} height={200} fill={C.asphalt} stroke={KRP.ink} strokeWidth={6} />
      {/* ===== 高層ビル ===== */}
      <rect x={640} y={128} width={780} height={752} fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={8} />
      <rect x={1420} y={166} width={74} height={714} fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
      <rect x={620} y={96} width={880} height={40} rx={8} fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
      {/* 頂の航空障害灯 */}
      <rect x={1012} y={38} width={20} height={60} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1022} cy={30} r={16} fill={blink ? KRP.red : BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
      {/* 窓の格子 */}
      <g>
        {Array.from({ length: 16 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const wx = 672 + c * 92;
            const wy = 164 + r * 44;
            const lit = rnd(r * 11 + c * 3) > 0.72;
            return (
              <rect key={`${r}-${c}`} x={wx} y={wy} width={66} height={28} rx={3}
                fill={lit ? BP.lamp : KPP.glass} stroke={KRP.ink} strokeWidth={3} opacity={0.95} />
            );
          }))}
      </g>
      {/* 縦穴の帯 (外から見えるかごの筋) */}
      <rect x={876} y={150} width={196} height={716} fill={BP.shaftDark} opacity={0.72}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 始まりの位置 (薄く残す) */}
      <rect x={890} y={Y0 - 46} width={168} height={92} rx={6} fill={BP.brassLight}
        stroke={KRP.ink} strokeWidth={6} opacity={0.34} />
      {/* 流線 */}
      <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.8}>
        {[0, 1, 2, 3, 4].map((i) => {
          const sy = carY + 72 + i * 46 + ((f * 9) % 46);
          return sy < Y0 + 70 ? <line key={i} x1={908 + i * 34} y1={sy} x2={908 + i * 34} y2={sy + 34} /> : null;
        })}
      </g>
      {/* かご (いまの位置) */}
      <g>
        <rect x={890} y={carY - 46} width={168} height={92} rx={6} fill={BP.brassLight}
          stroke={KRP.ink} strokeWidth={9} />
        <line x1={974} y1={carY - 40} x2={974} y2={carY + 40} stroke={KRP.ink} strokeWidth={4} />
        <rect x={904} y={carY - 34} width={60} height={42} rx={4} fill={BP.glass}
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
        <rect x={984} y={carY - 34} width={60} height={42} rx={4} fill={BP.glass}
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
        <Rope x1={974} y1={carY - 42} x2={974} y2={150} w={10} kind="wire" f={f} opacity={0.9} />
      </g>
      {/* ===== 1秒ぶんの赤い目盛り ===== */}
      <g>
        <line x1={1572} y1={Y0} x2={1572} y2={Y1} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
        {Array.from({ length: 11 }, (_, i) => {
          const ty = lerp(Y0, Y1, i / 10);
          const big = i === 0 || i === 10 || i === 5;
          return (
            <g key={i}>
              <line x1={1572 - (big ? 44 : 26)} y1={ty} x2={1572 + (big ? 44 : 26)} y2={ty}
                stroke={KRP.red} strokeWidth={big ? 9 : 6} />
              {big && (
                <text x={1524} y={ty + 12} textAnchor="end" fontFamily={FONT} fontWeight={800}
                  fontSize={30} fill={KRP.red}>{i}</text>
              )}
            </g>
          );
        })}
        {/* ビルとの対応線 */}
        <g stroke={KRP.red} strokeWidth={4} strokeDasharray="16 12" opacity={0.75}>
          <line x1={1064} y1={Y0} x2={1572} y2={Y0} />
          <line x1={1064} y1={Y1} x2={1572} y2={Y1} />
        </g>
        <ForceArrow x={1680} y={Y0} len={Y0 - Y1} rot={-90} w={24} color={KRP.red} t={seg(f, 10, 34)} />
      </g>
      {/* 札 */}
      <TagPlate x={1802} y={388} text="10m" size={52} t={seg(f, 14, 28)} color={KRP.red} />
      <TagPlate x={1808} y={524} text="1秒" size={52} t={seg(f, 20, 34)} />
      <TagPlate x={300} y={420} text="上へ" size={44} t={seg(f, 26, 40)} />
      <ForceArrow x={420} y={700} len={240} rot={-90} w={26} color={KRP.green} t={seg(f, 8, 26)} />
    </Frame>
  );
};

// ===== #110 地震を感じると、自分で最寄りの階に止まります。 =====
// 格: 並
// どこ: 揺れている縦穴の断面。描くのは「最寄りの階で止まって扉が開くかご」ひとつ。
// 演出: 建物の線が震え、残像が二重になる。右の壁に感知器 (錘と赤灯)。
//       かごは3階の床に揃い、扉が開いて乗り場の灯りがこぼれる。
// 動き: 画面全体が小刻みに揺れる。感知器の錘が振れ、赤灯が点滅。扉が開く。揺れ線が脈打つ。
const Kb2cJishinSaiyose: React.FC<{ f: number }> = ({ f }) => {
  const sx = Math.sin(f / 1.7) * 9;
  const sy = Math.cos(f / 2.3) * 5;
  const door = easeOut(clamp01(seg(f, 16, 38)));
  const pend = Math.sin(f / 2.1) * 26;
  const lamp = Math.floor(f / 5) % 2 === 0;
  const SX1 = 620, SX2 = 1300, SY1 = 150, SY2 = 866;
  const FLY = 700;                              // かごが止まった階の床
  return (
    <Frame f={f} seed={650} bg={KRP.cream}>
      {/* 建物の地 */}
      <rect x={0} y={0} width={W} height={H} fill={C.stone} />
      {/* 揺れている建物ぜんぶ */}
      <g transform={`translate(${sx} ${sy})`}>
        {/* 残像 (二重の線) */}
        <g opacity={0.26} transform={`translate(${-sx * 1.9} ${-sy * 1.9})`}>
          <rect x={SX1} y={SY1} width={SX2 - SX1} height={SY2 - SY1}
            fill="none" stroke={KRP.ink} strokeWidth={8} />
          <rect x={200} y={SY1 - 40} width={1520} height={60} fill="none" stroke={KRP.ink} strokeWidth={8} />
        </g>
        {/* 梁と床スラブ (外まで伸びる) */}
        {[240, 462, FLY, 880].map((fy, i) => (
          <g key={i}>
            <rect x={140} y={fy} width={1640} height={26} fill={BP.slab}
              stroke={KRP.ink} strokeWidth={6} />
            <text x={176} y={fy - 16} fontFamily={FONT} fontWeight={800} fontSize={34}
              fill={KRP.ink} opacity={0.75}>{4 - i}F</text>
          </g>
        ))}
        {/* 縦穴 */}
        <rect x={SX1} y={SY1} width={SX2 - SX1} height={SY2 - SY1}
          fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={8} />
        <rect x={SX1 + 12} y={SY1 + 12} width={SX2 - SX1 - 24} height={SY2 - SY1 - 24}
          fill={BP.shaft} opacity={0.2} />
        {/* 穴を横切る床スラブ (かごの止まる階だけ切れている) */}
        {[240, 462, 880].map((fy) => (
          <rect key={fy} x={SX1 - 6} y={fy} width={SX2 - SX1 + 12} height={26}
            fill={BP.slab} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 案内レール */}
        <GuideRail x={SX1 + 96} y1={SY1 + 20} y2={SY2 - 20} w={24} />
        <GuideRail x={SX2 - 96} y1={SY1 + 20} y2={SY2 - 20} w={24} />
        {/* 乗り場の開口 (左の壁) と灯り */}
        <rect x={SX1 - 150} y={FLY - 232} width={156} height={232}
          fill={BP.lampGlow} stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`${SX1 - 6},${FLY - 224} ${SX1 + 110},${FLY - 206} ${SX1 + 110},${FLY - 20} ${SX1 - 6},${FLY - 4}`}
          fill={BP.lampGlow} opacity={0.45 * door} />
        {/* 吊り元 */}
        <Rope x1={900} y1={SY1 + 20} x2={900} y2={FLY - 238} w={14} kind="wire" f={f} />
        <Sheave x={900} y={SY1 + 10} r={62} rot={0} spokes={6} bracket={false} />
        {/* かご (最寄りの階に床を揃えて止まっている) */}
        <Car x={900} y={FLY} w={330} h={226} f={f} door={door} sling lamp indicator={0.5} />
        {/* 床が揃っている印 */}
        <g stroke={KRP.green} strokeWidth={7} opacity={easeOut(clamp01(seg(f, 10, 26)))}>
          <line x1={SX1 - 170} y1={FLY + 2} x2={SX1 + 120} y2={FLY + 2} />
        </g>
        {/* ===== 感知器 (右の壁) ===== */}
        <g>
          <rect x={1398} y={300} width={220} height={250} rx={10}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
          <rect x={1420} y={322} width={176} height={150} rx={6}
            fill={BP.glass} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
          {/* 中の錘 (振れる) */}
          <line x1={1508} y1={330} x2={1508 + pend} y2={430} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1508 + pend} cy={442} r={26} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>
            <line x1={1440} y1={462} x2={1576} y2={462} />
          </g>
          {/* 赤灯 */}
          <circle cx={1508} cy={508} r={22}
            fill={lamp ? KRP.red : BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
          {lamp && <circle cx={1508} cy={508} r={40} fill={KRP.red} opacity={0.3} />}
          <HexBolt x={1414} y={316} r={11} />
          <HexBolt x={1602} y={316} r={11} />
          <HexBolt x={1414} y={534} r={11} />
          <HexBolt x={1602} y={534} r={11} />
          {/* 配線 (感知器 → 縦穴) */}
          <path d={`M 1398 470 Q 1340 480 1330 ${FLY - 180} L 1308 ${FLY - 180}`}
            fill="none" stroke={BP.ironDark} strokeWidth={9} />
        </g>
        {/* 揺れ線 (建物の両脇) */}
        <g stroke={KRP.ink} strokeWidth={8} strokeLinecap="round"
          opacity={0.5 + 0.4 * Math.abs(Math.sin(f / 4))}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M ${96 - i * 30} ${300 + i * 90} q -34 40 0 80`} fill="none" />
              <path d={`M ${1824 + i * 30} ${300 + i * 90} q 34 40 0 80`} fill="none" />
            </g>
          ))}
        </g>
      </g>
      {/* ===== 札 (揺れない層に置く) ===== */}
      <TagPlate x={1508} y={624} text="感知" size={40} t={seg(f, 2, 14)} color={KRP.red} />
      <TagPlate x={370} y={642} text="最寄りの階" size={34} t={seg(f, 12, 26)} />
      <TagPlate x={370} y={790} text="扉が開く" size={34} t={seg(f, 24, 40)} color={KRP.green} />
    </Frame>
  );
};

// ===== #111 安全に乗れて、高くまで行けて、毎日使える。 =====
// 格: 図
// どこ: クリーム地の方眼紙。3つに仕切り、それぞれに○と、その中身を言う装置をひとつ。
// 演出: 「落ちない」は歯レールに噛んだ爪、「高くまで」は積み上がる塔と上向きの矢印、
//       「毎日」は押しボタンの盤。装置は実物の部品をそのまま大きく置く。
// 動き: ○が左から順に出る。爪が小刻みに噛み直して火花が飛ぶ。
//       塔の矢印が伸びる。ボタンの点灯が次々に移る。
const Kb2cMittsuNoFuda: React.FC<{ f: number }> = ({ f }) => {
  const bite = 0.6 + 0.4 * Math.abs(Math.sin(f / 6));
  const up = easeOut(clamp01(seg(f, 10, 36)));
  const lit = Math.floor(f / 7) % 8;
  return (
    <Frame f={f} seed={651} bg={KRP.cream}>
      <GridPaper />
      {/* 仕切り */}
      <g stroke={KRP.ink} strokeWidth={6} strokeDasharray="20 16" opacity={0.5}>
        <line x1={680} y1={170} x2={680} y2={760} />
        <line x1={1240} y1={170} x2={1240} y2={760} />
      </g>
      {/* 台 */}
      {[400, 960, 1520].map((cx) => (
        <rect key={cx} x={cx - 200} y={690} width={400} height={24} rx={7}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      ))}
      {/* ===== 1: 落ちない (歯レール + 噛んだ爪) ===== */}
      <g>
        <ToothRail x={430} y1={370} y2={690} w={54} pitch={60} dir={-1} />
        <rect x={270} y={430} width={140} height={120} rx={10}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={290} y1={450} x2={390} y2={450} n={4} r={7} />
        <Spring x={340} y={566} len={110} w={70} coils={5} stress={bite} />
        <Pawl x={360} y={490} rot={-8 + bite * 6} s={0.9} dir={1} bite={bite} />
        <Sparks x={404} y={492} f={f} n={8} s={0.8} t={seg(f, 8, 20)} />
      </g>
      <Maru x={400} y={255} s={1.0} t={seg(f, 4, 18)} />
      <TagPlate x={400} y={780} text="落ちない" size={44} t={seg(f, 8, 22)} />
      {/* ===== 2: 高くまで (積み上がる塔) ===== */}
      <g>
        {Array.from({ length: 6 }, (_, i) => {
          const ap = clamp01((up * 6 - i) * 1.6);
          const bw = 186 - i * 14;
          const by = 690 - (i + 1) * 54;
          if (ap <= 0) return null;
          return (
            <g key={i} opacity={ap}>
              <rect x={960 - bw / 2} y={by} width={bw} height={50}
                fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={6} />
              <g stroke={KPP.glass} strokeWidth={10} opacity={0.9}>
                <line x1={960 - bw / 2 + 20} y1={by + 25} x2={960 + bw / 2 - 20} y2={by + 25} />
              </g>
            </g>
          );
        })}
        <ForceArrow x={1150} y={690} len={340} rot={-90} w={26}
          color={KRP.green} t={seg(f, 12, 34)} />
        <line x1={820} y1={690 - 6 * 54} x2={1190} y2={690 - 6 * 54}
          stroke={KRP.ink} strokeWidth={5} strokeDasharray="16 12" opacity={0.6 * up} />
      </g>
      <Maru x={960} y={255} s={1.0} t={seg(f, 12, 26)} />
      <TagPlate x={960} y={780} text="高くまで" size={44} t={seg(f, 16, 30)} />
      {/* ===== 3: 毎日 (押しボタンの盤) ===== */}
      <ButtonPanel x={1520} y={510} s={0.62} rows={4} cols={2} lit={lit} f={f} />
      <g stroke={KRP.ink} strokeWidth={7}>
        <line x1={1520} y1={648} x2={1520} y2={690} />
      </g>
      <g fill={KRP.yellow} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 8))}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={1660 + i * 10} cy={330 - i * 30} r={10 - i * 2} />
        ))}
      </g>
      <Maru x={1520} y={255} s={1.0} t={seg(f, 20, 34)} />
      <TagPlate x={1520} y={780} text="毎日" size={44} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// ===== #112 だから上の階が、普通に通える場所になりました。 =====
// 格: 山
// どこ: 現代の高層住宅の32階の廊下。一点透視。両側に住戸の扉、奥は大窓。
// 演出: 章の結び。買い物袋を提げた住人と子どもが、普通に歩いている。
//       窓の外に街が小さく見える。右上に5本柱の装置を貼り、「箱」の柱が立った状態を見せる。
// 動き: 天井の埋込灯がゆらぎ、窓の外の雲が流れる。2人が歩き、袋が揺れる。
//       柱の装置がゆるく揺れ、「箱が立った」の札が出る。
const Kb2cShouMatome: React.FC<{ f: number }> = ({ f }) => {
  // u=0 がカメラ手前、u=1 が廊下の奥。v=0 が天井、v=1 が床。
  const lw = (u: number, v: number): [number, number] => {
    const top = 30 + 140 * u, bot = 1080 - 380 * u;
    return [440 * u, top + (bot - top) * v];
  };
  const rw = (u: number, v: number): [number, number] => {
    const [x, y] = lw(u, v);
    return [W - x, y];
  };
  const quad = (fn: (u: number, v: number) => [number, number],
    u1: number, u2: number, v1: number, v2: number) =>
    [fn(u1, v1), fn(u2, v1), fn(u2, v2), fn(u1, v2)]
      .map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const bag = Math.sin(f / 9) * 5;
  const walk = Math.sin(f / 21) * 16;
  const glow = 0.5 + 0.3 * Math.sin(f / 11);
  return (
    <Frame f={f} seed={652} bg={KRP.cream}>
      {/* ===== 天井 ===== */}
      <polygon points="0,0 1920,0 1480,170 440,170" fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={7} />
      {[[960, 36, 170, 20], [960, 98, 112, 14], [960, 146, 68, 9]].map(([cx, cy, rx, ry], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={BP.lamp} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={cx} cy={cy} rx={rx * 1.4} ry={ry * 2.2} fill={BP.lampGlow} opacity={glow} />
        </g>
      ))}
      {/* ===== 床 ===== */}
      <polygon points="440,700 1480,700 1920,1080 0,1080" fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.45}>
        {[0.2, 0.4, 0.6, 0.8].map((u, i) => (
          <line key={i} x1={440 + 1040 * u} y1={700} x2={1920 * u} y2={1080} />
        ))}
        <line x1={240} y1={880} x2={1680} y2={880} strokeWidth={5} />
      </g>
      {/* 床の映り込み (灯り) */}
      <polygon points="820,702 1100,702 1220,1080 700,1080" fill={BP.lampGlow} opacity={0.2} />
      {/* ===== 左の壁と住戸の扉 ===== */}
      <polygon points={quad(lw, 0, 1, 0, 1)} fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
      {[[0.04, 0.3], [0.42, 0.66], [0.76, 0.97]].map(([u1, u2], i) => (
        <g key={i}>
          <polygon points={quad(lw, u1, u2, 0.14, 0.93)} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
          <polygon points={quad(lw, u1 + 0.02, u2 - 0.02, 0.2, 0.86)} fill={BP.woodLight}
            stroke={BP.woodDark} strokeWidth={4} />
          <circle cx={lw(u2 - 0.04, 0.56)[0]} cy={lw(u2 - 0.04, 0.56)[1]} r={11 - i * 2}
            fill={BP.brassLight} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 壁の廻り縁 */}
      <g stroke={KRP.ink} strokeWidth={5}>
        <line x1={lw(0, 0.98)[0]} y1={lw(0, 0.98)[1]} x2={lw(1, 0.98)[0]} y2={lw(1, 0.98)[1]}
          stroke={BP.slabDark} strokeWidth={18} />
      </g>
      {/* ===== 右の壁 (奥側だけ扉。手前は装置の札を貼る) ===== */}
      <polygon points={quad(rw, 0, 1, 0, 1)} fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
      {[[0.5, 0.74], [0.82, 0.99]].map(([u1, u2], i) => (
        <g key={i}>
          <polygon points={quad(rw, u1, u2, 0.14, 0.93)} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
          <polygon points={quad(rw, u1 + 0.02, u2 - 0.02, 0.2, 0.86)} fill={BP.woodLight}
            stroke={BP.woodDark} strokeWidth={4} />
        </g>
      ))}
      <line x1={rw(0, 0.98)[0]} y1={rw(0, 0.98)[1]} x2={rw(1, 0.98)[0]} y2={rw(1, 0.98)[1]}
        stroke={BP.slabDark} strokeWidth={18} />
      {/* ===== 奥の壁と大窓 ===== */}
      <rect x={440} y={170} width={1040} height={530} fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={7} />
      <rect x={500} y={226} width={920} height={404} fill={C.skyHaze} stroke={KRP.ink} strokeWidth={8} />
      {/* 窓の外: 流れる雲 */}
      <g fill={KRP.white} opacity={0.8}>
        {[0, 1].map((i) => {
          const cx = 540 + ((f * 0.9 + i * 460) % 980);
          return (
            <g key={i}>
              <ellipse cx={cx} cy={300 + i * 54} rx={92} ry={26} />
              <ellipse cx={cx + 56} cy={288 + i * 54} rx={60} ry={22} />
            </g>
          );
        })}
      </g>
      {/* 窓の外: 小さく見える街 */}
      <g fill={C.cityFar} stroke={KRP.ink} strokeWidth={3} opacity={0.72}>
        {Array.from({ length: 13 }, (_, i) => {
          const bx = 510 + i * 70;
          const bh = 36 + rnd(i + 4) * 74;
          return <rect key={i} x={bx} y={626 - bh} width={52} height={bh} />;
        })}
      </g>
      <line x1={500} y1={626} x2={1420} y2={626} stroke={C.cityFar} strokeWidth={8} opacity={0.8} />
      {/* 窓の方立て */}
      <g stroke={KRP.ink} strokeWidth={9}>
        <line x1={806} y1={226} x2={806} y2={630} />
        <line x1={1114} y1={226} x2={1114} y2={630} />
        <line x1={500} y1={412} x2={1420} y2={412} strokeWidth={7} />
      </g>
      <rect x={500} y={630} width={920} height={26} fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      {/* ===== 人 ===== */}
      {/* 奥を歩いていく人 */}
      <ellipse cx={606} cy={706} rx={28} ry={8} fill={KRP.ink} opacity={0.22} />
      <Person x={606} y={704} s={0.34} cloth="#55637A" clothDark="#3E4A5E"
        hair="cap" lean={2} f={f} phase={5} />
      {/* 買い物袋を提げた住人 */}
      <g transform={`translate(${walk} 0)`}>
        <ellipse cx={826} cy={790} rx={76} ry={18} fill={KRP.ink} opacity={0.22} />
        <Person x={826} y={786} s={0.72} cloth="#7A6A96" clothDark="#5B4E73"
          hair="cap" lean={-2} f={f} phase={1} />
        {/* 左手の紙袋 (葱が覗く) */}
        <g transform={`rotate(${bag} 778 740)`}>
          <rect x={736} y={740} width={84} height={96} rx={6} fill={BP.paper}
            stroke={KRP.ink} strokeWidth={6} />
          <path d="M 748 740 q 14 -24 30 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.green} strokeWidth={9} strokeLinecap="round">
            <line x1={790} y1={742} x2={806} y2={686} />
            <line x1={798} y1={742} x2={822} y2={700} />
          </g>
        </g>
        {/* 右手の袋 */}
        <g transform={`rotate(${-bag} 886 744)`}>
          <rect x={860} y={744} width={78} height={86} rx={6} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={6} />
          <path d="M 874 744 q 14 -22 30 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 子ども */}
      <g transform={`translate(${-walk * 0.6} 0)`}>
        <ellipse cx={1046} cy={798} rx={52} ry={13} fill={KRP.ink} opacity={0.22} />
        <Person x={1046} y={794} s={0.46} cloth={KRP.orange} clothDark={C.brickDark}
          hair="cap" lean={4} f={f} phase={7} />
      </g>
      {/* ===== 5本柱の装置 (右上に貼った図) ===== */}
      <g>
        <rect x={1412} y={182} width={484} height={366} rx={14}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={8} opacity={0.96} />
        <rect x={1428} y={198} width={452} height={334} rx={10}
          fill={KRP.cream} stroke={BP.shaftDark} strokeWidth={4} />
        <g transform="translate(1289 153) scale(0.38)">
          <TowerOnPillars f={f} standing={["hako"]} dimmed={["mizu", "akari", "kuuki"]}
            labels={false} shake={0.12} tiltScale={0.3} />
        </g>
        <TagPlate x={1654} y={498} text="箱が立った" size={32} t={seg(f, 20, 36)} color={KRP.red} />
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={238} y={262} text="32F" size={48} t={seg(f, 4, 18)} />
      <TagPlate x={1222} y={560} text="地上120m" size={32} t={seg(f, 12, 28)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb2_hito_ga_kieta: (f) => <Kb2cHitoGaKieta f={f} />,
  kb2_sokudo_chousei: (f) => <Kb2cSokudoChousei f={f} />,
  kb2_namerakani: (f) => <Kb2cNamerakani f={f} />,
  kb2_nandai_matomete: (f) => <Kb2cNandaiMatomete f={f} />,
  kb2_dono_kago: (f) => <Kb2cDonoKago f={f} />,
  kb2_asa_no_konzatsu: (f) => <Kb2cAsaNoKonzatsu f={f} />,
  kb2_soko_made_kangaete: (f) => <Kb2cSokoMadeKangaete f={f} />,
  kb2_1byou_10m: (f) => <Kb2c1byou10m f={f} />,
  kb2_jishin_saiyose: (f) => <Kb2cJishinSaiyose f={f} />,
  kb2_mittsu_no_fuda: (f) => <Kb2cMittsuNoFuda f={f} />,
  kb2_shou_matome: (f) => <Kb2cShouMatome f={f} />,
};

export const K_B2C_MOTIFS: string[] = [
  "kb2_hito_ga_kieta",       // #102 ここで、箱から人が消えました。
  "kb2_sokudo_chousei",      // #103 さらに、モーターの速度が細かく調整されます。
  "kb2_namerakani",          // #104 発進も停止も、なめらかになりました。
  "kb2_nandai_matomete",     // #105 いまは、何台もまとめて制御されています。
  "kb2_dono_kago",           // #106 どのかごを行かせれば、待ち時間が短いか。
  "kb2_asa_no_konzatsu",     // #107 朝の混雑を、どう捌けば大勢を運べるか。
  "kb2_soko_made_kangaete",  // #108 そこまで考えて、動いています。
  "kb2_1byou_10m",           // #109 速いものは、1秒で10メートル以上登ります。
  "kb2_jishin_saiyose",      // #110 地震を感じると、自分で最寄りの階に止まります。
  "kb2_mittsu_no_fuda",      // #111 安全に乗れて、高くまで行けて、毎日使える。
  "kb2_shou_matome",         // #112 だから上の階が、普通に通える場所になりました。
];

export const kosoB2cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
