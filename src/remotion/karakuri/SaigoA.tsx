// 「人類は、昔から飛ばして観ていた」: 文#1〜#12 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1000〜1011。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { QuizQ } from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#232B3A",        // 夜の部屋の地
  nightWall: "#2F3950",    // 夜の壁
  nightFloor: "#3C3528",   // 夜の床
  deskWood: "#C89B62",     // 作業机の木
  deskWoodDark: "#A87F4C",
  craft: "#E6D9BC",        // クラフト紙 (SGP.barCraft より明るめの台紙)
  tatami: "#B9C291",       // 畳
  alcove: "#E9DFC8",       // 床の間の壁
  lobbyWall: "#EADFC6",    // 映画館ロビーの壁
  carpet: "#A8433E",       // ロビーの赤絨毯
  hallDark: "#1C2330",     // 上映中の場内
  seatRed: "#8E3B3C",      // 客席の椅子
  glowWarm: "#F6E7A8",     // 漏れる明かり
  phoneGlow: "#BFE4EE",    // タブレットの光 (SGP.phoneBlue より淡い)
  oldJar: "#8E8468",       // 年代物の壺
  shopWall: "#D8C49A",     // 商店の板壁
} as const;
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate; void QuizQ;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// ゆっくり入って・ゆっくり止まる (寄りのカメラ用)。KarakuriScenes には easeOut しかない
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない)
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};

// 麻縄で吊るす木札 (#2「ご自由に」/#12「新入荷」)。y は縄の付け根
const WoodTag: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; f?: number;
}> = ({ x, y, text, size = 40, t = 1, f = 0 }) => {
  const tt = pop(clamp01(t));
  if (tt <= 0) return null;
  const sway = Math.sin(f / 11) * 3.5;
  const w = text.length * size + 56;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${tt})`}>
      <line x1={0} y1={0} x2={0} y2={44} stroke="#8A7452" strokeWidth={6} />
      <line x1={-3} y1={6} x2={3} y2={14} stroke="#8A7452" strokeWidth={3} />
      <g transform={`translate(0 ${44 + size * 0.95})`}>
        <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={8}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-w / 2 + 8} y={-size * 0.95 + 8} width={w - 16} height={size * 1.9 - 16}
          rx={5} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
        <circle cx={0} cy={-size * 0.62} r={5} fill={KRP.ink} opacity={0.8} />
        <text x={0} y={size * 0.42} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={size} fill={KRP.white}>{text}</text>
      </g>
    </g>
  );
};

// --- #4「観かたの系図」用のローカル部品 ---
// 墨の筋 (細い罫ではなく、にじみのある太い墨)。縦・横の直線を t で伸ばす
const SumiV: React.FC<{ x: number; y0: number; y1: number; t: number; w?: number }> =
  ({ x, y0, y1, t, w = 8 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    const y = lerp(y0, y1, easeOut(tt));
    return (
      <g strokeLinecap="round" fill="none">
        <line x1={x} y1={y0} x2={x} y2={y} stroke={KRP.ink} strokeWidth={w + 5} opacity={0.14} />
        <line x1={x} y1={y0} x2={x} y2={y} stroke={KRP.ink} strokeWidth={w} opacity={0.82} />
      </g>
    );
  };
const SumiH: React.FC<{ x0: number; x1: number; y: number; t: number; w?: number }> =
  ({ x0, x1, y, t, w = 8 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    const x = lerp(x0, x1, easeOut(tt));
    return (
      <g strokeLinecap="round" fill="none">
        <line x1={x0} y1={y} x2={x} y2={y} stroke={KRP.ink} strokeWidth={w + 5} opacity={0.14} />
        <line x1={x0} y1={y} x2={x} y2={y} stroke={KRP.ink} strokeWidth={w} opacity={0.82} />
      </g>
    );
  };
// 系図のひとつの節 (観る場所・観る道具の小さな絵)。足元 (x,y) から上へ生える
const KeizuNode: React.FC<{
  x: number; y: number; t: number; children?: React.ReactNode;
}> = ({ x, y, t, children }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${p})`}>{children}</g>;
};
// 系図の節の下に置く短いラベル (墨の手書き風。年号は書かない)
const KeizuLabel: React.FC<{ x: number; y: number; text: string; size: number; t: number }> =
  ({ x, y, text, size, t }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g opacity={tt}>
        <line x1={x - (text.length * size) / 2 - 6} y1={y + size * 0.26}
          x2={x + (text.length * size) / 2 + 6} y2={y + size * 0.26}
          stroke={SGP.shuin} strokeWidth={3} opacity={0.45} />
        <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={size} fill={KRP.ink}>{text}</text>
      </g>
    );
  };

