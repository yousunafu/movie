import {
  AbsoluteFill,
  Audio,
  Series,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { loadDefaultJapaneseParser } from "budoux";
import { PALETTE, SUBTITLE, VIDEO, sceneHoldSec } from "../style";
import type { Scene, ScenesData } from "../types";
import { CharacterScene } from "./scenes/CharacterScene";
import { ObjectScene } from "./scenes/ObjectScene";
import { DiagramScene } from "./scenes/DiagramScene";
import { ChartScene } from "./scenes/ChartScene";
import { LocationScene } from "./scenes/LocationScene";
import { CardScene } from "./scenes/CardScene";
import { ImageScene } from "./scenes/ImageScene";
import { AshiSceneView, AshiMotion, AshiV2Context, AP, ASHI_FONT } from "./ashi/AshiScenes";
import { ManabiSceneView, MP, MANABI_FONT, manabiCardShowsFullText } from "./manabi/ManabiScenes";
import {
  RekishiSceneView,
  RP,
  REKISHI_BAND_H,
  rekishiCardShowsFullText,
} from "./rekishi/RekishiScenes";
import {
  KouzouSceneView,
  KP,
  KOUZOU_BAND_H,
  kouzouCardShowsFullText,
} from "./kouzou/KouzouScenes";
import { KeizaiSceneView, EP, KEIZAI_FONT, keizaiCardShowsFullText } from "./keizai/KeizaiScenes";
import { SuuriSceneView, SP, SUURI_FONT, suuriCardShowsFullText, suuriSceneHidesSubtitle, computeSuuriVariants, computeSuuriWashi, WashiCtx, computeSuuriStadium, StadiumCtx, computeSuuriRenai, RenaiCtx, splitPunchline } from "./suuri/SuuriScenes";
import { KarakuriSceneView, KRP, karakuriCardShowsFullText } from "./karakuri/KarakuriScenes";
import { J2AllSceneView } from "./karakuri/Jihanki2000Index";
import { WAllSceneView } from "./karakuri/WatashiIndex";

// 自販機2000年史 (モチーフ名が j2_ で始まる専用絵) を本編プレイヤーで描くためのつなぎ。
// J2AllSceneView は (motif, f) を受けるので、Sequence内の経過フレームを渡す。
const J2SceneInVideo: React.FC<{ motif: string }> = ({ motif }) => {
  const f = useCurrentFrame();
  return <J2AllSceneView motif={motif} f={f} />;
};

// 「私は何者?」4000年史 (モチーフ名が w1_〜w4_ で始まる専用絵) 用の同じつなぎ。
export const isWatashiMotif = (motif: string) => /^w[1-4]_/.test(motif);
const WSceneInVideo: React.FC<{ motif: string }> = ({ motif }) => {
  const f = useCurrentFrame();
  return <WAllSceneView motif={motif} f={f} />;
};

// ashi: どのシーンにv2演出 (ズーム・光の粒・文字ドン・行列アニメ・黄色字幕) を使うか。
// ユーザーの指定 (2026-10): 行列アニメ / 数字チャート / 最初のカード だけv2、他はv1の落ち着いた画面。
const ashiV2Indices = (scenes: Scene[]): Set<number> => {
  const set = new Set<number>();
  let firstCardUsed = false;
  let firstQueueUsed = false;
  for (const s of scenes) {
    if (s.type === "chart") set.add(s.index);
    else if (s.type === "character" && s.motif === "queue" && !firstQueueUsed) {
      // 行列アニメは最初の1回だけ。2回目以降は静かな行列の絵 (v1)
      set.add(s.index);
      firstQueueUsed = true;
    } else if (s.type === "card" && !s.isEnding && !firstCardUsed) {
      set.add(s.index);
      firstCardUsed = true;
    }
  }
  return set;
};

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

// 字幕の改行位置を手で指定する表 (読みやすさ優先)。
// ここに書いた文字列が字幕に含まれていたら、その「直後」で改行する。
const SUBTITLE_BREAK_AFTER: string[] = [
  // --- キラキラ画面の回 ---
  "あなたのキラキラスマホ画面も、",
  "何もない火曜日は、",
  "生きづらさから、",
  "等倍の毎日」と、",
  // --- のぞき見くんと絵の具のマジックの回 ---
  "コンピュータで、1秒に", // 「1兆色試したとしましょう」を2行目に (ユーザー指定)
  // --- 恋愛版ドレイク (運命の人) の回 --- (ユーザー指定の改行位置)
  "「行動あるのみ」と言われて行動できる人は、",
  "日本中の若者が出会いを求めて集まる街で、",
  "第1章で宇宙人を数える式を手に入れ、",
  "第3章で答えをひっくり返す掛け算の性質を知り、",
  "人口、ピアノのある家の割合、調律の頻度、",
];

const Subtitle: React.FC<{
  text: string;
  onImage?: boolean;
  ashi?: boolean;
  manabi?: boolean;
  rekishi?: boolean;
  kouzou?: boolean;
  keizai?: boolean;
  suuri?: boolean;
  washi?: boolean; // suuri の和紙背景モード (字幕を墨色にする)
  renai?: boolean; // suuri の恋愛モード (白地なので字幕をチャコールにする)
  karakuri?: boolean; // karakuri: 下部の黒い角丸帯に白字 (お手本の字幕スタイル)
  highlight?: string;
  // オチ字幕: atFrame までは先頭 headChars 文字だけ表示する (ネタバレ防止)
  tailReveal?: { headChars: number; atFrame: number };
}> = ({ text: fullText, onImage, ashi, manabi, rekishi, kouzou, keizai, suuri, washi, renai, karakuri, highlight, tailReveal }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const revealed =
    tailReveal && frame < tailReveal.atFrame
      ? fullText.slice(0, tailReveal.headChars)
      : fullText;
  // 字幕の改行位置を手で指定する (読みやすさ優先)。該当文字列の直後で改行
  let text = revealed;
  for (const b of SUBTITLE_BREAK_AFTER) {
    text = text.replace(b, `${b}\n`);
  }
  // 強調語 (emphasis) が字幕の中にあれば、その部分だけ黄色にする
  const hl = highlight?.replace(/[「」]/g, "").trim();
  const useHl = Boolean(hl && hl.length >= 2 && text.includes(hl!));
  const nodes: React.ReactNode[] = [];
  // 改行指定 (\n) があれば <br/> を入れつつ、文節ごとに span を作る
  const pushText = (s: string, keyPrefix: string) => {
    s.split("\n").forEach((seg, li) => {
      if (li > 0) nodes.push(<br key={`${keyPrefix}-br-${li}`} />);
      jaParser.parse(seg).forEach((chunk, j) => {
        nodes.push(
          <span key={`${keyPrefix}-${li}-${j}`} style={{ display: "inline-block" }}>
            {chunk}
          </span>,
        );
      });
    });
  };
  if (useHl) {
    text.split(hl!).forEach((part, i, arr) => {
      pushText(part, `p${i}`);
      if (i < arr.length - 1) {
        nodes.push(
          <span
            key={`h-${i}`}
            style={{ display: "inline-block", color: "#FFD966", fontWeight: 700 }}
          >
            {hl}
          </span>,
        );
      }
    });
  } else {
    pushText(text, "t");
  }
  // rekishi / kouzou: 下端の黒帯 (各 SceneView が描く) の中央に白ゴシックで全文。帯は敷かない
  if (rekishi || kouzou) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: rekishi ? REKISHI_BAND_H : KOUZOU_BAND_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity,
        }}
      >
        <div
          style={{
            maxWidth: "88%",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: rekishi ? 48 : 42,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.5,
          }}
        >
          {nodes}
        </div>
      </div>
    );
  }
  // karakuri: 下部の黒い角丸帯の中に白いゴシック太字 (お手本: 最高の老後 の字幕スタイル)
  // 字幕法 (からくり憲法§1): 1行36字まで・最大2行・3行禁止。幅92%+フォント48で実現。
  // 帯上端は 1行:y≈931 / 2行:y≈854 → イラスト内テロップは y≤780 に置くこと (安全ライン)
  if (karakuri) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: "50%",
          transform: "translateX(-50%)",
          // width (maxWidthではない) で指定する。absolute+left:50%にmaxWidthだけだと
          // 「画面の右半分 (960px)」を基準に早く折り返されてしまう (v1の字幕が狭かった原因)
          width: "92%",
          textAlign: "center",
          opacity,
        }}
      >
        <span
          style={{
            display: "inline",
            fontFamily: FONT,
            fontSize: 48,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.6,
            backgroundColor: "rgba(34, 30, 27, 0.88)",
            boxShadow: "0 0 0 16px rgba(34, 30, 27, 0.88)",
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
            borderRadius: 14,
          }}
        >
          {nodes}
        </span>
      </div>
    );
  }
  // keizai: 下部に白いゴシック太字+黒の縁取り (ニュース番組のテロップ風。帯は敷かない)
  if (keizai) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: "50%",
          transform: "translateX(-50%)",
          width: "88%",
          textAlign: "center",
          opacity,
        }}
      >
        <span
          style={{
            display: "inline",
            fontFamily: KEIZAI_FONT,
            fontSize: 52,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.55,
            textShadow:
              "3px 0 0 #000, -3px 0 0 #000, 0 3px 0 #000, 0 -3px 0 #000, 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 6px 18px rgba(0,0,0,0.85)",
          }}
        >
          {nodes}
        </span>
      </div>
    );
  }
  // ashi: 白い明朝体 + 影。manabi/suuri: 白いゴシック + 影。画像の上では暗い帯
  const band = ashi || manabi || suuri
    ? suuri
      ? "rgba(6, 6, 8, 0.78)"
      : manabi
        ? "rgba(10, 14, 22, 0.75)"
        : "rgba(7, 11, 22, 0.72)"
    : "rgba(255, 252, 247, 0.88)";
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
          fontFamily: ashi ? ASHI_FONT : manabi ? MANABI_FONT : suuri ? SUURI_FONT : FONT,
          fontSize: SUBTITLE.fontSize,
          fontWeight: SUBTITLE.weight,
          color: ashi ? AP.sub : manabi ? MP.ink : suuri ? (washi ? "#2A2622" : renai ? "#3A3A40" : SP.ink) : PALETTE.subtitle,
          lineHeight: 1.55,
          textShadow:
            suuri && washi
              ? "0 2px 10px rgba(242, 235, 219, 0.9)"
              : suuri && renai
                ? "0 2px 10px rgba(253, 249, 250, 0.9)"
                : ashi || manabi || suuri
                  ? "0 2px 12px rgba(0,0,0,0.9)"
                  : undefined,
          // 画像の上では、読みやすいよう帯を敷く
          backgroundColor: onImage ? band : undefined,
          boxShadow: onImage ? `0 0 0 14px ${band}` : undefined,
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          borderRadius: 4,
        }}
      >
        {nodes}
      </span>
    </div>
  );
};

