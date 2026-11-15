// 「人類は、昔から飛ばして観ていた」: 文#219〜#228 (10文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1347〜1356。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#171D2A",      // #224 最暗部の地
  night2: "#232B3C",     // #225 回想の地
  night3: "#121926",     // #226 映画館の地
  night4: "#1E2534",     // #227 夜の部屋の地
  night5: "#1A2233",     // #228 回復の地
  wallWood: "#D9BC85",   // 寄席の板壁 (明)
  wallWood2: "#C9A86B",  // 寄席の板壁 (やや濃)
  boardLine: "#A5854E",  // 板目
  tatami: "#CBBE8A",     // 桟敷の床
  mousen: "#B03A33",     // 高座の緋毛氈 (KRP.redより暗い)
  byobu: "#E3C878",      // 金屏風
  beer: "#E8B33A",       // ビール
  kimono: "#55658A",     // 落語家の着物 (鉄紺)
  kimonoDark: "#41506F",
  shima: "#7183A6",      // 着物の細い縞
  haori: "#4A4250",      // 羽織 (墨紫)
  haoriDark: "#372F3B",
  himo: "#F0E6CE",       // 羽織紐
  sensu: "#EBD9A6",      // 扇子 (閉じたまま)
  zabuton: "#7A4273",    // 高座の座布団 (緋毛氈と見分けるため紫)
  zabutonDark: "#5B2F57",
  roadDust: "#DCCDA8",   // 一本道
  lane: "#E9DDBA",       // 寄席の脇道
  duskSky: "#F0D9AC",    // #223 夕方の空
  seat: "#2A3344",       // 映画館の座席
  screenlit: "#3E4A60",  // 映画館のスクリーン
  frock: "#2E2A33",      // #222 明治の紳士のフロックコート
  stoneW: "#E9E1D2",     // #222 明治の洋風劇場の石壁
  usher: "#2F3E63",      // #222 昭和の係員の制服
  usherDark: "#1F2A45",
  meigaza: "#C98A5A",    // #222 昭和の映画館の外壁
  staffPolo: "#3E7F8C",  // #222 いまの係員のポロシャツ
  glassCine: "#BFD6E6",  // #222 シネコンのガラス
  edoGround: "#D9C59A",  // #222 江戸の土の道
  cobble: "#BDB3A2",     // #222 明治の石畳
  sidewalk: "#B8B4AA",   // #222 昭和の歩道
  plaza: "#CBD3D8",      // #222 いまの広場の床
} as const;
void W; void H; void useCurrentFrame;
void Stamp; void XMark; void Arrow;
void ChapterDoor; void SaiseiBar; void NenpyoEmaki; void Fuda3;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目の擬似乱数 (Math.random 禁止)
const rnd = (s: number, i: number) => {
  const v = Math.sin(s * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// ===================================================================
// このファイルだけのローカル部品
// ===================================================================

// 提灯 (寄席の軒先・一本道・表彰状で使い回す)。x,y は吊り元。
const Chochin: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  text?: string; lit?: boolean;
}> = ({ x, y, s = 1, f, phase = 0, text, lit = true }) => {
  const sway = Math.sin((f + phase * 13) / 11) * 2.4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
      <line x1={0} y1={0} x2={0} y2={26} stroke={KRP.ink} strokeWidth={5} />
      {lit && <ellipse cx={0} cy={116} rx={86} ry={100} fill={SGP.lampGold} opacity={0.22} />}
      <rect x={-28} y={26} width={56} height={14} rx={4}
        fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={0} cy={116} rx={58} ry={74} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 骨の線3本 */}
      <path d="M -56 92 Q 0 78 56 92 M -58 116 Q 0 104 58 116 M -54 142 Q 0 132 54 142"
        fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
      {lit && <ellipse cx={-18} cy={100} rx={16} ry={24} fill={KRP.white} opacity={0.3} />}
      {text && text.split("").map((ch, i) => (
        <text key={i} x={0} y={96 + i * 36} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={34} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={1.2} paintOrder="stroke">{ch}</text>
      ))}
      <rect x={-22} y={184} width={44} height={12} rx={4}
        fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
};

// 落語家 (寄席の高座の演者)。x,y = 座布団の上面の中央。
// Person は立ち姿が前提なので、足元を座布団の面のすぐ下 (ローカル y=10) に置き、
// 着物の裾と座布団で腰から下を隠して正座に見せる。
// ★人物と衣装はひとつの rotate の入れ物に入れる。別の g に置くと体が傾いた瞬間に外れる。
//   Person には still を渡して bob を止め、ゆれはこの入れ物の rotate が作る。
// pose="point" = 客を扇子で指す / "calm" = 両手で扇子を膝の前に。
const Rakugoka: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  pose?: "point" | "calm"; face?: "joy" | "smile";
}> = ({ x, y, s = 1, f, phase = 0, pose = "point", face = "joy" }) => {
  const sway = Math.sin((f + phase * 17) / 15) * 1.4;   // 体のゆれ (度)
  const fanTilt = Math.sin((f + phase * 11) / 12) * 4;  // 扇子は手の中で振れる
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 座布団 (この上に正座する) */}
      <ellipse cx={0} cy={36} rx={148} ry={15} fill={KRP.ink} opacity={0.16} />
      <path d="M -150 2 Q 0 -14 150 2 L 150 22 Q 0 42 -150 22 Z"
        fill={C.zabuton} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <path d="M -138 20 Q 0 37 138 20" fill="none"
        stroke={C.zabutonDark} strokeWidth={5} opacity={0.8} />
      {[-150, 150].map((tx) => (
        <circle key={tx} cx={tx} cy={12} r={9} fill={C.zabutonDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <g transform={`rotate(${sway} 0 0)`}>
        {/* 羽織 (体より奥。腕は人物側が前に描く) */}
        <path d="M -98 -158 Q 0 -184 98 -158 L 104 -52 Q 0 -30 -104 -52 Z"
          fill={C.haori} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -84 -150 Q 0 -172 84 -150" fill="none"
          stroke={C.haoriDark} strokeWidth={5} opacity={0.75} />
        {/* 人物 (着物の色。ゆれは外の rotate が作るので still) */}
        <Person x={0} y={10} s={1} cloth={C.kimono} clothDark={C.kimonoDark}
          face={face} f={f} phase={phase} still
          pose={pose === "point" ? "point" : "hold"} pointDir={1} />
        {/* 着物の裾 (正座の膝。脚と靴をすべて隠す) */}
        <path d="M -58 -56 C -92 -40 -116 -4 -124 20 L 124 20 C 116 -4 92 -40 58 -56 Z"
          fill={C.kimono} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        <g stroke={C.shima} strokeWidth={3} opacity={0.8} fill="none">
          <path d="M -86 -44 C -98 -22 -108 0 -112 15" />
          <path d="M -44 -52 C -50 -26 -54 -2 -56 16" />
          <path d="M 44 -52 C 50 -26 54 -2 56 16" />
          <path d="M 86 -44 C 98 -22 108 0 112 15" />
        </g>
        <path d="M -2 -54 L -2 17" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
        {/* 着物の袖 (棒のような腕を広い袂で包む)。point のときだけ */}
        {pose === "point" && (
          <g fill={C.kimono} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
            {/* 垂れている左の袖 */}
            <path d="M -94 -154 L -48 -156 L -48 -62 Q -48 -40 -71 -40 Q -94 -40 -94 -62 Z" />
            {/* 差し出した右腕から垂れる袂 */}
            <path d="M 72 -140 L 146 -143 L 146 -108 Q 146 -92 109 -92 Q 72 -92 72 -108 Z" />
          </g>
        )}
        {pose === "point" && (
          <g stroke={C.kimonoDark} strokeWidth={3.5} opacity={0.7} fill="none">
            <path d="M -88 -62 Q -71 -52 -54 -62" />
            <path d="M 80 -106 Q 109 -98 138 -106" />
          </g>
        )}
        {/* 帯 (羽織の前身頃のあいだから覗く) */}
        <rect x={-62} y={-78} width={124} height={26} rx={5}
          fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-19} y={-80} width={38} height={30} rx={4}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* 羽織の前身頃 (肩から前に垂れる2枚)。細めにして帯と着物を覗かせる */}
        <g fill={C.haori} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round">
          <path d="M -62 -156 Q -66 -104 -62 -50 L -36 -52 Q -40 -106 -36 -154 Z" />
          <path d="M 62 -156 Q 66 -104 62 -50 L 36 -52 Q 40 -106 36 -154 Z" />
        </g>
        {/* 着物の白い衿 */}
        <g fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
          <path d="M -50 -157 L -30 -164 L -4 -112 L -4 -98 Z" />
          <path d="M 50 -157 L 30 -164 L -4 -112 L -4 -98 Z" />
        </g>
        {/* 羽織紐 (結び目つき) */}
        <path d="M -40 -98 Q -20 -88 -2 -92 Q 16 -88 40 -98" fill="none"
          stroke={C.himo} strokeWidth={5} strokeLinecap="round" />
        <circle cx={-2} cy={-92} r={8} fill={C.himo} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 扇子 (閉じたまま) */}
        {pose === "point" ? (
          <g transform={`translate(153 -138) rotate(${-10 + fanTilt})`}>
            <path d="M -8 -10 L 84 -18 L 90 -2 L -8 8 Z"
              fill={C.sensu} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M 10 -8 L 76 -15 M 10 1 L 78 -6"
              stroke={SGP.woodDark} strokeWidth={2.6} opacity={0.7} />
            <circle cx={-6} cy={-1} r={7} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ) : (
          <g transform={`translate(0 -106) rotate(${-4 + fanTilt * 0.5})`}>
            <path d="M -48 -8 L 46 -14 L 48 2 L -48 8 Z"
              fill={C.sensu} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -28 -6 L 34 -11" stroke={SGP.woodDark} strokeWidth={2.6} opacity={0.7} />
            <circle cx={-46} cy={0} r={7} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        )}
      </g>
    </g>
  );
};

