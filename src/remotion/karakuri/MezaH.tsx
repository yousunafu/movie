// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#169〜#180 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, mixColor,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 1940〜50年代のアメリカの家
  paperWall: "#EFD9C4", // 花柄の壁紙の地
  paperWallDark: "#DDBFA4",
  flowerPink: "#E39AA6",
  flowerLeaf: "#8DB38A",
  floorWood: "#B98A5C",
  floorWoodDark: "#8C6440",
  rug: "#5E7FA8",
  rugDark: "#46648A",
  sunBeam: "#FFF1C4",
  houseWhite: "#F1EBDD",
  houseBlue: "#9DB9CF",
  houseYellow: "#EBCF86",
  houseGreen: "#A9C59B",
  housePink: "#E2B2A8",
  roofRed: "#A9524A",
  roofGray: "#6E7178",
  grass: "#9CC27E",
  grassDark: "#76A05B",
  // 人の服
  dadNavy: "#34497A",
  dadNavyDark: "#24345A",
  momRed: "#C9424E",
  momRedDark: "#982F3A",
  hairBrown: "#8A5A35",
  suitGray: "#7C8089",
  suitGrayDark: "#5C6068",
  coatBlack: "#2E2E36",
  coatBlackDark: "#1E1E25",
  workKhaki: "#8E8A6C",
  workKhakiDark: "#6C694F",
  workBlue: "#5D7FA6",
  workBlueDark: "#44628A",
  denim: "#4E6488",
  // 工場
  steel: "#5D6670",
  steelLight: "#86909A",
  belt: "#3E3B3A",
  beltLight: "#5A5654",
  board: "#2F4A3E", // 黒板
  boardFrame: "#8C6A44",
  crate: "#C79B62",
  crateDark: "#94703F",
  olive: "#6F7A45",
  oliveDark: "#525B31",
  warMetal: "#7B7A72", // 戦争用の時計のくすんだ外枠
  // 机・書類
  deskMat: "#4F7A5E",
  deskMatDark: "#3C604A",
  patent: "#F3E7C7",
  patentLine: "#3D6FA6",
  seal: "#B8352B",
  // 店
  glassTint: "#CFE3EA",
  goldTrim: "#C9A447",
  velvet: "#7C2E3A",
  tileBlack: "#3A3638",
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

// Person と同じ体ゆれ (髪や帽子を頭にくっつけるため)
const mzhBob = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// 人の上に重ねる「頭・服の付け足し」。Person と同じ座標系 (足元 x,y / s) で描く。
// layer="back" は Person より先に (後ろ髪)、"front" は Person の後に描く。
type MzHWear = {
  x: number; y: number; s?: number; f?: number; phase?: number; lean?: number; still?: boolean;
};
const mzhG = ({ x, y, s = 1, f = 0, phase = 0, lean = 0, still = false }: MzHWear) =>
  `translate(${x} ${y + (still ? 0 : mzhBob(f, phase))}) scale(${s}) rotate(${lean})`;

// 女性の長い髪 (後ろ: 肩まで左右に垂らす)
const MzHHairBack: React.FC<MzHWear & { color?: string; curl?: boolean }> = ({ color = "#8A5A35", curl, ...w }) => (
  <g transform={mzhG(w)}>
    {curl ? (
      <path d="M -70 -250 Q -92 -200 -82 -160 Q -98 -150 -86 -132 Q -70 -126 -60 -142 L 60 -142 Q 70 -126 86 -132 Q 98 -150 82 -160 Q 92 -200 70 -250 Z"
        fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    ) : (
      <path d="M -68 -252 Q -86 -190 -80 -132 L -50 -136 L 50 -136 L 80 -132 Q 86 -190 68 -252 Z"
        fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    )}
  </g>
);
// 女性の前髪 (前。頭の上半分を覆う)
const MzHHairFront: React.FC<MzHWear & { color?: string; curl?: boolean }> = ({ color = "#8A5A35", curl, ...w }) => (
  <g transform={mzhG(w)}>
    <path d="M -64 -232 Q -66 -296 0 -297 Q 66 -296 64 -232 Q 44 -262 12 -258 Q -20 -270 -64 -232 Z"
      fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    {curl && (
      <g fill={color} stroke={KRP.ink} strokeWidth={4}>
        <circle cx={-62} cy={-228} r={14} />
        <circle cx={62} cy={-228} r={14} />
      </g>
    )}
  </g>
);
// 後ろで結んだ髪の房 (横顔の後ろに出る。scarf と組み合わせる)
const MzHPonytail: React.FC<MzHWear & { color?: string; side?: 1 | -1 }> = ({ color = "#8A5A35", side = 1, ...w }) => (
  <g transform={mzhG(w)}>
    <path d={`M ${side * 52} -262 Q ${side * 104} -250 ${side * 98} -196 Q ${side * 94} -160 ${side * 74} -150 Q ${side * 82} -196 ${side * 50} -232 Z`}
      fill={color} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);
// スカート (腰から膝下まで広がる台形)。long でくるぶしまで
const MzHSkirt: React.FC<MzHWear & { color: string; dots?: boolean; long?: boolean }> = ({ color, dots, long, ...w }) => {
  const b = long ? -2 : -18;
  return (
    <g transform={mzhG(w)}>
      <path d={`M -54 -70 L 54 -70 L 82 ${b} Q 0 ${b + 10} -82 ${b} Z`} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      {dots && (
        <g fill={KRP.white} opacity={0.85}>
          {[[-40, -50], [0, -56], [38, -48], [-58, -26], [-18, -30], [22, -28], [60, -24]].map(([dx, dy], i) => (
            <circle key={i} cx={dx} cy={dy} r={5.5} />
          ))}
        </g>
      )}
    </g>
  );
};
// 胴体の水玉 (Person の胴の上に重ねる)
const MzHDots: React.FC<MzHWear> = (w) => (
  <g transform={mzhG(w)} fill={KRP.white} opacity={0.85}>
    {[[-36, -140], [0, -128], [34, -144], [-28, -96], [10, -84], [40, -102], [-44, -66]].map(([dx, dy], i) => (
      <circle key={i} cx={dx} cy={dy} r={6} />
    ))}
  </g>
);
// 頭のスカーフ (工場の女性。結び目つき)
const MzHScarf: React.FC<MzHWear & { color?: string }> = ({ color = "#C6455A", ...w }) => (
  <g transform={mzhG(w)}>
    <path d="M -68 -236 Q -70 -304 0 -305 Q 70 -304 68 -236 Q 36 -256 0 -254 Q -36 -256 -68 -236 Z"
      fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <g fill={KRP.white} opacity={0.7}>
      {[[-34, -276], [6, -288], [40, -270], [-8, -264]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={5} />)}
    </g>
    <path d="M -6 -302 Q -26 -328 -2 -330 Q 12 -320 4 -302 Q 26 -326 36 -312 Q 30 -298 6 -300 Z"
      fill={color} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
// ハンチング帽 (工場の男性)
const MzHHunting: React.FC<MzHWear & { color?: string }> = ({ color = "#6B6255", ...w }) => (
  <g transform={mzhG(w)}>
    <path d="M -66 -250 Q -60 -300 4 -302 Q 62 -298 68 -252 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M 20 -256 Q 72 -262 96 -244 Q 70 -238 30 -244 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <line x1={-40} y1={-292} x2={40} y2={-292} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
  </g>
);
// 中折れ帽 (役人・客の男性)
const MzHFedora: React.FC<MzHWear & { color?: string; band?: string }> = ({ color = "#3A3A40", band = "#7A2E2E", ...w }) => (
  <g transform={mzhG(w)}>
    <ellipse cx={0} cy={-262} rx={100} ry={16} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -62 -264 Q -64 -330 -20 -334 Q 0 -322 20 -334 Q 64 -330 62 -264 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={-62} y={-284} width={124} height={16} fill={band} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
// ネクタイ・蝶ネクタイ・ベスト・前ボタン (胴の上に重ねる)
const MzHTie: React.FC<MzHWear & { color?: string; bow?: boolean; vest?: string; shirt?: string }> = ({ color = "#B33A3A", bow, vest, shirt = KRP.white, ...w }) => (
  <g transform={mzhG(w)}>
    {vest && <path d="M -58 -150 L -16 -150 L 0 -100 L 16 -150 L 58 -150 L 58 -64 L -58 -64 Z" fill={vest} stroke={KRP.ink} strokeWidth={4} />}
    <path d="M -20 -160 L 0 -126 L 20 -160 Z" fill={shirt} stroke={KRP.ink} strokeWidth={3.5} />
    {bow ? (
      <path d="M 0 -150 L -24 -162 L -24 -138 Z M 0 -150 L 24 -162 L 24 -138 Z" fill={color} stroke={KRP.ink} strokeWidth={3.5} />
    ) : (
      <path d="M -7 -152 L 7 -152 L 12 -96 L 0 -84 L -12 -96 Z" fill={color} stroke={KRP.ink} strokeWidth={3.5} />
    )}
    {vest && [-118, -100, -82].map((by) => <circle key={by} cx={0} cy={by} r={3.5} fill={KRP.ink} />)}
  </g>
);
// 腕1本 (Person の腕を pose="hold" などで隠した上で、肩から自分で描く)。肩 (±67,-148) を中心に rot 度
const MzHArm: React.FC<MzHWear & { side: 1 | -1; rot: number; len?: number; cloth: string; hand?: boolean }> = ({ side, rot, len = 84, cloth, hand = true, ...w }) => (
  <g transform={mzhG(w)}>
    <g transform={`rotate(${rot} ${side * 67} -148)`}>
      <rect x={side * 67 - 11} y={-148} width={22} height={len} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      {hand && <circle cx={side * 67} cy={-148 + len} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
    </g>
  </g>
);
// 肩から rot 度に伸ばした腕の先 (手) の位置 (Person 座標→画面座標)
const mzhHand = (x: number, y: number, s: number, side: 1 | -1, rot: number, len = 84): [number, number] => {
  const r = (rot * Math.PI) / 180;
  return [x + s * (side * 67 - Math.sin(r) * len), y + s * (-148 + Math.cos(r) * len)];
};
void mzhHand;

// 音の線 (ジリリ)。x,y を中心に左右へ弧
const MzHRingLines: React.FC<{ x: number; y: number; s?: number; f: number; t?: number; color?: string }> = ({ x, y, s = 1, f, t = 1, color = MP.bell }) => {
  if (t <= 0.01) return null;
  const k = (f % 8) / 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(t)} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
      {[0, 1].map((i) => {
        const r = 60 + i * 34 + k * 14;
        return (
          <g key={i}>
            <path d={`M ${-r} ${-r * 0.5} Q ${-r - 18} 0 ${-r} ${r * 0.5}`} />
            <path d={`M ${r} ${-r * 0.5} Q ${r + 18} 0 ${r} ${r * 0.5}`} />
          </g>
        );
      })}
    </g>
  );
};

// 時計 (共有部品 BellClock を置く入口。x,y = 時計の足元の中心。s=1 で足元から文字盤の中心まで 150)
// dull=true は戦争用 (同じ形で、本体がくすんだ色)
const MzHClock: React.FC<{ x: number; y: number; s?: number; f: number; ring?: number; snooze?: boolean; dull?: boolean; rot?: number; press?: number; time?: number }> = ({ x, y, s = 1, f, ring = 0, snooze, dull, rot = 0, press = 0, time }) => (
  <BellClock x={x} y={y - 150 * s} s={s} f={f} ring={ring} snooze={snooze} snoozePress={press} rot={rot}
    body={dull ? C.warMetal : undefined} time={time} />
);

// 寝ている→起き上がる人 (ベッドの上)。hip=(hx,hy) が腰。up: 0=寝ている (頭が左) 1=上体を起こす
// 掛け布団はシーン側で上に重ねる。
const MzHSleeper: React.FC<{
  hx: number; hy: number; s: number; f: number; up: number; face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  cloth: string; clothDark: string; woman?: "long" | "curl"; dir?: 1 | -1; phase?: number;
  pose?: "stand" | "banzai" | "point" | "raise" | "hold"; dots?: boolean; gaze?: [number, number]; maxAng?: number;
}> = ({ hx, hy, s, f, up, face = "normal", cloth, clothDark, woman, dir = 1, phase = 0, pose, dots, gaze, maxAng = -4 }) => {
  const ang = lerp(-82, maxAng, easeOut(clamp01(up))) * dir;
  // Person の足元 = 腰 + 58s 下。腰を中心に回す
  const px = hx, py = hy + 58 * s;
  const fz = up < 0.2 ? "normal" : face;
  return (
    <g transform={`rotate(${ang} ${hx} ${hy})`}>
      {woman && <MzHHairBack x={px} y={py} s={s} f={f} phase={phase} still curl={woman === "curl"} />}
      <Person x={px} y={py} s={s} f={up < 0.2 ? 0 : f} phase={phase} still face={fz} cloth={cloth} clothDark={clothDark}
        hair={woman ? "none" : "cap"} pose={pose ?? (up > 0.5 ? "banzai" : "stand")} gaze={gaze} />
      {dots && <MzHDots x={px} y={py} s={s} f={f} phase={phase} still />}
      {woman && <MzHHairFront x={px} y={py} s={s} f={f} phase={phase} still curl={woman === "curl"} />}
      {up < 0.2 && (
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform={`translate(${px} ${py}) scale(${s})`}>
          <ellipse cx={-24} cy={-222} rx={17} ry={22} fill={KRP.white} stroke="none" />
          <ellipse cx={24} cy={-222} rx={17} ry={22} fill={KRP.white} stroke="none" />
          <line x1={-34} y1={-220} x2={-14} y2={-220} />
          <line x1={14} y1={-220} x2={34} y2={-220} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #169 第6章、止められる機械と、逃げる機械。
// 格: 山 / seed 6169
// 絵: 章扉。どこ: 1940〜50年代のアメリカの家の寝室の床 (木の床板・花柄の壁紙・ナイトテーブル・窓から朝の光)。演出: 画面の左寄りに、ナイトテーブルの上の BellClock (snooze=true、上に大きなスヌーズボタン) がどっしり座り、その下の床から Clocky (run=0→1, face="smile") が車輪でキュッと飛び出して、BellClock の足元をぐるっと一周して画面の左下へ走り去る。BellClock は動かずに見送る (止められる機械と逃げる機械の対比)。章扉の題字 ChapterDoor num=6 title="止められる機械と、逃げる機械。" を画面の右寄りに置く。主役の2つの時計は左寄り。動き: f0-30 カメラが床すれすれの低い位置から少し引く / f30-90 Clocky が一周して走り去る (車輪の線・床のほこり) / f60 BellClock のスヌーズボタンが一度だけぽこっと沈んで戻る / 窓の光がゆっくり伸びる
// どこ: 1940〜50年代のアメリカの家の寝室。床すれすれの低いカメラ。花柄の壁紙・幅木・木の床板・左上の窓から朝の光
// 演出: 左寄りのナイトテーブルの上に BellClock (snooze) がどっしり。足元から Clocky が飛び出し、テーブルを一周して左下へ走り去る。
//       BellClock は動かず見送り、f60 でスヌーズボタンを一度だけぽこっ (時計ごと縦に縮む)。右に章扉
// 動き: f0-30 カメラが低い位置から引く / f18-28 Clocky が飛び出す / f28-100 一周→退場 (車輪の線・ほこり) / 光の帯が伸びる
// 花柄の壁紙 (このファイルの寝室で使う)
const MzHWallpaper: React.FC<{ x0?: number; x1?: number; y0?: number; y1?: number; seed: number }> = ({ x0 = -40, x1 = 1960, y0 = -40, y1 = 620, seed }) => {
  const cols = Math.ceil((x1 - x0) / 150), rows = Math.ceil((y1 - y0) / 150);
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={C.paperWall} />
      {Array.from({ length: cols + 1 }, (_, i) => (
        <rect key={i} x={x0 + i * 150 + 70} y={y0} width={10} height={y1 - y0} fill={C.paperWallDark} opacity={0.5} />
      ))}
      {Array.from({ length: (cols + 1) * (rows + 1) }, (_, k) => {
        const i = k % (cols + 1), j = Math.floor(k / (cols + 1));
        const fx = x0 + i * 150 + (j % 2) * 75 + 20, fy = y0 + j * 150 + 40;
        return (
          <g key={k} transform={`translate(${fx} ${fy}) rotate(${rnd(seed, k) * 60})`}>
            <path d="M 0 0 q 10 18 26 22" fill="none" stroke={C.flowerLeaf} strokeWidth={4} />
            <ellipse cx={22} cy={20} rx={9} ry={5} fill={C.flowerLeaf} />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9} r={7} fill={C.flowerPink} />
            ))}
            <circle r={5} fill={KRP.yellow} />
          </g>
        );
      })}
    </g>
  );
};

