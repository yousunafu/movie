import { Composition } from "remotion";
import { Main } from "./Video";
import { VIDEO } from "../style";
import scenesData from "./scenes-data.json";
import type { ScenesData } from "../types";

const data = scenesData as unknown as ScenesData;

const totalFrames = Math.max(
  Math.ceil(
    data.scenes.reduce(
      (a, s) => a + s.durationSec + VIDEO.scenePaddingSec,
      0,
    ) * VIDEO.fps,
  ),
  VIDEO.fps,
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={totalFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{ data }}
    />
  );
};
