// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#134〜#142 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 実在の人物と映画の人物は顔を見せない (後ろ姿・シルエット)

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./NamaeShared";
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend, Ushiro, MeijiLock } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  sky: "#CFE3EE", skyLow: "#F6E7C6", sun: "#F6D27A",
  roofA: "#5E6F8A", roofB: "#9A5B4A", roofC: "#6E7F5C", roofD: "#7A6A8A",
  wallA: "#EDE3D0", wallB: "#E3D2B8", wallC: "#D9DDE0", wallD: "#E8D8C4",
  block: "#C9C4B8", blockLine: "#A9A396",
  asphalt: "#8A8C8E", asphaltDark: "#6E7072",
  pole: "#B9B3A6", wire: "#5A524A",
  post: "#C8423A", postDark: "#9A2F2A",
  leaf: "#6FA463", leafDark: "#4E8048", pot: "#C47A4E",
  desk: "#C9A57A", deskDark: "#A9845A", grain: "#B48F62",
  shadow: "rgba(59,51,44,0.18)",
  modern: "#6F8FB0", modernDark: "#4F6E8E",
  mail: "#33415E", mailDark: "#232E45",
  clerkShirt: "#E8E4DA", vest: "#2F3B5C",
  steel: "#9AA3AC", steelDark: "#6F7880", steelLight: "#C8CED4",
  cork: "#C99A62", corkDark: "#A97A46", frameWood: "#8A6440",
  wallOffice: "#E6E9E2", wallOfficeDark: "#CDD3CB", floorTile: "#D8D3C6", tileLine: "#BDB6A6",
  felt: "#5E8A6A", feltDark: "#4A7056",
  lampGreen: "#58C26A", lampOff: "#5E6B60", lampRed: "#B5533F",
  kitchenTile: "#F0EEE8", kitchenLine: "#CFCAC0",
  shutter: "#B8BEC4", shutterLine: "#8E959C",
  grass: "#A9C98A", grassDark: "#86AC69", path: "#E3CFA4", pathEdge: "#C8AE7E", hill: "#C3D8A8",
  envelope: "#E9D9B0", envelopeDark: "#C9B588",
  phone: "#2F3440", screen: "#BFD9EE",
  plank: "#6B5440", plankDark: "#55412F",
  furiBg: "#FFF6D8",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
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

