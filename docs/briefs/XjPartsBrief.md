# クリスマス回B だけの部品づくり (XjParts.tsx) の指示

作業フォルダ: /Users/suzukiyuu/Desktop/1005/movie
あなたの仕事: からくり作風のクリスマス回2本 (A「サンタクロースは、だれが作ったのか」/ B「日本のクリスマスは、なぜこうなったのか」) のうち、**B の回だけで何度も出てくる装置**を、先に部品として作ることです。A・B 共通の部品 (XmasParts.tsx) は別の人が同時に作っています。あとで約36人の絵師がこの部品を使って1文1枚の絵を描きます。部品の見た目がそのまま全編の見た目になるので、ここが一番作り込むところです。

> 作者の注文: 速さは評価されません。緻密さが評価されます。

## 開いてよいファイル
1. `docs/xj-design-common.md` — **全部読む**。「B だけの部品 (`XjParts.tsx`)」の節が名前と props の正本。軸・笑いどころ・時代の舞台も読む
2. `src/remotion/karakuri/HimaParts.tsx` — **書き方の見本** (前回の暇の回の共有部品)。`grep -n "^export"` で一覧を出し、`EkiHome` と `ShockRoom` と `Sousa` を offset/limit で読む。import のしかた、線の太さ、色の付け方、`f` での動かし方、最後のプレビュー用コンポーネント (HimaPartsPreview) の作り方を真似る
3. `src/remotion/karakuri/KarakuriScenes.tsx` — 共通の道具。**丸ごと読まない**。`grep -n "^export"` で一覧を出し、`Person` (158行目あたり〜) と `KRP` (色) と `seg` `pop` `easeOut` `clamp01` だけ offset/limit で読む
4. `src/remotion/Root.tsx` — 最後にプレビューの Composition を1つ足すときだけ (HimaParts の登録を grep して真似る)

上以外 (制作ガイド・台本・他の絵師の tsx) は開かない。

## 作るもの: `src/remotion/karakuri/XjParts.tsx`
`docs/xj-design-common.md` の「B だけの部品 (`XjParts.tsx`)」の節にある部品すべて。
- props は common のとおり (名前を変えない)。足りない props は省略可能で足してよい
- 背景つきの舞台は 1920×1080 いっぱいの `<g>` (HimaParts の EkiHome の形)。人は入れない
- 小物は `x, y, s` で置ける `<g>`
- 線・色・ゆらぎはからくり作風にそろえる。色は自分のファイルの中に定数で (XmasParts の XP はまだ無いかもしれないので import しない)
- **作り込み・必ず f で動く**・ロゴや看板の文字は描かない・明かりを黒い図形の点滅で表さない

## プレビューと確認
- ファイルの最後に `XjPartsPreview` (1コマ = 1部品の見本。全部品を並べる。HimaPartsPreview と同じ作り方) と `XJ_PARTS_PREVIEW_FRAMES` を書き、Root.tsx に Composition (★Root.tsx は他の人も同時に編集する。自分の import 1行と Composition 1つだけを足し、他の行は触らない。保存の直前に読み直してから足す) "XjParts" を足す
- 静止画で確認: `export TMPDIR="$(pwd)/tmp/remotion-tmp/"; npx remotion still XjParts tmp/xmas/xjparts-NN.png --frame=NN` を部品ごとに書き出して1枚ずつ Read で見る。気になる所を直して、もう1巡 (2巡まで)
- open / run / fly / belief などの動きは、同じ部品を props を変えて2つ並べた見本も作って確かめる
- `npx tsc --noEmit -p .` でエラー0を確認

## 終わったら
作った部品の名前と props の一覧を、1部品1行で返す (使い方の注意があれば一言)。本文のコードは返さない。
