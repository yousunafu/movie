import {
  AbsoluteFill,
  Audio,
  Series,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { PALETTE, SUBTITLE, VIDEO } from "../style";
import type { Scene, ScenesData } from "../types";
import { CharacterScene } from "./scenes/CharacterScene";
import { ObjectScene } from "./scenes/ObjectScene";
import { DiagramScene } from "./scenes/DiagramScene";
import { ChartScene } from "./scenes/ChartScene";
import { LocationScene } from "./scenes/LocationScene";
import { CardScene } from "./scenes/CardScene";

export const FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case "object":
      return <ObjectScene scene={scene} />;
    case "diagram":
      return <DiagramScene scene={scene} />;
    case "chart":
      return <ChartScene scene={scene} />;
    case "location":
      return <LocationScene scene={scene} />;
    case "card":
      return <CardScene scene={scene} />;
    default:
      return <CharacterScene scene={scene} />;
  }
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: SUBTITLE.bottom,
        left: "50%",
        transform: "translateX(-50%)",
        width: `${SUBTITLE.maxWidthRatio * 100}%`,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: SUBTITLE.fontSize,
        fontWeight: SUBTITLE.weight,
        color: PALETTE.subtitle,
        lineHeight: 1.45,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

export const Main: React.FC<{ data: ScenesData }> = ({ data }) => {
  if (data.scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: PALETTE.background,
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          fontSize: 48,
          color: PALETTE.ink,
        }}
      >
        台本がまだ読み込まれていません (npm run generate を先に実行)
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.background }}>
      {data.hasBgm && (
        <Audio loop src={staticFile("bgm.mp3")} volume={0.07} />
      )}
      <Series>
        {data.scenes.map((scene) => {
          const frames = Math.max(
            Math.ceil(
              (scene.durationSec + VIDEO.scenePaddingSec) * VIDEO.fps,
            ),
            1,
          );
          return (
            <Series.Sequence
              key={scene.index}
              durationInFrames={frames}
              name={`${scene.index}-${scene.type}`}
            >
              <Audio src={staticFile(scene.audio)} />
              <SceneView scene={scene} />
              <Subtitle text={scene.text} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
