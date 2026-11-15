// 「人類は、昔から飛ばして観ていた」台本237文を VOICEVOX に「どう読むつもりか」カナで吐かせて、
// 誤読を耳で聞く前にあぶり出す (koso-yomi-check.ts と同じ仕組み)。
//
//   使い方:  npx tsx scripts/saigo-yomi-check.ts docs/saigomade-script-v1.txt
//            npx tsx scripts/saigo-yomi-check.ts docs/saigomade-script-v1.txt --all   (全文のカナを出す)
//
// 見つけた誤読は src/generator/pacing.ts の TTS_READINGS に1行足して直す (台本は原文のまま)。
import fs from "node:fs";
import { ttsTextFor } from "../src/generator/pacing";

const HOST = "http://127.0.0.1:50021";
const SPEAKER_NAME = "ずんだもん";
const STYLE_NAME = "ノーマル";

const file = process.argv[2] ?? "docs/saigomade-script-v1.txt";
const showAll = process.argv.includes("--all");

// 「この漢字がこのカナで読まれていたら誤読」の見張りリスト。
// 期待する読みを書いておき、違ったら報告する。
const WATCH: { word: string; want: string; note?: string }[] = [
  // --- この台本の最重要 (時代語・劇場語) ---
  { word: "幕間", want: "マクアイ", note: "「まくま」誤読の定番" },
  { word: "明け六つ", want: "アケムツ" },
  { word: "暮れ七つ半", want: "クレナナツハン" },
  { word: "桟敷", want: "サジキ" },
  { word: "一幕見席", want: "ヒトマクミセキ", note: "歌舞伎座の正式呼称" },
  { word: "一幕", want: "ヒトマク", note: "「いちまく」誤読" },
  { word: "半畳", want: "ハンジョウ" },
  { word: "土間", want: "ドマ" },
  { word: "観方", want: "ミカタ", note: "「かんがた」等の誤読" },
  { word: "観劇", want: "カンゲキ" },
  { word: "寄席", want: "ヨセ" },
  { word: "木戸", want: "キド" },
  { word: "茶屋", want: "チャヤ" },
  { word: "名画座", want: "メイガザ" },
  { word: "二本立て", want: "ニホンダテ" },
  { word: "牙城", want: "ガジョウ" },
  { word: "咎め", want: "トガメ" },
  { word: "見栄", want: "ミエ" },
  { word: "野次", want: "ヤジ" },
  { word: "証", want: "アカシ", note: "「しょう」誤読 (#73 市民の証)" },
  { word: "下って", want: "クダッ", note: "「時代が下って」(#51)" },
  { word: "断つ", want: "タツ", note: "「自由を断つ」(#166)" },
  // --- 固有名詞 ---
  { word: "海老名", want: "エビナ" },
  { word: "鈴本", want: "スズモト" },
  { word: "上野", want: "ウエノ" },
  { word: "演芸場", want: "エンゲイジョウ" },
  // --- 過去作で頻発した型 ---
  { word: "人", want: "ヒト", note: "「じん」誤読が頻発 (人類・犯人等は誤検知なので目視で除外)" },
  { word: "来た方", want: "キタカタ", note: "「ほう」誤読 (#142 飛ばして来た方)" },
  { word: "弁当", want: "ベントウ" },
  { word: "果物", want: "クダモノ" },
  { word: "売り子", want: "ウリコ" },
  { word: "立ち見", want: "タチミ" },
  { word: "立て札", want: "タテフダ" },
  { word: "売上", want: "ウリアゲ" },
  { word: "見出し", want: "ミダシ" },
  { word: "本編", want: "ホンペン" },
  { word: "本家", want: "ホンケ" },
  { word: "夜中", want: "ヨナカ" },
  { word: "帰り際", want: "カエリギワ" },
  { word: "業界紙", want: "ギョウカイシ" },
  { word: "生き残り", want: "イキノコリ" },
  { word: "生き証人", want: "イキショウニン" },
  { word: "飲み食い", want: "ノミクイ" },
  { word: "出入り口", want: "デイリグチ" },
  { word: "手元", want: "テモト" },
  { word: "素通り", want: "スドオリ" },
  { word: "早送り", want: "ハヤオクリ" },
  { word: "巻き戻し", want: "マキモドシ" },
  { word: "洗い物", want: "アライモノ" },
  { word: "聴き方", want: "キキカタ" },
  { word: "作り手", want: "ツクリテ" },
  { word: "楽章", want: "ガクショウ" },
  { word: "椅子席", want: "イスセキ" },
  { word: "開場", want: "カイジョウ" },
  { word: "宮廷", want: "キュウテイ" },
  { word: "女王陛下", want: "ジョオウヘイカ" },
  { word: "回想録", want: "カイソウロク" },
  { word: "由緒", want: "ユイショ" },
  { word: "拝聴", want: "ハイチョウ" },
  { word: "着飾", want: "キカザ" },
  { word: "各国", want: "カッコク" },
  { word: "群衆", want: "グンシュウ" },
  { word: "何千年", want: "ナンゼンネン" },
  { word: "数千年", want: "スウセンネン" },
  { word: "一枚", want: "イチマイ" },
  { word: "丸一日", want: "マルイチニチ" },
  { word: "朝六時", want: "アサロクジ" },
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
