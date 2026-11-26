// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#60〜#72 (13文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで13枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell,
  mixColor, skyColors, Flame, TOKI_ROPE,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  keijinRed: "#B8352A",
  keijinRedDark: "#8A2219",
  comb: "#E2412F",
  ai: "#2F4A7A", // 藍の着物
  aiDark: "#203559",
  aiLight: "#4E6C9E",
  hanten: "#3A4F7E",
  hantenDark: "#26365A",
  kimonoRed: "#C84B4B",
  kimonoRedDark: "#963636",
  kimonoPink: "#E08A9A",
  obi: "#E0B54A",
  hairBrown: "#4A3326",
  white: "#FFFFFF",
  skin: "#F6E2CC",
  zeni: "#B9864A",
  zeniDark: "#7E5A2E",
  parch: "#EFE0B8",
  parchDark: "#D9C493",
  goldGlow: "#FFE27A",
  rope: "#C9A877",
  wax: "#F3EBD6",
  sunCore: "#FFD34E",
  sunEdge: "#F49A3A",
  cheek: "#F2928A",
  summer: "#7FC6EE",
  winter: "#A9B2BE",
  dayCell: "#FBE7A6",
  nightCell: "#3B4A78",
  shade: "#1B1A24",
  dusk: "#F08A4B",
  noren: "#2E4F86",
  kura: "#EDE6D6",
  drool: "#8EC3E6",
  bamboo: "#B9A463",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void MP; void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky; void NazoBell;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;
const INK = KRP.ink;
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
const useId = (p: string) => p + React.useId().replace(/[^a-zA-Z0-9]/g, "");

// 空 (TokiNoKane の空と同じ式。並べても継ぎ目が出ない。y<-40 は上端の色で埋める)
const MzCbSky: React.FC<{ sky: number; x0: number; x1: number; yTop?: number }> = ({ sky, x0, x1, yTop = -40 }) => {
  const [t, b] = skyColors(sky);
  const n = 16, h = 900;
  return (
    <g>
      {yTop < -40 && <rect x={x0} y={yTop} width={x1 - x0} height={-40 - yTop + 1} fill={t} />}
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x0} y={-40 + (h / n) * i - 0.5} width={x1 - x0} height={h / n + 1} fill={mixColor(t, b, Math.pow(i / (n - 1), 1.3))} />
      ))}
    </g>
  );
};

// 江戸の町並みの続き (TokiNoKane の画面の外側を埋める。同じ描き方の2段の屋根+地面)
const MzCbEdoTown: React.FC<{ sky: number; x0: number; x1: number; night?: number }> = ({ sky, x0, x1, night = 0 }) => {
  const roofC = mixColor("#4A556E", "#7D8AA3", sky / 2);
  const n = Math.ceil((x1 - x0) / 190) + 1;
  return (
    <g>
      {[0, 1].map((row) => (
        <g key={row} opacity={row === 0 ? 0.75 : 1}>
          {Array.from({ length: n }, (_, i) => {
            const hx = x0 + i * 190 + row * 90 - 40;
            const hy = row === 0 ? 650 : 730;
            const hw = 170 + ((i * 29) % 40);
            return (
              <g key={i}>
                <rect x={hx + 10} y={hy + 34} width={hw - 20} height={140} fill={mixColor("#5E4E3E", "#9B8467", sky / 2)} stroke={INK} strokeWidth={3} />
                <rect x={hx + 36} y={hy + 60} width={44} height={30} fill="#FFE1A0" stroke={INK} strokeWidth={2.5} opacity={0.35 + 0.6 * night * ((i + row) % 3 ? 1 : 0.2)} />
                <path d={`M ${hx} ${hy + 40} L ${hx + 30} ${hy} L ${hx + hw - 30} ${hy} L ${hx + hw} ${hy + 40} Z`} fill={roofC} stroke={INK} strokeWidth={4} />
                {Array.from({ length: Math.floor(hw / 18) }, (_, k) => <line key={k} x1={hx + 14 + k * 18} y1={hy + 4} x2={hx + 12 + k * 18} y2={hy + 38} stroke={INK} strokeWidth={2} opacity={0.35} />)}
                <rect x={hx + 26} y={hy - 6} width={hw - 52} height={8} rx={3} fill={mixColor(roofC, INK, 0.3)} stroke={INK} strokeWidth={3} />
              </g>
            );
          })}
        </g>
      ))}
      <rect x={x0} y={880} width={x1 - x0} height={260} fill={mixColor("#6B5A44", "#B49B76", sky / 2)} />
      <line x1={x0} y1={880} x2={x1} y2={880} stroke={INK} strokeWidth={4} />
    </g>
  );
};

// 穴あき銭 (寛永通宝のような丸い銭。字は書かない)
const MzCbZeni: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 16, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill={C.zeni} stroke={INK} strokeWidth={3} />
    <circle r={r * 0.72} fill="none" stroke={C.zeniDark} strokeWidth={2} />
    <rect x={-r * 0.28} y={-r * 0.28} width={r * 0.56} height={r * 0.56} fill={C.zeniDark} stroke={INK} strokeWidth={2} />
  </g>
);

// 口を開ける (Person の口の上に重ねる)
const MouthO: React.FC<{ rx?: number; ry?: number }> = ({ rx = 12, ry = 15 }) => (
  <g>
    <ellipse cx={0} cy={-186} rx={rx + 3} ry={ry + 2} fill={KRP.white} />
    <ellipse cx={0} cy={-186} rx={rx} ry={ry} fill={INK} />
    <ellipse cx={0} cy={-186 + ry * 0.45} rx={rx * 0.55} ry={ry * 0.32} fill="#E06A5A" />
  </g>
);

// 江戸の男 (Person + ちょんまげ・衿・前かけ・はちまき・半纏の衿)
const MzCbEdoMan: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: Pose; pointDir?: 1 | -1;
  cloth?: string; clothDark?: string; apron?: boolean; hachimaki?: boolean; hanten?: boolean;
  phase?: number; gaze?: [number, number]; lean?: number; mouth?: boolean; old?: boolean;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", pointDir = 1, cloth = C.ai, clothDark = C.aiDark,
  apron, hachimaki, hanten, phase = 0, gaze = [0, 0], lean = 0, mouth, old }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} pointDir={pointDir} cloth={cloth} clothDark={clothDark}
        hair="cap" phase={phase} gaze={gaze} lean={lean} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* ちょんまげ (頭のてっぺんにのせた髷) */}
        <path d="M -10 -292 L -8 -316 Q 0 -330 12 -322 L 30 -312 Q 34 -304 24 -302 L 10 -306 L 10 -292 Z" fill={INK} />
        <line x1={-9} y1={-298} x2={10} y2={-298} stroke={KRP.white} strokeWidth={3} />
        {old && <path d="M -62 -240 Q -66 -262 -52 -270 M 62 -240 Q 66 -262 52 -270" stroke="#E8E4DC" strokeWidth={9} strokeLinecap="round" fill="none" />}
        {hachimaki && (
          <g>
            <path d="M -64 -258 Q 0 -276 64 -258 L 64 -244 Q 0 -262 -64 -244 Z" fill={KRP.white} stroke={INK} strokeWidth={3.5} />
            <path d="M -62 -252 l 10 -4 m 6 -2 l 10 -3 m 30 -4 l 12 0 m 30 2 l 10 3" stroke={INK} strokeWidth={2} opacity={0.5} />
            <path d="M 60 -256 q 26 -14 30 6 q -18 2 -30 0 M 62 -250 q 22 10 16 26" stroke={INK} strokeWidth={3.5} fill={KRP.white} />
          </g>
        )}
        {/* 着物の衿 (白い下着がのぞく V) */}
        <path d="M -30 -160 L 0 -128 L 30 -160" fill="none" stroke={KRP.white} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -40 -160 L 0 -118 L 40 -160" fill="none" stroke={INK} strokeWidth={3} />
        {hanten && (
          <g>
            <path d="M -40 -160 L 0 -118 L 0 -52 M 40 -160 L 0 -118" stroke={clothDark} strokeWidth={11} fill="none" />
            <path d="M -56 -66 L 56 -66" stroke={clothDark} strokeWidth={8} />
          </g>
        )}
        {/* 帯 */}
        <rect x={-58} y={-98} width={116} height={13} fill={clothDark} stroke={INK} strokeWidth={3} />
        {apron && (
          <g>
            <path d="M -44 -92 L 44 -92 L 48 -34 L -48 -34 Z" fill={C.aiDark} stroke={INK} strokeWidth={4} />
            <line x1={-58} y1={-92} x2={58} y2={-92} stroke={KRP.white} strokeWidth={3} />
          </g>
        )}
        {/* hold のとき: 前に出した両腕を衿・帯より手前に描き直す (Person と同じ形。腕は2本のまま) */}
        {pose === "hold" && (
          <g>
            <rect x={-78} y={-148} width={22} height={64} rx={11} fill={cloth} stroke={INK} strokeWidth={4.5} transform="rotate(-58 -67 -148)" />
            <rect x={56} y={-148} width={22} height={64} rx={11} fill={cloth} stroke={INK} strokeWidth={4.5} transform="rotate(58 67 -148)" />
            <circle cx={-14} cy={-118} r={9} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <circle cx={14} cy={-118} r={9} fill={KRP.white} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {mouth && <MouthO />}
      </g>
    </g>
  );
};

// 江戸の女 (Person + 日本髪・赤い着物の長い裾・帯)。hold は使わない (帯が前腕を隠すため)
const MzCbEdoWoman: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: Pose; pointDir?: 1 | -1;
  cloth?: string; clothDark?: string; phase?: number; gaze?: [number, number]; lean?: number; noLegs?: boolean;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", pointDir = 1, cloth = C.kimonoRed, clothDark = C.kimonoRedDark,
  phase = 0, gaze = [0, 0], lean = 0, noLegs }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} pointDir={pointDir} cloth={cloth} clothDark={clothDark}
        hair="none" phase={phase} gaze={gaze} lean={lean} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 日本髪: 前髪・左右のふくらみ (鬢)・頭の上の髷・かんざし */}
        <ellipse cx={-62} cy={-238} rx={17} ry={28} fill={C.hairBrown} stroke={INK} strokeWidth={3} />
        <ellipse cx={62} cy={-238} rx={17} ry={28} fill={C.hairBrown} stroke={INK} strokeWidth={3} />
        <path d="M -64 -240 Q -68 -300 0 -304 Q 68 -300 64 -240 Q 36 -270 0 -266 Q -36 -270 -64 -240 Z" fill={C.hairBrown} stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={-322} rx={44} ry={24} fill={C.hairBrown} stroke={INK} strokeWidth={3.5} />
        <path d="M -30 -322 Q 0 -336 30 -322" stroke="#6B4C38" strokeWidth={3} fill="none" />
        <rect x={-50} y={-330} width={100} height={7} rx={3} fill={C.kimonoPink} stroke={INK} strokeWidth={2.5} transform="rotate(-12 0 -326)" />
        <circle cx={52} cy={-338} r={7} fill={KRP.red} stroke={INK} strokeWidth={2.5} />
        {/* 衿 */}
        <path d="M -30 -160 L 0 -126 L 30 -160" fill="none" stroke={KRP.white} strokeWidth={7} strokeLinejoin="round" />
        {/* 帯 (幅広) */}
        <rect x={-58} y={-112} width={116} height={30} fill={C.obi} stroke={INK} strokeWidth={4} />
        <line x1={-58} y1={-98} x2={58} y2={-98} stroke="#B48A2A" strokeWidth={3} />
        {/* 長い裾 (足首まで) */}
        {!noLegs && (
          <g>
            <path d="M -58 -64 L -50 -6 L 50 -6 L 58 -64 Z" fill={cloth} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M 0 -64 L 6 -6" stroke={clothDark} strokeWidth={4} />
            <ellipse cx={-18} cy={-3} rx={16} ry={7} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <ellipse cx={18} cy={-3} rx={16} ry={7} fill={KRP.white} stroke={INK} strokeWidth={3} />
          </g>
        )}
      </g>
    </g>
  );
};

// 修道士 (男性とひと目で分かる姿。頭巾は頭にかぶせず、首の後ろに下ろした布のたまり + 胸の U 字のえり)
//   若い = 短い黒髪 (hair="cap") + 頭のてっぺんのトンスラ (剃った丸) + 太めの眉
//   old  = 白髪が耳の上に少し残るはげ頭 + 大きな白ひげ + 少し太め / abbot = old + 首の十字架 + 手の小さな鈴 (bell)
//   bedhead = 寝ぐせ (短い黒髪がぼさぼさに逆立つ)
const MzCbMonk: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: Pose; pointDir?: 1 | -1;
  old?: boolean; abbot?: boolean; phase?: number; gaze?: [number, number]; lean?: number;
  mouth?: number; // 0=閉じ / >0 で口を開けて歌う (大きさ)
  bedhead?: boolean; // 寝ぐせ
  noBrow?: boolean; // 太眉を描かない (シーン側で眉を描き直すとき)
  bell?: [number, number]; // 手に持つ小さな鈴の位置 (Person の座標)
  noSkirt?: boolean;
  behind?: React.ReactNode; // 両手を後ろに回す (中身 = 背中に隠した物。腰の右うしろに出る)
}> = ({ x, y, s = 1, f, face = "normal", pose: pose0 = "stand", pointDir = 1, old, abbot, phase = 0, gaze = [0, 0], lean = 0,
  mouth = 0, bedhead, noBrow, bell, noSkirt, behind }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const T = `translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`;
  const pose: Pose = behind !== undefined ? "hold" : pose0;
  const hairBlack = "#2A2628";
  return (
    <g>
      {/* 後ろに回した腕のひじ と 隠した物 */}
      {behind !== undefined && (
        <g transform={T}>
          {behind}
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 52} -150 Q ${sd * 92} -132 ${sd * 80} -92 L ${sd * 50} -96 Z`} fill={MP.habit} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          ))}
        </g>
      )}
      <g transform={T}>
        {/* 少し太め (年上): 修道服の胴を左右にふくらませる */}
        {old && <path d="M -60 -166 Q -84 -120 -74 -66 L 74 -66 Q 84 -120 60 -166 Z" fill={MP.habit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
        {/* 首の後ろに下ろした頭巾 (布のたまり)。頭の下・肩の上にのぞく */}
        <path d="M -92 -150 Q -100 -192 -62 -206 Q -30 -196 0 -196 Q 30 -196 62 -206 Q 100 -192 92 -150 Z" fill={MP.habit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -74 -192 Q -70 -172 -62 -160 M 74 -192 Q 70 -172 62 -160" stroke={MP.habitMid} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} pointDir={pointDir} cloth={MP.habit} clothDark={MP.habit}
        hair={old ? "none" : "cap"} phase={phase} gaze={gaze} lean={lean} />
      <g transform={T}>
        {/* 若い修道士: トンスラ (頭のてっぺんの剃った丸) と太めの眉 */}
        {!old && !bedhead && (
          <g>
            <ellipse cx={0} cy={-284} rx={44} ry={17} fill={hairBlack} />
            <ellipse cx={0} cy={-285} rx={25} ry={10} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <path d="M -12 -288 Q 0 -292 10 -289" stroke={INK} strokeWidth={2} opacity={0.25} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* 寝ぐせ: 短い黒髪がぼさぼさに逆立つ (トンスラはまん中にちらり) */}
        {bedhead && (
          <g>
            <path d={`M -64 -260 Q -102 -262 -94 ${-294 + Math.sin(f / 5) * 3} Q -80 -280 -70 -284 Q -88 -322 -50 ${-332 + Math.sin(f / 6) * 3} Q -46 -308 -32 -304
              Q -30 -352 6 ${-344 + Math.sin(f / 4) * 3} Q -6 -320 8 -306 Q 30 -346 62 ${-328 + Math.sin(f / 5 + 1) * 3} Q 38 -312 44 -298
              Q 82 -312 100 ${-282 + Math.sin(f / 6 + 2) * 3} Q 76 -280 70 -270 Q 100 -264 90 -240 Q 76 -258 64 -260 Z`}
              fill={hairBlack} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -42 -300 Q -50 -316 -44 -322 M 40 -298 Q 52 -312 60 -316 M 2 -308 Q 2 -324 8 -332" stroke="#57505A" strokeWidth={4} strokeLinecap="round" />
            <ellipse cx={-4} cy={-292} rx={16} ry={7} fill={KRP.white} stroke={INK} strokeWidth={3} transform="rotate(-8 -4 -292)" />
          </g>
        )}
        {!old && !noBrow && (
          <g stroke={INK} strokeWidth={8} strokeLinecap="round" fill="none">
            <path d="M -40 -248 Q -26 -256 -10 -250" />
            <path d="M 10 -250 Q 26 -256 40 -248" />
          </g>
        )}
        {/* 年上: はげ頭 (てかり) + 耳の上に少し残る白髪 + 大きな白ひげ */}
        {old && (
          <g>
            <path d="M -36 -276 Q -22 -288 -4 -288" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9} />
            <path d="M -40 -270 Q -26 -282 -8 -282" stroke="#D9D6CF" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            <path d="M -64 -256 Q -82 -230 -64 -200 Q -56 -226 -54 -250 Z" fill="#F1F1EE" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M 64 -256 Q 82 -230 64 -200 Q 56 -226 54 -250 Z" fill="#F1F1EE" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M -44 -178 Q -46 -128 0 -118 Q 46 -128 44 -178 Q 30 -168 0 -170 Q -30 -168 -44 -178 Z" fill="#F4F1EA" stroke={INK} strokeWidth={3.5} />
            <path d="M -16 -150 q 4 10 0 18 M 14 -150 q -4 10 0 18" stroke="#C9C4BA" strokeWidth={2.5} fill="none" />
            {/* 白い口ひげ */}
            <path d="M -26 -192 Q -12 -180 0 -190 Q 12 -180 26 -192 Q 16 -172 0 -180 Q -16 -172 -26 -192 Z" fill="#F4F1EA" stroke={INK} strokeWidth={2.5} />
          </g>
        )}
        {/* 胸の U 字のえり (下ろした頭巾の前側) */}
        <path d="M -80 -168 Q -40 -110 0 -108 Q 40 -110 80 -168 L 60 -172 Q 30 -130 0 -130 Q -30 -130 -60 -172 Z" fill={MP.habit} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -52 -150 Q 0 -112 52 -150" stroke={MP.habitMid} strokeWidth={4} fill="none" />
        {/* 後ろ手: 胸の前の前腕を修道服で隠す (腕は背中へ回っている) */}
        {behind !== undefined && <rect x={-58} y={-120} width={116} height={54} rx={14} fill={MP.habit} stroke={INK} strokeWidth={4.5} />}
        {/* 胸当て (スカプラリオ) */}
        {(pose !== "hold" || behind !== undefined) && <rect x={-26} y={-114} width={52} height={56} rx={6} fill={MP.habitMid} stroke={INK} strokeWidth={3.5} />}
        {/* 縄の帯 */}
        <path d="M -58 -70 Q 0 -62 58 -70" stroke={C.rope} strokeWidth={7} fill="none" />
        <path d="M 22 -66 q 6 30 -2 52 M 30 -66 q 10 24 6 40" stroke={C.rope} strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={20} cy={-14} r={5} fill={C.rope} stroke={INK} strokeWidth={2} />
        {/* 長い修道服の裾 (足首まで) */}
        {!noSkirt && (
          <g>
            <path d={old ? "M -72 -66 L -78 -4 L 78 -4 L 72 -66 Z" : "M -58 -66 L -70 -4 L 70 -4 L 58 -66 Z"} fill={MP.habit} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -20 -60 L -26 -6 M 22 -60 L 28 -6" stroke={MP.habitMid} strokeWidth={4} />
          </g>
        )}
        {abbot && (
          <g>
            <path d="M -30 -164 L 0 -112 L 30 -164" stroke={MP.brass} strokeWidth={4} fill="none" />
            <rect x={-6} y={-116} width={12} height={46} rx={2} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
            <rect x={-18} y={-104} width={36} height={11} rx={2} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
          </g>
        )}
        {/* 手に持つ小さな鈴 */}
        {bell && (
          <g transform={`translate(${bell[0]} ${bell[1]}) rotate(${Math.sin(f / 6) * 8})`}>
            <rect x={-5} y={-30} width={10} height={22} rx={3} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
            <path d="M -18 14 Q -18 -12 0 -12 Q 18 -12 18 14 L 23 22 L -23 22 Z" fill={MP.brass} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <circle cx={0} cy={27} r={5} fill={MP.iron} />
            {/* 鈴の柄をにぎる手 */}
            <ellipse cx={0} cy={-34} rx={15} ry={13} fill={C.skin} stroke={INK} strokeWidth={3.5} />
            <path d="M -9 -38 L 9 -38 M -9 -30 L 9 -30" stroke={INK} strokeWidth={2} opacity={0.5} />
          </g>
        )}
        {mouth > 0 && <MouthO rx={9 * mouth} ry={12 * mouth} />}
      </g>
    </g>
  );
};

// 鶏人 (古代中国の役人。赤い頭巾+とさかの冠・長い袖の衣)
const MzCbKeijin: React.FC<{ x: number; y: number; s?: number; f: number; face?: Face; phase?: number; gaze?: [number, number]; mouth?: boolean }> = ({
  x, y, s = 1, f, face = "surprised", phase = 0, gaze = [0, 0], mouth }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose="stand" cloth={C.keijinRed} clothDark={C.keijinRedDark} hair="none" phase={phase} gaze={gaze} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 赤い頭巾 */}
        <path d="M -66 -232 Q -70 -300 0 -304 Q 70 -300 66 -232 Q 40 -262 0 -262 Q -40 -262 -66 -232 Z" fill={C.keijinRed} stroke={INK} strokeWidth={4.5} />
        <path d="M -62 -244 Q 0 -270 62 -244" stroke={MP.brass} strokeWidth={6} fill="none" />
        {/* 鶏のとさかを模した冠 */}
        <path d="M -40 -296 Q -46 -332 -24 -330 Q -22 -360 4 -352 Q 14 -378 32 -356 Q 54 -356 46 -326 Q 56 -310 42 -298 Z" fill={C.comb} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -20 -312 Q 4 -326 30 -314" stroke="#F58A7A" strokeWidth={4} fill="none" />
        {/* 長い袖 (腕を包む。下へ広がる) */}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 54} -156 L ${sd * 82} -156 Q ${sd * 112} -100 ${sd * 106} -36 L ${sd * 60} -40 Z`}
            fill={C.keijinRed} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        ))}
        {[-1, 1].map((sd) => <path key={`c${sd}`} d={`M ${sd * 60} -40 L ${sd * 106} -36`} stroke={MP.brass} strokeWidth={6} />)}
        {/* 衿と帯 */}
        <path d="M -32 -160 L 0 -120 L 32 -160" fill="none" stroke={KRP.white} strokeWidth={7} />
        <rect x={-58} y={-100} width={116} height={14} fill={MP.brass} stroke={INK} strokeWidth={3} />
        {/* 長い衣の裾 */}
        <path d="M -58 -66 L -66 -4 L 66 -4 L 58 -66 Z" fill={C.keijinRed} stroke={INK} strokeWidth={4.5} />
        {mouth && <MouthO rx={13} ry={17} />}
      </g>
    </g>
  );
};

