// 「人類は、昔から飛ばして観ていた」: 文#149〜#160 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1235〜1246。
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
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#2B3345",     // 夜空
  nightDeep: "#171E2C", // 夜空の上端
  dusk: "#D99A66",      // 夕暮れの帯
  brick: "#A85A48",     // 劇場のレンガ
  brickDark: "#7D4233",
  navy: "#3A4A6B",      // 警備員の制服・看板の帯
  navyDark: "#28344E",
  beam: "#F6ECC2",      // 映写・スポットの光
  asphalt: "#5A6168",   // NYの車道
  sidewalk: "#9BA1A9",  // NYの歩道
  blotter: "#3F5A4A",   // 机の下敷き
  sea: "#6E9CC3",       // 海 (KRP.blueより暗め)
  wallNight: "#3A302A", // 夜の劇場外壁
};
void useCurrentFrame; void Stamp; void XMark; void Arrow;
void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;

// ローカル小道具 (このファイル専用)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 毎フレーム同じ値を返す擬似乱数 (Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// ぴかぴかの光 (靴・看板のきらめき)
const Spark: React.FC<{ x: number; y: number; f: number; ph?: number; s?: number; color?: string }> =
  ({ x, y, f, ph = 0, s = 1, color = KRP.white }) => {
    const p = (Math.sin(f / 7 + ph) + 1) / 2;
    const r = (5 + p * 7) * s;
    return (
      <g transform={`translate(${x} ${y}) rotate(${f * 2 + ph * 40})`} opacity={0.3 + p * 0.65}>
        <path d={`M 0 ${-r * 2} L ${r * 0.5} ${-r * 0.5} L ${r * 2} 0 L ${r * 0.5} ${r * 0.5} L 0 ${r * 2} L ${-r * 0.5} ${r * 0.5} L ${-r * 2} 0 L ${-r * 0.5} ${-r * 0.5} Z`}
          fill={color} stroke={C.ink} strokeWidth={2} />
      </g>
    );
  };

