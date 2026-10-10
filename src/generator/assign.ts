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
  ALL_KOUZOU_MOTIFS,
  ALL_KEIZAI_MOTIFS,
  ALL_SUURI_MOTIFS,
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
- flood: 都市の断面図。地下鉄のトンネルに水位が上がっていく (地下鉄・都市が水没する・ポンプの文に)
- trash_layer: ゴミ処分場の断面図。埋まったボトルや骨や陶器が光る (処分場・ゴミ・未来の遺跡の文に)
- timeline: 左から目盛りが伸びる年表 (数十年→数百年→数千年と時間を順に数える文に)
- sleeping: 夜、ベッドで眠る人と月 (眠りに落ちる・睡眠中・夜勤のたとえの文に)
- sleep_wave: 一晩の眠りの深さの波グラフ。90分周期でレム/ノンレムが入れ替わる (眠りのリズム・周期の文に)
- dream_brain: 脳の側面図。視覚野と扁桃体がオレンジに灯り、前頭前野だけ消灯 (夢を見る脳・脳の部位の文に)
- body_lock: 眠る体の図。脳からの指令線が脳幹でせき止められる (体が動かない・金縛り・安全装置の文に)
- memory_transfer: 海馬 (一時保管庫) から大脳皮質 (長期保管庫) へ記憶の粒が移る図 (記憶の引っ越し・保存の文に)
- pruning: 神経のつながりの剪定図。大事な線は太く、不要な線は消える (記憶の選別・刈り込みの文に)
- brain_wash: 脳の断面。青い脳脊髄液が細胞のすき間を流れ、老廃物の粒を洗い流す (脳の掃除・グリンパティック・アミロイドベータの文に)
- surprised: ハッと気づく人 (!マーク) (「なんと」「実は」「意外にも」のような驚きの文に)
- nodding: 納得してうなずく人 (チェックマーク) (「だから」「そのため」のようなまとめ・納得の文に)
- rem_eye: 閉じたまぶたの下で目玉が左右に動く (目が動く・レム睡眠の様子の文に)
- alarm_clock: 目覚まし時計 (目覚まし・朝起きる・起床の文に)
- lightbulb: 電球がぽっと灯る (新しい発見・注目の研究・ひらめきの文に)
- house_loan: 家と値札 (家のローン・家計のたとえ話の文に)
- life_pie: 人生の円グラフ。3分の1がオレンジに塗られる (人生の3分の1・合計30年のような人生の時間の文に)
- roadmap: 章の箱が横に並んで順に点灯する目次図 (「今日は4つの章で見ていく」のような全体の流れの文に)
- energy_meter: バー2本がほぼ同じ高さで並ぶ比較メーター (活動量・消費量がほとんど変わらない文に)
- info_flood: 頭のシルエットに情報の矢印が次々と降り注ぐ (情報を浴びる・見たもの聞いたことが流れ込む文に)
- bar_compare: 2グループの棒グラフ対比。勝者がオレンジ (実験で成績が良い・リスクが高いなど2者比較の文に)
- messy_desk: 机に書類がどんどん積み上がる (散らかる・たまる・放置するとどうなるかの文に)
- brain_repair: 脳にレンチ (脳の修理・メンテナンス・回復の文に)
- night_office: 夜のビル群に窓明かりがぽつぽつ灯る (夜勤・夜に働く・舞台裏の文に)
- sunrise: 地平線から朝日が昇る (朝・明日・目覚めた後の文に)
- chapter: 章扉カード (「第1章」などの章番号と章タイトルを静かに見せる。type は card にする)
- quiz: クイズ出題カード (「ここで問題です」のような出題宣言の文に。type は card にする)

この作風だけの決まり:
- 同じ題材が2文以上続かないように散らす。特に語り・つなぎの文を thinking ばかりにせず、
  文意に合わせて surprised / nodding / night_office / sunrise / sleeping などを使い分ける
- 章の切り替え文 (「まず」「第一に」「ここからは」「最後に」などで始まり、
  「第1章」「第2章」のように章タイトルを宣言する文) は type を card、motif を chapter にして、
  title に章タイトルだけ (例: 消えていく痕跡) を入れる
- クイズの出題を宣言する文 (「ここで問題です」「ここで2問目です」など) は type を card、
  motif を quiz にする (演出は控えめな出題カード)
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

