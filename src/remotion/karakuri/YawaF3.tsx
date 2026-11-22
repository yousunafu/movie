// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#168〜#177 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-5.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L4c。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./YawaShared";
import { YP, Squishy, DameSofa, AgeDial, KaradaChizu } from "./YawaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/YP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 空と野原 (#172 #176 道しるべ。#167 と同じ景色)
  sky: "#BFDDEB", hill: "#A9C98A", meadow: "#B8D68E", meadowDark: "#7FA35A",
  path: "#E6D3A6", pathDark: "#C9AF7E", knit: "#C98B5A", knitDark: "#9E6A40",
  wallWarm: "#F0DDB8", warmGlow: "#FFE39A",
  // NASA (#168)
  skyUS: "#CFE3EE", hangar: "#C9CED3", hangarDark: "#9AA3AC", concrete: "#ECE8DD", concreteDark: "#C4BDAE",
  tarmac: "#A7A69E", tarmacLine: "#F2E7B5", lawn: "#9FC27E", lawnDark: "#7FA05F",
  shirt: "#F6F6F0", slacks: "#3B4150", tie: "#2F3A55", jacket: "#8A6A4A", jacketDark: "#6B5038",
  kraft: "#D8B47C", kraftDark: "#B48F57", flagRed: "#C8323C", flagBlue: "#2E4A8C",
  // 試験室 (#169)
  labWall: "#DCD8CC", labTile: "#C8C3B5", steel: "#8C96A0", steelDark: "#5E6872",
  dummy: "#E9B94C", dummyDark: "#B88A2E", seat: "#5D7FA8", seatDark: "#46658A",
  scope: "#2B3A33", scopeGlow: "#7CE0A0",
  // 低反発 (#170 #171)
  foam: "#F1DE9E", foamDeep: "#D8BF72", foamPit: "#BFA055", foamRim: "#FFF1C4",
  bench: "#7E6248", benchDark: "#5E4733", wallLab: "#E4E0D4",
  night: "#3D4A6B", nightDeep: "#2C3652", moon: "#FFF2C2", sheet: "#F3F0E8",
  duvet: "#9DB7CF", duvetDark: "#7895B1", bedWood: "#B98A5E", lampGlow: "#FFD98A", rug: "#B7798A",
  pajama: "#8FA8C8",
  // 文房具店・ペン (#173 #174)
  shopWall: "#F0E4C6", shelf: "#B78A5A", glass: "#CFE7EE", glassEdge: "#9CC4CF",
  velvet: "#8E2F45", velvetDark: "#6E2034", spot: "#FFF4C8", popYellow: "#F7D84A",
  penBlue: "#4F7FC0", penBlueDark: "#355E99", grip: "#DDE6EA", gripRib: "#B7C4CB",
  penGreen: "#5E8F6A", penGreenDark: "#41684B", metal: "#C9CDD2", metalDark: "#8D939A", lead: "#3A3A40",
  apron: "#5C7F9E", sweater: "#C77F6A",
  mat: "#6A5878", matLine: "#8A789A", desk: "#B48A5E", deskDark: "#8E6A44", paper: "#FBF8EF", paperLine: "#B9CBE0",
  // 銀行の事務室 (#175)
  office: "#E5E0CE", officeDark: "#C9C2A8", steelDesk: "#9DAE9F", steelDeskDark: "#7C8E7F",
  armCover: "#3C3C42", slip: "#F7F1DC", slipPink: "#F3C9C9", slipBlue: "#CFE0F2", abacus: "#8B5A33",
  dusk: "#F3B572", blind: "#EFE9D6",
  // イタリアの事務所 (#177)
  studioWall: "#EFE3CC", terrazzo: "#D9C7A8", terrazzoDot: "#A88C66",
  sacco: "#E8833A", saccoDark: "#C0642A", saccoShine: "#FFC08A", milanSky: "#F2D6A8", duomo: "#E9E1D0",
  flagGreen: "#3A8A4C", mustard: "#D8A93A", mustardDark: "#A9822A", teal: "#5FA8A0", tealDark: "#3F807A",
  purple: "#7A5E9A", purpleDark: "#5A4278", board: "#F7F3E6",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void YP; void Squishy; void DameSofa; void AgeDial; void KaradaChizu;
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

// カメラ: (cx,cy) を中心に z 倍し、dx,dy ずらす
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;

// 太い線の手足 (墨のふち付き)
const L4cLimb: React.FC<{ pts: number[][]; w: number; fill: string }> = ({ pts, w, fill }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={C.ink} strokeWidth={w + 9} />
      <path d={d} stroke={fill} strokeWidth={w} />
    </g>
  );
};

// 白シャツの襟と細いネクタイ (Person に still を付けて重ねる)
const L4cTie: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = C.tie }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -24 -160 L 0 -138 L 24 -160 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -7 -146 L 7 -146 L 5 -136 L 9 -92 L 0 -80 L -9 -92 L -5 -136 Z" fill={color} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
  </g>
);

// 雲 (ふちだけ墨、中の重なり線は消す)
const L4cCloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const b = [[-60, 0, 34], [-16, -20, 44], [36, -12, 40], [74, 6, 28], [-22, 12, 32], [26, 14, 32]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {b.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill={KRP.white} stroke={C.ink} strokeWidth={5} />)}
      {b.map(([cx, cy, r], i) => <circle key={`i${i}`} cx={cx} cy={cy} r={r - 3} fill={KRP.white} />)}
    </g>
  );
};

// はためく旗 (縦に細切れにして波打たせる)。kind: us=星条旗 / it=イタリア
const L4cFlag: React.FC<{ x: number; y: number; w: number; h: number; f: number; kind: "us" | "it" }> = ({ x, y, w, h, f, kind }) => {
  const N = 12;
  const dy = (k: number) => Math.sin(f / 5 - k * 0.7) * 7 * (k / N);
  const sw = w / N;
  const top = Array.from({ length: N + 1 }, (_, k) => `${k * sw},${dy(k)}`);
  const bot = Array.from({ length: N + 1 }, (_, k) => `${(N - k) * sw},${h + dy(N - k)}`);
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: N }, (_, k) => {
        const sx = k * sw, o = dy(k + 0.5);
        if (kind === "it") {
          const col = k < N / 3 ? C.flagGreen : k < (2 * N) / 3 ? KRP.white : C.flagRed;
          return <rect key={k} x={sx} y={o} width={sw + 1} height={h} fill={col} />;
        }
        return (
          <g key={k}>
            {Array.from({ length: 7 }, (_, j) => (
              <rect key={j} x={sx} y={o + (j * h) / 7} width={sw + 1} height={h / 7 + 0.5} fill={j % 2 ? KRP.white : C.flagRed} />
            ))}
            {sx < w * 0.42 && <rect x={sx} y={o} width={sw + 1} height={(h * 4) / 7} fill={C.flagBlue} />}
            {sx < w * 0.42 && [0.15, 0.4].map((q, j) => (
              <circle key={j} cx={sx + sw / 2} cy={o + h * q} r={3} fill={KRP.white} />
            ))}
          </g>
        );
      })}
      <polygon points={[...top, ...bot].join(" ")} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#168 【山】 1966年、アメリカ。NASAのエイムズ研究センターが、ある素材の研究を依頼しました。
