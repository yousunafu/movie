import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { PALETTE as P } from "../../style";
import type { Scene } from "../../types";
import { ElderlyPerson, FoodIcon } from "./parts";
import { OBJECT_MOTIFS } from "../../motifs";
import { FONT } from "../Video";

// ラベル付き図解: 中央の題材の周りに、要素を線でつないで示す
export const DiagramScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).slice(0, 4);
  const isFood = (OBJECT_MOTIFS as readonly string[]).includes(scene.motif);

  return (
    <AbsoluteFill style={{ backgroundColor: P.background }}>
      {scene.title && (
        <div
          style={{
            position: "absolute",
            top: 70,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 60,
            fontWeight: 700,
            color: P.ink,
          }}
        >
          {scene.title}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          bottom: 220,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isFood ? (
          <FoodIcon motif={scene.motif} size={460} />
        ) : (
          <ElderlyPerson motif="talking" size={480} />
        )}
      </div>
      {items.map((item, i) => {
        const delay = i * Math.round(fps * 0.4);
        const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const side = i % 2 === 0 ? "left" : "right";
        const top = 240 + Math.floor(i / 2) * 260;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              [side]: 160,
              top,
              opacity,
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexDirection: side === "left" ? "row" : "row-reverse",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 46,
                fontWeight: 700,
                color: P.ink,
                background: "#FFFFFF",
                border: `4px solid ${P.warmBeige}`,
                borderRadius: 16,
                padding: "18px 34px",
                maxWidth: 420,
              }}
            >
              {item.label}
              {item.value !== undefined && (
                <span style={{ color: P.accent, marginLeft: 12 }}>
                  {item.value}
                  {item.unit ?? ""}
                </span>
              )}
            </div>
            <div style={{ width: 120, height: 4, background: P.ink, opacity: 0.5 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
