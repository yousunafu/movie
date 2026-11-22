// 夜の深掘り 試作: 名前回 2枚目 (山)「明治、名前は一人ひとつに決められた」(戸籍) ※年・制度は要ファクトチェック
// 6点法: 寄る (役場全体 → 帳簿) / 世界 (明治の役場の夜・ランプ・縦長の窓の外にガス灯・振り子時計)
//        部品 (戸籍の帳簿の罫と縦書き・石油ランプのほや・判子) / カメラ (寄り + 判子の瞬間に揺れる)
//        事件 (一生のうちに変わってきた3つの名前が、判子ひとつで1つに固定される)
//        人の反応 (持ち主が帽子を握りしめて目を見開く・役人は淡々と)
import React from "react";
import {
  W, H, YRP, MINCHO, seg, easeInOut, easeOut, pop, lerp, rnd,
  YoruDefs, NightFinish, Caption, FileTag, Folk, folkHand, Dust, useMood,
} from "./YoruShared";

const BRUSH = "'Hiragino Mincho ProN', 'Yu Mincho', serif";
// 架空の人物の、一生の名前 (幼名 → 大人の名 → 隠居の名)
const NAMES = [
  { chars: ["竹", "丸"], label: "子どものころ" },
  { chars: ["新", "之", "助"], label: "大人になって" },
  { chars: ["一", "斎"], label: "隠居して" },
];
const SLAM = 86;

