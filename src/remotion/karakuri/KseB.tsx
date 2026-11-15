// 「つながる世界史」からくり試作回: 担当B (文#6〜#9・4枚)。
// 1文 = 1シーン = 1枚の絵。motif 名は必ず ksb_ で始める。seed は 705〜708。
// 設計書: docs/kse-test-design.md / 指示書: docs/briefs/KseB.md
//
// ★絵の「格」: 山=全部入り150〜250行 / 並=描くのは1つだけ60〜120行 / 図=図と札25〜50行+世界を敷く。
//   「図」「並」も品質は落とさない。必ず f で動く。大きく置いて画面を使い切る。
// ★絵の中の文字はラベル・数値・標識だけ。TagPlate の y + size*0.85 ≤ 830。seg の b ≤ 42。
// ★KseNotify は HTML なので svg の中に入れない。Frame の over={...} に渡す。

import React from "react";
import { KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01 } from "./KarakuriScenes";
import { W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow } from "./KseShared";
import { SP, DokuHai, KseNotify } from "./KseParts";

// このファイルだけで使う色 (足してよい)
const C = {
  paper: "#EFE6CE", // 軍議の紙
  paperShade: "#DFD2B4", // 紙の巻いた縁の裏
  room: "#4F4738", // 暗い室内の壁
  wall: "#E7DFCD", // 広場の低い壁
  jacketBlue: "#5A6B86", // 群衆の男の上着
  jacketBrown: "#7A6A55", // 群衆の男の上着 (茶)
  tape: "#D9C690", // 窓の養生テープ
} as const;

// ===== このファイルだけのローカル部品 =====

// 群衆の男 (襟を開けたシャツ+上着。1988年テヘラン、ネクタイなし)
const CrowdMan: React.FC<{
  x: number; y: number; s?: number; jacket?: string; f: number; phase?: number; rot?: number;
}> = ({ x, y, s = 1, jacket = C.jacketBlue, f, phase = 0, rot = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3; // PersonMini と同じゆれに合わせる
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <PersonMini x={x} y={y} s={s} color={jacket} f={f} phase={phase} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <polygon points="-18,-124 0,-94 18,-124" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <line x1={-18} y1={-124} x2={-26} y2={-66} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
        <line x1={18} y1={-124} x2={26} y2={-66} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
      </g>
    </g>
  );
};

// 群衆の女 (黒チャードル。頭巾を PersonMini の上に重ねる)
const ChadorWoman: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; rot?: number;
}> = ({ x, y, s = 1, f, phase = 0, rot = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <PersonMini x={x} y={y} s={s} color={SP.mourning} f={f} phase={phase} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <path
          d="M -38 -116 Q -54 -188 0 -198 Q 54 -188 38 -116 L 24 -116 Q 30 -172 0 -176 Q -30 -172 -24 -116 Z"
          fill={SP.mourning} stroke={KRP.ink} strokeWidth={4.5}
        />
      </g>
    </g>
  );
};

// 建物の窓 (taped = 都市戦争の名残のテープ×)
const Win: React.FC<{ x: number; y: number; taped?: boolean }> = ({ x, y, taped }) => (
  <g>
    <rect x={x} y={y} width={92} height={110} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
    {taped && (
      <g stroke={C.tape} strokeWidth={10} strokeLinecap="round" opacity={0.95}>
        <line x1={x + 10} y1={y + 12} x2={x + 82} y2={y + 98} />
        <line x1={x + 82} y1={y + 12} x2={x + 10} y2={y + 98} />
      </g>
    )}
  </g>
);

