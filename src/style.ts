// お手本チャンネル5本・791コマの実測値から導いた作風の基準。
// 印象で上書きしないこと。変えるときは docs/style-guide.md も更新する。

export const PALETTE = {
  // 実測: 平均輝度 235/255 (ほぼ白)、平均彩度 3.7%、暖色優位 95%
  background: "#FAF6F0", // 暖かみのあるクリーム白
  backgroundAlt: "#F4EDE3", // 場面転換用のややベージュ
  ink: "#4A4440", // 線・文字の基本色 (真っ黒にしない)
  subtitle: "#3A3633",
  accent: "#D96C5F", // 強調用の赤 (差し色。多用しない)
  accentSoft: "#E8A598",
  warmBeige: "#E3D5C0",
  softBlue: "#8FABBF", // 服などに少量だけ使う寒色
  softGreen: "#A3B98C",
  softYellow: "#E6C97A",
  skin: "#F2D9C4",
  hair: "#B8B2AA", // シニアの白髪グレー
} as const;

export const SCENE_TYPES = [
  "character", // シニアの日常場面 (台所・食卓・買い物など)
  "object", // 食品・物のアップ。白背景中央
  "diagram", // ラベル付き図解 (体の部位・仕組み)
  "chart", // 数量の比較 (棒・円)
  "location", // 場所の全景 (スーパー・部屋)。呼吸用
  "card", // 結論を額装したカード
] as const;
export type SceneType = (typeof SCENE_TYPES)[number];

// 実測に基づく比率の条件。工程3 (機械的な補正) がこれを強制する
export const RATIOS = {
  characterMin: 0.45, // 人物場面は45%以上 (実測 約6割)
  characterMax: 0.65,
  objectMin: 0.15, // 食品・物のアップは15%以上 (実測 約2割)
  infoMin: 0.1, // 図解+チャートは10%以上
  locationEvery: [6, 10] as const, // 6〜10シーンに1回は場所の全景で呼吸を作る
  endCard: true, // 終盤に必ず結論カード
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  scenePaddingSec: 0.35, // 音声の後の間
} as const;

export const SUBTITLE = {
  fontSize: 54,
  bottom: 64, // 画面下端からの距離(px)。帯は敷かない (実測: 白背景に直接)
  maxWidthRatio: 0.84,
  weight: 700,
} as const;
