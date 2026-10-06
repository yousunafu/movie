// 工程2: AIによる絵づけ。各文に画面の型と題材を割り当てる。
// 形式指定はゆるくし、検証はプログラム側で行う (細かすぎる指定はAI側の制限を超えて失敗する)。
// API失敗時はキーワードによる機械割り当てに逃げる。

import Anthropic from "@anthropic-ai/sdk";
import { SCENE_TYPES, type SceneType } from "../style";
import {
  ALL_MOTIFS,
  ALL_ASHI_MOTIFS,
  ALL_MANABI_MOTIFS,
  ALL_REKISHI_MOTIFS,
  ALL_KEIZAI_MOTIFS,
} from "../motifs";
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

const MANABI_HEADER = () => `あなたは身近な現象を科学で解説する動画の絵コンテ担当です。
映像は濃い紺のダークトーンに白い線画の図解。強調はオレンジ1色です。
台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: 手や人が物に触れる場面
- object: 物や記号を暗い背景の中央に大きく見せる
- diagram: 仕組みの図解 (熱の移動・分子・グラフなど)
- chart: 数値の比較 (値が文中にあるときだけ。倍率はマスの数で見せる)
- location: 場所の全景
- card: 章の見出しや大事な結論を1行で見せる (キーワードがオレンジになる)

題材 (motif) は必ずこの中から選ぶ:
${ALL_MANABI_MOTIFS.join(", ")}

題材の意味:
- touch_metal: 金属のドアノブに手が触れてヒヤッとする / touch_wood: 木に触れる (冷たくない)
- doorknob: 金属のドアノブ / wood: 木の板 / thermometer: 温度計2本の比較 (同じ温度の文に)
- hand: 手のクローズアップ (体温・感覚の文に) / question: 大きな「?」 (問いかけの文に)
- heatflow: 断面図で熱が矢印で移動する (熱が移る・奪われる・吸い取られる文に)
- molecules: 粒が熱を順に伝える図 (伝わりやすさ・分子の文に)
- graph: 折れ線グラフ (温度が下がる・変化の文に)
- bathroom: 風呂場のタイルと木の椅子 / room: 部屋の全景 / concept: その他の図解
- city: 都市のスカイラインから人の姿がふっと消える (人類がいなくなる・無人になる文に)
- ruin: ビルが緑のツタと雨に飲み込まれていく (建物が植物に覆われる・廃墟になる文に)
- decay: 鉄が錆びてオレンジ褐色になり、コンクリートが砂になって崩れ落ちる (風化・錆の文に)
- dinosaur: 恐竜の骨格 (白線画) が左から順に描かれる (恐竜・骨の形を知っている文に)
- fossilize: 左=地表で朽ちて消える骨、右=泥の層に埋まって残る骨の対比図 (「埋まったものだけが化石に」の文に)
- strata: 画面いっぱいの地層断面。人類の時代が細いオレンジ1本の線で刻まれ丸で囲まれる (地層・薄い一枚の線の文に)
- future_fossil: ペットボトルと鶏の骨をオレンジの輪でハイライト (プラスチック・未来の化石候補の文に)
- moon_footprint: 黒い空と月面の地平線に足跡がひとつ残る静かな絵 (月に残した足跡の文に)

この作風だけの決まり:
- 「答えは〜」「つまり〜」のような核心の文と、最後の結論の文は card にして
  emphasis に核心の短い語句 (本文中にそのまま含まれる語) を入れる
- 数値の倍率 (〜倍) が出る文は必ず chart にして、items を [{基準のlabel, value: 1}, {比べるlabel, value: 倍率}] にする
- thermometer / heatflow / graph では items の label を比べる物の名前にする (例: 金属, 木)`;