const KOUZOU_HEADER = () => `あなたは仕事・人生・組織の仕組みを心理学・行動科学・経済学で構造化して解説する動画の絵コンテ担当です。
映像は生成り (アイボリー) の紙の背景に、黒のピクトグラムと線・矢印・分岐・グラフの図解。差し色は青緑1色です。
台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: 人のピクトグラムが登場する場面 (会議室など)
- object: 記号や物のピクトグラムを中央に大きく見せる
- diagram: 構造の図解 (分岐図・連鎖の矢印・バーの図など。この作風の主役)
- chart: 数値の比較 (値が文中にあり、比較そのものが主役のときだけ)
- location: 場面の全景 (この作風では会議室の図になる)
- card: 章の切り替えの短い見出し文と、最後の結論だけに使う濃紺のカード (キーワードが青緑になる)

題材 (motif) は必ずこの中から選ぶ:
${ALL_KOUZOU_MOTIFS.join(", ")}

題材の意味:
- meeting: 会議室 (テーブルと人のピクトグラム、吹き出しが増えていく)。会議の場面・冒頭の問いの文に
- structure: 箱の分岐図。構造・要点の列挙の文に。items に [{"label": "要素1"}, ...] を2〜4個入れる (箱になる)
- mix: 性質の違う仕事が1つの枠に押し込まれる図 (混在・同居の文に)。items に仕事のラベルを入れる
- no_end: チェックボックスに×が付き、時間の線が右へ伸び続ける図 (終わりの条件がない・時間を飲み込む文に)
- silence: 人型から吹き出しが連鎖する矢印図 (沈黙→不安→発言の連鎖の文に)
- anchor: 60分のバーと錨の図 (時間を使い切る・30分で結論が出ても60分かかる文に。数値があっても chart より anchor を優先)
- law: 枠=与えられた時間、中身の仕事が枠いっぱいに膨らむ図 (パーキンソンの法則の文に)
- concept: その他の構造図 (つながりのネットワーク図)

この作風だけの決まり:
- card は「次に、〜です。」のような章の切り替えの短い文と、最後の結論の文だけに使う。
  それ以外の文は card にしない (本編は図解で見せる)
- card では emphasis に核心の短い語句 (本文中にそのまま含まれる語) を入れる (その部分が青緑になる)
- 時間 (分・時間) の数値は anchor / no_end の図で見せる。chart は「30分 vs 60分」のような比較が主役の文だけ`;

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