// 設計: 1960年代のNASAの研究センター (格納庫・白い建物・ロケットではなく飛行機の模型・風洞)。白シャツに細ネクタイの研究者が書類を手渡す。隅に `AgeDial` (s≈0.5、label「1966年」)。アメリカの国旗。札「NASA エイムズ研究センター」(NASAのロゴは描かない)
// どこ: 1966年カリフォルニア、エイムズ研究センターの構内。左奥に巨大なアーチの格納庫、右奥に白い風洞の建物 (格子の吸気口)。手前は芝とエプロン。
// 演出: 白シャツ・細ネクタイ・眼鏡の研究者が、茶の上着の技術者に「研究依頼」の書類ばさみを手渡す。書類に赤い判がぽんと押される。左に星条旗、風洞模型の飛行機を載せた台。右上に年代ダイヤル「1966年」。
// 動き: 旗がはためく・空をジェット機が横切る・f8〜16 技術者が手を伸ばして受け取り笑う・f22〜28 赤い判・カメラは手渡しの手元へ寄る。
const Yw168: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.08, easeInOut(seg(f, 0, 42)));
  const reach = f >= 12;
  const stamp = seg(f, 22, 28);
  const flap = Math.sin(f / 3) * 4;
  const jetX = 1500 - f * 16;
  return (
    <Frame f={f} seed={3168} bg={C.skyUS}>
      <g transform={cam(960, 640, z)}>
        <rect x={-100} y={-100} width={W + 200} height={760} fill={C.skyUS} />
        <L4cCloud x={620 + f * 0.6} y={120} s={1.1} />
        <L4cCloud x={1250 + f * 0.4} y={190} s={0.8} />
        {/* ジェット機 (空を横切る) */}
        <g transform={`translate(${jetX} 92)`}>
          <path d="M -70 0 L 50 -7 L 78 0 L 50 7 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -4 -4 L -34 -34 L -18 -34 L 20 -4 Z M -4 4 L -30 26 L -16 26 L 20 4 Z M -62 -2 L -76 -22 L -66 -22 L -50 -3 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 80 0 L 220 2" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        </g>
        {/* 遠くの山並み (サンタクルーズの山) */}
        <path d="M -100 600 Q 200 470 460 540 Q 760 450 1080 530 Q 1400 440 1700 520 Q 1880 480 2020 530 L 2020 660 L -100 660 Z"
          fill="#AFC3B2" stroke={C.ink} strokeWidth={4} />
        {/* 巨大なアーチの格納庫 */}
        <defs>
          <clipPath id="l4c168arch"><path d="M 60 650 Q 64 250 400 214 Q 736 250 740 650 Z" /></clipPath>
        </defs>
        <path d="M 60 650 Q 64 250 400 214 Q 736 250 740 650 Z" fill={C.hangar} stroke={C.ink} strokeWidth={7} />
        <g clipPath="url(#l4c168arch)">
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={60 + i * 78} y={200} width={78} height={460} fill={i % 2 ? C.hangar : "#D3D8DC"} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`l${i}`} x1={60 + i * 78} y1={200} x2={60 + i * 78} y2={660} stroke={C.hangarDark} strokeWidth={4} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1={40} y1={300 + i * 60} x2={760} y2={300 + i * 60} stroke={C.hangarDark} strokeWidth={2.5} opacity={0.6} />
          ))}
          <rect x={300} y={420} width={200} height={240} fill={C.hangarDark} stroke={C.ink} strokeWidth={5} />
        </g>
        <path d="M 60 650 Q 64 250 400 214 Q 736 250 740 650 Z" fill="none" stroke={C.ink} strokeWidth={7} />
        {/* 白い風洞の建物と格子の吸気口 */}
        <rect x={1060} y={300} width={860} height={350} fill={C.concrete} stroke={C.ink} strokeWidth={7} />
        <rect x={1060} y={300} width={860} height={26} fill={C.concreteDark} />
        <polygon points="1120,350 1520,350 1480,380 1160,380" fill={C.concreteDark} stroke={C.ink} strokeWidth={4} />
        <rect x={1160} y={380} width={320} height={160} fill={C.steelDark} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={1160 + i * 40} y1={380} x2={1160 + i * 40} y2={540} stroke={C.steel} strokeWidth={4} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`r${i}`} x1={1160} y1={412 + i * 32} x2={1480} y2={412 + i * 32} stroke={C.steel} strokeWidth={4} />
        ))}
        {/* 吸い込まれる風の線 */}
        {[0, 1, 2].map((k) => {
          const tt = ((f + k * 11) % 33) / 33;
          return <path key={k} d={`M ${1000 - tt * 0} ${420 + k * 40} q 60 -14 ${120 + tt * 40} 0`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.9 * (1 - tt)} transform={`translate(${tt * 120} 0)`} />;
        })}
        {[1560, 1680, 1800].map((wx) => (
          <rect key={wx} x={wx} y={380} width={80} height={70} fill={C.glass} stroke={C.ink} strokeWidth={4} />
        ))}
        <TagPlate x={1560} y={600} text="NASA エイムズ研究センター" size={34} t={seg(f, 2, 10)} />
        {/* 芝とエプロン */}
        <rect x={-100} y={650} width={W + 200} height={60} fill={C.lawn} />
        <path d="M -100 650 L 2020 650" stroke={C.ink} strokeWidth={5} />
        <rect x={-100} y={706} width={W + 200} height={500} fill={C.tarmac} />
        <path d="M -100 706 L 2020 706" stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i * 280 - 60} y={950} width={160} height={14} fill={C.tarmacLine} opacity={0.8} />
        ))}
        {/* 星条旗 */}
        <rect x={222} y={170} width={14} height={600} fill={C.metal} stroke={C.ink} strokeWidth={4} />
        <circle cx={229} cy={166} r={11} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
        <L4cFlag x={236} y={186} w={230} h={136} f={f} kind="us" />
        <ellipse cx={229} cy={772} rx={36} ry={10} fill={C.ink} opacity={0.2} />
        {/* 風洞模型の飛行機を載せた台車 */}
        <rect x={380} y={730} width={230} height={22} rx={4} fill={C.steel} stroke={C.ink} strokeWidth={5} />
        <rect x={396} y={752} width={14} height={90} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
        <rect x={580} y={752} width={14} height={90} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
        <circle cx={403} cy={850} r={12} fill={C.ink} /><circle cx={587} cy={850} r={12} fill={C.ink} />
        <rect x={488} y={640} width={12} height={90} fill={C.metalDark} stroke={C.ink} strokeWidth={3} />
        <g transform={`translate(494 632) rotate(${-6 + Math.sin(f / 7) * 1.5})`}>
          <path d="M -110 0 Q -100 -16 -60 -16 L 80 -12 Q 112 -6 118 0 Q 112 6 80 12 L -60 16 Q -100 16 -110 0 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          <path d="M -10 -12 L -50 -58 L -26 -58 L 34 -12 Z" fill={C.metal} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -94 -10 L -114 -44 L -98 -44 L -76 -12 Z" fill={C.metal} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={90} cy={-4} r={6} fill={C.glass} stroke={C.ink} strokeWidth={2.5} />
        </g>
        {/* 研究者 (白シャツ・細ネクタイ・眼鏡) が書類を手渡す */}
        <ellipse cx={720} cy={884} rx={90} ry={14} fill={C.ink} opacity={0.18} />
        <ellipse cx={1200} cy={884} rx={90} ry={14} fill={C.ink} opacity={0.18} />
        <Person x={720} y={880} s={1.4} f={f} still face="smile" gaze={[5, 2]} glasses
          pose="point" pointDir={1} cloth={C.shirt} clothDark={C.slacks} hair="cap" phase={2} />
        <L4cTie x={720} y={880} s={1.4} />
        {/* 技術者 (茶の上着) が受け取る */}
        <Person x={1200} y={880} s={1.4} f={f} still face={reach ? "joy" : "surprised"} gaze={[-5, 2]}
          pose={reach ? "point" : "stand"} pointDir={-1} cloth={C.jacket} clothDark={C.jacketDark} hair="cap" phase={6} />
        {/* 書類ばさみ */}
        <g transform={`translate(960 690) rotate(${reach ? -2 : 4})`}>
          <rect x={-96} y={-64} width={192} height={128} rx={6} fill={C.kraftDark} stroke={C.ink} strokeWidth={5} />
          <path d={`M -82 -60 L 74 -60 L ${78 + flap} -86 L -78 -84 Z`} fill={KRP.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={-90} y={-52} width={180} height={116} rx={6} fill={C.kraft} stroke={C.ink} strokeWidth={5} />
          <text x={-6} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>研究依頼</text>
          <line x1={-70} y1={14} x2={30} y2={14} stroke={C.kraftDark} strokeWidth={5} />
          <line x1={-70} y1={36} x2={10} y2={36} stroke={C.kraftDark} strokeWidth={5} />
          {stamp > 0 && (
            <g transform={`translate(54 30) scale(${pop(stamp)}) rotate(-12)`}>
              <circle r={26} fill="none" stroke={KRP.red} strokeWidth={5} />
              <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={KRP.red}>依頼</text>
            </g>
          )}
        </g>
        {stamp > 0 && stamp < 1 && (
          <g stroke={KRP.red} strokeWidth={5} strokeLinecap="round" opacity={1 - stamp}>
            {[0, 60, 120, 180, 240, 300].map((a) => {
              const r = (a * Math.PI) / 180;
              return <line key={a} x1={1014 + Math.cos(r) * 40} y1={720 + Math.sin(r) * 40} x2={1014 + Math.cos(r) * 64} y2={720 + Math.sin(r) * 64} />;
            })}
          </g>
        )}
      </g>
      <AgeDial x={1720} y={200} s={0.42} spin={easeOut(seg(f, 0, 20)) * 240} label="1966年" handle={f * 8} />
    </Frame>
  );
};

// ---- 文#169 【山】 目的は、飛行機の座席の、衝撃をやわらげることです。
// 設計: 飛行機の座席の試験装置。座席にダミー人形が座り、上からおもりが落ちる (f で)。衝撃の線。座席のクッションがへこんで衝撃を吸う。札「衝撃をやわらげる」
// どこ: 1960年代の衝撃試験室。タイル壁・鉄骨の落下塔・黄黒の危険テープ。真横から見た飛行機の座席 (白い頭カバー付き) に関節つきのダミー人形。
// 演出: 塔のてっぺんのフックが開き、鉄のおもりがダミーのひざへ落ちる。座面のクッションがぐっと沈んで、衝撃の波がクッションの中で散っていく。右の計測器の画面には「とがった山 (点線・クッションなし)」と「なだらかな山 (クッションあり)」。研究者は驚き→にっこり。
// 動き: f6 フックが開く・f6〜18 おもりが加速して落ちる・f18 衝突 (画面がゆれる・衝撃線)・f18〜34 クッションが沈んで落ち着く・計測の線が描かれる・カメラは座席へ寄る。
const Yw169: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const tF = seg(f, 6, 18);
  const hit = f >= 18;
  const comp = !hit ? 0 : f < 22 ? easeOut(seg(f, 18, 22)) : lerp(1, 0.72, easeOut(seg(f, 22, 34)));
  const dd = comp * 30;
  const wBottom = hit ? 575 + dd : lerp(280, 575, tF * tF);
  const shake = hit ? Math.sin(f * 3.1) * 10 * (1 - seg(f, 18, 28)) : 0;
  const open = f >= 6;
  const cushTop = 640 + comp * 36;
  const burst = hit ? 1 - 0.55 * seg(f, 22, 40) : 0;
  const trace = seg(f, 18, 38);
  const face = !hit ? "normal" : f < 30 ? "surprised" : "smile";
  return (
    <Frame f={f} seed={3169} bg={C.labWall}>
      <g transform={cam(900, 560, z, shake, 0)}>
        {/* タイル壁と床 */}
        <rect x={-100} y={-100} width={W + 200} height={940} fill={C.labWall} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1={-100} y1={i * 70} x2={W + 100} y2={i * 70} stroke={C.labTile} strokeWidth={3} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={`v${i}`} x1={i * 92} y1={-100} x2={i * 92} y2={840} stroke={C.labTile} strokeWidth={3} />
        ))}
        <rect x={-100} y={830} width={W + 200} height={400} fill={C.concreteDark} />
        <path d="M -100 830 L 2020 830" stroke={C.ink} strokeWidth={5} />
        <g>
          <rect x={540} y={846} width={840} height={26} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 21 }, (_, i) => (
            <polygon key={i} points={`${550 + i * 40},846 ${570 + i * 40},846 ${556 + i * 40},872 ${536 + i * 40},872`} fill={C.ink} />
          ))}
        </g>
        {/* 落下塔 (2本の鉄骨と梁) */}
        {[600, 1300].map((cx) => (
          <g key={cx}>
            <rect x={cx - 22} y={40} width={44} height={800} fill={C.steel} stroke={C.ink} strokeWidth={6} />
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={cx} cy={90 + i * 86} r={6} fill={C.steelDark} />
            ))}
          </g>
        ))}
        <rect x={560} y={40} width={780} height={56} fill={C.steel} stroke={C.ink} strokeWidth={6} />
        <circle cx={950} cy={110} r={26} fill={C.metal} stroke={C.ink} strokeWidth={5} />
        {/* 吊りワイヤーとフック (f6 で開く) */}
        <line x1={950} y1={110} x2={950} y2={150} stroke={C.ink} strokeWidth={5} />
        <path d={open ? "M 950 150 q -30 10 -34 34" : "M 950 150 q -24 14 -6 30"} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <path d={open ? "M 950 150 q 30 10 34 34" : "M 950 150 q 24 14 6 30"} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        {/* 高速度カメラ (三脚) */}
        <g transform="translate(250 560)">
          <path d="M 0 40 L -60 270 M 0 40 L 60 270 M 0 40 L 0 270" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <rect x={-70} y={-40} width={140} height={84} rx={8} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
          <rect x={70} y={-24} width={60} height={52} rx={6} fill={C.ink} />
          <circle cx={134} cy={2} r={20} fill={C.glass} stroke={C.ink} strokeWidth={4} />
          <circle cx={-46} cy={-20} r={9} fill={f % 10 < 5 ? KRP.red : "#7A2A2A"} stroke={C.ink} strokeWidth={3} />
          <circle cx={-30} cy={-74} r={30} fill={C.metal} stroke={C.ink} strokeWidth={4} />
          <circle cx={-30} cy={-74} r={8} fill={C.ink} />
        </g>
        {/* 座席 (真横)。奥のひじ掛け・背もたれ・白い頭カバー */}
        <rect x={760} y={548} width={230} height={22} rx={10} fill={C.seatDark} stroke={C.ink} strokeWidth={4} />
        <path d="M 690 660 L 660 300 Q 664 268 700 266 L 760 270 Q 784 274 784 300 L 790 660 Z" fill={C.seat} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 662 330 L 664 276 Q 666 266 700 266 L 760 270 Q 782 274 782 300 L 784 340 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <path d={`M 700 ${cushTop + 8} C 800 ${cushTop} 840 ${cushTop + comp * 8} 930 ${cushTop + comp * 8} C 1020 ${cushTop + comp * 8} 1060 ${640} 1090 645 L 1090 712 L 700 712 Z`}
          fill={C.seat} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* クッションの中で散っていく衝撃の波 */}
        {hit && [0, 1, 2].map((k) => {
          const tt = clamp01(seg(f, 18 + k * 4, 34 + k * 4));
          return (
            <path key={k} d={`M ${930 - 40 - tt * 120} ${672} Q 930 ${660 + tt * 30} ${930 + 40 + tt * 120} ${672}`}
              fill="none" stroke={C.seatDark} strokeWidth={5} strokeDasharray="10 8" opacity={(1 - tt) * 0.9 + 0.1} />
          );
        })}
        <rect x={700} y={712} width={400} height={26} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 730 738 L 720 830 M 1060 738 L 1080 830" stroke={C.steel} strokeWidth={18} strokeLinecap="round" />
        <path d="M 730 738 L 720 830 M 1060 738 L 1080 830" stroke={C.ink} strokeWidth={4} fill="none" opacity={0.5} />
        <rect x={680} y={820} width={440} height={16} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
        {/* ダミー人形 (関節つき) */}
        <g transform={`translate(0 ${dd})`}>
          <L4cLimb pts={[[790, 605], [1040, 605]]} w={58} fill={C.dummy} />
          <L4cLimb pts={[[1040, 605], [1062, 790]]} w={46} fill={C.dummy} />
          <path d={`M 1040 ${806 - dd} L 1120 ${806 - dd} Q 1132 ${790 - dd} 1112 ${780 - dd} L 1058 ${776 - dd} Z`} fill={C.dummyDark} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <g transform="rotate(-6 790 605)">
            <rect x={738} y={430} width={104} height={190} rx={30} fill={C.dummy} stroke={C.ink} strokeWidth={6} />
            <rect x={760} y={470} width={60} height={70} rx={10} fill={C.dummyDark} opacity={0.5} />
            <rect x={772} y={402} width={34} height={34} fill={C.dummyDark} stroke={C.ink} strokeWidth={4} />
            <circle cx={790} cy={360} r={56} fill={C.dummy} stroke={C.ink} strokeWidth={6} />
            <path d="M 840 340 Q 852 372 836 396" fill="none" stroke={C.ink} strokeWidth={4} />
            <g transform="translate(782 360)">
              <circle r={20} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              <path d="M 0 -20 A 20 20 0 0 1 20 0 L 0 0 Z M 0 20 A 20 20 0 0 1 -20 0 L 0 0 Z" fill={C.ink} />
            </g>
            <L4cLimb pts={[[790, 456], [808, 560], [868, 590]]} w={36} fill={C.dummy} />
            {[[790, 456], [808, 560]].map(([jx, jy], i) => <circle key={i} cx={jx} cy={jy} r={13} fill={C.dummyDark} stroke={C.ink} strokeWidth={4} />)}
          </g>
          <circle cx={1040} cy={605} r={16} fill={C.dummyDark} stroke={C.ink} strokeWidth={4} />
          <circle cx={790} cy={605} r={16} fill={C.dummyDark} stroke={C.ink} strokeWidth={4} />
          {/* ひざの上の受け板と安全ベルト */}
          <rect x={860} y={562} width={180} height={14} rx={4} fill={C.metal} stroke={C.ink} strokeWidth={4} />
          <path d="M 800 590 L 860 600" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* おもり */}
        <g transform={`translate(950 ${wBottom})`}>
          <line x1={0} y1={-130} x2={0} y2={-170} stroke={C.ink} strokeWidth={6} />
          <circle cx={0} cy={-176} r={9} fill="none" stroke={C.ink} strokeWidth={5} />
          <rect x={-80} y={-130} width={160} height={130} rx={8} fill={C.steelDark} stroke={C.ink} strokeWidth={6} />
          <rect x={-80} y={-130} width={160} height={22} rx={6} fill={C.steel} />
          {[-58, 58].map((bx) => <circle key={bx} cx={bx} cy={-96} r={7} fill={C.metal} stroke={C.ink} strokeWidth={3} />)}
          <rect x={-52} y={-72} width={104} height={44} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink}>おもり</text>
        </g>
        {!hit && tF > 0.2 && (
          <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            {[-50, 0, 50].map((sx) => <line key={sx} x1={950 + sx} y1={wBottom - 150} x2={950 + sx} y2={wBottom - 220} />)}
          </g>
        )}
        {/* 衝撃線 */}
        {hit && (
          <g stroke={KRP.red} strokeWidth={8} strokeLinecap="round" opacity={burst}>
            {[-170, -150, -30, -10, 150, 190, 205, 335].map((a, i) => {
              const r = (a * Math.PI) / 180;
              const r1 = 130, r2 = 170 + (i % 2) * 30;
              return <line key={a} x1={950 + Math.cos(r) * r1} y1={600 + Math.sin(r) * r1 * 0.6} x2={950 + Math.cos(r) * r2} y2={600 + Math.sin(r) * r2 * 0.6} />;
            })}
          </g>
        )}
        {/* 計測器の台車と画面 */}
        <rect x={1360} y={560} width={260} height={190} rx={12} fill={C.steel} stroke={C.ink} strokeWidth={6} />
        <rect x={1380} y={578} width={220} height={140} rx={8} fill={C.scope} stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={1380} y1={606 + i * 28} x2={1600} y2={606 + i * 28} stroke={C.scopeGlow} strokeWidth={1.5} opacity={0.3} />)}
        <path d="M 1390 704 L 1440 704 L 1452 594 L 1464 704 L 1590 704" fill="none" stroke={KRP.red} strokeWidth={4} strokeDasharray="8 6" opacity={0.85} />
        <defs><clipPath id="l4c169tr"><rect x={1380} y={578} width={220 * trace + 0.1} height={140} /></clipPath></defs>
        <path d="M 1390 704 L 1430 704 Q 1470 650 1520 664 Q 1556 690 1590 702" fill="none" stroke={C.scopeGlow} strokeWidth={6} clipPath="url(#l4c169tr)" />
        {[1400, 1440, 1480].map((kx) => <circle key={kx} cx={kx} cy={734} r={7} fill={C.metal} stroke={C.ink} strokeWidth={3} />)}
        <rect x={1380} y={750} width={20} height={80} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
        <rect x={1580} y={750} width={20} height={80} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
        {/* 研究者 (白シャツ・ネクタイ・眼鏡・クリップボード) */}
        <ellipse cx={1690} cy={884} rx={80} ry={12} fill={C.ink} opacity={0.18} />
        <Person x={1690} y={880} s={1.15} f={f} still face={face} gaze={[-6, 2]} glasses pose="hold"
          cloth={C.shirt} clothDark={C.slacks} hair="cap" phase={3} />
        <L4cTie x={1690} y={880} s={1.15} />
        <g transform="translate(1690 748) rotate(-8)">
          <rect x={-44} y={-34} width={88} height={104} rx={6} fill={C.kraft} stroke={C.ink} strokeWidth={4.5} />
          <rect x={-34} y={-22} width={68} height={84} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <rect x={-16} y={-42} width={32} height={16} rx={4} fill={C.metalDark} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2].map((k) => <line key={k} x1={-24} y1={-4 + k * 20} x2={24} y2={-4 + k * 20} stroke={C.paperLine} strokeWidth={4} />)}
        </g>
        <TagPlate x={1500} y={190} text="衝撃をやわらげる" size={46} t={seg(f, 20, 30)} />
      </g>
    </Frame>
  );
};

