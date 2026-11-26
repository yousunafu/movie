// 目覚まし回「人はなぜ、自力で起きられないのか」の効果音表 (saigoSe.ts / himaSe.ts と同じしくみ)。
// motif 名 → そのシーンの何コマ目で何を鳴らすか。コマは各絵師が書いた「動き:」の時刻から (2026-11-26)。
// ※ファイル名は "se/…" と丸ごと書く (scripts/se-sync.ts がこの書き方を拾って public/se へコピーする)
// 音: 効果音ラボ。jiriri-cut = 黒電話のベル (phone-black-ringtone1) の頭1.1秒、pipipi-cut = 目覚ましの電子音 (alerm1) の頭0.5秒
import type { SaigoSeCue } from "./saigoSe";

const cue = (file: string) => (at: number, volume = 0.5): SaigoSeCue => ({ file, at, volume });
const jiriri = cue("se/machine/jiriri-cut.mp3");      // ベル式の目覚まし時計
const pipipi = cue("se/machine/pipipi-cut.mp3");      // スマホのアラーム
const kane = cue("se/anime/temple-bell1.mp3");        // 江戸の時の鐘
const gon = cue("se/anime/church-bell1.mp3");         // 塔の大鐘
const bell = cue("se/various/bell1.mp3");             // 町の時計台の鐘
const don = cue("se/anime/bomb2.mp3");                // 午砲
const pachi = cue("se/various/go-piece1.mp3");        // 豆が窓に当たる
const ban = cue("se/various/desk-hit1.mp3");          // バン!
const peta = cue("se/anime/peta1.mp3");               // はんこ
const kachi = cue("se/various/clock-hand3.mp3");      // 針がカチッ
const kon = cue("se/various/knock-hi-cut.mp3");       // 棒の先が窓に当たる「コン」1回 (wind-knock1 の頭0.2秒を1.5倍の高さに。作者「もっと高い音」2026-11-27)
const pico = cue("se/anime/pico-pico-hammer1.mp3");   // ポップに叩く (#57)
const runStart = cue("se/machine/run-start-cut.mp3"); // 車の発進音 (car-rocket-start1 の頭2秒)
// 棒・豆の当たりコマは KnockerUp の式 (tapT=sin(F*0.55+phase) が 0 を下へまたぐコマ) から計算 (2026-11-27 第1回修正)
// v2 で「小さい」と言われたので、各場面の値を1.6倍して鳴らす (上限0.85)
// v3 で作者「過剰にやってもあれだから、最初だけとかでいい」→ 各場面とも最初の「コンコン」2回だけ鳴らす (表の残りのコマは記録として残す)
const kons = (frames: number[], v = 0.4) => frames.slice(0, 2).map((t) => kon(t, Math.min(0.85, v * 1.6)));

export const MEZA_SE: Record<string, SaigoSeCue[]> = {
  mz_002: [0, 32, 54, 72, 86].map((t) => pipipi(t, 0.28)), // 5回鳴って5回止める
  mz_009: [pipipi(2, 0.3), pipipi(16, 0.3)],
  mz_065: [kane(14, 0.45)],
  mz_083: [jiriri(32, 0.45)],
  mz_085: [jiriri(12, 0.4)],
  mz_086: [gon(20, 0.45)],
  mz_119: [bell(0, 0.4), bell(33, 0.45)],                  // 正午が2回
  mz_122: [don(26, 0.5)],
  mz_136: kons([29, 40, 52, 63, 75, 86, 143, 155, 166, 178, 189], 0.45),
  mz_137: [pachi(31, 0.85)],
  mz_145: [jiriri(32, 0.25)],
  mz_149: [jiriri(0, 0.3), ...kons([10, 22, 33, 45, 56, 67, 79, 90, 102, 113, 125, 136], 0.35)],
  mz_152: [jiriri(0, 0.35), ban(26, 0.5)],
  mz_154: kons([1, 12, 22, 27, 31, 36, 41, 46, 50, 55, 60, 65, 69, 74], 0.42),
  mz_166: [jiriri(22, 0.6)],                               // この回いちばんの笑いどころ
  // mz_167: 「人間目覚まし時計を起こしていたのは、目覚まし時計でした」はオチなのでノック音なし (作者 2026-11-27)
  mz_174: [jiriri(0, 0.3), ban(26, 0.55)],                 // 国が目覚ましを止めた
  mz_178: [peta(28, 0.5)],
  mz_179: [jiriri(0, 0.3), jiriri(38, 0.3)],
  mz_190: [jiriri(0, 0.4), runStart(20, 0.5)],
  mz_213: [kachi(38, 0.5)],
  mz_013: [pachi(30, 0.85)],
  mz_057: [pico(15, 0.3)],
  mz_138: [pachi(46, 0.85)],
  mz_142: kons([6, 18, 29, 40, 52, 63], 0.35),
  mz_147: kons([32, 39, 50, 62, 73, 84, 96, 107], 0.4),
  mz_155: kons([4, 23, 42], 0.4),
  mz_156: kons([12, 21, 30], 0.25),
  mz_160: kons([109, 120, 132], 0.45),
  mz_163: kons([44, 52, 63, 75, 86, 98, 109, 120, 132, 143], 0.35),
  mz_183: kons([6, 18, 29, 40, 52, 63], 0.45),
  mz_192: kons([32, 40, 52, 63], 0.3),
  mz_195: [kon(6, 0.7)], // 部屋の中でつつく音は無し (旧: 40, 52, 63, 75, 86, 98, 109, 120, 132, 143, 155, 166, 178)
  mz_202: kons([30, 40, 52, 63, 75, 86, 98], 0.35),
};
