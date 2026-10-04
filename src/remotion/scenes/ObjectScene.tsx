import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { PALETTE as P } from "../../style";
import type { Scene } from "../../types";
import { FoodIcon } from "./parts";
import { FONT } from "../Video";

export const ObjectScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${pop})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 140,
        }}
      >
        <FoodIcon motif={scene.motif} size={560} />
        {/* 足元の淡い楕円 */}
        <div
          style={{
            width: 420,
            height: 42,
            borderRadius: "50%",
            background: P.warmBeige,
            opacity: 0.6,
            marginTop: -30,
          }}
        />
        {scene.emphasis && (
          <div
            style={{
              fontFamily: FONT,
              fontSize: 58,
              fontWeight: 700,
              color: P.accent,
              marginTop: 36,
            }}
          >
            {scene.emphasis}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
