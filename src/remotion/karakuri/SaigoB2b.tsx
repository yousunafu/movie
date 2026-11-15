// 「人類は、昔から飛ばして観ていた」: 文#57〜#64 (8文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1056〜1063。
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
  hallWall: "#E9D9B8",    // 劇場の内壁 (温かい漆喰)
  hallWallDim: "#DCC9A2", // 内壁の影側
  velvet: "#8E2F38",      // ボックス席のビロード
  velvetDark: "#6E2430",  // ボックス席の奥の暗がり
  goldTrim: "#CBA135",    // 金の縁飾り
  night: "#2C3850",       // 書斎の窓の夜空
  glass: "#DCE9F2",       // ガラスの器
  lemon: "#F6E8B2",       // レモンのソルベ
  berry: "#F2B8B0",       // いちごのソルベ
  marble: "#E8E2D4",      // 大理石のテーブル
  marbleVein: "#C9C0AE",  // 大理石の筋
  studyWall: "#E7DAC0",   // 書斎の壁
  wainscot: "#D9C6A0",    // 腰板・板壁
  stagePlank: "#C9A86E",  // 舞台の床板
  boxWallDeco: "#7E2A33", // 舞台奥の幕
  operaCoat: "#3E5E46",   // オペラ歌手の長上着 (人物の cloth と同色)
};
void ChapterDoor; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void Stamp; void XMark; void useCurrentFrame;

// ローカル乱数 (毎フレーム同じ値。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// ===================================================================
// ローカル部品 (この巻のソルベ回りで使い回す)
// ===================================================================

// クープグラスのシャーベット (#58配膳 / #59譜面の挿絵 / #61の大写し / #62の活字挿絵)
const SorbetCup: React.FC<{
  x: number; y: number; s?: number; f?: number; i?: number; spoon?: boolean;
}> = ({ x, y, s = 1, f = 0, i = 0, spoon }) => {
  const sh = Math.sin(f / 9 + i * 1.3) * 1.5; // 山の照りのゆれ
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={34} ry={8} fill={C.glass} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-6} y={-36} width={12} height={34} fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -52 -74 Q -46 -36 0 -36 Q 46 -36 52 -74 Z"
        fill={C.glass} stroke={KRP.ink} strokeWidth={4.5} />
      {/* ソルベの山 (レモン) + いちごのひと玉 */}
      <path d={`M -44 -74 Q -30 ${-102 + sh} 0 -100 Q 34 ${-102 + sh} 44 -74 Z`}
        fill={C.lemon} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={8} cy={-104} r={13} fill={C.berry} stroke={KRP.ink} strokeWidth={4} />
      {/* 溶けて垂れるひとすじ */}
      <path d={`M -40 -70 q -5 ${12 + sh * 2} 1 ${22 + sh * 2}`}
        fill="none" stroke={C.lemon} strokeWidth={5} strokeLinecap="round" />
      <path d="M -32 -90 q 9 -7 20 -8" fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={0.9} />
      {spoon && (
        <g transform="rotate(36 30 -92)">
          <line x1={30} y1={-92} x2={30} y2={-152} stroke={KRP.silver} strokeWidth={6} />
          <ellipse cx={30} cy={-161} rx={10} ry={13} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
    </g>
  );
};

// 漂う音符 (歌声)
const NoteF: React.FC<{ x: number; y: number; f: number; i: number; s?: number; o?: number }> =
  ({ x, y, f, i, s = 1, o = 1 }) => (
    <g transform={`translate(${x} ${y + Math.sin(f / 8 + i * 1.4) * 7}) scale(${s})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={11} ry={8} fill={KRP.ink} transform="rotate(-18)" />
      <path d="M 9 -3 L 9 -38 Q 20 -36 25 -27" fill="none"
        stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    </g>
  );

// スプーン乾杯の「カチン」の光
const ClinkStar: React.FC<{ x: number; y: number; f: number; t: number }> = ({ x, y, f, t }) => {
  const p = pop(clamp01(t)) * (1 + Math.sin(f / 5) * 0.08);
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <polygon points="0,-26 7,-7 26,0 7,7 0,26 -7,7 -26,0 -7,-7"
        fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <circle cx={0} cy={0} r={4} fill={KRP.white} stroke="none" />
    </g>
  );
};

// 蝋燭の炎 (客席の明かり用)
const CandleFlame: React.FC<{ x: number; y: number; f: number; i: number; s?: number }> =
  ({ x, y, f, i, s = 1 }) => {
    const fl = Math.sin(f / 5 + i * 1.9) * 2.5;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle cx={0} cy={-10} r={22} fill={SGP.lampGold} opacity={0.3} />
        <path d={`M 0 ${2 + fl * 0.4} C -8 ${-8 + fl} -6 -18 0 -24 C 6 -18 8 ${-8 + fl} 0 ${2 + fl * 0.4} Z`}
          fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  };

// ===================================================================
// 演者の扮装キット (舞台の上の人を「演者」に見せるための重ね着)
// ★Person とまったく同じ変換をかけた入れ物。中は「頭の丸 (cx=0 cy=-228 r=64)」基準の
//   人物ローカル座標。f/phase/still/lean は人物と同じ値を渡すこと (座標のごまかし禁止)
// -------------------------------------------------------------------
const AtamaNo: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; children?: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// PersonMini とまったく同じ変換の入れ物 (遠景の演者用。lean は無い)
const MiniNo: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; children?: React.ReactNode;
}> = ({ x, y, s = 1, f = 0, phase = 0, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s})`}>{children}</g>;
};

