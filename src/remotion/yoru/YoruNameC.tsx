// 夜の深掘り 試作: 名前回 3枚目 (山)「その名前は、誰のものなのか」(芸名)
// 6点法: 寄る (客席から → 看板と本人へ) / 世界 (終演後の劇場・赤い幕・スポットライト・電球の看板・客席)
//        部品 (看板の電球と立体文字・脚立・幕のひだ) / カメラ (ゆっくり寄る)
//        事件 (看板の文字が1つ外され、電球が右から消えていく) / 人の反応 (本人が見上げて手を伸ばす・語り手は客席の通路から見ている)
// ★実在の人物・名前は出さない。看板の文字は「ナマエ」。作業員は悪者にしない (淡々と仕事をしている)
import React from "react";
import {
  W, H, YRP, GOTHIC, MINCHO, seg, easeInOut, lerp,
  YoruDefs, NightFinish, Caption, FileTag, Folk, folkHand, Narrator, Dust, useMood,
} from "./YoruShared";

const LETTERS = ["ナ", "マ", "エ"];

// 看板の電球の位置
const BULBS: [number, number][] = (() => {
  const b: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    b.push([600 + i * 38.5, 176]);
    b.push([600 + i * 38.5, 344]);
  }
  for (let j = 1; j < 4; j++) {
    b.push([596, 176 + j * 42]);
    b.push([1328, 176 + j * 42]);
  }
  return b;
})();

