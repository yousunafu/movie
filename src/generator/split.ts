// 台本を1文=1シーンに切り分ける。
// 改行と句点(。)で区切る。見出し・話者表記・番号は想定しない (ただのテキスト)。

export function splitScript(raw: string): string[] {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sentences: string[] = [];
  for (const line of lines) {
    const parts = line.split(/(?<=。)/).map((s) => s.trim()).filter(Boolean);
    sentences.push(...parts);
  }

  // 10字未満は前の文に結合、100字超は読点で分割を試みる
  const merged: string[] = [];
  for (const s of sentences) {
    if (s.length < 10 && merged.length > 0) {
      merged[merged.length - 1] += s;
    } else if (s.length > 100) {
      const half = Math.floor(s.length / 2);
      const commaIdx = s.indexOf("、", half - 20);
      if (commaIdx > 10 && commaIdx < s.length - 10) {
        merged.push(s.slice(0, commaIdx + 1), s.slice(commaIdx + 1));
      } else {
        merged.push(s);
      }
    } else {
      merged.push(s);
    }
  }
  return merged;
}
