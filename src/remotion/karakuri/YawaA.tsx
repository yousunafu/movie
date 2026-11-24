// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#1〜#10 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed はこのファイルでは 2000〜2009。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Squishy/DameSofa/AgeDial/KaradaChizu) は設計書で指定された文でだけ使う

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
  // 子ども2人 (#2 と #4 で同じ色)
  kidA: "#E49A6B", kidADark: "#B8714A",
  kidB: "#7BAFC9", kidBDark: "#56899F",
  capYellow: "#F4D03F", capYellowDark: "#D2AE22",
  rando: "#B8433A", randoDark: "#8E2F28",
  skin: "#F2C9A8", skinDark: "#D9A47F", nail: "#F8E3D6",
  // #1 学校の廊下
  schoolWall: "#F3EBD3", schoolWain: "#C9A77A",
  cork: "#C99A63", corkDot: "#A27546", boardWood: "#8E5F33",
  floorWood: "#D9B47F", floorWoodDark: "#B48A55",
  sunBand: "#FFF4C8",
  // #2 夜の子ども部屋
  nightWall: "#47507A", nightWallDark: "#353D63", nightSky: "#1F2547",
  nightFloor: "#6A5A4E", lamp: "#FFC977", lampCore: "#FFE9B8",
  phone: "#2B2A33", screen: "#F6F2EA", screenBar: "#3A3946",
  deskWood: "#B88A5A", deskWoodDark: "#8E643C",
  // #3-4 玄関
  genkanWall: "#EFE3CB", hallFloor: "#C79B63", kamachi: "#7E5530",
  tile: "#B9B2A6", tileLine: "#9C958A", frost: "#DCE6E8", frostDark: "#B9C7CB",
  box: "#D2A56B", boxDark: "#A97C45", boxTop: "#DDB57F", tape: "#E6C88A",
  kraft: "#B98B57", kraftDark: "#93683B",
  // #6 夜のオフィス
  officeWall: "#59617A", officeNight: "#232947", building: "#353C5C", winLit: "#F5D57A",
  shirt: "#F4F3EE", shirtDark: "#D5D3CB", tie: "#C0504D",
  pcBody: "#C9CDD2", paper: "#FBF8F0", mug: "#E9E2D2", sticky: "#F7E37A",
  // #7-8 リビング
  livingWall: "#F4E5C8", livingFloor: "#D3AE7C", rug: "#D98C6E", rugDark: "#B96D52",
  curtain: "#E7B85C", curtainDark: "#C99A3E", plant: "#6FA15A", plantDark: "#4F7E3E",
  pot: "#C77A4E", tvBlack: "#2E2E36", tvStand: "#9C7449", lounge: "#9DB7A0", loungeDark: "#7A9680",
  remote: "#4A4A55",
  // #9-10 雑貨店
  awningA: "#D96A5A", awningB: "#FBF5EA", shopWall: "#E9D9BC", glass: "#D7E8EC",
  pave: "#CFC6B8", paveLine: "#ADA393", cushion: "#9CC7A8", cushionDark: "#77A585",
  bear: "#C99B6B", bearDark: "#A47A4E", slipper: "#F3E7F0", slipperDark: "#D8C3D3",
  register: "#E8E4DA", lcd: "#C9D9B0", lcdDark: "#2F3A2A", apron: "#4E7F6A", apronDark: "#3A6252",
  coat: "#8C7A9E", coatDark: "#6B5B7E", basket: "#D9573F", money: "#B9D3A6", tray: "#7FA8C9",
};
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void YP; void Squishy; void DameSofa; void AgeDial; void KaradaChizu;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// ゆっくり入って・ゆっくり止まる (寄りのカメラ用)
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;

// カメラ: (cx,cy) を中心に z 倍、(dx,dy) だけずらす
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;

