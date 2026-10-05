// 工程2: AIによる絵づけ。各文に画面の型と題材を割り当てる。
// 形式指定はゆるくし、検証はプログラム側で行う (細かすぎる指定はAI側の制限を超えて失敗する)。
// API失敗時はキーワードによる機械割り当てに逃げる。

import Anthropic from "@anthropic-ai/sdk";
import { SCENE_TYPES, type SceneType } from "../style";
import { ALL_MOTIFS, ALL_ASHI_MOTIFS } from "../motifs";
import type { Preset } from "../channel";

export type Assignment = {
  type: SceneType;
  motif: string;
  emphasis?: string;
  title?: string;
  items?: { label: string; value?: number; unit?: string }[];
  imagePrompt?: string;
};

const GENKI_HEADER = () => `あなたは高齢者向け健康解説動画の絵コンテ担当です。
台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: シニアの人物が登場する日常場面
- object: 食品や物を白背景の中央に大きく見せる
- diagram: 体の仕組みなどのラベル付き図解
- chart: 数値の比較 (値が文中にあるときだけ)
- location: 場所の全景 (スーパー・台所など)
- card: 大事な結論を1行で額装して見せる

題材 (motif) は必ずこの中から選ぶ:
${ALL_MOTIFS.join(", ")}

分かりにくい題材の意味:
- compare: 元気な姿と衰えた姿の対比 (筋肉が減る・老化が早まる・放っておくとこうなる、の文に最適)
- frail: 衰えた人物1人 (杖・弱った様子)
- hiyayakko: 冷奴 / meal: ご飯・味噌汁・焼き魚の食事トレー (献立例・バランスの良い食事の文に)
- protein: 肉・魚・卵・豆腐の盛り合わせ (たんぱく質全般の話、複数の食材を挙げる文に)`;

const ASHI_HEADER = () => `あなたは夜の教養エッセイ動画 (心理学・社会学の解説) の絵コンテ担当です。
映像は夜のダークトーンのフラットイラスト。人物はシルエットで描かれます。
台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: シルエットの人物が登場する夜の場面
- object: 象徴的な物 (月・本・天秤など) を暗い背景の中央に大きく見せる
- diagram: 概念のラベル付き図解
- chart: 数値の比較 (値が文中にあるときだけ)
- location: 夜の風景の全景 (部屋・街など)
- card: 大事な結論や問いを1行で額装して見せる

題材 (motif) は必ずこの中から選ぶ:
${ALL_ASHI_MOTIFS.join(", ")}

題材の意味:
- thinking: 机で考え込む人 / window: 窓辺で月を眺める人 / walking: 夜道を歩く人
- queue: 行列に並ぶ人々 (同調・流行の文に) / crowd: 群衆・大勢の通行人
- reading: 本を読む人 / phone: スマホの光に照らされる人 / talking: ランプの下で語る人
- book: 知識・学び / clock: 時間 / moon: 夜・孤独・静けさ / scale: 天秤=判断・比較
- lightbulb: 気づき・発見 / hourglass: 時間の有限さ / mask: 本音と建前 / coffee: 夜のひととき
- room: 間接照明の部屋と本棚 / city: 夜の街並み / street: 夜の通りと街灯 / concept: 抽象概念の図解

この作風だけの決まり:
- card は額装ではなく「文字ドン」(核心の言葉を画面いっぱいの大きな文字で見せる)。
  核心の主張や、専門用語が初めて登場する文 (「これを◯◯と呼びます」など) は card にして
  emphasis にその用語・核心の短い語句を入れる
- emphasis は必ず本文中にそのまま含まれる語句を抜き出す (字幕のその部分が黄色く強調される)
- 同じ motif の人物場面を2文続けない (続きそうなら2文目を card か object にする)`;

