// 「人類は、昔から飛ばして観ていた」: 文#195〜#206 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1323〜1334。
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
  // 茶の間
  tatami: "#C9BE80",
  tatamiDark: "#AFA466",
  heri: "#3F5840", // 畳縁の深緑
  wallEve: "#EADFC2", // 夕方の砂壁
  wallNight: "#3A4150", // 夜の壁
  nightBg: "#262C39", // 夜の部屋の地
  nageshi: "#6E4A2E", // 長押の木
  // テレビ・機械
  tvWood: "#8A5A36",
  tvWoodDark: "#653E20",
  crtOff: "#303B49",
  crtGlow: "#C7E6EE",
  deckSilver: "#C2C8CE",
  deckDark: "#454B55",
  // 小物
  skin: "#F2D9B8",
  news: "#DCD7C9",
  newsLine: "#8D887C",
  zabuton: "#8A4A52",
  cat: "#D8A35C",
  lampWarm: "#F2E3B2",
  planPaper: "#EDF2EC",
  stickyY: "#F5E07A",
  stickyO: "#F2B46A",
};
void useCurrentFrame; void Stamp; void QMark; void XMark;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void Fuda3;

// ===== このファイルの中だけの小道具 =====================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目の擬似乱数 (毎フレーム同じ値。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// 茶の間の床と壁 (砂壁 + 長押 + 畳の目 + 畳縁の奥行き)
const TatamiRoom: React.FC<{
  floorY?: number; wall?: string; mat?: string; night?: boolean;
}> = ({ floorY = 680, wall = C.wallEve, mat = C.tatami, night }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={floorY + 20} fill={wall} />
    {/* 砂壁の質感 (短い横ハネ) */}
    <g stroke={night ? "#4A5263" : "#D8C9A4"} strokeWidth={3} opacity={0.5} strokeLinecap="round">
      {Array.from({ length: 16 }, (_, i) => {
        const x = rnd(21, i) * W;
        const y = rnd(22, i) * (floorY - 120) + 40;
        return <line key={i} x1={x} y1={y} x2={x + 26 + rnd(23, i) * 30} y2={y} />;
      })}
    </g>
    {/* 長押 */}
    <rect x={-20} y={floorY - 400} width={W + 40} height={24} fill={night ? "#6B5433" : C.nageshi}
      stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    {/* 畳 */}
    <rect x={-20} y={floorY} width={W + 40} height={H - floorY + 20} fill={mat} />
    <line x1={-20} y1={floorY} x2={W + 20} y2={floorY} stroke={KRP.ink} strokeWidth={7} />
    {/* 畳の目 (横筋。手前ほど間隔が広い) */}
    <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={night ? 0.3 : 0.5}>
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 1) / 10;
        const y = floorY + t * t * (H - floorY + 10);
        return <line key={i} x1={-20} y1={y} x2={W + 20} y2={y} />;
      })}
    </g>
    {/* ※修正3: 以前ここにあった「畳縁 (奥へ収束する深緑の帯) 5本」は削除。
         遠近の向きがずれて左下から差す謎の斜め線に見えたため (作者指摘 #196 ほか) */}
  </g>
);

// 木枠のブラウン管テレビ。x,y は足元中央。children = 画面の中身 (clip 済み)
// 画面のローカル座標: だいたい x -204..106 / y -364..-112 (中心 -49,-238)
const CRTTv: React.FC<{
  x: number; y: number; s?: number; f: number; on?: boolean; id: string;
  children?: React.ReactNode;
  dial?: number; // チャンネルつまみの段 (省略時は f で勝手に回る従来どおり)
}> = ({ x, y, s = 1, f, on = true, id, children, dial }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <clipPath id={id}><rect x={-204} y={-364} width={310} height={252} rx={24} /></clipPath>
    </defs>
    {/* アンテナ */}
    <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
      <line x1={0} y1={-404} x2={-108} y2={-540} />
      <line x1={0} y1={-404} x2={96} y2={-528} />
    </g>
    <circle cx={-108} cy={-540} r={8} fill={C.deckSilver} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={96} cy={-528} r={8} fill={C.deckSilver} stroke={KRP.ink} strokeWidth={4} />
    {/* 脚 (ハの字) */}
    <line x1={-186} y1={-44} x2={-224} y2={2} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
    <line x1={186} y1={-44} x2={224} y2={2} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
    {/* 木の筐体 */}
    <rect x={-244} y={-404} width={488} height={364} rx={16}
      fill={C.tvWood} stroke={KRP.ink} strokeWidth={7} />
    <path d="M -226 -390 Q -80 -396 60 -390 M -220 -56 Q 0 -50 200 -56"
      fill="none" stroke={C.tvWoodDark} strokeWidth={3.5} opacity={0.8} />
    {/* 画面ベゼル + ブラウン管 */}
    <rect x={-216} y={-376} width={334} height={276} rx={22}
      fill="#E8E0CE" stroke={KRP.ink} strokeWidth={6} />
    <rect x={-204} y={-364} width={310} height={252} rx={24}
      fill={on ? C.crtGlow : C.crtOff} stroke={KRP.ink} strokeWidth={5.5} />
    <g clipPath={`url(#${id})`}>{children}</g>
    {/* ガラスの照り */}
    <path d="M -186 -356 L -96 -356 L -176 -128 L -196 -128 Z" fill={KRP.white}
      opacity={on ? 0.16 : 0.08} />
    {/* 右の操作列: チャンネルつまみ・音量・スピーカー */}
    <circle cx={178} cy={-312} r={42} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={5.5} />
    <g transform={`rotate(${(dial ?? Math.floor(f / 16)) * 30} 178 -312)`}>
      <line x1={178} y1={-346} x2={178} y2={-324} stroke={KRP.ink} strokeWidth={5} />
    </g>
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i}
        x1={178 + Math.cos((i / 12) * Math.PI * 2) * 34}
        y1={-312 + Math.sin((i / 12) * Math.PI * 2) * 34}
        x2={178 + Math.cos((i / 12) * Math.PI * 2) * 40}
        y2={-312 + Math.sin((i / 12) * Math.PI * 2) * 40}
        stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    <circle cx={178} cy={-232} r={20} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={5} />
    <line x1={178} y1={-246} x2={178} y2={-234} stroke={KRP.ink} strokeWidth={4} />
    <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.75}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={146} y1={-186 + i * 16} x2={210} y2={-186 + i * 16} />
      ))}
    </g>
  </g>
);

// 初代風リモコン。x,y は中心。押すボタンの演出はシーン側で重ねる
const RemoteCtl: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-56} y={-132} width={112} height={264} rx={16}
        fill={C.deckSilver} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-44} y={-120} width={88} height={54} rx={8}
        fill={C.deckDark} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-20} cy={-30} r={15} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={22} cy={-30} r={15} fill={C.deckDark} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={i % 2 === 0 ? -36 : 8} y={8 + Math.floor(i / 2) * 36}
          width={28} height={22} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      <line x1={-40} y1={116} x2={40} y2={116} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
    </g>
  );

// 座布団。x,y は中心
const Zabuton: React.FC<{ x: number; y: number; s?: number; color?: string }> =
  ({ x, y, s = 1, color = C.zabuton }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-150} y={-24} width={300} height={62} rx={26}
        fill={color} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-136} y={-38} width={272} height={48} rx={22}
        fill={color} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -108 -14 Q 0 -24 108 -14" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      {[-136, 136].map((tx) => (
        <g key={tx} stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round">
          <line x1={tx - 8} y1={-18} x2={tx + 8} y2={-4} />
          <line x1={tx + 8} y1={-18} x2={tx - 8} y2={-4} />
        </g>
      ))}
    </g>
  );

// 丸くなって寝る猫。x,y は体の中心。f で呼吸
const CatSleep: React.FC<{ x: number; y: number; s?: number; f: number }> =
  ({ x, y, s = 1, f }) => {
    const br = 1 + Math.sin(f / 14) * 0.025; // 呼吸
    return (
      <g transform={`translate(${x} ${y}) scale(${s * br} ${s * br * 0.96})`}>
        {/* しっぽ (体に巻く) */}
        <path d="M 64 18 Q 96 30 84 -18 Q 76 -44 44 -46" fill="none"
          stroke={C.cat} strokeWidth={22} strokeLinecap="round" />
        <path d="M 64 18 Q 96 30 84 -18 Q 76 -44 44 -46" fill="none"
          stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
        {/* 体 */}
        <ellipse cx={0} cy={0} rx={78} ry={52} fill={C.cat} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -40 -34 Q -30 -16 -44 -4 M -6 -46 Q 4 -28 -8 -14" fill="none"
          stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {/* 頭 (体に埋める) */}
        <circle cx={-48} cy={10} r={34} fill={C.cat} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -72 -16 L -78 -36 L -56 -24 Z M -34 -20 L -26 -40 L -16 -18 Z"
          fill={C.cat} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* とじた目・鼻 */}
        <path d="M -64 8 Q -58 13 -52 8 M -42 6 Q -36 11 -30 6" fill="none"
          stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
        <path d="M -48 18 L -44 22" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
        {/* 寝息のふくらみ */}
        <circle cx={-86} cy={-18} r={5 + ((f % 36) / 36) * 7}
          fill="none" stroke={KRP.grayDark} strokeWidth={3}
          opacity={0.7 * (1 - (f % 36) / 36)} />
      </g>
    );
  };

// Person と同じ変換をかけた入れ物 (掟3章の契約)。中の Person は x=0 y=0 still で渡す。
// back = 人物の後ろ、front = 人物の前に、人物ローカル座標 (頭 cy=-228 / 手 ±14,-118 / 足元 0) で描く
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

// 正座の膝 + 座布団 (Kasane の front に入れる。人物ローカル座標。立ち脚を隠して「座っている」に見せる)
const Hiza: React.FC<{ dark: string; zabuton: string }> = ({ dark, zabuton }) => (
  <g>
    <rect x={-104} y={-16} width={208} height={34} rx={14} fill={zabuton} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-34} rx={70} ry={26} fill={dark} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M 0 -58 L 0 -12" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
  </g>
);

// テレビ番組の中身 (CRTTv の画面ローカル座標 x -204..106 / y -364..-112 に描く)
// k: 0 野球 / 1 時代劇 / 2 歌番組 / 3 料理番組 / 4 動物番組
const TvShow: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  const w = Math.sin(f / 6);
  if (k === 0) {
    // 野球: 外野の芝・内野の土・打者のスイング
    return (
      <g>
        <rect x={-204} y={-364} width={310} height={252} fill="#8FBF8A" />
        <path d="M -204 -300 Q -49 -330 106 -300" fill="none" stroke="#6E9E6A" strokeWidth={6} />
        <rect x={-204} y={-196} width={310} height={84} fill="#C99B60" />
        <path d="M -150 -196 L -49 -268 L 52 -196" fill="none" stroke={KRP.white} strokeWidth={4} />
        <rect x={-58} y={-206} width={18} height={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        {/* 打者 */}
        <g transform="translate(-90 -196)">
          <rect x={-12} y={-52} width={24} height={40} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-10} y={-14} width={8} height={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
          <rect x={2} y={-14} width={8} height={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={0} cy={-64} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -12 -70 Q 0 -82 12 -70 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={2.5} />
          <line x1={8} y1={-44} x2={8 + Math.cos(-1 + w * 0.9) * 46} y2={-44 + Math.sin(-1 + w * 0.9) * 46}
            stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        </g>
        <circle cx={-10 + ((f * 3) % 90)} cy={-236 + Math.sin(f / 5) * 6} r={5}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
      </g>
    );
  }
  if (k === 1) {
    // 時代劇: 月夜の城と侍
    return (
      <g>
        <rect x={-204} y={-364} width={310} height={252} fill="#4F5F7E" />
        <circle cx={-30} cy={-322} r={24} fill="#EDE3BE" />
        <path d="M -190 -170 L -170 -230 L -100 -230 L -80 -170 Z M -160 -230 L -150 -262 L -120 -262 L -110 -230 Z"
          fill="#2E3648" />
        <rect x={-204} y={-150} width={310} height={38} fill="#3A4258" />
        <g transform={`translate(${-4 + w * 4} -150)`}>
          <path d="M -26 0 L -20 -60 L 20 -60 L 26 0 Z" fill="#7A3A3A" stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-74} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -8 -90 L 0 -100 L 8 -90 Z" fill={KRP.ink} />
          <line x1={16} y1={-46} x2={56} y2={-96 - w * 6} stroke="#E8EEF2" strokeWidth={5} strokeLinecap="round" />
          <line x1={14} y1={-44} x2={22} y2={-52} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
      </g>
    );
  }
  if (k === 2) {
    // 歌番組: ステージ・照明・マイクを持つ歌手
    return (
      <g>
        <rect x={-204} y={-364} width={310} height={252} fill="#6E4A7E" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-150 + i * 100} -364 L ${-184 + i * 100 + w * 10} -150 L ${-116 + i * 100 + w * 10} -150 Z`}
            fill={KRP.yellow} opacity={0.18} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={-160 + i * 80} cy={-340} r={9} fill={KRP.yellow}
            opacity={0.6 + 0.4 * Math.sin(f / 4 + i)} />
        ))}
        <rect x={-204} y={-150} width={310} height={38} fill="#4A2E58" />
        <g transform={`translate(-49 -150) rotate(${w * 4})`}>
          <path d="M -24 0 L -18 -64 L 18 -64 L 24 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-80} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <line x1={12} y1={-50} x2={22} y2={-74} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          <circle cx={23} cy={-78} r={6} fill={C.deckDark} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        <path d={`M 36 ${-262 + w * 6} q 10 -12 20 0 M 60 ${-296 - w * 6} q 10 -12 20 0`}
          fill="none" stroke={KRP.white} strokeWidth={4} />
      </g>
    );
  }
  if (k === 3) {
    // 料理番組: 台所セットと湯気の立つ鍋
    return (
      <g>
        <rect x={-204} y={-364} width={310} height={252} fill="#EBD9B4" />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-204 + i * 62} y1={-364} x2={-204 + i * 62} y2={-210} stroke="#D3BE94" strokeWidth={3} />
        ))}
        <rect x={-204} y={-170} width={310} height={58} fill="#B98A50" stroke={KRP.ink} strokeWidth={3} />
        <g transform="translate(-110 -170)">
          <rect x={-14} y={-60} width={28} height={50} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-76} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -14 -88 Q -16 -110 0 -106 Q 16 -110 14 -88 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        <path d="M -30 -170 L -26 -204 L 50 -204 L 54 -170 Z" fill={C.deckDark} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-10 + i * 22} -214 q ${6 + w * 5} -16 -2 -32`}
            fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.8} />
        ))}
      </g>
    );
  }
  // 4 動物番組: サバンナのキリン
  return (
    <g>
      <rect x={-204} y={-364} width={310} height={252} fill="#F2C873" />
      <circle cx={40} cy={-300} r={30} fill="#F5E2A8" />
      <rect x={-204} y={-150} width={310} height={38} fill="#C9A452" />
      <path d="M -190 -150 Q -150 -190 -110 -150 Z" fill="#7A8A4A" />
      <g transform={`translate(-40 -150) rotate(${w * 3} 0 -60)`}>
        <rect x={-28} y={-62} width={56} height={30} rx={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        <line x1={-20} y1={-34} x2={-20} y2={0} stroke={KRP.ink} strokeWidth={5} />
        <line x1={20} y1={-34} x2={20} y2={0} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 14 -56 L 34 -128 L 46 -126 L 28 -50 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={46} cy={-132} rx={16} ry={9} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        {[[-10, -48], [8, -52], [30, -96]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={5} fill={KRP.bronze} />
        ))}
      </g>
    </g>
  );
};

