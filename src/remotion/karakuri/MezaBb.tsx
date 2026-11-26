// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#36〜#47 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, skyColors, mixColor, Flame,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
} as const;
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

// 色 (このファイルだけ)
const CB = {
  shu: "#C8442F", // 朱塗り
  shuDark: "#8E2E22",
  kawara: "#4E5866", // 瓦
  kawaraDark: "#343B46",
  robe: "#6B4E8A", // 鶏人の衣 (紫がかった長衣)
  robeDark: "#4C3666",
  crest: "#E0352B", // とさか
  hood: "#B8322A", // 赤い頭巾
  official: "#3E5A7A", // 役人の衣
  officialDark: "#2B4260",
  bamboo: "#D9BE7C", // 竹簡
  bambooDark: "#A98C4E",
  hoodie: "#E8923A", // あなたの橙のパーカー
  hoodieDark: "#B96E24",
  guard: "#2E3F66", // 係員の紺の制服
  guardDark: "#1F2C4A",
  museumWall: "#E6DCCB",
  museumFloor: "#B98D5E",
  glass: "#CFE6EE",
  hen: "#FBF8F0", // 雄鶏の白
  henShade: "#DDD6C6",
  beak: "#F2B634",
  straw: "#E2C273",
  strawDark: "#B8963F",
  metal: "#9AA3AD",
  metalDark: "#5F6872",
  brain: "#E9B7B0",
  brainDark: "#C98C86",
} as const;

