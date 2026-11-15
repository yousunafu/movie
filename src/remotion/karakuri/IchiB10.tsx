// 「『2位』は、120年前に発明された」: 第10章「池が地球サイズになった。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#188〜#199 (12文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は必ず ib10_ で始める。WobbleDefs の seed はこのファイルでは 1087〜1098 を使う。
// 設計書: docs/briefs/IchiB10.md (1文ごとの「格」と絵の中身を決めてから描く)
//
// ★絵の「格」(制作ガイド §7 第3層) ★2026-11-06 改定: 配分は 山3 : 並3 : 図4
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = 図と札が主役。ただし第16条の床を敷く (50〜120行)
//
// ★制作ガイド第16条「作り込みの床の法 (素肌禁止)」2026-11-06 追加
//   素の方眼 (GridPaper) + クリーム地だけの絵は禁止。方眼を使うなら「何かの紙」の上に clip する。
//   地面や壁が素のベタ1色で広く残っていたら未完成。小物・質感を一段敷く。
//   ただし主役の明快さが最優先。背景は彩度低め・線細め・opacity 控えめ。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。
//   seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間を写すため)。
//   札・章扉タイトルに読点「、」は使わない (札の読点の法)。間は半角スペース。
//
// ★連番で同じ物を映すときは絵を複製せず、1つの部品に phase prop を持たせて切り替える。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow,
} from "./IchiShared";
import { lerp, zoomAt, rnd, GridPaper } from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色
// ===================================================================
const C = {
  ink: "#3A3A34",
  night: "#2A3347",
  nightDeep: "#1B2233",
  bldg: "#3C4759",
  bldgDark: "#2C3545",
  screen: "#DCEAF2",
  screenDark: "#9FB6C4",
  glow: "#F3E3A8",
  wall: "#CFC4AC",
  wallDark: "#B0A48B",
  wood: "#B98A50",
  woodDark: "#8A6436",
  washi: "#F4ECD8",
  cork: "#C9A878",
  gold: "#D9A93E",
  silver: "#AEB4BC",
  gym: "#D9B87C",
  gymDark: "#A8853F",
  stone: "#B8AE99",
  stoneDark: "#8E8673",
  moss: "#6E8F5A",
  hill: "#7FA05E",
  hillDark: "#5E7C44",
  ocean: "#3E7FA8",
  land: "#8FB06A",
  soil: "#A08A62",
  coin: "#D9C06A",
  coinDark: "#A8923E",
  red: "#C0392B",
  curtain: "#A8333A",
};

// ===================================================================
// ローカル部品 (この章のあいだ使い回す)
// ===================================================================

/** 夜の街 — 空のグラデ・星・ビル群シルエット・窓明かり・鉄塔 */
const NightCity: React.FC<{
  f: number; id: string; groundY?: number;
}> = ({ f, id, groundY = 880 }) => {
  const far = Array.from({ length: 16 }, (_, i) => {
    const w = 70 + rnd(i * 3 + 1) * 90;
    const h = 150 + rnd(i * 5 + 2) * 240;
    return { x: -40 + i * 126 + rnd(i * 7) * 24, w, h };
  });
  const near = Array.from({ length: 9 }, (_, i) => {
    const w = 130 + rnd(i * 11 + 4) * 120;
    const h = 220 + rnd(i * 13 + 5) * 300;
    return { x: -60 + i * 232 + rnd(i * 17) * 40, w, h };
  });
  return (
    <g>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.nightDeep} />
          <stop offset="62%" stopColor={C.night} />
          <stop offset="100%" stopColor="#3E4A60" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={groundY + 10} fill={`url(#sky${id})`} />
      {/* 星 */}
      <g fill={C.glow}>
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={`st${i}`} cx={rnd(i * 23 + 9) * W} cy={rnd(i * 29 + 3) * 330 + 20}
            r={1.6 + rnd(i * 31) * 2}
            opacity={0.35 + 0.45 * Math.abs(Math.sin((f + i * 9) / 17))} />
        ))}
      </g>
      {/* 遠いビル */}
      <g fill={C.bldgDark} opacity={0.85}>
        {far.map((b, i) => (
          <rect key={`fb${i}`} x={b.x} y={groundY - b.h} width={b.w} height={b.h} />
        ))}
      </g>
      {/* 手前のビル + 窓 */}
      {near.map((b, i) => {
        const cols = Math.max(2, Math.floor(b.w / 42));
        const rows = Math.max(3, Math.floor(b.h / 54));
        return (
          <g key={`nb${i}`}>
            <rect x={b.x} y={groundY - b.h} width={b.w} height={b.h}
              fill={C.bldg} stroke={C.nightDeep} strokeWidth={3} />
            <g>
              {Array.from({ length: cols * rows }, (_, k) => {
                const cx2 = b.x + 14 + (k % cols) * ((b.w - 28) / cols);
                const cy2 = groundY - b.h + 20 + Math.floor(k / cols) * ((b.h - 34) / rows);
                const on = rnd(i * 97 + k * 7) > 0.42;
                const fl = rnd(i * 53 + k * 3) > 0.9
                  ? 0.3 + 0.7 * Math.abs(Math.sin((f + k * 11) / 9)) : 1;
                if (!on) return null;
                return (
                  <rect key={`w${k}`} x={cx2} y={cy2} width={16} height={22} rx={2}
                    fill={C.glow} opacity={0.72 * fl} />
                );
              })}
            </g>
          </g>
        );
      })}
      {/* 鉄塔 */}
      <g stroke={C.nightDeep} strokeWidth={5} fill="none" opacity={0.9}>
        <polyline points={`1680,${groundY} 1730,${groundY - 330} 1780,${groundY}`} />
        <line x1={1700} y1={groundY - 130} x2={1760} y2={groundY - 130} />
        <line x1={1712} y1={groundY - 220} x2={1748} y2={groundY - 220} />
      </g>
      <circle cx={1730} cy={groundY - 344} r={8} fill={KRP.red}
        opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 10))} />
      {/* 地面 */}
      <rect x={0} y={groundY} width={W} height={H - groundY} fill="#30384A" />
      <line x1={0} y1={groundY} x2={W} y2={groundY} stroke={C.nightDeep} strokeWidth={6} />
    </g>
  );
};

/** 壁 + 木枠の掲示パネル + 紙 (方眼は紙にclip) + 画鋲。図の「床」 */
const KeijiBoard: React.FC<{
  f: number; id: string; x?: number; y?: number; w?: number; h?: number;
}> = ({ f, id, x = 240, y = 50, w = 1440, h = 620 }) => (
  <g>
    {/* 壁 */}
    <rect x={0} y={0} width={W} height={H} fill={C.wall} />
    <g stroke={C.wallDark} strokeWidth={3} opacity={0.4}>
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`wl${i}`} x1={0} y1={120 + i * 150} x2={W} y2={120 + i * 150} />
      ))}
    </g>
    <rect x={0} y={900} width={W} height={26} fill={C.woodDark} opacity={0.55} />
    {/* 棚 (壁ぎわの質感) */}
    <g opacity={0.5}>
      <rect x={60} y={760} width={150} height={16} fill={C.woodDark} />
      <rect x={78} y={712} width={30} height={48} fill={C.stoneDark} opacity={0.7} />
      <rect x={118} y={724} width={26} height={36} fill={C.wood} opacity={0.8} />
      <rect x={1760} y={760} width={130} height={16} fill={C.woodDark} />
      <path d={`M1826,760 C1790,714 1806,676 1826,660 C1848,676 1862,714 1826,760 Z`}
        fill={C.moss} opacity={0.7} />
    </g>
    {/* パネルの影 */}
    <rect x={x + 14} y={y + 16} width={w} height={h} rx={8} fill={C.wallDark} opacity={0.45} />
    {/* 木枠 */}
    <rect x={x} y={y} width={w} height={h} rx={8}
      fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20}
      fill={C.cork} stroke={C.woodDark} strokeWidth={3} />
    {/* 紙 */}
    <rect x={x + 30} y={y + 30} width={w - 60} height={h - 60}
      fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
    <clipPath id={`kb${id}`}>
      <rect x={x + 30} y={y + 30} width={w - 60} height={h - 60} />
    </clipPath>
    <g clipPath={`url(#kb${id})`} opacity={0.75}>
      <GridPaper tombo={false} pitch={56} />
    </g>
    {/* 画鋲 */}
    {([[x + 52, y + 52], [x + w - 52, y + 52], [x + 52, y + h - 52], [x + w - 52, y + h - 52]] as Array<[number, number]>)
      .map(([px, py], i) => (
        <g key={`pin${i}`}>
          <circle cx={px} cy={py} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={px - 4} cy={py - 4} r={4} fill={KRP.white} opacity={0.8} />
        </g>
      ))}
    <g opacity={0.25 + 0.1 * Math.sin(f / 19)}>
      <rect x={x + 30} y={y + 30} width={w - 60} height={h - 60} fill={KRP.white} />
    </g>
  </g>
);

/** コインの積み山 */
const CoinStack: React.FC<{
  x: number; baseY: number; n: number; t?: number; s?: number;
}> = ({ x, baseY, n, t = 1, s = 1 }) => {
  const shown = Math.max(0, Math.round(n * clamp01(t)));
  return (
    <g>
      {Array.from({ length: shown }, (_, i) => {
        const cy = baseY - i * 30 * s;
        return (
          <g key={`c${i}`}>
            <ellipse cx={x} cy={cy} rx={52 * s} ry={17 * s}
              fill={C.coinDark} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={x} cy={cy - 9 * s} rx={52 * s} ry={17 * s}
              fill={C.coin} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={x} cy={cy - 9 * s} rx={26 * s} ry={8 * s}
              fill="none" stroke={C.coinDark} strokeWidth={3} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

/** 椅子 (背に札を掛けられる)
 *  ghost=true で「あったかもしれない2脚目の席」= 中身のない点線の輪郭になる。
 *  ★憲法第15条 (部品還元の法): #193 で2脚目を別に描き起こさず、同じ椅子に引数で足した。
 *    既定値は変えていないので、既存の呼び出し (#194 など) の絵は1ミリも変わらない。 */
const Chair: React.FC<{
  x: number; y: number; s?: number; tilt?: number; ghost?: boolean;
}> = ({ x, y, s = 1, tilt = 0, ghost = false }) => {
  // 幻の椅子は「木が無い」= 塗りを抜いて破線にする。実物と見まちがえないよう薄くする
  const fw = ghost ? "none" : C.wood;
  const fd = ghost ? "none" : C.woodDark;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}
      strokeDasharray={ghost ? "15 13" : undefined} opacity={ghost ? 0.6 : 1}>
      {/* 後ろ脚 + 背もたれの支柱 */}
      <rect x={-66} y={-300} width={16} height={300} rx={6}
        fill={fd} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={50} y={-300} width={16} height={300} rx={6}
        fill={fd} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 背もたれの横板 */}
      <rect x={-70} y={-286} width={140} height={30} rx={8}
        fill={fw} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-70} y={-226} width={140} height={26} rx={8}
        fill={fw} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 座面 */}
      <polygon points="-86,-120 86,-120 108,-86 -108,-86"
        fill={fw} stroke={KRP.ink} strokeWidth={5} />
      <polygon points="-108,-86 108,-86 108,-72 -108,-72"
        fill={fd} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 前脚 */}
      <rect x={-100} y={-76} width={18} height={78} rx={7}
        fill={fw} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={82} y={-76} width={18} height={78} rx={7}
        fill={fw} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 木目 (幻の椅子には木目が無い = 一目で実物と区別できる) */}
      {!ghost && (
        <g stroke={C.woodDark} strokeWidth={3} opacity={0.6}>
          <line x1={-70} y1={-108} x2={70} y2={-108} />
          <line x1={-50} y1={-278} x2={50} y2={-278} />
        </g>
      )}
    </g>
  );
};

