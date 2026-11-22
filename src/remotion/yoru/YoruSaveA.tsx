// 夜の深掘り 試作: セーブ回「冒険の書は、なぜ消えたのか」1枚目 (山)
// 「意味のないひらがなを、子どもたちは必死に書き写していた」
// 6点法: 寄る (部屋 → ノートと画面) / 世界 (夜の6畳・ブラウン管の光だけ) / 部品 (テレビ・ゲーム機・コントローラーを精巧に)
//        カメラ (引き → 寄り) / 事件 (1文字の書き間違い「ぬ」→「め」) / 人の反応 (子どもが固まる)
// ★ゲーム機・カセットは形と構造だけ精巧に。ロゴ・刻印・ラベルの絵は描かない (作者確認 2026-11-16)
import React from "react";
import { NoteRoomA, NoteKidA, NoteTableA, NoteArmsA, Arrow, Hand, PEN } from "./YoruNote";
import {
  W, H, YRP, MINCHO, GOTHIC, seg, easeInOut, pop, clamp01, rnd,
  YoruDefs, NightFinish, Caption, FileTag, Folk, Dust, useMood, isPlain, isLightBg,
} from "./YoruShared";

// 部屋の色 (作風ごと)。night=今の夜版 / flat=灯りを描かない夜 (少し明るく・グラデなし) / day=昼のからくり
const ROOM = {
  night: { bg: "#11151F", wallT: "#151A26", wallB: "#232B3B", wood: "#3A2C22", wood2: "#33271E", win: "#1B2742", curtain: "#3D4A6B",
    cal: "#D9D2C0", box: "#4E3A2B", tatami: "#34352A", heri: "#1E281C", tLine: "#2A2B21", stand: "#5A4130", stand2: "#4A3526",
    cbShadow: "#2A1E15", cbSide: "#4A3220", cbTop: "#6B4A30", cbRing: "#7E5A3C", cbLeg: "#3A2818", cable: "#1A1716", bar: "#2A2420" },
  flat: { bg: "#232A3B", wallT: "#2C3449", wallB: "#2C3449", wood: "#4C3B2E", wood2: "#45362A", win: "#22304F", curtain: "#4A5A80",
    cal: "#D9D2C0", box: "#5E4634", tatami: "#4B4D3B", heri: "#33372B", tLine: "#43453A", stand: "#6E5039", stand2: "#5E442F",
    cbShadow: "#353A2C", cbSide: "#5E3F28", cbTop: "#7E5838", cbRing: "#8E6844", cbLeg: "#4A3220", cable: "#1A1716", bar: "#3A2E26" },
  day: { bg: "#EFE3C8", wallT: "#F1E6CC", wallB: "#F1E6CC", wood: "#9C7A55", wood2: "#8E6E4B", win: "#BFE0EE", curtain: "#D98F7A",
    cal: "#FBF7EC", box: "#B88A5E", tatami: "#CFC98E", heri: "#8F8A52", tLine: "#BDB77C", stand: "#A87C52", stand2: "#946A44",
    cbShadow: "#AFA872", cbSide: "#8E5E36", cbTop: "#B9814E", cbRing: "#C9925E", cbLeg: "#7A5230", cable: "#3A3330", bar: "#8E6E4B" },
};

const HAND = "'Klee', 'Hiragino Maru Gothic ProN', sans-serif";
// 画面のパスワード (架空の20文字)。ノートには1文字目だけ「め」と書き間違える
const PASS = ["ぬこれほた", "めゆずぺに", "そるぎふよ", "きのわぐん"];

