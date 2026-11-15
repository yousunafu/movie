// 作風 sekai「つながる世界史」冒頭3分の **廉価版**。
//
// なぜ作るか: 作り込み版 (boutou-a〜d.tsx / 1枚あたり約169行) と並べて見て、
// 「どこまで手を抜くと耐えられなくなるか」を上司に判断してもらうため。
//
// 廉価版の約束 (作り込み版との差はこの3つだけ)
//   1. カメラは動かさない (Cam を使わない)
//   2. 背景は共通の WarmStage 1種だけ。場面ごとに空や壁を描き分けない
//   3. 主役は共通部品 (world.tsx) を1つ置くだけ。小道具・群衆・事件は足さない
// 変えないもの: キャラ (灰色の無貌シルエット)・色の決まり (墨+生成り+錆朱)・線・声・字幕。
// → つまり「同じ声で同じ台本を、絵の密度だけ落として読む」比較になる。
//
// 1枚あたり約12行。型は7つしかなく、39文をその7つに割り振っているだけ。

import React from "react";
import {
  SKP,
  SEKAI_SERIF,
  GhostFigure,
  seg,
  easeOut,
  W,
  H,
} from "./parts";
import {
  WP,
  WarmStage,
  SekaiMap,
  SekaiChrono,
  SekaiGlobe,
  SekaiCup,
  SekaiPodium,
  CrossMark,
} from "./world";
import type { SekaiArt, MapLand, EraKey, MonthKey } from "./world";
import { GROUP_END } from "./ending";
import { SekaiArtMapContext } from "./SekaiScenes";
import { Main } from "../Video";
import type { ScenesData } from "../../types";

// ===================================================================
// 型は7つだけ
// ===================================================================
type Spec =
  | { k: "globe"; link?: boolean }
  | {
      k: "map";
      lit?: Partial<Record<MapLand, number>>;
      arcs?: { from: MapLand; to: MapLand; at?: number; hit?: boolean }[];
      focus?: MapLand;
    }
  | { k: "chrono"; at: EraKey; from?: EraKey; month?: MonthKey; monthFrom?: MonthKey }
  | { k: "figure"; names: string[]; cross?: boolean }
  | { k: "thing"; what: "cup" | "podium" | "radio" | "cupPodium"; cross?: boolean }
  | { k: "word"; text: string; cross?: boolean }
  | { k: "plain" }; // 反応の通知カードが主役の文。絵は舞台だけ

// 廉価版のラジオ。箱と目盛りと格子だけ。作り込み版のような木目や埃は描かない
const CheapRadio: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 0, 24));
  return (
    <g opacity={t} transform="translate(960 600)">
      <rect x={-250} y={-170} width={500} height={340} rx={16} fill={WP.wood} stroke={WP.line} strokeWidth={5} />
      <rect x={-250} y={-170} width={500} height={12} fill={WP.rim} opacity={0.4} />
      <rect x={-205} y={-120} width={250} height={240} rx={8} fill={WP.shadowDeep} stroke={WP.line} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-195} y1={-106 + i * 28} x2={35} y2={-106 + i * 28} stroke={WP.woodDark} strokeWidth={5} />
      ))}
      <circle cx={140} cy={-40} r={62} fill={WP.shadowDeep} stroke={WP.rim} strokeWidth={4} />
      <line x1={140} y1={-40} x2={140 + Math.cos(f / 22) * 44} y2={-40 + Math.sin(f / 22) * 44} stroke={WP.amberLit} strokeWidth={6} />
      <rect x={70} y={60} width={140} height={46} rx={6} fill={WP.shadowDeep} stroke={WP.line} strokeWidth={3} />
    </g>
  );
};

// 大きな文字1語。廉価版はこれで「言いたいこと」を直接出す
const CheapWord: React.FC<{ text: string; f: number }> = ({ text, f }) => {
  const t = easeOut(seg(f, 2, 26));
  return (
    <g opacity={t}>
      <rect x={W / 2 - 300 * t} y={430} width={600 * t} height={3.4} fill={SKP.sabi} />
      <text
        x={W / 2}
        y={620}
        textAnchor="middle"
        fontFamily={SEKAI_SERIF}
        fontSize={text.length > 9 ? 86 : 116}
        fontWeight={700}
        fill={SKP.kinari}
        letterSpacing={8}
      >
        {text}
      </text>
      <rect x={W / 2 - 300 * t} y={700} width={600 * t} height={3.4} fill={SKP.sabi} />
    </g>
  );
};