// 軍議の木の駒 (将棋駒形)
const Koma: React.FC<{ x: number; y: number; rot?: number; t: number; side: "red" | "blue" }> = ({
  x, y, rot = 0, t, side,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <polygon points="0,-46 32,-30 25,36 -25,36 -32,-30" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <polygon points="0,-34 22,-22 18,24 -18,24 -22,-22" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
      <circle cx={0} cy={-2} r={9} fill={side === "red" ? KRP.red : KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// #6 (山) 最後まで「勝つまでやめない」と言い続けた最高指導者ホメイニが、停戦を受け入れたのです。
// どこ: 1988年テヘラン。演説台と群衆の広場
// 演出: 黒ターバン (SP.turban)・白髭・黒アバの老指導者。振り上げた拳が f でゆっくり下り、うつむく。群衆が見上げる
// 動き: 拳→下ろす・うつむきの角度・群衆のざわめき (似顔絵にしない。装いで識別)
const S6: React.FC<{ f: number }> = ({ f }) => {
  const down = easeOut(seg(f, 12, 38)); // 振り上げた拳がゆっくり下りる
  const bow = easeOut(seg(f, 26, 42)); // うつむき
  const armRot = 150 - 150 * down; // 150°(上) → 0°(だらりと下)
  const lean = 6 * bow;
  const LX = 1230, LY = 615, LS = 1.2; // 指導者の足元と大きさ
  return (
    <Frame f={f} seed={705} bg={KRP.cream}>
      {/* 奥: 建物の壁。窓に養生テープの× (都市戦争の名残) */}
      <rect x={60} y={200} width={520} height={460} fill={KRP.paperCool} stroke={KRP.ink} strokeWidth={6} />
      <Win x={130} y={260} taped />
      <Win x={290} y={260} />
      <Win x={450} y={260} />
      <Win x={130} y={420} />
      <Win x={290} y={420} taped />
      <Win x={450} y={420} />
      <rect x={1520} y={170} width={360} height={490} fill={KRP.paperCool} stroke={KRP.ink} strokeWidth={6} />
      <Win x={1580} y={240} />
      <Win x={1720} y={240} taped />
      <Win x={1580} y={400} />
      <Win x={1720} y={400} />
      {/* 広場の低い壁と地面 */}
      <rect x={560} y={480} width={980} height={180} fill={C.wall} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={650} width={W + 40} height={450} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
      <line x1={-20} y1={790} x2={W + 20} y2={786} stroke={KRP.ink} strokeWidth={3} opacity={0.18} />
      <line x1={-20} y1={930} x2={W + 20} y2={936} stroke={KRP.ink} strokeWidth={3} opacity={0.18} />
      {/* 演壇の台 */}
      <rect x={960} y={610} width={540} height={96} rx={8} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 最高指導者 (似顔絵にしない。黒ターバン+白髭+黒アバの装いで識別) */}
      <Person x={LX} y={LY} s={LS} cloth={SP.aba} clothDark={SP.aba} hair="none" face="worried"
        gaze={[0, 6 * bow]} lean={lean} f={f} still />
      <g transform={`translate(${LX} ${LY}) scale(${LS}) rotate(${lean})`}>
        {/* 下に着る衣 (髭と混ざらないよう灰色) */}
        <rect x={-18} y={-162} width={36} height={160} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {/* アバ (外套) の前身頃 */}
        <path d="M -10 -164 Q -56 -170 -64 -148 C -76 -106 -86 -52 -90 -2 L -20 -2 Q -28 -92 -16 -156 Z"
          fill={SP.aba} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 10 -164 Q 56 -170 64 -148 C 76 -106 86 -52 90 -2 L 20 -2 Q 28 -92 16 -156 Z"
          fill={SP.aba} stroke={KRP.ink} strokeWidth={5} />
        {/* 長い白髭 (下衣より手前。胸の途中まで) */}
        <path d="M -42 -204 Q -54 -158 -36 -128 Q -18 -108 0 -106 Q 18 -108 36 -128 Q 54 -158 42 -204 Q 22 -190 0 -190 Q -22 -190 -42 -204 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -9 -172 Q 0 -179 9 -172" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        {/* 黒ターバン (サイイドの印。白にしない): 丸い山 + 巻きのロール */}
        <ellipse cx={0} cy={-276} rx={62} ry={32} fill={SP.turban} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-68} y={-262} width={136} height={18} rx={9} fill={SP.turban} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -58 -254 Q 0 -262 58 -250" fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.55} />
        {/* 太い黒眉 (ターバンのすぐ下) */}
        <g stroke={SP.turban} strokeWidth={8} strokeLinecap="round">
          <line x1={-34} y1={-240} x2={-13} y2={-236} />
          <line x1={13} y1={-236} x2={34} y2={-240} />
        </g>
        {/* 振り上げていた拳の腕 (f で下りる) */}
        <g transform={`rotate(${armRot} -67 -148)`}>
          <rect x={-78} y={-148} width={22} height={82} rx={11} fill={SP.aba} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-67} cy={-54} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </g>
      {/* 演壇の手すりとマイク1本 (指導者の手前) */}
      <rect x={1000} y={475} width={460} height={22} rx={8} fill={SP.radioWood} stroke={KRP.ink} strokeWidth={5} />
      {[1025, 1145, 1300, 1420].map((px) => (
        <rect key={px} x={px} y={497} width={18} height={113} fill={SP.radioWood} stroke={KRP.ink} strokeWidth={4.5} />
      ))}
      <line x1={1118} y1={480} x2={1118} y2={400} stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={1118} cy={388} rx={16} ry={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 広場の群衆 (老若男女。何人かが顔を見合わせる) */}
      <CrowdMan x={170} y={1010} s={0.95} jacket={C.jacketBlue} f={f} phase={1} />
      <ChadorWoman x={335} y={1040} s={0.9} f={f} phase={2} rot={7} />
      <CrowdMan x={480} y={1030} s={0.92} jacket={C.jacketBrown} f={f} phase={3} rot={-7} />
      <PersonMini x={640} y={1020} s={0.58} color={KRP.blue} f={f} phase={4} />
      <CrowdMan x={800} y={1050} s={1} jacket={KRP.grayDark} f={f} phase={5} />
      <line x1={852} y1={972} x2={862} y2={1050} stroke={SP.radioWood} strokeWidth={7} strokeLinecap="round" />
      <CrowdMan x={1140} y={1068} s={1.05} jacket={C.jacketBrown} f={f} phase={9} rot={4} />
      <PersonMini x={1272} y={1062} s={0.6} color={KRP.green} f={f} phase={10} />
      <ChadorWoman x={1480} y={1040} s={0.9} f={f} phase={6} rot={6} />
      <CrowdMan x={1630} y={1020} s={0.9} jacket={C.jacketBlue} f={f} phase={7} rot={-6} />
      <ChadorWoman x={1790} y={1045} s={0.95} f={f} phase={8} />
      <TagPlate x={260} y={240} text="1988 テヘラン" size={44} t={seg(f, 4, 16)} />
    </Frame>
  );
};

