// 冒頭3分39枚の確認用。1枚 SHOT フレームずつ順番に流す。
// 担当ごとに別コンポジションにしてあるので、自分の10枚だけを見られる。
//
//   npx remotion still SekaiSheetA tmp/a31.png --frame=31
//   npx remotion render SekaiSheetA tmp/a --sequence --frames=0-599 --image-format=png --scale=0.5
//
// 本番 (Main) はここを通らない。ここは絵を目で見るための台。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SKP, SEKAI_FONT, SEKAI_SERIF, NotifyCard, isReaction, W, H } from "./parts";
import {
  WarmStage,
  SekaiMap,
  SekaiChrono,
  SekaiGlobe,
  SekaiCup,
  SekaiPodium,
  CrossMark,
} from "./world";
import { SekaiZonedArt, SEKAI_ZONES } from "./SekaiScenes";

// 台本の39文。並び順は台本のまま。絵の key は sekai_01 … sekai_39。
export const BOUTOU_TEXT: string[] = [
  "時代が違っても、国が違っても、人の心は変わらない。",
  "だから歴史は、今日のニュースを読む手がかりになる。",
  "つながる世界史。",
  "1945年8月15日、正午。",
  "ラジオから、雑音まじりの声が流れました。",
  "多くの日本人にとって、初めて聞く天皇の声でした。",
  "その中に、「堪え難きを堪え、忍び難きを忍び」という一節がありました。",
  "一億玉砕を叫んでいた国が、この日、戦争をやめました。",
  "43年後の1988年。",
  "イランでも、同じことが起きます。",
  "最後まで「勝つまでやめない」と言い続けた最高指導者ホメイニが、停戦を受け入れたのです。",
  "そのとき読み上げられた言葉が、「私は、毒の杯を飲み干した」。",
  "「一番強気だった人が、最後に負けを引き受けてる……」",
  "そうです。戦争は、負ける側の誰かが「ここでやめる」と言わなければ、終わりません。",
  "そして2026年。",
  "イランは、その最高指導者を、戦争で殺されました。",
  "後を継いだ息子は、8か月たった今も、公の場に姿を見せていません。",
  "声の録音も、公開されていないと報じられています。",
  "メッセージは、ほぼ文書だけです。",
  "玉音放送の「玉音」とは、声のことです。",
  "今のイランに、毒杯を飲むと言える「声」はあるのか。",
  "それとも始まるのは、主君を討たれた家臣たちの、忠臣蔵なのか。",
  "さらに、この戦争の裏側で、ひとりの日本人がアメリカから制裁を受けています。",
  "「え、日本人が？ 何をしたの？」",
  "その話も、最後にひとつにつながります。",
  "先にお断りすると、これは国や宗教を同じものとして扱う話ではありません。",
  "人間が負けを受け入れるときの「型」を比べる話です。",
  "「そもそも、今どうなってるんだっけ？」",
  "60秒でおさらいします。",
  "2月28日。",
  "アメリカとイスラエルが、イランを空爆しました。",
  "最高指導者の公邸が攻撃され、36年以上頂点にいたアリー・ハメネイ師が死亡。",
  "イランの暦では、断食月ラマダンの10日目でした。",
  "3月。",
  "後継に選ばれたのは、息子のモジタバ師です。",
  "本人もこの攻撃で負傷し、妻を亡くしたと報じられています。",
  "イランは反撃し、ホルムズ海峡を封鎖しました。",
  "世界の石油のおよそ5分の1が通る、海の道です。",
  "日本のガソリンが補助金で170円前後に抑え込まれているのは、このためです。",
];

// 1枚ぶんの持ち時間。本番の尺とは関係ない (絵の動きが見える長さにしてある)
export const SHOT = 60;

const key = (n: number) => `sekai_${String(n).padStart(2, "0")}`;

const Band: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      backgroundColor: "rgba(21, 17, 14, 0.93)",
      borderTop: `3px solid ${SKP.sabi}`,
      padding: "20px 0 24px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        margin: "0 auto",
        width: "88%",
        fontFamily: SEKAI_FONT,
        fontSize: 42,
        fontWeight: 600,
        color: SKP.kinari,
        lineHeight: 1.5,
        letterSpacing: 1,
      }}
    >
      {text}
    </div>
  </div>
);

// 何枚目を見ているか。確認用なので本番には出ない
const Stamp: React.FC<{ n: number }> = ({ n }) => (
  <div
    style={{
      position: "absolute",
      top: 22,
      left: 28,
      fontFamily: SEKAI_SERIF,
      fontSize: 34,
      fontWeight: 700,
      color: SKP.sabi,
      backgroundColor: "rgba(21, 17, 14, 0.8)",
      padding: "6px 18px",
      borderRadius: 6,
      letterSpacing: 2,
    }}
  >
    #{n}
  </div>
);