// 子ども (Person に黄色い通学帽とランドセルを足す)。体のゆれは Person と同じ式で合わせる
const YaKid: React.FC<{
  x: number; y: number; s: number; f: number; cloth: string; clothDark: string;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";
  cap?: boolean; bag?: boolean; phase?: number; lean?: number; gaze?: [number, number];
}> = ({ x, y, s, f, cloth, clothDark, face = "normal", pose = "stand", cap, bag, phase = 0, lean = 0, gaze }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const tr = `translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`;
  return (
    <g>
      {bag && (
        <g transform={tr}>
          <rect x={-74} y={-170} width={148} height={118} rx={24} fill={C.rando} stroke={C.ink} strokeWidth={5} />
          <rect x={-74} y={-170} width={148} height={30} rx={15} fill={C.randoDark} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
      <Person x={x} y={y} s={s} f={f} cloth={cloth} clothDark={clothDark} face={face} pose={pose}
        phase={phase} lean={lean} gaze={gaze} />
      {bag && (
        <g transform={tr} strokeLinecap="round">
          {[-40, 40].map((sx) => (
            <g key={sx}>
              <line x1={sx} y1={-160} x2={sx * 0.9} y2={-72} stroke={C.ink} strokeWidth={16} />
              <line x1={sx} y1={-160} x2={sx * 0.9} y2={-72} stroke={C.rando} strokeWidth={9} />
            </g>
          ))}
          <rect x={-46} y={-124} width={16} height={12} rx={3} fill={KRP.brass} stroke={C.ink} strokeWidth={2.5} />
        </g>
      )}
      {cap && (
        <g transform={tr}>
          <path d="M -68 -236 Q -70 -306 0 -308 Q 70 -306 68 -236 Z" fill={C.capYellow} stroke={C.ink} strokeWidth={5} />
          <path d="M -66 -252 Q 0 -262 66 -252" fill="none" stroke={C.capYellowDark} strokeWidth={7} />
          <ellipse cx={0} cy={-238} rx={80} ry={11} fill={C.capYellow} stroke={C.ink} strokeWidth={4.5} />
          <circle cx={0} cy={-305} r={6} fill={C.capYellowDark} stroke={C.ink} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// 大きな手 (指先が -x 方向を向く。袖は +x 側)。open: 0=にぎり 1=開く
export const YaHand: React.FC<{ x: number; y: number; s?: number; rot?: number; sleeve?: string; open?: number }> = ({
  x, y, s = 1, rot = 0, sleeve = C.kidA, open = 1,
}) => {
  const spread = lerp(2, 9, open);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* 袖 */}
      <rect x={70} y={-70} width={420} height={140} rx={30} fill={sleeve} stroke={C.ink} strokeWidth={6} />
      <rect x={62} y={-76} width={46} height={152} rx={16} fill={sleeve} stroke={C.ink} strokeWidth={6} />
      <path d="M 180 -60 Q 200 0 180 60" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
      {/* 指4本 (少しずつ開く) */}
      {[-42, -14, 14, 40].map((dy, i) => {
        const len = [92, 108, 104, 84][i];
        return (
          <g key={i} transform={`rotate(${(i - 1.5) * spread} 0 ${dy})`}>
            <rect x={-len - 20} y={dy - 13} width={len + 40} height={26} rx={13} fill={C.skin} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={-len - 4} cy={dy} rx={11} ry={8} fill={C.nail} stroke={C.ink} strokeWidth={2.5} />
            <path d={`M ${-len * 0.45} ${dy - 9} q 4 9 0 18`} fill="none" stroke={C.skinDark} strokeWidth={3} />
          </g>
        );
      })}
      {/* 手のひら */}
      <path d="M -40 -58 Q 40 -70 76 -44 L 76 50 Q 30 70 -40 56 Q -56 0 -40 -58 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} />
      {/* 親指 */}
      <g transform={`rotate(${lerp(10, -22, open)} 40 -50)`}>
        <rect x={-24} y={-104} width={30} height={78} rx={15} fill={C.skin} stroke={C.ink} strokeWidth={5}
          transform="rotate(-38 -9 -65)" />
      </g>
      <path d="M 0 -20 Q 24 -6 46 -16" fill="none" stroke={C.skinDark} strokeWidth={3} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#1 【並】 いきなりですが、クイズです。
// どこ: 小学校の廊下。3年2組の前の掲示板 (コルク板・木の枠)。木の床と窓からの光の帯
// 演出: 時間割・図工の絵2枚・給食だよりの真ん中に、赤い Q 札がぽんと貼られ、赤い画鋲が上から刺さる
// 動き: f6〜18 Q がぽん / f14〜20 画鋲が落ちて刺さる / f19〜27 衝撃線 / f18〜30 右下の子が振り向く / カメラは全体→Q へ寄る
const Yw001: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1, 1.1, easeInOut(seg(f, 0, 42)));
  const qT = seg(f, 6, 18);
  const pinT = seg(f, 14, 20);
  const pinY = lerp(-80, 236, pinT * pinT);
  const hit = seg(f, 19, 27);
  const turn = easeOut(seg(f, 18, 30));
  const subj = ["#F2A7A0", "#9FC8E8", "#A8D5A0", "#F5D77A", "#D4B5E0"];
  return (
    <Frame f={f} seed={2000} bg={C.schoolWall}>
      <g transform={cam(960, 380, zoom)}>
        {/* 壁と腰板 */}
        <rect x={-40} y={-40} width={W + 80} height={700} fill={C.schoolWall} />
        <rect x={-40} y={620} width={W + 80} height={60} fill={C.schoolWain} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150} y1={622} x2={i * 150} y2={678} stroke={C.ink} strokeWidth={3} opacity={0.35} />
        ))}
        {/* 床 (木の板) */}
        <rect x={-40} y={680} width={W + 80} height={460} fill={C.floorWood} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-40} y1={720 + i * 70} x2={W + 40} y2={720 + i * 70} stroke={C.floorWoodDark} strokeWidth={4} />
        ))}
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={(i * 260 + (i % 6) * 97) % 2000} y1={720 + (i % 6) * 70}
            x2={(i * 260 + (i % 6) * 97) % 2000} y2={790 + (i % 6) * 70} stroke={C.floorWoodDark} strokeWidth={3} />
        ))}
        {/* 反対側の窓から差し込む光の帯 (床と壁) */}
        {[0, 1, 2].map((i) => (
          <polygon key={i} points={`${80 + i * 620},1080 ${300 + i * 620},1080 ${420 + i * 620},680 ${240 + i * 620},680`}
            fill={C.sunBand} opacity={0.4 + Math.sin(f / 14 + i) * 0.05} />
        ))}
        {/* 廊下のポスター (走らない) */}
        <g transform="rotate(-2 150 280)">
          <rect x={70} y={180} width={160} height={210} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <circle cx={150} cy={265} r={52} fill="none" stroke={KRP.red} strokeWidth={9} />
          <circle cx={150} cy={238} r={10} fill={C.ink} />
          <path d="M 150 250 L 140 278 L 124 296 M 140 278 L 160 296 M 146 258 L 126 266 M 146 258 L 170 252" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          <line x1={114} y1={229} x2={186} y2={301} stroke={KRP.red} strokeWidth={9} />
          {/* 「はしらない」の文字はカメラの寄りで画面の左端に切れるので外した (絵文字の禁止マークだけで伝わる。検品で修正) */}
          <rect x={92} y={332} width={116} height={34} rx={6} fill={KRP.red} opacity={0.85} />
        </g>
        {/* 教室の札 */}
        <g transform={`rotate(${Math.sin(f / 16) * 1.5} 1540 50)`}>
          <line x1={1540} y1={0} x2={1540} y2={50} stroke={C.ink} strokeWidth={5} />
          <rect x={1450} y={50} width={180} height={62} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <text x={1540} y={94} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>3年2組</text>
        </g>
        {/* 掲示板: 木の枠とコルク */}
        <rect x={246} y={106} width={1428} height={508} rx={8} fill={C.boardWood} stroke={C.ink} strokeWidth={8} />
        <rect x={272} y={132} width={1376} height={456} fill={C.cork} stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 220 }, (_, i) => (
          <circle key={i} cx={280 + rnd(11, i) * 1360} cy={140 + rnd(12, i) * 440} r={2 + rnd(13, i) * 3}
            fill={C.corkDot} opacity={0.7} />
        ))}
        {/* 時間割 */}
        <g transform="rotate(-1.5 480 360)">
          <rect x={320} y={170} width={330} height={380} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <text x={485} y={214} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>じかんわり</text>
          {["月", "火", "水", "木", "金"].map((d, i) => (
            <text key={d} x={366 + i * 60} y={254} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink}>{d}</text>
          ))}
          {Array.from({ length: 25 }, (_, k) => {
            const c = k % 5, r = Math.floor(k / 5);
            return (
              <rect key={k} x={340 + c * 60} y={266 + r * 52} width={52} height={44} rx={4}
                fill={subj[(k * 3 + r) % 5]} stroke={C.ink} strokeWidth={2.5} />
            );
          })}
          {[[334, 184], [636, 184]].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={10} fill={i ? KRP.blueDeep : KRP.green} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 図工の絵1: 家とお日さま (クレヨン) */}
        <g transform="rotate(2 1225 255)">
          <rect x={1110} y={168} width={230} height={170} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <circle cx={1300} cy={208} r={22} fill={KRP.orange} stroke={C.ink} strokeWidth={3} />
          <polygon points="1150,262 1200,214 1250,262" fill={KRP.red} stroke={C.ink} strokeWidth={3} />
          <rect x={1160} y={262} width={80} height={56} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
          <rect x={1190} y={284} width={20} height={34} fill={C.boardWood} />
          <path d="M 1120 322 Q 1220 306 1330 322" stroke={KRP.green} strokeWidth={8} fill="none" />
          <circle cx={1225} cy={176} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 図工の絵2: 金魚 */}
        <g transform="rotate(-2.5 1225 460)">
          <rect x={1110} y={378} width={230} height={170} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={1215} cy={466} rx={52} ry={32} fill={KRP.orange} stroke={C.ink} strokeWidth={3.5} />
          <polygon points="1265,466 1306,436 1306,496" fill={KRP.orange} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={1190} cy={458} r={6} fill={C.ink} />
          {[0, 1, 2].map((i) => <circle key={i} cx={1160 - i * 6} cy={430 - i * 24} r={6 + i * 2} fill="none" stroke={KRP.white} strokeWidth={3} />)}
          <circle cx={1225} cy={386} r={9} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 給食だより */}
        <g transform="rotate(1.2 1495 360)">
          <rect x={1380} y={170} width={232} height={380} fill="#FFF8E6" stroke={C.ink} strokeWidth={5} />
          <rect x={1380} y={170} width={232} height={50} fill={KRP.green} stroke={C.ink} strokeWidth={4} />
          <text x={1496} y={206} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.white}>きゅうしょくだより</text>
          <ellipse cx={1496} cy={282} rx={70} ry={20} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <path d="M 1426 282 Q 1496 350 1566 282" fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <path d="M 1470 262 q 6 -14 0 -26 M 1500 262 q 6 -14 0 -26" stroke={KRP.grayDark} strokeWidth={3} fill="none" />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={1400} y1={350 + i * 26} x2={1592 - (i % 3) * 30} y2={350 + i * 26} stroke={KRP.grayDark} strokeWidth={4} />
          ))}
          <circle cx={1496} cy={180} r={9} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* Q 札 (ぽんと貼られる) */}
        <g transform={`rotate(${lerp(-14, -3, qT)} 960 370)`}>
          <QuizQ f={f} x={960} y={370} s={1.1} t={qT} />
        </g>
        {/* 赤い画鋲 (上から落ちて刺さる) */}
        {pinT > 0 && (
          <g transform={`translate(960 ${pinY})`}>
            <ellipse cx={4} cy={14} rx={18} ry={6} fill={C.ink} opacity={0.2 * hit} />
            <rect x={-4} y={4} width={8} height={10} fill={KRP.gray} stroke={C.ink} strokeWidth={2} />
            <ellipse cx={0} cy={0} rx={22} ry={14} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
            <ellipse cx={-6} cy={-4} rx={7} ry={4} fill={KRP.white} opacity={0.7} />
          </g>
        )}
        {hit > 0 && hit < 1 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - hit}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r1 = 34 + hit * 20, r2 = 58 + hit * 36;
              return <line key={i} x1={960 + Math.cos(a) * r1} y1={236 + Math.sin(a) * r1}
                x2={960 + Math.cos(a) * r2} y2={236 + Math.sin(a) * r2} />;
            })}
          </g>
        )}
        {/* 振り向く小学生 (通学帽+ランドセル) */}
        <ellipse cx={1440} cy={900} rx={84} ry={16} fill={C.ink} opacity={0.18} />
        <YaKid x={1440} y={900} s={1.0} f={f} cloth={C.kidA} clothDark={C.kidADark}
          face={turn > 0.4 ? "surprised" : "normal"} cap bag lean={lerp(4, -10, turn)} gaze={[-6, -5]} />
        {turn > 0.5 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={turn}>
            <line x1={1340} y1={560} x2={1308} y2={534} />
            <line x1={1330} y1={600} x2={1290} y2={596} />
            <line x1={1370} y1={530} x2={1356} y2={492} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#2 【山】 いま、小学生のあいだで、ライブ配信が始まるたびに売り切れているものがあります。
// どこ: 夜の子ども部屋。窓の月と星・二段ベッド・壁のカレンダー・勉強机・常夜灯
// 演出: 机に立てた大きなスマホでライブ配信。「?」の箱。在庫が 12→0 になり「売り切れ」がドン。左右の子どもが食いつく
// 動き: f8〜34 在庫がカタカタ減る / f34 売り切れスタンプ+スマホがびりっ / 子Aは万歳、子Bはのけぞる / コメントが流れる / カメラはスマホへ寄る
const Yw002: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1, 1.08, easeInOut(seg(f, 0, 42)));
  const left = Math.max(0, 12 - Math.floor(seg(f, 8, 34) * 12.99));
  const sold = f >= 34;
  const st = seg(f, 34, 38);
  const shake = f >= 34 && f < 41 ? Math.sin(f * 3.1) * 10 * (1 - seg(f, 34, 41)) : 0;
  const tick = left > 0 && f >= 8 && f < 34 ? Math.sin(f * 2.4) * 2 : 0;
  const comments = ["!!", "はやい", "まって", "ほしい", "!!!", "えっ"];
  return (
    <Frame f={f} seed={2001} bg={C.nightWall} dark>
      <g transform={cam(960, 460, zoom)}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={W + 80} height={820} fill={C.nightWall} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 170} y1={-40} x2={i * 170} y2={780} stroke={C.nightWallDark} strokeWidth={4} opacity={0.5} />
        ))}
        <rect x={-40} y={760} width={W + 80} height={360} fill={C.nightFloor} />
        {/* 常夜灯の暖かい光 (部屋全体に広がる) */}
        {[520, 380, 240].map((r, i) => (
          <circle key={i} cx={330} cy={600} r={r} fill={C.lamp} opacity={0.07 + i * 0.05} />
        ))}
        {/* 窓: 月と星 */}
        <rect x={100} y={80} width={340} height={320} fill={C.nightSky} stroke={C.ink} strokeWidth={8} />
        <circle cx={330} cy={170} r={50} fill={KRP.yellow} />
        <circle cx={352} cy={154} r={46} fill={C.nightSky} />
        {Array.from({ length: 9 }, (_, i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 7 + i * 1.7));
          return <circle key={i} cx={130 + rnd(21, i) * 280} cy={110 + rnd(22, i) * 260} r={3 + rnd(23, i) * 4} fill={KRP.white} opacity={tw} />;
        })}
        <line x1={270} y1={80} x2={270} y2={400} stroke={C.ink} strokeWidth={8} />
        <line x1={100} y1={240} x2={440} y2={240} stroke={C.ink} strokeWidth={8} />
        <path d="M 70 70 Q 110 240 80 420 L 40 420 L 40 70 Z" fill={C.kidB} stroke={C.ink} strokeWidth={5} />
        <path d="M 470 70 Q 430 240 460 420 L 500 420 L 500 70 Z" fill={C.kidB} stroke={C.ink} strokeWidth={5} />
        {/* カレンダー */}
        <g transform="rotate(2 1560 170)">
          <rect x={1470} y={70} width={180} height={210} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={1470} y={70} width={180} height={50} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <text x={1560} y={108} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>11</text>
          {Array.from({ length: 20 }, (_, k) => (
            <rect key={k} x={1484 + (k % 5) * 32} y={132 + Math.floor(k / 5) * 34} width={24} height={24} fill={KRP.paperCool} stroke={C.ink} strokeWidth={1.5} />
          ))}
          <circle cx={1580} cy={212} r={17} fill="none" stroke={KRP.red} strokeWidth={5} />
        </g>
        {/* 二段ベッド (右端) */}
        <rect x={1700} y={200} width={34} height={900} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
        <rect x={1700} y={330} width={260} height={40} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
        <path d="M 1734 330 Q 1760 280 1840 290 Q 1920 300 1960 300 L 1960 330 Z" fill={C.kidA} stroke={C.ink} strokeWidth={5} />
        <rect x={1700} y={660} width={260} height={40} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
        <path d="M 1734 660 Q 1780 610 1900 620 L 1960 620 L 1960 660 Z" fill={C.kidB} stroke={C.ink} strokeWidth={5} />
        {[420, 500, 580].map((ly) => <rect key={ly} x={1734} y={ly} width={60} height={14} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={3} />)}
        {/* 子ども2人 (机の向こうに座って身を乗り出す) */}
        <YaKid x={540} y={790} s={1.15} f={f} cloth={C.kidA} clothDark={C.kidADark}
          face={sold ? "surprised" : "joy"} pose={sold ? "banzai" : "hold"} lean={sold ? -6 : 6} gaze={[6, 2]} />
        <YaKid x={1380} y={790} s={1.15} f={f} phase={2} cloth={C.kidB} clothDark={C.kidBDark}
          face={sold ? "surprised" : "worried"} pose="hold" lean={sold ? 10 : -7} gaze={[-6, 2]} />
        {/* パジャマの水玉 */}
        {[540, 1380].map((px, j) => (
          <g key={px} transform={`translate(${px} 790) scale(1.15) rotate(${j ? (sold ? 10 : -7) : (sold ? -6 : 6)})`}>
            {[[-34, -140], [10, -120], [-20, -86], [32, -80], [36, -146]].map(([dx, dy], i) => (
              <circle key={i} cx={dx} cy={dy} r={5} fill={KRP.white} opacity={0.75} />
            ))}
          </g>
        ))}
        {/* 勉強机 (手前) */}
        <rect x={220} y={690} width={1480} height={44} rx={6} fill={C.deskWood} stroke={C.ink} strokeWidth={7} />
        <rect x={250} y={734} width={1420} height={380} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={7} />
        <rect x={700} y={770} width={520} height={110} rx={8} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
        <rect x={920} y={812} width={80} height={20} rx={10} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
        {/* ランドセル (机の横のフック) */}
        <line x1={1560} y1={740} x2={1560} y2={780} stroke={C.ink} strokeWidth={6} />
        <rect x={1490} y={780} width={140} height={150} rx={26} fill={C.rando} stroke={C.ink} strokeWidth={5} />
        <path d="M 1490 830 Q 1560 860 1630 830" fill={C.randoDark} stroke={C.ink} strokeWidth={4} />
        <rect x={1550} y={850} width={20} height={16} rx={3} fill={KRP.brass} stroke={C.ink} strokeWidth={2.5} />
        {/* 常夜灯 (机の左) */}
        <rect x={300} y={662} width={60} height={30} rx={8} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={4} />
        <path d="M 290 664 Q 330 560 370 664 Z" fill={C.lamp} stroke={C.ink} strokeWidth={5} />
        <circle cx={330} cy={630} r={16} fill={C.lampCore} />
        {/* 鉛筆立て */}
        <rect x={1220} y={610} width={56} height={82} rx={6} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => <rect key={i} x={1226 + i * 16} y={560 + i * 8} width={10} height={60} fill={[KRP.yellow, KRP.red, KRP.green][i]} stroke={C.ink} strokeWidth={2.5} />)}
        {/* スマホ (机に立てる。主役) */}
        <g transform={`translate(${shake} ${tick})`}>
          <polygon points="900,690 960,620 1020,690" fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          <rect x={650} y={262} width={620} height={384} rx={36} fill={C.phone} stroke={C.ink} strokeWidth={8} />
          <defs><clipPath id="ya2scr"><rect x={680} y={290} width={560} height={328} rx={14} /></clipPath></defs>
          <g clipPath="url(#ya2scr)">
            <rect x={680} y={290} width={560} height={328} fill={C.screen} />
            {/* 光の放射 */}
            {Array.from({ length: 12 }, (_, i) => (
              <polygon key={i} points={`890,470 ${890 + Math.cos(i * 0.52 + f / 30) * 400},${470 + Math.sin(i * 0.52 + f / 30) * 400} ${890 + Math.cos(i * 0.52 + 0.22 + f / 30) * 400},${470 + Math.sin(i * 0.52 + 0.22 + f / 30) * 400}`}
                fill={KRP.yellow} opacity={0.22} />
            ))}
            {/* 上の帯: LIVE */}
            <rect x={680} y={290} width={560} height={56} fill={C.screenBar} />
            <rect x={696} y={302} width={112} height={34} rx={6} fill={KRP.red} />
            <circle cx={712} cy={319} r={6} fill={KRP.white} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 4))} />
            <text x={766} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>LIVE</text>
            <text x={826} y={330} fontFamily={FONT} fontWeight={800} fontSize={24} fill={KRP.gray}>{`${(3.2 + f * 0.05).toFixed(1)}万人`}</text>
            {/* 「?」の箱 */}
            <g transform={`translate(890 ${500 + Math.sin(f / 5) * 4})`}>
              <polygon points="-110,-90 -70,-118 110,-118 70,-90" fill={C.boxTop} stroke={C.ink} strokeWidth={4} />
              <polygon points="70,-90 110,-118 110,6 70,34" fill={C.boxDark} stroke={C.ink} strokeWidth={4} />
              <rect x={-110} y={-90} width={180} height={124} fill={C.box} stroke={C.ink} strokeWidth={4} />
              <text x={-20} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={KRP.red} stroke={C.ink} strokeWidth={3} paintOrder="stroke">?</text>
            </g>
            {/* 下の帯: 在庫カウンタ */}
            <rect x={680} y={562} width={420} height={56} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
            <text x={700} y={602} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>残り</text>
            <text x={800} y={606} fontFamily={FONT} fontWeight={900} fontSize={44}
              fill={left <= 3 ? KRP.red : C.ink}>{left}</text>
            <rect x={880} y={580} width={200} height={20} rx={10} fill={KRP.paperCool} stroke={C.ink} strokeWidth={2.5} />
            <rect x={880} y={580} width={200 * (left / 12)} height={20} rx={10} fill={left <= 3 ? KRP.red : KRP.green} />
            {/* 右のコメント欄 */}
            <rect x={1100} y={346} width={140} height={272} fill={C.screenBar} opacity={0.12} />
            {comments.map((c, i) => {
              const cy = 610 - (((f * 5 + i * 52) % 300));
              return (
                <g key={i}>
                  <rect x={1110} y={cy - 30} width={120} height={38} rx={19} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
                  <text x={1170} y={cy - 3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={i % 2 ? KRP.red : C.ink}>{c}</text>
                </g>
              );
            })}
            {/* 売り切れスタンプ */}
            {sold && (
              <g transform={`translate(910 450) rotate(-12) scale(${lerp(1.9, 1, easeOut(st))})`} opacity={lerp(0.2, 0.94, st)}>
                <rect x={-200} y={-66} width={400} height={132} rx={14} fill={KRP.white} fillOpacity={0.6} stroke={KRP.red} strokeWidth={10} />
                <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={86} fill={KRP.red}>売り切れ</text>
              </g>
            )}
          </g>
          <circle cx={960} cy={276} r={6} fill={KRP.grayDark} />
          {/* びりっ (揺れの線) */}
          {f >= 34 && f < 42 && (
            <g stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={1 - seg(f, 34, 42)}>
              <path d="M 620 300 l -30 -10 l 10 -20 l -30 -10" fill="none" />
              <path d="M 1300 300 l 30 -10 l -10 -20 l 30 -10" fill="none" />
              <path d="M 610 600 l -40 10" fill="none" />
              <path d="M 1310 600 l 40 10" fill="none" />
            </g>
          )}
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#3 【並】 何でしょうか。
// どこ: 家の玄関。上がり框・タイルの土間・すりガラスの引き戸・靴箱・靴2足
// 演出: 框に届いた段ボール箱 (主役・幅520)。中で何かが動いて、ふたがかたかた。すき間から光と「?」。子どもの手が右下から伸びる
// 動き: ふたが f で揺れ (だんだん強く) / f10〜22 ? がのぞく / f14〜40 手が伸びる / カメラは箱へ寄る
const Yw003: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1, 1.1, easeInOut(seg(f, 0, 42)));
  const amp = lerp(0.6, 1, seg(f, 4, 30));
  const lid = Math.abs(Math.sin(f * 0.9)) * 16 * amp;
  const wob = Math.sin(f * 1.7) * 2.2 * amp;
  const hand = easeOut(seg(f, 14, 40));
  return (
    <Frame f={f} seed={2002} bg={C.genkanWall}>
      <g transform={cam(960, 480, zoom)}>
        <YaGenkan f={f} />
        {/* 段ボール箱 (上がり框の上) */}
        <ellipse cx={960} cy={640} rx={300} ry={18} fill={C.ink} opacity={0.2} />
        <g transform={`rotate(${wob * 0.4} 960 640)`}>
          <polygon points="1220,380 1290,330 1290,590 1220,640" fill={C.boxDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <rect x={700} y={380} width={520} height={260} fill={C.box} stroke={C.ink} strokeWidth={7} />
          {/* 伝票 */}
          <g transform="rotate(-2 860 510)">
            <rect x={748} y={428} width={250} height={160} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <rect x={748} y={428} width={250} height={34} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />
            {[480, 512, 544].map((ly) => <line key={ly} x1={760} y1={ly + 14} x2={986} y2={ly + 14} stroke={KRP.gray} strokeWidth={3} />)}
            <text x={762} y={570} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.ink}>品名 おもちゃ</text>
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x={762 + i * 7 + (i % 3) * 2} y={436} width={i % 2 ? 3 : 5} height={20} fill={C.ink} />)}
          </g>
          <rect x={940} y={380} width={40} height={260} fill={C.tape} opacity={0.85} />
          <text x={1110} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.boxDark}>↑↑</text>
          {/* すき間の光 */}
          <polygon points={`716,${380 - lid * 0.2} 1204,${380 - lid * 0.2} 1270,${340 - lid} 790,${340 - lid}`} fill={KRP.yellow} opacity={0.75} />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={820 + i * 90} y1={350 - lid} x2={790 + i * 100} y2={250 - lid * 3} stroke={KRP.yellow}
              strokeWidth={10} strokeLinecap="round" opacity={0.45 * amp} />
          ))}
        </g>
        {/* ? がのぞく */}
        <QMark x={990} y={330 - lid * 1.6} s={1.15} f={f} t={seg(f, 10, 22)} />
        {/* ふた (かたかた揺れる) */}
        <g transform={`translate(0 ${-lid}) rotate(${wob} 960 360)`}>
          <polygon points="700,380 780,330 1290,330 1220,380" fill={C.boxTop} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <line x1={740} y1={356} x2={1256} y2={356} stroke={C.boxDark} strokeWidth={4} />
          <polygon points="938,380 978,330 1018,330 978,380" fill={C.tape} stroke={C.ink} strokeWidth={3} />
          <polygon points="700,356 1256,356 1250,364 706,364" fill={C.tape} opacity={0.7} />
        </g>
        {/* かたかたの線 */}
        <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7 * amp}>
          <path d={`M 660 ${330 + wob * 3} l -40 -14`} />
          <path d={`M 650 ${380 - wob * 3} l -46 4`} />
          <path d={`M 1320 ${300 + wob * 3} l 40 -16`} />
          <path d={`M 1330 ${350 - wob * 3} l 46 2`} />
        </g>
        {/* 伸びてくる子どもの手 */}
        <YaHand x={lerp(1760, 1330, hand)} y={lerp(1140, 720, hand)} s={1.1} rot={40} sleeve={C.kidA} open={1} />
      </g>
    </Frame>
  );
};