// ブラウン管テレビ (左上 x,y。幅500 高さ330)。画面の中身は自作のパスワード画面
const CrtTv: React.FC<{ f: number; hi: number }> = ({ f, hi }) => {
  const flick = 0.92 + Math.sin(f * 1.7) * 0.03 + Math.sin(f * 0.37) * 0.03;
  return (
    <g>
      {/* 室内アンテナ */}
      <line x1={500} y1={262} x2={372} y2={120} stroke="#8C9198" strokeWidth={5} strokeLinecap="round" />
      <line x1={500} y1={262} x2={652} y2={98} stroke="#8C9198" strokeWidth={5} strokeLinecap="round" />
      <circle cx={372} cy={120} r={7} fill="#B8BDC4" stroke={YRP.ink} strokeWidth={3} />
      <circle cx={652} cy={98} r={7} fill="#B8BDC4" stroke={YRP.ink} strokeWidth={3} />
      <path d="M 452 272 Q 452 246 500 246 Q 548 246 548 272 Z" fill="#3A393F" stroke={YRP.ink} strokeWidth={4} />
      {/* 本体 */}
      <rect x={250} y={270} width={500} height={332} rx={26} fill="#34333A" stroke={YRP.ink} strokeWidth={6} />
      <rect x={258} y={278} width={484} height={14} rx={7} fill="#4A4952" opacity={0.7} />
      {/* 画面のふち */}
      <rect x={268} y={294} width={318} height={286} rx={22} fill="#1C1B20" stroke={YRP.ink} strokeWidth={4} />
      {/* 画面 (ふくらんだブラウン管) */}
      <rect x={288} y={312} width={278} height={250} rx={34} fill="#0A1116" />
      <g opacity={flick}>
        <rect x={288} y={312} width={278} height={250} rx={34} fill="url(#crtFace)" />
        <text x={427} y={350} textAnchor="middle" fontFamily={GOTHIC} fontWeight={700} fontSize={20} fill="#DDF6FB" letterSpacing={6}>
          パスワード
        </text>
        {PASS.map((row, r) =>
          row.split("").map((ch, i) => {
            const cx = 330 + i * 48;
            const cy = 392 + r * 44;
            const on = r === 0 && i === 0;
            return (
              <g key={`${r}-${i}`}>
                <rect x={cx - 19} y={cy - 22} width={38} height={36} rx={4} fill="none" stroke="#7FC9DA" strokeWidth={2} opacity={0.55} />
                <text x={cx} y={cy + 6} textAnchor="middle" fontFamily={GOTHIC} fontWeight={700} fontSize={25} fill="#E8FBFF">{ch}</text>
                {on && hi > 0 && (
                  <circle cx={cx} cy={cy - 4} r={26} fill="none" stroke="#7FF0FF" strokeWidth={4}
                    strokeDasharray={170} strokeDashoffset={170 * (1 - hi)} />
                )}
              </g>
            );
          }),
        )}
        {/* 点滅カーソル */}
        {Math.floor(f / 12) % 2 === 0 && <rect x={512} y={530} width={30} height={5} fill="#E8FBFF" />}
        {/* 走査線 */}
        {Array.from({ length: 62 }).map((_, i) => (
          <line key={i} x1={288} y1={314 + i * 4} x2={566} y2={314 + i * 4} stroke="#000" strokeWidth={1.4} opacity={0.22} />
        ))}
        {/* ガラスの反射 */}
        <path d="M 304 336 Q 330 318 380 316 L 372 330 Q 330 334 312 350 Z" fill="#FFFFFF" opacity={0.13} />
      </g>
      {/* 右のつまみ (チャンネル) */}
      <rect x={602} y={300} width={128} height={276} rx={12} fill="#2A292F" stroke={YRP.ink} strokeWidth={3.5} />
      <circle cx={666} cy={364} r={46} fill="#1F1E23" stroke={YRP.ink} strokeWidth={4} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={i} x={666 + Math.cos(a) * 36} y={364 + Math.sin(a) * 36 + 5} textAnchor="middle"
            fontFamily={GOTHIC} fontWeight={700} fontSize={12} fill="#C9CFD4">{i + 1}</text>
        );
      })}
      <circle cx={666} cy={364} r={24} fill="#55545C" stroke={YRP.ink} strokeWidth={4} />
      <rect x={662} y={342} width={8} height={26} rx={3} fill="#2A292F" transform="rotate(60 666 364)" />
      <circle cx={666} cy={458} r={28} fill="#55545C" stroke={YRP.ink} strokeWidth={4} />
      <rect x={663} y={438} width={6} height={18} rx={3} fill="#2A292F" transform="rotate(-30 666 458)" />
      {/* スピーカーの穴 */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={620} y={506 + i * 9} width={92} height={4} rx={2} fill="#141317" />
      ))}
      {/* 足 */}
      <rect x={282} y={600} width={40} height={10} rx={3} fill="#25242A" />
      <rect x={678} y={600} width={40} height={10} rx={3} fill="#25242A" />
    </g>
  );
};

