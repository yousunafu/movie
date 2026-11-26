// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#193〜#203 (11文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell,
  Flame, skyColors, mixColor, SHUDOUIN_BEDS, TOKI_ROPE, MACHI_WIN,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  bus: "#EDEBE2", busStripe: "#3F8F7A", busLow: "#2F6F5E", glass: "#9FC3D6", glassDark: "#5E7F95",
  navy: "#24365E", navyDark: "#17233F", jacket: "#E58A3A", jacketDark: "#B9652A",
  road: "#8E8C93", roadLight: "#A9A7AE", curb: "#C9C3B6", walk: "#D8D0C0", leaf: "#6E9E62", leafDark: "#4E7A48",
  cork: "#C79B62", corkDark: "#A97E48", frame: "#8A5A34", string: "#C8372B",
  pink: "#F2C4C6", pinkDark: "#E3A3A9", pinkDeep: "#C97B8A", flesh: "#E8B3A0",
  indigo: "#2F4A7A", indigoDark: "#1F3358", coat: "#1E1E22", gray: "#9A9EA6", grayDark2: "#6E727A",
  paper: "#EFE3C6", paperDark: "#D9C9A4", table: "#8A5E3B", cloud: "#E8C770", cloudDark: "#C9A64A",
  red: "#B8322A", redDark: "#86221C", robe: "#3F6B5A", robeDark: "#2C4E41",
  vest: "#5A4636", skirt: "#8E2F3E", skirtDark: "#6A2230", apron: "#F1EADF", brown: "#7A5638",
  loco: "#2B2B30", locoRed: "#B8322A", stoneW: "#D9D4C8",
} as const;
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void MP; void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky; void NazoBell;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;
void Flame; void skyColors; void mixColor; void SHUDOUIN_BEDS; void TOKI_ROPE; void MACHI_WIN;