const REKISHI_HEADER = () => `あなたは歴史・深い時間スケールの教養解説動画の絵コンテ担当です。
映像はセピアの古文書・銅版画調の資料図版 (上8割が絵、下2割が黒帯の字幕領域)。
台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: 人や生き物が主役の場面 (この作風では図版として描かれる)
- object: 象徴的な物や記号を図版として大きく見せる
- diagram: 仕組み・過程のラベル付き図解 (化石化・地層など)
- chart: 数値の比較 (値が文中にあるときだけ。倍率はマスの数で見せる)
- location: 風景の全景 (都市・月面など)
- card: 章の見出しや大事な結論を白背景のスライドで見せる (キーワードが錆朱になる)

題材 (motif) は必ずこの中から選ぶ:
${ALL_REKISHI_MOTIFS.join(", ")}

題材の意味:
- city: 廃墟になっていく都市の遠景 / ruin: ツタに覆われるビル (植物に飲み込まれる文に)
- decay: 錆と砂に埋もれる歯車・鉄骨 (錆びる・砂に戻る文に)
- dinosaur: 恐竜の骨格の博物図版 / fossilize: 埋没→地層→化石化の3段階の図解
- strata: 地層の断面に薄い一枚の錆朱の線 (地層に刻まれる・一枚の線の文に)
- future_fossil: ペットボトルと鶏の骨の標本図版 (未来の化石の文に)
- moon_footprint: 月面に残る足跡 (月・足跡の文に)
- question: 大きな「?」の図版 (問いかけの文に) / concept: その他 (砂時計 = 時の流れ)

この作風だけの決まり:
- 「答えは〜」「つまり〜」のような核心の文と、最後の結論の文は card にして
  emphasis に核心の短い語句 (本文中にそのまま含まれる語) を入れる。
  要点を列挙できる結論の文は、items に [{"label": "要点1"}, ...] を2〜4個入れると箇条書きスライドになる
- 数値の倍率 (〜倍) が出る文は必ず chart にして、items を [{基準のlabel, value: 1}, {比べるlabel, value: 倍率}] にする`;

const KEIZAI_HEADER = () => `あなたは経済ニュースをかみ砕いて解説する動画の絵コンテ担当です。
映像はニュース番組のフリップ風。濃紺のスタジオ背景に白いフリップボード、見出しは赤いバー、
強調数字は黄色のビッグ文字です。台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: 人や動きのある場面 (この作風ではフリップとピクトグラムで描かれる)
- object: 象徴的な物や記号をフリップで大きく見せる
- diagram: 仕組み・流れのラベル付き図解 (矢印チェーン・分岐図など)
- chart: 数値の比較 (値が文中にあるときだけ。緑/紫の横棒グラフになる)
- location: 全景の図 (日本地図など)
- card: 大事な結論をまとめフリップ (赤見出し+白ボード+箇条書き) で見せる

題材 (motif) は必ずこの中から選ぶ:
${ALL_KEIZAI_MOTIFS.join(", ")}

題材の意味:
- news: ニュース速報風の見出しテロップ (導入・「〜というニュース」の文に)
- exchange: 両替の図。1ドル=100円→150円のように数字がカウントアップ (円安の定義・為替レートの文に)
- import_japan: 日本地図+外から入る矢印+「食料 約6割」などの赤バーフリップ (輸入に頼る・自給率の文に)
- cost_chain: 仕入れ値→企業→価格転嫁の矢印チェーン (コストが順に伝わる文に)
- ripple: 小麦→パン、原油→電気代・輸送費の分岐図 (値上がりが波及する文に)
- transport: トラックのピクト+値札に輸送費が含まれる図 (輸送費・物流の文に)
- price_up: 値札の数字が上がるアニメ (値段が上がる・押し上げる文に)
- balance: 天秤。左に痛み・右に恩恵 (輸出企業は追い風・メリットとデメリットの文に)
- concept: その他 (白フリップ+キーワード)

この作風だけの決まり:
- 最後の結論の文は card にして emphasis に核心の短い語句 (本文中にそのまま含まれる語) を入れる。
  要点を列挙できる結論の文は、items に [{"label": "要点1"}, ...] を2〜4個入れると箇条書きフリップになる
- 数値の比較が出る文は chart にして、items を [{label, value, unit}] にする (value は数値だけ)
- exchange / price_up では items に変化前と変化後の2つの数値を入れる (例: [{"label": "いま", "value": 100, "unit": "円"}, {"label": "円安後", "value": 150, "unit": "円"}])
- emphasis は必ず本文中にそのまま含まれる語句を抜き出す`;