// -------------------------------------------------------------------
// MzBbFig: Person の腕だけ消して、腕を自分で付け直す人物 (腕は必ず2本)
//   x,y 足元 / arms: [[左の角度, 長さ], [右の角度, 長さ]] (角度0=下にたれる・180=真上。
//   左腕は+で外へ、右腕は−で外へ)。手の位置 = 肩(±67,-148) + len*(−sinθ, cosθ)
//   over: 頭まわりに重ねる物 (ローカル座標、頭の中心は (0,-228))
//   behind: 体の後ろに描く物 (ローカル座標)
// -------------------------------------------------------------------
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
const armEnd = (side: -1 | 1, rot: number, len: number): [number, number] => {
  const a = (rot * Math.PI) / 180;
  return [side * 67 - Math.sin(a) * len, -148 + Math.cos(a) * len];
};
const MzBbFig: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; cloth?: string; clothDark?: string;
  hair?: "cap" | "none"; phase?: number; lean?: number; arms: [[number, number], [number, number]];
  sleeve?: string; hand?: boolean; over?: React.ReactNode; behind?: React.ReactNode; gaze?: [number, number];
  sleeveW?: number;
}> = ({ x, y, s = 1, f, face = "normal", cloth = "#3E4B66", clothDark = "#2E3850", hair = "cap", phase = 0, lean = 0,
  arms, sleeve, hand = true, over, behind, gaze, sleeveW = 22 }) => {
  const id = "mzbbfig" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const sides: (-1 | 1)[] = [-1, 1];
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {behind}
      {sides.map((sd, i) => {
        const [rot, len] = arms[i];
        const [hx, hy] = armEnd(sd, rot, len);
        return (
          <g key={sd}>
            <rect x={sd * 67 - sleeveW / 2} y={-148} width={sleeveW} height={len} rx={sleeveW / 2}
              fill={sleeve ?? cloth} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${rot} ${sd * 67} -148)`} />
            {hand && <circle cx={hx} cy={hy} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />}
          </g>
        );
      })}
      <defs>
        <clipPath id={id}>
          <rect x={-61} y={-172} width={122} height={180} />
          <circle cx={0} cy={-228} r={74} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Person x={0} y={0} s={1} f={f} face={face} cloth={cloth} clothDark={clothDark} hair={hair} phase={phase} still gaze={gaze} />
      </g>
      {over}
    </g>
  );
};

// 眠そうな目 (Person の目の上に重ねる。頭のローカル座標)
const MzBbSleepyEyes: React.FC<{ k?: number }> = ({ k = 0.6 }) => (
  <g>
    {[-24, 24].map((ex) => (
      <g key={ex}>
        <path d={`M ${ex - 16} -244 L ${ex + 16} -244 L ${ex + 16} ${-242 + 38 * k} L ${ex - 16} ${-242 + 38 * k} Z`} fill={KRP.white} />
        <path d={`M ${ex - 14} ${-242 + 38 * k} Q ${ex} ${-238 + 38 * k + (k > 0.9 ? 6 : 0)} ${ex + 14} ${-242 + 38 * k}`} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      </g>
    ))}
  </g>
);
// 大きく開けた口 (大声・あくび)。open 0〜1
const MzBbMouth: React.FC<{ open: number; w?: number }> = ({ open, w = 1 }) => (
  <g>
    <ellipse cx={0} cy={-186} rx={18 * w} ry={8} fill={KRP.white} />
    <ellipse cx={0} cy={-184 + open * 4} rx={(10 + 10 * open) * w} ry={6 + 16 * open} fill={KRP.ink} />
    <ellipse cx={0} cy={-176 + open * 10} rx={(5 + 6 * open) * w} ry={3 + 4 * open} fill="#E06A5A" />
  </g>
);
// 鶏人のかぶり物: 赤い頭巾 + とさかの赤い冠 (頭のローカル座標。back=true で後ろ姿)
const MzBbKeijinHat: React.FC<{ f: number; back?: boolean }> = ({ f, back }) => {
  const wob = Math.sin(f / 7) * 2;
  return (
    <g>
      {/* 頭巾 (頭の後ろと左右へ垂れる) */}
      <path d={back
        ? "M -70 -232 Q -72 -300 0 -302 Q 72 -300 70 -232 L 74 -168 Q 0 -150 -74 -168 Z"
        : "M -70 -236 Q -72 -300 0 -302 Q 72 -300 70 -236 L 78 -176 L 58 -172 L 56 -232 Q 30 -262 0 -262 Q -30 -262 -56 -232 L -58 -172 L -78 -176 Z"}
        fill={CB.hood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {!back && <path d="M -56 -244 Q 0 -270 56 -244" stroke="#8E241E" strokeWidth={5} fill="none" />}
      {/* 冠の台 */}
      <rect x={-34} y={-318} width={68} height={22} rx={6} fill={MP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      {/* とさか (3つのこぶ) */}
      <path d={`M -32 -316 Q -40 -350 -18 -352 Q -14 -378 6 -372 Q 18 -394 30 -370 Q 46 -362 34 -340 Q 40 -326 32 -316 Z`}
        fill={CB.crest} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" transform={`rotate(${wob} 0 -316)`} />
      <path d="M -16 -334 Q -6 -346 6 -352" stroke="#F47A6A" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8}
        transform={`rotate(${wob} 0 -316)`} />
    </g>
  );
};
// 長い袖の衣 (胴の前に重ねる。ローカル座標)。すそは足首まで
const MzBbRobe: React.FC<{ fill?: string; dark?: string; belt?: string }> = ({ fill = CB.robe, dark = CB.robeDark, belt = MP.brass }) => (
  <g>
    <path d="M -58 -158 L 58 -158 L 74 -10 Q 0 4 -74 -10 Z" fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -22 -158 L 0 -112 L 22 -158" fill="none" stroke={KRP.white} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -22 -158 L 0 -112 L 22 -158" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
    <rect x={-62} y={-96} width={124} height={16} rx={4} fill={belt} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -30 -78 L -38 -12 M 30 -78 L 38 -12" stroke={dark} strokeWidth={5} opacity={0.7} />
  </g>
);
// 白い雄鶏 (x,y=足元。s=1 で高さ約260。dir=1 で右向き)。head: 首の角度 / mouth: くちばしの開き / boss: とさか大
const MzBbRooster: React.FC<{
  x: number; y: number; s?: number; f: number; dir?: 1 | -1; head?: number; mouth?: number; tilt?: number;
  eye?: "normal" | "side" | "closed"; puff?: number; preen?: number;
}> = ({ x, y, s = 1, f, dir = 1, head = 0, mouth = 0, tilt = 0, eye = "normal", puff = 0, preen = 0 }) => {
  const br = Math.sin(f / 11) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      {/* 脚 */}
      {[-18, 14].map((lx, i) => (
        <g key={i}>
          <path d={`M ${lx} -70 L ${lx + 2} -8`} stroke={CB.beak} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${lx + 2} -6 L ${lx + 24} -2 M ${lx + 2} -6 L ${lx - 14} -2 M ${lx + 2} -6 L ${lx + 10} 2`} stroke="#D99A1E" strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      {/* 尾羽 (黒みどりの鎌羽を2本 + 白) */}
      <path d="M -60 -120 Q -130 -230 -90 -260 Q -96 -190 -44 -150 Z" fill="#2F4A3E" stroke={KRP.ink} strokeWidth={5} />
      <path d="M -66 -110 Q -150 -170 -128 -220 Q -110 -160 -50 -128 Z" fill="#3E5E4E" stroke={KRP.ink} strokeWidth={5} />
      <path d="M -64 -104 Q -120 -140 -112 -186 Q -86 -140 -46 -118 Z" fill={CB.hen} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 胴 */}
      <path d={`M -70 -110 Q -76 -60 -20 -58 Q 50 -56 70 -110 Q 80 -150 ${50 + puff * 6} ${-170 - puff * 4} Q 0 -150 -70 -110 Z`}
        fill={CB.hen} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      {/* 翼 (preen で少し持ち上がる) */}
      <g transform={`rotate(${-preen * 18 + br} -6 -110)`}>
        <path d="M -44 -116 Q -10 -132 30 -112 Q 20 -80 -30 -78 Q -54 -88 -44 -116 Z" fill={CB.henShade} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -30 -104 Q 0 -110 18 -100 M -32 -92 Q -4 -96 12 -88" stroke="#BFB6A4" strokeWidth={3.5} fill="none" />
      </g>
      {/* 首と頭 */}
      <g transform={`rotate(${head} 50 -150)`}>
        <path d={`M 34 -150 Q 30 -200 56 -222 Q 84 -232 92 -206 Q 96 -170 ${74 + puff * 8} -142 Z`} fill={CB.hen} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {puff > 0.05 && <ellipse cx={74} cy={-168} rx={14 + puff * 12} ry={10 + puff * 12} fill={CB.hen} stroke={KRP.ink} strokeWidth={4} />}
        <g transform={`rotate(${tilt} 70 -210)`}>
          {/* とさか */}
          <path d="M 46 -224 Q 40 -250 56 -250 Q 58 -270 72 -262 Q 82 -276 90 -258 Q 102 -252 94 -232 Q 80 -222 46 -224 Z" fill={CB.crest} stroke={KRP.ink} strokeWidth={4.5} />
          {/* くちばし (mouth で開く) */}
          <path d={`M 90 -214 L 116 ${-206 - mouth * 6} L 92 -202 Z`} fill={CB.beak} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M 92 -202 L 112 ${-196 + mouth * 12} L 90 -194 Z`} fill="#E09A1E" stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* 肉垂れ */}
          <path d="M 86 -196 Q 92 -174 80 -172 Q 72 -180 78 -196 Z" fill={CB.crest} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 目 */}
          {eye === "closed" ? <path d="M 64 -214 Q 72 -208 80 -214" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            : <g><circle cx={72} cy={-212} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={eye === "side" ? 68 : 74} cy={-212} r={3.5} fill={KRP.ink} /></g>}
        </g>
      </g>
    </g>
  );
};
// 音の線 (大声・鳴き声)。x,y から dir 方向へ扇形に広がる弧
const MzBbShout: React.FC<{ x: number; y: number; f: number; amt: number; dir?: number; spread?: number; n?: number; r0?: number; step?: number; color?: string; w?: number }> = ({
  x, y, f, amt, dir = 0, spread = 50, n = 4, r0 = 40, step = 46, color = KRP.ink, w = 8 }) => {
  if (amt <= 0.02) return null;
  const pulse = (f % 8) / 8;
  return (
    <g opacity={clamp01(amt * 1.5)}>
      {Array.from({ length: n }, (_, i) => {
        const r = r0 + (i + pulse) * step;
        const a0 = ((dir - spread) * Math.PI) / 180, a1 = ((dir + spread) * Math.PI) / 180;
        return <path key={i} d={`M ${x + Math.cos(a0) * r} ${y + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r}`}
          stroke={color} strokeWidth={w * (1 - i / (n + 2))} fill="none" strokeLinecap="round" opacity={1 - (i + pulse) / (n + 1)} />;
      })}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #36 つまり、体だけなら、人はちゃんと起きられます。
// 格: 並 / seed 6036
// 絵: どこ: Shinshitsu (sky=1→2, sleeper=1→0, alarms=0)。寝室の朝。スマホはナイトテーブルに伏せて置かれ、鳴っていない。演出: カーテンのすき間から朝の光がすっと差し込み、「あなた」(水色のパジャマ・hair="cap") の顔に届く。目覚ましは1つも鳴らないのに、「あなた」は自分からぱちっと目を開け、ゆっくり起き上がって大きく伸びをする (face="smile")。枕の上に Kobito が1人ちょこんと出てきて、親指を立てる。壁の時計は、窓の外の日の出の少しあと。腕は2本 (「あなた」は pose="stretch")。動き: f0-40 光が差し込む / f40 目を開ける / f50-110 起き上がる・伸び / f110-140 Kobito の親指 / カメラは寝室の全景からベッドへ少し寄る
// どこ: 共有の寝室 Shinshitsu (sky 1→2 の朝・alarms=0・布団あり)。寝ている顔は部品に描かせず (head=false) 自分で描く
// 演出: カーテンのすき間の光がベッドへ伸びて顔に届く → 目がぱちっと開く → 腰を支点に起き上がり、両腕を上へ伸ばす。
//       スマホは暗いまま (0件)。枕の上に小人がぽんと出て親指を立てる
// 動き: f0-14 光 / f14 目を開ける / f16-34 起き上がる / f32- 伸び (腕がゆっくり揺れる) / f28-40 小人 / カメラは全景→ベッドへ寄る
//       (f=45 で「起き上がって伸び+小人の親指+鳴っていないスマホ」がそろう)
const Mz036: React.FC<{ f: number }> = ({ f }) => {
  const sky = 1 + easeOut(seg(f, 0, 30));
  const beam = easeOut(seg(f, 0, 14));
  const open = f >= 14;
  const up = easeInOut(seg(f, 16, 34));
  const stretch = easeOut(seg(f, 30, 42));
  const sway = Math.sin(f / 10) * 4 * stretch;
  const cam = easeInOut(seg(f, 0, 60));
  const camS = lerp(1, 1.14, cam);
  const kob = pop(seg(f, 28, 38));
  const kobBob = Math.sin((f + 3 * 17) / 13) * 3;
  // 腰を支点に、寝た姿 (80°) → 起きた姿 (−4°)
  const hip: [number, number] = [930, 652];
  const rot = lerp(80, -4, up);
  // 腕: 寝ているあいだは体の横、伸びで真上へ
  const armL: [number, number] = [lerp(8, 166, stretch) + sway, 82];
  const armR: [number, number] = [lerp(-8, -166, stretch) - sway, 82];
  const motes = Array.from({ length: 9 }, (_, i) => i);
  return (
    <Frame f={f} seed={6036}>
      <g transform={`translate(${900 * (1 - camS)} ${560 * (1 - camS)}) scale(${camS})`}>
        <Shinshitsu f={f} sky={sky} sleeper={0.5} alarms={0} head={false} time={6 * 60 + 24} />
        {/* カーテンのすき間から差す朝の光 (顔へ届く) */}
        <polygon points={`742,300 770,300 ${lerp(770, 1010, beam)},${lerp(300, 560, beam)} ${lerp(742, 900, beam)},${lerp(300, 640, beam)}`}
          fill="#FFF0B4" opacity={0.5 * beam} />
        <polygon points={`748,300 764,300 ${lerp(764, 980, beam)},${lerp(300, 560, beam)} ${lerp(748, 930, beam)},${lerp(300, 610, beam)}`}
          fill="#FFFBE0" opacity={0.55 * beam} />
        {motes.map((i) => {
          const t = ((f / 90 + i / 9) % 1);
          return <circle key={i} cx={lerp(770, 960, (i * 0.37) % 1) + Math.sin(f / 15 + i) * 8} cy={lerp(330, 600, t)} r={3}
            fill="#FFF8D8" opacity={beam * Math.sin(t * Math.PI) * 0.9} />;
        })}
        {/* あなた (水色のパジャマ)。腰から先を回して起き上がる */}
        <g transform={`translate(${hip[0]} ${hip[1]}) rotate(${rot})`}>
          <MzBbFig x={0} y={58 * 0.82} s={0.82} f={f} cloth={MP.you} clothDark={MP.youDark} hair="cap"
            face={open ? (stretch > 0.5 ? "joy" : "smile") : "normal"} arms={[armL, armR]} phase={1}
            over={!open ? <MzBbSleepyEyes k={1} /> : null} />
        </g>
        {/* 腰まわりにかかる布団のふくらみ (体の下半分を隠す) */}
        <path d={`M 800 ${650 - up * 6} Q 860 ${612 - up * 10} 960 ${620 - up * 4} Q 1010 626 1016 660 L 1016 704 L 800 704 Z`}
          fill="#EFC46A" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 860 640 L 858 700 M 940 632 L 938 700" stroke="#C99A3E" strokeWidth={4} opacity={0.55} />
        {/* 目が開いた瞬間の「ぱちっ」 */}
        {f >= 14 && f < 30 && (() => {
          const k = seg(f, 14, 30);
          const hx = hip[0] + Math.sin((rot * Math.PI) / 180) * 150, hy = hip[1] - Math.cos((rot * Math.PI) / 180) * 150;
          return <g opacity={1 - k}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (-150 + i * 30) * Math.PI / 180;
              return <line key={i} x1={hx + Math.cos(a) * (70 + k * 20)} y1={hy + Math.sin(a) * (70 + k * 20)} x2={hx + Math.cos(a) * (96 + k * 30)} y2={hy + Math.sin(a) * (96 + k * 30)}
                stroke={MP.dawn} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>;
        })()}
        {/* 枕の上の小人が親指を立てる */}
        {kob > 0 && (
          <g transform={`translate(1112 616) scale(${kob}) translate(-1112 -616)`}>
            <Kobito x={1112} y={616} s={0.3} f={f} pose="raise" face="joy" phase={3} />
            {/* 親指を立てたこぶし (上げた右手の先) */}
            <g transform={`translate(${1112 + 67 * 0.3} ${616 + kobBob - 232 * 0.3})`}>
              <rect x={-9} y={-6} width={18} height={16} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={-4} y={-22} width={8} height={18} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
            <g opacity={0.6 + 0.4 * Math.sin(f / 5)}>
              {[[-30, -120], [36, -112]].map(([dx, dy], i) => (
                <path key={i} d={`M ${1112 + dx} ${616 + dy} l 5 -12 l 5 12 l 12 5 l -12 5 l -5 12 l -5 -12 l -12 -5 Z`} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
              ))}
            </g>
          </g>
        )}
        {/* 鳴っていないスマホ: 画面は暗いまま、「0」の小さな札 */}
        <g transform={`translate(${SHIN_PHONE[0] + 40} ${SHIN_PHONE[1] - 66})`} opacity={seg(f, 20, 34)}>
          <circle r={20} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />
          <path d="M -9 4 Q -9 -12 0 -12 Q 9 -12 9 4 L 12 8 L -12 8 Z" fill={KRP.gray} stroke={KRP.grayDark} strokeWidth={2.5} />
          <line x1={-14} y1={14} x2={14} y2={-14} stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" />
        </g>
      </g>
    </Frame>
  );
};
const SHIN_PHONE = [1330, 606] as const;

// -------------------------------------------------------------------
// #37 体の時計は、太陽に合わせて、毎朝きっちり起こしてくれます。
// 格: 図 / seed 6037
// 絵: どこ: 脳の奥の小部屋の TainaiDokei (lag と reset をくり返す, s=1.5)。部屋の天井近くに目の丸い窓 (#23 と同じ) があり、外の空が見える。演出: 窓の外で、太陽が昇っては沈むのを3日分、早回しでくり返す。毎回、針が赤い「はみ出し」区画へ少しはみ出しかける → 朝日の光線が差してカチンと戻る (reset 0→1→0) → そのたびに Kobito が時計の横で、手持ちの小さな振り鈴をチリンと鳴らす。3日目は、Kobito が鈴を鳴らすタイミングを完全に覚えて、光線が来る前から構えて待っている (余裕の顔)。メトロノームのような「きっちりさ」を見せる。腕は2本 (pose="ring")。動き: f0-150 を50fずつ3回 (はみ出す→光→カチン→チリン) / 窓の外の空の色が回る / カメラは時計の針の先へ少しずつ寄る
// どこ: 脳の奥の小部屋 (しわの壁・木の床)。真ん中に TainaiDokei (s=1.5)、右上の天井近くに目の形の丸い窓
// 演出: 50fで1日。針がぐるっと1周して赤い「はみ出し」へ入りかける → 窓から朝日の光線 → カチンと0時へ戻る → 小人が振り鈴をチリン。
//       壁の黒板に、1日ごとに正の字の線が1本ずつ増える。3日目の小人は光より先に鈴を構えて待つ (余裕の顔)
// 動き: f0-50 / 50-100 / 100-150 の3回 (p=f%50: p0-24 針が回る・はみ出し / p25-33 光とカチン / p28-40 チリン)
//       窓の空が夜→夜明け→昼→夜と回る / カメラは針の先へ少しずつ寄る (f=45 で1日目の「戻った直後とチリン」)
const Mz037: React.FC<{ f: number }> = ({ f }) => {
  const g = f - 11; // f=45 で1日目の「光→カチン→チリン」に当たるようにずらす
  const day = Math.min(2, Math.floor(g / 50));
  const p = g - day * 50;
  const lag = p < 40 ? easeOut(seg(p, 8, 24)) : 0;
  const reset = p < 40 ? easeOut(seg(p, 25, 32)) : 0;
  const deg = p < 40 ? lerp(0, 360 + 50 * 0.62, easeInOut(seg(p, 1, 24))) : 0;
  const lap = 360 + 50 * lag;
  const hand = Math.min(deg / lap, 1);
  const sky = p < 25 ? lerp(0.1, 1, seg(p, 14, 25)) : p < 40 ? 1 + seg(p, 25, 34) : 2 - 2 * seg(p, 40, 50);
  const [skyT, skyB] = skyColors(sky);
  const sunY = p < 40 ? lerp(250, 120, easeOut(seg(p, 22, 38))) : lerp(120, 250, seg(p, 40, 50));
  const ring = p >= 28 && p < 42 ? 1 - seg(p, 34, 42) : 0;
  const ready = day === 2 ? seg(p, 10, 18) : seg(p, 24, 28);
  const swing = ring > 0 ? Math.sin(f * 1.6) * 28 * ring : (day === 2 && p < 28 ? -10 : 0);
  const kach = p >= 30 && p < 40 ? 1 - seg(p, 30, 40) : 0;
  const tally = Math.max(0, day + (p >= 32 ? 1 : 0));
  const camS = lerp(1, 1.16, easeInOut(seg(f, 0, 150)));
  const CX = 860, CY = 520;
  const kx = 1330, ky = 812;
  const kBob = Math.sin((f + 4 * 17) / 13) * 3;
  const handPt: [number, number] = [kx + 67 * 0.7, ky + kBob - 232 * 0.7];
  return (
    <Frame f={f} seed={6037}>
      <g transform={`translate(${CX * (1 - camS)} ${330 * (1 - camS)}) scale(${camS})`}>
        {/* 脳の小部屋の壁 (しわの模様) */}
        <rect x={-60} y={-60} width={2040} height={1000} fill={CB.brain} />
        <g stroke={CB.brainDark} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M -40 ${40 + i * 100} q 60 -40 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}
              transform={`translate(${(i % 2) * 60} 0)`} />
          ))}
        </g>
        {/* 天井の梁と、木の床 */}
        <rect x={-60} y={-60} width={2040} height={70} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={840} width={2040} height={300} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={MP.woodDark} strokeWidth={4} opacity={0.6}>
          {[900, 970].map((ly) => <line key={ly} x1={-60} y1={ly} x2={1980} y2={ly} />)}
        </g>
        {/* 目の形の丸い窓 (右上) */}
        <g transform="translate(1440 170)">
          <defs><clipPath id="mzbb37win"><ellipse cx={0} cy={0} rx={170} ry={100} /></clipPath></defs>
          <g clipPath="url(#mzbb37win)">
            <rect x={-180} y={-110} width={360} height={110} fill={skyT} />
            <rect x={-180} y={0} width={360} height={110} fill={skyB} />
            <circle cx={30} cy={sunY - 170} r={36} fill={sky > 1 ? "#FFE27A" : "#F7874A"} stroke={KRP.ink} strokeWidth={4} />
            {sky < 0.8 && [[-110, -50], [-40, -70], [80, -40], [120, -66]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill="#FFF6D8" opacity={0.9 - sky} />)}
            <path d="M -180 70 Q -100 40 -20 66 Q 60 90 180 54 L 180 110 L -180 110 Z" fill="#7E9C8A" stroke={KRP.ink} strokeWidth={3} />
          </g>
          <ellipse cx={0} cy={0} rx={170} ry={100} fill="none" stroke={KRP.ink} strokeWidth={9} />
          <ellipse cx={0} cy={0} rx={186} ry={114} fill="none" stroke={CB.brainDark} strokeWidth={10} />
          {/* まつげ */}
          {[-130, -80, -26, 30, 84, 134].map((ex, i) => (
            <line key={i} x1={ex} y1={-104 + Math.abs(ex) * 0.28} x2={ex * 1.12} y2={-140 + Math.abs(ex) * 0.3} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          ))}
        </g>
        {/* 黒板: 1日ごとに正の字 */}
        <g transform="translate(250 230)">
          <rect x={-120} y={-80} width={240} height={170} rx={8} fill="#3F5A4C" stroke={MP.woodDark} strokeWidth={12} />
          <rect x={-120} y={-80} width={240} height={170} rx={8} fill="none" stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.white} strokeWidth={8} strokeLinecap="round">
            {tally >= 1 && <line x1={-70} y1={-36} x2={70} y2={-36} />}
            {tally >= 2 && <line x1={0} y1={-36} x2={0} y2={54} />}
            {tally >= 3 && <line x1={4} y1={10} x2={60} y2={10} />}
          </g>
          <rect x={60} y={86} width={36} height={12} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        {/* 体内時計 (共有部品) */}
        <TainaiDokei x={CX} y={CY} s={1.5} f={f} lag={lag} reset={reset} hand={hand} />
        {/* カチン (0時に戻った火花) */}
        {kach > 0 && (
          <g transform={`translate(${CX} ${CY - 1.5 * 190})`} opacity={kach}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180, r = 30 + (1 - kach) * 40;
              return <line key={i} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r + 26)} y2={Math.sin(a) * (r + 26)} stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" />;
            })}
            <circle r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 小人の足場 (木の踏み台) */}
        <rect x={1240} y={812} width={180} height={34} rx={6} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {/* 小人と振り鈴 */}
        <Kobito x={kx} y={ky} s={0.7} f={f} pose={ready > 0.5 ? "raise" : "stand"} phase={4}
          face={ring > 0.1 ? "joy" : day === 2 && ready > 0.5 ? "smile" : "normal"} gaze={[-4, -4]} />
        {ready > 0.5 && (
          <g transform={`translate(${handPt[0]} ${handPt[1]}) rotate(${swing})`}>
            <rect x={-6} y={-46} width={12} height={40} rx={5} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -30 -2 Q -30 -48 0 -50 Q 30 -48 30 -2 L 38 8 L -38 8 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round"
              transform="translate(0 -40)" />
            <circle cx={0} cy={-28} r={8} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {ring > 0 && (
          <g opacity={ring}>
            {[[-1, 0], [1, 0]].map(([sd], i) => [0, 1].map((k) => (
              <path key={`${i}-${k}`} d={`M ${handPt[0] + sd * (48 + k * 22)} ${handPt[1] - 100} q ${sd * 14} 24 0 48`} stroke={MP.brassDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            )))}
            {[0, 1, 2].map((i) => {
              const t = ((f / 14 + i / 3) % 1);
              return <path key={i} d={`M ${handPt[0] - 60 + i * 50} ${handPt[1] - 150 - t * 60} l 0 -26 l 16 6`} stroke={KRP.ink} strokeWidth={5} fill="none"
                strokeLinecap="round" opacity={Math.sin(t * Math.PI)} />;
            })}
          </g>
        )}
        {/* 3日目: 光が来る前から構えて待つ「余裕」の汗ならぬキラリ */}
        {day === 2 && p < 28 && ready > 0.5 && (
          <path d={`M ${kx - 46} ${ky - 200} l 6 -14 l 6 14 l 14 6 l -14 6 l -6 14 l -6 -14 l -14 -6 Z`} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5}
            opacity={0.6 + 0.4 * Math.sin(f / 4)} />
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #38 困るのは、起きたい時刻が、太陽の時刻と、ずれたときです。
// 格: 山 / seed 6038
// 絵: どこ: 脳の奥の小部屋。左の壁に TainaiDokei (lag=0, reset=0, s=1.1)、その上に目の窓から見える空はまだ夜明け前の紺。右の壁に、四角くて硬い金属の壁掛け時計 (人が決めた時刻の時計。数字がくっきり・針は TainaiDokei より2時間先) が新しく打ち付けられている。演出: 2つの時計の針から、それぞれロープが1本ずつ垂れていて、真ん中の Kobito が両手で2本とも握らされている。左のロープは「まだ寝てていい」側へ、右のロープは「もう起きろ」側へぐいぐい引っぱられ、Kobito は綱引きの真ん中でびよーんと伸ばされる (face="worried")。ヘルメットがすっぽ抜けて飛ぶ。ほかの Kobito があわてて腰にしがみつく。腕は2本 (pose="tug" で左右に1本ずつ)。動き: f0-30 カメラが2つの時計の間へ寄る / f30-130 綱引き (右のほうが強く引く) / f90 ヘルメットが飛ぶ / f130-160 しがみつく
// どこ: #37 と同じ脳の奥の小部屋 (しわの壁・木の床)。左の壁に TainaiDokei (s=1.1, 4時) と、その上の目の窓 (夜明け前の紺)。
//       右の壁に、釘で打ち付けたばかりの四角い鉄の時計 (6時。2時間先)。打ち付けた釘の跡と壁のひび
// 演出: 2つの時計の針先からロープが垂れ、真ん中の小人が両手で1本ずつ握らされて綱引きの真ん中に。右が強く引いて
//       小人は横にびよーんと伸び、足が床をすべる。ヘルメットがすっぽ抜けて飛ぶ。仲間の小人2人が腰にしがみつく
// 動き: f0-24 カメラが2つの時計の間へ寄る / f8-30 ロープが張る / f30 ヘルメットが飛ぶ / f32-42 しがみつく / 以後ぐいぐい続く
const MzBbBrainRoom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-80} y={-80} width={2080} height={1000} fill={CB.brain} />
    <g stroke={CB.brainDark} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55}>
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M -60 ${20 + i * 100} ${Array.from({ length: 18 }, () => "q 60 -40 120 0").join(" ")}`}
          transform={`translate(${(i % 2) * 60 + Math.sin(f / 60 + i) * 4} 0)`} />
      ))}
    </g>
    <rect x={-80} y={-80} width={2080} height={90} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-80} y={840} width={2080} height={300} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
    <g stroke={MP.woodDark} strokeWidth={4} opacity={0.6}>
      {[900, 970].map((ly) => <line key={ly} x1={-80} y1={ly} x2={2000} y2={ly} />)}
    </g>
  </g>
);
const MzBbKobitoHelmet: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <path d="M -68 6 Q -68 -60 0 -62 Q 68 -60 68 6 Z" fill={MP.kobitoHelmet} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -8 -60 L -8 4 M 8 -60 L 8 4" stroke="#C99A1E" strokeWidth={5} />
    <rect x={-80} y={-4} width={160} height={16} rx={8} fill={MP.kobitoHelmet} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-14} y={-34} width={28} height={20} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-24} r={6} fill="#D9DDE2" />
  </g>
);
const Mz038: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 24));
  const camS = lerp(1, 1.04, cam);
  const pull = easeOut(seg(f, 8, 30));
  const jerk = Math.sin(f / 2.6) * 10 * pull;
  const bx = 960 + 60 * pull + jerk;
  const by = 790;
  const ks = 0.82;
  const lLen = 82 + 120 * pull + Math.max(0, -jerk) * 2;
  const rLen = 82 + 100 * pull + Math.max(0, jerk) * 2;
  const sx = 1 + 0.14 * pull;
  const bob = Math.sin((f + 5 * 17) / 13) * 3;
  // 手の位置 (ローカル: 肩 (±67,-148) から真横へ)
  const handL: [number, number] = [bx + (-67 * sx - lLen) * ks, by + bob * ks - 148 * ks];
  const handR: [number, number] = [bx + (67 * sx + rLen) * ks, by + bob * ks - 148 * ks];
  // 時計の針先 (ロープの付け根)
  const TD: [number, number] = [380, 520];
  const tdTip: [number, number] = [TD[0] + Math.sin(Math.PI / 3) * 165, TD[1] - Math.cos(Math.PI / 3) * 165];
  const MC: [number, number] = [1530, 430];
  const mcTip: [number, number] = [MC[0], MC[1] + 150];
  const sag = (1 - pull) * 90;
  const helm = seg(f, 30, 60);
  const helmOn = f < 30;
  const helmX = lerp(bx, bx + 420, helm), helmY = by - 300 * ks - Math.sin(helm * Math.PI) * 260 + helm * 120;
  const cling = easeOut(seg(f, 32, 42));
  const dust = (f % 10) / 10;
  return (
    <Frame f={f} seed={6038}>
      <g transform={`translate(${960 * (1 - camS) + Math.sin(f / 3) * 2 * pull} ${480 * (1 - camS)}) scale(${camS})`}>
        <MzBbBrainRoom f={f} />
        {/* 目の窓 (夜明け前の紺) */}
        <g transform="translate(560 168) scale(0.8)">
          <ellipse rx={150} ry={74} fill={MP.night} stroke={KRP.ink} strokeWidth={8} />
          <ellipse rx={164} ry={86} fill="none" stroke={CB.brainDark} strokeWidth={9} />
          {[[-80, -24], [-20, -40], [50, -18], [100, -36], [10, 10]].map(([sx2, sy], i) => (
            <circle key={i} cx={sx2} cy={sy} r={i % 2 ? 2.5 : 3.5} fill="#FFF6D8" opacity={0.6 + 0.4 * Math.sin(f / 8 + i)} />
          ))}
          <path d="M -140 34 Q -60 14 20 30 Q 90 44 140 26 Q 120 60 0 74 Q -110 66 -140 34 Z" fill="#2E3A55" />
          <circle cx={-70} cy={-18} r={18} fill="#FFF3C8" />
          <circle cx={-62} cy={-24} r={16} fill={MP.night} />
          {[-120, -60, 0, 60, 120].map((ex, i) => (
            <line key={i} x1={ex} y1={-70 + Math.abs(ex) * 0.2} x2={ex * 1.1} y2={-104 + Math.abs(ex) * 0.22} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
        {/* 左: 体内時計 (4時) */}
        <TainaiDokei x={TD[0]} y={TD[1]} s={1.0} f={f} lag={0} reset={0} hand={1 / 6} />
        {/* 右: 打ち付けたばかりの鉄の四角い時計 (6時) */}
        <g transform={`translate(${MC[0]} ${MC[1]})`}>
          {/* 壁のひび */}
          <path d="M -200 -170 l -40 -30 l -20 10 M 196 -180 l 50 -24 l 10 -30 M 200 186 l 40 30 l 30 -6" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          <rect x={-196} y={-196} width={392} height={392} rx={14} fill={CB.metalDark} stroke={KRP.ink} strokeWidth={8} />
          <rect x={-170} y={-170} width={340} height={340} rx={6} fill="#F4F6F7" stroke={KRP.ink} strokeWidth={6} />
          {[[-180, -180], [180, -180], [-180, 180], [180, 180]].map(([nx, ny], i) => (
            <g key={i}>
              <circle cx={nx} cy={ny} r={11} fill={CB.metal} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={nx - 6} y1={ny - 6} x2={nx + 6} y2={ny + 6} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i + 1) * 30 * Math.PI / 180;
            return <text key={i} x={Math.sin(a) * 128} y={-Math.cos(a) * 128 + 17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>{i + 1}</text>;
          })}
          {Array.from({ length: 60 }, (_, i) => {
            const a = i * 6 * Math.PI / 180, r0 = i % 5 === 0 ? 150 : 158;
            return <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * 164} y2={-Math.cos(a) * 164} stroke={KRP.ink} strokeWidth={i % 5 === 0 ? 5 : 2} />;
          })}
          {/* 針: 6時ちょうど。短針が真下を指し、ロープが垂れる */}
          <rect x={-9} y={-150} width={18} height={150} rx={6} fill={KRP.ink} />
          <rect x={-12} y={0} width={24} height={150} rx={8} fill={MP.bell} stroke={KRP.ink} strokeWidth={4} />
          <circle r={16} fill={CB.metal} stroke={KRP.ink} strokeWidth={5} />
          {/* 「もう起きろ」の赤いランプ */}
          <circle cx={0} cy={-232} r={22} fill={Math.floor(f / 6) % 2 ? MP.bell : MP.bellDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-8} y={-212} width={16} height={18} fill={CB.metalDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 時刻の札 (同じ高さ) */}
        <TagPlate x={TD[0]} y={775} text="4:00" size={40} t={seg(f, 2, 12)} />
        <TagPlate x={MC[0]} y={775} text="6:00" size={40} t={seg(f, 4, 14)} color={MP.bell} />
        {/* 左の「まだ寝てていい」= 月と Zzz、右の「起きろ」= ！ */}
        <g opacity={0.9}>
          {[0, 1, 2].map((i) => {
            const t = ((f / 40 + i / 3) % 1);
            return <text key={i} x={180 - t * 30} y={300 - t * 90} fontFamily={FONT} fontWeight={900} fontSize={30 + t * 16} fill={MP.night} opacity={Math.sin(t * Math.PI)}>Z</text>;
          })}
          <text x={1790} y={300 + Math.sin(f / 3) * 4} fontFamily={FONT} fontWeight={900} fontSize={90} fill={MP.bell} stroke={KRP.ink} strokeWidth={3}>!</text>
        </g>
        {/* ロープ (張るとまっすぐ) */}
        {[[tdTip, handL], [mcTip, handR]].map(([a, b], i) => (
          <g key={i}>
            <path d={`M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + sag} ${b[0]} ${b[1]}`} stroke={KRP.ink} strokeWidth={16} fill="none" strokeLinecap="round" />
            <path d={`M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + sag} ${b[0]} ${b[1]}`} stroke="#D7B37A" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="10 7" />
            <circle cx={a[0]} cy={a[1]} r={10} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 引っぱる力の矢印 (右のほうが太い) */}
        <g opacity={pull}>
          <path d={`M ${handL[0] - 40} 600 l -70 0`} stroke={MP.night} strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${handL[0] - 118} 600 l 26 -20 l 0 40 Z`} fill={MP.night} />
          <path d={`M ${handR[0] + 40} 700 l 110 0`} stroke={MP.bell} strokeWidth={20} strokeLinecap="round" />
          <path d={`M ${handR[0] + 186} 700 l -36 -30 l 0 60 Z`} fill={MP.bell} />
        </g>
        {/* 足もとのすべり跡と砂ぼこり */}
        <g opacity={pull}>
          <path d={`M ${bx - 150} ${by + 4} L ${bx - 20} ${by + 4}`} stroke={MP.woodDark} strokeWidth={6} strokeLinecap="round" strokeDasharray="20 12" />
          {[0, 1, 2].map((i) => <circle key={i} cx={bx - 50 - i * 40 - dust * 30} cy={by - 8 - dust * 20 - i * 6} r={10 + dust * 10} fill="none" stroke={KRP.grayDark} strokeWidth={4} opacity={1 - dust} />)}
        </g>
        {/* しがみつく仲間の小人2人 (後ろから腰を抱える) */}
        {cling > 0 && [0, 1].map((i) => (
          <g key={i} transform={`translate(${lerp(-160, 0, cling)} 0)`}>
            <Kobito x={bx - 80 - i * 62} y={by + 4} s={0.4} f={f} pose="hold" face={i ? "surprised" : "worried"} phase={6 + i} lean={8 + i * 4} />
          </g>
        ))}
        {/* 主役の小人 (横に伸ばされる) */}
        <g transform={`translate(${bx} ${by}) scale(${sx} 1) translate(${-bx} ${-by})`}>
          <MzBbFig x={bx} y={by} s={ks} f={f} face="worried" cloth={MP.kobitoCloth} clothDark={MP.kobitoClothDark} hair="none" phase={5}
            arms={[[90, lLen], [-90, rLen]]}
            over={<g>
              <rect x={-58} y={-100} width={116} height={12} fill={MP.kobitoHelmet} opacity={0.85} />
              {helmOn && <MzBbKobitoHelmet x={0} y={-250} s={1} />}
              {!helmOn && <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
                {[-30, 0, 30].map((hx) => <line key={hx} x1={hx} y1={-292} x2={hx * 1.3} y2={-318} />)}
              </g>}
              {/* 汗 */}
              <path d={`M 70 ${-262 + (f % 12)} q 10 16 0 22 q -10 -6 0 -22 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={2.5} />
              <path d={`M -76 ${-250 + ((f + 6) % 12)} q 10 16 0 22 q -10 -6 0 -22 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={2.5} />
            </g>} />
        </g>
        {/* すっぽ抜けたヘルメット */}
        {!helmOn && helm < 1 && (
          <g>
            <MzBbKobitoHelmet x={helmX} y={helmY} s={ks} rot={helm * 540} />
            {[0, 1, 2].map((i) => <line key={i} x1={helmX - 50 - i * 18} y1={helmY + 30 + i * 12} x2={helmX - 90 - i * 18} y2={helmY + 44 + i * 12} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />)}
          </g>
        )}
        {!helmOn && helm >= 1 && <MzBbKobitoHelmet x={bx + 420} y={by - 6 + Math.abs(Math.sin(f / 4)) * -6} s={ks} rot={170} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #39 では、太陽と違う時刻に、人を起こそうとしたのは、誰だったのか。
// 格: 並 / seed 6039
// 絵: どこ: #38 の小部屋から、右の硬い時計のロープをたどる: ロープは壁の穴を抜け、体の外へ出て、寝室の窓の外、さらに古い町並みのほうへ、どこまでも伸びている。演出: カメラがロープに沿って右へ長くパンしていくと、景色が現代の寝室 → 夜明けの屋根の上 → 石畳の古い町 → 霧の中、と時代がさかのぼるように変わっていく。霧の中の端で、ロープの先を誰かの手 (袖の長い古い衣の手だけ。顔・体は描かない) がしっかり握っていて、くいっくいっと2回引く。そのたびに、遠く小部屋の Kobito が「おっと」とよろける (画面の端に小窓で見せる)。札は「?」だけ。動き: f0-120 ロープに沿って長いパン (加速) / f120-150 手が2回引く / 霧が流れる / 小窓の Kobito がよろける
// どこ: 1本のロープがつなぐ横長の世界 (幅約5200)。脳の小部屋の鉄の時計 → 壁の穴 → 夜明け前の家の寝室の窓 →
//       夜明けの屋根の上 (アンテナ) → 石畳の古い町 (ガス灯) → 霧の中
// 演出: カメラがロープに沿って右へ長くパン (だんだん速く)。霧の中の端で、袖の長い古い衣の手 (手だけ) がロープを握っていて、
//       くいっくいっと2回引く。左上の小窓では、脳の小部屋の小人がそのたびに「おっと」と右へよろける。札は「?」だけ
// 動き: f0-38 パン / f38 小窓が開く / f40-50 1回目 / f54-64 2回目 / 霧が流れ続ける (f=45 で手が1回目を引いた瞬間)
const HAND_X = 4700; // ロープの先の手 (ワールド座標。カメラが右へパンするので画面内に入る)
const Mz039: React.FC<{ f: number }> = ({ f }) => {
  const camX = 3400 * easeInOut(seg(f, 0, 38));
  const tug = (a: number) => Math.sin(Math.PI * seg(f, a, a + 10));
  const t1 = tug(40), t2 = tug(54);
  const yank = Math.max(t1, t2);
  const pip = easeOut(seg(f, 34, 42));
  const ropePts: [number, number][] = [[600, 560], [1300, 470], [1760, 410], [2600, 330], [3300, 420], [4000, 470], [4700 + yank * 40, 520]];
  let ropeD = `M ${ropePts[0][0]} ${ropePts[0][1]}`;
  for (let i = 1; i < ropePts.length; i++) {
    const [ax, ay] = ropePts[i - 1], [bx2, by2] = ropePts[i];
    ropeD += ` Q ${(ax + bx2) / 2} ${(ay + by2) / 2 + 40 * (1 - yank)} ${bx2} ${by2}`;
  }
  const [s1t, s1b] = skyColors(0.55);
  const [s2t, s2b] = skyColors(1);
  const [s3t, s3b] = skyColors(1.25);
  const mistX = (f * 2) % 400;
  return (
    <Frame f={f} seed={6039}>
      <g transform={`translate(${-camX} 0)`}>
        {/* A: 脳の小部屋 (しわの壁) */}
        <g>
          <rect x={-100} y={-60} width={1500} height={1200} fill={CB.brain} />
          <g stroke={CB.brainDark} strokeWidth={6} fill="none" opacity={0.55}>
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M -80 ${30 + i * 100} ${Array.from({ length: 12 }, () => "q 60 -40 120 0").join(" ")}`} transform={`translate(${(i % 2) * 60} 0)`} />)}
          </g>
          <rect x={-100} y={840} width={1500} height={300} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          {/* 鉄の時計 (#38 と同じ物) */}
          <g transform="translate(600 360) scale(0.62)">
            <rect x={-196} y={-196} width={392} height={392} rx={14} fill={CB.metalDark} stroke={KRP.ink} strokeWidth={8} />
            <rect x={-170} y={-170} width={340} height={340} rx={6} fill="#F4F6F7" stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i + 1) * 30 * Math.PI / 180;
              return <text key={i} x={Math.sin(a) * 128} y={-Math.cos(a) * 128 + 17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.ink}>{i + 1}</text>;
            })}
            <rect x={-9} y={-150} width={18} height={150} rx={6} fill={KRP.ink} />
            <rect x={-12} y={0} width={24} height={150} rx={8} fill={MP.bell} stroke={KRP.ink} strokeWidth={4} />
            <circle r={16} fill={CB.metal} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 壁の穴 */}
          <path d="M 1250 400 Q 1300 370 1350 410 Q 1372 470 1340 530 Q 1290 560 1250 520 Q 1228 460 1250 400 Z" fill={KRP.ink} />
          <path d="M 1250 400 Q 1300 370 1350 410 Q 1372 470 1340 530 Q 1290 560 1250 520 Q 1228 460 1250 400 Z" fill="none" stroke={CB.brainDark} strokeWidth={10} />
          {/* 体の外の境目 (皮ふの層) */}
          <path d="M 1400 -60 Q 1380 200 1410 400 Q 1440 700 1400 1140 L 1440 1140 Q 1480 700 1450 400 Q 1420 200 1440 -60 Z" fill={CB.brainDark} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* B: 夜明け前の家 (寝室の窓からロープが出ていく) */}
        <g>
          <rect x={1440} y={-60} width={1100} height={1200} fill={s1t} />
          <rect x={1440} y={500} width={1100} height={340} fill={s1b} />
          {[[1520, 80], [1900, 140], [2300, 60], [2460, 200], [1700, 220]].map(([sx2, sy], i) => <circle key={i} cx={sx2} cy={sy} r={3} fill="#FFF6D8" opacity={0.6 + 0.4 * Math.sin(f / 7 + i)} />)}
          <rect x={1520} y={300} width={520} height={560} fill="#D8C7AE" stroke={KRP.ink} strokeWidth={7} />
          <path d="M 1490 310 L 1780 170 L 2070 310 Z" fill={CB.kawara} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <rect x={1660} y={360} width={200} height={160} fill="#FFE7A0" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1660 360 L 1700 360 Q 1690 440 1670 520 L 1660 520 Z M 1860 360 L 1820 360 Q 1830 440 1850 520 L 1860 520 Z" fill="#C9826C" stroke={KRP.ink} strokeWidth={4} />
          <rect x={1650} y={516} width={220} height={16} fill="#F5EFE3" stroke={KRP.ink} strokeWidth={4} />
          <rect x={1580} y={640} width={110} height={200} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={2080} y={560} width={460} height={280} fill="#9BA9BF" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1440} y={840} width={1100} height={300} fill="#6F7F6A" stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* C: 夜明けの屋根の上 (テレビのアンテナ) */}
        <g>
          <rect x={2540} y={-60} width={1000} height={600} fill={s2t} />
          <rect x={2540} y={300} width={1000} height={400} fill={s2b} />
          <circle cx={3060} cy={560} r={70} fill="#F7874A" opacity={0.9} />
          <path d="M 2540 620 L 2700 470 L 2860 620 L 2960 520 L 3120 640 L 3260 500 L 3400 620 L 3540 540 L 3540 1140 L 2540 1140 Z" fill={CB.kawaraDark} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <g stroke="#5D6876" strokeWidth={4}>
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={2560} y1={680 + i * 50} x2={3540} y2={660 + i * 50} />)}
          </g>
          <rect x={2780} y={420} width={50} height={110} fill={MP.brick} stroke={KRP.ink} strokeWidth={5} />
          {/* アンテナ */}
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            <line x1={3260} y1={500} x2={3260} y2={330} />
            {[350, 380, 410].map((ay, i) => <line key={ay} x1={3220 + i * 8} y1={ay} x2={3300 - i * 8} y2={ay} />)}
          </g>
        </g>
        {/* D: 石畳の古い町 (ガス灯) */}
        <g>
          <rect x={3540} y={-60} width={800} height={1200} fill={s3t} />
          <rect x={3540} y={400} width={800} height={300} fill={s3b} />
          {[[3570, 360, 230], [3830, 300, 260], [4110, 380, 200]].map(([hx, hy, hw], i) => (
            <g key={i}>
              <rect x={hx} y={hy} width={hw} height={840 - hy} fill={i % 2 ? "#E6D6B8" : "#CDBB9B"} stroke={KRP.ink} strokeWidth={6} />
              <path d={`M ${hx - 16} ${hy} L ${hx + hw / 2} ${hy - 110} L ${hx + hw + 16} ${hy} Z`} fill={MP.brickDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
              <line x1={hx} y1={hy + 120} x2={hx + hw} y2={hy + 120} stroke={MP.woodDark} strokeWidth={10} />
              <line x1={hx + hw / 2} y1={hy} x2={hx + hw / 2} y2={hy + 120} stroke={MP.woodDark} strokeWidth={10} />
              <rect x={hx + 30} y={hy + 160} width={56} height={80} fill="#5A6470" stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          <rect x={3540} y={840} width={800} height={300} fill={MP.stone} stroke={KRP.ink} strokeWidth={6} />
          <g fill="none" stroke={MP.stoneDark} strokeWidth={4}>
            {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={3570 + i * 50} cy={880 + (i % 2) * 30} rx={22} ry={12} />)}
          </g>
          <g>
            <rect x={4062} y={520} width={12} height={320} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 4040 520 L 4096 520 L 4086 470 L 4050 470 Z" fill="#FFE7A0" stroke={KRP.ink} strokeWidth={4} />
            <Flame x={4068} y={512} s={0.6} f={f} />
          </g>
        </g>
        {/* E: 霧の中 (濃淡のある灰青のもや。奥に次の章の予告の影: 宮殿の屋根 → 修道院の塔 → 工場の煙突) */}
        <defs>
          <linearGradient id="mzbb39fogSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7F8CA3" />
            <stop offset="0.45" stopColor="#A2ADBF" />
            <stop offset="0.75" stopColor="#B3BCCB" />
            <stop offset="1" stopColor="#97A2B5" />
          </linearGradient>
          <linearGradient id="mzbb39fogEdge" gradientUnits="userSpaceOnUse" x1={3960} y1={0} x2={4310} y2={0}>
            <stop offset="0" stopColor="#000" />
            <stop offset="1" stopColor="#FFF" />
          </linearGradient>
          <mask id="mzbb39fogMask" maskUnits="userSpaceOnUse" x={3980} y={-60} width={1560} height={1200}>
            <rect x={3980} y={-60} width={1560} height={1200} fill="url(#mzbb39fogEdge)" />
          </mask>
          <linearGradient id="mzbb39fogVeil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A9B3C4" stopOpacity={0.15} />
            <stop offset="0.6" stopColor="#B0BACA" stopOpacity={0.45} />
            <stop offset="1" stopColor="#A6B0C1" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <g mask="url(#mzbb39fogMask)">
          <rect x={3980} y={-60} width={1560} height={1200} fill="url(#mzbb39fogSky)" />
          {/* 濃いもやの層 (奥) */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={4500 + ((f * 0.8 + i * 420) % 1260)} cy={180 + i * 210} rx={420} ry={90} fill="#7C889E" opacity={0.28} />
          ))}
          {/* 奥の影 (薄く) */}
          <g fill="#56627A" opacity={0.5}>
            {/* 古代中国の宮殿の屋根 (二重の反り屋根) */}
            <rect x={4370} y={780} width={260} height={60} />
            <rect x={4412} y={570} width={176} height={210} />
            <path d="M 4330 532 Q 4372 562 4420 556 L 4442 500 L 4558 500 L 4580 556 Q 4628 562 4670 532 L 4662 560 Q 4600 584 4500 584 Q 4400 584 4338 560 Z" />
            <rect x={4452} y={436} width={96} height={66} />
            <path d="M 4384 418 Q 4414 440 4452 436 L 4472 390 L 4528 390 L 4548 436 Q 4586 440 4616 418 L 4610 442 Q 4568 458 4500 458 Q 4432 458 4390 442 Z" />
            <rect x={4466} y={376} width={68} height={16} rx={6} />
            {/* 修道院の塔 (とがり屋根と十字架、横に礼拝堂) */}
            <rect x={4800} y={300} width={84} height={540} />
            <path d="M 4790 302 L 4842 150 L 4894 302 Z" />
            <rect x={4838} y={96} width={8} height={60} />
            <rect x={4824} y={112} width={36} height={8} />
            <rect x={4884} y={610} width={150} height={230} />
            <path d="M 4878 614 L 4958 548 L 5040 614 Z" />
            {/* 工場の煙突 (のこぎり屋根の工場と2本の煙突) */}
            <path d="M 5080 840 L 5080 700 L 5130 660 L 5130 700 L 5180 660 L 5180 700 L 5230 660 L 5230 700 L 5280 660 L 5280 700 L 5330 660 L 5330 840 Z" />
            <path d="M 5150 700 L 5156 200 L 5190 200 L 5196 700 Z" />
            <path d="M 5244 700 L 5248 280 L 5274 280 L 5278 700 Z" />
          </g>
          {/* 煙突の煙 (もやに溶ける) */}
          {[0, 1, 2, 3].map((i) => {
            const t = ((f * 0.6 + i * 25) % 100) / 100;
            return <ellipse key={i} cx={5173 + t * 160} cy={180 - t * 150} rx={30 + t * 60} ry={18 + t * 30} fill="#5F6B82" opacity={0.32 * (1 - t)} />;
          })}
          {/* 手前のもや (影の足元をぼかす) */}
          <rect x={3980} y={-60} width={1560} height={1200} fill="url(#mzbb39fogVeil)" />
          <rect x={3980} y={840} width={1560} height={300} fill="#8C97AA" opacity={0.75} />
        </g>
        {/* ロープ (全区間で1本) */}
        <path d={ropeD} stroke={KRP.ink} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={ropeD} stroke="#D7B37A" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="10 7" strokeDashoffset={-yank * 40} />
        {/* 霧の帯 (ロープの上を流れる) */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={4300 + ((mistX + i * 260) % 1200)} cy={300 + i * 150} rx={320} ry={50} fill={i % 2 ? "#8794AA" : "#C2CAD7"} opacity={i % 2 ? 0.35 : 0.5} />
        ))}

        {/* ロープを握る手 (袖の長い古い衣。手だけ) */}
        <g transform={`translate(${4700 + yank * 40} 520) rotate(${yank * -6})`}>
          <path d="M 40 -60 Q 180 -80 700 -70 L 700 120 Q 200 110 60 90 Q 10 30 40 -60 Z" fill={CB.robe} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 120 -64 Q 110 20 130 100 M 260 -70 Q 250 20 270 106" stroke={CB.robeDark} strokeWidth={6} fill="none" />
          <path d="M 40 -60 Q 10 30 60 90" stroke={MP.brass} strokeWidth={12} fill="none" />
          {/* こぶし (ロープを包む4本の指) */}
          <rect x={-46} y={-38} width={90} height={76} rx={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[-24, -6, 12, 30].map((fy, i) => <path key={i} d={`M -40 ${fy - 4} Q -54 ${fy + 4} -40 ${fy + 12}`} stroke={KRP.ink} strokeWidth={4} fill="none" />)}
          <path d="M -10 -38 Q -40 -50 -46 -22" stroke={KRP.ink} strokeWidth={5} fill={KRP.white} />
        </g>
        {/* 引いた手ごたえの線 */}
        {yank > 0.2 && [0, 1, 2].map((i) => (
          <line key={i} x1={4620 - i * 30} y1={470 - i * 20} x2={4580 - i * 30} y2={450 - i * 24} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={yank} />
        ))}
        <g transform={`translate(${HAND_X - 100} 0)`}><TagPlate x={100} y={300} text="?" size={70} t={seg(f, 30, 40)} rot={Math.sin(f / 9) * 4} /></g>
      </g>
      {/* 小窓: 脳の小部屋の小人が引かれてよろける */}
      {pip > 0 && (
        <g transform={`translate(70 160) scale(${pip})`}>
          <defs><clipPath id="mzbb39pip"><rect x={0} y={0} width={440} height={280} rx={20} /></clipPath></defs>
          <g clipPath="url(#mzbb39pip)">
            <rect x={0} y={0} width={440} height={280} fill={CB.brain} />
            <g stroke={CB.brainDark} strokeWidth={4} fill="none" opacity={0.55}>
              {[30, 90, 150].map((ly) => <path key={ly} d={`M -20 ${ly} ${Array.from({ length: 8 }, () => "q 30 -20 60 0").join(" ")}`} />)}
            </g>
            <rect x={0} y={236} width={440} height={60} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${211 + yank * 50} ${181 + yank * 10} L 460 ${150}`} stroke={KRP.ink} strokeWidth={10} />
            <path d={`M ${211 + yank * 50} ${181 + yank * 10} L 460 ${150}`} stroke="#D7B37A" strokeWidth={5} />
            <Kobito x={150 + yank * 50} y={240} s={0.4} f={f} pose="point" pointDir={1} face={yank > 0.2 ? "surprised" : "worried"} lean={yank * 22} phase={8} />
            {yank > 0.2 && <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={yank}>
              <line x1={90} y1={120} x2={60} y2={110} /><line x1={92} y1={150} x2={58} y2={150} /><line x1={96} y1={180} x2={64} y2={190} />
            </g>}
          </g>
          <rect x={0} y={0} width={440} height={280} rx={20} fill="none" stroke={KRP.ink} strokeWidth={8} />
          <rect x={0} y={0} width={440} height={280} rx={20} fill="none" stroke={KRP.white} strokeWidth={3} transform="translate(6 6) scale(0.973)" />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #40 第2章、起こす係。
// 格: 山 / seed 6040
// 絵: 章扉。どこ: 夜明け前の古代中国の宮殿。朱塗りの柱・幅の広い石段・反り返った瓦屋根・軒先の灯籠・空にはまだ星と細い月。演出: 長い袖の衣の人物 (鶏人。赤い頭巾に、鶏のとさかを模した赤い冠・男性) が、灯籠を手に石段をのぼっていく後ろ姿 (まだ顔は見せない)。石段の下から上へ、朝もやが流れる。石段の上の高い所で、彼が足を止め、胸いっぱいに息を吸う (背中が大きくふくらむ) ところで止める。ChapterDoor num=2 title="起こす係。" を画面の右寄りに置く。主役の宮殿と鶏人は左寄り。腕は2本 (pose="lantern")。動き: f0-120 カメラが石段の下から上へゆっくりパン / もやが流れる / 灯籠の炎が揺れる / f100 息を吸う
// どこ: 夜明け前の古代中国の宮殿 (左寄り)。朱塗りの柱・反り返った瓦屋根・軒の灯籠・幅の広い石段と朱の欄干。
//       空は紺で星と細い月、右の奥に宮殿の屋根の影。章の題字は右寄り (クリームの帯の上)
// 演出: 鶏人 (赤い頭巾+とさかの冠・長い袖の紫の衣・男性) が手提げ灯籠を持って石段をのぼる後ろ姿 (顔は見せない)。
//       上まで来て足を止め、胸いっぱいに息を吸う (背中がふくらみ、空気の線が吸いこまれる)
// 動き: f0-34 カメラが石段の下から上へ / f0-30 のぼる (一段ごとに上下) / f32-42 息を吸う / もやが流れる・炎が揺れる
const Mz040: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 34));
  const camY = -650 * (1 - k);
  const climb = seg(f, 0, 30);
  const wy = lerp(1300, 650, easeOut(climb));
  const stepBob = climb < 1 ? -Math.abs(Math.sin(f / 2.2)) * 10 : 0;
  const breath = easeOut(seg(f, 32, 42)) * (1 - 0.3 * seg(f, 56, 67));
  const door = seg(f, 4, 20);
  const steps = 17;
  const px = 560;
  const stepW = (i: number) => lerp(560, 960, i / (steps - 1));
  return (
    <Frame f={f} seed={6040} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={2} title="起こす係。" t={door} left={1000} top={560} />
      </>}>
      {/* 空 (固定): 紺・星・細い月 */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={-40} y={300 + i * 78} width={2000} height={80} fill={mixColor(MP.nightDeep, "#5A5890", i / 12)} />
      ))}
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={rnd(40, i) * 1900} cy={rnd(41, i) * 440 + 20} r={rnd(42, i) > 0.7 ? 3.5 : 2} fill="#FFF6D8"
          opacity={0.5 + 0.5 * Math.sin(f / 6 + i * 1.3)} />
      ))}
      <g transform="translate(1560 190)">
        <circle r={62} fill="#FFF3C8" opacity={0.18} />
        <circle r={40} fill="#FFF3C8" />
        <circle cx={16} cy={-10} r={36} fill={MP.nightDeep} />
      </g>
      {/* 右の奥の宮殿の屋根の影 */}
      <path d="M 1000 520 Q 1160 470 1240 420 L 1560 420 Q 1640 470 1800 520 L 1760 520 L 1760 900 L 1040 900 L 1040 520 Z" fill="#26304F" />
      <path d="M 1500 600 Q 1640 560 1700 520 L 1960 520 L 1960 900 L 1500 900 Z" fill="#1F2843" />
      <g transform={`translate(0 ${camY})`}>
        {/* 石段 (下ほど幅が広い) */}
        {Array.from({ length: steps }, (_, i) => {
          const y0 = 650 + i * 52, w = stepW(i);
          return (
            <g key={i}>
              <rect x={px - w / 2} y={y0} width={w} height={52} fill={i % 2 ? MP.stone : MP.stoneLight} stroke={KRP.ink} strokeWidth={5} />
              <line x1={px - w / 2 + 10} y1={y0 + 10} x2={px + w / 2 - 10} y2={y0 + 10} stroke={KRP.white} strokeWidth={4} opacity={0.35} />
            </g>
          );
        })}
        {/* 朱の欄干 (左右) */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${px + sd * 290} 650 L ${px + sd * 490} ${650 + 52 * steps}`} stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
            <path d={`M ${px + sd * 290} 650 L ${px + sd * 490} ${650 + 52 * steps}`} stroke={CB.shu} strokeWidth={16} strokeLinecap="round" />
            {Array.from({ length: 7 }, (_, i) => {
              const t = i / 6;
              const xx = lerp(px + sd * 290, px + sd * 490, t), yy = lerp(650, 650 + 52 * steps, t);
              return <g key={i}><rect x={xx - 9} y={yy - 50} width={18} height={50} fill={CB.shu} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={xx} cy={yy - 56} r={11} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} /></g>;
            })}
          </g>
        ))}
        {/* 宮殿の正殿 (上の台の上) */}
        <rect x={110} y={600} width={900} height={54} fill={MP.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={170} y={330} width={780} height={272} fill="#5B2E2A" stroke={KRP.ink} strokeWidth={6} />
        {[200, 360, 520, 680, 840].map((cx, i) => (
          <g key={i}>
            <rect x={cx - 4} y={330} width={66} height={272} fill={CB.shu} stroke={KRP.ink} strokeWidth={6} />
            <rect x={cx + 6} y={340} width={10} height={250} fill="#E2705A" opacity={0.6} />
          </g>
        ))}
        {/* 格子の扉 (中から明かり) */}
        {[290, 450, 610, 770].map((dx) => (
          <g key={dx}>
            <rect x={dx - 4} y={380} width={72} height={220} fill="#E9B85E" opacity={0.55 + 0.1 * Math.sin(f / 7 + dx)} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((c) => <line key={c} x1={dx - 4 + 18 * (c + 1)} y1={380} x2={dx - 4 + 18 * (c + 1)} y2={600} stroke={CB.shuDark} strokeWidth={4} />)}
            {[0, 1, 2, 3].map((r) => <line key={r} x1={dx - 4} y1={420 + r * 46} x2={dx + 68} y2={420 + r * 46} stroke={CB.shuDark} strokeWidth={4} />)}
          </g>
        ))}
        {/* 反り返った瓦屋根 (2重) */}
        <path d="M 40 350 Q 140 330 200 280 L 920 280 Q 980 330 1080 350 Q 1000 372 560 360 Q 120 372 40 350 Z" fill={CB.kawara} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g stroke={CB.kawaraDark} strokeWidth={5}>{Array.from({ length: 22 }, (_, i) => <line key={i} x1={210 + i * 33} y1={286} x2={190 + i * 34} y2={354} />)}</g>
        <rect x={250} y={190} width={620} height={92} fill="#5B2E2A" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 120 200 Q 220 180 290 120 L 830 120 Q 900 180 1000 200 Q 920 222 560 212 Q 200 222 120 200 Z" fill={CB.kawara} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 120 200 q -14 -30 4 -52 M 1000 200 q 14 -30 -4 -52" stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={286} y={104} width={548} height={20} rx={8} fill={CB.kawaraDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 軒の灯籠 */}
        {[150, 970].map((lx, i) => (
          <g key={lx} transform={`rotate(${Math.sin(f / 18 + i) * 3} ${lx} 356)`}>
            <line x1={lx} y1={356} x2={lx} y2={392} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={430} r={70} fill={MP.glow} opacity={0.18} />
            <ellipse cx={lx} cy={430} rx={30} ry={40} fill={CB.shu} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={lx} cy={430} rx={16} ry={36} fill="#F2855E" opacity={0.7} />
            <rect x={lx - 16} y={386} width={32} height={10} fill={KRP.ink} />
            <rect x={lx - 16} y={466} width={32} height={10} fill={KRP.ink} />
          </g>
        ))}
        {/* 朝もや (下から上へ流れる) */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = ((f / 80 + i / 6) % 1);
          return <ellipse key={i} cx={px + Math.sin(i * 2.1) * 260 + t * 80} cy={1500 - t * 900} rx={260} ry={46} fill={MP.mist} opacity={0.35 * Math.sin(t * Math.PI)} />;
        })}
        {/* 鶏人 (後ろ姿)。息を吸うと背中がふくらむ */}
        <g transform={`translate(${px} ${wy + stepBob}) scale(${1 + 0.1 * breath} ${1 + 0.03 * breath}) translate(${-px} ${-(wy + stepBob)})`}>
          <MzBbFig x={px} y={wy + stepBob} s={0.82} f={f} cloth={CB.robe} clothDark={CB.robeDark} hair="none" phase={2}
            arms={[[26, 96], [-6, 92]]} sleeveW={36} hand={false}
            over={<g>
              <MzBbRobe />
              {/* 背中の縫い目 */}
              <line x1={0} y1={-156} x2={0} y2={-12} stroke={CB.robeDark} strokeWidth={5} />
              <MzBbKeijinHat f={f} back />
              {/* 手 (袖の先) */}
              <circle cx={armEnd(-1, 26, 96)[0]} cy={armEnd(-1, 26, 96)[1]} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={armEnd(1, -6, 92)[0]} cy={armEnd(1, -6, 92)[1]} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            </g>} />
        </g>
        {/* 手提げ灯籠 (左手) */}
        {(() => {
          const [hx, hy] = armEnd(-1, 26, 96);
          const lx = px + hx * 0.82, ly = wy + stepBob + hy * 0.82 + Math.sin((f + 34) / 13) * 3 * 0.82;
          const sw = Math.sin(f / 6) * 6;
          return (
            <g transform={`rotate(${sw} ${lx} ${ly})`}>
              <line x1={lx} y1={ly} x2={lx} y2={ly + 30} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={lx} cy={ly + 66} r={60} fill={MP.glow} opacity={0.25} />
              <rect x={lx - 26} y={ly + 30} width={52} height={70} rx={14} fill="#F7D68A" stroke={KRP.ink} strokeWidth={5} />
              <rect x={lx - 30} y={ly + 26} width={60} height={10} rx={4} fill={KRP.ink} />
              <rect x={lx - 30} y={ly + 96} width={60} height={10} rx={4} fill={KRP.ink} />
              <Flame x={lx} y={ly + 86} s={0.7} f={f} glow={0.6} />
            </g>
          );
        })()}
        {/* 吸いこむ空気の線 */}
        {breath > 0.05 && [0, 1, 2, 3].map((i) => {
          const t = ((f / 10 + i / 4) % 1);
          const a = (-150 + i * 40) * Math.PI / 180;
          const r = lerp(220, 90, t);
          const cy = wy - 190;
          return <path key={i} d={`M ${px + Math.cos(a) * r} ${cy + Math.sin(a) * r} q ${-Math.cos(a) * 20} ${-Math.sin(a) * 20 + 10} ${-Math.cos(a) * 40} ${-Math.sin(a) * 40}`}
            stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={breath * Math.sin(t * Math.PI)} />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #41 最初の目覚ましは、機械ではありませんでした。
// 格: 並 / seed 6041
// 絵: どこ: 博物館の細長い展示室「起こす道具」(木の床・ガラスの陳列台が一列・天井のスポット・壁の年代札)。演出: 陳列台が右から左へ、新しい順に並ぶ: スマホ → ベルの付いた丸い目覚まし時計 → 木の振り子時計 → 歯車だけの古い機械。カメラが左へパンしながら、だんだん古い台へ進んでいく。いちばん左、いちばん古い陳列台には何も機械が置かれておらず、白い布がかけてある。係員 (紺の制服の男性、手袋) が、歯車の機械をそこへ置こうとすると、布の下の「何か」がもぞもぞ動いて、歯車の機械をぽいっと押し返す。係員がのけぞる (face="surprised")。腕は2本 (係員 pose="carry")。動き: f0-90 左へパン (古い台へ) / f90-110 機械を置こうとする / f110 布の下から押し返す / f115-150 係員がのけぞる・布がもぞもぞ
// どこ: 博物館の細長い展示室「起こす道具」(木の床・腰板の壁・天井のスポットライト・壁の上に「古 ←→ 新」の帯)。
//       陳列台が右から左へ新しい順: スマホ → ベルの目覚まし → 木の振り子時計 → 歯車の機械 (台は空で、ほこりの跡だけ) → 白い布の台
// 演出: カメラが左へパンして古い台へ。係員 (紺の制服・帽子・白い手袋・男性) が歯車の機械を抱えて布の台に置こうとすると、
//       布の下の「何か」がもぞもぞ動き、袖の手がにゅっと出て機械をぽいっと押し返す。係員はのけぞる
// 動き: f0-30 左へパン / f28-37 置こうとする / f37-41 押し返す / f40-46 のけぞる / 以後 布がもぞもぞ・機械が宙でゆれる
const MzBbMuseumRoom: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <rect x={-60} y={-60} width={w + 120} height={900} fill={CB.museumWall} />
    <g stroke="#D3C6B0" strokeWidth={3} opacity={0.7}>{Array.from({ length: Math.ceil(w / 120) + 2 }, (_, i) => <line key={i} x1={-60 + i * 120} y1={60} x2={-60 + i * 120} y2={640} />)}</g>
    <rect x={-60} y={640} width={w + 120} height={200} fill="#8C6A4A" stroke={KRP.ink} strokeWidth={6} />
    <g stroke="#6E5038" strokeWidth={4}>{Array.from({ length: Math.ceil(w / 200) + 1 }, (_, i) => <rect key={i} x={-40 + i * 200} y={664} width={170} height={150} fill="none" rx={6} />)}</g>
    <rect x={-60} y={-60} width={w + 120} height={100} fill="#3E3A40" stroke={KRP.ink} strokeWidth={6} />
    <rect x={-60} y={36} width={w + 120} height={14} fill={CB.metalDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-60} y={830} width={w + 120} height={320} fill={CB.museumFloor} stroke={KRP.ink} strokeWidth={6} />
    <g stroke="#9C7346" strokeWidth={4}>
      {[880, 950, 1030].map((ly) => <line key={ly} x1={-60} y1={ly} x2={w + 60} y2={ly} />)}
      {Array.from({ length: Math.ceil(w / 260) + 1 }, (_, i) => <line key={i} x1={i * 260 + (i % 2) * 90} y1={830} x2={i * 260 + (i % 2) * 90} y2={880} />)}
    </g>
  </g>
);
const MzBbSpot: React.FC<{ x: number; on?: number }> = ({ x, on = 1 }) => (
  <g>
    <polygon points={`${x - 30},84 ${x + 30},84 ${x + 180},620 ${x - 180},620`} fill="#FFF6D6" opacity={0.28 * on} />
    <rect x={x - 6} y={46} width={12} height={22} fill={CB.metalDark} stroke={KRP.ink} strokeWidth={3} />
    <path d={`M ${x - 26} 66 L ${x + 26} 66 L ${x + 34} 92 L ${x - 34} 92 Z`} fill="#2E2A30" stroke={KRP.ink} strokeWidth={4} />
  </g>
);
// 陳列台 (x=中心, 台の上面 y=560)。glass=true でガラスの箱
const MzBbCase: React.FC<{ x: number; glass?: boolean; children?: React.ReactNode; shake?: number }> = ({ x, glass = true, children, shake = 0 }) => (
  <g>
    <rect x={x - 130} y={560} width={260} height={270} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
    <rect x={x - 112} y={588} width={224} height={214} rx={6} fill="none" stroke={MP.woodDark} strokeWidth={4} opacity={0.6} />
    <rect x={x - 142} y={546} width={284} height={22} rx={5} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
    {children}
    {glass && (
      <g transform={`translate(${shake} 0)`}>
        <rect x={x - 124} y={290} width={248} height={258} fill={CB.glass} opacity={0.35} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${x - 100} 310 L ${x - 60} 310 L ${x - 104} 380 Z`} fill={KRP.white} opacity={0.6} />
        <line x1={x + 80} y1={320} x2={x + 104} y2={300} stroke={KRP.white} strokeWidth={6} opacity={0.6} strokeLinecap="round" />
      </g>
    )}
  </g>
);
// 歯車だけの古い機械 (x,y=底の中心)
const MzBbGearMachine: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-8} width={140} height={10} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -60 -6 L -60 -120 M 60 -6 L 60 -120 M -60 -120 L 60 -120" stroke={MP.iron} strokeWidth={9} fill="none" strokeLinecap="round" />
    {[[-22, -60, 34, 1], [26, -82, 22, -1.5]].map(([gx, gy, r, sp], i) => (
      <g key={i} transform={`translate(${gx} ${gy}) rotate(${f * 3 * sp})`}>
        {Array.from({ length: 10 }, (_, k) => <rect key={k} x={-5} y={-r - 8} width={10} height={12} fill={i ? MP.brassLight : MP.brass} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${k * 36})`} />)}
        <circle r={r} fill={i ? MP.brassLight : MP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle r={r * 0.3} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
  </g>
);
const MzBbGuardCap: React.FC<{ off?: number; rot?: number }> = ({ off = 0, rot = 0 }) => (
  <g transform={`translate(${off * 160} ${-off * 220}) rotate(${rot} 0 -280)`}>
    <path d="M -62 -262 Q -60 -318 0 -320 Q 60 -318 62 -262 Z" fill={CB.guard} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -70 -262 Q 0 -250 70 -262 L 74 -250 Q 0 -238 -74 -250 Z" fill={KRP.ink} />
    <rect x={-12} y={-300} width={24} height={20} rx={4} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const NEW_X = 3610; // 「新」の札 (ワールド座標。f=0 のカメラ位置で画面内)
const Mz041: React.FC<{ f: number }> = ({ f }) => {
  const camX = 1900 * (1 - easeInOut(seg(f, 0, 30)));
  const place = easeOut(seg(f, 28, 37));
  const push = easeOut(seg(f, 37, 41));
  const recoil = easeOut(seg(f, 39, 46));
  const wig = f > 20 ? Math.sin(f / 2.4) * (f > 36 ? 7 : 3) : 0;
  const gx = 760; // 係員の足元
  const lean = 16 * recoil;
  // 機械の位置: 係員の手元 → 布の台の上へ → 押し返されて宙へ
  const mx = lerp(lerp(gx - 140, 470, place * 0.75), gx - 60, push) + Math.sin(f / 3) * 4 * push;
  const my = lerp(lerp(735, 560, place), 600, push) - Math.sin(push * Math.PI) * 120 - recoil * 30;
  const pokeX = 450 + 150 * Math.sin(Math.PI * seg(f, 36, 44));
  return (
    <Frame f={f} seed={6041}>
      <g transform={`translate(${-camX} 0)`}>
        <MzBbMuseumRoom w={3900} />
        {/* 壁の上の年代の帯: 古 ←→ 新 */}
        <g>
          <line x1={360} y1={210} x2={3500} y2={210} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          <path d="M 330 210 l 34 -20 l 0 40 Z M 3530 210 l -34 -20 l 0 40 Z" fill={KRP.ink} />
          <TagPlate x={270} y={210} text="古" size={44} />
          <g transform={`translate(${NEW_X - 100} 0)`}><TagPlate x={100} y={210} text="新" size={44} /></g>
          {[1050, 1650, 2250, 2850].map((tx) => <circle key={tx} cx={tx} cy={210} r={12} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {[450, 1050, 1650, 2250, 2850].map((sx) => <MzBbSpot key={sx} x={sx} />)}
        {/* スマホ */}
        <MzBbCase x={2850}>
          <g transform="translate(2850 470) rotate(-6)">
            <rect x={-34} y={-70} width={68} height={130} rx={12} fill="#2B2D33" stroke={KRP.ink} strokeWidth={5} />
            <rect x={-27} y={-60} width={54} height={106} rx={6} fill="#CFE9FF" />
            {[0, 1, 2].map((i) => <rect key={i} x={-20} y={-48 + i * 26} width={40} height={14} rx={7} fill={i === 0 ? MP.bell : KRP.gray} />)}
          </g>
          <rect x={2830} y={530} width={40} height={18} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
        </MzBbCase>
        {/* ベルの付いた丸い目覚まし */}
        <MzBbCase x={2250}>
          <g transform="translate(2250 452)">
            {[-1, 1].map((sd) => <g key={sd}>
              <path d={`M ${sd * 36} -64 A 30 30 0 0 1 ${sd * 82} -40`} fill={MP.bell} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${sd * 10})`} />
              <line x1={sd * 40} y1={60} x2={sd * 60} y2={92} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
            </g>)}
            <circle r={72} fill={MP.bell} stroke={KRP.ink} strokeWidth={6} />
            <circle r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={0} x2={28} y2={10} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <circle r={6} fill={KRP.ink} />
          </g>
        </MzBbCase>
        {/* 木の振り子時計 */}
        <MzBbCase x={1650}>
          <g transform="translate(1650 300)">
            <path d="M -70 0 L 70 0 L 70 246 L -70 246 Z" fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -84 0 L 0 -40 L 84 0 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={60} r={46} fill="#F4ECD4" stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={60} x2={0} y2={28} stroke={KRP.ink} strokeWidth={5} /><line x1={0} y1={60} x2={24} y2={70} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-44} y={120} width={88} height={110} fill="#3E2A1C" stroke={KRP.ink} strokeWidth={4} />
            <g transform={`rotate(${Math.sin(f / 8) * 14} 0 124)`}>
              <line x1={0} y1={124} x2={0} y2={200} stroke={MP.brass} strokeWidth={5} />
              <circle cx={0} cy={206} r={16} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        </MzBbCase>
        {/* 歯車の機械の台 (いまは空。ほこりの跡) */}
        <MzBbCase x={1050}>
          <rect x={980} y={536} width={140} height={12} rx={4} fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="10 8" />
        </MzBbCase>
        {/* いちばん古い台: 白い布がかかった何か */}
        <MzBbCase x={450} glass={false}>
          <g transform={`translate(${wig} 0) rotate(${wig * 0.4} 450 560)`}>
            <path d={`M 340 556 Q 330 420 372 330 Q 392 250 452 240 Q 514 246 532 330 Q 572 420 562 556 Q 520 548 500 556 Q 470 540 450 556 Q 420 544 396 556 Q 370 546 340 556 Z`}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 400 300 Q 390 420 380 540 M 470 270 Q 480 400 490 540 M 430 360 Q 436 450 432 540" stroke="#D8D0C2" strokeWidth={4} fill="none" />
            {/* てっぺんの小さなでっぱり (冠のとさか?) */}
            <path d={`M 430 248 Q 440 ${220 + wig} 456 226 Q 470 ${214 - wig} 478 244`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 布の下から出る袖と手 (押し返す) */}
          {f > 35 && (
            <g>
              <path d={`M 540 470 Q ${(540 + pokeX + 120) / 2} 450 ${pokeX + 120} 476 L ${pokeX + 120} 516 Q ${(540 + pokeX + 120) / 2} 500 540 520 Z`} fill={CB.robe} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={pokeX + 136} cy={496} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            </g>
          )}
        </MzBbCase>
        {/* もぞもぞの線 */}
        {f > 20 && [0, 1].map((i) => (
          <path key={i} d={`M ${300 - i * 24} ${330 + i * 60} q -16 10 0 20 q 16 10 0 20`} stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.5 + 0.5 * Math.sin(f / 3 + i)} strokeLinecap="round" />
        ))}
        {/* 係員 (紺の制服・男性)。機械を抱えて左へ */}
        <MzBbFig x={gx} y={830} s={0.9} f={f} cloth={CB.guard} clothDark={CB.guardDark} hair="cap" phase={1} lean={lean}
          face={recoil > 0.3 ? "surprised" : "normal"} gaze={[-6, 0]}
          arms={[[lerp(72, 120, recoil), 96], [lerp(78, -70, recoil), lerp(140, 92, recoil)]]}
          over={<g>
            <rect x={-58} y={-120} width={116} height={10} fill={MP.brass} opacity={0.8} />
            <circle cx={-30} cy={-140} r={5} fill={MP.brass} /><circle cx={-30} cy={-110} r={5} fill={MP.brass} />
            <MzBbGuardCap off={recoil * 0.25} rot={-recoil * 14} />
          </g>} />
        {/* 抱えている (押し返された) 歯車の機械 */}
        <MzBbGearMachine x={mx} y={my} s={0.9} f={f} />
        {recoil > 0.2 && [0, 1, 2].map((i) => (
          <line key={i} x1={gx + 90 + i * 10} y1={560 + i * 34} x2={gx + 130 + i * 12} y2={556 + i * 34} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={recoil} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #42 人間です。
// 格: 山 / seed 6042
// 絵: どこ: #41 の博物館のいちばん古い陳列台の前。演出: 白い布がばさっと取り払われると、陳列台の上に立っていたのは機械ではなく人間 = 鶏人 (赤い頭巾に、鶏のとさかを模した赤い冠・長い袖の衣・男性) 。彼は胸を反らし、両手を口の横に添えて、口を大きく開けて大声を出す (音の線が画面いっぱいに太く広がる)。その声で、展示室のガラスがびりびり震え、係員の帽子が吹っ飛び、見学に来ていた「あなた」(橙のパーカー・hair="cap") が飛び上がって、手のスマホを落としそうになる。陳列台の札は空欄のまま「?」が「人」の札に差し替わる (札は短い1字)。腕は2本 (鶏人 pose="shout" で両手を口の横に)。動き: f0-20 布が飛ぶ / f20-80 カメラが鶏人の足元から顔へ上がる / f80 大声 / f80-140 ガラスの震え・帽子・あなたの飛び上がり
// どこ: #41 の博物館の、いちばん古い陳列台の前 (同じ展示室・スポットライト・隣のガラスの振り子時計)
// 演出: 白い布がばさっと飛ぶと、台の上に立っていたのは鶏人 (赤い頭巾+とさかの冠・紫の長い衣・男性)。胸を反らし、両手を口の横に
//       添えて大声。音の線が画面いっぱいに広がり、ガラスがびりびり震え、振り子が暴れ、係員の帽子が吹っ飛び、見学の「あなた」
//       (橙のパーカー) が飛び上がってスマホを手からこぼしそうになる。台の札が「?」から「人」に差し替わる
// 動き: f0-8 布が飛ぶ / f2-20 カメラが足元から顔へ上がりつつ引く / f14 大声 / f14-39 震え・帽子・飛び上がり (尺39f、f=45 は最終形)
const Mz042: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 2, 20));
  const cs = lerp(1.7, 1, k), fx = lerp(760, 960, k), fy = lerp(640, 540, k);
  const cloth = easeOut(seg(f, 0, 9));
  const shout = easeOut(seg(f, 13, 17));
  const shake = shout * Math.sin(f * 2.9) * 6;
  const jump = Math.sin(Math.PI * seg(f, 15, 31)) * shout;
  const hatT = seg(f, 15, 34);
  const plateSwap = seg(f, 16, 22);
  const PX = 760, PY = 640;
  const ks = 1.0;
  const mouthY = PY - 186 * ks;
  return (
    <Frame f={f} seed={6042}>
      <g transform={`translate(${960 - fx * cs + shake * 0.4} ${540 - fy * cs}) scale(${cs})`}>
        <MzBbMuseumRoom w={2000} />
        <MzBbSpot x={PX} on={1} />
        <MzBbSpot x={1620} />
        {/* 隣のガラスの振り子時計 (びりびり) */}
        <MzBbCase x={1620} shake={shake}>
          <g transform={`translate(${1620 + shake * 0.5} 300)`}>
            <path d="M -70 0 L 70 0 L 70 246 L -70 246 Z" fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -84 0 L 0 -40 L 84 0 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={60} r={46} fill="#F4ECD4" stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={60} x2={0} y2={28} stroke={KRP.ink} strokeWidth={5} /><line x1={0} y1={60} x2={24} y2={70} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-44} y={120} width={88} height={110} fill="#3E2A1C" stroke={KRP.ink} strokeWidth={4} />
            <g transform={`rotate(${Math.sin(f / (shout > 0.5 ? 2 : 8)) * (14 + 22 * shout)} 0 124)`}>
              <line x1={0} y1={124} x2={0} y2={200} stroke={MP.brass} strokeWidth={5} />
              <circle cx={0} cy={206} r={16} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        </MzBbCase>
        {shout > 0.1 && [0, 1, 2].map((i) => (
          <path key={i} d={`M ${1480 - i * 12} ${330 + i * 70} l -14 10 l 14 10 l -14 10`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={shout} />
        ))}
        {/* いちばん古い陳列台 (大きめ) */}
        <rect x={PX - 170} y={PY} width={340} height={190} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={PX - 150} y={PY + 22} width={300} height={150} rx={6} fill="none" stroke={MP.woodDark} strokeWidth={4} opacity={0.6} />
        <rect x={PX - 186} y={PY - 16} width={372} height={24} rx={5} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {/* 札: ? → 人 */}
        <TagPlate x={PX} y={PY + 96} text="?" size={54} t={1 - plateSwap * 2} />
        <TagPlate x={PX} y={PY + 96} text="人" size={54} t={(plateSwap - 0.5) * 2} color={CB.shuDark} />
        {/* 鶏人 (胸を反らして大声) */}
        <MzBbFig x={PX} y={PY - 4} s={ks} f={f} cloth={CB.robe} clothDark={CB.robeDark} hair="none" phase={3} lean={-4 * shout}
          face="surprised" arms={[[lerp(10, -139, shout), lerp(90, 56, shout)], [lerp(-10, 139, shout), lerp(90, 56, shout)]]} sleeveW={34} hand={false}
          over={<g>
            <MzBbRobe />
            <MzBbKeijinHat f={f} />
            {/* 決意の眉 */}
            <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
              <line x1={-38} y1={-258} x2={-12} y2={-250} /><line x1={12} y1={-250} x2={38} y2={-258} />
            </g>
            <rect x={-30} y={-201} width={60} height={30} fill={KRP.white} />
            <MzBbMouth open={shout} w={1.3} />
            {shout > 0.3 ? (
              <g>
                {[-1, 1].map((sd) => (
                  <path key={sd} d={`M ${sd * 30} -208 q ${sd * 24} 12 ${sd * 20} 36 q ${sd * -10} 6 ${sd * -16} -4 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
                ))}
              </g>
            ) : (
              <g>
                <circle cx={armEnd(-1, lerp(10, -139, shout), lerp(90, 56, shout))[0]} cy={armEnd(-1, lerp(10, -139, shout), lerp(90, 56, shout))[1]} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
                <circle cx={armEnd(1, lerp(-10, 139, shout), lerp(90, 56, shout))[0]} cy={armEnd(1, lerp(-10, 139, shout), lerp(90, 56, shout))[1]} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              </g>
            )}
          </g>} />
        {/* 大声の線 (左右へ画面いっぱい) */}
        <MzBbShout x={PX + 40} y={mouthY} f={f} amt={shout} dir={0} spread={42} n={6} r0={70} step={110} w={16} />
        <MzBbShout x={PX - 40} y={mouthY} f={f} amt={shout} dir={180} spread={42} n={5} r0={70} step={110} w={16} />
        {/* 飛んでいく白い布 */}
        {cloth < 1 && (
          <g transform={`translate(${PX + cloth * 500} ${PY - 220 - cloth * 420}) rotate(${cloth * 80})`} opacity={1 - cloth * 0.6}>
            <path d="M -150 120 Q -120 -40 0 -80 Q 130 -40 160 120 Q 80 90 0 130 Q -80 90 -150 120 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -60 -40 Q -50 40 -70 110 M 50 -40 Q 60 40 70 110" stroke="#D8D0C2" strokeWidth={4} fill="none" />
          </g>
        )}
        {cloth > 0 && cloth < 1 && [0, 1, 2].map((i) => (
          <line key={i} x1={PX + 100 + i * 50} y1={PY - 120 - i * 40} x2={PX + 60 + i * 50} y2={PY - 40 - i * 40} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - cloth} />
        ))}
        {/* 係員 (左)。帽子が吹っ飛ぶ */}
        <MzBbFig x={300} y={830} s={0.9} f={f} cloth={CB.guard} clothDark={CB.guardDark} hair="cap" phase={1} lean={-12 * shout}
          face="surprised" arms={[[lerp(8, 60, shout), 86], [lerp(-8, -150, shout), 86]]}
          over={<g>
            <rect x={-58} y={-120} width={116} height={10} fill={MP.brass} opacity={0.8} />
            <MzBbGuardCap off={hatT * 1.6} rot={-hatT * 300} />
            {/* 吹っ飛ぶ髪 */}
            {shout > 0.3 && <path d="M 40 -290 q 20 -20 50 -10 M 20 -296 q 20 -30 60 -26" stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />}
          </g>} />
        {/* あなた (橙のパーカー)。飛び上がってスマホをこぼしそう */}
        <MzBbFig x={1230} y={830 - jump * 70} s={0.9} f={f} cloth={CB.hoodie} clothDark={MP.youDark} hair="cap" phase={4}
          face="surprised" lean={8 * shout} arms={[[lerp(8, 150, shout), 86], [lerp(-8, -120, shout), 86]]}
          behind={<g>
            <path d="M -70 -170 Q -80 -232 -50 -270 Q 0 -300 50 -270 Q 80 -232 70 -170 Z" fill={CB.hoodieDark} stroke={KRP.ink} strokeWidth={5} />
          </g>}
          over={<g>
            <rect x={-34} y={-112} width={68} height={30} rx={8} fill={CB.hoodieDark} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -14 -158 L -16 -126 M 14 -158 L 16 -126" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
            {/* 汗と驚きの線 */}
            {shout > 0.3 && <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
              <line x1={-70} y1={-320} x2={-90} y2={-350} /><line x1={0} y1={-330} x2={0} y2={-366} /><line x1={70} y1={-320} x2={90} y2={-350} />
            </g>}
          </g>} />
        {/* 手からこぼれかけのスマホ */}
        {(() => {
          const [hx, hy] = armEnd(1, lerp(-8, -120, shout), 86);
          const bx = 1230 + hx * 0.9 + 26 * shout, by = 830 - jump * 70 + hy * 0.9 - 40 * shout - Math.sin(f / 3) * 6 * shout;
          return (
            <g transform={`rotate(${shout * (30 + Math.sin(f / 2) * 20)} ${bx} ${by})`}>
              <rect x={bx - 18} y={by - 32} width={36} height={64} rx={7} fill="#2B2D33" stroke={KRP.ink} strokeWidth={4} />
              <rect x={bx - 13} y={by - 26} width={26} height={50} rx={4} fill="#CFE9FF" />
            </g>
          );
        })()}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #43 古代中国の書物『周礼』には、「鶏人」という役職が出てきます。
// 格: 並 / seed 6043
// 絵: どこ: 古代中国の宮殿の書庫 (朱塗りの棚・巻いた竹簡が積まれた棚・油の灯明・机)。演出: 机の上で竹簡の巻物がころころとほどけていく (竹の札をひもでつないだ細部・墨の字は小さなくずした線で)。巻物の表題の札に「周礼」の2字。広がった竹簡の1か所に「鶏人」の2字が金色にぽうっと光る。すると、その字のところから、飛び出す絵本のように小さな鶏人 (赤い頭巾・とさかの赤い冠・長い袖・男性) が紙のように折り畳まれた状態でぱたぱた立ち上がり、ふわあと伸びをする (face="sleepy")。灯明の火がゆれる。札は「周礼」「鶏人」だけ。腕は2本 (小さな鶏人 pose="stretch")。動き: f0-60 竹簡がほどける (カメラも巻物に沿って右へパン) / f60 字が光る / f70-120 鶏人が立ち上がる / f120-150 伸び
// どこ: 古代中国の宮殿の書庫。朱塗りの棚に巻いた竹簡が積まれ、手前は大きな木の机。机の右に油の灯明
// 演出: 机の上で竹簡の巻物がころころほどけて広がる (竹の札をひも2本でつないだ細部・墨の字はくずした線)。左端の題の木札に「周礼」。
//       広がった1枚に「鶏人」の2字が金色に光り、そこから飛び出す絵本のように紙の鶏人がぱたぱた立ち上がり、ふわあと伸びとあくび
// 動き: f0-30 巻物がほどける (カメラも右へ) / f28 字が光る / f31-40 紙の鶏人が起き上がる / f40- 伸び・あくび・灯明の火がゆれる
const Mz043: React.FC<{ f: number }> = ({ f }) => {
  const un = easeOut(seg(f, 0, 30));
  const camX = 200 * easeInOut(seg(f, 0, 32));
  const x0 = 380;
  const endX = lerp(560, 1820, un);
  const n = Math.floor((endX - x0) / 40);
  const glow = easeOut(seg(f, 27, 33));
  const up = easeOut(seg(f, 31, 40));
  const st = easeOut(seg(f, 39, 46));
  const yawn = Math.sin(Math.PI * seg(f, 42, 90));
  const KX = 1150, KY = 772;
  const FX = KX + 110; // 紙の鶏人の足元 (光る字の右どなり)
  const slipY0 = 590, slipH = 190;
  const rollR = 46;
  return (
    <Frame f={f} seed={6043}>
      <g transform={`translate(${-camX} 0)`}>
        {/* 奥の壁と朱塗りの棚 */}
        <rect x={-60} y={-60} width={2400} height={560} fill="#6E4A3A" />
        {[0, 1, 2].map((b) => {
          const bx = -20 + b * 800;
          return (
            <g key={b}>
              <rect x={bx} y={40} width={720} height={440} fill="#4A2E24" stroke={KRP.ink} strokeWidth={6} />
              {[40, 180, 320].map((sy) => <rect key={sy} x={bx} y={sy + 130} width={720} height={16} fill={CB.shu} stroke={KRP.ink} strokeWidth={4} />)}
              <rect x={bx} y={40} width={22} height={440} fill={CB.shu} stroke={KRP.ink} strokeWidth={5} />
              <rect x={bx + 698} y={40} width={22} height={440} fill={CB.shu} stroke={KRP.ink} strokeWidth={5} />
              {/* 巻いた竹簡 (端から見た丸) を積む */}
              {[0, 1, 2].map((r) => Array.from({ length: 9 }, (_, i) => {
                const cx = bx + 60 + i * 72 + (r % 2) * 20, cy = 140 + r * 140 - (i % 3 === 1 ? 8 : 0);
                if (rnd(b * 7 + r, i) < 0.15) return null;
                return <g key={`${r}-${i}`}>
                  <circle cx={cx} cy={cy} r={28} fill={CB.bamboo} stroke={KRP.ink} strokeWidth={4} />
                  <circle cx={cx} cy={cy} r={18} fill="none" stroke={CB.bambooDark} strokeWidth={3} />
                  <circle cx={cx} cy={cy} r={8} fill={CB.bambooDark} />
                </g>;
              }))}
            </g>
          );
        })}
        {/* 机 (天板は奥へ傾いた台形) */}
        <path d="M -60 500 L 2340 500 L 2340 860 L -60 860 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={MP.woodDark} strokeWidth={4} opacity={0.5}>
          {[540, 620, 720, 820].map((ly, i) => <path key={i} d={`M -60 ${ly} q 600 ${i % 2 ? 10 : -10} 1200 0 t 1200 0`} fill="none" />)}
        </g>
        <rect x={-60} y={850} width={2400} height={300} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#5E3F25" strokeWidth={4} opacity={0.6}>{[900, 960, 1020].map((ly) => <line key={ly} x1={-60} y1={ly} x2={2340} y2={ly} />)}</g>
        {/* 灯明 (油の皿) */}
        <g>
          <circle cx={1990} cy={520} r={140} fill={MP.glow} opacity={0.16 + 0.03 * Math.sin(f / 4)} />
          <rect x={1972} y={560} width={36} height={80} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={1990} cy={640} rx={60} ry={14} fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1940 552 Q 1990 590 2040 552 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
          <Flame x={1990} y={548} s={1.1} f={f} />
        </g>
        {/* 筆と硯 */}
        <g>
          <rect x={160} y={720} width={150} height={90} rx={10} fill="#3B3638" stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={210} cy={765} rx={36} ry={22} fill="#1E1A1C" />
          <line x1={250} y1={700} x2={400} y2={660} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
          <path d="M 236 704 l 20 -2 l -4 10 Z" fill={KRP.ink} />
        </g>
        {/* 広がった竹簡 */}
        <g>
          {Array.from({ length: n }, (_, i) => {
            const sx = x0 + i * 40;
            const hit = Math.abs(sx + 18 - KX) < 22;
            return (
              <g key={i}>
                <rect x={sx} y={slipY0} width={36} height={slipH} rx={4} fill={hit ? mixColor(CB.bamboo, "#FFE9A0", glow) : CB.bamboo} stroke={KRP.ink} strokeWidth={3.5} />
                <line x1={sx + 6} y1={slipY0 + 8} x2={sx + 6} y2={slipY0 + slipH - 8} stroke={KRP.white} strokeWidth={3} opacity={0.4} />
                {!hit && [0, 1, 2, 3, 4].map((c) => (rnd(i, c) > 0.2 &&
                  <path key={c} d={`M ${sx + 10} ${slipY0 + 24 + c * 32} l 16 0 M ${sx + 18} ${slipY0 + 18 + c * 32} l 0 14 M ${sx + 11} ${slipY0 + 34 + c * 32} l 5 -4`} stroke="#2B2420" strokeWidth={3.5} fill="none" strokeLinecap="round" />))}
                {hit && (
                  <g>
                    <circle cx={sx + 18} cy={slipY0 + 70} r={70 * glow} fill="#FFE27A" opacity={0.35 * glow} />
                    <text x={sx + 18} y={slipY0 + 66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
                      fill={glow > 0.3 ? "#C8901E" : "#2B2420"}>鶏</text>
                    <text x={sx + 18} y={slipY0 + 102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
                      fill={glow > 0.3 ? "#C8901E" : "#2B2420"}>人</text>
                  </g>
                )}
              </g>
            );
          })}
          {/* つなぐひも 2本 */}
          {[slipY0 + 38, slipY0 + slipH - 38].map((ly) => (
            <path key={ly} d={`M ${x0 - 10} ${ly} L ${endX} ${ly}`} stroke="#8A5A2E" strokeWidth={5} strokeDasharray="30 10" />
          ))}
          {/* まだ巻いてある部分 (ころころ) */}
          <g transform={`translate(${endX + rollR - 6} ${slipY0 + slipH / 2})`}>
            <rect x={-rollR} y={-slipH / 2 - 6} width={rollR * 2} height={slipH + 12} rx={rollR} fill={CB.bambooDark} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={-slipH / 2} rx={rollR} ry={14} fill={CB.bamboo} stroke={KRP.ink} strokeWidth={4} />
            <g transform={`rotate(${un * 900})`} opacity={0.8}>
              <line x1={-rollR + 8} y1={0} x2={rollR - 8} y2={0} stroke={KRP.ink} strokeWidth={3} />
            </g>
            {un < 1 && <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6}>
              <line x1={rollR + 14} y1={-30} x2={rollR + 40} y2={-30} /><line x1={rollR + 14} y1={10} x2={rollR + 46} y2={10} />
            </g>}
          </g>
          {/* 題の木札 (左端に結ぶ) */}
          <line x1={x0 + 4} y1={slipY0 + 38} x2={x0 - 30} y2={slipY0 - 10} stroke="#8A5A2E" strokeWidth={4} />
          <TagPlate x={x0 - 40} y={slipY0 - 50} text="周礼" size={40} rot={-6 + Math.sin(f / 20) * 2} />
        </g>
        {/* 紙の鶏人 (飛び出す絵本のように立ち上がる) */}
        {up > 0 && (
          <g>
            {/* 台紙のつまみ (折り目) */}
            <path d={`M ${FX - 40} ${KY} L ${FX + 40} ${KY} L ${FX + 30} ${KY - 16 * up} L ${FX - 30} ${KY - 16 * up} Z`} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
            <g transform={`translate(${FX} ${KY}) scale(1 ${up}) translate(${-FX} ${-KY})`}>
              <MzBbFig x={FX} y={KY} s={0.92} f={f} cloth={CB.robe} clothDark={CB.robeDark} hair="none" phase={6} face="normal"
                arms={[[lerp(10, 165, st) + Math.sin(f / 9) * 4 * st, 86], [lerp(-10, -165, st) - Math.sin(f / 9) * 4 * st, 86]]} sleeveW={34}
                over={<g>
                  <MzBbRobe />
                  <MzBbKeijinHat f={f} />
                  <MzBbSleepyEyes k={0.55 + 0.35 * yawn} />
                  {yawn > 0.1 && <g><rect x={-24} y={-198} width={48} height={22} fill={KRP.white} /><MzBbMouth open={yawn * 0.8} /></g>}
                  {/* 紙の折り目 */}
                  <path d="M 0 -150 L 0 -14 M -40 -60 L 40 -60" stroke={KRP.cream} strokeWidth={3} strokeDasharray="8 6" />
                </g>} />
            </g>
            {/* ぱたぱたの線 */}
            {up < 1 && [-1, 1].map((sd) => <path key={sd} d={`M ${FX + sd * 70} ${KY - 60} q ${sd * 16} -10 ${sd * 10} -30`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />)}
            {/* ふわあの息 */}
            {yawn > 0.2 && <ellipse cx={FX + 60} cy={KY - 130 - yawn * 20} rx={26 * yawn} ry={16 * yawn} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />}
          </g>
        )}
        {/* 光の粒 */}
        {glow > 0 && Array.from({ length: 6 }, (_, i) => {
          const t = ((f / 30 + i / 6) % 1);
          return <path key={i} d={`M ${KX - 200 + i * 24} ${KY - 220 - t * 140} l 4 -10 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 Z`}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2} opacity={glow * Math.sin(t * Math.PI)} />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #44 仕事は、夜明けを大声で知らせて、役人たちを起こすこと。
// 格: 山 / seed 6044
// 絵: どこ: 夜明け前の古代中国の宮殿の中庭。高い石段の上に鶏人、下には役人たちの宿舎の長屋 (朱塗りの柱・格子の窓・瓦屋根) が並ぶ。空は紺から、地平の端だけかすかに白む。演出: 鶏人 (赤い頭巾・とさかの赤い冠・長い袖・男性) が両手を口に当てて大声で知らせる。音の線が石段から宿舎へ波のように広がる。カメラがその音を追って宿舎の窓の列へパンすると、窓に1つずつ灯がともっていき、中の役人たち (男性・黒い冠・長い衣) が飛び起きる: 冠が斜めになる人、寝床から転げ落ちる人、袖に腕を通しそこねてぐるぐる回る人、あくびをしながら枕を抱える人。腕は2本 (鶏人 pose="shout"、役人も1人ずつ pose を付ける)。動き: f0-30 鶏人の大声 / f30-140 カメラが右へパン・窓の灯が順に点く・役人の4通りの反応 / f140-160 少し引いて宮殿全体が起きた様子
// どこ: 夜明け前の古代中国の宮殿の中庭。左に高い石段と台、その上に鶏人。右に役人たちの宿舎の長屋 (朱の柱・格子の窓・瓦屋根)。
//       空は紺で星、地平の端だけかすかに白む。中庭は石だたみ
// 演出: 鶏人が両手を口に当てて大声。音の線が波になって宿舎へ。窓に1つずつ灯がともり、中の役人 (男性・黒い冠・青い衣) が4通りに飛び起きる:
//       ①冠が斜めのまま目をむく ②寝床から転げ落ちて足が上 ③袖に腕を通しそこねてぐるぐる回る ④枕を抱えたまま大あくび
// 動き: f0-10 鶏人に寄って大声 / f10-30 音を追って右へパン・窓が順に点く / f30-42 引いて宮殿全体 / 以後 役人の動きがくり返す
const MzBbOfficialCap: React.FC<{ rot?: number }> = ({ rot = 0 }) => (
  <g transform={`rotate(${rot} 0 -270)`}>
    <path d="M -50 -262 Q -52 -312 0 -314 Q 52 -312 50 -262 Z" fill="#26232A" stroke={KRP.ink} strokeWidth={5} />
    <rect x={-22} y={-338} width={44} height={30} rx={8} fill="#26232A" stroke={KRP.ink} strokeWidth={5} />
    <path d="M 46 -280 q 40 -6 60 10 M -46 -280 q -40 -6 -60 10" stroke="#26232A" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);
const Mz044: React.FC<{ f: number }> = ({ f }) => {
  const cA = easeInOut(seg(f, 10, 30)), cC = easeInOut(seg(f, 30, 42));
  const cs = lerp(1.3, 1, cC);
  const fx = f < 30 ? lerp(420, 1300, cA) : lerp(1300, 960, cC);
  const fy = lerp(lerp(400, 520, cA), 540, cC);
  const shout = easeOut(seg(f, 2, 7));
  const lit = (i: number) => easeOut(seg(f, 13 + i * 5, 17 + i * 5));
  const KX = 250, KY = 470;
  const mouth: [number, number] = [KX + 24, KY - 186 * 0.75];
  const WX = [760, 1040, 1320, 1600];
  const WY = 500, WW = 230, WH = 240;
  return (
    <Frame f={f} seed={6044} dark>
      <g transform={`translate(${960 - fx * cs} ${540 - fy * cs}) scale(${cs})`}>
        {/* 空: 紺、地平の端だけ白む */}
        <rect x={-600} y={-300} width={3100} height={1500} fill={MP.nightDeep} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={-600} y={160 + i * 40} width={3100} height={42} fill={mixColor(MP.nightDeep, "#7A7AA8", (i / 7) * 0.7)} />
        ))}
        <rect x={-600} y={480} width={3100} height={40} fill="#A9A6C4" opacity={0.5} />
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={-400 + rnd(44, i) * 2700} cy={-200 + rnd(45, i) * 380} r={rnd(46, i) > 0.7 ? 3.5 : 2} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} />
        ))}
        {/* 遠くの宮殿の屋根の影 */}
        <path d="M -600 420 L -200 420 Q -120 360 -60 330 L 380 330 Q 440 360 520 420 L 2500 420 L 2500 560 L -600 560 Z" fill="#26304F" />
        {/* 中庭の石だたみ */}
        <rect x={-600} y={540} width={3100} height={700} fill={MP.stoneDark} />
        <g stroke={MP.stone} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-600} y1={600 + i * 70} x2={2500} y2={600 + i * 70} />)}
          {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-600 + i * 110 + (i % 2) * 40} y1={540} x2={-600 + i * 110 + (i % 2) * 40} y2={1200} />)}
        </g>
        {/* 左: 高い石段と台 */}
        <rect x={-600} y={KY} width={600} height={60} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-600} y={KY + 60} width={560} height={600} fill={MP.stone} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={0 + i * 36} y={KY + 10 + i * 52} width={260} height={52} fill={i % 2 ? MP.stone : MP.stoneLight} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <path d={`M -40 ${KY} L 10 ${KY} L 290 ${KY + 380}`} stroke={CB.shu} strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* 灯籠 (台の上) */}
        <g>
          <rect x={60} y={KY - 120} width={14} height={120} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <rect x={38} y={KY - 170} width={58} height={56} rx={10} fill="#F7D68A" stroke={KRP.ink} strokeWidth={5} />
          <Flame x={67} y={KY - 128} s={0.7} f={f} />
        </g>
        {/* 鶏人 (大声) */}
        <MzBbFig x={KX} y={KY} s={0.75} f={f} cloth={CB.robe} clothDark={CB.robeDark} hair="none" phase={3} lean={-5 * shout}
          face="surprised" arms={[[lerp(10, -139, shout), lerp(90, 56, shout)], [lerp(-10, 139, shout), lerp(90, 56, shout)]]} sleeveW={34} hand={false}
          over={<g>
            <MzBbRobe />
            <MzBbKeijinHat f={f} />
            <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round"><line x1={-38} y1={-258} x2={-12} y2={-250} /><line x1={12} y1={-250} x2={38} y2={-258} /></g>
            <rect x={-30} y={-201} width={60} height={30} fill={KRP.white} />
            <MzBbMouth open={shout * (0.85 + 0.15 * Math.sin(f / 3))} w={1.3} />
            {[-1, 1].map((sd) => (
              <path key={sd} d={`M ${sd * 30} -208 q ${sd * 24} 12 ${sd * 20} 36 q ${sd * -10} 6 ${sd * -16} -4 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" opacity={shout} />
            ))}
          </g>} />
        {/* 音の波 (宿舎へ) */}
        <MzBbShout x={mouth[0] + 30} y={mouth[1]} f={f} amt={shout} dir={8} spread={26} n={7} r0={60} step={190} w={18} color="#FFF3C8" />
        {/* 右: 役人の宿舎の長屋 */}
        <rect x={620} y={400} width={1300} height={440} fill="#E7D7B6" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 580 410 Q 640 380 680 330 L 1860 330 Q 1900 380 1960 410 Z" fill={CB.kawara} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g stroke={CB.kawaraDark} strokeWidth={5}>{Array.from({ length: 36 }, (_, i) => <line key={i} x1={690 + i * 33} y1={334} x2={670 + i * 34} y2={406} />)}</g>
        <rect x={660} y={318} width={1220} height={18} rx={6} fill={CB.kawaraDark} stroke={KRP.ink} strokeWidth={5} />
        {[630, 900, 1180, 1460, 1740, 1880].map((px) => (
          <rect key={px} x={px} y={410} width={30} height={430} fill={CB.shu} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 窓と中の役人 */}
        {WX.map((wx, i) => {
          const L = lit(i);
          const cid = `mzbb44w${i}`;
          const ox = wx + WW / 2, oy = WY + WH;
          let fig: React.ReactNode = null;
          if (i === 0) {
            // ① 冠が斜め・目をむく
            fig = <MzBbFig x={ox} y={oy + 60} s={0.62} f={f} cloth={CB.official} clothDark={CB.officialDark} hair="cap" face="surprised" phase={i}
              arms={[[30 + 10 * Math.sin(f / 5), 80], [-150, 80]]} over={<MzBbOfficialCap rot={-24 + Math.sin(f / 6) * 4} />} />;
          } else if (i === 1) {
            // ② 寝床から転げ落ちる (足が上)
            const roll = easeOut(seg(f, 20, 30));
            fig = <g transform={`rotate(${lerp(0, 170, roll)} ${ox} ${oy - 60})`}>
              <MzBbFig x={ox} y={oy + 30} s={0.58} f={f} cloth={CB.official} clothDark={CB.officialDark} hair="cap" face="surprised" phase={i}
                arms={[[140, 80], [-140, 80]]} over={<MzBbOfficialCap rot={30} />} />
            </g>;
          } else if (i === 2) {
            // ③ 袖に腕を通しそこねて、ぐるぐる回る
            const spin = f * 9;
            fig = <g transform={`rotate(${Math.sin(spin / 57) * 18} ${ox} ${oy})`}>
              <MzBbFig x={ox + Math.sin(f / 4) * 20} y={oy + 50} s={0.6} f={f} cloth={KRP.white} clothDark={CB.officialDark} hair="cap" face="worried" phase={i}
                arms={[[100 + Math.sin(f / 3) * 30, 80], [-20, 80]]} sleeve={KRP.white}
                over={<g>
                  <MzBbOfficialCap rot={8} />
                  {/* 片袖だけ通った青い衣が、ぶらんと回る */}
                  <path d={`M 60 -150 Q ${110 + Math.sin(f / 3) * 40} ${-120 + Math.cos(f / 3) * 30} ${150 + Math.sin(f / 3) * 50} -40 L ${120 + Math.sin(f / 3) * 40} -20 Q 80 -80 52 -110 Z`}
                    fill={CB.official} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
                  <path d="M 58 -158 L 58 -40 L 30 -40 L 30 -158 Z" fill={CB.official} stroke={KRP.ink} strokeWidth={4} />
                </g>} />
              <path d={`M ${ox - 80} ${oy - 200} a 20 10 0 1 1 30 6`} stroke={KRP.ink} strokeWidth={4} fill="none" />
            </g>;
          } else {
            // ④ 枕を抱えたまま大あくび
            const yawn = 0.5 + 0.5 * Math.sin(f / 10);
            fig = <g>
              <MzBbFig x={ox} y={oy + 60} s={0.62} f={f} cloth={CB.official} clothDark={CB.officialDark} hair="cap" face="normal" phase={i}
                arms={[[-40, 70], [40, 70]]}
                over={<g>
                  <MzBbOfficialCap rot={4} />
                  <MzBbSleepyEyes k={0.8} />
                  <rect x={-24} y={-198} width={48} height={22} fill={KRP.white} />
                  <MzBbMouth open={yawn} />
                  <rect x={-74} y={-150} width={148} height={64} rx={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                  <path d="M -50 -130 Q 0 -120 50 -130" stroke="#CFC6B8" strokeWidth={4} fill="none" />
                </g>} />
            </g>;
          }
          return (
            <g key={i}>
              <defs><clipPath id={cid}><rect x={wx} y={WY} width={WW} height={WH} /></clipPath></defs>
              <rect x={wx} y={WY} width={WW} height={WH} fill={mixColor("#2A2638", "#FFD98A", L)} stroke={KRP.ink} strokeWidth={6} />
              {L > 0.05 && <g clipPath={`url(#${cid})`} opacity={L}>
                <rect x={wx} y={WY + WH - 50} width={WW} height={50} fill="#C9A26A" />
                <Flame x={wx + 30} y={WY + WH - 40} s={0.5} f={f} />
                {fig}
              </g>}
              {/* 格子 (左右に開いた窓のわく) */}
              <rect x={wx - 8} y={WY - 8} width={WW + 16} height={WH + 16} fill="none" stroke={CB.shuDark} strokeWidth={10} />
              {L < 0.5 && [1, 2, 3].map((c) => <line key={c} x1={wx + (WW / 4) * c} y1={WY} x2={wx + (WW / 4) * c} y2={WY + WH} stroke={CB.shuDark} strokeWidth={5} />)}
              {L > 0.3 && <circle cx={wx + WW / 2} cy={WY + WH / 2} r={170} fill={MP.glow} opacity={0.12 * L} />}
              {/* 点いた瞬間の「!」 */}
              {L > 0 && L < 1 && <text x={wx + WW / 2} y={WY - 30 - L * 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={MP.bell} stroke={KRP.ink} strokeWidth={3} opacity={1 - L * 0.5}>!</text>}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #45 名前のとおり、鶏の役を、人がやっていました。
// 格: 山 / seed 6045
// 絵: どこ: 夜明け前の宮殿の石段の上 (#44 の続き)。宮殿の塀の上には本物の白い雄鶏が1羽。演出: 鶏人 (赤い頭巾・とさかの赤い冠・長い袖・男性) が、名前のとおり鶏になりきって、長い袖を羽のようにばさばさ広げ、首を前に突き出して大声を出す。塀の上の本物の雄鶏が、それを横目でじーっと見て首をかしげる (鶏のほうが「?」の顔)。そのあと鶏人がこっそり大あくびをして、目の下にうっすらクマ。その頭の上に NazoBell (x=0.7, y=0.22, s=0.9, solved=false) がぽんと出て揺れる (#15 と同じ印: この人は誰に起こされたのか)。腕は2本 (pose="flap" で両腕を広げる)。動き: f0-60 鶏のまね (袖がばさばさ) / f60-90 雄鶏が首をかしげる / f100-120 あくび / f120 NazoBell 登場 / f120-160 カメラが鶏人の顔と NazoBell へ寄る
// どこ: 夜明け前の宮殿の石段の上の台 (#44 の続き)。左に瓦屋根をのせた宮殿の塀、その上に本物の白い雄鶏。右奥に朱の柱と灯籠
// 演出: 鶏人が鶏になりきって、長い袖を翼のようにばさばさ広げ、首を前に突き出して大声。塀の上の本物の雄鶏が横目でじーっと見て首をかしげる
//       (鶏のほうに「?」)。そのあと鶏人はこっそり大あくび、目の下にうっすらクマ。頭の上にナゾベルがぽんと出て揺れる
// 動き: f0-40 鶏のまね (袖が10fごとにばさっ) / f12-26 雄鶏が首をかしげる / f58-80 あくび / f78 ナゾベル / f80-127 カメラが顔とナゾベルへ寄る
const Mz045: React.FC<{ f: number }> = ({ f }) => {
  const act = 1 - seg(f, 50, 58);
  const flap = Math.sin(f / 3.2) * 22 * act;
  const shout = easeOut(seg(f, 2, 8)) * act;
  const tilt = easeOut(seg(f, 12, 22)) * 28;
  const q = easeOut(seg(f, 18, 26));
  const yawn = Math.sin(Math.PI * seg(f, 58, 84));
  const bags = seg(f, 52, 62);
  const bell = seg(f, 78, 88);
  const push = easeInOut(seg(f, 80, 127));
  const cs = lerp(1, 1.22, push);
  const PX = 1180, PY = 790, ks = 0.95;
  const armA = 90 + flap;
  const fwd = 10 * act;
  return (
    <Frame f={f} seed={6045} dark>
      <g transform={`translate(${1260 * (1 - cs)} ${420 * (1 - cs)}) scale(${cs})`}>
        {/* 空 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={MP.nightDeep} />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-60} y={200 + i * 44} width={2040} height={46} fill={mixColor(MP.nightDeep, "#7A7AA8", (i / 7) * 0.65)} />)}
        {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={rnd(47, i) * 1920} cy={rnd(48, i) * 320 + 20} r={rnd(49, i) > 0.7 ? 3.5 : 2} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} />)}
        {/* 右奥: 朱の柱と軒と灯籠 */}
        <rect x={1640} y={120} width={300} height={720} fill="#5B2E2A" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1680} y={120} width={70} height={720} fill={CB.shu} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1560 140 Q 1640 120 1700 70 L 1980 70 L 1980 150 Z" fill={CB.kawara} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${Math.sin(f / 18) * 3} 1610 150)`}>
          <line x1={1610} y1={150} x2={1610} y2={190} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1610} cy={228} r={66} fill={MP.glow} opacity={0.18} />
          <ellipse cx={1610} cy={228} rx={28} ry={38} fill={CB.shu} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1610} cy={228} rx={14} ry={34} fill="#F2855E" opacity={0.7} />
        </g>
        {/* 左: 宮殿の塀 (瓦屋根つき) */}
        <rect x={-60} y={500} width={880} height={360} fill="#B9574A" stroke={KRP.ink} strokeWidth={7} />
        <g stroke="#9A4438" strokeWidth={4} opacity={0.6}>{[560, 640, 720, 800].map((ly) => <line key={ly} x1={-60} y1={ly} x2={820} y2={ly} />)}</g>
        <path d="M -60 500 L 860 500 L 830 450 L -60 450 Z" fill={CB.kawara} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g stroke={CB.kawaraDark} strokeWidth={5}>{Array.from({ length: 27 }, (_, i) => <line key={i} x1={-40 + i * 33} y1={454} x2={-44 + i * 33} y2={498} />)}</g>
        <rect x={-60} y={438} width={900} height={16} rx={6} fill={CB.kawaraDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 石の台 (足もと) */}
        <rect x={-60} y={790} width={2040} height={400} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={MP.stoneDark} strokeWidth={4} opacity={0.6}>
          {[850, 930].map((ly) => <line key={ly} x1={-60} y1={ly} x2={1980} y2={ly} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180 + (i % 2) * 60} y1={790} x2={i * 180 + (i % 2) * 60} y2={850} />)}
        </g>
        {/* 塀の上の本物の雄鶏 (右向き、横目でじーっ) */}
        <MzBbRooster x={520} y={448} s={0.95} f={f} dir={1} tilt={tilt} head={-6} eye="side" />
        {q > 0 && <QMark x={650} y={190} s={0.8} f={f} t={q} />}
        {/* 鶏人: 袖を翼のように広げ、首を前に突き出して大声 → あくび */}
        <MzBbFig x={PX} y={PY} s={ks} f={f} cloth={CB.robe} clothDark={CB.robeDark} hair="none" phase={3} lean={-fwd}
          face="normal" arms={[[armA, 80], [-armA, 80]]} sleeveW={30} hand
          behind={<g>
            {/* 翼に見立てた長い袖 (羽のぎざぎざ) */}
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`rotate(${sd === -1 ? armA - 90 : 90 - armA} ${sd * 67} -148)`}>
                <path d={`M ${sd * 60} -160 L ${sd * 230} -170 Q ${sd * 252} -130 ${sd * 222} -104 Q ${sd * 214} -80 ${sd * 192} -88 Q ${sd * 180} -66 ${sd * 160} -78 Q ${sd * 146} -56 ${sd * 126} -70 Q ${sd * 110} -50 ${sd * 92} -66 Q ${sd * 70} -60 ${sd * 64} -90 Q ${sd * 56} -120 ${sd * 60} -160 Z`}
                  fill={CB.robe} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
                <path d={`M ${sd * 90} -130 L ${sd * 210} -138 M ${sd * 100} -110 L ${sd * 190} -116`} stroke={CB.robeDark} strokeWidth={4} />
              </g>
            ))}
          </g>}
          over={<g>
            <MzBbRobe />
            <MzBbKeijinHat f={f} />
            {act > 0.5 ? (
              <g>
                <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round"><line x1={-38} y1={-258} x2={-12} y2={-250} /><line x1={12} y1={-250} x2={38} y2={-258} /></g>
                <rect x={-24} y={-198} width={48} height={24} fill={KRP.white} />
                <MzBbMouth open={shout * (0.75 + 0.25 * Math.sin(f / 2.5))} w={1.2} />
              </g>
            ) : (
              <g>
                <MzBbSleepyEyes k={0.55 + 0.4 * yawn} />
                <rect x={-24} y={-198} width={48} height={24} fill={KRP.white} />
                <MzBbMouth open={yawn} w={1.2} />
                {yawn > 0.4 && <path d="M -46 -214 q -6 10 0 16 q 6 -6 0 -16 Z" fill="#7FA8C9" />}
              </g>
            )}
            {/* 目の下のクマ */}
            <g stroke="#8E7FA6" strokeWidth={4} fill="none" strokeLinecap="round" opacity={bags}>
              <path d="M -36 -200 Q -24 -192 -12 -200" /><path d="M 12 -200 Q 24 -192 36 -200" />
            </g>
          </g>} />
        {/* コケーッの声の線 (塀の鶏のほうへ) */}
        <MzBbShout x={PX - 60} y={PY - 186 * ks} f={f} amt={shout} dir={200} spread={26} n={4} r0={50} step={90} w={12} />
        {/* ばさっの線 */}
        {act > 0.3 && Math.abs(flap) > 14 && [-1, 1].map((sd) => (
          <g key={sd} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
            <line x1={PX + sd * 260} y1={PY - 300} x2={PX + sd * 290} y2={PY - 320} />
            <line x1={PX + sd * 270} y1={PY - 250} x2={PX + sd * 306} y2={PY - 254} />
          </g>
        ))}
        {/* 抜けた羽ならぬ糸くず (ふわふわ落ちる) */}
        {[0, 1, 2].map((i) => {
          const t = ((f / 60 + i / 3) % 1);
          return <ellipse key={i} cx={PX - 200 + i * 180 + Math.sin(f / 8 + i) * 20} cy={PY - 360 + t * 300} rx={12} ry={5} fill={CB.robe} stroke={KRP.ink} strokeWidth={2}
            opacity={act * Math.sin(t * Math.PI)} transform={`rotate(${Math.sin(f / 6 + i) * 30} ${PX - 200 + i * 180} ${PY - 360 + t * 300})`} />;
        })}
        {/* ナゾベル (この人は誰に起こされたのか) */}
        {bell > 0 && <NazoBell x={1344} y={238} s={0.9 * pop(bell)} f={f} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #46 ちなみに本物の鶏は、日の出に鳴くのではありません。
// 格: 山 / seed 6046
// 絵: どこ: 鶏小屋 (木の板の小屋・金網・わらの床・止まり木・外の木の柵)。まだ夜明け前、空は紺で星が残り、地平線の下に太陽 (点線の丸で位置だけ)。演出: 白い雄鶏 (赤いとさか・黄色いくちばし) が柵の上にのぼり、まだ真っ暗なうちに胸を張って「コケコッコー」と鳴く (音の線)。札は「日の出前」。そのあと時間が早回しで進み、地平線から太陽がやっと顔を出したとき (f110)、雄鶏はもう鳴き終わって、柵の上で羽づくろいをしている (日の出の瞬間に鳴いている絵には絶対にしない)。太陽が「え、もう?」という顔で出てくる (太陽に小さな目と汗)。動き: f0-20 カメラが暗い小屋から柵へ / f20-70 鳴く / f70-110 空が白む早回し / f110-150 日の出・雄鶏は羽づくろい・太陽の汗
// どこ: 夜明け前の鶏小屋 (板張りの小屋・金網の窓の中でめんどりが寝ている・戸口のわら・止まり木) と、外の木の柵。
//       空は紺で星が残り、地平線の下に太陽 (点線の丸で位置だけ)
// 演出: 白い雄鶏が柵の柱にのぼり、真っ暗なうちに胸を張って鳴く (音の線)。札は「日の出前」。そのあと早回しで空が白み、
//       太陽がやっと顔を出したとき、雄鶏はもう鳴き終わって羽づくろい中。太陽は「え、もう?」の顔 (丸い目と汗)
// 動き: f0-20 カメラが小屋から柵へ / f16-66 鳴く (くちばし・のどがふくらむ) / f70-110 空が白む早回し / f100-127 日の出・羽づくろい・太陽の汗
const Mz046: React.FC<{ f: number }> = ({ f }) => {
  const camX = lerp(-260, 0, easeInOut(seg(f, 0, 20)));
  const crow = f < 70 ? easeOut(seg(f, 16, 22)) * (1 - seg(f, 64, 70)) : 0;
  const beat = 0.6 + 0.4 * Math.sin(f / 2.5);
  const sky = 0.15 + 1.05 * easeInOut(seg(f, 70, 110));
  const [st, sb] = skyColors(sky);
  const sunUp = easeOut(seg(f, 98, 118));
  const sunY = lerp(790, 610, sunUp);
  const preen = seg(f, 72, 80);
  const lapse = f >= 70 && f < 110;
  const RX = 1180, RY = 600, rs = 1.3;
  return (
    <Frame f={f} seed={6046} dark={sky < 0.8}>
      <g transform={`translate(${camX} 0)`}>
        {/* 空 */}
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-400} y={-60 + i * 66} width={2500} height={68} fill={mixColor(st, sb, Math.pow(i / 11, 1.3))} />)}
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-300 + rnd(50, i) * 2300} cy={rnd(51, i) * 480 + 20} r={rnd(52, i) > 0.7 ? 3.5 : 2}
          fill="#FFF6D8" opacity={clamp01(1 - sky * 1.1) * (0.5 + 0.5 * Math.sin(f / 6 + i))} />)}
        {/* 太陽 (地平線の下は点線の丸) */}
        {sunUp <= 0.01 ? (
          <circle cx={1640} cy={790} r={70} fill="none" stroke="#F2B13C" strokeWidth={6} strokeDasharray="14 12" opacity={0.9} />
        ) : (
          <g>
            <circle cx={1640} cy={sunY} r={110} fill={MP.glow} opacity={0.3} />
            <circle cx={1640} cy={sunY} r={70} fill="#FFB25A" stroke={KRP.ink} strokeWidth={5} />
            {/* 「え、もう?」の顔: 丸い目と汗 */}
            <circle cx={1616} cy={sunY - 14} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={1664} cy={sunY - 14} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={1614} cy={sunY - 14} r={4} fill={KRP.ink} /><circle cx={1662} cy={sunY - 14} r={4} fill={KRP.ink} />
            <ellipse cx={1640} cy={sunY + 14} rx={7} ry={9} fill={KRP.ink} />
            <path d={`M 1712 ${sunY - 44 + (f % 14)} q 10 16 0 22 q -10 -6 0 -22 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={2.5} opacity={sunUp} />
            <path d={`M 1590 ${sunY - 50 + ((f + 7) % 14)} q 8 13 0 18 q -8 -5 0 -18 Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={2.5} opacity={sunUp} />
          </g>
        )}
        {/* 地平線の丘 */}
        <path d="M -400 720 Q 200 660 700 700 Q 1200 740 1700 690 Q 2000 670 2100 690 L 2100 1140 L -400 1140 Z" fill={mixColor("#2C3A3A", "#6E8C62", sky / 1.2)} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-400} y={790} width={2500} height={400} fill={mixColor("#3A3428", "#8E7A52", sky / 1.2)} />
        <g stroke={mixColor("#2A251C", "#6E5C3A", sky / 1.2)} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${-380 + i * 160} ${880 + (i % 3) * 40} q 20 -16 40 0`} fill="none" />)}
        </g>
        {/* 鶏小屋 */}
        <g>
          <rect x={60} y={380} width={580} height={450} fill={mixColor("#5B4130", MP.wood, sky / 1.2)} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={mixColor("#3E2C20", MP.woodDark, sky / 1.2)} strokeWidth={4}>{Array.from({ length: 8 }, (_, i) => <line key={i} x1={60 + i * 72} y1={380} x2={60 + i * 72} y2={830} />)}</g>
          <path d="M 20 400 L 350 250 L 680 400 Z" fill={mixColor("#3E2C20", MP.woodDark, sky / 1.2)} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          {/* 金網の窓 (中でめんどりが寝ている) */}
          <rect x={110} y={450} width={240} height={170} fill="#1E1A20" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${170 + i * 110} ${600 + Math.sin(f / 20 + i) * 2})`}>
              <ellipse cx={0} cy={-30} rx={44} ry={30} fill={CB.henShade} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={30} cy={-62} r={20} fill={CB.henShade} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 22 -80 q 6 -14 14 -4 q 6 -10 10 4 Z" fill={CB.crest} stroke={KRP.ink} strokeWidth={3} />
              <path d="M 26 -64 q 6 4 10 0" stroke={KRP.ink} strokeWidth={3} fill="none" />
              <text x={50} y={-96 - ((f / 2 + i * 20) % 30)} fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.white} opacity={0.8 * (1 - sky)}>z</text>
            </g>
          ))}
          <g stroke="#B9C0C8" strokeWidth={2.5} opacity={0.8}>
            {Array.from({ length: 10 }, (_, i) => <line key={i} x1={110 + i * 26} y1={450} x2={110 + i * 26 + 40} y2={620} />)}
            {Array.from({ length: 10 }, (_, i) => <line key={i} x1={150 + i * 26} y1={450} x2={110 + i * 26} y2={620} />)}
          </g>
          {/* 戸口 (わらと止まり木) */}
          <rect x={420} y={520} width={170} height={310} fill="#241C18" stroke={KRP.ink} strokeWidth={6} />
          <line x1={420} y1={640} x2={590} y2={640} stroke={MP.woodDark} strokeWidth={10} />
          <path d="M 420 830 Q 470 780 520 800 Q 560 776 590 830 Z" fill={CB.straw} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={CB.strawDark} strokeWidth={3}>{[440, 470, 500, 540, 570].map((x) => <line key={x} x1={x} y1={830} x2={x + 14} y2={806} />)}</g>
        </g>
        {/* 木の柵 */}
        <g>
          {[780, 1000, 1180, 1400, 1520, 1840].map((px) => (
            <g key={px}>
              <rect x={px - 18} y={px === RX ? 600 : 640} width={36} height={px === RX ? 240 : 200} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${px - 18} ${px === RX ? 600 : 640} l 18 -20 l 18 20`} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            </g>
          ))}
          <rect x={700} y={680} width={1280} height={24} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <rect x={700} y={760} width={1280} height={24} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 雄鶏 (柵の柱の上) */}
        <MzBbRooster x={RX} y={RY - 4} s={rs} f={f} dir={1} head={crow > 0 ? -12 * crow : 48 * preen} mouth={crow * beat} puff={crow * beat}
          eye={preen > 0.5 ? "closed" : "normal"} preen={preen * (0.6 + 0.4 * Math.sin(f / 4))} />
        {/* 鳴き声の線 */}
        <MzBbShout x={RX + 150 * rs * 0.82} y={RY - 210 * rs} f={f} amt={crow} dir={-20} spread={34} n={5} r0={40} step={70} w={12} color="#FFF3C8" />
        {/* 札: 日の出前 */}
        <TagPlate x={1500} y={430} text="日の出前" size={40} t={seg(f, 22, 32) * (1 - seg(f, 96, 104))} />
        {/* 早回しの記号 (時計の針がぐるぐる) */}
        {lapse && (
          <g transform="translate(1720 160)">
            <circle r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 40})`} />
            <line x1={0} y1={0} x2={22} y2={0} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 4})`} />
            <path d="M 60 -10 l 16 10 l -16 10 Z M 80 -10 l 16 10 l -16 10 Z" fill={KRP.ink} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #47 体の中の時計で、夜明けの前に鳴きます。
// 格: 図 / seed 6047
// 絵: どこ: 鶏小屋の中 (窓に布がかけられて真っ暗、小さなランタンが1つ)。白い雄鶏の体を、やさしい線の断面図のように透かして見せる (羽の輪郭は残す)。演出: 雄鶏の頭の中に、小さな丸い時計 (鶏用の豆時計。TainaiDokei とは別の物。24時間の文字盤・針1本・小さなハンマー) がある。窓は布でふさがれ、外の光は1つも入っていないのに、豆時計の針が「夜明け前」の印に届いた瞬間、小さなハンマーがカチンと鳴り、雄鶏ののどがぷくっとふくらんで「コケコッコー」。窓の布の端から外をのぞくと、外はまだ真っ暗。札は「体の中の時計」ではなく、豆時計の横に小さな時計マークだけ。動き: f0-40 カメラが雄鶏の頭へ寄る (scale 1→2) / f40-90 針が進む / f90 カチン / f95-140 のどがふくらみ鳴く / f140-160 窓の布の端から外の暗闇
// どこ: 夜の鶏小屋の中 (板の壁・わらの床・止まり木で寝るめんどり・小さなランタン1つ)。左の窓は布でふさがれ、光は入らない
// 演出: 白い雄鶏を、やさしい線の断面図のように透かして見せる。頭の中に小さな丸い豆時計 (24時間の文字盤・針1本・小さなハンマー)。
//       針が「夜明け前」の橙の印に届いた瞬間、ハンマーがカチン。のどの管がぷくっとふくらみ鳴く。あとで窓の布の端がめくれ、外はまだ真っ暗
// 動き: f0-16 カメラが雄鶏の頭へ寄る / f10-30 針が進む / f30 カチン / f32-62 のどがふくらみ鳴く / f66-100 カメラが窓へ・布の端がめくれる
const Mz047: React.FC<{ f: number }> = ({ f }) => {
  const zin = easeInOut(seg(f, 0, 16));
  const toWin = easeInOut(seg(f, 66, 92));
  const RX = 900, RY = 880, rs = 2.2;
  const head: [number, number] = [RX + 70 * rs, RY - 212 * rs];
  const cs = lerp(lerp(1, 1.55, zin), 1.35, toWin);
  const fx = lerp(lerp(960, head[0] - 60, zin), 420, toWin), fy = lerp(lerp(540, head[1] + 40, zin), 380, toWin);
  const handT = easeInOut(seg(f, 10, 30));
  const handDeg = lerp(30, 75, handT); // 24時間の文字盤: 2時→5時 (夜明け前の印)
  const hit = f >= 30 && f < 40 ? 1 - seg(f, 30, 40) : 0;
  const ham = f < 30 ? -10 : 18 * (1 - seg(f, 30, 36)) + (f >= 36 ? Math.sin(f / 2) * 4 * (1 - seg(f, 36, 60)) : 0);
  const crow = easeOut(seg(f, 32, 38)) * (1 - seg(f, 60, 66));
  const beat = 0.6 + 0.4 * Math.sin(f / 2.5);
  const lift = easeOut(seg(f, 78, 92));
  const CL: [number, number] = [head[0] - 4, head[1] + 2]; // 豆時計の中心
  const cr = 20;
  return (
    <Frame f={f} seed={6047} dark>
      <g transform={`translate(${960 - fx * cs} ${540 - fy * cs}) scale(${cs})`}>
        {/* 板の壁 */}
        <rect x={-100} y={-100} width={2120} height={1000} fill="#4A3628" />
        <g stroke="#33251B" strokeWidth={6}>{Array.from({ length: 20 }, (_, i) => <line key={i} x1={-100 + i * 110} y1={-100} x2={-100 + i * 110} y2={900} />)}</g>
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-40 + i * 180} cy={120 + (i % 3) * 230} r={5} fill="#2A1E16" />)}
        {/* わらの床 */}
        <rect x={-100} y={830} width={2120} height={400} fill={CB.strawDark} />
        <g stroke={CB.straw} strokeWidth={4} strokeLinecap="round">
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-80 + i * 52} y1={850 + (i % 4) * 40} x2={-60 + i * 52 + (i % 2 ? 20 : -16)} y2={834 + (i % 4) * 40} />)}
        </g>
        {/* 布でふさいだ窓 (左上) */}
        <g>
          <rect x={250} y={200} width={340} height={260} fill="#0E1022" stroke={KRP.ink} strokeWidth={7} />
          {/* めくれた端の向こう: 外はまだ真っ暗 (星が2つだけ) */}
          <circle cx={540} cy={250} r={2.5} fill="#FFF6D8" opacity={0.7} /><circle cx={500} cy={300} r={2} fill="#FFF6D8" opacity={0.6} />
          <path d={`M 236 186 L 604 186 L 604 ${474 - lift * 180} Q ${604 - lift * 60} ${474 - lift * 100} ${604 - lift * 160} 474 L 236 474 Z`}
            fill="#8C6E8A" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {lift > 0.05 && <path d={`M 604 ${474 - lift * 180} Q ${604 - lift * 30} ${474 - lift * 60} ${604 - lift * 160} 474 Z`} fill="#6E5470" stroke={KRP.ink} strokeWidth={4} />}
          <g stroke="#6E5470" strokeWidth={5}>{[300, 370, 440, 510].map((lx) => <path key={lx} d={`M ${lx} 192 Q ${lx + 10} 330 ${lx - 4} 468`} fill="none" />)}</g>
          {[250, 420, 590].map((nx) => <circle key={nx} cx={nx} cy={196} r={8} fill={CB.metal} stroke={KRP.ink} strokeWidth={3} />)}
          {lift > 0.4 && <TagPlate x={420} y={540} text="外" size={36} t={seg(f, 86, 94)} />}
        </g>
        {/* 止まり木で寝るめんどり (奥) */}
        <rect x={1350} y={430} width={560} height={18} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {[1440, 1600, 1760].map((hx, i) => (
          <g key={hx} transform={`translate(${hx} ${432 + Math.sin(f / 18 + i) * 2})`}>
            <ellipse cx={0} cy={-34} rx={52} ry={36} fill={CB.henShade} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={34} cy={-70} r={22} fill={CB.henShade} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 26 -90 q 6 -14 14 -4 q 6 -10 10 4 Z" fill={CB.crest} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 30 -72 q 6 4 10 0" stroke={KRP.ink} strokeWidth={3} fill="none" />
          </g>
        ))}
        {/* ランタン (小さな明かり1つ) */}
        <g transform={`rotate(${Math.sin(f / 22) * 3} 1300 80)`}>
          <line x1={1300} y1={-100} x2={1300} y2={110} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1300} cy={160} r={130} fill={MP.glow} opacity={0.16 + 0.02 * Math.sin(f / 5)} />
          <rect x={1272} y={110} width={56} height={84} rx={8} fill="#F7D68A" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1268 112 L 1332 112 L 1316 94 L 1284 94 Z" fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <Flame x={1300} y={180} s={0.7} f={f} />
        </g>
        {/* 雄鶏 (透かし) */}
        <g opacity={0.92}>
          <MzBbRooster x={RX} y={RY} s={rs} f={f} dir={1} head={0} mouth={crow * beat} />
        </g>
        {/* 断面図の線: 体の中 (点線の内側の輪郭・のどの管・胸) */}
        <g fill="none" stroke="#C9B9A6" strokeWidth={5} strokeDasharray="12 10">
          <path d={`M ${RX - 130} ${RY - 250} Q ${RX - 10} ${RY - 330} ${RX + 120} ${RY - 270}`} />
          <path d={`M ${RX - 140} ${RY - 160} Q ${RX} ${RY - 120} ${RX + 140} ${RY - 200}`} />
        </g>
        {/* のどの管 (鳴くとふくらむ) */}
        <path d={`M ${head[0] + 20} ${head[1] + 40} Q ${head[0] + 40} ${head[1] + 160} ${RX + 90} ${RY - 300}`} stroke="#E9A79E" strokeWidth={16 + 26 * crow * beat} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={`M ${head[0] + 20} ${head[1] + 40} Q ${head[0] + 40} ${head[1] + 160} ${RX + 90} ${RY - 300}`} stroke={KRP.ink} strokeWidth={3} fill="none" strokeDasharray="8 8" />
        {/* 頭の中の脳 (うす桃) と豆時計 */}
        <circle cx={CL[0]} cy={CL[1]} r={cr + 14} fill={CB.brain} stroke={CB.brainDark} strokeWidth={3} />
        <g transform={`translate(${CL[0]} ${CL[1]})`}>
          <circle r={cr + 4} fill={MP.brass} stroke={KRP.ink} strokeWidth={3.5} />
          <circle r={cr} fill="#FBF3E2" stroke={KRP.ink} strokeWidth={2.5} />
          <path d={`M 0 0 L ${-cr * 0.97} 0 A ${cr * 0.97} ${cr * 0.97} 0 0 1 ${cr * 0.97} 0 Z`} transform="rotate(180)" fill={MP.night} opacity={0.15} />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * cr * 0.78} y1={-Math.cos(a) * cr * 0.78} x2={Math.sin(a) * cr * 0.92} y2={-Math.cos(a) * cr * 0.92} stroke={KRP.ink} strokeWidth={i % 6 === 0 ? 2 : 1} />;
          })}
          {/* 夜明け前の印 (橙の三角) */}
          <path d={`M ${Math.sin(75 * Math.PI / 180) * cr * 0.95} ${-Math.cos(75 * Math.PI / 180) * cr * 0.95} l 5 -3 l 0 6 Z`} fill={MP.dawn} stroke={KRP.ink} strokeWidth={1.2}
            transform={`rotate(-75 ${Math.sin(75 * Math.PI / 180) * cr * 0.95} ${-Math.cos(75 * Math.PI / 180) * cr * 0.95})`} />
          <circle cx={Math.sin(75 * Math.PI / 180) * cr * 1.12} cy={-Math.cos(75 * Math.PI / 180) * cr * 1.12} r={3.5} fill={MP.dawn} stroke={KRP.ink} strokeWidth={1.2} />
          {/* 針 1本 */}
          <g transform={`rotate(${handDeg})`}>
            <path d={`M -1.8 3 L 0 ${-cr * 0.86} L 1.8 3 Z`} fill={handT >= 1 ? MP.bell : KRP.ink} />
          </g>
          <circle r={2.5} fill={MP.brass} stroke={KRP.ink} strokeWidth={1} />
          {/* 小さなベルとハンマー (上) */}
          <path d={`M -8 ${-cr - 4} Q -8 ${-cr - 14} 0 ${-cr - 15} Q 8 ${-cr - 14} 8 ${-cr - 4} Z`} fill={MP.brass} stroke={KRP.ink} strokeWidth={1.5} />
          <g transform={`rotate(${ham} 12 ${-cr - 2})`}>
            <line x1={12} y1={-cr - 2} x2={6} y2={-cr - 14} stroke={KRP.ink} strokeWidth={1.8} />
            <circle cx={6} cy={-cr - 15} r={2.6} fill={MP.bell} stroke={KRP.ink} strokeWidth={1} />
          </g>
          {/* 時計マーク (札の代わり) */}
          <g transform={`translate(${cr + 14} ${-cr + 2})`}>
            <circle r={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={1.5} />
            <path d="M 0 -4 L 0 0 L 3 2" stroke={KRP.ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
          {/* カチン */}
          {hit > 0 && <g opacity={hit}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (-150 + i * 24) * Math.PI / 180, r0 = 8 + (1 - hit) * 6;
              return <line key={i} x1={4 + Math.cos(a) * r0} y1={-cr - 12 + Math.sin(a) * r0} x2={4 + Math.cos(a) * (r0 + 8)} y2={-cr - 12 + Math.sin(a) * (r0 + 8)} stroke={KRP.yellow} strokeWidth={2.5} strokeLinecap="round" />;
            })}
          </g>}
        </g>
        {/* 鳴き声 */}
        <MzBbShout x={RX + 120 * rs} y={RY - 204 * rs} f={f} amt={crow} dir={-10} spread={34} n={5} r0={40} step={80} w={14} color="#FFF3C8" />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_036: (f) => <Mz036 f={f} />,
  mz_037: (f) => <Mz037 f={f} />,
  mz_038: (f) => <Mz038 f={f} />,
  mz_039: (f) => <Mz039 f={f} />,
  mz_040: (f) => <Mz040 f={f} />,
  mz_041: (f) => <Mz041 f={f} />,
  mz_042: (f) => <Mz042 f={f} />,
  mz_043: (f) => <Mz043 f={f} />,
  mz_044: (f) => <Mz044 f={f} />,
  mz_045: (f) => <Mz045 f={f} />,
  mz_046: (f) => <Mz046 f={f} />,
  mz_047: (f) => <Mz047 f={f} />,
};

export const MZ_BB_MOTIFS: string[] = [
  "mz_036", // #36
  "mz_037", // #37
  "mz_038", // #38
  "mz_039", // #39
  "mz_040", // #40
  "mz_041", // #41
  "mz_042", // #42
  "mz_043", // #43
  "mz_044", // #44
  "mz_045", // #45
  "mz_046", // #46
  "mz_047", // #47
];

export const mezaBbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
