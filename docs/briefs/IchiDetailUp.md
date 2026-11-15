# 追いパス指示書 — IchiB0 v2 / IchiB1 v2 の「書き込み増量」

## 任務
`src/remotion/karakuri/IchiB0.tsx` と `IchiB1.tsx` の v2 リメイクは完成している (tsc クリーン・札NG 0・被りゼロ)。
作者の追加要望: **「人とか物とか背景とか書き込めるんだったら結構がんばってほしい」**。
→ レイアウトは変えず、**背景・小物・人の書き込み量を一段上げる追いパス**をする。描き直しではない。

## 大原則 (前回と同じ。破らない)
1. 主役 (札・グラフ・石碑・年表…) の大きさ・位置・読みやすさは**1pxも動かさない**のが基本。足すのは背景と余白。
2. 足す物は彩度低め・線細め・opacity控えめ。主役より目立ったら失敗。
3. motif名・seed・SCENESキー・export・phase共有は不変。札: 下端 y+size*0.85 ≤ 830、seg の b ≤ 42、読点「、」禁止。
4. **被りゼロ維持**: 足した物が札・軸ラベル・吹き出し・字幕帯 (y≈854以下) に重ならないこと。
5. GridPaper を素のまま足すのは禁止。

## 対象シーン (ここが素肌。重点的に)
### IchiB0 (出力 tmp/ichiban/b0v2)
| frame | # | 診断と処方 |
|---|---|---|
| 2 | #3 zero_nin | 緞帳の下が**ほぼ素のクリーム**。#1/#2 と同じ VenueStage (壁・木床・スポット光だまり) をちゃんと敷く。観客シルエットも#1と同等に |
| 6 | #7 maketa_senshu | 地面が寂しい。小石・乾いた草・地面の線・遠景にもう1本折れ柱など、夕景の書き込みを一段 |
| 10 | #11 souzou | **ほぼ無地で一番寂しい**。夕空のグラデを画面上半分にはっきり見える濃さで+地平線+遠くの丘や木のシルエット+星or雲。吹き出し (想像の雲) の中の高床倉庫・稲ももう少し描き込む |
| 15 | #16 kimochi_shikumi | 工房の右側と壁が素。道具棚の中身を増やす (壺・工具・巻物など)・壁の板目や柱・床の影。台の上の主役2点は不動 |

### IchiB1 (出力 tmp/ichiban/b1v2)
| frame | # | 診断と処方 |
|---|---|---|
| 5 | #26 waza_to_kenasu | 砂地がのっぺり。足跡の列・小石・乾いた草・砂紋をもう一段。枝で引っかいた感 (線の脇のかすれ) も強化。グラフ本体・吹き出し・獲物は不動 |
| 7 | #28 kuuki_kowareru | 地面の質感が薄い。たき火の薪の組み・地面の色むら・小石・敷物 (獣皮) など俯瞰の世界を一段。輪の村人とヒビは不動 |

上記以外でも「背景が素のベタ1色で広い」シーンを見つけたら同じ目で足してよい (ただし #12 yayoi_mura と山シーンは手を入れすぎない)。

## 進め方
1. 該当シーンのコードを読む → 足す
2. `npx tsc --noEmit`
3. 対象フレームだけレンダ: 例 `npx remotion render src/remotion/index.ts IchiB0 tmp/ichiban/b0v2 --sequence --image-format=png --frames=2-2` (他フレームも同様に1枚ずつ)。**単発レンダはファイル名が element-2.png と非ゼロ埋めになるので、必ず `mv element-2.png element-02.png` で統一する**
4. 目視+札周辺を crop 拡大で被りゼロ確認 (ffmpeg不許可なら tmp/crop.ts を npx tsx で)
5. `npx tsx scripts/koso-plate-check.ts` で NG 0 を確認
6. レンダは2巡まで

## 開いてよいファイル
- src/remotion/karakuri/IchiB0.tsx / IchiB1.tsx (担当)
- src/remotion/karakuri/KosoB0.tsx (手本。部分Readで)
- src/remotion/karakuri/IchiShared.tsx / KosoShared.tsx / KarakuriScenes.tsx (grep→部分Read。変更禁止)

## 禁止
- 上記2ファイル以外の変更
- 主役のレイアウト変更・motif/seed/export変更
- 質問で止まらない。迷ったら「主役の明快さ優先・背景は薄く・被りゼロ」