// マーキーの電球列 (f で順繰りに点滅)
const BulbRow: React.FC<{ x: number; y: number; w: number; n?: number; f: number; r?: number }> =
  ({ x, y, w, n = 12, f, r = 9 }) => (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const on = ((i + Math.floor(f / 6)) % 3) === 0;
        const bx = x + (w / (n - 1)) * i;
        return (
          <g key={i}>
            {on && <circle cx={bx} cy={y} r={r * 1.9} fill={SGP.lampGold} opacity={0.3} />}
            <circle cx={bx} cy={y} r={r} fill={on ? SGP.lampGold : KRP.grayDark}
              stroke={C.ink} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );

// 制服の警備員 (#152 / #157 / #160 で同一人物。描き直さず使い回す)
const Keibiin: React.FC<{ x: number; y: number; s?: number; f: number; gazeX?: number; sweat?: boolean }> =
  ({ x, y, s = 1, f, gazeX = 0, sweat }) => (
    <g>
      <ellipse cx={x} cy={y + 6 * s} rx={92 * s} ry={20 * s} fill={C.ink} opacity={0.18} />
      <Person x={x} y={y} s={s} cloth={C.navy} clothDark={C.navyDark} hair="none"
        face="normal" gaze={[gazeX, 0]} f={f} still />
      {/* 白手袋 */}
      <circle cx={x - 67 * s} cy={y - 60 * s} r={13 * s} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      <circle cx={x + 67 * s} cy={y - 60 * s} r={13 * s} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      {/* 腕章 */}
      <rect x={x + 55 * s} y={y - 142 * s} width={25 * s} height={30 * s} rx={4 * s}
        fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      <line x1={x + 55 * s} y1={y - 127 * s} x2={x + 80 * s} y2={y - 127 * s}
        stroke={KRP.red} strokeWidth={6 * s} />
      {/* 制帽 */}
      <g transform={`translate(${x} ${y - 272 * s}) scale(${s})`}>
        <path d="M -58 6 Q -60 -40 0 -44 Q 60 -40 58 6 Z" fill={C.navy} stroke={C.ink} strokeWidth={5} />
        <rect x={-62} y={2} width={124} height={16} rx={8} fill={C.navyDark} stroke={C.ink} strokeWidth={4.5} />
        <path d="M -34 18 Q 0 34 34 18 L 30 28 Q 0 40 -30 28 Z" fill={C.ink} />
        <circle cx={0} cy={-12} r={9} fill={KRP.brass} stroke={C.ink} strokeWidth={3.5} />
      </g>
      {sweat && (
        <ellipse cx={x + 76 * s} cy={y - 248 * s + Math.sin(f / 6) * 3 * s} rx={7 * s} ry={11 * s}
          fill={KRP.blue} stroke={C.ink} strokeWidth={3} opacity={0.9} />
      )}
    </g>
  );

// 立て札 (#152 遠景 / #158 寄り / #159 文言① / #160 文言②。同じ札を phase で切り替え)
const Tatefuda: React.FC<{
  x: number; y: number; s?: number; f: number;
  mode: "scribble" | "text1" | "text2";
  t1?: number; t2?: number; flipT?: number;
}> = ({ x, y, s = 1, f, mode, t1 = 1, t2 = 1, flipT = 1 }) => {
  const sway = Math.sin(f / 11) * 0.5;
  const k = clamp01(flipT);
  const fold = mode === "text2" ? (k < 0.5 ? 1 - k * 2 : (k - 0.5) * 2) : 1;
  const showOld = mode === "text2" && k < 0.5;
  // 読めない距離の文字 (ぐにゃぐにゃ線2段組)
  const scribbleRows = (
    <g stroke={C.ink} strokeWidth={6} opacity={0.72} strokeLinecap="round" fill="none">
      {[-110, -62, 44, 92, 140].map((ry, i) => (
        <path key={ry}
          d={`M -320 ${ry} q 40 ${i % 2 ? 6 : -6} 90 0 t 110 0 t 100 0 t ${90 - i * 8} 0`} />
      ))}
    </g>
  );
  // 文言① (2行+弟のミニ似顔+星条旗)
  const rows1 = (tA: number, tB: number) => (
    <g>
      <g opacity={Math.min(tA * 2, 1)} transform={`translate(${(1 - pop(clamp01(tA))) * -46} 0)`}>
        <text x={-350} y={-52} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.ink}>
          支配人の弟も お断り</text>
        <line x1={-350} y1={-30} x2={lerp(-350, 240, clamp01(tA))} y2={-30}
          stroke={KRP.red} strokeWidth={5} opacity={0.8} />
        {/* 困り顔の弟のミニ似顔 */}
        <g transform="translate(320 -72)">
          <circle r={46} fill={SGP.paper} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={-4} r={25} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <path d="M -24 -14 Q -22 -34 0 -32 Q 22 -34 24 -14 Q 10 -24 0 -24 Q -10 -24 -24 -14 Z" fill={C.ink} />
          <circle cx={-9} cy={-8} r={2.6} fill={C.ink} />
          <circle cx={9} cy={-8} r={2.6} fill={C.ink} />
          <path d="M -14 -16 L -5 -13 M 14 -16 L 5 -13" stroke={C.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d="M -7 8 Q 0 3 7 8" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <path d="M -12 30 L 0 24 L 12 30 L 0 36 Z" fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
      <g opacity={Math.min(tB * 2, 1)} transform={`translate(${(1 - pop(clamp01(tB))) * -46} 0)`}>
        <text x={-350} y={122} fontFamily={FONT} fontWeight={900} fontSize={50} fill={C.ink}>
          合衆国大統領も お断り</text>
        <line x1={-350} y1={144} x2={lerp(-350, 250, clamp01(tB))} y2={144}
          stroke={KRP.red} strokeWidth={5} opacity={0.8} />
        {/* 星条旗の小旗 */}
        <g transform="translate(316 92)">
          <line x1={0} y1={-38} x2={0} y2={44} stroke={C.ink} strokeWidth={5} />
          <path d={`M 0 -38 L 78 ${-32 + Math.sin(f / 7) * 3} L 78 ${10 + Math.sin(f / 7 + 1) * 3} L 0 16 Z`}
            fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <path d={`M 30 ${-21 + Math.sin(f / 7) * 2} L 78 ${-18 + Math.sin(f / 7) * 3}`}
            stroke={KRP.red} strokeWidth={6} />
          <path d={`M 0 -4 L 78 ${-3 + Math.sin(f / 7 + 1) * 3}`} stroke={KRP.red} strokeWidth={6} />
          <rect x={0} y={-38} width={34} height={22} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={3} />
          {[6, 16, 26].map((dx) => (
            <circle key={dx} cx={dx} cy={-27} r={2.2} fill={KRP.white} />
          ))}
        </g>
      </g>
    </g>
  );
  // 文言② (1行+王冠+音符)
  const rows2 = (
    <g>
      <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={56} fill={C.ink}>英国女王陛下も お断り</text>
      <line x1={-300} y1={84} x2={300} y2={84} stroke={KRP.red} strokeWidth={5} opacity={0.8} />
      {/* 王冠 (t2 でポン) */}
      <g transform={`translate(0 -78) scale(${pop(clamp01(t2))})`}>
        <path d="M -62 24 L -70 -28 L -34 0 L 0 -42 L 34 0 L 70 -28 L 62 24 Z"
          fill={KRP.brass} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-62} y={24} width={124} height={16} rx={6} fill={KRP.brass} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={0} cy={-46} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        <circle cx={-68} cy={-32} r={5} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        <circle cx={68} cy={-32} r={5} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        <circle cx={-26} cy={32} r={4} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={2.5} />
        <circle cx={26} cy={32} r={4} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={2.5} />
      </g>
      {/* 「神のご加護」の小さな音符 (王冠の左右) */}
      {t2 > 0.4 && [-170, 170, 230].map((nx, i) => (
        <g key={nx} transform={`translate(${nx} ${-90 + Math.sin(f / 8 + i * 1.4) * 7})`}
          opacity={Math.min((t2 - 0.4) * 3, 1)}>
          <ellipse cx={0} cy={0} rx={9} ry={7} fill={C.ink} transform="rotate(-18)" />
          <path d="M 8 -2 L 8 -30 Q 17 -28 21 -21" fill="none" stroke={C.ink}
            strokeWidth={4.5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${s})`}>
      {/* A型の脚と貫 */}
      <path d="M -362 230 L -332 230 L -390 436 L -420 436 Z" fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
      <path d="M 362 230 L 332 230 L 390 436 L 420 436 Z" fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
      <rect x={-310} y={330} width={620} height={18} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      {/* 板 (木枠) */}
      <rect x={-420} y={-260} width={840} height={520} rx={12} fill={SGP.wood} stroke={C.ink} strokeWidth={8} />
      <path d="M -398 -240 Q -200 -246 60 -240 M -380 236 Q -80 242 390 236"
        fill="none" stroke={SGP.woodDark} strokeWidth={3} />
      {[[-404, -244], [404, -244], [-404, 244], [404, 244]].map(([nx, ny], i) => (
        <circle key={i} cx={nx} cy={ny} r={4} fill={C.ink} />
      ))}
      {/* 紙 (text2 はここがめくれる) */}
      <g transform={`scale(1 ${Math.max(fold, 0.02)})`}>
        <rect x={-385} y={-225} width={770} height={450} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={-385} y={-225} width={770} height={56} fill={C.navy} stroke={C.ink} strokeWidth={5} />
        {[-60, 0, 60].map((dx) => (
          <circle key={dx} cx={dx} cy={-197} r={8} fill={SGP.lampGold} stroke={C.ink} strokeWidth={3} />
        ))}
        {mode === "scribble" && scribbleRows}
        {mode === "text1" && rows1(t1, t2)}
        {mode === "text2" && (showOld ? rows1(1, 1) : rows2)}
      </g>
    </g>
  );
};

// 配給契約書 (#155 机の上 / #156 大写し。同じ紙をカメラだけ変えて使う)
// ローカル座標: (0,0)=紙の中心。紙 w720 h900。条項ブロックは y -10〜180
const ContractPaper: React.FC<{ f: number; revealT?: number; frameT?: number }> =
  ({ f, revealT = 0, frameT = 0 }) => {
    const para = (y0: number, n: number, sd: number) => (
      <g stroke={C.ink} strokeWidth={4.5} opacity={0.55} strokeLinecap="round" fill="none">
        {Array.from({ length: n }, (_, i) => (
          <path key={i}
            d={`M -300 ${y0 + i * 34} q 40 ${i % 2 ? 3 : -3} 90 0 t 110 0 t 100 0 t ${130 - rnd(sd, i) * 100} 0`} />
        ))}
      </g>
    );
    const rv = clamp01(revealT);
    const fr = pop(clamp01(frameT));
    return (
      <g>
        <rect x={-360} y={-450} width={720} height={900} fill={SGP.paper} stroke={C.ink} strokeWidth={7} />
        <path d="M 360 -426 L 330 -450 M -360 418 L -332 450" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
        <text x={0} y={-376} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={46} fill={C.ink} letterSpacing={6}>配給契約書</text>
        <line x1={-180} y1={-352} x2={180} y2={-352} stroke={C.ink} strokeWidth={4} />
        {para(-290, 4, 21)}
        {para(-124, 2, 22)}
        {/* 条項ブロック (主役) */}
        <rect x={-320} y={-6} width={640} height={190} fill={KRP.white} opacity={0.65} />
        {rv < 1 && <g opacity={1 - rv}>{para(48, 3, 23)}</g>}
        {rv > 0 && (
          <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={54} fill={C.ink} opacity={rv}>上映開始後 入場禁止</text>
        )}
        {/* 但し書きに落ちる影 (明かされる前だけ) */}
        <path d="M -40 -6 L 320 -6 L 320 184 L -150 184 Z" fill={C.ink}
          opacity={0.22 * (1 - rv) * (0.9 + 0.1 * Math.sin(f / 9))} />
        {/* 赤枠 (#156 でだけ出す) */}
        {frameT > 0 && (
          <g transform={`scale(${fr})`} opacity={Math.min(frameT * 2, 1)}>
            <rect x={-330} y={14} width={660} height={160} rx={8}
              fill="none" stroke={KRP.red} strokeWidth={9} />
            <rect x={-322} y={22} width={644} height={144} rx={6}
              fill="none" stroke={KRP.red} strokeWidth={3.5} opacity={0.6} />
          </g>
        )}
        {para(230, 3, 24)}
        {para(348, 2, 25)}
        {/* 署名欄と印 */}
        <line x1={-280} y1={386} x2={60} y2={386} stroke={C.ink} strokeWidth={4} opacity={0.7} />
        <circle cx={210} cy={378} r={34} fill="none" stroke={SGP.shuin} strokeWidth={6} opacity={0.85} />
        <circle cx={210} cy={378} r={24} fill="none" stroke={SGP.shuin} strokeWidth={3} opacity={0.85} />
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #149 「最初から観ないと分かりません」などと言っていたら、席が空いてしまいます。
// 格: 並 / seed 1235
// 絵: 支配人が「最初から観ないと〜」の看板を出しかけ、そろばんを見て、そっと裏の物置へ戻す。ユーモア
// どこ: 米国の映画館のロビー。板壁・切符売場・座席表・裏の物置
// 演出: 「最初から観ないと…」の看板を抱えた支配人が そろばん (ガラガラの座席表) を見て物置へUターン
// 動き: 支配人が右の物置へ歩く / そろばんの珠が1つ滑る / 汗 / ランプの明滅
const Sg149: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 16, 40));
  const mx = 980 + walk * 300;
  const bob = Math.sin(f / 3.2) * 3 * (walk > 0 && walk < 1 ? 1 : 0);
  return (
    <Frame f={f} seed={1235}>
      {/* 板壁 */}
      <rect x={0} y={0} width={W} height={790} fill={SGP.wood} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={0} y1={90 + i * 86} x2={W} y2={90 + i * 86}
          stroke={SGP.woodDark} strokeWidth={3} opacity={0.5} />
      ))}
      {/* 床 */}
      <rect x={0} y={770} width={W} height={H - 770} fill={KRP.floor} />
      <line x1={0} y1={770} x2={W} y2={770} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={120 + i * 290} y1={770} x2={40 + i * 320} y2={H}
          stroke={C.ink} strokeWidth={2.5} opacity={0.22} />
      ))}
      {/* 左: 切符売場の窓口 */}
      <g>
        <rect x={90} y={250} width={420} height={520} fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        <rect x={140} y={330} width={320} height={300} rx={10} fill={C.nightDeep} stroke={C.ink} strokeWidth={6} />
        <path d="M 140 630 Q 300 600 460 630" fill="none" stroke={KRP.brass} strokeWidth={5} />
        <rect x={250} y={600} width={100} height={30} rx={6} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
        <TagPlate x={300} y={200} text="切符売場" size={30} t={1} />
        {/* 窓口の中の売り子 (暇そう) */}
        <g transform="translate(300 560)">
          <circle cx={0} cy={-60} r={46} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M -32 -84 Q 0 -112 32 -84 Q 20 -96 0 -96 Q -20 -96 -32 -84 Z" fill={C.ink} />
          <circle cx={-12} cy={-62} r={3.5} fill={C.ink} />
          <circle cx={12} cy={-62} r={3.5} fill={C.ink} />
          <path d={`M -9 ${-42 + Math.sin(f / 9) * 1.5} Q 0 ${-38 + Math.sin(f / 9) * 2} 9 ${-42 + Math.sin(f / 9) * 1.5}`}
            fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
          <rect x={-56} y={-16} width={112} height={36} rx={8} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 中央の壁: 座席表 (ガラガラ) */}
      <g>
        <rect x={640} y={430} width={360} height={290} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <rect x={640} y={430} width={360} height={48} fill={C.navy} stroke={C.ink} strokeWidth={6} />
        <text x={820} y={465} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={28} fill={KRP.white} letterSpacing={4}>座席表</text>
        {Array.from({ length: 20 }, (_, i) => {
          const cx2 = 690 + (i % 5) * 65;
          const cy2 = 520 + Math.floor(i / 5) * 48;
          const filled = i === 2 || i === 8 || i === 16;
          return (
            <circle key={i} cx={cx2} cy={cy2} r={16} fill={filled ? KRP.blue : "none"}
              stroke={C.ink} strokeWidth={3.5} opacity={filled ? 1 : 0.45} />
          );
        })}
      </g>
      {/* 右: 物置 (扉が開いている) */}
      <g>
        <rect x={1560} y={330} width={330} height={460} fill={C.nightDeep} stroke={C.ink} strokeWidth={7} />
        {/* 中の棚とほうき・バケツ */}
        <line x1={1580} y1={470} x2={1870} y2={470} stroke={SGP.woodDark} strokeWidth={8} opacity={0.8} />
        <rect x={1600} y={420} width={60} height={46} rx={6} fill={SGP.woodDark} stroke={C.ink} strokeWidth={3} opacity={0.8} />
        <rect x={1690} y={428} width={80} height={38} rx={6} fill={KRP.grayDark} stroke={C.ink} strokeWidth={3} opacity={0.8} />
        <line x1={1800} y1={500} x2={1830} y2={770} stroke={SGP.wood} strokeWidth={9} opacity={0.9} />
        <path d="M 1810 740 L 1870 790 L 1796 790 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={4} opacity={0.85} />
        <path d="M 1610 700 L 1690 700 L 1680 790 L 1620 790 Z" fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} opacity={0.9} />
        {/* 開いた扉 */}
        <rect x={1476} y={320} width={84} height={480} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
        <circle cx={1496} cy={560} r={8} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
        <TagPlate x={1724} y={262} text="物置" size={30} t={1} />
      </g>
      {/* 支配人 (看板を抱えて物置へそっと戻る) */}
      <g transform={`translate(0 ${bob})`}>
        <ellipse cx={mx} cy={1008} rx={100} ry={20} fill={C.ink} opacity={0.16} />
        <Person x={mx} y={1002} s={1.25} cloth={KRP.grayDark} clothDark={C.ink}
          hair="cap" face="worried" gaze={[walk > 0.3 ? 5 : -6, 0]} f={f} pose="hold" still />
        {/* 抱えた看板 */}
        <g transform={`translate(${mx} 854) rotate(${-4 + Math.sin(f / 8) * 1.5})`}>
          <rect x={-150} y={-130} width={300} height={210} rx={10}
            fill={KRP.white} stroke={C.ink} strokeWidth={7} />
          <rect x={-150} y={-130} width={300} height={40} fill={KRP.red} stroke={C.ink} strokeWidth={6} opacity={0.85} />
          <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={C.ink}>最初から</text>
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={C.ink}>観ないと…</text>
          <line x1={-110} y1={44} x2={110} y2={44} stroke={C.ink} strokeWidth={4} opacity={0.5} />
        </g>
        {/* 汗 */}
        <ellipse cx={mx + 94} cy={690 + Math.sin(f / 5) * 4} rx={9} ry={14}
          fill={KRP.blue} stroke={C.ink} strokeWidth={3} opacity={0.9} />
      </g>
      {/* 手前の机とそろばん */}
      <g>
        <rect x={100} y={880} width={620} height={200} fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        <rect x={140} y={905} width={540} height={110} rx={12} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <line x1={140} y1={942} x2={680} y2={942} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => {
          const rx2 = 172 + i * 60;
          const slide = i === 4 ? easeOut(seg(f, 6, 12)) * 26 : 0;
          return (
            <g key={i}>
              <line x1={rx2} y1={905} x2={rx2} y2={1015} stroke={C.ink} strokeWidth={3} />
              <ellipse cx={rx2} cy={924} rx={17} ry={11} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
              <ellipse cx={rx2} cy={962 + slide} rx={17} ry={11} fill={SGP.woodDark} stroke={C.ink} strokeWidth={3} />
              <ellipse cx={rx2} cy={992} rx={17} ry={11} fill={SGP.woodDark} stroke={C.ink} strokeWidth={3} />
            </g>
          );
        })}
      </g>
      {/* 壁のランプ (明滅) */}
      <g transform="translate(1210 300)">
        <line x1={0} y1={-60} x2={0} y2={-20} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={10} r={30} fill={SGP.lampGold} stroke={C.ink} strokeWidth={5}
          opacity={0.75 + Math.sin(f / 6) * 0.2} />
        <circle cx={0} cy={10} r={48} fill={SGP.lampGold} opacity={0.14 + Math.sin(f / 6) * 0.06} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #150 芝居小屋の自由は、形を変えて、映画館に生きていました。
// 格: 山 / seed 1236
// 絵: 軸。年表の橋。江戸の芝居小屋から米国の映画館へ、「自由」の提灯の火がバトンのように渡る。海を越える橋の絵
// どこ: 海を越える木の橋。左=江戸の芝居小屋 右=米国の映画館
// 演出: 「自由」の提灯を持った走者が橋を渡ってバトンを届ける。軸の1枚
// 動き: 走者がベジェ曲線で橋を渡る / 提灯の残像 / 波・汽船・かもめ / 電球の点滅
const Sg150: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 40));
  const bz = (p0: number, p1: number, p2: number, tt: number) =>
    (1 - tt) * (1 - tt) * p0 + 2 * (1 - tt) * tt * p1 + tt * tt * p2;
  const px = bz(430, 960, 1490, t);
  const py = bz(600, 250, 600, t);
  return (
    <Frame f={f} seed={1236}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={660} fill={KRP.blueSoft} opacity={0.5} />
      <g transform={`translate(960 90) rotate(${f * 0.8})`} opacity={0.5}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={0} y1={56} x2={0} y2={92} stroke={KRP.yellow} strokeWidth={7}
            transform={`rotate(${i * 36})`} strokeLinecap="round" />
        ))}
      </g>
      <circle cx={960} cy={90} r={48} fill={KRP.yellow} stroke={C.ink} strokeWidth={6} />
      {[[320, 170, 1], [1340, 120, -1]].map(([cx2, cy2, dir], i) => (
        <g key={i} transform={`translate(${(cx2 as number) + Math.sin(f / 16 + i * 2) * 10 * (dir as number)} ${cy2})`} opacity={0.85}>
          <ellipse cx={0} cy={0} rx={86} ry={32} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={-50} cy={10} rx={48} ry={24} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={55} cy={8} rx={44} ry={22} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* かもめ */}
      {[0, 1, 2].map((i) => (
        <path key={i}
          d={`M ${640 + i * 240 + Math.sin(f / 9 + i) * 8} ${320 + i * 40 + Math.sin(f / 7 + i * 2) * 6}
              q 14 ${-12 - Math.sin(f / 4 + i) * 4} 28 0 q 14 ${-12 - Math.sin(f / 4 + i) * 4} 28 0`}
          fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* 海 */}
      <rect x={0} y={620} width={W} height={H - 620} fill={C.sea} />
      <line x1={0} y1={620} x2={W} y2={620} stroke={C.ink} strokeWidth={5} opacity={0.6} />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i}
          d={`M ${((i * 260 + f * 3) % 2100) - 100} ${700 + (i % 4) * 90}
              q 30 -14 60 0 q 30 -14 60 0`}
          fill="none" stroke={KRP.white} strokeWidth={4.5} opacity={0.55} strokeLinecap="round" />
      ))}
      {/* 汽船 */}
      <g transform={`translate(${1050 + Math.sin(f / 12) * 6} ${905 + Math.sin(f / 9) * 4}) rotate(${Math.sin(f / 10)})`}>
        <path d="M -110 0 L 110 0 L 82 46 L -84 46 Z" fill={C.ink} />
        <rect x={-50} y={-38} width={100} height={38} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <rect x={-14} y={-78} width={28} height={40} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={6 + i * 22 + ((f * 1.6) % 22)} cy={-96 - i * 18} r={9 + i * 3}
            fill={KRP.white} stroke={C.ink} strokeWidth={3} opacity={0.8 - i * 0.2} />
        ))}
      </g>
      {/* 左: 江戸の芝居小屋 */}
      <g>
        <rect x={30} y={360} width={400} height={300} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <path d="M 0 360 L 230 270 L 460 360 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        {/* 櫓 */}
        <rect x={160} y={190} width={140} height={90} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
        <path d="M 150 190 L 230 150 L 310 190 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
        <line x1={185} y1={190} x2={185} y2={280} stroke={C.ink} strokeWidth={3.5} />
        <line x1={230} y1={190} x2={230} y2={280} stroke={C.ink} strokeWidth={3.5} />
        <line x1={275} y1={190} x2={275} y2={280} stroke={C.ink} strokeWidth={3.5} />
        {/* 縞の幕 */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={60 + i * 50} y={430} width={25} height={180}
            fill={i % 2 ? SGP.curtain : KRP.white} stroke={C.ink} strokeWidth={3} />
        ))}
        <rect x={55} y={420} width={355} height={18} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
        {/* 揺れる提灯 */}
        {[100, 230, 360].map((lx, i) => (
          <g key={lx} transform={`translate(${lx} 372) rotate(${Math.sin(f / 9 + i * 1.3) * 7})`}>
            <line x1={0} y1={-14} x2={0} y2={0} stroke={C.ink} strokeWidth={3.5} />
            <ellipse cx={0} cy={26} rx={20} ry={28} fill={SGP.lampGold} stroke={C.ink} strokeWidth={4} />
            <line x1={-18} y1={18} x2={18} y2={18} stroke={C.ink} strokeWidth={2} opacity={0.5} />
            <line x1={-19} y1={32} x2={19} y2={32} stroke={C.ink} strokeWidth={2} opacity={0.5} />
          </g>
        ))}
        <PersonMini x={120} y={660} s={0.9} color={KRP.blue} f={f} phase={0} face="smile" arms="up" />
        <PersonMini x={200} y={660} s={0.78} color={SGP.curtain} f={f} phase={2} face="dot" arms="down" />
      </g>
      <TagPlate x={470} y={80} text="江戸" size={42} t={seg(f, 2, 10)} />
      {/* 右: 米国の映画館 */}
      <g>
        <rect x={1500} y={330} width={390} height={330} fill={C.brick} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={1500} y1={390 + i * 56} x2={1890} y2={390 + i * 56}
            stroke={C.brickDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 縦看板 CINEMA */}
        <rect x={1620} y={130} width={92} height={330} fill={C.navy} stroke={C.ink} strokeWidth={6} />
        {"CINEMA".split("").map((ch, i) => (
          <text key={i} x={1666} y={180 + i * 48} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={38} fill={KRP.white}>{ch}</text>
        ))}
        {/* ひさしマーキー */}
        <rect x={1520} y={470} width={350} height={64} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <BulbRow x={1545} y={502} w={300} n={8} f={f} r={8} />
        {/* 入口 */}
        <rect x={1640} y={540} width={120} height={120} fill={SGP.lampGold} stroke={C.ink} strokeWidth={6} opacity={0.9} />
        <line x1={1700} y1={540} x2={1700} y2={660} stroke={C.ink} strokeWidth={4} />
        <PersonMini x={1590} y={660} s={0.85} color={KRP.green} f={f} phase={1} face="smile" arms="up" />
      </g>
      <TagPlate x={1700} y={80} text="アメリカ" size={42} t={seg(f, 4, 12)} />
      {/* 橋 */}
      <g>
        <path d="M 420 640 Q 960 240 1500 640 L 1500 690 Q 960 300 420 690 Z"
          fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 13 }, (_, i) => {
          const tt = (i + 0.5) / 13;
          const bx = bz(430, 960, 1490, tt);
          const by = bz(646, 252, 646, tt);
          return <line key={i} x1={bx} y1={by} x2={bx} y2={by + 44}
            stroke={SGP.woodDark} strokeWidth={4} opacity={0.7} />;
        })}
        {/* 欄干 */}
        <path d="M 420 600 Q 960 200 1500 600" fill="none" stroke={SGP.woodDark} strokeWidth={9} />
        {Array.from({ length: 9 }, (_, i) => {
          const tt = (i + 0.5) / 9;
          const bx = bz(425, 960, 1495, tt);
          const byT = bz(600, 202, 600, tt);
          const byB = bz(642, 248, 642, tt);
          return <line key={i} x1={bx} y1={byT} x2={bx} y2={byB} stroke={SGP.woodDark} strokeWidth={6} />;
        })}
        {/* 橋脚 */}
        <rect x={640} y={470} width={30} height={260} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1250} y={470} width={30} height={260} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 提灯の残像 (走者の後ろに火の跡) */}
      {[1, 2, 3].map((i) => {
        const tt = Math.max(t - 0.07 * i, 0);
        if (tt <= 0) return null;
        return (
          <circle key={i} cx={bz(430, 960, 1490, tt)} cy={bz(600, 250, 600, tt) - 140}
            r={26 - i * 5} fill={SGP.lampGold} opacity={0.3 - i * 0.08} />
        );
      })}
      {/* 走者 (「自由」の提灯を掲げて渡る) */}
      <g transform={`translate(${px} ${py})`}>
        <ellipse cx={0} cy={4} rx={56} ry={12} fill={C.ink} opacity={0.18} />
        <Person x={0} y={0} s={0.6} cloth={SGP.curtain} clothDark={C.brickDark}
          hair="cap" face="smile" f={f} pose="run" />
        {/* 掲げた提灯 */}
        <g transform={`translate(52 -150) rotate(${Math.sin(f / 5) * 8})`}>
          <line x1={0} y1={-40} x2={0} y2={-6} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={36} r={44 + Math.sin(f / 4) * 3} fill={SGP.lampGold} opacity={0.35} />
          <ellipse cx={0} cy={30} rx={27} ry={37} fill={SGP.lampGold} stroke={C.ink} strokeWidth={5} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={24} fill={C.ink}>自</text>
          <text x={0} y={48} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={24} fill={C.ink}>由</text>
        </g>
      </g>
      {/* 受け取り役 (橋のたもとで万歳) */}
      <PersonMini x={1470} y={652} s={0.95} color={KRP.blueDeep} f={f} phase={3}
        face="smile" arms="up" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #151 この牙城を崩した男が、あの監督です。
// 格: 並 / seed 1237
// 絵: 映写室。映写機の光の中に、恰幅のいい男の横顔の輪郭 (名物の線画) がぬっと浮かぶ。次章への引き
// どこ: 映画館の映写室。映写機・フィルム缶の棚・赤い安全灯
// 演出: 映写機の光の中に恰幅のいい男の横顔の線画がぬっと浮かぶ。次章への引き
// 動き: リール回転 / 光のゆらぎ / 横顔が pop で浮かぶ / 塵が漂う / 映写技師が驚く
const Sg151: React.FC<{ f: number }> = ({ f }) => {
  const rise = pop(seg(f, 16, 34));
  return (
    <Frame f={f} seed={1237} bg="#242B38" dark>
      {/* 壁と床 */}
      <rect x={0} y={0} width={W} height={850} fill="#242B38" />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={0} y1={120 + i * 130} x2={W} y2={120 + i * 130}
          stroke={C.nightDeep} strokeWidth={3} opacity={0.6} />
      ))}
      <rect x={0} y={840} width={W} height={H - 840} fill={C.nightDeep} />
      <line x1={0} y1={840} x2={W} y2={840} stroke={C.ink} strokeWidth={6} />
      {/* 棚とフィルム缶 (右上の壁) */}
      <g>
        <rect x={1300} y={150} width={560} height={16} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${1360 + i * 130} 118)`}>
            <circle r={44} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
            <circle r={14} fill={C.nightDeep} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        <rect x={1300} y={330} width={560} height={16} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1340 + i * 170} y={262} width={130} height={62} rx={8}
            fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
        ))}
      </g>
      {/* 赤い安全灯 */}
      <g transform="translate(1180 110)">
        <rect x={-16} y={-30} width={32} height={26} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <circle cx={0} cy={18} r={22} fill={KRP.red} stroke={C.ink} strokeWidth={5}
          opacity={0.6 + Math.sin(f / 7) * 0.3} />
        <circle cx={0} cy={18} r={40} fill={KRP.red} opacity={0.1 + Math.sin(f / 7) * 0.06} />
      </g>
      {/* 光のビーム (映写機 → 左) */}
      <polygon points={`660,470 -40,300 -40,700`} fill={C.beam}
        opacity={0.22 + 0.06 * Math.sin(f / 5)} />
      <polygon points={`660,470 -40,390 -40,610`} fill={C.beam}
        opacity={0.18 + 0.05 * Math.sin(f / 4 + 1)} />
      {/* 漂う塵 */}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i}
          cx={80 + rnd(31, i) * 560 - ((f * (0.6 + rnd(32, i))) % 40)}
          cy={340 + rnd(33, i) * 280 + Math.sin(f / 8 + i) * 8}
          r={2.5 + rnd(34, i) * 3} fill={C.beam} opacity={0.5 + Math.sin(f / 6 + i * 2) * 0.3} />
      ))}
      {/* 横顔の線画 (光の中にぬっと) */}
      <g transform={`translate(330 ${640 - rise * 100}) scale(${rise * 2.0})`} opacity={Math.min(rise * 1.4, 1)}>
        <path d="M -20 -120 Q 40 -138 66 -92 Q 84 -60 70 -30 Q 92 -22 84 -2 Q 78 12 60 14
                 Q 66 34 48 40 Q 54 58 30 62 Q 26 86 -6 84 Q -46 82 -60 48
                 Q -78 10 -66 -40 Q -56 -96 -20 -120 Z"
          fill="none" stroke={KRP.white} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -60 48 Q -40 70 -6 84" fill="none" stroke={KRP.white} strokeWidth={6} />
        <circle cx={30} cy={-44} r={5} fill={KRP.white} />
        <path d="M 10 -70 Q 34 -78 54 -66" fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* 映写機 */}
      <g>
        <rect x={880} y={700} width={420} height={150} fill={KRP.grayDark} stroke={C.ink} strokeWidth={7} />
        <rect x={950} y={560} width={300} height={200} rx={16} fill={C.navyDark} stroke={C.ink} strokeWidth={7} />
        {/* レンズ */}
        <rect x={840} y={590} width={120} height={60} rx={12} fill={KRP.grayDark} stroke={C.ink} strokeWidth={6} />
        <circle cx={838} cy={620} r={34} fill={C.beam} stroke={C.ink} strokeWidth={6}
          opacity={0.9 + Math.sin(f / 5) * 0.1} />
        {/* リール2つ (回転) */}
        {[[1010, 480], [1190, 480]].map(([rx2, ry2], i) => (
          <g key={i} transform={`translate(${rx2} ${ry2}) rotate(${f * 7 * (i ? -1 : 1)})`}>
            <circle r={85} fill={C.nightDeep} stroke={C.ink} strokeWidth={7} />
            <circle r={24} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line key={a} x1={0} y1={0} x2={76 * Math.cos((a * Math.PI) / 180)}
                y2={76 * Math.sin((a * Math.PI) / 180)} stroke={KRP.grayDark} strokeWidth={6} />
            ))}
          </g>
        ))}
        {/* フィルムの帯 */}
        <path d={`M 1010 565 Q 1100 ${600 + Math.sin(f / 6) * 5} 1190 565`}
          fill="none" stroke={C.ink} strokeWidth={9} />
        <path d="M 940 520 Q 900 560 905 600" fill="none" stroke={C.ink} strokeWidth={8} opacity={0.8} />
      </g>
      {/* 映写技師 (驚いて見ている) */}
      <g>
        <ellipse cx={1600} cy={1016} rx={80} ry={16} fill={C.ink} opacity={0.25} />
        <Person x={1600} y={1010} s={0.95} cloth={KRP.bronze} clothDark={C.brickDark}
          hair="cap" face="surprised" gaze={[-7, -2]} f={f} still />
      </g>
      <QMark x={1720} y={620} s={0.55} t={seg(f, 24, 34)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #152 第8章、ヒッチコックの、立て札。
// 格: 山 / seed 1238
// 絵: 章扉。映画館の正面。入口に立て札と制服警備員、ロープ。文字はまだ読めない距離。ざわつく人々
// どこ: 夕暮れのNY。映画館の正面 (左) と歩道。章扉は右下 (ChapterDoor)
// 演出: 入口に立て札 (まだ読めない) と警備員とロープ。ざわつく人々の後ろ姿
// 動き: 星の明滅 / マーキー電球 / 立て札の揺れ / ？マークが2つ順に出る / 群衆が揺れる
const Sg152: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1238} bg={C.night} dark
    over={<ChapterDoor num={8} title="ヒッチコックの立て札" t={seg(f, 8, 20)}
      left={1010} top={620} width={860} />}>
    {/* 夜空と夕暮れの名残 */}
    <rect x={0} y={0} width={W} height={H} fill={C.night} />
    <rect x={0} y={0} width={W} height={300} fill={C.nightDeep} />
    <rect x={0} y={560} width={W} height={120} fill={C.dusk} opacity={0.25} />
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={60 + rnd(41, i) * 1800} cy={30 + rnd(42, i) * 330}
        r={2 + rnd(43, i) * 2.5} fill={KRP.white}
        opacity={0.3 + ((Math.sin(f / 6 + i * 1.7) + 1) / 2) * 0.6} />
    ))}
    {/* 遠景ビルのシルエット (右奥) */}
    {[[1060, 300, 180], [1300, 240, 220], [1580, 330, 260]].map(([bx, by, bw], i) => (
      <g key={i}>
        <rect x={bx} y={by} width={bw} height={620 - (by as number) + 260} fill={C.nightDeep} opacity={0.85} />
        {Array.from({ length: 8 }, (_, j) => (
          <rect key={j} x={(bx as number) + 24 + (j % 3) * ((bw as number) / 3.4)}
            y={(by as number) + 34 + Math.floor(j / 3) * 90}
            width={26} height={34} fill={SGP.lampGold}
            opacity={rnd(50 + i, j) > 0.45 ? 0.6 : 0.12} />
        ))}
      </g>
    ))}
    {/* 歩道 */}
    <rect x={0} y={870} width={W} height={H - 870} fill={C.sidewalk} />
    <line x1={0} y1={870} x2={W} y2={870} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 6 }, (_, i) => (
      <line key={i} x1={i * 340} y1={870} x2={i * 340 - 120} y2={H}
        stroke={C.ink} strokeWidth={3} opacity={0.3} />
    ))}
    {/* 映画館ファサード (左) */}
    <g>
      <rect x={30} y={180} width={970} height={700} fill={C.brick} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={30} y1={250 + i * 80} x2={1000} y2={250 + i * 80}
          stroke={C.brickDark} strokeWidth={3} opacity={0.55} />
      ))}
      {/* 縦看板 */}
      <rect x={90} y={135} width={100} height={420} fill={C.navy} stroke={C.ink} strokeWidth={7} />
      {"CINEMA".split("").map((ch, i) => (
        <text key={i} x={140} y={201 + i * 58} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={44}
          fill={((i + Math.floor(f / 8)) % 3) === 0 ? SGP.lampGold : KRP.white}>{ch}</text>
      ))}
      {/* マーキーひさし */}
      <rect x={240} y={330} width={740} height={96} rx={12} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
      <rect x={240} y={330} width={740} height={96} rx={12} fill={SGP.lampGold} opacity={0.12 + Math.sin(f / 7) * 0.05} />
      <BulbRow x={280} y={378} w={660} n={12} f={f} r={9} />
      {/* ポスター額 ×2 */}
      {[300, 830].map((px2, i) => (
        <g key={i} transform={`translate(${px2} 600)`}>
          <rect x={-70} y={-110} width={140} height={220} fill={KRP.cream} stroke={KRP.brass} strokeWidth={7} />
          <path d={`M -44 60 Q 0 ${-40 + i * 16} 44 60`} fill="none" stroke={C.ink} strokeWidth={5} opacity={0.6} />
          <circle cx={0} cy={-56} r={24} fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.6} />
        </g>
      ))}
      {/* 真鍮の扉 (温かい光) */}
      <rect x={430} y={470} width={330} height={408} fill={SGP.lampGold} stroke={C.ink} strokeWidth={7}
        opacity={0.95} />
      <rect x={430} y={470} width={330} height={408} fill={KRP.white} opacity={0.12 + Math.sin(f / 9) * 0.05} />
      <line x1={595} y1={470} x2={595} y2={878} stroke={C.ink} strokeWidth={5} />
      {[500, 690].map((hx) => (
        <rect key={hx} x={hx} y={640} width={14} height={70} rx={7} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
      ))}
      {/* 赤絨毯 */}
      <path d="M 450 878 L 740 878 L 820 1040 L 370 1040 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
    </g>
    {/* スタンションとロープ */}
    {[360, 980].map((sx2, i) => (
      <g key={i} transform={`translate(${sx2} 980)`}>
        <ellipse cx={0} cy={6} rx={40} ry={10} fill={C.ink} opacity={0.25} />
        <rect x={-10} y={-130} width={20} height={132} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-138} r={16} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={34} ry={12} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
      </g>
    ))}
    <path d={`M 360 850 Q 670 ${905 + Math.sin(f / 9) * 7} 980 850`}
      fill="none" stroke={SGP.curtain} strokeWidth={14} strokeLinecap="round" />
    {/* 立て札 (読めない距離) + 警備員 */}
    <Tatefuda x={760} y={800} s={0.48} f={f} mode="scribble" />
    <Keibiin x={945} y={960} s={0.72} f={f} gazeX={-4} />
    {/* ざわつく人々 (後ろ姿) */}
    {[[150, 1.25, 0], [260, 1.1, 2], [420, 1.3, 4], [560, 1.05, 1], [660, 1.2, 3]].map(([gx2, gs, ph], i) => (
      <PersonMini key={i} x={gx2 as number} y={1052 + Math.sin(f / 7 + i) * 3}
        s={gs as number} color={[C.navyDark, C.brickDark, KRP.grayDark, C.navy, "#5A4634"][i]}
        f={f} phase={ph as number} face="none" arms="down" />
    ))}
    <QMark x={210} y={760} s={0.5} f={f} t={seg(f, 10, 20)} color={KRP.orange} />
    <QMark x={620} y={700} s={0.4} f={f} t={seg(f, 16, 26)} color={KRP.orange} />
  </Frame>
);