const Mz169: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 30));
  const sc = lerp(1.14, 1.0, cam);
  const door = seg(f, 4, 20);
  // Clocky の道のり: 飛び出し → ナイトテーブルの周りを反時計回りに一周 → 左下へ退場
  const NX = 540, NY = 772; // ナイトテーブルの足元の中心
  const TH0 = 0.3;
  const out = easeOut(seg(f, 16, 28));
  const loop = easeInOut(seg(f, 46, 84));
  const exit = seg(f, 84, 108);
  let cx = lerp(NX + 40, NX + Math.cos(TH0) * 290, out), cy = lerp(NY - 20, NY + 20 + Math.sin(TH0) * 62, out), behind = false, dirX = 1;
  if (f >= 46 && f < 84) {
    const th = TH0 + loop * Math.PI * 2; // 手前 → 左 → 奥 → 右
    cx = NX + Math.cos(th) * 290;
    cy = NY + 20 + Math.sin(th) * 62;
    behind = Math.sin(th) < -0.15;
    dirX = -Math.sin(th) >= 0 ? 1 : -1;
  } else if (f >= 84) {
    cx = lerp(NX + Math.cos(TH0) * 290, -300, easeInOut(exit));
    cy = lerp(NY + 38, NY + 110, exit);
    dirX = -1;
  }
  const run = f < 16 ? 0 : 1;
  const press = Math.sin(seg(f, 58, 66) * Math.PI); // f60 ごろスヌーズがぽこっ
  const beam = 0.6 + 0.4 * easeOut(seg(f, 0, 110));
  const clocky = (
    <g>
      {/* 床に落ちる影 */}
      <ellipse cx={cx} cy={cy + 4} rx={150} ry={16} fill={KRP.ink} opacity={0.18} />
      <Clocky x={cx} y={cy - 84} s={0.9} f={f} run={run} face="smirk" dir={dirX as 1 | -1} />
    </g>
  );
  return (
    <Frame f={f} seed={6169}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={6} title="止められる機械と、逃げる機械。" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(${200 * (1 - sc)} ${880 * (1 - sc)}) scale(${sc})`}>
        {/* 壁 */}
        <MzHWallpaper seed={6169} y1={640} />
        {/* 窓 (左上。外は朝の空と隣の家の屋根) */}
        <g>
          <rect x={60} y={60} width={360} height={380} fill={MP.morning} stroke={KRP.ink} strokeWidth={8} />
          <path d="M 60 330 L 160 270 L 260 330 Z" fill={C.roofRed} stroke={KRP.ink} strokeWidth={4} />
          <rect x={80} y={330} width={160} height={110} fill={C.houseWhite} stroke={KRP.ink} strokeWidth={4} />
          <rect x={150} y={360} width={40} height={50} fill={C.houseBlue} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={340} cy={150} r={46} fill="#FFE6A0" opacity={0.9} />
          <line x1={240} y1={60} x2={240} y2={440} stroke={KRP.ink} strokeWidth={7} />
          <line x1={60} y1={250} x2={420} y2={250} stroke={KRP.ink} strokeWidth={7} />
          {/* 白いレースのカーテン */}
          <path d={`M 40 44 Q 70 240 ${100 + Math.sin(f / 20) * 6} 460 L 40 460 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          <path d={`M 440 44 Q 410 240 ${384 + Math.sin(f / 22) * 6} 460 L 440 460 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          <rect x={24} y={30} width={432} height={18} rx={9} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={44} y={440} width={392} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 額縁の絵 (右の壁) と壁のランプ */}
        <g>
          <rect x={1330} y={150} width={240} height={190} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1352} y={172} width={196} height={146} fill={MP.morning} />
          <path d="M 1352 318 L 1410 250 L 1450 290 L 1500 230 L 1548 318 Z" fill={C.grassDark} stroke={KRP.ink} strokeWidth={3} />
          <line x1={1450} y1={150} x2={1450} y2={110} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 1700 200 L 1760 200 L 1780 270 L 1680 270 Z" fill={C.houseYellow} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1722} y={270} width={16} height={60} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 幅木と床板 */}
        <rect x={-40} y={620} width={2000} height={34} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={654} width={2000} height={480} fill={C.floorWood} />
        {Array.from({ length: 8 }, (_, i) => {
          const yy = 654 + Math.pow(i / 7, 1.5) * 460;
          return <line key={i} x1={-40} y1={yy} x2={1960} y2={yy} stroke={C.floorWoodDark} strokeWidth={4} opacity={0.7} />;
        })}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150 - 40 + rnd(6169, i) * 60} y1={654 + (i % 3) * 40} x2={i * 150 - 40 + rnd(6169, i) * 60} y2={654 + (i % 3) * 40 + 40}
            stroke={C.floorWoodDark} strokeWidth={4} opacity={0.6} />
        ))}
        {/* 窓からの光の帯 (床に伸びる) */}
        <path d={`M 90 654 L 410 654 L ${410 + 520 * beam} ${654 + 330 * beam} L ${90 + 300 * beam} ${654 + 330 * beam} Z`} fill={C.sunBeam} opacity={0.45} />
        {/* 丸いラグ (右) とスリッパ */}
        <ellipse cx={1340} cy={940} rx={520} ry={110} fill={C.rug} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1340} cy={940} rx={420} ry={80} fill="none" stroke={C.rugDark} strokeWidth={8} />
        <g transform="translate(1000 800) rotate(-12)">
          <ellipse cx={0} cy={0} rx={56} ry={22} fill={C.momRed} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={70} cy={16} rx={56} ry={22} fill={C.momRed} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 奥を走る Clocky (ナイトテーブルの後ろ) */}
        {behind && clocky}
        {/* ナイトテーブル */}
        <g>
          <ellipse cx={NX} cy={NY + 8} rx={200} ry={18} fill={KRP.ink} opacity={0.18} />
          {[NX - 140, NX + 120].map((lx) => (
            <rect key={lx} x={lx} y={640} width={22} height={NY - 640} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          ))}
          <rect x={NX - 165} y={480} width={330} height={170} rx={8} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={NX - 140} y={520} width={280} height={100} rx={6} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={NX} cy={570} r={12} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={NX - 185} y={460} width={370} height={28} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {/* 小さな本とメガネ */}
          <rect x={NX + 80} y={430} width={86} height={30} fill={C.rugDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 主役: どっしり座るベル式の目覚まし (スヌーズボタン付き)。f60 でぽこっ */}
        <MzHClock x={NX + 10} y={462} s={1.02} f={f} snooze press={press} />
        {press > 0.05 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={press}>
            <line x1={NX - 110} y1={150} x2={NX - 130} y2={130} />
            <line x1={NX + 70} y1={150} x2={NX + 90} y2={130} />
          </g>
        )}
        {/* 手前を走る Clocky */}
        {!behind && clocky}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #170 20世紀、目覚まし時計は、どの家にも置かれるようになります。
// 格: 山 / seed 6170
// 絵: どこ: 20世紀前半のアメリカの住宅街を、夜明けの一瞬だけ「家の壁を外した断面図」(ドールハウスのように各家の寝室が見える) で見せる1枚。木造2階建ての家が横に5軒並ぶ・屋根・煙突・庭のフェンス・牛乳配達の瓶。演出: どの家の寝室のナイトテーブルにも同じ形の BellClock (ring=0) が置いてある。f の合図で左の家から順に BellClock (ring=1) が鳴り、各寝室の人 (男女を混ぜる: 男性は短い黒髪で紺の寝間着、女性は肩まで届く茶色の髪で赤の寝間着) が次々に跳ね起きる。最後の1軒だけ犬が鳴る時計を見て吠える。家々の窓に朝の光。動き: f0-30 カメラが通りの左から右へゆっくりパン / f30-110 時計が左から順に鳴る (ドミノのように) / 人がぽん・ぽんと起きる / f110-140 犬が吠えて最後の家の人も起きる
// どこ: 20世紀前半のアメリカの住宅街の夜明け。木造2階建て5軒を「壁を外した断面図」(ドールハウス) で。屋根・煙突・フェンス・牛乳瓶・通り
// 演出: どの家の2階の寝室にも同じ BellClock。左の家から順にドミノのように鳴り、寝ていた人 (男女交互) がぽんと跳ね起きる。
//       最後の家は犬が先に吠えて、それで人が起きる
// 動き: f0-40 カメラが左から右へパン / 鳴る f16,28,40,52 (5軒目は f60) / 起きる 各+4 / 犬 f60-80 → 5軒目の人 f74
const MZH170_HOUSES = [
  { wall: C.houseWhite, roof: C.roofRed, woman: false },
  { wall: C.houseYellow, roof: C.roofGray, woman: true },
  { wall: C.houseBlue, roof: C.roofRed, woman: false },
  { wall: C.housePink, roof: C.roofGray, woman: true },
  { wall: C.houseGreen, roof: C.roofRed, woman: false },
] as const;
const MzHDollHouse: React.FC<{ i: number; hx: number; f: number }> = ({ i, hx, f }) => {
  const h = MZH170_HOUSES[i];
  const ringAt = i < 4 ? 16 + i * 12 : 60;
  const wakeAt = i < 4 ? ringAt + 4 : 74;
  const ring = f >= ringAt ? 1 : 0;
  const up = easeOut(seg(f, wakeAt, wakeAt + 6));
  const W0 = 360, G = 862, F2 = 604, TOP = 372;
  const clothM = [C.dadNavy, C.dadNavyDark], clothW = [C.momRed, C.momRedDark];
  const [cl, cd] = h.woman ? clothW : clothM;
  const barking = i === 4 && f >= 60;
  return (
    <g>
      {/* 屋根と煙突 */}
      <rect x={hx + 250} y={TOP - 150} width={44} height={110} fill={MP.brick} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2].map((k) => {
        const a = ((f + k * 20 + i * 7) % 60) / 60;
        return <circle key={k} cx={hx + 272 + a * 40} cy={TOP - 160 - a * 90} r={12 + a * 20} fill={MP.mist} opacity={(1 - a) * 0.8} />;
      })}
      <path d={`M ${hx - 16} ${TOP} L ${hx + W0 / 2} ${TOP - 170} L ${hx + W0 + 16} ${TOP} Z`} fill={h.roof} stroke={KRP.ink} strokeWidth={6} />
      <path d={`M ${hx + 40} ${TOP - 4} L ${hx + W0 / 2} ${TOP - 128} L ${hx + W0 - 40} ${TOP - 4} Z`} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
      {/* 外壁の切り口 (厚み) と各階の部屋の奥の壁 */}
      <rect x={hx} y={TOP} width={W0} height={G - TOP} fill={h.wall} stroke={KRP.ink} strokeWidth={6} />
      <rect x={hx + 16} y={TOP + 14} width={W0 - 32} height={F2 - TOP - 24} fill={mixLite(h.wall)} stroke={KRP.ink} strokeWidth={4} />
      <rect x={hx + 16} y={F2 + 14} width={W0 - 32} height={G - F2 - 22} fill={mixLite(h.wall)} stroke={KRP.ink} strokeWidth={4} />
      {/* 床 */}
      <rect x={hx} y={F2 - 10} width={W0} height={24} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 2階の奥の窓 (夜明けの光) */}
      <rect x={hx + 200} y={TOP + 40} width={90} height={80} fill={MP.dawnSoft} stroke={KRP.ink} strokeWidth={4} />
      <line x1={hx + 245} y1={TOP + 40} x2={hx + 245} y2={TOP + 120} stroke={KRP.ink} strokeWidth={3} />
      <path d={`M ${hx + 200} ${TOP + 120} L ${hx + 290} ${TOP + 120} L ${hx + 330} ${F2 - 10} L ${hx + 170} ${F2 - 10} Z`} fill={C.sunBeam} opacity={0.35} />
      {/* ナイトテーブルと時計 */}
      <rect x={hx + 34} y={F2 - 84} width={82} height={74} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
      <rect x={hx + 46} y={F2 - 66} width={58} height={24} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={3} />
      <g transform={ring ? `translate(${Math.sin(f * 2.4) * 2} 0)` : undefined}>
        <MzHClock x={hx + 75} y={F2 - 80} s={0.27} f={f} ring={ring} />
      </g>
      {/* ベッド: ヘッドボード・マットレス */}
      <rect x={hx + 132} y={F2 - 110} width={18} height={100} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={hx + 140} y={F2 - 52} width={200} height={42} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={hx + 146} y={F2 - 66} width={50} height={18} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <MzHSleeper hx={hx + 262} hy={F2 - 60} s={0.4} f={f} up={up} face="surprised" cloth={cl} clothDark={cd}
        woman={h.woman ? "long" : undefined} phase={i} />
      {/* 掛け布団 (起きると腰までずり落ちる) */}
      <path d={`M ${lerp(hx + 184, hx + 242, up)} ${F2 - 52} Q ${hx + 260} ${lerp(F2 - 80, F2 - 66, up)} ${hx + 346} ${F2 - 58} L ${hx + 346} ${F2 - 18} L ${lerp(hx + 184, hx + 242, up)} ${F2 - 18} Z`}
        fill={i % 2 ? KRP.blueSoft : "#F1D7A8"} stroke={KRP.ink} strokeWidth={4} />
      {/* 1階: 階段・テーブル・ランプ */}
      <path d={`M ${hx + 20} ${G - 6} ${Array.from({ length: 6 }, (_, k) => `L ${hx + 20 + k * 22} ${G - 6 - k * 40} L ${hx + 42 + k * 22} ${G - 6 - k * 40}`).join(" ")} L ${hx + 152} ${G - 6} Z`}
        fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
      <rect x={hx + 200} y={G - 74} width={120} height={14} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
      <rect x={hx + 210} y={G - 60} width={10} height={54} fill={MP.woodDark} />
      <rect x={hx + 300} y={G - 60} width={10} height={54} fill={MP.woodDark} />
      <rect x={hx + 236} y={G - 104} width={20} height={30} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      <path d={`M ${hx + 260} ${G - 160} L ${hx + 300} ${G - 160} L ${hx + 312} ${G - 126} L ${hx + 248} ${G - 126} Z`} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={hx + 276} y={G - 126} width={8} height={52} fill={KRP.ink} />
      {/* 犬 (5軒目だけ)。鳴る時計を見て吠える */}
      {i === 4 && (
        <g transform={`translate(${hx + 150} ${F2 - 12}) ${barking ? `translate(0 ${-Math.abs(Math.sin(f / 3)) * 8})` : ""}`}>
          <ellipse cx={0} cy={-26} rx={34} ry={20} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-36} cy={-48} r={18} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-30} cy={-62} rx={8} ry={14} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} transform={`rotate(-30 -30 -62)`} />
          <circle cx={-42} cy={-52} r={3} fill={KRP.ink} />
          {barking ? <path d="M -56 -46 L -46 -42 L -56 -38 Z" fill={KRP.ink} /> : <circle cx={-54} cy={-44} r={3.5} fill={KRP.ink} />}
          {[-20, 20].map((lx) => <rect key={lx} x={lx - 5} y={-12} width={10} height={14} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={3} />)}
          <path d={`M 32 -32 Q 48 ${-50 + Math.sin(f / 2) * 8} 44 -54`} fill="none" stroke={KRP.ink} strokeWidth={4} />
          {barking && (
            <text x={-60} y={-80} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.red} textAnchor="end"
              stroke={KRP.white} strokeWidth={6} paintOrder="stroke" opacity={0.6 + 0.4 * Math.sin(f / 2)}>ワン!</text>
          )}
        </g>
      )}
      {/* 玄関先の牛乳瓶 */}
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${hx + W0 - 40 + k * 20} ${G + 26})`}>
          <rect x={-7} y={-34} width={14} height={34} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-5} y={-40} width={10} height={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
        </g>
      ))}
    </g>
  );
};
// 壁の色を少し明るく (部屋の奥の壁)
const mixLite = (c: string) => mixColor(c, "#FFFFFF", 0.35);