// いまどの「色の世界」かを出す。確認用なので本番には出ない
const ZoneStamp: React.FC<{ n: number }> = ({ n }) => {
  const z = SEKAI_ZONES.find((s) => n >= s.from && n <= s.to);
  if (!z) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        right: 28,
        fontFamily: SEKAI_FONT,
        fontSize: 26,
        fontWeight: 600,
        color: SKP.kinari,
        backgroundColor: "rgba(21, 17, 14, 0.8)",
        border: `2px solid ${SKP.sabi}`,
        padding: "6px 18px",
        borderRadius: 6,
        letterSpacing: 1,
      }}
    >
      {z.name}　#{z.from}–{z.to}
    </div>
  );
};

const Sheet: React.FC<{ nums: number[] }> = ({ nums }) => {
  const f = useCurrentFrame();
  const i = Math.min(Math.floor(f / SHOT), nums.length - 1);
  const n = nums[i];
  const local = f - i * SHOT;
  const text = BOUTOU_TEXT[n - 1] ?? "";
  const reaction = isReaction(text);
  return (
    <AbsoluteFill style={{ backgroundColor: SKP.sumiDeep }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute" }}
      >
        <SekaiZonedArt motif={key(n)} f={local} />
      </svg>
      {reaction ? (
        <NotifyCard text={text} f={local - 8} expr="surprise" />
      ) : (
        <Band text={text} />
      )}
      <Stamp n={n} />
      <ZoneStamp n={n} />
    </AbsoluteFill>
  );
};

const range = (a: number, b: number) =>
  Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const SekaiSheetA: React.FC = () => <Sheet nums={range(1, 10)} />;
export const SekaiSheetB: React.FC = () => <Sheet nums={range(11, 20)} />;
export const SekaiSheetC: React.FC = () => <Sheet nums={range(21, 30)} />;
export const SekaiSheetD: React.FC = () => <Sheet nums={range(31, 39)} />;
export const SekaiSheetAll: React.FC = () => <Sheet nums={range(1, 39)} />;

// 共通部品の見本。world.tsx を直したらここで目で確かめる。
// 1枚70フレーム: 地図 / 地図の寄り / 年表 / 年表の下段 / 地球 / 杯 / 演説台 / ×
const CATA = 70;
const CATA_LABEL = [
  "SekaiMap  lit + arcs",
  "SekaiMap  focus=iran zoom=3.4",
  "SekaiChrono  1945→1988",
  "SekaiChrono  下段 2月28日→3月",
  "SekaiGlobe  4灯 + 線",
  "SekaiCup  hands reflect=self",
  "SekaiPodium  mic drape",
  "WarmStage + CrossMark",
];

const CataPanel: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  if (i === 0)
    return (
      <SekaiMap
        f={f}
        uid="cat0"
        lit={{ usa: 0, israel: 10, japan: 18, iran: 26 }}
        arcs={[
          { from: "japan", to: "iran", at: 34 },
          { from: "usa", to: "iran", at: 42, hit: true },
        ]}
      />
    );
  if (i === 1)
    return <SekaiMap f={f} uid="cat1" lit={{ iran: 0 }} focus="iran" zoom={3.4} />;
  if (i === 2) return <SekaiChrono f={f} at="1988" from="1945" />;
  if (i === 3) return <SekaiChrono f={f} at="2026" month="3月" monthFrom="2月28日" />;
  if (i === 4)
    return <SekaiGlobe f={f} uid="cat4" lightAt={[0, 10, 20, 30]} linkAt={34} />;
  if (i === 5)
    return (
      <WarmStage f={f} uid="cat5" src={[960, 140]}>
        <SekaiCup x={960} y={560} s={1.6} f={f} uid="cat5c" hands />
      </WarmStage>
    );
  if (i === 6)
    return (
      <WarmStage f={f} uid="cat6" src={[960, 120]}>
        <SekaiPodium x={960} y={860} s={1.5} f={f} uid="cat6p" mic drape />
      </WarmStage>
    );
  return (
    <WarmStage f={f} uid="cat7" src={[400, 160]}>
      <CrossMark x={960} y={520} r={240} f={f} at={14} w={22} />
    </WarmStage>
  );
};

export const SekaiWorldCatalog: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(Math.floor(f / CATA), CATA_LABEL.length - 1);
  const local = f - i * CATA;
  return (
    <AbsoluteFill style={{ backgroundColor: SKP.sumiDeep }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute" }}
      >
        <CataPanel i={i} f={local} />
      </svg>
      <Band text={CATA_LABEL[i]} />
    </AbsoluteFill>
  );
};

export const WORLD_CATALOG_FRAMES = CATA_LABEL.length * CATA;

export const SHEET_A_FRAMES = 10 * SHOT;
export const SHEET_B_FRAMES = 10 * SHOT;
export const SHEET_C_FRAMES = 10 * SHOT;
export const SHEET_D_FRAMES = 9 * SHOT;
export const SHEET_ALL_FRAMES = 39 * SHOT;
