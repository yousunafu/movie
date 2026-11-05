// 「なぜ高層ビルは生まれたのか」: 第6章「高いほど、安い部屋だった。」2 (水が上がらない〜つらさだけ消えた)
// 担当範囲: 台本 docs/koso-script-v7.txt の 229〜239行目 (文#228〜#238・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb6_ で始める。WobbleDefs の seed はこのファイルでは 861〜871 を使う。
// 設計書: docs/koso-ch6-design.md (1文ごとの「格」と絵の中身が決まっている)
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
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  stone: "#E0D6C2",
  stoneDark: "#B6A88E",
  zinc: "#A9B0B4",
  zincDark: "#7B8488",
  amber: "#C9A06A",
  candle: "#F0C971",
  night: "#2B3A4A",
  nightPale: "#4C6076",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  rain: "#8FA3B2",
  mudWater: "#6E7257",
  emerGreen: "#4FA06A",
  dark: "#39414B",
};

// ===================================================================
// シーン本体
// ===================================================================

// ===================================================================
// このファイルだけのローカル部品
// ===================================================================

/**
 * 19世紀パリのアパートの正面 (石のクリーム・鉄のバルコニー・亜鉛のマンサード屋根)。
 * KosoB6.tsx の #217/#218 (PariFacade / SectionShell) と同じ作りにそろえてある。
 *   slabs     = 下から順の床の高さ。いちばん上は屋根裏の床 (= 軒の高さ)
 *   roofApexY = マンサード屋根の平らな頂
 * 電灯・エアコン・ガラスのカーテンウォールは置かない (明かりは蝋燭だけ)。
 */
