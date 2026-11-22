// 「なぜ人は、柔らかいものを握りたくなるのか」: 全巻で共有する「説明の装置」。
// 設計書: docs/yawarakai-design-1.md「全巻で共有する説明の装置」が正本。
//
// ★この4つは何度も出る同じ物。毎回同じ図を使い、描き直さない (絵のブレ禁止)。
// ★背景・空・部屋・洞窟・人の配置はここに置かない (制作ガイド §7 第3層)。
// ★props の形 (シグネチャ) を勝手に変えない。並走中の全員がこの形で呼ぶ。
//
// 使われる場所 (この巻):
//   Squishy:     #4 #5 #6 #10 #11 #16  (結びでも使う)
//   DameSofa:    #7 #8                  (第4章・第9章でも使う)
//   AgeDial:     #17 #27                (年代ダイヤル。時代が飛ぶときだけ)
//   KaradaChizu: #36                    (からだの地図。各章末のリキャップで育つ)

import React from "react";
import { useCurrentFrame } from "remotion";
import { KRP, KARAKURI_FONT, Person, seg, easeOut, clamp01, pop } from "./KarakuriScenes";
import { Frame } from "./YawaShared";

const FONT = KARAKURI_FONT;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 装置専用の色 (シーン側でも使ってよい)
export const YP = {
  // スクイーズ (2026年のシリコン製・半透明の桃色)
  sqBody: "#F6B4C4",
  sqDeep: "#E98AA3",
  sqShine: "#FFF2F5",
  sqDent: "#D9768F",
  // ソファ (無印風の生成りの布)
  sofa: "#CFC5B2",
  sofaDark: "#B3A893",
  sofaSeam: "#9E937E",
  // からだの地図
  glow: "#FFD36B",
  glowCore: "#FFF3C4",
  slot: "#B9AE98",
  // 年代ダイヤル (真鍮と木)
  brass: "#D9B23C",
  brassDark: "#A8862A",
  dialFace: "#F4EAD0",
  wood: "#A8743F",
  woodDark: "#7E5530",
  // 20万年前の人の服 (毛皮色)
  fur: "#A57C52",
  furDark: "#7D5C3B",
} as const;

/* ===================================================================
 * Squishy — 今のスクイーズ (半透明シリコンの桃色ねこ)
 *   x,y: 底の中心 / s: 大きさ (s=1 で幅 約260px) / squeeze: 0〜1 (横に潰れる)
 *   dent: 0〜1 指の跡の濃さ (握った直後=1 → ゆっくり 0 に戻すと「元に戻る」)
 *   f: ぷるぷる揺れ用 / rot: 傾き
 * =================================================================== */