// 天井から吊るす電灯 (点灯)。x は吊り元、y はかさの下端
const HangLamp: React.FC<{ x: number; top: number; y: number; f: number; s?: number }> =
  ({ x, top, y, f, s = 1 }) => (
    <g>
      <line x1={x} y1={top} x2={x} y2={y - 40 * s} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={x} cy={y + 14 * s} r={150 * s} fill={C.lampWarm} opacity={0.22 + Math.sin(f / 13) * 0.02} />
      <circle cx={x} cy={y + 14 * s} r={80 * s} fill={C.lampWarm} opacity={0.3} />
      <path d={`M ${x - 46 * s} ${y} L ${x + 46 * s} ${y} L ${x + 26 * s} ${y - 40 * s} L ${x - 26 * s} ${y - 40 * s} Z`}
        fill={C.lampWarm} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={x} cy={y + 12 * s} r={13 * s} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #195 決まった時刻に始まり、早送りも、巻き戻しもできません。
// 格: 図 / seed 1323
// 絵: テレビのダイヤルとチャンネルの図 (連番)。「早送り」「巻き戻し」のボタンが存在しない空白に点線の枠
// どこ: 茶の間の壁ぎわ。テレビの前面にぐっと寄った図解
// 演出: チャンネルダイヤルが1→12の連番でカチカチ回る。下の操作段には
//       「早送り」「巻き戻し」の置き場が「無い」ことを点線の空き枠で示す
// 動き: ダイヤルが f で段階回転・空き枠が pop で順に出る・画面の走査線が流れる
const Sg195: React.FC<{ f: number }> = ({ f }) => {
  const step = Math.floor(f / 12);
  const ang = -(step + pop(seg(f - step * 12, 0, 5))) * 30;
  const t1 = seg(f, 14, 26);
  const t2 = seg(f, 22, 34);
  return (
    <Frame f={f} seed={1323}>
      {/* 壁 (縦縞の壁紙) と部屋の気配 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallEve} />
      <g stroke="#DACB9E" strokeWidth={26} opacity={0.5}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 210 + 40} y1={-20} x2={i * 210 + 40} y2={H + 20} />
        ))}
      </g>
      <rect x={-20} y={930} width={W + 40} height={170} fill={C.tatami} />
      <line x1={-20} y1={930} x2={W + 20} y2={930} stroke={KRP.ink} strokeWidth={7} />
      {/* 左の棚: 柱時計と鉢 */}
      <g transform="translate(205 0)">
        <rect x={-130} y={430} width={260} height={18} rx={6} fill={C.nageshi} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={300} r={86} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={0} cy={300} r={68} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={Math.cos((i / 12) * Math.PI * 2) * 56}
            y1={300 + Math.sin((i / 12) * Math.PI * 2) * 56}
            x2={Math.cos((i / 12) * Math.PI * 2) * 64}
            y2={300 + Math.sin((i / 12) * Math.PI * 2) * 64}
            stroke={KRP.ink} strokeWidth={3} />
        ))}
        <line x1={0} y1={300} x2={0} y2={254} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={300} x2={30} y2={316} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <g transform={`rotate(${Math.sin(f / 8) * 7} 0 388)`}>
          <line x1={0} y1={388} x2={0} y2={474} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={486} r={15} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <path d="M -60 448 L -78 540 L 78 540 L 60 448 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M 0 452 q ${-54 + i * 36} -60 ${-30 + i * 22} -118`}
            fill="none" stroke={KRP.green} strokeWidth={12} strokeLinecap="round" />
        ))}
      </g>
      {/* 主役: テレビの前面 (画面いっぱいの大写し) */}
      <g transform="translate(1110 930) scale(2.1)">
        <CRTTv x={0} y={0} s={1} f={0} on id="tv195">
          {/* 画面はにぎやかな番組 (走査線 + 動く山形) */}
          <rect x={-204} y={-364} width={310} height={252} fill="#9FCCDA" />
          <path d={`M -204 ${-200 + Math.sin(f / 7) * 10} Q -120 -280 -40 ${-212 + Math.sin(f / 9) * 12} T 110 -220 L 110 -112 L -204 -112 Z`}
            fill="#7FB3C6" opacity={0.9} />
          <circle cx={40 + Math.sin(f / 11) * 16} cy={-300} r={26} fill={KRP.yellow} opacity={0.85} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={-204} y1={-350 + ((i * 44 + f * 2.2) % 240)}
              x2={106} y2={-350 + ((i * 44 + f * 2.2) % 240)}
              stroke={KRP.white} strokeWidth={3} opacity={0.22} />
          ))}
        </CRTTv>
        {/* ダイヤルの上書き: 1〜12の連番 + カチカチ回る目盛り */}
        <g transform="translate(178 -312)">
          <circle r={58} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={5.5} />
          <g transform={`rotate(${ang})`}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
              return (
                <text key={i} x={Math.cos(a) * 42} y={Math.sin(a) * 42 + 5}
                  textAnchor="middle" fontFamily={FONT} fontWeight={800}
                  fontSize={15} fill={C.ink}>{i + 1}</text>
              );
            })}
            <circle r={20} fill={C.tvWood} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={0} y1={-18} x2={0} y2={18} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 固定の指し三角 */}
          <path d="M 0 -72 L -9 -58 L 9 -58 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 操作段: ある物 (電源・音量) と、無い物 (点線の空き枠) */}
      <g transform="translate(0 692)">
        <rect x={520} y={0} width={880} height={130} rx={16}
          fill="#E8E0CE" stroke={KRP.ink} strokeWidth={6.5} />
        <circle cx={620} cy={66} r={32} fill={C.tvWood} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={620} y1={42} x2={620} y2={60} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={724} cy={66} r={26} fill={C.tvWood} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={724} y1={48} x2={724} y2={62} stroke={KRP.ink} strokeWidth={4} />
        {/* 巻き戻しの空き枠 */}
        <g opacity={pop(t1)} transform={`translate(950 66) scale(${0.6 + pop(t1) * 0.4})`}>
          <rect x={-128} y={-50} width={256} height={100} rx={12} fill="none"
            stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="14 10" />
          <g fill={KRP.gray} opacity={0.75}>
            <polygon points="-34,-28 -34,0 -58,-14" />
            <polygon points="-8,-28 -8,0 -32,-14" />
          </g>
          <text x={16} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={30} fill={KRP.grayDark}>巻き戻し</text>
        </g>
        {/* 早送りの空き枠 */}
        <g opacity={pop(t2)} transform={`translate(1240 66) scale(${0.6 + pop(t2) * 0.4})`}>
          <rect x={-128} y={-50} width={256} height={100} rx={12} fill="none"
            stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="14 10" />
          <g fill={KRP.gray} opacity={0.75}>
            <polygon points="-50,-28 -50,0 -26,-14" />
            <polygon points="-24,-28 -24,0 0,-14" />
          </g>
          <text x={18} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={30} fill={KRP.grayDark}>早送り</text>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #196 ですが「黙って最初から最後まで」だけは、ついに強制できませんでした。
// 格: 山 / seed 1324
// 絵: **笑いの山**。茶の間の全景。テレビは熱弁しているのに、父は新聞、母は繕い物、子は宿題、猫は画面の前で寝ている。誰も観ていない
// どこ: 夜の茶の間の全景 (引き)。右にテレビ、中央にちゃぶ台と家族
// 演出: テレビは画面の中で小さな弁士が熱弁。なのに父は新聞・母は繕い物・
//       子は宿題・猫は画面の真ん前で熟睡。誰ひとり観ていない「笑いの山」
// 動き: テレビの声の波紋・新聞のゆれ・針を運ぶ手・鉛筆・猫の呼吸・時計の振り子
const Sg196: React.FC<{ f: number }> = ({ f }) => {
  const wob = Math.sin(f / 9);
  return (
    <Frame f={f} seed={1324}>
      <TatamiRoom floorY={620} />
      {/* 窓 (夜) */}
      <g transform="translate(330 0)">
        <rect x={-190} y={120} width={380} height={330} fill="#2B3850" stroke={KRP.ink} strokeWidth={8} />
        <line x1={0} y1={120} x2={0} y2={450} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-190} y1={286} x2={190} y2={286} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={96} cy={200} r={34} fill={C.lampWarm} opacity={0.9} />
        <circle cx={84} cy={190} r={8} fill="#D9C98E" />
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={-160 + rnd(31, i) * 150} cy={150 + rnd(32, i) * 270}
            r={2} fill={KRP.white} opacity={0.4 + 0.5 * Math.sin(f / 11 + i)} />
        ))}
        <rect x={-206} y={450} width={412} height={16} rx={5} fill={C.nageshi} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 柱時計 */}
      <g transform="translate(760 250)">
        <rect x={-58} y={-88} width={116} height={240} rx={10} fill={C.tvWood} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-18} r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <line x1={0} y1={-18} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <line x1={0} y1={-18} x2={18} y2={-6} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <g transform={`rotate(${wob * 8} 0 46)`}>
          <line x1={0} y1={46} x2={0} y2={118} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={126} r={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 電灯 (天井から) */}
      <g>
        <line x1={1010} y1={-20} x2={1010} y2={60} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 962 60 L 1058 60 L 1038 102 L 982 102 Z" fill={C.lampWarm} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={1010} cy={120} r={16} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
        <circle cx={1010} cy={150} r={120} fill={C.lampWarm} opacity={0.14 + Math.sin(f / 13) * 0.02} />
      </g>
      {/* テレビ (右)。中では弁士が熱弁 */}
      <CRTTv x={1600} y={820} s={1.15} f={f} on id="tv196">
        <rect x={-204} y={-364} width={310} height={252} fill="#A8D2DE" />
        <rect x={-204} y={-168} width={310} height={56} fill="#7FA8BC" />
        {/* 熱弁する人 (口パク + 腕ふり) */}
        <g transform="translate(-50 -170)">
          <rect x={-46} y={-96} width={92} height={96} rx={14} fill="#3E4B66" stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={-124} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-10} cy={-130} r={3.5} fill={KRP.ink} />
          <circle cx={10} cy={-130} r={3.5} fill={KRP.ink} />
          <ellipse cx={0} cy={-110} rx={7} ry={4 + Math.abs(wob) * 6} fill={KRP.ink} />
          <rect x={-78} y={-92} width={16} height={56} rx={8} fill="#3E4B66" stroke={KRP.ink} strokeWidth={4}
            transform={`rotate(${-120 + wob * 16} -70 -92)`} />
        </g>
        {/* 声の波 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${20 + i * 24} -220 q 12 ${-14 - i * 4} 24 0`}
            fill="none" stroke={KRP.ink} strokeWidth={3.5}
            opacity={0.7 * ((f + i * 8) % 24 < 16 ? 1 : 0.2)} />
        ))}
      </CRTTv>
      {/* テレビの光が畳とねこに落ちる */}
      <ellipse cx={1430} cy={960} rx={330} ry={90} fill={C.crtGlow}
        opacity={0.2 + Math.sin(f / 5) * 0.05} />
      {/* 猫: 画面の真ん前で熟睡 */}
      <CatSleep x={1360} y={950} s={1.05} f={f} />
      {/* 床の小物: 空いた座布団と新聞の束 (修正3: 畳縁の斜め線を消したぶん床に「物」を置く) */}
      <Zabuton x={190} y={800} s={0.95} color="#7A5A3C" />
      <g transform="translate(150 768) rotate(-6)">
        <rect x={-60} y={-14} width={120} height={20} rx={3} fill={C.news} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-56} y={-30} width={116} height={18} rx={3} fill={C.news} stroke={KRP.ink} strokeWidth={4} />
        <line x1={-44} y1={-21} x2={30} y2={-21} stroke={C.newsLine} strokeWidth={3} />
      </g>
      {/* 家族 (ちゃぶ台の向こう側。下半身は台で隠れる) */}
      <Zabuton x={560} y={930} s={1.1} color="#5A6B8C" />
      <Person x={560} y={918} s={1.08} cloth="#55663F" clothDark="#41512F" pose="hold"
        glasses face="normal" gaze={[-0.3, 0.4]} f={f} phase={1} />
      {/* 父の新聞 (手元に) */}
      <g transform={`translate(560 760) rotate(${wob * 1.4})`}>
        <path d="M -140 -90 L 0 -70 L 140 -90 L 150 96 L 0 76 L -150 96 Z"
          fill={C.news} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        <line x1={0} y1={-70} x2={0} y2={76} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={C.newsLine} strokeWidth={4}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line x1={-128} y1={-52 + i * 32} x2={-16} y2={-38 + i * 32} />
              <line x1={16} y1={-38 + i * 32} x2={128} y2={-52 + i * 32} />
            </g>
          ))}
        </g>
        <rect x={-126} y={-80} width={52} height={20} fill={C.newsLine} opacity={0.6} />
      </g>
      {/* 子: ちゃぶ台で宿題 */}
      <PersonMini x={880} y={900} s={1.0} color="#C77B4A" f={f} phase={3} face="dot" />
      {/* 母: 繕い物 */}
      <Zabuton x={1130} y={940} s={1.05} color="#7A5A3C" />
      <Person x={1130} y={928} s={1.04} cloth="#8A4A52" clothDark="#6E3A42" pose="hold"
        hair="none" face="smile" gaze={[-0.4, 0.5]} f={f} phase={2} />
      <g transform="translate(1130 806)">
        <path d={`M -64 0 Q 0 ${26 + wob * 4} 64 6 L 58 42 Q 0 ${58 + wob * 4} -58 36 Z`}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <line x1={44} y1={-2} x2={70 + wob * 6} y2={-34} stroke={C.deckDark} strokeWidth={3.5} />
        <line x1={70 + wob * 6} y1={-34} x2={76 + wob * 6} y2={-44} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* ちゃぶ台 (人物の手前) */}
      <g transform="translate(820 930)">
        <ellipse cx={0} cy={0} rx={330} ry={74} fill="#B98A50" stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={-8} rx={330} ry={70} fill="#C99B60" stroke={KRP.ink} strokeWidth={6} />
        <path d="M -250 -22 Q 0 -44 250 -22 M -170 6 Q 0 -12 170 6" fill="none"
          stroke={C.tvWoodDark} strokeWidth={3} opacity={0.5} />
        <rect x={-290} y={30} width={26} height={96} rx={8} fill="#8A6436" stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={264} y={30} width={26} height={96} rx={8} fill="#8A6436" stroke={KRP.ink} strokeWidth={5.5} />
        {/* 台の上: 急須・湯呑み・みかん・子のノートと鉛筆 */}
        <g transform="translate(-180 -34)">
          <ellipse cx={0} cy={10} rx={44} ry={18} fill="#6E7B5A" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -42 2 L -66 -8 L -62 6 L -44 12 Z" fill="#6E7B5A" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-10} r={9} fill="#6E7B5A" stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 16 -24 q ${6 + wob * 4} -18 -2 -34`} fill="none"
            stroke={KRP.grayDark} strokeWidth={4} opacity={0.6} />
        </g>
        <g transform="translate(-80 -16)">
          <ellipse cx={0} cy={6} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={13} ry={5} fill="#9BB06A" />
        </g>
        <g transform="translate(20 -30)">
          <ellipse cx={0} cy={8} rx={52} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {[-22, 2, -10].map((mx, i) => (
            <g key={i}>
              <circle cx={mx + i * 14} cy={-4 - (i === 2 ? 10 : 0)} r={14}
                fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={mx + i * 14} cy={-10 - (i === 2 ? 10 : 0)} r={2.5} fill={KRP.green} />
            </g>
          ))}
        </g>
        {/* 子のノート + 動く鉛筆 */}
        <g transform="translate(150 -4) rotate(-6)">
          <rect x={-56} y={-34} width={112} height={68} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={0} y1={-34} x2={0} y2={34} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-44} y1={-16 + i * 16} x2={-10} y2={-16 + i * 16}
              stroke={C.newsLine} strokeWidth={3} />
          ))}
          <g transform={`translate(${24 + (f % 20) * 1.2} ${6 + Math.sin(f / 3) * 2}) rotate(42)`}>
            <rect x={-5} y={-44} width={10} height={44} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -5 0 L 0 10 L 5 0 Z" fill={C.skin} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #197 NHKの調査では、平日のテレビ視聴の4割あまりが「ながら視聴」です。