// 顔のある太陽 (やさしい笑顔)。look: 黒目の向き (-1..1)。smile=1 で目が ^ ^
const MzCbSun: React.FC<{ x: number; y: number; r?: number; f: number; look?: number; smile?: number; blush?: boolean }> = ({
  x, y, r = 150, f, look = 0, smile = 1, blush = true }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.55} fill={C.goldGlow} opacity={0.22} />
    <g transform={`rotate(${f * 0.6})`}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r0 = r * 1.08, r1 = r * (i % 2 ? 1.36 : 1.5);
        return <path key={i} d={`M ${Math.cos(a - 0.12) * r0} ${Math.sin(a - 0.12) * r0} L ${Math.cos(a) * r1} ${Math.sin(a) * r1} L ${Math.cos(a + 0.12) * r0} ${Math.sin(a + 0.12) * r0} Z`}
          fill={C.sunEdge} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
      })}
    </g>
    <circle r={r} fill={C.sunCore} stroke={INK} strokeWidth={6} />
    <path d={`M ${-r * 0.7} ${-r * 0.35} Q ${-r * 0.6} ${-r * 0.7} ${-r * 0.25} ${-r * 0.82}`} stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6} />
    {smile >= 1 ? (
      <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round">
        <path d={`M ${-r * 0.5} ${-r * 0.08} Q ${-r * 0.34} ${-r * 0.3} ${-r * 0.18} ${-r * 0.08}`} />
        <path d={`M ${r * 0.18} ${-r * 0.08} Q ${r * 0.34} ${-r * 0.3} ${r * 0.5} ${-r * 0.08}`} />
      </g>
    ) : (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <ellipse cx={sd * r * 0.34} cy={-r * 0.14} rx={r * 0.12} ry={r * 0.16} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
            <circle cx={sd * r * 0.34 + look * r * 0.07} cy={-r * 0.14} r={r * 0.06} fill={INK} />
          </g>
        ))}
      </g>
    )}
    {blush && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * r * 0.56} cy={r * 0.16} rx={r * 0.14} ry={r * 0.08} fill={C.cheek} opacity={0.7} />)}
    <path d={`M ${-r * 0.26} ${r * 0.2} Q 0 ${r * 0.5} ${r * 0.26} ${r * 0.2}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </g>
);

// 和時計の時刻の板 (昼6コマ=黄・夜6コマ=紺。割駒の木の駒で区切る)。day = 昼の割合 (0.5=春秋)。
// ghost: 比べる季節の昼の割合 (点線で出す)。x,y=板の中心
const MzCbWadokei: React.FC<{ x: number; y: number; w?: number; f: number; day: number; ghost?: number; feet?: number; s?: number }> = ({
  x, y, w = 1240, f, day, ghost, feet = 0, s = 1 }) => {
  const h = 230;
  const bx = -w / 2 + 40, bw = w - 80, by = -h / 2 + 70, bh = 110;
  const dayW = bw * day;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const isDay = i < 6;
    const cx0 = isDay ? bx + (dayW / 6) * i : bx + dayW + ((bw - dayW) / 6) * (i - 6);
    const cw = isDay ? dayW / 6 : (bw - dayW) / 6;
    cells.push(
      <g key={i}>
        <rect x={cx0} y={by} width={cw} height={bh} fill={isDay ? C.dayCell : C.nightCell} stroke={INK} strokeWidth={3} />
        {isDay ? (
          <g transform={`translate(${cx0 + cw / 2} ${by + bh / 2})`}>
            <circle r={13} fill={C.sunCore} stroke={INK} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <line key={k} x1={Math.cos(k * 0.785) * 17} y1={Math.sin(k * 0.785) * 17} x2={Math.cos(k * 0.785) * 24} y2={Math.sin(k * 0.785) * 24} stroke={INK} strokeWidth={3} />)}
          </g>
        ) : (
          <path d={`M ${cx0 + cw / 2 + 6} ${by + bh / 2 - 16} a 17 17 0 1 0 0 32 a 13 13 0 1 1 0 -32 Z`} fill="#F4E9B8" stroke={INK} strokeWidth={2.5} />
        )}
      </g>,
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 吊るし紐 */}
      <path d={`M ${-w / 2 + 80} ${-h / 2} L -40 ${-h / 2 - 90} L 40 ${-h / 2 - 90} L ${w / 2 - 80} ${-h / 2}`} stroke={C.rope} strokeWidth={6} fill="none" />
      <circle cx={0} cy={-h / 2 - 90} r={12} fill={MP.iron} stroke={INK} strokeWidth={3} />
      {/* 小さな足 (#71 で太陽についていく) */}
      {feet > 0 && [-1, 1].map((sd) => (
        <g key={sd} transform={`rotate(${sd * Math.sin(f / 3) * 18 * feet} ${sd * w * 0.3} ${h / 2})`}>
          <rect x={sd * w * 0.3 - 10} y={h / 2 - 4} width={20} height={50} rx={8} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          <ellipse cx={sd * w * 0.3 + 8} cy={h / 2 + 48} rx={22} ry={10} fill={INK} />
        </g>
      ))}
      {/* 木の板 */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={MP.wood} stroke={INK} strokeWidth={7} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={8} fill="none" stroke={MP.woodDark} strokeWidth={4} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${-w / 2 + 30} ${-h / 2 + 30 + k * 12} q ${w / 3} 8 ${w - 60} 0`} stroke={MP.woodDark} strokeWidth={2.5} fill="none" opacity={0.4} />)}
      {cells}
      <rect x={bx} y={by} width={bw} height={bh} fill="none" stroke={INK} strokeWidth={5} />
      {/* 割駒 (昼と夜のさかいの、動かせる木の駒) */}
      {Array.from({ length: 13 }, (_, i) => {
        const px = i <= 6 ? bx + (dayW / 6) * i : bx + dayW + ((bw - dayW) / 6) * (i - 6);
        const big = i === 0 || i === 6 || i === 12;
        return <rect key={i} x={px - (big ? 9 : 6)} y={by - (big ? 22 : 14)} width={big ? 18 : 12} height={bh + (big ? 44 : 28)} rx={4}
          fill={big ? MP.brass : MP.woodLight} stroke={INK} strokeWidth={3.5} />;
      })}
      {ghost !== undefined && (
        <g>
          <rect x={bx} y={by - 34} width={bw * ghost} height={bh + 68} rx={8} fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="14 10" />
        </g>
      )}
    </g>
  );
};

// 修道院の会則の本 (見開き・羊皮紙)。glow: 1行が光る / bloom: 花の模様 / close: 右ページが閉じる
const RB_X = 960, RB_Y = 520, RB_PW = 560, RB_PH = 600;
const RB_LINE_Y = (i: number) => RB_Y - RB_PH / 2 + 80 + i * 40; // 右ページの行
const RB_GLOW_ROW = 6;
const MzCbRuleBook: React.FC<{ f: number; glow: number; bloom: number; flip?: number; close?: number }> = ({ f, glow, bloom, flip = 1, close = 0 }) => {
  const top = RB_Y - RB_PH / 2;
  const lines = (x0: number, seed: number, skipGlow: boolean) => Array.from({ length: 12 }, (_, i) => {
    const ly = RB_LINE_Y(i);
    const len = RB_PW - 140 - rnd(seed, i) * 90;
    if (skipGlow && i === RB_GLOW_ROW) return null;
    return (
      <g key={i}>
        {Array.from({ length: 6 }, (_, k) => {
          const wx = x0 + 70 + k * (len / 6);
          return <line key={k} x1={wx} y1={ly} x2={wx + len / 6 - 12 - rnd(seed + k, i) * 14} y2={ly} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.8} />;
        })}
      </g>
    );
  });
  const gy = RB_LINE_Y(RB_GLOW_ROW);
  const gx0 = RB_X + 70, gx1 = RB_X + RB_PW - 90;
  const flipS = Math.cos((1 - flip) * Math.PI); // 1 → 平ら、 -1 → めくり始め
  const closeS = Math.cos(close * Math.PI);
  if (close >= 1) {
    // 閉じた本 (左半分に、革の表紙と真鍮の角金具)
    const x0 = RB_X - RB_PW - 20, x1 = RB_X + 14;
    return (
      <g>
        <rect x={x0} y={top + 30} width={x1 - x0} height={RB_PH + 10} rx={10} fill={C.parchDark} stroke={INK} strokeWidth={5} />
        <rect x={x0 - 6} y={top + 6} width={x1 - x0 + 12} height={RB_PH + 20} rx={12} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
        <rect x={x0 + 30} y={top + 36} width={x1 - x0 - 60} height={RB_PH - 40} rx={8} fill="none" stroke={MP.brass} strokeWidth={5} />
        <path d={`M ${(x0 + x1) / 2} ${top + 200} l 0 200 M ${(x0 + x1) / 2 - 60} ${top + 260} l 120 0`} stroke={MP.brass} strokeWidth={14} strokeLinecap="round" />
        {[[x0, top + 6], [x1, top + 6], [x0, top + RB_PH + 26], [x1, top + RB_PH + 26]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={16} fill={MP.brass} stroke={INK} strokeWidth={4} />)}
      </g>
    );
  }
  return (
    <g>
      {/* 本の厚み (ページの束) */}
      <path d={`M ${RB_X - RB_PW - 20} ${top + 20} L ${RB_X - RB_PW - 20} ${top + RB_PH + 24} Q ${RB_X - RB_PW / 2} ${top + RB_PH + 44} ${RB_X} ${top + RB_PH + 36} Q ${RB_X + RB_PW / 2} ${top + RB_PH + 44} ${RB_X + RB_PW + 20} ${top + RB_PH + 24} L ${RB_X + RB_PW + 20} ${top + 20} Z`}
        fill={MP.woodDark} stroke={INK} strokeWidth={6} />
      {[10, 18, 26].map((k) => <path key={k} d={`M ${RB_X - RB_PW - 10} ${top + RB_PH + k - 6} Q ${RB_X - RB_PW / 2} ${top + RB_PH + k + 12} ${RB_X} ${top + RB_PH + k + 4} Q ${RB_X + RB_PW / 2} ${top + RB_PH + k + 12} ${RB_X + RB_PW + 10} ${top + RB_PH + k - 6}`} stroke={C.parchDark} strokeWidth={4} fill="none" />)}
      {/* 左ページ */}
      <path d={`M ${RB_X} ${top + 14} Q ${RB_X - RB_PW / 2} ${top - 10} ${RB_X - RB_PW} ${top + 6} L ${RB_X - RB_PW} ${top + RB_PH + 6} Q ${RB_X - RB_PW / 2} ${top + RB_PH - 14} ${RB_X} ${top + RB_PH + 14} Z`}
        fill={C.parch} stroke={INK} strokeWidth={5} />
      {/* 左ページの飾り頭文字 (赤と金) */}
      <rect x={RB_X - RB_PW + 60} y={top + 56} width={86} height={86} rx={6} fill={KRP.red} stroke={INK} strokeWidth={4} />
      <path d={`M ${RB_X - RB_PW + 80} ${top + 124} L ${RB_X - RB_PW + 103} ${top + 70} L ${RB_X - RB_PW + 126} ${top + 124} M ${RB_X - RB_PW + 90} ${top + 104} L ${RB_X - RB_PW + 116} ${top + 104}`} stroke={MP.brassLight} strokeWidth={7} fill="none" strokeLinecap="round" />
      {lines(RB_X - RB_PW + 40, 3, false).slice(3)}
      {[0, 1, 2].map((i) => <line key={i} x1={RB_X - RB_PW + 166} y1={RB_LINE_Y(i)} x2={RB_X - 70 - i * 20} y2={RB_LINE_Y(i)} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.8} strokeDasharray="60 14" />)}
      {/* 右ページ (close で左へ倒れて閉じる) */}
      <g transform={`translate(${RB_X} 0) scale(${closeS} 1) translate(${-RB_X} 0)`}>
        <path d={`M ${RB_X} ${top + 14} Q ${RB_X + RB_PW / 2} ${top - 10} ${RB_X + RB_PW} ${top + 6} L ${RB_X + RB_PW} ${top + RB_PH + 6} Q ${RB_X + RB_PW / 2} ${top + RB_PH - 14} ${RB_X} ${top + RB_PH + 14} Z`}
          fill={closeS < 0 ? C.parchDark : C.parch} stroke={INK} strokeWidth={5} />
        {closeS > 0 && (
          <g>
            {lines(RB_X, 7, true)}
            {/* やさしい1行 (金色に光る) */}
            <rect x={gx0 - 20} y={gy - 22} width={(gx1 - gx0 + 40)} height={44} rx={20} fill={C.goldGlow} opacity={0.75 * glow} />
            <rect x={gx0 - 40} y={gy - 34} width={(gx1 - gx0 + 80)} height={68} rx={30} fill={C.goldGlow} opacity={0.28 * glow * (0.85 + 0.15 * Math.sin(f / 6))} />
            {Array.from({ length: 6 }, (_, k) => {
              const len = (gx1 - gx0) / 6;
              const wx = gx0 + k * len;
              return <line key={k} x1={wx} y1={gy} x2={wx + len - 14} y2={gy} stroke={mixColor(INK, MP.brassDark, glow)} strokeWidth={6} strokeLinecap="round" />;
            })}
            {/* 花の飾り模様 (行のまわりに咲く) */}
            {Array.from({ length: 10 }, (_, k) => {
              const t = clamp01(bloom * 1.6 - k * 0.07);
              if (t <= 0) return null;
              const fx = gx0 - 30 + k * ((gx1 - gx0 + 60) / 9);
              const fy = gy + (k % 2 ? -44 : 44);
              const col = k % 3 === 0 ? KRP.red : k % 3 === 1 ? KRP.blueDeep : "#9C5BB0";
              return (
                <g key={k} transform={`translate(${fx} ${fy}) scale(${pop(t) * 0.9}) rotate(${f * 0.5 + k * 30})`}>
                  <path d={`M -26 0 Q 0 ${k % 2 ? 14 : -14} 26 0`} stroke={KRP.green} strokeWidth={4} fill="none" />
                  {[0, 1, 2, 3, 4].map((p) => <ellipse key={p} cx={Math.cos(p * 1.2566) * 9} cy={Math.sin(p * 1.2566) * 9} rx={7} ry={5} transform={`rotate(${p * 72} ${Math.cos(p * 1.2566) * 9} ${Math.sin(p * 1.2566) * 9})`} fill={col} stroke={INK} strokeWidth={2} />)}
                  <circle r={5} fill={MP.brassLight} stroke={INK} strokeWidth={2} />
                </g>
              );
            })}
          </g>
        )}
      </g>
      {/* めくれているページ (flip<1 のとき) */}
      {flip < 1 && (
        <g transform={`translate(${RB_X} 0) scale(${flipS} 1) translate(${-RB_X} 0)`}>
          <path d={`M ${RB_X} ${top + 14} Q ${RB_X + RB_PW / 2} ${top - 30} ${RB_X + RB_PW - 10} ${top} L ${RB_X + RB_PW - 10} ${top + RB_PH} Q ${RB_X + RB_PW / 2} ${top + RB_PH - 30} ${RB_X} ${top + RB_PH + 14} Z`}
            fill={flipS > 0 ? C.parch : C.parchDark} stroke={INK} strokeWidth={4} />
        </g>
      )}
      {/* のど (真ん中の折り目) */}
      <path d={`M ${RB_X} ${top + 14} L ${RB_X} ${top + RB_PH + 14}`} stroke={C.parchDark} strokeWidth={14} />
      <path d={`M ${RB_X} ${top + 14} L ${RB_X} ${top + RB_PH + 14}`} stroke={INK} strokeWidth={3} />
    </g>
  );
};

// 書見台の木の台とろうそく3本 (#61・#64 の共通の小道具。同じ机の続き)
const MzCbLectern: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <path d="M 240 830 L 1680 830 L 1760 1100 L 160 1100 Z" fill={MP.woodDark} stroke={INK} strokeWidth={7} />
    <path d="M 220 790 L 1700 790 L 1700 840 L 220 840 Z" fill={MP.wood} stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((k) => <path key={k} d={`M 240 ${802 + k * 12} q 700 ${k * 4 - 4} 1440 0`} stroke={MP.woodDark} strokeWidth={3} fill="none" opacity={0.5} />)}
    {/* ろうそく3本 (左に2本・右に1本) */}
    {[[250, 790, 150], [340, 790, 110], [1640, 790, 170]].map(([cx, cy, ch], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy - ch - 20} r={120} fill={MP.glow} opacity={0.16} />
        <ellipse cx={cx} cy={cy - 4} rx={36} ry={10} fill={MP.brass} stroke={INK} strokeWidth={4} />
        <rect x={cx - 16} y={cy - ch} width={32} height={ch - 6} rx={4} fill={C.wax} stroke={INK} strokeWidth={4.5} />
        <path d={`M ${cx - 10} ${cy - ch} q 2 ${18 + i * 6} 6 0 M ${cx + 6} ${cy - ch} q 3 ${26 - i * 5} 6 0`} stroke={C.wax} strokeWidth={6} fill="none" />
        <path d={`M ${cx - 10} ${cy - ch} q 2 ${18 + i * 6} 6 0`} stroke={INK} strokeWidth={1.5} fill="none" opacity={0.5} />
        <Flame x={cx} y={cy - ch} f={f} phase={i * 2} s={1.1} />
      </g>
    ))}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #60 時計の向こう側にいた犯人。それは、他人でした。