// 湯気・煙のひとすじ (f でゆらぐ)
const Steam: React.FC<{ x: number; y: number; f: number; s?: number; op?: number }> =
  ({ x, y, f, s = 1, op = 0.5 }) => (
    <g fill="none" stroke={KRP.grayDark} strokeWidth={5 * s} strokeLinecap="round" opacity={op}>
      <path d={`M ${x} ${y} q ${Math.sin(f / 9) * 14} -34 ${Math.sin(f / 13) * 8} -62
        q ${-Math.sin(f / 9) * 14} -30 ${Math.sin(f / 15) * 10} -58`} />
    </g>
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #1 人類は、昔から飛ばして観ていました。
// 格: 山 / seed 1000
// 絵: 夜の部屋。毛布にくるまりタブレットを観る現代人。画面の光が顔を照らし、指がスッと動いて10秒飛ばし。タイトル文がドン
// どこ: 夜の自宅リビング。窓の外は夜景、ソファの上
// 演出: タブレットの青白い光だけが顔と毛布を照らす。スワイプで「10秒→」が出る
// 動き: 星の瞬き・光のちらつき・指スワイプ(f14-22)・湯気・タイトルがドン(f26-38)
const Sg001: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.75 + 0.25 * Math.sin(f / 2.7);           // 画面のちらつき
  const swipe = easeOut(seg(f, 14, 22));                   // 指のスワイプ
  const title = pop(seg(f, 26, 38));                       // タイトルがドン
  return (
    <Frame f={f} seed={1000} dark bg={C.night}>
      {/* 部屋: 壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={790} fill={C.nightWall} />
      <rect x={-20} y={760} width={W + 40} height={340} fill={C.nightFloor} />
      <line x1={-20} y1={760} x2={W + 20} y2={760} stroke={KRP.ink} strokeWidth={7} />
      {/* 床板の目地 */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.25}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={lerp(1500, 60, i / 7)} y1={1100} x2={lerp(1220, 740, i / 7)} y2={760} />
        ))}
      </g>
      {/* 窓: 夜景 (ビルの灯・月・星) */}
      <g>
        <rect x={110} y={140} width={520} height={480} fill="#141B28" stroke={KRP.ink} strokeWidth={10} />
        <line x1={370} y1={140} x2={370} y2={620} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={250} cy={240} r={44} fill="#F3EAC6" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={236} cy={228} r={9} fill="#DCCFA3" />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={130 + rnd(1, i) * 480} cy={160 + rnd(2, i) * 240}
            r={1.6 + rnd(3, i) * 2} fill={KRP.white}
            opacity={0.3 + 0.5 * Math.sin(f / 11 + i * 1.7)} />
        ))}
        {/* 遠くのビル群と窓明かり */}
        {Array.from({ length: 6 }, (_, i) => {
          const bx = 120 + i * 86;
          const bh = 90 + rnd(4, i) * 120;
          return (
            <g key={i}>
              <rect x={bx} y={616 - bh} width={70} height={bh} fill="#1F2838" stroke="#0D131D" strokeWidth={3} />
              {Array.from({ length: 4 }, (_, k) => (
                <rect key={k} x={bx + 10 + (k % 2) * 32} y={616 - bh + 14 + Math.floor(k / 2) * 34}
                  width={16} height={18} fill={C.glowWarm}
                  opacity={rnd(5, i * 7 + k) < 0.55 ? 0.75 : 0.12} />
              ))}
            </g>
          );
        })}
        {/* カーテン */}
        <path d="M 96 120 q 36 250 -6 520 l -60 0 l 0 -520 z" fill="#4A4258" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 644 120 q -36 250 6 520 l 60 0 l 0 -520 z" fill="#4A4258" stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 壁の時計と額 */}
      <g opacity={0.9}>
        <circle cx={860} cy={250} r={62} fill="#EAE2CE" stroke={KRP.ink} strokeWidth={7} />
        <line x1={860} y1={250} x2={860} y2={206} stroke={KRP.ink} strokeWidth={6} />
        <line x1={860} y1={250} x2={892} y2={262} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1700} y={180} width={150} height={190} fill="#39445C" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1712 330 q 40 -70 64 -28 q 30 -52 62 6 l 0 22 l -126 0 z" fill="#5C6A88" />
      </g>
      {/* ローテーブルとマグ (湯気) */}
      <g>
        <rect x={360} y={880} width={430} height={26} rx={9} fill={C.deskWoodDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={400} y={906} width={22} height={120} fill="#8A6B42" stroke={KRP.ink} strokeWidth={6} />
        <rect x={720} y={906} width={22} height={120} fill="#8A6B42" stroke={KRP.ink} strokeWidth={6} />
        <rect x={520} y={818} width={78} height={62} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 598 832 q 30 14 0 30" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <Steam x={556} y={810} f={f} op={0.4} />
      </g>
      {/* ソファ */}
      <g>
        <rect x={960} y={620} width={760} height={200} rx={28} fill="#55617A" stroke={KRP.ink} strokeWidth={8} />
        <rect x={920} y={760} width={840} height={200} rx={26} fill="#49546B" stroke={KRP.ink} strokeWidth={8} />
        <rect x={920} y={940} width={840} height={24} rx={10} fill="#39435A" stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 住人: 毛布にくるまってタブレット */}
      <ellipse cx={1310} cy={944} rx={150} ry={26} fill="#0E131B" opacity={0.5} />
      <Person x={1310} y={930} s={1.5} cloth="#6A7585" clothDark="#49525F"
        face="smile" gaze={[0, 0.5]} f={f} pose="hold" />
      {/* 毛布 (体にかぶせる。タブレットより奥) */}
      <path d={`M 1150 960 q -20 -150 60 -196 q 36 ${Math.sin(f / 10) * 6 - 20} 104 -22
        q 110 -6 160 50 q 52 58 36 168 z`}
        fill="#8E5F52" stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} fill="none">
        <path d="M 1190 870 q 60 -26 150 -20" />
        <path d="M 1180 920 q 80 -24 190 -16" />
      </g>
      {/* タブレット (手元。毛布の上に持ち上げている) */}
      <g transform="translate(1310 756) rotate(-4)">
        <rect x={-150} y={-100} width={300} height={200} rx={16} fill="#20242C" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-132} y={-82} width={264} height={164} rx={8} fill={C.phoneGlow} opacity={0.55 + flick * 0.35} />
        {/* 画面の中身 (動画っぽい山と再生の印) */}
        <path d="M -120 50 l 56 -62 l 44 40 l 38 -52 l 54 74 z" fill="#7FB8CC" opacity={0.8} />
        <circle cx={0} cy={-18} r={26} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.85} />
        <polygon points="-7,-30 15,-18 -7,-6" fill={KRP.white} opacity={0.9} />
        {/* 指のスワイプ (f14-22) と「10秒→」 */}
        <circle cx={lerp(-70, 86, swipe)} cy={30} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
          opacity={swipe > 0 && swipe < 1 ? 0.95 : 0.35} />
        <g stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={swipe * (1 - seg(f, 24, 34))}>
          <line x1={-58} y1={22} x2={lerp(-58, 50, swipe)} y2={22} />
          <line x1={-48} y1={40} x2={lerp(-48, 38, swipe)} y2={40} />
        </g>
      </g>
      {/* 「10秒→」札とタブレットへの引き出し線 */}
      <line x1={1528} y1={694} x2={1452} y2={742} stroke={KRP.white} strokeWidth={4}
        strokeDasharray="10 8" opacity={0.7 * seg(f, 20, 28)} />
      <TagPlate x={1580} y={660} text="10秒→" size={34} t={seg(f, 20, 28)} rot={6} />
      {/* タブレットの光が顔と毛布を照らす */}
      <polygon points="1200,730 1420,730 1520,560 1120,560"
        fill={C.phoneGlow} opacity={0.14 * flick} />
      {/* タイトルがドン */}
      {title > 0 && (
        <g transform={`translate(960 240) scale(${title}) rotate(-1.2)`}>
          <rect x={-740} y={-92} width={1480} height={184} rx={18}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={11} />
          <rect x={-724} y={-76} width={1448} height={152} rx={12}
            fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={84} fill={KRP.ink}>人類は 昔から飛ばして観ていた</text>
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #2 ですので、この動画も、飛ばしながら観ていただいて構いません。
// 格: 並 / seed 1001
// 絵: `SaiseiBar` 初登場。クラフト紙の再生バー、つまみがぴょんと先へ跳ぶ。「ご自由に」の木札
// どこ: 工作机の上 (真上から)。クラフト紙をテープで貼った台紙
// 演出: 紙工作の再生バーに寄る。つまみがぴょんと跳んで「飛ばし」を実演
// 動き: つまみの跳び(f16-28)・着地の砂煙・木札のゆれ・ハサミの影ゆれ
const Sg002: React.FC<{ f: number }> = ({ f }) => {
  const jump = pop(seg(f, 16, 28));
  const prog = 0.2 + 0.42 * jump;
  const puff = seg(f, 26, 36);
  return (
    <Frame f={f} seed={1001}>
      {/* 作業机 (真上から)。木目 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.deskWood} />
      <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M -20 ${60 + i * 160} q 480 ${rnd(6, i) * 36 - 18} 980 0 q 480 ${rnd(7, i) * 36 - 18} 980 0`} fill="none" />
        ))}
      </g>
      <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.14}>
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse key={i} cx={300 + rnd(8, i) * 1300} cy={150 + rnd(9, i) * 800}
            rx={30 + rnd(10, i) * 40} ry={10 + rnd(11, i) * 12} fill="none" />
        ))}
      </g>
      {/* クラフト紙の台紙 (四隅をテープ留め) */}
      <g transform="rotate(-1.2 960 560)">
        <rect x={180} y={300} width={1560} height={560} rx={6}
          fill={C.craft} stroke={KRP.ink} strokeWidth={8} />
        <rect x={200} y={320} width={1520} height={520} rx={4}
          fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.25} strokeDasharray="14 10" />
        {([[200, 316, 40], [1700, 316, -38], [202, 844, -42], [1698, 844, 36]] as const).map(([tx, ty, r], i) => (
          <rect key={i} x={tx - 54} y={ty - 20} width={108} height={40} rx={4}
            fill={i % 2 ? "#E8A3A0" : "#9FC8C0"} opacity={0.85} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${r} ${tx} ${ty})`} />
        ))}
        {/* 再生バー (共有装置) */}
        <SaiseiBar f={f} x={960} y={620} s={1.04} t={1} progress={prog} />
        {/* つまみの跳びの軌跡 (跳んでいる間だけ) */}
        <path d={`M ${960 + (-700 + 1400 * 0.2) * 1.04} 600 q 310 -170 ${1400 * 0.42 * 1.04} 0`}
          fill="none" stroke={KRP.red} strokeWidth={6} strokeDasharray="4 18"
          strokeLinecap="round" opacity={jump > 0.02 ? (1 - puff) * 0.85 : 0} />
        {/* 着地の砂煙 */}
        {puff > 0 && puff < 1 && (
          <g opacity={(1 - puff) * 0.8}>
            {Array.from({ length: 5 }, (_, i) => (
              <circle key={i} cx={960 + (-700 + 1400 * 0.62) * 1.04 + (i - 2) * 34 * puff}
                cy={656 + puff * 18} r={8 + puff * 14} fill="none"
                stroke={KRP.grayDark} strokeWidth={4} />
            ))}
          </g>
        )}
      </g>
      {/* 「ご自由に」の木札 (画鋲で吊るす) */}
      <circle cx={1520} cy={162} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      <WoodTag x={1520} y={168} text="ご自由に" size={46} t={seg(f, 8, 18)} f={f} />
      {/* 机の上の道具: ハサミ・鉛筆・マスキングテープ・紙くず */}
      <g transform="rotate(14 320 980)">
        <circle cx={300} cy={980} r={26} fill="none" stroke={KRP.red} strokeWidth={9} />
        <circle cx={352} cy={1006} r={26} fill="none" stroke={KRP.red} strokeWidth={9} />
        <path d="M 318 962 L 470 880 M 368 988 L 500 926" stroke={KRP.silver} strokeWidth={13} strokeLinecap="round" />
        <path d="M 318 962 L 470 880 M 368 988 L 500 926" stroke={KRP.ink} strokeWidth={4} fill="none" />
      </g>
      <g transform={`rotate(${-24 + Math.sin(f / 17) * 1.5} 1500 990)`}>
        <rect x={1380} y={974} width={300} height={30} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="1680,974 1712,989 1680,1004" fill="#E0B23A" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1380} y={974} width={60} height={30} fill="#D8A82E" opacity={0.7} />
      </g>
      <g>
        <circle cx={240} cy={200} r={64} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={240} cy={200} r={30} fill={C.deskWood} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 302 186 q 40 10 2 30" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i}
          d={`M ${840 + rnd(12, i) * 700} ${90 + rnd(13, i) * 110} l ${20 + rnd(14, i) * 26} ${-8 + rnd(15, i) * 16} l -10 ${14 + rnd(16, i) * 10} z`}
          fill={i % 2 ? "#F0E8D2" : "#DCCCA8"} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #3 冗談に聞こえるかもしれませんが、本気です。
// 格: 図 / seed 1002
// 絵: 机の上。「冗談」の札がめくれて「本気」。朱の判子がドン (床=作業机の世界)
// どこ: 作業机の上。朱肉と判子と書類のある決裁の世界
// 演出: 中央の札が f6-18 で裏返り「冗談」→「本気」。f24-32 で判子がドンと落ち朱印
//       絵ぜんぶを <g> で包み、f2-40 でゆっくり寄る (Frame にカメラの prop がないため)
// 動き: カメラの寄り・札の反転・判子の落下と衝撃線・判子が当たる瞬間の手ぶれ・湯気・朱肉のフタのゆれ
// 音: 判子が当たる f31 の1コマ前から和太鼓のドドン (saigoSe.ts の sg_003)
const Sg003: React.FC<{ f: number }> = ({ f }) => {
  const flip = easeOut(seg(f, 6, 18));
  const face2 = flip > 0.5;                        // 後半は「本気」面
  const sx = Math.abs(Math.cos(Math.PI * flip));   // 横幅のつぶれで反転を表す
  const drop = easeOut(seg(f, 24, 31));
  const hit = seg(f, 31, 40);
  // 寄りのカメラ: 画面中央 (960,540) を軸に 1.0 → 1.085 倍。
  // 判子が当たる f31 だけ 1コマ縮めて手ぶれにする (端が切れない範囲)
  const kick = f === 31 ? -0.004 : f === 32 ? 0.002 : 0;
  const zoom = 1 + easeInOut(seg(f, 2, 40)) * 0.085 + kick;
  return (
    <Frame f={f} seed={1002}>
     <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
      {/* 作業机 (やや俯瞰) と木目 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.deskWood} />
      <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.45}>
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -20 ${110 + i * 190} q 500 ${rnd(20, i) * 30 - 15} 1000 0 q 480 ${rnd(21, i) * 30 - 15} 960 0`} fill="none" />
        ))}
      </g>
      {/* 下に敷いた書類の山 (すこしずつズレて重なる) */}
      {([[-8, 0], [6, 10], [-3, 20]] as const).map(([r, d], i) => (
        <rect key={i} x={560 + d} y={330 + d} width={800} height={460} rx={8}
          fill={i === 2 ? KRP.white : "#EDE4CE"} stroke={KRP.ink} strokeWidth={6}
          transform={`rotate(${r / 4} 960 560)`} />
      ))}
      <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.4}>
        {Array.from({ length: 3 }, (_, i) => (
          <line key={i} x1={640} y1={690 + i * 26} x2={1280} y2={690 + i * 26} />
        ))}
      </g>
      {/* めくれる札 */}
      <g transform={`translate(960 500) scale(${Math.max(sx, 0.02)} 1)`}>
        <rect x={-260} y={-140} width={520} height={280} rx={14}
          fill={face2 ? KRP.white : "#E3DAC4"} stroke={KRP.ink} strokeWidth={9} />
        <rect x={-242} y={-122} width={484} height={244} rx={9}
          fill="none" stroke={face2 ? KRP.red : KRP.grayDark} strokeWidth={4} opacity={0.5} />
        <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={130} fill={face2 ? KRP.red : KRP.grayDark}>
          {face2 ? "本気" : "冗談"}
        </text>
      </g>
      {/* 朱印 (判子が当たったあとに札の右下へ) */}
      {hit > 0 && (
        <g transform={`translate(1185 640) rotate(-11) scale(${0.6 + 0.4 * pop(hit)})`} opacity={0.92}>
          <circle r={64} fill="none" stroke={SGP.shuin} strokeWidth={11} />
          <circle r={44} fill={SGP.shuin} opacity={0.82} />
          <circle r={64} fill="none" stroke={SGP.shuin} strokeWidth={4} opacity={0.5}
            strokeDasharray="10 7" />
        </g>
      )}
      {/* 判子 (上から落ちてくる → めり込んで止まる) */}
      <g transform={`translate(1185 ${lerp(140, 578, drop) + Math.sin(hit * Math.PI) * -14})`}>
        <rect x={-34} y={-150} width={68} height={120} rx={12} fill="#B98A50" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-46} y={-40} width={92} height={46} rx={10} fill="#8A6436" stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={8} rx={46} ry={10} fill={SGP.shuin} opacity={0.85} />
      </g>
      {/* 衝撃線 */}
      {hit > 0 && hit < 1 && (
        <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={(1 - hit) * 0.9}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + 0.4;
            const r1 = 80 + hit * 44;
            return <line key={i} x1={1185 + Math.cos(a) * r1} y1={600 + Math.sin(a) * r1 * 0.5}
              x2={1185 + Math.cos(a) * (r1 + 34)} y2={600 + Math.sin(a) * (r1 + 34) * 0.5} />;
          })}
        </g>
      )}
      {/* 朱肉 (左) フタが脇に */}
      <g>
        <ellipse cx={330} cy={760} rx={130} ry={44} fill="#A33B30" stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={330} cy={736} rx={130} ry={44} fill="#C14A3C" stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={330} cy={736} rx={96} ry={30} fill={SGP.shuin} />
        <g transform={`rotate(${-16 + Math.sin(f / 13) * 2} 180 930)`}>
          <ellipse cx={180} cy={930} rx={120} ry={40} fill="#8E3328" stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={180} cy={918} rx={120} ry={40} fill="#A33B30" stroke={KRP.ink} strokeWidth={7} />
        </g>
      </g>
      {/* 湯のみ (右上) と万年筆 */}
      <g>
        <circle cx={1700} cy={230} r={74} fill="#EAE2CE" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1700} cy={230} r={48} fill="#7A9A62" stroke={KRP.ink} strokeWidth={5} />
        <Steam x={1700} y={180} f={f} op={0.45} />
      </g>
      <g transform="rotate(32 420 190)">
        <rect x={300} y={176} width={250} height={26} rx={13} fill="#2E3850" stroke={KRP.ink} strokeWidth={5} />
        <polygon points="550,176 596,189 550,202" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* クリップの散らばり */}
      {Array.from({ length: 4 }, (_, i) => (
        <ellipse key={i} cx={520 + rnd(22, i) * 160} cy={200 + rnd(23, i) * 120}
          rx={22} ry={10} fill="none" stroke={KRP.silver} strokeWidth={5}
          transform={`rotate(${rnd(24, i) * 90} ${520 + rnd(22, i) * 160} ${200 + rnd(23, i) * 120})`} />
      ))}
     </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #4 歴史をたどると、そちらのほうが、よほど由緒正しい観かたなのです。