export const NameC: React.FC<{ f: number }> = ({ f }) => {
  const dusk = useMood() === "dusk";
  const k = easeInOut(seg(f, 6, 130));
  const sc = 1 + k * 0.2;
  const cx = lerp(960, 990, k);
  const cy = lerp(540, 480, k);
  // 「エ」を外す: 30〜60 でぐらつき、60〜88 で作業員の手へ
  const wob = seg(f, 30, 60);
  const take = easeInOut(seg(f, 60, 88));
  const offLine = lerp(1380, 880, seg(f, 74, 146)); // この x より右の電球が消える
  const worried = f > 54;
  const wHand = folkHand(1470, 560, 0.95, -1, 125);
  const eHome: [number, number] = [1160, 260];
  const eNow: [number, number] = [lerp(eHome[0], wHand[0] - 46, take), lerp(eHome[1], wHand[1] + 54, take)];
  const eRot = Math.sin(f / 2.2) * 4 * wob * (1 - take) + take * -16;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={61} f={f} />
      <defs>
        <linearGradient id="spotC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF2CC" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#FFF2CC" stopOpacity={0.06} />
        </linearGradient>
        <radialGradient id="poolC" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFF2CC" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFF2CC" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="signGlow" cx="960" cy="260" r="700" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD890" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#FFD890" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={dusk ? "#3A2420" : "#0C0A0E"} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <g filter="url(#ywobble)">
          {/* ===== 奥の幕 ===== */}
          <rect x={240} y={60} width={1440} height={640} fill="#4A141B" />
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={240 + i * 60} y={60} width={30} height={640} fill={i % 2 ? "#5A1820" : "#40111A"} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <path key={`l${i}`} d={`M ${270 + i * 60} 60 Q ${276 + i * 60} 380 ${266 + i * 60} 700`} stroke="#2E0A10" strokeWidth={4} fill="none" />
          ))}
          {/* ===== 舞台の床 ===== */}
          <polygon points="200,690 1720,690 1980,880 -60,880" fill="#5A4130" />
          {Array.from({ length: 16 }).map((_, i) => {
            const xt = 200 + i * 101;
            const xb = -60 + i * 136;
            return <line key={i} x1={xt} y1={690} x2={xb} y2={880} stroke="#46321F" strokeWidth={4} />;
          })}
          {[740, 800].map((y) => <line key={y} x1={-60} y1={y} x2={1980} y2={y} stroke="#46321F" strokeWidth={3} opacity={0.6} />)}
          <rect x={-100} y={876} width={2120} height={40} fill="#22180F" stroke={YRP.ink} strokeWidth={5} />
          {/* バミリ (立ち位置の印) */}
          <path d="M 880 772 l 40 0 M 900 760 l 0 24" stroke="#E9C77A" strokeWidth={6} opacity={0.7} />
          {/* ===== 看板をつるす線 ===== */}
          <line x1={640} y1={-40} x2={640} y2={160} stroke="#5A5A62" strokeWidth={4} />
          <line x1={1280} y1={-40} x2={1280} y2={160} stroke="#5A5A62" strokeWidth={4} />
          {/* 契約の紙 (線からぶら下がる) */}
          <g transform={`translate(470 236) rotate(${Math.sin(f / 18) * 5})`}>
            <line x1={170} y1={-90} x2={32} y2={0} stroke="#8A8A90" strokeWidth={2} />
            <rect x={0} y={0} width={64} height={86} fill="#E6DECB" stroke={YRP.ink} strokeWidth={3} />
            <text x={32} y={22} textAnchor="middle" fontFamily={MINCHO} fontWeight={800} fontSize={16} fill="#2B2420">契約</text>
            {[0, 1, 2, 3].map((i) => <line key={i} x1={10} y1={36 + i * 12} x2={54} y2={36 + i * 12} stroke="#6A625A" strokeWidth={2.5} />)}
            <circle cx={48} cy={76} r={6} fill="none" stroke={YRP.red} strokeWidth={2.5} />
          </g>
          {/* ===== 看板 ===== */}
          <rect x={584} y={160} width={756} height={200} rx={10} fill="#2A2420" stroke={YRP.ink} strokeWidth={6} />
          <rect x={612} y={190} width={700} height={140} rx={6} fill="#3A2E26" stroke={YRP.ink} strokeWidth={3} />
          {/* 外された「エ」の跡 (ねじ穴) */}
          {take > 0.2 && (
            <g opacity={seg(f, 66, 80)}>
              <rect x={1080} y={196} width={160} height={128} rx={6} fill="none" stroke="#5A4A3E" strokeWidth={3} strokeDasharray="10 8" />
              {[[1098, 210], [1222, 210], [1098, 310], [1222, 310]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={6} fill="#141012" stroke="#5A4A3E" strokeWidth={2} />
              ))}
            </g>
          )}
          {/* 立体文字 (ナ・マ は看板に残る) */}
          {LETTERS.slice(0, 2).map((c, i) => {
            const x = 760 + i * 200;
            const tremble = i === 1 && f > 118 ? Math.sin(f / 1.8) * 2.5 : 0;
            return (
              <g key={i} transform={`translate(${x} 260) rotate(${tremble})`}>
                <rect x={-72} y={-62} width={152} height={132} rx={8} fill="#1E1814" transform="translate(8 8)" />
                <rect x={-76} y={-66} width={152} height={132} rx={8} fill="#F2E6C8" stroke={YRP.ink} strokeWidth={5} />
                <text x={0} y={42} textAnchor="middle" fontFamily={GOTHIC} fontWeight={900} fontSize={118} fill="#7A1E26">{c}</text>
              </g>
            );
          })}
          {/* 電球 */}
          {BULBS.map(([x, y], i) => {
            const on = x < offLine;
            const tw = 0.85 + 0.15 * Math.sin(f / 3 + i);
            return (
              <g key={i}>
                {on && <circle cx={x} cy={y} r={20} fill="#FFE2A0" opacity={0.35 * tw} filter="url(#yglowS)" />}
                <circle cx={x} cy={y} r={9} fill={on ? "#FFF0C0" : "#4A4038"} stroke={YRP.ink} strokeWidth={2.5} />
              </g>
            );
          })}
          {/* ===== 脚立 ===== */}
          <g stroke={YRP.ink} strokeWidth={4}>
            <line x1={1410} y1={790} x2={1468} y2={290} stroke="#9AA0A6" strokeWidth={14} strokeLinecap="round" />
            <line x1={1560} y1={790} x2={1486} y2={290} stroke="#9AA0A6" strokeWidth={14} strokeLinecap="round" />
            {Array.from({ length: 8 }).map((_, i) => {
              const t = (i + 1) / 9;
              const y = lerp(790, 290, t);
              return <line key={i} x1={lerp(1410, 1468, t)} y1={y} x2={lerp(1560, 1486, t)} y2={y} stroke="#80868C" strokeWidth={9} />;
            })}
            <rect x={1452} y={276} width={52} height={20} rx={4} fill="#80868C" />
          </g>
        </g>
        {/* ===== スポットライト ===== */}
        <polygon points="900,-60 1020,-60 1170,770 650,770" fill="url(#spotC)" style={{ mixBlendMode: "screen" }} />
        <ellipse cx={910} cy={772} rx={250} ry={48} fill="url(#poolC)" style={{ mixBlendMode: "screen" }} />
        <rect x={-200} y={-200} width={2400} height={1500} fill="url(#signGlow)" opacity={lerp(1, 0.45, seg(f, 74, 146))} style={{ mixBlendMode: "screen" }} />
        <Dust f={f} x={700} y={60} w={420} h={680} n={30} color="#FFF2CC" seed={13} />
        <g filter="url(#ywobble)">
          {/* ===== 本人 (スポットライトの中) ===== */}
          <g filter="url(#yrim)">
            <Folk x={910} y={772} s={1.05} f={f} phase={2} hair="bob" hairColor="#3A2A24" cloth="#2F6E7A" clothDark="#22323A"
              face={worried ? "wide" : "normal"} gaze={worried ? [6, -6] : [2, -3]} armR={worried ? -150 : -20} armL={8} />
          </g>
          {[0, 1, 2].map((i) => <circle key={i} cx={910} cy={772 - 150 + i * 30} r={5} fill="#D9B23C" stroke={YRP.ink} strokeWidth={2} />)}
          {/* ===== 作業員 (脚立の上。淡々と) ===== */}
          <g filter="url(#yrim)">
            <Folk x={1470} y={560} s={0.95} f={f} phase={5} hair="cap" capColor="#3A4F6A" cloth="#4F6275" clothDark="#3A4A5A"
              face="normal" gaze={[-6, -2]} armL={125} armR={-20} still />
          </g>
          {/* 外される「エ」 */}
          <g transform={`translate(${eNow[0]} ${eNow[1]}) rotate(${eRot}) scale(${lerp(1, 0.78, take)})`}>
            <rect x={-72} y={-62} width={152} height={132} rx={8} fill="#1E1814" transform="translate(8 8)" />
            <rect x={-76} y={-66} width={152} height={132} rx={8} fill="#F2E6C8" stroke={YRP.ink} strokeWidth={5} />
            <text x={0} y={42} textAnchor="middle" fontFamily={GOTHIC} fontWeight={900} fontSize={118} fill="#7A1E26">{LETTERS[2]}</text>
          </g>
          <circle cx={wHand[0]} cy={wHand[1]} r={10} fill={YRP.skin} stroke={YRP.ink} strokeWidth={4} />
          {/* ===== 幕 (左右とたれ幕) ===== */}
          {[-1, 1].map((side) => (
            <g key={side} transform={side === 1 ? "translate(1920 0) scale(-1 1)" : undefined}>
              <path d="M -120 -40 L 300 -40 Q 250 300 282 600 Q 300 760 250 900 L -120 900 Z" fill="#7A1E26" stroke={YRP.ink} strokeWidth={5} />
              {[40, 110, 180, 240].map((x, i) => (
                <path key={i} d={`M ${x} -40 Q ${x - 20 + i * 4} 400 ${x - 30 + i * 10} 900`} stroke="#5A141B" strokeWidth={12} fill="none" />
              ))}
              {[70, 150, 210].map((x, i) => (
                <path key={i} d={`M ${x} -40 Q ${x - 14} 400 ${x - 20 + i * 8} 900`} stroke="#9A2E36" strokeWidth={6} fill="none" opacity={0.6} />
              ))}
            </g>
          ))}
          <path d={`M -100 -40 L 2020 -40 L 2020 70 ${Array.from({ length: 14 }).map((_, i) => `Q ${1950 - i * 150} 120 ${1880 - i * 150} 70`).join(" ")} L -100 70 Z`}
            fill="#8A222C" stroke={YRP.ink} strokeWidth={5} />
          {Array.from({ length: 70 }).map((_, i) => (
            <line key={i} x1={-80 + i * 30} y1={82 + (i % 5 === 0 ? 0 : 4)} x2={-80 + i * 30} y2={104 + Math.sin(i) * 4} stroke="#C9A44A" strokeWidth={4} opacity={0.75} />
          ))}
          {/* ===== 客席 (奥の列) ===== */}
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i}>
              <rect x={440 + i * 170} y={900} width={150} height={150} rx={40} fill="#22161A" stroke="#4A2228" strokeWidth={4} />
            </g>
          ))}
          {/* 語り手 (客席の通路から見ている)。夕暮れのからくり版では出さない */}
          {!dusk && (
            <g filter="url(#yrim)">
              <Narrator x={330} y={1060} s={1.06} f={f} face="jito" gaze={[6, -3]} armL={6} armR={-8} />
            </g>
          )}
          {/* 客席 (手前の列) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <rect x={400 + i * 200} y={960} width={182} height={170} rx={46} fill="#180E11" stroke="#5A2A30" strokeWidth={5} />
              <rect x={414 + i * 200} y={972} width={154} height={12} rx={6} fill="#6E3238" opacity={0.6} />
            </g>
          ))}
        </g>
      </g>
      {dusk && <rect width={W} height={H} fill="#F2C28A" opacity={0.1} style={{ mixBlendMode: "screen" }} />}
      <NightFinish grain={0.08} />
      <FileTag no="02" title="名前を奪われるのは、なぜ怖いのか" f={f} />
      <Caption f={f} text={f < 70 ? "名前に人が集まると、名前に値段がつく" : "その名前は、誰のものなのか"} />
    </svg>
  );
};

