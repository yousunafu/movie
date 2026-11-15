// 「人類は、昔から飛ばして観ていた」: 文#99〜#110 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1134〜1145。
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
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  night: "#232A3A",      // 夜の外の空気
  nightDeep: "#1A2030",  // 章扉の夜空
  dusk: "#D9A86C",       // 夕暮れの空 (#101)
  duskDeep: "#B8795A",   // 夕暮れの地平
  doorWood: "#6B4A2E",   // 歌劇場の扉の濃い木
  stoneArch: "#565E72",  // 石のアーチ
  goldFrame: "#C9A44A",  // 掲示の金縁
  velvet: "#7A2E35",     // ビロードの壁
  velvetDark: "#5E2228",
  glove: "#F6F1E6",      // 白手袋
  gasGlow: "#F5DFA0",    // ガス灯の光
  ironDark: "#3B3F48",   // 灯具の鉄
  tail: "#2A2622",       // 燕尾服の黒
  hallSeat: "#43304A",   // 客席の椅子の影
};
void W; void H; void useCurrentFrame;
void Stamp; void QMark;
void Danmen; void Tehaisho; void SaiseiBar; void Fuda3;

// ===================================================================
// このファイルだけの小さな道具
// ===================================================================
// 固定乱数 (フレームで変わらない)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 374.11 + i * 97.13) * 43758.5453;
  return v - Math.floor(v);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// (cx, cy) を中心に z 倍するカメラ
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx * (1 - z)} ${cy * (1 - z)}) scale(${z})`;

// 石積みの壁 (#99 / #105 の歌劇場の外壁)
const Ishikabe: React.FC<{
  x: number; y: number; w: number; h: number; seed: number; fill?: string; line?: string;
}> = ({ x, y, w, h, seed, fill = "#3A4254", line = "#2C3344" }) => {
  const rows = Math.ceil(h / 86);
  const marks: React.ReactNode[] = [];
  for (let r = 0; r <= rows; r++) {
    marks.push(<line key={`h${r}`} x1={x} y1={y + r * 86} x2={x + w} y2={y + r * 86}
      stroke={line} strokeWidth={4} opacity={0.6} />);
    for (let c = 0; c < Math.ceil(w / 170); c++) {
      const vx = x + c * 170 + (r % 2) * 85 + rnd(seed, r * 31 + c) * 18;
      if (vx < x + w) marks.push(<line key={`v${r}-${c}`} x1={vx} y1={y + r * 86}
        x2={vx} y2={Math.min(y + (r + 1) * 86, y + h)} stroke={line} strokeWidth={3.5} opacity={0.5} />);
    }
  }
  return <g><rect x={x} y={y} width={w} height={h} fill={fill} />{marks}</g>;
};

// 壁ぎわのガス灯 (炎が f でゆれる)
const GasLamp: React.FC<{ f: number; x: number; y: number; s?: number; phase?: number }> =
  ({ f, x, y, s = 1, phase = 0 }) => {
    const fl = 0.85 + 0.15 * Math.sin((f + phase * 7) / 3.2) + 0.06 * Math.sin((f + phase * 3) / 1.7);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={130} fill={C.gasGlow} opacity={0.13 * fl} />
        <circle r={72} fill={C.gasGlow} opacity={0.16 * fl} />
        <rect x={-7} y={58} width={14} height={64} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <path d="M -34 58 L 34 58 L 22 -52 L -22 -52 Z" fill="#FBF3D8" stroke={C.ink} strokeWidth={5} opacity={0.95} />
        <rect x={-40} y={52} width={80} height={14} rx={6} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <rect x={-28} y={-64} width={56} height={14} rx={6} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <path d={`M 0 36 Q ${10 * fl} 10 0 ${-10 - 16 * fl} Q ${-10 * fl} 10 0 36 Z`} fill={KRP.orange} opacity={0.9} />
        <path d={`M 0 30 Q ${6 * fl} 12 0 ${-2 - 8 * fl} Q ${-6 * fl} 12 0 30 Z`} fill={KRP.yellow} />
      </g>
    );
  };

// 歌劇場の重い両開き扉 (閉)。lit=丸小窓が光る。shake=閉まった直後のゆれ量 (0〜1)
const GekijoDoor: React.FC<{ f: number; x: number; y: number; s?: number; lit?: boolean; shake?: number }> =
  ({ f, x, y, s = 1, lit = false, shake = 0 }) => {
    const sh = shake * Math.sin(f * 2.3) * 5;
    const pulse = 0.72 + 0.28 * Math.sin(f / 6);
    return (
      <g transform={`translate(${x + sh} ${y}) scale(${s})`}>
        <path d="M -250 0 L -250 -360 Q -250 -560 0 -560 Q 250 -560 250 -360 L 250 0 L 196 0 L 196 -352 Q 196 -506 0 -506 Q -196 -506 -196 -352 L -196 0 Z"
          fill={C.stoneArch} stroke={C.ink} strokeWidth={7} />
        <path d="M -196 0 L -196 -352 Q -196 -506 0 -506 Q 196 -506 196 -352 L 196 0 Z"
          fill={C.doorWood} stroke={C.ink} strokeWidth={7} />
        <line x1={0} y1={0} x2={0} y2={-502} stroke={C.ink} strokeWidth={7} />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <rect x={sd === -1 ? -162 : 42} y={-306} width={120} height={256} rx={14}
              fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.65} />
            <circle cx={sd * 100} cy={-396} r={40}
              fill={lit ? C.gasGlow : "#2B2420"} stroke={C.ink} strokeWidth={6}
              opacity={lit ? 0.62 + 0.38 * pulse : 1} />
            <line x1={sd * 100 - 40} y1={-396} x2={sd * 100 + 40} y2={-396} stroke={C.ink} strokeWidth={4} />
            <line x1={sd * 100} y1={-436} x2={sd * 100} y2={-356} stroke={C.ink} strokeWidth={4} />
            <circle cx={sd * 34} cy={-226} r={14} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {lit && (
          <g>
            {[-1, 1].map((sd) => (
              <path key={sd} d={`M ${sd * 100 - 40} -396 L ${sd * 100 - 108} 36 L ${sd * 100 + 108} 36 L ${sd * 100 + 40} -396 Z`}
                fill={C.gasGlow} opacity={0.12 * pulse} />
            ))}
            <rect x={-190} y={-8} width={380} height={8} fill={C.gasGlow} opacity={0.45 + 0.3 * pulse} />
          </g>
        )}
      </g>
    );
  };

// 懐中時計 (針が f で進む)
const KaichuDokei: React.FC<{ f: number; x: number; y: number; s?: number; chain?: boolean }> =
  ({ f, x, y, s = 1, chain = true }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {chain && <path d={`M 0 -46 Q ${26 + Math.sin(f / 8) * 4} -80 16 -114`} fill="none"
        stroke={KRP.brass} strokeWidth={6} strokeDasharray="2 8" strokeLinecap="round" />}
      <rect x={-9} y={-58} width={18} height={16} rx={5} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
      <circle r={44} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
      <circle r={34} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={Math.sin(a) * 27} y1={-Math.cos(a) * 27}
          x2={Math.sin(a) * 31} y2={-Math.cos(a) * 31} stroke={C.ink} strokeWidth={3} />;
      })}
      <line x1={0} y1={0} x2={Math.sin(3.6) * 17} y2={-Math.cos(3.6) * 17}
        stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin(0.6 + f * 0.02) * 27} y2={-Math.cos(0.6 + f * 0.02) * 27}
        stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <circle r={4.5} fill={C.ink} />
    </g>
  );

// シルクハット (Person の頭にかぶせる。x,y = 人物の足元、s/f/phase も人物と同じ)
const TopHat: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number; still?: boolean }> =
  ({ x, y, s = 1, f = 0, phase = 0, still = false }) => {
    const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <ellipse cx={0} cy={-270} rx={84} ry={15} fill={C.tail} stroke={C.ink} strokeWidth={5} />
        <path d="M -52 -270 L -48 -368 Q 0 -380 48 -368 L 52 -270 Z" fill={C.tail} stroke={C.ink} strokeWidth={5} />
        <rect x={-49} y={-306} width={98} height={13} fill={C.velvet} opacity={0.9} />
      </g>
    );
  };

// ドレスのスカート (Person の脚の上に重ねる。x,y = 足元、s/f/phase も人物と同じ)
const Skirt: React.FC<{ x: number; y: number; s?: number; color: string; f?: number; phase?: number }> =
  ({ x, y, s = 1, color, f = 0, phase = 0 }) => {
    const bob = Math.sin((f + phase * 17) / 13) * 3;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <path d="M -54 -72 Q -84 -10 -74 -2 L 74 -2 Q 84 -10 54 -72 Z" fill={color} stroke={C.ink} strokeWidth={5} />
        <path d="M -44 -42 Q 0 -28 44 -42" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.45} />
      </g>
    );
  };

// オペラグラス
const OperaGlass: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      <rect x={-6} y={12} width={12} height={64} rx={6} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
      <circle cx={-24} cy={0} r={23} fill={C.velvet} stroke={C.ink} strokeWidth={5} />
      <circle cx={24} cy={0} r={23} fill={C.velvet} stroke={C.ink} strokeWidth={5} />
      <circle cx={-24} cy={0} r={11} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={24} cy={0} r={11} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3.5} />
      <rect x={-10} y={-9} width={20} height={18} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
    </g>
  );

// 音符 (扉から漏れる音・楽章の印)
const Onpu: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number; rot?: number }> =
  ({ x, y, s = 1, color = C.ink, opacity = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} opacity={opacity}>
      <ellipse cx={0} cy={0} rx={13} ry={10} fill={color} transform="rotate(-18)" />
      <path d="M 11 -3 L 11 -56 Q 28 -52 36 -40" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
    </g>
  );

// 白手袋の両手 (#107/#108 の連番部品)。raiseT 0=膝の上 → 1=胸の前。tension=指先の緊張
const HakushuTe: React.FC<{
  f: number; x: number; y: number; s?: number; raiseT: number; knees?: boolean; tension?: number;
}> = ({ f, x, y, s = 1, raiseT, knees = false, tension = 0 }) => {
  const lift = clamp01(raiseT);
  const hy = lerp(190, 0, lift);
  const gap = lerp(46, 108, lift);
  const rot = lerp(52, 15, lift);
  const trem = tension * Math.sin(f / 2.6) * 2.4;
  const hand = (sd: -1 | 1) => (
    <g key={sd} transform={`translate(${sd * gap + trem * sd} ${hy}) rotate(${-sd * rot})`}>
      <rect x={-36} y={66} width={72} height={76} rx={14} fill={C.tail} stroke={C.ink} strokeWidth={6} />
      <rect x={-40} y={52} width={80} height={21} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <g fill={C.glove} stroke={C.ink} strokeWidth={5}>
        <rect x={-31} y={-12} width={62} height={74} rx={18} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-30 + i * 15.8} y={-58 - [5, 12, 8, -1][i]} width={13.5} height={62} rx={6.5}
            transform={`rotate(${(i - 1.5) * (2.2 + tension * 3)} ${-23 + i * 15.8} -2)`} />
        ))}
        <rect x={sd === -1 ? 22 : -36} y={-18} width={14} height={46} rx={7}
          transform={`rotate(${-sd * 38} ${sd === -1 ? 29 : -29} -14)`} />
      </g>
      <circle cx={0} cy={40} r={4.5} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.8} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {knees && (
        <g>
          <path d="M -250 268 Q -160 168 -44 186 L 44 186 Q 160 168 250 268 L 250 460 L -250 460 Z"
            fill={C.tail} stroke={C.ink} strokeWidth={7} />
          <path d="M -130 220 Q 0 190 130 220" fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={0.3} />
        </g>
      )}
      {hand(-1)}
      {hand(1)}
    </g>
  );
};

// 拍手アイコン (#109 の年表用)。ghost=拍手しない印 (点線の丸と棒)
const ClapIcon: React.FC<{
  f: number; x: number; y: number; s?: number; t?: number; strong?: boolean; ghost?: boolean;
}> = ({ f, x, y, s = 1, t = 1, strong = false, ghost = false }) => {
  if (ghost) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle r={40} fill="none" stroke={KRP.grayDark} strokeWidth={4.5} strokeDasharray="9 9" opacity={0.75} />
        <line x1={-19} y1={0} x2={19} y2={0} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
      </g>
    );
  }
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  const wob = 1 + Math.sin(f / 7 + x * 0.01) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc * wob})`}>
      <circle r={44} fill={strong ? KRP.yellow : "#F6E9C4"} stroke={C.ink} strokeWidth={5.5} />
      <path d="M -26 18 Q -22 -12 -3 -3 L -5 24 Z" fill={C.glove} stroke={C.ink} strokeWidth={4} />
      <path d="M 26 18 Q 22 -12 3 -3 L 5 24 Z" fill={C.glove} stroke={C.ink} strokeWidth={4} />
      {[-60, -30, 0, 30, 60].map((a) => {
        const ar = (a * Math.PI) / 180;
        return <line key={a} x1={Math.sin(ar) * 27} y1={-Math.cos(ar) * 27 - 5}
          x2={Math.sin(ar) * (strong ? 46 : 37)} y2={-Math.cos(ar) * (strong ? 46 : 37) - 5}
          stroke={strong ? KRP.red : KRP.orange} strokeWidth={5.5} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #99 第5章、遅刻者、お断り。
// 格: 山 / seed 1134
// 絵: 章扉。歌劇場の重い扉の前。懐中時計を見つめる燕尾服の紳士と、ぴしゃりと閉じた扉
// どこ: 夜のウィーン 歌劇場の玄関前。石積みの壁と石畳
// 演出: 左に閉まったばかりの重い扉 (ゆれ+衝撃線)、中央で燕尾服の紳士が懐中時計を見つめる。右に章扉
// 動き: 扉のゆれが減衰 / 衝撃線が消える / 針が進む / ガス灯の炎 / 章扉 seg(10,32) / ゆっくり寄るカメラ
const Sg099: React.FC<{ f: number }> = ({ f }) => {
  const shake = 1 - easeOut(seg(f, 2, 16));
  const impact = 1 - seg(f, 4, 14);
  const z = 1 + 0.045 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={1134} dark bg={C.nightDeep}
      over={<ChapterDoor num={5} title="遅刻者 お断り" t={seg(f, 10, 32)} left={1040} top={610} width={780} />}>
      <g transform={zoomAt(z, 700, 620)}>
        {/* 夜空と月 */}
        <circle cx={1560} cy={170} r={62} fill="#E9E4CE" opacity={0.85} />
        <circle cx={1538} cy={158} r={54} fill={C.nightDeep} opacity={0.9} />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={120 + rnd(1, i) * 1700} cy={40 + rnd(2, i) * 210}
            r={2 + rnd(3, i) * 2.5} fill={KRP.white}
            opacity={0.35 + 0.45 * Math.sin(f / 7 + i * 1.7) * Math.sin(f / 7 + i * 1.7)} />
        ))}
        {/* 歌劇場の外壁 */}
        <Ishikabe x={-60} y={240} w={2040} h={620} seed={5} />
        <rect x={-60} y={226} width={2040} height={22} fill={C.stoneArch} stroke={C.ink} strokeWidth={5} />
        {/* 石畳 */}
        <rect x={-60} y={856} width={2040} height={230} fill="#2E3444" />
        {Array.from({ length: 24 }).map((_, i) => (
          <ellipse key={i} cx={-20 + (i % 8) * 260 + (i > 7 ? 130 : 0)} cy={900 + Math.floor(i / 8) * 62}
            rx={110} ry={20} fill="none" stroke="#242A38" strokeWidth={4} opacity={0.8} />
        ))}
        {/* 扉の明かりだまり (消えている=閉め出し) */}
        <ellipse cx={470} cy={870} rx={330} ry={40} fill="#20263400" opacity={0} />
        {/* 閉まった重い扉 */}
        <GekijoDoor f={f} x={470} y={860} s={1.08} shake={shake} />
        {/* 衝撃線 (ぴしゃり) */}
        {impact > 0 && (
          <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={impact * 0.9}>
            <line x1={760} y1={420} x2={810 + impact * 30} y2={395} />
            <line x1={775} y1={520} x2={835 + impact * 36} y2={520} />
            <line x1={760} y1={620} x2={810 + impact * 30} y2={645} />
            <line x1={175} y1={430} x2={120 - impact * 30} y2={405} />
            <line x1={160} y1={560} x2={100 - impact * 36} y2={560} />
          </g>
        )}
        {/* ガス灯 */}
        <GasLamp f={f} x={90} y={420} s={0.9} phase={3} />
        <GasLamp f={f} x={1800} y={400} s={0.85} />
        {/* 懐中時計を見つめる燕尾服の紳士 */}
        <g>
          <Person f={f} x={880} y={880} s={1.12} cloth={C.tail} clothDark="#201C18"
            pose="hold" face="worried" gaze={[0, 6]} still />
          {/* 燕尾 */}
          <path d="M 832 765 L 820 850 L 844 815 Z" fill={C.tail} stroke={C.ink} strokeWidth={4} />
          <path d="M 928 765 L 940 850 L 916 815 Z" fill={C.tail} stroke={C.ink} strokeWidth={4} />
          <TopHat x={880} y={880} s={1.12} still />
          <KaichuDokei f={f} x={880} y={748} s={1.0} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #100 暗闇の次に狙われたのは、時間です。
// 格: 図 / seed 1135
// 絵: 的あての世界。「暗闇」の的に命中済みの矢。次の的「時間」(懐中時計) に照準の円が合う
// どこ: 夜店の射的の屋台。木の台と縞のひさし
// 演出: 左の的「暗闇」に矢が命中済み。右の的は懐中時計の文字盤で、赤い照準の円が絞られていく
// 動き: 照準の円 400→130 (seg 6-30) + 回転 / 矢羽のゆれ / ランプの明滅 / 命中の星がまたたく
const Sg100: React.FC<{ f: number }> = ({ f }) => {
  const aim = easeOut(seg(f, 6, 30));
  const aimR = lerp(400, 130, aim);
  const lamp = 0.8 + 0.2 * Math.sin(f / 4.5);
  const mato = (cx: number, cy: number) => (
    <g>
      {/* 的の脚 */}
      <path d={`M ${cx - 70} 800 L ${cx} ${cy + 130} L ${cx + 70} 800`} fill="none" stroke={SGP.woodDark} strokeWidth={14} strokeLinecap="round" />
      <rect x={cx - 14} y={cy + 110} width={28} height={700 - cy} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
    </g>
  );
  return (
    <Frame f={f} seed={1135} dark bg={C.night}>
      {/* 屋台のひさし (縞) */}
      <g>
        <path d="M -20 60 L 1940 60 L 1900 230 L 20 230 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M ${i * 200 + 60} 60 L ${i * 200 + 158} 60 L ${i * 200 + 152} 230 L ${i * 200 + 66} 230 Z`}
            fill={KRP.white} opacity={0.88} />
        ))}
        <path d="M 20 230 Q 115 290 210 230 Q 305 290 400 230 Q 495 290 590 230 Q 685 290 780 230 Q 875 290 970 230 Q 1065 290 1160 230 Q 1255 290 1350 230 Q 1445 290 1540 230 Q 1635 290 1730 230 Q 1825 290 1900 230"
          fill="none" stroke={C.ink} strokeWidth={6} />
      </g>
      {/* 屋台の板壁と台 */}
      <rect x={-20} y={226} width={1980} height={634} fill="#54452F" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={i * 260 + 40 + rnd(8, i) * 30} y1={240} x2={i * 260 + 40 + rnd(8, i) * 30} y2={860}
          stroke="#453823" strokeWidth={5} opacity={0.8} />
      ))}
      <rect x={-20} y={790} width={1980} height={290} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
      <line x1={-20} y1={830} x2={1960} y2={830} stroke={SGP.woodDark} strokeWidth={5} opacity={0.8} />
      {/* ひさしの下にぶら下がる豆電球 */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 230 + 60} ${272 + Math.sin(f / 10 + i * 1.3) * 3})`}>
          <line x1={0} y1={-46} x2={0} y2={-10} stroke={C.ironDark} strokeWidth={3.5} />
          <circle cy={0} r={11} fill={KRP.yellow} opacity={0.45 + 0.55 * (0.4 + 0.6 * rnd(7, i)) * lamp}
            stroke={C.ink} strokeWidth={3} />
        </g>
      ))}
      {/* 左の的: 暗闇 (命中済み) */}
      {mato(480, 520)}
      <g transform="translate(480 520)">
        <circle r={150} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
        <circle r={112} fill="#39414F" stroke={C.ink} strokeWidth={5} />
        <circle r={72} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <circle r={36} fill="#242B38" stroke={C.ink} strokeWidth={5} />
        {/* 命中した矢 (羽がゆれる) */}
        <g transform={`rotate(${Math.sin(f / 6) * 2.5})`}>
          <line x1={6} y1={-6} x2={150} y2={-150} stroke={SGP.woodDark} strokeWidth={11} strokeLinecap="round" />
          <path d="M 128 -128 L 170 -186 L 150 -150 L 186 -170 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <circle r={11} fill={C.ink} />
        </g>
        {/* 命中の星 */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${[-60, 52, -12][i]} ${[-52, 44, 64][i]}) scale(${0.5 + 0.5 * Math.sin(f / 5 + i * 2.1) * Math.sin(f / 5 + i * 2.1)})`}>
            <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
      </g>
      {/* 右の的: 時間 (懐中時計の文字盤が的) */}
      {mato(1380, 490)}
      <g transform="translate(1380 490)">
        <circle r={168} fill={KRP.brass} stroke={C.ink} strokeWidth={8} />
        <circle r={136} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <rect x={-20} y={-212} width={40} height={34} rx={8} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-224} r={16} fill="none" stroke={KRP.brass} strokeWidth={9} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={Math.sin(a) * 112} y1={-Math.cos(a) * 112}
            x2={Math.sin(a) * 130} y2={-Math.cos(a) * 130} stroke={C.ink} strokeWidth={5} />;
        })}
        <line x1={0} y1={0} x2={Math.sin(3.6) * 64} y2={-Math.cos(3.6) * 64} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(0.5 + f * 0.015) * 104} y2={-Math.cos(0.5 + f * 0.015) * 104} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <circle r={8} fill={C.ink} />
        {/* 絞られていく照準 */}
        <g opacity={0.55 + 0.45 * aim} transform={`rotate(${(1 - aim) * 80})`}>
          <circle r={aimR} fill="none" stroke={KRP.red} strokeWidth={9} strokeDasharray="26 14" />
          <line x1={-aimR - 46} y1={0} x2={-aimR + 40} y2={0} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
          <line x1={aimR - 40} y1={0} x2={aimR + 46} y2={0} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={-aimR - 46} x2={0} y2={-aimR + 40} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={aimR - 40} x2={0} y2={aimR + 46} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
        </g>
      </g>
      {/* 次の矢 (台の上に置いてある) */}
      <g transform={`translate(905 816) rotate(-7)`}>
        <line x1={-120} y1={0} x2={120} y2={0} stroke={SGP.woodDark} strokeWidth={10} strokeLinecap="round" />
        <path d="M 96 -4 L 148 -26 L 124 0 L 148 26 L 96 4 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        <path d="M -132 -10 L -112 0 L -132 10 Z" fill={C.ink} />
      </g>
      {/* 札 */}
      <TagPlate x={480} y={720} text="暗闇" size={38} t={seg(f, 2, 10)} fill="#E8E2D2" />
      <TagPlate x={1380} y={720} text="時間" size={38} t={seg(f, 10, 18)} fill="#E8E2D2" />
      <Arrow x={822} y={600} s={1.25} t={seg(f, 16, 26)} color={KRP.orange} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #101 1897年、ウィーン。宮廷歌劇場に、新しい監督が就任します。
