// 「人類は、昔から飛ばして観ていた」: 文#184〜#194 (11文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1312〜1322。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  lobbyWall: "#E8DCC0",   // 映画館ロビーの壁
  wainscot: "#C7A368",    // 腰板
  carpet: "#8E4A42",      // ロビーの絨毯
  seatFree: "#DFEBDD",    // 座席表の席 (まだ番号なし)
  eraser: "#E5E0D5",      // 消しゴム
  mapSea: "#D8E6EA",      // 日本地図の海
  mapLand: "#EFE6C8",     // 日本地図の陸
  cinecon: "#E07B3A",     // シネコンの点
  meterWood: "#CBA65A",   // メーターの真鍮風
  night: "#262B34",       // 最暗部の地
  velvet: "#4A3A50",      // 夜ロビーのビロード壁
  filmEdge: "#3A3F4C",    // フィルムの縁
  tatami: "#CBBB72",      // 畳
  tatamiDark: "#B3A35E",
  shoji: "#F6EED8",       // 障子紙
  tvBody: "#8A5A36",      // ブラウン管の木目筐体
  tvScreen: "#BFD8C9",    // ブラウン管の画面
  mikan: "#E9913C",       // みかん
  catFur: "#8B8378",      // 猫
  paperNews: "#EFE9D8",   // 新聞紙
  pencilRed: "#C94A3B",   // 赤鉛筆
  wallShowa: "#E3D2B4",   // 昭和の壁
  bubble: "#F7ECF1",      // 記憶の泡
  memNight: "#4C4258",    // 記憶の中の暗い場内
  memScreen: "#F2E3C2",   // 記憶のスクリーン
  lampWarm: "#F0D9A0",    // 電灯のあかり
  chabudai: "#9A6B3F",    // ちゃぶ台
  skin: "#F4DEC2",        // 手
};
void useCurrentFrame; void Stamp; void QMark; void XMark;
void SaiseiBar; void Fuda3;

// ローカル小道具 -----------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// 決まった見た目の擬似乱数 (Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// 湯呑み (茶の間の旗印)。x,y は底の中心。steam で湯気
const Yunomi: React.FC<{ x: number; y: number; s?: number; f: number; steam?: boolean }> =
  ({ x, y, s = 1, f, steam = true }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -34 0 Q -40 -62 -30 -78 L 30 -78 Q 40 -62 34 0 Z"
        fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -31 -58 Q 0 -50 31 -58" fill="none" stroke={KRP.green} strokeWidth={6} opacity={0.8} />
      <ellipse cx={0} cy={-78} rx={30} ry={7} fill="#D9E4CE" stroke={C.ink} strokeWidth={4} />
      <rect x={-38} y={-4} width={76} height={8} rx={4} fill={C.chabudai} stroke={C.ink} strokeWidth={3.5} />
      {steam && (
        <g fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
          <path d={`M -10 -92 q ${6 + Math.sin(f / 8) * 5} -16 0 -34`} />
          <path d={`M 12 -96 q ${-6 + Math.sin(f / 7 + 2) * 5} -18 2 -38`} />
        </g>
      )}
    </g>
  );