// 玄関 (#3 と #4 は同じ場所・同じ時間の続き)
const YaGenkan: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 廊下の壁と床 (上がった先) */}
    <rect x={-40} y={-40} width={W + 80} height={620} fill={C.genkanWall} />
    <rect x={-40} y={480} width={W + 80} height={20} fill={C.kamachi} opacity={0.5} />
    {/* 奥のふすまの柱と掛け時計 */}
    <rect x={560} y={-40} width={30} height={520} fill={C.kamachi} stroke={C.ink} strokeWidth={4} />
    <rect x={1330} y={-40} width={30} height={520} fill={C.kamachi} stroke={C.ink} strokeWidth={4} />
    <g transform={`rotate(${Math.sin(f / 10) * 4} 1460 60)`}>
      <line x1={1460} y1={40} x2={1460} y2={150} stroke={C.ink} strokeWidth={4} />
      <rect x={1410} y={60} width={100} height={150} rx={10} fill={C.kamachi} stroke={C.ink} strokeWidth={5} />
      <circle cx={1460} cy={110} r={34} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      <line x1={1460} y1={110} x2={1460} y2={88} stroke={C.ink} strokeWidth={4} />
      <line x1={1460} y1={110} x2={1476} y2={118} stroke={C.ink} strokeWidth={4} />
      <line x1={1460} y1={150} x2={1460 + Math.sin(f / 6) * 14} y2={190} stroke={KRP.brass} strokeWidth={5} />
    </g>
    <rect x={-40} y={560} width={W + 80} height={80} fill={C.hallFloor} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={562} x2={i * 240 - 40} y2={638} stroke={C.kamachi} strokeWidth={3} opacity={0.5} />)}
    {/* 上がり框 */}
    <rect x={-40} y={640} width={W + 80} height={64} fill={C.kamachi} stroke={C.ink} strokeWidth={7} />
    <line x1={-40} y1={654} x2={W + 40} y2={654} stroke={KRP.white} strokeWidth={4} opacity={0.3} />
    {/* 土間のタイル */}
    <rect x={-40} y={704} width={W + 80} height={420} fill={C.tile} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-40} y1={760 + i * 80} x2={W + 40} y2={760 + i * 80} stroke={C.tileLine} strokeWidth={4} />)}
    {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 160} y1={704} x2={i * 160 - 120} y2={1080} stroke={C.tileLine} strokeWidth={4} />)}
    {/* すりガラスの引き戸 (左) */}
    <rect x={20} y={40} width={360} height={1000} fill={C.kamachi} stroke={C.ink} strokeWidth={7} />
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={44 + i * 166} y={64} width={146} height={952} fill={C.frost} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={44 + i * 166} y1={240 + k * 160} x2={190 + i * 166} y2={240 + k * 160} stroke={C.kamachi} strokeWidth={6} />)}
        <rect x={60 + i * 166} y={80} width={40} height={900} fill={KRP.white} opacity={0.35 + Math.sin(f / 15 + i) * 0.08} />
      </g>
    ))}
    {/* 靴箱 (右) */}
    <rect x={1520} y={300} width={380} height={720} fill={C.deskWood} stroke={C.ink} strokeWidth={7} />
    <rect x={1500} y={286} width={420} height={30} rx={4} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={5} />
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={1540 + i * 180} y={330} width={160} height={660} fill={C.deskWood} stroke={C.ink} strokeWidth={4} />
        <rect x={i ? 1730 : 1680} y={620} width={10} height={60} rx={5} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    {/* 靴箱の上: 小さな鉢と鍵の皿 */}
    <rect x={1560} y={236} width={60} height={52} rx={6} fill={C.pot} stroke={C.ink} strokeWidth={4} />
    {[-30, 0, 30].map((a) => (
      <ellipse key={a} cx={1590 + a * 0.6} cy={210} rx={14} ry={34} fill={C.plant} stroke={C.ink} strokeWidth={3.5}
        transform={`rotate(${a + Math.sin(f / 12) * 3} 1590 236)`} />
    ))}
    <ellipse cx={1800} cy={280} rx={50} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    <rect x={1782} y={262} width={24} height={14} rx={4} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
    {/* 靴2足: 子どものスニーカーと大人の革靴 */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${500 + i * 70} ${880 + i * 10}) rotate(${-8 + i * 12})`}>
        <path d="M -40 0 Q -42 -30 -10 -32 Q 20 -30 40 -8 Q 44 6 30 8 L -36 8 Z" fill={C.kidB} stroke={C.ink} strokeWidth={4.5} />
        <rect x={-40} y={2} width={82} height={10} rx={5} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${1300 + i * 90} ${920 - i * 6}) rotate(${4 - i * 8})`}>
        <path d="M -50 0 Q -52 -26 -16 -28 Q 30 -26 52 -6 Q 56 8 40 10 L -46 10 Z" fill={C.tvBlack} stroke={C.ink} strokeWidth={4.5} />
        <ellipse cx={-20} cy={-18} rx={10} ry={4} fill={KRP.white} opacity={0.4} />
      </g>
    ))}
  </g>
);

