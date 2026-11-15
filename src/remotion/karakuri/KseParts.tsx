// 「つながる世界史」からくり試作回: 枚をまたいで出る物の共用部品。
// - SP: 考証ずみの物の色 (2026-11-09 リサーチ台帳から。docs/kse-test-design.md に出典)
// - DokuHai: ペルシアの脚付き金属杯 (#7 と #13 で同じ杯が出る)
// - KseNotify: 記者の反応が通知カードで出る演出 (#8 #15 #18)。sekai回から演出の型だけ借用、画風はからくり
//
// ★ここに背景を置かない (制作ガイド §7 第3層)。共有してよいのは「何度も出る同じ物」だけ。
// ★絵師はこのファイルを編集しない。足りない部品は自分のファイルにローカルで書く。

import React from "react";
import { KRP, KARAKURI_FONT, clamp01, pop } from "./KarakuriScenes";

// ===== 考証ずみの色 (物の名前で引く) =====
export const SP = {
  // 1945 日本
  radioWood: "#8B5A2B", // 放送局型123号ラジオの木箱
  radioWoodDark: "#6B4320",
  radioCloth: "#D8C9A3", // スピーカー開口の布張り
  kokumin: "#7A6A3F", // 国民服の国防色 (戦闘帽も同色)
  monpe: "#2B3A67", // もんぺの絣の紺
  sloganPaper: "#F5F0E1", // 標語看板の白地
  sumi: "#1A1A1A", // 墨
  // イラン
  turban: "#1C1C1C", // 黒ターバン (サイイド=預言者の子孫の印。白にしない)
  aba: "#4A3B2A", // アバ (外套) の濃茶
  iranGreen: "#239F40", // 現行国旗の緑 (ライオンと太陽の旧王政旗は描かない)
  iranRed: "#DA0000", // 現行国旗の赤
  tulip: "#C0392B", // 赤いチューリップ = 殉教の象徴
  mourning: "#15161A", // 喪の黒 (旗・チャードル)
  // 毒杯
  brass: "#B08D44", // 真鍮 (サーサーン朝銀杯の系譜の脚付きゴブレット)
  brassDark: "#8A6C32",
  poison: "#3E5C3A", // 杯の中の暗い液
  // 忠臣蔵
  kusari: "#6E7B8B", // 鎖帷子の鈍色
  lantern: "#F4A83D", // 提灯の灯
  night: "#2A3140", // 夜の紺
  nightDeep: "#1C2230",
} as const;