export const NameB: React.FC<{ f: number }> = ({ f }) => {
  const dusk = useMood() === "dusk";
  const k = easeInOut(seg(f, 6, 120));
  const shake = f >= SLAM && f < SLAM + 10 ? Math.sin((f - SLAM) * 3.1) * (10 - (f - SLAM)) * 1.6 : 0;
  const sc = 1 + k * 0.28;
  const cx = lerp(960, 980, k) + shake;
  const cy = lerp(540, 560, k) + shake * 0.6;
  const flame = 1 + Math.sin(f / 4) * 0.05 + Math.sin(f / 2.7) * 0.03;
  // 判子: 振り上げ (40〜76) → 振り下ろし (76〜86)
  const raise = easeOut(seg(f, 40, 70));
  const drop = seg(f, 76, SLAM);
  const sealY = lerp(lerp(700, 470, raise), 626, drop * drop);
  const sealX = lerp(lerp(1104, 1084, raise), 1112, drop);
  const hit = f >= SLAM;
  const pull = easeInOut(seg(f, 70, SLAM)); // 名前が帳簿へ吸い寄せられる
  // 帳簿の固定された欄 (右ページ)
  const slot: [number, number] = [1120, 560];

  // 役人の右肩 → 判子をにぎる手 (腕は肩から手まで1本で描く)
  const sh: [number, number] = [980 + 59 * 1.08, 700 - 154 * 1.08];
  const hand: [number, number] = [sealX, sealY - 90];
  const armLen = Math.hypot(hand[0] - sh[0], hand[1] - sh[1]);
  const armAng = (Math.atan2(-(hand[0] - sh[0]), hand[1] - sh[1]) * 180) / Math.PI;
  const hatHand = folkHand(1450, 760, 1.08, 1, 60);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={53} f={f} />
      <defs>
        <radialGradient id="lampB" cx="420" cy="520" r="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD08A" stopOpacity={0.6} />
          <stop offset="40%" stopColor="#FFB45A" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#FFB45A" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="winB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dusk ? "#6A5A8A" : "#1B2742"} />
          <stop offset="100%" stopColor={dusk ? "#F2A26A" : "#2A3A5C"} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={YRP.night0} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <g filter="url(#ywobble)">
          {/* ===== 壁 (しっくい + 腰板) ===== */}
          <rect x={-200} y={-200} width={2400} height={900} fill={dusk ? "#C9B48E" : "#2A2C33"} />
          <rect x={-200} y={470} width={2400} height={230} fill={dusk ? "#6A4A34" : "#3A2A20"} />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1={-200 + i * 110} y1={470} x2={-200 + i * 110} y2={700} stroke="#2A1E16" strokeWidth={5} />
          ))}
          <rect x={-200} y={460} width={2400} height={16} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
          {/* 縦長の洋風の窓 + 外のガス灯 */}
          <g>
            <rect x={1500} y={90} width={250} height={350} fill="url(#winB)" stroke={YRP.ink} strokeWidth={6} />
            <line x1={1625} y1={90} x2={1625} y2={440} stroke="#3A2C22" strokeWidth={10} />
            {[1, 2, 3].map((i) => <line key={i} x1={1500} y1={90 + i * 88} x2={1750} y2={90 + i * 88} stroke="#3A2C22" strokeWidth={6} />)}
            <line x1={1560} y1={200} x2={1560} y2={440} stroke="#141A2A" strokeWidth={8} />
            <rect x={1540} y={170} width={40} height={40} fill="#FFE2A0" opacity={0.9} />
            <circle cx={1560} cy={190} r={50} fill="#FFE2A0" opacity={0.18} filter="url(#yglow)" />
            <rect x={1486} y={436} width={278} height={20} fill="#4A3526" stroke={YRP.ink} strokeWidth={4} />
          </g>
          {/* 振り子時計 */}
          <g transform="translate(150 150)">
            <rect x={-70} y={0} width={140} height={250} rx={10} fill="#4A3020" stroke={YRP.ink} strokeWidth={5} />
            <circle cx={0} cy={60} r={48} fill="#E9E0C8" stroke={YRP.ink} strokeWidth={4} />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={Math.sin(a) * 38} y1={60 - Math.cos(a) * 38} x2={Math.sin(a) * 43} y2={60 - Math.cos(a) * 43} stroke={YRP.ink} strokeWidth={i % 3 === 0 ? 4 : 2} />;
            })}
            <line x1={0} y1={60} x2={20} y2={44} stroke={YRP.ink} strokeWidth={5} strokeLinecap="round" />
            <line x1={0} y1={60} x2={-6} y2={24} stroke={YRP.ink} strokeWidth={3.5} strokeLinecap="round" />
            <rect x={-40} y={124} width={80} height={110} fill="#2A1C14" stroke={YRP.ink} strokeWidth={3} />
            <g transform={`rotate(${Math.sin(f / 9) * 14} 0 128)`}>
              <line x1={0} y1={128} x2={0} y2={206} stroke="#C9A44A" strokeWidth={4} />
              <circle cx={0} cy={210} r={14} fill="#D9B23C" stroke={YRP.ink} strokeWidth={3} />
            </g>
          </g>
          {/* 掲示 (布告の紙) */}
          {/* 帳簿の棚 */}
          <g transform="translate(330 150)">
            <rect x={0} y={0} width={470} height={300} fill="#3A2A1E" stroke={YRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <rect x={8} y={8 + r * 98} width={454} height={86} fill="#21180F" />
                {Array.from({ length: 13 }).map((_, i) => (
                  <g key={i}>
                    <rect x={16 + i * 34} y={18 + r * 98 + (i % 4 === 0 ? 6 : 0)} width={30} height={76 - (i % 4 === 0 ? 6 : 0)} fill={["#6A5A44", "#5A4A3A", "#74624A", "#4E4436"][(i + r) % 4]} stroke={YRP.ink} strokeWidth={2.5} />
                    <rect x={22 + i * 34} y={32 + r * 98} width={18} height={30} fill="#D6CCB2" opacity={0.75} />
                  </g>
                ))}
                <rect x={0} y={94 + r * 98} width={470} height={10} fill="#4A3526" stroke={YRP.ink} strokeWidth={3} />
              </g>
            ))}
          </g>
          <g transform="translate(1190 120) rotate(-2)">
            <rect x={0} y={0} width={180} height={240} fill="#D6CCB2" stroke={YRP.ink} strokeWidth={4} />
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={i} x1={150 - i * 24} y1={30} x2={150 - i * 24} y2={210 - (i % 3) * 30} stroke="#5A5048" strokeWidth={5} opacity={0.6} />
            ))}
            <circle cx={20} cy={14} r={6} fill="#8A6A3A" />
            <circle cx={160} cy={14} r={6} fill="#8A6A3A" />
          </g>
          {/* ===== 役人 (机の向こう) ===== */}
          <g filter="url(#yrim)">
            <Folk x={980} y={700} s={1.08} f={f} phase={1} hair="meiji" cloth="#2E3446" clothDark="#232836"
              face="jito" gaze={hit ? [3, 6] : [5, 2]} armL={14} armR={armAng} hideLegs still />
          </g>
          {/* 持ち主 (机の向こう、右) */}
          <g filter="url(#yrim)">
            <Folk x={1450} y={760} s={1.08} f={f} phase={3} hair="meiji" kimono cloth="#4F5A4A" obi="#2A2E26"
              face={hit ? "wide" : f > 60 ? "worried" : "normal"} gaze={hit ? [-6, 6] : [-5, -3]}
              armL={hit ? 72 : 30} armR={60} hideLegs still />
          </g>
          {/* 山高帽 (持ち主の右手に) */}
          <g transform={`translate(${hatHand[0] + 6} ${hatHand[1] + 18}) rotate(${hit ? -18 : -6})`}>
            <ellipse cx={0} cy={22} rx={58} ry={12} fill="#24242A" stroke={YRP.ink} strokeWidth={4} />
            <path d="M -36 22 Q -38 -40 0 -42 Q 38 -40 36 22 Z" fill="#2E2E36" stroke={YRP.ink} strokeWidth={4.5} />
            <rect x={-36} y={6} width={72} height={10} fill="#5A3A3A" />
          </g>
          {/* ===== 机 ===== */}
          <rect x={200} y={700} width={1520} height={30} fill="#5A4130" stroke={YRP.ink} strokeWidth={5} />
          <rect x={220} y={730} width={1480} height={400} fill="#4A3526" stroke={YRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={260 + i * 480} y={760} width={420} height={140} fill="#423022" stroke={YRP.ink} strokeWidth={4} />
              <circle cx={470 + i * 480} cy={830} r={9} fill="#B9A06A" stroke={YRP.ink} strokeWidth={2.5} />
            </g>
          ))}
          {/* 石油ランプ */}
          <g transform="translate(420 700)">
            <ellipse cx={0} cy={-6} rx={56} ry={12} fill="#9A7A3A" stroke={YRP.ink} strokeWidth={4} />
            <path d="M -40 -10 Q -46 -70 0 -80 Q 46 -70 40 -10 Z" fill="#7FA8B8" opacity={0.65} stroke={YRP.ink} strokeWidth={4} />
            <rect x={-26} y={-96} width={52} height={18} fill="#C9A44A" stroke={YRP.ink} strokeWidth={3.5} />
            <path d="M -22 -96 Q -30 -150 -16 -196 L 16 -196 Q 30 -150 22 -96 Z" fill="#F4F0E0" opacity={0.35} stroke={YRP.ink} strokeWidth={3.5} />
            <ellipse cx={0} cy={-128} rx={9 * flame} ry={20 * flame} fill="#FFE9A8" />
            <circle cx={0} cy={-128} r={70} fill="#FFD08A" opacity={0.35} filter="url(#yglow)" />
          </g>
          {/* 硯と筆 */}
          <rect x={540} y={676} width={80} height={26} rx={4} fill="#26232A" stroke={YRP.ink} strokeWidth={3} />
          <line x1={636} y1={696} x2={700} y2={664} stroke="#7A5A3A" strokeWidth={6} strokeLinecap="round" />
          {/* ===== 戸籍の帳簿 (開いた大きな帳面) ===== */}
          <g>
            <path d="M 700 704 L 960 704 L 960 520 L 730 532 Z" fill="#E6DCC2" stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 960 704 L 1250 704 L 1222 532 L 960 520 Z" fill="#EDE4CC" stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
            {/* 赤い罫 (縦) */}
            {Array.from({ length: 9 }).map((_, i) => (
              <g key={i}>
                <line x1={740 + i * 25} y1={530 - i * 0.6} x2={722 + i * 26} y2={702} stroke="#C0544A" strokeWidth={2} opacity={0.7} />
                <line x1={985 + i * 27} y1={521 + i * 0.6} x2={985 + i * 30} y2={702} stroke="#C0544A" strokeWidth={2} opacity={0.7} />
              </g>
            ))}
            {/* 書かれた架空の名前 (左ページ) */}
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={i} opacity={0.75}>
                {[0, 1, 2].map((j) => (
                  <rect key={j} x={746 + i * 25 - 4} y={556 + j * 34 + (i % 2) * 6} width={9} height={22} fill="#3E3A36" opacity={0.6 + rnd(i * 3 + j) * 0.3} />
                ))}
              </g>
            ))}
            {/* 右ページ: 前の欄はすでに埋まっている */}
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i} opacity={0.75}>
                {[0, 1, 2].map((j) => (
                  <rect key={j} x={994 + i * 28 - 4} y={548 + j * 34} width={9} height={22} fill="#3E3A36" opacity={0.6 + rnd(i * 5 + j) * 0.3} />
                ))}
              </g>
            ))}
            <line x1={960} y1={520} x2={960} y2={704} stroke={YRP.ink} strokeWidth={4} />
            {/* 固定された名前 */}
            {hit && (
              <g>
                {NAMES[1].chars.map((c, i) => (
                  <text key={i} x={slot[0]} y={slot[1] + i * 36} textAnchor="middle" fontFamily={BRUSH} fontWeight={800} fontSize={32} fill="#1E1A16">{c}</text>
                ))}
              </g>
            )}
            {/* 判子の跡 */}
            {hit && (
              <g transform={`translate(1176 640) rotate(-6) scale(${pop(seg(f, SLAM, SLAM + 6))})`} opacity={0.9}>
                <rect x={-34} y={-34} width={68} height={68} rx={6} fill="none" stroke={YRP.red} strokeWidth={6} />
                <text x={0} y={16} textAnchor="middle" fontFamily={BRUSH} fontWeight={900} fontSize={46} fill={YRP.red}>済</text>
              </g>
            )}
          </g>
        </g>
        {/* ===== 宙に浮かぶ、一生の名前 ===== */}
        {NAMES.map((n, i) => {
          const ang = f / 30 + (i * Math.PI * 2) / 3;
          const ox = 1230 + Math.cos(ang) * 150;
          const oy = 330 + Math.sin(ang) * 60;
          const keep = i === 1;
          const x = lerp(ox, slot[0], pull);
          const y = lerp(oy, slot[1] - 10, pull);
          const burst = hit && !keep ? seg(f, SLAM, SLAM + 26) : 0;
          if (hit && keep) return null;
          const a = seg(f, 6 + i * 6, 20 + i * 6) * (1 - burst);
          if (a <= 0 && burst > 0) return null;
          const h = n.chars.length * 34 + 30;
          return (
            <g key={i} opacity={a}>
              {/* 破れて散る紙片 */}
              {burst > 0 && Array.from({ length: 8 }).map((_, j) => {
                const d = easeOut(burst) * (60 + rnd(j + i * 9) * 80);
                const th = rnd(j * 3 + i) * Math.PI * 2;
                return <rect key={j} x={x + Math.cos(th) * d} y={y + Math.sin(th) * d + burst * 40} width={14} height={18} fill={YRP.paper} stroke={YRP.ink} strokeWidth={2} transform={`rotate(${j * 40 + burst * 200} ${x + Math.cos(th) * d} ${y + Math.sin(th) * d})`} />;
              })}
              <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 14 + i) * 6 * (1 - pull)}) scale(${(1 - burst * 0.4) * (1 - pull * 0.35)})`}>
                <rect x={-30} y={-20} width={60} height={h} rx={4} fill={YRP.paper} stroke={YRP.ink} strokeWidth={4} filter="url(#yrim)" />
                {n.chars.map((c, j) => (
                  <text key={j} x={0} y={16 + j * 34} textAnchor="middle" fontFamily={BRUSH} fontWeight={800} fontSize={30} fill="#1E1A16">{c}</text>
                ))}
                <text x={0} y={-34} textAnchor="middle" fontFamily={MINCHO} fontWeight={600} fontSize={22} fill={YRP.paper} opacity={1 - pull}>{n.label}</text>
              </g>
            </g>
          );
        })}
        {/* ===== 判子 ===== */}
        <g transform={`translate(${sealX} ${sealY})`}>
          <rect x={-30} y={-150} width={60} height={140} rx={24} fill="#8A5A34" stroke={YRP.ink} strokeWidth={5} />
          <rect x={-22} y={-140} width={14} height={110} rx={7} fill="#B07A4A" opacity={0.6} />
          <rect x={-44} y={-16} width={88} height={22} rx={4} fill="#6A4428" stroke={YRP.ink} strokeWidth={4.5} />
          <rect x={-44} y={4} width={88} height={8} fill={YRP.red} opacity={0.8} />
        </g>
        {/* 判子をにぎる腕と手 */}
        <rect x={sh[0] - 12} y={sh[1]} width={24} height={armLen} rx={12} fill="#2E3446" stroke={YRP.ink} strokeWidth={4.5}
          transform={`rotate(${armAng} ${sh[0]} ${sh[1]})`} />
        <circle cx={hand[0]} cy={hand[1]} r={13} fill={YRP.skin} stroke={YRP.ink} strokeWidth={4} />
        {/* 衝撃の輪 */}
        {hit && f < SLAM + 22 && [0, 1].map((i) => {
          const t = seg(f, SLAM + i * 4, SLAM + 18 + i * 4);
          return <ellipse key={i} cx={1080} cy={630} rx={60 + t * 320} ry={16 + t * 70} fill="none" stroke={YRP.glow} strokeWidth={6 * (1 - t)} opacity={1 - t} />;
        })}
        <rect x={-200} y={-200} width={2400} height={1500} fill={dusk ? "#7A3A2A" : "#0A0D16"} opacity={dusk ? 0.12 : 0.28} />
        {dusk && <polygon points="1500,90 1750,90 1500,1000 900,1000" fill="#F2A26A" opacity={0.16} style={{ mixBlendMode: "screen" }} />}
        <rect x={-200} y={-200} width={2400} height={1500} fill="url(#lampB)" style={{ mixBlendMode: "screen" }} />
        <Dust f={f} x={300} y={300} w={700} h={400} n={16} color="#FFE2A8" seed={11} />
      </g>
      <NightFinish grain={0.07} />
      <FileTag no="02" title="名前を奪われるのは、なぜ怖いのか" f={f} />
      <Caption f={f} text={!hit ? "それまで、名前は一生のうちに何度も変わった" : "明治、名前は一人ひとつに決められた"} />
    </svg>
  );
};

