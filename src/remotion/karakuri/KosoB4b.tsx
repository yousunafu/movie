// 「なぜ高層ビルは生まれたのか」: 第4章「灯りと、空気。」中盤 (いい部屋〜高いところの風)
// 担当範囲: 台本 docs/koso-script-v7.txt の 159〜169行目 (文#158〜#168・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb4_ で始める。WobbleDefs の seed はこのファイルでは 751〜761 を使う。
// 設計書: docs/koso-ch4-design.md (1文ごとの「格」と絵の中身が決まっている)
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
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale, Spring,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  flame: "#F0A02E",
  flameCore: "#F6D06A",
  soot: "#2E2A28",
  sootPale: "#5A524C",
  amber: "#C9A06A",
  wallpaper: "#B88A5E",
  wallDark: "#7E5B36",
  bulb: "#F4DE8E",
  castIron: "#3E4247",
  castIronPale: "#5E646B",
  airBlue: "#9FB6C4",
  airPale: "#D6E2E8",
  glass: "#AFC6D4",
  night: "#2B3A4A",
  snow: "#EDF1F3",
  ink2: "#3A4350",
  floorCool: "#AEBAC2",
  storm: "#5C6E7C",
  steelCool: "#8FA3B0",
  // 白熱球の段落 (#158) の色。ガス灯の茶橙とぶつけるために、ぜんぶ冷たい側へ振る
  wallCool: "#C7D0CB",       // 冷たい漆喰
  wallCoolDark: "#9BA7A2",   // 近い側壁 (影)
  timberCool: "#8C8F88",     // 灰がかった小屋組の材
  timberCoolDark: "#64685F",
  lightCool: "#FBFDF2",      // 白熱球の光 (白に寄せた)
  lightPale: "#EFF3DC",      // その外側 (淡い黄)
  // 1980年代の居間 (#164)
  tatami: "#C6C184",
  tatamiDark: "#9A9560",
  showa: "#D7CCB0",          // 砂壁
  showaDark: "#AB9E7E",
} as const;

// ===================================================================
// このファイルだけのローカル部品 (共用の KosoB2Parts には足さない)
// ===================================================================

/**
 * 白熱球への寄り (#158の主役)。原点 = ガラス球の中心。
 * ガラスは幅600・高さ498 で、画面の短辺 (1080) の半分より大きい。
 * 寄るぶんだけ中身まで描く: 磁器のソケット・口金のねじ山4段・ガラスのステム・
 * ボタンステムの膨らみ・導入線2本・支持線3本・つる巻きフィラメント・
 * ゲッターの銀膜・型の合わせ目・排気管の跡・映り込み2本。
 * 吊りコードは画面の上へ抜ける (カメラが近いので天井は写らない)。
 */
