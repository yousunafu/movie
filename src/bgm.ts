// BGMの曲庫と自動選曲。曲ファイルは public/bgm/ に置く (gitにコミットされ、Actionsでも使われる)。
// 曲を差し替えたいときはこのファイルの対応表を書き換えるだけでよい。
// 出典: Pixabay (商用利用OK・クレジット不要)。ファイル名は Pixabay のダウンロード名のまま。

import fs from "fs";
import path from "path";
import type { Preset } from "./channel";

// 作風ごとのBGM。先頭の曲が使われ、ファイルが無ければ次の候補に落ちる。
const BGM_BY_PRESET: Record<Preset, string[]> = {
  // 明るく穏やか (高齢者向け健康解説)
  genki: ["mickeyscat-moment-of-peace-mickeyscat-554494.mp3"],
  // 夜の静けさ・ダーク (教養エッセイ)
  ashi: ["audiocopper-dark-571483.mp3"],
  // 壮大なドキュメンタリー (科学・宇宙)
  manabi: ["grand_project-wonders-of-the-earth-550792.mp3"],
  // 重厚なシネマティック (歴史資料)
  rekishi: ["musicdream-dramatic-cinematic-documentary-609202.mp3"],
  // 落ち着いた知的トーン (構造図解)
  kouzou: ["sigmamusicart-no-copyright-music-537751.mp3"],
  // 緊張感のあるニュース調 (経済解説)
  keizai: ["lnplusmusic-suspense-tension-suspenseful-tense-323181.mp3"],
  // 静かでダークな数理トーン (黒背景の図解。ashiと同曲を共用)
  suuri: ["audiocopper-dark-571483.mp3"],
};

// 未割り当ての予備曲 (public/bgm/ に入っているが現在どの作風にも使っていない):
// - fassounds-escape-your-love-upbeat-fashion-pop-dance-412230.mp3 (明るいポップ)
// - lnplusmusic-sport-sports-rock-music-597971.mp3 (スポーツロック)

// 作風に合うBGMを選ぶ。戻り値は public/ からの相対パス (例: "bgm/xxx.mp3")。見つからなければ undefined。
export function pickBgm(preset: Preset, publicDir: string): string | undefined {
  for (const file of BGM_BY_PRESET[preset]) {
    if (fs.existsSync(path.join(publicDir, "bgm", file))) return `bgm/${file}`;
  }
  return undefined;
}
