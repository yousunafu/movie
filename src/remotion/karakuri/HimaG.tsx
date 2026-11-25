// 人は、なぜ暇をつぶすのか: 文#138〜#149 (12文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
} from "./HimaShared";
import {
  HP, Monosashi, monoSlot, Sousa, Sagyozukue, YoruNoHeya, YoruNoHeyaFront, EkiHome, EkiBenchFront,
  KyukeiBoard, ShockRoom, Sumaho, YasumiCalendar,
} from "./HimaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/HP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // ポケット (#138)
  pocketIn: "#A9592A", pocketDeep: "#7E3E1C", stitch: "#F7D9B8", hoodieShade: "#CF7A40",
  // 木 (盤・家具)
  wood: "#C68A4E", woodDark: "#8E5A2C", woodLight: "#E2B47A", woodPale: "#EFD2A2",
  // 博物館 (#139)
  museWall: "#3E3A48", museWallDark: "#2E2A36", museFloor: "#6B5848", glass: "#D8EEF2", spot: "#FFF1C4", velvet: "#7A2E3A",
  // 飛鳥 (#140)
  asukaSky: "#BFDDEA", vermilion: "#D2512E", vermilionDark: "#9E3A1E", gravel: "#E4D7B8", gravelDot: "#C8B892", roofTile: "#4E555E",
  robePurple: "#9C83B8", robeBlue: "#7FA6C9", robeGreen: "#5E8A6E", robeGreenDark: "#456A52", robeBrown: "#7A5E46", robeOlive: "#6E6A3E",
  mat: "#D9C27A", matDark: "#B49C52",
  // 平安の夜 (#142)
  nightSky: "#1E2448", nightSky2: "#2E3866", moon: "#FFF3C4", pond: "#28406A", engawa: "#8A6440", engawaDark: "#5E4228",
  sudare: "#C9AE6E", sudareDark: "#9C8248", lampFire: "#FFB347", pine: "#2E4E3E",
  // 現代の電車 (#143)
  trainWall: "#E6E8E2", trainFloor: "#9A968C", trainSeat: "#5A8A6A", trainSeatDark: "#3E6A4E", window: "#A9D2EA", strap: "#E8E0C8",
  // 1913年の路面電車 (#145)
  tramWood: "#9E6A3E", tramWoodDark: "#6E4626", newsprint: "#EDE6D2", newsInk: "#8C8476", sepiaSky: "#E9DDBE",
  building: "#9A8E80", buildingDark: "#7A6E62", bowler: "#3A3A3E", bonnet: "#B86A7A",
  // 1979年の公園 (#146)
  parkGreen: "#6FAE5E", parkDark: "#4E8A44", parkLight: "#9CCB7E", path: "#E3CFA0", sunny: "#FFF2B0", trunk: "#7A5232",
  orangePad: "#F08A3A", walkBlue: "#5C7FAE", skate: "#E85A5A", tee: "#F2C14E",
  // 1989年の居間 (#147)
  tatami: "#CFC48A", kotatsuFuton: "#C8503E", futonPattern: "#F2C14E", wall89: "#E8DCC0", fusuma: "#F2EAD3",
  gbGray: "#C9C6BE", gbGrayDark: "#9E9A90", gbScreen: "#9BB04A", gbScreenDark: "#3F5A2A", gbPurple: "#8E3A6E", mikan: "#F29A2E", tea: "#9CB86A",
  // 1999年の改札 (#148)
  gate: "#B9BDC2", gateFlap: "#E0703E", tile99: "#D9D4C8", phoneSilver: "#B8C2CC", phoneScreen: "#CDE6C0", jacket: "#5A6E9E", jacketDark: "#3E4E78",
  // 2008年の行列 (#149)
  summerSky: "#8FD0F2", storeWhite: "#FBFBF8", glassStore: "#BFD9E8", asphalt: "#A8A49C", asphaltDark: "#8E8A82",
  crowd1: "#E07A7A", crowd2: "#7AB8E0", crowd3: "#9AD08A", crowd4: "#E0C07A", boxWhite: "#F4F4F0",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void HP; void Monosashi; void monoSlot; void Sousa; void Sagyozukue; void YoruNoHeya; void YoruNoHeyaFront;
void EkiHome; void EkiBenchFront; void KyukeiBoard; void ShockRoom; void Sumaho; void YasumiCalendar;
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

// 盤すごろくの盤 (正面やや上から・厚みつき)。中心 (0,0)・幅 w
const HmGBan: React.FC<{ w?: number; f?: number; pieces?: boolean }> = ({ w = 400, f = 0, pieces = true }) => {
  const h = w * 0.36, th = w * 0.07;
  const L = -w / 2, T = -h / 2;
  return (
    <g>
      {/* 厚み */}
      <rect x={L} y={T + th} width={w} height={h} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 天板 */}
      <rect x={L} y={T} width={w} height={h} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={L + w * 0.03} y={T + h * 0.08} width={w * 0.94} height={h * 0.84} rx={4} fill={C.woodLight} stroke={KRP.ink} strokeWidth={3} />
      {/* 中央の仕切り */}
      <rect x={-w * 0.02} y={T + h * 0.08} width={w * 0.04} height={h * 0.84} fill={C.woodDark} />
      {/* 上下 12 本ずつの線 */}
      {Array.from({ length: 12 }, (_, i) => {
        const k = i < 6 ? i : i + 1;
        const px = L + w * 0.06 + (w * 0.88 * (k + 0.5)) / 13;
        return (
          <g key={i} stroke={C.woodDark} strokeWidth={Math.max(2, w / 160)} strokeLinecap="round">
            <line x1={px} y1={T + h * 0.12} x2={px} y2={T + h * 0.38} />
            <line x1={px} y1={T + h * 0.62} x2={px} y2={T + h * 0.88} />
          </g>
        );
      })}
      {pieces && [[-0.36, -0.22, 0], [-0.3, -0.22, 0], [0.3, 0.22, 1], [0.36, 0.22, 1], [0.12, -0.22, 1], [-0.12, 0.22, 0]].map(([px, py, b], i) => (
        <circle key={i} cx={px * w} cy={py * h + Math.sin(f / 10 + i) * 0.5} r={w * 0.028}
          fill={b ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={Math.max(2, w / 140)} />
      ))}
    </g>
  );
};

// 道具の小物 (#138 ポケット・#144 机で同じ見た目)。中心 (0,0)
type HmGKind = "ban" | "card" | "bunko" | "walk" | "cass" | "game" | "phone";
const HmGItem: React.FC<{ kind: HmGKind; f: number; w?: number }> = ({ kind, f, w = 200 }) => {
  const k = w / 200;
  if (kind === "ban") return <HmGBan w={w} f={f} />;
  if (kind === "card") return (
    <g transform={`scale(${k})`}>
      {[-14, 0, 14].map((r, i) => (
        <g key={i} transform={`rotate(${r} 0 90)`}>
          <rect x={-62} y={-90} width={124} height={176} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {i < 2 && <rect x={-50} y={-78} width={100} height={152} rx={8} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.6} />}
        </g>
      ))}
      {/* いちばん上の札: ハートの A */}
      <g transform="rotate(14 0 90)">
        <path d="M 0 22 C -44 -6 -34 -44 -10 -38 Q 0 -34 0 -22 Q 0 -34 10 -38 C 34 -44 44 -6 0 22 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <text x={-40} y={-54} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.red}>A</text>
      </g>
    </g>
  );
  if (kind === "bunko") return (
    <g transform={`scale(${k})`}>
      <rect x={-60} y={-88} width={124} height={178} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => <line key={i} x1={58 + i * 0} y1={-80 + i * 3} x2={58} y2={84} stroke={KRP.gray} strokeWidth={2} />)}
      <rect x={-70} y={-94} width={124} height={182} rx={6} fill={HP.byo} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-70} y={34} width={124} height={34} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-50} y={-70} width={84} height={64} rx={4} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-70} y={-94} width={12} height={182} fill={HP.byoDark} />
    </g>
  );
  if (kind === "cass") return (
    <g transform={`scale(${k})`}>
      <rect x={-96} y={-62} width={192} height={124} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-80} y={-48} width={160} height={54} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-50} y={-30} width={100} height={30} rx={14} fill={KRP.ink} />
      {[-30, 30].map((cx) => (
        <g key={cx} transform={`rotate(${f * 9 * (cx > 0 ? 1 : 1)} ${cx} -15)`}>
          <circle cx={cx} cy={-15} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {[0, 60, 120].map((a) => <line key={a} x1={cx} y1={-15} x2={cx + Math.cos(a * Math.PI / 180) * 9} y2={-15 + Math.sin(a * Math.PI / 180) * 9} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
      ))}
      <path d="M -60 62 L -48 30 L 48 30 L 60 62" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  if (kind === "walk") return (
    <g transform={`scale(${k})`}>
      <rect x={-80} y={-110} width={160} height={220} rx={14} fill={C.walkBlue} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-64} y={-90} width={128} height={98} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-50} y={-72} width={100} height={60} rx={6} fill={KRP.ink} opacity={0.85} />
      {[-24, 24].map((cx) => (
        <g key={cx} transform={`rotate(${f * 8} ${cx} -42)`}>
          <circle cx={cx} cy={-42} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <line x1={cx - 9} y1={-42} x2={cx + 9} y2={-42} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {[-50, -16, 18, 52].map((bx, i) => (
        <rect key={bx} x={bx - 14} y={28} width={28} height={22} rx={4} fill={i === 1 ? C.orangePad : KRP.silver} stroke={KRP.ink} strokeWidth={3} />
      ))}
      <circle cx={52} cy={84} r={10} fill={KRP.ink} />
      <rect x={-80} y={-110} width={160} height={16} rx={8} fill={KRP.white} opacity={0.25} />
    </g>
  );
  if (kind === "game") return (
    <g transform={`scale(${k})`}>
      <path d="M -80 -130 L 80 -130 L 80 100 Q 80 130 40 130 L -80 130 Z" fill={C.gbGray} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-64} y={-114} width={128} height={110} rx={8} fill={C.gbGrayDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-46} y={-100} width={92} height={82} fill={C.gbScreen} stroke={KRP.ink} strokeWidth={3} />
      {/* 画面のブロック */}
      {[[-30, -40], [-14, -40], [2, -40], [18, -40], [-30, -26], [-14, -26], [18, -26], [2, -26]].map(([bx, by], i) => (
        <rect key={i} x={bx} y={by} width={14} height={13} fill={C.gbScreenDark} />
      ))}
      <rect x={-6} y={-92 + ((f * 2) % 44)} width={14} height={13} fill={C.gbScreenDark} />
      <rect x={-6} y={-79 + ((f * 2) % 44)} width={14} height={13} fill={C.gbScreenDark} />
      {/* 十字キーとボタン */}
      <rect x={-56} y={28} width={44} height={14} rx={3} fill={KRP.ink} />
      <rect x={-41} y={13} width={14} height={44} rx={3} fill={KRP.ink} />
      <circle cx={30} cy={44} r={12} fill={C.gbPurple} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={58} cy={28} r={12} fill={C.gbPurple} stroke={KRP.ink} strokeWidth={3} />
      {[0, 1, 2].map((i) => <line key={i} x1={36 + i * 12} y1={104} x2={50 + i * 12} y2={88} stroke={C.gbGrayDark} strokeWidth={4} strokeLinecap="round" />)}
    </g>
  );
  // phone
  return <Sumaho x={0} y={0} s={k * 0.62} f={f} screen="on" glow={0.4} />;
};

// 飛鳥・平安の人の冠 (頭のてっぺんにのせる)。x,y は Person の足元、s は Person と同じ
const HmGKanmuri: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number; tall?: boolean }> = ({ x, y, s, f, phase = 0, lean = 0, tall = true }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <path d="M -62 -250 Q -60 -300 0 -304 Q 60 -300 62 -250 Q 30 -266 0 -266 Q -30 -266 -62 -250 Z" fill={KRP.ink} />
      {tall && <path d="M -20 -296 L -14 -352 Q 0 -362 14 -352 L 20 -296 Z" fill={KRP.ink} />}
    </g>
  );
};