/** 大きなスマホ (枠・画面・ホームの光)。children は画面の中に clip される */
const BigPhone: React.FC<{
  f: number; cid: string; x: number; y: number; w: number; h: number;
  lit?: number; children?: React.ReactNode;
}> = ({ f, cid, x, y, w, h, lit = 1, children }) => {
  const sx = x + 26;
  const sy = y + 54;
  const sw = w - 52;
  const sh = h - 104;
  const L = clamp01(lit);
  return (
    <g>
      {/* 本体 */}
      <rect x={x + 10} y={y + 14} width={w} height={h} rx={44}
        fill={C.nightDeep} opacity={0.5} />
      <rect x={x} y={y} width={w} height={h} rx={44}
        fill="#4A5566" stroke={KRP.ink} strokeWidth={7} />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={38}
        fill="#616E80" stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
      {/* 画面 */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={14}
        fill={C.nightDeep} stroke={KRP.ink} strokeWidth={5} />
      <rect x={sx} y={sy} width={sw} height={sh} rx={14}
        fill={C.screen} opacity={0.14 + 0.78 * L} />
      <clipPath id={`ph${cid}`}>
        <rect x={sx} y={sy} width={sw} height={sh} rx={14} />
      </clipPath>
      <g clipPath={`url(#ph${cid})`} opacity={L}>{children}</g>
      {/* 画面の光の反射 */}
      <g clipPath={`url(#ph${cid})`} opacity={0.14 * L}>
        <polygon points={`${sx},${sy + sh * 0.2} ${sx + sw},${sy} ${sx + sw},${sy + sh * 0.1} ${sx},${sy + sh * 0.34}`}
          fill={KRP.white} />
      </g>
      <rect x={sx} y={sy} width={sw} height={sh} rx={14}
        fill="none" stroke={KRP.ink} strokeWidth={5} />
      {/* 受話口 */}
      <rect x={x + w / 2 - 54} y={y + 28} width={108} height={12} rx={6}
        fill={C.nightDeep} opacity={0.8} />
      {/* ホームの光 */}
      <ellipse cx={x + w / 2} cy={y + h - 28} rx={46} ry={11}
        fill={C.glow} opacity={(0.3 + 0.3 * Math.abs(Math.sin(f / 14))) * L}
        stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

/** 地球 (大陸・緯線・f でゆっくり回る経線) */
const EarthBall: React.FC<{
  cx: number; cy: number; r: number; f: number; cid: string; glow?: boolean;
}> = ({ cx, cy, r, f, cid, glow = false }) => (
  <g>
    {glow && (
      <circle cx={cx} cy={cy} r={r * 1.26} fill="#7FC6E8"
        opacity={0.16 + 0.1 * Math.abs(Math.sin(f / 15))} />
    )}
    <circle cx={cx} cy={cy} r={r} fill={C.ocean} stroke={KRP.ink} strokeWidth={6} />
    <clipPath id={`eb${cid}`}><circle cx={cx} cy={cy} r={r - 3} /></clipPath>
    <g clipPath={`url(#eb${cid})`}>
      {/* 大陸 */}
      <g fill={C.land} stroke={C.hillDark} strokeWidth={4} opacity={0.95}>
        <ellipse cx={cx - r * 0.38} cy={cy - r * 0.34} rx={r * 0.34} ry={r * 0.24}
          transform={`rotate(-18 ${cx - r * 0.38} ${cy - r * 0.34})`} />
        <ellipse cx={cx - r * 0.3} cy={cy + r * 0.34} rx={r * 0.2} ry={r * 0.3} />
        <ellipse cx={cx + r * 0.34} cy={cy - r * 0.12} rx={r * 0.3} ry={r * 0.26} />
        <ellipse cx={cx + r * 0.44} cy={cy + r * 0.46} rx={r * 0.18} ry={r * 0.13} />
      </g>
      {/* 緯線 */}
      <g fill="none" stroke={KRP.white} strokeWidth={2.5} opacity={0.4}>
        {[-0.62, -0.32, 0, 0.32, 0.62].map((k, i) => (
          <ellipse key={`la${i}`} cx={cx} cy={cy + r * k}
            rx={r * Math.sqrt(Math.max(0.02, 1 - k * k))} ry={r * 0.06} />
        ))}
      </g>
      {/* 経線 (回る) */}
      <g fill="none" stroke={KRP.white} strokeWidth={2.5} opacity={0.42}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={`lo${i}`} cx={cx} cy={cy}
            rx={Math.abs(Math.cos(f / 26 + (i * Math.PI) / 4)) * r} ry={r} />
        ))}
      </g>
    </g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={KRP.ink} strokeWidth={6} />
    <ellipse cx={cx - r * 0.36} cy={cy - r * 0.46} rx={r * 0.26} ry={r * 0.14}
      fill={KRP.white} opacity={0.17} transform={`rotate(-24 ${cx - r * 0.36} ${cy - r * 0.46})`} />
  </g>
);

