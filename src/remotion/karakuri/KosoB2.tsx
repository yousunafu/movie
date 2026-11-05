// 「なぜ高層ビルは生まれたのか」: 第2章「人を、上げる。」前半
// 担当範囲: 文#66〜#75・10文。1文 = 1シーン = 1枚の絵。
// motif 名は必ず kb2_ で始める。WobbleDefs の seed はこのファイルでは 600〜609 を使う。
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
} as const;

// ===================================================================
// このファイルだけの “筆”
//   背景キットではない。線・粒・質感を引くための道具にすぎない。
//   「どこで・いつ・誰が・何をしている場面か」は 1文ごとにゼロから組む。
// ===================================================================

// 煉瓦の目地。矩形の領域に積み目地を引く
const Bricks: React.FC<{
  x: number; y: number; w: number; h: number; bw?: number; bh?: number;
  fill?: string; line?: string; opacity?: number; lw?: number;
}> = ({ x, y, w, h, bw = 48, bh = 22, fill = C.brick, line = C.brickDark, opacity = 1, lw = 2 }) => {
  const rows = Math.max(1, Math.floor(h / bh));
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <g stroke={line} strokeWidth={lw} opacity={0.75}>
        {Array.from({ length: rows }, (_, r) => {
          const yy = y + r * bh;
          const off = (r % 2) * (bw / 2);
          const cols = Math.ceil(w / bw) + 1;
          return (
            <g key={r}>
              {r > 0 && <line x1={x} y1={yy} x2={x + w} y2={yy} />}
              {Array.from({ length: cols }, (_, c) => {
                const xx = x + off + c * bw;
                if (xx <= x + 1 || xx >= x + w - 1) return null;
                return <line key={c} x1={xx} y1={yy} x2={xx} y2={Math.min(yy + bh, y + h)} />;
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
};

// 切石の積み (煉瓦より目が大きい)
const Stones: React.FC<{
  x: number; y: number; w: number; h: number; bw?: number; bh?: number;
  fill?: string; line?: string; opacity?: number;
}> = ({ x, y, w, h, bw = 118, bh = 56, fill = C.stone, line = "#A99E89", opacity = 1 }) => {
  const rows = Math.max(1, Math.floor(h / bh));
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      {Array.from({ length: rows }, (_, r) => {
        const yy = y + r * bh;
        const off = (r % 2) * (bw / 2);
        const cols = Math.ceil(w / bw) + 1;
        return (
          <g key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const xx = x + off + c * bw;
              const x0 = Math.max(xx, x);
              const x1 = Math.min(xx + bw, x + w);
              if (x1 - x0 < 8) return null;
              return (
                <rect key={c} x={x0 + 2} y={yy + 2} width={x1 - x0 - 4} height={bh - 4} rx={3}
                  fill={fill} stroke={line} strokeWidth={3} />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

// 立ちのぼる煙 (煙突・蒸気・ほこり)
const Smoke: React.FC<{
  x: number; y: number; f: number; n?: number; r?: number; rise?: number;
  speed?: number; drift?: number; color?: string; opacity?: number; grow?: number;
}> = ({
  x, y, f, n = 6, r = 26, rise = 240, speed = 0.7, drift = 40,
  color = "#CFC8BC", opacity = 0.7, grow = 1.8,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = ((((i / n) + (f * speed) / rise) % 1) + 1) % 1;
      const yy = y - p * rise;
      const xx = x + Math.sin(p * 3.1 + i) * drift * p;
      const rr = r * (1 + p * grow);
      return (
        <circle key={i} cx={xx} cy={yy} r={rr} fill={color}
          opacity={opacity * (1 - p) * (0.45 + 0.55 * Math.sin(p * Math.PI))} />
      );
    })}
  </g>
);

// 雲 1つ
const Cloud: React.FC<{ cx: number; cy: number; s?: number; fill?: string; opacity?: number }> =
  ({ cx, cy, s = 1, fill = KRP.white, opacity = 0.9 }) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={opacity}>
      <ellipse cx={-54} cy={10} rx={62} ry={26} fill={fill} />
      <ellipse cx={14} cy={-6} rx={74} ry={38} fill={fill} />
      <ellipse cx={74} cy={14} rx={58} ry={24} fill={fill} />
      <ellipse cx={18} cy={20} rx={92} ry={22} fill={fill} />
    </g>
  );

// 鳥 (ゆるいV字。はばたく)
const Birds: React.FC<{
  x: number; y: number; f: number; n?: number; s?: number; speed?: number;
  color?: string; spread?: number;
}> = ({ x, y, f, n = 3, s = 1, speed = 0.55, color = KRP.ink, spread = 90 }) => (
  <g stroke={color} strokeWidth={4} fill="none" strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const xx = x + ((f * speed + i * spread) % (W + 300)) - 150;
      const yy = y + Math.sin(f / 26 + i * 1.3) * 16 + i * 26;
      const wing = 10 + Math.sin(f / 5 + i) * 8;
      return (
        <path key={i}
          d={`M ${xx - 20 * s} ${yy + wing * s * 0.4} Q ${xx} ${yy - wing * s} ${xx + 20 * s} ${yy + wing * s * 0.4}`} />
      );
    })}
  </g>
);

// 遠景の街並み (seed で形が変わる。シーンごとに別の seed を渡す)
const RowOfBuildings: React.FC<{
  x0: number; x1: number; base: number; seed: number; minH?: number; maxH?: number;
  fill?: string; sw?: number; windows?: boolean; winColor?: string;
  opacity?: number; count?: number; roof?: boolean;
}> = ({
  x0, x1, base, seed, minH = 60, maxH = 180, fill = "#A99E89",
  sw = 3.5, windows = false, winColor = BP.glass, opacity = 1, count, roof = true,
}) => {
  const n = count ?? Math.max(3, Math.round((x1 - x0) / 130));
  const bw = (x1 - x0) / n;
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const r = rnd(seed * 17.3 + i * 4.7);
        const r2 = rnd(seed * 5.1 + i * 9.3);
        const h = minH + r * (maxH - minH);
        const x = x0 + i * bw;
        const w = bw * (0.78 + r2 * 0.2);
        const rows = Math.max(1, Math.floor(h / 44));
        const cols = Math.max(1, Math.floor(w / 34));
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={w} height={h} fill={fill} stroke={KRP.ink} strokeWidth={sw} />
            {roof && r2 > 0.55 && (
              <rect x={x + w * 0.3} y={base - h - 22} width={w * 0.2} height={22}
                fill={fill} stroke={KRP.ink} strokeWidth={sw} />
            )}
            {windows && Array.from({ length: rows }, (_, rr) =>
              Array.from({ length: cols }, (_, cc) => (
                <rect key={`${rr}-${cc}`}
                  x={x + 9 + (cc * (w - 18)) / cols} y={base - h + 14 + (rr * (h - 20)) / rows}
                  width={Math.max(6, (w - 18) / cols - 9)} height={Math.max(8, (h - 20) / rows - 13)}
                  fill={winColor} opacity={0.6 + rnd(seed + rr * 3 + cc * 11) * 0.35} />
              )))}
          </g>
        );
      })}
    </g>
  );
};

// ガス灯 (1870年代の街灯)
const GasLamp: React.FC<{ x: number; y: number; s?: number; f?: number; lit?: boolean }> =
  ({ x, y, s = 1, f = 0, lit = false }) => {
    const glow = lit ? 0.35 + 0.2 * Math.sin(f / 13) : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-9} y={-250} width={18} height={250} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-22} y={-18} width={44} height={18} rx={4} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 -250 L 30 -250 L 22 -300 L -22 -300 Z" fill={lit ? BP.lamp : KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
        <path d="M -24 -300 L 24 -300 L 0 -328 Z" fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {lit && <circle cx={0} cy={-274} r={52} fill={KRP.yellow} opacity={glow} />}
        {lit && <circle cx={0} cy={-272} r={12} fill="#FFF3C8" />}
        <line x1={-26} y1={-232} x2={26} y2={-232} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };

// 帽子 3種 (Person の頭に重ねる。頭頂は局所 y=-292)
const Bowler: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#352E28" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <path d="M -54 -262 Q -56 -320 0 -320 Q 56 -320 54 -262 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-262} rx={90} ry={15} fill={color} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
const FlatCap: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#5C6670" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <path d="M -60 -268 Q -62 -312 0 -312 Q 62 -312 60 -268 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -62 -268 Q -96 -266 -100 -252 Q -62 -248 -10 -256 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
const TopHat: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#272320" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <ellipse cx={0} cy={-262} rx={94} ry={16} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-48} y={-358} width={96} height={100} rx={6} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-48} y={-288} width={96} height={16} fill="#6B4A32" opacity={0.8} />
    </g>
  );

// 木の床板 (室内の床)
const PlankFloor: React.FC<{
  y: number; h: number; n?: number; fill?: string; line?: string; x0?: number; x1?: number;
}> = ({ y, h, n = 9, fill = C.wood, line = C.woodDark, x0 = -20, x1 = W + 20 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={h} fill={fill} />
    <g stroke={line} strokeWidth={3} opacity={0.6}>
      {Array.from({ length: n }, (_, i) => {
        const yy = y + ((i + 1) / (n + 1)) * h;
        return <line key={i} x1={x0} y1={yy} x2={x1} y2={yy} />;
      })}
    </g>
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ひび (木や樽が割れる)
const Crack: React.FC<{ d: string; t?: number; color?: string; sw?: number }> =
  ({ d, t = 1, color = KRP.ink, sw = 5 }) => {
    const tt = clamp01(t);
    if (tt <= 0.02) return null;
    return <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
      strokeLinejoin="round" opacity={tt} />;
  };

// 光の筋に舞うホコリ (倉庫・機械室の窓の下)
const Motes: React.FC<{
  x: number; y: number; w: number; h: number; f: number; n?: number; color?: string; opacity?: number;
}> = ({ x, y, w, h, f, n = 26, color = KRP.white, opacity = 0.75 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = ((((i / n) + (f * 0.5) / h) % 1) + 1) % 1;
      const xx = x + rnd(i * 7.7) * w + Math.sin(f / 21 + i) * 14;
      const yy = y + h - p * h;
      return <circle key={i} cx={xx} cy={yy} r={2 + rnd(i * 3.1) * 4}
        fill={color} opacity={opacity * (0.3 + 0.7 * Math.sin(p * Math.PI))} />;
    })}
  </g>
);

// 工房・機械室の壁にかかる道具 (釘に吊る)
const WallTools: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 吊り桟 */}
    <rect x={-250} y={-16} width={500} height={18} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 大ハンマー */}
    <g transform={`rotate(${Math.sin(f / 41) * 1.4} -186 0)`}>
      <rect x={-196} y={0} width={20} height={176} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-224} y={160} width={76} height={38} rx={6} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
    {/* 大きなスパナ */}
    <g transform={`rotate(${Math.sin(f / 33 + 1) * 1.6} -60 0)`}>
      <rect x={-70} y={0} width={20} height={150} rx={9} fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -84 146 L -36 146 L -36 186 L -56 186 L -56 168 L -64 168 L -64 186 L -84 186 Z"
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    {/* 油差し */}
    <g transform="translate(70 24)">
      <path d="M -36 60 L 36 60 L 30 6 L -30 6 Z" fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 24 16 L 96 -36" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" fill="none" />
      <rect x={-18} y={-10} width={36} height={18} rx={5} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* ロープの束 */}
    <g transform="translate(206 40)">
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={0} cy={i * 22} rx={46 - i * 5} ry={16} fill="none"
          stroke={BP.hempDark} strokeWidth={10} />
      ))}
    </g>
    {/* 釘 */}
    <g>
      {[-186, -60, 70, 206].map((nx) => <circle key={nx} cx={nx} cy={-7} r={7}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />)}
    </g>
  </g>
);