const Kb6bSection: React.FC<{
  x: number; w: number; slabs: number[]; roofApexY: number; f: number;
}> = ({ x, w, slabs, roofApexY, f }) => {
  const top = slabs[slabs.length - 1];   // 軒 = 屋根裏の床
  const bot = slabs[0] + 30;             // 足元
  const eave = top - 26;                 // 軒蛇腹の下端
  const nFloor = slabs.length - 1;
  const winX = [0.17, 0.5, 0.83].map((u) => x + w * u);
  const WW = 54;                                        // 窓の幅 (パリの窓は縦長・細い)
  const hRatio = [0.66, 0.64, 0.62, 0.59, 0.56, 0.53, 0.5];
  // 煙突 (屋根の高さが場面で違うので、はみ出さないように詰める)
  const chimBase = roofApexY + 10;
  const chimH = Math.min(88, Math.max(30, chimBase - 36));
  return (
    <g>
      {/* ===== 石の壁 (クリーム色の切石) ===== */}
      <rect x={x} y={eave} width={w} height={bot - eave} fill={C.stone}
        stroke={KRP.ink} strokeWidth={8} />
      {/* 石積みの目地 (細かく・浅く) */}
      <g stroke={C.stoneDark} strokeWidth={2.5} opacity={0.7}>
        {Array.from({ length: Math.floor((bot - eave) / 34) }, (_, i) => (
          <line key={i} x1={x + 5} y1={eave + (i + 1) * 34} x2={x + w - 5} y2={eave + (i + 1) * 34} />
        ))}
      </g>
      {/* 隅の石 (チェーン) */}
      <g>
        {Array.from({ length: Math.floor((bot - eave) / 68) }, (_, i) => (
          <g key={i}>
            <rect x={x} y={eave + i * 68} width={34} height={34} fill={C.stoneDark}
              stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
            <rect x={x + w - 34} y={eave + i * 68} width={34} height={34} fill={C.stoneDark}
              stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
          </g>
        ))}
      </g>

      {/* ===== 各階 ===== */}
      {slabs.slice(0, -1).map((sy, i) => {
        const storyH = slabs[i + 1] !== undefined ? sy - slabs[i + 1] : 100;
        const h = Math.max(34, storyH * (hRatio[i] ?? 0.5));
        const wy = sy - 22 - h;                      // 窓の上端
        const lit = i === nFloor - 1;                // 最上階だけ蝋燭がともる
        const balcony = i === 1 || i === nFloor - 2; // 2階と最上階の一つ下は通しのバルコニー
        if (i === 0) {
          // 1階 = 店。木の建具と飴色の日除け (#218 と同じ作り)
          return (
            <g key="shop">
              <rect x={x + 18} y={sy - h - 24} width={w - 36} height={h + 24}
                fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
              <rect x={x + 40} y={sy - h - 4} width={(w - 80) * 0.52} height={h - 10}
                fill={C.dark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={x + w - 40 - (w - 80) * 0.34} y={sy - h - 4} width={(w - 80) * 0.34} height={h - 10}
                fill={C.dark} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M${x + 10} ${sy - h - 24} L${x + w - 10} ${sy - h - 24}
                        L${x + w - 34} ${sy - h - 66} L${x + 34} ${sy - h - 66} Z`}
                fill={C.goldDark} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
              <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>
                {[0.25, 0.5, 0.75].map((u, k) => (
                  <line key={k} x1={lerp(x + 10, x + w - 10, u)} y1={sy - h - 24}
                    x2={lerp(x + 34, x + w - 34, u)} y2={sy - h - 66} />
                ))}
              </g>
            </g>
          );
        }
        return (
          <g key={`fl${i}`}>
            {winX.map((wx, k) => (
              <g key={k}>
                {/* まぐさ (窓の上の石) */}
                <rect x={wx - WW / 2 - 10} y={wy - 13} width={WW + 20} height={13} rx={3}
                  fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
                {/* 窓 (奥は暗い。上のほうだけ空がうつる) */}
                <rect x={wx - WW / 2} y={wy} width={WW} height={h} rx={3}
                  fill={lit ? C.candle : C.dark} stroke={KRP.ink} strokeWidth={4.5}
                  opacity={lit ? 0.62 + Math.sin((f + k * 8) / 9) * 0.14 : 1} />
                {!lit && (
                  <rect x={wx - WW / 2} y={wy} width={WW} height={h * 0.38} rx={3}
                    fill={KRP.blueSoft} opacity={0.7} />
                )}
                {/* 木の桟 (観音開き) */}
                <line x1={wx} y1={wy} x2={wx} y2={wy + h} stroke={KRP.ink} strokeWidth={3.5} />
                <line x1={wx - WW / 2} y1={wy + h * 0.44} x2={wx + WW / 2} y2={wy + h * 0.44}
                  stroke={KRP.ink} strokeWidth={2.5} opacity={0.75} />
                {/* 窓台 */}
                <rect x={wx - WW / 2 - 8} y={wy + h} width={WW + 16} height={10} rx={3}
                  fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
                {/* 通しのバルコニーがない階は、窓ごとの小さな鉄の手摺 */}
                {!balcony && (
                  <g stroke={BP.iron} strokeWidth={3.5}>
                    {[0, 1, 2, 3, 4].map((b) => (
                      <line key={b} x1={wx - 24 + b * 12} y1={wy + h + 10}
                        x2={wx - 24 + b * 12} y2={wy + h + 30} />
                    ))}
                    <line x1={wx - 31} y1={wy + h + 30} x2={wx + 31} y2={wy + h + 30}
                      stroke={KRP.ink} strokeWidth={5} />
                  </g>
                )}
              </g>
            ))}
            {/* 通しの鉄のバルコニー */}
            {balcony && (
              <g>
                <rect x={x - 12} y={sy - 18} width={w + 24} height={11}
                  fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
                <g stroke={BP.iron} strokeWidth={4.5}>
                  {Array.from({ length: Math.floor(w / 17) }, (_, b) => (
                    <line key={b} x1={x - 4 + b * 17} y1={sy - 18} x2={x - 4 + b * 17} y2={sy - 54} />
                  ))}
                </g>
                <rect x={x - 12} y={sy - 64} width={w + 24} height={12} rx={5}
                  fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
              </g>
            )}
          </g>
        );
      })}

      {/* ===== 階の境の石の帯 (床の高さ = ここ) ===== */}
      {slabs.slice(0, -1).map((sy, i) => (
        <rect key={`bd${i}`} x={x - 10} y={sy} width={w + 20} height={15} rx={4}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
      ))}

      {/* ===== 軒蛇腹 (持ち送りつき) ===== */}
      <g>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={x + 18 + i * ((w - 48) / 8)} y={eave} width={20} height={19} rx={3}
            fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
      </g>
      <rect x={x - 20} y={eave - 30} width={w + 40} height={30} rx={5}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={x} y1={eave - 15} x2={x + w} y2={eave - 15} n={7} r={5} fill={C.stone} />

      {/* ===== マンサード屋根 (亜鉛板) ===== */}
      <polygon points={`${x - 18},${eave - 28} ${x + 56},${roofApexY} ${x + w - 56},${roofApexY} ${x + w + 18},${eave - 28}`}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.zincDark} strokeWidth={4} opacity={0.9}>
        {[0.16, 0.32, 0.5, 0.68, 0.84].map((u, k) => (
          <line key={k} x1={lerp(x - 18, x + w + 18, u)} y1={eave - 28}
            x2={lerp(x + 56, x + w - 56, u)} y2={roofApexY} />
        ))}
      </g>
      {/* 棟 */}
      <rect x={x + 48} y={roofApexY - 11} width={w - 96} height={13} rx={4}
        fill={C.zincDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 屋根窓 (ルカルヌ) = 屋根裏の窓 */}
      {[0.32, 0.68].map((u, k) => {
        const cx = x + w * u;
        const dh = Math.max(28, Math.min(62, (eave - 28 - roofApexY) * 0.52));
        const dy = roofApexY + (eave - 28 - roofApexY) * 0.28;
        return (
          <g key={k}>
            <rect x={cx - 33} y={dy} width={66} height={dh} rx={3}
              fill={C.candle} stroke={KRP.ink} strokeWidth={4.5}
              opacity={0.5 + Math.sin((f + k * 13) / 11) * 0.12} />
            <line x1={cx} y1={dy} x2={cx} y2={dy + dh} stroke={KRP.ink} strokeWidth={3.5} />
            <path d={`M${cx - 42} ${dy} Q${cx} ${dy - 30} ${cx + 42} ${dy} Z`}
              fill={C.zincDark} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        );
      })}
      {/* 煙突 + 煙突壺 */}
      <rect x={x + w - 148} y={chimBase - chimH} width={64} height={chimH}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + w - 141 + i * 20} y={chimBase - chimH - 22} width={15} height={24} rx={4}
          fill={C.amber} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <ellipse cx={x + w - 116} cy={chimBase - chimH - 44 - ((f * 1.6) % 40)} rx={16} ry={11}
        fill={KRP.gray} opacity={0.3} />
    </g>
  );
};

// ===== #228 水道は、そこまで上がってきません。 =====
// 格: 図
// どこ: 方眼の図面の上。左に水道の立管、右に建物の断面
// 演出: 管の水位は2階で止まり、その上の区間は赤いハッチと×で「来ない」
// 動き: 水位が f=3〜24 で上がって止まる。水面が揺れ、×が f=26〜40 で押される
// 絵: 縦の管。水位が下のほうで止まり、屋根裏の高さには届かない。届かない区間に×
const Kb6bMizuWaAgaranai: React.FC<{ f: number }> = ({ f }) => {
  const PX = 556, PW = 172;          // 立管の左端と太さ
  const Y_BOT = 884, Y_TOP = 150;
  const GY = 818;                    // 通りの高さ
  const STOP_Y = 700;                // 水が止まる高さ (= 2階の床)
  const rise = easeOut(clamp01(seg(f, 3, 24)));
  const wy = lerp(Y_BOT - 26, STOP_Y, rise);    // 水面の高さ
  const rip = Math.sin(f / 6.5) * 5;
  // ★札がぜんぶ字幕帯 (上端854) の上に収まるよう、建物を縮めて上へ寄せてある
  const slabs = [800, 702, 608, 518, 432, 350, 272];
  // 屋根裏だけは床ではなく屋根窓の高さを指す
  const labelY = [800, 702, 608, 518, 432, 350, 172];
  const names = ["1階", "2階", "3階", "4階", "5階", "6階", "屋根裏"];
  const nHatch = Math.max(1, Math.ceil((wy - Y_TOP) / 48));
  return (
    <Frame f={f} seed={861} bg={KRP.cream}>
      <GridPaper />
      {/* 通り (舗石) */}
      <rect x={0} y={GY} width={W} height={H - GY} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.28}>
        {Array.from({ length: 19 }, (_, i) => (
          <line key={i} x1={i * 110} y1={GY + 10} x2={i * 110 - 30} y2={H} />
        ))}
        <line x1={0} y1={GY + 42} x2={W} y2={GY + 42} />
      </g>
      <Kb6bSection x={826} w={616} slabs={slabs} roofApexY={120} f={f} />
      {/* 階の名前 */}
      <g fontFamily={FONT} fontWeight={800} fontSize={40} fill={KRP.ink}>
        {labelY.map((ly, i) => (
          <g key={i}>
            <line x1={1452} y1={ly} x2={1512} y2={ly} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={1452} cy={ly} r={8} fill={KRP.ink} />
            <text x={1526} y={ly + 14}>{names[i]}</text>
          </g>
        ))}
      </g>
      {/* 立管: 外筒 */}
      <rect x={PX} y={Y_TOP} width={PW} height={Y_BOT - Y_TOP} fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={9} />
      {/* 管の中の空 (水が来ていない所) */}
      <rect x={PX + 14} y={Y_TOP + 12} width={PW - 28} height={wy - Y_TOP - 12} fill={BP.shaftDeep} opacity={0.5} />
      {/* 水 */}
      <rect x={PX + 14} y={wy} width={PW - 28} height={Y_BOT - wy - 12} fill={KPP.mizu} />
      <path d={`M ${PX + 14} ${wy + rip} Q ${PX + PW / 2} ${wy - 16 - rip} ${PX + PW - 14} ${wy + rip} L ${PX + PW - 14} ${wy + 30} L ${PX + 14} ${wy + 30} Z`}
        fill={KPP.mizuDark} />
      {/* 継ぎ目のフランジとボルト */}
      {[196, 342, 488, 634, 780].map((fy) => (
        <g key={fy}>
          <rect x={PX - 22} y={fy} width={PW + 44} height={34} rx={6}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
          <HexBolt x={PX - 4} y={fy + 17} r={11} />
          <HexBolt x={PX + PW + 4} y={fy + 17} r={11} />
        </g>
      ))}
      {/* 届かない区間のハッチ */}
      <g opacity={0.34 * easeOut(clamp01(seg(f, 20, 36)))}>
        {Array.from({ length: nHatch }, (_, i) => (
          <line key={i} x1={PX + 10} y1={Y_TOP + 20 + i * 48} x2={PX + PW - 10} y2={Y_TOP - 28 + i * 48}
            stroke={KRP.red} strokeWidth={12} />
        ))}
      </g>
      {/* 水面を止める赤い線 (2階の札までまっすぐ引く) */}
      <line x1={PX - 34} y1={wy} x2={1446} y2={wy} stroke={KRP.red} strokeWidth={7}
        strokeDasharray="22 16" opacity={easeOut(clamp01(seg(f, 22, 34)))} />
      <rect x={PX - 34} y={wy - 9} width={PW + 68} height={18} rx={6} fill={KRP.red}
        stroke={KRP.ink} strokeWidth={5} opacity={easeOut(clamp01(seg(f, 22, 32)))} />
      <ForceArrow x={PX + PW / 2} y={wy + 126} len={110} rot={-90} w={26}
        color={KPP.mizuDark} t={seg(f, 6, 22)} />
      <XMark x={PX + PW / 2} y={330} s={2.1} t={seg(f, 26, 40)} />
      <TagPlate x={300} y={186} text="水道の立管" size={52} t={seg(f, 2, 14)} />
      <TagPlate x={322} y={400} text="来ない" size={54} t={seg(f, 30, 42)} color={KRP.red} />
      <TagPlate x={286} y={700} text="ここで止まる" size={40} t={seg(f, 24, 36)} color={KRP.red} />
    </Frame>
  );
};

/** 木の桶 (原点 = 桶の上縁の中央)。tilt で中の水が傾く */
const Kb6bBucket: React.FC<{ s?: number; tilt?: number }> = ({ s = 1, tilt = 0 }) => (
  <g transform={`scale(${s})`}>
    {/* 吊り手 */}
    <path d="M -54 -4 Q 0 -78 54 -4" fill="none" stroke={BP.ironDark} strokeWidth={9} />
    {/* 胴 */}
    <path d="M -62 0 L 62 0 L 48 112 L -48 112 Z" fill={BP.wood}
      stroke={KRP.ink} strokeWidth={7} />
    {/* 板目 */}
    <g stroke={BP.woodDark} strokeWidth={4} opacity={0.8}>
      <line x1={-30} y1={4} x2={-24} y2={108} />
      <line x1={0} y1={4} x2={0} y2={108} />
      <line x1={30} y1={4} x2={24} y2={108} />
    </g>
    {/* たが (鉄の輪) */}
    <rect x={-60} y={24} width={120} height={13} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-54} y={82} width={108} height={13} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 水面 */}
    <g transform={`rotate(${tilt})`}>
      <ellipse cx={0} cy={18} rx={56} ry={14} fill={KPP.mizu} stroke={KPP.mizuDark} strokeWidth={5} />
      <ellipse cx={-16} cy={14} rx={18} ry={5} fill={KRP.white} opacity={0.5} />
    </g>
  </g>
);

/** 濡れた石畳 (原点なし・絶対座標)。rows 行ぶん敷く */
const Kb6bCobbles: React.FC<{ yTop: number; rows?: number }> = ({ yTop, rows = 6 }) => (
  <g>
    <rect x={0} y={yTop} width={W} height={H - yTop} fill={C.stoneDark}
      stroke={KRP.ink} strokeWidth={7} />
    {Array.from({ length: rows }, (_, r) => {
      const y = yTop + 18 + r * ((H - yTop) / rows);
      const hh = 26 + r * 7;
      const pitch = 92 + r * 16;
      const n = Math.ceil(W / pitch) + 1;
      return (
        <g key={r}>
          {Array.from({ length: n }, (_, i) => {
            const x = i * pitch + (r % 2 ? pitch * 0.5 : 0) - 20;
            const wet = rnd(r * 31 + i * 7) > 0.62;
            return (
              <g key={i}>
                <rect x={x} y={y} width={pitch - 12} height={hh} rx={hh * 0.42}
                  fill={wet ? C.zincDark : C.stone} stroke={KRP.ink} strokeWidth={4}
                  opacity={wet ? 0.92 : 1} />
                {wet && (
                  <ellipse cx={x + pitch * 0.3} cy={y + hh * 0.3} rx={pitch * 0.18} ry={hh * 0.14}
                    fill={KRP.white} opacity={0.35} />
                )}
              </g>
            );
          })}
        </g>
      );
    })}
  </g>
);

// ===== #229 ちなみにパリには、水運び屋という職業がありました。 =====
// 格: 山
// どこ: パリの石畳の通り。右手にアパートの入口 (アーチの扉)
// 演出: 天秤棒に桶2つを担いだ水運び屋が入口へ歩く。左手前に見ている子ども
// 動き: カメラが f=0〜42 でじわっと寄る。桶が揺れ、水がこぼれて石に落ちる
// 絵: ★石畳の通りから建物の入口へ。天秤棒で桶を担いだ水運び屋。帽子・前掛け・濡れた石・こぼれた水・見ている子ども
const Kb6bMizuhakobiya: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.07, easeOut(clamp01(seg(f, 0, 42))));
  const sw = Math.sin(f / 10) * 3.4;              // 天秤棒の揺れ
  const PFX = 760, PFY = 792, PS = 1.46;          // 水運び屋の足元と大きさ
  const bob = bobOf(f);
  const drop = (f % 34) / 34;                     // こぼれた水の1粒
  return (
    <Frame f={f} seed={862} bg={KRP.cream}>
      <g transform={zoomAt(z, 900, 560)}>
        {/* 空 (通りの奥) */}
        <rect x={0} y={0} width={W} height={420} fill={C.stone} opacity={0.5} />
        {/* 向かいの建物 (奥・薄く) */}
        <g opacity={0.42}>
          <rect x={-20} y={110} width={520} height={560} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
          <polygon points="-40,110 240,24 520,110" fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={40 + i * 150} y={210} width={90} height={150} rx={6}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={6} />
          ))}
        </g>
        {/* 右手のアパート (主舞台) */}
        <rect x={1120} y={60} width={820} height={740} fill={C.stone} stroke={KRP.ink} strokeWidth={9} />
        <g stroke={C.stoneDark} strokeWidth={4} opacity={0.75}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={1128} y1={96 + i * 66} x2={1932} y2={96 + i * 66} />
          ))}
        </g>
        {/* 窓と鉄の手すり */}
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={1700} y={180 + i * 250} width={130} height={190} rx={8}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={7} />
            <line x1={1765} y1={180 + i * 250} x2={1765} y2={370 + i * 250} stroke={KRP.ink} strokeWidth={4} />
            <rect x={1684} y={344 + i * 250} width={162} height={14} fill={BP.ironDark}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 入口のアーチ扉 */}
        <path d="M 1216 800 L 1216 452 Q 1348 338 1480 452 L 1480 800 Z"
          fill={C.amber} stroke={KRP.ink} strokeWidth={10} />
        <g stroke={BP.woodDark} strokeWidth={6} opacity={0.9}>
          <line x1={1348} y1={352} x2={1348} y2={800} />
          <line x1={1252} y1={470} x2={1252} y2={790} />
          <line x1={1444} y1={470} x2={1444} y2={790} />
        </g>
        <circle cx={1312} cy={620} r={17} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1384} cy={620} r={17} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 入口の段 */}
        <rect x={1180} y={792} width={340} height={30} rx={6} fill={C.stone}
          stroke={KRP.ink} strokeWidth={7} />
        {/* 石畳 */}
        <Kb6bCobbles yTop={800} rows={5} />
        {/* こぼれた水だまり */}
        <ellipse cx={960} cy={884} rx={168} ry={34} fill={KPP.mizu} opacity={0.55} />
        <ellipse cx={960} cy={880} rx={116 + Math.sin(f / 8) * 10} ry={21} fill="none"
          stroke={KRP.white} strokeWidth={5} opacity={0.5} />
        {/* 落ちる水の粒 */}
        <ellipse cx={1004} cy={700 + drop * 170} rx={9} ry={15 + drop * 10} fill={KPP.mizu}
          stroke={KPP.mizuDark} strokeWidth={3} />
        {/* 見ている子ども */}
        <Person x={246} y={866} s={0.92} f={f} phase={2} cloth={C.amber} clothDark={BP.woodDark}
          face="surprised" gaze={[1, 0]} />
        {/* 水運び屋 */}
        <Person x={PFX} y={PFY} s={PS} f={f} cloth={C.night} clothDark={"#1E2A36"}
          face="normal" gaze={[1, 0]} lean={-3} />
        {/* 前掛け */}
        <g transform={`translate(${PFX} ${PFY + bob})`}>
          <path d="M -72 -248 L 74 -248 L 92 -92 L -88 -92 Z" fill={C.stone}
            stroke={KRP.ink} strokeWidth={7} />
          <line x1={-72} y1={-248} x2={-110} y2={-276} stroke={KRP.ink} strokeWidth={6} />
          <line x1={74} y1={-248} x2={112} y2={-276} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.stoneDark} strokeWidth={4} opacity={0.8}>
            <line x1={-40} y1={-234} x2={-52} y2={-104} />
            <line x1={28} y1={-234} x2={38} y2={-104} />
          </g>
        </g>
        {/* 帽子 (鳥打ち帽) */}
        <g transform={`translate(${PFX} ${PFY + bob})`}>
          <path d="M -58 -404 Q 0 -452 58 -404 L 58 -392 L -58 -392 Z" fill={C.night}
            stroke={KRP.ink} strokeWidth={6} />
          <path d="M 54 -396 L 112 -386 L 110 -372 L 52 -384 Z" fill={"#1E2A36"}
            stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 天秤棒と桶 */}
        <g transform={`translate(${PFX} ${PFY + bob}) rotate(${sw})`}>
          <rect x={-316} y={-312} width={632} height={26} rx={12} fill={C.amber}
            stroke={KRP.ink} strokeWidth={7} />
          <g stroke={BP.woodDark} strokeWidth={4} opacity={0.85}>
            <line x1={-290} y1={-300} x2={290} y2={-300} />
          </g>
          {/* 肩当て */}
          <rect x={-44} y={-320} width={88} height={42} rx={10} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={6} />
          {[-1, 1].map((sg) => (
            <g key={sg}>
              <Rope x1={sg * 268} y1={-290} x2={sg * 268} y2={-160} w={13} kind="hemp" f={f} />
              <g transform={`translate(${sg * 268} -160)`}>
                <Kb6bBucket s={1.12} tilt={-sw * 0.8} />
              </g>
            </g>
          ))}
        </g>
      </g>
      <TagPlate x={398} y={236} text="水運び屋" size={60} t={seg(f, 4, 18)} />
      <TagPlate x={1086} y={420} text="天秤棒" size={38} t={seg(f, 16, 28)} />
      <TagPlate x={462} y={704} text="桶" size={40} t={seg(f, 22, 34)} />
      <TagPlate x={1636} y={716} text="アパートの入口" size={34} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ===== #230 水を担いで階段を登るのが、仕事です。 =====
// 格: 並
// どこ: アパートの螺旋階段。下から見上げる
// 演出: 中心の親柱のまわりに踏み板が渦を巻いて上がる。桶を担いだ背中が奥へ登る
// 動き: f=2〜40 で背中が一段ずつ上がり、渦が少し回る。桶が揺れ、壁の影が動く
// 絵: 螺旋階段を下から見上げる構図。桶を担いで登る背中。踏み板・手すり・壁の影
const Kb6bKaidanWoNoboru: React.FC<{ f: number }> = ({ f }) => {
  const CX = 940, K = 0.42;
  const climb = easeOut(clamp01(seg(f, 2, 40)));
  const spin = climb * 9;
  const N = 16;
  const geom = (i: number) => {
    const a = ((i * 31 + 206 + spin) * Math.PI) / 180;
    const a2 = ((i * 31 + 206 + spin + 27) * Math.PI) / 180;
    const r = 536 - i * 24;
    const yc = 926 - i * 50;
    return { a, a2, r, yc };
  };
  const quad = (i: number, ro: number, ri: number, dy: number) => {
    const { a, a2, yc } = geom(i);
    const p = (ang: number, rr: number) =>
      `${(CX + Math.cos(ang) * rr).toFixed(1)},${(yc + Math.sin(ang) * rr * K + dy).toFixed(1)}`;
    return `${p(a, ri)} ${p(a, ro)} ${p(a2, ro)} ${p(a2, ri)}`;
  };
  // 背中の位置 (渦の上を登る)
  const bi = 2.4 + climb * 4.2;
  const bg0 = geom(Math.round(bi));
  const ba = ((Math.round(bi) * 31 + 206 + spin + 13) * Math.PI) / 180;
  const bx = CX + Math.cos(ba) * bg0.r * 0.74;
  const by = bg0.yc + Math.sin(ba) * bg0.r * 0.74 * K - 18;
  const bs = lerp(1.3, 1.04, climb);
  const step = Math.sin(f / 5.5) * 7;
  return (
    <Frame f={f} seed={863} bg={KRP.cream}>
      {/* 吹き抜けの壁 (漆喰) と影 */}
      <rect x={0} y={0} width={W} height={H} fill={BP.shaft} />
      <g opacity={0.5}>
        <rect x={0} y={0} width={300} height={H} fill={BP.shaftDeep} opacity={0.45} />
        <rect x={1660} y={0} width={260} height={H} fill={BP.shaftDeep} opacity={0.4} />
      </g>
      {/* 壁の石の目地 */}
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.55}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={0} y1={60 + i * 78} x2={W} y2={30 + i * 78} />
        ))}
      </g>
      {/* 動く壁の影 */}
      <ellipse cx={1500 - climb * 120} cy={560} rx={300} ry={420}
        fill={BP.shaftDeep} opacity={0.22} />
      {/* 上の明かり (最上階の窓) */}
      <ellipse cx={CX} cy={118} rx={236} ry={104} fill={C.candle} opacity={0.42} />
      <ellipse cx={CX} cy={118} rx={150} ry={64} fill={KRP.white} opacity={0.5} />
      {/* 親柱 */}
      <path d={`M ${CX - 44} 962 L ${CX + 44} 962 L ${CX + 17} 150 L ${CX - 17} 150 Z`}
        fill={C.amber} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.8}>
        <line x1={CX - 14} y1={940} x2={CX - 6} y2={170} />
        <line x1={CX + 16} y1={940} x2={CX + 7} y2={170} />
      </g>
      {/* 踏み板 (奥=番号が大きい方から描く) */}
      {Array.from({ length: N }, (_, k) => {
        const i = N - 1 - k;
        const { r } = geom(i);
        const sh = 1 - i / (N + 3);
        return (
          <g key={i}>
            {/* 蹴込み (板の裏) */}
            <polygon points={quad(i, r, r * 0.2, 26)} fill={BP.woodDark}
              stroke={KRP.ink} strokeWidth={5} opacity={0.5 + sh * 0.4} />
            {/* 踏み面 */}
            <polygon points={quad(i, r, r * 0.2, 0)} fill={C.amber}
              stroke={KRP.ink} strokeWidth={6} opacity={0.45 + sh * 0.55} />
          </g>
        );
      })}
      {/* 手すり (渦の外側を上がる) */}
      <polyline
        points={Array.from({ length: N * 2 }, (_, j) => {
          const i = j / 2;
          const a = ((i * 31 + 196 + spin) * Math.PI) / 180;
          const r = (470 - i * 21) * 1.02;
          const yc = 952 - i * 47 - 108;
          return `${(CX + Math.cos(a) * r).toFixed(1)},${(yc + Math.sin(a) * r * K).toFixed(1)}`;
        }).join(" ")}
        fill="none" stroke={BP.ironDark} strokeWidth={13} strokeLinecap="round" />
      {/* 手すりの子柱 */}
      {Array.from({ length: N }, (_, i) => {
        const { a, r, yc } = geom(i);
        const x = CX + Math.cos(a) * r * 1.0;
        const y0 = yc + Math.sin(a) * r * K;
        return (
          <line key={i} x1={x} y1={y0} x2={CX + Math.cos(a) * r * 1.02} y2={y0 - 108}
            stroke={BP.ironDark} strokeWidth={6} opacity={0.5 + (1 - i / N) * 0.5} />
        );
      })}
      {/* 桶を担いで登る背中 */}
      <g transform={`translate(${bx} ${by + step}) scale(${bs})`}>
        {/* 天秤棒と桶 */}
        <g transform={`rotate(${Math.sin(f / 9) * 4})`}>
          <rect x={-212} y={-258} width={424} height={22} rx={10} fill={C.amber}
            stroke={KRP.ink} strokeWidth={6} />
          {[-1, 1].map((sg) => (
            <g key={sg}>
              <Rope x1={sg * 176} y1={-240} x2={sg * 176} y2={-144} w={11} kind="hemp" f={f} />
              <g transform={`translate(${sg * 176} -144)`}>
                <Kb6bBucket s={0.9} tilt={-Math.sin(f / 9) * 3} />
              </g>
            </g>
          ))}
        </g>
        {/* 脚 (段に乗っている・前の脚が上) */}
        <path d="M -46 -108 L -6 -108 L -4 -14 L -48 -14 Z" fill={"#1E2A36"} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 10 -108 L 50 -108 L 58 -44 L 14 -44 Z" fill={C.night} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-56} y={-20} width={60} height={22} rx={8} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={8} y={-50} width={60} height={22} rx={8} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 背中 (前かがみ) */}
        <path d="M -74 -248 Q -96 -164 -66 -102 L 66 -102 Q 92 -170 70 -248 Z"
          fill={C.night} stroke={KRP.ink} strokeWidth={7} />
        {/* 背中のしわ */}
        <g stroke={"#1E2A36"} strokeWidth={5} opacity={0.9}>
          <path d="M -54 -220 Q 0 -200 54 -222" fill="none" />
          <path d="M -58 -170 Q 0 -150 58 -172" fill="none" />
        </g>
        {/* 腕 (棒を押さえる) */}
        <path d="M -70 -246 Q -104 -214 -96 -176" fill="none" stroke={KRP.ink} strokeWidth={16} />
        <path d="M 68 -246 Q 102 -214 94 -176" fill="none" stroke={KRP.ink} strokeWidth={16} />
        {/* 後頭部と帽子 */}
        <circle cx={0} cy={-300} r={52} fill={"#5B4A3A"} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -56 -318 Q 0 -364 56 -318 L 56 -304 L -56 -304 Z" fill={C.night}
          stroke={KRP.ink} strokeWidth={6} />
      </g>
      <TagPlate x={296} y={228} text="螺旋階段" size={54} t={seg(f, 3, 16)} />
      <TagPlate x={332} y={624} text="踏み板" size={38} t={seg(f, 18, 30)} />
      <TagPlate x={1618} y={228} text="六階へ" size={44} t={seg(f, 26, 40)} />
      <TagPlate x={1598} y={606} text="手すり" size={36} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// ===== #231 当時も、高さの代金は払われていました。 =====
// 格: 図
// どこ: 方眼の上。真鍮の計器が板に留められている
// 演出: 「高さの代金」の目盛り。針は0から振れ上がり、赤帯の中で止まる
// 動き: f=3〜28 で針が振れ上がり、f=28〜40 で揺れが収まる。赤帯が後から出る
// 絵: 「高さの代金」の目盛り。針が高いところで止まっている。目盛りの板・ねじまで描く
const Kb6bToujiMoDaikin: React.FC<{ f: number }> = ({ f }) => {
  const CXD = 712, CYD = 494, R = 336;
  const swing = easeOut(clamp01(seg(f, 3, 28)));
  const osc = Math.sin((f - 28) / 3.1) * 8 * (1 - clamp01(seg(f, 28, 40)));
  const ang = -120 + 216 * swing + (f > 26 ? osc : 0);
  const pol = (a: number, r: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return [CXD + Math.cos(t) * r, CYD + Math.sin(t) * r] as const;
  };
  return (
    <Frame f={f} seed={864} bg={KRP.cream}>
      <GridPaper />
      {/* 取付け板 (飴色の木) */}
      <rect x={238} y={72} width={948} height={770} rx={16} fill={C.amber}
        stroke={KRP.ink} strokeWidth={9} />
      <rect x={272} y={106} width={880} height={702} rx={12} fill="none"
        stroke={BP.woodDark} strokeWidth={6} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.55}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={246} y1={134 + i * 96} x2={1178} y2={122 + i * 96} />
        ))}
      </g>
      {/* 四隅のねじ */}
      {[[300, 130], [1124, 130], [300, 784], [1124, 784]].map(([sx, sy], i) => (
        <g key={i}>
          <circle cx={sx} cy={sy} r={25} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
          <HexBolt x={sx} y={sy} r={17} rot={i * 14} fill={BP.steel} />
        </g>
      ))}
      {/* 計器の外枠 (真鍮) */}
      <circle cx={CXD} cy={CYD} r={R + 34} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={9} />
      <circle cx={CXD} cy={CYD} r={R + 16} fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={CXD - R - 24} y1={CYD} x2={CXD + R + 24} y2={CYD} n={2} r={10} fill={BP.brassDark} />
      {/* 文字盤 */}
      <circle cx={CXD} cy={CYD} r={R} fill={BP.paper} stroke={KRP.ink} strokeWidth={7} />
      {/* 高い側の赤帯 */}
      <path
        d={`M ${pol(72, R - 30)[0]} ${pol(72, R - 30)[1]} A ${R - 30} ${R - 30} 0 0 1 ${pol(120, R - 30)[0]} ${pol(120, R - 30)[1]}`}
        fill="none" stroke={KRP.red} strokeWidth={30} opacity={0.72 * clamp01(seg(f, 20, 34))} />
      {/* 目盛り */}
      {Array.from({ length: 11 }, (_, i) => {
        const a = -120 + i * 24;
        const p1 = pol(a, R - 18);
        const p2 = pol(a, R - 70);
        const pn = pol(a, R - 118);
        return (
          <g key={i}>
            <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={KRP.ink} strokeWidth={9} />
            <text x={pn[0]} y={pn[1] + 14} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={40} fill={KRP.ink}>{i}</text>
          </g>
        );
      })}
      {/* 細かい刻み */}
      {Array.from({ length: 51 }, (_, i) => {
        const a = -120 + i * 4.8;
        if (i % 5 === 0) return null;
        const p1 = pol(a, R - 18);
        const p2 = pol(a, R - 46);
        return <line key={i} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={KRP.ink} strokeWidth={4} />;
      })}
      {/* 低い/高いの字 */}
      <text x={pol(-120, R - 178)[0]} y={pol(-120, R - 178)[1] + 16} textAnchor="middle"
        fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>低</text>
      <text x={pol(120, R - 178)[0]} y={pol(120, R - 178)[1] + 16} textAnchor="middle"
        fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.red}>高</text>
      {/* 文字盤の銘 (ラベル) */}
      <text x={CXD} y={CYD - 66} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={52} fill={KRP.ink}>高さの代金</text>
      <text x={CXD} y={CYD + 230} textAnchor="middle" fontFamily={FONT} fontWeight={800}
        fontSize={34} fill={BP.woodDark}>PARIS 1860</text>
      {/* 針 */}
      <g transform={`rotate(${ang} ${CXD} ${CYD})`}>
        <polygon
          points={`${CXD},${CYD - R + 44} ${CXD + 17},${CYD + 24} ${CXD},${CYD + 72} ${CXD - 17},${CYD + 24}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      <circle cx={CXD} cy={CYD} r={34} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={CXD} y={CYD} r={17} fill={BP.brassDark} />
      {/* ガラスの映り込み */}
      <path d={`M ${CXD - R * 0.78} ${CYD - R * 0.3} Q ${CXD - R * 0.3} ${CYD - R * 0.86} ${CXD + R * 0.2} ${CYD - R * 0.78}`}
        fill="none" stroke={KRP.white} strokeWidth={22} opacity={0.3} />
      {/* 右の札 */}
      <TagPlate x={1520} y={226} text="高さの代金" size={50} t={seg(f, 2, 14)} />
      <Arrow x={1250} y={226} s={1.1} rot={180} t={seg(f, 12, 22)} />
      <TagPlate x={1520} y={470} text="針" size={48} t={seg(f, 24, 36)} color={KRP.red} />
      <Arrow x={1250} y={470} s={1.1} rot={180} t={seg(f, 30, 40)} />
      <TagPlate x={1520} y={716} text="ねじ" size={42} t={seg(f, 34, 42)} />
      <Arrow x={1252} y={790} s={0.95} rot={160} t={seg(f, 38, 42)} />
    </Frame>
  );
};

/** 住人の脚 (原点 = 靴底の中央・上へ 560 伸びる) */
const Kb6bLeg: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    {/* ももの布 */}
    <path d="M -92 -564 L 86 -564 L 66 -344 L -62 -344 Z" fill={C.night}
      stroke={KRP.ink} strokeWidth={8} />
    {/* 膝 */}
    <path d="M -62 -344 L 66 -344 L 58 -300 L -56 -300 Z" fill={"#1E2A36"}
      stroke={KRP.ink} strokeWidth={7} />
    {/* すね */}
    <path d="M -56 -300 Q -74 -220 -44 -128 L 42 -128 Q 64 -220 58 -300 Z"
      fill={C.night} stroke={KRP.ink} strokeWidth={8} />
    {/* ズボンの折り (裾) */}
    <rect x={-50} y={-144} width={96} height={24} rx={6} fill={"#1E2A36"}
      stroke={KRP.ink} strokeWidth={6} />
    {/* 布のしわ */}
    <g stroke={"#16202B"} strokeWidth={5} opacity={0.85} fill="none">
      <path d="M -70 -500 Q -24 -480 56 -498" />
      <path d="M -62 -430 Q -18 -408 60 -428" />
      <path d="M -62 -252 Q -16 -232 54 -250" />
      <path d="M -52 -196 Q -10 -178 50 -194" />
    </g>
    {/* 靴下 */}
    <rect x={-42} y={-122} width={82} height={44} rx={8} fill={C.stone}
      stroke={KRP.ink} strokeWidth={6} />
    {/* 靴 */}
    <path d="M -46 -80 L 44 -80 Q 72 -74 118 -36 Q 132 -22 126 -8 L -50 -8 Q -62 -40 -46 -80 Z"
      fill={C.amber} stroke={KRP.ink} strokeWidth={8} />
    <rect x={-54} y={-12} width={186} height={22} rx={7} fill={BP.woodDark}
      stroke={KRP.ink} strokeWidth={6} />
    <rect x={-54} y={-34} width={34} height={26} rx={6} fill={BP.woodDark}
      stroke={KRP.ink} strokeWidth={5} />
    {/* 靴紐 */}
    <g stroke={KRP.ink} strokeWidth={5}>
      <line x1={10} y1={-74} x2={42} y2={-56} />
      <line x1={42} y1={-74} x2={10} y2={-56} />
      <line x1={22} y1={-52} x2={54} y2={-36} />
      <line x1={54} y1={-52} x2={22} y2={-36} />
    </g>
  </g>
);

/** 使用人の腕 (原点 = 握りこぶしの下・上へ 548 伸びる) */
const Kb6bArm: React.FC<{ s?: number; bail?: boolean }> = ({ s = 1, bail = true }) => (
  <g transform={`scale(${s})`}>
    {/* 肩から二の腕 (まくった袖) */}
    <path d="M -90 -548 L 88 -548 L 76 -412 L -78 -412 Z" fill={C.stone}
      stroke={KRP.ink} strokeWidth={8} />
    <rect x={-86} y={-424} width={170} height={34} rx={8} fill={C.stoneDark}
      stroke={KRP.ink} strokeWidth={7} />
    {/* 二の腕 (素肌) */}
    <path d="M -74 -390 Q -84 -336 -58 -300 L 58 -300 Q 82 -340 72 -390 Z"
      fill={"#D9A877"} stroke={KRP.ink} strokeWidth={8} />
    {/* 肘 */}
    <path d="M -58 -300 Q -66 -278 -54 -262 L 54 -262 Q 66 -280 58 -300 Z"
      fill={"#C9956A"} stroke={KRP.ink} strokeWidth={7} />
    {/* 前腕 */}
    <path d="M -54 -262 Q -78 -200 -46 -124 L 44 -124 Q 74 -200 54 -262 Z"
      fill={"#D9A877"} stroke={KRP.ink} strokeWidth={8} />
    {/* 筋の線 */}
    <g stroke={"#A97647"} strokeWidth={5} fill="none" opacity={0.9}>
      <path d="M -36 -376 Q -14 -340 -30 -312" />
      <path d="M 30 -376 Q 50 -340 32 -312" />
      <path d="M -30 -240 Q -6 -196 -24 -150" />
      <path d="M 26 -240 Q 44 -196 26 -150" />
    </g>
    {/* 手首 */}
    <rect x={-44} y={-128} width={88} height={26} rx={8} fill={"#C9956A"}
      stroke={KRP.ink} strokeWidth={6} />
    {/* こぶし */}
    <path d="M -56 -102 Q -66 -40 -34 -14 L 40 -14 Q 70 -44 56 -102 Z"
      fill={"#D9A877"} stroke={KRP.ink} strokeWidth={8} />
    {/* 指 4本 */}
    <g stroke={KRP.ink} strokeWidth={6} fill={"#C9956A"}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-48 + i * 26} y={-86 + i * 3} width={24} height={44} rx={11} />
      ))}
    </g>
    {/* 親指 */}
    <path d="M 52 -92 Q 76 -72 60 -44" fill={"#C9956A"} stroke={KRP.ink} strokeWidth={7} />
    {/* 桶の弦 (こぶしを通る) */}
    {bail && (
      <g>
        <path d="M -104 -66 Q 0 -124 104 -66" fill="none" stroke={BP.ironDark} strokeWidth={13} />
        <line x1={-104} y1={-66} x2={-104} y2={-12} stroke={BP.ironDark} strokeWidth={10} />
        <line x1={104} y1={-66} x2={104} y2={-12} stroke={BP.ironDark} strokeWidth={10} />
      </g>
    )}
  </g>
);

/** 代金の印 (赤い丸印)。t で押される */
const Kb6bSeal: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({
  x, y, s = 1, t = 1, rot = -9,
}) => {
  const ap = clamp01(t);
  if (ap <= 0) return null;
  const sc = s * lerp(1.7, 1, easeOut(ap));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`} opacity={ap}>
      <circle cx={0} cy={0} r={74} fill="none" stroke={KRP.red} strokeWidth={13} opacity={0.9} />
      <circle cx={0} cy={0} r={58} fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.75} />
      <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={72} fill={KRP.red} opacity={0.92}>代</text>
    </g>
  );
};

// ===== #232 払っていたのは、住人の脚と、使用人の腕です。 =====
// 格: 図
// どこ: 方眼の上。脚と腕だけを大きく2つ、台に乗せて並べる
// 演出: 「代金」の赤い印が、脚と腕に順に押される
// 動き: 脚 f=16〜26、腕 f=26〜36 で印が押され、f=36〜42 で下の札が出る
// 絵: 脚と腕を大きく2つ並べる。それぞれに札。代金の印がそこに刻まれる
const Kb6bAshiToUde: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={865} bg={KRP.cream}>
    <GridPaper />
    {/* 真ん中の仕切り */}
    <line x1={960} y1={130} x2={960} y2={760} stroke={KRP.ink} strokeWidth={7}
      strokeDasharray="20 16" opacity={0.55} />
    {/* 台 */}
    {[600, 1340].map((cx) => (
      <g key={cx}>
        <rect x={cx - 250} y={690} width={500} height={26} rx={7} fill={BP.slabDark}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={cx - 220} y={716} width={440} height={14} rx={5} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
    {/* 脚 */}
    <g transform="translate(560 690)">
      <Kb6bLeg s={1.16} />
    </g>
    {/* 腕 */}
    <g transform="translate(1340 690)">
      <Kb6bArm s={1.2} />
    </g>
    {/* 代金の印 */}
    <Kb6bSeal x={604} y={204} s={1.22} t={seg(f, 16, 26)} rot={-10} />
    <Kb6bSeal x={1352} y={330} s={1.22} t={seg(f, 26, 36)} rot={8} />
    {/* 札 */}
    <TagPlate x={960} y={160} text="代金" size={56} t={seg(f, 2, 13)} color={KRP.red} />
    <TagPlate x={600} y={778} text="住人の脚" size={46} t={seg(f, 34, 42)} />
    <TagPlate x={1340} y={778} text="使用人の腕" size={46} t={seg(f, 36, 42)} />
  </Frame>
);

// ===== #233 高さは、買うものではなく、払うものでした。 =====
// 格: 山  ★この章の軸
// どこ: パリのアパートの階段室。奥に石の階段、壁に蝋燭の燭台
// 演出: 大きな天秤。左の皿に金貨、右の皿に脚と腕。体の側が沈み、金貨側に×・体の側に○
// 動き: f=8〜32 で竿が体の側へ傾く。蝋燭が揺れ、×と○が後から押される
// 絵: ★軸。大きな天秤。片方の皿に金貨、もう片方に脚と腕。金貨側に×、体の側に○。パリの階段を背景に
const Kb6bHarauMono: React.FC<{ f: number }> = ({ f }) => {
  const BX = 960, BY = 240, BS = 0.92, DROP = 300, SPAN = 700;
  // ★軸の絵。傾きが浅いと「つり合っている」に見えるので、はっきり倒す (22度)
  const tilt = 22 * easeOut(clamp01(seg(f, 8, 32)));
  const sway = Math.sin(f / 23) * 0.6;
  const th = ((tilt + sway) * Math.PI) / 180;
  // 皿は鎖で水平に吊られる (panLevel)。竿の端だけが回り、そこから真下に下りる
  const pan = (sg: number) => {
    const dx = sg * (SPAN / 2 - 56);
    const xx = dx * Math.cos(th) - 14 * Math.sin(th);
    const yy = -34 + dx * Math.sin(th) + 14 * Math.cos(th) + DROP + 22;
    return [BX + BS * xx, BY + BS * yy] as const;
  };
  const [plx, ply] = pan(-1);
  const [prx, pry] = pan(1);
  const flick = 0.72 + Math.sin(f / 4.5) * 0.16 + Math.sin(f / 1.9) * 0.06;
  return (
    <Frame f={f} seed={866} bg={KRP.cream}>
      {/* 壁 (石のクリーム) */}
      <rect x={0} y={0} width={W} height={H} fill={C.stone} />
      <g stroke={C.stoneDark} strokeWidth={4} opacity={0.5}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={0} y1={44 + i * 78} x2={W} y2={30 + i * 78} />
        ))}
      </g>
      {/* 腰板 */}
      <rect x={0} y={648} width={W} height={26} fill={C.amber} stroke={KRP.ink} strokeWidth={6} opacity={0.85} />
      <rect x={0} y={674} width={W} height={406} fill={C.stoneDark} opacity={0.5} />
      {/* 奥のパリの階段 (左手前から右奥へ上がる) */}
      <g opacity={0.6}>
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <rect x={-30 + i * 62} y={916 - i * 50} width={120} height={50}
              fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-30 + i * 62} y={916 - i * 50} width={120} height={14}
              fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 鉄の手すり */}
        <line x1={10} y1={800} x2={690} y2={246} stroke={BP.ironDark} strokeWidth={14} strokeLinecap="round" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={40 + i * 74} y1={898 - i * 50} x2={54 + i * 74} y2={776 - i * 60}
            stroke={BP.ironDark} strokeWidth={7} />
        ))}
      </g>
      {/* 蝋燭の燭台 (右の壁) */}
      <g>
        <ellipse cx={1736} cy={330} rx={176} ry={204} fill={C.candle} opacity={0.3 * flick} />
        <rect x={1718} y={356} width={36} height={118} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1676} y={468} width={120} height={20} rx={6} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1720} y={288} width={32} height={70} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 1736 ${288 - 8} Q ${1748 + Math.sin(f / 4) * 7} 262 1736 ${236 - flick * 14} Q ${1724 + Math.sin(f / 4) * 7} 262 1736 ${280}`}
          fill={C.candle} stroke={KRP.orange} strokeWidth={4} />
      </g>
      {/* つり合っていたらどこにあったか (基準の水平線)。傾きを目で測れるようにする */}
      <g opacity={0.5 * easeOut(clamp01(seg(f, 16, 30)))}>
        <line x1={520} y1={BY - 32 * BS} x2={1400} y2={BY - 32 * BS}
          stroke={KRP.gray} strokeWidth={6} strokeDasharray="20 16" />
      </g>
      {/* 天秤 */}
      <Balance
        x={BX} y={BY} s={BS} f={f} tilt={tilt} span={SPAN} drop={DROP} pivotMark panLevel
        leftNode={
          <g>
            {/* 金貨の山 */}
            {Array.from({ length: 9 }, (_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <g key={i} opacity={clamp01(seg(f, 2 + i * 2, 10 + i * 2))}>
                  <ellipse cx={-78 + col * 78 + row * 10} cy={-16 - row * 30} rx={54} ry={18}
                    fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
                  <ellipse cx={-78 + col * 78 + row * 10} cy={-20 - row * 30} rx={34} ry={10}
                    fill={C.goldDark} stroke={KRP.ink} strokeWidth={3.5} />
                </g>
              );
            })}
          </g>
        }
        rightNode={
          <g>
            <g transform="translate(-112 0)"><Kb6bLeg s={0.46} /></g>
            <g transform="translate(118 0)"><Kb6bArm s={0.44} bail={false} /></g>
          </g>
        }
      />
      {/* 重いほう (脚と腕) が沈む。皿の真下から下向きの矢印で念を押す */}
      <ForceArrow x={prx} y={pry + 44} len={110} rot={90} w={24}
        color={KRP.green} t={seg(f, 20, 32)} />
      {/* 軽いほう (金貨) は上がる。皿の左外から上向き */}
      <ForceArrow x={plx - 170} y={ply + 60} len={110} rot={-90} w={22}
        color={C.goldDark} t={seg(f, 22, 34)} />
      {/* 皿の判定 (札と腕を避けて外側へ) */}
      <XMark x={plx - 330} y={ply - 30} s={1.8} t={seg(f, 28, 40)} />
      <Maru x={prx + 290} y={pry - 48} s={1.15} t={seg(f, 32, 42)} />
      {/* 札 */}
      <TagPlate x={332} y={176} text="高さの代金" size={52} t={seg(f, 2, 14)} />
      <TagPlate x={plx} y={760} text="金貨" size={46} t={seg(f, 14, 26)} color={C.goldDark} />
      <TagPlate x={1512} y={760} text="脚と腕" size={46} t={seg(f, 20, 32)} color={KRP.green} />
    </Frame>
  );
};