// Person と同じゆれ
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;
// Person と同じ座標系 (足元原点・s 倍) で描き足す
const MzJOn: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number; still?: boolean; flip?: boolean; children?: React.ReactNode }> = ({ x, y, s, f, phase = 0, lean = 0, still = false, flip = false, children }) => (
  <g transform={`translate(${x} ${y + (still ? 0 : bobOf(f, phase))}) scale(${flip ? -s : s} ${s}) rotate(${lean})`}>{children}</g>
);
// カメラ: (cx,cy) を画面の中心にして k 倍
const cam = (k: number, cx: number, cy: number) => `translate(960 540) scale(${k}) translate(${-cx} ${-cy})`;
// 空を横じまで塗る
const MzJSky: React.FC<{ x: number; y: number; w: number; h: number; sky: number; n?: number }> = ({ x, y, w, h, sky, n = 12 }) => {
  const [t, b] = skyColors(sky);
  return <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={y + (h / n) * i - 0.5} width={w} height={h / n + 1} fill={mixColor(t, b, i / (n - 1))} />)}</g>;
};
// 閉じた目 (寝ている顔に重ねる。Person の座標系)
const MzJSleepEyes: React.FC = () => (
  <g>
    <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
    <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
    <path d="M -36 -220 Q -24 -210 -12 -220 M 12 -220 Q 24 -210 36 -220" stroke={KRP.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  </g>
);
// 大きく開けた口 (Person の座標系)
const MzJMouth: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <g>
    <ellipse cx={0} cy={-184} rx={20 * o + 6} ry={16 * o + 4} fill={KRP.ink} />
    <ellipse cx={0} cy={-176 + 2 * o} rx={11 * o + 3} ry={6 * o + 2} fill="#D9655A" />
  </g>
);
// 寝そべった人 (足元 x,y。headLeft で頭が左)。頭の中心 = (x ∓ 228s, y)
const MzJLying: React.FC<{ x: number; y: number; s: number; f: number; cloth: string; clothDark: string; hair?: "cap" | "none"; phase?: number; headLeft?: boolean; extra?: React.ReactNode; under?: React.ReactNode; blanket?: string }> = ({ x, y, s, f, cloth, clothDark, hair = "cap", phase = 0, headLeft = true, extra, under, blanket }) => {
  const br = Math.sin((f + phase * 9) / 18) * 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${headLeft ? -90 : 90})`}>
      {under && <g transform={`scale(${s})`}>{under}</g>}
      <Person x={0} y={0} s={s} f={0} still cloth={cloth} clothDark={clothDark} hair={hair} />
      <g transform={`scale(${s})`}>
        <MzJSleepEyes />
        {extra}
        {blanket && <rect x={-66} y={-170 + br} width={132} height={176} rx={22} fill={blanket} stroke={KRP.ink} strokeWidth={5} />}
      </g>
    </g>
  );
};
// 修道士 (男性とひと目で分かる姿): 頭巾は頭にかぶせず首の後ろに下ろした黒い U 字のえり・縄の帯
//   若い (old なし): Person hair="cap" の短い黒髪 + 頭のてっぺんのトンスラ (剃った肌色の円) + 太い眉
//   年上 (old): Person hair="none" のはげ頭 + 耳の上の白髪 + 大きな白ひげ + 白い太眉 + 少し太め
//   cross: 首から十字架 (修道院長)
const MzJMonkWear: React.FC<{ old?: boolean; cross?: boolean }> = ({ old, cross }) => (
  <g>
    {old && <ellipse cx={0} cy={-104} rx={66} ry={52} fill={MP.habit} stroke={KRP.ink} strokeWidth={5} />}
    <path d="M -58 -78 Q 0 -66 58 -78" stroke="#C9A877" strokeWidth={7} fill="none" />
    <path d="M 18 -72 L 22 -30 M 26 -72 L 34 -36" stroke="#C9A877" strokeWidth={5} strokeLinecap="round" />
    {/* 首の後ろに下ろした頭巾 (U 字のえり) */}
    <path d="M -80 -176 Q -92 -124 -50 -112 Q 0 -98 50 -112 Q 92 -124 80 -176 Q 52 -150 0 -146 Q -52 -150 -80 -176 Z"
      fill={MP.habit} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -60 -150 Q 0 -126 60 -150" stroke={MP.habitMid} strokeWidth={5} fill="none" strokeLinecap="round" />
    {!old && <MzJTonsure />}
    {old && <g>
      {/* 耳の上に少しだけ残った白髪 */}
      {[-1, 1].map((d) => <path key={d} d={`M ${d * 58} -270 Q ${d * 80} -262 ${d * 76} -242 Q ${d * 84} -230 ${d * 72} -218 Q ${d * 64} -240 ${d * 58} -270 Z`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />)}
      {/* はげ頭のつや */}
      <path d="M -30 -286 Q -12 -298 8 -296" stroke={KRP.ink} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.35} />
      <path d="M -46 -196 Q -44 -136 0 -124 Q 44 -136 46 -196 Q 22 -178 0 -180 Q -22 -178 -46 -196 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -40 -254 L -12 -249 M 12 -249 L 40 -254" stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
      <path d="M -40 -254 L -12 -249 M 12 -249 L 40 -254" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" />
    </g>}
    {cross && <g><path d="M -20 -160 Q 0 -128 20 -160" stroke={MP.brassDark} strokeWidth={3} fill="none" /><rect x={-4} y={-136} width={8} height={30} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} /><rect x={-12} y={-128} width={24} height={7} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} /></g>}
  </g>
);
// 若い修道士の頭: トンスラ (頭のてっぺんの剃った円) + 太い眉 (Person hair="cap" の上に)
const MzJTonsure: React.FC<{ brows?: boolean }> = ({ brows = true }) => (
  <g>
    {brows ? <ellipse cx={0} cy={-290} rx={25} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      : <ellipse cx={0} cy={-284} rx={26} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />}
    {brows && <path d="M -42 -256 L -12 -251 M 12 -251 L 42 -256" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />}
  </g>
);
// 寝ている修道士: 枕の上に下ろした頭巾 (MzJLying の under に。頭の下に敷く)
const MzJMonkHoodPillow: React.FC = () => (
  <g>
    <ellipse cx={0} cy={-168} rx={94} ry={36} fill={MP.habit} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -60 -186 Q 0 -170 60 -186" stroke={MP.habitMid} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
// ちょんまげ (Person の座標系。髪 cap の上に)
const MzJMage: React.FC = () => (
  <g>
    <path d="M -46 -276 Q 0 -300 46 -276 Q 0 -286 -46 -276 Z" fill="#E9D8C4" />
    <path d="M -10 -290 Q 0 -332 34 -318 Q 14 -306 10 -290 Z" fill={KRP.ink} />
    <rect x={-8} y={-298} width={16} height={10} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
  </g>
);
// 半纏 (胴の上)
const MzJHanten: React.FC = () => (
  <g>
    <rect x={-58} y={-160} width={116} height={108} rx={16} fill={C.indigo} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -22 -160 L -8 -52 M 22 -160 L 8 -52" stroke={KRP.ink} strokeWidth={14} />
    <path d="M -22 -160 L -8 -52 M 22 -160 L 8 -52" stroke="#E9E2CF" strokeWidth={8} />
    <path d="M -50 -96 L 50 -96" stroke="#E9E2CF" strokeWidth={4} strokeDasharray="8 8" />
  </g>
);
// 鍔つき帽子 (運転手・駅長)
const MzJCap: React.FC<{ color: string; band?: string; dir?: 1 | -1 }> = ({ color, band = MP.brass, dir = 1 }) => (
  <g>
    <path d="M -62 -262 Q -62 -318 0 -320 Q 62 -318 62 -262 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-62} y={-276} width={124} height={14} fill={band} stroke={KRP.ink} strokeWidth={3} />
    <path d={`M ${-40 * dir} -262 Q ${30 * dir} -270 ${84 * dir} -250 L ${60 * dir} -258 Z`} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-296} r={8} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} />
  </g>
);
// ハンチング帽 (工場の男)
const MzJFlatCap: React.FC = () => (
  <g>
    <path d="M -64 -256 Q -62 -304 4 -306 Q 66 -302 66 -258 Z" fill={C.grayDark2} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 20 -262 Q 70 -268 96 -252 Q 70 -246 30 -252 Z" fill={C.grayDark2} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
// 昔の女性: ボンネット帽・髪の房・くるぶしまでのスカートとエプロン (Person の座標系。スカートは脚の上に)
const MzJOldWoman: React.FC<{ part: "back" | "front" }> = ({ part }) => part === "back" ? (
  <g>
    <path d="M -66 -232 Q -86 -150 -70 -120 L -48 -130 Q -58 -180 -52 -230 Z" fill="#8A5A34" stroke={KRP.ink} strokeWidth={4} />
    <path d="M 66 -232 Q 86 -150 70 -120 L 48 -130 Q 58 -180 52 -230 Z" fill="#8A5A34" stroke={KRP.ink} strokeWidth={4} />
  </g>
) : (
  <g>
    <path d="M -54 -70 L -92 -2 L 92 -2 L 54 -70 Z" fill={C.skirt} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 -70 L -40 -10 L 40 -10 L 30 -70 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -70 -246 Q -70 -312 0 -314 Q 70 -312 70 -246 Q 40 -268 0 -268 Q -40 -268 -70 -246 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -64 -250 Q -40 -278 0 -278 Q 40 -278 64 -250" stroke={C.skirt} strokeWidth={6} fill="none" />
  </g>
);
// 鶏人の衣装: 赤い頭巾・とさかの冠 (Person の座標系)
const MzJKeijin: React.FC = () => (
  <g>
    <path fillRule="evenodd" d="M -80 -230 A 80 84 0 1 1 80 -230 L 66 -160 L -66 -160 Z M -52 -222 A 52 58 0 1 0 52 -222 A 52 58 0 1 0 -52 -222 Z" fill={C.red} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -44 -300 Q -48 -350 -24 -318 Q -16 -366 4 -322 Q 18 -364 30 -318 Q 50 -346 46 -298 Z" fill={MP.bell} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-50} y={-310} width={100} height={18} rx={6} fill={C.redDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #193 この時計は、同じ年、イグノーベル賞の、経済学賞をもらいました。
// 格: 並 / seed 6193
// 絵: どこ: 2005年の大学の講堂の舞台 (木の床・幕・演台・客席の頭の影・天井のライト)。年代札「2005年」と小札「経済学賞」。演出: 演台の上に Clocky (run=0, face="smile") がちょこんと乗り、首に大きなメダル (金色の丸。賞の名前やマークは描かず、時計の絵柄だけ) がかけられる。メダルの重みで Clocky が前にかくっとつんのめる。客席から拍手のしるし。作った大学院生は描かない (舞台の袖に赤いカーディガンの袖口がちらりと見えるだけ)。Clocky が嬉しさのあまり車輪で演台の上をくるりと一回転し、落ちそうになってぎりぎりで止まる。動き: f0-30 カメラが客席の後ろから舞台へ寄る / f30-60 メダルがかけられる・かくっ / f60-100 拍手 / f100-140 くるりと回って端でぎりぎり止まる
// どこ: 2005年の大学の講堂の舞台 (赤い幕・木の床・演台・天井のスポットライト・手前に客席の頭)
// 演出: 演台の Clocky に、上から金のメダル (時計の絵柄だけ) が下りてきてかけられ、重みでかくっとつんのめる。
//       客席から拍手、袖から赤いカーディガンの袖口だけが拍手。嬉しさでくるりと一回転 → 演台の端でぎりぎり止まる
// 動き: f0-30 客席の後ろから舞台へ寄る / f24-38 メダルが下りる / f38-48 かくっ / f40-100 拍手 / f100-128 くるり / f128- 端でぐらぐら
const Mz193: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.12, easeOut(seg(f, 0, 30)));
  const drop = easeOut(seg(f, 24, 38));
  const kak = f >= 38 ? Math.sin(Math.PI * seg(f, 38, 48)) * 9 + 3 : 0;
  const spinT = seg(f, 100, 128);
  const cx = lerp(960, 1140, easeInOut(spinT));
  const spinDeg = easeInOut(spinT) * 360;
  const edge = f >= 128;
  const teeter = edge ? Math.sin((f - 128) / 2.6) * 16 * Math.exp(-(f - 128) / 22) + 6 : 0;
  const CS = 1.05, TOP = 600;
  const cy = TOP - 92 * CS;
  const clap = f >= 40 && f < 110;
  const tex = (f: number) => Math.floor(f / 5) % 2;
  return (
    <Frame f={f} seed={6193} bg="#2A2234">
      <g transform={`translate(960 500) scale(${k}) translate(-960 -500)`}>
        {/* 奥の幕 (赤いひだ) */}
        <rect x={-80} y={-40} width={2080} height={700} fill="#8E2A33" />
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M ${-80 + i * 82} -40 Q ${-40 + i * 82 + Math.sin(f / 30 + i) * 4} 300 ${-80 + i * 82} 660`} stroke="#6E1E26" strokeWidth={22} fill="none" />
        ))}
        {/* 上の飾り幕と天井のライト */}
        <path d="M -80 -40 L 2000 -40 L 2000 90 Q 1740 150 1480 90 Q 1220 150 960 90 Q 700 150 440 90 Q 180 150 -80 90 Z" fill="#A8323A" stroke={KRP.ink} strokeWidth={6} />
        <path d="M -80 80 Q 180 140 440 80 Q 700 140 960 80 Q 1220 140 1480 80 Q 1740 140 2000 80" stroke={MP.brass} strokeWidth={8} fill="none" />
        {[560, 960, 1360].map((lx, i) => (
          <g key={lx}>
            <polygon points={`${lx - 20},120 ${lx + 20},120 ${(i === 1 ? cx : lx) + 260},${TOP + 40} ${(i === 1 ? cx : lx) - 260},${TOP + 40}`} fill="#FFF3C8" opacity={i === 1 ? 0.22 : 0.08} />
            <rect x={lx - 26} y={96} width={52} height={36} rx={8} fill={MP.iron} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 左右の袖幕 */}
        <path d="M -80 -40 L 300 -40 Q 260 300 330 680 L -80 680 Z" fill="#A8323A" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 2000 -40 L 1620 -40 Q 1660 300 1590 680 L 2000 680 Z" fill="#A8323A" stroke={KRP.ink} strokeWidth={6} />
        {[60, 160, 250].map((px) => <path key={px} d={`M ${px} -40 Q ${px - 20} 300 ${px + 20} 680`} stroke="#7E2129" strokeWidth={10} fill="none" />)}
        {/* 袖からのぞく赤いカーディガンの袖口 (拍手) */}
        {f >= 40 && (
          <g transform={`translate(${318 + tex(f) * 6} 470)`}>
            <path d="M -40 -20 L 30 -26 L 34 10 L -40 16 Z" fill="#D2423E" stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((j) => <line key={j} x1={-30 + j * 20} y1={-22} x2={-30 + j * 20} y2={12} stroke="#A8322E" strokeWidth={3} />)}
            <circle cx={44} cy={-4} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 舞台の木の床 */}
        <rect x={-80} y={660} width={2080} height={200} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-80} y1={700 + i * 40} x2={2000} y2={700 + i * 40} stroke={MP.wood} strokeWidth={4} />)}
        <rect x={-80} y={850} width={2080} height={40} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 演台 */}
        <path d={`M 700 ${TOP} L 1220 ${TOP} L 1190 860 L 730 860 Z`} fill={MP.wood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={680} y={TOP - 16} width={560} height={28} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={800} y={660} width={320} height={130} rx={10} fill="none" stroke={MP.woodDark} strokeWidth={6} />
        <path d="M 820 720 Q 960 690 1100 720" stroke={MP.brass} strokeWidth={6} fill="none" />
        {/* マイク */}
        <path d="M 720 584 Q 700 470 760 440" stroke={KRP.ink} strokeWidth={6} fill="none" />
        <ellipse cx={766} cy={436} rx={14} ry={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(30 766 436)" />
        {/* Clocky (メダルつき)。くるり・ぐらぐら */}
        <g transform={`rotate(${kak + teeter} ${edge ? 1220 : cx} ${TOP})`}>
          <g transform={`rotate(${spinDeg} ${cx} ${cy})`}>
            <Clocky x={cx} y={cy} s={CS} f={f} run={spinT > 0 && spinT < 1 ? 0.8 : 0} face={kak > 8 || (edge && teeter > 10) ? "surprised" : "smirk"} />
            {/* メダルとリボン */}
            <g transform={`translate(0 ${lerp(-560, 0, drop)})`}>
              <path d={`M ${cx - 70} ${cy - 70} L ${cx - 10} ${cy + 64} M ${cx + 70} ${cy - 70} L ${cx + 10} ${cy + 64}`} stroke={KRP.ink} strokeWidth={22} />
              <path d={`M ${cx - 70} ${cy - 70} L ${cx - 10} ${cy + 64}`} stroke="#3F6FB6" strokeWidth={14} />
              <path d={`M ${cx + 70} ${cy - 70} L ${cx + 10} ${cy + 64}`} stroke="#D8432F" strokeWidth={14} />
              <circle cx={cx} cy={cy + 100} r={52} fill={MP.brass} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={cx} cy={cy + 100} r={38} fill={MP.brassLight} stroke={MP.brassDark} strokeWidth={4} />
              <line x1={cx} y1={cy + 100} x2={cx} y2={cy + 74} stroke={MP.brassDark} strokeWidth={6} strokeLinecap="round" />
              <line x1={cx} y1={cy + 100} x2={cx + 18} y2={cy + 108} stroke={MP.brassDark} strokeWidth={6} strokeLinecap="round" />
              <path d={`M ${cx - 30} ${cy + 80} Q ${cx - 20} ${cy + 66} ${cx - 4} ${cy + 64}`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.7} />
            </g>
          </g>
        </g>
        {edge && <path d={`M 1290 ${cy - 120 + Math.sin(f / 5) * 3} q 8 14 0 22 q -8 -8 0 -22 Z`} fill="#9FD0EE" stroke={KRP.ink} strokeWidth={3} />}
        {/* 札 */}
        <TagPlate x={560} y={230} text="2005年" size={44} t={seg(f, 6, 16)} />
        <TagPlate x={1360} y={230} text="経済学賞" size={40} t={seg(f, 10, 20)} color={MP.brassDark} />
        {/* 客席の頭 (手前の影) と拍手 */}
        {Array.from({ length: 13 }, (_, i) => {
          const hx = -40 + i * 165 + (i % 2) * 40, hy = 960 + (i % 3) * 30;
          return (
            <g key={i}>
              <ellipse cx={hx} cy={hy + 120} rx={110} ry={90} fill="#1E1826" />
              <circle cx={hx} cy={hy} r={62} fill="#2A2234" stroke="#120E18" strokeWidth={5} />
              {clap && (i + tex(f)) % 3 === 0 && [0, 1, 2].map((j) => (
                <line key={j} x1={hx + (j - 1) * 26} y1={hy - 84} x2={hx + (j - 1) * 40} y2={hy - 116} stroke={MP.glow} strokeWidth={6} strokeLinecap="round" />
              ))}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #194 人をちゃんと起こして、働く時間を増やしたから、だそうです。
// 格: 図 / seed 6194
// 絵: どこ: 現代の会社のオフィスの壁 (ホワイトボード・タイムカードの機械・観葉植物・窓の外の朝の街)。演出: ホワイトボードに手描きの1日の時間の横長の帯。帯の中で「寝ている時間」の青い部分が、Clocky の絵のしるしが走ってくると右から少しずつ削られていき、そのぶん「働く時間」の橙の部分が伸びる (数字の札は付けない)。横で、タイムカードの機械に、目がばっちり開いたままのくたびれた会社員の男性 (紺のスーツ・短い黒髪・ネクタイが曲がっている・頭に寝ぐせ) がカードをガチャンと差し込み、その足もとに Clocky がまとわりついている。会社員は真顔で、目の下にうっすらクマ (face="worried")。動き: f0-30 カメラがホワイトボードへ寄る / f30-100 青い部分が削れて橙が伸びる / f100-120 カードをガチャン / f120-150 足もとの Clocky がくるくる
// どこ: 現代の会社のオフィスの壁 (ホワイトボード・タイムカードの機械・観葉植物・窓の外の朝の街)
// 演出: ホワイトボードの手描きの1日の帯。小さな Clocky のしるしが走ってきて、青い「寝る時間」を削り、橙の「働く時間」が伸びる (数字なし)。
//       右で、目がばっちり開いたくたびれた会社員がカードをガチャン。足もとに Clocky がまとわりつく
// 動き: f0-20 ボードへ寄る / f8-38 青が削れて橙が伸びる / f34-40 カードをガチャン / f40- 足もとの Clocky がくるくる
const Mz194: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.06, easeOut(seg(f, 0, 20)));
  const p = easeInOut(seg(f, 8, 38));
  const BX0 = 300, BX1 = 1180, BY = 330, BH = 110;
  const b = lerp(780, 560, p);
  const card = easeOut(seg(f, 30, 38));
  const punch = f >= 38 ? pop(seg(f, 38, 44)) : 0;
  const run = f >= 40;
  const ca = (f - 40) / 9;
  const ckx = run ? 1600 + Math.cos(ca) * 150 : lerp(1900, 1500, seg(f, 20, 40));
  const cky = run ? 880 + Math.sin(ca) * 18 : 880;
  const cdir: 1 | -1 = run ? (Math.sin(ca) > 0 ? -1 : 1) : -1;
  const WX = 1600, WYp = 900, WS = 0.95;
  return (
    <Frame f={f} seed={6194} bg="#E4E1D8">
      <g transform={`translate(760 480) scale(${k}) translate(-760 -480)`}>
        {/* 壁と床 */}
        <rect x={-40} y={-40} width={2000} height={880} fill="#E4E1D8" />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={i * 100} y1={-40} x2={i * 100} y2={840} stroke="#D6D2C6" strokeWidth={3} />)}
        <rect x={-40} y={830} width={2000} height={300} fill="#9AA1A8" />
        <rect x={-40} y={818} width={2000} height={20} fill="#C9CCCF" stroke={KRP.ink} strokeWidth={4} />
        {/* 窓の外の朝の街 */}
        <rect x={1360} y={70} width={520} height={440} fill="#F5F3EE" stroke={KRP.ink} strokeWidth={7} />
        <MzJSky x={1380} y={90} w={480} h={400} sky={1.8} n={10} />
        {[[1390, 260, 90], [1490, 200, 70], [1570, 300, 110], [1690, 230, 80], [1780, 280, 80]].map(([bx, by, bw], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={490 - by} fill={mixColor("#8EA4BC", "#C9D6E2", i % 2 ? 0.4 : 0)} stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 5 }, (_, j) => <rect key={j} x={bx + 12} y={by + 20 + j * 40} width={bw - 24} height={10} fill={KRP.white} opacity={0.5} />)}
          </g>
        ))}
        <circle cx={1820} cy={140} r={34} fill="#FFF1B8" />
        <rect x={1610} y={70} width={14} height={440} fill="#F5F3EE" stroke={KRP.ink} strokeWidth={4} />
        {/* ホワイトボード */}
        <rect x={190} y={110} width={1100} height={560} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={8} />
        <rect x={210} y={130} width={1060} height={520} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 240 160 L 420 150" stroke="#D6DCE2" strokeWidth={10} opacity={0.7} />
        <rect x={420} y={670} width={640} height={20} rx={4} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {[["#2F6FB6", 480], [MP.bell, 540], ["#2E8B57", 600]].map(([mc, mx]) => <rect key={mx as number} x={mx as number} y={656} width={46} height={16} rx={6} fill={mc as string} stroke={KRP.ink} strokeWidth={3} />)}
        {[[230, 150], [1250, 150]].map(([mx, my]) => <circle key={mx} cx={mx} cy={my} r={12} fill={MP.bell} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 1日の帯 (手描き)。左=寝る(青)、右=働く(橙)。青が右から削られ、橙が左へ伸びる */}
        <rect x={BX0} y={BY} width={b - BX0} height={BH} fill={KRP.blueDeep} opacity={0.8} />
        <rect x={b} y={BY} width={BX1 - b} height={BH} fill={KRP.orange} opacity={0.85} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={BX0 + 10 + i * 40} y1={BY + 6} x2={BX0 + 30 + i * 40} y2={BY + BH - 6} stroke="#3A5E98" strokeWidth={4} opacity={BX0 + 30 + i * 40 < b ? 0.6 : 0} />)}
        <path d={`M ${BX0} ${BY} L ${BX1} ${BY + 2} L ${BX1 - 2} ${BY + BH} L ${BX0 + 2} ${BY + BH - 2} Z`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <line x1={b} y1={BY - 10} x2={b} y2={BY + BH + 10} stroke={KRP.ink} strokeWidth={5} />
        {/* 削りかす */}
        {p > 0 && p < 1 && [0, 1, 2, 3].map((j) => {
          const t = ((f / 6 + j / 4) % 1);
          return <rect key={j} x={b - 20 - t * 60} y={BY + BH + t * 40} width={12} height={8} fill={KRP.blueDeep} opacity={1 - t} transform={`rotate(${t * 200} ${b - 20 - t * 60} ${BY + BH + t * 40})`} />;
        })}
        {/* 帯の上のしるし (手描き): 太陽とかばん / 月と枕 */}
        <g stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle cx={1030} cy={260} r={26} fill={KRP.yellow} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={1030} y1={222} x2={1030} y2={208} transform={`rotate(${i * 45} 1030 260)`} />)}
          <rect x={1080} y={240} width={64} height={46} rx={6} fill={MP.woodLight} />
          <path d="M 1100 240 L 1100 228 L 1124 228 L 1124 240" />
          <path d="M 360 238 A 28 28 0 1 0 392 280 A 22 22 0 1 1 360 238 Z" fill="#F3E3A0" />
          <rect x={410} y={256} width={60} height={28} rx={12} fill={KRP.white} />
        </g>
        {/* 帯を削りながら走る小さな Clocky のしるし */}
        <Clocky x={b + 4} y={BY - 40} s={0.32} f={f} run={p > 0 && p < 1 ? 1 : 0} dir={-1} face="smirk" />
        {/* 観葉植物 */}
        <g transform={`rotate(${Math.sin(f / 40) * 1.5} 120 830)`}>
          <path d="M 70 830 L 60 730 L 180 730 L 170 830 Z" fill="#C46F4A" stroke={KRP.ink} strokeWidth={6} />
          {[-40, -20, 0, 20, 40].map((a, i) => <ellipse key={i} cx={120} cy={640} rx={22} ry={86} fill={i % 2 ? C.leaf : C.leafDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${a} 120 730)`} />)}
        </g>
        {/* タイムカードの機械 (台の上) */}
        <g>
          <rect x={1340} y={760} width={130} height={70} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1320} y={560} width={170} height={200} rx={14} fill="#D9D4C8" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1405} cy={630} r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={1405} y1={630} x2={1405} y2={598} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={1405} y1={630} x2={1428} y2={640} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <rect x={1350} y={700} width={110} height={14} rx={4} fill={KRP.ink} />
        </g>
        {/* カード (手から差しこみ口へ) */}
        <g transform={`translate(${lerp(1455, 1405, card)} ${lerp(760, 708 + 20 * card, card)}) rotate(${lerp(-20, -90, card)})`}>
          <rect x={-16} y={-36} width={32} height={72} fill="#F3EBD8" stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={-8} y1={-22} x2={8} y2={-22} stroke={KRP.grayDark} strokeWidth={2} />
        </g>
        {punch > 0 && f < 56 && <g transform={`translate(1300 560) rotate(-10) scale(${punch})`} opacity={1 - seg(f, 48, 56)}>
          <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} paintOrder="stroke">ガチャン!</text>
        </g>}
        {/* くたびれた会社員 (目はばっちり・クマ・曲がったネクタイ・寝ぐせ) */}
        <Person x={WX} y={WYp} s={WS} f={f} pose="point" pointDir={-1} face="worried" cloth={C.navy} clothDark={C.navyDark} hair="cap" gaze={[-3, 0]} />
        <MzJOn x={WX} y={WYp} s={WS} f={f}>
          <path d="M -36 -200 Q -24 -194 -12 -200 M 12 -200 Q 24 -194 36 -200" stroke="#9C8AA6" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -18 -296 L -26 -326 L -6 -300 M 8 -298 L 14 -334 L 22 -298 M 30 -290 L 50 -318 L 44 -286" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -16 -160 L 16 -160 L 8 -150 L -8 -150 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -6 -150 L 6 -150 L 22 -96 L 12 -86 Z" fill={MP.bell} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(14 0 -150)" />
        </MzJOn>
        {/* 足もとにまとわりつく Clocky */}
        <Clocky x={ckx} y={cky} s={0.42} f={f} run={1} dir={cdir} face="smirk" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #195 窓を叩いていたノッカー・アップが、車輪をつけて、部屋の中まで入ってきたようなものです。
// 格: 山 / seed 6195
// 絵: どこ: MachiNami (sky=夜明け前) の2階の窓の内側、19世紀イギリスの労働者の寝室 (木のベッド・ろうそく・洗面器・れんがの壁)。窓の外にはノッカー・アップがいるはずの石畳とガス灯。演出: 窓ガラスの外で KnockerUp (pose="knock") がいつものように棒でコンコン → 次の瞬間、ノッカー・アップの足もとに大きな車輪が2つ「ガシャン」と生える (Clocky と同じ形の車輪)。そのまま窓をガラッと開けて部屋の中へ車輪で乗り込んできて、ベッドのまわりをぐるぐる走り回りながら棒で寝ている男性 (短い黒髪・灰色の寝間着) をつつく。男性が飛び起きて (face="surprised") 逃げ回る。ノッカー・アップは顔だけ Clocky と同じ得意げな目になる。ろうそくの火が風でゆれる。動き: f0-30 窓の外でノック / f30-50 車輪が生える / f50-80 窓を開けて乗り込む / f80-150 ベッドのまわりをぐるぐる (カメラが少し上から追う)・男性が飛び起きて逃げる
// どこ: 19世紀イギリスの労働者の寝室 (れんがの壁・木のベッド・ろうそく・洗面器)。窓の外に向かいの長屋 (MachiNami) とガス灯
// 演出: 窓の外から棒でコンコン → 足もとに Clocky と同じ車輪が「ガシャン」と生えて窓の高さまで上がってくる →
//       窓を開けて車輪で乗りこみ、ベッドのまわりをぐるぐる回りながら棒で男性をつつく。男性は飛び起きて逃げ回る。ろうそくの火が風でゆれる
// 動き: f0-14 ノック / f14-24 車輪が生えて上がる / f22-26 窓が開く / f24-36 乗りこむ / f30 男性が飛び起きる / f36- ぐるぐる (カメラが追う)
const MzJWheel: React.FC<{ x: number; y: number; s: number; spin: number; front?: boolean }> = ({ x, y, s, spin, front }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={86} fill="#3C3A3E" stroke={KRP.ink} strokeWidth={7} />
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-8} y={-92} width={16} height={14} rx={3} fill="#2A282C" stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${i * 22.5 + spin})`} />)}
    <circle r={58} fill={front ? "#F0A63A" : "#C98629"} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={0} y1={0} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${k * 72 + spin})`} />)}
    <circle r={16} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
// Clocky と同じ得意げな目 (Person の座標系)
const MzJSmirkEyes: React.FC = () => (
  <g>
    <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
    <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
    <path d="M -40 -218 Q -26 -232 -10 -218 L -10 -208 L -40 -208 Z M 10 -218 Q 26 -232 40 -218 L 40 -208 L 10 -208 Z" fill={KRP.ink} />
    <path d="M -20 -182 Q 2 -170 24 -188" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
const Mz195: React.FC<{ f: number }> = ({ f }) => {
  const WX0 = 760, WY0 = 90, WW = 400, WH = 370;
  const rise = easeOut(seg(f, 14, 24));
  const sprout = pop(seg(f, 14, 20));
  const winOpen = easeOut(seg(f, 22, 26));
  const enter = seg(f, 24, 36);
  const inside = f >= 24;
  const ECX = 960, ECY = 760, RX = 480, RY = 150;
  const thK = 0.2 + Math.max(0, f - 36) * 0.075;
  const thM = 0.2 + Math.max(0, f - 36) * 0.075 + 1.35;
  const kx0 = ECX + RX * Math.cos(0.2), ky0 = ECY + RY * Math.sin(0.2);
  let kx: number, ky: number;
  if (f < 36) {
    const e = easeInOut(enter);
    kx = lerp(980, kx0, e); ky = lerp(470, ky0, e) - Math.sin(Math.PI * e) * 120;
  } else { kx = ECX + RX * Math.cos(thK); ky = ECY + RY * Math.sin(thK); }
  const ks = 0.72 + 0.1 * Math.sin(f < 36 ? 0.2 : thK);
  const kdir: 1 | -1 = f < 36 ? 1 : (Math.sin(thK) > 0 ? -1 : 1);
  const woke = f >= 30;
  const jt = easeOut(seg(f, 30, 36));
  const mx1 = ECX + RX * Math.cos(thM), my1 = ECY + RY * Math.sin(thM);
  const mx = woke ? lerp(900, mx1, jt) : 900, my = woke ? lerp(720, my1, jt) - Math.sin(Math.PI * jt) * 90 : 720;
  const ms = 0.72 + 0.1 * Math.sin(thM);
  const mdir = Math.sin(thM) > 0 ? -1 : 1;
  const wind = winOpen * (0.6 + 0.4 * Math.sin(f / 3));
  const spin = f * 14;
  const camK = lerp(1, 1.28, easeInOut(seg(f, 26, 40)));
  const camY = lerp(560, 690, easeInOut(seg(f, 26, 40)));
  const camX = lerp(960, (kx + mx) / 2 * 0.3 + 960 * 0.7, easeOut(seg(f, 36, 60)));
  const kBack = inside && f >= 36 && Math.sin(thK) < 0;
  const mBack = woke && Math.sin(thM) < 0 && jt >= 1;
  const knocker = (clipped: boolean) => {
    const fx = clipped ? 980 : kx, fy = clipped ? lerp(1010, 470, rise) : ky, sc = clipped ? 0.8 : ks;
    const poseK = clipped ? (rise < 0.05 ? "knock" : "walk") : (f >= 36 ? "knock" : "walk");
    const tip: [number, number] = clipped ? [900, 300] : [mx, my - 200 * ms];
    return (
      <g>
        {sprout > 0 && <MzJWheel x={fx - 62 * sc * kdir} y={fy - 40 * sc} s={0.62 * sc * sprout} spin={spin} />}
        <KnockerUp x={fx} y={fy - 70 * sc * sprout} s={sc} f={f} pose={poseK} dir={clipped ? -1 : kdir} tip={tip} face="smile" />
        {sprout > 0 && <MzJOn x={fx} y={fy - 70 * sc * sprout} s={sc} f={f} flip={kdir === -1 && !clipped}><MzJSmirkEyes /></MzJOn>}
        {sprout > 0 && <MzJWheel x={fx + 62 * sc * kdir} y={fy - 40 * sc} s={0.62 * sc * sprout} spin={spin} front />}
      </g>
    );
  };
  const man = () => woke ? (
    <g>
      <Person x={mx} y={my} s={ms} f={f} pose="run" face="surprised" cloth={C.gray} clothDark={C.grayDark2} hair="cap" gaze={[mdir * 6, 0]} lean={mdir * 6} />
      <text x={mx + 70 * ms} y={my - 300 * ms} fontFamily={FONT} fontWeight={900} fontSize={110 * ms} fill={MP.bell} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke">!</text>
    </g>
  ) : null;
  return (
    <Frame f={f} seed={6195} dark>
      <g transform={`translate(${960} 560) scale(${camK}) translate(${-camX} ${-camY})`}>
        {/* れんがの壁 */}
        <rect x={-120} y={-40} width={2160} height={620} fill={MP.brick} />
        {Array.from({ length: 20 }, (_, r) => (
          <g key={r}>
            <line x1={-120} y1={r * 32} x2={2040} y2={r * 32} stroke={MP.mortar} strokeWidth={3} opacity={0.5} />
            {Array.from({ length: 30 }, (_, c) => <line key={c} x1={-120 + c * 76 + (r % 2) * 38} y1={r * 32} x2={-120 + c * 76 + (r % 2) * 38} y2={r * 32 + 32} stroke={MP.mortar} strokeWidth={3} opacity={0.4} />)}
          </g>
        ))}
        {/* 床 (板張り) */}
        <rect x={-120} y={560} width={2160} height={560} fill={MP.wood} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-120} y1={600 + i * 60} x2={2040} y2={600 + i * 60} stroke={MP.woodDark} strokeWidth={4} opacity={0.5} />)}
        <rect x={-120} y={552} width={2160} height={16} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓の外: 向かいの長屋 */}
        <defs><clipPath id="mzj195win"><rect x={WX0} y={WY0} width={WW} height={WH} /></clipPath></defs>
        <g clipPath="url(#mzj195win)">
          <g transform={`translate(${WX0} ${WY0}) scale(0.42) translate(-520 -80)`}>
            <MachiNami f={f} windows={[0, 1, 0, 0, 1, 0]} sky={0.35} />
          </g>
          {!inside && knocker(true)}
        </g>
        {/* 窓わく (下の窓が上に開く) */}
        <rect x={WX0 - 18} y={WY0 - 18} width={WW + 36} height={WH + 36} fill="none" stroke={MP.stoneLight} strokeWidth={22} />
        <rect x={WX0 - 28} y={WY0 - 28} width={WW + 56} height={WH + 56} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={WX0} y={WY0} width={WW} height={WH} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={WX0 + 6} y={WY0 + 6} width={WW - 12} height={WH / 2 - 6} fill={KRP.white} opacity={0.08} stroke="#F1EADF" strokeWidth={9} />
        <rect x={WX0 + 6} y={WY0 + WH / 2 - winOpen * (WH / 2 - 10)} width={WW - 12} height={WH / 2 - 6} fill={KRP.white} opacity={0.08} stroke="#F1EADF" strokeWidth={9} />
        <rect x={WX0 - 30} y={WY0 + WH + 4} width={WW + 60} height={26} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={5} />
        {/* コンコン */}
        {f < 14 && Math.sin(f * 0.55) < -0.6 && <g>{[0, 1, 2].map((j) => <line key={j} x1={900 + (j - 1) * 40} y1={260} x2={900 + (j - 1) * 60} y2={230} stroke={MP.glow} strokeWidth={6} strokeLinecap="round" />)}</g>}
        {/* ガシャン */}
        {f >= 14 && f < 30 && <g transform={`translate(1240 200) rotate(8) scale(${pop(seg(f, 14, 19))})`} opacity={1 - seg(f, 24, 30)}>
          <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={MP.brassLight} stroke={KRP.ink} strokeWidth={8} paintOrder="stroke">ガシャン!</text>
        </g>}
        {/* 壁の小物: 上着をかけた釘・ろうそくの台・洗面器 */}
        <g>
          <rect x={1480} y={420} width={160} height={20} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
          {[1490, 1620].map((lx) => <rect key={lx} x={lx} y={440} width={14} height={180} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
          <path d="M 1490 420 Q 1560 460 1630 420 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1540 420 L 1530 360 Q 1560 340 1590 360 L 1580 420 Z" fill="#DCEFF8" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g>
          <rect x={290} y={520} width={110} height={16} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={300} y={536} width={14} height={90} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={376} y={536} width={14} height={90} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={333} y={460} width={24} height={60} fill="#F4ECD4" stroke={KRP.ink} strokeWidth={3.5} />
          <g transform={`rotate(${-wind * 32} 345 458)`}><Flame x={345} y={458} f={f} /></g>
        </g>
        {/* 奥を回るときは ベッドより先に描く */}
        {kBack && knocker(false)}
        {mBack && man()}
        {/* ベッド (木) */}
        <g>
          <rect x={620} y={600} width={40} height={220} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={650} y={660} width={640} height={110} rx={14} fill="#EEE6D6" stroke={KRP.ink} strokeWidth={6} />
          <rect x={640} y={760} width={660} height={56} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          {[650, 1270].map((lx) => <rect key={lx} x={lx} y={814} width={22} height={40} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
          <ellipse cx={730} cy={690} rx={66} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {!woke ? (
            <MzJLying x={940} y={706} s={0.75} f={f} cloth={C.gray} clothDark={C.grayDark2} headLeft blanket="#7E8FA8" />
          ) : (
            <path d={`M 800 700 Q 900 ${650 + Math.sin(f / 4) * 6} 1020 690 Q 1150 640 1260 700 L 1270 770 L 800 770 Z`} fill="#7E8FA8" stroke={KRP.ink} strokeWidth={5} />
          )}
        </g>
        {!woke && <g>{[0, 1].map((i) => { const t = ((f / 40 + i / 2) % 1); return <text key={i} x={700 - t * 30} y={600 - t * 90} fontFamily={FONT} fontWeight={900} fontSize={30 + t * 20} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} opacity={Math.sin(t * Math.PI)}>Z</text>; })}</g>}
        {/* 手前を回るとき / 乗りこむとき */}
        {inside && !kBack && knocker(false)}
        {woke && !mBack && man()}
        {/* 窓から吹きこむ風 */}
        {winOpen > 0.2 && [0, 1, 2].map((j) => {
          const t = ((f / 24 + j / 3) % 1);
          return <path key={j} d={`M ${820 + j * 120} ${300 + t * 260} q 40 -20 80 0 t 80 0`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.5 * (1 - t)} strokeLinecap="round" />;
        })}
        {/* 夜明け前の暗さ (ろうそくのまわりは明るい) */}
        <rect x={-120} y={-40} width={2160} height={1160} fill={MP.nightDeep} opacity={0.22} />
        <circle cx={345} cy={440} r={220} fill={MP.glow} opacity={0.12} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #196 機械は、一度、止められるようになって、また、止められない方へ、戻ってきました。
// 格: 図 / seed 6196
// 絵: どこ: 博物館の展示室の床の上に敷かれた、大きな円い時計の文字盤の形の展示パネル (木の床・ガラスケース・天井の照明・ロープの柵)。演出: 文字盤の上に、時計回りに3つの展示台。①「止められない」= KnockerUp の人形 (pose="knock") ②「止められる」= BellClock (snooze=true) ③「止められない」= Clocky (run=0)。展示台どうしを、文字盤の目盛りに沿った太い矢印が①→②→③とぐるりとつなぎ、③の Clocky が、矢印をたどって①の KnockerUp の隣まで走っていって並ぶ (一周して戻る)。2人がそろって得意げな顔。②の BellClock は真ん中で取り残されて、スヌーズボタンが少ししょんぼり沈む。見学の子ども (小さく頭大きめ) が矢印を指でなぞる。動き: f0-30 カメラが展示室の上から見下ろす / f30-90 矢印が①→②→③と伸びる / f90-130 Clocky が①まで走って並ぶ / f130-150 BellClock がしょんぼり
// どこ: 博物館の展示室。木の床に敷いた大きな円い時計の文字盤の展示パネル・ロープの柵・ガラスケース・天井の照明
// 演出: 文字盤の上の3つの展示台 ①ノッカー・アップの人形 ②スヌーズ付きベル時計 ③Clocky。目盛りに沿う太い矢印が①→②→③。
//       ③の Clocky が矢印をたどって①の隣まで走って並び、2人で得意顔。②は取り残されてスヌーズボタンがしょんぼり沈む。子どもが矢印を指でなぞる
// 動き: f0-24 上から見下ろすカメラが少し寄る / f8-36 矢印が伸びる / f30-60 Clocky が走って①の隣へ / f56- ②がしょんぼり
const MZJ196 = { cx: 960, cy: 470, rx: 640, ry: 300 };
const mzj196pt = (deg: number, k = 1): [number, number] => [MZJ196.cx + Math.sin((deg * Math.PI) / 180) * MZJ196.rx * k, MZJ196.cy - Math.cos((deg * Math.PI) / 180) * MZJ196.ry * k];
const MzJArc: React.FC<{ a0: number; a1: number; t: number }> = ({ a0, a1, t }) => {
  if (t <= 0) return null;
  const a = lerp(a0, a1, t);
  const n = 24;
  const pts = Array.from({ length: n + 1 }, (_, i) => mzj196pt(lerp(a0, a, i / n), 0.78));
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const [ex, ey] = pts[n], [px, py] = pts[n - 1];
  const ang = Math.atan2(ey - py, ex - px) * 180 / Math.PI;
  return (
    <g>
      <path d={d} stroke={KRP.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={d} stroke={MP.bell} strokeWidth={24} fill="none" strokeLinecap="round" />
      <g transform={`translate(${ex} ${ey}) rotate(${ang})`}>
        <path d="M -10 -34 L 40 0 L -10 34 Z" fill={MP.bell} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
    </g>
  );
};
const MzJPedestal: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 60} rx={120} ry={34} fill={KRP.ink} opacity={0.18} />
    <rect x={x - 100} y={y} width={200} height={56} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={6} />
    <ellipse cx={x} cy={y + 56} rx={100} ry={26} fill={MP.stone} stroke={KRP.ink} strokeWidth={6} />
    <ellipse cx={x} cy={y} rx={100} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
  </g>
);
const Mz196: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.05, easeOut(seg(f, 0, 24)));
  const ar1 = seg(f, 8, 22), ar2 = seg(f, 22, 36);
  const P1 = mzj196pt(300), P2 = mzj196pt(60), P3 = mzj196pt(180);
  const rt = easeInOut(seg(f, 30, 60));
  const cAng = lerp(180, 282, rt);
  const [qx, qy] = rt > 0 ? mzj196pt(cAng, 0.78) : [P3[0], P3[1] - 26];
  const onArrow = rt > 0 && rt < 1;
  const sad = seg(f, 56, 70);
  const done = rt >= 1;
  const tr = f >= 20 ? clamp01((f - 20) / 40) : 0;
  void tr;
  return (
    <Frame f={f} seed={6196} bg={MP.woodLight}>
      <g transform={`translate(960 480) scale(${k}) translate(-960 -480)`}>
        {/* 木の床 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={MP.woodLight} />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-40} y1={i * 50} x2={1960} y2={i * 50} stroke={MP.wood} strokeWidth={4} opacity={0.7} />)}
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={(i * 270) % 2000} y1={(i % 22) * 50} x2={(i * 270) % 2000} y2={(i % 22) * 50 + 50} stroke={MP.wood} strokeWidth={4} opacity={0.7} />)}
        {/* 天井の照明の光だまり */}
        {[[480, 330], [1440, 330], [960, 640]].map(([lx, ly], i) => <ellipse key={i} cx={lx} cy={ly} rx={360} ry={200} fill="#FFF3C8" opacity={0.25} />)}
        {/* 隅のガラスケース */}
        {[[40, 40], [1640, 40]].map(([gx, gy], i) => (
          <g key={i}>
            <rect x={gx} y={gy} width={240} height={150} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
            <rect x={gx + 14} y={gy + 14} width={212} height={122} fill="#DCEFF8" opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${gx + 40} ${gy + 120} L ${gx + 120} ${gy + 30}`} stroke={KRP.white} strokeWidth={10} opacity={0.6} />
            <circle cx={gx + 160} cy={gy + 80} r={30} fill={i ? MP.brass : MP.iron} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* ロープの柵 */}
        {Array.from({ length: 10 }, (_, i) => {
          const a = i * 36 + 18;
          const [px, py] = mzj196pt(a, 1.16);
          const [nx, ny] = mzj196pt(a + 36, 1.16);
          return (
            <g key={i}>
              <path d={`M ${px} ${py - 50} Q ${(px + nx) / 2} ${(py + ny) / 2 - 10} ${nx} ${ny - 50}`} stroke={C.redDark} strokeWidth={9} fill="none" />
              <rect x={px - 9} y={py - 60} width={18} height={60} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={px} cy={py} rx={22} ry={8} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 文字盤の展示パネル */}
        <ellipse cx={MZJ196.cx} cy={MZJ196.cy + 20} rx={MZJ196.rx + 20} ry={MZJ196.ry + 20} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={MZJ196.cx} cy={MZJ196.cy} rx={MZJ196.rx} ry={MZJ196.ry} fill="#FBF3E2" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 60 }, (_, i) => {
          const big = i % 5 === 0;
          const [x0, y0] = mzj196pt(i * 6, big ? 0.88 : 0.93), [x1, y1] = mzj196pt(i * 6, 0.97);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={KRP.ink} strokeWidth={big ? 8 : 3} strokeLinecap="round" />;
        })}
        <circle cx={MZJ196.cx} cy={MZJ196.cy} r={20} fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 矢印 ①→② →③ */}
        <MzJArc a0={312} a1={408} t={ar1} />
        <MzJArc a0={72} a1={168} t={ar2} />
        {/* 走る Clocky の通った跡 (③→①) */}
        {rt > 0 && <MzJArc a0={192} a1={lerp(192, 276, rt)} t={1} />}
        {/* ① ノッカー・アップの人形 */}
        <MzJPedestal x={P1[0]} y={P1[1]} />
        <KnockerUp x={P1[0] - 10} y={P1[1] + 4} s={0.56} f={f} pose="knock" face={done ? "smile" : "normal"} />
        {/* ② スヌーズ付きベル時計 */}
        <MzJPedestal x={P2[0]} y={P2[1]} />
        <g transform={`rotate(${-6 * sad} ${P2[0]} ${P2[1]})`}>
          <BellClock x={P2[0]} y={P2[1] - 92 + 10 * sad} s={0.55} f={f} snooze snoozePress={0.2 + 0.7 * sad} rot={-4 * sad} />
        </g>
        {sad > 0 && <path d={`M ${P2[0] + 110} ${P2[1] - 220 + Math.sin(f / 6) * 3} q 8 14 0 22 q -8 -8 0 -22 Z`} fill="#9FD0EE" stroke={KRP.ink} strokeWidth={3} opacity={sad} />}
        {/* ③ 展示台 (Clocky が出ていくと空になる) */}
        <MzJPedestal x={P3[0]} y={P3[1] - 30} />
        <Clocky x={done ? P1[0] + 175 : qx} y={done ? P1[1] + 10 : qy - (onArrow ? 40 : 52)} s={0.5} f={f} run={onArrow ? 1 : 0} dir={-1} face="smirk" />
        {/* 札 */}
        <TagPlate x={170} y={570} text="止められない" size={30} t={seg(f, 4, 12)} />
        <TagPlate x={1750} y={570} text="止められる" size={30} t={seg(f, 18, 26)} color={KRP.blueDeep} />
        <TagPlate x={P3[0] + 330} y={780} text="止められない" size={30} t={seg(f, 30, 38)} />
        {/* 見学の子ども (矢印を指でなぞる) */}
        <Person x={1580 + Math.sin(f / 14) * 10} y={800} s={0.55} f={f} pose="point" pointDir={-1} face="joy" gaze={[-6, -2]} cloth={KRP.green} clothDark="#4F8F4A" hair="cap" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #197 第7章、待ってくれる、他人。