// 格: 並 / seed 1136
// 絵: ウィーン宮廷歌劇場の外観。扉に「新監督就任」の張り紙。通行人が足を止める
// どこ: 夕暮れのウィーン 宮廷歌劇場の正面。アーチ窓の並ぶ石造りの建物と街灯の通り
// 演出: 中央の扉に「新監督就任」の張り紙がトンと貼られ、通行人が足を止めて見上げる
// 動き: 張り紙 pop (seg 6-18) / 指差す人の登場 / 街灯の明滅 / 鳥が横切る / カメラがゆっくり寄る
const Sg101: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.06 * easeOut(seg(f, 8, 42));
  const postT = pop(seg(f, 6, 18));
  return (
    <Frame f={f} seed={1136} bg={C.dusk}>
      <g transform={zoomAt(z, 960, 640)}>
        {/* 夕暮れの空 */}
        <rect x={-40} y={-40} width={2000} height={560} fill={C.dusk} />
        <rect x={-40} y={300} width={2000} height={240} fill={C.duskDeep} opacity={0.55} />
        <circle cx={330} cy={300} r={70} fill="#F2B04C" opacity={0.85} />
        {/* 渡り鳥 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d="M -22 0 Q -8 -14 0 0 Q 8 -14 22 0"
            transform={`translate(${430 + i * 90 + f * 4} ${170 + i * 26 + Math.sin(f / 6 + i) * 5}) scale(${1 - i * 0.2})`}
            fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        ))}
        <TagPlate x={295} y={320} text="1897" size={40} t={seg(f, 2, 10)} fill="#F6EBD2" />
        {/* 歌劇場の建物 (正面) */}
        <g>
          {/* 屋根とドーム */}
          <path d="M 560 180 Q 960 60 1360 180 L 1360 240 L 560 240 Z" fill="#6E7D64" stroke={C.ink} strokeWidth={6} />
          <rect x={520} y={236} width={880} height={34} fill="#C8B690" stroke={C.ink} strokeWidth={6} />
          {/* 本体の石壁 */}
          <rect x={560} y={270} width={800} height={590} fill="#D9C8A4" stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={560} y1={330 + i * 90} x2={1360} y2={330 + i * 90} stroke="#B7A57E" strokeWidth={3} opacity={0.7} />
          ))}
          {/* 2階のアーチ窓 (5つ) */}
          {Array.from({ length: 5 }).map((_, i) => {
            const wx = 640 + i * 165;
            return (
              <g key={i}>
                <path d={`M ${wx - 44} 470 L ${wx - 44} 330 Q ${wx} 282 ${wx + 44} 330 L ${wx + 44} 470 Z`}
                  fill="#8A6F56" stroke={C.ink} strokeWidth={5} />
                <path d={`M ${wx - 30} 470 L ${wx - 30} 338 Q ${wx} 300 ${wx + 30} 338 L ${wx + 30} 470 Z`}
                  fill={KRP.yellow} opacity={0.35 + 0.25 * Math.sin(f / 8 + i * 2)} stroke={C.ink} strokeWidth={3.5} />
                <line x1={wx} y1={300} x2={wx} y2={470} stroke={C.ink} strokeWidth={3} opacity={0.6} />
                <rect x={wx - 52} y={466} width={104} height={14} fill="#B7A57E" stroke={C.ink} strokeWidth={4} />
              </g>
            );
          })}
          {/* 1階の柱列と中央扉 */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={586 + i * 150} y={540} width={34} height={320} fill="#C8B690" stroke={C.ink} strokeWidth={5} />
          ))}
          <path d="M 866 860 L 866 640 Q 960 572 1054 640 L 1054 860 Z" fill={C.doorWood} stroke={C.ink} strokeWidth={7} />
          <line x1={960} y1={600} x2={960} y2={860} stroke={C.ink} strokeWidth={5} />
          <circle cx={936} cy={740} r={9} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          <circle cx={984} cy={740} r={9} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          {/* 張り紙「新監督就任」 */}
          {postT > 0 && (
            <g transform={`translate(912 702) rotate(-4) scale(${postT})`}>
              <rect x={-74} y={-54} width={148} height={108} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
              <text y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>新監督</text>
              <text y={32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>就任</text>
              <circle cy={-44} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
            </g>
          )}
        </g>
        {/* 通り */}
        <rect x={-40} y={856} width={2000} height={240} fill="#9E8A6A" />
        <line x1={-40} y1={862} x2={1960} y2={862} stroke={C.ink} strokeWidth={5} opacity={0.6} />
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse key={i} cx={40 + i * 170} cy={940 + (i % 2) * 50} rx={70} ry={13}
            fill="none" stroke="#867355" strokeWidth={4} opacity={0.8} />
        ))}
        {/* 街灯 */}
        <GasLamp f={f} x={300} y={600} s={1.0} phase={1} />
        <rect x={293} y={700} width={14} height={180} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <GasLamp f={f} x={1700} y={600} s={1.0} phase={5} />
        <rect x={1693} y={700} width={14} height={180} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        {/* 足を止める通行人 */}
        <Person f={f} x={700} y={1010} s={1.0} cloth="#5A4A66" pose="point" pointDir={1}
          face="surprised" gaze={[4, -4]} />
        <TopHat x={700} y={1010} s={1.0} f={f} />
        <PersonMini x={1240} y={990} s={1.5} color="#705A48" f={f} phase={2} face="dot" arms="down" />
        <PersonMini x={1330} y={1000} s={1.3} color="#4A5A6E" f={f} phase={4} face="dot" arms="up" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #102 作曲家、グスタフ・マーラー。音楽への要求が、とびきり厳しい人でした。