// ===== #234 ところが1920年代、この表がひっくり返ります。 =====
// 格: 山  ★ここから色が夜景の紺と金になる
// どこ: 家賃の表 (紺地・金の枠) と、その右に同じ高さで並ぶアパートの断面
// 演出: 表が上下まるごと回る。いちばん長い棒 (高い家賃) が下から上へ移り、○も上階へ上がる
// 動き: f=4〜20 で回転の矢印、f=10〜34 で表が180度回る。f=14〜34 で○が上階へ移動
// 絵: ★#224の家賃の目盛りが上下にひっくり返る瞬間。アパートの断面ごと回転し、上階に○が移る。1920年代の札
const Kb6bHyouGaHikkurikaeru: React.FC<{ f: number }> = ({ f }) => {
  // 下から上へ。中心は 540 ちょうど (枠ごと 180 度回すので上下対称でないとずれる)。
  // いちばん下を 770 までに上げて、階名の文字の下端 (= ry+23) を 830 以内に収める
  const rows = [770, 678, 586, 494, 402, 310];
  const names = ["1階", "2階", "3階", "4階", "5階", "屋根裏"];
  // 1920年より前の家賃。縦軸が 360 に移ったぶん短くした (右端 = 360+596 = 956)
  const bars = [290, 596, 494, 400, 306, 178];
  const flip = easeOut(clamp01(seg(f, 10, 34)));
  // 上下がそっくり入れ替わる (トランプを裏返すときの動き)。
  // 前は rotate(180) にしていたが、それだと棒が左へ回り込んで階名の欄を塗りつぶし、
  // 「5階」が金の棒に飲まれて消えていた。横には回さず、上下だけ返す
  const flipS = Math.cos(Math.PI * flip);
  const jolt = Math.sin(flip * Math.PI) * Math.sin(f / 2.2) * 6;
  // 断面も表と同じ 830 までに収める (足元の店先が字幕帯に沈まないように)
  const slabs = [800, 696, 592, 488, 384, 280, 176];
  // ○ は2階 (696〜592 の間) から屋根裏 (280〜176 の間) へ上がる
  const maruY = lerp(644, 228, easeOut(clamp01(seg(f, 14, 34))));
  return (
    <Frame f={f} seed={867} bg={KRP.cream}>
      {/* 夜の空気 */}
      <rect x={0} y={0} width={W} height={H} fill={C.nightPale} opacity={0.18} />
      <GridPaper opacity={0.1} />
      {/* アパートの断面 (回らない) */}
      <Kb6bSection x={1104} w={648} slabs={slabs} roofApexY={62} f={f} />
      {/* 断面の中の階段 */}
      <g opacity={0.8}>
        {slabs.slice(0, -1).map((sy, i) => (
          <g key={i}>
            {Array.from({ length: 5 }, (_, k) => (
              <rect key={k} x={1374 + k * 20} y={sy - 20 - k * 20} width={22} height={12}
                fill={C.amber} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
        ))}
      </g>
      {/* ==== 家賃の表 (ここが回る) ==== */}
      <g transform={`translate(0 ${540 + jolt}) scale(1 ${flipS}) translate(0 -540)`}>
        {/* 金の枠 + 紺地。上端は年代札の下 (247) より下、下端は安全線 830 まで。
            中心 540 の上下対称を崩さないこと (この枠ごと 180 度回る) */}
        <rect x={188} y={250} width={824} height={580} rx={14} fill={C.goldDark}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={206} y={268} width={788} height={544} rx={10} fill={C.night}
          stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={220} y1={282} x2={980} y2={282} n={12} r={7} fill={C.gold} />
        <Rivets x1={220} y1={798} x2={980} y2={798} n={12} r={7} fill={C.gold} />
        {/* 金の隅金具 (4隅・回しても同じ形) */}
        <g stroke={C.gold} strokeWidth={8} fill="none" opacity={0.9}>
          {[[216, 278, 1, 1], [984, 278, -1, 1], [216, 802, 1, -1], [984, 802, -1, -1]].map(
            ([cx, cy, sx, sy], i) => (
              <path key={i}
                d={`M ${cx + sx * 54} ${cy} L ${cx + sx * 14} ${cy} L ${cx + sx * 14} ${cy + sy * 40}`} />
            )
          )}
        </g>
        {/* 縦軸 (階名の欄を空けるため 360 に寄せた) */}
        <line x1={360} y1={276} x2={360} y2={804} stroke={C.gold} strokeWidth={9} />
        {/* 目盛りの縦線 */}
        <g stroke={C.nightPale} strokeWidth={3} opacity={0.8}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={360 + (i + 1) * 85} y1={282} x2={360 + (i + 1) * 85} y2={798} />
          ))}
        </g>
        {/* 棒 */}
        {rows.map((ry, i) => {
          const L = bars[i] * easeOut(clamp01(seg(f, 0, 10)));
          return (
            <g key={i}>
              <line x1={350} y1={ry} x2={370} y2={ry} stroke={C.gold} strokeWidth={7} />
              <rect x={360} y={ry - 28} width={L} height={56} rx={7}
                fill={i === 1 ? C.gold : C.goldDark} stroke={KRP.ink} strokeWidth={6} />
              <rect x={360} y={ry - 28} width={L} height={14} rx={6} fill={KRP.white} opacity={0.22} />
            </g>
          );
        })}
      </g>
      {/* 階の名前 (回らない)。表の中・縦軸の左の欄に入れる。
          前はここを表とアパートの間 (x=1072) に置いていたので紺の枠の右端と重なり、
          文字の左側が欠けていた。表の外の左右は回転の矢印と断面で埋まっているので、
          軸を右へ寄せて表の中に専用の欄を作った */}
      <g>
        <line x1={348} y1={276} x2={348} y2={804} stroke={C.gold} strokeWidth={4} opacity={0.45} />
        <g fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.gold}>
          {rows.map((ry, i) => (
            <text key={i} x={330} y={ry + 14} textAnchor="end">{names[i]}</text>
          ))}
        </g>
      </g>
      {/* 回る印 (円弧の矢印) */}
      <g opacity={clamp01(seg(f, 4, 18)) * (1 - clamp01(seg(f, 32, 42)))}>
        <path d="M 600 92 A 470 470 0 0 1 1052 540" fill="none" stroke={KRP.red}
          strokeWidth={16} strokeLinecap="round" strokeDasharray="34 24" />
        <polygon points="1052,576 1016,500 1092,500" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 600 988 A 470 470 0 0 1 148 540" fill="none" stroke={KRP.red}
          strokeWidth={16} strokeLinecap="round" strokeDasharray="34 24" />
        <polygon points="148,504 112,580 188,580" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* ○ が上階へ移る */}
      <Maru x={1412} y={maruY} s={1.15} t={seg(f, 12, 22)} />
      {/* 下階に残る × */}
      <XMark x={1412} y={644} s={1.0} t={seg(f, 30, 42)} />
      {/* 札 */}
      {/* 帯OK 札の上端 = y - size*0.85 = 200 - 37.4 = 162.6。タイトル帯 (y 54〜111) の下に出す */}
      <TagPlate x={332} y={200} text="1920年代" size={44} t={seg(f, 2, 14)} color={C.goldDark} />
      <TagPlate x={800} y={200} text="家賃の表" size={44} t={seg(f, 6, 18)} />
    </Frame>
  );
};

