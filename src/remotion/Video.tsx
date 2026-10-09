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
import { SuuriSceneView, SP, SUURI_FONT, suuriCardShowsFullText, computeSuuriVariants } from "./suuri/SuuriScenes";

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

const Subtitle: React.FC<{
  text: string;
  onImage?: boolean;
  ashi?: boolean;
  manabi?: boolean;
  rekishi?: boolean;
  kouzou?: boolean;
  keizai?: boolean;
  suuri?: boolean;
  highlight?: string;
}> = ({ text, onImage, ashi, manabi, rekishi, kouzou, keizai, suuri, highlight }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  // 強調語 (emphasis) が字幕の中にあれば、その部分だけ黄色にする
  const hl = highlight?.replace(/[「」]/g, "").trim();
  const useHl = Boolean(hl && hl.length >= 2 && text.includes(hl!));
  const nodes: React.ReactNode[] = [];
  if (useHl) {
    text.split(hl!).forEach((part, i, arr) => {
      jaParser.parse(part).forEach((chunk, j) => {
        nodes.push(
          <span key={`${i}-${j}`} style={{ display: "inline-block" }}>
            {chunk}
          </span>,
        );
      });
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
    jaParser.parse(text).forEach((chunk, i) => {
      nodes.push(
        <span key={i} style={{ display: "inline-block" }}>
          {chunk}
        </span>,
      );
    });
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
          color: ashi ? AP.sub : manabi ? MP.ink : suuri ? SP.ink : PALETTE.subtitle,
          lineHeight: 1.55,
          textShadow: ashi || manabi || suuri ? "0 2px 12px rgba(0,0,0,0.9)" : undefined,
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
  // suuri: 同じ絵の2回目以降は姿を変える (絵が育つ仕組み)
  const suuriVariants = isSuuri ? computeSuuriVariants(data.scenes) : [];
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
    (a, s) =>
      a + Math.max(Math.ceil((s.durationSec + VIDEO.scenePaddingSec) * VIDEO.fps), 1),
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
                    : PALETTE.background,
      }}
    >
      {data.bgmFile && (
        <Audio loop src={staticFile(data.bgmFile)} volume={bgmVolume} />
      )}
      <Series>
        {data.scenes.map((scene, sceneI) => {
          const frames = Math.max(
            Math.ceil(
              (scene.durationSec + VIDEO.scenePaddingSec) * VIDEO.fps,
            ),
            1,
          );
          const v2 = v2Set.has(scene.index);
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
                <SuuriSceneView scene={scene} variant={suuriVariants[sceneI] ?? 0} />
              ) : (
                <SceneView scene={scene} />
              )}
              {/* manabi/rekishi/kouzou/keizai/suuri: カードが全文を大きく見せるときは字幕を重ねない (二重表示を防ぐ) */}
              {!(isManabi && manabiCardShowsFullText(scene)) &&
                !(isRekishi && rekishiCardShowsFullText(scene)) &&
                !(isKouzou && kouzouCardShowsFullText(scene)) &&
                !(isKeizai && keizaiCardShowsFullText(scene)) &&
                !(isSuuri && suuriCardShowsFullText(scene)) && (
                <Subtitle
                  text={scene.text}
                  onImage={Boolean(scene.image) && scene.type !== "card" && !isRekishi && !isKouzou && !isKeizai}
                  ashi={isAshi}
                  manabi={isManabi}
                  rekishi={isRekishi}
                  kouzou={isKouzou}
                  keizai={isKeizai}
                  suuri={isSuuri}
                  highlight={v2 ? scene.emphasis : undefined}
                />
              )}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