const PROMPT = (sentences: string[], preset: Preset) => `${
  preset === "ashi" ? ASHI_HEADER() : GENKI_HEADER()
}

ルール:
- 数字が出てくる文は chart を検討し、items に label と value を入れる (桁をそのまま写す。単位を省略しない)
- diagram のときは items に部位や要素のラベルを2〜4個
- 強調したい短い語があれば emphasis に
- chart/diagram には短い title を付ける
- 各文に image を付ける: その文の内容を一目で伝えるAI画像生成用の具体的な場面描写 (日本語で40〜80字)。
${
  preset === "ashi"
    ? `  例「夜の街角、長い行列に並ぶ人々のシルエット。街灯の暖かい光、深い青の夜空」。
  抽象的な文なら比喩的な場面に置き換える。夜・ダークトーン・シルエットの雰囲気で。
  文字やグラフを画像内に描かせない。`
    : `  例「白髪の日本人女性が台所で冷奴に鰹節をのせている。小鉢に入った豆腐、薬味のねぎ」。
  抽象的な文なら比喩的な場面に置き換える (例: 老化が早まる→元気な姿と弱った姿の対比)。
  文字やグラフを画像内に描かせない。食材は料理として美味しそうに。`
}

台本 (${sentences.length}文):
${sentences.map((s, i) => `${i}: ${s}`).join("\n")}

JSON配列のみを返してください。各要素は {"i": 文番号, "type": "...", "motif": "...", "emphasis": "...", "title": "...", "items": [...], "image": "..."} の形。emphasis/title/itemsは不要なら省略。`;

export async function assignScenes(
  sentences: string[],
  preset: Preset = "genki",
): Promise<Assignment[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const client = new Anthropic({ apiKey });
        const res = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: [{ role: "user", content: PROMPT(sentences, preset) }],
        });
        const text = res.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        const parsed = parseAssignments(text, sentences.length, preset);
        if (parsed) {
          console.log(`絵づけ完了: AI割り当て ${parsed.length}シーン`);
          return parsed;
        }
        console.warn(`絵づけの応答を解析できませんでした (試行${attempt + 1})`);
      } catch (e) {
        console.warn(`絵づけAPI失敗 (試行${attempt + 1}):`, (e as Error).message);
      }
    }
  } else {
    console.warn("ANTHROPIC_API_KEY が未設定。機械割り当てにフォールバックします");
  }
  console.log("フォールバック: キーワードによる機械割り当てを使用");
  return sentences.map((s) => (preset === "ashi" ? ashiHeuristicAssign(s) : heuristicAssign(s)));
}

function parseAssignments(text: string, count: number, preset: Preset): Assignment[] | null {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return null;
  const validMotifs: readonly string[] = preset === "ashi" ? ALL_ASHI_MOTIFS : ALL_MOTIFS;
  try {
    const arr = JSON.parse(m[0]) as Record<string, unknown>[];
    const out: Assignment[] = [];
    for (let i = 0; i < count; i++) {
      const found = arr.find((a) => Number(a.i) === i) ?? arr[i] ?? {};
      const type = SCENE_TYPES.includes(found.type as SceneType)
        ? (found.type as SceneType)
        : "character";
      const motif = validMotifs.includes(found.motif as string)
        ? (found.motif as string)
        : defaultMotif(type, preset);
      out.push({
        type,
        motif,
        emphasis: typeof found.emphasis === "string" ? found.emphasis : undefined,
        title: typeof found.title === "string" ? found.title : undefined,
        imagePrompt:
          typeof found.image === "string" && found.image.length > 0
            ? found.image
            : undefined,
        items: Array.isArray(found.items)
          ? (found.items as Assignment["items"])!.slice(0, 5).map((it) => ({
              label: String(it!.label ?? ""),
              value: it!.value !== undefined ? Number(it!.value) : undefined,
              unit: it!.unit !== undefined ? String(it!.unit) : undefined,
            }))
          : undefined,
      });
    }
    return out;
  } catch {
    return null;
  }
}

function defaultMotif(type: SceneType, preset: Preset): string {
  if (preset === "ashi") {
    if (type === "object") return "book";
    if (type === "location") return "city";
    if (type === "diagram") return "concept";
    return "talking";
  }
  if (type === "object") return "vegetables";
  if (type === "location") return "kitchen";
  if (type === "diagram") return "body";
  return "talking";
}

const OBJECT_WORDS: Record<string, string> = {
  野菜: "vegetables", 人参: "vegetables", トマト: "vegetables",
  魚: "fish", 青魚: "fish", サバ: "fish",
  肉: "meat", 鶏: "meat", 豚: "meat", 牛: "meat",
  ご飯: "rice", 米: "rice", 食パン: "bread", パン: "bread",
  牛乳: "milk", 乳製品: "milk", 卵: "egg", 果物: "fruit", りんご: "fruit",
  お茶: "tea", 緑茶: "tea", 水: "water", 納豆: "natto",
  冷奴: "hiyayakko", 豆腐: "tofu", 献立: "meal", 定食: "meal", 一汁三菜: "meal",
  お菓子: "snack", おやつ: "snack", 塩: "salt", 油: "oil", サプリ: "supplement",
  たんぱく質: "protein", タンパク質: "protein", 蛋白質: "protein", 大豆: "protein",
};

