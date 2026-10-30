# 「私は何者?」4000年史 — 本編イラスト制作ルール (4ブロック並行作業用)

4人の作業者が章ブロックごとに同時にイラストを作るための共通ルール。
**全員このファイルを最初に読み、必ず守ること。** 守らないと絵がブレて検品で全部やり直しになる。

## 0. 担当ファイルと範囲 (他人のファイルは絶対に触らない)

| ブロック | ファイル | 台本の行 | 文# | 文数 | wobble seed |
|---|---|---|---|---|---|
| B1 | src/remotion/karakuri/WatashiB1.tsx | 2〜70行目 | #1〜#69 | 69 | 300〜399 |
| B2 | src/remotion/karakuri/WatashiB2.tsx | 71〜120行目 | #70〜#119 | 50 | 400〜499 |
| B3 | src/remotion/karakuri/WatashiB3.tsx | 121〜186行目 | #120〜#185 | 66 | 500〜599 |
| B4 | src/remotion/karakuri/WatashiB4.tsx | 187〜253行目 | #186〜#252 | 67 | 600〜699 |

- 台本は docs/watashi-script-v1.txt。1行目は作風宣言なので、**文# = 行番号 − 1**
- 編集してよいのは自分の WatashiBn.tsx 1ファイルだけ。共有ファイル (KarakuriScenes.tsx / WatashiShared.tsx / WatashiCharacters.tsx / Root.tsx) は読むだけ

## 1. 必読の参照ファイル (作る前に読む)

1. docs/watashi-script-v1.txt — 台本 (自分の担当行)
2. docs/watashi-kousei.md — 構成案 (章のトーン・緩急・リキャップ位置・NGリスト)
3. src/remotion/karakuri/KarakuriScenes.tsx — 共通部品 (KRP色・Person・LabelPill・Ground・Atmosphere・seg/pop/easeOut)
4. src/remotion/karakuri/WatashiShared.tsx — この回専用の共通部品 (RouteMap・ShindanSho・UranaiMachine・PUR)
5. src/remotion/karakuri/Jihanki2000Ch5to6.tsx — **お手本** (シーンの書き方・構造はこのファイルの流儀をそのまま踏襲)
6. docs/watashi-factcheck.md — 事実のOK/NG表現 (絵の中の文字・数字はこの範囲内)

## 2. ファイルの契約 (この形を崩さない)

受け皿 WatashiBn.tsx に最初から書いてある3つの export を完成させる:

- `watashiBnScene(motif, f)` — motif を知っていれば ReactElement、知らなければ null
- `W_Bn_MOTIFS: string[]` — **担当の文数とピッタリ同じ長さ**。文#iの絵 = 配列の順番どおり。同じ絵の再利用は同じ motif 名を繰り返す
- `W_Bn_PREVIEW_FRAMES` / `WatashiBnPreview` — 検品用 (すでに書いてある。FRAMES が MOTIFS.length になるので触らなくて動く)

motif 名は衝突防止のため必ず接頭辞つき: B1=`w1_xxx` / B2=`w2_xxx` / B3=`w3_xxx` / B4=`w4_xxx`

シーンコンポーネントは J2 のお手本と同じく自己完結型:
`<AbsoluteFill style={{ background: KRP.cream }}>` + `<svg>` + `<WobbleDefs seed={自分の範囲内で1シーン1個}/>` + 中身 + `<Atmosphere f={f}/>`。

## 3. 作風ルール (karakuri)