const PROMPT = (sentences: string[], preset: Preset) => `${
  preset === "ashi"
    ? ASHI_HEADER()
    : preset === "manabi"
      ? MANABI_HEADER()
      : preset === "rekishi"
        ? REKISHI_HEADER()
        : preset === "keizai"
          ? KEIZAI_HEADER()
          : GENKI_HEADER()
}

ルール:
- 数字が出てくる文は chart を検討し、items に label と value を入れる。
  value は必ず数値だけ (例: 4)。単位や文字を混ぜない。単位は unit に書く (パーセントは unit を "%" に)
- diagram のときは items に部位や要素のラベルを2〜4個
- 強調したい短い語があれば emphasis に
- chart/diagram には短い title を付ける
- 各文に image を付ける: その文の内容を一目で伝えるAI画像生成用の具体的な場面描写 (日本語で40〜80字)。
${
  preset === "ashi"
    ? `  例「夜の街角、長い行列に並ぶ人々のシルエット。街灯の暖かい光、深い青の夜空」。
  抽象的な文なら比喩的な場面に置き換える。夜・ダークトーン・シルエットの雰囲気で。
  文字やグラフを画像内に描かせない。`
    : preset === "manabi"
      ? `  例「濃紺の背景に白い線画で描いた金属のドアノブ。手が触れて、冷たさを示す淡い青の線」。
  濃紺の背景・白い線画・オレンジの強調、という理科の図解の雰囲気で。
  文字やグラフを画像内に描かせない。`
      : preset === "rekishi"
        ? `  例「セピア色の古い銅版画。ツタに覆われた廃墟のビル群、細い平行線のハッチングの陰影、古紙の質感」。
  セピアの古文書・銅版画調の資料図版の雰囲気で。差し色は錆朱だけ。
  文字やグラフを画像内に描かせない。`
        : preset === "keizai"
          ? `  例「濃紺のニューススタジオ。白いフリップボードに円とドルの硬貨のイラスト、赤い見出しバー」。
  ニュース番組のフリップ風、濃紺スタジオ+白ボード+赤と黄色の差し色、という雰囲気で。
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
  return sentences.map((s) =>
    preset === "ashi"
      ? ashiHeuristicAssign(s)
      : preset === "manabi"
        ? manabiHeuristicAssign(s)
        : preset === "rekishi"
          ? rekishiHeuristicAssign(s)
          : preset === "keizai"
            ? keizaiHeuristicAssign(s)
            : heuristicAssign(s),
  );
}

function parseAssignments(text: string, count: number, preset: Preset): Assignment[] | null {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return null;
  const validMotifs: readonly string[] =
    preset === "ashi"
      ? ALL_ASHI_MOTIFS
      : preset === "manabi"
        ? ALL_MANABI_MOTIFS
        : preset === "rekishi"
          ? ALL_REKISHI_MOTIFS
          : preset === "keizai"
            ? ALL_KEIZAI_MOTIFS
            : ALL_MOTIFS;
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
          ? (found.items as Record<string, unknown>[]).slice(0, 5).map(coerceItem)
          : undefined,
      });
    }
    return out;
  } catch {
    return null;
  }
}