// #7 (山) そのとき読み上げられた言葉が、「私は、毒の杯を飲み干した」。
// どこ: 杯に大きく寄る。背景はラジオと書面の暗示 (代読の種明かしはしない)
// 演出: DokuHai (共用部品) のクローズアップ。手が杯を傾けて干す。札「ジャーメ・ザフル」
// 動き: 杯が f で傾く・液面が減る・つやが揺れる
const S7: React.FC<{ f: number }> = ({ f }) => {
  const appear = seg(f, 2, 12);
  const tilt = -24 * easeOut(seg(f, 14, 40)); // 杯ごと傾く
  const drank = seg(f, 16, 42); // 液面が消えていく
  const GX = 840, GY = 935, GS = 2.15; // 杯の接地と大きさ (高さ≈645px)
  const PX = GX, PY = GY - 118; // 手が握る脚の位置 = 回転の軸
  return (
    <Frame f={f} seed={706} bg={KRP.cream} dark>
      {/* 暗めの室内 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.room} />
      <line x1={420} y1={-20} x2={420} y2={935} stroke={SP.sumi} strokeWidth={4} opacity={0.25} />
      <line x1={1640} y1={-20} x2={1640} y2={935} stroke={SP.sumi} strokeWidth={4} opacity={0.25} />
      {/* 杯へ落ちる明かり */}
      <ellipse cx={GX} cy={520} rx={560} ry={440} fill={KRP.cream} opacity={0.14} />
      {/* 机 */}
      <rect x={-20} y={935} width={W + 40} height={165} fill={SP.radioWoodDark} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-20} y1={1010} x2={W + 20} y2={1010} stroke={SP.sumi} strokeWidth={4} opacity={0.35} />
      {/* 片隅: 小さなラジオと書面 (暗示。読む人物は描かない) */}
      <g opacity={0.85}>
        <g transform="translate(215 935)">
          <rect x={-92} y={-132} width={184} height={132} rx={10} fill={SP.radioWood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-72} y={-112} width={92} height={92} rx={8} fill={SP.radioCloth} stroke={KRP.ink} strokeWidth={4} />
          {[-52, -32, -12].map((lx) => (
            <line key={lx} x1={lx} y1={-104} x2={lx} y2={-28} stroke={SP.radioWoodDark} strokeWidth={4} />
          ))}
          <circle cx={52} cy={-66} r={17} fill={SP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={52} cy={-66} r={4} fill={KRP.ink} />
        </g>
        <g transform="translate(440 928) rotate(-6)">
          <rect x={-72} y={-98} width={144} height={122} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[-72, -48, -24, 0].map((ly) => (
            <line key={ly} x1={-54} y1={ly} x2={54} y2={ly} stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.8} />
          ))}
        </g>
      </g>
      {/* 杯の影 (傾いた碗の下へ) */}
      <ellipse cx={GX - 120} cy={948} rx={300} ry={26} fill={SP.sumi} opacity={0.35} />
      {/* 主役: 毒杯 (手の位置を軸に f で傾く) */}
      <g transform={`rotate(${tilt} ${PX} ${PY})`}>
        <DokuHai x={GX} y={GY} s={GS} t={appear} f={f} poison />
        {/* 干されて消えていく液面 (空の内側の色をかぶせて減りを見せる) */}
        <g transform={`translate(${GX} ${GY}) scale(${GS * pop(clamp01(appear))})`}>
          <ellipse cx={0} cy={-258} rx={61} ry={11.5} fill={SP.brassDark} opacity={drank * 0.95} />
        </g>
      </g>
      {/* 袖 (黒いアバの布): 画面右下から脚へ。手前で止めて杯を貫かない */}
      <g transform="rotate(19 900 806)">
        <rect x={900} y={742} width={920} height={128} rx={62} fill={SP.aba} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 918 752 Q 900 806 920 860" fill="none" stroke={KRP.grayDark} strokeWidth={4} opacity={0.5} />
      </g>
      {/* 手 (指で脚を握る) */}
      <ellipse cx={822} cy={792} rx={16} ry={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5}
        transform="rotate(-24 822 792)" />
      <circle cx={856} cy={810} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <g fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" opacity={0.8}>
        <path d="M 822 794 Q 854 786 884 796" />
        <path d="M 818 810 Q 854 802 890 812" />
        <path d="M 822 826 Q 854 818 886 828" />
      </g>
      <TagPlate x={1470} y={300} text="ジャーメ・ザフル" size={40} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// #8 (図) 「一番強気だった人が、最後に負けを引き受けてる……」
