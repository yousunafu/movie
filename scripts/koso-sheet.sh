#!/bin/bash
# 高層ビル回の「一覧シート」を作る。
#
#   使い方:  bash scripts/koso-sheet.sh KosoB2 0 46 66 tmp/koso/b2 ~/Desktop/koso_ch2.png
#            bash scripts/koso-sheet.sh <合成の名前> <最初のコマ> <最後のコマ> <最初の文番号> <PNGの置き場> <出力>
#
# なぜこれを作ったか:
#   1枚ずつ remotion still を呼ぶと、そのたびに5秒かけてビルドし直す (38枚で3分以上)。
#   --sequence なら1回のビルドで範囲ぜんぶ書き出せる。
#   そのあと ffmpeg で5列に並べて、作者に見せる1枚にまとめる。
#
# 出てくるもの:
#   <PNGの置き場>/element-N.png   N = 文番号 - <最初の文番号>
#   <出力>                        5列の一覧シート
set -e

COMP="${1:?合成の名前 (例 KosoB2)}"
FROM="${2:?最初のコマ (例 0)}"
TO="${3:?最後のコマ (例 46)}"
BASE="${4:?最初の文番号 (例 66)}"
DIR="${5:?PNGの置き場 (例 tmp/koso/b2)}"
OUT="${6:?出力 (例 ~/Desktop/koso_ch2.png)}"

COLS=5
N=$((TO - FROM + 1))
ROWS=$(( (N + COLS - 1) / COLS ))

echo "■ ${COMP} のコマ ${FROM}〜${TO} (文#${BASE}〜#$((BASE + TO - FROM))) = ${N}枚 を書き出します"
mkdir -p "$DIR"
rm -f "$DIR"/element-*.png

node_modules/.bin/remotion render src/remotion/index.ts "$COMP" "$DIR" \
  --sequence --frames="${FROM}-${TO}" --image-format=png --log=error

echo "■ 書き出せた枚数: $(ls "$DIR"/element-*.png | wc -l | tr -d ' ')"
echo "   element-N.png の N に $BASE を足した数が文番号です"

# ffmpeg の tile は連番の穴に弱いので、0から詰め直した作業用の連番を作る
WORK="$DIR/.sheet"
rm -rf "$WORK"; mkdir -p "$WORK"
# remotion は最大コマ数の桁に合わせて 0 詰めする (47枚なら element-00.png)。両方の綴りを探す
i=0
for n in $(seq "$FROM" "$TO"); do
  src=""
  for cand in "$DIR/element-${n}.png" "$(printf '%s/element-%02d.png' "$DIR" "$n")" \
              "$(printf '%s/element-%03d.png' "$DIR" "$n")"; do
    [ -f "$cand" ] && { src="$cand"; break; }
  done
  [ -n "$src" ] || { echo "   ! element-${n}.png がありません (文#$((BASE + n - FROM)))"; continue; }
  cp "$src" "$(printf '%s/%04d.png' "$WORK" "$i")"
  i=$((i + 1))
done

ffmpeg -y -loglevel error -i "$WORK/%04d.png" \
  -vf "scale=384:216,pad=390:230:3:7:0x6B6B6B,tile=${COLS}x${ROWS}:color=0x6B6B6B" \
  -frames:v 1 "$OUT"
rm -rf "$WORK"

echo "■ 一覧シート: $OUT"
echo "   左上から右へ 文#${BASE} / ${COLS}列ずつ折り返し"
