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

  // 元気な姿と衰えた姿の対比 (筋肉が減る・老化が進む等)
  if (scene.motif === "compare") {
    const Label: React.FC<{ text: string; color: string }> = ({ text, color }) => (
      <div
        style={{
          fontFamily: FONT,
          fontSize: 48,
          fontWeight: 700,
          color: "#FFFFFF",
          backgroundColor: color,
          borderRadius: 16,
          padding: "10px 36px",
        }}
      >
        {text}
      </div>
    );
    return (
      <AbsoluteFill style={{ backgroundColor: P.background }}>
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            right: 0,
            bottom: 220,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            opacity: enter,
            transform: `translateY(${slideY}px)`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <ElderlyPerson motif="happy" size={480} />
            <Label text="元気な体" color={P.softGreen} />
          </div>
          <div style={{ fontFamily: FONT, fontSize: 110, color: P.accent, fontWeight: 800 }}>
            →
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <ElderlyPerson motif="frail" size={480} />
            <Label text="衰えた体" color={P.accent} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

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
