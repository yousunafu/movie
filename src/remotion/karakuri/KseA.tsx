// 「つながる世界史」からくり試作回: 担当A (文#1〜#5・5枚)。
// 1文 = 1シーン = 1枚の絵。motif 名は必ず ksa_ で始める。seed は 700〜704。
// 設計書: docs/kse-test-design.md / 指示書: docs/briefs/KseA.md
//
// ★絵の「格」: 山=全部入り150〜250行 / 並=描くのは1つだけ60〜120行 / 図=図と札25〜50行+世界を敷く。
//   「図」「並」も品質は落とさない。必ず f で動く。大きく置いて画面を使い切る。
// ★絵の中の文字はラベル・数値・標識だけ。TagPlate の y + size*0.85 ≤ 830。seg の b ≤ 42。

import React from "react";
import { KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01 } from "./KarakuriScenes";
import { W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow } from "./KseShared";
import { SP } from "./KseParts";

// このファイルだけで使う色 (足してよい)
const C = {
  tatami: "#C8B878", // 畳
  shoji: "#F3EEDC", // 障子紙
  tatamiHeri: "#4E5D3C", // 畳の縁
  kokuminDark: "#5E5230", // 国民服ズボンの陰
  parchment: "#E9DAB2", // 古地図の羊皮紙
  parchmentDark: "#D8C48E", // 古地図の陸地
  kawara: "#7B8595", // 瓦屋根
  itabei: "#A68B5B", // 木塀
  denchu: "#8A7458", // 電柱の木
  tehranWall: "#D8C2A6", // テヘランの土壁
  sidewalk: "#B9AE97", // テヘランの歩道
} as const;

// ===================================================================
// ローカル部品 (共用ファイルには足さない)
// ===================================================================

// 木箱の真空管ラジオ。x,y = 底の中央。幅 300*s・高さ 230*s。
// detail=true で木目・布目・つまみの刻みまで描く (#3 の寄り用)
const Radio: React.FC<{ x: number; y: number; s?: number; f?: number; detail?: boolean }> = ({
  x, y, s = 1, f = 0, detail = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 足 */}
    <rect x={-130} y={-12} width={40} height={12} rx={4} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={90} y={-12} width={40} height={12} rx={4} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 木箱 */}
    <rect x={-150} y={-222} width={300} height={212} rx={14} fill={SP.radioWood} stroke={KRP.ink} strokeWidth={6} />
    {detail && (
      <g stroke={SP.radioWoodDark} strokeWidth={2.5} fill="none" opacity={0.55}>
        <path d="M -144 -34 Q -60 -40 40 -32 Q 110 -27 144 -34" />
        <path d="M -144 -22 Q -40 -16 60 -22 Q 120 -26 144 -20" />
        <path d="M -140 -210 Q -80 -204 -20 -210 Q 80 -216 140 -208" />
      </g>
    )}
    {/* 布張りのスピーカー開口 */}
    <rect x={-122} y={-198} width={244} height={106} rx={12} fill={SP.radioCloth} stroke={KRP.ink} strokeWidth={5} />
    {detail && (
      <g fill={SP.radioWoodDark} opacity={0.35}>
        {[-100, -56, -12, 32, 76].map((px) =>
          [-184, -166, -148, -130, -112].map((py) => (
            <circle key={`${px}-${py}`} cx={px + ((py / 18) % 2 ? 6 : 0)} cy={py} r={2.6} />
          )),
        )}
      </g>
    )}
    {/* 縦格子 */}
    {[-74, -25, 24, 73].map((px) => (
      <rect key={px} x={px - 8} y={-198} width={16} height={106} rx={6}
        fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={3} />
    ))}
    {/* ダイヤル窓 (針が f でかすかにゆれる) */}
    <rect x={-36} y={-80} width={72} height={38} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <line x1={0} y1={-46} x2={Math.sin(f / 19) * 6} y2={-74} stroke={KRP.red} strokeWidth={3.5} strokeLinecap="round" />
    {detail && (
      <g stroke={KRP.ink} strokeWidth={2} opacity={0.6}>
        {[-26, -13, 0, 13, 26].map((px) => <line key={px} x1={px} y1={-76} x2={px} y2={-70} />)}
      </g>
    )}
    {/* 丸いつまみ2個 */}
    {[-94, 94].map((px) => (
      <g key={px}>
        <circle cx={px} cy={-60} r={25} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={px} y1={-60} x2={px} y2={-80} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        {detail && (
          <g stroke={KRP.ink} strokeWidth={2.2} opacity={0.65}>
            {[45, 90, 135, 225, 270, 315].map((a) => (
              <line key={a}
                x1={px + Math.cos((a * Math.PI) / 180) * 16} y1={-60 + Math.sin((a * Math.PI) / 180) * 16}
                x2={px + Math.cos((a * Math.PI) / 180) * 23} y2={-60 + Math.sin((a * Math.PI) / 180) * 23} />
            ))}
          </g>
        )}
      </g>
    ))}
  </g>
);

