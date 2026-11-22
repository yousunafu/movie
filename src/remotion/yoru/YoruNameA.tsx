// 夜の深掘り 試作: 名前回 1枚目 (山)「店に入った日、名前が変わった」(奉公人の改名)
// からくりのニュアンス (焦げ茶の太線・ゆらぎ・大きなたて長の目) を残したまま、夜の行灯の光で描く。
// 6点法: 寄る (帳場全体 → 子どもと名札) / 世界 (夜の商家の帳場・障子に松の影・行灯・のれん)
//        部品 (帳場格子・大福帳・そろばん・硯・行灯の木枠) / カメラ (引き → 寄り)
//        事件 (新しい名札を受け取ると、荷札の元の名前がほどけて行灯のほうへ消えていく) / 人の反応 (子どもが振り返る)
// ★「千と千尋」の絵は一切描かない (湯屋・赤い提灯・登場人物に寄せない)。店の印は架空
import React from "react";
import {
  W, H, YRP, seg, easeInOut, lerp, useMood,
  YoruDefs, NightFinish, Caption, FileTag, Folk, folkHand, Dust,
} from "./YoruShared";

const BRUSH = "'Hiragino Mincho ProN', 'Yu Mincho', serif";
const OLD = ["た", "ろ", "う"];

// 縦書き (1文字ずつ)
const VText: React.FC<{ x: number; y: number; chars: string[]; size: number; fill: string; gap?: number; opacity?: number }> = ({
  x, y, chars, size, fill, gap = 1.05, opacity = 1,
}) => (
  <g opacity={opacity}>
    {chars.map((c, i) => (
      <text key={i} x={x} y={y + i * size * gap} textAnchor="middle" fontFamily={BRUSH} fontWeight={800} fontSize={size} fill={fill}>{c}</text>
    ))}
  </g>
);

