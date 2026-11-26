# 目覚まし回の共有部品づくり (MezaParts.tsx) の指示

作業フォルダ: /Users/suzukiyuu/Desktop/1005/movie
あなたの仕事: からくり作風の動画「人はなぜ、自力で起きられないのか」(目覚まし回) で、**何度も出てくる装置と人物だけ**を、先に共有部品として作ることです。あとで19人の絵師がこの部品を使って1文1枚の絵を描きます。部品の見た目がそのまま全編の見た目になるので、ここが一番作り込むところです。

> 作者の注文: 速さは評価されません。緻密さが評価されます。

## 開いてよいファイル
1. `docs/meza-design-common.md` — 「登場人物の見た目」と「共有装置」の節を読む。部品の名前・props・使い道はここが正本
2. `src/remotion/karakuri/HimaParts.tsx` — **書き方の見本** (前回の暇の回の共有部品)。`grep -n "^export"` で一覧を出し、`EkiHome` と `ShockRoom` と `Sousa` を offset/limit で読む。import のしかた、線の太さ、色の付け方、`f` での動かし方、最後のプレビュー用コンポーネント (HimaPartsPreview) の作り方を真似る
3. `src/remotion/karakuri/KarakuriScenes.tsx` — 共通の道具。**丸ごと読まない**。`grep -n "^export"` で一覧を出し、`Person` (158行目あたり〜) と `KRP` (色) と `seg` `pop` `easeOut` `clamp01` だけ offset/limit で読む
4. `src/remotion/Root.tsx` — 最後にプレビューの Composition を1つ足すときだけ (HimaParts の登録を grep して真似る)

上以外 (制作ガイド・台本・他の絵師の tsx) は開かない。

## 作るもの: `src/remotion/karakuri/MezaParts.tsx`
meza-design-common.md の「共有装置」に書いた全部品と色 `MP`:
`MP` / `Shinshitsu` / `SumahoAlarm` / `TainaiDokei` / `Kobito` / `Shudouin` / `TokiNoKane` / `BanninTou` / `KoujouMon` / `MachiNami` / `KnockerUp` / `BellClock` / `Clocky` / `NazoBell`

- props は common に書いたとおり (名前を変えない)。足りないと思う props は足してよい (省略可能にする)
- 背景つきの部品 (Shinshitsu / Shudouin / TokiNoKane / BanninTou / KoujouMon / MachiNami) は 1920×1080 の画面いっぱいの舞台。`<svg width={1920} height={1080}>` の中に描く `<g>` を返す形にそろえる (HimaParts の EkiHome と同じ形)。手前に人を重ねられるよう、人は部品に入れない (KnockerUp は除く)
- 小物の部品 (SumahoAlarm / TainaiDokei / Kobito / KnockerUp / BellClock / Clocky / NazoBell) は `x, y, s` で置ける `<g>`
- 線・色・ゆらぎはからくり作風にそろえる (KRP の ink の輪郭線、strokeWidth は Hima と同じくらい。手描き風)
- **作り込み**: 時計ならベル・ハンマー・脚・ゼンマイのつまみ・文字盤の数字と目盛り・ガラスのつや。修道院なら石の目地・アーチ・ろうそくの炎とたれたろう・木のベッドの木目。工場なら れんがの目地・煙突のすす・鉄の門の飾り・時計の文字盤。長屋なら れんが・窓枠・カーテン・ガス灯の炎・石畳。ノッカー・アップなら棒の先の針金の房・コートのボタン・マフラーのはためき
- **必ず動く**: 静止画は禁止。`f` で ろうそくがゆらぐ・ガス灯がゆらぐ・煙がのぼる・まばたき・体のゆれ。ring/run などの props は 0〜1 でなめらかに効く
- **人物の男女**: KnockerUp の `female` 版は、肩掛け・帽子・**長いスカート**・後ろで結んだ髪の房でひと目で女性と分かるように。`old` 版は白髪・白い口ひげ・少し曲がった腰。**腕は必ず2本** (Person を使うなら pose で腕を出し、自分で腕を足すときは Person の腕と重ならないように)
- Person を使う部品は Person の props (face, pose, f) をそのまま外から渡せるようにする

## プレビューと確認
- ファイルの最後に `MezaPartsPreview` (1コマ = 1部品の見本。全部品を並べる。HimaPartsPreview と同じ作り方) と `MEZA_PARTS_PREVIEW_FRAMES` を書き、Root.tsx に Composition "MezaParts" を足す
- 静止画で確認: `npx remotion still MezaParts tmp/meza/parts-NN.png --frame=NN` を部品ごとに書き出して1枚ずつ Read で見る。気になる所を直して、もう1巡 (2巡まで)
- ring / run / reset などの動きは、同じ部品を props を変えて2つ並べた見本も作って確かめる
- `npx tsc --noEmit -p .` でエラー0を確認

## 終わったら
作った部品の名前と props の一覧を、1部品1行で返す (使い方の注意があれば一言)。本文のコードは返さない。