const SUURI_HEADER = () => `あなたは数理・統計で身近な疑問を解き明かす教養動画の絵コンテ担当です。
映像は真っ黒な背景に白い線のピクトグラムと系図・ネットワーク図。強調は赤1色だけです。
台本の各文に、画面の型と題材を割り当ててください。

画面の型:
- character: 人のピクトグラムが登場する場面
- object: 物や記号を黒い背景の中央に大きく見せる
- diagram: 系図・ネットワーク・グラフの図解 (この作風の主役)
- chart: 数値の比較 (値が文中にあるときだけ)
- location: 風景の全景
- card: 章の見出しや大事な結論を1行で見せる (キーワードが赤になる)

題材 (motif) は必ずこの中から選ぶ:
${ALL_SUURI_MOTIFS.join(", ")}

題材の意味:
- doubling_tree: あなたから上へ倍々に枝分かれする先祖の系図 (親2人→祖父母4人→8人…と増える文に)
- exp_curve: 指数関数の急上昇カーブ (席の数が何代前で何席と爆発的に増える文に)
- school: 校舎と生徒の点のグリッド (1,024人=全校生徒のようなたとえの文に)
- city_pop: 都市のスカイラインと人の点の群れ (105万人=仙台市のようなたとえの文に)
- globe_pop: 地球と人口の比較 (先祖の席が地球の総人口を超える文に)
- seat_share: 1人のピクトが複数の席に線でつながる (同じ人が何席も掛け持ちする文に)
- net_merge: きれいな枝分かれの木が、途中から枝がくっついて網になる (家系の収束・網の文に)
- hatoko: はとこ夫婦の系図。共通の曽祖父母が2か所で赤く灯る (はとこ・共通の先祖が二重に登場する文に)
- japan_net: 日本列島が家系の網で覆われる (日本中の家系図がつながる・みんな親戚の文に)
- michinaga: 藤原道長の人物図 (束帯・烏帽子・扇)。道長本人を語る文に
- three_points: ポイント3つの箱が順に点灯 (ポイントは3つ、のような列挙の文に。items にラベルを入れる)
- descend_tree: 道長から下へ倍々に広がる子孫の系図 (子孫が増えていく文に)
- extinct_line: 家系の線が途中で×とともに途切れる (家系が絶える・子孫を残せない文に)
- crown: 3つの后の冠と天皇 (きさき・一家三后・孫から天皇の文に)
- path_count: あなたから道長へ無数の赤い経路が同時に走る網 (経路が何本もある文に)
- dna_half: DNAのバーが半分→4分の1→…とほぼ0%まで薄まる (DNAが半分ずつ・寄与ほぼゼロの文に)
- chain_lights: 千年の命のリレー。光の鎖が途切れず現代まで届く (命をつないだ・途切れなかった文に)
- lottery: 当たりくじ (絶滅の心配がない・別格の当たりの文に)
- scroll: 家系図の巻物 (家系図ビジネス・系図・創作や借り物の文に)
- nengajo: 年賀状のはがき (年賀状の文に)
- unknown_farmer: 名もなき農民・漁師のピクトグラム (名前が残っていない人々の文に)
- village: 昔の村の全景 (昔の村・集落の文に)
- multiply_imagine: 吹き出しに赤い掛け算記号が浮かぶ人 (掛け算と想像力で考える文に)
- math_talk: 黒板風の枠に数学記号 (数学の話・計算・数理モデルの文に)
- tally: 「正」の字で数を数える図 (数字で確かめる・人数を数える文に)
- ordinary_house: 普通の家と家族 (代々普通の家系、という文に)
- parents: あなたと父・母の3人の小さな系図 (親は2人、という文に)
- number_ladder: 倍々に高くなる棒グラフ (4人→8人→16人と数字が並ぶ文に)
- timeline: 現代→江戸→戦国→平安の時間の矢印 (時代をさかのぼる・何年前の文に)
- japan_pop: 日本列島と人口の点 (当時の日本の人口は何人、という文に)
- thanks: 先祖に深くおじぎする人 (感謝の文に)
- hierarchy_top: 人のピラミッドの頂点が赤く灯る (最高権力者・頂点に立つ人の文に)
- neighbor_merge: あなたの家と隣の家の系図が上でひとつに合流する図 (隣の家・佐藤さんの文に)
- child_grandchild: 子3人→孫9人と文中の人数どおりに人が増える図 (子が◯人、孫が◯人の文に)
- swallow_japan: 日本列島を子孫の赤い円が飲み込む図 (日本の人口を丸ごと飲み込む文に)
- twelve_children: 道長の下に12人の子が並ぶ図 (道長に12人の子がいた文に)
- emperor_grandsons: 道長→娘→孫の天皇2人の系図 (後一条天皇・後朱雀天皇・孫が天皇の文に)
- spread_samurai: 貴族から武家へ血筋が流れ込む図 (武家に嫁ぐ・貴族のほとんどの文に)
- wait_stop: 手のひらを突き出して制止する人 (お待ちください、のような文に)
- kakeizu_business: 「家系図お作りします」の看板と巻物 (家系図の商売の文に)
- you_here: 光の鎖のいちばん先に立つあなた (奇跡の積み重ねの先にあなたが立つ文に)
- question: 大きな「?」 (問いかけの文に) / roadmap: 章の箱が順に点灯する目次図 (今日の流れの文に)
- thinking: 疑問に思う人 / surprised: ハッと気づく人 (なんと・実は の文に)
- nodding: 納得してうなずく人 (だから・つまり のまとめの文に)
- chapter: 章扉カード (type は card にする) / quiz: クイズ出題カード (type は card にする)

回転寿司×結婚 (37%ルール) の回で使う題材 (寿司の絵は自動で和風の和紙背景になる):
- sushi_lane: 回転寿司のレーンと流れる皿 (お店の紹介・100皿・レーンの前に座る文に)
- one_plate: 「取れるのは1皿だけ」のルール図 (ルールの説明の文に)
- no_return: 見送った皿は戻らない図 (戻れない・お断りした人とは戻れない・気まずい の文に)
- otoro: 輝く大トロの皿 (大トロが目標・もっとすごいのが来るかも・70皿目にいた の文に)
- maguro: 1皿目のマグロの皿 (マグロが流れてきた・取りますか? の文に)
- pass_all: 皿を全部見送る図 (99皿見送る・最後の一皿が流れてくる の文に)
- gari: ガリの皿 (ガリでした・ガリと添い遂げる の文に)
- regret_balance: 後悔の天秤 (早く取っても待ちすぎても後悔、の文に)
- marriage_math: 皿と人が対応する図 (結婚相手選びとそっくり・お付き合いは一人ずつ・結婚に当てはめる の文に)
- lookonly: 見るだけタイムの目 (最初は選ばない・絶対に取らない・味だけ覚える の文に)
- monosashi: ものさしが育つ図 (ものさしを作る・ものさしが甘い/完璧/もう伸びない の文に)
- grab_best: 過去最高ラインを超えた皿に即、手を伸ばす図 (過去最高が来た瞬間に取る の文に)
- cutoff_line: 0〜100皿の帯と区切り線 (何皿にするか・短すぎ/長すぎ・ちょうどいい長さ の文に)
- chutoro_trap: ニセモノの中トロに飛びつく罠 (そこそこの中トロで手を打ってしまう の文に)
- otoro_lost: 大トロが最初の皿に混ざる確率の図 (70%で見るだけの中・取るものがなくなる の文に)
- plus_one: 見るだけを1皿延ばすと?の図 (1皿延ばす・払うもの1%・もらえるもの の文に)
- gain_fade: 効き目がだんだん減る曲線 (最初はぐんぐん効く・だんだん効かなくなる の文に)
- cost_vs_gain: 払うもの一定 vs もらえるもの減少の交差図 (釣り合う・分かれ目が37% の文に)
- success_mountain: 成功率の山のグラフ (10皿なら23%・37皿で37.1%・頂上・下がる の文に)
- euler_e: 数学の有名人 e=2.718 の図 (2.718・e・1をeで割ると0.368・一致する の文に)
- yamakan: ヤマ勘1% vs 作戦あり37% (ヤマ勘なら1%・37倍 の文に)
- age_timeline: 20〜40歳の年齢軸と27歳の印 (27歳・年齢に当てはめる の文に)
- human_not_sushi: 皿と人の間に≠ (人は寿司ではない・数字で並べられない の文に)
- many_sides: 人の魅力は多面的の図 (優しいけど朝弱い・頼れるけど歌いすぎ・どちらが上? の文に)
- person_flees: 寿司は逃げないが人は逃げる図 (向こうがあなたを選ぶか・人は逃げる の文に)
- apply_anywhere: 家・就職・車・レストランの図 (結婚以外にも使える・家探しなら の文に)

この作風だけの決まり:
- 同じ題材が2文以上続かないように散らす。語り・つなぎの文は thinking ばかりにせず、
  文意に合わせて surprised / nodding / question などを使い分ける
- 絵は文の言葉に細かく寄り添わせる。文中に「掛け算」とあれば multiply_imagine、
  「親は2人」なら parents のように、その文で口にした物事が画面に見えるように選ぶ
- 章の切り替え文 (「第1章」「第2章」のように章タイトルを宣言する文) は type を card、
  motif を chapter にして、title に章タイトルだけ (例: 先祖の倍々ゲーム) を入れる
- ただし「第1章で数え、第2章で〜」のように複数の章をまとめて予告する文はカードにせず、
  roadmap などの図解にする
- クイズの出題を宣言する文 (「ここで問題です」「ここで2問目です」など) は type を card、motif を quiz にする
- 「答えは〜」「つまり〜」のような核心の文と、最後の結論の文は card にして
  emphasis に核心の短い語句 (本文中にそのまま含まれる語) を入れる
- 数値の倍率や比較が主役の文は chart にして、items を [{label, value, unit}] にする (value は数値だけ)`;