// ===== #235 箱が人を上げ、ポンプが水を上げ、電気が灯った。 =====
// 格: 図
// どこ: 5本柱の装置。箱・水・灯りの3本だけが光っている
// 演出: その3本の足元に丸い覗き窓。中でかご・ポンプ・電球が動く
// 動き: かごが上下、ポンプの梃子が揺れて水が出る、電球が明滅。札は f=26〜42
// 絵: 柱3本 (箱・水・灯り) が並んで立つ。それぞれの足元で、かご・ポンプ・電球が小さく動く
const Kb6bHakoPumpDenki: React.FC<{ f: number }> = ({ f }) => {
  const up = (Math.sin(f / 9) * 0.5 + 0.5);              // かごの上下
  const lev = Math.sin(f / 7) * 15;                      // ポンプの梃子
  const glow = 0.55 + Math.sin(f / 5.5) * 0.3 + Math.sin(f / 2.3) * 0.12;
  const CY = 644, CR = 82;
  const win = (cx: number, body: React.ReactNode, ring: string) => (
    <g>
      <clipPath id={`kb6bwin${cx}`}>
        <circle cx={cx} cy={CY} r={CR - 2} />
      </clipPath>
      <circle cx={cx} cy={CY} r={CR + 10} fill={ring} stroke={KRP.ink} strokeWidth={8} />
      <circle cx={cx} cy={CY} r={CR} fill={BP.paper} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={cx - CR - 4} y1={CY - CR + 18} x2={cx + CR + 4} y2={CY - CR + 18} n={2} r={7} fill={KRP.ink} />
      <g clipPath={`url(#kb6bwin${cx})`}>{body}</g>
      <path d={`M ${cx - CR * 0.7} ${CY - CR * 0.25} Q ${cx - CR * 0.2} ${CY - CR * 0.82} ${cx + CR * 0.3} ${CY - CR * 0.7}`}
        fill="none" stroke={KRP.white} strokeWidth={13} opacity={0.35} />
    </g>
  );
  return (
    <Frame f={f} seed={868} bg={KRP.cream}>
      <rect x={0} y={0} width={W} height={H} fill={C.nightPale} opacity={0.14} />
      <GridPaper opacity={0.1} />
      <TowerOnPillars f={f} standing={["hako", "mizu", "akari"]} labels={false} lit={0.9} />
      {/* 箱: かごが上下する */}
      {win(670, (
        <g>
          <rect x={670 - 62} y={CY - 76} width={124} height={152} fill={BP.shaftDeep} opacity={0.3} />
          <line x1={670 - 36} y1={CY - 76} x2={670 - 36} y2={CY + 76} stroke={BP.steelDark} strokeWidth={6} />
          <line x1={670 + 36} y1={CY - 76} x2={670 + 36} y2={CY + 76} stroke={BP.steelDark} strokeWidth={6} />
          <Rope x1={670} y1={CY - 80} x2={670} y2={CY + 10 - up * 66} w={10} kind="wire" f={f} />
          <g transform={`translate(0 ${-up * 66})`}>
            <rect x={670 - 42} y={CY + 10} width={84} height={66} rx={6} fill={BP.brass}
              stroke={KRP.ink} strokeWidth={6} />
            <g stroke={BP.brassDark} strokeWidth={4}>
              <line x1={670 - 20} y1={CY + 14} x2={670 - 20} y2={CY + 72} />
              <line x1={670 + 20} y1={CY + 14} x2={670 + 20} y2={CY + 72} />
            </g>
            <rect x={670 - 42} y={CY + 10} width={84} height={12} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      ), KPP.hakoDark)}
      {/* 水: ポンプの梃子が揺れて水が出る */}
      {win(960, (
        <g>
          <rect x={960 - 26} y={CY - 30} width={52} height={106} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={960 - 54} y={CY + 60} width={108} height={18} rx={5} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5} />
          {/* 吐出口 */}
          <path d={`M 960 ${CY - 18} L ${960 - 72} ${CY - 18} L ${960 - 72} ${CY + 6}`}
            fill="none" stroke={BP.steelDark} strokeWidth={18} />
          {/* 梃子 */}
          <g transform={`rotate(${lev} ${960 + 14} ${CY - 36})`}>
            <rect x={960 + 10} y={CY - 46} width={92} height={18} rx={8} fill={BP.wood}
              stroke={KRP.ink} strokeWidth={6} />
          </g>
          <HexBolt x={960 + 14} y={CY - 36} r={11} fill={BP.brass} />
          {/* 水 */}
          <path d={`M ${960 - 72} ${CY + 10} q -6 ${30 + lev} 2 ${58}`} fill="none"
            stroke={KPP.mizu} strokeWidth={16} strokeLinecap="round" />
          <ellipse cx={960 - 68} cy={CY + 72} rx={34} ry={10} fill={KPP.mizuDark} opacity={0.8} />
        </g>
      ), KPP.mizuDark)}
      {/* 灯り: 電球が明滅する */}
      {win(1250, (
        <g>
          <circle cx={1250} cy={CY + 8} r={62} fill={BP.lampGlow} opacity={0.55 * glow} />
          <line x1={1250} y1={CY - 80} x2={1250} y2={CY - 42} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1250 - 18} y={CY - 44} width={36} height={26} rx={4} fill={BP.brassDark}
            stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1250} cy={CY + 12} r={40} fill={BP.lamp} stroke={KRP.ink} strokeWidth={6}
            opacity={0.55 + glow * 0.45} />
          <path d={`M ${1250 - 16} ${CY - 6} l 10 22 l -8 14 l 16 10 l -8 14 l 14 6`}
            fill="none" stroke={BP.brassDark} strokeWidth={5} />
          <Bolt x={1250 + 40} y={CY - 42} s={0.9} opacity={clamp01(glow)} />
        </g>
      ), KPP.akariDark)}
      {/* 札 (字幕帯に当たらない高さ) */}
      <TagPlate x={670} y={782} text="箱" size={40} t={seg(f, 26, 36)} color={KPP.hakoDark} />
      <TagPlate x={960} y={782} text="水" size={40} t={seg(f, 30, 40)} color={KPP.mizuDark} />
      <TagPlate x={1250} y={782} text="灯り" size={40} t={seg(f, 34, 42)} color={KPP.akariDark} />
      <TagPlate x={330} y={150} text="1920年代" size={50} t={seg(f, 2, 14)} color={C.goldDark} />
    </Frame>
  );
};

