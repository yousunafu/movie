// 「なぜ人は、柔らかいものを握りたくなるのか」台本233文を VOICEVOX に「どう読むつもりか」カナで吐かせて、
// 誤読を耳で聞く前にあぶり出す (koso-yomi-check.ts と同じ仕組み)。
//
//   使い方:  npx tsx scripts/yawa-yomi-check.ts docs/yawarakai-script-v1.txt
//            npx tsx scripts/yawa-yomi-check.ts docs/yawarakai-script-v1.txt --all   (全文のカナを出す)
//
// 見つけた誤読は src/generator/pacing.ts の TTS_READINGS に1行足して直す (台本は原文のまま)。
import fs from "node:fs";
import { ttsTextFor } from "../src/generator/pacing";

const HOST = "http://127.0.0.1:50021";
const SPEAKER_NAME = "ずんだもん";
const STYLE_NAME = "ノーマル";

const file = process.argv[2] ?? "docs/yawarakai-script-v1.txt";
const showAll = process.argv.includes("--all");

// 「この漢字がこのカナで読まれていたら誤読」の見張りリスト。
// 期待する読みを書いておき、違ったら報告する。
const WATCH: { word: string; want: string; note?: string }[] = [
  // --- 固有名詞・専門語 ---
  { word: "竹夫人", want: "チクフジン" },
  { word: "竹夾膝", want: "チクキョウシツ" },
  { word: "竹奴", want: "チクド" },
  { word: "青奴", want: "セイド" },
  { word: "蘇軾", want: "ソショク" },
  { word: "陸游", want: "リクユウ" },
  { word: "与謝蕪村", want: "ヨサブソン" },
  { word: "季語", want: "キゴ" },
  { word: "モッリティア", want: "モッリティア" },
  { word: "柔弱", want: "ニュウジャク" },
  { word: "軟弱", want: "ナンジャク" },
  { word: "博物誌", want: "ハクブツシ" },
  { word: "デナリウス", want: "デナリウス" },
  { word: "移行対象", want: "イコウタイショウ" },
  { word: "床ずれ", want: "トコズレ" },
  { word: "低反発", want: "テイハンパツ" },
  { word: "遺言書", want: "ユイゴンショ" },
  { word: "遺言", want: "ユイゴン" },
  { word: "敷きぶとん", want: "シキブトン" },
  { word: "寝床", want: "ネドコ" },
  { word: "低木", want: "テイボク" },
  { word: "抱き枕", want: "ダキマクラ" },
  { word: "哺乳びん", want: "ホニュウビン" },
  { word: "針金", want: "ハリガネ" },
  { word: "毛糸", want: "ケイト" },
  { word: "麻の布", want: "アサノヌノ" },
  { word: "布", want: "ヌノ" },
  { word: "何層", want: "ナンソウ" },
  { word: "葉", want: "ハ" },
  { word: "灰", want: "ハイ" },
  { word: "首", want: "クビ" },
  { word: "背中", want: "セナカ" },
  { word: "腕", want: "ウデ" },
  { word: "体", want: "カラダ" },
  { word: "人", want: "ヒト", note: "「じん」誤読 (人類・人形・〜人 は誤検知なので目視で除外)" },
  { word: "上陸", want: "ジョウリク" },
  { word: "持ち場", want: "モチバ" },
  { word: "指揮官", want: "シキカン" },
  { word: "夫人", want: "フジン" },
  { word: "竹", want: "タケ", note: "竹夫人・竹夾膝・竹奴 は チク (誤検知)" },
  { word: "秒速数センチ", want: "ビョウソクスウセンチ" },
  { word: "数センチ", want: "スウセンチ" },
  { word: "7万7千年前", want: "ナナマンナナセンネンマエ" },
  { word: "20万年", want: "ニジュウマンネン" },
  { word: "1ポンド", want: "イチポンド" },
  { word: "5デナリウス", want: "ゴデナリウス" },
];


type Mora = { text: string };
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