- 色は **KRP の色だけ** (+占い演出のみ WatashiShared の PUR)。新しい色コードを作らない
- 輪郭は KRP.ink、strokeWidth 4.5〜7 (小物3.5可)。塗りはフラット。グラデ・影・写実禁止
- 人物は KarakuriScenes の Person を基本に。歴史衣装は Jihanki2000Scenes の AncientPerson の流儀を参照。肌色は #F6D7B8 固定。腕を別描きするときは hideArm で消してから生やす (二重腕バグ防止)
- **常時動き**: どのシーンも止め絵にしない。人物は f で bob+まばたき、図解は小さくループ、登場は pop/easeOut
- 文字入れは LabelPill / Stamp / TagPlate 風 (お手本参照)。**画面下 y>900 は字幕が重なるので大事な物を置かない**。上端のラベルは y≧160
- **グラフ・数値は省略しない** (ユーザー指定): 軸・目盛り・単位・数値ラベルをきちんと描く。例: フォアの4.26点は「0〜5の目盛りつき横棒+4.26の数値」まで描く
- 絵に入れてよい数字は固定9セットのみ: 約3300年前 / 紀元前410年 / 1905年 / 約175万人 / 約7万人 / 1948年 (フォアの実験) / 4.26点 / 1927年 / 1971年 (+章番号・西暦の章タイトル内数字は台本どおり)。※1948年は検品時に追認 (台本#218の文どおり・factcheck確認済み)
- **ずんだもんは絵に出さない** (声だけ)。画面の占い師役は UranaiMachine
- 章タイトルの文 (「第4章、〜」) は章扉: テーマ絵は章ごとに自由だが、**題字は必ず WatashiShared の ChapterTitle** (4人で作ってもブレないように)。お手本は SceneCh5Door
- **全シーンに WBadge** (WatashiShared) を置く (J2の J2Badge と同じ位置づけ)

## 4. 共通部品の使いどころ (描き直し禁止・必ず import)

- **UranaiMachine** (WatashiShared): 導入の診断シーン (B1) と第12章の種明かし (B4)。紫照明 PUR.glow を重ねて空気を変える
  - **黄色 (KRP.yellow / KRP.brass) は使わない。光るもの・回るものも付けない** (作者の指示。チカチカ・くるくるが目ざわりになる)
  - **診断書 (下から出てくる紙) は機械本体には描かない。**「診断書」の札と取り出し口だけが既定。
    紙を見せたい場面は、呼び出し側で `ShindanSho` を別に置く
  - 水晶玉の中心は (0, -352) 固定。導入のシーンがこの位置を基準に寄り引きしているので動かさない
- **ShindanSho** (WatashiShared): 診断書の紙。導入で機械が吐く紙と、第12章で「全員同じ」紙は**必ず同じこの部品** (ここが回の仕掛けの絵的な伏線)
- **RouteMap** (WatashiShared): 乗り換え路線図。使う場所と count は構成案どおり:
  - B1: 第2章末のリキャップ = count=1 / 第3章末 = count=2
  - B2: 第6章のリキャップ = count=3
  - B3: 第8章のリキャップ = count=4
  - B4: 結びの全回収 = count=4
- 繰り返し登場する物 (甲骨・水晶玉など) は自分のブロック内で1つのコンポーネントにして使い回す。**他ブロックにも出る物は WatashiShared にある物だけ**で済むよう設計済み

## 5. 内容のNG (炎上回避。docs/watashi-kousei.md と同じ)

- IQ・知能と人種・民族を結びつける絵・数字は一切描かない
- 第7章 (優生学の谷) はユーモア・かわいい演出を止める。Atmosphere は dark、賑やかな小物なし。断種・被害の直接描写はしない (法律名・年号・判決の文字まで)
- 占い・MBTI愛好者を笑う構図にしない。「インチキ」等の評価語を絵に入れない
- 血液型あるあるの絵 (B型は〜等) 禁止。宗教施設・特定の神様の絵は描かない (光・後光の抽象表現まで)

## 6. 自己検品 (完成の条件)

1. `cd /Users/suzukiyuu/Desktop/1005/movie && npx tsc --noEmit` が通ること
2. 検品用プレビューを画像書き出し (1フレーム=1シーン):
   `npx remotion render src/remotion/index.ts WatashiBn out/watashi-bn-check --image-format=png --sequence --concurrency=4`
3. 出力された**全画像を1枚ずつ目で見て** (Readで開いて) 確認: はみ出し・重なり・足切れ・文字つぶれ・左右反転腕・輪郭抜けがないか。崩れは直してから再書き出し
4. W_Bn_MOTIFS.length が担当文数とピッタリ一致していること
5. 文とのズレ最終確認: 配列の最初・最後・章の切り替わりの motif が台本のその文と合っているか

※ 他ブロックの作業者が同時にビルドすることがある。render が他人のファイルのエラーで落ちたら30秒待って再実行。
