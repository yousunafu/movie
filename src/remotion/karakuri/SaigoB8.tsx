// 「人類は、昔から飛ばして観ていた」: 文#161〜#171 (11文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1247〜1257。
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
  officeWall: "#E9DFC8",   // 事務所の漆喰
  officePanel: "#A8814F",  // 腰板の木
  deskTop: "#8F6A3E",      // 机の天板
  ledger: "#F6F0DC",       // 帳簿の紙
  pale: "#7FA0C8",         // 青ざめの縦線
  night: "#262E3E",        // 暗転の地
  nightFloor: "#3A3326",   // 暗い床板
  rayGold: "#F6DF9A",      // 隙間から漏れる光
  brick: "#C98B6B",        // 街のレンガ
  brickDark: "#A96F4F",
  sidewalk: "#CFC3A8",     // 歩道
  road: "#A9A08C",         // 車道
  daySky: "#B7D3E6",       // 昼の空
  awning: "#B8433A",       // 映画館のひさし
  marquee: "#F3E9CE",      // 看板の地
  velvet: "#6E2D36",       // 緞帳より暗い臙脂
  canMetal: "#B9BDC2",     // フィルム缶の鈍い銀
  canDark: "#8E939A",
  chain: "#6F7680",        // 鎖
  brassY: "#C8A84B",       // 天秤の真鍮 (KRP.brassと別色)
  mapPaper: "#EFE6CC",     // 地図の紙
  mapLand: "#E2D3A8",      // 地図の陸
  mapSea: "#AFCBD8",       // 地図の海
  frWall: "#DCCBB2",       // 仏ロビーの壁
  frameGold: "#C9A23E",    // 額縁の金
  posterInk: "#2B3240",    // ポスターの闇
  doorWood: "#7A5A34",     // 古い扉
  doorWoodD: "#5C4226",
  hallWall: "#4A4034",     // 暗い廊下の壁
  studioWall: "#5E6672",   // 試写室の壁 (青灰)
  studioFloor: "#4C443A",  // 試写室の床
  smoke: "#C8CDD4",        // 葉巻の煙
  skin: "#F2CFA6",         // 手の肌色
} as const;
void useCurrentFrame;
void ChapterDoor; void Danmen; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void Stamp; void QMark; void Arrow;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目の擬似乱数 (毎フレーム同じ。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// 青ざめの縦線 (頭に3本。Person の頭は足元から -228*s)
const PaleLines: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.pale} strokeWidth={5}
    strokeLinecap="round" opacity={0.85}>
    <line x1={-26} y1={-282} x2={-24} y2={-252} />
    <line x1={0} y1={-286} x2={0} y2={-254} />
    <line x1={26} y1={-282} x2={24} y2={-252} />
  </g>
);

