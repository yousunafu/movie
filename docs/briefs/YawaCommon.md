# 柔らかいもの回 並走の共通ルール (全担当が読む)

あなたは Remotion (React + SVG) で手描き風イラストを描く絵師です。作業ディレクトリは /Users/suzukiyuu/Desktop/1005/movie です。
動画は「なぜ人は、柔らかいものを握りたくなるのか」(約21分・からくり作風・ずんだもんのナレーション)。視聴者は大人のインテリ層。上品なユーモア。

## ★今回の作者の注文 (いちばん大事)

> 「格の割合はそんな気にしないで、**時間をかけていいから、スピードではないから、山を多めに頑張って**やってみて」

**速さは評価されません。緻密さが評価されます。** 1枚1枚、そのシーンだけの舞台・小物・人の反応・カメラの動きを作り込んでください。

## ★コンテキストを使い切らないこと (前任者はこれで失敗しました)

前にこの仕事をさせたエージェントは、資料ファイルを片っ端から読んで**1枚も描かないうちにコンテキストが尽きて死にました**。だから:

- **開いてよいのは**: このファイル、自分の担当の指示書 (`docs/briefs/Yawa○○.md`)、自分の担当の .tsx、`src/remotion/karakuri/YawaParts.tsx` (共有装置・約330行)、`src/remotion/karakuri/YawaShared.tsx` (約55行)
- **絶対に開かないファイル**: `docs/制作ガイド.md`、`docs/yawarakai-design-1.md`、`docs/yawarakai-kousei.md`、台本、他の担当の .tsx (`YawaA.tsx` `YawaAb.tsx` `YawaB1.tsx` `YawaB1b.tsx` のうち自分以外)、`KarakuriScenes.tsx` を丸ごと
- `KarakuriScenes.tsx` の部品を確かめたいときは `grep -n "export const Person" src/remotion/karakuri/KarakuriScenes.tsx` で行番号を出してから offset/limit 付きで Read
- 静止画を見るのは「担当分をまとめて書き出して1枚ずつ見る」を**2巡まで**

## 絶対に守ること

