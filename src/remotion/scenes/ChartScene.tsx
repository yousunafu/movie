import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { PALETTE as P } from "../../style";
import type { Scene } from "../../types";
import { FONT } from "../Video";
import { FoodIcon } from "./parts";
import { OBJECT_MOTIFS } from "../../motifs";

// 数量の比較。数字は桁をそのまま表示する (丸め・単位の省略をしない)
export const ChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).slice(0, 4).filter((i) => i.label);
  const values = items.map((i) => Math.abs(i.value ?? 1));
  const max = Math.max(...values, 1);
  const colors = [P.accent, P.softBlue, P.softGreen, P.softYellow];
  // 食材の話なら数字の横に食材イラストを添える
  const hasFood = (OBJECT_MOTIFS as readonly string[]).includes(scene.motif);

  return (
    <AbsoluteFill style={{ backgroundColor: P.background }}>
      {scene.title && (
        <div
          style={{
            position: "absolute",
            top: 80,
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
          top: 190,
          left: 0,
          right: 0,
          bottom: 230,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: hasFood ? 80 : 110,
        }}
      >
        {hasFood && <FoodIcon motif={scene.motif} size={360} />}
        {items.length > 0 ? (
          items.map((item, i) => {
            const grow = spring({
              frame: frame - i * Math.round(fps * 0.3),
              fps,
              config: { damping: 15 },
            });
            // 数量を球の大きさで見せる
            const r = (90 + 180 * ((item.value !== undefined ? Math.abs(item.value) : max / 2) / max)) * grow;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
                <div
                  style={{
                    width: r,
                    height: r,
                    borderRadius: "50%",
                    background: colors[i % colors.length],
                    opacity: 0.85,
                    border: `5px solid ${P.ink}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {item.value !== undefined && (
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: Math.max(34, Math.min(62, r / 3.4)),
                        fontWeight: 700,
                        color: "#FFFFFF",
                        textShadow: "0 1px 4px rgba(0,0,0,0.25)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.value}
                      {item.unit ?? ""}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 44,
                    fontWeight: 700,
                    color: P.ink,
                    maxWidth: 360,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })
        ) : (
          <EmphasisNumber text={scene.emphasis ?? scene.text} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// itemsが無いときは文中の数字を大きく見せる
const EmphasisNumber: React.FC<{ text: string }> = ({ text }) => {
  const m = text.match(/[0-9０-９][0-9０-９.,．０-９]*\s*[%％割倍gmgkcal年歳個本回分億万千]*/);
  const num = m ? m[0] : "";
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 170,
        fontWeight: 700,
        color: P.accent,
        border: `8px solid ${P.warmBeige}`,
        background: "#FFFFFF",
        borderRadius: 32,
        padding: "40px 100px",
      }}
    >
      {num || "数字"}
    </div>
  );
};
