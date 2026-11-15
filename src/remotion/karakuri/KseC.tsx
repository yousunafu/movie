// 「つながる世界史」からくり試作回: 担当C (文#10〜#14・5枚)。
// 1文 = 1シーン = 1枚の絵。motif 名は必ず ksc_ で始める。seed は 709〜713。
// 設計書: docs/kse-test-design.md / 指示書: docs/briefs/KseC.md
//
// ★絵の「格」: 山=全部入り150〜250行 / 並=描くのは1つだけ60〜120行 / 図=図と札25〜50行+世界を敷く。
//   「図」「並」も品質は落とさない。必ず f で動く。大きく置いて画面を使い切る。
// ★絵の中の文字はラベル・数値・標識だけ。TagPlate の y + size*0.85 ≤ 830。seg の b ≤ 42。

import React from "react";
import { KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01 } from "./KarakuriScenes";
import { W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow } from "./KseShared";
import { SP, DokuHai } from "./KseParts";

// このファイルだけで使う色 (足してよい)
const C = {
  washi: "#F1E9D4", // 字解きカードの紙
  yuki: "#FFFFFF", // 雪
  jimen: "#363E54", // 夜の地面
  michi: "#7D7869", // 夜道の土
  monWood: "#4A4038", // 門の古木
  kuro2: "#2A2430", // 黒装束のもう1つの黒 (バラバラ感)
  manto: "#E0A14C", // 明るいマントー
  asphalt: "#B9BEC2", // テヘランの車道
  hodo: "#D5CBB2", // 歩道の敷石
  tatemono: "#D8D2C4", // ビルの外壁
  tatemono2: "#C4BBA8", // ビルの外壁 (濃)
  jeans: "#5A74A8", // ジーンズ
} as const;

