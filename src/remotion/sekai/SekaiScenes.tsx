// 作風 sekai (つながる世界史) の場面描画。
// 絵は1文1演出で専用に作る (キット禁止)。motif (sekai_01 … sekai_39) で引く。
// 絵の正本は boutou-a/b/c/d.tsx。ここは引いて並べるだけ。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Scene } from "../../types";
import type { SekaiArt } from "./world";
import { GROUP_A } from "./boutou-a";
import { GROUP_B } from "./boutou-b";
import { GROUP_C } from "./boutou-c";
import { GROUP_D } from "./boutou-d";
import { GROUP_END } from "./ending";
import {
  SKP,
  SEKAI_FONT,
  SEKAI_SERIF,
  SekaiGround,
  NotifyCard,
  YearTag,
  isReaction,
  easeOut,
  seg,
  W,
  H,
} from "./parts";

// 反応のセリフは通知カードが本文を見せるので、下の字幕は出さない (二重表示を防ぐ)
export const sekaiReactionHidesSubtitle = (scene: Scene): boolean =>
  isReaction(scene.text);

// 章扉カードは文字が主役なので字幕を重ねない
export const sekaiCardShowsFullText = (scene: Scene): boolean =>
  scene.type === "card" && (scene.motif === "chapter" || scene.motif === "title");

const ChapterCard: React.FC<{ scene: Scene; f: number }> = ({ scene, f }) => {
  const t = easeOut(seg(f, 4, 26));
  const line = easeOut(seg(f, 14, 44));
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: SEKAI_SERIF,
          fontSize: 78,
          fontWeight: 700,
          color: SKP.kinari,
          letterSpacing: 6,
          opacity: t,
          transform: `translateY(${(1 - t) * 18}px)`,
          textAlign: "center",
          maxWidth: 1500,
          lineHeight: 1.4,
        }}
      >
        {scene.title ?? scene.text}
      </div>
      <div
        style={{
          marginTop: 34,
          width: 520 * line,
          height: 5,
          backgroundColor: SKP.sabi,
        }}
      />
    </AbsoluteFill>
  );
};

// 専用の絵がまだ無い文は、墨の背景の上に本文の核だけを置く。
// 素の背景に文字を浮かせるのは暫定であって完成形ではない (6点法②)。
const Pending: React.FC<{ scene: Scene; f: number }> = ({ scene, f }) => {
  const t = easeOut(seg(f, 0, 18));
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity: t * 0.5 }}
    >
      <div
        style={{
          fontFamily: SEKAI_FONT,
          fontSize: 38,
          color: SKP.kinariDim,
          border: `2px dashed ${SKP.haiDark}`,
          padding: "22px 40px",
          borderRadius: 8,
        }}
      >
        絵 未実装: {scene.motif}
      </div>
    </AbsoluteFill>
  );
};

// 絵の正本。motif の文字列でここから引く
export const ALL_ART: Record<string, SekaiArt> = {
  ...GROUP_A,
  ...GROUP_B,
  ...GROUP_C,
  ...GROUP_D,
  ...GROUP_END,
};

// 絵の台帳を差し替えられるようにしておく。既定は上の作り込み版。
// 廉価版 (cheap.tsx) は同じ台本・同じ声のまま、この台帳だけを CHEAP_ART に入れ替えて回す。
export const SekaiArtMapContext =
  React.createContext<Record<string, SekaiArt>>(ALL_ART);

// ── 色は「物の色」で入れる ──────────────────────────────────────────
// ★2026-11-09 作者指摘でやり方を入れ替えた。
//
// 一度目の失敗: 画面全体に feColorMatrix を掛けて区間ごとに色相をまわした。
// 画面は確かに変わったが、空も顔も机も同じ方向に転ぶので「色を塗った写真」ではなく
// 「色セロハンを貼った写真」になった。作者評「全然違う。ちゃんと写真に撮ったように
// 適切なものに適切な色を入れろって言ってんの」。
//
// 正しいやり方: 全体フィルタは掛けない。**物ごとに本当の色を置く**。
// 夜空は紺、海は青、炎は橙、血は赤、畳は萌黄、雪は白、紙は生成り、看板は赤と緑。
// 場面が変わって見えるのは、その場面に実際にある物の色が違うから。
// 色の決め方は world.tsx の WP (物の色の台帳) を見ること。
//
// 区間 (ゾーン) はもう色を決めない。「どの場面か」を人間が確認するための目次として残す。
export type SekaiZone = {
  name: string;
  from: number; // 文番号 (1始まり・この番号を含む)
  to: number;
};

