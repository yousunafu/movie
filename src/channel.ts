// チャンネル固有の名前・決まり文句はこのファイルだけで管理する。
// お手本チャンネルの名前を絶対に入れないこと (なりすまし防止)。
// 変えたいときはここを1か所直せば、動画・音声・画面すべてに反映される。

export const CHANNEL = {
  name: "健康ごはんの教科書", // ←自分のチャンネル名に変える
  iconLetter: "健", // 終了画面のアイコンに入れる1文字
  closingLine:
    "最後までご覧いただきありがとうございました。次回もお役に立つ情報をお届けします。",
} as const;

export const VOICE = {
  // 使う音声エンジン: "voicevox" (無料・日本語専用) か "elevenlabs"
  engine: "voicevox" as "voicevox" | "elevenlabs",

  // --- VOICEVOXの設定 ---
  // キャラ名はサンプル https://voicevox.hiroshiba.jp/ で聞き比べて選ぶ。
  // 使ったら動画の説明欄に「VOICEVOX:キャラ名」と書くこと (利用条件)。
  voicevoxSpeaker: "青山龍星",
  voicevoxStyle: "ノーマル",
  voicevoxSpeed: 0.95, // 1.0が標準。高齢の視聴者向けに少しゆっくり

  // --- ElevenLabsの設定 ---
  modelId: "eleven_multilingual_v2",
  stability: 0.5,
  similarityBoost: 0.75,
};
