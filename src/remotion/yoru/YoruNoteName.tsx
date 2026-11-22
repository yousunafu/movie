// 名前回を「全部ゆる落書きノート」で描いた試作 (2026-11-16)。出来事・タイミング・カメラは夜版 (YoruNameA〜C) と同じ。
// 青いボールペン + 蛍光ペン + 罫線ノート。書きこみ (矢印・手書きの注釈) もノートらしさとして使う。
import React from "react";
import { W, H, seg, easeInOut, easeOut, pop, lerp, rnd, YoruDefs, Caption, FileTag } from "./YoruShared";
import { PEN, PEN_RED, MK, PAPER, pen, NotePaper, NoteFolk, noteHand, Hand, Arrow } from "./YoruNote";

// 縦書きの手書き
const VHand: React.FC<{ x: number; y: number; chars: string[]; size: number; color?: string; opacity?: number }> = ({
  x, y, chars, size, color = PEN, opacity = 1,
}) => (
  <g opacity={opacity}>
    {chars.map((c, i) => <Hand key={i} x={x} y={y + i * size * 1.05} text={c} size={size} color={color} />)}
  </g>
);

// ========== 1. 店に入った日、名前が変わった ==========
export const NoteNameA: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 10, 124));
  const sc = 1 + k * 0.42;
  const cx = lerp(960, 1060, k);
  const cy = lerp(540, 600, k);
  const give = easeInOut(seg(f, 20, 52));
  const turn = f >= 80;
  const bantoHand = noteHand(500, 820, 1.08, 1, -64);
  const kidHand = noteHand(1180, 900, 1.0, -1, 100);
  const tagX = lerp(bantoHand[0] + 20, kidHand[0] - 8, give);
  const tagY = lerp(bantoHand[1] - 10, kidHand[1] - 16, give);
  const oldTag: [number, number] = [1292, 772];
  const OLD = ["た", "ろ", "う"];
  const flame = 1 + Math.sin(f / 4) * 0.06;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={41} f={f} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <NotePaper />
        <g filter="url(#ywobbleNote)">
          <g {...pen}>
            {/* 鴨居と障子 */}
            <path d="M -200 108 Q 800 104 2200 110 M -200 136 Q 800 132 2200 138" />
            {Array.from({ length: 17 }).map((_, i) => (
              <path key={i} d={`M ${-200 + i * 110} 138 L ${-198 + i * 110} 658`} strokeWidth={i % 4 === 0 ? 5 : 3} opacity={0.75} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <path key={i} d={`M -200 ${242 + i * 104} L 1560 ${240 + i * 104}`} strokeWidth={3} opacity={0.75} />
            ))}
            {/* 松の枝 (障子ごしの影) */}
            <path d="M -200 290 Q 200 250 420 310 Q 520 336 600 306" strokeWidth={6} />
            {[[120, 250], [300, 268], [470, 300]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y - 34} rx={70} ry={30} fill={MK.green} fillOpacity={0.45} strokeWidth={3.5} />
            ))}
            <path d="M 1100 138 Q 1180 300 1300 380" strokeWidth={6} />
            <ellipse cx={1300} cy={372} rx={80} ry={32} fill={MK.green} fillOpacity={0.45} strokeWidth={3.5} />
            {/* のれん */}
            {[0, 1, 2].map((i) => {
              const sway = Math.sin(f / 22 + i) * 6;
              return <path key={i} d={`M ${1580 + i * 140} 128 L ${1712 + i * 140} 128 L ${1712 + i * 140 + sway} 420 L ${1580 + i * 140 + sway} 420 Z`} fill={MK.blue} fillOpacity={0.5} />;
            })}
            <path d="M 1556 120 L 2040 120" strokeWidth={8} />
            <path d="M 1740 268 L 1786 222 L 1832 268 M 1744 296 L 1828 296" strokeWidth={8} />
            {/* 柱と大福帳 */}
            <path d="M 1556 138 L 1558 668 M 1580 138 L 1582 668" />
            <rect x={1490} y={300} width={112} height={160} fill={PAPER} transform="rotate(4 1546 380)" />
            {/* 床 */}
            <path d="M -200 660 Q 900 654 2200 662" />
            {Array.from({ length: 8 }).map((_, i) => (
              <path key={i} d={`M -200 ${700 + i * 50} Q 900 ${696 + i * 50} 2200 ${702 + i * 50}`} strokeWidth={2.5} opacity={0.35} />
            ))}
            {/* 帳机・そろばん・硯 */}
            <rect x={250} y={720} width={420} height={26} fill={PAPER} />
            <path d="M 280 746 L 282 826 M 640 746 L 638 826" />
            <rect x={290} y={690} width={170} height={34} fill={PAPER} strokeWidth={4} />
            {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={304 + i * 18} cy={712} r={5} fill={PEN} stroke="none" />)}
            <path d="M 294 700 L 456 700" strokeWidth={3} />
            <rect x={500} y={698} width={70} height={24} rx={4} fill={PEN} fillOpacity={0.8} strokeWidth={3} />
            {/* 帳場格子 */}
            <rect x={200} y={760} width={500} height={150} />
            {Array.from({ length: 13 }).map((_, i) => <path key={i} d={`M ${236 + i * 35} 764 L ${236 + i * 35} 906`} strokeWidth={3.5} />)}
          </g>
          <VHand x={1546} y={368} chars={["大", "福", "帳"]} size={30} />
          {/* 行灯 */}
          <circle cx={860} cy={600} r={150 * flame} fill={MK.yellow} opacity={0.32} />
          <g {...pen}>
            <rect x={790} y={470} width={140} height={190} fill={PAPER} />
            <path d="M 860 470 L 860 660 M 790 566 L 930 566 M 780 460 L 940 460 M 780 670 L 940 670 M 790 660 L 788 710 M 930 660 L 932 710" />
            <path d={`M 860 ${592 - 22 * flame} Q ${874} ${612} 860 ${628} Q ${846} 612 860 ${592 - 22 * flame} Z`} fill={MK.orange} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = -Math.PI / 2 + (i - 2) * 0.5;
              return <path key={i} d={`M ${860 + Math.cos(a) * 110} ${470 + Math.sin(a) * 60} l ${Math.cos(a) * 26} ${Math.sin(a) * 18}`} strokeWidth={4} />;
            })}
          </g>
          {/* 番頭 */}
          <NoteFolk x={500} y={820} s={1.08} f={f} phase={1} hair="chonmage" kimono wear={MK.orange}
            face={f > 40 ? "smile" : "normal"} gaze={[5, 2]} armR={-64} armL={20} hideLegs />
          {/* 子どもの風呂敷 (背中) */}
          <ellipse cx={1180} cy={742} rx={96} ry={72} fill={MK.green} fillOpacity={0.55} {...{ stroke: PEN, strokeWidth: 5 }} />
          {[[-80, -30], [52, -40], [-70, 20], [66, 10]].map(([x, y], i) => (
            <path key={i} d={`M ${1180 + x} ${742 + y} q 14 -16 28 0 q 10 14 -6 22`} stroke={PEN} strokeWidth={3.5} fill="none" />
          ))}
          {/* 荷札 (元の名前) */}
          <g transform={`translate(${oldTag[0]} ${oldTag[1]}) rotate(${6 + Math.sin(f / 16) * 2})`}>
            <path d="M 0 -60 L 0 -10" stroke={PEN} strokeWidth={3} />
            <path d="M -32 -10 L 32 -10 L 32 120 L -32 120 L -32 4 Z" fill={PAPER} {...{ stroke: PEN, strokeWidth: 4.5, strokeLinejoin: "round" }} />
            {OLD.map((c, i) => <Hand key={i} x={0} y={42 + i * 32} text={c} size={30} opacity={1 - seg(f, 64 + i * 8, 92 + i * 8)} />)}
          </g>
          {/* 子ども */}
          <NoteFolk x={1180} y={900} s={1.0} f={f} phase={4} hair="bowl" kimono wear={MK.blue}
            face={turn ? "wide" : "normal"} gaze={turn ? [6, 4] : [-6, -2]} armL={give > 0.9 ? 100 : 60} armR={turn ? -34 : 4} />
          <path d="M 1132 736 L 1162 772 M 1228 736 L 1198 772" stroke={PEN} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
          {/* 新しい名札 */}
          <g transform={`translate(${tagX} ${tagY}) rotate(${lerp(-10, 4, give)})`}>
            <rect x={-26} y={-6} width={52} height={130} rx={4} fill={MK.orange} fillOpacity={0.55} stroke={PEN} strokeWidth={4.5} />
            <circle cx={0} cy={8} r={5} fill={PEN} />
            <VHand x={0} y={56} chars={["定", "吉"]} size={36} />
          </g>
          {/* 書きこみ */}
          <Arrow x1={tagX - 170} y1={tagY + 70} x2={tagX - 34} y2={tagY + 50} bend={-24} t={seg(f, 54, 66)} />
          <Hand x={tagX - 270} y={tagY + 84} text="あたらしい名前" size={30} rot={-6} opacity={seg(f, 60, 68)} />
          <Arrow x1={1460} y1={640} x2={1330} y2={760} bend={30} t={seg(f, 70, 82)} color={PEN_RED} />
          <Hand x={1480} y={626} text="もとの名前" size={30} rot={6} color={PEN_RED} opacity={seg(f, 76, 84)} />
        </g>
        {/* ほどけて行灯へ流れる元の名前 */}
        {OLD.map((c, i) => {
          const t = seg(f, 66 + i * 8, 126 + i * 8);
          if (t <= 0 || t >= 1) return null;
          const e = easeInOut(t);
          const x = lerp(oldTag[0], 900, e) + Math.sin(t * 9 + i) * 26;
          const y = lerp(oldTag[1] + 42 + i * 32, 520, e) - Math.sin(t * Math.PI) * 120;
          return <Hand key={i} x={x} y={y} text={c} size={30 + t * 16} opacity={(1 - t) * 0.9} />;
        })}
      </g>
      <FileTag no="02" title="名前を奪われるのは、なぜ怖いのか" f={f} />
      <Caption f={f} text={f < 66 ? "店に入ったその日、子どもは新しい名前をもらった" : "もとの名前は、もう誰も呼ばない"} />
    </svg>
  );
};