// AIが value を「"4%"」「"40パーセント"」のような文字列で返しても数値として拾う
function coerceItem(it: Record<string, unknown>): {
  label: string;
  value?: number;
  unit?: string;
} {
  const raw = it.value;
  let value: number | undefined;
  let unit = it.unit !== undefined ? String(it.unit) : undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    value = raw;
  } else if (typeof raw === "string") {
    const half = raw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    const m = half.match(/-?[0-9]+(?:\.[0-9]+)?/);
    if (m) value = parseFloat(m[0]);
    if (!unit && /[%％]|パーセント/.test(half)) unit = "%";
  }
  if (unit?.includes("パーセント")) unit = "%";
  return { label: String(it.label ?? ""), value, unit };
}

function defaultMotif(type: SceneType, preset: Preset): string {
  if (preset === "ashi") {
    if (type === "object") return "book";
    if (type === "location") return "city";
    if (type === "diagram") return "concept";
    return "talking";
  }
  if (preset === "manabi") {
    if (type === "object") return "question";
    if (type === "location") return "room";
    if (type === "diagram") return "concept";
    return "thinking";
  }
  if (preset === "rekishi") {
    if (type === "object") return "question";
    if (type === "location") return "city";
    return "concept";
  }
  if (preset === "keizai") {
    if (type === "location") return "import_japan";
    if (type === "diagram") return "cost_chain";
    return "concept";
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

// ===== manabi (身近な科学の図解解説) 用のキーワード機械割り当て =====
export function manabiHeuristicAssign(sentence: string): Assignment {
  if (/[0-9０-９]+(?:倍)/.test(sentence)) {
    return { type: "chart", motif: "concept", title: "数字で見る" };
  }
  if (/(でしょうか|だろうか)[。]?$/.test(sentence)) {
    return { type: "object", motif: "question" };
  }
  if (/(答えは|つまり|とは、|かもしれません。?$)/.test(sentence)) {
    return { type: "card", motif: "concept" };
  }
  // 人類の痕跡テーマ
  if (/(いなくなっ|無人にな)/.test(sentence)) {
    return { type: "location", motif: "city" };
  }
  if (/(植物|ツタ|飲み込ま|廃墟)/.test(sentence)) {
    return { type: "location", motif: "ruin" };
  }
  if (/(錆|砂に戻|風化)/.test(sentence)) {
    return { type: "diagram", motif: "decay" };
  }
  if (/恐竜/.test(sentence)) {
    return { type: "diagram", motif: "dinosaur" };
  }
  if (/(泥に埋|化石として|化石にな)/.test(sentence)) {
    return { type: "diagram", motif: "fossilize", title: "化石になる条件" };
  }
  if (/(地層|一枚の線)/.test(sentence)) {
    return { type: "diagram", motif: "strata" };
  }
  if (/(プラスチック|ペットボトル|鶏の骨)/.test(sentence)) {
    return { type: "object", motif: "future_fossil" };
  }
  if (/(月に残|月面|足跡)/.test(sentence)) {
    return { type: "location", motif: "moon_footprint" };
  }
  if (/(奪われ|吸い取|移動|流れ出|伝わって)/.test(sentence)) {
    return { type: "diagram", motif: "heatflow" };
  }
  if (/(下がり|上がり|変化|グラフ)/.test(sentence)) {
    return { type: "diagram", motif: "graph" };
  }
  if (/(分子|粒|原子)/.test(sentence)) {
    return { type: "diagram", motif: "molecules" };
  }
  if (/(温度計|同じ温度)/.test(sentence)) {
    return { type: "object", motif: "thermometer" };
  }
  if (/(風呂|タイル)/.test(sentence)) {
    return { type: "location", motif: "bathroom" };
  }
  if (/(ドアノブ|金属)/.test(sentence)) {
    return { type: "character", motif: "touch_metal" };
  }
  if (/(木|ヒノキ)/.test(sentence)) {
    return { type: "character", motif: "touch_wood" };
  }
  if (/(手|体温|36度)/.test(sentence)) {
    return { type: "object", motif: "hand" };
  }
  return { type: "character", motif: "thinking" };
}

// ===== rekishi (歴史・深い時間の資料図版) 用のキーワード機械割り当て =====
export function rekishiHeuristicAssign(sentence: string): Assignment {
  if (/[0-9０-９,，万]+倍/.test(sentence)) {
    return { type: "chart", motif: "concept", title: "数字で見る" };
  }
  if (/(でしょうか|だろうか|のでしょうか)[。]?$/.test(sentence)) {
    return { type: "object", motif: "question" };
  }
  if (/(答えは|つまり|結論)/.test(sentence)) {
    return { type: "card", motif: "concept" };
  }
  if (/(月|足跡)/.test(sentence)) {
    return { type: "location", motif: "moon_footprint" };
  }
  if (/(地層|一枚の線|刻ま)/.test(sentence)) {
    return { type: "diagram", motif: "strata" };
  }
  if (/(プラスチック|ペットボトル|鶏)/.test(sentence)) {
    return { type: "object", motif: "future_fossil" };
  }
  if (/(化石|埋ま)/.test(sentence)) {
    return { type: "diagram", motif: "fossilize" };
  }
  if (/(恐竜|骨格)/.test(sentence)) {
    return { type: "object", motif: "dinosaur" };
  }
  if (/(錆|砂に|砂へ|コンクリート)/.test(sentence)) {
    return { type: "object", motif: "decay" };
  }
  if (/(ツタ|つた|植物|飲み込|のまれ)/.test(sentence)) {
    return { type: "location", motif: "ruin" };
  }
  if (/(ビル|都市|街|文明|人類)/.test(sentence)) {
    return { type: "location", motif: "city" };
  }
  return { type: "object", motif: "concept" };
}

// ===== keizai (経済ニュース解説・フリップボード) 用のキーワード機械割り当て =====
export function keizaiHeuristicAssign(sentence: string): Assignment {
  // 導入・締めの「ニュース」の文は速報テロップ風に
  if (/(ニュース|速報)/.test(sentence)) {
    return { type: "object", motif: "news" };
  }
  // 両替の図 (1ドル100円が150円に → 数字を items に拾ってカウントアップ)
  if (/(円安とは|[0-9０-９]+ドル|ドル.*円|為替)/.test(sentence)) {
    const half = sentence.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    const m = half.match(/([0-9]+)円が([0-9]+)円/);
    return {
      type: "diagram",
      motif: "exchange",
      title: "円安のしくみ",
      items: m
        ? [
            { label: "いま", value: parseFloat(m[1]), unit: "円" },
            { label: "円安後", value: parseFloat(m[2]), unit: "円" },
          ]
        : undefined,
    };
  }
  // 輸入依存 (「輸入品」は price_up 側に流すため「輸入に頼る」系だけ拾う)
  if (/(輸入に頼|自給率|日本地図|地図)/.test(sentence)) {
    return { type: "location", motif: "import_japan" };
  }
  if (/(転嫁|仕入れ|負担)/.test(sentence)) {
    return { type: "diagram", motif: "cost_chain", title: "値上がりが届くまで" };
  }
  if (/(小麦|パン|原油)/.test(sentence)) {
    return { type: "diagram", motif: "ripple", title: "値上がりの連鎖" };
  }
  if (/(輸送費|トラック|物流|運ぶ)/.test(sentence)) {
    return { type: "diagram", motif: "transport" };
  }
  if (/(押し上げ|値上げ|値段.*上が|価格.*上が)/.test(sentence)) {
    return { type: "object", motif: "price_up" };
  }
  if (/(天秤|恩恵|追い風|輸出|海外に.*売る)/.test(sentence)) {
    return { type: "diagram", motif: "balance", title: "円安の痛みと恩恵" };
  }
  if (/[0-9０-９][0-9０-９,，.．]*(?:[%％割倍円万])/.test(sentence)) {
    return { type: "chart", motif: "concept", title: "数字で見る" };
  }
  if (/(答えは|つまり|結論|なのです)/.test(sentence)) {
    return { type: "card", motif: "concept" };
  }
  return { type: "object", motif: "concept" };
}

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