// ---- 文#170 【山】 生まれたのは、押すとゆっくり沈み、ゆっくり戻る、ふしぎな泡でした。
// 設計: 低反発の泡のブロックに手を押し当てる超アップ。手を離すと手形がくっきり残り、f でゆっくり戻っていく (序の #5 のスクイーズの戻り方と呼応させる)。泡の気泡の断面も
// どこ: 研究所の作業台の上。画面いっぱいに黄色い泡のブロック (手前の切り口に気泡の断面)。壁にストップウォッチ、ブロックの前に物差し。
// 演出: 白衣の袖の手がブロックを押し、ゆっくり沈む。手を離すと手形がくっきり残り、気泡の断面のへこみも残ったまま、ゆっくりゆっくり戻っていく (序#5のスクイーズの戻りと同じ「戻る矢印」)。
// 動き: f0〜12 手が沈む・f12〜22 手が右上へ離れる・f20〜42 手形がゆっくり浅くなる (f45でまだはっきり)・ストップウォッチの針が回る・カメラは手形へ寄る。
const L4cHandShape: React.FC<{ mode: "hand" | "print" }> = ({ mode }) => {
  const fingers = [
    { x: -94, y: -250, w: 46, h: 210 },
    { x: -42, y: -286, w: 48, h: 246 },
    { x: 12, y: -262, w: 46, h: 222 },
    { x: 62, y: -206, w: 40, h: 170 },
  ];
  const parts = (fill: string, stroke: string, sw: number) => (
    <g fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      {fingers.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.w / 2} />)}
      <rect x={-210} y={-10} width={150} height={52} rx={26} transform="rotate(-34 -90 16)" />
      <rect x={-104} y={-90} width={208} height={240} rx={74} />
    </g>
  );
  if (mode === "print") {
    return (
      <g>
        {parts(C.foamRim, C.foamRim, 34)}
        {parts(C.foamDeep, C.foamDeep, 14)}
        {parts(C.foamPit, "none", 0)}
      </g>
    );
  }
  return (
    <g>
      <rect x={-98} y={120} width={196} height={1500} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
      <rect x={-104} y={140} width={208} height={56} rx={8} fill={C.labTile} stroke={C.ink} strokeWidth={6} />
      {parts(KRP.white, C.ink, 7)}
      {fingers.map((p, i) => (
        <rect key={`n${i}`} x={p.x + 9} y={p.y + 10} width={p.w - 18} height={34} rx={10} fill="#F3E6E0" stroke={C.ink} strokeWidth={3} />
      ))}
      <path d="M -60 40 Q -10 60 50 30" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
    </g>
  );
};
const Yw170: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const push = easeInOut(seg(f, 0, 12));
  const lift = easeInOut(seg(f, 12, 22));
  const recover = seg(f, 20, 42);
  const d = f < 12 ? push : lerp(1, 0.62, recover);
  const hx = lerp(900, 1360, lift), hy = lerp(548 + push * 10, 250, lift);
  const hsy = lerp(0.5, 0.78, lift), hr = lerp(-55, -38, lift), hs = lerp(1, 1.08, lift);
  const dipX = 990;
  const cells = Array.from({ length: 70 }, (_, i) => {
    const cx = 230 + rnd(1701, i) * 1460;
    const cy0 = 636 + rnd(1702, i) * 380;
    const r = 9 + rnd(1703, i) * 15;
    const k = d * Math.max(0, 1 - Math.abs(cx - dipX) / 220) * Math.max(0, 1 - (cy0 - 600) / 260);
    return { cx, cy: cy0 + k * 26, rx: r * (1 + k * 0.35), ry: r * (1 - k * 0.5) };
  });
  const dip = d * 42;
  return (
    <Frame f={f} seed={3170} bg={C.wallLab}>
      <g transform={cam(940, 560, z)}>
        {/* 壁と作業台 */}
        <rect x={-100} y={-100} width={W + 200} height={520} fill={C.wallLab} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-100} y1={60 + i * 70} x2={W + 100} y2={60 + i * 70} stroke={C.labTile} strokeWidth={2.5} />)}
        <rect x={-100} y={380} width={W + 200} height={800} fill={C.bench} />
        <path d="M -100 380 L 2020 380" stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M -100 ${410 + i * 28} q 600 ${rnd(1704, i) * 14 - 7} 1100 0 t 1000 0`} fill="none" stroke={C.benchDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* ストップウォッチ (壁) */}
        <g transform="translate(250 290)">
          <rect x={-14} y={-118} width={28} height={30} rx={6} fill={C.metal} stroke={C.ink} strokeWidth={4} />
          <circle r={92} fill={C.metal} stroke={C.ink} strokeWidth={6} />
          <circle r={76} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-66} x2={0} y2={-54} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={10} x2={0} y2={-60} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 8})`} />
          <circle r={8} fill={C.ink} />
        </g>
        {/* 泡のブロックの上面 (奥ほど狭い) */}
        <polygon points="300,430 1620,430 1720,600 200,600" fill={C.foam} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={300 + rnd(1705, i) * 1320} cy={445 + rnd(1706, i) * 145} r={3 + rnd(1707, i) * 3} fill={C.foamDeep} opacity={0.6} />
        ))}
        {/* 手形 (押している間は手の下、離すと残る) */}
        <g transform={`translate(900 548) scale(1 0.5) rotate(-55)`} opacity={clamp01(d * 1.1)}>
          <L4cHandShape mode="print" />
        </g>
        {/* ゆっくり戻る矢印 */}
        {f >= 20 && [0, 1, 2].map((k) => {
          const tt = ((f + k * 9) % 27) / 27;
          return (
            <path key={k} d={`M ${-14} ${8} L 0 ${-8} L 14 8`} transform={`translate(${850 + k * 60} ${560 - k * 22 - tt * 24})`}
              fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7 * (1 - tt)} />
          );
        })}
        {/* 手前の切り口 (気泡の断面)。手形の下は沈んでいる */}
        <path d={`M 200 600 L ${dipX - 170} 600 C ${dipX - 90} 600 ${dipX - 80} ${600 + dip} ${dipX} ${600 + dip} C ${dipX + 80} ${600 + dip} ${dipX + 90} 600 ${dipX + 170} 600 L 1720 600 L 1720 1040 L 200 1040 Z`}
          fill={C.foam} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {cells.map((c, i) => (
          <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill={C.foamDeep} stroke={C.foamPit} strokeWidth={3} opacity={c.cy - c.ry < 600 + (Math.abs(c.cx - dipX) < 170 ? dip : 0) + 4 ? 0 : 0.85} />
        ))}
        <path d="M 1720 600 L 1620 430" stroke={C.ink} strokeWidth={7} />
        {/* 物差し (沈んだ深さ) */}
        <rect x={1160} y={560} width={44} height={300} fill={C.metal} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={1160} y1={580 + i * 20} x2={1160 + (i % 5 === 0 ? 24 : 14)} y2={580 + i * 20} stroke={C.ink} strokeWidth={3} />
        ))}
        <path d={`M 1110 ${600 + dip} L 1156 ${600 + dip}`} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
        <polygon points={`1150,${600 + dip} 1134,${592 + dip} 1134,${608 + dip}`} fill={KRP.red} />
        <TagPlate x={420} y={740} text="試料" size={40} t={seg(f, 2, 10)} rot={-3} />
        {/* 手 (白衣の袖) */}
        <g transform={`translate(${hx} ${hy}) scale(${hs}) scale(1 ${hsy}) rotate(${hr})`}>
          <L4cHandShape mode="hand" />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#171 【並】 いまでいう、低反発素材です。
