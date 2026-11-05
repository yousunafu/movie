// 台本282文を VOICEVOX に「どう読むつもりか」カナで吐かせて、誤読を耳で聞く前にあぶり出す。
//
//   使い方:  npx tsx scripts/koso-yomi-check.ts docs/koso-script-v7.txt
//            npx tsx scripts/koso-yomi-check.ts docs/koso-script-v7.txt --all   (全文のカナを出す)
//
// なぜこれを作ったか:
//   282文を1本ずつ聞くと1時間以上かかる。VOICEVOX の audio_query はしゃべる前に
//   「読み (カナ)」を返してくれるので、そこを機械で見れば怪しい行だけに絞れる。
//   見つけた誤読は src/generator/pacing.ts の TTS_READINGS に1行足して直す (台本は原文のまま)。
import fs from "node:fs";
import { ttsTextFor } from "../src/generator/pacing";

const HOST = "http://127.0.0.1:50021";
const SPEAKER_NAME = "ずんだもん";
const STYLE_NAME = "ノーマル";

const file = process.argv[2] ?? "docs/koso-script-v7.txt";
const showAll = process.argv.includes("--all");

// 「この漢字がこのカナで読まれていたら誤読」の見張りリスト。
// 期待する読みを書いておき、違ったら報告する。
const WATCH: { word: string; want: string; note?: string }[] = [
  { word: "人", want: "ヒト", note: "「ジン」誤読が頻発 (過去作で実際に発生)" },
  { word: "階", want: "カイ" },
  { word: "何人", want: "ナンニン" },
  { word: "上", want: "ウエ", note: "「ジョウ」誤読" },
  { word: "下", want: "シタ" },
  { word: "中", want: "ナカ" },
  { word: "柱", want: "ハシラ" },
  { word: "灯り", want: "アカリ" },
  { word: "箱", want: "ハコ" },
  { word: "井戸", want: "イド" },
  { word: "水道", want: "スイドウ" },
  { word: "鉄骨", want: "テッコツ" },
  { word: "煤", want: "スス" },
  { word: "蝋燭", want: "ロウソク" },
  { word: "蛇口", want: "ジャグチ" },
  { word: "天秤", want: "テンビン" },
  { word: "家賃", want: "ヤチン" },
  { word: "角地", want: "カドチ" },
  { word: "日除け", want: "ヒヨケ" },
  { word: "屋根裏", want: "ヤネウラ" },
];

type Mora = { text: string };
type Phrase = { moras: Mora[]; pause_mora?: Mora | null };
type Query = { accent_phrases: { moras: Mora[]; pause_mora?: Mora | null }[] };

async function speakerId(): Promise<number> {
  const res = await fetch(`${HOST}/speakers`);
  const list = (await res.json()) as {
    name: string;
    styles: { id: number; name: string }[];
  }[];
  const sp = list.find((s) => s.name === SPEAKER_NAME);
  if (!sp) throw new Error(`VOICEVOX に ${SPEAKER_NAME} が見つかりません`);
  const st = sp.styles.find((s) => s.name === STYLE_NAME) ?? sp.styles[0];
  return st.id;
}

async function kanaOf(text: string, id: number): Promise<string> {
  const url = `${HOST}/audio_query?text=${encodeURIComponent(text)}&speaker=${id}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`audio_query 失敗 (${res.status}): ${text.slice(0, 20)}`);
  const q = (await res.json()) as Query;
  return q.accent_phrases
    .map((p) => p.moras.map((m) => m.text).join("") + (p.pause_mora ? "、" : ""))
    .join("");
}

const main = async () => {
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split("\n").filter((l) => l.trim() !== "");
  // 1行目の「作風:」宣言と章見出しは読み上げ対象ではない
  const sentences = lines.filter((l) => !/^作風:/.test(l));

  const id = await speakerId();
  console.log(`■ ${SPEAKER_NAME} (${STYLE_NAME}) / id=${id} で ${sentences.length}文の読みを調べます`);
  console.log(`   台本: ${file}\n`);

  const hits: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const orig = sentences[i];
    const tts = ttsTextFor(orig); // TTS_READINGS を通したあとの文 = 実際に読まれる文
    let kana: string;
    try {
      kana = await kanaOf(tts, id);
    } catch (e) {
      console.log(`#${i + 1} 調べられませんでした: ${(e as Error).message}`);
      continue;
    }
    if (showAll) console.log(`#${i + 1}\n  文: ${orig}\n  読: ${kana}`);
    for (const w of WATCH) {
      if (!tts.includes(w.word)) continue;
      if (kana.includes(w.want)) continue;
      hits.push(
        `#${i + 1}  「${w.word}」が「${w.want}」で読まれていません${w.note ? ` (${w.note})` : ""}\n` +
          `      文: ${orig}\n      読: ${kana}`,
      );
    }
  }

  console.log(`\n■ 怪しい行: ${hits.length}件`);
  for (const h of hits) console.log(h);
  if (hits.length === 0) console.log("   見張りリストの範囲では誤読なし");
  console.log(
    `\n直し方: src/generator/pacing.ts の TTS_READINGS に [/語/g, "よみ"] を1行足す (台本は原文のまま)`,
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