// 手 (白い丸)
const HmGHand: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 11 }) => (
  <circle cx={x} cy={y} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #138 第6章、暇つぶしが、ポケットに入る。
// 格: 山 / seed 5138
// 絵: 章扉。どこ: 大きなパーカーのポケットの断面 (ポケットの中が見える比喩の舞台)。演出: ポケットの中に、すごろく盤・トランプ・文庫本・ウォークマン・ゲーム機・スマホが小さく重なって入っていく (上から順に落ちてくる)。ChapterDoor num=6 title="暇つぶしが、ポケットに入る。" を右に。主役のポケットは左寄り。動き: 道具が落ちていく / ポケットの布がふくらむ
// どこ: 「あなた」の橙のパーカーの前身ごろ。お腹のカンガルーポケットを断面で見せる (画面左)
// 演出: 上から すごろく盤→トランプ→文庫本→ウォークマン→ゲーム機→スマホ が順に落ちてきて、ポケットの中に重なる。入るたびにポケットがふくらむ
// 動き: 道具が落ちる (f4〜35) / 着地のぽん / 布のふくらみ / カメラがゆっくり寄る / 題字 (f4〜20)
const HmG138Drops: { kind: HmGKind; x: number; y: number; w: number; r: number }[] = [
  { kind: "ban", x: 520, y: 770, w: 400, r: -4 },
  { kind: "card", x: 360, y: 640, w: 150, r: -12 },
  { kind: "bunko", x: 660, y: 640, w: 140, r: 9 },
  { kind: "walk", x: 430, y: 500, w: 130, r: -7 },
  { kind: "game", x: 650, y: 490, w: 120, r: 10 },
  { kind: "phone", x: 545, y: 440, w: 130, r: -14 },
];
const Hm138: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = 1.06 - 0.06 * easeOut(seg(f, 0, 42));
  const landed = HmG138Drops.filter((_, i) => f >= 10 + i * 5).length;
  const bulge = landed * 9 + Math.sin(f / 6) * 2;
  return (
    <Frame f={f} seed={5138} bg={HP.you}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={6} title="暇つぶしが、ポケットに入る。" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(520 540) scale(${cam}) translate(-520 -540)`}>
        {/* パーカーの布 (編み目) */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={HP.you} />
        <g stroke={C.hoodieShade} strokeWidth={3} opacity={0.55}>
          {Array.from({ length: 48 }, (_, i) => <path key={i} d={`M ${i * 42 - 20} -40 q 6 560 0 1160`} fill="none" />)}
        </g>
        {/* 胸のファスナーのない縫い目と、首元のひも */}
        <path d="M 1100 -40 Q 1240 120 1420 -40" fill={HP.youDark} stroke={KRP.ink} strokeWidth={8} />
        {[1200, 1330].map((sx, i) => (
          <g key={sx} transform={`rotate(${Math.sin(f / 14 + i) * 3} ${sx} 60)`}>
            <path d={`M ${sx} 60 q ${i ? 10 : -10} 140 0 280`} stroke={KRP.white} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d={`M ${sx} 60 q ${i ? 10 : -10} 140 0 280`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5} />
            <rect x={sx - 10} y={330} width={20} height={36} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 裾のリブ */}
        <rect x={-40} y={940} width={2000} height={160} fill={HP.youDark} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
          {Array.from({ length: 70 }, (_, i) => <line key={i} x1={i * 30} y1={950} x2={i * 30} y2={1090} />)}
        </g>
        {/* ポケットの断面: 奥の暗い布 (ふくらむ) */}
        <path d={`M 150 330 L 890 330 C ${930 + bulge} 560 ${930 + bulge} ${820 + bulge * 0.6} 780 ${870 + bulge * 0.5}
          L 260 ${870 + bulge * 0.5} C ${110 - bulge} ${820 + bulge * 0.6} ${110 - bulge} 560 150 330 Z`}
          fill={C.pocketIn} stroke={KRP.ink} strokeWidth={9} />
        <path d={`M 190 360 L 850 360 C ${880 + bulge} 560 ${880 + bulge} 800 760 ${838 + bulge * 0.5} L 280 ${838 + bulge * 0.5} C ${160 - bulge} 800 ${160 - bulge} 560 190 360 Z`}
          fill={C.pocketDeep} opacity={0.55} />
        {/* 布のしわ */}
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.3} fill="none">
          <path d="M 230 420 q 30 120 10 240" /><path d="M 820 420 q -20 140 0 260" />
        </g>
        {/* 落ちてくる道具 */}
        {HmG138Drops.map((d, i) => {
          const a = 4 + i * 5, b = 10 + i * 5;
          const t = seg(f, a, b);
          if (t <= 0) return null;
          const y = lerp(-220, d.y, t * t);
          const land = seg(f, b, b + 6);
          const sq = land > 0 && land < 1 ? 1 - 0.08 * Math.sin(land * Math.PI) : 1;
          const wob = t >= 1 ? Math.sin(f / 9 + i) * 1.2 : (1 - t) * 30 * (i % 2 ? 1 : -1);
          return (
            <g key={i}>
              {t < 1 && (
                <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7}>
                  {[-40, 0, 40].map((dx) => <line key={dx} x1={d.x + dx} y1={y - 140} x2={d.x + dx} y2={y - 70} />)}
                </g>
              )}
              <g transform={`translate(${d.x} ${y}) rotate(${d.r + wob}) scale(${1 / sq} ${sq})`}>
                <HmGItem kind={d.kind} f={f} w={d.w} />
              </g>
              {land > 0 && land < 1 && (
                <g opacity={1 - land}>
                  {[0, 1, 2, 3, 4].map((j) => {
                    const ang = (-160 + j * 35) * Math.PI / 180;
                    return <line key={j} x1={d.x + Math.cos(ang) * 60} y1={d.y + Math.sin(ang) * 40}
                      x2={d.x + Math.cos(ang) * (90 + land * 40)} y2={d.y + Math.sin(ang) * (60 + land * 30)}
                      stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />;
                  })}
                </g>
              )}
            </g>
          );
        })}
        {/* ポケットの手前のふち (断面の切り口と縫い目) */}
        <path d="M 110 300 L 930 300 L 930 352 L 110 352 Z" fill={HP.you} stroke={KRP.ink} strokeWidth={9} />
        <path d="M 130 326 L 910 326" stroke={C.stitch} strokeWidth={4} strokeDasharray="14 10" />
        <path d={`M 110 352 C ${70 - bulge} 560 ${70 - bulge} ${860 + bulge * 0.6} 250 ${910 + bulge * 0.5}`} stroke={HP.you} strokeWidth={34} fill="none" />
        <path d={`M 930 352 C ${970 + bulge} 560 ${970 + bulge} ${860 + bulge * 0.6} 790 ${910 + bulge * 0.5}`} stroke={HP.you} strokeWidth={34} fill="none" />
        <path d={`M 110 352 C ${70 - bulge} 560 ${70 - bulge} ${860 + bulge * 0.6} 250 ${910 + bulge * 0.5}`} stroke={C.stitch} strokeWidth={4} strokeDasharray="14 10" fill="none" />
        <path d={`M 930 352 C ${970 + bulge} 560 ${970 + bulge} ${860 + bulge * 0.6} 790 ${910 + bulge * 0.5}`} stroke={C.stitch} strokeWidth={4} strokeDasharray="14 10" fill="none" />
        {/* 入り口のきらり */}
        <path d="M 160 316 L 300 316" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.3 * Math.sin(f / 7)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #139 暇つぶしの道具は、とても古くからありました。
// 格: 並 / seed 5139
// 絵: どこ: 博物館の展示室 (ガラスケース・展示台・照明)。演出: ガラスケースの中に、古い遊び道具 (サイコロ・盤・こま・札) が並び、照明が順に点く。来館者 (一般人) がのぞきこむ。動き: 照明が順に点く / のぞきこむ / ケースの反射
// どこ: 薄暗い博物館の展示室。紺の壁・木の床・赤いベルベットの展示台・大きなガラスケース
// 演出: ケースの中のサイコロ・盤・こま・札に、天井の照明が左から順に点く。右の来館者が身を乗り出してのぞきこみ、目を丸くする
// 動き: 照明が順に点く (f4〜28) / ケースの反射が流れる / 来館者が前のめりに / カメラが右から左へ少しパン
const Hm139: React.FC<{ f: number }> = ({ f }) => {
  const lights = [0, 1, 2, 3].map((i) => easeOut(seg(f, 4 + i * 6, 10 + i * 6)));
  const lean = -10 * easeOut(seg(f, 20, 34));
  const pan = 30 - 30 * easeOut(seg(f, 0, 40));
  const slots = [420, 700, 980, 1260];
  const refl = ((f * 9) % 1800) - 300;
  return (
    <Frame f={f} seed={5139} bg={C.museWall}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁と床 */}
        <rect x={-80} y={-40} width={2100} height={760} fill={C.museWall} />
        <g stroke={C.museWallDark} strokeWidth={5}>{[300, 860, 1420].map((px) => <line key={px} x1={px} y1={-40} x2={px} y2={720} />)}</g>
        <rect x={-80} y={720} width={2100} height={420} fill={C.museFloor} />
        <g stroke={C.woodDark} strokeWidth={4} opacity={0.6}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 190 - 80} y1={720} x2={i * 230 - 300} y2={1120} />)}</g>
        <rect x={-80} y={708} width={2100} height={18} fill={C.museWallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 天井のレール照明 */}
        <rect x={200} y={30} width={1260} height={18} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        {slots.map((sx, i) => (
          <g key={sx}>
            <polygon points={`${sx - 26},70 ${sx + 26},70 ${sx + 170},560 ${sx - 170},560`} fill={C.spot} opacity={0.22 * lights[i]} />
            <rect x={sx - 18} y={44} width={36} height={34} rx={6} fill={KRP.ink} />
            <ellipse cx={sx} cy={80} rx={18} ry={7} fill={lights[i] > 0.1 ? C.spot : KRP.grayDark} />
          </g>
        ))}
        {/* 展示台 (ベルベット) */}
        <rect x={190} y={560} width={1280} height={180} fill={C.velvet} stroke={KRP.ink} strokeWidth={8} />
        <rect x={170} y={540} width={1320} height={30} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 展示物 (台の上) */}
        {slots.map((sx, i) => (
          <ellipse key={`sh${i}`} cx={sx} cy={540} rx={120} ry={16} fill={KRP.ink} opacity={0.25} />
        ))}
        {/* サイコロ (骨のサイコロ・2つ) */}
        <g opacity={0.35 + 0.65 * lights[0]}>
          {[[-46, 0, -8], [42, 6, 12]].map(([dx, dy, r], i) => (
            <g key={i} transform={`translate(${420 + dx} ${490 + dy}) rotate(${r})`}>
              <rect x={-36} y={-36} width={72} height={72} rx={12} fill={C.woodPale} stroke={KRP.ink} strokeWidth={6} />
              {(i ? [[-16, -16], [16, 16], [0, 0]] : [[-16, -16], [16, -16], [-16, 16], [16, 16]]).map(([px, py], j) => (
                <circle key={j} cx={px} cy={py} r={7} fill={C.woodDark} />
              ))}
            </g>
          ))}
        </g>
        {/* 盤 */}
        <g transform="translate(700 480)" opacity={0.35 + 0.65 * lights[1]}>
          <HmGBan w={230} f={f} />
        </g>
        {/* こま (木のこま。ゆっくり回る) */}
        <g transform={`translate(980 470)`} opacity={0.35 + 0.65 * lights[2]}>
          <path d="M -60 -20 Q 0 -70 60 -20 L 0 60 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-20} rx={60} ry={16} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M ${-60 + j * 40 + (f * 2) % 40} -14 L 0 56`} stroke={KRP.red} strokeWidth={5} opacity={0.7} />
          ))}
          <rect x={-7} y={-64} width={14} height={46} rx={5} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 札 (古いかるた。扇形) */}
        <g transform="translate(1260 520)" opacity={0.35 + 0.65 * lights[3]}>
          {[-22, -8, 6, 20].map((r, i) => (
            <g key={r} transform={`rotate(${r} 0 0)`}>
              <rect x={-36} y={-130} width={72} height={110} rx={6} fill={i % 2 ? C.woodPale : KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-26} y={-120} width={52} height={90} rx={4} fill="none" stroke={KRP.red} strokeWidth={3} opacity={0.7} />
              <circle cx={0} cy={-76} r={12} fill={[KRP.red, KRP.blueDeep, KRP.green, KRP.orange][i]} opacity={0.8} />
            </g>
          ))}
        </g>
        {/* 解説の小さな札 (文字なし) */}
        {slots.map((sx, i) => (
          <g key={`c${i}`} transform={`translate(${sx} 620)`} opacity={0.4 + 0.6 * lights[i]}>
            <rect x={-56} y={-20} width={112} height={44} rx={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
            <line x1={-40} y1={-4} x2={40} y2={-4} stroke={KRP.gray} strokeWidth={4} />
            <line x1={-40} y1={10} x2={20} y2={10} stroke={KRP.gray} strokeWidth={4} />
          </g>
        ))}
        {/* ガラスケース */}
        <rect x={200} y={180} width={1260} height={364} fill={C.glass} opacity={0.14} stroke={KRP.ink} strokeWidth={7} />
        <rect x={200} y={170} width={1260} height={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${refl} 190 L ${refl + 90} 190 L ${refl - 60} 540 L ${refl - 150} 540 Z`} fill={KRP.white} opacity={0.18} />
        <path d={`M ${refl + 140} 190 L ${refl + 170} 190 L ${refl + 20} 540 L ${refl - 10} 540 Z`} fill={KRP.white} opacity={0.15} />
        {/* 床のロープ柵 */}
        {[260, 1400].map((px) => (
          <g key={px}>
            <rect x={px - 10} y={760} width={20} height={120} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={px} cy={756} r={16} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 260 780 Q 830 850 1400 780" stroke={C.velvet} strokeWidth={14} fill="none" />
        {/* 来館者 (身を乗り出してのぞきこむ) */}
        <Person x={1640} y={930} s={1.12} f={f} face={f > 26 ? "surprised" : "normal"} pose="hold"
          lean={lean} gaze={[-8, 2]} cloth={KRP.blueDeep} clothDark={KRP.grayDark} glasses phase={2} />
        {f > 26 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={seg(f, 26, 32)}>
            {[-40, 0, 40].map((a) => {
              const r = (a - 90) * Math.PI / 180;
              return <line key={a} x1={1560 + Math.cos(r) * 90} y1={640 + Math.sin(r) * 90} x2={1560 + Math.cos(r) * 125} y2={640 + Math.sin(r) * 125} />;
            })}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #140 689年、日本では、双六を禁止するおふれが出たとされています。
// 格: 山 / seed 5140
// 絵: どこ: 飛鳥時代の宮の広場 (朱塗りの柱・板の掲示)。年代札「689年」。演出: 役人が木の板のおふれを掲げ、その前で盤すごろくで遊んでいた貴族たち (一般の人・顔はよい) が、あわてて盤を隠す。おふれの板にはすごろく盤のマークに×だけ。札「〜とされる」(小さく)。動き: おふれが掲げられる / 盤を隠す / サイコロが転がる
// どこ: 飛鳥時代の宮の広場。奥に朱塗りの柱と瓦屋根の門、白い砂利の地面、柳。左上に年代札「689年」
// 演出: 左の役人が木の板のおふれ (すごろく盤のマークに赤い×) を高く掲げる。右のござの上で遊んでいた貴族3人が仰天。
//       1人は盤を背中に隠し、1人はばんざいで固まり、1人は口笛顔でそっぽを向く。サイコロだけ砂利をころころ転がって役人の足元へ
// 動き: おふれが上がる (f6〜16) / 貴族が驚く (f16〜) / 盤が背中へ滑る (f18〜30) / サイコロが転がる (f20〜40) / カメラがゆっくり右へ
const Hm140: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 6, 16));
  const shock = f >= 16;
  const hide = easeInOut(seg(f, 18, 30));
  const roll = easeOut(seg(f, 20, 40));
  const cam = 1 + 0.04 * easeOut(seg(f, 0, 42));
  const diceX = lerp(1180, 760, roll), diceY = 800 - Math.abs(Math.sin(roll * Math.PI * 3)) * 40 * (1 - roll);
  return (
    <Frame f={f} seed={5140} bg={C.asukaSky}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* 空と遠くの山 */}
        <rect x={-40} y={-40} width={2000} height={600} fill={C.asukaSky} />
        <path d="M -40 470 Q 300 330 620 440 Q 900 340 1240 430 Q 1600 320 1960 440 L 1960 560 L -40 560 Z" fill={C.parkDark} opacity={0.5} />
        {[[260, 140], [1500, 110]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 40 + i) * 10} ${cy})`}>
            <ellipse cx={0} cy={0} rx={110} ry={34} fill={KRP.white} opacity={0.85} />
            <ellipse cx={60} cy={-18} rx={70} ry={28} fill={KRP.white} opacity={0.85} />
          </g>
        ))}
        {/* 宮の門 (朱塗りの柱・白壁・瓦屋根) */}
        <rect x={420} y={250} width={1080} height={310} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {[440, 700, 960, 1220, 1480].map((px) => (
          <rect key={px} x={px - 22} y={240} width={44} height={330} fill={C.vermilion} stroke={KRP.ink} strokeWidth={6} />
        ))}
        <rect x={420} y={300} width={1080} height={26} fill={C.vermilion} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 320 250 L 1600 250 L 1480 160 L 440 160 Z" fill={C.roofTile} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>{Array.from({ length: 24 }, (_, i) => <line key={i} x1={450 + i * 45} y1={166} x2={420 + i * 50} y2={246} />)}</g>
        <path d="M 300 254 Q 320 236 350 250 M 1570 250 Q 1600 236 1620 254" stroke={KRP.ink} strokeWidth={8} fill="none" />
        <rect x={860} y={360} width={200} height={210} fill={C.vermilionDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 砂利の地面 */}
        <rect x={-40} y={560} width={2000} height={580} fill={C.gravel} />
        <g fill={C.gravelDot}>{Array.from({ length: 90 }, (_, i) => <circle key={i} cx={rnd(5140, i) * 1960} cy={580 + rnd(5141, i) * 500} r={3 + rnd(5142, i) * 4} />)}</g>
        <g stroke={C.gravelDot} strokeWidth={3} fill="none" opacity={0.8}>{[640, 700, 760].map((ly) => <path key={ly} d={`M -40 ${ly} Q 960 ${ly + 20} 1960 ${ly}`} />)}</g>
        {/* 柳 (右端) */}
        <g>
          <rect x={1800} y={200} width={30} height={420} fill={C.trunk} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M ${1815} 210 q ${-120 + i * 30} 60 ${-140 + i * 32 + Math.sin(f / 16 + i) * 8} 300`} stroke={C.parkGreen} strokeWidth={10} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {/* 役人 (おふれを掲げる) */}
        <g>
          {/* 掲げるおふれの板 (柄つき) */}
          <g transform={`translate(0 ${(1 - up) * 160})`}>
            <rect x={488} y={240} width={14} height={370} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <g transform={`rotate(${Math.sin(f / 10) * 1.5} 495 260)`}>
              <rect x={360} y={150} width={270} height={200} rx={6} fill={C.woodPale} stroke={KRP.ink} strokeWidth={7} />
              <g stroke={C.woodLight} strokeWidth={3}>{[0, 1, 2].map((i) => <line key={i} x1={370} y1={190 + i * 50} x2={620} y2={186 + i * 50} />)}</g>
              <g transform="translate(495 250)"><HmGBan w={170} f={f} pieces={false} /></g>
              <XMark x={495} y={256} s={1.05} t={seg(f, 12, 18)} />
            </g>
          </g>
          <Person x={420} y={860} s={1.12} f={f} face="angry" pose="raise" cloth={C.robeGreen} clothDark={C.robeGreenDark} phase={1} />
          <HmGKanmuri x={420} y={860} s={1.12} f={f} phase={1} />
          {/* 役人の帯と笏 */}
          <rect x={355} y={720} width={130} height={16} fill={C.woodDark} />
        </g>
        {/* ござと貴族たち */}
        <path d="M 1000 850 L 1700 850 L 1640 720 L 1060 720 Z" fill={C.mat} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.matDark} strokeWidth={3}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={1060 + i * 62} y1={722} x2={1006 + i * 70} y2={848} />)}</g>
        {/* 盤 (背中の後ろへ滑っていく) */}
        <g transform={`translate(${lerp(1330, 1150, hide)} ${lerp(780, 690, hide)}) rotate(${lerp(0, -70, hide)})`}>
          <HmGBan w={240} f={f} />
        </g>
        {/* 貴族A: 盤を背中に隠す (左) */}
        <Person x={1130} y={870} s={1.0} f={f} face={shock ? "worried" : "joy"} pose="armsFolded" lean={shock ? 6 : 0}
          cloth={C.robePurple} clothDark={C.robeBrown} gaze={shock ? [-8, 0] : [6, 4]} phase={2} />
        <HmGKanmuri x={1130} y={870} s={1.0} f={f} phase={2} lean={shock ? 6 : 0} tall={false} />
        {/* 貴族B: ばんざいで固まる (中) */}
        <Person x={1380} y={890} s={1.05} f={f} face={shock ? "surprised" : "smile"} pose={shock ? "banzai" : "hold"}
          cloth={C.robeBlue} clothDark={KRP.blueDeep} gaze={shock ? [-8, -2] : [0, 6]} phase={4} />
        <HmGKanmuri x={1380} y={890} s={1.05} f={f} phase={4} tall={false} />
        {/* 貴族C: そっぽを向いて口笛 (右) */}
        <Person x={1600} y={870} s={0.98} f={f} face={shock ? "smile" : "joy"} pose="stand" lean={shock ? -8 : 0}
          cloth={C.robeOlive} clothDark={C.robeBrown} gaze={shock ? [10, -6] : [-6, 6]} phase={6} />
        <HmGKanmuri x={1600} y={870} s={0.98} f={f} phase={6} lean={shock ? -8 : 0} tall={false} />
        {shock && (
          <g opacity={seg(f, 22, 28)}>
            {/* 口笛の音符 */}
            {[0, 1].map((j) => {
              const t = ((f + j * 12) % 24) / 24;
              return (
                <g key={j} transform={`translate(${1690 + t * 60} ${600 - t * 70})`} opacity={1 - t}>
                  <ellipse cx={0} cy={0} rx={12} ry={9} fill={KRP.ink} />
                  <line x1={10} y1={0} x2={10} y2={-40} stroke={KRP.ink} strokeWidth={5} />
                </g>
              );
            })}
            {/* 驚きの汗 */}
            {[[1110, 610], [1400, 600]].map(([sx, sy], i) => (
              <path key={i} d={`M ${sx + 70} ${sy} q 12 18 0 26 q -12 -8 0 -26 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        )}
        {/* 転がるサイコロ */}
        <g transform={`translate(${diceX} ${diceY}) rotate(${-roll * 720})`}>
          <rect x={-22} y={-22} width={44} height={44} rx={8} fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
          {[[-9, -9], [9, 9], [0, 0]].map(([px, py], j) => <circle key={j} cx={px} cy={py} r={5} fill={C.woodDark} />)}
        </g>
        {roll > 0 && roll < 1 && <g stroke={C.gravelDot} strokeWidth={5} strokeLinecap="round">{[0, 1, 2].map((j) => <line key={j} x1={diceX + 40 + j * 24} y1={812} x2={diceX + 56 + j * 24} y2={812} />)}</g>}
      </g>
      {/* 札 (カメラの外) */}
      <TagPlate x={1740} y={100} text="689年" size={46} t={seg(f, 2, 10)} fill={KRP.cream} />
      <TagPlate x={600} y={410} text="〜とされる" size={24} t={seg(f, 16, 24)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #141 盤の上でこまを進める、「盤すごろく」のことです。
// 格: 図 / seed 5141
// 絵: どこ: 古い木の盤 (真上から・木目)。演出: 盤すごろくの盤 (細長い盤に左右12マスずつの線・白黒のこま) を大きく。サイコロが転がって、白いこまがマスを進む。札「盤すごろく」。今の紙のすごろく (絵双六) とはちがうことを、隅に小さく紙のすごろくを置いて「×」で示す。動き: サイコロ / こまが進む
// どこ: 畳の上に置いた古い木の盤を真上から。盤は画面いっぱいの細長い長方形 (木目・中央の仕切り・上下に12本ずつの線)
// 演出: 白黒のこまが並ぶ盤の上に、サイコロが2つ転がりこんで「3」と「4」が出る。白いこまがぴょんと7つ先の線へ進む。
//       右上の隅には今の紙のすごろく (絵双六) を小さく置き、赤い×で「こっちではない」
// 動き: サイコロが転がる (f4〜20) / 白いこまが弧を描いて進む (f22〜38) / カメラが少し寄る
const Hm141: React.FC<{ f: number }> = ({ f }) => {
  const bx = 180, by = 250, bw = 1400, bh = 520;
  const roll = easeOut(seg(f, 4, 20));
  const move = easeInOut(seg(f, 22, 38));
  const cam = 1 + 0.035 * easeOut(seg(f, 0, 42));
  // 線の x (上下とも 12 本。左6・右6)
  const lineX = (k: number) => {
    const half = k < 6 ? 0 : 1;
    const j = k % 6;
    return bx + 60 + half * (bw / 2) + j * ((bw / 2 - 120) / 5) + (half ? 20 : 0);
  };
  const fromK = 2, toK = 9;
  const px = lerp(lineX(fromK), lineX(toK), move);
  const py = by + bh - 120 - Math.sin(move * Math.PI) * 150;
  return (
    <Frame f={f} seed={5141} bg={C.tatami}>
      <g transform={`translate(880 520) scale(${cam}) translate(-880 -520)`}>
        {/* 畳 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.tatami} />
        <g stroke={C.matDark} strokeWidth={2} opacity={0.5}>{Array.from({ length: 60 }, (_, i) => <line key={i} x1={-40} y1={i * 20} x2={1960} y2={i * 20} />)}</g>
        <rect x={-40} y={930} width={2000} height={30} fill={C.robeGreenDark} />
        {/* 盤の影と本体 */}
        <rect x={bx + 20} y={by + 26} width={bw} height={bh} rx={14} fill={KRP.ink} opacity={0.3} />
        <rect x={bx} y={by} width={bw} height={bh} rx={14} fill={C.wood} stroke={KRP.ink} strokeWidth={9} />
        <rect x={bx + 30} y={by + 30} width={bw - 60} height={bh - 60} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.wood} strokeWidth={4} fill="none" opacity={0.7}>
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${bx + 40} ${by + 70 + i * 75} q 350 ${i % 2 ? 16 : -16} 660 0 q 330 ${i % 2 ? -16 : 16} 660 0`} />)}
        </g>
        <rect x={bx + bw / 2 - 20} y={by + 30} width={40} height={bh - 60} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 上下 12 本ずつの線 */}
        {Array.from({ length: 12 }, (_, k) => (
          <g key={k} stroke={C.woodDark} strokeWidth={8} strokeLinecap="round">
            <line x1={lineX(k)} y1={by + 50} x2={lineX(k)} y2={by + 190} />
            <line x1={lineX(k)} y1={by + bh - 190} x2={lineX(k)} y2={by + bh - 50} />
          </g>
        ))}
        {/* こま (白黒) */}
        {[[0, 0, 0], [1, 0, 1], [4, 0, 1], [5, 1, 0], [7, 1, 0], [11, 1, 1], [11, 0, 1], [3, 1, 1], [8, 0, 0]].map(([k, top, b], i) => (
          <g key={i}>
            <circle cx={lineX(k) + 4} cy={(top ? by + 120 : by + bh - 120) + 6} r={40} fill={KRP.ink} opacity={0.25} />
            <circle cx={lineX(k)} cy={top ? by + 120 : by + bh - 120} r={40} fill={b ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={lineX(k)} cy={top ? by + 120 : by + bh - 120} r={22} fill="none" stroke={b ? KRP.grayDark : KRP.gray} strokeWidth={4} />
          </g>
        ))}
        {/* 進む白いこま (弧の軌跡つき) */}
        {move > 0 && move < 1 && (
          <path d={`M ${lineX(fromK)} ${by + bh - 120} Q ${(lineX(fromK) + lineX(toK)) / 2} ${by + bh - 420} ${lineX(toK)} ${by + bh - 120}`}
            stroke={KRP.white} strokeWidth={6} strokeDasharray="14 14" fill="none" opacity={0.8} />
        )}
        <ellipse cx={px + 6} cy={by + bh - 112} rx={40 - 14 * Math.sin(move * Math.PI)} ry={12} fill={KRP.ink} opacity={0.25} />
        <circle cx={px} cy={py} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={px} cy={py} r={22} fill="none" stroke={KRP.gray} strokeWidth={4} />
        {move >= 1 && <g stroke={HP.spark} strokeWidth={6} strokeLinecap="round">{[0, 1, 2, 3, 4].map((j) => {
          const a = (-150 + j * 30) * Math.PI / 180;
          return <line key={j} x1={px + Math.cos(a) * 56} y1={py + Math.sin(a) * 56} x2={px + Math.cos(a) * 80} y2={py + Math.sin(a) * 80} />;
        })}</g>}
        {/* サイコロ2つ (右から転がりこむ) */}
        {[[0, 3], [1, 4]].map(([j, pip]) => {
          const dx = lerp(1700 + j * 60, 1060 + j * 130, roll);
          const dy = by + bh / 2 + (j ? 30 : -40) - Math.abs(Math.sin(roll * Math.PI * 3)) * 30 * (1 - roll);
          const r = (1 - roll) * 540 + (j ? 14 : -10);
          const dots: Record<number, [number, number][]> = {
            3: [[-20, -20], [0, 0], [20, 20]],
            4: [[-20, -20], [20, -20], [-20, 20], [20, 20]],
          };
          return (
            <g key={j} transform={`translate(${dx} ${dy}) rotate(${r})`}>
              <rect x={-44} y={-40} width={88} height={88} rx={14} fill={KRP.ink} opacity={0.25} />
              <rect x={-44} y={-44} width={88} height={88} rx={14} fill={C.woodPale} stroke={KRP.ink} strokeWidth={6} />
              {(roll > 0.85 ? dots[pip] : dots[j ? 3 : 4]).map(([qx, qy], q) => <circle key={q} cx={qx} cy={qy} r={9} fill={C.woodDark} />)}
            </g>
          );
        })}
        {/* 右上の隅: 紙のすごろく (絵双六) に × */}
        <g transform="translate(1735 330) rotate(6)">
          <rect x={-150} y={-120} width={300} height={230} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = i * 0.55, r = 90 - i * 6;
            return <rect key={i} x={Math.cos(a) * r * 1.3 - 18} y={Math.sin(a) * r * 0.8 - 14} width={36} height={28} rx={4}
              fill={[KRP.red, KRP.yellow, KRP.blue, KRP.green][i % 4]} stroke={KRP.ink} strokeWidth={2.5} />;
          })}
          <circle cx={0} cy={0} r={18} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <XMark x={1735} y={330} s={1.3} t={seg(f, 10, 18)} />
      </g>
      <TagPlate x={720} y={150} text="盤すごろく" size={50} t={seg(f, 2, 10)} fill={KRP.cream} />
      <TagPlate x={1735} y={520} text="紙のすごろく" size={26} t={seg(f, 12, 20)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #142 1300年以上前から、遊びすぎは、怒られていたのです。
// 格: 山 / seed 5142
// 絵: どこ: 平安の屋敷の縁側 (簾・庭の池)。演出: 夜ふけまで盤すごろくに夢中の若者たち。そこへ年配の人 (渋い色の衣) が「こらっ」と簾を開けて現れ、若者たちが飛び上がる。月が高く昇っている (夜ふけ)。動き: 簾が開く / 飛び上がる / 月
// どこ: 平安の屋敷の夜ふけ。縁側 (板張り)・柱・簾・灯台の火。外には池と松、空のてっぺんに月
// 演出: 灯台の明かりで盤すごろくに夢中の若者2人。左の簾がくるくる巻き上がって、渋い色の衣の年配の人が「こらっ」の怒り顔で指さす。
//       若者2人は盤を放り出して空中に飛び上がり、こまが宙に舞う
// 動き: 簾が巻き上がる (f6〜18) / 若者が飛び上がる (f20〜30・空中で止まる) / こまが舞う / 灯台の火がゆれる / 月がゆっくり昇る
const Hm142: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeOut(seg(f, 6, 18));
  const jump = easeOut(seg(f, 20, 28));
  const scold = f >= 18;
  const moonY = 140 - 20 * seg(f, 0, 42);
  const flame = 1 + 0.08 * Math.sin(f / 2.5);
  const sudareH = lerp(470, 60, roll);
  return (
    <Frame f={f} seed={5142} bg={C.nightSky} dark>
      {/* 夜空と月 */}
      <rect x={-40} y={-40} width={2000} height={700} fill={C.nightSky} />
      <rect x={-40} y={300} width={2000} height={360} fill={C.nightSky2} opacity={0.6} />
      <circle cx={1500} cy={moonY} r={74} fill={C.moon} />
      <circle cx={1500} cy={moonY} r={110} fill={C.moon} opacity={0.12} />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={rnd(5142, i) * 1900} cy={rnd(5143, i) * 320} r={2.5} fill={KRP.white} opacity={0.4 + 0.5 * Math.sin(f / 8 + i)} />
      ))}
      {/* 庭の松と池 (右奥) */}
      <path d="M 1100 600 Q 1500 540 1960 590 L 1960 700 L 1100 700 Z" fill={C.pond} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={1500} cy={630} rx={50} ry={10} fill={C.moon} opacity={0.5 + 0.2 * Math.sin(f / 6)} />
      <g>
        <path d="M 1760 600 q -20 -160 30 -300" stroke={C.trunk} strokeWidth={26} fill="none" strokeLinecap="round" />
        {[[1700, 320], [1830, 280], [1760, 230], [1660, 400]].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={110} ry={36} fill={C.pine} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      {/* 屋根の軒 */}
      <path d="M -40 -40 L 1960 -40 L 1960 40 L -40 80 Z" fill={C.engawaDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 柱 */}
      {[120, 1060].map((px) => <rect key={px} x={px} y={40} width={44} height={640} fill={C.engawa} stroke={KRP.ink} strokeWidth={6} />)}
      {/* 部屋の中 (左の簾の向こう) */}
      <rect x={164} y={60} width={600} height={620} fill={C.engawaDark} />
      <rect x={164} y={60} width={600} height={620} fill={C.lampFire} opacity={0.12} />
      {/* 年配の人 (簾の向こうから現れる) */}
      <Person x={460} y={694} s={1.1} f={f} face={scold ? "angry" : "normal"} pose={scold ? "point" : "stand"}
        cloth={C.robeBrown} clothDark={C.engawaDark} hair="none" phase={3} />
      <HmGKanmuri x={460} y={694} s={1.1} f={f} phase={3} />
      {/* 怒りのしるし */}
      {scold && (
        <g transform={`translate(590 ${330 + Math.sin(f / 3) * 4}) scale(${pop(seg(f, 18, 24))})`} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M -24 -8 Q -8 -8 -8 -24" /><path d="M 8 -24 Q 8 -8 24 -8" />
          <path d="M -24 8 Q -8 8 -8 24" /><path d="M 8 24 Q 8 8 24 8" />
        </g>
      )}
      {/* 簾 (巻き上がる) */}
      <g>
        <rect x={164} y={60} width={600} height={sudareH} fill={C.sudare} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.sudareDark} strokeWidth={3}>
          {Array.from({ length: Math.floor(sudareH / 14) }, (_, i) => <line key={i} x1={168} y1={70 + i * 14} x2={760} y2={70 + i * 14} />)}
        </g>
        <rect x={150} y={52 + sudareH - 30} width={628} height={40} rx={20} fill={C.sudareDark} stroke={KRP.ink} strokeWidth={6} />
        {[300, 620].map((cx) => <line key={cx} x1={cx} y1={60} x2={cx} y2={52 + sudareH} stroke={KRP.red} strokeWidth={6} />)}
      </g>
      {/* 縁側の板 */}
      <rect x={-40} y={680} width={2000} height={460} fill={C.engawa} />
      <g stroke={C.engawaDark} strokeWidth={5}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40} y1={720 + i * 70} x2={1960} y2={720 + i * 70} />)}</g>
      <rect x={-40} y={672} width={2000} height={20} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 灯台 (油の明かり) */}
      <g>
        <rect x={1020} y={520} width={16} height={260} fill={KRP.ink} />
        <ellipse cx={1028} cy={780} rx={50} ry={14} fill={KRP.ink} />
        <ellipse cx={1028} cy={520} rx={34} ry={9} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`translate(1028 512) scale(1 ${flame})`}>
          <path d="M 0 -50 Q 18 -14 0 0 Q -18 -14 0 -50 Z" fill={C.lampFire} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <circle cx={1028} cy={490} r={170} fill={C.lampFire} opacity={0.12 * flame} />
      </g>
      {/* 盤 (若者の前) */}
      <g transform={`translate(1360 ${800 - jump * 30}) rotate(${jump * -8})`}>
        <HmGBan w={300} f={f} pieces={false} />
      </g>
      {/* 宙に舞うこま */}
      {jump > 0 && [0, 1, 2, 3, 4, 5].map((j) => {
        const ang = (-150 + j * 24) * Math.PI / 180;
        const d = 60 + jump * 170;
        return <circle key={j} cx={1360 + Math.cos(ang) * d} cy={760 + Math.sin(ang) * d * 0.9 + Math.sin(f / 4 + j) * 4}
          r={14} fill={j % 2 ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={4} />;
      })}
      {/* 若者2人 (飛び上がる) */}
      {[[1220, 0, C.robeBlue, KRP.blueDeep, -8], [1530, 1, C.robePurple, C.robeBrown, 8]].map(([px, k, cl, cd, ln]) => {
        const lift = jump * (k ? 150 : 130);
        return (
          <g key={k as number}>
            <ellipse cx={px as number} cy={872} rx={70 - jump * 30} ry={12} fill={KRP.ink} opacity={0.3} />
            <Person x={px as number} y={870 - lift} s={1.0} f={f} face={jump > 0 ? "surprised" : "joy"} pose={jump > 0 ? "banzai" : "hold"}
              lean={jump * (ln as number)} cloth={cl as string} clothDark={cd as string} gaze={jump > 0 ? [-9, -2] : [0, 6]} phase={(k as number) * 3 + 1} />
            <HmGKanmuri x={px as number} y={870 - lift} s={1.0} f={f} phase={(k as number) * 3 + 1} lean={jump * (ln as number)} tall={false} />
            {jump > 0.5 && (
              <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7}>
                {[-40, 0, 40].map((dx) => <line key={dx} x1={(px as number) + dx} y1={900 - lift + 20} x2={(px as number) + dx} y2={960 - lift + 30} />)}
              </g>
            )}
          </g>
        );
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #143 ただ、盤で遊ぶには、場所と、まとまった時間がいります。電車で広げたら、たぶん迷惑です。
// 格: 山 / seed 5143
// 絵: どこ: 現代の満員電車の車内。演出: 座席で、ある乗客が大きな盤すごろくの盤を**ひざの上に広げて**、両隣の乗客を押しのけている。両隣は迷惑顔 (face="angry" は控えめ、worried)。こまがころころ床に落ちる。動き: 盤が広がる / 隣が押される / こまが転がる
// どこ: 現代の満員電車の車内。長い座席・窓の外を流れる街・つり革・網棚・中づり広告の枠 (文字なし)
// 演出: 真ん中の乗客が、ひざの上で大きな盤すごろくをばーんと広げる (本人はごきげん)。両隣は盤に押されて体が傾き、
//       押された人がさらに隣を押す「押しくらまんじゅう」。端に立つ乗客もぎょっ。こまが床にころころ落ちる
// 動き: 盤が広がる (f6〜20) / 隣が押される (f12〜26) / こまが落ちて転がる (f18〜40) / つり革と車体のゆれ
const Hm143: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 6, 20));
  const push = easeOut(seg(f, 12, 26));
  const sway = Math.sin(f / 11) * 0.6;
  const bw = lerp(240, 820, open);
  const scroll = (f * 14) % 400;
  const seats: { x: number; dx: number; ln: number; face: "worried" | "surprised" | "normal"; cl: string; cd: string; ph: number }[] = [
    { x: 300, dx: -30, ln: -8, face: "worried", cl: KRP.grayDark, cd: KRP.ink, ph: 1 },
    { x: 620, dx: -70, ln: -16, face: "worried", cl: KRP.blueDeep, cd: KRP.ink, ph: 2 },
    { x: 1300, dx: 70, ln: 16, face: "surprised", cl: KRP.red, cd: C.robeBrown, ph: 3 },
    { x: 1620, dx: 30, ln: 8, face: "worried", cl: C.robeGreen, cd: C.robeGreenDark, ph: 4 },
  ];
  return (
    <Frame f={f} seed={5143} bg={C.trainWall}>
      <g transform={`rotate(${sway} 960 540)`}>
        {/* 車内の壁・窓 */}
        <rect x={-60} y={-60} width={2040} height={900} fill={C.trainWall} />
        {[80, 720, 1360].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={150} width={500} height={250} rx={16} fill={C.window} stroke={KRP.ink} strokeWidth={7} />
            <clipPath id={`hmg143w${wx}`}><rect x={wx} y={150} width={500} height={250} rx={16} /></clipPath>
            <g clipPath={`url(#hmg143w${wx})`}>
              {Array.from({ length: 8 }, (_, i) => {
                const bx = ((i * 200 - scroll - wx) % 1600 + 1600) % 1600 + wx - 200;
                const bh = 80 + (i * 53) % 120;
                return <rect key={i} x={bx} y={400 - bh} width={150} height={bh} fill={C.building} stroke={KRP.ink} strokeWidth={3} />;
              })}
              <path d={`M ${wx - 40} 160 L ${wx + 60} 160 L ${wx - 40} 260 Z`} fill={KRP.white} opacity={0.3} />
            </g>
          </g>
        ))}
        {/* 網棚と中づりの枠 */}
        <rect x={-60} y={90} width={2040} height={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {[260, 960, 1660].map((ax, i) => (
          <g key={ax} transform={`rotate(${Math.sin(f / 13 + i) * 2} ${ax} 0)`}>
            <line x1={ax} y1={-40} x2={ax} y2={20} stroke={KRP.ink} strokeWidth={3} />
            <rect x={ax - 140} y={20} width={280} height={60} rx={4} fill={[KRP.yellow, KRP.blueSoft, C.crowd3][i]} stroke={KRP.ink} strokeWidth={4} />
            <rect x={ax - 120} y={34} width={120} height={12} rx={4} fill={KRP.white} opacity={0.7} />
          </g>
        ))}
        {/* つり革 */}
        {Array.from({ length: 9 }, (_, i) => {
          const sx = 120 + i * 210;
          return (
            <g key={i} transform={`rotate(${Math.sin(f / 9 + i * 0.4) * 7} ${sx} 104)`}>
              <line x1={sx} y1={104} x2={sx} y2={170} stroke={C.strap} strokeWidth={10} />
              <line x1={sx} y1={104} x2={sx} y2={170} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
              <path d={`M ${sx - 24} 170 L ${sx + 24} 170 L ${sx + 14} 222 Q ${sx} 232 ${sx - 14} 222 Z`} fill="none" stroke={KRP.white} strokeWidth={9} />
              <path d={`M ${sx - 24} 170 L ${sx + 24} 170 L ${sx + 14} 222 Q ${sx} 232 ${sx - 14} 222 Z`} fill="none" stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 座席の背 */}
        <rect x={-60} y={500} width={2040} height={210} rx={30} fill={C.trainSeat} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.trainSeatDark} strokeWidth={4}>{[460, 780, 1140, 1460].map((lx) => <line key={lx} x1={lx} y1={520} x2={lx} y2={700} />)}</g>
        {/* 床 */}
        <rect x={-60} y={800} width={2040} height={340} fill={C.trainFloor} />
        <g stroke={KRP.grayDark} strokeWidth={3} opacity={0.5}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220 - 60} y1={800} x2={i * 250 - 200} y2={1120} />)}</g>
        {/* 座っている乗客 (押される) */}
        {seats.map((p) => (
          <Person key={p.x} x={p.x + p.dx * push} y={758} s={1.05} f={f} pose="sit" face={push > 0.2 ? p.face : "normal"}
            lean={p.ln * push} cloth={p.cl} clothDark={p.cd} gaze={push > 0.2 ? [p.x < 960 ? 8 : -8, 4] : [0, 4]} phase={p.ph} />
        ))}
        {/* 真ん中の盤の人 (ごきげん) */}
        <Person x={960} y={758} s={1.05} f={f} pose="sit" face={open > 0.5 ? "joy" : "smile"} cloth={HP.you} clothDark={HP.youDark} phase={5} gaze={[0, 6]} />
        {/* 座面の手前 */}
        <rect x={-60} y={696} width={2040} height={70} rx={20} fill={C.trainSeat} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-60} y={766} width={2040} height={36} fill={C.trainSeatDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ひざの上の大きな盤 (横に広がる) */}
        <g transform={`translate(960 670) scale(1 0.5)`}>
          <HmGBan w={bw} f={f} />
        </g>
        {/* 盤を持つ手 */}
        <HmGHand x={960 - bw / 2 + 20} y={676} r={13} />
        <HmGHand x={960 + bw / 2 - 20} y={676} r={13} />
        {/* 押しの「むぎゅ」線 */}
        {push > 0.3 && [[960 - bw / 2 - 30, -1], [960 + bw / 2 + 30, 1]].map(([lx, d], i) => (
          <g key={i} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
            {[-30, 0, 30].map((dy) => <line key={dy} x1={lx} y1={640 + dy} x2={lx + d * 30} y2={640 + dy} />)}
          </g>
        ))}
        {/* 床に落ちて転がるこま */}
        {[0, 1, 2, 3, 4].map((j) => {
          const t = seg(f, 18 + j * 4, 30 + j * 4);
          if (t <= 0) return null;
          const sx = 960 + (j % 2 ? 1 : -1) * (bw / 2 - 40);
          const ex = sx + (j % 2 ? 1 : -1) * (80 + j * 50);
          const fall = Math.min(t * 2, 1);
          const cx = lerp(sx, ex, t);
          const cy = lerp(700, 870, fall * fall) - (t > 0.5 ? Math.abs(Math.sin(t * 12)) * 20 * (1 - t) : 0);
          return (
            <g key={j}>
              <ellipse cx={cx} cy={884} rx={20} ry={6} fill={KRP.ink} opacity={0.25 * fall} />
              <ellipse cx={cx} cy={cy} rx={20} ry={14} fill={j % 2 ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 両端の立っている乗客 (つり革につかまってぎょっ) */}
        <Person x={60} y={1000} s={1.25} f={f} pose="hold" face={push > 0.5 ? "surprised" : "normal"} cloth={C.jacket} clothDark={C.jacketDark} gaze={[9, 4]} phase={6} />
        <Person x={1860} y={1000} s={1.25} f={f} pose="hold" face={push > 0.5 ? "surprised" : "normal"} cloth={KRP.grayDark} clothDark={KRP.ink} gaze={[-9, 4]} phase={7} glasses />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #144 道具は、ここから、どんどん小さくなっていきます。
// 格: 図 / seed 5144
// 絵: どこ: 作業机の上 (前半と同じ作業机)。演出: 大きな盤 → トランプ → 文庫本 → カセット → ゲーム機 → スマホ が、マトリョーシカのように**次々と小さくなりながら**左から右へ並んでいく。最後のスマホがいちばん小さい。動き: 順に小さくなって並ぶ / ぽんぽん
// どこ: 前半と同じ作業机 (Sagyozukue) の天板の上
// 演出: 左から 盤すごろく → トランプ → 文庫本 → カセット → ゲーム機 → スマホ が、マトリョーシカのように
//       1つ前より小さくなりながら、ぽんぽんと順に現れて一列に並ぶ。最後に頭の高さを結ぶ点線が右下がりに引かれる
// 動き: 順にぽんと出る (f4〜40) / 出るたびに煙のわっか / 点線が伸びる (f32〜42) / カメラが左から右へ少しパン
const HmG144Row: { kind: HmGKind; x: number; w: number; h: number }[] = [
  { kind: "ban", x: 380, w: 420, h: 210 },
  { kind: "card", x: 760, w: 230, h: 230 },
  { kind: "bunko", x: 1010, w: 170, h: 160 },
  { kind: "cass", x: 1215, w: 140, h: 88 },
  { kind: "game", x: 1375, w: 96, h: 125 },
  { kind: "phone", x: 1500, w: 110, h: 100 },
];
const Hm144: React.FC<{ f: number }> = ({ f }) => {
  const base = 790;
  const pan = 20 - 40 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5144}>
      <g transform={`translate(${pan} 0)`}>
        <Sagyozukue f={f} />
        {HmG144Row.map((it, i) => {
          const t = seg(f, 4 + i * 6, 12 + i * 6);
          if (t <= 0) return null;
          const sc = pop(t);
          const cy = base - it.h / 2;
          const puff = seg(f, 4 + i * 6, 16 + i * 6);
          return (
            <g key={i}>
              <ellipse cx={it.x + 8} cy={base + 4} rx={it.w * 0.55 * sc} ry={12 * sc} fill={KRP.ink} opacity={0.28} />
              <g transform={`translate(${it.x} ${base}) scale(${sc}) translate(0 ${cy - base}) rotate(${Math.sin(f / 12 + i) * 1.2})`}>
                <HmGItem kind={it.kind} f={f} w={it.w} />
              </g>
              {puff > 0 && puff < 1 && (
                <g opacity={1 - puff}>
                  {[0, 1, 2, 3, 4, 5].map((j) => {
                    const a = (j * 60 + 30) * Math.PI / 180;
                    const d = it.w * 0.4 + puff * 50;
                    return <circle key={j} cx={it.x + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.7} r={10 + puff * 10}
                      fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} />;
                  })}
                </g>
              )}
            </g>
          );
        })}
        {/* 「小さくなる」の矢印 (道具と道具のあいだ) */}
        {HmG144Row.slice(1).map((it, i) => {
          const prev = HmG144Row[i];
          const ax = (prev.x + prev.w / 2 + it.x - it.w / 2) / 2;
          const as = 0.42 - i * 0.05;
          return <Arrow key={i} x={ax + 55 * as} y={base - 60} s={as} t={seg(f, 10 + i * 6, 16 + i * 6)} />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #145 1913年12月21日。アメリカの新聞に、クロスワードパズルが初めて載ります。新聞とえんぴつがあれば、どこでも遊べます。
// 格: 山 / seed 5145
// 絵: どこ: 1913年のニューヨークの朝の路面電車の中。年代札「1913年」、地名札「アメリカ」。演出: 乗客が新聞を折りたたんで、クロスワードの格子 (ひし形の格子。字は入れない) にえんぴつで書きこんでいる。隣の乗客ものぞきこむ。窓の外に高いビル。動き: えんぴつが動く / マスが埋まる / 電車の揺れ
// どこ: 1913年・ニューヨークの朝の路面電車の中。木の内装・真鍮の手すり・ランプ・窓の外に高いビル (右へ流れる)。年代札・地名札
// 演出: 山高帽の紳士が新聞を折りたたみ、ひし形の格子のクロスワードにえんぴつで書きこむ (マスが1つずつ埋まる)。
//       隣のボンネット帽の婦人がぐいっと身を乗り出してのぞきこみ、最後は指でマスを指してにっこり
// 動き: えんぴつが動く / マスが順に埋まる (f6〜40) / 婦人が乗り出す (f14〜28) / 車体のゆれ / 外のビルが流れる
const HmG145Cells: [number, number][] = (() => {
  // ひし形の格子 (中央は空洞)
  const out: [number, number][] = [];
  const rows = [1, 3, 5, 7, 5, 3, 1];
  rows.forEach((n, r) => {
    for (let c = 0; c < n; c++) {
      const cx = c - (n - 1) / 2;
      if (r === 3 && Math.abs(cx) <= 1) continue;
      out.push([cx, r - 3]);
    }
  });
  return out;
})();
const Hm145: React.FC<{ f: number }> = ({ f }) => {
  const shake = Math.sin(f / 4) * 2 + Math.sin(f / 1.7) * 0.8;
  const peek = easeOut(seg(f, 14, 28));
  const filled = Math.floor(seg(f, 6, 40) * 14);
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const cell = 38;
  const nx = 960, ny = 672; // 新聞の格子の中心
  const target = HmG145Cells[order[Math.min(filled, 13)]];
  const penX = nx + target[0] * cell + 24 + Math.sin(f * 1.3) * 6;
  const penY = ny + target[1] * cell + 4 + Math.cos(f * 1.1) * 4;
  const scroll = (f * 10) % 600;
  return (
    <Frame f={f} seed={5145} bg={C.tramWood}>
      <g transform={`translate(0 ${shake})`}>
        {/* 車内の壁 (木) */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.tramWood} />
        <g stroke={C.tramWoodDark} strokeWidth={4} opacity={0.6}>{Array.from({ length: 20 }, (_, i) => <line key={i} x1={i * 100} y1={-40} x2={i * 100} y2={140} />)}</g>
        <rect x={-40} y={120} width={2000} height={20} fill={C.tramWoodDark} />
        {/* 窓 (外に高いビル) */}
        {[60, 700, 1340].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={140} width={520} height={220} rx={10} fill={C.sepiaSky} stroke={KRP.ink} strokeWidth={8} />
            <clipPath id={`hmg145w${wx}`}><rect x={wx} y={140} width={520} height={220} rx={10} /></clipPath>
            <g clipPath={`url(#hmg145w${wx})`}>
              {Array.from({ length: 7 }, (_, i) => {
                const bx = ((i * 230 + scroll - wx) % 1610 + 1610) % 1610 + wx - 300;
                const bh = 140 + (i * 71) % 100;
                return (
                  <g key={i}>
                    <rect x={bx} y={360 - bh} width={130} height={bh} fill={i % 2 ? C.building : C.buildingDark} stroke={KRP.ink} strokeWidth={3} />
                    {Array.from({ length: Math.floor(bh / 40) }, (_, r) => (
                      <g key={r}>{[0, 1, 2].map((c) => <rect key={c} x={bx + 16 + c * 38} y={360 - bh + 16 + r * 40} width={20} height={22} fill={C.sepiaSky} opacity={0.8} />)}</g>
                    ))}
                  </g>
                );
              })}
            </g>
            <rect x={wx} y={250} width={520} height={10} fill={C.tramWoodDark} />
          </g>
        ))}
        {/* 天井のランプと真鍮の手すり */}
        <rect x={-40} y={60} width={2000} height={12} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
        {[480, 1440].map((lx) => (
          <g key={lx}>
            <rect x={lx - 30} y={-20} width={60} height={50} rx={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={44} r={22} fill={C.spot} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 座席 (木のベンチ) */}
        <rect x={-40} y={380} width={2000} height={260} fill={C.tramWoodDark} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.tramWood} strokeWidth={6}>{Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40} y1={410 + i * 38} x2={1960} y2={410 + i * 38} />)}</g>
        <rect x={-40} y={630} width={2000} height={50} rx={12} fill={C.tramWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={710} width={2000} height={430} fill={C.woodDark} />
        <g stroke={C.tramWoodDark} strokeWidth={5}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240 - 40} y1={710} x2={i * 300 - 260} y2={1120} />)}</g>
        {/* 床に落ちた切符と、紳士の傘 */}
        <g transform={`rotate(${-12 + Math.sin(f / 9) * 2} 560 900)`}>
          <rect x={520} y={880} width={90} height={44} rx={4} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} />
          <line x1={536} y1={896} x2={590} y2={896} stroke={KRP.red} strokeWidth={4} />
        </g>
        <path d="M 520 700 L 470 880 Q 462 906 486 906" stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* 紳士 (新聞を読む) */}
        <Person x={760} y={700} s={1.18} f={f} pose="sit" face="normal" gaze={[6, 8]} cloth={KRP.grayDark} clothDark={KRP.ink} hair="none" phase={2} still />
        <g transform={`translate(760 700) scale(1.18)`}>
          <path d="M -62 -262 Q -60 -318 0 -322 Q 60 -318 62 -262 Z" fill={C.bowler} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-262} rx={90} ry={14} fill={C.bowler} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -30 -176 q 30 14 60 0" stroke={KRP.ink} strokeWidth={6} fill="none" />
        </g>
        {/* 婦人 (身を乗り出してのぞく) */}
        <Person x={1260} y={700} s={1.12} f={f} pose={peek > 0.8 ? "point" : "sit"} pointDir={-1} face={peek > 0.8 ? "smile" : "surprised"}
          lean={-14 * peek} gaze={[-9, 7]} cloth={C.bonnet} clothDark={C.robeBrown} hair="none" phase={4} still />
        <g transform={`translate(1260 700) scale(1.12) rotate(${-14 * peek})`}>
          <path d="M -80 -230 Q -84 -320 0 -326 Q 84 -320 80 -230 Q 64 -276 0 -280 Q -64 -276 -80 -230 Z" fill={C.bonnet} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -72 -262 Q 0 -300 72 -262" stroke={KRP.white} strokeWidth={8} fill="none" />
          <circle cx={56} cy={-300} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 折りたたんだ新聞 (大きく・手前) */}
        <g transform={`rotate(-4 ${nx} ${ny})`}>
          <rect x={nx - 270} y={ny - 166} width={540} height={326} rx={6} fill={C.newsprint} stroke={KRP.ink} strokeWidth={7} />
          <line x1={nx - 270} y1={ny - 150} x2={nx + 270} y2={ny - 150} stroke={C.newsInk} strokeWidth={3} />
          {/* 記事の段 (字のかわりの灰色の線) */}
          {[0, 1].map((c) => Array.from({ length: 9 }, (_, r) => (
            <line key={`${c}-${r}`} x1={nx - 252 + c * 410} y1={ny - 124 + r * 32} x2={nx - 252 + c * 410 + (r % 4 === 3 ? 50 : 84)} y2={ny - 124 + r * 32}
              stroke={C.newsInk} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          )))}
          {/* ひし形のクロスワード */}
          {HmG145Cells.map(([cx, cy], i) => {
            const k = order.indexOf(i);
            const done = k >= 0 && k < filled;
            return (
              <g key={i}>
                <rect x={nx + cx * cell - cell / 2} y={ny + cy * cell - cell / 2} width={cell} height={cell}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                {done && <path d={`M ${nx + cx * cell - 12} ${ny + cy * cell + 8} q 8 -22 14 -2 q 6 -18 12 0`} stroke={KRP.ink} strokeWidth={4} fill="none" />}
              </g>
            );
          })}
          <rect x={nx - cell * 1.5} y={ny - cell / 2} width={cell * 3} height={cell} fill={KRP.ink} opacity={0.85} />
        </g>
        {/* えんぴつと紳士の手 */}
        <g transform={`translate(${penX} ${penY}) rotate(35)`}>
          <rect x={-8} y={-150} width={16} height={140} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -8 -10 L 8 -10 L 0 12 Z" fill={C.woodPale} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-8} y={-164} width={16} height={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <HmGHand x={penX + 40} y={penY - 50} r={18} />
        <HmGHand x={nx - 262} y={ny + 90} r={18} />
      </g>
      <TagPlate x={1520} y={100} text="1913年" size={44} t={seg(f, 2, 10)} fill={KRP.cream} />
      <TagPlate x={1770} y={100} text="アメリカ" size={40} t={seg(f, 4, 12)} fill={KRP.cream} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #146 1979年7月1日、ウォークマン。音楽を、持ち歩けるようになります。