// 格: 図 / seed 1325
// 絵: ちゃぶ台の上の円グラフ。4割の扇形が湯呑みの輪じみと重なる。隅にNHKの調査の但し書き
// どこ: ちゃぶ台の真上 (真俯瞰)。図解は台の上の紙に描いてある
// 演出: 4割あまりの扇形が f で開く。湯呑みの輪じみが扇形に重なる。
//       隅に「NHKの調査より」の但し書き札。急須の湯気・みかん
// 動き: 扇形の開き・湯気のゆらぎ・但し書き札の pop
const Sg197: React.FC<{ f: number }> = ({ f }) => {
  const sweep = easeOut(seg(f, 6, 34)) * 0.42; // 4割あまり
  const a0 = -Math.PI / 2;
  const a1 = a0 + sweep * Math.PI * 2;
  const R = 240;
  const big = sweep > 0.5 ? 1 : 0;
  const wob = Math.sin(f / 9);
  return (
    <Frame f={f} seed={1325}>
      {/* 真上から見た畳 (縦の畳 + 縁の帯) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.tatami} />
      <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.5}>
        {Array.from({ length: 26 }, (_, i) => (
          <line key={i} x1={0} y1={i * 44 - 10} x2={W} y2={i * 44 - 10} />
        ))}
      </g>
      <g stroke={C.heri} strokeWidth={16} opacity={0.75}>
        {[180, 870, 1560].map((x) => <line key={x} x1={x} y1={-20} x2={x} y2={H + 20} />)}
      </g>
      {/* ちゃぶ台 (真上から。年輪つきの丸い天板) */}
      <circle cx={930} cy={540} r={470} fill="#B98A50" stroke={KRP.ink} strokeWidth={9} />
      <circle cx={930} cy={540} r={448} fill="#C99B60" stroke={KRP.ink} strokeWidth={5} />
      <g fill="none" stroke={C.tvWoodDark} strokeWidth={3} opacity={0.45}>
        <circle cx={930} cy={540} r={360} />
        <circle cx={930} cy={540} r={255} />
        <path d="M 560 430 Q 930 380 1300 440" />
      </g>
      {/* 図解の紙 (少し傾けて台に載る) */}
      <g transform="translate(930 520) rotate(-3)">
        <rect x={-330} y={-300} width={660} height={600} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
        <path d="M -330 -252 L -282 -300 M 330 252 L 284 300" fill="none"
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        {/* 円グラフ本体 */}
        <circle cx={0} cy={-10} r={R} fill="#EDE6D2" stroke={KRP.ink} strokeWidth={6.5} />
        {sweep > 0.003 && (
          <path d={`M 0 -10 L ${Math.cos(a0) * R} ${-10 + Math.sin(a0) * R}
            A ${R} ${R} 0 ${big} 1 ${Math.cos(a1) * R} ${-10 + Math.sin(a1) * R} Z`}
            fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        )}
        <circle cx={0} cy={-10} r={R} fill="none" stroke={KRP.ink} strokeWidth={6.5} />
        {/* 扇形のラベル (引き出し線つき) */}
        <g opacity={seg(f, 24, 34)}>
          <line x1={Math.cos(a0 + 0.66) * (R - 40)} y1={-10 + Math.sin(a0 + 0.66) * (R - 40)}
            x2={236} y2={-206} stroke={KRP.ink} strokeWidth={4} />
          <TagPlate x={262} y={-236} text="ながら視聴" size={34} />
          <TagPlate x={248} y={-166} text="4割あまり" size={30} fill={KRP.yellow} />
        </g>
        {/* 湯呑みの輪じみ (扇形に重なる茶色いリング) */}
        <circle cx={-120} cy={-158} r={62} fill="none" stroke="#9A6B3C"
          strokeWidth={10} opacity={0.5} strokeDasharray="40 14" />
        <circle cx={60} cy={196} r={56} fill="none" stroke="#9A6B3C"
          strokeWidth={9} opacity={0.35} strokeDasharray="34 12" />
      </g>
      {/* 当の湯呑み (紙のふちに置かれてまだじみを作っている) */}
      <g transform="translate(1240 760)">
        <circle cx={0} cy={0} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={46} fill="#9BB06A" stroke={KRP.ink} strokeWidth={4} />
        <path d={`M -20 ${-8 + wob * 3} q 20 ${-10} 40 0`} fill="none"
          stroke={KRP.white} strokeWidth={4} opacity={0.6} />
      </g>
      {/* 急須 (真上) + 湯気 */}
      <g transform="translate(560 260)">
        <circle cx={0} cy={0} r={92} fill="#6E7B5A" stroke={KRP.ink} strokeWidth={6.5} />
        <circle cx={0} cy={0} r={34} fill="#5C684B" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 78 -30 L 140 -58 L 128 -22 L 86 -8 Z" fill="#6E7B5A" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -64 64 Q -110 110 -70 134" fill="none" stroke={KRP.ink} strokeWidth={7} />
        {[0, 1].map((i) => (
          <path key={i} d={`M ${110 + i * 24} ${-50 - i * 10} q ${8 + wob * 6} -22 -4 -44`}
            fill="none" stroke={KRP.grayDark} strokeWidth={4.5}
            opacity={0.55 - i * 0.2} />
        ))}
      </g>
      {/* みかんと煎餅皿 (左下の生活感) */}
      <g transform="translate(470 820)">
        <circle cx={0} cy={0} r={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={-18} cy={-8} r={26} fill="#D9B23C" stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={26} cy={14} r={26} fill="#D9B23C" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -30 -20 L -6 4 M 14 2 L 38 26" stroke={C.tvWoodDark} strokeWidth={3} opacity={0.6} />
      </g>
      <g transform="translate(1420 300)">
        <circle cx={0} cy={0} r={34} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-6} r={4} fill={KRP.green} />
        <circle cx={74} cy={26} r={34} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={74} cy={20} r={4} fill={KRP.green} />
      </g>
      {/* 但し書き (隅の小さな札) */}
      <TagPlate x={1600} y={775} text="NHKの調査より" size={28}
        t={seg(f, 30, 40)} fill="#EDE6D2" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #198 ご飯を食べながら、洗い物をしながら、新聞を読みながら。
// 格: 並 / seed 1326
// ★修正3: 作者「メインキャラクターを使った分割の説明に」→ 3分割は活かし、各コマに Person
// 絵: ながらの三連コマ。どのコマにも小さなテレビが映り込み、人物の目線はテレビへ
//   コマ1 (子・#196 の橙): ちゃぶ台でご飯。箸は口の手前で止まったまま、目は右のテレビ
//   コマ2 (母・#196 の臙脂): 台所の流しで皿洗い。目は左の戸口の向こうのテレビ
//   コマ3 (父・#196 の深緑+眼鏡): 座布団で新聞を広げ、紙面の上から右のテレビをちらり
// 動き: コマが順に pop・箸の上下・泡と水・のれんのゆれ・紙面がめくれる・テレビの中身
const Sg198: React.FC<{ f: number }> = ({ f }) => {
  const ts = [seg(f, 2, 12), seg(f, 9, 19), seg(f, 16, 26)];
  const wob = Math.sin(f / 8);
  // 箸の上げ下げ (48コマ周期。口の手前=あごより下で止まる)
  const chop = easeOut(clamp01(Math.sin(((f % 48) / 48) * Math.PI) * 1.4));
  const ang = ((205 + chop * 13) * Math.PI) / 180;
  const tipX = 14 + Math.cos(ang) * 70;
  const tipY = -118 + Math.sin(ang) * 70;
  // 新聞の右ページがめくれる (60コマ周期)
  const flip = easeOut(seg(f % 60, 6, 20)) * (1 - easeOut(seg(f % 60, 26, 38)));
  const PW = 290; const PH = 320; // コマの半幅・半高
  const koma = (
    i: number, cx: number, rot: number, bgInner: React.ReactNode,
  ) => (
    <g transform={`translate(${cx} 470) rotate(${rot}) scale(${0.72 + pop(ts[i]) * 0.28})`} opacity={ts[i]}>
      <defs>
        <clipPath id={`koma198-${i}`}><rect x={-PW} y={-PH} width={PW * 2} height={PH * 2} rx={14} /></clipPath>
      </defs>
      {/* コマの影 */}
      <rect x={-PW + 14} y={-PH + 16} width={PW * 2} height={PH * 2} rx={14} fill={KRP.ink} opacity={0.35} />
      <g clipPath={`url(#koma198-${i})`}>{bgInner}</g>
      <rect x={-PW} y={-PH} width={PW * 2} height={PH * 2} rx={14} fill="none" stroke={KRP.ink} strokeWidth={8} />
    </g>
  );
  // 畳 (横の畳の目だけ)
  const floor = (y0: number) => (
    <g>
      <rect x={-PW} y={y0} width={PW * 2} height={PH - y0} fill={C.tatami} />
      <line x1={-PW} y1={y0} x2={PW} y2={y0} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.55}>
        {[0, 1, 2, 3, 4].map((k) => {
          const t = (k + 1) / 6;
          const y = y0 + t * t * (PH - y0);
          return <line key={k} x1={-PW} y1={y} x2={PW} y2={y} />;
        })}
      </g>
    </g>
  );
  // 砂壁 + 長押
  const wall = (seed: number, toY: number) => (
    <g>
      <rect x={-PW} y={-PH} width={PW * 2} height={toY + PH} fill={C.wallEve} />
      <g stroke="#D8C9A4" strokeWidth={3} opacity={0.6} strokeLinecap="round">
        {Array.from({ length: 8 }, (_, k) => {
          const x = -PW + rnd(seed, k) * PW * 2;
          const y = -PH + 110 + rnd(seed + 1, k) * (toY + PH - 140);
          return <line key={k} x1={x} y1={y} x2={x + 20 + rnd(seed + 2, k) * 22} y2={y} />;
        })}
      </g>
      <rect x={-PW} y={-236} width={PW * 2} height={18} fill={C.nageshi} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  return (
    <Frame f={f} seed={1326} bg="#3E3A33">
      {/* 背景: 夕餉どきの家の板壁 (縦の羽目板) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#3E3A33" />
      <g stroke="#34302A" strokeWidth={5}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={i * 160 + 20} y1={-20} x2={i * 160 + 20} y2={H + 20} />
        ))}
      </g>
      <ellipse cx={960} cy={480} rx={900} ry={430} fill={C.lampWarm} opacity={0.08} />

      {/* ===== コマ1: 食べながら (子) ===== */}
      {koma(0, 335, -2, (
        <g>
          {wall(61, 120)}
          {/* 壁のカレンダー */}
          <g transform="translate(-206 -150)">
            <rect x={-44} y={-58} width={88} height={116} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={-44} y={-58} width={88} height={26} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
            <g fill={C.newsLine} opacity={0.7}>
              {Array.from({ length: 12 }, (_, k) => (
                <rect key={k} x={-34 + (k % 4) * 18} y={-22 + Math.floor(k / 4) * 22} width={12} height={12} rx={2} />
              ))}
            </g>
          </g>
          <HangLamp x={-40} top={-PH} y={-196} f={f} s={0.8} />
          {floor(120)}
          {/* テレビ台 + 小さなテレビ (右) */}
          <circle cx={152} cy={-42} r={150} fill={C.crtGlow} opacity={0.22 + Math.sin(f / 5) * 0.04} />
          <rect x={70} y={62} width={210} height={70} rx={6} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={175} y1={68} x2={175} y2={126} stroke={KRP.ink} strokeWidth={4} />
          <CRTTv x={175} y={64} s={0.44} f={f} on id="tv198a">
            <TvShow k={0} f={f} />
          </CRTTv>
          {/* 子: 茶碗を持ち、箸は口の手前で止まり、目はテレビ */}
          <Kasane x={-92} y={262} s={1.25} lean={5} f={f} phase={3}
            front={
              <g>
                <Hiza dark="#A0603A" zabuton="#8A4A52" />
                {/* 茶碗 (左手で持つ) */}
                <path d="M -58 -128 L -54 -110 Q -44 -88 -24 -88 Q -4 -88 6 -110 L 10 -128 Z"
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
                <path d="M -52 -112 Q -24 -104 4 -112" fill="none" stroke={KRP.blueDeep} strokeWidth={3.5} />
                <path d="M -56 -128 Q -24 -150 8 -128 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <path d="M -40 -134 L -36 -132 M -22 -140 L -18 -138 M -6 -134 L -2 -132" stroke={KRP.grayDark}
                  strokeWidth={2.5} strokeLinecap="round" />
                {/* 箸 (右手から。茶碗の上に重ねて見せる) + 先のご飯 */}
                <g stroke={C.tvWoodDark} strokeWidth={6} strokeLinecap="round">
                  <line x1={16} y1={-116} x2={tipX} y2={tipY} />
                  <line x1={12} y1={-122} x2={tipX - 4} y2={tipY - 6} />
                </g>
                <ellipse cx={tipX - 2} cy={tipY - 2} rx={8} ry={6} fill={KRP.white} stroke={KRP.ink}
                  strokeWidth={3} opacity={chop > 0.3 ? 1 : 0} />
              </g>
            }>
            <Person x={0} y={0} f={f} still cloth="#C77B4A" clothDark="#A0603A" pose="hold"
              gaze={[7, -1]} face="normal" phase={3} />
          </Kasane>
          {/* ちゃぶ台 (子の手前) */}
          <g transform="translate(-70 186)">
            <rect x={-200} y={10} width={24} height={120} rx={8} fill="#8A6436" stroke={KRP.ink} strokeWidth={5} />
            <rect x={176} y={10} width={24} height={120} rx={8} fill="#8A6436" stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={8} rx={226} ry={36} fill="#B98A50" stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={0} cy={0} rx={226} ry={34} fill="#C99B60" stroke={KRP.ink} strokeWidth={5.5} />
            {/* 焼き魚の皿 */}
            <g transform="translate(-120 -6)">
              <ellipse cx={0} cy={0} rx={62} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -44 -4 Q -10 -18 30 -6 L 46 -14 L 44 4 L 30 0 Q -10 8 -44 -4 Z"
                fill="#9AA3AD" stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
              <circle cx={-34} cy={-6} r={2.5} fill={KRP.ink} />
            </g>
            {/* 味噌汁 (湯気) */}
            <g transform="translate(110 -10)">
              <path d="M -34 0 Q -32 26 0 28 Q 32 26 34 0 Z" fill="#7A2E26" stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={0} cy={0} rx={34} ry={9} fill="#B98A4E" stroke={KRP.ink} strokeWidth={4} />
              {[0, 1].map((k) => (
                <path key={k} d={`M ${-10 + k * 18} -12 q ${5 + wob * 4} -14 -3 -28`} fill="none"
                  stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.6 - k * 0.15} />
              ))}
            </g>
            {/* 漬物の小皿 */}
            <g transform="translate(10 12)">
              <ellipse cx={0} cy={0} rx={24} ry={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
              <ellipse cx={-6} cy={-3} rx={8} ry={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
              <ellipse cx={8} cy={-2} rx={8} ry={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          </g>
        </g>
      ))}

      {/* ===== コマ2: 洗いながら (母) ===== */}
      {koma(1, 960, 1.6, (
        <g>
          {/* タイルの壁 */}
          <rect x={-PW} y={-PH} width={PW * 2} height={PH * 2} fill="#E4ECEE" />
          <g stroke="#C5D2D6" strokeWidth={3}>
            {Array.from({ length: 8 }, (_, k) => (
              <line key={k} x1={-PW} y1={-PH + 50 + k * 50} x2={PW} y2={-PH + 50 + k * 50} />
            ))}
            {Array.from({ length: 12 }, (_, k) => (
              <line key={`v${k}`} x1={-PW + 50 + k * 50} y1={-PH} x2={-PW + 50 + k * 50} y2={150} />
            ))}
          </g>
          {/* 蛍光灯 */}
          <rect x={-40} y={-PH} width={14} height={20} fill={KRP.ink} />
          <rect x={60} y={-PH} width={14} height={20} fill={KRP.ink} />
          <rect x={-70} y={-302} width={170} height={22} rx={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={15} cy={-250} rx={200} ry={90} fill={KRP.white} opacity={0.35} />
          {/* 右上の小窓 (夕暮れ) */}
          <g transform="translate(205 -200)">
            <rect x={-66} y={-76} width={132} height={130} fill="#E8A35C" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={-14} cy={10} r={26} fill="#E8694A" opacity={0.9} />
            <line x1={0} y1={-76} x2={0} y2={54} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 左: 茶の間への戸口 (向こうにテレビ) */}
          <rect x={-PW} y={-262} width={196} height={402} fill="#E6D3A6" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-PW} y={-220} width={196} height={12} fill={C.nageshi} opacity={0.8} />
          <rect x={-PW} y={92} width={196} height={48} fill={C.tatami} />
          <line x1={-PW} y1={92} x2={-94} y2={92} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-205} cy={-30} r={110} fill={C.crtGlow} opacity={0.3 + Math.sin(f / 5) * 0.05} />
          <CRTTv x={-190} y={96} s={0.36} f={f} on id="tv198b">
            <TvShow k={2} f={f} />
          </CRTTv>
          {/* 台所の板の間 (戸口の手前) */}
          <rect x={-PW} y={140} width={PW * 2} height={PH - 140} fill="#C9A472" />
          <line x1={-PW} y1={140} x2={PW} y2={140} stroke={KRP.ink} strokeWidth={5} />
          <g stroke="#A8844E" strokeWidth={3}>
            <line x1={-PW} y1={200} x2={PW} y2={200} />
            <line x1={-PW} y1={270} x2={PW} y2={270} />
          </g>
          {/* 戸口の柱 */}
          <rect x={-102} y={-262} width={16} height={402} fill={C.nageshi} stroke={KRP.ink} strokeWidth={4} />
          {/* のれん (戸口の上。すそが風でゆれる) */}
          <g>
            {[0, 1, 2].map((k) => {
              const sw = wob * (5 + k * 2);
              const x0 = -288 + k * 64;
              return (
                <g key={k}>
                  <path d={`M ${x0} -262 L ${x0 + 60} -262 L ${x0 + 60 + sw} -176 Q ${x0 + 30 + sw} -170 ${x0 + sw} -176 Z`}
                    fill="#5B7FA6" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
                  <path d={`M ${x0 + 2 + sw * 0.8} -196 L ${x0 + 58 + sw * 0.8} -196`} stroke={KRP.white} strokeWidth={4} opacity={0.8} />
                </g>
              );
            })}
            <rect x={-292} y={-268} width={202} height={12} rx={5} fill={C.tvWood} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 母: 皿を洗いながら、目は戸口のテレビ */}
          <Kasane x={40} y={300} s={1.2} lean={-4} f={f} phase={2}>
            <Person x={0} y={0} f={f} still cloth="#8A4A52" clothDark="#6E3A42" pose="hold"
              hair="none" gaze={[-7, -2]} face="normal" phase={2} />
          </Kasane>
          {/* 洗っている皿 (流しのふちから顔を出す) */}
          <g transform={`translate(34 ${132 - Math.abs(wob) * 6}) rotate(${-14 + wob * 8})`}>
            <ellipse cx={0} cy={0} rx={56} ry={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={0} rx={30} ry={9} fill="none" stroke={KRP.blueDeep} strokeWidth={3} />
          </g>
          {/* 蛇口 (右の壁から) + 水 */}
          <path d="M 290 40 L 236 40 Q 214 40 214 62 L 214 84" fill="none" stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
          <path d="M 290 40 L 236 40 Q 214 40 214 62 L 214 84" fill="none" stroke={C.deckSilver} strokeWidth={11} strokeLinecap="round" />
          {[0, 1, 2].map((k) => (
            <line key={k} x1={212 + k * 3} y1={94 + ((f * 6 + k * 16) % 46)} x2={212 + k * 3} y2={106 + ((f * 6 + k * 16) % 46)}
              stroke={KRP.blueDeep} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
          ))}
          {/* 流し台 (手は流しの中) */}
          <rect x={-90} y={140} width={380} height={24} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-90} y={164} width={380} height={160} fill="#B98A50" stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={100} y1={164} x2={100} y2={324} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={80} y={210} width={12} height={40} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <rect x={108} y={210} width={12} height={40} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          {/* 洗い終えた皿 (水切りかご) */}
          <g transform="translate(250 136)">
            {[0, 1, 2].map((k) => (
              <ellipse key={k} cx={-14 + k * 12} cy={-30} rx={10} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
          {/* 泡 (ふくらんで消える) */}
          {Array.from({ length: 9 }, (_, k) => {
            const p = ((f + k * 7) % 30) / 30;
            return (
              <circle key={k} cx={-70 + rnd(41, k) * 50 + (k % 2) * 190} cy={140 - rnd(42, k) * 22 - p * 30}
                r={7 + rnd(43, k) * 11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
                opacity={(1 - p) * 0.9} />
            );
          })}
        </g>
      ))}

      {/* ===== コマ3: 読みながら (父) ===== */}
      {koma(2, 1585, -1.5, (
        <g>
          {wall(71, 120)}
          {/* 茶箪笥 (左奥) */}
          <g transform="translate(-232 0)">
            <rect x={-60} y={-170} width={130} height={290} rx={6} fill={C.tvWood} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={-48} y={-156} width={106} height={70} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={4} />
            <line x1={5} y1={-156} x2={5} y2={-86} stroke={KRP.ink} strokeWidth={3.5} />
            <line x1={-60} y1={-60} x2={70} y2={-60} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-10} cy={30} r={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={20} cy={30} r={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <HangLamp x={10} top={-PH} y={-200} f={f} s={0.8} />
          {floor(120)}
          {/* テレビ (右。脚つき) */}
          <circle cx={160} cy={36} r={150} fill={C.crtGlow} opacity={0.22 + Math.sin(f / 5 + 1) * 0.04} />
          <CRTTv x={180} y={146} s={0.42} f={f} on id="tv198c">
            <TvShow k={1} f={f} />
          </CRTTv>
          {/* 父: 新聞を広げ、紙面の上からテレビをちらり */}
          <Kasane x={-66} y={300} s={1.25} lean={4} f={f} phase={1}
            front={
              <g transform={`rotate(${wob * 1.2} 0 -90)`}>
                {/* 左ページ */}
                <path d="M -154 -150 L 0 -140 L 0 -22 L -160 -16 Z" fill={C.news} stroke={KRP.ink}
                  strokeWidth={4.5} strokeLinejoin="round" />
                <rect x={-140} y={-136} width={58} height={20} fill={C.newsLine} opacity={0.6} />
                <g stroke={C.newsLine} strokeWidth={3.5}>
                  {[0, 1, 2, 3].map((k) => (
                    <line key={k} x1={-140} y1={-100 + k * 20} x2={-14} y2={-98 + k * 20} />
                  ))}
                </g>
                {/* 右ページ (めくれる) */}
                <path d={`M 0 -140 L ${154 - flip * 120} ${-150 - flip * 16} L ${160 - flip * 128} ${-16 + flip * 8} L 0 -22 Z`}
                  fill={flip > 0.5 ? "#E9E4D6" : C.news} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
                <g stroke={C.newsLine} strokeWidth={3.5} opacity={1 - flip}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <line key={k} x1={14} y1={-122 + k * 20} x2={138} y2={-126 + k * 20} />
                  ))}
                </g>
                <line x1={0} y1={-140} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={3.5} />
                {/* 新聞を持つ指先 */}
                <circle cx={-150} cy={-84} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={152 - flip * 124} cy={-88} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              </g>
            }>
            <Person x={0} y={0} f={f} still cloth="#55663F" clothDark="#41512F" pose="hold"
              glasses gaze={[7, -2]} face="normal" phase={1} />
          </Kasane>
          {/* 座布団 (脚を隠す) */}
          <Zabuton x={-66} y={300} s={0.82} color="#5A6B8C" />
          {/* 湯呑み (湯気) */}
          <g transform="translate(232 286)">
            <path d="M -22 -30 L -18 8 Q 0 16 18 8 L 22 -30 Z" fill="#6E7B5A" stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={0} cy={-30} rx={22} ry={7} fill="#9BB06A" stroke={KRP.ink} strokeWidth={3.5} />
            <path d={`M 0 -42 q ${5 + wob * 4} -14 -3 -28`} fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.6} />
          </g>
        </g>
      ))}

      {/* 札 (コマの下端。字幕帯より上) */}
      <TagPlate x={335} y={790} text="食べながら" size={36} t={seg(f, 12, 22)} fill={KRP.yellow} rot={-2} />
      <TagPlate x={960} y={790} text="洗いながら" size={36} t={seg(f, 19, 29)} fill={KRP.yellow} rot={1.6} />
      <TagPlate x={1585} y={790} text="読みながら" size={36} t={seg(f, 26, 36)} fill={KRP.yellow} rot={-1.5} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #199 客席が明るいどころか、テレビの前は、生活のど真ん中でした。
// 格: 並 / seed 1327
// ★修正3: 作者「もっと台本に適した精巧なイラストに変更」→ 間取り図の動線をやめ、
//   昭和の平屋の断面図 (ドールハウスのように手前の壁を切った家) に作り直し
// 絵: 夜の外は暗いのに、家の中は全部の部屋の明かりがついて明るい。真ん中の茶の間にテレビ。
//   そのまわりで同時に: 台所で料理する母 / ちゃぶ台で宿題の子 / 晩酌の父 / 洗濯物をたたむ祖母 /
//   テレビの前で寝ころぶ猫。全員の目線はテレビへ。テレビから家じゅうへゆるい光の輪が広がる
// 動き: 光の輪がゆっくり広がる・鍋の湯気とおたま・鉛筆・お猪口・たたむシャツ・猫の呼吸・星
const Sg199: React.FC<{ f: number }> = ({ f }) => {
  const wob = Math.sin(f / 8);
  const FL = 752; // 室内の床 (人物の足元)
  const TVX = 960; const TVS = 0.6;
  const scx = TVX - 49 * TVS; const scy = 745 - 238 * TVS; // テレビ画面の中心
  const sip = Math.max(0, Math.sin(f / 16)); // お猪口を口元へ
  const fold = Math.abs(Math.sin(f / 14)); // シャツをたたむ
  return (
    <Frame f={f} seed={1327} bg="#26304A">
      <defs>
        <clipPath id="house199"><rect x={148} y={292} width={1624} height={468} /></clipPath>
        <radialGradient id="tvglow199">
          <stop offset="0%" stopColor={C.crtGlow} stopOpacity={0.75} />
          <stop offset="100%" stopColor={C.crtGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* ===== 夜の外 (暗い) ===== */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#26304A" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={rnd(91, i) * W} cy={30 + rnd(92, i) * 200} r={2.5}
          fill={KRP.white} opacity={0.35 + 0.45 * Math.abs(Math.sin(f / 13 + i))} />
      ))}
      <circle cx={1780} cy={120} r={42} fill="#EDE3BE" opacity={0.95} />
      <circle cx={1766} cy={108} r={9} fill="#D9C98E" />
      {/* 地面 */}
      <rect x={-20} y={810} width={W + 40} height={300} fill="#3A3428" />
      <path d="M -20 812 L 1940 812" stroke={KRP.ink} strokeWidth={6} />
      {/* 庭木 (両脇) */}
      <g fill="#2F3B2E" stroke={KRP.ink} strokeWidth={5}>
        <circle cx={50} cy={720} r={70} />
        <circle cx={1880} cy={730} r={64} />
      </g>

      {/* ===== 屋根 (瓦) と屋根裏 ===== */}
      <polygon points="60,296 960,72 1860,296" fill="#55606E" stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
      {/* 瓦の重なり (軒先の丸瓦) */}
      <g fill="none" stroke="#3E4652" strokeWidth={4}>
        {Array.from({ length: 13 }, (_, i) => {
          const t = (i + 0.5) / 13;
          const xl = lerp(76, 950, t); const yl = lerp(286, 80, t);
          const xr = lerp(1844, 970, t); const yr = lerp(286, 80, t);
          return (
            <g key={i}>
              <path d={`M ${xl - 22} ${yl + 6} q 22 -16 44 -10`} />
              <path d={`M ${xr - 22} ${yr - 4} q 22 -6 44 10`} />
            </g>
          );
        })}
      </g>
      <polygon points="160,280 960,118 1760,280" fill="#4A3E33" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 小屋組 (束と梁) */}
      <g stroke="#6E5440" strokeWidth={8} strokeLinecap="round">
        <line x1={960} y1={124} x2={960} y2={278} />
        <line x1={560} y1={200} x2={560} y2={278} />
        <line x1={1360} y1={200} x2={1360} y2={278} />
      </g>
      {/* 天井の梁 */}
      <rect x={120} y={276} width={1680} height={18} fill="#8A6436" stroke={KRP.ink} strokeWidth={5} />

      {/* ===== 室内 (どの部屋も明かりがついて明るい) ===== */}
      {/* 台所: タイルの壁 + 板の床 */}
      <rect x={148} y={294} width={392} height={410} fill="#E4ECEE" />
      <g stroke="#C5D2D6" strokeWidth={3}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={148} y1={344 + i * 46} x2={540} y2={344 + i * 46} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`v${i}`} x1={190 + i * 46} y1={294} x2={190 + i * 46} y2={704} />
        ))}
      </g>
      <rect x={148} y={704} width={392} height={56} fill="#C9A472" />
      {/* 台所の窓 (外は夜) */}
      <rect x={176} y={350} width={110} height={110} fill="#2B3850" stroke={KRP.ink} strokeWidth={6} />
      <line x1={231} y1={350} x2={231} y2={460} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 茶の間: 砂壁 + 長押 + 畳 */}
      <rect x={562} y={294} width={798} height={410} fill="#EEDFB8" />
      <g stroke="#D8C9A4" strokeWidth={3} opacity={0.6} strokeLinecap="round">
        {Array.from({ length: 10 }, (_, i) => {
          const x = 580 + rnd(93, i) * 740;
          const y = 420 + rnd(94, i) * 250;
          return <line key={i} x1={x} y1={y} x2={x + 22 + rnd(95, i) * 24} y2={y} />;
        })}
      </g>
      <rect x={562} y={380} width={798} height={16} fill={C.nageshi} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={562} y={704} width={798} height={56} fill={C.tatami} />
      {/* 座敷: 障子 + 畳 */}
      <rect x={1382} y={294} width={390} height={410} fill="#EEDFB8" />
      <rect x={1400} y={420} width={352} height={284} fill="#F6F1E2" stroke={KRP.ink} strokeWidth={5} />
      <g stroke="#A88F6A" strokeWidth={3}>
        {[1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={1400 + i * 58.6} y1={420} x2={1400 + i * 58.6} y2={704} />
        ))}
        {[1, 2, 3].map((i) => (
          <line key={`h${i}`} x1={1400} y1={420 + i * 71} x2={1752} y2={420 + i * 71} />
        ))}
      </g>
      <rect x={1382} y={704} width={390} height={56} fill={C.tatami} />
      {/* 畳の目・床板 (横筋だけ) */}
      <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.55}>
        <line x1={562} y1={724} x2={1360} y2={724} />
        <line x1={562} y1={744} x2={1360} y2={744} />
        <line x1={1382} y1={724} x2={1772} y2={724} />
        <line x1={1382} y1={744} x2={1772} y2={744} />
      </g>
      <g stroke="#A8844E" strokeWidth={3}>
        <line x1={148} y1={724} x2={540} y2={724} />
        <line x1={148} y1={744} x2={540} y2={744} />
      </g>
      <line x1={148} y1={704} x2={1772} y2={704} stroke={KRP.ink} strokeWidth={5} />

      {/* ===== テレビから家じゅうへ広がる光の輪 (人物の後ろ・家の中だけ) ===== */}
      <g clipPath="url(#house199)">
        <circle cx={scx} cy={scy} r={300} fill="url(#tvglow199)" opacity={0.85 + Math.sin(f / 6) * 0.1} />
        {[0, 1, 2].map((i) => {
          const p = ((f / 84) + i / 3) % 1;
          return (
            <circle key={i} cx={scx} cy={scy} r={130 + p * 880} fill="none"
              stroke={KRP.yellow} strokeWidth={11} opacity={(1 - p) * 0.75} />
          );
        })}
      </g>

      {/* 部屋ごとの電灯 (全部点いている) */}
      <HangLamp x={470} top={294} y={372} f={f} s={0.75} />
      <HangLamp x={TVX} top={294} y={366} f={f} s={0.85} />
      <HangLamp x={1690} top={294} y={372} f={f} s={0.75} />

      {/* ===== 台所: 料理する母 ===== */}
      <Kasane x={330} y={FL} s={0.95} lean={3} f={f} phase={2}
        front={
          <g>
            {/* おたま (右手から鍋へ) */}
            <g transform={`rotate(${wob * 4} 14 -118)`}>
              <line x1={14} y1={-118} x2={128} y2={-150} stroke={C.deckDark} strokeWidth={6} strokeLinecap="round" />
              <ellipse cx={130} cy={-146} rx={10} ry={6} fill={C.deckDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          </g>
        }>
        <Person x={0} y={0} f={f} still cloth="#8A4A52" clothDark="#6E3A42" pose="hold"
          hair="none" gaze={[7, -1]} face="smile" phase={2} />
      </Kasane>
      {/* 調理台とコンロ・鍋 */}
      <g>
        <rect x={170} y={652} width={356} height={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={176} y={672} width={344} height={82} fill="#B98A50" stroke={KRP.ink} strokeWidth={5} />
        <line x1={348} y1={672} x2={348} y2={754} stroke={KRP.ink} strokeWidth={4} />
        <rect x={418} y={640} width={104} height={12} rx={4} fill={C.deckDark} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M 428 642 L 430 600 Q 470 590 510 600 L 512 642 Z" fill={C.deckDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={418} y={594} width={104} height={12} rx={6} fill={C.deckDark} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${446 + i * 22} 584 q ${6 + wob * 5} -18 -3 -36`} fill="none"
            stroke={KRP.grayDark} strokeWidth={4} opacity={0.6 - i * 0.12} />
        ))}
        <rect x={200} y={636} width={90} height={16} rx={3} fill="#E8D3A8" stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={226} cy={630} r={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 台所の棚 (瓶) */}
      <g>
        <rect x={430} y={470} width={100} height={12} fill={C.tvWood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={440} y={430} width={22} height={40} rx={5} fill="#C77B4A" stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={470} y={440} width={22} height={30} rx={5} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={500} y={426} width={18} height={44} rx={5} fill="#6E7B5A" stroke={KRP.ink} strokeWidth={3.5} />
      </g>

      {/* ===== 茶の間: 主役のテレビ ===== */}
      <CRTTv x={TVX} y={745} s={TVS} f={f} on id="tv199">
        <TvShow k={0} f={f} />
      </CRTTv>
      <CatSleep x={1050} y={734} s={0.5} f={f} />

      {/* 宿題する子 (左) */}
      <Kasane x={690} y={FL} s={0.78} lean={4} f={f} phase={3}
        front={<g><Hiza dark="#A0603A" zabuton="#5A6B8C" /><g transform={`translate(${16 + Math.sin(f / 4) * 6} -116) rotate(40)`}>
            <rect x={-6} y={-50} width={12} height={50} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -6 0 L 0 12 L 6 0 Z" fill={C.skin} stroke={KRP.ink} strokeWidth={3.5} />
          </g></g>
        }>
        <Person x={0} y={0} f={f} still cloth="#C77B4A" clothDark="#A0603A" pose="hold"
          gaze={[7, -1]} face="normal" phase={3} />
      </Kasane>
      <g transform="translate(690 680)">
        <rect x={-96} y={6} width={18} height={66} rx={6} fill="#8A6436" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={78} y={6} width={18} height={66} rx={6} fill="#8A6436" stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={6} rx={118} ry={20} fill="#B98A50" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={118} ry={18} fill="#C99B60" stroke={KRP.ink} strokeWidth={5} />
        <g transform="rotate(-4)">
          <rect x={-46} y={-14} width={70} height={20} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={-11} y1={-14} x2={-11} y2={6} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      </g>

      {/* 晩酌する父 (右) */}
      <Kasane x={1236} y={FL} s={0.88} lean={-4} f={f} phase={1}
        front={
          <g>
            <Hiza dark="#41512F" zabuton="#7A5A3C" />
            {/* 晩酌の赤いほっぺ */}
            <ellipse cx={-42} cy={-196} rx={11} ry={6} fill={KRP.red} opacity={0.35} />
            <ellipse cx={42} cy={-196} rx={11} ry={6} fill={KRP.red} opacity={0.35} />
            {/* お猪口 (右手。口元の手前までゆっくり上がる) */}
            <g transform={`translate(${14 + sip * 4} ${-128 - sip * 16})`}>
              <path d="M -12 -10 L 12 -10 L 8 8 L -8 8 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -10 -4 L 10 -4" stroke={KRP.blueDeep} strokeWidth={3} />
            </g>
          </g>
        }>
        <Person x={0} y={0} f={f} still cloth="#55663F" clothDark="#41512F" pose="hold"
          glasses gaze={[-7, -1]} face="smile" phase={1} />
      </Kasane>
      {/* 父の脇の盆 (床に置いた徳利と枝豆) */}
      <g transform="translate(1146 748)">
        <ellipse cx={0} cy={0} rx={40} ry={11} fill="#7A2E26" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 14 -4 Q 2 -20 9 -36 Q 12 -44 10 -54 L 22 -54 Q 20 -44 24 -36 Q 32 -20 20 -4 Z"
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <g fill={KRP.green} stroke={KRP.ink} strokeWidth={2.5}>
          <ellipse cx={-20} cy={-6} rx={10} ry={5} />
          <ellipse cx={-6} cy={-8} rx={10} ry={5} transform="rotate(-20 -6 -8)" />
        </g>
      </g>

      {/* ===== 座敷: 洗濯物をたたむ祖母 ===== */}
      <Kasane x={1560} y={FL + 6} s={0.9} lean={-3} f={f} phase={4}
        back={<circle cx={0} cy={-300} r={26} fill="#B9B4AA" stroke={KRP.ink} strokeWidth={5} />}
        front={
          <g>
            {/* 白髪 */}
            <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z"
              fill="#B9B4AA" stroke={KRP.ink} strokeWidth={4} />
            {/* たたんでいるシャツ (横に縮んで開く) */}
            <g transform={`translate(0 -112) scale(${1 - fold * 0.45} 1)`}>
              <path d="M -60 -26 L -24 -38 L 24 -38 L 60 -26 L 70 2 L 40 6 L 40 34 L -40 34 L -40 6 L -70 2 Z"
                fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
              <path d="M -12 -38 L 0 -26 L 12 -38" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          </g>
        }>
        <Person x={0} y={0} f={f} still cloth="#6B6F8E" clothDark="#545870" pose="hold"
          hair="none" gaze={[-7, -1]} face="smile" phase={4} />
      </Kasane>
      {/* 洗濯かご + たたんだタオルの山 */}
      <g transform="translate(1530 712)">
        <path d="M -96 -20 L 96 -20 L 84 48 L -84 48 Z" fill="#D9B87A" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <g stroke="#A8844E" strokeWidth={3}>
          <line x1={-92} y1={2} x2={92} y2={2} />
          <line x1={-88} y1={24} x2={88} y2={24} />
        </g>
        <path d="M -70 -20 Q -40 -44 0 -30 Q 40 -48 74 -20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g transform="translate(1700 752)">
        {([KRP.blue, KRP.cream, "#E8A35C", KRP.white] as const).map((col, i) => (
          <rect key={i} x={-40} y={-24 - i * 22} width={80} height={22} rx={6} fill={col} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>

      {/* ===== 断面の切り口 (外壁・柱・床) ===== */}
      <rect x={120} y={294} width={28} height={466} fill="#E6D8B8" stroke={KRP.ink} strokeWidth={6} />
      <rect x={1772} y={294} width={28} height={466} fill="#E6D8B8" stroke={KRP.ink} strokeWidth={6} />
      <rect x={540} y={294} width={22} height={466} fill="#8A6436" stroke={KRP.ink} strokeWidth={5} />
      <rect x={1360} y={294} width={22} height={466} fill="#8A6436" stroke={KRP.ink} strokeWidth={5} />
      <rect x={112} y={758} width={1696} height={26} fill="#8A6436" stroke={KRP.ink} strokeWidth={6} />
      {/* 床下の束石 */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={150 + i * 200} y={784} width={44} height={28} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #200 1979年には、手元で局を変えられるリモコンが登場します。
// 格: 山 / seed 1328
// 絵: リモコン降臨。座布団の上に初代リモコンが鎮座し、後光が差す。家族が拝むように覗き込む。ユーモア
// どこ: 夕暮れの茶の間。中央の座布団に初代リモコンが鎮座する「降臨」の山
// 演出: 後光の扇が回り、きらめきが瞬く。父母は拝むように覗き込み、子は万歳。
//       猫まで座って見ている。年号札1979
// 動き: 後光の回転・光輪の脈動・きらめき・人物のゆれ・ほこりの粒
const Sg200: React.FC<{ f: number }> = ({ f }) => {
  const appear = pop(seg(f, 4, 18));
  const halo = 1 + Math.sin(f / 8) * 0.06;
  return (
    <Frame f={f} seed={1328}>
      <TatamiRoom floorY={600} wall="#E8D3A8" />
      {/* 夕日の窓 (左) */}
      <g transform="translate(260 0)">
        <rect x={-170} y={110} width={340} height={320} fill="#E8A35C" stroke={KRP.ink} strokeWidth={8} />
        <circle cx={-30} cy={300} r={66} fill="#E8694A" stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
        <line x1={0} y1={110} x2={0} y2={430} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-170} y1={270} x2={170} y2={270} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-186} y={430} width={372} height={16} rx={5} fill={C.nageshi} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 夕日の光が畳に長く差す */}
      <path d="M 90 430 L 430 430 L 900 1080 L 180 1080 Z" fill="#E8A35C" opacity={0.16} />
      {/* 茶箪笥 (右奥) */}
      <g transform="translate(1680 0)">
        <rect x={-150} y={190} width={300} height={420} rx={8} fill={C.tvWood} stroke={KRP.ink} strokeWidth={7} />
        <line x1={-150} y1={330} x2={150} y2={330} stroke={KRP.ink} strokeWidth={5} />
        <line x1={0} y1={330} x2={0} y2={610} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={230} width={240} height={70} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -96 262 Q -60 246 -24 262 M 24 262 Q 60 246 96 262" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={-36} cy={470} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={36} cy={470} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* ===== 後光 (回る扇 + 脈動する光輪) ===== */}
      <g transform={`translate(960 640) scale(${appear})`}>
        <g transform={`rotate(${f * 0.8})`} opacity={0.5}>
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M 0 0 L -60 -430 L 60 -430 Z" fill={C.lampWarm}
              opacity={i % 2 === 0 ? 0.55 : 0.3}
              transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <circle r={300 * halo} fill={KRP.yellow} opacity={0.2} />
        <circle r={210 * halo} fill={C.lampWarm} opacity={0.4} />
        <circle r={240 * halo} fill="none" stroke={KRP.brass} strokeWidth={5} opacity={0.65} />
      </g>
      {/* きらめき (十字の星) */}
      {([[700, 380], [1260, 330], [1120, 760], [810, 700], [990, 260]] as const).map(([sx, sy], i) => {
        const tw = Math.max(0, Math.sin(f / 6 + i * 1.9));
        return (
          <g key={i} transform={`translate(${sx} ${sy}) scale(${0.5 + tw * 0.7})`} opacity={tw}>
            <path d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z"
              fill={KRP.white} stroke={KRP.brass} strokeWidth={3} />
          </g>
        );
      })}
      {/* ほこりの粒 (光の中を漂う) */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={760 + rnd(51, i) * 400}
          cy={420 + rnd(52, i) * 320 + Math.sin(f / 10 + i) * 10}
          r={3 + rnd(53, i) * 3} fill={KRP.white} opacity={0.5} />
      ))}
      {/* ===== 玉座の座布団 (二段重ね) + 初代リモコン ===== */}
      <Zabuton x={960} y={850} s={1.5} color="#8A4A52" />
      <Zabuton x={960} y={812} s={1.3} color="#A85A62" />
      <g transform={`translate(960 700) scale(${appear}) rotate(-7)`}>
        <ellipse cx={0} cy={112} rx={88} ry={18} fill={KRP.ink} opacity={0.18} />
        <RemoteCtl x={0} y={0} s={1.15} rot={0} />
        {/* 照りの白線 */}
        <line x1={-36} y1={-120} x2={-36} y2={-60} stroke={KRP.white} strokeWidth={5} opacity={0.7} />
      </g>
      {/* ===== 拝む家族 ===== */}
      <Person x={520} y={1010} s={1.25} cloth="#55663F" clothDark="#41512F" pose="hold"
        glasses face="surprised" gaze={[0.9, 0.5]} lean={13} f={f} phase={1} />
      <Person x={1420} y={1010} s={1.22} cloth="#8A4A52" clothDark="#6E3A42" pose="hold"
        hair="none" face="surprised" gaze={[-0.9, 0.5]} lean={-13} f={f} phase={2} />
      <PersonMini x={700} y={1050} s={1.15} color="#C77B4A" f={f} phase={3} face="smile" arms="up" />
      {/* 猫も座って見ている (しっぽだけ振る) */}
      <g transform="translate(1250 1020)">
        <path d={`M 50 -10 Q ${96 + Math.sin(f / 7) * 14} -40 70 -90`} fill="none"
          stroke={C.cat} strokeWidth={18} strokeLinecap="round" />
        <path d={`M 50 -10 Q ${96 + Math.sin(f / 7) * 14} -40 70 -90`} fill="none"
          stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.9} />
        <path d="M -44 0 Q -56 -90 0 -96 Q 56 -90 44 0 Z" fill={C.cat} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-112} r={34} fill={C.cat} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -26 -136 L -34 -160 L -10 -144 Z M 26 -136 L 34 -160 L 10 -144 Z"
          fill={C.cat} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-11} cy={-116} r={4} fill={KRP.ink} />
        <circle cx={11} cy={-116} r={4} fill={KRP.ink} />
        <path d="M -4 -106 L 0 -102 L 4 -106" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />
      </g>
      {/* 年号札 */}
      <TagPlate x={960} y={100} text="1979" size={48} t={seg(f, 10, 20)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #201 80年代に普及すると、お客はコマーシャルのたびに、よその局へ旅立ちました。
// 格: 並 / seed 1329
// 絵: CMのたびに親指がカチッ。画面が別の局へ切り替わる
// どこ: 夜の居間。左手前にリモコンを握る大きな手、右にテレビ (斜め後ろからの構図)
// ★修正3: 作者「リモコンでチャンネル変えるシーンはペースが早いから落として」
//   以前は 8コマ (0.27秒) ごとに切替+白フラッシュの点滅+残像が常時重なっていた。
//   → 1局あたり 30コマ (1.0秒) 映してから次へ。押す手・稲妻・つまみ・部屋の光も同じ 30コマ周期に揃え、
//     切替は「押す → 6コマで前の局が消えて走査線が1本流れる」だけ。チカチカさせない
//   f=45 は周期の15コマ目 (切替の途中ではない)
// 動き: 親指が押し込む/戻る・稲妻が走る・画面の局と局番号・つまみが回る・各番組の中の動き
const Sg201: React.FC<{ f: number }> = ({ f }) => {
  const P = 30; // 1局あたりのコマ数
  const idx = Math.floor(f / P);
  const p = f % P;
  const CH = [
    { k: 0, n: "1" }, { k: 1, n: "4" }, { k: 2, n: "6" }, { k: 3, n: "8" },
    { k: 4, n: "10" }, { k: 1, n: "12" }, { k: 2, n: "3" }, { k: 0, n: "5" },
  ];
  const cur = CH[idx % CH.length];
  const prev = CH[(idx + CH.length - 1) % CH.length];
  // 親指: 次の切替の8コマ前から押し込み、切替後6コマで戻る
  const press = p >= P - 8
    ? easeOut(seg(p, P - 8, P - 3))
    : idx > 0 ? 1 - easeOut(seg(p, 1, 7)) : 0;
  const sig = clamp01((press - 0.35) / 0.5); // 稲妻の濃さ (なめらか)
  const tr = idx > 0 ? seg(p, 0, 6) : 1; // 切替の進み (0→1)
  return (
    <Frame f={f} seed={1329} bg={C.nightBg} dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightBg} />
      {/* 夜の壁と月明かりの窓 */}
      <rect x={-20} y={-20} width={W + 40} height={760} fill={C.wallNight} />
      <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-20} y={740} width={W + 40} height={360} fill="#3E3A30" />
      <g transform="translate(1660 0)" opacity={0.9}>
        <rect x={-130} y={100} width={260} height={280} fill="#232B3E" stroke={KRP.ink} strokeWidth={7} />
        <line x1={0} y1={100} x2={0} y2={380} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={60} cy={170} r={28} fill={C.lampWarm} opacity={0.85} />
      </g>
      {/* テレビ台と主役のテレビ */}
      <g>
        <rect x={1020} y={810} width={660} height={36} rx={10} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1070} y={846} width={28} height={110} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1600} y={846} width={28} height={110} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      <CRTTv x={1350} y={812} s={1.42} f={f} on id="tv201" dial={idx * 2}>
        <TvShow k={cur.k} f={f} />
        {/* 切替直後だけ、前の局がすっと消える */}
        {tr < 1 && (
          <g opacity={1 - tr}>
            <TvShow k={prev.k} f={f} />
          </g>
        )}
        {/* 切替の走査線 (1本だけ上から下へ流れる) */}
        {tr < 1 && (
          <rect x={-204} y={-364 + tr * 240} width={310} height={14} fill={KRP.white} opacity={0.45 * (1 - tr)} />
        )}
        {/* 局番号 (画面右上) */}
        <text x={92} y={-322} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={40}
          fill={KRP.green} stroke={KRP.ink} strokeWidth={6} paintOrder="stroke">{tr < 0.5 ? prev.n : cur.n}</text>
      </CRTTv>
      {/* テレビの光が部屋に差す (切替のときだけ少し明るむ) */}
      <path d="M 1110 300 L 420 80 L 420 1000 L 1110 700 Z" fill={C.crtGlow}
        opacity={0.1 + 0.06 * (1 - tr)} />
      <ellipse cx={1350} cy={990} rx={420} ry={70} fill={C.crtGlow} opacity={0.14} />
      {/* リモコンからの信号 (稲妻)。押しているあいだだけ、左から右へ走る */}
      <g opacity={0.12 + sig * 0.83}>
        <path d="M 560 620 L 700 590 L 680 614 L 830 578 L 810 602 L 960 568"
          fill="none" stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
          pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 - sig * 100} />
        <path d="M 980 540 L 1030 560 M 980 596 L 1030 580" stroke={KRP.yellow} strokeWidth={6}
          strokeLinecap="round" opacity={sig} />
      </g>
      {/* ===== 左手前: リモコンを握る大きな手 ===== */}
      <g transform={`translate(360 860) rotate(-18) scale(2.1)`}>
        <RemoteCtl x={0} y={0} s={1} rot={0} />
        {/* 握る手 (下から包む) */}
        <path d="M -70 40 Q -120 70 -110 150 Q -100 220 -10 220 Q 90 220 96 140 Q 100 92 66 60 L 60 118 Q 30 140 -8 128 L -50 96 Z"
          fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-52 + i * 38} ${100 + i * 4} q 16 26 40 22`}
            fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        ))}
        {/* 親指 (1局ごとに1回押す) */}
        <g transform={`translate(${-34 + press * 14} ${-8 - press * 22}) rotate(${press * -14})`}>
          <path d="M 0 60 Q -34 40 -28 -6 Q -22 -34 6 -32 Q 28 -28 24 8 L 16 56 Z"
            fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        </g>
        {/* 押し込んだときの放射線 (なめらかに出て消える) */}
        <g stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" opacity={sig}>
          <line x1={-52} y1={-60} x2={-72} y2={-84} />
          <line x1={-16} y1={-70} x2={-20} y2={-100} />
          <line x1={14} y1={-62} x2={30} y2={-88} />
        </g>
      </g>
      {/* 手前のソファの肘掛け (前景の影) */}
      <path d="M -20 980 Q 240 920 560 970 L 560 1100 L -20 1100 Z"
        fill="#2B2B26" stroke={KRP.ink} strokeWidth={6} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #202 番組のほうが「どこから観ても分かる構成」へ、作り替えられていきます。
// 格: 並 / seed 1330
// 絵: 放送作家の机。構成表を書き直す赤ペン。「冒頭にあらすじ」「随時おさらい」の書き込み
// どこ: 放送作家の机の真上。電気スタンドの暖色の光だまり
// 演出: 構成表の机上ビュー。赤ペンが修正を描き込み 付箋2枚が貼られる
// 動き: 赤丸と矢印が線で伸びる / 付箋がポン / 湯気ゆらぎ / ペン先が小さく動く
const Sg202: React.FC<{ f: number }> = ({ f }) => {
  const circ = easeOut(seg(f, 4, 16));   // 赤丸が描かれる
  const arw = easeOut(seg(f, 12, 22));   // 赤矢印が伸びる
  const st1 = pop(seg(f, 18, 28));       // 付箋1
  const st2 = pop(seg(f, 26, 36));       // 付箋2
  const wob = Math.sin(f / 5) * 3;       // ペン先の揺れ
  // 文字のくねくね線 (本物の文は書かない)
  const squig = (x: number, y: number, w: number, o = 0.55) => (
    <path d={`M ${x} ${y} q ${w * 0.12} -5 ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0`}
      fill="none" stroke={C.newsLine} strokeWidth={4} opacity={o} strokeLinecap="round" />
  );
  return (
    <Frame f={f} seed={1330}>
      {/* 机の板 (画面いっぱい) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={SGP.wood} />
      <g stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.5}>
        {[70, 260, 850, 1010].map((y) => (
          <path key={y} d={`M -20 ${y} Q ${W / 2} ${y + 18} ${W + 20} ${y - 8}`} fill="none" />
        ))}
        <ellipse cx={1690} cy={120} rx={46} ry={16} fill="none" />
      </g>
      {/* スタンドの光だまり */}
      <ellipse cx={760} cy={480} rx={980} ry={620} fill={C.lampWarm} opacity={0.22} />
      {/* 電気スタンド (左上から腕が入る) */}
      <g>
        <line x1={-10} y1={60} x2={300} y2={190} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        <path d="M 250 160 L 390 230 L 300 330 L 190 240 Z" fill="#3E6E58" stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={300} cy={286} rx={66} ry={28} fill={C.lampWarm} opacity={0.9} />
      </g>
      {/* ===== 主役: 構成表 ===== */}
      <g transform="translate(910 540) rotate(-2)">
        <rect x={-610} y={-358} width={1220} height={716} rx={8}
          fill={C.planPaper} stroke={KRP.ink} strokeWidth={7} />
        {/* 題名帯 */}
        <rect x={-610} y={-358} width={1220} height={74} fill="#DCE8DC" stroke={KRP.ink} strokeWidth={6} />
        {squig(-540, -318, 360, 0.7)}
        <circle cx={520} cy={-322} r={22} fill="none" stroke={KRP.red} strokeWidth={5} opacity={0.7} />
        {/* 3コマ割の縦線 */}
        <line x1={-200} y1={-284} x2={-200} y2={358} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={206} y1={-284} x2={206} y2={358} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {/* 行 (くねくね文字) */}
        {[0, 1, 2, 3, 4].map((r) => (
          <g key={r}>
            <line x1={-610} y1={-284 + (r + 1) * 128} x2={610} y2={-284 + (r + 1) * 128}
              stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
            {squig(-560, -236 + r * 128, 300)}
            {squig(-560, -196 + r * 128, 240, 0.4)}
            {squig(-150, -236 + r * 128, 300)}
            {squig(-150, -196 + r * 128, 220, 0.4)}
            {squig(256, -236 + r * 128, 300)}
            {squig(256, -196 + r * 128, 250, 0.4)}
          </g>
        ))}
        {/* 赤ペンの修正: 左上ブロックに赤丸 */}
        <ellipse cx={-400} cy={-212} rx={190} ry={74} fill="none"
          stroke={KRP.red} strokeWidth={7} strokeLinecap="round"
          pathLength={100} strokeDasharray={100} strokeDashoffset={100 - circ * 100} />
        {/* 中段から冒頭へ引っぱり上げる赤矢印 */}
        <path d="M 30 100 Q -260 60 -380 -120" fill="none"
          stroke={KRP.red} strokeWidth={7} strokeLinecap="round"
          pathLength={100} strokeDasharray={100} strokeDashoffset={100 - arw * 100} />
        {arw > 0.95 && (
          <path d="M -400 -96 L -384 -132 L -352 -106 Z" fill={KRP.red} />
        )}
        {/* 消し線 (右の列) */}
        <line x1={240} y1={-110} x2={560} y2={-122} stroke={KRP.red} strokeWidth={6} opacity={0.85} />
        <line x1={240} y1={20} x2={520} y2={10} stroke={KRP.red} strokeWidth={6} opacity={0.85} />
      </g>
      {/* 付箋1: 冒頭にあらすじ (黄) */}
      <g transform={`translate(430 162) rotate(-6) scale(${st1})`} opacity={st1}>
        <rect x={-148} y={-44} width={296} height={88} rx={6}
          fill={C.stickyY} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M 100 -44 L 148 -44 L 148 -6 Z" fill="#E0C85A" stroke={KRP.ink} strokeWidth={4} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={34}
          fontWeight={700} fill={KRP.ink}>冒頭にあらすじ</text>
      </g>
      {/* 付箋2: 随時おさらい (橙) */}
      <g transform={`translate(1310 640) rotate(5) scale(${st2})`} opacity={st2}>
        <rect x={-134} y={-44} width={268} height={88} rx={6}
          fill={C.stickyO} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -134 20 L -134 44 L -92 44 Z" fill="#DE9C4E" stroke={KRP.ink} strokeWidth={4} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={34}
          fontWeight={700} fill={KRP.ink}>随時おさらい</text>
      </g>
      {/* ===== 右下: 赤ペンを持つ手 ===== */}
      <g transform={`translate(${1420 + wob} ${770 - wob * 0.6}) rotate(34)`}>
        <rect x={-14} y={-330} width={28} height={290} rx={12}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -14 -40 L 0 18 L 14 -40 Z" fill="#E8E0CE" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -4 -4 L 0 18 L 4 -4 Z" fill={KRP.red} />
        <rect x={-14} y={-330} width={28} height={36} rx={10} fill={KRP.ink} />
        {/* 手 */}
        <path d="M -20 -120 Q -78 -110 -92 -40 Q -100 30 -20 56 Q 70 76 96 0 Q 110 -60 60 -96 L 44 -40 Q 16 -16 -10 -36 Z"
          fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -16 -96 q -30 10 -32 48 M 48 -70 q 14 22 2 48"
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
      </g>
      {/* 小物: 珈琲・ペン皿・紙くず */}
      <g transform="translate(1700 300)">
        <ellipse cx={0} cy={54} rx={86} ry={22} fill={SGP.woodDark} opacity={0.5} />
        <path d="M -60 -30 L -50 48 Q 0 66 50 48 L 60 -30 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 58 -16 q 40 6 2 44" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-30} rx={60} ry={16} fill="#6E4A32" stroke={KRP.ink} strokeWidth={5} />
        <path d={`M -16 -62 q ${8 + Math.sin(f / 7) * 6} -26 -4 -52 M 18 -56 q ${-8 + Math.cos(f / 8) * 6} -22 6 -44`}
          fill="none" stroke={KRP.grayDark} strokeWidth={4.5} opacity={0.65} strokeLinecap="round" />
      </g>
      <g transform="translate(150 900)">
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${i * 150} ${i * -36})`}>
            <path d="M -52 10 L -30 -38 L 16 -50 L 52 -18 L 40 28 L -14 40 Z"
              fill={C.news} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
            <path d="M -30 -8 L 12 -26 M -6 24 L 28 -8" stroke={C.newsLine} strokeWidth={3.5} />
          </g>
        ))}
      </g>
      <g transform="translate(120 190) rotate(-8)">
        <rect x={-110} y={-28} width={220} height={66} rx={12} fill="#9C6A3E" stroke={KRP.ink} strokeWidth={6} />
        <line x1={-80} y1={-28} x2={-96} y2={-78} stroke={KRP.blueDeep} strokeWidth={10} strokeLinecap="round" />
        <line x1={-30} y1={-28} x2={-30} y2={-86} stroke={KRP.green} strokeWidth={10} strokeLinecap="round" />
        <line x1={20} y1={-28} x2={34} y2={-74} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #203 録画機がやってくると、お客はコマーシャルを早送りしはじめます。
