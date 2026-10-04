# 頼んで作る動画工場

台本 (ただのテキスト) をGistに貼ってボタンを押すと、ナレーション・フラットイラスト・字幕入りのMP4が自動で出てくる仕組み。

## 毎回やること (2つだけ)

1. [gist.github.com](https://gist.github.com) に台本を貼る → Create secret gist → **Raw** ボタンを押してURLをコピー
2. このリポジトリの **Actions** タブ → 「動画を生成」→ **Run workflow** → GistのURLを貼って実行

約10〜60分後 (台本の長さ次第)、実行結果ページ下部の **Artifacts** から `video` をダウンロード。

## 台本の書き方

- ただのテキスト。見出し・話者表記・番号は不要
- 1文 = 1シーン。**30〜70字**を目安に句点 (。) で区切る
- 3分動画なら 30〜40文 / 約1,000〜1,400字
- 漢字かな交じりのまま書く (ひらがなに開くと音声が片言になる)
- サンプル: `docs/sample-script.txt`

## 必要なSecrets (Settings → Secrets and variables → Actions)

| Name | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | 台本の各文に絵を割り当てる |
| `ELEVENLABS_API_KEY` | ナレーション合成 (ElevenLabs使用時のみ) |
| `ELEVENLABS_VOICE_ID` | 使う声 (ElevenLabs使用時のみ) |
| `GIST_TOKEN` | 台本の読み取り (gist権限のみ) |
| `GEMINI_API_KEY` | シーンごとのAI画像生成 (現在オフ。ワークフローのコメントを外すと有効) |

## ナレーション (VOICEVOX)

標準の音声エンジンはVOICEVOX (無料・日本語専用)。キーは不要で、GitHub Actionsが自動で起動する。
声の変更は `src/channel.ts` の `voicevoxSpeaker` を書き換える (サンプル: https://voicevox.hiroshiba.jp/ )。

**重要**: 動画の説明欄に「VOICEVOX:青山龍星」のようにキャラ名のクレジットを必ず書くこと (利用条件)。
ElevenLabsに戻すには `src/channel.ts` の `engine` を `"elevenlabs"` にする。

## 中の構成

```
.github/workflows/generate.yml  ← 実行ボタンの中身
src/
  channel.ts     ← チャンネル名・締めの文句 (ここだけ直せば全部に反映)
  style.ts       ← お手本の実測値から決めた作風の条件
  motifs.ts      ← 絵の題材一覧
  generator/     ← 台本読込 → AI絵づけ → 機械的補正 → 音声合成
  remotion/      ← 実際に絵を描く部分 (6種類の画面の型)
docs/
  style-guide.md ← 作風の実測値と条件 (印象で直す前に読む)
```

## BGMを付けたいとき

`public/bgm.mp3` を置いてコミットすると、自動でナレーションの下に小さく敷かれる。

## 最初は必ず短い台本で

いきなり長い台本で試さない。まず `docs/sample-script.txt` (10文) で最後まで通ることを確認してから本番へ。
失敗した実行でも音声の費用は発生するため。