// ガス灯風の壁ランプ (炎が f でゆれる)
const WallLamp: React.FC<{ x: number; y: number; f: number; s?: number }> =
  ({ x, y, f, s = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 44 L 0 16 Q -26 12 -26 -12 L 26 -12 Q 26 12 0 16"
        fill="none" stroke={C.ink} strokeWidth={5} />
      <path d="M -20 -12 L -14 -52 L 14 -52 L 20 -12 Z"
        fill={C.marquee} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={0} cy={-30} r={26 + Math.sin(f / 6) * 2} fill={SGP.lampGold} opacity={0.3} />
      <path d={`M 0 ${-22 + Math.sin(f / 5) * 1.5} C -6 -28 -5 -36 0 -40 C 5 -36 6 ${-28 + Math.sin(f / 5) * 1.5} 0 ${-22 + Math.sin(f / 5) * 1.5} Z`}
        fill={SGP.lampGold} stroke={C.ink} strokeWidth={3} />
    </g>
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #161 劇場主たちは、青ざめました。途中のお客を断れば、そのぶん売上が減るからです。
// 格: 並 / seed 1247
// 絵: 事務所。帳簿を囲む劇場主たち。吹き出しの中で売上の棒グラフが欠けていく想像図。顔が青い
// どこ: 1960年の劇場事務所。腰板の壁・帳簿の机・ガス灯でなく電気スタンド
// 演出: 帳簿を囲む3人の劇場主。頭上の想像の吹き出しで売上の棒が欠けて赤い下矢印
// 動き: カメラがゆっくり寄る。棒が f で欠ける。青ざめ線。スタンドの光がまたたく
const Sg161: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.05;
  const bubT = seg(f, 6, 18);
  return (
    <Frame f={f} seed={1247}>
      <g transform={zoomAt(z, 960, 540)}>
        {/* 壁 (漆喰+腰板) と床 */}
        <rect x={-20} y={-20} width={W + 40} height={700} fill={C.officeWall} />
        <rect x={-20} y={560} width={W + 40} height={160} fill={C.officePanel} />
        <line x1={-20} y1={560} x2={W + 20} y2={560} stroke={C.ink} strokeWidth={6} />
        {[180, 460, 740, 1020, 1300, 1580, 1860].map((px) => (
          <line key={px} x1={px} y1={566} x2={px} y2={714} stroke={C.ink} strokeWidth={3} opacity={0.4} />
        ))}
        <rect x={-20} y={720} width={W + 40} height={H - 700} fill={KRP.floor} />
        <line x1={-20} y1={720} x2={W + 20} y2={720} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={lerp(240, -420, i / 8)} y1={H + 20}
            x2={lerp(800, 1100, i / 8)} y2={720} stroke={C.ink} strokeWidth={3} opacity={0.25} />
        ))}
        {/* 壁の飾り: 上映スケジュールの黒板と鍵掛け */}
        <g transform="translate(240 300)">
          <rect x={-130} y={-150} width={260} height={300} rx={8}
            fill="#3C4438" stroke={C.ink} strokeWidth={7} />
          <rect x={-118} y={-138} width={236} height={276} fill="none"
            stroke={C.marquee} strokeWidth={3} opacity={0.5} />
          {[-96, -48, 0, 48, 96].map((ly, i) => (
            <line key={i} x1={-96} y1={ly} x2={56 + rnd(1, i) * 38} y2={ly}
              stroke={C.marquee} strokeWidth={5} opacity={0.65} strokeLinecap="round" />
          ))}
        </g>
        <g transform="translate(1700 320)">
          <rect x={-66} y={-26} width={132} height={52} rx={8}
            fill={C.officePanel} stroke={C.ink} strokeWidth={5} />
          {[-40, 0, 40].map((kx, i) => (
            <g key={kx} transform={`translate(${kx} 14) rotate(${Math.sin(f / 10 + i) * 4} 0 -12)`}>
              <circle cx={0} cy={-12} r={4} fill={C.ink} />
              <path d="M 0 -8 L 0 26 M 0 18 L 9 18 M 0 26 L 7 26"
                fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
            </g>
          ))}
        </g>
        {/* 電気スタンドつきの机と帳簿 */}
        <g>
          <rect x={430} y={700} width={1060} height={44} rx={8}
            fill={C.deskTop} stroke={C.ink} strokeWidth={8} />
          <path d="M 470 744 L 456 1010 L 516 1010 L 524 744 M 1450 744 L 1464 1010 L 1404 1010 L 1396 744"
            fill={C.deskTop} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 470 760 Q 700 752 940 758 M 1050 772 Q 1240 766 1430 772"
            fill="none" stroke={C.ink} strokeWidth={3} opacity={0.3} />
          {/* 開いた帳簿 */}
          <g transform="translate(950 686) rotate(-2)">
            <path d="M -210 0 Q -105 -26 0 -8 Q 105 -26 210 0 L 200 22 Q 100 6 0 16 Q -100 6 -200 22 Z"
              fill={C.ledger} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <line x1={0} y1={-8} x2={0} y2={16} stroke={C.ink} strokeWidth={4} />
            {[0, 1, 2].map((i) => (
              <g key={i} stroke={C.ink} strokeWidth={2.6} opacity={0.5}>
                <line x1={-182} y1={-4 + i * 7} x2={-36} y2={-10 + i * 7} />
                <line x1={36} y1={-10 + i * 7} x2={182} y2={-4 + i * 7} />
              </g>
            ))}
          </g>
          {/* そろばんとインク壺 */}
          <g transform="translate(600 690) rotate(-4)">
            <rect x={-92} y={-30} width={184} height={34} rx={6}
              fill={C.officePanel} stroke={C.ink} strokeWidth={5} />
            {[-66, -33, 0, 33, 66].map((bx, i) => (
              <g key={bx}>
                <line x1={bx} y1={-28} x2={bx} y2={2} stroke={C.ink} strokeWidth={3} />
                <circle cx={bx} cy={-18 + rnd(2, i) * 12} r={7} fill={KRP.bronze} stroke={C.ink} strokeWidth={3} />
              </g>
            ))}
          </g>
          <g transform="translate(1340 692)">
            <path d="M -18 0 L -22 -26 L 22 -26 L 18 0 Z" fill={C.ink} />
            <line x1={10} y1={-30} x2={34} y2={-66} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
          {/* 緑笠の電気スタンド (光がまたたく) */}
          <g transform="translate(1560 700)">
            <circle cx={-56} cy={-96} r={54 + Math.sin(f / 7) * 3} fill={SGP.lampGold} opacity={0.3} />
            <rect x={-12} y={-56} width={24} height={56} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
            <path d="M 0 -56 L -48 -92" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
            <path d="M -92 -92 Q -56 -124 -20 -92 Z" fill={KRP.green} stroke={C.ink} strokeWidth={6} />
            <circle cx={-56} cy={-88} r={9} fill={SGP.lampGold} stroke={C.ink} strokeWidth={3.5} />
          </g>
        </g>
        {/* 劇場主3人 (青ざめ) */}
        <g transform="translate(680 980)">
          <ellipse cx={0} cy={6} rx={110} ry={20} fill={C.ink} opacity={0.14} />
          <Person x={0} y={0} s={1.32} cloth="#5A4A62" clothDark="#463852"
            face="worried" gaze={[0.5, -0.4]} f={f} phase={0} lean={3} />
          <PaleLines x={0} y={0} s={1.32} />
        </g>
        <g transform="translate(1000 950)">
          <ellipse cx={0} cy={6} rx={100} ry={18} fill={C.ink} opacity={0.14} />
          <Person x={0} y={0} s={1.22} cloth="#4E5E52" clothDark="#3C4A40"
            face="sad" glasses gaze={[0, 0.5]} f={f} phase={3} />
          <PaleLines x={0} y={0} s={1.22} />
        </g>
        <g transform="translate(1310 990)">
          <ellipse cx={0} cy={6} rx={105} ry={19} fill={C.ink} opacity={0.14} />
          <Person x={0} y={0} s={1.3} cloth="#6B5540" clothDark="#55422F"
            face="worried" gaze={[-0.5, -0.3]} f={f} phase={6} lean={-3}
            pose="armsFolded" />
          <PaleLines x={0} y={0} s={1.3} />
        </g>
        {/* 想像の吹き出し: 売上の棒が欠けていく */}
        {bubT > 0 && (
          <g opacity={bubT}>
            <circle cx={760} cy={560} r={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <circle cx={800} cy={500} r={16} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            <g transform={`translate(1010 320) scale(${0.8 + 0.2 * pop(bubT)})`}>
              <ellipse cx={0} cy={0} rx={300} ry={190} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
              {/* 棒グラフ: 右の棒ほど f で欠けて沈む */}
              <line x1={-210} y1={110} x2={210} y2={110} stroke={C.ink} strokeWidth={6} />
              {[0, 1, 2, 3, 4].map((i) => {
                const full = 70 + i * 26;
                const cut = i < 2 ? 0 : seg(f, 14 + i * 6, 26 + i * 6);
                const hh = full * (1 - cut * (0.34 + i * 0.14));
                return (
                  <g key={i}>
                    <rect x={-190 + i * 78} y={110 - full} width={52} height={full}
                      fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="7 6" opacity={0.45} />
                    <rect x={-190 + i * 78} y={110 - hh} width={52} height={hh}
                      fill={i < 2 ? KRP.blue : KRP.red} stroke={C.ink} strokeWidth={4.5}
                      opacity={i < 2 ? 0.95 : 0.9} />
                  </g>
                );
              })}
              <g transform={`translate(150 ${-96 + seg(f, 26, 40) * 46}) rotate(32)`}
                opacity={seg(f, 24, 32)}>
                <polygon points="0,0 -40,-24 -40,-9 -100,-9 -100,9 -40,9 -40,24"
                  fill={KRP.red} stroke={C.ink} strokeWidth={4} />
              </g>
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #162 ところが、ふたを開けてみると。
// 格: 並 / seed 1248
// 絵: 文字どおり、大きな興行の「蓋」がゆっくり持ち上がる。隙間から光。溜め
// どこ: 暗転した舞台の上。緞帳の裾と暗い床板だけが見える
// 演出: 「興行」と書かれた大きな木の櫃。蓋が片側だけ持ち上がり隙間から金の光
// 動き: 蓋の角度が f で開く。光の筋が伸び、光の粒が舞い上がる。溜めの絵
const Sg162: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 8, 42));           // 蓋の持ち上がり 0→1
  const lidDeg = -open * 13;                     // 左縁を軸に右が上がる
  return (
    <Frame f={f} seed={1248} bg={C.night} dark>
      {/* 暗い床板 */}
      <rect x={-20} y={640} width={W + 40} height={H - 620} fill={C.nightFloor} />
      <line x1={-20} y1={640} x2={W + 20} y2={640} stroke={C.ink} strokeWidth={7} />
      {[760, 840, 930, 1030].map((fy, i) => (
        <line key={i} x1={-20} y1={fy} x2={W + 20} y2={fy - 8}
          stroke={C.ink} strokeWidth={3.5} opacity={0.35} />
      ))}
      {/* 左右の緞帳の裾 (暗い臙脂) */}
      <path d="M -20 -20 L 300 -20 Q 330 300 250 760 Q 100 800 -20 760 Z"
        fill={C.velvet} stroke={C.ink} strokeWidth={6} />
      <path d="M 180 0 Q 196 300 168 720 M 80 0 Q 96 320 72 740"
        fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      <path d="M 1940 -20 L 1620 -20 Q 1590 300 1670 760 Q 1820 800 1940 760 Z"
        fill={C.velvet} stroke={C.ink} strokeWidth={6} />
      <path d="M 1740 0 Q 1724 300 1752 720 M 1840 0 Q 1824 320 1848 740"
        fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      {/* 上からの弱いスポット */}
      <polygon points="960,-20 560,860 1360,860" fill={SGP.lampGold} opacity={0.08} />
      <ellipse cx={960} cy={880} rx={520} ry={70} fill={SGP.lampGold} opacity={0.1} />
      {/* 大きな木の櫃 (興行) */}
      <g transform="translate(960 820)">
        <ellipse cx={0} cy={60} rx={470} ry={60} fill={C.ink} opacity={0.28} />
        {/* 胴 */}
        <path d="M -420 -210 L -400 40 Q 0 86 400 40 L 420 -210"
          fill={SGP.wood} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <path d="M -404 -140 Q 0 -108 404 -140 M -396 -40 Q 0 -8 396 -40"
          fill="none" stroke={C.ink} strokeWidth={5} opacity={0.6} />
        <path d="M -340 -186 Q -200 -172 -60 -178 M 120 -96 Q 240 -88 330 -96"
          fill="none" stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.8} />
        {/* 縄の手掛け */}
        <path d="M -300 -64 Q -270 -24 -240 -64" fill="none" stroke={SGP.woodDark} strokeWidth={10} />
        <path d="M 240 -64 Q 270 -24 300 -64" fill="none" stroke={SGP.woodDark} strokeWidth={10} />
        {/* 「興行」の貼り札 */}
        <g transform="translate(0 -60) rotate(-2)">
          <rect x={-104} y={-64} width={208} height={128} rx={6}
            fill={SGP.paper} stroke={C.ink} strokeWidth={6} />
          <path d="M -104 -40 L -80 -64 M 104 40 L 82 64" stroke={C.ink} strokeWidth={3} opacity={0.5} />
          <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={52} fill={C.ink}>興</text>
          <text x={0} y={48} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={52} fill={C.ink}>行</text>
        </g>
        {/* 隙間から漏れる光 (蓋より先に描いて蓋で上端を隠す) */}
        <g opacity={0.25 + open * 0.75}>
          <polygon points={`-380,-228 420,${-228 - open * 96} 470,${-180 - open * 60} -380,-214`}
            fill={C.rayGold} opacity={0.5} />
          <polygon points={`120,${-232 - open * 52} 300,${-700 - open * 150} 520,${-620 - open * 150} 320,${-226 - open * 30}`}
            fill={C.rayGold} opacity={0.22} />
          <polygon points={`-240,-226 -420,${-640 - open * 110} -220,${-690 - open * 110} -80,-228`}
            fill={C.rayGold} opacity={0.16} />
        </g>
        {/* 光の粒が舞い上がる */}
        {Array.from({ length: 9 }, (_, i) => {
          const up = ((f * (1.6 + rnd(21, i) * 2.2) + rnd(22, i) * 160) % 220);
          return (
            <circle key={i} cx={-300 + rnd(23, i) * 620 + Math.sin(f / 9 + i) * 10}
              cy={-240 - up} r={3 + rnd(24, i) * 4}
              fill={C.rayGold} opacity={(0.25 + open * 0.6) * (1 - up / 230)} />
          );
        })}
        {/* 蓋 (左縁 -430,-230 を軸にきしみながら上がる) */}
        <g transform={`rotate(${lidDeg + Math.sin(f / 16) * 0.4} -430 -230)`}>
          <path d="M -430 -230 Q 0 -300 430 -230 L 430 -258 Q 0 -330 -430 -258 Z"
            fill={SGP.woodDark} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          <path d="M -340 -258 Q 0 -312 350 -260" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
          {/* 蓋のつまみ */}
          <rect x={-70} y={-322} width={140} height={34} rx={10}
            fill={SGP.wood} stroke={C.ink} strokeWidth={6.5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #163 「途中から観られない映画」を観ようと、開演前から行列ができました。
// 格: 山 / seed 1249
// 絵: **事件**。街角を曲がって延びる大行列。新聞を読む人、背伸びする子ども。窓から身を乗り出して数える劇場主
// どこ: 1960年アメリカの街角。左に映画館、右奥へ横丁が伸びる
// 演出: 開演前の大行列が歩道を埋め、角を曲がって奥へ消える。窓から身を乗り出して
//       数える劇場主、新聞を読む人、背伸びする子ども
// 動き: カメラが右へゆっくりパン。行列がそわそわ揺れ、雲が流れ、主人の腕が数を指す
const Sg163: React.FC<{ f: number }> = ({ f }) => {
  const pan = -easeOut(clamp01(f / 80)) * 40;
  // 角を曲がって奥へ続く列 (奥ほど小さい)
  const back = Array.from({ length: 8 }, (_, i) => ({
    x: 1500 + i * 52 - i * i * 1.2,
    y: 742 - i * 26,
    s: 0.78 - i * 0.07,
  }));
  const colors = ["#5E7E9C", "#9C6A5E", "#6E8E64", "#8A7AA0", "#A08A5A", "#5E9C94", "#9C5E80"];
  return (
    <Frame f={f} seed={1249}>
      <g transform={`translate(${pan} 0)`}>
        {/* 空と雲と朝の日 */}
        <rect x={-60} y={-20} width={W + 160} height={520} fill={C.daySky} />
        <circle cx={1660} cy={150} r={74} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} opacity={0.9} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${((f * (0.5 + i * 0.25) + i * 640) % 2200) - 140} ${110 + i * 90}) scale(${0.8 - i * 0.14})`} opacity={0.85}>
            <path d="M -120 20 q 10 -42 56 -36 q 14 -40 68 -32 q 36 -24 62 10 q 46 -8 48 30 q 26 6 20 28 l -254 0 z"
              fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 奥の街並み (角の向こう) */}
        {Array.from({ length: 7 }, (_, i) => {
          const bw = 150 + rnd(31, i) * 110;
          const bh = 180 + rnd(32, i) * 190;
          const bx = 1180 + i * 130;
          return (
            <g key={i} opacity={0.88}>
              <rect x={bx} y={500 - bh} width={bw} height={bh}
                fill={i % 2 ? "#C9B8A2" : "#B2A48E"} stroke={C.ink} strokeWidth={5} />
              {Array.from({ length: 6 }, (_, w) => (
                <rect key={w} x={bx + 18 + (w % 2) * 52} y={520 - bh + Math.floor(w / 2) * 62}
                  width={30} height={40} fill={C.daySky} stroke={C.ink} strokeWidth={3} opacity={0.9} />
              ))}
            </g>
          );
        })}
        {/* 右奥へ入る横丁の路面 */}
        <polygon points="1450,760 1990,560 1990,500 1560,500" fill={C.road} opacity={0.6} />
        {/* 車道と歩道 */}
        <rect x={-60} y={500} width={W + 160} height={400} fill={C.road} />
        <rect x={-60} y={840} width={W + 160} height={260} fill={C.sidewalk} />
        <line x1={-60} y1={840} x2={W + 100} y2={840} stroke={C.ink} strokeWidth={7} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-40 + i * 420} y={666} width={160} height={14} rx={7}
            fill={KRP.white} opacity={0.5} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={-40 + i * 210} y1={1100} x2={60 + i * 210} y2={840}
            stroke={C.ink} strokeWidth={3} opacity={0.2} />
        ))}
        {/* ===== 左: 映画館 ===== */}
        <g>
          <rect x={-60} y={120} width={700} height={740} fill={C.brick} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={-40 + (i % 6) * 120 + (Math.floor(i / 6) % 2) * 60} y1={150 + Math.floor(i / 6) * 56}
              x2={20 + (i % 6) * 120 + (Math.floor(i / 6) % 2) * 60} y2={150 + Math.floor(i / 6) * 56}
              stroke={C.brickDark} strokeWidth={4} opacity={0.6} />
          ))}
          {/* 大看板 */}
          <g transform="translate(290 220)">
            <rect x={-310} y={-76} width={620} height={152} rx={10}
              fill={C.marquee} stroke={C.ink} strokeWidth={8} />
            <rect x={-294} y={-60} width={588} height={120} rx={8}
              fill="none" stroke={C.awning} strokeWidth={5} />
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={72} letterSpacing={10} fill={C.ink}>CINEMA</text>
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={i} cx={-280 + i * 51} cy={-62} r={7}
                fill={(f + i * 3) % 24 < 12 ? KRP.yellow : C.marquee}
                stroke={C.ink} strokeWidth={2.5} />
            ))}
          </g>
          {/* 2階の窓 + 身を乗り出す劇場主 */}
          <g transform="translate(470 470)">
            <rect x={-96} y={-110} width={192} height={220} fill={KRP.paperCool} stroke={C.ink} strokeWidth={7} />
            <line x1={-96} y1={0} x2={96} y2={0} stroke={C.ink} strokeWidth={5} />
            {/* 乗り出す上半身 (窓枠より手前) */}
            <g transform={`translate(0 116) rotate(${Math.sin(f / 12) * 2})`}>
              <Person x={0} y={0} s={0.92} cloth="#5A4A62" clothDark="#463852"
                face="surprised" gaze={[0.7, 0.4]} f={f} phase={2}
                pose="point" pointDir={1} still />
            </g>
            <rect x={-108} y={104} width={216} height={22} rx={6}
              fill={C.marquee} stroke={C.ink} strokeWidth={5} />
            {/* 数えている印: 指先から順に飛ぶ小さな印 */}
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={((f * 1.6 + i * 14) % 42) < 21 ? 0.9 : 0}
                transform={`translate(${170 + i * 54} ${-30 - i * 16})`}>
                <line x1={-8} y1={8} x2={8} y2={-8} stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
                <line x1={-2} y1={12} x2={14} y2={-4} stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
              </g>
            ))}
          </g>
          {/* 入口のひさしと切符売場 */}
          <g transform="translate(220 740)">
            <path d="M -240 -120 L 240 -120 L 210 -60 L -210 -60 Z"
              fill={C.awning} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            {[-180, -100, -20, 60, 140].map((ax) => (
              <path key={ax} d={`M ${ax} -60 Q ${ax + 20} -36 ${ax + 40} -60`}
                fill={C.awning} stroke={C.ink} strokeWidth={5} />
            ))}
            <rect x={-150} y={-60} width={130} height={180} fill={C.posterInk} stroke={C.ink} strokeWidth={6} />
            <rect x={20} y={-56} width={150} height={176} rx={8}
              fill={C.marquee} stroke={C.ink} strokeWidth={6} />
            <rect x={44} y={-30} width={102} height={70} fill={KRP.paperCool} stroke={C.ink} strokeWidth={4.5} />
            <path d="M 44 40 L 146 40 M 76 70 L 114 70" stroke={C.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 街灯と消火栓 */}
        <g transform="translate(1065 866)">
          <rect x={-8} y={-420} width={16} height={420} fill={C.ink} opacity={0.85} />
          <path d="M 0 -420 Q 0 -474 56 -470" fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          <circle cx={62} cy={-466} r={20} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} opacity={0.95} />
        </g>
        <g transform="translate(1690 900)">
          <path d="M -26 0 L -26 -54 Q 0 -86 26 -54 L 26 0 Z" fill={KRP.red} stroke={C.ink} strokeWidth={5.5} />
          <circle cx={0} cy={-66} r={10} fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
          <rect x={-36} y={-40} width={72} height={14} rx={7} fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
        </g>
        {/* ===== 行列 (角を曲がって奥へ) ===== */}
        {back.map((p, i) => (
          <PersonMini key={`b${i}`} x={p.x} y={p.y} s={p.s}
            color={colors[(i + 3) % colors.length]} f={f} phase={i + 10}
            face={i < 4 ? "dot" : "none"} />
        ))}
        {/* 手前の列 (右から左へ、入口に向かう) */}
        {Array.from({ length: 9 }, (_, i) => {
          if (i === 3 || i === 6) return null; // 新聞の人と子どもの場所
          const px = 490 + i * 128 + (rnd(41, i) - 0.5) * 26;
          const py = 952 + (rnd(42, i) - 0.5) * 30;
          return (
            <g key={i}>
              <ellipse cx={px} cy={py + 4} rx={56} ry={12} fill={C.ink} opacity={0.12} />
              <PersonMini x={px} y={py} s={1.08 + rnd(43, i) * 0.1}
                color={colors[i % colors.length]} f={f} phase={i}
                face={rnd(44, i) < 0.6 ? "smile" : "dot"} />
            </g>
          );
        })}
        {/* 新聞を読んで待つ人 */}
        <g transform="translate(880 958)">
          <ellipse cx={0} cy={6} rx={78} ry={14} fill={C.ink} opacity={0.14} />
          <Person x={0} y={0} s={1.06} cloth="#7A6A4E" clothDark="#60523A"
            face="normal" gaze={[0, 0.6]} f={f} phase={8} pose="hold" />
          <g transform={`translate(0 -128) rotate(${Math.sin(f / 11) * 2})`}>
            <path d="M -74 -52 L 0 -64 L 74 -52 L 74 30 L 0 44 L -74 30 Z"
              fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <line x1={0} y1={-64} x2={0} y2={44} stroke={C.ink} strokeWidth={3.5} />
            <g stroke={C.ink} strokeWidth={2.6} opacity={0.6}>
              <line x1={-60} y1={-36} x2={-14} y2={-42} />
              <line x1={-60} y1={-22} x2={-14} y2={-28} />
              <line x1={-60} y1={-8} x2={-14} y2={-14} />
              <line x1={14} y1={-42} x2={60} y2={-36} />
              <line x1={14} y1={-28} x2={60} y2={-22} />
            </g>
          </g>
        </g>
        {/* 背伸びしてぴょんぴょんする子ども */}
        <g transform={`translate(1265 ${950 - Math.abs(Math.sin(f / 7)) * 26})`}>
          <ellipse cx={0} cy={8} rx={44} ry={10} fill={C.ink} opacity={0.12} />
          <PersonMini x={0} y={0} s={0.72} color={KRP.orange} f={f} phase={5}
            face="smile" arms="up" />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #164 なぜヒッチコックは、そこまでしたのでしょうか。
// 格: 並 / seed 1250
// 絵: 監督の名物の横顔の線画。隣に「なぜ?」の札。葉巻の煙がクエスチョンマークの形
// どこ: 夜の試写室。青灰の壁・暗い床・フィルムリールの棚が奥に
// 演出: イーゼルの大きな紙に名物の横顔の線画 (敬意をもって上品に)。「なぜ?」の札。
//       脇の小机の葉巻から立つ煙がクエスチョンマークの形に曲がる
// 動き: 煙が f で育って?になる。スポットの明滅。札がぽんと出る。紙がかすかに揺れる
const Sg164: React.FC<{ f: number }> = ({ f }) => {
  const smokeT = easeOut(seg(f, 6, 34));
  const wob = Math.sin(f / 8) * 6;
  return (
    <Frame f={f} seed={1250} bg={C.studioWall} dark>
      {/* 床 */}
      <rect x={-20} y={760} width={W + 40} height={H - 740} fill={C.studioFloor} />
      <line x1={-20} y1={760} x2={W + 20} y2={760} stroke={C.ink} strokeWidth={7} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={lerp(300, -400, i / 4)} y1={H + 20}
          x2={lerp(840, 1120, i / 4)} y2={760} stroke={C.ink} strokeWidth={3} opacity={0.25} />
      ))}
      {/* 奥の棚: フィルム缶が並ぶ (暗い) */}
      <g opacity={0.8}>
        <rect x={1380} y={240} width={460} height={520} fill={C.studioFloor} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <line x1={1392} y1={400 + r * 160} x2={1828} y2={400 + r * 160} stroke={C.ink} strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={1446 + k * 108} cy={352 + r * 160} r={44}
                fill={C.canDark} stroke={C.ink} strokeWidth={4.5} />
            ))}
          </g>
        ))}
      </g>
      {/* スポットライト (ゆっくり脈打つ) */}
      <polygon points="620,-20 160,900 1200,900" fill={SGP.lampGold}
        opacity={0.1 + Math.sin(f / 14) * 0.03} />
      <ellipse cx={660} cy={920} rx={520} ry={66} fill={SGP.lampGold} opacity={0.12} />
      {/* イーゼルと大きな紙の横顔 */}
      <g transform={`translate(640 0) rotate(${Math.sin(f / 18) * 0.5} 0 900)`}>
        {/* イーゼルの脚 */}
        <path d="M -250 960 L -40 180 M 250 960 L 40 180 M 0 940 L 0 300"
          fill="none" stroke={SGP.woodDark} strokeWidth={14} strokeLinecap="round" />
        <line x1={-210} y1={820} x2={210} y2={820} stroke={SGP.woodDark} strokeWidth={12} />
        {/* 紙 */}
        <g transform="translate(0 500)">
          <rect x={-290} y={-330} width={580} height={660} rx={6}
            fill={KRP.white} stroke={C.ink} strokeWidth={7} />
          <path d="M -290 -306 L -266 -330 M 290 306 L 266 330" stroke={C.ink} strokeWidth={3.5} opacity={0.4} />
          {/* 横顔の一筆書き (SaigoParts の手配書と同じ様式を大きく) */}
          <g transform="translate(-20 -30) scale(2.6)" fill="none" stroke={C.ink}
            strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
            <path d="M -18 -88 Q 20 -96 30 -62 Q 34 -48 24 -34 Q 18 -26 26 -18 Q 36 -8 24 -2 Q 16 2 22 10 Q 30 22 14 28 Q 2 32 6 44 Q 10 58 -10 62 L -34 64" />
            <path d="M -18 -88 Q -44 -78 -40 -48" strokeWidth={5} />
            <circle cx={2} cy={-52} r={2.8} fill={C.ink} stroke="none" />
            <path d="M -40 10 Q -34 2 -24 6" strokeWidth={4.5} />
          </g>
          {/* 画鋲 */}
          <circle cx={-262} cy={-302} r={7} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={262} cy={-302} r={7} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
        </g>
      </g>
      {/* 「なぜ?」の札 */}
      <TagPlate x={1130} y={280} text="なぜ?" size={52} rot={-5} t={seg(f, 10, 20)} />
      {/* 小机 + 灰皿 + 葉巻 + ?の形の煙 */}
      <g transform="translate(1310 960)">
        <ellipse cx={0} cy={6} rx={170} ry={26} fill={C.ink} opacity={0.22} />
        <rect x={-130} y={-180} width={260} height={24} rx={8}
          fill={SGP.wood} stroke={C.ink} strokeWidth={6.5} />
        <path d="M -96 -156 L -116 0 M 96 -156 L 116 0 M 0 -156 L 0 -8"
          fill="none" stroke={SGP.woodDark} strokeWidth={10} strokeLinecap="round" />
        {/* 灰皿と葉巻 */}
        <ellipse cx={0} cy={-186} rx={78} ry={18} fill={C.canMetal} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-190} rx={58} ry={11} fill={C.canDark} stroke={C.ink} strokeWidth={3.5} />
        <g transform="translate(26 -200) rotate(-18)">
          <rect x={-56} y={-9} width={112} height={18} rx={9}
            fill="#7A4A30" stroke={C.ink} strokeWidth={4.5} />
          <circle cx={56} cy={0} r={8} fill={KRP.orange}
            opacity={0.6 + Math.sin(f / 4) * 0.35} />
        </g>
        {/* 煙が?の形へ (f で育つ) */}
        <g opacity={0.3 + smokeT * 0.65}>
          <path d={`M 76 -214
                    C ${86 + wob} -300 ${30 - wob} -340 ${10 + wob * 0.5} -420
                    C ${-6 - wob} -492 ${44 + wob} -540 ${104} -530
                    C ${170 + wob} -520 ${186} -458 ${140 - wob} -424
                    C ${112} -404 ${96} -382 ${100 + wob * 0.4} -352`}
            fill="none" stroke={C.smoke} strokeWidth={16} strokeLinecap="round"
            strokeDasharray={900} strokeDashoffset={900 * (1 - smokeT)} opacity={0.85} />
          {/* ?の点 (煙のかたまり) */}
          <circle cx={102 + Math.sin(f / 7) * 3} cy={-300} r={13}
            fill={C.smoke} opacity={smokeT > 0.96 ? 0.85 : 0} />
          {/* ちぎれて消える煙 */}
          {[0, 1, 2].map((i) => {
            const up = (f * 2 + i * 40) % 130;
            return <circle key={i} cx={120 + Math.sin(f / 6 + i * 2) * 14} cy={-540 - up}
              r={8 + i * 3} fill={C.smoke} opacity={smokeT * 0.5 * (1 - up / 140)} />;
          })}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #165 「サイコ」は、結末を知っていると台無しになる映画だったからです。
// 格: 並 / seed 1251
// 絵: フィルム缶に鎖と南京錠。「結末在中・取扱注意」の荷札
// どこ: 配給倉庫の作業台。板壁・リール棚・小窓から朝の光
// 演出: 立てた大きなフィルム缶に鎖が二重に巻かれ南京錠。荷札「結末在中 取扱注意」
// 動き: 南京錠が振り子に揺れ、荷札が風でそよぐ。窓の光の帯にホコリが流れる
const Sg165: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 9) * 4;
  const lockSw = Math.sin(f / 7) * 5;
  return (
    <Frame f={f} seed={1251}>
      {/* 板壁 */}
      <rect x={-20} y={-20} width={W + 40} height={780} fill={SGP.wood} />
      {[120, 270, 420, 570, 720].map((wy) => (
        <line key={wy} x1={-20} y1={wy} x2={W + 20} y2={wy} stroke={SGP.woodDark} strokeWidth={4} opacity={0.7} />
      ))}
      <path d="M 300 160 Q 318 190 300 220 M 1500 460 Q 1518 490 1500 520"
        fill="none" stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.7} />
      {/* 小窓と光の帯 */}
      <g transform="translate(1560 240)">
        <rect x={-130} y={-110} width={260} height={220} fill={C.daySky} stroke={C.ink} strokeWidth={8} />
        <line x1={0} y1={-110} x2={0} y2={110} stroke={C.ink} strokeWidth={6} />
        <line x1={-130} y1={0} x2={130} y2={0} stroke={C.ink} strokeWidth={6} />
      </g>
      <polygon points="1430,160 1690,340 1130,900 850,900" fill={C.rayGold} opacity={0.16} />
      {Array.from({ length: 7 }, (_, i) => {
        const tt = (f * 1.4 + i * 60) % 420;
        return <circle key={i} cx={1480 - tt * 0.9 + Math.sin(f / 8 + i) * 8} cy={250 + tt}
          r={2.5 + rnd(51, i) * 3} fill={KRP.white} opacity={0.5 * (1 - tt / 430)} />;
      })}
      {/* 奥のリール棚 (左) */}
      <g opacity={0.92}>
        <rect x={60} y={150} width={520} height={470} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
        {[0, 1].map((r) => (
          <g key={r}>
            <line x1={72} y1={370 + r * 230} x2={568} y2={370 + r * 230} stroke={C.ink} strokeWidth={5} />
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${150 + k * 160} ${320 + r * 230})`}>
                <circle r={56} fill={C.canMetal} stroke={C.ink} strokeWidth={5} />
                <circle r={18} fill={C.canDark} stroke={C.ink} strokeWidth={4} />
                <path d="M -40 -40 A 56 56 0 0 1 -56 0" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5} />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* 作業台 */}
      <rect x={-20} y={760} width={W + 40} height={60} fill={C.deskTop} stroke={C.ink} strokeWidth={8} />
      <rect x={-20} y={820} width={W + 40} height={280} fill={SGP.woodDark} />
      <path d="M 200 786 Q 500 778 800 786 M 1100 792 Q 1400 784 1700 792"
        fill="none" stroke={C.ink} strokeWidth={3} opacity={0.3} />
      {/* 台の上の小物: 空き缶の山・鍵束 */}
      <g transform="translate(300 760)">
        <ellipse cx={0} cy={-14} rx={120} ry={22} fill={C.canMetal} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-34} rx={120} ry={22} fill={C.canDark} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-54} rx={120} ry={22} fill={C.canMetal} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-60} rx={92} ry={14} fill={C.canDark} opacity={0.5} />
      </g>
      <g transform={`translate(1620 700) rotate(${Math.sin(f / 11) * 5} 0 -40)`}>
        <circle cx={0} cy={-40} r={9} fill="none" stroke={C.ink} strokeWidth={5} />
        <path d="M 0 -31 L 0 26 M 0 14 L 13 14 M 0 26 L 10 26 M -3 2 L -14 2"
          fill="none" stroke={C.ink} strokeWidth={5.5} strokeLinecap="round" />
      </g>
      {/* ===== 主役: 鎖と南京錠のフィルム缶 ===== */}
      <g transform="translate(960 762)">
        <ellipse cx={0} cy={6} rx={330} ry={34} fill={C.ink} opacity={0.2} />
        {/* 缶 (立てて正面) */}
        <circle cx={0} cy={-300} r={300} fill={C.canMetal} stroke={C.ink} strokeWidth={9} />
        <circle cx={0} cy={-300} r={248} fill="none" stroke={C.ink} strokeWidth={5} opacity={0.6} />
        <circle cx={0} cy={-300} r={190} fill="none" stroke={C.canDark} strokeWidth={14} opacity={0.6} />
        <circle cx={0} cy={-300} r={74} fill={C.canDark} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={-300} r={26} fill={C.studioFloor} stroke={C.ink} strokeWidth={5} />
        <path d="M -210 -510 A 300 300 0 0 1 -294 -360" fill="none"
          stroke={KRP.white} strokeWidth={9} opacity={0.55} />
        {/* 留め金具4つ */}
        {[45, 135, 225, 315].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 0 -300)`}>
            <rect x={-16} y={-610} width={32} height={26} rx={5}
              fill={C.canDark} stroke={C.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* 鎖 (二重巻き)。輪を並べて描く */}
        {[{ y0: -382, dy: -0.22 }, { y0: -230, dy: 0.18 }].map((row, r) => (
          <g key={r}>
            {Array.from({ length: 13 }, (_, i) => {
              const cx = -288 + i * 48;
              const cy = row.y0 + Math.abs(cx) * row.dy * 0.4 + Math.sin(i * 1.1) * 4;
              return (
                <ellipse key={i} cx={cx} cy={cy} rx={26} ry={17}
                  transform={`rotate(${i % 2 ? 58 : -12} ${cx} ${cy})`}
                  fill="none" stroke={C.chain} strokeWidth={11} />
              );
            })}
          </g>
        ))}
        {/* 鎖の交点の板金具 + 南京錠 (振り子) */}
        <rect x={-54} y={-330} width={108} height={64} rx={10}
          fill={C.canDark} stroke={C.ink} strokeWidth={6} />
        <g transform={`rotate(${lockSw} 0 -272)`}>
          <path d="M -34 -272 L -34 -300 A 34 34 0 0 1 34 -300 L 34 -272"
            fill="none" stroke={C.chain} strokeWidth={13} />
          <rect x={-52} y={-272} width={104} height={96} rx={14}
            fill={KRP.brass} stroke={C.ink} strokeWidth={7} />
          <circle cx={0} cy={-230} r={11} fill={C.ink} />
          <rect x={-5} y={-230} width={10} height={30} fill={C.ink} />
        </g>
        {/* 荷札 (麻ひもで鎖に結ぶ。風でそよぐ) */}
        <g transform={`rotate(${8 + sway} -210 -404)`}>
          <path d="M -210 -404 Q -248 -380 -268 -330" fill="none"
            stroke={SGP.woodDark} strokeWidth={5} />
          <g transform="translate(-350 -240) rotate(-14)">
            <path d="M -118 -70 L 92 -70 L 130 0 L 92 70 L -118 70 Z"
              fill={SGP.paper} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={96} cy={0} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
            <text x={-16} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={42} fill={C.ink}>結末在中</text>
            <text x={-16} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={30} fill={KRP.red}>取扱注意</text>
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #166 物語を守るために、お客の自由を断つ。
// 格: 図 / seed 1252
// 絵: 天秤。「物語」の分銅がずしりと下がり、「お客の自由」が浮き上がる。苦い均衡
// どこ: 夕暮れの監督室。窓の外が橙に染まる机の上
// 演出: 真鍮の天秤。「物語」の鉄の分銅がずしりと沈み、「お客の自由」の切符の皿が浮く
// 動き: f で梁が傾き切り、そのあと皿が小さく震える (苦い均衡)。窓の夕光が脈打つ
const Sg166: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeOut(seg(f, 8, 34));
  const deg = -(tilt * 11) + Math.sin(f / 5) * tilt * 0.8; // 負=左が沈む
  const th = (deg * Math.PI) / 180;
  const L = 430;
  const pivot = { x: 960, y: 430 };
  const lx = pivot.x - L * Math.cos(th), ly = pivot.y - L * Math.sin(th);
  const rx = pivot.x + L * Math.cos(th), ry = pivot.y + L * Math.sin(th);
  const panDrop = 170;
  return (
    <Frame f={f} seed={1252}>
      {/* 壁と夕暮れの窓 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill={C.officeWall} />
      <g transform="translate(330 300)">
        <rect x={-190} y={-200} width={380} height={400} fill={KRP.orange} stroke={C.ink} strokeWidth={9}
          opacity={0.9} />
        <rect x={-190} y={-200} width={380} height={400} fill={KRP.yellow}
          opacity={0.25 + Math.sin(f / 12) * 0.08} />
        <circle cx={60} cy={60} r={62} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} opacity={0.95} />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-180 + rnd(61, i) * 280} y={110 - rnd(62, i) * 60}
            width={30 + rnd(63, i) * 50} height={90} fill={C.ink} opacity={0.5} />
        ))}
        <line x1={0} y1={-200} x2={0} y2={200} stroke={C.ink} strokeWidth={7} />
        <line x1={-190} y1={0} x2={190} y2={0} stroke={C.ink} strokeWidth={7} />
        {/* カーテン */}
        <path d="M 210 -220 Q 240 0 216 230 L 290 230 Q 270 0 286 -220 Z"
          fill={C.velvet} stroke={C.ink} strokeWidth={5.5} />
      </g>
      {/* 奥の本棚 (右) */}
      <g opacity={0.9}>
        <rect x={1530} y={120} width={330} height={620} fill={C.officePanel} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <line x1={1542} y1={270 + r * 150} x2={1848} y2={270 + r * 150} stroke={C.ink} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((k) => (
              <rect key={k} x={1556 + k * 58 + rnd(64, r * 5 + k) * 10} y={166 + r * 150 + rnd(65, k) * 14}
                width={34} height={[90, 86, 94, 82, 88][k]}
                fill={["#8A5A48", "#5A7A6A", "#6A5A8A", "#9A8A4A", "#7A6A5A"][k]}
                stroke={C.ink} strokeWidth={3.5} />
            ))}
          </g>
        ))}
      </g>
      {/* 机 */}
      <rect x={-20} y={740} width={W + 40} height={70} fill={C.deskTop} stroke={C.ink} strokeWidth={8} />
      <rect x={-20} y={810} width={W + 40} height={290} fill={SGP.woodDark} />
      <path d="M 160 772 Q 460 764 760 772 M 1160 778 Q 1460 770 1760 778"
        fill="none" stroke={C.ink} strokeWidth={3} opacity={0.3} />
      {/* 机の小物: 書類とペン */}
      <g transform="translate(260 738) rotate(-3)">
        <rect x={-110} y={-16} width={220} height={16} fill={C.ledger} stroke={C.ink} strokeWidth={4.5} />
        <rect x={-96} y={-30} width={220} height={16} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <line x1={-70} y1={-22} x2={80} y2={-22} stroke={C.ink} strokeWidth={2.5} opacity={0.5} />
      </g>
      <g transform="translate(1680 730) rotate(14)">
        <rect x={-70} y={-5} width={140} height={10} rx={5} fill={C.ink} />
        <polygon points="70,-5 96,0 70,5" fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
      </g>
      {/* ===== 天秤 ===== */}
      {/* 台座と支柱 */}
      <g>
        <ellipse cx={pivot.x} cy={746} rx={210} ry={24} fill={C.ink} opacity={0.18} />
        <rect x={pivot.x - 150} y={706} width={300} height={34} rx={8}
          fill={C.brassY} stroke={C.ink} strokeWidth={7} />
        <path d={`M ${pivot.x - 30} 706 L ${pivot.x - 20} ${pivot.y + 16} L ${pivot.x + 20} ${pivot.y + 16} L ${pivot.x + 30} 706 Z`}
          fill={C.brassY} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M ${pivot.x - 13} 680 L ${pivot.x + 13} 680 M ${pivot.x - 16} 560 L ${pivot.x + 16} 560`}
          stroke={C.ink} strokeWidth={4} opacity={0.5} />
      </g>
      {/* 梁 */}
      <g transform={`rotate(${deg} ${pivot.x} ${pivot.y})`}>
        <rect x={pivot.x - L} y={pivot.y - 13} width={L * 2} height={26} rx={13}
          fill={C.brassY} stroke={C.ink} strokeWidth={7} />
        <circle cx={pivot.x} cy={pivot.y} r={26} fill={C.brassY} stroke={C.ink} strokeWidth={7} />
        <circle cx={pivot.x} cy={pivot.y} r={8} fill={C.ink} />
        {/* 針 (傾きが分かる) */}
        <path d={`M ${pivot.x - 8} ${pivot.y - 26} L ${pivot.x} ${pivot.y - 70} L ${pivot.x + 8} ${pivot.y - 26} Z`}
          fill={KRP.red} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 左皿: 物語の分銅 (沈む) */}
      <g>
        <path d={`M ${lx} ${ly} L ${lx - 120} ${ly + panDrop} M ${lx} ${ly} L ${lx + 120} ${ly + panDrop}`}
          stroke={C.ink} strokeWidth={5} fill="none" />
        <path d={`M ${lx - 150} ${ly + panDrop} Q ${lx} ${ly + panDrop + 56} ${lx + 150} ${ly + panDrop} Z`}
          fill={C.brassY} stroke={C.ink} strokeWidth={7} />
        {/* 鉄の分銅 */}
        <g transform={`translate(${lx} ${ly + panDrop + 10})`}>
          <path d="M -96 0 L -64 -150 L 64 -150 L 96 0 Z"
            fill={C.chain} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -34 -150 Q 0 -196 34 -150" fill="none" stroke={C.ink} strokeWidth={10} />
          <text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={52} fill={KRP.white} stroke={C.ink} strokeWidth={2}
            paintOrder="stroke">物語</text>
        </g>
        {/* ずしりの衝撃線 */}
        {tilt > 0.9 && (
          <g stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
            <line x1={lx - 170} y1={ly + panDrop + 30} x2={lx - 196} y2={ly + panDrop + 48} />
            <line x1={lx + 170} y1={ly + panDrop + 30} x2={lx + 196} y2={ly + panDrop + 48} />
          </g>
        )}
      </g>
      {/* 右皿: お客の自由 (浮く) */}
      <g>
        <path d={`M ${rx} ${ry} L ${rx - 120} ${ry + panDrop} M ${rx} ${ry} L ${rx + 120} ${ry + panDrop}`}
          stroke={C.ink} strokeWidth={5} fill="none" />
        <path d={`M ${rx - 150} ${ry + panDrop} Q ${rx} ${ry + panDrop + 56} ${rx + 150} ${ry + panDrop} Z`}
          fill={C.brassY} stroke={C.ink} strokeWidth={7} />
        {/* 切符の束 (ひらりと浮く) */}
        <g transform={`translate(${rx} ${ry + panDrop - 6})`}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${-44 + i * 42} ${-16 - i * 20 - Math.sin(f / 7 + i) * 3}) rotate(${-10 + i * 12})`}>
              <rect x={-54} y={-26} width={108} height={52} rx={6}
                fill={i === 1 ? KRP.yellow : SGP.paper} stroke={C.ink} strokeWidth={4.5} />
              <line x1={-30} y1={-26} x2={-30} y2={26} stroke={C.ink} strokeWidth={3} strokeDasharray="6 5" />
              <circle cx={16} cy={0} r={11} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.6} />
            </g>
          ))}
          {/* ふわりの線 */}
          <path d={`M -80 -90 Q -70 -108 -52 -112 M 86 -76 Q 96 -94 114 -98`}
            fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.55} strokeLinecap="round" />
        </g>
      </g>
      {/* 札 */}
      <TagPlate x={280} y={600} text="物語" size={46} t={seg(f, 20, 28)} />
      <TagPlate x={1360} y={170} text="お客の自由" size={46} t={seg(f, 26, 34)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #167 「最初から観ろ」と言い出したのは、劇場ではなく、作り手でした。
// 格: 図 / seed 1253
// 絵: 出どころの矢印図。「劇場」からの矢印に×、「監督の椅子」からの矢印に○。札「言い出しっぺ」
// どこ: 昼の稽古場の板の間。奥に素の壁とゴーストライト (裸電球のスタンド)
// 演出: 出どころ調べの展示。左の台に劇場の模型、右の台に監督の椅子とメガホン。
//       吊るした無地の掟の巻紙へ、左からの矢印に×・右からの矢印に○。札「言い出しっぺ」
// 動き: 矢印が f で伸び、×と○が順に押され、札がぽん。電球が明滅、巻紙が揺れる
const Sg167: React.FC<{ f: number }> = ({ f }) => {
  const a1 = easeOut(seg(f, 6, 18));   // 左矢印
  const a2 = easeOut(seg(f, 14, 26));  // 右矢印
  return (
    <Frame f={f} seed={1253} bg={KRP.paperCool}>
      {/* 稽古場の壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill={KRP.paperCool} />
      <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={C.ink} strokeWidth={4} opacity={0.3} />
      <rect x={-20} y={740} width={W + 40} height={H - 720} fill={KRP.floor} />
      <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={lerp(260, -480, i / 9)} y1={H + 20}
          x2={lerp(820, 1120, i / 9)} y2={740} stroke={C.ink} strokeWidth={3} opacity={0.22} />
      ))}
      {/* 壁の貼り紙 (無地のメモ2枚) と時計 */}
      <g transform="translate(180 260) rotate(-3)">
        <rect x={-70} y={-90} width={140} height={180} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        {[-56, -28, 0, 28].map((ly, i) => (
          <line key={i} x1={-48} y1={ly} x2={30 + rnd(71, i) * 18} y2={ly}
            stroke={C.ink} strokeWidth={3} opacity={0.4} />
        ))}
        <circle cx={0} cy={-80} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
      </g>
      <g transform="translate(1760 220)">
        <circle r={64} fill={KRP.white} stroke={C.ink} strokeWidth={6.5} />
        <line x1={0} y1={0} x2={0} y2={-40} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={0} x2={28} y2={14} stroke={C.ink} strokeWidth={4} strokeLinecap="round"
          transform={`rotate(${(f / 2) % 360})`} />
        <circle r={5} fill={C.ink} />
      </g>
      {/* ゴーストライト (明滅する裸電球のスタンド) */}
      <g transform="translate(90 860)">
        <rect x={-10} y={-360} width={20} height={360} fill={C.ink} opacity={0.85} />
        <path d="M -70 0 L 70 0 M -50 0 L 0 -60 M 50 0 L 0 -60" stroke={C.ink} strokeWidth={9}
          strokeLinecap="round" fill="none" />
        <circle cx={0} cy={-392} r={30} fill={KRP.yellow} stroke={C.ink} strokeWidth={5.5} />
        <circle cx={0} cy={-392} r={52 + Math.sin(f / 6) * 5} fill={KRP.yellow} opacity={0.22} />
      </g>
      {/* 中央上: 吊るした掟の巻紙 (無地に線だけ。文は書かない) */}
      <g transform={`translate(960 70) rotate(${Math.sin(f / 13) * 1.2})`}>
        <line x1={-110} y1={-70} x2={-70} y2={40} stroke={SGP.woodDark} strokeWidth={6} />
        <line x1={110} y1={-70} x2={70} y2={40} stroke={SGP.woodDark} strokeWidth={6} />
        <rect x={-150} y={40} width={300} height={28} rx={14} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
        <rect x={-126} y={60} width={252} height={290} fill={SGP.paper} stroke={C.ink} strokeWidth={6.5} />
        <path d="M -126 94 L -102 60 M 126 316 L 104 350" stroke={C.ink} strokeWidth={3} opacity={0.4} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={66 - i * 48} y1={96} x2={66 - i * 48} y2={236 + rnd(72, i) * 70}
            stroke={C.ink} strokeWidth={4.5} opacity={0.45} />
        ))}
        <rect x={-150} y={348} width={300} height={28} rx={14} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
      </g>
      {/* 左の台: 劇場の模型 */}
      <g transform="translate(420 890)">
        <ellipse cx={0} cy={10} rx={250} ry={28} fill={C.ink} opacity={0.15} />
        <rect x={-230} y={-60} width={460} height={60} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <path d="M -190 -34 Q -60 -42 60 -34 M 90 -18 Q 160 -24 206 -18"
          fill="none" stroke={SGP.woodDark} strokeWidth={3} />
        {/* 模型: 正面玄関と三角屋根の劇場 */}
        <g transform="translate(0 -60)">
          <rect x={-170} y={-230} width={340} height={230} fill={C.marquee} stroke={C.ink} strokeWidth={7} />
          <polygon points="-190,-230 0,-320 190,-230" fill={C.awning} stroke={C.ink} strokeWidth={7} />
          <rect x={-120} y={-205} width={240} height={52} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {[-60, 0, 60].map((dx) => (
            <rect key={dx} x={dx - 26} y={-110} width={52} height={110}
              fill={C.velvet} stroke={C.ink} strokeWidth={5} />
          ))}
          <path d="M -34 -110 Q 0 -140 34 -110" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
          {[-120, 120].map((dx) => (
            <circle key={dx} cx={dx} cy={-160} r={16} fill={KRP.yellow} stroke={C.ink} strokeWidth={4.5} />
          ))}
        </g>
      </g>
      {/* 右の台: 監督の椅子とメガホン */}
      <g transform="translate(1500 890)">
        <ellipse cx={0} cy={10} rx={250} ry={28} fill={C.ink} opacity={0.15} />
        <rect x={-230} y={-60} width={460} height={60} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <path d="M -190 -34 Q -40 -42 80 -34" fill="none" stroke={SGP.woodDark} strokeWidth={3} />
        {/* X脚の布張りの椅子 */}
        <g transform="translate(-40 -60)">
          <path d="M -110 0 L 90 -150 M 90 0 L -110 -150" stroke={SGP.woodDark} strokeWidth={13}
            strokeLinecap="round" fill="none" />
          <rect x={-120} y={-170} width={220} height={34} rx={8} fill={C.awning} stroke={C.ink} strokeWidth={6} />
          <path d="M -120 -290 L -104 -170 M 100 -290 L 84 -170" stroke={SGP.woodDark} strokeWidth={12}
            strokeLinecap="round" />
          <rect x={-130} y={-312} width={250} height={60} rx={10} fill={C.awning} stroke={C.ink} strokeWidth={6.5} />
          <path d="M -96 -282 Q -10 -290 86 -282" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
        </g>
        {/* メガホン (台に置く) */}
        <g transform="translate(160 -78) rotate(-24)">
          <path d="M -70 -20 L 60 -58 L 60 58 L -70 20 Z" fill={KRP.orange} stroke={C.ink}
            strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={60} cy={0} rx={16} ry={58} fill={C.marquee} stroke={C.ink} strokeWidth={5} />
          <circle cx={-78} cy={0} r={16} fill={KRP.orange} stroke={C.ink} strokeWidth={5} />
          <path d="M -40 34 Q -20 56 10 54" fill="none" stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 左からの矢印 (×) — 劇場説は違う */}
      <g>
        <path d="M 480 580 Q 600 320 820 210" fill="none" stroke={KRP.grayDark} strokeWidth={13}
          strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - a1)} />
        {a1 >= 1 && (
          <polygon points="836,202 788,214 806,242" fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        )}
        <XMark x={610} y={360} s={1.1} t={seg(f, 20, 26)} />
      </g>
      {/* 右からの矢印 (○) — 言い出しっぺは作り手 */}
      <g>
        <path d="M 1450 560 Q 1330 300 1110 210" fill="none" stroke={KRP.blueDeep} strokeWidth={13}
          strokeLinecap="round" strokeDasharray={620} strokeDashoffset={620 * (1 - a2)} />
        {a2 >= 1 && (
          <polygon points="1094,202 1142,214 1124,242" fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4} />
        )}
        {/* ○ (朱の二重丸) */}
        <g transform={`translate(1330 352) scale(${pop(seg(f, 28, 36))}`.concat(")")}>
          <circle r={62} fill="none" stroke={KRP.red} strokeWidth={11} opacity={0.95} />
          <circle r={40} fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.95} />
        </g>
      </g>
      {/* 札 */}
      <TagPlate x={420} y={580} text="劇場" size={44} t={seg(f, 8, 16)} />
      <TagPlate x={1720} y={548} text="監督の椅子" size={44} t={seg(f, 16, 24)} />
      <TagPlate x={1600} y={330} text="言い出しっぺ" size={48} rot={-6} t={seg(f, 36, 42)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #168 ちなみに、この手を最初に使ったのは、ヒッチコックではありません。
// 格: 図 / seed 1254
// 絵: 余談札「ちなみに」+「世界初ではありません」の注意書き。「初」のトロフィーがすっと脇へどけられる
// どこ: 撮影所の廊下の掲示板。小道具棚とロープが周りにある裏方の壁
// 演出: 掲示板の大きな注意書き「世界初ではありません」が主役。横で「初」の木札が
//       手でするりと脇へどけられる (トロフィーは描かない)。余談札「ちなみに」
// 動き: 紙がポンと貼られ赤線が引かれる。木札が f で右へ滑って傾く。カメラ微ズーム
const Sg168: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.04;
  const paperT = pop(seg(f, 2, 10));
  const lineT = easeOut(seg(f, 12, 24));      // 赤アンダーライン
  const slide = easeOut(seg(f, 16, 36));      // 「初」札がどけられる
  const handT = easeOut(seg(f, 10, 20));      // 手が入ってくる
  return (
    <Frame f={f} seed={1254}>
      <g transform={zoomAt(z, 960, 480)}>
        {/* 裏方の壁 (縦板) と床 */}
        <rect x={-20} y={-20} width={W + 40} height={H} fill={C.doorWood} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={20 + i * 156} y1={-20} x2={20 + i * 156} y2={880}
            stroke={C.doorWoodD} strokeWidth={4} opacity={0.5} />
        ))}
        <rect x={-20} y={880} width={W + 40} height={220} fill={C.nightFloor} />
        <line x1={-20} y1={880} x2={W + 20} y2={880} stroke={C.ink} strokeWidth={7} />
        {/* 裏方の小物: 左に小道具棚、右にロープと砂袋 */}
        <g stroke={C.ink} strokeWidth={5} fill={C.deskTop}>
          <rect x={40} y={560} width={210} height={300} />
          <line x1={40} y1={660} x2={250} y2={660} />
          <line x1={40} y1={760} x2={250} y2={760} />
        </g>
        <g stroke={C.ink} strokeWidth={4}>
          <rect x={64} y={596} width={52} height={60} fill={C.canMetal} />
          <rect x={132} y={606} width={44} height={50} fill={C.ledger} />
          <circle cx={210} cy={626} r={26} fill={C.brassY} />
          <rect x={70} y={700} width={110} height={56} rx={8} fill={C.marquee} />
          <circle cx={214} cy={728} r={24} fill={C.canDark} />
        </g>
        {/* 右のロープ+砂袋 (f で微揺れ) */}
        <g transform={`translate(1790 0) rotate(${Math.sin(f / 11) * 1.6} 0 40)`}>
          <line x1={0} y1={40} x2={0} y2={620} stroke={C.chain} strokeWidth={7} />
          <path d="M -36 620 Q -42 730 0 740 Q 42 730 36 620 Z"
            fill={C.sidewalk} stroke={C.ink} strokeWidth={6} />
          <path d="M -30 660 Q 0 672 30 660" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
        <WallLamp x={360} y={200} f={f} s={0.9} />
        {/* 掲示板 (コルク地+木枠) */}
        <rect x={460} y={190} width={1180} height={560} rx={10}
          fill={C.deskTop} stroke={C.ink} strokeWidth={8} />
        <rect x={492} y={222} width={1116} height={496} rx={6}
          fill={C.mapLand} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={510 + rnd(7, i) * 1080} cy={240 + rnd(8, i) * 460}
            r={2.2} fill={C.doorWoodD} opacity={0.35} />
        ))}
        {/* 古い貼り紙 (背景の層) */}
        <g transform="rotate(3 640 330)">
          <rect x={540} y={260} width={200} height={150} fill={C.ledger}
            stroke={C.ink} strokeWidth={4} opacity={0.75} />
          <line x1={560} y1={300} x2={720} y2={300} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          <line x1={560} y1={330} x2={700} y2={330} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          <line x1={560} y1={360} x2={714} y2={360} stroke={C.ink} strokeWidth={3} opacity={0.4} />
          <circle cx={640} cy={272} r={8} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 主役の注意書き (ポンと貼られる) */}
        <g transform={`translate(1060 470) rotate(-1.5) scale(${paperT})`}>
          <rect x={-290} y={-170} width={580} height={340} fill={C.ledger}
            stroke={C.ink} strokeWidth={7} />
          <path d="M -290 -140 L -262 -170 M 290 142 L 258 170"
            fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
          <circle cx={-240} cy={-146} r={11} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <circle cx={240} cy={-146} r={11} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <text x={0} y={-44} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={74} fill={C.ink}>世界初では</text>
          <text x={0} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={74} fill={C.ink}>ありません</text>
          {/* 赤アンダーライン (f で引かれる) */}
          <line x1={-230} y1={112} x2={-230 + 460 * lineT} y2={112}
            stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
        </g>
        {/* 「初」の木札が脇へどけられる */}
        <g transform={`translate(${620 + slide * 300} ${560 + slide * 60}) rotate(${slide * 24})`}
          opacity={1 - slide * 0.25}>
          <rect x={-70} y={-86} width={140} height={172} rx={10}
            fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
          <line x1={-56} y1={-40} x2={56} y2={-44} stroke={SGP.woodDark} strokeWidth={3} />
          <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={92} fill={KRP.white} stroke={C.ink} strokeWidth={2}
            paintOrder="stroke">初</text>
        </g>
        {/* どける手 (袖+手のひら) */}
        <g transform={`translate(${430 + handT * 110 + slide * 290} ${610 + slide * 56}) rotate(${slide * 12})`}
          opacity={handT}>
          <rect x={-180} y={-34} width={150} height={78} rx={16}
            fill={KRP.blue} stroke={C.ink} strokeWidth={6} />
          <circle cx={6} cy={4} r={40} fill={C.skin} stroke={C.ink} strokeWidth={6} />
          <path d="M 28 -18 Q 50 -10 46 10" fill="none" stroke={C.ink} strokeWidth={4} />
        </g>
        {/* どけた軌跡の勢い線 */}
        {slide > 0.15 && (
          <g stroke={C.ink} strokeWidth={4} opacity={0.55 * (1 - slide * 0.5)} strokeLinecap="round">
            <path d={`M ${560 + slide * 180} 520 q 60 10 120 34`} fill="none" />
            <path d={`M ${556 + slide * 180} 584 q 56 16 112 36`} fill="none" />
          </g>
        )}
        {/* 「初」がいた場所に × */}
        <XMark x={626} y={520} s={1.1} t={seg(f, 34, 40)} />
      </g>
      {/* 余談札 */}
      <TagPlate x={560} y={110} text="ちなみに" size={46} rot={-5} t={seg(f, 4, 12)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #169 5年前、フランスの「悪魔のような女」という映画に、先例があります。
// 格: 並 / seed 1255
// 絵: 仏映画のポスター風の額。年号札1955。トリコロールの小旗
// どこ: 1955年のパリの映画館ロビー。金の額・ビロードのロープ・トリコロールの小旗
// 演出: 金縁の額に入った仏映画のポスター (暗い廊下と薄明かりの意匠。ネタバレ小物なし)。
//       年号札1955。小旗が f ではためく
// 動き: カメラがポスターへ寄る。旗がゆれ、壁ランプの炎がまたたき、埃が舞う
const Sg169: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 75)) * 0.07;
  const posterT = easeOut(seg(f, 2, 14));
  return (
    <Frame f={f} seed={1255}>
      <g transform={zoomAt(z, 860, 470)}>
        {/* ロビーの壁・腰板・赤絨毯 */}
        <rect x={-20} y={-20} width={W + 40} height={760} fill={C.frWall} />
        <rect x={-20} y={620} width={W + 40} height={140} fill={C.officePanel} />
        <line x1={-20} y1={620} x2={W + 20} y2={620} stroke={C.ink} strokeWidth={6} />
        <rect x={-20} y={760} width={W + 40} height={340} fill={C.velvet} />
        <line x1={-20} y1={760} x2={W + 20} y2={760} stroke={C.ink} strokeWidth={7} />
        <path d="M -20 820 Q 480 800 960 820 T 1940 820" fill="none"
          stroke={C.ink} strokeWidth={3} opacity={0.3} />
        {/* 壁のモールディング */}
        <line x1={-20} y1={120} x2={W + 20} y2={120} stroke={C.ink} strokeWidth={4} opacity={0.35} />
        <WallLamp x={250} y={330} f={f} s={1.05} />
        <WallLamp x={1470} y={330} f={f} s={1.05} />
        {/* トリコロールの小旗 (f ではためく) */}
        <path d="M 60 60 Q 860 150 1860 60" fill="none" stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 0.5) / 9;
          const fx = 60 + t * 1800;
          const fy = 60 + Math.sin(Math.PI * t) * 86;
          const wave = Math.sin(f / 6 + i * 1.3) * 7;
          const cols = [KRP.blueDeep, KRP.white, KRP.red];
          return (
            <g key={i} transform={`translate(${fx} ${fy}) rotate(${wave})`}>
              {cols.map((col, k) => (
                <path key={k} d={`M ${-27 + k * 18} 0 L ${-9 + k * 18} 0 L ${-9 + k * 18 + wave * 0.4} 62 L ${-27 + k * 18 + wave * 0.4} 62 Z`}
                  fill={col} stroke={C.ink} strokeWidth={3} />
              ))}
            </g>
          );
        })}
        {/* 金縁の額 + 仏ポスター (主役) */}
        <g transform={`translate(860 430) scale(${0.92 + posterT * 0.08})`} opacity={posterT}>
          <rect x={-310} y={-330} width={620} height={660} rx={14}
            fill={C.frameGold} stroke={C.ink} strokeWidth={8} />
          <rect x={-278} y={-298} width={556} height={596} rx={6}
            fill={C.posterInk} stroke={C.ink} strokeWidth={5} />
          {/* 額の飾り彫り */}
          {[[-310, -330], [310, -330], [-310, 330], [310, 330]].map(([qx, qy], i) => (
            <circle key={i} cx={qx} cy={qy} r={22} fill={C.frameGold} stroke={C.ink} strokeWidth={6} />
          ))}
          {/* ポスターの意匠: 暗い廊下・薄く開いた扉・漏れる光 (ネタバレなし) */}
          <path d="M -278 298 L -90 40 L 90 40 L 278 298 Z" fill={C.night} opacity={0.9} />
          <rect x={-66} y={-150} width={132} height={190} fill={C.doorWoodD} stroke={C.smoke} strokeWidth={4} />
          <path d={`M 10 -150 L ${34 + Math.sin(f / 10) * 3} -144 L ${34 + Math.sin(f / 10) * 3} 34 L 10 40 Z`}
            fill={C.rayGold} opacity={0.85} />
          <path d="M 10 40 L 150 298 L 40 298 Z" fill={C.rayGold} opacity={0.3} />
          {/* 題字と仏語風の飾り線 */}
          <text x={0} y={-216} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={56} fill={KRP.white} letterSpacing={2}>悪魔のような女</text>
          <line x1={-200} y1={-190} x2={200} y2={-190} stroke={C.frameGold} strokeWidth={4} />
          <line x1={-150} y1={236} x2={150} y2={236} stroke={C.smoke} strokeWidth={3} opacity={0.6} />
          <line x1={-110} y1={262} x2={110} y2={262} stroke={C.smoke} strokeWidth={3} opacity={0.4} />
        </g>
        {/* ビロードのロープ柵 (手前) */}
        {[460, 1260].map((sx) => (
          <g key={sx} stroke={C.ink}>
            <ellipse cx={sx} cy={892} rx={56} ry={16} fill={C.brassY} strokeWidth={6} />
            <line x1={sx} y1={886} x2={sx} y2={700} strokeWidth={9} stroke={C.brassY} />
            <line x1={sx} y1={886} x2={sx} y2={700} strokeWidth={3} stroke={C.ink} opacity={0.4} />
            <circle cx={sx} cy={690} r={16} fill={C.brassY} strokeWidth={5} />
          </g>
        ))}
        <path d={`M 460 710 Q 860 ${830 + Math.sin(f / 8) * 5} 1260 710`}
          fill="none" stroke={C.velvet} strokeWidth={16} strokeLinecap="round" />
        <path d={`M 460 710 Q 860 ${830 + Math.sin(f / 8) * 5} 1260 710`}
          fill="none" stroke={C.ink} strokeWidth={4} opacity={0.4} />
        {/* 観葉植物 (右) */}
        <g transform="translate(1700 640)">
          <path d="M -60 240 L 60 240 L 44 120 L -44 120 Z" fill={C.awning} stroke={C.ink} strokeWidth={6} />
          {[-40, -12, 16, 44].map((lx, i) => (
            <path key={i} d={`M 0 120 Q ${lx} ${30 + Math.sin(f / 9 + i) * 5} ${lx * 1.7} -40`}
              fill="none" stroke={KRP.green} strokeWidth={10} strokeLinecap="round" />
          ))}
        </g>
        {/* 漂う埃 */}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={560 + rnd(21, i) * 700}
            cy={200 + rnd(22, i) * 400 + Math.sin(f / 9 + i * 2) * 10}
            r={3} fill={KRP.white} opacity={0.5} />
        ))}
      </g>
      {/* 年号札 (左下の絨毯の上。旗やランプと被らない位置) */}
      <TagPlate x={240} y={755} text="1955" size={54} rot={-4} t={seg(f, 14, 22)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #170 それでも「サイコ」の行列が、このやり方をアメリカ中に知らしめました。
// 格: 並 / seed 1256
// 絵: 全米地図。NYから行列のアイコンが各都市へ飛び火していく
// どこ: 配給会社の作戦室。壁一面に画鋲で留めた全米地図。下に電話と書類の机の縁
// 演出: NYの星から各都市へ弧の線が順に伸び、着いた先に小さな行列 (PersonMini) が
//       ポンポン湧く。地図が主役で画面の主面積を使う
// 動き: 弧が f で1本ずつ描かれ、行列が順に現れる。NYの星が脈打つ。カメラ微ズーム
const Sg170: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.05;
  const ny = { x: 1430, y: 360 };
  // 行き先の都市 (NYから西・南へ飛び火)
  const cities = [
    { x: 1150, y: 330, bend: -120 },  // 五大湖あたり
    { x: 1310, y: 560, bend: 90 },    // 南部
    { x: 900, y: 420, bend: -150 },   // 中西部
    { x: 620, y: 560, bend: 110 },    // 南西部
    { x: 430, y: 330, bend: -170 },   // 北西部
    { x: 330, y: 500, bend: -140 },   // 西海岸
  ];
  const star = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 === 0 ? r : r * 0.45;
      const th = (Math.PI * k) / 5 - Math.PI / 2;
      pts.push(`${cx + rr * Math.cos(th)},${cy + rr * Math.sin(th)}`);
    }
    return pts.join(" ");
  };
  return (
    <Frame f={f} seed={1256}>
      <g transform={zoomAt(z, 960, 480)}>
        {/* 作戦室の壁と机の縁 */}
        <rect x={-20} y={-20} width={W + 40} height={920} fill={C.studioWall} />
        <rect x={-20} y={860} width={W + 40} height={240} fill={C.deskTop} />
        <line x1={-20} y1={860} x2={W + 20} y2={860} stroke={C.ink} strokeWidth={7} />
        {/* 机上の小物: 黒電話・書類・鉛筆 */}
        <g stroke={C.ink} strokeWidth={5}>
          <path d="M 190 930 Q 250 880 310 930 L 296 960 Q 250 930 204 960 Z" fill={C.ink} />
          <ellipse cx={250} cy={975} rx={72} ry={22} fill={C.night} />
          <rect x={1520} y={900} width={240} height={60} fill={C.ledger} transform="rotate(-4 1640 930)" />
          <rect x={1560} y={884} width={240} height={60} fill={C.marquee} transform="rotate(3 1680 914)" />
          <line x1={1240} y1={950} x2={1400} y2={928} stroke={C.brassY} strokeWidth={9} />
        </g>
        {/* 全米地図 (紙+海+陸) 画鋲4つ */}
        <rect x={150} y={110} width={1620} height={720} rx={8}
          fill={C.mapPaper} stroke={C.ink} strokeWidth={7} />
        <rect x={190} y={150} width={1540} height={640}
          fill={C.mapSea} stroke={C.ink} strokeWidth={4} />
        {[[186, 146], [1734, 146], [186, 794], [1734, 794]].map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={13} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
            <circle cx={px - 3} cy={py - 3} r={4} fill={KRP.white} opacity={0.7} />
          </g>
        ))}
        {/* 陸地 (ざっくり全米。右上に五大湖の切れ込み) */}
        <path d="M 270 300 Q 320 230 440 240 L 980 228 Q 1120 220 1200 260
                 L 1330 268 Q 1380 300 1470 310 L 1560 340 Q 1600 380 1560 420
                 L 1500 470 Q 1470 540 1400 560 L 1360 640 Q 1320 700 1260 660
                 L 1200 620 Q 1100 650 1020 630 L 940 660 Q 800 700 700 650
                 L 560 640 Q 430 650 380 560 L 300 460 Q 250 380 270 300 Z"
          fill={C.mapLand} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 1150 250 Q 1190 290 1150 310 M 1240 265 Q 1270 300 1235 318"
          fill="none" stroke={C.mapSea} strokeWidth={10} strokeLinecap="round" />
        {/* 州境っぽい薄い線 */}
        <g stroke={C.ink} strokeWidth={2.5} opacity={0.22} fill="none">
          <path d="M 620 240 L 610 640" />
          <path d="M 860 230 L 850 655" />
          <path d="M 1080 226 L 1070 635" />
          <path d="M 300 440 L 1480 430" />
        </g>
        {/* NYの星 (脈打つ) */}
        <polygon points={star(ny.x, ny.y, 34 + Math.sin(f / 5) * 4)}
          fill={KRP.red} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={ny.x} cy={ny.y} r={50 + (f % 18) * 2.2}
          fill="none" stroke={KRP.red} strokeWidth={4}
          opacity={0.5 * (1 - (f % 18) / 18)} />
        {/* 飛び火の弧 + 着地点の小さな行列 */}
        {cities.map((ct, i) => {
          const a = easeOut(seg(f, 3 + i * 5, 14 + i * 5));
          const arrive = pop(seg(f, 12 + i * 5, 20 + i * 5));
          const mx = (ny.x + ct.x) / 2;
          const my = (ny.y + ct.y) / 2 + ct.bend;
          const len = Math.hypot(ct.x - ny.x, ct.y - ny.y) * 1.25;
          return (
            <g key={i}>
              <path d={`M ${ny.x} ${ny.y} Q ${mx} ${my} ${ct.x} ${ct.y}`}
                fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round"
                strokeDasharray={len} strokeDashoffset={len * (1 - a)} opacity={0.85} />
              {arrive > 0 && (
                <g transform={`translate(${ct.x} ${ct.y}) scale(${arrive})`}>
                  <circle cx={0} cy={0} r={12} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
                  {[0, 1, 2].map((k) => (
                    <PersonMini key={k} x={26 + k * 30} y={16} s={0.4}
                      color={[KRP.blue, KRP.orange, KRP.green][k]} f={f}
                      phase={i * 2 + k} face="dot" arms="down" />
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </g>
      {/* 札は地図の外の壁に (海・陸と被らない) */}
      <TagPlate x={1660} y={70} text="全米へ" size={46} rot={3} t={seg(f, 32, 40)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #171 途中入場の時代の、終わりの始まりです。
// 格: 山 / seed 1257
// 絵: 章結び。「途中入場」と彫られた古い扉が、きい、と音を立てて閉まりかける。蝶番の軋み線、隙間から漏れる最後の光。手配書⑤ヒッチコックに御用印
// どこ: 古い劇場の暗い廊下の突き当たり。「途中入場」と彫られた木の大扉
// 演出: 章結び。扉がきい、と閉まりかけ、隙間の光が細くなる。蝶番の軋み線・舞う埃。
//       左の壁で手配書⑤ヒッチコックに御用の朱印がドンと押される
// 動き: 扉の角度と光の幅が f で狭まる (閉め切らない)。軋み線が点滅し埃が漂う
const Sg171: React.FC<{ f: number }> = ({ f }) => {
  const close = easeOut(seg(f, 4, 42));          // 0=開 → 1=ほぼ閉
  const gapW = lerp(300, 46, close);             // 隙間の光の幅
  const squeak = Math.floor(f / 8) % 2 === 0;    // 軋み線の点滅
  return (
    <Frame f={f} seed={1257} bg={C.night} dark>
      {/* 廊下の壁と床 (突き当たりへ奥行き) */}
      <rect x={-20} y={-20} width={W + 40} height={840} fill={C.hallWall} />
      <rect x={-20} y={820} width={W + 40} height={280} fill={C.nightFloor} />
      <line x1={-20} y1={820} x2={W + 20} y2={820} stroke={C.ink} strokeWidth={7} />
      {/* 床板の目地 (奥へ収束) */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={200 + i * 260} y1={1100} x2={700 + i * 90} y2={820}
          stroke={C.ink} strokeWidth={3} opacity={0.35} />
      ))}
      <path d="M -20 820 L 560 240 M 1940 820 L 1400 240" fill="none"
        stroke={C.ink} strokeWidth={4} opacity={0.25} />
      {/* 壁の羽目板の線 */}
      <line x1={-20} y1={560} x2={620} y2={560} stroke={C.ink} strokeWidth={3} opacity={0.3} />
      <line x1={1340} y1={560} x2={1940} y2={560} stroke={C.ink} strokeWidth={3} opacity={0.3} />
      <WallLamp x={1700} y={360} f={f} s={1.1} />
      {/* 突き当たりの扉枠 (大扉が主役) */}
      <rect x={640} y={140} width={640} height={680} fill={C.doorWoodD} stroke={C.ink} strokeWidth={9} />
      <rect x={668} y={168} width={584} height={652} fill={C.night} />
      {/* 隙間から漏れる最後の光 (閉まるほど細く) */}
      <path d={`M ${960 - gapW / 2} 168 L ${960 + gapW / 2} 168 L ${960 + gapW / 2} 820 L ${960 - gapW / 2} 820 Z`}
        fill={C.rayGold} opacity={0.9} />
      <path d={`M ${960 - gapW / 2} 820 L ${960 + gapW / 2} 820 L ${960 + gapW * 1.6} 1080 L ${960 - gapW * 1.6} 1080 Z`}
        fill={C.rayGold} opacity={0.4} />
      {/* 扉本体 (右端を軸にスイング。閉まるほど幅が広がる) */}
      <g>
        <path d={`M ${960 + gapW / 2} 168 L 1252 168 L 1252 820 L ${960 + gapW / 2} 820 Z`}
          fill={C.doorWood} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        {/* 扉の鏡板2枚と取っ手 */}
        <rect x={lerp(830, 1040, close)} y={230} width={lerp(130, 70, close)} height={240}
          fill={C.doorWoodD} stroke={C.ink} strokeWidth={5} />
        <rect x={lerp(830, 1040, close)} y={520} width={lerp(130, 70, close)} height={240}
          fill={C.doorWoodD} stroke={C.ink} strokeWidth={5} />
        <circle cx={lerp(810, 1022, close)} cy={500} r={14} fill={C.brassY} stroke={C.ink} strokeWidth={5} />
        {/* 彫られた扁額「途中入場」(扉上の板) */}
        <rect x={760} y={70} width={400} height={86} rx={8}
          fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <line x1={778} y1={134} x2={1142} y2={132} stroke={SGP.woodDark} strokeWidth={3} />
        <text x={960} y={134} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={54} fill={KRP.white} stroke={C.ink} strokeWidth={2}
          paintOrder="stroke" letterSpacing={8}>途中入場</text>
      </g>
      {/* 蝶番 (右端) と軋み線 */}
      {[260, 500, 740].map((hy) => (
        <g key={hy}>
          <rect x={1238} y={hy - 26} width={30} height={52} rx={6}
            fill={C.canDark} stroke={C.ink} strokeWidth={5} />
          <circle cx={1253} cy={hy} r={5} fill={C.ink} />
        </g>
      ))}
      {squeak && close < 0.98 && (
        <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.8} fill="none">
          <path d="M 1290 230 q 26 -18 18 -46" />
          <path d="M 1306 268 q 38 -12 40 -48" />
          <path d="M 1292 490 q 30 -8 32 -36" />
        </g>
      )}
      {/* 光の中を舞う埃 */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i}
          cx={960 + (rnd(31, i) - 0.5) * gapW * 1.6}
          cy={260 + rnd(32, i) * 480 + Math.sin(f / 7 + i * 1.7) * 14}
          r={2.6 + rnd(33, i) * 2} fill={C.rayGold} opacity={0.75} />
      ))}
      {/* 左の壁: 手配書⑤ヒッチコック → 御用 */}
      <Tehaisho f={f} who={5} x={330} y={470} s={0.95} goyoT={seg(f, 22, 32)} />
      {/* 御用の瞬間の効果線 */}
      {seg(f, 22, 32) > 0 && seg(f, 22, 32) < 1 && (
        <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={0.9}>
          <line x1={150} y1={300} x2={110} y2={260} />
          <line x1={510} y1={300} x2={550} y2={260} />
          <line x1={150} y1={640} x2={110} y2={680} />
        </g>
      )}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_161: (f) => <Sg161 f={f} />,
  sg_162: (f) => <Sg162 f={f} />,
  sg_163: (f) => <Sg163 f={f} />,
  sg_164: (f) => <Sg164 f={f} />,
  sg_165: (f) => <Sg165 f={f} />,
  sg_166: (f) => <Sg166 f={f} />,
  sg_167: (f) => <Sg167 f={f} />,
  sg_168: (f) => <Sg168 f={f} />,
  sg_169: (f) => <Sg169 f={f} />,
  sg_170: (f) => <Sg170 f={f} />,
  sg_171: (f) => <Sg171 f={f} />,
};

export const S_B8_MOTIFS: string[] = [
  "sg_161", // #161
  "sg_162", // #162
  "sg_163", // #163
  "sg_164", // #164
  "sg_165", // #165
  "sg_166", // #166
  "sg_167", // #167
  "sg_168", // #168
  "sg_169", // #169
  "sg_170", // #170
  "sg_171", // #171
];

export const saigoB8Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