export const Main: React.FC<{ data: ScenesData }> = ({ data }) => {
  const isAshi = data.preset === "ashi";
  const isManabi = data.preset === "manabi";
  const isRekishi = data.preset === "rekishi";
  const isKouzou = data.preset === "kouzou";
  const isKeizai = data.preset === "keizai";
  const isSuuri = data.preset === "suuri";
  const isKarakuri = data.preset === "karakuri";
  // suuri: 同じ絵の2回目以降は姿を変える (絵が育つ仕組み)
  const suuriVariants = isSuuri ? computeSuuriVariants(data.scenes) : [];
  // suuri: 寿司の場面だけ和紙背景にする (題材から場面ごとに判定)
  const suuriWashi = isSuuri ? computeSuuriWashi(data.scenes) : [];
  // suuri (キラキラ回): 第1章の野球の場面だけ夜の球場背景 (和紙が優先)
  const suuriStadium = isSuuri ? computeSuuriStadium(data.scenes) : [];
  // suuri (恋愛ドレイク回): つかみだけ白ベース+ピンク装飾の恋愛モード背景
  const suuriRenai = isSuuri ? computeSuuriRenai(data.scenes) : [];
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
  const v2Set = isAshi ? ashiV2Indices(data.scenes) : new Set<number>();
  // BGM: 冒頭2秒フェードイン・末尾3秒フェードアウト。音量はナレーションを邪魔しない 7%
  const totalFrames = data.scenes.reduce(
    (a, s) => a + Math.max(Math.ceil(sceneHoldSec(s) * VIDEO.fps), 1),
    0,
  );
  const bgmVolume = (f: number) => {
    const fadeIn = 2 * VIDEO.fps;
    const fadeOut = 3 * VIDEO.fps;
    return (
      0.07 *
      interpolate(f, [0, fadeIn, totalFrames - fadeOut, totalFrames], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  };
  return (
    <AbsoluteFill
      style={{
        backgroundColor: isAshi
          ? AP.background
          : isManabi
            ? MP.background
            : isRekishi
              ? RP.band
              : isKouzou
                ? KP.band
                : isKeizai
                  ? EP.bgTop
                  : isSuuri
                    ? SP.background
                    : isKarakuri
                      ? KRP.paper
                      : PALETTE.background,
      }}
    >
      {data.bgmFile && (
        <Audio loop src={staticFile(data.bgmFile)} volume={bgmVolume} />
      )}
      <Series>
        {data.scenes.map((scene, sceneI) => {
          const frames = Math.max(
            Math.ceil(sceneHoldSec(scene) * VIDEO.fps),
            1,
          );
          const v2 = v2Set.has(scene.index);
          // suuri: オチのある文は、ナレーションがオチを読む瞬間まで字幕も隠す (絵と同期)
          const punch = isSuuri ? splitPunchline(scene) : null;
          return (
            <Series.Sequence
              key={scene.index}
              durationInFrames={frames}
              name={`${scene.index}-${scene.type}`}
            >
              <Audio src={staticFile(scene.audio)} />
              {isAshi ? (
                <AshiV2Context.Provider value={v2}>
                  {v2 ? (
                    <AshiMotion index={scene.index}>
                      <AshiSceneView scene={scene} />
                    </AshiMotion>
                  ) : (
                    <AshiSceneView scene={scene} />
                  )}
                </AshiV2Context.Provider>
              ) : isManabi ? (
                <ManabiSceneView scene={scene} />
              ) : isRekishi ? (
                <RekishiSceneView scene={scene} />
              ) : isKouzou ? (
                <KouzouSceneView scene={scene} />
              ) : isKeizai ? (
                <KeizaiSceneView scene={scene} />
              ) : isSuuri ? (
                <WashiCtx.Provider value={suuriWashi[sceneI] ?? false}>
                  <StadiumCtx.Provider value={suuriStadium[sceneI] ?? false}>
                    <RenaiCtx.Provider value={suuriRenai[sceneI] ?? false}>
                      <SuuriSceneView scene={scene} variant={suuriVariants[sceneI] ?? 0} />
                    </RenaiCtx.Provider>
                  </StadiumCtx.Provider>
                </WashiCtx.Provider>
              ) : isKarakuri ? (
                scene.motif.startsWith("j2_") ? (
                  <J2SceneInVideo motif={scene.motif} />
                ) : isWatashiMotif(scene.motif) ? (
                  <WSceneInVideo motif={scene.motif} />
                ) : (
                  <KarakuriSceneView scene={scene} />
                )
              ) : (
                <SceneView scene={scene} />
              )}
              {/* manabi/rekishi/kouzou/keizai/suuri: カードが全文を大きく見せるときは字幕を重ねない (二重表示を防ぐ) */}
              {!(isManabi && manabiCardShowsFullText(scene)) &&
                !(isRekishi && rekishiCardShowsFullText(scene)) &&
                !(isKouzou && kouzouCardShowsFullText(scene)) &&
                !(isKeizai && keizaiCardShowsFullText(scene)) &&
                !(isSuuri && suuriCardShowsFullText(scene)) &&
                !(isSuuri && suuriSceneHidesSubtitle(scene)) &&
                !(isKarakuri && karakuriCardShowsFullText(scene)) && (
                <Subtitle
                  text={scene.text}
                  onImage={Boolean(scene.image) && scene.type !== "card" && !isRekishi && !isKouzou && !isKeizai && !isKarakuri}
                  ashi={isAshi}
                  manabi={isManabi}
                  rekishi={isRekishi}
                  kouzou={isKouzou}
                  keizai={isKeizai}
                  suuri={isSuuri}
                  washi={isSuuri && (suuriWashi[sceneI] ?? false)}
                  renai={isSuuri && (suuriRenai[sceneI] ?? false) && scene.motif !== "love_to_black"}
                  karakuri={isKarakuri}
                  highlight={v2 || isKarakuri ? scene.emphasis : undefined}
                  tailReveal={
                    punch
                      ? {
                          headChars: punch.head.length,
                          atFrame: Math.round(punch.ratio * scene.durationSec * VIDEO.fps),
                        }
                      : undefined
                  }
                />
              )}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
