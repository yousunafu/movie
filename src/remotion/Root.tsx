import { Composition } from "remotion";
import { Main } from "./Video";
import { StyleTest } from "./styletest/StyleTest";
import { PersonVariants } from "./styletest/PersonVariants";
import { CameraDemo, DEMO_TOTAL_FRAMES } from "./karakuri/CameraDemo";
import { Jihanki2000Preview, J2_PREVIEW_TOTAL_FRAMES } from "./karakuri/Jihanki2000Preview";
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
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={totalFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{ data }}
      />
      {/* カメラ演出のデモ (寄り・画中変化・書き込み・虫めがね・断面・横移動・章扉)。本編とは無関係 */}
      <Composition
        id="CameraDemo"
        component={CameraDemo}
        durationInFrames={DEMO_TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* 自販機2000年史のテイスト確認用プレビュー (導入+第1章) */}
      <Composition
        id="J2Preview"
        component={Jihanki2000Preview}
        durationInFrames={J2_PREVIEW_TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* karakuri人物デザイン試作 A〜E (オリジナル候補)。本編とは無関係 */}
      <Composition
        id="PersonVariants"
        component={PersonVariants}
        durationInFrames={5}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* 作風コピーの実験 (「最高の老後」風の静止画3枚)。本編とは無関係 */}
      <Composition
        id="StyleTest"
        component={StyleTest}
        durationInFrames={5}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
