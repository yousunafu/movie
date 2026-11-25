# 暇の回 第1回修正 — 直し担当の共通ルール

あなたは前回この動画の絵を描いた絵師の後任で、**作者の第1回の修正点**だけを直します。
**まず `docs/briefs/HimaCommon.md` を Read** (絵のルール・部品の使い方は前回と同じ)。そのあと自分の直し指示書を読みます。

- 開いてよいのは: HimaCommon.md、自分の直し指示書、指示書で名指しされた `.tsx` (自分が直すファイル)、`src/remotion/karakuri/HimaParts.tsx` (読むだけ)
- **指示された文 (シーン) だけ**を直す。同じファイルの他の文は触らない。共有ファイル (HimaParts / HimaShared) は編集しない
- 直す前に、そのシーンを今の状態で書き出して見る → 直す → もう一度書き出して見る (2巡まで)
  - 書き出し: `export TMPDIR="$(pwd)/tmp/remotion-tmp/"; node_modules/.bin/remotion render src/remotion/index.ts HimaAll tmp/hima/fix1/<担当名>/ --sequence --frames=<文番号−1>-<文番号−1> --image-format=png --log=error`
  - 動きの確認: `HimaMotion` で コマ = (文番号−1)×200 + f (例: #5 の f=30 は 830)
- 終わったら `node_modules/.bin/tsc --noEmit` でエラー0、`npx tsx scripts/koso-plate-check.ts <ファイル名から.tsxを取った名前>` で NG 0
- 下書きは `tmp/hima/fix1/<担当名>/` の中だけ
- 作者の言葉は原文で各指示書に引用してある。**作者の言ったことを最優先**

## ボタンを押してビリッとする場面の「画面の揺れ」(該当する担当だけ)
作者「イラストがボタンを押してビリっとするときに、画面が揺れる演出とビリって音効果音にないかな？」
- 押した瞬間 (電気が流れる瞬間) から **8コマほど、画面全体 (カメラの `<g>`) が小刻みに揺れて止まる**。揺れ幅は最初 14px くらいから0へ減らす。例:
  ```tsx
  const hit = seg(f, P, P + 8);               // P = 押した瞬間のコマ
  const amp = hit > 0 && hit < 1 ? 14 * (1 - hit) : 0;
  const shakeX = amp * Math.sin(f * 2.7), shakeY = amp * Math.cos(f * 3.3);
  <g transform={`translate(${shakeX} ${shakeY})`}> …シーン全体… </g>
  ```
- 効果音は親が別の表で付ける。**押した瞬間のコマ番号 P を報告に必ず書く** (連打の場面は、音を鳴らしたいコマを3〜5個)

## 報告
直したシーンごとに1〜2行で、何をどう直したか。ビリッの場面は押した瞬間のコマ番号。日本語で。
