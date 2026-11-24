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
// 4章は PART2 (32シーン) 未着手。書き終えたら戻す
import { KosoPillarsPreview, KOSO_PILLARS_PREVIEW_FRAMES } from "./karakuri/KosoPillars";
import { KosoB0Preview, KOSO_B0_PREVIEW_FRAMES } from "./karakuri/KosoB0";
import { KosoB1Preview, KOSO_B1_PREVIEW_FRAMES } from "./karakuri/KosoB1";
import { KosoB2Preview, KOSO_B2_PREVIEW_FRAMES } from "./karakuri/KosoB2Index";
import { KosoB3Preview, KOSO_B3_PREVIEW_FRAMES } from "./karakuri/KosoB3Index";
import { KosoB4Preview, KOSO_B4_PREVIEW_FRAMES } from "./karakuri/KosoB4Index";
import { KosoB5Preview, KOSO_B5_PREVIEW_FRAMES } from "./karakuri/KosoB5Index";
import { KosoB6Preview, KOSO_B6_PREVIEW_FRAMES } from "./karakuri/KosoB6Index";
import { KosoAllPreview, KOSO_ALL_PREVIEW_FRAMES } from "./karakuri/KosoIndex";
import { IchiAllPreview, ICHI_ALL_PREVIEW_FRAMES } from "./karakuri/IchiIndex";
import { SaigoAllPreview, SAIGO_ALL_PREVIEW_FRAMES, SaigoAllMotion, SAIGO_MOTION_FRAMES } from "./karakuri/SaigoIndex";
import { SaigoPartsPreview, SAIGO_PARTS_PREVIEW_FRAMES } from "./karakuri/SaigoParts";
import { YawaAllPreview, YAWA_ALL_PREVIEW_FRAMES, YawaAllMotion, YAWA_MOTION_FRAMES } from "./karakuri/YawaIndex";
import { YawaPartsPreview, YAWA_PARTS_PREVIEW_FRAMES } from "./karakuri/YawaParts";
import { NamaePartsPreview, NAMAE_PARTS_PREVIEW_FRAMES } from "./karakuri/NamaeParts";
import { NamaeAllPreview, NAMAE_ALL_PREVIEW_FRAMES, NamaeAllMotion, NAMAE_MOTION_FRAMES } from "./karakuri/NamaeIndex";
import { IchiB0Preview, ICHI_B0_PREVIEW_FRAMES, IchiB0Motion, ICHI_B0_MOTION_FRAMES } from "./karakuri/IchiB0";
import { IchiB1Preview, ICHI_B1_PREVIEW_FRAMES } from "./karakuri/IchiB1";
import { IchiB2Preview, ICHI_B2_PREVIEW_FRAMES } from "./karakuri/IchiB2";
import { IchiB3Preview, ICHI_B3_PREVIEW_FRAMES } from "./karakuri/IchiB3";
import { IchiB4Preview, ICHI_B4_PREVIEW_FRAMES } from "./karakuri/IchiB4";
import { IchiB5Preview, ICHI_B5_PREVIEW_FRAMES } from "./karakuri/IchiB5";
import { IchiB6Preview, ICHI_B6_PREVIEW_FRAMES } from "./karakuri/IchiB6";
import { IchiB7Preview, ICHI_B7_PREVIEW_FRAMES } from "./karakuri/IchiB7";
import { IchiB8Preview, ICHI_B8_PREVIEW_FRAMES } from "./karakuri/IchiB8";
import { IchiB9Preview, ICHI_B9_PREVIEW_FRAMES } from "./karakuri/IchiB9";
import { IchiB10Preview, ICHI_B10_PREVIEW_FRAMES } from "./karakuri/IchiB10";
import { IchiB11Preview, ICHI_B11_PREVIEW_FRAMES } from "./karakuri/IchiB11";
import { KsePreview, KSE_PREVIEW_FRAMES, KseMotion, KSE_MOTION_FRAMES } from "./karakuri/KseIndex";
import { PersonCatalog } from "./karakuri/PersonCatalog";
import { ChannelHeader, HEADER_W, HEADER_H } from "./karakuri/ChannelHeader";
import { JihankiP2a, JihankiP2b, JihankiP2c, JihankiP2d, JihankiP2VarSheet, JihankiP2VarFeed, JihankiThumbP1, JihankiThumbP2, JihankiThumbP3, JihankiThumbP4, JihankiThumbSheet, JihankiThumbFeed } from "./karakuri/JihankiThumbs";
import { YawaThumbP1, YawaThumbP2, YawaThumbP3, YawaThumbP4, YawaThumbSheet, YawaThumbFeed, TW, TH } from "./karakuri/YawaThumbs";
import { ChannelIconA, ChannelIconB, ChannelIconC, ChannelIconD, ChannelIconE, ChannelIconSheet, ICON } from "./karakuri/ChannelIcon";
import { YoruTest, YORU_TEST_FRAMES, YoruDusk, YORU_DUSK_FRAMES, YoruNoteSave, YoruNoteName, YORU_NOTE_FRAMES, YoruFlatSave, YoruDaySave, YoruPrintSave, YORU_SAVE_SET_FRAMES } from "./yoru/YoruTest";
import { SekaiBoutouPreview, SEKAI_BOUTOU_FRAMES } from "./sekai/SekaiBoutou";
import {
  SekaiSheetA,
  SekaiSheetB,
  SekaiSheetC,
  SekaiSheetD,
  SekaiSheetAll,
  SekaiWorldCatalog,
  WORLD_CATALOG_FRAMES,
  SHEET_A_FRAMES,
  SHEET_B_FRAMES,
  SHEET_C_FRAMES,
  SHEET_D_FRAMES,
  SHEET_ALL_FRAMES,
} from "./sekai/SekaiSheet";
import { MainCheap } from "./sekai/cheap";
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
      {/* sekai 廉価版。台本・音声・字幕は Main とまったく同じで、絵だけ密度を落とした比較用 */}
      <Composition
        id="MainCheap"
        component={MainCheap}
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
      {/* 順位回 (『2位』は、120年前に発明された): 序 (文#1〜#20) / 第1章 (文#21〜#35)。
          コマ番号 = 文番号 − 1 / − 21 */}
      <Composition id="IchiB0" component={IchiB0Preview} durationInFrames={ICHI_B0_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB1" component={IchiB1Preview} durationInFrames={ICHI_B1_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* なぜ人は、柔らかいものを握りたくなるのか 検品 (1フレーム = 1文。コマ番号 = 文番号 − 1) */}
      <Composition id="YawaAll" component={YawaAllPreview} durationInFrames={YAWA_ALL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="YawaMotion" component={YawaAllMotion} durationInFrames={YAWA_MOTION_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="YawaParts" component={YawaPartsPreview} durationInFrames={YAWA_PARTS_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="NamaeParts" component={NamaePartsPreview} durationInFrames={NAMAE_PARTS_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="NamaeAll" component={NamaeAllPreview} durationInFrames={NAMAE_ALL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="NamaeMotion" component={NamaeAllMotion} durationInFrames={NAMAE_MOTION_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 序章の「動き」確認用 (1シーン200フレームずつ)。コマ番号 = (文番号−1)×200 + 見たい f */}
      <Composition id="IchiB0Motion" component={IchiB0Motion} durationInFrames={ICHI_B0_MOTION_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 第2章 (文#36〜#47)。コマ番号 = 文番号 − 36 */}
      <Composition id="IchiB2" component={IchiB2Preview} durationInFrames={ICHI_B2_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 第3章〜結び。コマ番号 = 文番号 − その章の最初の文番号
          B3 #48〜#62 / B4 #63〜#77 / B5 #78〜#102 / B6 #103〜#122 / B7 #123〜#142
          B8 #143〜#162 / B9 #163〜#187 / B10 #188〜#199 / B11 (結び) #200〜#219 */}
      <Composition id="IchiB3" component={IchiB3Preview} durationInFrames={ICHI_B3_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB4" component={IchiB4Preview} durationInFrames={ICHI_B4_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB5" component={IchiB5Preview} durationInFrames={ICHI_B5_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB6" component={IchiB6Preview} durationInFrames={ICHI_B6_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB7" component={IchiB7Preview} durationInFrames={ICHI_B7_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB8" component={IchiB8Preview} durationInFrames={ICHI_B8_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB9" component={IchiB9Preview} durationInFrames={ICHI_B9_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB10" component={IchiB10Preview} durationInFrames={ICHI_B10_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="IchiB11" component={IchiB11Preview} durationInFrames={ICHI_B11_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* つながる世界史 からくり試作 (冒頭2分・文#1〜#19)。コマ番号 = 文番号 − 1 */}
      <Composition id="KseP" component={KsePreview} durationInFrames={KSE_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 同・動き確認用 (1シーン200フレーム)。コマ番号 = (文番号−1)×200 + 見たい f */}
      <Composition id="KseMotion" component={KseMotion} durationInFrames={KSE_MOTION_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* ★全282枚を1列に (序→6章)。コマ番号 + 1 = 文番号。一覧シートはこれを使う */}
      <Composition id="KosoAll" component={KosoAllPreview} durationInFrames={KOSO_ALL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 「2位」は120年前に発明された 全219枚の通し確認 (1フレーム = 1文) */}
      <Composition id="IchiAll" component={IchiAllPreview} durationInFrames={ICHI_ALL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 人類は、昔から飛ばして観ていた 全237枚の検品 (1フレーム = 1文。コマ番号 = 文番号 − 1) */}
      <Composition id="SaigoAll" component={SaigoAllPreview} durationInFrames={SAIGO_ALL_PREVIEW_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 同・動き確認用 (1シーン200フレーム)。コマ番号 = (文番号−1)×200 + 見たい f */}
      <Composition id="SaigoMotion" component={SaigoAllMotion} durationInFrames={SAIGO_MOTION_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* 同・共有装置の検品 (断面図A〜E/手配書/再生バー/絵巻年表/三枚札) */}
      <Composition id="SaigoParts" component={SaigoPartsPreview} durationInFrames={SAIGO_PARTS_PREVIEW_FRAMES}
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
      {/* sekai (つながる世界史) の作風見本。前半=地の文の字幕帯 / 後半=反応の通知カード
          色だけを変えた2本。レイアウト・カメラ・動きは同一にしてA/B比較を成立させる */}
      <Composition
        id="SekaiBoutou"
        component={SekaiBoutouPreview}
        durationInFrames={SEKAI_BOUTOU_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{ color: false }}
      />
      <Composition
        id="SekaiBoutouColor"
        component={SekaiBoutouPreview}
        durationInFrames={SEKAI_BOUTOU_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={{ color: true }}
      />
      {/* world.tsx の共通部品の見本。部品を直したらここで目で確かめる */}
      <Composition
        id="SekaiWorldCatalog"
        component={SekaiWorldCatalog}
        durationInFrames={WORLD_CATALOG_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* 冒頭3分39枚の確認用。1枚60フレームずつ。担当ごとに分けてある */}
      <Composition
        id="SekaiSheetA"
        component={SekaiSheetA}
        durationInFrames={SHEET_A_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="SekaiSheetB"
        component={SekaiSheetB}
        durationInFrames={SHEET_B_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="SekaiSheetC"
        component={SekaiSheetC}
        durationInFrames={SHEET_C_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="SekaiSheetD"
        component={SekaiSheetD}
        durationInFrames={SHEET_D_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="SekaiSheetAll"
        component={SekaiSheetAll}
        durationInFrames={SHEET_ALL_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* 「夜の深掘りチャンネル」(仮) の試作。本編とは無関係 (2026-11-16) */}
      <Composition
        id="YoruTest"
        component={YoruTest}
        durationInFrames={YORU_TEST_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="YoruDusk"
        component={YoruDusk}
        durationInFrames={YORU_DUSK_FRAMES}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition id="YoruNoteSave" component={YoruNoteSave} durationInFrames={YORU_NOTE_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* セーブ回の作画パターン (2026-11-18 試作) */}
      <Composition id="YoruFlatSave" component={YoruFlatSave} durationInFrames={YORU_SAVE_SET_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="YoruDaySave" component={YoruDaySave} durationInFrames={YORU_SAVE_SET_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="YoruPrintSave" component={YoruPrintSave} durationInFrames={YORU_SAVE_SET_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      <Composition id="YoruNoteName" component={YoruNoteName} durationInFrames={YORU_NOTE_FRAMES}
        fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      {/* からくりチャンネルのヘッダー画像 (2560×1440)。本編とは無関係 */}
      <Composition id="ChannelHeader" component={ChannelHeader} durationInFrames={1} fps={VIDEO.fps} width={HEADER_W} height={HEADER_H} />
      <Composition id="ChannelHeaderGuide" component={ChannelHeader} durationInFrames={1} fps={VIDEO.fps} width={HEADER_W} height={HEADER_H} defaultProps={{ showGuide: true }} />
      {/* からくりチャンネルのアイコン (800×800)。決定版 = D。A〜E と見比べ用。本編とは無関係 */}
      <Composition id="ChannelIconA" component={ChannelIconA} durationInFrames={1} fps={VIDEO.fps} width={ICON} height={ICON} />
      <Composition id="ChannelIconB" component={ChannelIconB} durationInFrames={1} fps={VIDEO.fps} width={ICON} height={ICON} />
      <Composition id="ChannelIconC" component={ChannelIconC} durationInFrames={1} fps={VIDEO.fps} width={ICON} height={ICON} />
      <Composition id="ChannelIconD" component={ChannelIconD} durationInFrames={1} fps={VIDEO.fps} width={ICON} height={ICON} />
      <Composition id="ChannelIconE" component={ChannelIconE} durationInFrames={1} fps={VIDEO.fps} width={ICON} height={ICON} />
      <Composition id="ChannelIconSheet" component={ChannelIconSheet} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      {/* 柔らかいもの回のサムネ 4パターン (1280×720) と見比べ用。本編とは無関係 */}
      <Composition id="YawaThumbP1" component={YawaThumbP1} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="YawaThumbP2" component={YawaThumbP2} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="YawaThumbP3" component={YawaThumbP3} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="YawaThumbP4" component={YawaThumbP4} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="YawaThumbSheet" component={YawaThumbSheet} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      <Composition id="YawaThumbFeed" component={YawaThumbFeed} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      {/* 自販機回のサムネ 4パターン (1280×720) と見比べ用。本編とは無関係 */}
      <Composition id="JihankiThumbP1" component={JihankiThumbP1} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiThumbP2" component={JihankiThumbP2} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiThumbP3" component={JihankiThumbP3} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiThumbP4" component={JihankiThumbP4} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiThumbSheet" component={JihankiThumbSheet} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      <Composition id="JihankiThumbFeed" component={JihankiThumbFeed} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      {/* 自販機回 P2 の文字の見せ方ちがい4案 */}
      <Composition id="JihankiP2a" component={JihankiP2a} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiP2b" component={JihankiP2b} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiP2c" component={JihankiP2c} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiP2d" component={JihankiP2d} durationInFrames={1} fps={VIDEO.fps} width={TW} height={TH} />
      <Composition id="JihankiP2VarSheet" component={JihankiP2VarSheet} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      <Composition id="JihankiP2VarFeed" component={JihankiP2VarFeed} durationInFrames={1} fps={VIDEO.fps} width={1920} height={1080} />
      {/* karakuri共通人物部品のカタログ (Person 7ポーズ / 表情7種 / PersonMini)。本編とは無関係 */}
      <Composition
        id="PersonCatalog"
        component={PersonCatalog}
        durationInFrames={60}
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
