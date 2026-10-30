// 「私は何者?」4000年史の回: 全章ブロック共通の部品。
// ここにある物は必ずここから import して使う (同じ物を別の見た目で描き直さない。絵のブレ防止)。
// - RouteMap: 乗り換え路線図 (神様駅→体駅→数字駅→自分駅)。リキャップ5箇所で count を変えて使う
// - ShindanSho: 診断書の紙 (導入と第12章の種明かしで同じ紙が出る)
// - UranaiMachine: からくり占い機「ウラナイ屋1号」(WatashiCharacters.tsx から再輸出)
// - PUR: 紫の怪しい照明の色

import React from "react";
import { KRP, KARAKURI_FONT, Badge, seg, pop, easeOut, clamp01 } from "./KarakuriScenes";

export { UranaiMachine } from "./WatashiCharacters";

export const W = 1920;
export const H = 1080;
export const FONT = KARAKURI_FONT;
export const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// 画面隅のバッジ (自販機回の J2Badge と同じ位置づけ。全シーンに置く)
export const WBadge: React.FC = () => <Badge text="「私は何者?」の4000年史" />;

// 章扉の題字ブロック (12章すべてこの型。自販機回の章扉と同じ流儀)。
// テーマ絵は章ごとに自由に描いてよいが、題字は必ずこの部品を使う (4人で作ってもブレないように)。
export const ChapterTitle: React.FC<{
  num: number; title: string; t?: number; left?: number; top?: number; width?: number;
}> = ({ num, title, t = 1, left = 1060, top = 620, width = 800 }) => {
  const tt = clamp01(t);
  return (
    <div style={{
      position: "absolute", left, top, width, opacity: tt,
      transform: `translateY(${(1 - tt) * 30}px)`, fontFamily: KARAKURI_FONT,
    }}>
      <div style={{ fontSize: 40, fontWeight: 800, color: KRP.grayDark, marginBottom: 6 }}>第{num}章</div>
      <div style={{
        fontSize: 52, fontWeight: 900, color: KRP.ink, lineHeight: 1.3,
        borderBottom: `6px solid ${KRP.ink}`, borderRadius: 8,
        background: "rgba(253,251,247,0.82)", padding: "4px 10px 10px",
      }}>
        {title}
      </div>
    </div>
  );
};

// 紫の怪しい照明 (導入の診断・第12章の種明かし用)
export const PUR = {
  deep: "#4E4374", // 幕の影
  mid: "#6B5B8E", // 幕
  glow: "#B9A8E0", // 紫のあかり
};

// ===================================================================
// 乗り換え路線図: 「私は何者?」を誰に聞いてきたか (神様→体→数字→自分)
// count = 見えている駅の数 (1〜4)。新しい駅がぽんと現れ、線路が伸び、
// 小さな電車が前の駅からすべってくる。
// 使う場所 (構成案どおり): 第2章末 count=1 / 第3章末 count=2 / 第6章 count=3 /
// 第8章 count=4 / 結び count=4 (全回収)
// ===================================================================
const STATIONS = [
  { name: "神様", icon: "god" },
  { name: "体", icon: "body" },
  { name: "数字", icon: "number" },
  { name: "自分", icon: "self" },
] as const;

