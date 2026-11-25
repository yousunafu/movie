// 人は、なぜ暇をつぶすのか: 文#194〜#204 (11文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
  mapPaper: "#F3EBD3",
  mapLand: "#E6DDBF",
  mapEdge: "#C9B98E",
  water: "#9CC7DA",
  waterDark: "#6FA3BC",
  park: "#9CCB86",
  parkDark: "#5E9A55",
  road: "#FBF7EC",
  roof: "#C96A4A",
  roofDark: "#9A4A32",
  bldg: "#B9C3CC",
  bldgDark: "#8D99A4",
  night: "#26294A",
  nightDeep: "#181A33",
  win: "#FFE7A0",
  sand: HP.byo as string,
  sandLight: "#7E9EDC",
  glass: "#E4F1F7",
  frameWood: "#9A6A3E",
  frameWoodDark: "#6E4526",
  pinHead: "#D3402E",
  paperLine: "#9DB7CF",
  yellowBook: "#F2D23C",
  steam: "#F4F1EA",
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

// ---- 町の地図 (#194・#198・#199 で同じ地図)。中心 (0,0)・幅1400・高さ560 のローカル座標 ----
// 地図の中の目印の位置 (ローカル座標)
const MP = {
  home: [-430, 90] as [number, number],
  station: [-30, -120] as [number, number],
  office: [390, -140] as [number, number],
  park: [330, 150] as [number, number],
};
const HmJMap: React.FC<{ f: number; homeGlow?: number; hideHome?: boolean; lit?: number[] }> = ({ f, homeGlow = 0, hideHome = false, lit = [] }) => {
  const trainX = -620 + ((f * 6) % 1240);
  return (
    <g>
      {/* 紙の影と本体 */}
      <rect x={-690} y={-266} width={1400} height={560} rx={6} fill={KRP.ink} opacity={0.22} />
      <rect x={-700} y={-280} width={1400} height={560} rx={6} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-670} y={-250} width={1340} height={500} fill={C.mapLand} stroke={C.mapEdge} strokeWidth={4} />
      {/* 川 (左上から右下へ) */}
      <path d="M -670 -170 C -480 -150 -380 -40 -250 -20 C -120 0 -110 140 40 180 C 160 210 200 250 230 250 L 300 250 C 250 220 200 170 70 140 C -60 110 -80 -20 -230 -50 C -380 -80 -480 -190 -670 -215 Z"
        fill={C.water} stroke={C.waterDark} strokeWidth={4} />
      {/* 道 (白い帯) */}
      <g>
        {["M -670 40 L 670 10", "M -200 -250 L -150 250", "M 180 -250 L 230 250", "M -670 200 Q -300 160 -160 210"].map((d, i) => (
          <g key={i}>
            <path d={d} stroke={KRP.ink} strokeWidth={26} fill="none" opacity={0.55} />
            <path d={d} stroke={C.road} strokeWidth={18} fill="none" />
          </g>
        ))}
      </g>
      {/* 線路と走る電車 */}
      <path d="M -670 -120 L 670 -130" stroke={KRP.ink} strokeWidth={10} fill="none" />
      <path d="M -670 -120 L 670 -130" stroke={KRP.white} strokeWidth={4} strokeDasharray="18 14" fill="none" />
      <g transform={`translate(${trainX} ${-128 - trainX * 0.007})`}>
        <rect x={-46} y={-14} width={92} height={28} rx={8} fill={HP.fun} stroke={KRP.ink} strokeWidth={4} />
        {[-28, -6, 16].map((wx) => <rect key={wx} x={wx} y={-8} width={14} height={10} rx={2} fill={KRP.white} />)}
      </g>
      {/* 駅 */}
      <g transform={`translate(${MP.station[0]} ${MP.station[1]})`}>
        <rect x={-90} y={-30} width={180} height={60} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -100 -30 L 0 -70 L 100 -30 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
        <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>駅</text>
      </g>
      {/* 会社 (ビル3つ) */}
      <g transform={`translate(${MP.office[0]} ${MP.office[1]})`}>
        {[[-80, 60, 110], [0, 70, 150], [80, 56, 90]].map(([bx, bw, bh], i) => (
          <g key={i}>
            <rect x={bx - bw / 2} y={40 - bh} width={bw} height={bh} fill={C.bldg} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor(bh / 26) }, (_, r) => [0, 1].map((c) => (
              <rect key={`${r}${c}`} x={bx - bw / 2 + 9 + c * (bw / 2 - 4)} y={52 - bh + r * 26} width={bw / 2 - 18} height={12} fill={C.bldgDark} />
            )))}
          </g>
        ))}
        <text x={0} y={84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>会社</text>
      </g>
      {/* 公園 (芝生・池・木) */}
      <g transform={`translate(${MP.park[0]} ${MP.park[1]})`}>
        <ellipse rx={130} ry={76} fill={C.park} stroke={C.parkDark} strokeWidth={5} />
        <ellipse cx={40} cy={10} rx={36} ry={20} fill={C.water} stroke={C.waterDark} strokeWidth={3} />
        {[[-80, -20], [-50, 30], [-10, -40], [80, -36], [96, 30]].map(([tx, ty], i) => (
          <circle key={i} cx={tx} cy={ty + Math.sin(f / 14 + i) * 1.5} r={20} fill={C.parkDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>公園</text>
      </g>
      {/* 家々 (住宅地)。真ん中の1軒が「あなたの家」 */}
      <g transform={`translate(${MP.home[0]} ${MP.home[1]})`}>
        {[[-120, -40], [120, -50], [-140, 70], [130, 60], [-250, 10]].map(([hx, hy], i) => (
          <g key={i} transform={`translate(${hx} ${hy})`}>
            <rect x={-26} y={-14} width={52} height={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -32 -12 L 0 -38 L 32 -12 Z" fill={C.roofDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {homeGlow > 0 && <circle r={110 + 10 * Math.sin(f / 5)} fill={HP.screen} opacity={0.5 * homeGlow} />}
        {!hideHome && (
          <g>
            <rect x={-46} y={-24} width={92} height={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -58 -20 L 0 -70 L 58 -20 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-14} y={8} width={28} height={30} fill={HP.youDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        <text x={0} y={hideHome ? 66 : 76} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>家</text>
      </g>
      {/* 照らされた目印のまわりの輪 */}
      {lit.map((k) => {
        const pt = [MP.station, MP.office, MP.park][k];
        return <circle key={k} cx={pt[0]} cy={pt[1]} r={120} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="10 10" opacity={0.6} />;
      })}
      {/* 方位記号・折り目 */}
      <g transform="translate(600 -190)">
        <circle r={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 0 -30 L 10 0 L 0 30 L -10 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <text y={-42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>N</text>
      </g>
      {[-233, 233].map((cx) => <line key={cx} x1={cx} y1={-278} x2={cx} y2={278} stroke={C.mapEdge} strokeWidth={3} opacity={0.6} />)}
      <line x1={-698} y1={0} x2={698} y2={0} stroke={C.mapEdge} strokeWidth={3} opacity={0.4} />
    </g>
  );
};

// ---- 地図の待ち針 ----
const HmJPin: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 1, rot = 0 }) => {
  if (t <= 0) return null;
  const up = (1 - easeOut(t)) * 120;
  return (
    <g transform={`translate(${x} ${y - up}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={4} cy={up / s + 2} rx={12} ry={4} fill={KRP.ink} opacity={0.25 * t} />
      <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.silver} strokeWidth={5} />
      <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.ink} strokeWidth={1.5} />
      <circle cx={0} cy={-68} r={17} fill={C.pinHead} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-5} cy={-73} r={5} fill={KRP.white} opacity={0.7} />
    </g>
  );
};

// ---- 木の枠の大きな砂時計 (#195・#196・#199)。s=1 で高さ 680 ----
// top: 上にある砂の量 0〜1 / bottom: 下にたまった砂の量 0〜1 / stream: 砂が落ちているか
const HmJSuna: React.FC<{ x: number; y: number; s?: number; f: number; top: number; bottom: number; stream?: boolean; id: string }> = ({ x, y, s = 1, f, top, bottom, stream = true, id }) => {
  const glassD = "M -190 -290 C -190 -120 -24 -60 -16 0 C -24 60 -190 120 -190 290 L 190 290 C 190 120 24 60 16 0 C 24 -60 190 -120 190 -290 Z";
  const yTop = -lerp(12, 270, clamp01(top));
  const yBot = 290 - lerp(0, 250, clamp01(bottom));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs><clipPath id={`hmjsuna-${id}`}><path d={glassD} /></clipPath></defs>
      {/* 柱 (うしろの2本) */}
      {[-236, 236].map((px) => <rect key={px} x={px - 16} y={-300} width={32} height={600} rx={8} fill={C.frameWoodDark} stroke={KRP.ink} strokeWidth={6} />)}
      {/* ガラス */}
      <path d={glassD} fill={C.glass} opacity={0.75} />
      <g clipPath={`url(#hmjsuna-${id})`}>
        {top > 0.01 && (
          <g>
            <rect x={-200} y={yTop} width={400} height={-yTop + 4} fill={C.sand} />
            <ellipse cx={0} cy={yTop} rx={200} ry={14} fill={C.sandLight} />
            <path d={`M -40 ${yTop} Q 0 ${yTop + 40} 40 ${yTop}`} fill={C.sand} opacity={0.6} />
          </g>
        )}
        {bottom > 0.01 && (
          <g>
            <rect x={-200} y={yBot} width={400} height={300} fill={C.sand} />
            <path d={`M -200 ${yBot + 4} Q 0 ${yBot - 60 - bottom * 30} 200 ${yBot + 4} Z`} fill={C.sand} />
            <path d={`M -120 ${yBot - 10} Q 0 ${yBot - 52 - bottom * 30} 120 ${yBot - 10}`} stroke={C.sandLight} strokeWidth={6} fill="none" />
          </g>
        )}
        {stream && top > 0.01 && (
          <g>
            <rect x={-5} y={-4} width={10} height={yBot - 40} fill={C.sand} />
            {[0, 1, 2, 3].map((k) => <circle key={k} cx={Math.sin(f + k) * 3} cy={((f * 14 + k * 50) % Math.max(yBot - 40, 20))} r={5} fill={HP.screen} />)}
          </g>
        )}
        {/* 砂のきらめき (スマホの光の粒) */}
        {Array.from({ length: 14 }, (_, k) => {
          const py = k < 7 ? lerp(yTop + 20, -20, rnd(51, k)) : lerp(yBot + 10, 280, rnd(52, k));
          const show = k < 7 ? top > 0.05 : bottom > 0.05;
          return show ? <circle key={k} cx={(rnd(53, k) - 0.5) * 300 * (k < 7 ? 1 - (py + 270) / 600 : 1)} cy={py} r={4}
            fill={HP.screenCore} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 6 + k))} /> : null;
        })}
      </g>
      <path d={glassD} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <path d="M -150 -260 C -150 -150 -60 -90 -40 -50" stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.6} />
      {/* 上下の板 */}
      {[-1, 1].map((k) => (
        <g key={k}>
          <rect x={-280} y={k < 0 ? -340 : 290} width={560} height={50} rx={12} fill={C.frameWood} stroke={KRP.ink} strokeWidth={7} />
          <line x1={-250} y1={k < 0 ? -315 : 315} x2={250} y2={k < 0 ? -315 : 315} stroke={C.frameWoodDark} strokeWidth={4} opacity={0.6} />
        </g>
      ))}
      {/* 柱 (手前の2本・細い) */}
      {[-236, 236].map((px) => <rect key={`f${px}`} x={px - 9} y={-292} width={18} height={584} rx={6} fill={C.frameWood} stroke={KRP.ink} strokeWidth={4} />)}
    </g>
  );
};

// ---- ものさしの区画の上の小物 (#201〜#204 で同じ物)。ものさしは (960,560,s=1) ----
const HmJSlotItems: React.FC<{ f: number; lid?: number; bookOut?: boolean }> = ({ f, lid = 0, bookOut = false }) => {
  const s0 = monoSlot(0, 960, 560), s1 = monoSlot(1, 960, 560), s2 = monoSlot(2, 960, 560), s3 = monoSlot(3, 960, 560);
  const a = lid * Math.PI * 0.85;
  return (
    <g>
      {/* 日: カレンダーの1枚 */}
      <g transform={`translate(${s0[0]} ${s0[1]}) rotate(-6)`}>
        <rect x={-62} y={-156} width={124} height={156} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-62} y={-156} width={124} height={30} rx={6} fill={HP.rest} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
          <rect key={`${r}${c}`} x={-54 + c * 15.5} y={-116 + r * 27} width={12} height={20} rx={2}
            fill={c === 0 ? HP.restSoft : KRP.cream} stroke={c === 0 ? HP.rest : KRP.gray} strokeWidth={2} />
        )))}
      </g>
      {/* 時間: 懐中時計 (鎖つき) */}
      <g transform={`translate(${s1[0]} ${s1[1] - 70})`}>
        <path d="M 40 50 q 50 20 80 -10 q 20 -20 50 0" stroke={HP.brassDark} strokeWidth={6} fill="none" strokeDasharray="8 4" />
        <rect x={-12} y={-82} width={24} height={20} rx={5} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle r={66} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} />
        <circle r={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => {
          const t = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={Math.sin(t) * 44} y1={-Math.cos(t) * 44} x2={Math.sin(t) * 50} y2={-Math.cos(t) * 50} stroke={KRP.ink} strokeWidth={i % 3 ? 2 : 4} />;
        })}
        <line x1={0} y1={0} x2={0} y2={-38} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${(f * 6) % 360})`} />
        <line x1={0} y1={0} x2={24} y2={0} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        {/* ふた (上の蝶番で開く) */}
        <g transform={`translate(0 -66) scale(1 ${Math.cos(a)}) translate(0 66)`}>
          <circle r={66} fill={HP.brass} stroke={KRP.ink} strokeWidth={6} opacity={lid > 0 ? 1 : 0} />
          {lid > 0 && <circle r={44} fill="none" stroke={HP.brassDark} strokeWidth={4} />}
        </g>
      </g>
      {/* 分: 駅の時計 (柱つき) と黄色い本 */}
      <g transform={`translate(${s2[0] + 30} ${s2[1]})`}>
        <rect x={-8} y={-120} width={16} height={120} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-30} y={-8} width={60} height={10} rx={3} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={0} cy={-150} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-150} x2={0} y2={-184} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <line x1={0} y1={-150} x2={22} y2={-140} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={-150} x2={0} y2={-188} stroke={KRP.red} strokeWidth={2} transform={`rotate(${(f * 6) % 360} 0 -150)`} />
        {!bookOut && (
          <g transform="translate(-110 0)">
            <rect x={-48} y={-30} width={96} height={30} rx={3} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-48} y={-12} width={96} height={6} fill={HP.jikanDark} opacity={0.6} />
          </g>
        )}
      </g>
      {/* 秒: スマホ */}
      <Sumaho x={s3[0]} y={s3[1] - 52} s={0.34} rot={8} f={f} screen="feed" glow={0.4} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #194 最後に、スマホがどこで使われているか、見てみましょう。
// 格: 並 / seed 5194
// 絵: どこ: 作業机の上の大きな地図 (家・駅・会社・電車が描かれた町の地図)。演出: 地図の上で、スマホのアイコン (Sumaho を小さく) にピンが刺さっていく準備。捜索係が虫めがねを構える。カメラが地図に寄る。動き: 寄り / 虫めがね / ピンが用意される
// どこ: 作業机の上に広げた町の地図 (家・駅・会社・公園・線路・川)
// 演出: 地図の左上の余白にスマホの小さな札が3枚すべりこみ、針山から待ち針が1本抜けてその上で構える。捜索係が地図の上に立って虫めがねを構える
// 動き: カメラが地図に寄る / スマホが1枚ずつ / 待ち針が抜けて宙で止まる / 虫めがねが上がる
const Hm194: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.16 * easeOut(seg(f, 0, 40));
  const pinT = easeInOut(seg(f, 22, 40));
  const px = lerp(640, 336, pinT), py = lerp(400, 408, pinT) - Math.sin(pinT * Math.PI) * 70;
  const lensT = easeOut(seg(f, 8, 30));
  return (
    <Frame f={f} seed={5194}>
      <g transform={`translate(960 570) scale(${z}) translate(-960 -660)`}>
        <Sagyozukue f={f} />
        <g transform="translate(960 660)"><HmJMap f={f} /></g>
        {/* スマホの札 (ピンを刺す前) */}
        {[0, 1, 2].map((i) => {
          const t = seg(f, 4 + i * 5, 14 + i * 5);
          return t > 0 ? (
            <g key={i} opacity={t} transform={`translate(${-80 * (1 - easeOut(t))} 0)`}>
              <Sumaho x={330 + i * 100} y={452} s={0.3} rot={[-10, 4, 12][i]} f={f + i * 9} screen="on" glow={0.5} />
            </g>
          ) : null;
        })}
        {/* 針山 (トマト形) と残りの待ち針 */}
        <g transform="translate(660 430)">
          <ellipse cx={0} cy={30} rx={60} ry={14} fill={KRP.ink} opacity={0.25} />
          <ellipse cx={0} cy={0} rx={62} ry={40} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {[-36, -12, 12, 36].map((sx) => <path key={sx} d={`M ${sx} -38 Q ${sx * 1.3} 0 ${sx} 38`} stroke="#9E2A1E" strokeWidth={3} fill="none" />)}
          <path d="M -16 -40 l 16 -14 l 16 14 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {[[-30, -8], [18, 6], [40, 14]].map(([dx, r], i) => <HmJPin key={i} x={660 + dx} y={412} s={0.8} rot={r} />)}
        {/* 抜けた1本: スマホの上で構える */}
        <HmJPin x={px} y={py} s={0.9} rot={lerp(0, -12, pinT)} t={seg(f, 18, 26) > 0 ? 1 : 0} />
        {pinT > 0.95 && <circle cx={px} cy={py + 6} r={22 + 6 * Math.sin(f / 3)} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.6} />}
        {/* 捜索係 (地図の上に立つ) */}
        <Sousa x={1510} y={860} s={0.62} f={f} face={f > 30 ? "smile" : "normal"} lean={-4} gaze={[-3, -1]}
          lensAt={[lerp(1580, 1000, lensT), lerp(640, 540, lensT)]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #195 日本の人が、平日にスマホなどでネットを使う時間は、1日に約117分。
// 格: 図 / seed 5195
// 絵: どこ: 町の地図の横の、大きな砂時計 (木の枠)。演出: 砂時計の砂が全部で「約117分」(札)。砂が上から落ちて下にたまる。砂の色は藍 (スマホの光の色)。札「平日」「1日」。動き: 砂が落ちる / 札がぽん
// どこ: 作業机の上。左手前に町の地図の端、真ん中に木の枠の大きな砂時計 (砂は藍=スマホの光の色)
// 演出: 砂時計全体を右の大かっこで束ねて「約117分」。左に「平日」「1日」。手前に光るスマホが寝ている
// 動き: 砂が落ちて下にたまる / 大かっこが伸びる / 札がぽん / カメラが少し寄る
const Hm195: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const fall = easeInOut(seg(f, 0, 42));
  const br = easeOut(seg(f, 12, 24));
  return (
    <Frame f={f} seed={5195}>
      <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
        <Sagyozukue f={f} />
        <g transform="translate(250 800) rotate(-9) scale(0.8)"><HmJMap f={f} /></g>
        {/* 机の上の影 */}
        <ellipse cx={980} cy={826} rx={300} ry={26} fill={KRP.ink} opacity={0.25} />
        <HmJSuna x={960} y={500} s={0.95} f={f} top={lerp(1, 0.45, fall)} bottom={lerp(0.02, 0.55, fall)} id="195" />
        {/* 手前のスマホ (同じ藍の光) */}
        <Sumaho x={1400} y={790} s={0.42} rot={-74} f={f} screen="on" glow={0.8} />
        {/* 右の大かっこ (砂時計ぜんぶ = 約117分) */}
        <path d={`M 1250 ${lerp(500, 178, br)} q 40 0 40 40 L 1290 460 q 0 40 30 40 q -30 0 -30 40 L 1290 ${lerp(500, 782, br)} q 0 40 -40 40`}
          stroke={KRP.ink} strokeWidth={9} fill="none" strokeLinecap="round" opacity={br} />
        <TagPlate x={1560} y={500} text="約117分" size={66} t={seg(f, 20, 30)} color={KRP.white} fill={HP.byo} />
        <TagPlate x={430} y={250} text="平日" size={50} t={seg(f, 26, 34)} />
        <TagPlate x={430} y={360} text="1日" size={50} t={seg(f, 30, 38)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #196 そのうち、移動中は、約10分。
// 格: 図 / seed 5196
// 絵: どこ: #195 の砂時計 (続き)。演出: 下にたまった砂を、仕切り板で分けていくと、「移動中」の部分は**ほんのひとつまみ** (約10分)。仕切りの横に電車のアイコン。捜索係が「えっ、これだけ?」とのぞきこむ。動き: 仕切り板が入る / ひとつまみが分けられる / のぞきこむ
// どこ: #195 と同じ作業机の砂時計 (続き)。砂はぜんぶ下に落ちきっている。カメラは下のふくらみに寄る
// 演出: 上から仕切り板がすとんと入り、右の隅の「ほんのひとつまみ」だけが分けられる。横に電車の札・「移動中」「約10分」。捜索係が右から身を乗り出し、虫めがねでのぞきこんでびっくり
// 動き: カメラが寄る / 仕切り板が落ちる / ひとつまみが光る / 捜索係がのぞきこむ
const Hm196: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.14 * easeOut(seg(f, 0, 30));
  const plate = easeOut(seg(f, 6, 18));
  const glow = seg(f, 18, 26);
  const peek = easeOut(seg(f, 20, 34));
  const SX = 960, SY = 470, yBot = SY + 102; // 砂の表面 (全体座標)
  return (
    <Frame f={f} seed={5196}>
      <g transform={`translate(960 520) scale(${z}) translate(-960 -600)`}>
        <Sagyozukue f={f} />
        <ellipse cx={980} cy={808} rx={300} ry={26} fill={KRP.ink} opacity={0.25} />
        <HmJSuna x={SX} y={SY} s={1} f={f} top={0} bottom={0.75} stream={false} id="196" />
        {/* 分けられた「ひとつまみ」の光 */}
        {glow > 0 && (
          <g opacity={glow}>
            <path d={`M ${SX + 126} ${yBot + 40} L ${SX + 126} ${SY + 290} L ${SX + 190} ${SY + 290} C ${SX + 190} ${SY + 200} ${SX + 178} ${SY + 150} ${SX + 140} ${yBot + 40} Z`}
              fill={HP.screen} opacity={0.35 + 0.2 * Math.sin(f / 3)} />
            <path d={`M ${SX + 126} ${yBot + 40} L ${SX + 126} ${SY + 290} L ${SX + 190} ${SY + 290} C ${SX + 190} ${SY + 200} ${SX + 178} ${SY + 150} ${SX + 140} ${yBot + 40} Z`}
              fill="none" stroke={HP.spark} strokeWidth={5} strokeDasharray="10 6" />
          </g>
        )}
        {/* 仕切り板 (上からすとん) */}
        <g transform={`translate(0 ${-320 * (1 - plate)})`} opacity={plate}>
          <rect x={SX + 116} y={yBot - 60} width={14} height={SY + 290 - yBot + 60} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={SX + 106} y={yBot - 76} width={34} height={22} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {plate >= 1 && f < 24 && <path d={`M ${SX + 120} ${yBot - 6} l -20 -12 M ${SX + 186} ${yBot - 6} l 20 -12`} stroke={KRP.ink} strokeWidth={4} />}
        {/* 電車の札と数字 */}
        <g transform={`translate(1420 430) scale(${pop(seg(f, 20, 30))})`}>
          <rect x={-90} y={-46} width={180} height={92} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-66} y={-28} width={132} height={48} rx={12} fill={HP.fun} stroke={KRP.ink} strokeWidth={4} />
          {[-48, -14, 20].map((wx) => <rect key={wx} x={wx} y={-18} width={26} height={18} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />)}
          {[-40, 40].map((wx) => <circle key={wx} cx={wx} cy={26} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        <path d={`M 1330 560 Q 1240 600 ${SX + 196} ${SY + 240}`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeDasharray="10 8" opacity={glow} />
        <TagPlate x={1420} y={560} text="移動中" size={44} t={seg(f, 24, 32)} />
        <TagPlate x={1420} y={660} text="約10分" size={50} t={seg(f, 28, 36)} color={KRP.white} fill={HP.fun} />
        {/* 捜索係: 右から身を乗り出してのぞきこむ */}
        <g transform={`translate(${lerp(160, 0, peek)} 0)`}>
          <Sousa x={1650} y={900} s={0.7} f={f} face={f > 30 ? "surprised" : "normal"} lean={lerp(0, -8, peek)} gaze={[-4, 2]}
            lensAt={[lerp(1640, SX + 158, peek), lerp(640, SY + 226, peek)]} />
        </g>
        <QMark x={1740} y={560} s={0.55} f={f} t={seg(f, 32, 40)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #197 短い使い方は記録に残りにくい調べ方なので、本当は、もう少し多いかもしれません。
// 格: 図 / seed 5197
// 絵: どこ: 調査票 (15分ごとのマス目の日記用紙) が机の上に。演出: マス目に「スマホ」の印をつける欄。30秒ほどの短い使い方 (小さな光の粒) が、マス目の**すき間からこぼれ落ちて**記録されない。こぼれた粒が机の上に少したまる。札「〜かもしれない」。動き: 粒がこぼれる / マス目に印
// どこ: 作業机の上に立てたクリップボード。15分ごとのマス目の調査票 (行ごとに時計の印)
// 演出: 長く使ったマスには鉛筆で「スマホ」の印。短い使い方 (光の粒) は、マスとマスのすき間をすり抜けてこぼれ落ち、机の上に小さな山になる。札「30秒」「〜かもしれない」
// 動き: 粒が落ち続ける / 鉛筆がマスに印を塗る / 机の上の山が育つ
const HmJPhoneMark: React.FC<{ x: number; y: number; t?: number }> = ({ x, y, t = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${pop(clamp01(t))})`}>
    <rect x={-17} y={-26} width={34} height={52} rx={7} fill={HP.byo} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-11} y={-18} width={22} height={34} rx={3} fill={HP.screen} />
  </g>
);
const Hm197: React.FC<{ f: number }> = ({ f }) => {
  const COLS = 4, ROWS = 5, CX0 = 600, CY0 = 228, CW = 196, CH = 84, GAP = 18;
  const cellX = (c: number) => CX0 + c * (CW + GAP);
  const cellY = (r: number) => CY0 + r * (CH + GAP);
  const marked: [number, number][] = [[3, 1], [3, 2], [4, 0]];
  const pen = easeInOut(seg(f, 6, 26));
  const penX = cellX(2) + 30 + pen * (CW - 60) * 0.9, penY = cellY(1) + CH / 2 + Math.sin(pen * 20) * 16;
  // すき間の列 (粒が落ちる道)
  const lanes = [cellX(1) - GAP / 2, cellX(2) - GAP / 2, cellX(3) - GAP / 2, cellX(3) + CW + GAP / 2];
  const pile = 3 + Math.floor(seg(f, 0, 42) * 9);
  return (
    <Frame f={f} seed={5197}>
      <g transform={`translate(960 540) scale(${1.04 - 0.04 * easeOut(seg(f, 0, 42))}) translate(-960 -540)`}>
        <Sagyozukue f={f} />
        {/* 立て板とクリップボード */}
        <rect x={430} y={130} width={1080} height={640} rx={18} fill={KRP.ink} opacity={0.2} transform="translate(16 14)" />
        <rect x={420} y={120} width={1080} height={650} rx={18} fill="#A8804F" stroke={KRP.ink} strokeWidth={8} />
        <rect x={452} y={160} width={1016} height={580} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={860} y={96} width={200} height={70} rx={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={960} cy={128} r={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 行ごとの時計の印 */}
        {Array.from({ length: ROWS }, (_, r) => (
          <g key={r} transform={`translate(530 ${cellY(r) + CH / 2})`}>
            <circle r={30} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={-20} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${r * 30})`} />
            <line x1={0} y1={0} x2={14} y2={0} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${r * 30 - 90})`} />
          </g>
        ))}
        {/* マス目 */}
        {Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => (
          <rect key={`${r}${c}`} x={cellX(c)} y={cellY(r)} width={CW} height={CH} rx={6} fill={KRP.cream} stroke={C.paperLine} strokeWidth={4} />
        )))}
        {/* 1マスぶんの幅 = 15分 */}
        <path d={`M ${cellX(0)} 218 L ${cellX(0)} 208 L ${cellX(0) + CW} 208 L ${cellX(0) + CW} 218`} stroke={KRP.ink} strokeWidth={4} fill="none" />
        <text x={cellX(0) + CW / 2} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>15分</text>
        {/* 記録された印 */}
        {marked.map(([r, c], i) => (
          <g key={i}>
            <rect x={cellX(c) + 6} y={cellY(r) + 6} width={CW - 12} height={CH - 12} rx={4} fill={HP.screen} opacity={0.7} />
            <HmJPhoneMark x={cellX(c) + CW / 2} y={cellY(r) + CH / 2} />
          </g>
        ))}
        {/* いま鉛筆で塗っているマス */}
        <rect x={cellX(2) + 6} y={cellY(1) + 6} width={(CW - 12) * pen} height={CH - 12} rx={4} fill={HP.screen} opacity={0.7} />
        <HmJPhoneMark x={cellX(2) + CW / 2} y={cellY(1) + CH / 2} t={seg(f, 24, 32)} />
        <g transform={`translate(${penX} ${penY}) rotate(35)`}>
          <rect x={-10} y={-150} width={20} height={130} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-10} y={-170} width={20} height={22} rx={4} fill={HP.restSoft} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -10 -20 L 10 -20 L 0 6 Z" fill={KRP.floor} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* こぼれ落ちる光の粒 (すき間をすり抜ける) */}
        {lanes.map((lx, li) => Array.from({ length: 3 }, (_, k) => {
          const yy = 150 + ((f * 9 + k * 230 + li * 77) % 690);
          return (
            <g key={`${li}-${k}`}>
              <circle cx={lx} cy={yy} r={18} fill={HP.screen} opacity={0.35} />
              <circle cx={lx} cy={yy} r={9} fill={HP.screenCore} stroke={HP.byo} strokeWidth={3} />
              <line x1={lx} y1={yy - 14} x2={lx} y2={yy - 40} stroke={HP.byo} strokeWidth={3} opacity={0.5} />
            </g>
          );
        }))}
        {/* 机の上にたまった粒 */}
        {lanes.map((lx, li) => Array.from({ length: pile }, (_, k) => (
          <circle key={`p${li}-${k}`} cx={lx + (rnd(li, k) - 0.5) * 70} cy={812 - (k % 3) * 9 - Math.floor(k / 6) * 8} r={8}
            fill={HP.screenCore} stroke={HP.byo} strokeWidth={3} opacity={0.6 + 0.4 * Math.abs(Math.sin(f / 5 + k))} />
        )))}
        <TagPlate x={1640} y={250} text="〜かもしれない" size={36} t={seg(f, 28, 38)} rot={4} />
        <TagPlate x={1660} y={400} text="30秒" size={40} t={seg(f, 14, 22)} color={KRP.white} fill={HP.byo} />
        <Arrow x={1560} y={404} s={0.55} rot={180} t={seg(f, 18, 26)} color={HP.byo} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #198 では、残りはどこか。