// ========== 2. 明治、名前は一人ひとつに決められた ==========
const NAMES = [
  { chars: ["竹", "丸"], label: "子どものころ" },
  { chars: ["新", "之", "助"], label: "大人になって" },
  { chars: ["一", "斎"], label: "隠居して" },
];
const SLAM = 86;
export const NoteNameB: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 6, 120));
  const shake = f >= SLAM && f < SLAM + 10 ? Math.sin((f - SLAM) * 3.1) * (10 - (f - SLAM)) * 1.6 : 0;
  const sc = 1 + k * 0.28;
  const cx = lerp(960, 980, k) + shake;
  const cy = lerp(540, 560, k) + shake * 0.6;
  const raise = easeOut(seg(f, 40, 70));
  const drop = seg(f, 76, SLAM);
  const sealY = lerp(lerp(700, 470, raise), 626, drop * drop);
  const sealX = lerp(lerp(1104, 1084, raise), 1112, drop);
  const hit = f >= SLAM;
  const pull = easeInOut(seg(f, 70, SLAM));
  const slot: [number, number] = [1120, 560];
  const sh: [number, number] = [980 + 42 * 1.08, 700 - 142 * 1.08];
  const hand: [number, number] = [sealX, sealY - 90];
  const hatHand = noteHand(1450, 760, 1.08, 1, 60);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={53} f={f} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <NotePaper />
        <g filter="url(#ywobbleNote)">
          <g {...pen}>
            {/* 腰板の線 */}
            <path d="M -200 466 Q 900 460 2200 468" strokeWidth={4} />
            {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M ${-200 + i * 110} 470 L ${-199 + i * 110} 700`} strokeWidth={2.5} opacity={0.45} />)}
            {/* 帳簿の棚 */}
            <rect x={330} y={150} width={470} height={300} />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <path d={`M 330 ${248 + r * 98} L 800 ${248 + r * 98}`} />
                {Array.from({ length: 13 }).map((_, i) => <rect key={i} x={340 + i * 34} y={168 + r * 98} width={28} height={76} strokeWidth={3} fill={i % 3 === 0 ? MK.orange : PAPER} fillOpacity={0.5} />)}
              </g>
            ))}
            {/* 振り子時計 */}
            <rect x={80} y={150} width={140} height={250} rx={10} />
            <circle cx={150} cy={210} r={46} fill={PAPER} />
            <path d="M 150 210 L 170 194 M 150 210 L 144 174" />
            <g transform={`rotate(${Math.sin(f / 9) * 14} 150 278)`}>
              <path d="M 150 278 L 150 356" strokeWidth={4} />
              <circle cx={150} cy={362} r={14} fill={MK.yellow} />
            </g>
            {/* 掲示 */}
            <rect x={1190} y={120} width={180} height={240} fill={PAPER} transform="rotate(-2 1280 240)" />
            {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M ${1340 - i * 28} 150 L ${1336 - i * 28} ${320 - (i % 2) * 40}`} strokeWidth={3} strokeDasharray="14 8" />)}
            {/* 窓とガス灯 */}
            <rect x={1500} y={90} width={250} height={350} />
            <path d="M 1625 92 L 1626 438 M 1502 178 L 1748 178 M 1502 266 L 1748 266 M 1502 354 L 1748 354" strokeWidth={3.5} />
            <path d="M 1560 210 L 1560 440" strokeWidth={6} />
            <rect x={1540} y={170} width={40} height={40} fill={MK.yellow} />
            {[[1700, 130], [1660, 310]].map(([x, y], i) => <path key={i} d={`M ${x} ${y - 10} L ${x} ${y + 10} M ${x - 10} ${y} L ${x + 10} ${y}`} strokeWidth={3} />)}
          </g>
          {/* 役人 (帳簿の向こう) */}
          <NoteFolk x={980} y={700} s={1.08} f={f} phase={1} hair="meiji" wear={MK.blue} face="jito" gaze={hit ? [3, 6] : [5, 2]} hideLegs hideArms still />
          {/* 持ち主 */}
          <NoteFolk x={1450} y={760} s={1.08} f={f} phase={3} hair="meiji" kimono wear={MK.green}
            face={hit ? "wide" : f > 60 ? "worried" : "normal"} gaze={hit ? [-6, 6] : [-5, -3]} armL={hit ? 72 : 30} armR={60} hideLegs still />
          <g transform={`translate(${hatHand[0] + 6} ${hatHand[1] + 18}) rotate(${hit ? -18 : -6})`} {...pen}>
            <ellipse cx={0} cy={22} rx={58} ry={12} fill={PAPER} />
            <path d="M -36 22 Q -38 -40 0 -42 Q 38 -40 36 22 Z" fill={PEN} fillOpacity={0.8} />
          </g>
          {/* 机 */}
          <g {...pen}>
            <rect x={200} y={700} width={1520} height={30} fill={PAPER} />
            <rect x={220} y={730} width={1480} height={400} fill={PAPER} />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={260 + i * 480} y={760} width={420} height={140} strokeWidth={4} />
                <circle cx={470 + i * 480} cy={830} r={8} fill={PEN} />
              </g>
            ))}
          </g>
          {/* ランプ */}
          <circle cx={420} cy={572} r={120} fill={MK.yellow} opacity={0.35} />
          <g {...pen}>
            <ellipse cx={420} cy={694} rx={56} ry={12} fill={MK.orange} fillOpacity={0.5} />
            <path d="M 380 690 Q 374 630 420 620 Q 466 630 460 690" fill={MK.blue} fillOpacity={0.4} />
            <path d="M 398 604 Q 390 550 404 504 L 436 504 Q 450 550 442 604 Z" fill={PAPER} />
            <path d="M 420 552 Q 430 570 420 586 Q 410 570 420 552 Z" fill={MK.orange} />
          </g>
          {/* 帳簿 */}
          <g {...pen}>
            <path d="M 700 704 L 960 704 L 960 520 L 730 532 Z" fill={PAPER} />
            <path d="M 960 704 L 1250 704 L 1222 532 L 960 520 Z" fill={PAPER} />
            {Array.from({ length: 9 }).map((_, i) => (
              <g key={i}>
                <path d={`M ${740 + i * 25} ${530 - i * 0.6} L ${722 + i * 26} 702`} stroke={PEN_RED} strokeWidth={2} />
                <path d={`M ${985 + i * 27} ${521 + i * 0.6} L ${985 + i * 30} 702`} stroke={PEN_RED} strokeWidth={2} />
              </g>
            ))}
            {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${742 + i * 25} 556 q 4 30 0 60 q -4 30 2 60`} strokeWidth={3} opacity={0.7} />)}
            {Array.from({ length: 4 }).map((_, i) => <path key={i} d={`M ${994 + i * 28} 548 q 4 30 0 60 q -4 30 2 60`} strokeWidth={3} opacity={0.7} />)}
          </g>
          {hit && <VHand x={slot[0]} y={slot[1] + 4} chars={NAMES[1].chars} size={32} />}
          {hit && (
            <g transform={`translate(1176 640) rotate(-6) scale(${pop(seg(f, SLAM, SLAM + 6))})`}>
              <rect x={-34} y={-34} width={68} height={68} rx={8} fill="none" stroke={PEN_RED} strokeWidth={5} />
              <Hand x={0} y={16} text="済" size={46} color={PEN_RED} />
            </g>
          )}
          {/* 宙の名前 */}
          {NAMES.map((n, i) => {
            const ang = f / 30 + (i * Math.PI * 2) / 3;
            const keep = i === 1;
            const x = lerp(1230 + Math.cos(ang) * 150, slot[0], pull);
            const y = lerp(330 + Math.sin(ang) * 60, slot[1] - 10, pull);
            const burst = hit && !keep ? seg(f, SLAM, SLAM + 26) : 0;
            if (hit && keep) return null;
            const a = seg(f, 6 + i * 6, 20 + i * 6) * (1 - burst);
            const h = n.chars.length * 34 + 30;
            return (
              <g key={i} opacity={Math.max(a, burst > 0 ? 1 - burst : 0)}>
                {burst > 0 && Array.from({ length: 8 }).map((_, j) => {
                  const d = easeOut(burst) * (60 + rnd(j + i * 9) * 80);
                  const th = rnd(j * 3 + i) * Math.PI * 2;
                  return <rect key={j} x={x + Math.cos(th) * d} y={y + Math.sin(th) * d + burst * 40} width={14} height={18} fill={PAPER} stroke={PEN} strokeWidth={2.5} />;
                })}
                {burst === 0 && (
                  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 14 + i) * 6 * (1 - pull)}) scale(${1 - pull * 0.35})`}>
                    <rect x={-30} y={-20} width={60} height={h} rx={4} fill={PAPER} stroke={PEN} strokeWidth={4.5} />
                    <VHand x={0} y={16} chars={n.chars} size={30} />
                    <Hand x={0} y={-34} text={n.label} size={22} opacity={1 - pull} />
                  </g>
                )}
              </g>
            );
          })}
          {/* 判子と腕 */}
          <path d={`M ${sh[0]} ${sh[1]} Q ${(sh[0] + hand[0]) / 2 + 14} ${(sh[1] + hand[1]) / 2} ${hand[0]} ${hand[1]}`} {...pen} />
          <path d={`M ${980 - 42 * 1.08} ${sh[1]} q -10 40 -6 70`} {...pen} />
          <g transform={`translate(${sealX} ${sealY})`} {...pen}>
            <rect x={-30} y={-150} width={60} height={140} rx={24} fill={MK.orange} fillOpacity={0.55} />
            <rect x={-44} y={-16} width={88} height={22} rx={4} fill={PAPER} />
          </g>
          <circle cx={hand[0]} cy={hand[1]} r={10} fill={PAPER} stroke={PEN} strokeWidth={4.5} />
          {/* ドン！ */}
          {hit && f < SLAM + 30 && (
            <g opacity={1 - seg(f, SLAM + 18, SLAM + 30)}>
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (i / 10) * Math.PI * 2;
                const r1 = 90 + seg(f, SLAM, SLAM + 8) * 30;
                return <path key={i} d={`M ${1112 + Math.cos(a) * r1} ${626 + Math.sin(a) * r1 * 0.5} l ${Math.cos(a) * 40} ${Math.sin(a) * 20}`} stroke={PEN} strokeWidth={5} strokeLinecap="round" />;
              })}
              <Hand x={1300} y={470} text="ドン！" size={58} color={PEN_RED} rot={-8} />
            </g>
          )}
        </g>
      </g>
      <FileTag no="02" title="名前を奪われるのは、なぜ怖いのか" f={f} />
      <Caption f={f} text={!hit ? "それまで、名前は一生のうちに何度も変わった" : "明治、名前は一人ひとつに決められた"} />
    </svg>
  );
};