// 格: 並 / seed 1003
// 絵: 床の間の掛け軸に「観かたの系図」。人の顔ではなく【観る場所・観る道具】の系図。
//     上が古い (寄席・芝居小屋・オペラハウス) → 映画館 → テレビ → ビデオ → 配信・スマホ。
//     いちばん古い段をいちばん大きく立派に描き、新しい段へ向かって小さくなっていく。
//     最後にスマホから最上段へ戻る細い朱の矢印が1本 (倍速・スキップは先祖返り)
// どこ: 床の間。畳・花入れ・香炉のある和室の一角
// 演出: 掛け軸が f4-34 でするすると下へ開き、開いた分だけ系図が古い順に描かれていく
// 動き: 巻物の開き・節が順に生える・墨の筋が伸びる・提灯と旗のゆれ・香の煙・花のゆれ・先祖返りの矢印
const Sg004: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 4, 34));
  const schH = 150 + 534 * open;   // 掛け軸の見えている高さ (最大684 → 下端790)
  const topY = 96;
  return (
    <Frame f={f} seed={1003}>
      {/* 床の間: 壁・柱・畳 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.alcove} />
      <rect x={240} y={60} width={1440} height={820} fill="#F1E9D4" stroke={KRP.ink} strokeWidth={9} />
      <rect x={240} y={60} width={1440} height={64} fill="#9A7A52" stroke={KRP.ink} strokeWidth={7} />
      <rect x={170} y={-20} width={70} height={1000} fill="#8A6B42" stroke={KRP.ink} strokeWidth={7} />
      <rect x={1680} y={-20} width={70} height={1000} fill="#8A6B42" stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        <line x1={190} y1={120} x2={190} y2={960} />
        <line x1={222} y1={90} x2={222} y2={960} />
        <line x1={1700} y1={120} x2={1700} y2={960} />
        <line x1={1732} y1={90} x2={1732} y2={960} />
      </g>
      {/* 畳 */}
      <rect x={-20} y={880} width={W + 40} height={220} fill={C.tatami} stroke={KRP.ink} strokeWidth={7} />
      <g stroke="#8E9A68" strokeWidth={3.5} opacity={0.7}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={-20} y1={902 + i * 20} x2={W + 20} y2={902 + i * 20} />
        ))}
      </g>
      <line x1={620} y1={880} x2={520} y2={1100} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      <line x1={1300} y1={880} x2={1400} y2={1100} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      {/* 香炉 (左) と煙 */}
      <g>
        <ellipse cx={420} cy={866} rx={74} ry={22} fill="#6A6F58" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 356 866 q 0 -64 64 -64 q 64 0 64 64 z" fill="#7A8064" stroke={KRP.ink} strokeWidth={6} />
        <Steam x={420} y={796} f={f} s={1.1} op={0.4} />
        <Steam x={436} y={792} f={f + 9} s={0.8} op={0.3} />
      </g>
      {/* 花入れ (右) 枝がゆれる。※掛け軸を横に広げたので枝が隠れないよう 30px 右へ寄せた */}
      <g>
        <path d="M 1530 868 l 16 -130 l 86 0 l 16 130 z" fill="#5C6A88" stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${Math.sin(f / 15) * 2} 1590 740)`}>
          <path d="M 1590 744 q -30 -90 -82 -126" fill="none" stroke="#6E5A3A" strokeWidth={7} />
          <path d="M 1590 744 q 20 -110 64 -150" fill="none" stroke="#6E5A3A" strokeWidth={7} />
          <circle cx={1512} cy={622} r={17} fill="#D88A96" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1652} cy={598} r={14} fill="#D88A96" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1568} cy={650} r={11} fill="#E8B0B8" stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* ===== 掛け軸 (横に広い横物。中に「観かたの系図」) ===== */}
      <g>
        {/* 吊り紐と上軸 */}
        <line x1={930} y1={56} x2={930} y2={topY} stroke={KRP.ink} strokeWidth={5} />
        <rect x={366} y={topY - 14} width={1128} height={30} rx={14} fill="#4A3A28" stroke={KRP.ink} strokeWidth={6} />
        {/* 本紙 (開いた分だけ) */}
        <defs>
          <clipPath id="sg4scroll"><rect x={410} y={topY + 10} width={1040} height={schH} /></clipPath>
        </defs>
        <rect x={410} y={topY + 10} width={1040} height={schH} fill={SGP.paper} stroke={KRP.ink} strokeWidth={8} />
        <g clipPath="url(#sg4scroll)">
          {/* 和紙の地: 簾目と古いしみ (素のベタ地にしない) */}
          <g stroke="#D8C9A4" strokeWidth={3} opacity={0.75}>
            {Array.from({ length: 26 }, (_, i) => (
              <line key={i} x1={410} y1={118 + i * 26} x2={1450} y2={118 + i * 26} />
            ))}
          </g>
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={450 + rnd(40, i) * 960} cy={140 + rnd(41, i) * 620}
              rx={26 + rnd(42, i) * 54} ry={16 + rnd(43, i) * 30}
              fill="#CDB98F" opacity={0.2} />
          ))}
          {/* 一文字 (天の帯) と左右の風帯 */}
          <rect x={410} y={topY + 10} width={1040} height={34} fill="#B9A478" opacity={0.6} />
          <line x1={410} y1={topY + 44} x2={1450} y2={topY + 44} stroke="#8A7452" strokeWidth={4} opacity={0.7} />
          <rect x={410} y={topY + 10} width={30} height={schH} fill="#B9A478" opacity={0.45} />
          <rect x={1420} y={topY + 10} width={30} height={schH} fill="#B9A478" opacity={0.45} />

          {/* ===== 一段目 (いちばん古い = いちばん立派) ===== */}
          {/* 寄席: 提灯のさがった木戸 */}
          <KeizuNode x={600} y={312} t={seg(f, 8, 17)}>
            {/* 屋根 */}
            <polygon points="-128,-138 128,-138 104,-162 -104,-162" fill="#6A6F7A" stroke={KRP.ink} strokeWidth={6} />
            {/* 冠木 */}
            <rect x={-116} y={-138} width={232} height={30} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
            {/* 柱 */}
            <rect x={-104} y={-108} width={28} height={108} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
            <rect x={76} y={-108} width={28} height={108} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
            {/* 木戸 (格子) */}
            <rect x={-76} y={-108} width={152} height={108} fill="#4A3F32" stroke={KRP.ink} strokeWidth={5} />
            <g stroke="#7A6A50" strokeWidth={4} opacity={0.8}>
              {Array.from({ length: 5 }, (_, i) => (
                <line key={i} x1={-62 + i * 31} y1={-104} x2={-62 + i * 31} y2={-4} />
              ))}
              <line x1={-76} y1={-58} x2={76} y2={-58} />
            </g>
            {/* 暖簾 */}
            <path d="M -78 -108 l 156 0 l 0 34 q -39 12 -78 0 q -39 -12 -78 0 z"
              fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
            {/* 提灯2つ (ゆれる) */}
            {([-48, 48] as const).map((lx, i) => (
              <g key={i} transform={`rotate(${Math.sin(f / 12 + i * 2) * 4} ${lx} -108)`}>
                <line x1={lx} y1={-108} x2={lx} y2={-92} stroke={KRP.ink} strokeWidth={4} />
                <ellipse cx={lx} cy={-68} rx={19} ry={25} fill="#C14A3C" stroke={KRP.ink} strokeWidth={5} />
                <ellipse cx={lx} cy={-68} rx={11} ry={16} fill={C.glowWarm}
                  opacity={0.55 + 0.2 * Math.sin(f / 6 + i * 3)} />
                <rect x={lx - 9} y={-96} width={18} height={7} rx={3} fill={KRP.ink} />
                <rect x={lx - 9} y={-50} width={18} height={7} rx={3} fill={KRP.ink} />
              </g>
            ))}
            {/* 柱の小看板 */}
            <rect x={-150} y={-96} width={36} height={76} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.55}>
              <line x1={-132} y1={-84} x2={-132} y2={-32} />
            </g>
          </KeizuNode>
          <KeizuLabel x={600} y={348} text="寄席" size={32} t={seg(f, 12, 19)} />

          {/* 芝居小屋: 櫓と定式幕 (いちばん立派) */}
          <KeizuNode x={930} y={312} t={seg(f, 6, 16)}>
            {/* 櫓 (屋根の上の太鼓やぐら) */}
            <polygon points="-42,-158 42,-158 28,-170 -28,-170" fill="#6A6F7A" stroke={KRP.ink} strokeWidth={5} />
            <rect x={-30} y={-158} width={60} height={32} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <g stroke="#E8DCC0" strokeWidth={3.5} opacity={0.8}>
              <line x1={-30} y1={-150} x2={30} y2={-150} />
              <line x1={-30} y1={-134} x2={30} y2={-134} />
            </g>
            <circle cx={0} cy={-142} r={11} fill={C.glowWarm} stroke={KRP.ink} strokeWidth={4} />
            {/* 大屋根 */}
            <polygon points="-158,-100 158,-100 126,-128 -126,-128" fill="#6A6F7A" stroke={KRP.ink} strokeWidth={7} />
            <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5}>
              {Array.from({ length: 6 }, (_, i) => (
                <line key={i} x1={-112 + i * 45} y1={-124} x2={-124 + i * 48} y2={-104} />
              ))}
            </g>
            {/* 正面 */}
            <rect x={-142} y={-100} width={284} height={100} fill="#D8C9A4" stroke={KRP.ink} strokeWidth={7} />
            {/* 定式幕 (黒・萌葱・柿の三色) */}
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={-136 + i * 30} y={-94} width={30} height={44}
                fill={["#2E3440", "#3F6B4A", "#C2672E"][i % 3]} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
            {/* 入口と暖簾 */}
            <rect x={-42} y={-50} width={84} height={50} fill="#3A3226" stroke={KRP.ink} strokeWidth={6} />
            <path d="M -44 -50 l 88 0 l 0 20 q -22 9 -44 0 q -22 -9 -44 0 z"
              fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
            {/* 軒の提灯の列 */}
            {Array.from({ length: 4 }, (_, i) => {
              const lx = -108 + i * 72;
              return (
                <g key={i} transform={`rotate(${Math.sin(f / 11 + i) * 3} ${lx} -50)`}>
                  <ellipse cx={lx} cy={-34} rx={13} ry={16} fill="#C14A3C" stroke={KRP.ink} strokeWidth={4} />
                  <ellipse cx={lx} cy={-34} rx={7} ry={10} fill={C.glowWarm}
                    opacity={0.5 + 0.25 * Math.sin(f / 5 + i * 2)} />
                </g>
              );
            })}
            {/* 幟 (のぼり) 2本 */}
            {([-176, 176] as const).map((px, i) => (
              <g key={i}>
                <line x1={px} y1={0} x2={px} y2={-146} stroke="#6E5A3A" strokeWidth={7} />
                <path d={`M ${px} -142 q ${(i ? -1 : 1) * (26 + Math.sin(f / 9 + i) * 6)} 30
                  ${(i ? -1 : 1) * 4} 70 l ${(i ? 1 : -1) * 4} 0 z`}
                  fill={i ? "#C2672E" : "#3F6B4A"} stroke={KRP.ink} strokeWidth={5} />
              </g>
            ))}
          </KeizuNode>
          <KeizuLabel x={930} y={348} text="芝居小屋" size={32} t={seg(f, 11, 18)} />

          {/* オペラハウス: 柱廊と赤い緞帳 */}
          <KeizuNode x={1280} y={312} t={seg(f, 10, 19)}>
            {/* 階段 */}
            {Array.from({ length: 3 }, (_, i) => (
              <rect key={i} x={-118 + i * 10} y={-6 - i * 8} width={236 - i * 20} height={10}
                fill="#D4CAB4" stroke={KRP.ink} strokeWidth={4} />
            ))}
            {/* 奥の暗がりと緞帳 */}
            <rect x={-94} y={-112} width={188} height={82} fill="#2E2A30" stroke={KRP.ink} strokeWidth={5} />
            <path d="M -88 -112 q 44 56 0 78 l 0 -78 z M 88 -112 q -44 56 0 78 l 0 -78 z"
              fill={SGP.curtain} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M -88 -112 q 88 ${26 + Math.sin(f / 13) * 3} 176 0 l 0 -8 l -176 0 z`}
              fill={SGP.curtain} stroke={KRP.ink} strokeWidth={4} />
            {/* 円柱4本 */}
            {([-78, -26, 26, 78] as const).map((px, i) => (
              <g key={i}>
                <rect x={px - 13} y={-112} width={26} height={82} fill="#EDE4CE" stroke={KRP.ink} strokeWidth={5} />
                <rect x={px - 17} y={-118} width={34} height={10} fill="#E0D4B8" stroke={KRP.ink} strokeWidth={4} />
                <line x1={px} y1={-106} x2={px} y2={-36} stroke={KRP.grayDark} strokeWidth={3} opacity={0.4} />
              </g>
            ))}
            {/* 軒と破風 */}
            <rect x={-108} y={-132} width={216} height={20} fill="#E0D4B8" stroke={KRP.ink} strokeWidth={6} />
            <polygon points="-114,-132 114,-132 0,-166" fill="#EDE4CE" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-142} r={12} fill={C.glowWarm} stroke={KRP.ink} strokeWidth={4} />
            {/* ガス灯 */}
            {([-134, 134] as const).map((px, i) => (
              <g key={i}>
                <line x1={px} y1={0} x2={px} y2={-66} stroke="#4A4A50" strokeWidth={6} />
                <circle cx={px} cy={-76} r={12} fill={C.glowWarm} stroke={KRP.ink} strokeWidth={4}
                  opacity={0.7 + 0.25 * Math.sin(f / 7 + i * 2)} />
              </g>
            ))}
          </KeizuNode>
          <KeizuLabel x={1280} y={348} text="オペラハウス" size={32} t={seg(f, 14, 21)} />

          {/* ===== 一段目から二段目へ (墨の筋) ===== */}
          <SumiV x={600} y0={360} y1={382} t={seg(f, 16, 21)} w={7} />
          <SumiV x={930} y0={360} y1={382} t={seg(f, 16, 21)} w={7} />
          <SumiV x={1280} y0={360} y1={382} t={seg(f, 16, 21)} w={7} />
          <SumiH x0={600} x1={1280} y={382} t={seg(f, 18, 24)} w={8} />
          <SumiV x={930} y0={382} y1={400} t={seg(f, 21, 25)} w={8} />

          {/* ===== 二段目 活動写真・映画館: 映写機と銀幕 ===== */}
          <KeizuNode x={930} y={500} t={seg(f, 20, 28)}>
            {/* 銀幕 */}
            <rect x={-158} y={-98} width={150} height={92} fill="#F6F1E2" stroke={KRP.ink} strokeWidth={6} />
            <rect x={-168} y={-104} width={170} height={104} fill="none" stroke="#4A3A28" strokeWidth={7} />
            <path d="M -150 -18 l 34 -34 l 26 22 l 30 -30 l 34 42 z" fill="#C8D6DC" opacity={0.8} />
            {/* 光の筋 (映写機 → 銀幕) */}
            <polygon points="60,-54 -6,-98 -6,-6 60,-40" fill={C.glowWarm}
              opacity={0.3 + 0.08 * Math.sin(f / 4)} stroke="none" />
            {/* 光の中の塵 */}
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={-2 + rnd(44, i) * 56} cy={-80 + rnd(45, i) * 60 + Math.sin(f / 9 + i) * 5}
                r={2.2} fill={KRP.white} opacity={0.6} />
            ))}
            {/* 映写機 */}
            <rect x={56} y={-62} width={92} height={46} rx={6} fill="#5A5F66" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={78} cy={-84} r={24} fill="#6E747C" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={78} cy={-84} r={7} fill={KRP.ink} />
            <circle cx={130} cy={-80} r={18} fill="#6E747C" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={130} cy={-80} r={6} fill={KRP.ink} />
            <g transform={`rotate(${f * 4} 78 -84)`} stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
              <line x1={78} y1={-102} x2={78} y2={-66} />
              <line x1={60} y1={-84} x2={96} y2={-84} />
            </g>
            <rect x={44} y={-54} width={16} height={22} rx={4} fill="#3E444C" stroke={KRP.ink} strokeWidth={4} />
            {/* 三脚 */}
            <line x1={102} y1={-16} x2={76} y2={0} stroke={KRP.ink} strokeWidth={7} />
            <line x1={102} y1={-16} x2={128} y2={0} stroke={KRP.ink} strokeWidth={7} />
          </KeizuNode>
          <KeizuLabel x={930} y={534} text="映画館" size={30} t={seg(f, 24, 30)} />

          {/* ===== 二段目から三段目へ ===== */}
          <SumiV x={930} y0={546} y1={558} t={seg(f, 26, 29)} w={7} />
          <SumiH x0={930} x1={670} y={558} t={seg(f, 27, 31)} w={7} />
          <SumiV x={670} y0={558} y1={582} t={seg(f, 29, 32)} w={7} />

          {/* ===== 三段目 テレビ (放送): ブラウン管 ===== */}
          <KeizuNode x={670} y={644} t={seg(f, 28, 35)}>
            {/* アンテナ */}
            <line x1={-6} y1={-62} x2={-30} y2={-86} stroke={KRP.ink} strokeWidth={5} />
            <line x1={6} y1={-62} x2={28} y2={-88} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-30} cy={-86} r={5} fill={KRP.ink} />
            <circle cx={28} cy={-88} r={5} fill={KRP.ink} />
            {/* 箱 */}
            <rect x={-62} y={-62} width={124} height={54} rx={7} fill="#A8764A" stroke={KRP.ink} strokeWidth={6} />
            {/* 画面 (ブラウン管) */}
            <rect x={-52} y={-54} width={72} height={38} rx={12} fill="#C8D6DC" stroke={KRP.ink} strokeWidth={5} />
            <g stroke={KRP.white} strokeWidth={2.5} opacity={0.5 + 0.3 * Math.sin(f / 3)}>
              {Array.from({ length: 4 }, (_, i) => (
                <line key={i} x1={-48} y1={-48 + i * 9} x2={16} y2={-48 + i * 9} />
              ))}
            </g>
            <rect x={-52} y={-54 + ((f * 1.6) % 38)} width={72} height={4} fill={KRP.white} opacity={0.5} />
            {/* つまみ */}
            <circle cx={38} cy={-46} r={8} fill="#E0D4B8" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={38} cy={-26} r={8} fill="#E0D4B8" stroke={KRP.ink} strokeWidth={4} />
            {/* 脚 */}
            <line x1={-42} y1={-8} x2={-52} y2={0} stroke={KRP.ink} strokeWidth={7} />
            <line x1={42} y1={-8} x2={52} y2={0} stroke={KRP.ink} strokeWidth={7} />
            {/* 上に載った布と花瓶 (昭和の居間らしさ) */}
            <path d="M -40 -62 q 28 -8 54 0 z" fill="#E8DCC0" stroke={KRP.ink} strokeWidth={4} />
          </KeizuNode>
          <KeizuLabel x={670} y={676} text="テレビ" size={28} t={seg(f, 31, 36)} />

          {/* ===== 三段目から四段目へ ===== */}
          <SumiH x0={736} x1={1000} y={606} t={seg(f, 32, 36)} w={7} />
          <SumiV x={1000} y0={606} y1={636} t={seg(f, 34, 37)} w={7} />

          {/* ===== 四段目 ビデオ (巻き戻せる): カセット ===== */}
          <KeizuNode x={1000} y={690} t={seg(f, 33, 39)}>
            <g transform={`rotate(${-2 + Math.sin(f / 15) * 1}) `}>
              <rect x={-78} y={-56} width={156} height={56} rx={6} fill="#3A3F46" stroke={KRP.ink} strokeWidth={6} />
              {/* ラベル */}
              <rect x={-68} y={-50} width={136} height={20} rx={3} fill="#EFE6CE" stroke={KRP.ink} strokeWidth={4} />
              <g stroke={KRP.grayDark} strokeWidth={3} opacity={0.5}>
                <line x1={-58} y1={-42} x2={38} y2={-42} />
                <line x1={-58} y1={-35} x2={14} y2={-35} />
              </g>
              {/* 窓とリール */}
              <rect x={-54} y={-26} width={108} height={22} rx={4} fill="#9FD8E8" opacity={0.6}
                stroke={KRP.ink} strokeWidth={4} />
              {([-28, 28] as const).map((rx2, i) => (
                <g key={i} transform={`rotate(${-f * 5} ${rx2} -15)`}>
                  <circle cx={rx2} cy={-15} r={9} fill="#2E3440" stroke={KRP.ink} strokeWidth={3.5} />
                  <line x1={rx2 - 9} y1={-15} x2={rx2 + 9} y2={-15} stroke={KRP.white} strokeWidth={2.5} />
                </g>
              ))}
              {/* 巻き戻しの標識 (◀◀) */}
              <g fill={KRP.ink} opacity={0.85}>
                <polygon points="-12,-46 -2,-52 -2,-40" />
                <polygon points="0,-46 10,-52 10,-40" />
              </g>
            </g>
          </KeizuNode>
          <KeizuLabel x={1000} y={722} text="ビデオ" size={26} t={seg(f, 36, 40)} />

          {/* ===== 四段目から五段目へ ===== */}
          <SumiH x0={1086} x1={1310} y={656} t={seg(f, 36, 39)} w={6} />
          <SumiV x={1310} y0={656} y1={674} t={seg(f, 37, 40)} w={6} />

          {/* ===== 五段目 配信・スマホ (倍速とスキップ) ===== */}
          <KeizuNode x={1310} y={742} t={seg(f, 38, 42)}>
            <rect x={-34} y={-70} width={68} height={70} rx={10} fill="#2A3038" stroke={KRP.ink} strokeWidth={6} />
            <rect x={-26} y={-62} width={52} height={54} rx={4} fill={C.phoneGlow}
              opacity={0.75 + 0.2 * Math.sin(f / 4)} />
            {/* 再生の印と倍速の印 */}
            <polygon points="-10,-50 6,-42 -10,-34" fill={KRP.ink} opacity={0.8} />
            <g fill={SGP.shuin}>
              <polygon points="-4,-28 4,-24 -4,-20" />
              <polygon points="4,-28 12,-24 4,-20" />
            </g>
            {/* 進み具合の細い棒 (つまみが先へ跳んでいる) */}
            <line x1={-20} y1={-14} x2={20} y2={-14} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
            <circle cx={10} cy={-14} r={4} fill={SGP.shuin} stroke={KRP.ink} strokeWidth={2.5} />
            {/* 指 */}
            <circle cx={22} cy={-32} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
              opacity={0.5 + 0.4 * Math.sin(f / 6)} />
          </KeizuNode>
          <KeizuLabel x={1310} y={774} text="配信" size={26} t={seg(f, 40, 42)} />

          {/* ===== 先祖返りの矢印 (スマホ → いちばん上へ。薄く1本だけ) ===== */}
          {seg(f, 34, 42) > 0 && (
            <g opacity={0.42}>
              <path d="M 1268 714 C 1040 772, 700 766, 520 690 C 420 620, 440 470, 578 392"
                fill="none" stroke={SGP.shuin} strokeWidth={5} strokeLinecap="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - seg(f, 34, 42)} />
              {seg(f, 39, 42) > 0 && (
                <polygon points="578,392 552,402 568,422" fill={SGP.shuin}
                  opacity={seg(f, 39, 42)} />
              )}
            </g>
          )}
        </g>
        {/* 下軸 (開くにつれ下がる) */}
        <rect x={366} y={topY + 10 + schH - 8} width={1128} height={34} rx={17}
          fill="#4A3A28" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={372} cy={topY + 27 + schH} r={13} fill="#D9B23C" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1488} cy={topY + 27 + schH} r={13} fill="#D9B23C" stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #5 ただし、ひとつだけ予告しておきます。どこへ飛ばしても、その先には、犯人がいます。