// 設計: 現代の寝室。低反発の枕とマットレスで眠る人。頭の形に沈んだ枕。札「低反発素材」
// どこ: 現代の夜の寝室。右に月の窓とカーテン、左にスタンドの灯るナイトテーブルと目覚まし時計。
// 演出: パジャマの人が低反発の枕とマットレスで眠る。頭の形に枕が沈み、マットレスの角の切り口に黄色い低反発の層と気泡。札「低反発素材」から点線で枕とマットレスの層を指す。
// 動き: f4〜30 頭がゆっくり枕に沈む・ふとんが寝息で上下・Zzz が昇る・カーテンがゆれる・カメラは枕へ寄る。
const Yw171: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const sink = easeInOut(seg(f, 4, 30));
  const br = Math.sin(f / 9) * 6;
  const hy = 596 + sink * 16;
  return (
    <Frame f={f} seed={3171} bg={C.night} dark>
      <g transform={cam(860, 620, z)}>
        <rect x={-100} y={-100} width={W + 200} height={880} fill={C.night} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 210 - 40} y1={-100} x2={i * 210 - 40} y2={780} stroke={C.nightDeep} strokeWidth={4} opacity={0.5} />
        ))}
        {/* 窓・月・カーテン */}
        <rect x={1480} y={110} width={340} height={360} fill={C.nightDeep} stroke={C.ink} strokeWidth={7} />
        <circle cx={1700} cy={210} r={56} fill={C.moon} stroke={C.ink} strokeWidth={4} />
        <circle cx={1724} cy={196} r={50} fill={C.nightDeep} />
        {[[1540, 170], [1600, 300], [1760, 380], [1660, 420]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={(f + i * 7) % 20 < 10 ? 5 : 3} fill={C.moon} />
        ))}
        <line x1={1650} y1={110} x2={1650} y2={470} stroke={C.ink} strokeWidth={6} />
        <line x1={1480} y1={290} x2={1820} y2={290} stroke={C.ink} strokeWidth={6} />
        {[1450, 1850].map((cx, i) => (
          <path key={cx} d={`M ${cx - 50} 90 L ${cx + 50} 90 Q ${cx + 40 + Math.sin(f / 8 + i) * 8} 300 ${cx + 56} 520 L ${cx - 56} 520 Q ${cx - 40} 300 ${cx - 50} 90 Z`}
            fill={C.duvetDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        ))}
        <polygon points="1480,470 1820,470 1900,780 1400,780" fill={C.moon} opacity={0.08} />
        {/* 床とラグ */}
        <rect x={-100} y={780} width={W + 200} height={400} fill={C.nightDeep} />
        <path d="M -100 780 L 2020 780" stroke={C.ink} strokeWidth={5} />
        <ellipse cx={1000} cy={930} rx={560} ry={70} fill={C.rug} stroke={C.ink} strokeWidth={5} opacity={0.9} />
        {/* ナイトテーブル・スタンド・目覚まし */}
        <circle cx={400} cy={480} r={190} fill={C.lampGlow} opacity={0.3 + Math.sin(f / 6) * 0.03} />
        <rect x={290} y={620} width={220} height={190} rx={8} fill={C.bedWood} stroke={C.ink} strokeWidth={6} />
        <line x1={290} y1={710} x2={510} y2={710} stroke={C.ink} strokeWidth={4} />
        <circle cx={400} cy={666} r={8} fill={C.ink} /><circle cx={400} cy={756} r={8} fill={C.ink} />
        <rect x={392} y={500} width={16} height={120} fill={C.metal} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={400} cy={618} rx={50} ry={10} fill={C.metal} stroke={C.ink} strokeWidth={4} />
        <polygon points="340,420 460,420 490,510 310,510" fill={C.lampGlow} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={430} y={570} width={66} height={50} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <text x={463} y={604} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.ink}>2:00</text>
        {/* ベッド: 頭板・マットレス (上に黄色い低反発の層)・枠 */}
        <rect x={560} y={400} width={60} height={410} rx={14} fill={C.bedWood} stroke={C.ink} strokeWidth={6} />
        <rect x={600} y={690} width={820} height={44} fill={C.foam} stroke={C.ink} strokeWidth={6} />
        <rect x={600} y={734} width={820} height={70} fill={C.sheet} stroke={C.ink} strokeWidth={6} />
        <rect x={590} y={804} width={840} height={30} fill={C.bedWood} stroke={C.ink} strokeWidth={5} />
        {/* マットレスの角の切り口 (気泡) */}
        <rect x={1330} y={690} width={90} height={114} fill={C.foamDeep} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={1342 + rnd(1711, i) * 66} cy={700 + rnd(1712, i) * 96} r={5 + rnd(1713, i) * 5} fill={C.foam} stroke={C.foamPit} strokeWidth={2} />
        ))}
        {/* 枕 (奥半分) */}
        <path d="M 640 690 Q 620 606 680 594 Q 820 572 980 596 Q 1020 610 1010 690 Z" fill={C.foam} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={830} cy={hy + 40} rx={120 + sink * 14} ry={30 + sink * 16} fill={C.foamPit} opacity={0.55} />
        {/* 眠る人 (横に寝かせた Person) */}
        <Person x={830 + 228 * 1.8} y={hy} s={1.8} f={f} still face="joy" lean={-90} cloth={C.pajama} clothDark={C.duvetDark} hair="cap" phase={1} />
        {/* 枕の手前のふち (頭が沈んで見える) */}
        <path d={`M 636 690 Q 650 ${666 - sink * 6} 720 ${672 + sink * 4} Q 830 ${696 + sink * 10} 940 ${672 + sink * 4} Q 1000 ${664 - sink * 6} 1014 690 Q 830 712 636 690 Z`}
          fill={C.foam} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ふとん */}
        <path d={`M 940 ${700} Q 910 ${480 - br} 1000 ${436 - br} Q 1200 ${400 - br} 1400 ${470 - br * 0.5} Q 1490 ${520} 1460 ${820} L 980 ${820} Q 930 760 940 700 Z`}
          fill={C.duvet} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={1040 + (i % 4) * 100} cy={540 + Math.floor(i / 4) * 120 - br * 0.6} r={10} fill={C.duvetDark} opacity={0.7} />
        ))}
        <path d={`M 980 ${470 - br} Q 1010 640 990 800`} fill="none" stroke={C.duvetDark} strokeWidth={5} />
        {/* Zzz */}
        {[0, 1, 2].map((k) => {
          const tt = ((f + k * 12) % 36) / 36;
          return (
            <text key={k} x={720 - k * 10 + tt * 30} y={470 - tt * 120 - k * 20} fontFamily={FONT} fontWeight={900}
              fontSize={36 + k * 10} fill={C.moon} opacity={1 - tt}>Z</text>
          );
        })}
        {/* 札と指し線 */}
        <TagPlate x={1080} y={310} text="低反発素材" size={52} t={seg(f, 6, 16)} />
        <g stroke={C.moon} strokeWidth={5} strokeDasharray="12 10" fill="none" opacity={seg(f, 10, 18)}>
          <path d="M 990 356 Q 820 420 690 600" />
          <path d="M 1000 356 Q 560 520 600 712" />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#172 【並】 もうひとつ、手を守る柔らかさがあります。