/** 蛙 (井戸の底。f で喉がふくらむ) */
const Kaeru: React.FC<{
  x: number; y: number; s?: number; f: number; look?: number;
}> = ({ x, y, s = 1, f, look = 0 }) => {
  const puff = 1 + 0.12 * Math.abs(Math.sin(f / 8));
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${look})`}>
      {/* 後ろ足 */}
      <ellipse cx={-44} cy={-6} rx={20} ry={11} fill={C.moss}
        stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={44} cy={-6} rx={20} ry={11} fill={C.moss}
        stroke={KRP.ink} strokeWidth={4} />
      {/* 胴 */}
      <ellipse cx={0} cy={-34} rx={46} ry={32} fill={C.hill}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 喉 */}
      <ellipse cx={0} cy={-18} rx={24 * puff} ry={13 * puff}
        fill="#CFE0A8" stroke={KRP.ink} strokeWidth={4} />
      {/* 頭 */}
      <ellipse cx={0} cy={-62} rx={36} ry={25} fill={C.hill}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 目 */}
      {([-18, 18] as number[]).map((ex, i) => (
        <g key={`ey${i}`}>
          <circle cx={ex} cy={-80} r={13} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={ex} cy={-82} r={5.5} fill={KRP.ink} />
        </g>
      ))}
      {/* 口 */}
      <path d="M-16,-52 Q0,-44 16,-52" fill="none" stroke={KRP.ink}
        strokeWidth={4} strokeLinecap="round" />
      {/* 背の斑 */}
      <g fill={C.hillDark} opacity={0.55}>
        <ellipse cx={-20} cy={-44} rx={8} ry={5} />
        <ellipse cx={18} cy={-40} rx={7} ry={4.5} />
      </g>
    </g>
  );
};

/** 和風の井戸 (石積み・木枠・屋根・滑車・桶) + 断面。phase 1=水たまり / 2=底が地球 */
const Ido: React.FC<{
  f: number; phase: 1 | 2; cx?: number; mouthY?: number; botY?: number;
  rx?: number; cid: string;
}> = ({ f, phase, cx = 960, mouthY = 460, botY = 850, rx = 230, cid }) => {
  const wall = 62;
  const inX = cx - rx;
  const inW = rx * 2;
  return (
    <g>
      <defs>
        <linearGradient id={`sh${cid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B2A26" />
          <stop offset="70%" stopColor="#171713" />
          <stop offset="100%" stopColor="#0F0F0C" />
        </linearGradient>
      </defs>
      {/* 井戸の中 (断面の暗がり) */}
      <rect x={inX} y={mouthY} width={inW} height={botY - mouthY + 24}
        fill={`url(#sh${cid})`} />
      {/* 内壁の石の輪 (奥へ細くなる) */}
      <g fill="none" stroke="#4A463C" strokeWidth={4} opacity={0.6}>
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10;
          const yy = lerp(mouthY + 30, botY - 20, t);
          const rr = rx * (1 - 0.3 * t);
          return <ellipse key={`ir${i}`} cx={cx} cy={yy} rx={rr} ry={rr * 0.2} />;
        })}
      </g>
      {/* 石積みの側壁 (左右) */}
      {([-1, 1] as number[]).map((sd) => (
        <g key={`sw${sd}`}>
          <rect x={sd < 0 ? inX - wall : cx + rx} y={mouthY - 10}
            width={wall} height={botY - mouthY + 40}
            fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.stoneDark} strokeWidth={3} opacity={0.75}>
            {Array.from({ length: 8 }, (_, i) => {
              const yy = mouthY + 14 + i * ((botY - mouthY) / 8);
              const bx = sd < 0 ? inX - wall : cx + rx;
              return (
                <g key={`sm${i}`}>
                  <line x1={bx} y1={yy} x2={bx + wall} y2={yy} />
                  <line x1={bx + (i % 2 ? wall * 0.35 : wall * 0.65)} y1={yy}
                    x2={bx + (i % 2 ? wall * 0.35 : wall * 0.65)}
                    y2={yy + (botY - mouthY) / 8} />
                </g>
              );
            })}
          </g>
        </g>
      ))}
      {/* 底 */}
      {phase === 1 ? (
        <g>
          <ellipse cx={cx} cy={botY} rx={rx * 0.74} ry={rx * 0.17}
            fill="#3B3A33" stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={cx} cy={botY - 4} rx={rx * 0.42} ry={rx * 0.1}
            fill="#5E7F8E" stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          <g fill="none" stroke={KRP.white} strokeWidth={2.5} opacity={0.45}>
            {[0, 1, 2].map((i) => (
              <ellipse key={`rp${i}`} cx={cx} cy={botY - 4}
                rx={rx * (0.12 + 0.1 * ((f / 13 + i * 0.33) % 1))}
                ry={rx * (0.03 + 0.024 * ((f / 13 + i * 0.33) % 1))}
                opacity={0.5 * (1 - ((f / 13 + i * 0.33) % 1))} />
            ))}
          </g>
        </g>
      ) : (
        <g>
          <EarthBall cx={cx} cy={botY - 10} r={rx * 0.62} f={f} cid={cid} glow />
          {/* 底の地球の表面の小さな人影 */}
          <g fill={C.nightDeep} opacity={0.6}>
            {Array.from({ length: 22 }, (_, i) => {
              const a = (i / 22) * Math.PI * 2 + 0.3;
              const rr = rx * 0.62 * (0.3 + 0.62 * rnd(i * 13 + 1));
              return (
                <circle key={`hd${i}`} cx={cx + Math.cos(a) * rr}
                  cy={botY - 10 + Math.sin(a) * rr * 0.9} r={4.2} />
              );
            })}
          </g>
        </g>
      )}
      {/* 井桁 (口の木枠) */}
      <ellipse cx={cx} cy={mouthY} rx={rx} ry={rx * 0.24}
        fill="none" stroke={KRP.ink} strokeWidth={6} />
      <g>
        <rect x={inX - wall - 16} y={mouthY - 34} width={inW + wall * 2 + 32} height={30} rx={8}
          fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.woodDark} strokeWidth={3} opacity={0.6}>
          <line x1={inX - wall} y1={mouthY - 20} x2={cx + rx + wall} y2={mouthY - 20} />
        </g>
      </g>
      {/* 屋根 + 柱 */}
      <rect x={inX - wall - 4} y={mouthY - 330} width={22} height={300}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={cx + rx + wall - 18} y={mouthY - 330} width={22} height={300}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <polygon
        points={`${cx},${mouthY - 410} ${cx + rx + wall + 60},${mouthY - 326} ${cx - rx - wall - 60},${mouthY - 326}`}
        fill="#6E675A" stroke={KRP.ink} strokeWidth={5} />
      <g stroke="#4D483E" strokeWidth={3} opacity={0.7}>
        {[-0.6, -0.3, 0.3, 0.6].map((k, i) => (
          <line key={`rf${i}`} x1={cx} y1={mouthY - 404}
            x2={cx + (rx + wall + 54) * k} y2={mouthY - 328} />
        ))}
      </g>
      {/* 滑車 + 縄 + 桶 */}
      <rect x={inX - wall} y={mouthY - 336} width={inW + wall * 2} height={16} rx={8}
        fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={cx + 70} cy={mouthY - 300} r={26}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={cx + 70} cy={mouthY - 300} r={8} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
      <line x1={cx + 70} y1={mouthY - 326} x2={cx + 70} y2={mouthY - 300}
        stroke={KRP.ink} strokeWidth={4} />
      <line x1={cx + 96} y1={mouthY - 298} x2={cx + 96} y2={mouthY - 178}
        stroke="#9A8A6A" strokeWidth={5} />
      <g>
        <path d={`M${cx + 62},${mouthY - 176} L${cx + 130},${mouthY - 176} L${cx + 120},${mouthY - 116} L${cx + 72},${mouthY - 116} Z`}
          fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M${cx + 62},${mouthY - 176} Q${cx + 96},${mouthY - 206} ${cx + 130},${mouthY - 176}`}
          fill="none" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 口まわりの草と苔 */}
      <g stroke={C.hillDark} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
        {Array.from({ length: 14 }, (_, i) => {
          const gx = inX - wall - 40 + i * ((inW + wall * 2 + 80) / 13);
          const sw2 = Math.sin((f + i * 11) / 15) * 5;
          return <path key={`gr${i}`} d={`M${gx},${mouthY + 20} Q${gx + sw2},${mouthY - 4} ${gx + sw2 * 1.6},${mouthY - 26}`} fill="none" />;
        })}
      </g>
      <g fill={C.moss} opacity={0.55}>
        <ellipse cx={inX - wall + 16} cy={mouthY + 120} rx={22} ry={13} />
        <ellipse cx={cx + rx + wall - 20} cy={mouthY + 200} rx={18} ry={11} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------
// #188 第10章、池が、地球サイズになった。
// 格: 山
// ------------------------------------------------------------------
const S188: React.FC<{ f: number }> = ({ f }) => {
  const lit = easeOut(seg(f, 2, 14));
  const beam = easeOut(seg(f, 8, 24));
  const cards: Array<[number, number, string, number]> = [
    [560, 470, "1", 14], [670, 380, "2", 20], [470, 300, "3", 26],
  ];
  return (
    <Frame f={f} seed={1087} bg={C.nightDeep}
      over={<ChapterDoor num={10} title="池が地球サイズになった。"
        t={seg(f, 14, 30)} left={1030} top={596} width={850} />}>
      <NightCity f={f} id="s188" groundY={916} />
      {/* ベランダの床 */}
      <rect x={0} y={916} width={W} height={H - 916} fill="#4A4336" />
      <g stroke="#352F26" strokeWidth={4} opacity={0.6}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`fl${i}`} x1={i * 240} y1={916} x2={i * 240 - 60} y2={H} />
        ))}
      </g>
      {/* 室内の戸の光 (左端) */}
      <g>
        <rect x={0} y={330} width={176} height={590} fill={C.glow} opacity={0.3} />
        <rect x={0} y={330} width={176} height={590} fill="none"
          stroke={KRP.ink} strokeWidth={6} />
        <line x1={150} y1={330} x2={150} y2={920} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="176,330 176,920 330,960 330,300" fill={C.glow} opacity={0.12} />
      </g>
      {/* 光芒 (スマホから立つ) */}
      <polygon
        points={`600,676 ${600 - 150 * beam},${676 - 560 * beam} ${600 + 190 * beam},${676 - 600 * beam}`}
        fill={C.screen} opacity={0.2 * beam} />
      {/* 主役 */}
      <Person x={520} y={906} s={1.35} f={f} cloth="#3E4B66" clothDark="#2E3850"
        face="worried" pose="hold" gaze={[1, 4]} />
      {/* スマホ (両手の前) */}
      <g transform="translate(600 676) rotate(-8)">
        <rect x={-48} y={-74} width={96} height={152} rx={14}
          fill="#55606F" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-38} y={-62} width={76} height={122} rx={6}
          fill={C.screen} opacity={0.4 + 0.55 * lit} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 顔を照らす光 */}
      <ellipse cx={520} cy={600} rx={120} ry={92} fill={C.glow} opacity={0.17 * lit} />
      {/* 昇る順位札 */}
      {cards.map(([cx2, cy2, t, a], i) => (
        <g key={`cd${i}`} opacity={clamp01(seg(f, a, a + 10))}
          transform={`translate(0 ${(1 - easeOut(seg(f, a, a + 16))) * 60})`}>
          <TagPlate x={cx2} y={cy2} text={t} size={30} t={seg(f, a, a + 8)} />
        </g>
      ))}
      {/* 手前の手すり */}
      <g>
        <rect x={0} y={742} width={W} height={16} fill="#5A5243"
          stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 17 }, (_, i) => (
          <rect key={`rl${i}`} x={60 + i * 112} y={756} width={13} height={168}
            fill="#5A5243" stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
        ))}
      </g>
      {/* 鉢植え */}
      <g>
        <path d="M1140,924 L1216,924 L1204,1004 L1152,1004 Z"
          fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        {[-1, 0, 1].map((k, i) => (
          <path key={`lf${i}`}
            d={`M1178,922 Q${1178 + k * 54 + Math.sin((f + i * 9) / 16) * 6},${880 - i * 10} ${1178 + k * 76},${824 - i * 16}`}
            fill="none" stroke={C.hillDark} strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #189 現代は、1位と2位の差が、報酬の差として極端に開く時代です。
// 格: 図
// ------------------------------------------------------------------
const S189: React.FC<{ f: number }> = ({ f }) => {
  const g1 = easeOut(seg(f, 4, 22));
  const g2 = easeOut(seg(f, 6, 20));
  const BASE = 620;
  const bar = (cx2: number, top: number, t: number, fill: string) => {
    const h = (BASE - top) * t;
    return (
      <g>
        <rect x={cx2 - 80} y={BASE - h} width={160} height={h}
          fill={fill} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.white} strokeWidth={3} opacity={0.35}>
          <line x1={cx2 - 54} y1={BASE - h + 10} x2={cx2 - 54} y2={BASE - 8} />
        </g>
      </g>
    );
  };
  return (
    <Frame f={f} seed={1088} bg={C.wall}>
      <KeijiBoard f={f} id="s189" y={50} h={620} />
      {/* 縦の目盛り */}
      <g stroke={C.ink} strokeWidth={4} opacity={0.6}>
        <line x1={330} y1={BASE} x2={330} y2={120} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`tk${i}`} x1={330} y1={BASE - i * 70} x2={366} y2={BASE - i * 70} />
        ))}
      </g>
      <line x1={300} y1={BASE} x2={1620} y2={BASE} stroke={C.ink} strokeWidth={6} />
      {/* 棒 */}
      {bar(640, 150, g1, C.gold)}
      {bar(1180, 500, g2, C.silver)}
      <CoinStack x={640} baseY={150} n={4} t={seg(f, 18, 34)} s={0.92} />
      <CoinStack x={1180} baseY={500} n={2} t={seg(f, 20, 32)} s={0.92} />
      {/* 差を示す上下矢印 */}
      <g opacity={clamp01(seg(f, 26, 38))}>
        <line x1={916} y1={168} x2={916} y2={486} stroke={KRP.red} strokeWidth={7} />
        <polygon points="916,152 898,190 934,190" fill={KRP.red}
          stroke={KRP.ink} strokeWidth={3.5} />
        <polygon points="916,502 898,464 934,464" fill={KRP.red}
          stroke={KRP.ink} strokeWidth={3.5} />
        <g stroke={KRP.red} strokeWidth={4} strokeDasharray="14 12" opacity={0.8}>
          <line x1={726} y1={162} x2={900} y2={162} />
          <line x1={932} y1={500} x2={1096} y2={500} />
        </g>
      </g>
      <TagPlate x={640} y={730} text="1位" size={44} t={seg(f, 10, 20)} />
      <TagPlate x={1180} y={730} text="2位" size={44} t={seg(f, 12, 22)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #190 スポーツも配信もビジネスも、頂点のひと握りに、注目とお金が集中します。
// 格: 並
// ------------------------------------------------------------------
const S190: React.FC<{ f: number }> = ({ f }) => {
  const sp = easeOut(seg(f, 3, 18));
  const steps = [420, 340, 260, 180, 100];
  return (
    <Frame f={f} seed={1089} bg="#2E3344">
      {/* 会場の奥壁 */}
      <rect x={0} y={0} width={W} height={900} fill="#343A4C" />
      <g stroke="#262B39" strokeWidth={4} opacity={0.7}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`bw${i}`} x1={0} y1={70 + i * 86} x2={W} y2={70 + i * 86} />
        ))}
      </g>
      {/* 天井の照明器具 */}
      <g>
        {[300, 700, 1220, 1620].map((lx, i) => (
          <g key={`lt${i}`}>
            <line x1={lx} y1={0} x2={lx} y2={46} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M${lx - 34},46 L${lx + 34},46 L${lx + 22},84 L${lx - 22},84 Z`}
              fill="#4B5366" stroke={KRP.ink} strokeWidth={4.5} />
            <ellipse cx={lx} cy={84} rx={22} ry={7} fill={C.glow} opacity={0.35} />
          </g>
        ))}
      </g>
      {/* 脇幕 */}
      {([0, 1760] as number[]).map((bx, i) => (
        <g key={`cu${i}`}>
          <rect x={bx} y={0} width={160} height={900} fill={C.curtain}
            stroke={KRP.ink} strokeWidth={5} />
          <g stroke="#7A2229" strokeWidth={5} opacity={0.75}>
            {[30, 70, 110].map((k, j) => (
              <line key={`cf${j}`} x1={bx + k} y1={0} x2={bx + k} y2={900} />
            ))}
          </g>
        </g>
      ))}
      {/* 床 */}
      <rect x={0} y={900} width={W} height={H - 900} fill="#4C4335" />
      <g stroke="#352F26" strokeWidth={4} opacity={0.6}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`ff${i}`} x1={i * 200} y1={900} x2={i * 200 - 70} y2={H} />
        ))}
      </g>
      {/* スポットライトの光芒 */}
      <polygon points={`830,0 1090,0 1062,366 858,366`} fill={C.glow} opacity={0.2 * sp} />
      <ellipse cx={960} cy={366} rx={150} ry={34} fill={C.glow} opacity={0.3 * sp} />
      {/* ピラミッド型の壇 */}
      {steps.map((hw, i) => {
        const by = 880 - i * 104;
        const lit = i === 4 ? 1 : 0.42 + i * 0.07;
        return (
          <g key={`sp${i}`}>
            <polygon
              points={`${960 - hw},${by} ${960 + hw},${by} ${960 + hw - 18},${by - 104} ${960 - hw + 18},${by - 104}`}
              fill="#6B6253" stroke={KRP.ink} strokeWidth={5} opacity={lit} />
            <rect x={960 - hw + 18} y={by - 112} width={(hw - 18) * 2} height={14}
              fill="#857A66" stroke={KRP.ink} strokeWidth={4} opacity={lit} />
          </g>
        );
      })}
      {/* 頂上の1人 */}
      <PersonMini x={960} y={364} s={0.88} color="#E4D9BE" f={f} face="smile" arms="up" />
      {/* 降るコイン */}
      <g>
        {[0, 1, 2, 3].map((i) => {
          const t = ((f + i * 11) % 44) / 44;
          const cy2 = lerp(90, 340, t);
          return (
            <g key={`cn${i}`} opacity={0.9 * (1 - t * 0.3)}>
              <ellipse cx={890 + i * 48} cy={cy2} rx={24}
                ry={11 + 11 * Math.abs(Math.cos((f + i * 9) / 7))}
                fill={C.coin} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* 裾の群衆 */}
      <g>
        {Array.from({ length: 15 }, (_, i) => {
          const px = 190 + i * 112 + rnd(i * 7) * 24;
          if (px > 740 && px < 1180) return null;
          return (
            <PersonMini key={`cr${i}`} x={px} y={936 + rnd(i * 3) * 48}
              s={0.5 + rnd(i * 11) * 0.2} color="#3B4153" f={f} phase={i} face="none" />
          );
        })}
      </g>
      {/* 小アイコン3つ (ボール・配信枠・ビル) */}
      <g opacity={clamp01(seg(f, 22, 34))}>
        {/* ボール */}
        <g transform="translate(1356 236)">
          <circle cx={0} cy={0} r={42} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <path d="M-42,-10 Q0,20 42,-10" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <path d="M-42,10 Q0,-20 42,10" fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 配信枠 */}
        <g transform="translate(1500 236)">
          <rect x={-46} y={-32} width={92} height={64} rx={10}
            fill={C.screenDark} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="-12,-18 22,0 -12,18" fill={C.washi}
            stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ビル */}
        <g transform="translate(1646 236)">
          <rect x={-34} y={-44} width={68} height={88}
            fill="#5B6578" stroke={KRP.ink} strokeWidth={5} />
          <g fill={C.glow} opacity={0.8}>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={`bwn${i}`} x={-22 + (i % 2) * 24} y={-32 + Math.floor(i / 2) * 22}
                width={14} height={13} />
            ))}
          </g>
        </g>
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #191 いわゆる「勝者総取り」の構造です。
// 格: 図
// ------------------------------------------------------------------
const Utsuwa: React.FC<{
  x: number; y: number; hw: number; h: number; empty?: boolean;
}> = ({ x, y, hw, h, empty = true }) => (
  <g>
    <path d={`M${x - hw},${y - h} L${x + hw},${y - h} L${x + hw * 0.66},${y} L${x - hw * 0.66},${y} Z`}
      fill={empty ? C.washi : C.coinDark} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={x} cy={y - h} rx={hw} ry={hw * 0.26}
      fill={empty ? "#E6DCC2" : C.coin} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={x} cy={y - h} rx={hw * 0.72} ry={hw * 0.18}
      fill={empty ? "#CFC3A4" : C.coinDark} opacity={0.75} />
  </g>
);

