# IchiB0 v2 リメイク指示書 — 序 #1〜#20 を「ビル動画の導入」水準に作り込む

## 任務
`src/remotion/karakuri/IchiB0.tsx` の20シーンは一度完成している。**消して描き直すのではなく、全シーンを「舞台の中に置く」リメイク**をする。
作者の診断: 「方眼背景はやっぱり味気ない。導入でここまで方眼が続くと飽きられる」。

**目標の数字 (手本 = KosoB0.tsx、高層ビル動画の導入):**
- KosoB0 は21シーンで3,545行 (約170行/シーン)。**素の方眼+クリーム地だけの絵が0枚**。
- 現状の IchiB0 は約67行/シーン、GridPaper 13枚。→ **素の方眼だけの絵をゼロにする**。行数は結果であって目的ではないが、1シーン120〜200行くらいになるのが自然。

## 大原則
1. **図の明快さは殺さない。** 主役 (クイズ札・石碑・メダル・年表…) の大きさ・位置・読みやすさは今のまま。背景の世界は彩度低め・線は細め・opacity 控えめで「敷く」。ごちゃごちゃは失敗。
2. **方眼 (GridPaper) を使うなら「何かの上」にする。** 素のクリーム+方眼は禁止。例: 巻物・絵巻・掲示板・展示パネルの「紙」として方眼を使うのは可。
3. 1文=1シーン、motif名・seed (900〜919)・SCENESキー・export 群は**一切変更しない**。
4. 連番ペア (#4/#5、#9/#10、#19/#20) は引き続き phase prop 共有。舞台も同じ舞台。
5. 札: TagPlate 下端 (y+size*0.85) ≤ 830。seg(f,a,b) の b ≤ 42。全シーン f で動く。
6. **札の読点の法 (新ルール)**: 札・タイトルに読点「、」禁止。間は半角スペース。
7. **被りゼロ**: 札・軸ラベル・吹き出しが人物・イラスト・他の文字に重ならない。レンダ後に ffmpeg crop で札周辺を拡大して目視確認すること。

## 新しい道具 (今回から使える。積極的に使う)
`KarakuriScenes.tsx` の Person が強化済み:
- `pose`: "stand" | "banzai" | "raise" | "point" (+pointDir) | "armsFolded" | "run" | "hold"
- `face` 追加: "joy" (^^大笑い) / "angry" / "sad" (涙)
- **`PersonMini`**: 群衆用簡略キャラ。`x,y,s,color,f,phase,face("dot"|"smile"|"none"),arms("down"|"up")`。観客・群衆はこれを並べる (縮めても潰れない)。

## シーンごとの舞台案 (元の絵の主役はそのまま、世界を足す)
元の設計 (絵の意味・格) は docs/briefs/IchiB0.md の描く表を踏襲。

| # | motif | 足す世界 |
|---|---|---|
| 1 | ikinari_quiz | 表彰式会場の緞帳 (上辺に赤幕+房)・スポットライトの薄い光芒。クイズ札は中央大のまま |
| 2 | nii_nannin | #1と同じ会場。人数シルエットは PersonMini に置き換えてもよい |
| 3 | zero_nin | #1/#2と同じ会場の phase。巨大「0人」はそのまま |
| 4/5 | nokotte_nai / kiroku_ga_nai | 博物館の展示室: 壁の色帯・台座・天井からの額照明・ロープ柵。石碑/巻物は展示品として同位置 |
| 6 | olympia_eiyu | 神殿はある。空にグラデ・遠景の丘・聖火の煙・観衆 (PersonMini) を足す |
| 7 | maketa_senshu | 同じ競技場の隅。夕空+長い影で「負け」の空気 |
| 8 | uradori | 裏通りの建物の壁・壺・洗濯ひもなど生活の小物 |
| 9/10 | shousha_hitori / nii_mo_nai | 丘+空+歓声の群衆 (PersonMini, arms="up")。phase共有のまま |
| 11 | souzou | 腕組み (pose="armsFolded" が使える)。背景に夕空と地平線をうっすら |
| 12 | yayoi_mura | 完成度高いので微調整のみ (手を入れすぎない) |
| 13 | sekaiichi_da | **？が吹き出しの枠に重なっている → 重なり解消**。田んぼの背景を少し奥行き強化 |
| 14 | tonari_shiranai | ほぼ良い。霧・鳥など空気を1つ足す程度 |
| 15 | dohyo_map | 円マップを「広げた和紙の絵図」にする: 紙の縁・巻き軸・文鎮・筆を周囲に。方眼は紙の上の目として可 |
| 16 | kimochi_shikumi | 工房の作業台の上に「炎の絵札」と「歯車の装置」を実物として置く。壁・道具棚をうっすら |
| 17 | medal_120 | 表彰式会場の壁面展示: リボン・幕・下に小さな観客 (PersonMini)。年表はそのまま |
| 18 | hyoshodai_96 | 競技場の空+トラックの白線。表彰台に PersonMini を3人立たせる (1位は arms="up") |
| 19/20 | kimochi_shikumi(年表) / sakanoborou | 年表を「広げた絵巻物」の上に描く: 両端の巻き軸・紙の影。phase共有のまま |

## 進め方
1. 元コードと docs/briefs/IchiB0.md を読む → KosoB0.tsx を2〜3シーン分 Read して「舞台の敷き方」の手筋を盗む (全読不要)
2. 共通の舞台部品 (会場の幕・展示室の壁・絵巻の軸など) はファイル内ローカル部品として作って使い回す
3. `npx tsc --noEmit` → `npx remotion render src/remotion/index.ts IchiB0 tmp/ichiban/b0v2 --sequence --image-format=png --frames=0-19`
4. 20枚を目視 + 札周辺を ffmpeg crop で拡大して被りゼロ確認 + `npx tsx scripts/koso-plate-check.ts`
5. 書き出しは2巡まで。**出力先は tmp/ichiban/b0v2 (旧版 b0 と見比べるため別フォルダ)**

## 開いてよいファイル
- src/remotion/karakuri/IchiB0.tsx (担当)
- docs/briefs/IchiB0.md (元設計)
- src/remotion/karakuri/KosoB0.tsx (手本。部分Readで)
- src/remotion/karakuri/IchiShared.tsx / KosoShared.tsx
- KarakuriScenes.tsx は grep→部分Read

## 禁止
- IchiB1.tsx / IchiB2.tsx / Root.tsx / KosoB*.tsx / scenes-data.json / 共通部品の変更
- motif名・seed・export・SCENESキーの変更
- 質問で止まらない。判断に迷ったら「主役の明快さ優先・背景は薄く」で描き切る