// ---- 文#4 【山】 答えは、スクイーズです。
// どこ: #3 と同じ玄関 (同じ場所・同じ時間の続き)。框の上の段ボール箱
// 演出: ふたがぱかっと開き、Squishy がぽよんと飛び出して2回弾む。緩衝材の紙がふわっと舞う。左右で子ども2人が万歳
// 動き: f4〜14 ふたが開いて飛び出す / f24・32・38 に着地して潰れる / 紙片は上がってからゆっくり舞い落ちる / f20〜32 札 / カメラは寄りから少し引く
const Yw004: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1.1, 1.0, easeInOut(seg(f, 0, 30)));
  const open = easeOut(seg(f, 4, 12));
  const base = 372;
  const arc = (t0: number, t1: number, h: number) => {
    const u = (f - t0) / (t1 - t0);
    return base - 4 * h * u * (1 - u);
  };
  let sy: number;
  if (f < 4) sy = 640;
  else if (f < 14) sy = lerp(640, 170, easeOut(seg(f, 4, 14)));
  else if (f < 24) sy = lerp(170, base, seg(f, 14, 24) ** 2);
  else if (f < 32) sy = arc(24, 32, 150);
  else if (f < 38) sy = arc(32, 38, 70);
  else sy = base;
  const lands: [number, number][] = [[24, 0.55], [32, 0.38], [38, 0.22]];
  const sq = Math.max(0, ...lands.map(([t, a]) => a * Math.max(0, 1 - Math.abs(f - t) / 2.6)));
  const rot = Math.sin(f / 3.5) * (f < 38 ? 6 : 2);
  const pieces = Array.from({ length: 10 }, (_, i) => {
    const t = Math.max(0, f - 6);
    const k = Math.min(1, t / 10);
    const rise = 180 + rnd(41, i) * 220;
    return {
      x: 960 + (i % 2 ? 1 : -1) * (190 + rnd(42, i) * 160 + (10 + rnd(43, i) * 14) * t),
      y: 380 - rise * k * (2 - k) + Math.max(0, t - 10) * (6 + rnd(44, i) * 5) + Math.sin(t / 4 + i) * 10,
      r: i * 37 + t * (6 + i),
      sc: 0.8 + rnd(45, i) * 0.6,
    };
  });
  const sparkle = seg(f, 24, 34);
  return (
    <Frame f={f} seed={2003} bg={C.genkanWall}>
      <g transform={cam(960, 420, zoom)}>
        <YaGenkan f={f} />
        <ellipse cx={960} cy={640} rx={300} ry={18} fill={C.ink} opacity={0.2} />
        {/* 箱の中 (奥の暗がり) */}
        <polygon points="700,380 780,330 1290,330 1220,380" fill={C.boxDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {f >= 4 && f < 30 && (
          <polygon points="760,372 820,340 1250,340 1200,372" fill={KRP.yellow} opacity={0.6 * (1 - seg(f, 14, 30))} />
        )}
        {/* 飛び出すスクイーズ */}
        {sy < 400 + 1 && <ellipse cx={960} cy={398} rx={160 * (1 - (400 - sy) / 600)} ry={14} fill={C.ink} opacity={0.15} />}
        <Squishy x={960} y={sy} s={1.4} squeeze={sq} f={f} rot={rot} face={sq > 0.3 ? "squish" : "smile"} />
        {/* 箱の前と横 */}
        <polygon points="1220,380 1290,330 1290,590 1220,640" fill={C.boxDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={700} y={380} width={520} height={260} fill={C.box} stroke={C.ink} strokeWidth={7} />
        <g transform="rotate(-2 860 510)">
          <rect x={748} y={428} width={250} height={160} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <rect x={748} y={428} width={250} height={34} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />
          {[480, 512, 544].map((ly) => <line key={ly} x1={760} y1={ly + 14} x2={986} y2={ly + 14} stroke={KRP.gray} strokeWidth={3} />)}
          <text x={762} y={570} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.ink}>品名 おもちゃ</text>
        </g>
        <rect x={940} y={380} width={40} height={260} fill={C.tape} opacity={0.85} />
        {/* 開いたふた (左右に倒れる) */}
        <polygon points={`700,380 ${lerp(780, 560, open)},${lerp(330, 300, open)} ${lerp(1035, 640, open)},${lerp(330, 250, open)} ${lerp(960, 700, open) },${lerp(380, 380, open)}`}
          fill={C.boxTop} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <polygon points={`1220,380 ${lerp(1290, 1440, open)},${lerp(330, 300, open)} ${lerp(1035, 1380, open)},${lerp(330, 250, open)} ${lerp(960, 1220, open)},${lerp(380, 380, open)}`}
          fill={C.boxTop} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {open > 0.5 && (
          <g>
            <rect x={600} y={316} width={40} height={18} fill={C.tape} transform="rotate(-20 620 325)" opacity={0.85} />
            <rect x={1320} y={316} width={40} height={18} fill={C.tape} transform="rotate(20 1340 325)" opacity={0.85} />
          </g>
        )}
        {/* 着地の衝撃線とキラキラ */}
        {sparkle > 0 && sparkle < 1 && (
          <g stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={1 - sparkle}>
            {[-1, 1].map((d) => (
              <g key={d}>
                <line x1={960 + d * 230} y1={380} x2={960 + d * (270 + sparkle * 40)} y2={360} />
                <line x1={960 + d * 220} y1={330} x2={960 + d * (260 + sparkle * 50)} y2={290} />
              </g>
            ))}
          </g>
        )}
        {[0, 1, 2, 3].map((i) => {
          const tw = Math.abs(Math.sin(f / 5 + i * 1.3));
          const px = [720, 1210, 760, 1180][i], py = [160, 140, 300, 280][i];
          return f > 14 ? (
            <path key={i} d={`M ${px} ${py - 22 * tw} L ${px + 6} ${py - 6} L ${px + 22 * tw} ${py} L ${px + 6} ${py + 6} L ${px} ${py + 22 * tw} L ${px - 6} ${py + 6} L ${px - 22 * tw} ${py} L ${px - 6} ${py - 6} Z`}
              fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} />
          ) : null;
        })}
        {/* 緩衝材の紙 */}
        {f >= 6 && pieces.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.sc})`}>
            <path d="M -34 -14 L -18 -26 L -2 -16 L 14 -28 L 32 -12 L 26 6 L 34 20 L 10 26 L -8 18 L -26 26 L -36 6 Z"
              fill={i % 3 ? C.kraft : C.kraftDark} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M -18 -8 L 0 4 L 16 -6 M -6 12 L 8 2" fill="none" stroke={C.kraftDark} strokeWidth={2.5} />
          </g>
        ))}
        {/* 子ども2人 (#2 と同じ色)。万歳 */}
        <ellipse cx={400} cy={1000} rx={90} ry={15} fill={C.ink} opacity={0.18} />
        <ellipse cx={1600} cy={1000} rx={90} ry={15} fill={C.ink} opacity={0.18} />
        <YaKid x={400} y={1000} s={1.05} f={f} cloth={C.kidA} clothDark={C.kidADark}
          face={f > 10 ? "joy" : "surprised"} pose={f > 10 ? "banzai" : "hold"} lean={4} />
        <YaKid x={1600} y={1000} s={1.05} f={f} phase={2} cloth={C.kidB} clothDark={C.kidBDark}
          face={f > 12 ? "joy" : "surprised"} pose={f > 12 ? "banzai" : "hold"} lean={-4} />
        {/* 札 */}
        <TagPlate x={420} y={230} text="スクイーズ" size={64} t={seg(f, 20, 32)} rot={-3} />
        <Arrow x={760} y={236} s={0.8} rot={6} t={seg(f, 26, 34)} />
      </g>
    </Frame>
  );
};

// ---- 文#5 【山】 握るとむにゅっとつぶれて、手を離すと、ゆっくり元に戻る。それだけのおもちゃです。
// どこ: 子ども部屋の机の上 (ぼかした木の天板・ライトの玉ボケ・マグとノートの色の面)
// 演出: 画面いっぱいの手が Squishy を上から握る。指の間から体がはみ出す。離すと指の跡がゆっくり戻る
// 動き: f0〜12 握る (squeeze 0→0.9) / f12〜20 指が開く / f20〜42 ゆっくり戻る (dent 1→0.3) / 手は左上へ引く / カメラ f0〜20 寄り・f20〜42 少し引く
const Yw005: React.FC<{ f: number }> = ({ f }) => {
  // 検品プレビュー (f=45) で「握っている瞬間」が写るように、元の段取り (握る0-12/持つ12-20/離して戻る20-42) を
  // 握る0-30 / 握ったまま30-56 / 離して戻る56-100 に引き伸ばして使う (f=45 は握りきった瞬間)
  const tf = f < 30 ? (f / 30) * 11.5 : f < 56 ? 11.5 + ((f - 30) / 26) * 0.5 : 12 + Math.min((f - 56) / 44, 1) * 30;
  const z = tf < 20 ? lerp(1, 1.12, easeInOut(seg(tf, 0, 20))) : lerp(1.12, 1.04, easeInOut(seg(tf, 20, 42)));
  const g = tf < 12 ? easeOut(seg(tf, 0, 12)) : 1 - easeOut(seg(tf, 12, 20));
  const q = tf < 12 ? 0.9 * easeOut(seg(tf, 0, 12)) : tf < 20 ? 0.9 : 0.9 * (1 - easeInOut(seg(tf, 20, 42)));
  const dent = tf < 12 ? seg(tf, 4, 12) : tf < 20 ? 1 : lerp(1, 0.3, seg(tf, 20, 42));
  const away = easeInOut(seg(tf, 18, 34));
  const topY = 850 - lerp(418, 305, q / 0.9);
  const fingers = [0, 1, 2, 3].map((i) => {
    const p0: [number, number] = [560 + i * 14, 430 + i * 40];
    const p1: [number, number] = [lerp(820 + i * 20, 880 + i * 50, g), lerp(topY - 150 + i * 40, topY - 80 + i * 26, g)];
    const p2: [number, number] = [lerp(1000 + i * 30, 1250 + i * 26, g) - (i === 3 ? 40 : 0), lerp(topY - 300 + i * 80, topY + 30 + i * 46, g)];
    const m: [number, number] = [0.25 * p0[0] + 0.5 * p1[0] + 0.25 * p2[0], 0.25 * p0[1] + 0.5 * p1[1] + 0.25 * p2[1]];
    return { p0, p1, p2, m };
  });
  const bulge = clamp01((q - 0.3) / 0.6) * clamp01(g * 1.5);
  return (
    <Frame f={f} seed={2004} bg={C.deskWood}>
      <defs>
        <filter id="ya5blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      {/* ぼかした机の上 */}
      <g filter="url(#ya5blur)">
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.deskWood} />
        <rect x={-60} y={-60} width={W + 120} height={360} fill={C.nightWall} opacity={0.55} />
        {[[260, 140, 120], [520, 90, 70], [1640, 120, 110], [1780, 300, 60]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={C.lamp} opacity={0.55} />
        ))}
        <rect x={1480} y={420} width={260} height={300} rx={40} fill={C.mug} />
        <rect x={60} y={620} width={420} height={300} rx={20} fill={KRP.blueSoft} opacity={0.8} />
        <rect x={1460} y={760} width={420} height={120} rx={20} fill={KRP.yellow} opacity={0.7} />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-60} y={360 + i * 150} width={W + 120} height={18} fill={C.deskWoodDark} opacity={0.4} />
        ))}
      </g>
      <g transform={cam(960, 640, z)}>
        {/* スクイーズ (主役) */}
        <Squishy x={1010} y={850} s={2.2} squeeze={q} dent={dent} f={f} />
        {/* はみ出し (指の間からぷくっと) */}
        {bulge > 0.01 && fingers.slice(0, 3).map((fg, i) => {
          const n = fingers[i + 1];
          return (
            <ellipse key={i} cx={(fg.m[0] + n.m[0]) / 2 + 30} cy={(fg.m[1] + n.m[1]) / 2 - 6} rx={46 * bulge} ry={24 * bulge}
              fill={YP.sqBody} stroke={C.ink} strokeWidth={4} />
          );
        })}
        {/* 握る力の線 */}
        {g > 0.6 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" opacity={g}>
            <path d="M 560 760 q -30 -30 -20 -70" />
            <path d="M 1460 760 q 30 -30 20 -70" />
            <path d="M 1500 830 q 40 -10 50 -40" />
          </g>
        )}
        {/* ゆっくり戻る印 (上向きの小さな波) */}
        {f > 22 && (
          <g stroke={YP.sqDeep} strokeWidth={6} strokeLinecap="round" fill="none" opacity={seg(tf, 22, 30)}>
            {[0, 1, 2].map((i) => {
              const yy = 520 - ((f * 1.5 + i * 30) % 90);
              return <path key={i} d={`M ${1380 + i * 40} ${yy + 40} q 10 -20 0 -40`} />;
            })}
          </g>
        )}
        {/* 大きな手 (左下から。離すと左上へ引く) */}
        <g transform={`translate(${-260 * away} ${60 * away}) rotate(${-8 * away} 300 700)`}>
          {/* 袖と手首 */}
          <g transform="rotate(-38 330 640)">
            <rect x={130} y={560} width={520} height={190} rx={40} fill={C.skin} stroke={C.ink} strokeWidth={7} transform="translate(-140 0)" />
            <rect x={-320} y={540} width={520} height={230} rx={40} fill={C.kidB} stroke={C.ink} strokeWidth={7} />
            <rect x={150} y={530} width={60} height={250} rx={20} fill={C.kidBDark} stroke={C.ink} strokeWidth={7} />
          </g>
          {/* 親指 (左の側面を下へ) */}
          <path d={`M 560 600 Q 560 ${lerp(700, 740, g)} ${lerp(640, 720, g)} ${lerp(720, 770, g)}`} fill="none" stroke={C.ink} strokeWidth={72} strokeLinecap="round" />
          <path d={`M 560 600 Q 560 ${lerp(700, 740, g)} ${lerp(640, 720, g)} ${lerp(720, 770, g)}`} fill="none" stroke={C.skin} strokeWidth={58} strokeLinecap="round" />
          <ellipse cx={lerp(640, 720, g) + 4} cy={lerp(720, 770, g) + 6} rx={18} ry={14} fill={C.nail} stroke={C.ink} strokeWidth={3} />
          {/* 手のひら */}
          <ellipse cx={520} cy={520} rx={170} ry={130} fill={C.skin} stroke={C.ink} strokeWidth={7} transform="rotate(-24 520 520)" />
          <path d="M 440 560 Q 520 600 600 560" fill="none" stroke={C.skinDark} strokeWidth={4} />
          {/* 指4本 (天面を越えて右へ回り込む) */}
          {fingers.map((fg, i) => (
            <g key={i}>
              <path d={`M ${fg.p0[0]} ${fg.p0[1]} Q ${fg.p1[0]} ${fg.p1[1]} ${fg.p2[0]} ${fg.p2[1]}`} fill="none" stroke={C.ink} strokeWidth={i === 3 ? 60 : 70} strokeLinecap="round" />
              <path d={`M ${fg.p0[0]} ${fg.p0[1]} Q ${fg.p1[0]} ${fg.p1[1]} ${fg.p2[0]} ${fg.p2[1]}`} fill="none" stroke={C.skin} strokeWidth={i === 3 ? 47 : 57} strokeLinecap="round" />
              {/* 関節のしわ */}
              <path d={`M ${fg.m[0] - 6} ${fg.m[1] - 22} q 12 22 0 44`} fill="none" stroke={C.skinDark} strokeWidth={4} />
              <path d={`M ${fg.m[0] + 10} ${fg.m[1] - 20} q 12 20 0 40`} fill="none" stroke={C.skinDark} strokeWidth={3} />
              {/* 爪 */}
              <ellipse cx={fg.p2[0]} cy={fg.p2[1]} rx={16} ry={13} fill={C.nail} stroke={C.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 擬音の札 */}
        <TagPlate x={340} y={240} text="むにゅ" size={72} t={seg(tf, 6, 12)} rot={-6} fill={YP.sqShine} color={YP.sqDent} />
        <TagPlate x={1560} y={240} text="じわ〜" size={64} t={seg(tf, 24, 32)} rot={4} />
      </g>
    </Frame>
  );
};

// ---- 文#6 【並】 大人も負けていません。
// どこ: 夜22時のオフィス。窓の夜景・壁の時計・ノートPC・書類の山・マグ・付箋
// 演出: 机を断面 (半透明) にして、机の下で Squishy をこっそり握る手を見せる。上の顔は真面目にPCを見ているのに口元だけゆるむ
// 動き: スクイーズを f でもみもみ / f20 から顔が normal→smile、ほっぺが赤くなる / マグの湯気 / PCのグラフが伸びる / カメラは顔から机の下へ少し下がる
const Yw006: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.06, easeInOut(seg(f, 0, 42)));
  const dy = lerp(0, -30, easeInOut(seg(f, 10, 42)));
  const knead = 0.35 + 0.3 * Math.abs(Math.sin(f / 5));
  const melt = seg(f, 20, 30);
  const px = 900, py = 840, ps = 1.3;
  return (
    <Frame f={f} seed={2005} bg={C.officeWall} dark>
      <g transform={cam(960, 540, z, 0, dy)}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.officeWall} />
        {/* 窓の夜景 */}
        <rect x={80} y={60} width={1060} height={480} fill={C.officeNight} stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: 9 }, (_, i) => {
          const bx = 90 + i * 118, bh = 160 + rnd(51, i) * 230;
          return (
            <g key={i}>
              <rect x={bx} y={540 - bh} width={104} height={bh} fill={C.building} />
              {Array.from({ length: 12 }, (_, k) => (
                rnd(52, i * 20 + k) > 0.45 ? (
                  <rect key={k} x={bx + 12 + (k % 3) * 30} y={556 - bh + Math.floor(k / 3) * 36} width={18} height={20}
                    fill={C.winLit} opacity={0.5 + 0.4 * Math.abs(Math.sin(f / 20 + k + i))} />
                ) : null
              ))}
            </g>
          );
        })}
        <circle cx={1040} cy={130} r={30} fill={KRP.yellow} opacity={0.9} />
        <line x1={610} y1={60} x2={610} y2={540} stroke={C.ink} strokeWidth={8} />
        {/* ブラインドの紐 */}
        <line x1={1120} y1={60} x2={1120 + Math.sin(f / 9) * 6} y2={300} stroke={KRP.gray} strokeWidth={4} />
        {/* 壁の時計 22時 */}
        <g transform="translate(1520 180)">
          <circle r={92} fill={KRP.white} stroke={C.ink} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-76} x2={0} y2={i % 3 ? -68 : -60} stroke={C.ink} strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-44} stroke={C.ink} strokeWidth={9} strokeLinecap="round" transform="rotate(-60)" />
          <line x1={0} y1={0} x2={0} y2={-66} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 0.4})`} />
          <line x1={0} y1={8} x2={0} y2={-70} stroke={KRP.red} strokeWidth={3} transform={`rotate(${f * 6})`} />
          <circle r={8} fill={C.ink} />
        </g>
        <TagPlate x={1520} y={326} text="22:00" size={40} t={1} />
        {/* 椅子 (背もたれと座面・脚) */}
        <rect x={760} y={470} width={280} height={190} rx={30} fill={C.tvBlack} stroke={C.ink} strokeWidth={6} />
        <rect x={740} y={800} width={320} height={34} rx={14} fill={C.tvBlack} stroke={C.ink} strokeWidth={5} />
        <rect x={886} y={834} width={28} height={130} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        {[-1, 0, 1].map((d) => (
          <g key={d}>
            <line x1={900} y1={960} x2={900 + d * 130} y2={990} stroke={KRP.grayDark} strokeWidth={14} strokeLinecap="round" />
            <circle cx={900 + d * 130} cy={1000} r={14} fill={C.tvBlack} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 大人 (ワイシャツ・ネクタイ。机の向こうに座る) */}
        <Person x={px} y={py} s={ps} f={f} cloth={C.shirt} clothDark={C.officeNight}
          face={melt > 0.5 ? "smile" : "normal"} gaze={[-8, 2]} glasses />
        <g transform={`translate(${px} ${py + Math.sin(f / 13) * 3}) scale(${ps})`}>
          <polygon points="-14,-160 14,-160 8,-146 -8,-146" fill={C.tie} stroke={C.ink} strokeWidth={3} />
          <polygon points="-8,-146 8,-146 14,-92 0,-78 -14,-92" fill={C.tie} stroke={C.ink} strokeWidth={3.5} />
          <polygon points="-26,-160 -4,-160 -14,-140" fill={C.shirtDark} stroke={C.ink} strokeWidth={3} />
          <polygon points="26,-160 4,-160 14,-140" fill={C.shirtDark} stroke={C.ink} strokeWidth={3} />
          <ellipse cx={-40} cy={-198} rx={14} ry={8} fill={KRP.red} opacity={0.35 * melt} />
          <ellipse cx={40} cy={-198} rx={14} ry={8} fill={KRP.red} opacity={0.35 * melt} />
        </g>
        {/* 机の天板 */}
        <rect x={140} y={630} width={1640} height={34} rx={6} fill={C.deskWood} stroke={C.ink} strokeWidth={7} />
        {/* 机の下は断面 (半透明の板) */}
        <rect x={180} y={664} width={1560} height={420} fill={KRP.white} opacity={0.18} />
        <rect x={180} y={664} width={1560} height={420} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="22 14" />
        <rect x={180} y={664} width={40} height={420} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={5} />
        {/* 机の下: ごみ箱・カバン・ケーブル・足元のヒーター */}
        <path d="M 1380 900 L 1520 900 L 1500 1060 L 1400 1060 Z" fill={KRP.gray} stroke={C.ink} strokeWidth={5} />
        <path d="M 1420 900 q 20 -26 40 -4 q 14 -20 30 2" fill={C.paper} stroke={C.ink} strokeWidth={3.5} />
        <rect x={330} y={880} width={230} height={170} rx={20} fill={C.tvBlack} stroke={C.ink} strokeWidth={5} />
        <path d="M 380 880 q 65 -70 130 0" fill="none" stroke={C.ink} strokeWidth={9} />
        <rect x={420} y={920} width={50} height={14} rx={5} fill={KRP.brass} />
        <path d="M 600 664 q -20 140 60 200 q 80 60 40 196" fill="none" stroke={C.ink} strokeWidth={5} />
        <rect x={1150} y={900} width={140} height={150} rx={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => <rect key={i} x={1170} y={926 + i * 34} width={100} height={14} rx={6} fill={KRP.orange} opacity={0.6 + 0.3 * Math.sin(f / 4 + i)} />)}
        <rect x={1700} y={664} width={40} height={420} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={5} />
        {/* 机の下のスクイーズ (こっそり両手でもみもみ) */}
        <Squishy x={px} y={py - 50} s={0.6} squeeze={knead} dent={knead} f={f} />
        {[-1, 1].map((d) => (
          <circle key={d} cx={px + d * (82 + knead * 18)} cy={py - 92} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        ))}
        {/* ほわっ */}
        <g stroke={YP.sqDeep} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 5))}>
          <path d={`M ${px - 150} ${py - 140} q -16 -10 -30 0`} />
          <path d={`M ${px + 150} ${py - 140} q 16 -10 30 0`} />
          <path d={`M ${px} ${py - 210} l 0 -24`} />
        </g>
        {/* ノートPC (左に3/4向き) */}
        <polygon points="300,632 640,632 610,612 330,612" fill={C.pcBody} stroke={C.ink} strokeWidth={5} />
        <polygon points="330,612 610,612 650,380 360,390" fill={C.pcBody} stroke={C.ink} strokeWidth={6} />
        <polygon points="350,596 596,596 630,398 376,406" fill={C.screen} />
        {[0, 1, 2, 3].map((i) => {
          const bh = (40 + i * 34) * (0.6 + 0.4 * seg(f, 4 + i * 6, 20 + i * 6));
          return <rect key={i} x={400 + i * 50} y={570 - bh} width={34} height={bh} fill={i === 3 ? KRP.red : KRP.blueDeep} stroke={C.ink} strokeWidth={2.5} />;
        })}
        <rect x={604} y={420} width={50} height={46} fill={C.sticky} stroke={C.ink} strokeWidth={3} transform={`rotate(${8 + Math.sin(f / 8) * 2} 630 440)`} />
        <rect x={340} y={400} width={46} height={42} fill={KRP.green} stroke={C.ink} strokeWidth={3} transform="rotate(-10 360 420)" />
        {/* 書類の山 (3段) */}
        {[0, 1, 2].map((s) => (
          <g key={s}>
            {Array.from({ length: 6 }, (_, k) => (
              <rect key={k} x={1170 + s * 140 + (k % 2) * 6 - 3} y={612 - k * 22 - s * 18} width={120} height={20}
                fill={C.paper} stroke={C.ink} strokeWidth={3} transform={`rotate(${(rnd(61, s * 9 + k) - 0.5) * 6} ${1230 + s * 140} ${620 - k * 22})`} />
            ))}
          </g>
        ))}
        {/* マグと湯気 */}
        <rect x={1610} y={556} width={72} height={76} rx={8} fill={C.mug} stroke={C.ink} strokeWidth={5} />
        <path d="M 1682 574 q 26 0 26 22 q 0 22 -26 22" fill="none" stroke={C.ink} strokeWidth={5} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${1630 + i * 30} 540 q ${12 * Math.sin(f / 5 + i)} -24 0 -48 q ${-12 * Math.sin(f / 5 + i)} -24 0 -48`}
            fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        ))}
      </g>
    </Frame>
  );
};

// リビングの部屋 (#7 と #8 は同じ場所・同じ時間の続き。#8 は寄りなので k で見える範囲が変わる)
const YaLiving: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={W + 80} height={820} fill={C.livingWall} />
    {Array.from({ length: 20 }, (_, i) => (
      <line key={i} x1={i * 100} y1={-40} x2={i * 100} y2={780} stroke={C.curtain} strokeWidth={2} opacity={0.18} />
    ))}
    <rect x={-40} y={760} width={W + 80} height={360} fill={C.livingFloor} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-40} y1={800 + i * 60} x2={W + 40} y2={800 + i * 60} stroke={C.tvStand} strokeWidth={3} opacity={0.5} />)}
    <rect x={-40} y={752} width={W + 80} height={18} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    {/* 窓とカーテン */}
    <rect x={130} y={90} width={360} height={520} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={8} />
    <line x1={310} y1={90} x2={310} y2={610} stroke={C.ink} strokeWidth={6} />
    <ellipse cx={230} cy={200} rx={60} ry={22} fill={KRP.white} opacity={0.8} />
    <path d={`M 80 70 Q ${120 + Math.sin(f / 12) * 8} 340 90 640 L 40 640 L 40 70 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
    <path d={`M 540 70 Q ${500 + Math.sin(f / 12 + 1) * 8} 340 530 640 L 580 640 L 580 70 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
    <rect x={30} y={56} width={560} height={20} rx={8} fill={C.curtainDark} stroke={C.ink} strokeWidth={4} />
    {/* 差し込む日差しの帯 */}
    <polygon points="140,610 490,610 980,1080 380,1080" fill={KRP.yellow} opacity={0.16 + Math.sin(f / 15) * 0.03} />
    {/* 壁の絵 */}
    <rect x={760} y={120} width={260} height={180} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
    <path d="M 780 270 L 850 190 L 910 250 L 950 210 L 1000 270 Z" fill={KRP.green} stroke={C.ink} strokeWidth={3} />
    <circle cx={960} cy={160} r={18} fill={KRP.orange} />
    {/* 観葉植物 */}
    <path d="M 1430 790 L 1450 680 L 1550 680 L 1570 790 Z" fill={C.pot} stroke={C.ink} strokeWidth={5} />
    {[-50, -25, 0, 25, 50].map((a, i) => (
      <ellipse key={a} cx={1500} cy={560 - (i % 2) * 40} rx={30} ry={110} fill={i % 2 ? C.plantDark : C.plant} stroke={C.ink} strokeWidth={4}
        transform={`rotate(${a + Math.sin(f / 14 + i) * 3} 1500 680)`} />
    ))}
    {/* テレビ台とテレビ */}
    <rect x={1640} y={640} width={300} height={130} rx={8} fill={C.tvStand} stroke={C.ink} strokeWidth={6} />
    <rect x={1660} y={660} width={120} height={90} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={4} />
    <polygon points="1660,380 1960,350 1960,620 1660,610" fill={C.tvBlack} stroke={C.ink} strokeWidth={6} />
    <polygon points="1678,396 1960,370 1960,600 1678,594" fill={KRP.blue} opacity={0.6 + Math.sin(f / 3) * 0.15} />
    <rect x={1770} y={612} width={40} height={30} fill={C.tvBlack} />
  </g>
);

// ---- 文#7 【山】 座ると体が沈んで、起き上がれなくなるソファ。
// どこ: 休日の昼のリビング。窓とカーテン・日差しの帯・観葉植物・テレビ・ラグ・ローテーブルのマグ
// 演出: DameSofa (センター) に部屋着の大人がどすんと座り、ずぶずぶ沈む。最後は顔の上半分と片手だけ。手からリモコンが落ちる
// 動き: f0〜10 横に立つ / f10〜14 どすん (ソファがへこむ・ほこり) / f14〜36 sink 0→1 / f30〜40 リモコンが落ちて床で弾む / カメラは座ってから寄る
const Yw007: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.08, easeInOut(seg(f, 12, 42)));
  const sit = easeOut(seg(f, 10, 14));
  const sink = easeInOut(seg(f, 14, 36));
  const bump = f >= 14 && f < 22 ? Math.sin(seg(f, 14, 22) * Math.PI) : 0;
  const rimY = -150 - sink * 90;
  const handX = 960 + 150 * 1.3, handY = 960 + 1.3 * (rimY - 10);
  const fallT = seg(f, 30, 37);
  const bounceT = seg(f, 37, 41);
  const rx = f < 30 ? handX + 70 : lerp(handX + 70, handX + 150, seg(f, 30, 41));
  const ry = f < 30 ? handY - 70 : f < 37 ? lerp(handY - 70, 980, fallT * fallT) : 980 - Math.sin(bounceT * Math.PI) * 34;
  const rr = f < 30 ? -30 : lerp(-30, 200, seg(f, 30, 41));
  return (
    <Frame f={f} seed={2006} bg={C.livingWall}>
      <g transform={cam(960, 600, z)}>
        <YaLiving f={f} />
        {/* ラグ */}
        <ellipse cx={960} cy={990} rx={640} ry={70} fill={C.rug} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={990} rx={560} ry={52} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 12" />
        {/* ローテーブルとマグ (手前左) */}
        <rect x={180} y={880} width={300} height={26} rx={6} fill={C.tvStand} stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={906} width={20} height={80} fill={C.tvStand} stroke={C.ink} strokeWidth={4} />
        <rect x={440} y={906} width={20} height={80} fill={C.tvStand} stroke={C.ink} strokeWidth={4} />
        <rect x={250} y={834} width={52} height={48} rx={6} fill={C.mug} stroke={C.ink} strokeWidth={4} />
        <path d={`M 266 822 q ${8 * Math.sin(f / 5)} -16 0 -32`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.7} />
        {/* ソファ (どすんで少しつぶれる) */}
        <g transform={`translate(960 960) scale(${1 + bump * 0.04} ${1 - bump * 0.06}) translate(-960 -960)`}>
          <g>
            <DameSofa x={960} y={960} s={1.3} sink={sink} f={f}>
              {f >= 10 && (
                <Person x={lerp(300, 0, sit)} y={lerp(-170, -100, sit) + sink * 70} s={0.9} f={f}
                  cloth={C.lounge} clothDark={C.loungeDark} face={sink > 0.3 ? "joy" : "smile"} pose={sink > 0.2 ? "stand" : "banzai"} />
              )}
            </DameSofa>
          </g>
        </g>
        {/* 立っている (座る前) */}
        {f < 10 && (
          <Person x={1450} y={990} s={1.15} f={f} cloth={C.lounge} clothDark={C.loungeDark} face="smile" lean={-6 * seg(f, 4, 10)} />
        )}
        {/* どすんの砂ぼこり */}
        {bump > 0 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" opacity={bump}>
            <path d="M 530 900 q -40 -20 -60 -60" />
            <path d="M 520 950 q -50 0 -80 -20" />
            <path d="M 1390 900 q 40 -20 60 -60" />
            <path d="M 1400 950 q 50 0 80 -20" />
          </g>
        )}
        {/* ふちから出た片手 */}
        {sink > 0.45 && (
          <g opacity={seg(f, 22, 26)}>
            <rect x={handX - 16} y={handY - 80} width={34} height={100} rx={17} fill={C.lounge} stroke={C.ink} strokeWidth={5}
              transform={`rotate(30 ${handX} ${handY})`} />
            <circle cx={handX + 48} cy={handY - 74} r={18} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          </g>
        )}
        {/* リモコン (f30 から落ちる) */}
        {sink > 0.45 && f >= 22 && (
          <g transform={`translate(${rx} ${ry}) rotate(${rr})`}>
            <rect x={-16} y={-46} width={32} height={92} rx={10} fill={C.remote} stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={-28} r={6} fill={KRP.red} />
            {[0, 1, 2].map((i) => <rect key={i} x={-8} y={-10 + i * 16} width={16} height={8} rx={3} fill={KRP.gray} />)}
          </g>
        )}
        {f >= 37 && f < 42 && (
          <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 37, 42)}>
            <line x1={rx - 50} y1={1010} x2={rx - 80} y2={1000} />
            <line x1={rx + 50} y1={1010} x2={rx + 80} y2={1000} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#8 【並】 ついたあだ名は、「人をダメにするソファ」です。
// どこ: #7 と同じリビングのソファに寄る (同じ場所の続き)
// 演出: 沈んだ人はもう寝ていて Z がふわふわ。天井から紐で吊るした大きな木の板「人をダメにするソファ」が落ちてきて揺れる
// 動き: f4〜18 板が落ちてきて、そのあとぶらんぶらん / Z が順に上がる / 寝息でソファがふくらむ / カメラはゆっくり寄る
const Yw008: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const drop = seg(f, 4, 18);
  const dropY = lerp(-460, 0, 1 - (1 - drop) ** 3);
  const sw = f < 18 ? 0 : Math.sin((f - 18) / 3.2) * 7 * Math.exp(-(f - 18) / 16);
  const label = "人をダメにするソファ";
  const bw = label.length * 76 + 90;
  const handX = 960 + 150 * 1.7, handY = 1080 + 1.7 * (-240 - 10);
  return (
    <Frame f={f} seed={2007} bg={C.livingWall}>
      <g transform={cam(960, 500, z)}>
        <g transform="translate(960 560) scale(1.5) translate(-960 -560)">
          <YaLiving f={f} />
        </g>
        {/* ソファ (寄り) */}
        <DameSofa x={960} y={1080} s={1.7} sink={1} f={f}>
          <Person x={0} y={-30} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark} face="joy" still />
        </DameSofa>
        {/* だらりと出た片手 */}
        <rect x={handX - 18} y={handY - 96} width={40} height={120} rx={20} fill={C.lounge} stroke={C.ink} strokeWidth={6}
          transform={`rotate(${56 + Math.sin(f / 18) * 3} ${handX} ${handY})`} />
        <circle cx={handX + 98} cy={handY - 60} r={22} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {/* Zzz */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={1060 + t * 90 + i * 10} y={600 - t * 160} fontFamily={FONT} fontWeight={900}
              fontSize={44 + i * 12} fill={KRP.blueDeep} opacity={Math.sin(t * Math.PI)} stroke={C.ink} strokeWidth={2} paintOrder="stroke">Z</text>
          );
        })}
        {/* 天井の梁 */}
        <rect x={-40} y={-40} width={W + 80} height={96} fill={C.tvStand} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 210} y1={10} x2={i * 210 + 120} y2={10} stroke={C.ink} strokeWidth={3} opacity={0.3} />)}
        {/* 吊るした木の板 */}
        <g transform={`translate(0 ${dropY}) rotate(${sw} 960 0)`}>
          <line x1={960 - bw / 2 + 50} y1={-600} x2={960 - bw / 2 + 50} y2={120} stroke={C.ink} strokeWidth={5} />
          <line x1={960 + bw / 2 - 50} y1={-600} x2={960 + bw / 2 - 50} y2={120} stroke={C.ink} strokeWidth={5} />
          <rect x={960 - bw / 2} y={110} width={bw} height={176} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={8} />
          <rect x={960 - bw / 2 + 14} y={124} width={bw - 28} height={148} rx={8} fill={C.boxTop} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${960 - bw / 2 + 30} ${160 + i * 38} q ${bw / 4} ${-10 + i * 6} ${bw / 2} 0 q ${bw / 4} ${8 - i * 5} ${bw / 2 - 60} 0`}
              fill="none" stroke={YP.woodDark} strokeWidth={3} opacity={0.35} />
          ))}
          {[-1, 1].map((d) => <circle key={d} cx={960 + d * (bw / 2 - 50)} cy={124} r={10} fill={YP.brass} stroke={C.ink} strokeWidth={3} />)}
          <text x={960} y={226} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={C.ink}>{label}</text>
        </g>
        {/* 着いたときの揺れの線 */}
        {f >= 17 && f < 30 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 17, 30)}>
            <path d={`M ${960 - bw / 2 - 30} 160 q -20 30 0 60`} fill="none" />
            <path d={`M ${960 + bw / 2 + 30} 160 q 20 30 0 60`} fill="none" />
          </g>
        )}
      </g>
    </Frame>
  );
};

