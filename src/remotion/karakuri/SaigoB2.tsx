// 「人類は、昔から飛ばして観ていた」: 文#45〜#56 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1044〜1055。
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
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";
import { ChikyuGi, chikyuTen } from "./SaigoChizu";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  operaDark: "#352636",   // オペラハウスの暗がり
  operaWall: "#6A3340",   // ボックス席の壁の赤
  velvet: "#8A3D4A",      // ビロードの赤 (緞帳より明るい)
  plum: "#8E4F76",        // 貴婦人のドレス
  plaster: "#EFE6D4",     // グローブ座の漆喰
  timber: "#5A4330",      // グローブ座の木骨
  thatch: "#C9A86A",      // 茅葺き
  dirt: "#C9A878",        // 土間の地面
  skyLdn: "#BBD6EE",      // ロンドンの空
  globeSea: "#9FC4DC",    // 地球儀の海
  globeLand: "#B8C98A",   // 地球儀の陸
  deskWood: "#8A6436",    // 机の木 (SGP.woodDark と同値だが用途名で持つ)
  pageCream: "#F7EFD9",   // 手帳の紙
  sorbet: "#F2DEC9",      // シャーベット
};
void Stamp; void XMark; void Arrow; void Danmen; void Tehaisho;
void SaiseiBar; void NenpyoEmaki; void Fuda3; void useCurrentFrame;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目の擬似乱数 (レンダのたびに変わらない)
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

// 八分音符 (ふわふわ漂う。op は呼び出し側で f から計算)
const Note: React.FC<{ x: number; y: number; s?: number; color?: string; op?: number; rot?: number }> =
  ({ x, y, s = 1, color = KRP.ink, op = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <ellipse cx={-8} cy={26} rx={13} ry={9} fill={color} transform="rotate(-18 -8 26)" />
      <path d="M 4 24 L 4 -22 q 20 4 26 20" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
    </g>
  );

// ロウソクの炎 (f でゆれる)
const Flame: React.FC<{ x: number; y: number; f: number; s?: number; phase?: number }> =
  ({ x, y, f, s = 1, phase = 0 }) => {
    const w = Math.sin(f / 5 + phase * 2.3) * 4;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle cx={0} cy={-16} r={26} fill={SGP.lampGold} opacity={0.4 + Math.sin(f / 6 + phase) * 0.12} />
        <path d={`M 0 0 Q ${8 + w} -14 0 -32 Q ${-8 + w} -14 0 0 Z`}
          fill={KRP.yellow} stroke={KRP.orange} strokeWidth={3.5} />
      </g>
    );
  };

// シャンデリア (#45 遠景 / #51 大 / #52 寄り。毎回同じ絵柄)
const Chandelier: React.FC<{ x: number; y: number; s?: number; f: number; sway?: number }> =
  ({ x, y, s = 1, f, sway = 0 }) => {
    const rot = sway ? Math.sin(f / 37) * sway : 0;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <g transform={`scale(${s})`}>
          <circle cx={0} cy={40} r={210} fill={SGP.lampGold} opacity={0.15 + Math.sin(f / 9) * 0.04} />
          <circle cx={0} cy={40} r={120} fill={SGP.lampGold} opacity={0.15 + Math.sin(f / 7) * 0.05} />
          <line x1={0} y1={-220} x2={0} y2={-60} stroke={KRP.brass} strokeWidth={8} />
          <circle cx={0} cy={-52} r={12} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-10} y={-48} width={20} height={116} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1].map((tier) => {
            const r = tier === 0 ? 150 : 88;
            const yy = tier === 0 ? 64 : 4;
            const n = tier === 0 ? 5 : 3;
            return (
              <g key={tier}>
                <path d={`M ${-r} ${yy} Q 0 ${yy + 54} ${r} ${yy}`}
                  fill="none" stroke={KRP.brass} strokeWidth={10} />
                {Array.from({ length: n }, (_, i) => {
                  const cx = -r + (2 * r / (n - 1)) * i;
                  return (
                    <g key={i}>
                      <rect x={cx - 7} y={yy - 32} width={14} height={32} rx={4}
                        fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                      <Flame x={cx} y={yy - 36} f={f} s={0.8} phase={i + tier * 3} />
                    </g>
                  );
                })}
              </g>
            );
          })}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M ${-120 + i * 40} ${82 + (i % 2) * 12} l 7 12 l -7 12 l -7 -12 z`}
              fill={KRP.white} stroke={KRP.brass} strokeWidth={2.5} opacity={0.9} />
          ))}
        </g>
      </g>
    );
  };

// 丸い吹き出し (しっぽ→本体の順に描いて継ぎ目を隠す)
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; t?: number;
  tx?: number; ty?: number; children?: React.ReactNode;
}> = ({ x, y, w, h, t = 1, tx = -40, ty = 70, children }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <path d={`M ${tx * 0.3} ${h / 2 - 20} L ${tx} ${h / 2 + ty} L ${tx * 0.3 + 40} ${h / 2 - 20} Z`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={w / 2} ry={h / 2} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {children}
    </g>
  );
};

// トゲトゲの野次吹き出し (#50)。中は文字ではなく殴り書きの線
const Yaji: React.FC<{ x: number; y: number; s?: number; op?: number; seed?: number }> =
  ({ x, y, s = 1, op = 1, seed = 1 }) => {
    const pts = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r = (i % 2 === 0 ? 92 : 58) * (0.9 + rnd(seed, i) * 0.25);
      return `${Math.cos(a) * r * 1.25},${Math.sin(a) * r}`;
    }).join(" ");
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
        <polygon points={pts} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d="M -48 -8 q 16 -26 30 0 q 14 24 30 -4 q 10 -18 24 -2" />
          <path d="M -36 22 q 14 -18 26 0 q 12 16 26 -4" opacity={0.7} />
        </g>
      </g>
    );
  };

// 羽ペン (tip が原点。羽は上へ)
const Quill: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M 0 0 L 9 -24 L 18 -118 Q -4 -94 -7 -28 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M 7 -36 L 13 -104" stroke={KRP.ink} strokeWidth={2.5} fill="none" opacity={0.55} />
      <path d="M 0 0 l -3 9" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );

// 扇 (pivot が原点。羽根は上へ開く)
const FanPart: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`rotate(${-54 + i * 18})`}>
          <path d="M 0 0 L -11 -92 L 11 -92 Z"
            fill={i % 2 ? "#E8C9D8" : "#F2DEE8"} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      <circle r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );

// グローブ座の舞台 (#48/#49/#50 で同じ物。platform 上面が y=0、中心が x=0)
const GlobeStagePart: React.FC<{ x: number; y: number; s?: number; f: number; children?: React.ReactNode }> =
  ({ x, y, s = 1, f, children }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 奥の幕 */}
      <rect x={-320} y={-430} width={640} height={430} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M ${-256 + i * 128} -430 q ${Math.sin(f / 16 + i) * 8} 215 0 430`}
          stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.3} />
      ))}
      {/* 屋根 (茅葺きの庇) と柱 */}
      <polygon points="-400,-430 400,-430 330,-540 -330,-540"
        fill={C.thatch} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-310 + i * 78} y1={-443} x2={-290 + i * 78} y2={-528} />
        ))}
      </g>
      <rect x={-330} y={-430} width={34} height={430} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
      <rect x={296} y={-430} width={34} height={430} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
      {/* 舞台の床と前板 */}
      <rect x={-380} y={0} width={760} height={26} fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-380} y={26} width={760} height={96} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.35}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-330 + i * 132} y1={30} x2={-330 + i * 132} y2={118} />
        ))}
      </g>
      {children}
    </g>
  );

// グローブ座の桟敷 (背景の帯。x0..x1 の範囲に2層。head は観客の豆)
const GalleryBand: React.FC<{ f: number; x0: number; x1: number; y: number; seed: number }> =
  ({ f, x0, x1, y, seed }) => {
    const wdt = x1 - x0;
    return (
      <g>
        {[0, 1].map((tier) => {
          const ty = y + tier * 170;
          return (
            <g key={tier}>
              <rect x={x0} y={ty} width={wdt} height={170} fill={C.plaster} stroke={KRP.ink} strokeWidth={5} />
              {/* 観客の豆 (ゆれる) */}
              {Array.from({ length: Math.floor(wdt / 74) }, (_, i) => {
                const hx = x0 + 44 + i * 74 + rnd(seed, i + tier * 50) * 20;
                const hy = ty + 96 + Math.sin(f / 11 + i * 1.7 + tier) * 4;
                const cc = [KRP.blueDeep, KRP.bronze, KRP.green, C.plum, KRP.grayDark][Math.floor(rnd(seed, i + tier * 90) * 5)];
                return (
                  <g key={i}>
                    <rect x={hx - 22} y={hy} width={44} height={56} rx={12} fill={cc} stroke={KRP.ink} strokeWidth={4} />
                    <circle cx={hx} cy={hy - 14} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                    <circle cx={hx - 5} cy={hy - 16} r={2.6} fill={KRP.ink} />
                    <circle cx={hx + 5} cy={hy - 16} r={2.6} fill={KRP.ink} />
                  </g>
                );
              })}
              {/* 手すり */}
              <rect x={x0} y={ty + 122} width={wdt} height={16} fill={SGP.wood} stroke={KRP.ink} strokeWidth={4.5} />
              {Array.from({ length: Math.floor(wdt / 46) }, (_, i) => (
                <rect key={i} x={x0 + 16 + i * 46} y={ty + 138} width={10} height={32}
                  fill={SGP.wood} stroke={KRP.ink} strokeWidth={3} />
              ))}
              {/* 柱 */}
              {Array.from({ length: Math.floor(wdt / 230) + 1 }, (_, i) => (
                <rect key={i} x={x0 + i * 230} y={ty} width={22} height={170}
                  fill={C.timber} stroke={KRP.ink} strokeWidth={4.5} />
              ))}
            </g>
          );
        })}
      </g>
    );
  };

// ===================================================================
// 演者の扮装 (#45/#48/#49/#50)
// ===================================================================
// Person / PersonMini は現代の服なので、舞台の上の人だけ時代の衣装を重ねる。
// 上下ゆれ (bob) は Person と同じ式でこちらが持つので、中の Person には
// still を渡して二重にゆれないようにする。構図とポーズは変えない。