// 設計: 道しるべの看板 (#167 と同じ) に、もう1本の小さな矢印「手を守る」が f でぽんと生える
// どこ: #167 と同じ春の野原の分かれ道。左の先に病院、右の先に煙の出る家。真ん中に木の道しるべ。
// 演出: 「体を守る」「心を落ち着かせる」の2本の下に、3本目の小さな矢印「手を守る」がぽんと生える (木くずと釘の打ち音)。旅の人が驚いて、新しい矢印を指さす。
// 動き: f10〜20 小さな矢印が柱から伸び出る・f12〜 木くずが飛ぶ・f16〜 人が指さして笑う・雲と草がゆれる・カメラは新しい矢印へ寄る。
// 道しるべの野原 (#167 YawaF2 の Yw167 を写したもの)。top/bot: 上下の矢印の光 / hand: 3本目の矢印の出 (0→1)
const L4cSignpost: React.FC<{ f: number; top?: number; bot?: number; hand?: number; children?: React.ReactNode }> = ({
  f, top = 0, bot = 0, hand = 0, children,
}) => {
  const pulse = 0.85 + Math.sin(f / 4) * 0.15;
  const hp = pop(clamp01(hand));
  return (
    <g>
      <rect x={-400} y={-150} width={W + 800} height={800} fill={C.sky} />
      {[[300, 120, 1], [1100, 90, 1.3], [1650, 170, 0.9], [2150, 110, 1]].map(([cx2, cy2, s2], i) => (
        <L4cCloud key={i} x={cx2 + f * (0.6 + i * 0.3)} y={cy2} s={s2} />
      ))}
      <path transform={`translate(${1300 - f * 6} ${250 + Math.sin(f / 4) * 8})`}
        d={`M -24 0 Q -12 ${-12 + Math.sin(f / 2) * 6} 0 0 Q 12 ${-12 + Math.sin(f / 2) * 6} 24 0`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M -400 560 Q 300 440 700 530 Q 1100 450 1500 520 Q 1800 470 2070 540 Q 2250 500 2400 540 L 2400 700 L -400 700 Z" fill={C.hill} stroke={C.ink} strokeWidth={5} />
      <g transform="translate(250 520)">
        <rect x={-90} y={-110} width={180} height={110} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={-14} y={-96} width={28} height={70} fill={KRP.red} />
        <rect x={-35} y={-75} width={70} height={28} fill={KRP.red} />
        <rect x={-24} y={-36} width={48} height={36} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
      </g>
      <g transform="translate(1720 520)">
        <rect x={40} y={-150} width={28} height={60} fill={YP.woodDark} stroke={C.ink} strokeWidth={4} />
        {[0, 1].map((k) => {
          const tt = ((f + k * 16) % 32) / 32;
          return <circle key={k} cx={54 + tt * 30} cy={-160 - tt * 60} r={10 + tt * 14} fill={KRP.white} opacity={0.85 * (1 - tt)} />;
        })}
        <path d="M -100 -80 L 0 -160 L 100 -80 Z" fill={KRP.red} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-80} y={-80} width={160} height={80} fill={C.wallWarm} stroke={C.ink} strokeWidth={5} />
        <rect x={-50} y={-62} width={40} height={34} fill={C.warmGlow} stroke={C.ink} strokeWidth={3} />
        <rect x={20} y={-50} width={32} height={50} fill={YP.woodDark} stroke={C.ink} strokeWidth={3} />
      </g>
      <rect x={-400} y={600} width={W + 800} height={600} fill={C.meadow} />
      <path d="M -400 600 Q 900 570 2400 610" fill="none" stroke={C.meadowDark} strokeWidth={5} />
      <polygon points="820,1200 1100,1200 1000,700 930,700" fill={C.path} stroke={C.ink} strokeWidth={5} />
      <polygon points="962,688 962,738 330,600 330,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points="962,688 962,738 1620,600 1620,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points="930,700 994,700 1010,760 916,760" fill={C.path} />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={960 + (i - 2.5) * 30} cy={800 + i * 50} rx={14} ry={6} fill={C.pathDark} />
      ))}
      {Array.from({ length: 28 }, (_, i) => {
        const gx = rnd(1671, i) * 2500 - 260;
        const gy = 640 + rnd(1672, i) * 300;
        if (gx > 800 && gx < 1120 && gy > 700) return null;
        const sw = Math.sin(f / 7 + i) * 4;
        return (
          <path key={i} d={`M ${gx - 14} ${gy} q ${sw} -26 ${-6 + sw} -40 M ${gx} ${gy} q ${sw} -30 ${4 + sw} -50 M ${gx + 14} ${gy} q ${sw} -24 ${12 + sw} -36`}
            fill="none" stroke={C.meadowDark} strokeWidth={5} strokeLinecap="round" />
        );
      })}
      {/* 柱 */}
      <rect x={938} y={190} width={52} height={660} rx={6} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
      <path d="M 930 190 L 964 160 L 998 190 Z" fill={YP.woodDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={956} y1={240} x2={952} y2={820} stroke={YP.woodDark} strokeWidth={4} opacity={0.7} />
      {/* 上の矢印「体を守る」 */}
      <ellipse cx={760} cy={290} rx={360} ry={130} fill={YP.glow} opacity={0.5 * top * pulse} />
      <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.wood} stroke={top > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.glowCore} opacity={0.45 * top} />
      <path d="M 580 246 L 990 244 M 590 336 L 990 338" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
      {[[580, 290], [990, 290]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={7} fill={C.ink} />)}
      <TagPlate x={770} y={290} text="体を守る" size={64} t={1} />
      {/* 下の矢印「心を落ち着かせる」 */}
      <ellipse cx={1218} cy={456} rx={380} ry={120} fill={YP.glow} opacity={0.55 * bot * pulse} />
      {bot > 0.05 && (
        <g stroke={YP.glow} strokeWidth={8} strokeLinecap="round" opacity={bot}>
          {[-160, -125, -55, -20, 20, 55, 125, 160].map((a, i) => {
            const ra = (a * Math.PI) / 180;
            const r1 = 250, r2 = 290 + Math.sin(f / 3 + i) * 14;
            return <line key={a} x1={1218 + Math.cos(ra) * r1 * 1.3} y1={456 + Math.sin(ra) * r1 * 0.5} x2={1218 + Math.cos(ra) * r2 * 1.3} y2={456 + Math.sin(ra) * r2 * 0.5} />;
          })}
        </g>
      )}
      <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.wood} stroke={bot > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.glowCore} opacity={0.45 * bot} />
      <path d="M 940 424 L 1430 422 M 940 490 L 1430 492" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
      <TagPlate x={1190} y={456} text="心を落ち着かせる" size={48} t={1} />
      {/* 3本目の小さな矢印「手を守る」 (柱から生える) */}
      {hp > 0 && (
        <g transform={`translate(990 615) scale(${hp}) translate(-990 -615)`}>
          <polygon points="996,572 712,572 662,615 712,658 996,658" fill={YP.wood} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 724 590 L 980 589 M 728 642 L 980 643" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
          <circle cx={976} cy={615} r={7} fill={C.ink} />
          <TagPlate x={830} y={615} text="手を守る" size={42} t={1} />
        </g>
      )}
      {children}
    </g>
  );
};
const Yw172: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.08, easeInOut(seg(f, 6, 42)));
  const hand = seg(f, 10, 20);
  const chips = seg(f, 12, 30);
  const point = f >= 16;
  return (
    <Frame f={f} seed={3172} bg={C.sky}>
      <g transform={cam(860, 600, z)}>
        <L4cSignpost f={f} hand={hand}>
          {/* 生えた瞬間の木くずと打ち音の線 */}
          {chips > 0 && chips < 1 && (
            <g opacity={1 - chips}>
              {Array.from({ length: 7 }, (_, i) => {
                const a = -2.6 + i * 0.5;
                const r = 30 + chips * 120;
                return <rect key={i} x={1000 + Math.cos(a) * r} y={615 + Math.sin(a) * r * 0.8 + chips * chips * 60} width={16} height={8} rx={2}
                  fill={YP.woodDark} stroke={C.ink} strokeWidth={2.5} transform={`rotate(${i * 50 + f * 12} ${1008 + Math.cos(a) * r} ${619 + Math.sin(a) * r * 0.8})`} />;
              })}
            </g>
          )}
          {hand > 0.5 && (
            <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 20, 34) * 0.6}>
              <line x1={1030} y1={580} x2={1060} y2={556} />
              <line x1={1036} y1={615} x2={1074} y2={615} />
              <line x1={1030} y1={650} x2={1060} y2={674} />
            </g>
          )}
          {/* 小さな光 (新しい矢印にだけ) */}
          {hand > 0.9 && <ellipse cx={830} cy={615} rx={210} ry={70} fill={YP.glow} opacity={0.28 + Math.sin(f / 4) * 0.08} />}
          <ellipse cx={1580} cy={884} rx={90} ry={14} fill={C.ink} opacity={0.18} />
          <Person x={1580} y={880} s={1.2} f={f} phase={5} face={point ? "joy" : "surprised"} gaze={[-6, -2]}
            pose={point ? "point" : "stand"} pointDir={-1} cloth={C.knit} clothDark={C.knitDark} hair="cap" />
        </L4cSignpost>
      </g>
    </Frame>
  );
};