// クッション (#9 で使う)
const YaCushion: React.FC<{ x: number; y: number; w: number; h: number; c: string; d: string; rot?: number }> = ({ x, y, w, h, c, d, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M ${-w / 2} ${-h / 2} Q 0 ${-h / 2 + 18} ${w / 2} ${-h / 2} Q ${w / 2 - 18} 0 ${w / 2} ${h / 2} Q 0 ${h / 2 - 18} ${-w / 2} ${h / 2} Q ${-w / 2 + 18} 0 ${-w / 2} ${-h / 2} Z`}
      fill={c} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle r={9} fill={d} stroke={C.ink} strokeWidth={3} />
    {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
      <line key={i} x1={sx * 14} y1={sy * 14} x2={sx * (w / 2 - 28)} y2={sy * (h / 2 - 28)} stroke={d} strokeWidth={4} />
    ))}
  </g>
);

// やわらかい上向きの矢印 (#9: 下から体を支える力)
const YaLift: React.FC<{ x: number; y: number; t: number; f: number; i: number }> = ({ x, y, t, f, i }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const bob = Math.sin(f / 6 + i * 1.3) * 8;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${sc})`}>
      <path d="M -26 0 L -26 -70 L -52 -70 L 0 -128 L 52 -70 L 26 -70 L 26 0 Z"
        fill={KRP.yellow} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -10 -14 L -10 -64" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

// ---- 文#9 【山】 ソファやクッションが、体を楽にしてくれるのは、わかります。 ★2026-11-22 台本差し替え (旧: 冷静に考えると、不思議な話です)
// どこ: #7・#8 と同じ休日のリビング (続き)。ソファに浅く沈んだ人の背中と首にクッション
// 演出: 背中の後ろにクッション。体の下から黄色い矢印が「支える」ようにぽこぽこ出る。人は肩の力が抜けてにっこり→ふう。最後に大きな ◯「わかる」
// 動き: f0〜6 クッションが背中に差しこまれる / f8〜20 矢印が順に出て上下にゆれる / f18〜 顔が joy・ふうの息 / f24〜32 ◯ / カメラはゆっくり寄る
const Yw009: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.07, easeInOut(seg(f, 0, 42)));
  const c1 = easeOut(seg(f, 0, 6));
  const relax = seg(f, 16, 22);
  return (
    <Frame f={f} seed={2008} bg={C.livingWall}>
      <g transform={cam(960, 600, z)}>
        <YaLiving f={f} />
        <ellipse cx={960} cy={990} rx={640} ry={70} fill={C.rug} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={990} rx={560} ry={52} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 12" />
        {/* 背中のうしろのクッション (ソファの中・人の奥) */}
        <DameSofa x={960} y={960} s={1.3} sink={0.35} f={f}>
          <g transform={`translate(${lerp(-260, -70, c1)} ${-250}) `}>
            <YaCushion x={0} y={0} w={190} h={170} c={C.cushion} d={C.cushionDark} rot={-14} />
          </g>
          <Person x={0} y={-118} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark}
            face={relax > 0.5 ? "joy" : "smile"} lean={lerp(0, -8, relax)} still />
        </DameSofa>
        {/* 下から支える矢印 (首・背中・腰) */}
        <YaLift x={790} y={880} t={seg(f, 8, 13)} f={f} i={0} />
        <YaLift x={960} y={900} t={seg(f, 11, 16)} f={f} i={1} />
        <YaLift x={1130} y={880} t={seg(f, 14, 19)} f={f} i={2} />
        {/* ふうの息 */}
        {relax > 0 && (
          <g opacity={relax * (0.6 + 0.4 * Math.sin(f / 4))} stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d={`M 1080 ${610 - relax * 10} q 30 -10 60 0 q 30 10 60 0`} />
            <path d={`M 1090 ${650 - relax * 10} q 26 -8 52 0 q 26 8 52 0`} />
          </g>
        )}
        <TagPlate x={1560} y={560} text="体を支える" size={46} t={seg(f, 16, 22)} rot={-3} />
        <Maru x={1560} y={330} s={1.15} t={seg(f, 24, 32)} />
      </g>
    </Frame>
  );
};

