// 「人類は、昔から飛ばして観ていた」: 文#229〜#237 (9文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1357〜1365。
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
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  brown: "#8A6B4A",       // 木の色 (椅子・柱)
  paperOld: "#EFE4C6",    // #236 絵巻の古紙
  nightWall: "#39414F",   // #229 夜のリビングの壁
  nightFloor: "#43392E",  // #229 夜の床
  sofaMoss: "#5B6B52",    // #229 住人の服
  warmWash: "#F5E6C8",    // #230 江戸側の空気
  coolWash: "#DFE9F4",    // #230 現代側の空気
  benchTan: "#CBB690",    // #230 共通の腰掛けの骨
  byobuGold: "#E3C87A",   // #230 屏風
  museumWall: "#DCE2DF",  // #231 博物館の壁
  museumFloor: "#C8D1CE", // #231 博物館の床
  glassBlue: "#EAF4F8",   // #231 ガラス
  atticWall: "#E8DBBC",   // #232 屋根裏の壁
  atticFloor: "#C8A571",  // #232 屋根裏の床板
  beamLight: "#F6E7B0",   // #232/#235 光の帯
  tableSand: "#D8C49E",   // #233 机の天板
  matCraft: "#E2D5B4",    // #234 クラフト紙のマット
  duskWall: "#39414E",    // #235 夕暮れの舞台の奥
  stageBrown: "#5A4A38",  // #235 舞台の床
  chainGray: "#9AA2AA",   // #235 外れた鎖
  certPaper: "#FCF7E9",   // #236 賞状の紙
  deskNight: "#6B5137",   // #237 夜の机
  clothRed: "#8A4A42",    // #237 敷き布
  combRed: "#C0392B",     // #230 丸髷の櫛
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目にするための擬似乱数 (毎フレーム同じ値)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
void lerp; void zoomAt; void rnd;
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #229 手元の明るいお客は、また、食べながら観て、しゃべりながら観て、途中で出入りします。
// 格: 並 / seed 1357
// 絵: 現代のソファ。スナック、コメントを打つ親指、席を立って戻る動線。ぜんぶ同時にやっている
// どこ: 夜のリビング。左にテレビ、右にソファ、右端に廊下へのドア
// 演出: スマホを持つ住人のまわりで「食べる・打つ・出入りする」が全部同時に起きている
// 動き: テレビの明滅・コメントの泡が昇る・点線の動線が流れる・小さい人がドアとソファを往復
const Sg229: React.FC<{ f: number }> = ({ f }) => {
  const tv = 0.55 + 0.25 * Math.sin(f / 2.7) + 0.12 * Math.sin(f / 7.3);
  const wt = 0.5 + 0.5 * Math.sin(f / 18); // 往復する人の位置 0..1
  const px = lerp(1340, 1760, wt);
  const py = lerp(1004, 896, wt) - Math.sin(wt * Math.PI) * 36;
  return (
    <Frame f={f} seed={1357} dark bg="#2B3240">
      {/* 部屋の骨: 壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={880} fill={C.nightWall} />
      <rect x={-20} y={840} width={W + 40} height={H - 820} fill={C.nightFloor} />
      <line x1={-20} y1={840} x2={W + 20} y2={840} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={lerp(240, -420, i / 7)} y1={H + 20}
          x2={lerp(760, 1020, i / 7)} y2={840} stroke={C.ink} strokeWidth={3} opacity={0.22} />
      ))}
      {/* 壁の小物: 時計のない絵の額と壁灯 */}
      <rect x={760} y={210} width={200} height={150} rx={8} fill="#4A5363" stroke={C.ink} strokeWidth={5} />
      <path d="M 790 330 q 60 -70 90 -26 q 30 -52 60 10" fill="none" stroke={KRP.grayDark} strokeWidth={5} />
      <g transform="translate(1180 250)">
        <path d="M -34 30 L 34 30 L 20 -22 L -20 -22 Z" fill="#5A4A3A" stroke={C.ink} strokeWidth={4.5} />
        <circle cx={0} cy={44} r={30} fill={C.beamLight} opacity={0.14 + 0.05 * Math.sin(f / 9)} />
      </g>
      {/* テレビ (左): 画面の明滅が部屋を照らす */}
      <rect x={120} y={640} width={460} height={88} rx={10} fill="#4A4036" stroke={C.ink} strokeWidth={6} />
      <line x1={160} y1={684} x2={540} y2={684} stroke={C.ink} strokeWidth={3} opacity={0.4} />
      <rect x={150} y={330} width={400} height={290} rx={10} fill={C.ink} stroke={C.ink} strokeWidth={8} />
      <rect x={166} y={346} width={368} height={252} fill="#AFD4DE" opacity={tv * 0.8} />
      <rect x={166} y={346} width={368} height={92} fill={KRP.white} opacity={tv * 0.25} />
      <polygon points="550,380 1140,560 1140,920 550,620" fill="#AFD4DE" opacity={0.05 + tv * 0.04} />
      {/* ラグとローテーブル: スナックの気配 */}
      <ellipse cx={850} cy={980} rx={430} ry={96} fill="#5A5044" stroke={C.ink} strokeWidth={6} />
      <rect x={660} y={800} width={380} height={22} rx={8} fill="#7A5C3C" stroke={C.ink} strokeWidth={6} />
      <rect x={692} y={822} width={18} height={88} fill="#5F472F" stroke={C.ink} strokeWidth={5} />
      <rect x={990} y={822} width={18} height={88} fill="#5F472F" stroke={C.ink} strokeWidth={5} />
      <ellipse cx={790} cy={794} rx={84} ry={24} fill="#C9803C" stroke={C.ink} strokeWidth={5.5} />
      <ellipse cx={790} cy={788} rx={66} ry={15} fill="#E8C98E" stroke={C.ink} strokeWidth={3.5} />
      {[0, 1, 2].map((i) => (
        <polygon key={i} points={`${744 + i * 38},${778 - (i % 2) * 8} ${764 + i * 38},${770 - (i % 2) * 8} ${758 + i * 38},${788 - (i % 2) * 8}`}
          fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
      ))}
      <rect x={918} y={740} width={44} height={62} rx={8} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={940} cy={740} rx={22} ry={7} fill={KRP.silver} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={860} cy={812} r={4} fill={KRP.yellow} opacity={0.8} />
      <circle cx={700} cy={806} r={3.4} fill={KRP.yellow} opacity={0.7} />
      {/* ソファ (右): 背もたれ→住人→座面の順で、座っているように見せる */}
      <rect x={1100} y={540} width={640} height={240} rx={26} fill="#64748C" stroke={C.ink} strokeWidth={8} />
      <rect x={1082} y={620} width={84} height={240} rx={22} fill="#7D8EA6" stroke={C.ink} strokeWidth={7} />
      <rect x={1676} y={620} width={84} height={240} rx={22} fill="#7D8EA6" stroke={C.ink} strokeWidth={7} />
      <ellipse cx={1400} cy={928} rx={200} ry={30} fill={C.ink} opacity={0.3} />
      <Person x={1400} y={915} s={1.45} cloth={C.sofaMoss} clothDark="#47543F"
        face="smile" gaze={[0, 7]} f={f} pose="hold" />
      {/* 座面クッション (脚を隠す) */}
      <rect x={1130} y={800} width={580} height={120} rx={22} fill="#7D8EA6" stroke={C.ink} strokeWidth={7} />
      <line x1={1420} y1={812} x2={1420} y2={908} stroke={C.ink} strokeWidth={4} opacity={0.4} />
      {/* スマホ: 手元の明かり */}
      <circle cx={1400} cy={600} r={120} fill={SGP.phoneBlue} opacity={0.1} />
      <rect x={1356} y={698} width={88} height={92} rx={12} fill={C.ink} stroke={C.ink} strokeWidth={5} />
      <rect x={1364} y={706} width={72} height={76} rx={7} fill={SGP.phoneBlue} opacity={0.9} />
      <circle cx={1400} cy={744} r={60} fill={SGP.phoneBlue} opacity={0.28} />
      {/* 打つ親指のタップの輪 */}
      <circle cx={1424} cy={768} r={6 + (f % 12)} fill="none" stroke={KRP.white}
        strokeWidth={3.5} opacity={Math.max(0, 0.7 - (f % 12) * 0.06)} />
      {/* コメントの泡 (ハートと点々) が昇っていく */}
      {[0, 1, 2].map((i) => {
        const yy = 660 - ((f * 1.6 + i * 46) % 150);
        const op = Math.max(0, 1 - (660 - yy) / 150);
        return (
          <g key={i} transform={`translate(${1452 + i * 26} ${yy})`} opacity={op * 0.9}>
            {i === 1 ? (
              <path d="M 0 6 C -10 -4 -7 -14 0 -10 C 7 -14 10 -4 0 6 Z"
                fill={KRP.red} stroke={C.ink} strokeWidth={3} />
            ) : (
              <g>
                <rect x={-16} y={-14} width={32} height={22} rx={10}
                  fill={KRP.white} stroke={C.ink} strokeWidth={3} />
                <circle cx={-7} cy={-3} r={2} fill={C.ink} />
                <circle cx={0} cy={-3} r={2} fill={C.ink} />
                <circle cx={7} cy={-3} r={2} fill={C.ink} />
              </g>
            )}
          </g>
        );
      })}
      {/* 右端のドア: 廊下の明かりがひとすじ */}
      <rect x={1800} y={310} width={110} height={570} fill="#4A4036" stroke={C.ink} strokeWidth={6} />
      <rect x={1816} y={326} width={78} height={538} fill="#5F5243" stroke={C.ink} strokeWidth={5} />
      <rect x={1894} y={326} width={14} height={538} fill={C.beamLight} opacity={0.5 + 0.1 * Math.sin(f / 6)} />
      <circle cx={1836} cy={600} r={6} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
      {/* 席を立って戻る動線 (両向きの点線) */}
      <path d="M 1330 1000 Q 1560 1040 1790 900" fill="none" stroke={KRP.yellow}
        strokeWidth={6} strokeDasharray="16 18" strokeDashoffset={-f * 2} opacity={0.55} />
      <path d="M 1790 860 Q 1540 960 1310 960" fill="none" stroke={KRP.gray}
        strokeWidth={6} strokeDasharray="16 18" strokeDashoffset={-f * 2} opacity={0.5} />
      <polygon points="1790,900 1756,886 1766,914" fill={KRP.yellow} opacity={0.75} />
      <polygon points="1310,960 1344,948 1340,976" fill={KRP.gray} opacity={0.7} />
      {/* 往復している本人 (もうひとつの手) */}
      <PersonMini x={px} y={py} s={0.72} color="#8C6E54" f={f} phase={3} face="dot" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #230 江戸の桟敷と、やっていることは、ほとんど同じです。
// 格: 山 / seed 1358
// 絵 (修正3でブラッシュアップ): 左右の鏡写し。左=江戸の桟敷 (暖) / 右=いまの部屋 (寒) を同じ密度で描く。
//   同じしぐさの2人が鏡の同じ位置・同じポーズで並び 同じ揺れで動く:
//     外側  弁当を広げる江戸の客 ↔ スナックをつまむいまの人
//     中    隣としゃべる江戸の客 ↔ スマホでコメントを打ついまの人
//     内側  桟敷の戸口へ立つ江戸の客 ↔ タブを切り替えるいまの人 (どちらも ⇄)
//   対になる2人を頭上の点線の弧で結び 弧のてっぺん (中央) に対応の札3枚
// 動き: 対の2人が同じ位相で揺れる / 弧が両端から伸びて中央で結ばれ札がポン / 湯気・コメント・タブ・のれんが動く
// ★人物ローカル座標で衣装を重ねる入れ物 (掟3章の契約)
const Kasane: React.FC<{
  x: number; y: number; s?: number; lean?: number; f: number; phase?: number;
  back?: React.ReactNode; front?: React.ReactNode; children: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f, phase = 0, back, front, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {back}{children}{front}
    </g>
  );
};
// 着物の袂 (胴の後ろ) / 衿 (右前・あごより下) と帯 / 髷 or 丸髷
const KimonoBack: React.FC<{ cloth: string }> = ({ cloth }) => (
  <g fill={cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round">
    <path d="M -100 -150 L -52 -156 L -52 -74 Q -52 -60 -76 -60 Q -100 -60 -100 -76 Z" />
    <path d="M 100 -150 L 52 -156 L 52 -74 Q 52 -60 76 -60 Q 100 -60 100 -76 Z" />
  </g>
);
const KimonoFront: React.FC<{ obi: string; hair: "mage" | "marumage" }> = ({ obi, hair }) => (
  <g>
    <g fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round">
      <path d="M -40 -158 L -24 -162 L 2 -126 L -6 -116 Z" />
      <path d="M 40 -158 L 24 -162 L -14 -104 L -26 -110 Z" />
    </g>
    <rect x={-60} y={-98} width={120} height={26} rx={5} fill={obi} stroke={C.ink} strokeWidth={4.5} />
    {hair === "mage" ? (
      <path d="M -16 -288 Q 4 -312 34 -300 L 30 -288 Q 8 -296 -10 -282 Z" fill={C.ink} />
    ) : (
      <g>
        <ellipse cx={0} cy={-300} rx={44} ry={26} fill={C.ink} />
        <rect x={-34} y={-286} width={68} height={10} rx={5} fill={C.combRed} stroke={C.ink} strokeWidth={3} />
      </g>
    )}
  </g>
);
// いまの部屋着: パーカー (フード+ひも) / カーディガン (前あき+ボタン) / Tシャツ (丸首)
const ImaBack: React.FC<{ kind: "hood" | "cardi" | "tee"; cloth: string }> = ({ kind, cloth }) =>
  kind === "hood" ? (
    <path d="M -58 -150 Q -76 -186 -44 -196 L 44 -196 Q 76 -186 58 -150 Z"
      fill={cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  ) : null;
const ImaFront: React.FC<{ kind: "hood" | "cardi" | "tee"; dark: string }> = ({ kind, dark }) => (
  <g>
    {kind === "hood" && (
      <g>
        <path d="M -34 -160 Q 0 -146 34 -160" fill="none" stroke={dark} strokeWidth={6} strokeLinecap="round" />
        <g stroke={KRP.white} strokeWidth={4} strokeLinecap="round">
          <line x1={-12} y1={-154} x2={-14} y2={-136} />
          <line x1={12} y1={-154} x2={14} y2={-136} />
        </g>
      </g>
    )}
    {kind === "cardi" && (
      <g>
        <path d="M -26 -160 L 0 -128 L 26 -160" fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 0 -128 L 0 -60" stroke={dark} strokeWidth={5} />
        {[-100, -80].map((by) => <circle key={by} cx={-8} cy={by} r={4} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />)}
      </g>
    )}
    {kind === "tee" && (
      <path d="M -28 -160 Q 0 -138 28 -160" fill="none" stroke={dark} strokeWidth={6} strokeLinecap="round" />
    )}
  </g>
);
// ⇄ (出入り / 切り替え の共通記号)
const Swap: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const d = Math.sin(f / 7) * 6;
  return (
    <g transform={`translate(${x} ${y})`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${-30 - d} -10 L ${30 - d} -10 L ${18 - d} -22`} />
      <path d={`M ${30 + d} 12 L ${-30 + d} 12 L ${-18 + d} 24`} />
    </g>
  );
};

const Sg230: React.FC<{ f: number }> = ({ f }) => {
  const FOOT = 770;   // 全員の足元 (腰から下は手すり/座面で隠す)
  const PS = 1.0;
  const z = 1 + easeOut(clamp01(f / 120)) * 0.03;
  // 対の位置 (左右の鏡写し)
  const EX = [170, 470, 740];          // 江戸: 弁当 / おしゃべり / 出入り
  const MX = [1750, 1450, 1180];       // いま: スナック / コメント / タブ切替
  const PH = [0, 3, 7];                // 対ごとに同じ位相 = 同じ揺れ (f=45 でまばたきに当たらない値)
  const AY = 446;                      // 弧の端 (頭の上)
  const APEX = [150, 262, 372];        // 弧のてっぺん = 札の高さ
  const LABEL = ["弁当=スナック", "おしゃべり=コメント", "出入り=タブ切替"];
  // 弧 (2次ベジェ) を両端から p まで伸ばした折れ線
  const arcPts = (i: number, p: number) => {
    const x0 = EX[i]; const x1 = MX[i];
    const cy = 2 * APEX[i] - AY;
    const pt = (t: number) => {
      const u = 1 - t;
      return [u * u * x0 + 2 * u * t * 960 + t * t * x1, u * u * AY + 2 * u * t * cy + t * t * AY];
    };
    const half = p / 2; const N = 24;
    const L = [...Array(N + 1)].map((_, k) => pt((k / N) * half));
    const R = [...Array(N + 1)].map((_, k) => pt(1 - (k / N) * half));
    const toD = (ps: number[][]) => ps.map(([x, y], k) => `${k ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return [toD(L), toD(R)];
  };
  const arcP = (i: number) => easeOut(seg(f, 8 + i * 6, 22 + i * 6));
  const tagT = (i: number) => seg(f, 20 + i * 6, 28 + i * 6);
  return (
    <Frame f={f} seed={1358}>
      <g transform={zoomAt(z, 960, 520)}>
        {/* ================= 左: 江戸の桟敷 (暖) ================= */}
        <rect x={-30} y={-30} width={990} height={H + 60} fill={C.warmWash} />
        {/* 板壁と柱 */}
        {[...Array(7)].map((_, i) => (
          <line key={i} x1={20 + i * 140} y1={170} x2={20 + i * 140} y2={710} stroke="#E3CC9A" strokeWidth={6} />
        ))}
        <rect x={-30} y={150} width={990} height={26} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
        <rect x={318} y={176} width={22} height={540} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
        <rect x={618} y={176} width={22} height={540} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
        {/* 梁の上の提灯 (札の高さより上・左上のバッジを避ける) */}
        {[520, 780].map((lx2, i) => (
          <g key={i} transform={`translate(${lx2} 20) rotate(${Math.sin(f / 10 + i * 2) * 3} 0 0)`}>
            <line x1={0} y1={0} x2={0} y2={30} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={0} cy={84} r={60} fill={C.beamLight} opacity={0.28 + 0.08 * Math.sin(f / 5 + i)} />
            <ellipse cx={0} cy={84} rx={38} ry={50} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
            <path d="M -36 70 Q 0 76 36 70 M -37 94 Q 0 100 37 94" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
            <rect x={-18} y={28} width={36} height={10} fill={C.ink} />
            <rect x={-18} y={130} width={36} height={10} fill={C.ink} />
          </g>
        ))}
        {/* 桟敷の戸口 (内側の人の右): のれんが揺れる */}
        <rect x={848} y={472} width={96} height={240} fill="#5A4636" stroke={C.ink} strokeWidth={6} />
        <rect x={840} y={462} width={112} height={16} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${854 + i * 44} 478 L ${894 + i * 44} 478 L ${894 + i * 44 + Math.sin(f / 8 + i) * 4} 586 L ${854 + i * 44 + Math.sin(f / 8 + i) * 4} 586 Z`}
            fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
        ))}
        <Swap x={896} y={428} f={f} />

        {/* ================= 右: いまの部屋 (寒) ================= */}
        <rect x={960} y={-30} width={990} height={H + 60} fill={C.coolWash} />
        {/* 壁紙の細い縞と巾木 */}
        {[...Array(7)].map((_, i) => (
          <line key={i} x1={1040 + i * 140} y1={170} x2={1040 + i * 140} y2={600} stroke="#CFDCEA" strokeWidth={6} />
        ))}
        <rect x={960} y={150} width={990} height={26} fill="#AFC0D2" stroke={C.ink} strokeWidth={6} />
        {/* ペンダントライト (提灯と鏡の位置) */}
        {[1400, 1140].map((lx2, i) => (
          <g key={i} transform={`translate(${lx2} 20) rotate(${Math.sin(f / 10 + i * 2) * 3} 0 0)`}>
            <line x1={0} y1={0} x2={0} y2={60} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={0} cy={104} r={56} fill={C.beamLight} opacity={0.24 + 0.06 * Math.sin(f / 6 + i)} />
            <path d="M -44 104 L 44 104 L 24 60 L -24 60 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <ellipse cx={0} cy={110} rx={14} ry={7} fill={C.beamLight} />
          </g>
        ))}
        {/* ソファの背もたれ (人物の後ろ) */}
        <rect x={1000} y={590} width={900} height={140} rx={30} fill="#7486A0" stroke={C.ink} strokeWidth={7} />
        {[1300, 1600].map((sx) => (
          <line key={sx} x1={sx} y1={606} x2={sx} y2={716} stroke={C.ink} strokeWidth={4} opacity={0.35} />
        ))}
        {/* タブの束 (内側の人の左。戸口の鏡の位置) */}
        <g transform={`translate(1046 ${606 + Math.sin(f / 9) * 4})`}>
          {[2, 1, 0].map((k) => {
            const sw = k === 0 ? Math.sin(f / 7) * 10 : 0;
            return (
              <g key={k} transform={`translate(${-k * 14 + sw} ${-k * 18})`}>
                <rect x={-50} y={-44} width={100} height={84} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
                <rect x={-50} y={-44} width={44} height={18} rx={6} fill={[SGP.phoneBlue, KRP.yellow, KRP.green][k]} stroke={C.ink} strokeWidth={4} />
                <line x1={-36} y1={-6} x2={30} y2={-6} stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" />
                <line x1={-36} y1={14} x2={14} y2={14} stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
        <Swap x={1040} y={470} f={f + 20} />

        {/* ================= 人物: 左右の鏡写し ================= */}
        {/* 江戸1: 弁当を広げる */}
        <Kasane x={EX[0]} y={FOOT} s={PS} f={f} phase={PH[0]}
          back={<KimonoBack cloth="#8A5A3C" />}
          front={
            <g>
              <KimonoFront obi="#3E4B66" hair="mage" />
              <g transform="translate(0 -116)">
                <rect x={-62} y={-20} width={124} height={38} rx={6} fill={C.ink} />
                <rect x={-54} y={-14} width={108} height={26} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
                <line x1={-18} y1={-14} x2={-18} y2={12} stroke={C.ink} strokeWidth={3} />
                <line x1={18} y1={-14} x2={18} y2={12} stroke={C.ink} strokeWidth={3} />
                <circle cx={-36} cy={-1} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={2.5} />
                <circle cx={0} cy={-1} r={9} fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} />
                <rect x={28} y={-9} width={18} height={16} fill={KRP.green} stroke={C.ink} strokeWidth={2.5} />
                <line x1={30} y1={-4} x2={60} y2={-36} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
                <line x1={38} y1={-2} x2={68} y2={-32} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
                {[0, 1].map((k) => (
                  <path key={k} d={`M ${-30 + k * 40} -24 q ${Math.sin(f / 8 + k * 2) * 8} -14 0 -30`}
                    fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.45} strokeLinecap="round" />
                ))}
              </g>
            </g>
          }>
          <Person x={0} y={0} s={1} f={f} phase={PH[0]} still cloth="#8A5A3C" clothDark="#6E4028" face="smile" pose="hold" gaze={[0, 4]} />
        </Kasane>
        {/* 江戸2: 隣としゃべる (丸髷の女の人) */}
        <Kasane x={EX[1]} y={FOOT} s={PS} f={f} phase={PH[1]}
          back={<KimonoBack cloth="#9C5A78" />}
          front={
            <g>
              <KimonoFront obi={C.byobuGold} hair="marumage" />
              {/* 手元: 湯呑み */}
              <g transform="translate(0 -112)">
                <path d="M -18 -24 L 18 -24 L 14 10 L -14 10 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
                <rect x={-16} y={-16} width={32} height={7} fill={KRP.green} opacity={0.6} />
              </g>
            </g>
          }>
          <Person x={0} y={0} s={1} f={f} phase={PH[1]} still cloth="#9C5A78" clothDark="#7A4560" face="joy" pose="hold" />
        </Kasane>
        {/* 江戸3: 戸口の方へ立ちかける (出入り) */}
        <Kasane x={EX[2]} y={FOOT} s={PS} f={f} phase={PH[2]} lean={6}
          back={<KimonoBack cloth="#55658A" />}
          front={<KimonoFront obi={SGP.woodDark} hair="mage" />}>
          <Person x={0} y={0} s={1} f={f} phase={PH[2]} still cloth="#55658A" clothDark="#41506F" face="smile" pose="point" pointDir={1} gaze={[6, 0]} />
        </Kasane>
        {/* いま1: スナックをつまむ */}
        <Kasane x={MX[0]} y={FOOT} s={PS} f={f} phase={PH[0]}
          back={<ImaBack kind="tee" cloth="#C9803C" />}
          front={
            <g>
              <ImaFront kind="tee" dark="#9E5F28" />
              <g transform="translate(0 -116)">
                <path d="M -50 -26 L 50 -26 L 44 22 L -44 22 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
                <path d="M -50 -26 L -40 -34 L -26 -24 L -10 -34 L 6 -24 L 22 -34 L 38 -24 L 50 -26" fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
                <circle cx={0} cy={0} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
                {[-26, -6, 16].map((cx, k) => (
                  <path key={k} d={`M ${cx} -32 l 14 -10 l 6 12 Z`} fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5}
                    transform={`translate(0 ${Math.sin(f / 6 + k) * 2})`} />
                ))}
              </g>
            </g>
          }>
          <Person x={0} y={0} s={1} f={f} phase={PH[0]} still cloth="#C9803C" clothDark="#9E5F28" face="smile" pose="hold" gaze={[0, 4]} />
        </Kasane>
        {/* いま2: スマホでコメントを打つ */}
        <Kasane x={MX[1]} y={FOOT} s={PS} f={f} phase={PH[1]}
          back={<ImaBack kind="hood" cloth={C.sofaMoss} />}
          front={
            <g>
              <ImaFront kind="hood" dark="#47543F" />
              <g transform="translate(0 -118)">
                <rect x={-24} y={-30} width={48} height={60} rx={8} fill={C.ink} />
                <rect x={-18} y={-24} width={36} height={46} rx={4} fill={SGP.phoneBlue} />
                <circle cx={10} cy={14} r={4 + (f % 12) * 0.6} fill="none" stroke={KRP.white} strokeWidth={2.5}
                  opacity={Math.max(0, 0.8 - (f % 12) * 0.07)} />
              </g>
            </g>
          }>
          <Person x={0} y={0} s={1} f={f} phase={PH[1]} still cloth={C.sofaMoss} clothDark="#47543F" face="joy" pose="hold" />
        </Kasane>
        {/* いま3: タブを切り替える (タブの方へ身を乗り出す) */}
        <Kasane x={MX[2]} y={FOOT} s={PS} f={f} phase={PH[2]} lean={-6}
          back={<ImaBack kind="cardi" cloth="#7E93A8" />}
          front={<ImaFront kind="cardi" dark="#5E7186" />}>
          <Person x={0} y={0} s={1} f={f} phase={PH[2]} still cloth="#7E93A8" clothDark="#5E7186" face="smile" pose="point" pointDir={-1} gaze={[-6, 0]} />
        </Kasane>

        {/* おしゃべりの吹き出し (江戸) と コメントの吹き出し (いま): 鏡の同じ位置 */}
        <g transform={`translate(324 ${470 + Math.sin(f / 8) * 5})`}>
          <path d="M -54 -34 Q -54 -54 -34 -54 L 34 -54 Q 54 -54 54 -34 L 54 0 Q 54 18 34 18 L 30 18 L 44 40 L 6 18 L -34 18 Q -54 18 -54 0 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" transform="scale(-1 1)" />
          {[-20, 0, 20].map((cx) => <circle key={cx} cx={cx} cy={-18} r={6} fill={C.ink} />)}
        </g>
        <g transform={`translate(1596 ${470 + Math.sin(f / 8) * 5})`}>
          <path d="M -54 -34 Q -54 -54 -34 -54 L 34 -54 Q 54 -54 54 -34 L 54 0 Q 54 18 34 18 L 30 18 L 44 40 L 6 18 L -34 18 Q -54 18 -54 0 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          {[-20, 0, 20].map((cx) => <circle key={cx} cx={cx} cy={-18} r={6} fill={C.ink} />)}
          {/* コメントのハートが ひとつずつ昇る */}
          <path transform={`translate(52 ${-62 - (f % 30)})`} opacity={Math.max(0, 1 - (f % 30) / 30)}
            d="M 0 8 C -12 -4 -8 -16 0 -11 C 8 -16 12 -4 0 8 Z" fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        </g>

        {/* ================= 手前: 桟敷の手すり (左) と ソファの座面 (右) ================= */}
        <rect x={-30} y={700} width={990} height={28} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
        <path d="M -30 724 L 960 724 L 960 790 Q 940 778 920 790 Q 900 778 880 790 L -30 790 Z"
          fill={KRP.red} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -30 740 L 960 740" stroke="#A8302A" strokeWidth={4} opacity={0.7} />
        <rect x={-30} y={790} width={990} height={320} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
        {/* 手すりの上: 江戸の小物 */}
        <g transform="translate(620 700)">
          <path d="M -26 -40 L 26 -40 L 20 0 L -20 0 Z" fill="#E8E0CC" stroke={C.ink} strokeWidth={5} />
          <path d="M -30 -46 L 30 -46" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
        <rect x={960} y={712} width={990} height={120} rx={24} fill="#8C9DB4" stroke={C.ink} strokeWidth={7} />
        {[1300, 1600].map((sx) => (
          <line key={sx} x1={sx} y1={724} x2={sx} y2={820} stroke={C.ink} strokeWidth={4} opacity={0.35} />
        ))}
        <rect x={960} y={832} width={990} height={280} fill={C.nightFloor} opacity={0.35} />
        {/* 座面の上: いまの小物 (湯呑みの鏡の位置にマグカップ) */}
        <g transform="translate(1300 712)">
          <rect x={-22} y={-42} width={44} height={42} rx={6} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={5} />
          <path d="M 22 -32 q 16 0 16 12 q 0 12 -16 12" fill="none" stroke={C.ink} strokeWidth={5} />
        </g>

        {/* ================= 中央の継ぎ目 ================= */}
        <rect x={950} y={-30} width={20} height={H + 60} fill={KRP.white} opacity={0.7} />
        <line x1={960} y1={-30} x2={960} y2={H + 30} stroke={C.ink} strokeWidth={4} strokeDasharray="14 12" opacity={0.4} />

        {/* ================= 対応の弧と札 ================= */}
        {[0, 1, 2].map((i) => {
          const p = arcP(i);
          if (p <= 0) return null;
          const [dl, dr] = arcPts(i, p);
          return (
            <g key={i} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="12 12" strokeLinecap="round" opacity={0.75}>
              <path d={dl} />
              <path d={dr} />
              <circle cx={EX[i]} cy={AY} r={7} fill={C.ink} stroke="none" />
              <circle cx={MX[i]} cy={AY} r={7} fill={C.ink} stroke="none" />
            </g>
          );
        })}
        {LABEL.map((t, i) => (
          <TagPlate key={i} x={960} y={APEX[i]} size={30} text={t} t={tagT(i)} fill={KRP.white} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #231 「黙って、座って、最初から最後まで」。
// 格: 図 / seed 1359
// 絵: `Fuda3` の三枚札が、博物館のガラスケースにそっと収蔵される。「19〜20世紀の道具」の解説プレート
// どこ: 博物館の展示室。羽目板の壁・磨かれた床・天井のスポットライト
// 演出: 三枚札が台座に下り、上からガラスケースがそっと降りて収蔵される。真鍮の解説プレート
// 動き: 札が順に下りる→ガラスが降りる→プレートが現れる。光の帯の中をほこりが舞う
const Sg231: React.FC<{ f: number }> = ({ f }) => {
  const glass = easeOut(seg(f, 24, 42)); // ガラスの降下
  const gy = (1 - glass) * -360;
  const spot = 0.09 + 0.04 * Math.sin(f / 9);
  return (
    <Frame f={f} seed={1359} bg="#E7ECEA">
      {/* 壁: 羽目板と腰板 */}
      <rect x={-20} y={-20} width={W + 40} height={790} fill={C.museumWall} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={i * 260 - 60} y1={-20} x2={i * 260 - 60} y2={560}
          stroke={C.ink} strokeWidth={3} opacity={0.15} />
      ))}
      <rect x={-20} y={560} width={W + 40} height={26} fill="#C2CAC6" stroke={C.ink} strokeWidth={4} />
      <rect x={-20} y={586} width={W + 40} height={184} fill="#CFD7D3" />
      {/* 床: 磨かれた石 (うっすら映り込み) */}
      <rect x={-20} y={770} width={W + 40} height={330} fill={C.museumFloor} />
      <line x1={-20} y1={770} x2={W + 20} y2={770} stroke={C.ink} strokeWidth={6} />
      <polygon points="700,790 900,790 760,1080 480,1080" fill={KRP.white} opacity={0.18} />
      <polygon points="1240,790 1340,790 1500,1080 1340,1080" fill={KRP.white} opacity={0.14} />
      {/* 天井のスポットライト2灯と光の帯 */}
      {[700, 1220].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 34} y={10} width={68} height={34} rx={10} fill={C.ink} />
          <circle cx={lx} cy={48} r={13} fill={C.beamLight} opacity={0.9} />
          <polygon points={`${lx - 22},54 ${lx + 22},54 ${1050 + i * -60},640 ${790 + i * 60},640`}
            fill={C.beamLight} opacity={spot} />
        </g>
      ))}
      {/* 光の帯の中のほこり */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={820 + rnd(31, i) * 300}
          cy={(((rnd(32, i) * 500 + 120 - f * (0.4 + rnd(33, i) * 0.5)) % 480) + 480) % 480 + 120}
          r={2.2 + rnd(34, i) * 1.6} fill={KRP.white} opacity={0.5} />
      ))}
      {/* 台座 */}
      <rect x={470} y={648} width={980} height={22} rx={6} fill="#CBB690" stroke={C.ink} strokeWidth={6} />
      <rect x={500} y={670} width={920} height={180} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
      <path d="M 540 710 Q 760 704 980 712 M 1040 790 Q 1240 784 1390 792"
        fill="none" stroke={SGP.woodDark} strokeWidth={3} opacity={0.7} />
      {/* ケース内の支柱2本 (札の竿を受ける) */}
      <rect x={594} y={368} width={14} height={280} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
      <rect x={1312} y={368} width={14} height={280} fill={SGP.woodDark} stroke={C.ink} strokeWidth={4} />
      {/* 三枚札 (そっと下りてくる) */}
      <Fuda3 f={f} x={960} y={520} s={0.7} t={seg(f, 2, 30)} />
      {/* ガラスケース (上から降りる) */}
      <g transform={`translate(0 ${gy})`}>
        <rect x={540} y={330} width={840} height={330} fill={C.glassBlue} opacity={0.22} />
        <rect x={540} y={330} width={840} height={330} fill="none" stroke={KRP.silver} strokeWidth={7} />
        <rect x={540} y={330} width={840} height={330} fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.6} />
        <rect x={530} y={316} width={860} height={18} rx={6} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />
        <circle cx={960} cy={306} r={10} fill={KRP.silver} stroke={C.ink} strokeWidth={3.5} />
        <line x1={580} y1={620} x2={760} y2={370} stroke={KRP.white} strokeWidth={6} opacity={0.5} />
        <line x1={620} y1={630} x2={790} y2={394} stroke={KRP.white} strokeWidth={3} opacity={0.4} />
      </g>
      {/* 真鍮の解説プレート */}
      <g transform={`translate(960 740) scale(${pop(seg(f, 32, 42))})`}>
        <rect x={-200} y={-34} width={400} height={68} rx={8}
          fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <rect x={-188} y={-24} width={376} height={48} rx={5}
          fill="none" stroke={C.ink} strokeWidth={2} opacity={0.5} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800}
          fontSize={34} fill={C.ink}>19〜20世紀の道具</text>
      </g>
      {/* 立入りの縄 (手前) */}
      {[320, 1600].map((px2, i) => (
        <g key={i} transform={`translate(${px2} 1010)`}>
          <circle cx={0} cy={-170} r={16} fill={KRP.brass} stroke={C.ink} strokeWidth={4.5} />
          <rect x={-9} y={-158} width={18} height={158} fill="#7C8780" stroke={C.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={0} rx={52} ry={14} fill="#6E7972" stroke={C.ink} strokeWidth={4.5} />
        </g>
      ))}
      <path d={`M 320 860 Q 960 ${960 + Math.sin(f / 16) * 6} 1600 860`}
        fill="none" stroke={KRP.red} strokeWidth={9} opacity={0.85} />
      {/* 見学する人 (観察者のまなざし) */}
      <PersonMini x={220} y={1014} s={1.15} color={KRP.blueDeep} f={f} phase={2} face="dot" />
      <PersonMini x={330} y={1030} s={0.8} color={KRP.orange} f={f} phase={6} face="dot" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #232 それは人類の伝統ではなく、19世紀に発明され、20世紀に行き渡った、150年ものの道具でした。
// 格: 山 / seed 1360
// 絵: 総括。納品書付きの木箱。「規律一式 — 19世紀製造・20世紀出荷」の焼き印。蓋は開いていて、中に三枚札と暗闇と時刻表
// どこ: 屋根裏の納戸。左の窓から光の帯、床は板張り、奥に棚
// 演出: 蓋の開いた木箱が主役。焼き印「規律一式」、荷札の納品書、中に三枚札の小札と暗闇と時刻表
// 動き: ゆっくり寄るカメラ・納品書が風で揺れる・光の帯をほこりが流れる・住人が指差す
const Sg232: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.05;
  const sway = Math.sin(f / 9) * 4;
  return (
    <Frame f={f} seed={1360} bg="#EFE3C8">
      <g transform={zoomAt(z, 820, 620)}>
        {/* 壁と梁 */}
        <rect x={-20} y={-20} width={W + 40} height={900} fill={C.atticWall} />
        <rect x={1240} y={-20} width={36} height={900} fill={SGP.woodDark} opacity={0.5} />
        <path d="M 1258 200 L 1680 -20" stroke={SGP.woodDark} strokeWidth={26} opacity={0.4} />
        {/* 床板 */}
        <rect x={-20} y={860} width={W + 40} height={240} fill={C.atticFloor} />
        <line x1={-20} y1={860} x2={W + 20} y2={860} stroke={C.ink} strokeWidth={7} />
        {[930, 1000, 1070].map((fy) => (
          <line key={fy} x1={-20} y1={fy} x2={W + 20} y2={fy} stroke={C.ink} strokeWidth={3} opacity={0.25} />
        ))}
        {[260, 760, 1300, 1700].map((jx, i) => (
          <line key={i} x1={jx} y1={870 + i * 60} x2={jx} y2={920 + i * 60}
            stroke={C.ink} strokeWidth={3} opacity={0.25} />
        ))}
        {/* 窓 (左上) と光の帯 */}
        <rect x={160} y={110} width={360} height={310} fill="#DCEAF2" stroke={C.ink} strokeWidth={8} />
        <line x1={340} y1={110} x2={340} y2={420} stroke={C.ink} strokeWidth={7} />
        <line x1={160} y1={265} x2={520} y2={265} stroke={C.ink} strokeWidth={7} />
        <rect x={146} y={420} width={388} height={18} rx={5} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
        <polygon points="500,150 540,150 1080,440 760,440" fill={C.beamLight} opacity={0.12} />
        {Array.from({ length: 9 }, (_, i) => {
          const t = ((rnd(41, i) * 100 + f * (0.6 + rnd(42, i))) % 100) / 100;
          return <circle key={i} cx={lerp(520, 980, t)} cy={lerp(170 + rnd(43, i) * 120, 440, t)}
            r={2 + rnd(44, i) * 2} fill={KRP.white} opacity={0.55} />;
        })}
        {/* 奥の棚 */}
        <rect x={1420} y={240} width={420} height={16} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
        <rect x={1420} y={460} width={420} height={16} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
        {[1460, 1570, 1690].map((bx, i) => (
          <rect key={i} x={bx} y={300 + (i % 2) * 18} width={80} height={142 - (i % 2) * 18}
            fill={i === 1 ? "#A8B59E" : "#C9B88E"} stroke={C.ink} strokeWidth={4.5} opacity={0.85} />
        ))}
        <ellipse cx={1500} cy={252} rx={34} ry={10} fill="#8E9DAB" stroke={C.ink} strokeWidth={3.5} opacity={0.7} />
        {/* 立てかけた蓋 (左) */}
        <polygon points="150,920 240,920 430,430 352,430" fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <line x1={212} y1={880} x2={376} y2={470} stroke={SGP.woodDark} strokeWidth={4} opacity={0.8} />
        <circle cx={198} cy={890} r={4} fill={C.ink} />
        <circle cx={388} cy={462} r={4} fill={C.ink} />
        {/* ===== 木箱 (主役) ===== */}
        {/* 右の側面 (奥行き) */}
        <polygon points="1140,430 1262,378 1262,812 1140,862" fill={SGP.woodDark} stroke={C.ink} strokeWidth={7} />
        <line x1={1160} y1={470} x2={1244} y2={430} stroke={C.ink} strokeWidth={3} opacity={0.4} />
        {/* 口の中: 暗闇 */}
        <polygon points="380,430 490,376 1252,376 1140,430" fill={SGP.nightInk} stroke={C.ink} strokeWidth={6} />
        <polygon points="470,414 560,384 1180,384 1096,414" fill="#1E242E" />
        {/* 中身: 三枚札の小札と丸めた時刻表 */}
        <g transform="translate(570 404) rotate(-6)">
          <rect x={-48} y={-40} width={96} height={44} rx={6} fill={SGP.wood} stroke={C.ink} strokeWidth={4} />
          <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={24} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} paintOrder="stroke">黙って</text>
        </g>
        <g transform="translate(730 400) rotate(4)">
          <rect x={-48} y={-40} width={96} height={44} rx={6} fill={SGP.wood} stroke={C.ink} strokeWidth={4} />
          <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={24} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} paintOrder="stroke">座って</text>
        </g>
        <g transform="translate(950 402) rotate(-3)">
          <rect x={-92} y={-40} width={184} height={44} rx={6} fill={SGP.wood} stroke={C.ink} strokeWidth={4} />
          <text x={0} y={-9} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={20} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} paintOrder="stroke">最初から最後まで</text>
        </g>
        <g transform="translate(1110 398) rotate(10)">
          <rect x={-18} y={-44} width={36} height={52} rx={4} fill={SGP.paper} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-44} rx={18} ry={7} fill={SGP.paperOld} stroke={C.ink} strokeWidth={3.5} />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={15} fill={C.ink}>時刻表</text>
        </g>
        {/* 前面: 焼き印と帯金 */}
        <rect x={380} y={430} width={760} height={432} fill={SGP.wood} stroke={C.ink} strokeWidth={8} />
        <line x1={380} y1={560} x2={1140} y2={560} stroke={C.ink} strokeWidth={3.5} opacity={0.35} />
        <line x1={380} y1={720} x2={1140} y2={720} stroke={C.ink} strokeWidth={3.5} opacity={0.35} />
        <path d="M 420 490 Q 600 482 760 492 M 860 790 Q 1000 782 1110 792"
          fill="none" stroke={SGP.woodDark} strokeWidth={3} opacity={0.7} />
        {[[398, 448], [1122, 448], [398, 844], [1122, 844]].map(([nx, ny], i) => (
          <circle key={i} cx={nx} cy={ny} r={4.5} fill={C.ink} />
        ))}
        {/* 焼き印: 規律一式 / 19世紀製造 / 20世紀出荷 */}
        <rect x={548} y={482} width={424} height={128} rx={10}
          fill="none" stroke={SGP.woodDark} strokeWidth={7} />
        <text x={760} y={576} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={82} fill={SGP.woodDark} letterSpacing={8}>規律一式</text>
        <text x={620} y={692} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={40} fill={SGP.woodDark} opacity={0.95}>19世紀製造</text>
        <text x={906} y={692} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={40} fill={SGP.woodDark} opacity={0.95}>20世紀出荷</text>
        <path d="M 560 740 L 960 744" stroke={SGP.woodDark} strokeWidth={4} opacity={0.6} />
        {/* 納品書の荷札 (紐で吊られて揺れる) */}
        <g transform={`rotate(${sway} 408 452)`}>
          <line x1={408} y1={452} x2={370} y2={540} stroke={SGP.woodDark} strokeWidth={4} />
          <g transform="translate(348 640) rotate(-8)">
            <rect x={-80} y={-100} width={160} height={210} fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
            <circle cx={0} cy={-78} r={8} fill={C.atticWall} stroke={C.ink} strokeWidth={4} />
            <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={30} fill={C.ink}>納品書</text>
            <line x1={-56} y1={-6} x2={56} y2={-6} stroke={C.ink} strokeWidth={3} opacity={0.6} />
            <line x1={-56} y1={28} x2={56} y2={28} stroke={C.ink} strokeWidth={3} opacity={0.4} />
            <line x1={-56} y1={62} x2={30} y2={62} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          </g>
        </g>
        {/* 床の気配: かんなくず・釘・バール */}
        <path d="M 540 930 q 14 -22 30 -6 q 14 14 -4 22 q -16 8 -26 -16" fill="none"
          stroke="#A87F4C" strokeWidth={5} />
        <path d="M 1180 968 q 12 -18 26 -6 q 12 12 -4 20" fill="none" stroke="#A87F4C" strokeWidth={5} />
        <line x1={660} y1={980} x2={700} y2={972} stroke={KRP.grayDark} strokeWidth={5} />
        <line x1={690} y1={996} x2={722} y2={992} stroke={KRP.grayDark} strokeWidth={5} />
        <path d="M 1300 1000 L 1480 960 Q 1510 954 1512 974" fill="none"
          stroke={KRP.grayDark} strokeWidth={10} strokeLinecap="round" />
        {/* 住人: 箱を指差して眺める */}
        <ellipse cx={1680} cy={1012} rx={120} ry={24} fill={C.ink} opacity={0.14} />
        <Person x={1680} y={1002} s={1.5} cloth={KRP.blueDeep} clothDark="#2F5590"
          face="smile" gaze={[-5, 3]} f={f} pose="point" pointDir={-1} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #233 道具ですから、使い続けるのも、手放すのも、自由です。
// 格: 図 / seed 1361
// 絵: 木箱の横に二枚の札「使う」「しまう」。どちらにも○。選ぶ手がどちらにも伸ばせる位置に
// どこ: 夕方の机の上。壁に針だけの時計と棚、天板に小さくなった木箱
// 演出: 「使う」「しまう」の二枚札にどちらも○。選ぶ手が真ん中からどちらにも届く
// 動き: 手が左右に迷いなく振れる・○が順にトンと出る・時計の針が回る・点線の弧の濃さが交互
const Sg233: React.FC<{ f: number }> = ({ f }) => {
  const swing = Math.sin(f / 16) * 22; // 手の振り (左右どちらにも届く)
  const opL = Math.max(0.18, 0.4 - Math.sin(f / 16) * 0.3);
  const opR = Math.max(0.18, 0.4 + Math.sin(f / 16) * 0.3);
  return (
    <Frame f={f} seed={1361} bg={KRP.paperCool}>
      {/* 壁: 夕方の光のグラデと小物 */}
      <rect x={-20} y={-20} width={W + 40} height={660} fill="#E3EAF0" />
      <rect x={-20} y={-20} width={W + 40} height={660} fill="#F2D8B4" opacity={0.25 + 0.06 * Math.sin(f / 13)} />
      {/* 針だけの壁時計 (数字は描かない) */}
      <g transform="translate(330 250)">
        <circle r={86} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-74} x2={0} y2={-62} stroke={C.ink} strokeWidth={4}
            transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={10} x2={0} y2={-46} stroke={C.ink} strokeWidth={6}
          strokeLinecap="round" transform={`rotate(${f * 1.2})`} />
        <line x1={0} y1={8} x2={0} y2={-66} stroke={C.ink} strokeWidth={4}
          strokeLinecap="round" transform={`rotate(${140 + f * 0.1})`} />
        <circle r={7} fill={C.ink} />
      </g>
      {/* 右の棚と鉢植え */}
      <rect x={1520} y={320} width={330} height={14} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
      <g transform="translate(1640 320)">
        <path d="M -34 0 L 34 0 L 24 -56 L -24 -56 Z" fill={KRP.bronze} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M 0 -56 q ${-30 + i * 30} -40 ${-16 + i * 16} -78`}
            fill="none" stroke={KRP.green} strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
      <rect x={1740} y={250} width={70} height={70} rx={6} fill="#C9B88E" stroke={C.ink} strokeWidth={4.5} />
      {/* 壁の飾り: ピクチャーレールと吊り額2枚 (中央の空白を埋める) */}
      <line x1={0} y1={96} x2={W} y2={96} stroke={KRP.grayDark} strokeWidth={6} opacity={0.5} />
      {[
        { x: 760, y: 216, w: 118, h: 92, rot: Math.sin(f / 14) * 1.6 },
        { x: 1190, y: 192, w: 96, h: 118, rot: Math.sin(f / 14 + 2) * -1.6 },
      ].map((fr, i) => (
        <g key={i} transform={`rotate(${fr.rot} ${fr.x} 96)`}>
          <line x1={fr.x} y1={96} x2={fr.x} y2={fr.y - fr.h / 2} stroke={KRP.grayDark}
            strokeWidth={3.5} opacity={0.7} />
          <rect x={fr.x - fr.w / 2} y={fr.y - fr.h / 2} width={fr.w} height={fr.h}
            fill={KRP.white} stroke={C.brown} strokeWidth={7} />
          {i === 0 ? (
            <path d={`M ${fr.x - 40} ${fr.y + 22} q 22 -44 44 -10 q 16 -26 36 2`}
              fill="none" stroke={KRP.blueDeep} strokeWidth={4.5} />
          ) : (
            <g>
              <circle cx={fr.x} cy={fr.y - 18} r={16} fill={KRP.orange} opacity={0.8} />
              <path d={`M ${fr.x - 28} ${fr.y + 34} q 28 -30 56 0`}
                fill="none" stroke={KRP.green} strokeWidth={4.5} />
            </g>
          )}
        </g>
      ))}
      {/* 机の天板 */}
      <rect x={-20} y={640} width={W + 40} height={460} fill={C.tableSand} />
      <line x1={-20} y1={640} x2={W + 20} y2={640} stroke={C.ink} strokeWidth={7} />
      <rect x={-20} y={1020} width={W + 40} height={80} fill="#C3AC82" />
      <line x1={-20} y1={1020} x2={W + 20} y2={1020} stroke={C.ink} strokeWidth={5} opacity={0.6} />
      <path d="M 200 760 Q 560 750 900 762 M 1100 920 Q 1460 910 1800 922"
        fill="none" stroke="#B59A6E" strokeWidth={4} opacity={0.7} />
      {/* 小さくなった木箱 (蓋は閉じている) */}
      <g transform="translate(300 700)">
        <polygon points="110,-130 170,-158 170,28 110,56" fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
        <rect x={-130} y={-130} width={240} height={186} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <polygon points="-130,-130 -70,-158 170,-158 110,-130" fill="#CBA169" stroke={C.ink} strokeWidth={6} />
        <text x={-10} y={-32} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={32} fill={SGP.woodDark}>規律一式</text>
        <rect x={-96} y={-66} width={176} height={48} rx={6} fill="none"
          stroke={SGP.woodDark} strokeWidth={4} />
      </g>
      <ellipse cx={320} cy={772} rx={210} ry={26} fill={C.ink} opacity={0.08} />
      {/* 二枚の札: 「使う」と「しまう」(小さな画架に立つ) */}
      {([
        { x: 850, tx: "使う" },
        { x: 1250, tx: "しまう" },
      ] as const).map((d, i) => (
        <g key={i} transform={`translate(${d.x} 590)`}>
          <line x1={-56} y1={160} x2={0} y2={60} stroke={SGP.woodDark} strokeWidth={7} />
          <line x1={56} y1={160} x2={0} y2={60} stroke={SGP.woodDark} strokeWidth={7} />
          <line x1={0} y1={150} x2={0} y2={64} stroke={SGP.woodDark} strokeWidth={6} opacity={0.8} />
          <rect x={-115} y={-70} width={230} height={140} rx={10}
            fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
          <path d="M -96 -40 Q 0 -48 96 -38" fill="none" stroke={SGP.woodDark} strokeWidth={3} opacity={0.8} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={56} fill={KRP.white} stroke={C.ink} strokeWidth={3.5}
            paintOrder="stroke" letterSpacing={2}>{d.tx}</text>
          <ellipse cx={0} cy={766 - 590} rx={120} ry={18} fill={C.ink} opacity={0.08} />
        </g>
      ))}
      {/* ○はどちらにも等しく */}
      <Maru x={850} y={388} s={0.78} t={seg(f, 10, 20)} />
      <Maru x={1250} y={388} s={0.78} t={seg(f, 16, 26)} />
      {/* 迷いの点線 (濃さが交互に入れ替わる = どちらも選べる) */}
      <path d="M 1010 820 Q 900 740 870 700" fill="none" stroke={C.ink}
        strokeWidth={4} strokeDasharray="10 10" opacity={opL} />
      <path d="M 1090 820 Q 1200 740 1230 700" fill="none" stroke={C.ink}
        strokeWidth={4} strokeDasharray="10 10" opacity={opR} />
      {/* 選ぶ手 (画面の下から。左右どちらにも振れる) */}
      <g transform={`translate(1050 1160) rotate(${swing})`}>
        <rect x={-40} y={-420} width={80} height={440} rx={34}
          fill={KRP.blueDeep} stroke={C.ink} strokeWidth={6.5} />
        <rect x={-46} y={-430} width={92} height={34} rx={14}
          fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <g transform="translate(0 -452)">
          <path d="M -32 26 Q -38 -8 -20 -16 L -8 -20 L -8 -52 Q -8 -64 2 -64 Q 12 -64 12 -52 L 12 -18 Q 30 -14 32 10 Q 33 30 14 34 L -16 34 Q -28 34 -32 26 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
          <path d="M -8 -44 L 12 -44" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
      </g>
      {/* 机の小物 */}
      <g transform="translate(1660 880)">
        <path d="M -40 0 L 40 0 L 30 56 L -30 56 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
        <path d="M 40 10 q 26 12 0 30" fill="none" stroke={C.ink} strokeWidth={5} />
        <path d={`M -8 -14 q ${Math.sin(f / 10) * 10} -22 2 -40`} fill="none"
          stroke={KRP.grayDark} strokeWidth={4} opacity={0.6} />
      </g>
      <line x1={560} y1={940} x2={700} y2={928} stroke={KRP.orange} strokeWidth={9} strokeLinecap="round" />
      <polygon points="700,928 722,924 706,938" fill={C.ink} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #234 冒頭で、この動画は飛ばして観ても構いません、と申し上げました。
// 格: 並 / seed 1362
// 絵: `SaiseiBar` が戻ってくる。冒頭に立っていた「ご自由に」の木札が、バーの終端近くから振り返って見える
// どこ: クラフトマットを敷いた作業卓の上。旅の地図のように再生バーを広げて見下ろす
// 演出: 終端近くまで来たつまみから、冒頭の「ご自由に」木札へ振り返りの点線が飛ぶ
// 動き: つまみがじわっと進む・点線が流れる・木札がゆれる・足あとの点列が順に灯る
const Sg234: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 4, 40);
  const progress = 0.86 + 0.06 * t;
  const knobX = -560 + 1120 * progress; // SaiseiBar ローカル座標 (s=1.1, 中心960)
  const kx = 960 + knobX * 1.1;
  const arcT = seg(f, 10, 30);
  const sway = Math.sin(f / 11) * 2;
  return (
    <Frame f={f} seed={1362}>
      {/* 作業部屋の気配: 上の棚と道具 */}
      <rect x={0} y={0} width={W} height={330} fill={KRP.paperCool} />
      <line x1={0} y1={210} x2={W} y2={210} stroke={KRP.grayDark} strokeWidth={8} opacity={0.5} />
      {[260, 560, 1360, 1660].map((x, i) => (
        <g key={i} transform={`translate(${x} 210)`} opacity={0.75}>
          <rect x={-56} y={-84} width={112} height={84} fill={i % 2 ? C.benchTan : KRP.white}
            stroke={C.ink} strokeWidth={5} rx={6} />
          {i % 2 === 0 && <line x1={-56} y1={-42} x2={56} y2={-42} stroke={C.ink} strokeWidth={4} />}
        </g>
      ))}
      <g transform="translate(960 150)" opacity={0.7}>
        <path d="M -70 60 Q 0 -40 70 60" fill="none" stroke={KRP.grayDark} strokeWidth={5} />
        <circle cx={0} cy={-10} r={16} fill={KRP.yellow} stroke={C.ink} strokeWidth={5}
          opacity={0.5 + 0.2 * Math.sin(f / 8)} />
      </g>
      {/* クラフトマット */}
      <rect x={100} y={330} width={1720} height={520} rx={26} fill={C.matCraft}
        stroke={C.ink} strokeWidth={7} />
      <rect x={128} y={356} width={1664} height={468} rx={18} fill="none"
        stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="14 12" opacity={0.6} />
      {/* マスキングテープの角 */}
      {[[150, 352, -24], [1770, 352, 24], [150, 822, 24], [1770, 822, -24]].map(([x, y, r], i) => (
        <rect key={i} x={-52} y={-20} width={104} height={40} fill={KRP.orange} opacity={0.55}
          transform={`translate(${x} ${y}) rotate(${r})`} />
      ))}
      {/* 再生バー (共有装置) */}
      <SaiseiBar f={f} x={960} y={620} s={1.1} progress={progress} />
      {/* 歩いてきた足あとの点列 (開始→現在) */}
      {Array.from({ length: 11 }).map((_, i) => {
        const px = 360 + i * ((kx - 90 - 360) / 10);
        const on = seg(f, 2 + i * 2.6, 6 + i * 2.6);
        return (
          <circle key={i} cx={px} cy={716} r={7}
            fill={KRP.blueDeep} opacity={0.15 + 0.5 * on} />
        );
      })}
      {/* 冒頭の「ご自由に」木札 (バーの始端そば) */}
      <g transform={`translate(394 668) rotate(${-4 + sway})`}>
        <rect x={-9} y={-84} width={18} height={154} fill={C.brown} stroke={C.ink} strokeWidth={5} />
        <rect x={-104} y={-192} width={208} height={112} rx={10} fill={C.benchTan}
          stroke={C.ink} strokeWidth={6} />
        <rect x={-92} y={-180} width={184} height={88} rx={6} fill="none"
          stroke={C.brown} strokeWidth={3.5} opacity={0.7} />
        <text x={0} y={-122} fontFamily={FONT} fontSize={40} fontWeight={700}
          fill={C.ink} textAnchor="middle">ご自由に</text>
      </g>
      {/* つまみから木札へ「振り返り」の点線アーク */}
      <path d={`M ${kx} 560 Q 960 280 480 440`} fill="none" stroke={KRP.blue}
        strokeWidth={7} strokeDasharray="20 16" strokeDashoffset={-f * 2.2}
        opacity={0.25 + 0.55 * arcT} />
      <g transform="translate(480 440) rotate(206)" opacity={arcT}>
        <polygon points="0,0 34,-13 34,13" fill={KRP.blue} />
      </g>
      {/* つまみのきらめき */}
      <g transform={`translate(${kx} 596)`} opacity={0.5 + 0.4 * Math.sin(f / 6)}>
        <path d="M 0 -26 L 6 -8 L 24 -2 L 6 4 L 0 22 L -6 4 L -24 -2 L -6 -8 Z"
          fill={KRP.yellow} stroke={C.ink} strokeWidth={3.5} />
      </g>
      {/* 終端の小さな旗 */}
      <g transform={`translate(1586 666) rotate(${Math.sin(f / 9) * 3})`}>
        <line x1={0} y1={0} x2={0} y2={-96} stroke={C.ink} strokeWidth={6} />
        <path d={`M 0 -96 Q -34 ${-88 + Math.sin(f / 7) * 5} -62 -80 L 0 -58 Z`}
          fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 手前の文具 */}
      <g transform="translate(240 900)" opacity={0.85}>
        <rect x={-60} y={-14} width={120} height={28} rx={12} fill={KRP.blue}
          stroke={C.ink} strokeWidth={5} transform="rotate(-8)" />
      </g>
      <g transform="translate(1700 912)" opacity={0.85}>
        <circle cx={0} cy={0} r={34} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={12} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #235 それでもここまで飛ばさずに観てくださったあなたは、誰に強制されたわけでもなく、150年前の発明品を、自分で選んで使ったことになります。
// 格: 山 / seed 1363
// 絵: 再生バーの完走の軌跡が一本の線で光る。椅子に自分で座る観客。足元に外れた鎖がわだかまっている (強制の鎖は最初から繋がれていなかった)
// どこ: 夜の小さな舞台。スポットライトの中に椅子が1脚。観客は自分で座りに行く
// 演出: 上に完走の再生バー、金色の軌跡が左から右へ走り切る。足元に外れた鎖 (最初から繋がれていなかった)
// 動き: 軌跡が伸びる・先端がきらめく・人が椅子の背に手をかける・ほこりが舞う
const Sg235: React.FC<{ f: number }> = ({ f }) => {
  const trace = seg(f, 4, 38);
  const tipX = 428 + 1064 * trace;
  return (
    <Frame f={f} seed={1363} dark bg={C.duskWall}>
      {/* 奥の幕のひだ */}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${140 + i * 230} 0 q ${20 + rnd(51, i) * 30} 400 0 830`}
          fill="none" stroke="#2E3542" strokeWidth={40} opacity={0.5} />
      ))}
      {/* 舞台の床 */}
      <rect x={0} y={820} width={W} height={H - 820} fill={C.stageBrown} />
      <line x1={0} y1={820} x2={W} y2={820} stroke={C.ink} strokeWidth={7} />
      {[260, 620, 980, 1340, 1700].map((x, i) => (
        <line key={i} x1={x - 60} y1={820} x2={x - 140} y2={H} stroke="#4A3C2D" strokeWidth={6} opacity={0.8} />
      ))}
      {/* スポットライト */}
      <polygon points="930,-20 1070,-20 1420,980 660,980" fill={C.beamLight}
        opacity={0.1 + 0.035 * Math.sin(f / 9)} />
      <ellipse cx={1040} cy={950} rx={430} ry={78} fill={C.beamLight} opacity={0.16} />
      {/* 舞い上がるほこり */}
      {Array.from({ length: 7 }).map((_, i) => (
        <circle key={i} cx={760 + rnd(52, i) * 560}
          cy={880 - ((f * (0.5 + rnd(53, i)) + i * 60) % 340)}
          r={3 + rnd(54, i) * 3} fill={KRP.white}
          opacity={0.25 + 0.2 * Math.sin(f / 7 + i)} />
      ))}
      {/* 完走の再生バー (共有装置) と金の軌跡 */}
      <SaiseiBar f={f} x={960} y={330} s={0.95} progress={0.96 + 0.04 * seg(f, 4, 28)} />
      <line x1={428} y1={330} x2={tipX} y2={330} stroke={KRP.yellow} strokeWidth={34}
        opacity={0.22} strokeLinecap="round" />
      <line x1={428} y1={330} x2={tipX} y2={330} stroke={KRP.yellow} strokeWidth={13}
        opacity={0.85} strokeLinecap="round" />
      <g transform={`translate(${tipX} 330) scale(${pop(seg(f, 34, 42))})`}>
        <path d="M 0 -34 L 8 -10 L 32 -3 L 8 5 L 0 29 L -8 5 L -32 -3 L -8 -10 Z"
          fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 椅子 (自分で座りに行く先) */}
      <g transform="translate(900 955)">
        <rect x={-64} y={-212} width={30} height={212} fill={C.brown} stroke={C.ink} strokeWidth={6} />
        <rect x={-72} y={-100} width={150} height={24} rx={8} fill={C.brown} stroke={C.ink} strokeWidth={6} />
        <line x1={-56} y1={-76} x2={-70} y2={45} stroke={C.ink} strokeWidth={9} />
        <line x1={64} y1={-76} x2={82} y2={45} stroke={C.ink} strokeWidth={9} />
        <rect x={-64} y={-212} width={30} height={46} fill={KRP.orange} stroke={C.ink} strokeWidth={6} rx={8} />
      </g>
      {/* 観客: 椅子の背に手をかける (point の手が背もたれ上端へ) */}
      <Person f={f} x={1105} y={965} s={1.5} cloth={KRP.blueDeep}
        pose="point" pointDir={-1} face="smile" gaze={[-6, 2]} />
      {/* 外れた鎖のわだかまり */}
      <g transform="translate(1310 988)" opacity={0.9}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = i * 0.9 + Math.sin(f / 30) * 0.05;
          const r = 26 + i * 13;
          return (
            <ellipse key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.42}
              rx={22} ry={13} fill="none" stroke={C.chainGray} strokeWidth={7}
              transform={`rotate(${a * 40} ${Math.cos(a) * r} ${Math.sin(a) * r * 0.42})`} />
          );
        })}
        {/* 開いたままの留め具 */}
        <path d="M 128 -8 a 26 26 0 1 1 -10 -40" fill="none" stroke={C.chainGray}
          strokeWidth={9} strokeLinecap="round" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #236 飛ばして観たあなたも、どうかご安心ください。そちらは、数千年の伝統です。
// 格: 山 / seed 1364
// 絵: **免罪状**。「飛ばし観 伝統継承者之証」の賞状。背後の絵巻から数千年の先祖たち (江戸・ロンドン・ナポリの客) が拍手。笑いと赦し
// どこ: 祝いの広間。上辺に数千年の絵巻がリボンのように渡り、江戸・ロンドン・ナポリの先祖が拍手
// 演出: 中央に賞状「飛ばし観 伝統継承者之証」。朱印がぽん、と押され、紙吹雪が舞う
// 動き: 賞状がぽんと現れてゆっくり上下・先祖たちが腕を振る・紙吹雪が降る・朱印が放射
const Sg236: React.FC<{ f: number }> = ({ f }) => {
  const certT = pop(seg(f, 2, 14));
  const sealT = seg(f, 24, 34);
  const bob = Math.sin(f / 13) * 4;
  return (
    <Frame f={f} seed={1364}>
      {/* 絵巻のリボン帯 (数千年の客席) */}
      <path d={`M 0 128 Q 480 ${100 + Math.sin(f / 18) * 6} 960 128 T 1920 128 L 1920 340 Q 1440 348 960 340 T 0 340 Z`}
        fill={C.paperOld} stroke={C.ink} strokeWidth={6} />
      <line x1={0} y1={160} x2={W} y2={160} stroke={C.brown} strokeWidth={3.5} opacity={0.5} />
      <line x1={0} y1={312} x2={W} y2={312} stroke={C.brown} strokeWidth={3.5} opacity={0.5} />
      {/* 3つの時代の客 (絵巻の中で拍手) */}
      {[
        { x: 350, label: "江戸", col: KRP.red },
        { x: 960, label: "ロンドン", col: KRP.blueDeep },
        { x: 1570, label: "ナポリ", col: KRP.green },
      ].map((v, i) => (
        <g key={i}>
          <PersonMini x={v.x - 60} y={318} s={0.62} color={v.col} f={f} phase={i * 2}
            face="smile" arms="up" />
          <PersonMini x={v.x + 60} y={318} s={0.62} color={KRP.orange} f={f} phase={i * 2 + 1}
            face="smile" arms="up" />
          {/* 小物: 提灯 / シルクハット / タンバリン */}
          {i === 0 && (
            <g transform={`translate(${v.x} 196) rotate(${Math.sin(f / 9) * 6})`}>
              <ellipse cx={0} cy={18} rx={22} ry={28} fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
              <line x1={-22} y1={18} x2={22} y2={18} stroke={C.ink} strokeWidth={3} opacity={0.6} />
            </g>
          )}
          {i === 1 && (
            <g transform={`translate(${v.x} 206) rotate(${Math.sin(f / 9 + 2) * 6})`}>
              <rect x={-18} y={-26} width={36} height={30} fill={C.ink} />
              <rect x={-30} y={2} width={60} height={9} rx={4} fill={C.ink} />
            </g>
          )}
          {i === 2 && (
            <g transform={`translate(${v.x} 206) rotate(${Math.sin(f / 7 + 4) * 14})`}>
              <circle cx={0} cy={0} r={24} fill={KRP.yellow} stroke={C.ink} strokeWidth={4.5} />
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 24}
                  cy={Math.sin((a * Math.PI) / 180) * 24} r={4} fill={C.ink} />
              ))}
            </g>
          )}
          <TagPlate x={v.x} y={372} size={26} text={v.label} t={seg(f, 6 + i * 4, 14 + i * 4)} />
        </g>
      ))}
      {/* 紙吹雪 */}
      {Array.from({ length: 16 }).map((_, i) => {
        const cx = 120 + rnd(61, i) * 1680;
        const cy = ((f * (2 + rnd(62, i) * 2) + i * 90) % 760) + 180;
        return (
          <rect key={i} x={-9} y={-5} width={18} height={10}
            fill={[KRP.red, KRP.yellow, KRP.blue, KRP.green][i % 4]}
            opacity={0.8}
            transform={`translate(${cx} ${cy}) rotate(${f * 6 + i * 40})`} />
        );
      })}
      {/* 賞状 (両手で掲げられている) */}
      <g transform={`translate(0 ${bob})`}>
        <g transform={`translate(960 605) scale(${certT})`}>
          <rect x={-420} y={-195} width={840} height={390} fill={C.certPaper}
            stroke={C.ink} strokeWidth={8} />
          <rect x={-396} y={-171} width={792} height={342} fill="none"
            stroke={C.brown} strokeWidth={4.5} />
          <rect x={-384} y={-159} width={768} height={318} fill="none"
            stroke={C.brown} strokeWidth={2.5} opacity={0.6} />
          {/* 飾りロゼット */}
          <g transform="translate(0 -120)">
            <circle cx={0} cy={0} r={30} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} />
            <path d="M -14 24 L -24 62 L 0 48 L 24 62 L 14 24" fill={KRP.red}
              stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={0} r={13} fill="none" stroke={C.ink} strokeWidth={3.5} />
          </g>
          <text x={0} y={28} fontFamily={FONT} fontSize={58} fontWeight={800}
            fill={C.ink} textAnchor="middle" letterSpacing={4}>飛ばし観 伝統継承者之証</text>
          <line x1={-300} y1={74} x2={300} y2={74} stroke={C.brown} strokeWidth={3.5} opacity={0.7} />
          {/* 朱印 */}
          <g transform={`translate(300 128) scale(${pop(sealT)}) rotate(-7)`}>
            <rect x={-44} y={-44} width={88} height={88} rx={10} fill={KRP.red}
              stroke={C.ink} strokeWidth={5} opacity={0.92} />
            <text x={0} y={22} fontFamily={FONT} fontSize={56} fontWeight={800}
              fill={KRP.white} textAnchor="middle">証</text>
          </g>
          {seg(f, 34, 42) > 0 &&
            [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a}
                x1={300 + Math.cos((a * Math.PI) / 180) * 58}
                y1={128 + Math.sin((a * Math.PI) / 180) * 58}
                x2={300 + Math.cos((a * Math.PI) / 180) * (58 + 20 * seg(f, 34, 42))}
                y2={128 + Math.sin((a * Math.PI) / 180) * (58 + 20 * seg(f, 34, 42))}
                stroke={KRP.red} strokeWidth={4.5} opacity={0.8} />
            ))}
        </g>
        {/* 賞状を下から支える両手 */}
        {[-350, 350].map((dx, i) => (
          <g key={i} transform={`translate(${960 + dx} 800)`}>
            <rect x={-38} y={30} width={76} height={260} fill={KRP.blueDeep}
              stroke={C.ink} strokeWidth={6} />
            <rect x={-42} y={18} width={84} height={26} rx={10} fill={KRP.white}
              stroke={C.ink} strokeWidth={5} />
            <ellipse cx={0} cy={0} rx={34} ry={26} fill="#F2C9A0" stroke={C.ink} strokeWidth={5.5} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #237 最後まで観るかどうかは、ふたたび、あなたが決めることになりました。
// 格: 図 / seed 1365
// 絵: 結論の核。画面手前にリモコンとスマホがそっと置かれ、持ち主の手を待っている。「決めるのは、あなた」(※最終文はハーネスが結論カード化するため、要素を絞った図で渡す)
// どこ: 夜の茶の間の机の上。ランプの灯りの下、赤い敷き布にリモコンとスマホが並ぶ
// 演出: 要素を絞った結論の図。道具は持ち主の手を待つ。札「決めるのは あなた」
// 動き: ランプの光がゆっくり呼吸・スマホ画面がほのかに明滅・湯気が立つ・きらめき
const Sg237: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.5 + 0.2 * Math.sin(f / 10);
  return (
    <Frame f={f} seed={1365} dark bg="#352F28">
      {/* 吊りランプ */}
      <line x1={960} y1={0} x2={960} y2={120} stroke={C.ink} strokeWidth={7} />
      <path d="M 900 120 L 1020 120 L 1052 184 L 868 184 Z" fill={C.brown}
        stroke={C.ink} strokeWidth={6} />
      <circle cx={960} cy={204} r={26} fill={KRP.yellow} stroke={C.ink} strokeWidth={5}
        opacity={0.75 + 0.2 * Math.sin(f / 10)} />
      <circle cx={960} cy={420} r={560} fill={C.beamLight} opacity={0.06 + 0.02 * Math.sin(f / 10)} />
      <circle cx={960} cy={560} r={820} fill={C.beamLight} opacity={0.04} />
      {/* 机 */}
      <rect x={0} y={600} width={W} height={H - 600} fill={C.deskNight} />
      <line x1={0} y1={600} x2={W} y2={600} stroke={C.ink} strokeWidth={7} />
      {[700, 830, 960].map((y, i) => (
        <path key={i} d={`M 0 ${y} Q 960 ${y + 14} 1920 ${y}`} fill="none"
          stroke="#5B4530" strokeWidth={4} opacity={0.7} />
      ))}
      {/* 赤い敷き布 */}
      <rect x={600} y={680} width={720} height={230} rx={14} fill={C.clothRed}
        stroke={C.ink} strokeWidth={6} />
      <rect x={622} y={700} width={676} height={190} rx={10} fill="none"
        stroke={KRP.yellow} strokeWidth={3} strokeDasharray="10 10" opacity={0.5} />
      {/* リモコン (数字は描かない) */}
      <g transform="translate(800 795) rotate(-8)">
        <ellipse cx={0} cy={110} rx={120} ry={26} fill="#241F19" opacity={0.5} />
        <rect x={-62} y={-128} width={124} height={250} rx={26} fill={KRP.grayDark}
          stroke={C.ink} strokeWidth={6.5} />
        <circle cx={0} cy={-92} r={16} fill="none" stroke={KRP.red} strokeWidth={5} />
        <line x1={0} y1={-104} x2={0} y2={-92} stroke={KRP.red} strokeWidth={5} />
        <circle cx={0} cy={-18} r={34} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.9} />
        <circle cx={0} cy={-18} r={10} fill={KRP.white} opacity={0.9} />
        <rect x={-42} y={38} width={36} height={16} rx={8} fill={KRP.white} opacity={0.85} />
        <rect x={8} y={38} width={36} height={16} rx={8} fill={KRP.white} opacity={0.85} />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => (
            <circle key={`${r}${c}`} cx={-20 + c * 40} cy={74 + r * 22} r={7}
              fill={KRP.white} opacity={0.7} />
          ))
        )}
      </g>
      {/* スマホ */}
      <g transform="translate(1140 795) rotate(6)">
        <ellipse cx={0} cy={168} rx={120} ry={26} fill="#241F19" opacity={0.5} />
        <rect x={-92} y={-180} width={184} height={360} rx={28} fill={C.ink}
          stroke={C.ink} strokeWidth={6} />
        <rect x={-78} y={-158} width={156} height={316} rx={14} fill={KRP.blue}
          opacity={0.25 + 0.18 * Math.sin(f / 8)} />
        <polygon points="-22,-50 34,0 -22,50" fill="none" stroke={KRP.white}
          strokeWidth={7} strokeLinejoin="round" opacity={0.9} />
        <line x1={-60} y1={-140} x2={30} y2={140} stroke={KRP.white} strokeWidth={10}
          opacity={0.08} />
        <circle cx={0} cy={142} r={9} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
      </g>
      {/* 道具のほのかな待機の光 */}
      <ellipse cx={800} cy={800} rx={150} ry={170} fill={KRP.yellow} opacity={0.05 * glow} />
      <ellipse cx={1140} cy={800} rx={160} ry={200} fill={KRP.blue} opacity={0.06 * glow} />
      {/* 湯のみ */}
      <g transform="translate(1560 760)">
        <ellipse cx={0} cy={78} rx={64} ry={16} fill="#241F19" opacity={0.5} />
        <path d="M -44 0 L 44 0 L 36 70 L -36 70 Z" fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={0} rx={44} ry={10} fill="none" stroke={C.ink} strokeWidth={5} />
        <path d={`M -6 -22 q ${Math.sin(f / 9) * 12} -26 4 -52`} fill="none"
          stroke={KRP.white} strokeWidth={4.5} opacity={0.55} />
      </g>
      {/* 札 */}
      <TagPlate x={960} y={320} size={46} text="決めるのは あなた" t={seg(f, 8, 20)} />
      {/* きらめき */}
      {[[480, 480], [1460, 420], [320, 300]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}
          opacity={0.3 + 0.3 * Math.sin(f / 7 + i * 2)}>
          <path d="M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z"
            fill={KRP.yellow} />
        </g>
      ))}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_229: (f) => <Sg229 f={f} />,
  sg_230: (f) => <Sg230 f={f} />,
  sg_231: (f) => <Sg231 f={f} />,
  sg_232: (f) => <Sg232 f={f} />,
  sg_233: (f) => <Sg233 f={f} />,
  sg_234: (f) => <Sg234 f={f} />,
  sg_235: (f) => <Sg235 f={f} />,
  sg_236: (f) => <Sg236 f={f} />,
  sg_237: (f) => <Sg237 f={f} />,
};

export const S_CB_MOTIFS: string[] = [
  "sg_229", // #229
  "sg_230", // #230
  "sg_231", // #231
  "sg_232", // #232
  "sg_233", // #233
  "sg_234", // #234
  "sg_235", // #235
  "sg_236", // #236
  "sg_237", // #237
];

export const saigoCbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