// 格: 山 / seed 1004
// 絵: 再生バーの上に等間隔で手配書がぽん、ぽん、と立つ。バーのどこを指しても犯人の顔。不穏なBGM感
// どこ: 夜の芝居小屋の板の間。提灯が2つだけ灯る暗がり
// 演出: つまみが右へ滑るあいだ、6枚の手配書が順にぽんぽんと立つ。つまみの真上へ赤い点線
// 動き: つまみの滑り(f6-40)・手配書の連続出現(f4-36)・提灯のゆれ・スポットの明滅
const Sg005: React.FC<{ f: number }> = ({ f }) => {
  const prog = 0.08 + 0.8 * easeOut(seg(f, 6, 40));
  const barS = 1.12;
  const knobX = 960 + (-700 + 1400 * prog) * barS;
  return (
    <Frame f={f} seed={1004} dark bg="#262D3C">
      {/* 夜の板の間 */}
      <rect x={-20} y={-20} width={W + 40} height={920} fill="#2B3344" />
      <rect x={-20} y={880} width={W + 40} height={220} fill="#3A3426" />
      <line x1={-20} y1={880} x2={W + 20} y2={880} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={lerp(-100, 1500, i / 6)} y1={1100} x2={lerp(500, 1400, i / 6)} y2={880} />
        ))}
      </g>
      {/* 奥の壁の腰板と暗がりのむら */}
      <g opacity={0.5}>
        <rect x={-20} y={700} width={W + 40} height={180} fill="#232A38" />
        <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={80 + i * 180} y1={700} x2={80 + i * 180} y2={880}
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        ))}
      </g>
      {/* 提灯2つ (ゆれる・明滅) */}
      {([[180, "#C14A3C"], [1740, "#C14A3C"]] as const).map(([lx, col], i) => (
        <g key={i} transform={`rotate(${Math.sin(f / 13 + i * 2) * 3} ${lx} 60)`}>
          <line x1={lx} y1={40} x2={lx} y2={120} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={lx} cy={196} rx={62} ry={78} fill={col} stroke={KRP.ink} strokeWidth={6}
            opacity={0.9} />
          <ellipse cx={lx} cy={196} rx={40} ry={56} fill={C.glowWarm}
            opacity={0.5 + 0.2 * Math.sin(f / 5 + i * 3)} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.6} fill="none">
            {Array.from({ length: 4 }, (_, k) => (
              <path key={k} d={`M ${lx - 60} ${160 + k * 26} q 60 10 120 0`} />
            ))}
          </g>
          <rect x={lx - 26} y={110} width={52} height={16} rx={6} fill={KRP.ink} />
          <rect x={lx - 26} y={266} width={52} height={16} rx={6} fill={KRP.ink} />
        </g>
      ))}
      {/* 手配書6枚 (等間隔。順にぽんと立つ) */}
      {([1, 2, 3, 4, 5, 6] as const).map((w, i) => {
        const t = seg(f, 4 + i * 5, 11 + i * 5);
        const px = 335 + i * 250;
        return (
          <g key={w}>
            {/* スポットの淡い光 */}
            <polygon points={`${px - 40},-20 ${px + 40},-20 ${px + 130},470 ${px - 130},470`}
              fill={C.glowWarm} opacity={t * (0.07 + 0.03 * Math.sin(f / 7 + i))} />
            {/* 立てる杭 */}
            <rect x={px - 9} y={560} width={18} height={330} fill="#4A3A28"
              stroke={KRP.ink} strokeWidth={5} opacity={pop(t)} />
            <Tehaisho f={f} who={w} x={px} y={430} s={0.52} t={t} />
          </g>
        );
      })}
      {/* 再生バー (共有装置) とつまみの真上を指す赤点線 */}
      <SaiseiBar f={f} x={960} y={800} s={barS} t={1} progress={prog} />
      <line x1={knobX} y1={742} x2={knobX} y2={600} stroke={KRP.red} strokeWidth={7}
        strokeDasharray="6 16" strokeLinecap="round" opacity={0.9} />
      <polygon points={`${knobX},586 ${knobX - 18},620 ${knobX + 18},620`} fill={KRP.red}
        stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
      {/* 板の間に落ちる手配書の影 */}
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={335 + i * 250} cy={892} rx={96} ry={16}
          fill="#12161F" opacity={0.5 * seg(f, 11 + i * 5, 16 + i * 5)} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #6 いきなりですが、クイズです。