const Kb4bBulbBig: React.FC<{
  x: number; y: number; s?: number; lit?: number; tilt?: number;
}> = ({ x, y, s = 1, lit = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt} 0 -430) scale(${s})`}>
    {/* 吊りコード (二本撚り。上の画面外へ) */}
    <path d="M 0 -760 Q 10 -600 0 -440" fill="none" stroke={KRP.ink}
      strokeWidth={26} strokeLinecap="round" />
    <path d="M 0 -760 Q 10 -600 0 -440" fill="none" stroke={C.wallCoolDark}
      strokeWidth={10} strokeDasharray="26 20" />
    {/* ソケット (磁器) */}
    <rect x={-118} y={-440} width={236} height={100} rx={18} fill={KRP.white}
      stroke={KRP.ink} strokeWidth={9} />
    <line x1={-118} y1={-396} x2={118} y2={-396} stroke={KRP.ink} strokeWidth={5} opacity={0.45} />
    <rect x={-104} y={-352} width={208} height={26} rx={10} fill={C.castIronPale}
      stroke={KRP.ink} strokeWidth={8} />
    {/* 口金のねじ山 (4段) */}
    <g stroke={KRP.ink} strokeWidth={7} fill={BP.brass}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-92} y={-330 + i * 25} width={184} height={22} rx={10} />
      ))}
    </g>
    <rect x={-100} y={-250} width={200} height={18} rx={8} fill={BP.brassDark}
      stroke={KRP.ink} strokeWidth={7} />
    {/* ガラス球 (幅600) */}
    <path d="M -92 -236 Q -300 -162 -300 26 Q -300 262 0 262 Q 300 262 300 26 Q 300 -162 92 -236 Z"
      fill={C.bulb} stroke={KRP.ink} strokeWidth={10} />
    {/* 球の中の光 (白く冷たい側へ寄せる) */}
    <g opacity={0.35 + 0.65 * lit}>
      <circle cx={0} cy={30} r={186} fill={C.lightPale} opacity={0.75} />
      <circle cx={0} cy={30} r={108} fill={C.lightCool} opacity={0.9} />
    </g>
    {/* ゲッターの銀膜 (肩のうち側) */}
    <path d="M -236 -84 Q -196 -140 -126 -164" fill="none" stroke={BP.steelLight}
      strokeWidth={30} strokeLinecap="round" opacity={0.42} />
    {/* ガラスのステム (支柱) とボタンステム */}
    <path d="M -28 -234 L -20 -74 L 20 -74 L 28 -234 Z" fill={C.glass}
      stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
    <ellipse cx={0} cy={-68} rx={52} ry={20} fill={C.glass} stroke={KRP.ink} strokeWidth={6} />
    {/* 導入線 2本 */}
    <g fill="none" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round">
      <path d="M -26 -72 Q -56 -24 -104 26" />
      <path d="M 26 -72 Q 56 -24 104 26" />
    </g>
    {/* 支持線 3本 (ステムからフィラメントへ) */}
    <g fill="none" stroke={C.sootPale} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
      <path d="M -14 -62 Q -46 -4 -58 44" />
      <path d="M 0 -58 L 0 30" />
      <path d="M 14 -62 Q 46 -4 58 44" />
    </g>
    {/* つる巻きフィラメント (弧を10個つなぐ) */}
    <g fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round">
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M ${-104 + i * 21} 26 a 11 36 0 0 ${i % 2 === 0 ? 1 : 0} 21 0`} />
      ))}
    </g>
    <g fill="none" stroke={C.flame} strokeWidth={6} strokeLinecap="round"
      opacity={0.3 + 0.7 * lit}>
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M ${-104 + i * 21} 26 a 11 36 0 0 ${i % 2 === 0 ? 1 : 0} 21 0`} />
      ))}
    </g>
    {/* 型の合わせ目 */}
    <path d="M -296 36 Q 0 66 296 36" fill="none" stroke={BP.brassDark}
      strokeWidth={5} opacity={0.3} />
    {/* 排気管の跡 (球の底) */}
    <circle cx={0} cy={258} r={22} fill={C.bulb} stroke={KRP.ink} strokeWidth={8} />
    <circle cx={0} cy={258} r={8} fill={C.sootPale} opacity={0.7} />
    {/* ガラスの映り込み */}
    <path d="M -196 -94 Q -250 34 -186 166" fill="none" stroke={KRP.white}
      strokeWidth={30} strokeLinecap="round" opacity={0.78} />
    <path d="M -142 -124 Q -186 -54 -168 10" fill="none" stroke={KRP.white}
      strokeWidth={12} strokeLinecap="round" opacity={0.55} />
    <circle cx={182} cy={-56} r={38} fill={KRP.white} opacity={0.6} />
    <circle cx={214} cy={16} r={16} fill={KRP.white} opacity={0.45} />
  </g>
);

/** 鋳鉄ラジエーター。フィンの連なり・上下の集合管・足とねじ */
const Kb4bRad: React.FC<{
  x: number; y: number; w: number; h: number; fins?: number; detail?: boolean;
}> = ({ x, y, w, h, fins = 12, detail = true }) => {
  const pitch = w / fins;
  const fw = pitch * 0.66;
  const sw = Math.max(3, 5 * Math.min(1, w / 900));
  return (
    <g>
      {/* 下の集合管 */}
      <rect x={x - w * 0.016} y={y + h - h * 0.12} width={w + w * 0.032} height={h * 0.12}
        rx={h * 0.045} fill={C.castIron} stroke={KRP.ink} strokeWidth={sw + 1} />
      {/* フィン */}
      {Array.from({ length: fins }, (_, i) => {
        const fx = x + pitch * i + (pitch - fw) / 2;
        return (
          <g key={i}>
            <rect x={fx} y={y} width={fw} height={h} rx={fw * 0.44}
              fill={C.castIron} stroke={KRP.ink} strokeWidth={sw} />
            <rect x={fx + fw * 0.26} y={y + fw * 0.5} width={fw * 0.22} height={h - fw}
              rx={fw * 0.11} fill={C.castIronPale} opacity={0.8} />
            {detail && (
              <rect x={fx + fw * 0.1} y={y + h * 0.44} width={fw * 0.8} height={h * 0.028}
                fill={BP.ironDark} opacity={0.55} />
            )}
          </g>
        );
      })}
      {/* 上の集合管 */}
      <rect x={x - w * 0.016} y={y - h * 0.012} width={w + w * 0.032} height={h * 0.115}
        rx={h * 0.045} fill={C.castIronPale} stroke={KRP.ink} strokeWidth={sw + 1} />
      {detail && (
        <Rivets x1={x + pitch * 0.5} y1={y + h * 0.05} x2={x + w - pitch * 0.5} y2={y + h * 0.05}
          n={fins} r={Math.max(3, h * 0.016)} fill={BP.ironDark} />
      )}
      {/* 足 (ねじ止め) */}
      {detail && [0.08, 0.92].map((p) => (
        <g key={p}>
          <rect x={x + w * p - w * 0.028} y={y + h} width={w * 0.056} height={h * 0.07}
            fill={C.castIron} stroke={KRP.ink} strokeWidth={sw} />
          <HexBolt x={x + w * p} y={y + h + h * 0.07} r={Math.max(5, h * 0.028)} fill={BP.ironDark} />
        </g>
      ))}
    </g>
  );
};

/** ダクトの吹き出し口。枠・羽根・四隅のねじ */
const Kb4bOutlet: React.FC<{
  x: number; y: number; w: number; h: number; blades?: number; f?: number;
}> = ({ x, y, w, h, blades = 5, f = 0 }) => {
  const sw = Math.max(3.5, 5.5 * Math.min(1, w / 500));
  const tilt = Math.sin(f / 19) * 3;
  return (
    <g>
      {/* 枠 */}
      <rect x={x} y={y} width={w} height={h} rx={h * 0.1}
        fill={C.steelCool} stroke={KRP.ink} strokeWidth={sw + 1.5} />
      <rect x={x + w * 0.045} y={y + h * 0.1} width={w * 0.91} height={h * 0.8} rx={h * 0.06}
        fill={C.ink2} stroke={KRP.ink} strokeWidth={sw} />
      {/* 羽根 */}
      {Array.from({ length: blades }, (_, i) => {
        const by = y + h * 0.14 + (i * h * 0.72) / blades;
        return (
          <g key={i} transform={`rotate(${tilt} ${x + w / 2} ${by})`}>
            <rect x={x + w * 0.07} y={by} width={w * 0.86} height={(h * 0.72) / blades * 0.52}
              rx={4} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={sw * 0.8} />
            <line x1={x + w * 0.09} y1={by + 3} x2={x + w * 0.93} y2={by + 3}
              stroke={KRP.white} strokeWidth={sw * 0.5} opacity={0.6} />
          </g>
        );
      })}
      {/* 四隅のねじ */}
      {[[0.04, 0.12], [0.96, 0.12], [0.04, 0.88], [0.96, 0.88]].map(([px, py], i) => (
        <g key={i}>
          <circle cx={x + w * px} cy={y + h * py} r={Math.max(4, w * 0.018)}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={sw * 0.6} />
          <line x1={x + w * px - w * 0.012} y1={y + h * py} x2={x + w * px + w * 0.012}
            y2={y + h * py} stroke={KRP.ink} strokeWidth={sw * 0.5} />
        </g>
      ))}
    </g>
  );
};

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #158 熱も少ないので、狭い部屋でも使えます。 =====
// 格: 山 (白熱球の段落の1枚目なので、寄りで押し切る)
// どこ: 屋根裏の狭い部屋の内側。カメラは電球のすぐ手前
// 演出: ★白熱球への寄り。ガラス球だけで幅468 = 画面の短辺 (1080) の4割を超える。
//   ★ここで色が切り替わる。ガス灯の段落 (#148〜#156) の茶＋橙に対して、
//     壁は冷たい漆喰 (wallCool)、床は灰青の板 (floorCool)、光は白に寄せた淡い黄。
//     炎の橙 (C.flame / C.flameCore) は背景にいっさい使わない。
// 動き: 光がじわり強まる / コードがわずかに揺れる / 本のページが1枚めくれる / 埃が舞う
// 絵: 大きな白熱球への寄り。低い勾配天井。夜の窓。机で本を読む人。ぜんぶ冷たい色
const Kb4bNetsuMoSukunai: React.FC<{ f: number }> = ({ f }) => {
  const lit = easeOut(seg(f, 2, 24));
  const page = easeOut(seg(f, 20, 40));
  const tilt = Math.sin(f / 17) * 1.1;
  const BX = 620, BY = 430;                 // ガラス球の中心
  const FL = 712;                           // 壁と床の境
  const VPX = 900, VPY = 420;               // 床板の消点
  const farX = (xs: number) => VPX + (xs - VPX) * ((1120 - VPY) / (FL - VPY));
  const ceilBottom = (x: number) => 140 + ((x + 40) / 2000) * 160;
  return (
    <Frame f={f} seed={751} bg={KRP.cream}>
      {/* ===== 勾配天井 (低い。狭さはここで出す) ===== */}
      <polygon points="-40,-40 1960,-40 1960,300 -40,140"
        fill={C.timberCool} stroke={KRP.ink} strokeWidth={7} />
      {/* 板目 */}
      <g stroke={C.timberCoolDark} strokeWidth={6} opacity={0.75}>
        {Array.from({ length: 6 }, (_, i) => {
          const t = (i + 1) / 7;
          return <line key={i} x1={-40} y1={lerp(-40, 140, t)} x2={1960} y2={lerp(-40, 300, t)} />;
        })}
      </g>
      {/* 垂木 (斜めに渡す) */}
      <g stroke={C.timberCoolDark} strokeWidth={24} strokeLinecap="round" opacity={0.95}>
        {Array.from({ length: 6 }, (_, i) => {
          const px = 100 + i * 360;
          return <line key={i} x1={px} y1={-40} x2={px - 54} y2={ceilBottom(px - 54)} />;
        })}
      </g>
      <g stroke={KRP.white} strokeWidth={5} opacity={0.3}>
        {Array.from({ length: 6 }, (_, i) => {
          const px = 100 + i * 360;
          return <line key={i} x1={px + 9} y1={-40} x2={px - 45} y2={ceilBottom(px - 45)} />;
        })}
      </g>

      {/* ===== 奥の壁 (冷たい漆喰) ===== */}
      <polygon points={`-40,140 1960,300 1960,${FL} -40,${FL}`}
        fill={C.wallCool} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.wallCoolDark} strokeWidth={5} opacity={0.45}>
        {[388, 478, 568, 652].map((y) => <line key={y} x1={250} y1={y} x2={1960} y2={y} />)}
      </g>
      {/* 漆喰のひび */}
      <g fill="none" stroke={C.wallCoolDark} strokeWidth={5} opacity={0.6}>
        <path d="M 1884 332 q -26 54 -8 96 q -30 44 -14 92" />
        <path d="M 302 452 q 22 48 4 92 q 20 40 2 74" />
      </g>
      {/* 幅木 */}
      <rect x={-40} y={FL - 36} width={2000} height={36} fill={C.timberCool}
        stroke={KRP.ink} strokeWidth={7} />

      {/* ===== 近い左の側壁 (壁がすぐ横にある = 狭い) ===== */}
      <polygon points={`-40,-40 250,140 250,${FL} -40,892`}
        fill={C.wallCoolDark} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
        {[0.3, 0.52, 0.74].map((t) => (
          <line key={t} x1={-40} y1={lerp(-40, 892, t)} x2={250} y2={lerp(140, FL, t)} />
        ))}
      </g>
      {/* 側壁の窓 (外は夜。だから灯りが要る) */}
      <polygon points="44,176 226,238 226,628 44,692" fill={C.timberCool}
        stroke={KRP.ink} strokeWidth={8} />
      <polygon points="60,200 215,254 215,611 60,668" fill={C.night}
        stroke={KRP.ink} strokeWidth={7} />
      {/* 桟 (十字) */}
      <polygon points="60,422 215,430 215,448 60,442" fill={C.timberCool} stroke={KRP.ink} strokeWidth={5} />
      <polygon points="130,224 148,230 148,638 130,646" fill={C.timberCool} stroke={KRP.ink} strokeWidth={5} />
      {/* ガラスの映り (冷たい白) */}
      <g opacity={0.3}>
        <polygon points="72,300 122,250 122,330 72,378" fill={C.lightCool} />
        <polygon points="158,470 208,452 208,520 158,544" fill={C.lightCool} />
      </g>
      {/* 窓台 */}
      <polygon points="40,686 222,624 240,644 48,710" fill={BP.woodLight}
        stroke={KRP.ink} strokeWidth={7} />

      {/* ===== 床 (灰青の板。消点に向かって継ぎ目が開く) ===== */}
      <rect x={-40} y={FL} width={2000} height={1120 - FL} fill={C.floorCool}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.storm} strokeWidth={5} opacity={0.42}>
        {Array.from({ length: 13 }, (_, i) => {
          const xs = -60 + i * 170;
          return <line key={i} x1={xs} y1={FL} x2={farX(xs)} y2={1120} />;
        })}
        <line x1={-40} y1={822} x2={1960} y2={822} />
        <line x1={-40} y1={968} x2={1960} y2={968} />
      </g>

      {/* ===== 白熱球の光 (白〜淡い黄。輪が部屋いっぱいに届く) ===== */}
      <g>
        {[1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={BX} cy={BY + 24} r={(166 + i * 158) * (0.46 + lit * 0.6)}
            fill={i <= 2 ? C.lightCool : C.lightPale} opacity={(0.3 / i) * (0.3 + lit * 0.7)} />
        ))}
      </g>
      {/* 床の光だまり */}
      <ellipse cx={BX} cy={880} rx={486 * (0.5 + lit * 0.5)} ry={142 * (0.5 + lit * 0.5)}
        fill={C.lightPale} opacity={0.4 * lit} />

      {/* ===== 左手前: 腰掛けとたたんだ布 ===== */}
      <g>
        <rect x={286} y={694} width={246} height={28} rx={7} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={7} />
        {[302, 492].map((lx) => (
          <rect key={lx} x={lx} y={722} width={26} height={82} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={6} />
        ))}
        <rect x={298} y={760} width={222} height={14} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={312} y={648} width={196} height={48} rx={8} fill={C.snow}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.wallCoolDark} strokeWidth={4} opacity={0.8}>
          <line x1={320} y1={664} x2={500} y2={664} />
          <line x1={320} y1={680} x2={500} y2={680} />
        </g>
      </g>

      {/* ===== 右奥: 棚・本・ブリキ缶 ===== */}
      <g>
        <rect x={1290} y={400} width={470} height={24} rx={6} fill={BP.woodLight}
          stroke={KRP.ink} strokeWidth={7} />
        {[1320, 1716].map((bx) => (
          <path key={bx} d={`M ${bx} 424 l 0 46 l 34 -46 Z`} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1326 + i * 42} y={312 + (i % 2) * 14} width={34} height={88 - (i % 2) * 14}
            fill={i % 2 === 0 ? C.steelCool : C.amber} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={1540} y={330} width={160} height={70} rx={8} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1560} y={316} width={120} height={20} rx={6} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={1556} y1={386} x2={1684} y2={386} n={5} r={6} fill={BP.steelDark} />
      </g>

      {/* ===== 右: 机 (インク壺・ペン・消えた蝋燭・本2冊) ===== */}
      <g>
        <rect x={1270} y={600} width={540} height={28} rx={7} fill={BP.woodLight}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={1290} y={628} width={500} height={46} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1540} cy={651} r={14} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        {[1300, 1756].map((lx) => (
          <rect key={lx} x={lx} y={674} width={30} height={118} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* インク壺とペン */}
        <rect x={1318} y={556} width={72} height={44} rx={8} fill={C.ink2}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1332} y={542} width={44} height={18} rx={6} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={1370} y1={552} x2={1428} y2={470} stroke={KRP.white} strokeWidth={11}
          strokeLinecap="round" />
        <line x1={1370} y1={552} x2={1428} y2={470} stroke={KRP.ink} strokeWidth={4} />
        {/* もう使わない蝋燭 (芯は黒く、炎はない) */}
        <rect x={1476} y={548} width={56} height={52} rx={6} fill={BP.brass}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1494} y={462} width={20} height={88} fill={C.snow} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1504} y1={462} x2={1504} y2={444} stroke={C.soot} strokeWidth={6} strokeLinecap="round" />
        {/* 本2冊 */}
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={1596 + i * 8} y={570 - i * 30} width={190 - i * 14} height={30} rx={4}
              fill={i === 0 ? C.steelCool : C.amber} stroke={KRP.ink} strokeWidth={5} />
            <line x1={1602 + i * 8} y1={585 - i * 30} x2={1780 - i * 6} y2={585 - i * 30}
              stroke={KRP.white} strokeWidth={4} opacity={0.6} />
          </g>
        ))}
      </g>

      {/* ===== 本を読む人 (冷たい光の下。影が足もとに落ちる) ===== */}
      <ellipse cx={1080} cy={796} rx={116} ry={26} fill={C.storm} opacity={0.22} />
      <Person x={1080} y={792} s={1.12} cloth="#4A5A6E" clothDark="#36455A"
        face="normal" gaze={[0, 4]} f={f} />
      <g transform="translate(1080 652)">
        <path d="M -124 -58 Q 0 -78 124 -58 L 124 50 Q 0 32 -124 50 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-68} x2={0} y2={40} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.wallCoolDark} strokeWidth={3.5} opacity={0.85}>
          {[-32, -12, 8].map((dy) => (
            <g key={dy}>
              <line x1={-110} y1={dy + 6} x2={-18} y2={dy} />
              <line x1={18} y1={dy} x2={110} y2={dy + 6} />
            </g>
          ))}
        </g>
        {/* めくれるページ */}
        <g transform={`rotate(${-page * 155} 0 -10)`} opacity={1 - page * 0.25}>
          <path d="M 0 -68 Q 62 -80 120 -58 L 120 46 Q 60 28 0 38 Z"
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>

      {/* ===== 主役: 白熱球への寄り (ガラス球は幅468。吊りコードが上へ抜ける) ===== */}
      <Kb4bBulbBig x={BX} y={BY} s={0.78} lit={lit} tilt={tilt} />

      {/* 埃 (光の中を舞う) */}
      <g fill={KRP.white} opacity={0.55 * lit}>
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={300 + i * 142 + Math.sin(f / 13 + i * 1.3) * 28}
            cy={250 + ((f * 1.7 + i * 74) % 430)} r={4 + (i % 3) * 2.5} />
        ))}
      </g>

      <TagPlate x={1030} y={296} text="熱くない" size={46} t={seg(f, 12, 26)} />
      <TagPlate x={620} y={744} text="電球ひとつ" size={44} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ===== #159 上の階が、やっと「いい部屋」になりました。 =====
// 格: 山
// どこ: 上層階の部屋の内側。右に大きな窓、外は夜の街
// 演出: ★灯りの柱。暗い部屋 → 電灯が点く → 窓の外の灯りが順に点く → 札
// 動き: 暗さが引く / 光の円錐が立つ / 夜景の窓が1つずつ点く / カメラがわずかに寄る
// 絵: ★灯りの柱が立つ一枚。上層階の部屋が明るい。窓から夜景。札「いい部屋」
const Kb4bIiHeyaNiNatta: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.055 * easeOut(seg(f, 0, 42));
  const lamp = easeOut(seg(f, 6, 20));
  const dark = 1 - easeOut(seg(f, 5, 24));
  const sway = Math.sin(f / 18) * 4;
  const LX = 540, LY = 318;
  return (
    <Frame f={f} seed={752} bg={KRP.cream}>
      <g transform={zoomAt(z, 940, 470)}>
        {/* 天井・壁・腰壁・床 */}
        <rect x={-40} y={-40} width={2000} height={200} fill={C.wallDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={160} width={2000} height={660} fill={C.wallpaper} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.wallDark} strokeWidth={6} opacity={0.3}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={-20 + i * 104} y1={168} x2={-20 + i * 104} y2={672} />
          ))}
        </g>
        <rect x={-40} y={672} width={2000} height={148} fill={C.wallDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={820} width={2000} height={300} fill={KRP.floor} stroke={KRP.ink} strokeWidth={6} />

        {/* 大きな窓: 外は夜景 */}
        <rect x={944} y={176} width={812} height={520} fill={C.night} stroke={KRP.ink} strokeWidth={9} />
        {/* 遠くのビルと窓の灯り */}
        {[[980, 330, 150, 366], [1150, 262, 128, 434], [1296, 382, 164, 314],
          [1478, 300, 142, 396], [1636, 404, 112, 292]].map(([bx, by, bw, bh], bi) => (
          <g key={bi}>
            <rect x={bx} y={by} width={bw} height={bh} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor(bh / 54) }, (_, r) =>
              Array.from({ length: Math.floor(bw / 44) }, (_, c) => {
                const k = bi * 29 + r * 7 + c * 3;
                const on = rnd(k) > 0.42;
                const t = seg(f, 15 + (k % 13) * 1.4, 25 + (k % 13) * 1.4);
                return on ? (
                  <rect key={`${r}-${c}`} x={bx + 12 + c * 44} y={by + 16 + r * 54}
                    width={22} height={28} fill={KRP.yellow} opacity={0.35 + 0.65 * t} />
                ) : null;
              }))}
          </g>
        ))}
        {/* 街の灯りの点々 (地平) */}
        <g>
          {Array.from({ length: 34 }, (_, i) => {
            const px = 962 + i * 23 + rnd(i * 5) * 12;
            const py = 648 + rnd(i * 11) * 36;
            const t = seg(f, 16 + (i % 11) * 1.3, 26 + (i % 11) * 1.3);
            return <circle key={i} cx={px} cy={py} r={4 + rnd(i) * 4}
              fill={C.flameCore} opacity={0.3 + 0.7 * t} />;
          })}
        </g>
        {/* 窓の桟と額縁・窓台 */}
        <g stroke={KRP.ink} strokeWidth={9}>
          <line x1={1350} y1={176} x2={1350} y2={696} />
          <line x1={944} y1={436} x2={1756} y2={436} />
        </g>
        <rect x={944} y={176} width={812} height={520} fill="none" stroke={BP.woodDark} strokeWidth={16} />
        <rect x={944} y={176} width={812} height={520} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={916} y={690} width={868} height={32} rx={8} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        {/* カーテン (左右・ひだ) */}
        {[[862, 1], [1766, -1]].map(([cx, dir], i) => (
          <g key={i}>
            <rect x={dir === 1 ? cx : cx} y={166} width={88} height={540} rx={10}
              fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
            <g stroke={C.wallDark} strokeWidth={5} opacity={0.6}>
              {[22, 44, 66].map((d) => <line key={d} x1={cx + d} y1={176} x2={cx + d} y2={698} />)}
            </g>
          </g>
        ))}

        {/* 壁の額 */}
        <rect x={140} y={262} width={226} height={178} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={160} y={282} width={186} height={138} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 176 400 L 228 326 L 268 374 L 300 338 L 332 400 Z"
          fill={C.amber} stroke={KRP.ink} strokeWidth={4} />

        {/* 電灯の光の円錐 (灯りの柱) */}
        <polygon points={`${LX - 112},${LY + 92} ${LX + 112},${LY + 92} ${LX + 430},900 ${LX - 430},900`}
          fill={C.flameCore} opacity={0.3 * lamp} />
        <polygon points={`${LX - 70},${LY + 92} ${LX + 70},${LY + 92} ${LX + 250},900 ${LX - 250},900`}
          fill={C.flameCore} opacity={0.3 * lamp} />
        {/* 床の反射 */}
        <ellipse cx={LX} cy={906} rx={356} ry={56} fill={C.flameCore} opacity={0.42 * lamp} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1010 + i * 250} y={824} width={118} height={250}
            fill={KRP.yellow} opacity={0.2 * lamp} transform={`skewX(-14)`} />
        ))}

        {/* 天井から下がる電灯 (笠つき) */}
        <line x1={LX} y1={120} x2={LX + sway} y2={LY - 24} stroke={KRP.ink} strokeWidth={9} />
        <polygon points={`${LX + sway - 128},${LY + 88} ${LX + sway + 128},${LY + 88} ${LX + sway + 64},${LY - 20} ${LX + sway - 64},${LY - 20}`}
          fill={C.castIron} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={LX + sway} cy={LY + 88} rx={128} ry={22} fill={C.flameCore}
          stroke={KRP.ink} strokeWidth={6} opacity={0.4 + 0.6 * lamp} />
        <circle cx={LX + sway} cy={LY + 112} r={42} fill={C.bulb} stroke={KRP.ink} strokeWidth={5.5} />
        <polyline points={`${LX + sway - 16},${LY + 100} ${LX + sway - 4},${LY + 120} ${LX + sway - 18},${LY + 130} ${LX + sway + 6},${LY + 134} ${LX + sway + 16},${LY + 104}`}
          fill="none" stroke={C.flame} strokeWidth={6} opacity={0.4 + 0.6 * lamp} />

        {/* 住人2人 (くつろいでいる) */}
        <Person x={420} y={828} s={1.0} cloth="#5C6E8C" clothDark="#43536D"
          face="smile" gaze={[2, 0]} f={f} phase={1} />
        <Person x={706} y={832} s={0.95} cloth="#8A5A54" clothDark="#6B4440"
          face="smile" gaze={[-2, 0]} f={f} phase={3} />

        {/* テーブル (人の前) + カップ2つ */}
        <rect x={326} y={688} width={498} height={28} rx={7} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={352} y={716} width={26} height={120} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={772} y={716} width={26} height={120} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {[430, 700].map((cx) => (
          <g key={cx}>
            <path d={`M ${cx - 26} 650 L ${cx - 20} 686 L ${cx + 20} 686 L ${cx + 26} 650 Z`}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${cx + 26} 658 q 22 10 0 22`} fill="none" stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 椅子 (窓寄り) */}
        <g>
          <rect x={856} y={560} width={26} height={270} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={856} y={560} width={122} height={24} rx={6} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={848} y={692} width={140} height={24} rx={6} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <rect x={962} y={716} width={22} height={116} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        </g>

        {/* 点く前の暗さ */}
        <rect x={-40} y={-40} width={2000} height={1180} fill={C.night} opacity={0.56 * dark} />
      </g>
      <TagPlate x={262} y={768} text="いい部屋" size={54} t={seg(f, 28, 42)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== #160 暖房も変わります。鋳鉄のラジエーターです。 =====
// 格: 並
// どこ: 部屋の壁ぎわ。漆喰の壁・幅木・板張りの床だけの寄り
// 演出: 鋳鉄のラジエーターを画面の2/3で大きく。フィン12枚・集合管・バルブ・足のねじ
// 動き: バルブのハンドルが回る / 上に陽炎の線が立ちのぼる
// 絵: 鋳鉄のラジエーターを作り込む。羽の連なり・バルブ・足元の床・置かれた靴
const Kb4bRadiator: React.FC<{ f: number }> = ({ f }) => {
  const turn = easeOut(seg(f, 5, 26)) * 310;
  const heat = easeOut(seg(f, 12, 40));
  const RX = 230, RY = 300, RW = 1200, RH = 468;
  return (
    <Frame f={f} seed={753} bg={KRP.cream}>
      {/* 漆喰の壁・幅木・床板 */}
      <rect x={-40} y={-40} width={2000} height={800} fill={BP.shaft} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.4}>
        {[120, 250, 430, 600].map((y) => <line key={y} x1={-20} y1={y} x2={1940} y2={y} />)}
      </g>
      <rect x={-40} y={744} width={2000} height={56} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-40} y={800} width={2000} height={320} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.6}>
        {[862, 932, 1010, 1096] .map((y) => <line key={y} x1={-20} y1={y} x2={1940} y2={y} />)}
        {[300, 820, 1340].map((x) => <line key={x} x1={x} y1={800} x2={x - 40} y2={1080} />)}
      </g>

      {/* 陽炎 (熱の線) */}
      <g opacity={0.3 + 0.7 * heat}>
        {Array.from({ length: 9 }, (_, i) => {
          const px = RX + 70 + i * 140;
          const a = f / 7 + i;
          return (
            <path key={i}
              d={`M ${px} ${RY - 10} C ${px + Math.sin(a) * 26} ${RY - 90} ${px - Math.sin(a + 1) * 30} ${RY - 160} ${px + Math.sin(a + 2) * 22} ${RY - 232}`}
              fill="none" stroke={C.flame} strokeWidth={8} strokeLinecap="round"
              opacity={0.5 * heat} />
          );
        })}
      </g>

      {/* 鋳鉄のラジエーター (主役) */}
      <Kb4bRad x={RX} y={RY} w={RW} h={RH} fins={12} />

      {/* バルブ (右側・ハンドルが回る) */}
      <g>
        <rect x={RX + RW + 6} y={RY + 36} width={88} height={64} rx={10}
          fill={C.castIronPale} stroke={KRP.ink} strokeWidth={6} />
        <rect x={RX + RW + 70} y={RY + 54} width={74} height={30} rx={8}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={RX + RW + 112} y={RY + 68} width={28} height={118} rx={8}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={RX + RW + 126} y={RY + 196} r={30} fill={BP.brass} />
        <g transform={`translate(${RX + RW + 126} ${RY + 258}) rotate(${turn})`}>
          <circle cx={0} cy={0} r={72} fill="none" stroke={KRP.ink} strokeWidth={22} />
          <circle cx={0} cy={0} r={72} fill="none" stroke={BP.brass} strokeWidth={14} />
          {[0, 72, 144, 216, 288].map((a) => (
            <line key={a} x1={0} y1={0}
              x2={Math.cos((a * Math.PI) / 180) * 70} y2={Math.sin((a * Math.PI) / 180) * 70}
              stroke={BP.brassDark} strokeWidth={13} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={0} r={22} fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5.5} />
        </g>
      </g>

      {/* そばに置かれた靴1組 */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${1640 + i * 124} 764)`}>
          <path d="M -54 0 Q -58 -40 -26 -44 Q -6 -46 6 -28 Q 20 -8 52 -4 Q 60 -2 58 6 L -50 6 Z"
            fill={C.soot} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={-36} y1={-28} x2={-2} y2={-22} stroke={BP.hempDark} strokeWidth={4} />
          <path d="M -50 6 L 58 6 L 58 18 L -50 18 Z" fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}

      <TagPlate x={1700} y={178} text="鋳鉄" size={56} t={seg(f, 6, 20)} />
      {/* ハンドルは中心 (1556,558)・外まわり r=83 なので右端は x=1639。
          矢印は rot=180 で「右へ伸びて左を指す」形 (x から x+77 を占める) なので、
          札と同じ座標に置くと札の上に乗ってしまう。矢印は札の下、ハンドルの高さに置く。
            札   : x 1660〜1820 / y 446〜514
            矢印 : x 1652〜1729 / y 540〜576 (先端とハンドルの間は13px) */}
      <TagPlate x={1740} y={480} text="バルブ" size={40} t={seg(f, 22, 36)} />
      <Arrow x={1652} y={558} s={0.7} rot={180} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// ===== #161 管を通して、蒸気や湯を各部屋へ送る。 =====
// 格: 図
// どこ: 図。ビルの断面を画面の端から端まで縦に使う
// 演出: 地下のボイラー → 太い立管 → 6階ぶんの枝管 → 各室のラジエーター
// 動き: 蒸気の矢印が地下から上へ、そして各階へ順に流れる / 炉の火が揺れる
// 絵: ビル断面。地下のボイラーから各室へ管が伸びる。蒸気の矢印
const Kb4bKanDeOkuru: React.FC<{ f: number }> = ({ f }) => {
  const GND = 700, TOP = 100, BOT = 832;
  const floorY = [700, 600, 500, 400, 300, 200];   // 各階の床 (下から)
  const fire = 0.6 + 0.4 * Math.sin(f / 5);
  return (
    <Frame f={f} seed={754} bg={KRP.cream}>
      <GridPaper />
      {/* 煙突 (地下から画面の上へ抜ける) */}
      <rect x={248} y={40} width={74} height={690} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
      <rect x={232} y={40} width={106} height={34} rx={8} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.5}>
        {[160, 300, 440, 580].map((y) => <line key={y} x1={250} y1={y} x2={320} y2={y} />)}
      </g>
      {/* 煙 */}
      <g opacity={easeOut(seg(f, 18, 38))}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={286 + Math.sin(f / 9 + i) * 22} cy={30 - i * 4}
            r={26 + i * 14} fill={C.sootPale} opacity={0.3 - i * 0.07} />
        ))}
      </g>

      {/* ビル断面の外枠 */}
      <rect x={380} y={TOP} width={1140} height={GND - TOP} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
      <rect x={380} y={GND} width={1140} height={BOT - GND} fill={BP.shaftDark} stroke={KRP.ink} strokeWidth={9} />
      {/* 地面線 (ハッチ) */}
      <line x1={-20} y1={GND} x2={1940} y2={GND} stroke={KRP.ink} strokeWidth={10} />
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.6}>
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={-20 + i * 66} y1={GND} x2={-48 + i * 66} y2={GND + 30} />
        ))}
      </g>
      {/* 各階の床スラブ + 階数 + ラジエーター */}
      {floorY.map((fy, i) => (
        <g key={fy}>
          <rect x={380} y={fy - 14} width={1140} height={14} fill={BP.slabDark}
            stroke={KRP.ink} strokeWidth={6} />
          <text x={424} y={fy - 34} fontFamily={FONT} fontWeight={900} fontSize={34}
            fill={KRP.ink} opacity={0.75}>{i + 1}階</text>
          <Kb4bRad x={1180} y={fy - 76} w={250} h={62} fins={7} detail={false} />
        </g>
      ))}
      <rect x={380} y={TOP} width={1140} height={14} fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />

      {/* 太い立管 */}
      <rect x={758} y={130} width={44} height={692} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
      <rect x={766} y={130} width={12} height={692} fill={BP.steelLight} opacity={0.8} />
      {/* 枝管 (各階へ) */}
      {floorY.map((fy) => (
        <g key={`b${fy}`}>
          <rect x={800} y={fy - 56} width={382} height={28} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
          <HexBolt x={1156} y={fy - 42} r={16} />
          <HexBolt x={822} y={fy - 42} r={16} />
        </g>
      ))}

      {/* 地下のボイラー */}
      <g>
        <rect x={430} y={710} width={290} height={112} rx={18}
          fill={C.castIron} stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={446} y1={726} x2={704} y2={726} n={9} r={7} fill={BP.ironDark} />
        {/* 炉の口 (火) */}
        <circle cx={500} cy={778} r={38} fill={C.soot} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={500} cy={778} r={24} fill={C.flame} opacity={fire} />
        <circle cx={500} cy={778} r={13} fill={C.flameCore} opacity={fire} />
        {/* 圧力計 */}
        <circle cx={636} cy={766} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={636} y1={766} x2={636 + Math.cos((-60 + fire * 50) * Math.PI / 180) * 24}
          y2={766 + Math.sin((-60 + fire * 50) * Math.PI / 180) * 24}
          stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
        <circle cx={636} cy={766} r={6} fill={KRP.ink} />
        {/* 立管へのつなぎ */}
        <rect x={700} y={744} width={78} height={30} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        {/* 煙突へのつなぎ */}
        <path d="M 430 726 L 322 688 L 322 722 L 430 760 Z" fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* 蒸気の矢印: 地下から上へ → 各階へ順に */}
      <ForceArrow x={706} y={700} len={540} rot={-90} w={26} color={KRP.red}
        t={seg(f, 4, 20)} />
      {floorY.map((fy, i) => (
        <ForceArrow key={`a${fy}`} x={830} y={fy - 100} len={300} rot={0} w={20}
          color={KRP.red} t={seg(f, 12 + i * 3, 24 + i * 3)} />
      ))}

      <TagPlate x={1058} y={772} text="ボイラー" size={42} t={seg(f, 6, 20)} />
      <TagPlate x={940} y={172} text="蒸気" size={48} t={seg(f, 16, 30)} color={KRP.red} />
    </Frame>
  );
};

// ===== #162 燃料を部屋ごとに運び込む必要が、なくなりました。 =====
// 格: 山
// どこ: 集合住宅の階段室。手前の床から段が右上へ上がり、上の踊り場に扉
// 演出: ★「運ぶ仕事が消えた」を場で見せる。手前に石炭バケツとシャベルが置き去り (赤い×)、
//   上の踊り場には立管とラジエーターが届いていて、人は手ぶらで立っている。
//   方眼紙の図をやめて部屋の中に置き換えた枚 (この区間が図ばかりになるのを断つ)。
// 動き: 最後の石炭が1つ転がって止まる / ×が出る / ラジエーターから陽炎 / 人がまばたき
// 絵: 階段室。置き去りの石炭バケツとシャベルに赤い×。上の踊り場に管とラジエーターと人
const Kb4bNenryouHakobanai: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeOut(seg(f, 10, 30));
  const xm = seg(f, 20, 34);
  const heat = easeOut(seg(f, 14, 38));
  const FLR = 820;                                   // 床と階段の付け根
  const X0 = 600, TD = 136, RH = 62, NS = 5;         // 段の起点・踏面・蹴上げ・段数
  const treadY = (i: number) => FLR - (i + 1) * RH;  // i段目の踏面
  const LAND_Y = treadY(NS - 1);                     // 踊り場 = 490
  const railAt = (x: number) => 578 - (x - 620) * ((330 - 578) / (1300 - 620));
  const lumps: [number, number, number][] = [
    [-128, -8, 1.0], [-62, -26, 1.22], [4, -14, 0.92],
    [66, -30, 1.14], [126, -6, 1.0], [-30, 16, 0.84], [84, 18, 0.9],
  ];
  const lumpPath = (s: number) =>
    `M ${-46 * s} ${6 * s} L ${-34 * s} ${-26 * s} L ${-2 * s} ${-36 * s} L ${30 * s} ${-22 * s} L ${46 * s} ${8 * s} L ${18 * s} ${24 * s} L ${-22 * s} ${22 * s} Z`;
  const stairPts = [
    `${X0},${FLR}`,
    ...Array.from({ length: NS }, (_, i) =>
      `${X0 + i * TD},${treadY(i)} ${X0 + (i + 1) * TD},${treadY(i)}`),
    `1900,${LAND_Y}`, `1900,${FLR}`,
  ].join(" ");
  return (
    <Frame f={f} seed={755} bg={KRP.cream}>
      {/* ===== 天井の梁 ===== */}
      <rect x={-40} y={-40} width={2000} height={110} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.4}>
        {[260, 700, 1140, 1580].map((x) => <line key={x} x1={x} y1={-40} x2={x} y2={70} />)}
      </g>

      {/* ===== 漆喰の壁 ===== */}
      <rect x={-40} y={70} width={2000} height={FLR - 70 + 40} fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.shaftDark} strokeWidth={5} opacity={0.5}>
        {[200, 360, 520, 680].map((y) => <line key={y} x1={-40} y1={y} x2={1960} y2={y} />)}
      </g>
      {/* 石炭バケツが何十年もすれた煤のあと (段に沿って上がる) */}
      <g fill={C.soot} opacity={0.17}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={320 + i * 190} cy={660 - i * 66} rx={92} ry={34}
            transform={`rotate(-20 ${320 + i * 190} ${660 - i * 66})`} />
        ))}
      </g>

      {/* ===== 階段室の窓 2つ (段に沿って高くなる) ===== */}
      {([[760, 150, 280, 260], [1400, 120, 180, 220]] as const).map(([wx, wy, ww, wh]) => (
        <g key={wx}>
          <rect x={wx - 20} y={wy - 20} width={ww + 40} height={wh + 40} rx={8}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={8} />
          <rect x={wx} y={wy} width={ww} height={wh} fill={C.glass} stroke={KRP.ink} strokeWidth={7} />
          <rect x={wx + ww / 2 - 9} y={wy} width={18} height={wh} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={wx} y={wy + wh / 2 - 9} width={ww} height={18} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
          <polygon points={`${wx + 14},${wy + wh - 16} ${wx + ww * 0.52},${wy + 14} ${wx + ww * 0.68},${wy + 14} ${wx + 28},${wy + wh - 16}`}
            fill={KRP.white} opacity={0.42} />
          <rect x={wx - 34} y={wy + wh + 20} width={ww + 68} height={22} rx={6}
            fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
        </g>
      ))}

      {/* ===== 階段 (手前の床から右上の踊り場へ) ===== */}
      <polygon points={stairPts} fill={BP.wood} stroke={KRP.ink} strokeWidth={9} />
      {/* 踏面 (出ばなを付ける) */}
      {Array.from({ length: NS }, (_, i) => (
        <g key={i}>
          <rect x={X0 + i * TD - 14} y={treadY(i)} width={TD + 28} height={18} rx={5}
            fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <line x1={X0 + i * TD - 10} y1={treadY(i) + 26} x2={X0 + (i + 1) * TD + 10}
            y2={treadY(i) + 26} stroke={BP.woodDark} strokeWidth={6} opacity={0.7} />
        </g>
      ))}
      {/* 踊り場の床 */}
      <rect x={X0 + NS * TD} y={LAND_Y} width={1900 - (X0 + NS * TD)} height={18}
        fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
      {/* 段に落ちた石炭のかけら */}
      {([[700, 0], [1010, 2], [1210, 3]] as const).map(([cx, i]) => (
        <g key={cx} transform={`translate(${cx} ${treadY(i) - 14})`}>
          <path d={lumpPath(0.56)} fill={C.soot} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}

      {/* ===== 手摺 (親柱・笠木・手すり子) ===== */}
      <g>
        <rect x={X0} y={578} width={44} height={FLR - 578 - 6} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={7} />
        <circle cx={X0 + 22} cy={568} r={30} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 4 }, (_, i) => {
          const bx = 700 + i * 150;
          const idx = Math.min(NS - 1, Math.floor((bx - X0) / TD));
          return (
            <rect key={bx} x={bx - 10} y={railAt(bx)} width={20} height={treadY(idx) - railAt(bx)}
              fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
          );
        })}
        <line x1={620} y1={578} x2={1300} y2={330} stroke={KRP.ink} strokeWidth={26}
          strokeLinecap="round" />
        <line x1={620} y1={578} x2={1300} y2={330} stroke={BP.wood} strokeWidth={15}
          strokeLinecap="round" />
        <rect x={1288} y={330} width={44} height={LAND_Y - 330} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1310} cy={320} r={30} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      </g>

      {/* ===== 新しいやり方: 立管とラジエーター (運ばなくても熱が届く) ===== */}
      <g>
        <rect x={1346} y={-40} width={32} height={452} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={1352} y={-40} width={9} height={452} fill={BP.steelLight} opacity={0.85} />
        {[180, 300].map((y) => (
          <rect key={y} x={1334} y={y} width={56} height={22} rx={6} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 陽炎 */}
        <g opacity={0.3 + 0.7 * heat}>
          {Array.from({ length: 5 }, (_, i) => {
            const px = 1380 + i * 44;
            const a = f / 7 + i;
            return (
              <path key={i}
                d={`M ${px} 396 C ${px + Math.sin(a) * 18} 340 ${px - Math.sin(a + 1) * 20} 300 ${px + Math.sin(a + 2) * 14} 256`}
                fill="none" stroke={C.flame} strokeWidth={7} strokeLinecap="round"
                opacity={0.45 * heat} />
            );
          })}
        </g>
        <Kb4bRad x={1350} y={404} w={200} h={76} fins={7} />
        <rect x={1340} y={420} width={22} height={30} rx={6} fill={BP.brass}
          stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* ===== 踊り場の扉 ===== */}
      <g>
        <rect x={1600} y={40} width={296} height={LAND_Y - 40} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={1628} y={62} width={240} height={LAND_Y - 62} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={8} />
        {[0, 1].map((r) => [0, 1].map((c) => (
          <rect key={`${r}-${c}`} x={1650 + c * 102} y={88 + r * 204} width={82} height={180}
            rx={6} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        )))}
        <rect x={1824} y={252} width={34} height={70} rx={8} fill={BP.brassDark}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1841} cy={276} r={19} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* ===== 手ぶらで立つ人 (もう運ばない) ===== */}
      <ellipse cx={1740} cy={LAND_Y + 4} rx={96} ry={22} fill={C.soot} opacity={0.18} />
      <Person x={1740} y={LAND_Y} s={1.06} cloth="#5A6E58" clothDark="#42543F"
        face="smile" gaze={[-6, 4]} f={f} />

      {/* ===== 手前の床 (石畳) ===== */}
      <rect x={-40} y={FLR} width={2000} height={1120 - FLR} fill={BP.slab}
        stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.slabDark} strokeWidth={6} opacity={0.65}>
        <line x1={-40} y1={930} x2={1960} y2={930} />
        {[120, 520, 920, 1320, 1720].map((x) => <line key={x} x1={x} y1={FLR} x2={x - 40} y2={930} />)}
        {[-80, 320, 720, 1120, 1520, 1920].map((x) => <line key={x} x1={x} y1={930} x2={x - 70} y2={1120} />)}
      </g>

      {/* ===== 置き去りのシャベル (左の壁に立てかける) ===== */}
      <g transform="translate(120 548) rotate(-6)">
        <rect x={-30} y={-430} width={60} height={440} rx={16}
          fill={BP.woodLight} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={BP.woodDark} strokeWidth={4} opacity={0.75}>
          {[-16, 0, 16].map((d) => (
            <path key={d} d={`M ${d} -420 q ${d === 0 ? 8 : -8} 210 0 420`} fill="none" />
          ))}
        </g>
        <path d="M -58 -430 q 58 -70 116 0" fill="none" stroke={KRP.ink} strokeWidth={22} />
        <path d="M -58 -430 q 58 -70 116 0" fill="none" stroke={BP.wood} strokeWidth={13} />
        <rect x={-38} y={-10} width={76} height={62} rx={10} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={-22} y1={22} x2={22} y2={22} n={2} r={8} />
        <path d="M -118 44 L 118 44 L 136 196 Q 0 252 -136 196 Z"
          fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
        <path d="M -94 70 L 94 70" stroke={BP.steelDark} strokeWidth={7} opacity={0.8} />
        <path d="M -108 120 Q 0 150 108 120" fill="none" stroke={BP.steelDark} strokeWidth={6} opacity={0.7} />
      </g>

      {/* ===== 置き去りの石炭バケツ (手前いっぱい) ===== */}
      <ellipse cx={360} cy={814} rx={214} ry={34} fill={C.soot} opacity={0.2} />
      <g transform="translate(-256 131) scale(0.88)">
        {/* 取っ手 (提げ手) */}
        <path d="M 500 352 Q 700 150 900 352" fill="none" stroke={KRP.ink} strokeWidth={26} />
        <path d="M 500 352 Q 700 150 900 352" fill="none" stroke={BP.steelDark} strokeWidth={15} />
        {/* 取っ手の留め金 */}
        {[500, 900].map((hx) => (
          <g key={hx}>
            <rect x={hx - 30} y={344} width={60} height={62} rx={10}
              fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={hx} cy={360} r={13} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
            <HexBolt x={hx} y={392} r={14} />
          </g>
        ))}
        {/* 胴 (下へ絞る) */}
        <path d="M 474 392 L 926 392 L 862 756 L 538 756 Z"
          fill={C.castIronPale} stroke={KRP.ink} strokeWidth={9} />
        {/* 口縁 */}
        <rect x={462} y={366} width={476} height={38} rx={12}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={9} />
        {/* リベットの帯 */}
        <Rivets x1={492} y1={470} x2={908} y2={470} n={11} r={10} fill={BP.ironDark} />
        <Rivets x1={514} y1={618} x2={886} y2={618} n={9} r={10} fill={BP.ironDark} />
        <line x1={486} y1={520} x2={914} y2={520} stroke={BP.ironDark} strokeWidth={7} opacity={0.6} />
        {/* 底の縁 */}
        <rect x={528} y={742} width={344} height={32} rx={10}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={8} />
        {/* 石炭の塊 */}
        {lumps.map(([lx, ly, ls], i) => (
          <g key={i} transform={`translate(${700 + lx} ${392 + ly})`}>
            <path d={lumpPath(ls)} fill={C.soot} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${-20 * ls} ${-16 * ls} L ${8 * ls} ${-4 * ls}`}
              stroke={C.sootPale} strokeWidth={5} />
          </g>
        ))}
      </g>
      {/* 最後の石炭が1つ転がって止まる */}
      <g transform={`translate(${556 + roll * 120} ${455 + roll * 352}) rotate(${roll * 400})`}
        opacity={roll > 0.01 ? 1 : 0}>
        <path d={lumpPath(1.0)} fill={C.soot} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -22 -18 L 10 -4" stroke={C.sootPale} strokeWidth={5} />
      </g>

      <XMark x={360} y={620} s={4.2} t={xm} />
      <TagPlate x={366} y={286} text="もう運ばない" size={46} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={1310} y={560} text="管で届く" size={44} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #163 そして1960年代。ビルに、空調が入ります。 =====