// ゲーム機 (形と構造だけ。ロゴ・刻印なし)。上から見下ろした向き
const Console: React.FC = () => {
  const cream = "#E6DECF";
  const creamShade = "#C9C0AE";
  const maroon = "#7A2632";
  const maroonDark = "#5A1A24";
  return (
    <g>
      {/* 影 */}
      <ellipse cx={515} cy={892} rx={210} ry={22} fill="#000" opacity={0.35} />
      {/* 前面 (えんじ) */}
      <path d="M 336 846 L 694 846 L 694 884 Q 694 890 688 890 L 342 890 Q 336 890 336 884 Z" fill={maroon} stroke={YRP.ink} strokeWidth={5} />
      {/* 前面の拡張端子のすき間 */}
      <rect x={470} y={862} width={92} height={12} rx={3} fill={maroonDark} stroke={YRP.ink} strokeWidth={2.5} />
      {/* 天面 (クリーム) */}
      <path d="M 372 770 L 658 770 L 694 846 L 336 846 Z" fill={cream} stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 344 830 L 686 830" stroke={creamShade} strokeWidth={3} />
      {/* 左右のコントローラー収納 (えんじ) */}
      <path d="M 372 770 L 404 770 L 380 846 L 336 846 Z" fill={maroon} stroke={YRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 626 770 L 658 770 L 694 846 L 650 846 Z" fill={maroon} stroke={YRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 収納されたコントローラー2 の十字キーの気配 */}
      <path d="M 662 810 l 10 0 l 0 -8 l 8 0 l 0 8 l 10 0 l 0 8 l -10 0 l 0 8 l -8 0 l 0 -8 l -10 0 Z" fill="#26201E" transform="translate(-8 0) scale(0.9) translate(70 82)" opacity={0.85} />
      {/* カセットの差しこみ口のまわり (奥) */}
      <path d="M 446 774 L 586 774 L 590 790 L 442 790 Z" fill={maroonDark} stroke={YRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* 取り出しレバー */}
      <rect x={414} y={784} width={20} height={26} rx={4} fill={maroon} stroke={YRP.ink} strokeWidth={3.5} />
      {/* POWER / RESET スライドスイッチ (文字なし) */}
      <rect x={414} y={818} width={52} height={20} rx={5} fill={maroonDark} stroke={YRP.ink} strokeWidth={3.5} />
      <rect x={420} y={821} width={20} height={14} rx={3} fill={maroon} stroke={YRP.ink} strokeWidth={2.5} />
      <rect x={566} y={818} width={52} height={20} rx={5} fill={maroonDark} stroke={YRP.ink} strokeWidth={3.5} />
      <rect x={592} y={821} width={20} height={14} rx={3} fill={maroon} stroke={YRP.ink} strokeWidth={2.5} />
      {/* 電源ランプ */}
      <circle cx={482} cy={828} r={6} fill="#FF4B3A" />
      <circle cx={482} cy={828} r={14} fill="#FF4B3A" opacity={0.3} filter="url(#yglowS)" />
      {/* 差さっているカセット (ラベルは無地) */}
      <path d="M 456 700 L 576 700 L 580 782 L 452 782 Z" fill="#4B4E56" stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={462 + i * 22} y1={705} x2={462 + i * 22} y2={715} stroke="#2E3036" strokeWidth={3} />
      ))}
      <rect x={468} y={720} width={96} height={52} rx={4} fill="#E2D9C3" stroke={YRP.ink} strokeWidth={3} />
      <rect x={468} y={720} width={96} height={12} fill="#B9AE97" opacity={0.6} />
    </g>
  );
};