export const NameA: React.FC<{ f: number }> = ({ f }) => {
  const dusk = useMood() === "dusk";
  const k = easeInOut(seg(f, 10, 124));
  const sc = 1 + k * 0.42;
  const cx = lerp(960, 1060, k);
  const cy = lerp(540, 600, k);
  const give = easeInOut(seg(f, 20, 52)); // 名札が手渡されていく
  const fadeOld = seg(f, 64, 104); // 元の名前がほどける
  const turn = f >= 80; // 子どもが荷札のほうを見る
  const flame = 1 + Math.sin(f / 4) * 0.05 + Math.sin(f / 2.3) * 0.03;

  // 番頭の右手 → 子どもの左手 へ名札が移る
  const bantoHand = folkHand(500, 820, 1.08, 1, -64);
  const kidHand = folkHand(1180, 900, 1.0, -1, 100);
  const tagX = lerp(bantoHand[0] + 20, kidHand[0] - 8, give);
  const tagY = lerp(bantoHand[1] - 10, kidHand[1] - 16, give);

  // 荷札 (子どもの背中の風呂敷から下がる) の位置
  const oldTag: [number, number] = [1292, 772];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={41} f={f} />
      <defs>
        <radialGradient id="andonPool" cx="860" cy="600" r="640" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFC877" stopOpacity={0.55} />
          <stop offset="45%" stopColor="#FFB45A" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#FFB45A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="shojiG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dusk ? "#F2B27A" : "#7E93B0"} stopOpacity={dusk ? 1 : 0.5} />
          <stop offset="100%" stopColor={dusk ? "#D98A7A" : "#4C5E7C"} stopOpacity={dusk ? 1 : 0.5} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={YRP.night0} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <g filter="url(#ywobble)">
          {/* ===== 天井と鴨居 ===== */}
          <rect x={-200} y={-200} width={2400} height={330} fill={dusk ? "#3A2A20" : "#16120F"} />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-200 + i * 420} y={-200} width={28} height={320} fill="#221B15" />)}
          <rect x={-200} y={108} width={2400} height={30} fill="#3A2C22" stroke={YRP.ink} strokeWidth={4} />
          {/* ===== 障子 (月明かり) ===== */}
          <rect x={-200} y={138} width={1760} height={520} fill={dusk ? "#E8A07A" : "#141A28"} />
          <rect x={-200} y={138} width={1760} height={520} fill="url(#shojiG)" opacity={dusk ? 1 : 0.5} />
          {/* 松の枝の影 */}
          <g fill={dusk ? "#7A4A50" : "#151B29"} opacity={dusk ? 0.55 : 0.75}>
            <path d="M -200 260 Q 200 230 420 300 Q 520 330 600 300 L 610 312 Q 520 350 420 324 Q 200 270 -200 300 Z" />
            {[[120, 250], [300, 268], [470, 300], [560, 300]].map(([x, y], i) => (
              <g key={i}>
                <ellipse cx={x} cy={y - 34} rx={70} ry={30} />
                <ellipse cx={x + 40} cy={y - 50} rx={46} ry={22} />
              </g>
            ))}
            <path d="M 1100 138 Q 1180 300 1300 380 L 1290 392 Q 1170 310 1086 150 Z" />
            <ellipse cx={1310} cy={380} rx={80} ry={32} />
            <ellipse cx={1250} cy={340} rx={60} ry={26} />
          </g>
          {/* 障子の桟 */}
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={-200 + i * 110} y1={138} x2={-200 + i * 110} y2={658} stroke="#3A2C22" strokeWidth={i % 4 === 0 ? 14 : 5} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={-200} y1={138 + i * 104} x2={1560} y2={138 + i * 104} stroke="#3A2C22" strokeWidth={5} />
          ))}
          {/* ===== のれん (店の入口・架空の印) ===== */}
          <rect x={1560} y={138} width={500} height={520} fill={dusk ? "#E89A6A" : "#0E1119"} />
          {dusk && <rect x={1560} y={420} width={500} height={238} fill="#B86A5A" />}
          <rect x={1556} y={110} width={480} height={20} rx={8} fill="#5A4130" stroke={YRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => {
            const sway = Math.sin(f / 22 + i) * 6;
            return (
              <g key={i}>
                <path d={`M ${1580 + i * 140} 128 L ${1712 + i * 140} 128 L ${1712 + i * 140 + sway} 420 L ${1580 + i * 140 + sway} 420 Z`} fill="#2C3D63" stroke={YRP.ink} strokeWidth={4} strokeLinejoin="round" />
              </g>
            );
          })}
          <path d="M 1730 268 L 1786 214 L 1842 268" fill="none" stroke="#E9E2CE" strokeWidth={14} strokeLinejoin="round" opacity={0.9} />
          <rect x={1736} y={290} width={100} height={14} fill="#E9E2CE" opacity={0.9} />
          {/* 大福帳 (柱にかける) */}
          <rect x={1546} y={138} width={30} height={530} fill="#3A2C22" stroke={YRP.ink} strokeWidth={4} />
          <g transform="translate(1490 300) rotate(4)">
            <line x1={56} y1={-24} x2={56} y2={0} stroke={YRP.ink} strokeWidth={3} />
            <rect x={0} y={0} width={112} height={160} fill="#D6C9A6" stroke={YRP.ink} strokeWidth={4} />
            <rect x={0} y={0} width={112} height={18} fill="#8A5A3A" />
            <VText x={56} y={58} chars={["大", "福", "帳"]} size={30} fill="#2B2420" />
          </g>
          {/* ===== 床 (板の間 + 畳) ===== */}
          <rect x={-200} y={658} width={2400} height={700} fill={dusk ? "#7A5A40" : "#3A2C20"} />
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={-200} y1={680 + i * 46} x2={2200} y2={680 + i * 46} stroke="#2E2219" strokeWidth={4} />
          ))}
          <line x1={-200} y1={660} x2={2200} y2={660} stroke={YRP.ink} strokeWidth={5} />
          {/* ===== 帳場 (番頭の机と格子) ===== */}
          {/* 番頭 (格子の向こうに座る) */}
          <g filter="url(#yrim)">
            <Folk x={500} y={820} s={1.08} f={f} phase={1} hair="chonmage" kimono cloth="#5A4636" obi="#2E2620"
              face={f > 40 ? "smile" : "normal"} gaze={[5, 2]} armR={-64} armL={20} hideLegs />
          </g>
          {/* 帳机 */}
          <rect x={250} y={720} width={420} height={26} fill="#5A4130" stroke={YRP.ink} strokeWidth={5} />
          <rect x={270} y={746} width={24} height={80} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
          <rect x={626} y={746} width={24} height={80} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
          {/* そろばん */}
          <g transform="translate(290 690)">
            <rect x={0} y={0} width={170} height={34} fill="#4A3020" stroke={YRP.ink} strokeWidth={4} />
            <line x1={4} y1={12} x2={166} y2={12} stroke={YRP.ink} strokeWidth={3} />
            {Array.from({ length: 9 }).map((_, i) => (
              <g key={i}>
                <ellipse cx={14 + i * 18} cy={7} rx={7} ry={4} fill="#2A1C14" />
                {[0, 1, 2].map((j) => <ellipse key={j} cx={14 + i * 18} cy={18 + j * 6} rx={7} ry={3} fill="#2A1C14" />)}
              </g>
            ))}
          </g>
          {/* 硯と筆 */}
          <rect x={500} y={698} width={70} height={24} rx={4} fill="#26232A" stroke={YRP.ink} strokeWidth={3} />
          <line x1={586} y1={716} x2={656} y2={688} stroke="#7A5A3A" strokeWidth={6} strokeLinecap="round" />
          <path d="M 586 716 L 574 722 L 580 711 Z" fill="#1A1614" />
          {/* 帳場格子 (手前の低い格子) */}
          <g>
            <rect x={200} y={760} width={500} height={150} fill="none" stroke="#2E2219" strokeWidth={10} />
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1={212 + i * 35} y1={764} x2={212 + i * 35} y2={906} stroke="#3A2C22" strokeWidth={8} />
            ))}
            <rect x={196} y={752} width={508} height={18} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
            <rect x={196} y={900} width={508} height={16} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
          </g>
          {/* ===== 行灯 ===== */}
          <g transform="translate(860 470)">
            <ellipse cx={0} cy={236} rx={100} ry={18} fill="#000" opacity={0.4} />
            <rect x={-70} y={0} width={140} height={190} fill="#F4D9A0" stroke={YRP.ink} strokeWidth={5} />
            <rect x={-70} y={0} width={140} height={190} fill="#FFE2A0" opacity={0.5 * flame} />
            <line x1={0} y1={0} x2={0} y2={190} stroke="#5A4130" strokeWidth={4} />
            <line x1={-70} y1={96} x2={70} y2={96} stroke="#5A4130" strokeWidth={4} />
            <ellipse cx={0} cy={150} rx={16 * flame} ry={26 * flame} fill="#FFF3C4" opacity={0.85} />
            <rect x={-80} y={-12} width={160} height={16} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
            <rect x={-80} y={186} width={160} height={16} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
            {[-72, 64].map((x) => <rect key={x} x={x} y={-12} width={8} height={250} fill="#4A3526" stroke={YRP.ink} strokeWidth={3} />)}
          </g>
          {/* ===== 丁稚 (着いたばかり。背中に風呂敷、荷札に元の名前) ===== */}
          {/* 風呂敷包み (背中) */}
          <g transform="translate(1180 742)">
            <ellipse cx={0} cy={0} rx={96} ry={72} fill="#3E7A52" stroke={YRP.ink} strokeWidth={5} />
            {[[-80, -30], [52, -40], [-70, 20], [66, 10]].map(([x, y], i) => (
              <path key={i} d={`M ${x} ${y} q 14 -16 28 0 q 10 14 -6 22`} stroke="#E9E2CE" strokeWidth={4} fill="none" opacity={0.8} />
            ))}
          </g>
          {/* 荷札 (元の名前) */}
          <g transform={`translate(${oldTag[0]} ${oldTag[1]}) rotate(${6 + Math.sin(f / 16) * 2})`}>
            <line x1={0} y1={-60} x2={0} y2={-10} stroke="#B9AE97" strokeWidth={3} />
            <path d="M -32 -10 L 32 -10 L 32 120 L -32 120 L -32 4 Z" fill="#EFE6D2" stroke={YRP.ink} strokeWidth={4} />
            <circle cx={0} cy={6} r={5} fill="none" stroke={YRP.ink} strokeWidth={2.5} />
            {OLD.map((c, i) => {
              const t = seg(f, 64 + i * 8, 92 + i * 8);
              return (
                <text key={i} x={0} y={46 + i * 30} textAnchor="middle" fontFamily={BRUSH} fontWeight={800} fontSize={28} fill="#2B2420" opacity={1 - t}>{c}</text>
              );
            })}
          </g>
          <g filter="url(#yrim)">
            <Folk x={1180} y={900} s={1.0} f={f} phase={4} hair="bowl" kimono cloth="#8DA3B8" obi="#3A4F6A"
              face={turn ? "wide" : "normal"} gaze={turn ? [6, 4] : [-6, -2]} armL={give > 0.9 ? 100 : 60} armR={turn ? -34 : 4} cheek />
          </g>
          {/* 風呂敷の結び目 (胸の前) */}
          <path d="M 1150 770 Q 1180 752 1210 770 Q 1196 790 1180 792 Q 1164 790 1150 770 Z" fill="#3E7A52" stroke={YRP.ink} strokeWidth={4} />
          <line x1={1132} y1={736} x2={1162} y2={772} stroke="#3E7A52" strokeWidth={12} strokeLinecap="round" />
          <line x1={1228} y1={736} x2={1198} y2={772} stroke="#3E7A52" strokeWidth={12} strokeLinecap="round" />
          {/* 新しい名札 (木札) */}
          <g transform={`translate(${tagX} ${tagY}) rotate(${lerp(-10, 4, give)})`}>
            <rect x={-26} y={-6} width={52} height={130} rx={4} fill="#D9B98A" stroke={YRP.ink} strokeWidth={4} />
            <rect x={-26} y={-6} width={52} height={130} rx={4} fill="#FFDCA0" opacity={0.25} />
            <circle cx={0} cy={8} r={5} fill="#5A4130" />
            <VText x={0} y={56} chars={["定", "吉"]} size={36} fill="#2B2420" />
          </g>
        </g>
        {/* 夜の暗さ → 行灯の光 */}
        <rect x={-200} y={-200} width={2400} height={1500} fill={dusk ? "#7A3A2A" : "#0A0D16"} opacity={dusk ? 0.1 : 0.42} />
        <rect x={-200} y={-200} width={2400} height={1500} fill="url(#andonPool)" style={{ mixBlendMode: "screen" }} />
        {/* ほどけて行灯へ流れていく元の名前 */}
        {OLD.map((c, i) => {
          const t = seg(f, 66 + i * 8, 126 + i * 8);
          if (t <= 0 || t >= 1) return null;
          const e = easeInOut(t);
          const x = lerp(oldTag[0], 900, e) + Math.sin(t * 9 + i) * 26;
          const y = lerp(oldTag[1] + 46 + i * 30, 520, e) - Math.sin(t * Math.PI) * 120;
          return (
            <g key={i} opacity={(1 - t) * 0.95}>
              <text x={x} y={y} textAnchor="middle" fontFamily={BRUSH} fontWeight={800} fontSize={30 + t * 16} fill="#FFE9B8" filter="url(#yglowS)">{c}</text>
              <text x={x} y={y} textAnchor="middle" fontFamily={BRUSH} fontWeight={800} fontSize={30 + t * 16} fill="#FFF6DD">{c}</text>
            </g>
          );
        })}
        <Dust f={f} x={700} y={300} w={500} h={420} n={18} color="#FFE2A8" seed={7} />
      </g>
      <NightFinish grain={0.07} />
      <FileTag no="02" title="名前を奪われるのは、なぜ怖いのか" f={f} />
      <Caption f={f} text={f < 66 ? "店に入ったその日、子どもは新しい名前をもらった" : "もとの名前は、もう誰も呼ばない"} />
    </svg>
  );
};