// ===== #236 すると、屋根裏に残るものは何でしょうか。 =====
// 格: 図
// どこ: 屋根裏の部屋を正面から切った図。勾配天井・垂木・天窓
// 演出: 部屋の真ん中に大きな？。「暑い」「水がない」の札が上へ流れて薄れる
// 動き: 札は f=12〜38 で薄れて上へ消える。？は f=18〜32 で出て揺れる。埃が舞う
// 絵: 屋根裏の部屋に大きな？。「暑い」「水がない」の札が薄れて消えていく
const Kb6bYaneuraNiNokoru: React.FC<{ f: number }> = ({ f }) => {
  const fade = 1 - easeOut(clamp01(seg(f, 12, 38)));
  const drift = easeOut(clamp01(seg(f, 12, 38))) * 72;
  const flick = 0.72 + Math.sin(f / 7) * 0.14;
  return (
    <Frame f={f} seed={869} bg={KRP.cream}>
      <GridPaper />
      {/* 外の屋根 (亜鉛) */}
      <polygon points="340,672 960,112 1580,672" fill={C.zinc} stroke={KRP.ink} strokeWidth={9} />
      <g stroke={C.zincDark} strokeWidth={5} opacity={0.75}>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <line x1={388 + i * 82} y1={628 - i * 74} x2={420 + i * 82} y2={656 - i * 74} />
            <line x1={1532 - i * 82} y1={628 - i * 74} x2={1500 - i * 82} y2={656 - i * 74} />
          </g>
        ))}
      </g>
      {/* 部屋の中 (勾配天井) */}
      <polygon points="420,660 960,172 1500,660 1500,846 420,846" fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={8} />
      {/* 垂木 */}
      <g stroke={C.amber} strokeWidth={16} opacity={0.9}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1={470 + i * 112} y1={616 - i * 101} x2={494 + i * 112} y2={640 - i * 101} />
          </g>
        ))}
      </g>
      <g stroke={C.amber} strokeWidth={14} opacity={0.75}>
        <line x1={436} y1={644} x2={954} y2={176} />
        <line x1={1484} y1={644} x2={966} y2={176} />
        <line x1={620} y1={408} x2={1300} y2={408} />
      </g>
      {/* 棟木 */}
      <circle cx={960} cy={182} r={22} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 天窓 (右の勾配) */}
      <g>
        <polygon points="1148,502 1286,502 1332,606 1178,606" fill={C.candle}
          stroke={KRP.ink} strokeWidth={7} opacity={flick} />
        <line x1={1216} y1={502} x2={1254} y2={606} stroke={KRP.ink} strokeWidth={5} />
        {/* 差し込む光 */}
        <polygon points="1148,502 1332,606 1092,846 846,846" fill={C.candle}
          opacity={0.22 * flick} />
      </g>
      {/* 床板 */}
      <rect x={420} y={796} width={1080} height={50} fill={C.amber} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.8}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={470 + i * 118} y1={798} x2={470 + i * 118} y2={844} />
        ))}
      </g>
      {/* 舞う埃 */}
      <g fill={KRP.white} opacity={0.55}>
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} r={3 + rnd(i * 5) * 4}
            cx={880 + rnd(i * 3 + 1) * 320}
            cy={846 - ((f * (1 + rnd(i * 7) * 1.6) + i * 44) % 330)} />
        ))}
      </g>
      {/* 大きな？ */}
      <QMark x={960} y={560} s={2.5} f={f} t={seg(f, 18, 32)} />
      {/* 薄れて消える札 */}
      <g opacity={fade} transform={`translate(0 ${-drift})`}>
        <TagPlate x={616} y={716} text="暑い" size={46} t={seg(f, 2, 10)} color={KRP.red} />
      </g>
      <g opacity={fade} transform={`translate(0 ${-drift * 0.8})`}>
        <TagPlate x={1330} y={716} text="水がない" size={44} t={seg(f, 5, 13)} color={KRP.red} />
      </g>
      {/* 消える印 */}
      <g opacity={1 - fade}>
        <XMark x={616} y={716 - drift} s={0.6} t={seg(f, 24, 36)} color={KRP.gray} />
        <XMark x={1330} y={716 - drift * 0.8} s={0.6} t={seg(f, 28, 40)} color={KRP.gray} />
      </g>
      <TagPlate x={290} y={204} text="屋根裏" size={52} t={seg(f, 2, 14)} />
    </Frame>
  );
};

