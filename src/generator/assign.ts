// 工程2: AIによる絵づけ。各文に画面の型と題材を割り当てる。
// 形式指定はゆるくし、検証はプログラム側で行う (細かすぎる指定はAI側の制限を超えて失敗する)。
// API失敗時はキーワードによる機械割り当てに逃げる。

import Anthropic from "@anthropic-ai/sdk";
import { SCENE_TYPES, type SceneType } from "../style";
import { ALL_MOTIFS, OBJECT_MOTIFS, PERSON_MOTIFS, LOCATION_MOTIFS } from "../motifs";

export type Assignment = {
  type: SceneType;
  motif: string;
  emphasis?: string;
  title?: string;
  items?: { label: string; value?: number; unit?: string }[];
  imagePrompt?: string;
};

const PROMPT = (sentences: string[]) => `あなたは高齢者向け健康解説動画の絵コンテ担当です。
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
- protein: 肉・魚・卵・豆腐の盛り合わせ (たんぱく質全般の話、複数の食材を挙げる文に)

ルール:
- 数字が出てくる文は chart を検討し、items に label と value を入れる (桁をそのまま写す。単位を省略しない)
- diagram のときは items に部位や要素のラベルを2〜4個
- 強調したい短い語があれば emphasis に
- chart/diagram には短い title を付ける
- 各文に image を付ける: その文の内容を一目で伝えるAI画像生成用の具体的な場面描写 (日本語で40〜80字)。
  例「白髪の日本人女性が台所で冷奴に鰹節をのせている。小鉢に入った豆腐、薬味のねぎ」。
  抽象的な文なら比喩的な場面に置き換える (例: 老化が早まる→元気な姿と弱った姿の対比)。
  文字やグラフを画像内に描かせない。食材は料理として美味しそうに。

台本 (${sentences.length}文):
${sentences.map((s, i) => `${i}: ${s}`).join("\n")}

JSON配列のみを返してください。各要素は {"i": 文番号, "type": "...", "motif": "...", "emphasis": "...", "title": "...", "items": [...], "image": "..."} の形。emphasis/title/itemsは不要なら省略。`;

export async function assignScenes(sentences: string[]): Promise<Assignment[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const client = new Anthropic({ apiKey });
        const res = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: [{ role: "user", content: PROMPT(sentences) }],
        });
        const text = res.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        const parsed = parseAssignments(text, sentences.length);
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
  return sentences.map(heuristicAssign);
}

function parseAssignments(text: string, count: number): Assignment[] | null {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[0]) as Record<string, unknown>[];
    const out: Assignment[] = [];
    for (let i = 0; i < count; i++) {
      const found = arr.find((a) => Number(a.i) === i) ?? arr[i] ?? {};
      const type = SCENE_TYPES.includes(found.type as SceneType)
        ? (found.type as SceneType)
        : "character";
      const motif = (ALL_MOTIFS as readonly string[]).includes(found.motif as string)
        ? (found.motif as string)
        : defaultMotif(type);
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

function defaultMotif(type: SceneType): string {
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
