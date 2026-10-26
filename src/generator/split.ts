// 台本を1文=1シーンに切り分ける。
// 改行と句点(。)で区切る。見出し・話者表記・番号は想定しない (ただのテキスト)。
// lineMode: true のときは「1行=1文」としてそのまま使う (句点での分割や短文の結合をしない)。
// 自販機2000年史のように、台本と絵を1行1枚で厳密に対応させた作品用。

export function splitScript(raw: string, opts?: { lineMode?: boolean }): string[] {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (opts?.lineMode) return lines;

  const sentences: string[] = [];
  for (const line of lines) {
    const parts = line.split(/(?<=。)/).map((s) => s.trim()).filter(Boolean);
    sentences.push(...parts);
  }

  // 10字未満でも前の文に結合せず、1文=1シーンとして独立させたい掛け声。
  // 絵の切り替え (プレスが搾る瞬間など) をこの文にぴったり同期させるため。
  const KEEP_ALONE: RegExp[] = [
    /^濃縮、[一二三]段目。?$/,
    /^想像してください。?$/,
    // のぞき見くん回: ステップカードと決めゼリフは絵と1対1で同期させる
    /^その[1-3１-３]。?$/,
    /^できるんです。?$/,
    /^絵の具なら。?$/,
    /^役者は、3人です。?$/,
    /^惜しい。?$/,
    /^実に惜しい。?$/,
    /^見つけましたね。?$/,
    /^答えは単純です。?$/,
  ];

  // 10字未満は前の文に結合、100字超は読点で分割を試みる
  const merged: string[] = [];
  for (const s of sentences) {
    if (s.length < 10 && merged.length > 0 && KEEP_ALONE.some((re) => re.test(s))) {
      merged.push(s);
    } else if (s.length < 10 && merged.length > 0) {
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