const PROMPT = (sentences: string[], preset: Preset) => `${
  preset === "ashi"
    ? ASHI_HEADER()
    : preset === "manabi"
      ? MANABI_HEADER()
      : preset === "rekishi"
        ? REKISHI_HEADER()
        : preset === "kouzou"
          ? KOUZOU_HEADER()
          : preset === "keizai"
            ? KEIZAI_HEADER()
            : preset === "suuri"
              ? SUURI_HEADER()
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
        : preset === "kouzou"
          ? `  例「生成りの紙の背景に、黒いピクトグラムで描いた会議室。テーブルを囲む人型と増えていく吹き出し、青緑の矢印」。
  生成り背景・黒ピクトグラム・線と矢印の図解、差し色は青緑だけ、というフラットな雰囲気で。
  文字やグラフを画像内に描かせない。`
        : preset === "keizai"
          ? `  例「濃紺のニューススタジオ。白いフリップボードに円とドルの硬貨のイラスト、赤い見出しバー」。
  ニュース番組のフリップ風、濃紺スタジオ+白ボード+赤と黄色の差し色、という雰囲気で。
  文字やグラフを画像内に描かせない。`
        : preset === "suuri"
          ? `  例「真っ黒な背景に白い線で描いた家系図。上へ倍々に枝分かれし、一番上の一人だけ赤く灯る」。
  真っ黒の背景・白い線のピクトグラム・赤1色の強調、という数理図解の雰囲気で。
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
          : preset === "kouzou"
            ? kouzouHeuristicAssign(s)
            : preset === "keizai"
              ? keizaiHeuristicAssign(s)
              : preset === "suuri"
                ? suuriHeuristicAssign(s)
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
          : preset === "kouzou"
            ? ALL_KOUZOU_MOTIFS
            : preset === "keizai"
              ? ALL_KEIZAI_MOTIFS
              : preset === "suuri"
                ? ALL_SUURI_MOTIFS
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
  if (preset === "kouzou") {
    if (type === "location" || type === "character") return "meeting";
    return "concept";
  }
  if (preset === "keizai") {
    if (type === "location") return "import_japan";
    if (type === "diagram") return "cost_chain";
    return "concept";
  }
  if (preset === "suuri") {
    if (type === "object") return "question";
    if (type === "location") return "village";
    if (type === "diagram") return "concept";
    return "thinking";
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
// クイズの出題宣言の文か (「さて、ここで問題です。」「ここで2問目です。」など)
export function isManabiQuizText(sentence: string): boolean {
  return /ここで(問題|クイズ|[0-9０-９一二三]問目)です/.test(sentence);
}

export function manabiHeuristicAssign(sentence: string): Assignment {
  // 章の切り替え文 (「まず第1章、〜」など) は章扉カード
  if (/第[0-9０-９一二三四五六七八九十]+章/.test(sentence)) {
    return { type: "card", motif: "chapter" };
  }
  // クイズの出題宣言 (「さて、ここで問題です。」など) は控えめな出題カード
  if (isManabiQuizText(sentence)) {
    return { type: "card", motif: "quiz" };
  }
  if (/[0-9０-９]+(?:倍)/.test(sentence)) {
    return { type: "chart", motif: "concept", title: "数字で見る" };
  }
  if (/(でしょうか|だろうか)[。]?$/.test(sentence)) {
    return { type: "object", motif: "question" };
  }
  if (/(水没|地下鉄|ポンプ|くみ出)/.test(sentence)) {
    return { type: "diagram", motif: "flood" };
  }
  // 「脳のゴミ」の文脈は処分場 (trash_layer) ではなく脳の洗浄図に振る
  if (/(アミロイド|老廃物|脳脊髄液|グリンパティック|ゴミ.*脳|脳.*ゴミ|洗い流)/.test(sentence)) {
    return { type: "diagram", motif: "brain_wash", title: "眠る脳の洗浄" };
  }
  if (/(処分場|ゴミ|埋め立て|考古学者)/.test(sentence)) {
    return { type: "diagram", motif: "trash_layer" };
  }
  if (/(数十年.*数百年|年表)/.test(sentence)) {
    return { type: "diagram", motif: "timeline", title: "痕跡が消えていく時間" };
  }
  if (/(答えは|つまり|とは、|かもしれません。?$)/.test(sentence)) {
    return { type: "card", motif: "concept" };
  }
  // 睡眠テーマ
  if (/(レム睡眠|ノンレム|眠りの(リズム|深さ|波)|90分|睡眠周期|周期)/.test(sentence)) {
    return { type: "diagram", motif: "sleep_wave", title: "一晩の眠りの波" };
  }
  if (/(視覚野|扁桃体|前頭前野|夢を見る脳)/.test(sentence)) {
    return { type: "diagram", motif: "dream_brain", title: "夢を見ている脳" };
  }
  if (/(金縛り|脳幹|筋肉への(指令|命令)|動かせなく|安全装置)/.test(sentence)) {
    return { type: "diagram", motif: "body_lock", title: "体が動かない仕組み" };
  }
  if (/(海馬|大脳皮質|保管庫|記憶が.*移|引っ越し)/.test(sentence)) {
    return { type: "diagram", motif: "memory_transfer", title: "記憶の引っ越し" };
  }
  if (/(剪定|刈り込|選別|配線.*整理|つながりは.*(強め|弱め))/.test(sentence)) {
    return { type: "diagram", motif: "pruning", title: "記憶の選別" };
  }
  if (/(グリンパティック|脳脊髄液|老廃物|洗い流|アミロイド|脳の掃除|大掃除)/.test(sentence)) {
    return { type: "diagram", motif: "brain_wash", title: "眠る脳の洗浄" };
  }
  if (/(眠りに落ち|眠っている間|睡眠中|眠るほう|よく眠)/.test(sentence)) {
    return { type: "character", motif: "sleeping" };
  }
  // 睡眠テーマの脇役の絵 (語り・つなぎの文のバリエーション)
  if (/(人生の(およそ)?[0-9０-９]分の[0-9０-９]|合計で.*[0-9０-９]+年)/.test(sentence)) {
    return { type: "diagram", motif: "life_pie", title: "人生の時間" };
  }
  if (/(ローン|家を買)/.test(sentence)) {
    return { type: "object", motif: "house_loan" };
  }
  if (/([0-9０-９]+つの章|章に分けて)/.test(sentence)) {
    return { type: "diagram", motif: "roadmap", title: "今日の流れ" };
  }
  if (/(目玉|まぶたの下|眼球)/.test(sentence)) {
    return { type: "object", motif: "rem_eye" };
  }
  if (/(目覚まし|起床|朝起き)/.test(sentence)) {
    return { type: "object", motif: "alarm_clock" };
  }
  if (/(エネルギー|活動量|同じ水準|ほとんど変わらない)/.test(sentence)) {
    return { type: "diagram", motif: "energy_meter", title: "ほぼ同じ活動量" };
  }
  if (/(膨大な情報|情報を浴び|見たもの|聞いたこと)/.test(sentence)) {
    return { type: "diagram", motif: "info_flood", title: "日中の情報" };
  }
  if (/(実験|成績|グループ|リスク.*(高ま|関連))/.test(sentence)) {
    return { type: "diagram", motif: "bar_compare", title: "実験の結果" };
  }
  if (/(新しい発見|注目され|ひらめ|大きな発見)/.test(sentence)) {
    return { type: "object", motif: "lightbulb" };
  }
  if (/(散らか|積み上が|たまって|オフィス|放置)/.test(sentence)) {
    return { type: "diagram", motif: "messy_desk" };
  }
  if (/(修理|メンテナンス|整備)/.test(sentence)) {
    return { type: "diagram", motif: "brain_repair", title: "脳の夜間メンテナンス" };
  }
  if (/(夜勤|夜の仕事|夜間シフト|舞台裏)/.test(sentence)) {
    return { type: "location", motif: "night_office" };
  }
  if (/(明日の|翌朝|朝にな|目覚めたとき)/.test(sentence)) {
    return { type: "location", motif: "sunrise" };
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
  // 語り・つなぎの文のバリエーション (どのテーマにも当てはまらなかったとき)
  if (/(なんと|実は|意外に|驚く)/.test(sentence)) {
    return { type: "character", motif: "surprised" };
  }
  if (/(だから|そのため|というわけ|なのです。?$)/.test(sentence)) {
    return { type: "character", motif: "nodding" };
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

// ===== kouzou (仕事・組織の構造図解) 用のキーワード機械割り当て =====

// 「次に、沈黙のコストです。」のような章の切り替えの短い文か (濃紺カードにしてよい文)
export function isKouzouChapterText(sentence: string): boolean {
  const t = sentence.trim();
  return (
    /^(まず|つぎに|次に|最後に|さいごに|続いて|そして|第[一二三四五1-9１-９])/.test(t) &&
    t.length <= 26
  );
}

export function kouzouHeuristicAssign(sentence: string): Assignment {
  const quoted = [...sentence.matchAll(/「([^」]+)」/g)].map((m) => m[1]);
  // 章の切り替え (短い見出し文) → 濃紺カード。「次に、◯◯です。」の◯◯を強調
  if (isKouzouChapterText(sentence)) {
    const m = sentence.match(/[、,](.+?)です。?$/);
    return { type: "card", motif: "concept", emphasis: m?.[1] };
  }
  // 最後の結論・核心の文 → カード (最終シーン以外は enforce が図解に戻す)
  if (/(最初の一歩|答えは)/.test(sentence)) {
    return { type: "card", motif: "concept", emphasis: quoted[0] };
  }
  if (/(パーキンソン|使い切る|膨張)/.test(sentence)) {
    return { type: "diagram", motif: "law", emphasis: quoted[0] };
  }
  if (/(錨|予約された|分で結論|分かけて)/.test(sentence)) {
    return { type: "diagram", motif: "anchor" };
  }
  if (/(沈黙|発言|一言|口を開)/.test(sentence)) {
    return { type: "diagram", motif: "silence" };
  }
  if (/(終わりの条件|条件のない|条件がな|飲み込|終わりがな)/.test(sentence)) {
    return { type: "diagram", motif: "no_end" };
  }
  if (/(同居|混在|押し込|詰め込)/.test(sentence) || /報告.*議論.*決定/.test(sentence)) {
    return { type: "diagram", motif: "mix", items: quoted.length >= 2 ? quoted.map((label) => ({ label })) : undefined };
  }
  // 「鍵は3つ、「A」「B」「C」です」→ 分岐図 (箱のラベルに)
  if (/(鍵は|ポイントは|[0-9０-９三]つ)/.test(sentence) && quoted.length >= 2) {
    return {
      type: "diagram",
      motif: "structure",
      title: "3つの鍵",
      items: quoted.map((label) => ({ label })),
    };
  }
  if (/(構造|設計|仕組み|つまり)/.test(sentence)) {
    return { type: "diagram", motif: "structure", emphasis: quoted[0] };
  }
  if (/会議/.test(sentence)) {
    return { type: "character", motif: "meeting" };
  }
  return { type: "diagram", motif: "concept" };
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

// ===== suuri (数理・統計の図解) 用のキーワード機械割り当て =====
// クイズの出題宣言は manabi と同じ決まり文句 (isManabiQuizText) を使う
export function suuriHeuristicAssign(sentence: string): Assignment {
  // 章の切り替え文 (「まず第1章、〜」など) は章扉カード。
  // 「第1章で数え、第2章で〜」のような予告の文は章扉にしない (「章」の直後に読点・句点がある時だけ)
  if (/第[0-9０-９一二三四五六七八九十]+章[、。]/.test(sentence)) {
    return { type: "card", motif: "chapter" };
  }
  // クイズの出題宣言 (「さて、ここで問題です。」など) は控えめな出題カード
  if (isManabiQuizText(sentence)) {
    return { type: "card", motif: "quiz" };
  }
  // 核心の文・種明かしはカード (答えの数字もカードで見せる)
  // 「〜のあとは、」が「とは、」に誤マッチしないよう直前の「あ」を除外する
  if (/(答えは|(?<!あ)とは、|呼びます|ひとつにまとめ)/.test(sentence)) {
    const q = sentence.match(/「([^」]+)」/);
    return { type: "card", motif: "concept", emphasis: q?.[1] };
  }
  // --- 回転寿司×結婚 (37%ルール) の回: 具体的な言葉から順に判定する ---
  if (/(人は、寿司では|寿司ではありません|人の魅力|数字で並べ|寿司より)/.test(sentence)) {
    return { type: "diagram", motif: "human_not_sushi", title: "人は寿司ではない" };
  }
  if (/(1皿延ば|一皿延ば|ものさしの精度|見送ってしまう危険|危険が1%|プラス1)/.test(sentence)) {
    return { type: "diagram", motif: "plus_one", title: "もう1皿見送ると" };
  }
  if (/中トロ/.test(sentence)) {
    return { type: "diagram", motif: "chutoro_trap", title: "ニセの最高、中トロ" };
  }
  if (/(取るものがなくな|残りの70|70皿に混ざ)/.test(sentence)) {
    return { type: "diagram", motif: "otoro_lost", title: "完璧すぎたものさし" };
  }
  if (/(2\.718|ネイピア|は、e|をeで|0\.368|自然対数|数字には正体|この数にぴったり|数学の大スター)/.test(sentence)) {
    return { type: "diagram", motif: "euler_e", title: "数学の宝物 e" };
  }
  if (/(取れる確率|頂上|てっぺん|山の形|37\.1|36\.5|90皿では|成功率)/.test(sentence)) {
    return { type: "chart", motif: "success_mountain", title: "成功率の山" };
  }
  if (/大トロ/.test(sentence)) {
    return { type: "diagram", motif: "otoro", title: "狙いは大トロ" };
  }
  if (/(マグロ|1皿目が流れ)/.test(sentence)) {
    return { type: "diagram", motif: "maguro", title: "1皿目のマグロ" };
  }
  if (/ガリ/.test(sentence)) {
    return { type: "object", motif: "gari" };
  }
  if (/(99皿|最後の一皿|最後の1皿|全部見送)/.test(sentence)) {
    return { type: "diagram", motif: "pass_all", title: "全部見送ると…" };
  }
  if (/(一生に1皿|一生に一皿|1皿だけ|一皿だけ|ルールは[2２]つ)/.test(sentence)) {
    return { type: "diagram", motif: "one_plate", title: "一生に一皿だけ" };
  }
  if (/(見送った皿|二度と戻|戻れません|気まずい|やり直(し|せ))/.test(sentence)) {
    return { type: "diagram", motif: "no_return", title: "戻ってこない" };
  }
  if (/後悔/.test(sentence)) {
    return { type: "diagram", motif: "regret_balance", title: "どちらも後悔" };
  }
  if (/(ぐんぐん|効かなくな|伸びが鈍|[0-9０-９]+皿目から[0-9０-９]+皿目)/.test(sentence)) {
    return { type: "chart", motif: "gain_fade", title: "伸びは鈍っていく" };
  }
  if (/(釣り合|分かれ目|損と得|払うものはずっと|もう延ばさない)/.test(sentence)) {
    return { type: "chart", motif: "cost_vs_gain", title: "損と得の分かれ目" };
  }
  if (/(家探し|就職活動|中古車|レストラン選び|人生は「?戻れない選択)/.test(sentence)) {
    return { type: "diagram", motif: "apply_anywhere", title: "戻れない選択はどこにでも" };
  }
  if (/(何皿にするか|短すぎ|長すぎ|ちょうどいい長さ|どこで区切)/.test(sentence)) {
    return { type: "diagram", motif: "cutoff_line", title: "どこで区切る？" };
  }
  if (/(過去最高|迷わず取る|超えた皿)/.test(sentence)) {
    return { type: "diagram", motif: "grab_best", title: "過去最高を超えたら取る" };
  }
  if (/ものさし/.test(sentence)) {
    return { type: "diagram", motif: "monosashi", title: "心のものさし" };
  }
  if (/(見るだけ|絶対に取らない|最初は選ばない)/.test(sentence)) {
    return { type: "diagram", motif: "lookonly", title: "見るだけタイム" };
  }
  if (/(ヤマ勘|37倍|当てずっぽう)/.test(sentence)) {
    return { type: "diagram", motif: "yamakan", title: "ヤマ勘の37倍" };
  }
  if (/(27歳|20歳から40歳|婚活の期間)/.test(sentence)) {
    return { type: "diagram", motif: "age_timeline", title: "37%地点は何歳？" };
  }
  if (/(朝に.*弱い|歌いすぎ|どちらが「?上|点数では測れ)/.test(sentence)) {
    return { type: "diagram", motif: "many_sides", title: "人には色々な面がある" };
  }
  if (/逃げ/.test(sentence)) {
    return { type: "diagram", motif: "person_flees", title: "寿司は逃げない、人は逃げる" };
  }
  if (/(結婚相手|結婚に当てはめ|お付き合い|婚活|プロポーズ|お見合い)/.test(sentence)) {
    return { type: "diagram", motif: "marriage_math", title: "結婚を数学で考える" };
  }
  if (/(回転寿司|レーンの前|お寿司屋)/.test(sentence)) {
    return { type: "diagram", motif: "sushi_lane", title: "回転寿司のレーン" };
  }
  // --- 文に寄り添う絵: 具体的な言葉から順に判定する (上にあるほど優先) ---
  if (/最高権力者/.test(sentence)) {
    return { type: "diagram", motif: "hierarchy_top", title: "平安の最高権力者" };
  }
  if (/(隣の家|佐藤さん)/.test(sentence)) {
    return { type: "diagram", motif: "neighbor_merge", title: "隣の家ともどこかで合流" };
  }
  if (/子が[0-9０-９]+人、孫/.test(sentence)) {
    return { type: "diagram", motif: "child_grandchild", title: "子3人なら孫9人" };
  }
  if (/(丸ごと飲み込|人口を丸ごと)/.test(sentence)) {
    return { type: "diagram", motif: "swallow_japan", title: "日本を丸ごと飲み込む" };
  }
  if (/[0-9０-９]+人の子がい/.test(sentence)) {
    return { type: "diagram", motif: "twelve_children", title: "道長の子は12人" };
  }
  if (/(後一条|後朱雀|孫から.{0,8}天皇)/.test(sentence)) {
    return { type: "diagram", motif: "emperor_grandsons", title: "孫が天皇になった" };
  }
  if (/(武家|貴族のほとんど)/.test(sentence)) {
    return { type: "diagram", motif: "spread_samurai", title: "貴族から武家へ" };
  }
  if (/(お待ちください|名乗ろうと決めた)/.test(sentence)) {
    return { type: "character", motif: "wait_stop" };
  }
  if (/(お作りします|という商売|家系図ビジネス)/.test(sentence)) {
    return { type: "object", motif: "kakeizu_business" };
  }
  if (/(いちばん先に|あなたが立って)/.test(sentence)) {
    return { type: "diagram", motif: "you_here", title: "そのいちばん先に" };
  }
  if (/(普通の家|代々、普通)/.test(sentence)) {
    return { type: "object", motif: "ordinary_house" };
  }
  if (/(掛け算|少しの想像力)/.test(sentence)) {
    return { type: "character", motif: "multiply_imagine" };
  }
  if (/(数学の話|数学的に|割り算|数理モデル|計算では|計算上)/.test(sentence)) {
    return { type: "diagram", motif: "math_talk", title: "数学で考える" };
  }
  if (/(数字で確かめ|人数を数え)/.test(sentence)) {
    return { type: "object", motif: "tally" };
  }
  if (/(父と母|[2２]人の親|親から子へ)/.test(sentence)) {
    return { type: "diagram", motif: "parents", title: "あなたの親は2人" };
  }
  if (/(曽祖父母は[0-9０-９]|その上は[0-9０-９])/.test(sentence)) {
    return { type: "diagram", motif: "number_ladder", title: "倍々に増える先祖" };
  }
  if (/(全校生徒|学校)/.test(sentence)) {
    return { type: "diagram", motif: "school", title: "1,024人のたとえ" };
  }
  if (/(仙台|市の人口)/.test(sentence)) {
    return { type: "diagram", motif: "city_pop", title: "105万人のたとえ" };
  }
  if (/軽く超え/.test(sentence)) {
    return { type: "character", motif: "surprised" };
  }
  if (/(地球|総人口|世界中の人類)/.test(sentence)) {
    return { type: "diagram", motif: "globe_pop", title: "地球の人口との比較" };
  }
  if (/(江戸時代の中ごろ|というと、江戸|平安時代の後半|千年前という時間)/.test(sentence)) {
    return { type: "diagram", motif: "timeline", title: "時間をさかのぼる" };
  }
  if (/(日本の人口は|日本の人口では)/.test(sentence)) {
    return { type: "diagram", motif: "japan_pop", title: "当時の日本の人口" };
  }
  if (/([0-9０-９]+代(さかのぼ|前)|約10億|1兆席|席は10億)/.test(sentence)) {
    return { type: "diagram", motif: "exp_curve", title: "先祖の席の数" };
  }
  if (/(掛け持ち|何度も座|[0-9０-９]+席の|席を埋め)/.test(sentence)) {
    return { type: "diagram", motif: "seat_share", title: "同じ人が席を掛け持ち" };
  }
  if (/(はとこ|共通の曽祖父母|二重に登場)/.test(sentence)) {
    return { type: "diagram", motif: "hatoko", title: "はとこ婚の家系図" };
  }
  if (
    /(子孫.*(増え|広が|行き渡|飲み込)|大繁栄|ばらま|孫からは|血筋.*広が)/.test(
      sentence,
    )
  ) {
    return { type: "diagram", motif: "descend_tree", title: "子孫の倍々ゲーム" };
  }
  if (
    /(倍々|2倍に|それぞれ親|祖父母は[0-9０-９]|先祖の席.*増え|きれいな木|枝分かれ|先祖の数を数え)/.test(
      sentence,
    )
  ) {
    return { type: "diagram", motif: "doubling_tree", title: "先祖の倍々ゲーム" };
  }
  if (/(日本中|佐藤さん|親戚|合流|日本人全体|隣の人|みんな道長)/.test(sentence)) {
    return { type: "diagram", motif: "japan_net", title: "日本はひとつの網" };
  }
  if (/(網|絡み合|枝と枝|くっつ|収束)/.test(sentence)) {
    return { type: "diagram", motif: "net_merge", title: "木から網へ" };
  }
  if (/(ポイントは?[0-9０-９三]つ|[0-9０-９]つあります)/.test(sentence)) {
    return { type: "diagram", motif: "three_points", title: "なぜ道長なのか" };
  }
  if (/[0-9０-９]つ目、千年前/.test(sentence)) {
    return { type: "diagram", motif: "michinaga" };
  }
  if (/(絶え|途絶|子に恵まれない|流行り病|残せていません)/.test(sentence)) {
    return { type: "diagram", motif: "extinct_line", title: "家系の断絶" };
  }
  if (/(きさき|后|天皇|一家三后)/.test(sentence)) {
    return { type: "diagram", motif: "crown", title: "一家三后" };
  }
  if (/くじ/.test(sentence)) {
    return { type: "object", motif: "lottery" };
  }
  if (/(命をつない|途切れず|積み重(ね|な)|リレー|千年間を)/.test(sentence)) {
    return { type: "diagram", motif: "chain_lights", title: "千年の命のリレー" };
  }
  if (/(農民|漁師|名もなき|本当にすごいのは)/.test(sentence)) {
    return { type: "character", motif: "unknown_farmer" };
  }
  if (/誰ひとり知り/.test(sentence)) {
    return { type: "object", motif: "question" };
  }
  if (/(経路|何本|何万本|たどり着け)/.test(sentence)) {
    return { type: "diagram", motif: "path_count", title: "道長への道" };
  }
  if (/(DNA|半分の半分|ほぼ0|面影|受け継)/.test(sentence)) {
    return { type: "diagram", motif: "dna_half", title: "薄まるDNA" };
  }
  if (
    /(系図|創作|借り物|紙で証明|記録は、?ほとんど残|[0-9０-９]つ目、記録|記録の話|名前と記録)/.test(
      sentence,
    )
  ) {
    return { type: "object", motif: "scroll" };
  }
  if (/(年賀状|正月)/.test(sentence)) {
    return { type: "object", motif: "nengajo" };
  }
  if (/感謝/.test(sentence)) {
    return { type: "character", motif: "thanks" };
  }
  if (/(昔の村|村では)/.test(sentence)) {
    return { type: "location", motif: "village" };
  }
  if (/([0-9０-９]+つの章|章で|今日の流れ)/.test(sentence)) {
    return { type: "diagram", motif: "roadmap", title: "今日の流れ" };
  }
  if (/(道長|この世をば|望月)/.test(sentence)) {
    return { type: "diagram", motif: "michinaga" };
  }
  if (/(どう考えても|何かがおかしい)/.test(sentence)) {
    return { type: "character", motif: "thinking" };
  }
  if (/核心/.test(sentence)) {
    return { type: "object", motif: "question" };
  }
  if (/(でしょうか|だろうか)[。]?$/.test(sentence)) {
    return { type: "object", motif: "question" };
  }
  // 語り・つなぎの文のバリエーション
  if (/(なんと|実は|意外に|驚く|おかしい|奇跡)/.test(sentence)) {
    return { type: "character", motif: "surprised" };
  }
  if (/(だから|そのため|というわけ|なのです。?$|大丈夫です)/.test(sentence)) {
    return { type: "character", motif: "nodding" };
  }
  return { type: "character", motif: "thinking" };
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