const Mz170: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 40));
  const sc = 1.04;
  const tx = lerp(-4, -44, pan);
  return (
    <Frame f={f} seed={6170}>
      <g transform={`translate(${tx} ${-60}) scale(${sc})`}>
        {/* 夜明けの空 (上ほど青、地平線が橙) と朝日 */}
        {Array.from({ length: 10 }, (_, k) => (
          <rect key={k} x={-40} y={-40 + k * 96} width={2000} height={98} fill={mixColor("#6E79B0", MP.dawn, k / 9)} />
        ))}
        <circle cx={1720} cy={300 - seg(f, 0, 150) * 40} r={80} fill="#FFD27A" opacity={0.95} />
        {[0, 1, 2].map((k) => (
          <ellipse key={k} cx={(k * 700 + f * 0.6) % 2200 - 100} cy={110 + k * 50} rx={130} ry={26} fill={MP.dawnSoft} opacity={0.7} />
        ))}
        {/* 芝生と通り */}
        <rect x={-40} y={862} width={2000} height={60} fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={922} width={2000} height={240} fill={KRP.gray} />
        {Array.from({ length: 12 }, (_, k) => <rect key={k} x={k * 180} y={986} width={90} height={12} fill={KRP.white} opacity={0.8} />)}
        {/* 家と家のあいだの白いフェンス */}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <g key={k}>
            {[0, 1, 2].map((p) => (
              <path key={p} d={`M ${k * 384 - 14 + p * 9} 862 l 0 -52 l 4 -8 l 4 8 l 0 52 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        {MZH170_HOUSES.map((_, i) => <MzHDollHouse key={i} i={i} hx={12 + i * 384} f={f} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #171 アメリカでは、1940年の1年で、1150万台も作られました。
// 格: 図 / seed 6171
// 絵: どこ: 1940年のアメリカの時計工場の中。鉄骨の天井・ガラスの天窓・長いベルトコンベア・作業台に並ぶ工員 (男女を混ぜる: 男性はハンチング帽と腕まくり、女性は頭にスカーフを巻き長い茶髪を後ろで結んでスカート)。壁の黒板に年代札「1940年」。演出: コンベアの上を BellClock (ring=0) がずらずら流れてきて、終点の箱にざざーっと流れ落ち、箱がみるみる積み上がって天井近くまで届く。黒板の数字札が「0」から「1150万台」へ一気に回る。いちばん上の箱からあふれた時計がひとつ転がり落ちて、工員の女性があわてて両手で受け止める (腕は2本 pose で描く)。動き: f0-20 カメラがコンベアの終点に寄る / f20-100 時計が流れる・箱が積み上がる (カメラが上へスクロール) / f40-100 数字が回る / f100-130 時計が落ちて受け止められる
// どこ: 1940年のアメリカの時計工場の中。鉄骨のトラス・ガラスの天窓と光の筋・吊りランプ・れんがの腰壁・黒板 (年代札1940年と数字)
// 演出: コンベアの上を BellClock がずらずら流れ、終点のシュートから箱へ落ちる。満杯の箱がみるみる積み上がって天井近くへ。
//       黒板の数字が 0 → 1150万台へ回る。いちばん上の箱からあふれた1個が落ちて、工員の女性 (スカーフ・結んだ茶髪・スカート) が両手で受け止める
// 動き: f0-20 カメラが終点へ寄る / f14-40 箱が積み上がる・数字が回る (カメラ少し上へ) / f40-58 時計が落ちる / f58 受け止める / 以後ベルトは流れ続ける
const MZH_BELT_Y = 640, MZH_BELT_END = 1120, MZH_FLOOR = 862;
// 時計工場 (#171・#172・#175 の同じ工場)。belt: ベルトの模様の送り量 (px)
const MzHFactory: React.FC<{ f: number; year: string; belt: number; children?: React.ReactNode; lever?: number; back?: React.ReactNode }> = ({ f, year, belt, children, lever, back }) => (
  <g>
    {/* 壁: しっくい + れんがの腰壁 */}
    <rect x={-60} y={-60} width={2040} height={MZH_FLOOR + 60} fill={MP.mortar} />
    <rect x={-60} y={470} width={2040} height={MZH_FLOOR - 470} fill={MP.brick} />
    {Array.from({ length: 9 }, (_, r) => (
      <g key={r}>
        <line x1={-60} y1={470 + r * 44} x2={1980} y2={470 + r * 44} stroke={MP.brickDark} strokeWidth={3} />
        {Array.from({ length: 22 }, (_, k) => (
          <line key={k} x1={k * 96 + (r % 2) * 48 - 40} y1={470 + r * 44} x2={k * 96 + (r % 2) * 48 - 40} y2={514 + r * 44} stroke={MP.brickDark} strokeWidth={3} />
        ))}
      </g>
    ))}
    <rect x={-60} y={462} width={2040} height={14} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 天窓 (ガラス) と鉄骨のトラス */}
    <rect x={-60} y={-60} width={2040} height={240} fill={C.steel} />
    {Array.from({ length: 6 }, (_, k) => (
      <g key={k}>
        <path d={`M ${k * 340 - 20} 170 L ${k * 340 + 100} 10 L ${k * 340 + 220} 10 L ${k * 340 + 300} 170 Z`} fill={MP.morning} stroke={KRP.ink} strokeWidth={5} />
        <line x1={k * 340 + 160} y1={10} x2={k * 340 + 160} y2={170} stroke={KRP.ink} strokeWidth={4} />
        <line x1={k * 340 + 40} y1={90} x2={k * 340 + 260} y2={90} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    <rect x={-60} y={168} width={2040} height={22} fill={C.steelLight} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 12 }, (_, k) => (
      <path key={k} d={`M ${k * 170 - 40} 190 L ${k * 170 + 45} 240 L ${k * 170 + 130} 190`} fill="none" stroke={C.steel} strokeWidth={8} />
    ))}
    {/* 天窓からの光の筋 */}
    {[0, 1, 2, 3, 4].map((k) => (
      <path key={k} d={`M ${k * 400 + 60} 190 L ${k * 400 + 220} 190 L ${k * 400 + 420} ${MZH_FLOOR} L ${k * 400 + 180} ${MZH_FLOOR} Z`} fill={C.sunBeam} opacity={0.16 + 0.04 * Math.sin(f / 30 + k)} />
    ))}
    {/* 吊りランプ (緑のかさ) */}
    {[860, 1500].map((lx, k) => (
      <g key={lx} transform={`rotate(${Math.sin(f / 40 + k) * 1.5} ${lx} 190)`}>
        <line x1={lx} y1={190} x2={lx} y2={290} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${lx - 60} 330 Q ${lx} 270 ${lx + 60} 330 Z`} fill={C.deskMat} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={lx} cy={334} rx={18} ry={9} fill={MP.glow} />
      </g>
    ))}
    {/* 黒板 (年代札と数字) */}
    <rect x={60} y={232} width={540} height={220} rx={6} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={6} />
    <rect x={76} y={248} width={508} height={188} fill={C.board} />
    <path d="M 100 420 q 40 -6 80 0 M 420 270 q 60 4 120 -2" stroke={KRP.white} strokeWidth={3} opacity={0.25} fill="none" />
    <rect x={90} y={448} width={480} height={10} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={3} />
    <rect x={480} y={438} width={30} height={10} fill={KRP.white} />
    <TagPlate x={96 + (year.length * 38 + 40) / 2} y={300} text={year} size={38} />
    {/* 床 */}
    <rect x={-60} y={MZH_FLOOR} width={2040} height={280} fill={KRP.grayDark} />
    {[0, 1, 2].map((r) => <line key={r} x1={-60} y1={MZH_FLOOR + 40 + r * 70} x2={1980} y2={MZH_FLOOR + 40 + r * 70} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />)}
    {/* コンベアの奥に立つ人 (脚はベルトに隠れる) */}
    {back}
    {/* コンベア: 脚・ローラー・ベルト・側板 */}
    {Array.from({ length: 6 }, (_, k) => (
      <rect key={k} x={k * 220 + 20} y={MZH_BELT_Y + 40} width={22} height={MZH_FLOOR - MZH_BELT_Y - 40} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
    ))}
    <rect x={-60} y={MZH_BELT_Y} width={MZH_BELT_END + 60} height={30} fill={C.belt} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 30 }, (_, k) => {
      const bx = ((k * 44 + belt) % 1320) - 100;
      return bx < MZH_BELT_END - 10 ? <line key={k} x1={bx} y1={MZH_BELT_Y + 4} x2={bx + 10} y2={MZH_BELT_Y + 26} stroke={C.beltLight} strokeWidth={5} /> : null;
    })}
    <rect x={-60} y={MZH_BELT_Y + 30} width={MZH_BELT_END + 60} height={22} fill={C.steelLight} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 12 }, (_, k) => (
      <g key={k} transform={`translate(${k * 100} ${MZH_BELT_Y + 41}) rotate(${belt * 3})`}>
        <circle r={8} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
        <line x1={-6} y1={0} x2={6} y2={0} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
    ))}
    {/* 停止レバー (#172 で使う) */}
    {lever !== undefined && (
      <g>
        <rect x={MZH_BELT_END - 80} y={MZH_BELT_Y + 52} width={70} height={90} rx={6} fill={C.olive} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${lerp(-20, -100, lever)} ${MZH_BELT_END - 45} ${MZH_BELT_Y + 96})`}>
          <rect x={MZH_BELT_END - 52} y={MZH_BELT_Y - 40} width={14} height={136} rx={6} fill={C.steelLight} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={MZH_BELT_END - 45} cy={MZH_BELT_Y - 44} r={18} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    )}
    {children}
  </g>
);

const Mz171: React.FC<{ f: number }> = ({ f }) => {
  const zoom = easeInOut(seg(f, 0, 20));
  const lift = easeInOut(seg(f, 14, 40));
  const sc = lerp(1, 1.06, zoom);
  const ty = lift * 50;
  const belt = f * 7;
  const fill = easeOut(seg(f, 12, 40));
  const n = Math.min(6, Math.floor(fill * 6.999));
  const count = Math.round(1150 * easeOut(seg(f, 12, 40)));
  // あふれた1個: 一番上の箱から落ちる → 女性の手へ
  const fall = seg(f, 40, 58);
  const caught = f >= 58;
  const W2 = { x: 1770, y: 850, s: 0.78 };
  const handY = W2.y - 120 * W2.s;
  const fx = lerp(1520, W2.x, fall), fy = lerp(196, handY - 30, fall * fall);
  const STX = 1240, BOXW = 280, BOXH = 100;
  return (
    <Frame f={f} seed={6171}>
      <g transform={`translate(${960 * (1 - sc)} ${540 * (1 - sc) + ty}) scale(${sc})`}>
        <MzHFactory f={f} year="1940年" belt={belt} back={<>
          {/* 工員: コンベアの奥に並ぶ (男性=ハンチング帽・腕まくり / 女性=スカーフ・結んだ髪) */}
          {[
            { x: 300, woman: false, ph: 1 }, { x: 640, woman: true, ph: 2 }, { x: 960, woman: false, ph: 3 },
          ].map((p) => (
            <g key={p.x}>
              {p.woman && <MzHPonytail x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} color={C.hairBrown} side={-1} />}
              <Person x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} pose="hold" face={fill < 1 ? "surprised" : "smile"}
                cloth={p.woman ? C.momRed : C.workBlue} clothDark={p.woman ? C.momRedDark : C.workBlueDark} hair={p.woman ? "none" : "cap"} gaze={[6, -4]} />
              {p.woman ? <MzHScarf x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} /> : <MzHHunting x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} />}
            </g>
          ))}
        </>}>
          {/* 黒板の数字 (チョーク) */}
          <text x={330} y={410} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.white}>
            {count === 0 ? "0台" : `${count}万台`}
          </text>
          {/* ベルトの上を流れる時計 */}
          {Array.from({ length: 9 }, (_, k) => {
            const cx = ((k * 150 + belt) % 1350) - 160;
            if (cx > MZH_BELT_END - 20) return null;
            return <MzHClock key={k} x={cx} y={MZH_BELT_Y + 2} s={0.3} f={f + k * 5} />;
          })}
          {/* 終点のシュートと、落ちていく時計 */}
          <path d={`M ${MZH_BELT_END - 10} ${MZH_BELT_Y} L ${MZH_BELT_END + 110} ${MZH_BELT_Y + 120} L ${MZH_BELT_END + 110} ${MZH_BELT_Y + 150} L ${MZH_BELT_END - 10} ${MZH_BELT_Y + 40} Z`}
            fill={C.steelLight} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((k) => {
            const a = ((belt / 150 + k * 0.5) % 1);
            return <MzHClock key={k} x={MZH_BELT_END + a * 100} y={MZH_BELT_Y + 20 + a * 150} s={0.28} f={f} rot={a * 90} />;
          })}
          {/* いま詰めている箱 (床) */}
          <rect x={MZH_BELT_END + 40} y={MZH_FLOOR - 90} width={160} height={90} fill={C.crate} stroke={KRP.ink} strokeWidth={5} />
          {/* 満杯の箱の山 (ふたつき・時計のしるし) */}
          {Array.from({ length: n + 1 }, (_, k) => {
            const grow = k < n ? 1 : pop(clamp01(fill * 6.999 - n));
            if (grow <= 0.01) return null;
            const by = MZH_FLOOR - (k + 1) * BOXH;
            return (
              <g key={k} transform={`translate(${STX + BOXW / 2 + (k % 2) * 14 - 7} ${by + BOXH}) scale(${grow}) translate(${-(STX + BOXW / 2 + (k % 2) * 14 - 7)} ${-(by + BOXH)})`}>
                <rect x={STX + (k % 2) * 14 - 7} y={by} width={BOXW} height={BOXH} fill={C.crate} stroke={KRP.ink} strokeWidth={5} />
                <line x1={STX + (k % 2) * 14 - 7} y1={by + 20} x2={STX + BOXW + (k % 2) * 14 - 7} y2={by + 20} stroke={C.crateDark} strokeWidth={4} />
                <circle cx={STX + BOXW / 2 + (k % 2) * 14 - 7} cy={by + 60} r={22} fill="none" stroke={C.crateDark} strokeWidth={5} />
                <path d={`M ${STX + BOXW / 2 + (k % 2) * 14 - 7} ${by + 60} l 0 -14 M ${STX + BOXW / 2 + (k % 2) * 14 - 7} ${by + 60} l 10 6`} stroke={C.crateDark} strokeWidth={4} />
              </g>
            );
          })}
          {/* 一番上の箱からのぞく時計 */}
          {n >= 6 && [0, 1, 2].map((k) => <MzHClock key={k} x={STX + 70 + k * 70} y={MZH_FLOOR - 6 * BOXH + 10} s={0.22} f={f} rot={(k - 1) * 14} />)}
          {/* あわてて受け止める女性 */}
          <MzHPonytail x={W2.x} y={W2.y} s={W2.s} f={f} phase={5} color={C.hairBrown} side={1} />
          <Person x={W2.x} y={W2.y} s={W2.s} f={f} phase={5} pose={caught ? "hold" : "banzai"} face={caught ? "smile" : "surprised"}
            cloth={C.momRed} clothDark={C.momRedDark} hair="none" gaze={caught ? [0, 4] : [-6, -6]} lean={caught ? 0 : -4} />
          <MzHSkirt x={W2.x} y={W2.y} s={W2.s} f={f} phase={5} color={C.momRedDark} />
          <MzHScarf x={W2.x} y={W2.y} s={W2.s} f={f} phase={5} />
          {f >= 40 && <MzHClock x={fx} y={fy} s={0.3} f={f} rot={caught ? 0 : fall * 300} />}
          {f >= 58 && f < 66 && (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
              <line x1={W2.x - 70} y1={handY - 70} x2={W2.x - 96} y2={handY - 90} />
              <line x1={W2.x + 70} y1={handY - 70} x2={W2.x + 96} y2={handY - 90} />
            </g>
          )}
        </MzHFactory>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #172 ところが、1942年7月1日、アメリカ政府が、目覚まし時計の製造を止めます。
// 格: 山 / seed 6172
// 絵: どこ: #171 と同じ時計工場 (同じ天窓・コンベア・黒板)。黒板の札が「1942年7月1日」に書き換わる。演出: 動いていたコンベアの前に、黒い上着と帽子の役人 (男性、一般の人として顔あり。名前は書かない) が書類をかざして入ってくる (腕は2本 pose で描く)。書類には大きな赤い判子のしるしだけ (字は書かない)。工場長が大きなレバーをガチャンと下ろすと、コンベアがぎぎぎと止まり、流れていた BellClock が手前でつんのめって1個ずつ前の時計にぶつかって止まる (玉突き)。工員たちが手を止めて顔を見合わせる (face="surprised")。天窓の光にほこりが舞う。動き: f0-30 役人が入る / f30-50 判子のしるしがぱっと見える / f50-70 レバーが下りる / f70-110 コンベアが減速して止まる・時計の玉突き / f110-140 工員たちがぽかん
// どこ: #171 と同じ時計工場。黒板の札が「1942年7月1日」。天窓の光にほこりが舞う
// 演出: 左から黒い上着・中折れ帽の役人が、赤い判子のしるしだけの書類を頭上にかざして入る。工場長 (ベスト・ネクタイ) がレバーをガチャンと下ろし、
//       コンベアがぎぎぎと止まる。止まった勢いで手前の時計がつんのめり、1個ずつ前の時計にぶつかって止まる (玉突き)。工員たちは顔を見合わせてぽかん
// 動き: f0-16 役人が入る / f14-22 判子がぱっと見える / f22-30 レバー / f30-42 減速して停止 / f34-46 玉突き / f40- 工員がぽかん・ほこり
const MzHBeltAt = (f: number) => {
  const d = clamp01((f - 30) / 12) * 12;
  return 7 * Math.min(f, 30) + (f > 30 ? 7 * (d - (d * d) / 24) : 0);
};
const Mz172: React.FC<{ f: number }> = ({ f }) => {
  const belt = MzHBeltAt(f);
  const walk = easeOut(seg(f, 0, 16));
  const ox = lerp(-160, 470, walk);
  const stamp = pop(seg(f, 14, 22));
  const lever = easeOut(seg(f, 22, 30));
  const bang = Math.sin(seg(f, 28, 34) * Math.PI);
  const stopped = f >= 40;
  // 時計の位置 (ベルト上)。止まったら右から順に前の時計へ詰まる
  const base = Array.from({ length: 9 }, (_, k) => ((k * 150 + belt) % 1350) - 160);
  const order = base.map((x, k) => [x, k] as const).filter(([x]) => x <= MZH_BELT_END - 20 && x > -100).sort((a, b) => b[0] - a[0]);
  const pos: Record<number, { x: number; rot: number }> = {};
  order.forEach(([x, k], r) => {
    if (r < 5) {
      const target = MZH_BELT_END - 70 - r * 92;
      const t = easeOut(seg(f, 33 + r * 2.5, 39 + r * 2.5));
      const nx = target > x ? lerp(x, target, t) : x;
      pos[k] = { x: nx, rot: Math.sin(t * Math.PI) * 18 };
    } else pos[k] = { x, rot: 0 };
  });
  const workerFace = f >= 36 ? "surprised" : "normal";
  return (
    <Frame f={f} seed={6172}>
      <g transform={`translate(${bang * 6} ${bang * -4})`}>
        <MzHFactory f={f} year="1942年7月1日" belt={belt} lever={lever} back={<>
          {/* 工員 (コンベアの奥)。止まると顔を見合わせる */}
          {[
            { x: 300, woman: false, ph: 1, g: [8, 0] }, { x: 640, woman: true, ph: 2, g: [-8, 0] }, { x: 1020, woman: false, ph: 3, g: [-8, 0] },
          ].map((p) => (
            <g key={p.x}>
              {p.woman && <MzHPonytail x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} color={C.hairBrown} side={1} />}
              <Person x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} pose={f >= 36 ? "stand" : "hold"} face={workerFace}
                cloth={p.woman ? C.momRed : C.workBlue} clothDark={p.woman ? C.momRedDark : C.workBlueDark} hair={p.woman ? "none" : "cap"}
                gaze={(f >= 36 ? p.g : [0, 6]) as [number, number]} />
              {p.woman ? <MzHScarf x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} /> : <MzHHunting x={p.x} y={MZH_BELT_Y + 44} s={0.7} f={f} phase={p.ph} />}
              {f >= 40 && <QMark x={p.x + 50} y={MZH_BELT_Y - 200} s={0.4} f={f + p.ph * 9} t={seg(f, 40 + p.ph * 2, 46 + p.ph * 2)} color={KRP.blueDeep} />}
            </g>
          ))}
        </>}>
          {/* ベルトの上の時計 (玉突き) */}
          {base.map((x, k) => {
            if (x > MZH_BELT_END - 20 || x < -120) return null;
            const p = pos[k] ?? { x, rot: 0 };
            return <MzHClock key={k} x={p.x} y={MZH_BELT_Y + 2} s={0.3} f={f + k * 5} rot={p.rot} />;
          })}
          {/* ぶつかった瞬間の星 */}
          {order.slice(0, 4).map(([, k], r) => {
            const t = seg(f, 37 + r * 2.5, 42 + r * 2.5);
            if (t <= 0 || t >= 1 || r === 0) return null;
            const p = pos[k];
            return (
              <g key={k} transform={`translate(${p.x + 48} ${MZH_BELT_Y - 60}) scale(${0.6 + t * 0.5})`} opacity={1 - t}>
                <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              </g>
            );
          })}
          {/* ぎぎぎ (止まるときの火花の線) */}
          {f >= 30 && f < 44 && [0, 1, 2].map((k) => (
            <line key={k} x1={200 + k * 300} y1={MZH_BELT_Y + 56} x2={180 + k * 300 - (f % 3) * 6} y2={MZH_BELT_Y + 80} stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" />
          ))}
          {/* 右: 積まれた箱と、壁の大きな時計 (工場の時計) */}
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect x={1300 + (k % 2) * 16} y={MZH_FLOOR - (k + 1) * 100} width={280} height={100} fill={C.crate} stroke={KRP.ink} strokeWidth={5} />
              <line x1={1300 + (k % 2) * 16} y1={MZH_FLOOR - (k + 1) * 100 + 20} x2={1580 + (k % 2) * 16} y2={MZH_FLOOR - (k + 1) * 100 + 20} stroke={C.crateDark} strokeWidth={4} />
              <circle cx={1440 + (k % 2) * 16} cy={MZH_FLOOR - (k + 1) * 100 + 60} r={22} fill="none" stroke={C.crateDark} strokeWidth={5} />
            </g>
          ))}
          <g transform="translate(1680 330)">
            <circle r={92} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
            {Array.from({ length: 12 }, (_, k) => (
              <line key={k} x1={0} y1={-74} x2={0} y2={-84} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${k * 30})`} />
            ))}
            <line x1={0} y1={0} x2={0} y2={-64} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${f * 0.5})`} />
            <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" transform="rotate(255)" />
            <circle r={8} fill={KRP.ink} />
            <rect x={-8} y={-128} width={16} height={36} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 工場長: レバーを握って下ろす */}
          <Person x={937} y={850} s={0.8} f={f} phase={4} pose={lever > 0.05 ? "hold" : "raise"} face={f >= 40 ? "surprised" : "worried"}
            cloth={KRP.white} clothDark={C.coatBlack} hair="cap" gaze={[-8, -2]} />
          <MzHTie x={937} y={850} s={0.8} f={f} phase={4} vest={C.suitGray} color={KRP.red} />
          {bang > 0.1 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={bang}>
              {[-60, -20, 20, 60].map((a) => (
                <line key={a} x1={1075 + Math.sin((a * Math.PI) / 180) * 120} y1={736 - Math.cos((a * Math.PI) / 180) * 120}
                  x2={1075 + Math.sin((a * Math.PI) / 180) * 160} y2={736 - Math.cos((a * Math.PI) / 180) * 160} />
              ))}
            </g>
          )}
          {/* 役人: 書類を頭の上にかざす (右腕を上げ、左腕は下ろす = 腕2本) */}
          <Person x={ox} y={850} s={0.8} f={f} phase={7} pose="point" pointDir={1} face="normal" cloth={C.coatBlack} clothDark={C.coatBlackDark} hair="cap" gaze={[8, 0]} />
          <MzHTie x={ox} y={850} s={0.8} f={f} phase={7} color={C.coatBlackDark} />
          <MzHFedora x={ox} y={850} s={0.8} f={f} phase={7} />
          <g transform={`translate(${ox + 122 + 70} ${850 - 148 * 0.8 + mzhBob(f, 7) + 70}) rotate(${4 + Math.sin(f / 12) * 2})`}>
            <rect x={-78} y={-200} width={156} height={200} rx={4} fill={C.patent} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((k) => (
              <path key={k} d={`M -56 ${-176 + k * 20} q 14 -6 28 0 t 28 0 t 28 0 t 28 0`} fill="none" stroke={KRP.grayDark} strokeWidth={3} />
            ))}
            <g transform={`translate(10 -54) scale(${stamp}) rotate(-12)`}>
              <circle r={42} fill="none" stroke={C.seal} strokeWidth={8} />
              <circle r={28} fill={C.seal} opacity={0.85} />
              <circle r={16} fill="none" stroke={C.patent} strokeWidth={4} />
            </g>
          </g>
          {/* 天窓の光に舞うほこり */}
          {Array.from({ length: 14 }, (_, k) => (
            <circle key={k} cx={(rnd(6172, k) * 1900 + Math.sin(f / 20 + k) * 20)} cy={(220 + rnd(6173, k) * 500 + f * 0.6) % 760 + 200}
              r={3 + rnd(6174, k) * 3} fill={KRP.white} opacity={stopped ? 0.75 : 0.35} />
          ))}
        </MzHFactory>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #173 戦争に、金属が必要だったからです。
// 格: 並 / seed 6173
// ★親の検品で直し: 時計そのものを回収したように見えないよう、運ぶのは「時計を作るはずだった金属の材料」だけ。
//   荷台・箱に目覚まし時計は載せない。
// どこ: #172 の工場の裏手の搬出口 (材料倉庫)。れんがの壁・暗い倉庫の中の材料の箱と木のパレット・木の荷台 (プラットホーム)・オリーブ色の軍用トラック
// 演出: 真鍮の板の束・銅線のコイル・鉄の棒の束・ばねの材料 (巻いた鋼の帯) を入れた木箱やパレットが、次々とトラックの荷台へ。
//       奥には同じ金属で作る物の点線の影 (ヘルメット・飛行機の輪郭だけ)。
//       箱を運ぶ工員 (男性・ハンチング帽) が、箱の中の真鍮の板を名残惜しそうに見る (sad)。真鍮の板が一度だけきらっと光る
// 動き: f0-20 カメラが搬出口へ寄る / f0-40 箱を運ぶ / f28-36 きらっ / f52 箱を置く / f60-100 トラックが出ていき排気の煙
const MZH_COPPER = "#C46A36", MZH_COPPER_DARK = "#8E4622", MZH_COPPER_LIGHT = "#E89A62";
type MzHStuff = "brass" | "copper" | "iron" | "spring";
const MZH_STUFF_NAME: Record<MzHStuff, string> = { brass: "真鍮板", copper: "銅線", iron: "鉄棒", spring: "ばね材" };
// 箱のふちから上へのぞく中身 (箱の座標系: 箱の上端 y=-110、幅 -100..100)
const MzHStuffTop: React.FC<{ kind: MzHStuff; glint?: number }> = ({ kind, glint = 0 }) => {
  if (kind === "brass") {
    // 真鍮の板を立てて詰めた束 (上の縁が何枚も重なって見える) + 帯
    return (
      <g>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k} transform={`translate(${-78 + k * 8} ${-150 + k * 6}) rotate(${-4 + k * 2})`}>
            <rect x={0} y={0} width={140} height={46} fill={k % 2 ? MP.brassDark : MP.brass} stroke={KRP.ink} strokeWidth={3.5} />
            <line x1={8} y1={8} x2={60} y2={8} stroke={MP.brassLight} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        <rect x={-8} y={-152} width={14} height={44} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
        {glint > 0 && (
          <g transform="translate(-30 -142)" opacity={glint}>
            <path d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z" fill={KRP.white} stroke={MP.brassDark} strokeWidth={2} />
          </g>
        )}
      </g>
    );
  }
  if (kind === "copper") {
    // 銅線のコイル (寝かせた輪を2つ重ねる)
    return (
      <g>
        {[[-36, -116], [34, -132]].map(([cx, cy], k) => (
          <g key={k} transform={`translate(${cx} ${cy})`}>
            <ellipse rx={58} ry={24} fill={MZH_COPPER} stroke={KRP.ink} strokeWidth={4} />
            {[50, 42, 34].map((r) => <ellipse key={r} rx={r} ry={r * 0.41} fill="none" stroke={r === 42 ? MZH_COPPER_LIGHT : MZH_COPPER_DARK} strokeWidth={3} />)}
            <ellipse rx={24} ry={10} fill={MP.soot} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M 52 4 Q 72 -6 66 -24" stroke={MZH_COPPER_DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  }
  if (kind === "iron") {
    // 鉄の棒の束 (斜めに突き出す。端の切り口は丸)
    return (
      <g>
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const bx = -70 + k * 26, by = -108;
          const ex = bx + 18, ey = by - 70 - (k % 3) * 14;
          return (
            <g key={k}>
              <line x1={bx} y1={by} x2={ex} y2={ey} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
              <line x1={bx} y1={by} x2={ex} y2={ey} stroke={k % 2 ? MP.iron : MP.ironLight} strokeWidth={13} strokeLinecap="round" />
              <circle cx={ex} cy={ey} r={6} fill={C.steelLight} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          );
        })}
        <path d="M -66 -140 L 84 -150" stroke={MP.brassDark} strokeWidth={5} />
      </g>
    );
  }
  // spring: ばねの材料 = 薄い鋼の帯をぐるぐる巻いたロール (立てて並べる)
  return (
    <g>
      {[-52, 4, 58].map((cx, k) => (
        <g key={k} transform={`translate(${cx} -132)`}>
          <circle r={30} fill={C.steelLight} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 0 m 4 0 a 4 4 0 1 1 -8 0 a 9 9 0 1 1 18 0 a 14 14 0 1 1 -28 0 a 19 19 0 1 1 38 0 a 24 24 0 1 1 -48 0" fill="none" stroke={C.steel} strokeWidth={3} />
          <circle r={5} fill={MP.soot} />
        </g>
      ))}
    </g>
  );
};
const MzHCrate: React.FC<{ x: number; y: number; s?: number; kind: MzHStuff; open?: boolean; glint?: number; tag?: boolean }> = ({ x, y, s = 1, kind, open = true, glint = 0, tag = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {open && <MzHStuffTop kind={kind} glint={glint} />}
    <rect x={-100} y={-110} width={200} height={110} fill={C.crate} stroke={KRP.ink} strokeWidth={5} />
    {[-70, 70].map((sx) => <line key={sx} x1={sx} y1={-110} x2={sx} y2={0} stroke={C.crateDark} strokeWidth={4} />)}
    <line x1={-100} y1={-56} x2={-60} y2={-56} stroke={C.crateDark} strokeWidth={4} />
    <line x1={60} y1={-56} x2={100} y2={-56} stroke={C.crateDark} strokeWidth={4} />
    {/* 中身の札 (材料の名前) */}
    {tag && (
      <g>
        <rect x={-58} y={-84} width={116} height={52} rx={4} fill={C.patent} stroke={KRP.ink} strokeWidth={3.5} />
        <text x={0} y={-47} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={KRP.ink}>{MZH_STUFF_NAME[kind]}</text>
      </g>
    )}
  </g>
);
// 木のパレットに積んだ鉄の棒の束 (箱に入らない長い材料)
const MzHPalletBars: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* パレット */}
    <rect x={-130} y={-26} width={260} height={14} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
    {[-120, -10, 100].map((bx) => <rect key={bx} x={bx} y={-12} width={20} height={12} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
    {/* 棒の束 (切り口が並んだ俵積み) と横の長さ */}
    <rect x={-120} y={-86} width={240} height={60} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2].map((r) => Array.from({ length: 6 - r }, (_, k) => (
      <circle key={`${r}-${k}`} cx={-118 + r * 10 + k * 20} cy={-36 - r * 18} r={10} fill={k % 2 ? C.steelLight : MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
    )))}
    {[-60, 60].map((bx) => <rect key={bx} x={bx - 5} y={-90} width={10} height={66} fill={C.steel} stroke={KRP.ink} strokeWidth={2.5} />)}
  </g>
);
const Mz173: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1, 1.06, easeInOut(seg(f, 0, 20)));
  const carry = easeInOut(seg(f, 0, 34));
  const wx = lerp(360, 800, carry);
  const look = seg(f, 14, 20) * (1 - seg(f, 50, 56));
  const drive = seg(f, 60, 100);
  const tx = drive * drive * 1100;
  const glint = f >= 28 && f < 38 ? Math.sin(((f - 28) / 10) * Math.PI) : 0;
  const BED = 660;
  const placed = f >= 52;
  return (
    <Frame f={f} seed={6173}>
      <g transform={`translate(${960 * (1 - sc)} ${560 * (1 - sc)}) scale(${sc})`}>
        {/* 空 (曇りの昼) */}
        <rect x={-60} y={-60} width={2040} height={300} fill={KRP.blueSoft} />
        {/* れんがの壁 */}
        <rect x={-60} y={120} width={2040} height={640} fill={MP.brick} />
        {Array.from({ length: 15 }, (_, r) => (
          <g key={r}>
            <line x1={-60} y1={120 + r * 44} x2={1980} y2={120 + r * 44} stroke={MP.brickDark} strokeWidth={3} />
            {Array.from({ length: 22 }, (_, k) => (
              <line key={k} x1={k * 96 + (r % 2) * 48 - 40} y1={120 + r * 44} x2={k * 96 + (r % 2) * 48 - 40} y2={164 + r * 44} stroke={MP.brickDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        <rect x={-60} y={100} width={2040} height={24} fill={MP.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 搬出口 (材料倉庫の中: 棚に銅線のコイルと板、床に材料の箱とパレット) */}
        <rect x={40} y={250} width={420} height={450} fill={MP.soot} stroke={KRP.ink} strokeWidth={7} />
        <rect x={30} y={236} width={440} height={24} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={60} y={380} width={380} height={12} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
        {[110, 190].map((cx) => (
          <g key={cx} transform={`translate(${cx} 380)`}>
            <ellipse cx={0} cy={-26} rx={34} ry={26} fill={MZH_COPPER} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={0} cy={-26} rx={24} ry={18} fill="none" stroke={MZH_COPPER_LIGHT} strokeWidth={3} />
            <ellipse cx={0} cy={-26} rx={12} ry={9} fill={MP.soot} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {[0, 1, 2].map((k) => <rect key={k} x={260 + k * 10} y={330 - k * 6} width={150} height={50 + k * 6} fill={k % 2 ? MP.brassDark : MP.brass} stroke={KRP.ink} strokeWidth={3} />)}
        <MzHCrate x={150} y={700} s={0.9} kind="spring" />
        <MzHPalletBars x={355} y={700} s={0.72} />
        {/* 木のプラットホーム */}
        <rect x={-60} y={700} width={1000} height={60} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, k) => <line key={k} x1={k * 130} y1={700} x2={k * 130} y2={760} stroke={MP.woodDark} strokeWidth={4} />)}
        <rect x={-60} y={760} width={2040} height={400} fill={KRP.grayDark} />
        <line x1={-60} y1={760} x2={1980} y2={760} stroke={KRP.ink} strokeWidth={5} />
        {/* 点線の影: 同じ金属で作られる物 (ヘルメット・飛行機の翼) */}
        <g opacity={0.85 * seg(f, 4, 16) * (1 - drive)} fill="none" stroke={KRP.white} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round">
          {/* ヘルメット (横から): 丸い鉢 + つば + あごひも */}
          <g transform="translate(1290 330)">
            <path d="M -130 0 Q -120 -150 0 -154 Q 120 -150 130 0 Z" />
            <path d="M -160 0 Q 0 20 160 0" />
            <path d="M -90 4 Q -60 70 0 76 Q 60 70 90 4" />
          </g>
          {/* 飛行機 (上から): 胴体・主翼・尾翼 */}
          <g transform="translate(1610 240) rotate(-12)">
            <path d="M -22 -150 Q 0 -190 22 -150 L 22 140 Q 0 160 -22 140 Z" />
            <path d="M -22 -30 L -210 30 L -210 60 L -22 40 M 22 -30 L 210 30 L 210 60 L 22 40" />
            <path d="M -22 110 L -80 140 L -80 156 L -22 146 M 22 110 L 80 140 L 80 156 L 22 146" />
          </g>
        </g>
        {/* トラック (荷台は板張り・運転台は右) */}
        <g transform={`translate(${tx} 0)`}>
          {/* 排気の煙 (走り出すと後ろへ) */}
          {f >= 56 && [0, 1, 2, 3].map((k) => {
            const a = ((f - 56 + k * 6) % 24) / 24;
            return <circle key={k} cx={890 - a * 160 - tx * 0.3} cy={790 - a * 60} r={14 + a * 30} fill={KRP.gray} opacity={(1 - a) * 0.8} />;
          })}
          <rect x={900} y={BED} width={640} height={36} fill={C.oliveDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={900} y={BED - 120} width={18} height={120} fill={C.olive} stroke={KRP.ink} strokeWidth={4} />
          {/* 荷台の材料 (時計は載せない): 鉄の棒・銅線の箱 */}
          <MzHCrate x={1010} y={BED} s={1} kind="iron" />
          <MzHCrate x={1220} y={BED} s={1} kind="copper" />
          {placed && <MzHCrate x={1430} y={BED} s={1} kind="brass" />}
          {/* 板張りの側板 (手前) */}
          <rect x={900} y={BED + 36} width={640} height={70} fill={C.olive} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => <line key={k} x1={900} y1={BED + 54 + k * 18} x2={1540} y2={BED + 54 + k * 18} stroke={C.oliveDark} strokeWidth={3} />)}
          {/* 運転台 */}
          <path d={`M 1540 ${BED + 106} L 1540 470 L 1720 470 L 1800 590 L 1830 ${BED + 106} Z`} fill={C.olive} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1580 500 L 1700 500 L 1760 590 L 1580 590 Z" fill={MP.morning} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1820} cy={700} r={18} fill={MP.glow} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1530} y={BED + 100} width={310} height={22} fill={C.oliveDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 白い星などの記号は描かない。車輪 */}
          {[1040, 1400, 1700].map((wx2) => (
            <g key={wx2} transform={`translate(${wx2} ${BED + 140}) rotate(${tx * 0.8})`}>
              <circle r={66} fill={MP.soot} stroke={KRP.ink} strokeWidth={6} />
              <circle r={30} fill={C.oliveDark} stroke={KRP.ink} strokeWidth={4} />
              <line x1={-24} y1={0} x2={24} y2={0} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
        </g>
        {/* 箱を運ぶ工員 (男性・ハンチング帽)。箱の中の真鍮の板を名残惜しそうに見る */}
        <Person x={wx} y={704} s={0.85} f={f} phase={2} pose={placed ? "stand" : "hold"} face={look > 0.3 || placed ? "sad" : "normal"}
          cloth={C.workKhaki} clothDark={C.workKhakiDark} hair="cap" gaze={[look * -4, look * 10]} lean={placed ? -4 : 2} />
        <MzHHunting x={wx} y={704} s={0.85} f={f} phase={2} lean={placed ? -4 : 2} />
        {!placed && <MzHCrate x={wx} y={694 + mzhBob(f, 2)} s={0.8} kind="brass" glint={glint} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #174 国が、目覚ましを止めました。
// 格: 山 / seed 6174
// 絵: どこ: 1942年のアメリカの家の寝室 (花柄の壁紙・窓の外に朝の町並み・木のナイトテーブル)。演出: ナイトテーブルの BellClock (ring=1) がジリリと鳴っている。寝ていたお父さん (紺の寝間着・短い黒髪・男性) が手を伸ばそうとした瞬間、**窓の外の空から雲を割って巨大な手** (星条旗などの記号は描かない。灰色のスーツの袖口の大きな手) がにゅっと部屋に入ってきて、BellClock のボタンを「バン!」と押す。衝撃でナイトテーブルが沈み、部屋全体がぶるっと揺れ、時計はぴたっと止まる。お父さんは手を伸ばしたまま固まり (face="surprised")、横で寝ていたお母さん (巻き髪・水玉のワンピース型の寝間着・女性) がその音で飛び起きる。動き: f0-30 時計が鳴る・お父さんが手を伸ばす / f30-55 巨大な手が窓から入る (カメラが少し引く) / f55 バン! (画面が一瞬揺れる・衝撃の線) / f60-120 静寂・2人が巨大な手を見上げる / f120-150 手が窓からすーっと戻っていく
// どこ: 1942年のアメリカの家の寝室。花柄の壁紙・右上の窓 (朝の空と雲・町の屋根)・木のナイトテーブル・ダブルベッド
// 演出: ナイトテーブルの BellClock がジリリ。お父さん (紺の寝間着・短い黒髪) が手を伸ばした瞬間、窓の外の雲を割って
//       灰色のスーツの袖の巨大な手がにゅっと入り、ボタンをバン! と押す。部屋が揺れ、時計はぴたっと止まる。
//       お父さんは手を伸ばしたまま固まり、横のお母さん (巻き髪・水玉) が飛び起きて2人で巨大な手を見上げる
// 動き: f0-10 鳴る・手を伸ばす / f8-24 雲が割れて手が入る / f26 バン (揺れ・衝撃線) / f28-60 静寂・見上げる / f58-76 手が戻っていく
const Mz174: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeOut(seg(f, 0, 10));
  const hin = easeInOut(seg(f, 8, 26));
  const hout = easeInOut(seg(f, 58, 76));
  const h = hin * (1 - hout);
  const bangT = seg(f, 26, 34);
  const bang = f >= 26 ? Math.sin(bangT * Math.PI) : 0;
  const ring = f < 26 ? 1 : 0;
  const shakeX = bang * Math.sin(f * 3) * 10, shakeY = bang * Math.cos(f * 2.3) * 6;
  const cloudSplit = easeOut(seg(f, 6, 18));
  const momUp = easeOut(seg(f, 28, 34));
  const cam = lerp(1.08, 1.0, easeInOut(seg(f, 8, 26)));
  // 巨大な手: 指先 (tip) が時計のボタンへ。袖は右上の窓の外へ伸びる
  const CX = 1250, CY = 640, CS = 0.72; // 時計の足元
  const tipX = lerp(1720, CX + 6, h), tipY = lerp(-120, CY - 150 * CS - 170 * CS + 6, h);
  const press = f >= 26 && h > 0.9 ? 1 : 0;
  const ang = 34; // 袖の向き (度)。右上の窓の外へ伸びる
  return (
    <Frame f={f} seed={6174}>
      <g transform={`translate(${shakeX + 960 * (1 - cam)} ${shakeY + 540 * (1 - cam)}) scale(${cam})`}>
        <MzHWallpaper seed={6174} y1={760} />
        {/* 窓 (外: 朝の空・割れる雲・町の屋根) */}
        <rect x={1180} y={70} width={520} height={400} fill={MP.morning} stroke={KRP.ink} strokeWidth={8} />
        {[[1290, 150], [1580, 140]].map(([cx, cy], k) => (
          <g key={k} transform={`translate(${(k ? 1 : -1) * cloudSplit * 90} 0)`}>
            <ellipse cx={cx} cy={cy} rx={110} ry={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={cx + (k ? -40 : 40)} cy={cy - 24} rx={60} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {cloudSplit > 0.1 && <ellipse cx={1440} cy={140} rx={60 * cloudSplit} ry={50 * cloudSplit} fill="#FFF6D8" opacity={0.8} />}
        <path d="M 1180 470 L 1180 380 L 1240 340 L 1300 380 L 1300 360 L 1380 360 L 1380 400 L 1450 350 L 1520 400 L 1560 370 L 1640 370 L 1640 410 L 1700 380 L 1700 470 Z" fill={C.houseYellow} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1440} y1={70} x2={1440} y2={470} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1180} y1={270} x2={1700} y2={270} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1160} y={466} width={560} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* カーテン (揺れで大きく揺れる) */}
        <path d={`M 1150 50 Q 1180 260 ${1210 + bang * 30} 500 L 1150 500 Z`} fill={C.flowerPink} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 1730 50 Q 1700 260 ${1690 - bang * 30} 500 L 1730 500 Z`} fill={C.flowerPink} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁の額と床 */}
        <rect x={420} y={150} width={220} height={170} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} transform={`rotate(${bang * 8} 530 150)`} />
        <rect x={440} y={170} width={180} height={130} fill={C.houseBlue} transform={`rotate(${bang * 8} 530 150)`} />
        <rect x={-60} y={760} width={2040} height={30} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={790} width={2040} height={360} fill={C.floorWood} />
        {[840, 920, 1020].map((yy) => <line key={yy} x1={-60} y1={yy} x2={1980} y2={yy} stroke={C.floorWoodDark} strokeWidth={4} />)}
        {/* ベッド (ヘッドボードは左) */}
        <rect x={200} y={420} width={40} height={400} rx={12} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={230} y={630} width={830} height={80} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={230} y={706} width={830} height={60} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1040} y={560} width={30} height={260} rx={10} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* お母さん (奥): 音で飛び起きる */}
        <MzHSleeper hx={640} hy={640} s={0.85} f={f} up={momUp} face="surprised" cloth={C.momRed} clothDark={C.momRedDark}
          woman="curl" dots phase={3} gaze={[8, -10]} />
        {/* お父さん (手前): 時計へ手を伸ばしたまま固まる */}
        <MzHSleeper hx={860} hy={640} s={0.9} f={f} up={0.3 + 0.7 * reach} maxAng={8} face={f >= 26 ? "surprised" : "worried"} pose="point"
          cloth={C.dadNavy} clothDark={C.dadNavyDark} phase={1} gaze={f >= 28 ? [10, -10] : [10, 0]} />
        {/* 掛け布団 */}
        <path d={`M 420 650 Q 700 ${600 + momUp * 10} 1050 640 L 1050 740 L 420 740 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 520 690 Q 700 670 900 700" fill="none" stroke={KRP.blue} strokeWidth={5} />
        {/* ナイトテーブル (バンで沈む) */}
        <g transform={`translate(0 ${bang * 18})`}>
          <rect x={1120} y={CY} width={260} height={30} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {[1150, 1330].map((lx) => <rect key={lx} x={lx} y={CY + 100} width={20} height={800 - CY - 100} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
          <rect x={1140} y={CY + 30} width={220} height={80} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1160} y={CY + 44} width={180} height={50} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1250} cy={CY + 69} r={8} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          <MzHClock x={CX} y={CY} s={CS} f={f} ring={ring} snooze press={press} />
        </g>
        {/* 衝撃の線 */}
        {bang > 0.05 && (
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={bang}>
            {[-150, -120, -60, -30, 30, 60, 210, 240].map((a) => {
              const r = (a * Math.PI) / 180;
              return <line key={a} x1={CX + Math.cos(r) * 200} y1={CY - 150 + Math.sin(r) * 200} x2={CX + Math.cos(r) * 270} y2={CY - 150 + Math.sin(r) * 270} />;
            })}
          </g>
        )}
        {bang > 0.05 && (
          <text x={CX - 300} y={CY - 330} fontFamily={FONT} fontWeight={900} fontSize={110} fill={KRP.red}
            stroke={KRP.white} strokeWidth={10} paintOrder="stroke" transform={`rotate(-10 ${CX - 300} ${CY - 330})`} opacity={bang}>バン!</text>
        )}
        {/* 静寂の「…」 */}
        {f >= 34 && f < 60 && <text x={860} y={330} fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.grayDark} opacity={seg(f, 34, 40)}>…</text>}
        {/* 巨大な手 (灰色のスーツの袖・白いカフス)。指先が時計のボタンを押す */}
        {h > 0.01 && (
          <g transform={`translate(${tipX} ${tipY}) rotate(${ang})`}>
            <rect x={-150} y={-1500} width={300} height={1280} fill={C.suitGray} stroke={KRP.ink} strokeWidth={8} />
            <line x1={-40} y1={-1500} x2={-40} y2={-240} stroke={C.suitGrayDark} strokeWidth={6} />
            <rect x={-130} y={-250} width={260} height={60} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={60} cy={-220} r={12} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            {/* こぶし + 人さし指 */}
            <rect x={-110} y={-200} width={220} height={150} rx={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
            <path d="M -70 -70 Q -80 -40 -50 -36 M -10 -60 Q -14 -36 14 -34 M 50 -64 Q 50 -40 76 -44" fill="none" stroke={KRP.ink} strokeWidth={5} />
            <rect x={-30} y={-80} width={56} height={84} rx={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
            <path d="M -16 -6 Q -2 4 12 -6" fill="none" stroke={KRP.ink} strokeWidth={4} />
            <path d="M 100 -150 Q 150 -130 120 -90 Q 100 -70 104 -110" fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #175 翌年には、金属を減らした、戦争用の目覚まし時計で、製造が再開されます。
// 格: 図 / seed 6175
// 絵: どこ: #171 の時計工場の作業台の上 (同じ天窓の光・黒板に年代札「1943年」)。作業台を見下ろす俯瞰。演出: 左に戦前の BellClock (ふつうの真鍮色)、右に戦争用の BellClock (同じ形だが、金属の部分が少なく外枠がくすんだ別の色)。それぞれの手前に、使う金属の部品を山にして並べる。左の山は大きく、右の山はぐっと小さい (山の差で金属が減ったことを見せる)。工員の女性 (頭にスカーフ・長い茶髪を後ろで結ぶ・スカート) が、右の時計のゼンマイのつまみを巻いて耳を当て、カチカチ動くのを確かめてにっこり (face="smile"、腕は2本 pose で描く)。そのうしろでコンベアがまたゆっくり動きだす。動き: f0-30 カメラが2つの時計の上から寄る / f30-70 部品の山が左右で比べられるように光る / f70-110 女性がつまみを巻く・耳を当てる / f110-140 コンベアが動きだす
// どこ: #171 の時計工場。高い位置から作業台を見下ろす。奥に同じ天窓の光・黒板 (年代札1943年)・止まっていたコンベア
// 演出: 作業台の左に戦前の BellClock (赤と真鍮)、右に戦争用 (同じ形で本体がくすんだ色)。手前にそれぞれが使う金属部品の山。
//       左の山は大きく、右の山はぐっと小さい (光って見くらべ)。工員の女性 (スカーフ・結んだ茶髪) が右の時計のつまみを巻き、耳を当ててにっこり。
//       奥のコンベアがまたゆっくり動きだす
// 動き: f0-30 カメラが上から寄る / f16-40 部品の山が光る・札 / f40-60 つまみを巻く / f56- 耳を当ててにっこり (カチカチ) / f60- コンベアが動きだす
type MzHPart = { k: "bell" | "plate" | "gear" | "spring"; x: number; y: number; r: number };
const MZH175_BIG: MzHPart[] = [
  { k: "plate", x: -120, y: 0, r: -6 }, { k: "plate", x: 60, y: 4, r: 8 }, { k: "plate", x: -20, y: -18, r: 2 },
  { k: "gear", x: -150, y: -26, r: 0 }, { k: "gear", x: 130, y: -20, r: 20 }, { k: "bell", x: -70, y: -46, r: -10 },
  { k: "bell", x: 70, y: -50, r: 12 }, { k: "spring", x: 0, y: -60, r: 0 }, { k: "gear", x: -10, y: -88, r: 10 },
  { k: "plate", x: 150, y: -60, r: -14 }, { k: "bell", x: -120, y: -84, r: -4 }, { k: "spring", x: 100, y: -100, r: 0 },
  { k: "gear", x: 40, y: -124, r: 30 }, { k: "bell", x: -40, y: -140, r: 6 },
];
const MZH175_SMALL: MzHPart[] = [
  { k: "plate", x: -40, y: 0, r: 4 }, { k: "gear", x: 40, y: -6, r: 0 }, { k: "spring", x: -10, y: -34, r: 0 },
];
const MzHPartPile: React.FC<{ x: number; y: number; parts: MzHPart[]; glow: number; f: number }> = ({ x, y, parts, glow, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={14} rx={parts.length > 5 ? 220 : 110} ry={22} fill={KRP.ink} opacity={0.18} />
    {glow > 0.01 && <ellipse cx={0} cy={-50} rx={parts.length > 5 ? 240 : 120} ry={parts.length > 5 ? 130 : 70} fill={MP.glow} opacity={glow * (0.45 + 0.1 * Math.sin(f / 4))} />}
    {parts.map((p, i) => (
      <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
        {p.k === "plate" && <rect x={-56} y={-14} width={112} height={28} rx={4} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={4} />}
        {p.k === "bell" && (
          <g>
            <path d="M -38 12 A 38 38 0 0 1 38 12 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -20 -6 A 20 14 0 0 1 4 -18" stroke={MP.brassLight} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {p.k === "gear" && (
          <g>
            {Array.from({ length: 10 }, (_, t) => (
              <rect key={t} x={-6} y={-36} width={12} height={12} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${t * 36})`} />
            ))}
            <circle r={28} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle r={8} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {p.k === "spring" && (
          <path d="M 0 0 m -6 0 a 6 6 0 1 1 12 0 a 12 12 0 1 1 -24 0 a 18 18 0 1 1 36 0 a 24 24 0 1 1 -48 0" fill="none" stroke={C.steel} strokeWidth={5} />
        )}
      </g>
    ))}
  </g>
);
const Mz175: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1.12, 1.0, easeInOut(seg(f, 0, 30)));
  const glow = seg(f, 16, 28) * (1 - seg(f, 70, 90) * 0.6);
  const label = seg(f, 20, 32);
  const wind = seg(f, 40, 60);
  const ear = easeOut(seg(f, 56, 68));
  const beltSpeed = seg(f, 60, 100);
  const belt = beltSpeed > 0 ? (f - 60) * 3 * beltSpeed : 0;
  const LX = 600, RX = 1200, BY = 650, CS = 0.72;
  const WX = lerp(1450, 1420, ear), WY = 660;
  const PLATE_Y = 250;
  return (
    <Frame f={f} seed={6175}>
      <g transform={`translate(${960 * (1 - sc)} ${600 * (1 - sc)}) scale(${sc})`}>
        {/* 奥の壁 (しっくい・れんが)・天窓の光 */}
        <rect x={-60} y={-60} width={2040} height={600} fill={MP.mortar} />
        <rect x={-60} y={-60} width={2040} height={70} fill={C.steel} />
        {Array.from({ length: 7 }, (_, k) => <rect key={k} x={k * 300 - 20} y={-40} width={200} height={44} fill={MP.morning} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={-60} y={300} width={2040} height={240} fill={MP.brick} />
        {Array.from({ length: 6 }, (_, r) => (
          <line key={r} x1={-60} y1={300 + r * 40} x2={1980} y2={300 + r * 40} stroke={MP.brickDark} strokeWidth={3} />
        ))}
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M ${k * 520 + 40} 0 L ${k * 520 + 200} 0 L ${k * 520 + 420} 900 L ${k * 520 + 160} 900 Z`} fill={C.sunBeam} opacity={0.18} />
        ))}
        {/* 黒板 (1943年) */}
        <g transform="translate(1340 0)">
          <rect x={70} y={60} width={420} height={200} rx={6} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={6} />
          <rect x={86} y={76} width={388} height={168} fill={C.board} />
          <TagPlate x={226} y={140} text="1943年" size={38} />
          <path d="M 120 210 q 60 -10 120 0 M 300 200 q 50 6 140 -4" stroke={KRP.white} strokeWidth={3} opacity={0.3} fill="none" />
        </g>
        {/* 奥のコンベア (また動きだす) */}
        <rect x={-60} y={440} width={2040} height={26} fill={C.belt} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 40 }, (_, k) => (
          <line key={k} x1={((k * 52 + belt) % 2080) - 60} y1={444} x2={((k * 52 + belt) % 2080) - 50} y2={462} stroke={C.beltLight} strokeWidth={4} />
        ))}
        <rect x={-60} y={466} width={2040} height={16} fill={C.steelLight} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, k) => (
          <MzHClock key={k} x={((k * 260 + belt) % 2080) - 60} y={442} s={0.2} f={f} dull />
        ))}
        {beltSpeed > 0.05 && (
          <g stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={beltSpeed}>
            <line x1={160} y1={420} x2={110} y2={420} /><line x1={980} y1={420} x2={930} y2={420} />
          </g>
        )}
        {/* 女性 (作業台の奥に立つ。台に隠れて腰から下は見えない) */}
        <MzHPonytail x={WX} y={WY} s={1.1} f={f} phase={2} lean={-ear * 16} color={C.hairBrown} side={1} />
        <Person x={WX} y={WY} s={1.1} f={f} phase={2} pose="hold" lean={-ear * 16} face={ear > 0.5 ? "smile" : "normal"}
          cloth={C.momRed} clothDark={C.momRedDark} hair="none" gaze={[-10, 6]} />
        <MzHScarf x={WX} y={WY} s={1.1} f={f} phase={2} lean={-ear * 16} />
        {/* 工場の床 (作業台のまわり) */}
        <rect x={-60} y={540} width={2040} height={600} fill={KRP.grayDark} />
        {/* 作業台 (木の天板を上から) */}
        <path d="M 60 560 L 1860 560 L 1960 1000 L -40 1000 Z" fill={MP.woodLight} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 6 }, (_, k) => (
          <path key={k} d={`M ${-40 + k * 10} ${620 + k * 70} Q 960 ${610 + k * 70 + (k % 2) * 14} ${1960 - k * 10} ${620 + k * 70}`} fill="none" stroke={MP.wood} strokeWidth={5} opacity={0.7} />
        ))}
        {/* ドライバー・油さし (台の小物) */}
        <g transform="translate(240 760) rotate(-20)">
          <rect x={-70} y={-10} width={80} height={20} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <rect x={10} y={-4} width={80} height={8} fill={C.steelLight} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="translate(1700 740)">
          <path d="M -40 0 L 40 0 L 30 -60 L -30 -60 Z" fill={C.olive} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 10 -60 L 70 -120" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 左: 戦前の時計と大きな山 / 右: 戦争用と小さな山 */}
        <MzHClock x={LX} y={BY} s={CS} f={f} />
        <MzHClock x={RX} y={BY} s={CS} f={f} dull rot={ear > 0.5 ? Math.sin(f / 2) * 1.5 : 0} />
        <MzHPartPile x={LX} y={800} parts={MZH175_BIG} glow={glow} f={f} />
        <MzHPartPile x={RX} y={800} parts={MZH175_SMALL} glow={glow} f={f} />
        <TagPlate x={LX} y={PLATE_Y} text="戦前" size={42} t={label} />
        <TagPlate x={RX} y={PLATE_Y} text="戦争用" size={42} t={label} />
        {/* 巻いているつまみの回転線と、カチカチの印 */}
        {wind > 0 && wind < 1 && (
          <path d={`M ${RX + 150 * CS * 0.9} ${BY - 150 * CS - 120 * CS} a 34 34 0 1 1 -10 -30`} fill="none" stroke={KRP.ink} strokeWidth={5}
            strokeLinecap="round" transform={`rotate(${f * 20} ${RX + 100} ${BY - 210})`} />
        )}
        {ear > 0.5 && [0, 1].map((k) => (
          <text key={k} x={RX - 160 + k * 300} y={BY - 280 - ((f + k * 6) % 12)} fontFamily={FONT} fontWeight={900} fontSize={34}
            fill={KRP.ink} opacity={0.4 + 0.6 * (((f + k * 6) % 12) < 6 ? 1 : 0)}>カチ</text>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #176 戦争中でも、人を起こさないわけには、いかなかったのです。
// 格: 山 / seed 6176
// 絵: どこ: 1943年ごろのアメリカの工場の町の夜明け。木造の家々と、その向こうに工場の門と煙突 (KoujouMon ではなくアメリカの工場。門の上に時計)。演出: 手前の家の寝室の窓の中で、戦争用の BellClock (ring=1) が鳴り、お母さん (巻き髪・水玉のワンピース・女性) とお父さん (紺の作業着・短い黒髪・男性) が同時に起き上がる。カメラがそのまま窓から外へ引いて上へ上がると、町じゅうの窓から同じジリリの音の線が出ていて、人々 (男女を混ぜる。女性は頭にスカーフと長いスカートかズボンの作業着、男性はハンチング帽) がお弁当箱を下げて一斉に工場の門へ歩いていく。門の上の時計が始業前を指す。最後尾で子ども (小さく頭大きめ) が手を振って見送る。動き: f0-40 時計が鳴る・夫婦が起きる / f40-100 カメラが窓から引いて上へ / f80-150 人の列が門へ歩く・煙突の煙 / 子どもが手を振る
// どこ: 1943年ごろのアメリカの工場の町の夜明け。手前の木造の家の2階の窓・並ぶ家々・奥のれんがの工場 (煙突2本・門の上の時計は始業前)
// 演出: 手前の家の窓の中で戦争用の BellClock が鳴り、お母さん (巻き髪・水玉) とお父さん (紺の作業着・短い黒髪) が同時に起き上がる。
//       カメラが窓から引いて上がると、町じゅうの窓からジリリの線。男女 (女性=スカーフ+スカート / 男性=ハンチング帽) が弁当箱を下げて工場の門へ列になって歩く。
//       最後尾で子どもが手を振って見送る
// 動き: f0-12 窓の中で鳴る・夫婦が起きる / f12-40 カメラが引いて上がる / f0- 人の列が門へ / 煙突の煙 / 子どもが手を振る
const MzHWalker: React.FC<{ x: number; y: number; s: number; f: number; woman: boolean; phase: number }> = ({ x, y, s, f, woman, phase }) => {
  const step = Math.sin((f + phase * 7) / 4) * 3;
  const w = { x, y, s, f, phase, lean: step };
  return (
    <g>
      {woman && <MzHPonytail {...w} color={C.hairBrown} side={-1} />}
      <Person x={x} y={y} s={s} f={f} phase={phase} lean={step} face="normal" gaze={[8, 0]}
        cloth={woman ? C.momRed : C.workBlue} clothDark={woman ? C.momRedDark : C.workBlueDark} hair={woman ? "none" : "cap"} />
      {woman ? <MzHSkirt {...w} color={C.momRedDark} /> : null}
      {woman ? <MzHScarf {...w} color={KRP.blueDeep} /> : <MzHHunting {...w} />}
      {/* 弁当箱 (右手に下げる) */}
      <g transform={`translate(${x + 67 * s} ${y - 60 * s}) scale(${s})`}>
        <path d="M -14 0 Q 0 -20 14 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-30} y={0} width={60} height={40} rx={8} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-30} y1={14} x2={30} y2={14} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </g>
  );
};
const Mz176: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 12, 40));
  const sc = lerp(3, 1, z);
  const cx = lerp(370, 960, z), cy = lerp(470, 540 + 0, z);
  const up = easeOut(seg(f, 4, 10));
  const ringT = f < 70 ? 1 : 0;
  const GATE: [number, number] = [1440, 600];
  return (
    <Frame f={f} seed={6176}>
      <g transform={`translate(${960 - cx * sc} ${540 - cy * sc}) scale(${sc})`}>
        {/* 夜明けの空 */}
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} x={-60} y={-60 + k * 90} width={2040} height={92} fill={mixColor("#6E79B0", MP.dawn, k / 7)} />
        ))}
        <circle cx={1000} cy={560} r={90} fill="#FFD27A" />
        {/* 奥: れんがの工場 (煙突・のこぎり屋根・門と時計) */}
        <g>
          {[1240, 1680].map((chx, k) => (
            <g key={chx}>
              <rect x={chx} y={150} width={60} height={330} fill={MP.brickDark} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2, 3].map((j) => {
                const a = ((f + j * 15 + k * 8) % 60) / 60;
                return <circle key={j} cx={chx + 30 + a * 120} cy={130 - a * 110} r={22 + a * 40} fill={KRP.gray} opacity={(1 - a) * 0.75} />;
              })}
            </g>
          ))}
          <path d="M 1120 380 L 1200 320 L 1200 380 L 1280 320 L 1280 380 L 1360 320 L 1360 380 L 1440 320 L 1440 380 L 1520 320 L 1520 380 L 1600 320 L 1600 380 L 1680 320 L 1680 380 L 1840 380 L 1840 600 L 1120 600 Z"
            fill={MP.brick} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 7 }, (_, k) => (
            <rect key={k} x={1150 + k * 95} y={420} width={60} height={70} fill={k % 2 ? MP.glow : MP.dawnSoft} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 門と時計 (始業前を指す) */}
          <rect x={GATE[0] - 120} y={500} width={30} height={110} fill={MP.stone} stroke={KRP.ink} strokeWidth={5} />
          <rect x={GATE[0] + 90} y={500} width={30} height={110} fill={MP.stone} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${GATE[0] - 120} 500 Q ${GATE[0]} 450 ${GATE[0] + 120} 500`} fill="none" stroke={MP.iron} strokeWidth={10} />
          <g transform={`translate(${GATE[0]} 440)`}>
            <circle r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${300 + f * 0.2})`} />
            <line x1={0} y1={0} x2={0} y2={-20} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(204)" />
          </g>
        </g>
        {/* 中: 並ぶ木造の家 (窓からジリリ) */}
        {[0, 1, 2, 3].map((k) => {
          const hx = 640 + k * 130 - (k > 1 ? 0 : 0);
          return (
            <g key={k}>
              <path d={`M ${hx - 10} ${450 - k * 6} L ${hx + 60} ${390 - k * 6} L ${hx + 130} ${450 - k * 6} Z`} fill={k % 2 ? C.roofGray : C.roofRed} stroke={KRP.ink} strokeWidth={4} />
              <rect x={hx} y={450 - k * 6} width={120} height={170 + k * 6} fill={[C.houseWhite, C.houseYellow, C.houseBlue, C.housePink][k]} stroke={KRP.ink} strokeWidth={4} />
              <rect x={hx + 20} y={480 - k * 6} width={30} height={34} fill={MP.glow} stroke={KRP.ink} strokeWidth={3} />
              <rect x={hx + 70} y={480 - k * 6} width={30} height={34} fill={MP.glow} stroke={KRP.ink} strokeWidth={3} />
              <MzHRingLines x={hx + 60} y={497 - k * 6} s={0.4} f={f + k * 3} t={ringT} />
            </g>
          );
        })}
        {/* 道 (手前左から奥の門へ) と歩道 */}
        <rect x={-60} y={620} width={2040} height={500} fill={C.grass} />
        {Array.from({ length: 9 }, (_, k) => (
          <path key={k} d={`M ${k * 230 + 40} ${700 + (k % 3) * 90} l 8 -18 l 8 18 l 8 -14 l 6 14`} fill="none" stroke={C.grassDark} strokeWidth={4} />
        ))}
        <path d={`M 560 1100 L 1100 1100 L ${GATE[0] + 90} 610 L ${GATE[0] - 90} 610 Z`} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 830 1100 L ${GATE[0]} 610`} stroke={KRP.white} strokeWidth={6} strokeDasharray="30 26" />
        <rect x={-60} y={620} width={2040} height={20} fill={C.grassDark} />
        {/* 人の列 (男女交互・弁当箱) */}
        {Array.from({ length: 8 }, (_, i) => {
          const t = clamp01(0.92 - i * 0.12 + f * 0.0028);
          const px = lerp(800, GATE[0] - 10, t), py = lerp(880, 620, t);
          const ps = lerp(0.42, 0.12, t);
          if (t >= 0.99) return null;
          return <MzHWalker key={i} x={px} y={py} s={ps} f={f} woman={i % 2 === 1} phase={i} />;
        }).reverse()}
        {/* 最後尾の子ども: 手を振って見送る */}
        <Person x={770} y={862} s={0.32} f={f} phase={9} pose={Math.floor(f / 8) % 2 ? "raise" : "banzai"} face="joy" cloth={KRP.yellow} clothDark={KRP.orange} hair="cap" />
        {/* 手前: 家 (2階の寝室の窓の中で夫婦が起きる) */}
        <g>
          <path d="M 40 330 L 360 170 L 680 330 Z" fill={C.roofGray} stroke={KRP.ink} strokeWidth={7} />
          <rect x={80} y={330} width={560} height={540} fill={C.houseWhite} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 12 }, (_, k) => <line key={k} x1={80} y1={360 + k * 42} x2={640} y2={360 + k * 42} stroke={MP.mist} strokeWidth={4} />)}
          {/* 窓の中: 寝室の壁 */}
          <rect x={200} y={370} width={340} height={230} fill={C.paperWall} />
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={230 + k * 90} cy={400} r={7} fill={C.flowerPink} />)}
          {/* ベッドの頭板 */}
          <rect x={300} y={520} width={200} height={80} rx={10} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {/* お母さん (左) とお父さん (右) が同時に起き上がる */}
          <MzHSleeper hx={360} hy={590} s={0.3} f={f} up={up} face="surprised" cloth={C.momRed} clothDark={C.momRedDark} woman="curl" dots phase={3} gaze={[-8, -4]} />
          <MzHSleeper hx={450} hy={590} s={0.3} f={f} up={up} face="surprised" cloth={C.dadNavy} clothDark={C.dadNavyDark} phase={1} gaze={[-8, -4]} dir={-1} />
          <path d="M 310 575 Q 400 560 510 575 L 520 600 L 300 600 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          {/* 窓辺の戦争用の時計 (鳴る) */}
          <MzHClock x={248} y={598} s={0.17} f={f} ring={ringT} dull />
          {/* 窓枠・カーテン・窓台 */}
          <rect x={200} y={370} width={340} height={230} fill="none" stroke={KRP.ink} strokeWidth={8} />
          <path d="M 196 366 Q 220 480 214 604 L 196 604 Z" fill={C.flowerPink} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 544 366 Q 520 480 526 604 L 544 604 Z" fill={C.flowerPink} stroke={KRP.ink} strokeWidth={4} />
          <rect x={186} y={598} width={368} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {/* 1階の玄関と窓 */}
          <rect x={430} y={700} width={110} height={170} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={150} y={690} width={180} height={110} fill={MP.glow} stroke={KRP.ink} strokeWidth={5} />
          <line x1={240} y1={690} x2={240} y2={800} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #177 そして目覚まし時計は、ある方向へ、進化します。