// ブラウン管テレビ (#191 遠景と #193 寄りで同じ1台。close で細部が増える)
const BraunKan: React.FC<{ x: number; y: number; s?: number; f: number; close?: boolean }> =
  ({ x, y, s = 1, f, close = false }) => {
    const flick = 0.82 + 0.18 * Math.sin(f / 4 + Math.sin(f / 9) * 2);
    const scan = ((f * 7) % 160);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* 脚 */}
        <path d="M -150 0 L -176 56 L -154 56 L -132 6 Z" fill={C.tvBody} stroke={C.ink} strokeWidth={5} />
        <path d="M 150 0 L 176 56 L 154 56 L 132 6 Z" fill={C.tvBody} stroke={C.ink} strokeWidth={5} />
        {/* 筐体 */}
        <rect x={-190} y={-300} width={380} height={304} rx={16}
          fill={C.tvBody} stroke={C.ink} strokeWidth={7} />
        <path d="M -170 -282 Q -40 -290 150 -282 M -168 -36 Q 30 -28 168 -36"
          fill="none" stroke="#5F3C22" strokeWidth={3.5} opacity={0.8} />
        {/* 画面 (角の丸いブラウン管) */}
        <rect x={-168} y={-278} width={272} height={240} rx={26}
          fill={C.tvScreen} stroke={C.ink} strokeWidth={6} opacity={flick} />
        <rect x={-168} y={-278 + scan} width={272} height={18} rx={9}
          fill={KRP.white} opacity={0.35 * ((scan < 222) ? 1 : 0)} />
        <path d="M -150 -262 Q -120 -274 -96 -262 L -96 -240 Q -126 -250 -150 -240 Z"
          fill={KRP.white} opacity={0.5} />
        {/* つまみ2つ + スピーカー */}
        <circle cx={144} cy={-236} r={20} fill="#5F3C22" stroke={C.ink} strokeWidth={5} />
        <line x1={144} y1={-252} x2={144} y2={-236} stroke={C.ink} strokeWidth={4} />
        <circle cx={144} cy={-176} r={16} fill="#5F3C22" stroke={C.ink} strokeWidth={5} />
        <line x1={144} y1={-176} x2={156} y2={-166} stroke={C.ink} strokeWidth={4} />
        {[-128, -112, -96].map((ly) => (
          <line key={ly} x1={128} y1={ly} x2={162} y2={ly} stroke={C.ink} strokeWidth={3.5} opacity={0.7} />
        ))}
        {/* うさぎの耳アンテナ */}
        <g stroke={C.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={0} y1={-302} x2={-70} y2={-408} />
          <line x1={0} y1={-302} x2={76} y2={-402} />
          <circle cx={-70} cy={-408} r={6} fill={C.ink} />
          <circle cx={76} cy={-402} r={6} fill={C.ink} />
          <rect x={-22} y={-318} width={44} height={18} rx={6} fill="#5F3C22" />
        </g>
        {close && (
          <g>
            {/* 画面の中: 走査線と番組 (お辞儀する人の上半身) */}
            <g opacity={flick}>
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1={-162} y1={-258 + i * 48} x2={98} y2={-258 + i * 48}
                  stroke={KRP.white} strokeWidth={3} opacity={0.22} />
              ))}
              <g transform={`translate(-32 -74) rotate(${Math.sin(f / 12) * 4})`} opacity={0.85}>
                <path d="M -46 0 Q -44 -58 0 -58 Q 44 -58 46 0 Z" fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
                <circle cx={0} cy={-80} r={26} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
                <circle cx={-8} cy={-84} r={3} fill={C.ink} />
                <circle cx={8} cy={-84} r={3} fill={C.ink} />
              </g>
            </g>
            {/* チャンネルつまみの目盛り */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1={144 + 22 * Math.cos((a * Math.PI) / 180)}
                y1={-236 + 22 * Math.sin((a * Math.PI) / 180)}
                x2={144 + 27 * Math.cos((a * Math.PI) / 180)}
                y2={-236 + 27 * Math.sin((a * Math.PI) / 180)}
                stroke={C.ink} strokeWidth={2.5} opacity={0.7} />
            ))}
          </g>
        )}
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #184 1996年には、全席指定の映画館も現れます。
// 格: 図 / seed 1312
// 絵: 座席表の図。全席に座席番号が印字され、「自由」の文字が消しゴムで消えていく
// どこ: 映画館ロビーの壁。腰板と絨毯のある壁面に座席表が貼ってある
// 演出: 座席表の席に番号が左上から順に印字されていく。右の木看板「自由」を
//       手に持った消しゴムが左から右へ消していく (消しカスが落ちる)
// 動き: カメラがゆっくり座席表へ寄る。番号 seg(4,36)・消し seg(12,38)
const Sg184: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 42)) * 0.05;
  const chartT = easeOut(seg(f, 0, 12));
  const nT = seg(f, 4, 36);        // 番号の印字が進む
  const eT = easeOut(seg(f, 12, 38)); // 消しゴムの進み 0→1
  const rows = 5, cols = 10;
  const signW = 420;
  return (
    <Frame f={f} seed={1312}>
      <g transform={zoomAt(z, 720, 560)}>
        {/* ロビーの壁: 縦板 + 腰板 + 絨毯 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.lobbyWall} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={i * 160 - 40} y1={-20} x2={i * 160 - 40} y2={770}
            stroke={C.ink} strokeWidth={3} opacity={0.12} />
        ))}
        <rect x={-20} y={770} width={W + 40} height={120} fill={C.wainscot} stroke={C.ink} strokeWidth={6} />
        <path d="M -20 806 L 1940 806" stroke="#8A6436" strokeWidth={4} opacity={0.7} />
        <rect x={-20} y={884} width={W + 40} height={220} fill={C.carpet} />
        <line x1={-20} y1={888} x2={1940} y2={888} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={60 + i * 230} cy={980} r={26} fill="none"
            stroke="#B8766C" strokeWidth={5} opacity={0.8} />
        ))}
        {/* 天井の照明の光だまり */}
        <ellipse cx={700} cy={120} rx={560} ry={120} fill={C.lampWarm} opacity={0.18} />

        {/* ===== 主役: 壁の座席表 (木枠の板に画鋲で留めた紙) ===== */}
        <g opacity={chartT} transform={`translate(0 ${(1 - chartT) * 22})`}>
          <rect x={132} y={236} width={1118} height={660} rx={10}
            fill={C.wainscot} stroke={C.ink} strokeWidth={8} />
          <rect x={168} y={270} width={1046} height={592}
            fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          {[[196, 296], [1186, 296], [196, 836], [1186, 836]].map(([px, py], i) => (
            <g key={i}>
              <circle cx={px} cy={py} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
              <circle cx={px - 2} cy={py - 2} r={2.5} fill={KRP.white} opacity={0.8} />
            </g>
          ))}
          {/* スクリーンの弧 */}
          <path d="M 330 352 Q 691 304 1052 352" fill="none" stroke={C.ink} strokeWidth={7} />
          <text x={691} y={332} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={26} fill={KRP.grayDark} letterSpacing={6}>スクリーン</text>
          {/* 座席 5列×10席。番号が順に印字されていく */}
          {Array.from({ length: rows * cols }, (_, i) => {
            const r = Math.floor(i / cols), c = i % cols;
            const sx = 262 + c * 88, sy = 398 + r * 90;
            const stamped = nT * (rows * cols + 6) > i;
            const st = clamp01(nT * (rows * cols + 6) - i);
            return (
              <g key={i}>
                <rect x={sx} y={sy} width={70} height={62} rx={10}
                  fill={stamped ? KRP.blueSoft : C.seatFree} stroke={C.ink} strokeWidth={4.5} />
                <rect x={sx + 6} y={sy + 44} width={58} height={12} rx={6}
                  fill={stamped ? KRP.blue : "#C9D6C6"} stroke={C.ink} strokeWidth={3} />
                {stamped && (
                  <text x={sx + 35} y={sy + 36} textAnchor="middle" fontFamily={FONT}
                    fontWeight={900} fontSize={25} fill={C.ink} opacity={Math.min(st * 2, 1)}>
                    {"ABCDE"[r]}{c + 1}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* ===== 右: 吊り看板「自由」が消される ===== */}
        <g transform={`translate(1560 420) rotate(${Math.sin(f / 9) * 1.1})`}>
          <line x1={-120} y1={-320} x2={-120} y2={-96} stroke={C.ink} strokeWidth={5} />
          <line x1={120} y1={-320} x2={120} y2={-96} stroke={C.ink} strokeWidth={5} />
          <rect x={-signW / 2 + 50} y={-96} width={signW - 100} height={240} rx={12}
            fill={SGP.paper} stroke={C.ink} strokeWidth={8} />
          <path d="M -140 -62 Q 0 -70 140 -62" fill="none" stroke="#C9B88A" strokeWidth={3.5} />
          <text x={0} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={128} fill={C.ink} letterSpacing={10}>自由</text>
          {/* 消された部分 (紙色で左から塗りつぶす) */}
          <rect x={-signW / 2 + 58} y={-56} width={(signW - 116) * eT} height={166}
            fill={SGP.paper} opacity={0.96} />
          {/* かすれ残り */}
          {eT > 0.05 && (
            <g stroke={KRP.grayDark} strokeWidth={3} opacity={0.4}>
              <line x1={-150} y1={-10} x2={-150 + 280 * eT} y2={-16} />
              <line x1={-144} y1={52} x2={-144 + 260 * eT} y2={46} />
            </g>
          )}
          {/* 消しゴムを持つ手 */}
          <g transform={`translate(${-signW / 2 + 58 + (signW - 116) * eT} ${Math.sin(f / 3) * 10})`}>
            <rect x={-18} y={-52} width={84} height={104} rx={14}
              fill={C.eraser} stroke={C.ink} strokeWidth={6} transform="rotate(-8)" />
            <rect x={-18} y={-52} width={84} height={30} rx={10}
              fill={KRP.blueDeep} stroke={C.ink} strokeWidth={5} transform="rotate(-8)" />
            <circle cx={56} cy={34} r={34} fill={C.skin} stroke={C.ink} strokeWidth={6} />
            <path d="M 36 14 Q 56 2 76 16" fill="none" stroke={C.ink} strokeWidth={4} />
            <rect x={76} y={6} width={110} height={58} rx={18}
              fill={KRP.blueDeep} stroke={C.ink} strokeWidth={6} />
          </g>
          {/* 消しカスが落ちる */}
          {eT > 0.1 && [0, 1, 2, 3, 4].map((i) => {
            const fall = ((f * 6 + i * 47) % 150);
            return <ellipse key={i} cx={-130 + 300 * eT + rnd(1, i) * 60 - 30}
              cy={150 + fall} rx={7} ry={4} fill={C.eraser} stroke={C.ink}
              strokeWidth={2.5} opacity={0.85 - fall / 180}
              transform={`rotate(${rnd(2, i) * 80} ${-130 + 300 * eT} ${150 + fall})`} />;
          })}
        </g>
        <TagPlate x={250} y={150} text="1996" size={46} t={seg(f, 2, 10)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #185 は修正3で監督が SaigoChizuScenes.tsx に描き直した (日本地図とシェアのメーター)。
// SaigoIndex の saigoScene がそちらを先に引くので、ここには絵を置かない。
// (motif の並び S_B9B_MOTIFS の "sg_185" はそのまま残す)

// -------------------------------------------------------------------
// #186 「上映時間を調べて、席を取って、最初から最後まで観る」。
// 格: 並 / seed 1314
// 絵: 現代の儀式の三コマ: スマホで時間を調べる→座席を選ぶ→着席して予告を待つ。同じ人物の連続動作
// どこ: 夜のシネコンのロビー。ビロードの壁に電球の列。巨大なフィルムが斜めに走る
// 演出: フィルムの3コマに同じ人物の連続動作 (スマホで調べる→座席パネルで選ぶ→
//       着席して待つ)。コマが左から順にトンと現れ、赤い矢印が次のコマを指す
// 動き: コマ出現 seg(2,14)/(12,24)/(22,34)。スマホの光・パネルの点滅・場内の明滅
const Sg186: React.FC<{ f: number }> = ({ f }) => {
  const komaT = [seg(f, 2, 14), seg(f, 12, 24), seg(f, 22, 34)];
  const komaX = [392, 960, 1528];
  const komaY = [398, 520, 642];
  return (
    <Frame f={f} seed={1314} dark>
      {/* 夜のロビー: ビロード壁 + 電球の列 + 床 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.velvet} />
      <rect x={-20} y={-20} width={W + 40} height={180} fill="#3B2E40" />
      <line x1={-20} y1={158} x2={1940} y2={158} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`translate(${90 + i * 162} 192)`}>
          <circle r={14} fill={C.lampWarm}
            opacity={0.5 + 0.5 * Math.sin(f / 7 + i * 1.3)} />
          <circle r={7} fill={KRP.white} opacity={0.9} />
        </g>
      ))}
      <rect x={-20} y={930} width={W + 40} height={170} fill="#352A3A" />
      <line x1={-20} y1={932} x2={1940} y2={932} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={120 + i * 290} cy={1010} rx={90} ry={16}
          fill={C.lampWarm} opacity={0.08} />
      ))}

      {/* ===== 主役: 斜めに走る大フィルムの3コマ ===== */}
      <g transform="rotate(-6.5 960 520)">
        <rect x={-120} y={250} width={2200} height={560} fill={C.filmEdge}
          stroke={C.ink} strokeWidth={8} />
        {/* パーフォレーション (送り穴) */}
        {Array.from({ length: 26 }, (_, i) => (
          <g key={i}>
            <rect x={-100 + i * 86} y={274} width={34} height={26} rx={6}
              fill={C.velvet} stroke={C.ink} strokeWidth={3} />
            <rect x={-100 + i * 86} y={760} width={34} height={26} rx={6}
              fill={C.velvet} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 3コマ */}
        {komaT.map((t, k) => {
          const p = pop(clamp01(t));
          if (p <= 0) return null;
          return (
            <g key={k} transform={`translate(${komaX[k]} ${komaY[k] - 110}) scale(${p})`}>
              <rect x={-240} y={-190} width={480} height={380} rx={8}
                fill={k === 2 ? "#4A4254" : KRP.cream} stroke={C.ink} strokeWidth={7} />
              {/* --- コマ1: スマホで時間を調べる --- */}
              {k === 0 && (
                <g>
                  <rect x={-240} y={60} width={480} height={130} fill="#E3D8BC" />
                  <line x1={-240} y1={60} x2={240} y2={60} stroke={C.ink} strokeWidth={4} opacity={0.5} />
                  <Person x={-50} y={176} s={0.52} cloth={KRP.green} clothDark="#5E9459"
                    face="normal" gaze={[0.5, 0.7]} pose="hold" f={f} still />
                  <g transform="rotate(14 20 90)">
                    <rect x={4} y={62} width={56} height={92} rx={10}
                      fill={C.ink} stroke={C.ink} strokeWidth={4} />
                    <rect x={10} y={72} width={44} height={66} rx={4} fill={SGP.phoneBlue}
                      opacity={0.85 + 0.15 * Math.sin(f / 5)} />
                    {[0, 1, 2].map((i) => (
                      <line key={i} x1={14} y1={84 + i * 16} x2={50} y2={84 + i * 16}
                        stroke={C.ink} strokeWidth={3} opacity={0.6} />
                    ))}
                  </g>
                  {/* 時計 (時間を調べている印) */}
                  <g transform="translate(130 -84)">
                    <circle r={52} fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
                    <line x1={0} y1={0} x2={0} y2={-34} stroke={C.ink} strokeWidth={5}
                      transform={`rotate(${f * 3})`} />
                    <line x1={0} y1={0} x2={24} y2={10} stroke={C.ink} strokeWidth={4} />
                    {[0, 90, 180, 270].map((a) => (
                      <line key={a} x1={0} y1={-44} x2={0} y2={-36} stroke={C.ink}
                        strokeWidth={4} transform={`rotate(${a})`} />
                    ))}
                  </g>
                </g>
              )}
              {/* --- コマ2: 座席パネルで席を選ぶ --- */}
              {k === 1 && (
                <g>
                  <rect x={-240} y={100} width={480} height={90} fill="#E3D8BC" />
                  <line x1={-240} y1={100} x2={240} y2={100} stroke={C.ink} strokeWidth={4} opacity={0.5} />
                  {/* 発券機のパネル */}
                  <rect x={-50} y={-150} width={270} height={250} rx={12}
                    fill={KRP.grayDark} stroke={C.ink} strokeWidth={6} />
                  <rect x={-30} y={-130} width={230} height={170} rx={8}
                    fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4.5} />
                  {Array.from({ length: 12 }, (_, i) => {
                    const r = Math.floor(i / 4), c = i % 4;
                    const sel = i === 6;
                    return <rect key={i} x={-12 + c * 52} y={-112 + r * 48}
                      width={38} height={34} rx={6}
                      fill={sel ? KRP.orange : KRP.white} stroke={C.ink} strokeWidth={3.5}
                      opacity={sel ? 0.65 + 0.35 * Math.sin(f / 4) : 1} />;
                  })}
                  <Person x={-130} y={128} s={0.52} cloth={KRP.green} clothDark="#5E9459"
                    face="normal" gaze={[0.7, 0.2]} pose="point" pointDir={1} f={f} still />
                </g>
              )}
              {/* --- コマ3: 着席して予告を待つ (暗い場内) --- */}
              {k === 2 && (
                <g>
                  {/* 前方のスクリーンの光 */}
                  <rect x={-240} y={-190} width={480} height={120}
                    fill={C.memScreen} opacity={0.5 + 0.12 * Math.sin(f / 6)} />
                  <path d="M -240 -70 L 240 -70" stroke={C.ink} strokeWidth={4} opacity={0.4} />
                  {/* 座席の列 + 座る人々 (主役は緑の服) */}
                  {[0, 1, 2].map((r) => (
                    <g key={r}>
                      {Array.from({ length: 5 }, (_, c) => {
                        const sx = -190 + c * 95 + r * 18, sy = 10 + r * 78;
                        const hero = r === 1 && c === 2;
                        return (
                          <g key={c}>
                            <rect x={sx - 32} y={sy - 10} width={64} height={70} rx={12}
                              fill="#5A5066" stroke={C.ink} strokeWidth={4} />
                            <circle cx={sx} cy={sy - 26} r={20}
                              fill={hero ? KRP.green : "#6B6076"}
                              stroke={C.ink} strokeWidth={4.5} />
                          </g>
                        );
                      })}
                    </g>
                  ))}
                </g>
              )}
            </g>
          );
        })}
        {/* コマ間の赤矢印 (コマの隙間に収める) */}
        <Arrow x={714} y={komaY[0] - 10} s={0.75} t={seg(f, 10, 16)} />
        <Arrow x={1282} y={komaY[1] - 10} s={0.75} t={seg(f, 20, 26)} />
        {/* 各コマの題札 (コマの左上内側の白帯。イラストの一部) */}
        {komaT.map((t, k) => {
          const texts = ["調べる", "選ぶ", "待つ"];
          if (t < 0.4) return null;
          return (
            <g key={k} transform={`translate(${komaX[k]} ${komaY[k] - 110})`}>
              <rect x={-240} y={-190} width={150} height={52}
                fill={KRP.white} stroke={C.ink} strokeWidth={5} />
              <text x={-165} y={-153} textAnchor="middle" fontFamily={FONT}
                fontWeight={900} fontSize={30} fill={C.ink}>{texts[k]}</text>
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #187 この習慣が日本で多数派になったのは、つまり、このときです。
// 格: 図 / seed 1315
// 絵: 多数派の天秤。「最初から最後まで」側に観客の重りがどどっと移って傾く
// どこ: 板張りの裁定の間。掛け軸風の垂れ布と行灯の光の中に大天秤が立つ
// 演出: 多数派の天秤。左皿「途中から」の客が弧を描いて右皿「最初から最後まで」へ
//       どどっと飛び移り、天秤が右へ傾く
// 動き: 傾き seg(6,38)。飛ぶ客は3人が時間差で放物線。皿は常に水平を保って揺れる
const Sg187: React.FC<{ f: number }> = ({ f }) => {
  const tiltT = easeOut(seg(f, 6, 38));
  const tilt = tiltT * 11;                 // 右が下がる
  const beamL = 560;
  const cx = 960, cy = 420;                // 支点
  const rad = (tilt * Math.PI) / 180;
  const lx = cx - beamL * Math.cos(rad), ly = cy - beamL * Math.sin(rad);
  const rx2 = cx + beamL * Math.cos(rad), ry2 = cy + beamL * Math.sin(rad);
  const panDrop = 190;
  // 飛び移る客3人 (時間差の放物線)
  const jumpers = [0, 1, 2].map((i) => {
    const jt = seg(f, 8 + i * 8, 24 + i * 8);
    const jx = lerp(lx, rx2, jt);
    const jy = lerp(ly, ry2, jt) + panDrop - Math.sin(jt * Math.PI) * 260;
    return { jt, jx, jy };
  });
  return (
    <Frame f={f} seed={1315}>
      {/* 裁定の間: 板壁 + 垂れ布 + 床 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E9DFC4" />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={-20} y1={60 + i * 86} x2={1940} y2={56 + i * 86}
          stroke={C.ink} strokeWidth={3} opacity={0.1} />
      ))}
      <g opacity={0.92}>
        <path d={`M 120 -20 L 120 310 Q 170 330 220 310 L 220 -20 Z`}
          fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
        <path d={`M 1700 -20 L 1700 310 Q 1750 330 1800 310 L 1800 -20 Z`}
          fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
        <path d="M 150 0 Q 158 150 150 290 M 1730 0 Q 1738 150 1730 290"
          fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
      </g>
      <rect x={-20} y={900} width={W + 40} height={200} fill={SGP.stage} />
      <line x1={-20} y1={902} x2={1940} y2={902} stroke={C.ink} strokeWidth={7} />
      <path d="M 100 960 Q 500 952 900 962 M 1000 1010 Q 1400 1002 1860 1012"
        fill="none" stroke={SGP.woodDark} strokeWidth={4} opacity={0.6} />
      {/* 行灯2つ */}
      {[300, 1620].map((ax, i) => (
        <g key={ax} transform={`translate(${ax} 900)`}>
          <rect x={-52} y={-190} width={104} height={190} rx={8}
            fill={SGP.paper} stroke={C.ink} strokeWidth={6} />
          <line x1={0} y1={-190} x2={0} y2={0} stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
          <circle cx={0} cy={-100} r={34 + Math.sin(f / 6 + i * 2) * 3}
            fill={C.lampWarm} opacity={0.6} />
          <rect x={-60} y={-204} width={120} height={16} rx={6}
            fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}

      {/* ===== 主役: 大天秤 ===== */}
      {/* 台座と支柱 */}
      <path d={`M ${cx - 150} 902 L ${cx - 110} 830 L ${cx + 110} 830 L ${cx + 150} 902 Z`}
        fill={SGP.wood} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <rect x={cx - 34} y={cy} width={68} height={830 - cy} fill={SGP.wood}
        stroke={C.ink} strokeWidth={7} />
      <line x1={cx - 12} y1={cy + 30} x2={cx - 12} y2={820} stroke={SGP.woodDark}
        strokeWidth={4} opacity={0.7} />
      {/* 竿 */}
      <g transform={`rotate(${tilt} ${cx} ${cy})`}>
        <rect x={cx - beamL - 20} y={cy - 16} width={(beamL + 20) * 2} height={32} rx={14}
          fill={SGP.wood} stroke={C.ink} strokeWidth={7} />
        <line x1={cx - beamL} y1={cy - 5} x2={cx + beamL} y2={cy - 5}
          stroke={KRP.white} strokeWidth={3.5} opacity={0.5} />
      </g>
      <circle cx={cx} cy={cy} r={26} fill={SGP.woodDark} stroke={C.ink} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={8} fill={C.ink} />
      {/* 左右の皿 (紐3本 + 浅い木皿 + 前面の名札) */}
      {[{ px: lx, py: ly, label: "途中から", n: 2 - Math.floor(tiltT * 2 + 0.01) },
        { px: rx2, py: ry2, label: "最初から最後まで", n: Math.min(3 + Math.floor(tiltT * 3), 6) },
      ].map((pan, k) => {
        const sway = Math.sin(f / 8 + k * 2) * 1.2;
        const pyb = pan.py + panDrop;
        return (
          <g key={k} transform={`rotate(${sway} ${pan.px} ${pan.py})`}>
            {[-120, 0, 120].map((hx) => (
              <line key={hx} x1={pan.px} y1={pan.py} x2={pan.px + hx} y2={pyb - 28}
                stroke={C.ink} strokeWidth={4.5} />
            ))}
            <path d={`M ${pan.px - 165} ${pyb - 28} Q ${pan.px} ${pyb + 26} ${pan.px + 165} ${pyb - 28}
                      L ${pan.px + 150} ${pyb - 2} Q ${pan.px} ${pyb + 46} ${pan.px - 150} ${pyb - 2} Z`}
              fill={SGP.wood} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            {/* 皿の上の客 (PersonMini) */}
            {Array.from({ length: Math.max(pan.n, 0) }, (_, i) => (
              <PersonMini key={i} x={pan.px + (k === 1 ? -115 : -70) + i * 46}
                y={pyb - 18} s={0.42}
                color={k === 1 ? KRP.blueDeep : KRP.gray}
                f={f} phase={i + k * 5} face="dot"
                arms={k === 1 ? "up" : "down"} />
            ))}
            {/* 皿の名札 (前面) */}
            <g transform={`translate(${pan.px} ${pyb + 60})`}>
              <rect x={pan.label.length > 4 ? -200 : -110} y={-26}
                width={pan.label.length > 4 ? 400 : 220} height={56} rx={8}
                fill={KRP.white} stroke={C.ink} strokeWidth={5} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={34} fill={C.ink}>{pan.label}</text>
            </g>
          </g>
        );
      })}
      {/* 飛び移る客たち */}
      {jumpers.map((j, i) =>
        j.jt > 0 && j.jt < 1 ? (
          <g key={i} transform={`rotate(${j.jt * 40 - 20} ${j.jx} ${j.jy})`}>
            <PersonMini x={j.jx} y={j.jy} s={0.42} color={KRP.blueDeep}
              f={f} phase={i * 3} face="smile" arms="up" />
          </g>
        ) : null
      )}
      {/* 移動の軌跡 (点線の弧) */}
      <path d={`M ${lx} ${ly + panDrop - 60} Q ${cx} ${cy - 160} ${rx2} ${ry2 + panDrop - 80}`}
        fill="none" stroke={KRP.orange} strokeWidth={5} strokeDasharray="4 16"
        strokeLinecap="round" opacity={0.75 * seg(f, 8, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #188 たかだか、20年ちょっと前。
// 格: 山 / seed 1316
// 絵: **最強の断定・軸**。`NenpyoEmaki` 全景。数千年の帯の、右端のほんのひとつまみ (20年) だけに色が付く。指でつまめるほどの短さを指先と対比
// どこ: 文机の上。絵巻年表を広げ、右上から大きな手が伸びる
// 演出: 最強の断定。NenpyoEmaki が開き切り、右端のひとつまみ (青) だけに光。
//       大きな手の親指と人差し指がその青い帯を「つまめるほど」の幅でつまむ
// 動き: 巻物が開く seg(0,26)。指のつまみ seg(24,40)。光は装置の pulse
const Sg188: React.FC<{ f: number }> = ({ f }) => {
  const openT = seg(f, 0, 26);
  const pinchT = easeOut(seg(f, 24, 40));
  // 青い帯の中心 (NenpyoEmaki: x=960,s=0.94 → 青帯は右端 13%)
  const es = 0.94;
  const bandX = 960 + (-812 + 1624 * 0.935) * es; // ≈ 1646
  const bandTop = 560 - 170 * es;
  const gap = lerp(170, 54, pinchT); // 指の開き
  return (
    <Frame f={f} seed={1316}>
      {/* 文机の部屋: 壁 + 障子の光 + 机の天板 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallShowa} />
      <g opacity={0.5}>
        <rect x={60} y={40} width={420} height={250} fill={C.shoji} stroke={C.ink} strokeWidth={6} />
        {[165, 270, 375].map((gx) => (
          <line key={gx} x1={gx} y1={40} x2={gx} y2={290} stroke={C.ink} strokeWidth={3.5} />
        ))}
        <line x1={60} y1={165} x2={480} y2={165} stroke={C.ink} strokeWidth={3.5} />
      </g>
      <ellipse cx={270} cy={240} rx={330} ry={160} fill={C.lampWarm} opacity={0.14} />
      <rect x={-20} y={850} width={W + 40} height={250} fill={C.chabudai} />
      <line x1={-20} y1={852} x2={1940} y2={852} stroke={C.ink} strokeWidth={7} />
      <path d="M 100 920 Q 600 912 1100 922 M 800 1000 Q 1300 992 1860 1002"
        fill="none" stroke="#7A5330" strokeWidth={4} opacity={0.6} />
      {/* 机の上の小物: 筆と硯 */}
      <g transform="translate(170 760)">
        <rect x={-60} y={44} width={150} height={44} rx={10} fill={C.ink} opacity={0.88} />
        <ellipse cx={10} cy={58} rx={42} ry={12} fill="#15120F" />
        <g transform="rotate(24 90 20)">
          <rect x={84} y={-60} width={12} height={110} rx={6} fill={SGP.woodDark} stroke={C.ink} strokeWidth={3.5} />
          <path d="M 84 50 L 96 50 L 90 78 Z" fill={C.ink} />
        </g>
      </g>

      {/* ===== 主役: 絵巻年表 (全景) ===== */}
      <NenpyoEmaki f={f} x={960} y={560} s={es} openT={openT}
        highlight={openT >= 1 ? "short" : undefined} />

      {/* 帯の名札 */}
      <TagPlate x={660} y={240} text="数千年" size={42} t={seg(f, 14, 22)} />
      <TagPlate x={1600} y={190} text="20年ちょっと" size={38} t={seg(f, 26, 34)} />

      {/* ===== 右上から伸びる大きな手 (親指と人差し指でつまむ) ===== */}
      {pinchT > 0.01 && (
        <g transform={`translate(${bandX + (1 - pinchT) * 240} ${bandTop - 180 + pinchT * 130})
            rotate(${-14 + pinchT * 10})`} opacity={Math.min(pinchT * 3, 1)}>
          {/* 腕 (画面外から) */}
          <path d="M 60 -70 L 420 -330 L 520 -210 L 160 40 Z"
            fill={KRP.blueDeep} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 110 -100 L 190 -4" stroke="#2F5590" strokeWidth={5} opacity={0.7} />
          {/* 手のひら */}
          <path d="M 40 -78 Q -36 -66 -52 0 Q -58 42 -16 58 L 110 38 Q 150 10 140 -50 Q 120 -92 40 -78 Z"
            fill={C.skin} stroke={C.ink} strokeWidth={6.5} strokeLinejoin="round" />
          {/* 人差し指 (上) と親指 (下) が gap を挟む */}
          <path d={`M -44 -12 Q -120 ${-gap / 2 - 10} -158 ${-gap / 2 + 6}
                    Q -176 ${-gap / 2 + 16} -168 ${-gap / 2 + 34}
                    Q -120 ${-gap / 2 + 40} -40 ${26}`}
            fill={C.skin} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M -20 50 Q -110 ${gap / 2 + 28} -150 ${gap / 2 + 30}
                    Q -170 ${gap / 2 + 28} -164 ${gap / 2 + 10}
                    Q -110 ${gap / 2 - 6} -28 ${22}`}
            fill={C.skin} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 指の節 */}
          <path d="M -80 -22 Q -72 -12 -80 -2 M -70 44 Q -64 52 -70 62"
            fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.6} />
          {/* つまむ瞬間の強調線 */}
          {pinchT > 0.75 && (
            <g stroke={KRP.orange} strokeWidth={6} strokeLinecap="round"
              opacity={(pinchT - 0.75) * 4}>
              <line x1={-196} y1={-gap / 2 - 10} x2={-226} y2={-gap / 2 - 30} />
              <line x1={-192} y1={gap / 2 + 24} x2={-222} y2={gap / 2 + 44} />
              <line x1={-216} y1={8} x2={-252} y2={8} />
            </g>
          )}
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #189 あなたが昔、途中から観た映画の記憶は、間違いではありません。
// 格: 並 / seed 1317
// 絵: 記憶の泡。昔の暗い場内に途中から入った日の情景がやわらかい色で浮かぶ。やさしい絵
// どこ: 夜の自室。スタンドの灯りの下でくつろぐ人の頭上に、大きな記憶の泡
// 演出: 泡の中はあの日の暗い場内。戸が開いて光が差し、途中から入る小さな自分。
//       スクリーンは柔らかく明滅。やさしい色。嘲りゼロ
// 動き: 泡ふわふわ (sin)。戸の光 seg(8,26)。入る人の歩み seg(14,34)。画面の明滅
const Sg189: React.FC<{ f: number }> = ({ f }) => {
  const bob = Math.sin(f / 11) * 6;
  const doorT = easeOut(seg(f, 8, 26));     // 戸の光の広がり
  const walkT = easeOut(seg(f, 14, 34));    // 入ってくる歩み
  const glow = 0.5 + 0.12 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={1317} dark bg="#3A3340">
      {/* 夜の自室: 壁 + 床 + 窓の月 + 電気スタンド */}
      <rect x={-20} y={700} width={W + 40} height={400} fill="#2E2833" />
      <line x1={-20} y1={702} x2={1940} y2={702} stroke={C.ink} strokeWidth={6} opacity={0.8} />
      <g opacity={0.8}>
        <rect x={1560} y={90} width={270} height={330} rx={10}
          fill="#232030" stroke={C.ink} strokeWidth={6} />
        <line x1={1695} y1={90} x2={1695} y2={420} stroke={C.ink} strokeWidth={4} />
        <circle cx={1640} cy={180} r={38} fill={C.memScreen} opacity={0.9} />
        <circle cx={1626} cy={168} r={9} fill="#D8C9A4" />
      </g>
      {/* スタンドの灯り + くつろぐ現在の自分 */}
      <g transform="translate(1380 700)">
        <rect x={-14} y={-200} width={28} height={200} rx={10} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
        <path d="M -70 -200 L 70 -200 L 44 -264 L -44 -264 Z"
          fill={KRP.orange} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={0} cy={-190} r={54 + Math.sin(f / 6) * 4} fill={C.lampWarm} opacity={0.4} />
        <ellipse cx={-180} cy={10} rx={260} ry={60} fill={C.lampWarm} opacity={0.14} />
      </g>
      <ellipse cx={1120} cy={706} rx={110} ry={20} fill={C.ink} opacity={0.3} />
      <Person x={1120} y={700} s={1.08} cloth="#7A6A8E" clothDark="#5C4F6E"
        face="smile" gaze={[-0.6, -0.6]} f={f} />

      {/* ===== 主役: 記憶の泡 (あの日の場内) ===== */}
      <g transform={`translate(0 ${bob})`}>
        {/* 泡へつながる小泡 */}
        <circle cx={1010} cy={420} r={22} fill={C.bubble} stroke={C.ink} strokeWidth={5} opacity={0.9} />
        <circle cx={920} cy={330} r={34} fill={C.bubble} stroke={C.ink} strokeWidth={5} opacity={0.92} />
        {/* 大泡 (雲形) */}
        <path d="M 180 430 Q 60 400 86 300 Q 40 210 150 170 Q 160 70 290 86
                 Q 350 10 470 40 Q 560 -14 650 40 Q 760 10 820 70 Q 930 70 940 170
                 Q 1030 220 980 320 Q 1010 410 890 434 Q 820 490 700 462
                 Q 600 510 500 462 Q 380 500 310 450 Q 230 470 180 430 Z"
          fill={C.bubble} stroke={C.ink} strokeWidth={7} />
        {/* 泡の中身 (clip) */}
        <defs>
          <clipPath id="sg189mem">
            <path d="M 180 430 Q 60 400 86 300 Q 40 210 150 170 Q 160 70 290 86
                     Q 350 10 470 40 Q 560 -14 650 40 Q 760 10 820 70 Q 930 70 940 170
                     Q 1030 220 980 320 Q 1010 410 890 434 Q 820 490 700 462
                     Q 600 510 500 462 Q 380 500 310 450 Q 230 470 180 430 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#sg189mem)">
          <rect x={40} y={-20} width={1000} height={540} fill={C.memNight} />
          {/* スクリーン (柔らかい光) */}
          <rect x={120} y={90} width={360} height={220} rx={8}
            fill={C.memScreen} opacity={glow + 0.3} />
          <rect x={120} y={90} width={360} height={220} rx={8}
            fill="none" stroke={C.ink} strokeWidth={5} />
          <path d="M 150 150 Q 240 120 330 160 Q 400 190 450 160"
            fill="none" stroke="#D9BE8C" strokeWidth={7} opacity={0.7} />
          <circle cx={200} cy={240} r={26} fill="#D9BE8C" opacity={0.55} />
          {/* 客席のシルエット (後頭部の列) */}
          {[0, 1, 2].map((r) => (
            <g key={r}>
              {Array.from({ length: 6 }, (_, c) => (
                <g key={c}>
                  <rect x={120 + c * 120 + r * 34} y={344 + r * 56} width={92} height={60} rx={12}
                    fill="#3B3448" stroke={C.ink} strokeWidth={4} />
                  <circle cx={166 + c * 120 + r * 34} cy={330 + r * 56} r={24}
                    fill="#453D54" stroke={C.ink} strokeWidth={4.5} />
                </g>
              ))}
            </g>
          ))}
          {/* 右の戸が開き、光が差す */}
          <rect x={846} y={160} width={56} height={240} fill="#5C5370" stroke={C.ink} strokeWidth={5} />
          <polygon points={`902,160 902,400 ${902 - 300 * doorT},400 ${902 - 170 * doorT},160`}
            fill={C.lampWarm} opacity={0.34 * doorT} />
          {/* 途中から入る小さな自分 (やわらかい足どり) */}
          {walkT > 0.02 && (
            <g opacity={Math.min(walkT * 3, 1)}>
              <PersonMini x={lerp(880, 690, walkT)} y={408} s={0.52}
                color="#B08BA8" f={f} phase={2} face="smile" arms="down" />
            </g>
          )}
          {/* 空気中の光の粒 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={200 + rnd(41, i) * 700}
              cy={120 + ((rnd(42, i) * 300 + f * 0.6) % 300)}
              r={3 + rnd(43, i) * 3} fill={C.memScreen}
              opacity={0.3 + 0.3 * Math.sin(f / 9 + i * 2)} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #190 こうして、客席の最後の出入り口が、閉まりました。
// 格: 山 / seed 1318
// 絵: **`Danmen` 状態D。リキャップ④・全巻の最暗部**。最後の1灯が消え、出入口の扉がゆっくり閉まり、⇄の矢印が消える。手配書⑥シネコンに御用印
// どこ: 劇場断面図の世界そのもの。全巻の最暗部
// 演出: Danmen 状態D (0灯・戸が閉まり・⇄消滅)。最後の灯の残光がすっと消え、
//       ⇄の残像が薄れ、画面全体がじわりと沈む。右で手配書⑥シネコンに御用の朱印
// 動き: 残光 seg(2,14)で消える。⇄の残像 seg(4,18)で消える。暗転 seg(6,40)。
//       御用印 seg(26,36)
const Sg190: React.FC<{ f: number }> = ({ f }) => {
  const ds = 0.82, dx = 740, dy = 540;
  const ember = 1 - seg(f, 2, 14);     // 最後の灯の残光
  const ghost = 1 - seg(f, 4, 18);     // ⇄の残像
  const sink = seg(f, 6, 40);          // 全体が沈む
  return (
    <Frame f={f} seed={1318} dark bg="#2B2F38">
      {/* 奥の闇 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} />
      <ellipse cx={dx} cy={dy} rx={940} ry={560} fill="#343944" opacity={0.8} />
      {/* 地面の影 */}
      <rect x={-20} y={dy + 300 * ds} width={W + 40} height={400} fill="#1F232B" />
      <line x1={-20} y1={dy + 300 * ds} x2={1940} y2={dy + 300 * ds}
        stroke={C.ink} strokeWidth={5} opacity={0.6} />

      {/* ===== 主役: 断面図 状態D (リキャップ④) ===== */}
      <Danmen f={f} state="D" x={dx} y={dy} s={ds} t={1} />

      {/* 最後の灯 (5灯目) の残光がすっと消える */}
      {ember > 0 && (
        <g opacity={ember}>
          <circle cx={dx + 700 * ds} cy={dy - 138 * ds} r={34 * ember + 8}
            fill={SGP.lampGold} opacity={0.4} />
          <circle cx={dx + 700 * ds} cy={dy - 138 * ds} r={10}
            fill={SGP.lampGold} opacity={0.8} />
        </g>
      )}
      {/* ⇄ の残像が薄れて消える (戸口の上) */}
      {ghost > 0 && (
        <g transform={`translate(${dx + 788 * ds} ${dy + 72 * ds + (1 - ghost) * 16})`}
          stroke={SGP.lampOff} strokeWidth={9} strokeLinecap="round" fill="none"
          opacity={ghost * 0.65}>
          <line x1={-36} y1={-8} x2={30} y2={-8} />
          <path d="M 30 -8 L 18 -19 M 30 -8 L 21 1" />
          <line x1={36} y1={13} x2={-30} y2={13} />
          <path d="M -30 13 L -18 2 M -30 13 L -21 24" />
        </g>
      )}

      {/* ===== 右: 手配書⑥シネコンへ御用 ===== */}
      <g transform={`rotate(${Math.sin(f / 10) * 0.8} 1700 560)`}>
        <line x1={1700} y1={60} x2={1700} y2={356} stroke={KRP.grayDark} strokeWidth={5} />
        <Tehaisho f={f} who={6} x={1700} y={560} s={0.86} t={1}
          goyoT={seg(f, 26, 36)} />
      </g>

      {/* 全体がじわりと沈む (最暗部へ) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40}
        fill="#14171D" opacity={sink * 0.34} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #191 第10章、茶の間は、縛れない。
// 格: 山 / seed 1319
// 絵: 章扉。昭和の茶の間。ちゃぶ台、ブラウン管テレビ、みかんの籠、家族と猫。あたたかい色が戻ってくる
// どこ: 昭和の茶の間の引き。畳・ちゃぶ台・ブラウン管・障子の夕あかり
// 演出: 章扉。最暗部の直後なので、あたたかい色が「戻ってくる」— 画面全体が
//       温色へ明けていく。家族2人+子ども+猫。みかんの籠。テレビは点いている
// 動き: 明けていく seg(0,24)。猫のしっぽ sin。テレビの明滅。湯呑みの湯気
const Sg191: React.FC<{ f: number }> = ({ f }) => {
  const dawn = easeOut(seg(f, 0, 24)); // 温色が戻る
  return (
    <Frame f={f} seed={1319}
      over={<ChapterDoor num={10} title="茶の間は 縛れない" t={seg(f, 10, 22)}
        left={1050} top={210} width={800} />}>
      {/* 壁と鴨居 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallShowa} />
      <rect x={-20} y={150} width={W + 40} height={26} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      {/* 障子 (左) から夕あかり */}
      <g>
        <rect x={40} y={176} width={560} height={520} fill={C.shoji} stroke={C.ink} strokeWidth={7} />
        {[180, 320, 460].map((gx) => (
          <line key={gx} x1={gx} y1={176} x2={gx} y2={696} stroke={C.ink} strokeWidth={4} />
        ))}
        {[306, 436, 566].map((gy) => (
          <line key={gy} x1={40} y1={gy} x2={600} y2={gy} stroke={C.ink} strokeWidth={4} />
        ))}
        <polygon points="600,200 1180,760 980,820 600,560"
          fill={C.lampWarm} opacity={0.16 * dawn} />
      </g>
      {/* 柱時計 (振り子) */}
      <g transform="translate(830 330)">
        <rect x={-64} y={-120} width={128} height={300} rx={12}
          fill={C.tvBody} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={-46} r={48} fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
        <line x1={0} y1={-46} x2={0} y2={-76} stroke={C.ink} strokeWidth={4.5} />
        <line x1={0} y1={-46} x2={20} y2={-34} stroke={C.ink} strokeWidth={4} />
        <line x1={0} y1={6} x2={Math.sin(f / 6) * 26} y2={120} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={Math.sin(f / 6) * 26} cy={128} r={14} fill={KRP.brass} stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 畳 */}
      <rect x={-20} y={700} width={W + 40} height={400} fill={C.tatami} />
      <line x1={-20} y1={702} x2={1940} y2={702} stroke={C.ink} strokeWidth={7} />
      {[520, 1230].map((tx) => (
        <line key={tx} x1={tx} y1={702} x2={tx - 160} y2={1100} stroke={C.tatamiDark} strokeWidth={6} />
      ))}
      <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.5}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-20} y1={760 + i * 60} x2={1940} y2={756 + i * 60} />
        ))}
      </g>

      {/* テレビ (左寄り。共通部品 BraunKan の遠景) */}
      <ellipse cx={330} cy={1006} rx={210} ry={30} fill={C.ink} opacity={0.14} />
      <BraunKan x={330} y={950} s={1.0} f={f} />

      {/* 家族: ちゃぶ台を囲む (足はちゃぶ台の陰) */}
      <Person x={1130} y={940} s={0.92} cloth={KRP.bronze} clothDark="#96603A"
        face="smile" gaze={[-0.7, 0]} f={f} phase={1} />
      <Person x={1560} y={952} s={0.92} cloth={SGP.curtain} clothDark="#7E2730"
        face="joy" f={f} phase={4} />
      {/* 子ども (テレビの近くに座る) */}
      <PersonMini x={700} y={980} s={0.78} color={KRP.green} f={f} phase={2} face="smile" arms="up" />

      {/* ちゃぶ台 (手前。人物の脚を隠す) */}
      <g>
        <ellipse cx={1340} cy={1010} rx={330} ry={76} fill={C.chabudai} stroke={C.ink} strokeWidth={8} />
        <ellipse cx={1340} cy={992} rx={330} ry={76} fill="#B07E4C" stroke={C.ink} strokeWidth={7} />
        <ellipse cx={1340} cy={992} rx={260} ry={54} fill="none" stroke="#7A5330" strokeWidth={3.5} opacity={0.7} />
        {/* みかんの籠 */}
        <g transform="translate(1340 960)">
          <path d="M -90 0 Q -80 44 0 46 Q 80 44 90 0 Z" fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
          <path d="M -70 14 L 70 14 M -82 2 L 82 2" stroke={SGP.woodDark} strokeWidth={3.5} />
          {[-48, -2, 44, -26, 22].map((mx, i) => (
            <g key={i}>
              <circle cx={mx} cy={i > 2 ? -26 : -6} r={24} fill={C.mikan} stroke={C.ink} strokeWidth={4.5} />
              <path d={`M ${mx - 5} ${(i > 2 ? -26 : -6) - 22} q 6 -8 12 -4`}
                fill="none" stroke={KRP.green} strokeWidth={4} />
            </g>
          ))}
        </g>
        <Yunomi x={1120} y={1000} s={0.8} f={f} />
        <Yunomi x={1570} y={1008} s={0.8} f={f + 8} />
      </g>
      {/* 猫 (テレビの横で丸くなる。しっぽだけ動く) */}
      <g transform="translate(620 1056)">
        <ellipse cx={0} cy={0} rx={86} ry={42} fill={C.catFur} stroke={C.ink} strokeWidth={6} />
        <circle cx={-62} cy={-28} r={32} fill={C.catFur} stroke={C.ink} strokeWidth={6} />
        <path d="M -84 -50 L -78 -74 L -62 -56 Z M -44 -54 L -34 -76 L -24 -52 Z"
          fill={C.catFur} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -72 -26 Q -68 -22 -64 -26 M -52 -26 Q -48 -22 -44 -26"
          fill="none" stroke={C.ink} strokeWidth={3.5} />
        <path d={`M 78 6 Q 130 ${-30 + Math.sin(f / 7) * 18} 108 ${-66 + Math.sin(f / 7) * 10}`}
          fill="none" stroke={C.catFur} strokeWidth={16} strokeLinecap="round" />
        <path d={`M 78 6 Q 130 ${-30 + Math.sin(f / 7) * 18} 108 ${-66 + Math.sin(f / 7) * 10}`}
          fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
      </g>
      {/* 冷たい色が明けて温色が戻る */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40}
        fill={C.night} opacity={(1 - dawn) * 0.45} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #192 ところで、この物語には、縛り損ねた場所があります。
// 格: 並 / seed 1320
// 絵: 画面を2つに分割。左=「縛った場所」— 劇場・ホール・映画館が1本の縄でぐるぐるに縛られ「済」の判。
//     右=「縛り損ねた場所」— 夜の暗がりに大きな「？」。左から続く縄はここで足りなくなり、
//     ほどけた端がだらりと垂れる。サーチライトと虫めがねが探している
// どこ: 左は昼の明るい紙の世界 / 右は夜の町はずれ (遠くの家の窓明かりと屋根のアンテナの影だけがヒント)
// 演出: ★答え (#193「テレビの前。茶の間です」) をここで見せない。テレビ・「茶の間」の文字は出さない
//       第10章「茶の間は、縛れない」に合わせて、縄 (縛る) のモチーフで通す
// 動き: 「済」の判が順に押される seg(4,14)/(10,20)/(16,26) / 「？」が出る seg(20,30) /
//       ほどけた縄の端がゆれる / サーチライトが左右に振れる / 虫めがねが探し回る / 窓明かりがまたたく
// ★修正3: 作者「画面を分割して、縛りそこねたはどこか、みたいな演出とイラストの方がいいかも」→ 発想から作り直し

// 縄 (2色のより目)。d は SVG パス
const Nawa: React.FC<{ d: string; w?: number }> = ({ d, w = 14 }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={C.ink} strokeWidth={w + 6} />
    <path d={d} stroke="#C9A066" strokeWidth={w} />
    <path d={d} stroke="#8E6A3E" strokeWidth={w} strokeDasharray={`${w * 0.45} ${w * 0.75}`} opacity={0.85} />
  </g>
);
// 縄の結び目 (ちょう結び)
const Musubi: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p})`}>
      <path d="M 0 0 Q -46 -34 -40 6 Q -30 22 0 0 Z M 0 0 Q 46 -34 40 6 Q 30 22 0 0 Z"
        fill="#C9A066" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -4 4 Q -18 30 -26 44 M 4 4 Q 18 30 24 46" fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <path d="M -4 4 Q -18 30 -26 44 M 4 4 Q 18 30 24 46" fill="none" stroke="#C9A066" strokeWidth={7} strokeLinecap="round" />
      <circle cx={0} cy={2} r={10} fill="#B08850" stroke={C.ink} strokeWidth={4.5} />
    </g>
  );
};
// 朱の「済」の判 (SVG 版。Stamp は HTML なので使わない)
const SumiHan: React.FC<{ x: number; y: number; t: number; rot?: number }> = ({ x, y, t, rot = -8 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const sc = 1 + (1 - easeOut(tt)) * 0.9; // 上からドンと押す
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, tt * 2)}>
      <rect x={-38} y={-38} width={76} height={76} rx={10} fill={KRP.white} opacity={0.85} />
      <rect x={-38} y={-38} width={76} height={76} rx={10} fill="none" stroke={SGP.shuin} strokeWidth={6} />
      <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={SGP.shuin}>済</text>
    </g>
  );
};

const Sg192: React.FC<{ f: number }> = ({ f }) => {
  const hanT = [seg(f, 4, 14), seg(f, 10, 20), seg(f, 16, 26)];
  const qT = seg(f, 20, 30);
  const sway = Math.sin(f / 11) * 16; // ほどけた端のゆれ
  const spotX = 1420 + Math.sin(f / 19) * 300;
  const lensX = 1560 + Math.sin(f / 14 + 1) * 160;
  const lensY = 752 + Math.sin(f / 9) * 10;
  const gy = 720; // 左の地面
  // 左の縄: 3つの建物の胴を通る1本 (建物のあいだで少したるむ) → 分割線を越えて右へ → 足りなくて垂れる
  const mainRope =
    `M -30 560 C 40 572 80 600 120 604 L 400 604 C 420 640 430 642 440 640 L 650 640` +
    ` C 664 660 676 662 690 660 L 900 660 C 960 662 1000 600 1060 590` +
    ` C 1110 582 1150 596 1166 630 C 1180 664 ${1172 + sway * 0.4} 700 ${1164 + sway} 744`;
  const endX = 1164 + sway, endY = 744;
  return (
    <Frame f={f} seed={1320}>
      {/* 分割のすき間 (紙の色) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.cream} />
      {/* ===== 左のコマ: 縛った場所 (昼) ===== */}
      <polygon points="-10,-10 1000,-10 948,1090 -10,1090" fill="#EFE4C8" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <defs>
        <clipPath id="c192L"><polygon points="-10,-10 1000,-10 948,1090 -10,1090" /></clipPath>
        <clipPath id="c192R"><polygon points="1026,-10 1930,-10 1930,1090 974,1090" /></clipPath>
        <linearGradient id="g192night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C2233" />
          <stop offset="1" stopColor="#2E3752" />
        </linearGradient>
      </defs>
      <g clipPath="url(#c192L)">
        {/* 昼の空と雲・地面 */}
        <rect x={-10} y={-10} width={1020} height={gy + 10} fill="#D6E6EE" />
        <g transform={`translate(${220 + (f * 0.4) % 60} 210)`} opacity={0.9}>
          <path d="M -90 16 q 6 -30 40 -26 q 10 -30 50 -22 q 26 -18 44 8 q 34 -4 34 22 z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        </g>
        <rect x={-10} y={gy} width={1020} height={400} fill={SGP.stage} />
        <line x1={-10} y1={gy} x2={1010} y2={gy} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-10} y1={gy + 40 + i * 50} x2={1010} y2={gy + 40 + i * 50} stroke={SGP.woodDark} strokeWidth={3} opacity={0.35} />
        ))}

        {/* --- 劇場 (芝居小屋: 櫓・瓦屋根・のぼり) --- */}
        <g transform={`translate(260 ${gy})`}>
          <ellipse cx={0} cy={6} rx={170} ry={16} fill={C.ink} opacity={0.15} />
          {/* のぼり (文字なし) */}
          {[-150, 150].map((nx, i) => (
            <g key={nx}>
              <line x1={nx} y1={0} x2={nx} y2={-250} stroke={C.ink} strokeWidth={5} />
              <path d={`M ${nx} -244 L ${nx + (i ? -30 : 30)} -244 L ${nx + (i ? -30 : 30) + Math.sin(f / 7 + i) * 4} -100 L ${nx} -100 Z`}
                fill={[KRP.red, KRP.blue][i]} stroke={C.ink} strokeWidth={4} />
            </g>
          ))}
          <rect x={-125} y={-170} width={250} height={170} fill={SGP.wood} stroke={C.ink} strokeWidth={6} />
          <rect x={-125} y={-170} width={250} height={34} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {[-80, -40, 0, 40, 80].map((cx) => (
            <rect key={cx} x={cx - 12} y={-160} width={24} height={16} rx={3} fill={KRP.red} opacity={0.8} />
          ))}
          <path d="M -40 0 L -40 -78 L 40 -78 L 40 0" fill={SGP.curtain} stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={-78} x2={0} y2={-20} stroke={C.ink} strokeWidth={3} opacity={0.6} />
          <path d="M -150 -168 L 0 -236 L 150 -168 Z" fill="#5A5048" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {[-100, -50, 0, 50, 100].map((rx) => (
            <line key={rx} x1={rx * 0.15} y1={-230} x2={rx} y2={-172} stroke="#3E3630" strokeWidth={3} />
          ))}
          {/* 櫓 */}
          <rect x={-34} y={-290} width={68} height={50} fill={SGP.wood} stroke={C.ink} strokeWidth={5} />
          <path d="M -48 -288 L 0 -318 L 48 -288 Z" fill="#5A5048" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          {/* 縦の縄 (屋根ごと縛る)+結び目 */}
          <Nawa d="M 0 0 L 0 -236 L 0 -322" w={11} />
          <Musubi x={0} y={-326} s={0.9} t={hanT[0] * 1.4} />
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>劇場</text>
        </g>

        {/* --- ホール (柱とペディメント) --- */}
        <g transform={`translate(545 ${gy})`}>
          <ellipse cx={0} cy={6} rx={130} ry={14} fill={C.ink} opacity={0.15} />
          <rect x={-115} y={-24} width={230} height={24} fill="#E6DCC6" stroke={C.ink} strokeWidth={5} />
          <rect x={-100} y={-200} width={200} height={176} fill="#F2EBDB" stroke={C.ink} strokeWidth={6} />
          {[-72, -24, 24, 72].map((cx) => (
            <g key={cx}>
              <rect x={cx - 13} y={-190} width={26} height={166} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
              <line x1={cx} y1={-184} x2={cx} y2={-30} stroke={C.ink} strokeWidth={2} opacity={0.35} />
            </g>
          ))}
          <path d="M -118 -200 L 0 -268 L 118 -200 Z" fill="#E6DCC6" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={-224} r={13} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          <Nawa d="M 0 0 L 0 -268 L 0 -284" w={11} />
          <Musubi x={0} y={-288} s={0.85} t={hanT[1] * 1.4} />
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>ホール</text>
        </g>

        {/* --- 映画館 (マーキーと電球・縦看板。文字なし) --- */}
        <g transform={`translate(800 ${gy})`}>
          <ellipse cx={0} cy={6} rx={120} ry={14} fill={C.ink} opacity={0.15} />
          <rect x={-100} y={-250} width={200} height={250} fill={SGP.curtain} stroke={C.ink} strokeWidth={6} />
          <rect x={-100} y={-250} width={200} height={20} fill="#7E2730" stroke={C.ink} strokeWidth={4} />
          <rect x={-118} y={-150} width={236} height={50} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={-104 + i * 23} cy={-142} r={5}
              fill={((i + Math.floor(f / 5)) % 3) === 0 ? SGP.lampGold : KRP.grayDark} stroke={C.ink} strokeWidth={2} />
          ))}
          <rect x={-60} y={-90} width={120} height={90} fill="#2E3440" stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={-90} x2={0} y2={0} stroke={C.ink} strokeWidth={3} />
          <rect x={56} y={-236} width={34} height={80} rx={4} fill={SGP.lampGold} stroke={C.ink} strokeWidth={4} />
          <Nawa d="M 0 0 L 0 -250 L 0 -266" w={11} />
          <Musubi x={0} y={-270} s={0.85} t={hanT[2] * 1.4} />
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>映画館</text>
        </g>
      </g>

      {/* ===== 右のコマ: 縛り損ねた場所 (夜) ===== */}
      <polygon points="1026,-10 1930,-10 1930,1090 974,1090" fill="url(#g192night)" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <g clipPath="url(#c192R)">
        {/* 星 */}
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={1060 + rnd(81, i) * 840} cy={40 + rnd(82, i) * 380} r={1.6 + rnd(83, i) * 2}
            fill={KRP.white} opacity={0.35 + 0.35 * Math.sin(f / 8 + i * 1.3)} />
        ))}
        {/* サーチライトの光 (右上から地面を探す) */}
        <path d={`M 1890 -20 L 1940 -20 L ${spotX + 150} 720 L ${spotX - 150} 720 Z`} fill={C.lampWarm} opacity={0.13} />
        <ellipse cx={spotX} cy={720} rx={170} ry={34} fill={C.lampWarm} opacity={0.2} />
        {/* 遠くの町はずれ (屋根の影・窓明かり・アンテナの影がほのかに) */}
        <path d="M 980 720 L 980 660 L 1060 640 L 1140 668 L 1220 650 L 1320 672 L 1420 646 L 1540 668 L 1640 640 L 1760 664 L 1930 650 L 1930 720 Z"
          fill="#151A27" />
        {[{ x: 1500, w: 110, h: 64 }, { x: 1660, w: 90, h: 52 }, { x: 1790, w: 120, h: 70 }].map((hs, i) => (
          <g key={i}>
            <rect x={hs.x - hs.w / 2} y={720 - hs.h} width={hs.w} height={hs.h} fill="#1A2030" />
            <path d={`M ${hs.x - hs.w / 2 - 12} ${720 - hs.h} L ${hs.x} ${720 - hs.h - 40} L ${hs.x + hs.w / 2 + 12} ${720 - hs.h} Z`} fill="#1A2030" />
            {/* 窓明かり (ふっと揺れる) */}
            <rect x={hs.x - 12} y={720 - hs.h + 16} width={24} height={20} rx={2}
              fill={C.lampWarm} opacity={i === 0 ? 0.75 + Math.sin(f / 4) * 0.12 : 0.35 + Math.sin(f / 6 + i) * 0.1} />
          </g>
        ))}
        {/* 屋根のアンテナの影 (ヒントはこれだけ) */}
        <g stroke="#1A2030" strokeWidth={4} strokeLinecap="round">
          <line x1={1520} y1={616} x2={1520} y2={560} />
          <line x1={1494} y1={566} x2={1546} y2={560} />
          <line x1={1500} y1={578} x2={1540} y2={574} />
          <line x1={1504} y1={590} x2={1536} y2={587} />
        </g>
        <rect x={980} y={720} width={960} height={380} fill="#232A3E" />
        <line x1={980} y1={720} x2={1940} y2={720} stroke={C.ink} strokeWidth={5} opacity={0.6} />
        {/* 大きな「？」 */}
        <QMark x={1500} y={480} s={2.6} f={f} t={qT} color={KRP.yellow} />
        {/* 虫めがね (探し回る) */}
        <g transform={`translate(${lensX} ${lensY}) rotate(${-24 + Math.sin(f / 10) * 6})`}>
          <circle cx={0} cy={0} r={66} fill={KRP.white} opacity={0.14} />
          <circle cx={0} cy={0} r={66} fill="none" stroke={C.ink} strokeWidth={14} />
          <circle cx={0} cy={0} r={66} fill="none" stroke={KRP.brass} strokeWidth={7} />
          <path d="M -34 -30 Q -20 -46 2 -48" fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          <rect x={60} y={-12} width={96} height={24} rx={12} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5}
            transform="rotate(35 60 0)" />
        </g>
      </g>

      {/* ===== 1本の縄: 左の3つを縛り、分割を越えて右で足りなくなる ===== */}
      <Nawa d={mainRope} w={14} />
      {/* ほどけた端 (ばらけた繊維) */}
      <g transform={`translate(${endX} ${endY}) rotate(${sway * 0.5})`}>
        {[-14, -6, 2, 10, 16].map((dx, i) => (
          <path key={i} d={`M 0 0 Q ${dx * 0.6} 18 ${dx + Math.sin(f / 6 + i) * 4} ${30 + (i % 2) * 10}`}
            fill="none" stroke="#C9A066" strokeWidth={4.5} strokeLinecap="round" />
        ))}
        {[-14, 2, 16].map((dx, i) => (
          <path key={`k${i}`} d={`M 0 0 Q ${dx * 0.6} 18 ${dx + Math.sin(f / 6 + i * 2) * 4} ${30 + (i % 2) * 10}`}
            fill="none" stroke="#8E6A3E" strokeWidth={2.5} strokeLinecap="round" />
        ))}
      </g>
      {/* 「済」の判 (縛った建物に順に押される) */}
      <SumiHan x={360} y={480} t={hanT[0]} />
      <SumiHan x={640} y={500} t={hanT[1]} rot={6} />
      <SumiHan x={890} y={440} t={hanT[2]} rot={-4} />

      {/* 見出しの札 */}
      <TagPlate x={560} y={110} text="縛った場所" size={44} t={seg(f, 2, 10)} rot={-1.5} />
      <TagPlate x={1460} y={110} text="縛り損ねた場所" size={44} t={seg(f, 14, 24)} rot={1.5} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #193 テレビの前。茶の間です。
// 格: 並 / seed 1321
// 絵: ブラウン管テレビに寄る。画面の光、上に乗ったレースの敷物と置物。生活の気配
// どこ: 夕方の茶の間。#191 と同じ1台のテレビに正面からぐっと寄る (close)
// 演出: 画面の光が部屋の主光源。上にレースの敷物と招き猫・一輪挿し。
//       左にカーテンの端、右に茶箪笥の端、手前の畳にみかんと湯呑み
// 動き: カメラが画面へ寄る。画面のちらつき・カーテンの揺れ・湯気
const Sg193: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 42)) * 0.07;
  const glow = 0.75 + 0.25 * Math.sin(f / 4 + Math.sin(f / 9) * 2);
  const sway = Math.sin(f / 10) * 8;
  const inT = easeOut(seg(f, 0, 10));
  return (
    <Frame f={f} seed={1321} dark>
      <g transform={zoomAt(z, 900, 620)} opacity={inT}>
        {/* 夕方の壁と鴨居 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallShowa} />
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} opacity={0.42} />
        <rect x={-20} y={70} width={W + 40} height={34} fill="#6B4A2C" stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={140 + i * 240} cy={330 + rnd(1321, i) * 260}
            r={5} fill={C.ink} opacity={0.08} />
        ))}
        {/* 左: カーテンの端 (揺れる) */}
        <g>
          <path d={`M -20 56 L 300 56 Q ${296 + sway} 420 ${268 + sway} 760
                    Q ${190 + sway * 0.6} 1000 130 1140 L -20 1140 Z`}
            fill="#A4525E" stroke={C.ink} strokeWidth={7} />
          <path d={`M 110 80 Q ${122 + sway} 480 ${86 + sway * 0.7} 1020`}
            fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.45} />
          <path d={`M 210 80 Q ${222 + sway} 460 ${182 + sway * 0.8} 960`}
            fill="none" stroke={C.ink} strokeWidth={4.5} opacity={0.45} />
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={40 + (i % 2) * 110} cy={200 + i * 150}
              r={13} fill={KRP.white} opacity={0.3} />
          ))}
          <rect x={-20} y={44} width={330} height={26} rx={10}
            fill="#6B4A2C" stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 右: 茶箪笥の端 (ガラス戸と急須) */}
        <g>
          <rect x={1560} y={240} width={400 } height={900} fill="#6B4A2C" stroke={C.ink} strokeWidth={7} />
          <rect x={1596} y={280} width={330} height={300} rx={6} fill="#4A3524" stroke={C.ink} strokeWidth={5} />
          <rect x={1612} y={296} width={140} height={268} fill="#9FB8C4" opacity={0.3} />
          <line x1={1766} y1={296} x2={1766} y2={564} stroke={C.ink} strokeWidth={4} opacity={0.7} />
          <g transform="translate(1700 544)">
            <ellipse cx={0} cy={-20} rx={44} ry={30} fill="#B8683C" stroke={C.ink} strokeWidth={4.5} />
            <path d="M -44 -28 L -66 -40 L -62 -24 Z" fill="#B8683C" stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={-52} r={8} fill="#B8683C" stroke={C.ink} strokeWidth={4} />
          </g>
          <rect x={1596} y={620} width={330} height={120} rx={6} fill="#57402B" stroke={C.ink} strokeWidth={5} />
          <circle cx={1760} cy={680} r={10} fill={C.ink} opacity={0.8} />
          <rect x={1596} y={780} width={330} height={120} rx={6} fill="#57402B" stroke={C.ink} strokeWidth={5} />
          <circle cx={1760} cy={840} r={10} fill={C.ink} opacity={0.8} />
        </g>
        {/* 畳 */}
        <rect x={-20} y={960} width={W + 40} height={200} fill={C.tatami} />
        <line x1={-20} y1={964} x2={1940} y2={964} stroke={C.ink} strokeWidth={7} />
        <line x1={620} y1={964} x2={560} y2={1140} stroke={C.tatamiDark} strokeWidth={6} />
        <line x1={1300} y1={964} x2={1370} y2={1140} stroke={C.tatamiDark} strokeWidth={6} />
        {/* 画面の光が畳と壁に落ちる */}
        <polygon points="560,340 1240,340 1520,1150 300,1150"
          fill={C.lampWarm} opacity={0.14 * glow} />
        <ellipse cx={905} cy={1050} rx={520} ry={90} fill={C.lampWarm} opacity={0.3 * glow} />
        {/* テレビ本体 (#191 と同じ1台・close で細部) */}
        <BraunKan x={900} y={1000} s={2.3} f={f} close />
        {/* 上: レースの敷物 + 招き猫 + 一輪挿し */}
        <g transform="translate(900 312)">
          <ellipse cx={-10} cy={0} rx={240} ry={20} fill={KRP.white} stroke={C.ink} strokeWidth={4} opacity={0.95} />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={-240 + 10 + i * 42} cy={Math.abs(i - 5.5) * 2.4}
              r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3} opacity={0.9} />
          ))}
        </g>
        <g transform={`translate(760 312) rotate(${Math.sin(f / 14) * 1.5})`}>
          <path d="M -40 0 Q -48 -70 0 -82 Q 48 -70 40 0 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M -30 -66 L -42 -96 L -18 -80 Z M 30 -66 L 42 -96 L 18 -80 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <circle cx={-12} cy={-58} r={3.5} fill={C.ink} />
          <circle cx={12} cy={-58} r={3.5} fill={C.ink} />
          <path d="M -6 -48 Q 0 -43 6 -48" fill="none" stroke={C.ink} strokeWidth={3} />
          <path d={`M 34 -56 q 20 ${-14 + Math.sin(f / 8) * 4} 10 -34`}
            fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={0} cy={-18} rx={16} ry={12} fill={C.mikan} stroke={C.ink} strokeWidth={3.5} opacity={0.9} />
        </g>
        <g transform="translate(1056 312)">
          <path d="M -14 0 Q -20 -40 -6 -52 L 6 -52 Q 20 -40 14 0 Z"
            fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4.5} />
          <path d={`M 0 -52 Q ${4 + Math.sin(f / 12) * 3} -78 -4 -96`}
            fill="none" stroke={KRP.green} strokeWidth={4.5} />
          <circle cx={-4} cy={-100} r={10} fill={C.carpet} stroke={C.ink} strokeWidth={3.5} />
        </g>
        {/* 手前の生活の気配: みかん2つ + 湯呑み */}
        <g transform="translate(360 1082)">
          <ellipse cx={0} cy={0} rx={34} ry={28} fill={C.mikan} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={64} cy={10} rx={30} ry={25} fill={C.mikan} stroke={C.ink} strokeWidth={5} />
          <path d="M -4 -26 l 8 -8 M 60 -14 l 8 -8" stroke={KRP.green} strokeWidth={5} strokeLinecap="round" />
        </g>
        <Yunomi x={1460} y={1096} s={1.05} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #194 放送は、たしかに時間を支配しました。