// 格: 図 / seed 1005
// 絵: `QuizQ` (SaigoSharedにある) Q1。掲示板の世界に札が掛かる
// どこ: 道ばたの屋根つき掲示板の前。草むらと小道
// 演出: 掲示板の真ん中に Q がぽん、その下に「第1問」の札がトンと掛かる
// 動き: Qの出現と呼吸・札の出現・すずめの首ふり・草のゆれ
const Sg006: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1005} bg="#EAF0E4">
    {/* 空と地面 */}
    <rect x={-20} y={-20} width={W + 40} height={820} fill="#DCE8E4" />
    <rect x={-20} y={780} width={W + 40} height={320} fill="#C2CA9A" />
    <line x1={-20} y1={780} x2={W + 20} y2={780} stroke={KRP.ink} strokeWidth={7} />
    {/* 小道 */}
    <path d="M 700 1100 q 160 -180 540 -320 l 420 0 q -340 160 -440 320 z"
      fill="#D9C7A4" stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    {/* 遠くの木 */}
    {([[150, 0.9], [1800, 1.1]] as const).map(([tx, s], i) => (
      <g key={i} transform={`translate(${tx} 780) scale(${s})`}>
        <rect x={-16} y={-170} width={32} height={170} fill="#8A6B42" stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${Math.sin(f / 14 + i * 3) * 2} 0 -200)`}>
          <circle cx={-44} cy={-210} r={62} fill="#9AB873" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={46} cy={-230} r={70} fill="#88A862" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-290} r={58} fill="#9AB873" stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
    ))}
    {/* ===== 屋根つき掲示板 ===== */}
    <g>
      {/* 脚 */}
      <rect x={450} y={620} width={40} height={300} fill="#8A6436" stroke={KRP.ink} strokeWidth={6} />
      <rect x={1430} y={620} width={40} height={300} fill="#8A6436" stroke={KRP.ink} strokeWidth={6} />
      {/* 屋根 (瓦) */}
      <polygon points="380,220 1540,220 1480,140 440,140" fill="#6A6F7A" stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.6}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={460 + i * 112} y1={146} x2={448 + i * 112} y2={216} />
        ))}
      </g>
      {/* 板面 */}
      <rect x={430} y={220} width={1060} height={460} fill={SGP.wood} stroke={KRP.ink} strokeWidth={9} />
      <g stroke={SGP.woodDark} strokeWidth={4} opacity={0.7}>
        {Array.from({ length: 4 }, (_, i) => (
          <line key={i} x1={430} y1={312 + i * 92} x2={1490} y2={312 + i * 92} />
        ))}
      </g>
      <rect x={452} y={242} width={1016} height={416} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      {/* 貼られた古い紙たち */}
      {([[560, 330, -5, "#EFE6CE"], [1340, 350, 6, "#E3D4AE"], [620, 560, 4, "#EFE6CE"], [1300, 570, -7, "#E8DCC0"]] as const).map(([px, py, r, col], i) => (
        <g key={i} transform={`rotate(${r} ${px} ${py})`}>
          <rect x={px - 80} y={py - 100} width={160} height={200} fill={col} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={px} cy={py - 88} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.5}>
            {Array.from({ length: 4 }, (_, k) => (
              <line key={k} x1={px - 56} y1={py - 50 + k * 34} x2={px + 56} y2={py - 50 + k * 34} />
            ))}
          </g>
        </g>
      ))}
      {/* Q と「第1問」の札 */}
      <QuizQ f={f} x={960} y={430} s={1.15} t={seg(f, 8, 18)} />
      <g transform={`translate(0 ${(1 - pop(seg(f, 18, 28))) * -40})`}>
        <line x1={960} y1={556} x2={960} y2={596} stroke="#8A7452" strokeWidth={6}
          opacity={seg(f, 18, 28)} />
        <TagPlate x={960} y={640} text="第1問" size={48} t={seg(f, 18, 28)} />
      </g>
      {/* 屋根のすずめ (首をかしげる) */}
      <g transform={`translate(1380 128) rotate(${Math.sin(f / 8) * 8})`}>
        <ellipse cx={0} cy={0} rx={26} ry={19} fill="#A8766A" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={20} cy={-12} r={13} fill="#A8766A" stroke={KRP.ink} strokeWidth={4} />
        <polygon points="31,-12 44,-9 31,-5" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={23} cy={-14} r={2.6} fill={KRP.ink} />
        <path d="M -24 -4 q -16 -10 -24 -2" fill="none" stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
    {/* 見物人 (立ち止まって見上げる) */}
    <ellipse cx={320} cy={970} rx={92} ry={20} fill={KRP.ink} opacity={0.14} />
    <Person x={320} y={960} s={1.25} cloth="#5C6A88" clothDark="#46516B" face="surprised"
      gaze={[0.5, -0.4]} f={f} pose="point" pointDir={1} />
    <PersonMini x={1650} y={990} s={0.9} color="#7A8A5A" f={f} phase={2} face="smile" />
    <PersonMini x={1790} y={1010} s={0.8} color="#A86A4E" f={f} phase={5} face="dot" />
    {/* 手前の草むら */}
    <g stroke="#8EA862" strokeWidth={7} strokeLinecap="round" fill="none">
      {Array.from({ length: 12 }, (_, i) => {
        const gx = 40 + i * 170 + rnd(30, i) * 60;
        return <path key={i} d={`M ${gx} 1060 q ${Math.sin(f / 12 + i) * 8 - 8} -40 ${Math.sin(f / 12 + i) * 10 - 4} -64`} />;
      })}
    </g>
  </Frame>
);

// -------------------------------------------------------------------
// #7 日本人が映画を「必ず最初から」観るようになったのは、いつからでしょうか。
// 格: 並 / seed 1006
// 絵: 映画館の窓口。切符を受け取る手と「最初から?」の吹き出し。壁にカレンダー
// どこ: 映画館の切符売場の前。窓口・料金窓・壁のカレンダー
// 演出: 窓口から切符がすっと差し出され、客の頭上に「最初から？」の吹き出し
// 動き: 切符の受け渡し(f10-26)・吹き出しのぽん(f26-36)・カレンダーの紙のゆれ
const Sg007: React.FC<{ f: number }> = ({ f }) => {
  const pass = easeOut(seg(f, 10, 26));
  const bub = pop(seg(f, 26, 36));
  return (
    <Frame f={f} seed={1006}>
      {/* ロビーの壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={800} fill={C.lobbyWall} />
      <rect x={-20} y={760} width={W + 40} height={340} fill={C.carpet} />
      <line x1={-20} y1={760} x2={W + 20} y2={760} stroke={KRP.ink} strokeWidth={7} />
      <g fill="#8E3832" opacity={0.6}>
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={60 + (i % 8) * 250 + (Math.floor(i / 8) % 2) * 120}
            cy={820 + Math.floor(i / 8) * 100} r={9} />
        ))}
      </g>
      {/* 腰板 */}
      <rect x={-20} y={640} width={W + 40} height={120} fill="#C9B88E" stroke={KRP.ink} strokeWidth={6} />
      {/* ===== 切符売場の窓口 ===== */}
      <g>
        <rect x={250} y={130} width={760} height={630} fill="#8A6436" stroke={KRP.ink} strokeWidth={9} />
        <rect x={300} y={260} width={660} height={360} fill="#EAF0F4" stroke={KRP.ink} strokeWidth={8} />
        {/* ガラスの光 */}
        <g stroke={KRP.white} strokeWidth={14} opacity={0.5}>
          <line x1={380} y1={580} x2={620} y2={300} />
          <line x1={470} y1={590} x2={700} y2={320} />
        </g>
        {/* 発声の丸穴 (係の頭に被らない右上へ) */}
        <circle cx={800} cy={330} r={36} fill="#C9B88E" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={800 + Math.cos((i / 5) * Math.PI * 2) * 16}
            cy={330 + Math.sin((i / 5) * Math.PI * 2) * 16} r={4} fill={KRP.ink} />
        ))}
        {/* カウンター台と受け渡しのくぼみ */}
        <rect x={270} y={600} width={720} height={44} rx={8} fill="#C9B88E" stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={740} cy={622} rx={110} ry={14} fill="#A89468" stroke={KRP.ink} strokeWidth={4} />
        {/* 看板 */}
        <rect x={380} y={150} width={500} height={86} rx={10} fill={KRP.ink} />
        <text x={630} y={212} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={56} fill={KRP.yellow}>切符売場</text>
        {/* 窓口の係 (中にいる) */}
        <Person x={560} y={620} s={1.05} cloth="#46516B" clothDark="#39435A"
          face="smile" gaze={[0.5, 0.2]} f={f} still />
      </g>
      {/* 切符 (窓口から客の手元へ) */}
      <g transform={`translate(${lerp(740, 1180, pass)} ${622 - Math.sin(pass * Math.PI) * 40}) rotate(${lerp(-6, 10, pass)})`}>
        <rect x={-74} y={-32} width={148} height={64} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <line x1={28} y1={-32} x2={28} y2={32} stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="7 7" />
        <circle cx={-18} cy={0} r={15} fill="none" stroke={KRP.red} strokeWidth={4} />
      </g>
      {/* 客 (受け取りながら首をかしげる) */}
      <ellipse cx={1310} cy={1000} rx={110} ry={22} fill={KRP.ink} opacity={0.16} />
      <Person x={1310} y={990} s={1.45} cloth="#A86A4E" clothDark="#8E5440"
        face="worried" gaze={[-0.5, 0]} f={f} pose="point" pointDir={-1}
        lean={-2} />
      {/* 吹き出し「最初から？」 */}
      {bub > 0 && (
        <g transform={`translate(1400 300) scale(${bub})`}>
          <path d="M -250 -90 q -30 -90 70 -96 l 360 0 q 100 6 70 96 q 30 86 -70 92
            l -200 0 l -74 66 l 10 -66 l -96 0 q -100 -6 -70 -92 z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {/* 吹き出しの中身は y=-186〜+2。基準線は中心(-92)+字の高さの半分 ≒ -70 (下へ落とすとしっぽに乗る) */}
          <text x={10} y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={64} fill={KRP.ink}>最初から？</text>
        </g>
      )}
      {/* 壁のカレンダー (めくれ紙がゆれる) */}
      <g transform="translate(1700 320)">
        <rect x={-110} y={-150} width={220} height={300} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-110} y={-150} width={220} height={56} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-150} r={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.55}>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1={-84} y1={-54 + i * 46} x2={84} y2={-54 + i * 46} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1={-56 + i * 38} y1={-70} x2={-56 + i * 38} y2={120} />
          ))}
        </g>
        <circle cx={-37} cy={0} r={20} fill="none" stroke={KRP.red} strokeWidth={5} />
        <path d={`M -110 150 q 60 ${8 + Math.sin(f / 9) * 5} 110 0`} fill="none"
          stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      </g>
      {/* 待つ人の列 (後ろ) */}
      <PersonMini x={1620} y={930} s={0.85} color="#7A8A5A" f={f} phase={3} face="dot" />
      <PersonMini x={1790} y={960} s={0.92} color="#5C6A88" f={f} phase={6} face="dot" />
      {/* 上映ポスターの額 (左端) */}
      <g transform="rotate(-2 120 400)">
        <rect x={40} y={260} width={170} height={270} fill="#39445C" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={125} cy={350} r={40} fill={C.glowWarm} opacity={0.85} />
        <path d="M 52 520 l 70 -110 l 76 110 z" fill="#5C6A88" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #8 答えは、およそ20年前、です。
// 格: 山 / seed 1007
// 絵: 巨大な「約20年前」の札が2000年代の街角 (ガラケー・シネコン看板) に落ちてくる。通行人がのけぞる
// どこ: 2000年代の街角。シネコンの看板とガラケーの広告塔がある交差点
// 演出: 空から巨大な札がドスンと落ち、土煙。左右の通行人がのけぞる
// 動き: 札の落下(f8-22)・着地の衝撃と土煙(f22-34)・のけぞり・鳩が飛び立つ
const Sg008: React.FC<{ f: number }> = ({ f }) => {
  const drop = pop(seg(f, 8, 22));
  const hit = seg(f, 22, 34);
  const recoil = easeOut(seg(f, 22, 32));
  const py = lerp(-360, 665, clamp01(drop));   // 着地は道路の上 (下端≈823)
  return (
    <Frame f={f} seed={1007} bg="#E4EAF0">
      {/* 空とビル街 */}
      <rect x={-20} y={-20} width={W + 40} height={840} fill="#DCE6EE" />
      {/* 奥のビル群 */}
      {Array.from({ length: 7 }, (_, i) => {
        const bx = -60 + i * 300;
        const bh = 300 + rnd(40, i) * 320;
        return (
          <g key={i} opacity={0.75}>
            <rect x={bx} y={800 - bh} width={240} height={bh} fill="#B8C4CE"
              stroke={KRP.ink} strokeWidth={5} />
            <g fill="#8E9DAB" opacity={0.8}>
              {Array.from({ length: 6 }, (_, k) => (
                <rect key={k} x={bx + 24 + (k % 2) * 110} y={820 - bh + 30 + Math.floor(k / 2) * 90}
                  width={70} height={56} />
              ))}
            </g>
          </g>
        );
      })}
      {/* 左: シネコンの看板ビル */}
      <g>
        <rect x={30} y={180} width={430} height={620} fill="#9AA8B8" stroke={KRP.ink} strokeWidth={8} />
        <rect x={60} y={220} width={370} height={130} rx={12} fill={KRP.ink} />
        <text x={245} y={310} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={72} fill={KRP.yellow} letterSpacing={6}>CINEMA</text>
        {/* 電飾 (順に点滅) */}
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={78 + i * 37} cy={372} r={8}
            fill={(f + i * 4) % 40 < 20 ? KRP.yellow : "#6A6F7A"}
            stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 上映ポスターの窓 */}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={76 + (i % 2) * 180} y={420 + Math.floor(i / 2) * 180}
            width={150} height={150} fill={i % 2 ? "#5C6A88" : "#8E5F52"}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* 右: ガラケーの広告塔 */}
      <g>
        <rect x={1500} y={160} width={390} height={640} fill="#C4CED8" stroke={KRP.ink} strokeWidth={8} />
        <rect x={1530} y={200} width={330} height={480} rx={14} fill="#EFE6CE" stroke={KRP.ink} strokeWidth={6} />
        {/* 折りたたみ携帯 (開いた姿) */}
        <g transform={`translate(1695 440) rotate(${-8 + Math.sin(f / 16) * 1.5})`}>
          <rect x={-70} y={-180} width={140} height={170} rx={20} fill="#5C6A88" stroke={KRP.ink} strokeWidth={7} />
          <rect x={-52} y={-160} width={104} height={110} rx={8} fill="#9FD8E8" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-70} y={0} width={140} height={170} rx={20} fill="#46516B" stroke={KRP.ink} strokeWidth={7} />
          <g fill={KRP.white} opacity={0.9}>
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={-48 + (i % 3) * 36} y={22 + Math.floor(i / 3) * 42}
                width={26} height={26} rx={6} />
            ))}
          </g>
          <circle cx={0} cy={-10} r={13} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <line x1={62} y1={-180} x2={78} y2={-246} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        </g>
        <rect x={1530} y={690} width={330} height={56} rx={8} fill="#46516B" />
      </g>
      {/* 道路と横断歩道 */}
      <rect x={-20} y={800} width={W + 40} height={300} fill="#7E868E" />
      <line x1={-20} y1={800} x2={W + 20} y2={800} stroke={KRP.ink} strokeWidth={7} />
      <g fill={KRP.white} opacity={0.85}>
        {Array.from({ length: 8 }, (_, i) => (
          <polygon key={i}
            points={`${140 + i * 230},1100 ${250 + i * 230},1100 ${212 + i * 230},830 ${128 + i * 230},830`} />
        ))}
      </g>
      {/* 鳩 (着地で飛び立つ) */}
      {Array.from({ length: 3 }, (_, i) => {
        const fly = easeOut(seg(f, 22 + i * 2, 38));
        return (
          <g key={i} transform={`translate(${700 + i * 160 - fly * (120 + i * 80)} ${830 - fly * (330 + i * 110)})`}>
            <ellipse cx={0} cy={0} rx={22} ry={14} fill="#AEB6BE" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={18} cy={-10} r={9} fill="#AEB6BE" stroke={KRP.ink} strokeWidth={4} />
            <path d={`M -6 -6 q ${-14} ${-18 - Math.sin(f / 2 + i) * 10} -28 -8`}
              fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      {/* ===== 巨大な「約20年前」の札が落ちてくる ===== */}
      <g transform={`translate(960 ${py + Math.sin(clamp01(hit) * Math.PI) * -22}) rotate(${lerp(-7, -1, drop)})`}>
        <rect x={-430} y={-150} width={860} height={300} rx={20}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={13} />
        <rect x={-408} y={-128} width={816} height={256} rx={14}
          fill="none" stroke={KRP.red} strokeWidth={5} opacity={0.55} />
        <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={150} fill={KRP.ink}>約20年前</text>
      </g>
      {/* 着地で道路に残るひび割れ (残留する) */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" fill="none"
        opacity={0.7 * seg(f, 24, 36)}>
        <path d="M 520 818 l -84 6 l -70 14" />
        <path d="M 508 822 l -60 -14" />
        <path d="M 1400 818 l 86 6 l 70 14" />
        <path d="M 1414 822 l 62 -14" />
      </g>
      {/* 土煙と衝撃線 */}
      {hit > 0 && hit < 1 && (
        <g opacity={(1 - hit) * 0.9}>
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={960 + (i - 3) * (90 + hit * 60)} cy={800 + hit * 26}
              r={14 + hit * 30 + rnd(41, i) * 12} fill="none"
              stroke={KRP.grayDark} strokeWidth={6} />
          ))}
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round">
            <line x1={420} y1={660} x2={330} y2={620} />
            <line x1={1500} y1={660} x2={1590} y2={620} />
            <line x1={520} y1={740} x2={420} y2={740} />
            <line x1={1400} y1={740} x2={1500} y2={740} />
          </g>
        </g>
      )}
      {/* のけぞる通行人 */}
      <ellipse cx={330} cy={1010} rx={100} ry={20} fill={KRP.ink} opacity={0.18} />
      <Person x={330} y={1000} s={1.3} cloth="#7A8A5A" clothDark="#5E7044" face="surprised"
        gaze={[0.6, -0.5]} f={f} pose="banzai" lean={-16 * recoil} />
      <ellipse cx={1590} cy={1030} rx={100} ry={20} fill={KRP.ink} opacity={0.18} />
      <Person x={1590} y={1020} s={1.3} cloth="#5C6A88" clothDark="#46516B" face="surprised"
        gaze={[-0.6, -0.5]} f={f} pose="raise" lean={15 * recoil} />
      <PersonMini x={120} y={1060} s={0.95} color="#A86A4E" f={f} phase={4} face="dot" arms="up" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #9 2000年代に入るまで、日本の映画館の多くは、入れ替えなしでした。
// 格: 並 / seed 1008
// 絵: 昭和〜90年代の映画館ロビー。「入替なし」の掲示。扉が開けっぱなしで光が漏れる
// どこ: 古い映画館のロビー。赤絨毯・ポスター額・観葉植物・開けっ放しの場内扉
// 演出: 場内への両開き扉が開いたままで、中の明かりがロビーに漏れる。立て看板「入替なし」
// 動き: 漏れる光の明滅・出入りする客・立て看板の出現・シーリングファン
const Sg009: React.FC<{ f: number }> = ({ f }) => {
  const walkIn = easeOut(seg(f, 4, 38));
  const beam = 0.8 + 0.2 * Math.sin(f / 6);
  return (
    <Frame f={f} seed={1008}>
      {/* 壁・天井・床 */}
      <rect x={-20} y={-20} width={W + 40} height={780} fill={C.lobbyWall} />
      <rect x={-20} y={-20} width={W + 40} height={160} fill="#D8CCAE" />
      <line x1={-20} y1={140} x2={W + 20} y2={140} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={740} width={W + 40} height={360} fill={C.carpet} />
      <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={KRP.ink} strokeWidth={7} />
      <g fill="#8E3832" opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <circle key={i} cx={40 + (i % 7) * 290 + (Math.floor(i / 7) % 2) * 140}
            cy={800 + Math.floor(i / 7) * 110} r={10} />
        ))}
      </g>
      {/* シーリングファン (回る) */}
      <g transform="translate(1320 90)">
        <line x1={0} y1={-70} x2={0} y2={0} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`scale(${Math.sin(f / 4)} 1)`}>
          <ellipse cx={-70} cy={8} rx={66} ry={13} fill="#8A6B42" stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={70} cy={8} rx={66} ry={13} fill="#8A6B42" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={0} cy={6} r={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 壁のポスター額 (2枚) */}
      {([[180, "#8E5F52"], [1710, "#39445C"]] as const).map(([px, col], i) => (
        <g key={i} transform={`rotate(${i ? 2 : -2} ${px} 400)`}>
          <rect x={px - 110} y={230} width={220} height={340} fill={col} stroke={KRP.ink} strokeWidth={8} />
          <rect x={px - 92} y={248} width={184} height={304} fill="none" stroke={KRP.brass} strokeWidth={6} />
          {i === 0 ? (
            <g>
              <circle cx={px} cy={350} r={46} fill={C.glowWarm} opacity={0.9} />
              <path d={`M ${px - 92} 552 l 80 -130 l 86 130 z`} fill="#B98A50" opacity={0.9} />
            </g>
          ) : (
            <g>
              <circle cx={px - 30} cy={330} r={34} fill="#9FD8E8" opacity={0.9} />
              <path d={`M ${px - 92} 552 q 90 -180 184 -60 l 0 60 z`} fill="#5C6A88" />
            </g>
          )}
        </g>
      ))}
      {/* 場内への両開き扉 (開けっ放し・光が漏れる) */}
      <g>
        <rect x={700} y={210} width={560} height={530} fill="#46381F" stroke={KRP.ink} strokeWidth={9} />
        <rect x={730} y={240} width={500} height={500} fill="#2A2112" stroke={KRP.ink} strokeWidth={6} />
        {/* 中の暖色の明かり */}
        <rect x={730} y={240} width={500} height={500} fill={C.glowWarm} opacity={0.3 * beam} />
        {/* 奥にスクリーンの端っこがチラ見え */}
        <rect x={840} y={330} width={280} height={170} fill="#EFEADF" opacity={0.85} />
        <rect x={840} y={330} width={280} height={170} fill="#9FD8E8" opacity={0.25 + 0.15 * Math.sin(f / 5)} />
        {/* 開いた扉 (左右に貼り付く) */}
        <g transform="translate(700 210)">
          <polygon points="0,0 -120,40 -120,580 0,530" fill="#6A4E28" stroke={KRP.ink} strokeWidth={7} />
          <circle cx={-96} cy={300} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="translate(1260 210)">
          <polygon points="0,0 120,40 120,580 0,530" fill="#6A4E28" stroke={KRP.ink} strokeWidth={7} />
          <circle cx={96} cy={300} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ロビーに漏れる光のくさび */}
        <polygon points="730,740 1230,740 1560,1100 400,1100"
          fill={C.glowWarm} opacity={0.22 * beam} />
      </g>
      {/* 立て看板「入替なし」 */}
      <g transform={`translate(430 0) scale(${pop(seg(f, 8, 18))})`} opacity={seg(f, 8, 14)}>
        <g transform="translate(0 0)">
          <polygon points="-130,980 -96,600 96,600 130,980" fill="none" stroke={KRP.ink} strokeWidth={9} />
          <rect x={-150} y={530} width={300} height={300} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
          <rect x={-132} y={548} width={264} height={264} rx={6} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.5} />
          <text x={0} y={648} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={KRP.ink}>入替</text>
          <text x={0} y={766} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={KRP.red}>なし</text>
        </g>
      </g>
      {/* 観葉植物 */}
      <g>
        <path d="M 1660 1000 l 24 -140 l 120 0 l 24 140 z" fill="#A33B30" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M 1744 866 q ${-90 + i * 44} ${-60 - i * 14 + Math.sin(f / 14 + i) * 4} ${-60 + i * 30} -170`}
            fill="none" stroke={KRP.green} strokeWidth={15} strokeLinecap="round" />
        ))}
      </g>
      {/* 出入りする客: 入る人 (扉へ歩く)・出てくる人 (もう帰る) */}
      <ellipse cx={lerp(360, 820, walkIn)} cy={960 - walkIn * 120} rx={86} ry={18} fill={KRP.ink} opacity={0.16} />
      <Person x={lerp(360, 820, walkIn)} y={952 - walkIn * 120} s={1.3 - walkIn * 0.35}
        cloth="#5C6A88" clothDark="#46516B" face="smile" gaze={[0.5, 0]} f={f} pose="run" />
      <ellipse cx={1310} cy={1010} rx={96} ry={20} fill={KRP.ink} opacity={0.16} />
      <Person x={1310} y={1000} s={1.35} cloth="#A86A4E" clothDark="#8E5440"
        face="joy" gaze={[-0.3, 0]} f={f} pose="hold" />
      {/* 出てきた人の手元に土産の紙袋 */}
      <g transform="translate(1310 836)">
        <rect x={-40} y={0} width={80} height={86} rx={6} fill="#E8DCC0" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -20 0 q 20 -30 40 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #10 途中から入って、途中まで観て帰る。それがふつうのことでした。
