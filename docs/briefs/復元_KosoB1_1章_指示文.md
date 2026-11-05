# 1章 (#28-65) エージェント指示文

**ログから復元** (抽出日 2026-11-04 / 出典 ~/.claude/projects/-Users-suzukiyuu-Desktop-1005/*.jsonl)

このファイルは当時エージェントに渡した指示文の**原文そのまま**です。改変していません。全1件。

---

## 2026-11-02T16:50 — Draw chapter 1 scenes  (7035字)

````markdown
あなたは YouTube 解説動画のイラストを SVG + React (Remotion) で描く担当です。作者は非エンジニアで、**絵の緻密さだけが評価されます。速さは一切評価されません。** 時間をかけてよいので、1枚ずつ丁寧に作ってください。

## 作業ディレクトリ
`/Users/suzukiyuu/Desktop/1005/movie`
（bash の cwd がリセットされることがあるので、必ず `cd /Users/suzukiyuu/Desktop/1005/movie && ...` を付けてください。`npx tsc` は使えません。`node_modules/.bin/tsc --noEmit` を使ってください。）

## 作るもの
`src/remotion/karakuri/KosoB1.tsx` （いま中身が空のスタブになっています。これを本番の中身に書き換える）

作品は「なぜ高層ビルは生まれたのか」。作風は `karakuri`（まちのからくり図鑑）。あなたの担当は **第1章「壁を、やめる。」= 台本の文#28〜#65（38文）** です。

台本は `docs/koso-script-v7.txt`。**ファイルの29行目〜66行目**が担当範囲です（1行目は「作風: karakuri」なので、文#N = ファイルのN+1行目）。必ず自分で読んでください。内容は以下（文番号: 本文）:

```
28  第1章、壁を、やめる。
29  まず、建物は自分の重さに負けます。
30  昔の建物は、壁で自分を支えていました。
31  高くするには、下の壁を厚くするしかありません。
32  シカゴに、煉瓦で16階まで積んだビルがあります。
33  1891年完成。基部の壁は、1.8メートルほど。
34  いちばん上では、46センチまで細くなります。
35  下へ行くほど、壁が太っていく建物です。
36  壁が太るぶん、貸せる床は減ります。
37  高く建てるほど、損をする構造でした。
38  しかもシカゴの地面は、やわらかい粘土です。
39  設計者は、20センチ沈むと見込んでいました。
40  だから、あらかじめ20センチ持ち上げて建てた。
41  実際には、50センチ以上沈んだとされます。
42  重すぎて、自分で地面にめり込んだんです。
43  そこで、考え方がひっくり返ります。
44  壁で支えるのをやめて、鉄の枠を組めばいい。
45  ちょうどこの頃、鋼が安く作れるようになりました。
46  鉄の骨組みは、石の壁の3分の1の重さです。
47  あるビルは、10階ぶんの鉄骨を15日で立てました。
48  すると、壁は重さを持たなくてよくなります。
49  壁は、ただの皮になりました。ガラスでも済みます。
50  ただし、鉄には弱点があります。火です。
51  鉄は燃えません。熱でねじ曲がって、崩れます。
52  1871年のシカゴの大火で、それが分かりました。
53  そこで、鉄の柱を焼き物で包みます。
54  骨に、燃えない服を着せたんです。
55  素材は、植木鉢と同じ焼き物です。
56  1904年のボルティモアの大火で、効き目が出ます。
57  中は燃え尽きたのに、鉄の骨は立っていました。
58  では、いまの柱はどうなっているでしょう。
59  中身は、鉄と、高強度のコンクリートです。
60  同じ太さで、昔よりずっと重い建物を支えます。
61  日本はこれに、揺れを吸う仕掛けを足しました。
62  基礎にゴムを挟んで、地面と建物を切り離す。
63  建物の中に油の筒を仕込んで、揺れを熱に変える。
64  硬くして耐えるのではなく、逃がして捨てるんです。
65  壁をやめた話の、いまのところです。
```

**1文 = 1シーン = 1枚の絵**。38文なので **38枚**です。1枚も欠かさないこと。

## いちばん大事なルール（これを破ると全部やり直しになります）

作者の指示そのまま:
> 「各場面にふさわしい背景や演出動きを**緻密に細かく色んな所に配置する**のが基本」
> 「キットを作ってそこから展開する（= 同じ背景の中で置く物だけ入れ替える）のは**基本的にやらないで欲しい**」

つまり **1文ごとに、その文だけのためにゼロから考える**:
- **シチュエーション** — どこで、いつ、誰が、何をしている場面か
- **演出** — 寄りか引きか。何を隠して何を出すか。どこに視線を集めるか
- **動き** — 何がどう動くとその文の意味が伝わるか（意味のない動きは入れない）
- **イラスト** — その場面に要る物を、その時代のまま精巧に

**禁止事項:**
- 共通の「背景コンポーネント」を1つ作って38シーンで使い回すこと。**絶対にやらない。**
- 連続する2シーンが同じ構図・同じ背景になること（「同じ場所で話が続いている」ことを見せたい場合のみ例外。その場合もカメラの寄り引きや時間帯を変える）
- 画面にポツンと図形が1つ置いてあるだけの絵。**画面の端から端まで、奥行き（遠景・中景・近景）を作り込む。** 空、地面、遠くの街並み、足元の小物、通行人、看板、電線、雲、鳥、煙 — その場面にあるはずの物を細かく配置する。

## 画面と作法
- 1920 x 1080。重要な要素は y=200〜870 の範囲に置く（上に章タイトル帯、下に字幕が乗る）
- **字幕は別レイヤーで自動的に出ます。台本の文章を絵の中に書かないでください。** 絵の中の文字は「1891年」「1.8m」「46cm」のようなラベル・数値・標識だけ
- 文字サイズは 23px 以上。小さすぎると読めません
- 日本語のコメントをコードに書いてください（作者が読みます）

## 既存の共通部品（これは import して使う。描き直さない）

`./KarakuriScenes` から:
```
KRP        パレット: paper #F2EDE4 / paperCool #EAF0F4 / ink #3B332C(輪郭。真っ黒にしない) /
           white #FDFBF7 / gray #AEB6BE / grayDark #7E868E / blue #8FB8D8 / blueDeep #4A78B8 /
           blueSoft #C9DCEC / orange #E8923A / yellow #F2CE4C / cream #F7F2E2 / green #7FBF7A /
           red #D3402E / silver #C9CFD4 / brass #D9B23C / bronze #B87A4B / gold #D9C06A /
           copper #C78A4E / floor #DACBA9
KARAKURI_FONT
clamp01(t) / seg(f, a, b) / pop(t) / easeOut(t)
WobbleDefs  <WobbleDefs seed={n} /> を svg 内に置き、<g filter="url(#wobble)"> で包むと線が手描き風にゆらぐ
Atmosphere  <Atmosphere f={f} dark={bool} /> 紙の質感レイヤー（svgの外、AbsoluteFill直下）
Badge / LabelPill / Stamp
Person      人物。props: x(足元中央) y(足元) s cloth clothDark helmet glasses
            hair("cap"|"none") face("normal"|"worried"|"surprised"|"smile")
            gaze([dx,dy]) tasuki lean f phase still
Bolt
```

`./KosoShared` から:
```
W(1920) H(1080) FONT abs
KBadge      画面隅のバッジ
Frame       1シーンのガワ: <Frame f={f} seed={5xx} caption="..." dark={bool} bg="#..." over={<div/>}>
              ...svgの中身(ゆらぎフィルタがかかる)...
            </Frame>
            ※ caption は省略可。bg でそのシーンの地色を変えられる（シーンごとに変えてよい）
ChapterDoor 章の題字ブロック。<ChapterDoor num={1} title="壁を、やめる。" t={seg(f,6,26)} />
TagPlate    木札風ラベル(x,y,text,size,t,color,fill,rot)
QMark / XMark / Arrow
```

`./KosoPillars` から（**第1章では文#65でだけ使う**。「骨」の柱が1本立った図）:
```
KPP            柱の色: hone #8A94A0 / hako #C98A3C / mizu #5E93C4 / akari #E0B63C / kuuki #86B394
TowerOnPillars 5本柱の上に街が載る装置。props: f pulled dimmed standing labels subs night lit
               ground groundLabel groundCrack fallen float slabY shake tiltScale sky
               ★ sky と ground は既定で false。自分のシーンの背景を描いたうえで装置だけ置く
Pillar / PillarRow / PillarCloseup / PILLAR_X / PILLAR_META / PILLAR_ORDER
```
`KosoPillars.tsx` を必ず一度読んでから使ってください。**この装置を出すシーンでも、背景・空・地面・寄り引き・まわりの小物はそのシーンのために別に作ります。**

## 史実（間違えないこと）
- 文#32〜#42 のビルはシカゴの **モナドノック・ビル（1891年完成、16階、煉瓦の組積造）**。基部の壁 約1.8m、最上部 約46cm。シカゴの地盤は軟弱な粘土で、設計者は約20cmの沈下を見込み**あらかじめ20cm高く**建てたが、実際には50cm以上沈んだとされる。**名前を絵の中に書く必要はありません**（台本が言っていないので）。煉瓦の壁が下へ行くほど太る断面図が主役。
- 文#45 の「鋼が安く」はベッセマー法〜平炉による鋼の量産化のこと
- 文#47 の「10階ぶんの鉄骨を15日」はシカゴの**リライアンス・ビル（1895年）**
- 文#49「壁はただの皮」= カーテンウォール。ガラス張りへ
- 文#52 は **1871年シカゴ大火**
- 文#53〜#55 の「焼き物」は **テラコッタ（素焼き）による耐火被覆**。植木鉢と同じ素材
- 文#56 は **1904年ボルティモア大火**。内部は焼け落ちたが鉄骨は立っていた
- 文#59 は現代の **CFT（コンクリート充填鋼管）・高強度コンクリート**
- 文#62 は **免震（積層ゴム支承）**、文#63 は **オイルダンパー**（制振）。「硬くして耐える」耐震との対比

## 書き方（他のブロックと揃える。TabiB1.tsx が見本です。必ず一度読むこと）
1. ファイル冒頭に担当範囲のコメント
2. 各シーンは `const Kb1Xxx: React.FC<{f:number}> = ({f}) => (...)` のようなコンポーネント
3. 最後に:
```tsx
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb1_door: (f) => <Kb1Door f={f} />,
  ...
};
export const K_B1_MOTIFS: string[] = [ /* 文#28〜#65 の順に38個 */ ];
export const kosoB1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
```
4. motif 名は必ず `kb1_` で始める。38個すべて違う名前。`K_B1_MOTIFS` の並び順は台本の文の順と完全に一致させる
5. 検品用プレビュー（**この形を変えないでください。Root.tsx に登録済みです**）:
```tsx
export const KOSO_B1_PREVIEW_FRAMES = Math.max(K_B1_MOTIFS.length, 1);
export const KosoB1Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B1_MOTIFS.length - 1);
  return <>{kosoB1Scene(K_B1_MOTIFS[i] ?? "", 45)}</>;
};
```
（1フレーム = 1シーン。frame=0 が文#28、frame=37 が文#65）
6. `WobbleDefs` の seed はこのファイルでは 500〜599 を使う（`Frame` の seed prop に渡す）
7. **`src/remotion/Root.tsx` は編集しないでください。** 登録済みです。他のファイルも編集しないでください（`KosoB1.tsx` だけ）

## 自分で検品すること（これをやらずに終わらせない）
```bash
cd /Users/suzukiyuu/Desktop/1005/movie && node_modules/.bin/tsc --noEmit
cd /Users/suzukiyuu/Desktop/1005/movie && node_modules/.bin/remotion still src/remotion/index.ts KosoB1 tmp/koso/b1_00.png --frame=0
```
**38枚すべてを実際に画像として書き出し、Read ツールで自分の目で見てください。** コードが通ることと絵が成立していることは別です。
効率よく見るには ffmpeg で一覧シートを作れます（**PIL は入っていません。画像処理は必ず ffmpeg で**）:
```bash
cd /Users/suzukiyuu/Desktop/1005/movie/tmp/koso && ffmpeg -y -loglevel error -i b1_00.png -i b1_01.png -i b1_02.png -i b1_03.png \
 -filter_complex "[0:v]scale=900:-1[a];[1:v]scale=900:-1[b];[2:v]scale=900:-1[c];[3:v]scale=900:-1[d];[a][b][c][d]xstack=inputs=4:layout=0_0|900_0|0_506|900_506[v]" -map "[v]" b1_sheet1.png
```
一覧で粗を見つけたら、その1枚を単独で Read して直してください。

**見るときのチェック項目:**
- 画面が寂しくないか（奥行きがあるか、端まで作り込まれているか）
- 前後のシーンと背景が被っていないか
- 物がはみ出していないか、重なって読めなくなっていないか
- 文字が小さすぎないか、他の物に隠れていないか
- その文の意味が、絵だけ見て伝わるか
- 時代が合っているか（1890年代のシカゴに現代の車を描かない等）

直したら必ず再レンダして再確認。**納得いくまで繰り返してください。**

## 最後の報告
400字以内で: 38枚それぞれ何を描いたかの一覧（文番号 → motif名 → 一行の内容）と、自分で見て気になっている点を正直に書いてください。
````