// ---- 文#10 【山】 でも、スクイーズは、体のどこも支えていません。 ★2026-11-22 台本差し替え (旧: お金を払っています)
// どこ: #9 と同じリビング。ソファから起きて立った人が、手の中でスクイーズを にぎにぎしている
// 演出: 背中・首・腰に点線が伸びて、それぞれの札に × が順に付く。スクイーズは手の中でつぶれては戻るだけ。人はきょとん
// 動き: f0〜 にぎにぎ (squeeze が周期で上下) / f6〜14 点線が伸びる / f12・f18・f24 に × / f28〜 ? がぽん / カメラは全身からスクイーズへ寄る
const Yw010: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.12, easeInOut(seg(f, 20, 42)));
  const sq = 0.5 + 0.5 * Math.sin(f / 3.2);
  const PX = 760, PY = 990, PS = 1.45;
  const hand: [number, number] = [PX + 6, PY - 118 * PS]; // pose="hold" の両手のあいだ
  const parts: { name: string; at: [number, number]; plate: [number, number]; t: number }[] = [
    { name: "首", at: [PX + 40, PY - 160 * PS], plate: [1330, 300], t: 12 }, // 頭の下 (あごの右下)
    { name: "背中", at: [PX + 60 * PS, PY - 120 * PS], plate: [1420, 470], t: 18 }, // 胴の右の側面
    { name: "腰", at: [PX + 58 * PS, PY - 62 * PS], plate: [1330, 640], t: 24 }, // 胴の右下
  ];
  const line = seg(f, 6, 14);
  return (
    <Frame f={f} seed={2009} bg={C.livingWall}>
      <g transform={cam(hand[0], hand[1] - 80, z)}>
        <YaLiving f={f} />
        <ellipse cx={960} cy={990} rx={640} ry={70} fill={C.rug} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={960} cy={990} rx={560} ry={52} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 12" />
        {/* 空いたソファ (奥・右) */}
        <g opacity={0.95}><DameSofa x={1560} y={900} s={0.75} sink={0.2} f={f} /></g>
        {/* 立っている人 */}
        <ellipse cx={PX} cy={PY + 6} rx={110} ry={18} fill={C.ink} opacity={0.18} />
        <Person x={PX} y={PY} s={PS} f={f} cloth={C.lounge} clothDark={C.loungeDark}
          face={f >= 28 ? "surprised" : "normal"} pose="hold" gaze={[8, 4]} />
        {/* 手の中のスクイーズ */}
        <Squishy x={hand[0]} y={hand[1]} s={0.42} squeeze={sq} dent={1 - sq} f={f} />
        {/* にぎにぎの線 */}
        <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.3 + sq * 0.6}>
          <line x1={hand[0] - 100} y1={hand[1] - 40} x2={hand[0] - 130} y2={hand[1] - 56} />
          <line x1={hand[0] + 100} y1={hand[1] - 40} x2={hand[0] + 130} y2={hand[1] - 56} />
        </g>
        {/* 体の各部へ点線 → 札 → × */}
        {parts.map((p, i) => {
          const ex = lerp(p.at[0], p.plate[0] - 90, line), ey = lerp(p.at[1], p.plate[1], line);
          return (
            <g key={p.name}>
              <circle cx={p.at[0]} cy={p.at[1]} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4} opacity={line > 0 ? 1 : 0} />
              {line > 0 && <line x1={p.at[0]} y1={p.at[1]} x2={ex} y2={ey} stroke={C.ink} strokeWidth={5} strokeDasharray="14 10" />}
              <TagPlate x={p.plate[0]} y={p.plate[1]} text={p.name} size={50} t={seg(f, 8 + i * 2, 14 + i * 2)} />
              <XMark x={p.plate[0] + 150} y={p.plate[1] - 20} s={0.55} t={seg(f, p.t, p.t + 6)} />
            </g>
          );
        })}
        <QMark x={PX + 40} y={PY - 330 * PS} s={1.0} f={f} t={seg(f, 28, 36)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_001: (f) => <Yw001 f={f} />,
  yw_002: (f) => <Yw002 f={f} />,
  yw_003: (f) => <Yw003 f={f} />,
  yw_004: (f) => <Yw004 f={f} />,
  yw_005: (f) => <Yw005 f={f} />,
  yw_006: (f) => <Yw006 f={f} />,
  yw_007: (f) => <Yw007 f={f} />,
  yw_008: (f) => <Yw008 f={f} />,
  yw_009: (f) => <Yw009 f={f} />,
  yw_010: (f) => <Yw010 f={f} />,
};

export const YW_A_MOTIFS: string[] = [
  "yw_001",
  "yw_002",
  "yw_003",
  "yw_004",
  "yw_005",
  "yw_006",
  "yw_007",
  "yw_008",
  "yw_009",
  "yw_010",
];

export const yawaAScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