// 人物に衣装・帽子を重ねる入れ物 (掟3章の契約どおり)。Person と同じ変換・同じ bob。
// 中の Person には x={0} y={0} still を渡す。座標は人物ローカル (頭 cy=-228 / あご -164 / 胴 -160..-52 / 足元 0)
const Kasane: React.FC<{
  x: number; y: number; s?: number; lean?: number; f: number; phase?: number;
  back?: React.ReactNode; front?: React.ReactNode; children: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f, phase = 0, back, front, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {back}{children}{front}
    </g>
  );
};

// #222 の時代の衣装 (人物ローカル座標)
// 明治の紳士: フロックコートの裾 (後ろ) / 白いシャツの V と蝶ネクタイ + シルクハット (前)
const FrockBack: React.FC = () => (
  <path d="M -62 -110 L -70 -14 L -20 -24 L 0 -60 L 20 -24 L 70 -14 L 62 -110 Z"
    fill={C.frock} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
);
const FrockFront: React.FC = () => (
  <g>
    <path d="M -26 -160 L 0 -112 L 26 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -14 -152 L 0 -146 L 14 -152 L 14 -138 L 0 -144 L -14 -138 Z" fill={KRP.ink} />
    <circle cx={0} cy={-100} r={4.5} fill={KRP.ink} />
    <circle cx={0} cy={-80} r={4.5} fill={KRP.ink} />
    {/* シルクハット */}
    <rect x={-74} y={-298} width={148} height={16} rx={8} fill={KRP.ink} />
    <path d="M -46 -292 L -50 -384 Q 0 -394 50 -384 L 46 -292 Z" fill={C.frock} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-47} y={-318} width={94} height={16} fill={C.mousen} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);
// 昭和の係員: 制帽 (つばは眉より上) と金ボタン
const SeiboFront: React.FC = () => (
  <g>
    <path d="M -62 -262 Q -70 -312 0 -316 Q 70 -312 62 -262 Z" fill={C.usher} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-64} y={-280} width={128} height={18} rx={4} fill={C.usherDark} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-296} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
    <path d="M -56 -264 Q 0 -252 56 -264 Q 0 -258 -56 -264 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    {[-136, -110, -84].map((by) => (
      <circle key={by} cx={0} cy={by} r={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
  </g>
);
// いまのシネコンの係員: ポロシャツの衿と 首から下げた名札 (紐はあごより下から)
const StaffFront: React.FC = () => (
  <g>
    <path d="M -30 -160 L 0 -140 L 30 -160 L 22 -148 L 0 -132 L -22 -148 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -24 -156 L -10 -104 M 24 -156 L 10 -104" stroke={KRP.red} strokeWidth={4} fill="none" />
    <rect x={-20} y={-108} width={40} height={30} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={-12} y={-100} width={24} height={6} fill={KRP.blueDeep} />
  </g>
);
// 江戸の町人: 着物の衿 (右前) と帯
const EdoFront: React.FC<{ obi: string }> = ({ obi }) => (
  <g>
    <g fill={SGP.paper} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
      <path d="M -40 -158 L -24 -162 L 2 -126 L -6 -116 Z" />
      <path d="M 40 -158 L 24 -162 L -14 -104 L -26 -110 Z" />
    </g>
    <rect x={-60} y={-98} width={120} height={24} rx={5} fill={obi} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// スマホの小さな青い光 (#226 で点々と使う)
const PhoneDot: React.FC<{ x: number; y: number; s?: number; o: number }> =
  ({ x, y, s = 1, o }) => {
    if (o <= 0) return null;
    return (
      <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={26} fill={SGP.phoneBlue} opacity={0.3} />
        <circle r={10} fill={SGP.phoneBlue} opacity={0.95} />
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #219 公式の案内に、こう書いてあります。
// 格: 並 / seed 1347
// 絵: 入口の案内掲示へ寄る。読む人の背中越し
// どこ: 夕方の寄席の入口前。板壁と瓦の軒、開いた引き戸から暖色の明かり
// 演出: 案内掲示板を読む人の背中越し。掲示の文はまだ読めない (大写しは#220)
// 動き: 掲示板へゆっくり寄る。提灯が揺れ、戸口の明かりがまたたき、文の行が順に浮かぶ
const Sg219: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 42)) * 0.07;
  const flick = 0.1 + Math.sin(f / 6) * 0.03;
  return (
    <Frame f={f} seed={1347}>
      <g transform={zoomAt(z, 720, 520)}>
        {/* 板壁 (縦板目) */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallWood} />
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={i * 112 + 20} y1={130} x2={i * 112 + 14} y2={1100}
            stroke={C.boardLine} strokeWidth={4} opacity={0.5} />
        ))}
        {/* 瓦の軒 */}
        <rect x={-20} y={54} width={W + 40} height={66} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 25 }, (_, i) => (
          <path key={i} d={`M ${i * 80 - 16} 120 a 40 26 0 0 1 80 0 Z`}
            fill={C.wallWood2} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 入口: 開いた引き戸と暖色の中 */}
        <rect x={1280} y={300} width={360} height={580} fill="#3A2C20" stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={1460} cy={620} rx={200} ry={300} fill={SGP.lampGold} opacity={0.26 + flick} />
        {/* 中にうっすら高座の床と階段 */}
        <rect x={1320} y={700} width={280} height={24} fill={SGP.stage} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
        <rect x={1360} y={780} width={200} height={20} fill={SGP.stage} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
        {/* 右へ引いた戸 (障子の格子) */}
        <rect x={1640} y={290} width={200} height={600} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={1690 + i * 50} y1={296} x2={1690 + i * 50} y2={884} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1644} y1={360 + i * 140} x2={1836} y2={360 + i * 140} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 中へ入っていく客 */}
        <PersonMini x={1430} y={866} s={1.05} color="#5A4A3C" face="none" f={f} phase={3} />
        {/* 軒先の提灯 */}
        <Chochin x={1210} y={150} s={1.05} f={f} text="寄席" />
        {/* 案内の掲示板 (木枠 + 紙)。文の行はまだ波線 */}
        <rect x={380} y={300} width={680} height={480} rx={8}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 404 320 Q 640 312 1024 322" fill="none" stroke={SGP.woodDark} strokeWidth={3.5} />
        <rect x={412} y={332} width={616} height={416} fill={SGP.paper} stroke={KRP.ink} strokeWidth={5.5} />
        {[[420, 340], [1020, 340], [420, 740], [1020, 740]].map(([nx, ny], i) => (
          <circle key={i} cx={nx} cy={ny} r={4} fill={KRP.ink} />
        ))}
        <rect x={580} y={356} width={280} height={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <text x={720} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={42} fill={KRP.ink} letterSpacing={8}>ご案内</text>
        {/* 文の行 (読めない波線。順に浮かぶ) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i}
            d={`M 470 ${462 + i * 58} q 60 ${rnd(9, i) * 8 - 4} 125 0 q 65 ${rnd(8, i) * 8 - 4} 130 0 q 65 ${rnd(7, i) * 8 - 4} 130 0 q 55 ${rnd(6, i) * 8 - 4} 115 0`}
            fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round"
            opacity={0.65 * clamp01(seg(f, 6, 34) * 5 - i)} />
        ))}
        {/* 足元の敷石 */}
        {[[180, 1026], [420, 1056], [1180, 1030], [1560, 1050], [1800, 1016]].map(([sx, sy], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx={110 - i * 6} ry={26}
            fill={C.wallWood2} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        ))}
        {/* 読む人の背中越し (手前・大) */}
        <ellipse cx={766} cy={1152} rx={210} ry={40} fill={KRP.ink} opacity={0.14} />
        <PersonMini x={766} y={1148} s={2.6} color="#4A5468" face="none" f={f} phase={1} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #220 「途中からでもご入場できますし、途中でお帰りになられてもかまいません」。
// 格: 山 / seed 1348
// 絵: 案内の掲示の大写し。開いたままの入口の扉から、ほんのり高座の明かり
// どこ: 入口の板壁の前まで寄り切った正面。右に開けっぱなしの戸口
// 演出: 掲示は見出し「おねがい」と墨の筋だけ (台本の引用は絵に書かない)。戸の奥に小さな高座
// 動き: 文に朱線が順に引かれる。戸口の明かりがまたたき、床へ光がこぼれる
const Sg220: React.FC<{ f: number }> = ({ f }) => {
  const flick = Math.sin(f / 6) * 0.04 + Math.sin(f / 2.7) * 0.015;
  const u1 = easeOut(seg(f, 8, 22));
  const u2 = easeOut(seg(f, 24, 38));
  return (
    <Frame f={f} seed={1348}>
      {/* 板壁 (寄りなので板が太い) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallWood2} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={i * 190 - 30} y1={-20} x2={i * 190 - 42} y2={1100}
          stroke={C.boardLine} strokeWidth={6} opacity={0.55} />
      ))}
      {/* 木の床 */}
      <rect x={-20} y={880} width={W + 40} height={220} fill={SGP.stage} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 60 950 Q 400 940 760 952 M 980 1010 Q 1300 1000 1700 1012"
        fill="none" stroke={SGP.woodDark} strokeWidth={4} opacity={0.7} />
      {/* 右: 開いたままの戸口 → ほんのり高座の明かり */}
      <rect x={1270} y={120} width={450} height={760} fill="#352A1F" stroke={KRP.ink} strokeWidth={9} />
      <ellipse cx={1495} cy={560} rx={250} ry={380} fill={SGP.lampGold} opacity={0.24 + flick} />
      {/* 奥の小さな高座: 金屏風 + 緋毛氈の台 + 落語家 */}
      <rect x={1372} y={404} width={246} height={232} fill={C.byobu} stroke={KRP.ink} strokeWidth={6} />
      {[1454, 1536].map((bx) => (
        <line key={bx} x1={bx} y1={410} x2={bx} y2={630} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
      ))}
      <rect x={1350} y={640} width={290} height={70} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1350} y={624} width={290} height={20} fill={C.mousen} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={1495} cy={470} rx={110} ry={120} fill={SGP.lampGold} opacity={0.3 + flick} />
      <Rakugoka x={1495} y={620} s={0.72} f={f} phase={5} pose="calm" face="smile" />
      {/* 戸口からこぼれる床の光 */}
      <polygon points="1280,880 1710,880 1900,1080 1120,1080"
        fill={SGP.lampGold} opacity={0.14 + flick} />
      {/* 左に引き残した戸 */}
      <rect x={1720} y={110} width={170} height={780} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <line x1={1805} y1={116} x2={1805} y2={884} stroke={KRP.ink} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={1724} y1={240 + i * 170} x2={1886} y2={240 + i * 170} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 主役: 案内文の大写し (画鋲で壁に) */}
      <g transform="rotate(-1.2 660 500)">
        <rect x={150} y={150} width={1030} height={690} fill={SGP.paper}
          stroke={KRP.ink} strokeWidth={8} />
        <path d="M 150 196 L 196 150 M 1180 800 L 1136 840" fill="none"
          stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        <path d="M 980 150 Q 990 210 976 266" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
        {[[180, 180], [1150, 180], [180, 810], [1150, 810]].map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={px - 2} cy={py - 2} r={2.5} fill={KRP.white} opacity={0.8} />
          </g>
        ))}
        {/* 掲示の見出しだけ短いラベル。本文は墨の筋で表す (台本の引用は絵に書かない) */}
        <text x={665} y={290} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={76} fill={KRP.ink}>おねがい</text>
        <path d="M 404 326 Q 665 334 926 324" fill="none"
          stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
        {/* 本文 = 墨の筋 (4行。筆の払いで端を細く) */}
        {[
          { y: 432, x1: 286, x2: 1046 },
          { y: 522, x1: 330, x2: 1002 },
          { y: 612, x1: 286, x2: 1046 },
          { y: 702, x1: 396, x2: 936 },
        ].map((r, i) => (
          <g key={i}>
            <path d={`M ${r.x1} ${r.y} Q ${(r.x1 + r.x2) / 2} ${r.y - 7} ${r.x2} ${r.y}`}
              fill="none" stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" opacity={0.82} />
            <path d={`M ${r.x1 + 70} ${r.y + 26} h ${(r.x2 - r.x1) * 0.42}`}
              fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.4} />
          </g>
        ))}
        {/* 朱の下線が順に引かれる */}
        <line x1={330} y1={556} x2={330 + 672 * u1} y2={556}
          stroke={KRP.red} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
        <line x1={396} y1={736} x2={396 + 540 * u2} y2={736}
          stroke={KRP.red} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
      </g>
      {/* 壁の小さな貼り紙2枚 (世界の小物) */}
      <g transform="rotate(2 120 930)">
        <rect x={40} y={884} width={170} height={120} fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 60 916 h 130 M 60 944 h 110 M 60 972 h 124" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      </g>
      <Chochin x={1240} y={46} s={0.85} f={f} phase={2} text="寄席" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #221 お弁当を食べながら、ビールを飲みながらで、かまいません。