// 文から食材の題材を探す。複数の食材が挙がる文は盛り合わせ (protein) にする
export function findFoodMotif(sentence: string): string | undefined {
  const hits: string[] = [];
  for (const [w, motif] of Object.entries(OBJECT_WORDS)) {
    if (sentence.includes(w) && !hits.includes(motif)) hits.push(motif);
  }
  if (hits.includes("protein") || hits.length >= 3) return "protein";
  return hits[0];
}
const LOCATION_WORDS: Record<string, string> = {
  スーパー: "supermarket", 売り場: "supermarket", 台所: "kitchen",
  キッチン: "kitchen", 公園: "park", 散歩: "park", 自宅: "home", 家: "home",
};
const PERSON_WORDS: Record<string, string> = {
  筋肉: "compare", 老化: "compare", 衰え: "frail", 弱: "frail",
  料理: "cooking", 作り: "cooking", 食べ: "eating", 食事: "eating",
  買い: "shopping", 悩: "thinking", 考え: "thinking", 心配: "worried",
  不安: "worried", 元気: "happy", 嬉し: "happy", 歩: "walking",
  運動: "walking", 医師: "doctor", 病院: "doctor",
};

export function heuristicAssign(sentence: string): Assignment {
  if (/[0-9０-９]+(?:[%％割倍gグラムmg年歳個本回分])/.test(sentence)) {
    return { type: "chart", motif: "body", title: "数字で見る" };
  }
  for (const [w, motif] of Object.entries(LOCATION_WORDS)) {
    if (sentence.includes(w)) return { type: "location", motif };
  }
  for (const [w, motif] of Object.entries(OBJECT_WORDS)) {
    if (sentence.includes(w)) return { type: "object", motif };
  }
  for (const [w, motif] of Object.entries(PERSON_WORDS)) {
    if (sentence.includes(w)) return { type: "character", motif };
  }
  return { type: "character", motif: "talking" };
}

// ===== ashi (夜の教養エッセイ) 用のキーワード機械割り当て =====
const ASHI_PERSON_WORDS: Record<string, string> = {
  行列: "queue", 並ん: "queue", 並び: "queue", 並ぶ: "queue",
  群衆: "crowd", 人々: "crowd", 通行人: "crowd", みんな: "crowd", 大勢: "crowd",
  考え: "thinking", 悩: "thinking", 疑問: "thinking", 問い: "thinking", 自問: "thinking",
  読書: "reading", 読む: "reading",
  スマホ: "phone", 画面: "phone", SNS: "phone",
  歩: "walking", 眺め: "window", 窓: "window",
};
const ASHI_OBJECT_WORDS: Record<string, string> = {
  月: "moon", 夜空: "moon", 時計: "clock", 時間: "clock",
  天秤: "scale", 判断: "scale", 比較: "scale",
  気づ: "lightbulb", ひらめ: "lightbulb", 発見: "lightbulb",
  砂時計: "hourglass", 仮面: "mask", 本音: "mask", 建前: "mask",
  コーヒー: "coffee", 書物: "book", 読書家: "book",
};
const ASHI_LOCATION_WORDS: Record<string, string> = {
  部屋: "room", 書斎: "room", 本棚: "room",
  街: "city", 都会: "city", ビル: "city",
  通り: "street", 路上: "street", 街角: "street", 夜道: "street",
};

export function ashiHeuristicAssign(sentence: string): Assignment {
  // 「これを◯◯と呼びます」のような用語紹介は文字ドンのカードに
  const q = sentence.match(/「([^」]+)」/);
  if (q && /(呼び|言い|いいます)/.test(sentence)) {
    return { type: "card", motif: "concept", emphasis: q[1] };
  }
  if (/[0-9０-９]+(?:[%％割倍人年回分秒])/.test(sentence)) {
    return { type: "chart", motif: "concept", title: "数字で見る" };
  }
  for (const [w, motif] of Object.entries(ASHI_LOCATION_WORDS)) {
    if (sentence.includes(w)) return { type: "location", motif };
  }
  for (const [w, motif] of Object.entries(ASHI_PERSON_WORDS)) {
    if (sentence.includes(w)) return { type: "character", motif };
  }
  for (const [w, motif] of Object.entries(ASHI_OBJECT_WORDS)) {
    if (sentence.includes(w)) return { type: "object", motif };
  }
  return { type: "character", motif: "talking" };
}
