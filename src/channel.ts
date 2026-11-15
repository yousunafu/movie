// チャンネル固有の名前・決まり文句はこのファイルだけで管理する。
// お手本チャンネルの名前を絶対に入れないこと (なりすまし防止)。
// 変えたいときはここを1か所直せば、動画・音声・画面すべてに反映される。

export const CHANNEL = {
  name: "健康ごはんの教科書", // ←自分のチャンネル名に変える
  iconLetter: "健", // 終了画面のアイコンに入れる1文字
  closingLine:
    "最後までご覧いただきありがとうございました。次回もお役に立つ情報をお届けします。",
} as const;

// 夜の教養エッセイ系 (お手本: 考えすぎる葦 のテイスト分析から。名前は自作)
export const ASHI_CHANNEL = {
  name: "夜ふかしの思考室", // ←自分のチャンネル名に変える
  iconLetter: "夜",
  closingLine: "最後までお付き合いいただき、ありがとうございました。",
} as const;

// 身近な科学の図解解説系 (お手本: 学びたい大人のための大学 のテイスト分析から。名前は自作)
export const MANABI_CHANNEL = {
  name: "おとなの理科室", // ←自分のチャンネル名に変える
  iconLetter: "理",
  closingLine: "最後までご覧いただきありがとうございました。身近な不思議は、まだまだあります。",
} as const;

// 歴史・深い時間スケールの資料図版系 (お手本: 世界史裏探訪 のテイスト分析から。名前は自作)
export const REKISHI_CHANNEL = {
  name: "歴史と時間の資料室", // ←自分のチャンネル名に変える
  iconLetter: "史",
  closingLine: "最後までご覧いただきありがとうございました。歴史の謎は、まだまだ眠っています。",
} as const;

// 仕事・人生・組織の構造図解系 (お手本: Motocrab 世界構造考察 のテイスト分析から。名前は自作)
export const KOUZOU_CHANNEL = {
  name: "しくみの図書館", // ←自分のチャンネル名に変える
  iconLetter: "構",
  closingLine: "最後までご覧いただきありがとうございました。世界の仕組みは、まだまだ解き明かせます。",
} as const;

// 経済ニュース解説系 (お手本: 大人の学び直しTV のテイスト分析から。名前は自作)
export const KEIZAI_CHANNEL = {
  name: "おとなの経済室", // ←自分のチャンネル名に変える
  iconLetter: "経",
  closingLine: "最後までご覧いただきありがとうございました。お金のニュースは、知るほど身近になります。",
} as const;

// 数理・統計で身近な疑問を解く系 (お手本: 考えすぎる葦の数理統計回のテイスト分析から。名前は自作)
export const SUURI_CHANNEL = {
  name: "おとなの数理室", // ←自分のチャンネル名に変える
  iconLetter: "数",
  closingLine: "最後までご覧いただきありがとうございました。世界は、数えてみると違って見えます。",
} as const;

// 身の回りの機械のからくり図解系 (お手本: 最高の老後 のテイスト分析から。名前は自作)
export const KARAKURI_CHANNEL = {
  name: "まちのからくり図鑑", // ←自分のチャンネル名に変える
  iconLetter: "か",
  closingLine:
    // 台本側の最終文に「ご視聴ありがとう」があるため、ここでは繰り返さない (恋愛ドレイク回v3の教訓)
    "身の回りのからくりは、まだまだあります。次回も、お楽しみに。",
} as const;

// 時代と国をまたいで同じ「型」を比べる世界史系 (上司依頼の新チャンネル。名前は自作)
// 語りは姿のない天の声。顔が出るのは掛け合いのときの反応役ひとりだけ。
export const SEKAI_CHANNEL = {
  name: "つながる世界史",
  iconLetter: "世",
  closingLine: "最後までご覧いただきありがとうございました。遠い国の話は、たいてい地続きです。",
} as const;

// 動画の作風 (プリセット)。環境変数 PRESET で切り替える。
// genki = 高齢者向け健康解説 (明るい昼のトーン) / ashi = 夜の教養エッセイ (暗いトーン)
// manabi = 身近な科学の図解解説 (暗い背景+白い線画+オレンジ強調)
// rekishi = 歴史・深い時間の資料図版 (セピアの銅版画調+下2割の黒帯字幕)
// kouzou = 仕事・組織の構造図解 (生成り背景+黒ピクトグラム+青緑差し色+下端の黒帯字幕)
// keizai = 経済ニュース解説 (濃紺スタジオ+白フリップ+赤見出し+黄強調)
// suuri = 数理・統計の図解 (真っ黒背景+白ピクトグラム+赤強調)
// karakuri = 身の回りの機械のからくり図解 (クラフト紙背景+手描き風の線+丸頭キャラ+常時アニメ)
// sekai = つながる世界史 (墨の背景+生成りの線画+錆朱の強調+縦書きの年号札+天の声)
export type Preset =
  | "genki"
  | "ashi"
  | "manabi"
  | "rekishi"
  | "kouzou"
  | "keizai"
  | "suuri"
  | "karakuri"
  | "sekai";