// -------------------------------------------------------------------
// #153 1960年6月16日、ニューヨーク。
// 格: 並 / seed 1239
// 絵: 1960年6月のマンハッタンの通り。一点透視で奥へ抜ける街路
// どこ: 夕方前のマンハッタン。赤レンガのアパート (非常階段) と石造りのビルに挟まれた通り
// 演出: 年号札「1960年6月16日」。左の奥に映画館のマーキー (電球の縁取り・無地の帯) =次の#154へ。
//       右のビルから突き出た竿に星条旗 (49星旗の時期なので星は数えられない細かい点の集まり)
// 動き: カメラがじわっと寄る / イエローキャブが奥へ・セダンが手前へ / 横断歩道を渡る3人 /
//       旗がはためく / マーキーの電球が走る / マンホールの湯気 / 雲が流れる
// ★修正3: 作者「イラストももっとよくして、あとどこかに国旗を置く」→ 発想は残して全面作り込み

// ===== #153 専用: 小さな一点透視の射影 =====
// 世界座標 (m): X 右+ / Y 上+ / Z 奥+。目の高さ 3m・焦点 760px・地平線 y=480
const NY_F = 760;
const NY_HY = 480;
const NY_EYE = 3;
type V3 = [number, number, number];
const nyP = (X: number, Y: number, Z: number): [number, number] =>
  [960 + (X * NY_F) / Z, NY_HY - ((Y - NY_EYE) * NY_F) / Z];
const nyPts = (...ps: V3[]) =>
  ps.map((p) => nyP(p[0], p[1], p[2]).map((v) => v.toFixed(1)).join(",")).join(" ");
const nyK = (Z: number) => NY_F / Z; // その奥行きで 1m が何 px か
const nyLine = (a: V3, b: V3) => {
  const [x1, y1] = nyP(a[0], a[1], a[2]);
  const [x2, y2] = nyP(b[0], b[1], b[2]);
  return { x1, y1, x2, y2 };
};
const NYC = {
  skyTop: "#B9D3E6",
  skyLow: "#F1E3C6",
  haze: "#D9DEDF",
  brick: "#A65A45",
  brickDeep: "#8E4A3A",
  brickBrown: "#86553F",
  lime: "#DCCBA6",
  limeDark: "#BFA97E",
  stone: "#B8AE9C",
  stone2: "#A7A49A",
  glass: "#93AABB",
  glassHi: "#C9DAE5",
  shade: "#E8DCBC",
  iron: "#3D3A3C",
  awnG: "#4E8A5E",
  sidewalk: "#B9B6AE",
  curb: "#D6D2C8",
  road: "#6A6C6E",
  roadFar: "#888A8A",
  teal: "#6FB7AE",
  maroon: "#8C3B3B",
  chrome: "#D9DDE0",
  flagRed: "#C8382F",
  flagBlue: "#2F3F78",
  wood: "#7E5E40",
  marqueeGlow: "#FFE7A3",
  deco: "#A9B6C4",
  lampGreen: "#3F5B48",
};

