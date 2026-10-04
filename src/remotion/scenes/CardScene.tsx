import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { PALETTE as P } from "../../style";
import { CHANNEL } from "../../channel";
import type { Scene } from "../../types";
import { FONT } from "../Video";
import { FoodIcon } from "./parts";
import { OBJECT_MOTIFS } from "../../motifs";

// 結論を額装したカード。終了画面もこの型 (isEnding)
export const CardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(enter, [0, 1], [0.92, 1]);
  // 食材の話なら結論カードの中に食材イラストを添える
  const hasFood = (OBJECT_MOTIFS as readonly string[]).includes(scene.motif);

  if (scene.isEnding) {
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 46,
            transform: `scale(${scale})`,
            opacity: enter,
            marginBottom: 120,
          }}
        >
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: "50%",
              background: P.accentSoft,
              border: `6px solid ${P.ink}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: FONT,
              fontSize: 96,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            {CHANNEL.iconLetter}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 66, fontWeight: 700, color: P.ink }}>
            {CHANNEL.name}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 44,
              fontWeight: 700,
              color: "#FFFFFF",
              background: P.accent,
              borderRadius: 48,
              padding: "20px 64px",
            }}
          >
            チャンネル登録はこちら
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.backgroundAlt,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          border: `7px solid ${P.ink}`,
          borderRadius: 6,
          background: P.background,
          padding: hasFood ? "50px 110px 70px" : "90px 110px",
          maxWidth: 1400,
          transform: `scale(${scale})`,
          opacity: enter,
          marginBottom: 140,
          boxShadow: `18px 18px 0 ${P.warmBeige}`,
        }}
      >
        {hasFood && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <FoodIcon motif={scene.motif} size={290} />
          </div>
        )}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 64,
            fontWeight: 700,
            color: P.ink,
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          {scene.emphasis ?? scene.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