// 格: 山 / seed 5146
// 絵: どこ: 1979年の公園の並木道 (夏)。年代札「1979年」。演出: カセットプレーヤーを腰につけ、ヘッドホンをした若者 (ロゴは描かない) が、音楽に合わせてローラースケートで滑っていく。ヘッドホンから音符が飛び出す。動き: 滑る / 音符 / 木漏れ日
// どこ: 1979年の夏の公園の並木道。奥へ続く道・左右の並木・木漏れ日・ベンチ・青空。左上に年代札
// 演出: 腰にカセットプレーヤー、頭にオレンジのスポンジのヘッドホンの若者が、ローラースケートでノリノリに滑ってくる。
//       ヘッドホンから音符がぽんぽん飛び出し、ベンチのおじさんが新聞をおろして目を丸くする。足元のハトが飛び立つ
// 動き: 滑る (左→中央) / 体が音楽にのってゆれる / 音符 / 木漏れ日がちらちら / ハトが飛び立つ (f18〜40)
const Hm146: React.FC<{ f: number }> = ({ f }) => {
  const glide = easeOut(seg(f, 0, 40));
  const px = lerp(700, 980, glide);
  const groove = Math.sin(f / 5) * 5;
  const s = 1.25, py = 900;
  const fly = seg(f, 18, 40);
  return (
    <Frame f={f} seed={5146} bg={C.summerSky}>
      {/* 空 */}
      <rect x={-40} y={-40} width={2000} height={520} fill={C.summerSky} />
      <ellipse cx={1500} cy={150} rx={150} ry={50} fill={KRP.white} opacity={0.9} />
      <ellipse cx={1600} cy={120} rx={100} ry={40} fill={KRP.white} opacity={0.9} />
      {/* 芝生 */}
      <rect x={-40} y={420} width={2000} height={720} fill={C.parkGreen} />
      {/* 道 (奥へ) */}
      <path d="M 860 420 L 1060 420 L 1700 1120 L 220 1120 Z" fill={C.path} stroke={KRP.ink} strokeWidth={6} />
      {/* 並木 (奥ほど小さい) */}
      {[0, 1, 2, 3].map((k) => {
        const t = k / 3;
        const sc = lerp(1.25, 0.35, t);
        const yb = lerp(1000, 450, t);
        return [-1, 1].map((side) => {
          const tx = 960 + side * lerp(820, 170, t);
          return (
            <g key={`${k}${side}`} transform={`translate(${tx} ${yb}) scale(${sc})`}>
              <rect x={-26} y={-420} width={52} height={420} fill={C.trunk} stroke={KRP.ink} strokeWidth={6} />
              <ellipse cx={0} cy={-470} rx={210} ry={150} fill={C.parkDark} stroke={KRP.ink} strokeWidth={6} />
              <ellipse cx={-80} cy={-520} rx={110} ry={80} fill={C.parkGreen} />
              <ellipse cx={90} cy={-430} rx={90} ry={60} fill={C.parkLight} opacity={0.7 + 0.2 * Math.sin(f / 10 + k)} />
            </g>
          );
        });
      })}
      {/* 木漏れ日 */}
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={340 + rnd(5146, i) * 1240} cy={620 + rnd(5147, i) * 380} rx={34 + rnd(5148, i) * 30} ry={12}
          fill={C.sunny} opacity={0.35 + 0.3 * Math.sin(f / 6 + i * 1.7)} />
      ))}
      {/* ベンチのおじさん (右) */}
      <g>
        <rect x={1380} y={640} width={300} height={24} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1380} y={700} width={300} height={24} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <Person x={1530} y={756} s={0.95} f={f} pose="sit" face={f > 20 ? "surprised" : "normal"} gaze={[-9, 0]} cloth={KRP.grayDark} clothDark={KRP.ink} hair="none" phase={3} />
        <g transform={`translate(1530 ${760 - lerp(170, 90, easeOut(seg(f, 16, 24)))}) rotate(-6)`}>
          <rect x={-70} y={-50} width={140} height={100} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((r) => <line key={r} x1={-56} y1={-30 + r * 20} x2={50} y2={-30 + r * 20} stroke={C.newsInk} strokeWidth={4} opacity={0.6} />)}
        </g>
        {[1400, 1660].map((lx) => <rect key={lx} x={lx} y={724} width={16} height={60} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
      </g>
      {/* ハト (飛び立つ) */}
      {[0, 1, 2].map((j) => {
        const bx = 1180 + j * 60 + fly * (120 + j * 40), by = 860 - fly * (260 + j * 60);
        const flap = Math.sin(f / 1.5 + j) * 18;
        return (
          <g key={j} transform={`translate(${bx} ${by})`}>
            <ellipse cx={0} cy={0} rx={26} ry={16} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={24} cy={-12} r={11} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 34 -12 l 10 3 l -10 3 Z" fill={KRP.orange} />
            {fly > 0 && <path d={`M -6 -6 L -30 ${-30 - flap} L 10 -10 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />}
          </g>
        );
      })}
      {/* 若者の後ろの風の線 */}
      <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.8}>
        {[-150, -90, -30].map((dy, i) => <line key={dy} x1={px - 160 - i * 30} y1={py + dy - 120} x2={px - 300 - i * 40} y2={py + dy - 120} />)}
      </g>
      {/* 若者 (ローラースケート) */}
      <ellipse cx={px} cy={py + 6} rx={90} ry={14} fill={KRP.ink} opacity={0.25} />
      <Person x={px} y={py} s={s} f={f} pose="run" face="joy" lean={10 + groove * 0.4} cloth={C.tee} clothDark={C.walkBlue} still phase={1} />
      <g transform={`translate(${px} ${py}) scale(${s}) rotate(${10 + groove * 0.4})`}>
        {/* スケート靴 */}
        {[[-30, -18], [32, 18]].map(([r, ox], i) => (
          <g key={i} transform={`rotate(${r} ${ox} -58)`}>
            <rect x={ox - 26} y={-26} width={52} height={22} rx={8} fill={C.skate} stroke={KRP.ink} strokeWidth={4} />
            {[-14, 14].map((wx) => <circle key={wx} cx={ox + wx} cy={2} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
              transform={`rotate(${f * 30} ${ox + wx} 2)`} />)}
          </g>
        ))}
        {/* ヘッドホン */}
        <path d="M -68 -226 Q -70 -312 0 -316 Q 70 -312 68 -226" stroke={KRP.silver} strokeWidth={10} fill="none" />
        <path d="M -68 -226 Q -70 -312 0 -316 Q 70 -312 68 -226" stroke={KRP.ink} strokeWidth={3} fill="none" />
        {[-1, 1].map((d) => <circle key={d} cx={d * 70} cy={-222} r={26} fill={C.orangePad} stroke={KRP.ink} strokeWidth={5} />)}
        {/* コードと腰のカセットプレーヤー */}
        <path d="M 70 -196 Q 110 -150 70 -100" stroke={KRP.ink} strokeWidth={3} fill="none" />
        <g transform="translate(64 -96) rotate(-6)">
          <rect x={-26} y={-34} width={52} height={68} rx={6} fill={C.walkBlue} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-18} y={-26} width={36} height={26} rx={3} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2.5} />
          {[-8, 8].map((cx) => <circle key={cx} cx={cx} cy={-13} r={5} fill={KRP.ink} />)}
          <rect x={-18} y={8} width={14} height={10} rx={2} fill={C.orangePad} stroke={KRP.ink} strokeWidth={2} />
        </g>
      </g>
      {/* 音符 (ヘッドホンから飛び出す) */}
      {[0, 1, 2, 3, 4].map((j) => {
        const t = ((f + j * 9) % 45) / 45;
        const side = j % 2 ? 1 : -1;
        const ox = px + side * 90 - t * 160, oy = py - 300 * s + 20 - t * 180;
        const col = [KRP.red, KRP.blueDeep, KRP.orange, KRP.green, HP.byo][j];
        return (
          <g key={j} transform={`translate(${ox} ${oy}) rotate(${Math.sin(t * 6 + j) * 16}) scale(${0.8 + t * 0.4})`} opacity={t < 0.85 ? 1 : (1 - t) / 0.15}>
            <ellipse cx={0} cy={0} rx={15} ry={11} fill={col} stroke={KRP.ink} strokeWidth={3} transform="rotate(-20)" />
            <line x1={13} y1={-4} x2={13} y2={-48} stroke={KRP.ink} strokeWidth={5} />
            {j % 2 === 0 && <path d="M 13 -48 q 18 6 16 26" stroke={KRP.ink} strokeWidth={5} fill="none" />}
          </g>
        );
      })}
      <TagPlate x={1760} y={100} text="1979年" size={44} t={seg(f, 2, 10)} fill={KRP.cream} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #147 1989年4月21日、ゲームボーイ。
// 格: 山 / seed 5147
// 絵: どこ: 1989年の家の居間とこたつ。年代札「1989年」。演出: こたつで子どもが携帯ゲーム機 (灰色の縦長のゲーム機・ロゴなし) を両手で持って夢中。画面に小さなブロックが落ちる模様。みかんの皮。動き: ボタンを押す指 / 画面のブロック / こたつの湯気
// どこ: 1989年の家の居間。ふすま・ブラウン管テレビ・壁の時計・畳・こたつ (柄の布団)。左上に年代札
// 演出: こたつに入った子どもが、灰色の縦長の携帯ゲーム機を両手で持って大寄りで夢中。画面ではブロックが落ちてくる。
//       こたつの上にはみかんの山と、むいた皮が星形にいくつも。湯のみの湯気。こたつ布団から猫が顔を出して迷惑そう
// 動き: ブロックが落ちる / 親指がボタンをぽちっ (10コマに1回) / 湯気 / 猫のしっぽ / カメラがゆっくり寄る
const Hm147: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const press = (f % 10) < 3 ? 1 : 0;
  const gx = 960, gy = 500, gw = 190, gk = gw / 200;
  return (
    <Frame f={f} seed={5147} bg={C.wall89}>
      <g transform={`translate(960 480) scale(${cam}) translate(-960 -480)`}>
        {/* 壁・ふすま・柱 */}
        <rect x={-40} y={-40} width={2000} height={720} fill={C.wall89} />
        <rect x={-40} y={40} width={560} height={640} fill={C.fusuma} stroke={KRP.ink} strokeWidth={7} />
        <line x1={240} y1={40} x2={240} y2={680} stroke={KRP.ink} strokeWidth={5} />
        {[120, 380].map((hx) => <ellipse key={hx} cx={hx + 90} cy={380} rx={14} ry={22} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
        <path d="M 0 160 q 60 -40 120 0 t 120 0 M 260 260 q 60 -40 120 0 t 120 0" stroke={C.parkGreen} strokeWidth={6} fill="none" opacity={0.6} />
        <rect x={520} y={-40} width={30} height={720} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 壁の時計 */}
        <g transform="translate(760 140)">
          <rect x={-60} y={-80} width={120} height={180} rx={14} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-20} r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-20} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={0} y1={-20} x2={24} y2={-10} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={0} y1={30} x2={Math.sin(f / 6) * 22} y2={80} stroke={HP.brass} strokeWidth={5} />
          <circle cx={Math.sin(f / 6) * 22} cy={80} r={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* ブラウン管テレビ (右) */}
        <g>
          <rect x={1420} y={520} width={420} height={160} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1450} y={250} width={360} height={280} rx={24} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1476} y={276} width={250} height={220} rx={30} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1500 300 q 40 -10 70 0" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.5} />
          {[320, 380, 440].map((by) => <circle key={by} cx={1770} cy={by} r={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />)}
          <path d="M 1580 250 L 1530 160 M 1660 250 L 1720 170" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 畳 */}
        <rect x={-40} y={680} width={2000} height={460} fill={C.tatami} />
        <g stroke={C.matDark} strokeWidth={4}><line x1={-40} y1={900} x2={1960} y2={900} /><line x1={640} y1={680} x2={640} y2={1120} /></g>
        {/* 子ども (こたつに入っている) */}
        <Person x={960} y={716} s={2.0} f={f} pose="hold" face="normal" gaze={[0, 9]} cloth={KRP.blueDeep} clothDark={KRP.ink} phase={2} />
        {/* 集中の汗 */}
        <path d={`M 1080 ${190 + Math.sin(f / 5) * 3} q 14 22 0 32 q -14 -10 0 -32 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        {/* こたつ (天板と布団) */}
        <path d="M 240 640 L 1680 640 Q 1760 820 1720 1000 L 200 1000 Q 160 820 240 640 Z" fill={C.kotatsuFuton} stroke={KRP.ink} strokeWidth={8} />
        <g fill={C.futonPattern} opacity={0.85}>
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${300 + (i % 7) * 200} ${720 + Math.floor(i / 7) * 140} l 20 -20 l 20 20 l -20 20 Z`} />
          ))}
        </g>
        <rect x={300} y={590} width={1320} height={56} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={300} y={590} width={1320} height={14} rx={6} fill={C.wood} />
        {/* 猫 (布団から顔を出す) */}
        <g transform="translate(1540 770)">
          <path d={`M 120 30 q 60 ${-20 + Math.sin(f / 7) * 20} 80 -60`} stroke={KRP.grayDark} strokeWidth={18} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={0} rx={70} ry={56} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -60 -26 L -50 -84 L -14 -50 Z M 60 -26 L 50 -84 L 14 -50 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -36 -4 q 12 -8 22 0 M 14 -4 q 12 -8 22 0" stroke={KRP.ink} strokeWidth={5} fill="none" />
          <path d="M -6 16 q 6 6 12 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
          <g stroke={KRP.ink} strokeWidth={3}>{[-1, 1].map((d) => <line key={d} x1={d * 30} y1={20} x2={d * 80} y2={14} />)}</g>
        </g>
        {/* みかんかごと、むいた皮 */}
        <g>
          <ellipse cx={460} cy={590} rx={130} ry={30} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          {[[400, 552], [470, 548], [540, 556], [440, 508], [510, 510]].map(([mx, my], i) => (
            <g key={i}>
              <circle cx={mx} cy={my} r={38} fill={C.mikan} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${mx - 6} ${my - 36} q 6 -10 14 -6`} stroke={C.parkDark} strokeWidth={5} fill="none" />
            </g>
          ))}
          {[[650, 600, 0], [1300, 604, 30]].map(([sx, sy, r], i) => (
            <g key={i} transform={`translate(${sx} ${sy}) rotate(${r as number})`}>
              {[0, 1, 2, 3, 4].map((p) => <ellipse key={p} cx={0} cy={-22} rx={13} ry={24} fill={C.mikan} stroke={KRP.ink} strokeWidth={3}
                transform={`rotate(${p * 72})`} />)}
              <circle r={10} fill={C.futonPattern} />
            </g>
          ))}
        </g>
        {/* 湯のみと湯気 */}
        <g>
          <path d="M 1400 520 L 1500 520 L 1490 600 L 1410 600 Z" fill={C.tea} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1].map((i) => <path key={i} d={`M ${1430 + i * 36} 500 q 12 -22 0 -40 q -12 -20 0 -40`} stroke={KRP.white} strokeWidth={6} fill="none"
            opacity={0.7} transform={`translate(0 ${-((f * 1.2 + i * 14) % 30)})`} />)}
        </g>
        {/* 携帯ゲーム機 (両手で持つ) */}
        <g transform={`translate(${gx} ${gy}) rotate(-3)`}>
          <HmGItem kind="game" f={f} w={gw} />
          {/* 親指 (A ボタンを押す) */}
          <ellipse cx={30 * gk + 4} cy={44 * gk + 6 + press * 6} rx={20} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-34 * gk} cy={35 * gk + 6} rx={20} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <HmGHand x={gx - 92} y={gy + 40} r={24} />
        <HmGHand x={gx + 92} y={gy + 36} r={24} />
        {press > 0 && <g stroke={HP.spark} strokeWidth={5} strokeLinecap="round">{[0, 1, 2].map((j) => {
          const a = (-60 + j * 40) * Math.PI / 180;
          return <line key={j} x1={gx + 40 + Math.cos(a) * 34} y1={gy + 40 + Math.sin(a) * 34} x2={gx + 40 + Math.cos(a) * 52} y2={gy + 40 + Math.sin(a) * 52} />;
        })}</g>}
      </g>
      <TagPlate x={1760} y={100} text="1989年" size={44} t={seg(f, 2, 10)} fill={KRP.cream} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #148 1999年2月22日、携帯電話でネットができる、iモード。
// 格: 山 / seed 5148
// 絵: どこ: 1999年の駅の改札前 (待ち合わせ)。年代札「1999年」。演出: 待ち合わせ中の若者が、折りたたみ携帯をぱかっと開いて、小さな画面 (文字のかわりにアイコン) を親指でぽちぽち。アンテナが伸びる。画面からぱっと光。札「iモード」。動き: ぱかっと開く / 親指 / アンテナが伸びる
// どこ: 1999年の駅の改札前の待ち合わせ。奥に自動改札の列 (橙のふた)・柱の時計・天井の案内板 (矢印だけ)・行き交う人。左上に年代札
// 演出: 改札の前で待つ若者が、折りたたみ携帯をぱかっと開き、アンテナをしゅっと伸ばして、小さなアイコンの画面を親指でぽちぽち。
//       画面からぱっと光が出て若者がにっこり。奥では遅れてきた友だちが走ってくるが、若者は画面に夢中で気づかない
// 動き: ぱかっと開く (f6〜14) / アンテナが伸びる (f14〜22) / 光 (f24〜) / 親指 / カメラが携帯へ寄る (f10〜36) / 奥の人が歩く
const Hm148: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 6, 14));
  const ant = easeOut(seg(f, 14, 22));
  const flash = seg(f, 24, 32);
  const zoom = 1 + 0.15 * easeInOut(seg(f, 10, 36));
  const px = 900, py = 900, s = 1.3;
  const hx = 1112, hy = 700; // ひんじ (伸ばした右手の先)
  const thumb = Math.floor(f / 6) % 3;
  const flipY = lerp(-1, 1, open);
  return (
    <Frame f={f} seed={5148} bg={C.tile99}>
      <g transform={`translate(1050 640) scale(${zoom}) translate(-1050 -640)`}>
        {/* 天井と案内板 */}
        <rect x={-40} y={-40} width={2000} height={200} fill={KRP.gray} />
        <g stroke={KRP.grayDark} strokeWidth={4}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={-40} x2={i * 180} y2={160} />)}</g>
        {[[400, KRP.yellow], [1300, KRP.blueDeep]].map(([sx, c], i) => (
          <g key={i}>
            <rect x={(sx as number) - 200} y={70} width={400} height={80} rx={8} fill={c as string} stroke={KRP.ink} strokeWidth={6} />
            <Arrow x={(sx as number) + (i ? 120 : -60)} y={110} s={0.5} rot={i ? 0 : 180} color={KRP.white} />
          </g>
        ))}
        {/* 奥の壁 */}
        <rect x={-40} y={160} width={2000} height={300} fill={KRP.cream} />
        {/* 柱と時計 */}
        <rect x={1560} y={160} width={120} height={560} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(1620 260)">
          <circle r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-38} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={28} y2={10} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={6} x2={0} y2={-46} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${(f * 6) % 360})`} />
        </g>
        {/* 床 */}
        <rect x={-40} y={460} width={2000} height={700} fill={C.tile99} />
        <g stroke={KRP.gray} strokeWidth={3}>{Array.from({ length: 8 }, (_, i) => <line key={i} x1={-40} y1={500 + i * 80} x2={1960} y2={500 + i * 80} />)}</g>
        {/* 自動改札の列 */}
        {Array.from({ length: 6 }, (_, i) => {
          const gx = 120 + i * 250;
          return (
            <g key={i}>
              <rect x={gx} y={430} width={70} height={190} rx={10} fill={C.gate} stroke={KRP.ink} strokeWidth={6} />
              <rect x={gx + 10} y={444} width={50} height={20} rx={4} fill={KRP.ink} />
              <rect x={gx + 16} y={448} width={16} height={12} fill={i % 2 ? KRP.green : KRP.blue} />
              <path d={`M ${gx + 70} 520 l 60 ${i === 2 ? -30 * Math.abs(Math.sin(f / 8)) : 0} l 0 30 l -60 0 Z`} fill={C.gateFlap} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 行き交う人 */}
        {[0, 1, 2].map((j) => {
          const mx = ((j * 520 + f * 6) % 1800) - 100;
          return <PersonMini key={j} x={mx} y={640} s={0.9} f={f} phase={j} color={[C.crowd2, C.crowd4, KRP.grayDark][j]} />;
        })}
        {/* 遅れてきた友だち (奥から走ってくる) */}
        <Person x={1650} y={700} s={0.72} f={f} pose="run" face="worried" cloth={KRP.red} clothDark={C.robeBrown} lean={-10} phase={5} />
        <path d="M 1720 520 q 14 22 0 30 q -14 -8 0 -30 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        {/* 若者 (待ち合わせ) */}
        <Person x={px} y={py} s={s} f={f} pose="point" pointDir={1} face={flash > 0.4 ? "joy" : "normal"} gaze={[10, 2]} cloth={C.jacket} clothDark={C.jacketDark} phase={1} still />
        {/* 折りたたみ携帯 */}
        <g>
          {/* 下半分 (ボタン) */}
          <rect x={hx - 44} y={hy} width={88} height={130} rx={14} fill={C.phoneSilver} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={hx - 32 + (i % 3) * 23} y={hy + 30 + Math.floor(i / 3) * 22} width={18} height={14} rx={4}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
          ))}
          <circle cx={hx} cy={hy + 16} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />
          {/* 上半分 (画面)。ひんじで回る */}
          <g transform={`translate(${hx} ${hy}) scale(1 ${flipY})`}>
            {/* アンテナ */}
            <rect x={28} y={-150 - 70 * ant} width={8} height={30 + 70 * ant} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={32} cy={-152 - 70 * ant} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
            <rect x={-44} y={-140} width={88} height={140} rx={14} fill={flipY < 0 ? C.jacketDark : C.phoneSilver} stroke={KRP.ink} strokeWidth={5} />
            {flipY > 0 && (
              <g>
                <rect x={-34} y={-128} width={68} height={100} rx={4} fill={C.phoneScreen} stroke={KRP.ink} strokeWidth={3} />
                {/* アイコン (文字なし) */}
                {[[-20, -110, KRP.red], [0, -110, KRP.blueDeep], [20, -110, KRP.green], [-20, -84, KRP.orange], [0, -84, KRP.yellow], [20, -84, HP.byo]].map(([ix, iy, c], i) => (
                  <rect key={i} x={(ix as number) - 7} y={iy as number} width={14} height={14} rx={3} fill={c as string}
                    stroke={i === thumb + 3 ? KRP.ink : "none"} strokeWidth={2} />
                ))}
                <rect x={-26} y={-56} width={52} height={6} rx={3} fill={KRP.grayDark} opacity={0.6} />
                <rect x={-26} y={-44} width={36} height={6} rx={3} fill={KRP.grayDark} opacity={0.6} />
              </g>
            )}
            {flipY < 0 && <rect x={-16} y={-110} width={32} height={20} rx={3} fill={KRP.ink} />}
          </g>
          {/* 画面の光 */}
          {flash > 0 && (
            <g opacity={1 - flash * 0.5}>
              <circle cx={hx} cy={hy - 78} r={60 + flash * 60} fill={HP.screen} opacity={0.35} />
              {Array.from({ length: 8 }, (_, j) => {
                const a = (j * 45) * Math.PI / 180;
                return <line key={j} x1={hx + Math.cos(a) * 70} y1={hy - 78 + Math.sin(a) * 80} x2={hx + Math.cos(a) * (100 + flash * 40)} y2={hy - 78 + Math.sin(a) * (110 + flash * 40)}
                  stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />;
              })}
            </g>
          )}
          {/* 手と親指 */}
          <ellipse cx={hx - 10 + thumb * 14} cy={hy + 62 + ((f % 6) < 2 ? 4 : 0)} rx={16} ry={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <HmGHand x={hx - 14} y={hy + 6} r={16} />
        </g>
      </g>
      <TagPlate x={1760} y={100} text="1999年" size={44} t={seg(f, 2, 10)} fill={KRP.cream} />
      <TagPlate x={1390} y={560} text="iモード" size={40} t={seg(f, 26, 34)} fill={KRP.cream} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #149 2008年7月11日、日本で、iPhone。
// 格: 山 / seed 5149
// 絵: どこ: 2008年の夏の店の前の行列 (ロゴは描かない・店は無地の白い看板)。年代札「2008年」、地名札「日本」。演出: 長い行列の先頭の人が、箱からスマホ (Sumaho, screen="on") を取り出して高く掲げる。行列の人たちが拍手。画面の光がまぶしい。動き: 掲げる / 拍手 / 光
// どこ: 2008年の夏の朝、店の前の歩道。無地の白い看板・ガラス張りの店先・照りつける太陽・ずらっと並ぶ行列。左上に年代札と地名札
// 演出: 行列の先頭の人が、白い箱からスマホを取り出して高々と掲げる (画面がまぶしく光る)。後ろの行列の人たちと店員が拍手。
//       いちばん後ろの人はタオルで汗をふきつつ背のびしてのぞく
// 動き: 箱から出して掲げる (f8〜20) / 画面の光とキラキラ (f18〜) / 拍手 (6コマごと) / かげろう / カメラが少し寄る
const Hm149: React.FC<{ f: number }> = ({ f }) => {
  const lift = easeOut(seg(f, 8, 20));
  const raised = f >= 8;
  const shine = seg(f, 18, 26);
  const clap = Math.floor(f / 6) % 2 === 0;
  const cam = 1 + 0.04 * easeOut(seg(f, 0, 42));
  const px = 820, py = 930, s = 1.2;
  // 掲げた手の位置 (画面の座標)
  const handX = px + 76 * s, handY = py + lerp(-150, -400, lift) * s;
  const queue: { x: number; s: number; cl: string; cd: string; ph: number; face: "joy" | "smile" | "surprised" }[] = [
    { x: 1180, s: 1.05, cl: C.crowd2, cd: KRP.blueDeep, ph: 1, face: "joy" },
    { x: 1420, s: 0.95, cl: C.crowd3, cd: C.robeGreenDark, ph: 2, face: "smile" },
    { x: 1640, s: 0.86, cl: C.crowd4, cd: C.robeBrown, ph: 3, face: "surprised" },
    { x: 1830, s: 0.78, cl: C.crowd1, cd: C.robeBrown, ph: 4, face: "joy" },
  ];
  return (
    <Frame f={f} seed={5149} bg={C.summerSky}>
      <g transform={`translate(900 600) scale(${cam}) translate(-900 -600)`}>
        {/* 空と太陽 */}
        <rect x={-40} y={-40} width={2000} height={400} fill={C.summerSky} />
        <circle cx={1080} cy={40} r={80} fill={C.sunny} stroke={KRP.yellow} strokeWidth={8} />
        {/* 店 (無地の白い看板・ガラスの店先) */}
        <rect x={120} y={120} width={1680} height={560} fill={C.storeWhite} stroke={KRP.ink} strokeWidth={8} />
        <rect x={160} y={150} width={1600} height={110} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={160} y={290} width={1600} height={390} fill={C.glassStore} stroke={KRP.ink} strokeWidth={6} />
        {[560, 960, 1360].map((lx) => <line key={lx} x1={lx} y1={290} x2={lx} y2={680} stroke={KRP.ink} strokeWidth={6} />)}
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M ${200 + k * 400} 300 L ${260 + k * 400} 300 L ${180 + k * 400} 460 L ${160 + k * 400} 460 Z`} fill={KRP.white} opacity={0.4} />
        ))}
        {/* 店の中の店員 (拍手) */}
        {[360, 1160].map((sx, i) => (
          <PersonMini key={sx} x={sx} y={640} s={1.1} f={f} phase={i + 5} color={KRP.blueDeep} face="smile" arms="up" />
        ))}
        {/* 店内の棚 */}
        {[760, 1560].map((sx) => (
          <g key={sx}>
            <rect x={sx - 120} y={520} width={240} height={160} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2, 3].map((c) => <rect key={c} x={sx - 100 + c * 52} y={540} width={36} height={60} rx={6} fill={KRP.ink} opacity={0.8} />)}
          </g>
        ))}
        {/* 歩道 */}
        <rect x={-40} y={680} width={2000} height={460} fill={C.asphalt} />
        <g stroke={C.asphaltDark} strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220 - 40} y1={680} x2={i * 260 - 200} y2={1120} />)}</g>
        {/* かげろう */}
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${300 + k * 600} ${780 + Math.sin(f / 5 + k) * 4} q 40 -10 80 0 t 80 0`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.4} />
        ))}
        {/* 行列 (後ろの人たち) */}
        {queue.slice().reverse().map((q) => (
          <g key={q.x}>
            <Person x={q.x} y={py - 10} s={q.s} f={f} pose="hold" face={shine > 0 ? q.face : "normal"} gaze={[-9, -4]} cloth={q.cl} clothDark={q.cd} phase={q.ph} />
            {shine > 0 && clap && (
              <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
                {[-50, -10, 30].map((a) => {
                  const r = (a - 90) * Math.PI / 180;
                  const cx = q.x, cy = py - 10 - 118 * q.s;
                  return <line key={a} x1={cx + Math.cos(r) * 30} y1={cy + Math.sin(r) * 30} x2={cx + Math.cos(r) * 52} y2={cy + Math.sin(r) * 52} />;
                })}
              </g>
            )}
          </g>
        ))}
        {/* いちばん後ろの人の首のタオル */}
        <path d={`M ${1830 - 50} ${py - 10 - 150 * 0.78} q 50 30 100 0 l 0 60`} stroke={KRP.white} strokeWidth={16} fill="none" />
        {/* 先頭の人 */}
        <Person x={px} y={py} s={s} f={f} pose={raised ? "raise" : "hold"} face={lift > 0.6 ? "joy" : "smile"} gaze={[4, -8]} cloth={HP.you} clothDark={HP.youDark} phase={1} still />
        {/* 掲げる腕の伸び */}
        {raised && (
          <g>
            <line x1={px + 67 * s} y1={py - 220 * s} x2={handX} y2={handY} stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" />
            <line x1={px + 67 * s} y1={py - 220 * s} x2={handX} y2={handY} stroke={HP.you} strokeWidth={22} strokeLinecap="round" />
          </g>
        )}
        {/* 左手の白い箱 (ふたが開いている) */}
        <g transform={`translate(${px - (raised ? 80 : 0) * s} ${py - (raised ? 70 : 120) * s})`}>
          <rect x={-60} y={-40} width={120} height={80} rx={6} fill={C.boxWhite} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -60 -40 L ${raised ? -90 : -60} ${raised ? -96 : -40} L ${raised ? 30 : 60} ${raised ? -96 : -40} L 60 -40`} fill={C.boxWhite} stroke={KRP.ink} strokeWidth={5} />
          <HmGHand x={raised ? -10 : 0} y={30} r={13} />
        </g>
        {/* 光 (画面がまぶしい) */}
        {shine > 0 && (
          <g>
            <circle cx={handX} cy={handY - 70} r={110 + shine * 50 + Math.sin(f / 3) * 6} fill={HP.screen} opacity={0.3} />
            {Array.from({ length: 12 }, (_, j) => {
              const a = (j * 30 + f * 1.5) * Math.PI / 180;
              const r1 = 110, r2 = 150 + shine * 50 + (j % 2) * 30;
              return <line key={j} x1={handX + Math.cos(a) * r1} y1={handY - 70 + Math.sin(a) * r1} x2={handX + Math.cos(a) * r2} y2={handY - 70 + Math.sin(a) * r2}
                stroke={HP.spark} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* スマホ */}
        {raised && <Sumaho x={handX + 2} y={handY - 70} s={0.5} f={f} screen="on" glow={shine} rot={Math.sin(f / 8) * 3} />}
        {raised && <HmGHand x={handX} y={handY} r={16} />}
        {/* キラキラ */}
        {shine > 0 && [0, 1, 2, 3].map((j) => {
          const t = ((f + j * 7) % 20) / 20;
          const sx = handX + [-170, 170, -130, 140][j], sy = handY - 70 + [-120, -90, 80, 110][j];
          return <path key={j} d={`M ${sx} ${sy - 22} L ${sx + 6} ${sy - 6} L ${sx + 22} ${sy} L ${sx + 6} ${sy + 6} L ${sx} ${sy + 22} L ${sx - 6} ${sy + 6} L ${sx - 22} ${sy} L ${sx - 6} ${sy - 6} Z`}
            fill={HP.spark} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${t * 90} ${sx} ${sy})`} opacity={1 - t * 0.6} />;
        })}
      </g>
      <TagPlate x={1760} y={100} text="2008年" size={44} t={seg(f, 2, 10)} fill={KRP.cream} />
      <TagPlate x={1690} y={186} text="日本" size={40} t={seg(f, 4, 12)} fill={KRP.cream} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_138: (f) => <Hm138 f={f} />,
  hm_139: (f) => <Hm139 f={f} />,
  hm_140: (f) => <Hm140 f={f} />,
  hm_141: (f) => <Hm141 f={f} />,
  hm_142: (f) => <Hm142 f={f} />,
  hm_143: (f) => <Hm143 f={f} />,
  hm_144: (f) => <Hm144 f={f} />,
  hm_145: (f) => <Hm145 f={f} />,
  hm_146: (f) => <Hm146 f={f} />,
  hm_147: (f) => <Hm147 f={f} />,
  hm_148: (f) => <Hm148 f={f} />,
  hm_149: (f) => <Hm149 f={f} />,
};

export const HM_G_MOTIFS: string[] = [
  "hm_138", // #138
  "hm_139", // #139
  "hm_140", // #140
  "hm_141", // #141
  "hm_142", // #142
  "hm_143", // #143
  "hm_144", // #144
  "hm_145", // #145
  "hm_146", // #146
  "hm_147", // #147
  "hm_148", // #148
  "hm_149", // #149
];

export const himaGScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