// 格: 図 / seed 1322
// 絵: 新聞のテレビ欄の格子。時間の目盛りがきっちり区切り、番組が隙間なく詰まる
// どこ: ちゃぶ台の真上から見下ろす。木目の天板に広げた新聞のテレビ欄
// 演出: 時間の目盛り (目盛線のみ・数字なし) がきっちり区切り、番組のマス
//       (うにょうにょ線) が上から順に隙間なく詰まっていく。老眼鏡と
//       湯呑みの輪じみ、赤鉛筆の手がひとマスに丸を付ける
// 動き: マスの流し込み seg(4,36)・赤丸 seg(28,42)・湯気・ゆっくり寄る
const Sg194: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + easeOut(seg(f, 0, 42)) * 0.05;
  const fillT = seg(f, 4, 36);          // 番組マスが詰まっていく
  const circT = easeOut(seg(f, 28, 42)); // 赤鉛筆の丸
  const cols = 5, rowH = 94;
  const gx = 430, gy = 300, gw = 1030, gh = rowH * 7; // 格子
  const colW = gw / cols;
  const cells: { c: number; r: number; span: number }[] = [];
  {
    // 各チャンネル列を上から隙間なく埋める (span はマスの縦の長さ)
    for (let c = 0; c < cols; c++) {
      let r = 0, i = 0;
      while (r < 7) {
        const span = Math.min(7 - r, 1 + Math.floor(rnd(1322, c * 13 + i) * 2.4));
        cells.push({ c, r, span });
        r += span; i++;
      }
    }
  }
  const total = cells.length;
  return (
    <Frame f={f} seed={1322}>
      <g transform={zoomAt(z, 945, 560)}>
        {/* ちゃぶ台の天板 (真上から) */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.chabudai} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -20 ${90 + i * 190} Q 500 ${60 + i * 190 + rnd(94, i) * 50}
                1100 ${100 + i * 190} T 1940 ${80 + i * 190}`}
            fill="none" stroke="#7A5230" strokeWidth={5} opacity={0.5} />
        ))}
        <ellipse cx={330} cy={170} rx={46} ry={26} fill="none" stroke="#6B4423" strokeWidth={4} opacity={0.6} />
        {/* 新聞紙 (少し傾けて広げる) */}
        <g transform="translate(945 560) rotate(-1.6)">
          <rect x={-760} y={-470} width={1520} height={940}
            fill={C.paperNews} stroke={C.ink} strokeWidth={7} />
          <line x1={0} y1={-470} x2={0} y2={470} stroke={C.ink} strokeWidth={3} opacity={0.25} />
          <rect x={-760} y={-470} width={1520} height={940} fill="none"
            stroke="#B9AE8E" strokeWidth={2} opacity={0.8} transform="translate(5 6)" />
          {/* 左ページ: 記事のうにょうにょ (テレビ欄の脇) */}
          <g stroke={C.ink} strokeWidth={3.5} opacity={0.35} fill="none">
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d={`M -716 ${-392 + i * 36} q 40 ${-6 + rnd(55, i) * 12} 86 0
                    t 86 0`} />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <path key={`b${i}`} d={`M -716 ${6 + i * 30} q 46 ${-5 + rnd(66, i) * 10} 92 0 t 92 0`} />
            ))}
            <rect x={-716} y={-230} width={188} height={190} strokeWidth={4} opacity={0.9} />
            <path d="M -690 -110 Q -622 -210 -554 -96" strokeWidth={4} />
            <circle cx={-660} cy={-166} r={22} strokeWidth={4} />
          </g>
          {/* ヘッダー帯「テレビ欄」 */}
          <g transform="translate(-480 -470)">
            <rect x={0} y={28} width={212} height={64} fill={C.ink} opacity={0.88} />
            <text x={106} y={74} textAnchor="middle" fill={C.paperNews}
              fontFamily={FONT} fontSize={40} fontWeight={700}>テレビ欄</text>
          </g>
        </g>
        {/* テレビ欄の格子 (回転なしで正面に。紙の上に乗る) */}
        <g>
          {/* チャンネル見出し行 (局名はうにょうにょ) */}
          {Array.from({ length: cols }, (_, c) => (
            <g key={c}>
              <rect x={gx + c * colW} y={gy - 64} width={colW} height={64}
                fill="#DDD2B4" stroke={C.ink} strokeWidth={4} />
              <path d={`M ${gx + c * colW + 36} ${gy - 32} q 30 ${-6 + rnd(77, c) * 12} 60 0 t 60 0`}
                fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
            </g>
          ))}
          {/* 左の時間の物差し: 目盛線だけ (数字は描かない) */}
          <rect x={gx - 70} y={gy - 64} width={70} height={gh + 64}
            fill="#CEC2A0" stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={gx - 54} y1={gy + i * rowH} x2={gx - 6} y2={gy + i * rowH}
              stroke={C.ink} strokeWidth={5} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`s${i}`} x1={gx - 38} y1={gy + 47 + i * 47} x2={gx - 6} y2={gy + 47 + i * 47}
              stroke={C.ink} strokeWidth={3} opacity={0.6} />
          ))}
          {/* 外枠と横罫 */}
          <rect x={gx} y={gy} width={gw} height={gh} fill={KRP.white}
            stroke={C.ink} strokeWidth={6} opacity={0.65} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={gx} y1={gy + (i + 1) * rowH} x2={gx + gw} y2={gy + (i + 1) * rowH}
              stroke={C.ink} strokeWidth={2.5} opacity={0.3} />
          ))}
          {/* 番組マスが上から隙間なく詰まる */}
          {cells.map((cell, i) => {
            const t = clamp01(fillT * total - i * 0.55);
            if (t <= 0) return null;
            const x = gx + cell.c * colW, y = gy + cell.r * rowH;
            const h = cell.span * rowH;
            return (
              <g key={i} opacity={Math.min(1, t * 2)}>
                <rect x={x + 4} y={y + 4} width={colW - 8} height={(h - 8) * Math.min(1, t)}
                  fill={i % 3 === 0 ? "#EAE0C2" : KRP.white} stroke={C.ink} strokeWidth={4} />
                {t > 0.5 && Array.from({ length: Math.min(cell.span * 2, 5) }, (_, k) => (
                  <path key={k} d={`M ${x + 22} ${y + 30 + k * 32}
                        q 36 ${-5 + rnd(88, i * 7 + k) * 10} 72 0 t 72 0`}
                    fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.55} />
                ))}
              </g>
            );
          })}
          {/* 赤鉛筆の丸 (観たい番組に印) + 手 */}
          <g opacity={circT > 0 ? 1 : 0}>
            <ellipse cx={gx + 2.5 * colW + colW / 2} cy={gy + 2.5 * rowH} rx={colW * 0.46} ry={rowH * 0.78}
              fill="none" stroke={C.pencilRed} strokeWidth={9} strokeLinecap="round"
              strokeDasharray={620} strokeDashoffset={620 * (1 - circT)}
              transform={`rotate(-6 ${gx + 2.5 * colW + colW / 2} ${gy + 2.5 * rowH})`} />
            <g transform={`translate(${gx + 2.5 * colW + colW / 2 + Math.cos(circT * 5.6) * colW * 0.46}
                  ${gy + 2.5 * rowH + Math.sin(circT * 5.6) * rowH * 0.78}) rotate(32)`}>
              <rect x={-8} y={-108} width={16} height={92} rx={5}
                fill={C.pencilRed} stroke={C.ink} strokeWidth={4} />
              <polygon points="-8,-16 8,-16 0,8" fill="#E8C9A0" stroke={C.ink} strokeWidth={4} />
              <circle cx={0} cy={2} r={4} fill={C.pencilRed} />
              <path d="M -10 -104 Q 0 -168 44 -186 Q 96 -200 120 -168 Q 128 -140 96 -128 L 10 -108 Z"
                fill={C.skin} stroke={C.ink} strokeWidth={5} />
            </g>
          </g>
        </g>
        {/* 生活の気配: 老眼鏡 + 湯呑みの輪じみ + 湯呑み (真上から) */}
        <g transform="translate(250 870) rotate(-14)" fill="none" stroke={C.ink} strokeWidth={6}>
          <circle cx={-56} cy={0} r={48} />
          <circle cx={56} cy={0} r={48} />
          <path d="M -10 -6 Q 0 -18 10 -6 M -104 -6 q -40 -10 -58 -40 M 104 -6 q 40 -10 58 -40" />
        </g>
        <circle cx={1700} cy={260} r={52} fill="none" stroke="#B9A06E" strokeWidth={7} opacity={0.7} />
        <g transform="translate(1710 900)">
          <circle cx={0} cy={0} r={74} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <circle cx={0} cy={0} r={54} fill="#B9D9B4" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={-16} cy={-14} rx={20} ry={10} fill={KRP.white} opacity={0.6}
            transform={`rotate(${f * 1.4} 0 0)`} />
          <g fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={0.6}>
            <path d={`M -18 -66 q ${8 + Math.sin(f / 8) * 6} -22 -2 -44`} />
            <path d={`M 20 -70 q ${-8 + Math.sin(f / 7 + 1.5) * 6} -24 2 -46`} />
          </g>
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_184: (f) => <Sg184 f={f} />,
  sg_186: (f) => <Sg186 f={f} />,
  sg_187: (f) => <Sg187 f={f} />,
  sg_188: (f) => <Sg188 f={f} />,
  sg_189: (f) => <Sg189 f={f} />,
  sg_190: (f) => <Sg190 f={f} />,
  sg_191: (f) => <Sg191 f={f} />,
  sg_192: (f) => <Sg192 f={f} />,
  sg_193: (f) => <Sg193 f={f} />,
  sg_194: (f) => <Sg194 f={f} />,
};

export const S_B9B_MOTIFS: string[] = [
  "sg_184", // #184
  "sg_185", // #185
  "sg_186", // #186
  "sg_187", // #187
  "sg_188", // #188
  "sg_189", // #189
  "sg_190", // #190
  "sg_191", // #191
  "sg_192", // #192
  "sg_193", // #193
  "sg_194", // #194
];

export const saigoB9bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