// ---- 文#173 【山】 1991年、日本のパイロットが、太くて柔らかいグリップのボールペンを発売しました。
// 設計: 1990年代の日本の文房具店の店先 (ショーケース・ペン立て・ポップ)。新発売の太い軸のボールペンが台の上でスポットライトを浴びる。軸の柔らかい部分が f でむにっとへこむ。隅に `AgeDial` (s≈0.5、label「1991年」)。札「パイロット」。ロゴは描かない
// どこ: 1991年の日本の文房具店の店先。ひさしの縞・奥の棚 (ノート・ペン立て)・柱の「平成3年」のこよみ・ガラスのショーケース。店のおばさんが奥でにこにこ。
// 演出: ショーケースの上の赤い台に、新発売の太い軸のボールペン (ロゴなし) が横たわりスポットライト。お客の指が上から柔らかい軸を押し、むにっとへこむ。黄色い星形のポップ「新発売」。右上に年代ダイヤル「1991年」。
// 動き: スポットライトのきらめき・ポップがゆれる・f8〜18 指が降りてくる・f18〜26 軸がむにっとへこむ (しわの線)・カメラが軸へ寄る。
// 太い軸のペン (横向き。x,y=おしりの中心、s=1で長さ約1000px)。kind: ball=ボールペン / sharp=シャープペン
//   dent: 柔らかい軸のへこみ (0〜1、dentAt はへこむ位置 = 軸の中の x) / knock: ノックの押しこみ (0〜1) / lead: 芯の出 (px)
const L4cGripPen: React.FC<{
  x: number; y: number; s?: number; kind: "ball" | "sharp"; dent?: number; dentAt?: number; knock?: number; lead?: number;
}> = ({ x, y, s = 1, kind, dent = 0, dentAt = 740, knock = 0, lead = 0 }) => {
  const body = kind === "ball" ? C.penBlue : C.penGreen;
  const bodyDark = kind === "ball" ? C.penBlueDark : C.penGreenDark;
  const dy = dent * 30;
  const gTop = `M 600 -52 L ${dentAt - 70} -52 C ${dentAt - 34} -52 ${dentAt - 30} ${-52 + dy} ${dentAt} ${-52 + dy} C ${dentAt + 30} ${-52 + dy} ${dentAt + 34} -52 ${dentAt + 70} -52 L 880 -52`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={520} cy={74} rx={480} ry={14} fill={C.ink} opacity={0.18} />
      {/* ノック */}
      <rect x={-34 + knock * 14} y={-24} width={60} height={48} rx={14} fill={kind === "ball" ? bodyDark : KRP.white} stroke={C.ink} strokeWidth={5} />
      {/* 胴 */}
      <path d="M 70 -46 L 600 -46 L 600 46 L 70 46 Q 14 46 14 0 Q 14 -46 70 -46 Z" fill={body} stroke={C.ink} strokeWidth={6} />
      <path d="M 70 -30 L 590 -30" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.45} />
      <path d="M 70 32 L 590 32" stroke={bodyDark} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      {/* クリップ */}
      <path d="M 70 -46 L 70 -66 L 360 -62 Q 380 -60 376 -50 L 360 -46" fill={C.metal} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={60} y={-48} width={34} height={96} fill={C.metal} stroke={C.ink} strokeWidth={5} />
      {/* 柔らかい軸 (半透明。中の芯の管が透ける) */}
      <path d={`${gTop} L 880 52 L 600 52 Z`} fill={C.grip} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={600} y={-12} width={290} height={24} fill={kind === "ball" ? C.penBlue : C.lead} opacity={0.35} />
      {Array.from({ length: 10 }, (_, i) => {
        const gx = 620 + i * 26;
        const near = Math.max(0, 1 - Math.abs(gx - dentAt) / 70);
        return <line key={i} x1={gx} y1={-40 + dy * near} x2={gx} y2={40} stroke={C.gripRib} strokeWidth={5} strokeLinecap="round" />;
      })}
      {dent > 0.05 && (
        <g stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" opacity={dent}>
          <path d={`M ${dentAt - 80} -64 q -10 -8 -22 -6`} />
          <path d={`M ${dentAt + 80} -64 q 10 -8 22 -6`} />
          <path d={`M ${dentAt - 40} ${-30 + dy} q 40 14 80 0`} />
        </g>
      )}
      {/* 先の円すいと口金 */}
      <path d="M 880 -46 L 960 -16 L 960 16 L 880 46 Z" fill={body} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 960 -16 L 1000 -6 L 1000 6 L 960 16 Z" fill={C.metal} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {kind === "ball" ? (
        <circle cx={1004} cy={0} r={6} fill={C.metalDark} stroke={C.ink} strokeWidth={3} />
      ) : (
        <g>
          <rect x={1000} y={-4} width={24} height={8} fill={C.metal} stroke={C.ink} strokeWidth={3} />
          {lead > 0 && <rect x={1024} y={-4} width={lead} height={8} fill={C.lead} />}
        </g>
      )}
    </g>
  );
};
const Yw173: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const come = easeOut(seg(f, 8, 18));
  const dent = easeOut(seg(f, 18, 26)) * (0.92 + Math.sin(f / 4) * 0.08);
  const tipX = lerp(1300, 1180, come);
  const tipY = lerp(250, 392, come) + dent * 24;
  return (
    <Frame f={f} seed={3173} bg={C.shopWall}>
      <g transform={cam(1100, 440, z)}>
        {/* 奥の壁と棚 */}
        <rect x={-100} y={-100} width={W + 200} height={760} fill={C.shopWall} />
        {[230, 400].map((sy) => (
          <g key={sy}>
            <rect x={-100} y={sy} width={W + 200} height={16} fill={C.shelf} stroke={C.ink} strokeWidth={4} />
            {Array.from({ length: 34 }, (_, i) => {
              const bx = -80 + i * 60 + rnd(sy, i) * 10;
              const bh = 70 + rnd(sy + 1, i) * 40;
              const cols = [C.penBlue, KRP.red, C.popYellow, C.teal, C.purple, KRP.white];
              return <rect key={i} x={bx} y={sy - bh} width={44} height={bh} fill={cols[i % 6]} stroke={C.ink} strokeWidth={3.5} />;
            })}
          </g>
        ))}
        {/* 柱のこよみ */}
        <rect x={580} y={100} width={130} height={560} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        <rect x={592} y={150} width={106} height={150} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <rect x={592} y={150} width={106} height={34} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        <text x={645} y={176} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.white}>平成3年</text>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={602 + (i % 4) * 22} y={196 + Math.floor(i / 4) * 30} width={16} height={18} fill={C.paperLine} />
        ))}
        {/* 店のおばさん (奥、カウンターの向こう) */}
        <Person x={1540} y={690} s={1.0} f={f} still face="smile" gaze={[-6, 3]} cloth={C.apron} clothDark="#8A5A6A" hair="cap" phase={4} />
        <path d="M 1500 530 L 1500 620 M 1580 530 L 1580 620" stroke={KRP.white} strokeWidth={6} />
        {/* ひさし (店先) */}
        <rect x={-100} y={-100} width={W + 200} height={170} fill={KRP.white} />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={-100 + i * 100} y={-100} width={50} height={170} fill={KRP.red} />
        ))}
        <path d={`M -100 70 ${Array.from({ length: 22 }, (_, i) => `q 25 30 50 0 q 25 30 50 0`).join(" ")}`} fill="none" stroke={C.ink} strokeWidth={5} />
        <path d="M -100 70 L 2100 70" stroke={C.ink} strokeWidth={5} />
        {/* スポットライト */}
        <rect x={922} y={70} width={76} height={40} rx={8} fill={C.ink} />
        <polygon points="920,110 1000,110 1480,560 440,560" fill={C.spot} opacity={0.38} />
        {/* ショーケース */}
        <rect x={-100} y={620} width={W + 200} height={30} fill={C.glassEdge} stroke={C.ink} strokeWidth={5} />
        <rect x={-100} y={650} width={W + 200} height={500} fill={C.glass} stroke={C.ink} strokeWidth={5} />
        {[0, 1].map((r) => (
          <g key={r}>
            <rect x={-100} y={760 + r * 140} width={W + 200} height={10} fill={C.glassEdge} />
            {Array.from({ length: 16 }, (_, i) => (
              <rect key={i} x={40 + i * 120} y={712 + r * 140} width={90} height={18} rx={9}
                fill={[C.penBlue, KRP.red, C.ink, C.penGreen][(i + r) % 4]} stroke={C.ink} strokeWidth={3} transform={`rotate(-12 ${85 + i * 120} ${720 + r * 140})`} />
            ))}
          </g>
        ))}
        <path d="M 120 670 L 60 1000 M 1500 670 L 1440 1000" stroke={KRP.white} strokeWidth={14} opacity={0.5} strokeLinecap="round" />
        {/* ペン立て (左) */}
        <g transform="translate(170 620)">
          {[-30, -10, 10, 30].map((px, i) => (
            <rect key={i} x={px - 7} y={-190 + i * 10} width={14} height={150} rx={6} fill={[KRP.red, C.penBlue, C.popYellow, C.ink][i]}
              stroke={C.ink} strokeWidth={3} transform={`rotate(${px / 3} ${px} -40)`} />
          ))}
          <rect x={-56} y={-110} width={112} height={110} rx={10} fill={C.metal} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* ポップ「新発売」 */}
        <g transform={`translate(360 390) rotate(${-8 + Math.sin(f / 6) * 3})`}>
          <rect x={-5} y={60} width={10} height={170} fill={C.shelf} stroke={C.ink} strokeWidth={3} />
          <polygon points={Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r = i % 2 ? 96 : 130;
            return `${Math.cos(a) * r},${Math.sin(a) * r * 0.8}`;
          }).join(" ")} fill={C.popYellow} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.red}>新発売</text>
        </g>
        {/* 赤い台 */}
        <polygon points="560,470 1360,470 1400,500 520,500" fill={C.velvet} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={520} y={500} width={880} height={120} fill={C.velvetDark} stroke={C.ink} strokeWidth={5} />
        <TagPlate x={960} y={562} text="パイロット" size={44} t={seg(f, 4, 12)} />
        {[640, 1260].map((vx) => (
          <path key={vx} d={`M ${vx - 30} 470 L ${vx - 20} 450 L ${vx} 480 L ${vx + 20} 450 L ${vx + 30} 470 Z`} fill={C.glass} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 主役のペン */}
        <L4cGripPen x={470} y={432} s={0.95} kind="ball" dent={dent} dentAt={(1180 - 470) / 0.95} />
        {/* きらめき */}
        {[[560, 330], [1440, 360], [1000, 300]].map(([sx, sy], i) => {
          const k = 0.5 + 0.5 * Math.sin(f / 3 + i * 2);
          return <path key={i} d={`M ${sx} ${sy - 22 * k} L ${sx + 6} ${sy} L ${sx} ${sy + 22 * k} L ${sx - 6} ${sy} Z M ${sx - 22 * k} ${sy} L ${sx} ${sy - 6} L ${sx + 22 * k} ${sy} L ${sx} ${sy + 6} Z`} fill={KRP.white} stroke={C.ink} strokeWidth={2} />;
        })}
        {/* お客の指 (右上から) */}
        <L4cLimb pts={[[2100, -60], [tipX + 230, tipY - 150]]} w={130} fill={C.sweater} />
        <ellipse cx={tipX + 150} cy={tipY - 92} rx={82} ry={70} fill={KRP.white} stroke={C.ink} strokeWidth={6} transform={`rotate(-30 ${tipX + 150} ${tipY - 92})`} />
        <L4cLimb pts={[[tipX + 100, tipY - 70], [tipX + 4, tipY - 26]]} w={40} fill={KRP.white} />
        <path d={`M ${tipX + 180} ${tipY - 40} q -40 10 -60 -10`} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
      <AgeDial x={1720} y={220} s={0.42} spin={easeOut(seg(f, 0, 20)) * 240} label="1991年" handle={f * 8} />
    </Frame>
  );
};