const S191: React.FC<{ f: number }> = ({ f }) => {
  const suck = easeOut(seg(f, 6, 26));
  const pts: Array<[number, number]> = [
    [420, 192], [660, 152], [960, 142], [1260, 152], [1500, 192],
    [330, 396], [1590, 396], [430, 614], [1490, 614],
  ];
  return (
    <Frame f={f} seed={1090} bg={C.wall}>
      <KeijiBoard f={f} id="s191" y={50} h={620} />
      {/* 周囲の空の器 + 吸い込まれる矢印 */}
      {pts.map(([px, py], i) => {
        const dx = 960 - px;
        const dy = 440 - py;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        const a = (Math.atan2(dy, dx) * 180) / Math.PI;
        const tipX = px + ux * (90 + (len - 240) * suck);
        const tipY = py + uy * (90 + (len - 240) * suck);
        return (
          <g key={`uv${i}`}>
            <line x1={px + ux * 66} y1={py + uy * 66} x2={tipX - ux * 48} y2={tipY - uy * 48}
              stroke={KRP.red} strokeWidth={6} opacity={0.5 + 0.4 * suck} />
            <Arrow x={tipX} y={tipY} s={0.62} rot={a} t={seg(f, 8, 20)} />
            <Utsuwa x={px} y={py + 44} hw={48} h={52} />
          </g>
        );
      })}
      {/* 中央の器 (溢れる) */}
      <Utsuwa x={960} y={560} hw={176} h={196} empty={false} />
      <CoinStack x={960} baseY={372} n={5} t={seg(f, 16, 36)} s={1.12} />
      {/* こぼれるコイン */}
      <g opacity={clamp01(seg(f, 28, 40))}>
        {[-1, 1].map((k, i) => (
          <ellipse key={`ov${i}`} cx={960 + k * 196} cy={420 + i * 34} rx={30} ry={11}
            fill={C.coin} stroke={KRP.ink} strokeWidth={4}
            transform={`rotate(${k * 24} ${960 + k * 196} ${420 + i * 34})`} />
        ))}
      </g>
      <TagPlate x={960} y={730} text="しょうしゃ そうどり" size={44} t={seg(f, 20, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #192 さらに、順位にはやっかいな性質があります。
// 格: 並 (60〜120行)
// ------------------------------------------------------------------
// ★作り直し (作者「イラストがふさわしくない」)。前の版は教室の机の上で
//   「順位」カードを裏返すと赤い棘が出る絵だった。棘は「やっかい」の記号にすぎず、
//   順位の何がやっかいなのかを一切指していなかった (札も字幕の丸写し) ので捨てた。
//
// この文の役目は次の #193 (席は1つしかない) への「振り」なので、
//   ・答え (席・椅子・人数) はまだ1つも画面に出さない
//   ・「順位という仕組みの中に、まだ開けていない場所がある」気配だけを作る
//   この回のバッジが「順位のからくり」なので、順位を木箱の機械として組み、
//   その点検口がひとりでにきしんで開く、という事件1つで持たせる (並なので1つだけ)。
//
// 舞台は技術室の作業台。#191 の掲示パネル・#193 の教室・#194 の体育館と
//   場所も明るさも寄り方も重ならないように選んだ (同じ絵が続くのを避ける)。
const S192: React.FC<{ f: number }> = ({ f }) => {
  const op = easeOut(seg(f, 8, 32));        // 点検口が開く量。f=45 では開ききっている
  const gearA = (f / 24) * 60;              // 中の歯車。誰も回していないのに動いている
  const crank = Math.sin(f / 15) * 4;       // 外のクランクはわずかに揺れるだけ
  return (
    <Frame f={f} seed={1091} bg="#D8CDB2">
      {/* 技術室の奥壁 (漆喰の横目) */}
      <rect x={0} y={0} width={W} height={562} fill="#D3C8AD" />
      <g stroke="#B3A484" strokeWidth={3} opacity={0.45}>
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`wl${i}`} x1={0} y1={120 + i * 128} x2={W} y2={120 + i * 128} />
        ))}
      </g>
      {/* 有孔ボードと工具 — ここが工作室だと1秒で分かる記号 (第16条の床)。
          並なので道具は2本だけに絞り、手数は主役の機械に回す */}
      <g>
        <rect x={90} y={92} width={340} height={292} rx={6}
          fill="#C6B795" stroke={KRP.ink} strokeWidth={5} />
        <g fill="#A89777" opacity={0.7}>
          {Array.from({ length: 48 }, (_, i) => (
            <circle key={`pg${i}`} cx={118 + (i % 8) * 42} cy={122 + Math.floor(i / 8) * 42} r={5} />
          ))}
        </g>
        <g transform="translate(176 210)">{/* 金槌 */}
          <rect x={-7} y={0} width={14} height={130} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-42} y={-26} width={84} height={30} rx={6} fill={C.silver} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <g transform="translate(352 196) rotate(-4)">{/* ノコギリ */}
          <rect x={-10} y={-4} width={20} height={42} rx={7} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <polygon points="-9,38 9,38 9,152 -9,146" fill={C.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 西日の窓 — 夕方の技術室。#193 の教室とは光の入り方を変えてある */}
      <g>
        <rect x={1450} y={96} width={420} height={300} rx={6}
          fill="#E3D6A8" stroke={C.woodDark} strokeWidth={12} />
        <line x1={1660} y1={96} x2={1660} y2={396} stroke={C.woodDark} strokeWidth={9} />
        <line x1={1450} y1={250} x2={1870} y2={250} stroke={C.woodDark} strokeWidth={9} />
      </g>
      {/* 床と、窓から伸びる光の帯 */}
      <rect x={0} y={562} width={W} height={H - 562} fill="#BCA981" />
      <g stroke="#9C8A63" strokeWidth={4} opacity={0.5}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`fp${i}`} x1={i * 214} y1={562} x2={i * 268 - 220} y2={H} />
        ))}
      </g>
      <polygon points="1450,396 1870,396 1700,1080 1040,1080"
        fill={KRP.white} opacity={0.13} />
      {/* 作業台 (機械を載せる床。影で浮かないように接地させる) */}
      <g>
        <ellipse cx={960} cy={604} rx={352} ry={26} fill="#8E7D5A" opacity={0.28} />
        <polygon points="420,592 1500,592 1572,664 348,664"
          fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={348} y={664} width={1224} height={36} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={382} y={700} width={38} height={310} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1498} y={700} width={38} height={310} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={414} y={902} width={1090} height={20} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* 外れて台に落ちたボルト1本 = 「どこかが緩んでいる」の小さな前触れ */}
        <g transform="translate(1300 628) rotate(8)">
          <rect x={0} y={-5} width={46} height={10} rx={3} fill={C.silver} stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points="-4,-11 -18,-7 -18,7 -4,11" fill={C.silver} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
      {/* ===== 主役: 順位の機械 (センターの法) ===== */}
      <g>
        {/* 天板の上の表彰台 — これが「順位」の機械だと一目で分かる部分 */}
        <g>
          <rect x={824} y={272} width={92} height={74} fill={C.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={916} y={232} width={90} height={114} fill={C.gold} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={1006} y={292} width={92} height={54} fill="#C0875A" stroke={KRP.ink} strokeWidth={5} />
          <g textAnchor="middle" fontFamily={FONT} fontWeight={900} fill={C.ink}>
            <text x={870} y={322} fontSize={40}>2</text>
            <text x={961} y={322} fontSize={46}>1</text>
            <text x={1052} y={332} fontSize={36}>3</text>
          </g>
        </g>
        {/* 箱 */}
        <rect x={632} y={346} width={660} height={26} rx={6} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={650} y={372} width={624} height={230} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.woodDark} strokeWidth={3.5} opacity={0.5}>
          <path d="M666,420 Q960,410 1258,424" fill="none" />
          <path d="M666,544 Q960,534 1258,548" fill="none" />
        </g>
        {/* クランク (誰も回していないのに、かすかに揺れている) */}
        <g transform={`rotate(${crank} 1292 476)`}>
          <circle cx={1292} cy={476} r={17} fill={C.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1284} y={404} width={16} height={74} rx={6} fill={C.silver} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={1292} cy={398} r={20} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 点検口の奥 (暗がり) — 中の歯車はここに clip して歯先だけ見せる */}
        <defs>
          <clipPath id="hatchClip192">
            <rect x={700} y={406} width={250} height={170} />
          </clipPath>
        </defs>
        <rect x={700} y={406} width={250} height={170} fill="#1E1A14"
          stroke={KRP.ink} strokeWidth={5} />
        <g clipPath="url(#hatchClip192)">
          {/* 奥の真鍮の小歯車 */}
          <g transform={`rotate(${-gearA * 1.6} 912 436)`} opacity={0.75}>
            <circle cx={912} cy={436} r={44} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={`gb${i}`} x={908} y={386} width={9} height={18}
                fill={KRP.brass} stroke={KRP.ink} strokeWidth={3}
                transform={`rotate(${i * 36} 912 436)`} />
            ))}
          </g>
          {/* 手前の赤い歯車 — 歯先だけが暗がりから覗く */}
          <g transform={`rotate(${gearA} 826 512)`}>
            <circle cx={826} cy={512} r={88} fill="#A8392C" stroke={KRP.ink} strokeWidth={5.5} />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={`gr${i}`} x={818} y={414} width={17} height={30} rx={3}
                fill="#C0392B" stroke={KRP.ink} strokeWidth={4}
                transform={`rotate(${i * 30} 826 512)`} />
            ))}
            <circle cx={826} cy={512} r={24} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 奥へ消える暗がり (底は見せない = 答えはまだ出さない) */}
          <rect x={700} y={406} width={250} height={170} fill="#120F0A" opacity={0.42} />
        </g>
        {/* 点検口の扉 (下ヒンジ。きしみながら手前へ倒れる) */}
        <polygon
          points={`700,576 950,576 ${976 + 10 * op},${576 + 108 * op} ${674 - 10 * op},${576 + 108 * op}`}
          fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} opacity={clamp01(op * 3)} />
        <g transform={`translate(825 576) scale(1 ${1 - 0.9 * op}) translate(-825 -576)`}>
          <rect x={700} y={406} width={250} height={170} fill={C.wood}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={720} y={426} width={210} height={130} fill="none"
            stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
          <circle cx={930} cy={492} r={10} fill={C.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 開いた隙間から漏れるほこり */}
        <g fill="#E8DCBE" opacity={0.5 * op}>
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={`ds${i}`} r={3 + rnd(i * 17) * 4}
              cx={716 + rnd(i * 7) * 220 - 26 * Math.sin((f + i * 13) / 21)}
              cy={520 - ((f * 1.6 + i * 34) % 150)} />
          ))}
        </g>
      </g>
      {/* 「まだ中を見ていない」気配 */}
      <QMark x={1372} y={252} s={1.15} f={f} t={seg(f, 22, 36)} />
      {/* 覗き込む1人 (並なので人は1人だけ) */}
      <Person x={1718} y={1016} s={1.12} f={f} pose="point" pointDir={-1}
        face="worried" gaze={[-4, 1]} lean={4}
        cloth="#4A6E8E" clothDark="#35536E" />
      {/* 札は字幕にない情報だけを足す (「やっかい」は字幕が言うので書かない) */}
      <g stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 9" opacity={0.7}>
        <line x1={604} y1={500} x2={694} y2={496} />
      </g>
      <TagPlate x={470} y={500} text="てんけんぐち" size={36} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #193 「学年1位」という椅子は、全員が頑張っても、1人分しか増えません。