// 格: 山 / seed 6060
// 絵: どこ: Shudouin の石壁に掛かった、大きな丸い時計 (#11 の「時計の向こう側」の言葉を受ける。文字盤・針2本・数字)。修道院の夜の暗さ (dark=0.9, candle=1)。演出: 時計の文字盤が扉のように蝶番でギギッと手前に開き、その奥の隠し部屋がスポットライトで照らされる。中には、鶏人 (口を開けたまま固まる) と、修道院長 (鈴を後ろ手に隠す。腕は2本) が「見つかった」という顔で並んで立っている (face="surprised")。2人の頭上に小さな「犯人」ではなく**大きな「!」**。カメラは時計の文字盤いっぱいの寄りから、扉が開くのに合わせて少し引いて中を見せる。動き: f0-25 文字盤がガタガタ揺れる / f25-50 扉が開く / f50 スポットライトがカッ / f55-100 2人がぎくっと肩を上げる・鈴がちりんと落ちる
// どこ: 修道院の夜の寝室 (Shudouin dark=0.9 candle=1) の石壁の真ん中に掛かった、大きな丸い時計
// 演出: 文字盤が扉のように左の蝶番で手前に開き、奥の隠し部屋にスポットライト。鶏人 (口あんぐり) と
//       修道院長 (鈴を後ろ手に隠す) が「見つかった」顔で並ぶ。頭上に大きな「!」。院長の背中から鈴がちりんと落ちる
// 動き: f0-12 文字盤がガタガタ / f10-26 扉が開く / f27 スポットライトがカッ / f28-34 2人がぎくっ・「!」 /
//       f30-42 鈴が落ちて床ではねる / カメラは寄り(1.45)→引き(1.0) f0-32、そのあとゆっくり呼吸
const Mz060: React.FC<{ f: number }> = ({ f }) => {
  const clip = useId("mz60room");
  const CX = 960, CY = 430, R = 290;
  const shakeT = 1 - seg(f, 10, 14);
  const shake = f < 14 ? Math.sin(f * 2.7) * 2.2 * shakeT : 0;
  const open = easeInOut(seg(f, 10, 26));
  const doorS = 1 - 1.25 * open; // 1=閉 → -0.25 (手前に開ききって裏が見える)
  const spot = seg(f, 26, 28);
  const startle = pop(seg(f, 28, 34));
  const jump = f >= 28 && f < 40 ? -Math.sin(seg(f, 28, 36) * Math.PI) * 16 : 0;
  const k = lerp(1.45, 1.0, easeOut(seg(f, 0, 32))) + Math.sin(f / 40) * 0.008;
  // 鈴の落下
  const drop = seg(f, 31, 39);
  const bellX = lerp(1133, 1170, drop);
  const bellY = f < 31 ? 591 : f < 39 ? lerp(591, 664, drop * drop) : 664 - Math.abs(Math.sin(seg(f, 39, 52) * Math.PI * 2)) * 14 * (1 - seg(f, 39, 52));
  const bellRot = f < 31 ? 0 : lerp(0, 120, drop) + (f > 39 ? Math.sin(f / 2) * 10 * (1 - seg(f, 39, 60)) : 0);
  const nums = Array.from({ length: 12 }, (_, i) => i + 1);
  const face = (
    <g>
      <circle cx={CX} cy={CY} r={R} fill={KRP.cream} stroke={INK} strokeWidth={8} />
      <circle cx={CX} cy={CY} r={R - 26} fill="none" stroke={MP.brassDark} strokeWidth={4} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const r0 = R - 26, r1 = i % 5 ? R - 40 : R - 52;
        return <line key={i} x1={CX + Math.sin(a) * r0} y1={CY - Math.cos(a) * r0} x2={CX + Math.sin(a) * r1} y2={CY - Math.cos(a) * r1} stroke={INK} strokeWidth={i % 5 ? 3 : 6} />;
      })}
      {nums.map((n) => {
        const a = (n * 30 * Math.PI) / 180;
        return <text key={n} x={CX + Math.sin(a) * (R - 92)} y={CY - Math.cos(a) * (R - 92) + 18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>{n}</text>;
      })}
      {/* 針2本 (5時ちょうど) */}
      <line x1={CX} y1={CY} x2={CX + Math.sin((150 * Math.PI) / 180) * 140} y2={CY - Math.cos((150 * Math.PI) / 180) * 140} stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <line x1={CX} y1={CY} x2={CX + Math.sin(((f * 0.15) * Math.PI) / 180) * 210} y2={CY - Math.cos(((f * 0.15) * Math.PI) / 180) * 210} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={18} fill={MP.brass} stroke={INK} strokeWidth={5} />
      {/* 扉のとって */}
      <rect x={CX + R - 40} y={CY - 26} width={22} height={52} rx={8} fill={MP.brass} stroke={INK} strokeWidth={4} />
    </g>
  );
  const back = (
    <g>
      <circle cx={CX} cy={CY} r={R} fill={MP.woodDark} stroke={INK} strokeWidth={8} />
      {[-200, -120, -40, 40, 120, 200].map((dy) => <line key={dy} x1={CX - Math.sqrt(R * R - dy * dy)} y1={CY + dy} x2={CX + Math.sqrt(R * R - dy * dy)} y2={CY + dy} stroke={INK} strokeWidth={4} opacity={0.5} />)}
      <circle cx={CX} cy={CY} r={40} fill={MP.iron} stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((g) => <circle key={g} cx={CX - 80 + g * 80} cy={CY + 90 - (g % 2) * 40} r={30} fill={MP.brassDark} stroke={INK} strokeWidth={4} strokeDasharray="8 5" />)}
    </g>
  );
  return (
    <Frame f={f} seed={6060} dark>
      <g transform={`translate(${CX} ${CY}) scale(${k}) translate(${-CX} ${-CY})`}>
        <Shudouin f={f} dark={0.9} candle={1} />
        {/* 時計の外わく (壁に掛ける金具つき) */}
        <path d={`M ${CX - 40} ${CY - R - 60} L ${CX} ${CY - R - 110} L ${CX + 40} ${CY - R - 60}`} stroke={MP.iron} strokeWidth={7} fill="none" />
        <circle cx={CX} cy={CY - R - 110} r={12} fill={MP.iron} stroke={INK} strokeWidth={4} />
        <circle cx={CX} cy={CY} r={R + 34} fill={MP.wood} stroke={INK} strokeWidth={8} />
        <circle cx={CX} cy={CY} r={R + 16} fill="none" stroke={MP.woodDark} strokeWidth={5} />
        {/* 隠し部屋 (時計の奥) */}
        <defs><clipPath id={clip}><circle cx={CX} cy={CY} r={R} /></clipPath></defs>
        <g clipPath={`url(#${clip})`}>
          <rect x={CX - R} y={CY - R} width={R * 2} height={R * 2} fill={C.shade} />
          {/* 部屋の奥の壁 (石) と床 */}
          {Array.from({ length: 7 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
            <rect key={`${r}${c}`} x={CX - R + c * 80 - (r % 2) * 40} y={CY - R + r * 56} width={78} height={54} fill={MP.stoneDark} stroke={INK} strokeWidth={2.5} opacity={0.35 + 0.5 * spot} />
          )))}
          <rect x={CX - R} y={CY + 236} width={R * 2} height={80} fill={MP.woodDark} opacity={0.5 + 0.5 * spot} />
          {/* 小物: 机と湯気の出ていない湯のみ、壁の作戦の貼り紙 (鶏と鈴の絵) */}
          <g opacity={0.4 + 0.6 * spot}>
            <rect x={CX - 250} y={CY - 150} width={110} height={130} fill={C.parch} stroke={INK} strokeWidth={4} transform={`rotate(-6 ${CX - 195} ${CY - 85})`} />
            <path d={`M ${CX - 228} ${CY - 80} q 10 -34 30 -20 q 16 -20 22 4 q 10 24 -16 34 q -26 6 -36 -18 Z`} fill={KRP.white} stroke={INK} strokeWidth={3} />
            <path d={`M ${CX - 208} ${CY - 104} q 4 -12 12 -4 q 6 -10 10 2`} fill={C.comb} stroke={INK} strokeWidth={2.5} />
            <path d={`M ${CX - 190} ${CY - 50} q 0 -22 16 -22 q 16 0 16 22 l 4 6 l -40 0 Z`} fill={MP.brass} stroke={INK} strokeWidth={2.5} />
            <rect x={CX + 160} y={CY + 150} width={120} height={16} fill={MP.wood} stroke={INK} strokeWidth={4} />
            <rect x={CX + 176} y={CY + 166} width={12} height={74} fill={MP.wood} stroke={INK} strokeWidth={3} />
            <rect x={CX + 252} y={CY + 166} width={12} height={74} fill={MP.wood} stroke={INK} strokeWidth={3} />
            <path d={`M ${CX + 196} ${CY + 126} L ${CX + 226} ${CY + 126} L ${CX + 222} ${CY + 150} L ${CX + 200} ${CY + 150} Z`} fill={KRP.white} stroke={INK} strokeWidth={3} />
          </g>
          {/* スポットライト */}
          {spot > 0 && (
            <g>
              <polygon points={`${CX - 40},${CY - R} ${CX + 40},${CY - R} ${CX + 250},${CY + 250} ${CX - 250},${CY + 250}`} fill={C.goldGlow} opacity={0.32 * spot} />
              <ellipse cx={CX} cy={CY + 244} rx={250} ry={34} fill={C.goldGlow} opacity={0.5 * spot} />
            </g>
          )}
          {/* 犯人2人 */}
          <g transform={`translate(0 ${jump})`} opacity={0.35 + 0.65 * spot}>
            <MzCbKeijin x={CX - 100} y={CY + 244} s={0.74} f={f} face="surprised" mouth phase={1} gaze={[0, -2]} />
            <MzCbMonk x={CX + 105} y={CY + 244} s={0.74} f={f} face="surprised" old abbot phase={2} gaze={[-3, -2]}
              behind={f < 31 ? (
                <g>
                  <path d="M 70 -112 Q 70 -140 92 -140 Q 114 -140 114 -112 L 120 -102 L 64 -102 Z" fill={MP.brass} stroke={INK} strokeWidth={4} />
                  <circle cx={92} cy={-96} r={6} fill={MP.iron} />
                </g>
              ) : <g />} />
            {/* ぎくっの汗 */}
            {startle > 0 && [[CX - 160, CY + 40], [CX - 40, CY + 60], [CX + 40, CY + 40], [CX + 160, CY + 60]].map(([sx, sy], i) => (
              <path key={i} d={`M ${sx} ${sy} q -9 16 0 22 q 9 -6 0 -22 Z`} fill={KRP.blue} stroke={INK} strokeWidth={2.5} transform={`scale(1) translate(0 ${Math.sin(f / 5 + i) * 3})`} opacity={startle} />
            ))}
          </g>
          {/* 落ちる鈴 */}
          {f >= 31 && (
            <g transform={`translate(${bellX} ${bellY}) rotate(${bellRot})`}>
              <path d="M -22 4 Q -22 -26 0 -26 Q 22 -26 22 4 L 28 14 L -28 14 Z" fill={MP.brass} stroke={INK} strokeWidth={4} />
              <circle cx={0} cy={20} r={6} fill={MP.iron} />
            </g>
          )}
          {f >= 39 && f < 70 && [0, 1].map((i) => (
            <path key={i} d={`M ${1170 + (i ? 40 : -40)} 640 q ${i ? 14 : -14} -14 0 -30`} stroke={C.goldGlow} strokeWidth={5} fill="none" opacity={1 - seg(f, 39, 70)} />
          ))}
          {/* 大きな「!」 */}
          <g transform={`translate(${CX} ${CY - 40}) scale(${startle * (1 + Math.sin(f / 7) * 0.03)})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill={KRP.red} stroke={INK} strokeWidth={7} paintOrder="stroke">!</text>
          </g>
        </g>
        {/* 文字盤の扉 (左の蝶番で開く) */}
        <g transform={`translate(${CX - R} 0) scale(${doorS} 1) translate(${-(CX - R)} 0) rotate(${shake} ${CX} ${CY})`}>
          {doorS > 0 ? face : back}
        </g>
        {/* 蝶番 */}
        {[-120, 120].map((dy) => <rect key={dy} x={CX - R - 22} y={CY + dy - 20} width={34} height={40} rx={5} fill={MP.iron} stroke={INK} strokeWidth={4} />)}
        {/* ガタガタの線 */}
        {f < 14 && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${CX + sd * (R + 60)} ${CY - 60} l ${sd * 20} 20 l ${-sd * 20} 20 l ${sd * 20} 20`} stroke={MP.glow} strokeWidth={6} fill="none" strokeLinecap="round" opacity={shakeT} />
        ))}
        {/* ギギッの光が床へもれる */}
        {spot > 0 && <polygon points={`${CX - 200},${CY + 280} ${CX + 200},${CY + 280} ${CX + 420},1080 ${CX - 420},1080`} fill={C.goldGlow} opacity={0.12 * spot} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #61 ただ、この決まりには、もうひとつ、やさしい一文があります。
// 格: 並 / seed 6061
// 絵: どこ: Shudouin (dark=0.6, candle=3) の院長の書見台。ろうそく3本が灯った木の台に、厚い羊皮紙の会則の本が開いている。演出: 主役は本。ページにはびっしり黒い字の行 (読めない小さな線) が並び、その中の1行だけが、f で金色にぽうっと光りだす。光った行のまわりに小さな花の飾り模様が咲くように広がる (厳しい決まりの中の、やさしい1行)。本の端に院長の手 (しわのある手が指でその行を押さえる) だけが入る。カメラは本の見開き全体からその1行へゆっくり寄る。動き: f0-30 ページがふわりとめくれて止まる / f30-60 1行が光る / f60-120 寄り・花の模様が広がる・ろうそくの炎が揺れる
// どこ: 修道院 (Shudouin dark=0.6 candle=3) の手前に、院長の書見台。ろうそく3本の木の台に、羊皮紙の会則の本が見開き
// 演出: びっしりの黒い行の中で、右ページの1行だけが金色にぽうっと光り、まわりに小さな花の飾りが咲く。
//       右下から院長のしわのある手 (黒い袖) が入り、人さし指でその行をそっと押さえる
// 動き: f0-14 ページがふわりとめくれて止まる / f12-30 1行が光る / f20-34 手が入る / f24-60 花が咲き広がる /
//       カメラは見開き全体 → その1行へゆっくり寄る (f10-140) / ろうそくの炎がゆれる
const MzCbHand: React.FC<{ x: number; y: number; rot?: number; f: number }> = ({ x, y, rot = 0, f }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {/* 黒い袖 */}
    <path d="M 40 -30 L 420 -90 L 460 120 L 60 60 Z" fill={MP.habit} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 70 -26 L 92 54" stroke={MP.habitMid} strokeWidth={8} />
    {/* 手の甲・指 (人さし指をのばす) */}
    <path d="M 60 -34 Q 10 -46 -30 -26 L -130 -22 Q -150 -14 -130 -4 L -40 0 Q -50 18 -40 34 Q 0 60 60 46 Z" fill={C.skin} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[0, 1, 2].map((k) => <path key={k} d={`M -40 ${8 + k * 12} Q -10 ${14 + k * 12} 30 ${10 + k * 12}`} stroke={INK} strokeWidth={3} fill="none" opacity={0.6} />)}
    {/* しわ・爪 */}
    <path d="M -100 -18 l 6 10 M -84 -18 l 6 10 M 10 -26 q 12 6 24 0 M 0 -14 q 14 6 30 0" stroke={INK} strokeWidth={2.5} opacity={0.55} fill="none" />
    <path d="M -136 -20 q -8 6 0 14" stroke={INK} strokeWidth={3} fill="none" />
    <path d="M -10 30 q 6 -6 14 0 q 6 -6 14 0" stroke={INK} strokeWidth={2} fill="none" opacity={0.4 + 0.1 * Math.sin(f / 8)} />
  </g>
);
const Mz061: React.FC<{ f: number }> = ({ f }) => {
  const flip = easeOut(seg(f, 0, 14));
  const glow = easeOut(seg(f, 12, 30));
  const bloom = seg(f, 24, 70);
  const handIn = easeOut(seg(f, 20, 34));
  const gy = RB_LINE_Y(RB_GLOW_ROW);
  const k = lerp(1.0, 1.3, easeInOut(seg(f, 10, 140)));
  const fx = lerp(960, 1240, easeInOut(seg(f, 10, 140)));
  const fy = lerp(540, gy, easeInOut(seg(f, 10, 140)));
  return (
    <Frame f={f} seed={6061} dark>
      <g transform={`translate(960 540) scale(${k}) translate(${-fx} ${-fy})`}>
        <Shudouin f={f} dark={0.6} candle={3} />
        <rect x={-200} y={-200} width={2400} height={1500} fill={MP.nightDeep} opacity={0.3} />
        <MzCbLectern f={f} />
        <MzCbRuleBook f={f} glow={glow} bloom={bloom} flip={flip} />
        {/* 光のつぶ (行から立ちのぼる) */}
        {glow > 0.3 && Array.from({ length: 7 }, (_, i) => {
          const t = ((f / 50 + i / 7) % 1);
          return <circle key={i} cx={RB_X + 90 + i * 62} cy={gy - 20 - t * 120} r={4 + (i % 3)} fill={C.goldGlow} opacity={(1 - t) * glow} />;
        })}
        {/* 院長の手 */}
        <g transform={`translate(${lerp(420, 0, handIn)} ${lerp(260, 0, handIn)})`}>
          <MzCbHand x={RB_X + RB_PW + 20} y={gy - 10} rot={-12} f={f} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #62 遅れてくる者のために、最初のお祈りの歌は、わざとゆっくり唱えること。
// 格: 山 / seed 6062
// 絵: どこ: Shudouin (dark=0.75, candle=4) の隣の聖堂。石の柱・長い木の聖歌席・譜面台に大きな歌の本。演出: 修道士たちが聖歌席に並び、口を丸く開けて歌っている。口から出る音符が、**カタツムリのようにのろのろと**宙を這う (音符に小さなカタツムリの殻を付ける)。いちばん後ろの席だけ空いていて、そこに「空席」の小さな座布団。院長が手のひらを下にして「ゆっくり、ゆっくり」と指揮する (腕は2本、pose="conduct")。年上の修道士の1人が、歌いながらちらっと入口の扉を見る。カメラは聖歌席を右から左へゆっくりパンして、空席で止まる。動き: 音符がのろのろ流れる / 院長の手が上下 / f90 入口の扉がかすかに動く
// どこ: 修道院 (Shudouin dark=0.75 candle=4) の隣の聖堂。石のアーチと柱の手前に、2段の長い木の聖歌席。
//       左の壁に入口の木の扉、右に一段高い石の内陣と譜面台 (大きな歌の本)
// 演出: 修道士たちが口を丸く開けて歌い、口から出る音符が、背中にカタツムリの殻をしょって、のろのろ宙を這う。
//       後ろの段のいちばん扉ぎわの席だけ空いていて、赤い座布団がぽつん。院長 (内陣の上) が手のひらを下にして
//       「ゆっくり、ゆっくり」と指揮。空席の隣の年上の修道士 (白ひげ) が、歌いながらちらっと入口の扉を見る
// 動き: 音符がのろのろ流れる / 院長の手のひらが上下 (ゆっくり) / カメラは右→左へゆっくりパンして空席で止まる (f0-60) /
//       f90 入口の扉がかすかに開いて光がもれる
const CH_BACK_Y = 720, CH_BACK_S = 0.62, CH_FRONT_Y = 850, CH_FRONT_S = 0.7;
const CH_EMPTY_X = 380;
const CH_BACK_XS = [610, 840, 1070, 1300];
const CH_FRONT_XS = [500, 730, 960, 1190, 1400];
// 音符を背負ったカタツムリ (のろのろ進む。dir=-1 で左へ)
const MzCbSnailNote: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; o?: number }> = ({ x, y, s = 1, f, phase = 0, o = 1 }) => {
  const squish = 1 + Math.sin((f + phase * 9) / 6) * 0.06;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * squish} ${s / squish})`} opacity={o}>
      {/* ぬめりの跡 */}
      <path d="M 30 22 q 40 4 80 0" stroke={KRP.blueSoft} strokeWidth={5} strokeDasharray="4 8" fill="none" strokeLinecap="round" opacity={0.8} />
      {/* カタツムリの体 */}
      <path d="M -40 20 Q -46 6 -30 4 L 30 4 Q 40 14 36 22 Z" fill="#CFE3B0" stroke={INK} strokeWidth={3.5} />
      <path d="M -34 6 L -44 -14 M -26 6 L -30 -16" stroke={INK} strokeWidth={3} />
      <circle cx={-44} cy={-16} r={4} fill={INK} />
      <circle cx={-30} cy={-18} r={4} fill={INK} />
      {/* 殻 */}
      <circle cx={6} cy={-8} r={20} fill={MP.brass} stroke={INK} strokeWidth={3.5} />
      <path d="M 6 -8 m -12 0 a 12 12 0 1 1 12 12 a 7 7 0 1 1 -7 -7" stroke={MP.brassDark} strokeWidth={3} fill="none" />
      {/* 殻に立てた音符 (八分音符) */}
      <ellipse cx={-6} cy={-44} rx={14} ry={10} fill={INK} transform="rotate(-20 -6 -44)" />
      <line x1={6} y1={-48} x2={6} y2={-100} stroke={INK} strokeWidth={5} />
      <path d="M 6 -100 Q 28 -88 24 -66" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};
// 聖堂 (#62・#63 の同じ場所)。層の間に人を差しこむ
const MzCbChapel: React.FC<{
  f: number; door?: number; carving?: boolean;
  backRow?: React.ReactNode; frontRow?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, door = 0, carving, backRow, frontRow, children }) => (
  <g>
    <rect x={-700} y={-300} width={3200} height={1700} fill={MP.stoneDark} />
    <rect x={-700} y={820} width={3200} height={600} fill={mixColor(MP.stoneDark, MP.nightDeep, 0.35)} />
    <Shudouin f={f} dark={0.75} candle={4} />
    {carving && (
      <g transform="translate(700 432)">
        {/* 柱に彫られた、スヌーズボタンそっくりの丸い石の彫り物 */}
        <rect x={-34} y={-20} width={68} height={40} rx={20} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
        <rect x={-26} y={-13} width={52} height={26} rx={13} fill="none" stroke={MP.stoneDark} strokeWidth={3} />
        <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={MP.stoneDark}>zz</text>
      </g>
    )}
    {/* 左の壁と入口の扉 */}
    <rect x={-700} y={330} width={962} height={500} fill={MP.stone} stroke={INK} strokeWidth={5} />
    <rect x={-700} y={-300} width={660} height={640} fill={MP.stone} />
    {Array.from({ length: 8 }, (_, r) => Array.from({ length: 9 }, (_, c) => (
      <rect key={`${r}${c}`} x={-700 + c * 120 - (r % 2) * 60} y={330 + r * 62} width={120} height={62} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.35} />
    )))}
    <rect x={-700} y={330} width={962} height={500} fill={MP.nightDeep} opacity={0.42} />
    <rect x={-700} y={-300} width={660} height={630} fill={MP.nightDeep} opacity={0.42} />
    <path d="M 20 830 L 20 520 A 100 100 0 0 1 220 520 L 220 830 Z" fill={C.shade} stroke={INK} strokeWidth={7} />
    {door > 0 && <path d={`M 20 830 L 20 520 A 100 100 0 0 1 ${20 + 50 * door} 446 L ${20 + 50 * door} 830 Z`} fill={C.goldGlow} opacity={0.55} />}
    {door > 0 && <polygon points={`20,830 ${20 + 50 * door},830 ${160 + 200 * door},1080 0,1080`} fill={C.goldGlow} opacity={0.18} />}
    <g transform={`translate(220 0) scale(${1 - door * 0.22} 1) translate(-220 0)`}>
      <path d="M 20 830 L 20 520 A 100 100 0 0 1 220 520 L 220 830 Z" fill={MP.woodDark} stroke={INK} strokeWidth={6} />
      {[70, 120, 170].map((px) => <line key={px} x1={px} y1={450} x2={px} y2={830} stroke={INK} strokeWidth={3} opacity={0.5} />)}
      {[560, 740].map((py) => <rect key={py} x={20} y={py} width={200} height={16} fill={MP.iron} stroke={INK} strokeWidth={3} />)}
      <circle cx={190} cy={660} r={12} fill={MP.iron} stroke={INK} strokeWidth={3} />
    </g>
    <path d="M 0 830 L 0 512 A 120 120 0 0 1 240 512 L 240 830" fill="none" stroke={MP.stoneLight} strokeWidth={14} />
    {/* 右の内陣 (一段高い石の台) と譜面台 */}
    <rect x={1480} y={700} width={520} height={400} fill={MP.stone} stroke={INK} strokeWidth={6} />
    {[760, 830, 900].map((ly) => <line key={ly} x1={1480} y1={ly} x2={2000} y2={ly} stroke={INK} strokeWidth={3} opacity={0.4} />)}
    <rect x={1480} y={700} width={520} height={400} fill={MP.nightDeep} opacity={0.3} />
    <g>
      <rect x={1818} y={520} width={16} height={180} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      <path d="M 1790 700 L 1826 680 L 1862 700 Z" fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      <path d="M 1726 470 L 1926 470 L 1946 530 L 1706 530 Z" fill={MP.wood} stroke={INK} strokeWidth={5} />
      <path d="M 1730 474 Q 1780 450 1826 470 Q 1872 450 1922 474 L 1930 524 L 1722 524 Z" fill={C.parch} stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((r) => <path key={r} d={`M 1742 ${484 + r * 12} l 30 0 m 10 0 l 30 0 m 30 0 l 30 0 m 10 0 l 30 0`} stroke={INK} strokeWidth={3} />)}
      {[1752, 1800, 1850, 1896].map((nx, i) => <circle key={nx} cx={nx} cy={486 + (i % 2) * 12} r={4} fill={KRP.red} />)}
    </g>
    {/* 聖歌席の背もたれ (彫り物のアーチ) */}
    <rect x={262} y={470} width={1218} height={200} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M ${280 + i * 200} 660 L ${280 + i * 200} 530 Q ${380 + i * 200} 470 ${480 + i * 200} 530 L ${480 + i * 200} 660`} fill={MP.wood} stroke={INK} strokeWidth={4} opacity={0.8} />
    ))}
    <rect x={250} y={456} width={1242} height={22} rx={4} fill={MP.wood} stroke={INK} strokeWidth={5} />
    {backRow}
    {/* 空席の赤い座布団 */}
    <ellipse cx={CH_EMPTY_X} cy={650} rx={70} ry={20} fill={KRP.red} stroke={INK} strokeWidth={4} />
    <path d={`M ${CH_EMPTY_X - 50} 646 q 50 -12 100 0`} stroke={MP.bellDark} strokeWidth={3} fill="none" />
    {/* 後ろの段の前板 */}
    <rect x={262} y={652} width={1218} height={118} fill={MP.wood} stroke={INK} strokeWidth={6} />
    <Grain x={262} y={652} w={1218} h={118} seed={62} />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={290 + i * 172} y={672} width={140} height={78} rx={6} fill="none" stroke={MP.woodDark} strokeWidth={4} />)}
    {frontRow}
    {/* 前の段の前板 */}
    <rect x={262} y={752} width={1218} height={160} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
    <Grain x={262} y={752} w={1218} h={160} seed={63} />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${300 + i * 172} 900 L ${300 + i * 172} 800 Q ${360 + i * 172} 770 ${420 + i * 172} 800 L ${420 + i * 172} 900`} fill="none" stroke={MP.wood} strokeWidth={5} />)}
    <rect x={250} y={740} width={1242} height={20} rx={4} fill={MP.wood} stroke={INK} strokeWidth={5} />
    {/* 聖堂の暗さ */}
    <rect x={-300} y={-200} width={2400} height={1500} fill={MP.nightDeep} opacity={0.16} />
    {children}
  </g>
);
// 木目 (このファイル用)
const Grain: React.FC<{ x: number; y: number; w: number; h: number; seed: number }> = ({ x, y, w, h, seed }) => (
  <g stroke={INK} strokeWidth={2.5} opacity={0.25} fill="none">
    {[0.3, 0.6, 0.85].map((t, i) => (
      <path key={i} d={`M ${x + 10} ${y + h * t} q ${w / 4} ${rnd(seed, i) * 10 - 5} ${w / 2} 0 t ${w / 2 - 20} 0`} />
    ))}
  </g>
);
const Mz062: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 60));
  const k = 1.1;
  const tx = lerp(-88, 92, pan);
  const door = seg(f, 88, 100) * 0.35;
  const palm = Math.sin(f / 14) * 10;
  const sing = (i: number) => 0.85 + 0.2 * Math.sin((f + i * 11) / 9);
  const singers: [number, number, number][] = [
    ...CH_BACK_XS.map((x) => [x, CH_BACK_Y, CH_BACK_S] as [number, number, number]),
    ...CH_FRONT_XS.map((x) => [x, CH_FRONT_Y, CH_FRONT_S] as [number, number, number]),
  ];
  return (
    <Frame f={f} seed={6062} dark>
      <g transform={`translate(960 540) scale(${k}) translate(-960 -540) translate(${tx / k} 0)`}>
        <MzCbChapel f={f} door={door}
          backRow={CH_BACK_XS.map((x, i) => (
            <MzCbMonk key={x} x={x} y={CH_BACK_Y} s={CH_BACK_S} f={f} phase={i + 3} old={i === 0} noSkirt
              gaze={i === 0 ? [-9, 1] : [-2, -3]} face={i === 0 ? "normal" : i === 2 ? "smile" : "normal"} mouth={sing(i)} />
          ))}
          frontRow={CH_FRONT_XS.map((x, i) => (
            <MzCbMonk key={x} x={x} y={CH_FRONT_Y} s={CH_FRONT_S} f={f} phase={i + 7} old={i === 3} noSkirt
              gaze={[-2, -3]} face={i === 1 ? "smile" : "normal"} mouth={sing(i + 4)} />
          ))}>
          {/* のろのろ音符 (口から出て、左へ這う) */}
          {singers.map(([sx, sy, ss], i) => {
            if (i >= 4) return null; // 前の段の音符は出さない (後ろの段の顔を隠さない)
            const per = 170;
            const t = ((f + i * 53 + 60) % per) / per;
            const nx = sx - 60 - t * 200;
            const ny = sy - 300 * ss - 40 - t * 40 + Math.sin(t * 9 + i) * 8;
            const o = Math.min(1, t * 6, (1 - t) * 5);
            return <MzCbSnailNote key={i} x={nx} y={ny} s={1.0} f={f} phase={i} o={o} />;
          })}
          {/* 院長 (内陣の上で、手のひらを下に「ゆっくり」) */}
          <MzCbMonk x={1640} y={720} s={0.85} f={f} old abbot pose="point" pointDir={-1} phase={2} gaze={[-6, 2]} face="smile" bell={[70, -58]} />
          <g transform={`translate(${1640 - 153 * 0.85} ${720 - 148 * 0.85 + palm})`}>
            <ellipse cx={-8} cy={-4} rx={26} ry={11} fill={C.skin} stroke={INK} strokeWidth={4} />
            <path d="M -30 -6 l -10 0 M -30 0 l -12 2 M -28 6 l -10 4" stroke={INK} strokeWidth={3} strokeLinecap="round" />
            {[0, 1].map((k2) => <path key={k2} d={`M ${-30 + k2 * 30} ${24} l 0 20 l -7 -7 m 7 7 l 7 -7`} stroke={MP.glow} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 14 + Math.PI / 2)} />)}
          </g>
        </MzCbChapel>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #63 1500年前の、スヌーズです。
// 格: 山 / seed 6063
// 絵: どこ: #62 の聖堂の続き。入口から聖歌席の空席までの石の床の通路。演出: 笑いどころ。のろのろの歌が流れる中、寝ぐせで頭巾が裏返しの若い修道士が、半分寝たまま、はだしで石の床を**ずるずると滑って**入ってくる (よだれ・片目つぶり。腕は2本、両腕を前に泳がせる pose)。歌の最後の音符がちょうど空席に降りるのと同時に、若者がすぽっと空席に滑り込んで座り、何事もなかった顔で口だけ歌いはじめる。隣の年上修道士が横目で見て、眉を上げる。画面の隅に、現代のスマホのスヌーズボタンの形をした小さな石の彫り物が壁にある (ちょっとした遊び)。カメラは若者を追って横に流れる。動き: f0-60 滑り込む / f60 着席 / f70-110 すまし顔・隣の眉
// どこ: #62 の聖堂の続き (同じ MzCbChapel)。入口の扉から、後ろの段の空席までの石の床
// 演出: 笑いどころ。のろのろの歌が流れる中、頭巾が裏返しでとんがり・寝ぐせの若い修道士が、片目つぶり・よだれで、
//       はだしのまま石の床をずるずる滑って入ってくる (両腕を前に出して夢うつつ)。歌の最後の音符 (カタツムリ) が
//       空席の座布団に降りるのと同時に、若者がすぽっと空席に飛び乗り、すまし顔で口だけ歌う。隣の年上 (白ひげ) が
//       横目で見て、片方の眉を上げる。柱にはスヌーズボタンそっくりの石の彫り物
// 動き: f0-30 扉から滑り込む (カメラが横に追う) / f30-38 すぽっと着席・最後の音符が降りる / f38- すまし顔・隣の眉 /
//       ほこりの粒・音符はのろのろ
const Mz063: React.FC<{ f: number }> = ({ f }) => {
  const slide = easeOut(seg(f, 0, 30));
  const hop = seg(f, 30, 38);
  const seated = f >= 38;
  // 若者の位置: 扉 (x=60) → 席の前 (x=260, 床 y=870) → ぴょんと空席 (x=380, y=720)
  const mx = f < 30 ? lerp(-80, 262, slide) : lerp(262, CH_EMPTY_X, hop);
  const my = f < 30 ? 870 : lerp(870, CH_BACK_Y, hop) - Math.sin(hop * Math.PI) * 120;
  const ms = f < 30 ? 0.72 : lerp(0.72, CH_BACK_S, hop);
  const k = 1.42;
  const fx = lerp(300, 540, easeInOut(seg(f, 0, 38)));
  const fy = 600;
  const brow = seg(f, 37, 42);
  const wob = Math.sin(f / 3) * 4 * (1 - seg(f, 28, 32));
  // 最後の音符 (空席へ降りる)
  const lastT = seg(f, 6, 36);
  const lnx = lerp(700, CH_EMPTY_X + 10, easeInOut(lastT));
  const lny = lerp(430, 620, easeInOut(lastT)) - Math.sin(lastT * Math.PI) * 40;
  return (
    <Frame f={f} seed={6063} dark>
      <g transform={`translate(960 540) scale(${k}) translate(${-fx} ${-fy})`}>
        <MzCbChapel f={f} door={lerp(0.9, 0.2, seg(f, 20, 40))} carving
          backRow={
            <g>
              <MzCbMonk x={CH_BACK_XS[0]} y={CH_BACK_Y} s={CH_BACK_S} f={f} phase={3} old noSkirt
                gaze={seated ? [-10, 0] : [-9, 1]} mouth={0.9 + 0.15 * Math.sin(f / 9)} />
              {/* 眉を上げる (年上の左眉だけを高く) */}
              {brow > 0 && (
                <g transform={`translate(${CH_BACK_XS[0]} ${CH_BACK_Y + Math.sin((f + 51) / 13) * 3}) scale(${CH_BACK_S})`}>
                  <line x1={-36} y1={-249} x2={-12} y2={-249} stroke={KRP.white} strokeWidth={9} />
                  <path d={`M -38 ${-258 - 12 * brow} Q -24 ${-272 - 14 * brow} -10 ${-260 - 10 * brow}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
                </g>
              )}
              {CH_BACK_XS.slice(1).map((x, i) => (
                <MzCbMonk key={x} x={x} y={CH_BACK_Y} s={CH_BACK_S} f={f} phase={i + 4} noSkirt gaze={[-2, -3]} mouth={0.85 + 0.2 * Math.sin((f + i * 11) / 9)} />
              ))}
              {/* 着席した若者 (後ろの段。前板に下半身が隠れる) */}
              {f >= 30 && (
                <g>
                  <MzCbMonk x={mx} y={my} s={ms} f={f} bedhead noBrow={seated} phase={9} gaze={seated ? [4, -3] : [6, 0]} lean={seated ? 0 : 8}
                    pose={seated ? "stand" : "hold"} face="normal" mouth={seated ? 0.8 + 0.25 * Math.sin(f / 7) : 0} />
                  {seated && (
                    <g transform={`translate(${mx} ${my + Math.sin((f + 9 * 17) / 13) * 3}) scale(${ms})`}>
                      {/* すまし顔: 目を細く (とじ気味) */}
                      <rect x={-40} y={-256} width={80} height={32} fill={KRP.white} />
                      <path d="M -36 -224 L -12 -224 M 12 -224 L 36 -224" stroke={INK} strokeWidth={5} strokeLinecap="round" />
                      <path d="M -38 -246 L -10 -243 M 10 -243 L 38 -246" stroke={INK} strokeWidth={8} strokeLinecap="round" />
                    </g>
                  )}
                </g>
              )}
            </g>
          }
          frontRow={CH_FRONT_XS.map((x, i) => (
            <MzCbMonk key={x} x={x} y={CH_FRONT_Y} s={CH_FRONT_S} f={f} phase={i + 7} old={i === 3} noSkirt
              gaze={[-2, -3]} mouth={0.85 + 0.2 * Math.sin((f + i * 13) / 9)} />
          ))}>
          {/* 他の音符 (のろのろ) */}
          {CH_BACK_XS.slice(1).map((sx, i) => {
            const t = ((f + i * 41) % 150) / 150;
            return <MzCbSnailNote key={i} x={sx - 50 - t * 220} y={CH_BACK_Y - 180 - t * 60} s={0.55} f={f} phase={i} o={Math.min(1, t * 6, (1 - t) * 5)} />;
          })}
          {/* 最後の音符 → 座布団へ */}
          {f < 44 && <MzCbSnailNote x={lnx} y={lny} s={0.6} f={f} phase={5} o={1 - seg(f, 38, 44)} />}
          {f >= 34 && f < 60 && (
            <g opacity={1 - seg(f, 40, 60)}>
              {[0, 1, 2, 3, 4].map((i) => {
                const a = (-150 + i * 30) * Math.PI / 180;
                const t = seg(f, 34, 48);
                return <line key={i} x1={CH_EMPTY_X + Math.cos(a) * (60 + t * 30)} y1={600 + Math.sin(a) * (60 + t * 30)} x2={CH_EMPTY_X + Math.cos(a) * (90 + t * 40)} y2={600 + Math.sin(a) * (90 + t * 40)} stroke={C.goldGlow} strokeWidth={6} strokeLinecap="round" />;
              })}
            </g>
          )}
          {/* 滑り込みの跡 (着席後もしばらく残る): 床のすべり跡 + ぴょんの点線の弧 */}
          {f >= 30 && f < 90 && (
            <g opacity={1 - seg(f, 60, 90)}>
              <path d="M -100 878 L 222 878" stroke={MP.stoneLight} strokeWidth={10} strokeLinecap="round" opacity={0.5} strokeDasharray="30 16" />
              <path d={`M 262 860 Q 300 ${620} ${CH_EMPTY_X} 690`} stroke={KRP.white} strokeWidth={6} fill="none" strokeDasharray="12 12" opacity={0.8} />
              {[0, 1, 2].map((i) => <circle key={i} cx={240 + i * 26} cy={870 - (i % 2) * 8} r={10 + i * 4} fill={MP.mist} opacity={0.5} />)}
            </g>
          )}
          {/* 床を滑る若者 (前板より手前の通路) */}
          {f < 30 && (
            <g>
              {/* 滑った跡 */}
              <path d={`M -100 878 L ${mx - 40} 878`} stroke={MP.stoneLight} strokeWidth={10} strokeLinecap="round" opacity={0.5} strokeDasharray="30 16" />
              <g transform={`translate(0 ${wob})`}>
                <MzCbMonk x={mx} y={my} s={ms} f={f} bedhead phase={9} gaze={[6, 0]} lean={10} pose="hold" face="normal" />
                <g transform={`translate(${mx} ${my + Math.sin((f + 9 * 17) / 13) * 3}) scale(${ms}) rotate(10)`}>
                  {/* 片目つぶり (左目) */}
                  <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
                  <path d="M -38 -220 Q -24 -212 -10 -220" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
                  {/* ぽかんと開いた口とよだれ */}
                  <ellipse cx={4} cy={-186} rx={10} ry={8} fill={INK} />
                  <path d={`M 12 -182 q 4 ${14 + Math.sin(f / 4) * 4} -2 ${22 + Math.sin(f / 4) * 5}`} stroke={C.drool} strokeWidth={6} fill="none" strokeLinecap="round" />
                  {/* はだしの足 (修道服の裾から) */}
                  <ellipse cx={-20} cy={-2} rx={22} ry={9} fill={C.skin} stroke={INK} strokeWidth={3.5} />
                  <ellipse cx={22} cy={-2} rx={22} ry={9} fill={C.skin} stroke={INK} strokeWidth={3.5} />
                </g>
                {/* Zzz */}
                {[0, 1, 2].map((i) => (
                  <text key={i} x={mx + 40 + i * 26} y={my - 230 - i * 30 + Math.sin(f / 6 + i) * 6} fontFamily={FONT} fontWeight={900} fontSize={30 - i * 4} fill={KRP.blueSoft} stroke={INK} strokeWidth={2} paintOrder="stroke">z</text>
                ))}
              </g>
            </g>
          )}
        </MzCbChapel>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #64 この一文、最後にもう一度、出てきます。