export const Squishy: React.FC<{
  x: number; y: number; s?: number; squeeze?: number; dent?: number; f?: number; rot?: number;
  face?: "smile" | "squish";
}> = ({ x, y, s = 1, squeeze = 0, dent = 0, f = 0, rot = 0, face }) => {
  const q = clamp01(squeeze);
  const jig = Math.sin(f / 4.2) * 0.025 * (1 - q);
  const sx = 1 + q * 0.38 + jig;
  const sy = 1 - q * 0.3 - jig;
  const fc = face ?? (q > 0.4 ? "squish" : "smile");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s * sy})`}>
      {/* 影 */}
      <ellipse cx={0} cy={4} rx={130} ry={16} fill={KRP.ink} opacity={0.14} />
      {/* 耳 */}
      <path d="M -96 -150 L -78 -228 L -30 -176 Z" fill={YP.sqBody} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 96 -150 L 78 -228 L 30 -176 Z" fill={YP.sqBody} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -80 -164 L -74 -204 L -48 -178 Z" fill={YP.sqDeep} opacity={0.7} />
      <path d="M 80 -164 L 74 -204 L 48 -178 Z" fill={YP.sqDeep} opacity={0.7} />
      {/* 体 (おもち形) */}
      <path d="M -128 -8 Q -140 -120 -70 -168 Q 0 -200 70 -168 Q 140 -120 128 -8 Q 0 10 -128 -8 Z"
        fill={YP.sqBody} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
      {/* 半透明の奥の濃い色 (中のジェル) */}
      <path d="M -96 -20 Q -104 -96 -50 -128 Q 0 -150 50 -128 Q 104 -96 96 -20 Q 0 -6 -96 -20 Z"
        fill={YP.sqDeep} opacity={0.35} />
      {/* つやの光 */}
      <path d="M -84 -120 Q -60 -158 -14 -164" fill="none" stroke={YP.sqShine} strokeWidth={14} strokeLinecap="round" opacity={0.9} />
      <circle cx={-96} cy={-82} r={8} fill={YP.sqShine} opacity={0.85} />
      {/* 指の跡 (4本) */}
      {dent > 0.01 && [-66, -22, 22, 66].map((dx, i) => (
        <ellipse key={i} cx={dx} cy={-70 - Math.abs(dx) * 0.15} rx={17} ry={30}
          fill={YP.sqDent} opacity={0.5 * clamp01(dent)} />
      ))}
      {/* 顔 */}
      {fc === "smile" ? (
        <g stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" fill="none">
          <circle cx={-38} cy={-92} r={7} fill={KRP.ink} stroke="none" />
          <circle cx={38} cy={-92} r={7} fill={KRP.ink} stroke="none" />
          <path d="M -14 -70 Q -7 -62 0 -70 Q 7 -62 14 -70" />
        </g>
      ) : (
        <g stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" fill="none">
          <path d="M -50 -98 L -30 -88 L -50 -78" />
          <path d="M 50 -98 L 30 -88 L 50 -78" />
          <ellipse cx={0} cy={-66} rx={9} ry={6} />
        </g>
      )}
      {/* ほっぺ */}
      <ellipse cx={-66} cy={-66} rx={16} ry={9} fill={KRP.red} opacity={0.28} />
      <ellipse cx={66} cy={-66} rx={16} ry={9} fill={KRP.red} opacity={0.28} />
    </g>
  );
};

/* ===================================================================
 * DameSofa — 人をダメにするソファ (体の形に沈むビーズソファ)
 *   x,y: 床に接する中心 / s: 大きさ (s=1 で幅 約620px)
 *   sink: 0〜1 (座面のくぼみの深さ)
 *   children: ソファの「奥の布」と「手前のふち」の間に描かれる (=沈んだ人がここに入る)
 *   ★人は children に Person を入れる。手前のふちが体を隠すので「沈む」ように見える
 * =================================================================== */
export const DameSofa: React.FC<{
  x: number; y: number; s?: number; sink?: number; f?: number; children?: React.ReactNode;
}> = ({ x, y, s = 1, sink = 0, f = 0, children }) => {
  const k = clamp01(sink);
  const breathe = Math.sin(f / 18) * 3;
  const rimY = -150 - k * 90; // 沈むほど手前のふちが上へせり出して、人の体を隠す
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 床の影 */}
      <ellipse cx={0} cy={6} rx={330} ry={34} fill={KRP.ink} opacity={0.16} />
      {/* 奥の背もたれのふくらみ */}
      <path d={`M -300 -40 Q -330 -330 -40 -${380 + breathe} Q 300 -${390 + breathe} 310 -120 Q 320 -20 260 0 L -260 0 Q -300 -10 -300 -40 Z`}
        fill={YP.sofa} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      {/* 縫い目 */}
      <path d={`M -200 -60 Q -190 -270 0 -${320 + breathe}`} fill="none" stroke={YP.sofaSeam} strokeWidth={5} strokeDasharray="14 12" />
      <path d={`M 210 -70 Q 220 -250 60 -${330 + breathe}`} fill="none" stroke={YP.sofaSeam} strokeWidth={5} strokeDasharray="14 12" />
      {/* くぼみの陰 (沈むほど深く) */}
      <ellipse cx={0} cy={-170 + k * 40} rx={190} ry={60 + k * 70} fill={YP.sofaDark} opacity={0.75} />
      {/* ここに沈む人 */}
      {children}
      {/* 手前のふち (人の下半身を隠す) */}
      <path d={`M -310 -20 Q -320 ${rimY - 40} -150 ${rimY - 10} Q 0 ${rimY + 40 + k * 30} 150 ${rimY - 10} Q 320 ${rimY - 40} 310 -20 Q 300 8 0 10 Q -300 8 -310 -20 Z`}
        fill={YP.sofa} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
      {/* ふちのしわ */}
      <path d={`M -120 ${rimY + 30} Q -90 ${rimY + 60} -60 ${rimY + 34}`} fill="none" stroke={YP.sofaSeam} strokeWidth={4.5} strokeLinecap="round" />
      <path d={`M 70 ${rimY + 36} Q 100 ${rimY + 64} 130 ${rimY + 32}`} fill="none" stroke={YP.sofaSeam} strokeWidth={4.5} strokeLinecap="round" />
      {/* 取っ手のタグ */}
      <rect x={250} y={-90} width={40} height={26} rx={6} fill={YP.sofaDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

/* ===================================================================
 * AgeDial — 年代ダイヤル (からくり仕掛け。時代が飛ぶ文だけで使う)
 *   x,y: 中心 / s: 大きさ (s=1 で直径 約520px)
 *   spin: ダイヤルの回転角 (度)。シーン側で f から作る
 *   label: 窓に出す年代の文字 (例 "20万年前")
 *   handle: ハンドルの回転角 (度)
 * =================================================================== */
export const AgeDial: React.FC<{
  x: number; y: number; s?: number; spin?: number; label: string; handle?: number;
}> = ({ x, y, s = 1, spin = 0, label, handle = 0 }) => {
  const R = 250;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 木の台 */}
      <rect x={-300} y={200} width={600} height={90} rx={14} fill={YP.wood} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-300} y={200} width={600} height={22} rx={8} fill={YP.woodDark} opacity={0.6} />
      {[-240, 240].map((bx) => <circle key={bx} cx={bx} cy={246} r={11} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />)}
      {/* 支柱 */}
      <rect x={-34} y={150} width={68} height={60} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 外の真鍮リング (歯つき) */}
      <g transform={`rotate(${spin})`}>
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return (
            <rect key={i} x={-12} y={-R - 26} width={24} height={30} rx={4}
              fill={YP.brass} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(${(a * 180) / Math.PI})`} />
          );
        })}
        <circle r={R} fill={YP.brass} stroke={KRP.ink} strokeWidth={8} />
        <circle r={R - 34} fill={YP.dialFace} stroke={KRP.ink} strokeWidth={6} />
        {/* 目盛り */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * 360;
          const long = i % 5 === 0;
          return (
            <line key={i} x1={0} y1={-(R - 40)} x2={0} y2={-(R - (long ? 80 : 60))}
              stroke={KRP.ink} strokeWidth={long ? 6 : 3} transform={`rotate(${a})`} />
          );
        })}
        {/* スポーク */}
        {[0, 72, 144, 216, 288].map((a) => (
          <rect key={a} x={-10} y={-(R - 90)} width={20} height={R - 150} rx={8}
            fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${a})`} />
        ))}
      </g>
      {/* 中心の軸 (窓の後ろ) */}
      <circle r={26} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 年号の窓 (回らない) */}
      <rect x={-180} y={-66} width={360} height={132} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-180} y={-66} width={360} height={24} rx={12} fill={KRP.gray} opacity={0.35} />
      <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={Math.min(76, Math.floor(320 / Math.max(label.length, 1)))} fill={KRP.ink}>{label}</text>
      {/* 指針 */}
      <path d={`M 0 ${-R - 50} L -22 ${-R - 96} L 22 ${-R - 96} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      {/* 右横のハンドル (側面) */}
      <g transform={`translate(${R + 40} 0) rotate(${handle})`}>
        <rect x={-10} y={-10} width={120} height={20} rx={10} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={96} y={-34} width={30} height={68} rx={14} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        <circle r={20} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </g>
  );
};