// ===== #237 眺めと、静けさと、日当たりです。 =====
// 格: 並
// どこ: 屋根裏の部屋の中。大きな屋根窓の外にパリの亜鉛の屋根並み
// 演出: 朝の光が窓から床へ長く差す。手前に木の椅子と置かれた本。人はいない
// 動き: f=4〜40 で光がのびて明るくなる。鳥が外を横切り、埃が光の中を舞う。カーテンが揺れる
// 絵: 屋根裏の窓から見えるパリの屋根並み。朝の光が床に差す。静かな部屋、本と椅子
const Kb6bNagameShizukesa: React.FC<{ f: number }> = ({ f }) => {
  const lightT = easeOut(clamp01(seg(f, 4, 40)));
  const beamEnd = lerp(1020, 420, lightT);
  const bird = ((f + 6) % 60) / 60;
  const cur = Math.sin(f / 11) * 14;
  return (
    <Frame f={f} seed={870} bg={KRP.cream}>
      {/* 部屋の壁 */}
      <rect x={0} y={0} width={W} height={H} fill={BP.shaft} />
      {/* 勾配天井 (左上) */}
      <polygon points="0,0 0,560 640,120 640,0" fill={C.amber} stroke={KRP.ink} strokeWidth={8} opacity={0.92} />
      <g stroke={BP.woodDark} strokeWidth={10} opacity={0.75}>
        <line x1={0} y1={320} x2={372} y2={100} />
        <line x1={0} y1={470} x2={240} y2={330} />
      </g>
      {/* 窓の周り (塗り壁) */}
      <rect x={700} y={140} width={880} height={560} rx={10} fill={C.stone}
        stroke={KRP.ink} strokeWidth={9} />
      {/* 窓の外 */}
      <rect x={744} y={184} width={792} height={472} fill={"#E7EFF5"} stroke={KRP.ink} strokeWidth={6} />
      {/* 朝の空 */}
      <rect x={744} y={184} width={792} height={236} fill={C.candle} opacity={0.3} />
      {/* 遠くのドーム */}
      <g opacity={0.6}>
        <path d="M 1300 408 Q 1300 300 1368 300 Q 1436 300 1436 408 Z" fill={C.zinc}
          stroke={KRP.ink} strokeWidth={6} />
        <line x1={1368} y1={300} x2={1368} y2={262} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1368} cy={256} r={13} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* パリの屋根並み */}
      {[0, 1, 2, 3, 4].map((i) => {
        const bx = 740 + i * 172;
        const bw = 158;
        const by = 430 + (i % 2 ? 26 : 0);
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={656 - by} fill={C.stone}
              stroke={KRP.ink} strokeWidth={6} />
            <polygon points={`${bx - 14},${by} ${bx + bw / 2},${by - 74} ${bx + bw + 14},${by}`}
              fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
            {/* 煙突と煙突壺 */}
            <rect x={bx + bw - 54} y={by - 108} width={40} height={74} fill={C.stoneDark}
              stroke={KRP.ink} strokeWidth={5} />
            {[0, 1].map((k) => (
              <rect key={k} x={bx + bw - 50 + k * 18} y={by - 128} width={14} height={24}
                fill={BP.rust} stroke={KRP.ink} strokeWidth={4} />
            ))}
            {/* 屋根窓 */}
            <rect x={bx + 26} y={by + 32} width={44} height={56} rx={5} fill={BP.glass}
              stroke={KRP.ink} strokeWidth={5} />
          </g>
        );
      })}
      {/* 鳥 */}
      <g opacity={0.8} transform={`translate(${760 + bird * 740} ${300 - Math.sin(bird * 6) * 34})`}>
        <path d="M -22 0 Q -10 -14 0 0 Q 10 -14 22 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 窓の桟 */}
      <g stroke={C.amber} strokeWidth={22} opacity={1}>
        <line x1={1140} y1={184} x2={1140} y2={656} />
        <line x1={744} y1={420} x2={1536} y2={420} />
      </g>
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.6} fill="none">
        <line x1={1140} y1={184} x2={1140} y2={656} />
        <line x1={744} y1={420} x2={1536} y2={420} />
      </g>
      {/* 窓枠 */}
      <rect x={744} y={184} width={792} height={472} fill="none" stroke={C.amber} strokeWidth={26} />
      <rect x={744} y={184} width={792} height={472} fill="none" stroke={KRP.ink} strokeWidth={6} />
      {/* 窓台 */}
      <rect x={686} y={656} width={908} height={30} rx={7} fill={C.stone}
        stroke={KRP.ink} strokeWidth={7} />
      {/* カーテン (右) */}
      <path d={`M 1596 150 Q ${1640 + cur} 420 1582 690 L 1700 690 Q ${1660 + cur} 420 1700 150 Z`}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} opacity={0.9} />
      {/* 差し込む朝の光 */}
      <polygon points={`744,660 1536,660 ${beamEnd + 560},846 ${beamEnd},846`}
        fill={C.candle} opacity={0.26 + lightT * 0.2} />
      <polygon points={`900,660 1180,660 ${beamEnd + 420},846 ${beamEnd + 180},846`}
        fill={KRP.white} opacity={0.18 * lightT} />
      {/* 光の中の埃 */}
      <g fill={KRP.white} opacity={0.6}>
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} r={3 + rnd(i * 9) * 3}
            cx={700 + rnd(i * 4 + 2) * 800}
            cy={846 - ((f * (0.7 + rnd(i * 6)) + i * 30) % 190)} />
        ))}
      </g>
      {/* 床板 */}
      <rect x={0} y={800} width={W} height={280} fill={C.amber} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.75}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={i * 150} y1={802} x2={i * 150 - 40} y2={1080} />
        ))}
        <line x1={0} y1={852} x2={W} y2={852} />
      </g>
      {/* 木の椅子 (横向き) */}
      <g>
        {/* 後脚と背もたれの柱 */}
        <rect x={496} y={508} width={22} height={318} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={352} y={690} width={22} height={136} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 背もたれの貫 */}
        <rect x={436} y={520} width={86} height={18} rx={6} fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
        <rect x={446} y={584} width={76} height={16} rx={6} fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
        <rect x={452} y={640} width={70} height={16} rx={6} fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
        {/* 座面 */}
        <rect x={332} y={678} width={200} height={26} rx={7} fill={C.amber} stroke={KRP.ink} strokeWidth={7} />
        {/* 貫 (脚のつなぎ) */}
        <rect x={360} y={774} width={148} height={14} rx={5} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 本 (座面の上) */}
        <g transform="translate(416 664) rotate(-4)">
          <rect x={-66} y={-20} width={132} height={22} rx={4} fill={BP.rust}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={-62} y={-14} width={124} height={12} fill={BP.paper} stroke={KRP.ink} strokeWidth={3} />
          <g stroke={BP.shaftDark} strokeWidth={2.5}>
            <line x1={-58} y1={-10} x2={58} y2={-10} />
            <line x1={-58} y1={-6} x2={58} y2={-6} />
          </g>
          <rect x={-10} y={-22} width={12} height={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
      <TagPlate x={1636} y={246} text="眺め" size={48} t={seg(f, 6, 18)} />
      <TagPlate x={296} y={246} text="静けさ" size={48} t={seg(f, 16, 28)} />
      <TagPlate x={248} y={756} text="日当たり" size={44} t={seg(f, 26, 40)} color={C.goldDark} />
    </Frame>
  );
};