// 格: 山 (150〜250行)
// ------------------------------------------------------------------
// ★作り直し (作者「イラストがふさわしくない」)。前の版は掲示パネルの紙に
//   20マスの「席のマス図」を描き、椅子は右端に小さく添えただけだった。問題は3つ:
//   ①台本が「椅子」と言っているのに、絵の主役がマスの表になっていた
//   ②直前の #191 と同じ掲示パネルの上で、置く物だけを替えていた (キット禁止)
//   ③努力の矢印が20本あるのに、「増えない」という肝心の結論が絵に出ていなかった
//
// 作り直しの方針 = 椅子という具体物で、席の数が決まっていることを見せる:
//   ・放課後の教室の教壇に寄り、椅子を1脚だけ画面中央に大きく置く (センターの法)
//   ・左右に「2脚目・3脚目があったら」を点線の椅子で出し、×で打ち消す (事件)
//   ・教壇の前に並ぶ生徒のゲージが全員満タンまで伸びる = 「全員が頑張っても」
//     → 努力は増えるのに、椅子は1脚のまま、が1画面で同時に見える
//   ・#194 (体育館の全景・8人が走って回る) とは、寄り・場所・動きを全部変えた。
//     こちらは「寄りの静止した1脚」、あちらは「引きの回る8人」。
const S193: React.FC<{ f: number }> = ({ f }) => {
  // カメラはゆっくり椅子へ寄る (6点法④)。札は寄りの外に置くので位置が動かない
  const z = lerp(1, 1.05, easeOut(seg(f, 0, 40)));
  // 生徒ごとに少しずれて満タンになる = 「全員が」がじわっと揃う
  const pupils = [230, 420, 610, 1190, 1380, 1570];
  return (
    <Frame f={f} seed={1092} bg="#E0D6BE">
      <g transform={zoomAt(z, 960, 560)}>
        {/* 教室の奥壁 + 腰板 */}
        <rect x={0} y={0} width={W} height={566} fill="#E0D6BE" />
        <g stroke="#C2B494" strokeWidth={3} opacity={0.4}>
          {Array.from({ length: 3 }, (_, i) => (
            <line key={`wl${i}`} x1={0} y1={60 + i * 150} x2={W} y2={60 + i * 150} />
          ))}
        </g>
        <rect x={0} y={520} width={W} height={46} fill={C.wood} opacity={0.5} />
        <line x1={0} y1={520} x2={W} y2={520} stroke={C.woodDark} strokeWidth={5} opacity={0.6} />
        {/* 黒板 (消し残しのチョークの跡・受け皿・チョーク・黒板消しまで) */}
        <g>
          <rect x={90} y={100} width={680} height={330} rx={6}
            fill="#3C5146" stroke={C.woodDark} strokeWidth={14} />
          <g stroke={KRP.white} strokeWidth={4} opacity={0.2}>
            <line x1={140} y1={176} x2={540} y2={176} />
            <line x1={140} y1={238} x2={452} y2={238} />
            <path d="M560,210 Q610,170 664,214" fill="none" />
          </g>
          <rect x={80} y={434} width={700} height={20} rx={6}
            fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={150} y={418} width={72} height={18} rx={5}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={252} y={416} width={54} height={20} rx={5}
            fill="#5A6B5E" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 窓 (西日) */}
        <g>
          <rect x={1210} y={110} width={620} height={330} rx={6}
            fill="#E6D8AC" stroke={C.woodDark} strokeWidth={12} />
          <g stroke={C.woodDark} strokeWidth={9}>
            <line x1={1520} y1={110} x2={1520} y2={440} />
            <line x1={1210} y1={282} x2={1830} y2={282} />
          </g>
          <polygon points="1256,140 1420,140 1330,264 1240,264" fill={KRP.white} opacity={0.35} />
        </g>
        {/* 壁の時間割 (放課後の教室だと分かる記号)。
            壁の上半分は黒板・窓・札で埋まっていて、中央は椅子が立つので、
            黒板の下と腰板のあいだの空いた帯に貼る (何にも隠れない唯一の場所) */}
        <g transform="translate(168 450)">
          <rect x={0} y={0} width={224} height={62} rx={4}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.45}>
            <line x1={0} y1={22} x2={224} y2={22} />
            <line x1={0} y1={42} x2={224} y2={42} />
            {[56, 112, 168].map((gx, i) => (
              <line key={`tt${i}`} x1={gx} y1={0} x2={gx} y2={62} />
            ))}
          </g>
        </g>
        {/* 掃除用具入れ + 立てかけたモップ */}
        <g>
          <rect x={-12} y={248} width={92} height={318}
            fill="#B9AE92" stroke={KRP.ink} strokeWidth={6} />
          <line x1={40} y1={248} x2={40} y2={566} stroke={C.woodDark} strokeWidth={4} opacity={0.7} />
          <circle cx={28} cy={404} r={8} fill={C.silver} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={94} y1={562} x2={136} y2={308} stroke={C.wood} strokeWidth={13}
            strokeLinecap="round" />
          <ellipse cx={139} cy={294} rx={24} ry={18} fill="#C9C0A6"
            stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 床 (板目) */}
        <rect x={0} y={566} width={W} height={H - 566} fill="#CBB68C" />
        <g stroke="#A99266" strokeWidth={4} opacity={0.5}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`fp${i}`} x1={i * 196} y1={566} x2={i * 254 - 260} y2={H} />
          ))}
          <path d="M0,760 Q960,748 1920,766" fill="none" />
          <path d="M0,940 Q960,924 1920,946" fill="none" />
        </g>
        {/* 窓から床に落ちる西日 */}
        <polygon points="1210,440 1830,440 1560,1080 820,1080"
          fill={KRP.white} opacity={0.12} />
        {/* 教壇 */}
        <g>
          <ellipse cx={960} cy={728} rx={470} ry={22} fill="#9C8760" opacity={0.25} />
          <polygon points="600,560 1320,560 1400,626 520,626"
            fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={520} y={626} width={880} height={96}
            fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.wood} strokeWidth={4} opacity={0.5}>
            <line x1={540} y1={656} x2={1380} y2={656} />
            <line x1={540} y1={694} x2={1380} y2={694} />
          </g>
        </g>
        {/* ===== 事件: 2脚目・3脚目は「あったかもしれない」だけで、実在しない =====
            第5条 (変身の法) に触れないよう、幻は塗りを抜いた点線 + 木目なしにして、
            実物の椅子と見まちがえないようにしている */}
        {([630, 1300] as number[]).map((gx, i) => (
          <g key={`gh${i}`} opacity={clamp01(seg(f, 14 + i * 4, 28 + i * 4))}>
            <Chair x={gx} y={620} s={0.95} ghost />
            <XMark x={gx} y={470} s={0.9} t={seg(f, 24 + i * 4, 38)} />
          </g>
        ))}
        {/* 教壇の上に白チョークで描かれた枠。席の場所は1つしか引かれていない */}
        <g stroke={KRP.white} strokeWidth={6} opacity={0.62} strokeLinecap="round">
          <polygon points="840,600 1080,600 1124,646 796,646" fill="none" />
        </g>
        {/* ===== 主役: 椅子は1脚だけ ===== */}
        <Chair x={960} y={630} s={1.3} />
        {/* 背もたれに掛けた木札。「1位」とは書かず数字だけ (字幕が言うことは書かない) */}
        <g>
          <line x1={922} y1={262} x2={930} y2={290} stroke={KRP.ink} strokeWidth={4} />
          <line x1={998} y1={262} x2={990} y2={290} stroke={KRP.ink} strokeWidth={4} />
          <rect x={903} y={286} width={114} height={92} rx={9}
            fill={C.washi} stroke={KRP.ink} strokeWidth={5.5} />
          <text x={960} y={354} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={66} fill={C.ink}>1</text>
        </g>
        {/* ===== 「全員が頑張っても」= 教壇の前に並ぶ生徒。ゲージが全員満タンになる ===== */}
        {pupils.map((px, i) => {
          const g = easeOut(seg(f, 6 + i * 2, 30 + i * 2));
          const full = g > 0.985;
          return (
            <g key={`pp${i}`}>
              {/* 努力ゲージ (縦)。#194 の横メーターとは形を変えてある */}
              <rect x={px - 18} y={742} width={36} height={126} rx={9}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={px - 11} y={861 - 112 * g} width={22} height={112 * g} rx={5}
                fill={full ? C.gold : C.hill} />
              <line x1={px - 18} y1={749} x2={px + 18} y2={749}
                stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
              {full && (
                <circle cx={px} cy={726} r={9 + 3 * Math.abs(Math.sin((f + i * 9) / 9))}
                  fill={C.gold} stroke={KRP.ink} strokeWidth={3.5} />
              )}
              <PersonMini x={px} y={1000} s={0.62} color="#5C5342"
                f={f} phase={i * 2} face="none" />
            </g>
          );
        })}
        {/* 手前で椅子へ手を伸ばす1人 (真剣な顔。茶化さない) */}
        <Person x={1742} y={1054} s={1.08} f={f} pose="raise" face="normal"
          gaze={[-4, -3]} cloth="#B9674A" clothDark="#8E4A32" lean={-3} />
        {/* 床のチョークの粉と、転がった1本 */}
        <g fill={KRP.white} opacity={0.4}>
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={`cd${i}`} cx={560 + rnd(i * 23 + 5) * 820}
              cy={742 + rnd(i * 31 + 2) * 40} rx={5 + rnd(i * 7) * 5} ry={3} />
          ))}
        </g>
        <g transform="translate(1466 752) rotate(-8)">
          <rect x={-34} y={-7} width={68} height={14} rx={6}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
      {/* 札は寄りの外。字幕にない情報 (席の上限) だけを足す */}
      <TagPlate x={1010} y={140} text="ていいん 1めい" size={42} t={seg(f, 18, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #194 全員が2倍努力しても、1位は1人。順位の奪い合いは、椅子取りゲームなのです。
// 格: 山
// ------------------------------------------------------------------
const S194: React.FC<{ f: number }> = ({ f }) => {
  const push = easeOut(seg(f, 6, 28));
  const runners = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + f / 18;
    const sx = 1000 + Math.cos(a) * 480;
    const sy = 840 + Math.sin(a) * 136;
    const sc = 0.5 + 0.2 * (Math.sin(a) + 1);
    return { sx, sy, sc, i, a };
  }).sort((p, q) => p.sy - q.sy);
  return (
    <Frame f={f} seed={1093} bg={C.gym}>
      {/* 奥壁 */}
      <rect x={0} y={0} width={W} height={706} fill="#DCCFAE" />
      {/* 天井の梁 */}
      <g>
        <rect x={0} y={0} width={W} height={34} fill="#8C7B5C" />
        <g stroke="#6E5F46" strokeWidth={7} opacity={0.8}>
          <line x1={0} y1={64} x2={W} y2={64} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`bm${i}`} x1={i * 240} y1={34} x2={i * 240 + 120} y2={64} />
          ))}
        </g>
      </g>
      {/* 高窓 */}
      <g>
        {Array.from({ length: 4 }, (_, i) => {
          const wx = 620 + i * 180;
          return (
            <g key={`hw${i}`}>
              <rect x={wx} y={110} width={140} height={140} rx={5}
                fill="#D4E6EE" stroke={C.woodDark} strokeWidth={9} />
              <g stroke={C.woodDark} strokeWidth={6}>
                <line x1={wx + 70} y1={110} x2={wx + 70} y2={250} />
                <line x1={wx} y1={180} x2={wx + 140} y2={180} />
              </g>
              <polygon points={`${wx + 12},${130} ${wx + 60},${130} ${wx + 22},${172} ${wx + 6},${172}`}
                fill={KRP.white} opacity={0.5} />
            </g>
          );
        })}
      </g>
      {/* ステージ幕 */}
      <g>
        <rect x={360} y={330} width={1200} height={310} fill={C.curtain}
          stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
        <g stroke="#7A2229" strokeWidth={6} opacity={0.7}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`cf${i}`} x1={400 + i * 112} y1={330} x2={400 + i * 112} y2={640} />
          ))}
        </g>
        <rect x={340} y={306} width={1240} height={32} rx={6}
          fill="#8A6436" stroke={KRP.ink} strokeWidth={5} />
        <rect x={300} y={640} width={1320} height={66} fill="#9C8257"
          stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* バスケットゴール */}
      <g>
        <rect x={1700} y={250} width={150} height={118} rx={5}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
        <rect x={1742} y={300} width={66} height={54} fill="none"
          stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1775} cy={376} rx={38} ry={10} fill="none"
          stroke={C.red} strokeWidth={7} />
        <path d="M1740,380 L1752,428 M1762,382 L1768,432 M1788,382 L1784,432 M1810,380 L1798,428"
          stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.9} />
        <line x1={1850} y1={300} x2={1920} y2={272} stroke={KRP.ink} strokeWidth={8} />
      </g>
      {/* 板目の床 */}
      <rect x={0} y={706} width={W} height={H - 706} fill={C.gym} />
      <g stroke={C.gymDark} strokeWidth={4} opacity={0.55}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`fp${i}`} x1={i * 170 - 60} y1={706} x2={i * 230 - 320} y2={H} />
        ))}
        <path d="M0,790 Q960,778 1920,794" fill="none" />
        <path d="M0,900 Q960,886 1920,906" fill="none" />
        <path d="M0,1020 Q960,1004 1920,1026" fill="none" />
      </g>
      <ellipse cx={960} cy={880} rx={700} ry={180} fill="none"
        stroke={KRP.white} strokeWidth={7} opacity={0.5} />
      {/* 椅子の赤い点線 */}
      <ellipse cx={960} cy={800} rx={190} ry={70} fill="none" stroke={KRP.red}
        strokeWidth={7} strokeDasharray="20 16"
        opacity={0.55 + 0.3 * Math.abs(Math.sin(f / 11))} />
      {/* 走る8人 (奥→手前) */}
      {runners.filter((r) => r.sy < 800).map((r) => (
        <PersonMini key={`rk${r.i}`} x={r.sx} y={r.sy} s={r.sc}
          color={["#4A6E8E", "#8E6A4A", "#5E7C5A", "#7A5E86"][r.i % 4]}
          f={f} phase={r.i} face="dot" arms="up" />
      ))}
      {/* 中央の椅子 1脚だけ */}
      <Chair x={960} y={820} s={0.95} tilt={-1} />
      {runners.filter((r) => r.sy >= 800).map((r) => (
        <PersonMini key={`rk2${r.i}`} x={r.sx} y={r.sy} s={r.sc}
          color={["#4A6E8E", "#8E6A4A", "#5E7C5A", "#7A5E86"][r.i % 4]}
          f={f} phase={r.i} face="dot" arms="up" />
      ))}
      {/* 速度線 */}
      <g stroke={C.ink} strokeWidth={6} opacity={0.4} strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => (
          <line key={`sl${i}`} x1={70 + (i % 2) * 40} y1={760 + i * 48}
            x2={260 + (i % 2) * 30} y2={760 + i * 48} />
        ))}
      </g>
      {/* 主役 (真剣に走る) */}
      <Person x={400} y={990} s={1.15} f={f} pose="run" face="normal"
        cloth="#B9674A" clothDark="#8E4A32" gaze={[3, 0]} lean={-4} />
      {/* 汗 */}
      <g fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5}>
        {[0, 1, 2].map((i) => (
          <ellipse key={`sw${i}`} cx={508 + i * 26}
            cy={706 - i * 22 + Math.sin((f + i * 8) / 7) * 4} rx={9} ry={13} />
        ))}
      </g>
      {/* 努力メーター (2倍に伸びる) */}
      <g>
        <rect x={226} y={244} width={348} height={38} rx={10}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={231} y={249} width={168} height={28} rx={7} fill={C.hill} />
        <rect x={399} y={249} width={170 * push} height={28} rx={7} fill={KRP.red} />
        <line x1={399} y1={240} x2={399} y2={286} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={400} y={180} text="どりょく ×2" size={44} t={seg(f, 10, 22)} />
      <TagPlate x={1500} y={180} text="いすは 1つのまま" size={44} t={seg(f, 22, 34)} />
      <TagPlate x={790} y={596} text="1" size={48} t={seg(f, 16, 26)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #195 そして、スマホの登場。
// 格: 並
// ------------------------------------------------------------------
const S195: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 0, 20));
  const lit = easeOut(seg(f, 20, 34));
  const dy = (1 - rise) * 720;
  return (
    <Frame f={f} seed={1094} bg={C.nightDeep}>
      <NightCity f={f} id="s195" groundY={900} />
      {/* 画面から広がる光芒 */}
      <g opacity={0.26 * lit}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const len = 520 + 130 * Math.abs(Math.sin((f + i * 11) / 15));
          return (
            <polygon key={`bm${i}`}
              points={`960,520 ${960 + Math.cos(a - 0.08) * len},${520 + Math.sin(a - 0.08) * len} ${960 + Math.cos(a + 0.08) * len},${520 + Math.sin(a + 0.08) * len}`}
              fill={C.screen} />
          );
        })}
      </g>
      {/* スマホ (下からせり上がる) */}
      <g transform={`translate(0 ${dy})`}>
        <BigPhone f={f} cid="s195" x={700} y={170} w={520} h={760} lit={lit}>
          {/* 画面の中: ホームの並び */}
          <g>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={`ic${i}`} x={766 + (i % 3) * 136} y={300 + Math.floor(i / 3) * 136}
                width={104} height={104} rx={24}
                fill={["#6E9FC0", "#C9A84C", "#8FB06A", "#C08A6A"][i % 4]}
                stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            ))}
          </g>
        </BigPhone>
      </g>
      {/* 見上げる人影2つ */}
      <PersonMini x={330} y={968} s={1.25} color="#1F2634" f={f} phase={1} face="none" />
      <PersonMini x={1580} y={986} s={1.35} color="#1F2634" f={f} phase={3} face="none" />
      <TagPlate x={320} y={260} text="スマホ" size={44} t={seg(f, 24, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #196 SNSによって、比べる相手は同級生から、地球上の全員になりました。
// 格: 山
// ------------------------------------------------------------------
const S196: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 4, 22));
  const cross = easeOut(seg(f, 16, 34));
  return (
    <Frame f={f} seed={1095} bg={C.nightDeep}>
      <NightCity f={f} id="s196" groundY={900} />
      {/* 同級生の小さな輪 (5人) */}
      <g>
        <ellipse cx={380} cy={470} rx={168} ry={126} fill={C.screen}
          opacity={0.1} stroke={C.screen} strokeWidth={5} strokeDasharray="18 14" />
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return (
            <PersonMini key={`cm${i}`} x={380 + Math.cos(a) * 128}
              y={496 + Math.sin(a) * 96} s={0.42} color="#D6CDB4"
              f={f} phase={i} face="dot" />
          );
        })}
      </g>
      {/* 太い矢印で画面の地球へ渡る */}
      <g opacity={cross}>
        <line x1={580} y1={470} x2={744} y2={470} stroke={KRP.red}
          strokeWidth={16} strokeLinecap="round" />
        <Arrow x={806} y={470} s={1.45} t={seg(f, 16, 28)} />
      </g>
      {/* スマホ + 画面の中の地球 */}
      <BigPhone f={f} cid="s196" x={820} y={120} w={760} h={620} lit={open}>
        {/* 星 */}
        <g fill={C.glow} opacity={0.5}>
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={`ps${i}`} cx={860 + rnd(i * 17 + 2) * 680}
              cy={186 + rnd(i * 23 + 5) * 492} r={2 + rnd(i * 7) * 2.4} />
          ))}
        </g>
        <EarthBall cx={1200} cy={430} r={145} f={f} cid="s196e" glow />
        {/* 地球をぐるりと囲む人のアイコン */}
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + f / 90;
          const rr = 222;
          return (
            <PersonMini key={`gp${i}`} x={1200 + Math.cos(a) * rr}
              y={430 + Math.sin(a) * rr + 26} s={0.27}
              color={i % 3 === 0 ? "#E4D9BE" : "#BFD3DE"} f={f} phase={i} face="dot" />
          );
        })}
      </BigPhone>
      <TagPlate x={380} y={788} text="どうきゅうせい 5人" size={36} t={seg(f, 8, 20)} />
      <TagPlate x={1200} y={788} text="ちきゅう ぜんいん" size={36} t={seg(f, 26, 38)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #197 フォロワー数も再生数も、24時間更新され続けるランキングです。
// 格: 図
// ------------------------------------------------------------------
const S197: React.FC<{ f: number }> = ({ f }) => {
  const rows = [0, 1, 2, 3, 4];
  return (
    <Frame f={f} seed={1096} bg={C.nightDeep}>
      <NightCity f={f} id="s197" groundY={960} />
      <BigPhone f={f} cid="s197" x={140} y={20} w={1640} h={880} lit={1}>
        <rect x={166} y={74} width={1588} height={776} fill="#F0EADA" />
        {/* ランキングの行5つ */}
        {rows.map((i) => {
          const ry = 250 + i * 104;
          const up = Math.sin((f + i * 17) / 13) > 0;
          const swap = i === 1 || i === 3;
          return (
            <g key={`rw${i}`}>
              <rect x={236} y={ry} width={1420} height={84} rx={12}
                fill={i === 0 ? "#F6E7B8" : KRP.white}
                stroke={KRP.ink} strokeWidth={5} />
              <text x={300} y={ry + 60} textAnchor="middle" fontFamily={FONT}
                fontWeight={900} fontSize={50} fill={C.ink}>{i + 1}</text>
              {/* 名前の帯 (文字は書かない) */}
              <circle cx={400} cy={ry + 42} r={30}
                fill={["#6E9FC0", "#C9A84C", "#8FB06A", "#C08A6A", "#A58AB8"][i]}
                stroke={KRP.ink} strokeWidth={4} />
              <rect x={452} y={ry + 26} width={300 - i * 34} height={30} rx={14}
                fill="#D9D2C0" stroke={KRP.ink} strokeWidth={3.5} />
              {/* 回り続ける数字の桁 */}
              <g>
                {Array.from({ length: 6 }, (_, k) => {
                  const dx = 860 + k * 86;
                  const roll = k >= 4;
                  const spin = (f * (roll ? 0.3 + k * 0.1 : 0) + i * 3 + k * 2) % 10;
                  const d = Math.floor(spin);
                  const off = roll ? (spin - d) * 72 : 0;
                  return (
                    <g key={`dg${k}`}>
                      <rect x={dx} y={ry + 14} width={72} height={58} rx={8}
                        fill="#E8E0CC" stroke={KRP.ink} strokeWidth={3.5} />
                      <clipPath id={`dc${i}${k}`}>
                        <rect x={dx} y={ry + 14} width={72} height={58} rx={8} />
                      </clipPath>
                      <g clipPath={`url(#dc${i}${k})`}>
                        <text x={dx + 36} y={ry + 60 - off} textAnchor="middle"
                          fontFamily={FONT} fontWeight={900} fontSize={46}
                          fill={C.ink}>{d}</text>
                        <text x={dx + 36} y={ry + 132 - off} textAnchor="middle"
                          fontFamily={FONT} fontWeight={900} fontSize={46}
                          fill={C.ink}>{(d + 1) % 10}</text>
                      </g>
                    </g>
                  );
                })}
              </g>
              {/* 順位の ↑↓ */}
              <g transform={`translate(1580 ${ry + 42})`}>
                {swap ? (
                  <polygon points={up ? "0,-22 -20,14 20,14" : "0,22 -20,-14 20,-14"}
                    fill={up ? C.hill : KRP.red} stroke={KRP.ink} strokeWidth={4} />
                ) : (
                  <rect x={-20} y={-5} width={40} height={10} rx={5}
                    fill={KRP.gray} stroke={KRP.ink} strokeWidth={3.5} />
                )}
              </g>
            </g>
          );
        })}
        {/* 24h の時計 */}
        <g>
          <circle cx={1620} cy={160} r={70} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.ink} strokeWidth={4} opacity={0.6}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line key={`tk${i}`} x1={1620 + Math.cos(a) * 54} y1={160 + Math.sin(a) * 54}
                  x2={1620 + Math.cos(a) * 62} y2={160 + Math.sin(a) * 62} />
              );
            })}
          </g>
          <line x1={1620} y1={160}
            x2={1620 + Math.cos(f / 4 - Math.PI / 2) * 48}
            y2={160 + Math.sin(f / 4 - Math.PI / 2) * 48}
            stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
          <line x1={1620} y1={160}
            x2={1620 + Math.cos(f / 22 - Math.PI / 2) * 32}
            y2={160 + Math.sin(f / 22 - Math.PI / 2) * 32}
            stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <circle cx={1620} cy={160} r={8} fill={C.ink} />
        </g>
      </BigPhone>
      <TagPlate x={620} y={140} text="24じかん こうしん" size={44} t={seg(f, 8, 20)} />
      {/* 手前の指 */}
      <g>
        <path d="M1530,1080 L1530,840 Q1530,742 1622,742 Q1714,742 1714,840 L1714,1080 Z"
          fill="#E3BC96" stroke={KRP.ink} strokeWidth={7} />
        <path d="M1566,796 Q1622,766 1678,796" fill="none"
          stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        <path d="M1552,900 Q1622,884 1692,900" fill="none"
          stroke={KRP.ink} strokeWidth={5} opacity={0.45} />
      </g>
    </Frame>
  );
};

