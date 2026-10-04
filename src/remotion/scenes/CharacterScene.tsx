import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PALETTE as P } from "../../style";
import type { Scene } from "../../types";
import { ElderlyPerson, FoodIcon } from "./parts";
import { OBJECT_MOTIFS } from "../../motifs";
import { FONT } from "../Video";

export const CharacterScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const slideY = interpolate(enter, [0, 1], [40, 0]);
  const hasFood = (OBJECT_MOTIFS as readonly string[]).includes(scene.motif);

  return (
    <AbsoluteFill style={{ backgroundColor: P.background }}>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          bottom: 220,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 80,
          opacity: enter,
          transform: `translateY(${slideY}px)`,
        }}
      >
        <ElderlyPerson motif={hasFood ? "talking" : scene.motif} size={600} />
        {hasFood && <FoodIcon motif={scene.motif} size={400} />}
        {scene.emphasis && !hasFood && (
          <div
            style={{
              fontFamily: FONT,
              fontSize: 72,
              fontWeight: 700,
              color: P.accent,
              border: `6px solid ${P.accentSoft}`,
              borderRadius: 24,
              padding: "28px 48px",
              background: "#FFFFFF",
              maxWidth: 560,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {scene.emphasis}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
