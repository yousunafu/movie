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
import { TabiKitsPreview, TABIKITS_PREVIEW_FRAMES } from "./karakuri/TabiKits";
import { TabiTravelPreview, TABITRAVEL_PREVIEW_FRAMES } from "./karakuri/TabiTravel";
import { TabiB1Preview, T_B1_PREVIEW_FRAMES } from "./karakuri/TabiB1";
import { TabiB2Preview, T_B2_PREVIEW_FRAMES } from "./karakuri/TabiB2";
import { TabiB3Preview, T_B3_PREVIEW_FRAMES } from "./karakuri/TabiB3";
import { TabiB4Preview, T_B4_PREVIEW_FRAMES } from "./karakuri/TabiB4";
import { TabiB5Preview, T_B5_PREVIEW_FRAMES } from "./karakuri/TabiB5";
import { TabiB6Preview, T_B6_PREVIEW_FRAMES } from "./karakuri/TabiB6";
import { ElevB0Preview, EL_B0_PREVIEW_FRAMES, ElevB0Motion, EL_B0_MOTION_FRAMES } from "./karakuri/ElevB0";
import { ElevB2Preview, EL_B2_PREVIEW_FRAMES, ElevB2Sample, EL_B2_SAMPLE_FRAMES } from "./karakuri/ElevB2";
// 4章は PART2 (32シーン) 未着手。書き終えたら戻す
// import { ElevB4Preview, EL_B4_PREVIEW_FRAMES } from "./karakuri/ElevB4";
import { KosoPillarsPreview, KOSO_PILLARS_PREVIEW_FRAMES } from "./karakuri/KosoPillars";
import { KosoB0Preview, KOSO_B0_PREVIEW_FRAMES } from "./karakuri/KosoB0";
import { KosoB1Preview, KOSO_B1_PREVIEW_FRAMES } from "./karakuri/KosoB1";
import { KosoB2Preview, KOSO_B2_PREVIEW_FRAMES } from "./karakuri/KosoB2Index";
import { KosoB3Preview, KOSO_B3_PREVIEW_FRAMES } from "./karakuri/KosoB3Index";
import { KosoB4Preview, KOSO_B4_PREVIEW_FRAMES } from "./karakuri/KosoB4Index";
import { KosoB5Preview, KOSO_B5_PREVIEW_FRAMES } from "./karakuri/KosoB5Index";
import { KosoB6Preview, KOSO_B6_PREVIEW_FRAMES } from "./karakuri/KosoB6Index";
import { KosoAllPreview, KOSO_ALL_PREVIEW_FRAMES } from "./karakuri/KosoIndex";
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
      {/* 「旅とお土産の歴史」時代考証キット8種のプレビュー (150フレームずつ巡回) */}
      <Composition id="TabiKits" component={TabiKitsPreview} durationInFrames={TABIKITS_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 「旅とお土産の歴史」移動・舞台転換の演出キット7種のプレビュー (150フレームずつ巡回) */}
      <Composition id="TabiTravel" component={TabiTravelPreview} durationInFrames={TABITRAVEL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 「旅とお土産の歴史」本編イラストの検品用プレビュー (1フレーム=1シーン) */}
      <Composition id="TabiB1P" component={TabiB1Preview} durationInFrames={T_B1_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="TabiB2P" component={TabiB2Preview} durationInFrames={T_B2_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="TabiB3P" component={TabiB3Preview} durationInFrames={T_B3_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="TabiB4P" component={TabiB4Preview} durationInFrames={T_B4_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="TabiB5P" component={TabiB5Preview} durationInFrames={T_B5_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="TabiB6P" component={TabiB6Preview} durationInFrames={T_B6_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 「エレベーターの歴史」お試しスライド (方向性確認用。1フレーム=1シーン) */}
      <Composition id="ElevB0P" component={ElevB0Preview} durationInFrames={EL_B0_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="ElevB2P" component={ElevB2Preview} durationInFrames={EL_B2_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="ElevB2Sample" component={ElevB2Sample} durationInFrames={EL_B2_SAMPLE_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 4章は PART2 (32シーン) 未着手。書き終えたらこの登録を戻す */}
      {/* <Composition id="ElevB4P" component={ElevB4Preview} durationInFrames={EL_B4_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} /> */}
      {/* 「なぜ高層ビルは生まれたのか」5本柱の装置 (この回の主役の共通部品。150フレームずつ巡回) */}
      <Composition id="KosoPillars" component={KosoPillarsPreview} durationInFrames={KOSO_PILLARS_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 高層ビル回: 序 (文#1〜#27) / 第1章 (文#28〜#65) / 第2章 (文#66〜#112)。1フレーム = 1シーン */}
      <Composition id="KosoB0" component={KosoB0Preview} durationInFrames={KOSO_B0_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="KosoB1" component={KosoB1Preview} durationInFrames={KOSO_B1_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="KosoB2" component={KosoB2Preview} durationInFrames={KOSO_B2_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 第3章 (文#113〜#146) / 第4章 (文#147〜#178)。コマ番号 = 文番号 − 113 / − 147 */}
      <Composition id="KosoB3" component={KosoB3Preview} durationInFrames={KOSO_B3_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="KosoB4" component={KosoB4Preview} durationInFrames={KOSO_B4_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 第5章 (文#179〜#216) / 第6章 (文#217〜#282)。コマ番号 = 文番号 − 179 / − 217 */}
      <Composition id="KosoB5" component={KosoB5Preview} durationInFrames={KOSO_B5_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="KosoB6" component={KosoB6Preview} durationInFrames={KOSO_B6_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* ★全282枚を1列に (序→6章)。コマ番号 + 1 = 文番号。一覧シートはこれを使う */}
      <Composition id="KosoAll" component={KosoAllPreview} durationInFrames={KOSO_ALL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 序章の「動き」確認用 (1シーン5秒ずつ通し再生。スライドでは写らない演出を見るため) */}
      <Composition id="ElevB0Motion" component={ElevB0Motion} durationInFrames={EL_B0_MOTION_FRAMES}
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
