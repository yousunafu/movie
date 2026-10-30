import { Composition } from "remotion";
import { Main } from "./Video";
import { StyleTest } from "./styletest/StyleTest";
import { PersonVariants } from "./styletest/PersonVariants";
import { CameraDemo, DEMO_TOTAL_FRAMES } from "./karakuri/CameraDemo";
import { Jihanki2000Preview, J2_PREVIEW_TOTAL_FRAMES } from "./karakuri/Jihanki2000Preview";
import { WatashiCharacters, WATASHI_CHARS_FRAMES } from "./karakuri/WatashiCharacters";
import { Uranaishi, URANAISHI_FRAMES } from "./karakuri/WatashiUranaishi";
import { WatashiB1Preview, W_B1_PREVIEW_FRAMES } from "./karakuri/WatashiB1";
import { WatashiB2Preview, W_B2_PREVIEW_FRAMES } from "./karakuri/WatashiB2";
import { WatashiB3Preview, W_B3_PREVIEW_FRAMES } from "./karakuri/WatashiB3";
import { WatashiB4Preview, W_B4_PREVIEW_FRAMES } from "./karakuri/WatashiB4";
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
      {/* 「私は何者?」本編イラストの検品用プレビュー (1フレーム=1シーン) */}
      <Composition id="WatashiB1" component={WatashiB1Preview} durationInFrames={W_B1_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="WatashiB2" component={WatashiB2Preview} durationInFrames={W_B2_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="WatashiB3" component={WatashiB3Preview} durationInFrames={W_B3_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="WatashiB4" component={WatashiB4Preview} durationInFrames={W_B4_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 「私は何者?」の回の占い師キャラ試作 A〜D。本編とは無関係 */}
      <Composition
        id="WatashiChars"
        component={WatashiCharacters}
        durationInFrames={WATASHI_CHARS_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* 「私は何者?」の回の占い師キャラ試作 (人間版) 5案。本編とは無関係 */}
      <Composition
        id="Uranaishi"
        component={Uranaishi}
        durationInFrames={URANAISHI_FRAMES}
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