// 格: 並 / seed 6177
// 絵: どこ: 1950年代はじめのアメリカの時計屋のショーウィンドウ (金の縁取りのガラス・夜の通りの明かりが映り込む・値札のない展示台)。演出: 展示台の上に、古い順に左から目覚まし時計が並ぶ (鉄の壁掛け時計の小さな模型 → ゼンマイ式の卓上時計 → BellClock → 戦争用の BellClock)。いちばん右の空いた展示台に、白い布をかぶせた「次の時計」があって、布の下から小さく「?」の光がもれている。布の上のところだけが、ボタンのような出っぱりの形にぽこっと盛り上がっている (スヌーズボタンの予告)。ウィンドウの外から通りがかりの男性 (帽子とコート) が顔を近づけて首をかしげる (face="worried")。動き: f0-50 カメラが左から右へ時計を順にパン / f50-80 布の山に寄る / f80-110 布の下の「?」が明滅・男性が首をかしげる
// どこ: 1950年代はじめのアメリカの時計屋のショーウィンドウ (夜)。金の縁取りのガラス・えんじのビロードの背景・木の展示台の段・ガラスに映る通りの明かり
// 演出: 左から古い順に、鉄の壁掛け時計の小さな模型 → ゼンマイの卓上時計 → BellClock → 戦争用の BellClock。間に進化の矢印。
//       いちばん右の台には白い布をかぶった「次の時計」。布の上がボタンの形にぽこっと盛り上がり、布の下から「?」の光がもれる。
//       ガラスの外の男性 (中折れ帽・コート) が顔を近づけて首をかしげる
// 動き: f0-26 カメラが左から右へパン / f26-42 引いて全体 / f30- 「?」が明滅・男性が首をかしげる / f50-110 布の山に寄る
const Mz177: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 26));
  const back = easeInOut(seg(f, 26, 42));
  const push = easeInOut(seg(f, 50, 110));
  const sc0 = lerp(1.3, 1.0, back);
  const sc = sc0 * lerp(1, 1.25, push);
  const fx = lerp(lerp(300, 1300, pan), 960, back);
  const cx = lerp(fx, 1330, push), cy = lerp(540, 560, push);
  const qBlink = 0.45 + 0.55 * Math.abs(Math.sin(f / 7));
  const tilt = seg(f, 30, 40) * (14 + Math.sin(f / 10) * 3);
  const PY = 640; // 展示台の天板
  const items = [230, 500, 770, 1040, 1330];
  return (
    <Frame f={f} seed={6177}>
      <g transform={`translate(${960 - cx * sc} ${540 - cy * sc}) scale(${sc})`}>
        {/* ビロードの背景とスポットライト */}
        <rect x={-200} y={-100} width={2320} height={1300} fill={C.velvet} />
        {Array.from({ length: 16 }, (_, k) => (
          <path key={k} d={`M ${k * 140 - 120} -100 Q ${k * 140 - 100} 300 ${k * 140 - 120} 700`} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.18} />
        ))}
        {items.map((ix, i) => (
          <path key={ix} d={`M ${ix - 40} -100 L ${ix + 40} -100 L ${ix + 150} ${PY} L ${ix - 150} ${PY} Z`} fill={MP.glow} opacity={i === 4 ? 0.3 : 0.14} />
        ))}
        {/* 展示台 (段) */}
        {items.map((ix, i) => (
          <g key={ix}>
            <rect x={ix - 120} y={PY} width={240} height={40} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
            <rect x={ix - 100} y={PY + 40} width={200} height={300} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={ix - 70} y={PY + 70} width={140} height={14} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={3} />
            {i < 4 && <Arrow x={ix + 165} y={PY - 70} s={0.42} t={seg(f, 6 + i * 6, 14 + i * 6)} color={C.goldTrim} />}
          </g>
        ))}
        {/* 1: 鉄の壁掛け時計の小さな模型 (鉄の枠・上に鐘・おもり) */}
        <g transform={`translate(${items[0]} ${PY})`}>
          <rect x={-20} y={-40} width={40} height={40} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -60 -100 L 60 -100 L 60 -220 Q 0 -270 -60 -220 Z" fill="none" stroke={MP.iron} strokeWidth={12} />
          <circle cx={0} cy={-170} r={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-170} x2={0} y2={-200} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -24 -262 A 24 24 0 0 1 24 -262 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-262} x2={0} y2={-246} stroke={MP.iron} strokeWidth={6} />
          {[-30, 30].map((wx) => (
            <g key={wx}>
              <line x1={wx} y1={-100} x2={wx} y2={-60 + Math.sin(f / 15 + wx) * 3} stroke={KRP.ink} strokeWidth={3} strokeDasharray="5 4" />
              <rect x={wx - 9} y={-60 + Math.sin(f / 15 + wx) * 3} width={18} height={34} rx={4} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          <line x1={0} y1={-130} x2={Math.sin(f / 8) * 22} y2={-60} stroke={MP.brassDark} strokeWidth={5} />
        </g>
        {/* 2: ゼンマイ式の卓上時計 (木の丸屋根の箱) */}
        <g transform={`translate(${items[1]} ${PY})`}>
          <path d="M -80 0 L -80 -150 Q -80 -240 0 -244 Q 80 -240 80 -150 L 80 0 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-140} r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, k) => <line key={k} x1={0} y1={-190} x2={0} y2={-180} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${k * 30} 0 -140)`} />)}
          <line x1={0} y1={-140} x2={0} y2={-180} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 0.6} 0 -140)`} />
          <line x1={0} y1={-140} x2={24} y2={-140} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <rect x={-60} y={-60} width={120} height={36} rx={4} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-100} y={-6} width={200} height={14} rx={4} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 3・4: ベル式 (ふつう / 戦争用) */}
        <MzHClock x={items[2]} y={PY} s={0.62} f={f} />
        <MzHClock x={items[3]} y={PY} s={0.62} f={f} dull />
        {/* 5: 白い布をかぶった次の時計 (上にボタンの形の出っぱり・下から「?」の光) */}
        <g transform={`translate(${items[4]} ${PY})`}>
          <ellipse cx={0} cy={-120} rx={150} ry={130} fill={MP.glow} opacity={0.35 * qBlink} />
          <path d={`M -120 0 Q -130 -60 -100 -150 Q -84 -214 -40 -226 L -36 -246 Q 0 ${-262 - Math.sin(f / 6) * 3} 36 -246 L 40 -226 Q 84 -214 100 -150 Q 130 -60 120 0 Q 60 -14 0 0 Q -60 -14 -120 0 Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -80 -20 Q -86 -100 -60 -170 M 70 -24 Q 84 -110 56 -180 M 0 -10 Q -10 -90 10 -200" fill="none" stroke={KRP.gray} strokeWidth={4} />
          <g opacity={0.35 + 0.65 * qBlink}><QMark x={0} y={-80} s={0.9} f={f} t={seg(f, 14, 24)} color={MP.dawn} /></g>
        </g>
        {/* ガラスに映る通りの明かり (斜めの光の筋とぼけた丸) */}
        <g opacity={0.5}>
          {[[200, 0.9], [900, 0.7], [1500, 1]].map(([gx, o], k) => (
            <path key={k} d={`M ${gx} -100 L ${gx + 60} -100 L ${gx - 240} 1200 L ${gx - 300} 1200 Z`} fill={KRP.white} opacity={(o as number) * 0.25} />
          ))}
          {[[640, 160, 40], [1180, 120, 30], [1620, 220, 50]].map(([bx, by, r], k) => (
            <circle key={k} cx={bx} cy={by} r={r + Math.sin(f / 13 + k) * 3} fill={MP.glow} opacity={0.4} />
          ))}
        </g>
        {/* ガラスの外の男性: 顔を近づけて首をかしげる */}
        <g>
          <Person x={1720} y={960} s={1.0} f={f} phase={4} face="worried" lean={-tilt} gaze={[-12, 2]} cloth={C.suitGray} clothDark={C.suitGrayDark} hair="cap" />
          <MzHFedora x={1720} y={960} s={1.0} f={f} phase={4} lean={-tilt} color={MP.woodDark} />
          {/* 顔が近づいたガラスのくもり */}
          <ellipse cx={1590} cy={760} rx={46} ry={30} fill={KRP.white} opacity={0.35 * seg(f, 34, 44)} />
        </g>
        {/* 金の縁取り (ウィンドウの枠) */}
        <rect x={0} y={0} width={1920} height={1080} fill="none" stroke={C.goldTrim} strokeWidth={44} />
        <rect x={22} y={22} width={1876} height={1036} fill="none" stroke={KRP.ink} strokeWidth={6} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #178 1955年、アメリカで、こんな特許が認められました。
// 格: 図 / seed 6178
// 絵: どこ: 1955年の特許の役所の机の上 (緑のデスクマット・インク壺・木の書類箱・天井の扇風機の影が机を横切る)。年代札「1955年」。演出: 机の真ん中に大きな特許の書類 (クリーム色の厚い紙に、時計の図面の線画・番号の線・赤い封蝋のような丸い印。会社名や人名は書かない、字は波線)。書類の端を押さえた役人の手 (腕は2本 pose で描く) が、大きな承認のスタンプを持ち上げ、「ドン」と押す。その瞬間、書類の図面の中の線画の時計がぴくっと動き、図面の線のベルが一度だけ揺れる。インク壺がスタンプの衝撃でちょっと跳ねる。動き: f0-30 カメラが机の上から書類へ寄る / f30-60 スタンプが持ち上がる / f60 ドン (書類が少し浮く) / f60-100 図面の時計がぴくっ・ベルが揺れる / 扇風機の影がゆっくり回る
// どこ: 1955年の特許の役所の机を真上から。緑のデスクマット・インク壺・木の書類箱・卓上カレンダー (年代札1955年)・天井の扇風機の影
// 演出: 真ん中に特許の書類 (クリーム色の厚紙・青い線の時計の図面・番号の引き出し線・赤い封蝋・字は波線)。
//       左手が書類の端を押さえ、右手が大きなスタンプを持ち上げて「ドン」。図面の時計がぴくっと動き、線のベルが揺れる。インク壺が跳ねる
// 動き: f0-24 カメラが書類へ寄る / f8-24 スタンプが持ち上がる / f28 ドン (書類が浮く) / f28-44 図面の時計がぴくっ・ベルが揺れる / 扇風機の影が回る
// 特許の図面の時計 (青い線画。スヌーズボタン付き)。jolt: ぴくっ (0〜1)
const MzHPatentClock: React.FC<{ x: number; y: number; s: number; jolt: number; f: number; button?: number }> = ({ x, y, s, jolt, f, button = 0 }) => {
  const wob = jolt > 0 ? Math.sin(f * 2.2) * 10 * jolt : 0;
  return (
    <g transform={`translate(${x} ${y - jolt * 10}) rotate(${wob * 0.3}) scale(${s})`} fill="none" stroke={C.patentLine} strokeWidth={5} strokeLinecap="round">
      {/* ベル (揺れる) */}
      <g transform={`rotate(${-wob} -70 -110)`}><path d="M -120 -100 A 50 50 0 0 1 -20 -130 Z" /></g>
      <g transform={`rotate(${wob} 70 -110)`}><path d="M 20 -130 A 50 50 0 0 1 120 -100 Z" /></g>
      <line x1={0} y1={-112} x2={0} y2={-150} />
      {/* スヌーズボタン */}
      <rect x={-50} y={-138 + button * 8} width={100} height={22} rx={8} fill={C.patent} />
      {/* 本体・文字盤 */}
      <circle r={112} />
      <circle r={92} strokeDasharray="4 8" />
      {Array.from({ length: 12 }, (_, k) => <line key={k} x1={0} y1={-80} x2={0} y2={-68} transform={`rotate(${k * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-64} />
      <line x1={0} y1={0} x2={40} y2={0} />
      {/* 脚と内部の歯車 (点線) */}
      <line x1={-60} y1={92} x2={-90} y2={150} /><line x1={60} y1={92} x2={90} y2={150} />
      <circle cx={30} cy={40} r={26} strokeDasharray="6 6" />
      <circle cx={-34} cy={34} r={18} strokeDasharray="6 6" />
    </g>
  );
};
const Mz178: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1, 1.08, easeInOut(seg(f, 0, 24)));
  const lift = easeOut(seg(f, 8, 24)) * (1 - seg(f, 24, 28));
  const don = f >= 28;
  const hit = Math.sin(seg(f, 28, 36) * Math.PI);
  const jolt = seg(f, 28, 30) * (1 - seg(f, 30, 46));
  const fan = f * 3;
  const SX = 1220, SY = 620; // スタンプを押す位置
  const after = easeOut(seg(f, 32, 42)); // 押したあと、スタンプが右上へどく
  return (
    <Frame f={f} seed={6178}>
      <g transform={`translate(${960 * (1 - sc)} ${480 * (1 - sc)}) scale(${sc})`}>
        {/* 木の机とデスクマット */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={MP.woodDark} />
        {Array.from({ length: 9 }, (_, k) => (
          <path key={k} d={`M -60 ${k * 130} q 500 ${rnd(6178, k) * 30 - 15} 1000 0 q 500 ${rnd(6179, k) * 30 - 15} 1040 0`} fill="none" stroke={MP.wood} strokeWidth={5} opacity={0.5} />
        ))}
        <rect x={160} y={60} width={1600} height={1000} rx={10} fill={C.deskMat} stroke={KRP.ink} strokeWidth={7} />
        <rect x={184} y={84} width={1552} height={952} rx={6} fill="none" stroke={C.deskMatDark} strokeWidth={5} />
        {/* 卓上カレンダー (年代札) */}
        <g transform="translate(340 250) rotate(-4)">
          <rect x={-130} y={-50} width={260} height={130} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-130} y={-50} width={260} height={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 14 }, (_, k) => <rect key={k} x={-110 + (k % 7) * 32} y={30 + Math.floor(k / 7) * 22} width={16} height={10} fill={KRP.gray} />)}
        </g>
        <TagPlate x={340} y={270} text="1955年" size={38} rot={-4} />
        {/* インク壺とペン (ドンで跳ねる) */}
        <g transform={`translate(340 ${520 - hit * 26}) rotate(${hit * 10})`}>
          <ellipse cx={0} cy={hit * 26 + 10} rx={70} ry={20} fill={KRP.ink} opacity={0.25} />
          <rect x={-60} y={-60} width={120} height={100} rx={18} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <rect x={-30} y={-84} width={60} height={30} rx={6} fill={KRP.ink} />
          <rect x={-60} y={-20} width={120} height={40} fill={C.board} opacity={0.6} />
        </g>
        <g transform="translate(320 720) rotate(30)">
          <rect x={-120} y={-10} width={200} height={20} rx={10} fill={KRP.ink} />
          <path d="M 80 -10 L 130 0 L 80 10 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 木の書類箱 (右上) */}
        <g transform="translate(1600 220)">
          <rect x={-150} y={-110} width={300} height={220} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => <rect key={k} x={-130 + k * 6} y={-92 + k * 8} width={260} height={180} fill={k === 2 ? C.patent : KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        {/* 特許の書類 (ドンで少し浮く) */}
        <g transform={`translate(0 ${-hit * 10})`}>
          <rect x={570 + 10} y={110 + 14} width={800} height={900} fill={KRP.ink} opacity={0.2 + hit * 0.1} />
          <rect x={570} y={110} width={800} height={900} fill={C.patent} stroke={KRP.ink} strokeWidth={6} />
          <rect x={600} y={140} width={740} height={840} fill="none" stroke={C.patentLine} strokeWidth={3} opacity={0.5} />
          {/* 見出しの波線 */}
          <path d="M 760 190 q 20 -10 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" fill="none" stroke={KRP.ink} strokeWidth={6} />
          {/* 図面の時計 + 番号の引き出し線 */}
          <MzHPatentClock x={930} y={450} s={1.15} jolt={jolt} f={f} />
          <g stroke={C.patentLine} strokeWidth={3} fill="none">
            <line x1={930} y1={290} x2={1150} y2={250} /><line x1={1060} y1={500} x2={1200} y2={520} /><line x1={820} y1={310} x2={680} y2={270} />
          </g>
          {[["1", 1172, 256], ["2", 1222, 528], ["3", 660, 276]].map(([t, nx, ny]) => (
            <text key={t as string} x={nx as number} y={(ny as number) + 10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.patentLine}>{t}</text>
          ))}
          {/* 本文 (字は波線) */}
          {Array.from({ length: 6 }, (_, k) => (
            <path key={k} d={`M 640 ${720 + k * 40} ${Array.from({ length: 16 }, () => "q 10 -6 20 0 t 20 0").join(" ")}`} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
          ))}
          {/* 赤い封蝋 */}
          <g transform="translate(680 930)">
            <path d="M -30 10 L -44 70 L -16 56 L -4 76 L 0 16 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            <circle r={44} fill={C.seal} stroke={KRP.ink} strokeWidth={5} />
            <circle r={28} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
          </g>
          {/* 承認の印 (ドンの後) */}
          {don && (
            <g transform={`translate(${SX} ${SY}) rotate(-12) scale(${pop(seg(f, 28, 34))})`}>
              <rect x={-110} y={-62} width={220} height={124} rx={14} fill="none" stroke={C.seal} strokeWidth={10} />
              <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={C.seal}>承認</text>
            </g>
          )}
        </g>
        {/* 左手: 書類の端を押さえる (左から袖) */}
        <g transform="translate(600 820) rotate(-18)">
          <rect x={-600} y={-48} width={540} height={96} fill={C.suitGray} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-90} y={-54} width={50} height={108} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={4} cy={0} rx={62} ry={50} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[-30, -10, 10, 30].map((fy) => <rect key={fy} x={40} y={fy - 9} width={46} height={18} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          <rect x={-10} y={-64} width={40} height={20} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 右手とスタンプ (持ち上げる = 大きく・影が離れる) */}
        <ellipse cx={SX + lift * 40 + after * 300} cy={SY + 20 + lift * 40 - after * 120} rx={120 - lift * 30} ry={70 - lift * 20} fill={KRP.ink} opacity={0.22 - lift * 0.1} />
        <g transform={`translate(${SX + after * 260} ${SY - lift * 60 - after * 200}) scale(${1 + lift * 0.28 + after * 0.18}) rotate(${-12 + after * 10})`}>
          <rect x={-120} y={-70} width={240} height={140} rx={16} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-100} y={-52} width={200} height={104} rx={10} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
          <circle r={50} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <g transform="rotate(12)">
            <rect x={60} y={-50} width={700} height={100} fill={C.suitGray} stroke={KRP.ink} strokeWidth={6} />
            <rect x={40} y={-56} width={48} height={112} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={0} rx={64} ry={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {[-30, -10, 10, 30].map((fy) => <rect key={fy} x={-82} y={fy - 9} width={40} height={18} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          </g>
        </g>
        {/* ドンの衝撃線 */}
        {hit > 0.05 && (
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={hit}>
            {[200, 240, 280, 320, 20, 60].map((a) => {
              const r = (a * Math.PI) / 180;
              return <line key={a} x1={SX + Math.cos(r) * 190} y1={SY + Math.sin(r) * 150} x2={SX + Math.cos(r) * 250} y2={SY + Math.sin(r) * 200} />;
            })}
          </g>
        )}
        {hit > 0.05 && <text x={SX - 80} y={SY - 200} fontFamily={FONT} fontWeight={900} fontSize={100} fill={KRP.red} stroke={KRP.white} strokeWidth={10} paintOrder="stroke" opacity={hit}>ドン</text>}
        {/* 天井の扇風機の影 (ゆっくり回る) */}
        <g transform={`translate(960 520) rotate(${fan})`} opacity={0.08}>
          {[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={-380} rx={90} ry={360} fill={KRP.ink} transform={`rotate(${a})`} />)}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #179 アラームを止めても、5分か10分たつと、もう一度鳴らす装置。
// 格: 図 / seed 6179
// 絵: どこ: #178 の特許の書類に寄って、その図面の中の世界 (クリーム色の紙・青い線画の世界)。紙の上に線画の寝室 (ベッド・ナイトテーブル) と BellClock (snooze=true) が描かれている。演出: 線画の寝ている人 (男性・短い黒髪) が、鳴る時計 (ring=1) のスヌーズボタンを手でぽんと押す → 時計が止まる (ring=0) → 時計の横に書類の余白から時間の目盛り (半円の目盛り「5分」「10分」の2つの札) が出て、針が5分の位置まで進む → 時計がまた鳴る (ring=1)、寝ていた人が「また!?」と片目を開ける (face="surprised")。図面らしく、ボタンと時計を結ぶ番号の線「1」「2」も引く。動き: f0-30 押す→止まる / f30-90 目盛りの針が進む (時計の文字盤の分針も一緒に5分ぶん動く) / f90 再び鳴る / f100-130 片目が開く・掛け布団を頭までかぶる
// どこ: #178 の特許の書類に寄った、図面の中の世界 (クリーム色の紙・方眼の薄線・青い線画のベッドとナイトテーブル・余白に波線の本文)
// 演出: 線画のベッドで寝ていた男性 (短い黒髪) が、鳴る BellClock (snooze) のスヌーズボタンを目を閉じたまま手でぽん → 止まる → 横になる。
//       余白から半円の目盛り (5分・10分) が出て針が5分まで進み、時計の分針も5分ぶん進む → また鳴る。男性は片目を開けて「また!?」→ 布団を頭までかぶる。
//       図面らしく番号の線「1」(ボタン)「2」(目盛り)
// 動き: f0-8 鳴る・起き上がる / f8-14 押す→止まる / f14-22 横になる / f16-38 目盛りの針と分針が5分進む / f38 また鳴る / f40 片目が開く / f50-70 布団をかぶる
const Mz179: React.FC<{ f: number }> = ({ f }) => {
  const ring = f < 12 || f >= 38 ? 1 : 0;
  const press = Math.sin(seg(f, 8, 16) * Math.PI);
  const sit = f < 14 ? easeOut(seg(f, 0, 8)) : 1 - easeInOut(seg(f, 14, 22));
  const min = easeInOut(seg(f, 16, 38)) * 5; // 進んだ分
  const gauge = pop(seg(f, 14, 22));
  const eye = f >= 40 && f < 52;
  const cover = easeInOut(seg(f, 50, 66));
  const cam = lerp(1.06, 1.0, easeInOut(seg(f, 0, 30)));
  const HX = 980, HY = 640, PS = 0.85; // 腰。寝ると頭は右 (枕)、起きると左の時計へ腕を伸ばす
  const ang = lerp(84, -4, sit);
  const CX = 850, CY = 721, CS = 0.5; // 時計の足元
  const GX = 1480, GY = 520, GR = 200; // 目盛り
  const needle = -180 + (min / 10) * 180;
  return (
    <Frame f={f} seed={6179}>
      <g transform={`translate(${960 * (1 - cam)} ${540 * (1 - cam)}) scale(${cam})`}>
        {/* 紙 (方眼の薄線・枠) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.patent} />
        {Array.from({ length: 34 }, (_, k) => <line key={k} x1={k * 60} y1={-60} x2={k * 60} y2={1140} stroke={C.patentLine} strokeWidth={1.5} opacity={0.18} />)}
        {Array.from({ length: 20 }, (_, k) => <line key={k} x1={-60} y1={k * 60} x2={1980} y2={k * 60} stroke={C.patentLine} strokeWidth={1.5} opacity={0.18} />)}
        <rect x={60} y={50} width={1800} height={980} fill="none" stroke={C.patentLine} strokeWidth={4} opacity={0.6} />
        {/* 余白の本文 (波線) */}
        {Array.from({ length: 3 }, (_, k) => (
          <path key={k} d={`M 1200 ${800 + k * 40} ${Array.from({ length: 14 }, () => "q 10 -6 20 0 t 20 0").join(" ")}`} fill="none" stroke={KRP.grayDark} strokeWidth={4} opacity={0.6} />
        ))}
        {/* 線画のベッド・ナイトテーブル・床 */}
        <g fill="none" stroke={C.patentLine} strokeWidth={6} strokeLinecap="round">
          <line x1={120} y1={830} x2={1400} y2={830} />
          <rect x={CX - 100} y={CY} width={190} height={109} />
          <line x1={CX - 80} y1={CY + 40} x2={CX + 70} y2={CY + 40} />
          <circle cx={CX - 5} cy={CY + 72} r={8} />
          <rect x={1290} y={580} width={30} height={250} rx={8} />
          <rect x={900} y={650} width={390} height={70} rx={10} />
          <line x1={910} y1={720} x2={910} y2={830} /><line x1={1280} y1={720} x2={1280} y2={830} />
          <path d="M 1150 650 Q 1140 610 1200 612 Q 1280 610 1280 650" />
        </g>
        {/* 男性 (寝る ⇄ 起き上がる)。起きたときは左腕を横へ伸ばしてボタンを押す */}
        <g transform={`rotate(${ang} ${HX} ${HY})`}>
          <Person x={HX} y={HY + 58 * PS} s={PS} f={f} phase={2} still pose={sit > 0.6 && f < 16 ? "point" : "stand"} pointDir={-1}
            face={eye ? "surprised" : "normal"} cloth={C.dadNavy} clothDark={C.dadNavyDark} hair="cap" gaze={eye ? [-6, -6] : [0, 0]} />
          {/* 閉じた目 (片目が開くときは右目だけ閉じたまま) */}
          <g transform={`translate(${HX} ${HY + 58 * PS}) scale(${PS})`} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            {!eye && <><ellipse cx={-24} cy={-222} rx={17} ry={22} fill={KRP.white} stroke="none" /><line x1={-34} y1={-220} x2={-14} y2={-220} /></>}
            <ellipse cx={24} cy={-222} rx={17} ry={22} fill={KRP.white} stroke="none" />
            <line x1={14} y1={-220} x2={34} y2={-220} />
          </g>
        </g>
        {/* 掛け布団 (最後は頭までかぶる) */}
        {(() => {
          const top = lerp(632, 552, cover), R = lerp(1062, 1260, cover);
          return (
            <g>
              <path d={`M 905 ${top + 10} Q ${(905 + R) / 2} ${top - 26} ${R} ${top + 6} L ${R + 8} 724 L 905 724 Z`} fill={KRP.white} stroke={C.patentLine} strokeWidth={6} />
              <path d={`M 930 ${top + 40} Q ${(930 + R) / 2} ${top + 20} ${R - 20} ${top + 40}`} fill="none" stroke={C.patentLine} strokeWidth={4} opacity={0.6} />
            </g>
          );
        })()}
        {/* 時計 (共有部品)。分針が5分ぶん進む */}
        <MzHClock x={CX} y={CY} s={CS} f={f} ring={ring} snooze press={press} time={6 * 60 + min} />
        {press > 0.2 && <text x={CX - 130} y={CY - 290} fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.patentLine}>ぽん</text>}
        {/* 番号の引き出し線 1 (ボタン) */}
        <g stroke={C.patentLine} strokeWidth={3} fill="none" strokeDasharray="10 6">
          <path d={`M ${CX + 20} ${CY - 165} L ${CX + 200} 236`} />
        </g>
        <circle cx={CX + 220} cy={210} r={32} fill={C.patent} stroke={C.patentLine} strokeWidth={4} />
        <text x={CX + 220} y={222} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.patentLine}>1</text>
        {/* 半円の目盛り (余白から出る) + 番号 2 */}
        <g transform={`translate(${GX} ${GY}) scale(${gauge})`}>
          <path d={`M ${-GR} 0 A ${GR} ${GR} 0 0 1 ${GR} 0 Z`} fill={KRP.white} stroke={C.patentLine} strokeWidth={6} />
          <path d={`M 0 0 L ${-GR} 0 A ${GR} ${GR} 0 0 1 ${Math.cos((needle * Math.PI) / 180) * GR} ${Math.sin((needle * Math.PI) / 180) * GR} Z`} fill={KRP.blueSoft} opacity={0.8} />
          {Array.from({ length: 11 }, (_, k) => (
            <line key={k} x1={0} y1={-GR + 8} x2={0} y2={-GR + (k % 5 === 0 ? 44 : 26)} stroke={C.patentLine} strokeWidth={k % 5 === 0 ? 6 : 4} transform={`rotate(${-90 + k * 18})`} />
          ))}
          <line x1={0} y1={0} x2={GR - 30} y2={0} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" transform={`rotate(${needle})`} />
          <circle r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-GR - 40} cy={-60} r={32} fill={C.patent} stroke={C.patentLine} strokeWidth={4} />
          <text x={-GR - 40} y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.patentLine}>2</text>
        </g>
        <TagPlate x={GX} y={GY - GR - 50} text="5分" size={38} t={seg(f, 18, 26)} color={C.patentLine} />
        <TagPlate x={GX + GR + 20} y={GY + 50} text="10分" size={38} t={seg(f, 20, 28)} color={C.patentLine} />
        {/* また!? */}
        {eye && <text x={1080} y={500} fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.red} stroke={KRP.white} strokeWidth={8} paintOrder="stroke">!?</text>}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #180 翌年には、「スヌーズアラーム」という名前の目覚まし時計が売り出された、とされています。
// 格: 並 / seed 6180
// 絵: どこ: 1956年のアメリカの百貨店の時計売り場 (木のショーケース・壁の飾り棚・天井の丸いランプ・床の白黒のタイル)。年代札「1956年」の横に、点線の小さな「?」を添える (とされる話なので)。演出: ショーケースの真ん中の台の上に BellClock (snooze=true) が置かれ、上のスヌーズボタンに「ZZ」のしるしだけ (会社名・商品名のロゴは描かない)。店員の男性 (蝶ネクタイ・ベスト・短い黒髪) が両手で時計を持ち上げて客に見せ (腕は2本 pose で描く)、ボタンを押してみせると時計がくーっと眠るように静かになる。ショーケースの前の客の女性 (帽子・肩までの巻き髪・水玉のスカート) と男性 (帽子とコート) がのぞきこみ、女性があくびをして口に手を当てる。動き: f0-30 カメラが売り場の入口からショーケースへ寄る / f30-70 店員が時計を持ち上げる / f70-100 ボタンを押す・時計が静まる / f100-140 客の女性があくび
// どこ: 1956年のアメリカの百貨店の時計売り場。木とガラスのショーケース・壁の飾り棚 (いろいろな時計)・天井の丸いランプ・白黒のタイルの床。
//       年代札「1956年」の横に点線の小さな「?」(とされる話なので)
// 演出: ショーケースの奥の店員 (蝶ネクタイ・ベスト・短い黒髪) が BellClock (snooze・ボタンに ZZ のしるし) を両手で持ち上げて見せる。
//       鳴っている時計のボタンを押すと、時計がくーっと眠るように静かになる (傾いて Z が昇る)。手前の客の女性 (帽子・巻き髪・水玉のスカート) と
//       男性 (帽子・コート) がのぞきこみ、女性がつられてあくびをして口に手を当てる
// 動き: f0-24 カメラが入口からショーケースへ寄る / f8-22 時計を持ち上げる (鳴っている) / f24-28 ボタンを押す / f28- 時計が眠る / f34- 女性があくび
const Mz180: React.FC<{ f: number }> = ({ f }) => {
  const z = easeInOut(seg(f, 0, 24));
  const sc = lerp(1.0, 1.12, z);
  const cx = lerp(960, 900, z), cy = lerp(540, 600, z);
  const liftT = easeOut(seg(f, 8, 22));
  const press = Math.sin(seg(f, 24, 30) * Math.PI);
  const asleep = seg(f, 28, 40);
  const ring = f >= 12 && f < 27 ? 1 : 0;
  const yawn = seg(f, 34, 40) * (1 - seg(f, 90, 100));
  const CL = { x: 1120, y: 970, s: 1.5 };
  const handY = CL.y - 118 * CL.s;
  const clockFeet = lerp(1120, 904, liftT);
  const CS = 0.6;
  const W1 = { x: 470, y: 950, s: 0.95 }, M1 = { x: 700, y: 950, s: 0.98 };
  return (
    <Frame f={f} seed={6180}>
      <g transform={`translate(${960 - cx * sc} ${540 - cy * sc}) scale(${sc})`}>
        {/* 壁 (淡い緑のしっくい) と天井 */}
        <rect x={-60} y={-60} width={2040} height={900} fill={mixColor(C.houseGreen, "#FFFFFF", 0.45)} />
        <rect x={-60} y={-60} width={2040} height={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {[300, 960, 1620].map((lx, k) => (
          <g key={lx}>
            <line x1={lx} y1={70} x2={lx} y2={110} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={140} r={40} fill={MP.glow} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={lx} cy={140} r={70 + Math.sin(f / 9 + k) * 4} fill={MP.glow} opacity={0.25} />
          </g>
        ))}
        {/* 年代札 + 点線の「?」 */}
        <TagPlate x={260} y={330} text="1956年" size={40} />
        <g transform="translate(420 330)">
          <circle r={34} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="8 6" />
          <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.grayDark}>?</text>
        </g>
        {/* 壁の飾り棚 (いろいろな時計) */}
        {[330, 500].map((sy, r) => (
          <g key={sy}>
            <rect x={780} y={sy} width={1000} height={20} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, k) => {
              const ix = 840 + k * 160 + r * 40;
              const kind = (k + r) % 3;
              return (
                <g key={k} transform={`translate(${ix} ${sy})`}>
                  {kind === 0 && <><circle cx={0} cy={-50} r={40} fill={[KRP.blueSoft, C.housePink, KRP.yellow][k % 3]} stroke={KRP.ink} strokeWidth={4} /><circle cx={0} cy={-50} r={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} /></>}
                  {kind === 1 && <><rect x={-40} y={-90} width={80} height={90} rx={14} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} /><circle cx={0} cy={-50} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} /></>}
                  {kind === 2 && <><rect x={-46} y={-66} width={92} height={66} rx={8} fill={C.houseBlue} stroke={KRP.ink} strokeWidth={4} /><circle cx={0} cy={-33} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} /></>}
                  <line x1={0} y1={kind === 2 ? -33 : -50} x2={0} y2={(kind === 2 ? -33 : -50) - 16} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${f * (k % 2 ? 0.5 : 0.3) + k * 40} 0 ${kind === 2 ? -33 : -50})`} />
                </g>
              );
            })}
          </g>
        ))}
        {/* 白黒のタイルの床 */}
        <rect x={-60} y={840} width={2040} height={300} fill={KRP.white} />
        {Array.from({ length: 50 }, (_, k) => {
          const c = k % 25, r = Math.floor(k / 25);
          return (c + r) % 2 === 0 ? <rect key={k} x={-60 + c * 84} y={840 + r * 84} width={84} height={84} fill={C.tileBlack} /> : null;
        })}
        <line x1={-60} y1={840} x2={1980} y2={840} stroke={KRP.ink} strokeWidth={5} />
        {/* 店員 (ショーケースの奥) */}
        <Person x={CL.x} y={CL.y} s={CL.s} f={f} phase={3} pose="hold" face={asleep > 0.5 ? "smile" : "normal"} gaze={[-10, 4]}
          cloth={KRP.white} clothDark={C.coatBlackDark} hair="cap" />
        <MzHTie x={CL.x} y={CL.y} s={CL.s} f={f} phase={3} bow vest={C.velvet} color={C.coatBlack} />
        {/* 持ち上げられた時計 (鳴る → ボタン → 眠る) */}
        <g transform={`rotate(${asleep * -14} ${CL.x} ${clockFeet})`}>
          <MzHClock x={CL.x} y={clockFeet} s={CS} f={f} ring={ring} snooze press={press} />
          <line x1={CL.x - 124} y1={clockFeet - 280} x2={CL.x - 20} y2={clockFeet - 196} stroke={KRP.ink} strokeWidth={3} />
          <g transform={`translate(${CL.x - 160} ${clockFeet - 290})`}>
            <rect x={-34} y={-24} width={68} height={32} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <text y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.blueDeep}>ZZ</text>
          </g>
        </g>
        {/* 眠る時計の Z と「くー」 */}
        {asleep > 0.1 && [0, 1, 2].map((k) => {
          const t = ((f / 30 + k / 3) % 1);
          return (
            <text key={k} x={CL.x + 60 + t * 60} y={clockFeet - 130 - t * 120} fontFamily={FONT} fontWeight={900} fontSize={30 + t * 20}
              fill={KRP.blueDeep} stroke={KRP.white} strokeWidth={5} paintOrder="stroke" opacity={asleep * Math.sin(t * Math.PI)}>Z</text>
          );
        })}
        {/* ショーケース (ガラスの箱と木の台) */}
        <rect x={780} y={916} width={700} height={240} fill={C.glassTint} stroke={KRP.ink} strokeWidth={6} />
        <line x1={820} y1={936} x2={880} y2={1060} stroke={KRP.white} strokeWidth={10} opacity={0.7} />
        <rect x={760} y={898} width={740} height={22} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ケースの中の時計 (小さく並ぶ) */}
        {[880, 1020, 1220, 1360].map((ix, k) => (
          <g key={ix}>
            <circle cx={ix} cy={990} r={36} fill={[MP.bell, KRP.blueSoft, MP.brass, C.housePink][k]} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={ix} cy={990} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 客の男性 (中折れ帽・コート) */}
        <Person x={M1.x} y={M1.y} s={M1.s} f={f} phase={7} face={asleep > 0.5 ? "smile" : "surprised"} gaze={[10, -4]} lean={6}
          cloth={C.suitGray} clothDark={C.suitGrayDark} hair="cap" />
        <MzHFedora x={M1.x} y={M1.y} s={M1.s} f={f} phase={7} lean={6} />
        {/* 客の女性 (帽子・肩までの巻き髪・水玉のスカート)。つられてあくび → 口に手 (右腕を上げる) */}
        <MzHHairBack x={W1.x} y={W1.y} s={W1.s} f={f} phase={4} curl color={C.hairBrown} lean={4} />
        <Person x={W1.x} y={W1.y} s={W1.s} f={f} phase={4} pose={yawn > 0.3 ? "raise" : "stand"} face={yawn > 0.3 ? "joy" : "smile"} gaze={[10, -2]} lean={4}
          cloth={C.momRed} clothDark={C.momRedDark} hair="none" />
        <MzHSkirt x={W1.x} y={W1.y} s={W1.s} f={f} phase={4} color={C.momRed} dots lean={4} />
        <MzHHairFront x={W1.x} y={W1.y} s={W1.s} f={f} phase={4} curl color={C.hairBrown} lean={4} />
        <g transform={mzhG({ x: W1.x, y: W1.y, s: W1.s, f, phase: 4, lean: 4 })}>
          {/* 小さな帽子 */}
          <ellipse cx={-6} cy={-290} rx={60} ry={12} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -46 -292 Q -40 -330 -4 -330 Q 32 -330 36 -292 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={30} cy={-306} r={9} fill={C.flowerPink} stroke={KRP.ink} strokeWidth={3} />
          {/* あくびの口 */}
          {yawn > 0.3 && <ellipse cx={0} cy={-184} rx={14} ry={20 * yawn} fill={KRP.ink} />}
        </g>
        {yawn > 0.3 && <text x={W1.x - 170} y={W1.y - 300} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.grayDark} opacity={yawn}>ふぁ〜</text>}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_169: (f) => <Mz169 f={f} />,
  mz_170: (f) => <Mz170 f={f} />,
  mz_171: (f) => <Mz171 f={f} />,
  mz_172: (f) => <Mz172 f={f} />,
  mz_173: (f) => <Mz173 f={f} />,
  mz_174: (f) => <Mz174 f={f} />,
  mz_175: (f) => <Mz175 f={f} />,
  mz_176: (f) => <Mz176 f={f} />,
  mz_177: (f) => <Mz177 f={f} />,
  mz_178: (f) => <Mz178 f={f} />,
  mz_179: (f) => <Mz179 f={f} />,
  mz_180: (f) => <Mz180 f={f} />,
};

export const MZ_H_MOTIFS: string[] = [
  "mz_169", // #169
  "mz_170", // #170
  "mz_171", // #171
  "mz_172", // #172
  "mz_173", // #173
  "mz_174", // #174
  "mz_175", // #175
  "mz_176", // #176
  "mz_177", // #177
  "mz_178", // #178
  "mz_179", // #179
  "mz_180", // #180
];

export const mezaHScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