// ===================================================================
// #10 専用のローカル部品: うつむいて歩く通行人 (装いを4類型+男で描き分ける)
// x,y = 足元中央。kind: 1=素頭+明るいマントー 2=スカーフを肩に落とす 3=長いマントー+結んだスカーフ
//                     4=黒チャードル 5=男シャツ裾出し 6=男Tシャツ+ジーンズ
// ===================================================================
const Tsukonin: React.FC<{
  x: number; y: number; s?: number; kind: 1 | 2 | 3 | 4 | 5 | 6; f: number; ph: number;
}> = ({ x, y, s = 1, kind, f, ph }) => {
  const bob = Math.sin((f + ph * 13) / 9) * 2.5;
  const swing = Math.sin((f + ph * 13) / 9) * 9; // 歩きの脚の振り
  const hair = "#3A322B";
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 脚 (歩き): チャードルは裾で隠れる */}
      {kind !== 4 && (
        <g>
          <rect x={-22} y={-62} width={17} height={62} rx={8}
            fill={kind === 6 ? C.jeans : KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5}
            transform={`rotate(${swing} -14 -58)`} />
          <rect x={6} y={-62} width={17} height={62} rx={8}
            fill={kind === 6 ? C.jeans : KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5}
            transform={`rotate(${-swing} 14 -58)`} />
        </g>
      )}
      {/* 胴 (装いの描き分け) */}
      {kind === 1 && ( // 明るいマントー (膝丈の長い上着)・素頭
        <path d="M -34 -58 L -30 -158 Q 0 -172 30 -158 L 34 -58 Q 0 -48 -34 -58 Z"
          fill={C.manto} stroke={KRP.ink} strokeWidth={5} />
      )}
      {kind === 2 && ( // 普通の上着+肩に落ちたスカーフ
        <g>
          <path d="M -32 -60 L -29 -152 Q 0 -166 29 -152 L 32 -60 Q 0 -50 -32 -60 Z"
            fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -26 -148 Q 0 -132 26 -148 L 30 -118 Q 0 -104 -30 -118 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {kind === 3 && ( // 足首までの長いマントー
        <path d="M -38 -4 L -30 -152 Q 0 -166 30 -152 L 38 -4 Q 0 6 -38 -4 Z"
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      )}
      {kind === 4 && ( // 黒チャードル (頭から裾まで一続き)
        <path d="M -44 0 Q -36 -140 -16 -196 Q 0 -214 16 -196 Q 36 -140 44 0 Q 0 10 -44 0 Z"
          fill={SP.mourning} stroke={KRP.ink} strokeWidth={5} />
      )}
      {kind === 5 && ( // 無地シャツ裾出し (裾がズボンに掛かる)
        <path d="M -33 -52 L -29 -150 Q 0 -164 29 -150 L 33 -52 L 24 -46 L -24 -46 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      )}
      {kind === 6 && ( // Tシャツ
        <path d="M -31 -66 L -28 -150 Q 0 -164 28 -150 L 31 -66 Q 0 -58 -31 -66 Z"
          fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
      )}
      {/* 腕 (下げたまま・喪の静けさ) */}
      {kind !== 4 && (
        <g>
          <rect x={-42} y={-146} width={15} height={62} rx={7}
            fill={kind === 1 ? C.manto : kind === 2 ? KRP.gray : kind === 3 ? KRP.grayDark : kind === 5 ? KRP.white : KRP.green}
            stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${6 + swing * 0.4} -35 -140)`} />
          <rect x={27} y={-146} width={15} height={62} rx={7}
            fill={kind === 1 ? C.manto : kind === 2 ? KRP.gray : kind === 3 ? KRP.grayDark : kind === 5 ? KRP.white : KRP.green}
            stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${-6 - swing * 0.4} 35 -140)`} />
        </g>
      )}
      {/* 頭 (うつむき: 前に傾けて目を伏せる) */}
      <g transform="translate(6 -178) rotate(14)">
        <circle cx={0} cy={0} r={27} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {kind === 1 && ( // 素頭: 髪が見える
          <path d="M -26 4 Q -30 -26 0 -27 Q 30 -26 26 4 L 20 10 L 18 -8 Q 0 -16 -18 -8 L -20 10 Z"
            fill={hair} stroke={KRP.ink} strokeWidth={4} />
        )}
        {kind === 2 && ( // スカーフが肩に落ちて髪が見える
          <path d="M -26 0 Q -28 -27 0 -27 Q 28 -27 26 0 L 19 6 L 17 -10 Q 0 -18 -17 -10 L -19 6 Z"
            fill={hair} stroke={KRP.ink} strokeWidth={4} />
        )}
        {kind === 3 && ( // きちんと結んだスカーフ (髪を覆う)
          <path d="M -27 10 Q -31 -30 0 -30 Q 31 -30 27 10 L 16 14 L 17 -4 Q 0 -14 -17 -4 L -16 14 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        )}
        {kind === 4 && ( // チャードルの頭巾 (顔の窓だけ)
          <path d="M -27 14 Q -32 -30 0 -30 Q 32 -30 27 14 L 14 18 L 16 -2 Q 0 -13 -16 -2 L -14 18 Z"
            fill={SP.mourning} stroke={KRP.ink} strokeWidth={4.5} />
        )}
        {(kind === 5 || kind === 6) && ( // 男の短髪
          <path d="M -26 -4 Q -27 -28 0 -28 Q 27 -28 26 -4 Q 14 -14 0 -15 Q -14 -14 -26 -4 Z"
            fill={hair} stroke={KRP.ink} strokeWidth={4} />
        )}
        {/* 伏せた目 (下向きの短い線) */}
        <g stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round">
          <line x1={-11} y1={6} x2={-4} y2={8} />
          <line x1={5} y1={8} x2={12} y2={6} />
        </g>
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// #10 (山) そして2026年。イランは、その最高指導者を、戦争で殺されました。
// どこ: 2026年テヘランの大通り。喪の街
// 演出: 事件は「物」で語る — 黒旗 (SP.mourning)・半旗の国旗・遺影ポスター (顔は簡略化・赤いチューリップ SP.tulip)。
//        うつむいて通る老若男女。背後に雪の山並み (テヘランは標高1200m)
// 動き: 黒旗が f でなびく・人が歩く
const S10: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 2, 14)); // 街
  const t2 = seg(f, 10, 22); // 旗・ポスター
  const wav = (ph: number) => Math.sin(f / 8 + ph); // 布のなびき
  // 黒旗 (ポールの天辺に布。f でなびく)
  const KuroHata: React.FC<{ x: number; base: number; h: number; ph: number }> = ({ x, base, h, ph }) => {
    const w1 = wav(ph) * 12;
    const w2 = wav(ph + 1.4) * 16;
    return (
      <g opacity={pop(clamp01(t2))}>
        <line x1={x} y1={base} x2={x} y2={base - h} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        <circle cx={x} cy={base - h} r={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${x} ${base - h + 8} C ${x + 60} ${base - h + 2 + w1} ${x + 110} ${base - h + 22 + w2} ${x + 168} ${base - h + 10 + w2}
                  L ${x + 160} ${base - h + 86 + w2} C ${x + 104} ${base - h + 96 + w2} ${x + 56} ${base - h + 76 + w1} ${x} ${base - h + 86} Z`}
          fill={SP.mourning} stroke={KRP.ink} strokeWidth={5} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={709} bg={KRP.cream}>
      {/* 空 */}
      <rect x={-20} y={-20} width={W + 40} height={520} fill={KRP.paperCool} />
      {/* 雪をかぶった山並み (テヘランの北・標高1200mの印) */}
      <g opacity={t1}>
        <path d="M -20 470 L 220 320 L 420 440 L 640 290 L 880 450 L 1120 330 L 1360 450 L 1620 310 L 1840 440 L 1940 400 L 1940 500 L -20 500 Z"
          fill={C.yuki} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 180 345 L 220 320 L 262 346 L 232 362 Z M 598 318 L 640 290 L 684 320 L 642 340 Z M 1578 338 L 1620 310 L 1664 340 L 1620 356 Z"
          fill={KRP.gray} opacity={0.5} />
        {/* 細い電波塔風の尖塔 (奥) */}
        <path d="M 1452 470 L 1462 190 L 1472 470 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={1462} cy={252} rx={26} ry={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1462} y1={190} x2={1462} y2={140} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 大通りのビル */}
      <g opacity={t1}>
        {[
          { x: -20, w: 360, top: 360, c: C.tatemono },
          { x: 380, w: 300, top: 430, c: C.tatemono2 },
          { x: 1180, w: 330, top: 410, c: C.tatemono2 },
          { x: 1550, w: 390, top: 350, c: C.tatemono },
        ].map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.top} width={b.w} height={760 - b.top} fill={b.c} stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((q) => {
                const wx = b.x + 40 + q * ((b.w - 80) / 2.6);
                const wy = b.top + 36 + r * 92;
                return wy + 56 < 740 && wx + 54 < b.x + b.w - 24 ? (
                  <rect key={`${r}-${q}`} x={wx} y={wy} width={54} height={56} fill={KRP.paperCool}
                    stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
                ) : null;
              })
            )}
          </g>
        ))}
        {/* 中央奥: 通りの抜け */}
        <rect x={680} y={520} width={500} height={240} fill={KRP.gray} opacity={0.35} />
      </g>
      {/* 歩道と車道 */}
      <rect x={-20} y={760} width={W + 40} height={100} fill={C.hodo} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={856} width={W + 40} height={H - 836} fill={C.asphalt} stroke={KRP.ink} strokeWidth={6} />
      {/* 遺影ポスター (壁に。黒い額・丸頭の簡略・黒リボン・赤いチューリップ) */}
      <g opacity={pop(clamp01(t2))}>
        <rect x={120} y={430} width={200} height={260} fill={SP.mourning} stroke={KRP.ink} strokeWidth={6} />
        <rect x={142} y={452} width={156} height={216} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={220} cy={528} r={38} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 168 668 Q 180 600 220 590 Q 260 600 272 668 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 252 452 L 298 452 L 298 498 Z" fill={SP.mourning} stroke={KRP.ink} strokeWidth={4} />
        {/* チューリップ (殉教の象徴) をポスターの足元に */}
        <g transform={`translate(176 760) rotate(${wav(0.6) * 2})`}>
          <path d="M 0 0 Q -4 -40 0 -62" fill="none" stroke={SP.iranGreen} strokeWidth={6} strokeLinecap="round" />
          <path d="M -7 -46 Q -22 -54 -24 -70" fill="none" stroke={SP.iranGreen} strokeWidth={5} strokeLinecap="round" />
          <path d="M -16 -92 Q -18 -62 0 -58 Q 18 -62 16 -92 Q 8 -80 0 -92 Q -8 -80 -16 -92 Z"
            fill={SP.tulip} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </g>
      {/* 半旗のイラン国旗 (緑白赤の横三色・ポールの半分の高さ・紋は入れない) */}
      <g opacity={pop(clamp01(t2))}>
        <line x1={980} y1={760} x2={980} y2={300} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <circle cx={980} cy={300} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        {[
          { c: SP.iranGreen, dy: 0 },
          { c: KRP.white, dy: 42 },
          { c: SP.iranRed, dy: 84 },
        ].map((b, i) => (
          <path key={i}
            d={`M 985 ${520 + b.dy} C 1040 ${514 + b.dy + wav(i * 0.5) * 8} 1096 ${534 + b.dy + wav(i * 0.5 + 1.2) * 10} 1156 ${522 + b.dy + wav(i * 0.5 + 1.2) * 10}
                L 1156 ${564 + b.dy + wav(i * 0.5 + 1.2) * 10} C 1096 ${576 + b.dy + wav(i * 0.5 + 1.2) * 10} 1040 ${556 + b.dy + wav(i * 0.5) * 8} 985 ${562 + b.dy} Z`}
            fill={b.c} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
      </g>
      {/* 黒旗3本 */}
      <KuroHata x={480} base={760} h={330} ph={0} />
      <KuroHata x={1300} base={760} h={370} ph={2.1} />
      <KuroHata x={1700} base={760} h={300} ph={4.2} />
      {/* うつむいて歩く通行人 (老若男女・装い4類型を混在) */}
      <g opacity={easeOut(seg(f, 6, 18))}>
        <Tsukonin x={320} y={846} s={0.92} kind={4} f={f} ph={0} />
        <Tsukonin x={610} y={840} s={1.0} kind={1} f={f} ph={1} />
        <Tsukonin x={840} y={848} s={0.82} kind={3} f={f} ph={2} />
        <Tsukonin x={1150} y={842} s={1.04} kind={5} f={f} ph={3} />
        <Tsukonin x={1560} y={846} s={0.95} kind={2} f={f} ph={4} />
      </g>
      <TagPlate x={1690} y={240} text="テヘラン" size={44} t={seg(f, 26, 38)} />
    </Frame>
  );
};

// #11 (並) 後を継いだ息子は、8か月たった今も、公の場に姿を見せていません。声の録音も、公開されていないと報じられています。メッセージは、ほぼ文書だけです。
// どこ: 空の演壇に大きく寄る
// 演出: 「不在」の絵。誰もいない演壇・マイク2本・置かれた文書の束だけ。スポットの光
// 動き: マイクのコードが揺れる・文書の紙端が f でめくれる・QMark
const S11: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 2, 14)); // 演壇
  const sway = Math.sin(f / 15) * 2.4; // マイクのゆれ
  const curl = (Math.sin(f / 7) + 1) / 2; // 紙端のめくれ 0..1
  return (
    <Frame f={f} seed={710} bg={KRP.cream}>
      {/* 会場の壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill={KRP.paperCool} />
      {[300, 700, 1220, 1620].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={730} stroke={KRP.gray} strokeWidth={4} opacity={0.4} />
      ))}
      <rect x={-20} y={720} width={W + 40} height={H - 700} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
      {/* スポットの光の台形 (誰もいない所を照らす) */}
      <polygon points="800,-20 1120,-20 1450,1000 470,1000" fill={KRP.yellow} opacity={0.14} />
      <polygon points="880,-20 1040,-20 1230,1000 690,1000" fill={KRP.yellow} opacity={0.1} />
      {/* 空の椅子1脚 (演壇の後ろ・空席感) */}
      <g opacity={t1} transform="translate(1430 0)">
        <rect x={-10} y={430} width={150} height={26} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-10} y={250} width={26} height={196} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={6} y1={456} x2={-6} y2={640} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={124} y1={456} x2={140} y2={640} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* 主役: 誰もいない演壇 (画面の6割) */}
      <g transform={`translate(0 ${(1 - t1) * 60})`} opacity={Math.min(t1 * 1.4, 1)}>
        {/* 演台の影 */}
        <ellipse cx={960} cy={884} rx={430} ry={42} fill={KRP.ink} opacity={0.12} />
        {/* 台の本体 (木・下へ広がる) */}
        <path d="M 700 400 L 1220 400 L 1300 870 L 620 870 Z" fill={SP.radioWood} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 700 400 L 760 400 L 690 870 L 620 870 Z" fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 天板 */}
        <path d="M 672 376 L 1248 376 L 1228 416 L 692 416 Z" fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={7} />
        {/* 板の木目 */}
        <path d="M 760 480 Q 960 470 1180 484 M 740 600 Q 960 590 1210 604 M 712 730 Q 960 720 1248 734"
          fill="none" stroke={SP.radioWoodDark} strokeWidth={5} opacity={0.6} />
        {/* 前面の小さなイラン国旗の紋 (横三色のみ) */}
        <g transform="translate(960 560)">
          <rect x={-64} y={-44} width={128} height={88} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-52} y={-32} width={104} height={21} fill={SP.iranGreen} />
          <rect x={-52} y={-11} width={104} height={21} fill={KRP.white} stroke={KRP.gray} strokeWidth={1.5} />
          <rect x={-52} y={10} width={104} height={21} fill={SP.iranRed} />
        </g>
        {/* マイク2本 (ぽつんと立つ。f でわずかに揺れる) */}
        {[{ mx: 816, rot: -7, ph: 0 }, { mx: 1084, rot: 8, ph: 2 }].map((m, i) => (
          <g key={i} transform={`rotate(${m.rot + sway * (i === 0 ? 1 : -0.8)} ${m.mx} 390)`}>
            <line x1={m.mx} y1={390} x2={m.mx} y2={196} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            <circle cx={m.mx} cy={390} r={13} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={m.mx - 20} y={142} width={40} height={64} rx={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
            <path d={`M ${m.mx - 14} 158 H ${m.mx + 14} M ${m.mx - 16} 174 H ${m.mx + 16} M ${m.mx - 14} 190 H ${m.mx + 14}`}
              stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} />
          </g>
        ))}
        {/* マイクのコード (前に垂れて f で揺れる) */}
        <path d={`M 816 402 C ${800 + sway * 4} 520 ${770 + sway * 7} 640 ${792 + sway * 9} 760`}
          fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        {/* 文書の束 (紙が10枚重なる・いちばん上の端がめくれ続ける) */}
        <g transform="translate(1056 368)">
          {[...Array(9)].map((_, i) => (
            <rect key={i} x={-108 + ((i * 7) % 13) - 6} y={-10 - i * 5} width={216} height={10} rx={3}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          ))}
          <path d={`M -116 -55 L 100 -55 Q ${100 - curl * 26} ${-62 - curl * 20} ${106 - curl * 44} ${-55 - curl * 30}
                    L 112 -50 L 118 -46 L -110 -46 Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -86 -51 H 40" stroke={KRP.gray} strokeWidth={2.5} />
        </g>
      </g>
      {/* 人がいるはずの高さに？ */}
      <QMark x={960} y={250} s={1.25} f={f} t={seg(f, 20, 32)} />
      <TagPlate x={300} y={250} text="空の演壇" size={44} t={seg(f, 26, 38)} />
    </Frame>
  );
};

// #12 (図) 玉音放送の「玉音」とは、声のことです。
// どこ: 和紙のカードの上 (素の方眼は禁止。紙の世界を敷く)
// 演出: 「玉音」の字解き。字から音波の輪が出て「= こえ」へつながる矢印
// 動き: 音波の輪が f で広がり続ける・札がぽんと立つ
const S12: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 2, 14)); // 字
  const cx = 700, cy = 650; // 音波の出どころ (「音」の字の右肩)
  return (
    <Frame f={f} seed={711} bg={KRP.floor}>
      {/* 世界: 文机の天板 (木目) の上に和紙のカード (四辺の耳をゆらいだ輪郭で) */}
      {[140, 480, 830, 1220, 1580, 1840].map((x, i) => (
        <path key={x} d={`M ${x} -20 Q ${x + 26 + (i % 3) * 16} 540 ${x - 14} 1100`}
          fill="none" stroke={KRP.copper} strokeWidth={5} opacity={0.3} />
      ))}
      <path d="M 62 78 Q 496 56 976 68 Q 1456 54 1894 74 Q 1906 552 1890 1038 Q 1456 1056 976 1044 Q 496 1058 64 1036 Q 50 552 62 78 Z"
        fill={KRP.ink} opacity={0.14} />
      <path d="M 44 58 Q 480 36 960 48 Q 1440 34 1878 54 Q 1890 540 1874 1026 Q 1440 1044 960 1032 Q 480 1046 46 1024 Q 32 540 44 58 Z"
        fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
      {/* 和紙の繊維の点々 (すき込み) */}
      {[...Array(30)].map((_, i) => {
        const fx = 90 + ((i * 367) % 1740);
        const fy = 90 + ((i * 541) % 900);
        return (
          <line key={i} x1={fx} y1={fy} x2={fx + 14 + (i % 3) * 8} y2={fy + ((i % 5) - 2) * 3}
            stroke={KRP.ink} strokeWidth={2.5} opacity={0.1} strokeLinecap="round" />
        );
      })}
      {/* 主役: 大きな筆文字風「玉音」(縦書き・高さ540px以上) */}
      <g transform={`translate(520 0) scale(${0.92 + t1 * 0.08})`} opacity={Math.min(t1 * 1.5, 1)}>
        <text x={0} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={330} fill={KRP.ink}>玉</text>
        <text x={0} y={790} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={330} fill={KRP.ink}>音</text>
      </g>
      {/* 「音」から広がり続ける音波の輪 (3重・f でループ) */}
      {[0, 1, 2].map((i) => {
        const r = 70 + ((f * 4 + i * 60) % 180);
        const op = 0.85 * (1 - (r - 70) / 190);
        return (
          <path key={i}
            d={`M ${cx + r * 0.42} ${cy - r * 0.91} A ${r} ${r} 0 0 1 ${cx + r * 0.42} ${cy + r * 0.91}`}
            fill="none" stroke={KRP.blueDeep} strokeWidth={11} strokeLinecap="round" opacity={Math.max(op, 0)} />
        );
      })}
      {/* 右へ: 読みと意味 */}
      <Arrow x={1210} y={640} s={1.4} rot={0} t={seg(f, 14, 26)} />
      <TagPlate x={1480} y={636} text="こえ" size={60} t={seg(f, 20, 32)} />
      <TagPlate x={520} y={140} text="ぎょくおん" size={34} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// #13 (山) 今のイランに、毒杯を飲むと言える「声」はあるのか。それとも始まるのは、主君を討たれた家臣たちの、忠臣蔵なのか。
// どこ: 夜の分かれ道 (SP.night)。左右で世界が違う
// 演出: 左の道の先に毒杯 (DokuHai 共用部品)、右の道の先に雪と提灯 (SP.lantern)・黒装束+白袖印の後ろ姿
//        (揃いの山形模様・陣太鼓は創作なので描かない)
// 動き: 提灯の灯が揺れる・雪が降る・QMark が道の股に立つ
const S13: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 2, 14));
  const flick = 0.14 + 0.08 * Math.sin(f / 4.5) + 0.04 * Math.sin(f / 2.1); // 提灯の灯のゆれ
  return (
    <Frame f={f} seed={712} bg={SP.night}>
      {/* 星と月 */}
      {[...Array(14)].map((_, i) => (
        <circle key={i} cx={60 + ((i * 331) % 1800)} cy={40 + ((i * 197) % 330)} r={2.5 + (i % 2)}
          fill={C.yuki} opacity={0.4 + (i % 3) * 0.15} />
      ))}
      <circle cx={680} cy={160} r={96} fill={C.yuki} opacity={0.12} />
      <circle cx={680} cy={160} r={66} fill={C.yuki} opacity={0.9} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 648 126 Q 636 160 650 192" fill="none" stroke={KRP.gray} strokeWidth={4} opacity={0.5} />
      {/* 遠景の山影と地面 */}
      <path d="M -20 520 L 300 410 L 620 510 L 980 400 L 1340 510 L 1680 420 L 1940 500 L 1940 620 L -20 620 Z"
        fill={SP.nightDeep} opacity={t1} />
      <rect x={-20} y={560} width={W + 40} height={H - 540} fill={C.jimen} stroke={KRP.ink} strokeWidth={6} />
      {/* 分かれ道 (手前から二股) */}
      <path d="M 844 1086 L 936 742 L 400 582 L 446 534 L 962 700 L 1478 534 L 1522 582 L 988 742 L 1082 1086 Z"
        fill={C.michi} stroke={KRP.ink} strokeWidth={7} opacity={t1} />
      {/* ===== 左の道の先: 台座の毒杯と月明かりの輪 ===== */}
      <ellipse cx={330} cy={556} rx={200} ry={46} fill={KRP.yellow} opacity={0.1} />
      <ellipse cx={330} cy={556} rx={200} ry={46} fill="none" stroke={C.yuki} strokeWidth={4} opacity={0.3} />
      <g opacity={easeOut(seg(f, 6, 18))}>
        <rect x={244} y={474} width={172} height={74} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={330} cy={474} rx={86} ry={18} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <line x1={268} y1={500} x2={268} y2={534} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        <line x1={392} y1={500} x2={392} y2={534} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      </g>
      <DokuHai x={330} y={468} s={1.2} t={seg(f, 10, 22)} f={f} poison />
      {/* ===== 右の道の先: 雪の屋根と門・提灯・黒装束の後ろ姿 ===== */}
      <g opacity={easeOut(seg(f, 6, 18))}>
        {/* 奥の屋敷の屋根 (雪) */}
        <path d="M 1300 352 L 1560 268 L 1830 352 L 1790 388 L 1560 318 L 1340 388 Z"
          fill={C.monWood} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1316 348 L 1560 272 L 1812 348 Q 1690 316 1560 298 Q 1436 316 1316 348 Z"
          fill={C.yuki} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1392} y={388} width={340} height={150} fill={SP.nightDeep} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 門: 柱2本+冠木+雪 */}
        <rect x={1398} y={400} width={34} height={180} fill={C.monWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1688} y={400} width={34} height={180} fill={C.monWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1368} y={372} width={384} height={36} rx={6} fill={C.monWood} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1372 374 Q 1560 352 1748 374 L 1748 366 Q 1560 344 1372 366 Z" fill={C.yuki} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 提灯1つ (冠木から下がる。灯が f で揺れる) */}
      <g transform={`rotate(${Math.sin(f / 9) * 4} 1560 408)`} opacity={easeOut(seg(f, 10, 22))}>
        <line x1={1560} y1={408} x2={1560} y2={444} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1560} cy={494} r={64} fill={SP.lantern} opacity={flick} />
        <ellipse cx={1560} cy={494} rx={33} ry={46} fill={SP.lantern} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M 1530 478 H 1590 M 1528 494 H 1592 M 1530 510 H 1590" stroke={KRP.ink} strokeWidth={2.8} opacity={0.6} />
        <rect x={1544} y={442} width={32} height={10} rx={4} fill={KRP.ink} />
        <rect x={1544} y={536} width={32} height={10} rx={4} fill={KRP.ink} />
      </g>
      {/* 黒装束の後ろ姿2人 (バラバラの黒・襟元に鎖帷子の鈍色・袖に白い布の目印) */}
      {[
        { x: 1240, y: 646, s: 0.88, c: SP.mourning, ph: 0 },
        { x: 1372, y: 600, s: 0.72, c: C.kuro2, ph: 2 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y + Math.sin((f + p.ph * 15) / 14) * 2}) scale(${p.s})`}
          opacity={easeOut(seg(f, 12, 24))}>
          <path d="M -44 0 Q -38 -120 -20 -158 L 20 -158 Q 38 -120 44 0 Q 0 10 -44 0 Z"
            fill={p.c} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 襟元の鎖帷子 */}
          <path d="M -20 -156 Q 0 -144 20 -156" fill="none" stroke={SP.kusari} strokeWidth={10} strokeLinecap="round" />
          {/* 頭 (後ろ姿・顔は見えない) */}
          <circle cx={0} cy={-184} r={30} fill={p.c} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -12 -210 L 14 -202" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          {/* 腕と袖の白い布の目印 */}
          <rect x={-52} y={-146} width={17} height={66} rx={8} fill={p.c} stroke={KRP.ink} strokeWidth={5} />
          <rect x={35} y={-146} width={17} height={66} rx={8} fill={p.c} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-56} y={-124} width={25} height={18} rx={4} fill={C.yuki} stroke={KRP.ink} strokeWidth={4} />
          <rect x={31} y={-124} width={25} height={18} rx={4} fill={C.yuki} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 雪が降り続ける */}
      {[...Array(26)].map((_, i) => {
        const sx = ((i * 151) % 1920) + Math.sin(f / 13 + i) * 10;
        const sy = (i * 97 + f * 4.5) % 1120 - 20;
        return <circle key={i} cx={sx} cy={sy} r={3 + (i % 3) * 1.4} fill={C.yuki} opacity={0.8} />;
      })}
      {/* 道の股に？ */}
      <QMark x={960} y={650} s={1.2} f={f} t={seg(f, 24, 36)} />
      <TagPlate x={286} y={786} text="1988の型" size={36} t={seg(f, 28, 40)} />
      <TagPlate x={1640} y={786} text="1702の型" size={36} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// #14 (並) さらに、この戦争の裏側で、ひとりの日本人がアメリカから制裁を受けています。
// どこ: 書類の上。謎めかしの1枚
// 演出: 顔は見せない。書類の人物欄が「？」、日の丸の印、朱の「制裁」スタンプ (Stamp) がドンと押される
// 動き: スタンプが f で押される事件・紙が震える
const S14: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(seg(f, 2, 14)); // 書類
  const press = seg(f, 24, 29); // スタンプが押される
  const stampSc = press <= 0 ? 0 : 1.55 - 0.55 * easeOut(press);
  const shake = f >= 29 && f <= 37 ? Math.sin(f * 2.2) * 3 * (1 - seg(f, 29, 37)) : 0; // 押された瞬間の震え
  return (
    <Frame
      f={f}
      seed={713}
      bg={KRP.cream}
      over={
        press > 0 ? (
          <div style={{ position: "absolute", inset: 0, transform: `scale(${stampSc})`, transformOrigin: "980px 500px" }}>
            <Stamp x={790} y={386} text="制裁" size={130} opacity={0.65 + press * 0.3} />
            {/* スタンプの縁の小さな星の列 (米国の印であることをそっと示す) */}
            <div style={{
              position: "absolute", left: 806, top: 586, transform: "rotate(-7deg)",
              color: KRP.red, fontFamily: FONT, fontWeight: 900, fontSize: 30,
              letterSpacing: 24, opacity: 0.8, whiteSpace: "nowrap",
            }}>
              ★★★★★
            </div>
          </div>
        ) : null
      }
    >
      {/* 世界: 机の天板 (木目) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.floor} />
      {[160, 420, 760, 1040, 1400, 1700].map((x, i) => (
        <path key={x} d={`M ${x} -20 Q ${x + 30 + (i % 3) * 18} 540 ${x - 16} 1100`}
          fill="none" stroke={KRP.copper} strokeWidth={5} opacity={0.3} />
      ))}
      {/* 主役: 書類1枚を大きく (画面の6割) */}
      <g transform={`translate(${shake} ${(1 - t1) * 50}) rotate(-2 960 540)`} opacity={Math.min(t1 * 1.4, 1)}>
        <rect x={436} y={166} width={1080} height={790} fill={KRP.ink} opacity={0.14} />
        <rect x={420} y={148} width={1080} height={790} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {/* クリップ */}
        <g transform="translate(930 112) rotate(3)">
          <rect x={0} y={0} width={64} height={86} rx={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={14} y={16} width={36} height={54} rx={10} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 題字 (英字風の波線) と罫線 */}
        <path d="M 480 236 Q 560 224 640 236 Q 720 248 800 236 Q 860 228 900 236"
          fill="none" stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
        <line x1={480} y1={282} x2={1120} y2={282} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M 480 ${340 + i * 56} Q 580 ${332 + i * 56} 690 ${340 + i * 56} Q 800 ${348 + i * 56} 910 ${340 + i * 56} Q 1010 ${333 + i * 56} ${1090 - i * 60} ${340 + i * 56}`}
            fill="none" stroke={KRP.grayDark} strokeWidth={7} strokeLinecap="round" opacity={0.75} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={480} y1={620 + i * 52} x2={i === 4 ? 920 : 1440} y2={620 + i * 52}
            stroke={KRP.gray} strokeWidth={4} opacity={0.7} />
        ))}
        {/* 顔写真欄 (中は「？」だけ。顔は見せない) */}
        <rect x={1160} y={320} width={276} height={330} fill={KRP.paperCool} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1160 320 L 1436 650 M 1436 320 L 1160 650" stroke={KRP.gray} strokeWidth={3} opacity={0.35} />
        {/* 隅の小さな日の丸の印 */}
        <g transform="translate(548 862)">
          <rect x={-56} y={-50} width={112} height={100} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={0} r={27} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 写真欄の中の？ */}
      <QMark x={1298} y={520} s={1.3} f={f} t={seg(f, 12, 24)} />
    </Frame>
  );
};

// ===================================================================
// 対応表 (変えない)
// ===================================================================
export const KSE_C_SCENES: Record<string, (f: number) => React.ReactElement> = {
  ksc_2026_ansatsu: (f) => <S10 f={f} />,
  ksc_fuzai_endan: (f) => <S11 f={f} />,
  ksc_gyokuon_ji: (f) => <S12 f={f} />,
  ksc_wakaremichi: (f) => <S13 f={f} />,
  ksc_nihonjin_seisai: (f) => <S14 f={f} />,
};