// ------------------------------------------------------------------
// #198 井の中の蛙、大海を知らず、と言いますが。
// 格: 並
// ------------------------------------------------------------------
const S198: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1097} bg="#CFE0E8">
    {/* 空 */}
    <defs>
      <linearGradient id="sky198" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#BBD6E6" />
        <stop offset="100%" stopColor="#E4EEDC" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={620} fill="url(#sky198)" />
    {/* 山の稜線 */}
    <path d="M-20,600 L220,392 L420,520 L640,330 L900,560 L1120,420 L1400,300 L1700,500 L1940,420 L1940,620 L-20,620 Z"
      fill={C.hillDark} opacity={0.38} />
    <path d="M-20,620 L260,500 L520,580 L820,470 L1180,588 L1520,500 L1940,600 L1940,640 L-20,640 Z"
      fill={C.hill} opacity={0.6} />
    {/* 地面 + 土の断面 */}
    <rect x={0} y={600} width={W} height={H - 600} fill={C.soil} />
    <rect x={0} y={600} width={W} height={34} fill={C.hill}
      stroke={KRP.ink} strokeWidth={5} />
    <g fill="#8A7450" opacity={0.5}>
      {Array.from({ length: 46 }, (_, i) => (
        <ellipse key={`pb${i}`} cx={rnd(i * 13 + 1) * W} cy={660 + rnd(i * 29 + 3) * 400}
          rx={7 + rnd(i * 7) * 12} ry={5 + rnd(i * 11) * 7} />
      ))}
    </g>
    <g stroke="#8A7450" strokeWidth={4} opacity={0.4}>
      <path d="M0,760 Q500,742 960,772 T1920,756" fill="none" />
      <path d="M0,920 Q560,900 1100,932 T1920,916" fill="none" />
    </g>
    {/* 竹 (右) */}
    <g>
      {[1646, 1726, 1812].map((bx, i) => (
        <g key={`bb${i}`}>
          <rect x={bx} y={120 + i * 40} width={22} height={492 - i * 40}
            fill="#9FB86A" stroke={KRP.ink} strokeWidth={4.5} />
          <g stroke={C.hillDark} strokeWidth={4} opacity={0.8}>
            {Array.from({ length: 5 }, (_, k) => (
              <line key={`bn${k}`} x1={bx} y1={200 + i * 30 + k * 90}
                x2={bx + 22} y2={200 + i * 30 + k * 90} />
            ))}
          </g>
          {[0, 1].map((k) => (
            <path key={`bl${k}`}
              d={`M${bx + (k ? 22 : 0)},${180 + i * 36 + k * 120} Q${bx + (k ? 86 : -64)},${160 + i * 36 + k * 120 + Math.sin((f + i * 9) / 17) * 6} ${bx + (k ? 120 : -98)},${200 + i * 36 + k * 120}`}
              fill="none" stroke={C.hillDark} strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      ))}
    </g>
    {/* 飛び石 */}
    <g>
      {[150, 300, 452, 600].map((sx, i) => (
        <ellipse key={`fs${i}`} cx={sx} cy={636 + i * 16} rx={56 - i * 4} ry={18 - i}
          fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
      ))}
    </g>
    {/* 草 */}
    <g stroke={C.hillDark} strokeWidth={4} strokeLinecap="round" opacity={0.85}>
      {Array.from({ length: 24 }, (_, i) => {
        const gx = 40 + i * 78;
        if (gx > 640 && gx < 1300) return null;
        const sw = Math.sin((f + i * 13) / 16) * 6;
        return <path key={`gs${i}`} d={`M${gx},604 Q${gx + sw},578 ${gx + sw * 1.7},552`} fill="none" />;
      })}
    </g>
    {/* 井戸 (phase 1: 小さな水たまり) */}
    <Ido f={f} phase={1} cx={960} mouthY={470} botY={850} rx={230} cid="s198" />
    {/* 口のあかり (空は小さい) */}
    <ellipse cx={960} cy={478} rx={190} ry={40} fill="#CFE0E8"
      opacity={0.3 + 0.1 * Math.abs(Math.sin(f / 18))} />
    {/* 蛙 */}
    <Kaeru x={960} y={848} s={0.82} f={f} />
    <ellipse cx={960} cy={700} rx={210} ry={160} fill={KRP.white}
      opacity={0.07 + 0.04 * Math.abs(Math.sin(f / 16))} />
  </Frame>
);

// ------------------------------------------------------------------
// #199 いまや蛙は、池が地球サイズになった井戸の中にいます。
// 格: 山
// ------------------------------------------------------------------
const S199: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.1 * easeOut(seg(f, 4, 34));
  return (
    <Frame f={f} seed={1098} bg={C.nightDeep}>
      <g transform={zoomAt(z, 960, 620)}>
        {/* 夜空 */}
        <defs>
          <linearGradient id="sky199" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141A2A" />
            <stop offset="100%" stopColor="#2E3850" />
          </linearGradient>
        </defs>
        <rect x={-200} y={-200} width={W + 400} height={600} fill="url(#sky199)" />
        <g fill={C.glow}>
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={`st${i}`} cx={-100 + rnd(i * 19 + 2) * (W + 200)}
              cy={-120 + rnd(i * 31 + 7) * 480} r={1.8 + rnd(i * 5) * 2.6}
              opacity={0.4 + 0.5 * Math.abs(Math.sin((f + i * 13) / 15))} />
          ))}
        </g>
        <circle cx={300} cy={120} r={56} fill="#F0E8C8" opacity={0.85}
          stroke={KRP.ink} strokeWidth={4} />
        <circle cx={322} cy={106} r={48} fill="#1B2233" opacity={0.9} />
        {/* 遠い稜線 */}
        <path d="M-200,400 L140,280 L420,350 L760,250 L1100,344 L1500,266 L2120,390 L2120,420 L-200,420 Z"
          fill="#1E2535" />
        {/* 夜の地面 + 土の断面 */}
        <rect x={-200} y={380} width={W + 400} height={H + 200} fill="#4A4234" />
        <rect x={-200} y={380} width={W + 400} height={28} fill="#3B4A33"
          stroke={KRP.ink} strokeWidth={5} />
        <g fill="#3A3426" opacity={0.6}>
          {Array.from({ length: 40 }, (_, i) => (
            <ellipse key={`pb${i}`} cx={-80 + rnd(i * 17 + 3) * (W + 160)}
              cy={440 + rnd(i * 23 + 9) * 560} rx={8 + rnd(i * 9) * 13}
              ry={5 + rnd(i * 13) * 8} />
          ))}
        </g>
        {/* 草 */}
        <g stroke="#2F4228" strokeWidth={4} strokeLinecap="round" opacity={0.9}>
          {Array.from({ length: 22 }, (_, i) => {
            const gx = -60 + i * 92;
            if (gx > 560 && gx < 1380) return null;
            const sw = Math.sin((f + i * 11) / 16) * 6;
            return <path key={`gs${i}`} d={`M${gx},384 Q${gx + sw},358 ${gx + sw * 1.7},332`} fill="none" />;
          })}
        </g>
        {/* 井戸 (phase 2: 底が地球) */}
        <Ido f={f} phase={2} cx={960} mouthY={300} botY={760} rx={270} cid="s199" />
        {/* 地球の光が内壁を照らす */}
        <g opacity={0.2 + 0.08 * Math.abs(Math.sin(f / 14))}>
          <polygon points="960,742 1420,330 500,330" fill="#7FC6E8" />
        </g>
        {/* 縁から覗き込む蛙 */}
        <Kaeru x={1256} y={272} s={0.78} f={f} look={16} />
      </g>
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib10_s188:                 (f) => <S188 f={f} />,
  ib10_s189:                 (f) => <S189 f={f} />,
  ib10_s190:                 (f) => <S190 f={f} />,
  ib10_s191:                 (f) => <S191 f={f} />,
  ib10_s192:                 (f) => <S192 f={f} />,
  ib10_s193:                 (f) => <S193 f={f} />,
  ib10_s194:                 (f) => <S194 f={f} />,
  ib10_s195:                 (f) => <S195 f={f} />,
  ib10_s196:                 (f) => <S196 f={f} />,
  ib10_s197:                 (f) => <S197 f={f} />,
  ib10_s198:                 (f) => <S198 f={f} />,
  ib10_s199:                 (f) => <S199 f={f} />,
};