// 人物に重ねる上着・帽子用 (Person と同じゆれで動く)
const NG1On: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; children?: React.ReactNode }> = ({
  x, y, s, f, phase = 0, children,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s})`}>{children}</g>;
};

// 役所の人: 白いシャツ + 紺のベスト + ネクタイ
const NG1Clerk: React.FC<{
  x: number; y: number; s: number; f: number; face?: "normal" | "smile" | "joy" | "surprised";
  pose?: "stand" | "raise" | "point" | "hold"; gaze?: [number, number]; pointDir?: 1 | -1;
}> = ({ x, y, s, f, face = "smile", pose = "stand", gaze = [0, 0], pointDir = 1 }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} cloth={C.clerkShirt} clothDark={C.vest} face={face} pose={pose}
      gaze={gaze} pointDir={pointDir} hair="cap" />
    <NG1On x={x} y={y} s={s} f={f}>
      <path d="M -58 -144 Q -58 -160 -42 -160 L -16 -160 L 0 -112 L 16 -160 L 42 -160 Q 58 -160 58 -144 L 58 -68 Q 58 -52 42 -52 L -42 -52 Q -58 -52 -58 -68 Z"
        fill={C.vest} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -6 -158 L 6 -158 L 9 -126 L 0 -114 L -9 -126 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      {[-96, -80, -64].map((yy) => <circle key={yy} cx={0} cy={yy} r={4.5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />)}
      {/* 首から下げた職員証 (四角いカード) */}
      <rect x={20} y={-108} width={26} height={34} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      <rect x={25} y={-102} width={16} height={8} fill={KRP.blueSoft} />
    </NG1On>
  </g>
);

// 歯車 (四角い歯)
const NG1Gear: React.FC<{ x: number; y: number; r: number; teeth?: number; rot?: number; fill?: string }> = ({
  x, y, r, teeth = 10, rot = 0, fill = KRP.brass,
}) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const st = (Math.PI * 2) / teeth;
    const ang = [a, a + st * 0.2, a + st * 0.5, a + st * 0.7];
    const rr = [r * 0.82, r, r, r * 0.82];
    ang.forEach((g, k) => pts.push(`${(Math.cos(g) * rr[k]).toFixed(1)},${(Math.sin(g) * rr[k]).toFixed(1)}`));
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle r={r * 0.56} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 2) * r * 0.56} y2={Math.sin((i * Math.PI) / 2) * r * 0.56}
          stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
      ))}
      <circle r={r * 0.18} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 観葉植物 (鉢つき)。f で葉がゆれる
const NG1Plant: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const sw = Math.sin(f / 14) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`rotate(${sw} 0 -120)`}>
        {[-60, -35, -10, 15, 40, 62].map((a, i) => (
          <g key={i} transform={`rotate(${a} 0 -120)`}>
            <path d={`M 0 -120 Q ${-34} ${-210 - (i % 2) * 30} 0 ${-290 - (i % 3) * 22} Q ${34} ${-210 - (i % 2) * 30} 0 -120 Z`}
              fill={i % 2 ? C.leaf : C.leafDark} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={0} y1={-124} x2={0} y2={-270 - (i % 3) * 20} stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
          </g>
        ))}
      </g>
      <path d="M -70 -130 L 70 -130 L 54 0 L -54 0 Z" fill={C.pot} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-78} y={-146} width={156} height={22} rx={6} fill={C.pot} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// カレンダー1枚 (左上原点)
type CalM = { year: number; month: number; start: number; days: number };
const NG1CalPage: React.FC<{ w: number; h: number; m: CalM; circle?: number; circleT?: number }> = ({
  w, h, m, circle, circleT = 0,
}) => {
  const head = h * 0.27;
  const rows = Math.ceil((m.start + m.days) / 7);
  const cw = w / 7;
  const chh = (h - head - 50) / rows;
  const fs = Math.min(cw, chh) * 0.46;
  const idx = circle ? m.start + circle - 1 : -1;
  const cx = (idx % 7) * cw + cw / 2;
  const cy = head + 50 + Math.floor(idx / 7) * chh + chh / 2;
  const cr = Math.min(cw, chh) * 0.48;
  const circ = Math.PI * 2 * cr;
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={0} y={0} width={w} height={head} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
      <text x={w * 0.08} y={head * 0.42} fontFamily={FONT} fontWeight={800} fontSize={head * 0.26} fill={KRP.grayDark}>{m.year}</text>
      <text x={w / 2} y={head * 0.86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={head * 0.72} fill={KRP.ink}>{m.month}<tspan fontSize={head * 0.34}>月</tspan></text>
      {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
        <text key={d} x={i * cw + cw / 2} y={head + 36} textAnchor="middle" fontFamily={FONT} fontWeight={800}
          fontSize={fs * 0.72} fill={i === 0 ? KRP.red : i === 6 ? KRP.blueDeep : KRP.grayDark}>{d}</text>
      ))}
      <line x1={8} y1={head + 48} x2={w - 8} y2={head + 48} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
      {Array.from({ length: m.days }, (_, i) => {
        const k = m.start + i;
        const col = k % 7;
        return (
          <text key={i} x={col * cw + cw / 2} y={head + 50 + Math.floor(k / 7) * chh + chh / 2 + fs * 0.36}
            textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs}
            fill={col === 0 ? KRP.red : col === 6 ? KRP.blueDeep : KRP.ink}>{i + 1}</text>
        );
      })}
      {circle && circleT > 0 && (
        <circle cx={cx} cy={cy} r={cr} fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - clamp01(circleT))} transform={`rotate(-100 ${cx} ${cy})`} />
      )}
    </g>
  );
};

// 壁掛けカレンダー。from の紙が上にめくれて to が出る
const NG1Calendar: React.FC<{
  x: number; y: number; w: number; h: number; from: CalM; to: CalM; flipT: number; circle?: number; circleT?: number;
}> = ({ x, y, w, h, from, to, flipT, circle, circleT }) => {
  const c = Math.cos(Math.PI * clamp01(flipT));
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 壁の釘と吊り紐 */}
      <path d={`M ${w * 0.3} 0 L ${w / 2} ${-46} L ${w * 0.7} 0`} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={w / 2} cy={-48} r={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      {/* 厚み */}
      <rect x={6} y={8} width={w} height={h} rx={6} fill={C.shadow} />
      <rect x={3} y={4} width={w} height={h} rx={6} fill={KRP.paper} stroke={KRP.ink} strokeWidth={3} />
      <NG1CalPage w={w} h={h} m={to} circle={circle} circleT={circleT} />
      {flipT < 1 && (c > 0 ? (
        <g transform={`scale(1 ${c})`}><NG1CalPage w={w} h={h} m={from} /></g>
      ) : (
        <g transform={`scale(1 ${c})`}>
          <rect x={0} y={0} width={w} height={h} rx={6} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* リング */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={w * 0.12 + i * w * 0.152 - 6} y={-14} width={12} height={30} rx={6}
          fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
      ))}
    </g>
  );
};

// 戸籍の書類の模式図 (左上原点・幅680)。drawer でふりがなの欄が引き出しのように生える
const NG1Koseki: React.FC<{
  x: number; y: number; s?: number; rot?: number; rubyEmpty?: boolean; drawer?: number; furiT?: number;
  furi?: string; knobs?: boolean;
}> = ({ x, y, s = 1, rot = 0, rubyEmpty = false, drawer = 0, furiT = 0, furi = "ヤマダ ハナコ", knobs = true }) => {
  const d = clamp01(drawer);
  const dh = 92 * d;
  const H0 = 960 + dh;
  const shown = furi.slice(0, Math.floor(clamp01(furiT) * furi.length + 0.001));
  const ln = (yy: number, w: number, k: number | string) => (
    <rect key={k} x={180} y={yy} width={w} height={14} rx={7} fill={KRP.gray} opacity={0.75} />
  );
  const row = (yy: number, hh: number, label: string, k: string, lines: number[]) => (
    <g key={k}>
      <rect x={40} y={yy} width={600} height={hh} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={40} y={yy} width={120} height={hh} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
      <text x={100} y={yy + hh / 2 + 10} textAnchor="middle" fontFamily={FONT} fontWeight={800}
        fontSize={label.length > 3 ? 22 : 28} fill={KRP.ink}>{label}</text>
      {lines.map((w, i) => ln(yy + 20 + i * 26, w, `${k}${i}`))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={16} y={18} width={680} height={H0} rx={6} fill={C.shadow} />
      <rect x={0} y={0} width={680} height={H0} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <text x={340} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink} letterSpacing={24}>戸籍</text>
      <line x1={40} y1={100} x2={640} y2={100} stroke={KRP.ink} strokeWidth={4} />
      {row(118, 80, "本籍", "hon", [300, 180])}
      {/* ふりがなの引き出し (氏名の欄の裏から下へ出てくる) */}
      {d > 0 && (
        <g transform={`translate(0 ${274 + dh})`}>
          <rect x={40} y={0} width={600} height={92} fill={C.furiBg} stroke={KRP.ink} strokeWidth={4} />
          <rect x={40} y={0} width={120} height={92} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <text x={100} y={56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>ふりがな</text>
          <text x={186} y={66} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink} letterSpacing={4}>{shown}</text>
          {knobs && (
            <g>
              <rect x={-26} y={30} width={30} height={32} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
              <rect x={676} y={30} width={30} height={32} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          )}
        </g>
      )}
      {/* 氏名 */}
      <rect x={40} y={216} width={600} height={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={40} y={216} width={120} height={150} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
      <text x={100} y={302} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>氏名</text>
      {rubyEmpty && (
        <g>
          <rect x={220} y={224} width={360} height={48} rx={6} fill={KRP.cream} stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="12 9" />
          <text x={400} y={257} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={KRP.gray}>ふりがな</text>
        </g>
      )}
      <text x={400} y={rubyEmpty ? 360 : 344} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={rubyEmpty ? 60 : 74} fill={NP.sumi} letterSpacing={6}>山田 花子</text>
      {/* 下の欄 (引き出しの分だけ下がる) */}
      <g transform={`translate(0 ${dh})`}>
        {row(384, 70, "生年月日", "b", [260])}
        {row(470, 70, "父", "fa", [220])}
        {row(556, 70, "母", "mo", [240])}
        {row(642, 70, "続柄", "zk", [120])}
        {row(730, 196, "身分事項", "mi", [400, 360, 420, 300, 380, 200])}
      </g>
    </g>
  );
};

// 封筒 (横長・中心原点)。open で上のふたが開く
const NG1Envelope: React.FC<{ x: number; y: number; s?: number; rot?: number; open?: number; window?: boolean }> = ({
  x, y, s = 1, rot = 0, open = 0, window = true,
}) => {
  const o = clamp01(open);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {o > 0 && (
        <path d={`M -110 -60 L 0 ${-60 - 70 * o} L 110 -60 Z`} fill={C.envelopeDark} stroke={KRP.ink} strokeWidth={4} />
      )}
      <rect x={-110} y={-60} width={220} height={120} rx={6} fill={C.envelope} stroke={KRP.ink} strokeWidth={5} />
      {o === 0 && <path d="M -110 -60 L 0 10 L 110 -60" fill="none" stroke={KRP.ink} strokeWidth={4} />}
      {window && <rect x={-78} y={-6} width={110} height={36} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />}
      {window && <rect x={-70} y={4} width={70} height={8} rx={4} fill={KRP.gray} />}
      <rect x={58} y={-44} width={36} height={40} fill="none" stroke={KRP.red} strokeWidth={3} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #134 第6章、2025年、名前に「読み方」が書かれた。
// 格: 山 / seed 4134
// 絵: 章扉。2025年の住宅街の朝 (家並み・電柱・自転車・郵便配達のバイク)。1軒の家の郵便受けに封筒がストンと入る。`ChapterDoor` (num=6, title「2025年、名前に『読み方』が書かれた」)。題字の後ろにクリームの帯
// どこ: 2025年の住宅街の朝。手前に山田さんの家と門柱の郵便受け、向かいの家並み、電柱と電線
// 演出: 配達の人が郵便受けに封筒をストンと入れる。ふたが跳ね、赤い旗が立つ。塀の上の猫がふり向く
// 動き: カメラがゆっくり引く / 封筒が落ちる (f12-21) / ふたがばたつく / 太陽の光がまわる / 遠くでバイクが止まる
const Nm134: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.08, 1, cam);
  const drop = easeInOut(seg(f, 12, 21));
  const lid = seg(f, 20, 34);
  const lidRot = -Math.sin(lid * Math.PI * 3) * (1 - lid) * 30;
  const flag = easeOut(seg(f, 22, 30));
  const released = f > 24;
  const bikeX = lerp(1720, 1560, easeOut(seg(f, 0, 18)));
  const catTurn = seg(f, 20, 28);
  const bird = f * 3;
  return (
    <Frame f={f} seed={4134}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 236, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={6} title="2025年、名前に『読み方』が書かれた" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <linearGradient id="ng1sky134" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky} />
          <stop offset="1" stopColor={C.skyLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(560 640) scale(${sc}) translate(-560 -640)`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#ng1sky134)" />
        {/* 朝日 */}
        <g transform={`translate(1240 150) rotate(${f * 0.5})`} opacity={0.7}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-84} x2={0} y2={-120} stroke={C.sun} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <circle cx={1240} cy={150} r={64} fill={C.sun} stroke={KRP.ink} strokeWidth={4} />
        {/* 雲と鳥 */}
        <path d={`M ${1500 + f * 0.6} 120 q 30 -40 70 -10 q 40 -30 70 10 q 30 0 20 30 h -170 q -20 -20 10 -30 z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} opacity={0.9} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${700 + bird + i * 60} ${170 + i * 24} q 14 -14 28 0 q 14 -14 28 0`} fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* 向かいの家並み (遠く) */}
        {[[760, 330, C.roofA, C.wallC], [990, 300, C.roofB, C.wallA], [1250, 340, C.roofC, C.wallD], [1480, 310, C.roofD, C.wallB], [1720, 330, C.roofA, C.wallA]].map(([hx, hy, roof, wall], i) => {
          const X = hx as number; const Y = hy as number;
          return (
            <g key={i}>
              <rect x={X - 100} y={Y} width={200} height={600 - Y} fill={wall as string} stroke={KRP.ink} strokeWidth={4} />
              <polygon points={`${X - 126},${Y + 4} ${X},${Y - 80} ${X + 126},${Y + 4}`} fill={roof as string} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
              <rect x={X - 70} y={Y + 40} width={54} height={50} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={X + 16} y={Y + 40} width={54} height={50} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={X - 43} y1={Y + 40} x2={X - 43} y2={Y + 90} stroke={KRP.ink} strokeWidth={2.5} />
              <line x1={X + 43} y1={Y + 40} x2={X + 43} y2={Y + 90} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* 街路樹 */}
        {[880, 1370].map((tx, i) => (
          <g key={tx}>
            <rect x={tx - 8} y={400} width={16} height={200} fill={C.deskDark} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={tx} cy={390 + Math.sin(f / 15 + i) * 2} r={62} fill={i ? C.leaf : C.leafDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 遠くで止まる配達のバイク */}
        <g transform={`translate(${bikeX} 512) scale(0.62)`}>
          <circle cx={-60} cy={0} r={30} fill={KRP.ink} /><circle cx={-60} cy={0} r={14} fill={KRP.gray} />
          <circle cx={70} cy={0} r={30} fill={KRP.ink} /><circle cx={70} cy={0} r={14} fill={KRP.gray} />
          <path d="M -80 -30 L 40 -30 L 70 -70 L 96 -70 L 80 -20 L -90 -20 Z" fill={C.post} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-120} y={-96} width={70} height={60} rx={6} fill={C.post} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-110} y1={-70} x2={-60} y2={-70} stroke={KRP.ink} strokeWidth={3} />
          <rect x={84} y={-96} width={8} height={30} fill={KRP.ink} />
        </g>
        {/* 歩道と車道 */}
        <rect x={-40} y={600} width={W + 80} height={60} fill={C.block} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={660} width={W + 80} height={480} fill={C.asphalt} />
        <line x1={-40} y1={662} x2={W + 40} y2={662} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i * 280 - 20} y={900} width={150} height={16} fill={KRP.white} opacity={0.75} />
        ))}
        <ellipse cx={1500} cy={840} rx={80} ry={22} fill={C.asphaltDark} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 電柱と電線 */}
        <path d={`M 940 150 Q 1300 ${200 + Math.sin(f / 20) * 4} 1700 190`} fill="none" stroke={C.wire} strokeWidth={3.5} />
        <path d={`M 940 180 Q 1300 ${236 + Math.sin(f / 20) * 4} 1700 222`} fill="none" stroke={C.wire} strokeWidth={3.5} />
        <path d={`M -40 200 Q 450 ${250 + Math.sin(f / 18) * 4} 940 150`} fill="none" stroke={C.wire} strokeWidth={3.5} />
        <path d={`M -40 232 Q 450 ${284 + Math.sin(f / 18) * 4} 940 180`} fill="none" stroke={C.wire} strokeWidth={3.5} />
        <rect x={1690} y={170} width={20} height={440} fill={C.pole} stroke={KRP.ink} strokeWidth={4} />
        <rect x={924} y={120} width={32} height={520} fill={C.pole} stroke={KRP.ink} strokeWidth={5} />
        <rect x={890} y={140} width={100} height={14} rx={5} fill={C.pole} stroke={KRP.ink} strokeWidth={4} />
        <rect x={926} y={300} width={28} height={64} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
        {/* 手前: 山田さんの家 */}
        <rect x={70} y={300} width={500} height={330} fill={C.wallA} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="30,312 320,150 610,312" fill={C.roofB} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={90 + i * 22} y1={300 - i * 30} x2={550 - i * 22} y2={300 - i * 30} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
        ))}
        <rect x={110} y={350} width={150} height={120} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <line x1={185} y1={350} x2={185} y2={470} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 110 350 Q 140 400 120 470 L 110 470 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={340} y={420} width={130} height={210} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={448} cy={530} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <rect x={340} y={380} width={130} height={30} fill={C.roofB} stroke={KRP.ink} strokeWidth={4} />
        {/* 表札 (白木・字なし) */}
        <rect x={485} y={460} width={60} height={30} rx={4} fill={NP.wood} stroke={KRP.ink} strokeWidth={3} />
        {/* ブロック塀 */}
        <rect x={-40} y={560} width={600} height={120} fill={C.block} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((r) => Array.from({ length: 6 }, (_, i) => (
          <line key={`${r}-${i}`} x1={-10 + i * 100 + (r % 2) * 50} y1={560 + r * 40} x2={-10 + i * 100 + (r % 2) * 50} y2={600 + r * 40} stroke={C.blockLine} strokeWidth={3} />
        )))}
        <line x1={-40} y1={600} x2={560} y2={600} stroke={C.blockLine} strokeWidth={3} />
        <line x1={-40} y1={640} x2={560} y2={640} stroke={C.blockLine} strokeWidth={3} />
        {/* 自転車 */}
        <g transform="translate(230 690)">
          {[-70, 70].map((wx) => (
            <g key={wx}>
              <circle cx={wx} cy={-50} r={48} fill="none" stroke={KRP.ink} strokeWidth={6} />
              {[0, 60, 120].map((a) => (
                <line key={a} x1={wx} y1={-50} x2={wx + Math.cos(((a + f) * Math.PI) / 180) * 46} y2={-50 + Math.sin(((a + f) * Math.PI) / 180) * 46} stroke={KRP.grayDark} strokeWidth={2.5} />
              ))}
            </g>
          ))}
          <path d="M -70 -50 L -10 -50 L 40 -118 L -40 -118 Z M -10 -50 L -40 -134 M 40 -118 L 70 -50 M 40 -118 L 30 -150" fill="none" stroke={KRP.blueDeep} strokeWidth={8} strokeLinejoin="round" />
          <rect x={-62} y={-144} width={46} height={12} rx={6} fill={KRP.ink} />
          <path d="M 10 -156 L 54 -156" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <rect x={40} y={-196} width={60} height={42} rx={4} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
        </g>
        {/* 塀の上の猫 (ふり向く) */}
        <g transform="translate(300 560)">
          <path d={`M 40 -30 q ${30 + Math.sin(f / 8) * 10} -10 ${36 + Math.sin(f / 8) * 14} -50`} fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          <path d={`M 40 -30 q ${30 + Math.sin(f / 8) * 10} -10 ${36 + Math.sin(f / 8) * 14} -50`} fill="none" stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={0} cy={-24} rx={52} ry={26} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
          <g transform={`translate(${-46 + catTurn * 12} -50)`}>
            <circle r={26} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
            <polygon points="-22,-12 -16,-36 -4,-22" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <polygon points="22,-12 16,-36 4,-22" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <circle cx={-9 + catTurn * 6} cy={-2} r={4} fill={KRP.ink} />
            <circle cx={9 + catTurn * 6} cy={-2} r={4} fill={KRP.ink} />
          </g>
        </g>
        {/* 配達の人 (紺の制服・帽子・かばん) */}
        <Person x={800} y={830} s={0.82} f={f} cloth={C.mail} clothDark={C.mailDark}
          pose={released ? "stand" : "point"} pointDir={-1} face={released ? "smile" : "normal"} gaze={[-6, 2]} hair="cap" />
        <NG1On x={800} y={830} s={0.82} f={f}>
          <path d="M -66 -262 Q -60 -310 0 -312 Q 60 -310 66 -262 Z" fill={C.mail} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -70 -262 L 66 -262 L 100 -248 L -70 -250 Z" fill={C.mailDark} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-50} y1={-160} x2={58} y2={-60} stroke={C.mailDark} strokeWidth={10} />
          <rect x={30} y={-84} width={64} height={54} rx={8} fill={C.post} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={34} y1={-66} x2={90} y2={-66} stroke={KRP.ink} strokeWidth={3} />
        </NG1On>
        {/* 門柱と郵便受け */}
        <rect x={540} y={540} width={170} height={360} fill={C.wallB} stroke={KRP.ink} strokeWidth={6} />
        <rect x={530} y={528} width={190} height={24} rx={4} fill={C.block} stroke={KRP.ink} strokeWidth={5} />
        {/* 落ちていく封筒 (郵便受けの前面より奥) */}
        {drop < 1 && (
          <g transform={`translate(${lerp(645, 624, drop)} ${lerp(650, 770, drop)}) rotate(90)`}>
            <NG1Envelope x={0} y={0} s={0.42} window={false} />
          </g>
        )}
        <g>
          <rect x={556} y={690} width={136} height={116} rx={8} fill={C.mail} stroke={KRP.ink} strokeWidth={5} />
          <rect x={576} y={730} width={96} height={30} rx={4} fill={drop >= 1 ? C.envelope : C.mailDark} stroke={KRP.ink} strokeWidth={3.5} />
          {[0, 1, 2].map((i) => <line key={i} x1={576 + 24 + i * 24} y1={730} x2={576 + 24 + i * 24} y2={760} stroke={KRP.ink} strokeWidth={3} />)}
          {/* ふた */}
          <g transform={`rotate(${lidRot} 556 690)`}>
            <rect x={550} y={678} width={148} height={20} rx={5} fill={C.mailDark} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
          {/* 赤い旗 (郵便あり) */}
          <g transform={`rotate(${lerp(90, 0, flag)} 700 760)`}>
            <rect x={696} y={700} width={8} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2.5} />
            <rect x={704} y={700} width={36} height={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        </g>
        {/* ストン の小さな線 */}
        {lid > 0 && lid < 1 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - lid}>
            <line x1={540} y1={668} x2={520} y2={650} /><line x1={620} y1={660} x2={620} y2={636} /><line x1={700} y1={668} x2={720} y2={650} />
          </g>
        )}
        {/* 手に持った封筒 (入れる前) */}
        {f <= 12 && (
          <g transform="translate(645 650) rotate(90)"><NG1Envelope x={0} y={0} s={0.42} window={false} /></g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #135 実は、つい最近まで、日本の戸籍には、名前の読み方が書かれていませんでした。
// 格: 図 / seed 4135
// 絵: 戸籍の書類の**模式図** (A4の紙・枠線・「氏名」の欄に漢字「山田 花子」)。ふりがなの欄が**空っぽ**で、そこに虫眼鏡が近づいて「?」。役所の机の上=世界
// どこ: 役所の事務机の上 (真上から)。木の天板に戸籍の書類・朱肉と印鑑・湯のみ・ファイルの山・眼鏡
// 演出: 書類の「氏名」の欄。漢字の上のふりがなの場所が点線の空欄。虫眼鏡がすべりこんで空欄を拡大 → 何もない → ？
// 動き: カメラがゆっくり名前の欄へ寄る / 虫眼鏡が右下から入る (f6-28) / ？が跳ねる (f30-38) / 湯気がゆれる
const Nm135: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1, 1.08, cam);
  const lens = easeOut(seg(f, 6, 28));
  const lx = lerp(1560, 1015, lens) + Math.sin(f / 9) * 3 * lens;
  const ly = lerp(720, 282, lens) + Math.cos(f / 11) * 2 * lens;
  const q = seg(f, 30, 38);
  const doc = (
    <NG1Koseki x={690} y={96} s={0.8} rot={-1.5} rubyEmpty />
  );
  return (
    <Frame f={f} seed={4135}>
      <defs>
        <clipPath id="ng1lens135"><circle cx={lx} cy={ly} r={58} /></clipPath>
      </defs>
      <g transform={`translate(1000 330) scale(${sc}) translate(-1000 -330)`}>
        {/* 机の天板 (木目) */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.desk} />
        <g stroke={C.grain} strokeWidth={5} opacity={0.6} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -40 ${40 + i * 140} q 480 ${rnd(41, i) * 40 - 20} 1000 0 q 480 ${rnd(42, i) * 40 - 20} 1000 0`} />
          ))}
        </g>
        {/* 緑のデスクマット */}
        <rect x={560} y={50} width={820} height={1000} rx={10} fill={C.felt} stroke={KRP.ink} strokeWidth={6} />
        <rect x={580} y={70} width={780} height={960} rx={6} fill="none" stroke={C.feltDark} strokeWidth={4} />
        {/* 左: 朱肉と印鑑・ボールペン */}
        <g transform="translate(330 300)">
          <rect x={-90} y={-70} width={180} height={140} rx={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={0} rx={64} ry={46} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-14} cy={-12} rx={20} ry={10} fill={KRP.white} opacity={0.35} />
        </g>
        <g transform="translate(200 480) rotate(-20)">
          <rect x={-22} y={-90} width={44} height={180} rx={18} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-90} r={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="translate(400 560) rotate(32)">
          <rect x={-10} y={-150} width={20} height={300} rx={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
          <polygon points="-10,150 10,150 0,180" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-14} y={-150} width={28} height={30} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 左下: 湯のみと湯気 */}
        <g transform="translate(260 760)">
          <ellipse cx={0} cy={0} rx={110} ry={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={0} rx={84} ry={84} fill={C.leafDark} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-20} cy={-24} rx={26} ry={12} fill={C.leaf} opacity={0.8} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-40 + i * 40} -40 q ${18 + Math.sin(f / 7 + i) * 10} -40 0 -80 q ${-18} -40 0 -80`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          ))}
        </g>
        {/* 右: ファイルの山・眼鏡・クリップ皿 */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${1640 + i * 8} ${300 - i * 16}) rotate(${-4 + i * 5})`}>
            <rect x={-170} y={-200} width={340} height={420} rx={8} fill={[KRP.blueSoft, KRP.yellow, KRP.white][i]} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-170} y={-200} width={60} height={420} fill={[KRP.blueDeep, KRP.orange, KRP.gray][i]} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        <g transform="translate(1650 700) rotate(-12)" fill="none" stroke={KRP.ink} strokeWidth={6}>
          <circle cx={-60} cy={0} r={48} fill={KRP.blueSoft} fillOpacity={0.4} />
          <circle cx={60} cy={0} r={48} fill={KRP.blueSoft} fillOpacity={0.4} />
          <path d="M -12 -6 q 12 -14 24 0" />
          <path d="M -108 -8 L -190 -40" /><path d="M 108 -8 L 190 -40" />
        </g>
        <g transform="translate(1560 900)">
          <ellipse cx={0} cy={0} rx={110} ry={56} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          {[[-40, -10, 20], [10, 8, -30], [44, -14, 60]].map(([cx, cy, r], i) => (
            <rect key={i} x={cx - 24} y={cy - 8} width={48} height={16} rx={8} fill="none" stroke={KRP.grayDark} strokeWidth={4} transform={`rotate(${r} ${cx} ${cy})`} />
          ))}
        </g>
        {/* 主役: 戸籍の書類 */}
        {doc}
        {/* 年代札 (つい最近まで) */}
        <TagPlate x={330} y={196} text="〜2025年" size={40} rot={-4} fill={KRP.white} />
        {/* 虫眼鏡 */}
        <g>
          <line x1={lx + 62} y1={ly - 4} x2={lx + 250} y2={ly - 30} stroke={KRP.ink} strokeWidth={36} strokeLinecap="round" />
          <line x1={lx + 62} y1={ly - 4} x2={lx + 250} y2={ly - 30} stroke={C.deskDark} strokeWidth={24} strokeLinecap="round" />
          <circle cx={lx} cy={ly} r={58} fill={KRP.white} />
          <g clipPath="url(#ng1lens135)">
            <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.felt} />
            <g transform={`translate(${lx} ${ly}) scale(1.45) translate(${-lx} ${-ly})`}>{doc}</g>
            <circle cx={lx - 26} cy={ly - 30} r={18} fill={KRP.white} opacity={0.35} />
          </g>
          <circle cx={lx} cy={ly} r={58} fill="none" stroke={KRP.brass} strokeWidth={12} />
          <circle cx={lx} cy={ly} r={64} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={lx} cy={ly} r={52} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <QMark x={lx + 120} y={ly - 50} s={1.1} f={f} t={q} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #136 それが2025年5月、変わりました。
// 格: 並 / seed 4136
// 絵: 壁のカレンダーが f で2025年5月にめくれる (26日に赤い丸)。役所の窓口のシャッターが開く。札「2025年5月」
// どこ: 朝の市役所の戸籍の窓口。左の壁にカレンダーと時計 (8時30分)、番号札の機械、正面に窓口とシャッター
// 演出: 4月の紙がめくれて2025年5月、26日 (月) に赤い丸。窓口のシャッターが上がって、職員が手を挙げて迎える
// 動き: カメラがカレンダーから窓口へパン / めくれ (f6-18) / 赤丸 (f20-30) / シャッター (f14-34) / 手を挙げる (f32-)
const Nm136: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const sc = lerp(1.12, 1, cam);
  const cx = lerp(420, 960, cam);
  const cy = lerp(440, 540, cam);
  const flip = easeInOut(seg(f, 6, 18));
  const circ = seg(f, 20, 30);
  const sh = easeInOut(seg(f, 14, 34));
  const shBottom = lerp(600, 250, sh);
  const greet = f > 32;
  const ticket = seg(f, 30, 40);
  return (
    <Frame f={f} seed={4136}>
      <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 壁と床 */}
        <rect x={-40} y={-40} width={W + 80} height={880} fill={C.wallOffice} />
        <rect x={-40} y={700} width={W + 80} height={120} fill={C.wallOfficeDark} />
        <line x1={-40} y1={700} x2={W + 40} y2={700} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={820} width={W + 80} height={300} fill={C.floorTile} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 - 40} y1={820} x2={i * 260 - 500} y2={1100} stroke={C.tileLine} strokeWidth={3} />
        ))}
        <line x1={-40} y1={900} x2={W + 40} y2={900} stroke={C.tileLine} strokeWidth={3} />
        <line x1={-40} y1={820} x2={W + 40} y2={820} stroke={KRP.ink} strokeWidth={5} />
        {/* カレンダー */}
        <NG1Calendar x={150} y={200} w={460} h={490}
          from={{ year: 2025, month: 4, start: 2, days: 30 }} to={{ year: 2025, month: 5, start: 4, days: 31 }}
          flipT={flip} circle={26} circleT={circ} />
        <TagPlate x={380} y={772} text="2025年5月" size={44} t={seg(f, 18, 26)} fill={KRP.yellow} />
        {/* 時計 8:30 */}
        <g transform="translate(720 150)">
          <circle r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-52} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform="rotate(255)" />
          <line x1={0} y1={0} x2={0} y2={-48} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${180 + f * 0.15})`} />
          <line x1={0} y1={6} x2={0} y2={-50} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
          <circle r={6} fill={KRP.ink} />
        </g>
        {/* 番号札の機械 */}
        <g transform="translate(700 470)">
          <rect x={-60} y={0} width={120} height={350} rx={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-44} y={20} width={88} height={60} rx={6} fill={KRP.ink} />
          <text x={0} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.green}>001</text>
          <circle cx={0} cy={120} r={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-34} y={168} width={68} height={10} rx={4} fill={KRP.ink} />
          <rect x={-26} y={172} width={52} height={lerp(0, 50, ticket)} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 窓口の枠と「受付」 */}
        <rect x={800} y={190} width={940} height={440} rx={10} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <TagPlate x={1270} y={128} text="受付" size={46} rot={Math.sin(f / 16) * 1.5} />
        <line x1={1220} y1={88} x2={1210} y2={40} stroke={KRP.ink} strokeWidth={3} />
        <line x1={1320} y1={88} x2={1330} y2={40} stroke={KRP.ink} strokeWidth={3} />
        {/* 窓口の中 (事務室) */}
        <rect x={840} y={230} width={860} height={370} fill={C.wallOfficeDark} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((r) => (
          <g key={r}>
            <rect x={870} y={270 + r * 120} width={260} height={14} fill={C.deskDark} stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={878 + i * 28} y={190 + r * 120} width={24} height={80} rx={3}
                fill={[KRP.blueDeep, KRP.yellow, KRP.green, KRP.orange, KRP.white][(i + r) % 5]} stroke={KRP.ink} strokeWidth={3} />
            ))}
            <rect x={1420} y={270 + r * 120} width={250} height={14} fill={C.deskDark} stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={1428 + i * 30} y={196 + r * 120} width={26} height={74} rx={3}
                fill={[KRP.blue, KRP.white, KRP.red, KRP.yellow][(i + r) % 4]} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        <g transform={`rotate(${greet ? Math.sin(seg(f, 32, 42) * Math.PI) * 6 : 0} 1270 660)`}>
          <NG1Clerk x={1270} y={660} s={1} f={f} face={greet ? "joy" : "smile"} pose="stand" gaze={[0, 2]} />
        </g>
        {/* シャッター (巻き上がる) */}
        <g>
          <rect x={840} y={230} width={860} height={Math.max(0, shBottom - 230)} fill={C.shutter} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 20 }, (_, i) => {
            const yy = shBottom - 18 - i * 18;
            return yy > 232 ? <line key={i} x1={842} y1={yy} x2={1698} y2={yy} stroke={C.shutterLine} strokeWidth={3} /> : null;
          })}
          <rect x={840} y={shBottom - 16} width={860} height={16} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1240} y={shBottom - 12} width={60} height={8} rx={4} fill={KRP.ink} />
          <rect x={826} y={206} width={888} height={40} rx={8} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* カウンター */}
        <rect x={790} y={596} width={960} height={36} rx={6} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={810} y={632} width={920} height={190} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={830 + i * 228} y={652} width={200} height={150} rx={6} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        ))}
        {/* カウンターの上の小物 */}
        <g transform="translate(940 596)">
          <rect x={-30} y={-60} width={60} height={60} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-12} y1={-60} x2={-24} y2={-120} stroke={KRP.blueDeep} strokeWidth={6} />
          <line x1={10} y1={-60} x2={22} y2={-114} stroke={KRP.red} strokeWidth={6} />
        </g>
        <g transform="translate(1600 596)">
          <path d="M -40 0 Q -40 -46 0 -46 Q 40 -46 40 0 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-50} y={-6} width={100} height={10} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-52} r={7} fill={KRP.ink} />
        </g>
        <NG1Plant x={1830} y={840} s={0.9} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #137 戸籍に、名前のふりがなが、載るようになったのです。
