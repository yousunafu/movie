# クリスマス回 A・B の共有部品づくり (XmasParts.tsx) の指示

作業フォルダ: /Users/suzukiyuu/Desktop/1005/movie
あなたの仕事: からくり作風のクリスマス回2本 (A「サンタクロースは、だれが作ったのか」/ B「日本のクリスマスは、なぜこうなったのか」) の**両方に何度も出てくる物と人物だけ**を、先に共有部品として作ることです。あとで約36人の絵師がこの部品を使って1文1枚の絵を描きます。部品の見た目がそのまま全編の見た目になるので、ここが一番作り込むところです。

> 作者の注文: 速さは評価されません。緻密さが評価されます。

## 開いてよいファイル
1. `docs/santa-design-common.md` — **全部読む**。「共有部品」の節が名前と props の正本。「登場人物の見た目」のサンタの era 一覧・あなた・子どもの描き分けも必ず読む
1b. `docs/xj-design-common.md` — 「登場人物の見た目」と「共有部品」の節だけ (B で XmasRoom style="japan" などを使う場面を知るため)
2. `src/remotion/karakuri/HimaParts.tsx` — **書き方の見本** (前回の暇の回の共有部品)。`grep -n "^export"` で一覧を出し、`EkiHome` と `ShockRoom` と `Sousa` を offset/limit で読む。import のしかた、線の太さ、色の付け方、`f` での動かし方、最後のプレビュー用コンポーネント (HimaPartsPreview) の作り方を真似る
3. `src/remotion/karakuri/KarakuriScenes.tsx` — 共通の道具。**丸ごと読まない**。`grep -n "^export"` で一覧を出し、`Person` (158行目あたり〜) と `KRP` (色) と `seg` `pop` `easeOut` `clamp01` だけ offset/limit で読む
4. `src/remotion/Root.tsx` — 最後にプレビューの Composition を1つ足すときだけ (HimaParts の登録を grep して真似る)

上以外 (制作ガイド・台本・他の絵師の tsx) は開かない。

## 作るもの: `src/remotion/karakuri/XmasParts.tsx`
santa-design-common.md の「共有部品」の全部品と色 `XP`:
`XP` / `XmasRoom` / `XmasTree` / `Present` / `Stocking` / `SnowTown` / `Sori` / `Tonakai` / `Santa` / `Kodomo` / `Anata`

- props は common に書いたとおり (名前を変えない)。足りないと思う props は足してよい (省略可能にする)
- 背景つきの部品 (XmasRoom / SnowTown) は 1920×1080 の画面いっぱいの舞台。`<svg width={1920} height={1080}>` の中に描く `<g>` を返す形 (HimaParts の EkiHome と同じ形)。手前に人を重ねられるよう、人は部品に入れない
- 小物・人物の部品は `x, y, s` で置ける `<g>`
- 線・色・ゆらぎはからくり作風にそろえる (KRP の ink の輪郭線、strokeWidth は Hima と同じくらい。手描き風)
- **★Santa の era (8種) がこの部品の山場**: どの era でも**白いひげと丸い目は共通**で「同じ人物が時代ごとに姿を変えた」と分かるように。大きさの違い (1823=小人の妖精・nast=とても小さい・classic=人間の大きさで太った温かいおじいさん) をはっきり。nicholas は**顔を描かない** (体ごと後ろ向き。後頭部は白髪+ミトラ)。nast は `mono` prop で白黒 (灰色の濃淡) 版も出せるように
- **作り込み**: ツリーなら枝の重なり・飾り玉のつや・電飾のコード・てっぺんの星。プレゼントなら包装紙の柄・リボンの結び目・やぶれた紙の端。暖炉なられんがの目地・炎・マントルピース。こたつなら布団の柄・天板・みかん。トナカイなら毛並み (細い毛流れの線は描かない・塗りの濃淡で)・角の枝分かれ・ひづめ。ソリなら木目・金具・鈴
- **必ず動く**: 静止画は禁止。`f` で雪が降る・炎がゆれる・電飾がまたたく (ふわっと明るさが変わる。**黒い図形を重ねた点滅で明かりを表さない**)・まばたき・体のゆれ。open/run/fly/belief などは 0〜1 でなめらかに効く
- **人物の男女**: Kodomo の `girl` 版は、肩まで届く髪か結んだ髪の房+スカートでひと目で女の子と分かるように。**腕は必ず2本** (Person を使うなら pose で腕を出し、自分で腕を足すときは Person の腕と重ならないように)
- Person を使う部品は Person の props (face, pose, f) をそのまま外から渡せるようにする
- **ロゴ・看板の文字は描かない**

## プレビューと確認
- ファイルの最後に `XmasPartsPreview` (1コマ = 1部品の見本。全部品を並べる。Santa は era 8種を1コマずつ。HimaPartsPreview と同じ作り方) と `XMAS_PARTS_PREVIEW_FRAMES` を書き、Root.tsx に Composition "XmasParts" を足す
- 静止画で確認: `export TMPDIR="$(pwd)/tmp/remotion-tmp/"; npx remotion still XmasParts tmp/xmas/parts-NN.png --frame=NN` を部品ごとに書き出して1枚ずつ Read で見る。気になる所を直して、もう1巡 (2巡まで)
- open / run / fly / belief などの動きは、同じ部品を props を変えて2つ並べた見本も作って確かめる
- `npx tsc --noEmit -p .` でエラー0を確認

## 終わったら
作った部品の名前と props の一覧を、1部品1行で返す (使い方の注意があれば一言)。本文のコードは返さない。