// 格: 並 / seed 1331
// 絵: ビデオデッキとテープ。画面の隅に「▶▶ ×2」。CMの早回しでカクカク動く映像の線
// どこ: 夜の居間。今度はテレビが左 右に電気スタンドの光だまり (201と左右反転の構図)
// 演出: ビデオデッキが主役。カセットが吸い込まれ リールが高速回転 指が早送りボタンを押す
// 動き: 画面の中身がカクカク横ずれ+残像 / ノイズ帯が流れる / ▶▶ ×2 が点滅 / リール回転
const Sg203: React.FC<{ f: number }> = ({ f }) => {
  const jit = (f % 3) * 8 - 8;             // カクカク横ずれ
  const tapeIn = easeOut(seg(f, 6, 20));   // カセット挿入
  const press = pop(seg(f, 22, 28));       // 早送りボタンを押す
  const osd = f % 10 < 7 ? 1 : 0.25;       // OSD 点滅
  return (
    <Frame f={f} seed={1331} bg={C.nightBg} dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightBg} />
      {/* 藍の夜壁 + 板の間 */}
      <rect x={-20} y={-20} width={W + 40} height={770} fill="#343E54" />
      <line x1={-20} y1={750} x2={W + 20} y2={750} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-20} y={750} width={W + 40} height={350} fill="#4A4438" />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[830, 930, 1030].map((y) => <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} />)}
      </g>
      {/* 右の電気スタンドと光だまり (201 の窓と入れ替え) */}
      <g transform="translate(1610 0)">
        <line x1={0} y1={750} x2={0} y2={330} stroke={KRP.ink} strokeWidth={12} />
        <path d="M -90 330 L 90 330 L 56 220 L -56 220 Z" fill="#7E5A3E" stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={0} cy={330} rx={120} ry={34} fill={C.lampWarm} opacity={0.75} />
        <ellipse cx={0} cy={560} rx={300} ry={330} fill={C.lampWarm} opacity={0.12} />
        <ellipse cx={-30} cy={980} rx={300} ry={60} fill={C.lampWarm} opacity={0.14} />
      </g>
      {/* 観葉植物 (右端の前景) */}
      <g transform="translate(1830 960)">
        <path d="M -60 0 L 60 0 L 44 -96 L -44 -96 Z" fill="#8A4A52" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 0 -96 Q -70 -190 -40 -280 M 0 -96 Q 10 -220 70 -270 M 0 -96 Q -10 -180 -110 -210"
          fill="none" stroke="#4E7A50" strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* ===== 左: テレビ (カクカクするCM) ===== */}
      <g>
        <rect x={240} y={700} width={760} height={38} rx={10} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={300} y={738} width={30} height={130} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={910} y={738} width={30} height={130} fill={C.tvWoodDark} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      <CRTTv x={620} y={702} s={1.35} f={f} on id="tv203">
        {/* CM画面: 商品ボトルと太陽 (早回しで横ずれ+残像) */}
        <g opacity={0.3} transform={`translate(${jit - 16} 4)`}>
          <rect x={-204} y={-364} width={310} height={252} fill="#D8B25A" />
          <rect x={-40} y={-300} width={76} height={140} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g transform={`translate(${jit} 0)`}>
          <rect x={-204} y={-364} width={310} height={252} fill="#E8C66A" />
          <circle cx={-130} cy={-320} r={40} fill={KRP.orange} opacity={0.9} />
          <rect x={-40} y={-300} width={76} height={140} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-40} y={-300} width={76} height={38} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -150 -180 q 30 -20 60 0 M 60 -220 q 24 -16 48 0" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        </g>
        {/* 流れるノイズ帯 2本 */}
        <rect x={-204} y={-364 + ((f * 14) % 252)} width={310} height={10} fill={KRP.white} opacity={0.4} />
        <rect x={-204} y={-364 + ((f * 14 + 126) % 252)} width={310} height={6} fill={KRP.white} opacity={0.25} />
        {/* OSD: 早送り表示 */}
        <g opacity={osd}>
          <path d="M 10 -352 L 34 -338 L 10 -324 Z M 36 -352 L 60 -338 L 36 -324 Z" fill={KRP.white} />
          <text x={68} y={-328} fontFamily={FONT} fontSize={30} fontWeight={700} fill={KRP.white}>×2</text>
        </g>
      </CRTTv>
      {/* ===== 主役: ビデオデッキ (テレビ台の下段・手前に大きく) ===== */}
      <g transform="translate(620 960) scale(1.06)">
        <rect x={-330} y={-96} width={660} height={150} rx={14}
          fill={C.deckSilver} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-330} y={-96} width={660} height={30} rx={14} fill={KRP.white} opacity={0.35} />
        {/* カセット挿入口 + 吸い込まれるテープ */}
        <rect x={-290} y={-58} width={300} height={64} rx={8} fill={C.deckDark} stroke={KRP.ink} strokeWidth={5.5} />
        <g transform={`translate(${-140} ${-26 - (1 - tapeIn) * 150}) rotate(${(1 - tapeIn) * -10})`}>
          <rect x={-120} y={-26} width={240} height={52} rx={6} fill="#2E2E2A" stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-96} y={-14} width={192} height={28} rx={6} fill="#4A4A44" stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={-52} cy={0} r={11} fill={C.deckSilver} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={52} cy={0} r={11} fill={C.deckSilver} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <rect x={-290} y={-96} width={300} height={40} fill={C.deckSilver} />
        <line x1={-290} y1={-58} x2={10} y2={-58} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 窓: 高速回転するリール */}
        <rect x={40} y={-70} width={170} height={84} rx={10} fill="#1E242E" stroke={KRP.ink} strokeWidth={5} />
        {[84, 166].map((cx, i) => (
          <g key={i} transform={`rotate(${f * 40 + i * 30} ${cx} -28)`}>
            <circle cx={cx} cy={-28} r={26} fill="none" stroke={C.deckSilver} strokeWidth={5} />
            <line x1={cx - 26} y1={-28} x2={cx + 26} y2={-28} stroke={C.deckSilver} strokeWidth={4} />
            <line x1={cx} y1={-54} x2={cx} y2={-2} stroke={C.deckSilver} strokeWidth={4} />
          </g>
        ))}
        {/* 早送りボタン (押される) + 回転ダッシュのカウンタ */}
        <g transform={`translate(258 ${-40 + press * 8})`}>
          <rect x={-28} y={-24} width={56} height={44} rx={8}
            fill={press > 0.4 ? KRP.orange : "#8E959C"} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -14 -12 L 0 -2 L -14 8 Z M 2 -12 L 16 -2 L 2 8 Z" fill={KRP.ink} />
        </g>
        <g transform="translate(258 34)">
          <circle cx={0} cy={0} r={16} fill="#1E242E" stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${f * 26})`}>
            <line x1={0} y1={-12} x2={0} y2={-4} stroke={C.crtGlow} strokeWidth={4} strokeLinecap="round" />
          </g>
        </g>
      </g>
      {/* 早送りボタンへ伸びる指 (右から) */}
      <g transform={`translate(${912 - press * 10} ${904 + press * 8}) rotate(-78)`}>
        <path d="M 0 0 Q -10 -14 2 -26 Q 16 -36 28 -24 L 150 96 Q 196 140 230 210 L 120 260 Q 80 170 34 120 Z"
          fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 30 -10 q -16 10 -22 26" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      </g>
      {/* テープの空き箱 (床・左手前) */}
      <g transform="translate(180 1010) rotate(8)">
        <rect x={-130} y={-34} width={260} height={68} rx={8} fill="#8A3A40" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-108} y={-20} width={150} height={40} rx={5} fill={C.news} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -96 -6 h 80 M -96 8 h 56" stroke={C.newsLine} strokeWidth={3.5} />
      </g>
      {/* テレビの淡い光が床へ */}
      <ellipse cx={620} cy={880} rx={430} ry={60} fill={C.crtGlow} opacity={0.1} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #204 1990年には、コマーシャルを自動で飛ばして録画するビデオデッキまで、発売されました。
// 格: 並 / seed 1332
// 絵: 1990年のデッキ。取扱説明書に「CMを自動でとばします」の一行。年号札1990
// どこ: 明るい電器店の売り場 (203の夜の居間から昼の店頭へ転換)
// 演出: 棚上の新型デッキにスポット。手前に開いた取扱説明書 その一行に赤線が走る
// 動き: 赤アンダーラインが伸びる / 赤ランプ点滅 / きらめき / 年号札1990
const Sg204: React.FC<{ f: number }> = ({ f }) => {
  const under = easeOut(seg(f, 16, 30));  // 赤アンダーライン
  const lamp = f % 16 < 9;                // 自動ランプ点滅
  const spark = pop(seg(f % 28, 0, 6)) * (1 - seg(f % 28, 18, 27));
  const squig = (x: number, y: number, w: number, o = 0.5) => (
    <path d={`M ${x} ${y} q ${w * 0.12} -4 ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0 t ${w * 0.25} 0`}
      fill="none" stroke={C.newsLine} strokeWidth={3.5} opacity={o} strokeLinecap="round" />
  );
  return (
    <Frame f={f} seed={1332}>
      {/* 店内の壁と棚 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#F4EBD6" />
      <rect x={-20} y={-20} width={W + 40} height={120} fill="#D8CBA6" />
      <line x1={-20} y1={100} x2={W + 20} y2={100} stroke={KRP.ink} strokeWidth={6} opacity={0.7} />
      {/* 三角の飾り旗 */}
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform={`translate(${60 + i * 200} ${108 + Math.sin(i * 1.7) * 10})`}>
          <path d={`M -34 0 L 34 0 L 0 ${72 + Math.sin(f / 10 + i) * 5} Z`}
            fill={i % 3 === 0 ? KRP.red : i % 3 === 1 ? KRP.yellow : KRP.blueDeep}
            stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        </g>
      ))}
      <path d="M 26 108 Q 960 60 1894 108" fill="none" stroke={KRP.ink} strokeWidth={5} />
      {/* 陳列棚 */}
      <rect x={120} y={470} width={1680} height={34} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6.5} />
      <rect x={200} y={504} width={36} height={140} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={1690} y={504} width={36} height={140} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 棚上の脇役: 旧型デッキとテープの山 (左) ラジカセ (右) */}
      <g transform="translate(430 468)" opacity={0.85}>
        <rect x={-180} y={-86} width={360} height={86} rx={10} fill="#9AA0A8" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-150} y={-62} width={150} height={40} rx={6} fill={C.deckDark} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={120} cy={-44} r={18} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <g transform="translate(1520 468)" opacity={0.85}>
        <rect x={-150} y={-110} width={300} height={110} rx={12} fill="#8E959C" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-80} cy={-54} r={34} fill={C.deckDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={80} cy={-54} r={34} fill={C.deckDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-150} y1={-98} x2={-210} y2={-180} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* ===== 主役その1: 新型デッキ (棚の中央・スポットライト) ===== */}
      <path d="M 960 -20 L 700 470 L 1220 470 Z" fill={C.lampWarm} opacity={0.3} />
      <g transform="translate(960 468) scale(1.12)">
        <ellipse cx={0} cy={6} rx={260} ry={18} fill={KRP.ink} opacity={0.12} />
        <rect x={-240} y={-104} width={480} height={104} rx={12}
          fill={C.deckSilver} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-240} y={-104} width={480} height={24} rx={12} fill={KRP.white} opacity={0.4} />
        <rect x={-206} y={-70} width={210} height={44} rx={6} fill={C.deckDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-196} y1={-48} x2={-16} y2={-48} stroke="#6A7078" strokeWidth={4} />
        {/* 自動飛ばしの赤ランプ + ▶▶ ボタン列 */}
        <circle cx={60} cy={-50} r={13} fill={lamp ? KRP.red : "#7A4038"} stroke={KRP.ink} strokeWidth={4} />
        {lamp && <circle cx={60} cy={-50} r={22} fill="none" stroke={KRP.red} strokeWidth={3} opacity={0.5} />}
        <rect x={96} y={-66} width={54} height={36} rx={7} fill="#8E959C" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 108 -56 L 120 -48 L 108 -40 Z M 122 -56 L 134 -48 L 122 -40 Z" fill={KRP.ink} />
        <rect x={162} y={-66} width={54} height={36} rx={7} fill="#8E959C" stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={189} cy={-48} r={8} fill="none" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* きらめき */}
      <g opacity={spark}>
        {[[760, 330], [1180, 300], [980, 250]].map(([sx, sy], i) => (
          <g key={i} transform={`translate(${sx} ${sy}) scale(${0.7 + i * 0.25})`}>
            <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
      </g>
      {/* ===== 主役その2: 開いた取扱説明書 (手前いっぱい) ===== */}
      <g transform="translate(960 870) rotate(-1)">
        <ellipse cx={0} cy={120} rx={760} ry={60} fill={KRP.ink} opacity={0.1} />
        {/* 左右のページ */}
        <path d="M 0 -210 Q -380 -260 -700 -200 L -700 150 Q -380 200 0 160 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 0 -210 Q 380 -260 700 -200 L 700 150 Q 380 200 0 160 Z"
          fill="#FDFBF2" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 0 -210 L 0 160" stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
        {/* 左ページ: デッキの線画図 */}
        <g transform="translate(-370 -60) rotate(2)" opacity={0.85}>
          <rect x={-200} y={-60} width={400} height={86} rx={10} fill="none" stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-170} y={-36} width={160} height={38} rx={5} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={60} cy={-18} r={10} fill="none" stroke={KRP.red} strokeWidth={4} />
          <path d="M 60 -34 L 60 -92 L 150 -108" fill="none" stroke={KRP.red} strokeWidth={3.5} />
          <rect x={110} y={-40} width={40} height={26} rx={5} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
          {squig(-190, 66, 320, 0.6)}
          {squig(-190, 100, 260, 0.45)}
        </g>
        {/* 右ページ: 本文 + 本物の一行 */}
        {squig(100, -160, 480, 0.55)}
        {squig(100, -120, 420, 0.45)}
        <text x={330} y={-30} textAnchor="middle" fontFamily={FONT} fontSize={40}
          fontWeight={700} fill={KRP.ink}>CMを自動でとばします</text>
        {/* 伸びる赤アンダーライン + 赤矢印 */}
        <line x1={100} y1={0} x2={100 + under * 470} y2={-6}
          stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
        {squig(100, 50, 460, 0.45)}
        {squig(100, 90, 380, 0.4)}
      </g>
      <Arrow x={1690} y={790} s={1.1} rot={160} t={seg(f, 28, 38)} />
      {/* 年号札 */}
      <TagPlate x={300} y={246} text="1990" size={48} t={seg(f, 2, 12)}
        color={KRP.ink} fill={KRP.yellow} rot={-4} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #205 飛ばしたい。お客は昔から、ずっと飛ばしたかったのです。
// 格: 山 / seed 1333
// 絵: 軸。年表の上に歴代の「飛ばし道具」が整列: リモコン→録画機→自動スキップ→倍速ボタン。全部から同じ向きの矢印が伸びる
// どこ: 博物館風の展示壁。棚に歴代の「飛ばし道具」 下に絵巻年表が開く
// 演出: 軸の一枚。道具4つが順に登場し 全部から同じ向きの赤矢印。足元で絵巻が開く
// 動き: 道具ポン×4 / 矢印ポン×4 / 絵巻 openT / 下げ札ゆれ / スポット明滅
const Sg205: React.FC<{ f: number }> = ({ f }) => {
  const ts = [seg(f, 4, 12), seg(f, 11, 19), seg(f, 18, 26), seg(f, 25, 33)];
  const xs = [440, 820, 1200, 1580];
  const labels = ["リモコン", "録画機", "自動スキップ", "倍速ボタン"];
  const lampOn = f % 18 < 12;
  return (
    <Frame f={f} seed={1333}>
      {/* 板張りの展示壁 */}
      <rect x={-20} y={-20} width={W + 40} height={540} fill="#C9A96E" />
      <g stroke="#A6854E" strokeWidth={4} opacity={0.6}>
        {[220, 460, 700, 940, 1180, 1420, 1660].map((x) => (
          <line key={x} x1={x} y1={-20} x2={x} y2={520} />
        ))}
        <line x1={-20} y1={110} x2={W + 20} y2={110} />
      </g>
      <line x1={-20} y1={520} x2={W + 20} y2={520} stroke={KRP.ink} strokeWidth={7} />
      {/* 床板 */}
      <rect x={-20} y={520} width={W + 40} height={580} fill="#8A6B44" />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[640, 760, 880, 1000].map((y) => <line key={y} x1={-20} y1={y} x2={W + 20} y2={y} />)}
      </g>
      {/* スポットライト 4本 */}
      {xs.map((x, i) => (
        <path key={i} d={`M ${x} -20 L ${x - 130} 430 L ${x + 130} 430 Z`}
          fill={C.lampWarm} opacity={ts[i] > 0 ? 0.22 : 0.08} />
      ))}
      {/* 陳列棚 */}
      <rect x={200} y={430} width={1560} height={34} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6.5} />
      {xs.map((x) => (
        <path key={x} d={`M ${x - 60} 464 L ${x + 60} 464 L ${x + 44} 512 L ${x - 44} 512 Z`}
          fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* ===== 道具1: リモコン ===== */}
      <g transform={`translate(440 324) scale(${pop(ts[0])})`} opacity={ts[0] > 0 ? 1 : 0}>
        <RemoteCtl x={0} y={0} s={0.8} rot={0} />
      </g>
      {/* ===== 道具2: 録画機 ===== */}
      <g transform={`translate(820 386) scale(${pop(ts[1])})`} opacity={ts[1] > 0 ? 1 : 0}>
        <rect x={-140} y={-42} width={280} height={86} rx={10} fill={C.deckSilver} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-116} y={-20} width={130} height={36} rx={5} fill={C.deckDark} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={66} cy={-2} r={14} fill="#E8E0CE" stroke={KRP.ink} strokeWidth={4} />
        <rect x={96} y={-14} width={30} height={24} rx={5} fill="#8E959C" stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* ===== 道具3: 自動スキップ機 (赤ランプ) ===== */}
      <g transform={`translate(1200 386) scale(${pop(ts[2])})`} opacity={ts[2] > 0 ? 1 : 0}>
        <rect x={-140} y={-42} width={280} height={86} rx={10} fill="#B8BEC6" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-116} y={-20} width={110} height={36} rx={5} fill={C.deckDark} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={40} cy={-2} r={11} fill={lampOn ? KRP.red : "#7A4038"} stroke={KRP.ink} strokeWidth={4} />
        {lampOn && ts[2] > 0.8 && (
          <circle cx={40} cy={-2} r={19} fill="none" stroke={KRP.red} strokeWidth={3} opacity={0.5} />
        )}
        <path d="M 78 -10 L 92 -2 L 78 6 Z M 94 -10 L 108 -2 L 94 6 Z" fill={KRP.ink} />
      </g>
      {/* ===== 道具4: 倍速ボタン ===== */}
      <g transform={`translate(1580 358) scale(${pop(ts[3])})`} opacity={ts[3] > 0 ? 1 : 0}>
        <circle cx={0} cy={0} r={72} fill={SGP.phoneBlue} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={0} cy={0} r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -26 -20 L 2 0 L -26 20 Z M 6 -20 L 34 0 L 6 20 Z" fill={KRP.ink} />
        <rect x={-14} y={54} width={28} height={16} fill={SGP.phoneBlue} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 全部から同じ向きの赤矢印 */}
      <Arrow x={530} y={150} s={1.15} rot={0} t={seg(f, 10, 17)} />
      <Arrow x={910} y={150} s={1.15} rot={0} t={seg(f, 17, 24)} />
      <Arrow x={1290} y={150} s={1.15} rot={0} t={seg(f, 24, 31)} />
      <Arrow x={1670} y={150} s={1.15} rot={0} t={seg(f, 31, 38)} />
      {/* 下げ札 */}
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={512} x2={x} y2={524} stroke={KRP.ink} strokeWidth={4} />
          <TagPlate x={x} y={542} text={labels[i]} size={28} t={ts[i]} />
        </g>
      ))}
      {/* ===== 足元: 絵巻年表が開く ===== */}
      <ellipse cx={960} cy={846} rx={640} ry={38} fill={KRP.ink} opacity={0.14} />
      <NenpyoEmaki f={f} x={960} y={712} s={0.7} openT={seg(f, 0, 22)} highlight="long" />
      {/* 見物の二人 (左右の隅) */}
      <PersonMini x={116} y={1040} s={1.5} color={KRP.blueDeep} f={f} phase={0} face="dot" arms="down" />
      <PersonMini x={1806} y={1040} s={1.5} color={KRP.green} f={f} phase={3} face="smile" arms="up" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #206 そして2010年代。技術がついに、作品の内部へ手を伸ばします。
// 格: 並 / seed 1334
// 絵: スマホの画面へカメラがズームイン。画面の「中」の再生バーに手が届く演出
// どこ: 2010年代の夜のソファ。両手のスマホへカメラがぐっと寄る
// 演出: 画面の「中」の再生バーに外から来た指が触れる。作品の内部へ手が届いた瞬間
// 動き: 全体ズームイン / つまみが進む / 指先から波紋 / 集中線が濃くなる
const Sg206: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 40)) * 1.1;        // ズーム
  const zt = (z - 1) / 1.1;
  const prog = 0.3 + easeOut(seg(f, 10, 38)) * 0.34; // つまみ位置
  const knobX = -340 + prog * 680;                   // 画面ローカル
  const rip = (f % 22) / 22;                         // 波紋
  return (
    <Frame f={f} seed={1334} bg="#1E2430" dark>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#1E2430" />
      <g transform={zoomAt(z, 960, 640)}>
        {/* 夜の部屋: 奥の窓と街の灯 */}
        <g opacity={0.8}>
          <rect x={210} y={60} width={340} height={300} fill="#141A26" stroke={KRP.ink} strokeWidth={7} />
          <line x1={380} y1={60} x2={380} y2={360} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={250 + (i % 3) * 90} y={200 + Math.floor(i / 3) * 70}
              width={26} height={18} fill={C.lampWarm} opacity={0.3 + rnd(9, i) * 0.5} />
          ))}
        </g>
        {/* 脇のテーブルとマグ */}
        <g transform="translate(1660 760)" opacity={0.9}>
          <rect x={-150} y={0} width={300} height={26} rx={8} fill="#3A3428" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-110} y={26} width={22} height={210} fill="#3A3428" stroke={KRP.ink} strokeWidth={5} />
          <rect x={88} y={26} width={22} height={210} fill="#3A3428" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 -62 L -32 0 L 28 0 L 36 -62 Z" fill="#5B6B86" stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M 34 -48 q 30 4 2 34" fill="none" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ソファの背もたれ (手前下) */}
        <path d="M -20 1010 Q 480 930 960 980 Q 1440 1030 1940 960 L 1940 1100 L -20 1100 Z"
          fill="#463A4A" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 300 990 q 60 -16 120 0 M 1300 1000 q 60 -16 120 0"
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        {/* ===== 両手とスマホ (横持ち) ===== */}
        <g transform="translate(960 600)">
          {/* 左右の手 (下から支える) */}
          <path d="M -470 60 Q -560 40 -580 140 Q -590 240 -470 250 L -330 230 Q -400 170 -390 80 Z"
            fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 470 60 Q 560 40 580 140 Q 590 240 470 250 L 330 230 Q 400 170 390 80 Z"
            fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 画面の青いふち光 (手に反射) */}
          <path d="M -470 60 Q -560 40 -580 140" fill="none" stroke={SGP.phoneBlue} strokeWidth={6} opacity={0.6} />
          <path d="M 470 60 Q 560 40 580 140" fill="none" stroke={SGP.phoneBlue} strokeWidth={6} opacity={0.6} />
          {/* 本体 */}
          <rect x={-450} y={-170} width={900} height={400} rx={40}
            fill={C.ink} stroke={KRP.ink} strokeWidth={8} />
          <rect x={-414} y={-140} width={828} height={340} rx={16}
            fill="#2E4A66" stroke={KRP.ink} strokeWidth={5} />
          {/* 画面の中: 動画 (山と夕日) */}
          <g>
            <rect x={-414} y={-140} width={828} height={250} fill="#4A6E96" />
            <circle cx={200} cy={-30} r={56} fill={KRP.orange} opacity={0.9} />
            <path d="M -414 110 L -220 -60 L -60 60 L 120 -40 L 414 110 Z"
              fill="#2E4258" stroke={KRP.ink} strokeWidth={4} />
            <path d="M -300 -96 q 36 -14 72 0 M 60 -110 q 30 -12 60 0"
              fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.5} />
            {/* 隅のおぼろげな早送り印 */}
            <g opacity={0.55}>
              <path d="M 310 -112 L 334 -98 L 310 -84 Z M 338 -112 L 362 -98 L 338 -84 Z" fill={KRP.white} />
            </g>
          </g>
          {/* 画面の中の再生バー */}
          <g>
            <line x1={-340} y1={150} x2={340} y2={150} stroke="#1A2838" strokeWidth={14} strokeLinecap="round" />
            <line x1={-340} y1={150} x2={knobX} y2={150} stroke={SGP.phoneBlue} strokeWidth={14} strokeLinecap="round" />
            <circle cx={knobX} cy={150} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {/* 指先の波紋 (作品の内部に触れた) */}
            <circle cx={knobX} cy={150} r={26 + rip * 60} fill="none"
              stroke={SGP.phoneBlue} strokeWidth={5} opacity={0.8 * (1 - rip)} />
            <circle cx={knobX} cy={150} r={26 + ((rip + 0.5) % 1) * 60} fill="none"
              stroke={KRP.white} strokeWidth={3.5} opacity={0.5 * (1 - (rip + 0.5) % 1)} />
          </g>
          {/* 外から画面の中へ降りてくる指 */}
          <g transform={`translate(${knobX} 136) rotate(-24)`}>
            <path d="M 0 0 Q -14 -12 -4 -28 Q 8 -42 24 -30 L 120 60 Q 170 110 196 180 L 90 230 Q 60 150 20 100 Z"
              fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 26 -14 q -14 10 -18 26" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
            {/* 指のふち光 */}
            <path d="M 0 0 Q -14 -12 -4 -28" fill="none" stroke={SGP.phoneBlue} strokeWidth={4} opacity={0.7} />
          </g>
        </g>
      </g>
      {/* 集中線 (ズームに合わせて濃く) */}
      <g stroke={KRP.white} strokeLinecap="round" opacity={0.12 + zt * 0.3}>
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.2;
          const r0 = 760 + rnd(5, i) * 140;
          const r1 = r0 - 90 - rnd(6, i) * 80;
          return (
            <line key={i}
              x1={960 + Math.cos(a) * r0} y1={640 + Math.sin(a) * r0 * 0.62}
              x2={960 + Math.cos(a) * r1} y2={640 + Math.sin(a) * r1 * 0.62}
              strokeWidth={5 + rnd(7, i) * 4} />
          );
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_195: (f) => <Sg195 f={f} />,
  sg_196: (f) => <Sg196 f={f} />,
  sg_197: (f) => <Sg197 f={f} />,
  sg_198: (f) => <Sg198 f={f} />,
  sg_199: (f) => <Sg199 f={f} />,
  sg_200: (f) => <Sg200 f={f} />,
  sg_201: (f) => <Sg201 f={f} />,
  sg_202: (f) => <Sg202 f={f} />,
  sg_203: (f) => <Sg203 f={f} />,
  sg_204: (f) => <Sg204 f={f} />,
  sg_205: (f) => <Sg205 f={f} />,
  sg_206: (f) => <Sg206 f={f} />,
};

export const S_B10_MOTIFS: string[] = [
  "sg_195", // #195
  "sg_196", // #196
  "sg_197", // #197
  "sg_198", // #198
  "sg_199", // #199
  "sg_200", // #200
  "sg_201", // #201
  "sg_202", // #202
  "sg_203", // #203
  "sg_204", // #204
  "sg_205", // #205
  "sg_206", // #206
];

export const saigoB10Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