export const I_B10_MOTIFS: string[] = [
  "ib10_s188",                 // #188 第10章、池が、地球サイズになった。
  "ib10_s189",                 // #189 現代は、1位と2位の差が、報酬の差として極端に開く時代です。
  "ib10_s190",                 // #190 スポーツも配信もビジネスも、頂点のひと握りに、注目とお金が集中します。
  "ib10_s191",                 // #191 いわゆる「勝者総取り」の構造です。
  "ib10_s192",                 // #192 さらに、順位にはやっかいな性質があります。
  "ib10_s193",                 // #193 「学年1位」という椅子は、全員が頑張っても、1人分しか増えません。
  "ib10_s194",                 // #194 全員が2倍努力しても、1位は1人。順位の奪い合いは、椅子取りゲームなのです。
  "ib10_s195",                 // #195 そして、スマホの登場。
  "ib10_s196",                 // #196 SNSによって、比べる相手は同級生から、地球上の全員になりました。
  "ib10_s197",                 // #197 フォロワー数も再生数も、24時間更新され続けるランキングです。
  "ib10_s198",                 // #198 井の中の蛙、大海を知らず、と言いますが。
  "ib10_s199",                 // #199 いまや蛙は、池が地球サイズになった井戸の中にいます。
];

export const ichiB10Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B10_PREVIEW_FRAMES = Math.max(I_B10_MOTIFS.length, 1);
export const IchiB10Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B10_MOTIFS.length - 1);
  return <>{ichiB10Scene(I_B10_MOTIFS[i] ?? "", 45)}</>;
};