// ビル1棟 (通りに面した壁 X=±14 と、手前の妻面 Z=za)。窓・コーニス・1階の帯
const NyBuilding: React.FC<{
  s: -1 | 1; za: number; zb: number; h: number; wall: string; trim: string;
  seed: number; floorH?: number; bay?: number; shadeSide?: boolean; haze?: number;
  ground?: string; shop?: boolean;
}> = ({ s, za, zb, h, wall, trim, seed, floorH = 3.2, bay = 2.3, shadeSide, haze = 0, ground, shop }) => {
  const xw = s * 14;
  const xb = s * 60;
  const sw = Math.max(1.6, Math.min(4, nyK(za) * 0.07));
  const wins: React.ReactNode[] = [];
  // 通りに面した壁の窓
  for (let j = 1; j * floorH + 2.4 < h - 0.4; j++) {
    const y = j * floorH + 0.6;
    for (let k = 0; ; k++) {
      const z = za + 0.9 + k * bay;
      if (z + 1.1 > zb - 0.5 || nyK(z) < 10) break; // 遠すぎる窓は描かない (細かすぎてちらつく)
      const shadeOn = rnd(seed, j * 31 + k) > 0.62;
      wins.push(
        <g key={`w${j}-${k}`}>
          <polygon points={nyPts([xw, y, z], [xw, y, z + 1.1], [xw, y + 1.8, z + 1.1], [xw, y + 1.8, z])}
            fill={NYC.glass} stroke={C.ink} strokeWidth={sw * 0.7} />
          {shadeOn && (
            <polygon points={nyPts([xw, y + 1.0, z], [xw, y + 1.0, z + 1.1], [xw, y + 1.8, z + 1.1], [xw, y + 1.8, z])}
              fill={NYC.shade} opacity={0.9} />
          )}
          {/* まぐさ石 (窓の上の白い石) */}
          <polygon points={nyPts([xw, y + 1.8, z - 0.15], [xw, y + 1.8, z + 1.25], [xw, y + 2.1, z + 1.25], [xw, y + 2.1, z - 0.15])}
            fill={trim} />
        </g>,
      );
    }
  }
  // 手前の妻面の窓 (正面向き)
  for (let j = 1; j * floorH + 2.4 < h - 0.4; j++) {
    const y = j * floorH + 0.6;
    for (let k = 0; k < 8; k++) {
      const x = xw + s * (1.4 + k * 2.4);
      const [ax, ay] = nyP(x, y + 1.8, za);
      const [bx, by] = nyP(x + s * 1.1, y, za);
      wins.push(
        <rect key={`fw${j}-${k}`} x={Math.min(ax, bx)} y={ay} width={Math.abs(bx - ax)} height={by - ay}
          fill={rnd(seed + 5, j * 13 + k) > 0.7 ? NYC.shade : NYC.glass} stroke={C.ink} strokeWidth={sw * 0.7} />,
      );
    }
  }
  return (
    <g>
      {/* 妻面 (手前向き) */}
      <polygon points={nyPts([xw, 0, za], [xb, 0, za], [xb, h, za], [xw, h, za])}
        fill={wall} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={nyPts([xw, 0, za], [xb, 0, za], [xb, h, za], [xw, h, za])}
        fill={C.ink} opacity={0.12} />
      {/* 通りに面した壁 */}
      <polygon points={nyPts([xw, 0, za], [xw, 0, zb], [xw, h, zb], [xw, h, za])}
        fill={wall} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      {shadeSide && (
        <polygon points={nyPts([xw, 0, za], [xw, 0, zb], [xw, h, zb], [xw, h, za])}
          fill={C.ink} opacity={0.13} />
      )}
      {wins}
      {/* 1階の帯 (店の並び) */}
      <polygon points={nyPts([xw, 0, za], [xw, 0, zb], [xw, 3.0, zb], [xw, 3.0, za])}
        fill={ground ?? trim} opacity={0.85} stroke={C.ink} strokeWidth={sw * 0.8} />
      {/* 1階のショーウインドウ */}
      {shop && Array.from({ length: Math.floor((zb - za - 0.6) / 2.8) }, (_, i) => {
        const z = za + 0.7 + i * 2.8;
        return (
          <g key={`sh${i}`}>
            <polygon points={nyPts([xw, 0.4, z], [xw, 0.4, z + 2.0], [xw, 2.6, z + 2.0], [xw, 2.6, z])}
              fill={NYC.glass} stroke={C.ink} strokeWidth={sw * 0.8} />
            <polygon points={nyPts([xw, 0.6, z + 0.3], [xw, 0.6, z + 0.6], [xw, 2.4, z + 1.2], [xw, 2.4, z + 0.9])}
              fill={NYC.glassHi} opacity={0.7} />
          </g>
        );
      })}
      {/* コーニス (屋上のひさし) */}
      <polygon points={nyPts([xw, h - 0.7, za], [xw, h - 0.7, zb], [xw, h, zb], [xw, h, za])}
        fill={trim} stroke={C.ink} strokeWidth={sw * 0.8} />
      <polygon points={nyPts([xw, h - 0.7, za], [xb, h - 0.7, za], [xb, h, za], [xw, h, za])}
        fill={trim} stroke={C.ink} strokeWidth={sw * 0.8} />
      {haze > 0 && (
        <g opacity={haze}>
          <polygon points={nyPts([xw, 0, za], [xb, 0, za], [xb, h, za], [xw, h, za])} fill={NYC.haze} />
          <polygon points={nyPts([xw, 0, za], [xw, 0, zb], [xw, h, zb], [xw, h, za])} fill={NYC.haze} />
        </g>
      )}
    </g>
  );
};

// 非常階段 (壁から 1.3m 張り出した踊り場+手すり+ジグザグ階段+吊りはしご)
const NyFireEscape: React.FC<{ s: -1 | 1; z1: number; z2: number; levels: number[] }> =
  ({ s, z1, z2, levels }) => {
    const xw = s * 14;
    const xo = s * 12.7;
    const xm = s * 13.35;
    const sw = Math.max(2, nyK(z1) * 0.05);
    return (
      <g>
        {levels.map((Y, j) => {
          const up = j % 2 === 0;
          const za = up ? z1 + 0.5 : z2 - 3.0;
          const zb = up ? z1 + 3.0 : z2 - 0.5;
          const nb = Math.floor((z2 - z1) / 0.5);
          return (
            <g key={j}>
              {/* 下の階からの階段 (段々) */}
              {j > 0 && (
                <g>
                  <line {...nyLine([xm, levels[j - 1], up ? zb : za], [xm, Y, up ? za : zb])}
                    stroke={NYC.iron} strokeWidth={sw * 1.4} />
                  {Array.from({ length: 7 }, (_, r) => {
                    const t = (r + 0.5) / 7;
                    const zz = lerp(up ? zb : za, up ? za : zb, t);
                    const yy = lerp(levels[j - 1], Y, t);
                    return <line key={r} {...nyLine([xw, yy, zz], [xo, yy, zz])}
                      stroke={NYC.iron} strokeWidth={sw * 0.8} />;
                  })}
                </g>
              )}
              {/* 踊り場 (下から見上げた床) */}
              <polygon points={nyPts([xw, Y, z1], [xo, Y, z1], [xo, Y, z2], [xw, Y, z2])}
                fill={NYC.iron} opacity={0.88} stroke={C.ink} strokeWidth={sw * 0.8} />
              {/* 手すり */}
              <line {...nyLine([xo, Y + 1.0, z1], [xo, Y + 1.0, z2])} stroke={NYC.iron} strokeWidth={sw * 1.3} />
              <line {...nyLine([xw, Y + 1.0, z1], [xo, Y + 1.0, z1])} stroke={NYC.iron} strokeWidth={sw * 1.3} />
              <line {...nyLine([xw, Y + 1.0, z2], [xo, Y + 1.0, z2])} stroke={NYC.iron} strokeWidth={sw * 1.3} />
              {Array.from({ length: nb + 1 }, (_, b) => {
                const zz = z1 + b * 0.5;
                return <line key={b} {...nyLine([xo, Y, zz], [xo, Y + 1.0, zz])}
                  stroke={NYC.iron} strokeWidth={sw * 0.7} />;
              })}
            </g>
          );
        })}
        {/* いちばん下の吊りはしご */}
        <line {...nyLine([xo, levels[0], z1 + 0.6], [xo, levels[0] - 1.6, z1 + 0.6])} stroke={NYC.iron} strokeWidth={sw} />
        <line {...nyLine([xo, levels[0], z1 + 1.1], [xo, levels[0] - 1.6, z1 + 1.1])} stroke={NYC.iron} strokeWidth={sw} />
      </g>
    );
  };

// 屋上の給水塔 (木の樽+とんがり屋根+鉄の脚)。X,Y は屋根の上の足元、Z 奥行き
const NyWaterTower: React.FC<{ X: number; Y: number; Z: number }> = ({ X, Y, Z }) => {
  const k = nyK(Z);
  const [cx, by] = nyP(X, Y, Z);
  const legH = 2.4 * k, bw = 3.2 * k, bh = 3.6 * k, ch = 1.7 * k;
  const top = by - legH - bh;
  return (
    <g>
      {/* 鉄の脚と筋交い */}
      {[-0.42, 0, 0.42].map((u, i) => (
        <line key={i} x1={cx + u * bw} y1={by} x2={cx + u * bw * 0.9} y2={by - legH}
          stroke={NYC.iron} strokeWidth={Math.max(2.5, k * 0.18)} />
      ))}
      <path d={`M ${cx - 0.42 * bw} ${by} L ${cx + 0.38 * bw} ${by - legH} M ${cx + 0.42 * bw} ${by} L ${cx - 0.38 * bw} ${by - legH}`}
        stroke={NYC.iron} strokeWidth={Math.max(1.8, k * 0.1)} />
      {/* 樽 */}
      <path d={`M ${cx - bw / 2} ${by - legH} L ${cx - bw / 2 * 0.94} ${top} L ${cx + bw / 2 * 0.94} ${top} L ${cx + bw / 2} ${by - legH} Z`}
        fill={NYC.wood} stroke={C.ink} strokeWidth={Math.max(2.5, k * 0.2)} strokeLinejoin="round" />
      {/* 板の継ぎ目 */}
      {[-0.28, -0.1, 0.08, 0.26].map((u, i) => (
        <line key={i} x1={cx + u * bw} y1={by - legH} x2={cx + u * bw * 0.96} y2={top}
          stroke={C.ink} strokeWidth={1.4} opacity={0.35} />
      ))}
      {/* 鉄のたが */}
      {[0.22, 0.5, 0.78].map((u, i) => (
        <line key={i} x1={cx - bw / 2 * 0.98} y1={top + bh * u} x2={cx + bw / 2 * 0.98} y2={top + bh * u}
          stroke={NYC.iron} strokeWidth={Math.max(1.8, k * 0.1)} />
      ))}
      {/* とんがり屋根と飾り */}
      <path d={`M ${cx - bw / 2 * 1.04} ${top} L ${cx} ${top - ch} L ${cx + bw / 2 * 1.04} ${top} Z`}
        fill="#6A4E36" stroke={C.ink} strokeWidth={Math.max(2.5, k * 0.2)} strokeLinejoin="round" />
      <line x1={cx} y1={top - ch} x2={cx} y2={top - ch - 0.5 * k} stroke={C.ink} strokeWidth={2.5} />
      <circle cx={cx} cy={top - ch - 0.55 * k} r={Math.max(2.5, k * 0.12)} fill={C.ink} />
    </g>
  );
};

// 1960年ごろの車 (後ろ向き=遠ざかる / 前向き=近づく)。X,Z は路面の位置
const NyCar: React.FC<{
  X: number; Z: number; f: number; body: string; roof?: string; view: "rear" | "front"; taxi?: boolean;
}> = ({ X, Z, f, body, roof, view, taxi }) => {
  const k = nyK(Z);
  const [cx, gy] = nyP(X, 0, Z);
  const sw = Math.max(2.4, k * 0.06);
  const m = (v: number) => v * k; // m → px
  const jig = Math.sin(f / 3 + X) * 0.012 * k;
  return (
    <g transform={`translate(${cx} ${gy + jig})`}>
      <ellipse cx={0} cy={0} rx={m(1.15)} ry={m(0.14)} fill={C.ink} opacity={0.3} />
      {/* タイヤ */}
      <rect x={m(-0.98)} y={m(-0.36)} width={m(0.3)} height={m(0.36)} rx={m(0.06)} fill={C.ink} />
      <rect x={m(0.68)} y={m(-0.36)} width={m(0.3)} height={m(0.36)} rx={m(0.06)} fill={C.ink} />
      {/* 車体の下半分 */}
      <path d={`M ${m(-1.02)} ${m(-0.32)} L ${m(-1.02)} ${m(-0.8)} Q ${m(-1.0)} ${m(-0.9)} ${m(-0.9)} ${m(-0.9)}
              L ${m(0.9)} ${m(-0.9)} Q ${m(1.0)} ${m(-0.9)} ${m(1.02)} ${m(-0.8)} L ${m(1.02)} ${m(-0.32)} Z`}
        fill={body} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      {/* 客室 */}
      <path d={`M ${m(-0.82)} ${m(-0.9)} L ${m(-0.66)} ${m(-1.38)} Q ${m(0)} ${m(-1.46)} ${m(0.66)} ${m(-1.38)} L ${m(0.82)} ${m(-0.9)} Z`}
        fill={roof ?? body} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${m(-0.7)} ${m(-0.96)} L ${m(-0.58)} ${m(-1.3)} L ${m(0.58)} ${m(-1.3)} L ${m(0.7)} ${m(-0.96)} Z`}
        fill={NYC.glass} stroke={C.ink} strokeWidth={sw * 0.7} />
      <path d={`M ${m(-0.4)} ${m(-1.26)} L ${m(-0.52)} ${m(-1.0)}`} stroke={NYC.glassHi} strokeWidth={sw * 1.2} opacity={0.8} />
      {view === "rear" ? (
        <g>
          {/* テールフィン+赤いテールランプ (1960年ごろの形) */}
          <path d={`M ${m(-1.02)} ${m(-0.8)} L ${m(-0.98)} ${m(-1.06)} L ${m(-0.8)} ${m(-0.9)} Z`}
            fill={body} stroke={C.ink} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <path d={`M ${m(1.02)} ${m(-0.8)} L ${m(0.98)} ${m(-1.06)} L ${m(0.8)} ${m(-0.9)} Z`}
            fill={body} stroke={C.ink} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <ellipse cx={m(-0.82)} cy={m(-0.66)} rx={m(0.13)} ry={m(0.09)} fill={KRP.red} stroke={C.ink} strokeWidth={sw * 0.6} />
          <ellipse cx={m(0.82)} cy={m(-0.66)} rx={m(0.13)} ry={m(0.09)} fill={KRP.red} stroke={C.ink} strokeWidth={sw * 0.6} />
          {/* ナンバー (無地) */}
          <rect x={m(-0.2)} y={m(-0.62)} width={m(0.4)} height={m(0.18)} fill={KRP.white} stroke={C.ink} strokeWidth={sw * 0.5} />
        </g>
      ) : (
        <g>
          {/* グリル+丸目4灯 */}
          <rect x={m(-0.62)} y={m(-0.72)} width={m(1.24)} height={m(0.26)} rx={m(0.06)}
            fill={NYC.chrome} stroke={C.ink} strokeWidth={sw * 0.7} />
          {[-0.16, 0, 0.16, 0.32, -0.32, 0.48, -0.48].map((u, i) => (
            <line key={i} x1={m(u)} y1={m(-0.7)} x2={m(u)} y2={m(-0.48)} stroke={C.ink} strokeWidth={sw * 0.35} opacity={0.6} />
          ))}
          {[-0.86, -0.68, 0.68, 0.86].map((u, i) => (
            <circle key={i} cx={m(u)} cy={m(-0.62)} r={m(0.08)} fill="#FFF6D6" stroke={C.ink} strokeWidth={sw * 0.5} />
          ))}
        </g>
      )}
      {/* クロームのバンパー */}
      <rect x={m(-1.08)} y={m(-0.42)} width={m(2.16)} height={m(0.12)} rx={m(0.05)}
        fill={NYC.chrome} stroke={C.ink} strokeWidth={sw * 0.7} />
      {taxi && (
        <g>
          {/* 屋根のあんどん (無地) と市松の帯 */}
          <rect x={m(-0.22)} y={m(-1.58)} width={m(0.44)} height={m(0.16)} rx={m(0.04)}
            fill={KRP.white} stroke={C.ink} strokeWidth={sw * 0.6} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={m(-1.0 + i * 0.2)} y={m(i % 2 ? -0.86 : -0.8)} width={m(0.1)} height={m(0.06)} fill={C.ink} />
          ))}
        </g>
      )}
    </g>
  );
};

// 帽子をかぶった人 (Person と同じ変換の入れ物の中で帽子を描く)
const NyWalker: React.FC<{
  x: number; y: number; s: number; f: number; phase: number;
  cloth: string; clothDark: string; hat: "fedora" | "pillbox"; hatColor: string;
  face?: "normal" | "smile"; gaze?: [number, number]; paper?: boolean; bag?: string;
}> = ({ x, y, s, f, phase, cloth, clothDark, hat, hatColor, face = "normal", gaze = [0, 0], paper, bag }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const step = Math.sin(f / 4 + phase) * 1.6; // 歩くゆれ
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${step})`}>
      <ellipse cx={0} cy={4} rx={80} ry={16} fill={C.ink} opacity={0.22} />
      <Person x={0} y={0} f={f} phase={phase} still cloth={cloth} clothDark={clothDark}
        hair={hat === "fedora" ? "none" : "cap"} face={face} gaze={gaze} />
      {hat === "fedora" ? (
        <g>
          {/* 中折れ帽: つば (眉より上 y≦-256) + 山 + リボン */}
          <path d="M -86 -262 Q 0 -280 86 -262 Q 90 -254 80 -252 Q 0 -266 -80 -252 Q -90 -254 -86 -262 Z"
            fill={hatColor} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -52 -266 L -46 -318 Q 0 -336 46 -318 L 52 -266 Q 0 -276 -52 -266 Z"
            fill={hatColor} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -50 -282 Q 0 -294 50 -282 L 51 -270 Q 0 -280 -51 -270 Z" fill={C.ink} opacity={0.8} />
          <path d="M -14 -322 Q 0 -310 14 -322" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        </g>
      ) : (
        <g>
          {/* ピルボックス帽 (頭のてっぺんに小さく) */}
          <rect x={-34} y={-318} width={68} height={30} rx={10} fill={hatColor} stroke={C.ink} strokeWidth={5} />
          <path d="M -30 -300 L 30 -300" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
        </g>
      )}
      {paper && (
        <g transform="rotate(-12 72 -110)">
          {/* 小脇の新聞 (文字なし・罫だけ) */}
          <rect x={52} y={-138} width={46} height={70} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          <path d="M 58 -124 L 92 -124 M 58 -112 L 92 -112 M 58 -100 L 84 -100" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
      )}
      {bag && (
        <g>
          <path d="M -86 -96 Q -74 -126 -62 -96" fill="none" stroke={C.ink} strokeWidth={4} />
          <rect x={-96} y={-98} width={44} height={36} rx={8} fill={bag} stroke={C.ink} strokeWidth={4.5} />
        </g>
      )}
    </g>
  );
};

