// AI生成画像のシーン。ゆっくり寄るケンバーンズ効果で静止画でも動きを出す。
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { PALETTE } from "../../style";
import { FONT } from "../Video";
import type { Scene } from "../../types";

export const ImageScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 300], [1, 1.06], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.background }}>
      <AbsoluteFill style={{ opacity }}>
        <Img
          src={staticFile(scene.image!)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>
      {scene.emphasis && (
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 72,
            backgroundColor: PALETTE.accent,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontSize: 46,
            fontWeight: 800,
            padding: "14px 36px",
            borderRadius: 48,
            boxShadow: "0 6px 0 rgba(0,0,0,0.08)",
            opacity: interpolate(frame, [8, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {scene.emphasis}
        </div>
      )}
    </AbsoluteFill>
  );
};