// 18〜19世紀オペラ歌手の扮装 (丈の長い上着+膝丈ズボン+白い靴下+襟袖のフリル+白い鬘)。
// Person の上に重ねる。pose="raise" (右腕を高く) の人物に合わせてある
const OperaIsho: React.FC<{ f: number; coat?: string; cuff?: 1 | -1 }> =
  ({ f, coat = C.operaCoat, cuff = 1 }) => {
    const fr = Math.sin(f / 9) * 1.6;      // フリルのそよぎ
    const lit = 0.17 + 0.06 * Math.sin(f / 5); // 蝋燭が下から顔を照らす明かりのゆらぎ
    // 白いフリル (3山の帯)。w=半幅 / h=高さ
    const Frill = (cx: number, cy: number, w: number, h: number, rot = 0) => (
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
        <path
          d={`M ${-w} 0 Q ${-w * 0.5} ${h + fr} 0 0 Q ${w * 0.5} ${h - fr} ${w} 0
              L ${w * 0.8} ${-h * 0.5} L ${-w * 0.8} ${-h * 0.5} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
    );
    return (
      <g>
        {/* 白い靴下 (膝下。膝丈ズボンの下から出る) */}
        <rect x={-31} y={-40} width={26} height={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={5} y={-40} width={26} height={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 靴の留め金 */}
        <rect x={-25} y={-14} width={14} height={9} rx={2} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={3} />
        <rect x={11} y={-14} width={14} height={9} rx={2} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={3} />
        {/* 丈の長い上着 (裾が広がる) */}
        <path d="M -60 -164 L 60 -164 L 68 -102 Q 88 -72 92 -42 L -92 -42 Q -88 -72 -68 -102 Z"
          fill={coat} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 裾の金の縁取りと脇の切れ込み */}
        <path d="M -88 -48 Q 0 -58 88 -48" fill="none" stroke={C.goldTrim} strokeWidth={6} />
        <path d="M -52 -44 Q -46 -86 -34 -120 M 52 -44 Q 46 -86 34 -120"
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
        {/* 前合わせと金ボタン */}
        <line x1={0} y1={-162} x2={0} y2={-46} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {[-146, -122, -98, -74].map((by) => (
          <circle key={by} cx={0} cy={by} r={7} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* 襟のフリル (ジャボ) */}
        {Frill(0, -158, 36, 22)}
        {Frill(0, -140, 30, 20)}
        {/* 袖口のフリル (下がった腕) */}
        {Frill(-67, -72, 23, 16, 8)}
        <circle cx={-67} cy={-56} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 白い鬘 (巻き毛を横に2段) */}
        <path d="M -70 -234 Q -78 -306 0 -308 Q 78 -306 70 -234 Q 36 -252 0 -252 Q -36 -252 -70 -234 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {([-1, 1] as const).map((sd) => (
          <g key={sd}>
            <circle cx={sd * 80} cy={-236} r={23} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={sd * 86} cy={-198} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <path d={`M ${sd * 72} -236 q ${sd * 14} 6 ${sd * 6} 14`}
              fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          </g>
        ))}
        <path d="M -40 -292 Q 0 -302 40 -292" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
        {/* 高く差し出した腕 (pose="raise" の armRect(1,180) に重なる袖)。
            鬘の巻き毛より後に描いて、腕が顔の手前に出るようにする */}
        <g>
          <rect x={cuff === 1 ? 53 : -79} y={-234} width={26} height={90} rx={9}
            fill={coat} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${cuff * 56} -210 Q ${cuff * 66} -186 ${cuff * 76} -210`}
            fill="none" stroke={C.goldTrim} strokeWidth={4} opacity={0.8} />
          {Frill(66 * cuff, -232, 22, 15, 180)}
          <circle cx={66 * cuff} cy={-254} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 脚光で下から照らされた顔 */}
        <ellipse cx={0} cy={-192} rx={48} ry={26} fill={SGP.lampGold} opacity={lit} />
        {/* 丸く開いた口 (歌っている) */}
        <ellipse cx={0} cy={-180} rx={20} ry={23} fill={KRP.ink} />
        <path d="M -15 -196 Q 0 -202 15 -196" fill="none" stroke={KRP.white} strokeWidth={5} />
        <ellipse cx={0} cy={-168} rx={11} ry={7} fill="#E06A5A" />
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #57 当時の作曲家が「聴かれないこと」を前提に書いた曲があります。何のための曲でしょうか。
// 格: 並 / seed 1056
// 絵: 作曲家の机。譜面に「聴かれない前提」の荷札。本人は悟りの顔
// どこ: 夜の書斎。窓の外は月。机に譜面・インク壺・羽根ペン・蝋燭
// 演出: 譜面の角に結んだ荷札「聴かれない前提」が主役。作曲家は目を細めて微笑む悟りの顔
// 動き: ズーム寄り・荷札の揺れ・炎のゆらぎ・星の明滅・メトロノームの振り子・？のポップ
const Sg057: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.05;
  const sway = Math.sin(f / 9) * 4;
  const pend = Math.sin(f / 8) * 24;
  return (
    <Frame f={f} seed={1056}>
      <g transform={zoomAt(z, 860, 560)}>
        {/* 壁と腰板 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.studyWall} />
        <rect x={-20} y={560} width={W + 40} height={540} fill={C.wainscot} />
        <line x1={-20} y1={560} x2={W + 20} y2={560} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        {[260, 640, 1020, 1400, 1780].map((px) => (
          <rect key={px} x={px} y={590} width={240} height={160} rx={8}
            fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
        ))}
        {/* 窓 (夜。月が出ている) */}
        <g>
          <rect x={120} y={90} width={440} height={430} fill={C.night} stroke={KRP.ink} strokeWidth={9} />
          <line x1={340} y1={90} x2={340} y2={520} stroke={KRP.ink} strokeWidth={6} />
          <line x1={120} y1={305} x2={560} y2={305} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={250} cy={200} r={44} fill="#F3EAC6" stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={236} cy={188} r={9} fill="#DCCFA3" />
          <circle cx={264} cy={214} r={6} fill="#DCCFA3" />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={140 + rnd(1, i) * 400} cy={110 + rnd(2, i) * 380}
              r={1.8 + rnd(3, i) * 2} fill={KRP.white}
              opacity={0.3 + 0.55 * Math.abs(Math.sin(f / 11 + i * 1.7))} />
          ))}
          {/* カーテン (右半分に寄せてある) */}
          <path d="M 470 86 Q 500 300 462 524 Q 530 538 572 520 Q 594 300 560 86 Z"
            fill={C.velvet} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 505 100 Q 516 300 498 512 M 540 100 Q 554 300 536 510"
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        </g>
        {/* 壁の額 (小さな風景画) */}
        <g>
          <rect x={690} y={140} width={230} height={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <rect x={706} y={156} width={198} height={138} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M 716 268 Q 770 212 820 250 Q 862 216 896 258" fill="none" stroke={KRP.green} strokeWidth={6} />
          <circle cx={866} cy={186} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 右の棚 (本とメトロノーム) */}
        <g>
          <rect x={1500} y={216} width={400} height={20} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={1520 + i * 44} y={126 + rnd(4, i) * 16} width={36}
              height={90 - rnd(4, i) * 16}
              fill={[KRP.blueDeep, KRP.green, C.velvet, KRP.orange, KRP.grayDark][i]}
              stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* メトロノーム (振り子が揺れる) */}
          <g transform="translate(1810 216)">
            <path d="M -36 0 L -20 -104 L 20 -104 L 36 0 Z" fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={-16} x2={pend * 0.5} y2={-92} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={pend * 0.35} cy={-66} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* ？ (問いかけ) */}
        <QMark x={1700} y={430} s={1.15} f={f} t={seg(f, 28, 40)} />
        {/* 作曲家 (机の向こう。悟りの顔で目を細める) */}
        <Person x={1230} y={930} s={1.9} cloth="#4A3C5E" clothDark="#372C47"
          face="smile" gaze={[-5, 7]} f={f} hair="cap" />
        {/* 机 */}
        <g>
          <rect x={150} y={640} width={1510} height={38} rx={8}
            fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
          <path d="M 240 658 Q 500 652 760 660 M 980 660 Q 1240 654 1480 662"
            fill="none" stroke={SGP.woodDark} strokeWidth={3.5} />
          <rect x={210} y={678} width={1390} height={402} fill={SGP.wood} stroke={KRP.ink} strokeWidth={8} />
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x={330 + i * 640} y={720} width={500} height={120} rx={10}
                fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={580 + i * 640} cy={780} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          ))}
        </g>
        {/* 机上の譜面 (書きかけ) */}
        <g transform="rotate(-3 540 560)">
          <rect x={320} y={440} width={460} height={240} rx={4}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              {[0, 1, 2, 3, 4].map((l) => (
                <line key={l} x1={350} y1={482 + r * 66 + l * 9} x2={750} y2={482 + r * 66 + l * 9}
                  stroke={KRP.ink} strokeWidth={2} opacity={0.65} />
              ))}
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <g key={n}>
                  <ellipse cx={380 + n * 64 + rnd(5, r * 7 + n) * 20} cy={485 + r * 66 + rnd(6, r * 7 + n) * 30}
                    rx={6.5} ry={5} fill={KRP.ink} />
                  <line x1={386 + n * 64 + rnd(5, r * 7 + n) * 20} y1={485 + r * 66 + rnd(6, r * 7 + n) * 30}
                    x2={386 + n * 64 + rnd(5, r * 7 + n) * 20} y2={462 + r * 66 + rnd(6, r * 7 + n) * 30}
                    stroke={KRP.ink} strokeWidth={2.5} />
                </g>
              ))}
            </g>
          ))}
        </g>
        {/* 荷札「聴かれない前提」(譜面の角にひもで結ぶ。ゆらゆら) */}
        <g>
          <path d={`M 770 460 Q 800 ${492 + sway * 0.6} 830 ${524 + sway}`}
            fill="none" stroke={SGP.woodDark} strokeWidth={4} />
          <g transform={`translate(830 ${524 + sway}) rotate(${8 + sway * 0.8})`}>
            <path d="M 0 0 L 34 -32 L 258 -32 L 258 32 L 34 32 Z"
              fill={SGP.paper} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={26} cy={0} r={7} fill={C.studyWall} stroke={KRP.ink} strokeWidth={3.5} />
            <text x={148} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={27} fill={KRP.ink}>聴かれない前提</text>
          </g>
        </g>
        {/* インク壺と羽根ペン (ペン先が小さく揺れる) */}
        <g transform="translate(1030 640)">
          <path d="M -30 0 L -36 -36 L 36 -36 L 30 0 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-18} y={-48} width={36} height={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${-24 + Math.sin(f / 10) * 2} 0 -44)`}>
            <path d="M 0 -44 L 10 -148 Q -4 -186 -22 -196 Q -10 -160 -14 -130 Q -22 -152 -34 -160 Q -20 -130 -12 -96 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        </g>
        {/* 蝋燭 (右) */}
        <g transform="translate(1500 640)">
          <ellipse cx={0} cy={0} rx={44} ry={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-13} y={-86} width={26} height={84} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -13 -86 q 7 10 26 6" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          <CandleFlame x={0} y={-94} f={f} i={0} s={1.3} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #58 答えは、お客がシャーベットを食べる時間のため、です。