// ========== 3. その名前は、誰のものなのか ==========
const BULBS: [number, number][] = (() => {
  const b: [number, number][] = [];
  for (let i = 0; i < 20; i++) { b.push([600 + i * 38.5, 176]); b.push([600 + i * 38.5, 344]); }
  for (let j = 1; j < 4; j++) { b.push([596, 176 + j * 42]); b.push([1328, 176 + j * 42]); }
  return b;
})();
export const NoteNameC: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 6, 130));
  const sc = 1 + k * 0.2;
  const cx = lerp(960, 990, k);
  const cy = lerp(540, 480, k);
  const wob = seg(f, 30, 60);
  const take = easeInOut(seg(f, 60, 88));
  const offLine = lerp(1380, 880, seg(f, 74, 146));
  const worried = f > 54;
  const wHand = noteHand(1470, 560, 0.95, -1, 125);
  const eNow: [number, number] = [lerp(1160, wHand[0] - 46, take), lerp(260, wHand[1] + 54, take)];
  const eRot = Math.sin(f / 2.2) * 4 * wob * (1 - take) + take * -16;
  const Letter: React.FC<{ c: string }> = ({ c }) => (
    <g>
      <rect x={-76} y={-66} width={152} height={132} rx={8} fill={PAPER} stroke={PEN} strokeWidth={5} />
      <Hand x={0} y={40} text={c} size={110} color={PEN_RED} />
    </g>
  );
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={61} f={f} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <NotePaper />
        <g filter="url(#ywobbleNote)">
          {/* 奥の幕 */}
          <rect x={240} y={60} width={1440} height={640} fill={MK.pink} opacity={0.3} />
          {Array.from({ length: 24 }).map((_, i) => (
            <path key={i} d={`M ${270 + i * 60} 60 Q ${276 + i * 60} 380 ${266 + i * 60} 700`} stroke={PEN} strokeWidth={3} fill="none" opacity={0.6} />
          ))}
          {/* 舞台 */}
          <g {...pen}>
            <path d="M 200 690 L 1720 690 L 1980 880 L -60 880 Z" fill={PAPER} />
            {Array.from({ length: 15 }).map((_, i) => <path key={i} d={`M ${300 + i * 101} 692 L ${76 + i * 136} 878`} strokeWidth={2.5} opacity={0.5} />)}
            <path d="M -100 880 L 2020 880 M -100 912 L 2020 912" />
            <path d="M 880 772 l 40 0 M 900 760 l 0 24" stroke={PEN_RED} />
          </g>
          {/* スポットライト */}
          <polygon points="900,-60 1020,-60 1170,770 650,770" fill={MK.yellow} opacity={0.35} />
          <ellipse cx={910} cy={772} rx={250} ry={48} fill={MK.yellow} opacity={0.5} />
          {/* 看板 */}
          <g {...pen}>
            <path d="M 640 -40 L 640 160 M 1280 -40 L 1280 160" strokeWidth={3} />
            <rect x={584} y={160} width={756} height={200} rx={10} fill={PAPER} />
          </g>
          {take > 0.2 && (
            <g opacity={seg(f, 66, 80)}>
              <rect x={1080} y={196} width={160} height={128} rx={6} fill="none" stroke={PEN} strokeWidth={3} strokeDasharray="10 8" />
              {[[1098, 210], [1222, 210], [1098, 310], [1222, 310]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={PEN} />)}
            </g>
          )}
          {["ナ", "マ"].map((c, i) => (
            <g key={i} transform={`translate(${760 + i * 200} 260) rotate(${i === 1 && f > 118 ? Math.sin(f / 1.8) * 2.5 : 0})`}><Letter c={c} /></g>
          ))}
          {BULBS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={10} fill={x < offLine ? MK.yellow : PAPER} stroke={PEN} strokeWidth={3} />
          ))}
          {/* 契約の紙 */}
          <g transform={`translate(470 236) rotate(${Math.sin(f / 18) * 5})`} {...pen}>
            <path d="M 170 -90 L 32 0" strokeWidth={2.5} />
            <rect x={0} y={0} width={64} height={86} fill={PAPER} strokeWidth={3.5} />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M 10 ${36 + i * 12} L 54 ${36 + i * 12}`} strokeWidth={2.5} />)}
          </g>
          <Hand x={502} y={256} text="契約" size={16} />
          {/* 脚立 */}
          <g {...pen} stroke="#5A6A88">
            <path d="M 1410 790 L 1468 290 M 1560 790 L 1486 290" strokeWidth={8} />
            {Array.from({ length: 8 }).map((_, i) => {
              const t = (i + 1) / 9;
              const y = lerp(790, 290, t);
              return <path key={i} d={`M ${lerp(1410, 1468, t)} ${y} L ${lerp(1560, 1486, t)} ${y}`} strokeWidth={5} />;
            })}
          </g>
          {/* 本人 */}
          <NoteFolk x={910} y={772} s={1.05} f={f} phase={2} hair="bob" wear={MK.green}
            face={worried ? "wide" : "normal"} gaze={worried ? [6, -6] : [2, -3]} armR={worried ? -150 : -20} armL={8} />
          {/* 作業員 */}
          <NoteFolk x={1470} y={560} s={0.95} f={f} phase={5} hair="work" wear={MK.blue} face="normal" gaze={[-6, -2]} armL={125} armR={-20} still />
          <g transform={`translate(${eNow[0]} ${eNow[1]}) rotate(${eRot}) scale(${lerp(1, 0.78, take)})`}><Letter c="エ" /></g>
          {/* 幕 (左右とたれ幕) */}
          {[-1, 1].map((side) => (
            <g key={side} transform={side === 1 ? "translate(1920 0) scale(-1 1)" : undefined} {...pen}>
              <path d="M -120 -40 L 300 -40 Q 250 300 282 600 Q 300 760 250 900 L -120 900 Z" fill={MK.pink} fillOpacity={0.5} />
              {[60, 140, 210].map((x, i) => <path key={i} d={`M ${x} -40 Q ${x - 20 + i * 4} 400 ${x - 30 + i * 10} 900`} strokeWidth={3.5} />)}
            </g>
          ))}
          <path d={`M -100 -40 L 2020 -40 L 2020 70 ${Array.from({ length: 14 }).map((_, i) => `Q ${1950 - i * 150} 120 ${1880 - i * 150} 70`).join(" ")} L -100 70 Z`}
            fill={MK.pink} fillOpacity={0.6} {...{ stroke: PEN, strokeWidth: 5, strokeLinejoin: "round" }} />
          {/* 客席 (奥) */}
          {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${440 + i * 170} 1050 L ${440 + i * 170} 940 Q ${515 + i * 170} 890 ${590 + i * 170} 940 L ${590 + i * 170} 1050`} {...pen} fill={PAPER} />)}
          {/* 語り手 */}
          <NoteFolk x={330} y={1060} s={1.06} f={f} hair="hood" face="jito" gaze={[6, -3]} armL={6} armR={-8} />
          {/* 客席 (手前) */}
          {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${400 + i * 200} 1130 L ${400 + i * 200} 1010 Q ${491 + i * 200} 950 ${582 + i * 200} 1010 L ${582 + i * 200} 1130`} {...pen} fill={PAPER} />)}
          {/* 書きこみ */}
          <Hand x={1060} y={560} text="？" size={70} color={PEN_RED} opacity={seg(f, 70, 80)} rot={10} />
          <Arrow x1={1250} y1={600} x2={1300} y2={530} bend={-16} t={seg(f, 90, 102)} />
          <Hand x={1200} y={640} text="はずされた…" size={30} rot={-4} opacity={seg(f, 96, 104)} />
        </g>
      </g>
      <FileTag no="02" title="名前を奪われるのは、なぜ怖いのか" f={f} />
      <Caption f={f} text={f < 70 ? "名前に人が集まると、名前に値段がつく" : "その名前は、誰のものなのか"} />
    </svg>
  );
};