/* ===================================================================
 * KaradaChizu — からだの地図 (この動画の背骨。毎回この同じ図)
 *   x,y: 人の足元 / s: 大きさ (既定 2.3 で身長 約670px)
 *   lit: 光っている座。0〜1 の強さ (0 = 消灯)
 *     back  背中の下 (体の後ろの光輪)
 *     neck  首 (首の下の光の座)
 *     arms  腕と胸
 *     body  全身の輪郭
 *     palm  手のひら (右手)
 *   slots: true なら、人の右に5つの座の凡例を出す (消灯中は点線の空き札 = これから光る予告)
 *   labels: true なら、光っている座の横に名前の小札を出す (凡例 slots と同時に使わない。既定 false)
 *   ★背景はシーン側で描く。この部品は人と光だけ
 * =================================================================== */
export type ZoneKey = "back" | "neck" | "arms" | "body" | "palm";
export const ZONE_NAMES: Record<ZoneKey, string> = {
  back: "背中", neck: "首", arms: "腕と胸", body: "全身", palm: "手のひら",
};
export const KaradaChizu: React.FC<{
  x: number; y: number; s?: number; f: number;
  lit?: Partial<Record<ZoneKey, number>>;
  slots?: boolean; labels?: boolean;
}> = ({ x, y, s = 2.3, f, lit = {}, slots = true, labels = false }) => {
  const L = (k: ZoneKey) => clamp01(lit[k] ?? 0);
  const pulse = 0.85 + Math.sin(f / 10) * 0.15;
  // Person の体の座標 (s=1・足元原点): 頭 中心(0,-228) r64 / 胴 x±58 y-160〜-52 / 右手 (67,-66)
  const zones: Record<ZoneKey, { cx: number; cy: number; rx: number; ry: number }> = {
    back: { cx: 0, cy: -104, rx: 108, ry: 92 },
    neck: { cx: 0, cy: -162, rx: 54, ry: 20 },
    arms: { cx: 0, cy: -118, rx: 98, ry: 56 },
    body: { cx: 0, cy: -150, rx: 120, ry: 178 },
    palm: { cx: 68, cy: -62, rx: 22, ry: 22 },
  };
  // 名札の位置 (人の外側。s 倍される前の座標)
  const tagPos: Record<ZoneKey, [number, number]> = {
    back: [-196, -100], neck: [-170, -172], arms: [176, -132], body: [-176, -300], palm: [168, -48],
  };
  const glowOf = (k: ZoneKey, behind: boolean) => {
    const v = L(k);
    const z = zones[k];
    if (v <= 0.01) return null;
    if (k === "back" && !behind) return null;
    if (k !== "back" && behind) return null;
    if (k === "body") {
      return (
        <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} fill="none"
          stroke={YP.glow} strokeWidth={18} opacity={0.75 * v * pulse} />
      );
    }
    return (
      <g opacity={v}>
        <ellipse cx={z.cx} cy={z.cy} rx={z.rx * 1.3} ry={z.ry * 1.3} fill={YP.glow} opacity={(behind ? 0.35 : 0.18) * pulse} />
        <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} fill={YP.glow} opacity={(behind ? 0.6 : 0.3) * pulse} />
        <ellipse cx={z.cx} cy={z.cy} rx={z.rx * 0.55} ry={z.ry * 0.55} fill={YP.glowCore} opacity={behind ? 0.8 : 0.35} />
      </g>
    );
  };
  // 凡例 (人の右に縦に5段)。光った座は塗りつぶし、まだの座は点線の空き札 = これから光る予告
  const legend = (k: ZoneKey, i: number) => {
    if (!slots) return null;
    const v = L(k);
    const name = ZONE_NAMES[k];
    const lx = 200, ly = -360 + i * 62; // 最下段の下端 = 足元から -94*s (s=2.3, 足元 y=920 で y≈704。字幕の帯にかからない)
    const w = 150;
    return (
      <g transform={`translate(${lx} ${ly})`}>
        <rect x={0} y={-22} width={w} height={44} rx={22}
          fill={v > 0.01 ? YP.glow : "none"} stroke={v > 0.01 ? KRP.ink : YP.slot}
          strokeWidth={v > 0.01 ? 3.5 : 3} strokeDasharray={v > 0.01 ? undefined : "8 7"} />
        <circle cx={24} cy={0} r={9} fill={v > 0.01 ? YP.glowCore : "none"}
          stroke={v > 0.01 ? KRP.ink : YP.slot} strokeWidth={3} />
        <text x={44} y={9} fontFamily={FONT} fontWeight={900} fontSize={24}
          fill={v > 0.01 ? KRP.ink : YP.slot}>{name}</text>
      </g>
    );
  };
  const keys: ZoneKey[] = ["back", "neck", "arms", "body", "palm"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 背中の光は体の後ろ */}
      {glowOf("back", true)}
      <Person x={0} y={0} s={1} f={f} face="smile" cloth="#6F8FB0" clothDark="#4F6C8C" />
      {/* 空き枠と前面の光 */}
      {keys.map((k, i) => <React.Fragment key={`s${k}`}>{legend(k, i)}</React.Fragment>)}
      {keys.map((k) => <React.Fragment key={`g${k}`}>{glowOf(k, false)}</React.Fragment>)}
      {/* 名札 (光っている座だけ) */}
      {labels && !slots && keys.map((k) => {
        const v = L(k);
        if (v <= 0.01) return null;
        const [tx, ty] = tagPos[k];
        const name = ZONE_NAMES[k];
        const w = name.length * 26 + 26;
        const sc = pop(v);
        return (
          <g key={`t${k}`} transform={`translate(${tx} ${ty}) scale(${sc / 1})`}>
            <rect x={-w / 2} y={-22} width={w} height={44} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>{name}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ===================================================================
 * 部品の見本帳 (YawaParts 合成)。コマ0: Squishy の潰れ方 / コマ1: DameSofa
 *   コマ2: AgeDial / コマ3: KaradaChizu (back だけ) / コマ4: KaradaChizu (全部点灯)
 * =================================================================== */
export const YAWA_PARTS_PREVIEW_FRAMES = 5;
export const YawaPartsPreview: React.FC = () => {
  const i = Math.min(useCurrentFrame(), YAWA_PARTS_PREVIEW_FRAMES - 1);
  const f = 45;
  return (
    <Frame f={f} seed={2990 + i}>
      {i === 0 && [0, 0.5, 1].map((q, k) => (
        <Squishy key={k} x={420 + k * 540} y={700} s={1.3} squeeze={q} dent={k === 2 ? 1 : 0} f={f} />
      ))}
      {i === 1 && (
        <DameSofa x={960} y={880} s={1.2} sink={0.8} f={f}>
          <Person x={0} y={-90} s={1.1} f={f} face="joy" />
        </DameSofa>
      )}
      {i === 2 && <AgeDial x={960} y={470} s={1.1} spin={f * 2} label="20万年前" handle={f * 6} />}
      {i === 3 && <KaradaChizu x={800} y={900} f={f} lit={{ back: 1 }} />}
      {i === 4 && <KaradaChizu x={800} y={900} f={f} lit={{ back: 1, neck: 1, arms: 1, body: 1, palm: 1 }} />}
    </Frame>
  );
};
void easeOut; void seg; void lerp;