// 格: 山 / seed 4137
// 絵: #135 の書類の模式図に、f で**ふりがなの欄が新しく生えて** (からくりの引き出しが出てくるように)、「ヤマダ ハナコ」が印字される。歯車とスタンプの小さなからくりが動く
// どこ: からくり職人の作業台 (真上から)。#135 と同じ戸籍の書類が台に固定され、左に歯車の列、上に印字の台車のレール
// 演出: 歯車がまわると、氏名の欄の下から「ふりがな」の欄が引き出しのように生えて、下の欄が押し下がる。台車が走って「ヤマダ ハナコ」を1字ずつ打つ
// 動き: 歯車 (常時・f6-20で速く) / 引き出し (f6-20) / 台車が打ちながら右へ (f22-38) / 打つたびに小さな火花 / キラッ (f38-) / カメラが寄る
const Nm137: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1, 1.08, cam);
  const dr = easeOut(seg(f, 6, 20));
  const pr = seg(f, 22, 38);
  const away = easeInOut(seg(f, 38, 42));
  const spin = f * 2 + dr * 200;
  const headX = lerp(850, 1175, pr) + away * 120;
  const tap = Math.abs(Math.sin(pr * Math.PI * 7)) * (pr > 0 && pr < 1 ? 1 : 0);
  const kira = seg(f, 36, 42);
  const knobY = 70 + (274 + 92 * dr + 46) * 0.78;
  const pinA = (spin * Math.PI) / 180;
  return (
    <Frame f={f} seed={4137}>
      <g transform={`translate(1000 400) scale(${sc}) translate(-1000 -400)`}>
        {/* 作業台 (濃い板) */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.plank} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <line x1={-40} y1={i * 170 - 10} x2={W + 40} y2={i * 170 - 10} stroke={C.plankDark} strokeWidth={6} />
            <path d={`M -40 ${i * 170 + 70} q 500 ${rnd(37, i) * 30 - 15} 1000 0 q 500 ${rnd(38, i) * 30 - 15} 1000 0`} fill="none" stroke={C.plankDark} strokeWidth={3} opacity={0.6} />
            <circle cx={120 + i * 270} cy={i * 170 + 20} r={6} fill={C.plankDark} />
          </g>
        ))}
        {/* 書類を押さえる真鍮の留め具 */}
        <NG1Koseki x={700} y={70} s={0.78} drawer={dr} furiT={pr} />
        {[[706, 76], [1224, 76]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 26} y={y - 26} width={52} height={52} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={x} cy={y} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 左: 歯車の列 */}
        <rect x={250} y={230} width={420} height={480} rx={18} fill={C.plankDark} stroke={KRP.ink} strokeWidth={5} />
        <NG1Gear x={540} y={330} r={86} teeth={12} rot={spin} />
        <NG1Gear x={380} y={440} r={64} teeth={9} rot={-spin * 1.34 + 10} fill={KRP.copper} />
        <NG1Gear x={530} y={590} r={96} teeth={13} rot={spin * 0.9 + 7} fill={KRP.brass} />
        <NG1Gear x={340} y={640} r={42} teeth={7} rot={-spin * 2} fill={KRP.silver} />
        {/* クランクから引き出しの取っ手へのつなぎ棒 */}
        <line x1={540 + Math.cos(pinA) * 50} y1={330 + Math.sin(pinA) * 50} x2={690} y2={knobY}
          stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        <line x1={540 + Math.cos(pinA) * 50} y1={330 + Math.sin(pinA) * 50} x2={690} y2={knobY}
          stroke={KRP.silver} strokeWidth={7} strokeLinecap="round" />
        <circle cx={540 + Math.cos(pinA) * 50} cy={330 + Math.sin(pinA) * 50} r={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* 印字の台車のレール (ふりがなの欄の上の線にそって) */}
        <rect x={640} y={348} width={700} height={12} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1320} y={318} width={60} height={72} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
        <NG1Gear x={1350} y={354} r={26} teeth={6} rot={spin * 3} fill={KRP.silver} />
        {/* 台車 (打つたびに上下) */}
        {dr > 0.95 && (
          <g transform={`translate(${headX} ${360 + tap * 10})`}>
            <rect x={-24} y={-26} width={48} height={40} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={-10} y={14} width={20} height={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-6} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            {tap > 0.8 && (
              <g stroke={KRP.orange} strokeWidth={4} strokeLinecap="round">
                <line x1={-20} y1={48} x2={-34} y2={58} /><line x1={20} y1={48} x2={34} y2={58} /><line x1={0} y1={52} x2={0} y2={66} />
              </g>
            )}
          </g>
        )}
        {/* 生えた欄の札と矢印 */}
        <TagPlate x={1560} y={470} text="ふりがな" size={42} t={seg(f, 16, 24)} fill={KRP.yellow} />
        <Arrow x={1262} y={418} s={0.8} rot={200} t={seg(f, 18, 26)} />
        <TagPlate x={1560} y={600} text="2025年5月〜" size={34} t={seg(f, 20, 28)} />
        {/* できあがりのキラッ */}
        {kira > 0 && [[830, 446], [1195, 446], [1250, 372]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${pop(clamp01(kira * 1.4 - i * 0.15))})`}>
            <path d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 作業台の小物: 油さし・ドライバー・予備の歯車 */}
        <g transform="translate(1600 820) rotate(-18)">
          <path d="M -60 40 L 60 40 L 44 -40 L -44 -40 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 30 -40 L 110 -120" stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
          <path d="M 30 -40 L 110 -120" stroke={KRP.silver} strokeWidth={6} strokeLinecap="round" />
        </g>
        <g transform="translate(1660 220) rotate(30)">
          <rect x={-20} y={-90} width={40} height={110} rx={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-6} y={20} width={12} height={120} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <NG1Gear x={330} y={880} r={50} teeth={8} rot={-10} fill={KRP.copper} />
        <NG1Gear x={430} y={940} r={34} teeth={6} rot={20} fill={KRP.silver} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #138 まず、役所から通知が届きます。あなたの名前は、こう読みますね、と。
// 格: 山 / seed 4138
// 絵: ★**ふりがなのからくり①**。家の郵便受けから封筒を取り出す人 (現代の人・後ろ姿でもよい)。封筒が開いて、通知の紙に「山田 花子 → ヤマダ ハナコ」と、確認の吹き出し (?)。台所のテーブル・カレンダー・観葉植物
// どこ: 現代の家の玄関から台所へ。左に玄関ドアの内側の郵便受け、右に台所 (タイルの壁・食卓・カレンダー・観葉植物・吊りランプ)
// 演出: 郵便受けから役所の封筒を取り出し、封を開けると通知の紙が大きく浮かび上がる。「山田 花子 ↓ ヤマダ ハナコ」と、確認の吹き出し (？)
// 動き: 封筒が郵便受けから手元へ (f0-12) / ふたが開く (f12-18) / 通知が拡大して浮く (f18-34) / 吹き出しが跳ねる (f32-40) / ランプのゆれ
const Nm138: React.FC<{ f: number }> = ({ f }) => {
  const take = easeInOut(seg(f, 0, 12));
  const open = easeOut(seg(f, 12, 18));
  const rise = easeOut(seg(f, 18, 34));
  const bub = seg(f, 32, 40);
  const ex = lerp(280, 760, take);
  const ey = lerp(455, 690, take) - Math.sin(take * Math.PI) * 60;
  const px = lerp(760, 1250, rise);
  const py = lerp(660, 380, rise);
  const ps = lerp(0.12, 1, rise);
  const look = f >= 18;
  const sway = Math.sin(f / 16) * 3;
  return (
    <Frame f={f} seed={4138}>
      {/* 玄関の壁とドア */}
      <rect x={-40} y={-40} width={660} height={900} fill={C.wallD} />
      <rect x={110} y={110} width={340} height={720} rx={6} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={150} y={150} width={260} height={200} rx={4} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      <rect x={150} y={560} width={260} height={230} rx={4} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      <rect x={400} y={500} width={30} height={70} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {/* ドアの内側の郵便受け (ふたが開いている) */}
      <rect x={196} y={396} width={168} height={120} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
      <rect x={216} y={414} width={128} height={20} rx={4} fill={KRP.ink} />
      <g transform={`rotate(${lerp(0, -40, take)} 196 396)`}>
        <rect x={190} y={380} width={180} height={22} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 傘立てと靴 */}
      <rect x={480} y={700} width={80} height={130} rx={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
      <line x1={500} y1={700} x2={490} y2={600} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
      <line x1={540} y1={700} x2={556} y2={620} stroke={KRP.green} strokeWidth={8} strokeLinecap="round" />
      {/* 台所の壁 */}
      <rect x={600} y={-40} width={1360} height={900} fill={C.kitchenTile} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`v${i}`} x1={640 + i * 130} y1={300} x2={640 + i * 130} y2={600} stroke={C.kitchenLine} strokeWidth={3} />
      ))}
      {[300, 400, 500, 600].map((yy) => <line key={yy} x1={600} y1={yy} x2={W + 40} y2={yy} stroke={C.kitchenLine} strokeWidth={3} />)}
      <rect x={596} y={-40} width={24} height={880} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
      {/* 吊り戸棚 */}
      <rect x={1520} y={40} width={400} height={180} rx={6} fill={C.desk} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1720} y1={40} x2={1720} y2={220} stroke={KRP.ink} strokeWidth={4} />
      {/* 吊りランプ */}
      <g transform={`rotate(${sway} 880 -40)`}>
        <line x1={880} y1={-40} x2={880} y2={110} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 820 170 Q 820 110 880 110 Q 940 110 940 170 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={880} cy={176} rx={20} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* カレンダー (2025) */}
      <NG1Calendar x={1620} y={290} w={240} h={260}
        from={{ year: 2025, month: 7, start: 2, days: 31 }} to={{ year: 2025, month: 7, start: 2, days: 31 }} flipT={1} />
      {/* 床 */}
      <rect x={-40} y={820} width={W + 80} height={300} fill={C.floorTile} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={820} x2={i * 240 - 80} y2={1100} stroke={C.tileLine} strokeWidth={3} />)}
      <line x1={-40} y1={820} x2={W + 40} y2={820} stroke={KRP.ink} strokeWidth={5} />
      {/* 食卓と小物 */}
      <rect x={1000} y={640} width={560} height={34} rx={8} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1030} y={674} width={26} height={170} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={1504} y={674} width={26} height={170} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4.5} />
      <g transform="translate(1110 640)">
        <rect x={-34} y={-70} width={68} height={70} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 34 -54 q 30 0 30 22 q 0 22 -30 22" fill="none" stroke={KRP.ink} strokeWidth={5} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${-12 + i * 24} -80 q ${10 + Math.sin(f / 7 + i) * 8} -20 0 -40`} fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        ))}
      </g>
      <g transform="translate(1440 640)">
        <path d="M -80 -40 Q -80 0 0 0 Q 80 0 80 -40 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-34} cy={-52} r={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={10} cy={-60} r={26} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 30 -56 q 30 -40 50 -10 q -20 20 -50 10 z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <NG1Plant x={1830} y={846} s={1} f={f} />
      {/* 人 (現代の人) */}
      <Person x={760} y={830} s={1.05} f={f} cloth={C.modern} clothDark={C.modernDark}
        pose="hold" face={f >= 36 ? "smile" : look ? "surprised" : "normal"} gaze={look ? [8, -6] : [-6, 6]}
        lean={f >= 36 ? Math.sin((f - 36) / 3) * 2 : 0} />
      {/* 封筒 (手元へ) */}
      <NG1Envelope x={ex} y={ey} s={0.6} rot={lerp(0, -6, take)} open={open} />
      {/* 手元から浮かび上がる通知 (拡大の点線) */}
      {rise > 0 && (
        <g opacity={0.6 * rise} stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="10 10">
          <line x1={760} y1={660} x2={px - 280 * ps} y2={py - 200 * ps} />
          <line x1={760} y1={660} x2={px - 280 * ps} y2={py + 200 * ps} />
        </g>
      )}
      {rise > 0 && (
        <g transform={`translate(${px} ${py}) scale(${ps}) rotate(${lerp(-10, -1.5, rise)})`}>
          <rect x={-272} y={-188} width={560} height={400} rx={8} fill={C.shadow} />
          <rect x={-280} y={-200} width={560} height={400} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-280} y={-200} width={560} height={66} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={-154} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink} letterSpacing={12}>通知</text>
          <text x={-200} y={-80} fontFamily={FONT} fontWeight={800} fontSize={24} fill={KRP.grayDark}>氏名</text>
          <text x={30} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill={NP.sumi} letterSpacing={4}>山田 花子</text>
          <path d="M 30 -30 L 30 14" stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
          <polygon points="8,8 52,8 30,40" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={-250} y={56} width={500} height={92} rx={10} fill={C.furiBg} stroke={KRP.ink} strokeWidth={4.5} />
          <text x={-200} y={84} fontFamily={FONT} fontWeight={800} fontSize={22} fill={KRP.grayDark}>ふりがな</text>
          <text x={30} y={132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink} letterSpacing={4}>ヤマダ ハナコ</text>
          {[0, 1, 2].map((i) => <rect key={i} x={-250} y={164 + i * 0} width={180 - i * 40} height={10} rx={5} fill={KRP.gray} transform={`translate(${i * 200} 0)`} />)}
        </g>
      )}
      {/* 確認の吹き出し */}
      {bub > 0 && (
        <g transform={`translate(1600 180) scale(${pop(bub)})`}>
          <path d="M -40 60 L -90 120 L 0 70 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={0} cy={0} rx={110} ry={84} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -40 60 L -84 112 L -4 68" fill={KRP.white} />
        </g>
      )}
      <QMark x={1600} y={218} s={0.9} f={f} t={bub} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #139 違っていれば、届け出をして、正しい読み方を伝えます。