// どこ: 直前 #7 の杯を背景に敷いた上に通知カード (図にも世界を敷く)
// 演出: KseNotify (over に渡す)。svg 側には #7 の杯を薄く・大きく残す
// 動き: カードのスライドイン・bob・まばたき (KseNotify が持っている)
const S8: React.FC<{ f: number }> = ({ f }) => (
  <Frame
    f={f}
    seed={707}
    bg={KRP.cream}
    over={<KseNotify f={f} t={seg(f, 6, 20)} text="一番強気だった人が、最後に負けを引き受けてる……" />}
  >
    {/* 世界: 机の縁と、#7 の杯を薄く大きく敷く (つやの shimmer が f で動き続ける) */}
    <rect x={-20} y={640} width={W + 40} height={H - 620} fill={KRP.floor} stroke={KRP.ink} strokeWidth={7} />
    <line x1={-20} y1={672} x2={W + 20} y2={672} stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
    {/* 机の小物 (世界の気配) */}
    <g transform="translate(320 770) rotate(5)" opacity={0.55}>
      <rect x={-120} y={-80} width={240} height={160} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {[-44, -12, 20, 52].map((ly) => (
        <line key={ly} x1={-92} y1={ly} x2={92} y2={ly} stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.8} />
      ))}
    </g>
    <g transform="translate(1560 740) rotate(-14)" opacity={0.6}>
      <rect x={-90} y={-9} width={180} height={18} rx={9} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
      <polygon points="90,-9 116,0 90,9" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* #7 の杯を画面中央に大きく薄く */}
    <g opacity={0.26} transform={`rotate(${Math.sin(f / 19) * 1.2} 960 700)`}>
      <DokuHai x={960} y={985} s={2.7} t={seg(f, 0, 10)} f={f} poison />
    </g>
    {/* カードの影になる床 */}
    <ellipse cx={960} cy={680} rx={610} ry={36} fill={KRP.ink} opacity={0.12 * seg(f, 6, 20)} />
  </Frame>
);

