// 「人類は、昔から飛ばして観ていた」: 全4巻で共有する「説明の装置」。
// 設計書: docs/saigomade-design-1.md「全巻で共有する説明の装置」が正本。
//
// ★この5つは動画の背骨。毎回同じ図を使い、描き直さない (絵のブレ禁止)。
// ★背景・空・街並み・人の配置はここに置かない (制作ガイド §7 第3層-6)。
// ★props の形 (シグネチャ) を勝手に変えない。並走中の全員がこの形で呼ぶ。
//
// 使われる場所 (全部で16回。これ以外の文で勝手に出さない):
//   Danmen:      #63(A) #97(B) #126(C) #190(D) #228(E)
//   Tehaisho:    #5 #23 #24 #25 と各章末の御用、#223(鈴本だけ逮捕できず)
//   SaiseiBar:   #2 #142 #207 #234 #235
//   NenpyoEmaki: #21 #106 #113 #188 #211
//   Fuda3:       #22 #111 #231

import React from "react";
import { useCurrentFrame } from "remotion";
import { KRP, KARAKURI_FONT, seg, easeOut, clamp01, pop } from "./KarakuriScenes";
import { Frame } from "./SaigoShared";

const FONT = KARAKURI_FONT;

// ローカル乱数 (毎フレーム同じ値。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// 装置専用の色 (シーン側はこれを勝手に増やさない)
export const SGP = {
  wood: "#B98A50",      // 木枠・掲示板
  woodDark: "#8A6436",
  paper: "#F2E8CF",     // 手配書・巻物の紙
  paperOld: "#E3D4AE",  // 古い紙 (年表の長い帯)
  stage: "#C9B88E",     // 舞台の床
  curtain: "#A8333A",   // 緞帳の赤
  lampGold: "#E8C86A",  // 客席ランプの光
  lampOff: "#6A6F7A",   // 消えたランプ
  nightInk: "#2E3440",  // 暗くなった客席
  phoneBlue: "#9FD8E8", // スマホの光 (客電の復活)
  barCraft: "#D9C9A6",  // 再生バーのクラフト紙
  shuin: "#C0392B",     // 御用の朱
  aoshizuka: "#5B7FA6", // 年表右端150年の青
};

/* ===================================================================
 * Danmen — 劇場断面図 (この動画の背骨)
 * ===================================================================
 * 横長の切絵。左=舞台 (緞帳と役者のシルエットではなく具体的な役者1人)、
 * 右=客席 (段々の床に客の紙人形)、客席の上に【ランプ5灯】、
 * 右端に【出入口の戸と ⇄ の矢印】。
 *
 * state で変わるのは「ランプの点灯数・出入口・客席の小物」だけ。
 * 建物の輪郭・舞台・段々は全状態で完全に同一 (描き直し禁止)。
 *   A: 5灯点灯。客席に弁当・徳利・おしゃべりの音符。⇄が太い
 *   B: 3灯点灯 (左の2灯が消え、煙がひとすじ)。音符が減る
 *   C: 1灯点灯。客席は前を向き始める。⇄が細い
 *   D: 0灯。出入口の戸が閉まり、⇄が消える。客席は全員前向きで静止
 *   E: 0灯のまま、客席のあちこちに小さな青い光 (スマホ) がぽつぽつ。
 *      150年ぶりの「客電」。光は f で順にともる
 *
 * 置き方: x,y は図の中心。s=1 で幅約1700 (画面をほぼ使い切る)。
 * t は出現 0→1 (建物が描き上がる)。
 */
// --- Danmen 用のローカル部品 ---

// 天井ランプ1灯 (紐+笠+炎)。on=点灯、smoke=消えた直後の煙ひとすじ
const DLamp: React.FC<{ x: number; f: number; i: number; on: boolean; smoke?: boolean }> =
  ({ x, f, i, on, smoke }) => {
    const fl = Math.sin(f / 5 + i * 1.7) * 2; // 炎のゆらぎ ±2px
    return (
      <g transform={`translate(${x} -222)`}>
        <line x1={0} y1={0} x2={0} y2={54} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={10} r={4.5} fill={KRP.ink} />
        {on && <circle cx={0} cy={84} r={40} fill={SGP.lampGold} opacity={0.3} />}
        {on && <circle cx={0} cy={84} r={24} fill={SGP.lampGold} opacity={0.5} />}
        <path d="M -27 72 L 27 72 L 15 52 L -15 52 Z"
          fill={on ? SGP.wood : SGP.lampOff} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-20} y1={66} x2={20} y2={66} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        {on ? (
          <path d={`M 0 ${98 + fl} C -9 ${89 + fl} -7 79 0 74 C 7 79 9 ${89 + fl} 0 ${98 + fl} Z`}
            fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3.5} />
        ) : (
          <line x1={-9} y1={76} x2={9} y2={92} stroke={SGP.lampOff} strokeWidth={4} />
        )}
        {smoke && (
          <path d={`M 2 60 C ${9 + Math.sin(f / 7 + i) * 3} 44 ${-5 + Math.sin(f / 9 + i) * 3} 30 4 12`}
            fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.75} strokeLinecap="round" />
        )}
      </g>
    );
  };

// 紙人形の客1人。素は左 (舞台) 向き。dir=-1 で右向きに反転。
// pose: 0=座る 1=立つ 2=振り向く (体は前、頭だけ後ろ+腕を背もたれに)
const DKyaku: React.FC<{ x: number; y: number; pose: 0 | 1 | 2; dir: 1 | -1 }> =
  ({ x, y, pose, dir }) => (
    <g transform={`translate(${x} ${y}) scale(${dir} 1)`}
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
      {pose === 1 ? (
        <>
          <path d="M -13 0 L -15 -58 Q -15 -70 -6 -72 L 6 -72 Q 15 -70 15 -58 L 13 0 Z" />
          <circle cx={-1} cy={-87} r={13} />
          <circle cx={-7} cy={-89} r={2.4} fill={KRP.ink} stroke="none" />
        </>
      ) : (
        <>
          <path d="M -15 0 Q -18 -34 -10 -42 L 10 -42 Q 18 -34 15 0 Z" />
          {pose === 2 && <path d="M 8 -34 Q 24 -30 26 -14" fill="none" strokeWidth={4.5} />}
          <circle cx={pose === 2 ? 3 : -2} cy={-55} r={13} />
          <circle cx={pose === 2 ? 9 : -8} cy={-57} r={2.4} fill={KRP.ink} stroke="none" />
        </>
      )}
    </g>
  );