// 格: 並 / seed 6064
// 絵: どこ: #61 と同じ院長の書見台 (Shudouin dark=0.6, candle=3)。光る1行のある会則の本。演出: 主役は光る1行。院長の手が、赤いリボンのしおりをその行にそっと挟む。しおりの先がページの外へ伸び、画面の右へ赤い糸になってするする伸びていき、その先に小さく、現代の寝室の窓とスヌーズボタンの付いたベル式目覚まし (BellClock snooze, s=0.3、遠くにうっすら) が見える (7章へつながる伏線)。本がぱたんと閉じ、しおりのリボンだけが外に垂れる。カメラは本からリボンを追って右へパン。動き: f0-30 しおりを挟む / f30-90 糸が右へ伸びる / f90 本が閉じる
// どこ: #61 と同じ院長の書見台 (Shudouin dark=0.6 candle=3)。光る1行のある会則の本
// 演出: 院長の手が赤いリボンのしおりを光る1行にそっと挟む。リボンの先がページの外へ出て、赤い糸になって右へ
//       するする伸び、その先に遠く小さく、現代の寝室の窓とスヌーズ付きのベル式目覚まし (BellClock snooze) がうっすら
//       見える (7章への伏線)。最後に本がぱたんと閉じ、リボンだけが外に垂れる
// 動き: f0-16 しおりを挟む / f16-30 手が引っこむ / f14-42 糸が右へ伸びる・カメラが糸を追って右へパン / f88-100 本が閉じる
const Mz064: React.FC<{ f: number }> = ({ f }) => {
  const place = easeOut(seg(f, 0, 16));
  const handOut = easeInOut(seg(f, 16, 30));
  const thread = easeInOut(seg(f, 14, 40));
  const pan = easeInOut(seg(f, 12, 40));
  const close = easeInOut(seg(f, 88, 100));
  const target = seg(f, 28, 42);
  const gy = RB_LINE_Y(RB_GLOW_ROW);
  const top = RB_Y - RB_PH / 2;
  const tx = lerp(0, -560, pan);
  const k = lerp(1.08, 0.94, pan);
  // リボン: のどの上端 → 光る行の右端 → ページの外
  const rx1 = RB_X + RB_PW - 70, ry1 = gy + 6;
  const ribbonOnPage = `M ${RB_X + 6} ${top + 16} Q ${RB_X + 200} ${lerp(top + 10, gy - 120, place)} ${rx1} ${ry1}`;
  const threadPath = `M ${RB_X + RB_PW} ${gy + 14} C ${RB_X + RB_PW + 260} ${gy + 140} ${RB_X + RB_PW + 520} ${gy - 160} ${2240} ${470}`;
  const L = 1000;
  return (
    <Frame f={f} seed={6064} dark>
      <g transform={`translate(960 540) scale(${k}) translate(${-960 + tx / k} -540)`}>
        <Shudouin f={f} dark={0.6} candle={3} />
        {/* Shudouin の右の外 (パンで見える所): 石壁の続きを暗く */}
        <rect x={1960} y={-200} width={1400} height={1500} fill={MP.nightDeep} />
        {Array.from({ length: 12 }, (_, r) => Array.from({ length: 10 }, (_, c) => (
          <rect key={`${r}${c}`} x={1960 + c * 140 - (r % 2) * 70} y={-120 + r * 100} width={138} height={98} fill={MP.stoneDark} opacity={0.18} stroke={INK} strokeWidth={2} />
        )))}
        {Array.from({ length: 10 }, (_, i) => <rect key={`fd${i}`} x={1560 + i * 40} y={-200} width={41} height={1500} fill={MP.nightDeep} opacity={(i + 1) / 10} />)}
        <rect x={-200} y={-200} width={3600} height={1500} fill={MP.nightDeep} opacity={0.3} />
        {/* 遠くの現代の寝室の窓 (うっすら、夢のように) */}
        <g opacity={0.25 + 0.6 * target} transform={`translate(2240 470) scale(${0.85 + 0.15 * target}) translate(-2240 -470)`}>
          <circle cx={2300} cy={470} r={300} fill={MP.you} opacity={0.18} />
          <rect x={2100} y={260} width={300} height={260} rx={8} fill={MP.night} stroke={INK} strokeWidth={6} />
          <path d="M 2250 260 L 2250 520 M 2100 390 L 2400 390" stroke={KRP.white} strokeWidth={8} />
          <circle cx={2340} cy={320} r={22} fill="#FFF3C4" />
          <circle cx={2352} cy={312} r={20} fill={MP.night} />
          <path d="M 2090 250 Q 2130 390 2096 530 L 2070 530 L 2070 250 Z M 2410 250 Q 2370 390 2404 530 L 2430 530 L 2430 250 Z" fill={MP.you} stroke={INK} strokeWidth={4} />
          <rect x={2060} y={240} width={380} height={16} rx={6} fill={MP.wood} stroke={INK} strokeWidth={4} />
          {/* 窓の下のナイトテーブルと、スヌーズ付きのベル式目覚まし */}
          <rect x={2150} y={600} width={220} height={20} fill={MP.wood} stroke={INK} strokeWidth={4} />
          <rect x={2166} y={620} width={188} height={110} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          <BellClock x={2260} y={600} s={0.3} f={f} ring={0} snooze />
        </g>
        <MzCbLectern f={f} />
        <MzCbRuleBook f={f} glow={1} bloom={1} close={close} />
        {/* リボンのしおり (本の上) */}
        {close < 0.5 ? (
          <g>
            <path d={ribbonOnPage} stroke={KRP.red} strokeWidth={20} fill="none" strokeLinecap="round" opacity={place > 0 ? 1 : 0} />
            <path d={ribbonOnPage} stroke={MP.bellDark} strokeWidth={4} fill="none" opacity={place > 0 ? 0.6 : 0} strokeDasharray="4 18" />
            {place > 0.95 && <path d={`M ${rx1} ${ry1} L ${RB_X + RB_PW} ${gy + 14}`} stroke={KRP.red} strokeWidth={16} strokeLinecap="round" />}
          </g>
        ) : (
          <path d={`M ${RB_X - 40} ${RB_Y + RB_PH / 2 + 26} q 10 60 -6 120 l 22 -8 l 6 22`} stroke={KRP.red} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* 赤い糸 (ページの外へ、右へ伸びる) */}
        {thread > 0 && (
          <g>
            <path d={threadPath} stroke={KRP.red} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${L * thread} ${L}`} opacity={close > 0.5 ? 1 - seg(f, 100, 112) : 1} />
            <path d={threadPath} stroke={C.goldGlow} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={`${L * thread} ${L}`} opacity={0.25} />
          </g>
        )}
        {/* 院長の手 (リボンの端をそっと押さえて、引っこむ) */}
        {handOut < 1 && (
          <g transform={`translate(${lerp(0, 380, handOut)} ${lerp(0, 300, handOut)})`}>
            <MzCbHand x={rx1 + 150} y={ry1 - 16} rot={-12} f={f} />
          </g>
        )}
        {/* ぱたんの風 */}
        {f > 98 && f < 112 && [0, 1, 2].map((i) => (
          <path key={i} d={`M ${RB_X - RB_PW - 60} ${RB_Y - 100 + i * 100} l -70 ${i * 20 - 20}`} stroke={MP.mist} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 98, 112)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #65 日本にも、起こす係がいました。鐘です。
// 格: 山 / seed 6065
// 絵: どこ: 江戸の町の夜明け前。TokiNoKane (swing=0→1, sky=0.2)。木の鐘楼と瓦屋根、手前に長屋の屋根が並ぶ。演出: 半纏の鐘撞き (男性) が撞木の綱を両手で引いて (腕は2本、pose="pull")、ゴーンと撞く。鐘から波紋のような音の輪が町へ広がり、輪が届いた長屋の屋根の下から、ちょんまげの男がむくっと起き上がり、隣の家では日本髪の女性が布団から身を起こす (それぞれ窓や戸のすきまから顔をのぞかせる)。カメラは鐘楼の釣り鐘への寄りから、音の輪を追って町並みへ引く。動き: f0-20 撞木を引く / f20 ゴーン (鐘が少し揺れる) / f25-110 輪が広がる・家々で順に人が起きる
// どこ: 江戸の町の夜明け前 (TokiNoKane sky=0.2)。木の鐘楼と瓦屋根。手前の左右に長屋 (窓のある板壁と瓦屋根)
// 演出: 半纏の鐘撞き (男性・はちまき) が撞木の綱を両手で引いて、ゴーンと撞く。鐘から金色の音の輪が町へ広がり、
//       輪が届いた左の長屋の窓から、寝巻きのちょんまげの男がむくっと顔を出し、右の長屋では日本髪の女性が
//       布団から身を起こして、戸のすきまから外をのぞく
// 動き: f0-14 撞木を引いて当てる (14で鳴る) / f14- 音の輪が広がる (くり返し) / f20-32 左の男が起きる /
//       f28-40 右の女性が起きる / カメラは釣り鐘の寄り (1.65) → 町並みへ引く (f0-32)
const MzCbNagaya: React.FC<{ x: number; w: number; f: number; sky: number; win: [number, number, number, number]; children?: React.ReactNode; door?: boolean }> = ({
  x, w, f, sky, win, children, door }) => {
  const clip = useId("mzNgy");
  const roofC = mixColor("#3E4860", "#6E7B94", sky / 2);
  const wall = mixColor("#5C4632", "#9A7A58", sky / 2);
  const [wx, wy, ww, wh] = win;
  return (
    <g>
      {/* 板壁 */}
      <rect x={x} y={600} width={w} height={300} fill={wall} stroke={INK} strokeWidth={6} />
      {Array.from({ length: Math.floor(w / 46) }, (_, i) => <line key={i} x1={x + 23 + i * 46} y1={604} x2={x + 23 + i * 46} y2={896} stroke={INK} strokeWidth={2.5} opacity={0.35} />)}
      <rect x={x} y={600} width={w} height={300} fill={MP.nightDeep} opacity={0.35 * (1 - sky / 2)} />
      {/* 窓の中 (人が入る) */}
      <defs><clipPath id={clip}><rect x={wx} y={wy} width={ww} height={wh} /></clipPath></defs>
      <rect x={wx} y={wy} width={ww} height={wh} fill="#2E2836" />
      <g clipPath={`url(#${clip})`}>
        <rect x={wx} y={wy + wh - 40} width={ww} height={40} fill={mixColor("#D8C8A8", "#8A7A62", 0.5)} />
        {children}
        {/* 布団の端 */}
        <path d={`M ${wx} ${wy + wh - 26} Q ${wx + ww / 2} ${wy + wh - 54} ${wx + ww} ${wy + wh - 30} L ${wx + ww} ${wy + wh} L ${wx} ${wy + wh} Z`} fill="#C96B5A" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={wx + 30 + i * (ww / 5)} cy={wy + wh - 16} r={6} fill="#F2D6A2" opacity={0.8} />)}
      </g>
      {/* 窓わくと、半分開けた障子 */}
      <rect x={wx} y={wy} width={ww} height={wh} fill="none" stroke={INK} strokeWidth={6} />
      <g>
        <rect x={door ? wx - ww * 0.42 : wx + ww * 0.62} y={wy} width={ww * 0.5} height={wh} fill="#F1E6C8" stroke={INK} strokeWidth={4} />
        {[1, 2].map((k) => <line key={k} x1={(door ? wx - ww * 0.42 : wx + ww * 0.62) + (ww * 0.5 * k) / 3} y1={wy} x2={(door ? wx - ww * 0.42 : wx + ww * 0.62) + (ww * 0.5 * k) / 3} y2={wy + wh} stroke={INK} strokeWidth={2.5} />)}
        {[1, 2, 3].map((k) => <line key={`h${k}`} x1={door ? wx - ww * 0.42 : wx + ww * 0.62} y1={wy + (wh * k) / 4} x2={(door ? wx - ww * 0.42 : wx + ww * 0.62) + ww * 0.5} y2={wy + (wh * k) / 4} stroke={INK} strokeWidth={2.5} />)}
      </g>
      <rect x={wx - 14} y={wy + wh} width={ww + 28} height={14} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      {/* ひさしと瓦屋根 */}
      <path d={`M ${x - 40} 610 L ${x + 20} 520 L ${x + w - 20} 520 L ${x + w + 40} 610 Z`} fill={roofC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: Math.floor((w + 60) / 22) }, (_, k) => <line key={k} x1={x - 10 + k * 22} y1={526} x2={x - 26 + k * 22} y2={606} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
      <rect x={x + 10} y={508} width={w - 20} height={16} rx={6} fill={mixColor(roofC, INK, 0.3)} stroke={INK} strokeWidth={4} />
      {/* 戸口の天水桶 (小物) */}
      <rect x={x + w - 110} y={810} width={70} height={70} rx={6} fill={MP.wood} stroke={INK} strokeWidth={4} />
      <path d={`M ${x + w - 110} 832 L ${x + w - 40} 832 M ${x + w - 110} 858 L ${x + w - 40} 858`} stroke={INK} strokeWidth={3} />
      {void f}
    </g>
  );
};
const Mz065: React.FC<{ f: number }> = ({ f }) => {
  const swing = easeInOut(seg(f, 2, 14));
  const k = lerp(1.65, 1.0, easeInOut(seg(f, 4, 32)));
  const cy = lerp(560, 540, seg(f, 4, 32));
  const manUp = easeOut(seg(f, 20, 32));
  const womanUp = easeOut(seg(f, 28, 40));
  const pullLean = f < 14 ? -6 * Math.sin(seg(f, 2, 14) * Math.PI) : 0;
  return (
    <Frame f={f} seed={6065} dark>
      <g transform={`translate(960 ${cy}) scale(${k}) translate(-960 ${-cy})`}>
        <TokiNoKane f={f} swing={swing} sky={0.2} />
        {/* 音の輪 (町へ広がる) */}
        {f >= 14 && [0, 1, 2].map((i) => {
          const t = (((f - 14) / 46 + i / 3) % 1);
          if (f - 14 < i * 15) return null;
          return <circle key={i} cx={960} cy={560} r={120 + t * 1100} fill="none" stroke={C.goldGlow} strokeWidth={10 * (1 - t) + 2} opacity={(1 - t) * 0.7} strokeDasharray="40 18" />;
        })}
        {/* 左の長屋: ちょんまげの男 */}
        <MzCbNagaya x={-60} w={560} f={f} sky={0.2} win={[140, 606, 260, 196]}>
          <g transform={`translate(0 ${lerp(150, 0, manUp)})`}>
            <MzCbEdoMan x={270} y={900} s={0.8} f={f} face={manUp > 0.6 ? "surprised" : "normal"} cloth="#6F7F99" clothDark="#55637B" gaze={[6, -3]} phase={1} />
          </g>
          {manUp > 0.6 && <path d="M 340 650 l 14 -16 M 356 666 l 20 -6 M 330 640 l 4 -20" stroke={MP.glow} strokeWidth={5} strokeLinecap="round" />}
        </MzCbNagaya>
        {/* 右の長屋: 日本髪の女性 */}
        <MzCbNagaya x={1480} w={520} f={f} sky={0.2} win={[1620, 606, 240, 196]} door>
          <g transform={`translate(0 ${lerp(150, 0, womanUp)})`}>
            <MzCbEdoWoman x={1720} y={900} s={0.8} f={f} face={womanUp > 0.6 ? "surprised" : "normal"} cloth={C.kimonoPink} clothDark={C.kimonoRed} gaze={[-6, -3]} phase={2} noLegs />
          </g>
          {womanUp > 0.6 && <path d="M 1650 650 l -14 -16 M 1636 668 l -20 -6 M 1662 640 l -4 -20" stroke={MP.glow} strokeWidth={5} strokeLinecap="round" />}
        </MzCbNagaya>
        {/* 鐘撞き (綱の端を両手で引く) */}
        <g transform={`rotate(${pullLean} ${TOKI_ROPE[0] + 64} 896)`}>
          <MzCbEdoMan x={TOKI_ROPE[0] + 64} y={790 + 118 * 0.9} s={0.9} f={f} pose="hold" hanten hachimaki cloth={C.hanten} clothDark={C.hantenDark}
            face={f >= 14 && f < 80 ? "joy" : "normal"} gaze={[-6, -4]} phase={3} />
          {/* 綱の端を握る (左手から両手へ) */}
          <path d={`M ${TOKI_ROPE[0]} ${TOKI_ROPE[1]} Q ${TOKI_ROPE[0] + 30} ${TOKI_ROPE[1] + 8} ${TOKI_ROPE[0] + 64 + 14} ${TOKI_ROPE[1] + 2}`} stroke={C.rope} strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={TOKI_ROPE[0] + 64 - 13} cy={TOKI_ROPE[1] + 3} r={8} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #66 1626年、江戸の町に、最初の時の鐘ができた、とされています。
// 格: 並 / seed 6066
// 絵: どこ: 1626年の江戸の町。TokiNoKane (swing=0, sky=1) の鐘楼が、まだ新しい白木の色で立っている。下では大工たちが最後の仕上げ。演出: 主役は新しい鐘楼。綱で吊り上げられた釣り鐘が、鐘楼にゆっくりと収まる。大工 (男性・ねじりはちまき) が下から「よし」と手を上げ、通りがかりの町人の男女 (男: 藍の着物と前かけ・ちょんまげ / 女: 着物に帯・日本髪) が見上げる。年代札「1626年」を左上に、札の横に小さな「?」の点線の丸 (とされている話)。カメラは鐘に寄って、収まると同時に少し引く。動き: f0-60 鐘が吊り上がって収まる / f60 大工が手を上げる / 町人が見上げて指さす
// どこ: 1626年の江戸の町 (TokiNoKane swing=0 sky=1)。鐘楼はまだ新しい白木の色で、まわりに竹の足場
// 演出: 綱と滑車で吊り上げられた釣り鐘が、鐘楼にゆっくり収まる。綱を引く大工 (はちまき)、下から「よし」と
//       手を上げる大工。通りがかりの町人の男 (藍の着物・前かけ・ちょんまげ) が指さし、女 (赤い着物・日本髪) が見上げる。
//       左上に年代札「1626年」と、「とされている話」の点線の「?」
// 動き: f0-34 鐘が吊り上がって収まる (少しゆれる) / f34 大工が手を上げる・木くずがぱっ / 町人が見上げて指さす /
//       カメラは鐘の寄り (1.4) → 収まると少し引く (f0-44)
const BELL_D = "M 882 470 Q 880 444 960 442 Q 1040 444 1038 470 L 1044 630 Q 1048 652 1056 660 L 864 660 Q 872 652 876 630 Z M 920 446 Q 920 430 960 428 Q 1000 430 1000 446 Z";
const Mz066: React.FC<{ f: number }> = ({ f }) => {
  const mask = useId("mz66m");
  const clip = useId("mz66c");
  const lift = easeOut(seg(f, 0, 34));
  const dy = lerp(230, 0, lift);
  const sway = Math.sin(f / 5) * 3 * (1 - seg(f, 30, 50));
  const done = seg(f, 34, 40);
  const k = lerp(1.4, 1.04, easeInOut(seg(f, 0, 44)));
  const cy = lerp(500, 540, seg(f, 0, 44));
  const pull = Math.sin(f / 4) * 6 * (1 - lift);
  return (
    <Frame f={f} seed={6066}>
      <g transform={`translate(960 ${cy}) scale(${k}) translate(-960 ${-cy})`}>
        {/* 鐘のぬけた所に見える空と筋かい */}
        <MzCbSky sky={1} x0={-40} x1={1960} />
        <path d="M 808 680 L 1112 416 M 1112 680 L 808 416" stroke={MP.woodDark} strokeWidth={6} opacity={0.35} />
        <defs>
          <mask id={mask} maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1300}>
            <rect x={-100} y={-100} width={2200} height={1300} fill="white" />
            <path d={BELL_D} fill="black" stroke="black" strokeWidth={8} />
          </mask>
          <clipPath id={clip}><path d={BELL_D} /></clipPath>
        </defs>
        <g mask={`url(#${mask})`}>
          <TokiNoKane f={f} swing={0} sky={1} />
        </g>
        {/* 新しい白木の色 (柱と貫) */}
        <g fill="#FBF1DA" opacity={0.45}>
          <rect x={776} y={360} width={32} height={404} />
          <rect x={1112} y={360} width={32} height={404} />
          <rect x={770} y={392} width={380} height={24} />
          <rect x={756} y={740} width={408} height={26} />
        </g>
        {/* 竹の足場 */}
        <g>
          {[700, 1220].map((px) => <rect key={px} x={px - 7} y={300} width={14} height={600} fill={C.bamboo} stroke={INK} strokeWidth={3.5} />)}
          {[420, 560, 700].map((py) => <rect key={py} x={690} y={py} width={540} height={12} fill={C.bamboo} stroke={INK} strokeWidth={3} opacity={0.9} />)}
          {[[700, 426], [1220, 426], [700, 566], [1220, 566], [700, 706], [1220, 706]].map(([qx, qy], i) => <path key={i} d={`M ${qx - 10} ${qy - 6} l 20 18 M ${qx + 10} ${qy - 6} l -20 18`} stroke={C.rope} strokeWidth={4} />)}
        </g>
        {/* 滑車と吊り綱 */}
        <circle cx={960} cy={396} r={20} fill={MP.iron} stroke={INK} strokeWidth={4} transform={`rotate(${f * 6} 960 396)`} />
        <line x1={948} y1={396} x2={972} y2={396} stroke={MP.ironLight} strokeWidth={4} transform={`rotate(${f * 6 * (1 - lift)} 960 396)`} />
        <path d={`M 960 ${416} L ${960 + sway} ${428 + dy}`} stroke={C.rope} strokeWidth={7} />
        <path d={`M 978 400 Q 1200 560 1384 ${800 + pull}`} stroke={C.rope} strokeWidth={7} fill="none" />
        {/* 吊り上がる釣り鐘 (TokiNoKane の鐘そのもの) */}
        <g transform={`translate(${sway} ${dy}) rotate(${sway * 0.6} 960 440)`}>
          <g clipPath={`url(#${clip})`}><TokiNoKane f={f} swing={0} sky={1} /></g>
          <path d={BELL_D} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
        {done > 0 && done < 1 && [0, 1, 2, 3, 4, 5].map((i) => {
          const a = (-160 + i * 28) * Math.PI / 180;
          return <rect key={i} x={960 + Math.cos(a) * (120 + done * 80)} y={560 + Math.sin(a) * (120 + done * 80)} width={14} height={6} fill={MP.woodLight} stroke={INK} strokeWidth={2} transform={`rotate(${i * 40} ${960 + Math.cos(a) * 150} ${560 + Math.sin(a) * 150})`} opacity={1 - done} />;
        })}
        {/* 綱を引く大工 */}
        <MzCbEdoMan x={1384} y={800 + pull + 102} s={0.86} f={f} pose="hold" hachimaki hanten cloth={C.hanten} clothDark={C.hantenDark}
          face={lift < 0.95 ? "worried" : "joy"} gaze={[-6, -6]} lean={lift < 0.95 ? -6 : 0} phase={1} />
        {/* 「よし」と手を上げる大工 */}
        <MzCbEdoMan x={600} y={910} s={0.86} f={f} pose={f >= 34 ? "raise" : "point"} pointDir={1} hachimaki hanten cloth={C.hanten} clothDark={C.hantenDark}
          face={f >= 34 ? "joy" : "normal"} gaze={[6, -6]} phase={2} />
        {/* 通りがかりの町人の男女 */}
        <MzCbEdoWoman x={190} y={930} s={0.78} f={f} pose="stand" face="smile" gaze={[6, -8]} phase={5} />
        <MzCbEdoMan x={370} y={930} s={0.8} f={f} pose="point" pointDir={1} apron face="surprised" gaze={[7, -7]} phase={4} />
      </g>
      {/* 年代札 (カメラの外: 端で切れない) */}
      <TagPlate x={240} y={210} text="1626年" size={52} t={seg(f, 4, 16)} />
      <g opacity={seg(f, 10, 20)}>
        <circle cx={448} cy={210} r={40} fill={KRP.white} fillOpacity={0.6} stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
        <text x={448} y={228} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={KRP.red}>?</text>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #67 鐘の代金は、町の人たちが、家の間口1間につき4文ずつ、払っていたとされます。
// 格: 山 / seed 6067
// 絵: どこ: 江戸の町の通り。TokiNoKane (swing=0, sky=2) の鐘楼が奥に見える。手前に、間口の幅がちがう店が3軒並ぶ (狭い長屋の店・中くらいの店・広い店)。演出: 集金係 (藍の着物・帳面と巾着を持つ男性。腕は2本、pose で左手に帳面、右手に巾着) が、店の前の道に物差しを当てて間口を測る。測るたびに地面に「1間」の目盛りがぽんぽんと出て、目盛り1つごとに店の人が銭 (穴あきの丸い銭) を4枚ずつ巾着に入れる。店の人は男女を混ぜる (狭い店は日本髪の女性、中の店はちょんまげの男性)。札は「1間=4文」と「?」の点線。カメラは集金係を追って左から右へパン。動き: f0-40 狭い店 / f40-80 中の店 / f80-120 広い店の前で物差しが長く伸びる
// どこ: 江戸の町の通り (TokiNoKane sky=2 の鐘楼が奥に。少しずつ遅れて動く遠景)。手前に間口のちがう店が3軒
//       (1間の狭い長屋の店=くし屋 / 2間の店=米屋 / 4間の広い店=呉服屋。看板は字なしの絵)
// 演出: 集金係 (藍の着物・左手に帳面・右手に巾着) が、店の前に物差しを当てて間口を測る。1間ぶん伸びるたびに
//       「1間」の札がぽんと出て、店の人が穴あきの銭を4枚ずつ巾着へ投げ入れる。狭い店は日本髪の女性、中の店は
//       ちょんまげの男性、広い店は番頭。上に「1間=4文」と点線の「?」 (とされている話)
// 動き: f0-12 狭い店 (1間→4枚) / f12-34 中の店 (2間→4枚×2) / f34- 広い店で物差しが長く伸びる /
//       カメラは集金係を追って左→右へパン
const KEN = 250; // 1間の幅 (画面上)
const MzCbShop: React.FC<{ x: number; w: number; f: number; noren: string; sign: "comb" | "rice" | "cloth"; big?: boolean }> = ({ x, w, f, noren, sign, big }) => {
  const roofY = big ? 360 : 440;
  return (
    <g>
      {/* 2階の白壁 */}
      <rect x={x} y={roofY + 40} width={w} height={600 - roofY} fill={C.kura} stroke={INK} strokeWidth={6} />
      {big && Array.from({ length: Math.floor(w / 200) }, (_, i) => (
        <g key={i}>
          <rect x={x + 60 + i * 200} y={roofY + 80} width={110} height={70} fill="#5E4E3E" stroke={INK} strokeWidth={4} />
          {[1, 2, 3, 4].map((k) => <line key={k} x1={x + 60 + i * 200 + k * 22} y1={roofY + 80} x2={x + 60 + i * 200 + k * 22} y2={roofY + 150} stroke={MP.woodLight} strokeWidth={4} />)}
        </g>
      ))}
      {/* 1階の柱と板の間 */}
      <rect x={x} y={600} width={w} height={280} fill={MP.woodDark} stroke={INK} strokeWidth={6} />
      <rect x={x + 16} y={640} width={w - 32} height={200} fill="#3A2E26" />
      {Array.from({ length: Math.round(w / KEN) + 1 }, (_, i) => <rect key={i} x={x + i * KEN - 10} y={600} width={20} height={280} fill={MP.wood} stroke={INK} strokeWidth={4} />)}
      {/* 店先の棚と品物 */}
      <rect x={x + 20} y={800} width={w - 40} height={22} fill={MP.wood} stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.max(1, Math.floor((w - 60) / 70)) }, (_, i) => {
        const gx = x + 50 + i * 70;
        return sign === "rice" ? <ellipse key={i} cx={gx} cy={786} rx={28} ry={18} fill="#E9DDBB" stroke={INK} strokeWidth={3} />
          : sign === "cloth" ? <rect key={i} x={gx - 24} y={766} width={48} height={34} rx={6} fill={[KRP.red, C.ai, KRP.yellow, KRP.green][i % 4]} stroke={INK} strokeWidth={3} />
            : <path key={i} d={`M ${gx - 22} 798 L ${gx - 22} 780 Q ${gx} 770 ${gx + 22} 780 L ${gx + 22} 798 Z`} fill={MP.woodLight} stroke={INK} strokeWidth={3} />;
      })}
      {/* のれん (ゆれる) */}
      {Array.from({ length: Math.max(2, Math.round(w / 110)) }, (_, i) => {
        const nw = (w - 40) / Math.max(2, Math.round(w / 110));
        const sw = Math.sin(f / 14 + i) * 4;
        return <path key={i} d={`M ${x + 20 + i * nw + 3} 604 L ${x + 20 + (i + 1) * nw - 3} 604 L ${x + 20 + (i + 1) * nw - 3 + sw} 700 L ${x + 20 + i * nw + 3 + sw} 700 Z`} fill={noren} stroke={INK} strokeWidth={4} />;
      })}
      {/* 屋根 */}
      <path d={`M ${x - 40} ${roofY + 50} L ${x + 10} ${roofY} L ${x + w - 10} ${roofY} L ${x + w + 40} ${roofY + 50} Z`} fill="#5E6A82" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: Math.floor((w + 60) / 22) }, (_, k) => <line key={k} x1={x - 16 + k * 22} y1={roofY + 6} x2={x - 30 + k * 22} y2={roofY + 46} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
      <path d={`M ${x - 30} 610 L ${x + 6} 584 L ${x + w - 6} 584 L ${x + w + 30} 610 Z`} fill="#5E6A82" stroke={INK} strokeWidth={5} />
      {/* 字のない看板 (絵だけ) */}
      <g transform={`translate(${x + w / 2} ${roofY + (big ? 200 : 100)})`}>
        <rect x={-60} y={-34} width={120} height={68} rx={8} fill={MP.wood} stroke={INK} strokeWidth={5} />
        {sign === "comb" && <g><path d="M -32 -4 Q 0 -26 32 -4 L 32 6 L -32 6 Z" fill={MP.brass} stroke={INK} strokeWidth={3} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={-28 + i * 8} y1={6} x2={-28 + i * 8} y2={20} stroke={INK} strokeWidth={3} />)}</g>}
        {sign === "rice" && <g><ellipse cx={0} cy={4} rx={36} ry={22} fill="#E9DDBB" stroke={INK} strokeWidth={3} /><path d="M -36 0 L 36 0 M -30 12 L 30 12" stroke={C.rope} strokeWidth={4} /></g>}
        {sign === "cloth" && <g><rect x={-34} y={-18} width={68} height={36} rx={6} fill={C.noren} stroke={INK} strokeWidth={3} /><path d="M -34 -4 L 34 -4 M -34 8 L 34 8" stroke={KRP.white} strokeWidth={3} /></g>}
      </g>
    </g>
  );
};
// 集金係 (藍の着物。左手に帳面、右手に口の開いた巾着)
const MzCbCollector: React.FC<{ x: number; y: number; s: number; f: number; face?: Face; walk?: number; coins?: number; gaze?: [number, number] }> = ({ x, y, s, f, face = "normal", walk = 0, coins = 0, gaze = [6, -2] }) => {
  const step = Math.sin(f / 3) * 4 * walk;
  return (
    <g transform={`translate(0 ${-Math.abs(step)})`}>
      <MzCbEdoMan x={x} y={y} s={s} f={f} face={face} cloth={C.ai} clothDark={C.aiDark} gaze={gaze} phase={6} lean={walk * 3} />
      <g transform={`translate(${x} ${y + Math.sin((f + 6 * 17) / 13) * 3}) scale(${s}) rotate(${walk * 3})`}>
        {/* 左手の帳面 */}
        <g transform="translate(-70 -70) rotate(-8)">
          <rect x={-34} y={-46} width={56} height={72} rx={4} fill="#F4EBD2" stroke={INK} strokeWidth={4} />
          <line x1={-34} y1={-30} x2={22} y2={-30} stroke={INK} strokeWidth={3} />
          {[0, 1, 2].map((i) => <line key={i} x1={-24 + i * 14} y1={-20} x2={-24 + i * 14} y2={16} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}
          <path d="M -34 -46 L -34 26" stroke={MP.woodDark} strokeWidth={6} />
        </g>
        {/* 右手の巾着 (重くなると少し下がる) */}
        <g transform={`translate(70 ${-64 + Math.min(coins, 16) * 0.8})`}>
          <path d="M -26 0 Q -40 50 0 56 Q 40 50 26 0 Z" fill={MP.bell} stroke={INK} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={26} ry={9} fill="#5A2018" stroke={INK} strokeWidth={4} />
          <path d="M -20 8 Q 0 16 20 8" stroke={MP.brass} strokeWidth={4} fill="none" />
          {coins > 0 && <MzCbZeni x={0} y={-4} r={10} />}
        </g>
      </g>
    </g>
  );
};
// 投げ入れる銭4枚 (t: 0→1)
const CoinToss: React.FC<{ x0: number; y0: number; x1: number; y1: number; t: number }> = ({ x0, y0, x1, y1, t }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const u = clamp01(t * 1.6 - i * 0.2);
      if (u <= 0 || u >= 1) return null;
      return <MzCbZeni key={i} x={lerp(x0, x1, u)} y={lerp(y0, y1, u) - Math.sin(u * Math.PI) * 90} r={13} rot={u * 360} />;
    })}
  </g>
);
// 地面に当てる物差し (目盛りつき)
const Ruler: React.FC<{ x: number; y: number; len: number; joints?: number[] }> = ({ x, y, len, joints = [] }) => (
  <g>
    <rect x={x} y={y - 13} width={Math.max(len, 1)} height={26} fill={MP.woodLight} stroke={INK} strokeWidth={5} />
    <rect x={x} y={y + 13} width={Math.max(len, 1)} height={8} fill={MP.woodDark} opacity={0.5} />
    {Array.from({ length: Math.floor(len / (KEN / 6)) + 1 }, (_, i) => <line key={i} x1={x + i * (KEN / 6)} y1={y - 10} x2={x + i * (KEN / 6)} y2={y - (i % 6 === 0 ? -10 : 0)} stroke={INK} strokeWidth={i % 6 === 0 ? 4 : 2.5} />)}
    {joints.filter((j) => j < len).map((j) => <rect key={j} x={x + j - 8} y={y - 14} width={16} height={28} rx={3} fill={MP.iron} stroke={INK} strokeWidth={3} />)}
  </g>
);
const Mz067: React.FC<{ f: number }> = ({ f }) => {
  const shops = [
    { x: 110, w: KEN, noren: KRP.red as string, sign: "comb" as const, t0: 0, dur: 8 },
    { x: 520, w: KEN * 2, noren: C.noren as string, sign: "rice" as const, t0: 12, dur: 18 },
    { x: 1200, w: KEN * 4, noren: "#7A4A8A", sign: "cloth" as const, t0: 34, dur: 96 },
  ];
  const keepers = [330, 960, 1880];
  // 集金係の位置
  const colX = f < 12 ? 170 : f < 18 ? lerp(170, 590, easeInOut(seg(f, 12, 18))) : f < 34 ? 590 : f < 40 ? lerp(590, 1240, easeInOut(seg(f, 34, 40))) : lerp(1240, 1980, seg(f, 40, 140));
  const walking = (f >= 12 && f < 18) || (f >= 34 && f < 40) ? 1 : f >= 40 ? 0.4 : 0;
  const tx = -clamp01((colX - 700) / 1300) * 400;
  // 何枚入ったか
  let coins = 0;
  const tosses: React.ReactNode[] = [];
  const plates: React.ReactNode[] = [];
  shops.forEach((sh, si) => {
    const nk = Math.round(sh.w / KEN);
    for (let i = 0; i < nk; i++) {
      const tk = sh.t0 + (sh.dur / nk) * (i + 1);
      if (f >= tk) coins += 4;
      plates.push(<TagPlate key={`${si}${i}`} x={sh.x + KEN * (i + 0.5)} y={796} text="1間" size={28} t={seg(f, tk - 2, tk + 4)} />);
      if (f >= tk && f < tk + 12) {
        const px = colX + 63, py = 940 - 58;
        tosses.push(<CoinToss key={`c${si}${i}`} x0={keepers[si] - 50} y0={890 - 120} x1={px} y1={py} t={seg(f, tk, tk + 12)} />);
      }
    }
  });
  return (
    <Frame f={f} seed={6067}>
      {/* 遠景 (ゆっくり動く) */}
      <g transform={`translate(${tx * 0.3} 0)`}>
        <MzCbSky sky={2} x0={1900} x1={2500} />
        <MzCbEdoTown sky={2} x0={1900} x1={2500} />
        <TokiNoKane f={f} swing={0} sky={2} />
      </g>
      <g transform={`translate(${tx} 0)`}>
        {/* 通りの地面 (土と石) */}
        <rect x={-100} y={880} width={2600} height={260} fill="#B49B76" />
        {Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={-60 + i * 90 + rnd(67, i) * 40} cy={960 + rnd(68, i) * 80} rx={14} ry={6} fill="#8E7A5C" opacity={0.6} />)}
        {shops.map((sh, i) => <MzCbShop key={i} x={sh.x} w={sh.w} f={f} noren={sh.noren} sign={sh.sign} big={i === 2} />)}
        {/* 店と店のあいだの路地 */}
        {[[360, 520], [1020, 1200]].map(([a, b], i) => <rect key={i} x={a} y={560} width={b - a} height={320} fill="#4A3E34" stroke={INK} strokeWidth={4} />)}
        {/* 物差し */}
        {shops.map((sh, i) => <Ruler key={i} x={sh.x} y={904} len={sh.w * easeInOut(seg(f, sh.t0, sh.t0 + sh.dur))} joints={i === 2 ? [KEN * 2] : []} />)}
        {plates}
        {/* 店の人 */}
        <MzCbEdoWoman x={keepers[0]} y={890} s={0.78} f={f} face={f < 14 ? "smile" : "normal"} pose={f >= 6 && f < 16 ? "point" : "stand"} pointDir={-1} gaze={[-6, 2]} phase={1} />
        <MzCbEdoMan x={keepers[1]} y={890} s={0.8} f={f} apron face={f >= 18 && f < 40 ? "smile" : "normal"} pose={f >= 18 && f < 38 ? "point" : "stand"} pointDir={-1} gaze={[-6, 2]} phase={2} />
        <MzCbEdoMan x={keepers[2]} y={890} s={0.82} f={f} apron cloth="#5B5F6B" clothDark="#40434C" face={f >= 46 ? "worried" : "normal"} pose={f >= 44 ? "point" : "stand"} pointDir={1} gaze={[6, 2]} phase={3} old />
        <MzCbCollector x={colX} y={940} s={0.9} f={f} walk={walking} coins={coins} face={coins > 0 ? "smile" : "normal"} gaze={[6, -1]} />
        {tosses}
      </g>
      {/* 1間=4文 の札 (カメラの外) */}
      <TagPlate x={940} y={140} text="1間=4文" size={50} t={seg(f, 2, 12)} />
      <g opacity={seg(f, 8, 16)}>
        <circle cx={1180} cy={140} r={40} fill={KRP.white} fillOpacity={0.6} stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
        <text x={1180} y={158} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={KRP.red}>?</text>
      </g>
      {/* 巾着の中身のカウンター (銭の列) */}
      <g transform="translate(1560 140)">
        {Array.from({ length: Math.min(coins, 28) }, (_, i) => <MzCbZeni key={i} x={(i % 8) * 34} y={Math.floor(i / 8) * 34 - 16} r={14} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #68 起こされる料金を、家の幅で、払っていたのです。
// 格: 山 / seed 6068
// 絵: どこ: #67 の通りの続きの、間口のとても広い大店 (のれん・大きな瓦屋根・蔵)。演出: 笑いどころ。集金係の物差しが「1間・2間・3間…」と延々伸び、店の端から端まで届かずに継ぎ足しの物差しを出す。店の前に積まれる銭の山がどんどん高くなって、ついに番頭 (男性・前かけ) の背より高くなる。番頭は銭の山を見上げて口をあんぐり (face="surprised")。隣の狭い長屋の店では、日本髪の女性が銭4枚をちゃりんと払って涼しい顔。奥で鐘がゴーンと鳴る (TokiNoKane swing=1)。カメラは銭の山に合わせて下から上へスクロール。動き: f0-50 物差しが伸びる / f20-110 銭の山が高くなる / f110 鐘
// どこ: #67 の通りの続き。左に1間の狭い長屋の店、右に間口のとても広い大店 (紫ののれん・大きな瓦屋根・奥に白い蔵)。
//       奥に時の鐘の鐘楼 (TokiNoKane sky=2)
// 演出: 笑いどころ。集金係の物差しが「1間・2間・3間…」と大店の前を延々伸び、届かずに継ぎ足しの物差しを足していく。
//       大店の前に積まれる銭の山がどんどん高くなり、番頭 (前かけ) の背より高くなって、番頭は口をあんぐり。
//       隣の狭い店では、日本髪の女性が銭4枚をちゃりんと払って涼しい顔。最後に奥で鐘がゴーン
// 動き: f0-44 物差しが伸びる (継ぎ目つき) / f6-42 銭の山が高くなる (その後もじわじわ) / f10-20 女性の4枚 /
//       カメラは地面の寄りから上へスクロールして山のてっぺんへ (f0-40) / f96-108 鐘が鳴る
const Mz068: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.22, 1.0, easeInOut(seg(f, 0, 40)));
  const cy = lerp(1080, 540, easeInOut(seg(f, 0, 40)));
  const len = KEN * 4.5 * easeOut(seg(f, 0, 44));
  const nTicks = Math.floor(len / KEN + 0.001);
  const pileH = 430 * easeOut(seg(f, 6, 42)) + 30 * seg(f, 42, 120);
  const PX = 1440, PY = 902;
  const rows = Math.floor(pileH / 13);
  const colX = Math.min(640 + len + 60, 1790);
  return (
    <Frame f={f} seed={6068}>
      <g transform={`translate(960 ${cy}) scale(${k}) translate(-960 ${-cy})`}>
        <MzCbSky sky={2} x0={-100} x1={2100} />
        <MzCbEdoTown sky={2} x0={1400} x1={2100} />
        <g transform="translate(-500 0)">
          <TokiNoKane f={f} swing={easeInOut(seg(f, 96, 108))} sky={2} />
        </g>
        <rect x={-100} y={880} width={2200} height={300} fill="#B49B76" />
        {Array.from({ length: 24 }, (_, i) => <ellipse key={i} cx={-60 + i * 90 + rnd(70, i) * 40} cy={970 + rnd(71, i) * 70} rx={14} ry={6} fill="#8E7A5C" opacity={0.6} />)}
        {/* 大店の奥の白い蔵 */}
        <g>
          <rect x={1660} y={170} width={290} height={300} fill={C.kura} stroke={INK} strokeWidth={6} />
          <rect x={1660} y={380} width={290} height={90} fill="#3E3A3A" stroke={INK} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={1660} y1={392 + i * 14} x2={1950} y2={392 + i * 14} stroke={KRP.white} strokeWidth={2} opacity={0.5} />)}
          <path d="M 1630 190 L 1690 120 L 1920 120 L 1980 190 Z" fill="#4C566B" stroke={INK} strokeWidth={6} />
          <rect x={1760} y={230} width={80} height={80} fill="#5E4E3E" stroke={INK} strokeWidth={5} />
        </g>
        {/* 左の狭い店 と 右の大店 */}
        <MzCbShop x={70} w={KEN} f={f} noren={KRP.red} sign="comb" />
        <MzCbShop x={640} w={KEN * 5} f={f} noren="#7A4A8A" sign="cloth" big />
        {/* 物差し (継ぎ足し) */}
        <Ruler x={640} y={922} len={len} joints={[KEN * 2, KEN * 4]} />
        {/* 銭の山 */}
        <g>
          <ellipse cx={PX} cy={PY + 6} rx={190} ry={22} fill={INK} opacity={0.2} />
          {Array.from({ length: rows }, (_, r) => {
            const frac = r / Math.max(rows, 1);
            const wRow = lerp(340, 60, Math.pow(frac, 0.9)) * (0.92 + 0.08 * Math.sin(r * 1.7));
            const n = Math.max(1, Math.floor(wRow / 34));
            return Array.from({ length: n }, (_, c) => {
              const cx2 = PX - wRow / 2 + 17 + c * (wRow / n) + (r % 2) * 8;
              const cy2 = PY - r * 13;
              return (
                <g key={`${r}-${c}`}>
                  <ellipse cx={cx2} cy={cy2} rx={18} ry={7} fill={(r + c) % 3 ? C.zeni : "#CF9E5C"} stroke={INK} strokeWidth={2.5} />
                  <rect x={cx2 - 4} y={cy2 - 2} width={8} height={4} fill={C.zeniDark} />
                </g>
              );
            });
          })}
          {/* 山のてっぺんで光る */}
          <path d={`M ${PX} ${PY - rows * 13 - 30} l 0 -26 M ${PX - 26} ${PY - rows * 13 - 20} l -18 -16 M ${PX + 26} ${PY - rows * 13 - 20} l 18 -16`} stroke={MP.brass} strokeWidth={6} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 4)} />
        </g>
        {Array.from({ length: nTicks }, (_, i) => (
          <TagPlate key={i} x={640 + KEN * (i + 0.5)} y={796} text={`${i + 1}間`} size={28} t={seg(f, (i + 1) * 8 - 2, (i + 1) * 8 + 4)} />
        ))}
        {/* のれんの奥から投げこまれる銭 */}
        {f < 60 && [0, 1, 2, 3].map((i) => {
          const t = ((f + i * 6) % 24) / 24;
          return <MzCbZeni key={i} x={lerp(1640, PX + (i - 1.5) * 20, t)} y={lerp(660, PY - rows * 13 - 10, t) - Math.sin(t * Math.PI) * 120} r={14} rot={t * 400} />;
        })}
        {/* 番頭 (山を見上げて口あんぐり) */}
        <MzCbEdoMan x={1150} y={900} s={0.86} f={f} apron cloth="#5B5F6B" clothDark="#40434C" old
          face={pileH > 200 ? "surprised" : "normal"} gaze={pileH > 200 ? [5, -9] : [4, 0]} lean={pileH > 200 ? -6 : 0} phase={3} />
        {pileH > 200 && <g transform={`translate(1150 ${900 + Math.sin((f + 51) / 13) * 3}) scale(0.86) rotate(-6)`}><MouthO rx={16} ry={22} /></g>}
        {pileH > 300 && <path d="M 1060 620 q -10 20 0 30 q 10 -10 0 -30 Z M 1240 600 q -10 20 0 30 q 10 -10 0 -30 Z" fill={KRP.blue} stroke={INK} strokeWidth={3} />}
        {/* 狭い店の女性: 4枚だけちゃりん、涼しい顔 */}
        <MzCbEdoWoman x={290} y={900} s={0.8} f={f} face="smile" gaze={[-7, -2]} phase={1} />
        <rect x={130} y={858} width={100} height={40} rx={6} fill={MP.wood} stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => {
          const t = seg(f, 10 + i * 2, 16 + i * 2);
          return t > 0 && <MzCbZeni key={i} x={150 + i * 20} y={lerp(760, 850, t * t)} r={12} rot={t * 300} />;
        })}
        {f >= 16 && f < 40 && <path d="M 140 820 l -12 -14 M 240 820 l 12 -14" stroke={MP.brass} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 16, 40)} />}
        {/* 集金係 (物差しの先で、継ぎ足しの物差しを抱える) */}
        <g>
          <MzCbCollector x={colX} y={950} s={0.86} f={f} walk={f < 44 ? 1 : 0} coins={8} face={f < 44 ? "worried" : "surprised"} gaze={[-6, -4]} />
          {f < 50 && (
            <g transform={`translate(${colX - 60} ${950 - 130}) rotate(-70)`}>
              <rect x={-110} y={-11} width={220} height={22} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
              {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-100 + i * 28} y1={-11} x2={-100 + i * 28} y2={0} stroke={INK} strokeWidth={2.5} />)}
            </g>
          )}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #69 朝の鐘、明け六つは、日の出の約30分前。