// 格: 並 / seed 5198
// 絵: どこ: #194 の町の地図 (続き)。演出: 地図の上を、スマホのアイコンを追って捜索係が虫めがねで探し回る。駅・会社・公園を順に照らすが、どこも少ない。最後に虫めがねが「家」のほうへ向かう。動き: 虫めがねが移動 / 照らす / 家のほうへ
// どこ: #194 と同じ作業机の町の地図 (続き)
// 演出: 捜索係が地図の上を走り回り、虫めがねで駅→会社→公園を順に照らす。どこもスマホの札がぽつんと1枚 (少ない)。最後に虫めがねが「家」へ向かうと、家のあたりがぼんやり藍に光りはじめる
// 動き: 虫めがねが移動 / 照らした所に小さな札 / 捜索係が走る→ふり向く / カメラが虫めがねを追ってパン
const Hm198: React.FC<{ f: number }> = ({ f }) => {
  const G = (p: [number, number]): [number, number] => [960 + p[0], 660 + p[1]];
  const keys: [number, [number, number]][] = [
    [0, G(MP.station)], [8, G(MP.station)], [14, G(MP.office)], [20, G(MP.office)],
    [26, G(MP.park)], [31, G(MP.park)], [41, G(MP.home)],
  ];
  let lens = keys[keys.length - 1][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [fa, pa] = keys[i], [fb, pb] = keys[i + 1];
    if (f >= fa && f < fb) { const t = easeInOut((f - fa) / (fb - fa)); lens = [lerp(pa[0], pb[0], t), lerp(pa[1], pb[1], t)]; break; }
  }
  const moving = keys.some(([fa], i) => i < keys.length - 1 && f >= fa && f < keys[i + 1][0] && keys[i][1] !== keys[i + 1][1]);
  const lit = [f >= 4 ? 0 : -1, f >= 16 ? 1 : -1, f >= 28 ? 2 : -1].filter((k) => k >= 0);
  const homeGlow = seg(f, 34, 42) * 0.7;
  const sx = lens[0] + (lens[0] > 900 ? 210 : 230);
  const camX = lerp(960, lens[0], 0.3);
  return (
    <Frame f={f} seed={5198}>
      <g transform={`translate(960 560) scale(1.1) translate(${-camX} -660)`}>
        <Sagyozukue f={f} />
        <g transform="translate(960 660)"><HmJMap f={f} lit={lit} homeGlow={homeGlow} /></g>
        {/* 照らした所: スマホの札は1枚だけ */}
        {[MP.station, MP.office, MP.park].map((p, k) => {
          const t = seg(f, [4, 16, 28][k], [10, 22, 34][k]);
          const [gx, gy] = G(p);
          return t > 0 ? <Sumaho key={k} x={gx + 70} y={gy - 50} s={0.15 * pop(t)} rot={10} f={f} screen="on" glow={0.3} /> : null;
        })}
        {/* 虫めがねの光の輪 */}
        <circle cx={lens[0]} cy={lens[1]} r={90} fill={HP.spark} opacity={0.18 + 0.06 * Math.sin(f / 2)} />
        <Sousa x={sx} y={880} s={0.6} f={f} pose={moving ? "run" : "stand"}
          face={f > 36 ? "surprised" : f > 20 ? "worried" : "normal"} lean={moving ? -8 : 0} gaze={[-3, 0]} lensAt={lens} />
        {f > 20 && f < 34 && <path d={`M ${sx + 40} ${880 - 0.6 * 300} q 10 14 0 24 q -10 -10 0 -24`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />}
        <QMark x={sx + 60} y={880 - 0.6 * 360} s={0.5} f={f} t={seg(f, 36, 42)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #199 いちばん多いのは、自宅でした。約84分です。
// 格: 山 / seed 5199
// 絵: どこ: #194 の地図の「家」のアイコンから、ぽんと立体の家 (夜・窓に灯) が飛び出す。演出: 家の窓から、スマホの藍色の光が**たっぷり**あふれ出している。#195 の砂時計の砂の大部分が、家の中に流れこんでいく。札「自宅」「約84分」。動き: 家が飛び出す / 光があふれる / 砂が流れこむ
// どこ: #194 の作業机の町の地図。「家」の印が画面の真ん中に来るように地図を置く。右の地図の上に #195 の砂時計
// 演出: 「家」の印から、飛び出す絵本のように夜空の台紙つきの立体の家がぽんと立ち上がる。窓という窓から藍の光がどっとあふれる。砂時計の下の砂の大部分が帯になって家の窓へ流れこむ。捜索係は両手を上げて大喜び
// 動き: 家が飛び出す / 光があふれて脈打つ / 砂の帯が流れて砂時計の砂が減る / カメラが少し引く
const Hm199: React.FC<{ f: number }> = ({ f }) => {
  const up = pop(seg(f, 2, 14));
  const light = easeOut(seg(f, 10, 22));
  const flow = seg(f, 14, 42);
  const z = lerp(1.12, 1, easeOut(seg(f, 0, 20)));
  const pulse = 0.85 + 0.15 * Math.sin(f / 3);
  const wins: [number, number, number, number][] = [[730, 590, 130, 110], [1060, 590, 130, 110], [910, 420, 100, 80]];
  return (
    <Frame f={f} seed={5199}>
      <g transform={`translate(960 560) scale(${z}) translate(-960 -560)`}>
        <Sagyozukue f={f} />
        <g transform="translate(1390 690)"><HmJMap f={f} hideHome homeGlow={light * 0.8} /></g>
        {/* 砂時計 (地図の右の上に立つ) */}
        <ellipse cx={1640} cy={612} rx={150} ry={14} fill={KRP.ink} opacity={0.25} />
        <HmJSuna x={1640} y={440} s={0.5} f={f} top={0} bottom={lerp(0.62, 0.12, flow)} stream={false} id="199" />
        {/* 飛び出す家 (足元 960,780 を支点に立ち上がる) */}
        <g transform={`translate(960 780) scale(${0.2 + 0.8 * up} ${up}) translate(-960 -780)`}>
          {/* 夜空の台紙 */}
          <path d="M 560 780 L 560 470 Q 560 230 960 230 Q 1360 230 1360 470 L 1360 780 Z" fill={C.night} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={1220} cy={340} r={42} fill="#FFF3C4" />
          <circle cx={1238} cy={330} r={36} fill={C.night} />
          {[[640, 320], [760, 280], [1120, 300], [700, 440], [1290, 450]].map(([sx, sy], i) => (
            <path key={i} d={`M ${sx} ${sy - 10} L ${sx + 3} ${sy - 3} L ${sx + 10} ${sy} L ${sx + 3} ${sy + 3} L ${sx} ${sy + 10} L ${sx - 3} ${sy + 3} L ${sx - 10} ${sy} L ${sx - 3} ${sy - 3} Z`}
              fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} />
          ))}
          {/* 家の本体 */}
          <rect x={1100} y={350} width={50} height={110} fill={C.roofDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={700} y={520} width={520} height={260} fill="#E9DCC4" stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={706} y1={560 + i * 44} x2={1214} y2={560 + i * 44} stroke="#CDBA98" strokeWidth={4} />)}
          <path d="M 660 530 L 960 330 L 1260 530 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={8} />
          <path d="M 700 505 L 960 340 L 1220 505" stroke={C.roofDark} strokeWidth={6} fill="none" />
          {/* 窓 (中は藍の光でいっぱい) */}
          {wins.map(([wx, wy, ww, wh], i) => (
            <g key={i}>
              <rect x={wx} y={wy} width={ww} height={wh} rx={i === 2 ? 40 : 6} fill={light > 0 ? HP.screenCore : C.win} stroke={KRP.ink} strokeWidth={6} />
              <rect x={wx} y={wy} width={ww} height={wh} rx={i === 2 ? 40 : 6} fill={HP.byo} opacity={0.35 * light * pulse} />
              <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke={KRP.ink} strokeWidth={5} />
              <line x1={wx} y1={wy + wh / 2} x2={wx + ww} y2={wy + wh / 2} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          {/* 玄関 */}
          <rect x={905} y={640} width={110} height={140} rx={8} fill={HP.youDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={995} cy={712} r={7} fill={HP.brass} stroke={KRP.ink} strokeWidth={2} />
          {/* 台紙の折り返し (飛び出す絵本の紙の足) */}
          {[600, 1320].map((tx) => <path key={tx} d={`M ${tx - 40} 780 L ${tx} 740 L ${tx + 40} 780 Z`} fill={C.mapPaper} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {/* 窓からあふれる藍の光 */}
        {light > 0 && wins.map(([wx, wy, ww, wh], i) => {
          const cx = wx + ww / 2, cy = wy + wh / 2;
          const base = i === 0 ? 200 : i === 1 ? -20 : -90; // 光の向き (度)
          const L = (i === 2 ? 220 : 300) * light * pulse;
          return (
            <g key={`r${i}`}>
              {[-36, -18, 0, 18, 36].map((da, j) => {
                const a = ((base + da) * Math.PI) / 180, w = 0.09;
                const len = L * (j % 2 ? 0.8 : 1) * (0.92 + 0.08 * Math.sin(f / 3 + j));
                return <polygon key={j} points={`${cx},${cy} ${cx + Math.cos(a - w) * len},${cy + Math.sin(a - w) * len} ${cx + Math.cos(a + w) * len},${cy + Math.sin(a + w) * len}`}
                  fill={HP.screen} opacity={0.6} />;
              })}
              <ellipse cx={cx} cy={cy} rx={ww * (0.8 + 0.3 * light)} ry={wh * (0.8 + 0.3 * light)} fill={HP.screenCore} opacity={0.45} />
              {[0, 1, 2, 3].map((j) => {
                const a = ((base + (j - 1.5) * 24) * Math.PI) / 180, d = ((f * 8 + j * 60) % 280) * light;
                return <circle key={`p${j}`} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={7} fill={HP.screenCore} stroke={HP.byo} strokeWidth={3} opacity={1 - d / 300} />;
              })}
            </g>
          );
        })}
        {/* 砂の帯: 砂時計から家の右の窓へ流れこむ */}
        {flow > 0 && (
          <g>
            <path d="M 1560 560 C 1500 700 1340 720 1190 650" stroke={C.sand} strokeWidth={28 * Math.min(1, flow * 4)} fill="none" strokeLinecap="round" />
            <path d="M 1560 560 C 1500 700 1340 720 1190 650" stroke={HP.screen} strokeWidth={6} fill="none" strokeDasharray="14 22" strokeDashoffset={-f * 6} />
          </g>
        )}
        <TagPlate x={960} y={170} text="約84分" size={72} t={seg(f, 22, 32)} color={KRP.white} fill={HP.byo} />
        <TagPlate x={560} y={470} text="自宅" size={52} t={seg(f, 16, 24)} rot={-5} />
        <Sousa x={330} y={880} s={0.7} f={f} pose={f > 20 ? "banzai" : "stand"} face={f > 14 ? "joy" : "surprised"}
          lensAt={f > 20 ? undefined : [520, 660]} gaze={[3, -2]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #200 スマホは、細切れの隙間だけでなく、家でのまとまった暇まで、しっかり埋めていたのです。
// 格: 山 / seed 5200
// 絵: どこ: 夜の「あなた」の部屋 (#14 と同じ部屋)。演出: 部屋の中の「まとまった時間」(ソファでくつろぐ時間・寝る前のベッド・お風呂上がり) を表すクッション形の空白が、スマホの藍色の光で**すみずみまで塗りつぶされていく**。「あなた」はソファでスマホを見ている。動き: 光が部屋を塗っていく / スマホの光
// どこ: 夜の「あなた」の部屋 (#14 と同じ YoruNoHeya)。あなたはソファでスマホを見ている
// 演出: 部屋の中の「まとまった時間」= ソファの時間・寝る前のベッド (上の壁にクッション形の空白)・お風呂上がり (左にクッション形の空白)。空白は点線のふち取りで、スマホから伸びる光の帯が届くと、すみずみまで藍に塗りつぶされていく
// 動き: 光の帯が伸びる / 空白が順に塗られる (ソファ→ベッド→お風呂上がり) / 部屋全体が少しずつ藍に染まる / カメラが少し引く
const Hm200: React.FC<{ f: number }> = ({ f }) => {
  const PH: [number, number] = [860, 622];
  const blobs = [
    { id: "a", x: 720, y: 96, w: 460, h: 190, t: seg(f, 12, 28), label: "ベッド" },
    { id: "b", x: 50, y: 486, w: 380, h: 170, t: seg(f, 20, 36), label: "お風呂上がり" },
  ];
  const sofaT = seg(f, 4, 20);
  const z = lerp(1.08, 1, easeOut(seg(f, 0, 30)));
  const tint = 0.16 * seg(f, 10, 42);
  const cushion = (x: number, y: number, w: number, h: number) =>
    `M ${x + 40} ${y} Q ${x + w / 2} ${y - 22} ${x + w - 40} ${y} Q ${x + w + 10} ${y + 6} ${x + w} ${y + 50} Q ${x + w + 20} ${y + h / 2} ${x + w} ${y + h - 50} Q ${x + w + 10} ${y + h - 6} ${x + w - 40} ${y + h} Q ${x + w / 2} ${y + h + 22} ${x + 40} ${y + h} Q ${x - 10} ${y + h - 6} ${x} ${y + h - 50} Q ${x - 20} ${y + h / 2} ${x} ${y + 50} Q ${x - 10} ${y + 6} ${x + 40} ${y} Z`;
  return (
    <Frame f={f} seed={5200} dark>
      <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
        <YoruNoHeya f={f} />
        {/* クッション形の空白 (ベッド・お風呂上がり) */}
        {blobs.map((b) => {
          const d = cushion(b.x, b.y, b.w, b.h);
          const ex = b.x + b.w / 2, ey = b.y + b.h / 2;
          return (
            <g key={b.id}>
              <defs><clipPath id={`hmj200${b.id}`}><path d={d} /></clipPath></defs>
              <path d={d} fill={KRP.white} opacity={0.14} />
              <g clipPath={`url(#hmj200${b.id})`}>
                <circle cx={b.id === "a" ? ex : b.x + b.w} cy={b.id === "a" ? b.y + b.h : ey} r={easeOut(b.t) * 520} fill={HP.byo} opacity={0.85} />
                <circle cx={b.id === "a" ? ex : b.x + b.w} cy={b.id === "a" ? b.y + b.h : ey} r={easeOut(b.t) * 380} fill={HP.screen} opacity={0.35} />
              </g>
              <path d={d} fill="none" stroke={KRP.white} strokeWidth={6} strokeDasharray="18 12" opacity={0.85} />
              {/* 中の印 */}
              {b.id === "a" ? (
                <g transform={`translate(${ex - 60} ${ey - 26})`}>
                  <rect x={-90} y={-40} width={180} height={80} rx={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                  <path d="M -60 -10 q 60 26 120 0" stroke={KRP.gray} strokeWidth={4} fill="none" />
                  <circle cx={170} cy={-10} r={30} fill="#FFF3C4" stroke={KRP.ink} strokeWidth={4} />
                  <circle cx={184} cy={-18} r={24} fill={b.t > 0.5 ? HP.byo : C.night} />
                </g>
              ) : (
                <g transform={`translate(${ex} ${ey - 24})`}>
                  <rect x={-100} y={-30} width={120} height={70} rx={10} fill={HP.restSoft} stroke={KRP.ink} strokeWidth={5} />
                  {[-80, -60, -40, -20, 0].map((lx) => <line key={lx} x1={lx} y1={-30} x2={lx} y2={40} stroke={HP.rest} strokeWidth={3} opacity={0.6} />)}
                  {[0, 1, 2].map((k) => <path key={k} d={`M ${60 + k * 28} 20 q 12 -20 0 -40 q -12 -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none"
                    opacity={0.7} transform={`translate(0 ${-((f * 1.2 + k * 9) % 18)})`} />)}
                </g>
              )}
              <TagPlate x={ex} y={b.y + b.h - 34} text={b.label} size={32} t={seg(f, 2, 10)} />
            </g>
          );
        })}
        {/* スマホから空白へ伸びる光の帯 */}
        {blobs.map((b) => {
          const t = easeOut(seg(f, b.id === "a" ? 6 : 14, b.id === "a" ? 16 : 24));
          const tx = b.id === "a" ? b.x + b.w / 2 : b.x + b.w;
          const ty = b.id === "a" ? b.y + b.h : b.y + b.h / 2;
          return t > 0 ? <path key={`l${b.id}`} d={`M ${PH[0]} ${PH[1]} L ${lerp(PH[0], tx, t)} ${lerp(PH[1], ty, t)}`}
            stroke={HP.screen} strokeWidth={22} strokeLinecap="round" opacity={0.4 + 0.1 * Math.sin(f / 3)} /> : null;
        })}
        {/* ソファの時間も藍に塗られる (背もたれ) */}
        <defs>
          <clipPath id="hmj200sofa"><rect x={520} y={470} width={700} height={240} rx={40} /></clipPath>
          <clipPath id="hmj200front">
            <rect x={500} y={690} width={740} height={120} rx={30} />
            <rect x={470} y={560} width={110} height={260} rx={44} />
            <rect x={1160} y={560} width={110} height={260} rx={44} />
          </clipPath>
        </defs>
        <g clipPath="url(#hmj200sofa)" opacity={0.6}>
          <circle cx={PH[0]} cy={PH[1]} r={easeOut(sofaT) * 520} fill={HP.screen} />
        </g>
        <Person x={860} y={758} s={1.05} f={f} pose="hold" face="smile" gaze={[1, 3]} cloth={HP.you} clothDark={HP.youDark} hair="cap" />
        <ellipse cx={PH[0]} cy={PH[1] - 60} rx={110} ry={90} fill={HP.screen} opacity={0.22 + 0.06 * Math.sin(f / 4)} />
        <Sumaho x={PH[0]} y={PH[1]} s={0.28} f={f} screen="feed" glow={1} />
        <YoruNoHeyaFront />
        <g clipPath="url(#hmj200front)" opacity={0.6}>
          <circle cx={PH[0]} cy={PH[1]} r={easeOut(sofaT) * 560} fill={HP.screen} />
        </g>
        <TagPlate x={1300} y={480} text="ソファ" size={34} t={seg(f, 2, 10)} />
        {/* 部屋全体がスマホの色に染まる */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={HP.byo} opacity={tint} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #201 ものさしを、端から見てみましょう。
// 格: 山 / seed 5201
// 絵: どこ: 作業机 (前半と同じ)。演出: Monosashi (lit=4) の全体を、カメラが左端から右端へゆっくりパン。4つの区画の上には、それぞれの章で乗せた小物 (カレンダーの1枚・懐中時計・駅の時計と黄色い本・スマホ) が並んでいる。捜索係が左端に立つ。動き: カメラのパン / 金具の光
// どこ: 前半と同じ作業机 (Sagyozukue) に、4つとも刻み終えたものさし (lit=4)。区画の上に各章の小物 (カレンダーの1枚・懐中時計・駅の時計と黄色い本・スマホ)
// 演出: 捜索係が左端の金具の前に立ち、虫めがねで端からのぞく。真鍮と木の上を光の筋がすべっていく
// 動き: カメラが左端から右へゆっくりパン / 光の筋が走る / 捜索係が虫めがねを右へ送る
const HmJBench: React.FC<{ f: number; focus?: number; lid?: number }> = ({ f, focus, lid }) => (
  <g>
    <Sagyozukue f={f} />
    <Monosashi x={960} y={560} s={1} lit={4} f={f} focus={focus} />
    <HmJSlotItems f={f} lid={lid} />
  </g>
);
const Hm201: React.FC<{ f: number }> = ({ f }) => {
  const cx = lerp(600, 1100, clamp01(f / 90));
  const shine = 200 + ((f * 22) % 1700);
  const lensX = lerp(300, 560, easeInOut(seg(f, 4, 40)));
  return (
    <Frame f={f} seed={5201}>
      <g transform={`translate(960 520) scale(1.35) translate(${-cx} -560)`}>
        <HmJBench f={f} />
        {/* ものさしの上をすべる光の筋 */}
        <defs><clipPath id="hmj201rule"><rect x={260} y={485} width={1400} height={150} rx={22} /></clipPath></defs>
        <g clipPath="url(#hmj201rule)">
          <polygon points={`${shine},485 ${shine + 60},485 ${shine - 20},635 ${shine - 80},635`} fill={KRP.white} opacity={0.35} />
        </g>
        {/* 捜索係: 左端の金具の前 */}
        <Sousa x={300} y={485} s={0.45} f={f} face={f > 20 ? "smile" : "normal"} lean={4} gaze={[3, -1]} lensAt={[lensX + 40, 420]} />
        {/* 左端の目印 (ここから) */}
        <g opacity={seg(f, 0, 10)}>
          <path d="M 262 440 l -14 -26 l 28 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #202 7日に1度の休みが、「日」の暇を。
// 格: 並 / seed 5202
// 絵: どこ: #201 の作業机 (続き・「日」の区画に寄る)。演出: Monosashi (lit=4, focus=0)。「日」の区画の上のカレンダーの1枚から、第1章の安息日の村の小さな灯 (家の灯) がぽんと浮かび上がる。動き: 寄り / 灯がぽん / 区画が光る
// どこ: #201 と同じ作業机のものさし (続き)。「日」の区画に寄る
// 演出: Monosashi (lit=4, focus=0)。カレンダーの1枚から、丸い夜空の吹き出しに入った安息日の村 (平屋根の家々・窓の灯・油の灯火) がぽんと浮かぶ。ものさしの上に立った小さな捜索係が虫めがねでのぞいてにっこり
// 動き: カメラが寄る / 吹き出しがぽん / 家の灯が1つずつともる / 区画が光る
const Hm202: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 20));
  const z = lerp(1.1, 1.7, k), cx = lerp(960, 560, k), cy = lerp(540, 450, k);
  const b = pop(seg(f, 12, 24));
  const [s0x, s0y] = monoSlot(0, 960, 560);
  const BX = s0x, BY = 290;
  return (
    <Frame f={f} seed={5202}>
      <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
        <HmJBench f={f} focus={0} />
        {/* カレンダーからの光 */}
        {b > 0 && [0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={s0x + (i - 2) * 22} y1={s0y - 150} x2={s0x + (i - 2) * 40} y2={s0y - 180} stroke={HP.spark} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        ))}
        {/* 安息日の村の吹き出し */}
        {b > 0 && (
          <g transform={`translate(${BX} ${BY}) scale(${b})`}>
            <path d="M -20 96 L 0 140 L 20 96 Z" fill={C.night} stroke={KRP.ink} strokeWidth={5} />
            <circle r={110} fill={C.night} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={58} cy={-56} r={16} fill="#FFF3C4" />
            {[[-70, -40], [-20, -76], [30, -30]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} />)}
            <path d="M -100 46 Q -40 30 0 44 Q 50 30 100 46 A 110 110 0 0 1 -100 46 Z" fill="#5A5470" />
            {[[-62, 30, 54, 44], [-4, 18, 60, 56], [54, 34, 46, 40]].map(([hx, hy, hw, hh], i) => {
              const on = f > 20 + i * 5;
              return (
                <g key={i}>
                  <rect x={hx - hw / 2} y={hy - hh / 2} width={hw} height={hh} fill="#CDB89A" stroke={KRP.ink} strokeWidth={4} />
                  <rect x={hx - hw / 2 - 4} y={hy - hh / 2 - 6} width={hw + 8} height={8} fill="#A88E6A" stroke={KRP.ink} strokeWidth={3} />
                  <rect x={hx - 9} y={hy - 8} width={18} height={18} rx={3} fill={on ? C.win : "#4A4660"} stroke={KRP.ink} strokeWidth={3} />
                  {on && <circle cx={hx} cy={hy + 1} r={18} fill={C.win} opacity={0.3 + 0.1 * Math.sin(f / 2 + i)} />}
                </g>
              );
            })}
            {/* 油の灯火 */}
            <g transform="translate(-16 80)">
              <ellipse rx={16} ry={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M 10 -4 q 4 ${-14 - Math.sin(f / 2) * 3} -2 -20 q -2 10 2 20`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={2} />
            </g>
            <circle r={110} fill="none" stroke={KRP.ink} strokeWidth={7} />
          </g>
        )}
        <TagPlate x={BX + 230} y={210} text="安息日" size={34} t={seg(f, 22, 30)} rot={4} />
        <Sousa x={720} y={485} s={0.42} f={f} face={f > 24 ? "joy" : "surprised"} lean={-6} gaze={[-3, -2]} lensAt={[BX + 60, BY + 40]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #203 工場の時計と法律が、「時間」の暇を。
// 格: 並 / seed 5203
// 絵: どこ: #201 の作業机 (「時間」の区画)。演出: Monosashi (lit=4, focus=1)。「時間」の区画の上の懐中時計のふたが開いて、第4章の「8時間×3」の円グラフが小さく浮かび上がる。動き: ふたが開く / 円グラフ / 区画が光る
// どこ: #201 と同じ作業机のものさし。「時間」の区画に寄る
// 演出: Monosashi (lit=4, focus=1)。懐中時計のふたがぱかっと開き、中から「8時間×3」の円グラフ (働く・自分の時間・眠る) が浮かび上がって、3切れが1つずつはまる。捜索係がものさしの上で虫めがねを向けて感心
// 動き: カメラが寄る / ふたが開く / 円グラフが浮かぶ・切れがはまる / 区画が光る
const Hm203: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 20));
  const z = lerp(1.1, 1.7, k), cx = lerp(960, 820, k), cy = lerp(540, 400, k);
  const lid = easeOut(seg(f, 6, 16));
  const [s1x, s1y] = monoSlot(1, 960, 560);
  const PX = s1x, PY = s1y - 250, R = 96;
  const rise = easeOut(seg(f, 14, 26));
  const slices = [
    // #88 (第4章) の「仕事=灰・休み=藍・好きなこと=橙」とそろえる (親が修正)
    { col: "#8E949B", icon: "work" }, { col: "#3E5A8A", icon: "sleep" }, { col: KRP.orange, icon: "free" },
  ];
  return (
    <Frame f={f} seed={5203}>
      <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
        <HmJBench f={f} focus={1} lid={lid} />
        {/* ふたの中から立ちのぼる光 */}
        {rise > 0 && <polygon points={`${s1x - 50},${s1y - 90} ${s1x + 50},${s1y - 90} ${PX + R},${PY + 20} ${PX - R},${PY + 20}`} fill={HP.spark} opacity={0.22 * rise} />}
        {/* 8時間×3 の円グラフ */}
        {rise > 0 && (
          <g transform={`translate(${PX} ${lerp(s1y - 80, PY, rise)}) scale(${0.3 + 0.7 * rise})`}>
            <circle r={R + 10} fill={KRP.ink} opacity={0.2} transform="translate(6 8)" />
            {slices.map((sl, i) => {
              const t = easeOut(seg(f, 18 + i * 5, 26 + i * 5));
              const a0 = (-90 + i * 120) * Math.PI / 180, a1 = (30 + i * 120) * Math.PI / 180;
              const mid = (a0 + a1) / 2;
              const off = (1 - t) * 50;
              const d = `M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`;
              const ix = Math.cos(mid) * R * 0.55, iy = Math.sin(mid) * R * 0.55;
              return t > 0 ? (
                <g key={i} transform={`translate(${Math.cos(mid) * off} ${Math.sin(mid) * off})`} opacity={t}>
                  <path d={d} fill={sl.col} stroke={KRP.ink} strokeWidth={5} />
                  <g transform={`translate(${ix} ${iy})`}>
                    {sl.icon === "work" && (
                      <g transform="rotate(-30)">
                        <rect x={-4} y={-6} width={8} height={30} fill={HP.woodDark} stroke={KRP.ink} strokeWidth={2} />
                        <rect x={-14} y={-16} width={28} height={12} rx={2} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />
                      </g>
                    )}
                    {sl.icon === "free" && (
                      <g>
                        <rect x={-14} y={-12} width={22} height={24} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                        <path d="M 8 -6 q 10 0 10 6 q 0 6 -10 6" stroke={KRP.ink} strokeWidth={3} fill="none" />
                        <path d={`M -6 -16 q 4 -6 0 -12`} stroke={KRP.grayDark} strokeWidth={2} fill="none" />
                      </g>
                    )}
                    {sl.icon === "sleep" && (
                      <g>
                        <circle r={14} fill="#FFF3C4" stroke={KRP.ink} strokeWidth={3} />
                        <circle cx={7} cy={-5} r={12} fill="#3E5A8A" />
                      </g>
                    )}
                  </g>
                </g>
              ) : null;
            })}
            <circle r={R} fill="none" stroke={KRP.ink} strokeWidth={6} opacity={seg(f, 32, 38)} />
          </g>
        )}
        <TagPlate x={PX + 260} y={PY - 30} text="8時間×3" size={36} t={seg(f, 30, 38)} rot={-3} />
        <Sousa x={985} y={485} s={0.42} f={f} face={f > 30 ? "smile" : "surprised"} lean={-6} gaze={[-3, -2]} lensAt={[PX + 70, PY + 40]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #204 鉄道と駅が、「分」の暇を。
// 格: 並 / seed 5204
// 絵: どこ: #201 の作業机 (「分」の区画)。演出: Monosashi (lit=4, focus=2)。「分」の区画の上を、小さな汽車がぽっぽと走り抜け、黄色い本が1冊こぼれる。動き: 汽車が走る / 本がこぼれる / 区画が光る
// どこ: #201 と同じ作業机のものさし。「分」の区画に寄る
// 演出: Monosashi (lit=4, focus=2)。ものさしの上の縁を、黄色い本を積んだ小さな汽車がぽっぽと走り抜ける。段差でがたんと跳ねて、積み荷の黄色い本が1冊くるくるこぼれ落ちる。行く手の捜索係は飛び上がってびっくり
// 動き: カメラが寄る / 汽車が走る・煙 / 本がこぼれて回りながら落ちる / 捜索係が跳ぶ / 区画が光る
const HmJTrain: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const wheel = (f * 24) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 貨車 (黄色い本を積む) */}
      <g transform="translate(-200 0)">
        <rect x={-70} y={-56} width={140} height={40} rx={4} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
        {[-44, -8, 28].map((bx, i) => <rect key={i} x={bx} y={-78 + (i % 2) * 6} width={32} height={22} rx={2} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={3} />)}
        {[-40, 40].map((wx) => <g key={wx} transform={`translate(${wx} -14) rotate(${wheel})`}><circle r={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} /><line x1={-12} y1={0} x2={12} y2={0} stroke={KRP.ink} strokeWidth={3} /></g>)}
        <line x1={70} y1={-24} x2={110} y2={-24} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 機関車 */}
      <rect x={-90} y={-110} width={70} height={84} rx={6} fill={HP.fun} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-80} y={-100} width={46} height={30} rx={4} fill={HP.screen} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-96} y={-118} width={82} height={12} rx={4} fill={HP.funDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-24} y={-78} width={110} height={52} rx={22} fill={HP.funDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={44} y={-118} width={22} height={42} fill={KRP.ink} />
      <rect x={38} y={-126} width={34} height={12} rx={3} fill={KRP.ink} />
      <circle cx={88} cy={-52} r={10} fill={HP.spark} stroke={KRP.ink} strokeWidth={3} />
      {[-62, 0, 56].map((wx, i) => <g key={wx} transform={`translate(${wx} -16) rotate(${wheel})`}><circle r={i === 0 ? 18 : 15} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} /><line x1={-13} y1={0} x2={13} y2={0} stroke={KRP.ink} strokeWidth={3} /></g>)}
    </g>
  );
};
const Hm204: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 18));
  const z = lerp(1.1, 1.7, k), cx = lerp(960, 1160, k), cy = lerp(540, 420, k);
  const tX = (ff: number) => lerp(560, 1300, clamp01((ff - 2) / 40));
  const tx = tX(f);
  const bump = f > 18 && f < 24 ? -Math.sin(((f - 18) / 6) * Math.PI) * 12 : 0;
  const ROOF = 485;
  // こぼれる本 (f=21 で貨車から離れる)
  const bt = seg(f, 21, 38);
  const bx0 = tX(21) - 200, bx = lerp(bx0, 1010, bt), by = lerp(ROOF - 80, ROOF - 20, bt) - Math.sin(bt * Math.PI) * 120;
  const jump = f > 32 && f < 50 ? Math.sin(((f - 32) / 18) * Math.PI) * 50 : 0;
  return (
    <Frame f={f} seed={5204}>
      <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>
        <HmJBench f={f} focus={2} />
        {/* 煙 (少し前の位置から立ちのぼる) */}
        {[1, 2, 3, 4, 5].map((j) => {
          const px = tX(f - j * 3) + 55;
          return <circle key={j} cx={px - j * 6} cy={ROOF - 140 - j * 16} r={12 + j * 6} fill={C.steam} stroke={KRP.grayDark} strokeWidth={3} opacity={1 - j / 7} />;
        })}
        <HmJTrain x={tx} y={ROOF + bump} f={f} />
        {/* 跳ねた印 */}
        {f > 18 && f < 28 && <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
          <line x1={tX(19) - 230} y1={ROOF - 4} x2={tX(19) - 260} y2={ROOF - 24} />
          <line x1={tX(19) - 180} y1={ROOF - 4} x2={tX(19) - 150} y2={ROOF - 24} />
        </g>}
        {/* こぼれた黄色い本 */}
        {f >= 21 && (
          <g transform={`translate(${bx} ${by}) rotate(${bt < 1 ? bt * 540 : 8})`}>
            <rect x={-32} y={-20} width={64} height={40} rx={3} fill={C.yellowBook} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-32} y={-3} width={64} height={7} fill={HP.jikanDark} opacity={0.6} />
          </g>
        )}
        {bt >= 1 && f < 44 && <path d={`M ${bx - 40} ${ROOF - 6} l -14 -10 M ${bx + 40} ${ROOF - 6} l 14 -10`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />}
        <Sousa x={1560} y={ROOF - jump} s={0.42} f={f} pose={jump > 5 ? "banzai" : "stand"} face={f > 26 ? "surprised" : "normal"}
          gaze={[-4, 0]} lensAt={jump > 5 ? undefined : [1490, ROOF - 120]} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_194: (f) => <Hm194 f={f} />,
  hm_195: (f) => <Hm195 f={f} />,
  hm_196: (f) => <Hm196 f={f} />,
  hm_197: (f) => <Hm197 f={f} />,
  hm_198: (f) => <Hm198 f={f} />,
  hm_199: (f) => <Hm199 f={f} />,
  hm_200: (f) => <Hm200 f={f} />,
  hm_201: (f) => <Hm201 f={f} />,
  hm_202: (f) => <Hm202 f={f} />,
  hm_203: (f) => <Hm203 f={f} />,
  hm_204: (f) => <Hm204 f={f} />,
};

export const HM_J_MOTIFS: string[] = [
  "hm_194", // #194
  "hm_195", // #195
  "hm_196", // #196
  "hm_197", // #197
  "hm_198", // #198
  "hm_199", // #199
  "hm_200", // #200
  "hm_201", // #201
  "hm_202", // #202
  "hm_203", // #203
  "hm_204", // #204
];

export const himaJScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