// エリザベス朝の役者 (グローブ座)。襞襟を後ろに、胴着の裾・膨らんだ半ズボン・平帽を前に重ねる
const Yakusha: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; lean?: number;
  cloth: string; clothDark: string; feather?: string; buttons?: boolean;
  children: React.ReactNode;
}> = ({ x, y, s = 1, f, phase = 0, lean = 0, cloth, clothDark, feather = KRP.cream, buttons = true, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const fw = Math.sin((f + phase * 9) / 11) * 6; // 帽子の羽根のゆれ
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* ---- 後ろの層: 襞襟 (ひだえり) が首のまわりに扇形に開く ---- */}
      <ellipse cx={0} cy={-158} rx={90} ry={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
        {Array.from({ length: 11 }, (_, i) => {
          const a = ((-180 + i * 18) * Math.PI) / 180;
          return (
            <line key={i}
              x1={Math.cos(a) * 36} y1={-158 + Math.sin(a) * 13}
              x2={Math.cos(a) * 88} y2={-158 + Math.sin(a) * 31} />
          );
        })}
      </g>
      {children}
      {/* ---- 前の層 ---- */}
      {/* 膨らんだ半ズボン (トランクホーズ) */}
      <path d="M -48 -66 Q -62 -34 -32 -30 L 32 -30 Q 62 -34 48 -66 Z"
        fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.38} fill="none">
        <path d="M -24 -62 Q -32 -46 -22 -31" />
        <path d="M 0 -64 L 0 -30" />
        <path d="M 24 -62 Q 32 -46 22 -31" />
      </g>
      {/* 胴着の裾 (ペプラム。半ズボンの上にかぶる) */}
      <path d="M -58 -82 L 58 -82 L 76 -54 L -76 -54 Z"
        fill={clothDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 胴着の前合わせと黄銅のボタン */}
      {buttons && (
        <g>
          <path d="M 0 -148 L 0 -84" stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} fill="none" />
          {Array.from({ length: 4 }, (_, i) => (
            <circle key={i} cx={11} cy={-140 + i * 16} r={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
        </g>
      )}
      {/* 平帽 (つば広の平たい帽子) と羽根飾り */}
      <g transform={`rotate(${fw} 30 -296)`}>
        <path d="M 28 -294 Q 62 -312 84 -348 Q 98 -372 90 -384 Q 72 -370 54 -342 Q 38 -318 24 -300 Z"
          fill={feather} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M 30 -300 Q 58 -330 88 -378" stroke={KRP.ink} strokeWidth={3} opacity={0.35} fill="none" />
      </g>
      <path d="M -44 -290 Q -46 -322 0 -324 Q 46 -322 44 -290 Z"
        fill={clothDark} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-288} rx={70} ry={15} fill={clothDark} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -44 -292 Q 0 -300 44 -292" stroke={KRP.brass} strokeWidth={5} fill="none" opacity={0.8} />
    </g>
  );
};

// 18世紀オペラの歌手 (遠い舞台の豆粒)。裾広がりのドレスと白いかつらを重ねる。
// PersonMini は内部で bob を持つので、こちらは同じ式の bob を別に計算して前後にはさむ
const KashuMini: React.FC<{ x: number; y: number; s?: number; color: string; f: number }> =
  ({ x, y, s = 1, color, f }) => {
    const bob = Math.sin(f / 13) * 3;
    const tr = `translate(${x} ${y + bob}) scale(${s})`;
    return (
      <g>
        {/* 後ろの層: かつらの横の巻き毛 */}
        <g transform={tr}>
          <circle cx={-40} cy={-154} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={40} cy={-154} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <PersonMini x={x} y={y} s={s} color={color} f={f} face="smile" arms="up" />
        {/* 前の層: ドレスの裾・胸当て・かつらの天 */}
        <g transform={tr}>
          <path d="M -30 -68 L 30 -68 Q 98 -42 114 -2 L -114 -2 Q -98 -42 -30 -68 Z"
            fill={color} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.35} fill="none">
            <path d="M -56 -54 Q -66 -28 -70 -4" />
            <path d="M -20 -64 L -24 -4" />
            <path d="M 20 -64 L 24 -4" />
            <path d="M 56 -54 Q 66 -28 70 -4" />
          </g>
          <path d="M -34 -124 L 34 -124 L 20 -62 L -20 -62 Z"
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5}>
            <line x1={-26} y1={-112} x2={26} y2={-112} />
            <line x1={-23} y1={-98} x2={23} y2={-98} />
            <line x1={-20} y1={-84} x2={20} y2={-84} />
          </g>
          <path d="M -34 -172 Q -38 -208 0 -210 Q 38 -208 34 -172 Q 18 -182 0 -182 Q -18 -182 -34 -172 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #45 第2章、シャーベットのための、アリア。
// 格: 山 / seed 1044
// 絵: 章扉。オペラハウスの張り出し席で、銀の器のシャーベットを掲げる貴婦人。背景に豆粒の歌手
// どこ: オペラハウスの張り出し席 (左) から遠くの舞台 (右上) を望む
// 演出: 暗い客席に金の光。左手前のボックスで貴婦人が銀の器を高々と掲げ、豆粒の歌手が歌う
// 動き: 章扉がスッと出る・シャーベットの冷気ときらめき・音符が舞台から立ちのぼる・ゆるズーム
const Sg045: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 70)) * 0.05;
  return (
    <Frame f={f} seed={1044} dark bg="#2A2230"
      over={<ChapterDoor num={2} title="シャーベットのための アリア" t={seg(f, 8, 24)} />}>
      <g transform={zoomAt(z, 640, 500)}>
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.operaDark} />
        {/* 天井のシャンデリア (遠く) */}
        <Chandelier x={1150} y={120} s={0.72} f={f} sway={1.5} />
        {/* 右上: 遠い舞台。金のアーチとスポットライト */}
        <g>
          <path d="M 1130 640 L 1130 330 Q 1430 240 1730 330 L 1730 640 Z"
            fill="#4A2430" stroke={KRP.brass} strokeWidth={10} />
          <path d="M 1150 640 L 1150 348 Q 1430 266 1710 348 L 1710 640 Z"
            fill="#5E2A38" stroke={KRP.ink} strokeWidth={5} />
          <rect x={1130} y={620} width={600} height={26} fill={SGP.stage} stroke={KRP.ink} strokeWidth={5} />
          {/* スポットの帯 */}
          <polygon points="1400,280 1480,280 1560,620 1320,620"
            fill={SGP.lampGold} opacity={0.16 + Math.sin(f / 8) * 0.04} />
          {/* 豆粒の歌手 */}
          <KashuMini x={1438} y={622} s={0.5} color="#F2DEE8" f={f} />
          <ellipse cx={1438} cy={624} rx={52} ry={10} fill={SGP.lampGold} opacity={0.35} />
          {/* アリアの音符 */}
          {Array.from({ length: 4 }, (_, i) => {
            const p = ((f * 1.6 + i * 24) % 96) / 96;
            return <Note key={i} x={1430 + Math.sin(p * 7 + i) * 60 + i * 24} y={500 - p * 260}
              s={0.8 + i * 0.1} color="#F2DEE8" op={(1 - p) * 0.9} rot={Math.sin(f / 9 + i) * 14} />;
          })}
        </g>
        {/* 舞台下の平土間 (暗い頭の列。章扉の下敷きなのでごく薄く) */}
        <g opacity={0.5}>
          {Array.from({ length: 36 }, (_, i) => {
            const r = Math.floor(i / 12);
            const hx = 1000 + (i % 12) * 74 + rnd(1044, i) * 22;
            const hy = 740 + r * 92 + Math.sin(f / 13 + i) * 3;
            return <circle key={i} cx={hx} cy={hy} r={24 - r * 3} fill="#1E1824" stroke="#4A3A4E" strokeWidth={3} />;
          })}
        </g>
        {/* 左: 張り出し席。壁と緞帳 */}
        <rect x={-20} y={-20} width={880} height={1120} fill={C.operaWall} />
        <line x1={858} y1={-20} x2={858} y2={1100} stroke={KRP.brass} strokeWidth={10} />
        <g>
          <path d={`M -20 -20 L 190 -20 Q ${150 + Math.sin(f / 19) * 8} 400 240 1100 L -20 1100 Z`}
            fill={SGP.curtain} stroke={KRP.ink} strokeWidth={7} />
          <path d={`M 60 -20 Q ${60 + Math.sin(f / 16) * 10} 500 140 1060`}
            stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.4} />
          <circle cx={205} cy={560} r={26} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5}
            transform={`rotate(${Math.sin(f / 21) * 6} 205 420)`} />
        </g>
        {/* 壁の燭台 */}
        <g>
          <rect x={700} y={430} width={14} height={60} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <Flame x={707} y={430} f={f} s={1} phase={2} />
        </g>
        {/* 貴婦人 (ドレスのすそは人物の上に重ね描き) */}
        <Person x={440} y={880} s={1.5} cloth={C.plum} clothDark="#6E3A5C"
          face="joy" pose="raise" f={f} hair="cap" />
        <path d="M 290 1010 Q 310 850 380 800 L 500 800 Q 570 850 590 1010 Z"
          fill={C.plum} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 310 960 Q 440 930 570 960" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.4} />
        {/* 掲げた銀の器のシャーベット */}
        <g transform={`translate(${540} ${528 + Math.sin(f / 10) * 3})`}>
          <rect x={-6} y={0} width={12} height={34} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={38} rx={30} ry={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -46 -10 Q -40 16 0 16 Q 40 16 46 -10 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -34 -10 Q -30 -40 0 -40 Q 30 -40 34 -10 Z" fill={C.sorbet} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-8} cy={-44} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 冷気 */}
          {Array.from({ length: 2 }, (_, i) => (
            <path key={i} d={`M ${-16 + i * 30} -52 q ${Math.sin(f / 9 + i * 2) * 10} -16 2 -34`}
              stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.55} strokeLinecap="round" />
          ))}
          {/* きらめき */}
          {Array.from({ length: 3 }, (_, i) => {
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 7 + i * 1.9));
            const sx = [-58, 52, 10][i]; const sy = [-26, -40, -72][i];
            return (
              <g key={i} transform={`translate(${sx} ${sy}) scale(${tw})`} opacity={tw}>
                <path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} />
              </g>
            );
          })}
        </g>
        {/* ボックスの手すり (人物の脚を隠す) */}
        <g>
          <rect x={-20} y={980} width={880} height={130} fill="#4A2430" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M ${30 + i * 72} 1100 q -14 -46 0 -84 q 14 38 0 84`}
              fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={-20} y={956} width={880} height={30} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -20 970 L 860 970" stroke={KRP.gold} strokeWidth={5} opacity={0.6} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #46 では、海の向こうは、どうだったのでしょうか。
// 格: 並 / seed 1045
// 絵: 地球儀がくるり。江戸から欧州へ航路の点線が伸びる
// どこ: 書斎の机の上。本棚と巻いた海図のある部屋に大きな地球儀
// 演出: 地球儀がくるりと回って止まり、江戸から欧州へ航路の点線が伸びて小さな帆船が走る
// 動き: 大陸が回り込んで静止 (f0-30)・点線の航路が描かれる (f24-42)・帆船が波にゆれる
// 地球儀の寸法 (台座・弓・札の引き出し線と共有する)
const G46 = { cx: 960, cy: 500, r: 320, tilt: 14 };
// 江戸 → 喜望峰まわり → ヨーロッパ の航路 (経度, 緯度)
const G46_ROUTE: [number, number][] = [
  [139.8, 35.3], [128, 28], [115, 12], [100, 3], [82, -6], [58, -22],
  [32, -34], [19, -35], [8, -22], [-2, -5], [-11, 16], [-9, 37], [1, 48],
];

const Sg046: React.FC<{ f: number }> = ({ f }) => {
  // 地球儀がくるりと回って止まる。正面に来る経度そのものを動かすので、
  // 大陸は本当に回り込んでくる (だます描き方をしない)
  const lon0 = 70 + (1 - easeOut(seg(f, 0, 30))) * 150;
  const route = easeOut(seg(f, 24, 42));
  // 球の上の一点を画面座標へ (地軸の傾きのぶんだけ回す)
  const gpt = (lon: number, lat: number): [number, number] | null => {
    const p = chikyuTen(lon, lat, G46.r, lon0);
    if (!p) return null;
    const t = (G46.tilt * Math.PI) / 180;
    return [
      G46.cx + p[0] * Math.cos(t) - p[1] * Math.sin(t),
      G46.cy + p[0] * Math.sin(t) + p[1] * Math.cos(t),
    ];
  };
  const edo = gpt(139.8, 35.3);
  const euro = gpt(8, 49);
  // 航路の点。route が進むぶんだけ現れる
  const rp = G46_ROUTE.map(([lo, la]) => chikyuTen(lo, la, G46.r, lon0));
  const shown = rp.filter((p): p is [number, number] => p !== null);
  const upto = Math.floor(route * (shown.length - 1));
  // 帆船は球のふちに乗ると形がつぶれるので、内側に収まっている点までしか進ませない
  const shipIdx = (() => {
    let k = 0;
    for (let i = 0; i <= upto; i++) {
      if (Math.hypot(shown[i][0], shown[i][1]) <= G46.r * 0.86) k = i;
    }
    return k;
  })();
  return (
    <Frame f={f} seed={1045}>
      {/* 書斎の壁と腰板 */}
      <rect x={-20} y={-20} width={W + 40} height={740} fill="#E8DFC8" />
      <rect x={-20} y={700} width={W + 40} height={180} fill="#D4C5A4" />
      <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={6} />
      {/* 本棚 (左上) */}
      <g>
        <rect x={60} y={150} width={420} height={420} fill={C.deskWood} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1].map((r) => (
          <g key={r}>
            <rect x={80} y={170 + r * 200} width={380} height={180} fill="#6E4E28" stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x={96 + i * 52} y={196 + r * 200 + rnd(1045, i + r * 9) * 24}
                width={40} height={150 - rnd(1045, i + r * 9) * 24}
                fill={[KRP.red, KRP.blueDeep, KRP.green, KRP.bronze][Math.floor(rnd(1045, i * 3 + r) * 4)]}
                stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
      </g>
      {/* 壁の海図の額 (右上) */}
      <g>
        <rect x={1510} y={160} width={330} height={250} fill={SGP.paper} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1510} y={160} width={330} height={250} fill="none" stroke={C.deskWood} strokeWidth={14} />
        <path d="M 1550 340 Q 1620 240 1700 300 Q 1770 340 1810 230" stroke={KRP.blueDeep}
          strokeWidth={4} fill="none" opacity={0.6} />
        <path d="M 1560 210 q 20 26 50 10 q 30 -14 54 12 q 24 24 60 6" stroke={KRP.ink}
          strokeWidth={3.5} fill="none" opacity={0.4} />
      </g>
      {/* 机 */}
      <rect x={-20} y={870} width={W + 40} height={230} fill={C.deskWood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={-20} y1={910 + i * 38} x2={W + 20} y2={904 + i * 38} />
        ))}
      </g>
      {/* 机上: 巻いた海図とコンパス */}
      <g>
        <rect x={210} y={812} width={300} height={56} rx={28} fill={SGP.paper} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={240} cy={840} r={28} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={240} cy={840} r={12} fill={C.deskWood} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1560} cy={850} r={42} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1560} cy={850} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 1560 850 L ${1560 + Math.cos(f / 18) * 22} ${850 - Math.abs(Math.sin(f / 18)) * 22}`}
          stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* 地球儀本体 */}
      <g>
        {/* 台座と弓 */}
        <path d="M 900 930 L 1020 930 L 990 850 L 930 850 Z" fill={C.deskWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={944} y={810} width={32} height={46} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 960 150 A 352 352 0 0 0 960 852" fill="none" stroke={KRP.brass} strokeWidth={18}
          transform="rotate(14 960 500)" />
        <path d="M 960 150 A 352 352 0 0 0 960 852" fill="none" stroke={KRP.ink} strokeWidth={5}
          transform="rotate(14 960 500)" opacity={0.6} />
        {/* 球。海岸線は実際の経度・緯度、経緯線は正射図法の式どおりの位置 */}
        <ChikyuGi cx={G46.cx} cy={G46.cy} r={G46.r} lon0={lon0} tilt={G46.tilt}
          sea={C.globeSea} land={C.globeLand} ink={KRP.ink} grid={KRP.white} landWidth={4}>
          {/* 航路の点線: 江戸 → 喜望峰まわり → ヨーロッパ。球と一緒に傾く */}
          {route > 0 && shown.slice(0, upto + 1).map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={6} fill={KRP.red}
              stroke={KRP.ink} strokeWidth={2.5} />
          ))}
          {/* 帆船 (航路の先頭で波にゆれる) */}
          {route > 0 && shown[shipIdx] && (
            <g transform={`translate(${shown[shipIdx][0]} ${shown[shipIdx][1] + Math.sin(f / 8) * 4}) rotate(${Math.sin(f / 10) * 6}) scale(0.85)`}
              opacity={seg(f, 26, 34)}>
              <path d="M -24 0 L 24 0 L 15 15 L -15 15 Z" fill={C.deskWood} stroke={KRP.ink} strokeWidth={4} />
              <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 0 -34 Q 21 -21 0 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          )}
        </ChikyuGi>
        {/* 球のつや */}
        <path d="M 760 290 Q 820 220 920 210" stroke={KRP.white} strokeWidth={14}
          fill="none" opacity={0.5} strokeLinecap="round" />
      </g>
      {/* 札と引き出し線 (引き出し先は投影の計算から出した本当の位置) */}
      {edo && (
        <g opacity={seg(f, 12, 20) * 0.85}>
          <line x1={1400} y1={632} x2={edo[0] + 26} y2={edo[1] + 18}
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={edo[0]} cy={edo[1]} r={13} fill="none" stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {/* 左右で見くらべる2枚の札なので、高さは同じ値にそろえる (からくり検査4) */}
      <TagPlate x={1480} y={660} text="江戸" size={44} t={seg(f, 12, 20)} rot={3} />
      {euro && (
        <g opacity={seg(f, 16, 24) * 0.85}>
          <line x1={538} y1={632} x2={euro[0] - 24} y2={euro[1] + 16}
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={euro[0]} cy={euro[1]} r={13} fill="none" stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      <TagPlate x={430} y={660} text="ヨーロッパ" size={44} t={seg(f, 16, 24)} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #47 400年ほど前のロンドン。シェイクスピアの舞台、グローブ座。
// 格: 山 / seed 1046
// 絵: グローブ座の全景。円形の木造、青空の天井、旗、ひしめく観客
// どこ: ロンドンの下町の通り。円形の木造劇場グローブ座を正面から見上げる
// 演出: 白い漆喰と木骨の多角形の壁・茅葺きの環・中央の空・旗。入口へ観客がぞろぞろ
// 動き: 旗が風にはためく・雲が流れる・鳥が舞う・行列がゆれながら進む・ゆるズーム
const Sg047: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.05;
  const cl = f * 0.5;
  // 木骨パネル (漆喰+×の筋交い)
  const panel = (x: number, y: number, w: number, h: number, k: number) => (
    <g key={k}>
      <rect x={x} y={y} width={w} height={h} fill={C.plaster} stroke={C.timber} strokeWidth={7} />
      <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={C.timber} strokeWidth={6} opacity={0.85} />
      <line x1={x + w} y1={y} x2={x} y2={y + h} stroke={C.timber} strokeWidth={6} opacity={0.85} />
    </g>
  );
  return (
    <Frame f={f} seed={1046}>
      {/* 空と雲 */}
      <rect x={-20} y={-20} width={W + 40} height={880} fill={C.skyLdn} />
      <g fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.9}>
        <path d={`M ${120 + (cl % 2100) - 100} 170 q 14 -44 62 -36 q 18 -36 70 -26 q 40 -20 62 14 q 40 -4 42 32 q 20 8 14 26 l -250 0 z`} />
        <path d={`M ${1500 - ((cl * 0.6) % 1900)} 300 q 12 -36 52 -30 q 16 -28 58 -20 q 34 -16 52 12 q 32 -4 34 26 q 16 8 10 22 l -206 0 z`} />
      </g>
      {/* 鳥 */}
      <g stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.7}>
        <path d={`M ${1620 - (cl % 1400)} ${210 + Math.sin(f / 14) * 12} q 13 -12 26 0 q 13 -12 26 0`} />
        <path d={`M ${1720 - (cl % 1400)} ${260 + Math.sin(f / 11 + 2) * 10} q 10 -9 20 0 q 10 -9 20 0`} />
      </g>
      {/* 遠景の下町の屋根 */}
      <g opacity={0.55}>
        {Array.from({ length: 14 }, (_, i) => {
          const hx = i * 148 - 60;
          const hh = 60 + rnd(1046, i) * 70;
          return (
            <g key={i}>
              <rect x={hx} y={840 - hh} width={110} height={hh} fill="#C9B89A" stroke={KRP.ink} strokeWidth={4} />
              <polygon points={`${hx - 8},${840 - hh} ${hx + 55},${840 - hh - 42} ${hx + 118},${840 - hh}`}
                fill="#8A6A4E" stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* 隣家の煙突の煙 */}
      <path d={`M 220 700 q ${Math.sin(f / 13) * 14} -40 10 -70 q ${Math.sin(f / 10) * 16} -36 2 -66`}
        stroke={KRP.grayDark} strokeWidth={10} fill="none" opacity={0.4} strokeLinecap="round" />
      {/* グローブ座本体: 奥の高い環 */}
      <g>
        <rect x={700} y={300} width={520} height={130} fill={C.plaster} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 4 }, (_, i) => panel(712 + i * 126, 312, 118, 106, i + 100))}
        <path d="M 680 300 L 960 236 L 1240 300 Z" fill={C.thatch} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={740 + i * 62} y1={296} x2={776 + i * 58} y2={252} />
          ))}
        </g>
        {/* 旗 (上演中の印。風にはためく) */}
        <line x1={960} y1={236} x2={960} y2={100} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M 960 104 q 55 ${-8 + Math.sin(f / 6) * 10} 110 ${Math.sin(f / 5) * 14}
                 l 0 54 q -55 ${8 + Math.sin(f / 6 + 1) * 10} -110 ${Math.sin(f / 5 + 0.7) * 10} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 無地の白旗 (紋は入れない)。布のたわみだけ薄い線で */}
        <path d={`M 968 ${122 + Math.sin(f / 6) * 3} q 52 ${Math.sin(f / 6 + 1) * 8} 102 ${Math.sin(f / 5 + 0.7) * 8}`}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      </g>
      {/* 前の壁 (3面の多角形。木骨2層) */}
      <g>
        <polygon points="460,470 760,420 760,860 460,860" fill={C.plaster} stroke={KRP.ink} strokeWidth={8} />
        <polygon points="1160,420 1460,470 1460,860 1160,860" fill={C.plaster} stroke={KRP.ink} strokeWidth={8} />
        <rect x={760} y={420} width={400} height={440} fill={C.plaster} stroke={KRP.ink} strokeWidth={8} />
        {/* 中央面のパネル */}
        {panel(772, 440, 182, 170, 0)}
        {panel(966, 440, 182, 170, 1)}
        {panel(772, 626, 182, 170, 2)}
        {panel(966, 626, 182, 170, 3)}
        {/* 側面のパネル (遠近で狭い) */}
        {panel(480, 486, 128, 160, 4)}
        {panel(620, 466, 128, 170, 5)}
        {panel(480, 662, 128, 160, 6)}
        {panel(620, 652, 128, 170, 7)}
        {panel(1172, 466, 128, 170, 8)}
        {panel(1312, 486, 128, 160, 9)}
        {panel(1172, 652, 128, 170, 10)}
        {panel(1312, 662, 128, 160, 11)}
        {/* 茅葺きの庇 */}
        <polygon points="440,470 760,414 1160,414 1480,470 1480,428 1160,368 760,368 440,428"
          fill={C.thatch} stroke={KRP.ink} strokeWidth={7} />
        {/* 入口 */}
        <path d="M 880 860 L 880 740 Q 960 690 1040 740 L 1040 860 Z"
          fill="#3A2A1E" stroke={KRP.ink} strokeWidth={7} />
        <rect x={852} y={852} width={216} height={18} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 入口の掛け看板 */}
        <g transform={`rotate(${Math.sin(f / 23) * 3} 960 652)`}>
          <line x1={960} y1={652} x2={960} y2={676} stroke={KRP.ink} strokeWidth={4} />
          <rect x={918} y={676} width={84} height={40} rx={6} fill={SGP.wood} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={960} cy={696} r={11} fill="none" stroke={KRP.white} strokeWidth={4} />
        </g>
      </g>
      {/* 通り */}
      <rect x={-20} y={840} width={W + 40} height={260} fill="#D9C9A6" />
      <line x1={-20} y1={840} x2={W + 20} y2={840} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.25}>
        <path d="M 160 920 q 300 -16 620 -6" fill="none" />
        <path d="M 1100 980 q 340 -20 700 -4" fill="none" />
      </g>
      {/* 樽と手押し車 (右) */}
      <g>
        <rect x={1620} y={880} width={110} height={120} rx={18} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1620} y1={916} x2={1730} y2={916} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1620} y1={964} x2={1730} y2={964} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1560} y={936} width={90} height={100} rx={16} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 入口へ向かう観客の列 (ゆれながら進む) */}
      {Array.from({ length: 9 }, (_, i) => {
        const p = i / 8;
        const qx = lerp(330, 940, p) + Math.sin(f / 9 + i * 1.8) * 5;
        const qy = lerp(1020, 866, p * p);
        const qs = lerp(0.95, 0.55, p);
        const cc = [KRP.blueDeep, KRP.bronze, KRP.green, C.plum, KRP.grayDark, KRP.orange][Math.floor(rnd(1046, i) * 6)];
        return <PersonMini key={i} x={qx} y={qy} s={qs} color={cc} f={f} phase={i}
          face={p > 0.6 ? "none" : "smile"} arms={rnd(1046, i + 20) > 0.75 ? "up" : "down"} />;
      })}
      {/* 右から来るふたり連れ */}
      <PersonMini x={1400 - (f % 44) * 0.8} y={1000} s={0.9} color={KRP.red} f={f} phase={3} face="smile" />
      <PersonMini x={1520 - (f % 44) * 0.8} y={1030} s={0.95} color={KRP.blueDeep} f={f} phase={5} face="dot" />
      <TagPlate x={330} y={240} text="グローブ座" size={48} t={seg(f, 10, 20)} rot={-2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #48 1ペニー払った立ち見のお客は、上演中にリンゴやナッツをかじり、エールを飲みました。
// 格: 並 / seed 1047
// 絵: 土間の立ち見。リンゴをかじる男、エールのジョッキ。手前に1ペニー硬貨の札
// どこ: グローブ座の中。土間 (立ち見席)。左に舞台、奥に桟敷の帯
// 演出: 手前の3人が主役: リンゴをかじる男・エールをあおる男・ナッツの紙包みの女。左下に1ペニー硬貨
// 動き: リンゴのかじり跡とかけら・ジョッキが傾いて泡が立つ・奥の客がゆれる・役者が芝居を続ける
const Sg048: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.04;
  const bite = seg(f, 16, 22); // かじる瞬間
  const tilt = -14 + Math.sin(f / 12) * 10; // ジョッキの傾き
  return (
    <Frame f={f} seed={1047}>
      <g transform={zoomAt(z, 900, 620)}>
        {/* 奥: 空 (天井のない劇場) と桟敷 */}
        <rect x={-20} y={-20} width={W + 40} height={520} fill={C.skyLdn} />
        <GalleryBand f={f} x0={470} x1={1940} y={120} seed={1047} />
        <rect x={470} y={60} width={1470} height={60} fill={C.thatch} stroke={KRP.ink} strokeWidth={6} />
        {/* 左: 舞台。役者が見得を切っている */}
        <GlobeStagePart x={110} y={680} s={0.92} f={f}>
          <Yakusha x={60} y={0} s={0.85} f={f} phase={2} cloth={KRP.red} clothDark="#A03226">
            <Person x={0} y={0} cloth={KRP.red} clothDark="#A03226"
              pose="point" pointDir={1} face="surprised" f={f} phase={2} still />
          </Yakusha>
          <ellipse cx={60} cy={2} rx={66} ry={12} fill={KRP.ink} opacity={0.15} />
        </GlobeStagePart>
        {/* 土間の地面 */}
        <rect x={-20} y={700} width={W + 40} height={400} fill={C.dirt} />
        <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={6} />
        {/* 地面に散る藁 */}
        <g stroke="#A8863E" strokeWidth={4} strokeLinecap="round" opacity={0.6}>
          {Array.from({ length: 14 }, (_, i) => {
            const sx = 80 + rnd(1047, i) * 1760;
            const sy = 760 + rnd(1047, i + 30) * 280;
            return <line key={i} x1={sx} y1={sy} x2={sx + 26 - rnd(1047, i + 60) * 52} y2={sy + 10} />;
          })}
        </g>
        {/* 中景の立ち見の群衆 */}
        {Array.from({ length: 10 }, (_, i) => {
          const mx = 560 + i * 146 + rnd(1047, i + 5) * 40;
          const my = 744 + rnd(1047, i + 15) * 50;
          const cc = [KRP.blueDeep, KRP.bronze, KRP.green, KRP.grayDark, C.plum][Math.floor(rnd(1047, i + 25) * 5)];
          return <PersonMini key={i} x={mx} y={my} s={0.52} color={cc} f={f} phase={i}
            face="dot" arms={rnd(1047, i + 45) > 0.8 ? "up" : "down"} />;
        })}
        {/* 手前の主役3人 */}
        {/* リンゴ男 */}
        <ellipse cx={700} cy={992} rx={96} ry={20} fill={KRP.ink} opacity={0.14} />
        <Person x={700} y={984} s={1.3} cloth={KRP.green} clothDark="#5E8E5A"
          face="joy" pose="hold" f={f} />
        <g transform={`translate(700 ${824 + Math.sin(f / 7) * 3})`}>
          <circle r={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {bite > 0 && (
            <path d={`M 14 -24 a ${13 * bite} ${15 * bite} 0 0 1 2 34`}
              fill={C.sorbet} stroke={KRP.ink} strokeWidth={4} />
          )}
          <path d="M 0 -28 q 4 -14 14 -18" stroke={KRP.ink} strokeWidth={4.5} fill="none" />
          <path d="M 2 -38 q 14 -10 20 2 q -12 8 -20 -2 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* かじったかけら */}
        {bite > 0 && Array.from({ length: 2 }, (_, i) => {
          const p = clamp01((f - 20 - i * 3) / 14);
          return <circle key={i} cx={740 + p * (40 + i * 26)} cy={810 + p * p * 90}
            r={6 - i} fill={C.sorbet} stroke={KRP.ink} strokeWidth={3} opacity={1 - p} />;
        })}
        {/* エール男 */}
        <ellipse cx={1120} cy={1010} rx={96} ry={20} fill={KRP.ink} opacity={0.14} />
        <Person x={1120} y={1002} s={1.3} cloth={KRP.bronze} clothDark="#96613A"
          face="smile" pose="hold" f={f} phase={3} />
        <g transform={`translate(1120 ${846 + Math.sin(f / 9 + 1) * 3}) rotate(${tilt})`}>
          <rect x={-30} y={-42} width={60} height={78} rx={10} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={-18} y1={-42} x2={-18} y2={36} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          <line x1={6} y1={-42} x2={6} y2={36} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          <path d="M 30 -26 q 30 6 24 36 q -4 22 -24 20" fill="none" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -32 -44 q 16 -16 32 -6 q 16 -12 32 6 l -2 10 l -60 0 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 立ちのぼる泡 */}
        {Array.from({ length: 3 }, (_, i) => {
          const p = ((f * 1.5 + i * 15) % 45) / 45;
          return <circle key={i} cx={1130 + Math.sin(p * 6 + i) * 14} cy={796 - p * 60}
            r={5 + i * 2} fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={(1 - p) * 0.9} />;
        })}
        {/* ナッツの女 */}
        <ellipse cx={1520} cy={1000} rx={92} ry={20} fill={KRP.ink} opacity={0.14} />
        <Person x={1520} y={992} s={1.26} cloth={C.plum} clothDark="#6E3A5C"
          face="smile" pose="hold" f={f} phase={6} gaze={[-4, 1]} />
        <g transform={`translate(1520 ${842 + Math.sin(f / 8 + 2) * 3})`}>
          <path d="M -34 -30 L 34 -30 L 12 36 L -12 36 Z" fill={SGP.paper} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} cx={-20 + i * 10} cy={-36 - (i % 2) * 8} rx={7} ry={9}
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 手前: 1ペニー硬貨 */}
        <g transform={`translate(250 870) rotate(${-8 + Math.sin(f / 17) * 3})`}>
          <circle r={95} fill={KRP.copper} stroke={KRP.ink} strokeWidth={7} />
          <circle r={72} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
          {/* 横顔の刻印 */}
          <path d="M -16 -40 q 26 -10 34 14 q 6 20 -4 34 q 12 2 10 14 q -2 10 -16 10 q -26 2 -32 -20 q -8 -32 8 -52 Z"
            fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
          <path d="M -22 36 q 20 10 42 0" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.6} />
          <path d="M -60 -56 Q -30 -78 10 -74" stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.5} />
        </g>
        <TagPlate x={250} y={694} text="1ペニー" size={44} t={seg(f, 8, 16)} rot={-4} />
        <line x1={250} y1={736} x2={250} y2={768} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 8, 16) * 0.7} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #49 売り子が、客席の中を売り歩いていたのです。