// 有線コントローラー (形だけ。文字なし)
const Pad: React.FC = () => (
  <g transform="translate(780 940) rotate(-10)">
    <ellipse cx={0} cy={44} rx={92} ry={12} fill="#000" opacity={0.3} />
    <rect x={-88} y={-34} width={176} height={72} rx={8} fill="#7A2632" stroke={YRP.ink} strokeWidth={4.5} />
    <rect x={-80} y={-26} width={160} height={56} rx={5} fill="#C9A85A" stroke={YRP.ink} strokeWidth={3} />
    {/* 十字キー */}
    <path d="M -64 -6 h 12 v -12 h 12 v 12 h 12 v 12 h -12 v 12 h -12 v -12 h -12 Z" fill="#221C1A" />
    {/* セレクト / スタート */}
    <rect x={-16} y={4} width={16} height={8} rx={4} fill="#221C1A" />
    <rect x={6} y={4} width={16} height={8} rx={4} fill="#221C1A" />
    {/* A B */}
    <circle cx={44} cy={6} r={11} fill="#C8322A" stroke={YRP.ink} strokeWidth={3} />
    <circle cx={70} cy={6} r={11} fill="#C8322A" stroke={YRP.ink} strokeWidth={3} />
  </g>
);

// ノート (左ページに書き写し中。右ページには失敗した前回の呪文に×)
const Notebook: React.FC<{ f: number; shown: number; err: number }> = ({ f, shown, err }) => {
  const rows = [...PASS];
  rows[1] = rows[1]; // 2行目以降は正しい
  return (
    <g transform="translate(980 718) skewX(-7) scale(0.92 0.62)">
      <rect x={-6} y={8} width={452} height={160} rx={6} fill="#000" opacity={0.3} />
      <rect x={0} y={0} width={220} height={156} fill="#E9E3D2" stroke={YRP.ink} strokeWidth={4} />
      <rect x={220} y={0} width={220} height={156} fill="#E3DCC9" stroke={YRP.ink} strokeWidth={4} />
      {/* 方眼 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <line x1={4} y1={20 + i * 26} x2={216} y2={20 + i * 26} stroke="#9FB7C9" strokeWidth={1.4} opacity={0.6} />
          <line x1={224} y1={20 + i * 26} x2={436} y2={20 + i * 26} stroke="#9FB7C9" strokeWidth={1.4} opacity={0.6} />
        </g>
      ))}
      <line x1={220} y1={0} x2={220} y2={156} stroke={YRP.ink} strokeWidth={5} />
      {/* 書き写し (ノートの1文字目は「め」) */}
      {rows.map((row, r) =>
        row.split("").map((ch, i) => {
          const idx = r * 5 + i;
          if (idx >= shown) return null;
          const c = r === 0 && i === 0 ? "め" : ch;
          return (
            <text key={idx} x={22 + i * 40} y={40 + r * 34} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={28}
              fill="#3E3D44" transform={`rotate(${(rnd(idx) - 0.5) * 8} ${22 + i * 40} ${40 + r * 34})`}>{c}</text>
          );
        }),
      )}
      {/* 1文字目の赤丸 */}
      {err > 0 && (
        <ellipse cx={22} cy={30} rx={24} ry={26} fill="none" stroke={YRP.red} strokeWidth={5}
          strokeDasharray={160} strokeDashoffset={160 * (1 - err)} />
      )}
      {/* 右ページ: 前回の失敗 */}
      {["たきふこれ", "ぬめにそゆ"].map((row, r) => (
        <text key={r} x={330} y={44 + r * 34} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={26} fill="#5A5960" letterSpacing={12}>{row}</text>
      ))}
      <path d="M 240 22 L 424 92" stroke={YRP.red} strokeWidth={4} opacity={0.75} />
      <path d="M 424 22 L 240 92" stroke={YRP.red} strokeWidth={4} opacity={0.75} />
      <text x={330} y={134} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={22} fill={YRP.red} opacity={0.85}>
        ちがった…
      </text>
    </g>
  );
};