// ---- 文#174 【並】 ドクターグリップです。翌年には、シャープペンも出ました。
// 設計: 太い軸のボールペンとシャープペンが並ぶ (形の特徴だけ。ロゴなし)。シャープペンの先から芯が f でカチカチ出る。札「ドクターグリップ」「翌年 シャープペン」
// どこ: 木の勉強机の上の緑のデスクマット。右上にノート、手前に消しゴムと芯のケース。
// 演出: #173 と同じ太い軸のボールペン (青) と、翌年のシャープペン (緑) が上下に並ぶ。シャープペンのノックがカチッと押されるたび、先から芯が少しずつ出る。
// 動き: f10/f20/f30 にノックが押しこまれ (打ち線)、芯が一段ずつ伸びる・カメラはペン先の方へゆっくりパン。
const Yw174: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  const clicks = [10, 20, 30];
  const knock = clicks.reduce((a, c) => Math.max(a, f >= c && f < c + 4 ? 1 - (f - c) / 4 : 0), 0);
  const nClick = clicks.filter((c) => f >= c).length;
  const lead = nClick * 22;
  return (
    <Frame f={f} seed={3174} bg={C.desk}>
      <g transform={cam(1300, 560, z, lerp(0, -30, seg(f, 0, 42)))}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.desk} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -100 ${40 + i * 150} q 500 ${rnd(1741, i) * 30 - 15} 1000 0 t 1100 0`} fill="none" stroke={C.deskDark} strokeWidth={4} opacity={0.5} />
        ))}
        {/* デスクマット */}
        <rect x={110} y={150} width={1700} height={800} rx={16} fill={C.mat} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={110} y1={250 + i * 100} x2={1810} y2={250 + i * 100} stroke={C.matLine} strokeWidth={2.5} opacity={0.6} />
        ))}
        {/* ノート (右上) */}
        <g transform="rotate(6 1640 230)">
          <rect x={1480} y={110} width={340} height={260} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={1500} y1={150 + i * 32} x2={1800} y2={150 + i * 32} stroke={C.paperLine} strokeWidth={3} />)}
          <path d="M 1510 172 q 20 -12 40 0 t 40 0 t 40 0 M 1510 204 q 20 -12 40 0 t 40 0" fill="none" stroke={C.ink} strokeWidth={3.5} />
        </g>
        {/* 消しゴムと芯のケース (手前) */}
        <g transform="rotate(-8 400 790)">
          <rect x={320} y={760} width={160} height={70} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={360} y={760} width={90} height={70} fill={C.penBlue} stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform="rotate(10 1500 800)">
          <rect x={1420} y={770} width={170} height={56} rx={10} fill={C.glass} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={1440} y1={784 + k * 10} x2={1570} y2={784 + k * 10} stroke={C.lead} strokeWidth={3} />)}
        </g>
        {[[620, 800], [660, 820], [700, 806]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={6} fill={KRP.white} stroke={C.ink} strokeWidth={2} />)}
        {/* 2本のペン */}
        <L4cGripPen x={330} y={360} s={1.1} kind="ball" />
        <L4cGripPen x={270} y={630} s={1.1} kind="sharp" knock={knock} lead={lead} />
        {/* ノックの打ち線と芯の先の光 */}
        {knock > 0 && (
          <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={knock}>
            <line x1={220} y1={590} x2={194} y2={566} />
            <line x1={214} y1={630} x2={180} y2={630} />
            <line x1={220} y1={670} x2={194} y2={694} />
          </g>
        )}
        {nClick > 0 && (
          <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 3)}>
            <line x1={270 + 1024 * 1.1 + lead * 1.1 + 18} y1={630} x2={270 + 1024 * 1.1 + lead * 1.1 + 42} y2={630} />
            <line x1={270 + 1024 * 1.1 + lead * 1.1 + 12} y1={612} x2={270 + 1024 * 1.1 + lead * 1.1 + 30} y2={598} />
            <line x1={270 + 1024 * 1.1 + lead * 1.1 + 12} y1={648} x2={270 + 1024 * 1.1 + lead * 1.1 + 30} y2={662} />
          </g>
        )}
        <TagPlate x={880} y={238} text="ドクターグリップ" size={48} t={seg(f, 2, 10)} />
        <TagPlate x={820} y={505} text="翌年 シャープペン" size={44} t={seg(f, 6, 14)} />
      </g>
    </Frame>
  );
};

// ---- 文#175 【山】 伝票を長い時間書きつづける人たちの、手や腕の痛みが、開発のきっかけだったとされます。
// 設計: 1980年代の銀行の窓口の裏 (伝票の山・そろばん・電卓・事務机)。ワイシャツにアームカバーの事務員が、細いペンで伝票を書き続け、手首と腕に赤い痛みの線。肩をとんとん
// どこ: 1980年代の銀行の窓口の裏の事務室。蛍光灯・夕焼けのブラインド窓・壁の時計・「窓口」の吊り札。灰緑の事務机。
// 演出: ワイシャツに黒いアームカバーの事務員が、細いペンで伝票を書き続ける。机の左右に伝票の山 (未処理/済)、そろばん、紙の出る電卓。右手首と腕と肩に赤い痛みのぎざぎざ。奥の同僚は自分の肩をとんとんたたく。
// 動き: 時計の針が早回り (長時間)・ペン先が伝票の上を往復して字の線が増える・f8〜22 痛みの線が強くなって脈打つ・奥の同僚の肩たたき・カメラは手首へ寄る。
const Yw175: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const pain = easeOut(seg(f, 8, 22)) * (0.8 + 0.2 * Math.sin(f / 2.5));
  const wx = 1000 + Math.sin(f / 1.6) * 10;
  const wy = 776 + Math.cos(f / 1.6) * 3;
  const tap = Math.abs(Math.sin(f / 2.2)) * 14;
  const lines = Math.min(5, Math.floor(f / 8) + 1);
  const Zig: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
    <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M 0 0 l 10 -14 l 8 14 l 10 -14 l 8 14 l 10 -14"
      fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  );
  return (
    <Frame f={f} seed={3175} bg={C.office}>
      <g transform={cam(1000, 720, z)}>
        <rect x={-100} y={-100} width={W + 200} height={1300} fill={C.office} />
        <rect x={-100} y={560} width={W + 200} height={30} fill={C.officeDark} />
        {/* 蛍光灯 */}
        {[400, 1000, 1600].map((lx) => (
          <g key={lx}>
            <rect x={lx - 160} y={20} width={320} height={30} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
            <rect x={lx - 140} y={50} width={280} height={8} fill={C.warmGlow} opacity={0.6} />
          </g>
        ))}
        {/* 窓 (夕焼け・ブラインド) */}
        <rect x={1640} y={130} width={260} height={340} fill={C.dusk} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={1640} y={140 + i * 33} width={260} height={18} fill={C.blind} stroke={C.ink} strokeWidth={2} />
        ))}
        {/* 時計 (早回り) */}
        <g transform="translate(1440 190)">
          <circle r={74} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-62} x2={0} y2={-52} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={0} y2={-40} stroke={C.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${150 + f * 3})`} />
          <line x1={0} y1={0} x2={0} y2={-58} stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${f * 36})`} />
          <circle r={7} fill={C.ink} />
        </g>
        {/* 「窓口」の吊り札 */}
        <line x1={1040} y1={60} x2={1040} y2={130} stroke={C.ink} strokeWidth={4} />
        <line x1={1200} y1={60} x2={1200} y2={130} stroke={C.ink} strokeWidth={4} />
        <TagPlate x={1120} y={166} text="窓口 →" size={42} t={1} rot={Math.sin(f / 9) * 2} />
        <TagPlate x={720} y={250} text="1980年代" size={44} t={seg(f, 2, 10)} />
        {/* 奥の同僚 (机とダイヤル電話)。自分の肩をとんとん */}
        <Person x={330} y={740} s={0.95} f={f} still face="worried" gaze={[2, 2]} cloth={C.shirt} clothDark={C.slacks} hair="cap" phase={7} lean={-5} />
        <L4cTie x={330} y={740} s={0.95} />
        <L4cLimb pts={[[394, 646], [300, 596 + tap * 0.4 - 6]]} w={20} fill={C.armCover} />
        <circle cx={300} cy={590 + tap * 0.4 - 6} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {tap > 10 && (
          <g stroke={C.ink} strokeWidth={4} strokeLinecap="round">
            <path d="M 262 560 q -10 -10 -6 -24" fill="none" /><path d="M 246 590 l -18 -4" />
          </g>
        )}
        <polygon points="120,640 620,640 640,690 100,690" fill={C.steelDesk} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={100} y={690} width={540} height={90} fill={C.steelDeskDark} stroke={C.ink} strokeWidth={5} />
        <g transform="translate(540 630)">
          <rect x={-50} y={-30} width={100} height={40} rx={10} fill={C.ink} />
          <circle cx={0} cy={-10} r={18} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <path d="M -54 -36 Q 0 -66 54 -36" fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* 主役の事務員 */}
        <Person x={960} y={880} s={1.5} f={f} still face="worried" gaze={[2, 7]} cloth={C.shirt} clothDark={C.slacks} hair="cap" phase={1} />
        <L4cTie x={960} y={880} s={1.5} />
        {[0, 1].map((k) => (
          <path key={k} d={`M ${1040 + k * 26} ${506 + k * 12 + ((f + k * 9) % 18)} q -6 10 0 14 q 6 -4 0 -14 Z`} fill={C.glass} stroke={C.ink} strokeWidth={2.5} />
        ))}
        {/* 机 */}
        <polygon points="380,720 1540,720 1640,812 280,812" fill={C.steelDesk} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={280} y={812} width={1360} height={400} fill={C.steelDeskDark} stroke={C.ink} strokeWidth={6} />
        <rect x={340} y={840} width={300} height={70} rx={6} fill={C.steelDesk} stroke={C.ink} strokeWidth={4} />
        <rect x={1280} y={840} width={300} height={70} rx={6} fill={C.steelDesk} stroke={C.ink} strokeWidth={4} />
        {/* 伝票の山 */}
        {[[560, 0], [1340, 1]].map(([px, k]) => (
          <g key={px}>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={px - 100 + rnd(1751 + k, i) * 10} y={716 - (i + 1) * 13} width={200} height={13}
                fill={[C.slip, C.slipPink, C.slipBlue][i % 3]} stroke={C.ink} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        <TagPlate x={560} y={580} text="未処理" size={30} t={1} rot={-3} />
        <TagPlate x={1340} y={580} text="済" size={30} t={1} rot={3} />
        {/* そろばん */}
        <g transform="translate(420 770) rotate(-4)">
          <rect x={-110} y={-30} width={220} height={60} rx={6} fill={C.abacus} stroke={C.ink} strokeWidth={5} />
          <line x1={-100} y1={-8} x2={100} y2={-8} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <ellipse cx={-88 + i * 22} cy={-18} rx={9} ry={6} fill={C.ink} />
              <ellipse cx={-88 + i * 22} cy={6 + (i % 3) * 4} rx={9} ry={6} fill={C.ink} />
            </g>
          ))}
        </g>
        {/* 電卓 (紙が出る) */}
        <g transform="translate(1440 760) rotate(4)">
          <path d={`M -40 -40 L 40 -40 L 46 ${-90 - f * 0.8} L -34 ${-90 - f * 0.8} Z`} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <rect x={-80} y={-40} width={160} height={80} rx={8} fill={C.metal} stroke={C.ink} strokeWidth={5} />
          <rect x={-66} y={-32} width={132} height={20} fill={C.scope} />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-64 + (i % 4) * 34} y={-4 + Math.floor(i / 4) * 20} width={26} height={14} rx={3} fill={KRP.white} stroke={C.ink} strokeWidth={2} />)}
        </g>
        {/* 伝票 (書いている1枚) */}
        <polygon points="840,744 1100,744 1124,808 820,808" fill={C.slipPink} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        {Array.from({ length: lines }, (_, i) => (
          <path key={i} d={`M ${856 + (i % 2) * 6} ${758 + i * 10} q 12 -6 24 0 t 24 0 t 24 0 t 24 0 t 24 0`} fill="none" stroke={C.ink} strokeWidth={2.5} />
        ))}
        {/* 腕 (黒いアームカバー)。ひじは机のへり */}
        <L4cLimb pts={[[860, 724], [910, 780]]} w={34} fill={C.armCover} />
        <circle cx={914} cy={784} r={17} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <L4cLimb pts={[[1060, 724], [wx + 6, wy - 6]]} w={34} fill={C.armCover} />
        <circle cx={wx} cy={wy} r={18} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <line x1={wx - 6} y1={wy - 30} x2={wx - 20} y2={wy + 26} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {/* 痛みのぎざぎざ (手首・腕・肩) */}
        <g opacity={pain}>
          <Zig x={wx + 28} y={wy - 24} r={-30} />
          <Zig x={wx + 24} y={wy + 14} r={20} />
          <Zig x={1080} y={736} r={-60} s={0.9} />
          <Zig x={1076} y={650} r={-20} s={1.1} />
          <Zig x={1100} y={680} r={10} s={0.9} />
          <circle cx={wx} cy={wy} r={36 + Math.sin(f / 2) * 4} fill="none" stroke={KRP.red} strokeWidth={4} strokeDasharray="8 8" />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#176 【並】 そして、心を落ち着かせる柔らかさも、どんどん大きくなっていきます。
// 設計: 道しるべ (#167 と同じ) の「心を落ち着かせる」の矢印が光り、その先にクッションが小さい → 大きいと f で順に大きくなって並ぶ
// どこ: #172 と同じ分かれ道。カメラは右の道 (家の方) へ振ってある。3本の矢印 (手を守る も付いたまま)。
// 演出: 「心を落ち着かせる」の矢印が光り、光の粒が右の野原へ流れて、その先にクッション → 座ぶとん → 袋の椅子 → 大きな袋ソファ と、小さい順にぽん・ぽん・ぽんと出て並ぶ。旅の人は右を指して笑う。
// 動き: f6〜18 下の矢印が光る・f12/18/24/30 クッションが順に出る (出るたびに弾む)・光の粒が流れる・カメラが右へパン。
const L4cCushion: React.FC<{ kind: number; x: number; y: number; t: number; f: number }> = ({ kind, x, y, t, f }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  const jig = Math.sin(f / 5 + kind) * 0.02;
  return (
    <g transform={`translate(${x} ${y}) scale(${p * (1 + jig)} ${p * (1 - jig)})`}>
      <ellipse cx={0} cy={4} rx={[60, 90, 140, 200][kind]} ry={14} fill={C.ink} opacity={0.18} />
      {kind === 0 && (
        <g>
          <path d="M -48 -4 Q -60 -50 -46 -96 Q 0 -86 46 -96 Q 60 -50 48 -4 Q 0 -14 -48 -4 Z" fill={C.flagRed} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={0} cy={-50} r={7} fill={C.ink} />
        </g>
      )}
      {kind === 1 && (
        <g>
          <path d="M -86 0 Q -96 -30 -80 -60 Q 0 -74 80 -60 Q 96 -30 86 0 Q 0 10 -86 0 Z" fill={C.teal} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -60 -30 Q 0 -40 60 -30" fill="none" stroke={C.tealDark} strokeWidth={4} />
          {[-40, 0, 40].map((sx) => <circle key={sx} cx={sx} cy={-34} r={5} fill={C.tealDark} />)}
        </g>
      )}
      {kind === 2 && (
        <g>
          <path d="M -130 0 Q -150 -80 -90 -150 Q -40 -220 0 -224 Q 40 -220 90 -150 Q 150 -80 130 0 Q 0 14 -130 0 Z" fill={C.mustard} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -60 -160 Q -90 -90 -80 -10" fill="none" stroke={C.mustardDark} strokeWidth={4} />
          <path d="M -50 -170 Q -30 -200 0 -206" fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.6} />
        </g>
      )}
      {kind === 3 && (
        <g>
          <path d="M -190 0 Q -214 -120 -160 -220 Q -80 -320 20 -310 Q 150 -300 190 -200 Q 214 -100 190 0 Q 0 16 -190 0 Z" fill={YP.sqBody} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={10} cy={-140} rx={120} ry={66} fill={YP.sqDeep} opacity={0.55} />
          <path d="M -150 -200 Q -100 -270 -20 -290" fill="none" stroke={YP.sqShine} strokeWidth={16} strokeLinecap="round" opacity={0.8} />
          <path d="M -120 -40 Q -110 -220 20 -280" fill="none" stroke={YP.sqDent} strokeWidth={4.5} strokeDasharray="12 10" />
          <rect x={140} y={-80} width={34} height={22} rx={5} fill={YP.sqDeep} stroke={C.ink} strokeWidth={3.5} />
        </g>
      )}
    </g>
  );
};
const Yw176: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(-140, -330, easeInOut(seg(f, 0, 36)));
  const bot = easeInOut(seg(f, 6, 18));
  const xs = [1300, 1480, 1730, 2020];
  const ts = [seg(f, 12, 20), seg(f, 18, 26), seg(f, 24, 32), seg(f, 30, 40)];
  return (
    <Frame f={f} seed={3176} bg={C.sky}>
      <g transform={`translate(${pan} 0)`}>
        <L4cSignpost f={f} bot={bot} hand={1}>
          {/* 光の粒の道 (矢印の先 → クッションの列) */}
          {bot > 0.3 && Array.from({ length: 6 }, (_, k) => {
            const tt = ((f + k * 6) % 36) / 36;
            const px = lerp(1520, 2100, tt), py = 456 + Math.sin(tt * Math.PI) * -40 + tt * 200;
            return <circle key={k} cx={px} cy={py} r={10} fill={YP.glowCore} stroke={C.ink} strokeWidth={2.5} opacity={bot * (1 - tt * 0.6)} />;
          })}
          {xs.map((x, i) => <L4cCushion key={i} kind={i} x={x} y={800} t={ts[i]} f={f} />)}
          {/* 大きくなる矢じるし (床の小さな → ) */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${xs[i] + 70 + i * 30} 830 l 30 0 m -12 -10 l 12 10 l -12 10`} fill="none" stroke={C.meadowDark}
              strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={ts[i + 1]} />
          ))}
          <ellipse cx={1070} cy={904} rx={80} ry={12} fill={C.ink} opacity={0.18} />
          <Person x={1070} y={900} s={1.1} f={f} phase={5} face={f >= 14 ? "joy" : "normal"} gaze={[6, -2]}
            pose={f >= 14 ? "point" : "stand"} pointDir={1} cloth={C.knit} clothDark={C.knitDark} hair="cap" />
        </L4cSignpost>
      </g>
    </Frame>
  );
};

