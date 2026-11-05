// 「エレベーターの歴史」の回: 全ブロック共通の部品。
// ここにある物は必ずここから import して使う (同じ物を別の見た目で描き直さない。絵のブレ防止)。
// - EBadge: 画面隅のバッジ (全シーンに置く)
// - ChapterDoor: 章の題字ブロック (旅とお土産回と同じ流儀)
// - ShaftDiagram 用の寸法は作らない (憲法第13条: キットの先行量産はしない)。
//   昇降路断面は伏線再登場物なので、最初に描いたブロック (ElevB4) から他ブロックが import する。

import React from "react";
import { KRP, KARAKURI_FONT, Badge, clamp01 } from "./KarakuriScenes";

export const W = 1920;
export const H = 1080;
export const FONT = KARAKURI_FONT;
export const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// 画面隅のバッジ (旅とお土産回の TBadge と同じ位置づけ)
export const EBadge: React.FC = () => <Badge text="エレベーターの歴史" />;

// 章の題字ブロック (TabiShared の ChapterDoor と同じ流儀)。
// num=0 なら「第N章」行を出さない (序章・結章むけ)。
export const ChapterDoor: React.FC<{
  num: number; title: string; t?: number; left?: number; top?: number; width?: number;
}> = ({ num, title, t = 1, left = 1060, top = 620, width = 800 }) => {
  const tt = clamp01(t);
  return (
    <div style={{
      position: "absolute", left, top, width, opacity: tt,
      transform: `translateY(${(1 - tt) * 30}px)`, fontFamily: KARAKURI_FONT,
    }}>
      {num > 0 && (
        <div style={{ fontSize: 40, fontWeight: 800, color: KRP.grayDark, marginBottom: 6 }}>第{num}章</div>
      )}
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
