import { Composition } from "remotion";
import { Main } from "./Video";
import { VIDEO, sceneHoldSec } from "../style";
import scenesData from "./scenes-data.json";
import type { ScenesData } from "../types";

const data = scenesData as unknown as ScenesData;

const totalFrames = Math.max(
  data.scenes.reduce(
    (a, s) => a + Math.max(Math.ceil(sceneHoldSec(s) * VIDEO.fps), 1),
    0,
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
