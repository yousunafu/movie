// 工程3: 機械的な補正。この仕組みの心臓部。
// AIは比率の指示を必ずしも守らないので、実測値から決めた条件 (src/style.ts) に
// 合うまでプログラムで数え直して差し替える。

import { RATIOS, type SceneType } from "../style";
import type { Assignment } from "./assign";
import { heuristicAssign } from "./assign";

export function enforceRatios(
  sentences: string[],
  assignments: Assignment[],
): Assignment[] {
  const out = assignments.map((a) => ({ ...a }));
  const n = out.length;
  const count = (t: SceneType) => out.filter((a) => a.type === t).length;
  const log: string[] = [];

  // 1. 終盤の結論カード: 最後の実質シーンを card にする
  if (RATIOS.endCard && n >= 3) {
    const last = out[n - 1];
    if (last.type !== "card") {
      last.type = "card";
      last.motif = "talking";
      log.push(`シーン${n - 1}を結論カードに変更`);
    }
  }

  // 2. 呼吸: locationEvery シーンに1回は location を入れる
  const [, maxGap] = RATIOS.locationEvery;
  let sinceLocation = 0;
  for (let i = 0; i < n; i++) {
    if (out[i].type === "location") {
      sinceLocation = 0;
      continue;
    }
    sinceLocation++;
    if (sinceLocation > maxGap) {
      const h = heuristicAssign(sentences[i]);
      out[i].type = "location";
      out[i].motif = h.type === "location" ? h.motif : "kitchen";
      log.push(`シーン${i}を風景(location)に変更 (${maxGap}シーン以上図解・人物が続いたため)`);
      sinceLocation = 0;
    }
  }

  // 3. 図解系 (diagram+chart) を infoMin 以上に
  const infoTarget = Math.ceil(n * RATIOS.infoMin);
  let info = count("diagram") + count("chart");
  if (info < infoTarget) {
    for (let i = 0; i < n && info < infoTarget; i++) {
      if (out[i].type === "character" && /[0-9０-９]/.test(sentences[i])) {
        out[i].type = "chart";
        out[i].title = out[i].title ?? "数字で見る";
        info++;
        log.push(`シーン${i}をチャートに変更 (図解系${Math.round(RATIOS.infoMin * 100)}%未満のため)`);
      }
    }
  }

  // 4. 物のアップを objectMin 以上に
  const objTarget = Math.ceil(n * RATIOS.objectMin);
  if (count("object") < objTarget) {
    for (let i = 0; i < n && count("object") < objTarget; i++) {
      if (out[i].type !== "character") continue;
      const h = heuristicAssign(sentences[i]);
      if (h.type === "object") {
        out[i].type = "object";
        out[i].motif = h.motif;
        log.push(`シーン${i}を食品アップに変更`);
      }
    }
  }

  // 5. 人物場面を characterMin〜characterMax に収める
  const charMin = Math.floor(n * RATIOS.characterMin);
  const charMax = Math.ceil(n * RATIOS.characterMax);
  while (count("character") > charMax) {
    const i = out.findIndex((a, idx) => a.type === "character" && heuristicAssign(sentences[idx]).type === "object");
    if (i === -1) break;
    const h = heuristicAssign(sentences[i]);
    out[i].type = "object";
    out[i].motif = h.motif;
    log.push(`シーン${i}を食品アップに変更 (人物${Math.round(RATIOS.characterMax * 100)}%超のため)`);
  }
  while (count("character") < charMin) {
    const i = out.findIndex((a) => a.type === "location");
    const j = out.findIndex((a) => a.type === "object");
    const k = i !== -1 ? i : j;
    if (k === -1) break;
    out[k].type = "character";
    out[k].motif = "talking";
    log.push(`シーン${k}を人物に変更 (人物${Math.round(RATIOS.characterMin * 100)}%未満のため)`);
  }

  const summary = {
    total: n,
    character: count("character"),
    object: count("object"),
    diagram: count("diagram"),
    chart: count("chart"),
    location: count("location"),
    card: count("card"),
  };
  console.log("機械的補正:", log.length ? log.join(" / ") : "補正なし");
  console.log("シーン構成:", JSON.stringify(summary));
  return out;
}