export const SaveA: React.FC<{ f: number }> = ({ f }) => {
  // カメラ: 部屋全体 → テレビの画面とノートの間へ寄る
  const k = easeInOut(seg(f, 8, 104));
  const sc = 1 + k * 0.5;
  const cx = 960 + (860 - 960) * k;
  const cy = 540 + (600 - 540) * k;
  const shown = Math.floor(seg(f, 12, 84) * 20);
  const err = seg(f, 92, 108);
  const hiScreen = seg(f, 86, 100);
  const shock = f >= 96;
  const tagT = seg(f, 104, 116);
  const crtPulse = 0.26 + Math.sin(f * 1.7) * 0.015;
  const mood = useMood();
  const note = mood === "note";
  const plain = isPlain(mood);
  const light = isLightBg(mood);
  const C = light ? ROOM.day : mood === "flat" ? ROOM.flat : ROOM.night;
  if (note) {
    // ゆる落書きノート版: 部屋と子どもは落書き、テレビ・ゲーム機・コントローラー・ノートは精巧なまま
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <YoruDefs seed={11} f={f} />
        <defs>
          <radialGradient id="crtFace" cx="45%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#1C4552" />
            <stop offset="70%" stopColor="#0D2129" />
            <stop offset="100%" stopColor="#050B0E" />
          </radialGradient>
        </defs>
        <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
          <g filter="url(#ywobbleNote)">
            <NoteRoomA f={f} />
          </g>
          <g filter="url(#ywobble)">
            <CrtTv f={f} hi={hiScreen} />
            <path d="M 640 790 Q 700 740 712 640 Q 716 610 740 600" fill="none" stroke="#1A1716" strokeWidth={6} />
            <Console />
            <path d="M 680 812 Q 760 820 750 880 Q 744 912 770 920" fill="none" stroke="#1A1716" strokeWidth={6} />
            <Pad />
          </g>
          <g filter="url(#ywobbleNote)">
            <NoteKidA f={f} shock={shock} />
            <NoteTableA />
          </g>
          <g filter="url(#ywobble)">
            <Notebook f={f} shown={shown} err={err} />
          </g>
          <g filter="url(#ywobbleNote)">
            <NoteArmsA f={f} shock={shock} />
            {/* 書きこみ: 画面 → ノート */}
            <Arrow x1={600} y1={470} x2={960} y2={700} bend={-60} t={seg(f, 24, 44)} />
            <Hand x={930} y={520} text="うつす！" size={34} rot={-8} opacity={seg(f, 36, 46) * (1 - seg(f, 96, 104))} />
          </g>
          {tagT > 0 && (
            <g transform={`translate(800 470) scale(${pop(tagT)})`} opacity={clamp01(tagT * 3)}>
              <rect x={-118} y={-40} width={236} height={70} rx={10} fill={YRP.red} stroke={PEN} strokeWidth={4} />
              <text x={0} y={10} textAnchor="middle" fontFamily={MINCHO} fontWeight={800} fontSize={40} fill={YRP.white}>ぬ？　め？</text>
            </g>
          )}
        </g>
        <FileTag no="01" title="冒険の書は、なぜ消えたのか" f={f} />
        <Caption f={f} text="意味のない ひらがなを、子どもたちは必死に書き写していた" />
      </svg>
    );
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={11} f={f} />
      <defs>
        <radialGradient id="crtFace" cx="45%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#1C4552" />
          <stop offset="70%" stopColor="#0D2129" />
          <stop offset="100%" stopColor="#050B0E" />
        </radialGradient>
        <radialGradient id="crtSpill" cx="427" cy="440" r="980" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={YRP.crt} stopOpacity={0.55} />
          <stop offset="35%" stopColor={YRP.crt} stopOpacity={0.18} />
          <stop offset="100%" stopColor={YRP.crt} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.wallT} />
          <stop offset="100%" stopColor={C.wallB} />
        </linearGradient>
        <linearGradient id="moonG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9EC3E6" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#9EC3E6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={C.bg} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <g filter="url(#ywobble)">
          {/* ===== 壁 ===== */}
          <rect x={-200} y={-200} width={2400} height={910} fill="url(#wallG)" />
          {/* 長押 (なげし) */}
          <rect x={-200} y={150} width={2400} height={22} fill={C.wood} stroke={YRP.ink} strokeWidth={4} />
          <rect x={-200} y={690} width={2400} height={22} fill={C.wood2} stroke={YRP.ink} strokeWidth={4} />
          {/* 柱 */}
          <rect x={186} y={-200} width={30} height={900} fill={C.wood} stroke={YRP.ink} strokeWidth={4} />
          <rect x={1430} y={-200} width={30} height={900} fill={C.wood} stroke={YRP.ink} strokeWidth={4} />
          {/* 窓 + 月明かり */}
          <rect x={1490} y={190} width={330} height={360} fill={C.win} stroke={YRP.ink} strokeWidth={5} />
          {light ? (
            // 昼: 雲
            <g fill="#FDFBF7" stroke={YRP.ink} strokeWidth={3}>
              <path d="M 1520 280 q 10 -30 40 -24 q 16 -26 46 -12 q 30 -6 32 22 q 24 6 14 26 l -132 0 q -18 -4 0 -12 Z" />
              <path d="M 1680 440 q 8 -22 32 -18 q 14 -20 38 -8 q 24 -2 24 18 q 18 6 8 20 l -102 0 q -14 -4 0 -12 Z" />
            </g>
          ) : (
            <g>
              <circle cx={1730} cy={270} r={34} fill="#E9EEF2" opacity={0.85} />
              <circle cx={1730} cy={270} r={70} fill="#E9EEF2" opacity={0.12} filter="url(#yglow)" />
            </g>
          )}
          {[0, 1, 2].map((i) => (
            <line key={i} x1={1490} y1={310 + i * 120} x2={1820} y2={310 + i * 120} stroke={C.bar} strokeWidth={6} />
          ))}
          <line x1={1655} y1={190} x2={1655} y2={550} stroke={C.bar} strokeWidth={8} />
          {/* カーテン */}
          <path d="M 1470 180 Q 1500 360 1478 560 L 1556 560 Q 1572 360 1548 180 Z" fill={C.curtain} stroke={YRP.ink} strokeWidth={4} />
          <path d="M 1840 180 Q 1810 360 1832 560 L 1770 560 Q 1752 360 1780 180 Z" fill={C.curtain} stroke={YRP.ink} strokeWidth={4} />
          {plain ? (
            // 窓の光: ぼかさず、ふちのはっきりした面で
            <polygon points="1556,560 1770,560 1600,1080 1180,1080" fill={light ? "#FFF8E0" : "#9EC3E6"} opacity={light ? 0.55 : 0.08} />
          ) : (
            <polygon points="1556,560 1770,560 1600,1080 1180,1080" fill="url(#moonG)" />
          )}
          {/* 掛け時計 (夜11時40分すぎ) */}
          <g transform="translate(1290 330)">
            <circle r={52} fill="#D8CDB4" stroke={YRP.ink} strokeWidth={5} />
            <circle r={44} fill="#ECE4D0" stroke={YRP.ink} strokeWidth={2} />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={Math.sin(a) * 36} y1={-Math.cos(a) * 36} x2={Math.sin(a) * 41} y2={-Math.cos(a) * 41} stroke={YRP.ink} strokeWidth={i % 3 === 0 ? 4 : 2} />;
            })}
            <line x1={0} y1={0} x2={Math.sin((11.7 / 12) * Math.PI * 2) * 22} y2={-Math.cos((11.7 / 12) * Math.PI * 2) * 22} stroke={YRP.ink} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={0} x2={Math.sin(((40 + f / 30) / 60) * Math.PI * 2) * 34} y2={-Math.cos(((40 + f / 30) / 60) * Math.PI * 2) * 34} stroke={YRP.ink} strokeWidth={4} strokeLinecap="round" />
            <circle r={5} fill={YRP.ink} />
          </g>
          {/* 日めくりではない、月のカレンダー */}
          <g transform="translate(990 262)">
            <line x1={0} y1={-20} x2={0} y2={0} stroke={YRP.ink} strokeWidth={3} />
            <rect x={-80} y={0} width={160} height={200} fill={C.cal} stroke={YRP.ink} strokeWidth={4} />
            <text x={0} y={52} textAnchor="middle" fontFamily={MINCHO} fontWeight={800} fontSize={44} fill="#3E3A36">1986</text>
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 7 }).map((__, c) => (
                <rect key={`${r}${c}`} x={-66 + c * 19} y={76 + r * 22} width={14} height={14} fill={c === 0 ? "#C98F86" : "#9E978A"} opacity={0.55} />
              )),
            )}
          </g>
          {/* カラーボックス (漫画と箱。背表紙は無地) */}
          <g transform="translate(1540 560)">
            <rect x={0} y={0} width={250} height={134} fill={C.box} stroke={YRP.ink} strokeWidth={5} />
            <line x1={0} y1={66} x2={250} y2={66} stroke={YRP.ink} strokeWidth={5} />
            {["#7A4F6A", "#4F6A7A", "#8A7A46", "#5A7A4F", "#7A5A46", "#4F4F7A", "#8A4646", "#4F7A72", "#6A6A6A"].map((c, i) => (
              <rect key={i} x={10 + i * 18} y={10} width={15} height={54} fill={c} stroke={YRP.ink} strokeWidth={2} />
            ))}
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={14 + i * 64} y={84} width={54} height={44} fill="#55585F" stroke={YRP.ink} strokeWidth={3} />
                <rect x={20 + i * 64} y={92} width={42} height={24} fill="#D8CFBA" stroke={YRP.ink} strokeWidth={2} />
              </g>
            ))}
          </g>
          {/* ===== 畳 ===== */}
          <polygon points="-200,712 2120,712 2120,1300 -200,1300" fill={C.tatami} />
          {[300, 980, 1660].map((x, i) => (
            <line key={i} x1={x} y1={712} x2={x + (x - 960) * 0.4} y2={1100} stroke={C.heri} strokeWidth={12} />
          ))}
          <line x1={-200} y1={900} x2={2120} y2={900} stroke={C.heri} strokeWidth={12} />
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={i} x1={-200} y1={724 + i * 12} x2={2120} y2={724 + i * 12} stroke={C.tLine} strokeWidth={2} opacity={0.55} />
          ))}
          {/* ===== テレビ台 ===== */}
          <rect x={222} y={606} width={556} height={18} fill={C.stand} stroke={YRP.ink} strokeWidth={5} />
          <rect x={232} y={622} width={536} height={104} fill={C.stand2} stroke={YRP.ink} strokeWidth={5} />
          <line x1={500} y1={626} x2={500} y2={722} stroke={YRP.ink} strokeWidth={4} />
          <circle cx={480} cy={676} r={6} fill="#B9A06A" stroke={YRP.ink} strokeWidth={2.5} />
          <circle cx={520} cy={676} r={6} fill="#B9A06A" stroke={YRP.ink} strokeWidth={2.5} />
          {mood === "flat" && (
            // 灯りを描かない夜: テレビの光は、ふちのはっきりした面で床へ落とす
            <polygon points="300,560 560,560 1180,1080 -200,1080" fill={YRP.crt} opacity={0.09} />
          )}
          <g filter="url(#yrimCool)">
            <CrtTv f={f} hi={hiScreen} />
          </g>
          {/* ゲーム機とテレビをつなぐ線 */}
          <path d="M 640 790 Q 700 740 712 640 Q 716 610 740 600" fill="none" stroke={C.cable} strokeWidth={6} />
          <g filter="url(#yrimCool)">
            <Console />
          </g>
          <path d="M 680 812 Q 760 820 750 880 Q 744 912 770 920" fill="none" stroke={C.cable} strokeWidth={6} />
          <g filter="url(#yrimCool)">
            <Pad />
          </g>
          {/* ===== 子ども (ちゃぶ台の向こう) ===== */}
          <g filter="url(#yrimCool)">
            <Folk x={1262} y={800} s={1.12} f={f} phase={2} hair="bowl" cloth="#5F84AE" clothDark="#3E5A7E"
              face={shock ? "wide" : "normal"} gaze={shock ? [-3, 5] : [-6, -1]} armL={40} armR={-34} hideLegs cheek still />
          </g>
          {/* パジャマのしま (胴の上に重ねる) */}
          {/* ちゃぶ台 */}
          <ellipse cx={1180} cy={858} rx={330} ry={78} fill={C.cbShadow} />
          <path d="M 850 790 L 850 820 Q 1180 900 1510 820 L 1510 790 Z" fill={C.cbSide} stroke={YRP.ink} strokeWidth={5} />
          <ellipse cx={1180} cy={790} rx={330} ry={78} fill={C.cbTop} stroke={YRP.ink} strokeWidth={5} />
          <ellipse cx={1180} cy={790} rx={300} ry={66} fill="none" stroke={C.cbRing} strokeWidth={3} opacity={0.6} />
          <rect x={900} y={830} width={22} height={70} fill={C.cbLeg} stroke={YRP.ink} strokeWidth={4} />
          <rect x={1440} y={830} width={22} height={70} fill={C.cbLeg} stroke={YRP.ink} strokeWidth={4} />
          {/* 麦茶のコップ */}
          <g transform="translate(1430 742)">
            <ellipse cx={0} cy={38} rx={26} ry={8} fill="#000" opacity={0.3} />
            <path d="M -22 -24 L 22 -24 L 18 36 L -18 36 Z" fill="#B7854A" opacity={0.75} stroke={YRP.ink} strokeWidth={4} />
            <path d="M -22 -24 L 22 -24 L 21 -6 L -21 -6 Z" fill="#E8EEF0" opacity={0.35} />
            <ellipse cx={0} cy={-24} rx={22} ry={6} fill="#D9DEE0" opacity={0.5} stroke={YRP.ink} strokeWidth={3} />
          </g>
          {/* 消しゴムと削りかす */}
          <rect x={1330} y={790} width={40} height={20} rx={4} fill="#EDE6DA" stroke={YRP.ink} strokeWidth={3} transform="rotate(-14 1350 800)" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${1300 + i * 12} ${818 + (i % 2) * 6} q 4 -5 8 0`} stroke="#8E8678" strokeWidth={3} fill="none" />
          ))}
          <Notebook f={f} shown={shown} err={err} />
          {/* 書く手 (ちゃぶ台の上にのせる) */}
          <g transform={`rotate(${shock ? 0 : Math.sin(f / 3) * 2} 1196 628)`}>
            <rect x={1184} y={628} width={24} height={150} rx={12} fill="#5F84AE" stroke={YRP.ink} strokeWidth={4.5} transform="rotate(40 1196 628)" />
            <circle cx={1100} cy={743} r={12} fill={YRP.skin} stroke={YRP.ink} strokeWidth={4} />
            <g transform="translate(1094 748) rotate(-38)">
              <rect x={-4} y={-46} width={9} height={52} fill="#D9B23C" stroke={YRP.ink} strokeWidth={2.5} />
              <path d="M -4 6 L 5 6 L 0.5 16 Z" fill="#E8D7B0" stroke={YRP.ink} strokeWidth={2} />
            </g>
          </g>
          <g>
            <rect x={1316} y={628} width={24} height={111} rx={12} fill="#5F84AE" stroke={YRP.ink} strokeWidth={4.5} transform="rotate(-34 1328 628)" />
            <circle cx={1390} cy={720} r={12} fill={YRP.skin} stroke={YRP.ink} strokeWidth={4} />
          </g>
          {/* 汗 */}
          {shock && (
            <path d={`M 1336 ${490 + seg(f, 96, 140) * 14} q -9 14 0 20 q 9 -6 0 -20 Z`} fill="#9ED8E6" stroke={YRP.ink} strokeWidth={2.5} />
          )}
        </g>
        {/* ブラウン管の光が部屋にこぼれる */}
        {!plain && <rect x={-200} y={-200} width={2400} height={1500} fill="url(#crtSpill)" opacity={crtPulse / 0.26} style={{ mixBlendMode: "screen" }} />}
        <Dust f={f} x={280} y={300} w={900} h={500} n={22} color="#CFF4FF" seed={3} />
        {/* 事件の札 */}
        {tagT > 0 && (
          <g transform={`translate(800 470) scale(${pop(tagT)})`} opacity={clamp01(tagT * 3)}>
            <rect x={-118} y={-40} width={236} height={70} rx={10} fill={YRP.red} stroke={YRP.ink} strokeWidth={5} />
            <text x={0} y={10} textAnchor="middle" fontFamily={MINCHO} fontWeight={800} fontSize={40} fill={YRP.white}>ぬ？　め？</text>
          </g>
        )}
      </g>
      <NightFinish grain={0.07} />
      <FileTag no="01" title="冒険の書は、なぜ消えたのか" f={f} />
      <Caption f={f} text="意味のない ひらがなを、子どもたちは必死に書き写していた" />
    </svg>
  );
};
