// 「つながる世界史」からくり試作回: 担当D (文#15〜#19・5枚)。
// 1文 = 1シーン = 1枚の絵。motif 名は必ず ksd_ で始める。seed は 714〜718。
// 設計書: docs/kse-test-design.md / 指示書: docs/briefs/KseD.md
//
// ★絵の「格」: 山=全部入り150〜250行 / 並=描くのは1つだけ60〜120行 / 図=図と札25〜50行+世界を敷く。
//   「図」「並」も品質は落とさない。必ず f で動く。大きく置いて画面を使い切る。
// ★絵の中の文字はラベル・数値・標識だけ。TagPlate の y + size*0.85 ≤ 830。seg の b ≤ 42。
// ★KseNotify は HTML なので svg の中に入れない。Frame の over={...} に渡す。

import React from "react";
import { KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01 } from "./KarakuriScenes";
import { W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow } from "./KseShared";
import { SP, KseNotify, DokuHai } from "./KseParts";

// このファイルだけで使う色 (足してよい)
const C = {
  ito: "#C0392B", // 赤い糸
  katagami: "#EFE6CE", // 型紙
  chizu: "#E8DCB9", // 古地図の紙
  chizuKage: "#D3C290", // 古地図の巻いた縁の影
  chako: "#4A6FA5", // チャコ (裁縫の下書き線)
} as const;

// ===================================================================
// ローカル部品
// ===================================================================

// 机の天板 (上から見た一枚板)。opacity で「図」の背景にも使える
const Tenban: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.floor} />
    {[250, 520, 790].map((y) => (
      <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} stroke={KRP.ink} strokeWidth={4} opacity={0.14} />
    ))}
    {[120, 400, 660, 930].map((y, i) => (
      <path key={y} d={`M -20 ${y} Q 480 ${y - 8 + i * 4} 960 ${y} Q 1440 ${y + 8 - i * 4} 1940 ${y}`}
        fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.07} />
    ))}
  </g>
);

// 新聞の紙面 (#18)。読める文字は書かない — 見出しは太い波線、本文は細い横線の束
const Shinbun: React.FC<{ x: number; y: number; rot: number; w: number; h: number; op: number }> = ({
  x, y, rot, w, h, op,
}) => {
  const rows = Math.floor((h - 180) / 24);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* 見出しの太い波線 */}
      <path d={`M ${-w / 2 + 50} ${-h / 2 + 62} Q ${-w / 2 + 130} ${-h / 2 + 46} ${-w / 2 + 210} ${-h / 2 + 62}
                T ${-w / 2 + 370} ${-h / 2 + 62} T ${w / 2 - 230} ${-h / 2 + 62}`}
        fill="none" stroke={KRP.ink} strokeWidth={17} strokeLinecap="round" />
      <path d={`M ${-w / 2 + 50} ${-h / 2 + 108} Q ${-w / 2 + 150} ${-h / 2 + 96} ${-w / 2 + 250} ${-h / 2 + 108}
                T ${-w / 2 + 440} ${-h / 2 + 108}`}
        fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" opacity={0.7} />
      {/* 写真枠のグレー四角 */}
      <rect x={w / 2 - 260} y={-h / 2 + 140} width={200} height={150} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
      {/* 段組の細い横線の束 (3段) */}
      {[0, 1, 2].map((col) => (
        <g key={col}>
          {Array.from({ length: rows }).map((_, i) => (
            <line key={i}
              x1={-w / 2 + 44 + col * ((w - 88) / 3)} y1={-h / 2 + 160 + i * 24}
              x2={-w / 2 + 14 + (col + 1) * ((w - 88) / 3)} y2={-h / 2 + 160 + i * 24}
              stroke={KRP.ink} strokeWidth={3} opacity={col === 2 && i < 6 ? 0 : 0.55} />
          ))}
        </g>
      ))}
    </g>
  );
};