// 遠くの通行人 (PersonMini と同じ変換で小さな帽子を乗せる)
const NyMini: React.FC<{ X: number; Z: number; f: number; phase: number; color: string; hat?: string; dx?: number }> =
  ({ X, Z, f, phase, color, hat, dx = 0 }) => {
    const k = nyK(Z);
    const [x, y] = nyP(X, 0, Z);
    const s = (1.75 * k) / 196;
    const bob = Math.sin((f + phase * 17) / 13) * 3;
    return (
      <g>
        <PersonMini x={x + dx} y={y} s={s} color={color} f={f} phase={phase} face="none" />
        {hat && (
          <g transform={`translate(${x + dx} ${y + bob}) scale(${s})`}>
            <rect x={-46} y={-196} width={92} height={12} rx={6} fill={hat} stroke={C.ink} strokeWidth={5} />
            <rect x={-28} y={-222} width={56} height={30} rx={8} fill={hat} stroke={C.ink} strokeWidth={5} />
          </g>
        )}
      </g>
    );
  };

const Sg153: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.035 * easeOut(clamp01(f / 130));
  const cabZ = 11.5 + f * 0.065;
  const sedZ = 36 - f * 0.13;
  const crossX = f * 1.05;
  // 遠景の摩天楼 (アールデコの段々の頭。実在ビルではない一般形)
  const deco = [
    { X: -230, w: 46, h: 250, tiers: 3, spire: false },
    { X: -120, w: 40, h: 330, tiers: 4, spire: true },
    { X: 20, w: 52, h: 280, tiers: 3, spire: false },
    { X: 150, w: 38, h: 360, tiers: 4, spire: true },
    { X: 270, w: 50, h: 240, tiers: 2, spire: false },
  ];
  const DZ = 700;
  // 旗のなびき: 竿 (右のビルから突き出る) に上辺を通し、下へ垂れて風にゆれる
  const fz = 12.2;
  const fk = nyK(fz);
  const [tipX, tipY] = nyP(10.4, 8.9, fz);
  const [baseX, baseY] = nyP(14, 7.7, fz);
  const flagW = 2.9 * fk;
  const flagH = flagW / 1.9;
  const poleDX = (baseX - tipX);
  const poleDY = (baseY - tipY);
  const plen = Math.hypot(poleDX, poleDY);
  const ux = poleDX / plen, uy = poleDY / plen;
  const fx0 = tipX + ux * 0.12 * fk, fy0 = tipY + uy * 0.12 * fk;
  const FD = (u: number, v: number): [number, number] => {
    const wave = Math.sin(f / 4.5 - u * 5.2) * (0.06 + 0.1 * v) * fk;
    const lift = Math.sin(f / 6 - u * 3) * 0.05 * v * fk;
    return [
      fx0 + ux * u * flagW + wave * 0.9 + v * 0.18 * fk * Math.sin(f / 9),
      fy0 + uy * u * flagW + v * flagH + lift,
    ];
  };
  const flagPoly = (u0: number, u1: number, v0: number, v1: number) => {
    const pts: string[] = [];
    const N = 14;
    for (let i = 0; i <= N; i++) { const p = FD(lerp(u0, u1, i / N), v0); pts.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`); }
    for (let i = N; i >= 0; i--) { const p = FD(lerp(u0, u1, i / N), v1); pts.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`); }
    return pts.join(" ");
  };
  // マーキー (左の奥・映画館)
  const mq = { x0: -14, x1: -10.5, y0: 4.2, y1: 6.1, z0: 23.4, z1: 29.6 };
  const bulbs: React.ReactNode[] = [];
  const nB = 16;
  for (let i = 0; i <= nB; i++) {
    const z = lerp(mq.z0, mq.z1, i / nB);
    [mq.y0 + 0.12, mq.y1 - 0.12].forEach((yy, r) => {
      const [bx, by] = nyP(mq.x1, yy, z);
      const on = (i + r + Math.floor(f / 4)) % 3 === 0;
      bulbs.push(
        <g key={`mb${i}-${r}`}>
          {on && <circle cx={bx} cy={by} r={nyK(z) * 0.16} fill={NYC.marqueeGlow} opacity={0.55} />}
          <circle cx={bx} cy={by} r={Math.max(2, nyK(z) * 0.07)} fill={on ? NYC.marqueeGlow : "#C9B98A"} />
        </g>,
      );
    });
  }
  for (let i = 0; i <= 6; i++) {
    const xx = lerp(mq.x0 + 0.1, mq.x1, i / 6);
    [mq.y0 + 0.12, mq.y1 - 0.12].forEach((yy, r) => {
      const [bx, by] = nyP(xx, yy, mq.z0);
      const on = (i + r + Math.floor(f / 4)) % 3 === 1;
      bulbs.push(
        <g key={`mf${i}-${r}`}>
          {on && <circle cx={bx} cy={by} r={nyK(mq.z0) * 0.16} fill={NYC.marqueeGlow} opacity={0.55} />}
          <circle cx={bx} cy={by} r={Math.max(2, nyK(mq.z0) * 0.07)} fill={on ? NYC.marqueeGlow : "#C9B98A"} />
        </g>,
      );
    });
  }
  // 縦のブレード看板 (正面向き。文字なし・電球の縁取り)
  const [bdL, bdT] = nyP(-14, 15.2, 23.0);
  const [bdR, bdB] = nyP(-11.7, 6.6, 23.0);
  const bdW = bdR - bdL, bdH = bdB - bdT;

  return (
    <Frame f={f} seed={1239}>
      <defs>
        <linearGradient id="ny153sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={NYC.skyTop} />
          <stop offset="1" stopColor={NYC.skyLow} />
        </linearGradient>
      </defs>
      <g transform={zoomAt(cam, 960, 470)}>
        {/* 空 */}
        <rect x={-40} y={-40} width={W + 80} height={560} fill="url(#ny153sky)" />
        {[[380, 120, 1], [1250, 70, 0.8], [880, 300, 0.6]].map(([cx2, cy2, sc], i) => (
          <g key={i} transform={`translate(${(cx2 as number) + ((f * (0.5 + i * 0.2)) % 200) - 40} ${cy2}) scale(${sc})`} opacity={0.9}>
            <path d="M -110 18 q 8 -38 52 -32 q 14 -36 64 -28 q 34 -22 58 10 q 42 -6 44 28 l -218 22 z"
              fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 遠景の摩天楼 (かすむ) */}
        {deco.map((d, i) => {
          const k = nyK(DZ);
          const [cx2] = nyP(d.X, 0, DZ);
          const [, gy] = nyP(d.X, 0, DZ);
          const w = d.w * k, h = d.h * k;
          const parts: React.ReactNode[] = [];
          let yTop = gy - h;
          parts.push(<rect key="b" x={cx2 - w / 2} y={yTop} width={w} height={h} />);
          for (let t = 1; t <= d.tiers; t++) {
            const tw = w * (1 - t * 0.2);
            const th = h * 0.07;
            parts.push(<rect key={`t${t}`} x={cx2 - tw / 2} y={yTop - th} width={tw} height={th} />);
            yTop -= th;
          }
          return (
            <g key={i} fill={NYC.deco} stroke={C.ink} strokeWidth={2.5} opacity={0.75}>
              {parts}
              {d.spire && <path d={`M ${cx2 - w * 0.08} ${yTop} L ${cx2} ${yTop - h * 0.16} L ${cx2 + w * 0.08} ${yTop} Z`} />}
              {/* 縦の筋 (アールデコの柱型) */}
              {[-0.25, 0, 0.25].map((u, j) => (
                <line key={j} x1={cx2 + u * w} y1={gy - h + 6} x2={cx2 + u * w} y2={gy} strokeWidth={1.5} opacity={0.5} />
              ))}
            </g>
          );
        })}
        {/* 路面 (車道・歩道・縁石) */}
        <polygon points={nyPts([-60, 0, 3.4], [60, 0, 3.4], [60, 0, 3000], [-60, 0, 3000])} fill={NYC.sidewalk} />
        <polygon points={nyPts([-10, 0, 3.4], [10, 0, 3.4], [10, 0, 3000], [-10, 0, 3000])} fill={NYC.road} />
        <polygon points={nyPts([-10, 0, 40], [10, 0, 40], [10, 0, 3000], [-10, 0, 3000])} fill={NYC.roadFar} opacity={0.5} />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <line {...nyLine([sd * 10, 0, 3.4], [sd * 10, 0, 3000])} stroke={NYC.curb} strokeWidth={6} />
            <line {...nyLine([sd * 10, 0, 3.4], [sd * 10, 0, 3000])} stroke={C.ink} strokeWidth={2} opacity={0.6} />
            {/* 歩道の目地 */}
            {Array.from({ length: 12 }, (_, i) => {
              const z = 6 + i * 2.6;
              return <line key={i} {...nyLine([sd * 10, 0, z], [sd * 14, 0, z])} stroke={C.ink} strokeWidth={1.5} opacity={0.3} />;
            })}
          </g>
        ))}
        {/* 車線の破線 */}
        {[-3.6, 3.6].map((lx) => (
          <g key={lx}>
            {Array.from({ length: 14 }, (_, i) => {
              const z = 7 + i * 4.5;
              return <polygon key={i} points={nyPts([lx - 0.08, 0, z], [lx + 0.08, 0, z], [lx + 0.08, 0, z + 2], [lx - 0.08, 0, z + 2])}
                fill={KRP.white} opacity={0.8} />;
            })}
          </g>
        ))}
        <polygon points={nyPts([-0.18, 0, 6], [0.18, 0, 6], [0.18, 0, 3000], [-0.18, 0, 3000])} fill={KRP.yellow} opacity={0.85} />
        {/* 横断歩道 (1960年ごろの2本線) */}
        {[7.0, 9.6].map((z) => (
          <polygon key={z} points={nyPts([-10, 0, z], [10, 0, z], [10, 0, z + 0.35], [-10, 0, z + 0.35])}
            fill={KRP.white} opacity={0.92} />
        ))}

        {/* ===== 右側のビル (奥から) ===== */}
        <NyBuilding s={1} za={100} zb={220} h={55} wall={NYC.stone2} trim={NYC.lime} seed={11} shadeSide haze={0.62} />
        <NyBuilding s={1} za={58} zb={100} h={36} wall={NYC.stone} trim={NYC.lime} seed={12} shadeSide haze={0.4} />
        <NyBuilding s={1} za={38} zb={58} h={24} wall="#9C8C7C" trim={NYC.lime} seed={13} shadeSide haze={0.22} />
        <NyWaterTower X={15.6} Y={13} Z={31} />
        <NyBuilding s={1} za={24} zb={38} h={13} wall={NYC.brick} trim={NYC.lime} seed={14} shadeSide haze={0.08} ground="#5E4A3E" />
        <NyFireEscape s={1} z1={27} z2={33.5} levels={[3.4, 6.6, 9.8]} />
        {/* ===== 左側のビル (奥から) ===== */}
        <NyBuilding s={-1} za={130} zb={260} h={60} wall={NYC.stone2} trim={NYC.lime} seed={21} haze={0.62} />
        <NyBuilding s={-1} za={75} zb={130} h={44} wall="#B3A895" trim={NYC.lime} seed={22} haze={0.42} />
        <NyBuilding s={-1} za={48} zb={75} h={30} wall={NYC.stone} trim={NYC.lime} seed={23} haze={0.28} />
        <NyWaterTower X={-15.8} Y={20} Z={40} />
        <NyBuilding s={-1} za={33} zb={48} h={20} wall={NYC.brickBrown} trim={NYC.lime} seed={24} haze={0.14} ground="#5E4A3E" />
        <NyBuilding s={-1} za={22} zb={33} h={15} wall={NYC.lime} trim={NYC.limeDark} seed={25} haze={0.05} ground="#7A2E2E" />
        {/* 映画館: ポスターの額 (無地) */}
        {[24.6, 26.4, 28.2].map((z, i) => (
          <polygon key={i} points={nyPts([-14, 0.9, z], [-14, 0.9, z + 1.1], [-14, 2.6, z + 1.1], [-14, 2.6, z])}
            fill={[KRP.yellow, KRP.blueSoft, KRP.orange][i]} stroke={C.ink} strokeWidth={2.5} />
        ))}
        {/* 縦のブレード看板 (文字なし) */}
        <g>
          <rect x={bdL} y={bdT} width={bdW} height={bdH} rx={4} fill={SGP.curtain} stroke={C.ink} strokeWidth={4} />
          <rect x={bdL + bdW * 0.22} y={bdT + bdH * 0.06} width={bdW * 0.56} height={bdH * 0.88} rx={3}
            fill={NYC.marqueeGlow} opacity={0.85} stroke={C.ink} strokeWidth={2} />
          {Array.from({ length: 14 }, (_, i) => {
            const on = (i + Math.floor(f / 4)) % 3 === 0;
            const yy = bdT + bdH * (0.04 + (i / 13) * 0.92);
            return (
              <g key={i}>
                <circle cx={bdL + bdW * 0.11} cy={yy} r={2.8} fill={on ? NYC.marqueeGlow : "#C9B98A"} />
                <circle cx={bdR - bdW * 0.11} cy={yy} r={2.8} fill={on ? NYC.marqueeGlow : "#C9B98A"} />
              </g>
            );
          })}
          {[0.25, 0.5, 0.75].map((u, i) => (
            <path key={i} transform={`translate(${bdL + bdW / 2} ${bdT + bdH * u}) scale(${bdW / 90})`}
              d="M 0 -14 L 4 -4 L 14 -4 L 6 3 L 9 13 L 0 7 L -9 13 L -6 3 L -14 -4 L -4 -4 Z"
              fill={SGP.curtain} opacity={0.85} />
          ))}
        </g>
        {/* マーキー (ひさし看板。裏の照明・無地の帯・走る電球) */}
        <polygon points={nyPts([mq.x0, mq.y0, mq.z0], [mq.x1, mq.y0, mq.z0], [mq.x1, mq.y0, mq.z1], [mq.x0, mq.y0, mq.z1])}
          fill={NYC.marqueeGlow} opacity={0.9} stroke={C.ink} strokeWidth={3} />
        <polygon points={nyPts([mq.x1, mq.y0, mq.z0], [mq.x1, mq.y0, mq.z1], [mq.x1, mq.y1, mq.z1], [mq.x1, mq.y1, mq.z0])}
          fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        <polygon points={nyPts([mq.x1, mq.y0 + 0.45, mq.z0 + 0.3], [mq.x1, mq.y0 + 0.45, mq.z1 - 0.3], [mq.x1, mq.y1 - 0.45, mq.z1 - 0.3], [mq.x1, mq.y1 - 0.45, mq.z0 + 0.3])}
          fill={NYC.marqueeGlow} opacity={0.6} />
        <polygon points={nyPts([mq.x0, mq.y0, mq.z0], [mq.x1, mq.y0, mq.z0], [mq.x1, mq.y1, mq.z0], [mq.x0, mq.y1, mq.z0])}
          fill={SGP.curtain} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        {bulbs}
        {/* マーキーの下に並ぶ人 */}
        <NyMini X={-12.6} Z={27.5} f={f} phase={3} color="#5A6A7E" hat="#4A4038" />
        <NyMini X={-12.2} Z={29.2} f={f} phase={5} color="#9A6A4A" />
        <NyMini X={-12.8} Z={31} f={f} phase={7} color="#6E7B5E" hat="#3E3A36" />

        <NyBuilding s={-1} za={9.5} zb={22} h={24} wall={NYC.brick} trim={NYC.lime} seed={26} ground="#4E6B58" shop />
        {/* 1階の店の日よけ (緑と白のしま) */}
        {Array.from({ length: 11 }, (_, i) => {
          const z0 = 10.2 + i * 1.0;
          return (
            <polygon key={i} points={nyPts([-14, 3.0, z0], [-12.5, 2.5, z0], [-12.5, 2.5, z0 + 1.0], [-14, 3.0, z0 + 1.0])}
              fill={i % 2 ? KRP.white : NYC.awnG} />
          );
        })}
        <polygon points={nyPts([-14, 3.0, 10.2], [-12.5, 2.5, 10.2], [-12.5, 2.5, 21.2], [-14, 3.0, 21.2])}
          fill="none" stroke={C.ink} strokeWidth={3} />
        <polygon points={nyPts([-12.5, 2.5, 10.2], [-12.5, 2.5, 21.2], [-12.5, 2.15, 21.2], [-12.5, 2.15, 10.2])}
          fill={NYC.awnG} stroke={C.ink} strokeWidth={3} />
        <NyFireEscape s={-1} z1={12.6} z2={19.2} levels={[4.6, 7.8, 11.0, 14.2, 17.4, 20.6]} />

        <NyBuilding s={1} za={9.5} zb={24} h={30} wall={NYC.lime} trim={NYC.limeDark} seed={27} shadeSide floorH={3.4} ground="#7D6A55" shop />
        {/* 床屋のサインポール (しまが f で回る) */}
        {(() => {
          const z = 13.6;
          const k = nyK(z);
          const [l, t] = nyP(13.0, 2.7, z);
          const [r, b] = nyP(13.6, 0.9, z);
          const w = r - l, hh = b - t;
          return (
            <g>
              <defs>
                <clipPath id="ny153pole"><rect x={l} y={t} width={w} height={hh} rx={w / 2} /></clipPath>
              </defs>
              <rect x={l} y={t} width={w} height={hh} rx={w / 2} fill={KRP.white} />
              <g clipPath="url(#ny153pole)">
                {Array.from({ length: 9 }, (_, i) => {
                  const yy = t - w + ((i * w * 0.9 + f * 1.6) % (w * 0.9 * 9));
                  return <path key={i} d={`M ${l - 4} ${yy + w * 0.6} L ${r + 4} ${yy} L ${r + 4} ${yy + w * 0.3} L ${l - 4} ${yy + w * 0.9} Z`}
                    fill={i % 2 ? KRP.red : NYC.flagBlue} />;
                })}
              </g>
              <rect x={l} y={t} width={w} height={hh} rx={w / 2} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={l + w / 2} cy={t - 0.12 * k} r={w * 0.55} fill={NYC.chrome} stroke={C.ink} strokeWidth={3.5} />
              <circle cx={l + w / 2} cy={b + 0.1 * k} r={w * 0.5} fill={NYC.chrome} stroke={C.ink} strokeWidth={3.5} />
            </g>
          );
        })()}

        {/* 新聞スタンド (左の歩道) */}
        {(() => {
          const z = 13.2;
          const [l, tY] = nyP(-13.9, 2.7, z);
          const [r, bY] = nyP(-11.6, 0, z);
          const w = r - l, hh = bY - tY;
          return (
            <g>
              <polygon points={nyPts([-11.6, 0, z], [-11.6, 0, z + 2.2], [-11.6, 2.5, z + 2.2], [-11.6, 2.5, z])}
                fill="#5C6E58" stroke={C.ink} strokeWidth={3} />
              <rect x={l} y={tY} width={w} height={hh} fill="#6E8468" stroke={C.ink} strokeWidth={4} />
              <rect x={l - w * 0.06} y={tY - hh * 0.08} width={w * 1.12} height={hh * 0.12} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
              {/* 雑誌 (色の札だけ) */}
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x={l + w * (0.08 + (i % 4) * 0.22)} y={tY + hh * (0.18 + Math.floor(i / 4) * 0.24)}
                  width={w * 0.17} height={hh * 0.2}
                  fill={[KRP.yellow, KRP.blueSoft, KRP.white, KRP.orange, KRP.green, KRP.white, KRP.red, KRP.blueSoft][i]}
                  stroke={C.ink} strokeWidth={2} />
              ))}
              {/* 新聞の束 */}
              <rect x={l + w * 0.1} y={tY + hh * 0.7} width={w * 0.8} height={hh * 0.24} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
              {[0.76, 0.82, 0.88].map((v, i) => (
                <line key={i} x1={l + w * 0.14} y1={tY + hh * v} x2={l + w * 0.86} y2={tY + hh * v} stroke={C.ink} strokeWidth={1.5} opacity={0.4} />
              ))}
            </g>
          );
        })()}
        <NyMini X={-10.7} Z={15.4} f={f} phase={2} color="#5A5048" hat="#3E3A36" />

        {/* 右の歩道の人 */}
        <NyMini X={12.0} Z={17} f={f} phase={4} color="#7A6E62" hat="#4A4038" dx={-((f * 0.4) % 30)} />
        <NyMini X={11.6} Z={26} f={f} phase={6} color="#3F5A7A" />
        <NyMini X={-12.0} Z={20} f={f} phase={8} color="#A57D5A" hat="#5A4A3A" />

        {/* 星条旗: 右のビルから突き出た竿 */}
        <g>
          <line x1={baseX} y1={baseY} x2={tipX} y2={tipY} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={baseX} y1={baseY} x2={tipX} y2={tipY} stroke={KRP.brass} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
          {/* 13本の縞 (赤7・白6) */}
          {Array.from({ length: 13 }, (_, i) => (
            <polygon key={i} points={flagPoly(0, 1, i / 13, (i + 1) / 13)}
              fill={i % 2 === 0 ? NYC.flagRed : KRP.white} />
          ))}
          {/* カントン (青) と細かい星の点 (数えられない密度) */}
          <polygon points={flagPoly(0, 0.4, 0, 7 / 13)} fill={NYC.flagBlue} />
          {Array.from({ length: 9 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
            const u = 0.025 + (c + (r % 2) * 0.5) * 0.0335;
            const v = 0.035 + r * 0.055;
            if (u > 0.385) return null;
            const [sx, sy] = FD(u, v);
            return <circle key={`${r}-${c}`} cx={sx} cy={sy} r={1.25} fill={KRP.white} opacity={0.9} />;
          }))}
          {/* なびきの陰影 */}
          {Array.from({ length: 8 }, (_, i) => {
            const u0 = i / 8, u1 = (i + 1) / 8;
            const sh = Math.sin(f / 4.5 - (u0 + u1) * 2.6);
            return <polygon key={i} points={flagPoly(u0, u1, 0, 1)} fill={sh > 0 ? KRP.white : C.ink}
              opacity={Math.abs(sh) * 0.13} />;
          })}
          <polygon points={flagPoly(0, 1, 0, 1)} fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={tipX} cy={tipY} r={7} fill={KRP.brass} stroke={C.ink} strokeWidth={3.5} />
        </g>

        {/* マンホールの湯気 */}
        {(() => {
          const [mx, my] = nyP(2.0, 0, 26);
          const k = nyK(26) * 1.4; // 遠いので湯気は少し大きめに
          return (
            <g>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const t = ((f * 0.9 + i * 15) % 90) / 90;
                return (
                  <ellipse key={i} cx={mx + Math.sin(f / 9 + i * 1.7) * 12 + t * 34} cy={my - t * 3.0 * k}
                    rx={(0.25 + t * 0.75) * k} ry={(0.18 + t * 0.4) * k} fill={KRP.white} opacity={(1 - t) * 0.32} />
                );
              })}
              <ellipse cx={mx} cy={my} rx={0.45 * k} ry={0.1 * k} fill={C.ink} opacity={0.7} />
            </g>
          );
        })()}
        {/* 遠くの車 */}
        <NyCar X={3.6} Z={60} f={f} body={KRP.yellow} view="rear" taxi />
        <NyCar X={-3.6} Z={52} f={f} body="#E6E2D6" roof={NYC.maroon} view="front" />
        <NyCar X={8.6} Z={21} f={f} body={NYC.maroon} view="rear" />
        {/* 手前へ来るセダン (2トーン) と、奥へ走るイエローキャブ */}
        <NyCar X={-3.7} Z={sedZ} f={f} body={NYC.teal} roof={KRP.white} view="front" />
        <NyCar X={3.6} Z={cabZ} f={f} body={KRP.yellow} view="rear" taxi />

        {/* 街灯 (左の歩道。かぎ形の腕)+信号 */}
        {(() => {
          const z = 10.4;
          const k = nyK(z);
          const [px, py] = nyP(-10.7, 0, z);
          const [, topY] = nyP(-10.7, 8.2, z);
          const [ax, ay] = nyP(-9.2, 7.4, z);
          const red = Math.floor(f / 30) % 2 === 0;
          return (
            <g>
              <rect x={px - 0.12 * k} y={topY} width={0.24 * k} height={py - topY} fill={NYC.lampGreen} stroke={C.ink} strokeWidth={4} />
              <rect x={px - 0.22 * k} y={py - 1.0 * k} width={0.44 * k} height={1.0 * k} rx={6} fill={NYC.lampGreen} stroke={C.ink} strokeWidth={4} />
              <path d={`M ${px} ${topY + 6} Q ${px + 0.2 * k} ${topY - 0.9 * k} ${ax} ${ay - 0.2 * k}`}
                fill="none" stroke={NYC.lampGreen} strokeWidth={10} />
              <path d={`M ${px} ${topY + 6} Q ${px + 0.2 * k} ${topY - 0.9 * k} ${ax} ${ay - 0.2 * k}`}
                fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.7} />
              <path d={`M ${ax - 0.32 * k} ${ay} L ${ax + 0.32 * k} ${ay} L ${ax + 0.2 * k} ${ay + 0.5 * k} L ${ax - 0.2 * k} ${ay + 0.5 * k} Z`}
                fill={NYC.marqueeGlow} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d={`M ${ax - 0.4 * k} ${ay} L ${ax} ${ay - 0.3 * k} L ${ax + 0.4 * k} ${ay} Z`}
                fill={NYC.lampGreen} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              {/* 信号 */}
              <g transform={`translate(${px + 0.12 * k} ${py - 4.6 * k})`}>
                <rect x={0} y={0} width={0.5 * k} height={1.3 * k} rx={6} fill="#C9A23A" stroke={C.ink} strokeWidth={4} />
                <circle cx={0.25 * k} cy={0.32 * k} r={0.15 * k} fill={KRP.red} opacity={red ? 1 : 0.25} stroke={C.ink} strokeWidth={2.5} />
                <circle cx={0.25 * k} cy={0.95 * k} r={0.15 * k} fill={KRP.green} opacity={red ? 0.25 : 1} stroke={C.ink} strokeWidth={2.5} />
              </g>
            </g>
          );
        })()}
        {/* 消火栓 (右の歩道) */}
        {(() => {
          const z = 9.8;
          const k = nyK(z);
          const [hx, hy] = nyP(11, 0, z);
          return (
            <g transform={`translate(${hx} ${hy}) scale(${k / 60})`}>
              <ellipse cx={0} cy={2} rx={34} ry={8} fill={C.ink} opacity={0.25} />
              <rect x={-18} y={-50} width={36} height={52} rx={8} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
              <path d="M -22 -50 Q 0 -78 22 -50 Z" fill={KRP.red} stroke={C.ink} strokeWidth={5} />
              <rect x={-30} y={-36} width={12} height={16} rx={4} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
              <rect x={18} y={-36} width={12} height={16} rx={4} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
            </g>
          );
        })()}

        {/* 横断歩道を渡る3人 (帽子とスーツの1960年) */}
        <NyWalker x={600 + crossX} y={758} s={0.52} f={f} phase={1} cloth="#6E7480" clothDark="#4E545E"
          hat="fedora" hatColor="#5A4E44" gaze={[2, 0]} paper />
        <NyWalker x={760 + crossX * 0.95} y={762} s={0.5} f={f} phase={3} cloth="#D98F7A" clothDark="#B26B58"
          hat="pillbox" hatColor="#7FA3C9" face="smile" gaze={[2, 0]} bag={NYC.flagBlue} />
        <NyWalker x={1330 - crossX * 0.9} y={752} s={0.49} f={f} phase={5} cloth="#C9B48A" clothDark="#9E8A64"
          hat="fedora" hatColor="#3E4652" gaze={[-2, 0]} />
        {/* 鳩 (手前の路面) */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${430 + i * 70 + Math.sin(f / 5 + i * 3) * 4} ${800 - Math.abs(Math.sin(f / 5 + i)) * 8})`}>
            <ellipse cx={0} cy={0} rx={18} ry={12} fill={KRP.gray} stroke={C.ink} strokeWidth={3.5} />
            <circle cx={15} cy={-8} r={7.5} fill={KRP.gray} stroke={C.ink} strokeWidth={3} />
            <path d="M 21 -8 L 29 -6 L 21 -3 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={2} />
          </g>
        ))}
      </g>
      {/* 年号札 */}
      <TagPlate x={960} y={150} text="1960年6月16日" size={46} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #154 アルフレッド・ヒッチコック監督の新作「サイコ」が、公開されます。
// 格: 並 / seed 1240
// 絵: 「PSYCHO」の看板がクレーンで掲げられる。作業員が縄を引く。下から見上げる構図
// どこ: 劇場の壁の前。下から見上げる構図 (ローアングル)
// 演出: 「PSYCHO」の看板がクレーンで吊り上げられる。作業員が縄を引く
// 動き: 看板が上がる+微回転 / 滑車と縄 / 作業員2人が引く / 親方が見上げる / 鳥
const Sg154: React.FC<{ f: number }> = ({ f }) => {
  const sy = lerp(690, 340, easeOut(seg(f, 6, 40)));
  const rot = Math.sin(f / 11) * 2;
  return (
    <Frame f={f} seed={1240}>
      {/* 見上げた空 */}
      <rect x={0} y={0} width={W} height={H} fill={KRP.blueSoft} opacity={0.55} />
      {[[360, 150], [1420, 100]].map(([cx2, cy2], i) => (
        <g key={i} transform={`translate(${(cx2 as number) + Math.sin(f / 15 + i * 2) * 10} ${cy2})`} opacity={0.85}>
          <ellipse cx={0} cy={0} rx={96} ry={34} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={-58} cy={12} rx={50} ry={24} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 鳥 */}
      {[0, 1].map((i) => (
        <path key={i}
          d={`M ${520 + i * 160 + f * 2} ${90 + i * 46 + Math.sin(f / 6 + i) * 8}
              q 13 ${-11 - Math.sin(f / 4 + i) * 4} 26 0 q 13 ${-11 - Math.sin(f / 4 + i) * 4} 26 0`}
          fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* 左右からそびえる壁 (ローアングルのパース) */}
      <g>
        <path d="M 0 1080 L 0 160 L 340 400 L 340 1080 Z" fill={C.brick} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={0} y1={240 + i * 120} x2={340} y2={450 + i * 92}
            stroke={C.brickDark} strokeWidth={3.5} opacity={0.6} />
        ))}
        <path d="M 1920 1080 L 1920 120 L 1600 380 L 1600 1080 Z" fill={C.brickDark} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={1920} y1={210 + i * 124} x2={1600} y2={430 + i * 94}
            stroke={C.brick} strokeWidth={3.5} opacity={0.5} />
        ))}
        {/* 右壁の窓 */}
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M ${1660 + i * 10} ${500 + i * 120} l 70 ${-16} l 0 64 l -70 14 Z`}
            fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} opacity={0.8} />
        ))}
      </g>
      {/* 正面壁とマーキーの上端 (画面下) */}
      <rect x={340} y={930} width={1260} height={150} fill={C.brick} stroke={C.ink} strokeWidth={7} />
      <rect x={380} y={900} width={1180} height={44} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
      <BulbRow x={430} y={922} w={1080} n={13} f={f} r={8} />
      {/* クレーンのブーム (右上から) */}
      <g>
        <line x1={1880} y1={120} x2={1180} y2={215} stroke={C.ink} strokeWidth={10} />
        <line x1={1880} y1={160} x2={1180} y2={235} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={1860 - i * 88} y1={124 + i * 12} x2={1820 - i * 88} y2={168 + i * 10}
            stroke={C.ink} strokeWidth={4.5} />
        ))}
        {/* 滑車 */}
        <g transform={`translate(1180 230) rotate(${-f * 9})`}>
          <circle r={26} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
          <line x1={-26} y1={0} x2={26} y2={0} stroke={C.ink} strokeWidth={4} />
          <line x1={0} y1={-26} x2={0} y2={26} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 吊り索: 滑車 → 看板 */}
        <line x1={1180} y1={252} x2={1100} y2={sy - 112} stroke={C.ink} strokeWidth={6} />
        <line x1={1180} y1={252} x2={820} y2={sy - 112} stroke={C.ink} strokeWidth={6} />
        {/* 引き縄: 滑車 → 作業員の手元 */}
        <path d={`M 1200 246 Q 1300 ${600 + Math.sin(f / 6) * 10} 520 ${920 + Math.sin(f / 6) * 4}`}
          fill="none" stroke={KRP.bronze} strokeWidth={8} />
      </g>
      {/* PSYCHO 看板 */}
      <g transform={`translate(960 ${sy}) rotate(${rot})`}>
        <rect x={-330} y={-118} width={660} height={236} rx={14}
          fill={C.navy} stroke={C.ink} strokeWidth={9} />
        <rect x={-310} y={-98} width={620} height={196} rx={10}
          fill="none" stroke={SGP.lampGold} strokeWidth={4} opacity={0.8} />
        <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={104} fill={KRP.white} letterSpacing={14}>PSYCHO</text>
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={-294 + i * 84} cy={-98} r={8}
            fill={((i + Math.floor(f / 6)) % 3) === 0 ? SGP.lampGold : KRP.grayDark}
            stroke={C.ink} strokeWidth={3} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={-294 + i * 84} cy={98} r={8}
            fill={((i + 1 + Math.floor(f / 6)) % 3) === 0 ? SGP.lampGold : KRP.grayDark}
            stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 吊り金具 */}
        <path d="M -140 -118 L -140 -142 M 140 -118 L 140 -142" stroke={C.ink} strokeWidth={7} />
        <line x1={-140} y1={-142} x2={140} y2={-142} stroke={C.ink} strokeWidth={7} />
      </g>
      {/* 縄を引く作業員2人 (左下) */}
      {[[420, 0], [560, 1]].map(([wx2, ph], i) => (
        <g key={i}>
          <ellipse cx={wx2 as number} cy={1056} rx={66} ry={13} fill={C.ink} opacity={0.2} />
          <Person x={wx2 as number} y={1050} s={0.72} cloth={KRP.bronze} clothDark={C.brickDark}
            helmet lean={-16 - Math.sin(f / 6 + (ph as number) * 2) * 3}
            face="normal" gaze={[6, -4]} f={f} pose="hold" still />
        </g>
      ))}
      {/* 親方 (見上げて腕を上げる) */}
      <g>
        <ellipse cx={1430} cy={1060} rx={62} ry={13} fill={C.ink} opacity={0.2} />
        <Person x={1430} y={1054} s={0.68} cloth={KRP.grayDark} clothDark={C.ink}
          helmet face="smile" gaze={[-4, -7]} f={f} pose="raise" still />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #155 この映画には、公開前から、奇妙な条件がついていました。