// 正座の人 (丸頭2頭身は Person と同じ)。x,y = 膝の接地中央。頭のてっぺんは y-262*s
const Seiza: React.FC<{
  x: number; y: number; s?: number; cloth: string; clothDark: string;
  hair?: "oldman" | "bun" | "child" | "obaa";
  gaze?: [number, number]; f?: number; phase?: number; bow?: number;
}> = ({ x, y, s = 1, cloth, clothDark, hair = "child", gaze = [0, 0], f = 0, phase = 0, bow = 0 }) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 13) * 2;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const hairFill = hair === "oldman" || hair === "obaa" ? KRP.gray : KRP.ink;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${bow})`}>
      {/* 折った脚 */}
      <rect x={-58} y={-46} width={116} height={46} rx={20} fill={clothDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 胴 */}
      <rect x={-50} y={-154} width={100} height={118} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      {/* 腕 (手は膝の上) */}
      <rect x={-64} y={-140} width={20} height={74} rx={10} fill={cloth} stroke={KRP.ink} strokeWidth={4.5}
        transform="rotate(-9 -54 -140)" />
      <rect x={44} y={-140} width={20} height={74} rx={10} fill={cloth} stroke={KRP.ink} strokeWidth={4.5}
        transform="rotate(9 54 -140)" />
      <circle cx={-42} cy={-60} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={42} cy={-60} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* 頭 */}
      <circle cx={0} cy={-206} r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -54 -216 Q -56 -262 0 -264 Q 56 -262 54 -216 Q 26 -236 0 -236 Q -26 -236 -54 -216 Z" fill={hairFill} />
      {(hair === "bun" || hair === "obaa") && (
        <circle cx={0} cy={-262} r={17} fill={hairFill} stroke={KRP.ink} strokeWidth={4} />
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-30} y1={-200} x2={-12} y2={-200} />
          <line x1={12} y1={-200} x2={30} y2={-200} />
        </g>
      ) : (
        <g>
          <ellipse cx={-21} cy={-201} rx={11} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={21} cy={-201} rx={11} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-21 + gx} cy={-201 + gy} r={5} fill={KRP.ink} />
          <circle cx={21 + gx} cy={-201 + gy} r={5} fill={KRP.ink} />
        </g>
      )}
      {/* 眉と口 (かしこまり) */}
      <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" fill="none">
        <line x1={-30} y1={-224} x2={-12} y2={-226} />
        <line x1={12} y1={-226} x2={30} y2={-224} />
        <line x1={-8} y1={-170} x2={8} y2={-170} />
      </g>
    </g>
  );
};

// 戦闘帽 (置いても持たせてもよい小物)。x,y = 帽子の底中央
const SentoBo: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <path d="M -40 0 Q -40 -36 0 -38 Q 40 -36 40 0 Z" fill={SP.kokumin} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -42 0 L 46 0 L 40 10 L -40 8 Z" fill={C.kokuminDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// #1 (図) 時代が違っても、国が違っても、人の心は変わらない。だから歴史は、今日のニュースを読む手がかりになる。つながる世界史。
// どこ: 広げた古地図の上 (題字カード)
// 演出: 地図の上の3つの品 (ラジオ・杯・提灯) を赤い糸が順に結び、中央に題字
// 動き: 糸が f で走って結ばれていく
const S1: React.FC<{ f: number }> = ({ f }) => {
  const tMap = easeOut(seg(f, 0, 12));
  const tItem = [seg(f, 4, 14), seg(f, 8, 18), seg(f, 12, 22)];
  const thread1 = easeOut(seg(f, 16, 28)); // ラジオ→杯
  const thread2 = easeOut(seg(f, 28, 42)) * 0.82; // 杯→提灯 (結び終わらず途中で止まる = #16への伏線)
  return (
    <Frame f={f} seed={700} bg={KRP.cream}>
      {/* ===== 世界: 広げた古地図 (画面の端まで) ===== */}
      <rect x={96} y={116} width={W - 192} height={H - 212} rx={10}
        fill={C.parchment} stroke={KRP.ink} strokeWidth={7} opacity={tMap} />
      <g opacity={tMap}>
        {/* 四隅の巻き上がり */}
        <path d="M 96 170 Q 96 116 150 116 L 96 116 Z M 96 116 L 170 116 Q 110 128 108 186 Q 96 160 96 116 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1824 116 L 1750 116 Q 1810 128 1812 186 Q 1824 160 1824 116 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 96 964 L 170 964 Q 110 952 108 894 Q 96 920 96 964 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1824 964 L 1750 964 Q 1810 952 1812 894 Q 1824 920 1824 964 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 大陸の輪郭 (ゆるく) */}
        <path d="M 300 480 Q 340 400 450 420 Q 520 380 620 410 Q 700 440 660 520 Q 600 590 490 570 Q 380 600 330 550 Q 290 520 300 480 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        <path d="M 820 560 Q 880 470 1010 490 Q 1150 460 1240 520 Q 1310 570 1250 640 Q 1150 700 1020 670 Q 890 690 840 630 Q 800 600 820 560 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        <path d="M 1380 420 Q 1450 360 1570 390 Q 1680 370 1720 450 Q 1740 520 1650 540 Q 1540 570 1450 530 Q 1370 490 1380 420 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        <path d="M 1300 800 Q 1360 760 1460 780 Q 1540 800 1500 850 Q 1420 880 1340 860 Q 1280 840 1300 800 Z"
          fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        {/* 航路の点線 */}
        <path d="M 240 760 Q 560 860 900 800 Q 1300 740 1700 820" fill="none"
          stroke={KRP.ink} strokeWidth={4} strokeDasharray="4 18" strokeLinecap="round" opacity={0.45} />
        <path d="M 260 300 Q 700 230 1180 290 Q 1500 320 1760 260" fill="none"
          stroke={KRP.ink} strokeWidth={4} strokeDasharray="4 18" strokeLinecap="round" opacity={0.45} />
        {/* 方位記号 */}
        <g transform="translate(258 330)">
          <circle r={56} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
          <polygon points="0,-48 12,0 0,16 -12,0" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points="0,48 10,8 -10,8" fill={C.parchment} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={-48} y1={0} x2={48} y2={0} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
      </g>
      {/* ===== 3つの品 (離して置く) ===== */}
      {/* 木箱ラジオ (小) */}
      <g transform={`translate(470 630) scale(${0.62 * pop(clamp01(tItem[0]))})`} opacity={tItem[0] > 0 ? 1 : 0}>
        <Radio x={0} y={0} f={f} />
      </g>
      {/* 真鍮の杯 (小・自作) */}
      <g transform={`translate(1010 790) scale(${1.2 * pop(clamp01(tItem[1]))})`} opacity={tItem[1] > 0 ? 1 : 0}>
        <ellipse cx={0} cy={-6} rx={52} ry={12} fill={SP.brassDark} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -14 -10 L -9 -52 L 9 -52 L 14 -10 Z" fill={SP.brass} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -46 -128 C -46 -96 -32 -70 -16 -58 C -8 -52 8 -52 16 -58 C 32 -70 46 -96 46 -128 Z"
          fill={SP.brass} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-128} rx={43} ry={10} fill={SP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 -98 Q 0 -108 30 -98" fill="none" stroke={SP.brassDark} strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* 提灯 (小) */}
      <g transform={`translate(1480 560) scale(${pop(clamp01(tItem[2]))})`} opacity={tItem[2] > 0 ? 1 : 0}>
        <rect x={-30} y={-158} width={60} height={14} rx={5} fill={KRP.ink} />
        <ellipse cx={0} cy={-80} rx={62} ry={66} fill={SP.lantern} stroke={KRP.ink} strokeWidth={5} />
        {[-44, -22, 0, 22, 44].map((px) => (
          <path key={px} d={`M ${px} -144 Q ${px * 1.35} -80 ${px} -16`} fill="none"
            stroke={KRP.ink} strokeWidth={2.6} opacity={0.5} />
        ))}
        <rect x={-30} y={-18} width={60} height={14} rx={5} fill={KRP.ink} />
      </g>
      {/* ===== 赤い糸 (少したわむ。f で順に結んでいく) ===== */}
      <path d="M 480 648 C 620 760 840 830 980 800" fill="none" stroke={KRP.red} strokeWidth={7}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - thread1}
        opacity={thread1 > 0 ? 0.95 : 0} />
      <path d="M 1040 788 C 1180 820 1340 700 1452 596" fill="none" stroke={KRP.red} strokeWidth={7}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - thread2}
        opacity={thread2 > 0 ? 0.95 : 0} />
      {/* 結び目 */}
      <circle cx={480} cy={648} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} opacity={thread1 > 0 ? 1 : 0} />
      <circle cx={1010} cy={794} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5}
        opacity={thread1 >= 1 ? 1 : 0} />
      {/* ===== 題字 ===== */}
      <TagPlate x={960} y={258} text="つながる世界史" size={72} t={seg(f, 6, 20)} />
    </Frame>
  );
};

// #2 (山) 1945年8月15日、正午。ラジオから、雑音まじりの声が流れました。
// どこ: 昭和20年の茶の間。木箱の真空管ラジオが主役
// 演出: ラジオを囲んで正座・直立の老若男女。雑音の波線が震えながら出る
// 動き: 波線のゆれ・人のかしこまり・まばたき
const S2: React.FC<{ f: number }> = ({ f }) => {
  const tRoom = easeOut(seg(f, 0, 10));
  const tRadio = pop(clamp01(seg(f, 6, 18)));
  const tWave = seg(f, 22, 34);
  // 雑音の波線: ギザギザとなめらかの混ざった線。f で震える
  const noisePath = (off: number, amp: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 11; i++) {
      const x = 1150 - i * 34;
      const jag = i % 3 === 1 ? amp : i % 3 === 2 ? amp * 0.35 : amp * 0.7;
      const y = 396 - off - i * 7 + Math.sin((f + off * 2) / 2.6 + i * 2.2) * jag;
      pts.push(`${i ? "L" : "M"} ${x} ${y}`);
    }
    return pts.join(" ");
  };
  return (
    <Frame f={f} seed={701} bg={KRP.cream}>
      {/* ===== 茶の間ぜんぶ ===== */}
      <g opacity={tRoom}>
        {/* 障子 (桟の格子) */}
        <rect x={110} y={120} width={760} height={470} fill={C.shoji} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.65}>
          {[300, 490, 680].map((px) => <line key={px} x1={px} y1={120} x2={px} y2={590} />)}
          {[238, 356, 474].map((py) => <line key={py} x1={110} y1={py} x2={870} y2={py} />)}
        </g>
        <line x1={490} y1={120} x2={490} y2={590} stroke={KRP.ink} strokeWidth={6} />
        {/* 柱 */}
        <rect x={880} y={100} width={56} height={520} fill={C.itabei} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 892 130 Q 898 300 890 480 M 916 110 Q 910 320 918 560" fill="none"
          stroke={KRP.ink} strokeWidth={2.2} opacity={0.4} />
        {/* 右の壁の柱時計 (正午) */}
        <g transform="translate(1530 280)">
          <rect x={-70} y={-96} width={140} height={210} rx={14} fill={C.itabei} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-18} r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {[0, 90, 180, 270].map((a) => (
            <line key={a} x1={Math.sin((a * Math.PI) / 180) * 44} y1={-18 - Math.cos((a * Math.PI) / 180) * 44}
              x2={Math.sin((a * Math.PI) / 180) * 50} y2={-18 - Math.cos((a * Math.PI) / 180) * 50}
              stroke={KRP.ink} strokeWidth={3.5} />
          ))}
          <line x1={0} y1={-18} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={0} y1={-18} x2={0} y2={-60} stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={0} cy={-18} r={5} fill={KRP.ink} />
          <circle cx={0} cy={74} r={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5}
            transform={`rotate(${Math.sin(f / 7) * 7} 0 44)`} />
        </g>
        {/* 畳 (縁の線) */}
        <rect x={-20} y={600} width={W + 40} height={H - 580} fill={C.tatami} stroke={KRP.ink} strokeWidth={7} />
        <g>
          {[
            "M 320 600 L 120 1080", "M 960 600 L 960 1080", "M 1600 600 L 1800 1080",
          ].map((d, i) => (
            <g key={i}>
              <path d={d} stroke={C.tatamiHeri} strokeWidth={16} fill="none" />
              <path d={d} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.6} />
            </g>
          ))}
          <path d="M -20 820 L 350 820 M 1570 820 L 1940 820" stroke={C.tatamiHeri} strokeWidth={12} fill="none" />
          <g stroke={KRP.ink} strokeWidth={2} opacity={0.25}>
            {[660, 700, 740].map((py) => <line key={py} x1={420} y1={py} x2={880} y2={py} />)}
          </g>
        </g>
      </g>
      {/* ===== ちゃぶ台 + 主役のラジオ ===== */}
      <g opacity={tRoom}>
        <g stroke={KRP.ink} strokeWidth={5} fill={SP.radioWoodDark}>
          <rect x={1100} y={670} width={26} height={120} rx={8} />
          <rect x={1370} y={670} width={26} height={120} rx={8} />
        </g>
        <ellipse cx={1248} cy={664} rx={282} ry={54} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={1248} cy={652} rx={282} ry={50} fill="#C68A55" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform={`translate(1248 648) scale(${tRadio})`} opacity={tRadio > 0 ? 1 : 0}>
        <Radio x={0} y={0} s={1.02} f={f} />
      </g>
      {/* 雑音の波線 (震える) */}
      <g opacity={tWave}>
        <path d={noisePath(0, 16)} fill="none" stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
        <path d={noisePath(52, 22)} fill="none" stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        <path d={noisePath(104, 12)} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </g>
      {/* ===== 5人: かしこまって整列、ラジオの方を向く ===== */}
      {/* 直立の勤め人 (白い開襟シャツ) */}
      <Person x={250} y={840} s={1.08} cloth={KRP.white} clothDark={KRP.grayDark}
        face="normal" gaze={[7, 0]} f={f} phase={1} still />
      {/* 正座の老男 (国民服)。戦闘帽は膝の横 */}
      <Seiza x={555} y={830} s={1.05} cloth={SP.kokumin} clothDark={C.kokuminDark}
        hair="oldman" gaze={[7, 1]} f={f} phase={2} />
      <SentoBo x={672} y={832} s={0.95} rot={-6} />
      {/* 正座の女 (もんぺ+白い割烹着) */}
      <Seiza x={812} y={852} s={1.05} cloth={KRP.white} clothDark={SP.monpe}
        hair="bun" gaze={[7, 1]} f={f} phase={3} />
      {/* 子供 */}
      <Seiza x={1018} y={846} s={0.74} cloth={KRP.blueSoft} clothDark={KRP.grayDark}
        hair="child" gaze={[6, 0]} f={f} phase={4} />
      {/* 老婆 */}
      <Seiza x={1660} y={856} s={1.02} cloth={KRP.grayDark} clothDark={KRP.gray}
        hair="obaa" gaze={[-7, 1]} f={f} phase={5} />
      {/* 札 (年月日は字幕にあるので書かない) */}
      <TagPlate x={350} y={236} text="玉音放送" size={50} t={seg(f, 28, 40)} rot={-2} />
    </Frame>
  );
};

// #3 (並) 多くの日本人にとって、初めて聞く天皇の声でした。
// どこ: 同じ茶の間の続き。ラジオに大きく寄る
// 演出: スピーカー開口から音波の輪。脱帽して頭を垂れる1人
// 動き: 音波の輪が広がり続ける
const S3: React.FC<{ f: number }> = ({ f }) => {
  const tIn = easeOut(seg(f, 0, 12));
  const tMan = seg(f, 14, 26);
  const tWave = seg(f, 18, 30);
  // 音波の輪: スピーカー開口の右端 (1035, 445) から右へ広がり続ける
  const ringR = (i: number) => ((f * 6 + i * 150) % 450) + 70;
  return (
    <Frame f={f} seed={702} bg={KRP.cream}>
      {/* 背景は障子の明かりだけ */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.shoji} opacity={0.7 * tIn} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.3 * tIn}>
        {[220, 520, 820, 1120, 1420, 1720].map((px) => <line key={px} x1={px} y1={-20} x2={px} y2={1100} />)}
        {[160, 400, 640, 880].map((py) => <line key={py} x1={-20} y1={py} x2={1940} y2={py} />)}
      </g>
      <ellipse cx={620} cy={470} rx={760} ry={560} fill={C.shoji} opacity={0.8 * tIn} />
      {/* 畳の際 */}
      <rect x={-20} y={930} width={W + 40} height={170} fill={C.tatami} stroke={KRP.ink} strokeWidth={6} opacity={tIn} />
      {/* ===== 主役: ラジオに大きく寄る (画面の6割・左寄せ・作り込み) ===== */}
      <g opacity={tIn}>
        <Radio x={620} y={938} s={3.4} f={f} detail />
      </g>
      {/* 音波の輪 (外ほど薄い・広がり続ける) */}
      <g opacity={tWave}>
        {[0, 1, 2].map((i) => {
          const r = ringR(i);
          return (
            <path key={i}
              d={`M ${1035 + r * 0.38} ${445 - r * 0.92} A ${r} ${r} 0 0 1 ${1035 + r * 0.38} ${445 + r * 0.92}`}
              fill="none" stroke={KRP.blueDeep} strokeWidth={13 - i * 2}
              strokeLinecap="round" opacity={Math.max(0.12, 0.95 - (r / 520) * 0.85)} />
          );
        })}
      </g>
      {/* ===== 1人だけ: 脱帽して頭を垂れる男 (国民服・戦闘帽を胸に) ===== */}
      <g opacity={tMan}>
        <Person x={1580} y={958} s={1.22} cloth={SP.kokumin} clothDark={C.kokuminDark}
          face="normal" gaze={[-8, 10]} lean={-10} pose="hold" f={f} still hair="cap" />
        {/* 胸に当てた戦闘帽 (hold の手元のすぐ下。胴より暗い色で分ける) */}
        <g transform="translate(1580 958) scale(1.22) rotate(-10)">
          <g transform="translate(0 -96) rotate(10)">
            <path d="M -42 0 Q -42 -38 0 -40 Q 42 -38 42 0 Z" fill={C.kokuminDark} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -44 0 L 48 0 L 42 11 L -42 9 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -26 -22 Q 0 -34 26 -22" fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.5} />
          </g>
          {/* 帽子を押さえる手 (帽子の上に描き直す) */}
          <circle cx={-14} cy={-118} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={14} cy={-118} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// #4 (山) その中に、「堪え難きを堪え、忍び難きを忍び」という一節がありました。一億玉砕を叫んでいた国が、この日、戦争をやめました。
// どこ: 標語看板の立つ街角
// 演出: 看板「進め一億火の玉だ」に墨の太い斜線が引かれる事件。人々がうなだれる
// 動き: 墨線が f で引かれる・人の反応
const S4: React.FC<{ f: number }> = ({ f }) => {
  const tTown = easeOut(seg(f, 0, 10));
  const tBoard = pop(clamp01(seg(f, 4, 16)));
  const stroke1 = easeOut(seg(f, 20, 34)); // 墨の斜線が引かれる事件
  const tPeople = seg(f, 10, 22);
  const chars = "進め一億火の玉だ".split("");
  return (
    <Frame f={f} seed={703} bg={KRP.cream}>
      {/* ===== 世界: 街角 ===== */}
      <g opacity={tTown}>
        {/* 遠くの瓦屋根 */}
        {[
          [120, 470, 340], [400, 440, 420], [1180, 460, 380], [1520, 430, 420],
        ].map(([bx, by, bw], i) => (
          <g key={i}>
            <polygon points={`${bx - 30},${by + 60} ${bx + bw / 2},${by} ${bx + bw + 30},${by + 60}`}
              fill={C.kawara} stroke={KRP.ink} strokeWidth={5} />
            <rect x={bx} y={by + 60} width={bw} height={80} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} opacity={0.9} />
            <path d={`M ${bx + 10} ${by + 52} L ${bx + bw - 10} ${by + 52}`} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          </g>
        ))}
        {/* 木塀 */}
        <rect x={-20} y={540} width={W + 40} height={130} fill={C.itabei} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
          {[120, 300, 480, 660, 840, 1020, 1200, 1380, 1560, 1740].map((px) => (
            <line key={px} x1={px} y1={540} x2={px} y2={670} />
          ))}
          <line x1={-20} y1={578} x2={1940} y2={578} />
        </g>
        {/* 地面 */}
        <rect x={-20} y={670} width={W + 40} height={H - 650} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.3}>
          <path d="M 200 760 Q 400 752 600 762 M 1300 850 Q 1500 842 1700 854" fill="none" />
        </g>
        {/* 電柱 */}
        <rect x={1702} y={110} width={44} height={570} fill={C.denchu} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1620} y={158} width={208} height={20} rx={6} fill={C.denchu} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={1660} cy={150} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={1788} cy={150} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M -20 196 Q 800 230 1656 152 M 1792 152 Q 1870 148 1940 150" fill="none"
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
      </g>
      {/* ===== 主役: 標語の立て看板 ===== */}
      <g transform={`translate(620 420) scale(${tBoard}) translate(-620 -420)`} opacity={tBoard > 0 ? 1 : 0}>
        {/* 足 (斜めの支え) */}
        <g stroke={KRP.ink} strokeWidth={5} fill={SP.radioWoodDark}>
          <polygon points="470,660 440,780 468,780 496,660" />
          <polygon points="770,660 800,780 772,780 744,660" />
        </g>
        {/* 白地の板 + 木枠 */}
        <rect x={452} y={128} width={336} height={540} fill={SP.sloganPaper} stroke={KRP.ink} strokeWidth={7} />
        <rect x={452} y={128} width={336} height={540} fill="none" stroke={SP.radioWoodDark} strokeWidth={16} />
        <rect x={452} y={128} width={336} height={540} fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 縦書きの墨太字 */}
        {chars.map((ch, i) => (
          <text key={i} x={620} y={214 + i * 56} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={54} fill={SP.sumi}>{ch}</text>
        ))}
        {/* 泥はね・古び */}
        <circle cx={492} cy={636} r={7} fill={KRP.floor} opacity={0.8} />
        <circle cx={742} cy={610} r={5} fill={KRP.floor} opacity={0.8} />
      </g>
      {/* ===== 事件: 墨の太い斜線がドンと引かれる ===== */}
      <g opacity={stroke1 > 0 ? 1 : 0}>
        <path d="M 468 176 L 782 630" fill="none" stroke={SP.sumi} strokeWidth={42} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - stroke1} />
        {/* 先端のかすれ */}
        <g stroke={SP.sumi} strokeLinecap="round" opacity={seg(f, 32, 40)}>
          <line x1={760} y1={596} x2={806} y2={668} strokeWidth={9} />
          <line x1={778} y1={606} x2={812} y2={652} strokeWidth={6} />
          <line x1={744} y1={614} x2={776} y2={664} strokeWidth={5} />
        </g>
        {/* 書き出しの墨だまり */}
        <circle cx={470} cy={178} r={26} fill={SP.sumi} opacity={seg(f, 20, 26)} />
        <circle cx={520} cy={160} r={6} fill={SP.sumi} opacity={0.8 * seg(f, 22, 28)} />
        <circle cx={444} cy={226} r={5} fill={SP.sumi} opacity={0.8 * seg(f, 22, 28)} />
      </g>
      {/* ===== 手前の3人がうなだれる ===== */}
      <g opacity={tPeople}>
        {/* 国民服の男 (肩を落とす) */}
        <Person x={240} y={1016} s={1.18} cloth={SP.kokumin} clothDark={C.kokuminDark}
          face="sad" gaze={[2, 9]} lean={-6} f={f} phase={1} still />
        {/* もんぺの女 (顔を伏せる) */}
        <Person x={1060} y={1032} s={1.16} cloth={KRP.white} clothDark={SP.monpe}
          face="sad" gaze={[-2, 9]} lean={5} f={f} phase={2} still />
        {/* 学帽の子 */}
        <Person x={1400} y={988} s={0.82} cloth={KRP.blueSoft} clothDark={KRP.grayDark}
          face="sad" gaze={[-3, 9]} lean={-4} f={f} phase={3} still />
        {/* 学帽 (子の頭に描き足す。Person は still なので位置は固定) */}
        <g transform="translate(1400 988) scale(0.82) rotate(-4)">
          <path d="M -58 -270 Q -58 -312 0 -314 Q 58 -312 58 -270 Q 28 -286 0 -286 Q -28 -286 -58 -270 Z"
            fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -60 -268 L 62 -268 L 56 -256 L -54 -256 Z" fill={KRP.ink} />
          <circle cx={0} cy={-298} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// #5 (並) 43年後の1988年。イランでも、同じことが起きます。
// どこ: 1988年テヘランの街角へ舞台転換
// 演出: 殉教者ポスター・窓のテープ×・イラン国旗で「ここはイラン」。年号の札
// 動き: 舞台が f でスライドして入れ替わる
const S5: React.FC<{ f: number }> = ({ f }) => {
  const slide = easeOut(seg(f, 4, 40)); // 右から新しい壁が入ってくる
  const wave = Math.sin(f / 8) * 12; // 国旗のはためき
  return (
    <Frame f={f} seed={704} bg={KRP.cream}>
      {/* ===== 出ていく側: 日本の木塀 (左へ抜ける) ===== */}
      <g transform={`translate(${-slide * 1500} 0)`}>
        <rect x={-20} y={420} width={W + 40} height={320} fill={C.itabei} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
          {[140, 340, 540, 740, 940, 1140, 1340, 1540, 1740].map((px) => (
            <line key={px} x1={px} y1={420} x2={px} y2={740} />
          ))}
        </g>
        <rect x={-20} y={740} width={W + 40} height={H - 720} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
        <polygon points="200,420 560,300 920,420" fill={C.kawara} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* ===== 入ってくる側: 1988年テヘランの壁 ===== */}
      <g transform={`translate(${(1 - slide) * 1500} 0)`}>
        {/* 土壁と歩道 */}
        <rect x={-20} y={-20} width={W + 40} height={850} fill={C.tehranWall} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.22}>
          <line x1={-20} y1={250} x2={1940} y2={250} />
          <line x1={-20} y1={520} x2={1940} y2={520} />
          <line x1={-20} y1={780} x2={1940} y2={780} />
          {[460, 1080, 1700].map((px) => <line key={px} x1={px} y1={250} x2={px} y2={520} />)}
        </g>
        <rect x={-20} y={830} width={W + 40} height={H - 810} fill={C.sidewalk} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
          {[260, 700, 1140, 1580].map((px) => <line key={px} x1={px} y1={830} x2={px - 60} y2={1080} />)}
        </g>
        {/* 殉教者ポスター (丸頭で簡略・名前の帯・赤いチューリップ) */}
        <g transform="translate(450 500)">
          <rect x={-190} y={-270} width={380} height={540} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-190} y={-270} width={380} height={540} fill="none" stroke={SP.iranGreen} strokeWidth={10}
            opacity={0.85} />
          {/* 若い男 (丸頭で簡略・ひげの影) */}
          <path d="M -120 44 Q -110 -14 -58 -26 L 58 -26 Q 110 -14 120 44 Z"
            fill={SP.aba} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-104} r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -70 -118 Q -74 -176 0 -178 Q 74 -176 70 -118 Q 34 -146 0 -146 Q -34 -146 -70 -118 Z"
            fill={KRP.ink} />
          {/* あごひげ (顔の下縁に沿う三日月) と口ひげ。口は静かな一文字 */}
          <path d="M -62 -70 Q -52 -32 0 -30 Q 52 -32 62 -70 Q 48 -42 0 -40 Q -48 -42 -62 -70 Z"
            fill={KRP.ink} opacity={0.92} />
          <path d="M -26 -72 Q 0 -82 26 -72 Q 14 -64 0 -66 Q -14 -64 -26 -72 Z" fill={KRP.ink} opacity={0.92} />
          <circle cx={-26} cy={-100} r={7} fill={KRP.ink} />
          <circle cx={26} cy={-100} r={7} fill={KRP.ink} />
          <line x1={-12} y1={-58} x2={12} y2={-58} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            <line x1={-40} y1={-126} x2={-14} y2={-128} />
            <line x1={14} y1={-128} x2={40} y2={-126} />
          </g>
          {/* 名前の帯 (文字は書かず飾り線で) */}
          <rect x={-170} y={70} width={340} height={64} rx={8} fill={SP.mourning} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -140 102 Q -110 90 -80 102 Q -56 112 -28 100 M 10 102 Q 44 90 80 102 Q 110 112 142 100"
            fill="none" stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" opacity={0.9} />
          {/* 赤いチューリップ = 殉教の象徴 */}
          <g transform="translate(0 210) scale(1.35)">
            <path d="M 0 36 L 0 -8" stroke={SP.iranGreen} strokeWidth={7} strokeLinecap="round" />
            <path d="M -4 10 Q -36 2 -40 -22" fill="none" stroke={SP.iranGreen} strokeWidth={6} strokeLinecap="round" />
            <path d="M -30 -14 Q -30 -58 -14 -44 Q -2 -70 0 -72 Q 2 -70 14 -44 Q 30 -58 30 -14 Q 14 2 0 0 Q -14 2 -30 -14 Z"
              fill={SP.tulip} stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
        {/* イラン現行国旗 (緑/白/赤の横三色。f ではためく) */}
        <g transform="translate(936 150)">
          <rect x={-10} y={-26} width={16} height={700} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-2} cy={-32} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          {[
            { c: SP.iranGreen, oy: 0 }, { c: KRP.white, oy: 62 }, { c: SP.iranRed, oy: 124 },
          ].map(({ c, oy }) => (
            <path key={oy}
              d={`M 6 ${oy} L 288 ${oy + wave * 0.4} Q 300 ${oy + 31 + wave} 288 ${oy + 62 + wave * 0.4}
                  L 6 ${oy + 62} Z`}
              fill={c} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
        </g>
        {/* 窓ガラスにテープの× (都市戦争の名残) */}
        <g transform="translate(1480 420)">
          <rect x={-190} y={-200} width={380} height={400} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-168} y={-178} width={336} height={356} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-178} x2={0} y2={178} stroke={KRP.grayDark} strokeWidth={14} />
          <line x1={-168} y1={0} x2={168} y2={0} stroke={KRP.grayDark} strokeWidth={14} />
          {/* 白いテープの× (左右の窓にそれぞれ) */}
          {[-84, 84].map((cx) => (
            <g key={cx} stroke={KRP.white} strokeWidth={18} strokeLinecap="round" opacity={0.92}>
              <line x1={cx - 64} y1={-150} x2={cx + 64} y2={150} />
              <line x1={cx + 64} y1={-150} x2={cx - 64} y2={150} />
            </g>
          ))}
          <rect x={-168} y={-178} width={336} height={356} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        </g>
        {/* 札 (年号は字幕にあるので書かない) */}
        <TagPlate x={1580} y={140} text="テヘラン" size={54} t={seg(f, 28, 42)} rot={2} />
      </g>
    </Frame>
  );
};

// ===================================================================
// 対応表 (変えない)
// ===================================================================
export const KSE_A_SCENES: Record<string, (f: number) => React.ReactElement> = {
  ksa_op_tsunagaru: (f) => <S1 f={f} />,
  ksa_radio_1945: (f) => <S2 f={f} />,
  ksa_tenno_koe: (f) => <S3 f={f} />,
  ksa_gyokusai_yameta: (f) => <S4 f={f} />,
  ksa_1988_iran: (f) => <S5 f={f} />,
};