// ===== 毒杯 (#7 と #13 で同じ杯。別の見た目で描き直さない) =====
// x,y = 脚の接地中央。高さ ≈ 300*s。チューリップ形の碗 + 彫金の帯 + 短い脚。
export const DokuHai: React.FC<{
  x: number; y: number; s?: number; t?: number; f?: number; poison?: boolean;
}> = ({ x, y, s = 1, t = 1, f = 0, poison = true }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const shimmer = Math.sin(f / 17) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      {/* 脚 (低く広がる) */}
      <ellipse cx={0} cy={-8} rx={92} ry={18} fill={SP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -34 -14 L -20 -96 L 20 -96 L 34 -14 Z" fill={SP.brass} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-96} rx={26} ry={9} fill={SP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 碗 (チューリップ形: すぼまってから開く) */}
      <path
        d="M -88 -258 C -88 -196 -62 -150 -40 -128 C -22 -112 22 -112 40 -128 C 62 -150 88 -196 88 -258
           L 74 -258 C 74 -204 52 -160 32 -140 C 18 -128 -18 -128 -32 -140 C -52 -160 -74 -204 -74 -258 Z"
        fill={SP.brass} stroke={KRP.ink} strokeWidth={5} fillRule="evenodd"
      />
      <path d="M -74 -258 C -74 -204 -52 -160 -32 -140 C -18 -128 18 -128 32 -140 C 52 -160 74 -204 74 -258 Z"
        fill={SP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 口縁と中の液 */}
      <ellipse cx={0} cy={-258} rx={81} ry={20} fill={SP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      {poison && <ellipse cx={0} cy={-258} rx={64} ry={13} fill={SP.poison} stroke={KRP.ink} strokeWidth={3.5} />}
      {/* 彫金の帯 (唐草を点線の渦で) */}
      <path d="M -62 -196 Q -40 -186 -20 -196 Q 0 -206 20 -196 Q 40 -186 62 -196"
        fill="none" stroke={SP.brassDark} strokeWidth={6} strokeLinecap="round" />
      <circle cx={-44} cy={-192} r={5} fill={SP.brassDark} />
      <circle cx={44} cy={-192} r={5} fill={SP.brassDark} />
      {/* つや */}
      <path d={`M ${-52 + shimmer} -244 Q ${-58 + shimmer} -200 -40 -162`} fill="none"
        stroke="#E8DCB0" strokeWidth={9} strokeLinecap="round" opacity={0.75} />
    </g>
  );
};

// ===== 記者の反応の通知カード (#8 #15 #18) =====
// sekai回の「反応は通知形式で出る」演出の型だけ借用。アイコンは角丸の四角 (丸だと顎と毛先が切れる)。
// 記者 = 20代後半・切りっぱなしボブ・ジャケット。大きい丸目 (作者の好み。勝手に変えない)。
// 反応の文はこのカードの中に全文出す (クイズ・結論カードと同じカード扱い)。
export const KseNotify: React.FC<{
  f: number; t?: number; text: string; y?: number; w?: number;
}> = ({ f, t = 1, text, y = 330, w = 1240 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const slide = (1 - pop(tt)) * -60;
  const bob = Math.sin(f / 23) * 3;
  const blink = f % 103 < 5 && f > 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 960 - w / 2,
        top: y + slide + bob,
        width: w,
        opacity: Math.min(tt * 1.6, 1),
        background: KRP.white,
        border: `5px solid ${KRP.ink}`,
        borderRadius: 26,
        boxShadow: "0 14px 0 rgba(59,51,44,0.18)",
        padding: "22px 34px 24px 24px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: KARAKURI_FONT,
      }}
    >
      {/* 角丸四角のアイコン (記者証の証明写真風) */}
      <svg width={108} height={108} style={{ flex: "0 0 auto" }}>
        <rect x={4} y={4} width={100} height={100} rx={20} fill="#C9DCEC" stroke={KRP.ink} strokeWidth={5} />
        <g>
          {/* ジャケットの肩 */}
          <path d="M 14 104 Q 18 76 38 70 L 70 70 Q 90 76 94 104 Z" fill="#5A6B86" stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 44 70 L 54 86 L 64 70" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 顔 */}
          <circle cx={54} cy={46} r={27} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {/* 切りっぱなしボブ (毛流れの細線は描かない) */}
          <path d="M 27 46 Q 24 14 54 14 Q 84 14 81 46 L 81 58 L 73 56 L 73 34 Q 64 26 54 26 Q 44 26 35 34 L 35 56 L 27 58 Z"
            fill="#4A4038" stroke={KRP.ink} strokeWidth={4.5} />
          {/* 大きい丸目 */}
          {blink ? (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
              <line x1={41} y1={48} x2={51} y2={48} />
              <line x1={59} y1={48} x2={69} y2={48} />
            </g>
          ) : (
            <g>
              <ellipse cx={46} cy={48} rx={5.5} ry={7} fill={KRP.ink} />
              <ellipse cx={64} cy={48} rx={5.5} ry={7} fill={KRP.ink} />
            </g>
          )}
          <path d="M 50 60 Q 54 63 58 60" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: KRP.grayDark }}>記者</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: KRP.gray }}>いま</span>
        </div>
        <div style={{ fontSize: 46, fontWeight: 900, color: KRP.ink, lineHeight: 1.35 }}>{text}</div>
      </div>
    </div>
  );
};