// 仕様を1枚の絵にする。ここが廉価版の全部
const CheapBody: React.FC<{ spec: Spec; uid: string; f: number }> = ({ spec, uid, f }) => {
  switch (spec.k) {
    case "globe":
      return <SekaiGlobe f={f} uid={uid} linkAt={spec.link ? 30 : undefined} />;
    case "map":
      return (
        <SekaiMap f={f} uid={uid} lit={spec.lit} arcs={spec.arcs} focus={spec.focus} zoom={spec.focus ? 1.5 : 1} />
      );
    case "chrono":
      return (
        <SekaiChrono f={f} at={spec.at} from={spec.from} month={spec.month} monthFrom={spec.monthFrom} y={560} />
      );
    case "figure":
      return (
        <>
          {spec.names.map((n, i) => (
            <GhostFigure
              key={n + i}
              x={W / 2 + (i - (spec.names.length - 1) / 2) * 360}
              y={H / 2 + 90}
              s={1.35}
              name={n}
              f={f}
            />
          ))}
          {/* ×は最後に挙げた人の上に置く。2人いるときに真ん中へ置くと
              「2人とも死んだ」に読めてしまう (#36 妻を亡くした、で実際にそう見えた) */}
          {spec.cross && (
            <CrossMark
              x={W / 2 + ((spec.names.length - 1) / 2) * 360}
              y={H / 2 + 20}
              r={160}
              f={f}
              at={28}
            />
          )}
        </>
      );
    case "thing":
      return (
        <>
          {(spec.what === "podium" || spec.what === "cupPodium") && (
            <SekaiPodium x={960} y={820} s={1.2} f={f} uid={uid} mic={spec.what === "podium"} drape />
          )}
          {/* 杯を演説台に載せるときは小さく・高く。大きいままだと台にめり込んで見える */}
          {(spec.what === "cup" || spec.what === "cupPodium") && (
            <SekaiCup
              x={960}
              y={spec.what === "cupPodium" ? 486 : 620}
              s={spec.what === "cupPodium" ? 0.74 : 1.5}
              f={f}
              uid={uid}
              hands={spec.what === "cup"}
              reflect="none"
            />
          )}
          {spec.what === "radio" && <CheapRadio f={f} />}
          {spec.cross && <CrossMark x={960} y={600} r={190} f={f} at={30} />}
        </>
      );
    case "word":
      return (
        <>
          <CheapWord text={spec.text} f={f} />
          {spec.cross && <CrossMark x={W / 2} y={566} r={200} f={f} at={32} />}
        </>
      );
    case "plain":
      return null;
  }
};

// 背景は全文これ1種。光源も動かさない (ここが一番の節約)
const makeArt = (spec: Spec, uid: string): SekaiArt => {
  const Art: SekaiArt = ({ f }) => (
    <WarmStage f={f} uid={uid} src={[960, 200]} srcR={780} motes={14} vig={0.86}>
      <CheapBody spec={spec} uid={uid} f={f} />
    </WarmStage>
  );
  return Art;
};