// 格: 並 / seed 1349
// 絵: 客席。膝の上の弁当とビール。高座の芸人がにっこり。1巻#17の江戸の桟敷と同じ構図で
// どこ: 寄席の客席の中 (江戸の桟敷と同じ引きの構図)。左上=高座、右下=桟敷の客
// 演出: 膝の上の弁当とビール。高座の芸人がにっこり客を指す。手前は客の後頭部
// 動き: 湯気とビールの泡が立ちのぼり、芸人が小さく体を揺らし、客がもぐもぐ
const Sg221: React.FC<{ f: number }> = ({ f }) => {
  const mogu = Math.sin(f / 5) * 3; // もぐもぐ
  return (
    <Frame f={f} seed={1349}>
      {/* 壁と床 (暖色の席内) */}
      <rect x={-20} y={-20} width={W + 40} height={620} fill="#E2D2A8" />
      <rect x={-20} y={580} width={W + 40} height={520} fill={C.tatami} />
      <line x1={-20} y1={580} x2={1940} y2={580} stroke={KRP.ink} strokeWidth={6} />
      {/* 畳の目 */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={lerp(560, 120, i / 2)} y1={1100} x2={lerp(1020, 1940, i / 2)}
          y2={600} stroke={KRP.ink} strokeWidth={3} opacity={0.18} />
      ))}
      {/* 左上: 高座 (緋毛氈 + 金屏風) */}
      <rect x={120} y={120} width={560} height={330} fill={C.byobu} stroke={KRP.ink} strokeWidth={7} />
      {[260, 400, 540].map((bx) => (
        <line key={bx} x1={bx} y1={126} x2={bx} y2={444} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      ))}
      <path d="M 160 200 q 40 -26 84 0 M 420 320 q 40 -26 84 0" fill="none"
        stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.5} />
      <rect x={60} y={430} width={700} height={170} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 110 500 Q 320 492 540 502" fill="none" stroke={SGP.woodDark} strokeWidth={3.5} />
      <rect x={60} y={412} width={700} height={24} fill={C.mousen} stroke={KRP.ink} strokeWidth={6} />
      {/* 座布団 + 落語家 (着物に羽織・正座・扇子で客を指す) */}
      <Rakugoka x={400} y={408} s={0.95} f={f} phase={2} pose="point" face="joy" />
      {/* 軒の提灯2つ */}
      <Chochin x={1050} y={40} s={0.85} f={f} phase={1} text="寄席" />
      <Chochin x={1700} y={40} s={0.85} f={f} phase={4} />
      {/* 桟敷の仕切りの木枠 (この奥に客が座る = 足が隠れる) */}
      <rect x={820} y={700} width={1120} height={36} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6.5} />
      {[880, 1040, 1200, 1360, 1520, 1680, 1840].map((vx) => (
        <rect key={vx} x={vx} y={736} width={20} height={200} fill={SGP.wood}
          stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* 客A: 弁当を膝に (hold の手の上に弁当箱) */}
      <Person x={1150} y={940 + mogu * 0.4} s={1.3} cloth="#B06A3C" clothDark="#8E5430"
        face="joy" pose="hold" f={f} phase={0} />
      <g transform={`translate(1150 ${786 + mogu * 0.4})`}>
        <rect x={-86} y={-34} width={172} height={52} rx={6}
          fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-78} y={-28} width={156} height={40} rx={4} fill={SGP.paper} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={-26} y1={-28} x2={-26} y2={12} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={26} y1={-28} x2={26} y2={12} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={-52} cy={-8} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={0} cy={-8} r={10} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        <rect x={40} y={-18} width={24} height={20} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
        {/* 湯気 */}
        {[0, 1].map((i) => (
          <path key={i}
            d={`M ${-30 + i * 60} -40 q ${Math.sin(f / 9 + i * 2) * 12} -22 2 -46`}
            fill="none" stroke={KRP.grayDark} strokeWidth={4.5} opacity={0.5} strokeLinecap="round" />
        ))}
      </g>
      {/* 客B: ビール片手 */}
      <Person x={1600} y={960} s={1.25} cloth="#4A6A8E" clothDark="#3A5470"
        face="smile" pose="hold" f={f} phase={3} />
      <g transform="translate(1600 808)">
        <rect x={-30} y={-64} width={60} height={76} rx={8}
          fill={C.beer} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-30} y={-78} width={60} height={20} rx={8}
          fill="#F8F2E2" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 30 -50 q 26 4 24 28 q -2 22 -24 24" fill="none" stroke={KRP.ink} strokeWidth={5.5} />
        {/* 泡がのぼる */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-14 + i * 14}
            cy={-8 - ((f * (2 + i) + i * 17) % 52)} r={3.4}
            fill={KRP.white} opacity={0.75} />
        ))}
      </g>
      {/* 手前: 客の後頭部の列 (前の段) */}
      {[140, 520, 900, 1330, 1740].map((hx, i) => (
        <PersonMini key={hx} x={hx + rnd(21, i) * 40} y={1210} s={1.5}
          color={["#4A5468", "#5A4A3C", "#6A4A58", "#44584A", "#54586A"][i]}
          face="none" f={f} phase={i} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #222 江戸から続く寄席のルールは、150年の規律化を、素通りしてきました。
// 格: 並 / seed 1350
// 絵: 江戸→明治→昭和→現代の町並み。時代ごとの「規律化」の様子が並ぶ前を 寄席の提灯だけがすいすい素通りしていく
//   (修正3: 3つとも同じ踏切だった関所を 台本に出てきた時代ごとの規制の絵に差し替え)
//   江戸 = 規制なし。茶店の町人が手を振って見送る
//   明治 = 洋風の劇場 (演劇改良会 1886 / 帝国劇場 1911): 茶屋ののれんに× / 切符の窓口 / 中に並んだ椅子席。腕組みの紳士
//   昭和 = 名画座 (1984): 入替制の札 / 上映時刻の時計 / 縦の立て札「途中入場お断り」。制帽の係員が手を上げる
//   現代 = シネコン (1993/1996): 全席指定の看板 / 発券機から座席番号つきの券 / 暗い客席。制服の係員が発券機を指す
// 動き: 提灯が左から右へ滑る。通り過ぎた瞬間に係員の目が提灯を追い ぽかん顔に (びっくり線) / 時計の針 / 券が出てくる
const Sg222: React.FC<{ f: number }> = ({ f }) => {
  // ほぼ等速 (どの時代の前も同じ調子で素通りする)。終わりだけ少し緩める
  const lt = seg(f, 2, 42);
  const lx = lerp(130, 1790, lt * 0.8 + easeOut(lt) * 0.2);
  const GY = 655; // 係員の足元 (時代の歩道)
  // 提灯を見送る反応: 通り過ぎたら目が追い ぽかん顔
  const react = (sx: number) => {
    const passed = lx > sx - 40;
    const g: [number, number] = [Math.max(-1, Math.min(1, (lx - sx) / 90)) * 6, passed ? 6 : 2];
    return { passed, gaze: g, face: (passed ? "surprised" : "normal") as "surprised" | "normal" };
  };
  // びっくり線 (頭の右上に3本)。hx,hy = 頭の中心
  const Bikkuri: React.FC<{ hx: number; hy: number; on: boolean; side?: 1 | -1 }> = ({ hx, hy, on, side = 1 }) =>
    on ? (
      <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" transform={`translate(${hx} ${hy}) scale(${side} 1)`}>
        <line x1={60} y1={-34} x2={80} y2={-52} />
        <line x1={64} y1={-8} x2={90} y2={-12} />
        <line x1={60} y1={18} x2={84} y2={30} />
      </g>
    ) : null;
  const rM = react(735);   // 明治の紳士
  const rS = react(1080);  // 昭和の係員
  const rG = react(1690);  // 現代の係員
  const PS = 0.8;
  const headY = GY - 228 * PS;
  const clockA = f * 3;    // 時計の長針
  const ticket = easeOut(seg(f, 18, 34));
  return (
    <Frame f={f} seed={1350}>
      {/* 空 (時代で少し色を変える4帯) */}
      <rect x={-20} y={-20} width={520} height={600} fill="#F3E3BC" />
      <rect x={480} y={-20} width={480} height={600} fill="#EFDFC2" />
      <rect x={960} y={-20} width={480} height={600} fill="#E7E3D2" />
      <rect x={1440} y={-20} width={500} height={600} fill="#DEE5E8" />

      {/* 時代の歩道 (先に敷く。上に立つ物はこのあとに描く) */}
      {/* 江戸の歩道 (土) */}
      <rect x={-20} y={560} width={500} height={104} fill={C.edoGround} stroke={KRP.ink} strokeWidth={5} />
      {/* 明治の歩道 (石畳) */}
      <rect x={480} y={560} width={480} height={104} fill={C.cobble} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M ${494 + i * 60} 590 q 24 -8 48 0 M ${514 + i * 60} 628 q 24 -8 48 0`}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      ))}
      {/* 昭和の歩道 */}
      <rect x={960} y={560} width={480} height={104} fill={C.sidewalk} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={990 + i * 80} y1={560} x2={980 + i * 80} y2={664} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      ))}
      {/* いまの広場 */}
      <rect x={1440} y={560} width={500} height={104} fill={C.plaza} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={1470 + i * 100} y1={560} x2={1470 + i * 100} y2={664} stroke={KRP.white} strokeWidth={4} opacity={0.7} />
      ))}
      {/* ===== 江戸: 規制なし (茶店と町家) ===== */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
        {/* 町家 */}
        <rect x={30} y={384} width={200} height={176} fill="#E8DCC0" />
        <path d="M 10 390 L 60 330 L 200 330 L 250 390 Z" fill={SGP.woodDark} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={36 + i * 44} y1={336} x2={18 + i * 50} y2={388} strokeWidth={3} opacity={0.5} />
        ))}
        <rect x={48} y={420} width={84} height={80} fill={SGP.wood} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={58 + i * 16} y1={420} x2={58 + i * 16} y2={500} strokeWidth={3.5} />
        ))}
        <rect x={150} y={420} width={66} height={140} fill="#5A4636" />
        <path d="M 150 420 L 216 420 L 216 472 L 184 472 L 183 430 L 182 472 L 150 472 Z" fill={KRP.blueDeep} strokeWidth={4} />
        {/* 茶店 */}
        <rect x={262} y={400} width={200} height={160} fill="#EADFC6" />
        <path d="M 246 404 L 290 350 L 436 350 L 478 404 Z" fill={SGP.woodDark} />
        <rect x={262} y={404} width={200} height={20} fill={C.mousen} strokeWidth={4} />
        {/* 茶店ののれんと団子の旗 */}
        <path d="M 290 424 L 440 424 L 440 476 L 404 476 L 402 432 L 400 476 L 366 476 L 364 432 L 362 476 L 328 476 L 326 432 L 324 476 L 290 476 Z"
          fill="#6E8C5A" strokeWidth={4} />
      </g>
      {/* 町人2人: 団子を持つ人 / 両手で見送る人 */}
      <Kasane x={120} y={GY} s={0.72} f={f} phase={1}
        front={
          <g>
            <EdoFront obi={SGP.woodDark} />
            <g transform="translate(14 -126)">
              <line x1={0} y1={8} x2={0} y2={-58} stroke={SGP.woodDark} strokeWidth={5} strokeLinecap="round" />
              {[-16, -32, -48].map((dy, i) => (
                <circle key={i} cx={0} cy={dy} r={10} fill={["#F4E2D0", KRP.white, "#9CC48A"][i]} stroke={KRP.ink} strokeWidth={3.5} />
              ))}
            </g>
          </g>
        }>
        <Person x={0} y={0} s={1} f={f} phase={1} still cloth="#5B7FA6" clothDark="#46658A" face="smile" pose="hold"
          gaze={[Math.max(-1, Math.min(1, (lx - 120) / 90)) * 6, 3]} />
      </Kasane>
      <Kasane x={370} y={GY} s={0.72} f={f} phase={4} front={<EdoFront obi="#3E4B66" />}>
        <Person x={0} y={0} s={1} f={f} phase={4} still cloth="#B06A3C" clothDark="#8E5430" face="joy" pose="banzai" />
      </Kasane>

      {/* ===== 明治: 洋風の劇場 / 茶屋ののれんに× / 切符の窓口 / 椅子席 ===== */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
        <path d="M 556 304 L 755 252 L 954 304 Z" fill={C.stoneW} />
        <circle cx={755} cy={286} r={12} fill={SGP.lampGold} strokeWidth={4} />
        <rect x={560} y={302} width={390} height={258} fill={C.stoneW} />
        <rect x={552} y={300} width={406} height={16} fill="#D6CBB6" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${592 + i * 72} 392 l 0 -38 a 16 16 0 0 1 32 0 l 0 38 Z`} fill={KRP.blueSoft} strokeWidth={4} />
        ))}
        <line x1={560} y1={410} x2={950} y2={410} strokeWidth={4} opacity={0.6} />
        <rect x={566} y={316} width={18} height={244} fill="#DCD2BF" strokeWidth={4} />
        <rect x={926} y={316} width={18} height={244} fill="#DCD2BF" strokeWidth={4} />
        {/* 切符の窓口 */}
        <rect x={600} y={448} width={86} height={84} fill={SGP.woodDark} />
        <rect x={610} y={458} width={66} height={56} fill="#F6E9C8" strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={624 + i * 20} y1={458} x2={624 + i * 20} y2={514} strokeWidth={3} />
        ))}
        <rect x={604} y={418} width={78} height={30} rx={4} fill={KRP.white} strokeWidth={3.5} />
        {/* 入口: 中に並んだ椅子席 */}
        <path d="M 800 560 L 800 452 Q 850 412 900 452 L 900 560 Z" fill="#5A4636" />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={808 + k * 22 + r * 2} y={480 + r * 26} width={16} height={22} rx={3}
                fill={C.mousen} strokeWidth={3} />
            ))}
          </g>
        ))}
      </g>
      <text x={643} y={442} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>切符</text>
      {/* 茶屋ののれん + 大きな× (茶屋は通さない) */}
      <g>
        <line x1={498} y1={500} x2={498} y2={GY} stroke={KRP.ink} strokeWidth={7} />
        <line x1={578} y1={500} x2={578} y2={GY} stroke={KRP.ink} strokeWidth={7} />
        <rect x={490} y={494} width={96} height={14} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={502 + i * 24} y={508} width={21} height={70} fill="#4A6690"
            stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${Math.sin(f / 9 + i) * 2} ${512 + i * 24} 508)`} />
        ))}
        <path d="M 504 516 L 572 584 M 572 516 L 504 584" stroke={KRP.red} strokeWidth={11} strokeLinecap="round" />
      </g>
      {/* 紳士 (フロックコート + シルクハット)。腕組みで立つ */}
      <Kasane x={735} y={GY} s={PS} f={f} phase={2} back={<FrockBack />} front={<FrockFront />}>
        <Person x={0} y={0} s={1} f={f} phase={2} still cloth={C.frock} clothDark="#221F26"
          face={rM.face} gaze={rM.gaze} pose="armsFolded" />
      </Kasane>
      <Bikkuri hx={735} hy={headY} on={rM.passed} />

      {/* ===== 昭和: 名画座 / 入替制 / 時計 / 途中入場お断りの立て札 ===== */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
        <rect x={990} y={330} width={430} height={230} fill={C.meigaza} />
        <rect x={980} y={318} width={450} height={24} fill="#A86C44" />
        {/* ポスター枠 (題名は描かない) */}
        <rect x={1006} y={392} width={74} height={108} fill={KRP.white} />
        <circle cx={1043} cy={430} r={20} fill={KRP.blueDeep} strokeWidth={3.5} />
        <path d="M 1014 492 L 1036 460 L 1054 480 L 1072 456 L 1072 492 Z" fill={KRP.orange} strokeWidth={3.5} />
        {/* 時計 (上映時刻) */}
        <circle cx={1205} cy={372} r={30} fill={KRP.white} strokeWidth={5} />
        <line x1={1205} y1={372} x2={1205 + Math.sin(clockA * Math.PI / 180) * 22} y2={372 - Math.cos(clockA * Math.PI / 180) * 22} strokeWidth={4} strokeLinecap="round" />
        <line x1={1205} y1={372} x2={1219} y2={380} strokeWidth={5} strokeLinecap="round" />
        {/* ガラスの扉 */}
        <rect x={1150} y={440} width={110} height={120} fill={C.screenlit} />
        <line x1={1205} y1={440} x2={1205} y2={560} strokeWidth={4} />
        <rect x={1160} y={452} width={18} height={60} fill={KRP.white} opacity={0.25} strokeWidth={0} />
      </g>
      <TagPlate x={1205} y={420} text="入替制" size={26} t={seg(f, 10, 18)} fill={KRP.yellow} />
      {/* 立て札 (縦書き) */}
      <g>
        <rect x={1349} y={600} width={14} height={GY - 600} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1326} y={388} width={60} height={224} rx={4} fill={SGP.paper} stroke={KRP.ink} strokeWidth={5} />
        {"途中入場お断り".split("").map((ch, i) => (
          <text key={i} x={1356} y={420 + i * 29} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={27} fill={KRP.ink}>{ch}</text>
        ))}
      </g>
      {/* 制帽の係員: 手を上げて止める */}
      <Kasane x={1080} y={GY} s={PS} f={f} phase={5} front={<SeiboFront />}>
        <Person x={0} y={0} s={1} f={f} phase={5} still cloth={C.usher} clothDark={C.usherDark}
          face={rS.face} gaze={rS.gaze} pose="raise" />
      </Kasane>
      <Bikkuri hx={1080} hy={headY} on={rS.passed} side={-1} />

      {/* ===== 現代: シネコン / 全席指定 / 発券機と座席番号の券 / 暗い客席 ===== */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
        <rect x={1470} y={290} width={440} height={270} fill={C.glassCine} />
        <rect x={1462} y={278} width={456} height={46} fill="#3E4656" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={1470 + i * 88} y1={324} x2={1470 + i * 88} y2={560} strokeWidth={3.5} opacity={0.6} />
        ))}
        <line x1={1470} y1={440} x2={1910} y2={440} strokeWidth={3.5} opacity={0.6} />
        {/* 奥の暗い客席 (ガラス越し) */}
        <rect x={1774} y={340} width={124} height={204} fill={C.night3} />
        <rect x={1786} y={352} width={100} height={40} fill={C.screenlit} strokeWidth={3} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={1790 + k * 24} y={420 + r * 36} width={18} height={24} rx={4} fill={C.seat} strokeWidth={3} />
            ))}
          </g>
        ))}
        <path d="M 1490 340 L 1520 340 L 1490 380 Z" fill={KRP.white} opacity={0.5} strokeWidth={0} />
      </g>
      <TagPlate x={1690} y={302} text="全席指定" size={28} t={seg(f, 14, 22)} fill={KRP.white} />
      {/* 発券機 + 座席番号つきの券が出てくる */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
        <rect x={1486} y={430} width={92} height={GY - 430} rx={10} fill="#5D6B7C" />
        <rect x={1496} y={446} width={72} height={60} rx={6} fill={SGP.phoneBlue} opacity={0.9} />
        <rect x={1506} y={460} width={52} height={10} rx={3} fill={KRP.white} strokeWidth={0} opacity={0.8} />
        <rect x={1506} y={480} width={34} height={10} rx={3} fill={KRP.white} strokeWidth={0} opacity={0.8} />
        <rect x={1498} y={530} width={68} height={10} rx={4} fill={KRP.ink} />
        <rect x={1500} y={600} width={64} height={40} rx={6} fill="#4A5666" strokeWidth={4} />
      </g>
      {/* 券: 取り出し口から上へ出てくる (座席番号つき) */}
      <g transform={`translate(1532 ${536 - ticket * 30})`} opacity={ticket > 0 ? 1 : 0}>
        <rect x={-50} y={-50} width={100} height={52} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-50} y={-50} width={14} height={52} rx={3} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <text x={8} y={-13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>G-12</text>
      </g>
      {/* 制服の係員: 発券機を指す */}
      <Kasane x={1690} y={GY} s={PS} f={f} phase={7} front={<StaffFront />}>
        <Person x={0} y={0} s={1} f={f} phase={7} still cloth={C.staffPolo} clothDark="#2E3A4A"
          face={rG.face} gaze={rG.gaze} pose="point" pointDir={-1} />
      </Kasane>
      <Bikkuri hx={1690} hy={headY} on={rG.passed} />

      {/* 時代の札 (読点なし・数字なし)。横一列に見くらべる札なので高さは同じ値にそろえる (からくり検査4)。
          傾き (rot) だけで手描きらしさを出す */}
      <TagPlate x={250} y={200} text="江戸" size={40} t={seg(f, 2, 10)} rot={-2} />
      <TagPlate x={720} y={200} text="明治" size={40} t={seg(f, 8, 16)} rot={1.5} />
      <TagPlate x={1190} y={200} text="昭和" size={40} t={seg(f, 14, 22)} rot={-1.5} />
      <TagPlate x={1660} y={200} text="現代" size={40} t={seg(f, 20, 28)} rot={2} />
      {/* 手前の脇道 (寄席の提灯が通る 止める者のない道) */}
      <path d="M -20 664 L 1940 664 L 1940 1100 L -20 1100 Z" fill={C.lane} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -20 860 Q 480 830 960 846 Q 1440 862 1940 836" fill="none"
        stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.35} />
      {/* 提灯が通ってきた跡 (どの時代でも止まらず一本で続く) */}
      <path d={`M 60 772 L ${lx - 60} 772`} fill="none" stroke={KRP.red} strokeWidth={6}
        strokeDasharray="4 22" strokeLinecap="round" opacity={0.5} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx={80 + i * 245 + rnd(61, i) * 60} cy={700 + rnd(62, i) * 110} rx={10 + rnd(63, i) * 8} ry={5}
          fill={SGP.woodDark} opacity={0.18} />
      ))}
      {/* 素通りする寄席の提灯 (主役)。すいすい+速度線 */}
      <g transform={`translate(${lx} ${636 + Math.sin(f / 5) * 6})`}>
        <ellipse cx={0} cy={214} rx={70} ry={12} fill={KRP.ink} opacity={0.12} />
        <g stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.65}>
          <line x1={-80} y1={80} x2={-190} y2={82} />
          <line x1={-90} y1={120} x2={-240} y2={124} />
          <line x1={-76} y1={160} x2={-170} y2={162} />
        </g>
        <Chochin x={0} y={0} s={1} f={f} phase={6} text="寄席" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #223 どの犯人にも、ついに逮捕されなかった、生き証人です。
// 格: 山 / seed 1351
// 絵: **手配書の全回収**。掲示板に6枚全部「御用」。その横に手配書ではなく表彰状の枠で、鈴本の提灯。「逮捕できず」の札。笑いと感動
// どこ: 夕方の高札場の前。瓦屋根つきの大きな掲示板と見物の人だか
// 演出: 手配書6枚に「御用」が順にドン。右に表彰状の枠で鈴本の提灯+「逮捕できず」の札
// 動き: 朱印が1枚ずつ押され、最後に表彰状がポンと出て、見物人が両腕を上げる
const Sg223: React.FC<{ f: number }> = ({ f }) => {
  const shoT = pop(clamp01(seg(f, 32, 40)));
  return (
    <Frame f={f} seed={1351}>
      {/* 夕方の空と地面 */}
      <rect x={-20} y={-20} width={W + 40} height={1000} fill={C.duskSky} />
      <rect x={-20} y={940} width={W + 40} height={160} fill={C.roadDust} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={1760} cy={130} r={64} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
      {[[300, 990], [820, 1020], [1500, 1000]].map(([sx, sy], i) => (
        <ellipse key={i} cx={sx} cy={sy} rx={90} ry={18} fill={C.wallWood2}
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
      ))}
      {/* 高札場: 柱 + 瓦屋根 + 掲示板 */}
      <rect x={120} y={120} width={44} height={830} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1136} y={120} width={44} height={830} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 60 130 L 650 54 L 1240 130 L 1200 130 L 650 72 L 100 130 Z"
        fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M ${80 + i * 82} 130 a 41 24 0 0 1 82 0 Z`}
          fill={C.wallWood2} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <rect x={140} y={160} width={1020} height={760} rx={8}
        fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
      <path d="M 180 220 Q 500 212 940 222 M 220 860 Q 640 868 1100 858"
        fill="none" stroke={SGP.woodDark} strokeWidth={3.5} />
      {/* 手配書6枚 (2段×3列)。御用の朱印が順に押される */}
      {([1, 2, 3, 4, 5, 6] as const).map((w, i) => (
        <Tehaisho key={w} f={f} who={w}
          x={330 + (i % 3) * 320} y={i < 3 ? 330 : 740} s={0.56}
          t={1} goyoT={seg(f, 2 + i * 5, 8 + i * 5)} />
      ))}
      {/* 右: 手配書ではなく表彰状の枠。鈴本の提灯だけ逮捕できず */}
      <g transform={`translate(1560 430) scale(${Math.max(shoT, 0.0001)})`}>
        <rect x={-260} y={-330} width={520} height={660} rx={10}
          fill="#C9A23C" stroke={KRP.ink} strokeWidth={9} />
        <rect x={-236} y={-306} width={472} height={612} rx={6}
          fill={SGP.paper} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -236 -306 L -212 -282 M 236 306 L 212 282 M 236 -306 L 212 -282 M -236 306 L -212 282"
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        <rect x={-130} y={-282} width={260} height={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <text x={0} y={-236} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={44} fill={KRP.ink} letterSpacing={10}>表彰</text>
        {/* 中央に鈴本の提灯 (誇らしく光る) */}
        <Chochin x={0} y={-180} s={1.5} f={f} phase={7} text="鈴本" />
        {/* 金の飾りひも */}
        <path d="M -170 230 q 60 40 170 40 q 110 0 170 -40" fill="none"
          stroke="#C9A23C" strokeWidth={9} />
        <circle cx={0} cy={258} r={26} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -12 278 L -24 302 M 12 278 L 24 302" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
      </g>
      {/* 札は表彰状の枠の下辺に掛ける (回転札の実下端 812 ≤ 820) */}
      <TagPlate x={1560} y={770} text="逮捕できず" size={38} t={seg(f, 38, 42)}
        color={KRP.red} rot={-2} />
      {/* 見物の人だか (歓声) */}
      {[260, 560, 900, 1300, 1700].map((px, i) => (
        <PersonMini key={px} x={px + rnd(31, i) * 50} y={1180} s={1.35}
          color={["#4A5468", "#6A4A58", "#44584A", "#5A4A3C", "#3E4B66"][i]}
          face={i === 2 ? "smile" : "none"} arms={seg(f, 34, 42) > 0.5 ? "up" : "down"}
          f={f} phase={i} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #224 さて、客席の明かりの話を、覚えているでしょうか。
// 格: 並 / seed 1352
// 絵: 暗い画面に `Danmen` の輪郭だけがうっすら浮かぶ。思い出させる溜め
// どこ: 真っ暗な中。劇場断面図の輪郭だけがうっすら (リキャップ前の溜め)
// 演出: Danmen 状態D (最暗部のまま) を低い不透明度で。先出し禁止の E は出さない
// 動き: 輪郭が f でゆっくり浮かび上がり、背後の靄が脈打つ。？がそっと灯る
const Sg224: React.FC<{ f: number }> = ({ f }) => {
  const o = 0.1 + easeOut(seg(f, 4, 42)) * 0.2;
  const pulse = 0.5 + 0.5 * Math.sin(f / 10);
  return (
    <Frame f={f} seed={1352} dark bg={C.night}>
      {/* 床板がかろうじて見える (素の闇にしない) */}
      <g stroke={KRP.grayDark} opacity={0.09}>
        {[900, 950, 1000, 1050].map((y) => (
          <line key={y} x1={-20} y1={y} x2={1940} y2={y + 6} strokeWidth={3.5} />
        ))}
        <line x1={420} y1={900} x2={360} y2={1080} strokeWidth={3} />
        <line x1={1480} y1={902} x2={1560} y2={1080} strokeWidth={3} />
      </g>
      {/* 記憶の靄 (ゆっくり脈打つ) */}
      <ellipse cx={960} cy={540} rx={880} ry={420} fill="#2A3346" opacity={0.22 + pulse * 0.08} />
      <ellipse cx={960} cy={540} rx={560} ry={280} fill="#333E54" opacity={0.16 + pulse * 0.06} />
      {/* 断面図の輪郭だけがうっすら */}
      <g opacity={o}>
        <Danmen f={f} state="D" x={960} y={540} s={0.94} t={1} />
      </g>
      <QMark x={1580} y={240} s={0.9} f={f} t={seg(f, 24, 36)} color={KRP.grayDark} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #225 1876年、ワーグナーが消した、あの明かりです。
// 格: 並 / seed 1353
// 絵: 2巻#86の暗転の瞬間がミニ回想の泡で。ガス灯のバルブ
// どこ: 暗がりの中、右手前にガス灯の配管とバルブの大写し。左上に回想の泡
// 演出: 泡の中はあの暗転の瞬間 (劇場の客席が沈み、壁のガス灯が消える)。年号は描かない
// 動き: バルブが回り、炎がすぼんでいく。泡の中も同じ呼吸で暗くなる
const Sg225: React.FC<{ f: number }> = ({ f }) => {
  const off = easeOut(seg(f, 8, 38));       // 0=点灯 → 1=消灯
  const flameS = lerp(1, 0.12, off);
  const valveRot = off * 160;
  return (
    <Frame f={f} seed={1353} dark bg={C.night2}>
      {/* 奥の壁 (石積みがかすかに) */}
      <g stroke={KRP.grayDark} opacity={0.12} fill="none" strokeWidth={3.5}>
        {[0, 1, 2, 3].map((r) => (
          <path key={r} d={`M -20 ${260 + r * 210} H 1940 M ${300 + r * 180} ${260 + r * 210} v 210 M ${900 + r * 200} ${260 + r * 210} v 210`} />
        ))}
      </g>
      {/* 回想の泡 (もくもくの縁取り) */}
      <g opacity={easeOut(seg(f, 0, 14))}>
        <path d="M 160 580 Q 60 560 80 460 Q 40 360 150 320 Q 150 210 280 200 Q 330 110 460 130
                 Q 560 70 680 110 Q 820 70 920 130 Q 1060 110 1110 200 Q 1230 220 1230 330
                 Q 1320 400 1270 490 Q 1300 580 1190 620 Q 1140 700 1010 690 Q 920 750 800 720
                 Q 680 770 570 720 Q 430 750 360 690 Q 230 690 210 610 Q 170 600 160 580 Z"
          fill="#39455E" stroke={KRP.white} strokeWidth={6} opacity={0.96} />
        {/* 泡のしっぽ (バルブへ) */}
        <circle cx={1270} cy={700} r={30} fill="#39455E" stroke={KRP.white} strokeWidth={5} />
        <circle cx={1350} cy={760} r={18} fill="#39455E" stroke={KRP.white} strokeWidth={4.5} />
        {/* --- 泡の中: 歌劇場の暗転の瞬間 --- */}
        <g>
          {/* 舞台の額縁と幕 (明るいまま) */}
          <rect x={300} y={250} width={300} height={330} fill="#4A3A30" stroke={KRP.white} strokeWidth={4} opacity={0.9} />
          <ellipse cx={450} cy={420} rx={120} ry={150} fill={SGP.lampGold} opacity={0.3} />
          <path d="M 310 258 L 350 258 Q 342 420 356 568 L 312 568 Z M 590 258 L 550 258 Q 558 420 544 568 L 588 568 Z"
            fill={C.mousen} stroke={KRP.white} strokeWidth={3.5} />
          <PersonMini x={450} y={560} s={0.6} color="#7A5A3C" face="none" f={f} phase={8} />
          {/* 客席の客 (暗くなるにつれ沈む) */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <PersonMini key={i} x={700 + (i % 3) * 130 + (i > 2 ? 50 : 0)} y={500 + (i > 2 ? 110 : 0)}
              s={0.52} color="#5A6478" face="none" f={f} phase={i} />
          ))}
          {/* 客席が暗転していく覆い */}
          <rect x={620} y={240} width={560} height={450} fill="#101722" opacity={off * 0.7} />
          {/* 壁のガス灯2つ (炎が同じ呼吸で消える) */}
          {[680, 1120].map((gx, i) => (
            <g key={gx} transform={`translate(${gx} 300)`}>
              <line x1={0} y1={30} x2={0} y2={64} stroke={KRP.white} strokeWidth={4} />
              <circle cx={0} cy={0} r={26} fill="none" stroke={KRP.white} strokeWidth={4} />
              <ellipse cx={0} cy={4} rx={9 * flameS} ry={16 * flameS}
                fill={SGP.lampGold} opacity={0.95} />
              {off > 0.75 && (
                <path d={`M 2 -12 C ${8 + Math.sin(f / 7 + i) * 3} -28 ${-4 + Math.sin(f / 9 + i) * 3} -44 4 -60`}
                  fill="none" stroke={KRP.gray} strokeWidth={3.5} opacity={0.7} strokeLinecap="round" />
              )}
            </g>
          ))}
        </g>
      </g>
      {/* 主役: ガス灯の配管とバルブの大写し (手前・右) */}
      <g>
        {/* 縦の配管 */}
        <rect x={1510} y={300} width={64} height={800} rx={14}
          fill="#8E7A4A" stroke={KRP.ink} strokeWidth={7} />
        <line x1={1528} y1={320} x2={1528} y2={1080} stroke={KRP.white} strokeWidth={5} opacity={0.25} />
        {[420, 900].map((jy) => (
          <g key={jy}>
            <rect x={1496} y={jy} width={92} height={34} rx={8}
              fill="#79683E" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={1512} cy={jy + 17} r={4} fill={KRP.ink} />
            <circle cx={1572} cy={jy + 17} r={4} fill={KRP.ink} />
          </g>
        ))}
        {/* ガラスの笠と炎 (上端) */}
        <path d="M 1482 300 L 1602 300 L 1582 212 L 1502 212 Z"
          fill="#C9D8E0" stroke={KRP.ink} strokeWidth={6} opacity={0.85} />
        <ellipse cx={1542} cy={252} rx={70 * flameS + 8} ry={54 * flameS + 6}
          fill={SGP.lampGold} opacity={0.3} />
        <path d={`M 1542 ${288 - 56 * flameS} C ${1542 - 22 * flameS} ${280 - 22 * flameS} ${1542 - 16 * flameS} 284 1542 288
                 C ${1542 + 16 * flameS} 284 ${1542 + 22 * flameS} ${280 - 22 * flameS} 1542 ${288 - 56 * flameS} Z`}
          fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3.5} />
        {/* バルブのハンドル (回る) */}
        <g transform={`translate(1542 660) rotate(${valveRot})`}>
          <circle r={96} fill="none" stroke="#8E7A4A" strokeWidth={26} />
          <circle r={96} fill="none" stroke={KRP.ink} strokeWidth={7} />
          <circle r={70} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={-96} y1={0} x2={96} y2={0} transform={`rotate(${a})`}
              stroke={KRP.ink} strokeWidth={10} />
          ))}
          <circle r={20} fill="#79683E" stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 回す向きの矢印 (弧) */}
        <g opacity={0.85}>
          <path d="M 1352 596 A 190 190 0 0 1 1448 520" fill="none"
            stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
          <polygon points="1448,520 1416,528 1440,556" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #226 いま、暗い映画館や、夜の部屋で、小さな光がともっています。
// 格: 並 / seed 1354
// 絵: 暗い客席の列。ぽつ、ぽつ、と小さな光が灯りはじめる。夜の部屋の窓にも同じ光
// どこ: 深夜の映画館 (左2/3・後方から) と夜のマンション (右1/3) の二つながり
// 演出: 暗い座席の列に、ぽつ…ぽつ…と青い小さな光。右の夜景の窓にも同じ色の光が灯る
// 動き: スクリーンの明滅 / PhoneDot が1つずつ順に点灯 / 窓の光も遅れて点く
const Sg226: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.75 + Math.sin(f / 3.2) * 0.1 + Math.sin(f / 7.7) * 0.06;
  const lightT = seg(f, 6, 40); // 0→1 で光が順に増える
  // 客席のスマホ位置 (x, y, 点灯順)
  const dots: [number, number, number][] = [
    [360, 668, 0], [828, 700, 1], [612, 836, 2], [1056, 862, 3],
    [252, 892, 4], [930, 598, 5], [486, 596, 6],
  ];
  return (
    <Frame f={f} seed={1354} dark bg={C.night3}>
      {/* ==== 左: 映画館 (後方からの引き) ==== */}
      <g>
        {/* スクリーン (遠く・明滅) */}
        <rect x={210} y={150} width={880} height={370} rx={10}
          fill={C.screenlit} opacity={flick} />
        <rect x={210} y={150} width={880} height={370} rx={10}
          fill="none" stroke="#0B101B" strokeWidth={14} />
        {/* スクリーンの中のぼんやりした絵 (山の稜線) */}
        <path d="M 260 440 L 450 280 L 610 400 L 800 250 L 1040 440 Z"
          fill="#2B3850" opacity={flick * 0.9} />
        <circle cx={940} cy={240} r={40} fill="#58688A" opacity={flick * 0.7} />
        {/* 壁の非常灯 (世界の小物) */}
        <rect x={120} y={430} width={54} height={30} rx={5} fill="#3A7A4A" opacity={0.75} />
        {/* スクリーン光が床へ落ちる */}
        <polygon points="210,520 1090,520 1180,1020 120,1020"
          fill="#2E3A54" opacity={flick * 0.28} />
        {/* 座席の列 (手前ほど大きい3列) */}
        {[0, 1, 2].map((row) => {
          const ry = 620 + row * 150;
          const rs = 1 + row * 0.22;
          const n = 7 - row;
          return (
            <g key={row}>
              {Array.from({ length: n }).map((_, i) => {
                const sx = 180 + i * (150 * rs) + (row % 2) * 60;
                if (sx > 1150) return null;
                return (
                  <g key={i}>
                    {/* 頭 (座席の後ろから少し) */}
                    <circle cx={sx + 62 * rs} cy={ry - 26 * rs} r={30 * rs}
                      fill="#38404F" />
                    {/* 座席の背もたれ */}
                    <rect x={sx} y={ry - 14 * rs} width={124 * rs} height={96 * rs}
                      rx={16 * rs} fill={C.seat}
                      stroke="#1B2230" strokeWidth={5} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* スマホの小さな光 (順に点灯) */}
        {dots.map(([dx, dy, ord], i) => {
          const o = clamp01(lightT * 8 - ord);
          return <PhoneDot key={i} x={dx} y={dy} s={1 + rnd(1354, i) * 0.3} o={o} />;
        })}
      </g>
      {/* ==== 境界 (壁の角) ==== */}
      <rect x={1232} y={0} width={26} height={1080} fill="#0C121D" />
      {/* ==== 右: 夜の住宅街 ==== */}
      <g>
        <rect x={1258} y={0} width={662} height={1080} fill="#101725" />
        {/* 星と月 */}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={1300 + rnd(21, i) * 580} cy={60 + rnd(22, i) * 300}
            r={3 + rnd(23, i) * 2.5}
            fill="#CBD6E8" opacity={0.4 + Math.sin(f / 9 + i * 2.1) * 0.25} />
        ))}
        <circle cx={1790} cy={130} r={56} fill="#EFE2B8" opacity={0.9} />
        <circle cx={1766} cy={116} r={50} fill="#101725" />
        {/* 奥のビルの影 */}
        <rect x={1290} y={360} width={190} height={720} fill="#161F30" />
        <rect x={1700} y={420} width={180} height={660} fill="#141C2C" />
        {/* 主役のマンション */}
        <rect x={1440} y={300} width={300} height={780} fill="#1C2638"
          stroke="#0C121D" strokeWidth={8} />
        <rect x={1440} y={288} width={300} height={26} fill="#0E1522" />
        {/* 窓の格子 (消えている窓と、青く灯る窓) */}
        {Array.from({ length: 5 }).map((_, ry) =>
          Array.from({ length: 3 }).map((_, cx2) => {
            const wx = 1472 + cx2 * 88;
            const wy = 352 + ry * 140;
            const ord = [2, 7, 9, 4, 11, 6, 1, 10, 8, 3, 12, 5, 13, 0, 14][ry * 3 + cx2];
            const lit = clamp01(lightT * 9 - ord);
            return (
              <g key={`${ry}-${cx2}`}>
                <rect x={wx} y={wy} width={64} height={88} rx={4}
                  fill={lit > 0.5 ? SGP.phoneBlue : "#121A29"}
                  opacity={lit > 0.5 ? 0.25 + lit * 0.6 : 1}
                  stroke="#0C121D" strokeWidth={4} />
                {lit > 0.5 && (
                  <rect x={wx + 8} y={wy + 10} width={48} height={68} rx={3}
                    fill={SGP.phoneBlue} opacity={lit * 0.35} />
                )}
              </g>
            );
          })
        )}
        {/* 手前の屋根並み */}
        <path d="M 1258 980 L 1360 900 L 1470 980 L 1600 906 L 1710 980 L 1830 912 L 1920 980 L 1920 1080 L 1258 1080 Z"
          fill="#0D1420" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #227 スマートフォンの、画面です。
// 格: 山 / seed 1355
// 絵: スマホの画面の光に寄り、持ち主の顔がやわらかく照らされる。**冒頭#1と同じ構図**で円環を閉じる
// どこ: 夜の部屋。ソファにすわる人の顔へぐっと寄る (冒頭#1と同じ構図で円環)
// 演出: スマホの青い光が顔をやわらかく照らす。窓の外は#226と同じ夜の街
// 動き: ゆっくり寄るズーム / 画面の光がふわっと明滅 / 光の輪が脈打つ
const Sg227: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 42)) * 0.1;
  const glow = 0.8 + Math.sin(f / 4.3) * 0.12 + Math.sin(f / 9.1) * 0.06;
  return (
    <Frame f={f} seed={1355} dark bg={C.night4}>
      <g transform={zoomAt(z, 900, 760)}>
        {/* ==== 部屋の世界 ==== */}
        {/* 壁と床 */}
        <rect x={0} y={0} width={1920} height={820} fill={C.night4} />
        <rect x={0} y={820} width={1920} height={260} fill="#161C29" />
        {/* ラグ */}
        <ellipse cx={900} cy={1010} rx={620} ry={110} fill="#232A3A" />
        {/* 窓 (夜の街 = #226の続き) */}
        <g>
          <rect x={1350} y={120} width={430} height={520} rx={8}
            fill="#0F1624" stroke="#2C3346" strokeWidth={12} />
          <line x1={1565} y1={126} x2={1565} y2={634} stroke="#2C3346" strokeWidth={10} />
          <line x1={1356} y1={380} x2={1774} y2={380} stroke="#2C3346" strokeWidth={10} />
          {/* 月と遠くのビル・青く灯る窓 */}
          <circle cx={1700} cy={210} r={34} fill="#EFE2B8" opacity={0.85} />
          <rect x={1390} y={440} width={70} height={194} fill="#141B2B" />
          <rect x={1480} y={470} width={60} height={164} fill="#171F31" />
          <rect x={1620} y={430} width={80} height={204} fill="#131A2A" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={[1404, 1492, 1648][i]} y={[480, 540, 470][i]}
              width={18} height={24} fill={SGP.phoneBlue}
              opacity={clamp01(seg(f, 10 + i * 8, 20 + i * 8)) * 0.8} />
          ))}
        </g>
        {/* 棚と小物 */}
        <g>
          <rect x={150} y={330} width={360} height={330} fill="#1A2130"
            stroke="#2C3346" strokeWidth={8} />
          <line x1={154} y1={440} x2={506} y2={440} stroke="#2C3346" strokeWidth={7} />
          <line x1={154} y1={550} x2={506} y2={550} stroke="#2C3346" strokeWidth={7} />
          {/* 本の背 */}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={180 + i * 44} y={352} width={32} height={82}
              fill={["#3A4258", "#4A3A44", "#35485A", "#464058", "#3C4A50", "#50404A"][i]} />
          ))}
          {/* 2段目: 置き時計 (数字なし) と小鉢 */}
          <circle cx={240} cy={498} r={32} fill="#262E40" stroke="#3C455C" strokeWidth={6} />
          <line x1={240} y1={498} x2={240} y2={476} stroke="#9AA6C0" strokeWidth={5} />
          <line x1={240} y1={498} x2={256} y2={504} stroke="#9AA6C0" strokeWidth={5} />
          <ellipse cx={380} cy={512} rx={46} ry={20} fill="#2C3850" />
          {/* 3段目: 観葉植物 */}
          <rect x={300} y={596} width={44} height={50} fill="#374054" />
          <path d="M 322 600 C 300 560 296 540 318 522 C 330 548 332 572 322 600 Z"
            fill="#2E4A3E" />
          <path d="M 324 600 C 348 566 356 548 340 526 C 326 550 320 576 324 600 Z"
            fill="#355546" />
        </g>
        {/* ==== 主役: ソファの人とスマホ ==== */}
        {/* スマホの光のひろがり (顔を照らす) */}
        <circle cx={880} cy={700} r={330} fill={SGP.phoneBlue} opacity={glow * 0.1} />
        <circle cx={880} cy={690} r={210} fill={SGP.phoneBlue} opacity={glow * 0.14} />
        {/* 光の筋 (画面→顔) */}
        <polygon points="800,810 960,810 1010,560 750,560"
          fill={SGP.phoneBlue} opacity={glow * 0.13} />
        {/* 人 (hold。ひざの上のスマホをのぞく) */}
        <Person x={880} y={1010} s={2.0} f={f} cloth="#55607A" face="smile"
          pose="hold" gaze={[0, 4]} />
        {/* スマホ本体 (holdの手元 y−118*s あたり) */}
        <g transform={`translate(880 ${1010 - 236}) rotate(-8)`}>
          <rect x={-78} y={-50} width={156} height={100} rx={16}
            fill="#20242E" stroke="#0E1118" strokeWidth={7} />
          <rect x={-64} y={-38} width={128} height={76} rx={8}
            fill={SGP.phoneBlue} opacity={glow} />
          {/* 画面のぼんやりした中身 (再生中らしき三角だけ) */}
          <polygon points="-10,-14 18,0 -10,14" fill="#EAF6FA" opacity={glow * 0.9} />
        </g>
        {/* 顔への照り返し (やわらかい) */}
        <ellipse cx={880} cy={790} rx={120} ry={90}
          fill={SGP.phoneBlue} opacity={glow * 0.12} />
        {/* ソファ (前面で脚を隠す) */}
        <g>
          <rect x={560} y={860} width={640} height={190} rx={34}
            fill="#333B4E" stroke="#1C2230" strokeWidth={8} />
          <rect x={500} y={760} width={110} height={240} rx={30}
            fill="#3A4357" stroke="#1C2230" strokeWidth={8} />
          <rect x={1150} y={760} width={110} height={240} rx={30}
            fill="#3A4357" stroke="#1C2230" strokeWidth={8} />
          {/* クッションの縫い目 */}
          <line x1={880} y1={874} x2={880} y2={1040} stroke="#1C2230" strokeWidth={6} />
        </g>
        {/* マグカップ (ソファ脇のサイドテーブル) */}
        <g>
          <rect x={1290} y={880} width={150} height={16} rx={6} fill="#2A3142" />
          <rect x={1348} y={896} width={18} height={130} fill="#242B3C" />
          <rect x={1330} y={830} width={66} height={54} rx={8} fill="#44506A" />
          <path d="M 1396 844 q 30 12 0 30" fill="none" stroke="#44506A" strokeWidth={9} />
          {/* 湯気 */}
          <path d={`M 1358 820 q ${6 * Math.sin(f / 6)} -16 0 -30`}
            fill="none" stroke="#6B7690" strokeWidth={4}
            opacity={0.5 + Math.sin(f / 7) * 0.2} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #228 150年ぶりに、明かりは客席の側へ、戻ってきました。