// 格: 並 / seed 1009
// 絵: 上映中の暗い場内へ横からそっと入る客。スクリーンは物語の真ん中。誰も振り向かない
// どこ: 上映中の映画館の場内。満席ぎみの客席と右の非常口
// 演出: 右の扉から光と一緒にそっと入ってくる客。客席は全員スクリーンに夢中
// 動き: 入ってくる客の移動(f4-38)・スクリーンのちらつき・扉の光・観客の呼吸
const Sg010: React.FC<{ f: number }> = ({ f }) => {
  const inT = easeOut(seg(f, 4, 38));
  const flick = 0.8 + 0.2 * Math.sin(f / 4.3);
  const cx = lerp(1840, 1565, inT);
  return (
    <Frame f={f} seed={1009} dark bg={C.hallDark}>
      {/* 場内の壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.hallDark} />
      <rect x={-20} y={780} width={W + 40} height={320} fill="#161C28" />
      {/* ===== スクリーン (物語はもう真ん中) ===== */}
      <g>
        <rect x={100} y={90} width={1180} height={620} fill="#0D1118" stroke={KRP.ink} strokeWidth={9} />
        <rect x={130} y={120} width={1120} height={560} fill="#EFEADF" opacity={0.96} />
        {/* 画面の中: 昼のシーンの途中 (丘と家と人物2人が会話中) */}
        <g opacity={0.92}>
          <rect x={130} y={120} width={1120} height={560} fill="#CFE2E8" />
          <circle cx={1080} cy={240} r={60} fill={KRP.yellow} opacity={0.9} />
          <path d="M 130 560 q 300 -110 560 -60 q 320 60 690 -30 l 0 210 l -1250 0 z" fill="#9AB873" />
          <rect x={360} y={380} width={200} height={140} fill="#C9B88E" stroke={KRP.ink} strokeWidth={5} />
          <polygon points="340,380 460,300 580,380" fill="#8E5F52" stroke={KRP.ink} strokeWidth={5} />
          <PersonMini x={760} y={600} s={0.75} color="#5C6A88" f={f} phase={1} face="dot" />
          <PersonMini x={900} y={610} s={0.75} color="#A86A4E" f={f} phase={3} face="dot" />
          {/* 会話中のしるし */}
          <g opacity={0.85}>
            <ellipse cx={820} cy={430} rx={56} ry={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <polygon points="800,458 788,486 826,462" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 3 }, (_, i) => (
              <circle key={i} cx={796 + i * 24} cy={430} r={5} fill={KRP.ink}
                opacity={(f + i * 7) % 30 < 18 ? 0.9 : 0.2} />
            ))}
          </g>
        </g>
        {/* 映写のちらつき */}
        <rect x={130} y={120} width={1120} height={560} fill={KRP.white} opacity={0.06 * flick} />
        {/* スクリーンの光が客席へ */}
        <polygon points="130,680 1250,680 1500,1100 -60,1100" fill="#DCE8E8" opacity={0.07 * flick} />
      </g>
      {/* 客席 (3列。みな前を向いたまま=後頭部) */}
      {Array.from({ length: 3 }, (_, row) => {
        const ry = 820 + row * 100;
        const rs = 0.78 + row * 0.16;
        return (
          <g key={row}>
            {/* 座席の背もたれ列 (右端 x≈1400 で止めて通路をあける) */}
            {Array.from({ length: 9 }, (_, i) => {
              const sx0 = -40 + i * 230 - row * 60;
              if (sx0 + 210 * rs > 1400) return null;
              return (
                <path key={i} d={`M ${sx0} ${ry + 60} q 0 -56 ${105 * rs} -56 q ${105 * rs} 0 ${105 * rs} 56 z`}
                  fill={C.seatRed} stroke={KRP.ink} strokeWidth={6} opacity={0.96} />
              );
            })}
            {/* 客の後頭部 (シルエット。振り向かない) */}
            {Array.from({ length: 7 }, (_, i) => {
              if (rnd(50 + row, i) < 0.25) return null;
              const px = 80 + i * 235 - row * 40 + rnd(51 + row, i) * 60;
              if (px > 1330) return null;
              return (
                <PersonMini key={i} x={px}
                  y={ry + 18} s={rs * 0.72} color={row === 2 ? "#232838" : "#2C3246"}
                  f={f} phase={row * 7 + i} face="none" />
              );
            })}
          </g>
        );
      })}
      {/* ===== 右の扉からそっと入る (開口は廊下の明かりで光る) ===== */}
      <g>
        {/* 扉枠 */}
        <rect x={1608} y={288} width={324} height={504} fill="#3A2E1C" stroke={KRP.ink} strokeWidth={8} />
        {/* 開口いっぱいに廊下の暖色光 */}
        <rect x={1632} y={312} width={280} height={458} fill={C.glowWarm}
          opacity={0.85 + 0.12 * Math.sin(f / 7)} />
        {/* 廊下の奥行き (壁の線と床) */}
        <g opacity={0.5} stroke="#B98A50" strokeWidth={5} fill="none">
          <line x1={1660} y1={330} x2={1700} y2={400} />
          <line x1={1660} y1={752} x2={1700} y2={700} />
          <line x1={1700} y1={400} x2={1700} y2={700} />
        </g>
        {/* 内側に開いた扉板 (手前へ) */}
        <polygon points="1632,312 1520,352 1520,852 1632,770" fill="#5A4428" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1552} cy={580} r={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 床へ伸びる光のくさび */}
        <polygon points="1632,770 1912,770 1800,1100 1340,1100" fill={C.glowWarm}
          opacity={0.3 + 0.05 * Math.sin(f / 7)} />
        {/* 扉上の壁の緑灯 (壁板に付ける。文字は出さない) */}
        <rect x={1692} y={228} width={156} height={60} rx={8} fill="#1C2430" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1704} y={238} width={132} height={40} rx={6} fill="#7FBF7A"
          opacity={0.85 + 0.15 * Math.sin(f / 9)} />
      </g>
      {/* 入ってくる客 (腰をかがめてつま先歩き) */}
      <ellipse cx={cx} cy={928} rx={84} ry={16} fill="#000" opacity={0.3} />
      <Person x={cx} y={920 + Math.abs(Math.sin(f / 3)) * -5} s={1.18}
        cloth="#6A5A48" clothDark="#52463A" face="worried" gaze={[-0.6, 0.2]}
        f={f} pose="hold" lean={-9} />
      {/* 手に帽子 (そっと感。つば+山で帽子と分かる形に) */}
      <g transform={`translate(${cx - 2} 788) rotate(-10)`}>
        <ellipse cx={0} cy={0} rx={46} ry={13} fill="#2F2A24" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -26 -2 q 0 -26 26 -26 q 26 0 26 26 z" fill="#3A332B" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* そっと足音のしずく印 */}
      <g opacity={(1 - inT) * 0.7}>
        {Array.from({ length: 3 }, (_, i) => (
          <circle key={i} cx={1780 - i * 60} cy={960 + i * 14} r={6 + i * 2}
            fill="none" stroke={KRP.grayDark} strokeWidth={3.5} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #11 一枚の切符で朝から晩まで居座れて、弁当を持ち込む人もいました。
// 格: 山 / seed 1010
// 絵: 座席で弁当を広げる客。ひじ掛けに切符1枚、足元に水筒と新聞。壁の時計が朝→夜へ早回し
// どこ: 場内の座席まわりに寄る。壁の大時計と窓明かりで時間が流れる
// 演出: 時計の針がぐるぐる回り、場内の色が朝の暖色→夜の青へ。客はずっと弁当
// 動き: 針の早回し・光の色変化(f0-42)・湯気・箸の上下・時計まわりの風線
const Sg011: React.FC<{ f: number }> = ({ f }) => {
  const day = seg(f, 0, 42);                 // 0=朝 → 1=夜
  const minAng = f * 34;                     // 分針 (早回し)
  const hrAng = 240 + f * 3.2;               // 時針
  const chop = Math.sin(f / 6) * 10;         // 箸の上下
  return (
    <Frame f={f} seed={1010} dark={day > 0.5} bg="#4A4034">
      {/* 場内の壁 (朝の色→夜の色) */}
      <rect x={-20} y={-20} width={W + 40} height={700} fill="#6A5A48" />
      <rect x={-20} y={-20} width={W + 40} height={700} fill="#2E3440" opacity={day * 0.75} />
      <rect x={-20} y={-20} width={W + 40} height={700} fill={C.glowWarm} opacity={(1 - day) * 0.18} />
      {/* 壁の飾り枠 */}
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.45} fill="none">
        <rect x={60} y={60} width={700} height={560} rx={16} />
        <rect x={1620} y={120} width={240} height={430} rx={12} />
      </g>
      {/* 右の壁ランプ (夜になるほど効いてくる) */}
      <g transform="translate(1740 300)">
        <path d="M -44 40 q 44 -70 88 0 z" fill={C.glowWarm} stroke={KRP.ink} strokeWidth={5}
          opacity={0.9} />
        <circle cx={0} cy={16} r={14} fill={KRP.yellow} opacity={0.4 + day * 0.6} />
        <polygon points="-70,46 114,46 160,330 -116,330" fill={C.glowWarm}
          opacity={0.08 + day * 0.14} />
      </g>
      {/* ===== 壁の大時計 (朝→夜へ早回し) ===== */}
      <g transform="translate(330 280)">
        <circle r={150} fill="#EAE2CE" stroke={KRP.ink} strokeWidth={10} />
        <circle r={126} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 108} y1={Math.sin(a) * 108}
            x2={Math.cos(a) * 126} y2={Math.sin(a) * 126} stroke={KRP.ink} strokeWidth={6} />;
        })}
        <line x1={0} y1={0} x2={Math.cos((hrAng - 90) * Math.PI / 180) * 70}
          y2={Math.sin((hrAng - 90) * Math.PI / 180) * 70} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.cos((minAng - 90) * Math.PI / 180) * 104}
          y2={Math.sin((minAng - 90) * Math.PI / 180) * 104} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
        <circle r={12} fill={KRP.ink} />
        {/* 早回しの風線 */}
        <g stroke={KRP.grayDark} strokeWidth={5} fill="none" opacity={0.7}>
          <path d={`M 170 -90 a 190 190 0 0 1 60 180`} strokeDasharray="20 14"
            strokeDashoffset={-f * 6} />
          <path d={`M -170 -96 a 196 196 0 0 0 -54 180`} strokeDasharray="16 12"
            strokeDashoffset={f * 5} />
        </g>
        {/* 時計の下: 朝日→月の小窓 */}
        <g transform="translate(0 228)">
          <rect x={-96} y={-44} width={192} height={88} rx={12} fill="#2E3440" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={lerp(-52, 52, day)} cy={0} r={26}
            fill={day < 0.5 ? KRP.yellow : "#F3EAC6"} stroke={KRP.ink} strokeWidth={4} />
          {day >= 0.5 && <circle cx={lerp(-52, 52, day) - 12} cy={-8} r={18} fill="#2E3440" />}
        </g>
      </g>
      {/* ===== 座席と客 (弁当を広げて居座る) ===== */}
      {/* 後ろの座席列 (遠く) */}
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M ${560 + i * 260} 700 q 0 -50 95 -50 q 95 0 95 50 z`}
          fill={C.seatRed} stroke={KRP.ink} strokeWidth={6} opacity={0.8} />
      ))}
      {/* 主役の客 (座っている。下半身は座席前板で隠す) */}
      <Person x={960} y={1010} s={1.75} cloth="#7A6A50" clothDark="#5E5240"
        face="joy" gaze={[0, 0.4]} f={f} pose="hold" />
      {/* 弁当 (手元に。ふたは脇に立てかけ) */}
      <g transform={`translate(960 ${788 + Math.sin(f / 10) * 2})`}>
        <rect x={-150} y={-20} width={300} height={96} rx={12} fill="#8E3328" stroke={KRP.ink} strokeWidth={7} />
        <rect x={-134} y={-6} width={268} height={68} rx={6} fill="#EFE6CE" stroke={KRP.ink} strokeWidth={4} />
        <line x1={-40} y1={-6} x2={-40} y2={62} stroke={KRP.ink} strokeWidth={4} />
        <line x1={52} y1={-6} x2={52} y2={62} stroke={KRP.ink} strokeWidth={4} />
        {/* ごはんと梅干し・おかず */}
        <g fill={KRP.white}>
          <ellipse cx={-88} cy={28} rx={40} ry={24} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <circle cx={-88} cy={22} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-24} y={6} width={60} height={20} rx={5} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={-18} y={32} width={52} height={18} rx={9} fill="#C14A3C" stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={92} cy={18} r={14} fill="#7A9A62" stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={94} cy={46} r={12} fill="#D8A82E" stroke={KRP.ink} strokeWidth={3.5} />
        <Steam x={-88} y={0} f={f} s={0.8} op={0.45} />
        <Steam x={60} y={-2} f={f + 7} s={0.7} op={0.35} />
        {/* 箸 (上下する) */}
        <g transform={`translate(150 ${-48 + chop}) rotate(-34)`}>
          <line x1={0} y1={0} x2={120} y2={14} stroke="#8A6B42" strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={12} x2={120} y2={30} stroke="#8A6B42" strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* ふた (右のひじ掛けに立てかける。顔に被せない) */}
        <g transform="translate(228 60) rotate(-78)">
          <rect x={-150} y={-11} width={300} height={22} rx={10} fill="#A33B30" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 座席 (前板・ひじ掛け) */}
      <g>
        <rect x={620} y={880} width={680} height={220} rx={18} fill={C.seatRed} stroke={KRP.ink} strokeWidth={9} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.4} fill="none">
          <path d="M 660 930 q 300 26 600 0" />
          <path d="M 660 1000 q 300 26 600 0" />
        </g>
        {/* ひじ掛け2本 */}
        <rect x={560} y={820} width={110} height={280} rx={22} fill="#6E2F30" stroke={KRP.ink} strokeWidth={8} />
        <rect x={1250} y={820} width={110} height={280} rx={22} fill="#6E2F30" stroke={KRP.ink} strokeWidth={8} />
        {/* ひじ掛けの上の切符1枚 */}
        <g transform={`translate(1305 810) rotate(-9)`}>
          <rect x={-62} y={-26} width={124} height={52} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={22} y1={-26} x2={22} y2={26} stroke={KRP.ink} strokeWidth={3} strokeDasharray="6 6" />
          <circle cx={-16} cy={0} r={12} fill="none" stroke={KRP.red} strokeWidth={3.5} />
        </g>
      </g>
      {/* 足元: 水筒と新聞 (左の通路側に見える) */}
      <g transform="translate(420 1010)">
        <rect x={-40} y={-120} width={80} height={120} rx={14} fill="#46618E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-28} y={-148} width={56} height={30} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -40 -96 q -26 10 -24 44" fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform="translate(240 1050) rotate(-7)">
        <rect x={-110} y={-36} width={220} height={60} rx={5} fill="#E8E2D2" stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.6}>
          <line x1={-88} y1={-16} x2={88} y2={-16} />
          <line x1={-88} y1={0} x2={40} y2={0} />
        </g>
        <rect x={-88} y={-30} width={54} height={10} fill={KRP.ink} opacity={0.7} />
      </g>
      {/* 夜の空気 (全体にかぶせる青) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#232B3A" opacity={day * 0.22} />
    </Frame>
  );
};

// --- #12 用のローカル部品 ---
// 暗い場内の観客の後頭部。真っ黒のシルエットにはせず、スクリーン側からのリムライトで分離する
const Kankyaku: React.FC<{ x: number; y: number; s: number; f: number; i: number; kind?: number }> =
  ({ x, y, s, f, i, kind = 0 }) => {
    const tilt = Math.sin((f + i * 13) / 17) * 1.5;
    return (
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
        {/* 肩 */}
        <path d="M -82 62 q 12 -60 82 -60 q 70 0 82 60 z" fill="#141A24" stroke="#0C1118" strokeWidth={5} />
        {/* 頭 */}
        <circle cx={0} cy={-32} r={46} fill="#161D28" stroke="#0C1118" strokeWidth={5} />
        {/* 髪や帽子のちがい (同じ頭が並ばないように) */}
        {kind === 1 && (
          <path d="M -47 -36 q 47 -58 94 0 q -14 -28 -47 -28 q -33 0 -47 28 z" fill="#101620" />
        )}
        {kind === 2 && (
          <circle cx={0} cy={-82} r={19} fill="#161D28" stroke="#0C1118" strokeWidth={5} />
        )}
        {kind === 3 && (
          <g>
            <path d="M -44 -52 q 44 -40 88 0 z" fill="#101620" stroke="#0C1118" strokeWidth={4} />
            <rect x={-58} y={-56} width={116} height={11} rx={5} fill="#101620" stroke="#0C1118" strokeWidth={4} />
          </g>
        )}
        {/* リムライト (スクリーンの光が頭の縁をなぞる)。
            真っ黒のシルエットに見えないよう、頭頂をぐるりと一周させてから強い筋を重ねる */}
        <path d="M -45 -30 q 4 -48 45 -48 q 41 0 45 48" fill="none" stroke="#8FB4C8"
          strokeWidth={9} strokeLinecap="round" opacity={0.4} />
        <path d="M -42 -46 q 16 -34 42 -32" fill="none" stroke="#DCEBF2" strokeWidth={10}
          strokeLinecap="round" opacity={0.85} />
        <path d="M 14 -74 q 30 12 32 40" fill="none" stroke="#CFE2EC" strokeWidth={7}
          strokeLinecap="round" opacity={0.55} />
        <path d="M -74 48 q 14 -44 62 -48" fill="none" stroke="#9FC2D4" strokeWidth={7}
          strokeLinecap="round" opacity={0.45} />
      </g>
    );
  };

// -------------------------------------------------------------------
// #12 「映画は最初から最後まで観るもの」。この常識、実はかなりの新顔です。
// 格: 図 / seed 1011
// 絵: ★別の絵に差し替え (旧: 商店の棚に並ぶ「常識」の瓶 → 作者却下)。
//     上映中の場内を、後ろの席のあいだから覗いた構図。暗い場内・スクリーンの光・
//     整然と前を向いた頭の列・段々の床・足元灯・非常口の緑。
//     「新顔」は一点だけ: 左の壁に【まだ糊が乾いていない貼りたての掲示】が1枚。
//     濡れた糊が光り、角がめくれ、足元に糊の桶と刷毛が置いてある。文字では説明しない
// どこ: 映画館の場内。後ろの席の背のあいだ (寄り〜中寄り)
// 動き: スクリーンの明滅・光束の塵・頭のわずかな動き・掲示が貼られる(f10-22)・
//       めくれた角のはためき・糊の濡れ光り・糊のしずくが垂れる(f24-42)・足元灯の瞬き
const Sg012: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.84 + 0.16 * Math.sin(f / 2.3) + 0.05 * Math.sin(f / 5.7);
  const post = pop(seg(f, 10, 22));          // 掲示が貼られて落ち着くまで
  const curl = Math.sin(f / 9) * 4;          // めくれた角のはためき
  const wet = 0.4 + 0.32 * Math.sin(f / 7);  // まだ乾いていない糊のつや
  const drip = seg(f, 24, 42);               // 糊のしずくが垂れる
  const rim = "#CFE2EC";
  return (
    <Frame f={f} seed={1011} dark bg={C.hallDark}>
      <defs>
        <linearGradient id="sg12sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF6E4" />
          <stop offset="55%" stopColor="#E9DFC4" />
          <stop offset="100%" stopColor="#BFCBC4" />
        </linearGradient>
        <radialGradient id="sg12glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8F2F6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8F2F6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ===== 場内の箱 ===== */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.hallDark} />
      {/* 天井 */}
      <rect x={-20} y={-20} width={W + 40} height={170} fill="#151B25" />
      <g stroke="#0E131C" strokeWidth={6} opacity={0.9}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={-20} y1={20 + i * 30} x2={W + 20} y2={20 + i * 30} />
        ))}
      </g>
      {/* 天井の小さな下向き灯 */}
      {([420, 1500] as const).map((lx, i) => (
        <g key={i}>
          <path d={`M ${lx - 22} 148 l 44 0 l -10 -26 l -24 0 z`} fill="#2A313C"
            stroke="#0E131C" strokeWidth={4} />
          <ellipse cx={lx} cy={154} rx={18} ry={7} fill={C.glowWarm}
            opacity={0.35 + 0.12 * Math.sin(f / 8 + i * 2)} />
        </g>
      ))}
      {/* 映写機の光束 (カメラの後ろ上から、スクリーンへ向かって広がる) */}
      <polygon points="380,-20 1540,-20 1340,172 580,172" fill={C.glowWarm}
        opacity={0.13 + 0.04 * Math.sin(f / 3.4)} />
      {/* 光束のふち (ここを通っているとわかる筋) */}
      <g stroke={C.glowWarm} strokeWidth={4} opacity={0.22} strokeLinecap="round">
        <line x1={380} y1={-20} x2={580} y2={172} />
        <line x1={1540} y1={-20} x2={1340} y2={172} />
      </g>
      {/* 光束の中の塵 */}
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={440 + rnd(70, i) * 1040 + Math.sin(f / 13 + i) * 12}
          cy={10 + ((rnd(71, i) * 170 + f * (0.3 + rnd(72, i) * 0.5)) % 170)}
          r={1.8 + rnd(73, i) * 2.2} fill={KRP.white} opacity={0.28 + rnd(74, i) * 0.3} />
      ))}

      {/* ===== 左の壁 (吸音パネル・非常口・貼りたての掲示) ===== */}
      <rect x={-20} y={150} width={600} height={500} fill="#1A212B" />
      <g stroke="#111822" strokeWidth={7} opacity={0.9}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={20 + i * 84} y1={150} x2={20 + i * 84} y2={650} />
        ))}
      </g>
      {/* 非常口の戸と緑のサイン */}
      <g>
        <rect x={64} y={300} width={232} height={350} fill="#131A23" stroke="#0C1118" strokeWidth={7} />
        <line x1={180} y1={300} x2={180} y2={650} stroke="#0C1118" strokeWidth={5} />
        <rect x={196} y={452} width={46} height={12} rx={5} fill="#3A4451" />
        {/* 緑の非常口サイン (走る人の印。文字は書かない) */}
        <rect x={132} y={236} width={128} height={56} rx={6} fill="#1F6B48"
          stroke="#0C1118" strokeWidth={5} />
        <rect x={140} y={244} width={112} height={40} rx={4} fill="#2FA86A"
          opacity={0.6 + 0.25 * Math.sin(f / 9)} />
        <g fill="#DFF3E6">
          <circle cx={170} cy={256} r={6} />
          <path d="M 164 264 l 12 0 l 6 14 l -6 0 l -4 -8 l -8 10 l 0 8 l -6 0 l 0 -12 z" />
        </g>
        <path d="M 212 264 l 26 0 l 0 -8 l 14 14 l -14 14 l 0 -8 l -26 0 z" fill="#DFF3E6" opacity={0.9} />
        <ellipse cx={196} cy={312} rx={120} ry={46} fill="#2FA86A" opacity={0.1} />
      </g>
      {/* ★新顔: まだ糊が乾いていない貼りたての掲示 (この絵で一点だけの差し込み) */}
      {post > 0 && (
        <g transform={`translate(420 468) rotate(${-2.4 + (1 - post) * 5}) scale(${post})`}>
          {/* はみ出した糊 (紙よりひとまわり大きい濡れたしみ) */}
          <path d="M -96 -118 q 100 -14 196 2 q 14 110 -4 226 q -98 16 -190 -2 q -16 -112 -2 -226 z"
            fill="#9FB4B8" opacity={0.3} />
          {/* 紙 (まわりの壁より明るい = まっさらに新しい) */}
          <rect x={-86} y={-108} width={172} height={212} fill="#E8E2D2"
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={-74} y={-96} width={148} height={188} fill="none"
            stroke={SGP.shuin} strokeWidth={4} opacity={0.75} />
          {/* ラベル (短く一語だけ。本文は書かない) */}
          <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={30} fill={KRP.ink}>おねがい</text>
          <line x1={-56} y1={-34} x2={56} y2={-34} stroke={SGP.shuin} strokeWidth={3} opacity={0.6} />
          {/* 本文のかわりの墨の罫 */}
          <g stroke={KRP.grayDark} strokeWidth={5} opacity={0.45} strokeLinecap="round">
            <line x1={-58} y1={4} x2={58} y2={4} />
            <line x1={-58} y1={34} x2={58} y2={34} />
            <line x1={-58} y1={64} x2={16} y2={64} />
          </g>
          {/* 貼ったばかりのテープ2片 */}
          {([[-62, -116, -22], [62, -114, 18]] as const).map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 32} y={ty - 11} width={64} height={22} rx={3}
              fill="#D8E2DC" opacity={0.7} stroke={KRP.ink} strokeWidth={3}
              transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {/* 糊が乾いていない濡れ光り */}
          <g stroke={KRP.white} strokeLinecap="round" fill="none">
            <line x1={-66} y1={74} x2={-18} y2={-18} strokeWidth={10} opacity={0.22 + wet * 0.3} />
            <line x1={24} y1={88} x2={66} y2={10} strokeWidth={7} opacity={0.16 + wet * 0.24} />
          </g>
          {/* まだ貼りついていない右下の角 (はためく) */}
          <g transform={`rotate(${-14 + curl} 86 104)`}>
            <path d="M 86 104 l -46 0 l 46 -46 z" fill="#F2EDDF" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 86 104 l -46 0 l 46 -46 z" fill={KRP.white} opacity={0.25 + wet * 0.2} />
          </g>
          {/* 垂れてきた糊のしずく */}
          {drip > 0 && (
            <ellipse cx={-52} cy={110 + drip * 46} rx={7} ry={11 + drip * 5}
              fill="#C3D4D6" opacity={0.75 * (1 - drip * 0.3)} stroke={KRP.ink} strokeWidth={2.5} />
          )}
        </g>
      )}
      {/* 掲示の足元: 糊の桶と刷毛 (貼ったばかりの痕跡) */}
      <g opacity={seg(f, 6, 16)}>
        <path d="M 336 652 l 10 -62 l 96 0 l 10 62 z" fill="#3C4650" stroke="#0C1118" strokeWidth={6} />
        <ellipse cx={394} cy={590} rx={48} ry={13} fill="#A9BCBE" stroke="#0C1118" strokeWidth={5} />
        <ellipse cx={394} cy={590} rx={34} ry={8} fill="#C3D4D6"
          opacity={0.6 + 0.2 * Math.sin(f / 6)} />
        <g transform={`rotate(${-28 + Math.sin(f / 15) * 1.5} 452 600)`}>
          <rect x={448} y={520} width={16} height={84} rx={6} fill="#8A6B42" stroke="#0C1118" strokeWidth={5} />
          <rect x={440} y={596} width={32} height={30} rx={4} fill="#D8CCAE" stroke="#0C1118" strokeWidth={5} />
        </g>
      </g>

      {/* ===== 右の壁 (吸音パネル・壁付けの灯・緞帳の端) ===== */}
      <rect x={1340} y={150} width={600} height={520} fill="#1A212B" />
      <g stroke="#111822" strokeWidth={7} opacity={0.9}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={1380 + i * 84} y1={150} x2={1380 + i * 84} y2={670} />
        ))}
      </g>
      <g>
        <path d="M 1770 420 q 44 -26 88 0 l -14 44 l -60 0 z" fill="#2A313C"
          stroke="#0C1118" strokeWidth={6} />
        <ellipse cx={1814} cy={476} rx={54} ry={40} fill={C.glowWarm}
          opacity={0.14 + 0.05 * Math.sin(f / 7)} />
        <circle cx={1814} cy={462} r={13} fill={C.glowWarm} opacity={0.6 + 0.2 * Math.sin(f / 7)} />
      </g>
      {/* 緞帳の端 (スクリーンの右脇に寄せてある) */}
      <path d="M 1340 150 q 54 200 18 420 l 70 0 q -22 -230 -8 -420 z"
        fill="#6E2A2E" stroke="#0C1118" strokeWidth={7} />
      <g stroke="#45191C" strokeWidth={5} opacity={0.7} fill="none">
        <path d="M 1362 170 q 40 190 14 390" />
        <path d="M 1392 168 q 30 190 12 392" />
      </g>

      {/* ===== スクリーン ===== */}
      <g>
        <ellipse cx={960} cy={340} rx={760} ry={420} fill="url(#sg12glow)" opacity={0.5 * flick} />
        <rect x={556} y={146} width={808} height={370} fill="#0E131C" stroke="#0A0E15" strokeWidth={8} />
        <rect x={580} y={166} width={760} height={330} fill="url(#sg12sky)" opacity={0.82 + 0.16 * flick} />
        {/* 映っている映像 (何の作品とも言えない抽象。遠い地平と小さな人影) */}
        <rect x={580} y={386} width={760} height={110} fill="#8C9A94" opacity={0.75} />
        <path d="M 580 386 q 190 -52 380 -16 q 190 36 380 -10 l 0 26 l -760 0 z"
          fill="#6E7E7A" opacity={0.7} />
        <ellipse cx={1120} cy={286} rx={92} ry={62} fill={KRP.white} opacity={0.5 * flick} />
        <g fill="#4A544F" opacity={0.75}>
          <ellipse cx={790} cy={430} rx={16} ry={30} />
          <circle cx={790} cy={396} r={13} />
        </g>
        {/* 幕の継ぎ目と穴あき地のきめ */}
        <g stroke={KRP.white} strokeWidth={2} opacity={0.14}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={580} y1={186 + i * 29} x2={1340} y2={186 + i * 29} />
          ))}
        </g>
        {/* 幕の枠の内側に落ちる光 */}
        <rect x={580} y={166} width={760} height={330} fill="none" stroke={KRP.white}
          strokeWidth={5} opacity={0.3 * flick} />
      </g>

      {/* ===== 段々になった床と足元灯 ===== */}
      <rect x={-20} y={496} width={W + 40} height={H - 476} fill="#1B222C" />
      {([[540, 560, 0.30], [470, 650, 0.36], [380, 762, 0.42], [250, 900, 0.5]] as const).map(
        ([x0, sy, op], i) => (
          <g key={i}>
            <rect x={x0} y={sy} width={1920 - x0 * 2} height={16} fill="#2A323D" opacity={0.9} />
            <line x1={x0} y1={sy} x2={1920 - x0} y2={sy} stroke={rim} strokeWidth={4} opacity={op * 0.5} />
            {/* 通路の足元灯 */}
            {([x0 + 16, 1920 - x0 - 16] as const).map((lx, k) => (
              <g key={k}>
                <circle cx={lx} cy={sy + 6} r={7} fill={C.glowWarm}
                  opacity={0.55 + 0.25 * Math.sin(f / 6 + i * 2 + k)} />
                <circle cx={lx} cy={sy + 6} r={17} fill={C.glowWarm}
                  opacity={0.12 + 0.05 * Math.sin(f / 6 + i * 2 + k)} />
              </g>
            ))}
          </g>
        ),
      )}

      {/* ===== 客席の列 (奥 → 手前。整然と前を向いている) ===== */}
      {([
        [575, 0.46, 9, 600, 92, 70],
        [668, 0.62, 7, 580, 130, 71],
        [792, 0.84, 5, 610, 180, 72],
      ] as const).map(([ry, rs, n, x0, gap, sd], r) => (
        <g key={r}>
          {/* 椅子の背の帯 (頭より奥) */}
          <rect x={x0 - gap * 0.7} y={ry + 26} width={gap * (n - 1) + gap * 1.4} height={120 * rs + 70}
            rx={18 * rs} fill={C.seatRed} opacity={0.28} />
          <g stroke={rim} strokeWidth={4} opacity={0.22}>
            <line x1={x0 - gap * 0.7} y1={ry + 26} x2={x0 + gap * (n - 1) + gap * 0.7} y2={ry + 26} />
          </g>
          {Array.from({ length: n }, (_, i) => (
            <Kankyaku key={i} x={x0 + i * gap} y={ry} s={rs} f={f} i={i + r * 11}
              kind={Math.floor(rnd(sd, i) * 4)} />
          ))}
        </g>
      ))}

      {/* ===== 手前: 後ろの席の背2つ (このあいだから覗いている) ===== */}
      {/* 左の席 */}
      <g>
        <path d="M -20 1100 L -20 700 q 0 -76 86 -78 l 300 0 q 86 2 86 78 l 0 400 z"
          fill="#141A22" stroke="#0A0E15" strokeWidth={9} />
        <path d="M 60 644 q 190 -22 380 10" fill="none" stroke={rim} strokeWidth={6} opacity={0.42} />
        <g stroke="#1E2630" strokeWidth={5} opacity={0.9}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={20 + i * 76} y1={700} x2={20 + i * 76} y2={1100} />
          ))}
        </g>
        {/* ひじ掛け */}
        <path d="M 440 760 q 54 6 58 58 l 0 282 l -74 0 l 0 -330 z"
          fill="#202832" stroke="#0A0E15" strokeWidth={8} />
        <path d="M 446 768 q 44 10 46 54" fill="none" stroke={rim} strokeWidth={5} opacity={0.35} />
        <ellipse cx={466} cy={884} rx={11} ry={16} fill="#3E4854" stroke="#0A0E15" strokeWidth={4} />
      </g>
      {/* 右の席 */}
      <g>
        <path d="M 1940 1100 L 1940 724 q 0 -76 -86 -78 l -288 0 q -86 2 -86 78 l 0 376 z"
          fill="#141A22" stroke="#0A0E15" strokeWidth={9} />
        <path d="M 1500 668 q 190 -24 376 6" fill="none" stroke={rim} strokeWidth={6} opacity={0.38} />
        <g stroke="#1E2630" strokeWidth={5} opacity={0.9}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={1520 + i * 76} y1={724} x2={1520 + i * 76} y2={1100} />
          ))}
        </g>
        {/* ひじ掛け */}
        <path d="M 1484 782 q -54 6 -58 58 l 0 260 l 74 0 l 0 -310 z"
          fill="#202832" stroke="#0A0E15" strokeWidth={8} />
        <path d="M 1478 790 q -44 10 -46 54" fill="none" stroke={rim} strokeWidth={5} opacity={0.32} />
      </g>
      {/* 四隅を少し落として、のぞき見の感じを出す */}
      <g fill="#0A0E15" opacity={0.45}>
        <path d="M -20 -20 l 300 0 q -200 90 -300 260 z" />
        <path d="M 1940 -20 l -300 0 q 200 90 300 260 z" />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_001: (f) => <Sg001 f={f} />,
  sg_002: (f) => <Sg002 f={f} />,
  sg_003: (f) => <Sg003 f={f} />,
  sg_004: (f) => <Sg004 f={f} />,
  sg_005: (f) => <Sg005 f={f} />,
  sg_006: (f) => <Sg006 f={f} />,
  sg_007: (f) => <Sg007 f={f} />,
  sg_008: (f) => <Sg008 f={f} />,
  sg_009: (f) => <Sg009 f={f} />,
  sg_010: (f) => <Sg010 f={f} />,
  sg_011: (f) => <Sg011 f={f} />,
  sg_012: (f) => <Sg012 f={f} />,
};

export const S_A_MOTIFS: string[] = [
  "sg_001", // #1
  "sg_002", // #2
  "sg_003", // #3
  "sg_004", // #4
  "sg_005", // #5
  "sg_006", // #6
  "sg_007", // #7
  "sg_008", // #8
  "sg_009", // #9
  "sg_010", // #10
  "sg_011", // #11
  "sg_012", // #12
];

export const saigoAScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
