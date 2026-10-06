import { loadDefaultJapaneseParser } from "budoux";

// ===== 全作風共通ルール: 結論カード・まとめ・大事な言葉の改行は文節単位で =====
// ・budoux で日本語を文節に分け、各文節を inline-block の span にする
//   → 「今日決め\nること」のような変な途中改行を防ぐ (折り返しは文節の境目だけで起きる)
// ・hl (強調語) は「」ごとひとかたまりにして、途中で絶対に割れない。
//   hlStyle で作風ごとの強調色 (teal / オレンジ / 錆朱 / 赤など) をつける
// 新しい作風を作るときも、全文を見せるカードや箇条書きには必ずこれを使うこと。
const jaParser = loadDefaultJapaneseParser();

export const wrapJa = (
  text: string,
  hl?: string,
  hlStyle?: React.CSSProperties,
): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const pushChunks = (s: string, prefix: string) => {
    jaParser.parse(s).forEach((chunk, j) => {
      nodes.push(
        <span key={`${prefix}-${j}`} style={{ display: "inline-block" }}>
          {chunk}
        </span>,
      );
    });
  };
  if (hl && hl.length > 0 && text.includes(hl)) {
    // 本文に「強調語」とカッコ付きで出てくるならカッコごと1かたまりに
    const unit = text.includes(`「${hl}」`) ? `「${hl}」` : hl;
    text.split(unit).forEach((part, i, arr) => {
      pushChunks(part, `p${i}`);
      if (i < arr.length - 1) {
        nodes.push(
          <span key={`h-${i}`} style={{ display: "inline-block" }}>
            {unit.startsWith("「") && "「"}
            <span style={hlStyle}>{hl}</span>
            {unit.endsWith("」") && "」"}
          </span>,
        );
      }
    });
  } else {
    pushChunks(text, "t");
  }
  return nodes;
};