// 格: 山 / seed 1356
// 絵: **`Danmen` 状態E。リキャップ⑤=オチの図解** (強制結論カード化を避けるため最終文には置かない)。消えていた客席に小さな光が次々と灯る。150年ぶりの客電。出入口の矢印もうっすら復活
// どこ: 劇場断面図 (状態E) の大写し。#224の暗闇から明かりが戻る回復の1枚
// 演出: 消えていた客席に小さな青い光が次々と灯る (Danmen内蔵)。客席側だけ光の暈がひろがる。出入口の⇄矢印をうっすら上描きで復活
// 動き: 断面図がふわっと描かれる → 光の暈が育つ → 矢印が最後に浮かぶ / 青い光の粒がゆっくり昇る
const Sg228: React.FC<{ f: number }> = ({ f }) => {
  const inT = seg(f, 0, 14);
  const haloT = easeOut(seg(f, 12, 42));
  const yaT = seg(f, 32, 42); // 出入口の矢印 (Danmen状態Eには無いので上描き)
  return (
    <Frame f={f} seed={1356} dark bg={C.night5}>
      {/* 床へ落ちるうっすらした照り返し */}
      <ellipse cx={760} cy={1010} rx={760} ry={90}
        fill={SGP.phoneBlue} opacity={haloT * 0.07} />
      {/* 客席側にひろがる光の暈 (回復の主役) */}
      <ellipse cx={700} cy={560} rx={520 * (0.5 + haloT * 0.5)} ry={300 * (0.5 + haloT * 0.5)}
        fill={SGP.phoneBlue} opacity={haloT * 0.13} />
      <ellipse cx={700} cy={560} rx={300 * (0.5 + haloT * 0.5)} ry={180 * (0.5 + haloT * 0.5)}
        fill={SGP.phoneBlue} opacity={haloT * 0.1} />
      {/* 断面図 本体 (状態E: 客席にスマホの光が内蔵で次々灯る) */}
      <Danmen f={f} state="E" x={960} y={540} s={0.98} t={inT} />
      {/* 出入口の⇄矢印 うっすら復活 (状態Eには描かれないので局所上描き) */}
      <g opacity={yaT * 0.55}>
        <g transform={`translate(${960 + 788 * 0.98} ${540 + 72 * 0.98}) scale(0.98)`}
          stroke={SGP.phoneBlue} strokeWidth={8}
          strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1={-44} y1={-10} x2={38} y2={-10} />
          <path d="M 38 -10 L 22 -24 M 38 -10 L 26 2" />
          <line x1={44} y1={16} x2={-38} y2={16} />
          <path d="M -38 16 L -22 2 M -38 16 L -26 30" />
        </g>
      </g>
      {/* 客席からゆっくり昇る青い光の粒 */}
      {Array.from({ length: 9 }).map((_, i) => {
        const bx = 300 + rnd(56, i) * 860;
        const rise = ((f * (0.8 + rnd(57, i) * 0.9) + rnd(58, i) * 160) % 160);
        const by = 760 - rise;
        const o = haloT * (1 - rise / 160) * 0.7;
        return (
          <circle key={i} cx={bx} cy={by} r={5 + rnd(59, i) * 5}
            fill={SGP.phoneBlue} opacity={o} />
        );
      })}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_219: (f) => <Sg219 f={f} />,
  sg_220: (f) => <Sg220 f={f} />,
  sg_221: (f) => <Sg221 f={f} />,
  sg_222: (f) => <Sg222 f={f} />,
  sg_223: (f) => <Sg223 f={f} />,
  sg_224: (f) => <Sg224 f={f} />,
  sg_225: (f) => <Sg225 f={f} />,
  sg_226: (f) => <Sg226 f={f} />,
  sg_227: (f) => <Sg227 f={f} />,
  sg_228: (f) => <Sg228 f={f} />,
};

export const S_C_MOTIFS: string[] = [
  "sg_219", // #219
  "sg_220", // #220
  "sg_221", // #221
  "sg_222", // #222
  "sg_223", // #223
  "sg_224", // #224
  "sg_225", // #225
  "sg_226", // #226
  "sg_227", // #227
  "sg_228", // #228
];

export const saigoCScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
