// 自販機2000年史のテイスト確認用プレビュー。
// J2_PREVIEW_MOTIFS を 1シーン=150フレーム (5秒) ずつ順番に表示する。
// 静止画: npx remotion still J2Preview out.png --frame=(シーン番号×150+オフセット)

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { J2AllSceneView, J2_ALL_MOTIFS } from "./Jihanki2000Index";

export const J2_FRAMES_PER_SCENE = 150;
export const J2_PREVIEW_TOTAL_FRAMES = J2_ALL_MOTIFS.length * J2_FRAMES_PER_SCENE;

export const Jihanki2000Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(Math.floor(frame / J2_FRAMES_PER_SCENE), J2_ALL_MOTIFS.length - 1);
  const f = frame - idx * J2_FRAMES_PER_SCENE;
  const motif = J2_ALL_MOTIFS[idx];
  return (
    <AbsoluteFill>
      <J2AllSceneView motif={motif} f={f} />
      {/* 左下にモチーフ名 (確認用) */}
      <div style={{
        position: "absolute", left: 24, bottom: 20, fontFamily: "monospace",
        fontSize: 26, color: "#fff", background: "rgba(0,0,0,0.55)",
        padding: "4px 12px", borderRadius: 8,
      }}>
        #{idx + 1} {motif}
      </div>
    </AbsoluteFill>
  );
};