// 格: 図 / seed 6069
// 絵: どこ: 江戸の町の東の空 (TokiNoKane sky=0→1 の鐘楼が左の手前に大きく)。地平線は町の屋根の連なり。演出: 図の主役は空。地平線の下に隠れた太陽が、点線の弧で「ここから昇る」と示され、空が藍から橙へ移っていく。f40 で鐘が鳴る (swing=1) と、空に縦の線「明け六つ」が入り、そこから太陽が顔を出すところまでの空の帯に、時計の扇形のような半透明の目盛り「約30分」が付く。太陽はまだ出ていないのに、鐘の音で長屋の屋根の上の物干しで男がのびをする。カメラは鐘楼から東の空へ横にパン。動き: f0-40 空が明るくなる / f40 鐘 / f50-90 目盛りが広がる / f100-150 太陽が顔を出す
// どこ: 江戸の町の東の空。左の手前に時の鐘の鐘楼 (TokiNoKane)、右へ屋根の連なりと東の空が続く
// 演出: 図の主役は空。地平線の下の太陽の通り道を点線の弧で示し、空は藍から橙へ。鐘が鳴ると、その瞬間の太陽の位置
//       (まだ地平線の下・点線の丸) に縦の線「明け六つ」が立ち、そこから地平線まで (太陽が顔を出す所) の弧に、
//       時計の扇形のような半透明の目盛り「約30分」が付く。太陽はまだ出ていないのに、物干し台の男がのびをする。
//       最後に本物の太陽が、点線の通り道の終点から顔を出す
// 動き: f0-30 空が明るくなる・カメラが鐘楼から東の空へパン / f20-30 撞木が振れて f30 鐘 / f30-36 明け六つの線 /
//       f32-42 扇形の目盛り / f34-44 男がのびをする / f96-140 太陽が顔を出す
const Mz069: React.FC<{ f: number }> = ({ f }) => {
  const sky = f < 95 ? lerp(0.1, 0.5, easeOut(seg(f, 0, 30))) : lerp(0.5, 1.2, easeOut(seg(f, 95, 140)));
  const tx = lerp(-120, -560, easeInOut(seg(f, 0, 30)));
  const swing = easeInOut(seg(f, 20, 30));
  const SC = [1050, 650] as const, SR = 600;
  const DX = 2080, DY = 330;
  const pt = (deg: number, r = SR) => [SC[0] + Math.cos((deg * Math.PI) / 180) * r, SC[1] - Math.sin((deg * Math.PI) / 180) * r] as const;
  const P1 = pt(-15), P2 = pt(0);
  const lineT = easeOut(seg(f, 30, 36));
  const fan = easeOut(seg(f, 32, 42));
  const fanEnd = lerp(-15, 0, fan);
  const stretch = seg(f, 34, 42);
  const arcD = (a0: number, a1: number, r = SR) => {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 0 ${x1} ${y1}`;
  };
  return (
    <Frame f={f} seed={6069}>
      <g transform={`translate(${tx} 0)`}>
        <MzCbSky sky={sky} x0={1900} x1={2700} />
        <MzCbEdoTown sky={sky} x0={1940} x1={2700} night={clamp01(1 - sky)} />
        <TokiNoKane f={f} swing={swing} sky={sky} />
        {/* 太陽の通り道 (点線の弧。地平線の下から昇る) */}
        <path d={arcD(-26, 20)} stroke={KRP.white} strokeWidth={6} fill="none" strokeDasharray="4 16" strokeLinecap="round" opacity={0.85} />
        <Arrow x={pt(14)[0]} y={pt(14)[1]} s={0.5} rot={-80} t={seg(f, 6, 16)} />
        {/* 地平線 */}
        <line x1={900} y1={650} x2={2700} y2={650} stroke={MP.dawnSoft} strokeWidth={4} strokeDasharray="20 12" opacity={0.7} />
        {/* 明け六つ → 日の出 の弧 (太い橙の帯に目盛り) */}
        {fan > 0 && (
          <g>
            <path d={arcD(-15, fanEnd)} stroke={MP.dawn} strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.9} />
            {Array.from({ length: 7 }, (_, i) => {
              const a = -15 + (15 / 6) * i;
              if (a > fanEnd + 0.01) return null;
              const [ax, ay] = pt(a, SR - 26), [bx, by] = pt(a, SR + 26);
              return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={INK} strokeWidth={i % 3 === 0 ? 6 : 3.5} />;
            })}
          </g>
        )}
        {/* 鐘が鳴った瞬間の、まだ地平線の下の太陽 (点線の丸) と「明け六つ」の縦線 */}
        {lineT > 0 && (
          <g>
            <circle cx={P1[0]} cy={P1[1]} r={46} fill={MP.dawnSoft} fillOpacity={0.4} stroke={KRP.white} strokeWidth={5} strokeDasharray="10 8" />
            <line x1={P1[0]} y1={P1[1] - 46} x2={P1[0]} y2={lerp(P1[1] - 46, 300, lineT)} stroke={KRP.white} strokeWidth={7} />
            <line x1={P1[0]} y1={P1[1] - 46} x2={P1[0]} y2={lerp(P1[1] - 46, 300, lineT)} stroke={INK} strokeWidth={2} strokeDasharray="12 10" />
          </g>
        )}
        <TagPlate x={P1[0]} y={262} text="明け六つ" size={44} t={seg(f, 33, 40)} />
        {/* 日の出の地点の印 */}
        <circle cx={P2[0]} cy={P2[1]} r={11} fill={MP.dawn} stroke={INK} strokeWidth={3} opacity={fan} />
        {/* 時計の扇形 (30分ぶん = 文字盤の半分) */}
        <g opacity={seg(f, 30, 36)}>
          <path d={`M ${pt(-7, SR)[0] + 20} ${pt(-7, SR)[1]} Q 1900 640 1990 ${DY + 150}`} stroke={KRP.white} strokeWidth={5} strokeDasharray="10 10" fill="none" />
          <circle cx={DX} cy={DY} r={176} fill={KRP.white} fillOpacity={0.25} />
          <circle cx={DX} cy={DY} r={160} fill={KRP.cream} stroke={INK} strokeWidth={7} />
          {fan > 0 && <path d={`M ${DX} ${DY} L ${DX} ${DY - 150} A 150 150 0 ${fan > 0.999 ? 1 : 0} 1 ${DX + Math.sin(fan * Math.PI) * 150} ${DY - Math.cos(fan * Math.PI) * 150} Z`} fill={MP.dawn} opacity={0.6} />}
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180;
            return <line key={i} x1={DX + Math.sin(a) * 150} y1={DY - Math.cos(a) * 150} x2={DX + Math.sin(a) * (i % 5 ? 138 : 122)} y2={DY - Math.cos(a) * (i % 5 ? 138 : 122)} stroke={INK} strokeWidth={i % 5 ? 2.5 : 5} />;
          })}
          <line x1={DX} y1={DY} x2={DX + Math.sin(fan * Math.PI) * 126} y2={DY - Math.cos(fan * Math.PI) * 126} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <circle cx={DX} cy={DY} r={12} fill={MP.brass} stroke={INK} strokeWidth={4} />
        </g>
        <TagPlate x={DX} y={DY + 220} text="約30分" size={46} t={seg(f, 38, 44)} />
        {/* 屋根の上の物干し台と、のびをする男 */}
        <g>
          <rect x={1170} y={700} width={220} height={16} fill={MP.wood} stroke={INK} strokeWidth={4} />
          {[1180, 1370].map((px) => <rect key={px} x={px - 5} y={716} width={10} height={40} fill={MP.woodDark} stroke={INK} strokeWidth={3} />)}
          {[1176, 1384].map((px) => <rect key={px} x={px - 4} y={560} width={8} height={140} fill={C.bamboo} stroke={INK} strokeWidth={3} />)}
          <line x1={1176} y1={566} x2={1384} y2={566} stroke={C.bamboo} strokeWidth={8} />
          <path d={`M 1320 566 L 1316 ${626 + Math.sin(f / 12) * 4} L 1370 ${630 + Math.sin(f / 12) * 4} L 1366 566 Z`} fill={KRP.white} stroke={INK} strokeWidth={3} />
          <MzCbEdoMan x={1250} y={704} s={0.56} f={f} cloth="#6F7F99" clothDark="#55637B"
            pose={stretch > 0.3 ? "banzai" : "stand"} face={stretch > 0.3 ? "joy" : "normal"} gaze={[-5, -3]} phase={2} />
          {stretch > 0.3 && f < 80 && [0, 1, 2].map((i) => <path key={i} d={`M ${1210 + i * 40} 500 l ${(i - 1) * 8} -16`} stroke={MP.glow} strokeWidth={5} strokeLinecap="round" />)}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #70 しかも江戸の時刻は、季節ごとに、1時間の長さが、伸び縮みしました。
// 格: 図 / seed 6070
// 絵: どこ: 江戸の町を背景に、鐘楼の柱に掛かった、木の板の大きな時刻の札 (和時計の割駒の板のような、昼と夜に分かれた目盛りの板)。演出: 図の主役は板の目盛り。左上に夏の太陽 (セミ・青い空)、右上に冬の太陽 (雪・灰色の空) のアイコン。板の昼の部分の目盛りが、夏では**ゴムのようにびよーんと伸び**、冬では**ぎゅっと縮む**、を f でくり返す。板の横で、町人の男が板の伸び縮みに合わせて首を伸ばしたり縮めたりして目を回す (face="dizzy")。札は「夏」「冬」だけ。カメラは板に寄ってから、少しだけ引いて男を入れる。動き: f0-50 夏で伸びる / f50-100 冬で縮む / f100-150 また伸びる・男がくらくら
// どこ: 時の鐘の鐘楼の柱 (TokiNoKane を2倍に寄せて、柱・釣り鐘・屋根が背景) に掛けた、木の大きな時刻の板
//       (和時計の割駒の板: 昼6コマ=黄に太陽 / 夜6コマ=紺に月。さかいに木の駒)
// 演出: 図の主役は板の目盛り。左上に夏 (青空・太陽・セミ)、右上に冬 (灰色の空・雪) のアイコンと札「夏」「冬」。
//       昼のコマが、夏はゴムのようにびよーんと伸び (夜が縮む)、冬はぎゅっと縮む (夜が伸びる)、をくり返す。
//       もう一方の季節の昼の長さは赤い点線で残す。右下の町人の男が、伸び縮みに合わせて首を伸ばしたり縮めたりして目を回す
// 動き: f0-15 夏で伸びる / f25-40 冬で縮む / f70-85 夏 / f115-130 冬 (ばねのように行き過ぎて戻る) /
//       カメラは板の寄り (1.12) → 少し引いて男を入れる (f0-40)
const elastic = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-6 * t) * Math.cos(t * 12));
const SUMMER = 0.64, WINTER = 0.38;
const Mz070: React.FC<{ f: number }> = ({ f }) => {
  const clipH = useId("mz70h"), clipB = useId("mz70b");
  const steps: [number, number, number][] = [[0, 0.5, SUMMER], [25, SUMMER, WINTER], [70, WINTER, SUMMER], [115, SUMMER, WINTER]];
  let day = 0.5;
  let season: "s" | "w" = "s";
  for (const [t0, a, b] of steps) {
    if (f >= t0) { day = lerp(a, b, elastic(seg(f, t0, t0 + 15))); season = b === SUMMER ? "s" : "w"; }
  }
  const ghost = season === "s" ? WINTER : SUMMER;
  const k = lerp(1.12, 1.0, easeInOut(seg(f, 0, 40)));
  const neck = (day - 0.5) * 380;
  const MX = 1660, MY = 950, MS = 0.82;
  const nY = MY - 160 * MS;
  const bob = Math.sin((f + 4 * 17) / 13) * 3;
  const spin = f * 9;
  const spiral = (cx: number, cy: number) => (
    <g transform={`rotate(${spin} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={13} ry={16} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
      <path d={`M ${cx} ${cy} m 0 -2 a 2 2 0 1 1 -2 2 a 5 5 0 1 1 5 5 a 8 8 0 1 1 -8 -8 a 10 10 0 1 1 10 10`} stroke={INK} strokeWidth={2.5} fill="none" />
    </g>
  );
  const man = (
    <MzCbEdoMan x={MX} y={MY} s={MS} f={f} apron face="worried" pose={season === "s" ? "stand" : "armsFolded"} phase={4} />
  );
  return (
    <Frame f={f} seed={6070}>
      <g transform={`translate(900 520) scale(${k}) translate(-900 -520)`}>
        {/* 背景: 鐘楼の柱と鐘 (TokiNoKane に寄る) */}
        <g transform="translate(-624 -580) scale(2)">
          <TokiNoKane f={f} swing={0} sky={1.6} />
        </g>
        <rect x={-200} y={-200} width={2400} height={1500} fill={KRP.white} opacity={0.18} />
        {/* 板を掛けた釘 */}
        <MzCbWadokei x={960} y={500} w={1240} f={f} day={day} ghost={ghost} />
        <circle cx={960} cy={295} r={10} fill={MP.iron} />
        {/* 夏と冬のアイコン */}
        {([["s", 330, 190], ["w", 1500, 190]] as const).map(([sn, ix, iy]) => {
          const on = season === sn;
          return (
            <g key={sn} transform={`translate(${ix} ${iy}) scale(${on ? 1.08 + Math.sin(f / 6) * 0.02 : 0.9})`} opacity={on ? 1 : 0.55}>
              {on && <circle r={104} fill={C.goldGlow} opacity={0.5} />}
              <circle r={86} fill={sn === "s" ? C.summer : C.winter} stroke={INK} strokeWidth={6} />
              {sn === "s" ? (
                <g>
                  <circle cx={-14} cy={-10} r={34} fill={C.sunCore} stroke={INK} strokeWidth={4} />
                  {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-14 + Math.cos(i * 0.785) * 42} y1={-10 + Math.sin(i * 0.785) * 42} x2={-14 + Math.cos(i * 0.785) * 56} y2={-10 + Math.sin(i * 0.785) * 56} stroke={INK} strokeWidth={4} />)}
                  {/* セミ */}
                  <g transform="translate(40 40) rotate(-20)">
                    <ellipse rx={12} ry={20} fill="#6B5A3A" stroke={INK} strokeWidth={3} />
                    <path d="M -2 -10 Q -30 6 -16 30 Z M 2 -10 Q 30 6 16 30 Z" fill="#DDEFF6" fillOpacity={0.8} stroke={INK} strokeWidth={2.5} />
                  </g>
                </g>
              ) : (
                <g>
                  <circle cx={0} cy={-6} r={26} fill="#F4E9B8" stroke={INK} strokeWidth={4} opacity={0.8} />
                  {[[-50, -30], [40, -40], [-30, 40], [44, 30], [6, 54], [-60, 12]].map(([sx, sy], i) => (
                    <g key={i} transform={`translate(${sx} ${sy + ((f * 0.6 + i * 9) % 20) - 10})`}>
                      <path d="M -8 0 L 8 0 M 0 -8 L 0 8 M -6 -6 L 6 6 M 6 -6 L -6 6" stroke={KRP.white} strokeWidth={3.5} strokeLinecap="round" />
                    </g>
                  ))}
                </g>
              )}
            </g>
          );
        })}
        <TagPlate x={480} y={200} text="夏" size={54} t={1} />
        <TagPlate x={1350} y={200} text="冬" size={54} t={1} />
        {/* 町人の男 (首が伸び縮みして目を回す) */}
        <defs>
          <clipPath id={clipB}><rect x={MX - 300} y={nY + bob} width={600} height={400} /></clipPath>
          <clipPath id={clipH}><rect x={MX - 300} y={nY + bob - 500} width={600} height={500} /></clipPath>
        </defs>
        <g clipPath={`url(#${clipB})`}>{man}</g>
        {neck > 0 && <rect x={MX - 13} y={nY + bob - neck - 4} width={26} height={neck + 10} fill={KRP.white} stroke={INK} strokeWidth={4} />}
        <g transform={`translate(0 ${-neck})`}>
          <g clipPath={`url(#${clipH})`}>{man}</g>
          {spiral(MX - 24 * MS, MY + bob - 222 * MS)}
          {spiral(MX + 24 * MS, MY + bob - 222 * MS)}
          {/* くらくらの星 */}
          {[0, 1, 2].map((i) => {
            const a = f / 8 + (i * Math.PI * 2) / 3;
            return <path key={i} d="M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z" fill={KRP.yellow} stroke={INK} strokeWidth={2}
              transform={`translate(${MX + Math.cos(a) * 70} ${MY + bob - 300 * MS + Math.sin(a) * 18})`} />;
          })}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #71 人間が太陽に合わせるのではなく、時刻のほうが、太陽に合わせていたのです。
// 格: 山 / seed 6071
// 絵: どこ: 江戸の町の上の空 (TokiNoKane sky=1、鐘楼が下の端に小さく見える)。演出: 空に大きく、顔のある太陽 (にこにこ顔のやさしい太陽) が昇ってくる。その下で、和時計の板の目盛り (#70 と同じ板) が、太陽の動きにぴったりくっついて、犬が飼い主について歩くように、太陽の後をちょこちょこついていく。地上の鐘撞き (男性・半纏) が、太陽を見上げてから撞木を引き、鐘を鳴らす (太陽が先、鐘が後)。カメラは鐘楼から太陽へ下から上へスクロール。動き: f0-40 太陽が昇る / f40-100 目盛りの板がついていく / f100 鐘撞きが空を見上げて撞く
// どこ: 江戸の町の朝の空 (TokiNoKane sky=1.6。カメラが引くと鐘楼は下の方に小さくなる)
// 演出: 屋根の向こうから、にこにこ顔の大きな太陽が昇る。#70 と同じ和時計の板が、短い足でちょこちょこ歩き、
//       ひもでつながれた犬のように太陽の後をついていく (太陽が先・板が後)。地上の鐘撞き (半纏) は、
//       太陽を見上げてから、撞木の綱を引いて鐘を鳴らす
// 動き: f0-40 太陽が昇る (カメラは下から上へ引いて空を広く) / 板は10コマ遅れでついていく (ぴょこぴょこ) /
//       f80-96 鐘撞きが見上げる / f100-112 撞いて鐘が鳴る
const sunPath = (t: number) => {
  const u = easeOut(clamp01(t / 40));
  const drift = Math.max(0, t - 40) * 1.2;
  return [lerp(1640, 1500, u) + drift * 0.6, lerp(800, 60, u) - drift * 0.3] as const;
};
const Mz071: React.FC<{ f: number }> = ({ f }) => {
  const mask = useId("mz71m");
  const k = lerp(1.0, 0.72, easeInOut(seg(f, 0, 40)));
  const [sx, sy] = sunPath(f);
  const [bx0, by0] = sunPath(Math.max(0, f - 10));
  const bx = bx0 - 430, by = by0 + 150 - Math.abs(Math.sin(f / 4)) * 18;
  const look = seg(f, 80, 96);
  const swing = easeInOut(seg(f, 100, 112));
  return (
    <Frame f={f} seed={6071}>
      <g transform={`translate(960 1080) scale(${k}) translate(-960 -1120)`}>
        <MzCbSky sky={1.6} x0={-800} x1={2800} yTop={-900} />
        <MzCbEdoTown sky={1.6} x0={-800} x1={-20} />
        <MzCbEdoTown sky={1.6} x0={1940} x1={2800} />
        <defs>
          <mask id={mask} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1500}>
            <rect x={-200} y={-200} width={2400} height={1500} fill="white" />
            <circle cx={1650} cy={760 - 380 * (1.1 / 1.5)} r={72} fill="black" />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          <TokiNoKane f={f} swing={swing} sky={1.6} />
        </g>
        {/* 太陽 (遠くの屋根のすぐ上の線 y=660 から上だけ見せる = 屋根の向こうから昇る) */}
        <defs><clipPath id={mask + "c"}><rect x={-1000} y={-2000} width={4000} height={2660} /></clipPath></defs>
        <g clipPath={`url(#${mask}c)`}><MzCbSun x={sx} y={sy} r={200} f={f} smile={1} /></g>
        {/* 犬のひも (太陽の光線から板へ) */}
        <path d={`M ${sx - 150} ${sy + 120} Q ${(sx + bx) / 2} ${Math.max(sy, by) + 120} ${bx + 180} ${by - 90}`} stroke={KRP.red} strokeWidth={6} fill="none" strokeDasharray="14 8" />
        {/* ついていく和時計の板 */}
        <g transform={`rotate(${Math.sin(f / 4) * 4} ${bx} ${by})`}>
          <MzCbWadokei x={bx} y={by} w={620} f={f} day={0.6} feet={1} />
        </g>
        {/* 足あとの点線 */}
        <path d={`M ${bx} ${by + 180} Q ${bx + 60} ${by + 320} ${bx - 40} ${by + 520}`} stroke={KRP.white} strokeWidth={6} fill="none" strokeDasharray="4 22" strokeLinecap="round" opacity={0.7} />
        {/* 鐘撞き (太陽を見上げてから撞く) */}
        <MzCbEdoMan x={TOKI_ROPE[0] + 64} y={790 + 118 * 0.9} s={0.9} f={f} pose="hold" hanten hachimaki cloth={C.hanten} clothDark={C.hantenDark}
          face={f >= 104 ? "joy" : look > 0.5 ? "smile" : "normal"} gaze={look > 0.3 ? [-2, -9] : [-4, -6]} lean={-4 * look} phase={3} />
        <path d={`M ${TOKI_ROPE[0]} ${TOKI_ROPE[1]} Q ${TOKI_ROPE[0] + 30} ${TOKI_ROPE[1] + 8} ${TOKI_ROPE[0] + 78} ${TOKI_ROPE[1] + 2}`} stroke={C.rope} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={TOKI_ROPE[0] + 51} cy={TOKI_ROPE[1] + 3} r={8} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
        {/* 太陽が先、鐘が後: 見上げた瞬間の視線 */}
        {look > 0 && f < 104 && <path d={`M ${TOKI_ROPE[0] + 64} 640 L ${sx - 120} ${sy + 160}`} stroke={KRP.white} strokeWidth={5} strokeDasharray="6 14" opacity={look * 0.8} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #72 このころの他人は、まだ、太陽と仲良しでした。
// 格: 山 / seed 6072
// 絵: どこ: 夕方の江戸の町と TokiNoKane (swing=0.3, sky=2→夕焼け)。瓦屋根が茜色に染まる。演出: 鐘楼の屋根の上で、顔のある太陽 (#71 と同じ) と、半纏の鐘撞きの男が並んで座り、湯のみでお茶を飲んで仲良くくつろぐ (鐘撞きは腕は2本、pose で湯のみを両手で持つ)。太陽がほほえみ、鐘撞きもにっこり (face="smile")。ただし画面の右の遠い地平線に、**小さな黒い煙の筋と煙突の先っぽ**がひとつだけ、にゅっと出てくる (4章の工場の予告)。太陽がそれに気づいて、ちらっと横目で見る。カメラはゆっくり引いて、煙突が入る。動き: f0-60 お茶 / f60-120 引き・煙突がにゅっ / f120 太陽の横目
// どこ: 夕方の江戸の町と時の鐘 (TokiNoKane swing=0.3 sky=2 に茜色の夕焼けを重ねる)
// 演出: 鐘楼の屋根のてっぺんに、#71 と同じ顔の太陽と、半纏の鐘撞きが並んで腰かけ、湯のみでお茶を飲んでくつろぐ
//       (鐘撞きは両手で湯のみ、太陽は光の手で湯のみ)。2人ともにっこり。カメラがゆっくり引くと、右の遠い地平線に
//       小さな黒い煙突の先っぽが1本だけにゅっと出て、黒い煙がたなびく (4章の工場の予告)。太陽がそれに気づいて横目で見る
// 動き: f0-60 お茶 (湯気・すする) / f10-70 カメラが引く / f60-80 煙突がにゅっ・煙 / f88- 太陽の横目
const Mz072: React.FC<{ f: number }> = ({ f }) => {
  const mask = useId("mz72m");
  const pull = easeInOut(seg(f, 10, 70));
  const k = lerp(1.8, 1.0, pull);
  const wx = lerp(980, 960, pull), wy = lerp(150, 540, pull);
  const sxA = 960, syA = lerp(640, 540, pull);
  const chim = easeOut(seg(f, 60, 76));
  const glance = seg(f, 88, 94);
  const sip = Math.sin(f / 10) > 0.6 ? 1 : 0;
  const RX = 890, RS = 0.7, RY = 190 + 58 * RS;
  const SX = 1060, SY = 112, SR = 72;
  return (
    <Frame f={f} seed={6072}>
      <g transform={`translate(${sxA} ${syA}) scale(${k}) translate(${-wx} ${-wy})`}>
        <MzCbSky sky={2} x0={-200} x1={2200} yTop={-400} />
        <defs>
          <mask id={mask} maskUnits="userSpaceOnUse" x={-200} y={-400} width={2400} height={1600}>
            <rect x={-200} y={-400} width={2400} height={1600} fill="white" />
            <circle cx={1650} cy={380} r={72} fill="black" />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          <TokiNoKane f={f} swing={0.3} sky={2} />
        </g>
        {/* 夕焼け (茜色を重ねる。上は紫がかる) */}
        <rect x={-200} y={-400} width={2400} height={1600} fill={C.dusk} opacity={0.32} />
        <rect x={-200} y={-400} width={2400} height={500} fill="#8A4A7A" opacity={0.18} />
        <ellipse cx={1500} cy={700} rx={760} ry={110} fill={MP.dawn} opacity={0.22} />
        {/* 地平線の煙突 (遠くに小さく) と黒い煙 */}
        {chim > 0 && (
          <g>
            {Array.from({ length: 6 }, (_, i) => {
              const t = ((f - 64 + i * 9) / 54);
              if (t < 0 || t > 1) return null;
              return <circle key={i} cx={1832 - t * 60} cy={650 - 110 * chim - 20 - t * 150} r={10 + t * 26} fill={MP.soot} opacity={(1 - t) * 0.85} />;
            })}
            <rect x={1818} y={650 - 110 * chim} width={26} height={110 * chim} fill={MP.brickDark} stroke={INK} strokeWidth={4} />
            <rect x={1812} y={650 - 110 * chim} width={38} height={10} fill={MP.soot} stroke={INK} strokeWidth={3} />
          </g>
        )}
        {/* 鐘撞き (屋根のてっぺんに腰かけ、両手で湯のみ) */}
        <MzCbEdoMan x={RX} y={RY} s={RS} f={f} pose="hold" hanten cloth={C.hanten} clothDark={C.hantenDark} face={sip ? "joy" : "smile"} gaze={[5, -1]} phase={2} />
        <g transform={`translate(${RX} ${RY - 124 * RS + Math.sin((f + 2 * 17) / 13) * 3})`}>
          <path d="M -15 -4 L 15 -4 L 12 22 L -12 22 Z" fill="#6E8C70" stroke={INK} strokeWidth={3.5} />
          <path d="M -15 2 L 15 2" stroke="#A9C4A6" strokeWidth={3} />
          {[0, 1].map((i) => <path key={i} d={`M ${-6 + i * 12} -10 q ${-6 + Math.sin(f / 6 + i) * 4} -12 0 -24 q 6 -12 0 -22`} stroke={KRP.white} strokeWidth={3.5} fill="none" opacity={0.75} />)}
        </g>
        {/* 太陽 (屋根に腰かけて、光の手で湯のみ) */}
        <MzCbSun x={SX} y={SY} r={SR} f={f} smile={glance > 0.5 ? 0 : 1} look={1} />
        <g transform={`translate(${SX - SR - 6} ${SY + 30})`}>
          <circle cx={10} cy={6} r={12} fill={C.sunCore} stroke={INK} strokeWidth={3.5} />
          <path d="M -14 -6 L 14 -6 L 11 18 L -11 18 Z" fill="#6E8C70" stroke={INK} strokeWidth={3.5} />
          {[0, 1].map((i) => <path key={i} d={`M ${-5 + i * 10} -12 q ${-5 + Math.sin(f / 7 + i) * 4} -10 0 -20 q 5 -10 0 -18`} stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.75} />)}
        </g>
        {/* 横目のときの汗ひとつぶ */}
        {glance > 0.5 && <path d={`M ${SX + SR - 8} ${SY - SR + 10} q -10 18 0 24 q 10 -6 0 -24 Z`} fill={KRP.blue} stroke={INK} strokeWidth={3} />}
        {/* ふたりのあいだの、なかよしの音符 */}
        {f < 88 && [0, 1].map((i) => {
          const t = ((f / 40 + i / 2) % 1);
          return <text key={i} x={975 + i * 20} y={90 - t * 80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.red} stroke={INK} strokeWidth={2} paintOrder="stroke" opacity={Math.min(1, (1 - t) * 3, t * 6)}>♪</text>;
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_060: (f) => <Mz060 f={f} />,
  mz_061: (f) => <Mz061 f={f} />,
  mz_062: (f) => <Mz062 f={f} />,
  mz_063: (f) => <Mz063 f={f} />,
  mz_064: (f) => <Mz064 f={f} />,
  mz_065: (f) => <Mz065 f={f} />,
  mz_066: (f) => <Mz066 f={f} />,
  mz_067: (f) => <Mz067 f={f} />,
  mz_068: (f) => <Mz068 f={f} />,
  mz_069: (f) => <Mz069 f={f} />,
  mz_070: (f) => <Mz070 f={f} />,
  mz_071: (f) => <Mz071 f={f} />,
  mz_072: (f) => <Mz072 f={f} />,
};

export const MZ_CB_MOTIFS: string[] = [
  "mz_060", // #60
  "mz_061", // #61
  "mz_062", // #62
  "mz_063", // #63
  "mz_064", // #64
  "mz_065", // #65
  "mz_066", // #66
  "mz_067", // #67
  "mz_068", // #68
  "mz_069", // #69
  "mz_070", // #70
  "mz_071", // #71
  "mz_072", // #72
];

export const mezaCbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