// 格: 並
// どこ: 1960年代のオフィス。★ここで色が灰青に切り替わる
// 演出: 天井に剥き出しのダクトが横に走り、吹き出し口が2つ。下にデスク2つ・書類・電話
// 動き: 吹き出し口から空気の流れの線が降りてくる / 書類の端がめくれる
// 絵: 1960年代のオフィス。天井のダクトと吹き出し口。デスクと書類。色が灰青に変わる
const Kb4bKuuchou1960: React.FC<{ f: number }> = ({ f }) => {
  const flow = easeOut(seg(f, 6, 24));
  const curl = easeOut(seg(f, 18, 38));
  const dash = -(f * 7) % 46;
  return (
    <Frame f={f} seed={756} bg={C.airPale}>
      {/* 天井・壁・床 (ぜんぶ灰青とグレー) */}
      <rect x={-40} y={-40} width={2000} height={240} fill={C.snow} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.airBlue} strokeWidth={4} opacity={0.8}>
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-20 + i * 160} y1={-20} x2={-20 + i * 160} y2={196} />)}
        <line x1={-20} y1={70} x2={1940} y2={70} />
      </g>
      <rect x={-40} y={200} width={2000} height={596} fill={C.airBlue} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.steelCool} strokeWidth={5} opacity={0.75}>
        <line x1={-20} y1={470} x2={1940} y2={470} />
        {[160, 620, 1080, 1540].map((x) => <line key={x} x1={x} y1={206} x2={x} y2={790} />)}
      </g>
      <rect x={-40} y={796} width={2000} height={324} fill={C.floorCool} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.steelCool} strokeWidth={5} opacity={0.8}>
        {[870, 960, 1060].map((y) => <line key={y} x1={-20} y1={y} x2={1940} y2={y} />)}
      </g>

      {/* 吊りボルト */}
      {[400, 1480].map((x) => (
        <g key={x}>
          <rect x={x - 9} y={30} width={18} height={150} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={x - 46} y={168} width={92} height={22} rx={5} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 剥き出しのダクト (横に走る) */}
      <rect x={-40} y={186} width={2000} height={112} rx={14}
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={6} opacity={0.65}>
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <line x1={-20 + i * 160} y1={190} x2={-20 + i * 160} y2={294} />
            <line x1={-8 + i * 160} y1={190} x2={-8 + i * 160} y2={294} />
          </g>
        ))}
      </g>
      <rect x={-40} y={210} width={2000} height={14} fill={KRP.white} opacity={0.6} />
      {/* 吹き出し口 2つ */}
      <Kb4bOutlet x={420} y={296} w={250} h={104} blades={5} f={f} />
      <Kb4bOutlet x={1260} y={296} w={250} h={104} blades={5} f={f} />

      {/* 空気の流れの線 (降りてくる) */}
      <g opacity={0.45 + 0.55 * flow} strokeLinecap="round" fill="none">
        {[545, 1385].map((cx) => (
          <g key={cx}>
            {[-72, -24, 24, 72].map((d, i) => (
              <path key={d}
                d={`M ${cx + d} 406 C ${cx + d * 1.6} ${470 + i * 10} ${cx + d * 0.5} ${540} ${cx + d * 2.1} ${600 + flow * 60}`}
                stroke={KRP.white} strokeWidth={9} strokeDasharray="30 16" strokeDashoffset={dash}
                opacity={0.9} />
            ))}
          </g>
        ))}
      </g>

      {/* 働く人1人 (デスクの向こう) */}
      <Person x={520} y={806} s={1.0} cloth="#45566B" clothDark="#32404F"
        face="normal" gaze={[0, 3]} f={f} />
      {/* 椅子 */}
      <g>
        <rect x={900} y={566} width={24} height={246} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={900} y={566} width={110} height={22} rx={8} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
        <rect x={886} y={688} width={140} height={22} rx={7} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1000} y={710} width={20} height={102} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* デスク1 (手前) */}
      <rect x={160} y={612} width={640} height={28} rx={6} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
      <rect x={176} y={640} width={212} height={176} fill={C.steelCool} stroke={KRP.ink} strokeWidth={6} />
      <rect x={196} y={664} width={172} height={14} fill={BP.steelDark} opacity={0.7} />
      <rect x={196} y={724} width={172} height={14} fill={BP.steelDark} opacity={0.7} />
      <rect x={756} y={640} width={26} height={176} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 書類の束 (端がめくれる) */}
      <g transform="translate(700 612)">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-75 + i * 4} y={-18 - i * 9} width={150} height={18} rx={3}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        <g transform={`translate(75 -58) rotate(${-curl * 46})`}>
          <path d="M 0 0 Q -36 -16 -75 -6 L -75 12 Q -36 20 0 16 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.steelCool} strokeWidth={3.5}>
            <line x1={-64} y1={0} x2={-12} y2={6} />
            <line x1={-64} y1={10} x2={-12} y2={14} />
          </g>
        </g>
      </g>

      {/* デスク2 (奥・電話つき) */}
      <rect x={1060} y={646} width={600} height={26} rx={6} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
      <rect x={1080} y={672} width={200} height={144} fill={C.steelCool} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1098} y={694} width={162} height={13} fill={BP.steelDark} opacity={0.7} />
      <rect x={1616} y={672} width={24} height={144} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 卓上の電話 */}
      <g transform="translate(1520 646)">
        <rect x={-66} y={-54} width={132} height={56} rx={10} fill={C.ink2} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-26} r={20} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-26} r={7} fill={KRP.ink} />
        <rect x={-74} y={-82} width={148} height={30} rx={14} fill={C.soot} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 66 -40 q 34 6 34 26 q 0 18 -24 20" fill="none" stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 書類 2枚 (デスク2) */}
      {[0, 1].map((i) => (
        <rect key={i} x={1130 + i * 120} y={624 - i * 6} width={104} height={22} rx={3}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${i ? 4 : -3} ${1182 + i * 120} 636)`} />
      ))}

      <TagPlate x={1690} y={420} text="1960年代" size={52} t={seg(f, 8, 22)} fill={C.snow} />
    </Frame>
  );
};

// ===== #164 家庭に行き渡るのは、1980年代の後半です。 =====
// 格: 山
// どこ: 昭和末の居間。砂壁と長押、畳。右の壁に大きな壁掛けエアコン
// 演出: ★方眼紙の年表をやめて部屋の中にした枚 (#161〜#166 が図ばかりになるのを断つ2枚目)。
//   年号は札と壁のカレンダー (1987) が持つので、年表を捨てても文の意味は落ちない。
//   左の空白つぶしは、箱型のブラウン管テレビを床置きで大きく入れることで解く。
//   真ん中には役目を終えた扇風機 (赤い×)。エアコンは幅530でこの絵の主役。
// 動き: 吹き出しの羽が開く / 風の破線が流れる / 室外機の羽根が回る /
//   テレビの走査線が下へ流れる / 柱時計の針が動く / 扇風機は止まったまま
const Kb4bKatei1980: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 4, 18));          // ルーバーが開く
  const wind = easeOut(seg(f, 12, 34));         // 風が届く
  const xm = seg(f, 20, 34);                    // 扇風機に×
  const dash = -(f * 7) % 46;
  const WALL_B = 660;                           // 砂壁と畳の境
  return (
    <Frame f={f} seed={757} bg={KRP.cream}>
      {/* ---- 砂壁 ---- */}
      <rect x={-40} y={-40} width={2000} height={WALL_B + 40} fill={C.showa} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={-40} y1={40 + i * 86} x2={1960} y2={44 + i * 86}
          stroke={C.showaDark} strokeWidth={3} opacity={0.5} />
      ))}
      {/* 砂壁のざらつき */}
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={60 + ((i * 397) % 1840)} cy={30 + ((i * 251) % 600)}
          r={3 + (i % 3)} fill={C.showaDark} opacity={0.4} />
      ))}
      {/* 長押 (なげし) */}
      <rect x={-40} y={150} width={2000} height={30} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-40} y1={158} x2={1960} y2={158} stroke={BP.woodLight} strokeWidth={5} opacity={0.6} />
      {/* 畳寄せ (幅木) */}
      <rect x={-40} y={WALL_B - 26} width={2000} height={26} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />

      {/* ---- 畳 ---- */}
      <rect x={-40} y={WALL_B} width={2000} height={1120 - WALL_B} fill={C.tatami} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-40} y1={WALL_B + 110 + i * 130} x2={1960} y2={WALL_B + 96 + i * 130}
          stroke={C.tatamiDark} strokeWidth={7} />
      ))}
      {[520, 1180].map((x) => (
        <line key={x} x1={x} y1={WALL_B} x2={x - 30} y2={1120}
          stroke={C.tatamiDark} strokeWidth={7} />
      ))}
      {/* 畳の目 */}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={i} x1={-40 + i * 68} y1={WALL_B} x2={-52 + i * 68} y2={1120}
          stroke={C.tatamiDark} strokeWidth={2} opacity={0.35} />
      ))}

      {/* ---- 柱時計 (長押から吊る。下端 304 でテレビ上のレース 310 に触れない) ---- */}
      <g>
        <line x1={300} y1={176} x2={300} y2={150} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={300} cy={238} r={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={300} cy={238} r={54} fill="none" stroke={C.showaDark} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={300 + Math.sin((i * Math.PI) / 6) * 44} y1={238 - Math.cos((i * Math.PI) / 6) * 44}
            x2={300 + Math.sin((i * Math.PI) / 6) * 52} y2={238 - Math.cos((i * Math.PI) / 6) * 52}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        <g transform={`rotate(${f * 1.6} 300 238)`}>
          <line x1={300} y1={238} x2={300} y2={198} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        </g>
        <g transform={`rotate(${-54 + f * 6} 300 238)`}>
          <line x1={300} y1={238} x2={300} y2={186} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
        <circle cx={300} cy={238} r={7} fill={KRP.ink} />
      </g>

      {/* ---- 日めくりカレンダー (1987) ---- */}
      <g>
        <rect x={556} y={196} width={184} height={236} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={556} y={196} width={184} height={62} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
        <text x={648} y={244} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={42} fill={KRP.white}>1987</text>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={574} y1={292 + i * 34} x2={722} y2={292 + i * 34}
            stroke={C.showaDark} strokeWidth={5} opacity={0.75} />
        ))}
        <text x={648} y={414} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={44} fill={KRP.ink}>夏</text>
        <circle cx={648} cy={186} r={10} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ---- 壁掛けエアコン (この絵の主役・幅530) ---- */}
      <g>
        {/* 配管カバー (右の壁を下りて床へ) */}
        <rect x={1796} y={300} width={46} height={400} fill={C.snow} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1796} y1={352 + i * 92} x2={1842} y2={352 + i * 92}
            stroke={C.showaDark} strokeWidth={4} />
        ))}
        {/* 据付の金具 */}
        <rect x={1224} y={300} width={540} height={16} fill={C.steelCool} stroke={KRP.ink} strokeWidth={5} />
        {/* 本体 */}
        <rect x={1230} y={108} width={530} height={200} rx={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
        {/* 上面の吸込みグリル */}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={1262 + i * 34} y1={126} x2={1262 + i * 34} y2={182}
            stroke={C.showaDark} strokeWidth={5} opacity={0.8} />
        ))}
        <rect x={1248} y={118} width={494} height={72} rx={12} fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 吹き出し口 */}
        <rect x={1252} y={222} width={486} height={74} rx={10} fill={C.ink2} stroke={KRP.ink} strokeWidth={7} />
        {/* 開くルーバー: 羽根は正面から見ると薄くなっていく (寝かせると見かけの高さが縮む) */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1256} y={230 + i * 22} width={478}
            height={lerp(20, 7, open)} rx={5}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 下へ振り出す大きなフラップ (上の辺が蝶番) */}
        <path d={`M 1252 294 L 1738 294 L ${1730} ${294 + 48 * open} L ${1262} ${294 + 54 * open} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1268} y1={294 + 36 * open} x2={1722} y2={294 + 32 * open}
          stroke={C.showaDark} strokeWidth={4} opacity={0.7} />
        {/* 銘板と運転ランプ (グリルと吹き出し口のあいだの帯に置く) */}
        <rect x={1630} y={194} width={96} height={24} rx={6} fill={C.snow} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1278} cy={206} r={10} fill={C.flameCore} stroke={KRP.ink} strokeWidth={4}
          opacity={0.4 + 0.6 * open} />
      </g>

      {/* 吹き出しの風 (下へ回り込む破線) */}
      <g fill="none" stroke={C.airBlue} strokeWidth={9} strokeLinecap="round"
        strokeDasharray="30 22" strokeDashoffset={dash} opacity={0.3 + 0.7 * wind}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${1300 + i * 104} 330 Q ${1240 + i * 104} ${470 + i * 14} ${1080 + i * 96} ${600 + i * 10}`} />
        ))}
      </g>

      {/* ---- 箱型のブラウン管テレビ (左の空白つぶし) ---- */}
      <g>
        {/* 台 */}
        <rect x={76} y={624} width={498} height={78} rx={8} fill={BP.wood} stroke={KRP.ink} strokeWidth={8} />
        <line x1={76} y1={660} x2={574} y2={660} stroke={BP.woodDark} strokeWidth={5} />
        {[132, 514].map((x) => (
          <rect key={x} x={x} y={702} width={34} height={86} rx={6}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 筐体 */}
        <rect x={104} y={326} width={444} height={300} rx={14} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={9} />
        {/* ブラウン管 (角丸の深い画面) */}
        <rect x={132} y={352} width={312} height={246} rx={34} fill={C.ink2} stroke={KRP.ink} strokeWidth={8} />
        <rect x={148} y={366} width={280} height={218} rx={28} fill={C.airBlue} opacity={0.5} />
        {/* 走査線 (下へ流れる) */}
        <g clipPath="none" opacity={0.5}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={150} y1={372 + ((i * 28 + f * 3) % 206)} x2={426} y2={372 + ((i * 28 + f * 3) % 206)}
              stroke={C.snow} strokeWidth={5} />
          ))}
        </g>
        {/* 画面の映り込み */}
        <path d="M 162 378 L 232 378 L 184 578 L 156 578 Z" fill={KRP.white} opacity={0.22} />
        {/* つまみ2つとスピーカー */}
        <circle cx={498} cy={400} r={27} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
        <line x1={498} y1={400} x2={498} y2={379} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={498} cy={474} r={27} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
        <line x1={498} y1={474} x2={514} y2={460} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <rect x={470} y={514} width={56} height={90} rx={6} fill={C.showaDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={476} y1={526 + i * 18} x2={520} y2={526 + i * 18}
            stroke={KRP.ink} strokeWidth={3} opacity={0.7} />
        ))}
        {/* 上のレースと花瓶 */}
        <path d="M 150 326 L 510 326 L 494 310 L 166 310 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 花瓶は左端へ寄せる (真ん中に置くと柱時計と重なる) */}
        <g transform="translate(-112 0)">
          <path d="M 300 310 Q 286 272 302 250 Q 330 236 334 268 Q 336 292 328 310 Z"
            fill={C.glass} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 314 250 Q ${306 + Math.sin(f / 15) * 6} 212 ${330 + Math.sin(f / 15) * 8} 192`}
            fill="none" stroke={C.tatamiDark} strokeWidth={6} strokeLinecap="round" />
          <circle cx={332 + Math.sin(f / 15) * 8} cy={186} r={15} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>

      {/* ---- 役目を終えた扇風機 ---- */}
      <g>
        {/* 台と柱 */}
        <ellipse cx={742} cy={768} rx={94} ry={24} fill={C.tatamiDark} opacity={0.35} />
        <path d="M 700 760 Q 742 744 784 760 Q 784 776 742 782 Q 700 776 700 760 Z"
          fill={C.steelCool} stroke={KRP.ink} strokeWidth={7} />
        <rect x={730} y={600} width={24} height={162} fill={C.snow} stroke={KRP.ink} strokeWidth={6} />
        <rect x={716} y={652} width={52} height={26} rx={6} fill={C.showaDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 首 */}
        <rect x={718} y={576} width={48} height={36} rx={8} fill={C.snow} stroke={KRP.ink} strokeWidth={6} />
        {/* 羽根のガード */}
        <circle cx={742} cy={500} r={104} fill={KRP.white} opacity={0.5} />
        {/* 止まっている羽根3枚 */}
        <g>
          {[0, 1, 2].map((i) => (
            <path key={i}
              transform={`rotate(${18 + i * 120} 742 500)`}
              d="M 742 500 Q 790 470 806 500 Q 790 538 742 500 Z"
              fill={C.airPale} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        <circle cx={742} cy={500} r={104} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <circle cx={742} cy={500} r={78} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
        <circle cx={742} cy={500} r={50} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={742 + Math.cos((i * Math.PI) / 6) * 24} y1={500 + Math.sin((i * Math.PI) / 6) * 24}
            x2={742 + Math.cos((i * Math.PI) / 6) * 102} y2={500 + Math.sin((i * Math.PI) / 6) * 102}
            stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        ))}
        <circle cx={742} cy={500} r={26} fill={C.snow} stroke={KRP.ink} strokeWidth={7} />
      </g>
      <XMark x={742} y={500} s={3.0} t={xm} />

      {/* ---- 座卓と湯呑・団扇 ---- */}
      <g>
        <ellipse cx={1020} cy={812} rx={190} ry={30} fill={C.tatamiDark} opacity={0.3} />
        <rect x={860} y={722} width={330} height={26} rx={8} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
        <line x1={866} y1={730} x2={1184} y2={730} stroke={BP.woodLight} strokeWidth={4} opacity={0.6} />
        {[892, 1152].map((x) => (
          <rect key={x} x={x} y={748} width={20} height={48} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 湯呑2つ */}
        {[948, 1012].map((x, i) => (
          <g key={x}>
            <path d={`M ${x - 22} 684 L ${x - 17} 722 L ${x + 17} 722 L ${x + 22} 684 Z`}
              fill={i ? C.snow : C.glass} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={x} cy={684} rx={22} ry={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 団扇 (使われずに置いてある) */}
        <g transform="translate(1116 706) rotate(-14)">
          <ellipse cx={0} cy={0} rx={44} ry={30} fill={C.snow} stroke={KRP.ink} strokeWidth={6} />
          <rect x={38} y={-6} width={46} height={12} rx={5} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
          {[-16, 0, 16].map((d) => (
            <line key={d} x1={-34} y1={d * 0.6} x2={34} y2={d * 0.6} stroke={C.showaDark} strokeWidth={3} />
          ))}
        </g>
      </g>

      {/* ---- 見上げる親子 ---- */}
      <ellipse cx={1380} cy={800} rx={120} ry={26} fill={C.tatamiDark} opacity={0.32} />
      <Person x={1380} y={792} s={1.26} f={f} cloth="#8C6E8E" clothDark="#6B5070"
        face="smile" gaze={[7, -7]} hair="cap" />
      {/* 指さす腕 (上のエアコンへ) */}
      <g transform="translate(1455 606) rotate(-74)">
        <rect x={0} y={-15} width={128} height={30} rx={15} fill="#8C6E8E" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={140} cy={0} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <ellipse cx={1620} cy={806} rx={92} ry={22} fill={C.tatamiDark} opacity={0.3} />
      <Person x={1620} y={800} s={0.98} f={f} phase={2} cloth="#D9A24A" clothDark="#AD7A2C"
        face="surprised" gaze={[5, -8]} />

      <TagPlate x={330} y={100} text="1980年代後半" size={44} t={seg(f, 0, 12)} />
      <TagPlate x={1490} y={60} text="エアコン" size={48} t={seg(f, 6, 20)} />
      <TagPlate x={980} y={322} text="もう要らない" size={40} t={seg(f, 26, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #165 これが効いたのは、窓を開けなくて済むからです。 =====
// 格: 図
// どこ: 図。左に窓、右にダクトの吹き出し口を大きく左右に並べる
// 演出: 窓に赤い×、吹き出し口に○。真ん中に入れ替わりの矢印
// 動き: 把手がわずかに動く / 吹き出し口から空気が流れる / ×→○の順に出る
// 絵: 窓に赤い×、ダクトに○。効いた理由は換気の置き換えだと言う
const Kb4bMadoWoAkenai: React.FC<{ f: number }> = ({ f }) => {
  const swap = easeOut(seg(f, 6, 20));
  const dash = -(f * 8) % 46;
  const wig = Math.sin(f / 9) * 5;
  return (
    <Frame f={f} seed={758} bg={C.snow}>
      <GridPaper />
      {/* ===== 左: 窓 (枠・桟・ガラスの映り・把手) ===== */}
      <g>
        <rect x={168} y={222} width={676} height={500} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={9} />
        <rect x={204} y={258} width={604} height={428} fill={C.glass} stroke={KRP.ink} strokeWidth={8} />
        {/* 桟 (十字) */}
        <rect x={492} y={258} width={30} height={428} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={204} y={456} width={604} height={30} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={7} />
        {/* ガラスの映り */}
        <g opacity={0.65}>
          <path d="M 240 440 L 400 272 L 452 272 L 240 496 Z" fill={KRP.white} />
          <path d="M 548 672 L 740 472 L 790 472 L 572 672 Z" fill={KRP.white} />
        </g>
        {/* 把手 (クレセント錠) */}
        <g transform={`translate(812 470) rotate(${wig})`}>
          <rect x={-18} y={-44} width={36} height={88} rx={10} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 0 -44 q 44 -8 44 36" fill="none" stroke={BP.brassDark} strokeWidth={17} />
          <path d="M 0 -44 q 44 -8 44 36" fill="none" stroke={KRP.ink} strokeWidth={6} />
          <HexBolt x={0} y={26} r={11} fill={BP.brassDark} />
        </g>
        {/* 窓台 */}
        <rect x={140} y={716} width={732} height={28} rx={7} fill={BP.wood} stroke={KRP.ink} strokeWidth={8} />
      </g>
      <XMark x={506} y={470} s={3.3} t={seg(f, 14, 26)} />

      {/* ===== 右: ダクトの吹き出し口 ===== */}
      <g>
        {/* 奥のダクト */}
        <rect x={1140} y={168} width={560} height={74} rx={14}
          fill={BP.steelLight} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 1300 242 L 1256 290 L 1620 290 L 1576 242 Z"
          fill={C.steelCool} stroke={KRP.ink} strokeWidth={8} />
        <Kb4bOutlet x={1096} y={286} w={680} h={436} blades={6} f={f} />
        {/* 吹き出す空気 */}
        <g fill="none" strokeLinecap="round" opacity={0.9}>
          {[-180, -60, 60, 180].map((d, i) => (
            <path key={d}
              d={`M ${1436 + d} 730 C ${1436 + d * 1.2} 790 ${1436 + d * 0.8} 760 ${1436 + d * 1.35} 802`}
              stroke={C.airBlue} strokeWidth={11} strokeDasharray="26 16"
              strokeDashoffset={dash + i * 8} />
          ))}
        </g>
      </g>
      <Maru x={1436} y={486} s={2.6} t={seg(f, 26, 38)} />

      {/* ===== 真ん中: 入れ替わりの矢印 ===== */}
      <g opacity={swap}>
        <path d="M 912 392 C 960 334 1000 334 1048 392" fill="none"
          stroke={KRP.ink} strokeWidth={13} />
        <polygon points="1048,392 1024,356 1062,360" fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1048 556 C 1000 614 960 614 912 556" fill="none"
          stroke={KRP.ink} strokeWidth={13} />
        <polygon points="912,556 936,592 898,588" fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <line x1={980} y1={210} x2={980} y2={742} stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="20 16" opacity={0.5} />

      <TagPlate x={506} y={768} text="窓で換気" size={48} t={seg(f, 20, 32)} color={KRP.red} />
      <TagPlate x={1436} y={768} text="機械で換気" size={48} t={seg(f, 32, 42)} color={KRP.green} />
    </Frame>
  );
};

// ===== #166 地上10メートルと100メートルで、風速は約2倍。 =====
// 格: 図
// どこ: 図。画面の左に縦の高さの目盛りを天地いっぱいに引く
// 演出: 10m と 100m から横向きの風の矢印。上は下のちょうど2倍の長さ
// 動き: 下の矢印 → 上の矢印 の順に伸びる / 矢先のちぎれる線が風にゆれる
// 絵: 縦の高さの目盛り。10mと100mで風の矢印の長さが2倍になる
const Kb4bFuusoku2Bai: React.FC<{ f: number }> = ({ f }) => {
  const SX = 250, Y0 = 820, Y100 = 136;
  const yOf = (m: number) => Y0 + ((Y100 - Y0) * m) / 100;
  const L = 440;                                      // 10m の矢印の長さ
  const t1 = seg(f, 6, 22), t2 = seg(f, 20, 36);
  const tear = (i: number) => Math.sin(f / 4 + i * 1.7) * 14;
  return (
    <Frame f={f} seed={759} bg={C.snow}>
      <GridPaper />
      {/* 地面 */}
      <line x1={-20} y1={Y0} x2={1940} y2={Y0} stroke={KRP.ink} strokeWidth={11} />
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.55}>
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={-20 + i * 66} y1={Y0} x2={-48 + i * 66} y2={Y0 + 30} />
        ))}
      </g>
      {/* 縦の高さの目盛り (天地いっぱい) */}
      <line x1={SX} y1={Y0} x2={SX} y2={Y100 - 30} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => {
        const m = (i + 1) * 10;
        const major = m === 10 || m === 100;
        return (
          <g key={m}>
            <line x1={SX - (major ? 48 : 30)} y1={yOf(m)} x2={SX + (major ? 48 : 30)} y2={yOf(m)}
              stroke={KRP.ink} strokeWidth={major ? 10 : 7} />
            <text x={SX - 62} y={yOf(m) + 15} textAnchor="end" fontFamily={FONT}
              fontWeight={major ? 900 : 800} fontSize={major ? 46 : 36}
              fill={KRP.ink} opacity={major ? 1 : 0.68}>{m}m</text>
          </g>
        );
      })}
      {/* 長さをくらべる物差し (上の矢印の上。1+1 = 2倍) */}
      <g opacity={easeOut(seg(f, 28, 40))}>
        {[0, 1].map((i) => (
          <g key={i}>
            <line x1={SX + 30 + i * L} y1={Y100 - 92} x2={SX + 30 + (i + 1) * L} y2={Y100 - 92}
              stroke={KRP.ink} strokeWidth={7} />
            <line x1={SX + 30 + i * L} y1={Y100 - 110} x2={SX + 30 + i * L} y2={Y100 - 74}
              stroke={KRP.ink} strokeWidth={7} />
            <text x={SX + 30 + (i + 0.5) * L} y={Y100 - 104} textAnchor="middle"
              fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>1</text>
          </g>
        ))}
        <line x1={SX + 30 + 2 * L} y1={Y100 - 110} x2={SX + 30 + 2 * L} y2={Y100 - 74}
          stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 100m の風 (2倍) */}
      <ForceArrow x={SX + 30} y={Y100} len={L * 2} rot={0} w={30} color={KRP.red} t={t2} />
      <g opacity={t2} stroke={KRP.red} strokeWidth={8} strokeLinecap="round">
        {[0, 1, 2].map((i) => (
          <line key={i} x1={SX + 40 + L * 2 + i * 44} y1={Y100 - 46 + i * 46}
            x2={SX + 92 + L * 2 + i * 44} y2={Y100 - 46 + i * 46 + tear(i)} />
        ))}
      </g>
      <TagPlate x={SX + 30 + L * 2 + 236} y={Y100 + 142} text="100mの風" size={42}
        t={seg(f, 24, 36)} color={KRP.red} />
      {/* 10m の風 */}
      <ForceArrow x={SX + 30} y={yOf(10)} len={L} rot={0} w={26} color={BP.steelDark} t={t1} />
      <g opacity={t1} stroke={BP.steelDark} strokeWidth={7} strokeLinecap="round">
        {[0, 1].map((i) => (
          <line key={i} x1={SX + 40 + L + i * 40} y1={yOf(10) - 34 + i * 40}
            x2={SX + 84 + L + i * 40} y2={yOf(10) - 34 + i * 40 + tear(i + 3)} />
        ))}
      </g>
      <TagPlate x={SX + 30 + L + 216} y={yOf(10) + 10} text="10mの風" size={42}
        t={seg(f, 10, 24)} />
      {/* 結論 */}
      <TagPlate x={1510} y={470} text="約2倍" size={66} t={seg(f, 30, 42)} color={KRP.red} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== #167 高いところの風は、強すぎて開けられません。 =====
// 格: 山
// どこ: 高層階の窓際。手前は室内、ガラスの向こうは暴風
// 演出: ★内と外の差が主題。ガラスの境目をはっきり描く。内のカップの水面は平ら
// 動き: 外の雨が横に走る / 旗がばたつく / 樹が曲がる / 内側はまったく動かない
// 絵: 高層の窓際。閉じたガラスの外で旗や樹が倒れ、雨が横に走る。内側は静か
const Kb4bKazeGaTsuyosugi: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.04 * easeOut(seg(f, 0, 42));
  const GX = 372, GY = 140, GW = 1332, GH = 650;
  const flap = Math.sin(f / 3.4);
  const bend = 1 + 0.12 * Math.sin(f / 5);
  return (
    <Frame f={f} seed={760} bg={C.airPale}>
      <g transform={zoomAt(z, 940, 470)}>
        {/* 室内の壁・床 */}
        <rect x={-40} y={-40} width={2000} height={880} fill={C.airBlue} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={830} width={2000} height={290} fill={C.floorCool} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.steelCool} strokeWidth={5} opacity={0.8}>
          {[900, 990, 1070].map((y) => <line key={y} x1={-20} y1={y} x2={1940} y2={y} />)}
        </g>

        {/* ===== ガラスの向こう (外) ===== */}
        <g>
          <rect x={GX} y={GY} width={GW} height={GH} fill={C.storm} />
          {/* 雲の筋 */}
          <g opacity={0.45}>
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={GX + 300 + i * 420 + ((f * 9) % 600)} cy={GY + 90 + i * 54}
                rx={300} ry={40} fill={C.ink2} />
            ))}
          </g>
          {/* 遠くの他の高層ビル */}
          {[[GX + 70, 300, 160], [GX + 268, 232, 134], [GX + 1020, 268, 150], [GX + 1196, 346, 118]]
            .map(([bx, by, bw], i) => (
              <g key={i}>
                <rect x={bx} y={by} width={bw} height={GY + GH - by} fill={C.ink2}
                  stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
                {Array.from({ length: 6 }, (_, r) => (
                  <rect key={r} x={bx + 20} y={by + 30 + r * 58} width={bw - 40} height={20}
                    fill={C.glass} opacity={0.35} />
                ))}
              </g>
            ))}
          {/* 旗: 水平にちぎれる */}
          <g>
            <rect x={GX + 1050} y={GY + 150} width={16} height={330}
              fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${GX + 1050} ${GY + 162}
                      C ${GX + 950} ${GY + 162 + flap * 26} ${GX + 880} ${GY + 190 - flap * 22} ${GX + 790} ${GY + 180 + flap * 18}
                      L ${GX + 806} ${GY + 240 + flap * 14}
                      C ${GX + 890} ${GY + 248 - flap * 20} ${GX + 960} ${GY + 226 + flap * 24} ${GX + 1050} ${GY + 232} Z`}
              fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            {/* ちぎれ */}
            <g stroke={KRP.red} strokeWidth={7} strokeLinecap="round">
              {[0, 1, 2].map((i) => (
                <line key={i} x1={GX + 790 - i * 6} y1={GY + 190 + i * 22}
                  x2={GX + 736 - i * 18} y2={GY + 186 + i * 22 + flap * 10} />
              ))}
            </g>
          </g>
          {/* 街路樹 (はるか下・倒れるように曲がる) */}
          <g transform={`translate(${GX + 190} ${GY + GH - 10})`}>
            <path d={`M 0 0 C ${18 * bend} -46 ${54 * bend} -74 ${96 * bend} -92`}
              fill="none" stroke={BP.woodDark} strokeWidth={17} strokeLinecap="round" />
            <ellipse cx={96 * bend} cy={-104} rx={62} ry={36}
              fill={KRP.green} stroke={KRP.ink} strokeWidth={5} opacity={0.85}
              transform={`rotate(${-18 * bend} ${96 * bend} -104)`} />
            <g stroke={KRP.green} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
              {[0, 1, 2].map((i) => (
                <line key={i} x1={96 * bend + 50} y1={-116 + i * 20}
                  x2={96 * bend + 108} y2={-110 + i * 20 + flap * 6} />
              ))}
            </g>
          </g>
          {/* 雨が横に走る */}
          <g stroke={C.snow} strokeWidth={6} strokeLinecap="round" opacity={0.85}>
            {Array.from({ length: 30 }, (_, i) => {
              const base = (i * 173 + f * 72) % (GW + 280);
              const px = GX + GW - base;
              const py = GY + 20 + ((i * 97) % (GH - 40));
              return <line key={i} x1={px} y1={py} x2={px + 210} y2={py + 26} />;
            })}
          </g>
          {/* 水しぶき */}
          <g fill={C.snow} opacity={0.5}>
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} cx={GX + ((i * 311 + f * 40) % GW)} cy={GY + 60 + ((i * 211) % (GH - 90))}
                r={4 + rnd(i) * 5} />
            ))}
          </g>
        </g>

        {/* ===== ガラスの境目 (はっきり) ===== */}
        <g>
          {/* ガラス面の映り込み */}
          <path d={`M ${GX + 120} ${GY + GH} L ${GX + 520} ${GY} L ${GX + 640} ${GY} L ${GX + 240} ${GY + GH} Z`}
            fill={KRP.white} opacity={0.17} />
          <path d={`M ${GX + 760} ${GY + GH} L ${GX + 1160} ${GY} L ${GX + 1222} ${GY} L ${GX + 822} ${GY + GH} Z`}
            fill={KRP.white} opacity={0.13} />
          {/* 方立 */}
          <rect x={GX + GW / 2 - 22} y={GY} width={44} height={GH}
            fill={C.steelCool} stroke={KRP.ink} strokeWidth={8} />
          {/* 外枠 (厚み) */}
          <rect x={GX - 26} y={GY - 26} width={GW + 52} height={GH + 52}
            fill="none" stroke={BP.steelDark} strokeWidth={46} />
          <rect x={GX - 26} y={GY - 26} width={GW + 52} height={GH + 52}
            fill="none" stroke={KRP.ink} strokeWidth={9} />
          <rect x={GX} y={GY} width={GW} height={GH} fill="none" stroke={KRP.ink} strokeWidth={9} />
          <Rivets x1={GX - 26} y1={GY - 50} x2={GX + GW + 26} y2={GY - 50} n={14} r={8} />
          {/* 窓台 */}
          <rect x={GX - 60} y={GY + GH + 22} width={GW + 120} height={34} rx={8}
            fill={C.steelCool} stroke={KRP.ink} strokeWidth={8} />
        </g>

        {/* ===== 室内 (静か) ===== */}
        {/* カーテン: まっすぐ */}
        {[[244, 0], [1738, 0]].map(([cx], i) => (
          <g key={i}>
            <rect x={cx} y={88} width={110} height={710} rx={8}
              fill={C.snow} stroke={KRP.ink} strokeWidth={7} />
            <g stroke={C.airBlue} strokeWidth={6} opacity={0.9}>
              {[26, 54, 82].map((d) => <line key={d} x1={cx + d} y1={100} x2={cx + d} y2={790} />)}
            </g>
          </g>
        ))}
        {/* 窓に手をかけている人 */}
        <Person x={706} y={884} s={1.16} cloth="#3F5468" clothDark="#2D3E4E"
          face="worried" gaze={[4, -2]} f={f} still />
        {/* 伸ばした腕と手 (ガラスに触れている) */}
        <g>
          <rect x={742} y={690} width={200} height={40} rx={20}
            fill="#3F5468" stroke={KRP.ink} strokeWidth={6}
            transform="rotate(-22 742 710)" />
          <path d="M 930 630 q 30 -26 56 -6 q 10 -22 28 -4 q 14 -18 26 2 q 12 -12 20 8
                   l 2 58 q -4 30 -40 32 l -48 -2 q -38 -4 -44 -40 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.6}>
            <line x1={956} y1={640} x2={958} y2={676} />
            <line x1={986} y1={632} x2={988} y2={672} />
            <line x1={1014} y1={634} x2={1016} y2={672} />
          </g>
        </g>
        {/* テーブルとカップ (水面は平ら) */}
        <rect x={1200} y={766} width={520} height={28} rx={7}
          fill={BP.woodLight} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1240} y={794} width={26} height={160} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1660} y={794} width={26} height={160} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(1420 766)">
          <path d="M -58 -112 L -50 -4 L 50 -4 L 58 -112 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {/* 水面: まったく動かない水平線 */}
          <path d="M -52 -56 L 52 -56 L 49 -8 L -49 -8 Z" fill={C.glass} opacity={0.9} />
          <line x1={-52} y1={-56} x2={52} y2={-56} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 58 -94 q 34 16 0 46" fill="none" stroke={KRP.ink} strokeWidth={7} />
        </g>
      </g>
      <TagPlate x={1430} y={240} text="外は暴風" size={48} t={seg(f, 8, 22)} color={KRP.red} />
      <TagPlate x={288} y={744} text="内は静か" size={46} t={seg(f, 26, 40)} fill={C.snow} />
    </Frame>
  );
};

// ===== #168 いまのタワーマンションの窓は、全開にできません。 =====
// 格: 並
// どこ: 窓の金具への寄り。画面の2/3をストッパーの金具が占める
// 演出: ねじ3本・ばね・擦り傷・窓枠の木口・ガラスの縁まで描く。隙間に寸法の矢印
// 動き: 押す力で隙間がわずかに開き、ストッパーで止まる (止まった瞬間に金具が震える)
// 絵: 窓の金具に寄る。ストッパーで指の幅だけ開く。ねじ・ばね・金具の傷
const Kb4bZenkaiDekinai: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 4, 18)) * 76;          // 隙間
  const hit = seg(f, 18, 19);                        // 当たった瞬間
  const shake = hit * Math.sin((f - 18) * 2.4) * 7 * (1 - seg(f, 18, 30));
  const SX = 700;                                    // 固定枠の右端
  return (
    <Frame f={f} seed={761} bg={C.airPale}>
      {/* ===== 固定枠 (左) ===== */}
      <rect x={-40} y={90} width={SX + 40} height={790} fill={C.steelCool}
        stroke={KRP.ink} strokeWidth={9} />
      {/* 窓枠の木口 (年輪) */}
      <rect x={SX - 96} y={90} width={96} height={790} fill={BP.woodLight}
        stroke={KRP.ink} strokeWidth={8} />
      <g fill="none" stroke={BP.woodDark} strokeWidth={5} opacity={0.85}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${SX - 92} ${150 + i * 160} q 46 60 0 120`} />
        ))}
      </g>
      {/* ガラスの縁 (固定側) */}
      <rect x={-40} y={150} width={420} height={670} fill={C.glass} stroke={KRP.ink} strokeWidth={8} />
      <path d="M 40 790 L 300 180 L 352 180 L 96 790 Z" fill={KRP.white} opacity={0.3} />
      <rect x={356} y={150} width={28} height={670} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />

      {/* ===== 隙間 (外が見える) ===== */}
      <rect x={SX} y={90} width={Math.max(2, open + shake)} height={790} fill={C.night} />
      <g opacity={0.5}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={SX + 4} y1={180 + i * 150} x2={SX + open + shake - 4} y2={200 + i * 150}
            stroke={C.snow} strokeWidth={5} />
        ))}
      </g>

      {/* ===== 可動の障子 (右・開く) ===== */}
      <g transform={`translate(${open + shake} 0)`}>
        <rect x={SX} y={90} width={1300} height={790} fill={C.steelCool}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={SX} y={90} width={70} height={790} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={8} />
        <rect x={SX + 70} y={150} width={30} height={670} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={SX + 100} y={150} width={1180} height={670} fill={C.glass} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 900 810 L 1240 170 L 1300 170 L 960 810 Z" fill={KRP.white} opacity={0.26} />
        <path d="M 1300 810 L 1640 170 L 1676 170 L 1336 810 Z" fill={KRP.white} opacity={0.18} />
      </g>

      {/* ===== ストッパーの金具 (主役・画面の2/3) ===== */}
      <g transform={`translate(${shake * 0.4} 0)`}>
        {/* 台座 (固定枠に3本のねじで留まる) */}
        <rect x={262} y={326} width={452} height={226} rx={20}
          fill={C.castIron} stroke={KRP.ink} strokeWidth={10} />
        <rect x={290} y={354} width={396} height={170} rx={14}
          fill={C.castIronPale} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
        {/* ねじ3本 */}
        {[[344, 400], [344, 480], [640, 440]].map(([sx, sy], i) => (
          <g key={i}>
            <circle cx={sx} cy={sy} r={34} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={8} />
            <circle cx={sx} cy={sy} r={21} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            <line x1={sx - 17} y1={sy - 9} x2={sx + 17} y2={sy + 9}
              stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          </g>
        ))}
        {/* 擦り傷 */}
        <g stroke={BP.steelLight} strokeWidth={5} opacity={0.75} strokeLinecap="round">
          <line x1={420} y1={366} x2={560} y2={372} />
          <line x1={436} y1={380} x2={596} y2={388} />
          <line x1={408} y1={508} x2={530} y2={500} />
        </g>
        {/* ばね */}
        <Spring x={330} y={596} len={330} w={92} coils={7} vertical={false}
          color={BP.steelDark} stress={hit} />
        {/* アーム (長穴つき) */}
        <g transform={`translate(0 ${-shake * 0.2})`}>
          <rect x={660} y={398} width={720 + open} height={86} rx={22}
            fill={C.castIron} stroke={KRP.ink} strokeWidth={10} />
          <rect x={726} y={424} width={620 + open} height={34} rx={17}
            fill={C.night} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={BP.steelLight} strokeWidth={4} opacity={0.6}>
            <line x1={700} y1={414} x2={1240} y2={414} />
          </g>
          {/* 障子側のピン (長穴の中を走って止まる) */}
          <g transform={`translate(${780 + open} 441)`}>
            <circle cx={0} cy={0} r={40} fill={BP.brass} stroke={KRP.ink} strokeWidth={9} />
            <circle cx={0} cy={0} r={17} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* ストッパーの当たり (長穴の端の肉厚) */}
          <rect x={856} y={392} width={54} height={98} rx={10}
            fill={BP.ironDark} stroke={KRP.ink} strokeWidth={9} />
          <line x1={883} y1={404} x2={883} y2={478} stroke={BP.steelLight} strokeWidth={6} opacity={0.6} />
          {/* 端の軸 */}
          <HexBolt x={1358 + open} y={441} r={34} fill={BP.steel} />
        </g>
        {/* 当たった火花のような衝撃線 */}
        <g opacity={hit * (1 - seg(f, 18, 28))} stroke={KRP.red} strokeWidth={8} strokeLinecap="round">
          {[-1, 0, 1].map((i) => (
            <line key={i} x1={906} y1={441 + i * 34} x2={906 + 60} y2={441 + i * 54} />
          ))}
        </g>
      </g>

      {/* 隙間の寸法 (短い矢印) */}
      <g opacity={easeOut(seg(f, 22, 34))}>
        <line x1={SX} y1={690} x2={SX} y2={778} stroke={KRP.red} strokeWidth={6} />
        <line x1={SX + open} y1={690} x2={SX + open} y2={778} stroke={KRP.red} strokeWidth={6} />
        <line x1={SX - 52} y1={734} x2={SX + open + 52} y2={734} stroke={KRP.red} strokeWidth={7} />
        <polygon points={`${SX},734 ${SX + 34},716 ${SX + 34},752`} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <polygon points={`${SX + open},734 ${SX + open - 34},716 ${SX + open - 34},752`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* 押す力 */}
      <ForceArrow x={1870} y={208} len={280} rot={180} w={26} color={KRP.red}
        t={seg(f, 2, 14)} label="押す" labelSize={40} />

      <TagPlate x={420} y={250} text="ストッパー" size={44} t={seg(f, 8, 22)} />
      <TagPlate x={1160} y={760} text="ここで止まる" size={46} t={seg(f, 24, 38)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb4_netsu_mo_sukunai: (f) => <Kb4bNetsuMoSukunai f={f} />,
  kb4_ii_heya_ni_natta: (f) => <Kb4bIiHeyaNiNatta f={f} />,
  kb4_radiator: (f) => <Kb4bRadiator f={f} />,
  kb4_kan_de_okuru: (f) => <Kb4bKanDeOkuru f={f} />,
  kb4_nenryou_hakobanai: (f) => <Kb4bNenryouHakobanai f={f} />,
  kb4_1960_kuuchou: (f) => <Kb4bKuuchou1960 f={f} />,
  kb4_1980_katei: (f) => <Kb4bKatei1980 f={f} />,
  kb4_mado_wo_akenai: (f) => <Kb4bMadoWoAkenai f={f} />,
  kb4_fuusoku_2bai: (f) => <Kb4bFuusoku2Bai f={f} />,
  kb4_kaze_ga_tsuyosugi: (f) => <Kb4bKazeGaTsuyosugi f={f} />,
  kb4_zenkai_dekinai: (f) => <Kb4bZenkaiDekinai f={f} />,
};

export const K_B4B_MOTIFS: string[] = [
  "kb4_netsu_mo_sukunai",   // #158 熱も少ないので、狭い部屋でも使えます。
  "kb4_ii_heya_ni_natta",   // #159 上の階が、やっと「いい部屋」になりました。
  "kb4_radiator",           // #160 暖房も変わります。鋳鉄のラジエーターです。
  "kb4_kan_de_okuru",       // #161 管を通して、蒸気や湯を各部屋へ送る。
  "kb4_nenryou_hakobanai",  // #162 燃料を部屋ごとに運び込む必要が、なくなりました。
  "kb4_1960_kuuchou",       // #163 そして1960年代。ビルに、空調が入ります。
  "kb4_1980_katei",         // #164 家庭に行き渡るのは、1980年代の後半です。
  "kb4_mado_wo_akenai",     // #165 これが効いたのは、窓を開けなくて済むからです。
  "kb4_fuusoku_2bai",       // #166 地上10メートルと100メートルで、風速は約2倍。
  "kb4_kaze_ga_tsuyosugi",  // #167 高いところの風は、強すぎて開けられません。
  "kb4_zenkai_dekinai",     // #168 いまのタワーマンションの窓は、全開にできません。
];

export const kosoB4bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