export const SEKAI_ZONES: SekaiZone[] = [
  { name: "導入 夜の地球", from: 1, to: 3 },
  { name: "1945 日本 玉音放送", from: 4, to: 8 },
  { name: "1988 イラン 毒の杯", from: 9, to: 14 },
  { name: "2026 戦争と忠臣蔵", from: 15, to: 22 },
  { name: "前置き 断りと問い", from: 23, to: 29 },
  { name: "60秒おさらい 報道", from: 30, to: 39 },
];

const MOTIF_NO = /^sekai_(\d{2})$/;

export const sekaiZoneOf = (motif?: string): SekaiZone | undefined => {
  const m = motif?.match(MOTIF_NO);
  if (!m) return undefined;
  const n = Number(m[1]);
  return SEKAI_ZONES.find((z) => n >= z.from && n <= z.to);
};

// ── 塗りの層 ────────────────────────────────────────────────────────
// ★2026-11-09 作者指摘「AIっぽすぎる・作り込んでない」への手当ての1つめ。
//
// AIっぽく見える正体の半分は「線が定規で引いたように真っ直ぐで、面が
// ベタ一色で、画面のどこを拡大しても同じ密度」であること。手で描いた絵は
// 線が微妙に揺れ、絵の具が紙の目に乗ってムラになる。
//
// そこで絵の一番外側に3枚かぶせる:
//   ①線の揺れ  feTurbulence + feDisplacementMap を絵全体に (scale 3前後)
//   ②紙の目    細かいノイズを overlay で薄く
//   ③かすれ    粗いノイズを multiply で薄く。塗りの濃淡のムラになる
//
// ここは Main・MainCheap・SekaiSheet のすべてが通る1か所なので、
// 直すときは必ずここだけを直す (各絵に書き足さない)。
//
// 注意: ①で画面の端に透明の隙間ができるので、揺らす前に墨の無地を1枚敷く。
const InkLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const uid = React.useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <filter
          id={`${uid}-wob`}
          x="-3%"
          y="-3%"
          width="106%"
          height="106%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0036"
            numOctaves={2}
            seed={11}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={3.2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.74" numOctaves={3} seed={5} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <filter id={`${uid}-mura`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves={3} seed={23} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      {/* 揺らすと端に透明の隙間が出るので、下に墨を敷いておく */}
      <rect x={0} y={0} width={W} height={H} fill={SKP.sumi} />
      <g filter={`url(#${uid}-wob)`}>{children}</g>
      {/* 塗りのムラ。大きい斑で絵の具の乗りを不均一にする */}
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        filter={`url(#${uid}-mura)`}
        opacity={0.1}
        style={{ mixBlendMode: "multiply" }}
      />
      {/* 紙の目。細かいノイズ。物の色は変えず明暗だけ動かす */}
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        filter={`url(#${uid}-grain)`}
        opacity={0.13}
        style={{ mixBlendMode: "overlay" }}
      />
    </>
  );
};

// 絵をそのまま描く。色は絵の中で付ける (全体フィルタは掛けない)。
// 塗りの層だけは全部の絵に等しく掛ける (手描きの質感の床)。
export const SekaiZonedArt: React.FC<{ motif?: string; f: number }> = ({
  motif,
  f,
}) => {
  const map = React.useContext(SekaiArtMapContext);
  const Art = motif ? map[motif] : undefined;
  return <InkLayer>{Art ? <Art f={f} /> : <SekaiGround f={f} />}</InkLayer>;
};

export const SekaiSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const map = React.useContext(SekaiArtMapContext);
  const reaction = isReaction(scene.text);
  const Art = scene.motif ? map[scene.motif] : undefined;
  return (
    <AbsoluteFill>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute" }}
      >
        <SekaiZonedArt motif={scene.motif} f={f} />
        {scene.title && scene.type !== "card" && (
          <YearTag year={scene.title} f={f} />
        )}
      </svg>
      {sekaiCardShowsFullText(scene) && <ChapterCard scene={scene} f={f} />}
      {!Art && !sekaiCardShowsFullText(scene) && <Pending scene={scene} f={f} />}
      {reaction && <NotifyCard text={scene.text} f={f} />}
    </AbsoluteFill>
  );
};