// 格: 図 / seed 1241
// 絵: 配給契約書。条項の一つに虫眼鏡が寄る。「第◯条…」の但し書きが影になっている
// どこ: 配給会社の机の上。緑の下敷き・ランプの光だまり・小物
// 演出: 契約書の条項に虫眼鏡がすっと寄る。但し書きは影の中
// 動き: 虫眼鏡が右から滑り込む+上下にゆれ / レンズの光 / コーヒーの湯気 / 影のゆらぎ
const Sg155: React.FC<{ f: number }> = ({ f }) => {
  const gx = lerp(1700, 680, easeOut(seg(f, 8, 30)));
  const gy = 630 + Math.sin(f / 9) * 8;
  return (
    <Frame f={f} seed={1241}>
      {/* 机 */}
      <rect x={0} y={0} width={W} height={H} fill={SGP.woodDark} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={0} y1={i * 200} x2={W} y2={i * 200 + 40}
          stroke={C.ink} strokeWidth={3} opacity={0.18} />
      ))}
      {/* 緑の下敷き */}
      <rect x={110} y={90} width={1700} height={900} rx={26} fill={C.blotter} stroke={C.ink} strokeWidth={8} />
      <rect x={140} y={120} width={1640} height={840} rx={18} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.3} />
      {/* ランプの光だまり */}
      <ellipse cx={820} cy={520} rx={760} ry={470} fill={SGP.lampGold}
        opacity={0.13 + Math.sin(f / 10) * 0.03} />
      {/* 契約書 */}
      <g transform="translate(560 560) rotate(-3) scale(0.92)">
        <ContractPaper f={f} revealT={0} frameT={0} />
      </g>
      {/* 小物: 万年筆・インク壺・コーヒー・封筒・フィルムリール */}
      <g transform="translate(1210 220) rotate(24)">
        <rect x={-120} y={-13} width={240} height={26} rx={13} fill={C.nightDeep} stroke={C.ink} strokeWidth={5} />
        <path d="M 120 -8 L 160 0 L 120 8 Z" fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
        <rect x={-20} y={-13} width={16} height={26} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
      </g>
      <g transform="translate(1420 300)">
        <rect x={-42} y={-30} width={84} height={64} rx={10} fill={C.nightDeep} stroke={C.ink} strokeWidth={6} />
        <rect x={-22} y={-50} width={44} height={24} rx={6} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
      </g>
      <g transform="translate(1620 850)">
        <ellipse cx={0} cy={56} rx={92} ry={18} fill={C.ink} opacity={0.2} />
        <path d="M -64 -20 L -52 52 L 52 52 L 64 -20 Z" fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-20} rx={64} ry={18} fill="#6B4A32" stroke={C.ink} strokeWidth={5} />
        <path d="M 64 0 Q 102 6 92 34 Q 86 50 58 44" fill="none" stroke={C.ink} strokeWidth={6} />
        {[0, 1].map((i) => (
          <path key={i}
            d={`M ${-16 + i * 30} ${-40 - ((f * 1.6 + i * 24) % 48)}
                q ${8 + Math.sin(f / 6 + i) * 4} -14 0 -28`}
            fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round"
            opacity={0.6 - ((f * 1.6 + i * 24) % 48) / 110} />
        ))}
      </g>
      <g transform="translate(290 900) rotate(-8)">
        <rect x={-130} y={-74} width={260} height={148} rx={8} fill={KRP.cream} stroke={C.ink} strokeWidth={6} />
        <path d="M -130 -74 L 0 10 L 130 -74" fill="none" stroke={C.ink} strokeWidth={5} />
        <circle cx={92} cy={-40} r={20} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.7} />
      </g>
      <g transform={`translate(1680 180) rotate(${f * 0.5})`}>
        <circle r={78} fill={KRP.grayDark} stroke={C.ink} strokeWidth={6} />
        <circle r={22} fill={C.nightDeep} stroke={C.ink} strokeWidth={5} />
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={48 * Math.cos((a * Math.PI) / 180)} cy={48 * Math.sin((a * Math.PI) / 180)}
            r={13} fill={C.nightDeep} stroke={C.ink} strokeWidth={3.5} />
        ))}
      </g>
      {/* 虫眼鏡 (条項ブロックへ寄る) */}
      <g transform={`translate(${gx} ${gy})`}>
        <ellipse cx={30} cy={180} rx={150} ry={26} fill={C.ink} opacity={0.18} />
        {/* 柄 */}
        <g transform="rotate(38)">
          <rect x={150} y={-26} width={240} height={52} rx={26} fill="#6B4A32" stroke={C.ink} strokeWidth={7} />
          <rect x={132} y={-30} width={40} height={60} rx={10} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
        </g>
        {/* レンズ */}
        <circle r={170} fill={KRP.white} opacity={0.35} />
        <circle r={170} fill="none" stroke={KRP.brass} strokeWidth={22} />
        <circle r={170} fill="none" stroke={C.ink} strokeWidth={6} />
        <circle r={148} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
        {/* レンズ内の拡大された文字列 (ぐにゃ線) */}
        <g clipPath="url(#sg155lens)">
          <g stroke={C.ink} strokeWidth={9} opacity={0.75} strokeLinecap="round" fill="none">
            {[-70, -20, 36, 86].map((ry, i) => (
              <path key={ry} d={`M -140 ${ry} q 36 ${i % 2 ? 7 : -7} 80 0 t 95 0 t 90 0`} />
            ))}
          </g>
          <line x1={-130} y1={60} x2={lerp(-130, 120, clamp01(seg(f, 26, 40)))} y2={60}
            stroke={KRP.red} strokeWidth={8} opacity={0.85} />
        </g>
        <defs>
          <clipPath id="sg155lens"><circle r={148} /></clipPath>
        </defs>
        {/* 光の反射 */}
        <path d={`M -110 -70 Q -60 -126 10 -120`} fill="none" stroke={KRP.white}
          strokeWidth={14} strokeLinecap="round" opacity={0.5 + Math.sin(f / 7) * 0.2} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #156 「上映が始まったら、誰も、入場させないこと」。