// 格: 並 / seed 1048
// 絵: 籠を抱えた売り子が人垣を縫う。「ナッツいかが」の吹き出し。手が伸びる
// どこ: 同じ土間。人垣のすき間の通り道を、籠を抱えた売り子が縫って歩く
// 演出: 上演は続いたまま (奥に小さく舞台)。売り子の「ナッツいかが」に客の腕が伸びる
// 動き: 売り子が右へ歩く・吹き出しがポン・両脇の客が腕を振って呼ぶ・群衆がゆれる
const Sg049: React.FC<{ f: number }> = ({ f }) => {
  const vx = 820 + easeOut(seg(f, 0, 42)) * 150; // 売り子の歩み
  const vy = 884 + Math.sin(f / 6) * 5;
  return (
    <Frame f={f} seed={1048}>
      {/* 奥: 舞台 (芝居は続いている) と桟敷のすそ */}
      <rect x={-20} y={-20} width={W + 40} height={460} fill="#4A3A2E" />
      <GlobeStagePart x={960} y={430} s={0.62} f={f}>
        <Yakusha x={-80} y={0} s={0.8} f={f} phase={1} cloth={KRP.red} clothDark="#A03226">
          <Person x={0} y={0} cloth={KRP.red} clothDark="#A03226"
            pose="banzai" face="surprised" f={f} phase={1} still />
        </Yakusha>
        <Yakusha x={140} y={0} s={0.76} f={f} phase={4} cloth={KRP.blueDeep} clothDark="#2F5590"
          feather={KRP.yellow}>
          <Person x={0} y={0} cloth={KRP.blueDeep} clothDark="#2F5590"
            pose="raise" face="normal" f={f} phase={4} still />
        </Yakusha>
      </GlobeStagePart>
      <polygon points="700,180 1220,180 1420,430 500,430"
        fill={SGP.lampGold} opacity={0.1 + Math.sin(f / 9) * 0.03} />
      {/* 土間 */}
      <rect x={-20} y={560} width={W + 40} height={540} fill={C.dirt} />
      <line x1={-20} y1={560} x2={W + 20} y2={560} stroke={KRP.ink} strokeWidth={6} />
      <g stroke="#A8863E" strokeWidth={4} strokeLinecap="round" opacity={0.5}>
        {Array.from({ length: 10 }, (_, i) => {
          const sx = 120 + rnd(1048, i) * 1680;
          const sy = 620 + rnd(1048, i + 20) * 420;
          return <line key={i} x1={sx} y1={sy} x2={sx + 24 - rnd(1048, i + 40) * 48} y2={sy + 8} />;
        })}
      </g>
      {/* 奥の列 (舞台を見る背中) */}
      {Array.from({ length: 12 }, (_, i) => {
        const mx = 60 + i * 162 + rnd(1048, i) * 36;
        const cc = [KRP.blueDeep, KRP.bronze, KRP.green, KRP.grayDark, C.plum][Math.floor(rnd(1048, i + 10) * 5)];
        return <PersonMini key={i} x={mx} y={636 + rnd(1048, i + 50) * 24} s={0.5}
          color={cc} f={f} phase={i} face="none" />;
      })}
      {/* 中の列: 通り道 (x 760〜1180) を空けた人垣。売り子へ腕が伸びる */}
      {Array.from({ length: 10 }, (_, i) => {
        const mx = 40 + i * 206 + rnd(1048, i + 60) * 40;
        if (mx > 700 && mx < 1200) return null;
        const near = mx > 540 && mx < 1380;
        const cc = [KRP.bronze, KRP.green, KRP.grayDark, C.plum, KRP.orange][Math.floor(rnd(1048, i + 70) * 5)];
        return <PersonMini key={i} x={mx} y={810 + rnd(1048, i + 80) * 36} s={0.72}
          color={cc} f={f} phase={i + 3} face={near ? "smile" : "dot"} arms={near ? "up" : "down"} />;
      })}
      {/* 手前の列: 大きな背中で奥行きを作る (通り道は空ける) */}
      {Array.from({ length: 6 }, (_, i) => {
        const mx = -40 + i * 390 + rnd(1048, i + 90) * 60;
        if (mx > 660 && mx < 1240) return null;
        const cc = [KRP.blueDeep, KRP.grayDark, KRP.bronze, C.plum][Math.floor(rnd(1048, i + 95) * 4)];
        return <PersonMini key={i} x={mx} y={1052 + rnd(1048, i + 97) * 30} s={1.05}
          color={cc} f={f} phase={i + 7} face="none" />;
      })}
      {/* 売り子 (籠を抱えて歩く) */}
      <ellipse cx={vx} cy={vy + 108} rx={90} ry={18} fill={KRP.ink} opacity={0.16} />
      <Person x={vx} y={vy + 100} s={1.22} cloth={KRP.orange} clothDark="#C47428"
        face="joy" pose="hold" f={f} tasuki="売り子" />
      <g transform={`translate(${vx} ${vy - 46}) rotate(${Math.sin(f / 6) * 3})`}>
        <path d="M -78 0 Q 0 64 78 0 L 64 -10 Q 0 42 -64 -10 Z"
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={5.5} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.5}>
          <path d="M -60 4 Q 0 50 60 4" fill="none" />
          <path d="M -40 -4 L -28 26 M -10 -2 L -4 34 M 24 0 L 16 30 M 48 -4 L 36 22" />
        </g>
        {/* 籠の中身: ナッツとリンゴ */}
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={-50 + i * 20} cy={-10 - (i % 2) * 6} rx={8} ry={10}
            fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <circle cx={-62} cy={-16} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={64} cy={-14} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 呼び声の吹き出し */}
      <Bubble x={1450} y={400} w={400} h={170} t={seg(f, 10, 20)} tx={-150} ty={70}>
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={52} fill={KRP.ink}>ナッツいかが</text>
      </Bubble>
      {/* 売り子へ伸びる手前の腕 (呼ぶ客) */}
      <PersonMini x={620} y={1010} s={0.9} color={KRP.green} f={f} phase={11} face="smile" arms="up" />
      <PersonMini x={1310} y={1040} s={0.95} color={KRP.blueDeep} f={f} phase={13} face="smile" arms="up" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #50 気に入らない役者には、容赦なく野次が飛びました。