// 格: 山 / seed 1057
// 絵: 答えの発表。ボックス席に銀盆のシャーベットが次々配られ、客がスプーンで乾杯。舞台では歌手が朗々 (誰も見ていない)
// どこ: ナポリ風オペラハウスの中。左=舞台で歌手が熱唱、右=ボックス席4つ
// 演出: 給仕が銀盆を運び、滑車の盆が2階席へ上がる。各ボックスでスプーン乾杯のカチン
// 動き: 給仕の入場・盆の上昇・乾杯の星が順にポップ・音符の漂い・炎のゆらぎ・「答え」札
const Sg058: React.FC<{ f: number }> = ({ f }) => {
  const wx = 1500 - easeOut(seg(f, 4, 26)) * 450;       // 給仕の入場
  const trayY = 880 - easeOut(seg(f, 10, 34)) * 440;    // 滑車の盆が2階へ
  return (
    <Frame f={f} seed={1057}>
      {/* 内壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.hallWall} />
      {/* 天井の持ち送りと吊りランタン (客席は明るい) */}
      <rect x={-20} y={-20} width={W + 40} height={120} fill={C.hallWallDim} />
      <line x1={-20} y1={100} x2={W + 20} y2={100} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      {[1000, 1460, 1850].map((lx, i) => (
        <g key={lx}>
          <line x1={lx} y1={0} x2={lx} y2={46} stroke={KRP.ink} strokeWidth={4} />
          <rect x={lx - 20} y={46} width={40} height={44} rx={8}
            fill={C.goldTrim} stroke={KRP.ink} strokeWidth={4.5} />
          <CandleFlame x={lx} y={60} f={f} i={i} s={0.9} />
        </g>
      ))}
      {/* ===== 左 = 舞台 ===== */}
      <g>
        {/* 奥の幕 */}
        <rect x={-20} y={150} width={620} height={550} fill={C.boxWallDeco} stroke={KRP.ink} strokeWidth={6} />
        {[80, 220, 360, 500].map((cx) => (
          <path key={cx} d={`M ${cx} 160 Q ${cx + 10} 420 ${cx - 6} 690`}
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        ))}
        {/* プロセニアムの梁と柱 */}
        <rect x={-20} y={96} width={680} height={56} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 0 124 Q 320 108 640 124" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        <rect x={600} y={96} width={58} height={608} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={6} />
        <line x1={629} y1={110} x2={629} y2={690} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        {/* 歌手 (朗々。誰も見ていない)。上から18世紀オペラ歌手の扮装を重ねる */}
        <Person x={300} y={690} s={1.55} cloth={C.operaCoat} clothDark="#2E4836"
          pose="raise" face="joy" gaze={[4, -6]} f={f} />
        <AtamaNo x={300} y={690} s={1.55} f={f}>
          <OperaIsho f={f} cuff={1} />
        </AtamaNo>
        {/* 歌声の音符 (客席の方へ流れていくが届かない) */}
        {[0, 1, 2, 3].map((i) => {
          const nx = 430 + ((f * 2.6 + i * 140) % 520);
          return <NoteF key={i} x={nx} y={300 - i * 34} f={f} i={i}
            s={1 + i * 0.08} o={0.8 - ((nx - 430) / 520) * 0.5} />;
        })}
        {/* 舞台の台と脚光 */}
        <rect x={-20} y={700} width={680} height={140} fill={C.stagePlank} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 40 740 Q 200 734 360 742 M 420 790 Q 520 784 620 792"
          fill="none" stroke={SGP.woodDark} strokeWidth={3.5} />
        {[90, 230, 370, 510].map((fx, i) => (
          <g key={fx}>
            <path d={`M ${fx - 11} 700 A 11 11 0 0 1 ${fx + 11} 700 Z`}
              fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
            <CandleFlame x={fx} y={688} f={f} i={i + 4} s={0.7} />
          </g>
        ))}
        {/* 脚光が下から立ちのぼる光 (この時代の劇場の決定的な特徴) */}
        {[90, 230, 370, 510].map((fx, i) => (
          <polygon key={`gl${fx}`}
            points={`${fx - 15},686 ${fx + 15},686 ${fx + 74},286 ${fx - 74},286`}
            fill={SGP.lampGold} opacity={0.055 + 0.022 * Math.sin(f / 6 + i * 1.7)} />
        ))}
      </g>
      {/* ===== 右 = ボックス席 (2列×2段) ===== */}
      {([0, 1, 2, 3] as const).map((ph) => {
        const bx = ph % 2 === 0 ? 700 : 1290;
        const by = ph < 2 ? 150 : 560;
        const clinkT = seg(f, 16 + ph * 5, 24 + ph * 5);
        const spoonRot = 14 * pop(clamp01(clinkT));
        const colors = [KRP.blueDeep, "#8E5A9E", KRP.green, KRP.orange];
        return (
          <g key={ph} transform={`translate(${bx} ${by})`}>
            {/* 開口の奥 */}
            <rect width={460} height={300} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={6} />
            <path d="M 30 36 Q 230 18 430 36" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
            {/* 客2人 (舞台を見ずに乾杯) */}
            <PersonMini x={150} y={300} s={0.78} color={colors[ph]} f={f} phase={ph} face="smile" arms="up" />
            <PersonMini x={310} y={300} s={0.78} color={colors[(ph + 2) % 4]} f={f} phase={ph + 3} face="smile" arms="up" />
            {/* スプーン2本が内側へ傾いて乾杯 */}
            <g transform={`rotate(${30 - spoonRot} 180 160)`}>
              <line x1={180} y1={160} x2={214} y2={104} stroke={KRP.silver} strokeWidth={7} strokeLinecap="round" />
              <ellipse cx={218} cy={97} rx={9} ry={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
            <g transform={`rotate(${-30 + spoonRot} 280 160)`}>
              <line x1={280} y1={160} x2={246} y2={104} stroke={KRP.silver} strokeWidth={7} strokeLinecap="round" />
              <ellipse cx={242} cy={97} rx={9} ry={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
            <ClinkStar x={230} y={86} f={f} t={clinkT} />
            {/* ビロードの手すり + ソルベ */}
            <SorbetCup x={398} y={236} s={0.52} f={f} i={ph} />
            <rect y={228} width={460} height={16} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={5} />
            <rect y={244} width={460} height={56} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
            {[60, 160, 260, 360].map((tx) => (
              <circle key={tx} cx={tx} cy={272} r={5} fill={KRP.ink} opacity={0.45} />
            ))}
            {/* 金の額縁 */}
            <rect x={-14} y={-14} width={488} height={328} fill="none" stroke={C.goldTrim} strokeWidth={16} />
            <rect x={-22} y={-22} width={504} height={344} fill="none" stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        );
      })}
      {/* 滑車で2階席へ上がっていく銀盆 */}
      <g>
        <circle cx={1225} cy={116} r={16} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1225} cy={116} r={5} fill={KRP.ink} />
        <line x1={1225} y1={116} x2={1225} y2={trayY - 18} stroke={SGP.woodDark} strokeWidth={4} />
        <g transform={`translate(1225 ${trayY}) rotate(${Math.sin(f / 7) * 2})`}>
          <ellipse cx={0} cy={0} rx={46} ry={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
          <SorbetCup x={0} y={-6} s={0.4} f={f} i={6} />
        </g>
      </g>
      {/* 平土間の床 */}
      <rect x={-20} y={840} width={W + 40} height={260} fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 120 920 Q 500 912 880 922 M 1040 1000 Q 1400 992 1800 1002"
        fill="none" stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.7} />
      {/* 給仕 (銀盆を掲げて入場) */}
      <g>
        <ellipse cx={wx} cy={1052} rx={110} ry={22} fill={KRP.ink} opacity={0.14} />
        <Person x={wx} y={1044} s={1.3} cloth="#5E3A2E" clothDark="#47291F"
          pose="hold" face="smile" gaze={[-6, 0]} f={f} />
        <g transform={`translate(${wx} ${1044 - 168 + Math.sin(f / 13) * 3})`}>
          <ellipse cx={0} cy={0} rx={128} ry={22} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
          <ellipse cx={0} cy={-6} rx={100} ry={14} fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={0.8} />
          <SorbetCup x={-62} y={-8} s={0.5} f={f} i={10} />
          <SorbetCup x={2} y={-12} s={0.55} f={f} i={11} />
          <SorbetCup x={66} y={-8} s={0.5} f={f} i={12} />
        </g>
      </g>
      {/* 答えの札 */}
      <TagPlate x={560} y={56} text="答え" size={40} fill={KRP.yellow} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #59 その名も「アリア・ディ・ソルベット」、シャーベットのアリア。
// 格: 図 / seed 1058
// 絵: 譜面の表紙「ARIA DI SORBETTO」。音符の合間にシャーベットの杯の絵
// どこ: 楽屋裏。赤い幕の下、譜面台に表紙を立てて蝋燭2本で照らす
// 演出: 飾り罫の表紙に大題字。五線の上に音符と並んでソルベの杯が「音符のように」座る
// 動き: 題字の下線が引かれる・音符とソルベが順にポップ・栞リボンの揺れ・炎と光輪の明滅
const Sg059: React.FC<{ f: number }> = ({ f }) => {
  const halo = 0.8 + 0.2 * Math.sin(f / 9);
  return (
    <Frame f={f} seed={1058}>
      {/* 壁と床 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.hallWallDim} />
      <rect x={-20} y={920} width={W + 40} height={180} fill={C.stagePlank} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 200 980 Q 560 972 920 982 M 1100 1030 Q 1420 1024 1760 1032"
        fill="none" stroke={SGP.woodDark} strokeWidth={3.5} opacity={0.7} />
      {/* 上の幕 (スワッグ3つ + 房) */}
      <g>
        <rect x={-20} y={-20} width={W + 40} height={70} fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-20 + i * 660} 48 Q ${310 + i * 660} ${178 + Math.sin(f / 12 + i) * 5} ${640 + i * 660} 48`}
            fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[640, 1300].map((tx, i) => (
          <g key={tx} transform={`translate(${tx} 48) rotate(${Math.sin(f / 10 + i) * 3})`}>
            <line x1={0} y1={0} x2={0} y2={56} stroke={C.goldTrim} strokeWidth={5} />
            <path d="M -12 56 L 12 56 L 8 96 L -8 96 Z" fill={C.goldTrim} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 蝋燭の燭台 (左右) */}
      {[300, 1620].map((cx, i) => (
        <g key={cx} transform={`translate(${cx} 940)`}>
          <circle cx={0} cy={-392} r={90 * halo} fill={SGP.lampGold} opacity={0.22} />
          <ellipse cx={0} cy={0} rx={62} ry={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-10} y={-260} width={20} height={248} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-262} rx={34} ry={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-12} y={-356} width={24} height={94} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <CandleFlame x={0} y={-364} f={f} i={i} s={1.4} />
        </g>
      ))}
      {/* 譜面台 */}
      <g>
        <path d="M 960 1000 L 870 1070 M 960 1000 L 1050 1070 M 960 1000 L 960 1074"
          stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" fill="none" />
        <rect x={946} y={760} width={28} height={250} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      {/* 表紙 */}
      <g transform={`rotate(${-1.5 + Math.sin(f / 16) * 0.4} 960 460)`}>
        <rect x={490} y={150} width={940} height={624} rx={6}
          fill={SGP.paper} stroke={KRP.ink} strokeWidth={8} />
        <rect x={518} y={178} width={884} height={568} rx={4}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.8} />
        {/* 四隅の渦飾り */}
        {([[552, 214, 1], [1368, 214, -1], [552, 712, 1], [1368, 712, -1]] as const).map(([sx, sy, d], i) => (
          <path key={i} d={`M ${sx} ${sy} q ${22 * d} -4 ${26 * d} 16 q 3 14 ${-12 * d} 14 q ${-10 * d} -1 ${-8 * d} -11`}
            fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
        ))}
        {/* 題字 */}
        <text x={960} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={72} fill={KRP.ink} letterSpacing={4}>ARIA</text>
        <text x={960} y={392} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={60} fill={KRP.ink} letterSpacing={6}>DI SORBETTO</text>
        <line x1={960 - 330 * seg(f, 6, 20)} y1={424} x2={960 + 330 * seg(f, 6, 20)} y2={424}
          stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={960} cy={444} r={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} opacity={pop(seg(f, 20, 28))} />
        {/* 五線とト音記号 */}
        {[0, 1, 2, 3, 4].map((l) => (
          <line key={l} x1={580} y1={498 + l * 22} x2={1340} y2={498 + l * 22}
            stroke={KRP.ink} strokeWidth={2.5} opacity={0.75} />
        ))}
        <path d="M 622 606 Q 592 594 600 566 Q 608 540 630 548 Q 650 556 642 580 Q 634 606 616 620 M 626 486 Q 610 540 622 612"
          fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        {/* 音符とソルベ杯が交互に並ぶ */}
        {[0, 1, 2, 3, 4].map((i) => {
          const nx = 700 + i * 136;
          const ny = i % 2 === 0 ? 520 : 556;
          const p = pop(seg(f, 8 + i * 3, 14 + i * 3));
          return (
            <g key={i} transform={`translate(${nx} ${ny}) scale(${p})`}>
              <ellipse cx={0} cy={0} rx={10} ry={7.5} fill={KRP.ink} transform="rotate(-18)" />
              <line x1={9} y1={-2} x2={9} y2={-42} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })}
        {[0, 1, 2].map((i) => {
          const sx = 768 + i * 272;
          const p = pop(seg(f, 18 + i * 5, 26 + i * 5));
          return (
            <g key={i} transform={`translate(${sx} 586) scale(${p})`}>
              <SorbetCup x={0} y={0} s={0.42} f={f} i={i + 3} />
            </g>
          );
        })}
        {/* 下の飾り (作曲家の署名風の走り書き) */}
        <path d={`M 700 690 q 60 ${-22 + Math.sin(f / 14) * 2} 110 0 q 50 20 104 -4 q 60 -24 120 2 q 50 20 106 -6`}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} strokeLinecap="round" />
      </g>
      {/* 栞リボン (表紙の下から垂れて揺れる) */}
      <g transform={`rotate(${Math.sin(f / 9) * 3} 1260 770)`}>
        <path d="M 1248 770 L 1272 770 L 1270 876 L 1260 856 L 1250 876 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* 漂う音符 (紙の外にも少し) */}
      <NoteF x={420} y={300} f={f} i={5} s={0.9} o={0.5} />
      <NoteF x={1530} y={620} f={f} i={6} s={0.8} o={0.45} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #60 物語に関係のない場面に、当たりさわりのない歌を一曲はさむ。
// 格: 図 / seed 1059
// 絵: オペラの進行表。本編カードの列に「休憩用の歌」カードがすっと差し込まれる
// どこ: 楽屋裏の板壁。木枠の進行表ボードに紙カードが紐で吊るされている
// 演出: 「合唱」「フィナーレ」が右へずれて席を空け、黄色いカードが上からすっと降りて収まる
// 動き: カードのスライド・新カードの落下と着地・矢印・係の指差し・カードの微スイング
const Sg060: React.FC<{ f: number }> = ({ f }) => {
  const shiftT = easeOut(seg(f, 8, 20));
  const dropT = easeOut(seg(f, 18, 32));
  const dy = lerp(-260, 545, dropT);
  const cards: { tx: string; x: number; yellow?: boolean }[] = [
    { tx: "序曲", x: 440 },
    { tx: "アリア", x: 740 },
    { tx: "合唱", x: 1040 + 300 * shiftT },
    { tx: "フィナーレ", x: 1340 + 300 * shiftT },
  ];
  const card = (tx: string, cx: number, cy: number, yellow: boolean, sway: number, strT = 1) => (
    <g transform={`translate(${cx} ${cy}) rotate(${sway})`}>
      {[-60, 60].map((sx) => (
        <line key={sx} x1={sx} y1={-75} x2={sx * 0.2} y2={-130}
          stroke={SGP.woodDark} strokeWidth={4} opacity={strT} />
      ))}
      <rect x={-124} y={-69} width={248} height={138} rx={8}
        fill={KRP.ink} opacity={0.12} transform="translate(7 8)" />
      <rect x={-124} y={-75} width={248} height={150} rx={8}
        fill={yellow ? KRP.yellow : KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-100} y1={-46} x2={100} y2={-46} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={40} fill={KRP.ink}>{tx}</text>
    </g>
  );
  return (
    <Frame f={f} seed={1059}>
      {/* 板壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wainscot} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={i} x1={i * 240 - 10} y1={-20} x2={i * 240 - 10} y2={1100}
          stroke={KRP.ink} strokeWidth={3} opacity={0.22} />
      ))}
      <path d="M 300 160 q 14 10 30 2 M 1560 120 q 12 12 28 4"
        fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      {/* 床 */}
      <rect x={-20} y={880} width={W + 40} height={220} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 300 960 Q 700 952 1100 962 M 1300 1020 Q 1560 1014 1860 1022"
        fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      {/* 左の壁の綱とクリート (舞台裏の空気) */}
      <g>
        {[96, 128].map((rx, i) => (
          <path key={rx} d={`M ${rx} -20 Q ${rx + Math.sin(f / 11 + i) * 5} 260 ${rx + 4} 520`}
            fill="none" stroke={SGP.woodDark} strokeWidth={8} strokeLinecap="round" />
        ))}
        <path d="M 84 540 L 148 540 L 136 568 L 96 568 Z" fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 92 556 q 22 26 44 2 q -20 24 -44 6" fill="none" stroke={SGP.woodDark} strokeWidth={5} />
      </g>
      {/* 進行表の木枠ボード */}
      <g>
        <rect x={286} y={296} width={1548} height={498} rx={10}
          fill="#EFE3C4" stroke={KRP.ink} strokeWidth={8} />
        <rect x={286} y={296} width={1548} height={498} rx={10}
          fill="none" stroke={SGP.wood} strokeWidth={22} />
        <rect x={298} y={308} width={1524} height={474} rx={6}
          fill="none" stroke={KRP.ink} strokeWidth={5} />
        {[[320, 330], [1800, 330], [320, 760], [1800, 760]].map(([nx, ny], i) => (
          <circle key={i} cx={nx} cy={ny} r={5} fill={KRP.ink} />
        ))}
        {/* 吊り元の釘列 */}
        {[440, 740, 1040, 1340, 1640].map((nx) => (
          <circle key={nx} cx={nx} cy={415} r={6} fill={KRP.ink} />
        ))}
        {/* 進行の流れを示す点線矢印 (枠内の上) */}
        <g stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="10 10" fill="none" opacity={0.7}>
          <line x1={400} y1={360} x2={1700} y2={360} />
        </g>
        <path d="M 1700 360 L 1676 346 M 1700 360 L 1676 374" fill="none"
          stroke={KRP.grayDark} strokeWidth={4} opacity={0.7} />
      </g>
      <TagPlate x={430} y={240} text="進行表" size={40} t={seg(f, 0, 8)} />
      {/* 本編カード4枚 (後ろ2枚は右へずれて席を空ける) */}
      {cards.map((cd, i) => card(cd.tx, cd.x, 545, false, Math.sin(f / 9 + i * 1.8) * 1.2))}
      {/* 差し込まれる「休憩用の歌」カード */}
      {dropT > 0 &&
        card("休憩用の歌", 1040, dy, true,
          dropT >= 1 ? Math.sin(f / 8) * 1.6 : (1 - dropT) * 6, seg(f, 30, 34))}
      <Arrow x={1040} y={420} rot={90} s={1.1} t={seg(f, 34, 42)} color={KRP.red} />
      {/* 進行係 (指差し確認) */}
      <ellipse cx={170} cy={1016} rx={100} ry={20} fill={KRP.ink} opacity={0.14} />
      <Person x={170} y={1008} s={1.35} cloth="#4A6B78" clothDark="#375260"
        pose="point" pointDir={1} face="smile" gaze={[7, -4]} f={f} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #61 お客はそのあいだ、心おきなくシャーベットを楽しむのです。
// 格: 並 / seed 1060
// 絵: スプーンですくう手元の寄り。溶けかけの一匙。遠くに歌声の音符が漂う
// どこ: ボックス席の手すりぎわ。大きなクープグラスに寄る。左奥に遠い舞台の明かり
// 演出: レースの袖の手がひと匙すくい上げる。匙から雫がぽたり。歌声は遠くの音符だけ
// 動き: 匙の持ち上げ・雫の落下ループ・溶け筋の伸び・音符の漂い・きらめき
const Sg061: React.FC<{ f: number }> = ({ f }) => {
  const lt = easeOut(seg(f, 6, 26));
  const handY = lerp(110, 0, lt);           // 手の群の持ち上げ
  const dripY = (f * 4.2) % 84;             // 匙から落ちる雫
  const melt = seg(f, 0, 42) * 26;          // 溶け筋がじわっと伸びる
  return (
    <Frame f={f} seed={1060}>
      {/* ボックス席の内壁 (縞の壁紙) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#9A6670" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <rect key={i} x={560 + i * 150} y={-20} width={70} height={800}
          fill="#8E5A64" opacity={0.8} />
      ))}
      <line x1={540} y1={120} x2={1940} y2={120} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
      {/* 左奥 = 遠い舞台 (金の額の向こうに小さく) */}
      <g>
        <rect x={60} y={120} width={460} height={620} fill="#3A2B33" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={290} cy={560} r={200} fill="#F3E3B0" opacity={0.3 + 0.05 * Math.sin(f / 10)} />
        <rect x={120} y={620} width={340} height={120} fill={C.stagePlank} stroke={KRP.ink} strokeWidth={5} />
        {/* 遠い舞台の歌手 (極小。裾の広がったドレスと白い鬘だけで演者に見せる) */}
        <PersonMini x={290} y={624} s={0.62} color={KRP.white} f={f} phase={2} face="dot" arms="up" />
        <MiniNo x={290} y={624} s={0.62} f={f} phase={2}>
          {/* 裾の広がった長いドレス */}
          <path d="M -42 -74 L 42 -74 Q 62 -40 90 2 L -90 2 Q -62 -40 -42 -74 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -72 -8 Q 0 -20 72 -8" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
          <path d="M -20 -70 Q -30 -34 -44 -4 M 20 -70 Q 30 -34 44 -4"
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
          {/* 白い鬘 (横の巻き毛2つ) */}
          <path d="M -38 -156 Q -44 -202 0 -204 Q 44 -202 38 -156 Q 20 -170 0 -170 Q -20 -170 -38 -156 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <circle cx={-44} cy={-152} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={44} cy={-152} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 丸く開いた口 */}
          <ellipse cx={0} cy={-146} rx={8} ry={9} fill={KRP.ink} />
        </MiniNo>
        {[0, 1, 2].map((i) => {
          const nx = 400 + ((f * 1.8 + i * 180) % 660);
          return <NoteF key={i} x={nx} y={270 + i * 60} f={f} i={i}
            s={0.8} o={0.55 - ((nx - 400) / 660) * 0.35} />;
        })}
        {/* 金の額縁 (舞台への開口) */}
        <rect x={44} y={104} width={492} height={652} fill="none" stroke={C.goldTrim} strokeWidth={18} />
        <rect x={34} y={94} width={512} height={672} fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 手すり (ビロードの縁) */}
      <g>
        <rect x={-20} y={744} width={W + 40} height={34} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-20} y1={756} x2={1940} y2={756} stroke={KRP.white} strokeWidth={3} opacity={0.5} />
        <rect x={-20} y={778} width={W + 40} height={330} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
        {[160, 480, 800, 1120, 1440, 1760].map((tx) => (
          <g key={tx}>
            <circle cx={tx} cy={880} r={7} fill={KRP.ink} opacity={0.4} />
            <path d={`M ${tx - 90} 950 Q ${tx} 924 ${tx + 90} 950`} fill="none"
              stroke={KRP.ink} strokeWidth={3.5} opacity={0.25} />
          </g>
        ))}
      </g>
      {/* 手すりの上の小物: オペラグラスと丸めた紙 */}
      <g transform="translate(700 740)">
        <rect x={-66} y={-34} width={52} height={38} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={14} y={-34} width={52} height={38} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-16} y={-22} width={32} height={12} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-40} cy={-15} r={9} fill={C.glass} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={40} cy={-15} r={9} fill={C.glass} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <g transform="translate(890 724) rotate(-8)">
        <rect x={-54} y={-14} width={108} height={28} rx={14} fill={SGP.paper} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={54} cy={0} r={13} fill="none" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 大きなクープグラス */}
      <g>
        <ellipse cx={1180} cy={752} rx={150} ry={26} fill={C.glass} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1150 640 L 1148 730 L 1212 730 L 1210 640 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 930 430 Q 950 640 1180 640 Q 1410 640 1430 430 Z"
          fill={C.glass} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 972 470 Q 990 590 1090 616" fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.8} />
        {/* ソルベの山 (すくった窪みつき) */}
        <path d={`M 950 430 Q 1000 ${330 + Math.sin(f / 11) * 3} 1110 340 Q 1160 390 1230 346 Q 1340 330 1410 430 Z`}
          fill={C.lemon} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1120 352 Q 1168 386 1222 354" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        <circle cx={1050} cy={330} r={30} fill={C.berry} stroke={KRP.ink} strokeWidth={6} />
        {/* 溶けて垂れる筋 (じわっと伸びる) */}
        <path d={`M 962 442 q -8 ${22 + melt * 0.4} 2 ${38 + melt}`}
          fill="none" stroke={C.lemon} strokeWidth={9} strokeLinecap="round" />
        <path d={`M 1396 448 q 8 ${16 + melt * 0.3} 0 ${30 + melt * 0.7}`}
          fill="none" stroke={C.lemon} strokeWidth={7} strokeLinecap="round" />
        {/* きらめき */}
        {[[1330, 480], [1000, 540]].map(([sx, sy], i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 8 + i * 2.1));
          return (
            <g key={i} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={tw}>
              <line x1={sx - 14} y1={sy} x2={sx + 14} y2={sy} />
              <line x1={sx} y1={sy - 14} x2={sx} y2={sy + 14} />
            </g>
          );
        })}
      </g>
      {/* 右から伸びる手 + 匙 (ひと匙すくい上げる) */}
      <g transform={`translate(0 ${handY})`}>
        {/* 匙の上の溶けかけの一匙 + 雫 */}
        <circle cx={1262 + dripY * 0.1} cy={344 + dripY} r={7} fill={C.lemon}
          opacity={Math.max(0, 1 - dripY / 70)} />
        <g transform={`rotate(${-6 + lt * 10} 1600 420)`}>
          <line x1={1600} y1={420} x2={1300} y2={352} stroke={KRP.silver} strokeWidth={11} strokeLinecap="round" />
          <ellipse cx={1278} cy={347} rx={34} ry={24} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5}
            transform="rotate(12 1278 347)" />
          <path d={`M 1258 330 Q 1278 ${312 + Math.sin(f / 7) * 2} 1302 332 Q 1296 346 1278 348 Q 1262 346 1258 330 Z`}
            fill={C.lemon} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={1292} cy={322} r={9} fill={C.berry} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 手 (そで口にレース) */}
        <g>
          <circle cx={1620} cy={424} r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1596 400 q -18 10 -10 28" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <path d="M 1646 452 q 14 -8 10 -24 M 1630 460 q 12 -6 10 -20"
            fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M 1650 390 L 1960 330 L 1960 530 L 1672 468 Q 1642 428 1650 390 Z"
            fill="#4A3C5E" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 1656 392 l 10 20 l -16 6 l 16 10 l -12 12 l 18 6 l -10 16"
            fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.9} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #62 劇場が、お客の食事時間を、曲目に組み込んでいたということです。
// 格: 図 / seed 1061
// 絵: 印刷された曲目リストに「お食事どき」が公式の活字で入っている図
// どこ: 幕あいの大理石テーブル。刷り物の曲目表のまわりに珈琲とオペラグラス
// 演出: 他の演目と同じ活字で「お食事どき」。黄のハイライトが走り赤矢印が示す
// 動き: ハイライトの伸び・矢印ポップ・湯気・花の揺れ・紙のわずかな傾き直し
const Sg062: React.FC<{ f: number }> = ({ f }) => {
  const hiW = 700 * seg(f, 12, 26);
  const rows = ["序曲", "アリア", "合唱", "お食事どき", "アリア", "フィナーレ"];
  return (
    <Frame f={f} seed={1061}>
      {/* 奥の壁と大理石テーブル */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#D9CBB4" />
      <line x1={-20} y1={150} x2={1940} y2={150} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
      {[360, 1560].map((sx, i) => (
        <g key={sx} transform={`translate(${sx} 110)`}>
          <path d="M -14 0 L 14 0 L 8 44 L -8 44 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <CandleFlame x={0} y={-6} f={f} i={i + 2} s={1} />
        </g>
      ))}
      <rect x={-20} y={300} width={W + 40} height={800} fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
      {/* 大理石の筋 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i}
          d={`M ${-20 + i * 420} ${380 + rnd(7, i) * 560} q 190 ${-40 - rnd(8, i) * 50} 420 ${20 + rnd(9, i) * 40}`}
          fill="none" stroke={C.marbleVein} strokeWidth={4} opacity={0.8} />
      ))}
      {/* 花の一輪挿し (左奥) */}
      <g transform="translate(250 420)">
        <path d="M -26 0 L -18 -84 L 18 -84 L 26 0 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${Math.sin(f / 10) * 4} 0 -84)`}>
          <line x1={0} y1={-84} x2={14} y2={-170} stroke={KRP.green} strokeWidth={5} />
          <circle cx={18} cy={-182} r={18} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={18} cy={-182} r={6} fill={KRP.yellow} stroke="none" />
        </g>
      </g>
      {/* 珈琲 (右。湯気が立つ) */}
      <g transform="translate(1660 740)">
        <ellipse cx={0} cy={28} rx={120} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -62 -40 Q -58 20 0 24 Q 58 20 62 -40 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-40} rx={62} ry={14} fill="#6E4A32" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 62 -30 q 34 4 28 32 q -6 22 -34 14" fill="none" stroke={KRP.ink} strokeWidth={5.5} />
        <path d={`M -18 -64 q ${Math.sin(f / 9) * 10} -26 -4 -52 M 16 -62 q ${Math.sin(f / 9 + 2) * 10} -24 6 -48`}
          fill="none" stroke={KRP.grayDark} strokeWidth={4.5} opacity={0.6} strokeLinecap="round" />
      </g>
      {/* オペラグラス (左手前) */}
      <g transform="translate(300 900) rotate(-10)">
        <rect x={-70} y={-36} width={56} height={44} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={14} y={-36} width={56} height={44} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-16} y={-24} width={32} height={14} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={70} y1={-14} x2={150} y2={6} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 刷り物の曲目表 */}
      <g transform={`rotate(${-2 + easeOut(seg(f, 0, 10)) * 0.8} 950 515)`}>
        <rect x={578} y={188} width={744} height={656} rx={4}
          fill={KRP.ink} opacity={0.14} transform="translate(10 12)" />
        <rect x={570} y={180} width={760} height={664} rx={4}
          fill={SGP.paper} stroke={KRP.ink} strokeWidth={7} />
        <rect x={594} y={204} width={712} height={616} rx={2}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        <rect x={602} y={212} width={696} height={600} rx={2}
          fill="none" stroke={KRP.ink} strokeWidth={1.8} opacity={0.6} />
        {/* 題字の帯 */}
        <text x={950} y={282} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={46} fill={KRP.ink} letterSpacing={10}>本日の曲目</text>
        <line x1={660} y1={310} x2={1240} y2={310} stroke={KRP.ink} strokeWidth={3.5} />
        <polygon points="950,322 960,332 950,342 940,332" fill={KRP.ink} />
        {/* ハイライト (お食事どきの行に走る) */}
        <rect x={600} y={578} width={hiW} height={56} fill={KRP.yellow} opacity={0.55} />
        {/* 曲目の行 (全部同じ公式の活字) */}
        {rows.map((tx, i) => (
          <g key={i}>
            <text x={950} y={382 + i * 78} textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={38} fill={KRP.ink} letterSpacing={4}>{tx}</text>
            {i < rows.length - 1 && (
              <circle cx={950} cy={408 + i * 78} r={3.5} fill={KRP.ink} opacity={0.5} />
            )}
          </g>
        ))}
        {/* お食事どきの行の横に刷られた小さなソルベ (これも活字扱い) */}
        <g opacity={pop(seg(f, 20, 28))}>
          <SorbetCup x={1180} y={628} s={0.32} f={f} i={8} />
        </g>
        {/* 紙の角の折れ */}
        <path d="M 1330 780 L 1266 844 L 1330 844 Z" fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 赤矢印 (お食事どきの行を指す) */}
      <Arrow x={1392} y={606} rot={180} s={1.15} t={seg(f, 26, 36)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #63 江戸もロンドンもナポリも、客席は明るく、出入り口は開けっぱなし。
// 格: 山 / seed 1062
// 絵: **`Danmen` 初登場・状態A**。5灯すべて点灯、弁当と音符、出入口⇄が太い。上に江戸・ロンドン・ナポリの小旗。**リキャップ①**
// どこ: 劇場断面図そのものが世界。地面の影の上に建ち上がる
// 演出: 断面図が建物→舞台→客席→ランプの順に描き上がり、屋根に三都市の小旗が立つ
// 動き: 断面図の建ち上がり (t)・旗が順にポップして波打つ・炎と音符は装置側で動く
const Sg063: React.FC<{ f: number }> = ({ f }) => {
  const flags: { x: number; tx: string; color: string; wd: number; ph: number }[] = [
    { x: 600, tx: "江戸", color: KRP.red, wd: 128, ph: 0 },
    { x: 960, tx: "ロンドン", color: KRP.blueDeep, wd: 196, ph: 1 },
    { x: 1320, tx: "ナポリ", color: KRP.green, wd: 162, ph: 2 },
  ];
  const roofY = (gx: number) => 560 + (-328 + (Math.abs(gx - 960) / 868) * 100);
  return (
    <Frame f={f} seed={1062}>
      {/* 地面の影と浮遊するほこりの光 */}
      <ellipse cx={960} cy={896} rx={900} ry={36} fill={C.wainscot} opacity={0.6} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={140 + rnd(13, i) * 1640} cy={200 + rnd(14, i) * 500}
          r={3 + rnd(15, i) * 3} fill={SGP.lampGold}
          opacity={0.25 + 0.3 * Math.abs(Math.sin(f / 9 + i * 1.9))} />
      ))}
      {/* 劇場断面図 (初登場。状態A = ぜんぶ点いている) */}
      <Danmen f={f} state="A" t={seg(f, 2, 34)} />
      {/* 屋根の上の三都市の小旗 */}
      {flags.map((fl, i) => {
        const p = pop(seg(f, 24 + i * 5, 32 + i * 5));
        const base = roofY(fl.x);
        const wv = Math.sin(f / 7 + fl.ph * 1.7) * 6;
        const fh = base - 124; // 旗布の上辺までの高さ
        if (p <= 0) return null;
        return (
          <g key={i} transform={`translate(${fl.x} ${base}) scale(${p})`}>
            <line x1={0} y1={0} x2={0} y2={-fh} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-fh - 6} r={7} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M 8 ${-fh + 4} Q ${8 + fl.wd * 0.5} ${-fh + 4 + wv} ${8 + fl.wd} ${-fh + 4 + wv * 0.7}
                      L ${8 + fl.wd} ${-fh + 60 + wv * 0.7} Q ${8 + fl.wd * 0.5} ${-fh + 60 + wv} 8 ${-fh + 60} Z`}
              fill={fl.color} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <text x={8 + fl.wd / 2} y={-fh + 44 + wv * 0.5} textAnchor="middle"
              fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={1.2} paintOrder="stroke">{fl.tx}</text>
          </g>
        );
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #64 劇場の主役は舞台ではなく、お客のほうでした。
// 格: 山 / seed 1063
// 絵: 章結び。断面図の客席側に大きな王冠がことんと載る。舞台側は「脇役」の小さな札。次章でこれが逆転する前フリ
// どこ: #63と同じ断面図の世界。屋根の客席側に王冠が降りてくる
// 演出: 王冠がことんと着地→衝撃線→光の環。客席側=主役 舞台側=脇役の対比
// 動き: 王冠の落下と着地・衝撃線の明滅・後光の回転・札2枚のポップ・装置側の炎と音符
const Sg064: React.FC<{ f: number }> = ({ f }) => {
  const cT = seg(f, 6, 24);
  const cy = lerp(-260, 272, easeOut(cT));
  const impact = clamp01(seg(f, 23, 27) - seg(f, 32, 40));
  const rayO = seg(f, 26, 36) * (0.2 + 0.08 * Math.sin(f / 8));
  return (
    <Frame f={f} seed={1063}>
      {/* 地面の影 (前文と同じ世界) */}
      <ellipse cx={960} cy={896} rx={900} ry={36} fill={C.wainscot} opacity={0.6} />
      {/* 王冠の後光 (着地後にゆっくり回る) */}
      <g transform={`translate(1220 ${cy - 110}) rotate(${f * 0.5})`} opacity={rayO}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1={0} y1={-150} x2={0} y2={-255}
            stroke={KRP.yellow} strokeWidth={14} strokeLinecap="round"
            transform={`rotate(${i * 45})`} />
        ))}
      </g>
      {/* 劇場断面図 (状態Aのまま) */}
      <Danmen f={f} state="A" t={1} />
      {/* 大きな王冠が客席側の屋根にことんと載る */}
      <g transform={`translate(1220 ${cy}) rotate(${cT >= 1 ? Math.sin(f / 9) * 0.8 : 0})`}>
        <ellipse cx={0} cy={6} rx={170} ry={16} fill={KRP.ink} opacity={0.16 * cT} />
        {/* ギザの本体 */}
        <path d="M -164 -64 L -164 -158 L -118 -108 L -66 -186 L -22 -116 L 0 -206 L 22 -116 L 66 -186 L 118 -108 L 164 -158 L 164 -64 Z"
          fill={KRP.gold} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        {/* 土台の帯 */}
        <rect x={-170} y={-68} width={340} height={68} rx={10}
          fill={KRP.gold} stroke={KRP.ink} strokeWidth={7} />
        <line x1={-150} y1={-52} x2={150} y2={-52} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        {/* 宝石 */}
        <circle cx={-96} cy={-34} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-34} r={16} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={96} cy={-34} r={14} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        {/* ギザ先の玉 */}
        {[[-164, -158], [-66, -186], [0, -206], [66, -186], [164, -158]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by - 8} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 照り */}
        <path d="M -140 -92 q 16 -24 44 -34" fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.85} />
      </g>
      {/* 着地の衝撃線 */}
      <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={impact}>
        <line x1={1016} y1={266} x2={972} y2={242} />
        <line x1={1032} y1={296} x2={982} y2={292} />
        <line x1={1424} y1={266} x2={1468} y2={242} />
        <line x1={1408} y1={296} x2={1458} y2={292} />
      </g>
      {/* 主役と脇役の札 */}
      <TagPlate x={1560} y={128} text="主役" size={36} fill={KRP.yellow} rot={6} t={seg(f, 28, 38)} />
      <g transform={`rotate(${Math.sin(f / 10) * 1.4} 404 352)`}>
        <TagPlate x={404} y={352} text="脇役" size={30} rot={-7} t={seg(f, 32, 42)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_057: (f) => <Sg057 f={f} />,
  sg_058: (f) => <Sg058 f={f} />,
  sg_059: (f) => <Sg059 f={f} />,
  sg_060: (f) => <Sg060 f={f} />,
  sg_061: (f) => <Sg061 f={f} />,
  sg_062: (f) => <Sg062 f={f} />,
  sg_063: (f) => <Sg063 f={f} />,
  sg_064: (f) => <Sg064 f={f} />,
};

export const S_B2B_MOTIFS: string[] = [
  "sg_057", // #57
  "sg_058", // #58
  "sg_059", // #59
  "sg_060", // #60
  "sg_061", // #61
  "sg_062", // #62
  "sg_063", // #63
  "sg_064", // #64
];

export const saigoB2bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