// 格: 図 / seed 1242
// 絵: 条文の大写し (連番)。赤枠で「上映開始後、入場禁止」。判が押される
// どこ: #155と同じ机。カメラだけ条項ブロックへ大きく寄る (連番)
// 演出: 条文が現れ 赤枠が走り 判がドンと押される
// 動き: 文字の reveal / 赤枠 pop / 手が降りて判を押す+画面シェイク / 衝撃線
const Sg156: React.FC<{ f: number }> = ({ f }) => {
  const sh = f > 29 && f < 37 ? Math.sin(f * 2.7) * 5 * (1 - (f - 30) / 7) : 0;
  const handT = easeOut(seg(f, 22, 30));
  const liftT = easeOut(seg(f, 33, 41));
  const sealT = seg(f, 32, 38);
  return (
    <Frame f={f} seed={1242}>
      {/* 机 (寄りなので木目を大きく) */}
      <rect x={0} y={0} width={W} height={H} fill={SGP.woodDark} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M 0 ${i * 260} q 500 ${i % 2 ? 50 : -40} 1000 0 t 920 ${i % 2 ? 30 : -24}`}
          fill="none" stroke={C.ink} strokeWidth={5} opacity={0.16} />
      ))}
      <ellipse cx={960} cy={520} rx={900} ry={520} fill={SGP.lampGold}
        opacity={0.1 + Math.sin(f / 10) * 0.03} />
      {/* 契約書 (大写し: 条項ブロックを画面中央へ) */}
      <g transform={`translate(${960 + sh} ${520 + sh * 0.6}) rotate(2) scale(2.35)`}>
        <g transform="translate(0 -85)">
          <ContractPaper f={f} revealT={seg(f, 2, 10)} frameT={seg(f, 10, 18)} />
        </g>
      </g>
      {/* 手前の万年筆 (大) */}
      <g transform="translate(1560 990) rotate(-18)">
        <rect x={-230} y={-26} width={460} height={52} rx={26} fill={C.nightDeep} stroke={C.ink} strokeWidth={7} />
        <path d="M 230 -16 L 310 0 L 230 16 Z" fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <rect x={-40} y={-26} width={28} height={52} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 判を押す手 (右上から降りる) */}
      <g transform={`translate(${1660 - handT * 40} ${lerp(-260, 290, handT) - liftT * 320 + sh})`}>
        {/* 袖 */}
        <rect x={-64} y={-320} width={128} height={240} rx={20} fill={C.navyDark} stroke={C.ink} strokeWidth={7} />
        <rect x={-70} y={-110} width={140} height={44} rx={12} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        {/* 手 */}
        <ellipse cx={0} cy={-20} rx={58} ry={48} fill="#F2C9A0" stroke={C.ink} strokeWidth={6} />
        <path d="M -52 -44 Q -62 -10 -46 8 M 52 -44 Q 62 -10 46 8" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        {/* 印鑑 */}
        <rect x={-28} y={6} width={56} height={120} rx={14} fill="#8A3324" stroke={C.ink} strokeWidth={6} />
        <rect x={-34} y={114} width={68} height={22} rx={8} fill={C.ink} />
      </g>
      {/* 押された朱印 (条文の右) */}
      {sealT > 0 && (
        <g transform={`translate(${1640 + sh} ${436 + sh * 0.6}) rotate(-8) scale(${pop(sealT)})`}>
          <circle r={58} fill="none" stroke={SGP.shuin} strokeWidth={10} opacity={0.9} />
          <circle r={44} fill="none" stroke={SGP.shuin} strokeWidth={4} opacity={0.9} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={50} fill={SGP.shuin} opacity={0.95}>認</text>
          {/* 衝撃線 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a}
              x1={72 * Math.cos((a * Math.PI) / 180)} y1={72 * Math.sin((a * Math.PI) / 180)}
              x2={(90 + Math.sin(f / 3) * 4) * Math.cos((a * Math.PI) / 180)}
              y2={(90 + Math.sin(f / 3) * 4) * Math.sin((a * Math.PI) / 180)}
              stroke={SGP.shuin} strokeWidth={6} strokeLinecap="round"
              opacity={Math.max(0.9 - (f - 32) * 0.06, 0.2)} />
          ))}
        </g>
      )}
      {/* 四隅の暗がり */}
      <path d="M 0 0 L 420 0 Q 60 120 0 420 Z" fill={C.ink} opacity={0.18} />
      <path d="M 1920 1080 L 1500 1080 Q 1860 960 1920 660 Z" fill={C.ink} opacity={0.18} />
      <path d="M 0 1080 L 0 760 Q 90 1000 380 1080 Z" fill={C.ink} opacity={0.14} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #157 劇場の入り口には、制服の警備員まで立ちました。
// 格: 並 / seed 1243
// 絵: 入口に直立する警備員。腕章、白手袋、張られたロープ。靴がぴかぴか
// どこ: 夜の劇場入口の正面。タイル壁・真鍮扉・燭台ランプ
// 演出: 直立不動の警備員が主役。白手袋・腕章・ぴかぴかの靴・ベルベットのロープ
// 動き: 靴のきらめき / ロープのたわみ / 蛾がランプを回る / 扉の光のゆらぎ
const Sg157: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1243} bg={C.wallNight} dark>
    {/* タイル壁 */}
    <rect x={0} y={0} width={W} height={920} fill={C.wallNight} />
    {Array.from({ length: 40 }, (_, i) => {
      const row = Math.floor(i / 8);
      const col = i % 8;
      return (
        <rect key={i} x={col * 250 + (row % 2 ? 125 : 0) - 120} y={row * 190 - 40}
          width={244} height={184} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.45} />
      );
    })}
    {/* 欄間の飾り */}
    <rect x={480} y={120} width={960} height={70} rx={12} fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
    <path d="M 520 155 q 60 -26 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0"
      fill="none" stroke={KRP.brass} strokeWidth={5} opacity={0.8} />
    {/* 真鍮の両開き扉 (丸窓から光) */}
    <g>
      <rect x={600} y={190} width={720} height={720} fill={C.brickDark} stroke={C.ink} strokeWidth={8} />
      <rect x={630} y={220} width={320} height={690} fill="#5E4330" stroke={C.ink} strokeWidth={7} />
      <rect x={970} y={220} width={320} height={690} fill="#5E4330" stroke={C.ink} strokeWidth={7} />
      {[790, 1130].map((cx2, i) => (
        <g key={i}>
          <circle cx={cx2} cy={400} r={76} fill={SGP.lampGold} stroke={KRP.brass} strokeWidth={10}
            opacity={0.92 + Math.sin(f / 8 + i) * 0.07} />
          <circle cx={cx2} cy={400} r={76} fill="none" stroke={C.ink} strokeWidth={5} />
          <circle cx={cx2 - 22} cy={378} r={20} fill={KRP.white} opacity={0.5 + Math.sin(f / 6 + i * 2) * 0.2} />
          <rect x={cx2 - 9} y={580} width={18} height={100} rx={9} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 扉下から漏れる光 */}
      <rect x={620} y={896} width={690} height={16} fill={SGP.lampGold}
        opacity={0.5 + Math.sin(f / 7) * 0.2} />
    </g>
    {/* 壁の燭台ランプと蛾 */}
    {[380, 1540].map((lx, i) => (
      <g key={i} transform={`translate(${lx} 420)`}>
        <rect x={-10} y={0} width={20} height={70} rx={8} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-26} r={30} fill={SGP.lampGold} stroke={C.ink} strokeWidth={5}
          opacity={0.8 + Math.sin(f / 5 + i * 2) * 0.15} />
        <circle cx={0} cy={-26} r={52} fill={SGP.lampGold} opacity={0.14 + Math.sin(f / 5 + i * 2) * 0.05} />
        {/* 回る蛾 (左のランプだけ) */}
        {i === 0 && (
          <g transform={`translate(${Math.cos(f / 5) * 70} ${-26 + Math.sin(f / 5) * 44})`}>
            <ellipse cx={0} cy={0} rx={9} ry={5} fill={KRP.cream} stroke={C.ink} strokeWidth={2.5} />
            <path d={`M -4 0 L -14 ${-8 + Math.sin(f / 2) * 5} M 4 0 L 14 ${-8 - Math.sin(f / 2) * 5}`}
              stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
          </g>
        )}
      </g>
    ))}
    {/* ポスター額 (左端) */}
    <g transform="translate(160 640)">
      <rect x={-105} y={-160} width={210} height={320} fill={KRP.cream} stroke={KRP.brass} strokeWidth={9} />
      <rect x={-105} y={-160} width={210} height={320} fill="none" stroke={C.ink} strokeWidth={4} />
      <path d="M -60 100 Q 0 -60 60 100" fill="none" stroke={C.ink} strokeWidth={5} opacity={0.6} />
      <circle cx={0} cy={-90} r={30} fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.6} />
    </g>
    {/* 床と赤絨毯 */}
    <rect x={0} y={910} width={W} height={H - 910} fill={C.nightDeep} />
    <line x1={0} y1={910} x2={W} y2={910} stroke={C.ink} strokeWidth={6} />
    <path d="M 640 910 L 1280 910 L 1400 1080 L 520 1080 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
    {/* 警備員 (主役・大きく) */}
    <Keibiin x={960} y={950} s={1.62} f={f} gazeX={0} />
    {/* 靴のきらめき */}
    <Spark x={915} y={944} f={f} ph={0} s={0.8} />
    <Spark x={1008} y={946} f={f} ph={2.2} s={0.65} />
    {/* スタンションとたわむロープ (警備員の前) */}
    {[290, 1630].map((sx2, i) => (
      <g key={i} transform={`translate(${sx2} 1000)`}>
        <ellipse cx={0} cy={8} rx={46} ry={11} fill={C.ink} opacity={0.3} />
        <rect x={-11} y={-140} width={22} height={142} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-148} r={18} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={38} ry={13} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
      </g>
    ))}
    <path d={`M 290 870 Q 960 ${950 + Math.sin(f / 9) * 8} 1630 870`}
      fill="none" stroke={SGP.curtain} strokeWidth={18} strokeLinecap="round" />
    <path d={`M 290 862 Q 960 ${941 + Math.sin(f / 9) * 8} 1630 862`}
      fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
  </Frame>
);

// -------------------------------------------------------------------
// #158 立て札には、こう書いてあります。
// 格: 並 / seed 1244
// 絵: 立て札へカメラがゆっくり寄っていく。まだ読めそうで読めない距離。溜め
// どこ: 夜の映画館前。立て札の正面へ群衆の頭越しに寄っていく
// 演出: カメラがゆっくりズームイン。文字はまだぐにゃぐにゃで読めない。溜めの1枚
// 動き: ズーム / 光の筋+塵 / 電球とボケ / 手前の頭のシルエットが揺れる
const Sg158: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.24 * easeOut(clamp01(f / 42));
  return (
    <Frame f={f} seed={1244} bg={C.nightDeep} dark>
      <g transform={zoomAt(z, 960, 540)}>
        {/* 夜のレンガ壁 */}
        <rect x={-200} y={-120} width={2320} height={1100} fill={C.wallNight} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-200} y1={i * 110 - 60} x2={2120} y2={i * 110 - 60}
            stroke={C.ink} strokeWidth={3.5} opacity={0.4} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 + (i % 2 ? 90 : 0) - 60} y1={i % 2 ? 160 : 270}
            x2={i * 180 + (i % 2 ? 90 : 0) - 60} y2={(i % 2 ? 160 : 270) + 110}
            stroke={C.ink} strokeWidth={3.5} opacity={0.35} />
        ))}
        {/* マーキーの電球列とボケ (上辺) */}
        <rect x={-100} y={118} width={2120} height={74} rx={12} fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
        <BulbRow x={60} y={155} w={1800} n={16} f={f} r={10} />
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={240 + rnd(71, i) * 1440} cy={250 + rnd(72, i) * 70}
            r={14 + rnd(73, i) * 16} fill={SGP.lampGold}
            opacity={0.1 + ((Math.sin(f / 7 + i * 2) + 1) / 2) * 0.1} />
        ))}
        {/* 左: 扉の光 / 右: ポスター額 */}
        <rect x={215} y={300} width={200} height={560} fill={SGP.lampGold} stroke={C.ink} strokeWidth={6} opacity={0.85} />
        <rect x={215} y={300} width={200} height={560} fill={KRP.white} opacity={0.1 + Math.sin(f / 8) * 0.05} />
        <line x1={315} y1={300} x2={315} y2={860} stroke={C.ink} strokeWidth={4} opacity={0.6} />
        <g transform="translate(1620 580)">
          <rect x={-95} y={-230} width={190} height={460} fill={KRP.cream} stroke={KRP.brass} strokeWidth={9} />
          <rect x={-95} y={-230} width={190} height={460} fill="none" stroke={C.ink} strokeWidth={4} />
          <path d="M -50 140 Q 10 -90 70 140" fill="none" stroke={C.ink} strokeWidth={5} opacity={0.55} />
          <circle cx={0} cy={-130} r={32} fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.55} />
        </g>
        {/* 上からのスポット光 */}
        <polygon points="960,130 700,820 1220,820" fill={C.beam}
          opacity={0.14 + Math.sin(f / 6) * 0.04} />
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={810 + rnd(74, i) * 300}
            cy={280 + rnd(75, i) * 380 + Math.sin(f / 7 + i * 1.6) * 9}
            r={2.5 + rnd(76, i) * 3} fill={C.beam}
            opacity={0.4 + Math.sin(f / 5 + i * 2) * 0.25} />
        ))}
        {/* 立て札 (まだ読めない) */}
        <Tatefuda x={960} y={570} s={1.0} f={f} mode="scribble" />
        {/* 歩道 */}
        <rect x={-200} y={1005} width={2320} height={220} fill={C.nightDeep} />
        <line x1={-200} y1={1005} x2={2120} y2={1005} stroke={C.ink} strokeWidth={6} />
      </g>
      {/* 手前: 見物人の頭のシルエット (ズームの外) */}
      {[[170, 0, 0], [600, 1, 1], [1180, 0, 2], [1680, 1, 3]].map(([hx, brim, ph], i) => (
        <g key={i} transform={`translate(${hx} ${1120 + Math.sin(f / 8 + (ph as number) * 1.7) * 7})`}>
          <circle cx={0} cy={0} r={180} fill={C.ink} opacity={0.96} />
          {(brim as number) === 1 && (
            <g>
              <ellipse cx={0} cy={-130} rx={210} ry={34} fill={C.ink} />
              <path d="M -120 -196 Q 0 -240 120 -196 L 120 -140 L -120 -140 Z" fill={C.ink} />
            </g>
          )}
        </g>
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #159 「支配人の弟も、お断り。合衆国大統領も、お断り」。
// 格: 山 / seed 1245
// 絵: 立て札の文言①が大写しで読み上げられる。「支配人の弟」の行の隣に困り顔の弟のミニ似顔、「大統領」の行に星条旗の小旗
// どこ: 立て札の真正面・大写し。上辺にマーキー 下隅に見物人の頭
// 演出: 文言①が1行ずつ現れる。「弟」の行に困り顔ミニ似顔 「大統領」の行に星条旗
// 動き: 行の pop+赤線スイープ / 白手袋の指差しが行を追う / 旗がはためく / 電球
const Sg159: React.FC<{ f: number }> = ({ f }) => {
  const t1 = seg(f, 4, 14);
  const t2 = seg(f, 18, 28);
  const hy = lerp(430, 640, easeOut(seg(f, 18, 28)));
  const slideIn = easeOut(seg(f, 8, 14));
  return (
    <Frame f={f} seed={1245} bg={C.wallNight} dark>
      {/* 夜の壁 */}
      <rect x={0} y={0} width={W} height={H} fill={C.wallNight} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={0} y1={i * 140} x2={W} y2={i * 140}
          stroke={C.ink} strokeWidth={3} opacity={0.28} />
      ))}
      {/* 上辺のマーキー電球 */}
      <rect x={100} y={30} width={1720} height={80} rx={14} fill={C.brickDark} stroke={C.ink} strokeWidth={7} />
      <BulbRow x={160} y={70} w={1600} n={18} f={f} r={11} />
      <rect x={100} y={30} width={1720} height={80} rx={14} fill={SGP.lampGold} opacity={0.08 + Math.sin(f / 7) * 0.04} />
      {/* 扉から漏れる光 (札の後ろ) */}
      <ellipse cx={960} cy={560} rx={760} ry={420} fill={SGP.lampGold}
        opacity={0.1 + Math.sin(f / 9) * 0.03} />
      {/* 上からのスポット */}
      <polygon points="960,90 560,900 1360,900" fill={C.beam}
        opacity={0.1 + Math.sin(f / 6) * 0.03} />
      {/* 立て札 文言① (主役・大写し) */}
      <Tatefuda x={960} y={500} s={1.5} f={f} mode="text1" t1={t1} t2={t2} />
      {/* 白手袋の指差し (右から行を追う) */}
      <g transform={`translate(${lerp(2100, 1720, slideIn)} ${hy}) rotate(-6)`}>
        <rect x={60} y={-42} width={300} height={84} rx={24} fill={C.navyDark} stroke={C.ink} strokeWidth={7} />
        <rect x={34} y={-48} width={56} height={96} rx={16} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={0} rx={62} ry={44} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <rect x={-96} y={-16} width={110} height={32} rx={16} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <path d="M -20 -30 Q -34 -8 -22 10 M 8 -36 Q -8 -10 4 14" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
      </g>
      {/* 歩道と見物人の頭 (下の両隅) */}
      <rect x={0} y={1010} width={W} height={H - 1010} fill={C.nightDeep} />
      <g transform={`translate(130 ${1156 + Math.sin(f / 8) * 6})`}>
        <circle r={170} fill={C.ink} opacity={0.96} />
        <ellipse cx={0} cy={-124} rx={196} ry={30} fill={C.ink} />
        <path d="M -110 -184 Q 0 -224 110 -184 L 110 -130 L -110 -130 Z" fill={C.ink} />
      </g>
      <g transform={`translate(1800 ${1170 + Math.sin(f / 7 + 2) * 6})`}>
        <circle r={160} fill={C.ink} opacity={0.96} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #160 「英国女王陛下も、神のご加護がありますように、お断り」。
// 格: 山 / seed 1246
// 絵: 文言②へ札がめくれる (連番の山)。王冠マークと「God save the Queen」の小さな音符。**笑いの山**。読んだ警備員も直立のまま目が泳ぐ
// どこ: 同じ映画館前を引き+斜めから。星空・マーキーの角・歩道まで見える
// 演出: 札が文言②へめくれる。王冠ポン+音符。笑う観客 直立のまま目が泳ぐ警備員
// 動き: 紙のめくれ (scaleY) / 王冠 pop / 音符が昇る / 警備員の目が泳ぐ+汗 / 観客が笑う
const Sg160: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1246} bg={C.night} dark>
    {/* 星空 */}
    <rect x={0} y={0} width={W} height={H} fill={C.night} />
    <rect x={0} y={0} width={W} height={260} fill={C.nightDeep} />
    {Array.from({ length: 14 }, (_, i) => (
      <circle key={i} cx={40 + rnd(81, i) * 1840} cy={20 + rnd(82, i) * 300}
        r={1.8 + rnd(83, i) * 2.6} fill={KRP.white}
        opacity={0.3 + ((Math.sin(f / 6 + i * 1.9) + 1) / 2) * 0.6} />
    ))}
    <path d={`M 1690 130 a 56 56 0 1 0 2 112 a 46 60 0 1 1 -2 -112`} fill={KRP.cream} opacity={0.9} />
    {/* 劇場の壁 (斜め・左) とマーキーの角 */}
    <g>
      <path d="M 0 90 L 1060 260 L 1060 900 L 0 980 Z" fill={C.wallNight} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={0} y1={200 + i * 130} x2={1060} y2={330 + i * 95}
          stroke={C.ink} strokeWidth={3} opacity={0.3} />
      ))}
      {/* マーキーひさし (左上の角) */}
      <path d="M 0 60 L 760 190 L 760 300 L 0 200 Z" fill={C.brickDark} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 9 }, (_, i) => {
        const bt = i / 8;
        const on = ((i + Math.floor(f / 6)) % 3) === 0;
        return (
          <g key={i}>
            {on && <circle cx={50 + bt * 660} cy={140 + bt * 110} r={18} fill={SGP.lampGold} opacity={0.3} />}
            <circle cx={50 + bt * 660} cy={140 + bt * 110} r={10}
              fill={on ? SGP.lampGold : KRP.grayDark} stroke={C.ink} strokeWidth={3} />
          </g>
        );
      })}
      {/* 扉の光 (札の後ろ) */}
      <path d="M 180 330 L 420 370 L 420 930 L 180 950 Z" fill={SGP.lampGold} stroke={C.ink} strokeWidth={6} opacity={0.8} />
      <path d="M 180 330 L 420 370 L 420 930 L 180 950 Z" fill={KRP.white} opacity={0.08 + Math.sin(f / 8) * 0.04} />
    </g>
    {/* 歩道 */}
    <rect x={0} y={900} width={W} height={H - 900} fill={C.sidewalk} opacity={0.9} />
    <path d="M 0 980 L 1060 900 L 1920 940 L 1920 1080 L 0 1080 Z" fill={C.sidewalk} />
    <line x1={0} y1={980} x2={1060} y2={900} stroke={C.ink} strokeWidth={5} opacity={0.6} />
    <line x1={1060} y1={900} x2={1920} y2={940} stroke={C.ink} strokeWidth={5} opacity={0.6} />
    {/* 立て札 (文言②へめくれる) */}
    <Tatefuda x={640} y={560} s={1.12} f={f} mode="text2"
      flipT={seg(f, 4, 14)} t2={seg(f, 16, 26)} />
    {/* 昇る音符 (札の右上) */}
    {seg(f, 18, 26) > 0 && [0, 1, 2].map((i) => {
      const rise = (f * 2.2 + i * 34) % 110;
      return (
        <g key={i} transform={`translate(${1060 + i * 90 + Math.sin(f / 7 + i * 2) * 8} ${400 - rise})`}
          opacity={Math.min(seg(f, 18, 26) * 2, 1) * (1 - rise / 130)}>
          <ellipse cx={0} cy={0} rx={13} ry={10} fill={KRP.cream} transform="rotate(-18)" />
          <path d="M 11 -3 L 11 -42 Q 24 -39 29 -29" fill="none" stroke={KRP.cream}
            strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    })}
    {/* 警備員 (直立のまま目が泳ぐ) */}
    <Keibiin x={1480} y={1000} s={1.4} f={f} gazeX={Math.sin(f / 5) * 6} sweat />
    {/* 笑う観客 (左下) */}
    <g>
      <ellipse cx={120} cy={1066} rx={80} ry={14} fill={C.ink} opacity={0.25} />
      <Person x={120} y={1060} s={0.8} cloth={C.brickDark} clothDark={C.ink}
        hair="cap" face="joy" f={f} pose="banzai" />
      <PersonMini x={320} y={1070} s={1.5} color={C.navy} f={f} phase={1} face="smile" arms="up" />
      <PersonMini x={470} y={1076} s={1.3} color={KRP.grayDark} f={f} phase={3} face="smile" arms="down" />
    </g>
    {/* スタンション (右端) */}
    <g transform="translate(1840 1010)">
      <rect x={-11} y={-140} width={22} height={142} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
      <circle cx={0} cy={-148} r={18} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={0} cy={0} rx={38} ry={13} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
    </g>
  </Frame>
);

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_149: (f) => <Sg149 f={f} />,
  sg_150: (f) => <Sg150 f={f} />,
  sg_151: (f) => <Sg151 f={f} />,
  sg_152: (f) => <Sg152 f={f} />,
  sg_153: (f) => <Sg153 f={f} />,
  sg_154: (f) => <Sg154 f={f} />,
  sg_155: (f) => <Sg155 f={f} />,
  sg_156: (f) => <Sg156 f={f} />,
  sg_157: (f) => <Sg157 f={f} />,
  sg_158: (f) => <Sg158 f={f} />,
  sg_159: (f) => <Sg159 f={f} />,
  sg_160: (f) => <Sg160 f={f} />,
};

export const S_B7B_MOTIFS: string[] = [
  "sg_149", // #149
  "sg_150", // #150
  "sg_151", // #151
  "sg_152", // #152
  "sg_153", // #153
  "sg_154", // #154
  "sg_155", // #155
  "sg_156", // #156
  "sg_157", // #157
  "sg_158", // #158
  "sg_159", // #159
  "sg_160", // #160
];

export const saigoB7bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