// ===================================================================
// 39文の割り振り。1文1行
// ===================================================================
const TABLE: Spec[] = [
  /* 01 人の心は変わらない   */ { k: "globe" },
  /* 02 歴史は手がかり       */ { k: "globe", link: true },
  /* 03 つながる世界史       */ { k: "word", text: "つながる世界史" },
  /* 04 1945年8月15日正午    */ { k: "chrono", at: "1945" },
  /* 05 ラジオから雑音       */ { k: "thing", what: "radio" },
  /* 06 初めて聞く天皇の声   */ { k: "figure", names: ["国民", "国民", "国民"] },
  /* 07 堪え難きを堪え       */ { k: "word", text: "堪え難きを堪え" },
  /* 08 戦争をやめました     */ { k: "word", text: "一億玉砕", cross: true },
  /* 09 43年後の1988年       */ { k: "chrono", at: "1988", from: "1945" },
  /* 10 イランでも同じこと   */ { k: "map", lit: { iran: 1, japan: 0.5 } },
  /* 11 ホメイニが停戦受諾   */ { k: "figure", names: ["ホメイニ"] },
  /* 12 毒の杯を飲み干した   */ { k: "thing", what: "cup" },
  /* 13 (反応)               */ { k: "plain" },
  /* 14 誰かがやめると言う   */ { k: "word", text: "ここでやめる" },
  /* 15 そして2026年         */ { k: "chrono", at: "2026", from: "1988" },
  /* 16 最高指導者を殺された */ { k: "figure", names: ["最高指導者"], cross: true },
  /* 17 息子は姿を見せない   */ { k: "figure", names: ["モジタバ"] },
  /* 18 声の録音も非公開     */ { k: "thing", what: "radio", cross: true },
  /* 19 ほぼ文書だけ         */ { k: "word", text: "文書だけ" },
  /* 20 玉音とは声のこと     */ { k: "word", text: "玉音 = 声" },
  /* 21 毒杯と言える声は     */ { k: "thing", what: "cupPodium" },
  /* 22 忠臣蔵なのか         */ { k: "chrono", at: "1701", from: "2026" },
  /* 23 日本人が制裁を受けた */ { k: "map", lit: { japan: 1, usa: 0.8 }, arcs: [{ from: "usa", to: "japan", at: 24, hit: true }] },
  /* 24 (反応)               */ { k: "plain" },
  /* 25 最後にひとつにつながる*/ { k: "globe", link: true },
  /* 26 同じものとして扱わない*/ { k: "word", text: "同じもの", cross: true },
  /* 27 型を比べる話         */ { k: "word", text: "負けの「型」" },
  /* 28 (反応)               */ { k: "plain" },
  /* 29 60秒でおさらい       */ { k: "word", text: "60秒でおさらい" },
  /* 30 2月28日              */ { k: "chrono", at: "2026", month: "2月28日" },
  /* 31 米・イスラエルが空爆 */ { k: "map", lit: { iran: 1, usa: 0.7, israel: 0.7 }, arcs: [{ from: "usa", to: "iran", at: 20, hit: true }, { from: "israel", to: "iran", at: 34, hit: true }] },
  /* 32 ハメネイ師死亡       */ { k: "figure", names: ["アリー・ハメネイ"], cross: true },
  /* 33 ラマダン10日目       */ { k: "word", text: "ラマダン10日目" },
  /* 34 3月                  */ { k: "chrono", at: "2026", month: "3月", monthFrom: "2月28日" },
  /* 35 後継はモジタバ師     */ { k: "figure", names: ["モジタバ"] },
  /* 36 本人も負傷し妻を失う */ { k: "figure", names: ["モジタバ", "妻"], cross: true },
  /* 37 ホルムズ海峡を封鎖   */ { k: "map", focus: "iran", lit: { iran: 1 } },
  /* 38 石油の5分の1         */ { k: "word", text: "5分の1" },
  /* 39 ガソリン170円        */ { k: "word", text: "170円" },
];

const CHEAP_ART_MAP: Record<string, SekaiArt> = {
  ...Object.fromEntries(
    TABLE.map((spec, i) => {
      const no = String(i + 1).padStart(2, "0");
      return [`sekai_${no}`, makeArt(spec, `cp${no}`)];
    }),
  ),
  // 終わりの1枚だけは作り込み版と同じ物を使う (チャンネルの顔なので差をつけない)
  ...GROUP_END,
};

export const CHEAP_ART = CHEAP_ART_MAP;

// 本編と同じ台本・同じ音声・同じ字幕のまま、絵の台帳だけ差し替えて回す。
// レンダ: npx remotion render MainCheap out/廉価版.mp4
export const MainCheap: React.FC<{ data: ScenesData }> = ({ data }) => (
  <SekaiArtMapContext.Provider value={CHEAP_ART_MAP}>
    <Main data={data} />
  </SekaiArtMapContext.Provider>
);
