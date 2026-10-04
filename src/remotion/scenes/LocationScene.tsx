import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { PALETTE as P } from "../../style";
import type { Scene } from "../../types";
import { Scenery } from "./parts";

// 場所の全景。図解・人物が続いたときの「呼吸」
export const LocationScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  // ゆっくりしたズームで静止画でも動きを感じさせる
  const scale = interpolate(frame, [0, 300], [1, 1.06], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: P.background, opacity }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Scenery motif={scene.motif} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