// 格: 並 / seed 1049
// 絵: 野次の吹き出しが舞台へ飛ぶ。役者がむっと睨み返す
// どこ: 同じ劇場。右に舞台を大きく、左下に立ち見の背中の群れ
// 演出: トゲトゲの野次吹き出しが客席から舞台へ飛ぶ。リンゴの芯まで飛ぶ。役者はむっと睨み返す
// 動き: 野次が弧を描いて次々飛ぶ・リンゴの芯がくるくる回る・役者の怒りマークがポン・マントが揺れる
const Sg050: React.FC<{ f: number }> = ({ f }) => {
  return (
    <Frame f={f} seed={1049}>
      {/* 奥の壁と桟敷のすそ (暗め) */}
      <rect x={-20} y={-20} width={W + 40} height={700} fill="#4A3A2E" />
      <GalleryBand f={f} x0={-20} x1={1060} y={40} seed={1049} />
      {/* 右: 舞台 (大きく) */}
      <GlobeStagePart x={1500} y={760} s={1.05} f={f}>
        {/* 役者のマント (ひるがえる) */}
        <path d={`M -80 -340 Q ${-170 + Math.sin(f / 8) * 18} -240 ${-140 + Math.sin(f / 6) * 24} -60
                 L -60 -40 Q -90 -180 -46 -320 Z`}
          fill={C.plum} stroke={KRP.ink} strokeWidth={5.5} />
      </GlobeStagePart>
      {/* 役者 (むっと睨み返す) */}
      <ellipse cx={1440} cy={766} rx={92} ry={18} fill={KRP.ink} opacity={0.18} />
      <Yakusha x={1440} y={758} s={1.3} f={f} lean={-3} cloth={KRP.red} clothDark="#A03226" buttons={false}>
        <Person x={0} y={0} cloth={KRP.red} clothDark="#A03226"
          face="angry" pose="armsFolded" f={f} gaze={[-5, 2]} still />
      </Yakusha>
      {/* 怒りマーク */}
      <g transform={`translate(1580 400) scale(${pop(seg(f, 12, 20))})`}
        stroke={KRP.red} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d="M -20 -20 Q -8 -14 -4 -4 M 20 -20 Q 8 -14 4 -4 M -20 20 Q -8 14 -4 4 M 20 20 Q 8 14 4 4" />
      </g>
      {/* 土間 */}
      <rect x={-20} y={820} width={W + 40} height={280} fill={C.dirt} />
      <line x1={-20} y1={820} x2={1130} y2={820} stroke={KRP.ink} strokeWidth={6} />
      {/* 立ち見の背中の群れ (こぶしが上がる) */}
      {Array.from({ length: 8 }, (_, i) => {
        const mx = 30 + i * 140 + rnd(1049, i) * 36;
        const cc = [KRP.blueDeep, KRP.bronze, KRP.grayDark, KRP.green, C.plum][Math.floor(rnd(1049, i + 10) * 5)];
        return <PersonMini key={i} x={mx} y={936 + rnd(1049, i + 20) * 30} s={0.78}
          color={cc} f={f} phase={i} face="none" arms={i % 3 === 0 ? "up" : "down"} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const mx = -30 + i * 220 + rnd(1049, i + 30) * 50;
        const cc = [KRP.grayDark, KRP.bronze, KRP.blueDeep, KRP.orange][Math.floor(rnd(1049, i + 40) * 4)];
        return <PersonMini key={i} x={mx} y={1076 + rnd(1049, i + 50) * 24} s={1.05}
          color={cc} f={f} phase={i + 5} face="none" arms={i % 2 === 0 ? "up" : "down"} />;
      })}
      {/* 野次 (弧を描いて何度も飛ぶ) */}
      {Array.from({ length: 3 }, (_, i) => {
        const p = ((f * 2.2 + i * 42) % 126) / 126;
        const bx = lerp(420, 1230, p);
        const by = lerp(760, 520, p) - Math.sin(p * Math.PI) * 170;
        return <Yaji key={i} x={bx} y={by} s={lerp(0.68, 1.02, p) * (0.9 + i * 0.08)}
          op={p > 0.9 ? (1 - p) * 10 : 0.95} seed={1049 + i * 7} />;
      })}
      {/* リンゴの芯も飛ぶ */}
      {(() => {
        const p = ((f * 2.6) % 130) / 130;
        const ax = lerp(300, 1350, p);
        const ay = lerp(900, 640, p) - Math.sin(p * Math.PI) * 300;
        return (
          <g transform={`translate(${ax} ${ay}) rotate(${f * 14})`} opacity={p > 0.92 ? (1 - p) * 12 : 1}>
            <path d="M -14 -22 q 14 10 28 0 q -8 14 -6 44 q -8 10 -16 0 q 2 -30 -6 -44 Z"
              fill={C.sorbet} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-26} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={26} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        );
      })()}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #51 時代が下って、18世紀のイタリアの、オペラハウス。
// 格: 山 / seed 1050
// 絵: 馬蹄形客席の全景。巨大シャンデリア煌々、金の装飾、各ボックスにドラマ
// どこ: 18世紀のオペラハウスの中。舞台の上から馬蹄形の客席全体を見渡す
// 演出: 3層の桟敷が馬蹄に並び、金の装飾、中央に巨大シャンデリア。各ボックスで小さなドラマ
// 動き: シャンデリアの炎と光が揺れる・ボックスの客がゆれる・平土間を人が行き交う・ゆるズーム
const Sg051: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.05;
  const CY = 1530; // 馬蹄の中心 (画面の下の外)
  const tiers = [
    { Ry: 1210, n: 15 },
    { Ry: 1020, n: 13 },
    { Ry: 830, n: 11 },
  ];
  return (
    <Frame f={f} seed={1050} dark bg="#352636">
      <g transform={zoomAt(z, 960, 420)}>
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#4A2430" />
        {/* 天井の金の飾り */}
        <g opacity={0.5}>
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${260 + i * 290} -10 q 60 70 0 130 q -60 -60 0 -130`}
              fill="none" stroke={KRP.gold} strokeWidth={5} />
          ))}
        </g>
        {/* 平土間の床 (奥) */}
        <rect x={-20} y={700} width={W + 40} height={400} fill="#8A5A3E" />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.3}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={-20} y1={740 + i * 52} x2={W + 20} y2={736 + i * 52} />
          ))}
        </g>
        <ellipse cx={960} cy={840} rx={720} ry={240} fill={SGP.lampGold} opacity={0.1 + Math.sin(f / 9) * 0.03} />
        {/* 馬蹄形の3層: 帯 → ボックス */}
        {tiers.map((tr, k) => {
          const Rx = tr.Ry * 1.14;
          return (
            <g key={k}>
              <ellipse cx={960} cy={CY} rx={Rx} ry={tr.Ry} fill="none"
                stroke="#6E3340" strokeWidth={150} />
              <ellipse cx={960} cy={CY} rx={Rx} ry={tr.Ry + 78} fill="none"
                stroke={KRP.gold} strokeWidth={7} opacity={0.85} />
              <ellipse cx={960} cy={CY} rx={Rx} ry={tr.Ry - 74} fill="none"
                stroke={KRP.gold} strokeWidth={5} opacity={0.7} />
              {Array.from({ length: tr.n }, (_, i) => {
                const a = lerp(-1.22, 1.22, i / (tr.n - 1));
                const bx = 960 + Rx * Math.sin(a);
                const by = CY - tr.Ry * Math.cos(a);
                if (bx < -150 || bx > W + 150 || by > 900) return null;
                const sc = (0.62 + k * 0.17) * (0.82 + Math.abs(a) * 0.3);
                const act = Math.floor(rnd(1050, i + k * 31) * 4);
                return (
                  <g key={i} transform={`translate(${bx} ${by}) rotate(${a * 14}) scale(${sc})`}>
                    <rect x={-82} y={-66} width={164} height={132} rx={10}
                      fill="#52222E" stroke={KRP.gold} strokeWidth={6} />
                    {/* 客 (2人) */}
                    {[-32, 30].map((hx, j) => (
                      <g key={j} transform={`translate(${hx} ${26 + Math.sin(f / 11 + i * 2 + j * 3 + k) * 3})`}>
                        <rect x={-20} y={-14} width={40} height={42} rx={10}
                          fill={[KRP.blueDeep, C.plum, KRP.green, KRP.bronze][Math.floor(rnd(1050, i * 7 + j + k) * 4)]}
                          stroke={KRP.ink} strokeWidth={3.5} />
                        <circle cx={0} cy={-26} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                        <circle cx={-4} cy={-28} r={2.2} fill={KRP.ink} />
                        <circle cx={4} cy={-28} r={2.2} fill={KRP.ink} />
                      </g>
                    ))}
                    {/* ボックスごとの小さなドラマ */}
                    {act === 0 && ( // カード
                      <g>
                        {Array.from({ length: 3 }, (_, c) => (
                          <rect key={c} x={-14 + c * 10} y={-4} width={14} height={20} rx={2}
                            fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5}
                            transform={`rotate(${-16 + c * 16} 0 16)`} />
                        ))}
                      </g>
                    )}
                    {act === 1 && ( // 杯を上げる
                      <path d="M -4 -10 q 10 -2 10 8 l -2 10 l -8 0 Z" fill={KRP.gold} stroke={KRP.ink} strokeWidth={2.5} />
                    )}
                    {act === 2 && ( // おしゃべりの音符
                      <Note x={0} y={-48 - Math.sin(f / 8 + i) * 4} s={0.42} color={KRP.white} op={0.85} />
                    )}
                    {act === 3 && ( // 扇
                      <path d={`M 0 4 l -16 -22 q 16 ${-8 + Math.sin(f / 7 + i) * 3} 32 0 Z`}
                        fill="#E8C9D8" stroke={KRP.ink} strokeWidth={2.5} />
                    )}
                    {/* 手すり */}
                    <rect x={-82} y={48} width={164} height={18} rx={8}
                      fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
                  </g>
                );
              })}
              {/* 層のあいだの燭台の光 */}
              {Array.from({ length: 9 }, (_, i) => {
                const a = lerp(-1.1, 1.1, i / 8);
                const cx2 = 960 + (Rx + 40) * Math.sin(a);
                const cy2 = CY - (tr.Ry + 86) * Math.cos(a);
                if (cx2 < 0 || cx2 > W || cy2 > 860) return null;
                return <circle key={i} cx={cx2} cy={cy2} r={7}
                  fill={SGP.lampGold} opacity={0.5 + 0.4 * Math.sin(f / 6 + i * 2 + k)} />;
              })}
            </g>
          );
        })}
        {/* 平土間の客 (立ち話・行き交い) */}
        {Array.from({ length: 10 }, (_, i) => {
          const px = 180 + i * 172 + rnd(1050, i + 200) * 60;
          const py = 900 + rnd(1050, i + 210) * 140;
          const cc = [KRP.blueDeep, C.plum, KRP.green, KRP.bronze, KRP.grayDark][Math.floor(rnd(1050, i + 220) * 5)];
          const drift = Math.sin(f / 16 + i * 2.3) * (6 + rnd(1050, i + 230) * 8);
          return <PersonMini key={i} x={px + drift} y={py} s={0.4 + (py - 900) / 500}
            color={cc} f={f} phase={i} face={rnd(1050, i + 240) > 0.5 ? "smile" : "dot"}
            arms={rnd(1050, i + 250) > 0.82 ? "up" : "down"} />;
        })}
        {/* 巨大シャンデリア */}
        <line x1={960} y1={-20} x2={960} y2={110} stroke={KRP.brass} strokeWidth={10} />
        <Chandelier x={960} y={330} s={1.65} f={f} sway={1.2} />
        {/* 画面の両端: 舞台袖の柱 (ここから見ている) */}
        <rect x={-20} y={-20} width={90} height={1120} fill="#2A1A22" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1850} y={-20} width={90} height={1120} fill="#2A1A22" stroke={KRP.ink} strokeWidth={6} />
        <line x1={70} y1={-20} x2={70} y2={1100} stroke={KRP.gold} strokeWidth={5} opacity={0.6} />
        <line x1={1850} y1={-20} x2={1850} y2={1100} stroke={KRP.gold} strokeWidth={5} opacity={0.6} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #52 客席の明かりは、つけっぱなしでした。
// 格: 図 / seed 1051
// 絵: シャンデリアの寄り。スイッチが「ON」に紐で固定。「上演中も消しません」の札
// どこ: オペラハウスの壁ぎわ。ダマスク柄の壁にシャンデリアと真鍮のスイッチ盤
// 演出: レバーが紐でONに縛られている図解。下に「上演中も消しません」の木札。
//       左下には使われない火消し具にクモの巣 (消さない、の念押し)
// 動き: シャンデリアがゆっくり揺れて光が脈打つ・紐がたわむ・札がポン・クモの巣がかすかに揺れる
const Sg052: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 23) * 4;
  return (
    <Frame f={f} seed={1051} dark bg="#4A2A38">
      {/* 壁 (ダマスク柄) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#5A2E3C" />
      <g fill={KRP.gold} opacity={0.12}>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => {
            const dx = 140 + c * 240 + (r % 2) * 120;
            const dy = 160 + r * 220;
            return (
              <path key={`${r}-${c}`}
                d={`M ${dx} ${dy - 52} q 30 20 0 52 q 22 -6 26 24 q -26 10 -26 36 q 0 -26 -26 -36 q 4 -30 26 -24 q -30 -32 0 -52 Z`} />
            );
          }))}
      </g>
      {/* 天井の刳り形 */}
      <rect x={-20} y={-20} width={W + 40} height={110} fill="#6E3844" stroke={KRP.ink} strokeWidth={6} />
      <line x1={-20} y1={110} x2={W + 20} y2={110} stroke={KRP.gold} strokeWidth={7} opacity={0.8} />
      <line x1={-20} y1={132} x2={W + 20} y2={132} stroke={KRP.gold} strokeWidth={4} opacity={0.5} />
      {/* シャンデリア (寄り。大きく) */}
      <Chandelier x={620} y={400} s={1.9} f={f} sway={1.6} />
      {/* 紐: シャンデリアの鎖元 → 天井 → 壁のスイッチへ (たわむ) */}
      <path d={`M 620 120 Q 980 ${170 + sway} 1340 150 Q ${1380 + sway} 330 1352 470`}
        fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
      <path d={`M 620 120 Q 980 ${184 + sway} 1340 164`}
        fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.5} />
      {/* スイッチ盤 */}
      <g>
        <rect x={1210} y={420} width={300} height={330} rx={16}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1236} y={446} width={248} height={278} rx={10}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={1236 + (i % 2) * 248} cy={446 + Math.floor(i / 2) * 278} r={8}
            fill={KRP.gold} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* ON / OFF の刻印 */}
        <text x={1360} y={508} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={46} fill={KRP.ink}>ON</text>
        <text x={1360} y={712} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={40} fill={KRP.ink} opacity={0.45}>OFF</text>
        {/* レバー (上=ON に固定) */}
        <circle cx={1360} cy={600} r={34} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`rotate(${-34 + Math.sin(f / 19) * 2} 1360 600)`}>
          <rect x={1346} y={488} width={28} height={118} rx={12}
            fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1360} cy={492} r={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          {/* レバーに巻きつく紐 */}
          <g fill="none" stroke={KRP.red} strokeWidth={8} strokeLinecap="round">
            <path d="M 1340 528 q 20 12 40 0" />
            <path d="M 1340 548 q 20 12 40 0" />
            <path d="M 1342 566 q 18 10 36 0" />
          </g>
          {/* 結びのリボン */}
          <path d={`M 1378 560 q ${26 + Math.sin(f / 9) * 4} -12 30 10 q -22 10 -30 -10 Z`}
            fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 1378 560 q ${-4 + Math.sin(f / 11) * 3} 30 14 40`}
            fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* 光のまたたき (ON の証) */}
        <circle cx={1452} cy={478} r={10} fill={SGP.lampGold}
          opacity={0.5 + 0.5 * Math.sin(f / 5)} />
      </g>
      {/* 木札 (スイッチ盤から紐で吊る) */}
      <line x1={1300} y1={750} x2={1322} y2={760} stroke={KRP.ink} strokeWidth={4} />
      <line x1={1420} y1={750} x2={1398} y2={760} stroke={KRP.ink} strokeWidth={4} />
      <TagPlate x={1360} y={778} text="上演中も消しません" size={42} t={seg(f, 14, 26)} rot={-2}
        fill={SGP.paper} />
      {/* 左下: 使われない火消し具 (フックに掛かったまま、クモの巣) */}
      <g>
        <circle cx={170} cy={706} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 26) * 2} 170 706)`}>
          <line x1={170} y1={706} x2={170} y2={860} stroke={SGP.woodDark} strokeWidth={10} />
          <path d="M 142 860 L 198 860 L 170 920 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g stroke={KRP.white} strokeWidth={2.5} fill="none" opacity={0.5 + Math.sin(f / 21) * 0.08}>
          <path d="M 170 706 L 60 640 M 170 706 L 86 760 M 170 706 L 150 620" />
          <path d="M 104 666 Q 122 696 112 730 M 134 646 Q 148 672 142 702" />
        </g>
      </g>
      {/* シャンデリアの光のかけら */}
      {Array.from({ length: 3 }, (_, i) => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 8 + i * 2.2));
        const sx = [340, 880, 600][i]; const sy = [250, 300, 620][i];
        return (
          <g key={i} transform={`translate(${sx} ${sy}) scale(${tw})`} opacity={tw * 0.9}>
            <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={KRP.yellow} />
          </g>
        );
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #53 ボックス席では、カード遊びに、商談に、おしゃべり。
// 格: 並 / seed 1052
// 絵: ボックスの中: カードの手札、商談の握手、扇の内緒話。舞台は額縁の外
// どこ: ボックス席の中。左端の金の額縁の外がまぶしい舞台 (こちらは見ていない)
// 演出: 左からカード遊びの卓・商談のふたり・扇の内緒話。みんな舞台に背を向けている
// 動き: カードの手札がゆれる・商談の吹き出しに金貨がポン・内緒話の「…」が順に出る・燭台の炎
const Sg053: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.04;
  // カードの手札 (手元に扇形)
  const hand = (hx: number, hy: number, flip: 1 | -1, phase: number) => (
    <g transform={`translate(${hx} ${hy}) rotate(${Math.sin(f / 9 + phase) * 4})`}>
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i} transform={`rotate(${(-21 + i * 14) * flip} 0 36)`}>
          <rect x={-17} y={-30} width={34} height={52} rx={4}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          {i === 1 && <path d="M 0 -12 l 7 10 l -7 10 l -7 -10 Z" fill={KRP.red} />}
          {i === 2 && <circle cx={0} cy={-2} r={6} fill={KRP.ink} />}
        </g>
      ))}
    </g>
  );
  return (
    <Frame f={f} seed={1052} dark bg="#4A2430">
      <g transform={zoomAt(z, 1000, 560)}>
        {/* 部屋の壁 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.operaWall} />
        {/* 左端: 額縁の外 = 舞台のまぶしい光 */}
        <rect x={-20} y={-20} width={300} height={1120} fill={SGP.lampGold} opacity={0.85} />
        <rect x={-20} y={-20} width={300} height={1120} fill={KRP.yellow} opacity={0.25 + Math.sin(f / 10) * 0.06} />
        {/* 豆粒の歌い手の影が光の中に */}
        <g opacity={0.4}>
          <circle cx={130} cy={560} r={30} fill={C.operaDark} />
          <path d="M 100 700 Q 130 580 160 700 Z" fill={C.operaDark} />
          <Note x={190} y={430 - (f % 40) * 2} s={0.8} color={C.operaDark} op={0.8 - (f % 40) / 50} />
        </g>
        {/* 金の額縁柱 */}
        <rect x={280} y={-20} width={56} height={1120} fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} />
        <line x1={308} y1={-20} x2={308} y2={1100} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        {/* 舞台の光が床に差し込む */}
        <polygon points="336,1100 336,300 900,1100" fill={SGP.lampGold} opacity={0.12} />
        {/* 壁の燭台 */}
        {[760, 1560].map((sx, i) => (
          <g key={i}>
            <rect x={sx - 8} y={320} width={16} height={56} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <Flame x={sx} y={320} f={f} s={1.05} phase={i * 3 + 1} />
          </g>
        ))}
        {/* 背面の鏡 */}
        <ellipse cx={1180} cy={300} rx={140} ry={100} fill="#8FA8B8" stroke={KRP.gold} strokeWidth={10} />
        <path d="M 1100 250 Q 1160 220 1240 250" stroke={KRP.white} strokeWidth={7} fill="none" opacity={0.5} />
        {/* 絨毯 */}
        <rect x={336} y={880} width={1610} height={220} fill="#7A4A3A" />
        <line x1={336} y1={880} x2={1940} y2={880} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 400 960 q 240 -20 500 -8 q 300 14 980 -10" stroke={KRP.gold} strokeWidth={4}
          fill="none" opacity={0.35} />
        {/* --- 左: カード遊びの卓 --- */}
        <Person x={500} y={850} s={1.08} cloth={KRP.blueDeep} clothDark="#2F5590"
          face="smile" pose="hold" f={f} gaze={[4, 3]} />
        <Person x={830} y={856} s={1.08} cloth={KRP.green} clothDark="#5E8E5A"
          face="worried" pose="hold" f={f} phase={4} gaze={[-4, 3]} />
        {hand(500, 712, 1, 0)}
        {hand(830, 718, -1, 2)}
        {/* 卓 (人物の手前で脚を隠す) */}
        <g>
          <ellipse cx={665} cy={880} rx={170} ry={46} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={635} y={900} width={60} height={120} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={560} y={848} width={34} height={50} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
            transform="rotate(-12 577 873)" />
          <rect x={700} y={852} width={34} height={50} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
            transform="rotate(9 717 877)" />
          <circle cx={660} cy={866} r={13} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={688} cy={874} r={13} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* --- 中: 商談のふたり --- */}
        <Person x={1120} y={846} s={1.04} cloth={KRP.grayDark} clothDark="#5E666E"
          face="normal" pose="point" pointDir={1} f={f} phase={7} lean={5} gaze={[5, 2]} />
        <Person x={1330} y={850} s={1.04} cloth={KRP.bronze} clothDark="#96613A"
          face="smile" pose="hold" f={f} phase={9} lean={-5} gaze={[-5, 2]} />
        {/* 証文 (hold の手元に) */}
        <rect x={1296} y={692} width={70} height={52} rx={4} fill={SGP.paper} stroke={KRP.ink} strokeWidth={4}
          transform={`rotate(${-4 + Math.sin(f / 13) * 2} 1331 718)`} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.6}>
          <line x1={1308} y1={708} x2={1356} y2={706} />
          <line x1={1308} y1={720} x2={1356} y2={718} />
          <line x1={1308} y1={732} x2={1344} y2={730} />
        </g>
        {/* 商談の吹き出し (金貨) */}
        <Bubble x={1250} y={470} w={210} h={130} t={seg(f, 12, 22)} tx={-40} ty={56}>
          <circle cx={0} cy={0} r={34} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -18 -22 Q 0 -34 20 -24" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.7} />
          <circle cx={0} cy={0} r={22} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        </Bubble>
        {/* --- 右: 扇の内緒話 --- */}
        <Person x={1600} y={852} s={1.04} cloth={C.plum} clothDark="#6E3A5C"
          face="smile" pose="hold" f={f} phase={11} lean={4} gaze={[5, 0]} />
        <Person x={1790} y={856} s={1.04} cloth={KRP.red} clothDark="#A03226"
          face="joy" pose="stand" f={f} phase={13} lean={-4} />
        <FanPart x={1648} y={726} s={0.82} rot={-14} />
        {/* 内緒話の「…」(順に出る) */}
        <Bubble x={1680} y={480} w={190} h={110} t={seg(f, 18, 26)} tx={-30} ty={46}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-40 + i * 40} cy={2} r={11} fill={KRP.ink}
              opacity={seg(f, 24 + i * 5, 28 + i * 5)} />
          ))}
        </Bubble>
        {/* ドレスのすそ (立ち姿の2人ぶん) */}
        <path d="M 1510 1010 Q 1530 880 1572 850 L 1628 850 Q 1670 880 1690 1010 Z"
          fill={C.plum} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M 1706 1016 Q 1724 886 1762 856 L 1818 856 Q 1856 886 1874 1016 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #54 1765年にナポリを訪れたイギリス人は、あきれて書き残しています。
// 格: 並 / seed 1053
// 絵: 旅装の紳士が客席の隅で手帳にペンを走らせる。眉が八の字
// どこ: ナポリのオペラハウス客席の隅 (ボックス脇の暗がり)
// 演出: 左2/3はさっきの喧騒そのまま (笑う群衆・音符・野次)。右の暗い隅で紳士だけが黙々と手帳
// 動き: 群衆ゆれ・音符上昇・羽ペンが走る・手帳の線が増える・紳士の視線が客席へ
const Sg054: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.045;
  const pen = Math.sin(f / 4) * 7; // ペン先の走り
  return (
    <Frame f={f} seed={1053} dark bg="#3A2030">
      <g transform={zoomAt(z, 1250, 620)}>
        {/* 壁全面 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.operaWall} />
        {/* ===== 左: まぶしい客席の喧騒 ===== */}
        <rect x={-20} y={-20} width={1140} height={1120} fill="#7E3C4A" />
        <rect x={-20} y={-20} width={1140} height={520} fill={SGP.lampGold} opacity={0.22 + Math.sin(f / 11) * 0.05} />
        {/* シャンデリアの光のすそ (本体は画面外上) */}
        <polygon points="180,-20 940,-20 1080,560 40,560" fill={KRP.yellow} opacity={0.14} />
        <circle cx={560} cy={-40} r={200} fill={SGP.lampGold} opacity={0.4} />
        {/* 向こう側のボックス席 2段 */}
        {[0, 1].map((tier) =>
          [0, 1, 2].map((i) => {
            const bx = 70 + i * 330; const by = 120 + tier * 230;
            return (
              <g key={`${tier}-${i}`}>
                <rect x={bx} y={by} width={280} height={190} rx={10}
                  fill={C.operaDark} stroke={KRP.gold} strokeWidth={7} />
                <PersonMini x={bx + 90} y={by + 168} s={1.1} color={[KRP.blueDeep, C.plum, KRP.green][i]}
                  f={f} phase={tier * 3 + i} face="smile" arms={rnd(54, tier * 3 + i) > 0.5 ? "up" : "down"} />
                <PersonMini x={bx + 190} y={by + 172} s={1.05} color={[KRP.red, KRP.bronze, KRP.grayDark][i]}
                  f={f} phase={tier * 5 + i + 2} face="smile" arms={rnd(55, tier * 3 + i) > 0.5 ? "up" : "down"} />
                <rect x={bx - 6} y={by + 176} width={292} height={22} rx={8}
                  fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
              </g>
            );
          }))}
        {/* 平土間のにぎわい (頭の列) */}
        {Array.from({ length: 14 }, (_, i) => {
          const px = 30 + (i % 7) * 158 + rnd(56, i) * 40;
          const py = 700 + Math.floor(i / 7) * 150 + rnd(57, i) * 30;
          return (
            <PersonMini key={i} x={px} y={py} s={1.3 + Math.floor(i / 7) * 0.25}
              color={[KRP.green, KRP.blueDeep, KRP.red, C.plum, KRP.bronze, KRP.grayDark, KRP.orange][i % 7]}
              f={f} phase={i * 2} face={i % 3 ? "smile" : "dot"} arms={i % 4 === 1 ? "up" : "down"} />
          );
        })}
        {/* 喧騒: 音符と野次が立ちのぼる */}
        <Note x={300} y={620 - (f % 44) * 3} s={1.1} op={0.9 - (f % 44) / 48} rot={-10} />
        <Note x={700} y={660 - ((f + 20) % 44) * 3} s={0.95} color={C.plum} op={0.9 - ((f + 20) % 44) / 48} rot={12} />
        <Yaji x={520} y={520 - (f % 38) * 2} s={0.58} op={0.75 - (f % 38) / 52} seed={9} />
        <Yaji x={940} y={600 - ((f + 16) % 38) * 2} s={0.5} op={0.75 - ((f + 16) % 38) / 52} seed={13} />
        {/* ===== 境の金柱 ===== */}
        <rect x={1120} y={-20} width={60} height={1120} fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1150} y1={-20} x2={1150} y2={1100} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        {/* ===== 右: 暗い隅の紳士 ===== */}
        <rect x={1180} y={-20} width={780} height={1120} fill={C.operaDark} opacity={0.55} />
        {/* 壁の燭台 (紳士の手元だけ照らす) */}
        <rect x={1812} y={330} width={16} height={56} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <Flame x={1820} y={330} f={f} s={1.1} phase={5} />
        <circle cx={1600} cy={740} r={330} fill={SGP.lampGold} opacity={0.14 + Math.sin(f / 9) * 0.03} />
        {/* 床と隅の椅子 */}
        <rect x={1180} y={940} width={780} height={160} fill="#5C3030" />
        <line x1={1180} y1={940} x2={1960} y2={940} stroke={KRP.ink} strokeWidth={6} />
        {/* 旅の鞄と三角帽 (旅装のしるし) */}
        <g transform={`translate(1300 980) rotate(-4)`}>
          <rect x={-70} y={-62} width={140} height={86} rx={14} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-70} y={-62} width={140} height={30} rx={14} fill="#96613A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-12} y={-44} width={24} height={26} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform={`translate(1302 892) rotate(${-6 + Math.sin(f / 16) * 2})`}>
          <path d="M -74 10 Q 0 -52 74 10 Q 40 28 0 28 Q -40 28 -74 10 Z"
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -52 2 Q 0 -30 52 2" stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.5} />
        </g>
        {/* 紳士 (眉八の字・客席の方をちらり) */}
        <Person x={1600} y={912} s={1.34} cloth={KRP.grayDark} clothDark="#555C64"
          face="worried" pose="hold" glasses f={f} phase={6} lean={-3}
          gaze={[-6, 2]} />
        {/* 手帳 (hold の手元。線が1本ずつ増える) */}
        <g transform={`translate(1600 752) rotate(${-5 + Math.sin(f / 15) * 1.5})`}>
          <rect x={-86} y={-56} width={172} height={112} rx={8}
            fill={C.pageCream} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={0} y1={-56} x2={0} y2={56} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M -70 ${-34 + i * 22} q 14 -7 30 0 q 14 6 28 -2`}
              stroke={KRP.ink} strokeWidth={3.5} fill="none" strokeLinecap="round"
              opacity={0.75} strokeDasharray={1} strokeDashoffset={1 - seg(f, 4 + i * 9, 12 + i * 9)}
              pathLength={1} />
          ))}
        </g>
        {/* 羽ペン (右手の先で走る) */}
        <Quill x={1648 + pen} y={742 + Math.abs(pen) * 0.35} s={1.05} rot={34 + pen * 0.8} />
        {/* あきれの汗じるし */}
        <path d={`M 1700 ${560 + Math.sin(f / 7) * 4} q 16 -22 0 -38 q -16 16 0 38 Z`}
          fill={KRP.blueDeep} opacity={0.8} />
      </g>
      {/* 札 */}
      <TagPlate x={1430} y={190} size={48} text="ナポリ" t={seg(f, 8, 18)} rot={-2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #55 「群衆は何の遠慮もなく、上演のあいだずっと、笑い、しゃべっていた」。
// 格: 図 / seed 1054
// 絵: 手帳の見開きが画面いっぱい。引用文が羽ペンの筆跡で書かれていく (出典: シャープ1765の記録)
// どこ: #54の手帳をそのまま机上で見開きに (引用は字幕が出すので、紙の上は筆跡のうねりだけ)
// 演出: ロウソクの灯る机いっぱいの見開き。羽ペンが筆記体のうねりを1行ずつ書いていく
// 動き: 行が左から伸びる・羽ペンが行の先端を追う・炎ゆれ・インク壺きらり
const Sg055: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.04;
  // 行ごとの書き上がり (b は 42 以下)
  const lines: { y: number; d: string; a: number; b: number; page: 0 | 1 }[] = [
    { y: 300, d: "M 230 300 q 40 -26 86 -4 q 44 20 90 -8 q 42 -24 88 0 q 40 22 86 -4 q 38 -20 80 2", a: 2, b: 10, page: 0 },
    { y: 400, d: "M 230 400 q 44 -22 92 -2 q 44 18 92 -8 q 40 -22 86 0 q 42 20 88 -6 q 34 -16 72 2", a: 8, b: 16, page: 0 },
    { y: 500, d: "M 230 500 q 38 -24 84 -2 q 46 20 94 -6 q 40 -20 84 0 q 44 20 90 -4 q 30 -14 66 2", a: 14, b: 22, page: 0 },
    { y: 600, d: "M 230 600 q 42 -20 88 -2 q 44 18 90 -8 q 42 -20 88 2 q 38 18 78 -4", a: 20, b: 28, page: 0 },
    { y: 320, d: "M 1040 320 q 42 -26 90 -4 q 44 20 92 -8 q 40 -22 86 0 q 42 22 88 -4 q 36 -18 76 2", a: 24, b: 32, page: 1 },
    { y: 430, d: "M 1040 430 q 40 -22 88 -2 q 46 18 94 -8 q 40 -20 84 0 q 42 20 88 -6", a: 30, b: 38, page: 1 },
    { y: 540, d: "M 1040 540 q 44 -24 92 -2 q 42 18 88 -8 q 42 -20 86 2 q 36 16 74 -4", a: 35, b: 42, page: 1 },
  ];
  // 羽ペンの現在地 (いちばん進行中の行の先端を追いかける)
  const total = lines.length;
  const prog = lines.map((L) => seg(f, L.a, L.b));
  let cur = 0;
  for (let i = 0; i < total; i++) if (prog[i] > 0 && prog[i] < 1) cur = i;
  if (prog[total - 1] >= 1) cur = total - 1;
  const L = lines[cur];
  const x0 = L.page === 0 ? 230 : 1040;
  const penX = x0 + 620 * prog[cur];
  const penY = L.y + Math.sin(f / 3.5) * 5;
  return (
    <Frame f={f} seed={1054} bg="#4A3424">
      <g transform={zoomAt(z, 960, 480)}>
        {/* 机の天板 (板目) */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.deskWood} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -20 ${i * 190 + 40} q 480 ${18 - rnd(58, i) * 36} 980 0 q 480 ${14 - rnd(59, i) * 28} 980 0`}
            stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.18} />
        ))}
        <ellipse cx={420} cy={120} rx={46} ry={20} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.15} />
        {/* ロウソクの灯り (右上) */}
        <g transform="translate(1790 120)">
          <ellipse cx={0} cy={56} rx={60} ry={18} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-18} y={-44} width={36} height={96} rx={8} fill={C.pageCream} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -16 -20 q 12 16 4 44" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.35} />
        </g>
        <Flame x={1790} y={76} f={f} s={1.5} phase={2} />
        <circle cx={1500} cy={300} r={560} fill={SGP.lampGold} opacity={0.1 + Math.sin(f / 9) * 0.03} />
        {/* インク壺 (左上) */}
        <g transform="translate(130 150)">
          <path d="M -54 40 Q -60 -10 -30 -22 L 30 -22 Q 60 -10 54 40 Q 30 56 0 56 Q -30 56 -54 40 Z"
            fill="#3A4450" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-26} y={-44} width={52} height={24} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-14} rx={24} ry={8} fill={KRP.ink} />
          <path d="M -34 10 q 10 -14 26 -10" stroke={KRP.white} strokeWidth={4} fill="none"
            opacity={0.4 + Math.sin(f / 8) * 0.2} />
        </g>
        {/* ===== 手帳の見開き (画面いっぱい) ===== */}
        <g transform={`rotate(-1.2 960 500)`}>
          {/* 下の影 */}
          <rect x={176} y={220} width={1590} height={600} rx={14} fill={KRP.ink} opacity={0.22} />
          {/* 左右ページ */}
          <path d="M 160 200 Q 560 168 952 196 L 952 788 Q 560 760 160 792 Z"
            fill={C.pageCream} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 968 196 Q 1360 168 1760 200 L 1760 792 Q 1360 760 968 788 Z"
            fill={C.pageCream} stroke={KRP.ink} strokeWidth={7} />
          {/* 中央の綴じ */}
          <path d="M 952 196 Q 960 492 952 788" stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.6} />
          <path d="M 968 196 Q 960 492 968 788" stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.6} />
          {/* ページの淡い罫 */}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i} stroke={KRP.blueDeep} strokeWidth={2.5} opacity={0.14}>
              <line x1={210} y1={290 + i * 100} x2={930} y2={286 + i * 100} />
              <line x1={1010} y1={286 + i * 100} x2={1730} y2={290 + i * 100} />
            </g>
          ))}
          {/* ページ端のめくれ */}
          <path d="M 1760 200 q 26 300 0 592 l -20 -8 q 18 -288 0 -576 Z"
            fill="#E8DCBE" stroke={KRP.ink} strokeWidth={4} />
          {/* 筆記体のうねり (引用の「筆跡」。文字ではない) */}
          {lines.map((Ln, i) => (
            <path key={i} d={Ln.d} stroke="#26324C" strokeWidth={7.5} fill="none" strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog[i]} />
          ))}
          {/* インクの染み */}
          <circle cx={760} cy={648} r={9} fill="#2E3A54" opacity={0.35} />
          <circle cx={1180} cy={592} r={6} fill="#2E3A54" opacity={0.3 * seg(f, 32, 36)} />
          {/* 羽ペン (書いている行の先端) */}
          <Quill x={penX} y={penY} s={2.3} rot={30 + Math.sin(f / 4) * 5} />
        </g>
        {/* 虫めがね的きらり (ロウソクの光が紙に) */}
        <path d={`M 300 ${240 + Math.sin(f / 10) * 4} q 60 -16 130 -8`}
          stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.35} strokeLinecap="round" />
      </g>
      {/* 出典の札 (固定数字 1765 はここだけ) */}
      <TagPlate x={1430} y={766} size={44} text="シャープ 1765の記録" t={seg(f, 30, 40)} rot={2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #56 さて、ここで問題です。
// 格: 図 / seed 1055
// 絵: `QuizCard` Q2
// どこ: 芝居小屋の舞台の上 (クイズも「出し物」として幕の中でやる)
// 演出: 緞帳のスワッグ+板張り+脚光の舞台に、イーゼルの出題カードと Q バッジ
// 動き: Qがぽんと出る・？が2つゆれる・脚光ゆらぎ・スポットの中で紙吹雪がひらり
const Sg056: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(clamp01(f / 80)) * 0.04;
  return (
    <Frame f={f} seed={1055} dark bg="#2E2030">
      <g transform={zoomAt(z, 860, 500)}>
        {/* 奥の暗がり */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.operaDark} />
        {/* スポットライト */}
        <polygon points="700,-20 1060,-20 1520,1040 240,1040"
          fill={SGP.lampGold} opacity={0.16 + Math.sin(f / 10) * 0.04} />
        <ellipse cx={880} cy={960} rx={640} ry={90} fill={SGP.lampGold} opacity={0.18} />
        {/* 床 (板張り) */}
        <rect x={-20} y={760} width={W + 40} height={340} fill={SGP.stage} />
        <line x1={-20} y1={760} x2={1940} y2={760} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={i * 300 - 60 + (i % 2) * 70} y1={760} x2={i * 320 - 180} y2={1100}
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
        ))}
        <line x1={-20} y1={880} x2={1940} y2={874} stroke={KRP.ink} strokeWidth={3} opacity={0.25} />
        {/* 上手・下手の緞帳 (スワッグ) */}
        <path d="M -20 -20 L 420 -20 Q 300 240 360 620 Q 240 560 150 640 Q 220 300 90 -20 Z"
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 250 40 Q 290 300 300 540" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.4} />
        <path d="M 1940 -20 L 1500 -20 Q 1620 240 1560 620 Q 1680 560 1770 640 Q 1700 300 1830 -20 Z"
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1670 40 Q 1630 300 1620 540" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.4} />
        {/* 緞帳の上飾り */}
        <path d="M -20 -20 L 1940 -20 L 1940 90 Q 960 190 -20 90 Z"
          fill="#7E2730" stroke={KRP.ink} strokeWidth={7} />
        {[260, 640, 1020, 1400, 1780].map((tx, i) => (
          <circle key={i} cx={tx} cy={128 + Math.sin(tx) * 8} r={16} fill={KRP.gold}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 房かざり */}
        <g transform={`translate(360 620) rotate(${Math.sin(f / 12) * 5})`}>
          <path d="M 0 0 q 10 40 0 84 q -10 -44 0 -84 Z" fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
          <circle r={14} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform={`translate(1560 620) rotate(${Math.sin(f / 12 + 2) * 5})`}>
          <path d="M 0 0 q 10 40 0 84 q -10 -44 0 -84 Z" fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
          <circle r={14} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ===== イーゼルの出題カード ===== */}
        <g transform={`rotate(${Math.sin(f / 14) * 0.8} 860 620)`}>
          {/* イーゼルの脚 */}
          <g stroke={SGP.woodDark} strokeWidth={16} strokeLinecap="round">
            <line x1={620} y1={300} x2={520} y2={1000} />
            <line x1={1100} y1={300} x2={1200} y2={1000} />
            <line x1={860} y1={320} x2={860} y2={1010} />
          </g>
          <g stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5}>
            <line x1={620} y1={300} x2={520} y2={1000} />
            <line x1={1100} y1={300} x2={1200} y2={1000} />
          </g>
          <line x1={565} y1={700} x2={1155} y2={700} stroke={SGP.woodDark} strokeWidth={14} />
          {/* カード (クリーム地) */}
          <rect x={470} y={252} width={780} height={452} rx={16}
            fill={KRP.ink} opacity={0.25} transform="translate(12 14)" />
          <rect x={470} y={252} width={780} height={452} rx={16}
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={8} />
          <rect x={492} y={274} width={736} height={408} rx={10}
            fill="none" stroke={KRP.gold} strokeWidth={5} opacity={0.8} />
          {/* Q バッジ (共有の絵柄) */}
          <QuizQ f={f} x={672} y={478} s={1.12} t={seg(f, 4, 14)} />
          {/* 第2問の札 (カードの上) */}
          <TagPlate x={1020} y={430} size={52} text="第2問" t={seg(f, 10, 20)} rot={2} />
        </g>
        {/* ？マーク 2つ */}
        <QMark x={1340} y={260} s={1.15} f={f} t={seg(f, 18, 26)} />
        <QMark x={500} y={210} s={0.85} f={f + 9} t={seg(f, 22, 30)} color={KRP.orange} />
        {/* 脚光 (フットライト) */}
        {[300, 620, 940, 1260, 1580].map((lx, i) => (
          <g key={i}>
            <path d={`M ${lx - 46} 1050 Q ${lx} 980 ${lx + 46} 1050 Z`}
              fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={lx} cy={1010} r={26} fill={KRP.yellow}
              opacity={0.75 + Math.sin(f / 6 + i * 1.7) * 0.2} />
          </g>
        ))}
        {/* スポットの中を紙吹雪がひらり */}
        {[0, 1, 2].map((i) => {
          const fy = ((f * 3 + i * 130) % 420);
          return (
            <rect key={i} x={760 + i * 150 + Math.sin((f + i * 30) / 9) * 40} y={200 + fy}
              width={22} height={14} rx={3}
              fill={[KRP.red, KRP.gold, KRP.blueDeep][i]} opacity={0.8 - fy / 520}
              transform={`rotate(${f * 6 + i * 70} ${770 + i * 150} ${207 + fy})`} />
          );
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_045: (f) => <Sg045 f={f} />,
  sg_046: (f) => <Sg046 f={f} />,
  sg_047: (f) => <Sg047 f={f} />,
  sg_048: (f) => <Sg048 f={f} />,
  sg_049: (f) => <Sg049 f={f} />,
  sg_050: (f) => <Sg050 f={f} />,
  sg_051: (f) => <Sg051 f={f} />,
  sg_052: (f) => <Sg052 f={f} />,
  sg_053: (f) => <Sg053 f={f} />,
  sg_054: (f) => <Sg054 f={f} />,
  sg_055: (f) => <Sg055 f={f} />,
  sg_056: (f) => <Sg056 f={f} />,
};

export const S_B2_MOTIFS: string[] = [
  "sg_045", // #45
  "sg_046", // #46
  "sg_047", // #47
  "sg_048", // #48
  "sg_049", // #49
  "sg_050", // #50
  "sg_051", // #51
  "sg_052", // #52
  "sg_053", // #53
  "sg_054", // #54
  "sg_055", // #55
  "sg_056", // #56
];

export const saigoB2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
