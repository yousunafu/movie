// 誤読を直したあと、その文の音声だけを作り直す。282本ぜんぶ作り直さないために使う。
//
//   使い方:  npx tsx scripts/koso-resynth.ts 37 118 201
//            (文番号をスペース区切りで。台本の行番号 − 1 ではなく「文番号」で指定する)
//
// 手順:
//   1. src/generator/pacing.ts の TTS_READINGS に [/語/g, "よみ"] を1行足す (台本は原文のまま)
//   2. このスクリプトを、直した文の番号で回す
//   3. public/audio/scene-NNN.wav が置き換わる
//   4. そのあと RESUME_AUDIO=1 npm run generate docs/koso-script-v7.txt で尺を取り直す
//      (長さが変わるので scenes-data.json の durationSec を更新する必要がある)
import fs from "node:fs";
import path from "node:path";
import { synthesizeVoicevox } from "../src/generator/voicevox";
import { ttsTextFor, voiceStyleFor, styleLabel } from "../src/generator/pacing";
import { applyPresetVoice, VOICE } from "../src/channel";
import scenesData from "../src/remotion/scenes-data.json";
import type { ScenesData } from "../src/types";

const SCRIPT = "docs/koso-script-v7.txt";
const PUBLIC = "public";

const nums = process.argv.slice(2).map((s) => Number(s)).filter((n) => Number.isFinite(n));
if (nums.length === 0) {
  console.error("文番号を指定してください (例: npx tsx scripts/koso-resynth.ts 37 118)");
  process.exit(1);
}

// 台本の宣言どおり karakuri の声 (ずんだもん・速度1.1) に揃える
applyPresetVoice("karakuri");

const lines = fs
  .readFileSync(SCRIPT, "utf8")
  .split("\n")
  .filter((l) => l.trim() !== "")
  .filter((l) => !/^作風:/.test(l));

const data = scenesData as unknown as ScenesData;

const main = async () => {
  console.log(`■ ${VOICE.voicevoxSpeaker} / 速度 ${VOICE.voicevoxSpeed} で ${nums.length}文を作り直します\n`);
  for (const n of nums) {
    const i = n - 1; // 文#1 → scene-000
    const sentence = lines[i];
    if (!sentence) {
      console.log(`#${n} 台本にその文がありません (全${lines.length}文)`);
      continue;
    }
    const scene = data.scenes[i];
    const type = scene?.type ?? "diagram";
    const motif = scene?.motif ?? "";
    const style = voiceStyleFor(sentence, type as never, motif);
    const out = path.join(PUBLIC, `audio/scene-${String(i).padStart(3, "0")}.wav`);
    const before = fs.existsSync(out) ? fs.statSync(out).size : 0;
    fs.rmSync(out, { force: true }); // RESUME_AUDIO の影響を受けないよう消してから作る
    const dur = await synthesizeVoicevox(ttsTextFor(sentence), out, style);
    console.log(`#${n} → ${path.basename(out)}  ${dur.toFixed(1)}秒 ${styleLabel(style)}`);
    console.log(`   文: ${sentence}`);
    console.log(`   読み上げる文: ${ttsTextFor(sentence)}`);
    if (before > 0) {
      const sec = data.scenes[i]?.durationSec;
      if (typeof sec === "number" && Math.abs(sec - dur) > 0.15) {
        console.log(
          `   ※ 長さが ${sec.toFixed(1)}秒 → ${dur.toFixed(1)}秒 に変わりました。` +
            `RESUME_AUDIO=1 npm run generate ${SCRIPT} で尺を取り直してください`,
        );
      }
    }
  }
  console.log(`\n■ 終わりました`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