// ===== シーン本体 (ここに1文ずつ書く) =====


// ===== #66 第2章、人を、上げる。 =====
// 格: 山
// どこ: 1870年代の街角。6階建ての煉瓦ビルの前。石畳の歩道。昼過ぎの白い空。
// 演出: ビルの右半分を断面で切って、折り返し階段を1階から6階まで通して見せる。
//       その足元に、荷箱を抱えた男が立って、首を上げて6階を見ている。
//       章題は右の空に出るので、絵は左に寄せて組む (右は空と遠景だけにする)。
// 動き: 雲と鳥が流れる。男の視線が階段をなぞって6階まで上がる (赤い点線)。
//       ガス灯が息をする。奥の通行人が歩く。奥の階段を1人が登っている。ゆっくり寄る。
const Kb2Door: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.024 * easeOut(clamp01(seg(f, 0, 40)));
  const trace = easeOut(clamp01(seg(f, 12, 40)));   // 視線が階段をなぞる

  // ビルと階段の骨 (階段の折り返しは絵の背骨なので先に決める)
  const BX0 = 150, BX1 = 1010, BTOP = 168, BBOT = 852;
  const FH = (BBOT - BTOP) / 6;                     // 1階ぶんの高さ = 114
  const slabY = (k: number) => BBOT - FH * k;       // k=0 が歩道、k=6 が6階の床
  const SX0 = 568, SX1 = 1000;                      // 断面に見える階段の左右
  // 折り返しの踊り場 (k 階の床の高さで、左右が交互に入れ替わる)
  const land = (k: number): [number, number] => [k % 2 === 0 ? SX0 + 14 : SX1 - 14, slabY(k)];
  const gaze: [number, number][] = [[742, 706], ...Array.from({ length: 7 }, (_, k) => land(k))];
  // 点線を「なぞっている途中」まで描く
  const gseg = Math.min(gaze.length - 1, Math.floor(trace * (gaze.length - 1)));
  const gfr = trace * (gaze.length - 1) - gseg;
  const gpts = gaze.slice(0, gseg + 1).map((p) => `${p[0]},${p[1]}`);
  if (gseg < gaze.length - 1) {
    const a = gaze[gseg], b = gaze[gseg + 1];
    gpts.push(`${lerp(a[0], b[0], gfr)},${lerp(a[1], b[1], gfr)}`);
  }

  return (
    <Frame
      f={f} seed={600} bg={KRP.cream}
      over={<ChapterDoor num={2} title="人を、上げる。" t={seg(f, 8, 30)} left={1046} top={246} width={804} />}
    >
      <g transform={zoomAt(zoom, 700, 720)}>
        {/* ───── 遠景: 空・雲・鳥・向かいの街並み ───── */}
        <rect x={-40} y={-40} width={W + 80} height={904} fill={C.skyHaze} />
        <rect x={-40} y={520} width={W + 80} height={344} fill={C.skyDay} opacity={0.5} />
        <Cloud cx={420} cy={168} s={1.15} opacity={0.9} />
        <Cloud cx={1540} cy={544} s={0.86} opacity={0.6} />
        <Birds x={980} y={602} f={f} n={3} s={1} speed={0.5} />
        <RowOfBuildings x0={-80} x1={162} base={856} seed={7} minH={220} maxH={330}
          fill="#B9AE99" opacity={0.42} windows count={2} />
        <RowOfBuildings x0={1004} x1={1960} base={856} seed={13} minH={150} maxH={296}
          fill="#B5AA96" opacity={0.4} windows count={8} />

        {/* ───── 中景: 6階建ての煉瓦ビル (右半分を断面で切る) ───── */}
        {/* 軀体 */}
        <Bricks x={BX0} y={BTOP} w={BX1 - BX0} h={BBOT - BTOP} bw={54} bh={26} />
        {/* 切り口のハッチング (断面であることの印) */}
        <g>
          <rect x={BX1 - 14} y={BTOP} width={22} height={BBOT - BTOP} fill={C.brickDark} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
            {Array.from({ length: 26 }, (_, i) => (
              <line key={i} x1={BX1 - 14} y1={BTOP + i * 27} x2={BX1 + 8} y2={BTOP + i * 27 - 18} />
            ))}
          </g>
        </g>
        {/* 階の床と、階段室の壁 */}
        <g>
          {Array.from({ length: 7 }, (_, k) => (
            <rect key={k} x={BX0 - 10} y={slabY(k) - 12} width={BX1 - BX0 + 28} height={16}
              fill={BP.slab} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          <rect x={SX0 - 16} y={BTOP} width={16} height={BBOT - BTOP}
            fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 階段 (1段ずつ刻む。折り返して上がる) */}
        <g>
          {Array.from({ length: 6 }, (_, k) => {
            const yb = slabY(k) - 12, yt = slabY(k + 1) - 12;
            const ltr = k % 2 === 0;
            const n = 7, run = (SX1 - SX0 - 28) / n, rise = (yb - yt) / n;
            return (
              <g key={k}>
                {/* 斜めの桁 */}
                <path d={`M ${ltr ? SX0 + 14 : SX1 - 14} ${yb} L ${ltr ? SX1 - 14 : SX0 + 14} ${yt}
                          l 0 26 L ${ltr ? SX0 + 14 : SX1 - 14} ${yb + 26} Z`}
                  fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
                {/* 踏み板と蹴込み */}
                <g fill={C.wood} stroke={KRP.ink} strokeWidth={3.5}>
                  {Array.from({ length: n }, (_, i) => {
                    const sx = ltr ? SX0 + 14 + i * run : SX1 - 14 - (i + 1) * run;
                    const sy = yb - (i + 1) * rise;
                    return <rect key={i} x={sx} y={sy} width={run} height={9} />;
                  })}
                </g>
                {/* 手すり */}
                <line x1={ltr ? SX0 + 18 : SX1 - 18} y1={yb - 58} x2={ltr ? SX1 - 18 : SX0 + 18} y2={yt - 58}
                  stroke={BP.ironDark} strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
        {/* 正面側の窓 (各階2つ) と1階の戸口 */}
        <g>
          {Array.from({ length: 6 }, (_, k) =>
            [250, 410].map((wx) => (
              <g key={`${k}-${wx}`}>
                <rect x={wx} y={slabY(k + 1) + 16} width={96} height={FH - 48}
                  fill={BP.glass} stroke={KRP.ink} strokeWidth={5} />
                <line x1={wx} y1={slabY(k + 1) + 16 + (FH - 48) / 2} x2={wx + 96}
                  y2={slabY(k + 1) + 16 + (FH - 48) / 2} stroke={KRP.ink} strokeWidth={4} />
                <line x1={wx + 48} y1={slabY(k + 1) + 16} x2={wx + 48} y2={slabY(k) - 20}
                  stroke={KRP.ink} strokeWidth={4} />
                <rect x={wx - 10} y={slabY(k + 1) + 6} width={116} height={14}
                  fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
              </g>
            )))}
          <rect x={186} y={678} width={34} height={174} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 220 678 L 220 852 L 352 852 L 352 678 Q 286 644 220 678 Z"
            fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={336} cy={768} r={9} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={352} y={678} width={34} height={174} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 奥の階段を1人が登っている (世界が動いている印) */}
        <g opacity={0.95}>
          <Person x={700} y={slabY(3) - 42} s={0.33} cloth="#5A6473" clothDark="#424B58"
            f={f} phase={3} lean={-6} face="worried" gaze={[0, -3]} />
        </g>

        {/* ───── 近景: 石畳の歩道・ガス灯・人 ───── */}
        <Stones x={-40} y={852} w={W + 80} h={240} bw={142} bh={62} />
        <rect x={-40} y={852} width={W + 80} height={14} fill="#B6AC97" stroke={KRP.ink} strokeWidth={6} />
        <GasLamp x={1118} y={998} s={1.06} f={f} lit />
        {/* 奥を歩く通行人 */}
        <Person x={1272 + ((f * 1.1) % 280)} y={902} s={0.6} cloth="#6A5B4C" clothDark="#50443A"
          f={f} phase={5} />
        <Bowler x={1272 + ((f * 1.1) % 280)} y={902} s={0.6} f={f} phase={5} />
        {/* 主役: 荷箱を抱えて6階を見上げる男 */}
        <g>
          <Person x={720} y={1016} s={1.3} cloth="#44556E" clothDark="#30415A"
            f={f} phase={0} lean={-3} face="worried" gaze={[0, -5]} />
          <g transform="translate(720 1016) scale(1.3)">
            {/* 抱えた木箱 */}
            <rect x={-80} y={-204} width={160} height={96} rx={6}
              fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
            <g stroke={C.woodDark} strokeWidth={5} opacity={0.85}>
              <line x1={-80} y1={-172} x2={80} y2={-172} />
              <line x1={-80} y1={-140} x2={80} y2={-140} />
            </g>
            <rect x={-80} y={-204} width={160} height={14} fill={BP.woodLight}
              stroke={KRP.ink} strokeWidth={5} />
            {/* 箱を抱える腕 */}
            <g fill="#44556E" stroke={KRP.ink} strokeWidth={6}>
              <rect x={-104} y={-196} width={34} height={92} rx={16} />
              <rect x={70} y={-196} width={34} height={92} rx={16} />
            </g>
            <g fill="#E3B183" stroke={KRP.ink} strokeWidth={5}>
              <rect x={-96} y={-128} width={38} height={28} rx={13} />
              <rect x={58} y={-128} width={38} height={28} rx={13} />
            </g>
          </g>
          <Bowler x={720} y={1016} s={1.3} f={f} phase={0} />
        </g>
        {/* 画面の端で見切れる紳士 (近景の重さ) */}
        <g>
          <Person x={1836} y={1096} s={1.5} cloth="#3A3630" clothDark="#272420"
            f={f} phase={2} gaze={[-3, -1]} />
          <TopHat x={1836} y={1096} s={1.5} f={f} phase={2} />
        </g>

        {/* ───── 見上げる視線が、階段をなぞって6階へ ───── */}
        {gpts.length > 1 && (
          <polyline points={gpts.join(" ")} fill="none" stroke={KRP.red} strokeWidth={6}
            strokeDasharray="20 16" strokeLinecap="round" opacity={0.9} />
        )}
        {trace > 0.9 && <XMark x={566} y={150} s={0.68} t={seg(f, 34, 42)} />}

        {/* ───── 札 ───── */}
        <TagPlate x={392} y={214} text="6階" size={50} t={seg(f, 24, 38)} />
        <TagPlate x={1252} y={782} text="1870年代" size={46} t={seg(f, 4, 18)} />
        <TagPlate x={1560} y={694} text="階段だけ" size={44} t={seg(f, 30, 42)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// ===== #67 高い建物が建っても、毎日、階段では登れません。 =====
// 格: 並
// どこ: 同じビルの階段室だけを断面で抜いた。描くのは「登る」ことひとつ。
// 演出: 4階ぶんの折り返し階段を縦に積む。1階ぶんを高く取って踏板を大きくし、
//       折り返しがゆったり見えるようにした。人は1人だけ。
//       その1人が1階から猛スピードで駆け上がる (f=45 では昇りきっていない)。
//       背景は 煉瓦の切り口 / 階の床 / 踊り場の窓 / 壁の燭台 の4要素だけ。
// 動き: 走者が段を踏みながら上がる。後ろに流線・残像・砂埃。体は前傾。
//       燭台の炎が揺れる。階数の札が下から順に出る。
const Kb2KaidanMuri: React.FC<{ f: number }> = ({ f }) => {
  const BX0 = 316, BX1 = 1604, BTOP = 214, BBOT = 866;
  const FLOORS = 4;
  const FH = (BBOT - BTOP) / FLOORS;               // 163 (前は150.4。1階ぶんを広げた)
  const slabY = (k: number) => BBOT - FH * k;
  const SX0 = 404, SX1 = 1516;
  const NSTEP = 7;                                 // 段を大きく = 折り返しがゆったり
  const run = (SX1 - SX0 - 40) / NSTEP;
  const rise = FH / NSTEP;

  // ── 走者: 1階から猛スピードで登る (2.45階ぶん = 昇りきらない) ──
  const prog = seg(f, 2, 42) * 2.45;
  const fi = Math.min(FLOORS - 1, Math.floor(prog));
  const uNow = clamp01(prog - fi);
  const ltrR = fi % 2 === 0;
  const dirR = ltrR ? 1 : -1;
  const ybR = slabY(fi) - 14;
  const footAt = (uu: number) => {
    const si = Math.min(NSTEP - 1, Math.max(0, Math.floor(clamp01(uu) * NSTEP)));
    return {
      x: (ltrR ? SX0 + 20 : SX1 - 20) + dirR * (si + 0.62) * run,
      y: ybR - (si + 1) * rise,
      si,
    };
  };
  const now = footAt(uNow);
  const ghosts = [0.055, 0.11].map((d) => footAt(uNow - d));
  const stride = Math.sin(f / 2.2) * 5;            // 駆け足のはずみ

  return (
    <Frame f={f} seed={601} bg={KRP.cream}>
      {/* 煉瓦の切り口 (階段室の外側) */}
      <Bricks x={BX0 - 76} y={BTOP} w={76} h={BBOT - BTOP} bw={48} bh={25} />
      <Bricks x={BX1} y={BTOP} w={76} h={BBOT - BTOP} bw={48} bh={25} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>
        {Array.from({ length: 24 }, (_, i) => (
          <g key={i}>
            <line x1={BX0 - 76} y1={BTOP + 24 + i * 28} x2={BX0} y2={BTOP + 2 + i * 28} />
            <line x1={BX1} y1={BTOP + 24 + i * 28} x2={BX1 + 76} y2={BTOP + 2 + i * 28} />
          </g>
        ))}
      </g>
      {/* 階段室の中の壁 */}
      <rect x={BX0} y={BTOP} width={BX1 - BX0} height={BBOT - BTOP}
        fill="#E7DFCB" stroke={KRP.ink} strokeWidth={6} />
      {/* 階の床 */}
      <g>
        {Array.from({ length: FLOORS + 1 }, (_, k) => (
          <g key={k}>
            <rect x={BX0 - 84} y={slabY(k) - 14} width={BX1 - BX0 + 168} height={18}
              fill={BP.slab} stroke={KRP.ink} strokeWidth={5} />
            {k > 0 && (
              <text x={BX0 + 18} y={slabY(k) - 28} fontFamily={FONT} fontWeight={900}
                fontSize={36} fill={KRP.ink} opacity={clamp01(seg(f, 4 + k * 4, 16 + k * 4))}>{k}階</text>
            )}
          </g>
        ))}
      </g>
      {/* 踊り場の窓 (外の空が見える) と燭台 */}
      <g>
        {[1, 3].map((k) => (
          <g key={k}>
            <rect x={SX1 - 150} y={slabY(k) - 132} width={120} height={100}
              fill={C.skyDay} stroke={KRP.ink} strokeWidth={6} />
            <line x1={SX1 - 90} y1={slabY(k) - 132} x2={SX1 - 90} y2={slabY(k) - 32}
              stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {[0, 2].map((k) => (
          <g key={k} transform={`translate(${SX0 + 30} ${slabY(k) - 104})`}>
            <rect x={-12} y={-6} width={44} height={14} rx={4} fill={BP.ironDark}
              stroke={KRP.ink} strokeWidth={4} />
            <rect x={20} y={-34} width={16} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={28} cy={-44 + Math.sin((f + k * 9) / 6) * 2} rx={9}
              ry={15 + Math.sin((f + k * 13) / 5) * 3} fill={KRP.yellow} opacity={0.95} />
          </g>
        ))}
      </g>
      {/* 階段 (折り返し) */}
      <g>
        {Array.from({ length: FLOORS }, (_, k) => {
          const yb = slabY(k) - 14, yt = slabY(k + 1) - 14;
          const ltr = k % 2 === 0;
          return (
            <g key={k}>
              <path d={`M ${ltr ? SX0 + 20 : SX1 - 20} ${yb} L ${ltr ? SX1 - 20 : SX0 + 20} ${yt}
                        l 0 34 L ${ltr ? SX0 + 20 : SX1 - 20} ${yb + 34} Z`}
                fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
              <g fill={C.wood} stroke={KRP.ink} strokeWidth={4}>
                {Array.from({ length: NSTEP }, (_, i) => {
                  const sx = ltr ? SX0 + 20 + i * run : SX1 - 20 - (i + 1) * run;
                  return <rect key={i} x={sx} y={yb - (i + 1) * rise} width={run} height={14} />;
                })}
              </g>
              {/* 手すり (最上段は屋根の外に飛び出すので引かない) */}
              {k < FLOORS - 1 && (
                <line x1={ltr ? SX0 + 24 : SX1 - 24} y1={yb - 74} x2={ltr ? SX1 - 24 : SX0 + 24} y2={yt - 74}
                  stroke={BP.ironDark} strokeWidth={5} strokeLinecap="round" opacity={0.32} />
              )}
            </g>
          );
        })}
      </g>
      {/* 走者 (1人) — 残像 → 流線 → 砂埃 → 本体 */}
      <g>
        {/* 残像 (ぶれ。人が増えて見えないよう、ごく薄く・すぐ後ろに) */}
        {[1, 2].map((i) => (
          <g key={i} opacity={0.15 - (i - 1) * 0.07}>
            <Person x={now.x - dirR * i * 36} y={now.y + i * 11} s={0.52}
              cloth="#9BA8B8" clothDark="#9BA8B8" f={f} phase={i} still
              lean={dirR * 16} face="normal" gaze={[dirR * 2, -1]} />
          </g>
        ))}
        {/* 流線 (スピード線) */}
        <g stroke={KRP.ink} strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => {
            const yy = now.y - 34 - i * 37 + stride * 0.4;
            const len = 104 + ((f * 11 + i * 37) % 64);
            const sw = [12, 10, 8, 6][i];
            return (
              <line key={i}
                x1={now.x - dirR * (40 + i * 12)} y1={yy}
                x2={now.x - dirR * (40 + i * 12 + len)} y2={yy + len * 0.14}
                strokeWidth={sw} opacity={0.88 - i * 0.14} />
            );
          })}
        </g>
        {/* 踏んだ段から散る砂埃 */}
        <g fill={BP.slabDark} stroke={KRP.ink} strokeWidth={3}>
          {[0, 1, 2].map((i) => {
            const d = ((f * 1.7 + i * 17) % 18) / 18;
            return (
              <circle key={i}
                cx={ghosts[0].x - dirR * (14 + i * 24 + d * 42)}
                cy={ghosts[0].y - 4 - d * 28 - i * 6}
                r={7 + i * 3 + d * 10} opacity={0.6 * (1 - d)} />
            );
          })}
        </g>
        <Person x={now.x} y={now.y + stride * 0.5} s={0.52}
          cloth="#44556E" clothDark="#30415A" f={f} phase={0}
          lean={dirR * (17 + Math.sin(f / 2.2) * 3)}
          face="normal" gaze={[dirR * 3, -2]} />
      </g>
      {/* 登る向きの矢印 */}
      <ForceArrow x={BX0 - 150} y={820} len={580} rot={-90} w={26} color={KRP.red}
        t={seg(f, 10, 36)} label="登る" labelSize={40} />
      <TagPlate x={1452} y={770} text="4階" size={50} t={seg(f, 26, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #68 30階の話ではありません。6階でも、もう嫌です。 =====
// 格: 図
// どこ: 方眼の上。舞台も人も置かない。「高さのものさし」2本だけ。
// 演出: 左は6階ぶんのものさしを画面いっぱいに立てる (段が実物として見える)。
//       右は同じ目盛りで30階を取ると、画面の天井を突き抜けて出て行ってしまう。
//       収まらないこと自体が絵。6階の天辺には赤い×、30階の線は点線のまま。
// 動き: 左のものさしを階数の印が1階ずつ駆け上がり、6で止まって×が弾ける。
//       右の点線が上へ流れ続ける (いつまでも終わらない印)。
// 配置: 左右の 0階 (地面) の y を完全に揃え、1階ぶんの段の高さも左右同じ。
//       画面中央 960 をはさんで左の中心 x=620 / 右の中心 x=1300 の対称。
const Kb26kaiDemo: React.FC<{ f: number }> = ({ f }) => {
  const GY = 820, TOPY = 268;                        // 0階 (左右共通の地面) → 6階
  const step = (GY - TOPY) / 6;                      // 1階 = 92px (左右同じものさし)
  const LX = 490, RX = 1170, BW = 260;               // 左 490..750 / 右 1170..1430
  const climb = easeOut(clamp01(seg(f, 6, 30))) * 6; // 駆け上がる印
  const flow = (f * 2.6) % 44;
  const tie = seg(f, 20, 38);
  return (
    <Frame f={f} seed={602} bg={KRP.cream}>
      <GridPaper />

      {/* ───── 左右共通の地面 (足元がそろっていることを見せる) ───── */}
      <line x1={200} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={8} opacity={0.5} />
      {/* 6階の高さをそのまま右へ渡す線 (同じものさしの印) */}
      <line x1={LX + BW} y1={TOPY} x2={LX + BW + (RX - LX - BW) * tie} y2={TOPY}
        stroke={KRP.ink} strokeWidth={5} strokeDasharray="16 14" opacity={0.45} />

      {/* ───── 左: 6階のものさし (段を実物として作り込む) ───── */}
      <g>
        <line x1={LX} y1={GY} x2={LX} y2={TOPY} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
        {Array.from({ length: 7 }, (_, k) => {
          const y = GY - step * k;
          return (
            <g key={k}>
              {/* 階の床板 (ものさしの目盛りを、ほんとうの床として描く) */}
              <rect x={LX} y={y - 12} width={BW} height={24} rx={5}
                fill={BP.slab} stroke={KRP.ink} strokeWidth={5.5} />
              <line x1={LX + 16} y1={y} x2={LX + BW - 16} y2={y}
                stroke={BP.slabDark} strokeWidth={4} opacity={0.7} />
              <line x1={LX - 52} y1={y} x2={LX} y2={y} stroke={KRP.ink} strokeWidth={7} />
              <text x={LX - 64} y={y + 14} textAnchor="end" fontFamily={FONT} fontWeight={900}
                fontSize={38} fill={KRP.ink}>{k}</text>
              {/* 階と階をつなぐ段 */}
              {k < 6 && (
                <g fill={C.wood} stroke={KRP.ink} strokeWidth={4}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <rect key={i} x={LX + 26 + i * 44} y={y - 12 - (i + 1) * (step / 5)}
                      width={44} height={11} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
        {/* 駆け上がる印 */}
        <g transform={`translate(${LX + 52} ${GY - step * climb - 24})`}>
          <polygon points="0,-30 30,18 -30,18" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-46} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 6階は、もうここまで (赤い×) */}
        <XMark x={LX + 150} y={TOPY} s={1.15} t={seg(f, 28, 42)} />
      </g>

      {/* ───── 右: 同じ目盛りで30階を取ると、画面に入らない ───── */}
      <g>
        <line x1={RX + BW} y1={GY} x2={RX + BW} y2={TOPY} stroke={KRP.ink}
          strokeWidth={11} strokeLinecap="round" />
        {/* 6階より上は点線。上へ流れ続けて、画面の外へ抜ける */}
        <g opacity={0.6}>
          <line x1={RX + BW} y1={TOPY} x2={RX + BW} y2={-60} stroke={KRP.ink} strokeWidth={9}
            strokeDasharray="26 22" strokeDashoffset={-flow} />
        </g>
        {/* 入りきらない階 (点線の床) */}
        <g opacity={0.5}>
          {[7, 8, 9].map((k) => (
            <g key={k}>
              <rect x={RX} y={GY - step * k - 12} width={BW} height={24} rx={5}
                fill="none" stroke={KRP.ink} strokeWidth={5} strokeDasharray="18 14" />
              <text x={RX + BW + 18} y={GY - step * k + 14} fontFamily={FONT} fontWeight={800}
                fontSize={38} fill={KRP.ink}>{k}</text>
            </g>
          ))}
        </g>
        {/* 6階までは実線 (左と同じ床・同じ高さ) */}
        {Array.from({ length: 7 }, (_, k) => {
          const y = GY - step * k;
          return (
            <g key={k}>
              <rect x={RX} y={y - 12} width={BW} height={24} rx={5}
                fill={BP.slab} stroke={KRP.ink} strokeWidth={5.5} />
              <line x1={RX + BW} y1={y} x2={RX + BW + 52} y2={y} stroke={KRP.ink} strokeWidth={7} />
              <text x={RX + BW + 64} y={y + 14} fontFamily={FONT} fontWeight={900}
                fontSize={38} fill={KRP.ink}>{k}</text>
            </g>
          );
        })}
        {/* 30階は、画面の天井のさらに先 */}
        <ForceArrow x={1700} y={560} len={260} rot={-90} w={26} color={KRP.ink} t={seg(f, 16, 34)} />
        <TagPlate x={1640} y={640} text="30階はこの先" size={38} t={seg(f, 20, 36)} />
      </g>

      {/* ───── 札 (足元・左右対称) ───── */}
      <TagPlate x={300} y={770} text="6階" size={52} t={seg(f, 2, 16)} />
      <TagPlate x={1620} y={770} text="30階" size={52} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #69 そこで必要になったのが、エレベーターです。 =====
// 格: 山
// どこ: 6階建ての事務所ビルを丸ごと縦に切った断面。右は階段、左は各階の部屋。
// 演出: 真ん中に、建物を貫く「縦穴」を初めて通す。天辺は機械室で綱車が回る。
//       穴の中を箱がすっと上がっていき、1階のロビーの人たちが見上げる。
//       右の階段を登っていた人が、途中で足を止めて箱のほうを見る。
// 動き: 箱が上がる (easeOut)。綱車とドラムが回る。穴の中にほこりが舞う。
//       箱の天井灯とロビーの灯が息をする。ゆっくり寄る。
const Kb2ElevatorToujou: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.02 * easeOut(clamp01(seg(f, 0, 42)));
  const rise = easeOut(clamp01(seg(f, 8, 40)));
  const BX0 = 196, BX1 = 1744, BTOP = 120, GROUND = 1006;
  const FH = 124;
  const slabY = (k: number) => GROUND - FH * k;      // k=0 が1階の床、k=5 が6階の床
  const SHL = 782, SHR = 1218;                       // 縦穴の内側
  const MTOP = 150, MBOT = slabY(5);                 // 機械室
  const SHX = 1034, SHY = 258, SHRAD = 104;          // 綱車
  const CX = SHX - 85;                               // かごの中心 = ロープの左側
  const carFloor = lerp(982, 760, rise);
  const carH = 286;
  return (
    <Frame f={f} seed={603} bg={KRP.cream}>
      <g transform={zoomAt(zoom, 1000, 700)}>
        {/* ───── 遠景: 外の空と向かいの街 (断面の外側にだけ見える) ───── */}
        <rect x={-40} y={-40} width={W + 80} height={1140} fill={C.skyHaze} />
        <RowOfBuildings x0={-80} x1={210} base={1060} seed={21} minH={300} maxH={420}
          fill="#B4A994" opacity={0.35} windows count={3} />
        <RowOfBuildings x0={1730} x1={1990} base={1060} seed={29} minH={280} maxH={400}
          fill="#B4A994" opacity={0.35} windows count={3} />

        {/* ───── 軀体 ───── */}
        <Bricks x={BX0} y={BTOP} w={BX1 - BX0} h={GROUND - BTOP + 74} bw={54} bh={26} />
        <rect x={BX0} y={BTOP} width={BX1 - BX0} height={GROUND - BTOP}
          fill="#EDE5D2" stroke={KRP.ink} strokeWidth={7} />
        {/* 切り口のハッチング */}
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>
          {Array.from({ length: 32 }, (_, i) => (
            <g key={i}>
              <line x1={BX0 - 52} y1={BTOP + i * 29} x2={BX0} y2={BTOP + i * 29 - 22} />
              <line x1={BX1} y1={BTOP + i * 29} x2={BX1 + 52} y2={BTOP + i * 29 - 22} />
            </g>
          ))}
        </g>

        {/* ───── 階の床 (縦穴のところで切れている) ───── */}
        <g>
          {Array.from({ length: 6 }, (_, k) => (
            <g key={k}>
              <rect x={BX0 - 56} y={slabY(k) - 15} width={SHL - BX0 + 44} height={19}
                fill={BP.slab} stroke={KRP.ink} strokeWidth={5} />
              <rect x={SHR - 6} y={slabY(k) - 15} width={BX1 + 56 - SHR + 6} height={19}
                fill={BP.slab} stroke={KRP.ink} strokeWidth={5} />
              <text x={BX0 + 20} y={slabY(k) - 28} fontFamily={FONT} fontWeight={900}
                fontSize={30} fill={KRP.ink} opacity={0.75}>{k + 1}階</text>
            </g>
          ))}
        </g>

        {/* ───── 左: 各階の部屋 (世界を置く) ───── */}
        <g>
          {[1, 2, 3, 4].map((k) => {
            const fy = slabY(k) - 15;
            return (
              <g key={k}>
                {/* 机と椅子 */}
                <rect x={300} y={fy - 56} width={168} height={14} fill={C.wood}
                  stroke={KRP.ink} strokeWidth={4.5} />
                <rect x={312} y={fy - 42} width={12} height={42} fill={C.woodDark}
                  stroke={KRP.ink} strokeWidth={4} />
                <rect x={444} y={fy - 42} width={12} height={42} fill={C.woodDark}
                  stroke={KRP.ink} strokeWidth={4} />
                <rect x={496} y={fy - 58} width={14} height={58} fill={C.woodDark}
                  stroke={KRP.ink} strokeWidth={4} />
                <rect x={492} y={fy - 100} width={22} height={44} rx={5} fill={C.wood}
                  stroke={KRP.ink} strokeWidth={4} />
                {/* 卓上の灯 */}
                <g>
                  <rect x={376} y={fy - 72} width={14} height={16} fill={BP.brassDark}
                    stroke={KRP.ink} strokeWidth={3.5} />
                  <path d={`M 364 ${fy - 72} L 402 ${fy - 72} L 394 ${fy - 94} L 372 ${fy - 94} Z`}
                    fill={BP.lamp} stroke={KRP.ink} strokeWidth={4} />
                  <circle cx={383} cy={fy - 80} r={18} fill={KRP.yellow}
                    opacity={0.26 + 0.08 * Math.sin((f + k * 17) / 11)} />
                </g>
                {/* 棚と額 */}
                <rect x={580} y={fy - 96} width={150} height={12} fill={C.woodDark}
                  stroke={KRP.ink} strokeWidth={4} />
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={590 + i * 34} y={fy - 132} width={24} height={36}
                    fill={i % 2 ? BP.hempDark : "#8A5A46"} stroke={KRP.ink} strokeWidth={3.5} />
                ))}
                <rect x={236} y={fy - 150} width={64} height={48} fill={BP.paper}
                  stroke={KRP.ink} strokeWidth={4.5} />
                {/* 窓 */}
                <rect x={BX0 + 10} y={fy - 108} width={10} height={72} fill={C.skyDay}
                  stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          })}
        </g>

        {/* ───── 右: 階段 (いままでの道) ───── */}
        <g>
          {Array.from({ length: 5 }, (_, k) => {
            const yb = slabY(k) - 15, yt = slabY(k + 1) - 15;
            const ltr = k % 2 === 0;
            const x0 = SHR + 40, x1 = BX1 - 40;
            const n = 7, run = (x1 - x0) / n, rr = (yb - yt) / n;
            return (
              <g key={k}>
                <path d={`M ${ltr ? x0 : x1} ${yb} L ${ltr ? x1 : x0} ${yt} l 0 24
                          L ${ltr ? x0 : x1} ${yb + 24} Z`}
                  fill={C.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
                <g fill={C.wood} stroke={KRP.ink} strokeWidth={3.5}>
                  {Array.from({ length: n }, (_, i) => (
                    <rect key={i} x={ltr ? x0 + i * run : x1 - (i + 1) * run}
                      y={yb - (i + 1) * rr} width={run} height={10} />
                  ))}
                </g>
                <line x1={ltr ? x0 + 4 : x1 - 4} y1={yb - 54} x2={ltr ? x1 - 4 : x0 + 4} y2={yt - 54}
                  stroke={BP.ironDark} strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          })}
          {/* 登りかけて足を止め、箱のほうを見る人 */}
          <Person x={1430} y={slabY(2) - 60} s={0.46} cloth="#5E5346" clothDark="#473E34"
            f={f} phase={4} lean={3} face="surprised" gaze={[-4, 0]} />
        </g>

        {/* ───── 縦穴 (この絵の主役。建物を貫く) ───── */}
        <g>
          <rect x={SHL} y={MBOT - 15} width={SHR - SHL} height={GROUND - MBOT + 15}
            fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={7} />
          <rect x={SHL + 12} y={MBOT - 3} width={SHR - SHL - 24} height={GROUND - MBOT}
            fill={BP.shaft} opacity={0.24} />
          <g stroke={BP.shaftDark} strokeWidth={3} opacity={0.32}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={SHL + ((i + 1) * (SHR - SHL)) / 5} y1={MBOT}
                x2={SHL + ((i + 1) * (SHR - SHL)) / 5} y2={GROUND - 6} />
            ))}
          </g>
          {/* 各階の戸口 (真鍮の枠) */}
          {Array.from({ length: 5 }, (_, k) => (
            <g key={k}>
              <rect x={SHL - 14} y={slabY(k) - 142} width={18} height={128}
                fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={SHR - 4} y={slabY(k) - 142} width={18} height={128}
                fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          ))}
          {/* 案内レール */}
          <GuideRail x={CX - 152} y1={MBOT} y2={GROUND - 10} w={22} opacity={0.9} />
          <GuideRail x={CX + 152} y1={MBOT} y2={GROUND - 10} w={22} opacity={0.9} />
          <Motes x={SHL + 20} y={MBOT} w={SHR - SHL - 40} h={GROUND - MBOT} f={f} n={22}
            color={KRP.white} opacity={0.4} />
        </g>

        {/* ───── 機械室 (天辺) ───── */}
        <g>
          <rect x={746} y={MTOP} width={508} height={MBOT - MTOP + 10}
            fill="#DCD3BF" stroke={KRP.ink} strokeWidth={7} />
          <Bricks x={746} y={MTOP - 44} w={508} h={44} bw={48} bh={22} />
          <g stroke="#BDB3A0" strokeWidth={4} opacity={0.6}>
            {[0, 1, 2].map((i) => (
              <line key={i} x1={752} y1={MTOP + 40 + i * 54} x2={1248} y2={MTOP + 40 + i * 54} />
            ))}
          </g>
          {/* 梁 */}
          <rect x={746} y={MTOP + 8} width={508} height={34} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5.5} />
          <Rivets x1={770} y1={MTOP + 25} x2={1230} y2={MTOP + 25} n={10} r={7} />
          {/* ロープ: かご → 綱車 → 巻き上げドラム */}
          <Rope x1={CX} y1={carFloor - carH - 54} x2={CX} y2={SHY} w={13} kind="wire" f={f} />
          <Rope x1={CX} y1={SHY} x2={SHX + 85} y2={SHY} w={13} kind="wire" f={f} opacity={0.45} />
          <Rope x1={SHX + 85} y1={SHY} x2={SHX + 85} y2={MBOT - 58} w={13} kind="wire" f={f} />
          <Sheave x={SHX} y={SHY} r={SHRAD} rot={f * 2.4} spokes={6} groove bracket={false} />
          {/* 巻き上げドラム */}
          <g transform={`translate(${SHX + 85} ${MBOT - 24})`}>
            <rect x={-74} y={10} width={148} height={22} rx={5} fill={BP.steelDark}
              stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-26} r={46} fill={BP.iron} stroke={KRP.ink} strokeWidth={6} />
            <g transform={`rotate(${f * 5.2})`} stroke={BP.ironDark} strokeWidth={6}>
              <line x1={-40} y1={-26} x2={40} y2={-26} />
              <line x1={0} y1={-66} x2={0} y2={14} />
            </g>
            <circle cx={0} cy={-26} r={12} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
            <HexBolt x={-52} y={21} r={9} />
            <HexBolt x={52} y={21} r={9} />
          </g>
        </g>

        {/* ───── 箱 (縦穴を上がっていく) ───── */}
        <Car x={CX} y={carFloor} w={290} h={carH} f={f} door={0} cage lamp sling indicator={0.42} />

        {/* ───── 1階のロビー: 見上げる人たち ───── */}
        <g>
          <rect x={BX0} y={GROUND - 4} width={BX1 - BX0} height={80} fill={C.stone} />
          <line x1={BX0} y1={GROUND - 4} x2={BX1} y2={GROUND - 4} stroke={KRP.ink} strokeWidth={6} />
          <Person x={596} y={GROUND} s={0.92} cloth="#3F4E6A" clothDark="#2C3A52"
            f={f} phase={1} face="surprised" gaze={[2, -5]} />
          <Bowler x={596} y={GROUND} s={0.92} f={f} phase={1} />
          <Person x={700} y={GROUND} s={0.84} cloth="#6E4E42" clothDark="#543A31"
            f={f} phase={6} gaze={[3, -5]} />
          {/* 近景で大きく見上げる人 */}
          <Person x={352} y={1070} s={1.36} cloth="#4A4036" clothDark="#352E26"
            f={f} phase={2} lean={-3} face="surprised" gaze={[4, -6]} />
          <TopHat x={352} y={1070} s={1.36} f={f} phase={2} />
        </g>

        {/* ───── 札 ───── */}
        <TagPlate x={430} y={236} text="機械室" size={46} t={seg(f, 4, 18)} />
        <Arrow x={716} y={236} s={0.8} t={seg(f, 10, 22)} color={KRP.ink} rot={180} />
        <TagPlate x={1518} y={692} text="縦穴" size={52} t={seg(f, 12, 26)} />
        <TagPlate x={448} y={672} text="箱" size={60} t={seg(f, 20, 34)} color={KRP.red} />
        <Arrow x={690} y={672} s={0.95} t={seg(f, 26, 40)} rot={180} />
        <TagPlate x={1560} y={782} text="階段" size={44} t={seg(f, 28, 42)} />
      </g>
    </Frame>
  );
};

// ===== #70 もともとは、荷物を上げ下げする仕組みでした。 =====
// 格: 並
// どこ: 倉庫の中。板壁、高窓、梁。描くのは「荷台が上がる」ことひとつ。
// 演出: 梁から吊った綱車で荷台が上がる。乗っているのは樽と木箱だけ。
//       人は床に1人いるが、荷台には乗らず、壁の手回し巻き上げ機を回している。
//       背景は 板壁 / 高窓の光 / 梁 / 床に積んだ荷 の4要素だけ。
// 動き: 荷台が上がり、綱車とドラムと腕木が回る。光の筋にほこりが舞う。
//       吊り縄がわずかに揺れ、樽がかすかに傾く。
const Kb2NimotsuMoto: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(clamp01(seg(f, 8, 38)));
  const SX = 900, SY = 304, SR = 142;
  const LX = SX - SR * 0.81;                         // 荷台側の strand
  const HX = SX + SR * 0.81;                         // 巻き上げ側の strand
  const pY = lerp(872, 544, rise);                   // 荷台の床
  const swing = Math.sin(f / 17) * (1.6 - rise * 1.1);
  return (
    <Frame f={f} seed={604} bg={KRP.cream}>
      {/* 板壁 (縦板) */}
      <rect x={-20} y={60} width={W + 40} height={830} fill={C.wood} />
      <g stroke={C.woodDark} strokeWidth={5} opacity={0.65}>
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={-20 + i * 90} y1={60} x2={-20 + i * 90} y2={890} />
        ))}
      </g>
      {/* 高窓 (2つ) と、落ちてくる光の筋 */}
      {[280, 1580].map((wx, i) => (
        <g key={wx}>
          <rect x={wx - 110} y={118} width={220} height={166} fill={C.skyDay}
            stroke={KRP.ink} strokeWidth={7} />
          <g stroke={KRP.ink} strokeWidth={5}>
            <line x1={wx} y1={118} x2={wx} y2={284} />
            <line x1={wx - 110} y1={201} x2={wx + 110} y2={201} />
          </g>
          <path d={`M ${wx - 110} 284 L ${wx + 110} 284 L ${wx + 236} 890 L ${wx + 10} 890 Z`}
            fill={KRP.white} opacity={0.17} />
          <Motes x={wx - 60} y={300} w={300} h={560} f={f + i * 23} n={20} opacity={0.6} />
        </g>
      ))}
      {/* 梁 (吊り元) */}
      <rect x={-20} y={150} width={W + 40} height={62} fill={C.woodDark}
        stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={60} y1={181} x2={1860} y2={181} n={13} r={8} fill="#5E452A" />
      {[380, 1240, 1660].map((bx) => (
        <g key={bx}>
          <rect x={bx - 16} y={212} width={32} height={44} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5} />
          <HexBolt x={bx} y={234} r={12} />
        </g>
      ))}
      {/* 床 */}
      <PlankFloor y={890} h={190} n={7} />
      {/* ロープ */}
      <Rope x1={LX} y1={pY - 72} x2={LX} y2={SY} w={20} kind="hemp" f={f} />
      <Rope x1={HX} y1={SY} x2={HX} y2={688} w={20} kind="hemp" f={f} />
      <Rope x1={HX} y1={688} x2={1398} y2={742} w={20} kind="hemp" f={f} sag={0.3} />
      <Sheave x={SX} y={SY} r={SR} rot={-rise * 180 + f * 0.9} spokes={6} groove bracket />
      {/* 荷台 (主役。樽と木箱が乗っている。人は乗らない) */}
      <g transform={`translate(${LX} ${pY}) rotate(${swing})`}>
        <g stroke={KRP.ink} strokeWidth={7}>
          <line x1={0} y1={-72} x2={-196} y2={-18} />
          <line x1={0} y1={-72} x2={196} y2={-18} />
        </g>
        <rect x={-224} y={-20} width={448} height={30} rx={8} fill={C.wood}
          stroke={KRP.ink} strokeWidth={7} />
        <line x1={-224} y1={-4} x2={224} y2={-4} stroke={C.woodDark} strokeWidth={5} />
        {/* 樽 2つ */}
        {[-128, 0].map((bx) => (
          <g key={bx} transform={`translate(${bx} -20)`}>
            <path d="M -56 0 Q -72 -58 -56 -118 L 56 -118 Q 72 -58 56 0 Z"
              fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
            <line x1={-66} y1={-38} x2={66} y2={-38} stroke={BP.ironDark} strokeWidth={8} />
            <line x1={-66} y1={-82} x2={66} y2={-82} stroke={BP.ironDark} strokeWidth={8} />
            <ellipse cx={0} cy={-118} rx={56} ry={14} fill={BP.woodLight}
              stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 木箱 */}
        <g transform="translate(140 -20)">
          <rect x={-66} y={-110} width={132} height={110} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.woodDark} strokeWidth={5}>
            <line x1={-66} y1={-74} x2={66} y2={-74} />
            <line x1={-66} y1={-36} x2={66} y2={-36} />
            <line x1={-66} y1={-110} x2={66} y2={0} />
          </g>
        </g>
      </g>
      {/* 床に積んだ荷 */}
      <g>
        {[160, 282].map((bx, i) => (
          <g key={bx} transform={`translate(${bx} 890)`}>
            <path d="M -50 0 Q -64 -52 -50 -106 L 50 -106 Q 64 -52 50 0 Z"
              fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
            <line x1={-59} y1={-34} x2={59} y2={-34} stroke={BP.ironDark} strokeWidth={7} />
            <ellipse cx={0} cy={-106} rx={50} ry={13} fill={BP.woodLight}
              stroke={KRP.ink} strokeWidth={5} />
            {i === 0 && (
              <g transform="translate(14 -106)">
                <rect x={-54} y={-92} width={108} height={92} fill={BP.woodLight}
                  stroke={KRP.ink} strokeWidth={6} />
                <line x1={-54} y1={-46} x2={54} y2={-46} stroke={C.woodDark} strokeWidth={5} />
              </g>
            )}
          </g>
        ))}
      </g>
      {/* 手回しの巻き上げ機 (壁際) と、回す人 */}
      <g transform="translate(1430 890)">
        <rect x={-96} y={-40} width={192} height={40} fill={C.woodDark}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-32} cy={-148} r={74} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${f * 4.4} -32 -148)`}>
          <g stroke={BP.ironDark} strokeWidth={7}>
            <line x1={-96} y1={-148} x2={32} y2={-148} />
            <line x1={-32} y1={-212} x2={-32} y2={-84} />
          </g>
          <rect x={32} y={-158} width={78} height={20} rx={8} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={5} />
          <circle cx={122} cy={-148} r={18} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <circle cx={-32} cy={-148} r={18} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 爪車の止め爪 */}
        <path d="M -108 -196 L -52 -176 L -52 -158 L -112 -174 Z" fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={-112} y={-40} width={28} height={40} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <Person x={1610} y={902} s={1.02} cloth="#6B5B49" clothDark="#50443A" tasuki="#C9B48E"
        f={f} phase={0} lean={-5} gaze={[-5, -3]} />
      <FlatCap x={1610} y={902} s={1.02} f={f} phase={0} />
      {/* 上がる向きの矢印 */}
      <ForceArrow x={LX - 286} y={pY - 100} len={216} rot={-90} w={24} color={KRP.green}
        t={seg(f, 16, 32)} label="上がる" labelSize={36} />
      {/* 札 */}
      <TagPlate x={430} y={470} text="荷台" size={48} t={seg(f, 6, 20)} />
      <TagPlate x={1240} y={318} text="人は乗らない" size={42} t={seg(f, 24, 40)} color={KRP.red} />
      <TagPlate x={1430} y={606} text="巻き上げ機" size={38} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #71 ロープと滑車。引いていたのは、人の力です。 =====
// 格: 図  ★「図」の見本。これと同じ作りこみ・同じ大きさで他の図も描く。
// どこ: 図面の上。舞台も背景も人も置かない。滑車とロープと「引く手」だけに寄る。
// 演出: 梁から吊った綱車が画面の上半分を占める。左の strand が荷台を吊り、
//       右の strand を大きな手が握る。溝・軸・ボルト・スポーク・ロープの撚りまで描く。
// 動き: 手が引き下げられ (sin)、荷台がその分だけ上がる。綱車が回る。矢印が伸びる。
const Kb2RopeKasshaHito: React.FC<{ f: number }> = ({ f }) => {
  const SX = 760, SY = 330, SR = 210;          // 綱車の中心と半径
  const LX = SX - SR * 0.82;                   // 荷台側の strand
  const HX = SX + SR * 0.82;                   // 手側の strand
  const pull = (Math.sin((f - 10) / 14) * 0.5 + 0.5) * easeOut(clamp01(seg(f, 4, 28)));
  const handY = 640 + pull * 130;              // 手が下がる
  const loadY = 790 - pull * 130;              // 荷台が同じだけ上がる
  const rot = -pull * 44 + f * 0.6;
  return (
    <Frame f={f} seed={605} bg={KRP.cream}>
      <GridPaper />

      {/* 吊り元の梁 (図面の天井。画面を端から端まで横切らせる) */}
      <rect x={-20} y={66} width={W + 40} height={58} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.8}>
        <line x1={-20} y1={96} x2={W + 20} y2={96} />
      </g>
      <Rivets x1={60} y1={95} x2={1860} y2={95} n={14} r={8} fill={BP.woodDark} />
      <g>
        {[300, 1180, 1620].map((bx) => (
          <g key={bx}>
            <rect x={bx - 15} y={124} width={30} height={40} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            <HexBolt x={bx} y={144} r={12} />
          </g>
        ))}
      </g>

      {/* ロープ: 荷台 → 綱車 → 手 */}
      <Rope x1={LX} y1={loadY - 58} x2={LX} y2={SY} w={22} kind="hemp" f={f} />
      <Rope x1={HX} y1={SY} x2={HX} y2={handY - 24} w={22} kind="hemp" f={f} />

      {/* 綱車 (主役。画面の高さの4割を使う) */}
      <Sheave x={SX} y={SY} r={SR} rot={rot} spokes={6} groove bracket />

      {/* 荷台と樽 (吊られている物) */}
      <g transform={`translate(${LX} ${loadY}) scale(1.22)`}>
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={0} y1={-58} x2={-150} y2={-14} />
          <line x1={0} y1={-58} x2={150} y2={-14} />
        </g>
        <rect x={-172} y={-16} width={344} height={26} rx={7} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-172} y1={-3} x2={172} y2={-3} stroke={BP.woodDark} strokeWidth={4} />
        {[-82, 82].map((bx) => (
          <g key={bx} transform={`translate(${bx} -16)`}>
            <path d="M -52 0 Q -66 -52 -52 -106 L 52 -106 Q 66 -52 52 0 Z"
              fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
            <line x1={-61} y1={-34} x2={61} y2={-34} stroke={BP.woodDark} strokeWidth={6} />
            <line x1={-61} y1={-74} x2={61} y2={-74} stroke={BP.woodDark} strokeWidth={6} />
            <ellipse cx={0} cy={-106} rx={52} ry={13} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
      </g>

      {/* 引く手 (人は置かない。手だけに寄る) */}
      <g transform={`translate(${HX} ${handY})`}>
        {/* 腕 (画面の外へ抜ける) */}
        <path d="M 26 46 L 210 150 L 290 112 L 110 8 Z" fill="#D8A273" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 196 142 L 300 196 L 360 128 L 268 76 Z" fill="#6B6356" stroke={KRP.ink} strokeWidth={7} />
        {/* 掌 */}
        <path d="M -64 -34 Q -74 42 -22 62 L 56 62 Q 100 44 94 -26 Q 60 -54 0 -56 Q -44 -56 -64 -34 Z"
          fill="#E3B183" stroke={KRP.ink} strokeWidth={7} />
        {/* ロープを握る指 4本 */}
        <g fill="#E3B183" stroke={KRP.ink} strokeWidth={6}>
          {[-44, -6, 32, 68].map((fy, i) => (
            <rect key={i} x={-54} y={fy - 36} width={108} height={30} rx={15} />
          ))}
        </g>
        {/* 親指 */}
        <path d="M -56 -24 Q -104 -8 -94 32 Q -72 50 -50 32" fill="#E3B183" stroke={KRP.ink} strokeWidth={6} />
        {/* 握りの皺 */}
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5}>
          <line x1={-30} y1={-52} x2={-18} y2={-40} />
          <line x1={10} y1={-54} x2={22} y2={-42} />
        </g>
      </g>

      {/* 力の矢印: 手は下へ引き、荷は上へ行く */}
      <ForceArrow x={HX + 118} y={handY + 70} len={230} rot={90} w={24}
        color={KRP.red} t={seg(f, 14, 30)} label="引く" labelSize={36} />
      <ForceArrow x={LX - 268} y={loadY - 84} len={230} rot={-90} w={24}
        color={KRP.green} t={seg(f, 20, 36)} label="上がる" labelSize={36} />

      {/* 札 (下端 = y + size*0.85 を 830 以下に) */}
      <TagPlate x={1450} y={330} text="滑車" size={56} t={seg(f, 6, 20)} />
      <TagPlate x={1450} y={450} text="溝にロープが乗る" size={32} t={seg(f, 16, 30)} />
      <TagPlate x={1546} y={790} text="人の力" size={46} t={seg(f, 26, 42)} color={KRP.red} />
      <TagPlate x={330} y={790} text="荷物" size={40} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #72 19世紀には、蒸気の力で動くようになります。 =====
// 格: 並
// どこ: 工場の一角。煉瓦壁、高窓、天井の線軸。描くのは「蒸気機関」ひとつ。
// 演出: 画面の左半分をはずみ車が占める。そこからベルトが天井の線軸へ上がっていく。
//       右にシリンダとクロスヘッド、上に調速機。煙突の煙が窓の外へ立つ。
//       背景は 煉瓦壁 / 高窓 / 天井の線軸 / 石の床 の4要素だけ。
// 動き: はずみ車とクランクが回り、連接棒とピストンが往復する。ベルトの縞が流れる。
//       調速機の玉が振り回される。弁から蒸気が吹く。煙がのぼる。
const Kb2JoukiNoChikara: React.FC<{ f: number }> = ({ f }) => {
  const th = (f * 4.6 * Math.PI) / 180;              // クランク角
  const FX = 620, FY = 636, FR = 212;                // はずみ車
  const crankR = 148;
  const px = FX + Math.cos(th) * crankR, py = FY + Math.sin(th) * crankR;
  const xc = 1090 + Math.cos(th) * 54;               // クロスヘッド
  const belt = (f * 3.2) % 40;
  const puff = ((f % 26) / 26);
  return (
    <Frame f={f} seed={606} bg={KRP.cream}>
      {/* 煉瓦壁 */}
      <Bricks x={-20} y={40} w={W + 40} h={856} bw={54} bh={26} />
      <rect x={-20} y={40} width={W + 40} height={856} fill="#8E5438" opacity={0.12} />
      {/* 高窓 (外に煙突の煙が見える) */}
      <g>
        <rect x={1446} y={132} width={300} height={214} fill={C.skyDay}
          stroke={KRP.ink} strokeWidth={8} />
        <Smoke x={1570} y={330} f={f} n={6} r={26} rise={200} speed={0.8} drift={44}
          color="#B7B0A4" opacity={0.6} />
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={1596} y1={132} x2={1596} y2={346} />
          <line x1={1446} y1={239} x2={1746} y2={239} />
        </g>
        <rect x={1434} y={346} width={324} height={18} fill={C.stone}
          stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 天井の線軸 (工場の全部がここから動く) */}
      <g>
        <rect x={-20} y={150} width={W + 40} height={40} fill={C.woodDark}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={-20} y={212} width={W + 40} height={26} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={6} />
        {[260, 1020, 1480, 1820].map((sx) => (
          <g key={sx}>
            <rect x={sx - 44} y={200} width={88} height={50} rx={6} fill={BP.steelDark}
              stroke={KRP.ink} strokeWidth={5} />
            <HexBolt x={sx} y={225} r={11} rot={f * 3} />
          </g>
        ))}
        <circle cx={FX} cy={266} r={92} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${f * 5.1} ${FX} 266)`} stroke={BP.ironDark} strokeWidth={6}>
          <line x1={FX - 80} y1={266} x2={FX + 80} y2={266} />
          <line x1={FX} y1={186} x2={FX} y2={346} />
        </g>
        <circle cx={FX} cy={266} r={18} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* ベルト (はずみ車 → 線軸) */}
      <g>
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <line x1={FX + sg * FR} y1={FY} x2={FX + sg * 92} y2={266}
              stroke={BP.hempDark} strokeWidth={26} strokeLinecap="butt" />
            <line x1={FX + sg * FR} y1={FY} x2={FX + sg * 92} y2={266}
              stroke="#C6A277" strokeWidth={16} strokeDasharray="20 20"
              strokeDashoffset={sg * belt} />
          </g>
        ))}
      </g>
      {/* 石の床と基礎 */}
      <Stones x={-20} y={896} w={W + 40} h={200} bw={150} bh={66} />
      <rect x={-20} y={896} width={W + 40} height={14} fill="#B6AC97"
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={380} y={840} width={1180} height={60} fill={C.stone}
        stroke={KRP.ink} strokeWidth={7} />
      {/* はずみ車 (主役) */}
      <g>
        <circle cx={FX} cy={FY} r={FR} fill={BP.iron} stroke={KRP.ink} strokeWidth={9} />
        <circle cx={FX} cy={FY} r={FR - 30} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={FX} cy={FY} r={FR - 46} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${f * 4.6} ${FX} ${FY})`}>
          <g stroke={KRP.ink} strokeWidth={13}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              return (
                <line key={i} x1={FX + Math.cos(a) * 44} y1={FY + Math.sin(a) * 44}
                  x2={FX + Math.cos(a) * (FR - 46)} y2={FY + Math.sin(a) * (FR - 46)} />
              );
            })}
          </g>
          <g stroke={BP.steelLight} strokeWidth={5} opacity={0.6}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              return (
                <line key={i} x1={FX + Math.cos(a) * 50} y1={FY + Math.sin(a) * 50}
                  x2={FX + Math.cos(a) * (FR - 52)} y2={FY + Math.sin(a) * (FR - 52)} />
              );
            })}
          </g>
        </g>
        <circle cx={FX} cy={FY} r={46} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2, 3].map((i) => {
          const a = ((i * 90 + f * 4.6) * Math.PI) / 180;
          return <HexBolt key={i} x={FX + Math.cos(a) * 30} y={FY + Math.sin(a) * 30} r={8} />;
        })}
        {/* クランクピン */}
        <circle cx={px} cy={py} r={24} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 連接棒 → クロスヘッド → ピストン → シリンダ */}
      <g>
        <line x1={px} y1={py} x2={xc} y2={FY} stroke={KRP.ink} strokeWidth={30}
          strokeLinecap="round" />
        <line x1={px} y1={py} x2={xc} y2={FY} stroke={BP.steel} strokeWidth={20}
          strokeLinecap="round" />
        <rect x={xc - 34} y={FY - 46} width={68} height={92} rx={8} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={xc - 60} y={FY - 60} width={28} height={120} rx={6} fill={BP.grease}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={xc + 20} y={FY - 15} width={280} height={30} rx={8} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={6} />
        {/* シリンダ */}
        <rect x={1296} y={FY - 108} width={330} height={216} rx={16} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={1296} y={FY - 76} width={330} height={16} fill={BP.ironDark} opacity={0.8} />
        <rect x={1296} y={FY + 60} width={330} height={16} fill={BP.ironDark} opacity={0.8} />
        <rect x={1282} y={FY - 124} width={34} height={248} rx={8} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={1610} y={FY - 124} width={34} height={248} rx={8} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={1300} y1={FY - 96} x2={1620} y2={FY - 96} n={7} r={8} />
        {/* 弁の箱と、吹き出す蒸気 */}
        <rect x={1380} y={FY - 164} width={150} height={60} rx={8} fill={BP.brassDark}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1440} y={FY - 206} width={30} height={46} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        <g opacity={1 - puff}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={1455 + (i + 1) * 30 + puff * 90}
              cy={FY - 220 - puff * 70 - i * 14} r={18 + puff * 34 + i * 5}
              fill={KRP.white} opacity={0.75} />
          ))}
        </g>
        {/* 蒸気の配管 */}
        <path d={`M 1626 ${FY + 40} Q 1760 ${FY + 40} 1760 ${FY - 220} L 1760 300`}
          fill="none" stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
        <path d={`M 1626 ${FY + 40} Q 1760 ${FY + 40} 1760 ${FY - 220} L 1760 300`}
          fill="none" stroke={BP.steel} strokeWidth={16} strokeLinecap="round" />
      </g>
      {/* 調速機 (玉が振り回される) */}
      <g transform="translate(900 418)">
        <rect x={-13} y={0} width={26} height={176} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={20} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        {[-1, 1].map((sg) => {
          const spread = 76 + Math.abs(Math.cos(th * 0.5)) * 26;
          return (
            <g key={sg}>
              <line x1={0} y1={-6} x2={sg * spread} y2={74} stroke={KRP.ink} strokeWidth={9} />
              <circle cx={sg * spread} cy={74} r={28} fill={BP.brass}
                stroke={KRP.ink} strokeWidth={6} />
              <circle cx={sg * spread - 8} cy={66} r={8} fill={KRP.white} opacity={0.4} />
            </g>
          );
        })}
      </g>
      {/* 機関士 (1人だけ) */}
      <Person x={1210} y={896} s={1.04} cloth="#4F5A66" clothDark="#3A434D" tasuki="#C9B48E"
        f={f} phase={0} gaze={[4, -2]} />
      <FlatCap x={1210} y={896} s={1.04} f={f} phase={0} />
      {/* 札 */}
      <TagPlate x={620} y={782} text="蒸気機関" size={48} t={seg(f, 4, 18)} />
      <TagPlate x={1096} y={300} text="ベルトで上へ" size={38} t={seg(f, 14, 28)} />
      <TagPlate x={1596} y={420} text="蒸気" size={44} t={seg(f, 24, 38)} color={KRP.red} />
    </Frame>
  );
};

// ===== #73 力は、足りました。足りないのは、別のものです。 =====
// 格: 図
// どこ: 方眼の上。舞台も人も置かない。左右2つの台の上に、あるものと無いものを置く。
// 演出: 左の台には蒸気の力 (回り続けるはずみ車) が乗っていて、○がつく。
//       右の台には何も乗っていない。点線の空き枠と、大きな？だけ。
//       「ある」と「無い」を同じ大きさで並べるので、無いほうが際立つ。
// 動き: 左のはずみ車が回り続ける。力の矢印が脈打つ。右の点線の枠が流れ、？が浮く。
const Kb2ChikaraWaTarita: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 0.82 + 0.18 * Math.sin(f / 7);
  const march = (f * 2.2) % 36;
  const Flywheel = (
    <g transform="translate(0 -168)">
      <circle cx={0} cy={0} r={150} fill={BP.iron} stroke={KRP.ink} strokeWidth={9} />
      <circle cx={0} cy={0} r={124} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={0} r={108} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`rotate(${f * 5.4})`}>
        <g stroke={KRP.ink} strokeWidth={12}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * 60 * Math.PI) / 180;
            return <line key={i} x1={Math.cos(a) * 34} y1={Math.sin(a) * 34}
              x2={Math.cos(a) * 108} y2={Math.sin(a) * 108} />;
          })}
        </g>
        <g stroke={BP.steelLight} strokeWidth={5} opacity={0.6}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * 60 * Math.PI) / 180;
            return <line key={i} x1={Math.cos(a) * 40} y1={Math.sin(a) * 40}
              x2={Math.cos(a) * 100} y2={Math.sin(a) * 100} />;
          })}
        </g>
      </g>
      <circle cx={0} cy={0} r={36} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
      <HexBolt x={0} y={0} r={13} rot={f * 5.4} />
      {/* 台への据え付け */}
      <rect x={-104} y={140} width={208} height={30} rx={6} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={-72} y={156} r={10} />
      <HexBolt x={72} y={156} r={10} />
    </g>
  );
  const EmptyBox = (
    <g>
      <rect x={-162} y={-336} width={324} height={336} rx={14} fill="none" stroke={KRP.ink}
        strokeWidth={8} strokeDasharray="26 22" strokeDashoffset={-march} opacity={0.6} />
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.22}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-162 + i * 54} y1={0} x2={-162 + i * 54 + 54} y2={-336} />
        ))}
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={607} bg={KRP.cream}>
      <GridPaper />
      <MaruBatsu x={960} y={700} s={1} t={seg(f, 8, 26)} gap={820}
        leftNode={Flywheel} rightNode={EmptyBox}
        leftMark="maru" rightMark="none" />
      {/* 左: 力は出ている */}
      <ForceArrow x={286} y={548} len={216} rot={-90} w={26} color={KRP.red}
        t={seg(f, 14, 30) * pulse} label="力" labelSize={44} />
      <ForceArrow x={818} y={548} len={216} rot={-90} w={26} color={KRP.red}
        t={seg(f, 18, 34) * pulse} />
      {/* 右: 何かが要る */}
      <QMark x={1370} y={476} s={2.6} f={f} t={seg(f, 24, 40)} />
      {/* 札 (下端 = y + size*0.85 を 830 以下に) */}
      <TagPlate x={550} y={782} text="力" size={56} t={seg(f, 10, 24)} />
      <TagPlate x={1370} y={782} text="？" size={56} t={seg(f, 28, 42)}
        color={KRP.red} fill="#FBE3DE" />
      <TagPlate x={1370} y={236} text="足りない" size={44} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #74 ロープが切れれば、乗っている物は落ちます。 =====
// 格: 図
// どこ: 方眼の上。#71 と同じ「梁・綱車・荷台」の図に寄るが、ロープが切れている。
// 演出: 左の strand が真ん中で切れ、上の端は跳ね上がり、下の端は荷台とともに落ちた。
//       切れ口はほぐれた素線まで描く。右の strand は無事なので、綱車は空回りしている。
//       落ちる向きを、画面の高さを使った太い矢印1本で言う。
// 動き: 荷台が落ちきる (easeOut)。切れ口の素線がふるえる。綱車が速く空回りする。
//       落下の筋が流れ、床の手前でほこりが立つ。
const Kb2KireteOchiru: React.FC<{ f: number }> = ({ f }) => {
  const p = easeOut(clamp01(seg(f, 6, 30)));
  const SX = 640, SY = 300, SR = 184;
  const LX = SX - SR * 0.82, HX = SX + SR * 0.82;
  const pY = lerp(470, 782, p);                      // 荷台の床
  const tilt = Math.sin(p * 7) * 5 * (1 - p * 0.5);
  return (
    <Frame f={f} seed={608} bg={KRP.cream}>
      <GridPaper />
      {/* 吊り元の梁 */}
      <rect x={-20} y={66} width={W + 40} height={58} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={7} />
      <line x1={-20} y1={96} x2={W + 20} y2={96} stroke={BP.woodDark} strokeWidth={5} opacity={0.8} />
      <Rivets x1={60} y1={95} x2={1860} y2={95} n={14} r={8} fill={BP.woodDark} />
      {[300, 1180, 1620].map((bx) => (
        <g key={bx}>
          <rect x={bx - 15} y={124} width={30} height={40} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5} />
          <HexBolt x={bx} y={144} r={12} />
        </g>
      ))}
      {/* 無事な側の strand と、下の巻き上げドラム (空回りの理由) */}
      <Rope x1={HX} y1={SY} x2={HX} y2={742} w={22} kind="hemp" f={f} />
      <g transform={`translate(${HX} 800)`}>
        <rect x={-96} y={34} width={192} height={26} rx={6} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-8} r={62} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${f * 9}) `} stroke={BP.ironDark} strokeWidth={7}>
          <line x1={-54} y1={0} x2={54} y2={0} />
          <line x1={0} y1={-54} x2={0} y2={54} />
        </g>
        <circle cx={0} cy={-8} r={16} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 切れた側: 上の端 (跳ね上がっている) */}
      <Rope x1={LX} y1={SY} x2={LX} y2={430 - p * 26} w={22} kind="hemp" f={f} />
      <RopeFray x={LX} y={430 - p * 26} dir={1} s={1.5} kind="hemp" t={seg(f, 6, 18)} />
      {/* 綱車 (張りが抜けたので速く空回りする) */}
      <Sheave x={SX} y={SY} r={SR} rot={-f * 9} spokes={6} groove bracket />
      {/* 落下の筋 */}
      <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.3 + p * 0.3}>
        {[-170, -86, 0, 92, 174].map((dx, i) => (
          <line key={dx} x1={LX + dx} y1={pY - 300 + i * 18} x2={LX + dx} y2={pY - 150 + i * 18} />
        ))}
      </g>
      {/* 切れた側: 下の端 (荷台と一緒に落ちた) */}
      <Rope x1={LX} y1={pY - 206} x2={LX} y2={pY - 76} w={22} kind="hemp" f={f} />
      <RopeFray x={LX} y={pY - 206} dir={-1} s={1.5} kind="hemp" t={seg(f, 8, 20)} />
      {/* 落ちていく荷台 */}
      <g transform={`translate(${LX} ${pY}) rotate(${tilt})`}>
        <g stroke={KRP.ink} strokeWidth={7}>
          <line x1={0} y1={-76} x2={-186} y2={-18} />
          <line x1={0} y1={-76} x2={186} y2={-18} />
        </g>
        <rect x={-212} y={-20} width={424} height={30} rx={8} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={7} />
        <line x1={-212} y1={-4} x2={212} y2={-4} stroke={BP.woodDark} strokeWidth={5} />
        {[-104, 64].map((bx) => (
          <g key={bx} transform={`translate(${bx} -20)`}>
            <path d="M -58 0 Q -74 -60 -58 -122 L 58 -122 Q 74 -60 58 0 Z"
              fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
            <line x1={-68} y1={-40} x2={68} y2={-40} stroke={BP.ironDark} strokeWidth={8} />
            <line x1={-68} y1={-86} x2={68} y2={-86} stroke={BP.ironDark} strokeWidth={8} />
            <ellipse cx={0} cy={-122} rx={58} ry={14} fill={BP.woodLight}
              stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
      </g>
      {/* 床と、立ちはじめたほこり */}
      <line x1={-20} y1={906} x2={W + 20} y2={906} stroke={KRP.ink} strokeWidth={9} />
      <g stroke={KRP.ink} strokeWidth={6} strokeDasharray="20 16" opacity={0.45}>
        <line x1={LX - 240} y1={860} x2={LX + 240} y2={860} />
      </g>
      <Smoke x={LX} y={900} f={f} n={5} r={30} rise={110} speed={0.9} drift={70}
        color="#C8C0B2" opacity={0.42 * p} grow={1.4} />
      {/* 落下の矢印 (画面の高さを使う) */}
      <ForceArrow x={1120} y={330} len={430} rot={90} w={36} color={KRP.red}
        t={seg(f, 12, 32)} label="落ちる" labelSize={50} />
      {/* 札 */}
      <TagPlate x={312} y={430} text="切れた" size={50} t={seg(f, 2, 16)} color={KRP.red} />
      <TagPlate x={1512} y={700} text="止めるものが無い" size={40} t={seg(f, 24, 40)}
        color={KRP.red} />
      <TagPlate x={1512} y={206} text="空回り" size={42} t={seg(f, 18, 32)} />
    </Frame>
  );
};

// ===== #75 荷物なら、壊れるだけ。人だと、そうはいきません。 =====
// 格: 図
// どこ: 方眼の上。#73 と同じ2つの台。載せる物だけが入れ替わっている。
// 演出: 左の台には落ちて割れた樽。箍が外れ、側板が扇に開き、中身が台にこぼれている。
//       右の台には人の影。影の上に、画面を切るような赤い×が落ちてくる。
//       同じ大きさで並べるので、同じ落下が別の意味になることが一目でわかる。
// 動き: 樽のひびが広がり、こぼれた中身の粒が跳ねる。影がゆらぐ。×が弾ける。
const Kb2NimotsuToHito: React.FC<{ f: number }> = ({ f }) => {
  const crack = clamp01(seg(f, 8, 26));
  const spill = clamp01(seg(f, 14, 34));
  const BrokenBarrel = (
    <g>
      {/* 外れて転がった箍 */}
      <ellipse cx={-190} cy={-14} rx={74} ry={20} fill="none" stroke={BP.ironDark}
        strokeWidth={11} transform="rotate(-14 -190 -14)" />
      <ellipse cx={196} cy={-12} rx={66} ry={17} fill="none" stroke={BP.ironDark}
        strokeWidth={11} transform="rotate(11 196 -12)" />
      {/* 扇に開いた側板 */}
      <g>
        {[-58, -34, -11, 12, 36, 60].map((a, i) => (
          <g key={a} transform={`rotate(${a * (0.5 + crack * 0.6)} 0 -16)`}>
            <path d={`M ${-26} -16 L ${-20} ${-246 - i % 2 * 14} L ${20} ${-246 - i % 2 * 14}
                      L ${26} -16 Z`}
              fill={i % 2 ? BP.wood : BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
      </g>
      {/* 割れて残った胴の下半分 */}
      <path d="M -112 0 Q -126 -66 -112 -132 L 112 -132 Q 126 -66 112 0 Z"
        fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <line x1={-124} y1={-52} x2={124} y2={-52} stroke={BP.ironDark} strokeWidth={10} />
      <Crack d="M -34 -132 L -14 -86 L -44 -52 L -20 -6" t={crack} sw={7} />
      <Crack d="M 52 -132 L 34 -92 L 66 -56 L 48 -10" t={crack} sw={6} />
      <Crack d="M -112 -96 L -56 -78 L -10 -104 L 58 -82 L 112 -100" t={crack} sw={5} />
      {/* こぼれた中身 */}
      <g>
        {Array.from({ length: 22 }, (_, i) => {
          const d = rnd(i * 3.7);
          const q = clamp01(spill * 1.4 - d * 0.4);
          const hop = Math.abs(Math.sin(q * 3.1)) * 46 * (1 - q);
          return (
            <circle key={i} cx={lerp(0, (d - 0.5) * 460, q)} cy={-10 - hop}
              r={9 + d * 7} fill={i % 3 ? "#D8C08A" : "#C2A871"}
              stroke={KRP.ink} strokeWidth={3} opacity={q} />
          );
        })}
      </g>
    </g>
  );
  const Shadow = (
    <g>
      <ellipse cx={0} cy={2} rx={128} ry={26} fill={KRP.ink} opacity={0.22} />
      <g opacity={0.88} transform={`translate(${Math.sin(f / 19) * 4} 0)`}>
        {/* 人の影 (塗りだけ。顔も服も描かない) */}
        <path d="M -56 0 L -56 -112 L -78 -112 L -78 -196 Q -78 -232 -44 -240
                 L -44 -258 A 44 44 0 1 1 44 -258 L 44 -240 Q 78 -232 78 -196
                 L 78 -112 L 56 -112 L 56 0 L 18 0 L 18 -112 L -18 -112 L -18 0 Z"
          fill="#3A342C" stroke={KRP.ink} strokeWidth={6} />
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={609} bg={KRP.cream}>
      <GridPaper />
      <MaruBatsu x={960} y={700} s={1} t={seg(f, 6, 24)} gap={820}
        leftNode={BrokenBarrel} rightNode={Shadow}
        leftMark="none" rightMark="batsu" />
      {/* 同じ落下だと言うための矢印 (左右に同じものを置く) */}
      <ForceArrow x={210} y={298} len={180} rot={90} w={22} color={KRP.ink}
        t={seg(f, 2, 16)} />
      <ForceArrow x={1716} y={298} len={180} rot={90} w={22} color={KRP.ink}
        t={seg(f, 2, 16)} />
      {/* 札 */}
      <TagPlate x={550} y={782} text="荷物" size={52} t={seg(f, 10, 24)} />
      <TagPlate x={1370} y={782} text="人" size={52} t={seg(f, 14, 28)} color={KRP.red} />
      <TagPlate x={550} y={230} text="壊れるだけ" size={40} t={seg(f, 22, 36)} />
      <TagPlate x={1370} y={178} text="そうはいかない" size={40} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb2_door: (f) => <Kb2Door f={f} />,
  kb2_kaidan_muri: (f) => <Kb2KaidanMuri f={f} />,
  kb2_6kai_demo: (f) => <Kb26kaiDemo f={f} />,
  kb2_elevator_toujou: (f) => <Kb2ElevatorToujou f={f} />,
  kb2_nimotsu_moto: (f) => <Kb2NimotsuMoto f={f} />,
  kb2_rope_kassha_hito: (f) => <Kb2RopeKasshaHito f={f} />,
  kb2_jouki_no_chikara: (f) => <Kb2JoukiNoChikara f={f} />,
  kb2_chikara_wa_tarita: (f) => <Kb2ChikaraWaTarita f={f} />,
  kb2_kirete_ochiru: (f) => <Kb2KireteOchiru f={f} />,
  kb2_nimotsu_to_hito: (f) => <Kb2NimotsuToHito f={f} />,
};

export const K_B2A_MOTIFS: string[] = [
  "kb2_door",               // #66 第2章、人を、上げる。
  "kb2_kaidan_muri",        // #67 高い建物が建っても、毎日、階段では登れません。
  "kb2_6kai_demo",          // #68 30階の話ではありません。6階でも、もう嫌です。
  "kb2_elevator_toujou",    // #69 そこで必要になったのが、エレベーターです。
  "kb2_nimotsu_moto",       // #70 もともとは、荷物を上げ下げする仕組みでした。
  "kb2_rope_kassha_hito",   // #71 ロープと滑車。引いていたのは、人の力です。
  "kb2_jouki_no_chikara",   // #72 19世紀には、蒸気の力で動くようになります。
  "kb2_chikara_wa_tarita",  // #73 力は、足りました。足りないのは、別のものです。
  "kb2_kirete_ochiru",      // #74 ロープが切れれば、乗っている物は落ちます。
  "kb2_nimotsu_to_hito",    // #75 荷物なら、壊れるだけ。人だと、そうはいきません。
];

export const kosoB2aScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