export function getPreset(): Preset {
  if (process.env.PRESET === "ashi") return "ashi";
  if (process.env.PRESET === "manabi") return "manabi";
  if (process.env.PRESET === "rekishi") return "rekishi";
  if (process.env.PRESET === "kouzou") return "kouzou";
  if (process.env.PRESET === "keizai") return "keizai";
  if (process.env.PRESET === "suuri") return "suuri";
  if (process.env.PRESET === "karakuri") return "karakuri";
  if (process.env.PRESET === "sekai") return "sekai";
  return "genki";
}

export function getChannel(preset: Preset) {
  if (preset === "ashi") return ASHI_CHANNEL;
  if (preset === "manabi") return MANABI_CHANNEL;
  if (preset === "rekishi") return REKISHI_CHANNEL;
  if (preset === "kouzou") return KOUZOU_CHANNEL;
  if (preset === "keizai") return KEIZAI_CHANNEL;
  if (preset === "suuri") return SUURI_CHANNEL;
  if (preset === "karakuri") return KARAKURI_CHANNEL;
  if (preset === "sekai") return SEKAI_CHANNEL;
  return CHANNEL;
}

export const VOICE = {
  // 使う音声エンジン: "voicevox" (無料・日本語専用) か "elevenlabs"
  engine: "voicevox" as "voicevox" | "elevenlabs",

  // --- VOICEVOXの設定 ---
  // キャラ名はサンプル https://voicevox.hiroshiba.jp/ で聞き比べて選ぶ。
  // 使ったら動画の説明欄に「VOICEVOX:キャラ名」と書くこと (利用条件)。
  // karakuri (まちのからくり図鑑) だけずんだもん。他チャンネルは従来どおり青山龍星・少しゆっくり。
  // sekai は天の声ナレーション。青山龍星の「ノーマル」。
  // ★2026-11-09 失敗: 重い題材だからと「しっとり」+ 話速0.92 にしたら、
  //   作者「ナレーションの声元気なさすぎでしょ」。しっとりは息を落とすスタイルで、
  //   遅い話速と重なって二重にトーンダウンしていた。
  //   重い題材 = 弱く喋る、ではない。語り手は張りを保ったまま、間で重さを出す。
  voicevoxSpeaker: getPreset() === "karakuri" ? "ずんだもん" : "青山龍星",
  voicevoxStyle: "ノーマル",
  // 1.0が標準。genki系は高齢の視聴者向けに少しゆっくり。
  // karakuri は 2026-11-03「なぜ高層ビルは生まれたのか」から 1.1 (作者指示・少し速め)。
  // sekai は 1.05 (2026-11-09 作者指示「話す速さは1.05とかでいいよ」)。
  // ※ 下の applyPresetVoice() にも同じ値がある。変えるときは両方直すこと
  voicevoxSpeed:
    getPreset() === "karakuri" ? 1.1 : getPreset() === "sekai" ? 1.05 : 0.95,

  // --- 反応役の声 (sekai だけ) ★2026-11-09 追加 ---
  // 作者指示「女性記者が喋るシーンはそこをボイスの種類を変えること」。
  // sekai の反応役は新人記者 (女性)。天の声と同じ声だと誰が喋っているか分からないので、
  // 行まるごとが「」でくるまれた文 (= assign.ts が type:"character" を付けた文) だけ
  // この声に差し替える。字幕・絵は変わらない。
  // 落ち着いた自然な女性の声。可愛すぎる声だと重い題材とぶつかる。
  reactionSpeaker: "冥鳴ひまり",
  reactionStyle: "ノーマル",
  // 天の声より少し速く・抑揚を強く。とっさの相づちに聞こえるように
  // (天の声を1.05に上げたので、こちらも1.1へ。遅いと相づちに聞こえない)
  reactionSpeed: 1.1,
  reactionIntonation: 1.15,

  // --- ElevenLabsの設定 ---
  modelId: "eleven_multilingual_v2",
  stability: 0.5,
  similarityBoost: 0.75,
};

// 台本1行目の「作風:」宣言で決まったプリセットを、声の設定にも反映する。
// VOICE は読み込み時に環境変数 PRESET で初期化されるため、台本の宣言が勝つようにここで上書きする。
// (2026-10 自販機2000年史で、ローカル実行時にPRESET未設定→青山龍星のまま合成された事故の再発防止)
export function applyPresetVoice(preset: Preset) {
  VOICE.voicevoxSpeaker = preset === "karakuri" ? "ずんだもん" : "青山龍星";
  // ※上の VOICE 初期化と同じ値にすること
  VOICE.voicevoxStyle = "ノーマル";
  VOICE.voicevoxSpeed = preset === "karakuri" ? 1.1 : preset === "sekai" ? 1.05 : 0.95;
}

/** 反応役を別の声で喋らせる作風か (いまは sekai の新人記者だけ) */
export function hasReactionVoice(preset: Preset): boolean {
  return preset === "sekai";
}