// おしゃべりの音符 (浮き沈み)
const DNote: React.FC<{ x: number; y: number; f: number; i: number; o?: number }> =
  ({ x, y, f, i, o = 1 }) => (
    <g transform={`translate(${x} ${y + Math.sin(f / 8 + i * 1.3) * 6})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={8} ry={6} fill={KRP.ink} transform="rotate(-18)" />
      <path d="M 7 -2 L 7 -28 Q 15 -26 19 -19" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
    </g>
  );

export const Danmen: React.FC<{
  f: number;
  state: "A" | "B" | "C" | "D" | "E";
  x?: number; y?: number; s?: number; t?: number;
}> = ({ f, state, x = 960, y = 560, s = 1, t = 1 }) => {
  // t: 建物→舞台→客席→ランプの順に出てくる
  const bT = easeOut(clamp01(t / 0.4));
  const sT = easeOut(clamp01((t - 0.18) / 0.35));
  const aT = easeOut(clamp01((t - 0.38) / 0.35));
  const lT = easeOut(clamp01((t - 0.58) / 0.42));

  const lampOn = { A: [1, 1, 1, 1, 1], B: [0, 0, 1, 1, 1], C: [0, 0, 0, 0, 1], D: [0, 0, 0, 0, 0], E: [0, 0, 0, 0, 0] }[state];
  const dark = state === "D" || state === "E";
  const yaW = state === "A" || state === "B" ? 14 : state === "C" ? 6 : 0;

  // 客席4段 (建物の一部。全状態で固定)
  const stepX = [-240, 10, 260, 510, 760];
  const stepTop = [252, 188, 124, 60];

  // 客13人 (位置・ポーズだけ state で変わる)
  const counts = [3, 4, 3, 3];
  const kyaku: { x: number; y: number; pose: 0 | 1 | 2; dir: 1 | -1 }[] = [];
  let gi = 0;
  counts.forEach((n, k) => {
    for (let j = 0; j < n; j++, gi++) {
      const base = stepX[k] + (250 / (n + 1)) * (j + 1);
      if (dark) {
        kyaku.push({ x: base, y: stepTop[k], pose: 0, dir: 1 }); // 全員前向き・等間隔
      } else if (state === "C") {
        kyaku.push({
          x: base + (rnd(3, gi) - 0.5) * 24, y: stepTop[k],
          pose: rnd(6, gi) < 0.78 ? 0 : 1, dir: rnd(5, gi) < 0.72 ? 1 : -1,
        });
      } else {
        const r = rnd(1, gi);
        kyaku.push({
          x: base + (rnd(2, gi) - 0.5) * 42, y: stepTop[k],
          pose: r < 0.55 ? 0 : r < 0.8 ? 1 : 2, dir: rnd(4, gi) < 0.5 ? 1 : -1,
        });
      }
    }
  });

  const noteN = state === "A" ? 6 : state === "B" ? 3 : 0;
  const noteAt = [1, 4, 6, 8, 10, 12];
  const phoneAt = [0, 2, 3, 5, 6, 8, 10, 12];

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* ===== 建物の外殻 (全状態で完全に同一) ===== */}
      <g opacity={bT} transform={`translate(0 ${(1 - bT) * 24})`}>
        {/* 屋根 (浅い三角の梁) */}
        <path d="M -868 -228 L 0 -328 L 868 -228 L 836 -228 L 0 -306 L -836 -228 Z"
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -600 -268 L -560 -252 M 320 -288 L 360 -272" stroke={SGP.woodDark} strokeWidth={3} />
        {/* 天井の梁 */}
        <rect x={-850} y={-240} width={1700} height={18} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        {[-620, -300, 20, 340, 660].map((bx) => (
          <circle key={bx} cx={bx} cy={-231} r={3.2} fill={KRP.ink} />
        ))}
        {/* 壁の切り口 (断面の太線) */}
        <rect x={-856} y={-236} width={22} height={546} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={834} y={-236} width={22} height={352} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 床 */}
        <rect x={-856} y={300} width={1712} height={20} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 出入口 (右端の木戸) */}
        {state === "D" || state === "E" ? (
          <g>
            <rect x={806} y={116} width={40} height={188} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
            <line x1={826} y1={120} x2={826} y2={300} stroke={SGP.woodDark} strokeWidth={3.5} />
            <line x1={808} y1={176} x2={844} y2={168} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={814} cy={214} r={4.5} fill={KRP.ink} />
          </g>
        ) : (
          <g>
            {/* 開いた戸 (部屋側へ開いている) */}
            <path d="M 806 300 L 806 116 L 756 132 L 756 314 Z"
              fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <line x1={781} y1={126} x2={781} y2={306} stroke={SGP.woodDark} strokeWidth={3} />
            <rect x={806} y={110} width={42} height={8} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* ⇄ の両向き矢印 (戸口の上) */}
        {yaW > 0 && (
          <g transform="translate(788 72)" stroke={KRP.ink} strokeWidth={yaW}
            strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1={-44} y1={-10} x2={38} y2={-10} />
            <path d="M 38 -10 L 22 -24 M 38 -10 L 26 2" />
            <line x1={44} y1={16} x2={-38} y2={16} />
            <path d="M -38 16 L -22 2 M -38 16 L -26 30" />
          </g>
        )}
      </g>

      {/* ===== 左1/3 = 舞台 ===== */}
      <g opacity={sT} transform={`translate(0 ${(1 - sT) * 24})`}>
        {/* 舞台の台 (前面の切り口 + 板張りの天面) */}
        <rect x={-838} y={148} width={534} height={152} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -800 200 Q -700 194 -620 202 M -560 252 Q -460 246 -360 254" fill="none" stroke={SGP.woodDark} strokeWidth={3} />
        <circle cx={-812} cy={166} r={3.2} fill={KRP.ink} />
        <circle cx={-330} cy={166} r={3.2} fill={KRP.ink} />
        <rect x={-838} y={132} width={534} height={16} fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} />
        {[-780, -720, -660, -600, -540, -480, -420, -360].map((jx) => (
          <line key={jx} x1={jx} y1={134} x2={jx} y2={146} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        ))}
        {/* プロセニアム (額縁) */}
        <rect x={-302} y={-162} width={30} height={296} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-838} y={-162} width={566} height={34} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -818 -128 Q -555 -96 -292 -128" fill="none" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-287} cy={-146} r={3.2} fill={KRP.ink} />
        <circle cx={-820} cy={-146} r={3.2} fill={KRP.ink} />
        {/* 緞帳 (左右に寄せた赤いカーテン。ひだ6本) */}
        <path d="M -836 -128 L -756 -128 Q -742 10 -764 128 Q -800 140 -834 128 Q -848 10 -836 -128 Z"
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -816 -120 Q -812 0 -822 120 M -792 -120 Q -786 0 -794 122 M -770 -118 Q -762 0 -772 118"
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.65} />
        <path d="M -306 -128 L -386 -128 Q -400 10 -378 128 Q -342 140 -308 128 Q -294 10 -306 -128 Z"
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -326 -120 Q -330 0 -320 120 M -350 -120 Q -356 0 -348 122 M -372 -118 Q -380 0 -370 118"
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.65} />
        {/* 役者1人 (見得: 片腕を大きく上げる) */}
        <g transform={`translate(-560 132) rotate(${Math.sin(f / 10) * 1.2})`}>
          <path d="M -36 0 L -20 -78 L 20 -78 L 36 0 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <line x1={-26} y1={-30} x2={26} y2={-30} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -14 -72 L -58 -124" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <circle cx={-62} cy={-130} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 16 -68 L 48 -52" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <circle cx={0} cy={-96} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={6} cy={-99} r={2.6} fill={KRP.ink} />
          <path d="M -12 -108 Q 0 -116 12 -108" fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* フットライトの小さな灯の列 */}
        {[-452, -408, -364, -322].map((fx, i) => (
          <g key={fx} transform={`translate(${fx} 128)`}>
            <path d="M -9 0 A 9 9 0 0 1 9 0 Z" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-8 + Math.sin(f / 6 + i) * 1.5} r={4.5} fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
      </g>

      {/* ===== 右2/3 = 客席 (4段) ===== */}
      <g opacity={aT} transform={`translate(0 ${(1 - aT) * 24})`}>
        <path d="M -240 300 L -240 252 L 10 252 L 10 188 L 260 188 L 260 124 L 510 124 L 510 60 L 760 60 L 760 300 Z"
          fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {stepTop.map((ty, k) => (
          <line key={k} x1={stepX[k]} y1={ty} x2={stepX[k + 1]} y2={ty} stroke={KRP.ink} strokeWidth={8} />
        ))}
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={stepX[k] + 125} y1={stepTop[k] + 8} x2={stepX[k] + 125}
            y2={k === 0 ? 296 : stepTop[k - 1] - 4} stroke={SGP.woodDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 客の紙人形 13人 */}
        {kyaku.map((p, i) => <DKyaku key={i} x={p.x} y={p.y} pose={p.pose} dir={p.dir} />)}
        {/* 小物: 弁当・徳利 (A/Bのみ) */}
        {(state === "A" || state === "B") && (
          <g>
            <g transform={`translate(${kyaku[2].x + 44} ${kyaku[2].y})`}>
              <rect x={-19} y={-16} width={38} height={16} fill={SGP.wood} stroke={KRP.ink} strokeWidth={4} />
              <line x1={-19} y1={-10} x2={19} y2={-10} stroke={KRP.ink} strokeWidth={3} />
            </g>
            {state === "A" && (
              <>
                <g transform={`translate(${kyaku[8].x - 46} ${kyaku[8].y})`}>
                  <rect x={-19} y={-16} width={38} height={16} fill={SGP.wood} stroke={KRP.ink} strokeWidth={4} />
                  <line x1={-19} y1={-10} x2={19} y2={-10} stroke={KRP.ink} strokeWidth={3} />
                </g>
                <path d={`M -6 0 L -6 -10 Q -10 -16 -5 -22 L 5 -22 Q 10 -16 6 -10 L 6 0 Z`}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
                  transform={`translate(${kyaku[5].x + 40} ${kyaku[5].y})`} />
              </>
            )}
          </g>
        )}
        {/* おしゃべりの音符 */}
        {Array.from({ length: noteN }).map((_, i) => {
          const d = kyaku[noteAt[i]];
          return <DNote key={i} x={d.x + 20} y={d.y - 112} f={f} i={i} />;
        })}
      </g>

      {/* ===== 天井のランプ5灯 (左から1,2,3,4,5) ===== */}
      <g opacity={lT} transform={`translate(0 ${(1 - lT) * 14})`}>
        {[-160, 55, 270, 485, 700].map((lx, i) => (
          <DLamp key={i} x={lx} f={f} i={i} on={lampOn[i] === 1}
            smoke={state === "B" && i < 2} />
        ))}
      </g>

      {/* ===== D/E: 客席をうっすら暗く ===== */}
      {dark && (
        <rect x={-256} y={-216} width={1086} height={514} fill={SGP.nightInk} opacity={0.25} />
      )}

      {/* ===== E: 客の手元にともる小さな青い光 (150年ぶりの客電) ===== */}
      {state === "E" && phoneAt.map((ki, i) => {
        const on = clamp01(seg(f, 6, 42) * 8 - i);
        if (on <= 0) return null;
        const d = kyaku[ki];
        return (
          <g key={i} opacity={on}>
            <circle cx={d.x - 16} cy={d.y - 32} r={17} fill={SGP.phoneBlue} opacity={0.35} />
            <circle cx={d.x - 16} cy={d.y - 32} r={7} fill={SGP.phoneBlue} opacity={0.95} />
            <circle cx={d.x - 4} cy={d.y - 55} r={15} fill={SGP.phoneBlue} opacity={0.18} />
          </g>
        );
      })}
    </g>
  );
};

/* ===================================================================
 * Tehaisho — 指名手配書 (1枚ぶん)
 * ===================================================================
 * 木枠つきの紙。上に「指名手配」の筆文字風ラベル、中央に似顔、下に名札。
 * who:
 *   1 = 静けさ (パリの紳士たち: シルクハット2つと「シーッ」の指)
 *   2 = ワーグナー (ベレー帽・もみあげ)
 *   3 = マーラー (丸眼鏡・とがった襟)
 *   4 = 演劇改良会 (紋付の肩と扇子)
 *   5 = ヒッチコック (名物の横顔の線画)
 *   6 = シネコン (人ではなく建物。看板に「CINEMA」)
 * goyoT: 0→1 で「御用」の朱印がドンと押される (0なら印なし)。
 * x,y は紙の中心。s=1 で紙の高さ約420。
 */
// 似顔だけで使う色 (紙に刷った絵なので、少し渋い色で塗り分ける)
const TC = {
  skin: "#EFC6A0",
  skinDark: "#D2A074",
  hair: "#5A4634",
  hat: "#2F3540", // シルクハット・紋付の黒
  hatBand: "#1E232B",
  cloth: "#3E5675", // 上着の紺
  clothDark: "#2C3E54",
  plum: "#8A4F63", // ワーグナーのベレー帽
  tie: "#A8333A", // 襟飾りの赤
  lens: "#CFE3EE", // 眼鏡のガラス
  wall: "#D8D0C0", // シネコンの壁
};

// 似顔 (胸から上の線画)。紙の中央 (0,-20) あたりに描く
const TGao: React.FC<{ who: 1 | 2 | 3 | 4 | 5 | 6 }> = ({ who }) => {
  const sw = 5;
  const ink = KRP.ink;
  switch (who) {
    case 1: // 静けさの擬人化: シルクハットの紳士が唇に指を当てて「シーッ」
      return (
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          {/* 後ろに連れの紳士が2人 (肩から上だけ覗く) */}
          {([[-80, -9], [82, 8]] as Array<[number, number]>).map(([gx, gr], i) => (
            <g key={i} transform={`translate(${gx} 0) rotate(${gr} 0 -20)`}>
              <path d="M -40 112 Q -36 56 0 38 Q 36 56 40 112 Z" fill={TC.clothDark} />
              <circle cx={0} cy={-16} r={24} fill={TC.skin} strokeWidth={4} />
              <circle cx={-8} cy={-18} r={3} fill={ink} stroke="none" />
              <circle cx={8} cy={-18} r={3} fill={ink} stroke="none" />
              <path d="M -8 -2 Q 0 2 8 -2" strokeWidth={3.5} />
              <rect x={-27} y={-46} width={54} height={10} rx={4} fill={TC.hat} strokeWidth={4} />
              <rect x={-18} y={-88} width={36} height={44} rx={5} fill={TC.hat} strokeWidth={4} />
              <rect x={-18} y={-60} width={36} height={12} fill={TC.hatBand} stroke="none" />
            </g>
          ))}
          {/* 肩と白い襟 */}
          <path d="M -72 110 Q -66 72 -30 58 L 30 58 Q 66 72 72 110 Z" fill={TC.hat} />
          <path d="M -34 58 L -8 68 L -20 106 Z M 34 58 L 8 68 L 20 106 Z" fill={KRP.white} strokeWidth={4} />
          {/* 顔 */}
          <path d="M -42 20 Q -42 -30 0 -30 Q 42 -30 42 20 Q 42 52 0 60 Q -42 52 -42 20 Z" fill={TC.skin} />
          <path d="M -41 14 Q -50 28 -41 38 M 41 14 Q 50 28 41 38" strokeWidth={4} fill={TC.skin} />
          {/* シルクハット */}
          <rect x={-52} y={-40} width={104} height={11} rx={5} fill={TC.hat} />
          <rect x={-34} y={-92} width={68} height={56} rx={6} fill={TC.hat} />
          <rect x={-34} y={-54} width={68} height={16} fill={TC.hatBand} stroke="none" />
          <path d="M -22 -86 L -22 -58" strokeWidth={3.5} stroke={KRP.white} opacity={0.28} />
          {/* 眉と目 */}
          <path d="M -28 -8 L -8 -12 M 28 -8 L 8 -12" strokeWidth={5.5} stroke={TC.hair} />
          <ellipse cx={-17} cy={6} rx={8.5} ry={7} fill={KRP.white} strokeWidth={3.5} />
          <ellipse cx={17} cy={6} rx={8.5} ry={7} fill={KRP.white} strokeWidth={3.5} />
          <circle cx={-17} cy={6} r={3.4} fill={ink} stroke="none" />
          <circle cx={17} cy={6} r={3.4} fill={ink} stroke="none" />
          {/* 口ひげ */}
          <path d="M -22 36 Q -10 29 0 34 Q 10 29 22 36 Q 10 45 0 39 Q -10 45 -22 36 Z" fill={TC.hair} stroke="none" />
          {/* 唇に当てた白手袋 (シーッ)。指先が唇に触れている */}
          <g transform="translate(6 0) rotate(-6 0 70)">
            <path d="M -20 72 Q -23 99 -2 102 L 11 102 Q 28 99 27 77 L 27 66 Q 27 58 18 58 L 8 58 L 8 30 Q 8 18 -1 18 Q -10 18 -10 30 L -10 60 L -16 60 Q -20 60 -20 72 Z"
              fill={KRP.white} />
            <path d="M 10 68 L 25 67 M 10 80 L 25 79 M 10 92 L 23 91" strokeWidth={3.2} opacity={0.7} />
            <path d="M -10 34 L 8 34" strokeWidth={3} opacity={0.45} />
          </g>
        </g>
      );
    case 2: // ワーグナー: ベレー帽・ふくよかな頬・もみあげ・強い眉
      return (
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          {/* 肩・白い襟・赤いクラヴァット (顔より先に) */}
          <path d="M -74 104 Q -70 62 -34 52 L 34 52 Q 70 62 74 104 Z" fill={TC.cloth} />
          <path d="M -30 52 L 0 92 L 30 52 L 14 48 L 0 66 L -14 48 Z" fill={KRP.white} strokeWidth={4} />
          <path d="M 0 66 Q 12 80 0 96 Q -12 80 0 66 Z" fill={TC.tie} strokeWidth={4} />
          {/* 顔 */}
          <path d="M -58 40 Q -58 -20 -40 -44 L 40 -44 Q 58 -20 58 40 L 30 58 L -30 58 Z" fill={TC.skin} />
          <path d="M -56 10 Q -66 26 -56 36 M 56 10 Q 66 26 56 36" strokeWidth={4} fill={TC.skin} />
          {/* ベレー帽 */}
          <path d="M -50 -40 Q -60 -78 -8 -84 Q 52 -88 54 -56 Q 56 -42 44 -40 Z" fill={TC.plum} />
          <path d="M -26 -76 Q 8 -82 40 -70" strokeWidth={3.5} stroke={KRP.white} opacity={0.28} />
          {/* もみあげ */}
          <path d="M -50 -36 L -44 18 L -30 16 L -34 -34 Z M 50 -36 L 44 18 L 30 16 L 34 -34 Z" fill={TC.hair} />
          {/* 眉 */}
          <path d="M -34 -16 L -8 -22 M 34 -16 L 8 -22" strokeWidth={7} stroke={TC.hair} />
          {/* 目 */}
          <ellipse cx={-20} cy={-5} rx={9} ry={7.5} fill={KRP.white} strokeWidth={3.5} />
          <ellipse cx={20} cy={-5} rx={9} ry={7.5} fill={KRP.white} strokeWidth={3.5} />
          <circle cx={-20} cy={-5} r={3.6} fill={ink} stroke="none" />
          <circle cx={20} cy={-5} r={3.6} fill={ink} stroke="none" />
          {/* 頬の赤み */}
          <circle cx={-22} cy={20} r={8} fill={TC.tie} opacity={0.26} stroke="none" />
          <circle cx={22} cy={20} r={8} fill={TC.tie} opacity={0.26} stroke="none" />
          <path d="M -6 10 Q 0 16 6 10" strokeWidth={4} />
          <path d="M -16 34 Q 0 30 16 34" strokeWidth={4.5} />
        </g>
      );
    case 3: // マーラー: 丸眼鏡・細面・立てた襟・神経質な目
      return (
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          {/* 肩・立てた白襟・黒い蝶ネクタイ */}
          <path d="M -62 104 Q -56 62 -24 48 L 24 48 Q 56 62 62 104 Z" fill={TC.clothDark} />
          <path d="M -44 92 L -36 44 L -14 56 M 44 92 L 36 44 L 14 56" fill={KRP.white} />
          <path d="M -20 56 L 0 50 L 20 56 L 12 74 L -12 74 Z" fill={TC.tie} strokeWidth={4} />
          {/* 顔 */}
          <path d="M -34 -2 Q -34 -58 0 -58 Q 34 -58 34 -2 Q 34 36 0 44 Q -34 36 -34 -2 Z" fill={TC.skin} />
          {/* 乱れた髪 */}
          <path d="M -34 -34 Q -20 -70 16 -62 Q 38 -56 34 -30 Q 12 -46 -34 -34 Z" fill={TC.hair} />
          <path d="M -24 -44 Q -8 -56 10 -51" strokeWidth={3} stroke={KRP.white} opacity={0.2} />
          {/* 丸眼鏡 (真鍮の縁) */}
          <circle cx={-16} cy={-8} r={13} fill={TC.lens} fillOpacity={0.7} stroke={KRP.brass} strokeWidth={4} />
          <circle cx={16} cy={-8} r={13} fill={TC.lens} fillOpacity={0.7} stroke={KRP.brass} strokeWidth={4} />
          <line x1={-3} y1={-8} x2={3} y2={-8} strokeWidth={4} stroke={KRP.brass} />
          <path d="M -29 -11 L -36 -15 M 29 -11 L 36 -15" strokeWidth={3.5} stroke={KRP.brass} />
          <circle cx={-16} cy={-8} r={2.8} fill={ink} stroke="none" />
          <circle cx={16} cy={-8} r={2.8} fill={ink} stroke="none" />
          <path d="M -24 -18 L -10 -16 M 24 -18 L 10 -16" strokeWidth={3.5} stroke={TC.hair} />
          <path d="M -5 22 L 5 22" strokeWidth={4} />
        </g>
      );
    case 4: // 演劇改良会 (団体): 紋付の肩2つ + 開いた扇子、顔は豆粒
      return (
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
          {/* 開いた扇子 (紙地に日の丸、軸は真鍮) */}
          <g transform="translate(-4 -74)">
            <path d="M -34 -22 Q 0 -44 34 -22 L 0 30 Z" fill={SGP.paper} strokeWidth={4.5} />
            <circle cx={0} cy={-18} r={8} fill={KRP.red} stroke="none" />
            <path d="M 0 30 L -34 -22 M 0 30 L -18 -28 M 0 30 L 0 -32 M 0 30 L 18 -28 M 0 30 L 34 -22" strokeWidth={4} />
            <circle cx={0} cy={28} r={5} fill={KRP.brass} strokeWidth={3} />
          </g>
          {([[-52, 22], [52, 26]] as Array<[number, number]>).map(([px, py], i) => (
            <g key={i} transform={`translate(${px} ${py})`}>
              {/* 紋付の着物 (白い衣紋と両肩の紋) */}
              <path d="M -40 36 Q -36 -6 -16 -16 L 16 -16 Q 36 -6 40 36 Z" fill={TC.hat} />
              <path d="M -14 -14 L 0 18 L 14 -14 L 7 -17 L 0 -2 L -7 -17 Z" fill={KRP.white} stroke="none" />
              <circle cx={-25} cy={10} r={6} fill={KRP.white} stroke="none" />
              <circle cx={25} cy={10} r={6} fill={KRP.white} stroke="none" />
              {/* 顔と髷 */}
              <circle cx={0} cy={-34} r={11} fill={TC.skin} strokeWidth={4} />
              <path d="M -10 -38 Q -9 -46 0 -46 Q 9 -46 10 -38 Q 0 -42 -10 -38 Z" fill={TC.hair} stroke="none" />
              <ellipse cx={0} cy={-47} rx={6} ry={3} fill={TC.hair} strokeWidth={2.5} />
              <circle cx={-4} cy={-33} r={1.9} fill={ink} stroke="none" />
              <circle cx={4} cy={-33} r={1.9} fill={ink} stroke="none" />
            </g>
          ))}
        </g>
      );
    case 5: // ヒッチコック: 一筆書き風の横顔 (上品に)
      return (
        <g fill="none" stroke={ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
          {/* 肩・白い襟・赤いネクタイ */}
          <path d="M -58 102 Q -52 72 -20 62 L 28 66 Q 56 76 60 102 Z" fill={TC.hat} />
          <path d="M -28 62 L -7 98 L 14 64 L 4 59 L -7 74 L -18 57 Z" fill={KRP.white} strokeWidth={4} />
          <path d="M -7 74 Q 5 87 -7 102 Q -19 87 -7 74 Z" fill={TC.tie} strokeWidth={3.5} />
          {/* 横顔の中身 (肌) */}
          <path d="M -18 -88 Q 20 -96 30 -62 Q 34 -48 24 -34 Q 18 -26 26 -18 Q 36 -8 24 -2 Q 16 2 22 10 Q 30 22 14 28 Q 2 32 6 44 Q 10 58 -10 62 L -34 64 L -40 -48 Q -44 -78 -18 -88 Z"
            fill={TC.skin} stroke="none" />
          {/* 髪 */}
          <path d="M -18 -88 Q 20 -96 30 -62 Q 2 -76 -34 -62 Q -40 -56 -40 -48 Q -44 -78 -18 -88 Z"
            fill={TC.hair} stroke="none" />
          {/* 名物の一筆書き (上から重ねる) */}
          <path d="M -18 -88 Q 20 -96 30 -62 Q 34 -48 24 -34 Q 18 -26 26 -18 Q 36 -8 24 -2 Q 16 2 22 10 Q 30 22 14 28 Q 2 32 6 44 Q 10 58 -10 62 L -34 64" />
          <path d="M -18 -88 Q -44 -78 -40 -48" strokeWidth={5} />
          <path d="M -40 -48 L -34 64" strokeWidth={4.5} opacity={0.85} />
          <circle cx={2} cy={-52} r={3} fill={ink} stroke="none" />
          <path d="M -40 10 Q -34 2 -24 6" strokeWidth={4.5} />
        </g>
      );
    default: // 6 シネコン: 箱型ビル + CINEMA看板 + チケットゲート
      return (
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round">
          {/* 壁 */}
          <rect x={-78} y={-44} width={156} height={124} fill={TC.wall} />
          <path d="M -78 -10 L 78 -10" strokeWidth={2.5} opacity={0.3} />
          {/* 看板の電球 */}
          {[-58, -38, -18, 2, 22, 42, 58].map((bx) => (
            <circle key={bx} cx={bx} cy={-85} r={4} fill={KRP.yellow} strokeWidth={2.5} />
          ))}
          {/* 赤い看板 */}
          <rect x={-66} y={-78} width={132} height={34} fill={KRP.red} />
          <text x={0} y={-53} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={26} fill={KRP.yellow} stroke="none" letterSpacing={2}>CINEMA</text>
          {/* 灯りのついた窓 */}
          {[-56, -22, 12, 46].map((wx) => (
            <rect key={wx} x={wx} y={-28} width={14} height={18} fill={KRP.yellow} strokeWidth={3.5} />
          ))}
          {/* ガラスの自動扉 */}
          <rect x={-34} y={28} width={68} height={52} fill={KRP.blueSoft} strokeWidth={4.5} />
          <path d="M -22 80 L -22 44 M 0 80 L 0 44 M 22 80 L 22 44" strokeWidth={4} />
          <path d="M -22 52 L -8 52 M 0 52 L 14 52" strokeWidth={3.5} />
          {/* 入口の赤い敷物 */}
          <path d="M -44 80 L 44 80 L 58 98 L -58 98 Z" fill={SGP.curtain} />
        </g>
      );
  }
};

export const Tehaisho: React.FC<{
  f: number; who: 1 | 2 | 3 | 4 | 5 | 6;
  x: number; y: number; s?: number; t?: number; goyoT?: number;
}> = ({ f, who, x, y, s = 1, t = 1, goyoT = 0 }) => {
  const a = easeOut(clamp01(t));
  const names = ["静けさ", "ワーグナー", "マーラー", "演劇改良会", "ヒッチコック", "シネコン"];
  const name = names[who - 1];
  const sway = Math.sin(f / 9 + who * 1.4) * 0.9; // 紙の下端が風で揺れる
  const gs = pop(clamp01(goyoT));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
      {/* 木の枠 (木目と釘) */}
      <rect x={-166} y={-226} width={332} height={452} rx={6}
        fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -150 -218 Q -60 -222 80 -218 M -150 218 Q 40 222 150 218"
        fill="none" stroke={SGP.woodDark} strokeWidth={3} />
      {[[-154, -214], [154, -214], [-154, 214], [154, 214]].map(([nx, ny], i) => (
        <circle key={i} cx={nx} cy={ny} r={3.6} fill={KRP.ink} />
      ))}
      {/* 紙 (下端が揺れる) */}
      <g transform={`rotate(${sway} 0 -210)`}>
        <rect x={-146} y={-206} width={292} height={412}
          fill={SGP.paper} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 四隅の折れ目・シワ */}
        <path d="M -146 -182 L -122 -206 M 146 184 L 120 206" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
        <path d="M 96 -206 Q 102 -176 92 -150" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        {/* 上端の「指名手配」の帯 */}
        <rect x={-108} y={-196} width={216} height={48} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <text x={0} y={-160} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={36} fill={KRP.ink} letterSpacing={6}>指名手配</text>
        {/* 似顔 */}
        <g transform="translate(0 -14)"><TGao who={who} /></g>
        {/* 名前の木札 */}
        <rect x={-120} y={132} width={240} height={54} rx={6}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-110} y1={172} x2={110} y2={170} stroke={SGP.woodDark} strokeWidth={2.5} />
        <text x={0} y={172} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={name.length >= 5 ? 32 : 38} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={1.5} paintOrder="stroke">{name}</text>
      </g>
      {/* 「御用」の朱印 (ドンと押される) */}
      {goyoT > 0 && (
        <g transform={`translate(0 -6) rotate(-15) scale(${gs})`} opacity={0.92}>
          <circle cx={0} cy={0} r={92} fill="none" stroke={SGP.shuin} strokeWidth={9} />
          <circle cx={0} cy={0} r={76} fill="none" stroke={SGP.shuin} strokeWidth={5} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={58} fill={SGP.shuin}>御</text>
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={58} fill={SGP.shuin}>用</text>
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * SaiseiBar — クラフト紙に描いた動画の再生バー
 * ===================================================================
 * 横長のバー (溝のある木の棒のような質感)・丸いつまみ・
 * 左に「▶」の札、右に「10秒→」「2x」のボタン札。
 * progress: 0→1 でつまみの位置。シーン側が f で動かすと「飛ばし」になる。
 * x,y はバーの中心。s=1 で幅約1400。
 */
export const SaiseiBar: React.FC<{
  f: number; x?: number; y?: number; s?: number; t?: number; progress?: number;
}> = ({ f, x = 960, y = 640, s = 1, t = 1, progress = 0.3 }) => {
  const a = easeOut(clamp01(t));
  const x0 = -560, x1 = 560; // バー本体
  const px = x0 + (x1 - x0) * clamp01(progress);
  const bob = Math.sin(f / 6) * 2;        // つまみの上下 ±2px
  const rock = Math.sin(f / 7) * 2.2;     // ▶札のことこと
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
      {/* 左端: ▶ を彫った木札 */}
      <g transform={`translate(-650 0) rotate(${rock})`}>
        <rect x={-46} y={-40} width={92} height={92} rx={10}
          fill={SGP.barCraft} stroke={KRP.ink} strokeWidth={6.5} />
        <path d="M -38 -32 Q 0 -36 38 -32" fill="none" stroke={SGP.woodDark} strokeWidth={3} />
        <polygon points="-14,-22 26,6 -14,34" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-38} cy={44} r={3} fill={KRP.ink} />
        <circle cx={38} cy={44} r={3} fill={KRP.ink} />
      </g>
      {/* バー本体: 溝を彫った木の棒 */}
      <rect x={x0 - 14} y={-24} width={x1 - x0 + 28} height={48} rx={20}
        fill={SGP.wood} stroke={KRP.ink} strokeWidth={6.5} />
      <line x1={x0} y1={-15} x2={x1} y2={-15} stroke={KRP.white} strokeWidth={4} opacity={0.6} />
      <rect x={x0} y={-8} width={x1 - x0} height={16} rx={8}
        fill={SGP.barCraft} stroke={KRP.ink} strokeWidth={4} />
      <line x1={x0 + 4} y1={6} x2={x1 - 4} y2={6} stroke={SGP.woodDark} strokeWidth={3} opacity={0.7} />
      {/* 進んだ部分 (濃い色) */}
      <rect x={x0} y={-8} width={Math.max(px - x0, 16)} height={16} rx={8}
        fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 目盛り 10本 */}
      {Array.from({ length: 10 }).map((_, i) => {
        const tx = x0 + ((x1 - x0) / 9) * i;
        return <line key={i} x1={tx} y1={34} x2={tx} y2={i % 3 === 0 ? 54 : 48}
          stroke={KRP.ink} strokeWidth={3.5} />;
      })}
      {/* つまみ: 木の糸巻き (中心にねじ) */}
      <g transform={`translate(${px} ${bob})`}>
        <circle cx={0} cy={0} r={40} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6.5} />
        <circle cx={0} cy={0} r={26} fill={SGP.barCraft} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -33 -14 A 36 36 0 0 1 -14 -33" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.7} />
        <circle cx={0} cy={0} r={8} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={-5} y1={-5} x2={5} y2={5} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 右端: 「10秒→」「2×」の木札 */}
      <g transform="translate(628 0)">
        <rect x={-10} y={-30} width={126} height={60} rx={8}
          fill={SGP.barCraft} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -2 22 Q 52 26 108 22" fill="none" stroke={SGP.woodDark} strokeWidth={2.5} />
        <text x={53} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={30} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={0.8}>10秒→</text>
      </g>
      <g transform={`translate(700 ${-Math.sin(f / 8) * 2 - 72})`}>
        <rect x={-38} y={-28} width={76} height={56} rx={8}
          fill={SGP.barCraft} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={34} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={0.8}>2×</text>
      </g>
    </g>
  );
};

/* ===================================================================
 * NenpyoEmaki — 絵巻年表
 * ===================================================================
 * 左右に軸木のある巻物。開くと長い帯:
 *   左〜中央 = 数千年ぶん。賑やかな紙人形の観客 (食べる・しゃべる・出入りする) が
 *              ずっと続く。色は paperOld の温かい地
 *   右端     = 150年ぶんだけ青く静か (aoshizuka)。座って前を向く人形の列
 * openT: 0→1 で巻物が開く。
 * highlight: "long"=長い帯に寄る光 / "short"=右端の青に寄る光 / 省略=なし
 * x,y は巻物の中心。s=1 で幅約1700。
 */
export const NenpyoEmaki: React.FC<{
  f: number; x?: number; y?: number; s?: number; openT?: number;
  highlight?: "long" | "short";
}> = ({ f, x = 960, y = 560, s = 1, openT = 1, highlight }) => {
  const o = easeOut(clamp01(openT));
  const px0 = -812;                 // 紙の左端 (左の軸木のすぐ右)
  const pw = 1624 * o;              // いま開いている紙の幅
  const pxe = px0 + pw;             // 紙の右端 = 右の軸木の位置
  const xd = px0 + 1624 * 0.87;     // 長い帯と150年の帯の境目
  const pulse = 0.78 + 0.22 * Math.sin(f / 9);

  // 長い帯のにぎやかな観客 (3種のポーズ × 反転のくり返し、2列)
  const crowd: { cx: number; cy: number; kind: number; flip: boolean }[] = [];
  for (let i = 0; i < 22; i++) {
    const row = i % 2;
    crowd.push({
      cx: px0 + 70 + (i >> 1) * 124 + (rnd(11, i) - 0.5) * 30,
      cy: row === 0 ? -28 : 84,
      kind: i % 3,
      flip: rnd(12, i) < 0.5,
    });
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 紙 (開いたぶんだけ) */}
      <g>
        <rect x={px0} y={-170} width={Math.max(pw, 2)} height={340}
          fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={7} />
        {/* 巻物らしい上下の縁線 */}
        <line x1={px0} y1={-150} x2={pxe} y2={-150} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        <line x1={px0} y1={150} x2={pxe} y2={150} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        {/* 右端 150年の青い帯 (開いて届いたぶんだけ見える) */}
        {pxe > xd && (
          <rect x={xd} y={-164} width={pxe - xd} height={328} fill={SGP.aoshizuka} opacity={0.88} />
        )}
        {/* 境目のはっきりした縦線 */}
        {pxe > xd && <line x1={xd} y1={-170} x2={xd} y2={170} stroke={KRP.ink} strokeWidth={8} />}
        {/* 長い帯の観客 (開いて見えている範囲だけ描く) */}
        {crowd.filter((c) => c.cx + 30 < Math.min(pxe, xd)).map((c, i) => (
          <g key={i} transform={`translate(${c.cx} ${c.cy}) scale(${c.flip ? -1 : 1} 1)`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
            {c.kind === 0 && ( /* 食べる人 (弁当を持つ) */
              <>
                <path d="M -12 36 Q -15 6 -8 0 L 8 0 Q 15 6 12 36 Z" />
                <circle cx={-2} cy={-11} r={10} />
                <circle cx={-6} cy={-12} r={1.8} fill={KRP.ink} stroke="none" />
                <rect x={-24} y={10} width={22} height={10} fill={SGP.wood} strokeWidth={3} />
                <path d="M -6 2 L -15 10" strokeWidth={3.5} />
              </>
            )}
            {c.kind === 1 && ( /* しゃべる人 (音符つき) */
              <>
                <path d="M -12 36 Q -15 6 -8 0 L 8 0 Q 15 6 12 36 Z" />
                <circle cx={-2} cy={-11} r={10} />
                <circle cx={-6} cy={-12} r={1.8} fill={KRP.ink} stroke="none" />
                <path d="M -9 -7 Q -6 -4 -2 -6" fill="none" strokeWidth={2.5} />
                <g transform={`translate(-22 ${-34 + Math.sin(f / 8 + i) * 4})`}>
                  <ellipse cx={0} cy={0} rx={5} ry={4} fill={KRP.ink} stroke="none" />
                  <path d="M 4 -1 L 4 -16 Q 9 -15 11 -11" fill="none" strokeWidth={3} />
                </g>
              </>
            )}
            {c.kind === 2 && ( /* 歩いて出入りする人 */
              <>
                <path d="M -8 0 L 8 0 L 14 34 L 5 34 L 0 12 L -6 34 L -15 34 Z" />
                <circle cx={0} cy={-11} r={10} />
                <circle cx={-4} cy={-12} r={1.8} fill={KRP.ink} stroke="none" />
              </>
            )}
          </g>
        ))}
        {/* 150年の帯: 座って同じ方向を向く8人 (静か) */}
        {pxe > xd + 40 &&
          Array.from({ length: 8 }).map((_, i) => {
            const cx = xd + 32 + (i % 4) * 46;
            const cy = i < 4 ? -30 : 76;
            if (cx + 16 > pxe) return null;
            return (
              <g key={i} transform={`translate(${cx} ${cy})`}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
                <path d="M -10 34 Q -12 6 -7 0 L 7 0 Q 12 6 10 34 Z" />
                <circle cx={-2} cy={-11} r={9} />
                <circle cx={-6} cy={-12} r={1.7} fill={KRP.ink} stroke="none" />
              </g>
            );
          })}
      </g>
      {/* ハイライトの光 (ゆっくり脈打つ) */}
      {highlight && pw > 100 && (
        <g>
          <ellipse cx={highlight === "short" ? (xd + pxe) / 2 : (px0 + xd) / 2 + 60}
            cy={0} rx={highlight === "short" ? Math.max((pxe - xd) / 2 + 26, 60) : 430} ry={158}
            fill={KRP.yellow} opacity={0.25 * pulse} />
          <ellipse cx={highlight === "short" ? (xd + pxe) / 2 : (px0 + xd) / 2 + 60}
            cy={0} rx={highlight === "short" ? Math.max((pxe - xd) / 2 + 26, 60) : 430} ry={158}
            fill="none" stroke={KRP.orange} strokeWidth={3.5} opacity={0.8} />
        </g>
      )}
      {/* 左の軸木 (固定) */}
      <g transform={`translate(${px0 - 16} 0)`}>
        <rect x={-18} y={-192} width={36} height={384} rx={18}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-6} y1={-170} x2={-6} y2={170} stroke={SGP.woodDark} strokeWidth={3} opacity={0.7} />
        <circle cx={0} cy={-196} r={13} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={196} r={13} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 右の軸木 (開くと転がっていく) */}
      <g transform={`translate(${pxe + 16} 0)`}>
        <rect x={-18} y={-192} width={36} height={384} rx={18}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-196} r={13} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={196} r={13} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 転がりが分かる軸の印 */}
        <g transform={`rotate(${o * 540})`}>
          <line x1={-10} y1={0} x2={10} y2={0} stroke={SGP.woodDark} strokeWidth={4} />
        </g>
      </g>
    </g>
  );
};

/* ===================================================================
 * Fuda3 — 三枚札「黙って」「座って」「最初から最後まで」
 * ===================================================================
 * 縄で吊るされた木札3枚が横に並ぶ。札は TagPlate ではなく厚みのある木札
 * (上に紐穴と麻縄)。t: 0→1 で左から順にトンと下りてくる。
 * x,y は3枚の中心。s=1 で全幅約1100。
 */
export const Fuda3: React.FC<{
  f: number; x?: number; y?: number; s?: number; t?: number;
}> = ({ f, x = 960, y = 420, s = 1, t = 1 }) => {
  const fuda = [
    { tx: "黙って", cx: -415, w: 270, fs: 62 },
    { tx: "座って", cx: -115, w: 270, fs: 62 },
    { tx: "最初から最後まで", cx: 300, w: 500, fs: 52 },
  ] as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 吊り元の竿 */}
      <rect x={-580} y={-224} width={1160} height={22} rx={11}
        fill={SGP.wood} stroke={KRP.ink} strokeWidth={6.5} />
      <line x1={-560} y1={-217} x2={560} y2={-217} stroke={KRP.white} strokeWidth={3} opacity={0.55} />
      <circle cx={-580} cy={-213} r={14} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={580} cy={-213} r={14} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {fuda.map((d, i) => {
        // 左から順にトン、トン、トン (pop で少し行き過ぎて戻る)
        const tt = clamp01((clamp01(t) * 3.4 - i * 1.0) / 1.4);
        if (tt <= 0) return null;
        const drop = pop(tt);
        const yoff = (1 - drop) * -300;
        const swing = tt >= 1 ? Math.sin(f / 9 + i * 2.1) * 1.2 : (1 - tt) * 4; // 微小スイング
        const hw = d.w / 2;
        return (
          <g key={i} transform={`translate(${d.cx} ${yoff}) rotate(${swing} 0 -202)`} opacity={Math.min(tt * 2, 1)}>
            {/* 麻縄 (紐穴2つから竿へ) */}
            {[-hw * 0.56, hw * 0.56].map((rx) => (
              <g key={rx}>
                <path d={`M ${rx} -202 L ${rx * 0.92} -68`} fill="none" stroke={SGP.woodDark} strokeWidth={6} />
                <path d={`M ${rx} -202 L ${rx * 0.92} -68`} fill="none" stroke={KRP.ink}
                  strokeWidth={6} strokeDasharray="7 6" opacity={0.65} />
              </g>
            ))}
            {/* 札の厚み (右と下の側面) */}
            <path d={`M ${hw} -75 L ${hw + 12} -65 L ${hw + 12} 83 L ${-hw + 12} 83 L ${-hw} 75 Z`}
              fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
            {/* 札の面 */}
            <rect x={-hw} y={-75} width={d.w} height={150} rx={8}
              fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
            {/* 木目 2〜3本 */}
            <path d={`M ${-hw + 18} -46 Q 0 -52 ${hw - 24} -44 M ${-hw + 24} 48 Q ${-hw * 0.2} 42 ${hw - 18} 50`}
              fill="none" stroke={SGP.woodDark} strokeWidth={3} opacity={0.8} />
            <path d={`M ${-hw * 0.3} -20 Q ${-hw * 0.3 + 14} -14 ${-hw * 0.3} -8`}
              fill="none" stroke={SGP.woodDark} strokeWidth={2.5} opacity={0.7} />
            {/* 紐穴 */}
            {[-hw * 0.56, hw * 0.56].map((rx) => (
              <circle key={rx} cx={rx * 0.92} cy={-60} r={8}
                fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={4.5} />
            ))}
            {/* 文字 */}
            <text x={0} y={d.fs * 0.36 + 6} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={d.fs} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
              paintOrder="stroke" letterSpacing={2}>{d.tx}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ===================================================================
 * 検品用プレビュー (本編とは無関係。composition "SaigoParts")
 *   コマ0〜4: Danmen 状態A〜E / コマ5: Tehaisho 6枚 / コマ6: 御用印つき
 *   コマ7: SaiseiBar / コマ8: NenpyoEmaki / コマ9: Fuda3
 * =================================================================== */
export const SAIGO_PARTS_PREVIEW_FRAMES = 10;
export const SaigoPartsPreview: React.FC = () => {
  const i = Math.min(useCurrentFrame(), SAIGO_PARTS_PREVIEW_FRAMES - 1);
  const f = 45;
  const states = ["A", "B", "C", "D", "E"] as const;
  return (
    <Frame f={f} seed={990 + i}>
      {i <= 4 && <Danmen f={f} state={states[i]} t={1} />}
      {(i === 5 || i === 6) &&
        ([1, 2, 3, 4, 5, 6] as const).map((w) => (
          <Tehaisho key={w} f={f} who={w} x={260 + (w - 1) * 280} y={540}
            s={0.95} t={1} goyoT={i === 6 ? 1 : 0} />
        ))}
      {i === 7 && <SaiseiBar f={f} x={960} y={540} s={1.1} t={1} progress={0.35} />}
      {i === 8 && <NenpyoEmaki f={f} openT={1} highlight="short" />}
      {i === 9 && <Fuda3 f={f} t={1} />}
    </Frame>
  );
};