// 格: 山 / seed 1137
// 絵: マーラー初登場。指揮台で丸眼鏡が光る。譜面台に「改革リスト」の紙束。楽団員の背筋が伸びる
// どこ: 宮廷歌劇場のオーケストラピット。板張りの床と赤い緞帳の裾
// 演出: 指揮台のマーラー (丸眼鏡+燕尾) がタクトを構え 眼鏡がキラリ。譜面台に紙束「改革リスト」。楽団員3人の背筋が伸びる
// 動き: 眼鏡の光 pop (seg 12-20) / 楽団員の傾き 12°→0° (seg 8-28) / タクトの先がゆれる / スポットの明滅
const Sg102: React.FC<{ f: number }> = ({ f }) => {
  const straight = 1 - easeOut(seg(f, 8, 28));
  const glint = pop(seg(f, 12, 20));
  const spot = 0.85 + 0.15 * Math.sin(f / 9);
  const mx = 1250, my = 740, ms = 1.22; // マーラーの足元と大きさ
  return (
    <Frame f={f} seed={1137} dark bg="#2B2633">
      {/* 奥: 緞帳の裾と舞台の縁 */}
      <rect x={-20} y={-20} width={1980} height={360} fill={SGP.curtain} />
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M ${i * 200 - 20} -20 Q ${i * 200 + 60} ${200 + rnd(21, i) * 60} ${i * 200 + 90} 336`}
          fill="none" stroke="#8A2A30" strokeWidth={9} opacity={0.75} />
      ))}
      <path d="M -20 322 Q 480 372 960 340 Q 1440 316 1940 350 L 1940 420 L -20 420 Z"
        fill="#C9A35C" stroke={C.ink} strokeWidth={6} />
      {/* ピットの床板 */}
      <rect x={-20} y={414} width={1980} height={680} fill="#6E563A" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={-20} y1={470 + i * 94} x2={1960} y2={470 + i * 94} stroke="#5A4630" strokeWidth={4} opacity={0.8} />
      ))}
      {/* スポットライト */}
      <path d={`M ${mx - 60} -20 L ${mx - 330} 1000 L ${mx + 330} 1000 L ${mx + 60} -20 Z`}
        fill={C.gasGlow} opacity={0.1 * spot} />
      <circle cx={mx} cy={300} r={210} fill={C.gasGlow} opacity={0.08 * spot} />
      {/* 楽団員3人 (背筋が伸びていく) */}
      {[0, 1, 2].map((i) => {
        const px = 230 + i * 300, py = 905 + (i % 2) * 25;
        return (
          <g key={i}>
            <Person f={f} x={px} y={py} s={0.88} cloth={C.tail} clothDark="#201C18"
              pose="hold" face={straight > 0.4 ? "worried" : "normal"}
              lean={straight * (i === 1 ? -11 : 11)} gaze={[5, -4]} phase={i * 2} still />
            {/* 楽器 (ヴァイオリン/チェロ風) */}
            {i === 1 ? (
              <g transform={`translate(${px} ${py - 60}) rotate(${straight * -6})`}>
                <ellipse cx={0} cy={0} rx={36} ry={52} fill="#9A6A3A" stroke={C.ink} strokeWidth={5} />
                <ellipse cx={0} cy={-52} rx={27} ry={32} fill="#9A6A3A" stroke={C.ink} strokeWidth={5} />
                <line x1={0} y1={-78} x2={0} y2={-168} stroke={C.ink} strokeWidth={7} />
                <line x1={-11} y1={-168} x2={11} y2={-168} stroke={C.ink} strokeWidth={6} />
              </g>
            ) : (
              <g transform={`translate(${px + 16} ${py - 120}) rotate(${-34 + straight * 10})`}>
                <ellipse cx={0} cy={0} rx={40} ry={25} fill="#9A6A3A" stroke={C.ink} strokeWidth={5} />
                <line x1={32} y1={0} x2={100} y2={0} stroke={C.ink} strokeWidth={6} />
              </g>
            )}
            {/* 伸びる背筋の印 (ピンと立つ線) */}
            {straight < 0.3 && (
              <g stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" opacity={(0.3 - straight) * 3}>
                <line x1={px - 64} y1={py - 272} x2={px - 76} y2={py - 300} />
                <line x1={px + 64} y1={py - 272} x2={px + 76} y2={py - 300} />
              </g>
            )}
          </g>
        );
      })}
      {/* 指揮台 */}
      <rect x={mx - 150} y={my} width={300} height={70} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
      <rect x={mx - 126} y={my + 66} width={252} height={30} rx={6} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      {/* マーラー (敬意をもって: 端正な立ち姿) */}
      <Person f={f} x={mx} y={my + 6} s={ms} cloth={C.tail} clothDark="#201C18"
        pose="raise" face="normal" glasses gaze={[-5, 0]} still />
      {/* 燕尾 */}
      <path d={`M ${mx - 58} ${my - 118} L ${mx - 72} ${my - 24} L ${mx - 44} ${my - 62} Z`} fill={C.tail} stroke={C.ink} strokeWidth={4} />
      <path d={`M ${mx + 58} ${my - 118} L ${mx + 72} ${my - 24} L ${mx + 44} ${my - 62} Z`} fill={C.tail} stroke={C.ink} strokeWidth={4} />
      {/* タクト (上げた右手の先。先端がかすかにゆれる) */}
      <line x1={mx + 82} y1={my - 276} x2={mx + 150 + Math.sin(f / 5) * 5} y2={my - 392 - Math.sin(f / 5) * 4}
        stroke={KRP.white} strokeWidth={7} strokeLinecap="round" />
      {/* 丸眼鏡のキラリ */}
      {glint > 0 && (
        <g transform={`translate(${mx - 29 * ms} ${my + 6 - 222 * ms}) scale(${glint})`}>
          <path d="M 0 -30 L 7 -7 L 30 0 L 7 7 L 0 30 L -7 7 L -30 0 L -7 -7 Z" fill={KRP.white} opacity={0.95} />
          <path d="M 26 -22 L 30 -12 L 40 -8 L 30 -4 L 26 6 L 22 -4 L 12 -8 L 22 -12 Z" fill={KRP.white} opacity={0.85} />
        </g>
      )}
      {/* 譜面台と改革リストの紙束 */}
      <g>
        <line x1={mx - 320} y1={1010} x2={mx - 320} y2={820} stroke={C.ironDark} strokeWidth={9} />
        <path d={`M ${mx - 380} 1010 L ${mx - 320} 964 L ${mx - 260} 1010`} fill="none" stroke={C.ironDark} strokeWidth={8} strokeLinecap="round" />
        <g transform={`translate(${mx - 320} 790) rotate(-10)`}>
          <rect x={-105} y={-72} width={210} height={150} fill="#E9E0C8" stroke={C.ink} strokeWidth={5} transform="rotate(3)" />
          <rect x={-105} y={-78} width={210} height={150} fill="#F2EBD8" stroke={C.ink} strokeWidth={5} transform="rotate(-2)" />
          <rect x={-105} y={-84} width={210} height={150} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-80} y1={-54 + i * 30} x2={60 + rnd(23, i) * 20} y2={-54 + i * 30}
              stroke={C.ink} strokeWidth={4} opacity={0.5} />
          ))}
        </g>
      </g>
      <TagPlate x={mx - 320} y={568} text="改革リスト" size={34} t={seg(f, 20, 30)} fill="#F6EBD2" rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #103 彼は次々と改革を打ち出します。そのひとつが、これです。
// 格: 並 / seed 1138
// 絵: 改革リストの巻物がばさばさと床まで伸びる。多すぎる項目に事務方が白目。その中の一行が光る
// どこ: 歌劇場の事務室。木の机・棚・ろうそくの明かり
// 演出: 事務方が掲げた改革リストの巻物が床までばさばさ伸びる。多すぎる項目に白目。一行だけ金色に光る
// 動き: 巻物が伸びる (seg 4-32) / 項目線が順に現れる / 光る行の脈動 / Arrow pop (seg 26-36) / ろうそくの炎
const Sg103: React.FC<{ f: number }> = ({ f }) => {
  const unroll = easeOut(seg(f, 4, 32));
  const candle = 0.8 + 0.2 * Math.sin(f / 3.4) + 0.08 * Math.sin(f / 1.9);
  const glow = 0.6 + 0.4 * Math.sin(f / 7);
  const sx = 760;                       // 巻物の中心x
  const topY = 330;                     // 紙の上端
  const paperLen = 180 + unroll * 560;  // いま垂れている長さ
  const rows = Math.floor((paperLen - 80) / 52);
  return (
    <Frame f={f} seed={1138} bg="#E8DFC8">
      {/* 壁と羽目板 */}
      <rect x={-20} y={-20} width={1980} height={700} fill="#C9B995" />
      <rect x={-20} y={640} width={1980} height={60} fill="#8A6F4E" stroke={C.ink} strokeWidth={5} />
      {/* 棚 (帳簿がぎっしり) */}
      <g>
        <rect x={1430} y={60} width={420} height={470} fill="#8A6F4E" stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x={1448} y={90 + r * 150} width={384} height={118} fill="#6E5638" stroke={C.ink} strokeWidth={4} />
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={1458 + i * 53} y={100 + r * 150 + rnd(31, r * 9 + i) * 16} width={44}
                height={100 - rnd(31, r * 9 + i) * 16}
                fill={["#A8885C", "#9A7850", "#B29066"][(i + r) % 3]} stroke={C.ink} strokeWidth={3.5} />
            ))}
          </g>
        ))}
      </g>
      {/* 床 */}
      <rect x={-20} y={690} width={1980} height={400} fill="#A98F62" />
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1={-20} y1={760 + i * 80} x2={1960} y2={760 + i * 80} stroke="#8F7850" strokeWidth={4} opacity={0.7} />
      ))}
      {/* 机とろうそく */}
      <g>
        <rect x={120} y={540} width={520} height={44} rx={8} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
        <rect x={160} y={584} width={36} height={300} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={560} y={584} width={36} height={300} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
        {/* インク壺と羽根ペン */}
        <rect x={420} y={500} width={52} height={42} rx={8} fill={C.ironDark} stroke={C.ink} strokeWidth={4.5} />
        <path d={`M 452 500 Q 500 440 538 ${418 + Math.sin(f / 9) * 4}`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
        <path d={`M 538 ${418 + Math.sin(f / 9) * 4} Q 520 436 506 462`} fill="none" stroke={KRP.grayDark} strokeWidth={4} />
        {/* ろうそく */}
        <circle cx={250} cy={430} r={110} fill={C.gasGlow} opacity={0.16 * candle} />
        <rect x={226} y={444} width={48} height={100} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={206} y={532} width={88} height={16} rx={8} fill={KRP.brass} stroke={C.ink} strokeWidth={4.5} />
        <path d={`M 250 436 Q ${250 + 8 * candle} 404 250 ${386 - 14 * candle} Q ${250 - 8 * candle} 404 250 436 Z`}
          fill={KRP.orange} opacity={0.95} />
        <path d={`M 250 430 Q ${250 + 5 * candle} 410 250 ${400 - 7 * candle}`} fill="none" stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* 事務方 (白目で巻物を指す) */}
      <Person f={f} x={1150} y={880} s={1.1} cloth="#5E6E54" clothDark="#46543E"
        pose="point" pointDir={-1} face="surprised" gaze={[-7, 2]} still />
      {/* 白目 (黒目を消す白丸ぐるぐる) */}
      <g transform="translate(1150 636)">
        <circle cx={-26} cy={0} r={8} fill={KRP.white} stroke={C.ink} strokeWidth={3}
          strokeDasharray="6 5" transform={`rotate(${f * 9})`} />
        <circle cx={26} cy={0} r={8} fill={KRP.white} stroke={C.ink} strokeWidth={3}
          strokeDasharray="6 5" transform={`rotate(${-f * 9})`} />
      </g>
      {/* 汗 */}
      <path d={`M ${1222 + Math.sin(f / 6) * 2} 560 Q 1214 580 1222 588 Q 1230 580 ${1222 + Math.sin(f / 6) * 2} 560 Z`}
        fill="#7FA8C9" opacity={0.9} />
      {/* 改革リストの巻物 (壁の掛け釘から床へ垂れて転がる) */}
      <g>
        {/* 掛け釘と上の軸 */}
        <circle cx={sx} cy={topY - 52} r={10} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <line x1={sx} y1={topY - 46} x2={sx} y2={topY - 18} stroke={C.ironDark} strokeWidth={5} />
        <rect x={sx - 150} y={topY - 26} width={300} height={30} rx={15} fill={SGP.wood} stroke={C.ink} strokeWidth={5.5} />
        {/* 垂れる紙 */}
        <rect x={sx - 128} y={topY} width={256} height={paperLen} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        {/* 項目線 (多すぎる改革) */}
        {Array.from({ length: Math.max(rows, 0) }).map((_, i) => (
          <g key={i} opacity={seg(f, 6 + i * 2.2, 10 + i * 2.2)}>
            <circle cx={sx - 96} cy={topY + 56 + i * 52} r={7} fill="none" stroke={C.ink} strokeWidth={3.5} />
            <line x1={sx - 72} y1={topY + 56 + i * 52} x2={sx + 56 + rnd(33, i) * 48} y2={topY + 56 + i * 52}
              stroke={C.ink} strokeWidth={5} opacity={0.65} />
          </g>
        ))}
        {/* 光る一行 (遅刻者の規則) */}
        {rows >= 5 && (
          <g>
            <rect x={sx - 116} y={topY + 56 + 4 * 52 - 22} width={232} height={44} rx={10}
              fill={KRP.yellow} opacity={0.35 + 0.3 * glow} />
            <rect x={sx - 116} y={topY + 56 + 4 * 52 - 22} width={232} height={44} rx={10}
              fill="none" stroke={KRP.orange} strokeWidth={4.5} opacity={0.9} />
          </g>
        )}
        {/* 床で転がる残り (ばさばさ) */}
        <g opacity={seg(f, 24, 32)}>
          <path d={`M ${sx - 128} ${topY + paperLen} Q ${sx - 210} ${topY + paperLen + 90} ${sx - 320} ${topY + paperLen + 60}`}
            fill="none" stroke={C.ink} strokeWidth={6} />
          <path d={`M ${sx + 128} ${topY + paperLen} Q ${sx + 40} ${topY + paperLen + 110} ${sx - 60} ${topY + paperLen + 86} Q ${sx - 160} ${topY + paperLen + 66} ${sx - 230} ${topY + paperLen + 110}`}
            fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <circle cx={sx - 330} cy={topY + paperLen + 80} r={46} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <circle cx={sx - 330} cy={topY + paperLen + 80} r={24} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        </g>
      </g>
      {/* 光る行を指す矢印 */}
      <Arrow x={sx - 180} y={topY + 56 + 4 * 52} s={1.2} rot={0} t={seg(f, 26, 36)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #104 「遅れてきたお客は、切りのいいところまで、客席に入れない」。
// 格: 図 / seed 1139
// 絵: 新しい規則の掲示札。「開演後の御入場はお断り。次の切れ目まで」。金縁の真面目な書体
// どこ: 歌劇場ロビーのビロード張りの壁。腰板と燭台 足元にビロードのロープ
// 演出: 金縁の掲示札がトンと現れる。「開演後の御入場はお断り / 次の切れ目まで」金縁の真面目な書体
// 動き: 札 pop (seg 4-16) / 金縁を光が走る (seg 16-40) / 燭台の炎 / ロープがかすかにゆれる
const Sg104: React.FC<{ f: number }> = ({ f }) => {
  const plaque = pop(seg(f, 4, 16));
  const sweep = seg(f, 16, 40);
  const sway = Math.sin(f / 11) * 4;
  return (
    <Frame f={f} seed={1139} dark bg={C.velvetDark}>
      {/* ビロードの壁 (菱形のキルト) */}
      <rect x={-20} y={-20} width={1980} height={760} fill={C.velvet} />
      {Array.from({ length: 11 }).map((_, i) => (
        <g key={i} stroke={C.velvetDark} strokeWidth={4} opacity={0.75}>
          <line x1={i * 210 - 160} y1={-20} x2={i * 210 + 240} y2={740} />
          <line x1={i * 210 + 240} y1={-20} x2={i * 210 - 160} y2={740} />
        </g>
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={-55 + (i % 6) * 420 + (Math.floor(i / 6) % 2) * 210} cy={90 + Math.floor(i / 6) * 215}
          r={6} fill={C.goldFrame} opacity={0.85} />
      ))}
      {/* 腰板と床 */}
      <rect x={-20} y={728} width={1980} height={70} fill="#5A3A24" stroke={C.ink} strokeWidth={5} />
      <rect x={-20} y={790} width={1980} height={300} fill="#7A5A38" />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={i * 360 - 60} y1={1090} x2={i * 360 + 180} y2={796} stroke="#684C2E" strokeWidth={4} opacity={0.7} />
      ))}
      {/* 左右の燭台 */}
      {[260, 1660].map((lx, i) => (
        <g key={lx}>
          <rect x={lx - 8} y={330} width={16} height={90} fill={C.goldFrame} stroke={C.ink} strokeWidth={4} />
          <path d={`M ${lx - 40} 420 L ${lx + 40} 420 L ${lx + 26} 448 L ${lx - 26} 448 Z`} fill={C.goldFrame} stroke={C.ink} strokeWidth={4.5} />
          <circle cx={lx} cy={300} r={86} fill={C.gasGlow} opacity={0.14 * (0.8 + 0.2 * Math.sin(f / 3.6 + i * 2))} />
          <rect x={lx - 13} y={290} width={26} height={48} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <path d={`M ${lx} 284 Q ${lx + 7} 262 ${lx} ${248 - Math.sin(f / 3.6 + i * 2) * 8} Q ${lx - 7} 262 ${lx} 284 Z`}
            fill={KRP.orange} />
        </g>
      ))}
      {/* 金縁の掲示札 */}
      {plaque > 0 && (
        <g transform={`translate(960 430) scale(${plaque})`}>
          <rect x={-500} y={-230} width={1000} height={460} rx={26} fill={C.goldFrame} stroke={C.ink} strokeWidth={8} />
          <rect x={-468} y={-198} width={936} height={396} rx={16} fill="#F4EDDA" stroke={C.ink} strokeWidth={5} />
          <rect x={-444} y={-174} width={888} height={348} rx={10} fill="none" stroke={C.goldFrame} strokeWidth={5} />
          {/* 四隅の飾り */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
            <path key={i} d={`M ${dx * 404} ${dy * 134} q ${-dx * 28} 0 ${-dx * 28} ${dy * 28} q 0 ${-dy * 28} ${-dx * 28} ${-dy * 28}`}
              fill="none" stroke={C.goldFrame} strokeWidth={5} strokeLinecap="round" />
          ))}
          {/* 本文 (規則の文言) */}
          <text y={-54} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={C.ink}>
            開演後の御入場はお断り
          </text>
          <line x1={-220} y1={6} x2={220} y2={6} stroke={C.goldFrame} strokeWidth={5} />
          <circle cx={0} cy={6} r={9} fill={C.goldFrame} />
          <text y={104} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={C.ink}>
            次の切れ目まで
          </text>
          {/* 金縁を走る光 */}
          {sweep > 0 && sweep < 1 && (
            <g clipPath="url(#sg104clip)">
              <rect x={-620 + sweep * 1240 - 70} y={-260} width={140} height={520}
                fill={KRP.white} opacity={0.3} transform="skewX(-18)" />
            </g>
          )}
          <clipPath id="sg104clip">
            <rect x={-500} y={-230} width={1000} height={460} rx={26} />
          </clipPath>
        </g>
      )}
      {/* 掲示を吊る鎖 */}
      <line x1={560} y1={-10} x2={680} y2={210} stroke={C.goldFrame} strokeWidth={5} opacity={plaque * 0.9} strokeDasharray="4 10" />
      <line x1={1360} y1={-10} x2={1240} y2={210} stroke={C.goldFrame} strokeWidth={5} opacity={plaque * 0.9} strokeDasharray="4 10" />
      {/* ビロードのロープ (手前) */}
      <g>
        {[420, 1500].map((px) => (
          <g key={px}>
            <rect x={px - 12} y={820} width={24} height={240} fill={C.goldFrame} stroke={C.ink} strokeWidth={5} />
            <circle cx={px} cy={812} r={24} fill={C.goldFrame} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        <path d={`M 420 840 Q 960 ${990 + sway} 1500 840`} fill="none" stroke={SGP.curtain} strokeWidth={22} strokeLinecap="round" />
        <path d={`M 420 840 Q 960 ${990 + sway} 1500 840`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #105 お金を払った紳士淑女でも、扉の外で待たされます。
// 格: 山 / seed 1140
// 絵: **事件**。閉ざされた扉の外、所在なげな正装の紳士淑女たち。小窓から漏れる音楽の光。持ったままのオペラグラス
// どこ: 閉ざされた客席扉の外の廊下 (夜)。#99より寄りで斜めの構図に変える
// 演出: 事件。正装の紳士淑女3人が所在なげに待つ。丸小窓から音楽の光が漏れ 音符が漂う。オペラグラスは持ったまま
// 動き: 小窓の光の脈動 / 漂い上がる音符 / 懐中時計の針 / ドレスの婦人のまばたき / カメラがゆっくり引く
const Sg105: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.08 - 0.06 * easeOut(seg(f, 0, 42));
  const pulse = 0.72 + 0.28 * Math.sin(f / 6);
  return (
    <Frame f={f} seed={1140} dark bg={C.night}>
      <g transform={zoomAt(z, 820, 600)}>
        {/* 廊下の壁 (石積み) と額縁 */}
        <Ishikabe x={-60} y={-40} w={2060} h={880} seed={9} fill="#333B4E" line="#272E3E" />
        {/* 壁の額 (歌劇の絵がかかっている) */}
        <g transform="translate(1565 330) rotate(2)">
          <rect x={-130} y={-170} width={260} height={340} fill={C.goldFrame} stroke={C.ink} strokeWidth={6} />
          <rect x={-106} y={-146} width={212} height={292} fill="#4E5A72" stroke={C.ink} strokeWidth={4} />
          <path d="M -106 146 L -30 10 L 30 86 L 70 40 L 106 146 Z" fill="#39415A" />
          <circle cx={46} cy={-74} r={26} fill="#C8CFDA" opacity={0.8} />
        </g>
        {/* 床 (市松) */}
        <rect x={-60} y={836} width={2060} height={320} fill="#4A4254" />
        {Array.from({ length: 30 }).map((_, i) => {
          const col = i % 10, row = Math.floor(i / 10);
          return (col + row) % 2 === 0 ? (
            <path key={i} d={`M ${col * 230 - 90 + row * 40} ${860 + row * 80} l 190 0 l 30 80 l -190 0 Z`}
              fill="#3A3444" opacity={0.9} />
          ) : null;
        })}
        {/* 閉ざされた扉 (光る小窓) と漏れる光だまり */}
        <ellipse cx={430} cy={880} rx={360} ry={46} fill={C.gasGlow} opacity={0.1 * pulse} />
        <GekijoDoor f={f} x={430} y={868} s={1.15} lit />
        {/* 漂い出る音符 */}
        {[0, 1, 2, 3].map((i) => {
          const t = ((f * 0.9 + i * 11) % 44) / 44;
          return (
            <Onpu key={i} x={430 + [-115, 90, -40, 130][i] + Math.sin(f / 9 + i * 2) * 14}
              y={470 - t * 220} s={0.75 + 0.2 * (i % 2)} color={C.gasGlow}
              opacity={(1 - t) * 0.85} rot={Math.sin(f / 8 + i) * 10} />
          );
        })}
        {/* 壁のガス灯 */}
        <GasLamp f={f} x={1120} y={320} s={0.85} phase={2} />
        {/* 待たされる紳士1 (懐中時計を手に) */}
        <g>
          <Person f={f} x={985} y={900} s={1.05} cloth={C.tail} clothDark="#201C18"
            pose="hold" face="worried" gaze={[0, 6]} phase={1} still />
          <path d="M 940 795 L 929 870 L 951 840 Z" fill={C.tail} stroke={C.ink} strokeWidth={4} />
          <path d="M 1030 795 L 1041 870 L 1019 840 Z" fill={C.tail} stroke={C.ink} strokeWidth={4} />
          <TopHat x={985} y={900} s={1.05} still />
          <KaichuDokei f={f} x={985} y={777} s={0.92} />
        </g>
        {/* 待たされる婦人 (オペラグラスを持ったまま) */}
        <g>
          <Person f={f} x={1310} y={905} s={1.05} cloth="#8A4A5E" clothDark="#6E3A4C"
            pose="hold" face="worried" gaze={[-5, 3]} phase={3} hair="none" still />
          <Skirt x={1310} y={905} s={1.05} color="#8A4A5E" />
          {/* 夜会巻きの髪と小さな羽根飾り */}
          <g transform={`translate(1310 905)`}>
            <path d="M -62 -262 Q -66 -320 0 -324 Q 66 -320 62 -262 Q 30 -284 0 -284 Q -30 -284 -62 -262 Z"
              fill="#4E3B30" />
            <circle cx={0} cy={-324} r={22} fill="#4E3B30" />
            <path d={`M 16 -336 Q 40 -376 ${30 + Math.sin(f / 7) * 4} -396`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
          </g>
          <OperaGlass x={1310} y={782} s={1.0} rot={-14} />
        </g>
        {/* 待たされる紳士2 (腕組み) */}
        <g>
          <Person f={f} x={1700} y={918} s={0.98} cloth="#3A3E52" clothDark="#2A2E40"
            pose="armsFolded" face="worried" gaze={[-7, 0]} phase={5} />
          <TopHat x={1700} y={918} s={0.98} f={f} phase={5} />
        </g>
        {/* ため息 */}
        <g opacity={0.5 + 0.3 * Math.sin(f / 8)}>
          <path d={`M 1745 630 q 18 ${-8 - seg(f, 20, 40) * 6} 36 0 q 18 8 36 0`}
            fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #106 何千年も当たり前だった「途中から入る」が、ここで初めて、咎められました。
// 格: 図 / seed 1141
// 絵: `NenpyoEmaki`。数千年の帯に「途中から入る=OK」が続き、1897の位置でハサミがぱちん。初めての×
// どこ: 書斎の大机の上に広げた絵巻年表 (NenpyoEmaki)。木の机と文鎮
// 演出: 絵巻が開き「途中から入る」に○。1897の境目でハサミがぱちん → 初めての×が右の帯に押される
// 動き: 絵巻 openT (seg 0-24) / ハサミの刃 (seg 24-32) / 切りくず落下 / × pop (seg 34-42) / ○の脈動
const Sg106: React.FC<{ f: number }> = ({ f }) => {
  const openT = seg(f, 0, 24);
  const snip = seg(f, 24, 32);
  const blade = snip < 1 ? Math.abs(Math.sin(snip * Math.PI * 2.5)) * 26 : 0;
  const cutT = seg(f, 30, 40);
  const es = 0.92, ex = 960, ey = 480;        // 絵巻の位置
  const bx = ex + (-812 + 1624 * 0.87) * es;  // 境目のx (画面座標) ≈ 1513
  return (
    <Frame f={f} seed={1141} bg="#E2D6B8">
      {/* 机の木目 */}
      <rect x={-20} y={-20} width={1980} height={1120} fill="#8F6E46" />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M -20 ${i * 130 - 10} Q 480 ${i * 130 + 14 + rnd(41, i) * 18} 980 ${i * 130 - 6} Q 1480 ${i * 130 - 22} 1960 ${i * 130 + 8}`}
          fill="none" stroke="#7A5C38" strokeWidth={5} opacity={0.75} />
      ))}
      {[[270, 220], [1690, 850]].map(([kx, ky], i) => (
        <g key={i} opacity={0.85}>
          <ellipse cx={kx} cy={ky} rx={26} ry={18} fill="none" stroke="#6E5232" strokeWidth={5} />
          <ellipse cx={kx} cy={ky} rx={10} ry={6} fill="#6E5232" />
        </g>
      ))}
      {/* 机の端の小物: 文鎮と糊壺 */}
      <g>
        <rect x={120} y={860} width={200} height={34} rx={17} fill={C.ironDark} stroke={C.ink} strokeWidth={5} />
        <circle cx={1760} cy={160} r={54} fill="#B8C4C9" stroke={C.ink} strokeWidth={5} />
        <circle cx={1760} cy={160} r={30} fill="#9AA8AE" stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 絵巻年表 (共有装置) */}
      <NenpyoEmaki f={f} x={ex} y={ey} s={es} openT={openT} highlight="short" />
      {/* ハサミ (境目の上から刃が閉じる) */}
      {openT > 0.9 && cutT < 1 && (
        <g transform={`translate(${bx} ${ey - 230 + snip * 44})`} opacity={1 - seg(f, 38, 42)}>
          <g transform={`rotate(${-blade} 0 56)`}>
            <path d="M 0 56 L -14 -48 Q -16 -66 0 -66 Q 10 -60 8 -44 Z" fill="#C8CFD4" stroke={C.ink} strokeWidth={4.5} />
          </g>
          <g transform={`rotate(${blade} 0 56)`}>
            <path d="M 0 56 L 14 -48 Q 16 -66 0 -66 Q -10 -60 -8 -44 Z" fill="#AEB8BE" stroke={C.ink} strokeWidth={4.5} />
          </g>
          <circle cx={0} cy={56} r={8} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          <circle cx={-16} cy={86} r={17} fill="none" stroke={C.ink} strokeWidth={6} />
          <circle cx={16} cy={86} r={17} fill="none" stroke={C.ink} strokeWidth={6} />
          {/* ぱちんの火花 */}
          {snip > 0.55 && snip < 1 && (
            <g stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round">
              <line x1={-34} y1={-10} x2={-52} y2={-26} />
              <line x1={34} y1={-10} x2={52} y2={-26} />
              <line x1={0} y1={-72} x2={0} y2={-94} />
            </g>
          )}
        </g>
      )}
      {/* 切り口 (ギザギザの白線) と切りくず */}
      {cutT > 0 && (
        <g>
          <polyline
            points={Array.from({ length: 9 }).map((_, i) =>
              `${bx + (i % 2 === 0 ? -7 : 7)},${ey - 156 + i * (312 / 8) * cutT}`).join(" ")}
            fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.95} />
          <g transform={`translate(${bx - 36 + cutT * 26} ${ey + 180 + cutT * 150}) rotate(${cutT * 160})`} opacity={1 - cutT * 0.4}>
            <path d="M 0 0 L 36 8 L 20 34 Z" fill={SGP.paperOld} stroke={C.ink} strokeWidth={4} />
          </g>
        </g>
      )}
      {/* 左の長い帯: 途中から入る=○ */}
      <TagPlate x={560} y={742} text="途中から入る" size={36} t={seg(f, 14, 22)} fill="#F6EBD2" />
      <Maru x={810} y={756} s={0.52} t={seg(f, 18, 26)} />
      {/* 境目の年: 1897 と 初めての× */}
      <TagPlate x={1513} y={742} text="1897" size={36} t={seg(f, 26, 34)} fill="#F6EBD2" />
      <XMark x={1638} y={480} s={1.15} t={seg(f, 34, 42)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #107 仕上げは、拍手です。
// 格: 並 / seed 1142
// 絵: 拍手しようと持ち上がった両手の寄り。手袋の指先に緊張
// どこ: 暗い客席の中 (正面寄り)。上に舞台の光のにじみ 下に座席の背の列
// 演出: 白手袋の両手がすっと持ち上がる大写し。指先に緊張の印。シャンデリアの粒が奥に光る
// 動き: HakushuTe raiseT (seg 4-26) / 指先のふるえ / 緊張線 pop (seg 28-36) / 舞台光の脈動
const Sg107: React.FC<{ f: number }> = ({ f }) => {
  const raise = easeOut(seg(f, 4, 26));
  const tense = seg(f, 26, 38);
  const stageGlow = 0.8 + 0.2 * Math.sin(f / 8);
  return (
    <Frame f={f} seed={1142} dark bg="#262E40">
      {/* 舞台の光のにじみ (上奥) */}
      <ellipse cx={960} cy={60} rx={900} ry={300} fill={C.gasGlow} opacity={0.14 * stageGlow} />
      <ellipse cx={960} cy={30} rx={520} ry={180} fill={C.gasGlow} opacity={0.12 * stageGlow} />
      {/* シャンデリアの粒 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={180 + rnd(51, i) * 1560} cy={60 + rnd(52, i) * 190}
          r={3 + rnd(53, i) * 3} fill={C.gasGlow}
          opacity={0.3 + 0.5 * Math.sin(f / 6 + i * 2.2) * Math.sin(f / 6 + i * 2.2)} />
      ))}
      {/* 奥の観客の頭 (シルエット) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <circle cx={60 + i * 260 + rnd(54, i) * 60} cy={400 + rnd(55, i) * 40} r={56} fill="#1C2231" />
          <rect x={60 + i * 260 + rnd(54, i) * 60 - 70} y={430 + rnd(55, i) * 40} width={140} height={90} rx={20} fill="#1C2231" />
        </g>
      ))}
      {/* 座席の背の列 */}
      <g>
        <rect x={-20} y={520} width={1980} height={240} fill={C.hallSeat} />
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M ${i * 260 - 60} 760 L ${i * 260 - 40} 540 Q ${i * 260 + 70} 505 ${i * 260 + 180} 540 L ${i * 260 + 200} 760 Z`}
            fill="#523B5A" stroke="#38283E" strokeWidth={5} />
        ))}
        <rect x={-20} y={742} width={1980} height={360} fill="#38283E" />
      </g>
      {/* 白手袋の両手 (大写しで持ち上がる) */}
      <HakushuTe f={f} x={960} y={560} s={2.15} raiseT={raise} tension={tense * 0.8} />
      {/* 指先の緊張の印 */}
      {tense > 0 && (
        <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={pop(tense) * 0.9}>
          <line x1={640} y1={360} x2={608} y2={316} />
          <line x1={700} y1={330} x2={682} y2={282} />
          <line x1={1280} y1={360} x2={1312} y2={316} />
          <line x1={1220} y1={330} x2={1238} y2={282} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #108 交響曲の楽章と楽章のあいだでは、拍手をしない。
// 格: 並 / seed 1143
// 絵: 楽章の切れ目。拍手しかけた手が、周囲の視線でそっと膝に戻る (連番)。咳払いひとつ
// どこ: #107と同じ客席の連番。少し引いて隣席の頭が見える構図に変える (単調禁止)
// 演出: 拍手しかけた手が周囲の視線 (点線) でそっと膝に戻る。右隣から咳払いの湯気ひとつ
// 動き: HakushuTe raiseT 1→0 (seg 10-34) / 視線の点線 (seg 18-30) / 咳払いの息 pop (seg 30-40)
const Sg108: React.FC<{ f: number }> = ({ f }) => {
  const lower = 1 - easeOut(seg(f, 10, 34));
  const gazeT = seg(f, 18, 30);
  const cough = seg(f, 30, 40);
  const neighbor = (nx: number, flip: 1 | -1, phase: number) => (
    <g key={nx}>
      <rect x={nx - 150} y={700} width={300} height={400} rx={30} fill="#1E2434" />
      <circle cx={nx} cy={640} r={105} fill="#1E2434" />
      {/* 横目 (白目に黒目が中央の手の方へ寄る) */}
      <g opacity={gazeT}>
        <ellipse cx={nx + flip * 52} cy={628} rx={22} ry={13} fill={KRP.white} />
        <circle cx={nx + flip * (52 + 10)} cy={629} r={6.5} fill={C.ink} />
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={1143} dark bg="#222838">
      {/* 楽章の切れ目: 静まった舞台光 (弱い) */}
      <ellipse cx={960} cy={40} rx={820} ry={240} fill={C.gasGlow} opacity={0.08 + 0.03 * Math.sin(f / 10)} />
      {/* 奥の客席の頭の列 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={-40 + i * 220 + rnd(61, i) * 50} cy={330 + rnd(62, i) * 36} r={44} fill="#192030" />
      ))}
      <rect x={-20} y={360} width={1980} height={140} fill="#1C2231" />
      {/* 前の座席の背もたれ (すぐ手前の列) */}
      <path d="M -20 520 Q 240 486 500 516 Q 760 544 1020 514 Q 1280 486 1540 516 Q 1800 544 1940 520 L 1940 620 L -20 620 Z"
        fill={C.hallSeat} stroke="#38283E" strokeWidth={5} />
      {/* 中央: 膝の上へ戻る両手 */}
      <HakushuTe f={f} x={960} y={520} s={1.6} raiseT={lower} knees tension={0.2 * lower} />
      {/* 隣席の2人 (横目) */}
      {neighbor(250, 1, 1)}
      {neighbor(1670, -1, 2)}
      {/* 視線の点線 */}
      <g opacity={gazeT * 0.85} stroke={KRP.white} strokeWidth={4.5} strokeDasharray="4 16" strokeLinecap="round">
        <line x1={330} y1={636} x2={760} y2={640 + (1 - lower) * 120} />
        <line x1={1592} y1={636} x2={1160} y2={640 + (1 - lower) * 120} />
      </g>
      {/* 咳払いの湯気 (右隣から) */}
      {cough > 0 && (
        <g transform={`translate(${1540 - cough * 40} ${560 - cough * 60})`} opacity={(1 - cough) * 0.9 + 0.1}>
          <circle r={14 + cough * 8} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.7} />
          <circle cx={-36} cy={18} r={9 + cough * 5} fill="none" stroke={KRP.white} strokeWidth={4.5} opacity={0.55} />
          <circle cx={26} cy={30} r={7 + cough * 4} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.45} />
        </g>
      )}
      {/* 咳払いで震える頭の線 */}
      {cough > 0 && cough < 0.7 && (
        <g stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" opacity={0.8}>
          <line x1={1760} y1={560} x2={1788} y2={538} />
          <line x1={1770} y1={610} x2={1802} y2={606} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #109 いまのクラシックの常識ですが、定着したのは、20世紀に入ってからです。
// 格: 図 / seed 1144
// 絵: 年表。拍手のアイコンが19世紀は楽章ごと、20世紀に入ると最後に1回だけに変わる
// どこ: 楽屋の掲示板。コルク地に画鋲で留めた大きな進行表の紙
// 演出: 上段=19世紀 (楽章ごとに拍手)、下段=20世紀 (切れ目は点線の丸 最後に1回だけ大きな拍手)
// 動き: 楽章ブロックが順に点灯 / 19世紀の拍手が順に pop / 20世紀は点線→最後の1個が強 pop (seg 32-40)
const Sg109: React.FC<{ f: number }> = ({ f }) => {
  const rowY = [392, 678];
  const bx0 = 540, bw = 230, gap = 300; // 楽章ブロックの左端・幅・間隔
  const gyoretsu = (row: 0 | 1) => (
    <g key={row}>
      {/* 楽章ブロック4つ (音符入り) */}
      {[0, 1, 2, 3].map((i) => {
        const x = bx0 + i * gap;
        const lit = seg(f, 4 + i * 5 + row * 2, 9 + i * 5 + row * 2);
        return (
          <g key={i} opacity={0.25 + 0.75 * lit}>
            <rect x={x} y={rowY[row] - 62} width={bw} height={124} rx={16}
              fill={row === 0 ? "#F2E3BE" : "#DCE7EE"} stroke={C.ink} strokeWidth={5.5} />
            {/* 波線の譜線と音符 */}
            {[0, 1, 2].map((l) => (
              <line key={l} x1={x + 26} y1={rowY[row] - 26 + l * 26} x2={x + bw - 26} y2={rowY[row] - 26 + l * 26}
                stroke={C.ink} strokeWidth={2.5} opacity={0.4} />
            ))}
            <Onpu x={x + 86 + (i % 2) * 60} y={rowY[row] + 18} s={0.74}
              rot={Math.sin(f / 9 + i * 1.7 + row) * 8} />
            <Onpu x={x + 170 - (i % 2) * 60} y={rowY[row] + 26} s={0.6}
              rot={Math.sin(f / 7 + i * 2.3 + row) * 8} color={KRP.grayDark} />
          </g>
        );
      })}
      {/* 楽章の間 + 末尾の拍手の位置 */}
      {[0, 1, 2, 3].map((i) => {
        const x = bx0 + i * gap + bw + (gap - bw) / 2;
        if (row === 0) {
          return <ClapIcon key={i} f={f} x={x} y={rowY[0]} s={0.86} t={seg(f, 10 + i * 5, 17 + i * 5)} />;
        }
        return i < 3
          ? <ClapIcon key={i} f={f} x={x} y={rowY[1]} s={0.86} ghost />
          : <ClapIcon key={i} f={f} x={x} y={rowY[1]} s={1.18} t={seg(f, 32, 40)} strong />;
      })}
    </g>
  );
  return (
    <Frame f={f} seed={1144} bg="#CBB68E">
      {/* コルクの掲示板 */}
      <rect x={60} y={60} width={1800} height={900} rx={18} fill="#C9A878" stroke={C.ink} strokeWidth={8} />
      <rect x={92} y={92} width={1736} height={836} rx={12} fill="#B99666" />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={120 + rnd(71, i) * 1680} cy={110 + rnd(72, i) * 800} r={3 + rnd(73, i) * 4}
          fill="#A3825A" opacity={0.8} />
      ))}
      {/* 隅の古いビラ */}
      <g transform="translate(1700 180) rotate(8)">
        <rect x={-80} y={-70} width={160} height={140} fill="#E3D4AE" stroke={C.ink} strokeWidth={4} opacity={0.9} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-56} y1={-34 + i * 30} x2={40 + rnd(74, i) * 16} y2={-34 + i * 30} stroke={C.ink} strokeWidth={3.5} opacity={0.4} />
        ))}
        <circle cy={-60} r={7} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
      </g>
      {/* 進行表の紙 (画鋲4つ) */}
      <rect x={160} y={180} width={1600} height={700} rx={10} fill={SGP.paper} stroke={C.ink} strokeWidth={6} />
      {[[196, 214], [1724, 214], [196, 846], [1724, 846]].map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r={11} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <circle cx={px - 3} cy={py - 3} r={3} fill={KRP.white} opacity={0.8} />
        </g>
      ))}
      {/* 中央の仕切り線 */}
      <line x1={220} y1={535} x2={1700} y2={535} stroke={C.ink} strokeWidth={4} strokeDasharray="14 12" opacity={0.5} />
      {/* 行ラベル */}
      <TagPlate x={350} y={386} text="19世紀" size={38} t={seg(f, 2, 9)} fill="#F2E3BE" />
      <TagPlate x={350} y={672} text="20世紀" size={38} t={seg(f, 6, 13)} fill="#DCE7EE" />
      {gyoretsu(0)}
      {gyoretsu(1)}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #110 おしゃべりが消え、途中入場が消え、最後に拍手まで整理されました。
// 格: 図 / seed 1145
// 絵: 没収品の棚。「おしゃべり」「途中入場」「拍手」の札が順に引き出しへしまわれ、鍵がかかる
// どこ: 劇場の備品庫。薄暗い壁 棚にランタンと楽譜箱 中央に没収品の整理棚
// 演出: 「おしゃべり」「途中入場」「拍手」の木札が順に引き出しへ吸い込まれ 最後に南京錠がかかる
// 動き: 札の飛び込み (i*9ずらし) / 引き出しの開閉 / 南京錠 pop (seg 36-42) + 光 / ランタンの明滅
const Sg110: React.FC<{ f: number }> = ({ f }) => {
  const lantern = 0.8 + 0.2 * Math.sin(f / 4.2);
  const lockT = pop(seg(f, 36, 42));
  const items = ["おしゃべり", "途中入場", "拍手"];
  const cx = 1060, topY = 300, dh = 170; // 棚の位置と引き出しの高さ
  return (
    <Frame f={f} seed={1145} dark bg="#352E28">
      {/* 壁の板張り */}
      <rect x={-20} y={-20} width={1980} height={820} fill="#453B30" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={i * 210 + rnd(81, i) * 40} y1={-20} x2={i * 210 + rnd(81, i) * 40} y2={800}
          stroke="#383026" strokeWidth={5} opacity={0.8} />
      ))}
      {/* 床 */}
      <rect x={-20} y={790} width={1980} height={300} fill="#5E4E3C" />
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={i} x1={-20} y1={840 + i * 70} x2={1960} y2={840 + i * 70} stroke="#4C3F30" strokeWidth={4} opacity={0.7} />
      ))}
      {/* 左の棚: ランタンと楽譜箱 */}
      <g>
        <rect x={100} y={210} width={420} height={620} fill="#55452F" stroke={C.ink} strokeWidth={6} />
        <line x1={100} y1={420} x2={520} y2={420} stroke={C.ink} strokeWidth={5} />
        <line x1={100} y1={630} x2={520} y2={630} stroke={C.ink} strokeWidth={5} />
        {/* ランタン */}
        <circle cx={220} cy={330} r={95} fill={C.gasGlow} opacity={0.15 * lantern} />
        <rect x={190} y={282} width={60} height={96} rx={10} fill="#FBF3D8" stroke={C.ink} strokeWidth={5} opacity={0.95} />
        <rect x={182} y={272} width={76} height={14} rx={6} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <rect x={182} y={374} width={76} height={14} rx={6} fill={C.ironDark} stroke={C.ink} strokeWidth={4} />
        <path d={`M 220 362 Q ${220 + 6 * lantern} 334 220 ${322 - 10 * lantern} Q ${220 - 6 * lantern} 334 220 362 Z`} fill={KRP.orange} />
        {/* 楽譜の束と帽子箱 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={320 + i * 8} y={344 - i * 14} width={150} height={14} rx={4}
            fill={["#E3D4AE", "#D8C69C", "#E9DCBC"][i]} stroke={C.ink} strokeWidth={3.5} />
        ))}
        <ellipse cx={240} cy={560} rx={92} ry={26} fill="#7A5A66" stroke={C.ink} strokeWidth={5} />
        <rect x={148} y={492} width={184} height={70} rx={14} fill="#8A6A76" stroke={C.ink} strokeWidth={5} />
        <ellipse cx={380} cy={760} rx={110} ry={40} fill="#6E5A42" stroke={C.ink} strokeWidth={5} />
        <rect x={270} y={668} width={220} height={94} rx={10} fill="#7E684C" stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 中央: 没収品の整理棚 (引き出し3段) */}
      <g>
        <rect x={cx - 330} y={topY - 60} width={660} height={dh * 3 + 150} rx={14}
          fill="#6E5638" stroke={C.ink} strokeWidth={8} />
        <rect x={cx - 330} y={topY - 60} width={660} height={44} rx={14} fill="#55452F" stroke={C.ink} strokeWidth={6} />
        {items.map((label, i) => {
          const t = seg(f, 4 + i * 9, 16 + i * 9);        // 札が飛び込む
          const closeT = seg(f, 17 + i * 9, 23 + i * 9);  // 引き出しが閉まる
          const open = (t > 0 ? 1 : 0) * (1 - easeOut(closeT)) * 110;
          const dy = topY + i * dh;
          // 札の軌道: 右上から引き出しの口へ
          const tagX = lerp(1760, cx + 60, easeOut(t));
          const tagY = lerp(140 + i * 40, dy + 54, easeOut(t)) - Math.sin(easeOut(t) * Math.PI) * 120;
          const tagIn = closeT > 0.35; // しまわれて見えなくなる
          return (
            <g key={i}>
              {/* 引き出し本体 */}
              <g transform={`translate(${open} 0)`}>
                <rect x={cx - 290} y={dy} width={580} height={dh - 42} rx={10}
                  fill="#8A6F4E" stroke={C.ink} strokeWidth={6} />
                <rect x={cx - 270} y={dy + 16} width={540} height={dh - 74} rx={8}
                  fill="#4C3C28" stroke={C.ink} strokeWidth={4} opacity={0.9} />
                {/* 取っ手 */}
                <path d={`M ${cx - 40} ${dy + (dh - 42) / 2 + 12} q 40 26 80 0`}
                  fill="none" stroke={KRP.brass} strokeWidth={9} strokeLinecap="round" />
                {/* しまわれた札 (閉まる前に中に見える) */}
                {tagIn && closeT < 1 && (
                  <g transform={`translate(${cx + 10} ${dy + 52}) rotate(-6)`} opacity={0.9}>
                    <rect x={-96} y={-26} width={192} height={52} rx={8} fill="#D8C69C" stroke={C.ink} strokeWidth={4} />
                  </g>
                )}
              </g>
              {/* 飛んでいく木札 */}
              {t > 0 && !tagIn && (
                <g transform={`translate(${tagX} ${tagY}) rotate(${lerp(14, -8, easeOut(t))})`}>
                  <rect x={-98} y={-30} width={196} height={60} rx={8} fill="#E8D9B0" stroke={C.ink} strokeWidth={5} />
                  <circle cx={-78} cy={0} r={7} fill="none" stroke={C.ink} strokeWidth={4} />
                  <text x={10} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>
                    {label}
                  </text>
                </g>
              )}
              {/* 段のラベル札 (棚に貼ってある小さな札) */}
              <g opacity={closeT}>
                <rect x={cx - 312} y={dy + 10} width={44} height={dh - 34} rx={6}
                  fill="#D8C69C" stroke={C.ink} strokeWidth={4} />
                <text x={cx - 290} y={dy + 22} writingMode="vertical-rl"
                  fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.ink}>{label}</text>
              </g>
            </g>
          );
        })}
        {/* 南京錠 (最後にかかる) */}
        {lockT > 0 && (
          <g transform={`translate(${cx} ${topY + dh * 3 + 56}) scale(${lockT})`}>
            <path d="M -30 -24 L -30 -52 Q -30 -92 0 -92 Q 30 -92 30 -52 L 30 -24"
              fill="none" stroke={C.ironDark} strokeWidth={13} />
            <rect x={-52} y={-28} width={104} height={92} rx={14} fill={KRP.brass} stroke={C.ink} strokeWidth={6} />
            <circle cy={14} r={11} fill={C.ink} />
            <rect x={-5} y={14} width={10} height={26} fill={C.ink} />
            {/* かかった瞬間の光 */}
            <g stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" opacity={lockT}>
              <line x1={-76} y1={-60} x2={-96} y2={-80} />
              <line x1={76} y1={-60} x2={96} y2={-80} />
              <line x1={0} y1={-106} x2={0} y2={-132} />
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_099: (f) => <Sg099 f={f} />,
  sg_100: (f) => <Sg100 f={f} />,
  sg_101: (f) => <Sg101 f={f} />,
  sg_102: (f) => <Sg102 f={f} />,
  sg_103: (f) => <Sg103 f={f} />,
  sg_104: (f) => <Sg104 f={f} />,
  sg_105: (f) => <Sg105 f={f} />,
  sg_106: (f) => <Sg106 f={f} />,
  sg_107: (f) => <Sg107 f={f} />,
  sg_108: (f) => <Sg108 f={f} />,
  sg_109: (f) => <Sg109 f={f} />,
  sg_110: (f) => <Sg110 f={f} />,
};

export const S_B5_MOTIFS: string[] = [
  "sg_099", // #99
  "sg_100", // #100
  "sg_101", // #101
  "sg_102", // #102
  "sg_103", // #103
  "sg_104", // #104
  "sg_105", // #105
  "sg_106", // #106
  "sg_107", // #107
  "sg_108", // #108
  "sg_109", // #109
  "sg_110", // #110
];

export const saigoB5Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