// ---- 文#177 【山】 1968年、イタリアで、ビーンバッグチェアの「サッコ」が生まれました。
// 設計: 1960年代末のイタリアのデザイン事務所 (大きな窓・製図台・ミラノの街並み)。床に洋梨の形の大きな袋の椅子。若いデザイナー3人 (Person、60年代の服) がそれを囲んで喜ぶ。札「1968年」「イタリア」「サッコ」。イタリアの国旗
// どこ: 1968年ミラノのデザイン事務所。大きな格子窓の向こうにドゥオーモの尖塔群と細長いピレッリの塔。右に製図台 (洋梨の下書き)、壁にイタリアの国旗。テラゾーの床。
// 演出: 床の真ん中で、オレンジの洋梨形の大きな袋の椅子が、最後の粒を詰め終えてぷくっとふくらむ。白い粒がこぼれ散る。60年代の服の若いデザイナー3人がばんざい・指さし・手を挙げて喜ぶ。
// 動き: f4〜16 袋がふくらんで弾む (その後もぷるぷる)・粒が飛んで落ちる・f12〜 3人が喜ぶ・旗がはためく・カメラは寄りから少し引く。
const Yw177: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.08, 1.0, easeInOut(seg(f, 0, 40)));
  const grow = seg(f, 4, 16);
  const sy = lerp(0.72, 1, pop(grow)) + Math.sin(f / 3) * 0.015 * (1 - seg(f, 16, 42) * 0.5);
  const sx = 1 + (1 - sy) * 0.6;
  const cheer = f >= 12;
  const pear = "M -250 0 Q -300 -40 -280 -140 Q -250 -260 -150 -330 Q -90 -400 -64 -470 Q -44 -530 0 -536 Q 44 -530 64 -470 Q 90 -400 150 -330 Q 250 -260 280 -140 Q 300 -40 250 0 Q 0 14 -250 0 Z";
  return (
    <Frame f={f} seed={3177} bg={C.studioWall}>
      <g transform={cam(960, 520, z)}>
        <rect x={-100} y={-100} width={W + 200} height={820} fill={C.studioWall} />
        {/* 大きな格子窓とミラノの街 */}
        <rect x={130} y={110} width={1150} height={480} fill={C.milanSky} stroke={C.ink} strokeWidth={8} />
        <g>
          {/* ピレッリの塔 */}
          <path d="M 1080 590 L 1070 200 Q 1110 180 1150 200 L 1140 590 Z" fill={C.hangar} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={1074} y1={230 + i * 30} x2={1146} y2={230 + i * 30} stroke={C.hangarDark} strokeWidth={3} />)}
          {/* ドゥオーモ */}
          <path d="M 360 590 L 360 420 L 520 360 L 680 420 L 680 590 Z" fill={C.duomo} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          {Array.from({ length: 11 }, (_, i) => {
            const sx2 = 370 + i * 30;
            const h = i === 5 ? 250 : 60 + (5 - Math.abs(i - 5)) * 16;
            const base = 420 - (5 - Math.abs(i - 5)) * 12;
            return <path key={i} d={`M ${sx2 - 6} ${base} L ${sx2} ${base - h} L ${sx2 + 6} ${base} Z`} fill={C.duomo} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />;
          })}
          <circle cx={520} cy={420 - 60 - 250 + 6} r={9} fill={YP.brass} stroke={C.ink} strokeWidth={3} />
          {[400, 460, 580, 640].map((wx) => <path key={wx} d={`M ${wx - 14} 590 L ${wx - 14} 490 Q ${wx} 466 ${wx + 14} 490 L ${wx + 14} 590 Z`} fill={C.hangarDark} stroke={C.ink} strokeWidth={3} />)}
          {/* 手前の屋根並み */}
          <path d="M 130 590 L 130 520 L 230 520 L 230 490 L 330 490 L 330 540 L 760 540 L 760 500 L 900 500 L 900 530 L 1040 530 L 1040 480 L 1280 480 L 1280 590 Z" fill={C.flagRed} opacity={0.55} stroke={C.ink} strokeWidth={4} />
        </g>
        {[417, 705, 993].map((gx) => <line key={gx} x1={gx} y1={110} x2={gx} y2={590} stroke={C.ink} strokeWidth={8} />)}
        <line x1={130} y1={330} x2={1280} y2={330} stroke={C.ink} strokeWidth={8} />
        <rect x={110} y={590} width={1190} height={24} fill={C.board} stroke={C.ink} strokeWidth={5} />
        {/* 壁の国旗と札 */}
        <rect x={1356} y={130} width={10} height={170} fill={C.metalDark} stroke={C.ink} strokeWidth={3} />
        <L4cFlag x={1366} y={136} w={170} h={110} f={f} kind="it" />
        <TagPlate x={1450} y={330} text="イタリア" size={40} t={seg(f, 2, 10)} />
        <TagPlate x={560} y={175} text="1968年" size={48} t={seg(f, 2, 10)} />
        {/* 製図台 (洋梨の下書き) */}
        <g transform="translate(1745 390) scale(0.78)">
          <path d="M -40 230 L 0 60 L 40 230" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <g transform="rotate(-18)">
            <rect x={-170} y={-110} width={340} height={210} rx={6} fill={C.board} stroke={C.ink} strokeWidth={6} />
            <path d="M -40 70 Q -80 60 -70 20 Q -60 -20 -30 -40 Q -12 -70 0 -80 Q 12 -70 30 -40 Q 60 -20 70 20 Q 80 60 40 70 Z" fill="none" stroke={C.saccoDark} strokeWidth={4} strokeDasharray="10 6" />
            <line x1={-160} y1={92} x2={160} y2={92} stroke={C.shelf} strokeWidth={10} />
            <rect x={-170} y={-110} width={30} height={210} fill={C.shelf} stroke={C.ink} strokeWidth={4} />
          </g>
        </g>
        {/* テラゾーの床 */}
        <rect x={-100} y={700} width={W + 200} height={500} fill={C.terrazzo} />
        <path d="M -100 700 L 2020 700" stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={rnd(1771, i) * 2000 - 40} cy={712 + rnd(1772, i) * 360} r={3 + rnd(1773, i) * 5} fill={C.terrazzoDot} opacity={0.7} />
        ))}
        {/* 空になった粒の紙袋 */}
        <g transform="translate(220 840) rotate(-14)">
          <path d="M -70 0 L -60 -120 L 60 -130 L 70 0 Z" fill={C.kraft} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -60 -120 L -40 -150 L 40 -156 L 60 -130" fill={C.kraftDark} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>粒</text>
        </g>
        {/* サッコ */}
        <ellipse cx={960} cy={846} rx={300 * sx} ry={26} fill={C.ink} opacity={0.2} />
        <g transform={`translate(960 840) scale(${sx} ${sy})`}>
          <path d={pear} fill={C.sacco} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          <path d="M -120 -20 Q -170 -200 -60 -460" fill="none" stroke={C.saccoDark} strokeWidth={5} />
          <path d="M 120 -20 Q 170 -200 60 -460" fill="none" stroke={C.saccoDark} strokeWidth={5} />
          <path d="M 0 -10 L 0 -520" fill="none" stroke={C.saccoDark} strokeWidth={4} opacity={0.6} />
          <path d="M -200 -230 Q -150 -320 -80 -350" fill="none" stroke={C.saccoShine} strokeWidth={22} strokeLinecap="round" opacity={0.8} />
          <circle cx={-210} cy={-160} r={12} fill={C.saccoShine} opacity={0.8} />
          <ellipse cx={10} cy={-250} rx={130} ry={56} fill={C.saccoDark} opacity={0.35} />
          <path d="M -110 -232 Q 10 -190 130 -236" fill="none" stroke={C.saccoDark} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={0} cy={-528} rx={30} ry={10} fill={C.saccoDark} stroke={C.ink} strokeWidth={4} />
        </g>
        <TagPlate x={1150} y={640} text="サッコ" size={46} t={seg(f, 14, 22)} rot={-6} />
        {/* こぼれ飛ぶ粒 */}
        {Array.from({ length: 14 }, (_, i) => {
          const t0 = 6 + (i % 5) * 2;
          const tt = clamp01((f - t0) / 22);
          if (tt <= 0) return null;
          const vx = (rnd(1774, i) - 0.5) * 1400;
          const px = 960 + vx * tt;
          const py = 300 - 300 * tt + 860 * tt * tt;
          return <circle key={i} cx={px} cy={Math.min(py, 820 + (i % 3) * 14)} r={7} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />;
        })}
        {/* 若いデザイナー3人 */}
        <ellipse cx={470} cy={884} rx={86} ry={13} fill={C.ink} opacity={0.18} />
        <Person x={470} y={880} s={1.25} f={f} phase={1} face={cheer ? "joy" : "surprised"} gaze={[6, -2]}
          pose={cheer ? "banzai" : "stand"} cloth={C.mustard} clothDark={C.mustardDark} hair="cap" />
        <ellipse cx={1420} cy={884} rx={86} ry={13} fill={C.ink} opacity={0.18} />
        <Person x={1420} y={880} s={1.25} f={f} phase={4} face={cheer ? "joy" : "smile"} gaze={[-6, -2]}
          pose={cheer ? "point" : "stand"} pointDir={-1} cloth={C.teal} clothDark={C.tealDark} hair="cap" />
        <ellipse cx={1690} cy={874} rx={80} ry={12} fill={C.ink} opacity={0.18} />
        <Person x={1690} y={870} s={1.15} f={f} phase={8} face={cheer ? "smile" : "surprised"} gaze={[-6, 0]} glasses
          pose={cheer ? "raise" : "stand"} cloth={C.purple} clothDark={C.purpleDark} hair="cap" />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_168: (f) => <Yw168 f={f} />,
  yw_169: (f) => <Yw169 f={f} />,
  yw_170: (f) => <Yw170 f={f} />,
  yw_171: (f) => <Yw171 f={f} />,
  yw_172: (f) => <Yw172 f={f} />,
  yw_173: (f) => <Yw173 f={f} />,
  yw_174: (f) => <Yw174 f={f} />,
  yw_175: (f) => <Yw175 f={f} />,
  yw_176: (f) => <Yw176 f={f} />,
  yw_177: (f) => <Yw177 f={f} />,
};

export const YW_F3_MOTIFS: string[] = [
  "yw_168",
  "yw_169",
  "yw_170",
  "yw_171",
  "yw_172",
  "yw_173",
  "yw_174",
  "yw_175",
  "yw_176",
  "yw_177",
];

export const yawaF3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