1. **1文 = 1シーン = 1枚の絵。** 増やさない減らさない
2. **札 (TagPlate) の y + size*0.85 を 830 以下にする。** 画面の下には字幕の黒帯 (上端854) が別レイヤーで乗ります。検品プレビューには字幕が出ないので目では気づけません。必ず計算で守ること。**画面の下 1/4 (y>830) に大事な物 (顔・主役・札) を置かない** (床や影はOK)
3. **絵の中の文字は、ラベル・数値・標識だけ。** 台本の文章をそのまま絵に書かない (字幕が出るので二重になる)
4. **必ず `f` で何かが動く。** 静止した絵は禁止。人のまばたき (Person に f を渡す)・物のゆれ・ホコリは最低限で、そのうえで**そのシーンの事件**を動きで起こす
5. **出そろうのは f=42 まで。** 検品プレビューは全シーンを f=45 の瞬間で描きます。`seg(f, a, b)` の b は 42 以下。f=45 の瞬間に「いちばん伝わる絵」が出ているようにする
6. 色は `KRP` と `YP` と、自分のファイル上部の `C` にある色だけ。足すなら `C` に足す
7. seed は骨組みに書いてある数字を変えない
8. 対応表 `SCENES` と `*_MOTIFS` 配列、部品名・motif 名は**変えない**
9. **人物は共通部品 `Person` で描く** (からくり憲法第7条)。自分で別の画風の人を描かない。足りない姿勢 (寝そべり等) は Person 全体を `rotate` した `<g>` で包む・腕だけ自分で足す、で作る
10. **主役は画面センター** (第3条)。**物の大きさは現実に合わせる** (第4条)。**場所や時代が変わるシーンは「ここはどこ/いつ」が一目で分かる記号を置く** (第6条: 国旗・地名札・年代札)
11. **変身の演出では変身後に元の物を完全に消す** (第5条)。煙や光で「変わった」と分かる記号を添える
12. **背景キット禁止** (第13条)。同じ背景の上で物だけ入れ替える作り方はしない。1文ごとに舞台・構図・カメラを作る。例外は同じ場所・同じ時間の続き (「#7と#8は同じソファ」など、指示書に書いてある場合だけ)
13. **素肌禁止** (第16条)。無地のクリーム地に物を浮かべない。図の格でも「何かの上」に描く (発掘の土壁・巻物・机・掲示板など)

## 絵の「格」

| 格 | 中身 | 目安 |
|---|---|---|
| **山** | 舞台・人・事件・カメラ全部入り。全力 | 150〜300行 |
| **並** | 舞台はあるが、描くのは1つに寄る。人は1人、背景3〜4要素 | 80〜150行 |
| **図** | 図解が主役。人は置かない。ただし「何かの上」に描く | 50〜100行 |

**「図」「並」も品質は落とさない** (作者: 「シンプルとか普通のやつも絵のクオリティは下げちゃだめ」)。線・色・札・フォントは山と同じ。`strokeWidth` を細くしない。**最悪の失敗は「小さい物を画面の真ん中にポツンと置く」**。主役は短辺 (1080) の半分以上を使う。シンプル＝1つを大きく正確に。

## 6点法 (これが抜けると「正しいワークシートの挿絵」になる)

| # | やること | 抜けると言われること |
|---|---|---|
| ① | 寄る (主役を画面いっぱいに) | 「遠い」 |
| ② | 世界を置く (白紙に図を浮かせない) | 「精巧じゃない」 |
| ③ | 部品を作り込む (物の内部・質感まで) | 「全部が簡素」 |
| ④ | カメラが動く (1枚の中で寄り/引き/パン。全体を `<g transform>` で包んで f で動かす) | 「単調」 |
| ⑤ | 1枚に1つ事件を起こす (説明ではなく出来事) | 「面白みに欠ける」 |
| ⑥ | 人が反応する (棒立ちさせない。face と pose と lean で) | 「人形が置いてある」 |

## 使える部品

**`YawaShared.tsx` から** (import 済み)
- `<Frame f={f} seed={…} bg={…}>…</Frame>` — 手描きのゆらぎ+バッジ+ホコリ。全シーンの外枠。必ず使う。`dark` を付けると夜向けのホコリ
- `<TagPlate x y text size t color fill rot />` — 白い木札。`t` は 0→1 で出てくる。幅 ≈ text.length*size+40
- `<QMark x y s t />` `<XMark x y s t />` `<Arrow x y s rot t />` `<Maru …>` `<MaruBatsu …>`
- `<ChapterDoor num title t left top width />` — 章の題字 (HTML。Frame の `over` に入れる)
- `<QuizQ f x y s t />` — クイズの赤いQ札
- `W`=1920 `H`=1080 `FONT`

**`KarakuriScenes` から** (import 済み)
- `<Person x y s f face pose cloth clothDark hair helmet glasses gaze lean phase />` — x,y は**足元**。頭のてっぺんは y - 292*s。手は (x±67s, y-66s)
  - face: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad"
  - pose: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" (hold は胸の前で両手。手元 y≈-118s)
  - hair: "cap" (黒髪) | "none"
- `seg(f, a, b)` → 0→1 / `easeOut(t)` / `clamp01(x)` / `pop(t)` (ぽんと弾んで出る)
- `KRP` — 共通の色 (ink, cream, paper, white, red, green, orange, yellow, blue, blueDeep, blueSoft, gray, grayDark, floor, brass …)

**`YawaParts.tsx` から** (この動画の装置。**使う前に該当箇所を Read して引数を確認**)
- `YP` — 装置の色 (sqBody スクイーズ桃 / sofa ソファ生成り / glow 光 / brass 真鍮 / wood 木 / **fur・furDark = 20万年前の人の服の毛皮色**)
- `<Squishy x y s squeeze dent f rot face />` — 今のスクイーズ (半透明シリコンの桃色ねこ)。y は底。s=1 で幅約260px。squeeze 0〜1 で潰れる。dent 0〜1 で指の跡
- `<DameSofa x y s sink f>{人}</DameSofa>` — 人をダメにするソファ。children に Person を入れると手前のふちが体を隠して「沈む」。sink 0〜1
- `<AgeDial x y s spin label handle />` — 年代ダイヤル (真鍮の歯車つき)。label に年代の文字
- `<KaradaChizu x y s f lit slots />` — からだの地図。lit={{ back: 1 }} など

## 見本 (前作で作者が気に入った「並」の1枚。部品名は違うが、作り込みの密度をこれに合わせる)

```tsx
const Sg002: React.FC<{ f: number }> = ({ f }) => {
  const jump = pop(seg(f, 16, 28));
  const prog = 0.2 + 0.42 * jump;
  const puff = seg(f, 26, 36);
  return (
    <Frame f={f} seed={1001}>
      {/* 作業机 (真上から)。木目 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.deskWood} />
      <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M -20 ${60 + i * 160} q 480 ${rnd(6, i) * 36 - 18} 980 0 q 480 ${rnd(7, i) * 36 - 18} 980 0`} fill="none" />
        ))}
      </g>
      {/* クラフト紙の台紙 (四隅をテープ留め) */}
      <g transform="rotate(-1.2 960 560)">
        <rect x={180} y={300} width={1560} height={560} rx={6} fill={C.craft} stroke={KRP.ink} strokeWidth={8} />
        {([[200, 316, 40], [1700, 316, -38], [202, 844, -42], [1698, 844, 36]] as const).map(([tx, ty, r], i) => (
          <rect key={i} x={tx - 54} y={ty - 20} width={108} height={40} rx={4}
            fill={i % 2 ? "#E8A3A0" : "#9FC8C0"} opacity={0.85} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${r} ${tx} ${ty})`} />
        ))}
        {/* 主役の装置 (共有部品) */}
        <SaiseiBar f={f} x={960} y={620} s={1.04} t={1} progress={prog} />
        {/* つまみの跳びの軌跡と、着地の砂煙 = 事件 */}
        {puff > 0 && puff < 1 && (
          <g opacity={(1 - puff) * 0.8}>
            {Array.from({ length: 5 }, (_, i) => (
              <circle key={i} cx={960 + (i - 2) * 34 * puff} cy={656 + puff * 18} r={8 + puff * 14}
                fill="none" stroke={KRP.grayDark} strokeWidth={4} />
            ))}
          </g>
        )}
      </g>
      {/* 机の上の道具: ハサミ・鉛筆・マスキングテープ・紙くず (世界の密度) */}
      {/* …(略)… */}
    </Frame>
  );
};
```

要点: **主役を大きく / 画面の端まで世界で埋める / 小物で密度を出す / 事件が f で起きる**。

## 進め方

1. 自分の指示書と、自分の担当 .tsx を Read する。次に `YawaParts.tsx` を Read する (この3つを最初に読む)
2. 骨組みの各シーンの `// どこ: // 演出: // 動き:` のコメントを**先に埋めてから**描く
3. 一気に書く。Edit で `{/* TODO */}` を本物の絵に置き換えていく (シーンを `=> (` から `=> { … return (…); }` に書き換えてよい)
4. 型チェック: `node_modules/.bin/tsc --noEmit`
5. 札の検査: `npx tsx scripts/koso-plate-check.ts <自分のファイル名から .tsx を取った名前>` — **NG 0件になるまで直す**
6. 静止画をまとめて書き出す (**1枚ずつ `remotion still` を呼ばない**。必ず先頭で TMPDIR を設定):
   ```
   export TMPDIR="$(pwd)/tmp/remotion-tmp/"; node_modules/.bin/remotion render src/remotion/index.ts YawaAll tmp/yawa/<置き場> --sequence --frames=<C1>-<C2> --image-format=png --log=error
   ```
   コマ番号 = 文番号 − 1。出力のファイル名は `element-<コマ番号>.png` (桁数は Remotion が0詰めすることがある。`ls` で確かめる)
7. 全部を Read して自分で検品する: 主役が小さくないか / 物が重なって読めなくなっていないか / 画面の下1/4に大事な物がないか / 人の手足や物のつながりが変でないか / 真ん中にポツンでないか / 素肌 (無地背景) がないか
8. 直して、もう1回だけ書き出して確認する
9. 終わったら、各シーンを1行で説明した報告を返す (400語以内)

## 同時に別の人が作業しています

- 他の担当のファイルは**別の人が同時に編集中**です。**触らないでください**
- そのせいで手順4〜6が他人の書きかけの型エラーで失敗することがあります。自分のファイルが原因でないエラーなら、2〜3分待ってからもう一度。自分で直そうとしないこと
- `YawaParts.tsx` `YawaShared.tsx` は共用です。**足りない部品があってもここに足さず、自分のファイルの中にローカルな部品として書いてください**

わからないことがあっても質問せず、指示書の記述と見本に沿って判断して描き切ってください。
