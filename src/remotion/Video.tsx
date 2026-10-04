import {
  AbsoluteFill,
  Audio,
  Series,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { loadDefaultJapaneseParser } from "budoux";
import { PALETTE, SUBTITLE, VIDEO } from "../style";
import type { Scene, ScenesData } from "../types";
import { CharacterScene } from "./scenes/CharacterScene";
import { ObjectScene } from "./scenes/ObjectScene";
import { DiagramScene } from "./scenes/DiagramScene";
import { ChartScene } from "./scenes/ChartScene";
import { LocationScene } from "./scenes/LocationScene";
import { CardScene } from "./scenes/CardScene";
import { ImageScene } from "./scenes/ImageScene";

export const FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";

const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  // 結論カード以外は、AI画像があればそれを優先して全面に見せる
  if (scene.image && scene.type !== "card") {
    return <ImageScene scene={scene} />;
  }
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

// 日本語の文節で改行する (「たんぱ\nく質」のような変な折り返しを防ぐ)
const jaParser = loadDefaultJapaneseParser();

const Subtitle: React.FC<{ text: string; onImage?: boolean }> = ({
  text,
  onImage,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const chunks = jaParser.parse(text);
  return (
    <div
      style={{
        position: "absolute",
        bottom: SUBTITLE.bottom,
        left: "50%",
        transform: "translateX(-50%)",
        width: `${SUBTITLE.maxWidthRatio * 100}%`,
        textAlign: "center",
        opacity,
      }}
    >
      <span
        style={{
          display: "inline",
          fontFamily: FONT,
          fontSize: SUBTITLE.fontSize,
          fontWeight: SUBTITLE.weight,
          color: PALETTE.subtitle,
          lineHeight: 1.55,
          // 画像の上では、読みやすいよううっすら白帯を敷く
          backgroundColor: onImage ? "rgba(255, 252, 247, 0.88)" : undefined,
          boxShadow: onImage ? "0 0 0 14px rgba(255, 252, 247, 0.88)" : undefined,
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          borderRadius: 4,
        }}
      >
        {chunks.map((chunk, i) => (
          <span key={i} style={{ display: "inline-block" }}>
            {chunk}
          </span>
        ))}
      </span>
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
              <Subtitle
                text={scene.text}
                onImage={Boolean(scene.image) && scene.type !== "card"}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