// ===== #238 つらさだけが消えて、良いところが残ったんです。 =====
// 格: 図
// どこ: 方眼の上。札を2列に並べた一覧の板
// 演出: 左の列 (つらさ) は赤線で消され×、右の列 (良いところ) には○が付く
// 動き: 札が上から順に出て、消し線が引かれ、×と○が押される (f=4〜42)
// 絵: 札を2列に。「暑い・水がない・階段」に×、「眺め・静けさ・日当たり」に○
const Kb6bTsurasaDakeKieta: React.FC<{ f: number }> = ({ f }) => {
  const rowY = [346, 520, 694];
  const bad = ["暑い", "水がない", "階段"];
  const good = ["眺め", "静けさ", "日当たり"];
  return (
    <Frame f={f} seed={871} bg={KRP.cream}>
      <GridPaper />
      {/* 2枚の板 */}
      {[[372, C.stoneDark], [1172, C.goldDark]].map(([bx, col], i) => (
        <g key={i}>
          <rect x={bx as number} y={258} width={376} height={530} rx={14} fill={col as string}
            stroke={KRP.ink} strokeWidth={9} />
          <rect x={(bx as number) + 18} y={276} width={340} height={494} rx={10}
            fill={BP.paper} stroke={KRP.ink} strokeWidth={6} />
          <Rivets x1={(bx as number) + 36} y1={272} x2={(bx as number) + 340} y2={272}
            n={6} r={7} fill={KRP.ink} />
          <Rivets x1={(bx as number) + 36} y1={774} x2={(bx as number) + 340} y2={774}
            n={6} r={7} fill={KRP.ink} />
        </g>
      ))}
      {/* 真ん中の仕切り */}
      <line x1={960} y1={150} y2={800} x2={960} stroke={KRP.ink} strokeWidth={7}
        strokeDasharray="20 16" opacity={0.5} />
      {/* 列の見出し */}
      <TagPlate x={560} y={180} text="消えた" size={50} t={seg(f, 2, 12)} color={KRP.red} />
      <TagPlate x={1360} y={180} text="残った" size={50} t={seg(f, 4, 14)} color={KRP.green} />
      {/* 左の列: つらさ */}
      {rowY.map((ry, i) => {
        const tIn = seg(f, 6 + i * 5, 16 + i * 5);
        const tCut = easeOut(clamp01(seg(f, 20 + i * 5, 30 + i * 5)));
        const w = bad[i].length * 52 + 40;
        return (
          <g key={`b${i}`}>
            <TagPlate x={560} y={ry} text={bad[i]} size={52} t={tIn} />
            <line x1={560 - w / 2 - 14} y1={ry} x2={560 - w / 2 - 14 + (w + 28) * tCut} y2={ry}
              stroke={KRP.red} strokeWidth={13} strokeLinecap="round" opacity={0.92} />
            <XMark x={812} y={ry} s={0.62} t={seg(f, 24 + i * 5, 34 + i * 5)} />
          </g>
        );
      })}
      {/* 右の列: 良いところ */}
      {rowY.map((ry, i) => (
        <g key={`g${i}`}>
          <TagPlate x={1360} y={ry} text={good[i]} size={52} t={seg(f, 10 + i * 5, 20 + i * 5)} />
          <Maru x={1108} y={ry} s={0.62} t={seg(f, 28 + i * 4, 38 + i * 4)} />
        </g>
      ))}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb6_mizu_wa_agaranai: (f) => <Kb6bMizuWaAgaranai f={f} />,
  kb6_mizuhakobiya: (f) => <Kb6bMizuhakobiya f={f} />,
  kb6_kaidan_wo_noboru: (f) => <Kb6bKaidanWoNoboru f={f} />,
  kb6_touji_mo_daikin: (f) => <Kb6bToujiMoDaikin f={f} />,
  kb6_ashi_to_ude: (f) => <Kb6bAshiToUde f={f} />,
  kb6_harau_mono: (f) => <Kb6bHarauMono f={f} />,
  kb6_hyou_ga_hikkurikaeru: (f) => <Kb6bHyouGaHikkurikaeru f={f} />,
  kb6_hako_pump_denki: (f) => <Kb6bHakoPumpDenki f={f} />,
  kb6_yaneura_ni_nokoru: (f) => <Kb6bYaneuraNiNokoru f={f} />,
  kb6_nagame_shizukesa: (f) => <Kb6bNagameShizukesa f={f} />,
  kb6_tsurasa_dake_kieta: (f) => <Kb6bTsurasaDakeKieta f={f} />,
};

export const K_B6B_MOTIFS: string[] = [
  "kb6_mizu_wa_agaranai",      // #228 水道は、そこまで上がってきません。
  "kb6_mizuhakobiya",          // #229 ちなみにパリには、水運び屋という職業がありました。
  "kb6_kaidan_wo_noboru",      // #230 水を担いで階段を登るのが、仕事です。
  "kb6_touji_mo_daikin",       // #231 当時も、高さの代金は払われていました。
  "kb6_ashi_to_ude",           // #232 払っていたのは、住人の脚と、使用人の腕です。
  "kb6_harau_mono",            // #233 高さは、買うものではなく、払うものでした。
  "kb6_hyou_ga_hikkurikaeru",  // #234 ところが1920年代、この表がひっくり返ります。
  "kb6_hako_pump_denki",       // #235 箱が人を上げ、ポンプが水を上げ、電気が灯った。
  "kb6_yaneura_ni_nokoru",     // #236 すると、屋根裏に残るものは何でしょうか。
  "kb6_nagame_shizukesa",      // #237 眺めと、静けさと、日当たりです。
  "kb6_tsurasa_dake_kieta",    // #238 つらさだけが消えて、良いところが残ったんです。
];

export const kosoB6bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
