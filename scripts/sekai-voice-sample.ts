// 声の聞き比べ用サンプルを作る。デスクトップの「つながる世界史_声サンプル」に並べる。
//   npx tsx scripts/sekai-voice-sample.ts
import fs from "node:fs";
import path from "node:path";

const HOST = "http://127.0.0.1:50021";
const OUT = "/Users/suzukiyuu/Desktop/つながる世界史_声サンプル";

// ナレーション (天の声) の候補。文は冒頭の1文目
const NARRATION = "時代が違っても、国が違っても、人の心は変わらない。";
const NARR: [string, string, number][] = [
  ["青山龍星", "しっとり", 0.92], // ← 今回の採用
  ["青山龍星", "ノーマル", 0.92], // 前の設定
  ["雀松朱司", "ノーマル", 0.92],
  ["麒ヶ島宗麟", "ノーマル", 0.92],
];

// 反応役 (新人記者) の候補。文は #24
const REACTION = "え、にほんじんが？ 何をしたの？";
const REACT: [string, string, number][] = [
  ["冥鳴ひまり", "ノーマル", 1.0], // ← 今回の採用
  ["春日部つむぎ", "ノーマル", 1.0],
  ["No.7", "ノーマル", 1.0],
  ["九州そら", "ノーマル", 1.0],
  ["WhiteCUL", "ノーマル", 1.0],
];

type Sp = { name: string; styles: { name: string; id: number }[] };

const main = async () => {
  const speakers = (await (await fetch(`${HOST}/speakers`)).json()) as Sp[];
  const idOf = (name: string, style: string) => {
    const sp = speakers.find((s) => s.name === name);
    if (!sp) throw new Error(`声が無い: ${name}`);
    const st = sp.styles.find((s) => s.name === style);
    if (!st) throw new Error(`スタイルが無い: ${name}/${style}`);
    return st.id;
  };

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const make = async (
    kind: string,
    no: number,
    text: string,
    [name, style, speed]: [string, string, number],
    intonation: number,
  ) => {
    const id = idOf(name, style);
    const q = await (
      await fetch(`${HOST}/audio_query?speaker=${id}&text=${encodeURIComponent(text)}`, {
        method: "POST",
      })
    ).json();
    q.speedScale = speed;
    q.intonationScale = intonation;
    q.prePhonemeLength = 0.1;
    q.postPhonemeLength = 0.3;
    const wav = Buffer.from(
      await (
        await fetch(`${HOST}/synthesis?speaker=${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(q),
        })
      ).arrayBuffer(),
    );
    const mark = no === 1 ? "★採用_" : "";
    const file = path.join(OUT, `${kind}${no}_${mark}${name}_${style}.wav`);
    fs.writeFileSync(file, wav);
    console.log(`  ${path.basename(file)}`);
  };

  console.log("■ ナレーション (天の声) の候補");
  for (let i = 0; i < NARR.length; i++) await make("ナレーション", i + 1, NARRATION, NARR[i], 1.0);
  console.log("■ 新人記者 (反応役) の候補");
  for (let i = 0; i < REACT.length; i++) await make("記者", i + 1, REACTION, REACT[i], 1.15);
  console.log(`\n→ ${OUT}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
