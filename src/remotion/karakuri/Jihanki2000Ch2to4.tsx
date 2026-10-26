// 自販機2000年史 第2〜4章のシーン集 (シーン29〜91)。
// 共有部品 (配色・ゆらぎ・地球儀・壺・Badge) は KarakuriScenes / Jihanki2000Scenes から流用。
// 設計書: docs/jihanki2000-motifs.md (第2章 29〜48 / 第3章 49〜70 / 第4章 71〜91)

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Coin, seg, pop, easeOut,
} from "./KarakuriScenes";
import {
  W, H, FONT, abs, J2Badge, GlobeHopDoor, HolyPot,
  Globe, globePoint, DashArc, MapPin, FlagCard,
} from "./Jihanki2000Scenes";
import { Bolt } from "./KarakuriScenes";

// ===== 町の人 (第2〜4章)。Person と同じ3層動き (まばたき97f+体ゆれ) =====
export type TownRole = "barkeep" | "smoker" | "carlile" | "everitt" | "tophat" | "newsboy";
export const TownPerson: React.FC<{
  x: number; y: number; s?: number; role: TownRole; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile";
  gaze?: [number, number]; lean?: number;
  pipe?: boolean; // smoker用: パイプと煙
  hideArm?: "left" | "right"; // 腕を別描きするとき、体側の腕を消す (二重腕防止)
}> = ({ x, y, s = 1, role, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0, pipe = false, hideArm }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const cloth = role === "barkeep" ? "#E8E2D4" : role === "smoker" ? "#8A9B74"
    : role === "everitt" ? "#5A5248" : role === "tophat" ? "#4A5468"
    : role === "newsboy" ? "#B8864F" : "#56688C";
  const clothDark = role === "barkeep" ? "#CEC4B0" : role === "smoker" ? "#75855F"
    : role === "everitt" ? "#4A443C" : role === "tophat" ? "#3C4556"
    : role === "newsboy" ? "#9C7140" : "#46567A";
  const eyeY = role === "smoker" ? -216 : role === "carlile" ? -228
    : role === "tophat" ? -238 : role === "newsboy" ? -212 : -226;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 脚・靴 (newsboyは半ズボン+すね) */}
      {role === "newsboy" ? (
        <g>
          <rect x={-30} y={-58} width={24} height={26} rx={6} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-58} width={24} height={26} rx={6} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-26} y={-36} width={16} height={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={10} y={-36} width={16} height={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ) : (
        <g>
          <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      {/* 腕 */}
      {hideArm !== "left" && (
        <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {/* 胴 */}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      {/* バーテン: 革エプロン */}
      {role === "barkeep" && (
        <g>
          <path d="M -40 -150 L 40 -150 L 52 -56 L -52 -56 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-40} y1={-150} x2={-52} y2={-128} stroke={KRP.ink} strokeWidth={4} />
          <line x1={40} y1={-150} x2={52} y2={-128} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* カーライル: 赤い襟巻き */}
      {role === "carlile" && (
        <g>
          <rect x={-46} y={-180} width={92} height={26} rx={12} fill="#C0563F" stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 10 -158 L 34 -94 L 8 -94 Z" fill="#C0563F" stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 頭 (役ごとに形を変える: たまご/まんじゅう/角丸/細長たまご) */}
      {role === "carlile" ? (
        <ellipse cx={0} cy={-232} rx={54} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      ) : role === "smoker" ? (
        <ellipse cx={0} cy={-218} rx={64} ry={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      ) : role === "tophat" ? (
        <ellipse cx={0} cy={-238} rx={46} ry={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      ) : role === "newsboy" ? (
        <ellipse cx={0} cy={-212} rx={62} ry={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      ) : (
        <rect x={-56} y={-286} width={112} height={122} rx={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      )}
      {/* エヴェリット: 前髪+もみあげ+フロックコートの合わせ */}
      {role === "everitt" && (
        <g>
          <path d="M 0 -160 L -20 -120 L 0 -54 L 20 -120 Z" fill={clothDark} stroke={KRP.ink} strokeWidth={4} />
          {[-128, -102, -76].map((by) => <circle key={by} cx={0} cy={by} r={4.5} fill={KRP.cream} />)}
          <path d="M -36 -160 L -8 -160 L -28 -134 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 36 -160 L 8 -160 L 28 -134 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -56 -278 Q 0 -300 56 -278 L 56 -256 Q 0 -272 -56 -256 Z" fill="#6E6256" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={-262} width={17} height={58} rx={8} fill="#6E6256" stroke={KRP.ink} strokeWidth={4} />
          <rect x={43} y={-262} width={17} height={58} rx={8} fill="#6E6256" stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* シルクハット紳士: 帽子+蝶ネクタイ */}
      {role === "tophat" && (
        <g>
          <rect x={-40} y={-402} width={80} height={104} rx={8} fill={KRP.ink} />
          <rect x={-40} y={-316} width={80} height={14} fill="#8E3630" stroke={KRP.ink} strokeWidth={3} />
          <rect x={-64} y={-302} width={128} height={16} rx={8} fill={KRP.ink} />
          <path d="M -16 -168 L -2 -158 L -16 -148 Z M 16 -168 L 2 -158 L 16 -148 Z"
            fill="#8E3630" stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
      {/* ガム少年: キャスケット帽 */}
      {role === "newsboy" && (
        <g>
          <path d="M -60 -232 Q 0 -288 60 -232 L 62 -220 Q 0 -244 -62 -220 Z" fill="#8F6B44" stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 34 -228 Q 70 -232 82 -216 L 58 -208 Z" fill="#7C5B3A" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-258} r={7} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
      {/* カーライル: もじゃ髪+丸眼鏡 */}
      {role === "carlile" && (
        <g>
          <g fill="#4A4038">
            {[[-50, -278], [-28, -294], [0, -300], [28, -294], [50, -278], [-60, -256], [60, -256]].map(([hx, hy], i) => (
              <circle key={i} cx={hx} cy={hy} r={17} />
            ))}
          </g>
          <g fill="none" stroke={KRP.ink} strokeWidth={4.5}>
            <circle cx={-22} cy={-228} r={20} />
            <circle cx={22} cy={-228} r={20} />
            <line x1={-2} y1={-232} x2={2} y2={-232} />
            <line x1={-42} y1={-234} x2={-52} y2={-240} />
            <line x1={42} y1={-234} x2={52} y2={-240} />
          </g>
        </g>
      )}
      {/* パイプ客: 三角帽 */}
      {role === "smoker" && (
        <g fill={KRP.ink}>
          <path d="M -58 -252 Q 0 -288 58 -252 L 58 -244 L -58 -244 Z" />
          <path d="M -56 -246 Q -92 -254 -82 -292 Q -60 -264 -42 -256 Z" />
          <path d="M 56 -246 Q 92 -254 82 -292 Q 60 -264 42 -256 Z" />
        </g>
      )}
      {/* バーテン: 横の髪+口ひげ */}
      {role === "barkeep" && (
        <g>
          <path d="M -56 -262 Q -66 -240 -56 -218 L -46 -236 Z" fill={KRP.ink} />
          <path d="M 56 -262 Q 66 -240 56 -218 L 46 -236 Z" fill={KRP.ink} />
          <path d="M -30 -194 Q -15 -206 0 -196 Q 15 -206 30 -194 Q 15 -184 0 -192 Q -15 -184 -30 -194 Z"
            fill={KRP.ink} />
        </g>
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={eyeY} x2={-12} y2={eyeY} />
          <line x1={12} y1={eyeY} x2={32} y2={eyeY} />
        </g>
      ) : (
        <g>
          <circle cx={-22 + gx} cy={eyeY + gy} r={role === "smoker" ? 5.5 : role === "tophat" ? 4 : 6.5} fill={KRP.ink} />
          <circle cx={22 + gx} cy={eyeY + gy} r={role === "smoker" ? 5.5 : role === "tophat" ? 4 : 6.5} fill={KRP.ink} />
          {/* エヴェリット: ボタン目 (輪っか) */}
          {role === "everitt" && (
            <g fill="none" stroke={KRP.ink} strokeWidth={3.5}>
              <circle cx={-22 + gx} cy={eyeY + gy} r={12} />
              <circle cx={22 + gx} cy={eyeY + gy} r={12} />
            </g>
          )}
        </g>
      )}
      {/* 眉・口 */}
      <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
        {face === "worried" ? (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-32} y1={eyeY - 24} x2={-12} y2={eyeY - 18} />
            <line x1={12} y1={eyeY - 18} x2={32} y2={eyeY - 24} />
          </g>
        ) : face === "surprised" ? (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-32} y1={eyeY - 28} x2={-12} y2={eyeY - 28} />
            <line x1={12} y1={eyeY - 28} x2={32} y2={eyeY - 28} />
          </g>
        ) : (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-32} y1={eyeY - 22} x2={-12} y2={eyeY - 24} />
            <line x1={12} y1={eyeY - 24} x2={32} y2={eyeY - 22} />
          </g>
        )}
        {face === "surprised" ? (
          <ellipse cx={0} cy={eyeY + 38} rx={9} ry={12} fill={KRP.ink} />
        ) : face === "smile" ? (
          <path d={`M -13 ${eyeY + 34} Q 0 ${eyeY + 47} 13 ${eyeY + 34}`} />
        ) : face === "worried" ? (
          <path d={`M -11 ${eyeY + 40} Q 0 ${eyeY + 32} 11 ${eyeY + 40}`} />
        ) : (
          <line x1={-9} y1={eyeY + 38} x2={9} y2={eyeY + 38} />
        )}
      </g>
      {/* パイプ (煙つき) */}
      {role === "smoker" && pipe && (
        <g>
          <path d={`M 10 ${eyeY + 38} Q 36 ${eyeY + 48} 54 ${eyeY + 40}`} fill="none" stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
          <path d={`M 46 ${eyeY + 36} L 70 ${eyeY + 36} L 66 ${eyeY + 58} L 50 ${eyeY + 58} Z`}
            fill="#8F6B44" stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => {
            const t = ((f * 1.3 + i * 32) % 96) / 96;
            return (
              <circle key={i} cx={58 + Math.sin((f + i * 20) / 9) * 6} cy={eyeY + 28 - t * 90}
                r={6 + t * 10} fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.6 * (1 - t)} />
            );
          })}
        </g>
      )}
    </g>
  );
};

// ===== 小物 =====
export const Heart: React.FC<{ cx: number; cy: number; s?: number; fill?: string }> = ({ cx, cy, s = 1, fill = "#D96A5A" }) => (
  <path d="M 0 26 C -40 -8 -30 -46 0 -22 C 30 -46 40 -8 0 26 Z"
    transform={`translate(${cx} ${cy}) scale(${s})`} fill={fill} stroke={KRP.ink} strokeWidth={5} />
);

export const GearIcon: React.FC<{ cx: number; cy: number; r: number; rot?: number; fill?: string }> = ({ cx, cy, r, rot = 0, fill = KRP.silver }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={-r * 0.15} y={-r - r * 0.24} width={r * 0.3} height={r * 0.32} rx={3}
        fill={fill} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={r} fill={fill} stroke={KRP.ink} strokeWidth={5} />
    <circle r={r * 0.3} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// オナーボックス (真鍮の小箱)。x,y=底の中央。s=1で幅340×高さ234
export const HonourBox: React.FC<{ x: number; y: number; s?: number; lidAngle?: number; engraved?: boolean }> = ({
  x, y, s = 1, lidAngle = 0, engraved = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 本体 */}
    <rect x={-160} y={-200} width={320} height={200} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
    {/* 前面の飾り枠+刻印 */}
    <rect x={-124} y={-168} width={248} height={128} rx={8} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
    {engraved && (
      <text x={0} y={-106} fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}
        textAnchor="middle" opacity={0.75} letterSpacing={4}>HONOUR</text>
    )}
    {/* 鍵穴 */}
    <circle cx={0} cy={-58} r={9} fill={KRP.ink} />
    <path d="M -5 -54 L 5 -54 L 8 -36 L -8 -36 Z" fill={KRP.ink} />
    {/* ふた (左奥をちょうつがいに開く) */}
    <g transform={`rotate(${-lidAngle} -160 -206)`}>
      <rect x={-170} y={-234} width={340} height={34} rx={9} fill="#C29A2E" stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-30} y={-226} width={60} height={13} rx={5} fill={KRP.ink} />
    </g>
  </g>
);

// ===== 第2章 シーン =====

// 30: 壺に「？」、ホコリがしんしん積もる
const SceneDustPot: React.FC<{ f: number }> = ({ f }) => {
  const qT = pop(seg(f, 24, 42));
  const dust = Math.min(f / 130, 1);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={90} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={820} width={W} height={H - 820} fill={KRP.floor} />
          <line x1={0} y1={820} x2={W} y2={820} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <HolyPot x={960} y={820} s={1.05} f={f} sepia />
          {/* ふた・肩に積もるホコリ */}
          <ellipse cx={960} cy={398} rx={92} ry={7 + dust * 8} fill="#D8D2C4" stroke={KRP.ink} strokeWidth={3} opacity={0.25 + dust * 0.65} />
          <ellipse cx={1052} cy={560} rx={34} ry={5 + dust * 5} fill="#D8D2C4" opacity={0.2 + dust * 0.5} />
          <ellipse cx={866} cy={560} rx={34} ry={5 + dust * 5} fill="#D8D2C4" opacity={0.2 + dust * 0.5} />
          {/* しんしん降るホコリ */}
          {Array.from({ length: 14 }).map((_, i) => {
            const px = 560 + ((i * 73) % 800);
            const py = 90 + ((f * 1.1 + i * 57) % 640);
            return <circle key={i} cx={px + Math.sin((f + i * 13) / 17) * 10} cy={py} r={3.5}
              fill="#C9C2B2" opacity={0.55 * (1 - py / 780)} />;
          })}
          {/* ？ */}
          {qT > 0.01 && (
            <text x={1210} y={330} fontFamily={FONT} fontWeight={900} fontSize={150} fill={KRP.grayDark}
              textAnchor="middle" transform={`rotate(8 1210 330) scale(${qT})`} transform-origin="1210 330">？</text>
          )}
        </g>
      </svg>
      <LabelPill x={430} y={160} text="その後のヘロンの壺" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 31: ローマ衰退。石柱が傾き、壺がセピアに、画面が暗く沈む
const SceneRomeFall: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 16, 110));
  return (
    <AbsoluteFill style={{ background: "#EFE4CB" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={91} />
        <g filter="url(#wobbleSoft)">
          {/* 砂丘と床 */}
          <path d="M 0 610 Q 480 540 960 600 Q 1440 660 1920 580 L 1920 820 L 0 820 Z" fill="#E3D2AC" opacity={0.8} />
          <rect x={0} y={820} width={W} height={H - 820} fill={KRP.floor} />
          <line x1={0} y1={820} x2={W} y2={820} stroke={KRP.ink} strokeWidth={5} />
          {/* 床のひび */}
          <path d={`M 300 870 l 90 18 l 70 -10 l 80 22`} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4 * t} />
          <path d={`M 1380 900 l 100 -14 l 60 20`} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4 * t} />
          {/* 傾く石柱 (左右) */}
          {[
            { x: 330, ang: -9 },
            { x: 1590, ang: 11 },
          ].map(({ x, ang }, i) => (
            <g key={i} transform={`rotate(${ang * t} ${x} 820)`}>
              <rect x={x - 52} y={180} width={104} height={620} fill="#E8DCC0" stroke={KRP.ink} strokeWidth={6} />
              {[0, 1, 2].map((c) => (
                <line key={c} x1={x - 28 + c * 28} y1={200} x2={x - 28 + c * 28} y2={780} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />
              ))}
              <rect x={x - 66} y={152} width={132} height={32} rx={6} fill="#DECBA0" stroke={KRP.ink} strokeWidth={6} />
            </g>
          ))}
          {/* 落ちる柱頭 (左柱から) */}
          <g transform={`translate(${330 - 40 * t} ${196 + t * t * 560}) rotate(${-38 * t})`}>
            <rect x={-62} y={-16} width={124} height={32} rx={6} fill="#DECBA0" stroke={KRP.ink} strokeWidth={6} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 壺: ふつう→セピアへクロスフェード */}
          <g opacity={1 - t}><HolyPot x={960} y={820} s={1.0} f={f} /></g>
          <g opacity={t}><HolyPot x={960} y={820} s={1.0} f={f} sepia /></g>
        </g>
        {/* 画面が暗く沈む */}
        <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.3 * t} />
      </svg>
      {t > 0.75 && <LabelPill x={430} y={160} text="ローマ帝国の衰退" color={KRP.red} size={36} centerX />}
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// 32: 閉じた本+Zzz→年号カウント→パッと開いて「ルネサンス」
const SceneBookSleep: React.FC<{ f: number }> = ({ f }) => {
  const year = Math.floor(100 + seg(f, 0, 84) * 1400);
  const openT = pop(seg(f, 90, 110));
  const closed = openT < 0.02;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={92} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={790} width={W} height={H - 790} fill={KRP.floor} />
          <line x1={0} y1={790} x2={W} y2={790} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {closed ? (
            <g>
              {/* 閉じた本 (横置き・厚い本。床 y790 に着地) */}
              <rect x={700} y={622} width={520} height={132} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              {[648, 672, 696, 720].map((yy, i) => (
                <line key={i} x1={712} y1={yy} x2={1208} y2={yy} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
              ))}
              <rect x={684} y={552} width={552} height={76} rx={12} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
              <rect x={684} y={748} width={552} height={40} rx={10} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={6} />
              {/* 背表紙 (左側) */}
              <rect x={668} y={552} width={34} height={236} rx={14} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={6} />
              <text x={972} y={604} fontFamily={FONT} fontWeight={800} fontSize={34} fill={KRP.cream}
                textAnchor="middle" letterSpacing={4}>ヘロンの図面集</text>
              {/* Zzz */}
              {[0, 1, 2].map((i) => {
                const t = ((f * 1.4 + i * 36) % 108) / 108;
                return (
                  <text key={i} x={1280 + i * 10 + t * 30} y={560 - t * 150}
                    fontFamily={FONT} fontWeight={900} fontSize={40 + i * 10} fill={KRP.grayDark}
                    opacity={0.75 * (1 - t)}>Z</text>
                );
              })}
            </g>
          ) : (
            <g transform={`translate(960 640) scale(${openT}) translate(-960 -640)`}>
              {/* 表紙 (白ページの下にのぞく茶色) */}
              <path d="M 960 566 Q 756 502 606 560 L 606 716 Q 756 662 960 716 Z"
                fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
              <path d="M 960 566 Q 1164 502 1314 560 L 1314 716 Q 1164 662 960 716 Z"
                fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
              {/* 開いた本 */}
              <path d="M 960 560 Q 760 500 620 556 L 620 700 Q 760 648 960 700 Z"
                fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <path d="M 960 560 Q 1160 500 1300 556 L 1300 700 Q 1160 648 960 700 Z"
                fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <line x1={960} y1={560} x2={960} y2={700} stroke={KRP.ink} strokeWidth={5} />
              {/* ページの線 */}
              {[0, 1, 2].map((i) => (
                <g key={i} stroke={KRP.ink} strokeWidth={3} opacity={0.3} fill="none">
                  <path d={`M 680 ${586 + i * 30} Q 800 ${556 + i * 30} 930 ${586 + i * 30}`} />
                  <path d={`M 990 ${586 + i * 30} Q 1120 ${556 + i * 30} 1240 ${586 + i * 30}`} />
                </g>
              ))}
              {/* 光 */}
              {[0, 1, 2, 3, 4].map((i) => {
                const a = -150 + i * 30;
                return <line key={i} x1={960 + Math.cos((a * Math.PI) / 180) * 240} y1={580 + Math.sin((a * Math.PI) / 180) * 180}
                  x2={960 + Math.cos((a * Math.PI) / 180) * 330} y2={580 + Math.sin((a * Math.PI) / 180) * 260}
                  stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" opacity={0.85} />;
              })}
            </g>
          )}
        </g>
      </svg>
      {/* 年号カウント */}
      {closed ? (
        <div style={{
          position: "absolute", left: 0, right: 0, top: 170, textAlign: "center",
          fontFamily: FONT, fontWeight: 900, fontSize: 84, color: KRP.ink,
        }}>
          西暦 <span style={{ fontSize: 110, color: KRP.red }}>{year}</span> 年
        </div>
      ) : (
        <div style={{
          position: "absolute", left: 0, right: 0, top: 180, textAlign: "center",
          opacity: openT,
          fontFamily: FONT, fontWeight: 900, fontSize: 96, color: KRP.red, letterSpacing: 8,
        }}>ルネサンス</div>
      )}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 酒場の内観 (第2章の舞台)。dim=暗め
const TavernBG: React.FC<{ f: number; dim?: boolean }> = ({ f, dim }) => {
  const sway = Math.sin(f / 19) * 5;
  return (
    <g>
      {/* 壁 (木の板張り) */}
      <rect x={0} y={0} width={W} height={840} fill={dim ? "#C09A6B" : "#CDA87A"} />
      {[150, 300, 450, 600, 750].map((yy) => (
        <line key={yy} x1={0} y1={yy} x2={W} y2={yy} stroke={KRP.ink} strokeWidth={3} opacity={0.18} />
      ))}
      {/* 天井の梁 */}
      <rect x={0} y={0} width={W} height={70} fill="#8F6B44" stroke={KRP.ink} strokeWidth={5} />
      {/* 窓 (夜) */}
      <rect x={1560} y={180} width={240} height={300} rx={12} fill="#2E3A52" stroke={KRP.ink} strokeWidth={6} />
      <line x1={1680} y1={184} x2={1680} y2={476} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1564} y1={330} x2={1796} y2={330} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1740} cy={240} r={24} fill="#F5E6B8" opacity={0.9} />
      {/* つりランプ (ゆれ+灯) */}
      <g transform={`rotate(${sway} 620 70)`}>
        <line x1={620} y1={70} x2={620} y2={190} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={620} cy={240} rx={120} ry={86} fill="#F5E6B8" opacity={0.3 + 0.08 * Math.sin(f / 9)} />
        <path d="M 592 190 L 648 190 L 660 250 L 580 250 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={620} cy={226} r={13} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 樽 (右) */}
      {[{ x: 1500, y: 840, s: 1 }, { x: 1730, y: 840, s: 0.82 }].map(({ x, y, s }, i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M -90 -230 Q -112 -115 -90 0 L 90 0 Q 112 -115 90 -230 Z"
            fill="#B4875A" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -104 -168 Q 0 -190 104 -168" fill="none" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -104 -62 Q 0 -84 104 -62" fill="none" stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={-228} x2={0} y2={-2} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        </g>
      ))}
      {/* 棚+ボトル (左上) */}
      <rect x={120} y={300} width={360} height={16} fill="#8F6B44" stroke={KRP.ink} strokeWidth={4.5} />
      {[170, 250, 330, 410].map((bx, i) => (
        <g key={i}>
          <rect x={bx - 16} y={236} width={32} height={64} rx={7} fill={i % 2 ? "#7A8E5E" : "#A8653E"} stroke={KRP.ink} strokeWidth={4} />
          <rect x={bx - 6} y={218} width={12} height={22} fill={i % 2 ? "#7A8E5E" : "#A8653E"} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      {/* 床 */}
      <rect x={0} y={840} width={W} height={H - 840} fill="#A9825A" />
      <line x1={0} y1={840} x2={W} y2={840} stroke={KRP.ink} strokeWidth={5} />
      {dim && <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.14} />}
    </g>
  );
};

// 33: 17世紀の酒場内観 (ランプの灯がゆれる)
const SceneTavern: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#CDA87A" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={93} />
      <g filter="url(#wobbleSoft)">
        <TavernBG f={f} />
        {/* カウンター (左) */}
        <rect x={0} y={610} width={1040} height={36} rx={8} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
        <rect x={40} y={646} width={960} height={194} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={6} />
        {[220, 460, 700].map((lx) => (
          <line key={lx} x1={lx} y1={656} x2={lx} y2={830} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        ))}
        {/* マグ */}
        <g transform="translate(780 610)">
          <rect x={-30} y={-62} width={60} height={62} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 30 -48 Q 62 -44 30 -16" fill="none" stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-64} rx={28} ry={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      <g filter="url(#wobble)">
        {/* 店主 (カウンターの奥) */}
        <TownPerson x={420} y={760} s={1.05} role="barkeep" f={f} face="smile" gaze={[4, 0]} />
        {/* カウンター前板で腰から下をかくす */}
        <rect x={40} y={646} width={960} height={194} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={6} opacity={1} />
        {[220, 460, 700].map((lx) => (
          <line key={lx} x1={lx} y1={656} x2={lx} y2={830} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        ))}
      </g>
    </svg>
    <LabelPill x={1370} y={150} text="17世紀 イギリスの酒場" size={36} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 34: カウンターに真鍮の小箱がポン
const SceneHonourBoxIntro: React.FC<{ f: number }> = ({ f }) => {
  const boxT = pop(seg(f, 16, 34));
  return (
    <AbsoluteFill style={{ background: "#CDA87A" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={94} />
        <g filter="url(#wobbleSoft)">
          {/* 壁 (寄りなので板を大きく) */}
          <rect x={0} y={0} width={W} height={700} fill="#CDA87A" />
          {[180, 400, 620].map((yy) => (
            <line key={yy} x1={0} y1={yy} x2={W} y2={yy} stroke={KRP.ink} strokeWidth={3.5} opacity={0.18} />
          ))}
          {/* ランプの灯だまり */}
          <ellipse cx={960} cy={420} rx={560} ry={330} fill="#F5E6B8" opacity={0.18 + 0.05 * Math.sin(f / 9)} />
          {/* カウンター天板 (画面いっぱい) */}
          <rect x={0} y={700} width={W} height={46} rx={0} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={746} width={W} height={H - 746} fill="#7C5B3A" />
          {[300, 760, 1220, 1680].map((lx) => (
            <line key={lx} x1={lx} y1={760} x2={lx} y2={1050} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          ))}
        </g>
        <g filter="url(#wobble)">
          {boxT > 0.01 && (
            <g transform={`translate(960 700) scale(${boxT}) translate(-960 -700)`}>
              <ellipse cx={960} cy={706} rx={240} ry={20} fill={KRP.ink} opacity={0.12} />
              <HonourBox x={960} y={700} s={1.3} />
            </g>
          )}
          {/* きらん */}
          {f > 40 && (
            <g transform={`translate(1130 480) rotate(${f * 1.4})`} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 11))}>
              <path d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            </g>
          )}
        </g>
      </svg>
      {f > 48 && <LabelPill x={960} y={200} text="オナーボックス" size={46} color={KRP.red} centerX />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 白い図解カード (断面図の台紙)
const DiagramCard: React.FC = () => (
  <rect x={330} y={130} width={1260} height={800} rx={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
);

// オナーボックスの断面 (外箱+空洞)。children は空洞の中身
const HonourCutShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g transform="translate(960 880)">
    {/* 外箱 (壁に厚み) */}
    <rect x={-310} y={-540} width={620} height={540} rx={18} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-262} y={-480} width={524} height={448} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
    {/* ふた (左右2枚、中央に投入口のすき間) */}
    <rect x={-310} y={-574} width={252} height={38} rx={9} fill="#C29A2E" stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={58} y={-574} width={252} height={38} rx={9} fill="#C29A2E" stroke={KRP.ink} strokeWidth={5.5} />
    {/* 投入口から中へのガイド */}
    <line x1={-34} y1={-536} x2={-20} y2={-480} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    <line x1={34} y1={-536} x2={20} y2={-480} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    {children}
  </g>
);

// 35: 断面: コイン→てこ→ロックがカチリ (ループ)
const SceneHonourCutLock: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 130;
  const fallT = easeOut(seg(fc, 6, 30));
  const tiltT = easeOut(seg(fc, 30, 48));
  const boltT = pop(seg(fc, 50, 62));
  const kaT = pop(seg(fc, 62, 76));
  const coinY = -560 + fallT * 290; // -560 → -270
  const ang = tiltT * 12;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={95} />
        <g filter="url(#wobbleSoft)">
          <DiagramCard />
          <HonourCutShell>
            {/* てこ (中央の支点でシーソー) */}
            <path d="M -26 -200 L 26 -200 L 0 -248 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
            <g transform={`rotate(${ang} 0 -248)`}>
              <rect x={-210} y={-262} width={420} height={22} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              {/* 右端の受け皿 */}
              <path d="M 160 -262 L 232 -262 L 220 -232 L 172 -232 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
            {/* てこ左端→ロックへのひも */}
            <line x1={-205 * Math.cos((ang * Math.PI) / 180)} y1={-251 + 205 * Math.sin((ang * Math.PI) / 180)}
              x2={-234} y2={-352 - boltT * 30} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 8" opacity={0.7} />
            {/* ロックのかんぬき (左壁、上に抜けると解錠) */}
            <g transform={`translate(0 ${-boltT * 44})`}>
              <rect x={-262} y={-376} width={96} height={34} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            </g>
            <rect x={-310} y={-436} width={48} height={110} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            {/* コイン (落下→右の皿へ) */}
            <Coin cx={fallT < 1 ? 0 : 196 * Math.cos((ang * Math.PI) / 180)}
              cy={fallT < 1 ? coinY : -270 + 196 * Math.sin((ang * Math.PI) / 180)} r={40} fill={KRP.copper} text="1" />
          </HonourCutShell>
        </g>
        <g filter="url(#wobble)">
          {kaT > 0.01 && (
            <text x={620} y={420} fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.red}
              textAnchor="middle" transform={`rotate(-8 620 420) scale(${kaT})`} transform-origin="620 420">カチリ</text>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={192} text="1ペニーのおもみで ロックが外れる" size={38} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 36: 断面に「計量装置」の空欄+赤い×
const SceneHonourNoMeter: React.FC<{ f: number }> = ({ f }) => {
  const xT = pop(seg(f, 26, 44));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={96} />
        <g filter="url(#wobbleSoft)">
          <DiagramCard />
          <HonourCutShell>
            {/* 空っぽの空洞に点線の枠 */}
            <rect x={-190} y={-420} width={380} height={200} rx={14} fill="none" stroke={KRP.grayDark}
              strokeWidth={5} strokeDasharray="16 12" />
            <text x={0} y={-304} fontFamily={FONT} fontWeight={800} fontSize={52} fill={KRP.grayDark}
              textAnchor="middle">計量装置</text>
            {/* タバコの葉 (箱の底) */}
            {[-170, -60, 50, 150].map((bx, i) => (
              <path key={i} d={`M ${bx} -60 q 20 -36 44 0 q -22 20 -44 0 Z`} fill="#9B7C4A" stroke={KRP.ink} strokeWidth={4} />
            ))}
          </HonourCutShell>
        </g>
        <g filter="url(#wobble)">
          {xT > 0.01 && (
            <g transform={`translate(960 560) scale(${xT}) translate(-960 -560)`}
              stroke={KRP.red} strokeWidth={22} strokeLinecap="round" opacity={0.9}>
              <line x1={820} y1={440} x2={1100} y2={680} />
              <line x1={1100} y1={440} x2={820} y2={680} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={192} text="量をはかる部品は、なし" size={38} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 37: smokerが1服ぶん取ってフタを閉める。頭上にハート
const SceneSmokerHonest: React.FC<{ f: number }> = ({ f }) => {
  const openT = pop(seg(f, 6, 22));
  const closeT = easeOut(seg(f, 88, 106));
  const lidAngle = 74 * openT * (1 - closeT);
  // 手: 行き (30-52) → 帰り (60-82)。伸ばしている間は体側の左腕を消す (二重腕防止)
  const go = easeOut(seg(f, 30, 52));
  const back = easeOut(seg(f, 60, 82));
  const reach = go * (1 - back);
  const armOut = f >= 26 && f <= 86;
  const bob = Math.sin(f / 13) * 3 * 1.18; // TownPerson(phase=0,s=1.18)の体ゆれと同期
  const sx = 1351, sy = 725 + bob;         // 肩 (体側の腕のつけ根に一致)
  const hx0 = 1351, hy0 = 815 + bob;       // 下ろした手の位置
  const hx = hx0 + (830 - hx0) * reach;
  const hy = hy0 + (470 - hy0) * reach;
  const heartT = pop(seg(f, 112, 128));
  return (
    <AbsoluteFill style={{ background: "#CDA87A" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={97} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={640} fill="#CDA87A" />
          {[160, 380, 600].map((yy) => (
            <line key={yy} x1={0} y1={yy} x2={W} y2={yy} stroke={KRP.ink} strokeWidth={3.5} opacity={0.18} />
          ))}
          <ellipse cx={800} cy={420} rx={520} ry={300} fill="#F5E6B8" opacity={0.16 + 0.05 * Math.sin(f / 9)} />
          {/* カウンター (左2/3) */}
          <rect x={0} y={640} width={1150} height={40} rx={8} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={680} width={1110} height={H - 680} fill="#7C5B3A" />
          {[280, 640, 1000].map((lx) => (
            <line key={lx} x1={lx} y1={694} x2={lx} y2={1050} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          ))}
          {/* 床 */}
          <rect x={1110} y={900} width={W - 1110} height={H - 900} fill="#A9825A" />
          <line x1={1110} y1={900} x2={W} y2={900} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <HonourBox x={820} y={640} s={1.05} lidAngle={lidAngle} />
          {/* パイプ客 */}
          <TownPerson x={1430} y={900} s={1.18} role="smoker" f={f} face={f > 108 ? "smile" : "normal"}
            gaze={[-6, 0]} pipe={f > 112} hideArm={armOut ? "left" : undefined} />
          {/* のばす腕+手 (体側の腕と入れかわりで1本だけ) */}
          {armOut && (
            <g>
              <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={33} strokeLinecap="round" />
              <line x1={sx} y1={sy} x2={hx} y2={hy} stroke="#8A9B74" strokeWidth={24} strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              {/* つまんだ葉 (帰りだけ) */}
              {back > 0.05 && back < 0.98 && (
                <path d={`M ${hx - 10} ${hy - 22} q 12 -22 26 0 q -13 12 -26 0 Z`} fill="#9B7C4A" stroke={KRP.ink} strokeWidth={3.5} />
              )}
            </g>
          )}
          {/* ハート */}
          {heartT > 0.01 && (
            <g transform={`translate(1430 ${430 + Math.sin(f / 11) * 6}) scale(${heartT * 1.25}) translate(-1430 -430)`}>
              <Heart cx={1430} cy={430} s={1.3} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={400} y={170} text="1服ぶんだけ。あとは良心" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 38: 「HONOUR＝良心」ラベル
const SceneHonourLabel: React.FC<{ f: number }> = ({ f }) => {
  const pillT = pop(seg(f, 20, 38));
  return (
    <AbsoluteFill style={{ background: "#CDA87A" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={98} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={760} fill="#CDA87A" />
          {[200, 440, 680].map((yy) => (
            <line key={yy} x1={0} y1={yy} x2={W} y2={yy} stroke={KRP.ink} strokeWidth={3.5} opacity={0.18} />
          ))}
          <ellipse cx={960} cy={520} rx={620} ry={360} fill="#F5E6B8" opacity={0.2 + 0.05 * Math.sin(f / 9)} />
          <rect x={0} y={760} width={W} height={46} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={806} width={W} height={H - 806} fill="#7C5B3A" />
        </g>
        <g filter="url(#wobble)">
          <HonourBox x={960} y={760} s={1.6} />
          {/* HONOURの文字から線 */}
          {pillT > 0.3 && (
            <line x1={960} y1={560} x2={960} y2={360} stroke={KRP.ink} strokeWidth={4.5} strokeDasharray="12 10" opacity={0.7} />
          )}
        </g>
      </svg>
      {pillT > 0.01 && (
        <div style={{
          position: "absolute", left: 0, right: 0, top: 200, textAlign: "center",
          transform: `scale(${pillT})`,
        }}>
          <span style={{
            fontFamily: FONT, fontWeight: 900, fontSize: 64, color: KRP.cream,
            background: "rgba(34,30,27,0.92)", padding: "14px 44px", borderRadius: 60,
            border: `4px solid ${KRP.ink}`,
          }}>
            HONOUR ＝ <span style={{ color: "#F2CE4C" }}>良心</span>
          </span>
        </div>
      )}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 天びん図 (39・40で共用)。左=歯車 (仕組み)、右=ハート (信頼)
const ScaleDiagram: React.FC<{ f: number }> = ({ f }) => {
  const a = Math.sin(f / 32) * 5;
  const aR = (a * Math.PI) / 180;
  const cx = 960, cy = 400, arm = 330;
  const lx = cx - arm * Math.cos(aR), ly = cy - arm * Math.sin(aR);
  const rx = cx + arm * Math.cos(aR), ry = cy + arm * Math.sin(aR);
  const panDrop = 160;
  return (
    <g>
      {/* 土台+支柱 */}
      <path d="M 850 820 L 1070 820 L 1030 770 L 890 770 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={942} y={400} width={36} height={372} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={cx} cy={cy} r={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
      {/* うで */}
      <g transform={`rotate(${a} ${cx} ${cy})`}>
        <rect x={cx - arm - 14} y={cy - 13} width={(arm + 14) * 2} height={26} rx={12}
          fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      {/* 左の皿 (歯車) */}
      <g>
        <line x1={lx} y1={ly} x2={lx - 54} y2={ly + panDrop - 24} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={lx} y1={ly} x2={lx + 54} y2={ly + panDrop - 24} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M ${lx - 110} ${ly + panDrop - 24} L ${lx + 110} ${ly + panDrop - 24} Q ${lx} ${ly + panDrop + 42} ${lx - 110} ${ly + panDrop - 24} Z`}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
        <GearIcon cx={lx} cy={ly + panDrop - 78} r={52} rot={f * 0.5} />
      </g>
      {/* 右の皿 (ハート) */}
      <g>
        <line x1={rx} y1={ry} x2={rx - 54} y2={ry + panDrop - 24} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={rx} y1={ry} x2={rx + 54} y2={ry + panDrop - 24} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M ${rx - 110} ${ry + panDrop - 24} L ${rx + 110} ${ry + panDrop - 24} Q ${rx} ${ry + panDrop + 42} ${rx - 110} ${ry + panDrop - 24} Z`}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
        <Heart cx={rx} cy={ry + panDrop - 86} s={1.5} />
      </g>
      {/* ラベル */}
      <text x={lx} y={ly + panDrop + 100} fontFamily={FONT} fontWeight={900} fontSize={46}
        fill={KRP.ink} textAnchor="middle">仕組み</text>
      <text x={rx} y={ry + panDrop + 100} fontFamily={FONT} fontWeight={900} fontSize={46}
        fill={KRP.ink} textAnchor="middle">良心</text>
    </g>
  );
};

// 39: 歯車⇔ハートの天びんがゆらゆら
const SceneScale: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={99} />
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={820} width={W} height={H - 820} fill={KRP.floor} />
        <line x1={0} y1={820} x2={W} y2={820} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g filter="url(#wobble)">
        <ScaleDiagram f={f} />
      </g>
    </svg>
    <LabelPill x={960} y={160} text="足りないぶんは、人を信じる" size={38} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 40: 同上に寄り+しおりマーク (伏線)
const SceneScaleMark: React.FC<{ f: number }> = ({ f }) => {
  const bmT = pop(seg(f, 18, 36));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={100} />
        <g transform={`translate(${W / 2} ${H / 2}) scale(1.22) translate(${-W / 2} ${-H / 2 - 40})`}>
          <g filter="url(#wobbleSoft)">
            <rect x={-200} y={820} width={W + 400} height={400} fill={KRP.floor} />
            <line x1={-200} y1={820} x2={W + 200} y2={820} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <g filter="url(#wobble)">
            <ScaleDiagram f={f} />
          </g>
        </g>
        {/* しおり (右上からペタッ) */}
        <g filter="url(#wobble)">
          {bmT > 0.01 && (
            <g transform={`translate(1560 ${-240 + bmT * 240})`}>
              <path d="M -46 0 L 46 0 L 46 240 L 0 196 L -46 240 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
              <text x={0} y={92} fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.cream}
                textAnchor="middle" writing-mode="tb">しおり</text>
            </g>
          )}
        </g>
      </svg>
      {f > 44 && <LabelPill x={1420} y={330} text="最後に、もう一度" size={34} color={KRP.red} centerX />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 41: 1822年ロンドンの街角。霧が流れる
const SceneLondon1822: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#E4DFD2" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={101} />
      <g filter="url(#wobbleSoft)">
        {/* 奥の家並み (シルエット) */}
        <path d="M 0 560 L 0 320 L 110 320 L 110 250 L 150 250 L 150 320 L 300 320 L 300 380 L 470 380 L 470 280 L 520 280 L 520 380 L 700 380 L 700 560 Z"
          fill="#9A9183" />
        <path d="M 1300 560 L 1300 340 L 1420 340 L 1420 260 L 1460 260 L 1460 340 L 1650 340 L 1650 300 L 1920 300 L 1920 560 Z"
          fill="#9A9183" />
        {/* えんとつの煙 */}
        {[0, 1].map((i) => {
          const t = ((f * 1.2 + i * 48) % 96) / 96;
          return <circle key={i} cx={132 + Math.sin((f + i * 30) / 13) * 10} cy={240 - t * 110}
            r={10 + t * 16} fill="#CFC8B8" opacity={0.6 * (1 - t)} />;
        })}
        {/* 本屋の店構え */}
        <rect x={760} y={260} width={620} height={560} fill="#8A6F50" stroke={KRP.ink} strokeWidth={7} />
        <rect x={790} y={300} width={560} height={96} rx={10} fill="#4E5A48" stroke={KRP.ink} strokeWidth={6} />
        <text x={1070} y={366} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.cream}
          textAnchor="middle" letterSpacing={8}>BOOK SHOP</text>
        {/* ショーウィンドウ (本が並ぶ) */}
        <rect x={800} y={440} width={330} height={290} rx={10} fill="#D8D2C0" stroke={KRP.ink} strokeWidth={6} />
        {[830, 880, 930, 980, 1030, 1080].map((bx, i) => (
          <rect key={i} x={bx} y={560 + (i % 2) * 8} width={40} height={150 - (i % 2) * 8} rx={5}
            fill={i % 3 === 0 ? "#A8653E" : i % 3 === 1 ? "#56688C" : "#7A8E5E"} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <line x1={804} y1={540} x2={1126} y2={540} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        {/* ドア */}
        <rect x={1170} y={480} width={170} height={340} rx={10} fill="#6B4F34" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1310} cy={650} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 街灯 */}
        <rect x={430} y={360} width={18} height={460} fill={KRP.ink} />
        <path d="M 406 300 L 472 300 L 460 366 L 418 366 Z" fill="#3B332C" />
        <rect x={418} y={310} width={42} height={48} fill="#F5E6B8" opacity={0.85} />
        <ellipse cx={439} cy={334} rx={90} ry={70} fill="#F5E6B8" opacity={0.22 + 0.06 * Math.sin(f / 9)} />
        {/* 石畳 */}
        <rect x={0} y={820} width={W} height={H - 820} fill="#B9B2A2" />
        <line x1={0} y1={820} x2={W} y2={820} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M ${i * 300 - 80} 880 q 60 -14 120 0 M ${i * 300 + 70} 960 q 60 -14 120 0`}
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        ))}
        {/* 霧 */}
        {[0, 1, 2].map((i) => {
          const mx = ((i * 820 + f * 1.1) % (W + 700)) - 350;
          return <ellipse key={i} cx={mx} cy={700 - i * 160} rx={360} ry={54} fill="#FFFFFF" opacity={0.3} />;
        })}
      </g>
    </svg>
    <LabelPill x={330} y={150} text="1822年 ロンドン" size={40} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 本の山 (積み上げ)。x=中心, y=床
const BookPile: React.FC<{ x: number; y: number; n: number; seedIdx?: number }> = ({ x, y, n, seedIdx = 0 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const w = 180 - ((i * 23 + seedIdx * 17) % 46);
      const off = (((i * 37 + seedIdx * 29) % 36) - 18);
      const cols = ["#A8653E", "#56688C", "#7A8E5E", "#C0563F", "#8F6B44"];
      return (
        <g key={i}>
          <rect x={x - w / 2 + off} y={y - 34 * (i + 1)} width={w} height={34} rx={6}
            fill={cols[(i + seedIdx) % 5]} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={x - w / 2 + off + 14} y1={y - 34 * i - 10} x2={x + w / 2 + off - 14} y2={y - 34 * i - 10}
            stroke={KRP.white} strokeWidth={3} opacity={0.5} />
        </g>
      );
    })}
  </g>
);

// 42: カーライル登場。本の山、1冊ずり落ちる
const SceneCarlile: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 120;
  const s1 = easeOut(seg(fc, 30, 52));
  const s2 = seg(fc, 52, 74);
  const bx = 1408 + 60 * s1 + 70 * s2;
  const by = 880 - 34 * 9 - 30 + s2 * s2 * 330;
  const rot = 16 * s1 + 74 * s2;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={102} />
        <g filter="url(#wobbleSoft)">
          {/* 店内の壁+棚 */}
          <rect x={120} y={200} width={520} height={18} fill="#8F6B44" stroke={KRP.ink} strokeWidth={4.5} />
          {[200, 300, 400, 500].map((sx2, i) => (
            <rect key={i} x={sx2 - 24} y={120} width={48} height={80} rx={6}
              fill={i % 2 ? "#56688C" : "#A8653E"} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={0} y={880} width={W} height={H - 880} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <BookPile x={540} y={880} n={6} seedIdx={1} />
          <BookPile x={1400} y={880} n={9} seedIdx={3} />
          {/* ずり落ちる1冊 */}
          <g transform={`translate(${bx} ${by}) rotate(${rot})`}>
            <rect x={-80} y={-17} width={160} height={34} rx={6} fill="#C0563F" stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={-64} y1={10} x2={64} y2={10} stroke={KRP.white} strokeWidth={3} opacity={0.5} />
          </g>
          <TownPerson x={940} y={880} s={1.2} role="carlile" f={f} face="smile" gaze={[6, -2]} />
        </g>
      </svg>
      <LabelPill x={420} y={300} text="書店主 リチャード・カーライル" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 43: 鉄格子がガシャン
const SceneCarlileJail: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 10, 26));
  const barY = -900 + drop * 900;
  const hit = f >= 26 && f < 42;
  const shake = hit ? Math.sin(f * 2.6) * 5 * (1 - seg(f, 26, 42)) : 0;
  const gashaT = pop(seg(f, 26, 40));
  return (
    <AbsoluteFill style={{ background: "#D6CDBE" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={103} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={H - 880} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.14 * drop} />
        </g>
        <g filter="url(#wobble)">
          <TownPerson x={960} y={880} s={1.2} role="carlile" f={f} face="worried" gaze={[0, -3]} />
          {/* 鉄格子 */}
          <g transform={`translate(${shake} ${barY})`}>
            {[480, 660, 840, 1020, 1200, 1380].map((gx) => (
              <rect key={gx} x={gx - 17} y={60} width={34} height={900} rx={14}
                fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
            ))}
            {[220, 560, 860].map((gy) => (
              <rect key={gy} x={430} y={gy} width={1000} height={30} rx={12}
                fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
            ))}
          </g>
          {/* 着地の衝撃線 */}
          {hit && (
            <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
              <line x1={420} y1={930} x2={370} y2={960} />
              <line x1={1500} y1={930} x2={1550} y2={960} />
              <line x1={440} y1={980} x2={395} y2={1000} />
              <line x1={1480} y1={980} x2={1525} y2={1000} />
            </g>
          )}
          {gashaT > 0.01 && (
            <text x={1600} y={300} fontFamily={FONT} fontWeight={900} fontSize={80} fill={KRP.red}
              textAnchor="middle" transform={`rotate(8 1600 300) scale(${gashaT})`} transform-origin="1600 300">ガシャン</text>
          )}
        </g>
      </svg>
      <LabelPill x={330} y={150} text="発禁本で、牢屋へ" size={38} centerX />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// 44: 頭上に電球ピカッ
const SceneCarlileIdea: React.FC<{ f: number }> = ({ f }) => {
  const bulbT = pop(seg(f, 14, 30));
  const lit = f > 30;
  const flick = 0.5 + 0.5 * Math.abs(Math.sin(f / 6));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={104} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={H - 880} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {lit && <ellipse cx={960} cy={420} rx={640} ry={420} fill="#FFF3C4" opacity={0.22 * flick} />}
        </g>
        <g filter="url(#wobble)">
          <TownPerson x={960} y={880} s={1.2} role="carlile" f={f}
            face={f > 34 ? "smile" : "surprised"} gaze={[0, -4]} />
          {/* 電球 */}
          {bulbT > 0.01 && (
            <g transform={`translate(960 250) scale(${bulbT}) translate(-960 -250)`}>
              <circle cx={960} cy={230} r={66} fill={lit ? "#FFF3C4" : KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <path d="M 938 268 Q 948 240 960 266 Q 972 240 982 268" fill="none" stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={936} y={292} width={48} height={34} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              <line x1={940} y1={304} x2={980} y2={304} stroke={KRP.ink} strokeWidth={3} />
              <line x1={940} y1={316} x2={980} y2={316} stroke={KRP.ink} strokeWidth={3} />
              {/* 光線 */}
              {lit && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const a = (i * 45 * Math.PI) / 180;
                return <line key={i} x1={960 + Math.cos(a) * 92} y1={230 + Math.sin(a) * 92}
                  x2={960 + Math.cos(a) * (128 + flick * 16)} y2={230 + Math.sin(a) * (128 + flick * 16)}
                  stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" opacity={0.9} />;
              })}
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={420} y={560} text="手渡さなければ、いいのでは？" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 45: 本の自販機。ダイヤル回転→本がポトリ (ループ)
const SceneBookVendo: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 140;
  const coinT = easeOut(seg(fc, 6, 26));
  const dialT = easeOut(seg(fc, 30, 64));
  const bookT = easeOut(seg(fc, 68, 92));
  const cx2 = 960;
  const coinX = cx2 + 420 - coinT * 290;
  const coinY = 430 - Math.sin(coinT * Math.PI) * 80;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={105} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={H - 880} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* 木の筐体 */}
          <rect x={cx2 - 250} y={200} width={500} height={680} rx={18} fill="#8F6B44" stroke={KRP.ink} strokeWidth={7} />
          <rect x={cx2 - 210} y={236} width={420} height={78} rx={10} fill="#4E5A48" stroke={KRP.ink} strokeWidth={5.5} />
          <text x={cx2} y={290} fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.cream}
            textAnchor="middle" letterSpacing={8}>BOOKS</text>
          {/* 窓 (中の本) */}
          <rect x={cx2 - 190} y={340} width={240} height={180} rx={10} fill="#D8D2C0" stroke={KRP.ink} strokeWidth={5.5} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={cx2 - 166} y={356 + i * 48} width={192} height={38} rx={5}
              fill={i % 2 ? "#56688C" : "#A8653E"} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 取り出し口 */}
          <rect x={cx2 - 160} y={700} width={320} height={96} rx={12} fill="#3B332C" stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={cx2 - 180} y={790} width={360} height={22} rx={8} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* コイン投入口 */}
          <rect x={cx2 + 110} y={400} width={74} height={60} rx={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={cx2 + 136} y={414} width={22} height={34} rx={6} fill={KRP.ink} />
          {/* コイン */}
          {coinT < 1 && <Coin cx={coinX} cy={coinY} r={34} fill={KRP.copper} text="1" rotate={coinT * 240} />}
          {/* ダイヤル */}
          <g transform={`translate(${cx2 + 148} 560) rotate(${dialT * 180})`}>
            <circle r={64} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle r={12} fill={KRP.ink} />
            <rect x={-10} y={-62} width={20} height={46} rx={8} fill="#C29A2E" stroke={KRP.ink} strokeWidth={4.5} />
          </g>
          {/* 本がポトリ */}
          {bookT > 0.01 && (
            <g transform={`translate(${cx2 - 20} ${640 + bookT * 118}) rotate(${-6 * bookT})`}>
              <rect x={-86} y={-19} width={172} height={38} rx={6} fill="#C0563F" stroke={KRP.ink} strokeWidth={5} />
              <line x1={-68} y1={11} x2={68} y2={11} stroke={KRP.white} strokeWidth={3.5} opacity={0.5} />
            </g>
          )}
          {bookT >= 1 && fc < 130 && (
            <text x={cx2 + 240} y={760} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.red}
              transform={`rotate(-8 ${cx2 + 240} 760)`}>ポトリ</text>
          )}
        </g>
      </svg>
      <LabelPill x={360} y={160} text="世界初?の本の自販機" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 46: 法律書の壁に機械サイズの穴。カーライルがひょこっ
const SceneLawHole: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 140;
  const peek = pop(seg(fc, 24, 46)) * (1 - easeOut(seg(fc, 104, 124)));
  const headY = 790 - peek * 150;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={106} />
        <g filter="url(#wobbleSoft)">
          {/* 法律書の壁 (レンガ積み) */}
          {Array.from({ length: 5 }).map((_, row) => (
            <g key={row}>
              {Array.from({ length: 8 }).map((_, col) => {
                const bw = 250, bh = 160;
                const bx = col * bw - (row % 2) * 125 - 40;
                const by2 = 120 + row * bh;
                const cols = ["#C9B089", "#B8A47E", "#D4BC94"];
                return (
                  <g key={col}>
                    <rect x={bx} y={by2} width={bw - 10} height={bh - 10} rx={8}
                      fill={cols[(row + col) % 3]} stroke={KRP.ink} strokeWidth={5} />
                    <line x1={bx + 20} y1={by2 + 28} x2={bx + bw - 30} y2={by2 + 28}
                      stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
                    {(row + col) % 4 === 0 && (
                      <text x={bx + (bw - 10) / 2} y={by2 + 104} fontFamily={FONT} fontWeight={900}
                        fontSize={54} fill={KRP.ink} textAnchor="middle" opacity={0.6}>法</text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
          <rect x={0} y={910} width={W} height={H - 910} fill={KRP.floor} />
          <line x1={0} y1={910} x2={W} y2={910} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 機械の形の穴 */}
          <path d="M 790 350 L 1130 350 L 1130 910 L 790 910 Z M 1070 430 L 1086 430 L 1086 470 L 1070 470 Z"
            fill={KRP.paper} />
          <rect x={790} y={350} width={340} height={560} rx={10} fill="none" stroke={KRP.ink}
            strokeWidth={7} strokeDasharray="22 14" />
          {/* 穴から覗くカーライルの頭 */}
          {peek > 0.02 && (
            <g transform={`translate(960 ${headY})`}>
              <ellipse cx={0} cy={0} rx={50} ry={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
              <g fill="#4A4038">
                {[[-44, -42], [-24, -56], [0, -62], [24, -56], [44, -42]].map(([hx, hy], i) => (
                  <circle key={i} cx={hx} cy={hy} r={15} />
                ))}
              </g>
              <g fill="none" stroke={KRP.ink} strokeWidth={4.5}>
                <circle cx={-20} cy={4} r={18} />
                <circle cx={20} cy={4} r={18} />
                <line x1={-2} y1={0} x2={2} y2={0} />
              </g>
              <circle cx={-20} cy={4} r={6} fill={KRP.ink} />
              <circle cx={20} cy={4} r={6} fill={KRP.ink} />
              <path d="M -11 38 Q 0 48 11 38" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={210} text="法律の壁に、機械サイズの穴" size={38} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 47: 「牢屋ゆき」ハンコがドン。カーライルしょんぼり
const SceneCarlileStamp: React.FC<{ f: number }> = ({ f }) => {
  const sad = easeOut(seg(f, 26, 50));
  const drop = ((f * 1.6) % 90) / 90;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={107} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={H - 880} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* うしろに鉄格子の影 */}
          {[600, 780, 960, 1140, 1320].map((gx) => (
            <rect key={gx} x={gx - 13} y={140} width={26} height={740} rx={10} fill={KRP.grayDark} opacity={0.25} />
          ))}
        </g>
        <g filter="url(#wobble)">
          <TownPerson x={960} y={880} s={1.2} role="carlile" f={f} face="worried"
            gaze={[0, 4]} lean={sad * 4} />
          {/* 汗のしずく */}
          {f > 40 && (
            <path d={`M ${1052} ${560 + drop * 60} q 10 -20 20 0 a 10 10 0 1 1 -20 0 Z`}
              fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={1 - drop} />
          )}
        </g>
      </svg>
      {f >= 22 && <Stamp x={1340} y={330} text="牢屋の常連" size={50} />}
      <LabelPill x={400} y={160} text="作戦の甲斐なく…" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 48: 幕が開き、スポットライトにコイン
const SceneStage: React.FC<{ f: number }> = ({ f }) => {
  const openT = easeOut(seg(f, 10, 70));
  const curtainShift = openT * 600;
  return (
    <AbsoluteFill style={{ background: "#4A3E3E" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={108} />
        <g filter="url(#wobbleSoft)">
          {/* 舞台の奥+床 */}
          <rect x={0} y={0} width={W} height={760} fill="#574848" />
          <rect x={0} y={760} width={W} height={H - 760} fill="#8F6B44" />
          <line x1={0} y1={760} x2={W} y2={760} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={i * 560 - 200 - openT * 60} y1={1080} x2={i * 560 + 100} y2={760}
              stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
          ))}
          {/* スポットライト */}
          <polygon points={`960,-40 ${960 - 300 - openT * 60},760 ${960 + 300 + openT * 60},760`}
            fill="#FFF3C4" opacity={0.26 + 0.05 * Math.sin(f / 9)} />
          <ellipse cx={960} cy={766} rx={330 + openT * 60} ry={42} fill="#FFF3C4" opacity={0.3} />
        </g>
        <g filter="url(#wobble)">
          {/* コイン (主役) */}
          <Coin cx={960} cy={620} r={118} fill={KRP.gold} text="1" />
          <g transform={`translate(1075 505) rotate(${f * 1.3})`} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 9))}>
            <path d="M 0 -34 L 8 -8 L 34 0 L 8 8 L 0 34 L -8 8 L -34 0 L -8 -8 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
          {/* 幕 (左右に開く) */}
          <g transform={`translate(${-curtainShift} 0)`}>
            <rect x={0} y={60} width={820} height={1020} fill="#B4433A" stroke={KRP.ink} strokeWidth={7} />
            {[120, 280, 440, 600, 740].map((cx3) => (
              <path key={cx3} d={`M ${cx3} 70 Q ${cx3 - 26} 560 ${cx3} 1070`} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
            ))}
          </g>
          <g transform={`translate(${curtainShift} 0)`}>
            <rect x={1100} y={60} width={820} height={1020} fill="#B4433A" stroke={KRP.ink} strokeWidth={7} />
            {[1180, 1340, 1500, 1660, 1800].map((cx3) => (
              <path key={cx3} d={`M ${cx3} 70 Q ${cx3 + 26} 560 ${cx3} 1070`} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
            ))}
          </g>
          {/* 上の飾り幕 */}
          <rect x={0} y={0} width={W} height={70} fill="#8E3630" stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 0 70 ${Array.from({ length: 10 }).map((_, i) => `Q ${i * 192 + 96} 150 ${(i + 1) * 192} 70`).join(" ")}`}
            fill="#8E3630" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </svg>
      {f > 76 && <LabelPill x={960} y={260} text="コイン仕掛け、表舞台へ" size={40} color={KRP.red} centerX />}
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 第3章の部品 =====

// 絵はがき (白カード+切手+筆記線)。x,y=中心。w120×h80
const Postcard: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-40} width={120} height={80} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <rect x={26} y={-30} width={24} height={28} rx={3} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} />
    {[-14, 0, 14].map((yy) => (
      <line key={yy} x1={-46} y1={yy} x2={6} y2={yy} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
    ))}
  </g>
);

// エヴェリットのはがき自販機 (正面)。x,y=底の中央。s=1 で高さ約560
const PostcardMachine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 台座 */}
    <rect x={-150} y={-36} width={300} height={36} rx={6} fill="#3F5944" stroke={KRP.ink} strokeWidth={6} />
    {/* 本体 */}
    <rect x={-120} y={-500} width={240} height={464} rx={10} fill="#4E6B52" stroke={KRP.ink} strokeWidth={7} />
    {/* ペディメント (上の三角飾り) */}
    <path d="M -134 -500 L 0 -558 L 134 -500 Z" fill="#3F5944" stroke={KRP.ink} strokeWidth={6} />
    {/* 商品プレート */}
    <rect x={-108} y={-472} width={216} height={62} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <text x={0} y={-430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink} letterSpacing={1.5}>POST CARDS</text>
    {/* コイン投入口 */}
    <rect x={-72} y={-392} width={60} height={50} rx={6} fill="#3F5944" stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={-50} y={-380} width={16} height={28} rx={4} fill={KRP.ink} />
    {/* 1ペニー表示 */}
    <circle cx={44} cy={-366} r={27} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
    <text x={44} y={-355} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink} opacity={0.75}>1d</text>
    {/* 胴の飾り線 */}
    <line x1={-96} y1={-316} x2={96} y2={-316} stroke={KRP.ink} strokeWidth={3.5} opacity={0.35} />
    {/* 取り出しトレイ */}
    <rect x={-82} y={-240} width={164} height={74} rx={8} fill="#3F5944" stroke={KRP.ink} strokeWidth={5} />
    <rect x={-64} y={-222} width={128} height={40} rx={6} fill={KRP.ink} opacity={0.85} />
    {/* 下の飾りパネル */}
    <rect x={-94} y={-130} width={188} height={64} rx={8} fill="#45604A" stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
  </g>
);

// はがき自販機の断面 (外箱+空洞+てこ+かんぬき+はがき棚)。(960,910) が底の中央。
// ang=てこの傾き (マイナスで左が下がる)、slide=かんぬきの右スライド、cards=棚の残り枚数
const PostcardCutBox: React.FC<{
  ang?: number; slide?: number; cards?: number; innerOpacity?: number; children?: React.ReactNode;
}> = ({ ang = 0, slide = 0, cards = 7, innerOpacity = 1, children }) => {
  const aR = (ang * Math.PI) / 180;
  const rx2 = -40 + 200 * Math.cos(aR), ry2 = -320 + 200 * Math.sin(aR); // てこ右端
  return (
    <g transform="translate(960 910)">
      {/* 外箱 */}
      <rect x={-330} y={-680} width={660} height={680} rx={16} fill="#4E6B52" stroke={KRP.ink} strokeWidth={8} />
      {/* コイン投入口 (上面左) */}
      <rect x={-216} y={-702} width={56} height={26} rx={6} fill="#3F5944" stroke={KRP.ink} strokeWidth={5} />
      <rect x={-200} y={-696} width={24} height={16} fill={KRP.ink} />
      {/* 取り出し口 (前面下) */}
      <rect x={30} y={-120} width={240} height={34} rx={8} fill={KRP.ink} opacity={0.85} />
      <g opacity={innerOpacity}>
        {/* 空洞 */}
        <rect x={-282} y={-620} width={564} height={576} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        {/* コインのガイド (投入口→てこ左の皿) */}
        <line x1={-214} y1={-620} x2={-228} y2={-430} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        <line x1={-162} y1={-620} x2={-176} y2={-430} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        {/* はがきの棚 (右) */}
        <rect x={44} y={-612} width={212} height={146} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        {Array.from({ length: Math.max(cards, 0) }).map((_, i) => (
          <rect key={i} x={60} y={-484 - i * 18} width={180} height={16} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* かんぬきの受け (右の壁) */}
        <rect x={282} y={-486} width={48} height={66} fill="#3F5944" stroke={KRP.ink} strokeWidth={4.5} />
        {/* かんぬき (棚の底を支える) → 右へスライドではがきが落ちる */}
        <rect x={150 + slide} y={-468} width={96} height={26} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        {/* ロッド (てこ右端→かんぬき) */}
        <line x1={rx2} y1={ry2} x2={158 + slide} y2={-455} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.75} />
        {/* てこ (支点 -40,-320) */}
        <g transform={`rotate(${ang} -40 -320)`}>
          <rect x={-240} y={-332} width={400} height={22} rx={8} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
          {/* 左端のコイン受け皿 */}
          <path d="M -244 -340 L -186 -340 L -196 -310 L -234 -310 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={-40} cy={-320} r={13} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
        {/* はがきの通り道→トレイ (下) */}
        <line x1={52} y1={-452} x2={44} y2={-156} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
        <path d="M 40 -150 L 260 -150 L 260 -82 L 40 -82 Z" fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* コイン箱 (左下) */}
        <rect x={-260} y={-160} width={150} height={74} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {children}
      </g>
    </g>
  );
};

// ガム自販機 (柱の上の赤箱)。x,y=底の中央。s=1 で高さ約540
const GumMachine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 足元の台 */}
    <rect x={-70} y={-20} width={140} height={20} rx={6} fill="#6B625A" stroke={KRP.ink} strokeWidth={5} />
    {/* 柱 */}
    <rect x={-17} y={-308} width={34} height={288} rx={8} fill="#6B625A" stroke={KRP.ink} strokeWidth={5.5} />
    {/* 赤箱 */}
    <rect x={-105} y={-540} width={210} height={240} rx={12} fill="#B4433A" stroke={KRP.ink} strokeWidth={7} />
    {/* プレート */}
    <rect x={-92} y={-514} width={184} height={56} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
    <text x={0} y={-477} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink} letterSpacing={1}>ADAMS GUM</text>
    {/* コイン投入口 */}
    <rect x={-60} y={-438} width={44} height={42} rx={6} fill="#8E3630" stroke={KRP.ink} strokeWidth={4} />
    <rect x={-45} y={-428} width={13} height={22} rx={3} fill={KRP.ink} />
    {/* ハンドル */}
    <rect x={38} y={-444} width={12} height={54} rx={5} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={44} cy={-416} r={23} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 取り出し口 */}
    <rect x={-44} y={-358} width={88} height={34} rx={8} fill={KRP.ink} opacity={0.85} />
  </g>
);

// 蒸気機関車 (右向き)。x,y=先頭の足元 (レール上)。客車1両つき
const SteamTrain: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 機関車 (キャブ+ボイラー) */}
    <rect x={-40} y={-150} width={240} height={116} rx={12} fill="#3E4A44" stroke={KRP.ink} strokeWidth={6} />
    <rect x={160} y={-128} width={132} height={94} rx={20} fill="#4A5468" stroke={KRP.ink} strokeWidth={6} />
    <rect x={-52} y={-172} width={132} height={24} rx={8} fill={KRP.ink} />
    <rect x={-18} y={-132} width={48} height={44} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    {/* 煙突+煙 */}
    <rect x={238} y={-178} width={30} height={52} rx={6} fill={KRP.ink} />
    {[0, 1, 2].map((i) => {
      const t = ((f * 2 + i * 34) % 100) / 100;
      return <circle key={i} cx={253 + t * 72} cy={-192 - t * 95} r={12 + t * 20} fill={KRP.grayDark} opacity={0.35 * (1 - t)} />;
    })}
    {/* 車輪 */}
    {[0, 92, 204].map((wx) => (
      <g key={wx} transform={`translate(${wx} -34) rotate(${f * 8})`}>
        <circle r={34} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-27} y1={0} x2={27} y2={0} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={0} y1={-27} x2={0} y2={27} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    ))}
    {/* 客車 */}
    <rect x={-336} y={-142} width={276} height={104} rx={12} fill="#8E3630" stroke={KRP.ink} strokeWidth={6} />
    {[-306, -244, -182, -120].map((wx) => (
      <rect key={wx} x={wx} y={-122} width={42} height={42} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    ))}
    {[-296, -112].map((wx) => (
      <g key={wx} transform={`translate(${wx} -26) rotate(${f * 8})`}>
        <circle r={26} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-20} y1={0} x2={20} y2={0} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
  </g>
);

// 高架鉄道用の小型タンク機関車 (フォーニー型・右向き)。テンダーなし・ずんぐり小ぶり。
// 1880年代のNY高架鉄道で実際に使われていた型。x,y=先頭の足元 (レール上)。客車1両つき
const ElTrain: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* ボイラー (短い) */}
    <rect x={-20} y={-126} width={150} height={92} rx={14} fill="#3E4A44" stroke={KRP.ink} strokeWidth={6} />
    {/* 蒸気ドーム */}
    <rect x={26} y={-146} width={36} height={22} rx={10} fill="#3E4A44" stroke={KRP.ink} strokeWidth={5} />
    {/* キャブ (後ろ・背が高い) + 窓 */}
    <rect x={-122} y={-166} width={106} height={132} rx={10} fill="#4A5468" stroke={KRP.ink} strokeWidth={6} />
    <rect x={-106} y={-148} width={38} height={40} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    {/* キャブ屋根 */}
    <rect x={-134} y={-178} width={130} height={16} rx={6} fill={KRP.ink} />
    {/* 煙突 (短い・上が広がるかさ付き) */}
    <rect x={92} y={-166} width={22} height={40} rx={5} fill={KRP.ink} />
    <rect x={83} y={-176} width={40} height={14} rx={5} fill={KRP.ink} />
    {/* 煙 (ループ) */}
    {[0, 1, 2].map((i) => {
      const t = ((f * 2 + i * 34) % 100) / 100;
      return <circle key={i} cx={103 + t * 58} cy={-182 - t * 80} r={10 + t * 16} fill={KRP.grayDark} opacity={0.35 * (1 - t)} />;
    })}
    {/* 動輪 (前の2つは大きめ) */}
    {[22, 86].map((wx) => (
      <g key={wx} transform={`translate(${wx} -30) rotate(${f * 8})`}>
        <circle r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={-23} y1={0} x2={23} y2={0} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={0} y1={-23} x2={0} y2={23} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    ))}
    {/* 従輪 (キャブ下・小さい) */}
    {[-96, -48].map((wx) => (
      <g key={wx} transform={`translate(${wx} -22) rotate(${f * 10})`}>
        <circle r={22} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-16} y1={0} x2={16} y2={0} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {/* 連結棒 */}
    <line x1={-140} y1={-44} x2={-118} y2={-44} stroke={KRP.ink} strokeWidth={6} />
    {/* 木造客車 1両 (軽め・小ぶり) */}
    <rect x={-384} y={-132} width={244} height={94} rx={12} fill="#8E3630" stroke={KRP.ink} strokeWidth={6} />
    {[-354, -300, -246, -192].map((wx) => (
      <rect key={wx} x={wx} y={-114} width={38} height={38} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    ))}
    {[-348, -176].map((wx) => (
      <g key={wx} transform={`translate(${wx} -24) rotate(${f * 10})`}>
        <circle r={24} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-18} y1={0} x2={18} y2={0} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
  </g>
);

// 郵便馬車 (左向き)。x,y=地面の基準
const MailCoach: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 馬 (左向き) */}
    <g transform="translate(-300 0)">
      <ellipse cx={0} cy={-122} rx={95} ry={52} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={5.5} />
      {[-55, -20, 25, 60].map((lx, i) => (
        <line key={lx} x1={lx} y1={-88} x2={lx + Math.sin(f / 4 + i * 1.7) * 14} y2={0}
          stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
      ))}
      {/* 首 (立ち上がる) */}
      <path d="M -28 -152 Q -44 -200 -50 -244 L -94 -236 Q -82 -190 -76 -140 Z" fill="#7C5B3A" stroke={KRP.ink} strokeWidth={5} />
      {/* 頭 (左向き・水平) */}
      <path d="M -44 -248 Q -44 -266 -72 -272 Q -120 -278 -134 -258 Q -138 -242 -112 -238 Q -74 -234 -56 -240 Q -46 -242 -44 -248 Z" fill="#7C5B3A" stroke={KRP.ink} strokeWidth={5} />
      {/* 耳 */}
      <path d="M -60 -270 L -50 -296 L -38 -266 Z" fill="#7C5B3A" stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={-108} cy={-258} r={4.5} fill={KRP.ink} />
      {/* たてがみ・しっぽ */}
      <path d="M -24 -156 Q -34 -200 -44 -246" fill="none" stroke={KRP.ink} strokeWidth={6} opacity={0.6} strokeLinecap="round" />
      <path d="M 92 -132 Q 132 -112 124 -58" fill="none" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
    </g>
    {/* つなぎ棒 */}
    <line x1={-212} y1={-112} x2={-62} y2={-112} stroke={KRP.ink} strokeWidth={7} />
    {/* 車体 */}
    <rect x={-70} y={-232} width={300} height={152} rx={14} fill="#8E3630" stroke={KRP.ink} strokeWidth={6.5} />
    <text x={80} y={-138} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={33} fill={KRP.cream} letterSpacing={2}>ROYAL MAIL</text>
    {/* 御者台 */}
    <rect x={-116} y={-204} width={52} height={28} rx={6} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={4.5} />
    {/* 車輪 */}
    {[-20, 170].map((wx) => (
      <g key={wx} transform={`translate(${wx} -46) rotate(${-f * 6})`}>
        <circle r={46} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        {[0, 60, 120].map((aa) => (
          <line key={aa} x1={-41} y1={0} x2={41} y2={0} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${aa})`} />
        ))}
      </g>
    ))}
  </g>
);

// ロンドンの地図ボード (白カード+テムズ川+ミニ自販機がポンポン増える)
const LondonMapBoard: React.FC<{ f: number; count: number; interval: number; start?: number }> = ({
  f, count, interval, start = 20,
}) => {
  const spots: Array<[number, number]> = [
    [520, 420], [760, 330], [1020, 420], [1260, 330], [1430, 470],
    [620, 610], [900, 560], [1150, 640], [1380, 700], [480, 760],
    [740, 790], [1000, 820], [1240, 840], [1520, 590], [560, 300],
    [860, 700], [1340, 420], [1480, 800], [420, 540], [700, 460],
    [1120, 300], [960, 720], [1560, 350], [820, 870],
  ];
  const river = "M 280 640 Q 620 540 940 620 Q 1260 700 1640 580";
  return (
    <g>
      <rect x={280} y={170} width={1360} height={760} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      {/* 道 (うっすら) */}
      {[[480, 170, 560, 930], [900, 170, 820, 930], [1300, 170, 1400, 930]].map((l, i) => (
        <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={KRP.ink} strokeWidth={5} opacity={0.1} />
      ))}
      {[[280, 360, 1640, 300], [280, 800, 1640, 850]].map((l, i) => (
        <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={KRP.ink} strokeWidth={5} opacity={0.1} />
      ))}
      {/* テムズ川 */}
      <path d={river} fill="none" stroke={KRP.blueSoft} strokeWidth={54} strokeLinecap="round" />
      <path d={river} fill="none" stroke={KRP.blueDeep} strokeWidth={4} opacity={0.35} />
      <text x={340} y={246} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.grayDark} letterSpacing={6}>LONDON</text>
      {/* ミニ自販機 */}
      {spots.slice(0, count).map(([mx, my], i) => {
        const t = pop(seg(f, start + i * interval, start + i * interval + 14));
        if (t <= 0.01) return null;
        return (
          <g key={i} transform={`translate(${mx} ${my}) scale(${t})`}>
            <rect x={-15} y={-23} width={30} height={46} rx={4} fill="#4E6B52" stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -17 -23 L 0 -31 L 17 -23 Z" fill="#3F5944" stroke={KRP.ink} strokeWidth={3} />
            <rect x={-9} y={-16} width={18} height={10} rx={2} fill={KRP.cream} stroke={KRP.ink} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

// ===== 第3章のシーン (49〜70) =====

// 49: 章扉 (大時計の針がぐるぐる→1883で止まる)
const SceneCh3Door: React.FC<{ f: number }> = ({ f }) => {
  const spinT = easeOut(seg(f, 0, 60));
  const year = Math.round(1822 + 61 * spinT);
  const minuteAng = (1 - spinT) * -1440;
  const hourAng = (1 - spinT) * -150;
  const flagT = pop(seg(f, 66, 80));
  const stampOn = f >= 84;
  const titleT = easeOut(seg(f, 78, 96));
  const cx = 710, cy = 470, r = 330;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={110} />
        <g filter="url(#wobbleSoft)">
          {/* 大時計 */}
          <circle cx={cx} cy={cy} r={r + 28} fill={KRP.brass} stroke={KRP.ink} strokeWidth={9} />
          <circle cx={cx} cy={cy} r={r} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line key={i} x1={cx + Math.sin(a) * (r - 20)} y1={cy - Math.cos(a) * (r - 20)}
                x2={cx + Math.sin(a) * (r - 56)} y2={cy - Math.cos(a) * (r - 56)}
                stroke={KRP.ink} strokeWidth={i % 3 === 0 ? 10 : 5} />
            );
          })}
          {/* 針 */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.46} stroke={KRP.ink} strokeWidth={18}
            strokeLinecap="round" transform={`rotate(${hourAng} ${cx} ${cy})`} />
          <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.72} stroke={KRP.ink} strokeWidth={10}
            strokeLinecap="round" transform={`rotate(${minuteAng} ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {/* 台座 */}
          <path d={`M ${cx - 150} ${cy + r + 28} L ${cx + 150} ${cy + r + 28} L ${cx + 105} ${cy + r + 95} L ${cx - 105} ${cy + r + 95} Z`}
            fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </svg>
      {/* 年号カウント */}
      <div style={{
        position: "absolute", left: cx, top: cy + 100, transform: "translateX(-50%)",
        fontFamily: FONT, fontWeight: 900, fontSize: 68, color: KRP.grayDark, letterSpacing: 6,
      }}>{year}</div>
      {/* 国旗 (ポン) */}
      {flagT > 0.01 && (
        <svg width={W} height={H} style={abs}>
          <WobbleDefs seed={111} />
          <g filter="url(#wobbleSoft)" transform={`translate(1430 330) scale(${flagT}) translate(-1430 -330)`}>
            <FlagCard kind="uk" x={1430} y={330} s={1.35} />
          </g>
        </svg>
      )}
      {stampOn && <Stamp x={1230} y={470} text="1883年 ロンドン" size={46} />}
      <div style={{
        position: "absolute", left: 1130, top: 620, width: 760,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>第3章</div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 60, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10, whiteSpace: "nowrap", width: "fit-content",
        }}>駅と切手といたずらと</div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 50: 産業革命のロンドン (煙突の煙もくもく)
const SceneIndustrial: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paperCool }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={111} />
      <g filter="url(#wobbleSoft)">
        {/* 奥の町なみ (シルエット) */}
        <path d={`M 0 700 L 0 560 L 180 560 L 180 620 L 360 620 L 360 520 L 470 520 L 470 640 L 640 640 L 640 560 L 820 560 L 820 680 L 1040 680 L 1040 540 L 1180 540 L 1180 640 L 1400 640 L 1400 580 L 1560 580 L 1560 660 L 1760 660 L 1760 600 L 1920 600 L 1920 700 Z`}
          fill="#B8AD9C" stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
        {/* 手前の工場たち */}
        <rect x={120} y={700} width={420} height={330} fill="#A58D6F" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 120 700 L 330 620 L 540 700 Z" fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
        <rect x={760} y={660} width={520} height={370} fill="#8F7B66" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${760 + i * 174} 660 L ${847 + i * 174} 600 L ${934 + i * 174} 660 Z`}
            fill="#6E6256" stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={1460} y={720} width={380} height={310} fill="#A58D6F" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1460 720 L 1650 640 L 1840 720 Z" fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
        {/* 窓 */}
        {[180, 300, 420].map((wx) => (
          <rect key={wx} x={wx} y={780} width={70} height={90} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        ))}
        {[820, 980, 1140].map((wx) => (
          <rect key={wx} x={wx} y={740} width={66} height={84} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        ))}
        {[1540, 1680].map((wx) => (
          <rect key={wx} x={wx} y={790} width={66} height={84} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        ))}
        {/* 煙突 */}
        {[260, 880, 1210, 1640].map((cx2, i) => (
          <g key={cx2}>
            <rect x={cx2 - 28} y={380 + i * 40} width={56} height={240} fill="#6E6256" stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={cx2 - 36} y={366 + i * 40} width={72} height={22} rx={6} fill={KRP.ink} />
            {/* 煙 (ループ) */}
            {[0, 1, 2, 3].map((k) => {
              const t = ((f * 1.6 + k * 36 + i * 17) % 144) / 144;
              return (
                <circle key={k} cx={cx2 + Math.sin(t * 6 + i) * 30 + t * 50}
                  cy={356 + i * 40 - t * 260} r={16 + t * 34}
                  fill={KRP.grayDark} opacity={0.3 * (1 - t)} />
              );
            })}
          </g>
        ))}
        {/* 道 */}
        <rect x={0} y={1000} width={W} height={80} fill={KRP.floor} />
        <line x1={0} y1={1000} x2={W} y2={1000} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </svg>
    <LabelPill x={960} y={140} text="1883年 ロンドン" size={40} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 51: 蒸気機関車と郵便馬車がすれちがう
const SceneTrainMail: React.FC<{ f: number }> = ({ f }) => {
  const trainX = -700 + ((f * 10) % (W + 1400));
  const coachX = W + 500 - ((f * 7) % (W + 1500));
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={112} />
        <g filter="url(#wobbleSoft)">
          {/* 奥の丘 */}
          <path d="M 0 560 Q 480 440 960 540 Q 1440 640 1920 520 L 1920 760 L 0 760 Z" fill="#CBBC9B" opacity={0.7} />
          {/* 線路の土手 */}
          <rect x={0} y={640} width={W} height={60} fill="#B5A684" stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x={i * 124 + ((0) % 124)} y={648} width={56} height={14} rx={4} fill="#8F6B44" stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
          ))}
          <line x1={0} y1={644} x2={W} y2={644} stroke={KRP.ink} strokeWidth={6} />
          {/* 下の道 */}
          <rect x={0} y={960} width={W} height={120} fill={KRP.floor} />
          <line x1={0} y1={960} x2={W} y2={960} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 機関車 (奥、右へ) */}
          <SteamTrain x={trainX} y={644} f={f} s={0.92} />
          {/* 郵便馬車 (手前、左へ) */}
          <MailCoach x={coachX} y={1020} f={f} s={1.05} />
        </g>
      </svg>
      <LabelPill x={960} y={140} text="鉄道と郵便の時代" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 52: 発明家エヴェリットと特許証
const SceneEveritt: React.FC<{ f: number }> = ({ f }) => {
  const cardT = pop(seg(f, 24, 42));
  const sealT = pop(seg(f, 60, 76));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={113} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={960} cy={480} rx={760} ry={400} fill="#F5E6B8" opacity={0.14} />
        </g>
        <g filter="url(#wobble)">
          <TownPerson x={660} y={880} s={1.2} role="everitt" f={f} face="smile" gaze={[6, -2]} />
          {/* 特許証 */}
          {cardT > 0.01 && (
            <g transform={`translate(1320 510) scale(${cardT}) translate(-1320 -510)`}>
              <rect x={1040} y={300} width={560} height={420} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
              <rect x={1064} y={324} width={512} height={372} rx={10} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
              <text x={1320} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
                fill={KRP.ink} letterSpacing={10}>PATENT</text>
              {[440, 478, 516, 554].map((yy) => (
                <line key={yy} x1={1110} y1={yy} x2={1530} y2={yy} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
              ))}
              {/* 赤い印章 */}
              {sealT > 0.01 && (
                <g transform={`translate(1470 630) scale(${sealT}) translate(-1470 -630)`}>
                  <path d="M 1456 640 L 1444 700 L 1470 684 L 1496 700 L 1484 640 Z" fill="#8E3630" stroke={KRP.ink} strokeWidth={3.5} />
                  <circle cx={1470} cy={630} r={42} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                  <circle cx={1470} cy={630} r={28} fill="none" stroke={KRP.cream} strokeWidth={4} opacity={0.8} />
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={620} y={150} text="発明家 パーシヴァル・エヴェリット" size={36} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 53: はがき自販機 (正面)。コイン→はがきスッ (ループ)
const ScenePostcardMachine: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 120;
  const coinT = easeOut(seg(fc, 20, 44));
  const cardT = pop(seg(fc, 56, 84));
  const suT = pop(seg(fc, 60, 74)) * (1 - seg(fc, 100, 114));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={114} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={940} fill={KRP.paper} />
          {[240, 520, 800].map((yy) => (
            <line key={yy} x1={0} y1={yy} x2={W} y2={yy} stroke={KRP.ink} strokeWidth={3} opacity={0.08} />
          ))}
          <rect x={0} y={940} width={W} height={140} fill={KRP.floor} />
          <line x1={0} y1={940} x2={W} y2={940} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={960} cy={500} rx={620} ry={380} fill="#F5E6B8" opacity={0.15} />
        </g>
        <g filter="url(#wobble)">
          <PostcardMachine x={960} y={940} s={1.5} />
          {/* コイン (投入口へ) */}
          {fc >= 16 && fc < 46 && (
            <Coin cx={897} cy={180 + coinT * 200} r={26} fill={KRP.bronze} text="1d" />
          )}
          {/* はがき (トレイからスッ) */}
          {cardT > 0.01 && (
            <g transform={`translate(960 ${640 + (1 - cardT) * -30}) scale(${cardT})`} opacity={Math.min(1, cardT * 2)}>
              <Postcard x={0} y={0} s={1.35} rot={-4} />
            </g>
          )}
          {/* スッ */}
          {suT > 0.01 && (
            <text x={1130} y={620} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.grayDark}
              opacity={suT} transform={`translate(0 ${(1 - suT) * 20})`}>スッ</text>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={150} text="1ペニーで、はがき1枚" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 54: 地下鉄の駅ホームに置かれた機械 (奥を列車が通る)
const SceneStationPlatform: React.FC<{ f: number }> = ({ f }) => {
  const tx = -900 + ((f * 26) % (W + 1800));
  return (
    <AbsoluteFill style={{ background: "#5E564E" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={115} />
        <g filter="url(#wobbleSoft)">
          {/* トンネルの壁 (アーチ) */}
          <path d={`M 0 1080 L 0 420 Q 960 120 1920 420 L 1920 1080 Z`} fill="#6B625A" stroke={KRP.ink} strokeWidth={6} />
          {/* レンガ目地 */}
          {[300, 420, 540].map((yy, i) => (
            <path key={yy} d={`M 0 ${yy + 140} Q 960 ${yy - 140} 1920 ${yy + 140}`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.2} />
          ))}
          {/* 駅名ボード */}
          <rect x={700} y={300} width={520} height={86} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <text x={960} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42}
            fill={KRP.ink} letterSpacing={6}>MANSION HOUSE</text>
        </g>
        {/* 奥を通る列車 */}
        <g filter="url(#wobble)">
          <SteamTrain x={tx} y={780} f={f} s={0.9} />
        </g>
        <g filter="url(#wobbleSoft)">
          {/* ホーム (手前) */}
          <rect x={0} y={760} width={W} height={60} fill="#B5A684" stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={820} width={W} height={260} fill={KRP.floor} />
          <line x1={0} y1={816} x2={W} y2={816} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
          {/* 白線 */}
          <rect x={0} y={772} width={W} height={10} fill={KRP.white} opacity={0.8} />
        </g>
        <g filter="url(#wobble)">
          <PostcardMachine x={1430} y={1035} s={1.05} />
          {/* ガス灯 */}
          <rect x={320} y={620} width={16} height={420} rx={6} fill={KRP.ink} opacity={0.9} />
          <circle cx={328} cy={600} r={34} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5}
            opacity={0.85 + 0.1 * Math.sin(f / 7)} />
        </g>
      </svg>
      <LabelPill x={960} y={140} text="ロンドン 地下鉄の駅" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// 55: 「近代1号機」大写し+ハンコ
const SceneFirstModern: React.FC<{ f: number }> = ({ f }) => {
  const kira = Math.abs(Math.sin(f / 10));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={116} />
        <g filter="url(#wobbleSoft)">
          <ellipse cx={960} cy={560} rx={660} ry={460} fill="#F5E6B8" opacity={0.25} />
          <rect x={0} y={960} width={W} height={120} fill={KRP.floor} />
          <line x1={0} y1={960} x2={W} y2={960} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <PostcardMachine x={960} y={960} s={1.6} />
          {/* きらん */}
          {f > 40 && (
            <g opacity={0.4 + 0.6 * kira} transform={`translate(700 260) scale(${0.8 + 0.4 * kira})`}>
              <path d="M 0 -46 L 10 -10 L 46 0 L 10 10 L 0 46 L -10 10 L -46 0 L -10 -10 Z"
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            </g>
          )}
          {f > 56 && (
            <g opacity={0.3 + 0.5 * (1 - kira)} transform={`translate(1240 200) scale(${0.5 + 0.3 * (1 - kira)})`}>
              <path d="M 0 -46 L 10 -10 L 46 0 L 10 10 L 0 46 L -10 10 L -46 0 L -10 -10 Z"
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            </g>
          )}
        </g>
      </svg>
      {f >= 30 && <Stamp x={1370} y={330} text="近代1号機" size={56} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 56: はがき自販機の断面図 (中が見える)
const ScenePostcardCut: React.FC<{ f: number }> = ({ f }) => {
  const openT = easeOut(seg(f, 20, 48));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={117} />
        <g filter="url(#wobbleSoft)">
          <DiagramCard />
        </g>
        <g filter="url(#wobble)">
          <PostcardCutBox innerOpacity={openT} />
        </g>
      </svg>
      {f > 40 && <LabelPill x={400} y={190} text="断面図" size={40} color={KRP.red} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 57: 断面: コイン→てこ→かんぬきが開いてはがき1枚 (ループ)
const ScenePostcardLock: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 140;
  const fallT = easeOut(seg(fc, 8, 30));
  const tiltT = easeOut(seg(fc, 30, 46));
  const slideT = easeOut(seg(fc, 46, 58));
  const dropT = easeOut(seg(fc, 58, 80));
  const ang = -10 * tiltT;
  const slide = 90 * slideT;
  // コイン: 落下→てこの皿に乗って一緒に傾く
  const aR = (ang * Math.PI) / 180;
  const coinX = -40 + (-174) * Math.cos(aR) - (-42) * Math.sin(aR);
  const coinY = -320 + (-174) * Math.sin(aR) + (-42) * Math.cos(aR);
  const cx2 = -188 + (coinX + 188) * fallT;
  const cy2 = -700 + (coinY + 700) * fallT;
  // はがき: 棚から1枚落ちてトレイへ
  const cardY = -484 + dropT * 380;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={118} />
        <g filter="url(#wobbleSoft)">
          <DiagramCard />
        </g>
        <g filter="url(#wobble)">
          <PostcardCutBox ang={ang} slide={slide} cards={dropT > 0.02 ? 6 : 7}>
            {/* コイン */}
            {fc >= 8 && <Coin cx={cx2} cy={cy2} r={26} fill={KRP.bronze} text="1d" />}
            {/* 落ちる1枚 */}
            {dropT > 0.02 && (
              <rect x={56 - dropT * 8} y={cardY} width={180} height={16} rx={4}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
                transform={`rotate(${dropT * -6} ${146} ${cardY})`} />
            )}
          </PostcardCutBox>
        </g>
      </svg>
      {fc >= 36 && fc < 120 && <LabelPill x={1360} y={400} text="重さでロックが開く" size={34} color={KRP.red} />}
      <LabelPill x={400} y={190} text="断面図" size={40} color={KRP.red} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 58: 断面: はがきを取ると、てこもかんぬきも元どおり
const SceneLockReturn: React.FC<{ f: number }> = ({ f }) => {
  const takeT = easeOut(seg(f, 10, 34));
  const coinSlideT = easeOut(seg(f, 34, 56));
  const leverT = easeOut(seg(f, 56, 72));
  const boltT = easeOut(seg(f, 72, 84));
  const kaT = pop(seg(f, 84, 98)) * (1 - seg(f, 126, 140));
  const ang = -10 * (1 - leverT);
  const slide = 90 * (1 - boltT);
  // コイン: 皿から左へ滑ってコイン箱へ
  const aR = (ang * Math.PI) / 180;
  const panX = -40 + (-174) * Math.cos(aR) - (-42) * Math.sin(aR);
  const panY = -320 + (-174) * Math.sin(aR) + (-42) * Math.cos(aR);
  const cx2 = panX + (-185 - panX) * coinSlideT;
  const cy2 = panY + (-120 - panY) * easeOut(coinSlideT);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={119} />
        <g filter="url(#wobbleSoft)">
          <DiagramCard />
        </g>
        <g filter="url(#wobble)">
          <PostcardCutBox ang={ang} slide={slide} cards={6}>
            {/* コイン (箱へ) */}
            {coinSlideT < 0.98 && <Coin cx={cx2} cy={cy2} r={26} fill={KRP.bronze} text="1d" />}
            {/* トレイのはがき (取られてフェード) */}
            <g opacity={1 - takeT} transform={`translate(0 ${-takeT * 120})`}>
              <rect x={60} y={-114} width={180} height={16} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
            {/* カチリ */}
            {kaT > 0.01 && (
              <text x={200} y={-540} fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.red}
                opacity={kaT} textAnchor="middle">カチリ</text>
            )}
          </PostcardCutBox>
        </g>
      </svg>
      {f >= 90 && <LabelPill x={1360} y={400} text="次の1枚は、また1ペニー" size={34} />}
      <LabelPill x={400} y={190} text="断面図" size={40} color={KRP.red} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 59: ヘロンの壺と並べて比較 (どちらもコインの重さ)
const SceneHeronCompare: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 120;
  const fallT = easeOut(seg(fc, 10, 34));
  const tiltT = easeOut(seg(fc, 34, 50));
  const fxT = seg(fc, 50, 80);
  const ang = -10 * tiltT;
  // 右 (はがき機ミニ) 用のコイン座標
  const aR = (ang * Math.PI) / 180;
  const panX = -40 + (-174) * Math.cos(aR) - (-42) * Math.sin(aR);
  const panY = -320 + (-174) * Math.sin(aR) + (-42) * Math.cos(aR);
  const rcx = -188 + (panX + 188) * fallT;
  const rcy = -700 + (panY + 700) * fallT;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={120} />
        {/* 中央の仕切り */}
        <line x1={960} y1={140} x2={960} y2={940} stroke={KRP.ink} strokeWidth={5} strokeDasharray="4 26" opacity={0.5} />
        <g filter="url(#wobble)">
          {/* 左: ヘロンの壺 (ミニ断面) */}
          <g transform="translate(480 900) scale(0.95)">
            {/* 壺の断面 */}
            <path d="M -150 -560 L 150 -560 L 120 -490 Q 196 -380 178 -170 Q 160 0 0 0 Q -160 0 -178 -170 Q -196 -380 -120 -490 Z"
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={7} />
            <path d="M -118 -530 L 118 -530 L 94 -474 Q 158 -372 142 -176 Q 128 -30 0 -30 Q -128 -30 -142 -176 Q -158 -372 -94 -474 Z"
              fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
            {/* 投入口 */}
            <rect x={-34} y={-574} width={68} height={16} rx={5} fill={KRP.ink} />
            {/* 水 */}
            <path d="M -136 -200 Q 0 -170 136 -200 L 128 -70 Q 110 -30 0 -30 Q -110 -30 -128 -70 Z"
              fill={KRP.blueSoft} opacity={0.85} />
            {/* てこ (支点 0,-330) */}
            <g transform={`rotate(${ang} 0 -330)`}>
              <rect x={-120} y={-340} width={240} height={18} rx={7} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={4.5} />
              <path d="M -124 -346 L -78 -346 L -86 -320 L -116 -320 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
              {/* 弁を引くひも */}
              <line x1={110} y1={-330} x2={116} y2={-150} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
            </g>
            <circle cx={0} cy={-330} r={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            {/* 注ぎ口+水 */}
            <path d="M 168 -240 L 230 -224 L 230 -198 L 172 -206 Z" fill="#A66A3E" stroke={KRP.ink} strokeWidth={4.5} />
            {fxT > 0.02 && fxT < 0.98 && (
              <path d={`M 222 -204 Q 230 ${-150 + fxT * 40} 224 ${-90 + fxT * 60}`} fill="none"
                stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" opacity={0.9} />
            )}
            {/* コイン (左): 投入口→てこの皿 */}
            {fc >= 10 && (
              <Coin
                cx={0 + ((-100) * Math.cos(aR) - (-30) * Math.sin(aR) - 0) * fallT}
                cy={-610 + ((-330 + (-100) * Math.sin(aR) + (-30) * Math.cos(aR)) + 610) * fallT}
                r={22} fill={KRP.gold} />
            )}
          </g>
          {/* 右: はがき自販機 (ミニ断面) */}
          <g transform="translate(1440 980) scale(0.72) translate(-960 -910)">
            <PostcardCutBox ang={ang} slide={90 * seg(fc, 50, 62)} cards={7}>
              {fc >= 8 && <Coin cx={rcx} cy={rcy} r={26} fill={KRP.bronze} text="1d" />}
            </PostcardCutBox>
          </g>
        </g>
      </svg>
      <LabelPill x={480} y={150} text="紀元1世紀 ヘロンの壺" size={34} centerX />
      <LabelPill x={1440} y={150} text="1883年 はがき自販機" size={34} centerX />
      <LabelPill x={960} y={960} text="主役は コインの重さ" size={40} color={KRP.red} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 60: 大当たり (機械の前に行列)
const ScenePostcardHit: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={121} />
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={920} width={W} height={160} fill={KRP.floor} />
        <line x1={0} y1={920} x2={W} y2={920} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={700} cy={480} rx={640} ry={380} fill="#F5E6B8" opacity={0.14} />
      </g>
      <g filter="url(#wobble)">
        <PostcardMachine x={380} y={920} s={1.25} />
        {/* ひらひら落ちるはがき */}
        {[0, 1, 2].map((i) => {
          const t = ((f * 1.4 + i * 50) % 150) / 150;
          return (
            <Postcard key={i} x={560 + i * 60 + Math.sin(t * 9 + i) * 40} y={260 + t * 560}
              s={0.9} rot={Math.sin(t * 7 + i * 2) * 30} />
          );
        })}
        {/* 行列 */}
        <TownPerson x={820} y={920} s={1.12} role="tophat" f={f} phase={0} gaze={[-7, 0]} />
        <TownPerson x={1030} y={920} s={1.12} role="barkeep" f={f} phase={1} gaze={[-7, 0]} />
        <TownPerson x={1240} y={920} s={1.12} role="smoker" f={f} phase={2} gaze={[-7, 0]} />
        <TownPerson x={1440} y={920} s={1.12} role="newsboy" f={f} phase={3} gaze={[-7, 0]} face="smile" />
      </g>
    </svg>
    <LabelPill x={1180} y={150} text="手紙の時代に、大当たり" size={40} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 61: 地図に機械がどんどん増える
const SceneMapSpread: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paperCool }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={122} />
      <g filter="url(#wobbleSoft)">
        <LondonMapBoard f={f} count={10} interval={9} />
      </g>
    </svg>
    <LabelPill x={960} y={975} text="駅や郵便局に、どんどん" size={38} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 62: ところが、です (暗転+巨大ビックリマーク)
const SceneTokoroga: React.FC<{ f: number }> = ({ f }) => {
  const zoomT = easeOut(seg(f, 6, 26));
  const sc = 2.6 - 1.6 * zoomT;
  return (
    <AbsoluteFill style={{ background: "#4A443C" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={123} />
        <g filter="url(#wobbleSoft)">
          {/* 集中線 */}
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2 + 0.12;
            return (
              <line key={i} x1={960 + Math.cos(a) * 1350} y1={500 + Math.sin(a) * 1350}
                x2={960 + Math.cos(a) * (480 + 40 * Math.sin(f / 8 + i))} y2={500 + Math.sin(a) * (480 + 40 * Math.sin(f / 8 + i))}
                stroke={KRP.cream} strokeWidth={9} strokeLinecap="round" opacity={0.22} />
            );
          })}
        </g>
        <g filter="url(#wobble)" opacity={seg(f, 4, 10)}>
          <g transform={`translate(960 500) scale(${sc}) translate(-960 -500)`}>
            <text x={960} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={520}
              fill={KRP.red} stroke={KRP.cream} strokeWidth={10} paintOrder="stroke">！</text>
          </g>
        </g>
      </svg>
      {f > 34 && <LabelPill x={960} y={880} text="ところが、です" size={46} centerX />}
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// 63: エヴェリットのため息
const SceneEverittSigh: React.FC<{ f: number }> = ({ f }) => {
  const lean = 6 * easeOut(seg(f, 20, 50));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={124} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* 机と日記 */}
          <rect x={1140} y={720} width={520} height={34} rx={8} fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1190} y={754} width={40} height={126} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={5} />
          <rect x={1570} y={754} width={40} height={126} fill="#7C5B3A" stroke={KRP.ink} strokeWidth={5} />
          <g transform="translate(1400 700) rotate(-4)">
            <rect x={-130} y={-16} width={260} height={32} rx={6} fill="#8F6B44" stroke={KRP.ink} strokeWidth={5} />
            <rect x={-120} y={-24} width={240} height={14} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <line x1={-60} y1={-17} x2={60} y2={-17} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          </g>
        </g>
        <g filter="url(#wobble)">
          <TownPerson x={820} y={880} s={1.3} role="everitt" f={f} face="worried" lean={lean} gaze={[4, 6]} />
          {/* ため息 (ループ) */}
          {[0, 1].map((i) => {
            const t = ((f * 1.3 + i * 55) % 110) / 110;
            return (
              <g key={i} opacity={0.75 * (1 - t) * seg(f, 40, 50)}
                transform={`translate(${980 + t * 110} ${600 - t * 90}) scale(${0.7 + t * 0.6})`}>
                <ellipse cx={0} cy={0} rx={64} ry={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={KRP.grayDark}>はぁ</text>
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={640} y={150} text="発明者本人の嘆き" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 64: 真顔でオレンジの皮を入れる紳士 (ループ)
const SceneOrangePeel: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 150;
  const raise = easeOut(seg(fc, 20, 48));
  const back = easeOut(seg(fc, 104, 128));
  const reach = raise * (1 - back);
  const peelS = 1 - seg(fc, 84, 100);
  const armOut = fc >= 16 && fc <= 132;
  const bob = Math.sin(f / 13) * 3 * 1.25;
  const sx = 724, sy = 715 + bob;
  const hx = sx + (1210 - sx) * reach;
  const hy = 810 + bob + (500 - 810 - bob) * reach;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={125} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={920} width={W} height={160} fill={KRP.floor} />
          <line x1={0} y1={920} x2={W} y2={920} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <PostcardMachine x={1300} y={920} s={1.2} />
          <TownPerson x={640} y={900} s={1.25} role="tophat" f={f} gaze={[7, -2]}
            hideArm={armOut ? "right" : undefined} />
          {/* のばす腕 (右) */}
          {armOut && (
            <g>
              <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={34} strokeLinecap="round" />
              <line x1={sx} y1={sy} x2={hx} y2={hy} stroke="#4A5468" strokeWidth={25} strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          )}
          {/* オレンジの皮 */}
          {fc >= 10 && fc < 102 && peelS > 0.02 && (
            <g transform={`translate(${armOut ? hx : 724} ${(armOut ? hy : 810 + bob) - 28}) scale(${peelS})`}>
              <path d="M -30 2 Q 0 -22 30 2 Q 16 14 0 12 Q -16 14 -30 2 Z"
                fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -22 0 Q 0 -14 22 0" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={150} text="真顔で、オレンジの皮を" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 65: 機械 vs いたずら
const SceneMachineVsMan: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.4 + 0.6 * Math.abs(Math.sin(f / 6));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={126} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={940} width={W} height={140} fill={KRP.floor} />
          <line x1={0} y1={940} x2={W} y2={940} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <PostcardMachine x={560} y={940} s={1.3} />
          <TownPerson x={1400} y={900} s={1.3} role="tophat" f={f} gaze={[-7, 0]} />
          <Bolt x={944} y={400} s={1.6} opacity={flick} />
          <text x={960} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
            fill={KRP.red} letterSpacing={8} opacity={0.85}>VS</text>
        </g>
      </svg>
      <LabelPill x={960} y={150} text="機械 vs いたずら" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 66: それでも広がる (地図2回目、速い)
const SceneMapSpread2: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paperCool }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={127} />
      <g filter="url(#wobbleSoft)">
        <LondonMapBoard f={f} count={24} interval={4} start={12} />
      </g>
    </svg>
    <LabelPill x={960} y={975} text="便利さは止まらない" size={38} centerX />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// 67: 1888年、船でニューヨークへ
const SceneToNY: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 560, r = 400, lon0 = -38;
  const ukP = globePoint(cx, cy, r, -0.1, 51.5, lon0);
  const nyP = globePoint(cx, cy, r, -74, 40.7, lon0);
  const arcT = seg(f, 12, 70);
  const shipT = easeOut(seg(f, 16, 96));
  const mx = (ukP.x + nyP.x) / 2, my = Math.min(ukP.y, nyP.y) - 220;
  const u = shipT, a2 = (1 - u) * (1 - u), b2 = 2 * (1 - u) * u, c2 = u * u;
  const sx2 = a2 * ukP.x + b2 * mx + c2 * nyP.x;
  const sy2 = a2 * ukP.y + b2 * my + c2 * nyP.y;
  const rock = Math.sin(f / 9) * 5;
  const flagT = pop(seg(f, 104, 118));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={128} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          <DashArc x1={ukP.x} y1={ukP.y} x2={nyP.x} y2={nyP.y} t={arcT} lift={220} />
          <MapPin x={nyP.x} y={nyP.y} t={seg(f, 98, 112)} />
          {/* 船 (弧の上を進む) */}
          {shipT > 0.01 && shipT < 0.99 && (
            <g transform={`translate(${sx2} ${sy2 - 26}) rotate(${rock})`}>
              <path d="M -66 0 L 66 0 L 44 30 L -44 30 Z" fill="#8E3630" stroke={KRP.ink} strokeWidth={5} />
              <rect x={-40} y={-20} width={80} height={20} rx={5} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-10} y={-52} width={20} height={32} rx={4} fill={KRP.ink} />
              {[0, 1].map((i) => {
                const t = ((f * 2.4 + i * 40) % 80) / 80;
                return <circle key={i} cx={0 - t * 50} cy={-60 - t * 36} r={8 + t * 12} fill={KRP.grayDark} opacity={0.4 * (1 - t)} />;
              })}
            </g>
          )}
        </g>
      </svg>
      {flagT > 0.01 && (
        <svg width={W} height={H} style={abs}>
          <WobbleDefs seed={129} />
          <g filter="url(#wobbleSoft)" transform={`translate(1620 300) scale(${flagT}) translate(-1620 -300)`}>
            <FlagCard kind="usa" x={1620} y={300} s={1.25} />
          </g>
        </svg>
      )}
      <LabelPill x={330} y={150} text="1888年 ニューヨークへ" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 68: ニューヨーク高架鉄道の駅とガム自販機
const SceneNYStation: React.FC<{ f: number }> = ({ f }) => {
  const tx = -800 + ((f * 18) % (W + 1600));
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={129} />
        <g filter="url(#wobbleSoft)">
          {/* 奥のビル群 */}
          {[[60, 260, 240], [360, 180, 300], [660, 320, 220], [980, 200, 280], [1300, 300, 260], [1620, 220, 240]].map((b, i) => (
            <g key={i}>
              <rect x={b[0]} y={b[1]} width={b[2]} height={900 - b[1]} fill={i % 2 ? "#B8AD9C" : "#A59A88"} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2].map((r2) => (
                [0, 1].map((c2) => (
                  <rect key={`${r2}-${c2}`} x={b[0] + 36 + c2 * (b[2] / 2 - 20)} y={b[1] + 50 + r2 * 100}
                    width={48} height={62} rx={5} fill={KRP.yellow} opacity={0.75} stroke={KRP.ink} strokeWidth={3} />
                ))
              ))}
            </g>
          ))}
        </g>
        {/* 高架の列車 */}
        <g filter="url(#wobble)">
          <ElTrain x={tx} y={432} f={f} s={0.82} />
        </g>
        <g filter="url(#wobbleSoft)">
          {/* 高架橋 */}
          <rect x={0} y={432} width={W} height={46} fill="#6E6256" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 10 }).map((_, i) => (
            <path key={i} d={`M ${i * 200} 478 L ${i * 200 + 100} 432 L ${i * 200 + 200} 478 Z`}
              fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={0.7} />
          ))}
          <line x1={0} y1={478} x2={W} y2={478} stroke={KRP.ink} strokeWidth={5} />
          {/* 柱 */}
          {[240, 760, 1280, 1800].map((px2) => (
            <g key={px2}>
              <rect x={px2 - 26} y={478} width={52} height={462} fill="#6E6256" stroke={KRP.ink} strokeWidth={5.5} />
              <path d={`M ${px2 - 70} 940 L ${px2 + 70} 940 L ${px2 + 44} 900 L ${px2 - 44} 900 Z`} fill="#6E6256" stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          {/* 道 */}
          <rect x={0} y={940} width={W} height={140} fill={KRP.floor} />
          <line x1={0} y1={940} x2={W} y2={940} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <GumMachine x={1000} y={940} s={1.15} />
        </g>
      </svg>
      <LabelPill x={960} y={140} text="ニューヨーク 高架鉄道の駅" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 69: 新聞売りの少年がガムを買う (ループ)
const SceneNewsboyGum: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 140;
  const go = easeOut(seg(fc, 10, 36));
  const back = easeOut(seg(fc, 44, 66));
  const reach = go * (1 - back);
  const armOut = fc >= 6 && fc <= 70;
  const bob = Math.sin(f / 13) * 3 * 1.15;
  const sx = 897, sy = 710 + bob;
  const hx = sx + (1290 - sx) * reach;
  const hy = 797 + bob + (470 - 797 - bob) * reach;
  const gumT = seg(fc, 70, 84);
  const puffT = pop(seg(fc, 86, 102));
  const gx = 897 - 47 * gumT;
  const gy = 760 + (660 - 760) * gumT - 110 * Math.sin(gumT * Math.PI);
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={130} />
        <g filter="url(#wobbleSoft)">
          {/* 高架の影だけうっすら */}
          <rect x={0} y={120} width={W} height={60} fill="#6E6256" opacity={0.5} />
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <GumMachine x={1340} y={880} s={1.2} />
          <TownPerson x={820} y={880} s={1.15} role="newsboy" f={f} gaze={[7, -2]}
            face={fc > 84 ? "smile" : "normal"} hideArm={armOut ? "right" : undefined} />
          {/* のばす腕 (右) */}
          {armOut && (
            <g>
              <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" />
              <line x1={sx} y1={sy} x2={hx} y2={hy} stroke="#B8864F" strokeWidth={22} strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          )}
          {/* ガム (投げ上げ→口へ) */}
          {gumT > 0.01 && gumT < 0.99 && (
            <circle cx={gx} cy={gy} r={14} fill="#E89AB0" stroke={KRP.ink} strokeWidth={4} />
          )}
          {/* ほっぺぷくっ */}
          {puffT > 0.01 && (
            <circle cx={859} cy={673 + bob} r={17 * puffT} fill="#F0B9A4" stroke={KRP.ink} strokeWidth={3.5} opacity={0.95} />
          )}
        </g>
      </svg>
      <LabelPill x={960} y={150} text="電車を待つ数分の、ひまつぶし" size={38} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 70: 駅と自販機は名コンビ
const SceneStationCombo: React.FC<{ f: number }> = ({ f }) => {
  const dy = Math.sin(f / 4) * 10 * seg(f, 40, 48);
  const heartT = pop(seg(f, 70, 86));
  const inT = pop(seg(f, 6, 24));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={131} />
        <g filter="url(#wobbleSoft)">
          {/* 左カード: 駅 */}
          <g transform={`translate(590 530) scale(${inT}) translate(-590 -530)`}>
            <rect x={330} y={320} width={520} height={420} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <rect x={450} y={500} width={280} height={190} fill="#A58D6F" stroke={KRP.ink} strokeWidth={6} />
            <path d="M 430 500 L 590 420 L 750 500 Z" fill="#8F6B44" stroke={KRP.ink} strokeWidth={6} />
            <path d="M 540 690 L 540 600 Q 590 560 640 600 L 640 690 Z" fill="#6E6256" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={590} cy={472} r={26} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <line x1={590} y1={472} x2={590} y2={456} stroke={KRP.ink} strokeWidth={4} />
            <line x1={590} y1={472} x2={602} y2={478} stroke={KRP.ink} strokeWidth={4} />
            <text x={590} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
              fill={KRP.cream} letterSpacing={3}>STATION</text>
          </g>
          {/* 右カード: 自販機 */}
          <g transform={`translate(1330 530) scale(${inT}) translate(-1330 -530)`}>
            <rect x={1070} y={320} width={520} height={420} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <PostcardMachine x={1330} y={710} s={0.62} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 握手 */}
          {f >= 36 && (
            <g>
              <line x1={850} y1={560} x2={930} y2={560 + dy} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
              <line x1={850} y1={560} x2={930} y2={560 + dy} stroke="#A58D6F" strokeWidth={21} strokeLinecap="round" />
              <line x1={1070} y1={560} x2={990} y2={560 + dy} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
              <line x1={1070} y1={560} x2={990} y2={560 + dy} stroke="#4E6B52" strokeWidth={21} strokeLinecap="round" />
              <circle cx={960} cy={560 + dy} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            </g>
          )}
          {/* ハート */}
          {heartT > 0.01 && (
            <g transform={`translate(960 ${400 + Math.sin(f / 11) * 6}) scale(${heartT * 1.3}) translate(-960 -400)`}>
              <Heart cx={960} cy={400} s={1.3} />
            </g>
          )}
        </g>
      </svg>
      {f >= 92 && <Stamp x={760} y={800} text="名コンビ" size={54} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 出口: モチーフ名→シーン (第2〜4章) =====
export const j2Ch2to4Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    // 第2章 (29〜48)
    case "j2_ch2_door":
      return <GlobeHopDoor f={f} chapter="第2章" title="機械が、人を信じていたころ" stampText="17世紀 イギリス" to="uk" from="egypt" />;
    case "j2_pot_dust": return <SceneDustPot f={f} />;
    case "j2_rome_fall": return <SceneRomeFall f={f} />;
    case "j2_book_sleep": return <SceneBookSleep f={f} />;
    case "j2_tavern": return <SceneTavern f={f} />;
    case "j2_honour_box": return <SceneHonourBoxIntro f={f} />;
    case "j2_honour_cut": return <SceneHonourCutLock f={f} />;
    case "j2_honour_nometer": return <SceneHonourNoMeter f={f} />;
    case "j2_smoker_honest": return <SceneSmokerHonest f={f} />;
    case "j2_honour_label": return <SceneHonourLabel f={f} />;
    case "j2_scale": return <SceneScale f={f} />;
    case "j2_scale_mark": return <SceneScaleMark f={f} />;
    case "j2_london_1822": return <SceneLondon1822 f={f} />;
    case "j2_carlile": return <SceneCarlile f={f} />;
    case "j2_carlile_jail": return <SceneCarlileJail f={f} />;
    case "j2_carlile_idea": return <SceneCarlileIdea f={f} />;
    case "j2_book_vendo": return <SceneBookVendo f={f} />;
    case "j2_law_hole": return <SceneLawHole f={f} />;
    case "j2_carlile_stamp": return <SceneCarlileStamp f={f} />;
    case "j2_stage": return <SceneStage f={f} />;
    // 第3章 (49〜70)
    case "j2_ch3_door": return <SceneCh3Door f={f} />;
    case "j2_industrial": return <SceneIndustrial f={f} />;
    case "j2_train_mail": return <SceneTrainMail f={f} />;
    case "j2_everitt": return <SceneEveritt f={f} />;
    case "j2_postcard_machine": return <ScenePostcardMachine f={f} />;
    case "j2_station_platform": return <SceneStationPlatform f={f} />;
    case "j2_first_modern": return <SceneFirstModern f={f} />;
    case "j2_postcard_cut": return <ScenePostcardCut f={f} />;
    case "j2_postcard_lock": return <ScenePostcardLock f={f} />;
    case "j2_lock_return": return <SceneLockReturn f={f} />;
    case "j2_heron_compare": return <SceneHeronCompare f={f} />;
    case "j2_postcard_hit": return <ScenePostcardHit f={f} />;
    case "j2_map_spread": return <SceneMapSpread f={f} />;
    case "j2_tokoroga": return <SceneTokoroga f={f} />;
    case "j2_everitt_sigh": return <SceneEverittSigh f={f} />;
    case "j2_orange_peel": return <SceneOrangePeel f={f} />;
    case "j2_machine_vs_man": return <SceneMachineVsMan f={f} />;
    case "j2_map_spread2": return <SceneMapSpread2 f={f} />;
    case "j2_to_ny": return <SceneToNY f={f} />;
    case "j2_ny_station": return <SceneNYStation f={f} />;
    case "j2_newsboy_gum": return <SceneNewsboyGum f={f} />;
    case "j2_station_combo": return <SceneStationCombo f={f} />;
    default: return null;
  }
};

// プレビュー用モチーフ一覧 (第2・3章ぶん。第4章は実装したら追記)
export const J2_CH2TO4_MOTIFS: string[] = [
  "j2_ch2_door", "j2_pot_dust", "j2_rome_fall", "j2_book_sleep", "j2_tavern",
  "j2_honour_box", "j2_honour_cut", "j2_honour_nometer", "j2_smoker_honest", "j2_honour_label",
  "j2_scale", "j2_scale_mark", "j2_london_1822", "j2_carlile", "j2_carlile_jail",
  "j2_carlile_idea", "j2_book_vendo", "j2_law_hole", "j2_carlile_stamp", "j2_stage",
  "j2_ch3_door", "j2_industrial", "j2_train_mail", "j2_everitt", "j2_postcard_machine",
  "j2_station_platform", "j2_first_modern", "j2_postcard_cut", "j2_postcard_lock", "j2_lock_return",
  "j2_heron_compare", "j2_postcard_hit", "j2_map_spread", "j2_tokoroga", "j2_everitt_sigh",
  "j2_orange_peel", "j2_machine_vs_man", "j2_map_spread2", "j2_to_ny", "j2_ny_station",
  "j2_newsboy_gum", "j2_station_combo",
];