// 格: 山 / seed 6197
// 絵: 章扉。どこ: 夜明けの町の路面のバス停 (現代。石の縁石・ベンチ・時刻表の柱 (数字だけ)・街路樹・朝もや MP.mist・空は MP.dawn)。演出: 画面の左寄りに、停まっているバスの扉が開いたまま。運転手 (紺の制服と帽子・男性・顔は横向き) が運転席から、遠くの坂道を走ってくる人を待って扉を開けて待っている。坂の上から、パジャマの上に上着をはおったあなた (水色のパジャマ・短い黒髪) が息を切らせて走ってくる。運転手の手が扉のスイッチから離れたまま、腕時計をちらっと見て、またあなたのほうを見る (腕は2本 pose で描く)。章扉の題字 ChapterDoor num=7 title="待ってくれる、他人。" を画面の右寄りに置く。動き: f0-30 朝もやの中からバスへカメラが寄る / f30-110 あなたが坂を走ってくる・運転手が腕時計を見る / f110-150 あなたが扉に手をかける・もやがゆっくり流れる
// どこ: 夜明けの町のバス停。左に扉の開いたバス、右奥に坂道、縁石・ベンチ・時刻表の柱・街路樹・朝もや
// 演出: 運転手は扉を開けたまま腕時計を見て、坂を走ってくる「あなた」(パジャマに上着をはおる) を待つ
// 動き: f0-30 カメラがバスへ寄る / f4-84 あなたが坂を駆け下りる (f=45 で坂の中ほど・運転手は腕時計) / f80- 扉に手をかける・もやが流れる
const Mz197: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const k = lerp(1, 1.07, easeOut(seg(f, 0, 30)));
  const t = easeInOut(seg(f, 4, 84));
  const P0 = [1660, 470], P1 = [900, 430], P2 = [770, 812];
  const bz = (u: number, i: 0 | 1) => (1 - u) * (1 - u) * P0[i] + 2 * u * (1 - u) * P1[i] + u * u * P2[i];
  const yx = bz(t, 0), yy = bz(t, 1);
  const ys = lerp(0.3, 0.86, t);
  const watching = f > 34 && f < 60;
  const flap = Math.sin(f / 2.4) * 14;
  const ROAD = `M ${P0[0] + 60} ${P0[1] - 6} Q ${P1[0]} ${P1[1]} ${P2[0] + 40} ${P2[1] + 10}`;
  return (
    <Frame f={f} seed={6197} over={<>
      <div style={{ position: "absolute", left: 1040, top: 536, width: 860, height: 196, borderRadius: 18,
        background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
      <ChapterDoor num={7} title="待ってくれる、他人。" t={door} left={1070} top={560} />
    </>}>
      <g transform={`translate(700 600) scale(${k}) translate(-700 -600)`}>
        <MzJSky x={-40} y={-40} w={2000} h={720} sky={1.05} n={14} />
        {/* 朝日 */}
        <circle cx={1500} cy={330} r={110} fill={MP.glow} opacity={0.35} />
        <circle cx={1500} cy={330} r={62} fill="#F7A65E" />
        {/* 遠くのビル (もやに沈む) */}
        <g opacity={0.55}>
          {[[980, 250, 90], [1080, 300, 70], [1170, 210, 110], [1300, 280, 80], [1400, 330, 60], [1700, 260, 120], [1830, 310, 90]].map(([bx, by, bw], i) => (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={500} fill={mixColor("#8C8FB0", MP.mist, 0.35)} stroke={KRP.ink} strokeWidth={3} />
              {Array.from({ length: 6 }, (_, j) => <rect key={j} x={bx + 14} y={by + 24 + j * 44} width={bw - 28} height={10} fill="#FFE3A8" opacity={j % 2 ? 0.5 : 0.25} />)}
            </g>
          ))}
        </g>
        {/* 丘と坂道 */}
        <path d="M 760 840 Q 1100 520 1560 470 Q 1800 450 1960 440 L 1960 860 Z" fill="#9DB08E" stroke={KRP.ink} strokeWidth={5} />
        <path d={ROAD} stroke={KRP.ink} strokeWidth={128} fill="none" strokeLinecap="round" />
        <path d={ROAD} stroke={C.road} strokeWidth={118} fill="none" strokeLinecap="round" />
        <path d={ROAD} stroke={C.roadLight} strokeWidth={6} fill="none" strokeDasharray="30 30" />
        {/* 街路樹 */}
        {[[1300, 560, 0.8], [1820, 520, 0.9]].map(([tx, ty, ts], i) => (
          <g key={i} transform={`translate(${tx} ${ty}) scale(${ts})`}>
            <rect x={-12} y={-20} width={24} height={150} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <g transform={`rotate(${Math.sin(f / 30 + i) * 2} 0 -20)`}>
              <circle cx={0} cy={-90} r={86} fill={C.leaf} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={-50} cy={-50} r={50} fill={C.leafDark} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={46} cy={-60} r={54} fill={C.leaf} stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
        ))}
        {/* 歩道と縁石 */}
        <rect x={-40} y={800} width={2000} height={300} fill={C.walk} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={830} x2={i * 150 - 40} y2={1080} />)}
          <line x1={-40} y1={940} x2={1960} y2={940} />
        </g>
        <rect x={-40} y={792} width={2000} height={26} fill={C.curb} stroke={KRP.ink} strokeWidth={5} />
        {/* ベンチ */}
        <g>
          <rect x={1000} y={690} width={240} height={22} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1000} y={640} width={240} height={18} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
          {[1020, 1210].map((lx) => <rect key={lx} x={lx} y={640} width={12} height={160} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        {/* 時刻表の柱 (数字だけ) */}
        <g>
          <rect x={872} y={400} width={14} height={410} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={879} cy={380} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={853} y={360} width={52} height={34} rx={8} fill={C.busStripe} stroke={KRP.ink} strokeWidth={3} />
          {[866, 892].map((wx) => <circle key={wx} cx={wx} cy={396} r={6} fill={KRP.ink} />)}
          <rect x={810} y={470} width={140} height={150} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {[["6", "05 25 45"], ["7", "05 20 35"], ["8", "00 30"]].map(([h, m], i) => (
            <g key={h}>
              <text x={822} y={508 + i * 40} fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>{h}</text>
              <text x={842} y={508 + i * 40} fontFamily={FONT} fontWeight={700} fontSize={15} fill={KRP.grayDark}>{m}</text>
            </g>
          ))}
        </g>
        {/* あなた (パジャマ+はおった上着) */}
        <g>
          <MzJOn x={yx} y={yy} s={ys} f={f} phase={1} lean={-7}>
            <path d={`M -62 -156 Q 0 -176 62 -156 L ${120 + flap} ${-70 + flap * 0.4} Q 60 -40 10 -60 Z`} fill={C.jacket} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          </MzJOn>
          <Person x={yx} y={yy} s={ys} f={f} phase={1} lean={-7} pose="run" face="worried" gaze={[-6, 0]} cloth={MP.you} clothDark={MP.youDark} hair="cap" />
          <MzJOn x={yx} y={yy} s={ys} f={f} phase={1} lean={-7}>
            <rect x={-64} y={-168} width={40} height={20} rx={9} fill={C.jacket} stroke={KRP.ink} strokeWidth={4} />
            <rect x={24} y={-168} width={40} height={20} rx={9} fill={C.jacket} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 56 -262 q 8 14 0 22 q -8 -8 0 -22 Z" fill="#9FD0EE" stroke={KRP.ink} strokeWidth={3} />
            {[0, 1, 2].map((i) => {
              const p = ((f / 14 + i / 3) % 1);
              return <circle key={i} cx={-80 - p * 70} cy={-190 - p * 20} r={8 + p * 10} fill={KRP.white} opacity={0.8 * (1 - p)} />;
            })}
          </MzJOn>
        </g>
        {/* バス (左。前=右、扉は前寄りで開いたまま) */}
        <g>
          <path d="M -80 330 L 640 330 Q 712 330 722 400 L 734 760 Q 734 800 700 800 L -80 800 Z" fill={C.bus} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
          <rect x={-80} y={640} width={814} height={34} fill={C.busStripe} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-80} y={740} width={814} height={60} fill={C.busLow} stroke={KRP.ink} strokeWidth={5} />
          {/* 行き先の表示 (光る帯) */}
          <rect x={560} y={340} width={150} height={30} rx={6} fill="#2B2D33" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={574 + i * 15} cy={355} r={4} fill="#FFB347" opacity={0.6 + 0.4 * Math.sin(f / 6 + i)} />)}
          {/* 窓 */}
          {[-60, 100, 260].map((wx) => (
            <g key={wx}>
              <rect x={wx} y={390} width={140} height={190} rx={10} fill={C.glass} stroke={KRP.ink} strokeWidth={6} />
              <path d={`M ${wx + 20} 560 L ${wx + 90} 410`} stroke={KRP.white} strokeWidth={10} opacity={0.35} />
              <rect x={wx + 30} y={470} width={80} height={110} rx={30} fill={C.glassDark} opacity={0.5} />
            </g>
          ))}
          {/* 開いた扉の奥 (車内・ステップ) と運転手 */}
          <rect x={440} y={384} width={130} height={360} rx={8} fill="#5A5048" stroke={KRP.ink} strokeWidth={6} />
          {[690, 716].map((sy, i) => <rect key={sy} x={444 + i * 8} y={sy} width={122 - i * 8} height={20} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={448} y={400} width={14} height={300} rx={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          {/* 折りたたまれた扉 */}
          {[0, 1].map((i) => <rect key={i} x={408 - i * 26} y={388} width={28} height={350} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />)}
          <rect x={588} y={384} width={136} height={240} rx={14} fill={mixColor(C.glass, "#FFE3A8", 0.25)} stroke={KRP.ink} strokeWidth={6} />
          <defs><clipPath id="mzj197drv"><rect x={590} y={386} width={132} height={236} rx={12} /></clipPath></defs>
          <g clipPath="url(#mzj197drv)">
            <Person x={640} y={690} s={0.62} f={f} pose="hold" face="normal" cloth={C.navy} clothDark={C.navyDark} hair="cap"
              gaze={watching ? [-3, 7] : [7, -1]} />
            <MzJOn x={640} y={690} s={0.62} f={f}>
              <MzJCap color={C.navy} />
              <path d="M -24 -132 L -4 -132" stroke={KRP.ink} strokeWidth={12} />
              <circle cx={-14} cy={-128} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <line x1={-14} y1={-128} x2={-14} y2={-134} stroke={KRP.ink} strokeWidth={2} />
            </MzJOn>
            {/* ハンドル */}
            <ellipse cx={690} cy={600} rx={20} ry={48} fill="none" stroke={KRP.ink} strokeWidth={8} />
            <path d="M 596 400 L 700 600" stroke={KRP.white} strokeWidth={12} opacity={0.25} />
          </g>
          {/* ミラーとライト */}
          <path d="M 720 410 Q 770 400 772 450" stroke={KRP.ink} strokeWidth={6} fill="none" />
          <rect x={760} y={450} width={22} height={44} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={714} cy={712} r={14} fill="#FFF1B8" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={714} cy={712} r={34} fill={MP.glow} opacity={0.3 + 0.1 * Math.sin(f / 5)} />
          {/* 車輪 */}
          {[60, 300].map((wx) => (
            <g key={wx}>
              <circle cx={wx} cy={800} r={64} fill="#2B2D33" stroke={KRP.ink} strokeWidth={6} />
              <circle cx={wx} cy={800} r={28} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          {/* 排気の小さな白い息 (アイドリング) */}
          {[0, 1].map((i) => {
            const p = ((f / 30 + i / 2) % 1);
            return <circle key={i} cx={-40 - p * 60} cy={780 - p * 40} r={14 + p * 20} fill={KRP.white} opacity={0.5 * (1 - p)} />;
          })}
        </g>
        {/* 朝もや */}
        {[[300, 520, 520], [1200, 600, 600], [700, 760, 700]].map(([mx, my, mw], i) => (
          <ellipse key={i} cx={((mx + f * (0.8 + i * 0.3)) % 2400) - 200} cy={my} rx={mw / 2} ry={46} fill={MP.mist} opacity={0.35} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #198 ここまでを、まとめます。
// 格: 並 / seed 6198
// 絵: どこ: あなたの寝室 (Shinshitsu, sky=1, sleeper=0, alarms=0) の壁。ベッドの横の壁に大きなコルクボード。演出: パジャマのあなたがベッドに座り、コルクボードにこれまでの章の場面の写真カード (鶏人の宮殿の石段・修道院・時の鐘・番人の塔・工場の門・ノッカー・アップの石畳・Clocky) を1枚ずつピンで留めていく (腕は2本 pose で描く)。最後の1枚を留めると、写真どうしを赤い糸がつなぎはじめる (探偵の推理ボードのように)。あなたは腕を組んでボードをじっと見る (face="worried" から少しずつ真顔)。窓の外がほんのり明るい。動き: f0-30 カメラがベッドの横からボードへ寄る / f30-90 カードを留める (ぽん、ぽん) / f90-120 赤い糸がつながる
// どこ: あなたの寝室 (Shinshitsu sky=1・布団はたたんだまま)。左の壁に大きなコルクボード
// 演出: ベッドの足もとに座ったあなたが、これまでの場面の写真を1枚ずつピンで留め、最後に赤い糸がつながる (推理ボード)
// 動き: f0-16 カメラがボードへ寄る / f6-34 写真7枚がぽんぽん留まる / f34-44 赤い糸 / f48- 腕を組んでじっと見る
const MzJPalaceArt: React.FC<{ f: number; sky?: number }> = ({ f, sky = 0.5 }) => (
  <g>
    <MzJSky x={-40} y={-40} w={2000} h={760} sky={sky} />
    {/* 屋根 (黒い瓦と赤い梁) */}
    <path d="M -40 230 L 300 110 L 1620 110 L 1960 230 L 1960 280 L -40 280 Z" fill="#33333C" stroke={KRP.ink} strokeWidth={8} />
    {Array.from({ length: 40 }, (_, i) => <line key={i} x1={i * 52} y1={130} x2={i * 52 - 10} y2={270} stroke="#55555F" strokeWidth={5} />)}
    <rect x={-40} y={276} width={2000} height={40} fill={C.red} stroke={KRP.ink} strokeWidth={6} />
    {/* 赤い柱 */}
    {[200, 760, 1160, 1720].map((px) => (
      <g key={px}>
        <rect x={px - 38} y={316} width={76} height={420} fill={C.red} stroke={KRP.ink} strokeWidth={6} />
        <rect x={px - 30} y={330} width={16} height={390} fill="#D4574A" opacity={0.7} />
        <rect x={px - 52} y={720} width={104} height={30} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
    {/* 奥の暗い広間と灯籠の明かり */}
    <rect x={238} y={316} width={484} height={420} fill="#2A2234" opacity={0.85} />
    <rect x={1198} y={316} width={484} height={420} fill="#2A2234" opacity={0.85} />
    <Flame x={960} y={560} f={f} s={1.2} />
    <rect x={930} y={560} width={60} height={60} fill={MP.stone} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 910 560 L 960 520 L 1010 560 Z" fill={MP.stoneDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 石段 (白い石) */}
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-40 - i * 20} y={750 + i * 56} width={2040 + i * 40} height={58} fill={mixColor(C.stoneW, MP.stone, i / 8)} stroke={KRP.ink} strokeWidth={5} />
    ))}
  </g>
);
const MzJCard: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const id = `mzj198c${i}`;
  const crop = (x0: number, y0: number, node: React.ReactNode) => <g transform={`scale(${116 / 1105}) translate(${-x0} ${-y0})`}>{node}</g>;
  const art = [
    crop(410, 200, <MzJPalaceArt f={f} />),
    crop(410, 120, <Shudouin f={f} dark={0.6} candle={2} />),
    crop(410, 130, <TokiNoKane f={f} swing={0} sky={1} />),
    crop(650, 300, <BanninTou f={f} wake={0.6} />),
    crop(410, 140, <KoujouMon f={f} gate={1} hands={6 * 60} />),
    crop(300, 150, <MachiNami f={f} windows={[0, 1, 0, 1, 0, 0]} sky={0.3} />),
    <g><rect x={0} y={0} width={116} height={84} fill="#CFE2EC" /><rect x={0} y={60} width={116} height={24} fill={MP.woodLight} /><Clocky x={58} y={50} s={0.2} f={f} run={0} face="smirk" /></g>,
  ][i];
  return (
    <g>
      <rect x={-68} y={-50} width={136} height={116} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <defs><clipPath id={id}><rect x={-58} y={-40} width={116} height={84} /></clipPath></defs>
      <g clipPath={`url(#${id})`}><g transform="translate(-58 -40)">{art}</g></g>
      <rect x={-58} y={-40} width={116} height={84} fill="none" stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};
const MZJ198_SPOTS: [number, number][] = [[118, 196], [252, 186], [386, 200], [120, 352], [254, 360], [388, 346], [254, 512]];
const Mz198: React.FC<{ f: number }> = ({ f }) => {
  const cz = easeOut(seg(f, 0, 16));
  const k = lerp(1, 1.22, cz), cx = lerp(960, 750, cz), cy = lerp(540, 440, cz);
  const folded = f >= 48;
  const PX = 600, PY = 711, PS = 1.05;
  const hand: [number, number] = [PX - 153 * PS, PY - 148 * PS];
  const strP = seg(f, 34, 44) * (MZJ198_SPOTS.length - 1);
  return (
    <Frame f={f} seed={6198}>
      <g transform={cam(k, cx, cy)}>
        <Shinshitsu f={f} sky={1} sleeper={0} alarms={0} />
        {/* コルクボード (額縁つき) */}
        <rect x={22} y={102} width={456} height={508} rx={10} fill={C.frame} stroke={KRP.ink} strokeWidth={7} />
        <rect x={40} y={120} width={420} height={472} fill={C.cork} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={50 + rnd(198, i) * 400} cy={130 + rnd(199, i) * 452} r={2.5 + rnd(200, i) * 2} fill={C.corkDark} opacity={0.7} />)}
        {/* 写真 */}
        {MZJ198_SPOTS.map(([sx, sy], i) => {
          const t0 = 6 + i * 4;
          const p = seg(f, t0, t0 + 4);
          if (p <= 0) return null;
          const e = easeOut(p);
          const x = lerp(hand[0], sx, e), y = lerp(hand[1], sy, e);
          const rot = (rnd(7, i) - 0.5) * 10;
          const pinPop = pop(seg(f, t0 + 3, t0 + 7));
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot * e}) scale(${lerp(0.5, i === 6 ? 1.12 : 1, e)})`}>
              <MzJCard i={i} f={f} />
              {pinPop > 0 && <g transform={`translate(0 -42) scale(${pinPop})`}>
                <circle r={11} fill={MP.bell} stroke={KRP.ink} strokeWidth={3.5} />
                <circle cx={-3} cy={-3} r={3.5} fill={KRP.white} opacity={0.8} />
              </g>}
            </g>
          );
        })}
        {/* 赤い糸 (写真のピンどうしを順につなぐ) */}
        {strP > 0 && MZJ198_SPOTS.slice(0, -1).map(([ax, ay], i) => {
          const u = clamp01(strP - i);
          if (u <= 0) return null;
          const [bx, by] = MZJ198_SPOTS[i + 1];
          const ex = lerp(ax, bx, u), ey = lerp(ay - 42, by - 42, u);
          return <line key={i} x1={ax} y1={ay - 42} x2={ex} y2={ey} stroke={C.string} strokeWidth={4} strokeLinecap="round" />;
        })}
        {/* あなた (ベッドの足もとに座る) */}
        <Person x={PX} y={PY} s={PS} f={f} pose={folded ? "armsFolded" : "point"} pointDir={-1} lean={folded ? 0 : -4}
          face={folded ? "normal" : "worried"} gaze={[-6, -2]} cloth={MP.you} clothDark={MP.youDark} hair="cap" />
        {/* 写真を留める「ぽん」 */}
        {MZJ198_SPOTS.map(([sx, sy], i) => {
          const q = seg(f, 10 + i * 4, 15 + i * 4);
          if (q <= 0 || q >= 1) return null;
          return <g key={i} opacity={1 - q}>{[0, 1, 2, 3].map((j) => {
            const a = (j * 90 + 45) * Math.PI / 180;
            return <line key={j} x1={sx + Math.cos(a) * 20} y1={sy - 42 + Math.sin(a) * 20} x2={sx + Math.cos(a) * (30 + q * 16)} y2={sy - 42 + Math.sin(a) * (30 + q * 16)} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />;
          })}</g>;
        })}
        {/* 考えこむ「…」 */}
        {folded && <g>{[0, 1, 2].map((j) => <circle key={j} cx={PX + 60 + j * 22} cy={PY - 330 - Math.abs(Math.sin(f / 8 + j)) * 6} r={7} fill={KRP.ink} opacity={clamp01((f - 48 - j * 4) / 4)} />)}</g>}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #199 人間の体は、本当は、自力で起きられます。
// 格: 並 / seed 6199
// 絵: どこ: あなたの体の中、脳の奥の小部屋 (柔らかいピンクの壁・管の通った工場のような世界)。真ん中に TainaiDokei (lag=0.2, reset=0→1, s 大きめ、画面の短辺の1/2以上)。演出: 窓のような穴から朝の光の筋がさしこみ、TainaiDokei のはみ出しの赤い区画がその光で縮んで (reset=1) 針がぴたりと合う。Kobito (helmet、3人) が歯車を回し、針が起きる時刻にとどいた瞬間、1人が壁の大きなレバーを両手で「ガコン」と引く (腕は2本 pose で描く)。小部屋の外の管の中を明るい光が流れて上へ (体が目覚める合図)。Kobito たちはハイタッチ。目覚まし時計はどこにも出てこない。動き: f0-30 光がさしこむ / f30-70 赤い区画が縮む・針が合う / f70-90 レバーをガコン / f90-140 管を光が流れる・ハイタッチ
// どこ: あなたの体の中、脳の奥の小部屋 (柔らかいピンクの壁・管・歯車の機械)。真ん中に大きな体内時計
// 演出: 右上の穴から朝の光 → はみ出しが縮んで針が合う → 小人がレバーをガコン → 管を光が上へ → 小人2人がハイタッチ
// 動き: f0-10 光 / f8-36 reset / f36-41 レバー / f42- 管の光 / f50-70 ハイタッチ
const Mz199: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.05, easeOut(seg(f, 0, 40)));
  const reset = seg(f, 8, 36);
  const pull = easeOut(seg(f, 36, 41));
  const P = [1720, 706];
  const a0 = Math.atan2(-86, -200), a1 = Math.atan2(60, -200);
  const a = lerp(a0, a1, pull);
  const hx = P[0] + Math.cos(a) * 214, hy = P[1] + Math.sin(a) * 214;
  const flow = f >= 42;
  const hi = seg(f, 48, 60);
  const ax = lerp(230, 300, easeOut(hi)), bx = lerp(450, 374, easeOut(hi));
  const clap = f >= 60 ? pop(seg(f, 60, 66)) : 0;
  const gearRot = f * (f < 42 ? 3 : 1);
  const kick = Math.sin(f / 3) * (1 - pull) * 10;
  const pipes = ["M 1190 840 L 1190 300 Q 1190 240 1250 240 L 1500 240 L 1500 -60", "M 540 840 L 540 160 Q 540 100 600 100 L 760 100 L 760 -60", "M 860 180 L 860 -60"];
  return (
    <Frame f={f} seed={6199} bg={C.pink}>
      <g transform={`translate(860 520) scale(${k}) translate(-860 -520)`}>
        {/* 柔らかいピンクの壁 (ひだ) */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.pink} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${-40 + i * 240} -40 Q ${40 + i * 240 + Math.sin(f / 40 + i) * 10} 400 ${-20 + i * 240} 840`} stroke={C.pinkDark} strokeWidth={16} fill="none" opacity={0.6} />
        ))}
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={rnd(19, i) * 1920} cy={rnd(29, i) * 800} r={6 + rnd(39, i) * 10} fill={C.pinkDark} opacity={0.45} />)}
        {/* 床 (やわらかい肉の床) */}
        <path d="M -40 830 Q 480 800 960 826 Q 1440 850 1960 820 L 1960 1120 L -40 1120 Z" fill={C.flesh} stroke={KRP.ink} strokeWidth={6} />
        {/* 右上の光の穴 (外の朝が見える) */}
        <circle cx={1329} cy={68} r={110} fill={C.pinkDeep} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1329} cy={68} r={86} fill={mixColor("#5A5890", "#FFF1B8", reset)} stroke={KRP.ink} strokeWidth={5} />
        {/* 管 (光が上へ流れる) */}
        {pipes.map((d, i) => (
          <g key={i}>
            <path d={d} stroke={KRP.ink} strokeWidth={50} fill="none" strokeLinejoin="round" />
            <path d={d} stroke={C.pinkDeep} strokeWidth={40} fill="none" strokeLinejoin="round" />
            <path d={d} stroke="#E7A2AE" strokeWidth={10} fill="none" strokeLinejoin="round" transform="translate(-8 0)" />
            {flow && <path d={d} stroke="#FFF1B8" strokeWidth={22} fill="none" strokeLinejoin="round" strokeDasharray="40 70"
              strokeDashoffset={(f - 42) * 22} opacity={clamp01((f - 42) / 6)} />}
          </g>
        ))}
        {[[1190, 600], [540, 520], [1500, 120], [760, 40]].map(([jx, jy], i) => <rect key={i} x={jx - 32} y={jy - 12} width={64} height={24} rx={6} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 左の歯車の機械 (小人2人がクランクを回す) */}
        <g>
          <rect x={250} y={760} width={160} height={70} rx={10} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`translate(330 660) rotate(${gearRot})`}>
            {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-13} y={-118} width={26} height={30} rx={4} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 360 / 14})`} />)}
            <circle r={96} fill={MP.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle r={56} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
            {[0, 1, 2, 3, 4].map((j) => <line key={j} x1={0} y1={0} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${j * 72})`} opacity={0.6} />)}
            <circle r={16} fill={KRP.ink} />
          </g>
          {/* 歯車から時計へのベルト */}
          <path d="M 400 600 Q 520 520 640 560" stroke={KRP.ink} strokeWidth={12} fill="none" strokeDasharray="18 10" strokeDashoffset={-gearRot} />
        </g>
        {/* 体内時計 (大きく) */}
        <TainaiDokei x={860} y={520} s={1.38} f={f} lag={0.2} reset={reset} />
        {/* 針が合った「ぴたっ」 */}
        {f >= 34 && f < 50 && <g opacity={1 - seg(f, 40, 50)}>{[0, 1, 2, 3, 4].map((j) => {
          const an = (-90 + (j - 2) * 22) * Math.PI / 180;
          return <line key={j} x1={860 + Math.cos(an) * 290} y1={520 + Math.sin(an) * 290} x2={860 + Math.cos(an) * 330} y2={520 + Math.sin(an) * 330} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />;
        })}</g>}
        {/* 壁の大きなレバー */}
        <rect x={1660} y={600} width={120} height={220} rx={14} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1690} y={630} width={60} height={30} rx={6} fill={pull > 0.9 ? KRP.green : MP.bell} stroke={KRP.ink} strokeWidth={4} />
        <line x1={P[0]} y1={P[1]} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
        <line x1={P[0]} y1={P[1]} x2={hx} y2={hy} stroke={KRP.silver} strokeWidth={16} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={22} fill={MP.bell} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={P[0]} cy={P[1]} r={20} fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* レバーにぶら下がる小人 (両手でつかむ) */}
        <g transform={`rotate(${kick * 0.3} ${hx} ${hy})`}>
          <Kobito x={hx} y={hy + 65} s={0.55} f={f} pose="hold" face={pull > 0.9 ? "joy" : "worried"} phase={3} />
        </g>
        {pull > 0.3 && f < 54 && (
          <g opacity={1 - seg(f, 46, 54)} transform={`translate(1560 560) rotate(-8) scale(${pop(seg(f, 38, 44))})`}>
            <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} paintOrder="stroke">ガコン!</text>
          </g>
        )}
        {/* クランクの小人2人 → ハイタッチ */}
        {hi <= 0 ? (
          <>
            <Kobito x={230 + Math.cos(gearRot / 57) * 4} y={830} s={0.55} f={f} pose="hold" face="smile" phase={1} />
            <Kobito x={450 + Math.sin(gearRot / 57) * 4} y={830} s={0.55} f={f} pose="hold" face="smile" phase={2} />
          </>
        ) : (
          <>
            <Kobito x={ax} y={830} s={0.55} f={f} pose={hi >= 1 ? "raise" : "run"} face="joy" phase={1} />
            <g transform={`translate(${bx * 2} 0) scale(-1 1)`}>
              <Kobito x={bx} y={830} s={0.55} f={f} pose={hi >= 1 ? "raise" : "run"} face="joy" phase={2} />
            </g>
            {clap > 0 && <g transform={`translate(337 700) scale(${clap})`} opacity={1 - seg(f, 70, 84)}>
              {Array.from({ length: 8 }, (_, j) => <line key={j} x1={0} y1={-20} x2={0} y2={-44} stroke={MP.brass} strokeWidth={7} strokeLinecap="round" transform={`rotate(${j * 45})`} />)}
            </g>}
          </>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #200 起きられなくなったのは、起きる時刻を、他人が決めるようになってからでした。
// 格: 山 / seed 6200
// 絵: どこ: あなたの寝室 (Shinshitsu, sky=0, sleeper=1, alarms=0)。壁の時計に寄った構図。演出: あなたがベッドで寝ている (sleeper=1)。その上の壁の時計の長い針に、窓の外や天井や壁の外から、時代ごとの他人の手 (顔は描かない袖口だけで分かるように: 修道服の黒い袖・江戸の藍の着物の袖・工場主の黒い上着と懐中時計の鎖・駅長の紺の制服の袖) が4本、にゅっと伸びてきて、それぞれ針をつまんで「この時刻!」と早い時刻のほうへぐいっと引っぱり合う。針が早い時刻に固定され、ピンで留められる。寝ているあなたの頭の上の Kobito の小さな影が「え、まだ早いのに」と体内時計を抱えて困った顔をする (face="worried")。動き: f0-30 カメラが時計へ寄る / f30-80 4本の袖の手が順に伸びる / f80-120 針を引っぱり合う / f120-150 ピンで留められる・Kobito が困る
// どこ: あなたの寝室 (Shinshitsu sky=0, sleeper=1)。壁の時計と、その下で眠るあなたに寄る
// 演出: 窓・天井・壁の外から、時代ごとの他人の袖 (修道服・江戸の着物・工場主の上着と鎖・駅長の制服) が4本伸び、
//       時計の針をつまんで早い時刻へ引っぱり合う → 針がピンで留められる。夢の吹き出しの中で小人が体内時計を抱えて困る
// 動き: f0-24 時計へ寄る / f6-31 袖が順に伸びる / f28-40 引っぱり合い / f40 ピン / f30- 小人が困る / 以後 袖がぐいぐい
const MZJ200_CK = [1360, 250] as const;
const Mz200: React.FC<{ f: number }> = ({ f }) => {
  const cz = easeOut(seg(f, 0, 24));
  const k = lerp(1, 1.45, cz), cx = lerp(960, 1220, cz), cy = lerp(540, 430, cz);
  const tug = seg(f, 28, 40);
  const pinned = f >= 40;
  const time = 420 - 120 * easeOut(tug) + (tug > 0 && tug < 1 ? Math.sin(f * 1.7) * 9 : 0);
  const mA = ((time % 60) / 60) * 360, hA = ((time / 60) % 12) * 30;
  const pt = (deg: number, r: number): [number, number] => [MZJ200_CK[0] + Math.sin((deg * Math.PI) / 180) * r, MZJ200_CK[1] - Math.cos((deg * Math.PI) / 180) * r];
  // 手は針の先端 (文字盤のふち寄り) をつまむ。中心と針は見えたまま。長針の先 = 半径55 / 短針の先 = 半径36
  //   修道服と江戸の袖は長針の先を両側から、工場主と駅長の袖は短針の先を両側から
  const ptp = (deg: number, r: number, d: number): [number, number] => {
    const [px, py] = pt(deg, r), rad = (deg * Math.PI) / 180;
    return [px + Math.cos(rad) * d, py + Math.sin(rad) * d];
  };
  const grips: [number, number][] = [ptp(mA, 66, 15), ptp(mA, 66, -15), ptp(hA, 50, -15), ptp(hA, 50, 15)];
  const sway = pinned ? Math.sin(f / 7) * 3 : 0;
  const arms = [
    { o: [1260, -60] as [number, number], cloth: MP.habit, kind: "monk" },
    { o: [880, -60] as [number, number], cloth: C.indigo, kind: "edo" },
    { o: [1980, 160] as [number, number], cloth: C.coat, kind: "owner" },
    { o: [1980, 560] as [number, number], cloth: C.navy, kind: "station" },
  ];
  const bub = pop(seg(f, 26, 34));
  return (
    <Frame f={f} seed={6200} dark>
      <g transform={cam(k, cx, cy)}>
        <Shinshitsu f={f} sky={0} sleeper={0.7} alarms={0} time={Math.round(time)} />
        {/* 時計のまわりの月明かり (主役を浮かせる) */}
        <circle cx={MZJ200_CK[0]} cy={MZJ200_CK[1]} r={150} fill="#C9D6F2" opacity={0.12} />
        {/* 4本の袖の手 */}
        {arms.map((A, i) => {
          const e = easeOut(seg(f, 6 + i * 5, 16 + i * 5));
          if (e <= 0) return null;
          const g = grips[i];
          const jig = tug > 0 && tug < 1 ? Math.sin(f * 1.3 + i * 2) * 5 : sway * (i % 2 ? 1 : -1);
          const tx = lerp(A.o[0], g[0], e) + jig * 0.3, ty = lerp(A.o[1], g[1], e) + jig * 0.3;
          const mx = (A.o[0] + tx) / 2 + (ty - A.o[1]) * 0.12, my = (A.o[1] + ty) / 2 - (tx - A.o[0]) * 0.12;
          const ang = Math.atan2(ty - my, tx - mx) * 180 / Math.PI;
          return (
            <g key={i}>
              <path d={`M ${A.o[0]} ${A.o[1]} Q ${mx} ${my} ${tx} ${ty}`} stroke={KRP.ink} strokeWidth={26} fill="none" strokeLinecap="round" />
              <path d={`M ${A.o[0]} ${A.o[1]} Q ${mx} ${my} ${tx} ${ty}`} stroke={A.cloth} strokeWidth={18} fill="none" strokeLinecap="round" />
              <g transform={`translate(${tx} ${ty}) rotate(${ang})`}>
                {A.kind === "monk" && <path d="M -64 -26 L -26 -20 L -26 20 L -64 30 Z" fill={MP.habitMid} stroke={KRP.ink} strokeWidth={4} />}
                {A.kind === "edo" && <g><rect x={-70} y={10} width={46} height={44} rx={6} fill={C.indigo} stroke={KRP.ink} strokeWidth={4} /><path d="M -62 24 L -32 24 M -62 38 L -32 38" stroke={C.indigoDark} strokeWidth={3} /></g>}
                {A.kind === "owner" && <g>
                  <rect x={-34} y={-15} width={14} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                  <path d={`M -40 12 Q -30 ${44 + sway * 2} -14 ${50 + sway * 3}`} stroke={MP.brass} strokeWidth={4} fill="none" strokeDasharray="5 3" />
                  <circle cx={-12} cy={56 + sway * 3} r={11} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
                </g>}
                {A.kind === "station" && <g>
                  <rect x={-40} y={-16} width={18} height={32} fill={C.navyDark} stroke={KRP.ink} strokeWidth={3.5} />
                  <path d="M -36 -16 L -36 16 M -28 -16 L -28 16" stroke={MP.brass} strokeWidth={3} />
                </g>}
                {/* つまむ手 (親指と人さし指) */}
                <circle cx={-6} cy={0} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <ellipse cx={10} cy={-8} rx={9} ry={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                <ellipse cx={10} cy={8} rx={9} ry={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
              </g>
            </g>
          );
        })}
        {/* 引っぱり合いの「ぐいっ」線 */}
        {tug > 0 && tug < 1 && [0, 1, 2].map((j) => (
          <path key={j} d={`M ${MZJ200_CK[0] - 110 - j * 14} ${MZJ200_CK[1] - 40 + j * 40} q -14 10 0 20`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {/* ピン (針を早い時刻に留める) */}
        {pinned && (() => {
          const [px, py] = pt(mA, 40);
          const sc = pop(seg(f, 40, 46));
          return <g transform={`translate(${px} ${py}) scale(${sc})`}>
            <line x1={0} y1={0} x2={10} y2={14} stroke={KRP.silver} strokeWidth={4} />
            <circle cx={-2} cy={-4} r={15} fill={MP.bell} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-7} cy={-9} r={4} fill={KRP.white} opacity={0.8} />
            {f < 52 && [0, 1, 2, 3].map((j) => <line key={j} x1={0} y1={0} x2={0} y2={-30} stroke={MP.glow} strokeWidth={4} transform={`rotate(${j * 90 + 45}) translate(0 -14)`} />)}
          </g>;
        })()}
        {/* 夢の吹き出し: 体内時計を抱えて困る小人 */}
        {bub > 0 && (
          <g transform={`translate(860 430) scale(${bub})`}>
            <circle cx={150} cy={130} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={110} cy={92} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <ellipse cx={0} cy={0} rx={92} ry={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <Kobito x={0} y={58} s={0.24} f={f} pose="hold" face="worried" phase={4} />
            <TainaiDokei x={0} y={22} s={0.085} f={f} lag={0.2} kobito={false} label={false} hand={0.25} />
            <path d={`M 34 ${-30 + Math.sin(f / 6) * 2} q 6 10 0 16 q -6 -6 0 -16 Z`} fill="#9FD0EE" stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #201 修道院の合図。町の鐘。工場の門。鉄道の時刻表。
// 格: 並 / seed 6201
// 絵: どこ: 長い横長の1枚の絵を、カメラが左から右へ連続でパンしていく (4つの場面が地続きにつながった絵巻)。演出:①Shudouin (dark=0.8, candle=2, bell=1): 修道院長が手の小さな鈴を鳴らす ②TokiNoKane (swing=1, sky=夜明け): 撞木が鐘をゴーンと打ち、瓦屋根に音の輪が広がる ③KoujouMon (gate=1→0, hands=始業の時刻): 門の上の時計が鳴り、鉄の門が閉まりはじめる ④19世紀の駅の時刻表の掲示板 (数字だけ) の前で、紺の制服の駅長 (男性) が懐中時計を見て笛を吹き、蒸気機関車の煙が上がる。どの場面も、寝ぼけまなこの人がその合図で飛び起きたり走り出したりする小さな反応を入れる。動き: f0-40 ①鈴 / f40-80 ②鐘 / f80-120 ③門 / f120-160 ④笛と煙 (カメラは止まらず右へパン)
// どこ: 机の上に広げた長い絵巻。修道院→江戸の時の鐘→工場の門→19世紀の駅、の4場面が金の雲でつながる
// 演出: 各場面の合図 (鈴・鐘・門の時計・駅長の笛) で、寝ぼけた人が飛び起きる/走り出す
// 動き: カメラは止まらず右へパン (f=45 で②の鐘が鳴った瞬間が画面の中央)。①f4-34 / ②f34-60 / ③f80-125 / ④f130-
const MZJ_PS = 0.6, MZJ_PW = 1152, MZJ_PH = 648, MZJ_PY = 170;
const mzjPanelX = (i: number) => 40 + i * (MZJ_PW + 40);
// 19世紀の駅 (1920×1080 の舞台。このファイルだけ)
const MzJStation: React.FC<{ f: number; smoke: number }> = ({ f, smoke }) => (
  <g>
    <MzJSky x={-40} y={-40} w={2000} h={800} sky={1.1} />
    {/* 駅舎のれんがの壁とアーチ窓 */}
    <rect x={-40} y={160} width={2000} height={660} fill={MP.brick} />
    {Array.from({ length: 22 }, (_, r) => <line key={r} x1={-40} y1={190 + r * 30} x2={1960} y2={190 + r * 30} stroke={MP.mortar} strokeWidth={3} opacity={0.6} />)}
    {[900, 1100].map((wx) => (
      <g key={wx}>
        <path d={`M ${wx - 60} 560 L ${wx - 60} 330 A 60 60 0 0 1 ${wx + 60} 330 L ${wx + 60} 560 Z`} fill="#3A3F52" stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${wx} 270 L ${wx} 560 M ${wx - 60} 420 L ${wx + 60} 420`} stroke={MP.stoneLight} strokeWidth={5} />
        <rect x={wx - 60} y={330} width={120} height={230} fill="#FFD873" opacity={0.25} />
      </g>
    ))}
    {/* 屋根 (鉄の梁) と柱 */}
    <rect x={-40} y={60} width={2000} height={100} fill={MP.iron} stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M ${i * 100 - 40} 160 L ${i * 100 + 10} 70 L ${i * 100 + 60} 160`} stroke={MP.ironLight} strokeWidth={5} fill="none" />)}
    {[760, 1240, 1780].map((px) => <rect key={px} x={px - 14} y={160} width={28} height={660} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />)}
    {/* 時刻表の掲示板 (数字だけ) */}
    <rect x={1290} y={240} width={420} height={330} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={7} />
    <rect x={1310} y={260} width={380} height={290} fill="#22262E" stroke={KRP.ink} strokeWidth={4} />
    {/* 時刻は事実確認していないので数字を書かず、読めない文字 (短い線と波線) にする */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <path d={`M 1340 ${298 + i * 54} q 7 -9 14 0 t 14 0 t 14 0 M 1394 ${298 + i * 54} L 1410 ${298 + i * 54} M 1422 ${298 + i * 54} q 7 -9 14 0 t 14 0`}
          stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
        <rect x={1480} y={290 + i * 54} width={180} height={18} rx={4} fill={KRP.white} opacity={0.35} />
      </g>
    ))}
    {/* 蒸気機関車 (左) */}
    <g>
      <rect x={-40} y={380} width={260} height={330} fill={C.loco} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-60} y={360} width={300} height={30} fill={KRP.ink} />
      <rect x={20} y={420} width={120} height={110} fill="#FFD873" opacity={0.5} stroke={KRP.ink} strokeWidth={5} />
      <rect x={210} y={480} width={440} height={220} rx={40} fill={C.loco} stroke={KRP.ink} strokeWidth={7} />
      {[300, 420, 540].map((bx) => <line key={bx} x1={bx} y1={482} x2={bx} y2={698} stroke={MP.ironLight} strokeWidth={5} />)}
      <rect x={520} y={380} width={56} height={104} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 506 384 L 590 384 L 600 360 L 496 360 Z" fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 380 480 Q 380 430 420 430 Q 460 430 460 480 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
      <rect x={640} y={640} width={50} height={60} fill={C.locoRed} stroke={KRP.ink} strokeWidth={5} />
      {[[150, 80], [330, 80], [520, 54]].map(([wx, r]) => (
        <g key={wx} transform={`rotate(${f * 4} ${wx} ${800 - r})`}>
          <circle cx={wx} cy={800 - r} r={r} fill={C.locoRed} stroke={KRP.ink} strokeWidth={6} />
          {[0, 45, 90, 135].map((a) => <line key={a} x1={wx} y1={800 - r - r * 0.8} x2={wx} y2={800 - r + r * 0.8} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${a} ${wx} ${800 - r})`} />)}
        </g>
      ))}
      <line x1={150} y1={720} x2={330} y2={720} stroke={KRP.silver} strokeWidth={10} />
    </g>
    {/* 煙 */}
    {Array.from({ length: 6 }, (_, i) => {
      const p = ((f / 40 + i / 6) % 1);
      const r = (30 + p * 90) * (0.5 + smoke);
      return <circle key={i} cx={548 + p * 220 + Math.sin(p * 6 + i) * 20} cy={350 - p * 300} r={r} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} opacity={(1 - p) * (0.4 + 0.5 * smoke)} />;
    })}
    {/* ホーム (石) */}
    <rect x={-40} y={800} width={2000} height={300} fill={MP.stoneLight} />
    <rect x={-40} y={800} width={2000} height={24} fill={MP.stone} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={824} x2={i * 180 - 60} y2={1080} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />)}
  </g>
);
const MzJPanel: React.FC<{ i: number; children: React.ReactNode; label?: string; lt?: number }> = ({ i, children, label, lt = 1 }) => {
  const x0 = mzjPanelX(i);
  const id = `mzjPanel${i}`;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x0} y={MZJ_PY} width={MZJ_PW} height={MZJ_PH} /></clipPath></defs>
      <g clipPath={`url(#${id})`}><g transform={`translate(${x0} ${MZJ_PY}) scale(${MZJ_PS})`}>{children}</g></g>
      <rect x={x0} y={MZJ_PY} width={MZJ_PW} height={MZJ_PH} fill="none" stroke={KRP.ink} strokeWidth={6} />
      {label && <TagPlate x={x0 + MZJ_PW / 2} y={150} text={label} size={30} t={lt} />}
    </g>
  );
};
// 絵巻の金の雲 (場面の境目)
const MzJCloud: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x + Math.sin(f / 30 + x) * 6} ${y}) scale(${s})`}>
    <path d="M -120 20 Q -130 -20 -80 -24 Q -70 -60 -20 -50 Q 10 -80 50 -50 Q 100 -60 110 -20 Q 150 -10 130 20 Z" fill={C.cloud} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -80 0 Q -40 -16 0 0 Q 40 -16 80 0" stroke={C.cloudDark} strokeWidth={4} fill="none" />
  </g>
);
const MzJScrollBase: React.FC<{ w: number; f: number }> = ({ w, f }) => (
  <g>
    <rect x={-400} y={-40} width={w + 800} height={1160} fill={C.table} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M -400 ${40 + i * 140} q ${w / 2} ${rnd(3, i) * 30 - 15} ${w + 800} 0`} stroke="#6E472B" strokeWidth={5} fill="none" opacity={0.5} />)}
    <rect x={0} y={120} width={w} height={730} fill={C.paper} stroke={KRP.ink} strokeWidth={6} />
    <rect x={0} y={120} width={w} height={18} fill={C.paperDark} />
    <rect x={0} y={832} width={w} height={18} fill={C.paperDark} />
    {/* 巻いた軸 (両端) */}
    {[-30, w].map((rx) => (
      <g key={rx}>
        <rect x={rx} y={100} width={30} height={770} rx={12} fill={C.paperDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={rx + 4} y={80} width={22} height={810} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {void f}
  </g>
);
const Mz201: React.FC<{ f: number }> = ({ f }) => {
  const o = -344 + 22.35 * f;
  // ① 修道院
  const bell1 = seg(f, 4, 10) * (1 - seg(f, 34, 44));
  const woke1 = f >= 14;
  const j1 = Math.sin(Math.PI * seg(f, 14, 26)) * 70;
  // ② 江戸
  const swing = f < 34 ? lerp(0.25, 0, seg(f, 18, 34)) : easeOut(seg(f, 34, 41));
  const woke2 = f >= 42;
  const j2 = Math.sin(Math.PI * seg(f, 42, 56)) * 80;
  // ③ 工場
  const gate = 1 - seg(f, 86, 126);
  const hands = lerp(355, 360, seg(f, 60, 86));
  const rr = seg(f, 70, 125);
  // ④ 駅
  const wh = seg(f, 132, 138);
  const smoke = seg(f, 134, 150);
  const rn4 = seg(f, 138, 165);
  const W2 = mzjPanelX(4) + 0;
  return (
    <Frame f={f} seed={6201} bg={C.table}>
      <g transform={`translate(${-o} 0)`}>
        <MzJScrollBase w={W2} f={f} />
        {/* ① 修道院の合図 */}
        <MzJPanel i={0} label="修道院">
          <Shudouin f={f} dark={0.8} candle={2} bell={bell1} />
          <MzJLying x={1180 - 118 + 205} y={692} s={0.9} f={f} cloth={MP.habit} clothDark={MP.habitMid} hair="cap" headLeft under={<MzJMonkHoodPillow />} extra={<MzJTonsure brows={false} />} blanket={woke1 ? undefined : "#8F8A86"} />
          {woke1 && (
            <g>
              <Person x={1180} y={900 - j1} s={0.95} f={f} pose="banzai" face="surprised" cloth={MP.habit} clothDark={MP.habitMid} hair="cap" gaze={[5, -3]} />
              <MzJOn x={1180} y={900 - j1} s={0.95} f={f}><MzJMonkWear /></MzJOn>
            </g>
          )}
          <Person x={1450} y={880} s={1.0} f={f} pose="raise" face="smile" cloth={MP.habit} clothDark={MP.habitMid} hair="none" phase={2} gaze={[-5, 0]} />
          <MzJOn x={1450} y={880} s={1.0} f={f} phase={2}>
            <MzJMonkWear old cross />
            <g transform={`translate(67 -236) rotate(${Math.sin(f * 1.1) * 25 * bell1})`}>
              <line x1={0} y1={0} x2={0} y2={-30} stroke={MP.woodDark} strokeWidth={8} />
              <path d="M -22 30 Q -22 -6 0 -8 Q 22 -6 22 30 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} transform="translate(0 -60) rotate(180 0 10)" />
            </g>
          </MzJOn>
        </MzJPanel>
        {/* ② 江戸の時の鐘 */}
        <MzJPanel i={1} label="江戸">
          <TokiNoKane f={f} swing={swing} sky={1} />
          <Person x={TOKI_ROPE[0]} y={TOKI_ROPE[1] + 112} s={0.95} f={f} pose="hold" face={swing > 0.9 ? "smile" : "normal"} lean={lerp(-8, 6, swing)} cloth={C.indigo} clothDark={C.indigoDark} hair="cap" phase={1} />
          <MzJOn x={TOKI_ROPE[0]} y={TOKI_ROPE[1] + 112} s={0.95} f={f} phase={1} lean={lerp(-8, 6, swing)}>
            <MzJHanten />
            <MzJMage />
            <rect x={-14} y={-128} width={28} height={20} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          </MzJOn>
          {/* 縁台で居眠りの町人 → 鐘で飛び起きる */}
          <rect x={300} y={880} width={420} height={30} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          {[330, 680].map((lx) => <rect key={lx} x={lx} y={908} width={18} height={100} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
          {!woke2 ? (
            <MzJLying x={650} y={826} s={0.9} f={f} cloth="#6B7F5E" clothDark="#4F5F45" headLeft extra={<MzJMage />} blanket={undefined} />
          ) : (
            <g>
              <Person x={520} y={1000 - j2} s={0.95} f={f} pose="banzai" face="surprised" cloth="#6B7F5E" clothDark="#4F5F45" hair="cap" gaze={[6, -2]} />
              <MzJOn x={520} y={1000 - j2} s={0.95} f={f}><MzJMage /></MzJOn>
            </g>
          )}
        </MzJPanel>
        {/* ③ 工場の門 */}
        <MzJPanel i={2} label="工場">
          <KoujouMon f={f} gate={gate} hands={hands} smoke={1} />
          {/* 走りこむ男女 */}
          <Person x={lerp(1800, 1240, rr)} y={960} s={1.0} f={f} pose="run" face="worried" cloth={C.vest} clothDark={C.grayDark2} hair="cap" gaze={[-6, 0]} lean={-6} />
          <MzJOn x={lerp(1800, 1240, rr)} y={960} s={1.0} f={f} lean={-6}><MzJFlatCap /></MzJOn>
          <MzJOn x={lerp(1990, 1420, rr)} y={980} s={0.95} f={f} phase={2} lean={-6}><MzJOldWoman part="back" /></MzJOn>
          <Person x={lerp(1990, 1420, rr)} y={980} s={0.95} f={f} pose="run" face="surprised" cloth={C.skirt} clothDark={C.skirtDark} hair="none" phase={2} gaze={[-6, 0]} lean={-6} />
          <MzJOn x={lerp(1990, 1420, rr)} y={980} s={0.95} f={f} phase={2} lean={-6}><MzJOldWoman part="front" /></MzJOn>
        </MzJPanel>
        {/* ④ 鉄道の時刻表 */}
        <MzJPanel i={3} label="鉄道">
          <MzJStation f={f} smoke={smoke} />
          <Person x={1150} y={960} s={1.05} f={f} pose="hold" face={wh > 0 ? "angry" : "normal"} cloth={C.navy} clothDark={C.navyDark} hair="cap" gaze={wh > 0 ? [6, 0] : [-2, 6]} />
          <MzJOn x={1150} y={960} s={1.05} f={f}>
            <MzJCap color={C.navy} />
            {[-120, -96, -72].map((by) => <circle key={by} cx={0} cy={by} r={4} fill={MP.brass} />)}
            <circle cx={-14} cy={-124} r={14} fill={MP.brass} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={-14} cy={-124} r={9} fill={KRP.white} />
            {wh > 0 && <g>
              <rect x={8} y={-192} width={44} height={14} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
              {[0, 1, 2].map((j) => <line key={j} x1={62} y1={-196 + j * 10} x2={92 + Math.sin(f) * 4} y2={-214 + j * 18} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={wh} />)}
            </g>}
          </MzJOn>
          {/* 寝ぼけて走る乗客 */}
          {rn4 > 0 && <g>
            <Person x={lerp(2000, 1500, rn4)} y={980} s={1.0} f={f} pose="run" face="surprised" cloth={C.brown} clothDark={C.vest} hair="cap" gaze={[-6, 0]} lean={-8} phase={3} />
            <rect x={lerp(2000, 1500, rn4) + 60} y={880} width={70} height={56} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>}
        </MzJPanel>
        {/* 金の雲 (境目と上下) */}
        {[0, 1, 2, 3].map((i) => <g key={i}>
          <MzJCloud x={mzjPanelX(i) + 180} y={790} s={1.1} f={f} />
          <MzJCloud x={mzjPanelX(i) + MZJ_PW - 160} y={200} s={0.9} f={f} />
          {i > 0 && <MzJCloud x={mzjPanelX(i) - 20} y={500} s={1.3} f={f} />}
        </g>)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #202 だから、人を起こすのも、いつも他人でした。
// 格: 山 / seed 6202
// 絵: どこ: #201 の絵巻の続き、全場面を引いて見渡す (カメラが一気に引く)。演出: 絵巻のどの場面にも寝ている人が1人ずつ描かれていて、その人を起こす他人がそれぞれの時代の姿で枕元に立つ。宮殿の石段の鶏人 (赤い冠・口を大きく開ける・男性)、修道院の年上の修道士 (白いひげ・若い修道士をつつく)、江戸の鐘撞き (半纏の男性)、イギリスの石畳の KnockerUp (pose="knock")。f の合図で全員が同時に「起きろ!」の動作をすると、寝ていた人たちが全員そろって飛び起きる (場面をまたいで同じ高さで跳ねる)。起きた人たちが、自分を起こした人のほうを振り返る。動き: f0-30 カメラが一気に引いて絵巻の全体 / f30-60 起こす人たちが構える / f60-80 同時に起こす / f80-110 全員が飛び起きる / f110-150 振り返る
// どこ: #201 と同じ絵巻を引いて見渡す。宮殿の石段・修道院・江戸の時の鐘・イギリスの石畳の4場面が横一列
// 演出: どの場面にも眠る人と、その枕元に立つ「起こす他人」(鶏人・年上の修道士・鐘撞き・ノッカー・アップ)。
//       合図で全員が同時に起こし、眠っていた4人がそろって同じ高さで跳ね起きる → 起こした人のほうを向く
// 動き: f0-18 カメラが一気に引く / f18-30 構える / f30-36 同時に起こす / f34-58 跳ね起きる (f=45 で空中) / f60- 振り返る
const MZJ202_SC = 600 / 1080, MZJ202_W = 450, MZJ202_Y = 170;
const mzj202X = (i: number) => 30 + i * 470;
const MzJ202Panel: React.FC<{ i: number; cropX: number; children: React.ReactNode; label: string; lt: number }> = ({ i, cropX, children, label, lt }) => {
  const x0 = mzj202X(i), id = `mzj202p${i}`;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x0} y={MZJ202_Y} width={MZJ202_W} height={600} /></clipPath></defs>
      <g clipPath={`url(#${id})`}><g transform={`translate(${x0} ${MZJ202_Y}) scale(${MZJ202_SC}) translate(${-cropX} 0)`}>{children}</g></g>
      <rect x={x0} y={MZJ202_Y} width={MZJ202_W} height={600} fill="none" stroke={KRP.ink} strokeWidth={6} />
      <TagPlate x={x0 + MZJ202_W / 2} y={174} text={label} size={30} t={lt} />
    </g>
  );
};
const Mz202: React.FC<{ f: number }> = ({ f }) => {
  const cz = easeInOut(seg(f, 0, 18));
  const k = lerp(1.9, 1, cz), cx = lerp(mzj202X(1) + 225, 960, cz), cy = lerp(470, 540, cz);
  const lt = seg(f, 18, 26);
  const ready = seg(f, 18, 30);
  const act = f >= 30;
  const woke = f >= 34;
  const jump = Math.sin(Math.PI * seg(f, 34, 58)) * 140;
  const turn = f >= 60;
  const st = (j: number) => 900 - j; // 全員共通の足元の高さ (舞台の座標)
  const mouth = act ? 1 : 0.3;
  const swing = f < 30 ? lerp(0, 0.2, ready) : easeOut(seg(f, 30, 35));
  return (
    <Frame f={f} seed={6202} bg={C.table}>
      <g transform={cam(k, cx, cy)}>
        <MzJScrollBase w={1920} f={f} />
        {/* 1 宮殿の石段: 鶏人が叫ぶ */}
        <MzJ202Panel i={0} cropX={560} label="宮殿" lt={lt}>
          <MzJPalaceArt f={f} sky={0.45} />
          {!woke ? <MzJLying x={700} y={852} s={0.9} f={f} cloth="#5A6E9A" clothDark="#3E4F75" headLeft={false} blanket="#B9A27A" />
            : <Person x={820} y={st(jump)} s={0.95} f={f} pose="banzai" face={turn ? "worried" : "surprised"} cloth="#5A6E9A" clothDark="#3E4F75" hair="cap" gaze={turn ? [7, 0] : [0, -4]} />}
          <Person x={1150} y={930} s={0.95} f={f} pose="banzai" face="surprised" cloth={C.robe} clothDark={C.robeDark} hair="none" lean={act ? -6 : lerp(0, 4, ready)} gaze={[-7, 0]} phase={1} />
          <MzJOn x={1150} y={930} s={0.95} f={f} phase={1} lean={act ? -6 : lerp(0, 4, ready)}>
            <MzJKeijin />
            <MzJMouth o={mouth} />
          </MzJOn>
          {act && f < 70 && [0, 1, 2].map((j) => <path key={j} d={`M ${1040 - j * 30} ${640 - j * 4} q -20 30 0 60`} stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - seg(f, 50, 70)} />)}
        </MzJ202Panel>
        {/* 2 修道院: 年上の修道士がつつく */}
        <MzJ202Panel i={1} cropX={335} label="修道院" lt={lt}>
          <Shudouin f={f} dark={0.75} candle={2} />
          {!woke ? <MzJLying x={827} y={692} s={0.9} f={f} cloth={MP.habit} clothDark={MP.habitMid} hair="cap" headLeft under={<MzJMonkHoodPillow />} extra={<MzJTonsure brows={false} />} blanket="#8F8A86" />
            : <g><Person x={800} y={st(jump)} s={0.95} f={f} pose="banzai" face={turn ? "worried" : "surprised"} cloth={MP.habit} clothDark={MP.habitMid} hair="cap" gaze={turn ? [-7, 0] : [0, -4]} />
              <MzJOn x={800} y={st(jump)} s={0.95} f={f}><MzJMonkWear /></MzJOn></g>}
          <Person x={act ? 500 : 470} y={900} s={1.0} f={f} pose="point" pointDir={1} face="smile" cloth={MP.habit} clothDark={MP.habitMid} hair="none" phase={2} gaze={[6, 0]} />
          <MzJOn x={act ? 500 : 470} y={900} s={1.0} f={f} phase={2}><MzJMonkWear old /></MzJOn>
        </MzJ202Panel>
        {/* 3 江戸: 鐘撞きが撞木を打つ */}
        <MzJ202Panel i={2} cropX={885} label="江戸" lt={lt}>
          <TokiNoKane f={f} swing={swing} sky={0.9} />
          <rect x={1380} y={880} width={360} height={30} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          {[1400, 1700].map((lx) => <rect key={lx} x={lx} y={908} width={18} height={100} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
          {!woke ? <MzJLying x={1650} y={826} s={0.9} f={f} cloth="#6B7F5E" clothDark="#4F5F45" headLeft extra={<MzJMage />} />
            : <g><Person x={1560} y={st(jump)} s={0.95} f={f} pose="banzai" face={turn ? "worried" : "surprised"} cloth="#6B7F5E" clothDark="#4F5F45" hair="cap" gaze={turn ? [-7, 0] : [0, -4]} />
              <MzJOn x={1560} y={st(jump)} s={0.95} f={f}><MzJMage /></MzJOn></g>}
          <Person x={TOKI_ROPE[0]} y={TOKI_ROPE[1] + 112} s={0.95} f={f} pose="hold" face="smile" lean={lerp(-8, 6, swing)} cloth={C.indigo} clothDark={C.indigoDark} hair="cap" phase={1} />
          <MzJOn x={TOKI_ROPE[0]} y={TOKI_ROPE[1] + 112} s={0.95} f={f} phase={1} lean={lerp(-8, 6, swing)}><MzJHanten /><MzJMage /></MzJOn>
        </MzJ202Panel>
        {/* 4 イギリスの石畳: ノッカー・アップが窓をたたく */}
        <MzJ202Panel i={3} cropX={60} label="イギリス" lt={lt}>
          <MachiNami f={f} windows={[0, woke ? "open" : 0, 0, 0, 0, 0]} sky={0.35} />
          {woke && (() => {
            const [wx, wy] = MACHI_WIN[1];
            return <g>
              <defs><clipPath id="mzj202win"><rect x={wx - 62} y={wy - 120} width={124} height={202} /></clipPath></defs>
              <g clipPath="url(#mzj202win)">
                <Person x={wx} y={wy + 170 - jump * 0.6} s={0.6} f={f} pose="banzai" face={turn ? "worried" : "surprised"} cloth={C.gray} clothDark={C.grayDark2} hair="cap" gaze={turn ? [-7, 3] : [0, -4]} />
              </g>
            </g>;
          })()}
          <KnockerUp x={260} y={900} s={0.95} f={f} pose={act ? "knock" : "walk"} tip={MACHI_WIN[1]} face="smile" />
        </MzJ202Panel>
        {[0, 1, 2, 3].map((i) => <MzJCloud key={i} x={mzj202X(i) + (i % 2 ? 320 : 120)} y={800} s={0.8} f={f} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #203 鶏人。修道士。番人を起こす時計。ノッカー・アップ。そして、ノッカー・アップを起こす、目覚まし時計。
// 格: 山 / seed 6203
// 絵: どこ: 夜明け前の町並みの石畳の通り (遠くにウィーンの塔の影と、ボルトンの連続住宅とガス灯)。通りを左から右へ歩いてくる「起こす人たち」のパレード。演出: 先頭から順に1人ずつ画面に入ってきて止まり、名乗るようにポーズを取る: ①鶏人 (赤い頭巾・とさかの冠・長い袖、口を大きく開けて叫ぶ) ②修道士 (年上・白いひげ・手に小さな鈴) ③BanninTou の鉄の時計 (ring=1) を台車に乗せて押してくる眠そうな番人 (茶色のマントとランタン) ④KnockerUp (pose="walk", old=true) の老人が長い棒をかつぐ ⑤最後に、老人の足もとから BellClock (ring=1) がちょこちょこ歩いて出てきて、いちばん前に立ち、ハンマーをベルにちりんと一度打っておじぎをする。老人がその時計を見下ろしてうなずく。全員が横一列に並んだところで、朝日がさす。動き: f0-140 左から順に1人ずつ入ってくる (カメラは右へゆっくりパンしながら追う) / 5人目の時計が登場したところで少しだけ寄る / f140-170 朝日がさす
// どこ: 夜明け前の石畳の通り (左奥にウィーンの塔の尖塔の影、右にボルトンの連続住宅、ガス灯)
// 演出: 「起こす人たち」のパレード。左から1人ずつ入って名乗るポーズ: ①鶏人が叫ぶ ②年上の修道士が鈴 ③眠そうな番人が鉄の時計を台車で押す
//       ④ノッカー・アップの老人が棒をかつぐ ⑤老人の足もとからベル時計がちょこちょこ出てきて先頭に立ち、ちりんと一度鳴っておじぎ → 老人がうなずく → 朝日
// 動き: f0-84 1人ずつ入場 (カメラは右へゆっくりパン) / f92-112 時計が歩き出る (少し寄る) / f112 ちりん / f118-132 おじぎ / f122-140 うなずく / f140-170 朝日
// 番人を起こす鉄の時計 (BanninTou の中の時計と同じ形。台車に載せるので、ここだけ単体で描く)
const MzJIronClock: React.FC<{ x: number; y: number; s: number; f: number; ring: number }> = ({ x, y, s, f, ring }) => {
  const hammer = ring > 0.02 ? Math.sin(f * 2.6) * 34 * ring : 0;
  const shake = ring > 0.02 ? Math.sin(f * 3.3) * 2.5 * ring : 0;
  const foliot = Math.sin(f / 7) * 18;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      <rect x={-70} y={-20} width={140} height={136} fill="#4E535B" stroke={KRP.ink} strokeWidth={5} />
      {[-70, 70].map((px) => (
        <g key={px}>
          <rect x={px - 8} y={-36} width={16} height={156} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${px - 10} -36 L ${px} -60 L ${px + 10} -36 Z`} fill={MP.iron} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={px} cy={-62} r={5} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      ))}
      <rect x={-82} y={112} width={164} height={14} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-80} y={-34} width={160} height={12} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-34} cy={92} r={14} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${f * 2} -34 92)`} />
      <circle cx={40} cy={92} r={10} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={2.5} />
      <circle cx={0} cy={38} r={50} fill="#E9E2CF" stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={Math.sin(a) * 38} y1={38 - Math.cos(a) * 38} x2={Math.sin(a) * 46} y2={38 - Math.cos(a) * 46} stroke={KRP.ink} strokeWidth={i % 3 ? 2.5 : 4.5} />;
      })}
      <path d="M -3 42 L 0 2 L 3 42 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} transform="rotate(150 0 38)" />
      <circle cx={0} cy={38} r={5} fill={MP.brass} stroke={KRP.ink} strokeWidth={2} />
      <line x1={0} y1={-34} x2={0} y2={-74} stroke={MP.iron} strokeWidth={6} />
      <g transform={`rotate(${foliot} 0 -64)`}>
        <rect x={-66} y={-68} width={132} height={8} rx={3} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-66} y={-74} width={14} height={20} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
        <rect x={52} y={-74} width={14} height={20} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <line x1={0} y1={-74} x2={0} y2={-92} stroke={MP.iron} strokeWidth={6} />
      <path d="M -34 -96 Q -32 -134 0 -136 Q 32 -134 34 -96 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -22 -104 Q -20 -124 -6 -128" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
      <g transform={`rotate(${-18 + hammer * 0.6} 74 -40)`}>
        <line x1={74} y1={-40} x2={40} y2={-112} stroke={MP.iron} strokeWidth={6} strokeLinecap="round" />
        <circle cx={38} cy={-116} r={10} fill={MP.iron} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <circle cx={74} cy={-40} r={6} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
      {ring > 0.02 && [0, 1, 2].map((j) => <path key={j} d={`M ${50 + j * 22} -150 q 16 20 0 40`} stroke={MP.glow} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 2 + j)} />)}
    </g>
  );
};
const Mz203: React.FC<{ f: number }> = ({ f }) => {
  const GY = 830;
  const X = [230, 560, 900, 1260, 1590];
  const T = [0, 18, 36, 56];
  const ent = (i: number) => easeOut(seg(f, T[i], T[i] + 26));
  const xs = X.slice(0, 4).map((x, i) => lerp(x - 220, x, ent(i)));
  const ys = X.slice(0, 4).map((_, i) => lerp(GY - 150, GY, ent(i)));
  const ks = X.slice(0, 4).map((_, i) => ent(i) <= 0 ? 0 : lerp(0.62, 1, ent(i)));
  const moving = (i: number) => ent(i) > 0 && ent(i) < 1;
  const sun = easeOut(seg(f, 140, 170));
  const sky = lerp(0.3, 1.25, sun);
  const pan = lerp(860, 1060, easeInOut(seg(f, 0, 140)));
  const zoom = lerp(1, 1.06, easeOut(seg(f, 92, 120)));
  // ⑤ ベル時計
  const cw = seg(f, 92, 112);
  const bx = lerp(1290, X[4], easeInOut(cw));
  const bs = lerp(0.3, 0.72, easeOut(seg(f, 92, 100)));
  const by = GY - 160 * bs - (cw > 0 && cw < 1 ? Math.abs(Math.sin(f / 2.5)) * 14 : 0);
  const chirin = f >= 112 && f < 118 ? 1 : 0;
  const bow = Math.sin(Math.PI * seg(f, 118, 132)) * 28;
  const nod = Math.sin(Math.PI * seg(f, 122, 132)) * 6 + Math.sin(Math.PI * seg(f, 132, 140)) * 6;
  const shout = f >= 26 && f < 48;
  const PY = 250;
  const names = ["鶏人", "修道士", "番人の時計", "ノッカー・アップ", "目覚まし時計"];
  const plateX = [X[0], X[1], X[2] + 60, X[3], X[4]];
  const plateT = [seg(f, 24, 30), seg(f, 42, 48), seg(f, 60, 66), seg(f, 80, 86), seg(f, 110, 116)];
  const cartX = xs[2] + 150;
  return (
    <Frame f={f} seed={6203} dark={sun < 0.5}>
      <g transform={cam(zoom, pan, 540)}>
        <MzJSky x={-300} y={-40} w={2600} h={720} sky={sky} n={14} />
        {sun > 0 && <g>
          <circle cx={1900} cy={lerp(640, 420, sun)} r={160} fill={MP.glow} opacity={0.35 * sun} />
          <circle cx={1900} cy={lerp(640, 420, sun)} r={80} fill={mixColor("#F48A4C", "#FFE9A0", sun)} />
        </g>}
        {/* 左奥: ウィーンの塔の影 */}
        <g fill={mixColor("#2C3354", "#7C86A6", sky / 2)} stroke={KRP.ink} strokeWidth={4}>
          <path d="M -60 640 L -60 340 L 40 340 L 40 640 Z" />
          <path d="M 20 640 L 20 300 L 70 220 L 90 40 L 110 220 L 160 300 L 160 640 Z" />
          {[120, 180, 240].map((yy) => <rect key={yy} x={76} y={yy + 60} width={28} height={36} rx={12} fill="#FFD873" opacity={0.6 * (1 - sun)} />)}
        </g>
        {/* 右: ボルトンの連続住宅 */}
        {Array.from({ length: 7 }, (_, i) => {
          const hx = 380 + i * 260;
          return (
            <g key={i}>
              <rect x={hx} y={400} width={260} height={260} fill={mixColor(MP.brickDark, MP.brick, sky / 1.3)} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${hx - 10} 400 L ${hx + 40} 350 L ${hx + 220} 350 L ${hx + 270} 400 Z`} fill="#3E4556" stroke={KRP.ink} strokeWidth={5} />
              <rect x={hx + 180} y={310} width={34} height={48} fill={MP.brickDark} stroke={KRP.ink} strokeWidth={4} />
              {[hx + 40, hx + 150].map((wx, j) => <rect key={j} x={wx} y={440} width={66} height={80} fill={(i + j) % 3 === 0 ? "#FFD873" : "#262B40"} opacity={(i + j) % 3 === 0 ? 0.9 - sun * 0.5 : 1} stroke={KRP.ink} strokeWidth={4} />)}
              <rect x={hx + 100} y={560} width={56} height={100} fill="#3E5C46" stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 歩道と石畳 */}
        <rect x={-300} y={656} width={2600} height={30} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-300} y={686} width={2600} height={420} fill={mixColor("#6E6A66", "#9A948C", sky / 1.3)} />
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 30 }, (_, c) => (
          <ellipse key={`${r}-${c}`} cx={-280 + c * 90 + (r % 2) * 45} cy={712 + r * 62} rx={38} ry={22} fill={mixColor("#807A74", "#ABA49B", sky / 1.3)} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        )))}
        {/* ガス灯 */}
        {[740, 1440].map((lx, i) => (
          <g key={lx}>
            <rect x={lx - 9} y={380} width={18} height={300} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 30} 380 L ${lx + 30} 380 L ${lx + 20} 320 L ${lx - 20} 320 Z`} fill="#3C4047" stroke={KRP.ink} strokeWidth={4} />
            {sun < 0.9 && <><circle cx={lx} cy={350} r={70} fill={MP.glow} opacity={0.3 * (1 - sun)} /><Flame x={lx} y={370} f={f} phase={i} s={0.8} /></>}
          </g>
        ))}
        {/* 朝日のさす光 */}
        {sun > 0 && <polygon points={`2000,300 2000,700 -300,1100 -300,700`} fill="#FFE9A0" opacity={0.18 * sun} />}
        {(() => {
          const parade = [
          <g key="p0" transform={`translate(${xs[0]} ${ys[0]}) scale(${ks[0]}) translate(${-xs[0]} ${-GY})`}>
            {/* ① 鶏人 */}
            <Person x={xs[0]} y={GY} s={0.9} f={f} pose={moving(0) ? "run" : shout ? "banzai" : "stand"} face={shout ? "surprised" : "smile"} cloth={C.robe} clothDark={C.robeDark} hair="none" gaze={[5, 0]} />
            <MzJOn x={xs[0]} y={GY} s={0.9} f={f}><MzJKeijin />{shout && <MzJMouth o={0.6 + 0.4 * Math.abs(Math.sin(f / 4))} />}</MzJOn>
            {shout && [0, 1].map((j) => <path key={j} d={`M ${xs[0] + 90 + j * 26} ${GY - 230} q 20 26 0 52`} stroke={KRP.white} strokeWidth={7} fill="none" strokeLinecap="round" />)}
          </g>,
          <g key="p1" transform={`translate(${xs[1]} ${ys[1]}) scale(${ks[1]}) translate(${-xs[1]} ${-GY})`}>
            {/* ② 年上の修道士 (手に小さな鈴) */}
            <Person x={xs[1]} y={GY} s={0.9} f={f} pose={moving(1) ? "run" : "raise"} face="smile" cloth={MP.habit} clothDark={MP.habitMid} hair="none" phase={2} gaze={[4, 0]} />
            <MzJOn x={xs[1]} y={GY} s={0.9} f={f} phase={2}>
              <MzJMonkWear old />
              {!moving(1) && <g transform={`translate(67 -238) rotate(${f > 44 && f < 80 ? Math.sin(f * 1.1) * 22 : 0})`}>
                <rect x={-6} y={-6} width={12} height={34} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
                <path d="M -24 -6 Q -24 -44 0 -46 Q 24 -44 24 -6 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={0} cy={-2} r={6} fill={MP.iron} stroke={KRP.ink} strokeWidth={2.5} />
              </g>}
            </MzJOn>
          </g>,
          <g key="p2" transform={`translate(${xs[2]} ${ys[2]}) scale(${ks[2]}) translate(${-xs[2]} ${-GY})`}>
            {/* ③ 眠そうな番人と台車の鉄の時計 */}
            <g>
              <rect x={cartX - 110} y={GY - 86} width={220} height={22} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${cartX - 110} ${GY - 80} L ${xs[2] + 16} ${GY - 104}`} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
              {[-70, 70].map((wx) => <g key={wx} transform={`rotate(${xs[2] * 1.2} ${cartX + wx} ${GY - 36})`}>
                <circle cx={cartX + wx} cy={GY - 36} r={34} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
                <path d={`M ${cartX + wx - 30} ${GY - 36} L ${cartX + wx + 30} ${GY - 36} M ${cartX + wx} ${GY - 66} L ${cartX + wx} ${GY - 6}`} stroke={KRP.ink} strokeWidth={4} />
              </g>)}
              <MzJIronClock x={cartX} y={GY - 86 - 126 * 0.72} s={0.72} f={f} ring={f >= 62 && f < 96 ? 1 : 0} />
              <MzJOn x={xs[2]} y={GY} s={0.88} f={f} phase={1} lean={moving(2) ? 8 : 0}>
                <path d="M -60 -166 Q -100 -90 -96 -30 L 96 -30 Q 100 -90 60 -166 Q 0 -186 -60 -166 Z" fill={mixColor(C.brown, KRP.ink, 0.15)} stroke={KRP.ink} strokeWidth={5} />
              </MzJOn>
              <Person x={xs[2]} y={GY} s={0.88} f={f} pose="hold" face="normal" cloth={C.brown} clothDark={C.vest} hair="cap" phase={1} lean={moving(2) ? 8 : 0} />
              <MzJOn x={xs[2]} y={GY} s={0.88} f={f} phase={1} lean={moving(2) ? 8 : 0}>
                <MzJSleepEyes />
                <ellipse cx={0} cy={-184} rx={10} ry={6 + 6 * Math.abs(Math.sin(f / 18))} fill={KRP.ink} />
                <path d="M -70 -262 Q -66 -312 0 -314 Q 66 -312 70 -262 Z" fill="#5A3E28" stroke={KRP.ink} strokeWidth={5} />
                <ellipse cx={0} cy={-262} rx={96} ry={14} fill="#5A3E28" stroke={KRP.ink} strokeWidth={4} />
                <g transform="translate(-90 -60)">
                  <path d="M 0 -60 L 0 -40" stroke={MP.iron} strokeWidth={4} />
                  <rect x={-18} y={-40} width={36} height={46} rx={6} fill="#FFE9A0" stroke={KRP.ink} strokeWidth={4} />
                  <Flame x={0} y={0} f={f} s={0.4} glow={0.6} />
                </g>
              </MzJOn>
            </g>
          </g>,
          <g key="p3" transform={`translate(${xs[3]} ${ys[3]}) scale(${ks[3]}) translate(${-xs[3]} ${-GY})`}>
            {/* ④ ノッカー・アップの老人 (うなずく) */}
            <g transform={`rotate(${nod} ${xs[3]} ${GY})`}>
              <KnockerUp x={xs[3]} y={GY} s={0.9} f={f} pose="walk" old face={f >= 118 ? "smile" : "normal"} />
            </g>
          </g>,
          ];
          return [0, 1, 2, 3].sort((a, b) => ys[a] - ys[b]).map((i) => parade[i]);
        })()}
        {/* ⑤ 老人の足もとから出てくるベル時計 */}
        {f >= 92 && (
          <g transform={`rotate(${bow} ${bx} ${GY})`}>
            <BellClock x={bx} y={by} s={bs} f={f} ring={chirin} />
          </g>
        )}
        {chirin > 0 && <g transform={`translate(${bx + 70} ${by - 170}) scale(${pop(seg(f, 112, 116))})`}>
          <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={MP.brassLight} stroke={KRP.ink} strokeWidth={6} paintOrder="stroke">ちりん</text>
        </g>}
        {/* 名札 (同じ高さ) */}
        {names.map((nm, i) => <TagPlate key={nm} x={plateX[i]} y={PY} text={nm} size={30} t={plateT[i]} />)}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_193: (f) => <Mz193 f={f} />,
  mz_194: (f) => <Mz194 f={f} />,
  mz_195: (f) => <Mz195 f={f} />,
  mz_196: (f) => <Mz196 f={f} />,
  mz_197: (f) => <Mz197 f={f} />,
  mz_198: (f) => <Mz198 f={f} />,
  mz_199: (f) => <Mz199 f={f} />,
  mz_200: (f) => <Mz200 f={f} />,
  mz_201: (f) => <Mz201 f={f} />,
  mz_202: (f) => <Mz202 f={f} />,
  mz_203: (f) => <Mz203 f={f} />,
};

export const MZ_J_MOTIFS: string[] = [
  "mz_193", // #193
  "mz_194", // #194
  "mz_195", // #195
  "mz_196", // #196
  "mz_197", // #197
  "mz_198", // #198
  "mz_199", // #199
  "mz_200", // #200
  "mz_201", // #201
  "mz_202", // #202
  "mz_203", // #203
];

export const mezaJScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