const StationIcon: React.FC<{ kind: string }> = ({ kind }) => {
  if (kind === "god") {
    // 後光つきの光 (特定の宗教の絵にしない)
    return (
      <g>
        <circle cx={0} cy={0} r={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <line key={i} x1={Math.cos(a) * 28} y1={Math.sin(a) * 28}
              x2={Math.cos(a) * 40} y2={Math.sin(a) * 40}
              stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          );
        })}
      </g>
    );
  }
  if (kind === "body") {
    // 頭と肩のシルエット
    return (
      <g>
        <circle cx={0} cy={-14} r={16} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -26 24 Q -24 2 0 2 Q 24 2 26 24 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    );
  }
  if (kind === "number") {
    // 数字の札
    return (
      <g>
        {/* 札の幅は文字 (123) がはみ出さない大きさにする。
            太字3桁 = だいたい fontSize*1.8 の幅になるので、左右に余白を見て 84 にしてある */}
        <rect x={-42} y={-24} width={84} height={48} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <text x={0} y={10} textAnchor="middle" fontFamily={KARAKURI_FONT} fontWeight={900}
          fontSize={28} fill={KRP.blueDeep}>123</text>
      </g>
    );
  }
  // self: 手鏡
  return (
    <g>
      <circle cx={0} cy={-6} r={20} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -8 -14 Q 2 -20 10 -10" fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />
      <rect x={-4} y={14} width={8} height={18} rx={4} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

export const RouteMap: React.FC<{
  x: number; y: number; s?: number; f?: number;
  count: number; // 見えている駅の数 (1〜4)
  ride?: boolean; // 電車が前の駅から新しい駅へすべる演出 (省略時true)
}> = ({ x, y, s = 1, f = 0, count, ride = true }) => {
  const n = Math.max(1, Math.min(4, Math.round(count)));
  const sx = (i: number) => -540 + i * 360; // 駅のx座標 (4駅で中央揃え)
  const grow = easeOut(seg(f, 0, 28)); // いちばん新しい線路が伸びる
  const popT = pop(seg(f, 14, 38)); // いちばん新しい駅がぽん
  const slide = ride ? easeOut(seg(f, 34, 80)) : 1; // 電車がすべる
  const trainX = n === 1 ? sx(0) : sx(n - 2) + (sx(n - 1) - sx(n - 2)) * slide;
  const trainBob = Math.sin(f / 6) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 線路 (確定区間) */}
      {n >= 2 && (
        <g>
          <line x1={sx(0)} y1={0} x2={sx(n - 2)} y2={0} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
          <line x1={sx(0)} y1={0} x2={sx(n - 2)} y2={0} stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" />
          {/* 新しく伸びる区間 */}
          <line x1={sx(n - 2)} y1={0} x2={sx(n - 2) + (sx(n - 1) - sx(n - 2)) * grow} y2={0}
            stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
          <line x1={sx(n - 2)} y1={0} x2={sx(n - 2) + (sx(n - 1) - sx(n - 2)) * grow} y2={0}
            stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" />
        </g>
      )}
      {/* 駅 */}
      {STATIONS.slice(0, n).map((st, i) => {
        const isNew = i === n - 1 && n >= 1;
        const sc = isNew ? popT : 1;
        if (sc <= 0) return null;
        return (
          <g key={st.name} transform={`translate(${sx(i)} 0) scale(${sc})`}>
            {/* アイコン (駅の上) */}
            <g transform="translate(0 -122)"><StationIcon kind={st.icon} /></g>
            {/* 駅マーク (二重丸) */}
            <circle cx={0} cy={0} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={0} cy={0} r={15} fill={i === n - 1 ? KRP.orange : KRP.white}
              stroke={KRP.ink} strokeWidth={4.5} />
            {/* 駅名 (駅の下) */}
            <g transform="translate(0 78)">
              <rect x={-st.name.length * 24 - 18} y={-30} width={st.name.length * 48 + 36} height={60}
                rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <text x={0} y={15} textAnchor="middle" fontFamily={KARAKURI_FONT} fontWeight={900}
                fontSize={42} fill={KRP.ink}>{st.name}</text>
            </g>
          </g>
        );
      })}
      {/* 小さな電車 (いちばん新しい駅へ向かう) */}
      <g transform={`translate(${trainX} ${-46 + trainBob})`}>
        <rect x={-62} y={-34} width={124} height={54} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-46} y={-24} width={34} height={26} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <rect x={12} y={-24} width={34} height={26} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-34} cy={24} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={34} cy={24} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// ===================================================================
// 診断書の紙: 導入でウラナイ屋1号が吐き出し、第12章で「全員同じ」とわかる紙。
// lines = 書いてある行 (横線で表現)。stamp = 「診断」ハンコの有無。
// ===================================================================
export const ShindanSho: React.FC<{
  x: number; y: number; s?: number; rot?: number; t?: number; // t=出現 0〜1
}> = ({ x, y, s = 1, rot = 0, t = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (0.8 + 0.2 * pop(tt))})`} opacity={clamp01(tt * 2)}>
      <rect x={-130} y={-170} width={260} height={340} rx={10}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <text x={0} y={-118} textAnchor="middle" fontFamily={KARAKURI_FONT} fontWeight={900}
        fontSize={44} fill={KRP.red}>診断書</text>
      <line x1={-86} y1={-98} x2={86} y2={-98} stroke={KRP.red} strokeWidth={3.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={-92} y1={-56 + i * 40} x2={i === 4 ? 20 : 92} y2={-56 + i * 40}
          stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      ))}
      {/* 水晶玉の印 */}
      <circle cx={72} cy={118} r={30} fill="none" stroke={KRP.red} strokeWidth={3.5} opacity={0.9} />
      <circle cx={72} cy={118} r={13} fill="none" stroke={KRP.red} strokeWidth={3} opacity={0.9} />
    </g>
  );
};
