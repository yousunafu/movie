// 「人類は、昔から飛ばして観ていた」の効果音表。
// motif 名 → そのシーンの何コマ目で何を鳴らすか。
// scenes-data.json は生成物なので、この表はコードの側に置く。
//
// 使い方 (Video.tsx):
//   {(SAIGO_SE[scene.motif] ?? []).map(...)}  ← Series.Sequence の中で Audio を足す
// ここに載っていない motif は空配列になるので、他の作風・他の回には一切影響しない。
//
// 音源は assets/se/ (効果音の倉庫。効果音ラボ。商用可・クレジット不要)。
// 使う音だけ npm run se (または npm run check) で public/se/ へ自動コピーされる。
export type SaigoSeCue = {
  file: string;    // public/ からの相対パス
  at: number;      // シーンの先頭から数えたコマ
  volume?: number; // 既定 0.55
};

export const SAIGO_SE: Record<string, SaigoSeCue[]> = {
  // #3 判子が紙に当たる瞬間 (Sg003 の drop = seg(f, 24, 31) の終わり) に和太鼓のドドン。
  //    太鼓は鳴り出しが速いので、当たる1コマ前の f=30 から鳴らす。
  sg_003: [{ file: "se/anime/drum-japanese2.mp3", at: 30, volume: 0.5 }],
};