// #9 (図) そうです。戦争は、負ける側の誰かが「ここでやめる」と言わなければ、終わりません。
// どこ: 軍議の机の上 (真上から)。広げた紙の図
// 演出: 机上の地図めいた紙に対立の矢印が渦巻く。1人ぶんの駒の横に札「ここでやめる」が立って渦が止まる
// 動き: 矢印の渦が f で動き→札が立つと止まる
const S9: React.FC<{ f: number }> = ({ f }) => {
  const mapT = pop(clamp01(seg(f, 2, 14)));
  const stopT = easeOut(seg(f, 30, 42)); // 札が立つと渦が静まる
  // 渦の回転角: f=30 まで一定速 → 42 へ向けて減速 (後退しない積分形) → 以後は微速
  const spin = (() => {
    const base = Math.min(f, 30) * 2.6;
    if (f <= 30) return base;
    const u = Math.min(f - 30, 12);
    const slowed = 2.6 * (u - (0.92 * u * u) / 24);
    const tail = f > 42 ? (f - 42) * 2.6 * 0.08 : 0;
    return base + slowed + tail;
  })();
  const fade = 1 - 0.3 * stopT;
  return (
    <Frame f={f} seed={708} bg={KRP.floor}>
      {/* 世界: 真上から見た木の机の天板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.floor} />
      {[270, 540, 810].map((py) => (
        <line key={py} x1={-20} y1={py} x2={W + 20} y2={py + 6} stroke={SP.radioWood} strokeWidth={5} opacity={0.45} />
      ))}
      <path d="M -20 120 Q 480 150 960 128 Q 1460 110 1940 140" fill="none" stroke={SP.radioWood} strokeWidth={3} opacity={0.3} />
      <path d="M -20 420 Q 530 400 1080 424 Q 1560 442 1940 418" fill="none" stroke={SP.radioWood} strokeWidth={3} opacity={0.3} />
      <path d="M -20 960 Q 560 986 1180 962 Q 1620 946 1940 972" fill="none" stroke={SP.radioWood} strokeWidth={3} opacity={0.3} />
      {/* 広げた紙の図面 (縁が巻く・折り目) */}
      <g transform={`rotate(${-2 + Math.sin(f / 29) * 0.4} 960 540) translate(960 540) scale(${mapT}) translate(-960 -540)`}>
        <rect x={240} y={140} width={1440} height={800} rx={6} fill={C.paper} stroke={KRP.ink} strokeWidth={6} />
        <line x1={960} y1={146} x2={960} y2={934} stroke={KRP.ink} strokeWidth={4} opacity={0.16} />
        <line x1={246} y1={540} x2={1674} y2={540} stroke={KRP.ink} strokeWidth={4} opacity={0.16} />
        {/* 図面の中身: 川と点線の境と町 */}
        <path d="M 240 780 Q 620 710 920 830 Q 1220 930 1680 850" fill="none" stroke={KRP.blue} strokeWidth={10} opacity={0.5} />
        <path d="M 300 250 Q 700 430 960 390 Q 1300 340 1620 530" fill="none" stroke={KRP.ink} strokeWidth={5}
          strokeDasharray="22 16" opacity={0.4} />
        {[[620, 250], [1180, 240], [860, 640]].map(([tx, ty]) => (
          <rect key={tx} x={tx} y={ty} width={34} height={34} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        ))}
        {/* 巻いた縁 */}
        <path d="M 1680 940 L 1588 940 Q 1652 898 1680 858 Z" fill={C.paperShade} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 240 140 L 324 140 Q 262 178 240 216 Z" fill={C.paperShade} stroke={KRP.ink} strokeWidth={4} />
        {/* 赤と青の矢印の渦 (ぶつかり合い、札が立つと静まる) */}
        <g opacity={fade}>
          <g transform={`rotate(${spin} 960 540)`}>
            {[0, 90, 180, 270].map((a, i) => (
              <g key={a} transform={`rotate(${a} 960 540)`}>
                <Arrow x={1200} y={540} s={1.7} rot={90} t={seg(f, 6 + i * 2, 18 + i * 2)} color={KRP.red} />
              </g>
            ))}
          </g>
          <g transform={`rotate(${-spin * 0.85} 960 540)`}>
            {[45, 135, 225, 315].map((a, i) => (
              <g key={a} transform={`rotate(${a} 960 540)`}>
                <Arrow x={1310} y={540} s={1.7} rot={-90} t={seg(f, 8 + i * 2, 20 + i * 2)} color={KRP.blueDeep} />
              </g>
            ))}
          </g>
        </g>
        {/* 木の駒 */}
        <Koma x={430} y={330} rot={-14} t={seg(f, 12, 24)} side="red" />
        <Koma x={390} y={620} rot={8} t={seg(f, 14, 26)} side="red" />
        <Koma x={540} y={830} rot={-5} t={seg(f, 16, 28)} side="red" />
        <Koma x={1500} y={320} rot={12} t={seg(f, 13, 25)} side="blue" />
        <Koma x={1560} y={580} rot={-9} t={seg(f, 15, 27)} side="blue" />
        {/* 「ここでやめる」と言う側の駒 (札が立つと少し傾く) */}
        <g transform={`rotate(${26 * stopT} 1420 720)`}>
          <Koma x={1420} y={720} rot={4} t={seg(f, 17, 29)} side="blue" />
        </g>
        <line x1={1420} y1={636} x2={1420} y2={678} stroke={KRP.ink} strokeWidth={6} opacity={seg(f, 30, 36)} />
        <TagPlate x={1420} y={600} text="ここでやめる" size={44} t={seg(f, 30, 42)} rot={-2} />
      </g>
    </Frame>
  );
};

// ===================================================================
// 対応表 (変えない)
// ===================================================================
export const KSE_B_SCENES: Record<string, (f: number) => React.ReactElement> = {
  ksb_khomeini_teisen: (f) => <S6 f={f} />,
  ksb_doku_no_hai: (f) => <S7 f={f} />,
  ksb_notify_tsuyoki: (f) => <S8 f={f} />,
  ksb_yameru_to_iu: (f) => <S9 f={f} />,
};