// 格: 山 / seed 4139
// 絵: ★**ふりがなのからくり②**。分かれ道の看板「合っている」「違う」。「違う」の道へ進むと、スマホの画面・役所の窓口・ポストの3つの扉が並ぶ (届け出の3つの方法)。人が1つを選んで届け出の紙を出す (f)
// どこ: 草原のからくり双六。手前から来た1本の道が分かれ道の道標で左右に分かれる。左の先は家 (そのまま)、右の先に3つの扉 (スマホ・窓口・郵送)
// 演出: 通知を読んだ人が「違う」の道へ走り、3つの扉の前で窓口を選んで届け出の紙を差し入れる。選ばれた扉が光り、ほかの2つは少し暗くなる
// 動き: カメラが分かれ道から扉へ少しパン / 人が走る (f0-22) / 「違う」の札が光る (f4-12) / 紙が扉へ飛ぶ (f26-36) / 扉が光る (f32-42) / 雲と蝶
const Nm139: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const tx = lerp(60, -20, cam);
  const walk = easeInOut(seg(f, 0, 22));
  const pxp = lerp(840, 1430, walk);
  const pyp = lerp(860, 800, walk);
  const moving = walk > 0 && walk < 1;
  const paper = easeInOut(seg(f, 26, 36));
  const lit = seg(f, 32, 42);
  const blink = seg(f, 4, 12);
  const papX = lerp(1430, 1450, paper);
  const papY = lerp(690, 470, paper) - Math.sin(paper * Math.PI) * 60;
  return (
    <Frame f={f} seed={4139}>
      <defs>
        <linearGradient id="ng1sky139" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky} /><stop offset="1" stopColor={KRP.cream} />
        </linearGradient>
      </defs>
      <g transform={`translate(${tx} 0)`}>
        <rect x={-120} y={-40} width={W + 240} height={360} fill="url(#ng1sky139)" />
        <path d={`M ${300 + f * 0.8} 150 q 30 -40 70 -10 q 40 -30 70 10 q 30 0 20 30 h -170 q -20 -20 10 -30 z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <path d={`M ${1100 + f * 0.5} 110 q 26 -34 60 -8 q 34 -26 60 8 q 26 0 18 26 h -146 q -18 -18 8 -26 z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M -120 300 Q 300 200 700 290 Q 1100 210 1500 280 Q 1800 230 2040 290 L 2040 360 L -120 360 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-120} y={300} width={W + 240} height={820} fill={C.grass} />
        <path d="M -120 300 Q 300 200 700 290 Q 1100 210 1500 280 Q 1800 230 2040 290" fill="none" stroke={KRP.ink} strokeWidth={4} />
        {/* 草むらの点々と花 */}
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M ${rnd(91, i) * 2000 - 40} ${360 + rnd(92, i) * 680} l 8 -18 l 8 18`} fill="none" stroke={C.grassDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={rnd(93, i) * 1900} cy={420 + rnd(94, i) * 560} r={9} fill={[KRP.yellow, KRP.white, KRP.red][i % 3]} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 道 (手前から分かれ道へ、左は家・右は扉へ) */}
        <path d="M 640 1120 Q 720 820 800 640 Q 560 520 330 470 L 380 440 Q 620 480 820 590 Q 1100 640 1880 640 L 1880 760 Q 1200 780 980 770 Q 900 900 960 1120 Z"
          fill={C.path} stroke={C.pathEdge} strokeWidth={6} />
        {/* 足あと */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = i / 6;
          if (t > walk) return null;
          return <ellipse key={i} cx={lerp(860, 1400, t) + (i % 2) * 14} cy={lerp(870, 810, t) + (i % 2) * 10} rx={10} ry={6} fill={C.pathEdge} />;
        })}
        {/* 左の先: 家 (合っていれば、そのまま) */}
        <g transform="translate(300 440)" opacity={lerp(1, 0.7, walk)}>
          <rect x={-110} y={-130} width={220} height={130} fill={C.wallA} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="-140,-126 0,-220 140,-126" fill={C.roofB} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-24} y={-80} width={48} height={80} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-90} y={-104} width={50} height={44} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          <rect x={40} y={-104} width={50} height={44} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <TagPlate x={300} y={520} text="そのまま" size={34} fill={KRP.white} />
        {/* 分かれ道の道標 */}
        <g transform="translate(780 0)">
          <rect x={-14} y={300} width={28} height={330} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={632} rx={50} ry={14} fill={C.pathEdge} />
          <g transform="rotate(-3 0 360)" opacity={lerp(1, 0.6, walk)}>
            <polygon points="-300,360 -260,316 40,316 40,404 -260,404" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <text x={-120} y={374} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}>合っている</text>
          </g>
          <g transform="rotate(3 0 470)">
            <polygon points="-40,426 260,426 300,470 260,514 -40,514" fill={blink > 0 && f % 8 < 4 && f < 14 ? KRP.yellow : KRP.orange} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <text x={120} y={484} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>違う</text>
          </g>
        </g>
        {/* 3つの扉 */}
        {[0, 1, 2].map((i) => {
          const dx = 1170 + i * 280;
          const chosen = i === 1;
          return (
            <g key={i} opacity={!chosen ? 1 - 0.4 * lit : 1}>
              <ellipse cx={dx} cy={636} rx={130} ry={18} fill={C.pathEdge} />
              {i === 0 && (
                <g>
                  <rect x={dx - 100} y={250} width={200} height={380} rx={30} fill={C.phone} stroke={KRP.ink} strokeWidth={6} />
                  <rect x={dx - 82} y={290} width={164} height={290} rx={8} fill={C.screen} stroke={KRP.ink} strokeWidth={4} />
                  <rect x={dx - 60} y={312} width={120} height={160} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                  {[0, 1, 2, 3].map((k) => <rect key={k} x={dx - 46} y={332 + k * 30} width={92 - k * 14} height={10} rx={5} fill={KRP.gray} />)}
                  <rect x={dx - 50} y={500} width={100} height={36} rx={18} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={dx - 26} y={266} width={52} height={10} rx={5} fill={KRP.grayDark} />
                  <circle cx={dx} cy={606} r={12} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
                </g>
              )}
              {i === 1 && (
                <g>
                  <rect x={dx - 110} y={300} width={220} height={330} fill={C.wallC} stroke={KRP.ink} strokeWidth={6} />
                  <polygon points={`${dx - 136},${304} ${dx},${228} ${dx + 136},${304}`} fill={C.roofA} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
                  <rect x={dx - 80} y={360} width={160} height={130} fill={C.wallOfficeDark} stroke={KRP.ink} strokeWidth={4.5} />
                  <rect x={dx - 92} y={486} width={184} height={20} rx={4} fill={C.desk} stroke={KRP.ink} strokeWidth={4} />
                  <rect x={dx - 50} y={470} width={100} height={12} rx={3} fill={KRP.ink} />
                  <rect x={dx - 90} y={506} width={180} height={124} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
                  <rect x={dx - 30} y={392} width={60} height={70} rx={30} fill={KRP.gray} opacity={0.5} />
                </g>
              )}
              {i === 2 && (
                <g>
                  <rect x={dx - 90} y={270} width={180} height={360} rx={40} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
                  <path d={`M ${dx - 90} 330 Q ${dx} 250 ${dx + 90} 330`} fill={C.postDark} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={dx - 60} y={360} width={120} height={22} rx={6} fill={KRP.ink} />
                  <rect x={dx - 54} y={420} width={108} height={70} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <rect x={dx - 36} y={444} width={72} height={8} rx={4} fill={KRP.gray} />
                  <rect x={dx - 50} y={540} width={100} height={60} rx={6} fill={C.postDark} stroke={KRP.ink} strokeWidth={4} />
                </g>
              )}
              {/* 選ばれなかった扉は暗く、選ばれた扉は光る */}
              {chosen && lit > 0 && (
                <g opacity={lit}>
                  {Array.from({ length: 10 }, (_, k) => (
                    <line key={k} x1={dx} y1={420} x2={dx + Math.cos((k / 10) * Math.PI * 2 + f / 30) * 190} y2={420 + Math.sin((k / 10) * Math.PI * 2 + f / 30) * 190}
                      stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
        <TagPlate x={1170} y={196} text="スマホ" size={34} t={seg(f, 10, 18)} />
        <TagPlate x={1450} y={196} text="窓口" size={34} t={seg(f, 12, 20)} fill={KRP.yellow} />
        <TagPlate x={1730} y={196} text="郵送" size={34} t={seg(f, 14, 22)} />
        {/* 届け出の紙 (人の手から窓口へ) */}
        {f >= 22 && (
          <g transform={`translate(${papX} ${papY}) rotate(${lerp(-8, 0, paper)}) scale(${lerp(1, 0.7, paper)})`} opacity={1}>
            <rect x={-44} y={-58} width={88} height={116} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>届出</text>
            {[0, 1, 2].map((k) => <rect key={k} x={-30} y={0 + k * 18} width={60 - k * 10} height={8} rx={4} fill={KRP.gray} />)}
          </g>
        )}
        {/* 人 */}
        <Person x={pxp} y={pyp} s={0.8} f={f} cloth={C.modern} clothDark={C.modernDark}
          pose={moving ? "run" : f >= 36 ? "banzai" : "hold"} face={f >= 36 ? "joy" : "normal"} gaze={[4, -6]} />
        {/* 蝶 */}
        <g transform={`translate(${560 + Math.sin(f / 9) * 40} ${720 + Math.cos(f / 7) * 20})`}>
          <ellipse cx={-10} cy={0} rx={12 * Math.abs(Math.cos(f / 3)) + 3} ry={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={10} cy={0} rx={12 * Math.abs(Math.cos(f / 3)) + 3} ry={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #140 そして2026年5月、届け出がなかった人は、通知どおりの読み方で、戸籍に書きこまれました。
// 格: 山 / seed 4140
// 絵: ★**ふりがなのからくり③**。カレンダーが2026年5月に。大きなからくりの印刷機が動き、通知どおりの「ヤマダ ハナコ」が戸籍の書類にガシャンと印字される。届け出をした人の書類は別のレーンを通る
// どこ: 戸籍の印字工場 (からくりの大きな印刷機)。左の壁に2026年のカレンダー、中央にプレス機、右に刷り上がりを掲げる台
// 演出: 5月にめくれると、上のレーンの書類 (届け出なし) がプレスの下へ。ガシャンと通知どおりの「ヤマダ ハナコ」が刷られ、右の台に掲げられる。下のレーンの書類 (届出あり) はプレスを通らず別に流れる
// 動き: カレンダー (f2-14) / 書類が入る (f0-16) / ラムが落ちる (f16-22)・衝撃と揺れ / 上がる (f25-36) / 刷り上がりが台へ (f30-40) / はずみ車・下のレーンは常時
const Nm140: React.FC<{ f: number }> = ({ f }) => {
  const flip = easeInOut(seg(f, 2, 14));
  const docIn = easeInOut(seg(f, 0, 16));
  const down = seg(f, 16, 22);
  const up = easeInOut(seg(f, 25, 36));
  const ramY = 300 + 222 * down * down - 222 * up;
  const hit = f >= 22 && f < 30 ? seg(f, 22, 30) : 0;
  const jit = f >= 22 && f < 28 ? Math.sin(f * 3.1) * 5 * (1 - seg(f, 22, 28)) : 0;
  const docOut = easeInOut(seg(f, 27, 36));
  const docX = f < 27 ? lerp(470, 920, docIn) : lerp(920, 1330, docOut);
  const show = easeOut(seg(f, 30, 40));
  const printed = f >= 22;
  const face = f >= 22 && f < 32 ? "surprised" : f >= 32 ? "joy" : "normal";
  return (
    <Frame f={f} seed={4140}>
      {/* 工場の板壁と窓の光 */}
      <rect x={-40} y={-40} width={W + 80} height={760} fill={C.plank} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={i * 130} y1={-40} x2={i * 130} y2={720} stroke={C.plankDark} strokeWidth={5} />
      ))}
      <rect x={1460} y={-40} width={260} height={130} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      <polygon points="1460,90 1720,90 1640,700 1300,700" fill={KRP.cream} opacity={0.12} />
      <rect x={-40} y={720} width={W + 80} height={400} fill={C.steelDark} />
      <line x1={-40} y1={720} x2={W + 40} y2={720} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={720} x2={i * 220 - 120} y2={1100} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />)}
      {/* カレンダー */}
      <NG1Calendar x={110} y={200} w={300} h={320}
        from={{ year: 2026, month: 4, start: 3, days: 30 }} to={{ year: 2026, month: 5, start: 5, days: 31 }}
        flipT={flip} circle={26} circleT={seg(f, 12, 20)} />
      <TagPlate x={260} y={600} text="2026年5月" size={40} t={seg(f, 10, 18)} fill={KRP.yellow} />
      <g transform={`translate(${jit} ${jit * 0.4})`}>
        {/* 下のレーン (届出あり): プレスを通らず流れる */}
        <rect x={420} y={742} width={1420} height={30} rx={15} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={440 + i * 124} cy={757} r={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {[0, 1, 2, 3].map((i) => {
          const x = 440 + ((i * 360 + f * 6) % 1400);
          return (
            <g key={i} transform={`translate(${x} 742)`}>
              <polygon points="-70,0 50,0 70,-22 -50,-22" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={0} cy={-40} r={18} fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5} />
              <path d="M -8 -40 L -2 -33 L 9 -47" fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })}
        <TagPlate x={560} y={788} text="届出あり" size={30} />
        {/* 上のレーン (届け出なし) */}
        <rect x={420} y={622} width={960} height={38} rx={19} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <NG1Gear key={i} x={444 + i * 130} y={641} r={14} teeth={6} rot={f * 6} fill={KRP.silver} />
        ))}
        <TagPlate x={540} y={520} text="通知どおり" size={32} />
        {/* プレス機の柱と台 */}
        <rect x={640} y={150} width={60} height={480} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1140} y={150} width={60} height={480} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        {[250, 350, 450, 550].map((yy) => (
          <g key={yy}>
            <circle cx={670} cy={yy} r={7} fill={C.steelDark} stroke={KRP.ink} strokeWidth={2.5} />
            <circle cx={1170} cy={yy} r={7} fill={C.steelDark} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 圧力計 */}
        <g transform="translate(670 400)">
          <circle r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -28 12 A 30 30 0 1 1 28 12" fill="none" stroke={KRP.red} strokeWidth={4} />
          <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${-110 + down * 200 - up * 120})`} />
        </g>
        {/* ラムと印字の頭 */}
        <rect x={900} y={200} width={40} height={ramY - 200} fill={C.steelLight} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(0 ${ramY})`}>
          <rect x={760} y={0} width={320} height={90} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          <rect x={780} y={18} width={280} height={30} rx={5} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3.5} />
          <text x={920} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.cream} letterSpacing={3}>ヤマダ ハナコ</text>
          <rect x={770} y={90} width={300} height={14} fill={KRP.ink} />
        </g>
        {/* 冠と はずみ車 */}
        <rect x={600} y={110} width={640} height={110} rx={14} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={620} y={130} width={420} height={70} rx={8} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        <NG1Gear x={1260} y={170} r={104} teeth={14} rot={f * 4 + down * 60} fill={KRP.copper} />
        <circle cx={1100} cy={90} r={20} fill={printed ? KRP.green : KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {printed && <circle cx={1100} cy={90} r={34} fill={KRP.green} opacity={0.25 + 0.1 * Math.sin(f / 3)} />}
        {/* 蒸気 */}
        <rect x={640} y={70} width={30} height={44} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {f >= 22 && [0, 1, 2].map((i) => {
          const t = clamp01((f - 22 - i * 3) / 18);
          return <circle key={i} cx={655 - t * 60} cy={60 - t * 70} r={18 + t * 26} fill={KRP.white} opacity={(1 - t) * 0.8} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 流れる書類 (上のレーン) */}
        {f < 36 && (
          <g transform={`translate(${docX} 622)`} opacity={f < 27 ? 1 : 1 - docOut * 0.7}>
            <polygon points="-110,0 90,0 120,-26 -80,-26" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <polygon points="-60,-8 40,-8 50,-18 -50,-18" fill={printed ? C.furiBg : KRP.cream} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        )}
        {/* 次の書類が入ってくる */}
        {f >= 32 && (
          <g transform={`translate(${lerp(400, 640, easeOut(seg(f, 32, 42)))} 622)`}>
            <polygon points="-110,0 90,0 120,-26 -80,-26" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <polygon points="-60,-8 40,-8 50,-18 -50,-18" fill={KRP.cream} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        )}
        {/* ガシャン の衝撃 */}
        {hit > 0 && (
          <g opacity={1 - hit}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = Math.PI + (i / 9) * Math.PI;
              const r1 = 190 + hit * 30; const r2 = 250 + hit * 70;
              return <line key={i} x1={920 + Math.cos(a) * r1} y1={612 + Math.sin(a) * r1 * 0.5} x2={920 + Math.cos(a) * r2} y2={612 + Math.sin(a) * r2 * 0.5}
                stroke={KRP.yellow} strokeWidth={10} strokeLinecap="round" />;
            })}
            <ellipse cx={920} cy={614} rx={180 + hit * 40} ry={22} fill="none" stroke={KRP.orange} strokeWidth={6} />
          </g>
        )}
      </g>
      {/* 刷り上がりを掲げる台 */}
      <g opacity={show} transform={`translate(${lerp(-90, 0, show)} 0)`}>
        <line x1={1500} y1={560} x2={1450} y2={730} stroke={C.deskDark} strokeWidth={14} strokeLinecap="round" />
        <line x1={1660} y1={560} x2={1710} y2={730} stroke={C.deskDark} strokeWidth={14} strokeLinecap="round" />
        <NG1Koseki x={1420} y={110} s={0.45} drawer={1} furiT={1} knobs={false} />
        <rect x={1400} y={570} width={350} height={20} rx={6} fill={C.desk} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={1730} cy={150} r={30} fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.85} transform={`rotate(-8 1730 150)`} />
        <text x={1730} y={161} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.red}>記</text>
      </g>
      <Arrow x={1410} y={500} s={0.75} t={show} />
      {/* 見守る職員 */}
      <NG1Clerk x={1826} y={830} s={0.72} f={f} face={face as "normal" | "surprised" | "joy"} pose="stand" gaze={[-8, 0]} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #141 ルールは、一般に認められている読み方であること。
// 格: 図 / seed 4141
// 絵: 役所の「読み方の物差し」のからくり (真鍮の物差しの形)。漢字の札が物差しの上を通って、緑のランプ (○) が点く。札「一般に認められている読み方」
// どこ: 役所の奥の審査机 (緑のフェルトの上)。真鍮の「読み方の物差し」のからくりが横たわる
// 演出: 「花子 / ハナコ」の札が物差しの上をすべり、門のところで物差しの緑の目盛り (一般に認められている範囲) に札の切れ込みがぴたりとはまる → 緑のランプが点いて ○
// 動き: カメラが札を追う / 札がすべる (f4-26) / 門の光線 (f24-30) / 緑ランプ点灯 (f28-34) / ○ (f32-40) / 待つ札の列がゆれる
const Nm141: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 36));
  const tx = lerp(140, 0, cam);
  const slide = easeInOut(seg(f, 4, 26));
  const cx = lerp(420, 960, slide);
  const scan = seg(f, 24, 30);
  const on = seg(f, 28, 34);
  const ok = seg(f, 32, 40);
  return (
    <Frame f={f} seed={4141}>
      <g transform={`translate(${tx} 0)`}>
        {/* 机とフェルト */}
        <rect x={-200} y={-40} width={W + 400} height={H + 80} fill={C.desk} />
        <g stroke={C.grain} strokeWidth={5} opacity={0.6} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -200 ${30 + i * 140} q 520 ${rnd(51, i) * 40 - 20} 1100 0 q 520 ${rnd(52, i) * 40 - 20} 1100 0`} />
          ))}
        </g>
        <rect x={60} y={150} width={1800} height={760} rx={16} fill={C.felt} stroke={KRP.ink} strokeWidth={6} />
        <rect x={84} y={174} width={1752} height={712} rx={10} fill="none" stroke={C.feltDark} strokeWidth={4} />
        {/* 物差しの本体 (真鍮) */}
        <rect x={190} y={496} width={1560} height={150} rx={14} fill={NP.brassDark} />
        <rect x={180} y={480} width={1560} height={150} rx={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={200} y={500} width={1520} height={22} rx={6} fill={KRP.cream} opacity={0.35} />
        {/* 目盛り */}
        {Array.from({ length: 61 }, (_, i) => (
          <line key={i} x1={210 + i * 25} y1={480} x2={210 + i * 25} y2={480 + (i % 10 === 0 ? 46 : i % 5 === 0 ? 32 : 20)} stroke={KRP.ink} strokeWidth={i % 5 === 0 ? 4 : 2.5} />
        ))}
        {/* 緑の範囲 (一般に認められている読み方) */}
        <rect x={880} y={560} width={160} height={50} rx={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} opacity={0.4 + 0.6 * on} />
        <rect x={420} y={566} width={120} height={38} rx={8} fill={KRP.ink} opacity={0.25} />
        <rect x={1380} y={566} width={120} height={38} rx={8} fill={KRP.ink} opacity={0.25} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={210 + i * 506} cy={600} r={9} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* すべる札 (花子 / ハナコ)。下に切れ込み */}
        <g transform={`translate(${cx} 470)`}>
          <rect x={-104} y={-190} width={208} height={190} rx={12} fill={C.shadow} transform="translate(8 8)" />
          <path d="M -104 -178 Q -104 -190 -92 -190 L 92 -190 Q 104 -190 104 -178 L 104 0 L 30 0 L 30 -14 L -30 -14 L -30 0 L -104 0 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.grayDark}>ハナコ</text>
          <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={NP.sumi}>花子</text>
          {/* 下の目盛り針 */}
          <polygon points="-10,0 10,0 0,120" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 門 (読み取り機) */}
        <rect x={818} y={260} width={30} height={380} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1072} y={260} width={30} height={380} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={790} y={220} width={340} height={60} rx={10} fill={C.steelLight} stroke={KRP.ink} strokeWidth={5} />
        {scan > 0 && scan < 1 && (
          <polygon points={`850,280 1070,280 1070,470 850,470`} fill={KRP.yellow} opacity={0.35 * Math.sin(scan * Math.PI)} />
        )}
        {/* ランプ: 赤 (消えたまま) と緑 */}
        <circle cx={910} cy={190} r={28} fill={C.lampOff} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={910} cy={190} r={12} fill={C.lampRed} opacity={0.5} />
        <circle cx={1010} cy={190} r={28} fill={on > 0 ? C.lampGreen : C.lampOff} stroke={KRP.ink} strokeWidth={5} />
        {on > 0 && <circle cx={1010} cy={190} r={44 + Math.sin(f / 3) * 4} fill={C.lampGreen} opacity={0.3 * on} />}
        <Maru x={1180} y={230} s={0.85} t={ok} />
        <TagPlate x={960} y={760} text="一般に認められている読み方" size={40} t={seg(f, 30, 38)} fill={KRP.white} />
        {/* 待っている札の列 (左) と、通った札の箱 (右) */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${160 + i * 26} ${250 + i * 20}) rotate(${-6 + i * 4 + Math.sin(f / 10 + i) * 1.5})`}>
            <rect x={-70} y={-60} width={140} height={120} rx={10} fill={NP.wood} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={NP.sumi}>{["太郎", "一郎", "陽子"][i]}</text>
          </g>
        ))}
        <g transform="translate(1660 300)">
          <rect x={-120} y={-80} width={240} height={160} rx={10} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-100} y={-60} width={200} height={120} rx={6} fill={C.desk} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={-70} y={-100} width={140} height={60} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} transform="rotate(-5)" />
          <rect x={-60} y={-86} width={140} height={60} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} transform="rotate(6)" />
          <circle cx={90} cy={-80} r={20} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #142 法務省は、認められない例を挙げています。
// 格: 並 / seed 4142
// 絵: 役所の掲示板 (コルクボード) に、3枚の札が伏せて貼られている。役人が指さす。札「法務省の例」
// どこ: 役所の廊下の掲示板 (コルクボード・木の枠)。まわりに古い掲示物、壁の時計、長椅子と観葉植物
// 演出: 「法務省の例」の見出しの下に、伏せた3枚の札が1枚ずつ画びょうで留められていく。職員が指し棒で指し、真ん中の札の角がぴらっとめくれかける (次の文で中身が出る)
// 動き: カメラが掲示板へ寄る / 札が1枚ずつ留まる (f6-14, 12-20, 18-26) / 指し棒が札をたどる / 角のめくれ (f32-) / 職員のまばたき
const Nm142: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1, 1.05, cam);
  const pin = [seg(f, 6, 14), seg(f, 12, 20), seg(f, 18, 26)];
  const curl = seg(f, 32, 40) * (0.7 + 0.3 * Math.sin(f / 4));
  const tipT = easeInOut(seg(f, 8, 28));
  const tipX = lerp(800, 1150, tipT) + Math.sin(f / 10) * 6;
  const tipY = lerp(520, 470, tipT);
  return (
    <Frame f={f} seed={4142}>
      <g transform={`translate(1100 440) scale(${sc}) translate(-1100 -440)`}>
        {/* 壁・腰板・床 */}
        <rect x={-40} y={-40} width={W + 80} height={820} fill={C.wallOffice} />
        <rect x={-40} y={660} width={W + 80} height={140} fill={C.wallOfficeDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={800} width={W + 80} height={320} fill={C.floorTile} />
        <line x1={-40} y1={800} x2={W + 40} y2={800} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={800} x2={i * 260 - 160} y2={1100} stroke={C.tileLine} strokeWidth={3} />)}
        {/* 壁の時計 */}
        <g transform="translate(430 190)">
          <circle r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform="rotate(300)" />
          <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${60 + f * 0.15})`} />
          <line x1={0} y1={6} x2={0} y2={-46} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
          <circle r={6} fill={KRP.ink} />
        </g>
        {/* 掲示板 */}
        <rect x={628} y={138} width={1100} height={560} rx={8} fill={C.shadow} />
        <rect x={610} y={120} width={1100} height={560} rx={8} fill={C.frameWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={638} y={148} width={1044} height={504} fill={C.cork} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={650 + rnd(71, i) * 1020} cy={160 + rnd(72, i) * 480} r={3} fill={C.corkDark} />
        ))}
        {/* 古い掲示物 (隅に) */}
        <g transform="translate(700 560) rotate(-6)">
          <rect x={-40} y={-56} width={80} height={112} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={-28} y={-40 + k * 22} width={56 - k * 8} height={8} rx={4} fill={KRP.gray} />)}
          <circle cx={0} cy={-50} r={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        <g transform="translate(1630 570) rotate(5)">
          <rect x={-40} y={-56} width={80} height={112} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
          {[0, 1, 2].map((k) => <rect key={k} x={-28} y={-36 + k * 24} width={56} height={8} rx={4} fill={KRP.grayDark} opacity={0.6} />)}
          <circle cx={0} cy={-50} r={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        <TagPlate x={1160} y={206} text="法務省の例" size={46} fill={KRP.white} />
        {/* 伏せた3枚の札 */}
        {[0, 1, 2].map((i) => {
          const cxp = 870 + i * 290;
          const p = pin[i];
          if (p <= 0) return null;
          const drop = (1 - easeOut(p)) * -60;
          const rot = [-3, 1.5, 3.5][i] + (1 - p) * 8;
          const mid = i === 1;
          return (
            <g key={i} transform={`translate(${cxp} ${440 + drop}) rotate(${rot})`} opacity={clamp01(p * 2)}>
              <rect x={-116} y={-150} width={232} height={300} rx={8} fill={C.shadow} transform="translate(8 10)" />
              <rect x={-116} y={-150} width={232} height={300} rx={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-100} y={-134} width={200} height={268} rx={4} fill="none" stroke={KRP.blueSoft} strokeWidth={4} />
              {Array.from({ length: 6 }, (_, k) => (
                <line key={k} x1={-100} y1={-134 + k * 50} x2={-100 + Math.min(200, 268 - k * 50)} y2={-134 + k * 50 + Math.min(200, 268 - k * 50)}
                  stroke={KRP.blueSoft} strokeWidth={3} opacity={0.5} />
              ))}
              <circle cx={0} cy={0} r={54} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
              <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.ink}>{i + 1}</text>
              {/* めくれかける角 (真ん中の札) */}
              {mid && curl > 0 && (
                <g>
                  <polygon points={`116,${150 - 70 * curl} 116,150 ${116 - 70 * curl},150`} fill={C.cork} />
                  <polygon points={`116,${150 - 70 * curl} ${116 - 70 * curl},150 ${116 - 60 * curl},${150 - 60 * curl}`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                </g>
              )}
              {/* 画びょう */}
              <g transform={`translate(0 -150) scale(${pop(seg(p, 0.6, 1))})`}>
                <circle r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={-5} cy={-5} r={5} fill={KRP.white} opacity={0.6} />
              </g>
              {p > 0.6 && p < 1 && (
                <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - p}>
                  <line x1={-140} y1={-150} x2={-170} y2={-160} /><line x1={140} y1={-150} x2={170} y2={-160} />
                </g>
              )}
            </g>
          );
        })}
        {/* 長椅子と植物 */}
        <rect x={1760} y={700} width={240} height={30} rx={8} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1780} y={730} width={20} height={80} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <NG1Plant x={150} y={830} s={0.95} f={f} />
        {/* 職員と指し棒 */}
        <line x1={541} y1={688} x2={tipX} y2={tipY} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={541} y1={688} x2={tipX} y2={tipY} stroke={C.desk} strokeWidth={5} strokeLinecap="round" />
        <circle cx={tipX} cy={tipY} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <NG1Clerk x={380} y={840} s={1.05} f={f} face="normal" pose="point" pointDir={1} gaze={[8, -4]} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_134: (f) => <Nm134 f={f} />,
  nm_135: (f) => <Nm135 f={f} />,
  nm_136: (f) => <Nm136 f={f} />,
  nm_137: (f) => <Nm137 f={f} />,
  nm_138: (f) => <Nm138 f={f} />,
  nm_139: (f) => <Nm139 f={f} />,
  nm_140: (f) => <Nm140 f={f} />,
  nm_141: (f) => <Nm141 f={f} />,
  nm_142: (f) => <Nm142 f={f} />,
};

export const NM_G1_MOTIFS: string[] = [
  "nm_134", // #134
  "nm_135", // #135
  "nm_136", // #136
  "nm_137", // #137
  "nm_138", // #138
  "nm_139", // #139
  "nm_140", // #140
  "nm_141", // #141
  "nm_142", // #142
];

export const namaeG1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