// 待ち針 (#17)
const Machibari: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <line x1={0} y1={0} x2={0} y2={44} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
    <line x1={0} y1={2} x2={0} y2={42} stroke={KRP.silver} strokeWidth={4.5} strokeLinecap="round" />
    <circle cx={0} cy={-6} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 木箱のラジオ (#16。放送局型123号のおもかげ)
const HakoRadio: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-128} y={78} width={44} height={16} rx={5} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={84} y={78} width={44} height={16} rx={5} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-135} y={-88} width={270} height={170} rx={12} fill={SP.radioWood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-121} y={-74} width={242} height={142} rx={8} fill="none" stroke={SP.radioWoodDark} strokeWidth={5} />
      {/* 布張りの丸窓 */}
      <circle cx={-56} cy={-4} r={52} fill={SP.radioCloth} stroke={KRP.ink} strokeWidth={5} />
      {[-30, 0, 30].map((dx) => (
        <line key={dx} x1={-56 + dx} y1={-48} x2={-56 + dx} y2={40} stroke={SP.radioWoodDark} strokeWidth={4} opacity={0.6} />
      ))}
      {/* ダイヤル窓とつまみ */}
      <rect x={24} y={-52} width={88} height={38} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <line x1={58} y1={-48} x2={52} y2={-18} stroke={KRP.red} strokeWidth={4} />
      <circle cx={44} cy={34} r={15} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={92} cy={34} r={15} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 提灯 (#16)
const Chochin: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const yure = Math.sin(f / 16) * 2;
  return (
    <g transform={`translate(${x + yure} ${y}) scale(${sc})`}>
      <path d="M -26 -128 Q 0 -150 26 -128" fill="none" stroke={KRP.ink} strokeWidth={6} />
      <rect x={-42} y={-128} width={84} height={20} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-18} rx={64} ry={90} fill={SP.lantern} stroke={KRP.ink} strokeWidth={6} />
      {[-66, -42, -18, 6, 30].map((ry) => (
        <path key={ry} d={`M ${-Math.sqrt(Math.max(0, 1 - ((ry + 18) / 90) ** 2)) * 64} ${ry}
          Q 0 ${ry + 7} ${Math.sqrt(Math.max(0, 1 - ((ry + 18) / 90) ** 2)) * 64} ${ry}`}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      ))}
      <rect x={-40} y={66} width={80} height={18} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// 日の丸の印が付いた書類 (#16)
const HinomaruShorui: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(6) scale(${sc})`}>
      <rect x={-92} y={-122} width={184} height={244} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={-72} r={25} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      {[-24, 4, 32, 60].map((ly) => (
        <line key={ly} x1={-64} y1={ly} x2={64} y2={ly} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
      ))}
      <rect x={30} y={78} width={44} height={30} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.8} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// #15 (図) 「え、日本人が？ 何をしたの？」
// どこ: 直前 #14 の書類とスタンプを薄く敷いた上に通知カード (図にも世界を敷く)
// 演出: KseNotify (over に渡す)。svg 側には #14 の書類・？欄を大きく薄く残し QMark を足す
// 動き: カードのスライドイン・bob・まばたき (KseNotify が持っている)
const S15: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 19) * 0.6; // 書類がわずかに揺れる
  return (
    <Frame
      f={f}
      seed={714}
      bg={KRP.cream}
      over={<KseNotify f={f} t={seg(f, 6, 20)} text="え、日本人が？ 何をしたの？" />}
    >
      {/* 世界: 机の天板 (薄く) */}
      <Tenban opacity={0.4} />
      {/* 直前 #14 の書類を大きく薄く。少し斜めに置き f で揺れる */}
      <g transform={`translate(960 520) rotate(${-4 + sway})`} opacity={0.27}>
        <rect x={-650} y={-400} width={1300} height={820} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* クリップ */}
        <rect x={-556} y={-448} width={66} height={100} rx={30} fill="none" stroke={KRP.ink} strokeWidth={13} />
        <rect x={-556} y={-448} width={66} height={100} rx={30} fill="none" stroke={KRP.silver} strokeWidth={8} />
        {/* 題字の帯 (文字は書かない) */}
        <rect x={-560} y={-346} width={430} height={34} rx={6} fill={KRP.gray} opacity={0.65} />
        <rect x={-560} y={-286} width={300} height={22} rx={6} fill={KRP.gray} opacity={0.45} />
        {/* 罫線 */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={-560} y1={-180 + i * 62} x2={290} y2={-180 + i * 62}
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
        ))}
        {/* 顔写真欄は「？」のまま (似顔絵は描かない) */}
        <rect x={330} y={-380} width={240} height={300} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <text x={450} y={-195} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={120} fill={KRP.ink}>？</text>
        {/* 隅の小さな日の丸 */}
        <circle cx={-575} cy={330} r={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* 朱の角印「制裁」が押された跡 */}
        <g transform="translate(250 250) rotate(-12)">
          <rect x={-160} y={-74} width={320} height={148} rx={12} fill="none" stroke={KRP.red} strokeWidth={10} />
          <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={96} fill={KRP.red} letterSpacing={10}>制裁</text>
        </g>
      </g>
      {/* 書類の「？」欄のそばで大きくゆっくり浮く */}
      <QMark x={1600} y={180} s={1.5} f={f * 0.5} t={seg(f, 10, 22)} />
    </Frame>
  );
};

// #16 (図) その話も、最後にひとつにつながります。
// どこ: #1 と同じ広げた古地図の上 (回収の1枚)
// 演出: 地図の上の品々 (ラジオ・杯・提灯・日の丸の書類) を赤い糸が f で順に結んでいき、最後に結び目がきゅっと締まる
// 動き: 糸が走る・結び目が締まる・品がひとつずつ灯る
const S16: React.FC<{ f: number }> = ({ f }) => {
  const legs = [
    easeOut(clamp01(seg(f, 10, 17))),
    easeOut(clamp01(seg(f, 17, 24))),
    easeOut(clamp01(seg(f, 24, 31))),
  ];
  const knot = easeOut(clamp01(seg(f, 34, 42)));
  const jx = Math.sin(f * 2.3) * 1.6 * knot; // 糸の震え
  const jy = Math.cos(f * 1.9) * 1.4 * knot;
  const glow = [seg(f, 10, 16), seg(f, 17, 23), seg(f, 24, 30), seg(f, 31, 37)].map(clamp01);
  return (
    <Frame f={f} seed={715} bg={KRP.cream}>
      {/* 世界: 広げた古地図を画面いっぱいに */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.chizu} />
      {[320, 640, 960, 1280, 1600].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={H} stroke={KRP.ink} strokeWidth={2.5} opacity={0.07} />
      ))}
      {[270, 540, 810].map((y) => (
        <line key={y} x1={0} y1={y} x2={W} y2={y} stroke={KRP.ink} strokeWidth={2.5} opacity={0.07} />
      ))}
      {/* 海岸線 (薄い墨) */}
      <path d="M -20 560 Q 160 500 300 580 Q 430 650 560 600 Q 700 545 790 620 Q 870 680 980 640"
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.18} />
      <path d="M 1030 240 Q 1180 300 1320 250 Q 1480 195 1620 270 Q 1760 340 1940 300"
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.18} />
      <path d="M 700 1000 Q 900 940 1120 990 Q 1330 1035 1500 960" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.15} />
      {/* 四辺が少し巻いた紙 */}
      <path d={`M -20 -20 L ${W + 20} -20 L ${W + 20} 18 Q 1440 36 960 26 Q 480 16 -20 30 Z`} fill={C.chizuKage} />
      <path d={`M -20 ${H + 20} L ${W + 20} ${H + 20} L ${W + 20} ${H - 18} Q 1440 ${H - 36} 960 ${H - 26} Q 480 ${H - 14} -20 ${H - 30} Z`} fill={C.chizuKage} />
      <path d={`M -20 -20 L 20 -20 Q 36 540 26 ${H + 20} L -20 ${H + 20} Z`} fill={C.chizuKage} />
      <path d={`M ${W + 20} -20 L ${W - 20} -20 Q ${W - 36} 540 ${W - 26} ${H + 20} L ${W + 20} ${H + 20} Z`} fill={C.chizuKage} />
      {/* 隅の方位記号 */}
      <g transform="translate(170 185)" opacity={0.75}>
        <circle r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
        <polygon points="0,-46 10,-10 46,0 10,10 0,46 -10,10 -46,0 -10,-10"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
        <circle r={7} fill={KRP.ink} />
      </g>
      {/* 結ばれた品が灯る (薄い黄色の後光) */}
      <ellipse cx={520} cy={360} rx={190} ry={140} fill={KRP.yellow} opacity={0.32 * glow[0]} />
      <ellipse cx={1420} cy={390} rx={150} ry={130} fill={KRP.yellow} opacity={0.32 * glow[1]} />
      <ellipse cx={500} cy={790} rx={140} ry={140} fill={KRP.yellow} opacity={0.32 * glow[2]} />
      <ellipse cx={1420} cy={790} rx={140} ry={150} fill={KRP.yellow} opacity={0.32 * glow[3]} />
      {/* 4つの品 */}
      <HakoRadio x={520} y={360} t={seg(f, 1, 9)} />
      <DokuHai x={1420} y={470} s={0.45} t={seg(f, 3, 11)} f={f} />
      <Chochin x={500} y={790} t={seg(f, 5, 13)} f={f} />
      <HinomaruShorui x={1420} y={790} t={seg(f, 7, 15)} />
      {/* 赤い糸が品を順に結ぶ (3本の糸+結び目で4区間) */}
      {[
        "M 520 400 Q 946 699 1420 410",
        "M 1420 410 Q 951 524 510 750",
        "M 500 800 Q 961 319 1410 770",
      ].map((d, i) => (
        <path key={d} d={d} fill="none" stroke={C.ito} strokeWidth={7} strokeLinecap="round"
          pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - legs[i])} />
      ))}
      {/* 最後に中央で結び目がきゅっと締まる */}
      {knot > 0 && (
        <g transform={`translate(${958 + jx} ${552 + jy})`}>
          <circle r={44 - 26 * knot} fill="none" stroke={C.ito} strokeWidth={7} opacity={Math.min(1, knot * 4)} />
          <line x1={-(30 - 14 * knot)} y1={-(26 - 12 * knot)} x2={30 - 14 * knot} y2={26 - 12 * knot}
            stroke={C.ito} strokeWidth={7} strokeLinecap="round" opacity={Math.min(1, knot * 4)} />
        </g>
      )}
      <TagPlate x={960} y={120} text="4つの手がかり" size={44} t={seg(f, 4, 14)} />
    </Frame>
  );
};

// #17 (並) 先にお断りすると、これは国や宗教を同じものとして扱う話ではありません。人間が負けを受け入れるときの「型」を比べる話です。
// どこ: 裁縫机の上。2枚の型紙を並べる
// 演出: 「同じもの扱い」ではなく「型くらべ」— 左右に別々の形の型紙 (実在の国の形にはしない抽象の2枚)。
//        間に「=」を薄く描いて×で消す、下に共通の物差し。XMark→物差しの順で出る
// 動き: 型紙が f で左右からスッと並ぶ・物差しの目盛が伸びる
const S17: React.FC<{ f: number }> = ({ f }) => {
  const slide = easeOut(clamp01(seg(f, 2, 14)));
  const bobL = Math.sin(f / 21) * 3;
  const bobR = Math.sin(f / 21 + 1.6) * 3;
  const eqT = clamp01(seg(f, 16, 22));
  const tickT = clamp01(seg(f, 26, 42));
  const LEFT = "M -260 -168 L 118 -192 L 258 -62 L 232 148 L -78 190 L -248 92 Z";
  const RIGHT = "M -238 -122 C -198 -222 198 -232 250 -92 C 292 28 192 198 -18 198 C -198 198 -280 -12 -238 -122 Z";
  return (
    <Frame f={f} seed={716} bg={KRP.cream}>
      {/* 世界: 木の机の天板+淡い敷き布 */}
      <Tenban />
      <rect x={150} y={150} width={1620} height={720} rx={24} fill={KRP.white} opacity={0.55} />
      <rect x={176} y={176} width={1568} height={668} rx={18} fill="none" stroke={KRP.ink}
        strokeWidth={3.5} strokeDasharray="16 12" opacity={0.3} />
      {/* 左の型紙 (角ばった輪郭) — f で左からスッと */}
      <g transform={`translate(${540 - (1 - slide) * 460} ${440 + bobL})`}>
        <path d={LEFT} transform="translate(10 14)" fill={KRP.ink} opacity={0.14} />
        <path d={LEFT} fill={C.katagami} stroke={KRP.ink} strokeWidth={6} />
        <path d={LEFT} transform="scale(0.8)" fill="none" stroke={C.chako} strokeWidth={4}
          strokeDasharray="14 10" opacity={0.85} />
        {/* ハサミの切り込み */}
        <path d="M -30 -186 l 10 34" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 236 30 l -32 8" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <Machibari x={-190} y={-110} rot={-28} />
        <Machibari x={160} y={120} rot={22} />
        <Machibari x={-120} y={150} rot={8} />
      </g>
      {/* 右の型紙 (丸みのある輪郭) — f で右からスッと */}
      <g transform={`translate(${1380 + (1 - slide) * 460} ${440 + bobR})`}>
        <path d={RIGHT} transform="translate(10 14)" fill={KRP.ink} opacity={0.14} />
        <path d={RIGHT} fill={C.katagami} stroke={KRP.ink} strokeWidth={6} />
        <path d={RIGHT} transform="scale(0.8)" fill="none" stroke={C.chako} strokeWidth={4}
          strokeDasharray="14 10" opacity={0.85} />
        <path d="M 60 -224 l -8 34" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -250 60 l 32 -8" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <Machibari x={-150} y={-120} rot={-16} />
        <Machibari x={190} y={90} rot={30} />
      </g>
      {/* 2枚の間の上: 「=」を薄く描いて×で消す (同じ扱いではない) */}
      <g opacity={0.45 * pop(eqT)} stroke={KRP.ink} strokeWidth={15} strokeLinecap="round">
        <line x1={896} y1={222} x2={1024} y2={222} />
        <line x1={896} y1={258} x2={1024} y2={258} />
      </g>
      <XMark x={960} y={240} s={1.0} t={seg(f, 22, 30)} />
      {/* 下に共通の物差し1本 (目盛が左から伸びる。数字は入れない) */}
      <g transform="translate(360 740)">
        <rect x={0} y={0} width={1200} height={48} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 61 }).map((_, i) => (
          <line key={i} x1={20 + i * (1160 / 60)} y1={48}
            x2={20 + i * (1160 / 60)} y2={i % 5 === 0 ? 14 : 28}
            stroke={KRP.ink} strokeWidth={i % 5 === 0 ? 4.5 : 3}
            opacity={i / 60 <= tickT ? 0.9 : 0} />
        ))}
      </g>
      <TagPlate x={960} y={96} text="くらべる道具は同じ" size={40} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// #18 (図) 「そもそも、今どうなってるんだっけ？」
// どこ: 散らばる新聞紙面を薄く敷いた上に通知カード
// 演出: KseNotify (over に渡す)。svg 側は新聞の紙面が斜めに重なる世界+QMark
// 動き: カードのスライドイン・bob・まばたき (KseNotify が持っている)。いちばん上の紙面がゆっくり傾く
const S18: React.FC<{ f: number }> = ({ f }) => {
  const tilt = -3 + 5 * easeOut(clamp01(seg(f, 6, 40))) + Math.sin(f / 31) * 0.7;
  return (
    <Frame
      f={f}
      seed={717}
      bg={KRP.cream}
      over={<KseNotify f={f} t={seg(f, 6, 20)} text="そもそも、今どうなってるんだっけ？" />}
    >
      {/* 世界: 机の天板 (ごく薄く)+新聞の紙面3〜4枚が斜めに重なる */}
      <Tenban opacity={0.25} />
      <Shinbun x={560} y={720} rot={9} w={880} h={560} op={0.22} />
      <Shinbun x={1310} y={750} rot={-7} w={860} h={540} op={0.22} />
      <Shinbun x={1020} y={980} rot={-3} w={760} h={420} op={0.2} />
      {/* いちばん上の紙面が f でゆっくり傾く */}
      <Shinbun x={930} y={660} rot={tilt} w={940} h={580} op={0.3} />
      {/* 紙面の重なりの上に？ */}
      <QMark x={1470} y={650} s={1.45} f={f} t={seg(f, 12, 24)} />
    </Frame>
  );
};

// #19 (図) 60秒でおさらいします。
// どこ: 机の上。大きなストップウォッチが主役
// 演出: 手描きのストップウォッチ (竜頭・目盛・針) が画面の半分超。針が f=12 から回り出す。
//        文字盤の数字は 0・15・30・45 のみ (「60」は字幕と重なるので書かない)。札は使わない
// 動き: 針が回る・竜頭がかちっと沈む・目盛がひとつずつ濃くなる・通過した扇形が黄色く育つ
const S19: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeOut(clamp01(seg(f, 2, 12)));
  const sink = 12 * (clamp01(seg(f, 6, 8)) - clamp01(seg(f, 8, 10))); // 竜頭がかちっ
  const handT = clamp01((f - 12) / 30); // f=12 から回り出し f=42 で 1/4
  const a = (handT * Math.PI) / 2;
  const tickFill = clamp01(seg(f, 3, 12));
  const pulse = 0.22 + Math.sin(f / 13) * 0.05;
  return (
    <Frame f={f} seed={718} bg={KRP.cream}>
      {/* 世界: 机の天板+敷き紙 (見本と同じ作り) */}
      <Tenban />
      <g transform="rotate(-1.2 960 540)">
        <rect x={180} y={110} width={1560} height={860} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
      </g>
      {/* 主役: 大きな手描きストップウォッチ (直径620) */}
      <g transform={`translate(845 515) scale(${(0.72 + 0.28 * t1) * 1.08})`}>
        <ellipse cx={18} cy={30} rx={316} ry={310} fill={KRP.ink} opacity={0.12} />
        {/* 竜頭 (f=6〜10 でかちっと沈んで戻る) と左右の小ボタン */}
        <circle cx={-208} cy={-248} r={17} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={208} cy={-248} r={17} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-15} y={-352} width={30} height={50} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(0 ${sink})`}>
          <rect x={-34} y={-402} width={68} height={54} rx={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          {[-20, -7, 6, 19].map((dx) => (
            <line key={dx} x1={dx} y1={-396} x2={dx} y2={-354} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
          ))}
        </g>
        {/* 外周の金属リングと文字盤 */}
        <circle r={310} fill={KRP.silver} stroke={KRP.ink} strokeWidth={8} />
        <circle r={262} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* リングのつや (ゆらゆら) */}
        <g transform={`rotate(${Math.sin(f / 17) * 4})`}>
          <path d="M -212 -196 A 288 288 0 0 1 -62 -282" fill="none" stroke={KRP.white}
            strokeWidth={11} strokeLinecap="round" opacity={0.55} />
        </g>
        {/* 針の通過した扇形 (薄い黄色) */}
        {handT > 0 && (
          <path d={`M 0 0 L 0 -246 A 246 246 0 0 1 ${246 * Math.sin(a)} ${-246 * Math.cos(a)} Z`}
            fill={KRP.yellow} opacity={pulse} />
        )}
        {/* 60個の目盛 (5刻みを太く)。ひとつずつ濃くなる */}
        {Array.from({ length: 60 }).map((_, i) => {
          const rad = (i * 6 * Math.PI) / 180;
          const r1 = i % 5 === 0 ? 212 : 224;
          return (
            <line key={i}
              x1={r1 * Math.sin(rad)} y1={-r1 * Math.cos(rad)}
              x2={244 * Math.sin(rad)} y2={-244 * Math.cos(rad)}
              stroke={KRP.ink} strokeWidth={i % 5 === 0 ? 6 : 3}
              opacity={i / 60 <= tickFill ? 1 : 0} />
          );
        })}
        {/* 数字は 0・15・30・45 のみ (「60」は書かない) */}
        <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>0</text>
        <text x={172} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>15</text>
        <text x={0} y={186} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>30</text>
        <text x={-172} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>45</text>
        {/* 針 (f=12 から回り出す) と中心軸 */}
        <g transform={`rotate(${handT * 90})`}>
          <polygon points="0,30 -10,0 -4,-236 4,-236 10,0" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={38} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle r={16} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <circle r={6} fill={KRP.ink} />
      </g>
      {/* 針の回る向きに添える */}
      <Arrow x={1330} y={400} s={1.1} rot={70} t={seg(f, 26, 36)} />
    </Frame>
  );
};

// ===================================================================
// 対応表 (変えない)
// ===================================================================
export const KSE_D_SCENES: Record<string, (f: number) => React.ReactElement> = {
  ksd_notify_nihonjin: (f) => <S15 f={f} />,
  ksd_ito_tsunagaru: (f) => <S16 f={f} />,
  ksd_kata_kurabe: (f) => <S17 f={f} />,
  ksd_notify_ima: (f) => <S18 f={f} />,
  ksd_60byo_osarai: (f) => <S19 f={f} />,
};
